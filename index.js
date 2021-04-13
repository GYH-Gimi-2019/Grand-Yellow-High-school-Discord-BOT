console.log("Starting up...");

const Discord = require('discord.js');
const bot = new Discord.Client({
    partials: ['USER', 'GUILD_MEMBER', 'CHANNEL', 'MESSAGE', 'REACTION']
});
let setup = require('../database/setup.json');
let config = require(setup.CONFIG_PATH);
let token = config.MAIN.TOKEN;
let prefix = config.MAIN.PREFIX;
const fs = require('fs');
const { Console } = require('console');
let database = require(setup.DATABASE_PATH);
let commands = require(setup.COMMANDS_DB_PATH);
let slash_commands = require(setup.SLASH_COMMANDS_PATH);

let now = new Date();

bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync(setup.COMMANDS_PATH).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(setup.COMMANDS_PATH + file);
    bot.commands.set(command.name, command);
}

bot.on('ready', async () => {
    console.log(`${bot.user.tag} bot is now active (${monthToString(now.getMonth() + 1)} ${now.getDate()} ${now.getFullYear()} ${now.getHours() < 10 ? 0 : ""}${now.getHours()}:${now.getMinutes() < 10 ? 0 : ""}${now.getMinutes()}:${now.getSeconds() < 10 ? 0 : ""}${now.getSeconds()})`);
    bot.user.setPresence({status: "online", activity: {name: setup.STATUS, type: setup.ACTIVITY}});
    bot.channels.cache.get(setup.LOG_CHANNEL).send("Restarted...");
    /*for (let i = 0; i < setup.SLASH_COMMAND_GUILDS.length; i++) {
        console.log("guild: " + setup.SLASH_COMMAND_GUILDS[i])
        for (let j = 0; j < slash_commands.MAIN.length; j++) {
            console.log(slash_commands.MAIN[j])
            await bot.api.applications(bot.user.id).guilds(setup.SLASH_COMMAND_GUILDS[i]).commands.post({
                data: slash_commands.MAIN[j],
            });
        }
        console.log("done")
    }*/
    /*for (let i = 0; i < slash_commands.INTHISGUILD.length; i++) {
        await bot.api.applications(bot.user.id).guilds(setup.SERIES_GUILD_ID).commands.post({
            data: slash_commands.INTHISGUILD[i]
        });
    }
    for (let i = 0; i < slash_commands.ADMIN.length; i++) {
        await bot.api.applications(bot.user.id).guilds(setup.SERIES_GUILD_ID).commands.post({
            data: slash_commands.ADMIN[i]
        });
    }
    for (let j = 0; j < slash_commands.MAIN.length; j++) {
        console.log(slash_commands.MAIN[j])
        await bot.api.applications(bot.user.id).commands.post({
            data: slash_commands.MAIN[j],
        });
    }*/
    //await bot.api.applications(bot.user.id).guilds(setup.SERIES_GUILD_ID).commands("828727258449182790").delete();
    console.log(await bot.api.applications(bot.user.id).guilds(setup.SERIES_GUILD_ID).commands.get());

});

