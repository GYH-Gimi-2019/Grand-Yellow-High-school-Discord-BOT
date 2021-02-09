const Discord = require('discord.js');

module.exports = {
    name: 'premiere',
    description: 'sets bot\'s activity to STREAMING with a specific URL',
    async execute(message, args, setup, bot) {
        if (args[1] !== undefined) {
            if (args[1] !== "off") {
                bot.user.setPresence({
                    status: "online",
                    activity: {name: setup.STATUS, type: "STREAMING", url: args[1]}
                });
            } else {
                bot.user.setPresence({status: "online", activity: {name: setup.STATUS, type: setup.ACTIVITY}});
            }
        } else {
            message.channel.send("Invalid parameter!");
        }
        await message.channel.messages.fetch({limit: 1}).then(messages => {
            message.channel.bulkDelete(messages);
        });
    }
}