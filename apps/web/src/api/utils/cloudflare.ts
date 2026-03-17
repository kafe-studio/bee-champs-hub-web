/**
 * Sdílený helper pro volání Cloudflare API
 *
 * Extrahováno z purge.ts, export.ts a tail.ts — jediné místo pro CF fetch logiku.
 */
import { Effect } from "effect"
import { CloudflareApiError } from "../errors"

/** Typovaný fetch na Cloudflare REST API s automatickým error handlingem */
export const cfFetch = <T>(url: string, token: string, options?: RequestInit): Effect.Effect<T, CloudflareApiError> =>
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

/** Povolené názvy workerů pro tail logy */
export const ALLOWED_SCRIPTS = ["bee-cz"] as const
