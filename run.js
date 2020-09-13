const Tournament = require('./Tournament.js');
const ExampleStrategy = require('./Strategies/ExampleStrategy');
const SimpleStrategy = require('./Strategies/SimpleStrategy');
const SuggestiveStrategy = require('./Strategies/SuggestiveStrategy');
const { throttle } = require('lodash');

const strategies = {
    ExampleStrategy,
    SimpleStrategy,
    SuggestiveStrategy,
};

const tournament = new Tournament({
    strategies: Object.values(strategies),
});

const results = [];

const refreshUI = throttle(
    function () {
        const wins = Object.keys(strategies)
            .map(name => {
                const strategy = strategies[name];
                const count = results
                    .filter(result => result.winningStrategy === strategy)
                    .length;
                return `${name}: ${count}`;
            });
        const noWinners = results.filter(result => ! result.winningStrategy).length;
        wins.push(`No winner: ${noWinners}`);
        console.log(
            "Wins:\n  "
            + wins.join("\n  ")
        );
    },
    500
);

tournament.play(100, (result) => {
    results.push(result);
    refreshUI();
});
