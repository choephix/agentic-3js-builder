```ts
import * as THREE from "three";
import { bezier, catmull, createBuilder, DEG, frame, limb, mix, mottle, paint, rng, svg } from "agentic-3js-builder";
import type { Joint, OutlinePoint, Paint } from "agentic-3js-builder";
import { cel, furEdge, INK } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Pyro Phoenix",
  description:
    "Cel-shaded, Genshin-style phoenix with flame plumage and wings spread, perched on a gold-trimmed stone altar with a glowing Pyro sigil, braziers and drifting embers.",
};

type V = [number, number, number];

// ---------------------------------------------------------------- palette
const CRIM = "#b81d22";
const RED = "#e0361c";
const EMBER = "#ff5a1c";
const ORANGE = "#ff8a1f";
const GOLD = "#ffc83a";
const PALE = "#fff0a8";
const RUBY = "#ff3b2e";
const LINE = "#6a1424";

const ramp = (cols: string[], t: number) => {
  const k = Math.min(Math.max(t, 0), 1) * (cols.length - 1);
  const i = Math.min(Math.floor(k), cols.length - 2);
  return mix(cols[i], cols[i + 1], k - i);
};
const plumePaint = (cols: string[]) =>
  paint((_p, _n, s) => {
    const c = ramp(cols, s[0]);
    return Math.abs(s[1] - 0.5) < 0.035 ? mix(c, "#fff3b0", 0.55) : c;
  });

const ROWS: Record<string, string[]> = {
  prim: ["#9c1624", "#e0361c", "#ff7a1c", "#ffd04a"],
  sec: ["#a81a22", "#ea4a1c", "#ff8f24", "#ffd85c"],
  ter: ["#b01c20", "#e8401c", "#ff8a1f", "#ffc83a"],
  cov: ["#e8401c", "#ff8a1f", "#ffc83a", "#fff0a0"],
};
const fpCache = new Map<string, Paint>();
const featherPaint = (row: string, L: number) => {
  const key = row + L.toFixed(2);
  let p = fpCache.get(key);
  if (!p) {
    p = paint((_p, _n, s) => ramp(ROWS[row], s[0] / L));
    fpCache.set(key, p);
  }
  return p;
};

const COAT = cel(
  furEdge(
    mottle(CRIM, RED, { size: 0.2, seed: 3 }),
    mottle(GOLD, PALE, { size: 0.14, seed: 5 }),
    { level: -0.1, teeth: 0.3, period: 0.04, along: [0, 0, 1], ink: LINE },
  ),
);
const ARM = cel(mottle(CRIM, RED, { size: 0.15, seed: 8 }));
const GOLDFLUFF = cel(mottle(GOLD, ORANGE, { size: 0.1, seed: 2 }));
const GOLDP = cel("#f4bb3e", "#b2701a");
const LEG = cel("#f0a92e", "#a8641a");
const CLAW = cel("#5a2a22", "#2a1218");
const BEAK = cel("#f7b52e", "#c97a18");
const STONE = cel(mottle("#8d7b78", "#6f5f66", { size: 0.18, seed: 9 }), "#4a3c4f");
const TAIL_P = plumePaint([CRIM, RED, ORANGE, GOLD, PALE]);
const CREST_P = plumePaint([ORANGE, GOLD, PALE]);
const CHEEK_P = plumePaint([RED, ORANGE, GOLD]);

// ---------------------------------------------------------------- textures
const FLAME_D =
  "M32 126 C8 120 2 94 14 70 C20 58 14 44 24 26 C27 38 34 40 31 22 C36 14 40 8 38 2 C50 24 62 54 56 84 C54 108 50 122 32 126Z";
const flameSvg = (flip: boolean, c: string[]) =>
  svg(
    `<svg viewBox="0 0 64 128"><g transform="${flip ? "translate(64 0) scale(-1 1)" : "translate(0 0)"}">
    <path d="${FLAME_D}" fill="${c[0]}"/>
    <path d="${FLAME_D}" fill="${c[1]}" transform="translate(32 126) scale(.66 .74) translate(-32 -126)"/>
    <path d="${FLAME_D}" fill="${c[2]}" transform="translate(32 126) scale(.36 .5) translate(-32 -126)"/>
    </g></svg>`,
    { size: 192 },
  );
const FLAME = flameSvg(false, ["#ff4a1c", "#ff9a24", "#fff0a0"]);
const FLAME_M = flameSvg(true, ["#e8321a", "#ffb02e", "#fffbd0"]);

const TUFT = svg(
  `<svg viewBox="0 0 32 64"><defs><linearGradient id="t" x1="0" y1="1" x2="0" y2="0">
  <stop offset="0" stop-color="#ff7a1c"/><stop offset=".6" stop-color="#ffc83a"/><stop offset="1" stop-color="#fff0a8"/></linearGradient></defs>
  <path d="M16 63 C3 52 3 26 17 1 C29 26 29 52 16 63Z" fill="url(#t)" stroke="#c4361a" stroke-width="2"/>
  <path d="M16 58 L16 14" stroke="#c4361a" stroke-width="1.6" opacity=".7"/></svg>`,
  { size: 128 },
);

const EYE = svg(
  `<svg viewBox="0 0 64 44">
  <path d="M2 34 C14 8 40 2 62 14 C48 38 22 44 2 34Z" fill="#2b0f1c"/>
  <clipPath id="c"><path d="M6 33 C16 12 40 8 58 15 C46 34 22 40 6 33Z"/></clipPath>
  <g clip-path="url(#c)"><rect x="0" y="0" width="64" height="44" fill="#ffd23a"/>
  <ellipse cx="42" cy="24" rx="15" ry="17" fill="#ff8a1f"/>
  <rect x="0" y="0" width="64" height="17" fill="#c4361a" opacity=".55"/></g>
  <ellipse cx="42" cy="25" rx="4.6" ry="12" fill="#2b0f1c"/>
  <circle cx="37" cy="19" r="4.5" fill="#ffffff"/><circle cx="47" cy="30" r="2" fill="#ffffff"/>
  <path d="M2 34 C14 8 40 2 62 14" stroke="#2b0f1c" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
  { size: 256 },
);

