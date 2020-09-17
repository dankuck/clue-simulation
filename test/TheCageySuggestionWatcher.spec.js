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
const TheCageySuggestionWatcher = require('../Strategies/TheCageySuggestionWatcher.js');
const testStrategy = require('./testStrategy.js');
const assert = require('assert');
const {
    deepStrictEqual:    equal,
    notDeepStrictEqual: notEqual,
} = assert;

describe('TheCageySuggestionWatcher', function () {

    testStrategy(TheCageySuggestionWatcher);

});
