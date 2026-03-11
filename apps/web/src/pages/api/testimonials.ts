import type { APIRoute } from "astro"
import { Effect } from "effect"
import { eq, asc } from "drizzle-orm"
import { testimonials } from "@bee-champs/db"
import { makeAstroRuntime } from "../../api/runtime"
import { DbRepository, DbRepositoryLive } from "../../api/db"
export const prerender = false

const CACHE_HEADERS = { "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=86400" }

const withDb = makeAstroRuntime((env) => DbRepositoryLive(env.DB))

export const GET: APIRoute = withDb((_ctx) =>
  Effect.gen(function* () {
    const db = yield* DbRepository
    const rows = yield* db.query((d1) =>
      d1.select().from(testimonials)
        .where(eq(testimonials.active, true))
        .orderBy(asc(testimonials.sortOrder))
    )
    return Response.json({ data: rows }, { headers: CACHE_HEADERS })
  })
)
