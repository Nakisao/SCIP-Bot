xnode:events:497
      throw er; // Unhandled 'error' event
      ^

chat im not smith whats wrong with u 

ReferenceError: Collection is not defined
    at Object.execute (C:\Users\Smith\SCIP-Bot\src\events\interactionCreate.js:19:42)
    at Client.<anonymous> (C:\Users\Smith\SCIP-Bot\index.js:53:44)
    at Client.emit (node:events:519:28)
    at InteractionCreateAction.handle (C:\Users\Smith\SCIP-Bot\node_modules\discord.js\src\client\actions\InteractionCreate.js:101:12)
    at module.exports [as INTERACTION_CREATE] (C:\Users\Smith\SCIP-Bot\node_modules\discord.js\src\client\websocket\handlers\INTERACTION_CREATE.js:4:36)
    at WebSocketManager.handlePacket (C:\Users\Smith\SCIP-Bot\node_modules\discord.js\src\client\websocket\WebSocketManager.js:352:31)
    at WebSocketManager.<anonymous> (C:\Users\Smith\SCIP-Bot\node_modules\discord.js\src\client\websocket\WebSocketManager.js:236:12)
    at WebSocketManager.emit (C:\Users\Smith\SCIP-Bot\node_modules\@vladfrangu\async_event_emitter\dist\index.cjs:2504:31)
    at WebSocketShard.<anonymous> (C:\Users\Smith\SCIP-Bot\node_modules\@discordjs\ws\dist\index.js:1190:51)
    at WebSocketShard.emit (C:\Users\Smith\SCIP-Bot\node_modules\@vladfrangu\async_event_emitter\dist\index.cjs:2504:31)
Emitted 'error' event on Client instance at:
    at emitUnhandledRejectionOrErr (node:events:402:10)
    at process.processTicksAndRejections (node:internal/process/task_queues:92:21)

Node.js v22.19.0