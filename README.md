# ECHELON SCIP BOT
Welcome to Echelon's SCIP subsystem.
This handles anything we need.
In the event that Guardsman [gdsmn.dev](https://gdsmn.dev) goes down, SCIP should inherit all moderation needs down the line.

https://img.shields.io/docker/cloud/build/nakisao/yourimage

---
Handles:
- ISD Intelligence
> - Intel Creation, Deletion, and the addition or removal of evidence.
- RAISA ("Documents")
> - Any certificates. 
> - Drivers Lisc.
> - Visit IC
> - Visit Medbay
> - Visit Cafe
> - Visit Large CZ
> - Visit CDCZ
> - Visit Clean Rooms
> - Spectate a test or be in a checkup.
> - Be On-Site when there is a protocol besides (Yellow Ember/Blue Sky).
> - Permitted to play as ScD Entrant
> - Permitted to play as MD Student
+ Archives for ISD and storage for what userID is associated with an account.
    (UIDs only.)
---

- Look at Gemini. 
- RoProxy.com -> Self-Host
    - Permits you full control over hosting I think?

### 1. Preparing the Dockerfile
The repository doesn't include a Dockerfile by default, so you can create one in the root directory of the project. This "Multi-stage" build keeps the final image very small.

Create a file named `Dockerfile` and paste this in:
```dockerfile
# Stage 1: Build the Go binary
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o roproxy-lite main.go

# Stage 2: Final lightweight image
FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/roproxy-lite .

# Set environment variables (Optional: change these as needed)
ENV PORT=8080
ENV KEY=""

EXPOSE 8080
CMD ["./roproxy-lite"]

### 2. Building and Running the Container
Once you have the Dockerfile ready, run these commands in your terminal:

1.  **Build the image:**
    ```bash
    docker build -t roproxy-lite .
    ```
2.  **Run the container:**
    ```bash
    docker run -d -p 8080:8080 --name my-roproxy roproxy-lite
    ```

### 3. Using the Proxy in Roblox
As noted in the repository documentation, the proxy expects requests in a specific format: `/subdomain/path`.

If your Docker container is running on your local machine (port 8080) and you want to send a Discord webhook, your Roblox URL would look like this:
`http://YOUR_IP:8080/webhooks.discord.com/apiYes, it is definitely possible to run **RoProxy-lite** on Docker. Since the project is written in Go, it is very lightweight and well-suited for a containerized environment.

### 2. Building and Running the Container

Once you have the Dockerfile ready, run these commands in your terminal:

1. **Build the image:**
```bash
docker build -t roproxy-lite .

```


2. **Run the container:**
```bash
docker run -d -p 8080:8080 --name my-roproxy roproxy-lite

```



### 3. Using the Proxy in Roblox

As noted in the repository documentation, the proxy expects requests in a specific format: `/subdomain/path`.

If your Docker container is running on your local machine (port 8080) and you want to send a Discord webhook, your Roblox URL would look like this:
`http://YOUR_IP:8080/webhooks.discord.com/api/webhooks/ID/TOKEN`

### 4. Hosting on Your Own Device (Accessing it Remotely)

For Roblox to reach your home device, you have two main paths:

* **Port Forwarding:** You would need to go into your router settings and forward port `8080` to your computer's local IP. Then, Roblox would use your Public IP address.
* **Tunneling (Easier/Safer):** You can use a tool like **Cloudflare Tunnels** or **ngrok**. These create a secure "tunnel" to your Docker container and give you a public URL (like `https://my-proxy.abc.com`) without you having to mess with router settings or expose your home IP directly.

### 5. Security Note (The KEY Variable)

Since you are self-hosting, anyone who finds your IP/URL could theoretically use your proxy.

* If you set the `KEY` environment variable in your Docker container (e.g., `-e KEY="my_secret_pass"`), you **must** include a header in your Roblox `HttpService:PostAsync` request:
* **Header Name:** `PROXYKEY`
* **Header Value:** `my_secret_pass`



This ensures that only your Roblox game can use your self-hosted proxy.