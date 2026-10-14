```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  grain,
  mottle,
  noise,
  paint,
  polyline,
  svg,
} from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "Battle-worn knight",
  description:
    "A dented plate knight: great helm with a tall crimson plume, gold-etched pauldrons, a blue surcoat and kite shield bearing a silver griffin, a broadsword and a torn crimson cape.",
};

// palette
const BLUE = "#23408f";
const BLUE_DEEP = "#15286a";
const CRIMSON = "#9a1c26";
const CRIMSON_DEEP = "#4e0b13";
const GOLD = "#d4aa52";
const STEEL = "#8d959f";
const STEEL_HI = "#d3d9e2";
const STEEL_LO = "#4a5059";
const LEATHER = "#4b2e1c";
const DARK = "#141519";
const PAD = "#2d313b";

// silver griffin, rampant, facing dexter
const GRIFFIN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<g fill="#e7ecf4" stroke="#3b4357" stroke-width="1.6" stroke-linejoin="round">
<path d="M52 50 C56 34 66 20 92 6 C88 14 90 18 88 24 C94 26 94 34 88 38 C92 42 88 48 82 48 C78 54 72 54 68 56 C64 58 58 56 52 50 Z"/>
<path d="M70 76 C80 74 88 80 96 90 C88 88 82 88 76 84 C74 90 70 92 66 90 Z"/>
<path d="M50 74 C46 82 40 88 36 94 L44 96 C50 90 56 84 60 78 Z"/>
<path d="M38 50 C48 42 66 44 72 56 C78 68 74 80 66 84 C58 88 48 84 44 76 C38 68 32 58 38 50 Z"/>
<path d="M42 52 C34 50 26 52 18 46 L14 52 C22 60 32 62 44 62 Z"/>
<path d="M18 46 L11 41 L16 50 Z"/>
<path d="M28 26 C30 34 36 40 40 48 L48 46 C46 36 42 26 40 18 Z"/>
<ellipse cx="31" cy="22" rx="9" ry="7" transform="rotate(-20 31 22)"/>
<path d="M24 20 L8 24 L24 27 Z"/>
<path d="M34 16 L36 6 L41 15 Z"/>
</g>
<circle cx="29" cy="20" r="1.6" fill="#1b1f2a"/>
</svg>`;

// outlines, in metres
const TABARD: OutlinePoint[] = [
  [-0.18, 1.42],
  [0.18, 1.42],
  [0.18, 0.55],
  [0, 0.45, "sharp"],
  [-0.18, 0.55],
];
const SHIELD: OutlinePoint[] = [
  [-0.22, 0.42],
  [0.22, 0.42],
  [0.22, 0.12],
  [0, -0.44, "sharp"],
  [-0.22, 0.12],
];
const CAPE: OutlinePoint[] = [
  [0.19, 1.46],
  [0.24, 1.2],
  [0.28, 0.9],
  [0.26, 0.62],
  [0.3, 0.5, "sharp"],
  [0.22, 0.44],
  [0.25, 0.3, "sharp"],
  [0.12, 0.36],
  [0.1, 0.22, "sharp"],
  [0.02, 0.33],
  [-0.04, 0.2, "sharp"],
  [-0.12, 0.34],
  [-0.2, 0.26, "sharp"],
  [-0.24, 0.5],
  [-0.27, 0.85],
  [-0.24, 1.2],
  [-0.19, 1.46],
];

