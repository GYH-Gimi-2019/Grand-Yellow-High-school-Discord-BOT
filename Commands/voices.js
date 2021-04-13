const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'voices',
    description: 'lists out the people whose sounds are planned to be used in a specific episode',
    async execute(interaction, args, database, setup, bot){
        const path = "../database/setup.json";
        let foundUser;
        let characters;
        switch (args[0].name) {
            case "add":
                characters = args[0].options[0].value.split("><").join(">><<").split("><");
                for (let i = 0; i < characters.length; i++) {
                    foundUser = bot.guilds.cache.get(interaction.guild_id).emojis.cache.find(r => r.name === getEmojiName(characters[i]));
                    if (!foundUser) {
                        bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                            content: "Invalid parameter!"
                        }}});
                        return;
                    }
                }
                bot.channels.fetch(setup.VOICES_CHANNEL).then(channel => {channel.messages.fetch(setup.VOICES_MESSAGE).then(msg => {
                    let description = msg.embeds[0].description
                    let temp;
                    for (let i = 0; i < characters.length; i++) {
                        temp = `${characters[i]}: ${getEmojiName(characters[i])}`
                        if (!description.includes(temp)) {
                            description += `\n${temp}`;
                            msg.react(characters[i]);
                        } else {
                            bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                                content: `${getEmojiName(characters[i])} is already on the list!`
                            }}});
                        }
                    }
                    const Embed = msg.embeds[0]
                        .setDescription(description);
                    msg.edit(Embed);
                })});
                bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                    content: `${characters.join(", ")} ${characters.length === 1 ? "has" : "have"} been added`
                }}});
                break;
            case "remove":
                characters = args[0].options[0].value.split("><").join(">><<").split("><");
                for (let i = 0; i < characters.length; i++) {
                    foundUser = bot.guilds.cache.get(interaction.guild_id).emojis.cache.find(r => r.name === getEmojiName(characters[i]));
                    if (!foundUser) {
                        bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                            content: "Invalid parameter!"
                        }}});
                        return;
                    }
                }
                bot.channels.fetch(setup.VOICES_CHANNEL).then(channel => {channel.messages.fetch(setup.VOICES_MESSAGE).then(msg => {
                    let description = msg.embeds[0].description;
                    let temp;
                    for (let i = 0; i < characters.length; i++) {
                        temp = `${characters[i]}: ${getEmojiName(characters[i])}`
                        if (description.includes(temp)) {
                            description = description.replace(`${characters[i]}: ${getEmojiName(characters[i])}`, "");
                            bot.channels.cache.get(setup.VOICES_CHANNEL).messages.fetch(setup.VOICES_MESSAGE).then(msg => {let r = msg.reactions.cache.find(reaction => reaction.emoji.name === getEmojiName(args[0].options[i].value)); if (r) r.remove();})
                        } else {
                            bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                                content: `${getEmojiName(characters[i])} isn't on the list!`
                            }}});
                        }
                    }
                    const Embed = msg.embeds[0]
                        .setDescription(description);
                    msg.edit(Embed);
                })})
                bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                    content: `${characters.join(", ")} ${characters.length === 1 ? "has" : "have"} been removed`
                }}});
                break;
            case "deadline":
                for (let i = 1; i < 5; i++) {
                    switch (i) {
                        case 1:
                            if (Number(args[0].options[i].value) > 12 || Number(args[0].options[i].value) < 1) {
                                bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                                    content: "Invalid parameter!"
                                }}});
                                return;
                            }
                            break;
                        case 2:
                            if (Number(Number(args[0].options[i].value) !== new Date(args[0].options[i - 2].value, args[0].options[i - 1].value - 1, args[0].options[i].value, 0, 0, 0, 0).getDate())) {
                                bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                                    content: "Invalid parameter!"
                                }}});
                                return;
                            }
                            break
                        case 3:
                            if (Number(args[0].options[i].value) > 23 || Number(args[0].options[i].value) < 0) {
                                bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                                    content: "Invalid parameter!"
                                }}});
                                return;
                            }
                            break;
                        case 4:
                            if (Number(args[0].options[i].value) > 59 || Number(args[0].options[i].value) < 0) {
                                bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                                    content: "Invalid parameter!"
                                }}});
                                return;
                            }
                            break;

                    }
                }
                bot.channels.fetch(setup.VOICES_CHANNEL).then(channel => {channel.messages.fetch(setup.VOICES_MESSAGE).then(msg => {
                    let deadline = new Date(args[0].options[0].value, args[0].options[1].value-1, args[0].options[2].value, args[0].options[3].value, args[0].options[4].value, 0, 0);
                    const Embed = msg.embeds[0]
                        .setTimestamp(deadline);
                    msg.edit(Embed);
                    bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                        content: `Deadline set to ${deadline.getDate() < 10 ? 0 : ""}${deadline.getDate()}/${deadline.getMonth()+1 < 10 ? 0 : ""}${deadline.getMonth()+1}/${deadline.getFullYear()} ${deadline.getHours()}:${deadline.getMinutes() < 10 ? 0 : ""}${deadline.getMinutes()}`
                    }}});
                })})
                break;
            case "part":
                bot.channels.fetch(setup.VOICES_CHANNEL).then(channel => {channel.messages.fetch(setup.VOICES_MESSAGE).then(msg => {
                    const season = args[0].options[0].value;
                    const episode = args[0].options[1].value;
                    const Embed = msg.embeds[0]
                        .setTitle(`S${season}E${episode} voices`);
                    msg.edit(Embed);
                    bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                        content: `Part has been changed to S${season}E${episode}`
                    }}});
                })});
                break;
            case "id":
                let channelID;
                let messageID;
                if (!isNaN(args[0].options[0].value)) {
                    messageID = args[0].options[0].value;
                } else {
                    bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                        content: "Invalid parameter!"
                    }}});
                    return;
                }
                if (args[0].options[1]) {
                    channelID = args[0].options[1].value;
                } else {
                    channelID = interaction.channel_id;
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
                                        bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                                            content: `Message ID has been changed to \`${messageID}\` in channel: <#${channelID}>`
                                        }}});
                                    });
                                });
                            } else {
                                bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                                    content: "Invalid parameter!"
                                }}});
                            }
                        }).catch(() => bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                            content: "Invalid parameter!"
                        }}}));
                    } else {
                        bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                            content: "Invalid parameter!"
                        }}});
                    }
                }).catch(() => bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                    content: "Invalid parameter!"
                }}}));
                break;
            case "new":
                characters = args[0].options[7].value.split("><").join(">><<").split("><");
                console.log(args[0].options[7].value);
                console.log(characters);
                for (let i = 3; i < 7; i++) {
                    switch (i) {
                        case 3:
                            if (Number(args[0].options[i].value) > 12 || Number(args[0].options[i].value) < 1) {
                                bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                                    content: "Invalid parameter!"
                                }}});
                                return;
                            }
                            break;
                        case 4:
                            if (Number(Number(args[0].options[i].value) !== new Date(args[0].options[i-2].value, args[0].options[i-1].value-1, args[0].options[i].value, 0, 0, 0, 0).getDate())) {
                                bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                                    content: "Invalid parameter!"
                                }}});
                                return;
                            }
                            break
                        case 5:
                            if (Number(args[0].options[i].value) > 23 || Number(args[0].options[i].value) < 0) {
                                bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                                    content: "Invalid parameter!"
                                }}});
                                return;
                            }
                            break;
                        case 6:
                            if (Number(args[0].options[i].value) > 59 || Number(args[0].options[i].value) < 0) {
                                bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                                    content: "Invalid parameter!"
                                }}});
                                return;
                            }
                            break;
                    }

                }
                for (let i = 0; i < characters.length; i++) {
                    foundUser = bot.guilds.cache.get(interaction.guild_id).emojis.cache.find(r => r.name === getEmojiName(characters[i]));
                    if (!foundUser) {
                        bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                            content: "Invalid parameter!"
                        }}});
                        return;
                    }
                }
                //message.channel.messages.fetch(setup.VOICES_MESSAGE).then(msg => {if(msg) msg.unpin();});
                const season = args[0].options[0].value;
                const episode = args[0].options[1].value;
                const deadline = new Date(args[0].options[2].value, args[0].options[3].value-1, args[0].options[4].value, args[0].options[5].value, args[0].options[6].value, 0, 0);
                let embedString = "";
                for (let i = 0; i < characters.length; i++) {
                    embedString += `${characters[i]}: ${getEmojiName(characters[i])}\n`
                }
                const Embed = new Discord.MessageEmbed()
                    .setTitle(`S${season}E${episode} voices`)
                    //.addField(`Deadline: ${deadline.getDate() < 10 ? 0 : ""}${deadline.getDate()}/${deadline.getMonth()+1}/${deadline.getFullYear()} ${deadline.getHours()}:${deadline.getMinutes() < 10 ? 0 : ""}${deadline.getMinutes()}`, embedString)
                    .setDescription(embedString)
                    .setColor('RANDOM')
                    .setFooter("Deadline")
                    .setTimestamp(deadline);
                await bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                    embeds: [Embed]
                }}}).then(() => { bot.channels.cache.get(interaction.channel_id).messages.fetch({limit: 1}).then(async msg => {
                    msg = msg.first();
                    msg.pin();
                    await fs.readFile(path, 'utf8', function (err,data) {
                        if (err) return console.log(err);
                        const result = data.replace(setup.VOICES_CHANNEL, interaction.channel_id).replace(setup.VOICES_MESSAGE, msg.id);
                        fs.writeFile(path, result, 'utf8', function (err) {
                            if (err) return console.log(err);
                        });
                    });
                    for (let i = 0; i < characters.length; i++) {
                        msg.react(characters[i]);
                    }
                })});
                break;
        }

        function getEmojiName(emoji) {
            const splitEmoji = emoji.split(':');
            return splitEmoji[1];
        }
    }
}