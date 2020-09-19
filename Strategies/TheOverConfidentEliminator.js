const { suggest, accuse, Card } = require('../Clue.js');
const { sample } = require('lodash');
const TheEliminator = require('./TheEliminator');

/**
 |------------------------------------------
 | TheOverConfidentEliminator
 |------------------------------------------
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
 | If any suggestion goes all the way around the circle without being refuted,
 | then we got lucky and we can bet it's exactly right. We can eliminate all
 | the other cards.
 |
 | TheLuckyEliminator works this way too, but it is much more reserved. It only
 | treats its own suggestions as proof positive. TheOverConfidentEliminator
 | will treat anyone's suggestions as proof positive. That would make it fall
 | prey to a tricky strategy that includes its own cards in its suggestions.
 */
class TheOverConfidentEliminator extends TheEliminator
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
        // that caused errors when I tried the same thing in
        // TheOverConfidentSuggestionWatcher. So I fixed it like this and I
        // realized I could make the same change here with no downsides.
        //
        // Instead, we can duck punch the right answer into place.
        const {suspect, weapon, room} = suggestion;
        this.makeSuggestion = () => {
            return accuse(suspect, weapon, room);
        };
    }
}

module.exports = TheOverConfidentEliminator;
