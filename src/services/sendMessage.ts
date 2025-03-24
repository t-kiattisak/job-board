import * as Effect from "effect/Effect"
import * as S from "@effect/schema/Schema"
import { SendMessageInput } from "../domain/message"
import { prisma } from "../infrastructure/prisma"
import { Schema } from "@effect/Schema"

export const sendMessage = (input: unknown, senderId: string) =>
  Effect.gen(function* (_) {
    const parsed = Schema.decodeUnknownSync(SendMessageInput)(input)

    const job = yield* _(
      Effect.tryPromise({
        try: () =>
          prisma.job.findUnique({
            where: { id: parsed.jobId },
            select: {
              clientId: true,
              selectedUserId: true,
            },
          }),
        catch: () => new Error("Failed to fetch job"),
      })
    )

    if (
      !job ||
      (job.clientId !== senderId && job.selectedUserId !== senderId)
    ) {
      return yield* _(Effect.fail(new Error("You are not part of this job")))
    }

    const message = yield* _(
      Effect.tryPromise({
        try: () =>
          prisma.message.create({
            data: {
              jobId: parsed.jobId,
              senderId,
              content: parsed.content,
            },
          }),
        catch: () => new Error("Failed to send message"),
      })
    )

    return { success: true, messageId: message.id }
  })
