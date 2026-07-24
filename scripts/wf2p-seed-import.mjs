#!/usr/bin/env node
// wf2p-seed-import.mjs — jednorazowy import bazy TESTOWEJ sprzedawców Allegro do
// wf2p_sellers (status 'nowy', source 'allegro-scan'). Dane: 105 realnych loginów
// zebranych przez WebSearch (allegro.pl/uzytkownik/<login>), 10 kategorii
// brandowalnych. Idempotentne (WHERE NOT EXISTS po lower(login)). Bezpieczne
// ponowne uruchomienie. Token Management API jak w apply-wf2p.mjs.
//
// Uruchom: node scripts/wf2p-seed-import.mjs

import { execFileSync } from 'node:child_process';

const PROJECT_REF = 'yxmavwkwnfuphjqbelws';
const MGMT_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const die = (m) => { console.error(`[wf2p-seed] BŁĄD: ${m}`); process.exit(1); };
const log = (m) => console.log(`[wf2p-seed] ${m}`);

// [login, brand, vertical_key, note]
const S = [
  // ── świece sojowe ──
  ['BLUVELA','Bluvela','swiece-sojowe','świece sojowe personalizowane, woski zapachowe'],
  ['Rajsklep','Rajsklep','swiece-sojowe','świece sojowe, zapachowe, tealighty'],
  ['sowazory','Sowa Zory','swiece-sojowe','świece sojowe manufaktura'],
  ['AuraCandles_pl','Aura Candles','swiece-sojowe','świece zapachowe'],
  ['e-manufaktura','e-Manufaktura','swiece-sojowe','Super Sprzedawca, ~513 ofert; też rękodzieło'],
  ['LaRoseAtelier','La Rose Atelier','swiece-sojowe','atelier świec sojowych'],
  ['ManufakturaHokus','Manufaktura Hokus','swiece-sojowe','manufaktura świec'],
  ['Soolley','Soolley','swiece-sojowe','woski, świece sojowe, zestawy prezentowe'],
  ['zapachowydom','Zapachowy Dom','swiece-sojowe','świece zapachowe'],
  ['ravina_pl','Ravina','swiece-sojowe','woski zapachowe'],
  ['e-kalia','e-Kalia','swiece-sojowe','świece'],
  ['kastom-sklep','Kastom','swiece-sojowe','świece i zapachy do domu'],
  ['aliked','Aliked','swiece-sojowe','świece i zapachy do domu'],
  ['swiecoholik','Świecoholik','swiece-sojowe','sprzedawca świec (nazwa własna)'],
  // ── kosmetyki naturalne ──
  ['naturaorganikapl','Natura Organika','kosmetyki-naturalne','kosmetyki naturalne, mydła'],
  ['kosmetyki_ck','Kosmetyki CK','kosmetyki-naturalne','kosmetyki naturalne/handmade'],
  ['naturalne-wyroby','Naturalne Wyroby','kosmetyki-naturalne','mydła i wyroby naturalne handmade'],
  ['pracownia-mdk','Pracownia MDK','kosmetyki-naturalne','pracownia mydła/kosmetyki'],
  ['powrot-do-natury','Powrót do Natury','kosmetyki-naturalne','mydlarnia/kosmetyki wegańskie'],
  ['Manufaktura_ambs','Manufaktura AMBS','kosmetyki-naturalne','perfumy i wody, manufaktura'],
  ['Moje-Kosmetyki','Moje Kosmetyki','kosmetyki-naturalne','kosmetyki naturalne'],
  ['Mayram-Mydlarnia','Mayram Mydlarnia','kosmetyki-naturalne','mydlarnia handmade'],
  // ── biżuteria handmade ──
  ['SrebroWojcik','Srebro Wójcik','bizuteria-handmade','biżuteria srebrna handmade, kamienie'],
  ['galeria_srebra','Galeria Srebra','bizuteria-handmade','biżuteria srebrna, ~2400 ofert'],
  ['pracownia-pl','Pracownia','bizuteria-handmade','pracownia; też rękodzieło/ceramika'],
  ['srebroiskora_pl','Srebro i Skóra','bizuteria-handmade','biżuteria srebro + skóra'],
  ['SREBRO-2008','Srebro 2008','bizuteria-handmade','biżuteria i zegarki srebro'],
  ['simarek','Simarek','bizuteria-handmade','bransoletki, biżuteria damska'],
  ['srebro-faworyt','Srebro Faworyt','bizuteria-handmade','rękodzieło + biżuteria srebrna'],
  ['Apoli-Srebro','Apoli Srebro','bizuteria-handmade','biżuteria srebro, antyki'],
  ['Manufaktura_DK','Manufaktura DK','bizuteria-handmade','półprodukty biżuteryjne, decoupage'],
  ['-tuareg-','Tuareg','bizuteria-handmade','rękodzieło, biżuteria, szycie'],
  ['Art-Equipment','Art Equipment','bizuteria-handmade','rękodzieło'],
  ['artysta-sklep','Artysta Sklep','bizuteria-handmade','rękodzieło; też ceramika'],
  ['Udekoruj','Udekoruj','bizuteria-handmade','Super Sprzedawca, rękodzieło/dekoracje'],
  ['srebrne','Srebrne','bizuteria-handmade','kolczyki srebrne'],
  // ── zabawki drewniane ──
  ['ManufakturaDRW','Manufaktura DRW','zabawki-drewniane','manufaktura zabawek drewnianych'],
  ['zabawki-z-drewna','Zabawki z Drewna','zabawki-drewniane','zabawki drewniane, klocki, sortery'],
  ['oak-toys_pl','Oak Toys','zabawki-drewniane','klocki drewniane'],
  ['Fabryka-Zabawek_','Fabryka Zabawek','zabawki-drewniane','zabawki drewniane manufaktura'],
  ['kmnova','KM Nova','zabawki-drewniane','drewniane zabawki Montessori/bujak'],
  ['KLOCKInaSZTUKI','Klocki na Sztuki','zabawki-drewniane','klocki'],
  ['okiemmaluszka_pl','Okiem Maluszka','zabawki-drewniane','zabawki edukacyjne'],
  ['EduDziecko','Edu Dziecko','zabawki-drewniane','klocki/zabawki edukacyjne'],
  ['ZabawkiDzieciom','Zabawki Dzieciom','zabawki-drewniane','zabawki dla dzieci'],
  // ── dekoracje boho ──
  ['dekoracje-online','Dekoracje Online','dekoracje-boho','dekoracje wnętrz, boho/makrama'],
  ['MakramowaPasja','Makramowa Pasja','dekoracje-boho','makramy'],
  ['sweetey','Sweetey','dekoracje-boho','makramy boho'],
  ['obrazy-dekoracje','Obrazy Dekoracje','dekoracje-boho','obrazy/dekoracje ścienne'],
  ['makramomaniak','Makramomaniak','dekoracje-boho','makramy boho (nazwa własna)'],
  ['ARQDECOR','ARQ Decor','dekoracje-boho','dekoracje wnętrz'],
  ['PracowniaBrodacz','Pracownia Brodacz','dekoracje-boho','makramy, dekoracje, kubki ceramiczne'],
  ['dekoratornia-','Dekoratornia','dekoracje-boho','dekoracje boho/makrama'],
  ['GaleriaPlakatu','Galeria Plakatu','dekoracje-boho','plakaty skandynawskie/boho'],
  ['postershop','Postershop','dekoracje-boho','plakaty ścienne skandi/boho'],
  ['GRA_FICZNIE','Graficznie','dekoracje-boho','plakaty i obrazki boho/skandi'],
  // ── akcesoria dla zwierząt ──
  ['ukory','Ukory','akcesoria-zwierzeta','obroże, szelki, smycze, legowiska'],
  ['sali_pl','Sali','akcesoria-zwierzeta','szelki, obroże trekkingowe dla psów'],
  ['Allezoo','Allezoo','akcesoria-zwierzeta','artykuły dla psów (reseller zoo)'],
  ['lalazoo-sklep-pl','Lalazoo','akcesoria-zwierzeta','szelki dla psów'],
  ['ZOO_Trend','ZOO Trend','akcesoria-zwierzeta','szelki dla psów'],
  ['InspiracjeDomowe','Inspiracje Domowe','akcesoria-zwierzeta','szelki dla psów; też dom/dekor'],
  ['kot-i-pies','Kot i Pies','akcesoria-zwierzeta','obroże personalizowane pies/kot'],
  ['kot-pies','Kot Pies','akcesoria-zwierzeta','akcesoria pies/kot'],
  ['robirobi_pl','Robi Robi','akcesoria-zwierzeta','legowiska i budki dla kotów'],
  ['legowiskapl','Legowiska.pl','akcesoria-zwierzeta','legowiska dla psów'],
  ['ekupisko','Ekupisko','akcesoria-zwierzeta','legowisko dla kota handmade/wełna'],
  // ── eko / zero waste ──
  ['ekuku-naturalnie','Ekuku Naturalnie','eko-zero-waste','eko/zero waste, szampon w kostce'],
  ['eko-natural','Eko Natural','eko-zero-waste','produkty eko/zero waste'],
  ['KierunekEko','Kierunek Eko','eko-zero-waste','asortyment eko/zero waste'],
  ['Zero_Sklep','Zero Sklep','eko-zero-waste','sklep zero waste (nazwa własna)'],
  ['biogo_pl','Biogo','eko-zero-waste','eko, kosmetyki naturalne, superfood, mydła'],
  ['eko-allegro','Eko Allegro','eko-zero-waste','produkty ekologiczne'],
  ['Milvo-eko','Milvo Eko','eko-zero-waste','produkty eko'],
  ['Eko-ogrody','Eko Ogrody','eko-zero-waste','eko produkty ogrodowe'],
  ['Eko-Herba','Eko Herba','eko-zero-waste','eko/zioła'],
  ['eco-natura','Eco Natura','eko-zero-waste','nasiona/warzywa eko'],
  ['eko-go','Eko Go','eko-zero-waste','produkty ekologiczne'],
  // ── ceramika / rękodzieło ──
  ['ceramika-sklep','Ceramika Sklep','ceramika-rekodzielo','ceramika użytkowa/wyposażenie'],
  ['Birko_Ceramika','Birko Ceramika','ceramika-rekodzielo','ceramika rękodzieło (kubki)'],
  ['SklepSosenka','Sklep Sosenka','ceramika-rekodzielo','decoupage / przedmioty do ozdabiania'],
  ['zywiecb','Zywiecb','ceramika-rekodzielo','decoupage / przedmioty do ozdabiania'],
  ['Kristall-Keramik','Kristall Keramik','ceramika-rekodzielo','ceramika artystyczna, ~1400 ofert'],
  ['CERAMIK-STUDIO','Ceramik Studio','ceramika-rekodzielo','studio ceramiczne'],
  ['CERAMIK_OFFICIAL','Ceramik','ceramika-rekodzielo','sprzedawca ceramiki'],
  // ── papeteria / prezenty personalizowane ──
  ['tradum_pl','Tradum','papeteria-prezenty','kartki okolicznościowe'],
  ['SmallBow','Small Bow','papeteria-prezenty','kartki/zaproszenia/podziękowania'],
  ['Czachorowski_pl','Czachorowski','papeteria-prezenty','kartki okolicznościowe'],
  ['PaperConcept','PaperConcept','papeteria-prezenty','papeteria ślubna'],
  ['dla_ciebie_pl','Dla Ciebie','papeteria-prezenty','papeteria ślubna'],
  ['Ale_Grawer','Ale Grawer','papeteria-prezenty','prezenty personalizowane z grawerem'],
  ['drewniany-sklep','Drewniany Sklep','papeteria-prezenty','personalizowane prezenty z drewna'],
  ['GiftGrawer','Gift Grawer','papeteria-prezenty','prezenty personalizowane z grawerem'],
  ['Gramurek_Grawer','Gramurek Grawer','papeteria-prezenty','prezenty personalizowane/grawer'],
  ['m-grawer','M Grawer','papeteria-prezenty','grawer/prezenty personalizowane'],
  // ── moda niszowa ──
  ['-ModaiStyl-','Moda i Styl','moda-niszowa','odzież damska (reseller)'],
  ['Shoppingo','Shoppingo','moda-niszowa','odzież damska (reseller)'],
  ['-MarkoweUbrania-','Markowe Ubrania','moda-niszowa','odzież markowa (reseller)'],
  ['TrendyOutlet_pl','Trendy Outlet','moda-niszowa','odzież damska/sukienki (outlet reseller)'],
  ['ubieramy_damy','Ubieramy Damy','moda-niszowa','sukienki, odzież damska'],
  ['Vestida','Vestida','moda-niszowa','sukienki (marka własna damska)'],
  ['Estila','Estila','moda-niszowa','sukienki (marka damska)'],
  ['womanonline','Woman Online','moda-niszowa','sukienki, odzież damska'],
  ['LAV-MAG','Lav-Mag','moda-niszowa','sukienki, odzież damska'],
  ['superstore','Superstore','moda-niszowa','sukienki (reseller marek)'],
];

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const rows = S.map(([login, brand, vk, note]) =>
  `(${q(login)}, ${q('https://allegro.pl/uzytkownik/' + login)}, ${q(brand)}, ${q(vk)}, ${q(note)})`
).join(',\n    ');

