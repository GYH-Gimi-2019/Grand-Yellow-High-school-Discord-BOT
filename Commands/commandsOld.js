const Discord = require('discord.js');

module.exports = {
    name: 'commandsOld',
    description: 'writes out the commands',
    execute(message, args, setup){
        const Embed = new Discord.MessageEmbed();
        let type = "";
            if (args[1] === "admin" && hasAdmin() && isInSeriesGuild()) {
                type = " (admin)"
                Embed.addFields(
                    {name: "`gyh!voices [évad] [epizód] [év] [hónap] [nap] [óra] [perc] [... szereplő emoji(k)]`", value: "Kiírja és reakció(k)ba helyezi azokat az ember(eke)t, aki(k)nek az emotikonját/emotikonjait a `[... szereplő emoji(k)]` helyére írod be. Amelyik ember reakciójára rányomsz, azt jelzed, hogy ő már beküldte a szinkronhangját. Kiírja azt a határidőt is, amit az `[év] [hónap] [nap] [óra] [perc]` helyére írsz be. Ezt a parancsot csak Benedek, és tesztelés esetén Tuzsi használhatja!\nPéldául: `gyh!voices 1 4 2020 9 7 12 0 `<:Tuzsi:748852431089172490>` `<:Ben:719843232418234408>"},
                    {name: "`gyh!voices add [... szereplő emoji(k)]`", value: "Hozzáadja az(oka)t a szereplő(ke)t, amelye(ke)t a `[... szereplő emoji(k)]` helyére írsz be. Ezt a parancsot csak Benedek, és tesztelés esetén Tuzsi használhatja!\nPéldául: `gyh!voices add `<:Tuzsi:748852431089172490>` `<:Ben:719843232418234408>"},
                    {name: "`gyh!voices remove [... szereplő emoji(k)]`", value: "Eltávolítja az(oka)t a szereplő(ke)t, amelye(ke)t a `[... szereplő emoji(k)]` helyére írsz be. Ezt a parancsot csak Benedek, és tesztelés esetén Tuzsi használhatja!\nPéldául: `gyh!voices remove `<:Tuzsi:748852431089172490>` `<:Ben:719843232418234408>"},
                    {name: "`gyh!voices deadline [év] [hónap] [nap] [óra] [perc]`", value: "Megváltoztatja a határidőt arra, amit az `[év] [hónap] [nap] [óra] [perc]` helyére írsz be. Ezt a parancsot csak Benedek, és tesztelés esetén Tuzsi használhatja!\nPéldául: `gyh!voices deadline 2020 9 7 12 0 `"},
                    {name: "`gyh!voices part [évad] [epizód]`", value: "Megváltoztatja a részt arra, amit a `[évad] [epizód]` helyére írsz be. Ezt a parancsot csak Benedek, és tesztelés esetén Tuzsi használhatja!\nPéldául: `gyh!voices part 1 4`"},
                    {name: "`gyh!voices set [üzenet ID]`", value: "Beállítja a annak az üzenetnek a helyét, ami egy rész szereplőinek neveit tartalmazó beágyazást tartalmaz. A csatornát az aktuális csatornára, az üzenetet pedig arra változtatja, amit az `[üzenet ID]` helyére írsz be.\nPéldául: `gyh!voices set 123456789123456789`"},
                    {name: "`gyh!voices set [csatorna ID] [üzenet ID]`", value: "Beállítja a annak az üzenetnek a helyét, ami egy rész szereplőinek neveit tartalmazó beágyazást tartalmaz. A csatornát arra változtatja, amit a `[csatorna ID]` helyére írsz be, az üzenetet pedig arra, amit az `[üzenet ID]` helyére írsz be.\nPéldául: `gyh!voices set 123456789123456789 987654321987654321`"},
                    {name: "`gyh!notify`", value: "Küld privátban egy emlékeztetőt minden embernek, aki még nem küldte el a szinkronhangját. Ezt a `gyh!voices [évad] [epizód] [... szereplő emoji(k)]` parancs legutolsó kimenetelén lévő reakció(k) alapján dönti el. Ezt a parancsot csak Benedek, és tesztelés esetén Tuzsi használhatja!"},
                    {name: "`gyh!premiere [url]`", value: "Átállítja a BOT tevékenységét *Élő közvetítés*re azzal az url-lel, amit az `[url]` helyére írsz.\nPéldául: `gyh!premiere https://www.youtube.com/watch?v=ND5kX83mEp4`"},
                    {name: "`gyh!premiere off`", value: "Visszaállítja a BOT tevékenységét alapértelmezettre."}
                )
            } else {
                Embed.addFields(
                    {name: "`gyh!quote`", value: "Kisorsol a sorozatból egy idézetet."},
                    {name: "`gyh!gif`", value: "Kisorsol egy GIF-et."},
                    {name: "`gyh!episodes`", value: "Kiírja az epizódokat linkkel ellátva."},
                    {name: "`gyh!website`", value: "Kiírja a sorozat weboldalát."},
                    {name: "`gyh!fandom`", value: "Kiírja a sorozat Fandom oldalát."},
                    {name: "`gyh!youtube`", value: "Kiírja a sorozat Youtube lejátszási listáját."},
                    {name: "`gyh!characters`", value: "Kiírja a sorozat karaktereit tartalmazó oldalát."}
                )
                if (isInSeriesGuild())
                    Embed.addFields(
                        {name: "`gyh!script s[évad]e[epizód]`", value: "Elküldi privátban annak a résznek a script-jéhez a szöveged, amit az `[évad]` és az `[epizód]` helyére írsz be. FONTOS, ez csak akkor működik, ha a szerveren a beceneved megegyezik a script-ben lévő beceneveddel!\nPéldául `gyh!script s1e4`."},
                        {name: "`gyh!script s[évad]e[epizód] full`", value: "Elküldi privátban annak az résznek a script-jét, amit az `[évad]` és az `[epizód]` helyére írsz be.\nPéldául `gyh!script s1e4 full`."}
                    )
            }
                Embed
                    .setTitle('A parancsok, amiket tudsz használni' + type)
                    .setDescription("`[]` = általad meghatározott érték. Ezt a paraméterek megadásakor NE írd be!")
                    .setColor('RANDOM')
                    .setTimestamp();
                message.channel.send(Embed);

        function isInSeriesGuild() {return message.guild.id === setup.SERIES_GUILD_ID;}
        function hasAdmin() {return message.member.hasPermission("ADMINISTRATOR");}
    }
}