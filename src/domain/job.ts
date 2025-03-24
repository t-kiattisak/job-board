import * as S from "@effect/schema/Schema"

export const CreateJobInput = S.Struct({
  title: S.String.pipe(S.minLength(3)),
  description: S.String.pipe(S.minLength(10)),
  budget: S.Number.pipe(S.nonNegative()),
  skills: S.Array(S.String.pipe(S.minLength(1))),
})
