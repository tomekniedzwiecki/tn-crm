// Kompleksowa analiza WSZYSTKICH rozmów WhatsApp z paginacją
// Uruchom: node scripts/analyze-all-whatsapp.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://yxmavwkwnfuphjqbelws.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
    console.error('Brak SUPABASE_SERVICE_KEY w .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fetchAllMessages() {
    console.log('Pobieranie WSZYSTKICH wiadomości WhatsApp (z paginacją)...\n');

    let allMessages = [];
    let offset = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('whatsapp_messages')
            .select('*')
            .order('message_timestamp', { ascending: true })
            .range(offset, offset + pageSize - 1);

        if (error) {
            console.error('Błąd:', error);
            break;
        }

        if (data && data.length > 0) {
            allMessages = allMessages.concat(data);
            console.log(`Pobrano: ${allMessages.length} wiadomości...`);
            offset += pageSize;

            if (data.length < pageSize) {
                hasMore = false;
            }
        } else {
            hasMore = false;
        }
    }

    console.log(`\n✓ Łącznie pobrano: ${allMessages.length} wiadomości\n`);
    return allMessages;
}

async function analyzeMessages(messages) {
    console.log('='.repeat(70));
    console.log('KOMPLEKSOWA ANALIZA ROZMÓW WHATSAPP');
    console.log('='.repeat(70));

    // 1. Statystyki ogólne
    const outbound = messages.filter(m => m.direction === 'outbound');
    const inbound = messages.filter(m => m.direction === 'inbound');
    const tomekMessages = messages.filter(m => m.synced_by === 'tomek');
    const maciekMessages = messages.filter(m => m.synced_by === 'maciek');

    console.log(`\n📊 STATYSTYKI OGÓLNE:`);
    console.log(`   Łącznie wiadomości: ${messages.length}`);
    console.log(`   Wysłane (outbound): ${outbound.length}`);
    console.log(`   Odebrane (inbound): ${inbound.length}`);
    console.log(`   Tomek: ${tomekMessages.length} wiadomości`);
    console.log(`   Maciek: ${maciekMessages.length} wiadomości`);

    // 2. Grupowanie konwersacji
    const conversations = {};
    messages.forEach(msg => {
        const key = `${msg.phone_number}_${msg.synced_by || 'unknown'}`;
        if (!conversations[key]) {
            conversations[key] = {
                phone: msg.phone_number,
                contact_name: msg.contact_name,
                synced_by: msg.synced_by,
                messages: []
            };
        }
        conversations[key].messages.push({
            dir: msg.direction,
            text: msg.message_text,
            time: msg.message_timestamp
        });
    });

    const convList = Object.values(conversations);
    console.log(`   Unikalne konwersacje: ${convList.length}`);

    // 3. Analiza wiadomości wychodzących (outbound)
    const outboundTexts = outbound.map(m => m.message_text);
    const tomekOutbound = messages.filter(m => m.direction === 'outbound' && m.synced_by === 'tomek');
    const maciekOutbound = messages.filter(m => m.direction === 'outbound' && m.synced_by === 'maciek');

    console.log('\n' + '='.repeat(70));
    console.log('📤 ANALIZA WIADOMOŚCI WYCHODZĄCYCH');
    console.log('='.repeat(70));

    // 3a. Najczęstsze frazy początkowe
    const starters = {};
    outboundTexts.forEach(text => {
        if (!text) return;
        const firstWords = text.split(' ').slice(0, 4).join(' ').toLowerCase();
        starters[firstWords] = (starters[firstWords] || 0) + 1;
    });

    const topStarters = Object.entries(starters)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30);

    console.log('\n🔤 NAJCZĘSTSZE POCZĄTKI WIADOMOŚCI:');
    topStarters.forEach(([phrase, count], i) => {
        console.log(`   ${i + 1}. (${count}x) "${phrase}..."`);
    });

    // 3b. Analiza długości wiadomości
    const avgLengthTomek = tomekOutbound.length > 0
        ? Math.round(tomekOutbound.reduce((sum, m) => sum + (m.message_text?.length || 0), 0) / tomekOutbound.length)
        : 0;
    const avgLengthMaciek = maciekOutbound.length > 0
        ? Math.round(maciekOutbound.reduce((sum, m) => sum + (m.message_text?.length || 0), 0) / maciekOutbound.length)
        : 0;

    console.log(`\n📏 ŚREDNIA DŁUGOŚĆ WIADOMOŚCI:`);
    console.log(`   Tomek: ${avgLengthTomek} znaków`);
    console.log(`   Maciek: ${avgLengthMaciek} znaków`);

    // 4. Analiza konwersacji - wzorce odpowiedzi
    console.log('\n' + '='.repeat(70));
    console.log('💬 WZORCE DIALOGOWE (pytanie -> odpowiedź)');
    console.log('='.repeat(70));

    const qaPatterns = [];

    convList.forEach(conv => {
        for (let i = 0; i < conv.messages.length - 1; i++) {
            const current = conv.messages[i];
            const next = conv.messages[i + 1];

            // Szukamy: klient pyta (inbound) -> my odpowiadamy (outbound)
            if (current.dir === 'inbound' && next.dir === 'outbound') {
                qaPatterns.push({
                    question: current.text,
                    answer: next.text,
                    synced_by: conv.synced_by
                });
            }
        }
    });

    console.log(`\n📌 Znalezionych par Q&A: ${qaPatterns.length}`);

    // 5. Kategoryzacja pytań klientów
    console.log('\n' + '='.repeat(70));
    console.log('❓ KATEGORYZACJA PYTAŃ KLIENTÓW');
    console.log('='.repeat(70));

    const questionCategories = {
        cena: [],
        czas: [],
        gwarancja: [],
        doswiadczenie: [],
        firma: [],
        raty: [],
        produkt: [],
        inne: []
    };

    qaPatterns.forEach(qa => {
        if (!qa.question) return;
        const q = qa.question.toLowerCase();

        if (q.includes('cen') || q.includes('kosztu') || q.includes('ile') || q.includes('drogo') || q.includes('zł') || q.includes('plac')) {
            questionCategories.cena.push(qa);
        } else if (q.includes('czas') || q.includes('kiedy') || q.includes('jak długo') || q.includes('tydzien') || q.includes('dzień')) {
            questionCategories.czas.push(qa);
        } else if (q.includes('gwaranc') || q.includes('zwrot') || q.includes('nie wypali') || q.includes('ryzyko')) {
            questionCategories.gwarancja.push(qa);
        } else if (q.includes('doświadcz') || q.includes('umie') || q.includes('potraf') || q.includes('znam')) {
            questionCategories.doswiadczenie.push(qa);
        } else if (q.includes('firm') || q.includes('działalność') || q.includes('vat') || q.includes('podatk')) {
            questionCategories.firma.push(qa);
        } else if (q.includes('rat') || q.includes('spłat') || q.includes('rozłoż')) {
            questionCategories.raty.push(qa);
        } else if (q.includes('produk') || q.includes('co sprzeda') || q.includes('towar') || q.includes('asortyment')) {
            questionCategories.produkt.push(qa);
        } else {
            questionCategories.inne.push(qa);
        }
    });

    Object.entries(questionCategories).forEach(([cat, items]) => {
        if (items.length === 0) return;
        console.log(`\n📂 ${cat.toUpperCase()} (${items.length} pytań):`);
        // Pokaż przykłady
        const examples = items.slice(0, 5);
        examples.forEach((qa, i) => {
            console.log(`\n   ${i + 1}. KLIENT: "${qa.question?.substring(0, 100)}${qa.question?.length > 100 ? '...' : ''}"`);
            console.log(`      ODPOWIEDŹ (${qa.synced_by}): "${qa.answer?.substring(0, 150)}${qa.answer?.length > 150 ? '...' : ''}"`);
        });
    });

    // 6. Analiza stylu Tomka vs Maćka
    console.log('\n' + '='.repeat(70));
    console.log('👤 ANALIZA STYLU: TOMEK vs MACIEK');
    console.log('='.repeat(70));

    // Znajdź charakterystyczne słowa/frazy dla każdego
    function findCharacteristicPhrases(messages) {
        const phrases = {};
        messages.forEach(m => {
            if (!m.message_text) return;
            const text = m.message_text.toLowerCase();

            // Szukaj charakterystycznych zwrotów
            const patterns = [
                'wiesz co', 'szczerze', 'z mojego doświadczenia', 'dobra', 'ok,', 'super',
                'hej', 'cześć', 'dzień dobry', 'pozdrawiam', 'daj znać', 'napisz',
                'zadzwoń', 'pogadamy', 'spotkajmy się', 'umówmy się', 'jasne',
                'bez problemu', 'nie ma sprawy', 'rozumiem', 'dokładnie', 'właśnie',
                'tak naprawdę', 'generalnie', 'w skrócie', 'mówiąc krótko'
            ];

            patterns.forEach(p => {
                if (text.includes(p)) {
                    phrases[p] = (phrases[p] || 0) + 1;
                }
            });
        });

        return Object.entries(phrases)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15);
    }

    const tomekPhrases = findCharacteristicPhrases(tomekOutbound);
    const maciekPhrases = findCharacteristicPhrases(maciekOutbound);

    console.log('\n🔵 CHARAKTERYSTYCZNE FRAZY TOMKA:');
    tomekPhrases.forEach(([phrase, count]) => {
        console.log(`   "${phrase}" - ${count}x`);
    });

    console.log('\n🟢 CHARAKTERYSTYCZNE FRAZY MAĆKA:');
    maciekPhrases.forEach(([phrase, count]) => {
        console.log(`   "${phrase}" - ${count}x`);
    });

    // 7. Przykładowe pełne konwersacje
    console.log('\n' + '='.repeat(70));
    console.log('📝 PRZYKŁADOWE PEŁNE KONWERSACJE (najdłuższe)');
    console.log('='.repeat(70));

    const richConvs = convList
        .filter(c => c.messages.length >= 10)
        .sort((a, b) => b.messages.length - a.messages.length)
        .slice(0, 5);

    richConvs.forEach((conv, idx) => {
        console.log(`\n${'─'.repeat(60)}`);
        console.log(`KONWERSACJA ${idx + 1}: ${conv.contact_name || conv.phone}`);
        console.log(`Synced by: ${conv.synced_by} | Wiadomości: ${conv.messages.length}`);
        console.log('─'.repeat(60));

        conv.messages.slice(0, 30).forEach(msg => {
            const prefix = msg.dir === 'outbound' ? '→ MY:' : '← KLIENT:';
            console.log(`${prefix} ${msg.text}`);
            console.log();
        });

        if (conv.messages.length > 30) {
            console.log(`... i jeszcze ${conv.messages.length - 30} wiadomości`);
        }
    });

    // 8. Zapisz pełną analizę do JSON
    const fullAnalysis = {
        stats: {
            totalMessages: messages.length,
            outbound: outbound.length,
            inbound: inbound.length,
            tomek: tomekMessages.length,
            maciek: maciekMessages.length,
            conversations: convList.length
        },
        topStarters,
        avgLength: { tomek: avgLengthTomek, maciek: avgLengthMaciek },
        questionCategories: Object.fromEntries(
            Object.entries(questionCategories).map(([k, v]) => [k, v.length])
        ),
        qaExamples: {
            cena: questionCategories.cena.slice(0, 10),
            czas: questionCategories.czas.slice(0, 10),
            gwarancja: questionCategories.gwarancja.slice(0, 10),
            raty: questionCategories.raty.slice(0, 10),
            firma: questionCategories.firma.slice(0, 10),
            produkt: questionCategories.produkt.slice(0, 10)
        },
        characteristicPhrases: {
            tomek: tomekPhrases,
            maciek: maciekPhrases
        },
        sampleConversations: richConvs.map(c => ({
            contact: c.contact_name,
            phone: c.phone,
            synced_by: c.synced_by,
            message_count: c.messages.length,
            messages: c.messages
        })),
        allQAPatterns: qaPatterns
    };

    fs.writeFileSync('scripts/whatsapp-full-analysis.json', JSON.stringify(fullAnalysis, null, 2));
    console.log('\n\n✓ Zapisano pełną analizę do scripts/whatsapp-full-analysis.json');

    return fullAnalysis;
}

async function main() {
    const messages = await fetchAllMessages();
    await analyzeMessages(messages);
}

main().catch(console.error);
