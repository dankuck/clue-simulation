const Tournament = require('./Tournament.js');
const ExampleStrategy = require('./Strategies/ExampleStrategy');
const SimpleStrategy = require('./Strategies/SimpleStrategy');
const SuggestiveStrategy = require('./Strategies/SuggestiveStrategy');
const { throttle } = require('lodash');
const RandomIterator = Tournament.RandomIterator;
const GameSet = require('./GameSet.js');

const strategies = {
    ExampleStrategy,
    SimpleStrategy,
    SuggestiveStrategy,
};

const tournament = new Tournament({
    // strategies: Object.values(strategies),
    iterator: () => new RandomIterator(
        Object.values(strategies),
        3,
        6,
        500
    ),
});

const results = new GameSet();

function round(n)
{
    if (n < .01 && n > 0) {
        return '<1%';
    } else if (n > .99 && n < 1) {
        return '>99%';
    } else {
        return Math.round(n * 100) + '%';
    }
}

const refreshUI = throttle(
    function () {
        const wins = buildWins();
        const noWinners = results.hasNoWinningStrategy().get().length;
        console.log(
            "Wins:\n"
            + '  ' + wins.join("\n").replace(/\n/g, "\n  ") + "\n"
            + `No winner: ${round(noWinners/results.count())}`
        );
    },
    500
);

/**
 * For each strategy, what was the proportion of wins, under different
 * conditions?
 */
function buildWins()
{
    return Object.keys(strategies)
        .map(name => {
            const strategy = strategies[name];
            const plays = results.hasStrategy(strategy);
            const wins = plays.hasWinningStrategy(strategy);
            const alonePlays = plays.hasStrategyAlone(strategy);
            const aloneWins = alonePlays.hasWinningStrategy(strategy);
            return `${name}: ${round(wins.count()/plays.count())}, ${round(aloneWins.count()/alonePlays.count())}\n`
                + "  Same Game:\n"
                + '    ' + buildSameGameComparisons(name, strategy, plays).join("\n").replace(/\n/g, "\n    ") + "\n"
                + "  Alone Same Game:\n"
                + '    ' + buildSameGameComparisons(name, strategy, alonePlays).join("\n").replace(/\n/g, "\n    ") + "\n"
                + "  Grudges:\n"
                + '    ' + buildGrudgeComparisons(name, strategy, plays).join("\n").replace(/\n/g, "\n    ") + "\n"
                + "  Alone Grudges:\n"
                + '    ' + buildGrudgeComparisons(name, strategy, alonePlays).join("\n").replace(/\n/g, "\n    ") + "\n"
                + "  Positions:\n"
                + '    ' + buildPositionStats(name, strategy, plays).join("\n").replace(/\n/g, "\n    ") + "\n"
                + "  Alone Positions:\n"
                + '    ' + buildPositionStats(name, strategy, alonePlays).join("\n").replace(/\n/g, "\n    ") + "\n"
                + "  Game Sizes:\n"
                + '    ' + buildGameSizeStats(name, strategy, plays).join("\n").replace(/\n/g, "\n    ") + "\n"
                + "  Alone Game Sizes:\n"
                + '    ' + buildGameSizeStats(name, strategy, alonePlays).join("\n").replace(/\n/g, "\n    ") + "\n"
                ;
        });
}

function wins(name, plays, strategy)
{
    const wins = plays.hasWinningStrategy(strategy);
    return `${name}: ${round(wins.count()/plays.count())}`;
}

/**
 * For each strategy that this strategy is in a game with, what was this
 * strategy's proportion of wins?
 */
function buildSameGameComparisons(name, strategy, plays)
{
    return Object.keys(strategies)
        .map(otherName => {
            const other = strategies[otherName];
            return wins(`vs ${otherName}`, plays.hasStrategy(other), strategy);
        });
}

/**
 * For each strategy that this strategy is in a game with, where either this
 * strategy of the other one was a winner, what was this strategy's proportion
 * of wins?
 */
function buildGrudgeComparisons(name, strategy, plays)
{
    return Object.keys(strategies)
        .map(otherName => {
            const other = strategies[otherName];
            return wins(
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
function buildPositionStats(name, strategy, plays)
{
    return [0, 1, 2, 3, 4, 5]
        .map(position => {
            return wins(`as #${position}`, plays.hasStrategyInPosition(strategy, position), strategy);
        });
}

/**
 * For each size of games, from 3 to 6 players, what was the proportion of wins
 * for this strategy?
 */
function buildGameSizeStats(name, strategy, plays)
{
    return [3, 4, 5, 6]
        .map(size => {
            return wins(`${size} players`, plays.hasGameSize(size), strategy);
        });
}

tournament.play(100, (result) => {
    results.add(result);
    refreshUI();
});
