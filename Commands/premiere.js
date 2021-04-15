const Discord = require('discord.js');

module.exports = {
    name: 'premiere',
    description: 'sets bot\'s activity to STREAMING with a specific URL',
    async execute(interaction, args, setup, bot) {
        switch (args[0].name) {
            case "off":
                bot.user.setPresence({status: "online", activity: {name: setup.STATUS, type: setup.ACTIVITY}});
                bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                    content: "Premiere turned off"
                }}});
                break;
            case "on":
                bot.user.setPresence({
                    status: "online",
                    activity: {name: setup.STATUS, type: "STREAMING", url: args[0].options[0].value}
                });
                bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                    content: `Premiere set to  ${args[0].options[0].value}`
                }}});
                break;
        }
    }
}
