import { MiddlewareHandler } from "hono"
import { prisma } from "../infrastructure/prisma"

export const requireFreelancerRole: MiddlewareHandler = async (c, next) => {
  const userId = c.get("userId")
  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user || user.role !== "FREELANCER") {
    return c.json({ error: "Only FREELANCERs can apply to jobs" }, 403)
  }

  await next()
}
