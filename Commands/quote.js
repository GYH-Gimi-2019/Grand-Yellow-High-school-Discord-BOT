const Discord = require('discord.js');

module.exports = {
    name: 'quote',
    description: 'picks a random quote',
    async execute(message, args, database, setup){
        const quotes = database.QUOTES;
        const randomElement = quotes[Math.floor(Math.random() * quotes.length)];
        console.log(randomElement);
        const Embed = new Discord.MessageEmbed()
            .setTitle(`The random quote${isInSeriesGuild() ? "" : " from Grand Yellow High school"} is...`)
            .setDescription(randomElement.QUOTE)
            .setFooter(`From S${randomElement.SEASON}E${randomElement.EPISODE} "${episodeSearch(parseInt(randomElement.SEASON), parseInt(randomElement.EPISODE))}"`)
            .setColor('RANDOM');
        message.channel.send(Embed);
        await message.channel.messages.fetch({ limit: 1 }).then(messages => {
            message.channel.bulkDelete(messages);
        });

        function isInSeriesGuild() {return message.guild.id === setup.SERIES_GUILD_ID;}

        function seasonSearch(season) {
            for (let index = 0; index < database.EPISODES.length; index++) {
                if (database.EPISODES[index].SEASON === season) {
                    return database.EPISODES[index];
                }
            }
        }

        function episodeSearch(season, episode) {
            for (let index = 0; index < database.EPISODES.length; index++) {
                if (database.EPISODES[index].SEASON === season) {
                    console.log("success1");
                    for (let index2 = 0; index2 < database.EPISODES[index].EPISODES.length; index2++) {
                        if (database.EPISODES[index].EPISODES[index2].EPISODE === episode) {
                            console.log(database.EPISODES[index].EPISODES[index2]);
                            return database.EPISODES[index].EPISODES[index2].TITLE;
                        }
                    }
                }
            }
        }
    }
}