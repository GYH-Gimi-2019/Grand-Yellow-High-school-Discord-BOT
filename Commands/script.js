const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'script',
    description: 'DMs a specific script or the message\'s author\'s lines',
    async execute(interaction, args, database, bot) {
        let script;
        if (!args[2].value) {
            try {
                script = fs.readFileSync(`../src/scripts/s${args[0].value}e${args[1].value}.txt`, 'utf8');
            } catch (e) {
                bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                    content: "Érvénytelen paraméter!"
                }}});
                return;
            }

            const splitScript = script.split('\n');
            let splitLine;
            let scriptString = "";
            let lineCount = 0;
            const nickname = bot.guilds.cache.get(interaction.guild_id).members.cache.get(interaction.member.user.id).nickname;
            let temp = "";
            const Embed = new Discord.MessageEmbed();

            function line(i) {
                return `**${nickname !== splitLine[0] ? `${i + 1} [${splitLine[0].slice(splitLine[0].indexOf('(') + 1, splitLine[0].lastIndexOf(')'))}] ` : i + 1}:** ${replaceAll(onlyScript(splitLine), "*", "\\*")}\n`
            }

            for (let i = 0; i < splitScript.length; ++i) {
                splitLine = splitScript[i].split(": ");
                if (splitLine[0].replace(splitLine[0].slice(splitLine[0].indexOf('(') - 1, splitLine[0].lastIndexOf(')') + 1), "") === nickname) {
                    temp = scriptString;
                    scriptString += line(i);
                    if (scriptString.length > 1024) {
                        Embed.addField("\u200B", temp);
                        scriptString = line(i);
                    }
                    ++lineCount;
                }
            }
            if (scriptString !== "") Embed
                .addField("\u200B", scriptString)
                .setTitle(`Your line${lineCount > 1 ? "s" : ""} for S${args[0].value}E${args[1].value}`)
                .setColor('RANDOM');

            bot.users.cache.get(interaction.member.user.id).send(scriptString !== "" ? Embed : `You don't have any scripts in S${args[0].value}E${args[1].value}!`);
        } else {
            try {
                bot.users.cache.get(interaction.member.user.id).send(`S${args[0].value}E${args[1].value} script`, {files: [`../src/scripts/full/${database.SCRIPT_FILES[`S${args[0].value}E${args[1].value}`]}`]});
            } catch (e) {
                bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                    content: "Érvénytelen paraméter!"
                }}});
            }
        }

        bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                    content: `${bot.users.cache.get(interaction.member.user.id)}, nézd meg, mit küldtem DM-ben!`
                }}}).then(() => {
            setTimeout(() => {
                bot.channels.cache.get(interaction.channel_id).messages.fetch({limit: 1}).then(messages => {
                    bot.channels.cache.get(interaction.channel_id).bulkDelete(messages);
                })
            }, 3000);
        });

        function replaceAll(string, search, replace) {
            return string.split(search).join(replace);
        }

        function onlyScript(lineArray) {
            let ret = "";
            for (let i = 1; i < lineArray.length; i++) {
                ret += lineArray[i].replace("\n", "") + (i === lineArray.length-1 ? "" : ": ");
            }
            return ret;
        }
    }
}