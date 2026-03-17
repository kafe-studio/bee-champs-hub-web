import type { APIRoute } from "astro"
import { Effect } from "effect"
import { makeAstroRuntime } from "../../../../../api/runtime"
import { DbRepositoryLive } from "../../../../../api/db"
import { requireSuperadmin } from "../../../../../api/auth"
import { ServiceUnavailableError, CloudflareApiError, ValidationError } from "../../../../../api/errors"
import { ALLOWED_SCRIPTS } from "../../../../../api/utils/cloudflare"
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
      const scriptName = new URL(_ctx.request.url).searchParams.get("scriptName") ?? ""

      // Validace scriptName proti allowlistu
      if (!scriptName || !ALLOWED_SCRIPTS.includes(scriptName as typeof ALLOWED_SCRIPTS[number])) {
        return yield* Effect.fail(new ValidationError({ message: `Neplatny worker: ${scriptName}` }))
      }

      const accountId = env.CF_ACCOUNT_ID
      if (!accountId) return yield* Effect.fail(new ServiceUnavailableError({ message: "CF_ACCOUNT_ID neni nastaven" }))

      const res = yield* Effect.tryPromise({
        try: () => fetch(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${scriptName}/tails/${tailId}`,
          { method: "DELETE", headers: { Authorization: `Bearer ${cfToken}` } },
        ),
        catch: (cause) => new CloudflareApiError({ message: `Delete tail selhal: ${String(cause)}` }),
      })

      if (!res.ok) {
        const text = yield* Effect.tryPromise({ try: () => res.text(), catch: () => new CloudflareApiError({ message: `CF API: ${res.status}` }) })
        return yield* Effect.fail(new CloudflareApiError({ message: `Delete tail: ${res.status} ${text}`, status: res.status }))
      }

      return Response.json({ data: { success: true } })
    })
  )(context)
}
