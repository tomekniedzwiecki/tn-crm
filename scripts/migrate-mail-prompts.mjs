// F3: maile (drip + followup) -> settings (single source). SEED + twarda BRAMKA FIDELITY.
//
// Co wynosimy:
//   spar-followups: SITUATION, EMAIL_SYSTEM, SEQUENCE_SYSTEM (system-prompty) + cele (JSON)
//   spar-drip:      SITUATION, SYSTEM (system-prompt)                          + cele (JSON)
//
// System-prompty: ekstrakcja BYTE-EXACT przez eval (rozwiązuje ${SITUATION}/${MODEL_BLOCK} i \\n),
//   potem zamiana SITUATION/MODEL_BLOCK na placeholdery {{SYTUACJA}}/{{MODEL_BLOCK}}.
//   Bramka: szablon.split(placeholder).join(wartość) === oryginał (eval). Jeśli nie → throw, NIE seeduje.
// Cele: transkrybowane RĘCZNIE, ale każdy literał MUSI wystąpić DOSŁOWNIE w źródle (source.includes) —
//   inaczej throw. To gwarantuje, że map[kind] === oryginalny goal (kompozycja w kodzie zostaje 1:1).
//
// Uruchom: node scripts/migrate-mail-prompts.mjs   (czyta ../.env → SUPABASE_SERVICE_KEY)

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envUrl = new URL('../.env', import.meta.url);
try { for (const line of readFileSync(envUrl, 'utf8').split('\n')) { const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ''); } } catch (e) { console.error('Brak .env:', e.message); }
const KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) { console.error('BRAK SUPABASE_SERVICE_KEY'); process.exit(1); }
const supabase = createClient('https://yxmavwkwnfuphjqbelws.supabase.co', KEY);

const APPLY = !process.argv.includes('--dry');

// ── helpers ekstrakcji backtick-stringów ──
function findClose(src, open) { let i = open + 1; while (i < src.length) { if (src[i] === '\\') { i += 2; continue; } if (src[i] === '`') return i; i++; } return -1; }
function rawSpan(src, decl) {
  const s = src.indexOf(decl);
  if (s === -1) throw new Error('brak: ' + decl);
  if (src.indexOf(decl, s + 1) !== -1) throw new Error('NIEUNIKALNE: ' + decl);
  const open = s + decl.length - 1, close = findClose(src, open);
  if (close === -1) throw new Error('niedomknięty: ' + decl);
  return src.slice(open + 1, close);
}

const fpath = new URL('../supabase/functions/spar-followups/index.ts', import.meta.url);
const dpath = new URL('../supabase/functions/spar-drip/index.ts', import.meta.url);
const fsrc = readFileSync(fpath, 'utf8');
const dsrc = readFileSync(dpath, 'utf8');

const seeds = [];          // [key, value]
function add(key, value) { seeds.push([key, value]); }

// ════════════════ FOLLOWUPS ════════════════
// SITUATION (bez interpolacji)
const F_SIT = eval('`' + rawSpan(fsrc, 'const SITUATION = `') + '`');
add('aplikacja_mail_sytuacja', F_SIT);

// EMAIL_SYSTEM / SEQUENCE_SYSTEM — eval z SITUATION w scope, potem placeholder {{SYTUACJA}}
function tmplWithSit(src, decl, sit) {
  const raw = rawSpan(src, decl);
  const SITUATION = sit; // eslint-disable-line no-unused-vars  (w scope eval)
  const resolved = eval('`' + raw + '`');
  if (!resolved.includes(sit)) throw new Error(decl + ': brak SITUATION w resolved');
  const tmpl = resolved.split(sit).join('{{SYTUACJA}}');
  if (tmpl.split('{{SYTUACJA}}').join(sit) !== resolved) throw new Error(decl + ': FIDELITY placeholder');
  return { tmpl, resolved };
}
const fEmail = tmplWithSit(fsrc, 'const EMAIL_SYSTEM = `', F_SIT);
const fSeq = tmplWithSit(fsrc, 'const SEQUENCE_SYSTEM = `', F_SIT);
add('aplikacja_mail_email_system', fEmail.tmpl);
add('aplikacja_mail_sequence_system', fSeq.tmpl);

