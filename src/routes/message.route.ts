import { Hono } from "hono"
import { authMiddleware } from "../middlewares/auth"
import { sendMessage } from "../services/sendMessage"
import * as Effect from "effect/Effect"
import { getMessages } from "../services/getMessages"
import { markMessagesAsSeen } from "../services/markMessagesAsSeen"

const messageRoute = new Hono<{ Variables: { userId: string } }>()

messageRoute.post("/", authMiddleware, async (c) => {
  const body = await c.req.json()
  const senderId = c.get("userId")
  const result = await Effect.runPromise(sendMessage(body, senderId))
  return c.json(result)
})

messageRoute.get("/:jobId", authMiddleware, async (c) => {
  const jobId = c.req.param("jobId")
  const userId = c.get("userId")
  const result = await Effect.runPromise(getMessages(jobId, userId))
  return c.json(result)
})

messageRoute.post("/:jobId/seen", authMiddleware, async (c) => {
  const jobId = c.req.param("jobId")
  const userId = c.get("userId")
  const result = await Effect.runPromise(markMessagesAsSeen(jobId, userId))
  return c.json(result)
})

export default messageRoute
