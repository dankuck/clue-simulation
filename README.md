# clue-simulation
Simulate Clue and strategies for it

# How to play

To see a ranked game, `npm run leaderboard`.

To add your own strategy see the ExampleStrategy below.

# Rankings

Here are the current rankings for the various strategies, in reverse order because they build on each other. The numbers are the number of games each strategy has been in.

1089 : TheEliminator

This strategy just waits to see a card and eliminates it from its list; the way the game rules describe. Once it has eliminated all options, it accuses. Its own suggestions are random from its current pool.

1101 : TheCageyEliminator

This one is the same as TheEliminator above, but it tries to ensure that, if it has to show a card, it shows the same card every time.

1101 : TheLuckyEliminator

The above two jokers don't even notice when they have made a correct suggestion! This one does, and eliminates all other cards; it only does this when the suggestion is its own. Unfortunately, that's not good enough because if the over confident fellas below are in the game, they noticed it too.

4854 : TheCageySuggestionWatcher

This special form of the TheSuggestionWatcher below tries to show the same card every time it has to. Somehow it does slightly worse than the normal version.

4899 : TheSuggestionWatcher

This one watches when a player proves another player's suggestion wrong. If it can, it deduces what card was shown. Otherwise, it saves the suggestion and deduces it later. It was on top for a while.

5399 : TheTrickySuggestionWatcher

SuggestionWatcher was pretty strong, but TheOverConfidentEliminator came along and bullshitted its way to the top. This one attempts to trick it by using cards from its own hand in suggestions. It doesn't work as well as hoped. You can see it wins about 10% more games than basic TheSuggestionWatcher. That's because it saves those games from TheOverConfident* duo below.

15774 : TheOverConfidentEliminator

This one really threw me for a loop. It was developed from a bug in TheLuckyEliminator, but it worked so unbelievably well that it got its own name. It's just regular TheElimination strategy (see above, the worst strategy), but when it sees that a suggestion cannot be refuted by anyone, it drops everything and uses that suggestion for an accusation. Even TheTrickySuggestionWatcher didn't slow it down much.

15783 : TheOverConfidentSuggestionWatcher

TheTrickySuggestionWatcher should have taken down TheOverConfidentEliminator, but it didn't. It just didn't! I figured fight fire with fire. So this is TheSuggestionWatcher with the same just-accuse-the-last-irrefutable-suggestion code. It's the leader right now, but don't let it fool you. It switches back and forth with TheOverConfidentEliminator for top spot.

# ExampleStrategy

To make your own strategy, you'll need to

1. Create it as a class in the Strategies folder.
2. Add it to the allStrategies.js in the Strategies folder.
3. Maybe test it by adding a test like the ones in the test folder.
4. Make it with certain methods from the ExampleStrategy below.

```
const { suggest, accuse, Card } = require('../Clue.js');

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
     * - suggestion - The Suggestion object returned from `asker`'s
     *                makeSuggestion() call
     * - asker      - The ID of the player who created Suggestion
     */
    seeSuggestionNeverRefuted({suggestion, asker})
    {
    }
}

module.exports = ExampleStrategy;
```
