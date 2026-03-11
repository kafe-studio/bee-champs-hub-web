import type { APIRoute } from "astro"
import { Effect } from "effect"
import { makeAstroRuntime } from "../../../../../api/runtime"
import { DbRepositoryLive } from "../../../../../api/db"
import { requireSuperadmin } from "../../../../../api/auth"
import { ServiceUnavailableError, CloudflareApiError } from "../../../../../api/errors"
export const prerender = false

const withDb = makeAstroRuntime((env) => DbRepositoryLive(env.DB))

export const DELETE: APIRoute = (context) => {
  const auth = requireSuperadmin(context)
  if (auth instanceof Response) return auth
  return withDb((_ctx, env) =>
    Effect.gen(function* () {
      const cfToken = env.CF_API_TOKEN
      if (!cfToken) return yield* Effect.fail(new ServiceUnavailableError({ message: "CF_API_TOKEN neni nastaven" }))

      const tailId = _ctx.params.tailId
      const scriptName = new URL(_ctx.request.url).searchParams.get("scriptName") ?? "bee-champs-hub-web"
      const accountId = env.CF_ACCOUNT_ID ?? "a6f73612807840e33437c92d3771f8be"

      yield* Effect.tryPromise({
        try: () => fetch(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${scriptName}/tails/${tailId}`,
          { method: "DELETE", headers: { Authorization: `Bearer ${cfToken}` } },
        ),
        catch: (cause) => new CloudflareApiError({ message: `Delete tail selhal: ${String(cause)}` }),
      })

      return Response.json({ data: { success: true } })
    })
  )(context)
}
