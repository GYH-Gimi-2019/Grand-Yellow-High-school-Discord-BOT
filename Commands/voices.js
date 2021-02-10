const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'voices',
    description: 'lists out the people whose sounds are planned to be used in a specific episode',
    async execute(message, args, database, setup, bot){
        const path = "../database/setup.json";
        let foundUser;
        switch (args[1]) {
            case "add":
                for (let i = 2; i < args.length; i++) {
                    foundUser = message.guild.emojis.cache.find(r => r.name === getEmojiName(args[i]));
                    if (!foundUser) {
                        message.channel.send("Invalid parameter!")
                        return;
                    }
                }
                bot.channels.fetch(setup.VOICES_CHANNEL).then(channel => {channel.messages.fetch(setup.VOICES_MESSAGE).then(msg => {
                    let description = msg.embeds[0].description
                    let temp;
                    for (let i = 2; i < args.length; i++) {
                        temp = `${args[i]}: ${getEmojiName(args[i])}`
                        if (!description.includes(temp)) {
                            description += `\n${temp}`;
                            msg.react(args[i]);
                        } else {
                            message.channel.send(`${getEmojiName(args[i])} is already on the list!`)
                        }
                    }
                    const Embed = msg.embeds[0]
                        .setDescription(description);
                    msg.edit(Embed);
                })})
                break;
            case "remove":
                for (let i = 2; i < args.length; i++) {
                    foundUser = message.guild.emojis.cache.find(r => r.name === getEmojiName(args[i]));
                    if (!foundUser) {
                        message.channel.send("Invalid parameter!")
                        return;
                    }
                }
                bot.channels.fetch(setup.VOICES_CHANNEL).then(channel => {channel.messages.fetch(setup.VOICES_MESSAGE).then(msg => {
                    let description = msg.embeds[0].description;
                    let temp;
                    for (let i = 2; i < args.length; i++) {
                        temp = `${args[i]}: ${getEmojiName(args[i])}`
                        if (description.includes(temp)) {
                            description = description.replace(`${args[i]}: ${getEmojiName(args[i])}`, "");
                            bot.channels.cache.get(setup.VOICES_CHANNEL).messages.fetch(setup.VOICES_MESSAGE).then(msg => {let r = msg.reactions.cache.find(reaction => reaction.emoji.name === getEmojiName(args[i])); if (r) r.remove();})
                        } else {
                            message.channel.send(`${getEmojiName(args[i])} isn't on the list!`)
                        }
                    }
                    const Embed = msg.embeds[0]
                        .setDescription(description);
                    msg.edit(Embed);
                })})
                break;
            case "deadline":
                for (let i = 2; i < 7; i++) {
                    if (isNaN(args[i])) {
                        message.channel.send("Invalid parameter!")
                        return;
                    } else {
                        switch (i) {
                            case 3:
                                if (Number(args[i]) > 12 || Number(args[i]) < 1) {
                                    message.channel.send("Invalid parameter!")
                                    return;
                                }
                                break;
                            case 4:
                                if (Number(Number(args[i]) !== new Date(args[i - 2], args[i - 1] - 1, args[i], 0, 0, 0, 0).getDate())) {
                                    message.channel.send("Invalid parameter!")
                                    return;
                                }
                                break
                            case 5:
                                if (Number(args[i]) > 23 || Number(args[i]) < 0) {
                                    message.channel.send("Invalid parameter!")
                                    return;
                                }
                                break;
                            case 6:
                                if (Number(args[i]) > 59 || Number(args[i]) < 0) {
                                    message.channel.send("Invalid parameter!")
                                    return;
                                }
                                break;
                        }
                    }
                }
                bot.channels.fetch(setup.VOICES_CHANNEL).then(channel => {channel.messages.fetch(setup.VOICES_MESSAGE).then(msg => {
                    let deadline = new Date(args[2], args[3]-1, args[4], args[5], args[6], 0, 0);
                    const Embed = msg.embeds[0]
                        .setTimestamp(deadline);
                    msg.edit(Embed);
                })})
                break;
            case "part":
                for (let i = 2; i < 4; i++) {
                    if (isNaN(args[i])) {
                        message.channel.send("Invalid parameter!")
                        return;
                    }
                }
                bot.channels.fetch(setup.VOICES_CHANNEL).then(channel => {channel.messages.fetch(setup.VOICES_MESSAGE).then(msg => {
                    const season = args[2];
                    const episode = args[3];
                    const Embed = msg.embeds[0]
                        .setTitle(`S${season}E${episode} voices`);
                    msg.edit(Embed);
                })})
                break;
            case "id":
                let channelID;
                let messageID;
                switch (args.length) {
                    case 3:
                        if (isNaN(args[2])) {
                            message.channel.send("Invalid parameter!")
                            return;
                        }
                        channelID = message.channel.id;
                        messageID = args[2]
                        break;
                    case 4:
                        for (let i = 2; i < 4; i++) {
                            if (isNaN(args[i])) {
                                message.channel.send("Invalid parameter!")
                                return;
                            }
                        }
                        channelID = args[2];
                        messageID = args[3];
                        break;
                }
                bot.channels.fetch(channelID).then(channel => {
                    if (channel) {
                        channel.messages.fetch(messageID).then(msg => {
                            if (msg) {
                                fs.readFile(path, 'utf8', function (err,data) {
                                    if (err) return console.log(err);
                                    const result = data.replace(setup.VOICES_CHANNEL, channelID).replace(setup.VOICES_MESSAGE, messageID);
                                    fs.writeFile(path, result, 'utf8', function (err) {
                                        if (err) return console.log(err);
                                    });
                                });
                            } else {
                                message.channel.send("Invalid parameter!");
                            }
                        }).catch(() => message.channel.send("Invalid parameter!"));
                    } else {
                        message.channel.send("Invalid parameter!");
                    }
                }).catch(() => message.channel.send("Invalid parameter!"));
                break;
            default:
                for (let i = 1; i < 8; i++) {
                    if (isNaN(args[i])) {
                        message.channel.send("Invalid parameter!")
                        return;
                    } else {
                        switch (i) {
                            case 4:
                                if (Number(args[i]) > 12 || Number(args[i]) < 1) {
                                    message.channel.send("Invalid parameter!")
                                    return;
                                }
                                break;
                            case 5:
                                if (Number(Number(args[i]) !== new Date(args[i-2], args[i-1]-1, args[i], 0, 0, 0, 0).getDate())) {
                                    message.channel.send("Invalid parameter!")
                                    return;
                                }
                                break
                            case 6:
                                if (Number(args[i]) > 23 || Number(args[i]) < 0) {
                                    message.channel.send("Invalid parameter!")
                                    return;
                                }
                                break;
                            case 7:
                                if (Number(args[i]) > 59 || Number(args[i]) < 0) {
                                    message.channel.send("Invalid parameter!")
                                    return;
                                }
                                break;
                        }
                    }
                }
                for (let i = 8; i < args.length; i++) {
                    foundUser = message.guild.emojis.cache.find(r => r.name === getEmojiName(args[i]));
                    if (!foundUser) {
                        message.channel.send("Invalid parameter!")
                        return;
                    }
                }
                //message.channel.messages.fetch(setup.VOICES_MESSAGE).then(msg => {if(msg) msg.unpin();});
                const season = args[1];
                const episode = args[2];
                const deadline = new Date(args[3], args[4]-1, args[5], args[6], args[7], 0, 0);
                let embedString = "";
                for (let i = 8; i < args.length; i++) {
                    embedString += `${args[i]}: ${getEmojiName(args[i])}\n`
                }
                const Embed = new Discord.MessageEmbed()
                    .setTitle(`S${season}E${episode} voices`)
                    //.addField(`Deadline: ${deadline.getDate() < 10 ? 0 : ""}${deadline.getDate()}/${deadline.getMonth()+1}/${deadline.getFullYear()} ${deadline.getHours()}:${deadline.getMinutes() < 10 ? 0 : ""}${deadline.getMinutes()}`, embedString)
                    .setDescription(embedString)
                    .setColor('RANDOM')
                    .setFooter("Deadline")
                    .setTimestamp(deadline);
                await message.channel.messages.fetch({ limit: 1 }).then(messages => {
                    message.channel.bulkDelete(messages);
                });
                const msgEmbed = await message.channel.send(Embed).then(msg => msg.pin());
                for (let i = 8; i < args.length; i++) {
                    msgEmbed.react(args[i]);
                }

                await fs.readFile(path, 'utf8', function (err,data) {
                    if (err) return console.log(err);
                    const result = data.replace(setup.VOICES_CHANNEL, msgEmbed.channel.id).replace(setup.VOICES_MESSAGE, msgEmbed.id);
                    fs.writeFile(path, result, 'utf8', function (err) {
                        if (err) return console.log(err);
                    });
                });
                break;
        }

        function getEmojiName(emoji) {
            const splitEmoji = emoji.split(':');
            return splitEmoji[1];
        }
    }
}