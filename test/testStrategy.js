const {
    Card,
    ClueGame,
    Deck,
    Hand,
    Player,
    Suggestion,
    suggest,
    accuse,
    GameSummary,
} = require('../Clue.js');
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

        it('should instantiate with a Hand, Deck, and game info (required)', function () {
            const deck = buildDeck(1);
            const {hands} = deck.divy(1);
            const game_summary = new GameSummary(0, hands);
            new Strategy(hands[0], deck, game_summary);
        });

        it('should make a suggestion (required)', function () {
            const deck = buildDeck(1);
            const {hands} = deck.divy(1);
            const game_summary = new GameSummary(0, hands);
            const strategy = new Strategy(hands[0], deck, game_summary);
            const suggestion = strategy.makeSuggestion();
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
            const game_summary = new GameSummary(0, hands);
            const strategy = new Strategy(hands[0], deck, game_summary);
            if (! strategy.seeCard) {
                // seeCard is not present and not required. It's kind of
                // strange that this strategy does not want to know the
                // refutations to its suggestions. ¯\_(ツ)_/¯
                this.skip();
            }
            // It's conceivable that some strategy will blow up if we call
            // seeCard with a Suggestion that it didn't create. So we'll ask
            // the strategy to create the Suggestion.
            const suggestion = strategy.makeSuggestion();
            const card = suggestion.suspect;
            const player = Math.floor(Math.random() * 6);
            strategy.seeCard({suggestion, card, player});
            // no whammy
        });

        it('can have a chooseCardToShow method', function () {
            const deck = buildDeck(1);
            const {hands} = deck.divy(1);
            const game_summary = new GameSummary(0, hands);
            const strategy = new Strategy(hands[0], deck, game_summary);
            if (! strategy.chooseCardToShow) {
                // If chooseCardToShow is not defined or returns anything other
                // than a card it was given, then a random card is chosen to
                // show to the other player.
                this.skip();
            }
            const card = hands[0].get(0);
            const player = Math.floor(Math.random() * 6);
            strategy.chooseCardToShow(card, player);
            // no whammy
        });

        it('can have a seeSuggestionRefuted method', function () {
            const deck = buildDeck(1);
            const {hands} = deck.divy(1);
            const game_summary = new GameSummary(0, hands);
            const strategy = new Strategy(hands[0], deck, game_summary);
            if (! strategy.seeSuggestionRefuted) {
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
            strategy.seeSuggestionRefuted({suggestion, player, asker});
            // no whammy
        });

        it('can have a seeSuggestionNotRefuted method', function () {
            const deck = buildDeck(1);
            const {hands} = deck.divy(1);
            const game_summary = new GameSummary(0, hands);
            const strategy = new Strategy(hands[0], deck, game_summary);
            if (! strategy.seeSuggestionNotRefuted) {
                // Some strategies do not care if suggestions
                // get refuted.
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
            strategy.seeSuggestionNotRefuted({suggestion, player, asker});
            // no whammy
        });

        it('can have a seeSuggestionNeverRefuted method', function () {
            const deck = buildDeck(1);
            const {hands} = deck.divy(1);
            const game_summary = new GameSummary(0, hands);
            const strategy = new Strategy(hands[0], deck, game_summary);
            if (! strategy.seeSuggestionNeverRefuted) {
                // Some strategies do not care if suggestions never
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
            strategy.seeSuggestionNeverRefuted({suggestion, asker});
            // no whammy
        });
    });
}

module.exports = testStrategy;
