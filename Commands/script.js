const Discord = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'script',
    description: 'DMs a specific script or the message\'s author\'s lines',
    async execute(message, args, database) {
        let script;
        switch (args.length) {
            case 2:
                try {
                    script = fs.readFileSync(`../src/scripts/${args[1]}.txt`, 'utf8');
                }catch (e) {
                    message.channel.send("Invalid parameter!");
                }

                const splitScript = script.split('\n');
                let splitLine;
                let scriptString = "";
                let lineCount = 0;
                const nickname = message.guild.members.cache.get(message.author.id).nickname;
                let temp = "";
                const Embed = new Discord.MessageEmbed();
                function line(i) {return `**${nickname !== splitLine[0] ? `${i + 1} [${splitLine[0].slice(splitLine[0].indexOf('(')+1, splitLine[0].lastIndexOf(')'))}] ` : i + 1}:** ${replaceAll(onlyScript(splitLine), "*", "\\*")}\n`}
                for (let i = 0; i < splitScript.length; ++i) {
                    splitLine = splitScript[i].split(": ");
                    if (splitLine[0].replace(splitLine[0].slice(splitLine[0].indexOf('(')-1, splitLine[0].lastIndexOf(')')+1), "") === nickname) {
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
                    .setTitle(`Your line${lineCount > 1 ? "s" : ""} for ${args[1].toUpperCase()}`)
                    .setColor('RANDOM');

                message.author.send(scriptString !== "" ? Embed : `You don't have any scripts in ${args[1].toUpperCase()}!`);
                break;
            case 3:
                if (args[2] === "full") {
                    try {
                        message.author.send(`${args[1].toUpperCase()} script`, {files: [`../src/scripts/full/${database.SCRIPT_FILES[args[1].toUpperCase()]}`]});
                    } catch (e) {
                        message.channel.send("Invalid parameter!");
                    }
                } else {
                    message.channel.send("Invalid parameter!");
                }
        }
        await message.channel.messages.fetch({limit: 1}).then(messages => {
            message.channel.bulkDelete(messages);
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