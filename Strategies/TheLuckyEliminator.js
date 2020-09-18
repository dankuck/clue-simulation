const { suggest, accuse, Card } = require('../Clue.js');
const { sample } = require('lodash');
const TheEliminator = require('./TheEliminator');

/**
 |---------------------
 | TheLuckyEliminator
 |---------------------
 | This strategy is just like TheEliminator but it takes advantage of a small
 | obvious possibility.
 |
 | Here's TheEliminator's docs:
 |   TheEliminator makes random suggestions and eliminates the cards it is
 |   shown until it has just one of each card. This operates very much like the
 |   strategy prescribed in the Clue instructions.
 |
 |   The only missing piece is that this strategy does NOT notice when it gets
 |   everything right in a suggestion. This should happen 1/324 suggestions, so
 |   this is somewhat debilitating.
 |
 | This strategy eliminates that debilitating oversight.
 |
 | If our suggestion goes all the way around the circle without being refuted,
 | then we got lucky and we know it's exactly right. We can eliminate all the
 | other cards. Will it make a difference?
 |
 | Turns out no. In tests it doesn't make a consistent difference.
 */
class TheLuckyEliminator extends TheEliminator
{
    constructor(hand, deck, game_summary)
    {
        super(hand, deck, game_summary)
        this.game_summary = game_summary;
    }

    /**
     * No one was able to refute the suggestion! Since we know we didn't
     * suggest cards that we ourselves hold, we know that these cards are
     * in the envelope. Too bad everyone else got a chance to see the cards
     * too!
     */
    seeSuggestionNeverRefuted({suggestion, asker})
    {
        if (asker === this.game_summary.player) {
            this.suspects = [suggestion.suspect];
            this.weapons = [suggestion.weapon];
            this.rooms = [suggestion.room];
        }
    }
}

module.exports = TheLuckyEliminator;
