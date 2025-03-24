import * as Effect from "effect/Effect"
import { prisma } from "../infrastructure/prisma"

export const getFreelancerDashboard = (userId: string) =>
  Effect.gen(function* (_) {
    const applicationCount = yield* _(
      Effect.tryPromise({
        try: () => prisma.application.count({ where: { userId } }),
        catch: () => new Error("Failed to count applications"),
      })
    )

    const selectedCount = yield* _(
      Effect.tryPromise({
        try: () => prisma.job.count({ where: { selectedUserId: userId } }),
        catch: () => new Error("Failed to count selected jobs"),
      })
    )

    const reviews = yield* _(
      Effect.tryPromise({
        try: () =>
          prisma.review.findMany({
            where: { toUserId: userId },
            select: { rating: true },
          }),
        catch: () => new Error("Failed to fetch reviews"),
      })
    )

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : null

    return {
      success: true,
      stats: {
        appliedJobs: applicationCount,
        selectedJobs: selectedCount,
        averageRating,
      },
    }
  })
