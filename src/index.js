const { Client, IntentsBitField } = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildModeration,
        IntentsBitField.Flags.GuildIntegrations,
        IntentsBitField.Flags.GuildWebhooks,
        IntentsBitField.Flags.GuildInvites,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.MessageContent,
    ],
});
// payload 19957757
// guild = server
client.on('clientReady', (c) => {
    console.log(`${c.user.tag} is online`);
});

client.login('MTQxNzU2NDg4OTc5MDI4Mzc3Ng.GByhKI.VMFsiYW44MGYf-aNfKGGdY1HouOtxzBXb5I-Bw');

//perm integer 8
//app id 1417564889790283776
//pub. key 5bd5579a97ffff274fe7a9bd17eb816eb420da08f195cd8596ad9aaa330b77bb
//client secret 03DhbyizADbekEdrMlnvVXjJOHeu1q6o
//client id 1417564889790283776
//bot token MTQxNzU2NDg4OTc5MDI4Mzc3Ng.GByhKI.VMFsiYW44MGYf-aNfKGGdY1HouOtxzBXb5I-Bw

//------------------------------------------------

//surely there's some way to have a custom file right?
