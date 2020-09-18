const Tournament = require('./Tournament.js');
const ExampleStrategy = require('./Strategies/ExampleStrategy');
const TheEliminator = require('./Strategies/TheEliminator');
const TheLuckyEliminator = require('./Strategies/TheLuckyEliminator');
const TheSuggestionWatcher = require('./Strategies/TheSuggestionWatcher');
const TheCageySuggestionWatcher = require('./Strategies/TheCageySuggestionWatcher');
const TheCageyEliminator = require('./Strategies/TheCageyEliminator');
const { throttle } = require('lodash');
const RandomIterator = Tournament.RandomIterator;
const GameSet = require('./GameSet.js');
const Breakdown = require('./analytics/Breakdown');
const HypothesisTester = require('./analytics/HypothesisTester');

const strategies = {
    // ExampleStrategy,
    TheEliminator,
    TheCageyEliminator,
    TheLuckyEliminator,
    TheSuggestionWatcher,
    TheCageySuggestionWatcher,
};

const analyses = {
    Breakdown,
    HypothesisTester,
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
