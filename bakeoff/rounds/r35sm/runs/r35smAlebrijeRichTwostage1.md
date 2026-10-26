```ts
import * as THREE from "three";
import { createBuilder, rng, bezier, catmull, limb } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";

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
function featherOutline(w: number, l: number): [number, number, string?][] {
  return [
    [0, 0],
    [w, 0.08 * l],
    [w, 0.6 * l],
    [0, l, "sharp"],
    [-w, 0.6 * l],
    [-w, 0.08 * l],
  ] as any;
}
function tipOutline(w: number, l: number): [number, number, string?][] {
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
    color: ORANGE,
    name: "body",
    sectors: [[120, 240, CREAM]],
  });
  const tailTube = b.sweep(tail, (t) => 0.075 * (1 - t) + 0.035, {
    name: "tail",
    color: (t: number) => [ORANGE, INK, TEAL, YELLOW][Math.floor(t * 12) % 4],
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
      color: (t: number) => (t < 0.8 ? ORANGE : TEAL),
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
    b.sweep(hl, [0.12, 0.07, 0.05, 0.04], { name: `legHind${S}`, color: (t: number) => (t < 0.85 ? ORANGE : TEAL) });
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
    b.sweep(wing, [0.075, 0.035], { name: `wingArm${S}`, color: PURPLE });
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
```