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
import { completeJob } from "../services/completeJob"
import { uploadResume } from "../services/uploadResume"
import { getApplicationsForJob } from "../services/getApplicationsForJob"

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

jobRoute.patch(
  "/:id/complete",
  authMiddleware,
  requireClientRole,
  async (c) => {
    const jobId = c.req.param("id")
    const userId = c.get("userId")
    const result = await Effect.runPromise(completeJob(jobId, userId))
    return c.json(result)
  }
)

jobRoute.post(
  "/:id/upload-resume",
  authMiddleware,
  requireFreelancerRole,
  async (c) => {
    const jobId = c.req.param("id")
    const userId = c.get("userId")
    const form = await c.req.formData()
    const file = form.get("resume") as File

    const result = await Effect.runPromise(uploadResume(jobId, userId, file))
    return c.json(result)
  }
)

jobRoute.get(
  "/:id/applications",
  authMiddleware,
  requireClientRole,
  async (c) => {
    const jobId = c.req.param("id")
    const userId = c.get("userId")
    const result = await Effect.runPromise(getApplicationsForJob(jobId, userId))
    return c.json({ success: true, applications: result })
  }
)

export default jobRoute
