import type { APIRoute } from "astro"
import { Effect, Schema, pipe } from "effect"
import { asc } from "drizzle-orm"
import { programs } from "@bee-champs/db"
import { makeAstroRuntime } from "../../../../api/runtime"
import { DbRepository, DbRepositoryLive } from "../../../../api/db"
import { requireAdmin } from "../../../../api/auth"
import { ProgramInput } from "../../../../api/schemas/admin"
import { ValidationError } from "../../../../api/errors"
export const prerender = false

const withDb = makeAstroRuntime((env) => DbRepositoryLive(env.DB))

export const GET: APIRoute = (context) => {
  const auth = requireAdmin(context)
  if (auth instanceof Response) return auth
  return withDb((_ctx) =>
    Effect.gen(function* () {
      const db = yield* DbRepository
      const rows = yield* db.query((d1) => d1.select().from(programs).orderBy(asc(programs.sortOrder)))
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
        Schema.decodeUnknown(ProgramInput)(raw),
        Effect.mapError((e) => new ValidationError({ message: "Neplatna data", detail: String(e) })),
      )
      const result = yield* db.query((d1) =>
        d1.insert(programs).values({
          slug: body.slug,
          categorySlug: body.categorySlug,
          name: body.name,
          icon: body.icon,
          description: body.description,
          ageRange: body.ageRange,
          duration: body.duration,
          instructors: body.instructors,
          sortOrder: body.sortOrder ?? 0,
        }).returning()
      )
      return Response.json({ data: result[0] }, { status: 201 })
    })
  )(context)
}
