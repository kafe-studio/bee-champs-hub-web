# Bee Champs Hub - Sprinty

## Sprint 0: Zakladni infrastruktura [HOTOVO]
**Kapitola:** 9 (Technicke pozadavky)
**Cil:** Inicializace monorepa, tech stack, zakladni konfigurace

### Ukoly:
- [x] Inicializace pnpm monorepa (pnpm-workspace.yaml)
- [x] Vytvoreni `apps/web` — Astro 5 + Svelte 5 + Tailwind CSS v4 + Cloudflare adapter
- [x] Vytvoreni `apps/api` — Hono + Effect + Cloudflare Workers
- [x] Vytvoreni `packages/shared` — sdilene typy, konstanty (programy, kategorie, barvy)
- [x] Vytvoreni `packages/db` — Drizzle ORM schema (poptavky)
- [x] Root tsconfig.json (strict, ES2022)
- [ ] ESLint konfigurace s Effect pravidly
- [x] Overeni `pnpm dev` funguje pro web i API
- [x] Design reference: prevzit strukturu z Astro Gym sablony (Layout, global.css, @theme)
- [x] Nastavit Bee Champs barevnou paletu v Tailwind @theme (navy #0D1B2E, zlata #F5A623, atd.)
- [x] Nastavit fonty Syne + DM Sans (Google Fonts)

---

## Sprint 1: Navigace a Layout [HOTOVO]
**Kapitola:** 2 (Navigacni lista)
**Cil:** Fixni navbar, layout, footer — kostra webu

### Ukoly:
- [x] Layout.astro — zakladni HTML kostra (head, meta, fonty, slot)
- [x] Header.astro — fixni navbar 68px, tmave pruhledne pozadi s blur
- [x] Logo Bee Champs Hub (hexagon SVG + text, "Hub" zlate)
- [x] Navigacni odkazy: Sport, Vzdelavani, Projektove dny, Akce
- [x] Tlacitko "Rocni planovac" se zlatym rameckem
- [x] Mobilni menu (hamburger) — skryje textove odkazy, zobrazi logo + planovac
- [x] Footer.astro — tmave pozadi, 4 sloupce odkazu
- [ ] SPA navigace — Astro View Transitions (presunuto do Sprint 6)

---

## Sprint 2: Uvodni stranka (Home) [HOTOVO]
**Kapitola:** 3 (Stranka 1)
**Cil:** Kompletni uvodni stranka se vsemi sekcemi

### Ukoly:
- [x] HeroSection — dvousloupcovy layout: text vlevo, obrazek vpravo
  - Nadpis se zlatym zvyraznenim
  - Plovouci karticka "Snadne planovani" s CircleCheckBig ikonou
  - 2 CTA tlacitka (zlate s glow + pruhledne)
  - 3 statistiky (50+, 100+, 10k+)
  - Dekorativni bloby
- [x] CategoriesSection — grid 4 sloupce, Lucide ikony (Dumbbell, BookOpen, CalendarDays, Tent)
  - Jemne bordery (border-black/[0.06])
  - Hover efekt, barevne ikony dle kategorie
- [x] HowItWorksSection — tmave pozadi, 4 kroky s Lucide ikonami
- [x] TestimonialsSection — 3 recenzni karticky s hvezdickami
- [x] CtaSection — tmave pozadi, hexagon SVG, zlate tlacitko

---

## Sprint 3: Detail kategorie [HOTOVO]
**Kapitola:** 4 (Stranka 2)
**Cil:** 4 dynamicke stranky kategorii s programy

### Ukoly:
- [x] Data: kompletni seznam 26 programu v packages/shared
- [x] [category].astro — dynamicka stranka s prerender + getStaticPaths
- [x] Hero sekce kategorie — tmave pozadi, ikona, nadpis, popis, tlacitko zpet
- [x] ProgramCard.astro — karta programu s Lucide metadata ikonami
  - Ikona, nazev, popis, metadata (vek, delka, lektori)
  - Tlacitko "+ Pridat do planovace"
- [x] 4 stranky: /sport (8), /vzdelavani (7), /projektove-dny (5), /akce (6)

---

## Sprint 3.5: Cloudflare deployment [HOTOVO]
**Cil:** Nasazeni na Cloudflare Workers

### Ukoly:
- [x] wrangler.jsonc pro apps/web (Astro SSR + assets)
- [x] wrangler.jsonc pro apps/api (Hono worker)
- [x] D1 databaze bee-champs-db (ID: 0462ef41-dd80-47e5-baa5-7e8814546e14, EEUR)
- [x] .assetsignore pro _worker.js
- [x] Deploy: bee-champs-hub-web + bee-champs-hub-api

### Deploy URL:
- Web: https://bee-champs-hub-web.webmaster4329.workers.dev/
- API: https://bee-champs-hub-api.webmaster4329.workers.dev/health

---

## Sprint 4: Rocni planovac (hlavni funkcionalita) [HOTOVO]
**Kapitola:** 5 (Stranka 3)
**Cil:** Kompletni planovac — sidebar + kalendar + interakce

### Ukoly:
- [x] 5.1 Levy panel (Sidebar) — 340px, sticky, scrollovatelny
  - Hlavicka: nadpis, popis, vyhledavani, filtracni tlacitka
  - Seznam programu seskupenych pod kategoriemi
  - Zasktavaci pole, barevne ramecky, stav "Vybrano (Nx)"
  - Realtime filtrace podle nazvu + kategorie
- [x] 5.2 Pravy panel (Rocni kalendar) — grid 3 sloupce, 12 mesicu (zari-srpen)
  - Horni lista: nadpis, pocitadlo, tlacitko "Odeslat poptavku"
  - Karticky mesicu s barevnymi stitky programu
  - Tlacitko "+ Pridat program" na kazdem mesici
  - Tlacitko X pro odebrani programu z mesice
- [x] 5.3 Modalni okno — prirazeni mesice
  - Mrizka 12 tlacitek mesicu, prepinani stavu
  - Vice mesicu najednou
  - Okamzita aktualizace kalendare i sidebaru
- [x] Spodni summary lista (sticky) — vybrane programy, cipy, "Vymazat vse"
- [x] Stav planovace — uchovani v pameti prohlizece (JS promenna)
- [x] Badge v navigaci — aktualni pocet vybranych programu
- [x] Responsivita: tablet (sidebar nad kalendarem), mobil (1 sloupec)

### Poznamka:
Toto je Svelte 5 interaktivni komponenta — nejslozitejsi cast webu. Pouzit Svelte 5 runes ($state, $derived) pro stav.

---

## Sprint 5: Poptavkovy formular
**Kapitola:** 6 (Modalni okno formulare)
**Cil:** Formular pro odeslani poptavky

### Ukoly:
- [ ] 6.1 Prehled vybranych programu — automaticky z planovace
- [ ] 6.2 Formularova pole (skola, kontakt, doplnujici info)
- [ ] 6.3 API endpoint (Hono + Effect) pro prijem poptavky
- [ ] 6.4 Ulozeni do DB (Drizzle + D1)
- [ ] 6.5 Uspesna obrazovka

---

## Sprint 6: Interakce, animace, responsivita
**Kapitola:** 7 (Interakce a chovani webu)
**Cil:** Dokonceni SPA chovani, animace, responsivita

### Ukoly:
- [ ] 7.1 SPA navigace — Astro View Transitions
- [ ] 7.2 Stav planovace — zachovani pri navigaci
- [ ] 7.3 Animace (fade-up, hover, modaly, hexagony)
- [ ] 7.4 Responsivita (desktop, tablet, mobil)

---

## Sprint 7: SEO, analytika, produkce
**Kapitola:** 9.2 (Co musi vyvojar postavit od nuly)
**Cil:** Priprava na produkci

### Ukoly:
- [ ] SEO: meta tagy, Open Graph, strukturovana data
- [ ] GDPR cookie lista
- [ ] Google Analytics 4 / Plausible
- [ ] Sitemap (Astro sitemap integrace)
- [ ] Vlastni domena + SSL
- [ ] Testovani (Vitest pro API, manualni QA pro web)
- [ ] Lighthouse audit (performance, accessibility)
