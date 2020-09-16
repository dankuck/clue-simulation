const { suggest, accuse, Card } = require('../Clue.js');
const ShowSameSubStrategy = require('./ShowSameSubStrategy');
const SimpleStrategy = require('./SimpleStrategy');

/**
 |--------------------------
 | CageySimpleStrategy
 |--------------------------
 | This works like SimpleStrategy, which has docs that read:
 |
 |   SimpleStrategy makes random suggestions and eliminates the cards it is
 |   shown until it has just one of each card. This operates very much like the
 |   strategy prescribed in the Clue instructions.
 |
 |   The only missing piece is that this strategy does NOT notice when it gets
 |   everything right in a suggestion. This should happen 1/324 suggestions, so
 |   this is somewhat debilitating.
 |
 | CageySimpleStrategy also uses ShowSameSubStrategy to ensure the same card is
 | shown each time the same other-player asks for it.
 |
 | ShowSameSubStrategy has docs that read:
 |
 |   When the ClueGame asks a player what card they'd like to show, a strategy
 |   class can use this to decide.
 |
 |   The strategy should keep an instance of ShowSameSubStrategy so
 |   ShowSameSubStrategy can learn what choices have been made before.
 |
 |   If no cards have ever been shown, we just pick one at random. Then we
 |   remember which one it was.
 |
 |   If the current other-player has never asked for a card before, then
 |   we check if we've shown anyone any of the cards they're asking for. If we
 |   have already shown one to someone else before, we show the same one to
 |   the new other-player. We remember this too.
 |
 |   If the same player asks about the same card again, we show the same card.
 |
 |   In this way we attempt to ensure that, if we have a choice, we choose
 |   cards that release the least information to the other players
 */
class CageySimpleStrategy extends SimpleStrategy
{
    constructor(...params)
    {
        super(...params);
        this.showSame = new ShowSameSubStrategy();
    }

    chooseCardToShow(card, askerId)
    {
        return this.showSame.chooseCardToShow(card, askerId);
    }
}

module.exports = CageySimpleStrategy;