let glyphs = "";
for (let i = 0; i < 8; i++)
  glyphs += `<g transform="rotate(${i * 45} 100 100)">
  <path d="M100 10 C106 20 114 24 110 34 C108 40 92 40 90 34 C86 24 96 20 100 10Z" fill="#ff9a2a"/>
  <path d="M100 18 C103 24 107 27 105 33 C103 36 97 36 95 33 C93 27 97 24 100 18Z" fill="#fff0a0"/></g>`;
let ticks = "";
for (let i = 0; i < 48; i++)
  ticks += `<path d="M100 ${i % 2 ? 52 : 50} L100 58" stroke="#ffb02e" stroke-width="2.4" transform="rotate(${i * 7.5} 100 100)"/>`;
const EMBLEM = svg(
  `<svg viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="97" fill="none" stroke="#ffb02e" stroke-width="3.5"/>
  <circle cx="100" cy="100" r="60" fill="none" stroke="#ff7a1c" stroke-width="3"/>
  <circle cx="100" cy="100" r="47" fill="none" stroke="#ffb02e" stroke-width="2"/>
  <circle cx="100" cy="100" r="78" fill="none" stroke="#ff5a1c" stroke-width="1.5" stroke-dasharray="3 5" opacity=".7"/>
  ${glyphs}${ticks}</svg>`,
  { size: 512 },
);

