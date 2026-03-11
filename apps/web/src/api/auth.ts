/**
 * Auth helpery pro Astro API endpointy
 */
import type { APIContext } from "astro"
import type { Env } from "./types"

/** Ziskej Cloudflare env z Astro contextu */
export const getEnv = (context: APIContext): Env =>
  (context.locals as { runtime: { env: Env } }).runtime.env

/** Zkontroluj admin token — vrati env pokud ok, jinak Response 401 */
export const requireAdmin = (context: APIContext): Env | Response => {
  const env = getEnv(context)
  const token = env.ADMIN_TOKEN
  if (!token) {
    return Response.json({ error: "Admin neni nakonfigurovan" }, { status: 503 })
  }

  const cookie = context.request.headers.get("cookie") ?? ""
  const cookieToken = cookie.match(/admin_token=([^;]+)/)?.[1]
  const headerToken = context.request.headers.get("authorization")?.replace("Bearer ", "")

  if (cookieToken !== token && headerToken !== token) {
    return Response.json({ error: "Neautorizovany pristup" }, { status: 401 })
  }

  return env
}

/** Zkontroluj superadmin token — vrati env pokud ok, jinak Response 401 */
export const requireSuperadmin = (context: APIContext): Env | Response => {
  const env = getEnv(context)
  const token = env.SUPERADMIN_TOKEN
  if (!token) {
    return Response.json({ error: "Superadmin neni nakonfigurovan" }, { status: 503 })
  }

  const cookie = context.request.headers.get("cookie") ?? ""
  const cookieToken = cookie.match(/superadmin_token=([^;]+)/)?.[1]
  const headerToken = context.request.headers.get("authorization")?.replace("Bearer ", "")

  if (cookieToken !== token && headerToken !== token) {
    return Response.json({ error: "Neautorizovany pristup" }, { status: 401 })
  }

  return env
}
