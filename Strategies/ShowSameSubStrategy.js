const { sample } = require('lodash');

/**
 |---------------------
 | ShowSameSubStrategy
 |---------------------
 | When the ClueGame asks a player what card they'd like to show, a strategy
 | class can use this to decide.
 |
 | The strategy should keep an instance of ShowSameSubStrategy so
 | ShowSameSubStrategy can learn what choices have been made before.
 |
 | If no cards have ever been shown, we just pick one at random. Then we
 | remember which one it was.
 |
 | If the current other-player has never asked for a card before, then
 | we check if we've shown anyone any of the cards they're asking for. If we
 | have already shown one to someone else before, we show the same one to the
 | new other-player. We remember this too.
 |
 | If the same player asks about the same card again, we show the same card.
 |
 | In this way we attempt to ensure that, if we have a choice, we choose cards
 | that release the least information to the other players.
 */
class ShowSameSubStrategy
{
    constructor()
    {
        this.shown = {};
    }

    chooseCardToShow(cards, askerId)
    {
        const previousForAsker = this.alreadyShown(cards, askerId);
        const previousForAnyone = this.alreadyShown(cards, '*');

        const showing = sample(previousForAsker || previousForAnyone || cards);

        this.addShown(showing, askerId);
        this.addShown(showing, '*');

        return showing;
    }

    alreadyShown(cards, askerId)
    {
        if (this.shown[askerId]) {
            const seen = cards
                .filter(
                    card => this.shown[askerId].has(card)
                );
            if (seen.length > 0) {
                return seen;
            }
        }
        return null;
    }

    addShown(card, askerId)
    {
        if (! this.shown[askerId]) {
            this.shown[askerId] = new Set();
        }
        this.shown[askerId].add(card);
    }
}


module.exports = ShowSameSubStrategy;
