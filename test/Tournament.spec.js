const Tournament = require('../Tournament.js');
const ExampleStrategy = require('../Strategies/ExampleStrategy.js');
const assert = require('assert');
const {
    deepStrictEqual:    equal,
    notDeepStrictEqual: notEqual,
} = assert;
const PermutationIterator = Tournament.PermutationIterator;

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
                iterator: class {
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
});


    function describeGame(game)
    {
        const d = [];
        d.push('Strategies: ' + game.strategies.map(s => s.name).join(', '));
        d.push('Errors: ' + game.errors.length);
        d.push('Steps: ' + game.steps);
        return d.join("\n");
    }
