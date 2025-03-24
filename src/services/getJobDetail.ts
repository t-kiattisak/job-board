import { Effect } from "effect"
import { prisma } from "../infrastructure/prisma"

export const getJobDetail = (jobId: string) =>
  Effect.tryPromise({
    try: () =>
      prisma.job.findUnique({
        where: { id: jobId },
        include: {
          client: {
            select: { id: true, email: true },
          },
          skills: {
            include: {
              skill: true,
            },
          },
          applications: {
            select: {
              id: true,
              user: {
                select: { id: true, email: true },
              },
            },
          },
        },
      }),
    catch: () => new Error("Failed to get job detail"),
  })
