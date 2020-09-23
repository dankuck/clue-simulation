const { suggest, accuse, Card, Hand, Suggestion } = require('../Clue.js');
const { sample } = require('lodash');
const TheCardCounter = require('./TheCardCounter');

/**
 |------------------------------------------
 | TheSuggestionWatcherCardCounter
 |------------------------------------------
 | The strategy combines the features of TheCardCounter and
 | TheSuggestionWatcher.
 |
 | Here are TheCardCounter's docs:
 |   This strategy is capable of deducing what cards a player or the envelope
 |   holds by watching what cards it is shown and which players cannot show
 |   cards.
 |
 |   This first version does not try to figure out what card is shown when
 |   other players show each other cards, like in TheSuggestionWatcher. It is
 |   not yet capable of that so that it can be compared.
 |
 |   Even still, it is the best strategy at the time of its writing.
 |
 | We're gonna see if we can do better by watching for suggestions. If we can
 | deduce the card, we do. Otherwise we keep suggestions for later and try to
 | deduce the card after something changes.
 |
 | It doesn't make a big difference. Likely due to giving away the game. A lot
 | of the best strategies approach the answer quickly but aren't savvy enough
 | to hide what they know. Then the OverConfident strategies win it when they
 | randomly give it away.
 */
class TheSuggestionWatcherCardCounter extends TheCardCounter
{
    constructor(hand, deck, game_summary)
    {
        super(hand, deck, game_summary);
        this.suggestions = [];
    }

    seeCard(params)
    {
        super.seeCard(params);
        this.solveSavedSuggestions();
    }

    seeSuggestionNotRefuted(params)
    {
        super.seeSuggestionNotRefuted(params);
        this.solveSavedSuggestions();
    }

    seeSuggestionRefuted({suggestion, player})
    {
        this.suggestions.unshift({suggestion, player});
        this.solveSavedSuggestions();
    }

    solveSavedSuggestions()
    {
        let before, after;
        do {
            before = this.suggestions.length;
            this.suggestions = this.suggestions
                .filter(saved => ! this.solveSuggestion(saved));
            after = this.suggestions.length;
        } while (before != after);
    }

    solveSuggestion({suggestion, player})
    {
        const cards = [
            suggestion.suspect,
            suggestion.weapon,
            suggestion.room,
        ];
        // If we already recognize one card as belonging to the given player,
        // then we cannot gain more knowledge from this suggestion.
        const alreadyKnow = cards
            .filter(card => this.counter.cardIsInLocation([card, player.toString()]))
            .length > 0;
        if (alreadyKnow) {
            return true;
        }
        const remaining = cards.filter(card => this.counter.cardIsNotInLocation([card, player.toString()]));
        if (remaining.length === 1) {
            const card = remaining[0];
            // Then we know that must be the card that was shown
            this.markCardLocation(card, player.toString(), true);
            return true;
        } else {
            // Time to save the suggestion for later
            return false;
        }
    }
}

module.exports = TheSuggestionWatcherCardCounter;

