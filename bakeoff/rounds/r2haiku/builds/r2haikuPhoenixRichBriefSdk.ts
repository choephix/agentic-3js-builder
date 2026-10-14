import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

const C = {
  deep: "#6a0b16",
  crimson: "#a3141f",
  red: "#cf2e1b",
  vermil: "#e4511c",
  orange: "#f07a1c",
  amber: "#f7a021",
  gold: "#ffc53a",
  yellow: "#ffe68a",
  beak: "#f3b52e",
  eye: "#ffb000",
  pupil: "#2a0804",
  stone: "#3a2a25",
};

type V = number[];

const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (v: V): V => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mix = (a: V, b: V, t: number): V => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
// Unit vector perpendicular to d, as close to `up` as possible.
const ortho = (d: V, up: V): V => {
  const n = norm(d);
  const k = dot(up, n);
  return norm([up[0] - n[0] * k, up[1] - n[1] * k, up[2] - n[2] * k]);
};

// Flame-shaped feather outline: base at u=0, pointed curling tip at u=len.
function flame(len: number, wid: number): number[][] {
  return [
    [0, -wid * 0.45],
    [len * 0.25, -wid],
    [len * 0.6, -wid * 0.7],
    [len * 0.9, -wid * 0.2],
    [len, 0],
    [len * 0.88, wid * 0.25],
    [len * 0.62, wid * 0.7],
    [len * 0.28, wid],
    [0, wid * 0.45],
  ];
}