const IMPORT_SQL = `
INSERT INTO public.wf2p_sellers (allegro_login, allegro_url, brand_name, product_category, source, source_detail, vertical_id, status)
SELECT v.login, v.url, v.brand, v.vk, 'allegro-scan', v.note,
       (SELECT id FROM public.wf2p_verticals ver WHERE ver.key = v.vk),
       'nowy'
FROM (VALUES
    ${rows}
) AS v(login, url, brand, vk, note)
WHERE NOT EXISTS (
  SELECT 1 FROM public.wf2p_sellers s WHERE lower(s.allegro_login) = lower(v.login)
);
`;

// ── token Management API (Credential Manager) ───────────────────────────────
function readTokenFromCredMan() {
  const ps = `
$ErrorActionPreference = 'Stop'
$sig = @"
using System;
using System.Runtime.InteropServices;
public class Cred {
  [DllImport("advapi32.dll", CharSet=CharSet.Unicode, SetLastError=true)]
  public static extern bool CredRead(string target, int type, int flags, out IntPtr credential);
  [DllImport("advapi32.dll")]
  public static extern void CredFree(IntPtr cred);
}
"@
Add-Type -TypeDefinition $sig
$ptr = [IntPtr]::Zero
if (-not [Cred]::CredRead("Supabase CLI:supabase", 1, 0, [ref]$ptr)) { throw "CredRead failed" }
$size = [Runtime.InteropServices.Marshal]::ReadInt32($ptr, 32)
$blobPtr = [Runtime.InteropServices.Marshal]::ReadIntPtr($ptr, 40)
$bytes = New-Object byte[] $size
[Runtime.InteropServices.Marshal]::Copy($blobPtr, $bytes, 0, $size)
[Cred]::CredFree($ptr)
[Console]::Out.Write([Text.Encoding]::UTF8.GetString($bytes))
`;
  const enc = Buffer.from(ps, 'utf16le').toString('base64');
  return execFileSync('powershell.exe',
    ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', enc],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

const argTok = (() => { const i = process.argv.indexOf('--token'); return i > -1 ? process.argv[i + 1] : null; })();
const TOKEN = argTok || process.env.SUPABASE_MGMT_TOKEN || (() => { try { return readTokenFromCredMan(); } catch { return null; } })();
if (!TOKEN || !TOKEN.startsWith('sbp_')) die('brak tokena Management API (sbp_*).');

async function sql(query) {
  const r = await fetch(MGMT_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const text = await r.text();
  if (r.status >= 300) die(`Management API ${r.status}: ${text.slice(0, 600)}`);
  try { return text.trim() ? JSON.parse(text) : []; } catch { die(`odpowiedź nie-JSON: ${text.slice(0, 300)}`); }
}

(async () => {
  log(`Importuję ${S.length} sprzedawców (idempotentnie)…`);
  await sql(IMPORT_SQL);
  const cnt = await sql(`SELECT count(*) c FROM public.wf2p_sellers`);
  const perVert = await sql(
    `SELECT ver.key, count(s.*) c FROM public.wf2p_verticals ver
       LEFT JOIN public.wf2p_sellers s ON s.vertical_id = ver.id
      GROUP BY ver.key ORDER BY c DESC`);
  const orphan = await sql(`SELECT count(*) c FROM public.wf2p_sellers WHERE vertical_id IS NULL`);
  console.log('\n=== WERYFIKACJA ===');
  console.log('łącznie sprzedawców:', JSON.stringify(cnt[0]));
  console.log('per wertykal:', JSON.stringify(perVert));
  console.log('bez wertykalu (orphan):', JSON.stringify(orphan[0]));
  log('gotowe.');
})();
