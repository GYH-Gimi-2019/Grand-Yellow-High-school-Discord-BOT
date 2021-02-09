const Discord = require('discord.js');

module.exports = {
    name: 'link',
    description: 'writes out the command link' ,
    async execute(message, args, database, page) {
        const data = database.PAGES[page];
        const Embed = new Discord.MessageEmbed()
            .setAuthor(data.TITLE, data.IMAGE_URL, data.URL)
            .setColor('RANDOM')
        message.channel.send(Embed);
    }
}