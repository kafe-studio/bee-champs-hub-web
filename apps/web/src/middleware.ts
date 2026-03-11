import { defineMiddleware } from "astro:middleware"

export const onRequest = defineMiddleware(async ({ request, url, redirect, locals }, next) => {
  const path = url.pathname

  // Superadmin routes — kontrola superadmin_token cookie
  if (path.startsWith("/superadmin")) {
    if (path === "/superadmin/login") {
      return next()
    }

    const cookie = request.headers.get("cookie") ?? ""
    const token = cookie.match(/superadmin_token=([^;]+)/)?.[1]

    if (!token) {
      return redirect("/superadmin/login")
    }

    ;(locals as Record<string, unknown>).superadminToken = token
    return next()
  }

  // Admin routes — kontrola admin_token cookie
  if (path.startsWith("/admin")) {
    if (path === "/admin/login") {
      return next()
    }

    const cookie = request.headers.get("cookie") ?? ""
    const token = cookie.match(/admin_token=([^;]+)/)?.[1]

    if (!token) {
      return redirect("/admin/login")
    }

    ;(locals as Record<string, unknown>).adminToken = token
  }

  return next()
})
