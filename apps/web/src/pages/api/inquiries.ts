/**
 * POST /api/inquiries — prijme poptavku, ulozi do D1, posle email notifikaci
 */
import type { APIRoute } from "astro"
import { Effect, Schema, pipe, Layer } from "effect"
import { drizzle } from "drizzle-orm/d1"
import { eq } from "drizzle-orm"
import { settings } from "@bee-champs/db"
import { makeAstroRuntime } from "../../api/runtime"
import { InquiryRepository, InquiryRepositoryLive } from "../../api/inquiry/repository"
import { InquiryRequest } from "../../api/schemas/inquiry"
import { DatabaseError, ValidationError } from "../../api/errors"
import { sendInquiryNotification } from "../../api/utils/email"
export const prerender = false

const withInquiry = makeAstroRuntime((env) => InquiryRepositoryLive(env.DB))

export const POST: APIRoute = withInquiry((_ctx, env) =>
  Effect.gen(function* () {
    const body = yield* Effect.tryPromise({
      try: () => _ctx.request.json(),
      catch: () => new ValidationError({ message: "Neplatny JSON" }),
    })

    const decodeInquiry = Schema.decodeUnknown(InquiryRequest)
    const decoded = yield* pipe(
      decodeInquiry(body),
      Effect.mapError((parseError) => new ValidationError({ message: "Neplatna data", detail: String(parseError) })),
    )

    const repo = yield* InquiryRepository
    const result = yield* repo.insert({
      schoolName: decoded.schoolName,
      schoolType: decoded.schoolType,
      city: decoded.city,
      childrenCount: decoded.childrenCount,
      ageRange: decoded.ageRange,
      contactName: decoded.contactName,
      contactPosition: decoded.contactPosition,
      contactPhone: decoded.contactPhone,
      contactEmail: decoded.contactEmail,
      hasGym: decoded.hasGym,
      hasPlayground: decoded.hasPlayground,
      notes: decoded.notes,
      selectedPrograms: decoded.selectedPrograms,
    })

    // Email notifikace (fire-and-forget)
    const resendKey = env.RESEND_API_KEY
    if (resendKey) {
      yield* Effect.catchAll(
        Effect.gen(function* () {
          const d1 = drizzle(env.DB)
          const rows = yield* Effect.tryPromise({
            try: () => d1.select().from(settings).where(eq(settings.key, "notification_emails")),
            catch: (cause) => new DatabaseError({ cause }),
          })
          const emails = rows[0]?.value?.split(",").map((e: string) => e.trim()).filter(Boolean) ?? []
          if (emails.length === 0) return

          const parsedPrograms: ReadonlyArray<{ readonly name: string; readonly month: string }> = (() => {
            try {
              const arr = JSON.parse(decoded.selectedPrograms)
              if (!Array.isArray(arr)) return []
              return arr.flatMap((p: { readonly name?: string; readonly months?: readonly string[]; readonly month?: string }) => {
                const name = String(p.name ?? "")
                if (Array.isArray(p.months) && p.months.length > 0) {
                  return [{ name, month: p.months.join(", ") }]
                }
                return [{ name, month: String(p.month ?? "") }]
              })
            } catch { return [] }
          })()

          const allRecipients = [...emails]
          if (decoded.contactEmail && !allRecipients.includes(decoded.contactEmail.trim())) {
            allRecipients.push(decoded.contactEmail.trim())
          }

          yield* sendInquiryNotification({
            apiKey: resendKey,
            to: allRecipients,
            schoolName: decoded.schoolName,
            schoolType: decoded.schoolType,
            contactName: decoded.contactName,
            contactEmail: decoded.contactEmail,
            contactPhone: decoded.contactPhone,
            contactPosition: decoded.contactPosition ?? "",
            city: decoded.city,
            childrenCount: decoded.childrenCount,
            ageRange: decoded.ageRange,
            hasGym: decoded.hasGym ?? "",
            hasPlayground: decoded.hasPlayground ?? "",
            notes: decoded.notes ?? "",
            programCount: parsedPrograms.length,
            programs: parsedPrograms,
            appUrl: env.APP_URL ?? "https://beechampshub.cz",
          })
        }),
        (err) => Effect.logWarning(`[Inquiry] Email notifikace selhala: ${String(err)}`),
      )
    }

    return Response.json({ success: true, id: result.id }, { status: 201 })
  })
)
