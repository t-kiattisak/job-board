import { supabase } from "../infrastructure/supabase"
import { prisma } from "../infrastructure/prisma"
import { Effect } from "effect"

export const uploadResume = (jobId: string, userId: string, file: File) =>
  Effect.gen(function* (_) {
    const application = yield* _(
      Effect.promise(() =>
        prisma.application.findFirst({
          where: { jobId, userId },
        })
      )
    )

    if (!application) throw new Error("Application not found")

    const arrayBuffer = yield* _(Effect.promise(() => file.arrayBuffer()))
    const buffer = new Uint8Array(arrayBuffer)
    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    const contentType = file.type
    const baseFileName = file.name.split(".").slice(0, -1).join(".")
    const fileName = `${baseFileName}-${jobId}-${Date.now()}.${fileExtension}`

    const { error } = yield* _(
      Effect.promise(() =>
        supabase.storage
          .from(process.env.SUPABASE_BUCKET!)
          .upload(fileName, buffer, {
            contentType,
          })
      )
    )
    if (error) throw new Error("Upload to Supabase failed")

    yield* _(
      Effect.promise(() =>
        prisma.application.update({
          where: { id: application.id },
          data: {
            resumeUrl: `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/${fileName}`,
          },
        })
      )
    )

    return { success: true, resumeUrl: fileName }
  })
