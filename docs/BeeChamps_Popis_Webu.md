# Bee Champs Hub

**Kompletní popis webu pro webového vývojáře**

Verze 2.0 | Obsahuje: strukturu, obsah, funkce, chování, texty

## Co tento dokument obsahuje

Tento dokument slouží jako kompletní zadání pro webového vývojáře. Popisuje každou stránku webu, každou sekci, co se na ní nachází, jak funguje a jak se chová. K dokumentu je přiložen také funkční HTML prototyp — ten slouží jako vizuální reference, nikoliv jako finální kód.

| | |
|---|---|
| **Projekt** | Bee Champs Hub |
| **Typ webu** | Plánovací platforma pro MŠ a ZŠ |
| **Cílová skupina** | Ředitelé a učitelé mateřských a základních škol |
| **Počet stránek** | 3 hlavní stránky + modální okna |
| **Klíčová funkce** | Roční plánovač — výběr více programů najednou |
| **Jazyk webu** | Čeština (do budoucna možná SK verze) |
| **Přiložená reference** | beechamps-hub-v2.html — otevřít v prohlížeči |

---

# 1. Přehled projektu a filozofie webu

Bee Champs Hub není klasický katalog sportovních nebo vzdělávacích akcí. Je to plánovací platforma — nástroj, který školám umožňuje sestavit celý školní rok dopředu a jednou poptávkou objednat libovolný počet různých programů.

Klíčový rozdíl od běžného katalogu je ten, že škola nemusí chodit na každou kategorii zvlášť, vyplňovat pět různých formulářů a čekat na pět různých odpovědí. Místo toho otevře Roční plánovač, nakliká třeba 8 programů z různých kategorií (atletiku v září, první pomoc v říjnu, lyžáky v lednu...), přiřadí každý program do měsíce a odešle jednu souhrnnou poptávku. Bee Champs se pak postará o realizaci všeho.

### Tón a styl webu

Web musí působit profesionálně a důvěryhodně — cílová skupina jsou ředitelé a učitelé, nikoliv děti nebo rodiče. Žádný dětský e-shop, žádné pastelové barvy, žádné přehnané animace. Spíše moderní B2B nástroj, který budí důvěru a šetří čas.

### Barevná paleta

| Barva | Hex | Použití |
|---|---|---|
| Primární tmavá | `#0D1B2E` | tmavě námořnická modrá (pozadí, nav, footer) |
| Zlatá / akcent | `#F5A623` | hlavní akcent, CTA tlačítka, zvýraznění |
| Zlatá světlá | `#FFD166` | hover stavy zlatých prvků |
| Podkladová | `#FDF9F3` | teplá bílá/krémová (pozadí stránek) |
| Bílá | `#FFFFFF` | karty, modály, sekce |
| Sport kategorie | `#F5A623` | oranžovozlatá |
| Vzdělávání kategorie | `#2ECC71` | zelená |
| Projektové dny kategorie | `#3498DB` | modrá |
| Akce a pobyty kategorie | `#E74C3C` | červená |

### Typografie

| | |
|---|---|
| **Nadpisy** | Syne — tučný, geometrický sans-serif (Google Fonts) |
| **Tělo textu** | DM Sans — čistý, moderní sans-serif (Google Fonts) |
| **Základní velikost** | 14–16px pro tělo, 32–64px pro hlavní nadpisy |

---

# 2. Navigační lišta (Navbar)

