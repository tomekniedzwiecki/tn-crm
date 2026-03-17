# Procedura dodawania nowego kroku workflow

Ten dokument zawiera kompletna liste miejsc do modyfikacji przy dodawaniu nowego kroku do workflow (np. nowy krok w Etapie 3).

## 1. BAZA DANYCH

### Migracja SQL
- [ ] Utworz plik `supabase/migrations/YYYYMMDD_nazwa_kroku.sql`
- [ ] Dodaj kolumny do odpowiedniej tabeli (np. `workflow_takedrop` dla Etapu 3):
  ```sql
  ALTER TABLE workflow_takedrop
  ADD COLUMN IF NOT EXISTS nowy_krok_ready BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS nowy_krok_data JSONB,
  ADD COLUMN IF NOT EXISTS nowy_krok_configured_at TIMESTAMPTZ;
  ```
- [ ] Uruchom migracje lub wykonaj SQL w Supabase Dashboard

---

## 2. PANEL ADMINA (`tn-workflow/workflow.html`)

### 2.1 Nawigacja sidebar (desktop)
- [ ] Dodaj button w odpowiedniej sekcji etapu (~linie 390-420):
  ```html
  <button onclick="switchTab('nowy-krok')" data-tab="nowy-krok" class="nav-btn ...">
      <i class="ph ph-icon-name"></i>
      <span>Nowy Krok</span>
      <span id="nav-check-nowy-krok" class="ml-auto hidden">
          <i class="ph-fill ph-check-circle text-emerald-400 text-sm"></i>
      </span>
  </button>
  ```

### 2.2 Tab panel HTML
- [ ] Dodaj HTML zawartosci zakladki (szukaj innych `tab-panel` jako wzor):
  ```html
  <div id="tab-nowy-krok" class="tab-panel hidden animate-enter">
      <!-- Zawartosc -->
  </div>
  ```

### 2.3 JavaScript - tablice i switch
- [ ] Dodaj do tablicy zakładek etapu (np. `stage3Tabs`):
  ```javascript
  const stage3Tabs = ['takedrop', 'landing', 'legal', 'nowy-krok'];
  ```

- [ ] Dodaj case w `switchTab()`:
  ```javascript
  case 'nowy-krok':
      loadNowyKrok();
      break;
  ```

### 2.4 JavaScript - updateNavChecks()
- [ ] Dodaj pole do query:
  ```javascript
  .select('..., nowy_krok_ready')
  ```
- [ ] Dodaj ustawienie checkboxa:
  ```javascript
  toggle('nav-check-nowy-krok', !!data?.nowy_krok_ready);
  ```

### 2.5 JavaScript - funkcje
- [ ] Utworz funkcje `loadNowyKrok()` do ladowania danych
- [ ] Utworz funkcje save/toggle do zapisywania zmian
- [ ] Pamietaj o ustawianiu checkboxa po zapisie:
  ```javascript
  document.getElementById('nav-check-nowy-krok')?.classList.remove('hidden');
  ```

---

## 3. PORTAL KLIENTA (`client-projekt.html`)

### 3.1 Dashboard sidebar (desktop + mobile)
- [ ] Desktop (~linie 1480):
  ```html
  <div id="dash-nav-nowy-krok" class="dash-nav-item hidden" onclick="switchToDashTab('nowy-krok')">
      <i class="ph ph-icon-name text-lg"></i>
      <span>Nowy Krok</span>
      <i id="dash-nav-check-nowy-krok" class="ph-fill ph-check-circle text-emerald-400 ml-auto hidden"></i>
  </div>
  ```
- [ ] Mobile (~linie 1576):
  ```html
  <div id="dash-nav-nowy-krok-mobile" class="dash-nav-item hidden" onclick="switchToDashTab('nowy-krok');toggleDashMobileMenu()">
      <i class="ph ph-icon-name text-lg"></i>
      <span>Nowy Krok</span>
      <i id="dash-nav-check-nowy-krok-mobile" class="ph-fill ph-check-circle text-emerald-400 ml-auto hidden"></i>
  </div>
  ```

