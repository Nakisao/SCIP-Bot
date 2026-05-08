--[[
    SCIP-Bot Roblox Integration Script
    
    This script sends game events to Discord via the SCIP-Bot webhook receiver.
    
    SETUP INSTRUCTIONS:
    1. Place this script in ServerScriptService
    2. Update the configuration constants below (PROXY_URL, PROXY_KEY, WEBHOOK_ENDPOINT)
    3. Get your Discord webhook ID and token
    4. Test with a player join/leave event
    5. Customize sendLogToDiscord() calls for your game logic
    
    CONFIGURATION:
    - PROXY_URL: The public URL of your RoProxy instance
    - PROXY_KEY: The secret key (must match PROXY_KEY in .env)
    - WEBHOOK_ENDPOINT: Your Discord webhook path
]]

local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

-- ============================================================================
-- CONFIGURATION - UPDATE THESE VALUES
-- ============================================================================

local PROXY_URL = "https://your-public-url.com:8080"
local PROXY_KEY = "your_secret_proxy_key"
local WEBHOOK_ENDPOINT = "webhooks.discord.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN"
local PLACE_ID = tostring(game.PlaceId)

-- Optional: Enable debug logging to console
local DEBUG_MODE = false

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

local function debugLog(message)
    if DEBUG_MODE then
        print("[SCIP-Bot] " .. message)
    end
end

local function errorLog(message)
    warn("[SCIP-Bot ERROR] " .. message)
end

--[[
    Send a log event to Discord through the bot webhook receiver.
    
    logData format:
    {
        title = "Event Title",                     -- Embed title
        description = "What happened",             -- Embed description
        username = "PlayerName",                   -- Player name
        userId = 123456789,                        -- Roblox user ID
        severity = "info|warning|error|success",   -- Color coding
        fields = {                                 -- Optional extra fields
            { name = "Field Name", value = "Value", inline = true }
        }
    }
]]
local function sendLogToDiscord(logData)
    if not logData or not logData.title then
        errorLog("Invalid log data: missing title")
        return
    end

    -- Sanitize inputs
    local payload = {
        title = tostring(logData.title):sub(1, 256),
        description = tostring(logData.description or ""):sub(1, 2048),
        username = tostring(logData.username or "Unknown"):sub(1, 100),
        userId = tonumber(logData.userId),
        placeId = tonumber(PLACE_ID),
        severity = tostring(logData.severity or "info"):lower(),
        timestamp = math.floor(os.time() * 1000),
        fields = logData.fields or {}
    }

    -- Validate severity
    if not table.find({"info", "success", "warning", "error"}, payload.severity) then
        payload.severity = "info"
    end

    -- Encode payload as JSON
    local jsonData
    local success, errorMsg = pcall(function()
        jsonData = HttpService:JSONEncode(payload)
    end)

    if not success then
        errorLog("Failed to encode JSON: " .. errorMsg)
        return
    end

    -- Prepare headers
    local headers = {
        ["Content-Type"] = "application/json",
        ["PROXYKEY"] = PROXY_KEY,
        ["Roblox-Id"] = PLACE_ID
    }

    -- Send POST request to proxy
    local fullUrl = PROXY_URL .. "/" .. WEBHOOK_ENDPOINT
    
    success, errorMsg = pcall(function()
        HttpService:PostAsync(
            fullUrl,
            jsonData,
            Enum.HttpContentType.ApplicationJson,
            false,
            headers
        )
    end)

    if success then
        debugLog("Log sent: " .. logData.title)
    else
        errorLog("Failed to send log: " .. errorMsg)
    end
end

-- ============================================================================
-- EXAMPLE: PLAYER JOIN/LEAVE EVENTS
-- ============================================================================

Players.PlayerAdded:Connect(function(player)
    wait(1) -- Wait for player to fully load
    
    sendLogToDiscord({
        title = "👤 Player Joined",
        description = "**" .. player.Name .. "** joined the game",
        username = player.Name,
        userId = player.UserId,
        severity = "success",
        fields = {
            {
                name = "Account Age",
                value = player.AccountAge .. " days",
                inline = true
            },
            {
                name = "Player Count",
                value = #Players:GetPlayers() .. " players online",
                inline = true
            }
        }
    })
end)

