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
        this.deck = deck;

        Object.keys(this.counts).forEach(location => {
            deck.forEach(card => {
                this.map.set([card, location], UNKNOWN);
            });
        });
    }

    markCardLocation(card, location, correct)
    {
        this.map.set([card, location], correct);
        // The key to this tool is that every time we make any change, we check
        // all of our unknowns to see if any of them can become known.
        this.resolveUnknowns();
    }

    resolveUnknowns()
    {
        let changesWereMade = true;
        while (changesWereMade) {
            // We check all the cards that have unknown locations, to see if
            // our new information reduced the unknowns so that they must add
            // up a particular way.
            //
            // And we check all the locations that have unknown cards, to see
            // if our new information reduced the unknowns to that they must
            // add up a particular way.
            //
            // If either one makes a change, we loop around again, because that
            // change may create a wave of updates.
            //
            // This is in no particular order, but if the first one makes a
            // change, we short circuit and loop around again. This reduces
            // the size of each pass and theoretically reduces the amount of
            // work being done.
            changesWereMade = this.resolveUnknownCardLocations()
                || this.resolveUnknownLocationCards();
        }
    }

    resolveUnknownCardLocations()
    {
        let changesWereMade = false;
        this.deck.forEach(card => {
            const yes = [];
            const no = [];
            const unknown = [];
            this.allLocationsFor(card)
                .forEach(location => {
                    const value = this.map.get([card, location]);
                    if (value === true) {
                        yes.push(location)
                    } else if (value === false) {
                        no.push(location);
                    } else if (value === UNKNOWN) {
                        unknown.push(location);
                    }
                });
            if (unknown.length > 0) {
                if (yes.length === 1) {
                    unknown.forEach(
                        location => this.map.set([card, location], false)
                    );
                    changesWereMade = true;
                } else if (unknown.length === 1) {
                    this.map.set([card, unknown[0]], true);
                    changesWereMade = true;
                }
            }
        });
        return changesWereMade;
    }

    resolveUnknownLocationCards()
    {
        let changesWereMade = false;
        Object.keys(this.counts).forEach(location => {
            const count = this.counts[location];
            const yes = [];
            const no = [];
            const unknown = [];
            this.allCardsFor(location)
                .forEach(card => {
                    const value = this.map.get([card, location]);
                    if (value === true) {
                        yes.push(card)
                    } else if (value === false) {
                        no.push(card);
                    } else if (value === UNKNOWN) {
                        unknown.push(card);
                    }
                });
            if (unknown.length > 0) {
                if (yes.length === count) {
                    unknown.forEach(
                        card => this.map.set([card, location], false)
                    );
                    changesWereMade = true;
                } else if (unknown.length + yes.length === count) {
                    unknown.forEach(
                        card => this.map.set([card, location], true)
                    );
                    changesWereMade = true;
                }
            }
        });
        return changesWereMade;
    }

    possibleLocationsFor(searchCard)
    {
        return this
            .find(
                ([card, location, correct]) => searchCard === card && correct !== false
            )
            .map(([card, location, correct]) => location);
    }

    knownLocationsFor(searchCard)
    {
        return this
            .find(
                ([card, location, correct]) => searchCard === card && correct === true
            )
            .map(([card, location, correct]) => location);
    }

    allLocationsFor(searchCard)
    {
        return this
            .find(
                ([card, location, correct]) => searchCard === card
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

    allCardsFor(searchLocation)
    {
        return this
            .find(
                ([card, location, correct]) => searchLocation === location
            )
            .map(([card, location, correct]) => card);
    }

    allKnown()
    {
        return this.find(([card, location, value]) => value === true);
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
