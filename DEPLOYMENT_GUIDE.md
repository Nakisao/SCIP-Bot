# Docker Deployment & Roblox Integration Guide

This guide covers deploying SCIP-Bot with the Roblox webhook integration using Docker Compose.

## Prerequisites

- Docker & Docker Compose installed
- Discord bot token and server/channel IDs
- Roblox Place ID (from your game)
- `.env` file configured (see `.env.example`)

---

## Quick Start

### 1. Prepare Environment Variables

```bash
# Copy the example to create your actual .env file
cp .env.example .env

# Edit .env with your values
nano .env
```

Required variables to fill:
- `DISCORD_TOKEN` - Your bot token
- `CLIENT_ID` - Bot application ID
- `GUILD_ID` - Your Discord server ID
- `MONGODB_URI` - MongoDB connection string
- `PROXY_KEY` - Strong random secret (20+ chars)
- `LOG_CHANNEL_ID` - Discord channel for logs

### 2. Build and Start Services

```bash
# Build Docker images
docker-compose build

# Start services in background
docker-compose up -d

# Verify both services are running
docker-compose ps
```

### 3. Check Service Health

```bash
# View proxy logs
docker-compose logs roproxy -f --tail=20

# View bot logs
docker-compose logs scip-bot -f --tail=20

# Check if proxy is responding
curl -H "PROXYKEY: $(grep PROXY_KEY .env | cut -d= -f2)" \
     http://localhost:8080/example.com/test
```

---

## Setting Up Your Roblox Game

### Step 1: Get Your Discord Webhook

1. Go to your Discord server → Server Settings → Webhooks
2. Click "New Webhook" or use an existing one
3. Copy the webhook URL
4. Extract `WEBHOOK_ID` and `WEBHOOK_TOKEN`:
   ```
   https://discordapp.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN
   ```

### Step 2: Configure the Roblox Script

1. In Roblox Studio, open your place
2. Insert a Script in **ServerScriptService**
3. Copy contents from `roblox-example-script.lua`
4. Update these lines:
   ```lua
   local PROXY_URL = "https://your-public-url.com:8080"
   local PROXY_KEY = "your_secret_proxy_key"  -- Same as .env PROXY_KEY
   local WEBHOOK_ENDPOINT = "webhooks.discord.com/api/webhooks/ID/TOKEN"
   ```

### Step 3: Test the Integration

1. Publish your game
2. Join the game as a player
3. Check Discord channel for "Player Joined" log
4. Leave the game
5. Check for "Player Left" log

---

## Public Access (Cloudflare Tunnels)

If running on a home device or private server, use Cloudflare Tunnels for secure public access:

### 1. Install Cloudflare Tunnel

```bash
# On your machine (not in Docker)
curl -L --output cloudflared.exe https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe

# Or on Linux:
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
```

### 2. Authenticate

```bash
# Windows
cloudflared.exe login

# Linux
./cloudflared-linux-amd64 login
```

### 3. Create Tunnel

```bash
# Windows
cloudflared.exe tunnel create scip-bot-tunnel

# Linux
./cloudflared-linux-amd64 tunnel create scip-bot-tunnel
```

### 4. Route Traffic

```bash
# Windows
cloudflared.exe tunnel route dns scip-bot-tunnel scip-bot.your-domain.com

# Linux
./cloudflared-linux-amd64 tunnel route dns scip-bot-tunnel scip-bot.your-domain.com
```

### 5. Configure Tunnel Config

Create `~/.cloudflared/config.yml`:

```yaml
tunnel: scip-bot-tunnel
credentials-file: /path/to/credentials.json

ingress:
  - hostname: scip-bot.your-domain.com
    service: http://localhost:8080
  - service: http_status:404
```

### 6. Run Tunnel

```bash
# Windows
cloudflared.exe tunnel run

# Linux
./cloudflared-linux-amd64 tunnel run
```

Now use `https://scip-bot.your-domain.com` as your `PROXY_URL` in Roblox script!

---

## Docker Commands Reference

### View Logs

```bash
# Both services
docker-compose logs -f

# Specific service
docker-compose logs -f scip-bot
docker-compose logs -f roproxy

# Last 50 lines
docker-compose logs --tail=50

# Specific time range
docker-compose logs -f --since 10m
```

