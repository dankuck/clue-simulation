
class LeaderBoard
{
    constructor(results, strategies)
    {
        this.results = results;
        this.strategies = strategies;
    }

    nameOf(strategy)
    {
        return Object.keys(this.strategies)
            .filter(name => this.strategies[name] === strategy)
            [0];
    }

    toString()
    {
        const groups = this.results.groupBy('winningStrategy');
        groups.sort((a, b) => b.plays.count() - a.plays.count());
        return groups
            .map(group => {
                let count = new String(group.plays.count());
                while (count.length < 5) {
                    count = ' ' + count;
                }
                return `${count} : ${this.nameOf(group.name)}`;
            })
            .join("\n")
            + "\n======================================================";
    }
}

module.exports = LeaderBoard;