// ── CELE followups (transkrypcja; każdy literał weryfikowany przez source.includes) ──
const F_CELE = {
  _wspolne: ' Nawiąż do tego, na czym KONKRETNIE skończyliście (z fragmentu rozmowy) i jednym zdaniem przypomnij, czym jest to narzędzie i jaką niesie obietnicę. Artefakty opisuj jako to, co SIĘ ZBUDUJE / co odblokuje, KIEDY dokończy rozmowę — NIGDY że już jest gotowe albo „czeka w panelu". Jeśli nazwa jest generyczna („Twoje narzędzie") — pisz o „Twoim pomyśle". Bez nacisku i „wróć proszę".',
  _dens: 'GĘSTO, NIE DŁUGO (2–3 krótkie akapity). KAŻDY mail MUSI nieść JEDEN konkret/nową myśl — NIE samo „czeka w panelu" jako jedyną treść — i kończyć się JEDNYM jasnym CTA. ',
  abandoned_chat: 'PIERWSZY, lekki sygnał (~3h po przerwaniu, jeszcze przed werdyktem). Krótko i ciepło: rozmowa jest zapisana, wraca dokładnie w to samo miejsce, dzieli ją kilka minut od dokończenia. JEDEN lekki, mocny haczyk: zaraz po dokończeniu sprawdzam na żywo TWÓJ rynek i konkurencję (realnie, w internecie). To wszystko za darmo.',
  abandoned_chat_2: 'DRUGI follow-up (~następnego dnia, wciąż cisza). INNY kąt niż pierwszy: konkretnie wylicz, CO ta osoba DOSTAJE ZA DARMO, kiedy dokończy rozmowę — wymień 2–3 artefakty po imieniu: sprawdzony NA ŻYWO rynek i konkurencja (realni gracze z cenami, luka do zajęcia), policzona opłacalność (czy miesięczny abonament się spina), działająca strona sprzedażowa narzędzia. To realna robota, którą normalnie się zleca i płaci. Ustaw to jako JEJ korzyść („to Ty na tym zyskujesz"), nie Twoją prośbę.',
  abandoned_chat_3: 'TRZECI i OSTATNI follow-up (~2 dni, cisza). Zagraj NAJMOCNIEJSZYM pojedynczym argumentem: KLIKALNY prototyp narzędzia — działająca apka (nie obrazek), w której kliknie i sprawdzi swój pomysł od środka — to się zbuduje, gdy dokończy rozmowę. Z godnością: projekt zapisany, drzwi otwarte, decyzja należy do niej. Wpleć JEDNO wciągające pytanie nawiązujące do jej pomysłu z rozmowy. Zero desperacji, zero wyrzutów — lekka, ostatnia wiadomość.',
  nurture_1: 'Seria #1 (~4 dni po werdykcie). Kąt: PROBLEM. Nawiąż do ich konkretnej sytuacji (z karty) i uderz JEDNĄ rzeczą, która otwiera oczy — np. ile ten problem realnie zżera czasu/pieniędzy (oszacuj zdroworozsądkowo, bez zmyślania twardych danych). CTA miękkie: zerknij na projekt w panelu.',
  nurture_2: 'Seria #2 (~7 dni). Kąt: PIENIĄDZE. Pokaż liczbę z planu po ludzku + JEDEN wniosek („to się może spinać, bo…"). ZERO żargonu. CTA: zobacz plan w panelu / „pogadajmy, jak to zbudować".',
  nurture_3: 'Seria #3 (~11 dni). Kąt: RYNEK/TERAZ. JEDNA myśl o luce + czemu moment jest dobry (z tezy badania). CTA: zobacz raport rynku w panelu.',
  nurture_4: 'Seria #4 (~15 dni). Kąt: JAK BUDUJEMY RAZEM. JEDNA myśl rozbrajająca ryzyko (Tomek bierze na siebie budowę i rozkręcenie sprzedaży, zarabia dopiero z wyniku), pierwszy krok = wspólna rozmowa (500 zł, w pełni zwrotne). CTA: zarezerwuj rozmowę.',
  nurture_5: 'Seria #5 (~19 dni). Kąt: ROZBROJENIE OBIEKCJI. Nazwij WPROST jeden najczęstszy opór osoby dopiero wchodzącej w biznes (np. „nie mam czasu tego ogarniać" ALBO „a co, jeśli nie wyjdzie" ALBO „brzmi skomplikowanie") i szczerze go rozpuść — bez defensywy, po ludzku: budowę i ryzyko techniczne biorę na siebie, zaczynamy mało, 500 zł jest zwrotne. JEDNA obiekcja, nie lista. CTA: zarezerwuj rozmowę.',
  nurture_6: 'Seria #6 OSTATNI, z godnością. „Zostawiam projekt otwarty, kiedy będziesz gotowy". Wpleć JEDNO wciągające pytanie nawiązujące do ich pomysłu. Delikatny link do rezerwacji. Zero desperacji, zero wyrzutów — ciepła klamra.',
  komplet_gotowy: 'Świeży zielony werdykt — projekt jest KOMPLETNY i CZEKA W PANELU za darmo: karta, ekrany, sprawdzony NA ŻYWO rynek+konkurencja, policzona opłacalność, plan gdzie szukać klientów. Cel TEGO maila: ŚCIĄGNĄĆ DO PANELU, żeby to zobaczył (NIE sprzedawaj jeszcze rezerwacji). Krótko, z energią „domknęliśmy to, wejdź zobacz". Wpleć JEDEN twardy konkret (liczba z planu albo teza z rynku). Link do panelu.',
  verdict_last_call: 'To OSTATNI follow-up tego wątku (≈tydzień po zielonym werdykcie, cisza). Inny kąt niż wcześniej: lekka „domykam miejsce" + konkret. Przypomnij, że projekt dostał zielony werdykt i czeka w panelu. Bez nacisku: jeśli to nie moment — OK, projekt zostaje zapisany; jeśli chce ruszyć, rezerwacja 500 zł w pełni zwrotna. Delikatnie wpleć link do rezerwacji.',
  paid_welcome: 'Osoba właśnie zarezerwowała wspólną rozmowę (zapłaciła 500 zł, w pełni zwrotne). Podziękuj ciepło i osobiście, potwierdź że bierzesz jej projekt na warsztat: przygotowujesz plan przedsięwzięcia (zakres v1, model przychodów, droga do 50 klientów, harmonogram) i odzywasz się osobiście w 2–3 dni robocze. Bez sprzedaży, krótko. Linku nie musisz dawać.',
};
for (const [k, v] of Object.entries(F_CELE)) {
  if (!fsrc.includes(v)) throw new Error('CEL followups „' + k + '" NIE występuje dosłownie w źródle — transkrypcja niezgodna!');
}
add('aplikacja_mail_cele', JSON.stringify(F_CELE, null, 2));