Players.PlayerRemoving:Connect(function(player)
    sendLogToDiscord({
        title = "👤 Player Left",
        description = "**" .. player.Name .. "** left the game",
        username = player.Name,
        userId = player.UserId,
        severity = "info",
        fields = {
            {
                name = "Remaining Players",
                value = (#Players:GetPlayers() - 1) .. " players online",
                inline = true
            }
        }
    })
end)

-- ============================================================================
-- EXAMPLE: SERVER STATUS LOGGING
-- ============================================================================

local statusCheckInterval = 300 -- Check every 5 minutes

local serverStartTime = tick()

game:BindToClose(function()
    local uptime = math.floor(tick() - serverStartTime)
    local hours = math.floor(uptime / 3600)
    local minutes = math.floor((uptime % 3600) / 60)
    
    sendLogToDiscord({
        title = "⚠️ Server Shutting Down",
        description = "The game server is closing",
        severity = "warning",
        fields = {
            {
                name = "Uptime",
                value = hours .. "h " .. minutes .. "m",
                inline = true
            },
            {
                name = "Final Player Count",
                value = #Players:GetPlayers() .. " players",
                inline = true
            }
        }
    })
end)

-- ============================================================================
-- EXAMPLE: ERROR LOGGING
-- ============================================================================

--[[
    Use this to log script errors. Add to error handling in your game:
    
    if error then
        logScriptError("Your Script Name", error)
    end
]]
local function logScriptError(scriptName, errorMsg)
    sendLogToDiscord({
        title = "❌ Script Error",
        description = "An error occurred in: **" .. scriptName .. "**",
        severity = "error",
        fields = {
            {
                name = "Error Message",
                value = "```\n" .. tostring(errorMsg):sub(1, 900) .. "\n```",
                inline = false
            }
        }
    })
end

-- ============================================================================
-- EXAMPLE: GLOBAL COMMAND LOGGING
-- ============================================================================

--[[
    Expose a global function for logging commands:
    
    _G.LogCommand("PlayerName", "command_name", "success")
]]
_G.LogCommand = function(playerName, command, result)
    sendLogToDiscord({
        title = "⚙️ Command Executed",
        description = "**" .. playerName .. "** executed a command",
        username = playerName,
        severity = "warning",
        fields = {
            {
                name = "Command",
                value = "`" .. command .. "`",
                inline = true
            },
            {
                name = "Result",
                value = result or "Success",
                inline = true
            }
        }
    })
end

-- ============================================================================
-- EXAMPLE: CUSTOM GAME EVENT LOGGING
-- ============================================================================

--[[
    Log custom game events. Examples:
    
    - Game round started/ended
    - Player achievement unlocked
    - Item purchased
    - Score milestone reached
    - PvP match results
    - Economy transactions
]]

local function logGameEvent(eventName, eventDetails, severity)
    severity = severity or "info"
    
    local fields = {}
    if eventDetails and type(eventDetails) == "table" then
        for key, value in pairs(eventDetails) do
            table.insert(fields, {
                name = key,
                value = tostring(value):sub(1, 1024),
                inline = #tostring(value) < 100
            })
        end
    end
    
    sendLogToDiscord({
        title = "📌 " .. eventName,
        description = "Game event: **" .. eventName .. "**",
        severity = severity,
        fields = fields
    })
end

-- Example usage:
-- logGameEvent("Round Started", { roundNumber = 1, players = 4 }, "info")
-- logGameEvent("Item Purchased", { playerName = "John", itemId = 42, price = 1000 }, "success")

-- ============================================================================
-- INITIALIZATION
-- ============================================================================

print("[SCIP-Bot] Script initialized")
debugLog("Proxy URL: " .. PROXY_URL)
debugLog("Place ID: " .. PLACE_ID)
debugLog("Webhook ready for events")

-- Test connection on startup (optional)
if DEBUG_MODE then
    sendLogToDiscord({
        title = "✅ Script Started",
        description = "SCIP-Bot Roblox integration is running",
        severity = "success"
    })
end
