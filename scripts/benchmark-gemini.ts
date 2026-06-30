/**
 * Gemini model benchmark for CulinaryGPT's recipe-generation task.
 *
 * Measures end-to-end latency (mean / median / p95 / stddev / coefficient of
 * variation) and accuracy (schema conformance + rule compliance) for several
 * Gemini model IDs against the same fixed prompt used in production.
 *
 * Run:
 *   npm run bench:gemini
 *   # or
 *   npx ts-node --transpile-only scripts/benchmark-gemini.ts
 *
 * Knobs are constants at the top of this file (MODELS, RUNS, DELAY_MS).
 *
 * NOTE: The prompt and response schema are intentionally inlined (copied from
 * src/utils/prompts&schemas/createRecipe.ts) so this script has zero dependency
 * on the rest of the server, Prisma generation, or env validation.
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenAI, Type, type Schema } from '@google/genai';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error('GEMINI_API_KEY is not set in the environment. Add it to .env.');
    process.exit(1);
}

const gemini = new GoogleGenAI({ apiKey: API_KEY });

// ─── Knobs ───────────────────────────────────────────────────────────────────

const MODELS: string[] = [
    'gemini-2.5-flash-lite',   // current production
    'gemini-2.5-flash',
    'gemini-3-flash-preview',
    'gemini-3.5-flash',        // latest stable flash
    'gemini-3.1-flash-lite',   // newest lite — preview-track
];

const RUNS = 8;          // runs per model — drives latency variance estimate
const DELAY_MS = 250;    // pause between calls to avoid burst throttling

// ─── Fixed prompt input (matches a realistic recipe request) ─────────────────

const USER_INGREDIENTS = [
    'Tomato', 'Garlic', 'Onion', 'Olive Oil', 'Basil',
    'Pasta', 'Parmesan', 'Salt', 'Pepper', 'Chicken Breast',
];

const KITCHEN_UTILS = {
    'Stove Top': true,
    'Oven': true,
    'Microwave': false,
    'Air Fryer': false,
    'Blender': false,
    'Food Processor': false,
    'Slow Cooker': false,
    'BBQ': false,
    'Grill': false,
};

const RECIPE_INPUT = {
    mealSelected: 'dinner' as const,
    selectedTime: 30,
    prompt: 'something Italian',
    numOfPeople: 2,
    recipeTitle: 'Garlic Basil Chicken Pasta',
};

// ─── Inlined prompt + schema (copies of production source) ───────────────────

const RECIPE_PROMPT = `
    Create a recipe for a ${RECIPE_INPUT.recipeTitle} that is suitable for ${RECIPE_INPUT.mealSelected}. The recipe should take no more than ${RECIPE_INPUT.selectedTime} minutes to prepare and cook.

    Available ingredients: ${USER_INGREDIENTS.join(', ')}.
    Available kitchen utilities: ${JSON.stringify(KITCHEN_UTILS)}.
    The recipe should serve ${RECIPE_INPUT.numOfPeople} people.

    Additional instructions: ${RECIPE_INPUT.prompt}.

    **Very Important Rules:**
    1. Do not use any ingredients that are not listed in the available ingredients.
    2. Do not use any kitchen utensils that are not listed in the available kitchen utilities.
`;

const RECIPE_SCHEMA: Schema = {
    type: Type.OBJECT,
    properties: {
        title:       { type: Type.STRING, description: 'Recipe title', nullable: false, minLength: '1' },
        description: { type: Type.STRING, description: 'Recipe description (no more than 120 characters)', nullable: false, minLength: '1', maxLength: '120' },
        ingredients: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: { ingredient: { type: Type.STRING, nullable: false, minLength: '1' } },
                required: ['ingredient'],
            },
            minItems: '1',
        },
        steps: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    step: { type: Type.STRING, nullable: false, minLength: '1' },
                    time: { type: Type.STRING, nullable: false, minLength: '1' },
                },
                required: ['step', 'time'],
            },
            minItems: '1',
        },
        time:  { type: Type.STRING, nullable: false, minLength: '1' },
        level: { type: Type.STRING, enum: ['easy', 'medium', 'hard'], nullable: false },
        type:  { type: Type.STRING, enum: ['recipe'], nullable: false },
    },
    required: ['title', 'description', 'ingredients', 'steps', 'time', 'level', 'type'],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

interface LatencyStats {
    count: number;
    mean: number;
    median: number;
    p95: number;
    min: number;
    max: number;
    stddev: number;
    cov: number;            // coefficient of variation = stddev / mean
}

function summarize(latencies: number[]): LatencyStats | null {
    if (latencies.length === 0) return null;
    const sorted = [...latencies].sort((a, b) => a - b);
    const mean = latencies.reduce((s, x) => s + x, 0) / latencies.length;
    const pick = (q: number) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
    const variance = latencies.reduce((s, x) => s + (x - mean) ** 2, 0) / latencies.length;
    const stddev = Math.sqrt(variance);
    return {
        count: latencies.length,
        mean,
        median: pick(0.5),
        p95: pick(0.95),
        min: sorted[0],
        max: sorted[sorted.length - 1],
        stddev,
        cov: stddev / mean,
    };
}

interface RunResult {
    runIndex: number;
    ms: number;
    ok: boolean;
    error?: string;
    issues: string[];
    payload?: unknown;
}

interface ParsedRecipe {
    title?: string;
    description?: string;
    ingredients?: Array<{ ingredient?: string }>;
    steps?: Array<{ step?: string; time?: string }>;
    time?: string;
    level?: string;
    type?: string;
}

/** Validates a recipe response against schema + business rules. */
function checkRecipe(parsed: ParsedRecipe): string[] {
    const issues: string[] = [];
    if (typeof parsed.title !== 'string' || parsed.title.length === 0) issues.push('missing title');
    if (typeof parsed.description !== 'string' || parsed.description.length === 0) issues.push('missing description');
    if (typeof parsed.description === 'string' && parsed.description.length > 120) issues.push('description>120');
    if (!Array.isArray(parsed.ingredients) || parsed.ingredients.length < 1) issues.push('missing ingredients');
    if (!Array.isArray(parsed.steps) || parsed.steps.length < 1) issues.push('missing steps');
    if (typeof parsed.time !== 'string' || parsed.time.length === 0) issues.push('missing time');
    if (!['easy', 'medium', 'hard'].includes(parsed.level ?? '')) issues.push('bad level enum');
    if (parsed.type !== 'recipe') issues.push('bad type enum');

    // Rule 1: every listed ingredient should reference at least one allowed ingredient (case-insensitive substring).
    if (Array.isArray(parsed.ingredients)) {
        const allowed = USER_INGREDIENTS.map(s => s.toLowerCase());
        const forbidden = parsed.ingredients.filter(it => {
            const text = String(it?.ingredient ?? '').toLowerCase();
            return !allowed.some(a => text.includes(a));
        });
        if (forbidden.length > 0) {
            issues.push(`forbidden-ingredients:${forbidden.length}/${parsed.ingredients.length}`);
        }
    }

    return issues;
}

