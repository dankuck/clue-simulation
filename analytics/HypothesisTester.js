const TheEliminator = require('../Strategies/TheEliminator');
const TheLuckyEliminator = require('../Strategies/TheLuckyEliminator');
const TheOverConfidentEliminator = require('../Strategies/TheOverConfidentEliminator');
const TheSuggestionWatcher = require('../Strategies/TheSuggestionWatcher');
const TheCageySuggestionWatcher = require('../Strategies/TheCageySuggestionWatcher');
const TheCageyEliminator = require('../Strategies/TheCageyEliminator');
const TheTrickySuggestionWatcher = require('../Strategies/TheTrickySuggestionWatcher');
const TheOverConfidentSuggestionWatcher = require('../Strategies/TheOverConfidentSuggestionWatcher');
const TheCardCounter = require('../Strategies/TheCardCounter');
const TheSuggestionWatcherCardCounter = require('../Strategies/TheSuggestionWatcherCardCounter');

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
            '- - - - - - - - - - - - - - - - - - - - ',
            ...this.compareAll(TheOverConfidentEliminator, TheEliminator),
            '- - - - - - - - - - - - - - - - - - - - ',
            ...this.compareAll(TheOverConfidentEliminator, TheSuggestionWatcher),
            '- - - - - - - - - - - - - - - - - - - - ',
            ...this.compareAll(TheOverConfidentEliminator, TheTrickySuggestionWatcher),
            '- - - - - - - - - - - - - - - - - - - - ',
            ...this.compareAll(TheOverConfidentEliminator, TheOverConfidentSuggestionWatcher),
            '- - - - - - - - - - - - - - - - - - - - ',
            ...this.compareAll(TheCardCounter, TheOverConfidentSuggestionWatcher),
            '- - - - - - - - - - - - - - - - - - - - ',
            ...this.compareAll(TheSuggestionWatcherCardCounter, TheCardCounter),
            '- - - - - - - - - - - - - - - - - - - - ',
            this.errors(),
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
        const rounded = Math.round((favoredCount - otherCount) * 100 / (favoredCount + otherCount));
        const abs = Math.abs(rounded);
        if (abs > 99 && favoredCount !== otherCount) {
            return `~${rounded}%`;
        } else if (abs < 1 && favoredCount !== otherCount) {
            return '~0%';
        }
        return rounded + '%';
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

    errors()
    {
        const errors = this.results.hasErrors();
        if (!errors.count()) {
            return 'Errors: 0';
        } else {
            const error = errors.get()[0].game.errors[0];
            return [
                'Errors: ' + errors.count(),
                'First error: ',
                error.error,
                error.stack || 'no stack',
                JSON.stringify(error.asker),
                JSON.stringify(error.suggestion),
                JSON.stringify(errors.get()[0].game.envelope),
            ].join("\n");
        }
    }
}

module.exports = HypothesisTester;
