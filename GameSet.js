
class Query
{
    constructor(get)
    {
        let got;
        this.get = () => {
            if (!got) {
                got = get();
            }
            return got;
        };
    }

    count()
    {
        return this.get().length;
    }

    hasStrategy(strategy)
    {
        return new Query(
            () => this.get()
                .filter(
                    result => result.strategies.includes(strategy)
                )
        );
    }

    doesntHaveStrategy(strategy)
    {
        return new Query(
            () => this.get()
                .filter(
                    result => ! result.strategies.includes(strategy)
                )
        );
    }

    hasWinningStrategy(strategy)
    {
        return new Query(
            () => this.get()
                .filter(
                    result => result.winningStrategy === strategy
                )
        );
    }

    hasNoWinningStrategy(strategy)
    {
        return new Query(
            () => this.get()
                .filter(
                    result => ! result.winningStrategy
                )
        );
    }

    hasWinningStrategyIn(strategies)
    {
        return new Query(
            () => this.get()
                .filter(
                    result => strategies.includes(result.winningStrategy)
                )
        );
    }

    hasStrategyInPosition(strategy, position)
    {
        return new Query(
            () => this.get()
                .filter(
                    result => result.strategies[position] === strategy
                )
        );
    }

    hasOnlyStrategies(strategies)
    {
        return new Query(
            () => this.get()
                .filter(
                    result => result.strategies
                        .reduce(
                            (agg, strategy) => agg && strategies.includes(strategy),
                            true
                        )
                )
        );
    }

    hasGameSize(size)
    {
        return new Query(
            () => this.get()
                .filter(
                    result => result.strategies.length === size
                )
        );
    }

    hasStrategyAlone(strategy)
    {
        return this.hasTeamSize(strategy, 1);
    }

    hasTeamSize(strategy, count)
    {
        return new Query(
            () => this.get()
                .filter(
                    result => result.strategies
                        .filter(s => s === strategy)
                        .length === count
                )
        );
    }

    groupBy(groupNamer)
    {
        if (! (groupNamer instanceof Function)) {
            const field = groupNamer;
            groupNamer = result => result[field];
        }
        const groups = {};
        this.get()
            .forEach(result => {
                const name = groupNamer(result);
                if (!groups[name]) {
                    groups[name] = [];
                }
                groups[name].push(result);
            });
        return Object.keys(groups)
            .sort()
            .map(name => {
                return {
                    name,
                    plays: new Query (
                        () => this.get()
                            .filter(result => groupNamer(result) === name)
                    ),
                };
            });
    }
}

class GameSet
{
    constructor()
    {
        this.items = [];
    }

    add(item)
    {
        this.items.push(item);
    }

    get()
    {
        return [...this.items];
    }

    query()
    {
        return new Query(() => this.items);
    }
}
// You can call any Query method straight from GameSet because of this magic
// right here.
Object.getOwnPropertyNames(Query.prototype)
    .forEach(method => {
        GameSet.prototype[method] = function (...params) {
            return this.query()[method](...params);
        };
    });


module.exports = GameSet;
