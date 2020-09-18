const { suggest, accuse, Card } = require('../Clue.js');
const { sample } = require('lodash');
const TheEliminator = require('./TheEliminator');

/**
 |---------------------
 | TheSuggestionWatcher
 |---------------------
 | TheSuggestionWatcher works on elimination, just like TheEliminator, however
 | it pays attention to what other players are doing. If it sees another player
 | A show a card to another player B, TheSuggestionWatcher attempts to deduce
 | what card was shown based on its knowledge about what cards are known to NOT
 | be held by player A.
 |
 | If it cannot deduce the card, it remembers the event for later, and
 | reattempts the deduction.
 |
 | This strategy does NOT notice when other players CANNOT refute a suggestion.
 | Since that can also help us to deduce a card, this failure is debilitating.
 */
class TheSuggestionWatcher extends TheEliminator
{
    constructor(hand, deck, game_summary)
    {
        super(hand, deck, game_summary);
        this.suggestions = [];
        this.holders = new Map();
        const position = game_summary.position;
        this.hand.forEach(card => this.markCardHolder(card, position));
    }

    allOutstanding()
    {
        return [
            ...this.suspects,
            ...this.weapons,
            ...this.rooms,
        ];
    }

    markCardHolder(card, player)
    {
        this.holders.set(card, player);
    }

    seeCard({card, player})
    {
        this.eliminate(card);
        this.markCardHolder(card, player);
        this.checkSavedSuggestions();
    }

    seeSuggestionRefuted({suggestion, player})
    {
        const solved = this.solveSuggestion({suggestion, player});
        if (! solved) {
            // Time to save the suggestion for later
            this.suggestions.push({suggestion, player});
        }
    }

    checkSavedSuggestions()
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
            .filter(card => this.holders.get(card) === player)
            .length > 0;
        if (alreadyKnow) {
            return true;
        }
        const outstanding = this.allOutstanding();
        const remaining = cards.filter(card => outstanding.includes(card));
        if (remaining.length === 1) {
            // Then we know that must be the card that was shown
            this.eliminate(remaining[0]);
            this.markCardHolder(remaining[0], player);
            return true;
        } else {
            // Time to save the suggestion for later
            return false;
        }
    }
}

module.exports = TheSuggestionWatcher;
