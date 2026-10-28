import { spawn } from "node:child_process";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { createRequire } from "node:module";
import { runLowPolyBuilderLoop, type LowPolyBuilderTurn } from "/tmp2/nilo-n1/packages/low-poly-builder/src/builderLoop.ts";
import {
  appendLowPolyOutputBudget,
  buildLowPolyCritiqueSystemPrompt,
  buildLowPolyDesignSystemPrompt,
  buildLowPolySystemPrompt,
} from "/tmp2/nilo-n1/packages/low-poly-builder/src/instructionPack.ts";
import { lowPolyMaxOutputTokens } from "/tmp2/nilo-n1/packages/firebase-schema/src/functions/lowPoly.ts";
const { chromium } = createRequire("/tmp2/nilo-n1/package.json")("playwright") as { chromium: any };
type Page = any;

const ROOT = "/home/cx/noodlespace/agentic-3js-builder";
const OUT = join(ROOT, process.env.N1_OUT ?? "scratch/n1");
const PUB = join(homedir(), process.env.N1_PUB ?? "tmp/public/nilo/agentic-3js-builder/n1");
const MODEL_DEFAULT = process.env.N1_MODEL ?? "google-antigravity/gemini-3.8-flash";
const EFFORT_DEFAULT = process.env.N1_EFFORT ?? "medium";
const TARGETS = ["accordion", "alebrije", "alienFlora", "arcadeCabinet", "arcticOutpost", "axolotl", "babaYagaHut", "baku", "bauhausBird", "blueprintSpitfire", "brutalistBlock", "calderMobile", "cardboardRobot", "dutchWindmill", "dwarfBlacksmith", "gargoyle", "gunblade", "hydra", "spaceGalley", "strandbeest"];

type Reply = { id: number; status: number; body: any };
type Gateway = { send(path: string, body: unknown): Promise<Reply>; close(): void };
type Pricing = { input: number; output: number; cacheRead: number; cacheWrite: number };

function gateway(): Gateway {
  const child = spawn("/home/cx/.local/bin/omp", ["auth-gateway", "stdio"], { stdio: ["pipe", "pipe", "pipe"] });
  const waiting = new Map<number, (r: Reply) => void>(); let next = 1; let buffer = ""; let stderr = ""; let ready!: () => void;
  const isReady = new Promise<void>(r => ready = r); child.stdout.setEncoding("utf8"); child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk: string) => { buffer += chunk; let i; while ((i = buffer.indexOf("\n")) >= 0) { const line = buffer.slice(0, i).trim(); buffer = buffer.slice(i + 1); if (!line) continue; const m = JSON.parse(line); if (m.ready) ready(); else waiting.get(m.id)?.(m); waiting.delete(m.id); } });
  child.stderr.on("data", (chunk: string) => stderr = (stderr + chunk).slice(-4000));
  child.on("exit", code => { for (const r of waiting.values()) r({ id: 0, status: 599, body: { error: `gateway exited ${code}: ${stderr}` } }); });
  return { async send(path, body) { await isReady; const id = next++; return new Promise(resolve => { waiting.set(id, resolve); child.stdin.write(`${JSON.stringify({ id, path, body })}\n`); }); }, close() { child.stdin.end(); } };
}

