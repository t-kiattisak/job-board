import * as Effect from "effect/Effect"
import { prisma } from "../infrastructure/prisma"

export const exportUserData = (userId: string) =>
  Effect.gen(function* (_) {
    const user = yield* _(
      Effect.tryPromise({
        try: () => prisma.user.findUnique({ where: { id: userId } }),
        catch: () => new Error("Failed to fetch user"),
      })
    )

    const jobs = yield* _(
      Effect.tryPromise({
        try: () => prisma.job.findMany({ where: { clientId: userId } }),
        catch: () => new Error("Failed to fetch jobs"),
      })
    )

    const applications = yield* _(
      Effect.tryPromise({
        try: () => prisma.application.findMany({ where: { userId } }),
        catch: () => new Error("Failed to fetch applications"),
      })
    )

    const reviewsGiven = yield* _(
      Effect.tryPromise({
        try: () => prisma.review.findMany({ where: { fromUserId: userId } }),
        catch: () => new Error("Failed to fetch reviews (given)"),
      })
    )

    const reviewsReceived = yield* _(
      Effect.tryPromise({
        try: () => prisma.review.findMany({ where: { toUserId: userId } }),
        catch: () => new Error("Failed to fetch reviews (received)"),
      })
    )

    const messages = yield* _(
      Effect.tryPromise({
        try: () => prisma.message.findMany({ where: { senderId: userId } }),
        catch: () => new Error("Failed to fetch messages"),
      })
    )

    return {
      user,
      jobs,
      applications,
      reviewsGiven,
      reviewsReceived,
      messages,
    }
  })
