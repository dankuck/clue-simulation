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
const TheOverConfidentEliminator = require('../Strategies/TheOverConfidentEliminator.js');
const testStrategy = require('./testStrategy.js');
const assert = require('assert');
const {
    deepStrictEqual:    equal,
    notDeepStrictEqual: notEqual,
} = assert;

describe('TheOverConfidentEliminator', function () {

    testStrategy(TheOverConfidentEliminator);

});
