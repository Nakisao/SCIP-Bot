#!/bin/sh
# Generate config.json from environment variables if it doesn't exist
if [ ! -f config.json ]; then
  echo "Generating config.json from environment variables..."
  cat > config.json << EOF
{
  "clientId": "${CLIENT_ID:-}",
  "guildId": "${GUILD_ID:-}",
  "token": "${DISCORD_TOKEN:-}"
}
EOF
fi

# Start the bot
npm run start-bot
