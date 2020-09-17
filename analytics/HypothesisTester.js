const TheEliminator = require('../Strategies/TheEliminator');
const TheSuggestionWatcher = require('../Strategies/TheSuggestionWatcher');
const TheCageySuggestionWatcher = require('../Strategies/TheCageySuggestionWatcher');
const TheCageyEliminator = require('../Strategies/TheCageyEliminator');

class HypothesisTester
{
    constructor(results, strategies)
    {
        this.results = results;
        this.strategies = strategies;
    }

    toString()
    {
        return [
            this.compareEliminatorsHeadToHead(),
            this.compareEliminatorsSeparately(),
            this.compareSuggestionWatchersHeadToHead(),
            this.compareSuggestionWatchersSeparately(),
            this.compareEliminatorHeadToHeadWithSuggestionWatcher(),
            '================================================================',
        ].join("\n");
    }

    compareEliminatorsHeadToHead()
    {
        const lines = [];
        lines.push(
            "TheCageyEliminator should do better head-to-head than TheEliminator:"
        );
        const gamesWithBoth = this.results
                .hasStrategy(TheCageyEliminator)
                .hasStrategy(TheEliminator);
        lines.push(
            '  TheCageyEliminator '
            + gamesWithBoth.hasWinningStrategy(TheCageyEliminator).count()
            + ' : '
            + gamesWithBoth.hasWinningStrategy(TheEliminator).count()
            + ' TheEliminator'
        );
        return lines.join("\n");
    }

    compareEliminatorsSeparately()
    {
        const lines = [];
        lines.push(
            "TheCageyEliminator should do better against others than TheEliminator:"
        );
        const gamesCageyWon = this.results
            .doesntHaveStrategy(TheEliminator)
            .hasWinningStrategy(TheCageyEliminator);
        const gamesRegularWon = this.results
            .doesntHaveStrategy(TheCageyEliminator)
            .hasWinningStrategy(TheEliminator);
        lines.push(
            '  TheCageyEliminator '
            + gamesCageyWon.count()
            + ' : '
            + gamesRegularWon.count()
            + ' TheEliminator'
        );
        return lines.join("\n");
    }

    compareSuggestionWatchersHeadToHead()
    {
        const lines = [];
        lines.push(
            "TheCageySuggestionWatcher should do better head-to-head than TheSuggestionWatcher:"
        );
        const gamesWithBoth = this.results
                .hasStrategy(TheCageySuggestionWatcher)
                .hasStrategy(TheSuggestionWatcher);
        lines.push(
            '  TheCageySuggestionWatcher '
            + gamesWithBoth.hasWinningStrategy(TheCageySuggestionWatcher).count()
            + ' : '
            + gamesWithBoth.hasWinningStrategy(TheSuggestionWatcher).count()
            + ' TheSuggestionWatcher'
        );
        return lines.join("\n");
    }

    compareSuggestionWatchersSeparately()
    {
        const lines = [];
        lines.push(
            "TheCageySuggestionWatcher should do better against others than TheSuggestionWatcher:"
        );
        const gamesCageyWon = this.results
            .doesntHaveStrategy(TheSuggestionWatcher)
            .hasWinningStrategy(TheCageySuggestionWatcher);
        const gamesRegularWon = this.results
            .doesntHaveStrategy(TheCageySuggestionWatcher)
            .hasWinningStrategy(TheSuggestionWatcher);
        lines.push(
            '  TheCageySuggestionWatcher '
            + gamesCageyWon.count()
            + ' : '
            + gamesRegularWon.count()
            + ' TheSuggestionWatcher'
        );
        return lines.join("\n");
    }

    compareEliminatorHeadToHeadWithSuggestionWatcher()
    {
        const lines = [];
        lines.push(
            "TheSuggestionWatcher should do better head-to-head than TheEliminator:"
        );
        const gamesWithBoth = this.results
                .hasStrategy(TheEliminator)
                .hasStrategy(TheSuggestionWatcher);
        lines.push(
            '  TheSuggestionWatcher '
            + gamesWithBoth.hasWinningStrategy(TheSuggestionWatcher).count()
            + ' : '
            + gamesWithBoth.hasWinningStrategy(TheEliminator).count()
            + ' TheEliminator'
        );
        return lines.join("\n");
    }
}

module.exports = HypothesisTester;
