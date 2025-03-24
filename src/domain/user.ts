import * as S from "@effect/schema/Schema"

export const RegisterUserInput = S.Struct({
  email: S.String.pipe(S.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)),
  password: S.String.pipe(S.minLength(6)),
}).pipe()

export type RegisterUserInput = typeof RegisterUserInput.Type
