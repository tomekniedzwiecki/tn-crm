// Wspólny retry dla wywołań OpenAI w funkcjach sparingu (raport/landing/prototype/assess).
// Sprawdzona logika z spar-chat (openaiFetchRetry), z parametryzowanym URL.
//
// Zachowanie (świadomie zgodne z gołym fetch, żeby NIE wprowadzać nowych trybów awarii):
//  • 429/5xx → retry z backoffem; po wyczerpaniu prób ODDAJE złą Response
//    (caller obsłuży `!res.ok` jak dotąd — zwolni lock, zwróci 502).
//  • wyjątek sieciowy → retry; po wyczerpaniu rzuca (jak goły fetch).
//  • body NIEKONSUMOWANE — bezpieczne dla streamu (assess) i buforowanych.
//  • BEZ AbortController: twardy timeout-abort groziłby ucięciem długiego web_search/2-pass
//    i wyciekiem locka; platforma ma własny wall-clock. Retry to główny zysk odporności.
export async function openaiFetchRetry(
  url: string,
  init: RequestInit,
  label = 'openai',
  attempts = 3,
): Promise<Response> {
  let last = ''
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, init)
      if (res.ok) return res
      if ((res.status === 429 || res.status >= 500) && i < attempts - 1) {
        last = `HTTP ${res.status}`
        try { await res.body?.cancel() } catch { /* zwolnij połączenie */ }
        await new Promise((r) => setTimeout(r, 800 * (i + 1)))
        console.warn(`[openai-fetch:${label}] retry ${i + 1} po ${last}`)
        continue
      }
      return res // nieretryowalny albo ostatnia próba — caller obsłuży !res.ok
    } catch (err) {
      last = String(err)
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 800 * (i + 1)))
        console.warn(`[openai-fetch:${label}] retry ${i + 1} po wyjątku ${last}`)
        continue
      }
      throw err
    }
  }
  throw new Error(`openaiFetchRetry exhausted (${label})`)
}
