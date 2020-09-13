const { suggest, accuse, Card } = require('../Clue.js');
const { sample } = require('lodash');

/**
 * SimpleStrategy uses a simple process of elimination using only the cards
 * that it is shown. It makes suggestions using random cards that have no been
 * eliminated and it makes an accusation only when one card of each type
 * remains.
 */
class SimpleStrategy
{
    constructor(hand, deck, game_summary)
    {
        this.hand = hand;
        this.suspects = deck.getSuspects();
        this.weapons = deck.getWeapons();
        this.rooms = deck.getRooms();
        this.hand.forEach(card => this.eliminate(card));
    }

    move()
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

module.exports = SimpleStrategy;
