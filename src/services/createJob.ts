import * as Effect from "effect/Effect"
import { CreateJobInput } from "../domain/job"
import { prisma } from "../infrastructure/prisma"
import { Schema } from "@effect/Schema"

export const createJob = (input: unknown, userId: string) =>
  Effect.gen(function* (_) {
    const parsed = Schema.decodeUnknownSync(CreateJobInput)(input)

    const job = yield* _(
      Effect.tryPromise({
        try: () =>
          prisma.job.create({
            data: {
              clientId: userId,
              title: parsed.title,
              description: parsed.description,
              budget: parsed.budget,
              skills: {
                create: parsed.skills.map((name) => ({
                  skill: {
                    connectOrCreate: {
                      where: { name },
                      create: { name },
                    },
                  },
                })),
              },
            },
          }),
        catch: () => new Error("Failed to create job"),
      })
    )

    return { success: true, jobId: job.id }
  })
