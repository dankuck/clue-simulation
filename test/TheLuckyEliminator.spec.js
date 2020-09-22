const {
    Card,
    ClueGame,
    Deck,
    Hand,
    Player,
    Suggestion,
    suggest,
    accuse,
} = require('../Clue.js');
const TheLuckyEliminator = require('../Strategies/TheLuckyEliminator.js');
const testStrategy = require('./testStrategy.js');
const assert = require('assert');
const {
    deepStrictEqual:    equal,
    notDeepStrictEqual: notEqual,
} = assert;

describe('TheLuckyEliminator', function () {

    testStrategy(TheLuckyEliminator);

});
