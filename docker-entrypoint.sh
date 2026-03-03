#!/bin/sh
# Generate config.json from environment variables if it doesn't exist
if [ ! -f config.json ]; then
  echo "Generating config.json from environment variables..."
  cat > config.json << EOF
{
  "clientId": "${CLIENT_ID:-}",
  "guildId": "${GUILD_ID:-}",
  "token": "${DISCORD_TOKEN:-}",
  "mongoUri": "${MONGODB_URI:-}${MONGODB_LOCAL:-}"
}
EOF
fi

# Exec the bot so signals propagate to the Node process
exec npm run start-bot
