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

const UNKNOWN = {};

class Counter
{
    constructor(deck, playerCounts)
    {
        this.counts = {
            envelope: 3,
            ...playerCounts,
        };

        this.map = new ArrayMap();

        Object.keys(this.counts).forEach(location => {
            deck.forEach(card => {
                this.map.set([card, location], UNKNOWN);
            });
        });
    }

    markCardLocation(card, location)
    {
        this.markCardLocationsFalse(card);
        this.map.set([card, location], true);
    }

    markCardLocationsFalse(card)
    {
        this.possibleLocationsFor(card)
            .forEach(location => this.map.set([card, location], false));
    }

    markCardLocationFalse(card, location)
    {
        this.map.set([card, location], false);
        const possibleLocations = this.possibleLocationsFor(card);
        if (possibleLocations.length === 1) {
            const [correctLocation] = possibleLocations;
            this.map.set([card, correctLocation], true);
        }
    }

    possibleLocationsFor(searchCard)
    {
        return this
            .find(
                ([card, location, correct]) => searchCard === card && correct !== false
            )
            .map(([card, location, correct]) => location);
    }

    possibleCardsFor(searchLocation)
    {
        return this
            .find(
                ([card, location, correct]) => searchLocation === location && correct !== false
            )
            .map(([card, location, correct]) => card);
    }

    knownCardsFor(searchLocation)
    {
        return this
            .find(
                ([card, location, correct]) => searchLocation === location && correct === true
            )
            .map(([card, location, correct]) => card);
    }

    find(cb)
    {
        return [...this.map.entries()]
            .map(([[card, location], value]) => [card, location, value])
            .filter(cb);
    }
}

/**
 * A Map in which a value can be set with an Array as the key, and the same
 * value can be retrieved with a different Array of the same values in the same
 * order.
 *
 * It's also able to iterate through entries based on just partial arrays as
 * keys.
 */
class ArrayMap
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
        // Step down through the keyKeys, getting or creating&getting maps
        // along the way.
        return key.reduce(
            (map, keyPart) => map.get(keyPart) || (map.set(keyPart, new Map()) && map.get(keyPart)),
            this.keyKeys
        );
    }

    findKeyKey(key)
    {
        // Step down through the keyKeys, getting or skipping maps along the
        // way.
        return key.reduce(
            (map, keyPart) => map && map.get(keyPart),
            this.keyKeys
        );
    }

    findAndDeleteKeyKey(key)
    {
        // Make a reverse link chain that starts at the end of the chain to
        // the keyKey. Do this by working our way from the top down, and
        // wrapping each step in the next step as `up`. Skip any missing data.
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
        const keyKey = this.findOrCreateKeyKey(key);
        this.valueValues.set(keyKey, [key, value]);
        return this;
    }

    get(key)
    {
        const keyKey = this.findOrCreateKeyKey(key);
        const value = this.valueValues.get(keyKey);
        return value && value[1];
    }

    has(key)
    {
        const keyKey = this.findKeyKey(key);
        return this.valueValues.has(keyKey);
    }

    delete(key)
    {
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
}

TheCardCounter.Counter = Counter;
TheCardCounter.ArrayMap = ArrayMap;

module.exports = TheCardCounter;
