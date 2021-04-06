const Discord = require('discord.js');

module.exports = {
    name: 'episodes',
    description: 'writes out all the episodes',
    async execute(interaction, args, database, setup, bot) {
        const episodes = database.EPISODES;
        let blank;
        let Embed = new Discord.MessageEmbed()
            .setTitle(`${isInSeriesGuild() ? "E" : "Grand Yellow High school e"}pisodes`)
            .setColor('RANDOM')
            .setTimestamp();
        for (let i = 0; i < episodes.length; i++) {
            Embed.addField('\u200B', `__**Season ${episodes[i].SEASON}**__`);
            for (let j = 0; j < episodes[i].EPISODES.length; ++j) {
                Embed.addField(`Episode ${episodes[i].EPISODES[j].EPISODE}`, `[${episodes[i].EPISODES[j].TITLE}](${episodes[i].EPISODES[j].URL})`, true);
            }
            if ((episodes[i].EPISODES.length - 2) % 3 === 0) Embed.addField('\u200B', '\u200B', true);
        }
        bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
            embeds: [Embed]
        }}});

        function isInSeriesGuild() {return interaction.guild_id === setup.SERIES_GUILD_ID;}
    }
}
