// The lab page's story: what was tried during the bake-off, in the order it happened, with the numbers read live
// from the rounds: everything measured comes from `store`.
import {
  ARM_COLORS,
  OUTCOMES,
  duration,
  esc,
  groupBy,
  int,
  median,
  model,
  money,
  pct,
  quantile,
  roundInfo,
  speed,
  sum,
  tally,
  title,
  tokens,
  type LabBuild,
} from "./lab-model";
import { tokenScatter, galleryLink } from "./lab-views";
import { armChip, builds, card, find, modelDot, original, runnerChip, shuffled, store } from "./lab-store";
import heldoutGrid from "./lab-heldout-grid.jpg?url";

const t = (round: string) => tally(builds([round]));
const pool = (...rounds: string[]) => tally(builds(rounds));
const rate = (round: string) => `${t(round).rendered}/${t(round).n}`;

/** Events on the timeline: SDK changes and new phases. */
const EVENTS: Array<[string, string]> = [
  ["2026-10-07T15:06:10Z", "SDK pass 1 · 6cc54cd"],
  ["2026-10-07T20:20:27Z", "Round 4: xhigh"],
  ["2026-10-07T20:22:47Z", "SDK pass 2 · c000f88"],
  ["2026-10-07T20:49:50Z", "Haiku 5.5"],
];

/** Every build as a line from request to reply, one lane per round, on one clock (the viewer's time zone). */
function nightChart() {
  const rounds = store.roundList.filter((round) => round.id !== "r1resdk");
  const all = store.data.builds.filter(original);
  const start = Math.min(...all.map((build) => Date.parse(build.started))) - 30 * 60e3;
  const end = Math.max(...all.map((build) => Date.parse(build.started) + build.wallMs)) + 10 * 60e3;
  const width = 1000;
  const left = 150;
  const lane = 22;
  const top = 62;
  const height = top + rounds.length * lane + 30;
  const x = (ms: number) => left + ((ms - start) / (end - start)) * (width - left - 10);
  const clock = (ms: number) =>
    new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  const parts: string[] = [];
  for (let hour = Math.ceil(start / 3600e3) * 3600e3; hour < end; hour += 3600e3)
    parts.push(
      `<line x1="${x(hour)}" x2="${x(hour)}" y1="${top - 6}" y2="${height - 24}" class="grid"/>`,
      `<text x="${x(hour)}" y="${height - 8}" class="tick" text-anchor="middle">${clock(hour)}</text>`,
    );
  // Labels take the highest row where they don't run into the one before; near the right edge they hang left.
  const rows: number[] = [];
  for (const [when, label] of EVENTS) {
    const px = x(Date.parse(when));
    const span = label.length * 5.8 + 8;
    const flip = px + span > width;
    const from = flip ? px - span : px;
    let row = rows.findIndex((end) => end < from);
    if (row < 0) row = rows.length;
    rows[row] = flip ? px : px + span;
    parts.push(
      `<line x1="${px}" x2="${px}" y1="${6 + row * 13}" y2="${height - 24}" class="event"/>`,
      `<text x="${flip ? px - 3 : px + 3}" y="${14 + row * 13}" class="event-label"${flip ? ' text-anchor="end"' : ""}>${esc(label)}</text>`,
    );
  }
  rounds.forEach((round, index) => {
    const y = top + index * lane;
    const color = model(round.model).color;
    parts.push(`<text x="${left - 8}" y="${y + lane / 2 + 4}" class="label" text-anchor="end">${esc(round.id)}</text>`);
    const own = builds([round.id]);
    own.forEach((build, i) => {
      const from = Date.parse(build.started);
      const yy = y + 3 + ((i * 7) % (lane - 6));
      parts.push(
        `<line x1="${x(from).toFixed(1)}" x2="${Math.max(x(from + build.wallMs), x(from) + 1).toFixed(1)}" y1="${yy}" y2="${yy}" stroke="${color}" class="run" data-slug="${build.slug}" data-tip="${esc(`${round.id} · ${title(build.subject)} ${build.level} · ${duration(build.wallMs / 1000)}`)}"/>`,
      );
    });
  });
  return `<svg class="chart night" viewBox="0 0 ${width} ${height}" width="100%">${parts.join("")}</svg>`;
}

/** Rows of rounds, columns of subjects: one arm and pitch level. */
function matrix(rounds: string[], arm: string, level: "terse" | "rich", subjects?: string[]) {
  const set = roundInfo(rounds[0]).set;
  const ids = subjects ?? store.data.subjects.filter((subject) => subject.set === set).map((subject) => subject.id);
  return `<div class="mini-matrix nav-scope" style="grid-template-columns: 170px repeat(${ids.length}, minmax(${ids.length > 10 ? 84 : 96}px, 1fr))">
    <div></div>${ids.map((id) => `<div class="mm-col">${esc(title(id))}</div>`).join("")}
    ${rounds
      .map(
        (round) =>
          `<div class="mm-row">${runnerChip(store.rounds.get(round)!)}<small>${round}</small></div>` +
          ids
            .map((id) => {
              const build = find(round, id, level, arm);
              return build ? card(build, { caption: "none" }) : `<div class="cmp-cell none">–</div>`;
            })
            .join(""),
      )
      .join("")}
  </div><p class="mm-note">${armChip(arm)} ${esc(store.arms.get(arm)?.name ?? arm)}, ${level} pitches. Click any tile to step through them.</p>`;
}

