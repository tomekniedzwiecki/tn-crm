// Skrypt do analizy rozmów WhatsApp
// Uruchom: node scripts/analyze-whatsapp.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yxmavwkwnfuphjqbelws.supabase.co';
// Użyj service role key żeby ominąć RLS
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
    console.error('Ustaw SUPABASE_SERVICE_KEY w zmiennych środowiskowych');
    console.log('export SUPABASE_SERVICE_KEY="twój-service-role-key"');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function analyzeMessages() {
    console.log('Pobieranie wiadomości...\n');

    // Pobierz wszystkie wiadomości
    const { data: messages, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .order('message_timestamp', { ascending: true });

    if (error) {
        console.error('Błąd:', error);
        return;
    }

    console.log(`Łącznie wiadomości: ${messages.length}`);

    // Grupuj po numerze telefonu
    const conversations = {};
    messages.forEach(msg => {
        if (!conversations[msg.phone_number]) {
            conversations[msg.phone_number] = {
                contact_name: msg.contact_name,
                synced_by: msg.synced_by,
                messages: []
            };
        }
        conversations[msg.phone_number].messages.push(msg);
    });

    console.log(`Unikalne konwersacje: ${Object.keys(conversations).length}`);

    // Statystyki
    const outbound = messages.filter(m => m.direction === 'outbound');
    const inbound = messages.filter(m => m.direction === 'inbound');
    console.log(`Wysłane (outbound): ${outbound.length}`);
    console.log(`Odebrane (inbound): ${inbound.length}`);

    console.log('\n========================================');
    console.log('ANALIZA ROZMÓW');
    console.log('========================================\n');

    // Wyświetl każdą konwersację
    Object.entries(conversations).forEach(([phone, conv]) => {
        console.log(`\n--- ${conv.contact_name || phone} (${phone}) ---`);
        console.log(`Synced by: ${conv.synced_by}`);
        console.log(`Wiadomości: ${conv.messages.length}`);
        console.log('');

        conv.messages.forEach(msg => {
            const time = new Date(msg.message_timestamp).toLocaleString('pl-PL');
            const dir = msg.direction === 'outbound' ? '→ TY:' : '← KLIENT:';
            console.log(`[${time}] ${dir}`);
            console.log(`   ${msg.message_text}`);
            console.log('');
        });
    });

    // Analiza stylu wiadomości outbound
    console.log('\n========================================');
    console.log('ANALIZA STYLU WIADOMOŚCI WYCHODZĄCYCH');
    console.log('========================================\n');

    // Grupuj podobne wiadomości
    const outboundTexts = outbound.map(m => m.message_text);
    const uniqueOutbound = [...new Set(outboundTexts)];

    console.log(`Unikalne wiadomości wychodzące: ${uniqueOutbound.length}`);
    console.log('\nPrzykłady wiadomości:\n');

    uniqueOutbound.slice(0, 50).forEach((text, i) => {
        console.log(`${i + 1}. ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`);
        console.log('');
    });

    // Zapisz do pliku JSON
    const fs = require('fs');
    const analysisData = {
        stats: {
            total: messages.length,
            outbound: outbound.length,
            inbound: inbound.length,
            conversations: Object.keys(conversations).length
        },
        conversations: Object.entries(conversations).map(([phone, conv]) => ({
            phone,
            contact_name: conv.contact_name,
            synced_by: conv.synced_by,
            messages: conv.messages.map(m => ({
                direction: m.direction,
                text: m.message_text,
                timestamp: m.message_timestamp
            }))
        })),
        uniqueOutboundMessages: uniqueOutbound
    };

    fs.writeFileSync('scripts/whatsapp-analysis.json', JSON.stringify(analysisData, null, 2));
    console.log('\nZapisano analizę do scripts/whatsapp-analysis.json');
}

analyzeMessages();
