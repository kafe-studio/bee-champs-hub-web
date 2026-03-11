import type { APIRoute } from "astro"
import { Effect, Schema, pipe } from "effect"
import { makeAstroRuntime } from "../../../../api/runtime"
import { DbRepositoryLive } from "../../../../api/db"
import { requireSuperadmin } from "../../../../api/auth"
import { ValidationError, ServiceUnavailableError, CloudflareApiError } from "../../../../api/errors"
export const prerender = false

const CachePurgeRequest = Schema.Struct({
  purgeEverything: Schema.optional(Schema.Boolean),
  files: Schema.optional(Schema.Array(Schema.String)),
})

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

      const rawPurge = yield* Effect.tryPromise({ try: () => _ctx.request.json(), catch: () => new ValidationError({ message: "Neplatny JSON" }) })
      const body = yield* pipe(Schema.decodeUnknown(CachePurgeRequest)(rawPurge), Effect.mapError(() => new ValidationError({ message: "Neplatna data" })))

      const zonesData = yield* cfFetch<{
        readonly result: ReadonlyArray<{ readonly id: string }>
      }>(`https://api.cloudflare.com/client/v4/zones?name=beechampshub.cz`, cfToken)

      const cfZoneId = zonesData.result[0]?.id
      if (!cfZoneId) {
        return Response.json({ error: "Zona nenalezena. Cache purge vyzaduje CF zone." }, { status: 400 })
      }

      const purgeBody = body.purgeEverything ? { purge_everything: true } : { files: body.files ?? [] }

      const purgeData = yield* cfFetch<{
        readonly result: { readonly id: string }
      }>(`https://api.cloudflare.com/client/v4/zones/${cfZoneId}/purge_cache`, cfToken, {
        method: "POST",
        body: JSON.stringify(purgeBody),
      })

      return Response.json({ data: { ok: true, id: purgeData.result?.id } })
    })
  )(context)
}
