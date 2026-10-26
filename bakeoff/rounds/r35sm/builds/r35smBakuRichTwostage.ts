import * as THREE from "three";
import { type Builder, createBuilder, rng, paint, noise, smoothstep, mix, svg, catmull, limb, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Baku",
  description: "The dream-eating tapir spirit in ukiyo-e woodblock style: indigo hide, cream saddle, vermilion mane and swirling gold clouds.",
};

// Palette (ukiyo-e: indigo, vermilion, paper, sumi ink, gold, pale wave blue)
export const INDIGO = "#1f3a68";
export const INDIGO_DEEP = "#16264a";
export const PRUSSIAN = "#2f5f93";
export const WAVE = "#86b5c6";
export const PAPER = "#efe3c4";
export const PAPER_D = "#d8c79b";
export const VERMILION = "#d9442b";
export const VERMILION_D = "#a8301f";
export const GOLD = "#d9a93a";
export const SUMI = "#1b1a24";
export const BLUSH = "#e9a08a";

// Woodblock body print: indigo with grain streaks, bokashi to Prussian at the belly, cream saddle with fibre speckle.
const BODY_PRINT = paint((p, n, s) => {
  const streak = noise(new THREE.Vector3(p.x * 6, p.y * 0.8, p.z * 0.35), 0.05, 4);
  const line = Math.abs(Math.sin(p.z * 95 + noise(p, 0.12, 3) * 6)) > 0.93 ? 0.45 : 0;
  let c = mix(INDIGO, INDIGO_DEEP, Math.min(1, line + smoothstep(0.55, 0.8, streak) * 0.5));
  c = mix(c, PRUSSIAN, smoothstep(0.1, -0.85, n.y) * 0.9);
  const saddle = smoothstep(0.55, 0.45, Math.abs(p.x) / 0.2 + noise(p, 0.1, 8) * 0.25) * smoothstep(0.1, 0.45, n.y) * smoothstep(-0.45, -0.3, p.z) * smoothstep(0.5, 0.35, p.z);
  const fibre = noise(p, 0.012, 21) > 0.62 ? 0.5 : 0;
  const cream = mix(PAPER, PAPER_D, fibre);
  return mix(c, cream, saddle);
});

// Trunk: fine paper ring wrinkles, blush tip, sumi hairlines.
const TRUNK_PRINT = paint((p, n, s) => {
  const t = s[0];
  const ring = Math.abs(Math.sin(t * 70)) > 0.86 ? 0.55 : 0;
  let c = mix(INDIGO, PAPER, ring * 0.7);
  const hair = Math.abs(Math.sin((s[1] * Math.PI) / 18)) > 0.985 ? 0.8 : 0;
  c = mix(c, SUMI, hair);
  return mix(c, BLUSH, smoothstep(0.7, 0.95, t));
});

