/**
 * Lists Gemini models available to this API key (only ones that support
 * generateContent and look like Flash-family). Helpful for picking model IDs
 * to feed into benchmark-gemini.ts.
 *
 * Run: npx ts-node --transpile-only scripts/list-gemini-models.ts
 */
import * as dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error('GEMINI_API_KEY is not set.');
    process.exit(1);
}

async function main() {
    const gemini = new GoogleGenAI({ apiKey: API_KEY });
    const pager = await gemini.models.list();
    const ids: string[] = [];
    for await (const m of pager) {
        const id = m.name ?? '';
        const actions = m.supportedActions ?? [];
        if (!actions.includes('generateContent')) continue;
        ids.push(id);
    }
    ids.sort();
    console.log(`generateContent-capable models (${ids.length}):`);
    for (const id of ids) console.log(`  ${id}`);

    console.log('\nFlash family only:');
    for (const id of ids.filter(i => i.includes('flash'))) console.log(`  ${id}`);
}

main().catch(e => { console.error(e); process.exit(1); });
