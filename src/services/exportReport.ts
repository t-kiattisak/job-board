import { Effect } from "effect"
import { prisma } from "../infrastructure/prisma"

export const exportReportData = (userId: string) =>
  Effect.gen(function* (_) {
    const jobs = yield* _(
      Effect.tryPromise({
        try: () =>
          prisma.job.findMany({
            where: { clientId: userId },
            include: {
              skills: { include: { skill: true } },
              applications: { include: { user: true } },
              Message: true,
            },
          }),
        catch: () => new Error("Failed to fetch jobs"),
      })
    )

    const applications = yield* _(
      Effect.tryPromise({
        try: () =>
          prisma.application.findMany({
            where: { userId },
            include: { job: true },
          }),
        catch: () => new Error("Failed to fetch applications"),
      })
    )

    const reviews = yield* _(
      Effect.tryPromise({
        try: () =>
          prisma.review.findMany({
            where: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
            include: {
              fromUser: { select: { id: true, email: true } },
              toUser: { select: { id: true, email: true } },
              job: true,
            },
          }),
        catch: () => new Error("Failed to fetch reviews"),
      })
    )

    return {
      success: true,
      export: {
        jobs,
        applications,
        reviews,
      },
    }
  })
