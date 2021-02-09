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

let now = new Date();

bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync(setup.COMMANDS_PATH).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(setup.COMMANDS_PATH + file);
    bot.commands.set(command.name, command);
}

bot.on('ready', () => {
    console.log(`${bot.user.tag} bot is now active (${monthToString(now.getMonth() + 1)} ${now.getDate()} ${now.getFullYear()} ${now.getHours() < 10 ? 0 : ""}${now.getHours()}:${now.getMinutes() < 10 ? 0 : ""}${now.getMinutes()}:${now.getSeconds() < 10 ? 0 : ""}${now.getSeconds()})`);
    bot.user.setPresence({status: "online", activity: {name: setup.STATUS, type: setup.ACTIVITY}});
});

bot.on('message', async (message) => {
    function hasAdmin() {return message.member.hasPermission("ADMINISTRATOR");}
    if (message.author.bot) return;
    if (isDM(message.guild))  console.log(`${message.createdAt.getHours()}:${message.createdAt.getMinutes()}:${message.createdAt.getSeconds()} DM ${message.author.tag}: ${message.content}`);
    let args = message.content.split(' ');
    let requiredPrefix = isDM(message.guild) ? "" : prefix;
    switch (args[0].toLowerCase()) {
        case `${requiredPrefix}quote`:
            bot.commands.get('quote').execute(await message, args, database, setup);
            break;
        case `${requiredPrefix}gif`:
            bot.commands.get('gif').execute(await message, args, database);
            break;
        case `${requiredPrefix}fandom`:
            bot.commands.get('link').execute(await message, args, database, linkType());
            break;
        case `${requiredPrefix}website`:
            bot.commands.get('link').execute(await message, args, database, linkType());
            break;
        case `${requiredPrefix}youtube`:
            bot.commands.get('link').execute(await message, args, database, linkType());
            break;
        case `${requiredPrefix}characters`:
            bot.commands.get('link').execute(await message, args, database, linkType());
            break;
        case `${requiredPrefix}evolution`:
            bot.commands.get('link').execute(await message, args, database, linkType());
            break;
        case `${requiredPrefix}episodes`:
            bot.commands.get('episodes').execute(await message, args, database, setup);
            break;
        case `${requiredPrefix}script`:
            if (isInSeriesGuild(message.guild) || isDM(message.guild))
            bot.commands.get('script').execute(await message, args, database);
            break;
        case `${requiredPrefix}premiere`:
            if (hasAdmin() && (isInSeriesGuild(message.guild) || isDM(message.guild)))
                bot.commands.get('premiere').execute(await message, args, setup, bot);
            break;
        case `${requiredPrefix}commands`:
            bot.commands.get('commands').execute(await message, args, setup, commands, prefix);
            break;
        case `${requiredPrefix}notify`:
            if (!isDM(message.guild) && hasAdmin() && isInSeriesGuild(message.guild))
            bot.commands.get('notify').execute(await message, args, database, setup);
            break;
        case `${requiredPrefix}voices`:
            if (!isDM(message.guild) && (isSentBy("Ben") || isSentBy("Tuzsi")) && isInSeriesGuild(message.guild)) {
                setSetup();
                await bot.commands.get('voices').execute(await message, args, database, setup, bot).then(() => {setSetup();});
            }
            break;
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
                        message.channel.send("Érvénytelen paraméter!");
                        break;
                }
            }
    }

    function isSentBy(nickname) {return message.guild.members.cache.get(message.author.id).nickname === nickname}
    function linkType() {return args[0].toLowerCase().replace(requiredPrefix, "").toUpperCase()}
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
            if (message) message.channel.send("Érvénytelen paraméter!");
            break;
    }
}

function successfulSet(message) {
    message.channel.send("Az adatbázis sikeresen frissítve!")
}

bot.login(token);
