const { sample } = require('lodash');

module.exports = {
    buildChooseCardToShow()
    {
        const shown = {};

        function alreadyShown(cards, askerId)
        {
            if (shown[askerId]) {
                const seen = cards.filter(card => shown[askerId].has(card));
                if (seen.length > 0) {
                    return seen;
                }
            }
            return null;
        }

        function addShown(card, askerId)
        {
            if (! shown[askerId]) {
                shown[askerId] = new Set();
            }
            shown[askerId].add(card);
        }

        return function chooseCardToShow(cards, askerId) {
            const previousForAsker = alreadyShown(cards, askerId);
            const previousForAnyone = alreadyShown(cards, '*');

            const showing = sample(previousForAsker || previousForAnyone || cards);

            addShown(showing, askerId);
            addShown(showing, '*');

            return showing;
        }
    },
};
