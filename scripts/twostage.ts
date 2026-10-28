// Two-stage build with requests. Stage 1 is one call on a flat-colour arm's system prompt plus a stage-1 prompt: the
// whole model's shape in flat colours, a module that renders on its own (the first pixel) and exports a request list,
// details to add and textures to paint, each tied to a part and a place, plus a `STAGE2` hook its build function
// runs. Stage 2 starts the moment stage 1's reply arrives, all calls at once on the arm's own system prompt: the add
// requests in up to `maxAddCalls` calls, each returning one function appended to the module's `STAGE2` list, and the
// texture requests in one SEARCH/REPLACE edit call on stage 1's code. The runner merges the edits and the appended
// functions into the final module.
//
//   npx tsx scripts/twostage.ts run <round> --arm-set arms-r33two.json [--arms twostage] [--model …] [--effort low]
//     [--max-tokens 120000] [--pitches pitches-r26.json] [--subjects x,y] [--levels rich] [--concurrency 5]
//   npx tsx scripts/twostage.ts warm --arm-set arms-r33two.json [--arms a,b] [--model …]
//
// `run` builds the arms with a `twostage: { stage1Arm, stage1, add, texture, maxAddCalls? }` field; other arms of the
// set run through `npm run bakeoff -- run` at the same moment. Each build writes two builds and run records:
// `<…>Twostage1` (stage 1 alone, arm `twostage1`, the flat arm's system prompt) and `<…>Twostage` (the final module,
// arm `twostage`, the arm's system prompt), so `check`, `refine --repair-only` and `results` work on both.
// `warm` sends one tiny call per distinct system prompt of the chosen arms, so a batch launched together reads the
// prompt cache instead of each first call writing it.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  applyEdits,
  ask,
  capture,
  extractCode,
  gateway,
  mergeImports,
  pool,
  pricing,
  results,
  systemPrompt,
  wireImports,
  type Asked,
  type Gateway,
  type Pricing,
} from "./bakeoff";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BAKEOFF = join(ROOT, "bakeoff");
const SDK_NAME = "agentic-3js-builder";

type Arm = Parameters<typeof systemPrompt>[0] & {
  id: string;
  twostage?: { stage1Arm: string; stage1: string; add: string; texture: string; maxAddCalls?: number };
};
type Subject = { id: string; terse: string; rich: string };
type Vec = [number, number, number];
type Request = {
  id: string;
  kind: "add" | "texture";
  part?: string;
  what?: string;
  at?: Vec;
  normal?: Vec;
  bone?: string | null;
  room?: Vec;
};

const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, "utf8"));
const writeJson = (path: string, data: unknown) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
};
const option = (args: string[], name: string, fallback: string) =>
  args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : fallback;
const list = (value: string) => (value ? value.split(",").map((item) => item.trim()) : []);
const cap = (word: string) => word[0].toUpperCase() + word.slice(1);
const camel = (first: string, ...rest: string[]) => first + rest.map(cap).join("");

// ---------------------------------------------------------------------------------------------------------------
// Stage 1's request list

/** The `REQUESTS` array literal of a module: its text from the opening bracket to the matching closing one. */
function requestsLiteral(code: string) {
  const at = code.search(/export\s+const\s+REQUESTS\b/);
  if (at < 0) return null;
  const open = code.indexOf("[", code.indexOf("=", at));
  if (open < 0) return null;
  let depth = 0;
  let quote: string | null = null;
  for (let i = open; i < code.length; i++) {
    const ch = code[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === "/" && code[i + 1] === "/") i = code.indexOf("\n", i);
    else if (ch === "[" || ch === "{") depth++;
    else if ((ch === "]" || ch === "}") && --depth === 0) return code.slice(open, i + 1);
  }
  return null;
}

