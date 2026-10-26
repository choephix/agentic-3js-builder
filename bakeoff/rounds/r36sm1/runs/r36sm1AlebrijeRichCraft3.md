```ts
import * as THREE from "three";
import { createBuilder, rng, offset, catmull, bezier, limb, countershade, spots, paint, svg } from "agentic-3js-builder";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description:
    "Oaxacan alebrije painted-wood jaguar with an eagle's hooked beak, crest, rainbow wings and tail fan, covered in dots, flowers and suns.",
};

// ---------- palette ----------
const ORANGE = "#f58a1f";
const YELLOW = "#ffd23a";
const PINK = "#e8328c";
const TEAL = "#1fb8b0";
const BLUE = "#2b5fd0";
const PURPLE = "#7a3bb5";
const GREEN = "#4cb848";
const RED = "#d6282c";
const CREAM = "#fff0cf";
const BLACK = "#1d1320";
const DOTS = [PINK, TEAL, YELLOW, BLUE, GREEN, PURPLE, RED];

// ---------- textures ----------
function eyeTexture() {
  let dots = "";
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    dots += `<circle cx="${(32 + 22.5 * Math.cos(a)).toFixed(1)}" cy="${(32 + 22.5 * Math.sin(a)).toFixed(1)}" r="1.9" fill="${i % 2 ? PINK : TEAL}"/>`;
  }
  return svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="${BLACK}"/><circle cx="32" cy="32" r="27" fill="${CREAM}"/>${dots}<circle cx="32" cy="32" r="18" fill="${RED}"/><circle cx="32" cy="32" r="14" fill="${YELLOW}"/><circle cx="32" cy="32" r="7.5" fill="${BLACK}"/><circle cx="27.5" cy="27.5" r="3.4" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
}
function flowerTexture() {
  let petals = "";
  const cols = [PINK, YELLOW, TEAL, PURPLE];
  for (let i = 0; i < 8; i++) {
    petals += `<ellipse cx="50" cy="24" rx="9" ry="19" fill="${cols[i % 4]}" stroke="${BLACK}" stroke-width="2.2" transform="rotate(${i * 45} 50 50)"/>`;
  }
  let ring = "";
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    ring += `<circle cx="${(50 + 46 * Math.cos(a)).toFixed(1)}" cy="${(50 + 46 * Math.sin(a)).toFixed(1)}" r="2.6" fill="${i % 2 ? CREAM : BLACK}"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100">${ring}${petals}<circle cx="50" cy="50" r="12" fill="${ORANGE}" stroke="${BLACK}" stroke-width="2.4"/><circle cx="50" cy="50" r="5" fill="${BLACK}"/></svg>`,
    { size: 256 },
  );
}
function sunTexture() {
  let rays = "";
  for (let i = 0; i < 14; i++) {
    rays += `<path d="M44 26 L50 2 L56 26Z" fill="${i % 2 ? PINK : TEAL}" stroke="${BLACK}" stroke-width="2" stroke-linejoin="round" transform="rotate(${(i * 360) / 14} 50 50)"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100">${rays}<circle cx="50" cy="50" r="25" fill="${YELLOW}" stroke="${BLACK}" stroke-width="3"/><circle cx="50" cy="50" r="17" fill="${ORANGE}"/><circle cx="50" cy="50" r="8" fill="${RED}" stroke="${BLACK}" stroke-width="2"/></svg>`,
    { size: 256 },
  );
}
function featherCard(a: string, b2: string, c: string) {
  return svg(
    `<svg viewBox="0 0 32 64"><path d="M16 64 C1 44 3 16 16 1 C29 16 31 44 16 64Z" fill="${a}" stroke="${BLACK}" stroke-width="2.2"/><path d="M16 50 C7 38 8 22 16 10 C24 22 25 38 16 50Z" fill="${b2}"/><path d="M16 30 C12 24 13 18 16 12 C19 18 20 24 16 30Z" fill="${c}"/><path d="M16 62 L16 6" stroke="${BLACK}" stroke-width="2"/></svg>`,
    { size: 128 },
  );
}