### 3.2 Projekt sidebar (desktop + mobile)
- [ ] Desktop (~linie 1938):
  ```html
  <div id="nav-nowy-krok" class="dash-nav-item hidden" data-tab="nowy-krok" onclick="switchTab('nowy-krok')">
      <i class="ph ph-icon-name text-lg"></i>
      <span>Nowy Krok</span>
      <i id="nav-check-nowy-krok" class="ph-fill ph-check-circle text-emerald-400 ml-auto hidden"></i>
  </div>
  ```
- [ ] Mobile (~linie 2039):
  ```html
  <div id="nav-nowy-krok-mobile" class="dash-nav-item hidden" data-tab="nowy-krok" onclick="switchTab('nowy-krok');toggleMobileMenu()">
      <i class="ph ph-icon-name text-lg"></i>
      <span>Nowy Krok</span>
      <i id="nav-check-nowy-krok-mobile" class="ph-fill ph-check-circle text-emerald-400 ml-auto hidden"></i>
  </div>
  ```

### 3.3 Dashboard bento box
- [ ] Dodaj box w HTML (~linie 1811):
  ```html
  <div id="dash-etap3-box-nowy-krok" class="bento-box p-0 overflow-hidden cursor-pointer transition-all"
       style="grid-column: span 6; min-height: 180px;" onclick="switchToDashTab('nowy-krok')">
      <div id="dash-etap3-nowy-krok-content" class="h-full"></div>
  </div>
  ```

### 3.4 Tab panel HTML
- [ ] Dodaj zakladke:
  ```html
  <div id="tab-nowy-krok" class="tab-panel hidden animate-enter">
      <!-- Zawartosc -->
  </div>
  ```

### 3.5 JavaScript - renderEtap3Dashboard()
- [ ] Dodaj do obliczania postepu:
  ```javascript
  const nowyKrokDone = takeDropData?.nowy_krok_ready;
  const completedSteps = [accountDone, landingDone, dokumentyDone, bramkaDone, nowyKrokDone].filter(Boolean).length;
  const progressPercent = Math.round((completedSteps / 5) * 100); // Zmien liczbe!
  ```

### 3.6 JavaScript - renderEtap3NowyKrokBox()
- [ ] Utworz funkcje renderujaca bento box
- [ ] Jesli krok ma byc ukryty do spelnienia warunku, dodaj logike `hidden`

### 3.7 JavaScript - updateDashSidebar()
- [ ] Dodaj checkboxy (4 elementy):
  ```javascript
  const hasNowyKrok = takeDropData?.nowy_krok_ready;
  document.getElementById('dash-nav-check-nowy-krok')?.classList.toggle('hidden', !hasNowyKrok);
  document.getElementById('dash-nav-check-nowy-krok-mobile')?.classList.toggle('hidden', !hasNowyKrok);
  document.getElementById('nav-check-nowy-krok')?.classList.toggle('hidden', !hasNowyKrok);
  document.getElementById('nav-check-nowy-krok-mobile')?.classList.toggle('hidden', !hasNowyKrok);
  ```
- [ ] Jesli warunkowa widocznosc (4 elementy):
  ```javascript
  const showNowyKrok = /* warunek */;
  document.getElementById('dash-nav-nowy-krok')?.classList.toggle('hidden', !showNowyKrok);
  document.getElementById('dash-nav-nowy-krok-mobile')?.classList.toggle('hidden', !showNowyKrok);
  document.getElementById('nav-nowy-krok')?.classList.toggle('hidden', !showNowyKrok);
  document.getElementById('nav-nowy-krok-mobile')?.classList.toggle('hidden', !showNowyKrok);
  ```

### 3.8 JavaScript - switchTab() / switchToDashTab()
- [ ] Dodaj case:
  ```javascript
  case 'nowy-krok':
      loadNowyKrokTab();
      break;
  ```

### 3.9 JavaScript - funkcje
- [ ] Utworz `loadNowyKrokTab()`
- [ ] Utworz funkcje save/confirm

### 3.10 APP_VERSION
- [ ] **KRYTYCZNE:** Zwieksz `APP_VERSION` na gorze pliku!
  ```javascript
  const APP_VERSION = 'RRRRMMDDNN';  // np. 2026031305
  ```

---

## 4. LISTA WORKFLOWS (`tn-workflow/workflows.html`)

