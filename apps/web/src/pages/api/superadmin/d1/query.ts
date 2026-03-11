import type { APIRoute } from "astro"
import { Effect } from "effect"
import { makeAstroRuntime } from "../../../../api/runtime"
import { DbRepositoryLive } from "../../../../api/db"
import { requireSuperadmin } from "../../../../api/auth"
import { ValidationError } from "../../../../api/errors"
export const prerender = false

const withDb = makeAstroRuntime((env) => DbRepositoryLive(env.DB))

export const POST: APIRoute = (context) => {
  const auth = requireSuperadmin(context)
  if (auth instanceof Response) return auth
  return withDb((_ctx, env) =>
    Effect.gen(function* () {
      const body = yield* Effect.tryPromise({
        try: () => _ctx.request.json() as Promise<{ readonly sql?: string }>,
        catch: () => new ValidationError({ message: "Neplatny JSON" }),
      })
      const sqlQuery = body.sql?.trim() ?? ""
      if (sqlQuery === "") {
        return Response.json({ error: "SQL dotaz je prazdny" }, { status: 400 })
      }

      const forbidden = /^\s*(DROP\s+TABLE|DROP\s+DATABASE|ALTER\s+TABLE\s+\w+\s+RENAME|ATTACH|DETACH|PRAGMA\s+(?!table_info|table_list))/i
      if (forbidden.test(sqlQuery)) {
        return Response.json({ error: "Tento prikaz je zakazany v D1 konzoli" }, { status: 403 })
      }

      yield* Effect.logInfo(`[D1 Konzole] ${sqlQuery.slice(0, 200)}`)

      const result = yield* Effect.tryPromise({
        try: () => {
          const stmt = env.DB.prepare(sqlQuery)
          return stmt.all()
        },
        catch: (cause) => new ValidationError({ message: String(cause) }),
      })

      return Response.json({
        data: {
          results: result.results ?? [],
          meta: result.meta ?? {},
        },
      })
    })
  )(context)
}
