import { Schema as S } from "effect"

export const SendMessageInput = S.Struct({
  jobId: S.String,
  content: S.String.pipe(S.minLength(1), S.maxLength(1000)),
})
