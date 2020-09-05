const { suggest, accuse, Card } = require('./Clue.js');
const ExampleStrategy = require('./ExampleStrategy.js');

/**
 * This strategy is not intended as an example. It is used internally to ensure
 * the test code and game code always send the data they are supposed to send.
 * Other stratgies do not need to test that stuff, because this strategy tested
 * it already. :)
 */
class TestTheTestStrategy
{
    constructor(hand, deck)
    {
        if (! hand) throw new Error('No hand given');
        if (! deck) throw new Error('No deck given');
        this.deck = deck;
    }

    move()
    {
        const suspect = this.deck.getSuspects()[0];
        const weapon  = this.deck.getWeapons()[0];
        const room    = this.deck.getRooms()[0];
        const func = Math.random() < .9 ? suggest : accuse;
        return func(suspect, weapon, room);
    }

    seeCard({suggestion, card, player})
    {
    }

    seeSuggestionAnswered({suggestion, player, asker})
    {
    }

    seeSuggestionSkipped({suggestion, player, asker})
    {
    }
}

module.exports = TestTheTestStrategy;
