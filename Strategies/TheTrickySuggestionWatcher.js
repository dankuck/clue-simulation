const { suggest, accuse, Card, Suggestion } = require('../Clue.js');
const { sample } = require('lodash');
const TheSuggestionWatcher = require('./TheSuggestionWatcher');

/**
 |------------------------------------------
 | TheTrickySuggestionWatcher
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
 | TheSuggestionWatcher has another data leak: it only makes suggestions
 | including cards it does not have.
 |
 | This version will make sure its suggestions sometimes include cards from its
 | own hand.
 */
class TheTrickySuggestionWatcher extends TheSuggestionWatcher
{
    constructor(hand, deck, game_summary)
    {
        super(hand, deck, game_summary);
        this.hand = hand;
    }

    makeSuggestion()
    {
        const suggestion = super.makeSuggestion();
        if (suggestion.type === Suggestion.ACCUSATION) {
            // If we have the answer, then we should just give it
            return suggestion;
        }
        // If we know one of the correct cards, we want to avoid giving away
        // the game by naming that card. The best situation would be if we
        // could trick other strategies.
        //
        // 1. If we can choose a replacement card from our own hand, we can
        // trick any other strategies that notice completely unrefuted
        // suggestions.
        //
        // 2. If we don't have anything from our own hand for that, we can at
        // least use something random from the deck.
        //
        // We only bother to do this to one card, since all we want to ensure
        // is that the suggestion won't be exactly right.
        if (this.suspects.length === 1) {
            return suggest(
                sample(this.hand.getSuspects()) || sample(this.deck.getSuspects()),
                suggestion.weapon,
                suggestion.room,
            );
        } else if (this.weapons.length === 1) {
            return suggest(
                suggestion.suspect,
                sample(this.hand.getWeapons()) || sample(this.deck.getWeapons()),
                suggestion.room,
            );
        } else if (this.rooms.length === 1) {
            return suggest(
                suggestion.suspect,
                suggestion.weapon,
                sample(this.hand.getRooms()) || sample(this.deck.getRooms()),
            );
        } else {
            return suggestion;
        }
    }
}

module.exports = TheTrickySuggestionWatcher;
