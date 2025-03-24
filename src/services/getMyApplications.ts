import * as Effect from "effect/Effect"
import { prisma } from "../infrastructure/prisma"

export const getMyApplications = (userId: string) =>
  Effect.tryPromise({
    try: () =>
      prisma.application.findMany({
        where: { userId },
        include: {
          job: {
            include: {
              client: { select: { id: true, email: true } },
              skills: { include: { skill: true } },
            },
          },
        },
      }),
    catch: () => new Error("Failed to fetch applications"),
  })
