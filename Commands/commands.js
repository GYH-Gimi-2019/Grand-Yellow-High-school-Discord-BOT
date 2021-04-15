const Discord = require('discord.js');

module.exports = {
    name: 'commands',
    description: 'writes out the commands',
    admin : false,
    roles : [],
    guilds : [],
    execute(interaction, args, setup, commands, prefix, bot) {
        let Embed;
        if (!args) {
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
            bot.api.interactions(interaction.id, interaction.token).callback.post({data: {
                type: 4,
                data: { embeds: [Embed]
            }}});
        } else {
            if (args[0].value === "admin") {
                if (hasAdmin()) {
                    if (isInSeriesGuild()) {
                        Embed = new Discord.MessageEmbed()
                            .setTitle('A parancsok, amiket tudsz használni (admin)')
                            .setDescription("`[]` = általad meghatározott érték. Ezt a paraméterek megadásakor NE írd be!")
                            .setColor('RANDOM')
                            .setTimestamp();
                        for (let i = 0; i < commands.ADMIN.length; i++) {
                            replaceAdmin(i)
                        }
                    } else {
                        bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                            content: "Ezt a parancsot itt nem használhatod!"
                        }}});
                        return;
                    }
                } else {
                    bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                        content: "Nincs jogosultságod a parancs használatához!"
                    }}});
                    return;
                }
            } else {
                Embed = new Discord.MessageEmbed()
                    .setTitle(`\`${args[0].value}\` parancs leírása:`)
                    .setDescription("`[]` = általad meghatározott érték. Ezt a paraméterek megadásakor NE írd be!")
                    .setColor('RANDOM')
                    .setTimestamp();

                for (let i = 0; i < commands.MAIN.length; i++) {
                    if (args[0].value === commands.MAIN[i].name.split(" ")[0] && commands.MAIN[i].command) {
                        replaceMain(i);
                    }
                }

                for (let i = 0; i < commands.INTHISGUILD.length; i++) {
                    if (args[0].value === commands.INTHISGUILD[i].name.split(" ")[0] && commands.INTHISGUILD[i].command) {
                        if (isInSeriesGuild()) {
                            replaceInThisGuild(i);
                        } else {
                            bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                                content: "Ezt a parancsot itt nem használhatod!"
                            }}});
                            return;
                        }
                    }
                }
                for (let i = 0; i < commands.ADMIN.length; i++) {
                    if (args[0].value === commands.ADMIN[i].name.split(" ")[0] && commands.ADMIN[i].command) {
                        if (hasAdmin()) {
                            if (isInSeriesGuild()) {
                                replaceAdmin(i);
                            } else {
                                bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                                    content: "Ezt a parancsot itt nem használhatod!"
                                }}});
                                return;
                            }
                        } else {
                            bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
                                content: "Nincs jogosultságod a parancs használatához!"
                            }}});
                            return;
                        }
                    }
                }
            }
        }

        bot.api.interactions(interaction.id, interaction.token).callback.post({data: { type: 4, data: {
            embeds: [Embed]
        }}});


        function replace(i, type) {
            switch (commands[type][i].name) {
                
            }
            Embed.addField((commands[type][i].command ? `**\`${"/" + commands[type][i].name}\`**` : commands[type][i].name), commands[type][i].value);
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

        function isInSeriesGuild() {return interaction.guild_id === setup.SERIES_GUILD_ID;}
        function hasAdmin() {return bot.guilds.cache.get(interaction.guild_id).members.cache.get(interaction.member.user.id).hasPermission("ADMINISTRATOR");}
    }
}
