import type { APIRoute } from "astro"
import { Effect, Schema, pipe } from "effect"
import { makeAstroRuntime } from "../../../../api/runtime"
import { DbRepositoryLive } from "../../../../api/db"
import { requireSuperadmin } from "../../../../api/auth"
import { ValidationError, ServiceUnavailableError, CloudflareApiError } from "../../../../api/errors"
export const prerender = false

const ScriptNameRequest = Schema.Struct({ scriptName: Schema.NonEmptyString })
const ALLOWED_SCRIPTS = ["bee-champs-hub-web"] as const

const cfFetch = <T>(url: string, token: string, options?: RequestInit): Effect.Effect<T, CloudflareApiError> =>
  Effect.gen(function* () {
    const res = yield* Effect.tryPromise({
      try: () => fetch(url, { ...options, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...options?.headers } }),
      catch: (cause) => new CloudflareApiError({ message: `CF fetch selhal: ${String(cause)}` }),
    })
    if (!res.ok) {
      const text = yield* Effect.tryPromise({ try: () => res.text(), catch: () => new CloudflareApiError({ message: `CF API: ${res.status}`, status: res.status }) })
      return yield* Effect.fail(new CloudflareApiError({ message: `CF API: ${res.status} ${text}`, status: res.status }))
    }
    return yield* Effect.tryPromise({ try: () => res.json() as Promise<T>, catch: () => new CloudflareApiError({ message: "Neplatna CF API odpoved" }) })
  })

const withDb = makeAstroRuntime((env) => DbRepositoryLive(env.DB))

export const POST: APIRoute = (context) => {
  const auth = requireSuperadmin(context)
  if (auth instanceof Response) return auth
  return withDb((_ctx, env) =>
    Effect.gen(function* () {
      const cfToken = env.CF_API_TOKEN
      if (!cfToken) return yield* Effect.fail(new ServiceUnavailableError({ message: "CF_API_TOKEN neni nastaven" }))

      const rawBody = yield* Effect.tryPromise({ try: () => _ctx.request.json(), catch: () => new ValidationError({ message: "Neplatny JSON" }) })
      const body = yield* pipe(Schema.decodeUnknown(ScriptNameRequest)(rawBody), Effect.mapError(() => new ValidationError({ message: "Neplatna data" })))

      if (!ALLOWED_SCRIPTS.includes(body.scriptName as typeof ALLOWED_SCRIPTS[number])) {
        return Response.json({ error: `Neplatny worker: ${body.scriptName}` }, { status: 400 })
      }

      const accountId = env.CF_ACCOUNT_ID ?? "a6f73612807840e33437c92d3771f8be"
      const data = yield* cfFetch<{
        readonly result: { readonly id: string; readonly url: string; readonly expires_at: string }
      }>(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${body.scriptName}/tails`, cfToken, { method: "POST", body: JSON.stringify({}) })

      return Response.json({
        data: { id: data.result.id, url: data.result.url, expiresAt: data.result.expires_at, scriptName: body.scriptName },
      })
    })
  )(context)
}