Navigace je fixní — zůstává viditelná při scrollování na všech stránkách. Má výšku 68px a tmavé průhledné pozadí (#0D1B2E s 97% opacitou a blur efektem), takže při scrollování přes světlé sekce působí jako plovoucí lišta.

**Co je v navigaci — zleva doprava:**

- **Logo Bee Champs Hub** — zlatý čtvereček s včelou (emoji) + text. Kliknutím přejde na úvodní stránku.
- **Odkaz Sport** — přejde na detail kategorie Sport
- **Odkaz Vzdělávání** — přejde na detail kategorie Vzdělávání
- **Odkaz Projektové dny** — přejde na detail Projektové dny
- **Odkaz Akce** — přejde na detail Akce a pobyty
- **Tlačítko Roční plánovač** — zlatý rámeček, zvýrazněné. Přejde na stránku plánovače. Pokud má uživatel v plánovači vybrané nějaké programy, zobrazí se na tlačítku malý zlatý odznak (badge) s počtem vybraných programů.

> Na mobilních zařízeních se textové odkazy skryjí, zůstane pouze logo a tlačítko Roční plánovač.

---

# 3. Stránka 1 — Úvodní stránka (Home)

Úvodní stránka se skládá z šesti sekcí, které jdou za sebou odshora dolů.

## 3.1 Hero sekce (úvodní banner)

Celá výška viewportu (minus navbar). Tmavé námořnické pozadí s několika dekorativními prvky:

- Tři rozmazané barevné bloby (kruhy s blur filtrem) — zlatý vpravo nahoře, modrý vlevo dole, zelený uprostřed vpravo. Tvoří atmosférický gradient efekt.
- Vpravo mřížka hexagonů (šestiúhelníků) s pulzující animací — jemná, poloprůhledná dekorace připomínající plástev.

**Obsah hero sekce (vlevo, vertikálně centrovaný):**

- Malý badge nahoře: zlatý rámeček s textem "Platforma pro MŠ a ZŠ" a blikající tečkou
- Hlavní nadpis: "Plánujte celý školní rok na jednom místě" — slova "celý školní rok" jsou zlatě zvýrazněná
- Podtitul: "Vyberte si libovolně sport, vzdělávání i pobyty — klidně 10 akcí najednou. My se postaráme o vše ostatní."
- Dvě tlačítka: zlaté "Otevřít roční plánovač" (přejde na plánovač) a průhledné s rámečkem "Prohlédnout nabídku →" (scrolluje dolů na sekci kategorií)
- Statistiky: 3 čísla vedle sebe — 240+ Realizovaných akcí, 85 Zapojených škol, 98% Spokojených ředitelů

## 3.2 Sekce čtyř kategorií

Světlé pozadí (#FDF9F3). Nadpis sekce: "Čtyři kategorie, jeden systém". Pod ním krátký popis. Grid 2×2 s kartičkami kategorií.

**Každá kartička kategorie obsahuje:**

- Barevnou ikonu (emoji) ve čtverečku s lehkým barevným pozadím
- Malý label kategorie (SPORT / VZDĚLÁVÁNÍ / PROJEKTOVÉ DNY / AKCE A POBYTY) v barvě dané kategorie
- Nadpis kartičky (např. "Sportovní programy")
- Krátký popis (2–3 věty)
- Tagy s podprogramy (Zimní sporty, Basketbal, Atletika...)
- Odkaz "Zobrazit programy →" v barvě kategorie

Při najetí myší (hover): kartička se lehce zvedne (translateY -5px) a zobrazí stín.

Kliknutím na kartičku: přejde na detail stránky dané kategorie.

## 3.3 Sekce Jak to funguje

Tmavé pozadí (stejné jako navbar). Čtyři kroky vedle sebe v řadě, oddělené jemnou mezerou.

**Čtyři kroky:**

1. **01 — Otevřete plánovač** — ikona 🗓
2. **02 — Vyberte programy** — ikona ✅ — "Klikejte a přidávejte klidně 10 různých akcí. Každou přiřaďte do měsíce."
3. **03 — Odešlete poptávku** — ikona 📬 — "Jeden formulář, všechny akce najednou."
4. **04 — My zařídíme vše** — ikona 🎉

Čísla kroků jsou zobrazena jako velký poloprůhledný zlatý text v pozadí každého kroku.

## 3.4 Sekce Reference

Bílé pozadí. Tři kartičky recenzí vedle sebe (grid 3 sloupce).

**Každá recenzní kartička obsahuje:**

- Uvozovací znak " ve zlaté barvě, velký
- Pět zlatých hvězdiček
- Text recenze kurzívou
- Avatar (kruh s iniciálou) + jméno + role recenzenta

## 3.5 CTA sekce

Tmavé pozadí. Centrovaný obsah: velká včelí emoji, nadpis "Naplánujte celý rok za 15 minut", podtitul, zlaté CTA tlačítko "Otevřít roční plánovač".

## 3.6 Footer

Tmavé pozadí, zlatá horní linka. Dvě části — vlevo logo + tagline, vpravo 3 sloupce odkazů (Programy, Nástroje, Kontakt). Pod tím copyright linka.

---

# 4. Stránka 2 — Detail kategorie

Tato stránka existuje čtyřikrát — pro každou kategorii zvlášť (Sport, Vzdělávání, Projektové dny, Akce a pobyty). Obsah se dynamicky mění podle toho, na kterou kategorii uživatel klikl.

## 4.1 Hero sekce kategorie

Tmavé pozadí s barevným blob efektem v barvě dané kategorie (Sport = zlatá, Vzdělávání = zelená, Projektové dny = modrá, Akce = červená).

- **Tlačítko zpět:** "← Zpět" — přejde na úvodní stránku
- Velká ikona kategorie ve čtverečku
- Nadpis stránky (např. "Sportovní programy")
- Popis kategorie (2–3 věty)

## 4.2 Mřížka podprogramů

Grid 3 sloupce. Každá kartička podprogramu obsahuje:

- Horní část s barevným pozadím a velkou emoji ikonou (výška 140px)
- Název podprogramu (např. "Zimní sporty")
- Popis (2–3 věty)
- Metadata: věkové rozmezí, délka programu, počet lektorů — malé tagy
- Tlačítko "+ Přidat do plánovače" — při kliknutí otevře modální okno pro přiřazení měsíce a přejde do plánovače

Hover efekt: kartička se lehce zvedne, zobrazí se stín.

## 4.3 Kompletní seznam programů

### 🏃 SPORT — 8 podprogramů

| Program | Popis | Věk | Délka | Instruktoři |
|---|---|---|---|---|
| ⛷ Zimní sporty | Lyžování, sáňkování, bruslení | MŠ–ZŠ 2. st. | Celý den | 2–4 |
| 🏀 Basketbal | Hravý úvod, koordinace, týmová spolupráce | 1.–9. třída | 90 min | 1–2 |
| 🏃 Atletika | Sprint, skok, hod. Celý trojboj | 1.–9. třída | 2–4 hod | 2 |
| 🤸 Gymnastika | Obratnost, rovnováha, koordinace | MŠ–5. třída | 60–90 min | 2 |
| 🏊 Plavání | Základy plavání a vodní bezpečnosti | MŠ–6. třída | 60 min | 2–3 |
| 🛼 Inline bruslení | Od základů po jízdu v pohybu | MŠ–6. třída | 90–120 min | 2 |
| 🤼 Úpolové sporty | Judo, sebeobrana. Fair play a respekt | 3.–9. třída | 90 min | 1–2 |
| 🏐 Házená | Základy a taktika. Týmová hra | 3.–9. třída | 90 min | 1–2 |

### 🧠 VZDĚLÁVÁNÍ — 7 podprogramů

| Program | Popis | Věk | Délka | Instruktoři |
|---|---|---|---|---|
| 🩺 První pomoc | Nácvik resuscitace a ošetření ran | 3.–9. třída | 90–180 min | 1–2 |
| 🔢 Matematika hravě | Hry, logické úlohy, zážitky | MŠ–5. třída | 60–90 min | 1 |
| 📚 Čeština hravě | Hry, dramatizace, čtení | MŠ–4. třída | 60–90 min | 1 |
| 💚 Emoční inteligence | Empatie, sebeuvědomění | 1.–9. třída | 90–120 min | 1–2 |
| 🛡 Prevence šikany | Bezpečné vztahy, hranice, konflikty | 3.–9. třída | 90–120 min | 2 |
| 💻 Digitální gramotnost | Bezpečný internet, mediální výchova | 4.–9. třída | 90 min | 1 |
| 🥗 Zdravý životní styl | Výživa, pohyb, správné návyky | MŠ–ZŠ | 90 min | 1 |

### 📅 PROJEKTOVÉ DNY — 5 programů

| Program | Popis | Věk | Délka | Lektoři |
|---|---|---|---|---|
| 🏅 Sportovní olympiáda | Celoškolní disciplíny pro každou třídu | Celá škola | Celý den | 4–6 |
| 🏃 Den pohybu | Pohybové hry, překážkové dráhy | MŠ–ZŠ | Celý den | 3–4 |
| 🥗 Den zdraví | Strava, pohyb, spánek. Vzdělávací i pohybový | MŠ–ZŠ | Celý den | 2–4 |
| 🤝 Týmový den | Teambuilding pro třídu. Spolupráce a komunikace | 3.–9. třída | Celý den | 2 |
| 🌿 Den přírody | Orientace, příroda, udržitelnost. Venkovní | MŠ–6. třída | Celý den | 3–4 |

### 🏕 AKCE A POBYTY — 6 programů

| Program | Popis | Věk | Délka | Instruktoři |
|---|---|---|---|---|
| ⛷ Lyžařský kurz | Kompletní org. lyžáků | ZŠ 4.–9. třída | 5–7 dní | 4–8 |
| 🚣 Vodácký kurz | Kánoe, bezpečnost na vodě | ZŠ 5.–9. třída | 3–5 dní | 3–5 |
| 🌲 Škola v přírodě | Vzdělávací + sportovní program | MŠ–ZŠ | 3–5 dní | 2–4 |
| ⛺ Letní tábor | Bohatý program, výlety | 6–15 let | 7–14 dní | 4–8 |
| 🏋 Sportovní soustředění | Intenzivní trénink | ZŠ 4.–9. třída | 3–5 dní | 2–4 |
| 🎯 Zájmové kroužky | Celoroční, přímo ve škole | MŠ–ZŠ | Celoroční | 1 |

---

# 5. Stránka 3 — Roční plánovač (klíčová stránka)

Toto je nejdůležitější a nejkomplexnější stránka celého webu. Je to hlavní konkurenční výhoda Bee Champs Hub. Stránka umožňuje škole vybrat libovolný počet programů z různých kategorií, přiřadit každý do měsíce a odeslat jednu souhrnnou poptávku.

Stránka má rozložení ve dvou sloupcích vedle sebe (layout: grid 340px + zbytek).

## 5.1 Levý panel — Sidebar s nabídkou programů

Šířka 340px. Bílé pozadí. Posouvatelný obsah (overflow: scroll). Sticky — při scrollování pravé části zůstává levý panel na místě.

**Hlavička sidebaru (sticky):**

- Nadpis: "Nabídka programů"
- Popis: "Klikněte na program → vyberte měsíc. Libovolný počet."
- Vyhledávací pole — filtruje programy podle názvu v reálném čase
- Filtrační tlačítka: Vše / Sport / Vzdělávání / Projektové / Pobyty — každé v barvě své kategorie. Aktivní filtr je podbarvený barvou kategorie.

**Seznam programů:**

Programy jsou seskupeny pod barevnými nadpisy kategorií. Každý program je řádek s:

- Ikonou v barevném čtverečku vlevo
- Názvem programu a metadaty (věk, délka)
- Zaškrtávacím polem vpravo — prázdné = nevybráno, vyplněné barvou kategorie = vybráno

Pokud je program vybraný, celý řádek dostane barevný rámeček v barvě jeho kategorie a u metadat se zobrazí "✓ Vybráno (Nx)" kde N je počet měsíců, do kterých byl přiřazen.

> Stejný program lze vybrat do více měsíců. Například Basketbal v říjnu i v dubnu.

## 5.2 Pravý panel — Roční kalendář

**Horní lišta (topbar):**

- Nadpis: "Roční plánovač"
- Podtitul: "Sestavte harmonogram aktivit na celý školní rok"
- Vpravo: počítadlo "X programů vybráno" + tlačítko "Odeslat poptávku" (neaktivní dokud není vybráno alespoň 1 program)

**Roční kalendář — grid 3 sloupce, 12 měsíců (září–srpen):**

Každý měsíc je kartička s:

- Názvem měsíce a počtem přidaných akcí
- Barevnými štítky přidaných programů — každý má tečku v barvě kategorie, emoji ikonu a název
- Tlačítkem "+ Přidat program" — otevře výběr ze sidebaru
- Na každém štítku programu je při najetí myší tlačítko ✕ pro odebrání z daného měsíce

**Spodní summary lišta (sticky, tmavá):**

Zůstává viditelná dole na pravém panelu. Obsahuje:

- Nadpis "Vybrané programy" + tlačítko "Vymazat vše"
- Barevné čipy všech vybraných programů — každý čip ukazuje ikonu, název a zkratku měsíce
- Velké tlačítko "Odeslat poptávku najednou" (zlaté, neaktivní bez výběru)

## 5.3 Modální okno — Přiřazení měsíce

Otevře se po kliknutí na jakýkoli program v sidebaru. Tmavé overlay pozadí s blur efektem.

**Obsah okna:**

- Nadpis: název a ikona vybraného programu
- Text: "Kdy chcete tento program realizovat? Můžete přidat do více měsíců."
- Mřížka 12 tlačítek — jedno pro každý měsíc (Zář, Říj, Lis...)
- Tlačítko měsíce: kliknutím se přepne — nepřiřazeno (bílé s rámečkem) vs. přiřazeno (plné, v barvě kategorie)
- Tlačítko "Zavřít" dole

> Uživatel může v jednom otevření okna zaškrtnout hned více měsíců. Změny se okamžitě promítají do kalendáře a sidebaru.

---

# 6. Poptávkový formulář (modální okno)

Otevře se po kliknutí na tlačítko "Odeslat poptávku" z plánovače nebo z navigace. Je to modální okno — překryvná vrstva přes aktuální stránku. Tmavé overlay, bílá kartička, maximální šířka 680px.

## 6.1 Přehled vybraných programů

V horní části formuláře je krémový box s názvem "Váš výběr programů" a seznamem všech vybraných akcí. Každá akce je řádek s barevnou tečkou, ikonou, názvem a označením měsíce. Tato část se vyplní automaticky z plánovače — uživatel nic nemusí zadávat.

## 6.2 Formulářová pole

**Sekce Základní informace o škole:**

| Pole | Typ | Povinné |
|---|---|---|
| Název školy / školky | Textové pole | Ano |
| Typ instituce | Dropdown: MŠ / ZŠ 1. st. / ZŠ 2. st. / MŠ + ZŠ | Ano |
| Město | Textové pole | Ano |
| Průměrný počet dětí | Číselné pole | Ano |
| Věkové rozmezí | Dropdown: 3–6 / 6–10 / 10–13 / 13–15 / Různé | Ano |

**Sekce Kontaktní osoba:**

| Pole | Typ | Povinné |
|---|---|---|
| Jméno a příjmení | Textové pole | Ano |
| Pracovní pozice | Textové pole | Ne |
| Telefon | Telefonní pole | Ano |
| Email | Email pole | Ano |

**Sekce Doplňující informace (nepovinné):**

| Pole | Typ | Povinné |
|---|---|---|
| Tělocvična? | Dropdown: Ano / Ne / Nevím | Ne |
| Venkovní hřiště? | Dropdown: Ano / Ne / Nevím | Ne |
| Poznámky | Textová oblast (3 řádky) | Ne |

## 6.3 Odeslání formuláře

Tlačítko "Odeslat poptávku na všechny programy" — tmavě modré, při hoveru se změní na zlaté.

Po odeslání: formulář se skryje a zobrazí se obrazovka úspěchu s textem "Poptávka odeslána! Přijali jsme vaši poptávku na X programů. Do 24 hodin se vám ozveme." a tlačítkem Zavřít.

> Formulář jde odeslat z plánovače i bez předchozího výběru v plánovači — pak je sekce "Váš výběr programů" prázdná a uživatel může vypsat zájem volným textem do pole Poznámky.

---

# 7. Interakce a chování webu

## 7.1 Přechody mezi stránkami

Web funguje jako Single Page Application (SPA) — stránky se nepřenačítají, obsah se zobrazuje a skrývá JavaScriptem. Při přechodu na novou stránku se automaticky scrolluje na začátek.

| Přechod | Akce |
|---|---|
| Domů → Plánovač | Kliknutí na "Otevřít roční plánovač" nebo ikonu v navigaci |
| Domů → Kategorie | Kliknutí na kartičku kategorie nebo odkaz v navigaci |
| Kategorie → Plánovač | Tlačítko "Přidat do plánovače" na podprogramu |
| Kategorie → Domů | Tlačítko "← Zpět" |
| Plánovač → Formulář | Tlačítko "Odeslat poptávku" |

## 7.2 Stav plánovače

Výběr programů v plánovači se uchovává v paměti prohlížeče po celou dobu návštěvy. Pokud uživatel přejde z plánovače na jinou stránku a vrátí se, všechny vybrané programy jsou stále přítomny. Badge v navigaci ukazuje aktuální počet.

> V první verzi není nutná trvalá paměť (localStorage) — stačí paměť JavaScriptové proměnné. Pokud uživatel obnoví stránku, výběr se resetuje.

## 7.3 Animace a přechody

| Prvek | Animace |
|---|---|
| Hero sekce | Fade-up animace obsahu při načtení stránky (staggered — každý prvek s mírným zpožděním) |
| Karty kategorií | Hover: translateY(-5px) + box-shadow — plynulý přechod 0.3s |
| Modální okna | Scale + translateY animace při otevření (0.25–0.3s) |
| Hexagony v hero | Pulzující opacity animace (3s loop) |
| Blobs v pozadí | Statické, jen blur efekt — nekýbají se |
| Navigační badge | Zobrazí se / skryje dle počtu vybraných programů |

## 7.4 Responsivita

| Breakpoint | Chování |
|---|---|
| Desktop (1200px+) | Plné rozložení, sidebar + kalendář vedle sebe |
| Tablet (800–1200px) | Sidebar se přesune nad kalendář, grid 2 sloupce |
| Mobil (pod 800px) | Jeden sloupec, navigace bez textových odkazů (jen logo + plánovač tlačítko) |

---

# 8. Přesné texty klíčových prvků

## 8.1 Navigace

| Prvek | Text |
|---|---|
| Logo text | Bee Champs Hub ("Hub" je zlatě zvýrazněné) |
| Odkaz 1 | Sport |
| Odkaz 2 | Vzdělávání |
| Odkaz 3 | Projektové dny |
| Odkaz 4 | Akce |
| Hlavní tlačítko | Roční plánovač |

## 8.2 Hero sekce

| Prvek | Text |
|---|---|
| Badge | Platforma pro MŠ a ZŠ |
| Hlavní nadpis | Plánujte celý školní rok na jednom místě |
| Zlaté slova v nadpisu | celý školní rok |
| Podtitul | Vyberte si libovolně sport, vzdělávání i pobyty — klidně 10 akcí najednou. My se postaráme o vše ostatní. |
| Tlačítko 1 | Otevřít roční plánovač |
| Tlačítko 2 | Prohlédnout nabídku → |
| Stat 1 | 240+ Realizovaných akcí |
| Stat 2 | 85 Zapojených škol |
| Stat 3 | 98% Spokojených ředitelů |

## 8.3 Sekce kategorií

| Prvek | Text |
|---|---|
| Label | Co nabízíme |
| Nadpis | Čtyři kategorie, jeden systém |
| Podtitul | Vyberte z ověřených programů nebo si sestavte celý rok v plánovači — sport, vzdělávání, pobyty i projektové dny. |

## 8.4 Sekce Jak to funguje

| Prvek | Text |
|---|---|
| Label | Jak to funguje |
| Nadpis | Od výběru k realizaci |
| Krok 1 | Otevřete plánovač — V ročním plánovači vidíte celou nabídku — sport, vzdělávání i pobyty — přehledně na jednom místě. |
| Krok 2 | Vyberte programy — Klikejte a přidávejte klidně 10 různých akcí. Každou přiřaďte do měsíce podle potřeby. |
| Krok 3 | Odešlete poptávku — Jeden formulář, všechny akce najednou. Kontakt, počty dětí, termíny — hotovo za 2 minuty. |
| Krok 4 | My zařídíme vše — Potvrdíme detaily a zajistíme realizaci každé akce přesně podle vašeho plánu. |

## 8.5 CTA sekce dole

| Prvek | Text |
|---|---|
| Nadpis | Naplánujte celý rok za 15 minut |
| Podtitul | Vyberte si libovolný mix sportovních, vzdělávacích i pobytových programů — vše v jednom. |
| Tlačítko | Otevřít roční plánovač |

## 8.6 Plánovač — texty

| Prvek | Text |
|---|---|
| Nadpis stránky | Roční plánovač |
| Podtitul | Sestavte harmonogram aktivit na celý školní rok |
| Sidebar nadpis | Nabídka programů |
| Sidebar podtitul | Klikněte na program → vyberte měsíc. Libovolný počet. |
| Search placeholder | Hledat program... |
| Summary lišta nadpis | Vybrané programy |
| Prázdný stav | Zatím nic nevybráno. Klikněte na program vlevo → |
| Tlačítko odeslat | Odeslat poptávku najednou |

---

# 9. Technické požadavky a doporučení

## 9.1 Technický stack

Web lze postavit na více technologiích. Priorita je funkčnost plánovače a přehledný kód pro budoucí rozšíření.

| | |
|---|---|
| **Doporučení** | Next.js (React) nebo Webflow pro CMS části |
| **Alternativa** | Čisté HTML/CSS/JS (jako prototyp) pro rychlé spuštění |
| **Formuláře** | EmailJS nebo Netlify Forms pro odesílání emailů |
| **CMS** | Webflow CMS nebo Sanity.io pro správu programů bez kódu |
| **Hosting** | Vercel nebo Netlify (zdarma pro základní verzi) |
| **Analytika** | Google Analytics 4 nebo Plausible |

## 9.2 Co musí vývojář postavit od nuly

Pozor: přiložený HTML prototyp je pouze vizuální reference. Vývojář by měl postavit produkční web s těmito vlastnostmi, které prototyp nemá:

- Reálné odesílání formuláře na email (a ideálně do CRM systému)
- CMS pro správu programů (admin rozhraní pro přidávání nových programů bez kódu)
- SEO optimalizace (meta tagy, Open Graph, strukturovaná data)
- GDPR cookie lišta
- Google Analytics nebo jiná analytika
- Vlastní doména (beechampshub.cz nebo podobná)
- SSL certifikát
- Mobilní menu (hamburger) pro navigaci na telefonu

## 9.3 Co je v prototypu hotové a lze použít jako referenci

- Kompletní vizuální design — barvy, typografie, spacing, layout
- Všechny animace a hover efekty
- Logika plánovače — výběr programů, přiřazení do měsíců, souhrn
- Struktura formuláře — všechna pole, rozložení, validace
- Texty — veškerý obsah webu
- Data — kompletní seznam 26 programů se všemi metadaty

## 9.4 Doporučený harmonogram

| Fáze | Délka | Popis |
|---|---|---|
| Fáze 1 — Design review | 1 týden | Procházení prototypu, případné úpravy designu v Figmě |
| Fáze 2 — Frontend | 2–3 týdny | Stavba všech stránek a komponent |
| Fáze 3 — Plánovač | 1–2 týdny | Implementace logiky plánovače |
| Fáze 4 — Formulář + email | 1 týden | Napojení formuláře, automatické emaily |
| Fáze 5 — CMS + admin | 1–2 týdny | Možnost správy obsahu |
| Fáze 6 — Testování | 1 týden | QA, mobilní testování, rychlost |
| **Celkem** | **cca 7–10 týdnů** | pro plnou verzi |

---

# 10. Závěr a kontakt

Tento dokument spolu s přiloženým HTML prototypem tvoří kompletní zadání projektu Bee Champs Hub. Prototyp otevři v libovolném prohlížeči — soubor se jmenuje beechamps-hub-v2.html.

Veškeré texty, struktura i logika jsou v dokumentu popsány. Pokud máš otázky k jakékoli části, ozvi se.

S pozdravem,
**Matěj**
Bee Champs Hub
