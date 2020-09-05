const {
    Card,
    ClueGame,
    Deck,
    Hand,
    Player,
    Suggestion,
    suggest,
    accuse,
} = require('./Clue.js');
const assert = require('assert');
const {
    deepStrictEqual:    equal,
    notDeepStrictEqual: notEqual,
} = assert;

function randomType()
{
    const num = Math.random() * 3;
    if (num < 1) {
        return Card.SUSPECT;
    } else if (num < 2) {
        return Card.WEAPON;
    } else {
        return Card.ROOM;
    }
}

function randomName()
{
    return new String(Math.random()).substr(3, 8);
}

function buildNonStandardDeck(cardCount)
{
    const cards = [
        new Card(Card.SUSPECT, randomName()),
        new Card(Card.WEAPON,  randomName()),
        new Card(Card.ROOM,    randomName()),
    ];
    for (let i = 3; i < cardCount; i++) {
        cards.push(new Card(randomType(), randomName()));
    }
    return new Deck(cards);
}

const decks = {
    Standard: (playerCount) => Deck.buildStandardDeck(),
    SizeZeroHands: (playerCount) => buildNonStandardDeck(3),
    SizeOneHands: (playerCount) => buildNonStandardDeck(3 + playerCount * 1),
    GiantHands: (playerCount) => buildNonStandardDeck(1000),
};

function forEachDeck(callback)
{
    Object.keys(decks).forEach(deckName => {
        describe(`${deckName} deck`, function () {
            callback(decks[deckName]);
        });
    });
}

function testStrategy(Strategy)
{
    forEachDeck(function (buildDeck) {

        it('should instantiate with a Hand and Deck (required)', function () {
            const deck = buildDeck(1);
            const {hands} = deck.divy(1);
            new Strategy(hands[0], deck);
        });

        it('should make a move (required)', function () {
            const deck = buildDeck(1);
            const {hands} = deck.divy(1);
            const strategy = new Strategy(hands[0], deck);
            const suggestion = strategy.move();
            assert(suggestion.type);
            assert(suggestion.suspect);
            equal(Card.SUSPECT, suggestion.suspect.type);
            assert(suggestion.weapon);
            equal(Card.WEAPON, suggestion.weapon.type);
            assert(suggestion.room);
            equal(Card.ROOM, suggestion.room.type);
        });

        it('can have a seeCard method', function () {
            const deck = buildDeck(1);
            const {hands} = deck.divy(1);
            const strategy = new Strategy(hands[0], deck);
            if (! strategy.seeCard) {
                // seeCard is not present and not required. It's kind of
                // strange that this strategy does not want to know the
                // refutations to its suggestions. ¯\_(ツ)_/¯
                this.skip();
            }
            // It's conceivable that some strategy will blow up if we call
            // seeCard with a Suggestion that it didn't create. So we'll ask
            // the strategy to create the Suggestion.
            const suggestion = strategy.move();
            const card = suggestion.suspect;
            const player = Math.floor(Math.random() * 6);
            strategy.seeCard({suggestion, card, player});
            // no whammy
        });

        it('can have a seeSuggestionAnswered method', function () {
            const deck = buildDeck(1);
            const {hands} = deck.divy(1);
            const strategy = new Strategy(hands[0], deck);
            if (! strategy.seeSuggestionAnswered) {
                // Some strategies do not care if other players' suggestions
                // get answered.
                this.skip();
            }
            // Get some cards that are *not* in the player's own hand, to
            // simulate what it looks like when two other players have cards.
            const suspects = hands.slice(1)
                .reduce(
                    (merged, hand) => merged.concat(hand.getSuspects()),
                    []
                );
            const weapons = hands.slice(1)
                .reduce(
                    (merged, hand) => merged.concat(hand.getWeapons()),
                    []
                );
            const rooms = hands.slice(1)
                .reduce(
                    (merged, hand) => merged.concat(hand.getRooms()),
                    []
                );
            const suggestion = suggest(suspects[0], weapons[0], rooms[0]);
            const player = Math.floor(Math.random() * 6);
            const asker = (player + Math.floor(Math.random() * 5)) % 6;
            strategy.seeSuggestionAnswered({suggestion, player, asker});
            // no whammy
        });

        it('can have a seeSuggestionSkipped method', function () {
            const deck = buildDeck(1);
            const {hands} = deck.divy(1);
            const strategy = new Strategy(hands[0], deck);
            if (! strategy.seeSuggestionSkipped) {
                // Some strategies do not care if other players' suggestions
                // get answered.
                this.skip();
            }
            // Get some cards that are *not* in the player's own hand, to
            // simulate what it looks like when two other players have cards.
            const suspects = hands.slice(1)
                .reduce(
                    (merged, hand) => merged.concat(hand.getSuspects()),
                    []
                );
            const weapons = hands.slice(1)
                .reduce(
                    (merged, hand) => merged.concat(hand.getWeapons()),
                    []
                );
            const rooms = hands.slice(1)
                .reduce(
                    (merged, hand) => merged.concat(hand.getRooms()),
                    []
                );
            const suggestion = suggest(suspects[0], weapons[0], rooms[0]);
            const player = Math.floor(Math.random() * 6);
            const asker = (player + Math.floor(Math.random() * 5)) % 6;
            strategy.seeSuggestionSkipped({suggestion, player, asker});
            // no whammy

        });
    });
}

module.exports = testStrategy;
