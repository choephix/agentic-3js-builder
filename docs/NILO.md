# Bringing the SDK to Nilo

The plan for putting this SDK behind the Nilo World Agent (`~/workspace/nilo`), as a replacement for or alongside the existing low-poly generator. Read this when the work moves to the Nilo repo, or when Stefan asks what's left before the SDK ships there. Timing numbers come from `docs/SPEED.md`; looks are Stefan's call.

A brief for Nilo teammates with no context on this repo (the proposal, the 20 briefs side by side, what we learned, next steps, open decisions) is published at https://assets.public.cx/nilo/3d-sdk/demo/. `python3 bakeoff/n1/brief/build.py` rebuilds it from the N1 and r35 records into `~/tmp/public/nilo/agentic-3js-builder/nilo-brief/`; republish that folder with the `share` script after a change.

## What Nilo has today: low-poly

Mapped 2026-10-26 at Nilo `0c4fd24d71`. Paths are in `~/workspace/nilo`.

- **Tools.** `generate_low_poly_model` (`scope: prop | scene`, `description`, `position`, `referenceImage`, `quality` 1–10 default 2, `name`, `tags`, `destination`) and `edit_low_poly_model` (modes `palette`, `params`, `parts`, `flip`, `add`, `global`, `split`). Client tools: the server agent only emits the call, the browser runs it. Schemas in `packages/firebase-schema/src/functions/worldAgent.ts`, routing advice in `serverless/functions/src/functions/worldAgent/skills/low-poly.md`.
- **Loop** (`packages/low-poly-builder/src/builderLoop.ts`). One `design` turn, then up to `quality` rounds of one `build` each; every round but the last gets a `critique` turn (four renders, `APPROVED` ends the loop, `REVISE` feeds the next build). A build that fails to run or validate skips its critique and hands the error to the next round. Each turn is a call to the stateless `generateLowPolyCode` callable, which consumes the whole stream before returning. Patch-format failures retry inside a round, up to two repairs. Valid intermediate GLBs show as draft entities while later rounds run. Workflow page: `nilo-plan/workflow.html`.
- **Model.** Gemini 3.8 Flash for everyone, medium reasoning for generation, low for edits; `service` (provider/model) is admin-only, set per role from the World Agent's Low Poly model menu, so Sonnet 5.5 on today's loop needs no code. Sonnet 5.5, Opus 5.5 and GPT-6.1 Sol are registered. No production latency figure is documented; `LowPolyGenerationTasks/{taskId}/rounds` in Firestore records per-turn latency and usage. Not wallet-billed; cost is recorded server-side.
- **Code contract** (`packages/low-poly-builder/src/instructionPack.ts`, 1,636 lines). An import-free JavaScript module: `export const palette`, `export const params`, `export default function build({ THREE, BufferGeometryUtils })` returning a `THREE.Object3D`. Raw three.js geometry, one named flat-colour `MeshStandardMaterial` per mesh, no textures, no `SkinnedMesh`, no animation. `root.userData.entities` names the nodes that become entities.
- **Execution** (`src/lowPoly/sandbox/`). Opaque-origin iframe (`sandbox="allow-scripts"`, `connect-src 'none'`), a fresh blob **worker** per build, 30 s budget, 400k-char cap. The harness imports the module, calls `build`, validates, exports a GLB, reparses it, measures and renders four critique views. Three.js is the app's own (`^0.186.1`), shipped as `/sandbox/three-runtime.js`.
- **Artifact.** The GLB goes to Storage; `MeshEntity` records point at it (static, colliders, tag `low-poly`). The module source rides in the GLB as `userData.lowPoly`; edits rebuild from it, and every entity sharing the URL swaps together.
- **Size.** Package source 6.2k lines (12.5k with tests); app and server integration about 6.5k lines.

## Where the SDK differs

