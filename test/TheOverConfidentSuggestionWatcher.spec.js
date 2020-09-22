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
const TheOverConfidentSuggestionWatcher = require('../Strategies/TheOverConfidentSuggestionWatcher.js');
const testStrategy = require('./testStrategy.js');
const assert = require('assert');
const {
    deepStrictEqual:    equal,
    notDeepStrictEqual: notEqual,
} = assert;

describe('TheOverConfidentSuggestionWatcher', function () {

    testStrategy(TheOverConfidentSuggestionWatcher);

});
