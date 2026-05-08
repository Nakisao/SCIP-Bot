# Roblox to Discord Integration Guide

This document explains how to set up and use the SCIP-Bot's Roblox command logging system, which sends game logs from your Roblox game to a Discord channel via a secure proxy.

---

## Architecture Overview

The system consists of three components:

1. **Roblox Game** → Sends HTTP requests with game data
2. **RoProxy-lite** → Bridges Roblox requests to external services (HTTP proxy)
3. **SCIP-Bot** → Receives logs and displays them as Discord embeds

```
[Roblox Game]
     ↓ (HttpService:PostAsync with PROXYKEY header)
[RoProxy-lite Proxy] ← Validates PROXYKEY & Place ID
     ↓ (forwards to Discord webhook endpoint)
[SCIP-Bot Webhook Receiver] ← Validates PROXYKEY
     ↓ (converts JSON to embed)
[Discord Channel]
```

---

## Environment Variables

Before deploying, configure these environment variables in your `.env` file:

```env
# Bot Configuration
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
MONGODB_URI=mongodb://...

# Proxy Configuration
PROXY_KEY=your_secret_proxy_key_minimum_20_chars_for_security
ALLOWED_PLACE_ID=your_roblox_place_id

# Webhook Configuration
LOG_CHANNEL_ID=your_discord_channel_id
WEBHOOK_PORT=3000
```

### Environment Variable Descriptions

| Variable | Purpose | Example |
|----------|---------|---------|
| `PROXY_KEY` | Secret key for header authentication. Used by both proxy and bot to verify requests. | `redacted for safety` |
| `ALLOWED_PLACE_ID` | (Optional) Restricts proxy to accept requests only from this Roblox Place ID. Adds extra security. | `1234567890` |
| `LOG_CHANNEL_ID` | Discord channel ID where logs will be displayed. | `1234567890` |

---

## Setting Up the Bot

### 1. Enable the Webhook Receiver

Modify your main `index.js` to initialize the webhook receiver:

```javascript
const RobloxWebhookReceiver = require('./src/util/robloxWebhookReceiver');

// ... after client is ready ...

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}`);
	
	// Start webhook receiver
	const webhookReceiver = new RobloxWebhookReceiver(client, {
		port: process.env.WEBHOOK_PORT || 3000,
		proxyKey: process.env.PROXY_KEY,
		logChannelId: process.env.LOG_CHANNEL_ID,
	});
	
	webhookReceiver.start();
});
```

### 2. Docker Network Access

Inside Docker, the bot can reach the proxy via:

```
http://roproxy:8080
```

From outside Docker (if port-forwarded or tunneled):

```
http://YOUR_PUBLIC_IP:8080
```

---

## Deploying with Docker Compose

### 1. Build and Start Services

```bash
# Build images
docker-compose build

# Start services with environment variables
docker-compose up -d
```

### 2. Verify Services are Running

```bash
# Check both services
docker-compose ps

# Check logs
docker-compose logs -f roproxy          # Proxy logs
docker-compose logs -f scip-bot         # Bot logs
```

### 3. Test the Proxy

```bash
# Test from host machine (assumes port 8080 is exposed)
curl -H "PROXYKEY: your_secret_proxy_key" \
     -H "Roblox-Id: 12345678" \
     http://localhost:8080/webhooks.discord.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN
```

---

## Roblox Game Setup

### 1. Get the Proxy URL

If deployed locally with port forwarding or tunnel:
```
https://your-public-url.com:8080
```

If deployed in Docker on a remote server:
```
http://server-ip:8080
```

### 2. Create a Script in Roblox

In your Roblox game's **ServerScriptService** or appropriate location, create a script that sends logs:

```lua
local HttpService = game:GetService("HttpService")

-- Configuration
local PROXY_URL = "https://your-public-url.com:8080"
local PROXY_KEY = "your_secret_proxy_key"
local PLACE_ID = tostring(game.PlaceId)
local WEBHOOK_ENDPOINT = "webhooks.discord.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN"

-- Function to send log to Discord via bot
local function sendLogToDiscord(logData)
    local payload = {
        title = logData.title or "Roblox Event",
        description = logData.description or "Event triggered",
        username = logData.username or "Unknown",
        userId = logData.userId or nil,
        placeId = tonumber(PLACE_ID),
        severity = logData.severity or "info", -- info, warning, error, success
        timestamp = os.time() * 1000,
        fields = logData.fields or {}
    }
    
    local jsonData = HttpService:JSONEncode(payload)
    
    local headers = {
        ["Content-Type"] = "application/json",
        ["PROXYKEY"] = PROXY_KEY,
        ["Roblox-Id"] = PLACE_ID
    }
    
    local success, response = pcall(function()
        return HttpService:PostAsync(
            PROXY_URL .. "/" .. WEBHOOK_ENDPOINT,
            jsonData,
            Enum.HttpContentType.ApplicationJson,
            false,
            headers
        )
    end)
    
    if success then
        print("[Log Sent] " .. logData.title)
    else
        warn("[Log Failed] " .. response)
    end
end

-- Example: Log player join
local Players = game:GetService("Players")
Players.PlayerAdded:Connect(function(player)
    sendLogToDiscord({
        title = "Player Joined",
        description = player.Name .. " has joined the game",
        username = player.Name,
        userId = player.UserId,
        severity = "success",
        fields = {
            { name = "Account Age", value = player.AccountAge .. " days", inline = true }
        }
    })
end)

