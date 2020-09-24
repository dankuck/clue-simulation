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
const { shuffle, sample } = require('lodash');

const { Counter, ArrayMap } = TheCardCounter;

describe('TheCardCounter', function () {

    testStrategy(TheCardCounter);

    describe('strategy', function () {

        it('instantiates', function () {
            const deck = Deck.buildStandardDeck();
            const {hands} = deck.divy(4);
            const game_summary = new GameSummary(0, hands);
            new TheCardCounter(
                new Hand([]),
                deck,
                game_summary
            );
        });

        it('sees enough cards to figure out the suspect', function () {
            const deck = Deck.buildStandardDeck();
            const {hands} = deck.divy(4);
            const game_summary = new GameSummary(0, hands);
            const counter = new TheCardCounter(
                new Hand([]),
                deck,
                game_summary
            );
            const suspects = deck.getSuspects();
            const accused = suspects.pop();
            suspects.forEach(card => {
                counter.seeCard({card, player: 1});
            });
            const suggestion = counter.makeSuggestion();
            equal(accused, suggestion.suspect);
        });

        it('sees cards not being refuted', function () {
            const deck = Deck.buildStandardDeck();
            const {hands} = deck.divy(4);
            const game_summary = new GameSummary(0, hands);
            const counter = new TheCardCounter(
                new Hand([]),
                deck,
                game_summary
            );
            const seeSuggestion = suggest(
                deck.getSuspects()[0],
                deck.getWeapons()[0],
                deck.getRooms()[0]
            );
            counter.seeSuggestionNotRefuted({suggestion: seeSuggestion, player: 0});
            counter.seeSuggestionNotRefuted({suggestion: seeSuggestion, player: 1});
            counter.seeSuggestionNotRefuted({suggestion: seeSuggestion, player: 2});
            counter.seeSuggestionNotRefuted({suggestion: seeSuggestion, player: 3});
            const suggestion = counter.makeSuggestion();
            const expectAccusation = accuse(
                seeSuggestion.suspect,
                seeSuggestion.weapon,
                seeSuggestion.room,
            );
            equal(expectAccusation, suggestion);
        });

        it('knows where its own cards are', function () {
            const deck = Deck.buildStandardDeck();
            const {hands} = deck.divy(4);
            const game_summary = new GameSummary(0, hands);
            const suspects = deck.getSuspects();
            const accused = suspects.pop();
            const counter = new TheCardCounter(
                new Hand(suspects),
                deck,
                game_summary
            );
            const suggestion = counter.makeSuggestion();
            equal(accused, suggestion.suspect);
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
            counter.markCardLocation(card, '0', true);
            const cards = counter.possibleCardsFor('0');
            const otherCards = counter.possibleCardsFor('1');
            assert(cards.includes(card));
            assert(! otherCards.includes(card));
            equal(20, otherCards.length);
        });

        it('marks a card location as known false', function () {
            const deck = Deck.buildStandardDeck();
            const counter = new Counter(deck, [5, 5, 4, 4]);
            const card = deck.get(0);
            counter.markCardLocation(card, '0', false);
            const cards = counter.possibleCardsFor('0');
            assert(! cards.includes(card));
        });

        it('retrieves all known cards for a location', function () {
            const deck = Deck.buildStandardDeck();
            const counter = new Counter(deck, [5, 5, 4, 4]);
            const card = deck.get(0);
            counter.markCardLocation(card, '0', true);
            const knownCards = counter.trueCardsFor('0');
            equal(1, knownCards.length);
            equal(card, knownCards[0]);
        });

        it('deduces a card location when it learns about non-locations for the same card', function () {
            const deck = Deck.buildStandardDeck();
            const counter = new Counter(deck, [5, 5, 4, 4]);
            const card = deck.get(0);
            counter.markCardLocation(card, '0', false);
            counter.markCardLocation(card, '1', false);
            counter.markCardLocation(card, '2', false);
            counter.markCardLocation(card, '3', false);
            const cards = counter.trueCardsFor('envelope');
            equal(1, cards.length);
            equal(card, cards[0]);
        });

        it('throws a TypeError if a wrong value or no value is sent to markCardLocation', function () {
            const deck = Deck.buildStandardDeck();
            const counter = new Counter(deck, [5, 5, 4, 4]);
            const card = deck.get(0);
            const assertTypeError = cb => {
                try {
                    cb();
                } catch (e) {
                    assert(e instanceof TypeError);
                    return;
                }
                assert(false, 'No error thrown');
            };
            assertTypeError(() => counter.markCardLocation(card, '0'));
            assertTypeError(() => counter.markCardLocation(card, '0', null));
            assertTypeError(() => counter.markCardLocation(card, '0', {}));
            assertTypeError(() => counter.markCardLocation(card, '0', []));
        });

        it('deduces a card location when it learns the location for a different card', function () {
            // Say we know that Mustard is in either player 1's hand or the
            // envelope.
            // Say we know that player 1 has five cards.
            // Say we know three of player 1's cards.
            // If we discover player 1's fifth card is NOT Mustard, then we
            // can deduce that Mustard is in the envelope.
            const deck = Deck.buildStandardDeck();
            const counter = new Counter(deck, [5, 5, 4, 4]);
            const green = deck.get(0);
            const fourOtherCards = [
                deck.get(1),
                deck.get(2),
                deck.get(3),
                deck.get(4),
            ];
            const oneMoreCard = deck.get(5);
            counter.markCardLocation(green, '0', false);
            counter.markCardLocation(green, '2', false);
            counter.markCardLocation(green, '3', false);
            // Now we know green is in either player 1's hand or the envelope
            fourOtherCards.forEach(
                card => counter.markCardLocation(card, '1', true)
            );
            // Now we know four cards that player 1 has

            // Let's check our understanding that we still can't know whether
            // the envelope or player 1 has Mustard
            let onesCards = counter.trueCardsFor('1');
            let envelopeCards = counter.trueCardsFor('envelope');
            assert(! onesCards.includes(green));
            assert(! envelopeCards.includes(green));

            // Now lets learn that player 1's fifth card is something else, not
            // Mustard
            counter.markCardLocation(oneMoreCard, '1', true);

            onesCards = counter.trueCardsFor('1');
            envelopeCards = counter.trueCardsFor('envelope');
            assert(! onesCards.includes(green));
            assert(envelopeCards.includes(green));
        });

        it('deduces a card is in the envelope when it knows the location of all other cards of a type', function () {
            // Say we know that five specific suspects are in the hands of
            // specific players.
            // We can deduce that the sixth suspect is in the envelope.
            // This only works for the envelope because it has exactly 1 of
            // each type.
            const deck = Deck.buildStandardDeck();
            const counter = new Counter(deck, [5, 5, 4, 4]);
            const suspects = deck.getSuspects();
            const murderer = suspects.pop();
            suspects.forEach(card => {
                counter.markCardLocation(card, '0', true);
            });
            // Now we know where five suspects are. Lets see if the counter
            // deduced that the sixth suspect is in the envelope.

            const envelopeCards = counter.trueCardsFor('envelope');
            assert(envelopeCards.includes(murderer));
        });

        it('never disagrees with a real set of hands', function () {
            // If the counter ever says no when a hand says yes, or yes when a
            // hand says no, we've got a problem.
            const deck = Deck.buildStandardDeck();
            const {envelope, hands} = deck.divy(4);
            const cardLocations = [];
            const facts = {
                envelope,
                ...hands,
            };
            Object.keys(facts).forEach(location => {
                const hand = facts[location];
                hand.forEach(card => cardLocations.push([card, location]));
            });

            const playerCounts = hands.map(hand => hand.length);
            const counter = new Counter(deck, playerCounts);

            // We'll randomly send known-correct card location facts to the
            // counter and any time it makes its own deduction, we'll check
            // if it's still correct.
            let lastKnown = counter.allTrue();
            const learn = ([card, location], yesToNoRatio) => {
                if (Math.random() < yesToNoRatio) {
                    counter.markCardLocation(card, location, true);
                } else {
                    // Get a random location that is NOT this one, so we can
                    // say we found out that's not the location
                    const notLocation = sample(
                        Object.keys(facts)
                            .filter(key => key !== location)
                    );
                    counter.markCardLocation(card, notLocation, false);
                }
                let known = counter.allTrue();
                // We expect known to grow by 1, but if it grows by more then
                // we deduced something!
                if (known.length > lastKnown.length + 1) {
                    // Lets check if the facts match our deduction
                    known.forEach(([card, location]) => {
                        assert(facts[location].includes(card), `${location}, ${card.name}`);
                    });
                }
                lastKnown = known;
            };

            // do some with yes's and no's
            shuffle(cardLocations).forEach(cardLocation => learn(cardLocation, .75));

            // do all of the rest with yes, so we can count the results
            shuffle(cardLocations).forEach(cardLocation => learn(cardLocation, 1));
            equal(21, lastKnown.length);
        });

        it('deduces when we expect it to', function () {
            // In this test, we used a deterministic method to divy out the
            // cards, and now we have the counter solve the whole thing.
            //
            // If the Counter continues to operate correctly, it should know
            // X things after we tell it Y true's and false's, regardless of
            // its inner workings.

            const deck = Deck.buildStandardDeck();

            // The following card locations were chosen by a call to shuffle
            // and now they are set in stone, so all versions of Counter have
            // to deal with the same data.
            //
            // Columns are:
            //  0: the nth card in the ordered deck
            //  1: the nth player hand
            //  2: whether the card is really there
            //  3: how many cards should be known after learning this row
            const facts = [
                [ 7  , 2 , true  , 1  ],
                [ 3  , 3 , true  , 2  ],
                [ 3  , 3 , true  , 2  ], // repeated
                [ 15 , 0 , true  , 3  ],
                [ 11 , 1 , false , 3  ],
                [ 19 , 0 , true  , 4  ],
                [ 5  , 1 , true  , 5  ],
                [ 1  , 3 , false , 5  ], // several rows that only tell false
                [ 14 , 2 , false , 5  ],
                [ 20 , 0 , false , 5  ],
                [ 20 , 0 , false , 5  ],
                [ 6  , 0 , true  , 6  ],
                [ 17 , 0 , true  , 7  ],
                [ 12 , 3 , true  , 8  ],
                [ 8  , 0 , false , 8  ],
                [ 13 , 3 , true  , 9  ],
                [ 18 , 0 , false , 9  ],
                [ 10 , 1 , true  , 10 ],
                [ 4  , 0 , false , 10 ], // no new trues
                [ 0  , 2 , true  , 11 ],
                [ 2  , 1 , true  , 12 ],
                [ 16 , 2 , true  , 13 ],
                [ 9  , 1 , true  , 14 ],
                [ 11 , 0 , true  , 15 ],
                [ 1  , 2 , true  , 17 ], // something was deduced
                [ 14 , 1 , true  , 18 ],
                [ 20 , 3 , true  , 21 ], // whole game solved
            ].map(
                ([i, location, correct, expectedKnown]) =>
                    [deck.get(i), location.toString(), correct, expectedKnown]
            );

            const playerCounts = [5, 5, 4, 4];
            const counter = new Counter(deck, playerCounts);

            const known = facts
                .map(
                    ([card, location, correct, expectedKnown]) => {
                        counter.markCardLocation(card, location, correct);
                        const known = counter.allTrue().length;
                        return [card, location, correct, known];
                    }
                );

            equal(facts, known);
        });

        it('has low complexity / high speed', function () {
            // This is the value we got last time we ran this test. If you make
            // this go up by more than a few, you have discovered a worse
            // algorithm.
            const bestSoFar = 329;

            // In this test, we used a deterministic method to divy out the
            // cards, and now we have the counter solve the whole thing.
            //
            // At the end we ask it how many rounds it required to solve. This
            // is called its complexityScore.
            //
            // When changes to Counter cause the complexityScore to change,
            // (hopefully to drop) a developer will be told.
            //
            // So if you're a developer hoping to speed up the Counter, this
            // can help you get there.

            const deck = Deck.buildStandardDeck();

            // The following card locations were chosen by a call to shuffle
            // and now they are set in stone, so all versions of Counter have
            // to deal with the same data.
            const facts = [
                [ 20 , 0 , false ],
                [ 11 , 1 , false ],
                [ 20 , 3 , true  ],
                [ 4  , 0 , false ],
                [ 3  , 3 , true  ],
                [ 9  , 1 , true  ],
                [ 14 , 2 , false ],
                [ 8  , 0 , false ],
                [ 11 , 1 , false ],
                [ 5  , 1 , true  ],
                [ 2  , 1 , true  ],
                [ 16 , 3 , false ],
                [ 1  , 3 , false ],
                [ 13 , 3 , true  ],
                [ 6  , 0 , true  ],
                [ 17 , 0 , true  ],
                [ 14 , 2 , false ],
                [ 19 , 1 , false ],
                [ 20 , 0 , false ],
                [ 15 , 0 , true  ],
                [ 7  , 2 , true  ],
                [ 12 , 3 , true  ],
                [ 0  , 2 , true  ],
                [ 18 , 0 , false ],
                [ 3  , 0 , false ],
                [ 10 , 1 , true  ],
                [ 1  , 2 , true  ],
            ].map(([i, location, correct]) => [deck.get(i), location.toString(), correct]);

            const playerCounts = [5, 5, 4, 4];
            const counter = new Counter(deck, playerCounts);

            facts.forEach(
                ([card, location, correct]) => counter.markCardLocation(card, location, correct)
            );

            counter.possibleCardsFor('envelope');

            assert(
                counter.complexityScore <= bestSoFar,
                `Oh no, the complexity score went up! New score ${counter.complexityScore} > ${bestSoFar}`
            );
            assert(
                counter.complexityScore === bestSoFar,
                `YES! You made the complexity score drop. New score ${counter.complexityScore} < ${bestSoFar}.`
                + ` Now you should change the bestSoFar value to equal ${counter.complexityScore} in this test`
            );
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
