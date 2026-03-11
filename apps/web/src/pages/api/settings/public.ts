import type { APIRoute } from "astro"
import { Effect } from "effect"
import { settings } from "@bee-champs/db"
import { makeAstroRuntime } from "../../../api/runtime"
import { DbRepository, DbRepositoryLive } from "../../../api/db"
export const prerender = false

const CACHE_HEADERS = { "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=86400" }

const withDb = makeAstroRuntime((env) => DbRepositoryLive(env.DB))

export const GET: APIRoute = withDb((_ctx) =>
  Effect.gen(function* () {
    const db = yield* DbRepository
    const rows = yield* db.query((d1) => d1.select().from(settings))
    const publicKeys = ["stat1_value", "stat1_label", "stat2_value", "stat2_label", "stat3_value", "stat3_label"]
    const result: Record<string, string> = {}
    for (const row of rows) {
      if (publicKeys.includes(row.key)) {
        result[row.key] = row.value
      }
    }
    return Response.json({ data: result }, { headers: CACHE_HEADERS })
  })
)
