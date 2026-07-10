// Wspólna bramka właściciela dla endpointów sparingu/„Stworzę".
//
// Reguła (jedno źródło, używane przez spar-project / spar-plan / spar-raport /
// spar-economics / spar-gtm / spar-landing / spar-prototype):
//   Sesja PRZYPIĘTA DO KONTA (spar_sessions.auth_user_id != null) wymaga JWT
//   tego konta. Sam sessionId (link ?id= / /p/...) przestaje działać jak hasło.
//   Sesja ANONIMOWA (auth_user_id == null, np. darmowa pierwsza rozmowa bez
//   konta) nadal działa po sessionId — jak w spar-chat.
//
// Lustrzane odbicie kontroli, która już istnieje w spar-chat.

import type { createClient } from "jsr:@supabase/supabase-js@2";

type SupabaseClient = ReturnType<typeof createClient>;

// Konto z JWT w nagłówku Authorization (Supabase Auth) — null gdy brak/nieważny.
// Odrzuca klucze publiczne/serwisowe (to nie są tokeny użytkownika).
export async function verifyAuthUser(
  req: Request,
  supabase: SupabaseClient,
): Promise<{ id: string; email: string | null } | null> {
  const m = (req.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const token = m[1].trim();
  if (!token || token.startsWith("sb_publishable_") || token.startsWith("sb_secret_")) return null;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return null;
    return { id: data.user.id, email: data.user.email || null };
  } catch (_e) {
    return null;
  }
}

// true = DOSTĘP ZABRONIONY (wywołujący powinien zwrócić 403 'wymagane_logowanie').
// Sesja anonimowa (brak auth_user_id) → false (dostęp po sessionId dozwolony).
export function ownerDenied(
  sessionAuthUserId: string | null | undefined,
  authUser: { id: string } | null,
): boolean {
  const ownerId = sessionAuthUserId || null;
  return !!(ownerId && (!authUser || authUser.id !== ownerId));
}

// Zaufany wywołujący WEWNĘTRZNY (server-to-server): Bearer == SUPABASE_SERVICE_ROLE_KEY.
// Używane przez generatory sparingu, gdy woła je spar-drip (cron) kluczem serwisowym —
// wtedy bramka właściciela NIE ma zastosowania (to nie przeglądarka z linkiem ?id=,
// tylko backend z sekretem serwera, który i tak ma pełny dostęp do bazy).
//
// To NIE osłabia ochrony ?id=: klucz serwisowy nigdy nie trafia do przeglądarki
// (front używa anon/publishable). Bez tego zaufania drip NIE mógł generować
// artefaktów sesji przypiętych do konta (auth_user_id != null) → 403 → reveale
// wisiały wiecznie w 'generating' (root-cause zawieszonych generacji, 2026-07-10).
export function isTrustedInternalCall(req: Request): boolean {
  const m = (req.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i);
  if (!m) return false;
  const token = m[1].trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  return !!serviceKey && token === serviceKey;
}