/** Per-arm rendered counts for a few rounds, side by side, with cost per build. */
function armTable(rounds: string[]) {
  const arms = store.data.arms.filter((arm) =>
    rounds.some((round) => builds([round]).some((build) => build.arm === arm.id)),
  );
  return `<div class="table-wrap"><table class="scores compact"><tr><th>Arm</th>${rounds
    .map((round) => `<th class="n">${runnerChip(store.rounds.get(round)!)}<small>${round}</small></th>`)
    .join("")}</tr>${arms
    .map(
      (arm) =>
        `<tr><td>${armChip(arm.id)} ${esc(arm.name)}</td>${rounds
          .map((round) => {
            const list = builds([round]).filter((build) => build.arm === arm.id);
            const s = tally(list);
            return `<td class="n"><a href="${galleryLink({ rounds: round, arms: arm.id })}"><b>${s.rendered}</b>/${s.n}</a> <small>${money(s.costPer)}</small></td>`;
          })
          .join("")}</tr>`,
    )
    .join("")}<tr class="total"><td>All</td>${rounds
    .map((round) => `<td class="n"><b>${pct(t(round).rate)}</b> <small>${money(t(round).cost)}</small></td>`)
    .join("")}</tr></table></div>`;
}

/** A row of models with their round's numbers. */
function modelTable(rounds: string[], extra: Array<[string, (list: LabBuild[]) => string]> = []) {
  return `<div class="table-wrap"><table class="scores compact"><tr><th>Run</th><th class="n">Rendered</th><th class="n">Spend</th><th class="n">Per build</th><th class="n">Median time</th><th class="n">Median output</th><th class="n">Out of tokens</th>${extra.map(([head]) => `<th class="n">${head}</th>`).join("")}</tr>${rounds
    .map((round) => {
      const list = builds([round]);
      const s = tally(list);
      return `<tr><td>${runnerChip(store.rounds.get(round)!)} <code>${round}</code></td><td class="n"><b>${s.rendered}</b>/${s.n} <small>${pct(s.rate)}</small></td><td class="n">${money(s.cost)}</td><td class="n">${money(s.costPer)}</td><td class="n">${duration(s.wallMedian)}</td><td class="n">${tokens(s.outputMedian)}</td><td class="n">${s.counts.nocode || "–"}</td>${extra.map(([, cell]) => `<td class="n">${cell(list)}</td>`).join("")}</tr>`;
    })
    .join("")}</table></div>`;
}

const stat = (value: string, label: string, color = "") =>
  `<div class="stat"${color ? ` style="--c:${color}"` : ""}><b>${value}</b><span>${label}</span></div>`;
/** The question a chapter answers, set off at its top. */
const question = (text: string) => `<blockquote class="ask"><span class="q-label">Question</span>${text}</blockquote>`;
const explore = (...links: Array<[string, string]>) =>
  `<p class="explore">${links.map(([href, label]) => `<a href="${href}">${label} →</a>`).join("")}</p>`;

type Chapter = { id: string; num: string; when: string; title: string; body: () => string };

