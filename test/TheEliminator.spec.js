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
const TheEliminator = require('../Strategies/TheEliminator.js');
const testStrategy = require('./testStrategy.js');
const assert = require('assert');
const {
    deepStrictEqual:    equal,
    notDeepStrictEqual: notEqual,
} = assert;

describe('TheEliminator', function () {

    testStrategy(TheEliminator);

    describe('strategy', function () {
        it('never chooses from its own hand', function () {
            const deck = new Deck([
                new Card(Card.SUSPECT, 'Gary'),
                new Card(Card.WEAPON, 'Noodle'),
                new Card(Card.ROOM, 'Pool House'),

                new Card(Card.SUSPECT, 'Garette'),
                new Card(Card.WEAPON, 'Noodlette'),
                new Card(Card.ROOM, 'Pool Housette'),
            ]);
            const {envelope, hands: [hand]} = deck.divy(1);
            const strategy = new TheEliminator(hand, deck);
            const suggestion = strategy.move();

            notEqual(hand.getSuspects()[0], suggestion.suspect);
            notEqual(hand.getWeapons()[0], suggestion.weapon);
            notEqual(hand.getRooms()[0], suggestion.room);

            // must equal these... unless it's null or something :O
            equal(envelope.getSuspects()[0], suggestion.suspect);
            equal(envelope.getWeapons()[0], suggestion.weapon);
            equal(envelope.getRooms()[0], suggestion.room);
        });

        it('sees when another player shows it a card', function () {
            const deck = new Deck([
                new Card(Card.SUSPECT, 'Gary'),
                new Card(Card.WEAPON, 'Noodle'),
                new Card(Card.ROOM, 'Pool House'),

                new Card(Card.SUSPECT, 'Garette'),

                new Card(Card.SUSPECT, 'Mr. Poolboi'),
            ]);
            const {envelope, hands: [hand1, hand2]} = deck.divy(2);
            const strategy = new TheEliminator(hand1, deck);
            const card = hand2.getSuspects()[0];
            const suggestion1 = suggest(
                card,
                envelope.getWeapons()[0],
                envelope.getRooms()[0]
            );
            // TheEliminator isn't smart enough to know that it did not
            // make this suggestion.
            // We use this to tell it what card hand2 has.
            strategy.seeCard({suggestion1, card, player: 2});
            const suggestion2 = strategy.move();
            equal(envelope.getSuspects()[0], suggestion2.suspect);
            equal(envelope.getWeapons()[0], suggestion2.weapon);
            equal(envelope.getRooms()[0], suggestion2.room);
        });

        it('makes an accusation when appropriate', function () {
            const deck = new Deck([
                new Card(Card.SUSPECT, 'Gary'),
                new Card(Card.WEAPON, 'Noodle'),
                new Card(Card.ROOM, 'Pool House'),

                new Card(Card.SUSPECT, 'Garette'),
                new Card(Card.WEAPON, 'Noodlette'),
                new Card(Card.ROOM, 'Pool Housette'),
            ]);
            const {envelope, hands: [hand]} = deck.divy(1);
            const strategy = new TheEliminator(hand, deck);
            const suggestion = strategy.move();
            equal('ACCUSATION', suggestion.type);
            equal(envelope.getSuspects()[0], suggestion.suspect);
            equal(envelope.getWeapons()[0], suggestion.weapon);
            equal(envelope.getRooms()[0], suggestion.room);
        });
    });
});
