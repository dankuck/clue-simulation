const { suggest, accuse, Card } = require('../Clue.js');
const ShowSame = require('./ShowSameSubStrategy');
const SimpleStrategy = require('./SimpleStrategy');

/**
 * This is like SimpleStrategy, with additional code to try to control what
 * cards get shown to others.
 */
class CageySimpleStrategy extends SimpleStrategy
{
    constructor(...params)
    {
        super(...params);
        this.chooseCardToShow = ShowSame.buildChooseCardToShow();
    }
}

module.exports = CageySimpleStrategy;