// Ear inner drawing: paper rim, blush inner, bokashi to deep indigo at the base.
const EAR_TEX = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9a08a"/><stop offset="0.6" stop-color="#d98a7c"/><stop offset="1" stop-color="#16264a"/></linearGradient></defs>
    <rect width="64" height="64" fill="#efe3c4"/>
    <rect x="9" y="9" width="46" height="46" rx="16" fill="url(#g)"/>
    <path d="M20 44 Q32 18 44 44 M26 46 Q32 28 38 46" stroke="#1b1a24" stroke-width="1.6" fill="none"/>
  </svg>`,
  { size: 128 },
);

export const REQUESTS = [
  {
    id: "foreheadSeal",
    kind: "add",
    part: "skull",
    what: "A vermilion hanko seal with a gold border on the forehead: a small square plate with an inset swirl glyph in PAPER, ink-outlined in SUMI.",
    at: [0, 1.3, 1.05],
    normal: [0, 0.6, 0.8],
    bone: "head",
    room: [0.12, 0.12, 0.06],
  },
  {
    id: "dreamSmoke",
    kind: "add",
    part: "trunk",
    what: "Wisps of dream-smoke curling from the trunk tip: three stacked, flat-coloured curling ribbons in WAVE and PAPER with SUMI outline strokes, as printed cloud scrolls.",
    at: [0, 0.74, 1.52],
    normal: [0, -0.3, 1],
    bone: "trunk4",
    room: [0.4, 0.4, 0.4],
  },
  {
    id: "maneFlames",
    kind: "add",
    part: "neck",
    what: "Richer mane along the neck crest: overlapping flame blades fading VERMILION_D to VERMILION to GOLD tips, with PAPER curl accents at the base.",
    at: [0, 1.25, 0.75],
    normal: [0, 1, 0],
    bone: "neck2",
    room: [0.3, 0.4, 0.6],
  },
  {
    id: "shoulderCloudSwirls",
    kind: "add",
    part: "body",
    what: "A large Hokusai-style cloud scroll on each shoulder: concentric curled ribbons in GOLD and PAPER with SUMI outline, plus small trailing curls, seated on the flank.",
    at: [0.3, 1.0, 0.35],
    normal: [1, 0, 0],
    bone: "spine2",
    room: [0.1, 0.4, 0.4],
  },
  {
    id: "waveHem",
    kind: "add",
    part: "body",
    what: "A band of stylised seigaiha wave scallops in WAVE and PRUSSIAN with PAPER crests running along the lower flank on both sides.",
    at: [0.3, 0.7, -0.1],
    normal: [1, 0, 0],
    bone: "spine1",
    room: [0.1, 0.25, 1.0],
  },
  {
    id: "tailTuft",
    kind: "add",
    part: "tail",
    what: "Fuller lion-like tail tuft: more flame blades around the tail tip in VERMILION, GOLD and PAPER, with a gold band at the base of the tuft.",
    at: [0, 1.3, -1.25],
    normal: [0, 0.3, -1],
    bone: "tail4",
    room: [0.5, 0.5, 0.5],
  },
  {
    id: "pawFur",
    kind: "add",
    part: "paws",
    what: "Tiger-like claws and ink-outlined toe pads for each paw, plus a vermilion fur ruff above each paw.",
    at: [0.2, 0.1, 0.62],
    normal: [0, 0, 1],
    bone: "pawL",
    room: [0.2, 0.15, 0.2],
  },
  {
    id: "earOrnament",
    kind: "add",
    part: "ears",
    what: "A gold ring earring with a vermilion tassel on each ear, and inked fur lines inside the ear in SUMI.",
    at: [0.14, 1.28, 0.93],
    normal: [1, 0, 0],
    bone: "head",
    room: [0.1, 0.18, 0.12],
  },
  {
    id: "eyeBrowMarks",
    kind: "add",
    part: "skull",
    what: "Kabuki-style vermilion brow sweeps and ink lash lines around each eye, extending in a flick toward the temple.",
    at: [0.12, 1.25, 1.08],
    normal: [0.6, 0.3, 0.7],
    bone: "head",
    room: [0.14, 0.1, 0.1],
  },
  {
    id: "bodyPrint",
    kind: "texture",
    part: "body",
    what: "Woodblock texture on the body: INDIGO with fine darker INDIGO_DEEP grain lines, soft bokashi gradient to PRUSSIAN toward the belly, cream saddle with a PAPER_D paper-fibre speckle.",
  },
  {
    id: "trunkRings",
    kind: "texture",
    part: "trunk",
    what: "Trunk with fine PAPER ring wrinkles, a pale BLUSH tip and sumi ink hairlines.",
  },
  {
    id: "earInner",
    kind: "texture",
    part: "ears",
    what: "Ears with a PAPER rim, BLUSH inner and bokashi to INDIGO_DEEP at the base.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "baku" });
  const R = rng(11);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.85, -0.5], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.85, -0.5],
      [0, 0.9, 0.0],
      [0, 0.95, 0.5],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.95, 0.5],
      [0, 1.1, 0.78],
      [0, 1.14, 0.95],
    ]),
    { parent: spine.joints[1], names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.tip ?? neck.joints[2], at: [0, 1.14, 0.95], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.04, 1.0], dir: [0, 0, 1], role: "jaw" });
  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 1.1, 1.12],
      [0, 1.02, 1.38],
      [0, 0.86, 1.52],
      [0, 0.74, 1.5],
    ]),
    { parent: head, names: ["trunk1", "trunk2", "trunk3", "trunk4"], role: "tentacle" },
  );
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.9, -0.75],
      [0, 0.95, -1.0],
      [0, 1.1, -1.2],
      [0, 1.3, -1.25],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ---------- body ----------
  const body = b.sweep(spine, [0.3, 0.34, 0.31], {
    name: "body",
    color: BODY_PRINT,
    caps: "round",
  });
  b.sweep(neck, [0.27, 0.22, 0.19], { name: "neck", color: INDIGO, caps: "round" });

  // head
  const SC: [number, number, number] = [0, 1.16, 1.03];
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), INDIGO, {
    name: "skull",
    bone: head,
    at: SC,
    scale: [0.17, 0.19, 0.24],
  });
  b.sweep(trunk, [0.1, 0.08, 0.065, 0.055], { name: "trunk", color: TRUNK_PRINT, caps: "round" });
  b.part(new THREE.SphereGeometry(0.045, 8, 6), BLUSH, { bone: trunk.tip ?? trunk.joints[3], at: [0, 0.71, 1.5] });
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.014, 6, 4), SUMI, { bone: trunk.joints[3], at: [s * 0.022, 0.7, 1.53] });
  // jaw
  b.part(new THREE.BoxGeometry(0.15, 0.06, 0.22), PAPER, { bone: jaw, at: [0, 1.0, 1.08] });
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.14), VERMILION_D, { bone: jaw, at: [0, 1.035, 1.1] });
  // tusks
  for (const s of [1, -1]) b.spike([s * 0.07, 1.03, 1.17], [s * 0.1, 0.5, 0.85], 0.1, 0.022, { bone: head, color: PAPER });

  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(SC).at(s * 62, 14);
    if (hit) {
      b.stick(new THREE.SphereGeometry(0.04, 8, 6), SUMI, hit, { embed: 0.5 });
      b.stick(new THREE.SphereGeometry(0.034, 8, 6), GOLD, hit.moved([0, 0.01, 0]), { embed: 0.4 });
      b.stick(new THREE.SphereGeometry(0.018, 6, 4), SUMI, hit.moved([0, 0.03, 0]), { embed: 0.3 });
    }
    // brows
    b.rod([s * 0.1, 1.28, 1.12], [s * 0.17, 1.26, 1.0], 0.012, VERMILION, { bone: head });
    // ears
    b.part(new THREE.SphereGeometry(1, 8, 6), "#ffffff", { name: "ears", bone: head, at: [s * 0.14, 1.32, 0.93], scale: [0.03, 0.08, 0.065], texture: EAR_TEX, rotation: [0, s * 90, 0] });
    b.part(new THREE.SphereGeometry(1, 8, 6), PAPER, { bone: head, at: [s * 0.16, 1.32, 0.94], scale: [0.012, 0.055, 0.045] });
  }

  // ---------- legs ----------
  for (const [sd, s] of [["L", 1], ["R", -1]] as const) {
    // front
    const fPts = limb([s * 0.2, 0.85, 0.5], [s * 0.2, 0.06, 0.6], [0.45, 0.45], [[0, 0, -1]]);
    const fl = b.chain(`legF${sd}`, catmull(fPts), { parent: spine.joints[1], names: [`shoulder${sd}`, `elbow${sd}`, `paw${sd}`], role: "leg" });
    b.sweep(fl, [0.12, 0.08, 0.065], { name: "legs", color: INDIGO, caps: "round" });
    // hind
    const hPts = limb([s * 0.2, 0.85, -0.5], [s * 0.2, 0.06, -0.58], [0.45, 0.45], [[0, 0, 1]]);
    const hl = b.chain(`legH${sd}`, catmull(hPts), { parent: hips, names: [`hip${sd}`, `knee${sd}`, `foot${sd}`], role: "leg" });
    b.sweep(hl, [0.13, 0.085, 0.065], { name: "legs", color: INDIGO, caps: "round" });
    for (const [lg, z] of [[fl, 0.6], [hl, -0.58]] as const) {
      const tipJ = lg.tip ?? lg.joints[lg.joints.length - 1];
      b.part(new THREE.SphereGeometry(1, 9, 6), PAPER_D, { name: "paws", bone: tipJ, at: [s * 0.2, 0.05, z + 0.03], scale: [0.09, 0.055, 0.13] });
      for (const dx of [-1, 0, 1])
        b.part(new THREE.SphereGeometry(0.026, 6, 4), PAPER, { bone: tipJ, at: [s * 0.2 + dx * 0.045, 0.035, z + 0.14] });
      b.part(new THREE.TorusGeometry(0.075, 0.016, 5, 10), VERMILION, { bone: tipJ, at: [s * 0.2, 0.15, z], rotation: [90, 0, 0] });
    }
  }

  // ---------- tail ----------
  b.sweep(tail, [0.07, 0.055, 0.045, 0.04], { name: "tail", color: INDIGO, caps: "round" });
  const tipP = tail.at(1).at;
  const tipJ = tail.tip ?? tail.joints[3];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    b.spike(tipP, [Math.cos(a) * 0.5, 0.55 + 0.2 * Math.sin(a), Math.sin(a) * 0.5 - 0.2], 0.28, 0.045, {
      bone: tipJ,
      color: i % 3 === 0 ? GOLD : i % 3 === 1 ? VERMILION : VERMILION_D,
    });
  }

  // ---------- mane crest ----------
  const flame: [number, number, string?][] = [
    [-0.06, 0],
    [0.06, 0],
    [0.05, 0.1],
    [0.0, 0.25, "sharp"],
    [-0.03, 0.12],
  ] as any;
  for (let i = 0; i < 6; i++) {
    const t = 0.05 + i * 0.17;
    const p = neck.at(t).at;
    const j = neck.joints[Math.min(i >> 1, 2)];
    const r = 0.26 - 0.04 * t * 3;
    b.extrude(flame as any, {
      at: [0, p.y + r * 0.85, p.z],
      x: [0, 0, -1],
      y: [0, 1, -0.3],
      thickness: 0.025,
      color: i % 2 ? VERMILION : VERMILION_D,
      bone: j,
    });
  }
  for (let i = 0; i < 4; i++) {
    const z = 0.35 - i * 0.22;
    b.spike([0, 1.18 - i * 0.01, z], [0, 1, -0.4], 0.14, 0.04, { bone: spine.joints[i < 1 ? 1 : 0], color: i % 2 ? GOLD : VERMILION });
  }

  // ---------- cloud swirls on flanks ----------
  const bs = b.surface(body);
  for (const s of [1, -1]) {
    const c = bs.around([0, 0.9, 0.2]).at(s * 90, 18);
    if (c) {
      b.stick(new THREE.TorusGeometry(0.1, 0.014, 5, 14, Math.PI * 1.6).rotateX(Math.PI / 2), GOLD, c, { embed: 0.3 });
      b.stick(new THREE.TorusGeometry(0.06, 0.012, 5, 12, Math.PI * 1.5).rotateX(Math.PI / 2), PAPER, c.moved([0, 0.004, 0]), { embed: 0.3 });
      b.stick(new THREE.SphereGeometry(0.02, 6, 4), VERMILION, c.moved([0, 0.01, 0]), { embed: 0.3 });
    }
    const d = bs.around([0, 0.85, -0.2]).at(s * 90, -5);
    if (d) {
      b.stick(new THREE.TorusGeometry(0.07, 0.012, 5, 12, Math.PI * 1.5).rotateX(Math.PI / 2), WAVE, d, { embed: 0.3 });
      b.stick(new THREE.SphereGeometry(0.016, 6, 4), PAPER, d.moved([0, 0.004, 0]), { embed: 0.3 });
    }
  }
  // small vermilion dots along the back
  for (const h of bs.scatter(10, { rng: R, minDist: 0.18, filter: (h) => h.n.y > 0.6 }))
    b.stick(new THREE.CylinderGeometry(0.025, 0.025, 0.01, 8), VERMILION, h, { embed: 0.4 });

  for (const add of STAGE2) add(b);
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addForeheadSeal(b: Builder) {
  const SEAL_RED = "#e2402a";
  const dir: [number, number, number] = [0, 0.6, 0.8];
  const at: [number, number, number] = [0, 1.3, 1.05];

  const glyph = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="62" height="62" rx="5" fill="#d9442b" stroke="#1b1a24" stroke-width="3"/>
      <rect x="6" y="6" width="52" height="52" rx="3" fill="none" stroke="#d9a93a" stroke-width="3"/>
      <path d="M32 14 C46 14 50 30 40 36 C32 41 24 35 28 29 C31 25 37 28 35 32" fill="none" stroke="#efe3c4" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M18 46 Q32 54 46 46" fill="none" stroke="#efe3c4" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="17" cy="19" r="2.6" fill="#efe3c4"/>
      <circle cx="47" cy="19" r="2.6" fill="#efe3c4"/>
    </svg>`,
    { size: 192 },
  );

  // Backing plate (ink-outlined, gold border block)
  b.part(new THREE.BoxGeometry(0.1, 0.1, 0.014), SUMI, { bone: "head", at, dir, axis: "z" });
  b.part(new THREE.BoxGeometry(0.092, 0.092, 0.018), GOLD, {
    bone: "head",
    at: [at[0], at[1] + 0.0006, at[2] + 0.0004],
    dir,
    axis: "z",
  });
  b.part(new THREE.BoxGeometry(0.08, 0.08, 0.022), SEAL_RED, {
    bone: "head",
    at: [at[0], at[1] + 0.0012, at[2] + 0.0008],
    dir,
    axis: "z",
  });
  // Textured glyph face
  const n = new THREE.Vector3(...dir).normalize();
  const face = new THREE.Vector3(...at).addScaledVector(n, 0.0125);
  b.part(new THREE.PlaneGeometry(0.084, 0.084), "#ffffff", {
    bone: "head",
    at: face,
    dir,
    axis: "z",
    texture: glyph,
  });
  // Corner gold studs
  for (const sx of [-1, 1])
    for (const sy of [-1, 1]) {
      const p = new THREE.Vector3(...at)
        .addScaledVector(new THREE.Vector3(sx * 0.044, 0, 0), 1)
        .add(new THREE.Vector3(0, sy * 0.044 * 0.8, -sy * 0.044 * 0.6))
        .addScaledVector(n, 0.012);
      b.part(new THREE.SphereGeometry(0.007, 6, 4), GOLD, { bone: "head", at: p });
    }
  // Small ink tassel cords hanging below seal
  for (const sx of [-1, 0, 1])
    b.rod([sx * 0.02, at[1] - 0.05, at[2] + 0.04], [sx * 0.024, at[1] - 0.085, at[2] + 0.055], 0.004, VERMILION_D, {
      bone: "head",
    });
}
    return addForeheadSeal;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addDreamSmoke(b: Builder) {
  // ---------- dream smoke: printed cloud scroll cards curling from the trunk tip ----------
  const scroll = (main: string, accent: string) =>
    svg(
      `<svg viewBox="0 0 100 100">
        <path d="M18 88 C8 62 30 44 50 52 C72 60 70 82 54 78 C42 75 44 62 54 64" fill="none" stroke="${SUMI}" stroke-width="13" stroke-linecap="round"/>
        <path d="M18 88 C8 62 30 44 50 52 C72 60 70 82 54 78 C42 75 44 62 54 64" fill="none" stroke="${main}" stroke-width="7" stroke-linecap="round"/>
        <path d="M50 52 C58 30 84 24 90 8" fill="none" stroke="${SUMI}" stroke-width="12" stroke-linecap="round"/>
        <path d="M50 52 C58 30 84 24 90 8" fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>
        <circle cx="30" cy="30" r="9" fill="${SUMI}"/><circle cx="30" cy="30" r="5" fill="${accent}"/>
      </svg>`,
      { size: 192 },
    );
  const texA = scroll(WAVE, PAPER);
  const texB = scroll(PAPER, WAVE);
  const tipJ = "trunk4";
  const layers: [THREE.Texture, number, number, number, number][] = [
    [texA, 0.0, 0.0, 0.34, 0],
    [texB, 0.05, 0.04, 0.28, 1],
    [texA, -0.06, 0.09, 0.22, 0],
  ];
  layers.forEach(([tex, x, y, size, m], i) => {
    const mesh = b.part(new THREE.PlaneGeometry(size, size), "#ffffff", {
      bone: tipJ,
      at: [x, 0.7 + y + i * 0.03, 1.56 + i * 0.05],
      dir: [x * 2, 0.3, 1],
      axis: "z",
      texture: tex,
      name: "dreamSmoke" + i,
    });
    glow(mesh, 0.35);
    // back face so it reads from behind
    b.part(new THREE.PlaneGeometry(size, size), "#ffffff", {
      bone: tipJ,
      at: [x, 0.7 + y + i * 0.03, 1.555 + i * 0.05],
      dir: [-x * 2, -0.3, -1],
      axis: "z",
      texture: tex,
      name: "dreamSmokeBack" + i,
    });
    void m;
  });
  // small curling ribbon trailing up from the trunk tip
  const rib = catmull([
    [0, 0.76, 1.5],
    [0.07, 0.86, 1.6],
    [0.0, 0.97, 1.66],
    [-0.08, 1.04, 1.6],
    [-0.04, 1.1, 1.54],
  ]);
  b.sweep(rib, [0.016, 0.004], { bone: tipJ, color: SUMI, sides: 5, caps: "round" });
  b.sweep(rib, [0.011, 0.002], { bone: tipJ, color: WAVE, sides: 5, caps: "round" });
  for (const [x, y, z, c] of [
    [0.1, 0.9, 1.62, PAPER],
    [-0.1, 1.0, 1.58, WAVE],
    [0.03, 1.12, 1.55, PAPER],
  ] as [number, number, number, string][]) {
    b.part(new THREE.SphereGeometry(0.02, 6, 4), SUMI, { bone: tipJ, at: [x, y, z] });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), c, { bone: tipJ, at: [x, y + 0.004, z + 0.008] });
  }

  // ---------- mane flames along the neck crest ----------
  const blade = (w: number, h: number): [number, number, string?][] => [
    [-w, 0],
    [w, 0],
    [w * 1.1, h * 0.35],
    [w * 0.3, h * 0.75],
    [0, h, "sharp"],
    [-w * 0.5, h * 0.55],
  ];
  const joints = ["neck1", "neck2", "neck3"];
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const z = 0.55 + t * 0.4;
    const y = 1.17 + Math.sin(t * 2.2) * 0.04 + (t > 0.5 ? 0.01 : 0);
    const j = joints[Math.min(2, Math.floor(t * 3))];
    const h = 0.2 - 0.04 * Math.abs(t - 0.4);
    const col = i % 3 === 0 ? VERMILION_D : i % 3 === 1 ? VERMILION : VERMILION;
    for (const layer of [0, 1, 2]) {
      const c = layer === 0 ? VERMILION_D : layer === 1 ? VERMILION : GOLD;
      const k = 1 - layer * 0.25;
      b.extrude(blade(0.04 * k, h * k), {
        at: [(layer - 1) * 0.012 * (i % 2 ? 1 : -1), y + 0.002 * layer, z],
        x: [0, 0, -1],
        y: [(i % 2 ? 1 : -1) * 0.25, 1, -0.7],
        thickness: 0.012,
        bevel: 0.002,
        color: layer === 0 ? col : c,
        bone: j,
        name: "maneBlade",
      });
    }
    // paper curl accent at base
    if (i % 2 === 0) {
      b.part(new THREE.TorusGeometry(0.022, 0.006, 4, 9, Math.PI * 1.5), PAPER, {
        bone: j,
        at: [0.05 * (i % 4 === 0 ? 1 : -1), y - 0.01, z],
        rotation: [0, 90, 0],
      });
    }
  }
  // gold binding band
  b.part(new THREE.TorusGeometry(0.2, 0.012, 4, 14), GOLD, {
    bone: "neck2",
    at: [0, 1.08, 0.78],
    rotation: [75, 0, 0],
  });
}
    return addDreamSmoke;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addShoulderCloudSwirls(b: Builder) {
  // Hokusai-style cloud scroll drawn as a texture, projected onto the flank with decals.
  const scroll = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M50 52 C50 40 64 38 66 50 C68 64 46 70 36 58 C24 44 36 24 56 22 C80 20 90 44 82 62 C74 82 46 88 28 76"
              stroke="#1b1a24" stroke-width="13"/>
        <path d="M50 52 C50 40 64 38 66 50 C68 64 46 70 36 58 C24 44 36 24 56 22 C80 20 90 44 82 62 C74 82 46 88 28 76"
              stroke="#d9a93a" stroke-width="8"/>
        <path d="M50 52 C50 44 60 43 61 51 C62 60 48 63 41 56 C34 47 42 32 56 30 C72 29 80 44 75 57"
              stroke="#efe3c4" stroke-width="3.2"/>
        <path d="M28 76 C18 70 12 78 16 86 C20 92 30 90 30 84" stroke="#1b1a24" stroke-width="9"/>
        <path d="M28 76 C18 70 12 78 16 86 C20 92 30 90 30 84" stroke="#d9a93a" stroke-width="5"/>
        <path d="M82 62 C92 66 96 76 90 83" stroke="#1b1a24" stroke-width="8"/>
        <path d="M82 62 C92 66 96 76 90 83" stroke="#efe3c4" stroke-width="4"/>
      </g>
      <circle cx="50" cy="52" r="6" fill="#d9442b" stroke="#1b1a24" stroke-width="2.5"/>
    </svg>`,
    { size: 256 },
  );

  const body = b.surface(b.root);
  for (const s of [1, -1]) {
    const at: [number, number, number] = [s * 0.3, 1.0, 0.35];
    const hit = body.nearest(at);
    b.decal(b.root, scroll, {
      at: hit,
      dir: [s, 0, 0],
      up: [0, 1, 0],
      size: [0.4, 0.4],
      segments: 12,
      lift: 0.004,
      mirror: s < 0,
      bone: "spine2",
      name: `s23scroll${s > 0 ? "L" : "R"}`,
    });

    // small trailing curls (torus arcs) behind the scroll
    for (let i = 0; i < 3; i++) {
      const p = body.nearest([s * 0.3, 0.86 - i * 0.05, 0.12 - i * 0.07]);
      const curl = new THREE.TorusGeometry(0.035 - i * 0.006, 0.007, 5, 10, Math.PI * 1.5);
      curl.rotateX(Math.PI / 2);
      b.stick(curl, i % 2 ? "#efe3c4" : "#d9a93a", p, { embed: 0.3, bone: "spine2" });
      b.stick(new THREE.SphereGeometry(0.01, 5, 4), "#1b1a24", p.moved([0, 0.004, 0]), {
        embed: 0.3,
        bone: "spine2",
      });
    }
  }
}
    return addShoulderCloudSwirls;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addWaveHem(b: Builder) {
  const R = rng(24);

  // ---------- seigaiha wave band on both flanks ----------
  const waves = svg(
    `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="32" fill="#2f5f93"/>
      ${[0, 1]
        .map((row) =>
          [0, 1, 2, 3, 4]
            .map((i) => {
              const cx = i * 16 + (row ? 0 : 8);
              const cy = row ? 30 : 16;
              return `<g>
        <circle cx="${cx}" cy="${cy}" r="14" fill="#86b5c6" stroke="#1b1a24" stroke-width="1.2"/>
        <circle cx="${cx}" cy="${cy}" r="10" fill="#2f5f93" stroke="#efe3c4" stroke-width="1.6"/>
        <circle cx="${cx}" cy="${cy}" r="6" fill="#86b5c6" stroke="#efe3c4" stroke-width="1.2"/>
        <circle cx="${cx}" cy="${cy}" r="2.4" fill="#efe3c4"/>
      </g>`;
            })
            .join(""),
        )
        .join("")}
      <rect y="0" width="64" height="2" fill="#efe3c4"/>
      <rect y="30" width="64" height="2" fill="#1b1a24"/>
    </svg>`,
    { size: 256 },
  );
  const body = b.surface(b.root);
  for (const s of [1, -1]) {
    const hit = body.nearest([s * 0.6, 0.7, -0.1]);
    const d = b.decal(body, waves, {
      at: hit,
      dir: [s, 0, 0],
      up: [0, 1, 0],
      size: [0.9, 0.22],
      segments: 14,
      lift: 0.004,
      mirror: s < 0,
      bone: "spine1",
    });
    void d;
    // paper foam beads along the band's top edge
    for (let i = 0; i < 7; i++) {
      const z = -0.5 + i * 0.15;
      const h = body.nearest([s * 0.6, 0.78, z]);
      b.stick(new THREE.SphereGeometry(0.014, 6, 4), i % 2 ? PAPER : WAVE, h, { embed: 0.3 });
    }
  }

  // ---------- tail tuft ----------
  const tipJ = "tail4";
  const base: [number, number, number] = [0, 1.3, -1.25];
  // gold band at the base of the tuft
  b.part(new THREE.TorusGeometry(0.06, 0.017, 5, 10), GOLD, {
    bone: tipJ,
    at: [0, 1.28, -1.22],
    dir: [0, 0.3, -1],
    axis: "z",
  });
  const blade: [number, number, string?][] = [
    [-0.045, 0],
    [0.045, 0],
    [0.05, 0.1],
    [0.01, 0.26, "sharp"],
    [-0.035, 0.12],
  ];
  const cols = [VERMILION, GOLD, PAPER, VERMILION_D, VERMILION];
  const N = 12;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const tilt = 0.5 + R() * 0.4;
    const dir: [number, number, number] = [Math.cos(a) * tilt, 0.5 + 0.3 * Math.sin(a), -0.7 - R() * 0.3];
    const dn = new THREE.Vector3(...dir).normalize();
    const tangent = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0);
    b.extrude(blade as any, {
      at: [base[0] + Math.cos(a) * 0.03, base[1] + Math.sin(a) * 0.03, base[2] - 0.02],
      x: tangent.toArray() as [number, number, number],
      y: dn.toArray() as [number, number, number],
      thickness: [0.016, 0.004],
      color: cols[i % cols.length],
      bone: tipJ,
    });
  }
  // longer flame spikes with gold tips
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const dir: [number, number, number] = [Math.cos(a) * 0.45, 0.35 + 0.35 * Math.sin(a), -0.85];
    b.spike(base, dir, 0.3, 0.03, { bone: tipJ, color: i % 2 ? VERMILION : GOLD });
  }
  // tassel ball at the very end
  b.part(new THREE.SphereGeometry(0.035, 6, 5), PAPER, { bone: tipJ, at: [0, 1.32, -1.5] });
  b.part(new THREE.SphereGeometry(0.018, 6, 4), SUMI, { bone: tipJ, at: [0, 1.33, -1.53] });
}
    return addWaveHem;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addPawFur(b: Builder) {
  // Paw layout from stage 1: front paws at z=0.6, hind at z=-0.58, x=±0.2
  const paws: { bone: string; x: number; z: number }[] = [
    { bone: "pawL", x: 0.2, z: 0.6 },
    { bone: "pawR", x: -0.2, z: 0.6 },
    { bone: "footL", x: 0.2, z: -0.58 },
    { bone: "footR", x: -0.2, z: -0.58 },
  ];

  const CLAW = "#f4ead0";
  const clawGeo = () => new THREE.ConeGeometry(0.014, 0.065, 5);
  const padGeo = (r: number) => new THREE.SphereGeometry(r, 6, 4);
  const ruffGeo = new THREE.ConeGeometry(0.03, 0.1, 5);

  for (const p of paws) {
    const bone = p.bone;
    const front = p.z > 0;
    const dir = front ? 1 : -1;
    const toeZ = p.z + dir * 0.14;

    // claws: three per paw, pointing forward and slightly down
    for (const dx of [-1, 0, 1]) {
      b.part(clawGeo(), CLAW, {
        bone,
        at: [p.x + dx * 0.045, 0.03, toeZ + dir * 0.045],
        dir: [dx * 0.12, -0.35, dir],
      });
      // ink outline ring at the claw base
      b.part(new THREE.TorusGeometry(0.02, 0.005, 4, 8), SUMI, {
        bone,
        at: [p.x + dx * 0.045, 0.04, toeZ + dir * 0.012],
        rotation: [90, 0, 0],
      });
    }

    // toe pads: ink-outlined, blush-filled, on the sole front
    for (const dx of [-1, 0, 1]) {
      b.part(padGeo(0.026), SUMI, {
        bone,
        at: [p.x + dx * 0.045, 0.012, toeZ - dir * 0.01],
      });
      b.part(padGeo(0.02), BLUSH, {
        bone,
        at: [p.x + dx * 0.045, 0.02, toeZ - dir * 0.01],
      });
    }
    // main heel pad
    b.part(new THREE.SphereGeometry(1, 7, 5), SUMI, {
      bone,
      at: [p.x, 0.008, p.z - dir * 0.03],
      scale: [0.052, 0.022, 0.05],
    });
    b.part(new THREE.SphereGeometry(1, 7, 5), BLUSH, {
      bone,
      at: [p.x, 0.016, p.z - dir * 0.03],
      scale: [0.042, 0.018, 0.04],
    });

    // vermilion fur ruff above the paw: ring of flame tufts
    const n = 9;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const cx = p.x + Math.cos(a) * 0.085;
      const cz = p.z + Math.sin(a) * 0.085;
      b.part(ruffGeo, i % 3 === 0 ? GOLD : i % 2 ? VERMILION : VERMILION_D, {
        bone,
        at: [cx, 0.17, cz],
        dir: [Math.cos(a) * 0.5, -1, Math.sin(a) * 0.5],
      });
    }
    // gold band under the ruff
    b.part(new THREE.TorusGeometry(0.08, 0.01, 4, 12), GOLD, {
      bone,
      at: [p.x, 0.135, p.z],
      rotation: [90, 0, 0],
    });
  }
}
    return addPawFur;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addEarOrnament(b: Builder) {
  const R = rng(26);

  // textures
  const FURLINE = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 62 Q10 40 16 6 M9 58 Q5 42 8 22 M23 58 Q27 42 24 22" stroke="#1b1a24" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  const BROW = svg(
    `<svg viewBox="0 0 96 32"><path d="M2 26 Q30 2 70 8 Q86 10 94 3 Q80 20 62 20 Q30 18 2 26Z" fill="#d9442b" stroke="#1b1a24" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
    { size: 192 },
  );
  const LASH = svg(
    `<svg viewBox="0 0 64 32"><path d="M2 20 Q30 26 62 4 M10 22 Q14 30 8 31 M24 24 Q28 31 22 31 M38 22 Q44 28 40 31" stroke="#1b1a24" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
    { size: 192 },
  );

  // ---- ears ----
  for (const s of [1, -1]) {
    const ex = s * 0.14;
    // inked fur lines inside ear (on the cream inner face, facing outward)
    b.part(new THREE.PlaneGeometry(0.05, 0.1), "#ffffff", {
      bone: "head",
      at: [s * 0.172, 1.325, 0.945],
      dir: [s, 0, 0.05],
      axis: "z",
      texture: FURLINE,
    });
    // gold ring earring
    b.part(new THREE.TorusGeometry(0.03, 0.007, 6, 12), GOLD, {
      bone: "head",
      at: [s * 0.15, 1.235, 0.935],
      rotation: [0, 90, 0],
    });
    // small bead
    b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD, { bone: "head", at: [s * 0.15, 1.2, 0.935] });
    // tassel: cord, knot, skirt of strands
    b.rod([s * 0.15, 1.2, 0.935], [s * 0.15, 1.15, 0.935], 0.004, SUMI, { bone: "head" });
    b.part(new THREE.CylinderGeometry(0.01, 0.014, 0.02, 6), GOLD, { bone: "head", at: [s * 0.15, 1.15, 0.935] });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const dx = Math.cos(a) * 0.012;
      const dz = Math.sin(a) * 0.012;
      b.spike(
        [s * 0.15 + dx * 0.4, 1.14, 0.935 + dz * 0.4],
        [dx * 1.5, -1, dz * 1.5],
        0.075 + R() * 0.012,
        0.009,
        { bone: "head", color: i % 2 ? VERMILION : VERMILION_D },
      );
    }
    b.part(new THREE.SphereGeometry(0.008, 6, 4), PAPER, { bone: "head", at: [s * 0.15, 1.07, 0.935] });
  }

  // ---- kabuki brows and lashes ----
  const skull = b.root.getObjectByName("skull");
  for (const s of [1, -1]) {
    const hit = b.surface(b.root).around([0, 1.16, 1.03]).at(s * 48, 40);
    const base = hit ? hit.at.clone() : null;
    const bx = s * 0.115;
    // brow sweep decal-like plane tilted outward and up
    b.part(new THREE.PlaneGeometry(0.11, 0.037), "#ffffff", {
      bone: "head",
      at: [bx + s * 0.012, 1.285, 1.085],
      dir: [s * 0.55, 0.3, 0.78],
      axis: "z",
      up: [0, 1, 0],
      texture: BROW,
      rotation: undefined,
    });
    // lash flick toward temple
    b.part(new THREE.PlaneGeometry(0.075, 0.037), "#ffffff", {
      bone: "head",
      at: [s * 0.158, 1.205, 1.04],
      dir: [s * 0.95, 0.1, 0.3],
      axis: "z",
      texture: LASH,
    });
    // vermilion eye-corner flick spike
    b.spike([s * 0.15, 1.235, 1.07], [s * 0.2, 1.27, 0.99], null, 0.012, { bone: "head", color: VERMILION });
    b.spike([s * 0.152, 1.17, 1.075], [s * 0.19, 1.14, 1.0], null, 0.008, { bone: "head", color: SUMI });
    void base;
  }
  void skull;
}
    return addEarOrnament;
  })(),
);
