// _shared/admin-files.ts — wspólna bramka administracyjna dla akcji „dane od klienta".
//
// Reguła (jedno źródło, używane przez wfa-portal `intake_admin` + wfa-test-chat `test_admin`):
//   Panel Tomka woła te akcje z SESYJNYM JWT członka zespołu (team_members) — NIE hasłem
//   klienta. Podgląd „oczami klienta" (publiczna rejestracja sparingu daje rolę
//   'authenticated' każdemu) NIE wystarcza — wymagamy wpisu w team_members.
//   Wzór: bud-project 'admin_get' / spar-owner isTeamMember. Klucze publiczne/serwisowe
//   nie są tokenami usera → odrzucane wcześnie.
//
// Helper zwraca też podpisane URL-e (domyślnie 1h) do plików prywatnych bucketów —
// zrzuty/pliki bywają wrażliwe (dane klientów operatora), więc NIGDY publiczne.

import type { createClient } from "jsr:@supabase/supabase-js@2";

type SupabaseClient = ReturnType<typeof createClient>;

// JWT CZŁONKA ZESPOŁU z nagłówka Authorization. Zwraca { id } albo null.
// Odrzuca klucze publiczne/serwisowe (to nie są tokeny użytkownika) — spójnie z gate'ami
// sparingu (spar-owner) i po wyłączeniu legacy keys (service = sb_secret_*).
export async function verifyTeamMember(
  req: Request,
  sb: SupabaseClient,
): Promise<{ id: string } | null> {
  const m = (req.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const tok = m[1].trim();
  if (!tok || tok.startsWith("sb_publishable_") || tok.startsWith("sb_secret_")) return null;
  try {
    const { data: u } = await sb.auth.getUser(tok);
    if (!u?.user) return null;
    const { data: tm } = await sb
      .from("team_members").select("user_id").eq("user_id", u.user.id).maybeSingle();
    return tm ? { id: u.user.id } : null;
  } catch (_e) {
    return null;
  }
}

// Podpisz ścieżki prywatnego bucketa (domyślnie 1h). Zwraca mapę path → signedUrl.
// Dedupe + odsiew pustych ścieżek (bezpieczne dla wszystkich wywołujących).
export async function signPaths(
  sb: SupabaseClient,
  bucket: string,
  paths: string[],
  expiresIn = 3600,
): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  const uniq = [...new Set((paths || []).filter(Boolean))];
  if (!uniq.length) return map;
  const { data } = await sb.storage.from(bucket).createSignedUrls(uniq, expiresIn);
  (data || []).forEach((s: any) => {
    if (s && s.path && s.signedUrl) map[s.path] = s.signedUrl;
  });
  return map;
}