### Manage Services

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Rebuild after code changes
docker-compose build --no-cache
docker-compose up -d

# Force restart specific service
docker-compose restart scip-bot

# View resource usage
docker stats
```

### Debug Services

```bash
# Execute command in container
docker-compose exec scip-bot sh

# View Docker events
docker-compose events

# Inspect container
docker inspect scip_bot

# Check network connectivity between containers
docker-compose exec scip-bot curl http://roproxy:8080/example.com/test
```

---

## Troubleshooting

### Connection Refused

```bash
# Verify proxy is running
docker-compose ps

# Check proxy logs
docker-compose logs roproxy

# Test proxy directly
curl -v http://localhost:8080/example.com/test
```

### Invalid PROXYKEY

**Error:** "Missing or invalid PROXYKEY header"

```bash
# Verify key in .env
grep PROXY_KEY .env

# Verify it matches in Roblox script
# Both must use the exact same value (case-sensitive)
```

### Webhook Not Receiving Logs

1. **Check bot permissions:**
   ```bash
   # Bot needs: Send Messages permission in LOG_CHANNEL_ID
   # Right-click channel → Permissions → Verify bot role
   ```

2. **Check logs:**
   ```bash
   docker-compose logs scip-bot | grep -i webhook
   ```

3. **Test webhook directly:**
   ```bash
   curl -X POST http://localhost:3000/api/logs \
     -H "Content-Type: application/json" \
     -H "PROXYKEY: $(grep PROXY_KEY .env | cut -d= -f2)" \
     -d '{"title":"Test","description":"Test log","severity":"info"}'
   ```

### Place ID Validation Failing

**Error:** "Unauthorized Place ID. Request rejected"

```bash
# Get your Place ID from Roblox Studio
# View > Game Settings > Places (copy the ID)

# Update .env
ALLOWED_PLACE_ID=your_actual_place_id

# Restart proxy
docker-compose restart roproxy
```

### Certificate Errors (SSL/TLS)

If using HTTPS tunnel:

```bash
# Verify certificates are valid
openssl s_client -connect your-domain.com:443

# Update system certificates if needed
docker-compose exec scip-bot apk add ca-certificates
```

---

## Performance & Scaling

### Limits

- **Max payload size:** 1MB per request (set in webhook receiver)
- **Webhook port default:** 3000 (can configure with `WEBHOOK_PORT`)
- **Proxy timeout:** 30 seconds (set in `TIMEOUT` env var)
- **Retry attempts:** 3 (set in `RETRIES` env var)

### Optimization

```bash
# Monitor resource usage
docker stats

# Increase timeout for slow networks
TIMEOUT=60

# Reduce retry attempts in stable networks
RETRIES=1

# Adjust logging level for production
LOG_LEVEL=warn
```

---

## Security Best Practices

### 1. Rotate Secrets

```bash
# Generate new PROXY_KEY
openssl rand -base64 20

# Update .env and restart
docker-compose down
# Edit .env
docker-compose up -d
```

### 2. Network Security

```bash
# If using local deployment, restrict port 8080 to trusted IPs
# Example (Linux/UFW):
sudo ufw allow from 1.2.3.4 to any port 8080 proto tcp

# On firewall:
# Only allow ingress from Roblox IP ranges if known
```

### 3. Monitoring

```bash
# Regular health checks
docker-compose ps

# Monitor for errors
docker-compose logs | grep ERROR

# Set up log rotation (already configured in docker-compose.yml)
```

---

## Maintenance

### Weekly Tasks

```bash
# Check for updates
docker-compose pull

# Verify services are healthy
docker-compose ps

# Review logs for errors
docker-compose logs --since 7d | grep -i error
```

### Monthly Tasks

```bash
# Rotate PROXY_KEY
# Rebuild images with latest base images
docker-compose build --pull --no-cache

# Prune old Docker resources
docker system prune -a
```

---

## References

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Cloudflare Tunnels](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
- [Roblox HttpService](https://create.roblox.com/docs/reference/engine/classes/HttpService)
- [Discord Webhooks](https://discord.com/developers/docs/resources/webhook)
