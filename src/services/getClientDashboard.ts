import * as Effect from "effect/Effect"
import { prisma } from "../infrastructure/prisma"

export const getClientDashboard = (userId: string) =>
  Effect.gen(function* (_) {
    const postedJobs = yield* _(
      Effect.tryPromise({
        try: () => prisma.job.count({ where: { clientId: userId } }),
        catch: () => new Error("Failed to count posted jobs"),
      })
    )

    const completedJobs = yield* _(
      Effect.tryPromise({
        try: () =>
          prisma.job.count({
            where: { clientId: userId, status: "COMPLETED" },
          }),
        catch: () => new Error("Failed to count completed jobs"),
      })
    )

    const applicants = yield* _(
      Effect.tryPromise({
        try: () =>
          prisma.application.count({
            where: { job: { clientId: userId } },
          }),
        catch: () => new Error("Failed to count applicants"),
      })
    )

    return {
      success: true,
      stats: {
        postedJobs,
        completedJobs,
        totalApplicants: applicants,
      },
    }
  })
