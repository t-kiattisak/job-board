import { Hono } from "hono"
import { getUserProfile } from "../services/getUserProfile"
import * as Effect from "effect/Effect"

const userRoute = new Hono()

userRoute.get("/:id", async (c) => {
  const userId = c.req.param("id")
  const result = await Effect.runPromise(getUserProfile(userId))
  return c.json({ success: true, user: result })
})

export default userRoute
