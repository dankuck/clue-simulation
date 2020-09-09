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
const ExampleStrategy = require('../Strategies/ExampleStrategy.js');
const SimpleStrategy = require('../Strategies/SimpleStrategy.js');
const testStrategy = require('./testStrategy.js');
const assert = require('assert');
const {
    deepStrictEqual:    equal,
    notDeepStrictEqual: notEqual,
} = assert;

describe('Clue', function () {

    describe('Card', function () {
        it('should create a Card', function () {
            new Card(Card.SUSPECT, 'Gary');
        });
    });

    describe('Deck', function () {
        it('should instantiate empty', function () {
            const deck = new Deck([]);
            equal(0, deck.cards.length);
        });

        it('should instantiate with 1 card', function () {
            const card = new Card(Card.SUSPECT, 'Gary');
            const deck = new Deck([card]);
            equal(1, deck.cards.length);
        });

        it('should build a standard Deck', function () {
            const deck = Deck.buildStandardDeck();
            equal(21, deck.cards.length);
            equal(1, deck.cards.filter(card => card.name === 'Col. Mustard').length);
        });

        it('should divy up 3 cards to 4 players', function () {
            const cards = [
                new Card(Card.SUSPECT, 'Gary'),
                new Card(Card.WEAPON, 'Noodle'),
                new Card(Card.ROOM, 'Pool House'),
            ];
            const deck = new Deck(cards);
            const {envelope, hands} = deck.divy(4);
            equal(3, envelope.cards.length);
            equal(4, hands.length);
            equal(0, hands[0].cards.length);
            equal(0, hands[1].cards.length);
            equal(0, hands[2].cards.length);
            equal(0, hands[3].cards.length);
        });

        it('should divy up 4 cards to 1 player', function () {
            const cards = [
                new Card(Card.SUSPECT, 'Gary'),
                new Card(Card.WEAPON, 'Noodle'),
                new Card(Card.ROOM, 'Pool House'),
                new Card(Card.ROOM, 'Garden'),
            ];
            const deck = new Deck(cards);
            const {envelope, hands} = deck.divy(1);
            equal(3, envelope.cards.length);
            equal(1, hands.length);
            equal(1, hands[0].cards.length);
        });

        it('should divy up standard deck to 4 players', function () {
            const deck = Deck.buildStandardDeck();
            const {envelope, hands} = deck.divy(4);
            equal(3, envelope.cards.length);
            equal(4, hands.length);
            equal(5, hands[0].cards.length);
            equal(5, hands[1].cards.length);
            equal(4, hands[2].cards.length);
            equal(4, hands[3].cards.length);
        });

    });

    describe('Hand', function () {
        it('should instantiate empty', function () {
            const hand = new Hand([]);
            equal(0, hand.length);
        });

        it('should instantiate with 1', function () {
            const card = new Card(Card.SUSPECT, 'Gary');
            const hand = new Hand([card]);
            equal(1, hand.length);
        });

        it('should know what it has', function () {
            const card = new Card(Card.SUSPECT, 'Gary');
            const hand = new Hand([card]);
            assert(hand.has(card));
        });

        it('should filter what it has', function () {
            const gary = new Card(Card.SUSPECT, 'Gary');
            const cards = [
                gary,
                new Card(Card.WEAPON, 'Noodle'),
                new Card(Card.ROOM, 'Pool House'),
                new Card(Card.ROOM, 'Garden'),
            ];
            const hand = new Hand(cards);
            equal(2, hand.filterType(Card.ROOM).length)
            equal(gary, hand.filterType(Card.SUSPECT)[0])
        });

        it('should return its items', function () {
            const gary = new Card(Card.SUSPECT, 'Gary');
            const cards = [
                gary,
                new Card(Card.WEAPON, 'Noodle'),
                new Card(Card.ROOM, 'Pool House'),
                new Card(Card.ROOM, 'Garden'),
            ];
            const hand = new Hand(cards);
            equal(4, hand.length);
            assert(hand.get(0));
            assert(hand.get(1));
            assert(hand.get(2));
            assert(hand.get(3));
            assert(! hand.get(-1));
            assert(! hand.get(4));
            assert(! hand.get(NaN));
        });
    });

    describe('Suggestion', function () {
        it('should instantiate', function () {
            const suggestion = new Suggestion('TYPE', 'SUSPECT', 'WEAPON', 'ROOM');
            equal('TYPE', suggestion.type);
            equal('SUSPECT', suggestion.suspect);
            equal('WEAPON', suggestion.weapon);
            equal('ROOM', suggestion.room);
        });

        it('should provide a suggest() helper', function () {
            const suggestion = suggest('A', 'B', 'C');
            equal(Suggestion.SUGGESTION, suggestion.type);
            equal('A', suggestion.suspect);
            equal('B', suggestion.weapon);
            equal('C', suggestion.room);
        });

        it('should provide an accuse() helper', function () {
            const suggestion = accuse('A', 'B', 'C');
            equal(Suggestion.ACCUSATION, suggestion.type);
            equal('A', suggestion.suspect);
            equal('B', suggestion.weapon);
            equal('C', suggestion.room);
        });
    });

    describe('ClueGame', function () {
        it('should instantiate', function () {
            class Strategy {
            };
            const game = new ClueGame(Deck.buildStandardDeck(), [Strategy]);
            assert(game.deck);
            equal(1, game.players.length);
            equal(1, game.hands.length);
        });

        it('should play with a cheater', function () {
            class Loser {
                move() {
                    return suggest(/* no actual suggestion */);
                }
            };
            class Cheater {
                move() {
                    return accuse(
                        suspect,
                        weapon,
                        room
                    );
                }
            };
            const game = new ClueGame(Deck.buildStandardDeck(), [Loser, Cheater]);
            const suspect = game.envelope.filterType(Card.SUSPECT)[0];
            const weapon = game.envelope.filterType(Card.WEAPON)[0];
            const room = game.envelope.filterType(Card.ROOM)[0];
            const winner = game.play(100);
            assert(! (winner instanceof Loser));
            assert(winner instanceof Cheater);
        });

        it('should play with no winners', function () {
            class Loser {
                move() {
                    return {type: 'ACCUSATION', /* no actual accusation */};
                }
            };
            const game = new ClueGame(Deck.buildStandardDeck(), [Loser]);
            const winner = game.play(100);
            equal(null, winner);
            equal(true, game.isGameOver());
        });

        it('should not step if the game is done', function () {
            class Loser {
                move() {
                    return {type: 'ACCUSATION', /* no actual accusation */};
                }
            };
            const game = new ClueGame(Deck.buildStandardDeck(), [Loser]);
            game.play(100);
            const steps = game.steps;
            game.step();
            equal(steps, game.steps);
        });

        it('should make player B show a card to player A', function () {
            class PlayerA {
                move() {
                    // Colonel Mustard in the Colonel Mustard with the Colonel
                    // Mustard!
                    //
                    // The peekCard is random, so it could be any type, but we
                    // only need it to match Player B's cards, so we'll just
                    // suggest it as all of the cards!
                    return suggest(
                        peekCard,
                        peekCard,
                        peekCard
                    );
                }

                seeCard({card, player}) {
                    sawCard = card;
                    sawPlayer = player;
                }
            }
            class PlayerB {
                constructor(hand) {
                    peekCard = hand.get(0);
                }
            }
            let peekCard;
            let sawCard, sawPlayer;
            const game = new ClueGame(
                Deck.buildStandardDeck(),
                [PlayerA, PlayerB],
                {validate: false}
            );
            game.step();
            notEqual(null, sawCard);
            equal(peekCard, sawCard);
            equal(1, sawPlayer);
        });

        it('should inform a third player when other players show each other cards', function () {
            class PlayerA
            {
                move()
                {
                    // On their turn, PlayerA looks at the card PlayerB blabbed
                    // about (below) and suggests it, knowing PlayerB will
                    // refute it.
                    return suggest(peekCard, peekCard, peekCard);
                }
            }
            class PlayerB
            {
                constructor(hand)
                {
                    // When the game starts, PlayerB gets its hand and
                    // immediately blabs to everyone, by putting it in a
                    // place all players can see it.
                    peekCard = hand.get(0);
                }
            }
            class PlayerC
            {
                seeSuggestionAnswered(see)
                {
                    // In the end, PlayerC finds out that PlayerB refuted
                    // PlayerA. PlayerC tells everyone what he saw. Now they
                    // all know what C saw.
                    saw = see;
                }
            }
            let peekCard;
            let saw;
            const game = new ClueGame(
                Deck.buildStandardDeck(),
                [PlayerA, PlayerB, PlayerC],
                {validate: false}
            );
            game.step();
            equal(suggest(peekCard, peekCard, peekCard), saw.suggestion);
            equal(0, saw.asker);
            equal(1, saw.player);
        });

        it('should inform other players when a player cannot refute a suggestion', function () {
            class PlayerA
            {
                move()
                {
                    // PlayerA makes a null suggestion
                    return suggest(null, null, null);
                }
            }
            class PlayerB
            {
                // PlayerB cannot refute a suggestion with a bunch of nulls.
                // No code is needed here.
            }
            class PlayerC
            {
                seeSuggestionSkipped(see)
                {
                    // In the end, PlayerC finds out that PlayerB cannot refute
                    // PlayerA. PlayerC tells everyone what he saw. Now they
                    // all know what C saw.
                    saw = see;
                }
            }
            let saw;
            const game = new ClueGame(
                Deck.buildStandardDeck(),
                [PlayerA, PlayerB, PlayerC],
                {validate: false}
            );
            game.step();
            equal(suggest(null, null, null), saw.suggestion);
            equal(0, saw.asker);
            equal(1, saw.player);
        });

        it('should cut a player out when they accuse incorrectly', function () {
            class PlayerA
            {
                move()
                {
                    // PlayerA, trigger-happily accuses null of murder using
                    // null in null.
                    return accuse(null, null, null);
                }
            }
            class PlayerB
            {
                move()
                {
                    // PlayerB is wise enough to only *suggest* that null
                    // committed murder using null in null.
                    return suggest(null, null, null);
                }
            }
            const game = new ClueGame(Deck.buildStandardDeck(), [PlayerA, PlayerB]);
            equal(0, game.steps);
            assert(game.turnPlayer() instanceof PlayerA);
            game.step();
            equal(1, game.steps);
            assert(game.turnPlayer() instanceof PlayerB);
            game.step();
            equal(2, game.steps);
            assert(game.turnPlayer() instanceof PlayerB);
        });

        it('should let a player choose which card to show', function () {
            class PlayerA {
                move() {
                    return suggest(
                        peekCards[0],
                        peekCards[1],
                        null
                    );
                }

                seeCard({card}) {
                    sawCard = card;
                }
            }
            class PlayerB {
                constructor(hand) {
                    peekCards = [hand.get(0), hand.get(1)];
                }

                chooseCardToShow(cards, playerId) {
                    sawPlayerId = playerId;
                    return cards[1];
                }
            }
            let peekCards;
            let sawCard;
            let sawPlayerId;
            const game = new ClueGame(
                Deck.buildStandardDeck(),
                [PlayerA, PlayerB],
                {validate: false}
            );
            game.step();
            equal(2, peekCards.length);
            equal(peekCards[1], sawCard);
            equal(0, sawPlayerId);
        });

        it('should recover from errors thrown from move()', function () {
            class BadSuggestionPlayer {
                move() {
                    throw new Error('Should recover from error in move()');
                }
            }
            const game = new ClueGame(Deck.buildStandardDeck(), [BadSuggestionPlayer]);
            game.step();
            assert(game.isGameOver());
        });

        it('should deal with a strategy that does not return Suggestion class', function () {
            class BadSuggestionPlayer {
                constructor(hand) {
                    this.hand = hand;
                }

                move() {
                    const suggestion = suggest(
                        this.hand.get(0),
                        this.hand.get(1),
                        this.hand.get(2)
                    );
                    // make a non-Suggestion copy
                    return {...suggestion};
                }
            }
            const game = new ClueGame(Deck.buildStandardDeck(), [BadSuggestionPlayer]);
            game.step();
            assert(game.isGameOver());
            equal(1, game.errors.length);
        });

        it('should deal with a Suggestion with missing cards', function () {
            class BadSuggestionPlayer {
                constructor(hand) {
                    this.hand = hand;
                }

                move() {
                    return suggest(
                        this.hand.get(0),
                        this.hand.get(1),
                        null
                    );
                }
            }
            const game = new ClueGame(Deck.buildStandardDeck(), [BadSuggestionPlayer]);
            game.step();
            assert(game.isGameOver());
            equal(1, game.errors.length);
        });

        it('should deal with a Suggestion with wrongly typed cards', function () {
            class BadSuggestionPlayer {
                constructor(hand) {
                    this.hand = hand;
                }

                move() {
                    return suggest(
                        this.hand.get(0), // The first card
                        this.hand.get(0), // must be wrong
                        this.hand.get(0)  // for two of them
                    );
                }
            }
            const game = new ClueGame(Deck.buildStandardDeck(), [BadSuggestionPlayer]);
            game.step();
            assert(game.isGameOver());
            equal(1, game.errors.length);
        });

        it('should deal with a Suggestion with invalid type', function () {
            class BadSuggestionPlayer {
                constructor(hand) {
                    this.hand = hand;
                }

                move() {
                    const suggestion = suggest(
                        this.deck.getSuspects()[0],
                        this.deck.getWeapons()[0],
                        this.deck.getRooms()[0]
                    );
                    suggestion.type = 'BAD TYPE';
                    return suggestion;
                }
            }
            const game = new ClueGame(Deck.buildStandardDeck(), [BadSuggestionPlayer]);
            game.step();
            assert(game.isGameOver());
            equal(1, game.errors.length);
        });
    });

    describe('ExampleStrategy', function () {

        testStrategy(ExampleStrategy);

    });

    describe('SimpleStrategy', function () {

        testStrategy(SimpleStrategy);

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
                const strategy = new SimpleStrategy(hand, deck);
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
                const strategy = new SimpleStrategy(hand1, deck);
                const card = hand2.getSuspects()[0];
                const suggestion1 = suggest(
                    card,
                    envelope.getWeapons()[0],
                    envelope.getRooms()[0]
                );
                // SimpleStrategy isn't smart enough to know that it did not
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
                const strategy = new SimpleStrategy(hand, deck);
                const suggestion = strategy.move();
                equal('ACCUSATION', suggestion.type);
                equal(envelope.getSuspects()[0], suggestion.suspect);
                equal(envelope.getWeapons()[0], suggestion.weapon);
                equal(envelope.getRooms()[0], suggestion.room);
            });
        });
    });
});
