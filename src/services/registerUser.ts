import { Effect, Schema } from "effect"
import { RegisterUserInput } from "../domain/user"
import { prisma } from "../infrastructure/prisma"
import bcrypt from "bcryptjs"

export const registerUser = (input: unknown) => {
  return Effect.gen(function* (_) {
    const parsed = Schema.decodeUnknownSync(RegisterUserInput)(input)

    const hashedPassword = yield* _(
      Effect.tryPromise({
        try: () => bcrypt.hash(parsed.password, 10),
        catch: () => new Error("Hashing error"),
      })
    )

    const user = yield* _(
      Effect.tryPromise({
        try: () =>
          prisma.user.create({
            data: {
              email: parsed.email,
              password: hashedPassword,
              role: "FREELANCER",
            },
          }),
        catch: () => new Error("Create user failed"),
      })
    )

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    }
  })
}