// ════════════════ DRIP ════════════════
const D_SIT = eval('`' + rawSpan(dsrc, 'const SITUATION = `') + '`');
add('aplikacja_drip_sytuacja', D_SIT);

// SYSTEM dripu — eval z SITUATION + MODEL_BLOCK(placeholder) w scope
{
  const raw = rawSpan(dsrc, 'const SYSTEM = `');
  const SITUATION = D_SIT; // eslint-disable-line no-unused-vars
  const MODEL_BLOCK = '{{MODEL_BLOCK}}'; // eslint-disable-line no-unused-vars
  const resolved = eval('`' + raw + '`'); // SITUATION baked, MODEL_BLOCK = placeholder, \\n→\n
  if (!resolved.includes(D_SIT)) throw new Error('drip SYSTEM: brak SITUATION');
  if (!resolved.includes('{{MODEL_BLOCK}}')) throw new Error('drip SYSTEM: brak placeholdera MODEL_BLOCK');
  const tmpl = resolved.split(D_SIT).join('{{SYTUACJA}}');
  // fidelity: odtworzenie szablonu = resolved (dla dowolnego model block sprawdzimy osobno przy odczycie)
  if (tmpl.split('{{SYTUACJA}}').join(D_SIT) !== resolved) throw new Error('drip SYSTEM: FIDELITY placeholder');
  add('aplikacja_drip_system', tmpl);
}

