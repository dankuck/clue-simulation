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
const TheSuggestionWatcherCardCounter = require('../Strategies/TheSuggestionWatcherCardCounter.js');
const testStrategy = require('./testStrategy.js');
const assert = require('assert');
const {
    deepStrictEqual:    equal,
    notDeepStrictEqual: notEqual,
} = assert;
const { shuffle, sample } = require('lodash');

const { Counter, ArrayMap } = TheSuggestionWatcherCardCounter;

describe.only('TheSuggestionWatcherCardCounter', function () {

    testStrategy(TheSuggestionWatcherCardCounter);

});
