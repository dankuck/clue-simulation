const { suggest, accuse, Card } = require('./Clue.js');

/**
 * Your strategy must be a class or a function that can be constructed.
 */
class ExampleStrategy
{
    /**
     * The constructor must accept a Hand and a Deck object.
     * The hand contains the cards assigned to this player.
     * The deck contains all the cards in the game.
     * What you do with them is up to you.
     */
    constructor(hand, deck)
    {
        if (! hand) throw new Error('No hand given');
        if (! deck) throw new Error('No deck given');
        this.hand = hand;
        this.deck = deck;
    }

    /**
     * The only required method.
     *
     * The move method must return a Suggestion object.
     * The suggestion you return will be used to inform your player, and
     * others, whether it can be refuted.
     *
     * Return suggest(suspect, weapon, room) or accuse(suspect, weapon, room)
     */
    move()
    {
        // This strategy is pretty bad, because it randomly accuses or suggests
        // the first known suspect, weapon, and room.
        const suspect = this.deck.getSuspects()[0];
        const weapon  = this.deck.getWeapons()[0];
        const room    = this.deck.getRooms()[0];
        const func = Math.random() < .9 ? suggest : accuse;
        return func(suspect, weapon, room);
    }

    /////////////////////////////
    /// The rest of the methods
    /// are optional. They allow
    /// your player to notice when
    /// other players do or do not
    /// have some cards. You'll
    /// probably want to implement
    /// seeCard at least.

    /**
     * The game uses seeCard to inform you that a specific player has a
     * specific card. The parameter is an object. Here we decompose it.
     * - suggestion - The Suggestion object returned from your own move() call
     * - card       - One Card that the other player has
     * - player     - The ID of the player who has the card
     */
    seeCard({suggestion, card, player})
    {
        // We use this opportunity to test that the test and game pass us good
        // parameters. For other strategies, it may not be necessary to test
        // that, because we are testing it here.
    }

    /**
     * The game uses seeSuggestionAnswered to inform you that a specific player
     * has shown another player that a specific suggestion is wrong. The
     * parameter is an object. Here we decompose it.
     * - suggestion - The Suggestion object returned from `asker`'s move() call
     * - player     - The ID of the player who has one of the cards in the
     *                Suggestion
     * - asker      - The ID of the player who created Suggestion; this player
     *                now knows which Card in Suggestion is held by player
     */
    seeSuggestionAnswered({suggestion, player, asker})
    {
        // We use this opportunity to test that the test and game pass us good
        // parameters. For other strategies, it may not be necessary to test
        // that, because we are testing it here.
    }

    /**
     * The game uses seeSuggestionSkipped to inform you that a specific player
     * was unable to refute any of the cards in the Suggestion because they
     * have none of them. The parameter is an object. Here we decompose it.
     * - suggestion - The Suggestion object returned from `asker`'s move() call
     * - player     - The ID of the player who has none of the cards in the
     *                Suggestion
     * - asker      - The ID of the player who created Suggestion
     */
    seeSuggestionSkipped({suggestion, player, asker})
    {
        // We use this opportunity to test that the test and game pass us good
        // parameters. For other strategies, it may not be necessary to test
        // that, because we are testing it here.
    }
}

module.exports = ExampleStrategy;
