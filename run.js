const Tournament = require('./Tournament.js');
const ExampleStrategy = require('./Strategies/ExampleStrategy');
const { throttle } = require('lodash');
const RandomIterator = Tournament.RandomIterator;
const GameSet = require('./GameSet.js');
const Breakdown = require('./analytics/Breakdown');
const HypothesisTester = require('./analytics/HypothesisTester');
const LeaderBoard = require('./analytics/LeaderBoard');

const strategies = require('./Strategies/allStrategies');

const analyses = {
    Breakdown,
    HypothesisTester,
    LeaderBoard,
};

const Analysis = analyses[process.argv[2]];

if (!Analysis) {
    throw new Error(`No argument or invalid argument at ${process.argv[2]}. Please choose one of ${Object.keys(analyses).join(', ')}.`);
}

const results = new GameSet();

const refreshUI = throttle(
    function () {
        console.log(
            '' + new Analysis(results, strategies)
        );
    },
    500
);

const tournament = new Tournament({
    iterator: () => new RandomIterator(
        Object.values(strategies),
        3,
        6,
        500
    ),
});

tournament.play(100, (result) => {
    results.add(result);
    refreshUI();
});
