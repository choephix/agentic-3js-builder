```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "phoenix",
  description:
    "A phoenix with wings flung open: feathers blaze from deep crimson at the body through orange to golden tips, with a flame crest, ribbon tail feathers, amber eyes, a golden hooked beak and embers drifting off the wings.",
};

type V = [number, number, number];

const PAL = {
  deep: "#6e0b14",
  crimson: "#a8161f",
  red: "#d33a1a",
  orange: "#ec6f16",
  amber: "#f5a02a",
  gold: "#ffd447",
  eye: "#ffb020",
  beak: "#f2c030",
};

const RAMP = [PAL.deep, PAL.crimson, PAL.red, PAL.orange, PAL.amber, PAL.gold];
const ramp = (t: number) =>
  RAMP[Math.min(RAMP.length - 1, Math.max(0, Math.floor(t * RAMP.length)))];

const lerpP = (a: V, b: V, t: number): V => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scl = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
const norm = (a: V): V => {
  const v = new THREE.Vector3(...a).normalize();
  return [v.x, v.y, v.z];
};

// Wing leading edge in left-wing space (+X). Mirrored for the right wing.
const WING: V[] = [
  [0.22, 1.5, 0.12],
  [1.0, 1.9, 0.02],
  [2.0, 1.75, -0.22],
  [2.9, 1.25, -0.55],
];

function spine(t: number, s: number): V {
  const tt = Math.min(0.999, Math.max(0, t));
  const f = tt * (WING.length - 1);
  const i = Math.floor(f);
  const p = lerpP(WING[i], WING[i + 1], f - i);
  return [p[0] * s, p[1], p[2]];
}

function tangent(t: number, s: number): V {
  return norm(sub(spine(t + 0.01, s), spine(t - 0.01, s)));
}

type B = ReturnType<typeof createBuilder>;

// One flame-shaped feather: a tapered outline extruded into a flat blade.
function feather(
  b: B,
  base: V,
  dir: V,
  len: number,
  w: number,
  color: string,
  up: V = [0, 1, 0],
) {
  const x = new THREE.Vector3(...dir).normalize();
  let y = new THREE.Vector3(...up).sub(x.clone().multiplyScalar(new THREE.Vector3(...up).dot(x)));
  if (y.lengthSq() < 1e-6) {
    y = new THREE.Vector3(0, 1, 0).sub(x.clone().multiplyScalar(x.y));
    if (y.lengthSq() < 1e-6) y = new THREE.Vector3(0, 0, 1);
  }
  y.normalize();
  const outline: number[][] = [
    [0, -w * 0.5],
    [len * 0.3, -w],
    [len * 0.78, -w * 0.55],
    [len, 0],
    [len * 0.78, w * 0.55],
    [len * 0.3, w],
    [0, w * 0.5],
  ];
  b.extrude(outline, { at: base, x: [x.x, x.y, x.z], y: [y.x, y.y, y.z] });
}

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const r = rng(7);

  // ---- Skeleton -----------------------------------------------------------
  b.joint("hips", { at: [0, 1.1, 0] });

  const neck = b.chain(
    "neck",
    [
      [0, 1.3, 0.2],
      [0, 1.55, 0.42],
      [0, 1.8, 0.58],
    ],
    { role: "neck" },
  );
  b.sweep(neck, 0.11, { color: PAL.crimson });

  const tail = b.chain(
    "tail",
    [
      [0, 1.0, -0.35],
      [0, 0.95, -0.8],
      [0, 0.9, -1.2],
    ],
    { role: "tail" },
  );
  b.sweep(tail, 0.07, { color: PAL.deep });

  // ---- Body ---------------------------------------------------------------
  b.part(new THREE.SphereGeometry(0.32, 14, 10), PAL.crimson, {
    at: [0, 1.1, 0],
    scale: [0.85, 1.0, 1.5],
  });
  b.part(new THREE.SphereGeometry(0.22, 12, 8), PAL.red, {
    at: [0, 1.05, 0.22],
    scale: [0.8, 0.9, 0.9],
  });
  b.part(new THREE.SphereGeometry(0.2, 10, 8), PAL.deep, {
    at: [0, 1.0, -0.3],
    scale: [0.75, 0.8, 1.2],
  });

  // ---- Head ---------------------------------------------------------------
  b.part(new THREE.SphereGeometry(0.15, 12, 9), PAL.crimson, {
    at: [0, 1.85, 0.66],
  });

  // Flame crest: plumes fanning up and back from the crown, flat in the side plane.
  const crownBase: V = [0, 1.95, 0.6];
  const CREST = 7;
  for (let i = 0; i < CREST; i++) {
    const a = (i - (CREST - 1) / 2) * 0.22;
    const dir = norm([Math.sin(a) * 0.35, 1, -0.45 - Math.abs(a) * 0.3]);
    const len = 0.55 + (1 - Math.abs(i - (CREST - 1) / 2) / CREST) * 0.35;
    feather(
      b,
      add(crownBase, [Math.sin(a) * 0.04, 0, 0]),
      dir,
      len,
      0.13,
      ramp(0.45 + (i / CREST) * 0.5),
      [0, 0, 1],
    );
  }

  // Amber eyes.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.035, 8, 6), PAL.eye, {
      at: [s * 0.09, 1.9, 0.74],
    });
  }

  // Golden hooked beak: upper cone plus a drooping hook.
  b.part(new THREE.ConeGeometry(0.06, 0.3, 8), PAL.beak, {
    at: [0, 1.84, 0.86],
    aim: [0, 1.8, 1.05],
  });
  b.part(new THREE.ConeGeometry(0.035, 0.12, 7), PAL.beak, {
    at: [0, 1.79, 0.98],
    aim: [0, 1.72, 1.1],
  });

  // ---- Legs and talons ----------------------------------------------------
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.03, 0.035, 0.85, 6), PAL.beak, {
      at: [s * 0.13, 0.45, 0.02],
    });
    for (const k of [-1, 0, 1]) {
      b.part(new THREE.ConeGeometry(0.02, 0.1, 5), PAL.beak, {
        at: [s * 0.13 + k * 0.03, 0.04, 0.09],
        aim: [s * 0.13 + k * 0.05, 0.0, 0.18],
      });
    }
  }

  // ---- Wings --------------------------------------------------------------
  const embers: V[] = [];

  for (const s of [1, -1]) {
    const name = s > 0 ? "wingL" : "wingR";
    const ch = b.chain(
      name,
      WING.map((p) => [p[0] * s, p[1], p[2]] as V),
      { role: "wing" },
    );
    b.sweep(ch, 0.06, { color: PAL.deep });

    // Coverts: short, dense, crimson at the body, reddening outward.
    for (let i = 0; i < 10; i++) {
      const t = 0.06 + i * 0.09;
      const tan = tangent(t, s);
      const base = add(spine(t, s), [0, -0.03, 0]);
      const dir = norm(add(tan, [0, -0.35, -0.25]));
      feather(b, base, dir, 0.6 + r() * 0.1, 0.26, ramp(0.1 + t * 0.4), [0, 0, 1]);
    }

    // Secondaries: orange band across the middle of the wing.
    for (let i = 0; i < 8; i++) {
      const t = 0.15 + i * 0.1;
      const tan = tangent(t, s);
      const base = add(spine(t, s), [0, -0.05, -0.12]);
      const dir = norm(add(scl(tan, 0.9), [0, -0.2, -0.4]));
      feather(b, base, dir, 1.0 + r() * 0.15, 0.22, ramp(0.45 + t * 0.3), [0, 0, 1]);
    }

    // Primaries: long flame tips, amber shading to gold.
    for (let i = 0; i < 7; i++) {
      const t = 0.6 + i * 0.065;
      const tan = tangent(t, s);
      const base = add(spine(t, s), [0, -0.05, -0.1]);
      const dir = norm(add(scl(tan, 0.6), [0, 0.05, -0.5]));
      feather(b, base, dir, 1.35 + r() * 0.2, 0.18, ramp(0.8 + i * 0.03), [0, 0, 1]);
    }

    // Embers drifting off the wing.
    for (let i = 0; i < 18; i++) {
      const t = r();
      const p = spine(t, s);
      embers.push([
        p[0] + (r() - 0.3) * 0.5 * s,
        p[1] + 0.1 + r() * 0.7,
        p[2] + (r() - 0.5) * 0.6,
      ]);
    }
  }

  // ---- Ribbon tail feathers ----------------------------------------------
  const TAIL_N = 9;
  for (let i = 0; i < TAIL_N; i++) {
    const a = (i - (TAIL_N - 1) / 2) * 0.16;
    const dir = norm([Math.sin(a) * 0.6, 0.02 + (r() - 0.5) * 0.08, -1]);
    const base: V = [Math.sin(a) * 0.05, 1.0, -0.4];
    feather(b, base, dir, 1.6 + r() * 0.5, 0.14, ramp(0.6 + (i / TAIL_N) * 0.35), [0, 1, 0]);
  }

  // ---- Embers and sparks --------------------------------------------------
  for (let i = 0; i < 12; i++) {
    embers.push([(r() - 0.5) * 0.8, 0.8 + r() * 1.6, -0.6 - r() * 1.0]);
  }
  const emberGeo = new THREE.SphereGeometry(0.03, 5, 4);
  embers.forEach((p, i) => {
    const color = i % 3 === 0 ? PAL.gold : i % 3 === 1 ? PAL.amber : PAL.orange;
    const size = 0.7 + r() * 0.6;
    b.part(emberGeo, color, { at: p, scale: [size, size, size] });
  });

  return b.root;
}
```