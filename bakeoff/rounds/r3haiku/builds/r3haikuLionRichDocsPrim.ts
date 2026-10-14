import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  mix,
  paint,
  smoothstep,
  countershade,
  svg,
  catmull,
} from "../../../../src/index";

export const meta = {
  name: "lion",
  description: "A proud old male lion resting in a sphinx pose, head held high, with a golden-to-chocolate mane.",
};

const TAWNY = "#c7863a";
const TAWNY_DARK = "#9a5e2a";
const CREAM = "#f3e4c0";
const BLOND = "#eccb74";
const CHOC = "#4b2a18";
const DARK = "#2b1a10";
const AMBER = "#e8a02a";
const NOSE = "#140e0b";
const SCAR = "#c0625a";
const PAW = "#b67634";

// Strand drawing: white on transparent, so the part or card colour tints it.
const STRANDS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">` +
    `<g fill="none" stroke="#fff" stroke-linecap="round" stroke-width="3.5">` +
    `<path d="M16 64Q9 40 15 4"/><path d="M11 64Q4 42 9 18"/><path d="M21 64Q27 44 22 14"/>` +
    `<path d="M14 64Q12 36 18 24"/><path d="M25 64Q30 46 28 30"/><path d="M7 60Q6 44 3 36"/>` +
    `</g></svg>`,
  { size: 128 },
);

const DEG = Math.PI / 180;