export const meta = {
  name: "Phoenix",
  description:
    "A phoenix rising from a fire pyre with wings flung open, flame-plume crest and tail, amber eyes, golden beak and drifting embers.",
};

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const rand = rng(1907);

  // A flame-shaped feather rooted at `at`, reaching along `dir`,
  // lying flat along the plane spanned by dir and `up`.
  const plume = (at: V, dir: V, len: number, wid: number, color: string, up: V = [0, 0, 1]) => {
    const x = norm(dir);
    const y = ortho(x, up);
    const g = b.extrude(flame(len, wid), { at, x, y });
    b.part(g, color, { at });
  };

  // A tapered cone whose base sits at `base` and whose tip points along `dir`.
  const cone = (base: V, dir: V, len: number, r: number, color: string) => {
    const g = new THREE.ConeGeometry(r, len, 8).translate(0, len / 2, 0);
    b.part(g, color, { at: base, dir: norm(dir) });
  };

  const ball = (at: V, r: number, color: string, sx = 1, sy = 1, sz = 1, seg = 12) => {
    const g = new THREE.SphereGeometry(r, seg, Math.max(6, seg - 2));
    g.scale(sx, sy, sz);
    b.part(g, color, { at });
  };

  // ---------- Spine, chest and neck ----------
  const spine = b.chain(
    "spine",
    [
      [0, 1.46, -0.36],
      [0, 1.5, -0.1],
      [0, 1.55, 0.12],
      [0, 1.63, 0.3],
    ],
    { role: "spine" },
  );
  b.sweep(spine, 0.14, { color: C.crimson });
  ball([0, 1.52, 0.02], 0.2, C.deep, 1, 1.1, 1.5);

  const neck = b.chain(
    "neck",
    [
      [0, 1.63, 0.3],
      [0, 1.8, 0.44],
      [0, 1.94, 0.56],
    ],
    { role: "neck" },
  );
  b.sweep(neck, 0.075, { color: C.red });

  // Head
  ball([0, 2.02, 0.62], 0.12, C.red, 1, 1, 1.15);

  // Golden hooked beak: upper and lower mandibles plus a hook at the tip.
  cone([0, 2.0, 0.7], [0, -0.15, 1], 0.2, 0.055, C.beak);
  cone([0, 1.97, 0.7], [0, -0.2, 1], 0.16, 0.035, C.beak);
  cone([0, 1.97, 0.9], [0, -0.9, 0.4], 0.06, 0.03, C.beak);

  // Glowing amber eyes with dark pupils.
  for (const s of [1, -1]) {
    ball([s * 0.11, 2.04, 0.64], 0.03, C.eye, 1, 1, 1, 10);
    ball([s * 0.118, 2.04, 0.66], 0.012, C.pupil, 1, 1, 1, 8);
  }

  // Crest of flame-shaped plumes rising and sweeping back from the head.
  const crestColors = [C.orange, C.amber, C.gold, C.amber, C.orange];
  for (let j = -2; j <= 2; j++) {
    const k = Math.abs(j);
    const dir: V = [j * 0.22, 0.85, -0.4 - 0.05 * k];
    plume([j * 0.025, 2.08, 0.56], dir, 0.4 - 0.05 * k, 0.09, crestColors[j + 2]);
  }

  // ---------- Wings ----------
  const primaryColors = [C.deep, C.crimson, C.red, C.vermil, C.orange, C.amber, C.gold];
  const coveColors = [C.crimson, C.red, C.red, C.vermil, C.orange, C.amber];

  for (const s of [1, -1]) {
    const S: V = [s * 0.2, 1.7, 0.12];
    const E: V = [s * 0.7, 1.93, 0.08];
    const W: V = [s * 1.3, 2.06, -0.06];
    const T: V = [s * 1.8, 1.92, -0.3];

    const wing = b.chain(s > 0 ? "wingL" : "wingR", [S, E, W, T], { role: "wing" });
    b.sweep(wing, 0.045, { color: C.red });

    // Primaries: fanned out from the wing tip, deep red at the body side to gold at the tips.
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const p = mix(W, T, t * 0.85);
      const dir: V = [s, -0.08 - 0.2 * t, 0];
      plume(p, dir, 0.5 + 0.2 * t, 0.085, primaryColors[i]);
    }

    // Secondaries: sweep up and out along the forearm.
    for (let i = 0; i < 6; i++) {
      const p = mix(E, W, i / 5);
      plume(p, [s * 0.45, 0.6, -0.15], 0.42, 0.1, coveColors[i]);
    }

    // Coverts over the shoulder, deep crimson.
    for (let i = 0; i < 4; i++) {
      const p = mix(S, E, (i + 1) / 5);
      plume(p, [s * 0.3, 0.85, -0.2], 0.28, 0.08, C.deep);
    }
  }

  // ---------- Tail: ribbons of fire trailing down into the pyre ----------
  const tailSpine = b.chain(
    "tail",
    [
      [0, 1.42, -0.36],
      [0, 1.25, -0.7],
      [0, 1.0, -1.0],
      [0, 0.75, -1.25],
    ],
    { role: "tail" },
  );
  b.sweep(tailSpine, 0.04, { color: C.deep });

  const ribbonColors = [C.crimson, C.red, C.vermil, C.gold];
  const ribbonWid = [0.07, 0.085, 0.09, 0.08];
  for (let i = 0; i < 5; i++) {
    const xo = (i - 2) * 0.07;
    const pts: V[] = [
      [xo, 1.42, -0.36],
      [xo * 1.6, 1.25, -0.7],
      [xo * 2.2, 1.0, -1.0],
      [xo * 2.6, 0.75, -1.25],
      [xo * 2.8, 0.55, -1.45],
    ];
    for (let k = 0; k < 4; k++) {
      const d = sub(pts[k + 1], pts[k]);
      const len = Math.hypot(d[0], d[1], d[2]) * 1.15;
      plume(pts[k], d, len, ribbonWid[k], ribbonColors[k], [0, 1, 0]);
    }
  }

  // ---------- Legs and talons, clutching above the flames ----------
  for (const s of [1, -1]) {
    const leg = b.chain(
      s > 0 ? "legL" : "legR",
      [
        [s * 0.12, 1.36, 0.02],
        [s * 0.16, 1.02, 0.14],
        [s * 0.12, 0.86, 0.02],
      ],
      { role: "leg" },
    );
    b.sweep(leg, 0.035, { color: C.gold });
    const ankle: V = [s * 0.12, 0.86, 0.02];
    cone(ankle, [s * 0.2, -0.6, 0.7], 0.09, 0.02, C.gold);
    cone(ankle, [0, -0.6, 0.8], 0.09, 0.02, C.gold);
    cone(ankle, [-s * 0.2, -0.6, 0.7], 0.09, 0.02, C.gold);
  }

  // ---------- Pyre: stone bowl on the ground, flames rising from it ----------
  const bowl = new THREE.CylinderGeometry(0.55, 0.42, 0.22, 12).translate(0, 0.11, 0);
  b.part(bowl, C.stone, { at: [0, 0.11, 0] });
  const core = new THREE.CylinderGeometry(0.4, 0.4, 0.04, 12).translate(0, 0.22, 0);
  b.part(core, C.amber, { at: [0, 0.22, 0] });

  const flameColors = [C.red, C.orange, C.amber, C.gold];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    const at: V = [c * 0.3, 0.2, sn * 0.3];
    const x = norm([c * 0.25, 1, sn * 0.25]);
    const y: V = [-sn, 0, c];
    const g = b.extrude(flame(0.6 + rand() * 0.3, 0.16), { at, x, y });
    b.part(g, flameColors[i % flameColors.length], { at });
  }

  // ---------- Embers and sparks drifting off the wings and rising from the fire ----------
  const emberColors = [C.gold, C.yellow, C.amber, C.orange];
  for (let k = 0; k < 70; k++) {
    let at: V;
    if (k < 40) {
      const side = k % 2 ? 1 : -1;
      at = [side * (0.4 + rand() * 1.5), 1.6 + rand() * 1.0, -0.5 + rand() * 0.9];
    } else {
      const a = rand() * Math.PI * 2;
      const r = rand() * 0.6;
      at = [Math.cos(a) * r, 0.4 + rand() * 1.0, Math.sin(a) * r];
    }
    const g = new THREE.OctahedronGeometry(0.012 + rand() * 0.014, 0);
    b.part(g, emberColors[Math.floor(rand() * emberColors.length)], { at });
  }

  return b.root;
}
