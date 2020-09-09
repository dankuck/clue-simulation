const { ClueGame, Deck } = require('./Clue.js');

class Tournament
{
    constructor(config = {})
    {
        const Iterator = config.iterator || PermutationIterator;
        this.iterator = new Iterator(config.strategies, 3, 6);
    }

    step()
    {
        const strategies = this.iterator.next();
        if (! strategies) {
            return null;
        }
        const game = new ClueGame(Deck.buildStandardDeck(), strategies);
        const winner = game.play();
        return {winner, game, strategies};
    }
}

class PermutationIterator
{
    constructor(strategies, min, max)
    {
        this.strategies = strategies;
        this.min = min;
        this.max = max;
        this.indexes = this.buildStart(this.min);
    }

    buildStart(n)
    {
        const arr = [];
        for (let i = 0; i < n; i++) {
            arr.push(0);
        }
        return arr;
    }

    advance()
    {
        let i;
        for (i = this.indexes.length - 1; i >= 0; i--) {
            if (this.indexes[i] >= this.strategies.length - 1) {
                this.indexes[i] = 0;
            } else {
                this.indexes[i]++;
                return;
            }
        }
        // If we got here, we never found an index that needed ++ing, so time
        // to restart with a bigger array
        this.indexes = this.buildStart(this.indexes.length + 1);
        if (this.indexes.length > this.max) {
            this.indexes = null;
        }
    }

    done()
    {
        return ! this.indexes;
    }

    next()
    {
        if (this.done()) {
            return null;
        }
        const next = this.indexes.map(index => this.strategies[index]);
        this.advance();
        return next;
    }
}

Tournament.PermutationIterator = PermutationIterator;

module.exports = Tournament;
