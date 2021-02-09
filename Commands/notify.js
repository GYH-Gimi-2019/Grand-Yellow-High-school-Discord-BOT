const Discord = require('discord.js');

module.exports = {
    name: 'notify',
    description: 'notifies the people who haven\'t sent their voices in',
    async execute(message, args, database, setup) {
        if (args[1] === "db") {
            const users = database.MISSING_VOICE.NAMES;
            let usr;
            for (let i = 0; i < users.length; i++) {
                usr = message.guild.members.cache.find(user => user.nickname === users[i].NAME);
                if (!users[i].DONE) usr.send(`Hurry up with recording your voice for S${database.MISSING_VOICE.SEASON}E${database.MISSING_VOICE.EPISODE}!`);
            }
        } else {
            message.channel.messages.fetch(setup.VOICES_MESSAGE).then(msg => {
                const embed = msg.embeds[0];
                const title = embed.title.split("S");
                const titleS = title[1].split("E")[0];
                const titleE = title[1].split(" ")[0].split("E")[1];
                const deadline = new Date(embed.timestamp);
                let foundUser;
                let count = 0;
                msg.reactions.cache.forEach(reaction => {
                    foundUser = msg.guild.members.cache.find(usr => usr.nickname === reaction._emoji.name && reaction.count < 2);
                    if (foundUser) {
                        foundUser.send(`Hurry up with recording your voice for S${titleS}E${titleE}! The deadline is ${deadline.getDate() < 10 ? 0 : ""}${deadline.getDate()}/${deadline.getMonth()+1 < 10 ? 0 : ""}${deadline.getMonth()+1}/${deadline.getFullYear()} ${deadline.getHours()}:${deadline.getMinutes() < 10 ? 0 : ""}${deadline.getMinutes()}`)
                        ++count;
                    }
                });
                if (count === 0) message.author.send("There's no one to notify!");
            })
        }
        await message.channel.messages.fetch({limit: 1}).then(messages => {
            message.channel.bulkDelete(messages);
        });
    }
}