import { Hono } from "hono"
import { authMiddleware } from "../middlewares/auth"
import { sendMessage } from "../services/sendMessage"
import * as Effect from "effect/Effect"

const messageRoute = new Hono<{ Variables: { userId: string } }>()

messageRoute.post("/", authMiddleware, async (c) => {
  const body = await c.req.json()
  const senderId = c.get("userId")
  const result = await Effect.runPromise(sendMessage(body, senderId))
  return c.json(result)
})

export default messageRoute
