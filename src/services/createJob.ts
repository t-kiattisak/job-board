import { Effect, Schema } from "effect"
import { CreateJobInput } from "../domain/job"
import { prisma } from "../infrastructure/prisma"

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