export default function build() {
  const b = createBuilder({ name: "knight" });
  type Bone = ReturnType<typeof b.joint>;
  type Col = Parameters<typeof b.part>[1];

  // ---- paints: scratched and dented steel, gold-etched plate, cloth
  const scratch = grain(STEEL_HI, STEEL, { size: 0.02, axis: "y", seed: 3 });
  const dent = mottle(STEEL_LO, STEEL, { size: 0.05, seed: 5 });
  const steel = paint((p, _n, _s) => (noise(p, 0.12, 9) > 0.6 ? dent : scratch));
  const etched = paint((p, _n, _s) => {
    const w = Math.sin(p.y * 150 + Math.sin(p.x * 55 + p.z * 45) * 2.2);
    return Math.abs(w) < 0.14 ? GOLD : steel;
  });
  const cloth = mottle(BLUE, BLUE_DEEP, { size: 0.2, seed: 6 });
  const surcoat = paint((_p, _n, s) => {
    const x = Math.abs(s[0]);
    const hem = 0.45 + (0.1 * x) / 0.18;
    return x > 0.16 || s[1] > 1.36 || s[1] < hem + 0.03 ? GOLD : cloth;
  });
  const field = mottle(BLUE, BLUE_DEEP, { size: 0.15, seed: 2 });
  const shieldFace = paint((_p, _n, s) => {
    const x = Math.abs(s[0]);
    const y = s[1];
    const half = y > 0.12 ? 0.22 : (0.22 * (y + 0.44)) / 0.56;
    return x > half - 0.025 || y > 0.37 ? GOLD : field;
  });
  const cape = mottle(CRIMSON, CRIMSON_DEEP, { size: 0.25, seed: 12 });
  const griffin = svg(GRIFFIN, { size: 256 });

  // ---- helpers
  const V = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);
  const tube = (bone: Bone, a: number[], c: number[], rA: number, rB: number, color: Col) => {
    const A = V(a);
    const C = V(c);
    return b.part(new THREE.CylinderGeometry(rB, rA, A.distanceTo(C), 8), color, {
      bone,
      at: A.clone().lerp(C, 0.5),
      dir: C.clone().sub(A).normalize(),
    });
  };
  const plate = (bone: Bone, at: number[], dir: THREE.Vector3, w: number, h: number, d: number, color: Col) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, dir });

  // ---- skeleton
  const hips = b.joint("hips", { at: [0, 1.0, 0], aim: [0, 1.25, 0], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 1.25, 0], aim: [0, 1.5, 0], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 1.5, 0], aim: [0, 1.6, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.6, 0], aim: [0, 1.75, 0], role: "head" });

  // ---- torso, fauld and belt
  b.sweep(
    polyline([
      [0, 0.92, 0],
      [0, 1.2, 0],
      [0, 1.48, 0],
    ]),
    (t): [number, number] => [0.15 + 0.035 * Math.sin(Math.PI * t), 0.1 + 0.012 * Math.sin(Math.PI * t)],
    { section: "box", caps: "flat", bone: [hips, chest], color: steel },
  );
  for (const [y, rt, rb] of [
    [0.915, 0.178, 0.19],
    [0.865, 0.19, 0.2],
    [0.815, 0.2, 0.21],
  ] as const) {
    b.part(new THREE.CylinderGeometry(rt, rb, 0.05, 12), etched, { bone: hips, at: [0, y, 0] });
  }
  b.part(new THREE.BoxGeometry(0.4, 0.035, 0.27), LEATHER, { bone: hips, at: [0, 0.955, 0] });
  b.part(new THREE.BoxGeometry(0.05, 0.04, 0.02), GOLD, { bone: hips, at: [0, 0.955, 0.146] });

  // ---- gorget, arming cap
  b.part(new THREE.CylinderGeometry(0.095, 0.13, 0.12, 10), steel, { bone: neck, at: [0, 1.5, 0] });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 10), PAD, { bone: neck, at: [0, 1.585, 0] });

  // ---- great helm
  b.lathe(
    [
      [0, 0],
      [0.14, 0],
      [0.15, 0.03],
      [0.15, 0.24],
      [0.14, 0.29],
      [0.1, 0.315],
      [0, 0.32],
    ],
    { at: [0, 1.6, 0], bone: head, color: steel },
  );
  b.part(new THREE.TorusGeometry(0.148, 0.008, 5, 14), GOLD, {
    bone: head,
    at: [0, 1.62, 0],
    rotation: [90, 0, 0],
  });
  b.part(new THREE.TorusGeometry(0.145, 0.008, 5, 14), GOLD, {
    bone: head,
    at: [0, 1.86, 0],
    rotation: [90, 0, 0],
  });
  // narrow eye slit, with a nasal bar splitting it
  b.part(new THREE.BoxGeometry(0.13, 0.024, 0.04), DARK, { bone: head, at: [0, 1.79, 0.15] });
  b.part(new THREE.BoxGeometry(0.03, 0.27, 0.03), steel, { bone: head, at: [0, 1.72, 0.165] });
  for (const x of [-0.035, 0.035]) {
    for (const y of [1.64, 1.67]) {
      b.part(new THREE.BoxGeometry(0.02, 0.02, 0.02), DARK, { bone: head, at: [x, y, 0.15] });
    }
  }
  // plume socket and tall crimson plume
  b.part(new THREE.CylinderGeometry(0.05, 0.065, 0.04, 10), GOLD, { bone: head, at: [0, 1.93, 0] });
  b.sweep(
    catmull([
      [0, 1.95, 0],
      [0, 2.08, 0.01],
      [0, 2.18, -0.05],
      [0, 2.2, -0.18],
    ]),
    (t): [number, number] => [0.042 * (1 - 0.5 * t) + 0.004, 0.024 * (1 - 0.3 * t)],
    {
      bone: head,
      color: CRIMSON,
      bands: [
        [0.6, CRIMSON],
        [1, CRIMSON_DEEP],
      ],
      caps: { start: "flat", end: "point" },
    },
  );

  // ---- surcoat, with a silver griffin
  const tabard = b.extrude(TABARD, {
    at: [0, 0, 0.118],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    color: surcoat,
    bone: chest,
  });
  b.decal(tabard, griffin, { at: [0, 1.15, 0.124], dir: [0, 0, 1], size: [0.28, 0.28] });

  // ---- torn crimson cape hanging from the shoulders
  b.extrude(CAPE, {
    at: [0, 0, -0.13],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.003,
    color: cape,
    bone: chest,
  });

  // ---- limbs, pauldrons, legs; shield on the left, sword in the right hand
  const SIDES = [
    { k: "L", s: 1, sh: [0.2, 1.42, 0], el: [0.27, 1.16, 0.1], wr: [0.25, 1.04, 0.3] },
    { k: "R", s: -1, sh: [-0.2, 1.42, 0], el: [-0.27, 1.15, 0.06], wr: [-0.3, 0.94, 0.14] },
  ];

  for (const { k, s, sh, el, wr } of SIDES) {
    // arm
    const armChain = b.chain(`arm${k}`, polyline([sh, el, wr]), {
      parent: chest,
      names: [`shoulder${k}`, `elbow${k}`, `wrist${k}`],
      role: "arm",
    });
    const shoulder = armChain.joints[0] as Bone;
    const elbow = armChain.joints[1] as Bone;
    const wrist = armChain.joints[2] as Bone;

    // gold-etched pauldron: domed cap over three stacked lames, with gold rivets
    const sx = 0.2 * s;
    b.lathe(
      [
        [0, 0],
        [0.13, 0],
        [0.135, 0.015],
        [0.13, 0.04],
        [0.11, 0.075],
        [0.07, 0.105],
        [0, 0.115],
      ],
      { at: [sx, 1.425, 0], bone: shoulder, color: etched },
    );
    for (const [y, rt, rb] of [
      [1.4, 0.13, 0.142],
      [1.355, 0.142, 0.152],
      [1.31, 0.152, 0.162],
    ] as const) {
      b.part(new THREE.CylinderGeometry(rt, rb, 0.045, 12), etched, { bone: shoulder, at: [sx, y, 0] });
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.01, 6, 4), GOLD, {
        bone: shoulder,
        at: [sx + Math.cos(a) * 0.128, 1.43, Math.sin(a) * 0.128],
      });
    }

    // arm armour
    tube(shoulder, sh, el, 0.06, 0.05, steel);
    b.part(new THREE.SphereGeometry(0.058, 8, 6), steel, { bone: elbow, at: el });
    tube(elbow, el, wr, 0.05, 0.042, steel);
    const fore = V(wr).sub(V(el)).normalize();
    plate(wrist, wr, fore, 0.085, 0.13, 0.075, steel);

    // leg
    const hip = [0.12 * s, 0.98, 0];
    const knee = [0.12 * s, 0.52, 0.01];
    const ankle = [0.12 * s, 0.12, 0];
    const legChain = b.chain(`leg${k}`, polyline([hip, knee, ankle]), {
      parent: hips,
      names: [`hip${k}`, `knee${k}`, `ankle${k}`],
      role: "leg",
    });
    const hipJ = legChain.joints[0] as Bone;
    const kneeJ = legChain.joints[1] as Bone;
    const ankleJ = legChain.joints[2] as Bone;
    tube(hipJ, hip, knee, 0.092, 0.08, steel);
    tube(kneeJ, knee, ankle, 0.072, 0.058, steel);
    b.part(new THREE.SphereGeometry(0.068, 8, 6), steel, { bone: kneeJ, at: [0.12 * s, 0.52, 0.04] });
    b.part(new THREE.BoxGeometry(0.13, 0.12, 0.32), steel, { bone: ankleJ, at: [0.12 * s, 0.06, 0.08] });
    b.spike([0.12 * s, 0.06, 0.24], [0, 0, 1], 0.05, 0.035, { bone: ankleJ, color: steel });

    if (s > 0) {
      // kite shield on the left arm, with a silver griffin
      const shield = b.extrude(SHIELD, {
        at: [0.26, 0.98, 0.37],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.024,
        bevel: 0.006,
        color: shieldFace,
        bone: wrist,
      });
      b.decal(shield, griffin, { at: [0.26, 1.04, 0.382], dir: [0, 0, 1], size: [0.3, 0.3] });
    } else {
      // broadsword, point down in the right hand
      const d = new THREE.Vector3(0, -1, 0.1).normalize();
      const guard = V([-0.31, 0.9, 0.165]);
      const bladeEnd = guard.clone().addScaledVector(d, 0.8);
      b.frustumBox(guard.clone().addScaledVector(d, 0.03), bladeEnd, [0.056, 0.012], [0.04, 0.008], {
        bone: wrist,
        color: steel,
      });
      b.spike(bladeEnd, d, 0.06, 0.02, { bone: wrist, color: steel });
      b.part(new THREE.BoxGeometry(0.2, 0.026, 0.04), GOLD, { bone: wrist, at: guard });
      tube(wrist, [-0.31, 0.9, 0.165], [-0.31, 1.03, 0.155], 0.018, 0.018, LEATHER);
      b.part(new THREE.SphereGeometry(0.03, 8, 6), GOLD, { bone: wrist, at: [-0.31, 1.045, 0.152] });
    }
  }

  return b.root;
}
```