/**
 * Import contacts from CSV to Supabase outreach_contacts table
 *
 * Usage: node scripts/import-contacts.js <csv-file> <source-name>
 * Example: node scripts/import-contacts.js data-private/klienci_ltv.csv klienci_ltv
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const SUPABASE_URL = 'https://yxmavwkwnfuphjqbelws.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
    console.error('ERROR: Set SUPABASE_SERVICE_KEY environment variable');
    console.error('Get it from: Supabase Dashboard -> Settings -> API -> service_role key');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Parse CSV line handling quoted fields
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());

    return result;
}

// Parse Polish number format (comma as decimal separator)
function parseNumber(value) {
    if (!value || value === '') return null;
    // Replace comma with dot for decimal
    const normalized = value.replace(',', '.');
    const num = parseFloat(normalized);
    return isNaN(num) ? null : num;
}

// Parse date string
function parseDate(value) {
    if (!value || value === '') return null;
    try {
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date.toISOString();
    } catch {
        return null;
    }
}

// Parse product list (pipe-separated)
function parseProducts(value) {
    if (!value || value === '') return [];
    return value.split('|').map(p => p.trim()).filter(p => p);
}

// Normalize phone number
function normalizePhone(phone) {
    if (!phone) return null;
    // Remove spaces, dashes
    let cleaned = phone.replace(/[\s\-]/g, '');
    // Remove +48 or 48 prefix if present
    cleaned = cleaned.replace(/^\+?48/, '');
    // If starts with +, keep it (international)
    if (phone.startsWith('+') && !phone.startsWith('+48')) {
        return phone.replace(/[\s\-]/g, '');
    }
    return cleaned || null;
}

async function importCSV(filePath, sourceName) {
    console.log(`\nImporting: ${filePath}`);
    console.log(`Source: ${sourceName}`);
    console.log('-----------------------------------');

    // Read file
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
        console.error(`File not found: ${fullPath}`);
        process.exit(1);
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());

    if (lines.length < 2) {
        console.error('CSV file is empty or has only headers');
        process.exit(1);
    }

    // Parse headers
    const headers = parseCSVLine(lines[0]);
    console.log(`Headers: ${headers.join(', ')}`);
    console.log(`Total rows: ${lines.length - 1}`);

    // Map headers to expected fields
    const headerMap = {};
    headers.forEach((h, i) => {
        const lower = h.toLowerCase().trim();
        if (lower === 'email') headerMap.email = i;
        else if (lower === 'phone') headerMap.phone = i;
        else if (lower === 'ltv_pln') headerMap.ltv_pln = i;
        else if (lower === 'transactioncount') headerMap.transaction_count = i;
        else if (lower === 'refundedtotal_pln') headerMap.refunded_total_pln = i;
        else if (lower === 'firstpurchase') headerMap.first_purchase = i;
        else if (lower === 'lastpurchase') headerMap.last_purchase = i;
        else if (lower === 'uniqueproducts') headerMap.unique_products = i;
        else if (lower === 'productlist') headerMap.products = i;
    });

    // Process rows
    const contacts = [];
    let skipped = 0;

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);

        const email = values[headerMap.email]?.toLowerCase().trim();
        if (!email || !email.includes('@')) {
            skipped++;
            continue;
        }

        contacts.push({
            email,
            phone: normalizePhone(values[headerMap.phone]),
            ltv_pln: parseNumber(values[headerMap.ltv_pln]),
            transaction_count: parseInt(values[headerMap.transaction_count]) || null,
            refunded_total_pln: parseNumber(values[headerMap.refunded_total_pln]),
            first_purchase: parseDate(values[headerMap.first_purchase]),
            last_purchase: parseDate(values[headerMap.last_purchase]),
            unique_products: parseInt(values[headerMap.unique_products]) || null,
            products: parseProducts(values[headerMap.products]),
            source: sourceName
        });
    }

    console.log(`Parsed: ${contacts.length} contacts`);
    console.log(`Skipped: ${skipped} (invalid email)`);

    // Insert in batches
    const BATCH_SIZE = 500;
    let inserted = 0;
    let errors = 0;

    for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
        const batch = contacts.slice(i, i + BATCH_SIZE);

        const { data, error } = await supabase
            .from('outreach_contacts')
            .upsert(batch, {
                onConflict: 'email,source',
                ignoreDuplicates: false
            });

        if (error) {
            console.error(`\nBatch ${Math.floor(i/BATCH_SIZE) + 1} error:`, error.message);
            console.error('Error details:', JSON.stringify(error, null, 2));
            // Show first record from failed batch for debugging
            console.error('First record in batch:', JSON.stringify(batch[0], null, 2));
            errors += batch.length;
        } else {
            inserted += batch.length;
        }

        // Progress
        process.stdout.write(`\rProgress: ${Math.min(i + BATCH_SIZE, contacts.length)}/${contacts.length}`);
    }

    console.log('\n-----------------------------------');
    console.log(`Done! Inserted/Updated: ${inserted}`);
    console.log(`Errors: ${errors}`);
}

// Main
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('Usage: node scripts/import-contacts.js <csv-file> <source-name>');
    console.log('Example: node scripts/import-contacts.js data-private/klienci_ltv.csv klienci_ltv');
    process.exit(1);
}

importCSV(args[0], args[1]);
