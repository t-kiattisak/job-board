import { prisma } from "../infrastructure/prisma"
import { Effect } from "effect"

export const getApplicationsForJob = (jobId: string, userId: string) =>
  Effect.tryPromise({
    try: async () => {
      const job = await prisma.job.findFirst({
        where: { id: jobId, clientId: userId },
      })
      if (!job) throw new Error("Unauthorized")

      return prisma.application.findMany({
        where: { jobId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: true,
            },
          },
        },
      })
    },
    catch: () => new Error("Failed to fetch applications"),
  })
