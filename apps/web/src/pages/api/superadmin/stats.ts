import type { APIRoute } from "astro"
import { Effect } from "effect"
import { sql } from "drizzle-orm"
import { makeAstroRuntime } from "../../../api/runtime"
import { DbRepository, DbRepositoryLive } from "../../../api/db"
import { requireSuperadmin } from "../../../api/auth"
export const prerender = false

const withDb = makeAstroRuntime((env) => DbRepositoryLive(env.DB))

export const GET: APIRoute = (context) => {
  const auth = requireSuperadmin(context)
  if (auth instanceof Response) return auth
  return withDb((_ctx) =>
    Effect.gen(function* () {
      const db = yield* DbRepository
      const countQuery = (table: string) =>
        db.query((d1) => d1.all<{ readonly count: number }>(sql.raw(`SELECT COUNT(*) as count FROM ${table}`)))

      const [prg, cat, inq, tst, stg] = yield* Effect.all([
        countQuery("programs"),
        countQuery("categories"),
        countQuery("inquiries"),
        countQuery("testimonials"),
        countQuery("settings"),
      ], { concurrency: "unbounded" })

      const getCount = (rows: ReadonlyArray<{ readonly count: number }>): number =>
        rows[0]?.count ?? 0

      return Response.json({
        data: {
          programs: getCount(prg),
          categories: getCount(cat),
          inquiries: getCount(inq),
          testimonials: getCount(tst),
          settings: getCount(stg),
        },
      })
    })
  )(context)
}
