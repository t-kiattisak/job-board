import { Hono } from "hono"
import { authMiddleware } from "../middlewares/auth"
import { requireClientRole } from "../middlewares/requireClientRole"
import { createJob } from "../services/createJob"
import { Effect } from "effect"
import { getJobs } from "../services/getJobs"
import { requireFreelancerRole } from "../middlewares/requireFreelancerRole"
import { applyToJob } from "../services/applyToJob"
import { getJobDetail } from "../services/getJobDetail"
import { selectApplicant } from "../services/selectApplicant"

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

jobRoute.post(
  "/:id/apply",
  authMiddleware,
  requireFreelancerRole,
  async (c) => {
    const userId = c.get("userId")
    const jobId = c.req.param("id")
    const result = await Effect.runPromise(applyToJob(jobId, userId))
    return c.json(result)
  }
)

jobRoute.get("/:id", async (c) => {
  const jobId = c.req.param("id")
  const result = await Effect.runPromise(getJobDetail(jobId))
  return c.json({ success: true, job: result })
})

jobRoute.post(
  "/:jobId/select/:applicationId",
  authMiddleware,
  requireClientRole,
  async (c) => {
    const userId = c.get("userId")
    const jobId = c.req.param("jobId")
    const applicationId = c.req.param("applicationId")
    const result = await Effect.runPromise(
      selectApplicant(jobId, applicationId, userId)
    )
    return c.json(result)
  }
)

export default jobRoute
