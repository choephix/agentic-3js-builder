import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { catmull } from "../src/path";
import { rng } from "../src/math";
import { mottle, noise, paint } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Sea Otter on a Rock",
  description:
    "A round-cheeked sea otter sitting up on a mossy boulder, cracking a clam against its chest. Kelp drapes the rock, a starfish lies on the sand and barnacles dot the stone.",
  style: "whimsical",
  commit: "b816db2",
};

const C = {
  furDark: "#4a2f20",
  fur: "#6e4b33",
  furLight: "#94704f",
  silver: "#b3a18a",
  belly: "#e6cfa8",
  muzzle: "#f2e6d0",
  black: "#1f1713",
  pad: "#2b2019",
  clam: "#ece4d2",
  clamRib: "#b08f6c",
  rock: "#8c8e86",
  rockLight: "#b9b6a8",
  rockDark: "#5b5e56",
  moss: "#72a047",
  barnacle: "#efe8d5",
  kelp: "#4f8a3f",
  kelpDark: "#2c5b2b",
  starfish: "#ea6f3c",
  starfishLight: "#f7a46e",
  whisker: "#f5eee0",
  pebbleA: "#c79c6e",
  pebbleB: "#9ea5a2",
  pebbleC: "#7f8580",
};

const EYE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">` +
    `<circle cx="32" cy="32" r="30" fill="#1d130d"/>` +
    `<circle cx="32" cy="33" r="21" fill="#4a2d17"/>` +
    `<circle cx="32" cy="34" r="11" fill="#0d0907"/>` +
    `<circle cx="24" cy="23" r="7" fill="#ffffff"/>` +
    `<circle cx="39" cy="41" r="3.5" fill="#ffffff"/>` +
    `</svg>`,
  { size: 128 },
);

const MOSS = svg(
  `<svg viewBox="0 0 32 24" xmlns="http://www.w3.org/2000/svg">` +
    `<path d="M2 24 Q4 8 8 4 Q9 12 12 24Z" fill="#6aa23f"/>` +
    `<path d="M10 24 Q12 2 16 0 Q17 10 20 24Z" fill="#7cb84c"/>` +
    `<path d="M18 24 Q22 8 27 6 Q25 14 29 24Z" fill="#5c9437"/>` +
    `</svg>`,
  { size: 128 },
);

const FUR_TUFT = svg(
  `<svg viewBox="0 0 16 32" xmlns="http://www.w3.org/2000/svg">` +
    `<path d="M4 32 Q3 16 7 2" stroke="#3b2417" stroke-width="2.5" fill="none" stroke-linecap="round"/>` +
    `<path d="M9 32 Q9 14 13 6" stroke="#8a6444" stroke-width="2.5" fill="none" stroke-linecap="round"/>` +
    `</svg>`,
  { size: 128 },
);

type Key = readonly [number, number, number];

// Piecewise-linear profile: keys are [t, width, depth].
function profile(t: number, keys: readonly Key[]): [number, number] {
  for (let i = 1; i < keys.length; i++) {
    const [t1, w1, d1] = keys[i];
    const [t0, w0, d0] = keys[i - 1];
    if (t <= t1) {
      const u = (t - t0) / (t1 - t0);
      return [w0 + (w1 - w0) * u, d0 + (d1 - d0) * u];
    }
  }
  const last = keys[keys.length - 1];
  return [last[1], last[2]];
}

const SIDES = [1, -1] as const;