function dataUrlParts(message: any) {
  const parts: any[] = [{ type: "text", text: message.content }];
  const captions = message.imageCaptions ?? [];
  for (let i = 0; i < (message.images ?? []).length; i++) {
    if (captions[i] !== undefined) parts.push({ type: "text", text: captions[i] });
    parts.push({ type: "image_url", image_url: { url: message.images[i], detail: "high" } });
  }
  if (message.referenceImage) parts.push({ type: "text", text: "REFERENCE IMAGE: this is the last image; make a low-poly approximation of it." }, { type: "image_url", image_url: { url: message.referenceImage, detail: "high" } });
  return parts.length === 1 ? message.content : parts;
}
function systemFor(role: string) {
  const cap = role === "design" ? lowPolyMaxOutputTokens("design", undefined, "generate") : role === "critique" ? lowPolyMaxOutputTokens("critique", undefined, "generate") : lowPolyMaxOutputTokens("build", undefined, "generate");
  const prompt = role === "design" ? buildLowPolyDesignSystemPrompt("prop") : role === "critique" ? buildLowPolyCritiqueSystemPrompt("prop") : buildLowPolySystemPrompt("prop", "generate");
  return { prompt: appendLowPolyOutputBudget(prompt, cap), cap };
}
async function pricing(model: string): Promise<Pricing> {
  const text = await new Promise<string>((resolve, reject) => { const p = spawn("/home/cx/.local/bin/omp", ["models", "--json"]); let b = ""; p.stdout.on("data", x => b += x); p.on("close", c => c ? reject(new Error(`models exit ${c}`)) : resolve(b)); });
  const models = JSON.parse(text).models ?? JSON.parse(text); const found = models.find((m: any) => m.selector === model); if (!found?.cost) throw new Error(`No list pricing for ${model}`); return found.cost;
}
function costOf(usage: any, rates: Pricing | undefined) { if (!usage || !rates) return null; const cached = usage.prompt_tokens_details?.cached_tokens ?? 0; return ((usage.prompt_tokens - cached) * rates.input + cached * rates.cacheRead + usage.completion_tokens * rates.output) / 1e6; }
function reasoningTokens(usage: any) { return usage?.completion_tokens_details?.reasoning_tokens ?? usage?.reasoning_tokens ?? null; }
async function ask(gw: Gateway, turn: LowPolyBuilderTurn, model: string, rates: Pricing, role: string, effort: string) {
  const { prompt, cap } = systemFor(role);
  const body: any = { model, reasoning_effort: effort, max_tokens: cap, messages: [{ role: "system", content: prompt }, ...turn.messages.map(m => ({ role: m.role, content: dataUrlParts(m) }))] };
  if (!model.startsWith("anthropic/")) body.temperature = role === "critique" ? 0.3 : 0.7;
  const started = Date.now(); let reply: Reply | undefined;
  for (let attempt = 1; attempt <= 3; attempt++) { reply = await gw.send("/v1/chat/completions", body); if (reply.status === 200 || ![429, 500, 502, 503, 529, 599].includes(reply.status)) break; await new Promise(r => setTimeout(r, 20_000 * attempt)); }
  const usage = reply?.body?.usage ?? null; const message = reply?.body?.choices?.[0]?.message; const text = message?.content ?? "";
  return { text, call: { role, patchRepair: turn.patchRepair ?? false, latencyMs: Date.now() - started, status: reply?.status ?? null, finishReason: reply?.body?.choices?.[0]?.finish_reason ?? null, usage, reasoningTokens: reasoningTokens(usage), costUsd: costOf(usage, rates), request: { reasoning_effort: effort, ...(body.temperature === undefined ? {} : { temperature: body.temperature }), max_tokens: cap, imageParts: turn.messages.reduce((n, m) => n + (m.images?.length ?? 0) + (m.referenceImage ? 1 : 0), 0), imageDetail: "high", includeThoughtText: true }, error: reply?.status === 200 ? null : JSON.stringify(reply?.body).slice(0, 1000) } };
}
function saveShots(id: string, runNo: number, shots: string[]) {
  const dir = join(PUB, "renders", id, `run-${runNo}`); mkdirSync(dir, { recursive: true });
  return shots.map((data, i) => { const m = data.match(/^data:image\/png;base64,(.*)$/); const file = join(dir, `view-${i + 1}.png`); if (m) writeFileSync(file, Buffer.from(m[1], "base64")); return `renders/${id}/run-${runNo}/view-${i + 1}.png`; });
}
async function runOne(page: Page, subject: any, model: string, rates: Pricing, effort: string) {
  const id = subject.id; const description = subject.rich; const startedAt = Date.now(); const calls: any[] = []; const sandboxRuns: any[] = []; let firstValidMs: number | null = null; let buildNo = 0;
  const gw = gateway();
  try {
    const result = await runLowPolyBuilderLoop({ scope: "prop", description, contextMode: "latest", critique: true, mergeRenders: false, maxCritiqueRounds: 2,
      generate: async (turn) => { const out = await ask(gw, turn, model, rates, turn.role, effort); calls.push({ ...out.call, round: turn.role === "build" ? calls.filter(c => c.role === "build").length + 1 : calls.filter(c => c.role === turn.role).length + 1 }); return out.text; },
      run: async (code) => { const runStart = Date.now(); const raw: any = await page.evaluate(async (args) => (window as any).__n1Run(args), { code, description, scope: "prop", mergeRenders: false }); const wallMs = Date.now() - runStart; const entry: any = { wallMs, ok: raw.ok, error: raw.ok ? null : raw.error }; if (raw.ok) { entry.stats = raw.stats; entry.warnings = raw.warnings; entry.screenshots = saveShots(id, ++buildNo, raw.screenshots); entry.glbBytes = Math.floor((raw.glbBase64?.length ?? 0) * 3 / 4); entry.rawGlbBase64 = raw.glbBase64; } sandboxRuns.push(entry); if (!raw.ok) return { ok: false, error: raw.error }; const bytes = Buffer.from(raw.glbBase64, "base64"); const glb = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength); return { ok: true, glb, stats: raw.stats, screenshots: raw.screenshots, manifest: raw.manifest, warnings: raw.warnings }; },
      onBuild: () => { if (firstValidMs === null) firstValidMs = Date.now() - startedAt; },
    });
    const finalRun = sandboxRuns.filter(r => r.ok).at(-1); const draftRun = sandboxRuns.find(r => r.ok); const allCost = calls.reduce((s, c) => s + (c.costUsd ?? 0), 0);
    return { id, description, ok: result.ok, wallMs: Date.now() - startedAt, firstValidMs, calls, callCount: calls.length, patchRepairs: calls.filter(c => c.patchRepair).length, sandboxRuns: sandboxRuns.map(r => { const { rawGlbBase64, ...x } = r; return x; }), runFailures: sandboxRuns.filter(r => !r.ok).length, validationFailures: result.ok ? (result.attempts?.filter(a => a.errors?.length).length ?? 0) : (result.attempts?.filter(a => a.errors?.length).length ?? 0), critique: result.ok ? result.critique : "failed", critiqueTurns: result.critiques ?? [], final: result.ok && finalRun ? { triangles: result.stats.totalTriangles, glbBytes: finalRun.glbBytes, warnings: result.warnings, renderPaths: finalRun.screenshots, draftRenderPaths: draftRun?.screenshots ?? [], draftDiffers: sandboxRuns.filter(r => r.ok).length > 1, bounds: { min: result.stats.sceneBoundsMin, max: result.stats.sceneBoundsMax } } : null, costUsd: allCost, startedAt: new Date(startedAt).toISOString(), endedAt: new Date().toISOString(), model, effort, quality: 2, scope: "prop", contextMode: "latest", mergeRenders: false };
  } catch (error) { return { id, description, ok: false, wallMs: Date.now() - startedAt, firstValidMs, calls, callCount: calls.length, patchRepairs: calls.filter(c => c.patchRepair).length, sandboxRuns, runFailures: sandboxRuns.filter(r => !r.ok).length, validationFailures: 0, critique: "failed", critiqueTurns: [], final: null, costUsd: calls.reduce((s, c) => s + (c.costUsd ?? 0), 0), error: String(error), startedAt: new Date(startedAt).toISOString(), endedAt: new Date().toISOString(), model, effort, quality: 2, scope: "prop", contextMode: "latest", mergeRenders: false }; }
  finally { gw.close(); }
}
async function main() {
  const requested = process.argv.slice(3); const model = process.argv[2] ?? MODEL_DEFAULT; const effort = process.env.N1_EFFORT ?? EFFORT_DEFAULT; const batchStartedAt = new Date().toISOString(); mkdirSync(OUT, { recursive: true }); mkdirSync(PUB, { recursive: true }); mkdirSync(join(PUB, "renders"), { recursive: true });
  const pitches = JSON.parse(readFileSync(join(ROOT, "bakeoff/pitches-r24.json"), "utf8")).subjects; const subjects = TARGETS.filter(id => requested.length === 0 || requested.includes(id)).map(id => pitches.find((s: any) => s.id === id)).filter(Boolean); const rates = await pricing(model);
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9333"); const context = browser.contexts()[0]; const pages = await Promise.all(Array.from({ length: 6 }, async () => { const p = await context.newPage(); await p.goto("http://127.0.0.1:18123/runner.html"); await p.evaluate(() => (window as any).__n1Ready()); return p; }));
  const queue = [...subjects]; const results: any[] = []; let done = 0; await Promise.all(pages.map(async page => { while (queue.length) { const subject = queue.shift(); if (!subject) break; const r = await runOne(page, subject, model, rates, effort); results.push(r); writeFileSync(join(OUT, "progress.json"), JSON.stringify(results, null, 2)); console.log(`[${++done}/${subjects.length}] ${subject.id}: ${r.ok ? "ok" : "failed"}, ${r.wallMs}ms, ${r.callCount} calls, $${(r.costUsd ?? 0).toFixed(4)}`); } }));
  for (const p of pages) await p.close(); await browser.close(); const out = { experiment: `N1-${effort}`, generatedAt: new Date().toISOString(), batchStartedAt, batchEndedAt: new Date().toISOString(), model, modelPricing: rates, pricingSource: "~/.local/bin/omp models --json", harness: "Nilo low-poly sandbox harness, three 0.186.1, built in /tmp2/nilo-n1", settings: { quality: 2, scope: "prop", contextMode: "latest", critique: true, mergeRenders: false, reasoning: effort, temperatures: model.startsWith("anthropic/") ? undefined : { design: 0.7, build: 0.7, critique: 0.3 }, providerOptions: { includeThoughtText: true, visionDetail: "high" }, outputTokens: { design: 8000, build: 64000, critique: 4000 }, gateway: true, retries: 3, maxCritiqueRounds: 2 }, subjects: results.sort((a,b)=>TARGETS.indexOf(a.id)-TARGETS.indexOf(b.id)) };
  writeFileSync(join(OUT, "results.json"), JSON.stringify(out, null, 2)); writeFileSync(join(PUB, "results.json"), JSON.stringify(out, null, 2));
}
main().catch(error => { console.error(error); process.exit(1); });
