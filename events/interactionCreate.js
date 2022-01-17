const { MessageEmbed } = require("discord.js");
const editJsonFile = require("edit-json-file");

const file = editJsonFile("./config.json");


module.exports = async (client, interaction) => {
	const LOG_CHANNEL = await file.get("LOG_CHANNEL");
    const { commandName } = interaction;
	if (interaction.isCommand() || client.commands.has(commandName)) {
		await client.commands.get(commandName).execute(interaction);
	}
	if (interaction.isButton()) {
		if (interaction.customId.includes("-button")) {
			if (interaction.customId.includes("close")) {

				const CloseEmbed = new MessageEmbed()
					.setColor("#ff0000")
					.setTitle("Ticket gesloten!")
					.setDescription(`${interaction.user} heeft een ticket gesloten!`)
					.setTimestamp();

				await interaction.reply("Ticket gesloten!");
				interaction.channel.delete();
				interaction.guild.channels.cache.get(LOG_CHANNEL).send({ embeds: [CloseEmbed] });
			} else {
				const rolename = interaction.customId.replace("-button", "").replace("<", "").replace(">", "").replace("@", "").replace("&", "");
				console.log(rolename);
				
				interaction.guild.members.cache.get(interaction.user.id).roles.add(interaction.guild.roles.cache.get(rolename));
				await interaction.guild.members.cache.get(interaction.user.id).send(`${interaction.guild.roles.cache.get(rolename).name} toegevoegd!`);
				await interaction.reply("Rol toegevoegd!");
				await interaction.deleteReply();
			}
		}
	}

};
