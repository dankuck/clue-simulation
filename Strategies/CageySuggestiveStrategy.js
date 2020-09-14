const { suggest, accuse, Card } = require('../Clue.js');
const { sample } = require('lodash');
const SuggestiveStrategy = require('./SuggestiveStrategy');
const ShowSame = require('./ShowSameSubStrategy');

/**
 * Like SuggestiveStrategy but with some basic attempts to control what information escapes
 */
class CageySuggestiveStrategy extends SuggestiveStrategy
{
    constructor(...params)
    {
        super(...params);
        this.chooseCardToShow = ShowSame.buildChooseCardToShow();
    }
}

module.exports = CageySuggestiveStrategy;
