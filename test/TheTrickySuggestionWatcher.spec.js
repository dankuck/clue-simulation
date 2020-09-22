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
const TheTrickySuggestionWatcher = require('../Strategies/TheTrickySuggestionWatcher.js');
const testStrategy = require('./testStrategy.js');
const assert = require('assert');
const {
    deepStrictEqual:    equal,
    notDeepStrictEqual: notEqual,
} = assert;

describe('TheTrickySuggestionWatcher', function () {

    testStrategy(TheTrickySuggestionWatcher);

});
