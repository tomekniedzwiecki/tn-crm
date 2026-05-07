// Apply 20260507_etap5_narzedzia_tools.sql przez REST API
// (poniewaz `npx supabase db push` wybucha na duplikatach z innych migracji)
//
// Uruchom: node scripts/apply-tools-step.mjs

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

const TOOLS_STARTED_BODY = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#f59e0b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">🔧 Narzędzia analityczne</p><h1 style="margin:0 0 20px 0;color:#ffffff;font-size:26px;font-weight:600;line-height:1.3;">Cześć {{clientName}}!</h1><p style="margin:0 0 16px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">To ostatni krok Etapu 5. Twój sklep już zarabia, mamy opinie i Reels — teraz zobaczmy <strong style="color:#fbbf24;">co konkretnie robią klienci</strong> na Twojej stronie i gdzie możemy poprawić konwersję.</p><p style="margin:0 0 16px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Czekają na Ciebie 3 zadania:</p><ol style="margin:0 0 24px 0;padding-left:20px;color:#a3a3a3;font-size:15px;line-height:1.8;"><li><strong style="color:#ffffff;">Załóż Google Analytics i prześlij mi skrypt</strong> — wkleisz go w panelu, ja osadzę w sklepie</li><li><strong style="color:#ffffff;">Załóż Hotjar i prześlij mi skrypt</strong> — analogicznie, ja osadzę u Ciebie w sklepie</li><li><strong style="color:#ffffff;">Przeanalizuj 2-3 sesje</strong> w Hotjar (po 24-48h od osadzenia) i napisz mi co zauważyłeś</li></ol><p style="margin:0 0 28px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">W panelu projektu masz instrukcje krok po kroku, pola do wklejania skryptów i pole na uwagi po analizie sesji.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr><td align="center"><a href="{{projectUrl}}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);color:#000000;text-decoration:none;padding:15px 32px;border-radius:8px;font-size:14px;font-weight:700;text-align:center;">Otwórz panel narzędzi →</a></td></tr></table><p style="margin:24px 0 0 0;padding:18px;background:#171717;border-radius:8px;color:#737373;font-size:13px;line-height:1.55;">Masz problem z założeniem konta lub konfiguracją? Napisz na <a href="mailto:pomoc@takedrop.pl" style="color:#fbbf24;text-decoration:none;">pomoc@takedrop.pl</a> — wsparcie TakeDrop pomoże.</p></td></tr><tr><td style="padding:18px 40px;border-top:1px solid #262626;text-align:center;"><a href="https://tomekniedzwiecki.pl" style="color:#525252;font-size:12px;text-decoration:none;">tomekniedzwiecki.pl</a></td></tr></table></td></tr></table></body></html>`;

const TOOLS_SCRIPT_RECEIVED_BODY = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#f59e0b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">🔧 Skrypt do osadzenia</p><h1 style="margin:0 0 20px 0;color:#ffffff;font-size:24px;font-weight:600;line-height:1.3;">{{clientName}} przesłał skrypt {{toolName}}</h1><p style="margin:0 0 16px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Klient wkleił skrypt <strong style="color:#fbbf24;">{{toolName}}</strong> w panelu projektu. Otwórz workflow w admin, skopiuj skrypt i osadź go w sklepie TakeDrop klienta.</p><p style="margin:0 0 28px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Po osadzeniu kliknij „Osadzone" w panelu admina, żeby klient zobaczył status.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr><td align="center"><a href="{{adminUrl}}" style="display:inline-block;background:#262626;color:#ffffff;text-decoration:none;padding:15px 32px;border-radius:8px;font-size:14px;font-weight:700;text-align:center;border:1px solid #404040;">Otwórz workflow w admin →</a></td></tr></table></td></tr></table></td></tr></table></body></html>`;

const TOOLS_NOTES_RECEIVED_BODY = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#06b6d4;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">📝 Uwagi klienta</p><h1 style="margin:0 0 20px 0;color:#ffffff;font-size:24px;font-weight:600;line-height:1.3;">{{clientName}} przeanalizował sesje</h1><p style="margin:0 0 16px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Klient wpisał uwagi w kroku „Narzędzia" Etapu 5. Sprawdź co napisał i zatwierdź krok aby przejść do Serwisów.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr><td align="center"><a href="{{adminUrl}}" style="display:inline-block;background:#262626;color:#ffffff;text-decoration:none;padding:15px 32px;border-radius:8px;font-size:14px;font-weight:700;text-align:center;border:1px solid #404040;">Otwórz workflow w admin →</a></td></tr></table></td></tr></table></td></tr></table></body></html>`;

