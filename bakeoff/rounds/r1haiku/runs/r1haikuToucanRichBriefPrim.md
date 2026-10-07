```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Keel-billed toucan on an orchid branch",
  description:
    "A glossy black keel-billed toucan with a rainbow beak, lime eye rings and blue feet, perched on a mossy branch beside one pink orchid.",
};

const COL = {
  black: "#14171c",
  lime: "#8ee04a",
  blue: "#3fb8ff",
  orange: "#ff8a1f",
  red: "#e0203a",
  yellow: "#ffe13a",
  skin: "#9be35a",
  footBlue: "#1e7fe8",
  moss: "#6fbf45",
  mossDark: "#2f7a2a",
  bark: "#6b4a2b",
  pink: "#ff7fbf",
  pinkDeep: "#e83c8f",
  centre: "#ffd23a",
};

type V = number[];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dist = (a: V, b: V) => Math.hypot(...sub(a, b));
const unit = (a: V): V => {
  const l = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / l, a[1] / l, a[2] / l];
};
const lerp3 = (a: V, b: V, t: number): V => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

// Beak centrelines in model space (bird faces +Z).
const beakPoint = (s: number, lower: boolean): V =>
  lower ? [0, 0.79 - 0.06 * s, 0.14 + 0.24 * s] : [0, 0.84 - 0.1 * s, 0.14 + 0.3 * s];

export default function build() {
  const b = createBuilder({ name: "keel-billed-toucan" });
  const rand = rng(7);

  // ---------- Branch, stump and moss ----------
  b.part(new THREE.BoxGeometry(0.2, 0.35, 0.2), COL.bark, { at: [-0.45, 0.175, 0] });
  b.part(new THREE.CylinderGeometry(0.035, 0.045, 0.9, 8), COL.bark, {
    at: [0, 0.35, 0],
    dir: [1, 0.04, 0],
  });
  b.part(new THREE.CylinderGeometry(0.01, 0.014, 0.12, 6), COL.bark, {
    at: [0.25, 0.44, 0.03],
    dir: [0.3, 1, 0.2],
  });

  const mossSpots: [number, number][] = [
    [-0.3, 0.03],
    [-0.12, -0.03],
    [0.1, 0.03],
    [0.28, -0.02],
  ];
  mossSpots.forEach(([x, z], i) => {
    const jitter = (rand() - 0.5) * 0.02;
    b.part(new THREE.SphereGeometry(0.05, 8, 5), i % 2 ? COL.moss : COL.mossDark, {
      at: [x + jitter, 0.39, z],
      scale: [1.6, 0.45, 1.2],
    });
  });
  b.part(new THREE.SphereGeometry(0.06, 8, 5), COL.mossDark, {
    at: [-0.45, 0.36, 0.04],
    scale: [1.4, 0.4, 1.3],
  });

  // ---------- Orchid ----------
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.32, 6), COL.moss, {
    at: [0.42, 0.55, 0],
  });
  b.part(new THREE.SphereGeometry(0.045, 8, 6), COL.moss, {
    at: [0.36, 0.46, 0.04],
    scale: [1.6, 0.3, 0.8],
  });
  const C: V = [0.42, 0.72, 0.02];
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5 + Math.PI / 2;
    b.part(new THREE.SphereGeometry(0.03, 8, 6), i === 0 ? COL.pinkDeep : COL.pink, {
      at: [C[0] + Math.cos(a) * 0.04, C[1] + Math.sin(a) * 0.04, C[2]],
      scale: [1.3, 1.1, 0.4],
    });
  }
  b.part(new THREE.SphereGeometry(0.02, 8, 6), COL.pinkDeep, {
    at: [C[0], C[1] - 0.01, C[2] + 0.012],
    scale: [1, 0.8, 0.6],
  });
  b.part(new THREE.SphereGeometry(0.012, 6, 5), COL.centre, {
    at: [C[0], C[1], C[2] + 0.01],
  });
  b.part(new THREE.SphereGeometry(0.02, 8, 6), COL.pink, {
    at: [0.44, 0.66, -0.01],
  });

  // ---------- Skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.52, 0] });
  const neck = b.joint("neck", { at: [0, 0.7, 0.05], parent: hips });
  const head = b.joint("head", { at: [0, 0.8, 0.07], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.79, 0.14], parent: head });

  // ---------- Body ----------
  b.part(new THREE.SphereGeometry(0.12, 14, 10), COL.black, {
    at: [0, 0.6, -0.02],
    scale: [0.85, 1.15, 1.35],
  });
  b.part(new THREE.SphereGeometry(0.07, 10, 8), COL.black, { at: [0, 0.73, 0.05] });
  b.part(new THREE.SphereGeometry(0.085, 12, 9), COL.black, { at: [0, 0.8, 0.07] });

  // Lemon-yellow bib on the upper chest.
  b.part(new THREE.SphereGeometry(0.06, 10, 8), COL.yellow, {
    at: [0, 0.68, 0.1],
    scale: [1.2, 1.0, 0.7],
  });

  // Wings folded along the flanks.
  for (const side of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.03, 0.22, 0.26), COL.black, {
      at: [0.13 * side, 0.6, -0.06],
    });
  }

  // Tail and scarlet undertail patch.
  const tailFrom: V = [0, 0.52, -0.16];
  const tailTo: V = [0, 0.36, -0.42];
  b.part(new THREE.BoxGeometry(0.1, dist(tailFrom, tailTo), 0.02), COL.black, {
    at: lerp3(tailFrom, tailTo, 0.5),
    dir: unit(sub(tailTo, tailFrom)),
  });
  b.part(new THREE.SphereGeometry(0.05, 8, 6), COL.red, {
    at: [0, 0.5, -0.19],
    scale: [1.4, 0.7, 1],
  });

  // ---------- Eyes with lime skin rings ----------
  for (const side of [1, -1]) {
    const ex = 0.072 * side;
    b.part(new THREE.SphereGeometry(0.02, 8, 6), COL.black, { at: [ex, 0.815, 0.13] });
    const ring = new THREE.TorusGeometry(0.03, 0.01, 6, 12);
    ring.rotateY(Math.PI / 2); // ring normal now points sideways
    b.part(ring, COL.skin, { at: [ex, 0.815, 0.125] });
  }

  // ---------- Rainbow beak ----------
  const beakSeg = (s0: number, s1: number, color: string, lower: boolean) => {
    const p0 = beakPoint(s0, lower);
    const p1 = beakPoint(s1, lower);
    const rad = (s: number) => (lower ? 0.04 - 0.012 * s : 0.05 - 0.02 * s);
    const geo = new THREE.CylinderGeometry(rad(s1), rad(s0), dist(p0, p1), 8);
    b.part(geo, color, { at: lerp3(p0, p1, 0.5), dir: unit(sub(p1, p0)) });
  };

  // Upper mandible: lime, sky blue, orange, cherry-red tip.
  beakSeg(0.0, 0.3, COL.lime, false);
  beakSeg(0.3, 0.58, COL.blue, false);
  beakSeg(0.58, 0.84, COL.orange, false);
  beakSeg(0.84, 1.0, COL.red, false);

  // Lower mandible on the jaw joint.
  beakSeg(0.0, 0.35, COL.lime, true);
  beakSeg(0.35, 0.7, COL.blue, true);
  beakSeg(0.7, 0.88, COL.orange, true);
  beakSeg(0.88, 1.0, COL.red, true);

  // ---------- Legs and bright blue feet ----------
  for (const side of [1, -1]) {
    const sx = 0.06 * side;
    const tag = side > 0 ? "L" : "R";
    const hip = b.joint("hip" + tag, { at: [sx, 0.5, 0], parent: hips });
    const knee = b.joint("knee" + tag, { at: [sx, 0.44, 0.02], parent: hip });
    const ankle = b.joint("ankle" + tag, { at: [sx, 0.39, 0.04], parent: knee });

    b.part(new THREE.SphereGeometry(0.03, 8, 6), COL.black, { at: [sx, 0.48, 0] });

    const shinFrom: V = [sx, 0.44, 0.02];
    const shinTo: V = [sx, 0.39, 0.04];
    b.part(new THREE.CylinderGeometry(0.016, 0.014, dist(shinFrom, shinTo), 6), COL.footBlue, {
      at: lerp3(shinFrom, shinTo, 0.5),
      dir: unit(sub(shinTo, shinFrom)),
    });

    const toes: V[] = [
      [0, 0, 1],
      [0.5 * side, 0, 0.87],
      [-0.3 * side, 0, 0.95],
      [0, 0, -1],
    ].map((d) => unit(d));
    for (const d of toes) {
      const toeStart: V = [sx, 0.39, 0.04];
      const toeEnd: V = [sx + d[0] * 0.05, 0.39, 0.04 + d[2] * 0.05];
      b.part(new THREE.CylinderGeometry(0.011, 0.008, 0.05, 6), COL.footBlue, {
        at: lerp3(toeStart, toeEnd, 0.5),
        dir: d,
      });
    }
  }

  return b.root;
}
```