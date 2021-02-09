const Discord = require('discord.js');

module.exports = {
    name: 'gif',
    description: 'picks a random GIF',
    async execute(message, args, database) {
        const gifs = database.GIFS;
        const randomElement = gifs[Math.floor(Math.random() * gifs.length)];
        message.channel.send(randomElement);
        await message.channel.messages.fetch({ limit: 1 }).then(messages => {
            message.channel.bulkDelete(messages);
        });
    }
}