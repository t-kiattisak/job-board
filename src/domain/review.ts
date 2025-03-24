import { Schema as S } from "effect"

export const SubmitReviewInput = S.Struct({
  jobId: S.String,
  rating: S.Number.pipe(
    S.int(),
    S.greaterThanOrEqualTo(1),
    S.lessThanOrEqualTo(5)
  ),
  comment: S.String.pipe(S.maxLength(500)),
})
