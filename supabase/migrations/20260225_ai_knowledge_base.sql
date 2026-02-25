-- AI Knowledge Base - tabela wiedzy dla systemu generowania odpowiedzi WhatsApp
-- Migracja: 20260225
-- Dane oparte na analizie 3823 wiadomości WhatsApp

-- Tworzenie tabeli
CREATE TABLE IF NOT EXISTS ai_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    subcategory TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    trigger_keywords TEXT[],
    priority INT DEFAULT 0,
    for_user TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksy
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_category ON ai_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_active ON ai_knowledge_base(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_keywords ON ai_knowledge_base USING GIN(trigger_keywords);

-- RLS
ALTER TABLE ai_knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_knowledge_base_select" ON ai_knowledge_base
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "ai_knowledge_base_insert" ON ai_knowledge_base
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "ai_knowledge_base_update" ON ai_knowledge_base
    FOR UPDATE TO authenticated USING (true);
CREATE POLICY "ai_knowledge_base_delete" ON ai_knowledge_base
    FOR DELETE TO authenticated USING (true);

-- =====================================================
-- SEED DATA - OPARTE NA PRAWDZIWYCH ROZMOWACH
-- =====================================================

-- COMPANY - Kim jesteśmy (z rzeczywistych konwersacji)
INSERT INTO ai_knowledge_base (category, subcategory, title, content, trigger_keywords, priority) VALUES
('company', 'core', 'Kim jesteśmy',
'Tomek Niedźwiecki - współzałożyciel TakeDrop (platforma dropshippingowa). Teraz pomaga budować sklepy e-commerce. Model: partnerstwo, nie dostawca usług. Maciek to handlowiec prowadzący rozmowy i pierwsze kontakty.',
ARRAY['kim', 'jestescie', 'firma', 'tomek', 'takedrop', 'kto'], 100),

('company', 'model', 'Model biznesowy - 20%',
'Pobieramy 20% od dochodu netto (nie przychodu!), bezterminowo. Dochód = przychód minus koszty produktów, reklam, platformy. Jak nie generuje, to się nie rozliczamy. Po 2 latach można wykupić udziały. Przy ~400k przychodu rocznie - założenie wspólnej spółki.',
ARRAY['model', '20%', 'procent', 'udzial', 'wspolnik', 'dochod'], 100),

('company', 'experience', 'Doświadczenie Tomka',
'Tomek ma doświadczenie przy wydanych ok. 8 mln na reklamy (Meta Ads). 15 lat w branży e-commerce. Współzałożyciel TakeDrop.',
ARRAY['doswiadczenie', 'tomek', 'reklamy', 'takedrop'], 85);

-- PRODUCT - Oferty (rzeczywiste ceny z konwersacji)
INSERT INTO ai_knowledge_base (category, subcategory, title, content, trigger_keywords, priority) VALUES
('product', 'starter', 'Oferta Starter',
'Pakiet startowy - przygotowanie sklepu, wybór produktu z naszych bestsellerów, strategia, raport, branding, sklep. Po przygotowaniu klient akceptuje i podejmuje decyzję o dalszej współpracy. Jeśli nie spodoba się sklep - zwrot pieniędzy.',
ARRAY['starter', 'podstawowy', 'poczatek', 'oferta'], 95),

('product', 'full', 'Oferta Full',
'Pełny pakiet - wszystko co w Starter plus: rozbudowany branding, profesjonalne materiały, ustawienie kampanii reklamowych, szkolenia, wsparcie w skalowaniu.',
ARRAY['full', 'pelny', 'kompletny', 'wszystko'], 95),

('product', 'process', 'Jak wygląda proces',
'1. Wybór produktu z naszych bestsellerów (kilkanaście minut). 2. Tomek przygotowuje strategię, raport, branding, sklep (2-3 tygodnie). 3. Klient akceptuje sklep. 4. Podpisanie umowy i start współpracy. 5. Ze sprzedażą startujemy mniej więcej w 3 tygodniu od startu.',
ARRAY['proces', 'jak', 'etapy', 'kroki', 'start'], 90),

('product', 'time', 'Czas realizacji',
'Za 2-3 tygodnie uruchomienie pełne sprzedaży. Na początku Tomek zajmuje się wszystkim, klient obserwuje i się uczy. Później krok po kroku przekazujemy elementy - docelowo klient przejmuje stery (przy 300-500 zamówieniach).',
ARRAY['czas', 'kiedy', 'jak dlugo', 'tygodnie', 'start'], 90),

('product', 'daily_time', 'Ile czasu dziennie',
'Na samym początku mniej potrzeba - głównie wybór produktu. Później 0.5-1h dziennie wystarczy. Przy przejęciu sterów 1-2h dziennie. To odpowiadanie na pytania klientów, sprawdzanie zamówień.',
ARRAY['czas', 'godziny', 'dziennie', 'ile pracy'], 90),

('product', 'platform', 'Platforma i koszty',
'Abonament platformy (Shoper/TakeDrop): 99 zł miesięcznie. Warto kupić wybrany produkt do domu (ok. 100 zł). Budżet reklamowy na start: ok. 1k zł. Zaczynamy bez płatnych reklam, pozyskujemy kapitał i dopiero przechodzimy do reklam.',
ARRAY['platforma', 'koszty', 'abonament', 'reklamy', 'budzet', '99'], 85),

('product', 'product_selection', 'Wybór produktu',
'Podeślemy kilka propozycji bestsellerów i wybierzesz z nich 1, na którym będziemy opierać sklep i zbudujemy pod niego cały branding. Każdy produkt ma potencjał - kwestia, żeby wybrać taki, który Ci się bardziej podoba. Zaczynamy od dropa, potem można przejść na import i fullfilment.',
ARRAY['produkt', 'wybor', 'bestseller', 'co sprzedawac'], 90);

-- OBJECTION - Obiekcje i RZECZYWISTE odpowiedzi z rozmów
INSERT INTO ai_knowledge_base (category, subcategory, title, content, trigger_keywords, priority) VALUES
('objection', 'no_money', 'Nie mam pieniędzy / za drogo',
'Rzeczywiste odpowiedzi: "A jaki masz na teraz budżet?", "Te 2k w jakim czasie będziesz mógł zorganizować?", "Można rozbić na np. 3 płatności bez banku", "A nie chcesz spróbować rat 0%?", "Przy opcji 50 rat wychodzi bodajże 230 zł"',
ARRAY['pieniadze', 'kasa', 'budzet', 'nie mam', 'drogie', 'nie stac', 'za duzo'], 100),

('objection', 'installments', 'Raty nie przejdą / brak zdolności',
'Rzeczywiste odpowiedzi: "Mogłeś napisać tutaj wprost. Możemy Ci to rozbić na np. 3 płatności bez banku w takiej sytuacji", "Nie przejdzie Ci przy opcji 50 rat?", "i masz normalną umowę o pracę?"',
ARRAY['raty', 'zdolnosc', 'kredyt', 'bik', 'nie przejda'], 95),

('objection', 'guarantee', 'Jaka gwarancja / co jak nie wypali',
'Rzeczywiste odpowiedzi: "Jeżeli byłaby taka sytuacja, to zawsze można zmienić produkt. Do tej pory nie było takiej potrzeby nigdy.", "Jak nie generuje, to się nie rozliczamy. To jest nasza inwestycja czasowa.", "Po ukończeniu sklepu podejmujemy finalną decyzję - jeśli nie spodoba Ci się sklep, to zwracamy pieniądze"',
ARRAY['gwarancja', 'zwrot', 'nie wypali', 'ryzyko', 'utopione'], 95),

('objection', 'negative_reviews', 'Negatywne opinie',
'Rzeczywiste odpowiedzi: "Jeżeli mówisz o wyzwaniu, to zwrot był tam na podstawie dokumentu po spełnieniu warunków regularnej pracy.", "to nie chodzi o wielkość wpłaty, tylko zaangażowanie własnych środków. Nie w tej kwocie mamy jakikolwiek interes, tylko w procencie przy rozkręconym sklepie"',
ARRAY['opinie', 'negatywne', 'komentarze', 'recenzje'], 85),

('objection', 'think', 'Muszę się zastanowić / później',
'Rzeczywiste podejście: Nie naciskać mocno, ale dać jasny timeframe. "Osobiście polecałbym po prostu zacząć, a po otrzymaniu sklepu już podjąć decyzję czy działamy, czy robimy zwrot. Teraz nie ma na czym opierać tej decyzji"',
ARRAY['zastanowic', 'przemyslec', 'pozniej', 'nie teraz', 'decyzja'], 85),

('objection', 'company_needed', 'Czy trzeba mieć firmę',
'Rzeczywiste odpowiedzi: "Nie trzeba", "Nie trzeba mieć działalności na start", "zaczynać można na nierejestrowej i potem założyć/wejść w inkubator", "to nie problem, możesz skorzystać z inkubatora na początku a potem jak się rozkręcimy to będę mocno zalecał powrót do działalności"',
ARRAY['firma', 'dzialalnosc', 'vat', 'podatki', 'zus', 'nip'], 90),

('objection', 'returns', 'Zwroty i reklamacje',
'Rzeczywiste odpowiedzi: "To są pierdółki i na dobrych produktach te zwroty to z reguły mniej, niż 1-2%. Klient odsyła do hurtowni, hurtownia zwraca Ci pieniądze, a Ty klientowi. I tyle"',
ARRAY['zwroty', 'reklamacje', 'odsylac'], 80);

-- PROCESS - Procesy (rzeczywiste odpowiedzi)
INSERT INTO ai_knowledge_base (category, subcategory, title, content, trigger_keywords, priority) VALUES
('process', 'payment', 'Jak zapłacić',
'Przez stronę oferty - karta, BLIK, przelew lub raty przez Paynow. Można też BLIK na numer 793113898 (Tomek). "Zrób na początek blika na numer 793113898"',
ARRAY['zaplacic', 'platnosc', 'przelew', 'karta', 'blik'], 90),

('process', 'after_decision', 'Co po decyzji',
'Po ukończeniu sklepu otrzymasz go i wtedy podejmujemy finalną decyzję o dalszej współpracy - jeżeli będziesz chętny/a, to podpisujemy umowę i dzielimy się zyskami (20% od dochodu dla nas, 80% dla Ciebie) i współpracujemy bezterminowo.',
ARRAY['po platnosci', 'co dalej', 'nastepne', 'decyzja'], 85),

('process', 'handover', 'Przekazanie sterów',
'Krok po kroku będziesz mieć kolejne elementy do pracy przekazywane, żeby wyszło naturalnie i bez skoku na głęboką wodę. Bliżej poziomu pierwszych 300-500 zamówień przejmiesz stery. Na etapie ~400k przychodu - dopięcie formalności ze spółką.',
ARRAY['stery', 'przejac', 'przekazanie', 'samodzielnie'], 85);

-- CONTRACT - Warunki umowy (z rzeczywistych rozmów)
INSERT INTO ai_knowledge_base (category, subcategory, title, content, trigger_keywords, priority) VALUES
('contract', 'profit_share', 'Podział zysków 20/80',
'20% od dochodu netto dla nas, 80% dla Ciebie. Dochód = przychód minus koszty. Jak nie generuje, to się nie rozliczamy. Bezterminowo.',
ARRAY['20%', 'procent', 'udzial', 'zysk', 'dochod', 'podzial'], 100),

('contract', 'buyout', 'Wykup udziałów',
'Po 2 latach można wykupić udziały. Kwota do ustalenia indywidualnie w zależności ile będą warte.',
ARRAY['wykup', 'odkupic', 'udzialy', 'wyjsc'], 90),

('contract', 'spolka', 'Założenie spółki',
'Na etapie ~400k przychodu rocznie wrócicie do dopięcia formalności związanych z utworzeniem spółki razem.',
ARRAY['spolka', '400k', 'zoo', 'wspolnik'], 85);

-- TONE - Styl komunikacji (na podstawie analizy 3823 wiadomości)
INSERT INTO ai_knowledge_base (category, subcategory, title, content, trigger_keywords, priority, for_user) VALUES
('tone', 'general', 'Ogólny styl TN',
'Krótkie, konkretne odpowiedzi. Bez zbędnych słów. Naturalny język, bez korporacyjnego żargonu. Typowe początki: "Cześć", "Hej", "Ok". Typowe zakończenia: "Daj znać", "Napisz". Bez emoji (chyba że klient ich używa).',
ARRAY['styl', 'jak pisac'], 100, NULL),

('tone', 'tomek', 'Styl Tomka',
'Średnia długość wiadomości: 39 znaków (KRÓTKO!). Charakterystyczne: "hej" (21x), "cześć" (14x), "ok," (8x), "daj znać" (7x), "super" (3x). Pisze zwięźle, bez elaborowania. Przykłady: "ok!", "Powodzenia!", "1000 zł", "good"',
ARRAY['tomek'], 95, 'tomek'),

('tone', 'maciek', 'Styl Maćka',
'Średnia długość wiadomości: 72 znaków (dłuższe niż Tomek). Charakterystyczne: "cześć" (218x), "właśnie" (97x), "ok," (88x), "rozumiem" (54x), "hej" (31x), "daj znać" (15x), "bez problemu" (7x). Bardziej wyjaśnia i tłumaczy.',
ARRAY['maciek'], 95, 'maciek');

-- SCRIPTS - Gotowe szablony wiadomości (najczęściej używane)
INSERT INTO ai_knowledge_base (category, subcategory, title, content, trigger_keywords, priority) VALUES
('script', 'first_contact', 'Pierwszy kontakt',
'Najczęstsze otwarcia: "Naszą propozycję widziałeś/widziałaś czy jeszcze nie?", "Cześć, to działamy wspólnie ze sklepem, czy będziesz się zajmować wszystkim samodzielnie?", "Patrzę właśnie na Twoją ankietę"',
ARRAY['pierwszy', 'kontakt', 'start', 'poczatek'], 90),

('script', 'send_offer', 'Wysłanie oferty',
'Link do oferty: crm.tomekniedzwiecki.pl/offer-starter?token=... lub /p/{token}. Po wysłaniu: "Oferta startowa" lub "Twoja spersonalizowana oferta"',
ARRAY['oferta', 'link', 'wyslac'], 85),

('script', 'followup', 'Follow-up',
'Krótkie follow-upy: "I jak?", "Działa?", "Działamy?", "Udało ci się?"',
ARRAY['followup', 'przypomnienie', 'status'], 80),

('script', 'summary', 'Podsumowanie modelu',
'Szablon: "W takim największym skrócie: zaczynacie od nowa, ale już na produktach, które ma wybrane Tomek (Ty z nich wybierzesz, które najbardziej Ci się podobają). Następnie to już Tomek przygotuje strategię i audyt, po czym zrobi sklep-markę pod ten produkt."',
ARRAY['skrot', 'podsumowanie', 'jak dziala'], 85);

-- Trigger do aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_ai_knowledge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ai_knowledge_updated_at ON ai_knowledge_base;
CREATE TRIGGER ai_knowledge_updated_at
    BEFORE UPDATE ON ai_knowledge_base
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_knowledge_updated_at();