export default function build() {
  const b = createBuilder({ name: "seaOtter" });
  const base = b.joint("base", { at: [0, 0, 0] });

  // ---- Paints -----------------------------------------------------------
  const fur = mottle(C.fur, C.furDark, { size: 0.07, contrast: 1.2, seed: 2 });
  const furLight = mottle(C.furLight, C.silver, { size: 0.05, seed: 5 });
  const torsoPaint = paint((p, n) => (n.z + 0.18 * noise(p, 0.05, 6) > 0.5 ? C.belly : fur));
  const headPaint = paint((p, n) => (n.z - 0.5 * n.y + 0.15 * noise(p, 0.04, 9) > 0.35 ? C.muzzle : furLight));
  const rockPaint = mottle(C.rock, C.rockLight, { size: 0.14, contrast: 1.3, seed: 3 });
  const rockTop = paint((p, n) => (n.y > 0.5 && noise(p, 0.06, 4) > 0.42 ? C.moss : rockPaint));
  const rockBody = paint((_p, n) => (n.y < -0.2 ? C.rockDark : rockTop));
  const clamPaint = paint((_p, _n, s) => {
    const ribbed = Math.abs(Math.sin(s[0] * Math.PI * 2 * 14)) < 0.16;
    return ribbed && s[1] > 0.45 ? C.clamRib : C.clam;
  });
  const starPaint = paint((_p, _n, s) => (Math.hypot(s[0], s[1]) < 0.022 ? C.starfishLight : C.starfish));
  const kelpPaint = paint((_p, _n, s) => (Math.abs(Math.sin(s[0] * 90)) < 0.1 ? C.kelpDark : C.kelp));
  const tailPaint = paint((_p, _n, s) => (s[0] > 0.8 ? furLight : fur));

  // ---- Rock, the seat ---------------------------------------------------
  const rockOutline: OutlinePoint[] = [
    [0, 0],
    [0.56, 0],
    [0.62, 0.06],
    [0.61, 0.18],
    [0.55, 0.3],
    [0.43, 0.4],
    [0.27, 0.46],
    [0.1, 0.49],
    [0, 0.5],
  ];
  const rock = b.lathe(rockOutline, { at: [0, 0, 0], bone: base, smoothing: 2, segments: 16, color: rockBody });

  // A second, smaller boulder at the front-right, sitting on the floor.
  b.part(new THREE.SphereGeometry(0.16, 12, 8).scale(1, 0.7, 0.9), C.rockDark, {
    bone: base,
    at: [0.42, 0.112, 0.34],
  });

  const rockSurf = b.surface(rock);
  for (const h of rockSurf.scatter(45, { rng: rng(11), minDist: 0.075, filter: (h) => h.at.y > 0.12 && h.n.y > -0.4 })) {
    b.stick(new THREE.SphereGeometry(0.02, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), C.barnacle, h, { embed: 0.4 });
  }
  b.cards(
    rockSurf.scatter(30, { rng: rng(12), minDist: 0.08, filter: (h) => h.n.y > 0.6 }),
    MOSS,
    { size: [0.07, 0.05], lean: 0, rng: rng(13), vary: 0.3, spin: 30, color: C.moss },
  );

  // Kelp draped over the rock's back-left edge: two ribbon fronds.
  b.sweep(
    catmull([
      [-0.36, 0.47, -0.22],
      [-0.46, 0.38, -0.3],
      [-0.56, 0.22, -0.36],
      [-0.62, 0.08, -0.44],
      [-0.66, 0.02, -0.5],
    ]),
    (t) => [0.028 - 0.016 * t, 0.005],
    { bone: base, color: kelpPaint },
  );
  b.sweep(
    catmull([
      [-0.2, 0.49, -0.4],
      [-0.28, 0.4, -0.5],
      [-0.36, 0.26, -0.6],
      [-0.4, 0.12, -0.7],
    ]),
    (t) => [0.022 - 0.012 * t, 0.004],
    { bone: base, color: kelpPaint },
  );

  // Pebbles on the floor around the rock.
  const pebbles: [number, number, number, number, string][] = [
    [-0.74, 0.0, 0.2, 0.05, C.pebbleA],
    [-0.82, 0.0, -0.12, 0.035, C.pebbleB],
    [0.72, 0.0, 0.36, 0.045, C.pebbleC],
    [0.84, 0.0, -0.18, 0.03, C.pebbleA],
    [0.3, 0.0, 0.88, 0.035, C.pebbleB],
    [-0.36, 0.0, 0.84, 0.028, C.pebbleC],
  ];
  for (const [x, , z, r, col] of pebbles) {
    b.part(new THREE.SphereGeometry(r, 8, 6).scale(1, 0.75, 1), col, { bone: base, at: [x, r * 0.75, z] });
  }

  // An empty clam shell lying on the sand, dome up.
  b.part(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(0.06, 0.03, 0.05), clamPaint, {
    bone: base,
    at: [0.5, 0, 0.6],
  });

  // A starfish lying on the floor at the front-right (model right is -X).
  const star: OutlinePoint[] = [];
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? 0.11 : 0.045;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    star.push(i % 2 === 0 ? [x, y, "sharp"] : [x, y]);
  }
  b.extrude(star, {
    at: [-0.52, 0.012, 0.6],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.024,
    bevel: 0.006,
    smoothing: 1,
    color: starPaint,
    bone: base,
  });

  // ---- Skeleton: spine, head and limbs ----------------------------------
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.6, -0.08],
      [0, 0.7, 0.0],
      [0, 0.8, 0.1],
      [0, 0.9, 0.19],
      [0, 0.95, 0.25],
    ]),
    { parent: base, names: ["hips", "waist", "chest", "neck"], role: "spine" },
  );

  const torso = b.sweep(
    spine,
    (t) =>
      profile(t, [
        [0, 0.15, 0.16],
        [0.3, 0.155, 0.15],
        [0.6, 0.15, 0.14],
        [0.85, 0.12, 0.11],
        [1, 0.085, 0.085],
      ]),
    { color: torsoPaint },
  );
  b.cards(
    b.surface(torso).scatter(160, { rng: rng(21), minDist: 0.028, filter: (h) => h.n.z < 0.3 }),
    FUR_TUFT,
    { size: [0.03, 0.05], lean: 65, rng: rng(22), vary: 0.3, spin: 25 },
  );

  const head = b.joint("head", {
    parent: spine.joints[3],
    at: [0, 0.98, 0.27],
    aim: [0, 0.94, 0.43],
    role: "head",
  });

  const skull = b.loft(
    [
      { at: head.local({ forward: -0.12, up: 0 }), w: 0.2, h: 0.2 },
      { at: head.local({ forward: -0.02, up: 0.01 }), w: 0.31, h: 0.28 },
      { at: head.local({ forward: 0.07, up: -0.01 }), w: 0.29, h: 0.25 },
      { at: head.local({ forward: 0.13, up: -0.05 }), w: 0.17, h: 0.14 },
      { at: head.local({ forward: 0.17, up: -0.07 }), w: 0.1, h: 0.1 },
    ],
    { bone: head, color: headPaint },
  );

  for (const s of SIDES) {
    b.decal(skull, EYE, {
      at: head.local({ left: s * 0.12, up: 0.03, forward: 0.06 }),
      dir: [s * 0.6, 0.15, 0.8],
      size: [0.09, 0.09],
    });
  }

  b.part(new THREE.SphereGeometry(0.028, 8, 6).scale(1.2, 0.85, 1), C.black, {
    bone: head,
    at: head.local({ forward: 0.175, up: -0.03 }),
  });

  const smile = b.surface(skull).drape(
    catmull([
      head.local({ left: 0.07, up: -0.06, forward: 0.13 }),
      head.local({ left: 0, up: -0.09, forward: 0.175 }),
      head.local({ left: -0.07, up: -0.06, forward: 0.13 }),
    ]),
    { lift: 0.004 },
  );
  b.sweep(smile, 0.0035, { color: C.black, detail: 0.6 });

  for (const s of SIDES) {
    for (let k = 0; k < 3; k++) {
      const up = -0.02 - k * 0.025;
      b.sweep(
        catmull([
          head.local({ left: s * 0.06, up, forward: 0.12 }),
          head.local({ left: s * 0.14, up: up - 0.01, forward: 0.13 }),
          head.local({ left: s * 0.26, up: up - 0.02, forward: 0.09 }),
        ]),
        [0.003, 0.0008],
        { color: C.whisker, detail: 0.5 },
      );
    }
  }

  for (const s of SIDES) {
    const hit = b.surface(skull).around(head.at).at(s * 110, 40);
    if (hit) b.stick(new THREE.SphereGeometry(0.05, 8, 6).scale(1, 0.4, 1), C.fur, hit, { embed: 0.35 });
  }

  // Forelimbs: shoulder, elbow, wrist, paw; the paws hold the clam at the chest.
  for (const s of SIDES) {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      catmull([
        [s * 0.12, 0.84, 0.06],
        [s * 0.2, 0.72, 0.14],
        [s * 0.15, 0.79, 0.19],
        [s * 0.095, 0.79, 0.27],
      ]),
      {
        parent: spine.joints[2],
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `paw${side}`],
        role: "arm",
      },
    );
    b.sweep(arm, (t) => 0.048 - 0.012 * t, { color: fur });
    const paw = arm.tip;
    if (!paw) throw new Error("forepaw has no tip joint");
    b.part(new THREE.SphereGeometry(0.05, 8, 6).scale(1, 0.8, 1.2), fur, {
      bone: paw,
      at: [s * 0.095, 0.79, 0.27],
    });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), C.pad, { bone: paw, at: [s * 0.095, 0.77, 0.3] });
  }

  // Hind legs: thigh forward, shin back, flipper flat on the rock.
  for (const s of SIDES) {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      catmull([
        [s * 0.12, 0.6, -0.04],
        [s * 0.26, 0.56, 0.1],
        [s * 0.24, 0.5, -0.12],
      ]),
      {
        parent: spine.joints[0],
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
      },
    );
    b.sweep(leg, (t) => 0.062 - 0.016 * t, { color: fur });
    const ankle = leg.tip;
    if (!ankle) throw new Error("hind leg has no tip joint");
    const flipper: OutlinePoint[] = [
      [-0.06, 0.03],
      [0.06, 0.03],
      [0.11, -0.06],
      [0.12, -0.14],
      [0.09, -0.23],
      [0.035, -0.25, "sharp"],
      [0, -0.22],
      [-0.035, -0.25, "sharp"],
      [-0.09, -0.23],
      [-0.12, -0.14],
      [-0.11, -0.06],
    ];
    b.extrude(flipper, {
      at: ankle,
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.022,
      bevel: 0.007,
      smoothing: 1,
      color: fur,
      bone: ankle,
    });
    const toes: [number, number][] = [
      [-0.09, -0.23],
      [-0.035, -0.25],
      [0.035, -0.25],
      [0.09, -0.23],
    ];
    for (const [u, v] of toes) {
      b.part(new THREE.ConeGeometry(0.009, 0.04, 5), C.black, {
        bone: ankle,
        at: [s * (0.24 + u), 0.5, -0.12 + v - 0.02],
        dir: [0, 0, -1],
      });
    }
  }

  // Tail: thick at the root, flattened, paddling back over the rock.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.56, -0.12],
      [0, 0.52, -0.3],
      [0, 0.44, -0.47],
      [0, 0.34, -0.58],
      [0, 0.3, -0.68],
    ]),
    { parent: spine.joints[0], names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );
  b.sweep(tail, (t) => [0.045 - 0.025 * t, 0.055 - 0.035 * t], { color: tailPaint });

  // ---- Clam, held between the paws --------------------------------------
  // Two shell halves meet at a seam: the front dome faces the viewer.
  const clamAt: [number, number, number] = [0, 0.8, 0.33];
  b.part(
    new THREE.SphereGeometry(1, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2)
      .scale(0.07, 0.05, 0.06)
      .rotateX(Math.PI / 2),
    clamPaint,
    { at: clamAt },
  );
  b.part(
    new THREE.SphereGeometry(1, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2)
      .scale(0.07, 0.05, 0.06)
      .rotateX(-Math.PI / 2),
    clamPaint,
    { at: clamAt },
  );

  return b.root;
}
