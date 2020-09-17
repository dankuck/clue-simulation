const { suggest, accuse, Card } = require('../Clue.js');
const { sample } = require('lodash');
const TheSuggestionWatcher = require('./TheSuggestionWatcher');
const ShowSameSubStrategy = require('./ShowSameSubStrategy');

/**
 |--------------------------
 | TheCageySuggestionWatcher
 |--------------------------
 | This works like TheSuggestionWatcher, which has docs that read:
 |
 |   TheSuggestionWatcher works on elimination, just like TheEliminator, however
 |   it pays attention to what other players are doing. If it sees another
 |   player A show a card to another player B, TheSuggestionWatcher attempts to
 |   deduce what card was shown based on its knowledge about what cards are
 |   known to NOT be held by player A.
 |
 |   If it cannot deduce the card, it remembers the event for later, and
 |   reattempts the deduction.
 |
 |   This strategy does NOT notice when other players CANNOT refute a
 |   suggestion. Since that can also help us to deduce a card, this failure
 |   is debilitating.
 |
 | TheCageySuggestionWatcher also uses ShowSameSubStrategy to ensure the same
 | card is shown each time the same other-player asks for it.
 |
 | ShowSameSubStrategy has docs that read:
 |
 |   When the ClueGame asks a player what card they'd like to show, a strategy
 |   class can use this to decide.
 |
 |   The strategy should keep an instance of ShowSameSubStrategy so
 |   ShowSameSubStrategy can learn what choices have been made before.
 |
 |   If no cards have ever been shown, we just pick one at random. Then we
 |   remember which one it was.
 |
 |   If the current other-player has never asked for a card before, then
 |   we check if we've shown anyone any of the cards they're asking for. If we
 |   have already shown one to someone else before, we show the same one to
 |   the new other-player. We remember this too.
 |
 |   If the same player asks about the same card again, we show the same card.
 |
 |   In this way we attempt to ensure that, if we have a choice, we choose
 |   cards that release the least information to the other players
 */
class TheCageySuggestionWatcher extends TheSuggestionWatcher
{
    constructor(...params)
    {
        super(...params);
        this.showSame = new ShowSameSubStrategy();
    }

    chooseCardToShow(card, askerId)
    {
        return this.showSame.chooseCardToShow(card, askerId);
    }
}

module.exports = TheCageySuggestionWatcher;