async function runOnce(model: string, runIndex: number): Promise<RunResult> {
    const t0 = Date.now();
    try {
        const response = await gemini.models.generateContent({
            model,
            contents: RECIPE_PROMPT,
            config: { responseMimeType: 'application/json', responseSchema: RECIPE_SCHEMA },
        });
        const ms = Date.now() - t0;
        const text = response.text;
        if (!text) {
            return { runIndex, ms, ok: false, error: 'empty response text', issues: [] };
        }
        let parsed: ParsedRecipe;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            return { runIndex, ms, ok: false, error: `json parse: ${(e as Error).message}`, issues: [] };
        }
        const issues = checkRecipe(parsed);
        return {
            runIndex,
            ms,
            ok: issues.length === 0,
            error: issues.length ? issues.join(',') : undefined,
            issues,
            payload: parsed,
        };
    } catch (e) {
        const ms = Date.now() - t0;
        const msg = (e as Error)?.message ?? String(e);
        return { runIndex, ms, ok: false, error: msg, issues: ['api-error'] };
    }
}

function fmt(n: number, digits = 0): string {
    return n.toFixed(digits).padStart(7);
}

function pad(s: string, w: number): string {
    return s.length >= w ? s : s + ' '.repeat(w - s.length);
}

interface ModelSummary {
    model: string;
    runs: number;
    passed: number;
    accuracyPct: number;
    issueTally: Record<string, number>;
    latency: LatencyStats | null;
}

