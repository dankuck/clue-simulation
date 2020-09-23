const { suggest, accuse, Card, Hand } = require('../Clue.js');
const { sample } = require('lodash');

/**
 |---------------------
 | TheCardCounter
 |---------------------
 | This strategy is capable of deducing what cards a player or the envelope
 | holds by watching what cards it is shown and what players cannot show cards.
 |
 */
class TheCardCounter
{
    constructor(hand, deck, game_summary)
    {
        this.hand = hand;
        this.deck = deck;
        this.game_summary = game_summary;
        this.counter = new Counter(deck, game_summary.hands.map(hand => hand.length));
        this.suggestions = [];
        this.counter.markCardLocations(
            this.hand.map(
                card => [card, game_summary.position.toString(), true]
            )
        );
    }

    makeSuggestion()
    {
        const envelope = new Hand(this.counter.possibleCardsFor('envelope'));
        if (envelope.count() === 3) {
            return accuse(
                envelope.getSuspects()[0],
                envelope.getWeapons()[0],
                envelope.getRooms()[0]
            );
        } else {
            return suggest(
                sample(envelope.getSuspects()),
                sample(envelope.getWeapons()),
                sample(envelope.getRooms())
            );
        }
    }

    seeCard({suggestion, card, player})
    {
        this.counter.markCardLocation(card, player.toString(), true);
    }

    seeSuggestionNotRefuted({suggestion, player})
    {
        this.counter.markCardLocations([
            [suggestion.suspect, player.toString(), false],
            [suggestion.weapon, player.toString(), false],
            [suggestion.room, player.toString(), false],
        ]);
    }

    // seeSuggestionRefuted({suggestion, player})
    // {
    //     this.suggestions.unshift({suggestion, player});
    //     this.
    // }
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

    markCardLocation(...params)
    {
        this.markCardLocations([params]);
    }

    markCardLocations(many)
    {
        many.forEach(([card, location, correct]) => {
            if (![true, false].includes(correct)) {
                throw new TypeError('Bad value sent to markCardLocation');
            }
        });
        many.forEach(([card, location, correct]) => {
            this.map.set([card, location], correct);
        });
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
            // And finally we check whether the envelope only has one of any
            // particular card type possible. Since it can only have one of a
            // type, we know that's the answer.
            //
            // If any method makes a change, we loop around again, because that
            // change may create a cascade of updates.
            //
            // This is in no particular order, but if one of the early ones
            // makes a change, we short circuit and loop around again. This
            // reduces the size of each pass and theoretically reduces the
            // amount of work being done.
            changesWereMade = this.resolveUnknownCardLocations()
                || this.resolveUnknownLocationCards()
                || this.resolveUnknownEnvelopeCardsByType();
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

    resolveUnknownEnvelopeCardsByType()
    {
        let changesWereMade = false;
        const cards = this.possibleCardsFor('envelope');
        const typeGroups = [
            cards.filter(card => card.type === Card.SUSPECT),
            cards.filter(card => card.type === Card.WEAPON),
            cards.filter(card => card.type === Card.ROOM),
        ];
        typeGroups.forEach(typeGroup => {

            if (typeGroup.length === 1) {
                const card = typeGroup[0];
                if (this.map.get([card, 'envelope']) === UNKNOWN) {
                    this.map.set([card, 'envelope'], true);
                    changesWereMade = true;
                }
            }
        });
        return changesWereMade;
    }

    possibleLocationsFor(card)
    {
        return this.mapKeysIncluding(card, [true, UNKNOWN])
            .map(([card, location]) => location);
    }

    trueLocationsFor(card)
    {
        return this.mapKeysIncluding(card, [true])
            .map(([card, location]) => location);
    }

    allLocationsFor(card)
    {
        return this.mapKeysIncluding(card, [true, UNKNOWN, false])
            .map(([card, location]) => location);
    }

    possibleCardsFor(location)
    {
        return this.mapKeysIncluding(location, [true, UNKNOWN])
            .map(([card, location]) => card);
    }

    trueCardsFor(location)
    {
        return this.mapKeysIncluding(location, [true])
            .map(([card, location]) => card);
    }

    allCardsFor(location)
    {
        return this.mapKeysIncluding(location, [true, UNKNOWN, false])
            .map(([card, location]) => card);
    }

    allTrue()
    {
        return [...this.map.entries()]
            .filter(([key, value]) => value === true)
            .map(([key, value]) => key);
    }

    mapKeysIncluding(keyPart, values)
    {
        return [...this.map.entries()]
            .filter(([key, value]) => key.includes(keyPart) && values.includes(value))
            .map(([key, value]) => key);
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
            (map, keyPart) => map.get(keyPart) || (map.set(keyPart, new Map()), map.get(keyPart)),
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
