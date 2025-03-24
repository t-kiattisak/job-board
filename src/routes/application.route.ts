import { Hono } from "hono"
import { authMiddleware } from "../middlewares/auth"
import { requireFreelancerRole } from "../middlewares/requireFreelancerRole"
import { getMyApplications } from "../services/getMyApplications"
import * as Effect from "effect/Effect"

const appRoute = new Hono<{ Variables: { userId: string } }>()

appRoute.get("/me", authMiddleware, requireFreelancerRole, async (c) => {
  const userId = c.get("userId")
  const apps = await Effect.runPromise(getMyApplications(userId))
  return c.json({ success: true, applications: apps })
})

export default appRoute
