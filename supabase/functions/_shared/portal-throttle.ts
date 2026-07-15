// SEC-D FAIL #2 — throttling błędnych haseł portalu klienta.
// Współdzielone przez wfa-portal i wfa-test-chat (ten sam token+hasło projektu).
// Tabela public.wfa_auth_attempts (migracja 20260715d_wfa_auth_throttle.sql), dostęp service-role.
//
// Model: licznik błędów per-token w oknie WINDOW_MS. Po THRESHOLD błędach -> lockout z rosnącym
// backoffem (60s, 120s, 240s... cap 1h), licznik zerowany. Poprawne hasło -> pełny reset (delete).
// Wyścigi współbieżne są łagodne (throttle, nie transakcja bankowa): w najgorszym razie kilka prób
// więcej — akceptowalne. Gate CZYTA stan przed weryfikacją hasła, więc zablokowany atakujący nie
// dostaje nawet porównania hasła (i trafne zgadnięcie w czasie lockoutu również jest odrzucone).

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SB = any;

const WINDOW_MS = 15 * 60 * 1000; // okno zliczania błędów
const THRESHOLD = 8;              // po tylu błędach w oknie -> lockout
const BASE_LOCK_S = 60;           // pierwszy lockout: 60s
const MAX_LOCK_S = 60 * 60;       // cap: 1h

// Czy token jest teraz zablokowany. Wołać PRZED weryfikacją hasła.
export async function throttleGate(sb: SB, token: string): Promise<{ locked: boolean; retryAfter: number }> {
  try {
    const { data } = await sb.from("wfa_auth_attempts").select("locked_until").eq("token", token).maybeSingle();
    if (data?.locked_until) {
      const until = new Date(String(data.locked_until)).getTime();
      const now = Date.now();
      if (until > now) return { locked: true, retryAfter: Math.max(1, Math.ceil((until - now) / 1000)) };
    }
  } catch (_e) { /* fail-open: throttle nie może zablokować logowania przy błędzie bazy */ }
  return { locked: false, retryAfter: 0 };
}

// Zarejestruj BŁĘDNĄ próbę. Ustawia lockout gdy przekroczono próg.
export async function throttleFail(sb: SB, token: string): Promise<void> {
  try {
    const now = Date.now();
    const { data } = await sb.from("wfa_auth_attempts")
      .select("fail_count, lock_count, window_started_at").eq("token", token).maybeSingle();

    let failCount = 1;
    let lockCount = 0;
    let windowStart = new Date(now).toISOString();
    if (data) {
      lockCount = Number(data.lock_count || 0);
      const winStart = new Date(String(data.window_started_at)).getTime();
      if (now - winStart <= WINDOW_MS) {
        failCount = Number(data.fail_count || 0) + 1;
        windowStart = String(data.window_started_at);
      } // okno wygasło -> licznik od 1, nowe okno
    }

    const row: Record<string, unknown> = {
      token,
      fail_count: failCount,
      lock_count: lockCount,
      window_started_at: windowStart,
      updated_at: new Date(now).toISOString(),
    };
    if (failCount >= THRESHOLD) {
      lockCount += 1;
      const lockS = Math.min(BASE_LOCK_S * Math.pow(2, lockCount - 1), MAX_LOCK_S);
      row.locked_until = new Date(now + lockS * 1000).toISOString();
      row.fail_count = 0;                                   // po zablokowaniu zeruj licznik
      row.window_started_at = new Date(now).toISOString();  // nowe okno po lockoucie
      row.lock_count = lockCount;
    }
    await sb.from("wfa_auth_attempts").upsert(row, { onConflict: "token" });
  } catch (_e) { /* nie blokuj odpowiedzi portalu przy błędzie zapisu throttle */ }
}

// Poprawne hasło -> wyczyść stan (reset eskalacji lockoutu).
export async function throttleClear(sb: SB, token: string): Promise<void> {
  try {
    await sb.from("wfa_auth_attempts").delete().eq("token", token);
  } catch (_e) { /* no-op */ }
}