|                 | Low-poly                                                                    | SDK                                                                                                                                                                                        |
| --------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Module          | JavaScript, no imports, `THREE` passed in                                   | TypeScript, imports `createBuilder` etc. from the SDK and kits, `export default function build()` returning `b.root`                                                                       |
| Output          | Named node tree, one material per mesh                                      | `Assembly` packed by `createStaticMesh`/`createSkinnedMesh` into one mesh with one atlas material (plus a glowing copy per emissive strength)                                              |
| Colour          | Flat hex per mesh                                                           | Atlas of colours and paints (`DataTexture`, worker-safe); `svg()` and atlas readback of image textures use `document` and `Image` (`src/texture.ts`, `src/atlas.ts`), which a worker lacks |
| Rig             | Forbidden; `rig_character` is a separate tool                               | Named joints, skinned mesh available                                                                                                                                                       |
| Edits           | Deterministic palette/params, scoped part patches, split                    | None in Nilo's sense; the bakeoff has SEARCH/REPLACE repair (`refine --repair-only --types`, ~4 s)                                                                                         |
| Calls per build | 1 design + `quality` builds + (`quality` − 1) critiques; 3–4 at the default | 1 (single run) or 1 + 7 (two-stage), + ≤1 repair                                                                                                                                           |
| Prompt          | Instruction pack                                                            | `docs/api.md` + `docs/conventions.md` + an arm prompt, ~84k tokens, cached                                                                                                                 |

The flat prompt doesn't stop textures: 5 of 10 `r32flat` builds still made one or two (a glowing logo plane through a `texture:` option), and 2 of the 5 in `r32flat` (draw 1) call `svg()`. Two-stage finals call `svg()` 3–9 times each; stage 1 never does.

## The two candidate pipelines

Sonnet 5.5 at medium effort, same batch (r33, n=10, medians with ranges):

|                       | Single run, flat colour (`craft3-flat`)           | Two-stage with requests (`scripts/twostage.ts`)                                   |
| --------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------- |
| Calls                 | 1                                                 | stage 1 (flat, ends with `REQUESTS`) → 6 parallel add calls + 1 texture edit call |
| First pixel           | = final, 63 s (40–182); r32's batch 89 s (40–163) | stage 1 at 58 s (24–84)                                                           |
| Final                 | 63 s                                              | 79 s (45–132)                                                                     |
| Triangles             | 5.2k                                              | 10.1k                                                                             |
| Textures              | none asked (some `svg()` leaks)                   | 7 per build, mostly `svg()`                                                       |
| Crashes before repair | 0/10 (r32flat)                                    | final 1/10; stage 1 0/10                                                          |
| Cost (cached)         | $0.13                                             | $0.31                                                                             |
| Draft in Nilo         | not needed                                        | stage 1 maps onto Nilo's draft entities                                           |

**Two-stage's first pixel is not earlier than single-run's final** (58 s vs 63 s in the same batch). Stage 1 also builds less than a flat single run (170 parts and 3.1k triangles vs 288 and 5.2k), so its draft is the smaller model. What two-stage buys is the finished model: twice the triangles and textures, 16 s after single-run's final. Whether that detail is worth $0.18, 7 extra calls and the SVG bridge is Stefan's call from `r33/twostage-medium.jpg` against `r26/r32flat.jpg`.

Both at low effort are faster (flat 24 s, two-stage 21 s → 38 s) and Stefan judged high effort "night and day" better than low, so medium is the compromise these numbers use.

## Low-poly measured (N1, 2026-10-27)

Nilo's own loop on the same 20 r24 `rich` briefs as `r35sm` (Sonnet 5.5 medium: craft3, flat, two-stage), `scope: prop`, `quality: 2`, Gemini 3.8 Flash at medium reasoning. Imported from Nilo `0c4fd24d71`: `runLowPolyBuilderLoop`, the instruction-pack prompt builders, `appendLowPolyOutputBudget`, `lowPolyMaxOutputTokens`. `resolveLowPolyTurnSettings` wouldn't import outside the monorepo (`@nilo/logger/functions`), so its non-admin settings were set by hand: temperatures 0.7 / 0.3, caps 8k / 64k / 4k, image detail high. Reasoning tokens and four image parts per critique were confirmed in the responses. Runs went through Nilo's real sandbox harness on the NVIDIA Chromium. LLM calls went through the local omp gateway, not the Firebase callable, so the callable's overhead isn't in these times.