bot.ws.on('INTERACTION_CREATE', async (interaction) => {
    const command = interaction.data.name.toLowerCase();
    const args = interaction.data.options;
    console.log(interaction.data.options);

    switch (command) {
        case setup.HELP_COMMAND:
            bot.commands.get('commands').execute(await interaction, args, setup, commands, prefix, bot);
            break;
        case "quote":
            bot.commands.get('quote').execute(await interaction, args, database, setup, bot);
            break;
        case "gif":
            bot.commands.get('gif').execute(await interaction, args, database, bot);
            break;
        case "episodes":
            bot.commands.get('episodes').execute(await interaction, args, database, setup, bot);
            break;
        case "fandom": case "website": case "youtube": case "characters": case "evolution":
            bot.commands.get('link').execute(await interaction, args, database, bot, command.toUpperCase());
            break;
        case "script":
            bot.commands.get('script').execute(await interaction, args, database, bot);
            break;
        case "voices":
            if ((isSentBy("Ben") || isSentBy("Tuzsi")) && isInSeriesGuild(bot.guilds.cache.get(interaction.guild_id))) {
                setSetup();
                await bot.commands.get('voices').execute(await interaction, args, database, setup, bot).then(() => {setSetup();});
            } else {
                bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                    content: "Nincs jogosultságod a parancs használatához!"
                }}});
            }
            break;
        case "premiere":
            if (hasAdmin() && (isInSeriesGuild(bot.guilds.cache.get(interaction.guild_id)))) {
                bot.commands.get('premiere').execute(await interaction, args, setup, bot);
            } else {
                bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                    content: "Nincs jogosultságod a parancs használatához!"
                }}});
            }
            break;
        case "notify":
            if (hasAdmin() && isInSeriesGuild(bot.guilds.cache.get(interaction.guild_id))) {
                bot.commands.get('notify').execute(await interaction, args, database, setup, bot);
            } else {
                bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                    content: "Nincs jogosultságod a parancs használatához!"
                }}});
            }
            break;
        default:
            bot.api.interactions(interaction.id, interaction.token).callback.post({ data: { type: 4, data: {
                content: "```json\n" + JSON.stringify(interaction, null, 2) + "\n```"
            }}});
            break;
    }
    function isSentBy(nickname) {return bot.guilds.cache.get(interaction.guild_id).members.cache.get(interaction.member.user.id).nickname === nickname}
    function hasAdmin() {return bot.guilds.cache.get(interaction.guild_id).members.cache.get(interaction.member.user.id).hasPermission("ADMINISTRATOR");}

});

bot.on('message', async (message) => {
    function hasAdmin() {return message.member.hasPermission("ADMINISTRATOR");}
    if (message.author.bot) return;
    if (isDM(message.guild))  console.log(`${message.createdAt.getHours()}:${message.createdAt.getMinutes()}:${message.createdAt.getSeconds()} DM ${message.author.tag}: ${message.content}`);
    let args = message.content.split(' ');
    let requiredPrefix = isDM(message.guild) ? "" : prefix;
    switch (args[0].toLowerCase()) {
        case `${requiredPrefix}database`:
            if (!isDM(message.guild) && hasAdmin() && isInSeriesGuild(message.guild)) {
                switch (args.length) {
                    case 1:
                        databaseUpdate(message)
                        break;
                    case 2:
                        whichToSet(args[1], message);
                        break;
                    default:
                        message.channel.send("Invalid parameter!");
                        break;
                }
            }
    }

    function isSentBy(nickname) {return message.guild.members.cache.get(message.author.id).nickname === nickname}
});

bot.on('messageReactionAdd', (reaction, user) => {
    if (isInSeriesGuild(reaction.message.guild)) {
        setSetup();
        const emojis = Array.from(reaction.message.guild.emojis.cache.map(e => e.name));
        if (reaction.message.id === setup.VOICES_MESSAGE && user !== bot.user && ((!isReactedBy("Ben") && !isReactedBy("Tuzsi")) || (reaction.emoji.name === "✅" || reaction.emoji.name === "⏱" || (emojis.includes(reaction._emoji.name) && reaction.count < 2 && user !== bot.user)))) {
            reaction.users.remove(user.id);
        } else {
            let reactions = 0;
            let activeReactions = 0;
            let foundUser;
            reaction.message.reactions.cache.forEach(reaction => {
                if (emojis.includes(reaction._emoji.name)) {
                    foundUser = reaction._emoji.name && reaction.count >= 2;
                    if (foundUser) ++reactions;
                    foundUser = reaction._emoji.name && reaction.count > 0;
                    if (foundUser) ++activeReactions;
                }
            });
            reaction.message.channel.messages.fetch(setup.VOICES_MESSAGE).then(message => {
                const embed = message.embeds[0];
                const title = embed.title.split("S");
                const titleS = title[1].split("E")[0];
                const titleE = title[1].split(" ")[0].split("E")[1];
                foundUser = reaction.message.guild.members.cache.find(usr => usr.nickname === reaction._emoji.name && reaction.count === 2);
                if (foundUser) foundUser.send(`You have been marked as ready with recording your voice for S${titleS}E${titleE}!`);
                foundUser = reaction.message.guild.members.cache.find(usr => usr.nickname === reaction._emoji.name && reaction.count === 1);
                if (foundUser) {
                    foundUser.send(`You have been added to S${titleS}E${titleE}!`);
                    let r = message.reactions.cache.find(reaction => reaction._emoji.name === "⏱");
                    if (r) r.remove();
                    r = message.reactions.cache.find(reaction => reaction._emoji.name === "✅");
                    if (r) r.remove();
                }
                if (reactions === activeReactions && emojis.includes(reaction._emoji.name) && reaction.count === 2) {
                    reaction.message.react("✅");
                    message.channel.send(`It looks like everyone has finished with recording their voices for S${titleS}E${titleE}🎉`);
                } else if (reaction.count === 2) {
                    let r = message.reactions.cache.get("✅");
                    if (r) {
                        r.users.remove(bot.user.id);
                        r.count = 0;
                    }
                }
            }).catch(console.log);
        }
        //console.log(reactions);
        //console.log(activeReactions);

    }
    function isReactedBy(nickname) {return reaction.message.guild.members.cache.get(user.id).nickname === nickname}
});

