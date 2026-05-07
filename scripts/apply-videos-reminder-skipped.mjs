// Apply 20260507_etap5_videos_reminder_skipped.sql przez REST API
// (poniewaz `npx supabase db push` wybucha na duplikatach z innych migracji)
//
// Uruchom: node scripts/apply-videos-reminder-skipped.mjs

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://yxmavwkwnfuphjqbelws.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SERVICE_KEY) {
  console.error('Brak SUPABASE_SERVICE_KEY w .env');
  process.exit(1);
}

const supa = createClient(SUPABASE_URL, SERVICE_KEY);

const REMINDER_BODY = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#06b6d4;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">🎬 Przypomnienie</p><h1 style="margin:0 0 20px 0;color:#ffffff;font-size:26px;font-weight:600;line-height:1.3;">Cześć {{clientName}}!</h1><p style="margin:0 0 16px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Wracam z przypomnieniem — czekamy na Twoje nagrania video z produktem, żebyśmy mogli zamontować je na stronie sprzedażowej.</p><p style="margin:0 0 16px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Format jest banalny: krótkie 15-30 sekundowe Reels w pionie, telefonem. Nie musi być studyjnie — wręcz im bardziej naturalne, tym lepiej działa.</p><p style="margin:0 0 28px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Wskazówki, jak nagrać i gdzie je wgrać, masz w panelu projektu w sekcji „Video".</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr><td align="center"><a href="{{projectUrl}}" style="display:inline-block;background:linear-gradient(135deg,#06b6d4 0%,#0891b2 100%);color:#ffffff;text-decoration:none;padding:15px 32px;border-radius:8px;font-size:14px;font-weight:700;text-align:center;">Otwórz panel video →</a></td></tr></table><p style="margin:24px 0 0 0;padding:18px;background:#171717;border-radius:8px;color:#737373;font-size:13px;line-height:1.55;">Jeśli z jakiegoś powodu nie chcesz nagrywać video — daj znać. Możemy ten krok pominąć i ruszyć dalej z optymalizacją sklepu.</p></td></tr><tr><td style="padding:18px 40px;border-top:1px solid #262626;text-align:center;"><a href="https://tomekniedzwiecki.pl" style="color:#525252;font-size:12px;text-decoration:none;">tomekniedzwiecki.pl</a></td></tr></table></td></tr></table></body></html>`;

const SKIPPED_BODY = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#a3a3a3;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">⏭ Etap pominięty</p><h1 style="margin:0 0 20px 0;color:#ffffff;font-size:26px;font-weight:600;line-height:1.3;">Cześć {{clientName}}!</h1><p style="margin:0 0 16px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Pomijamy etap nagrań video — sklep idzie dalej bez sekcji Reels. To w pełni normalne, nie każdy chce się nagrywać i to nie blokuje sprzedaży.</p><p style="margin:0 0 28px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Skupiamy się teraz na pozostałych narzędziach Etapu 5 — optymalizacjach, opiniach, panelu marketingowym. Wszystko co robi sprzedaż w tle.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr><td align="center"><a href="{{projectUrl}}" style="display:inline-block;background:#262626;color:#ffffff;text-decoration:none;padding:15px 32px;border-radius:8px;font-size:14px;font-weight:700;text-align:center;border:1px solid #404040;">Otwórz panel projektu →</a></td></tr></table><p style="margin:24px 0 0 0;padding:18px;background:#171717;border-radius:8px;color:#737373;font-size:13px;line-height:1.55;">Jeśli zmienisz zdanie i będziesz chciał jednak nagrać Reels — daj znać. Możemy do tego wrócić w każdej chwili.</p></td></tr><tr><td style="padding:18px 40px;border-top:1px solid #262626;text-align:center;"><a href="https://tomekniedzwiecki.pl" style="color:#525252;font-size:12px;text-decoration:none;">tomekniedzwiecki.pl</a></td></tr></table></td></tr></table></body></html>`;

async function upsertSetting(key, value) {
  const { error } = await supa.from('settings').upsert({ key, value }, { onConflict: 'key' });
  if (error) throw new Error(`settings ${key}: ${error.message}`);
  console.log(`OK settings: ${key}`);
}

async function ensureFlow(triggerType, name, description, emailType) {
  const { data: existing } = await supa.from('automation_flows').select('id').eq('trigger_type', triggerType).maybeSingle();
  if (existing?.id) {
    console.log(`OK flow ${triggerType} juz istnieje (${existing.id})`);
    return existing.id;
  }
  const { data: ins, error } = await supa.from('automation_flows')
    .insert({ name, description, trigger_type: triggerType, trigger_filters: {}, is_active: true })
    .select('id').single();
  if (error) throw new Error(`flow ${triggerType}: ${error.message}`);
  const { error: stepErr } = await supa.from('automation_steps')
    .insert({ flow_id: ins.id, step_type: 'action', step_order: 0, config: { action_type: 'send_email', email_type: emailType } });
  if (stepErr) throw new Error(`step ${triggerType}: ${stepErr.message}`);
  console.log(`OK flow ${triggerType} utworzony (${ins.id})`);
  return ins.id;
}

(async () => {
  try {
    await upsertSetting('email_template_videos_reminder_subject', 'Przypomnienie: czekamy na Twoje nagrania video 🎬');
    await upsertSetting('email_template_videos_reminder_body', REMINDER_BODY);
    await upsertSetting('email_template_videos_skipped_subject', 'Etap nagrań video pominięty — idziemy dalej');
    await upsertSetting('email_template_videos_skipped_body', SKIPPED_BODY);

    await ensureFlow('videos_reminder', 'Etap 5/Krok 3 — Przypomnienie o video',
      'Email do klienta gdy admin chce przypomniec o nagraniach video', 'videos_reminder');
    await ensureFlow('videos_skipped', 'Etap 5/Krok 3 — Video pominiete',
      'Email do klienta gdy admin oznaczy etap video jako pominiety', 'videos_skipped');

    console.log('\nUWAGA: ALTER TABLE automation_flows constraint trigger_type — uruchom recznie w SQL editor:');
    console.log('https://supabase.com/dashboard/project/yxmavwkwnfuphjqbelws/sql');
    console.log('Tresc: supabase/migrations/20260507_etap5_videos_reminder_skipped.sql (linie 7-19)');
  } catch (e) {
    console.error('FAIL:', e.message);
    process.exit(1);
  }
})();
