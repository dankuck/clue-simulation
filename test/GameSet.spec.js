const GameSet = require('../GameSet');
const assert = require('assert');
const {
    deepStrictEqual:    equal,
    notDeepStrictEqual: notEqual,
} = assert;

describe('GameSet', function () {

    it('should instantiate', function () {
        new GameSet();
    });

    it('should add a game result', function () {
        const set = new GameSet();
        set.add({});
    });

    it('should get all game results', function () {
        const set = new GameSet();
        equal([], set.get());
    });

    it('should have a count()', function () {
        const set = new GameSet();
        equal(0, set.count());
        set.add({});
        equal(1, set.count());
    });

    it('should give a query()', function () {
        const set = new GameSet();
        const query = set.query();
        assert(query);
    });

    describe('Query', function () {

        it('should give games with a certain strategy involved', function () {
            const set = new GameSet();
            const X = {}, Y = {};
            set.add({strategies: [X]});
            set.add({strategies: [X, Y]});
            set.add({strategies: [Y]});
            equal(2, set.query().hasStrategy(X).get().length);
        });

        it('should give games with a certain winning strategy', function () {
            const set = new GameSet();
            const X = {}, Y = {};
            set.add({winningStrategy: X});
            set.add({winningStrategy: Y});
            equal(1, set.query().hasWinningStrategy(X).get().length);
        });

        it('should give games with a certain winning strategy', function () {
            const set = new GameSet();
            const X = {}, Y = {};
            set.add({winningStrategy: X});
            set.add({winningStrategy: Y});
            set.add({winningStrategy: null});
            set.add({});
            set.add({winningStrategy: undefined});
            set.add({winningStrategy: 0});
            set.add({winningStrategy: false});
            equal(5, set.query().hasNoWinningStrategy().get().length);
        });

        it('should give games with certain winning strategies', function () {
            const set = new GameSet();
            const X = {}, Y = {}, Z = {};
            set.add({winningStrategy: X});
            set.add({winningStrategy: Y});
            set.add({winningStrategy: Z});
            equal(2, set.query().hasWinningStrategyIn([X, Y]).get().length);
        });

        it('should give games with strategy in a certain position', function () {
            const set = new GameSet();
            const X = {}, Y = {}, Z = {};
            set.add({strategies: [X, Y, Z]});
            set.add({strategies: [Y, Z, X]});
            set.add({strategies: [Z, X, Y]});
            equal(1, set.query().hasStrategyInPosition(X, 1).get().length);
        });

        it('should give games with specific game sizes', function () {
            const set = new GameSet();
            const X = {}, Y = {}, Z = {};
            set.add({strategies: [X, Y, Z]});
            set.add({strategies: [X, Y, Z, X]});
            set.add({strategies: [X, Y, Z, X, Y]});
            set.add({strategies: [X, Y, Z, X, Y, Z]});
            equal(1, set.query().hasGameSize(5).get().length);
        });

        it('should give games where a strategy is found only once', function () {
            const set = new GameSet();
            const X = {}, Y = {}, Z = {};
            set.add({strategies: [X, Y, Z]});
            set.add({strategies: [X, Y, Z, X]});
            set.add({strategies: [X, Y, Z, Y]});
            set.add({strategies: [X, Y, Z, Z]});
            equal(3, set.query().hasStrategyAlone(X).get().length);
        });

        it('should give games where a strategy is found an exact number of times', function () {
            const set = new GameSet();
            const X = {}, Y = {}, Z = {};
            set.add({strategies: [X, Y, Z]});
            set.add({strategies: [X, Y, Z, X]});
            set.add({strategies: [X, Y, Z, Y]});
            set.add({strategies: [X, Y, Z, Z]});
            equal(1, set.query().hasTeamSize(X, 2).get().length);
        });

        it('should groupBy', function () {
            const set = new GameSet();
            const X = {}, Y = {}, Z = {};
            set.add({arrangement: 'X,Yx2'});
            set.add({arrangement: 'X,Yx2'});
            set.add({arrangement: 'Xx2,Y'});
            set.add({arrangement: 'Xx3,Yx2'});
            set.add({arrangement: 'X,Y'});
            const groups = set.query().groupBy('arrangement');
            equal(4, groups.length);
        });

        it('should count', function () {
            const set = new GameSet();
            const X = {}, Y = {}, Z = {};
            set.add({strategies: [X, Y, Z]});
            set.add({strategies: [X, Y, Z, X]});
            set.add({strategies: [X, Y, Z, Y]});
            set.add({strategies: [X, Y, Z, Z]});
            equal(3, set.query().hasStrategyAlone(X).count());
        });

        it('should chain queries', function () {
            const set = new GameSet();
            const X = {}, Y = {}, Z = {};
            set.add({strategies: [X, Y, Z]});
            set.add({strategies: [X, Y, Z, X]});
            set.add({strategies: [X, Y, Z, Y]});
            set.add({strategies: [X, Y, Z, Z]});
            equal(2, set.query().hasGameSize(4).hasStrategyAlone(X).get().length);
        });
    });

    it('should alias Query methods onto GameSet', function () {
        const set = new GameSet();
        equal(0, set.hasStrategy().get().length);
        equal(0, set.hasWinningStrategy().get().length);
        equal(0, set.hasWinningStrategyIn().get().length);
        equal(0, set.hasStrategyInPosition().get().length);
        equal(0, set.hasGameSize().get().length);
        equal(0, set.hasStrategyAlone().get().length);
    });
});

