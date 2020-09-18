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
const TheSuggestionWatcher = require('../Strategies/TheSuggestionWatcher.js');
const testStrategy = require('./testStrategy.js');
const assert = require('assert');
const {
    deepStrictEqual:    equal,
    notDeepStrictEqual: notEqual,
} = assert;

describe('TheSuggestionWatcher', function () {

    testStrategy(TheSuggestionWatcher);

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
            const game_summary = new GameSummary(0, [hand]);
            const strategy = new TheSuggestionWatcher(hand, deck, game_summary);
            const suggestion = strategy.makeSuggestion();

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
            const game_summary = new GameSummary(0, [hand1, hand2]);
            const strategy = new TheSuggestionWatcher(hand1, deck, game_summary);
            const card = hand2.getSuspects()[0];
            const suggestion1 = suggest(
                card,
                envelope.getWeapons()[0],
                envelope.getRooms()[0]
            );
            // TheSuggestionWatcher isn't smart enough to know that it did not
            // make this suggestion.
            // We use this to tell it what card hand2 has.
            strategy.seeCard({suggestion1, card, player: 2});
            const suggestion2 = strategy.makeSuggestion();
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
            const game_summary = new GameSummary(0, [hand]);
            const strategy = new TheSuggestionWatcher(hand, deck, game_summary);
            const suggestion = strategy.makeSuggestion();
            equal('ACCUSATION', suggestion.type);
            equal(envelope.getSuspects()[0], suggestion.suspect);
            equal(envelope.getWeapons()[0], suggestion.weapon);
            equal(envelope.getRooms()[0], suggestion.room);
        });

        it('figures out what card was shown', function () {
            const cards = [
                new Card(Card.SUSPECT, 'Gary'),
                new Card(Card.WEAPON, 'Noodle'),
                new Card(Card.ROOM, 'Pool House'),

                new Card(Card.SUSPECT, 'Garette'),
                new Card(Card.ROOM, 'Hobbit Hole'),

                new Card(Card.WEAPON, 'Brandy Snifter'),
            ];
            const deck = new Deck(cards);
            const envelope = new Hand(cards.slice(0, 3));
            const hand1 = new Hand(cards.slice(3, 5));
            const hand2 = new Hand(cards.slice(5, 6));
            const game_summary = new GameSummary(0, [hand1, hand2]);
            const strategy = new TheSuggestionWatcher(hand1, deck, game_summary);
            const card = hand2.getWeapons()[0];
            const suggestion1 = suggest(
                hand1.getSuspects()[0],
                card,
                hand1.getRooms()[0],
            );
            // Since TheSuggestionWatcher knows what cards it has, it can infer
            // that the card shown (to whom? doesn't matter) is the third
            // card in the set.
            strategy.seeSuggestionRefuted({suggestion: suggestion1, player: 2});
            // Now it should have eliminated all possibilities except the right
            // ones
            const suggestion2 = strategy.makeSuggestion();
            equal(
                accuse(
                    envelope.getSuspects()[0],
                    envelope.getWeapons()[0],
                    envelope.getRooms()[0]
                ),
                suggestion2
            );

        });

        it('figures out what card was shown by remembering suggestion', function () {
            const cards = [
                new Card(Card.SUSPECT, 'Gary'),
                new Card(Card.WEAPON, 'Noodle'),
                new Card(Card.ROOM, 'Pool House'),

                new Card(Card.SUSPECT, 'Garette'),
                new Card(Card.ROOM, 'Hobbit Hole'),

                new Card(Card.WEAPON, 'Brandy Snifter'),

                new Card(Card.SUSPECT, 'Meat Loaf'),
            ];
            const deck = new Deck(cards);
            const envelope = new Hand(cards.slice(0, 3));
            const hand1 = new Hand(cards.slice(3, 5));
            const hand2 = new Hand(cards.slice(5, 6));
            const hand3 = new Hand(cards.slice(6, 7));
            const game_summary = new GameSummary(0, [hand1, hand2, hand3]);
            const strategy = new TheSuggestionWatcher(hand1, deck, game_summary);
            const suggestion1 = suggest(
                // Get the suspect from hand2.
                hand3.getSuspects()[0],
                // Get the weapon from hand3.
                hand2.getWeapons()[0],
                // Strategy only knows that the room is eliminated, so far.
                hand1.getRooms()[0],
            );
            // TheSuggestionWatcher does not have enough information to infer
            // anything about this suggestion yet, but it will remember that
            // player 2 refuted it.
            strategy.seeSuggestionRefuted({suggestion: suggestion1, player: 2});
            const card = hand3.getSuspects()[0];
            // Now we'll tell the strategy that player 3 has this card
            strategy.seeCard({card, player: 3});
            // Now it should have eliminated all possibilities except the right
            // ones
            const suggestion2 = strategy.makeSuggestion();
            equal(
                accuse(
                    envelope.getSuspects()[0],
                    envelope.getWeapons()[0],
                    envelope.getRooms()[0]
                ),
                suggestion2
            );
        });
    });
});
