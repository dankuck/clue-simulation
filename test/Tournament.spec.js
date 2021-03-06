const Tournament = require('../Tournament.js');
const ExampleStrategy = require('../Strategies/ExampleStrategy.js');
const assert = require('assert');
const {
    deepStrictEqual:    equal,
    notDeepStrictEqual: notEqual,
} = assert;
const PermutationIterator = Tournament.PermutationIterator;
const RandomIterator = Tournament.RandomIterator;

describe('Tournament', function () {

    describe('Tournament', function () {
        it('should instantiate', function () {
            new Tournament({});
        });

        it('should run a game', function () {
            const tournament = new Tournament({
                strategies: [ExampleStrategy],
            });
            const result = tournament.step();
            assert(result.game);
        });

        it('should run 4 games with the standard iterator', function () {
            // with just one strategy S, it should play
            // [S, S, S]
            // [S, S, S, S]
            // [S, S, S, S, S]
            // [S, S, S, S, S, S]
            const tournament = new Tournament({
                strategies: [ExampleStrategy],
            });
            const results = [
                tournament.step(),
                tournament.step(),
                tournament.step(),
                tournament.step(),
            ];
            equal(3, results[0].strategies.length);
            equal(6, results[3].strategies.length);
        });

        it('should run 1 game with a custom iterator', function () {
            const tournament = new Tournament({
                iterator: () => new class {
                    next() {
                        if (this.done) {
                            return null;
                        } else {
                            this.done = true;
                            return [ExampleStrategy];
                        }
                    }
                },
            });
            const results = [
                tournament.step(),
                tournament.step(),
            ];
            equal(1, results[0].strategies.length);
            equal(null, results[1]);
        });

        it('should run 2 games with the standard iterator and different min/max', function () {
            // with just one strategy S, it should play
            // [S]
            // [S, S]
            const tournament = new Tournament({
                strategies: [ExampleStrategy],
                min: 1,
                max: 2,
            });
            const results = [
                tournament.step(),
                tournament.step(),
            ];
            equal(1, results[0].strategies.length);
            equal(2, results[1].strategies.length);
        });

        it('should run 120 games with the standard iterator and two strategies', function () {
            // with two strategies S and T, it should play
            // [S, S, S]
            // [S, S, T]
            // [S, T, S]
            // [S, T, T]
            // [T, S, S]
            // [T, S, T]
            // [T, T, S]
            // [T, T, T]
            // [S, S, S, S]
            // [S, S, S, T]
            // [S, S, T, S]
            // [S, S, T, T]
            // [S, T, S, S]
            // [S, T, S, T]
            // [S, T, T, S]
            // [S, T, T, T]
            // [T, S, S, S]
            // [T, S, S, T]
            // [T, S, T, S]
            // [T, S, T, T]
            // [T, T, S, S]
            // [T, T, S, T]
            // [T, T, T, S]
            // [T, T, T, T]
            // [S, S, S, S, S]
            // [S, S, S, S, T]
            // [S, S, S, T, S]
            // [S, S, S, T, T]
            // [S, S, T, S, S]
            // [S, S, T, S, T]
            // [S, S, T, T, S]
            // [S, S, T, T, T]
            // [S, T, S, S, S]
            // [S, T, S, S, T]
            // [S, T, S, T, S]
            // [S, T, S, T, T]
            // [S, T, T, S, S]
            // [S, T, T, S, T]
            // [S, T, T, T, S]
            // [S, T, T, T, T]
            // [T, S, S, S, S]
            // [T, S, S, S, T]
            // [T, S, S, T, S]
            // [T, S, S, T, T]
            // [T, S, T, S, S]
            // [T, S, T, S, T]
            // [T, S, T, T, S]
            // [T, S, T, T, T]
            // [T, T, S, S, S]
            // [T, T, S, S, T]
            // [T, T, S, T, S]
            // [T, T, S, T, T]
            // [T, T, T, S, S]
            // [T, T, T, S, T]
            // [T, T, T, T, S]
            // [T, T, T, T, T]
            // [S, S, S, S, S, S]
            // [S, S, S, S, S, T]
            // [S, S, S, S, T, S]
            // [S, S, S, S, T, T]
            // [S, S, S, T, S, S]
            // [S, S, S, T, S, T]
            // [S, S, S, T, T, S]
            // [S, S, S, T, T, T]
            // [S, S, T, S, S, S]
            // [S, S, T, S, S, T]
            // [S, S, T, S, T, S]
            // [S, S, T, S, T, T]
            // [S, S, T, T, S, S]
            // [S, S, T, T, S, T]
            // [S, S, T, T, T, S]
            // [S, S, T, T, T, T]
            // [S, T, S, S, S, S]
            // [S, T, S, S, S, T]
            // [S, T, S, S, T, S]
            // [S, T, S, S, T, T]
            // [S, T, S, T, S, S]
            // [S, T, S, T, S, T]
            // [S, T, S, T, T, S]
            // [S, T, S, T, T, T]
            // [S, T, T, S, S, S]
            // [S, T, T, S, S, T]
            // [S, T, T, S, T, S]
            // [S, T, T, S, T, T]
            // [S, T, T, T, S, S]
            // [S, T, T, T, S, T]
            // [S, T, T, T, T, S]
            // [S, T, T, T, T, T]
            // [T, S, S, S, S, S]
            // [T, S, S, S, S, T]
            // [T, S, S, S, T, S]
            // [T, S, S, S, T, T]
            // [T, S, S, T, S, S]
            // [T, S, S, T, S, T]
            // [T, S, S, T, T, S]
            // [T, S, S, T, T, T]
            // [T, S, T, S, S, S]
            // [T, S, T, S, S, T]
            // [T, S, T, S, T, S]
            // [T, S, T, S, T, T]
            // [T, S, T, T, S, S]
            // [T, S, T, T, S, T]
            // [T, S, T, T, T, S]
            // [T, S, T, T, T, T]
            // [T, T, S, S, S, S]
            // [T, T, S, S, S, T]
            // [T, T, S, S, T, S]
            // [T, T, S, S, T, T]
            // [T, T, S, T, S, S]
            // [T, T, S, T, S, T]
            // [T, T, S, T, T, S]
            // [T, T, S, T, T, T]
            // [T, T, T, S, S, S]
            // [T, T, T, S, S, T]
            // [T, T, T, S, T, S]
            // [T, T, T, S, T, T]
            // [T, T, T, T, S, S]
            // [T, T, T, T, S, T]
            // [T, T, T, T, T, S]
            // [T, T, T, T, T, T]
            class ExampleStrategyCopy extends ExampleStrategy
            {
            }
            const tournament = new Tournament({
                strategies: [ExampleStrategy, ExampleStrategyCopy],
            });
            const results = [];
            for (let i = 0; i < 120; i++) {
                results.push(
                    tournament.step()
                );
            }
            equal(3, results[0].strategies.length);
            equal(6, results[119].strategies.length);
        });

        it('should play a round with the standard iterator', function () {
            const tournament = new Tournament({
                strategies: [ExampleStrategy],
            });
            const results = tournament.play();
            equal(3, results[0].strategies.length);
            equal(6, results[3].strategies.length);
            equal(4, results.length);
        });

        it('should play 2 rounds with the standard iterator', function () {
            const tournament = new Tournament({
                strategies: [ExampleStrategy],
            });
            const results = tournament.play(2);

            equal(3, results[0].strategies.length);
            equal(6, results[3].strategies.length);

            equal(3, results[4].strategies.length);
            equal(6, results[7].strategies.length);

            equal(8, results.length);
        });

        it('should play 2 rounds with a callback', function () {
            const tournament = new Tournament({
                strategies: [ExampleStrategy],
            });
            const results = [];
            tournament.play(2, result => results.push(result));

            equal(3, results[0].strategies.length);
            equal(6, results[3].strategies.length);

            equal(3, results[4].strategies.length);
            equal(6, results[7].strategies.length);

            equal(8, results.length);
        });
    });

    describe('PermutationIterator', function () {
        it('should instantiate', function () {
            new PermutationIterator([], 1, 2);
        });

        it('should give 2 sets of one strategy from 1 to 2', function () {
            const iterator = new PermutationIterator(['a'], 1, 2);
            const results = [
                iterator.next(),
                iterator.next(),
            ];
            equal([['a'], ['a', 'a']], results);
            assert(!iterator.next());
        });

        it('should give 6 sets of two strategies from 1 to 2', function () {
            const iterator = new PermutationIterator(['a', 'b'], 1, 2);
            const results = [
                iterator.next(), // a
                iterator.next(), // b
                iterator.next(), // a, a
                iterator.next(), // a, b
                iterator.next(), // b, a
                iterator.next(), // b, b
            ];
            equal(
                [
                    ['a'],
                    ['b'],
                    ['a', 'a'],
                    ['a', 'b'],
                    ['b', 'a'],
                    ['b', 'b'],
                ],
                results
            );
            assert(!iterator.next());
        });

        it('should give 12 sets of two strategies from 2 to 3', function () {
            const iterator = new PermutationIterator(['a', 'b'], 2, 3);
            const results = [
                iterator.next(), // a, a
                iterator.next(), // a, b
                iterator.next(), // b, a
                iterator.next(), // b, b
                iterator.next(), // a, a, a
                iterator.next(), // a, a, b
                iterator.next(), // a, b, a
                iterator.next(), // a, b, b
                iterator.next(), // b, a, a
                iterator.next(), // b, a, b
                iterator.next(), // b, b, a
                iterator.next(), // b, b, b
            ];
            equal(
                [
                    ['a', 'a'],
                    ['a', 'b'],
                    ['b', 'a'],
                    ['b', 'b'],
                    ['a', 'a', 'a'],
                    ['a', 'a', 'b'],
                    ['a', 'b', 'a'],
                    ['a', 'b', 'b'],
                    ['b', 'a', 'a'],
                    ['b', 'a', 'b'],
                    ['b', 'b', 'a'],
                    ['b', 'b', 'b'],
                ],
                results
            );
            assert(!iterator.next());
        });
    });

    describe('RandomIterator', function () {
        it('should instantiate', function () {
            new RandomIterator([], 1, 2, 100);
        });

        it('should give from minimum to maximum, inclusive', function () {
            const options = ['a', 'b', 'c'];
            const iterator = new RandomIterator(options, 3, 5, 100);
            const permutation = iterator.next();
            assert(permutation.length >= 3);
            assert(permutation.length <= 5);
        });

        it('should give to exactly the limit', function () {
            const options = ['a', 'b', 'c'];
            const iterator = new RandomIterator(options, 3, 5, 100);
            for (let i = 0; i < 100; i++) {
                iterator.next();
            }
            const permutation = iterator.next();
            assert(permutation === null);
        });

        it('should give some results for each of minimum, maximum, and in between', function () {
            const options = ['a', 'b', 'c'];
            const iterator = new RandomIterator(options, 3, 5, 100);
            let permutation;
            const counts = {
                3: false,
                4: false,
                5: false,
            };
            while (permutation = iterator.next()) {
                counts[permutation.length] = true;
            }
            assert(counts[3]);
            assert(counts[4]);
            assert(counts[5]);
        });

        it('should only give results from the option set', function () {
            const options = ['a', 'b', 'c'];
            const iterator = new RandomIterator(options, 3, 5, 100);
            let permutation;
            while (permutation = iterator.next()) {
                assert(
                    permutation
                        .filter(option => options.includes(option))
                        .length
                    ===
                    permutation.length
                );
            }
        });
    });
});
