import * as S from "@effect/schema/Schema"

export const SendMessageInput = S.Struct({
  jobId: S.String,
  content: S.String.pipe(S.minLength(1), S.maxLength(1000)),
})
