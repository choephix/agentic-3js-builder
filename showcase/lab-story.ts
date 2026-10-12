// The lab page's story: what was tried during the bake-off, in the order it happened, with the numbers read live
// from the rounds. Stefan's words are quoted from the session; everything measured comes from `store`.
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

const t = (round: string) => tally(builds([round]));
const pool = (...rounds: string[]) => tally(builds(rounds));
const rate = (round: string) => `${t(round).rendered}/${t(round).n}`;

/** Events on the night's timeline, at their commit or message times. */
const EVENTS: Array<[string, string]> = [
  ["2026-10-07T13:59:00Z", "Kickoff"],
  ["2026-10-07T14:17:50Z", "P0 fixes cb52341"],
  ["2026-10-07T14:28:00Z", "“30 at a time”"],
  ["2026-10-07T15:06:10Z", "SDK pass 1 · 6cc54cd"],
  ["2026-10-07T20:16:00Z", "“Fuck.” (effort was medium)"],
  ["2026-10-07T20:22:47Z", "SDK pass 2 · c000f88"],
  ["2026-10-07T20:44:00Z", "Haiku 5.5 added"],
  ["2026-10-07T22:57:00Z", "2-hour limit stops r2haikux"],
];

/** Every build as a line from request to reply, one lane per round, on the night's clock (your time zone). */
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
const ask = (quote: string, when = "") =>
  `<blockquote class="ask">“${quote}”<cite>Stefan${when ? ` · ${when}` : ""}</cite></blockquote>`;
const explore = (...links: Array<[string, string]>) =>
  `<p class="explore">${links.map(([href, label]) => `<a href="${href}">${label} →</a>`).join("")}</p>`;

type Chapter = { id: string; num: string; when: string; title: string; body: () => string };

