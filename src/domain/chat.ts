import * as S from "@effect/schema/Schema"

export const ChatMessageInput = S.Struct({
  jobId: S.String,
  senderId: S.String,
  content: S.String.pipe(S.minLength(1), S.maxLength(1000)),
})
