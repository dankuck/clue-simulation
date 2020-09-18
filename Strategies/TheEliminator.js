const { suggest, accuse, Card } = require('../Clue.js');
const { sample } = require('lodash');

/**
 |---------------------
 | TheEliminator
 |---------------------
 | TheEliminator makes random suggestions and eliminates the cards it is
 | shown until it has just one of each card. This operates very much like the
 | strategy prescribed in the Clue instructions.
 |
 | The only missing piece is that this strategy does NOT notice when it gets
 | everything right in a suggestion. This should happen 1/324 suggestions, so
 | this is somewhat debilitating.
 */
class TheEliminator
{
    constructor(hand, deck, game_summary)
    {
        this.hand = hand;
        this.suspects = deck.getSuspects();
        this.weapons = deck.getWeapons();
        this.rooms = deck.getRooms();
        this.hand.forEach(card => this.eliminate(card));
    }

    makeSuggestion()
    {
        if (this.suspects.length === 1 && this.weapons.length === 1 && this.rooms.length === 1) {
            return accuse(
                this.suspects[0],
                this.weapons[0],
                this.rooms[0]
            );
        } else {
            return suggest(
                sample(this.suspects),
                sample(this.weapons),
                sample(this.rooms)
            );
        }
    }

    seeCard({card})
    {
        this.eliminate(card);
    }

    eliminate(card)
    {
        this.suspects = this.suspects.filter(c => c != card);
        this.weapons = this.weapons.filter(c => c != card);
        this.rooms = this.rooms.filter(c => c != card);
    }
}

module.exports = TheEliminator;
