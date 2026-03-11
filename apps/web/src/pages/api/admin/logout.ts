import type { APIRoute } from "astro"
import { getEnv } from "../../../api/auth"
export const prerender = false

export const POST: APIRoute = (context) => {
  const env = getEnv(context)
  const isProduction = env.ENVIRONMENT === "production"
  const cookie = `admin_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${isProduction ? "; Secure" : ""}`
  return new Response(JSON.stringify({ data: { success: true } }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Set-Cookie": cookie },
  })
}
