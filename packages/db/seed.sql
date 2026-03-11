-- Seed: Kategorie
INSERT OR IGNORE INTO categories (slug, name, label, icon, color, description, sort_order) VALUES
  ('sport', 'Sportovní programy', 'SPORT', '🏃', '#F5A623', 'Pohybové programy pro všechny věkové kategorie — od lyžování až po atletiku.', 0),
  ('vzdelavani', 'Vzdělávací programy', 'VZDĚLÁVÁNÍ', '🧠', '#2ECC71', 'Interaktivní workshopy a lekce — první pomoc, emoční inteligence, prevence.', 1),
  ('projektove-dny', 'Projektové dny', 'PROJEKTOVÉ DNY', '📅', '#3498DB', 'Celodenní tematické akce pro celou školu — olympiády, den zdraví, týmové dny.', 2),
  ('akce', 'Akce a pobyty', 'AKCE A POBYTY', '🏕', '#E74C3C', 'Vícedenní akce a pobyty — lyžáky, vodáky, škola v přírodě, tábory.', 3);

-- Seed: Programy — Sport (8)
INSERT OR IGNORE INTO programs (slug, category_slug, name, icon, description, age_range, duration, instructors, sort_order) VALUES
  ('zimni-sporty', 'sport', 'Zimní sporty', '⛷️', 'Lyžování, sáňkování, bruslení.', 'MŠ–ZŠ 2. st.', 'Celý den', '2–4', 0),
  ('basketbal', 'sport', 'Basketbal', '🏀', 'Hravý úvod, koordinace, týmová spolupráce.', '1.–9. třída', '90 min', '1–2', 1),
  ('atletika', 'sport', 'Atletika', '🏃‍♂️', 'Sprint, skok, hod. Celý trojboj.', '1.–9. třída', '2–4 hod', '2', 2),
  ('gymnastika', 'sport', 'Gymnastika', '🤸‍♀️', 'Obratnost, rovnováha, koordinace.', 'MŠ–5. třída', '60–90 min', '2', 3),
  ('plavani', 'sport', 'Plavání', '🏊‍♂️', 'Základy plavání a vodní bezpečnosti.', 'MŠ–6. třída', '60 min', '2–3', 4),
  ('inline-brusleni', 'sport', 'Inline bruslení', '🛼', 'Od základů po jízdu v pohybu.', 'MŠ–6. třída', '90–120 min', '2', 5),
  ('upolove-sporty', 'sport', 'Úpolové sporty', '🥋', 'Judo, sebeobrana. Fair play a respekt.', '3.–9. třída', '90 min', '1–2', 6),
  ('hazena', 'sport', 'Házená', '🤾‍♂️', 'Základy a taktika. Týmová hra.', '3.–9. třída', '90 min', '1–2', 7);

-- Seed: Programy — Vzdělávání (7)
INSERT OR IGNORE INTO programs (slug, category_slug, name, icon, description, age_range, duration, instructors, sort_order) VALUES
  ('prvni-pomoc', 'vzdelavani', 'První pomoc', '🩺', 'Nácvik resuscitace a ošetření ran.', '3.–9. třída', '90–180 min', '1–2', 0),
  ('matematika-hrave', 'vzdelavani', 'Matematika hravě', '🧮', 'Hry, logické úlohy, zážitky.', 'MŠ–5. třída', '60–90 min', '1', 1),
  ('cestina-hrave', 'vzdelavani', 'Čeština hravě', '📖', 'Hry, dramatizace, čtení.', 'MŠ–4. třída', '60–90 min', '1', 2),
  ('emocni-inteligence', 'vzdelavani', 'Emoční inteligence', '🫂', 'Empatie, sebeuvědomění.', '1.–9. třída', '90–120 min', '1–2', 3),
  ('prevence-sikany', 'vzdelavani', 'Prevence šikany', '🛡️', 'Bezpečné vztahy, hranice, konflikty.', '3.–9. třída', '90–120 min', '2', 4),
  ('digitalni-gramotnost', 'vzdelavani', 'Digitální gramotnost', '💻', 'Bezpečný internet, mediální výchova.', '4.–9. třída', '90 min', '1', 5),
  ('zdravy-zivotni-styl', 'vzdelavani', 'Zdravý životní styl', '🍎', 'Výživa, pohyb, správné návyky.', 'MŠ–ZŠ', '90 min', '1', 6);

