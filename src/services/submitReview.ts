import * as Effect from "effect/Effect"
import { SubmitReviewInput } from "../domain/review"
import { prisma } from "../infrastructure/prisma"
import { Schema } from "@effect/Schema"

export const submitReview = (input: unknown, reviewerId: string) =>
  Effect.gen(function* (_) {
    const parsed = Schema.decodeUnknownSync(SubmitReviewInput)(input)

    const job = yield* _(
      Effect.tryPromise({
        try: () =>
          prisma.job.findUnique({
            where: { id: parsed.jobId },
            select: { selectedUserId: true, clientId: true },
          }),
        catch: () => new Error("Failed to fetch job"),
      })
    )

    if (!job || job.selectedUserId !== reviewerId) {
      return yield* _(
        Effect.fail(new Error("Not authorized to review this job"))
      )
    }

    const review = yield* _(
      Effect.tryPromise({
        try: () =>
          prisma.review.create({
            data: {
              fromUserId: reviewerId,
              toUserId: job.clientId,
              rating: parsed.rating,
              comment: parsed.comment,
            },
          }),
        catch: () => new Error("Failed to create review"),
      })
    )

    return {
      success: true,
      reviewId: review.id,
    }
  })
