import { Effect } from "effect"
import { prisma } from "../infrastructure/prisma"

export const getUserProfile = (userId: string) =>
  Effect.tryPromise({
    try: () =>
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          reviewsReceived: {
            select: {
              id: true,
              rating: true,
              comment: true,
              fromUser: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
    catch: () => new Error("Failed to fetch user profile"),
  })
