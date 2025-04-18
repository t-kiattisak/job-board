import { Hono } from "hono"
import { authMiddleware } from "../middlewares/auth"
import { exportReportData } from "../services/exportReport"
import * as Effect from "effect/Effect"

const exportRoute = new Hono<{ Variables: { userId: string } }>()

exportRoute.get("/report", authMiddleware, async (c) => {
  const userId = c.get("userId")
  const result = await Effect.runPromise(exportReportData(userId))
  return c.json(result)
})

export default exportRoute
