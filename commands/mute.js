const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, Permissions } = require("discord.js");

const ms = require("ms");
const { DB_PASS } = require("../config.json");
const mysql = require("mysql");

const connection = mysql.createConnection({
    host: "www.borisjeletich.nl",
    user: "boris_axanid",
    password: DB_PASS,
    database: "boris_axanid"
});




module.exports = {
	data: new SlashCommandBuilder()
	    .setName("mute")
	    .setDescription("Mute een gebruiker.")
        .addUserOption(option => option.setName('gebruiker').setDescription('De gebruiker die gemute moet worden').setRequired(true))
        .addStringOption(option => option.setName('tijd').setDescription('Hoelang in minuten').setRequired(true))
        .addStringOption(option => option.setName('reden').setDescription('Reden voor de mute').setRequired(true)),
	async execute(interaction) {

        connection.connect(function (err) {
            if (err) {
                //console.error("error connecting: " + err.stack);
                return;
            }
        
            console.log("connected as id " + connection.threadId);
        });

        const user = interaction.options.getUser('gebruiker');
        const time = interaction.options.getString('tijd');
        const reason = interaction.options.getString('reden');
        const member = interaction.guild.members.cache.get(user.id);
        const cmdauthor = interaction.guild.members.cache.get(interaction.user.id)

        let LOG_CHANNEL = connection.query(`SELECT value FROM guilds WHERE guildID = ${interaction.guild.id} AND setting = 'LOG_CHANNEL'`, function (err, result) {return result[0].value})


        if (!interaction.member.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)) {
            return interaction.reply("Je hebt geen permissie om deze command te gebruiken.");
        }

        const MuteEmbed = new MessageEmbed()
            .setColor("#ff0000")
            .setTitle("Mute")
            .setDescription(`${user} is gemute!`)
            .addField("Reden", reason)
            .addField("Duur", time)
            .addField("Gemute door", cmdauthor.user.username)
            .setTimestamp();

        if (!LOG_CHANNEL){
            return interaction.reply('Er is geen log kanaal ingesteld.');
        }

        //console.log(LOG_CHANNEL);

        console.log(interaction.guild.channels.cache.get(LOG_CHANNEL));
        const timeInMS = ms(time);
        if (!timeInMS){
            return interaction.reply('Ongeldige tijd.');
        }

        connection.end();
        member.timeout(timeInMS, reason).catch(err => {console.log(err); return});
        await interaction.reply(`${user} is timed-out voor ${time}! Reden: ${reason}`);
        interaction.guild.channels.cache.get(LOG_CHANNEL).send({ embeds: [MuteEmbed] });



	}
};