const CHAPTERS: Chapter[] = [
  {
    id: "question",
    num: "00",
    when: "Overview",
    title: "What was tested",
    body: () => `
      <p class="lead"><b>agentic-3js-builder</b> is a TypeScript SDK that lets a language model build a rigged, low-poly three.js model from code: joints and chains for the skeleton, tubes, shells and surface placement for the body. The original bake-off tests an application that sends the model one system prompt and the user's pitch (“A fennec fox.”) and runs the TypeScript module that comes back. In those rounds the model has no tools, gets no second turn and never sees an error. <a href="#story/gap">Chapter 13</a> adds style briefs, kits and feedback turns, and asks whether that app can match an agentic session.</p>
      <p>This bake-off measures how well that single shot works, and what it depends on:</p>
      <ul class="rules">
        <li><b>Reference.</b> What the system prompt carries about the SDK: its whole source code, its docs, a short brief, or nothing (plain three.js).</li>
        <li><b>Taste.</b> Whether the prompt asks the model to build with the SDK throughout, or to start from simple primitives and use the SDK only where they fall short.</li>
        <li><b>Pitch detail.</b> Every subject has a terse pitch (one line) and a rich one (colours, character, accessories), so the two can be compared directly.</li>
        <li><b>Model and effort.</b> Claude Sonnet, Opus and Haiku 5.5, GPT-6 Astra and GPT-6.1 Sol, at medium and maximum reasoning effort.</li>
      </ul>
      <p>The original subjects are mostly creatures, with a few props, one humanoid (an armoured knight) and one diorama per set, all in the SDK's default stylised look. Rounds 1–4 report what built, what it cost and how long it took, leaving visual judgement to the reader. The later gap study adds blind vision judging on development and held-out briefs.</p>`,
  },
  {
    id: "setup",
    num: "01",
    when: "Method",
    title: "Seven prompts, two pitches, one request",
    body: () => {
      const fennec = store.subjects.get("fennec");
      const size = (arm: string) =>
        tokens(
          median(
            builds(["r2"])
              .filter((build) => build.arm === arm)
              .map((build) => build.input ?? NaN),
          ),
        );
      return `
      <p>Each system prompt variant is an <b>arm</b>: a reference crossed with a taste, plus a plain three.js control. All arms share one contract: reply with a single TypeScript module that default-exports a function returning the model.</p>
      <div class="arms-mini">
        ${store.data.arms
          .filter((arm) =>
            ["source-sdk", "source-prim", "docs-sdk", "docs-prim", "brief-sdk", "brief-prim", "plain"].includes(arm.id),
          )
          .map(
            (arm) =>
              `<div class="arm-pill" style="--c:${ARM_COLORS[arm.id]}">${armChip(arm.id)}<span><b>${esc(arm.name)}</b><small>${esc(arm.idea)}</small><em>${size(arm.id)} input tokens per call</em></span></div>`,
          )
          .join("")}
      </div>
      ${
        fennec
          ? `<div class="pitch-pair"><div><span class="tag">Terse</span><p>${esc(fennec.terse)}</p></div><div><span class="tag rich">Rich</span><p>${esc(fennec.rich)}</p></div></div><p class="mm-note">One subject's two pitches. Every subject has both.</p>`
          : ""
      }
      <p>Each build is one API request with nothing but the system prompt and the pitch. The reply's code is then typechecked and rendered by a headless harness, which also checks the rig. A build ends one of four ways:</p>
      <ul class="rules">
        <li><b style="color:${OUTCOMES.clean.color}">Rendered</b>: the module built a model with a valid skeleton.</li>
        <li><b style="color:${OUTCOMES.rigless.color}">Rendered, rig rejected</b>: the model renders, but some meshes hang on no bone, so it can't be exported as a rigged character.</li>
        <li><b style="color:${OUTCOMES.crashed.color}">Crashed</b>: the module threw while building.</li>
        <li><b style="color:${OUTCOMES.nocode.color}">Out of tokens</b>: the reply spent its whole output budget thinking and never wrote the code.</li>
      </ul>
      ${explore(["#method", "Method, arms and prompt texts"], ["#pitches", "All pitches"])}`;
    },
  },
  {
    id: "r1",
    num: "02",
    when: "Round 1 · r1",
    title: "Sonnet 5.5 on seven prompts",
    body: () => `
      ${question("Does the single shot work at all, and which prompt holds up?")}
      <div class="statrow">${stat("98", "builds: 7 subjects × 2 pitches × 7 arms")}${stat(rate("r1"), "rendered", OUTCOMES.clean.color)}${stat(money(t("r1").cost), "spend")}${stat(duration(t("r1").wallMedian), "median per build")}</div>
      <p>Sonnet 5.5 at medium effort rendered <b>${t("r1").rendered} of 98</b>; ${t("r1").counts.rigless} of those rendered without a valid rig. Its ${t("r1").counts.crashed + t("r1").counts.rigless} misses (${t("r1").counts.crashed} crashes, ${t("r1").counts.rigless} rig rejections) cluster in the <b>brief arms</b>, and nearly all trace back to a handful of natural guesses about the API:</p>
      <div class="table-wrap"><table class="scores compact guesses">
        <tr><th>What the model wrote</th><th class="n">Builds</th></tr>
        <tr><td>Hand-made meshes added to <code>b.root</code> or a joint, outside the skeleton</td><td class="n">9</td></tr>
        <tr><td><code>b.part({ geometry, color, … })</code>, one object instead of three arguments</td><td class="n">3</td></tr>
        <tr><td>A joint treated as a three.js object: <code>joint.add(mesh)</code></td><td class="n">2</td></tr>
        <tr><td>A Chain or Group passed where a joint goes</td><td class="n">2</td></tr>
        <tr><td>The radius inside the options: <code>b.sweep(path, { radius })</code></td><td class="n">1</td></tr>
        <tr><td><code>b.surface(b.root)</code>; a spike with no colour</td><td class="n">2</td></tr>
        <tr><td>The model's own geometry: a lathe outline crossing itself, a zero-length direction</td><td class="n">2</td></tr>
      </table></div>
      <p>The brief's own cheat sheet invited the most common one: its row read <code>b.part({ at, frame, aim, dir, up })</code>.</p>
      ${armTable(["r1"])}
      ${matrix(["r1"], "docs-sdk", "rich")}
      <aside class="changed"><h4>What changed next</h4><ul>
        <li><b>SDK pass 1</b> (<code>6cc54cd</code>): the SDK accepts each guess that has one clear meaning (the one-object <code>part</code>, the radius in options, <code>joint.add</code>, a Chain as a joint, meshes on <code>b.root</code> ride the root joint) and names the call in every other error. Rebuilt from the same replies, 17 of the 21 failures now build.</li>
        <li>The cheat sheet shows the real signatures, and the contract gains one line: “Every piece of geometry joins the model through the builder…”</li>
      </ul></aside>
      ${explore([galleryLink({ rounds: "r1" }), "Round 1 in the gallery"], ["#compare?preset=sdkfix", "Before and after SDK pass 1"], ["#failures", "Every failure"])}`,
  },
  {
    id: "r2",
    num: "03",
    when: "Round 2 · r2",
    title: "Twenty new subjects on the fixed SDK",
    body: () => `
      ${question("With the SDK fixes, how do the seven prompts compare on a larger set?")}
      <div class="statrow">${stat("280", "builds: 20 subjects × 2 × 7")}${stat(rate("r2"), `rendered · ${pct(t("r2").rate)}`, OUTCOMES.clean.color)}${stat(money(t("r2").cost), "spend")}${stat(money(t("r2").costPer), "per build")}</div>
      <p>Fifteen creatures, four props and a Japanese garden, on Sonnet medium. The brief arms recovered. Arm for arm, the whole source costs about half as much again as the docs without rendering more often:</p>
      ${armTable(["r1", "r2"])}
      ${matrix(["r2"], "docs-sdk", "rich")}
      ${explore([galleryLink({ rounds: "r2" }), "Round 2 in the gallery"], ["#compare?preset=arms", "One pitch across all seven arms"])}`,
  },
  {
    id: "opus",
    num: "04",
    when: "Round 1 again · r1opus, r1resdk",
    title: "Opus 5.5 on identical prompts",
    body: () => {
      const a = pool("r1resdk");
      const b = pool("r1opus");
      return `
      ${question("On byte-identical prompts, what does the larger model change?")}
      <p>Opus 5.5 at medium effort got round 1's exact system prompts. It ran on the fixed SDK, so round 1's Sonnet replies were rebuilt unchanged on the same SDK (<code>r1resdk</code>); the comparison credits neither model with the SDK fixes.</p>
      <div class="vs">
        <div style="--c:${model("anthropic/claude-sonnet-5-5").color}"><h4>${modelDot("anthropic/claude-sonnet-5-5")}Sonnet medium <small>r1resdk</small></h4>${stat(`${a.rendered}/${a.n}`, "rendered")}${stat(money(a.costPer), "per build")}${stat(duration(a.wallMedian), "median time")}${stat(tokens(a.outputMedian), "median output tokens")}${stat(tokens(a.trianglesMedian), "median triangles")}</div>
        <div style="--c:${model("anthropic/claude-opus-5-5").color}"><h4>${modelDot("anthropic/claude-opus-5-5")}Opus medium <small>r1opus</small></h4>${stat(`${b.rendered}/${b.n}`, "rendered")}${stat(money(b.costPer), "per build")}${stat(duration(b.wallMedian), "median time")}${stat(tokens(b.outputMedian), "median output tokens")}${stat(tokens(b.trianglesMedian), "median triangles")}</div>
      </div>
      <p>The same render rate, at about five times the cost and the time per build. Opus writes more and builds denser models.</p>
      ${matrix(["r1resdk", "r1opus"], "docs-sdk", "rich")}
      ${explore(["#compare?preset=everything", "The fennec in every run × arm"], [galleryLink({ rounds: "r1resdk,r1opus", group: "round" }), "Both rounds in the gallery"])}`;
    },
  },
  {
    id: "r3",
    num: "05",
    when: "Round 3 · r3, r3opus",
    title: "Ten more subjects on both models",
    body: () => `
      ${question("Does the Sonnet–Opus picture hold on new subjects?")}
      <p>Seven creatures (a lion, a penguin, a seahorse, an armadillo, a dragonfly, a koala, a forest spirit), a telescope, a typewriter and a treehouse, on Sonnet and Opus at medium with identical prompts. Opus rendered every brief-arm build; Sonnet's misses cluster there.</p>
      ${armTable(["r3", "r3opus"])}
      ${matrix(["r3", "r3opus"], "docs-sdk", "rich")}
      ${explore(["#compare?preset=trio", "Sonnet · Opus · Haiku on these pitches"], [galleryLink({ rounds: "r3,r3opus" }), "Round 3 in the gallery"])}`,
  },
  {
    id: "defaults",
    num: "06",
    when: "SDK change · c000f88",
    title: "SDK pass 2: defaults over errors",
    body: () => `
      ${question("Can the SDK absorb the remaining crashes?")}
      <p>On SDK <code>6cc54cd</code>, 28 builds across rounds 1–3 still crashed. Pass 1 had given most wrong inputs a clear, named error, but a single-run model never reads its error, so a named error still loses the build. Pass 2 (<code>c000f88</code>) gives an input a <b>default</b> wherever one reads plausibly:</p>
      <div class="table-wrap"><table class="scores compact guesses">
        <tr><th>What the model wrote</th><th>What the SDK does now</th></tr>
        <tr><td>No <code>color</code> on a part (lashes, a beak, a fin)</td><td>The colour of the nearest part already built; the first part is grey</td></tr>
        <tr><td><code>b.rod(a, b, r, BARK, { bone })</code></td><td>A colour right after the radius is the colour</td></tr>
        <tr><td>A membrane or slab with no <code>thickness</code></td><td>2% of the shape's own width</td></tr>
        <tr><td><code>extrude({ depth })</code>, <code>part.position</code>, <code>joint.rotation</code></td><td>three.js names work where the meaning is the same</td></tr>
        <tr><td><code>{ at, axis }</code> where a frame goes; one bend for every joint; an outline point repeated</td><td>Read the way they were meant</td></tr>
        <tr><td>A zero-length direction, an unusable surface target</td><td>Still an error, now naming the call and the value</td></tr>
      </table></div>
      <p>Rebuilt from the same replies, <b>21 of the 28 build</b>, and every earlier sample and already-rendering round 3 build comes out identical. The 7 left: three self-crossing outlines, a zero-length direction, a surface on a joint that carries nothing, joints used as three.js objects throughout (<code>getWorldPosition</code>), and a plain three.js build with an undefined geometry.</p>
      <p class="mm-note">Rounds 1–3 were checked on the SDK of their day; round 4 and every Haiku round on c000f88, which accepts more. The scoreboard lists each round's SDK.</p>
      ${explore(["#failures", "Every failure, by message"])}`,
  },
  {
    id: "effort",
    num: "07",
    when: "Background",
    title: "Reasoning effort",
    body: () => `
      ${question("How much of the output is thinking, and what does raising the effort do?")}
      <p>Rounds 1–3 ran at <b>medium</b> effort. Effort sets how long a model reasons before it answers, and that reasoning is billed as output whether or not it is returned. On round 3:</p>
      <div class="table-wrap"><table class="scores compact"><tr><th>Model, medium</th><th class="n">Visible reply</th><th class="n">Billed output</th><th class="n">Hidden share</th></tr>
        <tr><td>${modelDot("anthropic/claude-sonnet-5-5")}Sonnet 5.5</td><td class="n">≈2.2k tokens</td><td class="n">9.4k</td><td class="n">≈76%</td></tr>
        <tr><td>${modelDot("anthropic/claude-opus-5-5")}Opus 5.5</td><td class="n">≈4.0k tokens</td><td class="n">22.9k</td><td class="n">≈83%</td></tr></table></div>
      <p>Round 4 and the Haiku xhigh rounds test the top setting: xhigh, with the output cap raised from 64k to 128k tokens. Opus 5.5 ran at high, the highest level the setup offered for it.</p>`,
  },
  {
    id: "r4",
    num: "08",
    when: "Round 4 · r4sonnet, r4opus, r4astra, r4sol",
    title: "Four models at maximum effort",
    body: () => `
      ${question("At the highest effort, how do Anthropic's and OpenAI's models compare on the same prompts?")}
      <p>A red panda, a chameleon, a pufferfish, a unicorn foal and a 1950s jukebox, terse and rich, on four arms (source, docs and brief SDK-first, plus plain three.js): 40 builds per model, all with the same frozen prompts. Haiku's row was added later (chapter 9).</p>
      ${modelTable(
        ["r4sonnet", "r4opus", "r4astra", "r4sol", "r4haiku"],
        [
          [
            "Median triangles",
            (list) => tokens(median(list.filter((build) => build.rendered).map((build) => build.triangles ?? NaN))),
          ],
        ],
      )}
      <p>Sonnet at xhigh wrote about ${tokens(median(builds(["r4sonnet"]).map((build) => build.output ?? NaN)))} tokens per build, and ${t("r4sonnet").counts.nocode} of its 40 replies used all 128k without reaching the code.</p>
      ${matrix(["r4sonnet", "r4opus", "r4astra", "r4sol", "r4haiku"], "docs-sdk", "rich")}
      ${explore(["#compare?preset=models", "Compare all five, any arm"], [galleryLink({ rounds: "r4sonnet,r4opus,r4astra,r4sol,r4haiku", group: "subject" }), "Round 4 by subject"])}`,
  },
  {
    id: "haiku",
    num: "09",
    when: "All rounds · r1haiku … r3haikux",
    title: "Haiku 5.5 on every round",
    body: () => {
      const sets: Array<[string, string[]]> = [
        ["Round 1", ["r1resdk", "r1opus", "r1haiku"]],
        ["Round 2", ["r2", "r2haiku"]],
        ["Round 3", ["r3", "r3opus", "r3haiku"]],
        ["Round 4", ["r4sonnet", "r4opus", "r4haiku"]],
      ];
      const haikuCrashes = store.data.builds.filter(
        (build) => original(build) && build.model.includes("haiku") && build.checked && !build.rendered,
      );
      const noJoints = haikuCrashes.filter((build) => /No joints yet/.test(build.crash ?? "")).length;
      return `
      ${question("How far does the smallest, cheapest model get on the same prompts?")}
      <p>Haiku 5.5 reran every round's exact prompts at that round's effort: medium for rounds 1–3, xhigh for round 4. Calls over 100k input tokens (the source arm) are billed at Haiku's long-context rate, which the costs include.</p>
      <div class="table-wrap"><table class="scores compact"><tr><th>Pitches</th><th>Run</th><th class="n">Rendered</th><th class="n">Per build</th><th class="n">Median time</th><th class="n">Median output</th></tr>${sets
        .map(([label, rounds]) =>
          rounds
            .map((round, i) => {
              const s = t(round);
              return `<tr${i === 0 ? ' class="first"' : ""}><td>${i === 0 ? label : ""}</td><td>${runnerChip(store.rounds.get(round)!)}</td><td class="n"><b>${s.rendered}</b>/${s.n} <small>${pct(s.rate)}</small></td><td class="n">${money(s.costPer)}</td><td class="n">${duration(s.wallMedian)}</td><td class="n">${tokens(s.outputMedian)}</td></tr>`;
            })
            .join(""),
        )
        .join("")}</table></div>
      <p>${noJoints} of Haiku's ${haikuCrashes.length} crashes are one mistake: building parts before the root joint exists (<code>No joints yet</code>). No other model made it.</p>
      <p class="mm-note">Haiku's rounds were checked on SDK c000f88, which accepts more guesses than the 6cc54cd that Sonnet's and Opus's rounds 1–3 were checked on; that favours Haiku slightly.</p>
      <p>Rounds 1–3 also ran on Haiku at xhigh:</p>
      ${modelTable(["r1haiku", "r1haikux", "r3haiku", "r3haikux", "r2haiku", "r2haikux"])}
      <p>At xhigh, Haiku writes five to six times as much and runs out of tokens far more often. The round 2 xhigh run is partial: it stopped at ${t("r2haikux").n} of 280 builds.</p>
      ${matrix(["r1resdk", "r1opus", "r1haiku", "r1haikux"], "docs-sdk", "rich")}
      ${explore(["#compare?preset=effort", "Medium vs xhigh"], [galleryLink({ rounds: "r1haiku,r2haiku,r3haiku,r4haiku,r1haikux,r2haikux,r3haikux", group: "round" }), "Every Haiku build"])}`;
    },
  },
  {
    id: "time",
    num: "10",
    when: "All rounds",
    title: "Where the time goes",
    body: () => {
      const runners = [
        ...groupBy(
          store.roundList.filter((round) => round.id !== "r1resdk"),
          (round) => `${round.model}|${round.effort}`,
        ),
      ];
      const rows = runners
        .map(([key, rounds]) => {
          const list = builds(rounds.map((round) => round.id));
          const walls = list.map((build) => build.wallMs / 1000);
          const speeds = list.map(speed);
          return { key, list, walls, speeds };
        })
        .sort((a, b) => median(a.walls) - median(b.walls))
        .map(
          ({ key, walls, speeds }) =>
            `<tr><td>${modelDot(key.split("|")[0])}${esc(model(key.split("|")[0]).short)} ${key.split("|")[1]}</td><td class="n">${duration(Math.min(...walls))}</td><td class="n"><b>${duration(median(walls))}</b></td><td class="n">${duration(quantile(walls, 0.9))}</td><td class="n">${duration(Math.max(...walls))}</td><td class="n">${int(quantile(speeds, 0.1))} · <b>${int(median(speeds))}</b> · ${int(quantile(speeds, 0.9))}</td></tr>`,
        )
        .join("");
      const sol = builds(["r4sol"])
        .slice()
        .sort((a, b) => b.wallMs - a.wallMs);
      return `
      ${question("How long does one build take, and why do some take so much longer?")}
      <div class="table-wrap"><table class="scores compact"><tr><th>Model, effort</th><th class="n">Fastest</th><th class="n">Median</th><th class="n">90% by</th><th class="n">Slowest</th><th class="n">tok/s p10 · median · p90</th></tr>${rows}</table></div>
      <p>Each build is one request; its time includes waiting in the provider's queue, with 20–40 requests running at once. In the chart below, the diagonals are constant speeds. Haiku streams fastest, at a steady 200+ tokens per second, so its long builds are long answers. GPT-6.1 Sol's slowest builds are not long answers: all 40 of its requests started together on one account, and its slowest builds streamed at ${int(speed(sol[0]))} tokens per second against 40+ for its quick ones. The provider was throttling the burst; one request at a time, a Sol build takes an estimated 6–7 minutes.</p>
      ${tokenScatter()}
      <p>Every run on one clock, one line per build from request to reply:</p>
      ${nightChart()}
      ${explore(["#charts", "All the charts"])}`;
    },
  },
  {
    id: "findings",
    num: "11",
    when: "Summary",
    title: "Findings",
    body: () => {
      const sonnetMedium = ["r2", "r3", "r1resdk"];
      const armRate = (arms: string[], rounds: string[]) => {
        const list = builds(rounds).filter((build) => arms.includes(build.arm));
        return { rate: tally(list).rate, cost: tally(list).costPer };
      };
      const src = armRate(["source-sdk", "source-prim"], sonnetMedium);
      const docs = armRate(["docs-sdk", "docs-prim"], sonnetMedium);
      const brief = armRate(["brief-sdk", "brief-prim"], sonnetMedium);
      const plain = armRate(["plain"], sonnetMedium);
      const haikuMedium = pool("r1haiku", "r2haiku", "r3haiku");
      const sonnetAll = pool(...sonnetMedium);
      const opusAll = pool("r1opus", "r3opus");
      const levels = (level: string) =>
        median(
          builds(sonnetMedium)
            .filter((build) => build.level === level && build.rendered)
            .map((build) => build.parts ?? NaN),
        );
      return `
      <ol class="findings">
        <li><b>The docs render nearly as often as the whole source, for two-thirds of the price.</b> On Sonnet medium (rounds 1–3), the docs arms rendered ${pct(docs.rate)} at ${money(docs.cost)} a build, the whole source ${pct(src.rate)} at ${money(src.cost)}, the brief ${pct(brief.rate)} at ${money(brief.cost)}, and plain three.js ${pct(plain.rate)} at ${money(plain.cost)}, with no rig.</li>
        <li><b>An SDK for single runs has to forgive.</b> A model that never sees its error can't recover from it. Two SDK passes turned 17 of 21, then 21 of 28, crashes into builds by accepting what the models naturally wrote. The brief arms gained the most.</li>
        <li><b>Maximum effort cost more and failed more often.</b> At xhigh, Sonnet rendered ${rate("r4sonnet")} (${t("r4sonnet").counts.nocode} out of tokens) and Haiku fell from ${rate("r1haiku")} to ${rate("r1haikux")} on round 1. Builds took 5–12× as long, and Haiku's xhigh rounds cost about 4× its medium ones. Opus at high rendered ${rate("r4opus")}.</li>
        <li><b>The models trade price for reliability.</b> At medium: Opus ${pct(opusAll.rate)} at ${money(opusAll.costPer)} a build, Sonnet ${pct(sonnetAll.rate)} at ${money(sonnetAll.costPer)}, Haiku ${pct(haikuMedium.rate)} at ${money(haikuMedium.costPer)}.</li>
        <li><b>Rich pitches build more.</b> On Sonnet medium, the median rendered build has ${int(levels("terse"))} parts from a terse pitch and ${int(levels("rich"))} from a rich one.</li>
        <li><b>Time depends on load as much as on the model.</b> At medium effort the Claude models take 1–5 minutes a build; at xhigh, builds take 6–45 minutes, and a burst of requests to one account can slow a provider several-fold.</li>
        <li><b>Not measured in rounds 1–4: quality.</b> The gallery, the compare presets and blind mode (B) are there to judge it by eye. <a href="#story/gap">The later gap study</a> adds blind vision judging.</li>
      </ol>`;
    },
  },
  {
    id: "open",
    num: "12",
    when: "Next",
    title: "Open questions",
    body: () => `
      <ul class="rules">
        <li><b>Equal footing.</b> Rebuild rounds 1–3 of Sonnet and Opus on SDK c000f88, like Haiku and round 4.</li>
        <li><b>True latency.</b> A few builds per model at one request at a time, away from bursts.</li>
        <li><b>Opus at xhigh</b>, which this setup didn't offer.</li>
        <li><b>Round 2 at Haiku xhigh</b> is partial: ${t("r2haikux").n} of 280 builds.</li>
        <li><b>A second turn.</b> Send the render report or the crash back once and let the model fix its build. <a href="#story/gap">Tested in the next chapter.</a></li>
        <li><b>What still crashes after pass 2:</b> self-crossing outlines, zero-length directions, joints used as three.js objects, surfaces on empty joints.</li>
        <li><b>Style kits</b> as another axis, and cheaper models not yet run. <a href="#story/gap">Kits join the next study.</a></li>
      </ul>`,
  },
  {
    id: "gap",
    num: "13",
    when: "2026-10-15 · rounds 5–9",
    title: "Can an app match an agentic session?",
    body: () => {
      const rounds = store.roundList.filter((round) => ["r5", "r7"].includes(roundInfo(round.id).set));
      const rows = rounds
        .map((round) => {
          const own = builds([round.id]);
          const chainCosts = own.map((build) => build.chainCost ?? NaN);
          return `<tr><td><a href="${galleryLink({ rounds: round.id })}"><code>${esc(round.id)}</code></a></td><td>${runnerChip(round)}</td><td>${[...new Set(own.map((build) => build.arm))].map((id) => `${armChip(id)} ${esc(store.arms.get(id)?.name ?? id)}`).join("<br>")}</td><td class="n">${tally(own).rendered}/${own.length}</td><td class="n">${money(median(chainCosts))}</td></tr>`;
        })
        .join("");
      return `
      ${question("Can an app—prompt → module → run it → screenshot it → send feedback—match an agent that reads, builds, looks and edits?")}
      <p class="lead">The agentic Sonnet sessions took a median <b>18 minutes and $3.75</b>. We reused their exact Category/Subject/Style briefs: <b>16 development subjects</b> to work out the prompt, then <b>12 held-out subjects</b> to test the pipelines. No tool-using agent is inside the app; it makes API calls and runs the code.</p>
      <h3>H1 · The gap was the first draft</h3>
      <p>Across 464 agentic builds, the first file write is a median <b>94% of the final file</b>. The original lab single-run builds had no style, no kits and a short docs prompt. So round 5 supplied the agent's style brief, every kit's doc and source, the paint and texture source, and an ambition target: <b>180–340 parts, 5–12 textures, 700–1,100 lines and a staged base</b>.</p>
      <div class="statrow">${stat("6.33", "docs-only · dev panel")}${stat("8.05", "kits + source + ambition · dev panel")}${stat("7.09", "agent first draft · same panel")}${stat("8.36", "agent final · same panel")}</div>
      <p><b>Kits alone did nothing.</b> The stronger first-draft brief—not an invisible advantage from many rounds of editing—closed most of this panel's gap. The imported agent first drafts are browsable as <code>r5agent</code>; repairs are separate builds, not replacements.</p>
      <h3>The craft prompt</h3>
      <p>Comparing agent and single-run code gave us construction habits, not just bigger counts: build the subject first, push its proportions with a scale constant per feature, settle the face first, spend the richest construction on its signature features, paint by place, and fit the setting to the subject. <code>craft.md</code> and <code>craft2.md</code> carry those habits. Craft beat the ambition-only arm <b>45/60</b> head-to-head judgments.</p>
      <h3>Feedback turns · repair, then critique</h3>
      <p><b>Repair</b> sends the failing module and its error back in a separate call, without changing the single-run label of the initial build. It fixed 15 of 16 crashed agent drafts, and every crashed single-run build within two calls, for about $0.05. <b>Critique</b> sends four renders and measurements back and asks for SEARCH/REPLACE edits (or a whole module). Fewer than 1% failed; the first turn beat its input <b>51/64</b> and the second beat the first <b>47/64</b>, at $0.07–0.15 per turn. A build's viewer shows its source, feedback mode and cumulative chain cost, including repairs.</p>
      <p>Round 5 branches through repair and two critiques. Round 6 tries craft, critique v1 (<code>r6c1–c3</code>), v2 (<code>r6d1–d2</code>), v3 (<code>r6e1–e2</code>) and medium effort. Round 8 tests craft2, planning and self-critique against a GPT critic with a Sonnet editor (<code>r8k1–k2</code>). Round 9 puts Sol on the development set; round 7 keeps both builders on the held-out set.</p>
      ${explore(["#compare?preset=critique", "Sonnet's dev critique chain"], ["#compare?preset=solchain", "Sol's dev critique chain"], [galleryLink({ rounds: "r8,r8fix,r8c1,r8c2,r8k1,r8k2,r8k2fix", group: "round" }), "Self-critique vs external critic"])}
      <aside class="changed"><h4>What did not help</h4><ul>
        <li><b>Medium effort:</b> 6.14 against 7.97; it wrote 15 KB instead of 27 KB.</li>
        <li><b>Plan then build:</b> the planning arm lost to the plain craft2 arm 12/64.</li>
        <li><b>GPT critic + Sonnet editor:</b> no gain, at 10× the turn cost. The priority-ordered critique v2 did not help either.</li>
        <li><b>High effort can overthink:</b> Sonnet spends 50–90k completion tokens, mostly thinking. A 64k cap left about 5% with no code; 120k fixed it.</li>
      </ul></aside>
      <p>Sol writes leaner modules (about $0.26 and 5 minutes) and gains most from feedback: two turns beat its first draft <b>86/96</b> on the development comparisons.</p>
      <h3>Held out · 12 unseen subjects</h3>
      <div class="table-wrap"><table class="scores compact">
        <thead><tr><th>Pipeline</th><th class="n">Overall</th><th class="n">Mean rank</th><th class="n">Beats agent final</th><th class="n">Median cost</th><th class="n">Median model time</th></tr></thead>
        <tbody>
          <tr><td>Agentic session (final)</td><td class="n">7.07</td><td class="n">2.79</td><td class="n">—</td><td class="n">$3.75</td><td class="n">18 min</td></tr>
          <tr><td>Sonnet single-run, craft</td><td class="n">6.85</td><td class="n">3.35</td><td class="n">31/72</td><td class="n">$0.64</td><td class="n">8 min</td></tr>
          <tr><td>Sonnet + 2 critique turns</td><td class="n">7.14</td><td class="n">2.75</td><td class="n">35/72</td><td class="n">$1.02</td><td class="n">9 min</td></tr>
          <tr><td>GPT-6.1 Sol single-run, craft2</td><td class="n">6.79</td><td class="n">3.69</td><td class="n">26/72</td><td class="n">$0.26</td><td class="n">5 min</td></tr>
          <tr><td><b>GPT-6.1 Sol + 2 critique turns</b></td><td class="n"><b>7.43</b></td><td class="n"><b>2.42</b></td><td class="n">37/72</td><td class="n">$0.55</td><td class="n">12 min</td></tr>
        </tbody>
      </table></div>
      <p>Sol + two turns minus the agent final: <b>+0.36 overall</b> (bootstrap 95% CI 0.04–0.72); all three judges, Opus included, put it above the agent finals. Sonnet + two turns is at parity: +0.07 (CI −0.43–0.64). Picking the better Sonnet or Sol chain with a third judge helped on the dev set, but not reliably on the held-out set: judges disagree on the better builder.</p>
      <figure class="study-sheet">
        <div class="study-sheet-scroll"><div class="study-sheet-labels"><b>Agent final</b><b>Sonnet · craft</b><b>Sonnet · +2 turns</b><b>Sol · craft2</b><b>Sol · +2 turns</b></div><a href="${heldoutGrid}" target="_blank" rel="noopener"><img src="${heldoutGrid}" width="1530" height="3672" alt="Twelve held-out subjects, each with the agent final beside Sonnet and Sol first drafts and their two-turn critique pipelines" loading="lazy"></a></div>
        <figcaption class="mm-note">Each row is one held-out subject, in pitch order. Agent finals are the original v02 renders. As in the judged panel, the single-run columns include crash repairs where needed; repairs are separate calls, included in pipeline costs, and do not change the initial build's label. Open the sheet for full-resolution details. The compare preset below keeps the raw r7 and r7sol rounds, so their original failures remain visible; the gallery also carries their repairs.</figcaption>
      </figure>
      ${explore(["#compare?preset=heldout", "Compare all four held-out pipelines"], [galleryLink({ rounds: "r7,r7fix,r7c1,r7c2,r7sol,r7solfix,r7solc1,r7solc2", group: "subject" }), "Held-out builds and repairs"])}
      <h3>How this was judged—and what it does not prove</h3>
      <p>Candidates were shown blind as a three-quarter plus front image, scored 1–10 for overall, subject, style and detail, with defects and a ranking. The dev panels used two or three vision judges (GPT-6.1 Sol, Gemini 3.8 Flash and Opus 5.5), each in two shuffled orders. The held-out panel used all three: 12 subjects × 3 judges × 2 orders = <b>72 judgments</b>. Scores compare only within a panel; wins count head-to-head rankings. The numbers above are the recorded study summary, not a fresh judgment of this page.</p>
      <p><b>Caveats:</b> judges reward detail and staged bases (detail and overall correlate at 0.88). Every single-run arm adds a base; several agent finals have none. GPT rates GPT builds highest. Model times exclude renders, which take seconds each. The study spent about $138 in API calls. This is evidence for a bounded pipeline on these briefs, not proof that every app can replace every agentic session.</p>
      <details><summary>Every study round · sources, arms and chain costs</summary>
        <p class="mm-note">Repair rounds contain the builds they repaired, not a complete replacement for the source. “Chain cost” is the median cumulative API spend recorded on a feedback build; a dash means no chain cost was recorded. Any later runs shown here are not part of the fixed two-turn held-out table above.</p>
        <div class="table-wrap"><table class="scores compact"><tr><th>Round</th><th>Builder / source</th><th>Arms</th><th class="n">Rendered</th><th class="n">Median chain cost</th></tr>${rows}</table></div>
      </details>`;
    },
  },
];

export function renderStory(root: HTMLElement) {
  const all = store.data.builds.filter(original);
  const clean = all.filter((build) => build.thumb && build.rendered);
  const mosaic = shuffled(clean, "hero").slice(0, 84);
  const spent = sum(all.map((build) => build.cost ?? 0));
  // Agentic builds (r5agent, r7agent) carry no wall time.
  const hours = sum(all.map((build) => build.wallMs ?? 0)) / 3600e3;
  const models = new Set(all.map((build) => build.model));
  root.innerHTML = `
    <section class="hero">
      <div class="mosaic nav-scope">${mosaic.map((build) => `<img loading="lazy" src="${build.thumb}" alt="" data-slug="${build.slug}">`).join("")}</div>
      <div class="hero-text">
        <p class="kicker">agentic-3js-builder · lab report · Oct 7–8, 2026</p>
        <h1>Prompt bake-off</h1>
        <p class="lead">One system prompt, one pitch, one reply, the way an app runs the SDK. ${int(all.length)} three.js models from ${models.size} models and 7 prompts, and what changed along the way.</p>
        <div class="statrow">${stat(int(all.length), "builds")}${stat(int(all.filter((build) => build.rendered).length), "rendered")}${stat(String(store.roundList.length - 1), "rounds + 1 re-check")}${stat(String(models.size), "models")}${stat(String(store.data.subjects.length), "subjects × terse/rich")}${stat(money(spent), "spent")}${stat(`${Math.round(hours)} h`, "of model time, summed")}</div>
      </div>
    </section>
    <div class="story">
      <nav class="toc">${CHAPTERS.map((chapter) => `<a href="#story/${chapter.id}" data-ch="${chapter.id}"><span>${chapter.num}</span>${esc(chapter.title)}</a>`).join("")}</nav>
      <div class="chapters">${CHAPTERS.map(
        (chapter) => `<section class="chapter" id="ch-${chapter.id}">
          <div class="ch-meta"><span class="ch-num">${chapter.num}</span><time>${esc(chapter.when)}</time></div>
          <h2>${esc(chapter.title)}</h2>${chapter.body()}</section>`,
      ).join("")}</div>
    </div>`;
  // The table of contents follows the chapter in view.
  const links = new Map(
    [...root.querySelectorAll<HTMLAnchorElement>(".toc a")].map((link) => [link.dataset.ch!, link]),
  );
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries)
        if (entry.isIntersecting) {
          for (const link of links.values()) link.classList.remove("on");
          links.get(entry.target.id.slice(3))?.classList.add("on");
        }
    },
    { rootMargin: "-30% 0px -60% 0px" },
  );
  root.querySelectorAll(".chapter").forEach((section) => observer.observe(section));
}
