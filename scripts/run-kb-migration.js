// Uruchom: node scripts/run-kb-migration.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const SUPABASE_URL = 'https://yxmavwkwnfuphjqbelws.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
    console.error('Brak SUPABASE_SERVICE_KEY w .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration() {
    console.log('Uruchamiam migracje ai_knowledge_base...\n');

    // Sprawdz czy tabela istnieje
    const { error: checkError } = await supabase
        .from('ai_knowledge_base')
        .select('id')
        .limit(1);

    if (!checkError) {
        console.log('Tabela ai_knowledge_base juz istnieje!');
        const { count } = await supabase
            .from('ai_knowledge_base')
            .select('*', { count: 'exact', head: true });
        console.log(`Liczba rekordow: ${count}`);
        return;
    }

    console.log('Tabela nie istnieje. Musisz uruchomic SQL recznie:');
    console.log('1. Wejdz na: https://supabase.com/dashboard/project/yxmavwkwnfuphjqbelws/sql');
    console.log('2. Skopiuj zawartosc pliku: supabase/migrations/20260225_ai_knowledge_base.sql');
    console.log('3. Wklej i uruchom w SQL Editor\n');

    // Pokaz poczatek SQL
    const sql = fs.readFileSync('supabase/migrations/20260225_ai_knowledge_base.sql', 'utf8');
    console.log('Poczatek SQL do skopiowania:\n');
    console.log(sql.substring(0, 500) + '...\n');
}

runMigration();
