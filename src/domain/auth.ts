import * as S from "@effect/schema/Schema"

export const LoginInput = S.Struct({
  email: S.String.pipe(S.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)),
  password: S.String.pipe(S.minLength(6)),
})

export type LoginInput = typeof LoginInput.Type
