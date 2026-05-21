// Apply 20260521_budget_not_funded_email.sql przez REST API
// (poniewaz `npx supabase db push` wybucha na duplikatach z innych migracji)
//
// Uruchom: node scripts/apply-budget-not-funded.mjs

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

const BODY = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#f59e0b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">⚠️ Brak doładowania</p><h1 style="margin:0 0 20px 0;color:#ffffff;font-size:26px;font-weight:600;line-height:1.3;">Cześć {{clientName}}!</h1><p style="margin:0 0 16px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Sprawdziłem konto reklamowe na Mecie i <strong style="color:#fbbf24;">budżet wciąż nie został doładowany</strong>. W panelu zaznaczyłeś, że doładowałeś — ale faktycznie środki nie dotarły na konto.</p><p style="margin:0 0 16px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Bez doładowania <strong style="color:#ffffff;">nie ruszymy z kampanią</strong>, więc proszę wróć do panelu projektu i dokończ płatność — instrukcja jest w sekcji „Budżet".</p><p style="margin:0 0 28px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Kwota to <strong style="color:#ffffff;">1000 zł</strong> jednorazowo, doładowane na konto reklamowe Meta. Po doładowaniu wróć do panelu projektu i w sekcji „Budżet" kliknij <strong style="color:#ffffff;">„Potwierdzam doładowanie"</strong> — wtedy ruszamy z kampanią.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr><td align="center"><a href="{{projectUrl}}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:#ffffff;text-decoration:none;padding:15px 32px;border-radius:8px;font-size:14px;font-weight:700;text-align:center;">Dokończ doładowanie →</a></td></tr></table><p style="margin:24px 0 0 0;padding:18px;background:#171717;border-radius:8px;color:#737373;font-size:13px;line-height:1.55;">Jeśli wystąpił problem z płatnością (np. karta odrzucona, limit dzienny) — daj znać, pomogę rozwiązać.</p></td></tr><tr><td style="padding:18px 40px;border-top:1px solid #262626;text-align:center;"><a href="https://tomekniedzwiecki.pl" style="color:#525252;font-size:12px;text-decoration:none;">tomekniedzwiecki.pl</a></td></tr></table></td></tr></table></body></html>`;

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
    await upsertSetting('email_template_budget_not_funded_subject', 'Konto reklamowe wciąż nie zostało doładowane');
    await upsertSetting('email_template_budget_not_funded_body', BODY);

    await ensureFlow('budget_not_funded', 'Etap 4/Budzet — Konto nie doladowane',
      'Email do klienta gdy admin oznaczy ze konto reklamowe nie zostalo faktycznie doladowane', 'budget_not_funded');

    console.log('\nUWAGA: ALTER TABLE automation_flows constraint trigger_type — uruchom recznie w SQL editor:');
    console.log('https://supabase.com/dashboard/project/yxmavwkwnfuphjqbelws/sql');
    console.log('Tresc: supabase/migrations/20260521_budget_not_funded_email.sql (linie 7-23)');
  } catch (e) {
    console.error('FAIL:', e.message);
    process.exit(1);
  }
})();
