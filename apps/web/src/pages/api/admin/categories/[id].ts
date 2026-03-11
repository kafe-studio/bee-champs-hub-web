import type { APIRoute } from "astro"
import { Effect, Schema, pipe } from "effect"
import { eq } from "drizzle-orm"
import { categories } from "@bee-champs/db"
import { makeAstroRuntime } from "../../../../api/runtime"
import { DbRepository, DbRepositoryLive } from "../../../../api/db"
import { requireAdmin } from "../../../../api/auth"
import { CategoryInput } from "../../../../api/schemas/admin"
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
      if (!Number.isFinite(id) || id <= 0) return yield* Effect.fail(new ValidationError({ message: `Neplatne ID: ${_ctx.params.id}` }))
      const raw = yield* Effect.tryPromise({
        try: () => _ctx.request.json(),
        catch: () => new ValidationError({ message: "Neplatny JSON" }),
      })
      const body = yield* pipe(
        Schema.decodeUnknown(CategoryInput)(raw),
        Effect.mapError((e) => new ValidationError({ message: "Neplatna data", detail: String(e) })),
      )
      const result = yield* db.query((d1) =>
        d1.update(categories).set({
          name: body.name,
          label: body.label,
          icon: body.icon,
          color: body.color,
          description: body.description,
        }).where(eq(categories.id, id)).returning()
      )
      if (result.length === 0) return yield* Effect.fail(new NotFoundError({ entity: "Kategorie", id }))
      return Response.json({ data: result[0] })
    })
  )(context)
}