-- Seed: Programy — Projektové dny (5)
INSERT OR IGNORE INTO programs (slug, category_slug, name, icon, description, age_range, duration, instructors, sort_order) VALUES
  ('sportovni-olympiada', 'projektove-dny', 'Sportovní olympiáda', '🏅', 'Celoškolní disciplíny pro každou třídu.', 'Celá škola', 'Celý den', '4–6', 0),
  ('den-pohybu', 'projektove-dny', 'Den pohybu', '🎽', 'Pohybové hry, překážkové dráhy.', 'MŠ–ZŠ', 'Celý den', '3–4', 1),
  ('den-zdravi', 'projektove-dny', 'Den zdraví', '💪', 'Strava, pohyb, spánek. Vzdělávací i pohybový.', 'MŠ–ZŠ', 'Celý den', '2–4', 2),
  ('tymovy-den', 'projektove-dny', 'Týmový den', '🤝', 'Teambuilding pro třídu. Spolupráce a komunikace.', '3.–9. třída', 'Celý den', '2', 3),
  ('den-prirody', 'projektove-dny', 'Den přírody', '🍃', 'Orientace, příroda, udržitelnost. Venkovní.', 'MŠ–6. třída', 'Celý den', '3–4', 4);

-- Seed: Programy — Akce a pobyty (6)
INSERT OR IGNORE INTO programs (slug, category_slug, name, icon, description, age_range, duration, instructors, sort_order) VALUES
  ('lyzarsky-kurz', 'akce', 'Lyžařský kurz', '🎿', 'Kompletní organizace lyžáků.', 'ZŠ 4.–9. třída', '5–7 dní', '4–8', 0),
  ('vodacky-kurz', 'akce', 'Vodácký kurz', '🛶', 'Kánoe, bezpečnost na vodě.', 'ZŠ 5.–9. třída', '3–5 dní', '3–5', 1),
  ('skola-v-prirode', 'akce', 'Škola v přírodě', '🌲', 'Vzdělávací + sportovní program.', 'MŠ–ZŠ', '3–5 dní', '2–4', 2),
  ('letni-tabor', 'akce', 'Letní tábor', '⛺', 'Bohatý program, výlety.', '6–15 let', '7–14 dní', '4–8', 3),
  ('sportovni-soustredeni', 'akce', 'Sportovní soustředění', '🏋️‍♂️', 'Intenzivní trénink.', 'ZŠ 4.–9. třída', '3–5 dní', '2–4', 4),
  ('zajmove-krouzky', 'akce', 'Zájmové kroužky', '🎯', 'Celoroční, přímo ve škole.', 'MŠ–ZŠ', 'Celoroční', '1', 5);

-- Seed: Reference
INSERT OR IGNORE INTO testimonials (text, name, role, initials, sort_order) VALUES
  ('Díky Bee Champs jsme naplánovali celý rok za jedno odpoledne. Dříve to trvalo týdny vyjednávání s různými dodavateli.', 'Mgr. Jana Nováková', 'Ředitelka ZŠ Květinová', 'JN', 0),
  ('Skvělá platforma! Vybrali jsme 8 programů najednou a vše proběhlo bezchybně. Lektoři byli profesionální a děti nadšené.', 'Mgr. Petr Dvořák', 'Zástupce ředitele ZŠ Lužická', 'PD', 1),
  ('Konečně nemusíme řešit každou akci zvlášť. Jeden formulář, jeden kontakt, všechno vyřešené. Obrovská úspora času.', 'Bc. Markéta Svobodová', 'Učitelka MŠ Sluníčko', 'MS', 2);

-- Seed: Nastaveni
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('admin_email', 'info@beechampshub.cz'),
  ('notification_emails', 'info@beechampshub.cz'),
  ('stat1_value', '240+'),
  ('stat1_label', 'Realizovaných akcí'),
  ('stat2_value', '85'),
  ('stat2_label', 'Zapojených škol'),
  ('stat3_value', '98%'),
  ('stat3_label', 'Spokojených ředitelů');
