# GitHub Actions Setup for Docker Hub Push

## Overview
This workflow automatically builds and pushes your Docker image to Docker Hub whenever you push code to `main`, `master`, or `develop` branches.

## Setup Instructions

### Step 1: Create Docker Hub Personal Access Token
1. Go to [Docker Hub](https://hub.docker.com) and log in as **nakisao**
2. Click your **Profile Icon** → **Account Settings** → **Security** → **New Access Token**
3. Create a token named `github-actions` (read & write access)
4. **Copy the token** (you won't see it again)

### Step 2: Add GitHub Secrets
1. Go to your GitHub repo: `https://github.com/Nakisao/SCIP-Bot`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add two secrets:

| Name | Value |
|------|-------|
| `DOCKER_USERNAME` | `nakisao` |
| `DOCKER_PASSWORD` | `<your-docker-hub-token>` |

### Step 3: Test the Workflow
1. Push a commit to `main` branch:
   ```powershell
   git add .
   git commit -m "test: trigger docker build"
   git push origin main
   ```

2. Go to **Actions** tab in GitHub → watch the workflow run
3. After ~5 minutes, check Docker Hub → `nakisao/scip-bot` to verify the image was pushed

## How It Works
- **Trigger:** Automatically on every push to `main`, `master`, or `develop`
- **What it does:**
  - Checks out your code
  - Builds the Docker image
  - Logs into Docker Hub
  - Pushes the image with tags: `latest`, `branch-name`, `commit-sha`
- **Caching:** Uses GitHub Actions cache to speed up rebuilds

## Manual Trigger
To manually trigger a build without pushing code:
1. Go to **Actions** → **Build and Push Docker Image**
2. Click **Run workflow** → **Run workflow**

## Monitoring
- Check **Actions** tab to see build status
- View logs for any failures
- Docker Hub will show new image tags as they're pushed

## Cleanup
To delete this workflow, simply remove `.github/workflows/build-and-push.yml` and push to `main`.

## Troubleshooting

**Build fails on GitHub Actions**
- Check the **Actions** tab for logs
- Ensure your code builds locally first: `docker build -t test .`
- Verify secrets are set correctly in **Settings → Secrets**

**Image not appearing on Docker Hub**
- Check GitHub Actions logs for push errors
- Verify `DOCKER_USERNAME` and `DOCKER_PASSWORD` are correct
- Confirm the token has write access

**Slow builds**
- The first build will be slow (no cache)
- Subsequent builds use caching and are much faster
- Go-to-sleep optimization: builds cache layers across runs