bot.on('messageReactionRemove', (reaction, user) => {
    if (isInSeriesGuild(reaction.message.guild)) {
        const emojis = reaction.message.guild.emojis.cache.map(e => e.name);
        if (reaction.message.id === setup.VOICES_MESSAGE && reaction.emoji.name !== "✅" && reaction.emoji.name !== "⏱" && (isUnreactedBy("Ben") || isUnreactedBy("Tuzsi") || user === bot.user) && !(emojis.includes(reaction._emoji.name) && reaction.count < 1 && user !== bot.user)) {
            let reactions = 0;
            let activeReactions = 0;
            let foundUser;
            reaction.message.reactions.cache.forEach(reaction => {
                if (emojis.includes(reaction._emoji.name)) {
                    foundUser = reaction._emoji.name && reaction.count >= 2;
                    if (foundUser) ++reactions;
                    foundUser = reaction._emoji.name && reaction.count > 0;
                    if (foundUser) ++activeReactions;
                }
            });
            reaction.message.channel.messages.fetch(setup.VOICES_MESSAGE).then(message => {
                const embed = message.embeds[0];
                const title = embed.title.split("S");
                const titleS = title[1].split("E")[0];
                const titleE = title[1].split(" ")[0].split("E")[1];
                foundUser = reaction.message.guild.members.cache.find(usr => usr.nickname === reaction._emoji.name && reaction.count < 2);
                if (foundUser) foundUser.send(`You have been unmarked as ready with recording your voice for S${titleS}E${titleE}!`);
                let r = reaction.message.reactions.cache.get("✅");
                if (emojis.includes(reaction._emoji.name))
                    if (reactions !== activeReactions) {
                        if (r) {
                            r.users.remove(bot.user.id);
                            r.count = 0;
                        }
                    } else{
                        reaction.message.react("✅");
                        if (reaction.count < 2)
                        message.channel.send(`It looks like everyone has finished with recording their voices for S${titleS}E${titleE}🎉`);
                    }
            }).catch(console.log);
        }
        //console.log(reactions);
        //console.log(activeReactions);
    }

    function isUnreactedBy(nickname) {return reaction.message.guild.members.cache.get(user.id).nickname === nickname}
});

bot.on('messageReactionRemoveEmoji', (reaction) => {
    if (isInSeriesGuild(reaction.message.guild)) {
        if (reaction.message.id === setup.VOICES_MESSAGE) {
            let reactions = 0;
            let activeReactions = 0;
            let foundUser;
            const emojis = reaction.message.guild.emojis.cache.map(e => e.name);
            reaction.message.reactions.cache.forEach(reaction => {
                if (emojis.includes(reaction._emoji.name)) {
                    foundUser = reaction._emoji.name && reaction.count >= 2;
                    if (foundUser) ++reactions;
                    foundUser = reaction._emoji.name && reaction.count > 0;
                    if (foundUser) ++activeReactions;
                }
            });
            reaction.message.channel.messages.fetch(setup.VOICES_MESSAGE).then(message => {
                const embed = message.embeds[0];
                const title = embed.title.split("S");
                const titleS = title[1].split("E")[0];
                const titleE = title[1].split(" ")[0].split("E")[1];
                foundUser = reaction.message.guild.members.cache.find(usr => usr.nickname === reaction._emoji.name);
                if (foundUser) foundUser.send(`You have been removed from S${titleS}E${titleE}!`);
                if (reactions === activeReactions && emojis.includes(reaction._emoji.name) && !reaction.message.reactions.cache.get("✅")) {
                    reaction.message.react("✅");
                    message.channel.send(`It looks like everyone has finished with recording their voices for S${titleS}E${titleE}🎉`);
                }
            }).catch(console.log);
        }
    }
});

