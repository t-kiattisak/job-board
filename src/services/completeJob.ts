import * as Effect from "effect/Effect"
import { prisma } from "../infrastructure/prisma"

export const completeJob = (jobId: string, userId: string) =>
  Effect.gen(function* (_) {
    const job = yield* _(
      Effect.tryPromise({
        try: () =>
          prisma.job.findUnique({
            where: { id: jobId },
            select: { clientId: true },
          }),
        catch: () => new Error("Failed to fetch job"),
      })
    )

    if (!job || job.clientId !== userId) {
      return yield* _(
        Effect.fail(new Error("Unauthorized to complete this job"))
      )
    }

    const updated = yield* _(
      Effect.tryPromise({
        try: () =>
          prisma.job.update({
            where: { id: jobId },
            data: { status: "COMPLETED" },
          }),
        catch: () => new Error("Failed to complete job"),
      })
    )

    return {
      success: true,
      jobId: updated.id,
      status: updated.status,
    }
  })