const D_CELE = {
  rynek: 'Ogłaszasz, że zrobiłeś realny research rynku (w internecie, nie „z głowy"). Pokaż, że patrzyłeś na JEGO niszę: nawiąż do konkretnego konkurenta i jego ceny albo do oceny potencjału z uzasadnieniem. Zachęć, żeby otworzył raport.',
  economics: 'Ogłaszasz, że policzyłeś, czy to się spina. Pokaż, że patrzyłeś na liczby JEGO modelu: nawiąż do konkretnej ceny/tieru, CAC, albo momentu zwrotu budowy. Wspomnij, że w panelu są suwaki, plus droga do 50 klientów.',
  landing: 'Ogłaszasz, że zbudowała się DZIAŁAJĄCA strona sprzedażowa jego narzędzia — prawdziwa strona w przeglądarce, nie grafika. Można ją otworzyć, przewinąć, pokazać znajomym z branży. Jeśli pasuje, nawiąż do tego, co strona ma sprzedawać (problem/dla kogo).',
  prototyp: 'To FINAŁ sekwencji i najmocniejszy element. Ogłaszasz KLIKALNY, działający prototyp jego narzędzia — nie obrazek, działająca apka. Jeśli znasz konkretną funkcję/ekran, zaproś, żeby właśnie to kliknął i sprawdził. Nawiąż delikatnie, że przeszliście już przez rynek, liczby, stronę i plan sprzedaży, a to zostawiłeś na koniec. To dobry moment, by delikatnie zaprosić do rezerwacji wspólnej rozmowy.',
  gtm: 'Ogłaszasz konkretny plan zdobycia pierwszych klientów. Pokaż, że jest konkretny: nawiąż do realnego kanału z planu albo do jednego z gotowych konceptów reklam.',
};
for (const [k, v] of Object.entries(D_CELE)) {
  if (!dsrc.includes(v)) throw new Error('CEL drip „' + k + '" NIE występuje dosłownie w źródle — transkrypcja niezgodna!');
}
add('aplikacja_drip_cele', JSON.stringify(D_CELE, null, 2));

// ── RAPORT ──
console.log('\n=== EKSTRAKCJA + FIDELITY OK ===');
for (const [k, v] of seeds) console.log('  ' + k.padEnd(34) + ' ' + v.length + ' zn.');

if (!APPLY) { console.log('\n(--dry: nie zapisuję)'); process.exit(0); }

// backup istniejących (gdyby były) + upsert
const keys = seeds.map(([k]) => k);
const { data: existing } = await supabase.from('settings').select('key, value').in('key', keys);
const stamp = '20260620';
for (const row of (existing || [])) {
  const bkey = row.key + '_backup_' + stamp;
  await supabase.from('settings').upsert([{ key: bkey, value: row.value }], { onConflict: 'key' });
  console.log('BACKUP', bkey);
}
for (const [key, value] of seeds) {
  const { error } = await supabase.from('settings').upsert([{ key, value }], { onConflict: 'key' });
  if (error) throw new Error('seed ' + key + ': ' + error.message);
  console.log('SEED ', key, '(' + value.length + ' zn.)');
}
console.log('\ndone');