bot.on('messageDelete' , (message) => {
    //if (message.author.id !== bot.user.id)
    try {
        console.log(`${message.createdAt.getHours()}:${message.createdAt.getMinutes()}:${message.createdAt.getSeconds()} ${message.author.tag}: ${message.content}`);
    } catch(e) {
        console.log(e);
    }
});

bot.on('guildMemberAdd', (member) => {
    if (member.guild.id === setup.SERIES_GUILD_ID) member.send(`Welcome to **${member.guild.name}**!`)
})

setInterval(function () {
    bot.channels.fetch(setup.VOICES_CHANNEL).then(channel => {channel.messages.fetch(setup.VOICES_MESSAGE).then(message => {
        const embed = message.embeds[0];
        const deadline = new Date(embed.timestamp).setMilliseconds(0);
        now = new Date().setMilliseconds(0);
        let r = message.reactions.cache.find(reaction => reaction._emoji.name === "⏱");
        if (now === deadline) {
            const title = embed.title.split("S");
            const titleS = title[1].split("E")[0];
            const titleE = title[1].split(" ")[0].split("E")[1];
            let foundUser;
            message.reactions.cache.forEach(reaction => {
                foundUser = message.guild.members.cache.find(usr => usr.nickname === reaction._emoji.name && reaction.count < 2);
                if (foundUser) foundUser.send(`The deadline for recording your voice for S${titleS}E${titleE} is NOW, please HURRY UP!`);
            });
        } else if (now > deadline) {
            if (!r) message.react("⏱");
        } else {
            if (r) r.remove();
        }
    }).catch(() => {console.error(`Message ${setup.VOICES_MESSAGE} not found!`)})}).catch(() => {console.error(`Channel ${setup.VOICES_CHANNEL} not found!`)})
}, 1000);

function isDM(guild) {return guild === null;}

function isInSeriesGuild(guild) {if (!isDM(guild)) return guild.id === setup.SERIES_GUILD_ID;}

function monthToString(month) {
    switch (month) {
        case 1:
            return "Jan";
        case 2:
            return "Feb";
        case 3:
            return "Mar";
        case 4:
            return "Apr";
        case 5:
            return "May";
        case 6:
            return "Jun";
        case 7:
            return "Jul";
        case 8:
            return "Aug";
        case 9:
            return "Sep";
        case 10:
            return "Oct";
        case 11:
            return "Nov";
        case 12:
            return "Dec";
        default:
            break;
    }
}

function databaseUpdate(message) {
    setSetup();
    setToken();
    setConfig();
    setPrefix();
    setDatabase();
    if (message) message.channel.send("Az adatbázisok sikeresen frissítve!")
}

function setSetup() {
    delete require.cache[require.resolve('../database/setup.json')];
    setup = require('../database/setup.json');
}

function setConfig() {
    delete require.cache[require.resolve(setup.CONFIG_PATH)];
    config = require(setup.CONFIG_PATH);
}

function setToken() {
    delete require.cache[require.resolve(setup.CONFIG_PATH)];
    token = require(setup.CONFIG_PATH).MAIN.TOKEN;
}

function setPrefix() {
    delete require.cache[require.resolve(setup.CONFIG_PATH)];
    prefix = require(setup.CONFIG_PATH).MAIN.PREFIX;
}

function setDatabase() {
    delete require.cache[require.resolve(setup.DATABASE_PATH)];
    database = require(setup.DATABASE_PATH);
}

function whichToSet(variable, message) {
    switch (variable) {
        case "setup":
            setSetup();
            if (message) successfulSet(message);
            break;
        case "token":
            setToken();
            if (message) successfulSet(message);
            break;
        case "config":
            setConfig();
            if (message) successfulSet(message);
            break;
        case "prefix":
            setPrefix();
            if (message) successfulSet(message);
            break;
        case "database":
            setDatabase();
            if (message) successfulSet(message);
            break;
        default:
            if (message) message.channel.send("Invalid parameter!");
            break;
    }
}

function successfulSet(message) {
    message.channel.send("Az adatbázis sikeresen frissítve!")
}

bot.login(token);