const CHAPTERS: Chapter[] = [
  {
    id: "question",
    num: "00",
    when: "Oct 7 · 16:59",
    title: "The question",
    body: () => `
      ${ask("Time to get serious… one system prompt and one output… a valid module export.")}
      <p class="lead">An app that uses the SDK gives a model one system prompt and the user's pitch, then runs whatever module comes back. The model has no tools, gets no second turn and never sees an error. Two questions: <b>what should that system prompt hold</b> (the SDK's whole source, its docs, or a short brief), and <b>should it push the model to use the SDK or to keep to simple shapes</b>?</p>
      <p>Before anything ran, the plan went to Stefan with seven open questions. His answers set the rules for the whole bake-off:</p>
      <ul class="rules">
        <li><b>One shot.</b> “Let's not worry about iterations… everything runs on one iteration only.” A feedback loop was proposed and left for later.</li>
        <li><b>Two pitch levels.</b> “The terse and the fully designed… A small pitch also has a detailed pitch version of the same thing.”</li>
        <li><b>Creatures first.</b> “These should be half or more of the builds.” One diorama per set. One humanoid: “some kind of fantasy armored knight. Nothing more.”</li>
        <li><b>Default look.</b> Stylized low-poly, no style kits.</li>
        <li><b>Fix the P0 bugs first.</b> “Absolutely do that first thing.”</li>
        <li><b>No judging.</b> “My eyes only. You do no judging.” No model scores a build, and neither does this page: it measures what rendered, what it cost and how long it took.</li>
        <li><b>Sonnet 5.5.</b> “I want to use Sonnet 5.5 as much as possible today.”</li>
      </ul>`,
  },
  {
    id: "setup",
    num: "01",
    when: "Oct 7 · 17:00–17:19",
    title: "Setup: seven prompts, two pitches, one runner",
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
      <p><b>P0 fixes first</b> (<code>cb52341</code>): <code>Frame.moved()</code> kept changing its own quaternion, and <code>spots</code>/<code>scales</code> read an RGB tuple as a list of three colours. A new <code>src/index.ts</code> re-exports the whole SDK, so a module imports everything from one name, <code>"agentic-3js-builder"</code>.</p>
      <p><b>The runner</b> (<code>npm run bakeoff</code>) sends each request through <code>omp auth-gateway stdio</code>: the stored omp logins, about 50 tokens of overhead and nothing else, so the model sees what an app would send. Subagents or <code>omp -p</code> would have added their own instructions.</p>
      <div class="arms-mini">
        ${store.data.arms
          .map(
            (arm) =>
              `<div class="arm-pill" style="--c:${ARM_COLORS[arm.id]}">${armChip(arm.id)}<span><b>${esc(arm.name)}</b><small>${esc(arm.idea)}</small><em>${size(arm.id)} input tokens per call</em></span></div>`,
          )
          .join("")}
      </div>
      <p>Each arm is a <b>reference</b> (the whole <code>src/</code>, the docs, or the brief: the top of <code>docs/api.md</code>) crossed with a <b>taste</b> (SDK-first or primitives-first), plus a plain three.js control. All share one contract: a single TypeScript module that default-exports a function returning the model.</p>
      ${
        fennec
          ? `<div class="pitch-pair"><div><span class="tag">Terse</span><p>${esc(fennec.terse)}</p></div><div><span class="tag rich">Rich</span><p>${esc(fennec.rich)}</p></div></div><p class="mm-note">The first subject's two pitches. Every subject has both.</p>`
          : ""
      }
      ${explore(["#method", "Method, arms and prompt texts"], ["#pitches", "All pitches"])}`;
    },
  },
  {
    id: "r1",
    num: "02",
    when: "Oct 7 · 17:19–18:05",
    title: "Round 1: Sonnet 5.5 at medium",
    body: () => `
      <div class="statrow">${stat("98", "builds: 7 subjects × 2 pitches × 7 arms")}${stat(rate("r1"), "rendered on SDK cb52341", OUTCOMES.clean.color)}${stat(money(t("r1").cost), "spend")}${stat(duration(t("r1").wallMedian), "median per build")}</div>
      ${ask("Could we be a little bit more aggressive with the parallelization, perhaps running 30 at a time?", "17:28")}
      <p>The round started at 10 requests at a time and was raised to 30 halfway. The first count was 77 rendered and 21 failed, but two kinds of “failure” were the harness's: modules with canvas textures need a browser, and builds whose report had errors were never rendered. With both fixed, <b>86 rendered</b>, 9 of them as static meshes the creature lab's rig export would reject, and 12 crashed.</p>
      <p>The <b>brief arms</b> took most of the damage; partway through, brief SDK-first had rendered 1 of 14. A failure analysis found a few natural guesses behind nearly every crash:</p>
      <div class="table-wrap"><table class="scores compact guesses">
        <tr><th>What the model wrote</th><th class="n">Builds</th></tr>
        <tr><td>Hand-made meshes added to <code>b.root</code> or a joint: “no valid skeleton”</td><td class="n">9</td></tr>
        <tr><td><code>b.part({ geometry, color, … })</code>, one object instead of three arguments</td><td class="n">3</td></tr>
        <tr><td>A joint treated as a three.js object: <code>joint.add(mesh)</code></td><td class="n">2</td></tr>
        <tr><td>A Chain or Group passed as <code>parent</code> or <code>bone</code></td><td class="n">2</td></tr>
        <tr><td>The radius inside the options: <code>b.sweep(path, { radius })</code></td><td class="n">1</td></tr>
        <tr><td><code>b.surface(b.root)</code>; a spike with no colour</td><td class="n">2</td></tr>
        <tr><td>The model's own geometry: a lathe outline crossing itself, a zero-length direction</td><td class="n">2</td></tr>
      </table></div>
      <p>The brief's own cheat sheet invited the commonest one: its row read <code>b.part({ at, frame, aim, dir, up })</code>.</p>
      ${armTable(["r1"])}
      ${matrix(["r1"], "docs-sdk", "rich")}
      <aside class="changed"><h4>What changed</h4><ul>
        <li><b>SDK pass 1</b> (<code>6cc54cd</code>): the SDK accepts each guess that has one clear meaning (the one-object <code>part</code>, the radius in options, <code>joint.add</code>, a Chain as a joint, meshes on <code>b.root</code> ride the root joint) and names the call in every other error. 17 of the 21 original failures then build.</li>
        <li>The cheat-sheet rows show the real signatures, and the contract gains a line: “Every piece of geometry joins the model through the builder…”</li>
        <li>The harness renders a build despite report errors, as an app would show it; each round records its SDK commit.</li>
      </ul></aside>
      ${explore([galleryLink({ rounds: "r1" }), "Round 1 in the gallery"], ["#compare?preset=sdkfix", "Before and after SDK pass 1"], ["#failures", "Every failure"])}`,
  },
  {
    id: "r2",
    num: "03",
    when: "Oct 7 · 18:06–18:32",
    title: "Round 2: twenty new subjects",
    body: () => `
      ${ask("Learn from the biggest failures and start another 20 pitches.", "17:38")}
      <div class="statrow">${stat("280", "builds: 20 subjects × 2 × 7")}${stat(rate("r2"), `rendered · ${pct(t("r2").rate)}`, OUTCOMES.clean.color)}${stat(money(t("r2").cost), "spend")}${stat(money(t("r2").costPer), "per build")}</div>
      <p>Fifteen creatures, four props and a Japanese garden, on Sonnet medium with the fixed SDK and 30 requests at a time. The brief arms recovered, and arm by arm the source costs about half as much again as the docs without rendering more often:</p>
      ${armTable(["r1", "r2"])}
      ${matrix(["r2"], "docs-sdk", "rich")}
      ${explore([galleryLink({ rounds: "r2" }), "Round 2 in the gallery"], ["#compare?preset=arms", "One pitch across all seven arms"])}`,
  },
  {
    id: "opus",
    num: "04",
    when: "Oct 7 · 18:17–19:04",
    title: "Opus 5.5 on round 1's prompts",
    body: () => {
      const a = pool("r1resdk");
      const b = pool("r1opus");
      return `
      ${ask("Queue up the first round again, but with opus 5.5 — let's see how much of a difference there is between the two.", "18:17")}
      <p>A new <code>--prompts-from</code> option reran round 1's byte-identical prompts on Opus at medium. Opus ran on the fixed SDK, so round 1's Sonnet replies were rebuilt on that SDK too, unchanged (<code>r1resdk</code>): otherwise the SDK fixes would have counted for Opus.</p>
      <div class="vs">
        <div style="--c:${model("anthropic/claude-sonnet-5-5").color}"><h4>${modelDot("anthropic/claude-sonnet-5-5")}Sonnet medium <small>r1resdk</small></h4>${stat(`${a.rendered}/${a.n}`, "rendered")}${stat(money(a.costPer), "per build")}${stat(duration(a.wallMedian), "median time")}${stat(tokens(a.outputMedian), "median output tokens")}${stat(tokens(a.trianglesMedian), "median triangles")}</div>
        <div style="--c:${model("anthropic/claude-opus-5-5").color}"><h4>${modelDot("anthropic/claude-opus-5-5")}Opus medium <small>r1opus</small></h4>${stat(`${b.rendered}/${b.n}`, "rendered")}${stat(money(b.costPer), "per build")}${stat(duration(b.wallMedian), "median time")}${stat(tokens(b.outputMedian), "median output tokens")}${stat(tokens(b.trianglesMedian), "median triangles")}</div>
      </div>
      <p>Three of Opus's first “crashes” were the shared browser dropping its connection mid-render; <code>check</code> now retries once.</p>
      ${matrix(["r1resdk", "r1opus"], "docs-sdk", "rich")}
      ${explore(["#compare?preset=everything", "The fennec in every run × arm"], [galleryLink({ rounds: "r1resdk,r1opus", group: "round" }), "Both rounds in the gallery"])}`;
    },
  },
  {
    id: "r3",
    num: "05",
    when: "Oct 7 · 22:05–22:38",
    title: "Round 3: ten more, on both models",
    body: () => `
      ${ask("Do another batch of 10 with opus", "22:05")}
      <p>Seven creatures (a lion, a penguin, a seahorse, an armadillo, a dragonfly, a koala, a forest spirit), a telescope, a typewriter and a treehouse, on Sonnet and Opus at medium with identical prompts.</p>
      ${armTable(["r3", "r3opus"])}
      <p>One Sonnet reply used its whole 64k-token budget without writing code: the first out-of-tokens build.</p>
      ${matrix(["r3", "r3opus"], "docs-sdk", "rich")}
      ${explore(["#compare?preset=trio", "Sonnet · Opus · Haiku on these pitches"], [galleryLink({ rounds: "r3,r3opus" }), "Round 3 in the gallery"])}`,
  },
  {
    id: "defaults",
    num: "06",
    when: "Oct 7 · 22:52–23:22",
    title: "SDK pass 2: defaults over errors",
    body: () => `
      ${ask("Get an opus:high subagent to make those SDK fixes/improvements", "22:52")}
      <p>On SDK <code>6cc54cd</code>, 28 builds across r1opus, r1resdk, r2, r3 and r3opus still crashed. Pass 1 had given most wrong inputs a <i>named</i> error, but a single-shot model never reads its error, so a named error still loses the build. Pass 2 (<code>c000f88</code>, written by an Opus agent at high effort) gives an input a <b>default</b> wherever one reads plausibly:</p>
      <div class="table-wrap"><table class="scores compact guesses">
        <tr><th>What the model wrote</th><th>What the SDK does now</th></tr>
        <tr><td>No <code>color</code> on a part (lashes, a beak, a fin)</td><td>The colour of the nearest part already built; the first part is grey</td></tr>
        <tr><td><code>b.rod(a, b, r, BARK, { bone })</code></td><td>A colour right after the radius is the colour</td></tr>
        <tr><td>A membrane or slab with no <code>thickness</code></td><td>2% of the shape's own width</td></tr>
        <tr><td><code>extrude({ depth })</code>, <code>part.position</code>, <code>joint.rotation</code></td><td>three.js names work where the meaning is the same</td></tr>
        <tr><td><code>{ at, axis }</code> where a frame goes; one bend for every joint; an outline point repeated</td><td>Read the way they were meant</td></tr>
        <tr><td>A zero-length direction, an unusable surface target</td><td>Still an error, now naming the call and the value</td></tr>
      </table></div>
      <p>Rebuilt from the same replies, <b>21 of the 28 build</b>; 454 earlier samples and builds come out identical. The 7 left: three self-crossing outlines, a zero-length direction, a surface on a joint that carries nothing, joints used as three.js objects throughout (<code>getWorldPosition</code>), and a plain three.js build with an undefined geometry. Round 4 and every Haiku round were checked on this SDK.</p>
      ${explore(["#failures", "Every failure, by message"])}`,
  },
  {
    id: "effort",
    num: "07",
    when: "Oct 7 · 23:15",
    title: "The effort surprise",
    body: () => `
      ${ask("What reasoning level or effort level was used for the Sonnet and Opus subagents here?", "23:15")}
      <p>Medium, for every round so far. Stefan's reply was one word: <b>“Fuck.”</b></p>
      <p>Effort decides how long a model thinks before it answers, and the thinking is billed as output whether or not it is shown. On round 3:</p>
      <div class="table-wrap"><table class="scores compact"><tr><th>Model, medium</th><th class="n">Visible reply</th><th class="n">Billed output</th><th class="n">Hidden share</th></tr>
        <tr><td>${modelDot("anthropic/claude-sonnet-5-5")}Sonnet 5.5</td><td class="n">≈2.2k tokens</td><td class="n">9.4k</td><td class="n">≈76%</td></tr>
        <tr><td>${modelDot("anthropic/claude-opus-5-5")}Opus 5.5</td><td class="n">≈4.0k tokens</td><td class="n">22.9k</td><td class="n">≈83%</td></tr></table></div>
      <p>Opus returns none of its reasoning text; Sonnet returns a summary on most builds. Stefan's omp setup lists Opus 5.5 only up to <b>high</b>, so “xhigh” for Opus meant high from here on. The config was left as it is.</p>`,
  },
  {
    id: "r4",
    num: "08",
    when: "Oct 7 · 23:19 – Oct 8 · 00:14",
    title: "Round 4: four models at full effort",
    body: () => `
      ${ask("Come up with 10 new pitches: 5 plain, 5 rich. Do a bakeoff with sonnet, opus, astra and sol, all at xhigh; skip primitives-first versions.", "23:19")}
      <p>A red panda, a chameleon, a pufferfish, a unicorn foal and a 1950s jukebox, terse and rich, on four arms (source, docs and brief SDK-first, plus plain): 40 builds per model, all 40 sent at once, with a 128k-token cap. The SDK was being edited at that moment, so the prompts were built from the last commit (<code>e50bd37</code>) in a separate worktree and frozen; all four models got the same bytes.</p>
      ${modelTable(["r4sonnet", "r4opus", "r4astra", "r4sol", "r4haiku"], [["Median triangles", (list) => tokens(median(list.filter((build) => build.rendered).map((build) => build.triangles ?? NaN)))]])}
      <p>Sonnet at xhigh wrote about ${tokens(median(builds(["r4sonnet"]).map((build) => build.output ?? NaN)))} tokens per build, and ${t("r4sonnet").counts.nocode} of its 40 replies used all 128k without reaching the code. (Haiku's row joined later, in chapter 9.)</p>
      ${matrix(["r4sonnet", "r4opus", "r4astra", "r4sol", "r4haiku"], "docs-sdk", "rich")}
      ${explore(["#compare?preset=models", "Compare all five, any arm"], [galleryLink({ rounds: "r4sonnet,r4opus,r4astra,r4sol,r4haiku", group: "subject" }), "Round 4 by subject"])}`,
  },
  {
    id: "haiku",
    num: "09",
    when: "Oct 7 · 23:44 – Oct 8 · 02:04",
    title: "Haiku 5.5, a few hours old",
    body: () => {
      const sets: Array<[string, string[]]> = [
        ["Round 1", ["r1resdk", "r1opus", "r1haiku"]],
        ["Round 2", ["r2", "r2haiku"]],
        ["Round 3", ["r3", "r3opus", "r3haiku"]],
        ["Round 4", ["r4sonnet", "r4opus", "r4haiku"]],
      ];
      return `
      ${ask("Everything that was already done with Opus and Sonnet, we want to do now with Haiku 5.5. It's only been out for a couple of hours so if you don't see it or for some unknown reason it's not usable, stop and let me know. Don't push through.", "23:44")}
      <p>It answered on the first try. Haiku reran every round's exact prompts at that round's effort: medium for rounds 1–3, xhigh for round 4. Haiku bills a whole call at a higher rate past 100k input tokens, which the source arm crosses, so the cost estimate learned long-context prices first.</p>
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
      <p>${(() => {
        const haiku = store.data.builds.filter(
          (build) => original(build) && build.model.includes("haiku") && build.checked && !build.rendered,
        );
        const first = haiku.filter((build) => /No joints yet/.test(build.crash ?? "")).length;
        return `${first} of Haiku's ${haiku.length} crashes are one mistake: building parts before the root joint exists (<code>No joints yet</code>). No other model made it.`;
      })()}</p>
      <p class="mm-note">Haiku's rounds were checked on SDK c000f88, which accepts more guesses than the 6cc54cd that Sonnet's and Opus's rounds 1–3 were checked on; that favours Haiku slightly.</p>
      ${ask("Haiku at xhigh, right?", "23:57")}
      <p>Only round 4 was. Rounds 1–3 were queued again at xhigh, one after another in a single background job:</p>
      ${modelTable(["r1haiku", "r1haikux", "r3haiku", "r3haikux", "r2haiku", "r2haikux"])}
      <p>At xhigh, Haiku thinks five to six times longer and runs out of tokens far more often. The job hit the 2-hour limit for background tasks during <code>r2haikux</code>, which stopped at ${t("r2haikux").n} of 280 builds and wasn't restarted; those ${t("r2haikux").n} were checked for this page.</p>
      ${matrix(["r1resdk", "r1opus", "r1haiku", "r1haikux"], "docs-sdk", "rich")}
      ${explore(["#compare?preset=effort", "Medium vs xhigh"], [galleryLink({ rounds: "r1haiku,r2haiku,r3haiku,r4haiku,r1haikux,r2haikux,r3haikux", group: "round" }), "Every Haiku build"])}`;
    },
  },
  {
    id: "time",
    num: "10",
    when: "Oct 8 · 06:32–06:39",
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
      ${ask("Time per build (range)?", "06:32")}${ask("Sol thought for 40min??", "06:37")}
      <div class="table-wrap"><table class="scores compact"><tr><th>Model, effort</th><th class="n">Fastest</th><th class="n">Median</th><th class="n">90% by</th><th class="n">Slowest</th><th class="n">tok/s p10 · median · p90</th></tr>${rows}</table></div>
      <p>Every build is one request; the time includes waiting in the provider's queue. In the chart below, the diagonals are constant speeds. Haiku streams fastest, at a steady 200+ tokens per second, so its long builds are long answers. <b>Sol didn't think for 40 minutes.</b> All 40 of its requests started in the same second on one Codex account, and its slowest builds streamed at ${int(speed(sol[0]))} tokens per second against 40+ for its quick ones: the provider was throttling the burst. At one request at a time, a Sol build would take an estimated 6–7 minutes.</p>
      ${tokenScatter()}
      <p>The whole night, one line per build from request to reply:</p>
      ${nightChart()}
      ${explore(["#charts", "All the charts"])}`;
    },
  },
  {
    id: "findings",
    num: "11",
    when: "Measured, not judged",
    title: "What the numbers say",
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
      const spent = sum(store.data.builds.filter(original).map((build) => build.cost ?? 0));
      return `
      <ol class="findings">
        <li><b>The docs render nearly as often as the whole source, for two-thirds of the price.</b> On Sonnet medium (rounds 1–3), the docs arms rendered ${pct(docs.rate)} at ${money(docs.cost)} a build, the whole source ${pct(src.rate)} at ${money(src.cost)}, the brief ${pct(brief.rate)} at ${money(brief.cost)}, and plain three.js ${pct(plain.rate)} at ${money(plain.cost)}, with no rig.</li>
        <li><b>A single-shot SDK has to forgive.</b> A model that never sees its error can't recover from it. The two SDK passes turned 17 of 21, then 21 of 28, crashes into builds by accepting what the models naturally wrote. Brief arms gained the most.</li>
        <li><b>More effort cost more and failed more often.</b> At xhigh, Sonnet rendered ${rate("r4sonnet")} (${t("r4sonnet").counts.nocode} out of tokens) and Haiku fell from ${rate("r1haiku")} to ${rate("r1haikux")} on round 1. Builds took 5–12× as long, and Haiku's xhigh rounds cost about 4× its medium ones. Opus at high rendered ${rate("r4opus")}.</li>
        <li><b>The models trade price for reliability.</b> At medium: Opus ${pct(opusAll.rate)} at ${money(opusAll.costPer)} a build, Sonnet ${pct(sonnetAll.rate)} at ${money(sonnetAll.costPer)}, Haiku ${pct(haikuMedium.rate)} at ${money(haikuMedium.costPer)}.</li>
        <li><b>Rich pitches build more.</b> On Sonnet medium, the median rendered build has ${int(levels("terse"))} parts from a terse pitch and ${int(levels("rich"))} from a rich one.</li>
        <li><b>Time depends on load as much as on the model.</b> The medium-effort Claude models take 1–5 minutes a build; at xhigh, builds take 6–45 minutes, and a burst of requests to one account can slow a provider several-fold.</li>
        <li><b>Not measured: quality.</b> ${int(store.data.builds.filter(original).length)} builds and ${money(spent)} later, which ones are <i>good</i> is for your eyes: the gallery, compare's presets, blind mode (B) and stars (S).</li>
      </ol>`;
    },
  },
  {
    id: "open",
    num: "12",
    when: "Left open",
    title: "Open threads",
    body: () => `
      <ul class="rules">
        <li><b>Equal footing.</b> Rebuild rounds 1–3 of Sonnet and Opus on SDK c000f88, like Haiku and round 4. No model spend; about 20 minutes of rendering.</li>
        <li><b>True latency.</b> A handful of builds per model at one or two requests at a time, away from bursts.</li>
        <li><b>Opus at xhigh.</b> Needs Opus 5.5's effort list in Stefan's omp config extended past high.</li>
        <li><b>r2haikux.</b> ${t("r2haikux").n} of 280 done; the runner resumes where it stopped.</li>
        <li><b>A second turn.</b> Feed the render report (or a crash) back once, the door left open at the start.</li>
        <li><b>What still crashes after pass 2:</b> self-crossing outlines, zero-length directions, joints used as three.js objects, surfaces on empty joints.</li>
        <li><b>Style kits</b> as another axis, and cheaper models not yet run.</li>
      </ul>`,
  },
];

export function renderStory(root: HTMLElement) {
  const all = store.data.builds.filter(original);
  const clean = all.filter((build) => build.thumb && build.rendered);
  const mosaic = shuffled(clean, "hero").slice(0, 84);
  const spent = sum(all.map((build) => build.cost ?? 0));
  const hours = sum(all.map((build) => build.wallMs)) / 3600e3;
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
