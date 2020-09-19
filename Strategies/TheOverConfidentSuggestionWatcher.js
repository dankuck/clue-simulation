const { suggest, accuse, Card, Suggestion } = require('../Clue.js');
const { sample } = require('lodash');
const TheSuggestionWatcher = require('./TheSuggestionWatcher');

/**
 |------------------------------------------
 | TheOverConfidentSuggestionWatcher
 |------------------------------------------
 | This strategy is based on TheSuggestionWatcher, which has these docs:
 |
 |   TheSuggestionWatcher works on elimination, just like TheEliminator,
 |   however it pays attention to what other players are doing. If it sees
 |   another player A show a card to another player B, TheSuggestionWatcher
 |   attempts to deduce what card was shown based on its knowledge about what
 |   cards are known to NOT be held by player A.
 |
 |   If it cannot deduce the card, it remembers the event for later, and
 |   reattempts the deduction.
 |
 |   This strategy does NOT notice when other players CANNOT refute a
 |   suggestion. Since that can also help us to deduce a card, this failure is
 |   debilitating.
 |
 | So, that's great, but TheOverConfidentEliminator is tearing it up as of this
 | writing. So lets make an over-confident version of TheSuggestionWatcher.
 |
 | If any suggestion goes all the way around the circle without being refuted,
 | then we got lucky and we can bet it's exactly right. We can eliminate all
 | the other cards.
 */
class TheOverConfidentSuggestionWatcher extends TheSuggestionWatcher
{
    constructor(hand, deck, game_summary)
    {
        super(hand, deck, game_summary)
        this.game_summary = game_summary;
    }

    seeSuggestionNeverRefuted({suggestion, asker})
    {
        this.notes.push(`I saw a suggestion by ${asker} that could not be refuted : ${suggestion}`);
        // We saw an answer that's probably right.
        //
        // Originally, I attempted to actually eliminate the other cards, but
        // the problem was that I didn't know who owned them. It was hard to
        // track down the bug that mistake caused.
        //
        // Instead, we can duck punch the right answer into place.
        const {suspect, weapon, room} = suggestion;
        this.makeSuggestion = () => {
            return accuse(suspect, weapon, room);
        };
    }
}

module.exports = TheOverConfidentSuggestionWatcher;
