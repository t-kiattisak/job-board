import * as Effect from "effect/Effect"
import { prisma } from "../infrastructure/prisma"

export const markMessagesAsSeen = (jobId: string, userId: string) =>
  Effect.gen(function* (_) {
    const updated = yield* _(
      Effect.tryPromise({
        try: () =>
          prisma.message.updateMany({
            where: {
              jobId,
              NOT: { seenBy: { has: userId } },
              senderId: { not: userId },
            },
            data: {
              seenBy: { push: userId },
            },
          }),
        catch: () => new Error("Failed to mark messages as seen"),
      })
    )

    return { success: true, updatedCount: updated.count }
  })
