# Bee Champs Hub

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/pfncl/bee-champs-hub)

Plánovací platforma pro mateřské a základní školy. Školy si vyberou z desítek ověřených programů (sport, vzdělávání, projektové dny, pobyty), sestaví si roční harmonogram a odešlou jednu souhrnnou poptávku.

## Funkce

- **Roční plánovač** — interaktivní nástroj pro sestavení harmonogramu celého školního roku (září–srpen)
- **Katalog 26 programů** ve 4 kategoriích s kompletními metadaty (věk, délka, počet lektorů)
- **Jednotná poptávka** — jeden formulář pro libovolný počet programů najednou
- **4 kategorie**: Sportovní programy, Vzdělávací programy, Projektové dny, Akce a pobyty

## Tech stack

| Vrstva | Technologie |
|---|---|
| Frontend | Astro 5, Svelte 5, Tailwind CSS v4 |
| API | Astro server endpoints, Effect TS |
| Databáze | Drizzle ORM, Cloudflare D1 (SQLite) |
| Infrastruktura | Cloudflare Workers (jeden worker) |
| Monorepo | pnpm workspaces |

## Struktura projektu

```
apps/
  web/          Astro SSR + API (jeden Cloudflare Worker)
packages/
  shared/       Sdílené typy, kategorie, programy
  db/           Drizzle ORM schéma + migrace
docs/           Dokumentace (DEPLOY.md, SPRINTY.md)
```

## Vývoj

```bash
# Instalace závislostí
pnpm install

# Spuštění dev serveru (web na :4321)
pnpm dev

# Build
pnpm build

# Deploy na Cloudflare Workers
pnpm run deploy
```

## Deploy

Jeden worker obsluhuje web i API. Podrobný návod viz [docs/DEPLOY.md](docs/DEPLOY.md).

```bash
pnpm run deploy
```

Po deploy je potřeba nastavit secrets: `ADMIN_TOKEN`, `SUPERADMIN_TOKEN`, `RESEND_API_KEY`, `CF_API_TOKEN`.

## Licence

Soukromý projekt.
