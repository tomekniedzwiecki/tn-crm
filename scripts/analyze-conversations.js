// Analiza rozmów WhatsApp
const fs = require('fs');

const messages = JSON.parse(fs.readFileSync('scripts/whatsapp-raw.json', 'utf8'));

console.log('='.repeat(60));
console.log('ANALIZA ROZMÓW WHATSAPP - TN CRM');
console.log('='.repeat(60));
console.log(`\nŁącznie wiadomości: ${messages.length}`);

// Grupuj po numerze telefonu
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
        text: msg.message_text
    });
});

const convList = Object.values(conversations);
console.log(`Konwersacji: ${convList.length}`);

// Podział na Tomka i Maćka
const tomekConvs = convList.filter(c => c.synced_by === 'tomek');
const maciekConvs = convList.filter(c => c.synced_by === 'maciek');
console.log(`\nTomek: ${tomekConvs.length} konwersacji`);
console.log(`Maciek: ${maciekConvs.length} konwersacji`);

// Statystyki wiadomości
const outbound = messages.filter(m => m.direction === 'outbound');
const inbound = messages.filter(m => m.direction === 'inbound');
console.log(`\nWysłane: ${outbound.length}`);
console.log(`Odebrane: ${inbound.length}`);

console.log('\n' + '='.repeat(60));
console.log('WZORCE WIADOMOŚCI WYCHODZĄCYCH (OUTBOUND)');
console.log('='.repeat(60));

// Kategoryzuj wiadomości wychodzące
const outboundTexts = outbound.map(m => m.message_text);

// Znajdź częste frazy początkowe
const starters = {};
outboundTexts.forEach(text => {
    const firstWords = text.split(' ').slice(0, 3).join(' ').toLowerCase();
    starters[firstWords] = (starters[firstWords] || 0) + 1;
});

const topStarters = Object.entries(starters)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

console.log('\nNajczęstsze początki wiadomości:');
topStarters.forEach(([phrase, count]) => {
    console.log(`  ${count}x: "${phrase}..."`);
});

// Kategoryzuj typy wiadomości
const categories = {
    powitanie: [],
    pytanie: [],
    propozycja_rozmowy: [],
    follow_up: [],
    informacja: [],
    inne: []
};

outboundTexts.forEach(text => {
    const lower = text.toLowerCase();
    if (lower.startsWith('cześć') || lower.startsWith('hej') || lower.startsWith('dzień dobry')) {
        categories.powitanie.push(text);
    } else if (text.includes('?')) {
        categories.pytanie.push(text);
    } else if (lower.includes('zadzwon') || lower.includes('porozmawiamy') || lower.includes('spotkanie')) {
        categories.propozycja_rozmowy.push(text);
    } else if (lower.includes('widzę') || lower.includes('przypominam') || lower.includes('wcześniej')) {
        categories.follow_up.push(text);
    } else {
        categories.inne.push(text);
    }
});

console.log('\n\nKategorie wiadomości:');
Object.entries(categories).forEach(([cat, msgs]) => {
    console.log(`\n${cat.toUpperCase()}: ${msgs.length} wiadomości`);
    // Pokaż unikalne przykłady
    const unique = [...new Set(msgs)].slice(0, 5);
    unique.forEach(m => console.log(`  • ${m.substring(0, 100)}${m.length > 100 ? '...' : ''}`));
});

console.log('\n' + '='.repeat(60));
console.log('PEŁNE KONWERSACJE (przykłady)');
console.log('='.repeat(60));

// Pokaż konwersacje z wieloma wiadomościami
const richConvs = convList
    .filter(c => c.messages.length >= 5)
    .sort((a, b) => b.messages.length - a.messages.length)
    .slice(0, 10);

richConvs.forEach(conv => {
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`${conv.contact_name} (${conv.phone})`);
    console.log(`Synced by: ${conv.synced_by} | Wiadomości: ${conv.messages.length}`);
    console.log('─'.repeat(50));

    conv.messages.forEach(msg => {
        const prefix = msg.dir === 'outbound' ? '→ TY:' : '← KLIENT:';
        console.log(`${prefix} ${msg.text}`);
    });
});

// Zapisz analizę do pliku
const analysis = {
    stats: {
        totalMessages: messages.length,
        conversations: convList.length,
        tomek: tomekConvs.length,
        maciek: maciekConvs.length,
        outbound: outbound.length,
        inbound: inbound.length
    },
    topStarters,
    categories: Object.fromEntries(
        Object.entries(categories).map(([k, v]) => [k, [...new Set(v)]])
    ),
    sampleConversations: richConvs.map(c => ({
        contact: c.contact_name,
        phone: c.phone,
        synced_by: c.synced_by,
        messages: c.messages
    }))
};

fs.writeFileSync('scripts/whatsapp-analysis.json', JSON.stringify(analysis, null, 2));
console.log('\n\nZapisano analizę do scripts/whatsapp-analysis.json');