/** The request list: the literal evaluated as plain data, else the module imported (for a list built from names). */
async function readRequests(code: string, buildFile: string): Promise<{ requests: unknown; source: string }> {
  const literal = requestsLiteral(code);
  if (literal)
    try {
      return { requests: new Function(`return (${literal.replace(/\s+as\s+const\b/g, "")});`)(), source: "literal" };
    } catch {
      // names or TypeScript inside the literal: import the module instead
    }
  const tsx = join(ROOT, "node_modules/.bin/tsx");
  const url = JSON.stringify(pathToFileURL(buildFile).href);
  const out = await capture(tsx, ["-e", `import(${url}).then((m) => console.log(JSON.stringify(m.REQUESTS ?? null)))`]);
  const line = out.stdout.trim().split("\n").at(-1) ?? "null";
  return { requests: JSON.parse(line.startsWith("[") || line === "null" ? line : "null"), source: "import" };
}

/** Requests with unique alphanumeric ids and a kind of add or texture. */
function normalise(raw: unknown): Request[] {
  if (!Array.isArray(raw)) throw new Error("REQUESTS is not an array");
  const seen = new Set<string>();
  return raw.map((entry: unknown, i) => {
    const fields = (entry && typeof entry === "object" ? entry : {}) as Record<string, unknown>;
    let id = String(fields.id ?? "").replace(/[^A-Za-z0-9]/g, "") || `request${i + 1}`;
    if (!/^[A-Za-z]/.test(id)) id = `r${id}`;
    while (seen.has(id)) id += i + 1;
    seen.add(id);
    const kind = /tex|paint/i.test(String(fields.kind ?? "")) ? "texture" : "add";
    return { ...fields, id, kind } as Request;
  });
}

