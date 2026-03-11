// Sdileny Env typ — Cloudflare bindings a secrets
export type Env = {
  readonly DB: D1Database
  readonly RESEND_API_KEY: string
  readonly ADMIN_TOKEN: string
  readonly SUPERADMIN_TOKEN: string
  readonly CF_API_TOKEN: string
  readonly CF_ACCOUNT_ID?: string
  readonly CF_D1_DATABASE_ID?: string
  readonly APP_URL: string
  readonly ENVIRONMENT: string
}