| Medians (ranges)    | Low-poly, Gemini       | flat, Sonnet   | two-stage, Sonnet | craft3, Sonnet |
| ------------------- | ---------------------- | -------------- | ----------------- | -------------- |
| First pixel         | 79 s (55–114)          | 111 s (42–233) | 76 s (20–158)     | 181 s (59–268) |
| Final               | 200 s (73–355)         | 111 s          | 99 s (30–178)     | 181 s          |
| Calls               | 4 (3–4)                | 1              | 8                 | 1              |
| Output tokens       | 27.6k (8.7k reasoning) | 14.5k          | 26.2k             | 24.2k          |
| Cost, list          | $0.13                  | $0.15          | $0.42             | $0.25          |
| Triangles           | 9.2k (1.9k–49k)        | 8.5k           | 13.6k             | 6.4k           |
| Unusable at the end | 0/20                   | 0/20           | 0/20              | 0/20           |

- **The critic never approved.** 17 critiques, 17 `REVISE`. The other 3 briefs crashed in round 1, so there was nothing to critique. Every brief therefore ran both rounds, and the default `quality: 2` always costs 3–4 calls. The final build is never reviewed.
- **Where low-poly's time goes**, per call: design 19.5 s, build 64.8 s (11–217 s, 10.6k output tokens), critique 23.1 s, sandbox run 0.3 s.
- **Mid-loop failures**: 3 sandbox crashes in round 1 (a `const` reassigned, a redeclared identifier, a null `index`), each costing the round. blueprintSpitfire's round-2 build failed validation, so its round-1 build (critic: `REVISE`) was kept. All 20 ended with a valid build.
- **Low-poly's draft comes as early as two-stage's** (79 s vs 76 s). Its final comes 89 s later than flat's and 101 s later than two-stage's, and 19 s later than craft3's. r35sm ran alongside the Terra bakeoff, so its times are slower than r33's (flat 111 s vs 63 s); compare within a batch.
- Page with renders side by side: `n1/index.html`. Data: `bakeoff/n1/results.json`; scripts in `bakeoff/n1/` (`run.ts` needs a Nilo clone with the sandbox harness built, see its imports). Looks are Stefan's call.
- Production numbers (`LowPolyGenerationTasks`) weren't read: this machine has no Firestore access.
- **Quota:** the 77 calls took stefan.ginev@nilo.io's Antigravity Gemini weekly meter from 0% to 100% (resets 2026-11-02). N2 waits for the reset or another Gemini route (OpenRouter).

## Folding the SDK in: the options

1. **New engine behind the existing tool.** `generate_low_poly_model` keeps its schema; the client executor picks the engine by flag (per user or admin), and the GLB's document records `engine: "sdk"` so `edit_low_poly_model` dispatches on it. The agent's routing, skills and tool docs don't change, and the flag gives an A/B on real prompts.
2. **A separate agent tool** (`build_model_sdk` or similar). Same plumbing underneath, but the agent has to choose between two tools with overlapping jobs, and the routing docs grow a rule nobody can state yet. Only worth it once the SDK does something low-poly can't, and the agent can tell from the request: a rigged, animatable creature is the candidate.
3. **Meld: hand the SDK to the low-poly loop** as a third injected argument (`build({ THREE, BufferGeometryUtils, sdk })`). Keeps the design/critique loop and Gemini, but the loop is the slow part and its prompts forbid what the SDK is for (skinned meshes, atlas material).
4. **Port only the lessons** to low-poly: single run instead of design + critique rounds, flat colour, types in the prompt, typecheck-gated SEARCH/REPLACE repair. No SDK; cheapest to try, says nothing about the SDK.

Recommendation: **option 1 with single-run flat**, then rig output as the reason for option 2 later. Two-stage is a follow-up on the same engine, since stage 1 is the single-run prompt plus a request list.

## The engine, sketched

```ts
// serverless: generateLowPolyCode, new role "sdk-build"
system = [SDK_API_MD, SDK_CONVENTIONS_MD, SDK_DECLARATIONS, CRAFT3_FLAT_MD]; // cached prefix
reply = await sonnet({ effort: "medium", system, user: brief });
src = fence(reply);
errors = tsc(src, SDK_DECLARATIONS); // ~1 s, TS6133/TS6196 ignored
if (errors.length) src = applySearchReplace(src, await sonnet({ effort: "low", repair: errors }));
return { js: stripTypesAndRewriteImports(src), source: src };

// client: sandbox harness, engine "sdk"
const { default: build } = await import(blobUrl(js)); // imports rewritten to `const { createBuilder } = SDK`
const root = build();
const mesh = await createStaticMesh(root, name); // createSkinnedMesh once a rig is consumed
mesh.userData = { lowPoly: { engine: "sdk", source, meta }, entities: [name] };
glb = await exportGlb(mesh); // then the existing reparse, upload, spawn, record
```

