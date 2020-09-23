
function reverseMap(object)
{
    return Object.keys(object)
        .reduce(
            (map, key) => map.set(object[key], key),
            new Map()
        );
}

function arrangementString(result, strategies)
{
    const names = reverseMap(strategies);
    const strings = result.strategies
        .reduce(
            (set, strategy) => set.add(names.get(strategy)),
            new Set()
        );
    return Array.from(strings)
        .sort()
        .join(', ');
}

function arrangementStringWithQuantity(result, strategies)
{
    const names = reverseMap(strategies);
    const strings = {};
    result.strategies.forEach(strategy => {
        const string = names.get(strategy);
        if (strings[string]) {
            strings[string]++;
        } else {
            strings[string] = 1;
        }
    });
    return Object.keys(strings)
        .sort()
        .map(string => string + (strings[string] > 1 ? 'x' + strings[string] : ''))
        .join(',');
}

function round(n)
{
    if (isNaN(n)) {
        return '0/0';
    } else if (n < .01 && n > 0) {
        return '<1%';
    } else if (n > .99 && n < 1) {
        return '>99%';
    } else {
        return Math.round(n * 100) + '%';
    }
}

class Breakdown
{
    constructor(results, strategies)
    {
        this.results = results;
        this.strategies = strategies;
    }

    toString()
    {
        const wins = this.buildWins();
        const noWinners = this.results
            .hasNoWinningStrategy()
            .get()
            .length;
        return "Wins:\n"
            + '  ' + wins.join("\n").replace(/\n/g, "\n  ") + "\n"
            + `No winner: ${round(noWinners/this.results.count())}\n`
            // + this.buildArrangementWins()
            ;
    }

    /**
     * For each strategy, what was the proportion of wins, under different
     * conditions?
     */
    buildWins()
    {
        return Object.keys(this.strategies)
            .map(name => {
                const strategy = this.strategies[name];
                const plays = this.results.hasStrategy(strategy);
                const wins = plays.hasWinningStrategy(strategy);
                const alonePlays = plays.hasStrategyAlone(strategy);
                const aloneWins = alonePlays.hasWinningStrategy(strategy);
                return `${name}: ${round(wins.count()/plays.count())}, ${round(aloneWins.count()/alonePlays.count())}\n`
                    + "  Same Game:\n"
                    + '    ' + this.buildSameGameComparisons(name, strategy, plays).join("\n").replace(/\n/g, "\n    ") + "\n"
                    + "  Alone Same Game:\n"
                    + '    ' + this.buildSameGameComparisons(name, strategy, alonePlays).join("\n").replace(/\n/g, "\n    ") + "\n"
                    + "  Grudges:\n"
                    + '    ' + this.buildGrudgeComparisons(name, strategy, plays).join("\n").replace(/\n/g, "\n    ") + "\n"
                    + "  Alone Grudges:\n"
                    + '    ' + this.buildGrudgeComparisons(name, strategy, alonePlays).join("\n").replace(/\n/g, "\n    ") + "\n"
                    + "  Positions:\n"
                    + '    ' + this.buildPositionStats(name, strategy, plays).join("\n").replace(/\n/g, "\n    ") + "\n"
                    + "  Alone Positions:\n"
                    + '    ' + this.buildPositionStats(name, strategy, alonePlays).join("\n").replace(/\n/g, "\n    ") + "\n"
                    + "  Game Sizes:\n"
                    + '    ' + this.buildGameSizeStats(name, strategy, plays).join("\n").replace(/\n/g, "\n    ") + "\n"
                    + "  Alone Game Sizes:\n"
                    + '    ' + this.buildGameSizeStats(name, strategy, alonePlays).join("\n").replace(/\n/g, "\n    ") + "\n"
                    + "  Team Sizes:\n"
                    + '    ' + this.buildTeamSizeStats(name, strategy, plays).join("\n").replace(/\n/g, "\n    ") + "\n"
                    ;
            });
    }

    buildArrangementWins()
    {
        return this.results.groupBy(arrangementString)
            .map(group => {
                return `${group.name}\n`
                    + '  '
                    + Object.keys(this.strategies)
                        .map(
                            name => this.showWins(
                                name,
                                group.plays,
                                this.strategies[name]
                            )
                        )
                        .join("\n  ");
            })
            .join("\n");
    }

    showWins(name, plays, strategy)
    {
        const wins = plays.hasWinningStrategy(strategy);
        return `${name}: ${round(wins.count()/plays.count())}`;
    }

    /**
     * For each strategy that this strategy is in a game with, what was this
     * strategy's proportion of wins?
     */
    buildSameGameComparisons(name, strategy, plays)
    {
        return Object.keys(this.strategies)
            .map(otherName => {
                const other = this.strategies[otherName];
                return this.showWins(`vs ${otherName}`, plays.hasStrategy(other), strategy);
            });
    }

    /**
     * For each strategy that this strategy is in a game with, where either this
     * strategy or the other one was a winner, what was this strategy's proportion
     * of wins?
     */
    buildGrudgeComparisons(name, strategy, plays)
    {
        return Object.keys(this.strategies)
            .map(otherName => {
                const other = this.strategies[otherName];
                return this.showWins(
                    `vs ${otherName}`,
                    plays
                        .hasStrategy(other)
                        .hasWinningStrategyIn([strategy, other]),
                    strategy
                );
            });
    }

    /**
     * For each turn position that this strategy played as, first through last,
     * what was the proportion of wins?
     */
    buildPositionStats(name, strategy, plays)
    {
        return [0, 1, 2, 3, 4, 5]
            .map(position => {
                return this.showWins(`as #${position}`, plays.hasStrategyInPosition(strategy, position), strategy);
            });
    }

    /**
     * For each size of games, from 3 to 6 players, what was the proportion of wins
     * for this strategy?
     */
    buildGameSizeStats(name, strategy, plays)
    {
        return [3, 4, 5, 6]
            .map(size => {
                return this.showWins(`${size} players`, plays.hasGameSize(size), strategy);
            });
    }

    /**
     * When the strategy is found in groups, from 3 to 6 players, what was the
     * proportion of wins for this strategy?
     */
    buildTeamSizeStats(name, strategy, plays)
    {
        return [2, 3, 4, 5, 6]
            .map(size => {
                return this.showWins(`${size} players`, plays.hasTeamSize(strategy, size), strategy);
            });
    }

}

module.exports = Breakdown;

