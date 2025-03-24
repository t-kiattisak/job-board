import * as Effect from "effect/Effect"
import { prisma } from "../infrastructure/prisma"

export const getJobs = (url: URL) =>
  Effect.tryPromise({
    try: async () => {
      const q = url.searchParams.get("q")
      const skill = url.searchParams.get("skill")
      const minBudget = url.searchParams.get("minBudget")

      return prisma.job.findMany({
        where: {
          AND: [
            q
              ? {
                  OR: [
                    { title: { contains: q, mode: "insensitive" } },
                    { description: { contains: q, mode: "insensitive" } },
                  ],
                }
              : {},
            skill
              ? {
                  skills: {
                    some: {
                      skill: { name: skill },
                    },
                  },
                }
              : {},
            minBudget
              ? {
                  budget: {
                    gte: parseFloat(minBudget),
                  },
                }
              : {},
          ],
        },
        include: {
          skills: { include: { skill: true } },
          client: { select: { id: true, email: true } },
        },
      })
    },
    catch: () => new Error("Failed to fetch jobs"),
  })
