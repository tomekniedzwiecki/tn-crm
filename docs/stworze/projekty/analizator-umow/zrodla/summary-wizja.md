**Wizja produktu dla Tomka**

Produkt to wyspecjalizowana aplikacja SaaS do kontroli projektów umów podwykonawczych w zamówieniach publicznych. Ma szybko porównywać umowę podwykonawczą z Kontraktem Głównym oraz właściwymi przepisami KC i PZP, pokazując praktyczne ryzyka przed podpisaniem i negocjacjami. Nie zastępuje prawnika ani pełnej opinii prawnej. Klientami są średnie firmy budowlane i wykonawcze występujące jako podwykonawcy lub dalsi podwykonawcy; użytkownikami – właściciele, zarząd i project managerowie.

**Rdzeń v1:** wyłącznie umowy o roboty budowlane; dostawy i usługi później. Użytkownik wgrywa pełne PDF-y: projekt umowy oraz Kontrakt Główny, także jako skany i zestawy warunków ogólnych/szczegółowych. System uwzględnia hierarchię dokumentów, OCR, możliwość poprawienia odczytu oraz osobny audyt korekt. Analiza bez KG jest dopuszczalna, ale raport otrzymuje nazwę „Informacja ograniczona bez KG” i jednoznaczne ostrzeżenia o braku porównania.

Wynikiem jest prosty raport PDF w trzech częściach:  
1. kluczowe warunki;  
2. porównanie zgodności projektu z KG/KC/PZP;  
3. obowiązki i terminy podwykonawcy.  

Tabela pokazuje paragrafy i cytaty z obu umów, rozbieżność, podstawę kontraktową lub właściwy artykuł z krótkim opisem, wymagane dokumenty oraz wynik „Zgodny/Niezgodny”. Czerwone niezgodności otrzymują „DO DECYZJI”; raport zawiera praktyczne ostrzeżenia, ale bez rekomendacji prawnej. Kontrola obejmuje m.in. limity, stawki, katalog i podstawę kar, zwłokę kontra opóźnienie, płatność do 30 dni, waloryzację, zabezpieczenia i zatrzymania, odbiory, gwarancję/rękojmię, akceptację umowy, umocowanie, obowiązki oraz terminy. System wykrywa także uzależnienie płatności lub zwrotu zabezpieczenia od wcześniejszego rozliczenia wykonawcy z inwestorem. W v1 nie stosujemy werdyktu „STOP”; każda istotna niezgodność wymusza co najmniej „NEGOCJUJ/DO DECYZJI”. Ostateczne nazewnictwo statusów trzeba ujednolicić.

**Model cenowy:** abonament miesięczny opłacany przez firmę, uzasadniony oszczędnością czasu i ograniczeniem ryzyka kar, sporów oraz utraty marży. Pakiety, limity analiz i zakres wyższego planu pozostają do ustalenia; możliwe są rozszerzone wsparcie, konsultacje lub dedykowane środowisko.

**Kluczowe decyzje:** automatyczna baza aktualnego KC/PZP; priorytetem jest rzetelność, nie szerokość funkcji. Dokumenty są automatycznie anonimizowane, szyfrowane, izolowane między firmami, niewykorzystywane do trenowania modeli i dostępne serwisowi tylko za zgodą klienta. Start sprzedaży dopiero po testach, dokumentacji, walidacji eksperta i zatwierdzeniu komunikatów prawnych.

**Największe ryzyka:** błędny OCR lub analiza, niepełne dokumenty, niejednoznaczna hierarchia, zmiany prawa, odpowiedzialność za wynik oraz utrata zaufania przez incydent bezpieczeństwa. Ryzykiem produktowym jest też rozrost v1 do pełnej opinii prawnej.

**Otwarte pytania:** walidacja przez prawnika PZP; wersjonowanie prawa (w tym zmiana art. 463 PZP od 12.07.2026); reakcja na niską pewność analizy i niejasną hierarchię; dokładny audyt korekt i moment ponownej analizy; zatwierdzanie anonimizacji; finalne statusy, disclaimer i nazwa tabeli; architektura bezpieczeństwa, zakres audytu, wariant osobnego środowiska oraz ostateczne pakiety i ceny.