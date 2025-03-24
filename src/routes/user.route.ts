import { Hono } from "hono"
import { getUserProfile } from "../services/getUserProfile"
import * as Effect from "effect/Effect"
import { authMiddleware } from "../middlewares/auth"
import { exportUserData } from "../services/exportUserData"
import { stringify } from "csv-stringify/sync"

const userRoute = new Hono<{ Variables: { userId: string } }>()

userRoute.get("/:id", async (c) => {
  const userId = c.req.param("id")
  const result = await Effect.runPromise(getUserProfile(userId))
  return c.json({ success: true, user: result })
})

userRoute.get("/export/me", authMiddleware, async (c) => {
  const userId = c.get("userId")
  const data = await Effect.runPromise(exportUserData(userId))

  const csv = stringify([
    ["type", "id", "content"],
    ...data.messages.map((m) => ["message", m.id, m.content]),
    ...data.jobs.map((j) => ["job", j.id, j.title]),
    ...data.applications.map((a) => ["application", a.id, a.jobId]),
    ...data.reviewsGiven.map((r) => ["reviewGiven", r.id, r.comment]),
    ...data.reviewsReceived.map((r) => ["reviewReceived", r.id, r.comment]),
  ])

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=export-${userId}.csv`,
    },
  })
})
export default userRoute
