const TheEliminator = require('../Strategies/TheEliminator');
const TheLuckyEliminator = require('../Strategies/TheLuckyEliminator');
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
            ...this.compareAll(TheCageyEliminator, TheEliminator),
            '- - - - - - - - - - - - - - - - - - - - ',
            ...this.compareAll(TheCageySuggestionWatcher, TheSuggestionWatcher),
            '- - - - - - - - - - - - - - - - - - - - ',
            ...this.compareAll(TheSuggestionWatcher, TheEliminator),
            '- - - - - - - - - - - - - - - - - - - - ',
            ...this.compareAll(TheLuckyEliminator, TheEliminator),
            '================================================================',
        ].join("\n");
    }

    nameOf(strategy)
    {
        return Object.keys(this.strategies)
            .filter(name => this.strategies[name] === strategy)
            [0];
    }

    advantage(favoredCount, otherCount)
    {
        return Math.round((favoredCount - otherCount) * 100 / (favoredCount + otherCount)) + '%';
    }

    compareAll(favoredStrategy, otherStrategy)
    {
        return [
            this.compareTogether(favoredStrategy, otherStrategy),
            this.compareSeparately(favoredStrategy, otherStrategy),
            this.compareGrudge(favoredStrategy, otherStrategy),
        ];
    }

    compareTogether(favoredStrategy, otherStrategy)
    {
        const games = this.results
            .hasStrategy(favoredStrategy)
            .hasStrategy(otherStrategy);
        const favoredName = this.nameOf(favoredStrategy);
        const otherName = this.nameOf(otherStrategy);
        const favoredWins = games.hasWinningStrategy(favoredStrategy).count();
        const otherWins = games.hasWinningStrategy(otherStrategy).count();
        return [
            `${favoredName} favored to beat ${otherName} : in games together`,
            `  ${favoredWins} : ${otherWins}`,
            `  Advantage : ${this.advantage(favoredWins, otherWins)}`,
        ].join("\n");
    }

    compareSeparately(favoredStrategy, otherStrategy)
    {
        const favoredName = this.nameOf(favoredStrategy);
        const otherName = this.nameOf(otherStrategy);
        const favoredWins = this.results
            .doesntHaveStrategy(otherStrategy)
            .hasWinningStrategy(favoredStrategy)
            .count();
        const otherWins = this.results
            .doesntHaveStrategy(favoredStrategy)
            .hasWinningStrategy(otherStrategy)
            .count();
        return [
            `${favoredName} favored to beat ${otherName} : in separate games`,
            `  ${favoredWins} : ${otherWins}`,
            `  Advantage : ${this.advantage(favoredWins, otherWins)}`,
        ].join("\n");
    }

    compareGrudge(favoredStrategy, otherStrategy)
    {
        const games = this.results
            .hasOnlyStrategies([favoredStrategy, otherStrategy]);
        const favoredName = this.nameOf(favoredStrategy);
        const otherName = this.nameOf(otherStrategy);
        const favoredWins = games.hasWinningStrategy(favoredStrategy).count();
        const otherWins = games.count() - favoredWins;
        return [
            `${favoredName} favored to beat ${otherName} : in games with only them`,
            `  ${favoredWins} : ${otherWins}`,
            `  Advantage : ${this.advantage(favoredWins, otherWins)}`,
        ].join("\n");
    }
}

module.exports = HypothesisTester;
