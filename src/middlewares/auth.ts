import { MiddlewareHandler } from "hono"
import { verify } from "jsonwebtoken"

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization")
  const token = authHeader?.split(" ")[1]

  if (!token) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  try {
    const payload = verify(token, "secret") as { sub: string }
    c.set("userId", payload.sub)
    await next()
  } catch {
    return c.json({ error: "Invalid token" }, 401)
  }
}
