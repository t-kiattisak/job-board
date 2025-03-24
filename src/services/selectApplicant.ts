import * as Effect from "effect/Effect"
import { prisma } from "../infrastructure/prisma"

export const selectApplicant = (
  jobId: string,
  applicationId: string,
  userId: string
) =>
  Effect.gen(function* (_) {
    // ตรวจว่า job นี้เป็นของ client ที่ส่งคำขอมา
    const job = yield* _(
      Effect.tryPromise({
        try: () =>
          prisma.job.findUnique({
            where: { id: jobId },
            select: { id: true, clientId: true },
          }),
        catch: () => new Error("Cannot verify job ownership"),
      })
    )

    if (!job || job.clientId !== userId) {
      return yield* _(
        Effect.fail(new Error("Unauthorized to select applicant for this job"))
      )
    }

    // อัปเดต application ที่เลือก
    const updated = yield* _(
      Effect.tryPromise({
        try: () =>
          prisma.application.update({
            where: { id: applicationId },
            data: { selected: true },
          }),
        catch: () => new Error("Failed to select applicant"),
      })
    )

    return { success: true, applicationId: updated.id }
  })
