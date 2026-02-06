# Docker Setup Guide for SCIP-Bot

## Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Discord bot token, client ID, and guild ID

### 1. Create `.env` file from template
```bash
cp .env.example .env
```

Then edit `.env` and fill in your Discord credentials:
```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
```

### 2. Build and Run
```bash
# Build the image
docker build -t scip-bot:latest .

# Run with docker-compose (includes MongoDB)
docker-compose up -d

# Or run just the bot container with existing MongoDB
docker run -d --name scip-bot \
  --env-file .env \
  -v ./logs:/app/logs \
  --restart unless-stopped \
  scip-bot:latest
```

### 3. View Logs
```bash
# Docker Compose
docker-compose logs -f scip-bot

# Standalone container
docker logs -f scip-bot
```

## Production Deployment

### Using Docker Compose (Recommended)
```bash
docker-compose -f docker-compose.yml up -d
```

This starts:
- **scip-bot**: Your Discord bot
- **mongodb**: MongoDB database (optional, comment out if using external DB)

### Using Just the Image
If you have MongoDB elsewhere, run only the bot:
```bash
docker run -d \
  --name scip-bot \
  --env-file .env \
  -e MONGODB_URI=your_external_mongo_uri \
  -v ./logs:/app/logs \
  --restart unless-stopped \
  scip-bot:latest
```

## Environment Variables

| Variable | Required | Example |
|----------|----------|---------|
| `DISCORD_TOKEN` | Yes | `MzI4NzQ...` |
| `CLIENT_ID` | Yes | `123456789` |
| `GUILD_ID` | For deploy:local | `987654321` |
| `MONGODB_URI` | Yes | `mongodb://admin:pass@mongodb:27017/scip` |
| `NODE_ENV` | No | `production` |

## Stop the Bot
```bash
# Docker Compose
docker-compose down

# Standalone container
docker stop scip-bot
docker rm scip-bot
```

## Rebuild After Code Changes
```bash
docker-compose up -d --build
# or
docker build -t scip-bot:latest . && docker run ...
```

## Advanced: Push to Docker Registry

### Docker Hub
```bash
docker build -t yourusername/scip-bot:latest .
docker push yourusername/scip-bot:latest
```

### GitHub Container Registry (GHCR)
```bash
docker build -t ghcr.io/yourusername/scip-bot:latest .
docker push ghcr.io/yourusername/scip-bot:latest
```

## Troubleshooting

### Bot crashes immediately
- Check logs: `docker logs scip-bot`
- Verify `.env` variables are set correctly
- Ensure MongoDB is accessible if using docker-compose

### MongoDB connection fails
- Uncomment `depends_on: mongodb` in docker-compose.yml
- Or set `MONGODB_URI` to external DB and remove mongodb service

### Permission issues
- The container runs as non-root user (nodejs) for security
- Ensure `./logs` directory is writable by the container user
