import { MiddlewareHandler } from "hono"
import { prisma } from "../infrastructure/prisma"

export const requireClientRole: MiddlewareHandler = async (c, next) => {
  const userId = c.get("userId")
  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user || user.role !== "CLIENT") {
    return c.json({ error: "Only CLIENTs can post jobs" }, 403)
  }

  await next()
}
