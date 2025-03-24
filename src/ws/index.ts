import { ServerWebSocket } from "bun"
import { handleChatMessage } from "../services/handleChatMessage"
import * as Effect from "effect/Effect"

type RoomMap = Map<string, Set<ServerWebSocket<undefined>>>
const rooms: RoomMap = new Map()

Bun.serve({
  port: 8080,

  fetch(req, server) {
    if (server.upgrade(req)) return
    return new Response("WebSocket only", { status: 400 })
  },
  websocket: {
    open(ws: ServerWebSocket<undefined>) {
      console.log("🔌 Client connected")
    },

    async message(ws: ServerWebSocket<undefined>, raw: string | Buffer) {
      try {
        const msg = JSON.parse(raw.toString())

        if (msg.type === "join") {
          const jobId = msg.jobId

          if (!rooms.has(jobId)) rooms.set(jobId, new Set())
          rooms.get(jobId)?.add(ws)

          // @ts-ignore
          ws.jobId = jobId

          ws.send(JSON.stringify({ type: "chat:joined", jobId }))
        } else if (msg.type === "chat") {
          const result = await Effect.runPromise(handleChatMessage(msg))

          const jobId = msg.jobId
          const room = rooms.get(jobId)
          for (const client of room ?? []) {
            if (client !== ws && client.readyState === 1) {
              client.send(
                JSON.stringify({
                  type: "chat",
                  jobId: jobId,
                  senderId: msg.senderId,
                  content: msg.content,
                  result,
                  createdAt: new Date().toISOString(),
                })
              )
            }
          }

          ws.send(JSON.stringify({ type: "chat:ack", message: jobId }))
        }
      } catch (err) {
        console.log(err)

        ws.send(JSON.stringify({ type: "error", message: "Invalid format" }))
      }
    },

    close(ws: ServerWebSocket<undefined>) {
      console.log("❌ Client disconnected")
    },
  },
})

console.log("✅ WebSocket server running at ws://localhost:8080")
