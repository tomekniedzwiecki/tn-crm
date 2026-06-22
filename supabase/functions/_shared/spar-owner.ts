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
