import type { APIRoute } from "astro"
import { Effect, Schema, pipe } from "effect"
import { makeAstroRuntime } from "../../../api/runtime"
import { DbRepositoryLive } from "../../../api/db"
import { ValidationError } from "../../../api/errors"
import { getEnv } from "../../../api/auth"
export const prerender = false

const LoginRequest = Schema.Struct({ token: Schema.NonEmptyString })
const withDb = makeAstroRuntime((env) => DbRepositoryLive(env.DB))

export const POST: APIRoute = withDb((_ctx, env) =>
  Effect.gen(function* () {
    const raw = yield* Effect.tryPromise({
      try: () => _ctx.request.json(),
      catch: () => new ValidationError({ message: "Neplatny JSON" }),
    })
    const body = yield* pipe(
      Schema.decodeUnknown(LoginRequest)(raw),
      Effect.mapError(() => new ValidationError({ message: "Neplatna data" })),
    )
    if (body.token === env.SUPERADMIN_TOKEN) {
      const isProduction = env.ENVIRONMENT === "production"
      const cookie = `superadmin_token=${body.token}; Path=/; Max-Age=${30 * 24 * 60 * 60}; HttpOnly; SameSite=Lax${isProduction ? "; Secure" : ""}`
      return new Response(JSON.stringify({ data: { success: true } }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Set-Cookie": cookie },
      })
    }
    return Response.json({ error: "Neplatny token" }, { status: 401 })
  })
)