const SIGIL = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#5a1018" stroke="#ffc83a" stroke-width="5"/>
  <circle cx="50" cy="50" r="38" fill="none" stroke="#ff8a1f" stroke-width="1.6"/>
  <path d="M50 14 C58 28 72 34 68 54 C66 70 34 70 32 54 C30 40 42 34 50 14Z" fill="#ff5a1c"/>
  <path d="M50 14 C58 28 72 34 68 54 C66 70 34 70 32 54 C30 40 42 34 50 14Z" fill="#ffb02e" transform="translate(50 66) scale(.64 .68) translate(-50 -66)"/>
  <path d="M50 14 C58 28 72 34 68 54 C66 70 34 70 32 54 C30 40 42 34 50 14Z" fill="#fff6c0" transform="translate(50 66) scale(.34 .42) translate(-50 -66)"/>
  <path d="M50 4 L53 9 L50 14 L47 9Z M50 86 L53 91 L50 96 L47 91Z M4 50 L9 47 L14 50 L9 53Z M86 50 L91 47 L96 50 L91 53Z" fill="#ffc83a"/></svg>`,
  { size: 256 },
);

let runes = "";
for (let i = 0; i < 5; i++) {
  const x = 15 + i * 30;
  const k = i % 3;
  runes += `<g stroke="#ff9a2a" stroke-width="3" stroke-linecap="round" fill="none">
    <path d="M${x} 11 L${x} 39"/>
    ${k === 0 ? `<path d="M${x - 8} 18 L${x} 26 L${x + 8} 18"/>` : ""}
    ${k === 1 ? `<path d="M${x - 8} 30 L${x} 22 L${x + 8} 30"/><path d="M${x - 6} 14 L${x + 6} 14"/>` : ""}
    ${k === 2 ? `<path d="M${x - 8} 24 L${x + 8} 24"/><path d="M${x} 26 L${x + 8} 36"/>` : ""}</g>`;
}
const RUNES = svg(
  `<svg viewBox="0 0 150 50"><rect x="2" y="2" width="146" height="46" rx="6" fill="#2a1420" stroke="#ffc83a" stroke-width="3"/>${runes}</svg>`,
  { size: 384 },
);

// ---------------------------------------------------------------- shape helpers
const featherOutline = (L: number, W: number): OutlinePoint[] => [
  [0, -0.35 * W],
  [0.3 * L, -0.5 * W],
  [0.75 * L, -0.3 * W],
  [L, 0.15 * W, "sharp"],
  [0.78 * L, 0.5 * W],
  [0.4 * L, 0.55 * W],
  [0, 0.3 * W],
];

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const rnd = rng(11);

  // ------------------------------------------------------------ skeleton
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 0.8, -0.2], role: "spine" });
  const SP: V[] = [
    [0, 0.8, -0.2],
    [0, 0.88, -0.02],
    [0, 1.0, 0.14],
    [0, 1.14, 0.24],
  ];
  const spine = b.chain("spine", catmull(SP), { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" });
  const NK: V[] = [
    [0, 1.14, 0.24],
    [0, 1.3, 0.34],
    [0, 1.46, 0.35],
    [0, 1.6, 0.4],
  ];
  const neck = b.chain("neck", catmull(NK), { parent: spine, names: ["neck1", "neck2", "neck3"], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.6, 0.4], dir: [0, -0.08, 1], role: "head" });
  const TL: V[] = [
    [0, 0.8, -0.22],
    [0, 0.77, -0.55],
    [0, 0.74, -0.9],
    [0, 0.74, -1.25],
  ];
  const tail = b.chain("tail", catmull(TL), { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" });

  // ------------------------------------------------------------ stage
  b.lathe(
    [[0, 0], [1.35, 0], [1.35, 0.06], [1.25, 0.1], [1.25, 0.12], [0, 0.12]],
    { at: [0, 0, 0], bone: root, segments: 20, color: STONE },
  );
  b.lathe(
    [[0.96, 0.115], [1.06, 0.115], [1.06, 0.128], [0.96, 0.128]],
    { at: [0, 0, 0], bone: root, segments: 24, color: GOLDP },
  );
  glow(
    b.part(new THREE.PlaneGeometry(1.9, 1.9), "#ffffff", {
      bone: root, at: [0, 0.131, 0], dir: [0, 1, 0], axis: "z", texture: EMBLEM,
    }),
    1,
  );
  const pillar = b.lathe(
    [[0, 0.12], [0.46, 0.12], [0.46, 0.2], [0.36, 0.24], [0.3, 0.3], [0.3, 0.42], [0.4, 0.46], [0.4, 0.5], [0, 0.5]],
    { at: [0, 0, 0], bone: root, segments: 8, spin: 22.5, color: STONE },
  );
  for (const y of [0.2, 0.3, 0.42])
    b.lathe(
      [[0.29, y - 0.012], [y === 0.2 ? 0.47 : 0.325, y - 0.012], [y === 0.2 ? 0.47 : 0.325, y + 0.012], [0.29, y + 0.012]],
      { at: [0, 0, 0], bone: root, segments: 8, spin: 22.5, color: GOLDP },
    );
  b.lathe(
    [[0.36, 0.495], [0.42, 0.495], [0.42, 0.512], [0.36, 0.512]],
    { at: [0, 0, 0], bone: root, segments: 16, color: GOLDP },
  );
  const plaqueHit = b.surface(pillar).ray([0, 0.37, 1.5], [0, 0, -1]);
  if (plaqueHit) glow(b.decal(pillar, RUNES, { at: plaqueHit, size: [0.3, 0.1], segments: 8 }), 1);

  // braziers
  const fireFrames: THREE.Vector3[] = [];
  for (let k = 0; k < 4; k++) {
    const a = (45 + k * 90) * DEG;
    const x = Math.sin(a) * 1.1;
    const z = Math.cos(a) * 1.1;
    b.lathe([[0, 0.12], [0.12, 0.12], [0.08, 0.2], [0.07, 0.4], [0, 0.4]], {
      at: [x, 0, z], bone: root, segments: 8, color: STONE,
    });
    b.lathe([[0, 0.38], [0.07, 0.38], [0.17, 0.5], [0.19, 0.57], [0.16, 0.57], [0.06, 0.45], [0, 0.44]], {
      at: [x, 0, z], bone: root, segments: 10, color: GOLDP,
    });
    glow(
      b.part(new THREE.SphereGeometry(0.11, 8, 5), "#ff7a24", {
        bone: root, at: [x, 0.52, z], scale: [1, 0.4, 1],
      }),
      1.2,
    );
    fireFrames.push(new THREE.Vector3(x, 0.54, z));
  }
  glow(
    b.cards(
      fireFrames.map((p) => frame([p.x, p.y, p.z], [0, 1, 0])),
      [FLAME, FLAME_M],
      { size: [0.2, 0.4], lean: 0, flow: [0, 0, 1], cross: true, vary: 0.2, rng: rng(21), bone: root },
    ),
    1,
  );

  // embers
  for (let i = 0; i < 18; i++) {
    const a = rnd() * Math.PI * 2;
    const rad = 1.2 + rnd() * 1.4;
    const col = ["#ffb23a", "#ff6a2a", "#fff0a0"][i % 3];
    glow(
      b.part(new THREE.OctahedronGeometry(0.014 + rnd() * 0.02, 0), col, {
        bone: root, at: [Math.sin(a) * rad, 0.7 + rnd() * 1.9, Math.cos(a) * rad - 0.4],
      }),
      1.4,
    );
  }

  // ------------------------------------------------------------ body
  const body = b.loft(
    [
      { at: [0, 0.79, -0.34], w: 0.14, h: 0.14 },
      { at: SP[0], w: 0.34, h: 0.36 },
      { at: SP[1], w: 0.42, h: 0.44 },
      { at: SP[2], w: 0.4, h: 0.44 },
      { at: SP[3], w: 0.28, h: 0.32 },
      { at: NK[1], w: 0.17, h: 0.2 },
      { at: NK[2], w: 0.14, h: 0.16 },
      { at: NK[3], w: 0.12, h: 0.13 },
    ],
    { bone: [spine, neck], color: COAT },
  );
  const skin = b.surface(body);

  const chestHits = skin.scatter(70, {
    rng: rng(5), minDist: 0.045, filter: (h) => h.n.z > 0.15 && h.at.y > 0.85 && h.at.y < 1.3,
  });
  b.cards(chestHits, TUFT, { size: [0.07, 0.15], lean: 55, bend: 25, vary: 0.3, rng: rng(6) });
  const ruffHits = skin.scatter(40, {
    rng: rng(7), minDist: 0.04, filter: (h) => h.at.y >= 1.3 && h.n.y < 0.6,
  });
  b.cards(ruffHits, TUFT, { size: [0.05, 0.1], lean: 60, bend: 25, vary: 0.3, rng: rng(8) });
  const backHits = skin.scatter(40, {
    rng: rng(9), minDist: 0.05, filter: (h) => h.n.y > 0.5 && h.at.y < 1.25,
  });
  b.cards(backHits, TUFT, { size: [0.08, 0.16], lean: 70, bend: 30, vary: 0.3, rng: rng(10) });

  // collar, gem and chest sigil
  b.sweep(skin.loop(neck.joints[1], { lift: 0.01 }), 0.02, { color: GOLDP });
  const gemHit = skin.ray([0, 1.3, 1.2], [0, 0, -1]);
  if (gemHit) glow(b.stick(new THREE.OctahedronGeometry(0.04, 0), RUBY, gemHit, { embed: 0.3 }), 1.6);
  const chestHit = skin.ray([0, 1.02, 1.5], [0, 0, -1]);
  if (chestHit) glow(b.decal(skin, SIGIL, { at: chestHit, size: [0.15, 0.15], dir: [0, 0.15, 1], segments: 8 }), 1.1);

  // ------------------------------------------------------------ head
  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), COAT, {
    bone: head, at: head.local({ forward: 0.05, up: 0.03 }), scale: [0.085, 0.08, 0.1],
  });
  const sk = b.surface(skull);
  const upperBeak = b.sweep(
    bezier(
      head.local({ forward: 0.09, up: 0.01 }),
      head.local({ forward: 0.21, up: 0.03 }),
      head.local({ forward: 0.235, down: 0.06 }),
    ),
    (t: number): [number, number] => [0.036 * (1 - t) + 0.003, 0.042 * (1 - t) + 0.003],
    { bone: head, color: BEAK, caps: "point" },
  );
  const jaw = b.joint("jaw", {
    parent: head, at: head.local({ forward: 0.05, down: 0.04 }), aim: head.local({ forward: 0.2, down: 0.04 }), role: "jaw",
  });
  b.sweep(
    bezier(
      head.local({ forward: 0.07, down: 0.04 }),
      head.local({ forward: 0.17, down: 0.045 }),
      head.local({ forward: 0.205, down: 0.03 }),
    ),
    (t: number): [number, number] => [0.028 * (1 - t) + 0.003, 0.022 * (1 - t) + 0.003],
    { bone: jaw, color: BEAK, caps: "point" },
  );
  for (const s of [1, -1]) {
    b.stick(new THREE.SphereGeometry(0.008, 5, 4), INK, upperBeak.at(0.2, s * 70));
    b.decal(skull, EYE, {
      at: head.local({ left: s * 0.09, up: 0.04, forward: 0.07 }),
      dir: [s * 0.85, 0.05, 0.5],
      size: [0.075, 0.052],
      mirror: s > 0,
    });
    const brow = sk.drape(
      catmull([
        head.local({ left: s * 0.1, forward: 0.13, up: 0.1 }),
        head.local({ left: s * 0.1, forward: 0.07, up: 0.12 }),
        head.local({ left: s * 0.1, forward: 0.0, up: 0.1 }),
      ]),
      { lift: 0.004 },
    );
    b.sweep(brow, [0.012, 0.005], { color: INK, bone: head });
  }
  const foreHit = sk.around(skull.at).at(0, 50);
  if (foreHit) {
    b.stick(new THREE.CylinderGeometry(0.03, 0.036, 0.012, 6), GOLDP, foreHit, { embed: 0.3 });
    glow(b.stick(new THREE.OctahedronGeometry(0.028, 0), RUBY, foreHit, { embed: 0.0 }), 1.6);
  }

  // plume helper (flat flame ribbon between two offset edges)
  const plume = (base: V, c1: V, c2: V, tip: V, width: number, lat: V, bone: Joint, fill: Paint, phase = 0) => {
    const path = bezier(base, c1, c2, tip);
    const A: V[] = [];
    const B: V[] = [];
    const n = 12;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const p = path.at(t);
      const env = Math.sin(Math.PI * Math.pow(t, 0.65));
      const w = Math.max(0.006, width * env * (1 + 0.22 * Math.sin(t * 15 + phase)));
      A.push([p.x + lat[0] * w, p.y + lat[1] * w, p.z + lat[2] * w]);
      B.push([p.x - lat[0] * w, p.y - lat[1] * w, p.z - lat[2] * w]);
    }
    b.membrane(A, B, { color: fill, thickness: 0.01, bone });
  };

  // crest + cheek plumes
  const crestTips: V[] = [];
  const crest = (kx: number, w: number, tipX: number, lift: number) => {
    const tip: V = [tipX, 1.88 - lift, -0.08];
    plume([kx, 1.68, 0.4], [kx * 2, 1.8, 0.34], [tipX * 0.7, 1.92 - lift, 0.18], tip, w, [1, 0, 0], head, CREST_P, kx * 30);
    crestTips.push(tip);
  };
  crest(0, 0.045, 0, 0);
  crest(0.04, 0.035, 0.2, 0.1);
  crest(-0.04, 0.035, -0.2, 0.1);
  for (const s of [1, -1])
    plume(
      [s * 0.07, 1.6, 0.36], [s * 0.15, 1.62, 0.22], [s * 0.2, 1.56, 0.0], [s * 0.3, 1.46, -0.22],
      0.04, [0, 1, 0], head, CHEEK_P, s * 4,
    );
  glow(
    b.cards(crestTips.map((p) => frame(p, [0, 1, 0])), [FLAME, FLAME_M], {
      size: [0.07, 0.15], lean: 0, flow: [0, 0, 1], cross: true, rng: rng(31), bone: head,
    }),
    1,
  );

  // ------------------------------------------------------------ legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb(
      [s * 0.11, 0.78, -0.12],
      [s * 0.12, 0.52, 0.05],
      [0.17, 0.18, 0.12],
      [[0, 0, 1], [0, 0, -1]],
    );
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`], role: "leg", contact: [s * 0.12, 0.5, 0.05],
    });
    const foot = leg.joints[leg.joints.length - 1];
    b.sweep(leg, [0.045, 0.028], { color: LEG });
    b.part(new THREE.SphereGeometry(1, 8, 6), GOLDFLUFF, {
      bone: leg.joints[0], at: [s * 0.12, 0.76, -0.1], scale: [0.11, 0.15, 0.13],
    });
    const ap = leg.at(0.72);
    b.lathe([[0.034, -0.025], [0.05, -0.025], [0.05, 0.025], [0.034, 0.025]], {
      at: ap.at, axis: ap.tangent, bone: ap.bone ?? foot, color: GOLDP, segments: 8,
    });
    const F = pts[3];
    for (const ang of [-0.5, 0, 0.5]) {
      const dir = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang));
      const tip = F.clone().addScaledVector(dir, 0.14);
      b.capsule(F, tip, [0.022, 0.017], { color: LEG, bone: foot });
      b.spike(tip, new THREE.Vector3(dir.x, -0.6, dir.z).normalize(), 0.07, 0.016, { color: CLAW, bone: foot });
    }
    const back = F.clone().add(new THREE.Vector3(0, 0, -0.09));
    b.capsule(F, back, [0.02, 0.016], { color: LEG, bone: foot });
    b.spike(back, [0, -0.6, -0.8], 0.06, 0.015, { color: CLAW, bone: foot });
  }

  // ------------------------------------------------------------ tail
  b.sweep(tail, [0.085, 0.03], { color: ARM });
  const tc = tail.at(0.3);
  b.lathe([[0.075, -0.03], [0.09, -0.03], [0.09, 0.03], [0.075, 0.03]], {
    at: tc.at, axis: tc.tangent, bone: tc.bone ?? tail.joints[0], color: GOLDP, segments: 10,
  });
  const tailTips: V[] = [];
  for (let k = -3; k <= 3; k++) {
    const a = k * 0.16;
    const L = 2.3 - Math.abs(k) * 0.3;
    const sx = Math.sin(a);
    const cz = Math.cos(a);
    const yo = (3 - Math.abs(k)) * 0.015;
    const tip: V = [sx * L, 1.0 + (3 - Math.abs(k)) * 0.1, -0.38 - cz * L];
    plume(
      [k * 0.025, 0.78 + yo, -0.38],
      [sx * L * 0.3, 0.7 + yo, -0.38 - cz * L * 0.3],
      [sx * L * 0.65, 0.78 + yo, -0.38 - cz * L * 0.62],
      tip, 0.15 - Math.abs(k) * 0.012, [cz, 0, sx], tail.joints[0], TAIL_P, k,
    );
    tailTips.push(tip);
  }
  for (const s of [1, -1]) {
    const tip: V = [s * 1.25, 1.5, -2.5];
    plume(
      [s * 0.04, 0.8, -0.4], [s * 0.3, 0.65, -1.0], [s * 1.0, 0.85, -1.7], tip,
      0.06, [0, 1, 0], tail.joints[0], TAIL_P, s * 2,
    );
    tailTips.push(tip);
  }
  glow(
    b.cards(tailTips.map((p) => frame(p, [0, 1, 0])), [FLAME, FLAME_M], {
      size: [0.14, 0.3], lean: 0, flow: [0, 0, 1], cross: true, vary: 0.25, rng: rng(41), bone: tail.joints[0],
    }),
    1,
  );

  // ------------------------------------------------------------ wings
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const wpts: V[] = [
      [s * 0.2, 1.08, 0.1],
      [s * 0.62, 1.16, 0.0],
      [s * 1.05, 1.28, 0.06],
      [s * 1.45, 1.3, -0.06],
    ];
    const wing = b.chain(`wing${S}`, wpts, {
      parent: spine, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `handTip${S}`], role: "wing",
    });
    const arm = b.sweep(wing, [0.075, 0.065, 0.05, 0.03], { color: ARM });
    const tipBuckets = new Map<Joint, V[]>();

    const feather = (t: number, ang: number, L: number, W: number, rise: number, row: string, lift: number, flame: boolean) => {
      const pt = wing.at(t);
      const bone = pt.bone ?? wing.joints[0];
      const a = ang * DEG;
      const d = new THREE.Vector3(s * Math.cos(a), rise, -Math.sin(a)).normalize();
      const y = new THREE.Vector3(s * d.z, 0, -s * d.x);
      y.addScaledVector(d, -y.dot(d)).normalize();
      b.extrude(featherOutline(L, W), {
        at: [pt.at.x, pt.at.y + lift, pt.at.z],
        x: [d.x, d.y, d.z],
        y: [y.x, y.y, y.z],
        thickness: 0.008,
        smoothing: 1,
        color: featherPaint(row, L),
        bone,
      });
      if (flame) {
        const tip: V = [
          pt.at.x + d.x * L + y.x * 0.15 * W,
          pt.at.y + lift + d.y * L,
          pt.at.z + d.z * L + y.z * 0.15 * W,
        ];
        const list = tipBuckets.get(bone) ?? [];
        list.push(tip);
        tipBuckets.set(bone, list);
      }
    };

    // primaries
    const nP = 9;
    for (let i = 0; i < nP; i++) {
      const u = i / (nP - 1);
      const t = 0.99 - u * 0.3;
      const ang = 6 + u * 58;
      const L = 1.1 - u * 0.28;
      feather(t, ang, L, 0.17, 0.12 - u * 0.1, "prim", 0, true);
      feather(t, ang, L * 0.5, 0.18, 0.12 - u * 0.1, "cov", 0.014, false);
    }
    // secondaries
    const nS = 8;
    for (let i = 0; i < nS; i++) {
      const u = i / (nS - 1);
      const t = 0.66 - u * 0.34;
      const ang = 72 + u * 20;
      const L = 0.82 - u * 0.08;
      feather(t, ang, L, 0.16, -0.02, "sec", -0.006, true);
      feather(t, ang, L * 0.5, 0.17, -0.02, "cov", 0.008, false);
    }
    // tertials
    for (let i = 0; i < 4; i++) {
      const u = i / 3;
      const t = 0.28 - u * 0.22;
      const ang = 95 + u * 15;
      const L = 0.62 - u * 0.12;
      feather(t, ang, L, 0.15, -0.03, "ter", -0.012, false);
      feather(t, ang, L * 0.5, 0.16, -0.03, "cov", 0.004, false);
    }
    for (const [bone, tips] of tipBuckets)
      glow(
        b.cards(tips.map((p) => frame(p, [0, 1, 0])), [FLAME, FLAME_M], {
          size: [0.11, 0.24], lean: 0, flow: [0, 0, 1], cross: true, vary: 0.3, rng: rng(51 + (s > 0 ? 0 : 7)), bone,
        }),
        1,
      );

    // shoulder puff, leading-edge fluff
    b.part(new THREE.SphereGeometry(1, 8, 6), GOLDFLUFF, {
      bone: wing.joints[0], at: [s * 0.23, 1.1, 0.1], scale: [0.14, 0.1, 0.15],
    });
    const armHits = b.surface(arm).scatter(14, { rng: rng(61 + (s > 0 ? 0 : 3)), minDist: 0.05 });
    b.cards(armHits, TUFT, { size: [0.06, 0.13], lean: 70, bend: 20, vary: 0.3, rng: rng(62), mirror: s < 0 });

    // gold armbands and ruby gems
    for (const t of [0.66, 0.3]) {
      const pw = wing.at(t);
      const rr = t > 0.5 ? 0.05 : 0.062;
      const band = b.lathe(
        [[rr, -0.045], [rr + 0.016, -0.045], [rr + 0.022, 0], [rr + 0.016, 0.045], [rr, 0.045]],
        { at: pw.at, axis: pw.tangent, bone: pw.bone ?? wing.joints[0], color: GOLDP, segments: 10 },
      );
      const gh = b.surface(band).nearest([pw.at.x, pw.at.y + 0.2, pw.at.z]);
      glow(b.stick(new THREE.OctahedronGeometry(0.03, 0), RUBY, gh, { embed: 0.3 }), 1.6);
    }
  }

  return b.root;
}
```