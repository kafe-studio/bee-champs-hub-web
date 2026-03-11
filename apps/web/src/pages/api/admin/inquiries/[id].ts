import type { APIRoute } from "astro"
import { Effect } from "effect"
import { eq } from "drizzle-orm"
import { inquiries } from "@bee-champs/db"
import { makeAstroRuntime } from "../../../../api/runtime"
import { DbRepository, DbRepositoryLive } from "../../../../api/db"
import { requireAdmin } from "../../../../api/auth"
import { NotFoundError, ValidationError } from "../../../../api/errors"
export const prerender = false

const withDb = makeAstroRuntime((env) => DbRepositoryLive(env.DB))

export const GET: APIRoute = (context) => {
  const auth = requireAdmin(context)
  if (auth instanceof Response) return auth
  return withDb((_ctx) =>
    Effect.gen(function* () {
      const db = yield* DbRepository
      const id = Number(_ctx.params.id)
      if (!Number.isFinite(id) || id <= 0) return yield* Effect.fail(new ValidationError({ message: `Neplatne ID` }))
      const rows = yield* db.query((d1) => d1.select().from(inquiries).where(eq(inquiries.id, id)))
      if (rows.length === 0) return yield* Effect.fail(new NotFoundError({ entity: "Poptavka", id }))
      return Response.json({ data: rows[0] })
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
      yield* db.query((d1) => d1.delete(inquiries).where(eq(inquiries.id, id)))
      return Response.json({ data: { success: true } })
    })
  )(context)
}
