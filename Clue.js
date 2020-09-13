const { shuffle, sample } = require('lodash');

class Card
{
    constructor(type, name)
    {
        this.type = type;
        this.name = name;
    }
}
Card.SUSPECT = 'SUSPECT';
Card.WEAPON  = 'WEAPON';
Card.ROOM    = 'ROOM';

class CardSet
{
    constructor(cards)
    {
        this.cards = [...cards];
        this.length = cards.length;
    }

    has(card)
    {
        return this.cards.includes(card);
    }

    get(index)
    {
        return this.cards[index] || null;
    }

    filterType(type)
    {
        return this.filter(card => card.type === type);
    }

    getSuspects()
    {
        return this.filterType(Card.SUSPECT);
    }

    getWeapons()
    {
        return this.filterType(Card.WEAPON);
    }

    getRooms()
    {
        return this.filterType(Card.ROOM);
    }
}
// Here are some array methods that we can just pass through to our internal
// array to make this class more useful
['forEach', 'filter', 'map', 'slice'].forEach(funcName => {
    CardSet.prototype[funcName] = function (...params) { return this.cards[funcName](...params) };
});

class Hand extends CardSet
{
}

class Deck extends CardSet
{
    divy(handCount)
    {
        /**
         * Step 1.
         * We need to pick 1 random suspect, 1 random weapon, and 1 random room
         * for the envelope.
         */
        const suspects = shuffle(this.cards.filter(card => card.type === Card.SUSPECT));
        const weapons  = shuffle(this.cards.filter(card => card.type === Card.WEAPON));
        const rooms    = shuffle(this.cards.filter(card => card.type === Card.ROOM));

        const suspect = suspects.shift();
        const weapon  = weapons.shift();
        const room    = rooms.shift();

        const envelope = new Hand([suspect, weapon, room]);

        /**
         * Step 2.
         * We take the remaining cards and shuffle them together.
         */
        const cards = shuffle([...suspects, ...weapons, ...rooms]);

        /**
         * Step 3.
         * Split the remaining cards into the given number of hands.
         */
        const hands = [];
        for (let i = 0; i < handCount; i++) {
            // Divide the remaining cards by the remaining hands, and round
            // up to figure out how many cards this hand should get
            const takeCount = Math.ceil(cards.length / (handCount - i));
            hands.push(
                new Hand(
                    cards.splice(0, takeCount)
                )
            );
        }

        return {envelope, hands};
    }
}

Deck.buildStandardDeck = function () {
    return new Deck([
        new Card(Card.SUSPECT, 'Col. Mustard'),
        new Card(Card.SUSPECT, 'Prof. Plum'),
        new Card(Card.SUSPECT, 'Mr. Green'),
        new Card(Card.SUSPECT, 'Mrs. Peacock'),
        new Card(Card.SUSPECT, 'Miss Scarlett'),
        new Card(Card.SUSPECT, 'Mrs. White'),

        new Card(Card.WEAPON, 'Knife'),
        new Card(Card.WEAPON, 'Candlestick'),
        new Card(Card.WEAPON, 'Rope'),
        new Card(Card.WEAPON, 'Revolver'),
        new Card(Card.WEAPON, 'Lead Pipe'),
        new Card(Card.WEAPON, 'Wrench'),

        new Card(Card.ROOM, 'Hall'),
        new Card(Card.ROOM, 'Lounge'),
        new Card(Card.ROOM, 'Dining Room'),
        new Card(Card.ROOM, 'Kitchen'),
        new Card(Card.ROOM, 'Ball Room'),
        new Card(Card.ROOM, 'Conservatory'),
        new Card(Card.ROOM, 'Billiard Room'),
        new Card(Card.ROOM, 'Library'),
        new Card(Card.ROOM, 'Study'),
    ]);
};

class GameSummary
{
    constructor(position, hands)
    {
        this.position = position;
        this.hands = hands.map(hand => {
            return {
                length: hand.length,
            };
        });
    }
};

