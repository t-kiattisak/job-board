import { Schema as S } from "effect"

export const ChatMessageInput = S.Struct({
  jobId: S.String,
  senderId: S.String,
  content: S.String.pipe(S.minLength(1), S.maxLength(1000)),
})
