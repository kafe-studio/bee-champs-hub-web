import type { APIRoute } from "astro"
import { Effect } from "effect"
import { makeAstroRuntime } from "../../../../api/runtime"
import { DbRepositoryLive } from "../../../../api/db"
import { requireSuperadmin } from "../../../../api/auth"
import { ServiceUnavailableError } from "../../../../api/errors"
import { cfFetch } from "../../../../api/utils/cloudflare"
export const prerender = false

const withDb = makeAstroRuntime((env) => DbRepositoryLive(env.DB))

export const POST: APIRoute = (context) => {
  const auth = requireSuperadmin(context)
  if (auth instanceof Response) return auth
  return withDb((_ctx, env) =>
    Effect.gen(function* () {
      const cfToken = env.CF_API_TOKEN
      if (!cfToken) return yield* Effect.fail(new ServiceUnavailableError({ message: "CF_API_TOKEN neni nastaven" }))
      const accountId = env.CF_ACCOUNT_ID
      if (!accountId) return yield* Effect.fail(new ServiceUnavailableError({ message: "CF_ACCOUNT_ID neni nastaven" }))
      const databaseId = env.CF_D1_DATABASE_ID
      if (!databaseId) return yield* Effect.fail(new ServiceUnavailableError({ message: "CF_D1_DATABASE_ID neni nastaven" }))
      const exportUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/export`

      const exportData = yield* cfFetch<{
        readonly result: { readonly filename: string; readonly signed_url?: string; readonly status?: string; readonly at_bookmark?: string }
      }>(exportUrl, cfToken, {
        method: "POST",
        body: JSON.stringify({ output_format: "polling", dump_options: { no_schema: false, no_data: false, tables: [] } }),
      })

      const startTime = Date.now()
      let currentBookmark = exportData.result.at_bookmark ?? ""

      while (Date.now() - startTime < 30000) {
        const pollData = yield* cfFetch<{
          readonly result: { readonly status: string; readonly signed_url?: string; readonly at_bookmark?: string }
        }>(exportUrl, cfToken, {
          method: "POST",
          body: JSON.stringify({ output_format: "polling", current_bookmark: currentBookmark, dump_options: { no_schema: false, no_data: false, tables: [] } }),
        })
        if (pollData.result.status === "complete" && pollData.result.signed_url) {
          return Response.json({ data: { url: pollData.result.signed_url } })
        }
        currentBookmark = pollData.result.at_bookmark ?? currentBookmark
        yield* Effect.sleep("1 second")
      }

      return Response.json({ error: "Export timeout" }, { status: 504 })
    })
  )(context)
}
