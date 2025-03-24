import { Hono } from "hono"
import { authMiddleware } from "../middlewares/auth"
import { getFreelancerDashboard } from "../services/getFreelancerDashboard"
import * as Effect from "effect/Effect"
import { getClientDashboard } from "../services/getClientDashboard"

const dashboardRoute = new Hono<{ Variables: { userId: string } }>()

dashboardRoute.get("/freelancer", authMiddleware, async (c) => {
  const userId = c.get("userId")
  const result = await Effect.runPromise(getFreelancerDashboard(userId))
  return c.json(result)
})

dashboardRoute.get("/client", authMiddleware, async (c) => {
  const userId = c.get("userId")
  const result = await Effect.runPromise(getClientDashboard(userId))
  return c.json(result)
})

export default dashboardRoute
