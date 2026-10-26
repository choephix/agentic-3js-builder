import * as THREE from "three";
import { type Builder, createBuilder, rng, bezier, catmull, limb, paint, svg, frame } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description:
    "Oaxacan alebrije painted-wood fantasy: a jaguar body with an eagle's hooked beak, crest, ruff, spread wings and a fanned feather tail, in saturated flat colours with dot-spotted markings.",
};

export const STAGE2: ((b: Builder) => void)[] = [];

// ---- palette (top level so stage 2 can use it) ----
export const ORANGE = "#f28a1e";
export const YELLOW = "#ffd23a";
export const MAGENTA = "#e0287a";
export const TEAL = "#14b5a8";
export const BLUE = "#2a5bd7";
export const GREEN = "#6cc04a";
export const RED = "#d62d2d";
export const INK = "#1e1030";
export const CREAM = "#fff1c9";
export const PURPLE = "#7a3fb8";
export const PINK = "#ff8fb8";
export const GOLD = "#ffb800";
export const WHITE = "#ffffff";
export const SPOT_COLORS = [MAGENTA, TEAL, BLUE, PURPLE, GREEN, RED];

const dotAt = (u: number, v: number, cell: number, rad: number) => {
  const fu = u / cell - Math.round(u / cell);
  const fv = v / cell - Math.round(v / cell);
  return Math.hypot(fu, fv) * cell < rad;
};
const BODY_PAINT = paint((p, n) => {
  const belly = n.y + 0.12 * Math.sin(p.z * 22) < -0.25;
  if (belly) {
    const zz = Math.abs((p.z * 14) % 2 - 1);
    if (Math.abs(n.y + 0.55 - zz * 0.12) < 0.05) return TEAL;
    return CREAM;
  }
  const wave = Math.sin(p.z * 16 + p.x * 8) * 0.04;
  const band = Math.floor((p.z + wave) / 0.14);
  const dc = band % 2 === 0 ? YELLOW : MAGENTA;
  const u = p.z + wave;
  const v = p.x + p.y * 0.7;
  if (band % 2 === 0 || band % 3 === 0) {
    if (dotAt(u - 0.07, v, 0.07, 0.022)) return INK;
    if (dotAt(u - 0.07, v, 0.07, 0.014)) return dc;
  }
  const fu = (u / 0.14) % 1;
  if (Math.abs(fu) < 0.04) return INK;
  return ORANGE;
});
const TAIL_PAINT = paint((_p, _n, s) => {
  const ring = (((s[0] * 14 + s[1] / 180) % 4) + 4) % 4;
  const k = Math.floor(ring);
  const f = ring - k;
  if (f > 0.42 && f < 0.58 && dotAt(s[1], s[0] * 3, 0.5, 0.12)) return WHITE;
  if (Math.abs(f - 0.5) < 0.1 && ((Math.floor(s[1] / 30) + k) % 2 === 0)) return WHITE;
  return [ORANGE, INK, TEAL, YELLOW][k];
});
const LEG_PAINT = paint((p, n) => {
  if (p.y < 0.17) {
    return dotAt(p.x * 2 + p.z, p.y, 0.05, 0.012) ? YELLOW : TEAL;
  }
  const row = Math.floor(p.y / 0.07);
  const c = row % 2 === 0 ? MAGENTA : BLUE;
  if (dotAt(p.z + p.x + n.x * 0.01, p.y - 0.035, 0.055, 0.015) && row % 2 === 0) return c;
  if (row % 2 === 1 && dotAt(p.z * 1.0 + p.x + 0.0275, p.y, 0.055, 0.013)) return c;
  return ORANGE;
});
const WING_PAINT = paint((p, _n, s) => {
  const u = s[0] * 6;
  const v = p.z * 9 + p.y * 3;
  const du = Math.abs((u % 1) - 0.5);
  const dv = Math.abs((v % 1 + 1) % 1 - 0.5);
  const d = du + dv;
  if (d < 0.1) return (Math.floor(u) + Math.floor(v)) % 2 ? YELLOW : PINK;
  if (Math.abs(d - 0.4) < 0.05) return TEAL;
  return PURPLE;
});

