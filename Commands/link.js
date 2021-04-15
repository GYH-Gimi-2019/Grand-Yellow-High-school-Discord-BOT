const Discord = require('discord.js');

module.exports = {
    name: 'link',
    description: 'writes out the command link' ,
    async execute(interaction, args, database, bot, command) {
        const data = database.PAGES[command.toUpperCase()];
        const Embed = new Discord.MessageEmbed()
            .setAuthor(data.TITLE, data.IMAGE_URL, data.URL)
            .setColor('RANDOM')
        bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
            embeds: [Embed]
        }}});
    }
}