-- Example: Log player leave
Players.PlayerRemoving:Connect(function(player)
    sendLogToDiscord({
        title = "Player Left",
        description = player.Name .. " has left the game",
        username = player.Name,
        userId = player.UserId,
        severity = "info"
    })
end)

-- Example: Custom command log
_G.LogCommand = function(playerName, command, result)
    sendLogToDiscord({
        title = "Command Executed",
        description = "**" .. playerName .. "** executed: `" .. command .. "`",
        username = playerName,
        severity = "warning",
        fields = {
            { name = "Command", value = command, inline = true },
            { name = "Result", value = result or "Success", inline = true }
        }
    })
end
```

### 3. Get Your Discord Webhook

1. Go to your Discord server settings
2. Navigate to **Webhooks**
3. Create a new webhook or copy an existing one
4. Extract the `WEBHOOK_ID` and `WEBHOOK_TOKEN` from the webhook URL
5. Replace `WEBHOOK_ID` and `WEBHOOK_TOKEN` in the Roblox script

Webhook URL format:
```
https://discordapp.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN
```

---

## Log Payload Format

The Roblox script sends JSON with this structure:

```json
{
  "title": "Player Joined",
  "description": "Player xyz joined the game",
  "username": "PlayerName",
  "userId": 123456789,
  "placeId": 987654321,
  "severity": "success",
  "timestamp": 1609459200000,
  "fields": [
    {
      "name": "Account Age",
      "value": "30 days",
      "inline": true
    }
  ]
}
```

### Severity Levels

- `info` → Blue embed
- `success` → Green embed
- `warning` → Orange embed
- `error` → Red embed

---

## Security Considerations

### 1. PROXY_KEY Protection

- Always use a strong, random key (minimum 20 characters)
- Rotate keys periodically
- Never commit keys to version control
- Store in `.env` file only

### 2. Place ID Validation

Set `ALLOWED_PLACE_ID` in your `.env`:

```env
ALLOWED_PLACE_ID=12345678
```

The proxy will reject requests from other Roblox places.

### 3. Network Exposure

**For Local Development:**
- Use port forwarding (less secure)
- Use Cloudflare Tunnel (recommended, secure)

**For Production:**
- Deploy behind HTTPS proxy
- Use strong authentication headers
- Implement rate limiting
- Monitor proxy logs for abuse

### 4. Firewall Rules

If deployed on a server, restrict port 8080 to trusted IPs:

```bash
# Example: UFW on Linux
sudo ufw allow from 1.2.3.4 to any port 8080
```

---

## Troubleshooting

### "Missing or invalid PROXYKEY header"

**Cause:** PROXYKEY header not sent or incorrect.

**Solution:**
1. Verify `PROXY_KEY` environment variable is set
2. Ensure Roblox script uses exact key
3. Check header is being sent: `["PROXYKEY"] = PROXY_KEY`

### "Unauthorized Place ID. Request rejected"

**Cause:** `Roblox-Id` header doesn't match `ALLOWED_PLACE_ID`.

**Solution:**
1. Get your place ID: `print(game.PlaceId)` in Roblox command bar
2. Update `ALLOWED_PLACE_ID` in `.env`
3. Restart proxy: `docker-compose restart roproxy`

### "Connection timeout"

**Cause:** Proxy unreachable from Roblox.

**Solution:**
1. Verify proxy is running: `docker-compose ps`
2. Check public URL/IP is correct in Roblox script
3. If using Cloudflare Tunnel, verify tunnel is active
4. Check firewall rules allow inbound on port 8080

### Logs not appearing in Discord

**Cause:** Webhook endpoint incorrect or bot can't send messages.

**Solution:**
1. Verify `LOG_CHANNEL_ID` is correct
2. Ensure bot has **Send Messages** permission in channel
3. Check bot logs: `docker-compose logs scip-bot`
4. Test webhook directly with curl (see Docker section)

### "Invalid JSON"

**Cause:** Roblox script sending malformed JSON.

**Solution:**
1. Use `HttpService:JSONEncode()` for payload
2. Verify all required fields are present
3. Check Roblox script console for errors

---

## Advanced Usage

### Rate Limiting

To prevent abuse, implement throttling in your Roblox script:

```lua
local logQueue = {}
local lastLogTime = 0
local MIN_INTERVAL = 0.5 -- seconds between logs

local function throttledLog(logData)
    if tick() - lastLogTime < MIN_INTERVAL then
        table.insert(logQueue, logData)
        return
    end
    
    sendLogToDiscord(logData)
    lastLogTime = tick()
    
    if #logQueue > 0 then
        local queued = table.remove(logQueue, 1)
        throttledLog(queued)
    end
end
```

### Custom Severity Handling

Map your game events to severity levels:

```lua
local severityMap = {
    ERROR = "error",
    WARNING = "warning",
    INFO = "info",
    SUCCESS = "success"
}
```

---

## Monitoring & Logs

### View Proxy Logs

```bash
docker-compose logs -f roproxy --tail=50
```

### View Bot Logs

```bash
docker-compose logs -f scip-bot --tail=50
```

### Monitor in Real-time

```bash
docker-compose logs -f
```

---

## Maintenance

### Updating Environment Variables

1. Edit `.env` file
2. Restart services:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Rebuilding After Code Changes

```bash
docker-compose build --no-cache
docker-compose up -d
```

### Cleaning Up Old Logs

```bash
docker-compose logs --tail=0
```

---

## References

- [Roblox HttpService Documentation](https://create.roblox.com/docs/reference/engine/classes/HttpService)
- [Discord Webhooks](https://discord.com/developers/docs/resources/webhook)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Cloudflare Tunnels Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