export const REQUESTS = [
  {
    id: "faceMask",
    kind: "add",
    part: "head",
    what: "Painted eagle-jaguar face: concentric rings of CREAM, YELLOW and TEAL around each eye like a mask, MAGENTA dotted brow arcs, and small INK dots along the cheek. Keep the eyes visible.",
    at: [0, 1.15, 0.97],
    normal: [0, 0, 1],
    bone: "head",
    room: [0.34, 0.24, 0.12],
  },
  {
    id: "beakDecor",
    kind: "add",
    part: "beakUpper",
    what: "Decorate the hooked beak: nostril slits in INK, a row of tiny RED and BLUE dots down the ridge, a GOLD tip band, and a small YELLOW cere bump at its base.",
    at: [0, 1.15, 1.2],
    normal: [0, 1, 0],
    bone: "head",
    room: [0.14, 0.14, 0.3],
  },
  {
    id: "chestPlumage",
    kind: "add",
    part: "body",
    what: "Eagle breast plumage on the jaguar chest: overlapping rows of scale-shaped feathers in MAGENTA, ORANGE, YELLOW and TEAL, each with an INK outline and a CREAM dot, rows narrowing down to the belly.",
    at: [0, 0.68, 0.58],
    normal: [0, 0, 1],
    bone: "spine3",
    room: [0.4, 0.4, 0.15],
  },
  {
    id: "flankRosettes",
    kind: "add",
    part: "body",
    what: "Large jaguar rosettes on each flank: rings of dots in INK with a TEAL or MAGENTA centre and an outer ring of YELLOW dots, 5-6 rosettes per side, sized about 0.12 m.",
    at: [0.21, 0.78, -0.05],
    normal: [1, 0, 0],
    bone: "spine2",
    room: [0.1, 0.35, 0.7],
  },
  {
    id: "wingCoverts",
    kind: "add",
    part: "wingArmL",
    what: "Rows of small rounded covert feathers on the top of each wing arm in GREEN, YELLOW and PINK with INK dots, plus a MAGENTA wrist tuft. Do both wings.",
    at: [0.65, 1.1, 0.1],
    normal: [0, 1, 0],
    bone: "elbowWL",
    room: [0.9, 0.12, 0.3],
  },
  {
    id: "frontTalons",
    kind: "add",
    part: "pawL",
    what: "Eagle talons on each front paw: three forward curved claws in GOLD with INK tips, and bands of RED and YELLOW dots around the toes. Do all four paws; the hind paws get rear-facing hock spurs.",
    at: [0.2, 0.05, 0.62],
    normal: [0, 0, 1],
    bone: "pawL",
    room: [0.2, 0.12, 0.15],
  },
  {
    id: "earsAndCrest",
    kind: "add",
    part: "head",
    what: "Inner ear detail in PINK with INK dots and a ring of tiny YELLOW dots on the rim of each jaguar ear; add a dotted spine of tiny dots along the head crest spikes.",
    at: [0, 1.28, 0.8],
    normal: [0, 1, 0],
    bone: "head",
    room: [0.3, 0.12, 0.2],
  },
  {
    id: "tailFeatherDots",
    kind: "add",
    part: "tailFan",
    what: "Eyespot ocelli on the fanned tail feathers: concentric dots of INK, YELLOW and TEAL near each feather's tip, and a MAGENTA dotted line down the middle of the central feather.",
    at: [0, 0.9, -1.95],
    normal: [0, 0, -1],
    bone: "tail4",
    room: [0.9, 0.1, 0.5],
  },
  {
    id: "ruffTrim",
    kind: "add",
    part: "ruff",
    what: "Dotted trim on the neck ruff feathers: a row of tiny CREAM dots down each spike and a YELLOW tip dot.",
    at: [0, 1.05, 0.7],
    normal: [0, 0, 1],
    bone: "neck2",
    room: [0.4, 0.3, 0.2],
  },
  {
    id: "bodyPattern",
    kind: "texture",
    part: "body",
    what: "Alebrije painted-wood coat on the torso: ORANGE back with wavy bands of YELLOW and MAGENTA dots, CREAM belly with TEAL zigzag, tiny INK dot outlines everywhere.",
  },
  {
    id: "tailPattern",
    kind: "texture",
    part: "tail",
    what: "Tail tube painted with spiral rings of ORANGE, INK, TEAL and YELLOW and white dots between the rings.",
  },
  {
    id: "legPattern",
    kind: "texture",
    part: "legFrontL",
    what: "Legs painted with dotted stripes: ORANGE with MAGENTA and BLUE dot rows, and a TEAL sock with YELLOW dots near the paw. Apply to all four legs.",
  },
  {
    id: "wingArmPattern",
    kind: "texture",
    part: "wingArmL",
    what: "Wing arms with a repeated diamond-and-dot folk pattern in PURPLE, YELLOW, PINK and TEAL.",
  },
];

// ---- helpers ----
function featherOutline(w: number, l: number): OutlinePoint[] {
  return [
    [0, 0],
    [w, 0.08 * l],
    [w, 0.6 * l],
    [0, l, "sharp"],
    [-w, 0.6 * l],
    [-w, 0.08 * l],
  ] as any;
}
function tipOutline(w: number, l: number): OutlinePoint[] {
  return [
    [-w, 0.6 * l],
    [w, 0.6 * l],
    [0, l, "sharp"],
  ] as any;
}

function feather(
  b: Builder,
  at: THREE.Vector3 | number[],
  bone: any,
  dirIn: number[],
  w: number,
  l: number,
  col: string,
  tip: string,
  name?: string,
) {
  const dir = new THREE.Vector3(...(dirIn as [number, number, number])).normalize();
  const x = new THREE.Vector3(0, 1, 0).cross(dir).normalize();
  const o = { at: at as any, x: x.toArray() as any, y: dir.toArray() as any, bone, name };
  b.extrude(featherOutline(w, l), { ...o, thickness: 0.014, color: col });
  b.extrude(tipOutline(w, l), { ...o, thickness: 0.02, color: tip });
}

