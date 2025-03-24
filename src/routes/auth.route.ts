import { Hono } from "hono"
import { registerUser } from "../services/registerUser"
import { Effect } from "effect"
import { loginUser } from "../services/loginUser"
import { authMiddleware } from "../middlewares/auth"
import { prisma } from "../infrastructure/prisma"

const authRoute = new Hono<{ Variables: { userId: string } }>()

authRoute.post("/register", async (c) => {
  const body = await c.req.json()
  const result = await Effect.runPromise(registerUser(body))
  return c.json(result)
})

authRoute.post("/login", async (c) => {
  const body = await c.req.json()
  const result = await Effect.runPromise(loginUser(body))
  return c.json(result)
})

authRoute.get("/me", authMiddleware, async (c) => {
  const userId = c.get("userId")
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  })

  if (!user) return c.json({ error: "User not found" }, 404)

  return c.json({ success: true, user })
})
export default authRoute
