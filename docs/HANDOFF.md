# Predavaci protokol — Session 2026-03-05 (aktualizace #4 — FINALNI)

## Co bylo udelano v teto session

### 1. Flowbite-Svelte integrace s Tailwind v4
- **Opraven `global.css`** — pridano `@plugin`, `@source`, `@custom-variant dark`
- **Nainstalovano `flowbite: 4.0.1`** — nutne pro `@plugin` (flowbite-svelte samotne nestaci)
- **Primary color skala** (50-900) pridana do `@theme` — Flowbite Button pouziva `bg-primary-700` atd.
- **Dark mode**: `@custom-variant dark (&:where(.dark, .dark *))` prepina na class-based

### 2. InquiryModal.svelte — KOMPLETNE PREPSANO
Puvodni stav: vizualne strasny modal s nativnimi HTML inputy.
Novy stav: Flowbite Modal + Flowbite form komponenty, funkcni.

**Pouzite Flowbite komponenty**: `Modal`, `Button`, `Label`, `Input`, `Select`, `Textarea`, `Helper`

**Reseni problemu** (co nefungovalo a jak se to vyresilo):
- `{#snippet footer()}` se nezobrazoval — **reseni**: Button primo v body obsahu (Flowbite "Form element" pattern)
- Scroll u dlouheho formulare — **reseni**: `<div class="max-h-[60vh] overflow-y-auto">` obaluje pole, hlavicka a paticka MIMO
- Dva krizky (X) — **reseni**: `dismissable={false}` + vlastni X button, bez `title` prop
- Neviditelne tlacitko — **reseni**: `color="blue"` na Button + primary skala v @theme
- Validace vzdy ukazovala chybu — **reseni**: `color={hasError(field) ? "red" : undefined}` (ne `"base"`)

### 3. CLAUDE.md aktualizovan
- Pridana sekce "Flowbite-Svelte MCP Server" s MCP workflow a nastroji
- Pridana sekce "Tailwind v4 setup pro Flowbite"

### 4. Migracni plan pro Flowbite
- Vytvoreno `docs/FLOWBITE_MIGRATION.md` — detailni plan prevodu vsech komponent na Flowbite

## Aktualni stav souboru

### Planovac (apps/web/src/components/planner/)
| Soubor | Stav | Poznamka |
|--------|------|----------|
| plannerState.svelte.ts | OK | Plne funkcni, runes + localStorage |
| Planner.svelte | Custom HTML | 1x button k prevodu na Flowbite |
| Sidebar.svelte | Custom HTML | Search input, filtry k prevodu |
| CalendarGrid.svelte | Custom HTML | Karty, buttony, badge k prevodu |
| MonthAssignModal.svelte | Custom HTML | Cely modal k prevodu na Flowbite |
| SummaryBar.svelte | Custom HTML | Chipy, buttony k prevodu |
| PlannerBadge.svelte | Custom HTML | Badge k prevodu |
| AddToPlannerButton.svelte | Custom HTML | Button k prevodu |
| InquiryModal.svelte | **FLOWBITE** | Hotovo — Modal + form komponenty |

### Zmenene soubory v teto session:
- `apps/web/src/styles/global.css` — @plugin, @source, @custom-variant, primary skala
- `apps/web/package.json` — pridano `flowbite: 4.0.1`
- `apps/web/src/components/planner/InquiryModal.svelte` — kompletne prepsano na Flowbite
- `CLAUDE.md` — Flowbite MCP sekce
- `docs/FLOWBITE_MIGRATION.md` — migracni plan (NOVE)

### API (apps/api/) — beze zmen
| Soubor | Stav |
|--------|------|
| src/index.ts | OK — POST /inquiries endpoint |
| src/runtime.ts | OK — makeHonoRuntime wrapper |
| src/inquiry/route.ts | OK — handleCreateInquiry |
| src/inquiry/repository.ts | OK — InquiryRepository + Live |
| src/inquiry/schema.ts | OK — InquiryRequest Schema.Class |

### i18n
- `apps/web/src/i18n/cs.json` — obsahuje `inquiry` sekci se vsemi labely
- `apps/web/src/i18n/index.ts` — `export const t = cs`

## Deploy informace
- **Web**: https://bee-champs-hub-web.webmaster4329.workers.dev/
- **API**: https://bee-champs-hub-api.webmaster4329.workers.dev/health
- **D1 DB ID**: 0462ef41-dd80-47e5-baa5-7e8814546e14
- **Account ID**: a6f73612807840e33437c92d3771f8be

## Deploy prikazy
```bash
# Web
pnpm --filter @bee-champs/web build && cd apps/web && npx wrangler deploy

# API
cd apps/api && npx wrangler deploy
```

## Uzivateluv feedback ke stylu
- **NECHCE gradienty** — jednobarevne plochy, cisty Flowbite look
- **Flowbite styl** — pouzivat Flowbite komponenty jak jsou, nesnazit se je "vylepsovat"
- **Celkovy pristup** — cistejsi, mene "predesignovany"

## Dalsi kroky
- [x] InquiryModal — prepsano na Flowbite
- [ ] **Prevest ostatni komponenty na Flowbite** — viz `docs/FLOWBITE_MIGRATION.md`
  - Jednoduche: PlannerBadge, SummaryBar buttony, Planner button, AddToPlannerButton
  - Stredni: Sidebar (search, filtry), CalendarGrid (karty, buttony)
  - Slozite: MonthAssignModal (cely custom modal)
- [ ] Sprint 6: View Transitions + SPA navigace
- [ ] Sprint 7: Deploy + SEO

## Zname problemy
- [ ] Flowbite MCP server v `/tmp/` — pri restartu se smaze, bude treba znovu buildnout
- [ ] ESLint konfigurace neni nastavena
- [ ] Tailwind ~4.1.18 pinned kvuli Vite 7 konfliktu (kosmeticky warning)
- [ ] Hero obrazek z Unsplash — nahradit vlastnim
