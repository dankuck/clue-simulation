const { suggest, accuse, Card } = require('../Clue.js');
const { sample } = require('lodash');
const SimpleStrategy = require('./SimpleStrategy');

/**
 * SuggestiveStrategy pays attention to both the cards it sees and the
 * suggestions it sees. When it sees other players refute suggestions for each
 * other, it remembers those suggestions and rechecks them until it can narrow
 * down just what card was shown. Then it operates in an elimination fashion,
 * just like SimpleStrategy.
 */
class SuggestiveStrategy extends SimpleStrategy
{
    constructor(hand, deck, game_summary)
    {
        super(hand, deck, game_summary);
        this.suggestions = [];
        this.holders = new Map();
        const position = game_summary.position;
        this.hand.forEach(card => this.markHolder(card, position));
    }

    allOutstanding()
    {
        return [
            ...this.suspects,
            ...this.weapons,
            ...this.rooms,
        ];
    }

    markHolder(card, player)
    {
        this.holders.set(card, player);
    }

    seeCard({card, player})
    {
        this.eliminate(card);
        this.markHolder(card, player);
        this.checkSavedSuggestions();
    }

    seeSuggestionAnswered({suggestion, player})
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
            this.markHolder(remaining[0], player);
            return true;
        } else {
            // Time to save the suggestion for later
            return false;
        }
    }
}

module.exports = SuggestiveStrategy;
