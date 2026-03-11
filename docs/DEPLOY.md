# Bee Champs Hub — Návod k nasazení (Deploy)

Celý projekt běží jako **jeden Cloudflare Worker** — web (Astro SSR) i API endpointy (Effect TS) jsou součástí jednoho workeru.

## Rychlý deploy (tlačítko)

Nejjednodušší způsob nasazení — klikněte na tlačítko v README:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/pfncl/bee-champs-hub)

Cloudflare automaticky:
1. **Naklonuje repo** do vašeho GitHub účtu
2. **Vytvoří KV namespace** a **D1 databázi** — stačí pojmenovat nebo nechat výchozí
3. **Zobrazí formulář pro secrets** — vyplňte:

| Secret | Kde ho získat |
|---|---|
| `ADMIN_TOKEN` | Vygenerujte: `openssl rand -hex 32` |
| `SUPERADMIN_TOKEN` | Vygenerujte: `openssl rand -hex 32` |
| `RESEND_API_KEY` | Vytvořte na [resend.com](https://resend.com) |
| `CF_API_TOKEN` | Vytvořte v [Cloudflare dashboard](https://dash.cloudflare.com/profile/api-tokens) — oprávnění: `Workers Scripts > Edit`, `D1 > Edit` |

4. **Nastaví env proměnné** `ENVIRONMENT` a `APP_URL` — změňte `APP_URL` na vaši doménu
5. **Spustí build a deploy** — včetně D1 migrací

Po dokončení máte funkční aplikaci na `https://bee-champs-hub-web.UZIVATEL.workers.dev`.

---

## Manuální deploy (CLI)

Pokud nechcete použít tlačítko, můžete nasadit ručně.

### 1. Prerekvizity

- **Node.js** >= 24
- **pnpm** >= 10 (`npm install -g pnpm`)
- **Cloudflare účet** (zdarma stačí)

### 2. Přihlášení

```bash
npx wrangler login
```

### 3. Konfigurace wrangler.jsonc

Soubor `wrangler.jsonc` je v repu s placeholder hodnotami. Vyplňte své hodnoty:

| Pole | Kde ho najdete |
|---|---|
| `account_id` | Přidejte — `npx wrangler whoami` |
| `d1_databases[0].database_id` | `npx wrangler d1 create bee-champs-db` |
| `kv_namespaces[0].id` | `npx wrangler kv namespace create SESSION` |
| `vars.APP_URL` | Vaše produkční URL |
| `routes` | Přidejte sekci s vaší custom doménou (volitelné) |

Aby git netrackoval vaše lokální změny:

```bash
git update-index --skip-worktree wrangler.jsonc
```

### 4. Nastavení secrets

```bash
npx wrangler secret put ADMIN_TOKEN
npx wrangler secret put SUPERADMIN_TOKEN
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put CF_API_TOKEN
```

### 5. Build a deploy

```bash
pnpm install
pnpm run deploy
```

Deploy script automaticky spustí build, aplikuje D1 migrace a nasadí worker.

**Pozor:** `pnpm deploy` je rezervovaný příkaz pnpm — vždy používejte `pnpm run deploy`.

---

## Custom doména (volitelné)

Do `wrangler.jsonc` přidejte sekci `routes`:

```jsonc
"routes": [
  { "pattern": "vase-domena.cz", "custom_domain": true }
]
```

Doména musí být přidaná v Cloudflare DNS (stačí Free plan). Po deploy se automaticky vytvoří DNS záznam.

## Lokální vývoj

```bash
pnpm install
pnpm dev
```

Dev server běží na `http://localhost:4321`. Používá lokální D1 databázi (soubor v `.wrangler/`).

### Lokální secrets

Vytvořte soubor `apps/web/.dev.vars` (viz `.dev.vars.example`):

```
ADMIN_TOKEN=test-admin-token
SUPERADMIN_TOKEN=test-superadmin-token
RESEND_API_KEY=re_xxxxx
CF_API_TOKEN=xxxxx
```

Tento soubor je v `.gitignore` a používá se pouze lokálně.

## Databázové migrace

Schéma je v `packages/db/src/schema/`. Pokud změníte schéma:

```bash
# Vygenerovat migraci
pnpm db:generate

# Aplikovat lokálně
npx wrangler d1 migrations apply bee-champs-db --local

# Aplikovat na produkci (automaticky součástí `pnpm run deploy`)
npx wrangler d1 migrations apply bee-champs-db --remote
```

## Struktura projektu

```
bee-champs/
├── wrangler.jsonc          # Cloudflare konfigurace
├── .dev.vars.example       # Šablona secrets
├── apps/
│   └── web/              # Astro 5 + Svelte 5 + API (Effect TS)
│       ├── src/
│       │   ├── api/      # Sdílený API kód (runtime, auth, db, errors, schemas)
│       │   ├── pages/
│       │   │   ├── api/  # API endpointy (Astro server endpoints)
│       │   │   ├── admin/   # Admin panel
│       │   │   └── ...      # Veřejné stránky
│       │   ├── components/  # Svelte 5 komponenty
│       │   └── layouts/     # Astro layouty
│       └── .dev.vars        # Lokální secrets (ne v gitu)
├── packages/
│   ├── shared/           # Sdílené typy, kategorie, programy
│   └── db/               # Drizzle schéma + migrace
└── docs/                 # Dokumentace
```

## Důležité URL

- **Admin panel**: `/admin` (chráněno tokenem)
- **Superadmin**: `/superadmin` (chráněno tokenem)
- **API health check**: `/api/health`

## Řešení problémů

### D1 migrace selhává
Zkontrolujte že `database_id` v wrangler.jsonc odpovídá skutečné D1 databázi. Ověření: `npx wrangler d1 list`.