const TOOLS_COMPLETED_BODY = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#000000;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;padding:40px 20px;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:12px;border:1px solid #262626;"><tr><td style="padding:48px 40px 40px 40px;"><p style="margin:0 0 8px 0;color:#10b981;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">✓ Etap 5 ukończony</p><h1 style="margin:0 0 20px 0;color:#ffffff;font-size:26px;font-weight:600;line-height:1.3;">Brawo {{clientName}}!</h1><p style="margin:0 0 16px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Dziękuję za uwagi. Etap 5 — Optymalizacja sprzedaży — jest <strong style="color:#10b981;">zakończony</strong>.</p><p style="margin:0 0 28px 0;color:#a3a3a3;font-size:15px;line-height:1.65;">Teraz przechodzimy do <strong style="color:#ffffff;">Serwisów</strong> — pokażę Ci dodatkowe narzędzia i procesy które dalej będą rozwijać Twój sklep. W panelu zobaczysz nową zakładkę.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr><td align="center"><a href="{{projectUrl}}" style="display:inline-block;background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#ffffff;text-decoration:none;padding:15px 32px;border-radius:8px;font-size:14px;font-weight:700;text-align:center;">Otwórz panel projektu →</a></td></tr></table></td></tr><tr><td style="padding:18px 40px;border-top:1px solid #262626;text-align:center;"><a href="https://tomekniedzwiecki.pl" style="color:#525252;font-size:12px;text-decoration:none;">tomekniedzwiecki.pl</a></td></tr></table></td></tr></table></body></html>`;

async function upsertSetting(key, value) {
  const { error } = await supa.from('settings').upsert({ key, value }, { onConflict: 'key' });
  if (error) throw new Error(`settings ${key}: ${error.message}`);
  console.log(`OK settings: ${key}`);
}

async function ensureFlow(triggerType, name, description, emailType, toAdmin = false) {
  const { data: existing } = await supa.from('automation_flows').select('id').eq('trigger_type', triggerType).maybeSingle();
  if (existing?.id) {
    console.log(`OK flow ${triggerType} juz istnieje (${existing.id})`);
    return existing.id;
  }
  const { data: ins, error } = await supa.from('automation_flows')
    .insert({ name, description, trigger_type: triggerType, trigger_filters: {}, is_active: true })
    .select('id').single();
  if (error) throw new Error(`flow ${triggerType}: ${error.message}`);
  const config = { action_type: 'send_email', email_type: emailType };
  if (toAdmin) config.to_admin = true;
  const { error: stepErr } = await supa.from('automation_steps')
    .insert({ flow_id: ins.id, step_type: 'action', step_order: 0, config });
  if (stepErr) throw new Error(`step ${triggerType}: ${stepErr.message}`);
  console.log(`OK flow ${triggerType} utworzony (${ins.id})`);
  return ins.id;
}

(async () => {
  try {
    await upsertSetting('email_template_tools_started_subject', 'Ostatni krok Etapu 5 — narzędzia analityczne 🔧');
    await upsertSetting('email_template_tools_started_body', TOOLS_STARTED_BODY);

    await upsertSetting('email_template_tools_script_received_subject', '{{clientName}} przesłał skrypt {{toolName}} do osadzenia 🔧');
    await upsertSetting('email_template_tools_script_received_body', TOOLS_SCRIPT_RECEIVED_BODY);

    await upsertSetting('email_template_tools_notes_received_subject', '{{clientName}} wpisał uwagi po analizie sesji 📝');
    await upsertSetting('email_template_tools_notes_received_body', TOOLS_NOTES_RECEIVED_BODY);

    await upsertSetting('email_template_tools_completed_subject', 'Etap 5 zakończony — lecimy dalej 🚀');
    await upsertSetting('email_template_tools_completed_body', TOOLS_COMPLETED_BODY);

    await ensureFlow('tools_started', 'Etap 5/Krok 4 — Narzedzia aktywowane',
      'Email do klienta gdy admin odpala krok narzedzia (GA + Hotjar + analiza sesji)', 'tools_started', false);
    await ensureFlow('tools_script_received', 'Etap 5/Krok 4 — Skrypt narzedzia otrzymany',
      'Email do admina gdy klient wkleje skrypt GA lub Hotjar do osadzenia', 'tools_script_received', true);
    await ensureFlow('tools_notes_received', 'Etap 5/Krok 4 — Uwagi klienta otrzymane',
      'Email do admina gdy klient wpisze uwagi po analizie sesji', 'tools_notes_received', true);
    await ensureFlow('tools_completed', 'Etap 5/Krok 4 — Narzedzia zakonczone',
      'Email do klienta gdy admin zatwierdzi uwagi i Etap 5 jest ukonczony', 'tools_completed', false);

    console.log('\nUWAGA: ALTER TABLE (kolumny + constraint) — uruchom recznie w SQL editor:');
    console.log('https://supabase.com/dashboard/project/yxmavwkwnfuphjqbelws/sql');
    console.log('Tresc: supabase/migrations/20260507_etap5_narzedzia_tools.sql (linie 1-34)');
  } catch (e) {
    console.error('FAIL:', e.message);
    process.exit(1);
  }
})();
