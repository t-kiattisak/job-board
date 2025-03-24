import * as Effect from "effect/Effect"
import { prisma } from "../infrastructure/prisma"

export const getMessages = (jobId: string, userId: string) =>
  Effect.gen(function* (_) {
    const job = yield* _(
      Effect.tryPromise({
        try: () =>
          prisma.job.findUnique({
            where: { id: jobId },
            select: {
              clientId: true,
              selectedUserId: true,
            },
          }),
        catch: () => new Error("Failed to verify job access"),
      })
    )

    if (!job || (job.clientId !== userId && job.selectedUserId !== userId)) {
      return yield* _(
        Effect.fail(new Error("Not authorized to view messages for this job"))
      )
    }

    const messages = yield* _(
      Effect.tryPromise({
        try: () =>
          prisma.message.findMany({
            where: { jobId },
            orderBy: { createdAt: "asc" },
          }),
        catch: () => new Error("Failed to load messages"),
      })
    )

    return { success: true, messages }
  })
