import { Effect } from "effect"
import { prisma } from "../infrastructure/prisma"

export const applyToJob = (jobId: string, userId: string) =>
  Effect.gen(function* (_) {
    // ตรวจว่ามีการสมัครไปแล้วหรือยัง
    const existing = yield* _(
      Effect.tryPromise({
        try: () =>
          prisma.application.findFirst({
            where: { jobId, userId },
          }),
        catch: () => new Error("Check application failed"),
      })
    )

    if (existing) {
      return yield* _(Effect.fail(new Error("Already applied")))
    }

    const application = yield* _(
      Effect.tryPromise({
        try: () =>
          prisma.application.create({
            data: { jobId, userId },
          }),
        catch: () => new Error("Create application failed"),
      })
    )

    return {
      success: true,
      applicationId: application.id,
    }
  })