export default function build() {
  const b = createBuilder({ name: "lion" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.34, -0.5], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.34, -0.5],
      [0, 0.36, -0.25],
      [0, 0.44, 0.05],
      [0, 0.55, 0.3],
    ]),
    { parent: hips, count: 3, role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.55, 0.3],
      [0, 0.9, 0.5],
      [0, 1.22, 0.62],
    ]),
    { parent: spine.joints[spine.joints.length - 1], count: 2, role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 1.3, 0.66],
    dir: [0, 0.25, 1],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.03, up: -0.13 }),
    aim: head.local({ forward: 0.3, up: -0.16 }),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.4, -0.7],
      [0.06, 0.3, -1.0],
      [0.18, 0.18, -1.3],
      [0.3, 0.1, -1.45],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail" },
  );

  // ---------- body ----------
  b.sweep(spine, (t: number) => 0.3 - 0.06 * t + 0.02 * Math.sin(t * Math.PI), {
    color: countershade(TAWNY, CREAM, { level: -0.2 }),
  });

  b.sweep(neck, (t: number) => 0.17 - 0.02 * t, { color: TAWNY });

  // ---------- tail ----------
  b.sweep(tail, (t: number) => 0.065 - 0.02 * t, {
    bands: [
      [0.8, TAWNY],
      [1, DARK],
    ],
  });

  const tipPos = new THREE.Vector3(0.3, 0.12, -1.45);
  const tuftFrames = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const at = new THREE.Vector3(tipPos.x + 0.03 * Math.cos(a), tipPos.y, tipPos.z + 0.03 * Math.sin(a));
    const dir = new THREE.Vector3(Math.cos(a) * 0.3, 1, Math.sin(a) * 0.3);
    tuftFrames.push(frame(at, dir));
  }
  b.cards(tuftFrames, STRANDS, {
    size: [0.1, 0.2],
    lean: 15,
    vary: 0.2,
    rng: rng(9),
    color: DARK,
    bone: tail.tip,
  });

  // ---------- legs ----------
  const toes = (joint: THREE.Object3D | any, x: number, z: number, y: number) => {
    for (const k of [-1, 0, 1]) {
      b.part(new THREE.SphereGeometry(0.03, 6, 5), CREAM, {
        bone: joint,
        at: [x + k * 0.04, y, z],
      });
    }
  };

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // forelegs stretched forward on the ground
    const x = s * 0.18;
    const fore = b.chain(
      `fore${L}`,
      catmull([
        [x, 0.42, 0.28],
        [x, 0.14, 0.46],
        [x, 0.07, 0.78],
        [x, 0.07, 0.95],
      ]),
      {
        parent: spine.joints[spine.joints.length - 1],
        names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `pawF${L}`],
        role: "leg",
      },
    );
    b.sweep(fore, (t: number) => 0.095 - 0.03 * t, { color: TAWNY });
    b.part(new THREE.SphereGeometry(0.1, 10, 8), PAW, {
      bone: fore.tip,
      at: [x, 0.065, 0.97],
      scale: [1.1, 0.7, 1.25],
    });
    toes(fore.tip, x, 1.06, 0.04);

    // folded hind leg, haunch on the ground, foot forward
    const hx = s * 0.2;
    const hind = b.chain(
      `hind${L}`,
      catmull([
        [hx, 0.3, -0.6],
        [hx * 1.05, 0.08, -0.4],
        [hx, 0.07, -0.05],
      ]),
      { parent: hips, names: [`thigh${L}`, `knee${L}`, `pawH${L}`], role: "leg" },
    );
    b.sweep(hind, (t: number) => 0.1 - 0.03 * t, { color: TAWNY });
    b.part(new THREE.SphereGeometry(0.2, 12, 9), TAWNY, {
      bone: hips,
      at: [hx, 0.3, -0.6],
      scale: [1.0, 1.1, 1.1],
    });
    b.part(new THREE.SphereGeometry(0.09, 10, 8), PAW, {
      bone: hind.tip,
      at: [hx, 0.06, 0.0],
      scale: [1.0, 0.7, 1.3],
    });
    toes(hind.tip, hx, 0.1, 0.035);
  }

  // ---------- head ----------
  const HC = new THREE.Vector3(0, 1.3, 0.66);
  const lat = (s: number, d: number) => (s > 0 ? { left: d } : { right: d });

  b.part(new THREE.SphereGeometry(0.2, 12, 10), TAWNY, {
    bone: head,
    frame: head,
    at: [0, 1.3, 0.66],
  });

  b.part(new THREE.SphereGeometry(0.11, 10, 8), CREAM, {
    bone: head,
    at: head.local({ forward: 0.14, up: -0.07 }),
    scale: [1.25, 0.85, 1.1],
  });

  b.part(new THREE.SphereGeometry(0.055, 8, 6), NOSE, {
    bone: head,
    at: head.local({ forward: 0.245, up: 0.02 }),
    scale: [1.6, 0.9, 0.8],
  });

  b.part(new THREE.BoxGeometry(0.15, 0.06, 0.24), CREAM, {
    bone: jaw,
    at: jaw.local({ forward: 0.12, up: -0.01 }),
  });

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.035, 8, 6), AMBER, {
      bone: head,
      at: head.local({ forward: 0.165, up: 0.05, ...lat(s, 0.085) }),
    });
    b.part(new THREE.SphereGeometry(0.018, 6, 5), NOSE, {
      bone: head,
      at: head.local({ forward: 0.19, up: 0.05, ...lat(s, 0.085) }),
    });
    b.part(new THREE.BoxGeometry(0.085, 0.028, 0.05), TAWNY_DARK, {
      bone: head,
      frame: head,
      at: head.local({ forward: 0.17, up: 0.095, ...lat(s, 0.085) }),
    });
  }

  // scar across the right eyebrow, laid on the skull
  const onSkull = (q: THREE.Vector3) => HC.clone().add(q.clone().sub(HC).normalize().multiplyScalar(0.21));
  b.rod(
    onSkull(head.local({ forward: 0.19, up: 0.14, right: 0.0 }).clone()),
    onSkull(head.local({ forward: 0.14, up: 0.07, right: 0.13 }).clone()),
    0.009,
    { color: SCAR },
  );

  // ---------- mane ----------
  const FACE = new THREE.Vector3(0, 1.3, 0.9);
  const maneColor = paint((p) => {
    const d = Math.hypot(p.x - FACE.x, p.y - FACE.y, p.z - FACE.z);
    return mix(BLOND, CHOC, smoothstep(0.12, 0.42, d));
  });

  const maneFrames = [];
  for (const layer of [0.2, 0.25]) {
    for (let az = 0; az < 360; az += 14) {
      for (let el = -75; el <= 85; el += 22) {
        const a = az * DEG;
        const e = el * DEG;
        const d = new THREE.Vector3(Math.cos(e) * Math.sin(a), Math.sin(e), Math.cos(e) * Math.cos(a));
        if (d.z > 0.4) continue; // keep the face clear
        const at = HC.clone().addScaledVector(d, layer);
        maneFrames.push(frame(at, d));
      }
    }
  }

  b.cards(maneFrames, STRANDS, {
    size: [0.15, 0.34],
    lean: 30,
    bend: 25,
    vary: 0.25,
    rng: rng(11),
    color: maneColor,
    bone: head,
    sink: 0.15,
  });

  return b.root;
}
