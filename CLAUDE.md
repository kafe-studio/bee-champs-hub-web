# Bee Champs Hub - CLAUDE.md

## Projekt
Planovaci platforma pro MS a ZS. Skoly si sestavi cely skolni rok — vyberou programy z 4 kategorii, priradi je do mesicu, a odeslou jednu souhrnnou poptavku.

## Tech Stack
- **Monorepo**: pnpm workspaces
- **Web**: Astro 5 + Svelte 5 + Tailwind CSS v4 + Cloudflare adapter
- **API**: Hono + Effect TS + Cloudflare Workers
- **DB**: Drizzle ORM (Cloudflare D1)
- **Testy**: Vitest
- **TypeScript**: Strict, ES2022

## Jazyk
- Komunikuj s uzivatelem **pouze cesky**
- Dokumentaci a komentare v kodu pis **cesky**
- Interne premyslej anglicky, ale vystup vzdy cesky

## POVINNE PRED KAZDOU IMPLEMENTACI
1. **ZJISTI VERZE V PROJEKTU** — zkontroluj `package.json` (root + apps/* + packages/*) pro aktualni verze. NIKDY nepredpokladej verze z pameti!
2. **WEBSEARCH PRO DOKUMENTACI** — **BEZVYHRADNE** pouzij `WebSearch` pro aktualni docs knihovny/API kterou budes pouzivat. Over syntax a best practices pro KONKRETNI verzi v projektu. Toto neni volitelne — VZDY hledej dokumentaci pred implementaci, bez vyjimky.
3. **NIKDY NEINSTALUJ BEZ OVERENI** — `pnpm view nazev dist-tags --json` nebo WebSearch pro latest verzi. VZDY pouzivej `pnpm`, NIKDY `npm`.
4. **SKRIPTY** — viz `package.json` v koreni. NIKDY nevymyslej vlastni prikazy.

## POVINNE PO KAZDE IMPLEMENTACI — AUDIT VLASTNI PRACE
Po dokonceni kazde funkce / souboru / logicke celku **VZDY** proved:

1. **TYPOVA KONTROLA** — `tsc -p apps/api/tsconfig.json --noEmit` (backend), `tsc -p apps/web/tsconfig.json --noEmit` (frontend). Oprav VSE co TypeScript hlasi — zadne `any` ani `@ts-ignore`.
2. **PRECTI SVE ZMENY** — znovu projdi kazdy zmeneny soubor a zkontroluj:
   - Dodrzeni Effect TS pravidel (zadny `async/await`, `throw`, `null`, `.pipe()` na instancich)
   - Zadne zbytecne komentare, konzolove logy, debug artefakty
   - Spravna ceska dokumentace u netrivalniho kodu
3. **SPUST TESTY** — `pnpm test` (nebo cilenou sadu). Pokud test selze, OPRAV problem — NIKDY nepreskoč.
4. **ZKONTROLUJ REGRESE** — pomysli, zda zmena neovlivnuje jine casti systemu (schemata, sdilene typy, API kontrakt).

## PRUBEZNE COMMITY — POVINNY POSTUP
- **Po kazdem logickem celku** (nova funkce, oprava bugy, refactoring) vytvor commit — NESHROMAZDUJ zmeny.
- Commit message format: `<typ>(<rozsah>): <co a proc>` (napr. `feat(api): pridat endpoint pro poptavky`)
- Typy: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `build`
- **NIKDY** necommituj: `.env`, credentials, debug logy, rozbity TypeScript, selhavajici testy.
- Vzdy pouzij `git add <konkretni soubory>` — NIKDY `git add -A` bez kontroly.

## DOKUMENTOVANI KODU
- Kazda netrivialni funkce / handler / service musi mit cesky komentar vysvetlujici **PROC** (ne jen co dela).
- Slozite Effect pipeline — pridej radkovy komentar ke kazdemu kroku.
- Nove DB migrace — komentar v souboru popisujici duvod zmeny schematu.
- Nove API endpointy — aktualizuj nebo vytvor prislusnou sekci v `docs/`.

## Striktni Effect TS pravidla
Viz [EFFECT_STRICT_RULES.md](./EFFECT_STRICT_RULES.md) — VZDY dodrzuj:

- **NIKDY** `async/await` v backendovem kodu (apps/api) — vse pres `Effect.gen` + `yield*`
- **NIKDY** `Effect.runPromise` — pouzij `ManagedRuntime.make(layer).runPromise(...)`
- **NIKDY** `any`, `throw`, `null`/`undefined` v domenove logice
- **NIKDY** `.pipe()` metoda na instancich — pouzivej standalone `pipe()`
- **NIKDY** `eslint-disable` komentare
- **VZDY** `Data.TaggedError` pro chyby, `Option<T>` pro nullable
- **VZDY** `Schema.Class` pro datove modely, `Schema.decodeUnknown` pro validaci requestu
- **VZDY** `Context.GenericTag` + `Layer` pro dependency injection
- **VZDY** `Match.exhaustive` (ne `Match.orElse` ani `switch`)
- **VZDY** `makeHonoRuntime` wrapper s `ManagedRuntime` pro HTTP handlery
- **VZDY** `Effect.tryPromise` na hranicich (DB, fetch, KV, R2)
- **VZDY** spoustej `tsc -p apps/api/tsconfig.json --noEmit` pro API

## Struktura projektu
```
bee-champs/
├── CLAUDE.md
├── EFFECT_STRICT_RULES.md
├── README.md
├── docs/
│   └── SPRINTY.md
├── apps/
│   ├── web/          # Astro 5 + Svelte 5 + Tailwind CSS v4
│   └── api/          # Hono + Effect na CF Workers
└── packages/
    ├── shared/       # Sdilene typy, konstanty (programy, kategorie)
    └── db/           # Drizzle schema (poptavky)
```

## Design reference
- Vizualni inspirace: Astro Gym Fitness Website (sudeep2003)
- Barevna paleta: navy #0D1B2E, zlata #F5A623, zelena #2ECC71, modra #3498DB, cervena #E74C3C
- Fonty: Syne (nadpisy), DM Sans (telo textu)
- Tmave pozadi + zlate akcenty, profesionalni B2B ton

## Flowbite-Svelte MCP Server

Mas k dispozici Flowbite-Svelte MCP server s dokumentaci. **VZDY** ho pouzivej pri praci s Flowbite komponentami.

### Dostupne MCP nastroje:

1. **findComponent** — Pouzij PRVNI pro nalezeni komponenty podle jmena. Vraci cestu k dokumentaci.
2. **getComponentList** — Seznam vsech dostupnych komponent s kategoriemi.
3. **getComponentDoc** — Kompletni dokumentace komponenty vcetne prikladu, props a best practices. Pouzij PO findComponent.
4. **searchDocs** — Fulltextove vyhledavani v cele dokumentaci. Pouzij kdyz hledas vzory nebo funkce napric komponentami.

### Povinny workflow pri praci s Flowbite-Svelte:

1. `findComponent` — najdi komponentu
2. `getComponentDoc` — precti CELOU dokumentaci vcetne prikladu
3. Pis kod **presne podle dokumentace** — ne z pameti!
4. Dodrzuj patterny z docs (napr. `Label class="space-y-2"` obaluje `<span>` + `<Input>`)

### Tailwind v4 setup pro Flowbite:

V `global.css` MUSI byt:
```css
@import "tailwindcss";
@plugin "../../node_modules/flowbite/plugin";
@source "../../node_modules/flowbite-svelte/dist";
```

Cesty jsou relativni od `apps/web/src/styles/global.css` k `apps/web/node_modules/` (pnpm workspaces).

Bez `@plugin` a `@source` Flowbite komponenty NEBUDOU mit styly (zadne bordery, pozadi atd.).

## Dulezite soubory
- `docs/SPRINTY.md` — rozplanovane sprinty podle kapitol zadani
- `README.md` — kompletni zadani webu (specifikace)
