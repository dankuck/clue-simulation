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

const { Counter, SetMap } = TheCardCounter;

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
            new Counter(Deck.buildStandardDeck(), 4);
        });

        it('eliminates a known card from other hands', function () {
            const deck = Deck.buildStandardDeck();
            const counter = new Counter(deck, 4);
            const card = deck.get(0);
            counter.markCardLocation(card, 0);
            const cards = counter.possibleCardsFor(0);
            const otherCards = counter.possibleCardsFor(1);
            assert(cards.includes(card));
            assert(! otherCards.includes(card));
        });
    });

    describe('SetMap', function () {
        it('instantiates', function () {
            new SetMap();
        });

        it('sets and gets same-values arrays as a key', function () {
            const am = new SetMap();
            am.set([1, 2], 3);
            const got = am.get([1, 2]);
            const has = am.has([1, 2]);
            equal(3, got);
            assert(has);
        });

        it('sets something as a key and returns the same SetMap', function () {
            const am = new SetMap();
            const same = am.set([1, 2], 3);
            equal(am, same);
        });

        it('sets and gets reversed-values arrays as a key', function () {
            const am = new SetMap();
            am.set([1, 2], 3);
            const got = am.get([2, 1]);
            const has = am.has([2, 1]);
            equal(3, got);
            assert(has);
        });

        it('works just as well with Sets and Arrays', function () {
            const am = new SetMap();
            am.set([1, 2], 3);
            const fromArray = am.get([1, 2], 3);
            const fromSet = am.get(new Set([1, 2], 3));
            equal(3, fromArray);
            equal(3, fromSet);
        });

        it('sets and gets same-values+1 arrays as a key', function () {
            const am = new SetMap();
            // set one
            am.set([1, 2], 3);
            // set another that could interfere if there were bugs
            am.set([1, 2, 3], 4);
            // get original, no change
            const got = am.get([1, 2]);
            equal(3, got);
        });

        it('sets one value and gets undefined for some other value', function () {
            const am = new SetMap();
            am.set([1, 2], 3);
            const got = am.get([4]);
            const has = am.has([4]);
            equal(undefined, got);
            assert(!has);
        });

        it('sets and gets same-values-repeated arrays as a key', function () {
            const am = new SetMap();
            am.set([1, 2, 1, 2, 1, 1, 2, 2], 3);
            const got = am.get([1, 2]);
            equal(3, got);
        });

        it('sets and deletes same-values arrays as a key', function () {
            const am = new SetMap();
            am.set([1, 2], 3);
            const deleted = am.delete([1, 2]);
            const got = am.get([1, 2]);
            equal(undefined, got);
            assert(deleted);
        });

        it('sets and deletes same-values arrays as a key without messing up similar values', function () {
            const am = new SetMap();
            am.set([1, 2], 3);
            am.set([1, 2, 4], 5);
            const deleted = am.delete([1, 2]);
            const got = am.get([1, 2, 4]);
            equal(5, got);
        });

        it('does not freak out if we try to delete a key that does not exist', function () {
            const am = new SetMap();
            am.delete([1, 2]);
        });

        it('iterates over the entries of a SetMap', function () {
            const am = new SetMap();
            am.set([1, 2], 3);
            am.set([4, 5], 6);
            const [entry1, entry2, entry3] = [...am.entries()];
            equal(new Set([1, 2]), entry1[0]);
            equal(3, entry1[1]);
            equal(new Set([4, 5]), entry2[0]);
            equal(6, entry2[1]);
            equal(undefined, entry3);

        });

        it('sets and finds entries by partial keys', function () {
            const am = new SetMap();
            am.set([1, 2, 3], 4);
            const it = am.find([1, 3]);
            const set = [...it];
            equal(1, set.length);
            const [key, value] = set[0];
            equal(new Set([1, 2, 3]), key);
            equal(4, value);
        });

        it('has a size', function () {
            const am = new SetMap();

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
    });
});
