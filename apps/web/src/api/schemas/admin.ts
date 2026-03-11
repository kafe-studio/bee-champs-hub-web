/**
 * Validacni schemy pro admin API
 */
import { Schema } from "effect"

export class LoginRequest extends Schema.Class<LoginRequest>("LoginRequest")({
  token: Schema.NonEmptyString,
}) {}

export class ProgramInput extends Schema.Class<ProgramInput>("ProgramInput")({
  slug: Schema.NonEmptyString,
  categorySlug: Schema.NonEmptyString,
  name: Schema.NonEmptyString,
  icon: Schema.NonEmptyString,
  description: Schema.NonEmptyString,
  ageRange: Schema.NonEmptyString,
  duration: Schema.NonEmptyString,
  instructors: Schema.NonEmptyString,
  sortOrder: Schema.optional(Schema.Number),
  active: Schema.optional(Schema.Boolean),
}) {}

export class CategoryInput extends Schema.Class<CategoryInput>("CategoryInput")({
  name: Schema.NonEmptyString,
  label: Schema.NonEmptyString,
  icon: Schema.NonEmptyString,
  color: Schema.NonEmptyString,
  description: Schema.NonEmptyString,
}) {}

export class TestimonialInput extends Schema.Class<TestimonialInput>("TestimonialInput")({
  text: Schema.NonEmptyString,
  name: Schema.NonEmptyString,
  role: Schema.NonEmptyString,
  initials: Schema.NonEmptyString,
  sortOrder: Schema.optional(Schema.Number),
  active: Schema.optional(Schema.Boolean),
}) {}