### 4.1 Filtr button
- [ ] Dodaj przycisk filtru w headerze (~linie 263):
  ```html
  <button onclick="filterByStage('nowy_krok')" data-filter="nowy_krok" class="filter-btn ...">
      <i class="ph ph-icon-name"></i>
      <span class="hidden sm:inline">Nowy Krok</span>
      <span id="count-nowy_krok" class="...">0</span>
  </button>
  ```

### 4.2 applyFilters()
- [ ] Dodaj logike filtrowania:
  ```javascript
  if (stage === 'nowy_krok') {
      return w.takedrop_stage?.poprzedni_krok_ready && !w.takedrop_stage?.nowy_krok_ready;
  }
  ```

### 4.3 counts object
- [ ] Dodaj inicjalizacje licznika:
  ```javascript
  const counts = {
      // ... istniejace
      nowy_krok: 0
  };
  ```

### 4.4 updateStageCounts()
- [ ] Dodaj zliczanie:
  ```javascript
  if (w.takedrop_stage?.poprzedni_krok_ready && !w.takedrop_stage?.nowy_krok_ready) {
      counts.nowy_krok++;
  }
  ```

### 4.5 getNextStep()
- [ ] Dodaj w odpowiedniej kolejnosci:
  ```javascript
  if (ts?.poprzedni_krok_ready && !ts?.nowy_krok_ready) return { stage: 'nowy_krok', label: 'Nowy Krok', icon: 'ph-icon-name' };
  ```

### 4.6 getStatusChecklist()
- [ ] Dodaj element checklisty:
  ```javascript
  { done: !!ts?.nowy_krok_ready, label: 'Nowy Krok' }
  ```

### 4.7 renderCurrentWork()
- [ ] Dodaj case dla wyswietlania:
  ```javascript
  case 'nowy_krok':
      // HTML statusu
      break;
  ```

### 4.8 Query select
- [ ] Dodaj pola do zapytania:
  ```javascript
  takedrop_stage:workflow_takedrop!workflow_id(..., nowy_krok_ready, nowy_krok_data)
  ```

---

## 5. OPCJONALNIE - AUTOMATYZACJE

### shared-email-types.js
- [ ] Dodaj do `EMAIL_TEMPLATE_CATEGORIES`:
  ```javascript
  takedrop: {
      // ...
      templates: ['takedrop_activated', 'landing_page_connected', 'nowy_krok_completed']
  }
  ```
- [ ] Dodaj do `EMAIL_TEMPLATE_DEFINITIONS`:
  ```javascript
  'nowy_krok_completed': {
      name: 'Nowy Krok ukonczony',
      description: 'Wysylany gdy nowy krok zostanie ukonczony',
      icon: 'ph-icon-name',
      color: 'sky'
  }
  ```
- [ ] Dodaj do `AUTOMATION_TRIGGERS`

### automation-trigger (edge function)
- [ ] Wywolaj trigger w odpowiednim miejscu kodu:
  ```javascript
  await supabaseClient.functions.invoke('automation-trigger', {
      body: {
          trigger_type: 'nowy_krok_completed',
          entity_type: 'workflow',
          entity_id: workflow.id,
          context: { /* dane */ }
      }
  });
  ```

### CLAUDE.md
- [ ] Zaktualizuj liste dostepnych triggerow

---

## 6. DEPLOY I TESTY

- [ ] Uruchom migracje SQL
- [ ] Przetestuj w panelu admina
- [ ] Przetestuj w portalu klienta (dashboard + projekt)
- [ ] Przetestuj filtry na liscie workflows
- [ ] Sprawdz czy checkboxy pojawiaja sie po ukonczeniu kroku
- [ ] Sprawdz czy checkboxy sa widoczne po odswiezeniu strony
- [ ] Jesli edge functions - `npm run deploy:functions`
- [ ] Jesli edge functions - `npm run test:webhooks`

---

## Podsumowanie

| Plik | Ilosc miejsc |
|------|--------------|
| Migracja SQL | 1 |
| workflow.html (admin) | ~8 |
| client-projekt.html | ~13 |
| workflows.html | ~8 |
| shared-email-types.js | ~3 (opcjonalnie) |
| **RAZEM** | ~30+ |

**Pamietaj:** Przy kazdej zmianie `client-projekt.html` zwieksz `APP_VERSION`!
