const { suggest, accuse, Card } = require('../Clue.js');
const { sample } = require('lodash');

/**
 |---------------------
 | TheCardCounter
 |---------------------
 |
 */
class TheCardCounter
{
    constructor(hand, deck, game_summary)
    {
        this.hand = hand;
        this.deck = deck;
        this.game_summary = game_summary;
    }
}

class Counter
{
    constructor(deck, playerCount)
    {
        const holders = ['envelope'];
        for (let i = 0; i < playerCount; i++) {
            holders.push(i);
        }

        this.map = new SetMap();

        deck.forEach(card => {
            holders.forEach(location => {
                this.map.set([card, location], null);
            });
        });
    }

    markCardLocation(card, location)
    {
        for (let [key, value] of this.map.find([card])) {
            this.map.set(key, false);
        }
        this.map.set([card, location], true);
    }

    possibleCardsFor(location)
    {
        return [...this.map.find([location])]
            .filter(([key, value]) => {
                return value !== false;
            })
            .map(([key, value]) => {
                return key[0];
            });
    }
}

/**
 * A Map in which a value can be set with a Set as the key, and the same value
 * can be retrieved with a different Set of the same values.
 *
 * Array can be used instead of Set, and it's treated as a Set.
 *
 * It's also able to iterate through entries based on just partial sets as
 * keys.
 */
class SetMap
{
    constructor()
    {
        // keyKeys is a tree of maps. The maps can be used as keys in the
        // valueValues map.
        this.keyKeys = new Map();
        // valueValues is a map with the keys equal to maps from the keyKeys
        // map. The values are 2-value arrays. Element 0 and element 1 are the
        // key and value passed to `set`, except that element 0 is converted to
        // a Set object.
        this.valueValues = new Map();
    }

    get size()
    {
        return this.valueValues.size;
    }

    findOrCreateKeyKey(key)
    {
        key = [...key].sort();
        // Step down through the keyKeys, getting or creating&getting maps
        // along the way.
        return key.reduce(
            (map, keyPart) => map.get(keyPart) || (map.set(keyPart, new Map()) && map.get(keyPart)),
            this.keyKeys
        );
    }

    findAndDeleteKeyKey(key)
    {
        key = [...key].sort();
        // Make a reverse link chain that starts at the end of the chain to
        // the keyKey. Do this by working our way from the top down, and
        // wrapping each step in the next step as `up`.
        const chain = key.reduce(
            (up, keyPart) => {
                return {
                    up,
                    map: up.map && up.map.get(keyPart),
                    delete: () => up.map.delete(keyPart),
                };
            },
            {map: this.keyKeys}
        );
        // chain is now in this format
        // {
        //  map: mapAtBottom,
        //  delete(),
        //  up: {
        //      map: mapAtSecondToBottom,
        //      delete(),
        //      up: ...
        //  ...
        let link = chain;
        // Starting at the bottom, if it is an empty map, then we can delete
        // it. And then we can work our way up, deleting the next if it is
        // now empty. Or if it is not, then we know the rest of the way up will
        // not be empty.
        //
        // If there was no map, then there's no key and nothing is changing, so
        // nothing needs deleted up the chain.
        while (link.up && link.map && link.map.size === 0) {
            link.delete();
            link = link.up;
        }
        // We saved chain so we could return its map. If that map is null, then
        // the calling code will know that means there was no such key.
        return chain.map;
    }

    set(key, value)
    {
        key = new Set(key);
        const keyKey = this.findOrCreateKeyKey(key);
        this.valueValues.set(keyKey, [key, value]);
        return this;
    }

    get(key)
    {
        key = new Set(key);
        const keyKey = this.findOrCreateKeyKey(key);
        const value = this.valueValues.get(keyKey);
        return value && value[1];
    }

    has(key)
    {
        key = new Set(key);
        const keyKey = this.findOrCreateKeyKey(key);
        return this.valueValues.has(keyKey);
    }

    delete(key)
    {
        key = new Set(key);
        const keyKey = this.findAndDeleteKeyKey(key);
        if (keyKey) {
            return this.valueValues.delete(keyKey);
        } else {
            return false;
        }
    }

    entries()
    {
        return this.valueValues.values();
    }

    find(key)
    {
        const entries = this.entries();
        return {
            [Symbol.iterator]() {
                return this;
            },
            next: () => {
                const next = entries.next();
                while (!next.done) {
                    const nextKey = next.value[0];
                    if (this.keyMatches(key, nextKey)) {
                        return {done: false, value: next.value};
                    }
                }
                return {done: true};
            },
        };
    }

    keyMatches(test, key)
    {
        test = new Set(test);
        key = new Set(key);
        for (let element of test) {
            if (! key.has(element)) {
                return false;
            }
        }
        return true;
    }
}

TheCardCounter.Counter = Counter;
TheCardCounter.SetMap = SetMap;

module.exports = TheCardCounter;
