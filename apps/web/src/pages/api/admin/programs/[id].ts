import type { APIRoute } from "astro"
import { Effect, Schema, pipe } from "effect"
import { eq } from "drizzle-orm"
import { programs } from "@bee-champs/db"
import { makeAstroRuntime } from "../../../../api/runtime"
import { DbRepository, DbRepositoryLive } from "../../../../api/db"
import { requireAdmin } from "../../../../api/auth"
import { ProgramInput } from "../../../../api/schemas/admin"
import { NotFoundError, ValidationError } from "../../../../api/errors"
export const prerender = false

const withDb = makeAstroRuntime((env) => DbRepositoryLive(env.DB))

const parseId = (raw: string | undefined): Effect.Effect<number, ValidationError> => {
  const id = Number(raw)
  return Number.isFinite(id) && id > 0
    ? Effect.succeed(id)
    : Effect.fail(new ValidationError({ message: `Neplatne ID: ${raw}` }))
}

export const PUT: APIRoute = (context) => {
  const auth = requireAdmin(context)
  if (auth instanceof Response) return auth
  return withDb((_ctx) =>
    Effect.gen(function* () {
      const db = yield* DbRepository
      const id = yield* parseId(_ctx.params.id)
      const raw = yield* Effect.tryPromise({
        try: () => _ctx.request.json(),
        catch: () => new ValidationError({ message: "Neplatny JSON" }),
      })
      const body = yield* pipe(
        Schema.decodeUnknown(ProgramInput)(raw),
        Effect.mapError((e) => new ValidationError({ message: "Neplatna data", detail: String(e) })),
      )
      const result = yield* db.query((d1) =>
        d1.update(programs).set({
          name: body.name,
          slug: body.slug,
          categorySlug: body.categorySlug,
          icon: body.icon,
          description: body.description,
          ageRange: body.ageRange,
          duration: body.duration,
          instructors: body.instructors,
          active: body.active,
          sortOrder: body.sortOrder,
        }).where(eq(programs.id, id)).returning()
      )
      if (result.length === 0) return yield* Effect.fail(new NotFoundError({ entity: "Program", id }))
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
      const id = yield* parseId(_ctx.params.id)
      yield* db.query((d1) => d1.delete(programs).where(eq(programs.id, id)))
      return Response.json({ data: { success: true } })
    })
  )(context)
}
