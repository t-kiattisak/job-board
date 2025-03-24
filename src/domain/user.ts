import { Schema as S } from "effect"

export const RegisterUserInput = S.Struct({
  email: S.String.pipe(S.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)),
  password: S.String.pipe(S.minLength(6)),
  role: S.Enums({ CLIENT: "CLIENT", FREELANCER: "FREELANCER" }),
})

export type RegisterUserInput = typeof RegisterUserInput.Type