async function main() {
    console.log(`Benchmarking ${MODELS.length} model(s), ${RUNS} run(s) each, ${DELAY_MS}ms gap.\n`);

    const allResults: Record<string, RunResult[]> = {};

    for (const model of MODELS) {
        console.log(`\n=== ${model} ===`);
        const results: RunResult[] = [];
        for (let i = 0; i < RUNS; i++) {
            process.stdout.write(`  run ${i + 1}/${RUNS}... `);
            const r = await runOnce(model, i);
            console.log(`${r.ms}ms ${r.ok ? 'ok' : `FAIL(${r.error})`}`);
            results.push(r);
            if (i < RUNS - 1) await sleep(DELAY_MS);
        }
        allResults[model] = results;
    }

    // Summary table
    const summaries: ModelSummary[] = MODELS.map(model => {
        const results = allResults[model];
        const oks = results.filter(r => r.ok);
        const lats = oks.map(r => r.ms);
        const issueTally: Record<string, number> = {};
        for (const r of results) {
            for (const iss of r.issues) {
                const key = iss.split(':')[0];
                issueTally[key] = (issueTally[key] || 0) + 1;
            }
        }
        return {
            model,
            runs: results.length,
            passed: oks.length,
            accuracyPct: results.length ? (oks.length / results.length) * 100 : 0,
            issueTally,
            latency: summarize(lats),
        };
    });

    console.log('\n\n═══ Recipe-task summary ════════════════════════════════════════════════════════════════');
    const header = [
        pad('model', 28),
        'pass'.padStart(8),
        'mean'.padStart(8),
        ' p50'.padStart(7),
        ' p95'.padStart(7),
        ' min'.padStart(7),
        ' max'.padStart(7),
        'stddev'.padStart(8),
        '  CoV'.padStart(8),
    ].join(' │ ');
    console.log(header);
    console.log('─'.repeat(header.length));
    for (const s of summaries) {
        if (!s.latency) {
            console.log(`${pad(s.model, 28)} │ ${pad(`${s.passed}/${s.runs}`, 8)} │  (all failed — see logs above)`);
            continue;
        }
        const L = s.latency;
        console.log([
            pad(s.model, 28),
            `${s.passed}/${s.runs}`.padStart(8),
            fmt(L.mean),
            fmt(L.median),
            fmt(L.p95),
            fmt(L.min),
            fmt(L.max),
            fmt(L.stddev),
            `${(L.cov * 100).toFixed(1)}%`.padStart(8),
        ].join(' │ '));
    }
    console.log('(all latencies in ms. CoV = stddev/mean — lower = more consistent.)');

    // Issue breakdown (only print if any model had issues)
    const hadIssues = summaries.some(s => Object.keys(s.issueTally).length > 0);
    if (hadIssues) {
        console.log('\nAccuracy issue tallies:');
        for (const s of summaries) {
            if (Object.keys(s.issueTally).length === 0) continue;
            const parts = Object.entries(s.issueTally).map(([k, v]) => `${k}=${v}`).join(', ');
            console.log(`  ${s.model}: ${parts}`);
        }
    }

    // Persist report
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const outDir = path.join(import.meta.dirname, 'results');
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `benchmark-${ts}.json`);
    fs.writeFileSync(outPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        config: { models: MODELS, runs: RUNS, delayMs: DELAY_MS },
        input: { userIngredients: USER_INGREDIENTS, kitchenUtils: KITCHEN_UTILS, recipeInput: RECIPE_INPUT },
        summaries,
        rawResults: allResults,
    }, null, 2));
    console.log(`\nFull report: ${outPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
