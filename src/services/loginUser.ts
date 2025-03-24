import { LoginInput } from "../domain/auth"
import { prisma } from "../infrastructure/prisma"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { Schema, Effect } from "effect"

export const loginUser = (input: unknown) =>
  Effect.gen(function* (_) {
    const parsed = Schema.decodeUnknownSync(LoginInput)(input)

    const user = yield* _(
      Effect.tryPromise({
        try: () =>
          prisma.user.findUnique({
            where: { email: parsed.email },
          }),
        catch: () => new Error("User lookup failed"),
      })
    )

    if (!user) {
      return yield* _(Effect.fail(new Error("User not found")))
    }

    const isMatch = yield* _(
      Effect.tryPromise({
        try: () => bcrypt.compare(parsed.password, user.password),
        catch: () => new Error("Password check failed"),
      })
    )

    if (!isMatch) {
      return yield* _(Effect.fail(new Error("Invalid credentials")))
    }

    const token = jwt.sign({ sub: user.id }, "secret", { expiresIn: "1h" })

    return {
      success: true,
      accessToken: token,
    }
  })
