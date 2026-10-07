```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, paint, countershade, rng, lerp } from "agentic-3js-builder";

export const meta = {
  name: "Phoenix",
  description:
    "A rising phoenix with wings flung open: crimson-to-gold flame feathers, a crest of flame plumes, ribbon tail feathers, amber eyes, a golden hooked beak and drifting embers.",
};

const CRIMSON = "#a50d1c";
const RED = "#d42a14";
const ORANGE = "#ff7a12";
const AMBER = "#ffae1a";
const GOLD = "#ffd93a";
const PALE = "#fff0a0";
const BEAK = "#f2b51c";
const EYE = "#ffb400";
const DARK = "#3a0a08";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "phoenix" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- skeleton: spine + neck ----------
  const hips = b.joint("hips", { at: [0, 1.0, -0.35], aim: [0, 1.08, -0.05], role: "spine" });
  const full = catmull([
    [0, 1.0, -0.35],
    [0, 1.08, -0.05],
    [0, 1.22, 0.25],
    [0, 1.4, 0.42],
    [0, 1.6, 0.52],
    [0, 1.75, 0.6],
  ]);
  const spine = b.chain("spine", full.slice(0, 0.5), { parent: hips, count: 3, role: "spine" });
  const neck = b.chain("neck", full.slice(0.5, 1), { parent: spine, count: 3, role: "neck" });
  b.sweep(full, [0.05, 0.12, 0.19, 0.18, 0.12, 0.075, 0.055, 0.05], {
    bone: [spine, neck],
    color: countershade(RED, ORANGE, { level: -0.2 }),
  });

  const head = b.joint("head", { parent: neck, at: full.at(1), dir: [0, 0.1, 1], role: "head" });
  b.part(new THREE.SphereGeometry(0.09, 8, 6), RED, { bone: head, at: head.local({ forward: 0.03 }), scale: [1, 1.15, 1] });
  b.part(new THREE.SphereGeometry(0.06, 7, 5), ORANGE, { bone: head, at: head.local({ forward: 0.08, down: 0.02 }) });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.06, down: 0.03 }),
    aim: head.local({ forward: 0.2, down: 0.035 }),
    role: "jaw",
  });
  // upper beak (hooked) and lower beak
  b.spike(head.local({ forward: 0.07, up: 0.015 }), head.local({ forward: 0.21, down: 0.03 }), null, 0.045, {
    color: BEAK,
    bone: head,
    sides: 6,
  });
  b.spike(head.local({ forward: 0.17, down: 0.0 }), head.local({ forward: 0.2, down: 0.09 }), null, 0.026, {
    color: BEAK,
    bone: head,
    sides: 6,
  });
  b.spike(head.local({ forward: 0.07, down: 0.03 }), head.local({ forward: 0.19, down: 0.045 }), null, 0.03, {
    color: GOLD,
    bone: jaw,
    sides: 6,
  });

  // eyes
  for (const s of [1, -1]) {
    const ep = head.local([-s * 0.072, 0.05, 0.03]);
    b.part(new THREE.SphereGeometry(0.026, 7, 5), EYE, { bone: head, at: ep });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), DARK, {
      bone: head,
      at: head.local([-s * 0.088, 0.062, 0.032]),
    });
    b.part(new THREE.SphereGeometry(0.006, 5, 3), PALE, {
      bone: head,
      at: head.local([-s * 0.094, 0.066, 0.042]),
    });
  }

  // ---------- feather helpers ----------
  const paints = new Map<string, ReturnType<typeof paint>>();
  const featherPaint = (L: number) => {
    const key = L.toFixed(2);
    let p = paints.get(key);
    if (!p) {
      p = paint((_p, _n, s) => (s[0] < L * 0.28 ? CRIMSON : s[0] < L * 0.55 ? ORANGE : s[0] < L * 0.82 ? AMBER : GOLD));
      paints.set(key, p);
    }
    return p;
  };
  const flame = (L: number, w: number): any => [
    [0, -w * 0.35],
    [L * 0.3, -w * 0.6],
    [L * 0.62, -w * 0.45],
    [L * 0.88, -w * 0.15],
    [L, w * 0.25, "sharp"],
    [L * 0.72, w * 0.45],
    [L * 0.4, w * 0.7],
    [0, w * 0.35],
  ];

  // wing feather lying in a plane with normal N
  const wingFeather = (bone: any, o: THREE.Vector3, h: THREE.Vector3, N: THREE.Vector3, L: number, w: number, lift: number) => {
    const d = h.clone().addScaledVector(N, -h.dot(N)).normalize();
    const yv = N.clone().cross(d).normalize();
    if (yv.z > 0) yv.negate();
    const at = o.clone().addScaledVector(N, lift);
    b.extrude(flame(L, w), {
      at: [at.x, at.y, at.z],
      x: [d.x, d.y, d.z],
      y: [yv.x, yv.y, yv.z],
      thickness: 0.012,
      color: featherPaint(L),
      bone,
    });
  };

  // ---------- wings ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const S = V(s * 0.14, 1.3, 0.12);
    const E = V(s * 0.8, 1.55, 0.0);
    const W = V(s * 1.5, 1.85, -0.15);
    const arm = b.chain(`arm${side}`, [S.toArray(), E.toArray(), W.toArray()], {
      parent: spine.joints[1],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "wing",
    });
    b.sweep(arm, [0.075, 0.035], { color: CRIMSON });
    const N = V(-s * 0.4, 1, 0).normalize();

    // primaries
    for (let i = 0; i < 9; i++) {
      const phi = ((-8 + i * 9) * Math.PI) / 180;
      const h = V(s * Math.cos(phi), 0, -Math.sin(phi));
      const o = W.clone().lerp(E, i * 0.03);
      wingFeather(arm.joints[2], o, h, N, 1.32 - i * 0.06, 0.17, i * 0.004);
    }
    // secondaries on forearm
    for (let j = 0; j < 6; j++) {
      const phi = ((100 - 6 * j) * Math.PI) / 180;
      const h = V(s * Math.cos(phi), 0, -Math.sin(phi));
      const o = E.clone().lerp(W, ((j + 0.5) / 6) * 0.92);
      wingFeather(arm.joints[1], o, h, N, 0.62 + 0.04 * j, 0.15, 0.03 + j * 0.003);
      wingFeather(arm.joints[1], o, V(s * Math.cos(phi - 0.2), 0, -Math.sin(phi - 0.2)), N, 0.3, 0.12, 0.07 + j * 0.003);
    }
    // inner wing
    for (let j = 0; j < 4; j++) {
      const phi = ((108 + 4 * j) * Math.PI) / 180;
      const h = V(s * Math.cos(phi), 0, -Math.sin(phi));
      const o = S.clone().lerp(E, (j + 0.5) / 4);
      wingFeather(arm.joints[0], o, h, N, 0.52 + 0.02 * j, 0.15, 0.03 + j * 0.003);
      wingFeather(arm.joints[0], o, V(s * Math.cos(phi - 0.2), 0, -Math.sin(phi - 0.2)), N, 0.28, 0.12, 0.07 + j * 0.003);
    }
    // leading edge coverts
    for (let j = 0; j < 4; j++) {
      const o = S.clone().lerp(W, 0.2 + j * 0.22);
      const h = V(s * 0.5, 0, -0.85);
      wingFeather(j < 2 ? arm.joints[0] : arm.joints[1], o, h, N, 0.24, 0.09, 0.09);
    }

    // legs
    const leg = b.chain(
      `leg${side}`,
      [
        [s * 0.1, 1.0, -0.1],
        [s * 0.14, 0.85, -0.3],
        [s * 0.14, 0.62, -0.5],
      ],
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" },
    );
    b.sweep(leg, [0.04, 0.022], { color: AMBER });
    const ank: [number, number, number] = [s * 0.14, 0.62, -0.5];
    for (const k of [-1, 0, 1]) {
      b.spike(ank, [k * 0.35, -0.55, 0.45], 0.14, 0.014, { color: BEAK, bone: leg.joints[2], sides: 5 });
    }
    b.spike(ank, [0, -0.5, -0.6], 0.09, 0.012, { color: BEAK, bone: leg.joints[2], sides: 5 });
  }

  // ---------- crest of flame plumes ----------
  const topPt = head.local([0, -0.01, 0.085]);
  const crestA = [18, 32, 46, 60, 74];
  const crestL = [0.5, 0.58, 0.54, 0.44, 0.34];
  for (let j = 0; j < 5; j++) {
    for (const k of [-1, 0, 1]) {
      if (k !== 0 && j % 2 === 0) continue;
      const a = (crestA[j] * Math.PI) / 180;
      const L = crestL[j] * (k === 0 ? 1 : 0.75);
      const d = [0, Math.sin(a), -Math.cos(a)];
      const yv = [0, Math.cos(a), Math.sin(a)];
      b.extrude(flame(L, 0.1), {
        at: [topPt.x + k * 0.03, topPt.y, topPt.z],
        x: d as [number, number, number],
        y: yv as [number, number, number],
        thickness: 0.014,
        color: featherPaint(L),
        bone: head,
      });
    }
  }

  // ---------- tail ribbons ----------
  for (let i = 0; i < 7; i++) {
    const f = (i - 3) / 3;
    const af = Math.abs(f);
    const wv = 0.12 * (i % 2 ? 1 : -1);
    const endZ = -0.45 - 1.6 * (1 - af * 0.45);
    const endY = 0.04 + af * 0.45;
    const pts = [
      [f * 0.08, 1.0, -0.3],
      [f * 0.3 + wv, 0.86, -0.8],
      [f * 0.65 - wv, 0.52 + af * 0.1, (endZ - 0.5) * 0.7 - 0.3],
      [f * 1.0, endY, endZ],
    ];
    const tail = b.chain(`tail${String.fromCharCode(65 + i)}`, catmull(pts), { parent: hips, count: 4, role: "tail" });
    const wid = 0.09 - af * 0.02;
    b.sweep(tail, (t: number) => [wid * (1 - 0.5 * t) + 0.008, 0.01], {
      bands: [
        [0.3, CRIMSON],
        [0.62, ORANGE],
        [0.85, AMBER],
        [1, GOLD],
      ],
      caps: "point",
    });
  }

  // ---------- embers ----------
  const r: any = rng(11);
  const rand = () => (typeof r === "function" ? r() : r.next());
  const emberCols = [GOLD, ORANGE, PALE, AMBER];
  for (let i = 0; i < 70; i++) {
    const x = (rand() - 0.5) * 5.4;
    const y = 0.25 + rand() * 2.4;
    const z = -1.4 + rand() * 2.0;
    if (Math.abs(x) < 0.3 && y > 0.8 && y < 1.9 && z > -0.6) continue;
    const sz = 0.012 + rand() * 0.022;
    b.part(new THREE.OctahedronGeometry(sz, 0), emberCols[i % 4], {
      at: [x, y, z],
      bone: hips,
      rotation: [rand() * 90, rand() * 90, rand() * 90],
    });
  }

  return b.root;
}
```