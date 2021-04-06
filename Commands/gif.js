const Discord = require('discord.js');

module.exports = {
    name: 'gif',
    description: 'picks a random GIF',
    async execute(interaction, args, database, bot) {
        const gifs = database.GIFS;
        const randomElement = gifs[Math.floor(Math.random() * gifs.length)];
        bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
            content: randomElement
        }}});
    }
}