Work, in order:

- **SDK side (this repo, no tokens).** A browser bundle entry (`src` + kits) built against Nilo's three (`0.186.1`; we're on `0.185.1`). Worker-safety: `svg()` throws a clear error in a worker (single run then repairs it away), or a bridge rasterizes SVG in the iframe's main thread (needed for two-stage). A Nilo variant of the prompt: no `npm run` commands, the rewritten import path, Nilo's floor and scale.
- **Where the SDK lives.** A `packages/` workspace in Nilo is the natural home, but it's ~9k lines in the first PR, and then this repo either consumes it or keeps a copy. Stefan's decision.
- **Nilo client.** `engine` switch in `generateLowPolyModel.ts`; an SDK branch in the harness that skips the per-mesh material checks (the atlas is a texture) and stamps the document; the rest (upload, spawn, draft display, task recording) is reused.
- **Nilo server.** The `sdk-build` and `sdk-repair` roles in `generateLowPolyCode`, `tsc` with the SDK declarations, and Anthropic prompt caching on the 84k prefix (the callable's caching is unverified; `llmCompletion/config.ts` sets `cacheControl` for its own path).
- **Edits.** `global`, `parts` and `add` as SEARCH/REPLACE calls on the stored source; `palette`/`params` stay deterministic only if the SDK prompt asks the module to export them.

## Questions for Stefan

1. One tool with an engine flag, or a separate tool from the start?
2. Sonnet 5.5 (tested) or Gemini 3.8 Flash (Nilo's default, never run on the SDK)? Sonnet per build is $0.13 cached against a Flash build that's likely several times cheaper `[INFERENCE]`; low-poly isn't wallet-billed yet.
3. Static mesh first, or skinned with joint names exposed to `generate_animation` from day one?
4. The SDK's home: Nilo monorepo package or this repo?
5. Single run only, or two-stage too (needs the SVG bridge and 7 extra calls)?

## Experiments that inform the integration

Rated like `docs/SPEED.md`'s queue; all 20 r24 briefs unless noted.

| Rank | ID  | What                                                                                                                                                                                                                                            | Builds | Cost                         | Why                                                                                                |
| ---: | --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -----: | ---------------------------- | -------------------------------------------------------------------------------------------------- |
|    1 | N1  | ~~Low-poly baseline~~: done 2026-10-27, see "Low-poly measured" above                                                                                                                                                                           |     20 | Gemini meter 0 → 100%        | —                                                                                                  |
|    2 | N2  | **Gemini 3.8 Flash on the SDK**, `craft3-flat` + declarations, medium and low, against Sonnet medium. Antigravity's weekly Gemini meter is spent until 2026-11-02; OpenRouter (`openrouter-curated/google/gemini-3.8-flash`) is the other route |     40 | Gemini quota or OpenRouter $ | Whether the SDK keeps Nilo's model; its crash and type-error rate on a 66 KB API it has never seen |
|    3 | N1b | **Sonnet 5.5 on low-poly's loop**: `bakeoff/n1/run.ts` with the Sonnet model flag; isolates model from SDK                                                                                                                                      |     20 | ~$5, Anthropic               | Whether the SDK or the model makes the difference                                                  |
|    4 | N3  | **Single run with declarations at medium**: `craft3-flat` + `declarations` vs `craft3-flat`, Sonnet                                                                                                                                             |     40 | ~$6                          | r34 cut type errors 8/40 → 1/40 at low on craft3; the shipping prompt is flat at medium            |
|    5 | N4  | **Nilo briefs**: props and scenes as the World Agent writes them (short, a position, `scope`), from real agent transcripts, through the N3 winner                                                                                               |     20 | ~$3                          | The r24 briefs are gallery pitches; the agent's briefs are shorter and include multi-entity scenes |
|    6 | N5  | **Worker run**: every r32flat/N3 module through a worker-only harness (no `document`)                                                                                                                                                           |      0 | —                            | Counts `svg()` leaks and anything else that needs the DOM                                          |
