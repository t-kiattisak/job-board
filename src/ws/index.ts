import { ServerWebSocket } from "bun"
import { handleChatMessage } from "../services/handleChatMessage"
import * as Effect from "effect/Effect"

interface WebSocketData {
  type: "chat" | "job" | "admin"
  jobId?: string
}

interface JobWebSocket extends ServerWebSocket<WebSocketData> {
  jobId?: string
}

type RoomMap = Map<string, Set<JobWebSocket>>
const adminRoom: Set<JobWebSocket> = new Set()
const rooms: RoomMap = new Map()

Bun.serve({
  port: 8080,

  fetch(req, server) {
    const url = new URL(req.url)
    const path = url.pathname

    if (path === "/chat") {
      // General chat WebSocket endpoint
      if (server.upgrade(req, { data: { type: "chat" } })) return
    } else if (path.match(/^\/chat\/job\/[\w-]+$/)) {
      // Extract jobId from URL for direct job connection
      const jobId = path.split("/").pop()
      if (server.upgrade(req, { data: { type: "job", jobId } })) return
    } else if (path === "/admin") {
      // Admin monitoring WebSocket endpoint
      if (server.upgrade(req, { data: { type: "admin" } })) return
    } else if (path === "/") {
      // Legacy endpoint with no path
      if (server.upgrade(req, { data: { type: "chat" } })) return
    }

    return new Response("Invalid WebSocket endpoint", { status: 404 })
  },

  websocket: {
    open(ws: JobWebSocket) {
      console.log(`🔌 Client connected to ${ws.data.type} endpoint`)

      // Auto-join based on connection path
      if (ws.data.type === "job" && ws.data.jobId) {
        // Auto-join specific job room based on URL
        handleJoinMessage(ws, { jobId: ws.data.jobId })
      } else if (ws.data.type === "admin") {
        // Auto-join admin room
        handleAdminJoinMessage(ws, {})
      }
    },

    async message(ws: JobWebSocket, raw: string | Buffer) {
      try {
        const msg = JSON.parse(raw.toString())

        switch (msg.type) {
          case "join":
            handleJoinMessage(ws, msg)
            break
          case "typing":
            handleTypingMessage(ws, msg)
            break
          case "chat":
            await processChatMessage(ws, msg)
            break
          case "admin:join":
            // Only allow admin:join from admin endpoint
            if (ws.data.type === "admin") {
              handleAdminJoinMessage(ws, msg)
            } else {
              ws.send(
                JSON.stringify({
                  type: "error",
                  message:
                    "Administrative operations not allowed from this endpoint",
                })
              )
            }
            break
          default:
            ws.send(
              JSON.stringify({ type: "error", message: "Unknown message type" })
            )
        }
      } catch (err) {
        console.error("Message handling error:", err)
        ws.send(JSON.stringify({ type: "error", message: "Invalid format" }))
      }
    },

    close(ws: JobWebSocket) {
      if (ws.jobId && rooms.has(ws.jobId)) {
        const room = rooms.get(ws.jobId)!
        room.delete(ws)
        // Clean up empty rooms
        if (room.size === 0) {
          rooms.delete(ws.jobId)
          console.log(`Room for job ${ws.jobId} deleted (empty)`)
        }
      } else {
        // Fallback to checking all rooms
        for (const room of rooms.values()) {
          room.delete(ws)
        }
      }

      adminRoom.delete(ws)
      console.log("❌ Client disconnected")
    },
  },
})

console.log("✅ WebSocket server running with the following endpoints:")
console.log("  - ws://localhost:8080/chat - General chat connection")
console.log(
  "  - ws://localhost:8080/chat/job/{jobId} - Direct job chat connection"
)
console.log("  - ws://localhost:8080/admin - Admin monitoring connection")

function handleJoinMessage(ws: JobWebSocket, msg: any) {
  const jobId = msg.jobId

  if (!jobId) {
    ws.send(
      JSON.stringify({ type: "error", message: "Missing jobId parameter" })
    )
    return
  }

  if (!rooms.has(jobId)) rooms.set(jobId, new Set())
  rooms.get(jobId)?.add(ws)

  ws.jobId = jobId

  ws.send(JSON.stringify({ type: "chat:joined", jobId }))
}

function handleTypingMessage(ws: JobWebSocket, msg: any) {
  const payload = {
    type: "typing",
    senderId: msg.senderId,
    jobId: msg.jobId,
    isTyping: msg.isTyping,
    timestamp: Date.now(),
  }

  const room = rooms.get(msg.jobId)
  for (const client of room ?? []) {
    if (client !== ws && client.readyState === 1) {
      client.send(JSON.stringify(payload))
    }
  }
}

async function processChatMessage(ws: JobWebSocket, msg: any) {
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

  for (const admin of adminRoom) {
    if (admin.readyState === 1) {
      admin.send(
        JSON.stringify({
          type: "chat:monitor",
          jobId: msg.jobId,
          senderId: msg.senderId,
          content: msg.content,
          createdAt: new Date().toISOString(),
        })
      )
    }
  }

  ws.send(JSON.stringify({ type: "chat:ack", message: jobId }))
}

function handleAdminJoinMessage(ws: JobWebSocket, msg: any) {
  adminRoom.add(ws)
  ws.send(JSON.stringify({ type: "admin:joined" }))
}
