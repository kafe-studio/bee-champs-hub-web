import type { APIRoute } from "astro"
import { Effect, Schema, pipe } from "effect"
import { eq } from "drizzle-orm"
import { testimonials } from "@bee-champs/db"
import { makeAstroRuntime } from "../../../../api/runtime"
import { DbRepository, DbRepositoryLive } from "../../../../api/db"
import { requireAdmin } from "../../../../api/auth"
import { TestimonialInput } from "../../../../api/schemas/admin"
import { NotFoundError, ValidationError } from "../../../../api/errors"
export const prerender = false

const withDb = makeAstroRuntime((env) => DbRepositoryLive(env.DB))

export const PUT: APIRoute = (context) => {
  const auth = requireAdmin(context)
  if (auth instanceof Response) return auth
  return withDb((_ctx) =>
    Effect.gen(function* () {
      const db = yield* DbRepository
      const id = Number(_ctx.params.id)
      if (!Number.isFinite(id) || id <= 0) return yield* Effect.fail(new ValidationError({ message: `Neplatne ID` }))
      const raw = yield* Effect.tryPromise({
        try: () => _ctx.request.json(),
        catch: () => new ValidationError({ message: "Neplatny JSON" }),
      })
      const body = yield* pipe(
        Schema.decodeUnknown(TestimonialInput)(raw),
        Effect.mapError((e) => new ValidationError({ message: "Neplatna data", detail: String(e) })),
      )
      const result = yield* db.query((d1) =>
        d1.update(testimonials).set({
          text: body.text,
          name: body.name,
          role: body.role,
          initials: body.initials,
          active: body.active,
          sortOrder: body.sortOrder,
        }).where(eq(testimonials.id, id)).returning()
      )
      if (result.length === 0) return yield* Effect.fail(new NotFoundError({ entity: "Reference", id }))
      return Response.json({ data: result[0] })
    })
  )(context)
}

export const DELETE: APIRoute = (context) => {
  const auth = requireAdmin(context)
  if (auth instanceof Response) return auth
  return withDb((_ctx) =>
    Effect.gen(function* () {
      const db = yield* DbRepository
      const id = Number(_ctx.params.id)
      if (!Number.isFinite(id) || id <= 0) return yield* Effect.fail(new ValidationError({ message: `Neplatne ID` }))
      yield* db.query((d1) => d1.delete(testimonials).where(eq(testimonials.id, id)))
      return Response.json({ data: { success: true } })
    })
  )(context)
}
