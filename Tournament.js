const { ClueGame, Deck } = require('./Clue.js');
const { sample } = require('lodash');

/**
 |----------------------
 | Tournament
 |----------------------
 | The tournament will arrange strategies and run a ClueGame to get them to play.
 |
 | Instantiate it with a config object:
 |   iterator   : provide a callback that builds a new iterator. The iterator
 |                  should have a next() method that returns an array of
 |                  strategies or null when it's done
 |   If `iterator` is not provided, provide these keys and a default iterator
 |   will be used:
 |   strategies : provide an array of strategy classes (unless you provide
 |                  `iterator`)
 |   min        : the lowest number of strategies to play in a game, default 3
 |   max        : the highest number of strategies to play in a game, default 6
 |
 | Call tournament.play(numberOfRounds, callback) to make it run. The callback
 | should receive an object that represents a completed game. The object has
 | these fields:
 |   winner     : A Strategy instantiation
 |   game       : A ClueGame instantiation
 |   strategies : An array of strategy classes
 |   winningStrategy : The strategy class of the winning player
 */
class Tournament
{
    constructor(config = {})
    {
        this.config = config;
        this.iterator = this.buildIterator();
    }

    buildIterator()
    {
        if (this.config.iterator) {
            return this.config.iterator();
        } else {
            return new PermutationIterator(this.config.strategies, this.config.min || 3, this.config.max || 6);
        }
    }

    play(rounds = 1, cb = null)
    {
        const results = [];
        for (let i = 0; i < rounds; i++) {
            let result;
            while (result = this.step()) {
                results.push(result);
                cb && cb(result);
            }
            this.iterator = this.buildIterator();
        }
        return results;
    }

    step()
    {
        const strategies = this.iterator.next();
        if (! strategies) {
            return null;
        }
        const game = new ClueGame(Deck.buildStandardDeck(), strategies);
        const winner = game.play();
        const winningStrategy = winner && strategies.filter(strategy => winner.constructor === strategy)[0];
        return {winner, game, strategies, winningStrategy};
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

class RandomIterator
{
    constructor(strategies, min, max, limit)
    {
        this.strategies = strategies;
        this.min = min;
        this.max = max;
        this.limit = limit;

        this.count = 0;
    }

    next()
    {
        if (this.count >= this.limit) {
            return null;
        }
        this.count++;

        const length = Math.round(Math.random() * (this.max - this.min)) + this.min;
        const strategies = [];
        for (let i = 0; i < length; i++) {
            strategies.push(sample(this.strategies));
        }
        return strategies;
    }
}

Tournament.PermutationIterator = PermutationIterator;
Tournament.RandomIterator = RandomIterator;

module.exports = Tournament;
