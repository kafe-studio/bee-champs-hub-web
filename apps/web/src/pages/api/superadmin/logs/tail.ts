import type { APIRoute } from "astro"
import { Effect, Schema, pipe } from "effect"
import { makeAstroRuntime } from "../../../../api/runtime"
import { DbRepositoryLive } from "../../../../api/db"
import { requireSuperadmin } from "../../../../api/auth"
import { ValidationError, ServiceUnavailableError } from "../../../../api/errors"
import { cfFetch, ALLOWED_SCRIPTS } from "../../../../api/utils/cloudflare"
export const prerender = false

const ScriptNameRequest = Schema.Struct({ scriptName: Schema.NonEmptyString })

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

      const accountId = env.CF_ACCOUNT_ID
      if (!accountId) return yield* Effect.fail(new ServiceUnavailableError({ message: "CF_ACCOUNT_ID neni nastaven" }))

      const data = yield* cfFetch<{
        readonly result: { readonly id: string; readonly url: string; readonly expires_at: string }
      }>(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${body.scriptName}/tails`, cfToken, { method: "POST", body: JSON.stringify({}) })

      return Response.json({
        data: { id: data.result.id, url: data.result.url, expiresAt: data.result.expires_at, scriptName: body.scriptName },
      })
    })
  )(context)
}
