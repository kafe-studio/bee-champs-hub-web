/**
 * InquiryRepository — pristup k DB pro poptavky
 */
import { Context, Effect, Layer } from "effect"
import { drizzle } from "drizzle-orm/d1"
import { inquiries } from "@bee-champs/db"
import { DatabaseError } from "../errors"

export interface InquiryInput {
  readonly schoolName: string
  readonly schoolType: string
  readonly city: string
  readonly childrenCount: number
  readonly ageRange: string
  readonly contactName: string
  readonly contactPosition: string | undefined
  readonly contactPhone: string
  readonly contactEmail: string
  readonly hasGym: string | undefined
  readonly hasPlayground: string | undefined
  readonly notes: string | undefined
  readonly selectedPrograms: string
}

export interface InquiryRepository {
  readonly insert: (data: InquiryInput) => Effect.Effect<{ readonly id: number }, DatabaseError>
}

export const InquiryRepository = Context.GenericTag<InquiryRepository>("InquiryRepository")

export const InquiryRepositoryLive = (db: D1Database): Layer.Layer<InquiryRepository> => {
  const d1 = drizzle(db)
  return Layer.succeed(InquiryRepository, {
    insert: (data) =>
      Effect.gen(function* () {
        const rows = yield* Effect.tryPromise({
          try: () =>
            d1.insert(inquiries).values({
              schoolName: data.schoolName,
              schoolType: data.schoolType,
              city: data.city,
              childrenCount: data.childrenCount,
              ageRange: data.ageRange,
              contactName: data.contactName,
              contactPosition: data.contactPosition ?? null,
              contactPhone: data.contactPhone,
              contactEmail: data.contactEmail,
              hasGym: data.hasGym ?? null,
              hasPlayground: data.hasPlayground ?? null,
              notes: data.notes ?? null,
              selectedPrograms: data.selectedPrograms,
            }).returning({ id: inquiries.id }),
          catch: (cause) => new DatabaseError({ cause }),
        })
        return { id: rows[0]!.id }
      }),
  })
}
