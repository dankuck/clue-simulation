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
const TheCardCounter = require('../Strategies/TheCardCounter.js');
const testStrategy = require('./testStrategy.js');
const assert = require('assert');
const {
    deepStrictEqual:    equal,
    notDeepStrictEqual: notEqual,
} = assert;

const { Counter, ArrayMap } = TheCardCounter;

describe.only('TheCardCounter', function () {

    // testStrategy(TheCardCounter);

    describe('strategy', function () {

        it('instantiates', function () {
            const deck = Deck.buildStandardDeck();
            const {hands} = deck.divy(4);
            const game_summary = new GameSummary(0, hands);
            new TheCardCounter(
                hands[0],
                deck,
                game_summary
            );
        });

    });

    describe('Counter', function () {
        it('instantiates', function () {
            new Counter(Deck.buildStandardDeck(), [5, 5, 4, 4]);
        });

        it('eliminates a known card from other hands', function () {
            const deck = Deck.buildStandardDeck();
            const counter = new Counter(deck, [5, 5, 4, 4]);
            const card = deck.get(0);
            counter.markCardLocation(card, 0);
            const cards = counter.possibleCardsFor(0);
            const otherCards = counter.possibleCardsFor(1);
            assert(cards.includes(card));
            assert(! otherCards.includes(card));
        });

        it('marks a card location as known false', function () {
            const deck = Deck.buildStandardDeck();
            const counter = new Counter(deck, [5, 5, 4, 4]);
            const card = deck.get(0);
            counter.markCardLocationFalse(card, 0);
            const cards = counter.possibleCardsFor(0);
            assert(! cards.includes(card));
        });

        it('retrieves all known cards for a location', function () {
            const deck = Deck.buildStandardDeck();
            const counter = new Counter(deck, [5, 5, 4, 4]);
            const card = deck.get(0);
            counter.markCardLocation(card, 0);
            const knownCards = counter.knownCardsFor(0);
            equal(1, knownCards.length);
            equal(card, knownCards[0]);
        });

        it('deduces a card location when it learns about non-locations for the same card', function () {
            const deck = Deck.buildStandardDeck();
            const counter = new Counter(deck, [5, 5, 4, 4]);
            const card = deck.get(0);
            counter.map.log = console.log;
            counter.markCardLocationFalse(card, '0');
            counter.markCardLocationFalse(card, '1');
            counter.markCardLocationFalse(card, '2');
            counter.markCardLocationFalse(card, '3');
            const cards = counter.knownCardsFor('envelope');
            equal(1, cards.length);
            equal(card, cards[0]);
        });

        it.skip('deduces a card location when it learns the location for a different card', function () {
            // Say we know that Mr. Green is in either player 1's hand or the
            // envelope.
            // Say we know that player 1 has four cards.
            // Say we know three of player 1's cards.
            // If we discover player 1's fourth card is NOT Mr. Green, then we
            // can deduce that Mr. Green is in the envelope.

        });
    });

    describe('ArrayMap', function () {
        it('instantiates', function () {
            new ArrayMap();
        });

        it('sets and gets same-values arrays as a key', function () {
            const am = new ArrayMap();
            am.set([1, 2], 3);
            const got = am.get([1, 2]);
            const has = am.has([1, 2]);
            equal(3, got);
            assert(has);
        });

        it('sets something as a key and returns the same ArrayMap', function () {
            const am = new ArrayMap();
            const same = am.set([1, 2], 3);
            equal(am, same);
        });

        it('sets and does not get reversed-values arrays as a key', function () {
            const am = new ArrayMap();
            am.set([1, 2], 3);
            const got = am.get([2, 1]);
            const has = am.has([2, 1]);
            equal(undefined, got);
            assert(!has);
        });

        it('sets and does not get stringified numbers array as a key', function () {
            const am = new ArrayMap();
            am.set([1, 2], 3);
            const got = am.get(['1', '2']);
            const has = am.has(['1', '2']);
            equal(undefined, got);
            assert(!has);
        });

        it('sets and gets same-values+1 arrays as a key', function () {
            const am = new ArrayMap();
            // set one
            am.set([1, 2], 3);
            // set another that could interfere if there were bugs
            am.set([1, 2, 3], 4);
            // get original, no change
            const got = am.get([1, 2]);
            equal(3, got);
        });

        it('sets one value and gets undefined for some other value', function () {
            const am = new ArrayMap();
            am.set([1, 2], 3);
            const got = am.get([4]);
            const has = am.has([4]);
            equal(undefined, got);
            assert(!has);
        });

        it('sets and does not get same-values-repeated arrays as a key', function () {
            const am = new ArrayMap();
            am.set([1, 2, 1, 2, 1, 1, 2, 2], 3);
            const got = am.get([1, 2]);
            equal(undefined, got);
        });

        it('sets and deletes same-values arrays as a key', function () {
            const am = new ArrayMap();
            am.set([1, 2], 3);
            const deleted = am.delete([1, 2]);
            const got = am.get([1, 2]);
            equal(undefined, got);
            assert(deleted);
        });

        it('sets and deletes same-values arrays as a key without messing up similar values', function () {
            const am = new ArrayMap();
            am.set([1, 2], 3);
            am.set([1, 2, 4], 5);
            const deleted = am.delete([1, 2]);
            const got = am.get([1, 2, 4]);
            equal(5, got);
        });

        it('does not freak out if we try to delete a key that does not exist', function () {
            const am = new ArrayMap();
            am.delete([1, 2]);
        });

        it('iterates over the entries of a ArrayMap', function () {
            const am = new ArrayMap();
            am.set([1, 2], 3);
            am.set([4, 5], 6);
            const [entry1, entry2, entry3] = [...am.entries()];
            equal([1, 2], entry1[0]);
            equal(3, entry1[1]);
            equal([4, 5], entry2[0]);
            equal(6, entry2[1]);
            equal(undefined, entry3);
        });

        it('has a size', function () {
            const am = new ArrayMap();

            // nothing yet
            equal(0, am.size)

            // one new thing, size++
            am.set([1, 2, 3], 4);
            equal(1, am.size)

            // same thing, same size
            am.set([1, 2, 3], 5);
            equal(1, am.size)

            // one new thing, size++
            am.set([6], 7);
            equal(2, am.size);

            // one old thing, size=size
            am.set([1, 2, 3], 8);
            equal(2, am.size)

            // delete thing, size--
            am.delete([1, 2, 3]);
            equal(1, am.size)
        });

        it('has a size (object version)', function () {
            const am = new ArrayMap();
            const a = {},
                b = {},
                c = {},
                d = {};

            // nothing yet
            equal(0, am.size)

            // one new thing, size++
            am.set([a, b, c], 4);
            equal(1, am.size)

            // same thing, same size
            am.set([a, b, c], 5);
            equal(1, am.size)

            // one new thing, size++
            am.set([d], 7);
            equal(2, am.size);

            // one old thing, size=size
            am.set([a, b, c], 8);
            equal(2, am.size)

            // delete thing, size--
            am.delete([a, b, c]);
            equal(1, am.size)
        });
    });
});