class Suggestion
{
    constructor(type, suspect, weapon, room)
    {
        this.type = type;
        this.suspect = suspect;
        this.weapon = weapon;
        this.room = room;
    }
};
Suggestion.SUGGESTION = 'SUGGESTION';
Suggestion.ACCUSATION = 'ACCUSATION';

class SuggestionResult
{
    constructor(data)
    {
        Object.assign(this, data);
    }
};

function suggest(...params)
{
    return new Suggestion(Suggestion.SUGGESTION, ...params);
}

function accuse(...params)
{
    return new Suggestion(Suggestion.ACCUSATION, ...params);
}

function win(asker, suggestion)
{
    return new SuggestionResult({
        result: 'WIN',
        asker,
        suggestion,
    });
}

function eliminate(asker, suggestion)
{
    return new SuggestionResult({
        result: 'ELIMINATED',
        asker,
        suggestion,
    });
}

function sugception(error, asker, suggestion)
{
    return new SuggestionResult({
        result: 'ERROR',
        error,
        asker,
        suggestion,
    });
}

function refute(asker, suggestion, refuter, card, skips)
{
    return new SuggestionResult({
        result: 'REFUTED',
        asker,
        suggestion,
        refuter,
        card,
        skips,
    });
}

class SuggestionError extends Error
{
    constructor(suggestion, ...params)
    {
        super(...params);
        this.suggestion = suggestion;
    }
}

const DEFAULT_CONFIG = {validate: true};

class ClueGame
{
    constructor(deck, strategies, config = DEFAULT_CONFIG)
    {
        this.deck = deck;
        this.config = config;

        const {envelope, hands} = this.deck.divy(strategies.length);

        this.envelope = envelope;
        this.hands = [...hands];
        this.players = strategies.map(
            (strategy, position) => new strategy(
                hands.shift(),
                this.deck,
                new GameSummary(position, this.hands)
            )
        );

        this.turn = 0;
        this.steps = 0;
        this.winner = null;
        this.losers = [];
        this.errors = [];
        this.suggestions = [];
    }

    play(ttl = Infinity)
    {
        while (! this.isGameOver() && this.steps < ttl) {
            this.step();
        }
        return this.winner;
    }

    turnPlayer()
    {
        return this.players[this.turn];
    }

    playerId(player)
    {
        return this.players.indexOf(player);
    }

    otherPlayersAndHands()
    {
        if (this.hands.length === 0) {
            return [];
        }
        let handIndex = (this.turn + 1) % this.hands.length;
        const hands = [];
        while (handIndex != this.turn) {
            hands.push({
                hand: this.hands[handIndex],
                player: this.players[handIndex],
            });
            handIndex = (handIndex + 1) % this.hands.length;
        }
        return hands;
    }

    step()
    {
        if (this.isGameOver()) {
            return;
        }
        this.steps++;
        const player = this.turnPlayer();
        let suggestion;
        try {
            suggestion = player.move();
            this.validateSuggestion(suggestion);
        } catch (e) {
            this.losePlayer(player);
            this.suggestions.push(
                this.addPlayerError(player, e, suggestion)
            );
            this.advanceTurn();
            return;
        }
        if (suggestion.type === Suggestion.SUGGESTION) {
            this.suggestions.push(
                this.handleSuggestion(suggestion, player)
            );
        } else if (suggestion.type === Suggestion.ACCUSATION) {
            this.suggestions.push(
                this.handleAccusation(suggestion, player)
            );
        }
        this.advanceTurn();
    }

