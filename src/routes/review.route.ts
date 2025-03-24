import { Hono } from "hono"
import { authMiddleware } from "../middlewares/auth"
import { submitReview } from "../services/submitReview"
import * as Effect from "effect/Effect"

const reviewRoute = new Hono<{ Variables: { userId: string } }>()

reviewRoute.post("/", authMiddleware, async (c) => {
  const body = await c.req.json()
  const reviewerId = c.get("userId")
  const result = await Effect.runPromise(submitReview(body, reviewerId))
  return c.json(result)
})

export default reviewRoute
