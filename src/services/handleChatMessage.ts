import * as Effect from "effect/Effect"
import { ChatMessageInput } from "../domain/chat"
import { prisma } from "../infrastructure/prisma"
import { Schema } from "@effect/Schema"

export const handleChatMessage = (input: unknown) =>
  Effect.gen(function* (_) {
    const parsed = Schema.decodeUnknownSync(ChatMessageInput)(input)

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
        catch: () => new Error("Job not found"),
      })
    )

    if (
      !job ||
      (job.clientId !== parsed.senderId &&
        job.selectedUserId !== parsed.senderId)
    ) {
      return yield* _(Effect.fail(new Error("Not authorized for this job")))
    }

    // บันทึกข้อความลงฐานข้อมูล
    const saved = yield* _(
      Effect.tryPromise({
        try: () =>
          prisma.message.create({
            data: {
              jobId: parsed.jobId,
              senderId: parsed.senderId,
              content: parsed.content,
            },
          }),
        catch: () => new Error("Failed to save message"),
      })
    )

    return {
      id: saved.id,
      content: saved.content,
      senderId: saved.senderId,
      jobId: saved.jobId,
      createdAt: saved.createdAt,
    }
  })
