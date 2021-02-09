const Discord = require('discord.js');

module.exports = {
    name: 'episodes',
    description: 'writes out all the episodes',
    async execute(message, args, database, setup) {
        const episodes = database.EPISODES;
        let blank;
        let Embed = new Discord.MessageEmbed()
            .setTitle(`${isInSeriesGuild() ? "E" : "Grand Yellow High school e"}pisodes`)
            .setColor('RANDOM')
            .setTimestamp();
        for (let i = 0; i < episodes.length; i++) {
            Embed.addField('\u200B', `__**Season ${episodes[i].SEASON}**__`);
            blank = episodes[i].EPISODES.length;
            for (let j = 0; j < episodes[i].EPISODES.length; ++j) {
                Embed.addField(`Episode ${episodes[i].EPISODES[j].EPISODE}`, `[${episodes[i].EPISODES[j].TITLE}](${episodes[i].EPISODES[j].URL})`, true);
            }
            if ((blank - 2) % 3 === 0) Embed.addField('\u200B', '\u200B', true);
        }
        message.channel.send(Embed);
        await message.channel.messages.fetch({ limit: 1 }).then(messages => {
            message.channel.bulkDelete(messages);
        });

        function isInSeriesGuild() {return message.guild.id === setup.SERIES_GUILD_ID;}
    }
}
