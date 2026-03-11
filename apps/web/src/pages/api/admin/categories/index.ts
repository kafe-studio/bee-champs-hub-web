import type { APIRoute } from "astro"
import { Effect } from "effect"
import { asc } from "drizzle-orm"
import { categories } from "@bee-champs/db"
import { makeAstroRuntime } from "../../../../api/runtime"
import { DbRepository, DbRepositoryLive } from "../../../../api/db"
import { requireAdmin } from "../../../../api/auth"
export const prerender = false

const withDb = makeAstroRuntime((env) => DbRepositoryLive(env.DB))

export const GET: APIRoute = (context) => {
  const auth = requireAdmin(context)
  if (auth instanceof Response) return auth
  return withDb((_ctx) =>
    Effect.gen(function* () {
      const db = yield* DbRepository
      const rows = yield* db.query((d1) => d1.select().from(categories).orderBy(asc(categories.sortOrder)))
      return Response.json({ data: rows })
    })
  )(context)
}
