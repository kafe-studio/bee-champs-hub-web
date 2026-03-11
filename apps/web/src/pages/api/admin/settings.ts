import type { APIRoute } from "astro"
import { Effect } from "effect"
import { settings } from "@bee-champs/db"
import { makeAstroRuntime } from "../../../api/runtime"
import { DbRepository, DbRepositoryLive } from "../../../api/db"
import { requireAdmin } from "../../../api/auth"
import { ValidationError } from "../../../api/errors"
export const prerender = false

const withDb = makeAstroRuntime((env) => DbRepositoryLive(env.DB))

export const GET: APIRoute = (context) => {
  const auth = requireAdmin(context)
  if (auth instanceof Response) return auth
  return withDb((_ctx) =>
    Effect.gen(function* () {
      const db = yield* DbRepository
      const rows = yield* db.query((d1) => d1.select().from(settings))
      const result: Record<string, string> = {}
      for (const row of rows) {
        result[row.key] = row.value
      }
      return Response.json({ data: result })
    })
  )(context)
}

export const PUT: APIRoute = (context) => {
  const auth = requireAdmin(context)
  if (auth instanceof Response) return auth
  return withDb((_ctx) =>
    Effect.gen(function* () {
      const db = yield* DbRepository
      const body = yield* Effect.tryPromise({
        try: () => _ctx.request.json() as Promise<Record<string, string>>,
        catch: () => new ValidationError({ message: "Neplatny JSON" }),
      })
      yield* Effect.forEach(
        Object.entries(body),
        ([key, value]) => db.query((d1) =>
          d1.insert(settings).values({ key, value })
            .onConflictDoUpdate({ target: settings.key, set: { value } })
        ),
        { concurrency: 1 },
      )
      return Response.json({ data: { success: true } })
    })
  )(context)
}
