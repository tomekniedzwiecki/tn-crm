// Wspólna bramka właściciela dla endpointów lejka „Zbuduję" (AWE).
//
// Reguła (jedno źródło, używane przez bud-project / bud-plan / bud-raport /
// bud-economics / bud-gtm / bud-landing / bud-prototype):
//   Sesja PRZYPIĘTA DO KONTA (bud_sessions.auth_user_id != null) wymaga JWT
//   tego konta. Sam sessionId (link ?id= / /b/...) przestaje działać jak hasło.
//   Sesja ANONIMOWA (auth_user_id == null, np. darmowa pierwsza rozmowa bez
//   konta) nadal działa po sessionId — jak w bud-chat.
//
// Lustrzane odbicie kontroli, która już istnieje w bud-chat.

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

// Bramka ADMINA dla endpointów narzędziowych (biblioteka sklepów itp.):
// wymaga ważnego JWT konta będącego w team_members. true = jest adminem.
export async function isTeamMember(
  req: Request,
  supabase: SupabaseClient,
): Promise<boolean> {
  const authUser = await verifyAuthUser(req, supabase);
  if (!authUser) return false;
  const { data, error } = await supabase
    .from("team_members")
    .select("user_id")
    .eq("user_id", authUser.id)
    .maybeSingle();
  return !error && !!data;
}

// Bramka admin z DRUGĄ ścieżką serwerową (sekret) — pod cron/automaty/testy
// (wzorzec x-cron-secret jak w generate-image). true = wolno.
export async function adminGate(
  req: Request,
  supabase: SupabaseClient,
): Promise<boolean> {
  const sec = Deno.env.get("BUD_TOOLS_SECRET") || "";
  if (sec && req.headers.get("x-tools-secret") === sec) return true;
  return await isTeamMember(req, supabase);
}
