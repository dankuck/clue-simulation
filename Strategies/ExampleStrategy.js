const { suggest, accuse, Card } = require('../Clue.js');

/**
 |-------------------------
 | ExampleStrategy
 |-------------------------
 | This strategy is about as clever as a small child. Not my child, mind you.
 | But some other person's booger-eater child.
 |
 | This strategy only exists to explain to you how to build a strategy class.
 */

/**
 * Your strategy must be a class or a function that can be constructed like in
 * classic JavaScript.
 */
class ExampleStrategy
{
    /**
     * The constructor must accept a Hand, a Deck, and a GameSummary object.
     * The hand contains the cards assigned to this player.
     * The deck contains all the cards in the game.
     * The game_summary contains the player's own position and the other
     * players' hand counts.
     * What you do with them is up to you.
     */
    constructor(hand, deck, game_summary)
    {
        this.deck = deck;
    }

    /**
     * The only required method.
     *
     * The makeSuggestion method must return a Suggestion object.
     * The suggestion you return will be used to inform your player, and
     * others, whether it can be refuted.
     *
     * Return suggest(suspect, weapon, room) or accuse(suspect, weapon, room)
     */
    makeSuggestion()
    {
        // This strategy is pretty bad, because it randomly chooses to accuse
        // or suggest, and the cards are the first known suspect, weapon, and
        // room every time.
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
     * specific card. This is only sent to the player that created the
     * Suggestion. The parameter is an object. Here we decompose it.
     * - suggestion - The Suggestion object returned from your own
     *                makeSuggestion() call
     * - card       - One Card that the other player has
     * - player     - The ID of the player who has the card
     */
    seeCard({suggestion, card, player})
    {
    }

    /**
     * The game uses chooseCardToShow to give you a chance to show a preferred
     * card to the player with the given ID. You may also choose to record the
     * fact that that player saw that card.
     */
    chooseCardToShow(cards, player)
    {
    }

    /**
     * The game uses seeSuggestionRefuted to inform you that a specific player
     * has shown another player that a specific suggestion is wrong. This is
     * only sent to users who are not `player` or `asker`. The parameter is an
     * object. Here we decompose it.
     * - suggestion - The Suggestion object returned from `asker`'s
     *                makeSuggestion() call
     * - player     - The ID of the player who has one of the cards in the
     *                Suggestion
     * - asker      - The ID of the player who created Suggestion; this player
     *                now knows which Card in Suggestion is held by player
     */
    seeSuggestionRefuted({suggestion, player, asker})
    {
    }

    /**
     * The game uses seeSuggestionNotRefuted to inform you that a specific player
     * was unable to refute any of the cards in the Suggestion because they
     * have none of them. This is only sent to players who are not `player` or
     * `asker`. The parameter is an object. Here we decompose it.
     * - suggestion - The Suggestion object returned from `asker`'s
     *                makeSuggestion() call
     * - player     - The ID of the player who has none of the cards in the
     *                Suggestion
     * - asker      - The ID of the player who created Suggestion
     */
    seeSuggestionNotRefuted({suggestion, player, asker})
    {
    }

    /**
     * The game uses seeSuggestionNeverRefuted to inform all players that a
     * suggestion could not be refuted by any players. Note: The player who
     * made the suggestion was never asked, so seeing this event does not
     * necessarily mean that the suggestion is correct. The asker might have
     * one or more of the cards!
     *
     * The parameter is an object. Here we decompose it.
     * - suggestion - The Suggestion object returned from `asker`'s makeSuggestion() call
     * - asker      - The ID of the player who created Suggestion
     */
    seeSuggestionNeverRefuted({suggestion, asker})
    {
    }
}

module.exports = ExampleStrategy;
