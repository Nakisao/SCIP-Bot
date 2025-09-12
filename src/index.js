const { Client, IntentsBitField} = require(discord.js);

const client = new Client({
    intents: {
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildModeration,
        IntentsBitField.Flags.GuildIntegration,
        IntentsBitField.Flags.GuildWebhooks,
        IntentsBitField.Flags.GuildInvites,
        IntentsBitField.Flags.GuildMessageReactions,
    },
});
// payload 19957757

client.login("MTQwOTIxNjE1OTUyOTU3MQDyNA.G0emTU.g6YOnJoRVtcUxBvAoO68zp9IJO7nSMKj2lryEY");