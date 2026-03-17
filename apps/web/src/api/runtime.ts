/**
 * makeAstroRuntime — wrapper pro Astro API endpointy s Effect ManagedRuntime
 *
 * Ekvivalent makeHonoRuntime, ale pro Astro APIRoute.
 * Kazdy request dostane vlastni runtime s pristupem ke vsem sluzbam.
 * Automaticky mapuje TaggedError na HTTP odpovedi.
 */
import { Effect, Layer, ManagedRuntime, pipe } from "effect"
import type { APIContext } from "astro"
import type { Env } from "./types"
import type { DatabaseError, NotFoundError, ValidationError, ServiceUnavailableError, CloudflareApiError, UnauthorizedError } from "./errors"

type AppError = DatabaseError | NotFoundError | ValidationError | ServiceUnavailableError | CloudflareApiError | UnauthorizedError

const errorToStatus = (tag: string): number => {
  const statusMap: Record<string, number> = {
    DatabaseError: 500,
    NotFoundError: 404,
    ValidationError: 400,
    ServiceUnavailableError: 503,
    CloudflareApiError: 502,
    UnauthorizedError: 401,
  }
  return statusMap[tag] ?? 500
}

/** Ziskej Cloudflare Env z Astro contextu */
const getEnv = (context: APIContext): Env =>
  (context.locals as { runtime: { env: Env } }).runtime.env

/**
 * Vytvori runtime wrapper pro Astro API endpoint.
 *
 * Pouziti:
 *   const withDb = makeAstroRuntime((env) => DbRepositoryLive(env.DB))
 *   export const GET: APIRoute = withDb((ctx) =>
 *     Effect.gen(function* () {
 *       const db = yield* DbRepository
 *       return Response.json({ data: rows })
 *     })
 *   )
 */
export const makeAstroRuntime = <R>(
  layerBuilder: (env: Env) => Layer.Layer<R, never, never>
) => (
  handler: (context: APIContext, env: Env) => Effect.Effect<Response, AppError, R>
) => (context: APIContext): Promise<Response> => {
  const env = getEnv(context)

  const handleAppError = (error: AppError): Effect.Effect<Response> => {
    const e = error as unknown as Record<string, unknown>
    const msg = typeof e.message === "string" ? e.message : "cause" in e ? String(e.cause) : String(error)
    console.error(`[makeAstroRuntime] ${error._tag}:`, msg)
    return Effect.succeed(
      Response.json(
        { error: msg, detail: typeof e.detail === "string" ? e.detail : undefined },
        { status: errorToStatus(error._tag) },
      )
    )
  }

  const handled = pipe(
    handler(context, env),
    Effect.catchAll(handleAppError),
    Effect.catchAllDefect((defect) => {
      console.error("[makeAstroRuntime] Defect:", defect)
      return Effect.succeed(
        Response.json({ error: "Internal Server Error", detail: String(defect) }, { status: 500 })
      )
    }),
  )
  return ManagedRuntime.make(layerBuilder(env)).runPromise(handled)
}