export default function build() {
  const b = createBuilder({ name: "alebrijeJaguarEagle" });
  const rand = rng(11);

  const EYE = eyeTexture();
  const FLOWER = flowerTexture();
  const SUN = sunTexture();
  const FEATHERS = [featherCard(TEAL, PINK, YELLOW), featherCard(PINK, YELLOW, BLUE), featherCard(YELLOW, ORANGE, RED)];

  const BODY = countershade(
    spots(ORANGE, [PURPLE, BLUE, RED], { size: 0.11, amount: 0.45, rosette: true, seed: 3 }),
    CREAM,
    { level: -0.4 },
  );
  const LEGPAINT = paint((_p, _n, s) => {
    const k = Math.floor(s[0] * 9) % 3;
    return k === 0 ? PINK : k === 1 ? YELLOW : TEAL;
  });
  const TAILPAINT = paint((_p, _n, s) => {
    const k = Math.floor(s[0] * 16) % 3;
    return k === 0 ? PINK : k === 1 ? YELLOW : s[0] > 0.93 ? RED : TEAL;
  });

  const sphere = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.66, -0.4], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.66, -0.4],
      [0, 0.7, -0.1],
      [0, 0.72, 0.25],
      [0, 0.72, 0.45],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.72, 0.45],
      [0, 0.88, 0.58],
      [0, 1.02, 0.66],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const neckEnd: [number, number, number] = [0, 1.02, 0.66];
  const head = b.joint("head", { parent: neck.joints[1], at: neckEnd, dir: [0, 0.12, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.09, up: -0.05 }),
    aim: head.local({ forward: 0.3, up: -0.06 }),
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.64, -0.5],
      [0, 0.56, -0.88],
      [0, 0.5, -1.25],
      [0, 0.68, -1.58],
      [0, 0.95, -1.7],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ---------- body ----------
  const body = b.sweep(spine, [0.2, 0.235, 0.255, 0.22], { color: BODY });
  b.sweep(neck, [0.15, 0.11], { color: BODY });
  b.sweep(tail, [0.075, 0.04], { color: TAILPAINT });

  const haunch: any[] = [];
  const shoulder: any[] = [];
  for (const s of [1, -1]) {
    haunch.push(b.part(sphere(1, 10, 8), BODY, { bone: hips, at: [s * 0.15, 0.64, -0.4], scale: [0.14, 0.19, 0.2] }));
    shoulder.push(
      b.part(sphere(1, 10, 8), BODY, { bone: spine.joints[2], at: [s * 0.16, 0.62, 0.34], scale: [0.14, 0.18, 0.17] }),
    );
  }
  [1, -1].forEach((s, i) => {
    b.decal(haunch[i], SUN, { at: [s * 0.3, 0.66, -0.4], dir: [s, 0, 0], size: [0.3, 0.3] });
    b.decal(shoulder[i], FLOWER, { at: [s * 0.3, 0.64, 0.34], dir: [s, 0, 0], size: [0.28, 0.28] });
  });

  // dotted rows on the body
  let ci = 0;
  for (let t = 0.06; t < 0.95; t += 0.065) {
    for (const ang of [-62, 62]) {
      b.stick(sphere(0.017, 6, 4), DOTS[ci++ % DOTS.length], body.at(t, ang), { embed: 0.4 });
    }
    b.stick(sphere(0.022, 6, 4), DOTS[ci++ % DOTS.length], body.at(t, 0), { embed: 0.4 });
  }
  // dots down the tail
  for (let t = 0.1; t < 0.95; t += 0.1) {
    b.stick(sphere(0.014, 6, 4), CREAM, b.surface(b.root).nearest(tail.at(t).at), { embed: 0.3 });
  }

  // ---------- feather helper ----------
  const PAL: [string, string, string][] = [
    [TEAL, PINK, YELLOW],
    [PINK, YELLOW, BLUE],
    [YELLOW, ORANGE, RED],
    [BLUE, TEAL, CREAM],
    [PURPLE, PINK, YELLOW],
  ];
  function feather(at: any, bone: any, xd: number[], yd: number[], len: number, wid: number, cols: [string, string, string]) {
    const pts: any = [
      [0, 0],
      [len * 0.3, -wid],
      [len * 0.8, -wid * 0.75],
      [len, 0, "sharp"],
      [len * 0.8, wid * 0.75],
      [len * 0.3, wid],
    ];
    return b.extrude(pts, {
      at,
      x: xd,
      y: yd,
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 1,
      bone,
      color: paint((_p, _n, s) => {
        const f = s[0] / len;
        if (Math.abs(s[1]) < wid * 0.05) return BLACK;
        return f < 0.3 ? cols[0] : f < 0.65 ? cols[1] : cols[2];
      }),
    });
  }

  // ---------- legs ----------
  function leg(front: boolean, s: number) {
    const S = s > 0 ? "L" : "R";
    const root: [number, number, number] = front ? [s * 0.17, 0.6, 0.34] : [s * 0.17, 0.62, -0.4];
    const fz = front ? 0.44 : -0.52;
    const foot: [number, number, number] = [s * 0.2, 0.07, fz];
    const pts = front
      ? limb(root, foot, [0.29, 0.29], [[0, 0, -1]])
      : limb(root, foot, [0.3, 0.27, 0.2], [[0, 0, 1], [0, 0, -1]]);
    const names = front
      ? [`shoulder${S}`, `elbow${S}`, `wrist${S}`]
      : [`hip${S}`, `knee${S}`, `hock${S}`, `ankle${S}`];
    const ch = b.chain(`leg${front ? "F" : "H"}${S}`, pts, {
      parent: front ? spine.joints[2] : hips,
      names,
      role: "leg",
      contact: [s * 0.2, 0, fz],
    });
    b.sweep(ch, front ? [0.085, 0.055] : [0.1, 0.055], { color: LEGPAINT });
    const tip: any = ch.tip!;
    b.part(sphere(1, 8, 6), PINK, { bone: tip, at: [s * 0.2, 0.045, fz + 0.04], scale: [0.08, 0.05, 0.09] });
    for (const dx of [-0.05, 0, 0.05]) {
      b.part(sphere(0.03, 6, 4), YELLOW, { bone: tip, at: [s * 0.2 + dx, 0.032, fz + 0.115] });
      b.spike([s * 0.2 + dx, 0.03, fz + 0.14], [0, -0.3, 1], 0.055, 0.013, { color: CREAM, bone: tip });
    }
    // ankle bracelet dots
    b.sweep(
      catmull(
        [
          [s * 0.2 + 0.065, 0.2, fz - 0.02],
          [s * 0.2, 0.2, fz + 0.045],
          [s * 0.2 - 0.065, 0.2, fz - 0.02],
          [s * 0.2, 0.2, fz - 0.08],
        ],
        { closed: true },
      ),
      0.014,
      { color: TEAL, bone: tip },
    );
  }
  for (const s of [1, -1]) {
    leg(true, s);
    leg(false, s);
  }

  // ---------- head ----------
  const skull = b.part(sphere(1, 12, 9), ORANGE, {
    bone: head,
    at: head.local({ forward: 0.02, up: 0.03 }),
    scale: [0.11, 0.115, 0.11],
  });
  // cheeks + face dots
  for (const s of [1, -1]) {
    b.part(sphere(1, 8, 6), CREAM, {
      bone: head,
      at: head.local({ left: s * 0.07, forward: 0.07, up: -0.03 }),
      scale: [0.05, 0.06, 0.05],
    });
    b.decal(skull, EYE, {
      at: head.local({ left: s * 0.09, forward: 0.08, up: 0.05 }),
      dir: [s * 0.8, 0.1, 0.55],
      size: [0.1, 0.1],
    });
    b.rod(
      head.local({ left: s * 0.095, forward: 0.03, up: 0.08 }),
      head.local({ left: s * 0.035, forward: 0.11, up: 0.095 }),
      0.014,
      BLACK,
      { bone: head },
    );
    for (let k = 0; k < 3; k++) {
      b.part(sphere(0.011, 5, 4), DOTS[(k + 2) % DOTS.length], {
        bone: head,
        at: head.local({ left: s * (0.1 - k * 0.003), forward: -0.02 + k * 0.03, up: -0.01 - k * 0.012 }),
      });
    }
    // jaguar ears
    b.part(sphere(1, 8, 6), ORANGE, {
      bone: head,
      at: head.local({ left: s * 0.085, forward: -0.03, up: 0.1 }),
      scale: [0.05, 0.035, 0.05],
    });
    b.part(sphere(1, 8, 6), PINK, {
      bone: head,
      at: head.local({ left: s * 0.085, forward: -0.012, up: 0.1 }),
      scale: [0.032, 0.02, 0.034],
    });
  }
  // eagle crest
  for (let i = -2; i <= 2; i++) {
    feather(head.local({ back: 0.04, up: 0.09 }), head, [i * 0.35, 0.5, -1], [1, 0, 0.1], 0.24 - Math.abs(i) * 0.02, 0.04, PAL[(i + 2) % 5]);
  }
  // hooked beak
  const beakColor = paint((_p, _n, s) => (s[0] > 0.7 ? RED : s[0] > 0.45 ? ORANGE : YELLOW));
  b.sweep(
    bezier(head.local({ forward: 0.1, up: 0.0 }), head.local({ forward: 0.3, up: 0.03 }), head.local({ forward: 0.37, up: -0.11 })),
    [0.09, 0.012],
    { bone: head, color: beakColor, caps: { start: "flat", end: "point" }, sides: 8 },
  );
  b.sweep(
    bezier(jaw.local({ forward: 0.0, up: 0 }), jaw.local({ forward: 0.14, up: -0.01 }), jaw.local({ forward: 0.28, up: 0.0 })),
    [0.06, 0.012],
    { bone: jaw, color: YELLOW, caps: { start: "flat", end: "point" }, sides: 8 },
  );
  b.part(sphere(1, 6, 4), PINK, { bone: jaw, at: jaw.local({ forward: 0.1, up: 0.03 }), scale: [0.035, 0.07, 0.015] });
  for (const s of [1, -1]) {
    b.part(sphere(0.014, 5, 4), BLACK, { bone: head, at: head.local({ left: s * 0.03, forward: 0.2, up: 0.072 }) });
    b.spike(jaw.local({ left: s * 0.035, forward: 0.13, up: 0.03 }), [0, 1, 0.1], 0.06, 0.013, { color: CREAM, bone: jaw });
  }

  // neck ruff and chest feathers
  const ruffSkin = b.surface(neck.joints.length ? b.root : b.root);
  void ruffSkin;
  const neckHits = b
    .surface(body)
    .scatter(30, { rng: rand, minDist: 0.07, filter: (h: any) => h.at.z > 0.2 && h.n.y > -0.3 });
  b.cards(neckHits, FEATHERS, { size: [0.08, 0.14], lean: 55, bend: 20, vary: 0.25, rng: rng(5), flow: [0, -0.3, -1] });

  // ---------- wings ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${S}`,
      catmull([
        [s * 0.18, 0.88, 0.12],
        [s * 0.45, 1.05, 0.06],
        [s * 0.8, 1.14, -0.02],
        [s * 1.1, 1.1, -0.1],
        [s * 1.38, 1.0, -0.2],
      ]),
      { parent: spine.joints[2], names: (i: number) => `wing${S}${i + 1}`, role: "wing" },
    );
    b.sweep(wing, [0.055, 0.03], { color: PINK });
    for (let k = 0; k <= 10; k++) {
      const t = 0.15 + k * 0.085;
      const cp = wing.at(Math.min(t, 1));
      const bone = cp.bone!;
      const len = 0.3 + 0.28 * t;
      const xd = [s * (0.05 + 0.35 * t), -0.1, -1];
      const yd = [s, 0, 0];
      feather(offset(cp.at, [0, 1, 0], -0.012), bone, xd, yd, len, 0.055, PAL[k % 5]);
      feather(offset(cp.at, [0, 1, 0], 0.012), bone, xd, yd, len * 0.55, 0.05, PAL[(k + 2) % 5]);
      feather(offset(cp.at, [0, 1, 0], 0.026), bone, xd, yd, len * 0.28, 0.04, PAL[(k + 4) % 5]);
    }
    const tipP = wing.at(1);
    for (let k = 0; k < 3; k++) {
      feather(
        offset(tipP.at, [0, 1, 0], -0.02 - k * 0.004),
        tipP.bone!,
        [s * 1, -0.05, -0.25 - k * 0.25],
        [0, 0, 1],
        0.34 - k * 0.04,
        0.04,
        PAL[(k + 1) % 5],
      );
    }
    // wing knuckle dot
    b.part(sphere(0.04, 6, 5), YELLOW, { bone: wing.at(0.5).bone!, at: offset(wing.at(0.5).at, [0, 1, 0], 0.04) });
  }

  // ---------- eagle tail fan ----------
  for (let i = -2; i <= 2; i++) {
    feather([i * 0.03, 0.7, -0.52], hips, [i * 0.28, 0.1, -1], [1, 0, i * 0.1], 0.55 - Math.abs(i) * 0.04, 0.07, PAL[(i + 2) % 5]);
  }
  // tail tip tuft
  const tt = tail.at(1);
  b.part(sphere(1, 7, 5), RED, { bone: tt.bone!, at: tt.at, scale: [0.06, 0.06, 0.06] });
  b.spike(tt.at, [0, 0.4, 1], 0.16, 0.04, { color: YELLOW, bone: tt.bone! });

  return b.root;
}
```