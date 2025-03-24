import { Hono } from "hono"
import { authMiddleware } from "../middlewares/auth"
import { requireClientRole } from "../middlewares/requireClientRole"
import { createJob } from "../services/createJob"
import { Effect } from "effect"
import { getJobs } from "../services/getJobs"

const jobRoute = new Hono<{ Variables: { userId: string } }>()

jobRoute.post("/", authMiddleware, requireClientRole, async (c) => {
  const body = await c.req.json()
  const userId = c.get("userId")
  const result = await Effect.runPromise(createJob(body, userId))
  return c.json(result)
})

jobRoute.get("/", async (c) => {
  const url = new URL(c.req.url)
  const jobs = await Effect.runPromise(getJobs(url))
  return c.json({ success: true, jobs })
})

export default jobRoute