    validateSuggestion(suggestion)
    {
        if (! this.config.validate) {
            return;
        }
        if (! (suggestion instanceof Suggestion)) {
            throw new SuggestionError(suggestion, 'Not a Suggestion object');
        }
        if (! (suggestion.suspect instanceof Card)) {
            throw new SuggestionError(suggestion, 'Missing or wrong data in suspect field');
        }
        if (! (suggestion.weapon instanceof Card)) {
            throw new SuggestionError(suggestion, 'Missing or wrong data in weapon field');
        }
        if (! (suggestion.room instanceof Card)) {
            throw new SuggestionError(suggestion, 'Missing or wrong data in room field');
        }
        if (suggestion.suspect.type !== Card.SUSPECT) {
            throw new SuggestionError(suggestion, `Suspect card is wrong type: ${suggestion.suspect.type}`);
        }
        if (suggestion.weapon.type !== Card.WEAPON) {
            throw new SuggestionError(suggestion, `Weapon card is wrong type: ${suggestion.weapon.type}`);
        }
        if (suggestion.room.type !== Card.ROOM) {
            throw new SuggestionError(suggestion, `Room card is wrong type: ${suggestion.room.type}`);
        }
    }

    addPlayerError(player, error, suggestion)
    {
        const result = sugception(error, player, suggestion);
        this.errors.push(result);
        return result;
    }

    advanceTurn()
    {
        if (this.isGameOver()) {
            return;
        }
        do {
            this.turn = (this.turn + 1) % this.players.length;
        } while (this.losers.includes(this.players[this.turn]));
    }

    handleSuggestion(suggestion, asker)
    {
        const {
            suspect,
            weapon,
            room,
        } = suggestion;
        const pairs = this.otherPlayersAndHands();
        let skips = 0;
        for (let i = 0; i < pairs.length; i++) {
            const {hand, player} = pairs[i];
            const cards = [suspect, weapon, room].filter(card => hand.has(card));
            if (cards.length > 0) {
                const card = this.chooseCardToShow(player, cards, asker);
                this.showCard(card, player, asker, suggestion, skips);
                return refute(asker, suggestion, player, card, skips);
            } else {
                skips++;
                this.showNoCards(player, asker, suggestion);
            }
        }
    }

    handleAccusation(accusation, player)
    {
        const {
            suspect,
            weapon,
            room,
        } = accusation;
        if (this.envelope.has(suspect) && this.envelope.has(weapon) && this.envelope.has(room)) {
            this.winner = player;
            return win(player, accusation);
        } else {
            this.losePlayer(player);
            return eliminate(player, accusation);
        }
    }

    losePlayer(player)
    {
        this.losers.push(player);
    }

    isGameOver()
    {
        return this.winner || this.losers.length === this.players.length;
    }

    chooseCardToShow(player, cards, asker)
    {
        const askerId = this.playerId(asker);
        const show = player.chooseCardToShow && player.chooseCardToShow(cards, askerId);
        if (! cards.includes(show)) {
            return sample(cards);
        } else {
            return show;
        }
    }

    showCard(card, player, asker, suggestion)
    {
        const playerId = this.playerId(player);
        const askerId = this.playerId(asker);
        this.showPlayer(asker, 'Card', {suggestion, card, player: playerId});
        this.showAllPlayers('SuggestionAnswered', {suggestion, player: playerId, asker: askerId}, [player, asker]);
    }

    showNoCards(player, asker, suggestion)
    {
        const playerId = this.playerId(player);
        const askerId = this.playerId(asker);
        this.showAllPlayers('SuggestionSkipped', {suggestion, player: playerId, asker: askerId}, [player]);
    }

    showPlayer(player, eventName, data)
    {
        const func = 'see' + eventName;
        if (! player[func]) {
            return;
        }
        try {
            player[func](data);
        } catch (e) {
            console.error(e);
        }
    }

    showAllPlayers(eventName, data, except = [])
    {
        this.players.forEach(player => {
            if (! except.includes(player)) {
                this.showPlayer(player, eventName, data);
            }
        });
    }
};

module.exports = {
    Card,
    ClueGame,
    Deck,
    Hand,
    Suggestion,
    suggest,
    accuse,
    GameSummary,
};
