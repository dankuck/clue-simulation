const { suggest, accuse, Card, Hand } = require('../Clue.js');
const { sample } = require('lodash');

const nonreentrant = function (func) {
    let working = false;
    return function (...params) {
        if (working) {
            return;
        }
        working = true;
        const result = func.call(this, ...params);
        working = false;
        return result;
    };
};

/**
 |---------------------
 | TheCardCounter
 |---------------------
 | This strategy is capable of deducing what cards a player or the envelope
 | holds by watching what cards it is shown and which players cannot show
 | cards.
 |
 | This first version does not try to figure out what card is shown when
 | other players show each other cards, like in TheSuggestionWatcher. That's
 | left out so that we can compare to a version where we add it.
 |
 | Even without that, it is the best strategy at the time of its writing.
 */
class TheCardCounter
{
    constructor(hand, deck, game_summary)
    {
        this.hand = hand;
        this.deck = deck;
        this.game_summary = game_summary;
        this.counter = new Counter(deck, game_summary.hands.map(hand => hand.length));
        this.hand.forEach(
            card => this.counter.markCardLocation(card, game_summary.position.toString(), true)
        );
    }

    /**
     * All the cards that might be in the envelope, in a Hand
     */
    getEnvelope()
    {
        return new Hand(this.counter.possibleCardsFor('envelope'));
    }

    makeSuggestion()
    {
        const envelope = this.getEnvelope();
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
        this.counter.markCardLocation(suggestion.suspect, player.toString(), false);
        this.counter.markCardLocation(suggestion.weapon, player.toString(), false);
        this.counter.markCardLocation(suggestion.room, player.toString(), false);
    }
}

const UNKNOWN = {};

class Counter
{
    constructor(deck, playerCounts)
    {
        this.resolveUnknowns = nonreentrant(this.resolveUnknowns);
        this.complexityScore = 0;
        this.cardChanges = new Set();
        this.locationChanges = new Set();

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

    cardIsInLocation(card, location)
    {
        this.resolveUnknowns();
        return this.map.get([card, location]) === true;
    }

    cardIsNotInLocation(card, location)
    {
        this.resolveUnknowns();
        return this.map.get([card, location]) === false;
    }

    markCardLocation(card, location, correct)
    {
        if (![true, false].includes(correct)) {
            throw new TypeError('Bad value sent to markCardLocation');
        }
        this.map.set([card, location], correct);
        // The key to this tool is that after changes are made, we check all of
        // our unknowns to see if any of them can become known. But we don't
        // need to do that until someone wants the information. All we need to
        // do is remember that the data needs to be reviewed.
        this.cardChanges.add(card);
        this.locationChanges.add(location);
    }

    resolveUnknowns()
    {
        while (this.cardChanges.size > 0 || this.locationChanges.size > 0) {

            for (let card of this.cardChanges) {
                // This can add to locationChanges
                this.resolveUnknownCardLocations(card);
            }
            this.cardChanges.clear();

            for (let location of this.locationChanges) {
                // This can add to cardChanges
                this.resolveUnknownLocationCards(location);
            }
            this.locationChanges.clear();

            // Oh, don't forget to check the envelope. Unlike regular hands, it
            // only ever has one of each card type at a time. We can use that
            // fact to deduce cards within a type.
            //
            // This can add to cardChanges
            this.resolveUnknownEnvelopeCardsByType();

            // Since the above methods could have added to cardChanges or
            // locationChanges, we need to check again. When no more changes
            // are needed, no cards and locations will be added, and we can
            // stop looping.
        }
    }

    resolveUnknownCardLocations(card)
    {
        const yes = [];
        const no = [];
        const unknown = [];
        this.allLocationsFor(card)
            .forEach(location => {
                this.complexityScore++;
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
                    location => {
                        this.map.set([card, location], false);
                        this.locationChanges.add(location);
                    }
                );
            } else if (unknown.length === 1) {
                const location = unknown[0];
                this.map.set([card, location], true);
                this.locationChanges.add(location);
            }
        }
    }

    resolveUnknownLocationCards(location)
    {
        const count = this.counts[location];
        const yes = [];
        const no = [];
        const unknown = [];
        this.allCardsFor(location)
            .forEach(card => {
                this.complexityScore++;
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
                    card => {
                        this.map.set([card, location], false);
                        this.cardChanges.add(card);
                    }
                );
            } else if (unknown.length + yes.length === count) {
                unknown.forEach(
                    card => {
                        this.map.set([card, location], true);
                        this.cardChanges.add(card);
                    }
                );
            }
        }
    }

    resolveUnknownEnvelopeCardsByType()
    {
        const cards = this.possibleCardsFor('envelope');
        const typeGroups = [
            cards.filter(card => card.type === Card.SUSPECT),
            cards.filter(card => card.type === Card.WEAPON),
            cards.filter(card => card.type === Card.ROOM),
        ];
        typeGroups.forEach(typeGroup => {
            this.complexityScore++;
            if (typeGroup.length === 1) {
                const card = typeGroup[0];
                if (this.map.get([card, 'envelope']) === UNKNOWN) {
                    this.map.set([card, 'envelope'], true);
                    this.cardChanges.add(card);
                }
            }
        });
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
        this.resolveUnknowns();
        return [...this.map.entries()]
            .filter(([key, value]) => value === true)
            .map(([key, value]) => key);
    }

    mapKeysIncluding(keyPart, values)
    {
        this.resolveUnknowns();
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