/** Add requests split into at most `calls` groups of neighbours in list order, as even as they go. */
function groups<T>(items: T[], calls: number) {
  const n = Math.min(items.length, calls);
  return Array.from({ length: n }, (_, g) =>
    items.slice(Math.floor((g * items.length) / n), Math.floor(((g + 1) * items.length) / n)),
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Merge

const FN = /export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)|export\s+const\s+([A-Za-z_$][\w$]*)/;

/** The final module: stage 1 with the texture edits applied (or the texture call's whole module), imports merged
 *  with the add functions', and each add function in its own scope pushed onto `STAGE2`. A stage 1 without the hook
 *  gets it: the list after the imports, the loop before the build function's last `return <builder>.root;`. */
function merge(stage1: string, textureText: string | null, adds: { id: string; code: string | null }[]) {
  let base = stage1;
  let edits: { blocks: number; failed: string[]; wholeModule: boolean } | null = null;
  if (textureText) {
    const edited = applyEdits(stage1, textureText);
    const whole = edited.blocks ? null : extractCode(textureText);
    base = whole ?? edited.code;
    edits = { blocks: edited.blocks, failed: edited.failed, wholeModule: Boolean(whole) };
  }
  const named = adds.flatMap(({ id, code }) => {
    const fn = code?.match(FN);
    const name = fn?.[1] ?? fn?.[2] ?? code?.match(/function\s+([A-Za-z_$][\w$]*)/)?.[1];
    return code && name ? [{ id, code, name }] : [];
  });
  const { importLines, bodies } = mergeImports(
    [base, ...named.map((n) => n.code)],
    [{ from: SDK_NAME, item: "Builder", typeOnly: true }],
  );
  let body = bodies[0].trim();
  const hookInserted = !/\bSTAGE2\b/.test(body);
  if (hookInserted) {
    const returns = [...body.matchAll(/return\s+([A-Za-z_$][\w$]*)\.root\s*;/g)];
    const last = returns.at(-1);
    if (last)
      body = body.slice(0, last.index) + `for (const add of STAGE2) add(${last[1]});\n  ` + body.slice(last.index);
    body = `export const STAGE2: ((b: Builder) => void)[] = [];\n\n${body}`;
  }
  const appended = named.map(({ id, name }, i) => {
    const fnBody = bodies[i + 1].replace(/^export\s+(?=(?:async\s+)?function|const|let|class)/gm, "").trim();
    return `// ${id}\nSTAGE2.push(\n  (() => {\n${fnBody}\n    return ${name};\n  })(),\n);`;
  });
  const module = [
    ...importLines,
    "",
    body,
    "",
    "// ---------------------------------------------------------------------------------------------------------------",
    "// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().",
    "",
    ...appended,
    "",
  ].join("\n");
  return {
    module,
    edits,
    hookInserted,
    missing: adds.filter((a) => !named.some((n) => n.id === a.id)).map((a) => a.id),
  };
}

// ---------------------------------------------------------------------------------------------------------------
// One build

type Call = {
  id: string;
  started: string;
  wallMs: number;
  status: number | null;
  error: string | null;
  finishReason: string | null;
  usage: Asked["usage"];
  costUsd: number | null;
  hasCode: boolean;
  requests?: string[];
  text: string;
  reasoning: string | null;
};

async function twoStageBuild(o: {
  gw: Gateway;
  cost: Pricing;
  dir: string;
  arm: Arm;
  subject: Subject;
  level: "terse" | "rich";
  slug: string;
  model: string;
  effort: string;
  maxTokens: number;
}) {
  const { gw, cost, dir, arm, subject, level, slug, model, effort, maxTokens } = o;
  const spec = arm.twostage!;
  const slug1 = `${slug}1`;
  const pitch = subject[level];
  const prompt = (file: string) => readFileSync(join(dir, "prompts", file), "utf8").trim();
  const system1 = readFileSync(join(dir, "prompts", `${arm.id}1.md`), "utf8");
  const system2 = readFileSync(join(dir, "prompts", `${arm.id}.md`), "utf8");
  const body = (messages: unknown[]) => ({ model, reasoning_effort: effort, max_tokens: maxTokens, messages });
  const call = (id: string, asked: Asked, hasCode: boolean, requests?: string[]): Call => ({
    id,
    started: new Date(asked.started).toISOString(),
    wallMs: asked.wallMs,
    status: asked.reply?.status ?? null,
    error: asked.reply?.status === 200 ? null : JSON.stringify(asked.reply?.body).slice(0, 2000),
    finishReason: asked.reply?.body?.choices?.[0]?.finish_reason ?? null,
    usage: asked.usage,
    costUsd: asked.costUsd,
    hasCode,
    ...(requests ? { requests } : {}),
    text: asked.text,
    reasoning: asked.message?.reasoning_content ?? null,
  });
  const record = (asked: Asked) => ({
    subject: subject.id,
    level,
    pitch,
    model,
    effort,
    started: new Date(asked.started).toISOString(),
  });

  // Stage 1: the whole shape in flat colours, with the request list; written and recorded on its own.
  const first = await ask(
    gw,
    body([
      { role: "system", content: system1 },
      { role: "user", content: `${pitch}\n\n${prompt(spec.stage1)}` },
    ]),
    cost,
  );
  const stage1 = first.text ? extractCode(first.text) : null;
  const file1 = join(dir, "builds", `${slug1}.ts`);
  if (stage1) {
    mkdirSync(dirname(file1), { recursive: true });
    writeFileSync(file1, wireImports(stage1, file1));
  }
  writeJson(join(dir, "runs", `${slug1}.json`), {
    slug: slug1,
    arm: `${arm.id}1`,
    ...record(first),
    wallMs: first.wallMs,
    status: first.reply?.status ?? null,
    error: first.reply?.status === 200 ? null : JSON.stringify(first.reply?.body).slice(0, 2000),
    finishReason: first.reply?.body?.choices?.[0]?.finish_reason ?? null,
    usage: first.usage,
    costUsd: first.costUsd,
    hasCode: Boolean(stage1),
    reasoning: first.message?.reasoning_content ?? null,
    stage: 1,
    finalSlug: slug,
  });
  writeFileSync(join(dir, "runs", `${slug1}.md`), first.text);

  // The request list, then every stage-2 call at once.
  let requests: Request[] = [];
  let requestsError: string | null = null;
  let requestsSource: string | null = null;
  if (stage1)
    try {
      const read = await readRequests(stage1, file1);
      requestsSource = read.source;
      requests = normalise(read.requests);
    } catch (error) {
      requestsError = String(error);
    }
  else requestsError = "stage 1 returned no code";
  const adds = requests.filter((r) => r.kind === "add");
  const textures = requests.filter((r) => r.kind === "texture");
  const addGroups = groups(adds, spec.maxAddCalls ?? 6);
  const shared = [
    { role: "system", content: system2 },
    { role: "user", content: pitch },
    { role: "assistant", content: `\`\`\`ts\n${(stage1 ?? "").trimEnd()}\n\`\`\`` },
  ];
  const calls: Call[] = [call("stage1", first, Boolean(stage1))];
  const stage2Started = Date.now();
  const budget = String(Math.floor(500 / Math.max(1, addGroups.length)));
  const triangles = String(Math.floor(30_000 / Math.max(1, addGroups.length) / 500) * 500);
  const [addResults, textureResult] = await Promise.all([
    Promise.all(
      addGroups.map(async (group, g) => {
        const id = `add${g + 1}`;
        const fn = `add${cap(group[0].id)}`;
        const values: Record<string, string> = {
          requests: JSON.stringify(group, null, 2),
          fn,
          prefix: `s2${g + 1}`,
          budget,
          triangles,
        };
        const text = prompt(spec.add).replace(/\{(\w+)\}/g, (whole: string, key: string) => values[key] ?? whole);
        const asked = await ask(gw, body([...shared, { role: "user", content: text }]), cost);
        const code = asked.text ? extractCode(asked.text) : null;
        calls.push(
          call(
            id,
            asked,
            Boolean(code),
            group.map((r) => r.id),
          ),
        );
        return { id, code, wallMs: asked.wallMs };
      }),
    ),
    textures.length
      ? (async () => {
          const values: Record<string, string> = { requests: JSON.stringify(textures, null, 2) };
          const text = `${prompt(spec.texture).replace(/\{(\w+)\}/g, (whole: string, key: string) => values[key] ?? whole)}\n\n${prompt("refine-edits.md")}`;
          const asked = await ask(gw, body([...shared, { role: "user", content: text }]), cost);
          calls.push(
            call(
              "texture",
              asked,
              true,
              textures.map((r) => r.id),
            ),
          );
          return { text: asked.text, wallMs: asked.wallMs };
        })()
      : Promise.resolve(null),
  ]);
  const stage2Elapsed = stage1 && (addGroups.length || textures.length) ? Date.now() - stage2Started : 0;
  const stage2Calls = calls.filter((c) => c.id !== "stage1");
  const slowest = stage2Calls.reduce<Call | null>((a, c) => (!a || c.wallMs > a.wallMs ? c : a), null);
  const merged = stage1 ? merge(stage1, textureResult?.text ?? null, addResults) : null;
  const file = join(dir, "builds", `${slug}.ts`);
  if (merged) writeFileSync(file, wireImports(merged.module, file));

  const order = ["stage1", "texture", ...addGroups.map((_, g) => `add${g + 1}`)];
  calls.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  const sum = (get: (c: (typeof calls)[number]) => number | undefined) =>
    calls.reduce((total, c) => total + (get(c) ?? 0), 0);
  const usage = {
    prompt_tokens: sum((c) => c.usage?.prompt_tokens),
    completion_tokens: sum((c) => c.usage?.completion_tokens),
    total_tokens: sum((c) => c.usage?.total_tokens),
    prompt_tokens_details: { cached_tokens: sum((c) => c.usage?.prompt_tokens_details?.cached_tokens) },
  };
  const costUsd = calls.every((c) => c.costUsd != null) ? sum((c) => c.costUsd!) : null;
  const failed = calls.find((c) => c.status !== 200);
  const wallMs = first.wallMs + (slowest?.wallMs ?? 0);
  writeJson(join(dir, "runs", `${slug}.json`), {
    slug,
    arm: arm.id,
    ...record(first),
    wallMs,
    status: failed ? failed.status : 200,
    error: failed ? `${failed.id}: ${failed.error}` : requestsError,
    finishReason: calls.every((c) => c.finishReason === "stop") ? "stop" : calls.map((c) => c.finishReason).join(","),
    usage,
    costUsd,
    hasCode: Boolean(merged),
    reasoning: null,
    twostage: {
      stage1Slug: slug1,
      stage1Ms: first.wallMs,
      stage2Ms: slowest?.wallMs ?? 0,
      critical: slowest?.id ?? null,
      stage2ElapsedMs: stage2Elapsed,
      elapsedMs: Date.now() - first.started,
      requestsSource,
      requestsError,
      requests,
      addCalls: addGroups.map((group, g) => ({ id: `add${g + 1}`, requests: group.map((r) => r.id) })),
      textureRequests: textures.map((r) => r.id),
      edits: merged?.edits ?? null,
      hookInserted: merged?.hookInserted ?? null,
      missingAdds: merged?.missing ?? [],
      calls: calls.map(({ text: _text, ...rest }) => rest),
    },
  });
  writeFileSync(join(dir, "runs", `${slug}.md`), calls.map((c) => `<!-- call: ${c.id} -->\n\n${c.text}`).join("\n\n"));
  const times = stage2Calls.map((c) => `${c.id} ${(c.wallMs / 1000).toFixed(0)}`).join(", ");
  return (
    `${failed ? failed.status : 200} ${merged ? "code" : `NO CODE (${requestsError})`}, ` +
    `${adds.length} add / ${textures.length} texture requests` +
    `${merged?.missing.length ? ` MISSING ${merged.missing.join(",")}` : ""}${merged?.edits?.failed.length ? ` EDITS FAILED ${merged.edits.failed.length}/${merged.edits.blocks}` : ""}, ` +
    `stage 1 ${(first.wallMs / 1000).toFixed(0)} s + [${times}] → ${(wallMs / 1000).toFixed(0)} s, ` +
    `${usage.completion_tokens} out${costUsd != null ? `, $${costUsd.toFixed(3)}` : ""}`
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Commands

function armSet(args: string[]) {
  return readJson<{ arms: Arm[] }>(join(BAKEOFF, option(args, "arm-set", "arms.json"))).arms;
}

async function run(round: string, args: string[]) {
  if (!/^[A-Za-z0-9]+$/.test(round)) throw new Error(`Round id "${round}" must be letters and digits.`);
  const dir = join(BAKEOFF, "rounds", round);
  const model = option(args, "model", "anthropic/claude-sonnet-5-5");
  const effort = option(args, "effort", "medium");
  const maxTokens = Number(option(args, "max-tokens", "64000"));
  const concurrency = Number(option(args, "concurrency", "5"));
  const all = armSet(args);
  const armIds = list(option(args, "arms", ""));
  const twoArms = all.filter((a) => a.twostage && (!armIds.length || armIds.includes(a.id)));
  const subjectIds = list(option(args, "subjects", ""));
  const levels = list(option(args, "levels", "terse,rich")) as ("terse" | "rich")[];
  const subjects = readJson<{ subjects: Subject[] }>(join(BAKEOFF, option(args, "pitches", "pitches.json"))).subjects;
  const todo = subjects
    .filter((s) => !subjectIds.length || subjectIds.includes(s.id))
    .flatMap((subject) =>
      levels.flatMap((level) =>
        twoArms.map((arm) => ({ arm, subject, level, slug: camel(round, subject.id, level, ...arm.id.split("-")) })),
      ),
    )
    .filter((job) => !existsSync(join(dir, "runs", `${job.slug}.json`)));
  const cost = await pricing(model);
  for (const arm of twoArms) {
    const stage1Arm = all.find((a) => a.id === arm.twostage!.stage1Arm);
    if (!stage1Arm) throw new Error(`No stage-1 arm "${arm.twostage!.stage1Arm}" in the arm set.`);
    mkdirSync(join(dir, "prompts"), { recursive: true });
    writeFileSync(join(dir, "prompts", `${arm.id}1.md`), systemPrompt(stage1Arm));
    writeFileSync(join(dir, "prompts", `${arm.id}.md`), systemPrompt(arm));
    for (const file of [arm.twostage!.stage1, arm.twostage!.add, arm.twostage!.texture, "refine-edits.md"])
      writeFileSync(join(dir, "prompts", file), readFileSync(join(BAKEOFF, "prompts", file), "utf8"));
  }
  const manifest = () => {
    const path = join(dir, "round.json");
    const had = existsSync(path)
      ? readJson<Record<string, unknown>>(path)
      : { id: round, started: new Date().toISOString() };
    writeJson(path, {
      ...had,
      model,
      effort,
      maxTokens,
      pricing: cost ?? null,
      arms: all,
      subjects,
      twostageRunner: "scripts/twostage.ts",
    });
  };
  manifest();
  console.log(`${todo.length} two-stage builds to ask ${model} (${effort}) for, ${concurrency} at a time.`);
  const gw = gateway();
  let done = 0;
  await pool(todo, concurrency, async (job) => {
    const line = await twoStageBuild({ gw, cost, dir, ...job, model, effort, maxTokens });
    console.log(`[${++done}/${todo.length}] ${job.slug}: ${line}`);
  });
  gw.close();
  manifest(); // a `bakeoff run` of the other arms may have rewritten it meanwhile
  results(round);
}

async function warm(args: string[]) {
  const model = option(args, "model", "anthropic/claude-sonnet-5-5");
  const all = armSet(args);
  const armIds = list(option(args, "arms", ""));
  const chosen = all.filter((a) => !armIds.length || armIds.includes(a.id));
  const prompts = new Map<string, string>();
  for (const arm of chosen) {
    prompts.set(systemPrompt(arm), arm.id);
    const stage1Arm = arm.twostage && all.find((a) => a.id === arm.twostage!.stage1Arm);
    if (stage1Arm) prompts.set(systemPrompt(stage1Arm), `${arm.id}1`);
  }
  const cost = await pricing(model);
  const gw = gateway();
  let total = 0;
  await Promise.all(
    [...prompts].map(async ([system, id]) => {
      const asked = await ask(
        gw,
        {
          model,
          reasoning_effort: "low",
          max_tokens: 2048,
          messages: [
            { role: "system", content: system },
            { role: "user", content: "Reply with the word ready." },
          ],
        },
        cost,
      );
      total += asked.costUsd ?? 0;
      console.log(
        `${id}: ${asked.reply?.status}, ${asked.usage?.prompt_tokens} in (${asked.usage?.prompt_tokens_details?.cached_tokens ?? 0} cached), $${(asked.costUsd ?? 0).toFixed(3)}`,
      );
    }),
  );
  gw.close();
  console.log(`warmed ${prompts.size} system prompts, $${total.toFixed(3)}`);
}

if (process.argv[1] && process.argv[1].endsWith("twostage.ts")) {
  const [command, target, ...rest] = process.argv.slice(2);
  if (command === "run" && target) await run(target, rest);
  else if (command === "warm") await warm([target, ...rest].filter(Boolean));
  else {
    console.error("Usage: npx tsx scripts/twostage.ts run <round> [options] | warm [--arm-set …] [--arms a,b]");
    process.exit(2);
  }
}
