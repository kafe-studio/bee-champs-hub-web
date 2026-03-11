/// <reference path="../.astro/types.d.ts" />

type ENV = {
  DB: D1Database
  RESEND_API_KEY: string
  ADMIN_TOKEN: string
  SUPERADMIN_TOKEN: string
  CF_API_TOKEN: string
  CF_ACCOUNT_ID?: string
  CF_D1_DATABASE_ID?: string
  APP_URL: string
  ENVIRONMENT: string
}

type Runtime = import("@astrojs/cloudflare").AdvancedRuntime<ENV>

declare namespace App {
  interface Locals extends Runtime {}
}
