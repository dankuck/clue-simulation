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
const ShowSame = require('../Strategies/ShowSameSubStrategy.js');
const testStrategy = require('./testStrategy.js');
const assert = require('assert');
const {
    deepStrictEqual:    equal,
    notDeepStrictEqual: notEqual,
} = assert;

describe('ShowSame', function () {
    it('should show a card and not require instantiation', function () {
        const cards = [
            new Card(Card.SUSPECT, 'Mrs. White'),
            new Card(Card.WEAPON, 'White rabbit'),
            new Card(Card.ROOM, 'White room'),
        ];
        const chooseCardToShow = ShowSame.buildChooseCardToShow();
        const card = chooseCardToShow(cards, 1);
        assert(card);
    });

    it('should show the same card to the same asker', function () {
        const cards = [
            new Card(Card.SUSPECT, 'Mrs. White'),
            new Card(Card.WEAPON, 'White rabbit'),
            new Card(Card.ROOM, 'White room'),
        ];
        const chooseCardToShow = ShowSame.buildChooseCardToShow();
        const card1 = chooseCardToShow(cards, 1);
        const card2 = chooseCardToShow(cards, 1);
        equal(card1, card2);
    });

    it('should prefer cards that have been shown before for new askers', function () {
        const cards1 = [
            new Card(Card.SUSPECT, 'Mrs. White'),
            new Card(Card.WEAPON, 'White rabbit'),
            new Card(Card.ROOM, 'White room'),
        ];
        const cards2 = [
            null, // space for the same card
            new Card(Card.WEAPON, 'Black sheep'),
            new Card(Card.ROOM, 'Black rock'),
        ];
        const chooseCardToShow = ShowSame.buildChooseCardToShow();
        const card1 = chooseCardToShow(cards1, 1);
        cards2[0] = card1; // same, should be preferred
        const card2 = chooseCardToShow(cards2, 2);
        equal(card1, card2);
    });
});
