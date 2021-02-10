const Discord = require('discord.js');

module.exports = {
    name: 'commands',
    description: 'writes out the commands',
    admin : false,
    roles : [],
    guilds : [],
    execute(message, args, setup, commands, prefix) {
        console.log("TEST");
        let Embed;
        switch (args.length) {
            case 1:
                Embed = new Discord.MessageEmbed()
                    .setTitle('A parancsok, amiket tudsz használni')
                    .setDescription("`[]` = általad meghatározott érték. Ezt a paraméterek megadásakor NE írd be!")
                    .setColor('RANDOM')
                    .setTimestamp();
                for (let i = 0; i < commands.MAIN.length; i++) {
                    replaceMain(i)
                }
                if (isInSeriesGuild()) {
                    for (let i = 0; i < commands.INTHISGUILD.length; i++) {
                        replaceInThisGuild(i)
                    }
                }
                message.channel.send(Embed);
                break;
            case 2:
                if (args[1] === "admin" && hasAdmin() && isInSeriesGuild()) {
                    Embed = new Discord.MessageEmbed()
                    .setTitle('A parancsok, amiket tudsz használni (admin)')
                    .setDescription("`[]` = általad meghatározott érték. Ezt a paraméterek megadásakor NE írd be!")
                    .setColor('RANDOM')
                    .setTimestamp();
                    for (let i = 0; i < commands.ADMIN.length; i++) {
                        replaceAdmin(i)
                    }
                } else {
                    Embed = new Discord.MessageEmbed()
                        .setTitle(`\`${args[1]}\` parancs leírása:`)
                        .setDescription("`[]` = általad meghatározott érték. Ezt a paraméterek megadásakor NE írd be!")
                        .setColor('RANDOM')
                        .setTimestamp();

                    for (let i = 0; i < commands.MAIN.length; i++) {
                        if (args[1] === commands.MAIN[i].name.split(" ")[0] && commands.MAIN[i].command) {
                            replaceMain(i);
                        }
                    }
                    if (isInSeriesGuild()) {
                        for (let i = 0; i < commands.INTHISGUILD.length; i++) {
                            if (args[1] === commands.INTHISGUILD[i].name.split(" ")[0] && commands.INTHISGUILD[i].command) {
                                replaceInThisGuild(i);
                            }
                        }
                        if (hasAdmin()) {
                            for (let i = 0; i < commands.ADMIN.length; i++) {
                                console.log(args[1])
                                console.log(commands.ADMIN[i].name.split(" ")[0])
                                console.log(commands.ADMIN[i].command)
                                if (args[1] === commands.ADMIN[i].name.split(" ")[0] && commands.ADMIN[i].command) {
                                    console.log("boi");
                                    replaceAdmin(i);
                                }
                            }
                        }
                    }
                }
                message.channel.send(Embed);
                break;
        }

        function replace(i, type) {
            console.log(commands[type][i].name);
            switch (commands[type][i].name) {
                
            }
            Embed.addField((commands[type][i].command ? `**\`${prefix + commands[type][i].name}\`**` : commands[type][i].name), commands[type][i].value);
            function valueReplace(from, to) {
                commands[type][i].value = commands[type][i].value.replace(`{replace${from}}`, to);
            }
        }

        function replaceMain(i) {
            replace(i, "MAIN");
        }
        
        function replaceAdmin(i) {
            replace(i, "ADMIN");
        }
        
        function replaceInThisGuild(i) {
            replace(i, "INTHISGUILD");
        }

        function isInSeriesGuild() {return message.guild.id === setup.SERIES_GUILD_ID;}
        function hasAdmin() {return message.member.hasPermission("ADMINISTRATOR");}
    }
}