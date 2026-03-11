import type { APIRoute } from "astro"
import { Effect } from "effect"
import { eq, asc } from "drizzle-orm"
import { programs } from "@bee-champs/db"
import { makeAstroRuntime } from "../../../api/runtime"
import { DbRepository, DbRepositoryLive } from "../../../api/db"
export const prerender = false

const CACHE_HEADERS = { "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=86400" }

const mapProgram = (row: typeof programs.$inferSelect) => ({
  id: row.slug,
  category: row.categorySlug,
  name: row.name,
  icon: row.icon,
  description: row.description,
  ageRange: row.ageRange,
  duration: row.duration,
  instructors: row.instructors,
})

const withDb = makeAstroRuntime((env) => DbRepositoryLive(env.DB))

export const GET: APIRoute = withDb((_ctx) =>
  Effect.gen(function* () {
    const db = yield* DbRepository
    const rows = yield* db.query((d1) =>
      d1.select().from(programs)
        .where(eq(programs.active, true))
        .orderBy(asc(programs.sortOrder))
    )
    return Response.json({ data: rows.map(mapProgram) }, { headers: CACHE_HEADERS })
  })
)
