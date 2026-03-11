/**
 * Validacni schema pro poptavkovy formular
 */
import { Schema, pipe } from "effect"

const PositiveInt = pipe(Schema.Number, Schema.positive(), Schema.int())
const Email = pipe(
  Schema.NonEmptyString,
  Schema.filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) || "Neplatny e-mail"),
)

export class InquiryRequest extends Schema.Class<InquiryRequest>("InquiryRequest")({
  schoolName: Schema.NonEmptyString,
  schoolType: Schema.NonEmptyString,
  city: Schema.NonEmptyString,
  childrenCount: PositiveInt,
  ageRange: Schema.NonEmptyString,
  contactName: Schema.NonEmptyString,
  contactPhone: Schema.NonEmptyString,
  contactEmail: Email,
  contactPosition: Schema.optional(Schema.String),
  hasGym: Schema.optional(Schema.String),
  hasPlayground: Schema.optional(Schema.String),
  notes: Schema.optional(Schema.String),
  selectedPrograms: Schema.NonEmptyString,
}) {}