export default function build() {
  const b = createBuilder({ name: "alebrijeJaguarEagle" });
  const R = rng(11);

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 0.72, -0.5], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.72, -0.5],
      [0, 0.76, -0.05],
      [0, 0.8, 0.4],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.8, 0.4],
      [0, 1.0, 0.68],
      [0, 1.12, 0.85],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.12, 0.85], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.04, up: -0.07 }),
    aim: head.local({ forward: 0.3, up: -0.07 }),
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.74, -0.6],
      [0, 0.7, -1.0],
      [0, 0.62, -1.4],
      [0, 0.8, -1.75],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ---- body ----
  const body = b.sweep(spine, (t) => [0.2 + 0.03 * Math.sin(t * 3), 0.22 - 0.03 * t], {
    color: BODY_PAINT,
    name: "body",
  });
  const tailTube = b.sweep(tail, (t) => 0.075 * (1 - t) + 0.035, {
    name: "tail",
    color: TAIL_PAINT,
  });
  const neckTube = b.sweep(neck, [0.13, 0.1], { color: ORANGE, name: "neck", sectors: [[130, 230, CREAM]] });

  // spots on body
  const skin = b.surface(body);
  const hits = skin.scatter(30, { rng: R, minDist: 0.11, filter: (h) => h.n.y > -0.2 });
  hits.forEach((h, i) => {
    b.stick(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 7), INK, h, { embed: 0.5 });
    b.stick(new THREE.CylinderGeometry(0.032, 0.032, 0.016, 7), SPOT_COLORS[i % 6], h, { embed: 0.4 });
  });

  // ---- head ----
  b.part(new THREE.SphereGeometry(0.12, 10, 8), ORANGE, {
    bone: head,
    at: head.local({ forward: 0.02 }),
    scale: [1, 0.95, 1.1],
    name: "head",
  });
  b.part(new THREE.SphereGeometry(0.085, 8, 6), CREAM, { bone: head, at: head.local({ forward: 0.08, up: -0.04 }), scale: [1, 0.8, 1], name: "cheek" });
  b.sweep(
    bezier(
      head.local({ forward: 0.08, up: 0.0 }),
      head.local({ forward: 0.25, up: 0.04 }),
      head.local({ forward: 0.33, up: -0.02 }),
      head.local({ forward: 0.3, up: -0.13 }),
    ),
    [0.07, 0.0],
    { bone: head, color: GOLD, caps: { end: "point" }, name: "beakUpper" },
  );
  b.sweep(
    bezier(
      jaw.local({ forward: 0.02, up: 0 }),
      jaw.local({ forward: 0.12, up: 0 }),
      head.local({ forward: 0.25, up: -0.09 }),
    ),
    [0.045, 0.008],
    { bone: jaw, color: YELLOW, caps: { end: "point" }, name: "beakLower" },
  );
  b.part(new THREE.SphereGeometry(0.03, 6, 5), RED, { bone: jaw, at: jaw.local({ forward: 0.05, up: -0.04 }), name: "wattle" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.032, 8, 6), YELLOW, { bone: head, at: head.local({ left: s * 0.085, up: 0.04, forward: 0.07 }) });
    b.part(new THREE.SphereGeometry(0.017, 6, 5), INK, { bone: head, at: head.local({ left: s * 0.105, up: 0.04, forward: 0.085 }) });
    b.rod(head.local({ left: s * 0.04, up: 0.095, forward: 0.13 }), head.local({ left: s * 0.11, up: 0.07, forward: 0.03 }), 0.018, {
      bone: head,
      color: INK,
    });
    // ears
    b.part(new THREE.SphereGeometry(0.05, 8, 6), ORANGE, { bone: head, at: head.local({ left: s * 0.08, up: 0.11, forward: -0.04 }), scale: [1, 1, 0.6] });
    b.part(new THREE.SphereGeometry(0.03, 6, 5), PINK, { bone: head, at: head.local({ left: s * 0.08, up: 0.115, forward: -0.025 }), scale: [1, 1, 0.5] });
  }
  // crest
  const crestCols = [MAGENTA, YELLOW, TEAL, BLUE, PURPLE];
  for (let i = 0; i < 5; i++) {
    b.spike(head.local({ up: 0.1, forward: 0.08 - i * 0.05 }), [0, 1, -0.5 - i * 0.12], 0.16 - i * 0.015, 0.03, {
      bone: head,
      color: crestCols[i],
      sides: 6,
    });
  }

  // neck ruff
  b.ring(neck.at(0.9), { count: 10, radius: 0.12, tilt: -35 }, (it) =>
    b.spike(it, it, 0.14, 0.045, { color: [TEAL, MAGENTA, YELLOW, BLUE, PURPLE][it.i % 5], sides: 6, name: "ruff" }),
  );

  // ---- legs ----
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // front
    const fp = limb([s * 0.2, 0.66, 0.35], [s * 0.2, 0.06, 0.4], [0.34, 0.34], [[0, 0, -1]]);
    const fl = b.chain(`legFront${S}`, fp, { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `paw${S}`], role: "leg" });
    b.sweep(fl, [0.1, 0.05], {
      name: `legFront${S}`,
      color: LEG_PAINT,
    });
    b.part(new THREE.SphereGeometry(0.15, 8, 6), ORANGE, { bone: spine.joints[1], at: [s * 0.2, 0.68, 0.35] });
    const pf = fl.tip ?? fl.joints[1];
    b.part(new THREE.BoxGeometry(0.15, 0.1, 0.2), TEAL, { bone: pf, at: [s * 0.2, 0.05, 0.45] });
    for (const k of [-1, 0, 1]) b.part(new THREE.SphereGeometry(0.03, 6, 5), YELLOW, { bone: pf, at: [s * 0.2 + k * 0.05, 0.035, 0.56] });
    // hind (digitigrade)
    const hp = limb([s * 0.2, 0.7, -0.45], [s * 0.2, 0.06, -0.55], [0.32, 0.32, 0.2], [[0, 0, 1], [0, 0, -1]]);
    const hl = b.chain(`legHind${S}`, hp, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `pawH${S}`],
      role: "leg",
    });
    b.sweep(hl, [0.12, 0.07, 0.05, 0.04], { name: `legHind${S}`, color: LEG_PAINT });
    b.part(new THREE.SphereGeometry(0.17, 8, 6), ORANGE, { bone: hips, at: [s * 0.2, 0.68, -0.45], scale: [0.9, 1.1, 1.2] });
    const ph = hl.tip ?? hl.joints[2];
    b.part(new THREE.BoxGeometry(0.15, 0.1, 0.24), TEAL, { bone: ph, at: [s * 0.2, 0.05, -0.48] });
    for (const k of [-1, 0, 1]) b.part(new THREE.SphereGeometry(0.03, 6, 5), YELLOW, { bone: ph, at: [s * 0.2 + k * 0.05, 0.035, -0.6] });
    // leg spots
    [fl, hl].forEach((leg, li) => {
      for (let i = 0; i < 3; i++) {
        const p = leg.at(0.2 + i * 0.2);
        const h = b.surface(b.root).nearest(p.at);
        b.stick(new THREE.CylinderGeometry(0.024, 0.024, 0.01, 6), SPOT_COLORS[(i + li) % 6], h, { embed: 0.5 });
      }
    });

    // ---- wings ----
    const wp = [
      [s * 0.18, 0.92, 0.2],
      [s * 0.65, 1.05, 0.1],
      [s * 1.15, 1.1, -0.02],
    ];
    const wing = b.chain(`wing${S}`, catmull(wp), {
      parent: spine.joints[1],
      names: [`shoulderW${S}`, `elbowW${S}`, `wristW${S}`],
      role: "wing",
    });
    b.sweep(wing, [0.075, 0.035], { name: `wingArm${S}`, color: WING_PAINT });
    const prim = [BLUE, TEAL, PURPLE, MAGENTA];
    const tips = [YELLOW, MAGENTA, GOLD, CREAM];
    for (let i = 0; i < 10; i++) {
      const t = 0.1 + (0.9 * i) / 9;
      const cp = wing.at(t);
      const a = 0.1 + t * 0.55;
      feather(b, cp.at, cp.bone, [s * Math.sin(a), -0.02, -Math.cos(a)], 0.055, 0.35 + 0.35 * t, prim[i % 4], tips[i % 4], "featherPrimary");
    }
    for (let i = 0; i < 8; i++) {
      const t = 0.08 + (0.85 * i) / 7;
      const cp = wing.at(t);
      const p = cp.at.clone().add(new THREE.Vector3(0, 0.025, 0));
      const a = 0.05 + t * 0.4;
      feather(b, p, cp.bone, [s * Math.sin(a), 0.0, -Math.cos(a)], 0.05, 0.2 + 0.1 * t, [GREEN, YELLOW, PINK][i % 3], [INK, MAGENTA, TEAL][i % 3], "featherCovert");
    }
  }

  // ---- tail fan ----
  const tt = tail.at(1);
  for (let i = 0; i < 7; i++) {
    const a = ((i - 3) / 3) * 0.85;
    feather(
      b,
      tt.at,
      tail.joints[3],
      [Math.sin(a), 0.2, -Math.cos(a)],
      0.06,
      0.55 - Math.abs(i - 3) * 0.05,
      [TEAL, MAGENTA, BLUE, ORANGE][i % 4],
      [YELLOW, CREAM, GOLD, INK][i % 4],
      "tailFan",
    );
  }

  for (const add of STAGE2) add(b);
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addFaceMask(b: Builder) {
  const head = "head";
  const maskTex = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="#1e1030"/>
      <circle cx="50" cy="50" r="42" fill="#fff1c9"/>
      <circle cx="50" cy="50" r="33" fill="#ffd23a"/>
      <circle cx="50" cy="50" r="24" fill="#14b5a8"/>
      <circle cx="50" cy="50" r="14" fill="#1e1030" fill-opacity="0"/>
      <g fill="#1e1030">
        <circle cx="50" cy="4" r="3"/><circle cx="82" cy="18" r="3"/><circle cx="96" cy="50" r="3"/>
        <circle cx="82" cy="82" r="3"/><circle cx="50" cy="96" r="3"/><circle cx="18" cy="82" r="3"/>
        <circle cx="4" cy="50" r="3"/><circle cx="18" cy="18" r="3"/>
      </g>
    </svg>`,
    { size: 128 },
  );
  const browTex = svg(
    `<svg viewBox="0 0 100 40">
      <g fill="#e0287a" stroke="#1e1030" stroke-width="2">
        <circle cx="8" cy="30" r="5"/><circle cx="22" cy="19" r="5"/><circle cx="38" cy="12" r="5"/>
        <circle cx="55" cy="10" r="5"/><circle cx="72" cy="14" r="5"/><circle cx="88" cy="24" r="5"/>
      </g>
    </svg>`,
    { size: 128 },
  );

  const hs = b.surface(b.root);
  for (const s of [1, -1]) {
    // eye mask discs, set on the sides of the head around the eye (eye stays visible via cut-out centre ring? use ring decal with open centre)
    const eyeAt = new THREE.Vector3(s * 0.105, 1.19, 0.94);
    const hit = hs.nearest(eyeAt);
    const n = hit.n.clone();
    const ringGeo = new THREE.RingGeometry(0.036, 0.075, 16);
    b.part(ringGeo, "#ffffff", {
      bone: head,
      at: eyeAt.clone().addScaledVector(n, 0.008),
      dir: n.toArray() as [number, number, number],
      axis: "z",
      texture: maskTex,
      name: "maskRing",
    });
    // brow arc of dots
    const browAt = new THREE.Vector3(s * 0.085, 1.265, 0.95);
    const bh = hs.nearest(browAt);
    b.part(new THREE.PlaneGeometry(0.1, 0.04), "#ffffff", {
      bone: head,
      at: browAt.clone().addScaledVector(bh.n, 0.006),
      dir: bh.n.toArray() as [number, number, number],
      axis: "z",
      up: [0, 1, 0],
      texture: browTex,
      name: "browDots",
    });
    // cheek ink dots
    for (let i = 0; i < 4; i++) {
      const p = new THREE.Vector3(s * (0.1 - i * 0.004), 1.1 - i * 0.017, 0.93 + i * 0.012);
      const h = hs.nearest(p);
      b.stick(new THREE.SphereGeometry(0.01, 6, 4), i % 2 ? "#1e1030" : "#e0287a", h, { embed: 0.4 });
    }
    // whisker-ish teal tear stripe under eye
    const tp = hs.nearest(new THREE.Vector3(s * 0.085, 1.1, 0.96));
    b.stick(new THREE.BoxGeometry(0.014, 0.05, 0.008), "#14b5a8", tp, { embed: 0.3 });
  }
  // forehead diamond between brows
  const fh = hs.nearest(new THREE.Vector3(0, 1.27, 0.97));
  b.stick(new THREE.OctahedronGeometry(0.025), "#ffd23a", fh, { embed: 0.5 });
  b.stick(new THREE.OctahedronGeometry(0.014), "#e0287a", fh, { embed: 0.2 });
}
    return addFaceMask;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addBeakDecor(b: Builder) {
  const R = rng(22);

  // ---------- BEAK DECOR ----------
  // The beak upper is a bezier sweep on the head: base near head.local(forward .08), tip near (.3, -.13).
  const beakSurf = b.surface(b.root);
  const ridgeBase = new THREE.Vector3(0, 1.15, 1.0);
  const head = "head";

  // ridge dots: sample hits by ray from above along the beak
  const dotCols = ["#d62d2d", "#2a5bd7"];
  let placed = 0;
  for (let i = 0; i < 9 && placed < 9; i++) {
    const z = 1.0 + i * 0.026;
    const hit = beakSurf.ray([0, 1.6, z], [0, -1, 0]);
    if (!hit) continue;
    // only accept hits near the head height range (beak), skip far surfaces
    if (Math.abs(hit.at.x) > 0.05 || hit.at.y < 0.95) continue;
    b.stick(new THREE.SphereGeometry(0.0085, 6, 4), dotCols[i % 2], hit, { embed: 0.3, bone: head });
    placed++;
  }

  // cere bump (yellow) at base of beak
  const cereHit = beakSurf.ray([0, 1.6, 1.0], [0, -1, 0]);
  const cereAt = cereHit ? cereHit.at.clone() : new THREE.Vector3(0, 1.2, 1.0);
  b.part(new THREE.SphereGeometry(0.04, 8, 6), "#ffd23a", {
    bone: head,
    at: cereAt.clone().add(new THREE.Vector3(0, -0.005, 0.0)),
    scale: [1.25, 0.7, 1.0],
    name: "cere",
  });

  // nostril slits
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.008, 0.006, 0.03), "#1e1030", {
      bone: head,
      at: cereAt.clone().add(new THREE.Vector3(s * 0.03, 0.012, 0.015)),
      rotation: [0, s * 15, 0],
      name: "nostril",
    });
  }

  // gold tip band: ring near the tip region
  const tipHit = beakSurf.ray([0, 1.6, 1.17], [0, -1, 0]);
  if (tipHit) {
    b.part(new THREE.CylinderGeometry(0.02, 0.026, 0.02, 8), "#ffb800", {
      bone: head,
      at: tipHit.at.clone().add(new THREE.Vector3(0, -0.012, 0.01)),
      rotation: [60, 0, 0],
      name: "beakBand",
    });
  }

  // ---------- CHEST PLUMAGE ----------
  const scaleTex = svg(
    `<svg viewBox="0 0 40 48">
      <path d="M20 46 C4 38 2 18 6 4 Q20 10 34 4 C38 18 36 38 20 46Z" fill="#fff" stroke="#1e1030" stroke-width="3" stroke-linejoin="round"/>
      <path d="M20 40 C10 33 9 20 11 10 Q20 14 29 10 C31 20 30 33 20 40Z" fill="none" stroke="#1e1030" stroke-width="1.6" opacity="0.5"/>
      <circle cx="20" cy="30" r="3.4" fill="#fff1c9" stroke="#1e1030" stroke-width="1.2"/>
    </svg>`,
    { size: 128 },
  );
  // texture is tinted by grey drawing? It contains colours (cream dot), so use separate tinted layers via cards color
  const rowCols = ["#e0287a", "#f28a1e", "#ffd23a", "#14b5a8"];
  const rows = 5;
  for (let r = 0; r < rows; r++) {
    const y = 0.82 - r * 0.085;
    const half = 0.17 - r * 0.026;
    const n = Math.max(2, 6 - r);
    const frames = [];
    for (let k = 0; k < n; k++) {
      const x = n === 1 ? 0 : -half + (2 * half * k) / (n - 1);
      const hit = b.surface(b.root).ray([x, y, 1.2], [0, 0, -1]);
      if (!hit || hit.at.z < 0.2) continue;
      frames.push(hit);
    }
    if (!frames.length) continue;
    b.cards(frames, scaleTex, {
      size: [0.11 - r * 0.008, 0.12 - r * 0.008],
      lean: 70,
      flow: [0, -1, 0.15],
      mirror: true,
      color: rowCols[r % rowCols.length],
      sink: 0.15,
      bone: "spine3",
    });
  }

  // small ink-outlined cream studs framing the chest top
  for (let k = 0; k < 5; k++) {
    const x = -0.16 + k * 0.08;
    const hit = b.surface(b.root).ray([x, 0.95, 1.2], [0, 0, -1]);
    if (!hit || hit.at.z < 0.2) continue;
    b.stick(new THREE.SphereGeometry(0.014, 6, 4), k % 2 ? "#fff1c9" : "#ffd23a", hit, { embed: 0.3, bone: "spine3" });
  }
}
    return addBeakDecor;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addFlankRosettes(b: Builder) {
  const R = rng(77);
  const body = b.surface(b.root);
  const bodyMesh = b.surface(b.root);
  const bone = "spine2";
  const centers: [number, number][] = [
    [0.9, -0.3],
    [0.82, 0.05],
    [0.74, 0.35],
    [0.9, -0.62],
    [0.66, -0.1],
    [0.7, -0.45],
  ];
  const ringGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.008, 6);
  const midGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.01, 7);
  const dotGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.006, 5);
  void body;
  for (const s of [1, -1]) {
    centers.forEach(([y, z], idx) => {
      const origin: [number, number, number] = [s * 0.4, y - 0.1 + (R() - 0.5) * 0.02, z];
      const hit = bodyMesh.ray(origin, [-s, 0, 0]);
      if (!hit) return;
      const center = hit.at.clone();
      const n = hit.n.clone();
      const centerCol = idx % 2 ? MAGENTA : TEAL;
      b.stick(midGeo, centerCol, hit, { embed: 0.4, bone });
      // inner ring of INK crescents
      const inner = b.ring({ at: center, axis: n } as any, { count: 7, radius: 0.05, fromDeg: 20, toDeg: 340 });
      for (const it of inner.items) {
        const h2 = bodyMesh.nearest(it.at);
        b.stick(ringGeo, INK, h2, { embed: 0.5, bone });
      }
      // outer ring of YELLOW dots
      const outer = b.ring({ at: center, axis: n } as any, { count: 11, radius: 0.092, fromDeg: 0, toDeg: 330 });
      for (const it of outer.items) {
        const h2 = bodyMesh.nearest(it.at);
        b.stick(dotGeo, YELLOW, h2, { embed: 0.5, bone });
      }
    });
  }
}
    return addFlankRosettes;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addWingCoverts(b: Builder) {
  const R = rng(24);
  const covertTex = svg(
    `<svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 38 C3 30 2 12 16 2 C30 12 29 30 16 38Z" fill="#ffffff" stroke="#1e1030" stroke-width="2.5"/>
      <path d="M16 30 C9 25 9 14 16 8 C23 14 23 25 16 30Z" fill="#ffffff" fill-opacity="0.55" stroke="#1e1030" stroke-width="1.2"/>
      <circle cx="16" cy="20" r="3" fill="#1e1030"/>
      <circle cx="16" cy="20" r="1.2" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );
  const rowCols = [GREEN, YELLOW, PINK];

  // ---- wing coverts (both wings) ----
  for (const S of ["L", "R"]) {
    const s = S === "L" ? 1 : -1;

    // three rows of rounded covert cards along the wing arm, seated on its top surface

    const targets = [`wingArm${S}`];
    const mesh: THREE.Mesh[] = [];
    b.root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && targets.some((n) => o.name.includes(n))) mesh.push(o as THREE.Mesh);
    });
    const surf = b.surface(mesh.length ? mesh : b.root);
    for (let row = 0; row < 3; row++) {
      const hits: any[] = [];
      const n = 7 - row;
      for (let i = 0; i < n; i++) {
        const x = s * (0.28 + (0.8 * (i + 0.5)) / n);
        const z = 0.1 - row * 0.07 - i * 0.012;
        const h = surf.ray([x, 1.6, z], [0, -1, 0]) ?? surf.nearest([x, 1.1, z]);
        hits.push(h);
      }
      b.cards(hits, covertTex, {
        size: [0.085 - row * 0.008, 0.11 - row * 0.01],
        lean: 70 - row * 8,
        flow: [0, 0, -1],
        mirror: s < 0,
        color: rowCols[row],
        vary: 0.15,
        spin: 6,
        rng: R,
        sink: 0.15,
        cross: false,
      });
    }
    // INK dots along the leading edge
    for (let i = 0; i < 5; i++) {
      const x = s * (0.25 + i * 0.2);
      const h = surf.ray([x, 1.6, 0.2], [0, -1, 0]);
      if (h) b.stick(new THREE.SphereGeometry(0.014, 6, 4), INK, h, { embed: 0.3 });
    }
    // MAGENTA wrist tuft
    const wrist = surf.ray([s * 1.1, 1.6, 0.0], [0, -1, 0]) ?? surf.nearest([s * 1.1, 1.1, 0]);
    for (let k = 0; k < 4; k++) {
      const fl = frame(wrist.at, [s * 0.4 * (k - 1.5) * 0.4, 1, -0.2 + k * 0.1]);
      b.spike(fl, fl, 0.1 - Math.abs(k - 1.5) * 0.015, 0.022, {
        color: k % 2 ? MAGENTA : PINK,
        sides: 5,
        bone: wrist.bone ?? undefined,
      } as any);
    }
    b.part(new THREE.SphereGeometry(0.03, 6, 5), GOLD, { at: wrist.at, bone: wrist.bone ?? undefined } as any);
  }

  // ---- talons (front paws; hind spurs) ----
  const pawBones = ["pawL", "pawR"];
  for (const name of pawBones) {
    const s = name === "pawL" ? 1 : -1;
    const x = s * 0.2;
    for (let k = -1; k <= 1; k++) {
      const base: [number, number, number] = [x + k * 0.05, 0.05, 0.62 + (k === 0 ? 0.02 : 0)];
      const mid: [number, number, number] = [base[0] + k * 0.012, 0.075, base[2] + 0.07];
      const tip: [number, number, number] = [base[0] + k * 0.02, 0.02, base[2] + 0.12];
      b.sweep(
        [base, mid, tip],
        [0.022, 0.0],
        { bone: name, color: GOLD, caps: { end: "point" }, sides: 6 } as any,
      );
      b.part(new THREE.ConeGeometry(0.01, 0.03, 5), INK, {
        bone: name,
        at: [tip[0], tip[1] + 0.005, tip[2] - 0.005],
        dir: [0, -0.5, 1],
      } as any);
      // dot bands on toe
      b.part(new THREE.TorusGeometry(0.03, 0.007, 4, 8), k % 2 ? RED : YELLOW, {
        bone: name,
        at: [base[0], 0.05, base[2] - 0.06],
        dir: [0, 0, 1],
        axis: "z",
      } as any);
    }
    // dewclaw
    b.spike([x, 0.1, 0.52], [0, -0.4, 1], 0.07, 0.018, { bone: name, color: GOLD, sides: 5 } as any);
  }
  // hind spurs (rear-facing at the hock)
  for (const name of ["pawHL", "pawHR"]) {
    const s = name === "pawHL" ? 1 : -1;
    b.spike([s * 0.2, 0.14, -0.62], [0, 0.2, -1], 0.1, 0.022, { bone: name, color: GOLD, sides: 6 } as any);
    b.part(new THREE.SphereGeometry(0.015, 5, 4), RED, { bone: name, at: [s * 0.2, 0.14, -0.6] } as any);
    for (let k = -1; k <= 1; k++) {
      b.spike([s * 0.2 + k * 0.05, 0.05, -0.64], [0, -0.3, -1], 0.06, 0.016, {
        bone: name,
        color: GOLD,
        sides: 5,
      } as any);
    }
  }
}
    return addWingCoverts;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addEarsAndCrest(b: Builder) {
  const R = rng(25);
  void R;

  // The head joint is addressed by name; frames derived from the surface keep their bones.
  const hb = "head";
  const skin = b.surface(b.root);

  // --- ears: pink inner, ink dots, yellow rim dots ---
  for (const s of [1, -1]) {
    // ear centre as built in stage 1: head.local({left: s*0.08, up: 0.11, forward: -0.04})
    // head at (0,1.12,0.85) facing forward slightly up; approximate in model space
    const ex = s * 0.08;
    const ey = 1.12 + 0.11;
    const ez = 0.85 - 0.04;
    const cx = ex;
    const cy = ey;
    const cz = ez;
    // outward-facing direction of the ear (up and slightly forward/outward)
    const dir: [number, number, number] = [s * 0.25, 0.85, 0.45];

    // inner ear cup
    b.part(new THREE.SphereGeometry(0.036, 8, 6), PINK, {
      bone: hb,
      at: [cx, cy + 0.012, cz + 0.022],
      scale: [1, 1.1, 0.45],
      name: `earInner${s}`,
    });
    // tiny ink dots inside the ear
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      b.part(new THREE.SphereGeometry(0.0055, 5, 4), INK, {
        bone: hb,
        at: [cx + s * Math.cos(a) * 0.013, cy + 0.012 + Math.sin(a) * 0.016, cz + 0.044],
      });
    }
    b.part(new THREE.SphereGeometry(0.007, 5, 4), MAGENTA, { bone: hb, at: [cx, cy + 0.008, cz + 0.046] });

    // rim of tiny yellow dots (arc around the ear edge)
    for (let i = 0; i < 9; i++) {
      const a = -0.2 * Math.PI + (i / 8) * 1.4 * Math.PI;
      const rx = Math.cos(a) * 0.05;
      const ry = Math.sin(a) * 0.058;
      b.part(new THREE.SphereGeometry(0.0072, 5, 4), YELLOW, {
        bone: hb,
        at: [cx + s * rx, cy + 0.012 + ry, cz + 0.0],
      });
    }
    // little tuft on ear tip
    b.spike([cx + s * 0.005, cy + 0.06, cz], dir, 0.045, 0.014, { bone: hb, color: INK, sides: 5 });
    void skin;
  }

  // --- crest dotted spine: tiny dots along each crest spike ---
  // crest spikes: base head.local({up:0.1, forward: 0.08 - i*0.05}), direction [0,1,-0.5-i*0.12]
  const dotCols = [CREAM, YELLOW, WHITE, PINK, CREAM];
  for (let i = 0; i < 5; i++) {
    const base = new THREE.Vector3(0, 1.12 + 0.1, 0.85 + 0.08 - i * 0.05);
    const d = new THREE.Vector3(0, 1, -0.5 - i * 0.12).normalize();
    const len = 0.16 - i * 0.015;
    const n = 4;
    for (let k = 0; k < n; k++) {
      const t = (k + 0.7) / (n + 0.4);
      const r = 0.03 * (1 - t) + 0.004;
      const p = base.clone().addScaledVector(d, len * t);
      // dot on the front face of the spike (+Z-ish side)
      p.z += r * 0.95;
      b.part(new THREE.SphereGeometry(Math.max(0.0055, r * 0.28), 5, 4), dotCols[(i + k) % 5], {
        bone: hb,
        at: [p.x, p.y, p.z],
      });
    }
    // tip bead
    const tip = base.clone().addScaledVector(d, len + 0.008);
    b.part(new THREE.SphereGeometry(0.009, 5, 4), i % 2 ? RED : GOLD, { bone: hb, at: [tip.x, tip.y, tip.z] });
  }

  // --- small dotted band between crest and forehead ---
  for (let i = -3; i <= 3; i++) {
    b.part(new THREE.SphereGeometry(0.0075, 5, 4), SPOT_COLORS[(i + 3) % 6], {
      bone: hb,
      at: [i * 0.016, 1.12 + 0.118 - Math.abs(i) * 0.002, 0.85 + 0.1],
    });
  }
}
    return addEarsAndCrest;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addTailFeatherDots(b: Builder) {
  const R = rng(26);
  const tailBone = "tail4";

  // ---- tail fan ocelli: feathers fan from tail tip (0,~0.8,-1.75) backward ----
  const origin = new THREE.Vector3(0, 0.8, -1.75);
  for (let i = 0; i < 7; i++) {
    const a = ((i - 3) / 3) * 0.85;
    const len = 0.55 - Math.abs(i - 3) * 0.05;
    const dir = new THREE.Vector3(Math.sin(a), 0.2, -Math.cos(a)).normalize();
    const side = new THREE.Vector3(0, 1, 0).cross(dir).normalize();
    // ocellus centre near tip (about 78% along the feather), lifted off the face
    const c = origin.clone().addScaledVector(dir, len * 0.74);
    const faceN = new THREE.Vector3().crossVectors(dir, side).normalize();
    if (faceN.y < 0) faceN.negate();
    const place = (r: number, h: number, col: string, lift: number) => {
      b.part(new THREE.CylinderGeometry(r, r, h, 10), col, {
        bone: tailBone,
        at: c.clone().addScaledVector(faceN, lift),
        dir: faceN.toArray() as [number, number, number],
        name: "ocellus",
      });
    };
    place(0.034, 0.008, INK, 0.011);
    place(0.027, 0.008, YELLOW, 0.016);
    place(0.018, 0.008, TEAL, 0.021);
    place(0.008, 0.008, INK, 0.026);
    // mirrored underside ring so it reads from below too
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 10), YELLOW, {
      bone: tailBone,
      at: c.clone().addScaledVector(faceN, -0.011),
      dir: faceN.toArray() as [number, number, number],
    });
    // dotted line down the central feather
    if (i === 3) {
      for (let k = 0; k < 7; k++) {
        const p = origin.clone().addScaledVector(dir, len * (0.12 + k * 0.1));
        b.part(new THREE.SphereGeometry(0.011, 6, 4), MAGENTA, {
          bone: tailBone,
          at: p.addScaledVector(faceN, 0.012),
          name: "tailDot",
        });
      }
    } else {
      // small cream dots flanking each outer feather
      for (let k = 0; k < 3; k++) {
        const p = origin.clone().addScaledVector(dir, len * (0.25 + k * 0.1));
        b.part(new THREE.SphereGeometry(0.008, 6, 4), CREAM, {
          bone: tailBone,
          at: p.addScaledVector(faceN, 0.012),
        });
      }
    }
  }

  // ---- ruff trim: spikes ringed around neck at neck.at(0.9), radius 0.12, tilt -35 ----
  const surf = b.surface(b.root);
  void surf;
  const neckTop = new THREE.Vector3(0, 1.09, 0.82);
  const neckAxis = new THREE.Vector3(0, 0.45, 0.55).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const u = new THREE.Vector3().crossVectors(neckAxis, up).normalize();
  const v = new THREE.Vector3().crossVectors(u, neckAxis).normalize();
  for (let i = 0; i < 10; i++) {
    const ang = (i / 10) * Math.PI * 2;
    const radial = u.clone().multiplyScalar(Math.sin(ang)).addScaledVector(v, Math.cos(ang));
    const root = neckTop.clone().addScaledVector(radial, 0.12);
    // spike direction: outward, tilted back toward -neck axis (tilt -35)
    const sd = radial.clone().multiplyScalar(Math.cos(0.61)).addScaledVector(neckAxis, -Math.sin(0.61)).normalize();
    for (let k = 0; k < 3; k++) {
      const p = root.clone().addScaledVector(sd, 0.04 + k * 0.035).addScaledVector(radial, 0.035 - k * 0.006);
      b.part(new THREE.SphereGeometry(0.0085, 5, 4), CREAM, { bone: "neck2", at: p, name: "ruffDot" });
    }
    const tip = root.clone().addScaledVector(sd, 0.14).addScaledVector(radial, 0.0);
    b.part(new THREE.SphereGeometry(0.014, 6, 4), YELLOW, { bone: "neck2", at: tip, name: "ruffTip" });
  }

  // collar band at ruff base
  b.sweep(
    Array.from({ length: 13 }, (_, i) => {
      const ang = (i / 12) * Math.PI * 2;
      return neckTop
        .clone()
        .addScaledVector(u, Math.sin(ang) * 0.125)
        .addScaledVector(v, Math.cos(ang) * 0.125)
        .addScaledVector(neckAxis, -0.01);
    }).map((p) => p.toArray()) as number[][],
    0.012,
    { bone: "neck2", color: GOLD, name: "ruffCollar" },
  );
  void R;
}
    return addTailFeatherDots;
  })(),
);
