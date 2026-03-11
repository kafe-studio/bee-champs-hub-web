import type { APIRoute } from "astro"
import { Effect, Schema, pipe } from "effect"
import { asc } from "drizzle-orm"
import { testimonials } from "@bee-champs/db"
import { makeAstroRuntime } from "../../../../api/runtime"
import { DbRepository, DbRepositoryLive } from "../../../../api/db"
import { requireAdmin } from "../../../../api/auth"
import { TestimonialInput } from "../../../../api/schemas/admin"
import { ValidationError } from "../../../../api/errors"
export const prerender = false

const withDb = makeAstroRuntime((env) => DbRepositoryLive(env.DB))

export const GET: APIRoute = (context) => {
  const auth = requireAdmin(context)
  if (auth instanceof Response) return auth
  return withDb((_ctx) =>
    Effect.gen(function* () {
      const db = yield* DbRepository
      const rows = yield* db.query((d1) => d1.select().from(testimonials).orderBy(asc(testimonials.sortOrder)))
      return Response.json({ data: rows })
    })
  )(context)
}

export const POST: APIRoute = (context) => {
  const auth = requireAdmin(context)
  if (auth instanceof Response) return auth
  return withDb((_ctx) =>
    Effect.gen(function* () {
      const db = yield* DbRepository
      const raw = yield* Effect.tryPromise({
        try: () => _ctx.request.json(),
        catch: () => new ValidationError({ message: "Neplatny JSON" }),
      })
      const body = yield* pipe(
        Schema.decodeUnknown(TestimonialInput)(raw),
        Effect.mapError((e) => new ValidationError({ message: "Neplatna data", detail: String(e) })),
      )
      const result = yield* db.query((d1) =>
        d1.insert(testimonials).values({
          text: body.text,
          name: body.name,
          role: body.role,
          initials: body.initials,
          sortOrder: body.sortOrder ?? 0,
        }).returning()
      )
      return Response.json({ data: result[0] }, { status: 201 })
    })
  )(context)
}
