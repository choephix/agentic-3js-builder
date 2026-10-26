```ts
import * as THREE from "three";
import { createBuilder, rng, bezier, catmull, limb, paint, spots, stripes, countershade, mottle, svg } from "agentic-3js-builder";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description:
    "Oaxacan painted-wood alebrije: a jaguar body with an eagle's head, beak, feathered ruff, wings and fanned tail, covered in dots, stripes and folk flowers.",
};

// ---------- palette ----------
const ORANGE = "#f08a1c", PINK = "#e8337f", TEAL = "#17b8a6", BLUE = "#2457c9", YELLOW = "#ffd21f";
const GREEN = "#4cb944", PURPLE = "#7a2fbf", RED = "#d62828", BLACK = "#1d1320", CREAM = "#fff0c9";
const FEATHERS = [PINK, BLUE, TEAL, YELLOW, RED, PURPLE, GREEN];
const DOTS = [PINK, BLUE, YELLOW, GREEN, PURPLE];

// ---------- textures ----------
const EYE = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#1d1320"/>
  <circle cx="50" cy="50" r="40" fill="#ffd21f"/>
  <circle cx="50" cy="50" r="30" fill="#e8337f"/>
  <circle cx="50" cy="50" r="20" fill="#2457c9"/>
  <circle cx="50" cy="50" r="11" fill="#1d1320"/>
  <circle cx="42" cy="41" r="6" fill="#ffffff"/>
  <circle cx="58" cy="60" r="3" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);
const FLOWER = svg(
  `<svg viewBox="0 0 100 100">
  <g fill="#e8337f" stroke="#1d1320" stroke-width="3">
  <ellipse cx="50" cy="20" rx="12" ry="18"/><ellipse cx="50" cy="80" rx="12" ry="18"/>
  <ellipse cx="20" cy="50" rx="18" ry="12"/><ellipse cx="80" cy="50" rx="18" ry="12"/>
  <ellipse cx="29" cy="29" rx="10" ry="15" transform="rotate(-45 29 29)" fill="#ffd21f"/>
  <ellipse cx="71" cy="71" rx="10" ry="15" transform="rotate(-45 71 71)" fill="#ffd21f"/>
  <ellipse cx="71" cy="29" rx="10" ry="15" transform="rotate(45 71 29)" fill="#ffd21f"/>
  <ellipse cx="29" cy="71" rx="10" ry="15" transform="rotate(45 29 71)" fill="#ffd21f"/>
  </g>
  <circle cx="50" cy="50" r="14" fill="#2457c9" stroke="#1d1320" stroke-width="3"/>
  <circle cx="50" cy="50" r="6" fill="#fff0c9"/>
  </svg>`,
  { size: 192 },
);
const DIAMOND = svg(
  `<svg viewBox="0 0 60 80">
  <path d="M30 2 L58 40 L30 78 L2 40Z" fill="#ffd21f" stroke="#1d1320" stroke-width="3"/>
  <path d="M30 16 L46 40 L30 64 L14 40Z" fill="#e8337f" stroke="#1d1320" stroke-width="2.5"/>
  <circle cx="30" cy="40" r="6" fill="#17b8a6" stroke="#1d1320" stroke-width="2"/>
  </svg>`,
  { size: 128 },
);
const SPIRAL = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="#fff0c9" stroke="#1d1320" stroke-width="4"/>
  <path d="M50 50 m0 -6 a6 6 0 1 1 -6 6 a14 14 0 1 1 14 14 a24 24 0 1 1 -24 -24 a34 34 0 0 1 34 -10" fill="none" stroke="#2457c9" stroke-width="6" stroke-linecap="round"/>
  <circle cx="50" cy="12" r="5" fill="#e8337f"/><circle cx="88" cy="50" r="5" fill="#17b8a6"/>
  <circle cx="50" cy="88" r="5" fill="#e8337f"/><circle cx="12" cy="50" r="5" fill="#17b8a6"/>
  </svg>`,
  { size: 128 },
);

