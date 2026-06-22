// Wynosi 2 zahardkodowane SMS-y „powrotu z ekranu" (sms_badanie_back / sms_ekrany_back)
// z spar-followups do settings. Link dynamiczny ${smsLink(s.id)} → placeholder {{LINK}}.
// Bramka fidelity: tekst-przed-linkiem MUSI wystąpić dosłownie w źródle (source.includes).
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envUrl = new URL('../.env', import.meta.url);
for (const line of readFileSync(envUrl, 'utf8').split('\n')) { const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ''); }
const KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) { console.error('BRAK SUPABASE_SERVICE_KEY'); process.exit(1); }
const supabase = createClient('https://yxmavwkwnfuphjqbelws.supabase.co', KEY);

const fsrc = readFileSync(new URL('../supabase/functions/spar-followups/index.ts', import.meta.url), 'utf8');

// tekst-przed-linkiem (kończy się na ": ") — musi być dosłownie w źródle przed ${smsLink(s.id)}
const SMS = {
  aplikacja_sms_ekrany_back: 'Tu Tomek. Pierwsze ekrany Twojego narzedzia sa juz gotowe do obejrzenia - wracasz dokladnie tam, gdzie skonczylismy: ',
  aplikacja_sms_badanie_back: 'Tu Tomek. Sprawdzilem na zywo Twoj rynek i konkurencje - mam konkretne wnioski. Wracasz w to samo miejsce w rozmowie: ',
};
for (const [k, txt] of Object.entries(SMS)) {
  if (!fsrc.includes(txt + '${smsLink(s.id)}')) throw new Error('FIDELITY: tekst SMS „' + k + '" nie pasuje 1:1 do źródła!');
}

const seeds = Object.fromEntries(Object.entries(SMS).map(([k, txt]) => [k, txt + '{{LINK}}']));
for (const [k, v] of Object.entries(seeds)) console.log('SEED', k.padEnd(28), '(' + v.length + ' zn.)  „' + v + '"');

const { data: existing } = await supabase.from('settings').select('key, value').in('key', Object.keys(seeds));
for (const row of (existing || [])) { await supabase.from('settings').upsert([{ key: row.key + '_backup_20260620', value: row.value }], { onConflict: 'key' }); console.log('BACKUP', row.key); }
for (const [key, value] of Object.entries(seeds)) {
  const { error } = await supabase.from('settings').upsert([{ key, value }], { onConflict: 'key' });
  if (error) throw new Error('seed ' + key + ': ' + error.message);
}
console.log('\ndone');
