const Discord = require('discord.js');

module.exports = {
    name: 'notify',
    description: 'notifies the people who haven\'t sent their voices in',
    async execute(interaction, args, database, setup, bot) {
        bot.channels.cache.get(interaction.channel_id).messages.fetch(setup.VOICES_MESSAGE).then(msg => {
            const embed = msg.embeds[0];
            const title = embed.title.split("S");
            const titleS = title[1].split("E")[0];
            const titleE = title[1].split(" ")[0].split("E")[1];
            const deadline = new Date(embed.timestamp);
            let foundUser;
            let foundUsers = [];
            msg.reactions.cache.forEach(reaction => {
                foundUser = msg.guild.members.cache.find(usr => usr.nickname === reaction._emoji.name && reaction.count < 2);
                if (foundUser) {
                    foundUsers.push(foundUser.nickname);
                    foundUser.send(`Hurry up with recording your voice for S${titleS}E${titleE}! The deadline is ${deadline.getDate() < 10 ? 0 : ""}${deadline.getDate()}/${deadline.getMonth()+1 < 10 ? 0 : ""}${deadline.getMonth()+1}/${deadline.getFullYear()} ${deadline.getHours()}:${deadline.getMinutes() < 10 ? 0 : ""}${deadline.getMinutes()}`)
                }
            });
            bot.users.cache.get(interaction.member.user.id).send(foundUsers.length === 0 ? "There's no one to notify!" : `${foundUsers.join(", ")} ${foundUsers.length === 1 ? "has" : "have"} been notified`);
            bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                        content: `${bot.users.cache.get(interaction.member.user.id)}, nézd meg, mit küldtem DM-ben!`
                    }}}).then(() => {
                setTimeout(() => {
                    bot.channels.cache.get(interaction.channel_id).messages.fetch({limit: 1}).then(messages => {
                        bot.channels.cache.get(interaction.channel_id).bulkDelete(messages);
                    })
                }, 3000);
            });
        })
    }

    /*if (args[1] === "db") {
    const users = database.MISSING_VOICE.NAMES;
    let usr;
    for (let i = 0; i < users.length; i++) {
        usr = bot.guilds.cache.get(interaction.guild_id).members.cache.find(user => user.nickname === users[i].NAME);
        if (!users[i].DONE) usr.send(`Hurry up with recording your voice for S${database.MISSING_VOICE.SEASON}E${database.MISSING_VOICE.EPISODE}!`);
    }*/
}