// ---------- paints ----------
const BODY = countershade(
  spots(ORANGE, [BLUE, PURPLE, GREEN, PINK], { size: 0.1, amount: 0.5, seed: 3 }),
  stripes(CREAM, [YELLOW, TEAL], { size: 0.07, axis: "z", width: 0.3 }),
  { level: -0.35, soft: 0.25 },
);
const NECK = stripes(TEAL, [PINK, YELLOW, BLUE], { size: 0.07, axis: "y", width: 0.4 });
const LEG = stripes(ORANGE, [BLACK, PINK], { size: 0.08, axis: "y", width: 0.3 });
const HEADP = paint((p, n) => (n.y > 0.5 ? (mottle(TEAL, GREEN, { size: 0.05 }) as any) : n.z > 0.4 ? YELLOW : TEAL));
const WING_ARM = stripes(BLUE, [YELLOW, PINK], { size: 0.06, axis: "x", width: 0.35 });
const TAILP = stripes(ORANGE, [BLACK, PURPLE], { size: 0.1, axis: "z", width: 0.45 });

export default function build() {
  const b = createBuilder({ name: "alebrije" });
  const r = rng(11);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.8, -0.5], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([[0, 0.8, -0.5], [0, 0.84, -0.1], [0, 0.88, 0.3]]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.tip!;
  const neck = b.chain(
    "neck",
    catmull([[0, 0.88, 0.3], [0, 1.05, 0.5], [0, 1.27, 0.62]]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.27, 0.62], dir: [0, 0.12, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.06, down: 0.06 }),
    aim: head.local({ forward: 0.24, down: 0.07 }),
    role: "jaw",
  });

  // ---------- body ----------
  const body = b.sweep(spine, [0.17, 0.2, 0.22], { color: BODY, sides: 10, caps: "round" });
  const neckTube = b.sweep(neck, [0.16, 0.11], { color: NECK, sides: 8 });
  void neckTube;

  // dots on the back and flanks
  const skin = b.surface(body);
  skin.scatter(40, { rng: r, minDist: 0.1, filter: (h) => h.n.y > -0.1 }).forEach((h, i) => {
    b.stick(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 8), DOTS[i % 5], h, { embed: 0.3 });
    b.stick(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 6), CREAM, h.moved([0, 0.004, 0]), { embed: 0.3 });
  });
  // flank flowers
  for (const s of [1, -1]) {
    const pt = body.at(0.5, -s * 90).at;
    b.decal(body, FLOWER, { at: pt, dir: [s, 0, 0], size: [0.3, 0.3] });
  }

  // ---------- head ----------
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), HEADP, {
    bone: head,
    at: head.local({ forward: 0.06 }),
    scale: [0.14, 0.14, 0.15],
    rotation: [0, 0, 0],
  });
  // upper beak
  const bp0 = head.local({ forward: 0.1, up: 0.0 });
  const bp1 = head.local({ forward: 0.27, up: 0.0 });
  const bp2 = head.local({ forward: 0.31, down: 0.1 });
  const upper = b.sweep(bezier(bp0, bp1, bp2), [0.075, 0.01], {
    bone: head,
    color: YELLOW,
    sides: 8,
    caps: { start: "flat", end: "point" },
  });
  const lower = b.capsule(jaw.at, head.local({ forward: 0.26, down: 0.08 }), [0.05, 0.015], {
    bone: jaw,
    color: ORANGE,
    sides: 8,
  });
  void lower;
  const ups = b.surface(upper);
  for (const s of [1, -1]) {
    const h = ups.nearest(head.local({ forward: 0.17, up: 0.1, left: s * 0.03 }));
    b.stick(new THREE.SphereGeometry(0.014, 6, 4), BLACK, h, { embed: 0.3 });
    // eyes
    b.decal(skull, EYE, {
      at: head.local({ left: s * 0.12, up: 0.04, forward: 0.11 }),
      dir: [s * 0.75, 0.05, 0.66],
      size: [0.11, 0.11],
    });
    // brow
    b.capsule(
      head.local({ left: s * 0.04, up: 0.125, forward: 0.2 }),
      head.local({ left: s * 0.125, up: 0.1, forward: 0.07 }),
      0.02,
      { bone: head, color: BLACK, sides: 6 },
    );
    // jaguar ears
    const ear = b.part(new THREE.SphereGeometry(0.055, 8, 6), ORANGE, {
      bone: head,
      at: head.local({ left: s * 0.1, up: 0.13, forward: -0.02 }),
      scale: [1, 1.1, 0.7],
    });
    void ear;
    b.part(new THREE.SphereGeometry(0.035, 6, 5), PINK, {
      bone: head,
      at: head.local({ left: s * 0.1, up: 0.135, forward: 0.01 }),
    });
    // cheek whisker dots
    for (let i = 0; i < 3; i++)
      b.part(new THREE.SphereGeometry(0.01, 5, 4), BLACK, {
        bone: head,
        at: head.local({ left: s * (0.07 + i * 0.012), down: 0.01 + i * 0.012, forward: 0.2 }),
      });
  }
  b.decal(skull, DIAMOND, { at: head.local({ up: 0.11, forward: 0.12 }), dir: [0, 0.8, 0.45], size: [0.07, 0.09] });
  // eagle crest
  for (let i = 0; i < 7; i++)
    b.spike(head.local({ up: 0.12, forward: 0.1 - i * 0.04 }), [0, 0.8, -0.45], 0.2 - i * 0.012, 0.028, {
      bone: head,
      color: FEATHERS[i % FEATHERS.length],
    });

  // feathered ruff
  [
    { t: 0.1, rad: 0.17, len: 0.22, w: 0.06, n: 14 },
    { t: 0.55, rad: 0.12, len: 0.17, w: 0.045, n: 12 },
  ].forEach((cfg, k) => {
    b.ring(neck.at(cfg.t), { count: cfg.n, radius: cfg.rad, tilt: -55 }, (it) =>
      b.spike(it, it, cfg.len, cfg.w, { color: FEATHERS[(it.i + k * 3) % FEATHERS.length] }),
    );
  });

  // ---------- helpers ----------
  const leafOutline = (L: number, W: number): [number, number][] => [
    [0, 0], [L * 0.3, W], [L * 0.75, W * 0.9], [L, 0], [L * 0.75, -W * 0.9], [L * 0.3, -W],
  ];
  function feather(at: THREE.Vector3, dir: THREE.Vector3, L: number, W: number, c1: string, c2: string, bone: any) {
    const d = dir.clone().normalize();
    b.extrude(leafOutline(L, W), { at, x: d.toArray() as any, thickness: 0.012, color: c1, bone });
    const tipAt = at.clone().addScaledVector(d, L * 0.5).add(new THREE.Vector3(0, 0.008, 0));
    b.extrude(leafOutline(L * 0.45, W * 0.6), { at: tipAt, x: d.toArray() as any, thickness: 0.012, color: c2, bone });
  }

  // ---------- legs ----------
  const frontPaw = (x: number, z: number, bone: any) => {
    b.part(new THREE.SphereGeometry(1, 8, 6), ORANGE, { bone, at: [x, 0.06, z + 0.03], scale: [0.085, 0.06, 0.12] });
    for (let i = -1; i <= 1; i++)
      b.spike([x + i * 0.04, 0.05, z + 0.12], [i * 0.15, -0.35, 1], 0.1, 0.017, { bone, color: i === 0 ? YELLOW : BLACK });
  };
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    // front leg
    const fpts = limb([s * 0.18, 0.74, 0.32], [s * 0.18, 0.065, 0.4], [0.4, 0.4], [[0, 0, -1]]);
    const fl = b.chain(`legF${L}`, fpts, { parent: chest, names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`], role: "leg" });
    b.sweep(fl, [0.1, 0.075, 0.055], { color: LEG, sides: 8 });
    b.part(new THREE.SphereGeometry(1, 8, 6), ORANGE, { bone: fl.joints[0], at: fpts[0], scale: [0.12, 0.18, 0.16] });
    frontPaw(s * 0.18, 0.4, fl.tip!);
    // hind leg
    const hpts = limb([s * 0.18, 0.76, -0.5], [s * 0.18, 0.065, -0.52], [0.32, 0.32, 0.2], [[0, 0, 1], [0, 0, -1]]);
    const hl = b.chain(`legH${L}`, hpts, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `hock${L}`, `ankle${L}`],
      role: "leg",
    });
    b.sweep(hl, [0.11, 0.075, 0.055, 0.05], { color: LEG, sides: 8 });
    b.part(new THREE.SphereGeometry(1, 9, 7), BODY, { bone: hl.joints[0], at: hpts[0], scale: [0.14, 0.22, 0.22] });
    b.decal(hl, SPIRAL, { at: hl.at(0.12, -s * 90).at, dir: [s, 0, 0], size: [0.17, 0.17] });
    frontPaw(s * 0.18, -0.52, hl.tip!);
  }

  // ---------- wings ----------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const pts = [[s * 0.2, 0.98, 0.05], [s * 0.62, 1.3, -0.02], [s * 1.05, 1.5, -0.12], [s * 1.45, 1.5, -0.25]];
    const wing = b.chain(`wing${L}`, catmull(pts), {
      parent: chest,
      names: [`wingRoot${L}`, `wingElbow${L}`, `wingWrist${L}`, `wingTip${L}`],
      role: "wing",
    });
    b.sweep(wing, [0.06, 0.05, 0.04, 0.02], { color: WING_ARM, sides: 8 });
    const n = 10;
    for (let i = 0; i < n; i++) {
      const t = 0.25 + (0.75 * i) / (n - 1);
      const cp = wing.at(t);
      const dir = new THREE.Vector3(s * (0.1 + 0.9 * (t - 0.2)), 0.04, -1);
      feather(cp.at.clone().add(new THREE.Vector3(0, -0.01, 0)), dir, 0.5 + 0.35 * t, 0.075, FEATHERS[i % 7], FEATHERS[(i + 3) % 7], cp.bone);
      // coverts
      const dir2 = new THREE.Vector3(s * (0.05 + 0.6 * (t - 0.2)), 0.04, -1);
      feather(cp.at.clone().add(new THREE.Vector3(0, 0.025, -0.02)), dir2, 0.27, 0.06, FEATHERS[(i + 4) % 7], CREAM, cp.bone);
    }
  }

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([[0, 0.8, -0.6], [0, 0.75, -1.0], [0, 0.7, -1.4], [0, 0.9, -1.7], [0, 1.15, -1.8]]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );
  b.sweep(tail, [0.1, 0.075, 0.05], { color: TAILP, sides: 8 });
  const tip = tail.at(1);
  for (let i = 0; i < 7; i++) {
    const a = ((i - 3) * 20 * Math.PI) / 180;
    const d = new THREE.Vector3(Math.sin(a), Math.cos(a) * 0.9, -0.15);
    const nrm = [-d.y, d.x, 0];
    const L = 0.38 - Math.abs(i - 3) * 0.03;
    const c = FEATHERS[i % 7];
    b.extrude(leafOutline(L, 0.055), { at: tip.at, x: d.clone().normalize().toArray() as any, y: nrm as any, thickness: 0.012, color: c, bone: tip.bone! });
    const tipAt = tip.at.clone().addScaledVector(d.clone().normalize(), L * 0.5);
    b.extrude(leafOutline(L * 0.45, 0.035), { at: tipAt, x: d.clone().normalize().toArray() as any, y: nrm as any, thickness: 0.012, color: YELLOW, bone: tip.bone! });
  }

  return b.root;
}
```