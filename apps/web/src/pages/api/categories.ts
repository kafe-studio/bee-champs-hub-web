import type { APIRoute } from "astro"
import { Effect } from "effect"
import { asc } from "drizzle-orm"
import { categories } from "@bee-champs/db"
import { makeAstroRuntime } from "../../api/runtime"
import { DbRepository, DbRepositoryLive } from "../../api/db"
export const prerender = false

const CACHE_HEADERS = { "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=86400" }

const mapCategory = (row: typeof categories.$inferSelect) => ({
  slug: row.slug,
  name: row.name,
  label: row.label,
  icon: row.icon,
  color: row.color,
  description: row.description,
})

const withDb = makeAstroRuntime((env) => DbRepositoryLive(env.DB))

export const GET: APIRoute = withDb((_ctx) =>
  Effect.gen(function* () {
    const db = yield* DbRepository
    const rows = yield* db.query((d1) => d1.select().from(categories).orderBy(asc(categories.sortOrder)))
    return Response.json({ data: rows.map(mapCategory) }, { headers: CACHE_HEADERS })
  })
)
