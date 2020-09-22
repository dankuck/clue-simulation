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
const TheCageyEliminator = require('../Strategies/TheCageyEliminator.js');
const testStrategy = require('./testStrategy.js');
const assert = require('assert');
const {
    deepStrictEqual:    equal,
    notDeepStrictEqual: notEqual,
} = assert;

describe('TheCageyEliminator', function () {

    testStrategy(TheCageyEliminator);

});
