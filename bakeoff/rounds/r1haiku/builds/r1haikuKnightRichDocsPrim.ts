import * as THREE from "three";
import { createBuilder, mottle, rng, svg } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

const STEEL = "#8b949e";
const STEEL_D = "#4b535c";
const GOLD = "#c9a13b";
const CRIMSON = "#8e1b2a";
const CRIMSON_D = "#4a0c15";
const BLUE = "#1f3d7a";
const BLUE_D = "#15295a";
const LEATHER = "#5a3b25";
const EYE = "#0b0b0d";
const BLADE = "#c9d1da";

const GRIFFIN = `<g fill="#dfe4ea" stroke="#3a424c" stroke-width="1.1" stroke-linejoin="round">
<path d="M17 34 C4 16 1 30 7 46 C10 40 14 39 17 43 Z"/>
<path d="M17 34 C30 16 33 30 27 46 C24 40 20 39 17 43 Z"/>
<path d="M13 30 L17 36 L21 30 Z"/>
<ellipse cx="17" cy="42" rx="6" ry="10"/>
<path d="M12 50 L9 65 L13 63 L17 67 L21 63 L25 65 L22 50 Z"/>
<circle cx="11" cy="23" r="5.5"/>
<path d="M6 21 L0.5 24.5 L6 26.5 Z"/>
<path d="M14 18 L13 11 L17 17 Z"/>
</g>
<circle cx="9.5" cy="22" r="1" fill="#15191e"/>`;

const shieldTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 70">
<path d="M0 0H34V28L17 70L0 28Z" fill="${BLUE}"/>${GRIFFIN}</svg>`,
  { size: 256 },
);

const tabardTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 70">
<rect width="34" height="70" fill="${BLUE}"/>${GRIFFIN}</svg>`,
  { size: 256 },
);

const filigreeTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" fill="#7d8791"/>
<g fill="none" stroke="#e8c15a" stroke-width="2.4" stroke-linecap="round">
<path d="M6 60C6 34 24 30 32 14C40 30 58 34 58 60"/>
<path d="M14 46C18 30 28 28 32 34C36 28 46 30 50 46"/>
<path d="M4 16C10 10 16 12 18 20"/>
<path d="M60 16C54 10 48 12 46 20"/>
</g>
<circle cx="32" cy="10" r="3" fill="#e8c15a"/>
</svg>`,
  { size: 128 },
);

// Paints: battle wear and worn cloth
const armour = mottle(STEEL, "#5d6670", { size: 0.2, contrast: 0.6, seed: 4 });
const bladePaint = mottle(BLADE, "#6f7985", { size: 0.05, seed: 9 });
const capePaint = mottle(CRIMSON, CRIMSON_D, { size: 0.25, seed: 2 });
const surcoatPaint = mottle(BLUE, BLUE_D, { size: 0.3, contrast: 0.5, seed: 6 });

export const meta = {
  name: "Battle-worn knight",
  description: "A plate-armoured knight with a crimson-plumed great helm, blue surcoat, griffin shield and broadsword.",
};

export default function build() {
  const b = createBuilder({ name: "knight" });

  type V3 = [number, number, number];
  type Col = Parameters<typeof b.part>[1];
  type Bone = ReturnType<typeof b.joint>;
  type Extra = Partial<NonNullable<Parameters<typeof b.part>[2]>>;

  const put = (geo: THREE.BufferGeometry, color: Col, bone: Bone, at: V3, o: Extra = {}) =>
    b.part(geo, color, { bone, at, ...o });

  // A cylinder stretched from a to c, with radius ra at a and rc at c
  const tube = (a: V3, c: V3, ra: number, rc: number, color: Col, bone: Bone, sides = 8) => {
    const d: V3 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    const m: V3 = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
    return put(new THREE.CylinderGeometry(rc, ra, len, sides), color, bone, m, {
      dir: [d[0] / len, d[1] / len, d[2] / len],
    });
  };

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.98, 0] });
  const spine = b.joint("spine", { parent: hips, at: [0, 1.1, 0], aim: [0, 1.36, 0], role: "spine" });
  const neck = b.joint("neck", { parent: spine, at: [0, 1.36, 0], aim: [0, 1.56, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.58, 0], aim: [0, 1.9, 0], role: "head" });

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // Arms and legs as rigged chains (the last name is the hand or foot tip)
    const arm = b.chain(
      `arm${L}`,
      [
        [s * 0.24, 1.36, 0],
        [s * 0.3, 1.1, 0.04],
        [s * 0.32, 0.86, 0.1],
      ],
      { parent: spine, names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`], role: "arm" },
    );
    const leg = b.chain(
      `leg${L}`,
      [
        [s * 0.12, 0.98, 0],
        [s * 0.13, 0.55, 0.02],
        [s * 0.13, 0.1, 0],
      ],
      { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg" },
    );
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const wrist = arm.joints[2];
    const hip = leg.joints[0];
    const knee = leg.joints[1];
    const ankle = leg.joints[2];

    const sh: V3 = [s * 0.24, 1.36, 0];
    const el: V3 = [s * 0.3, 1.1, 0.04];
    const wr: V3 = [s * 0.32, 0.86, 0.1];
    const hp: V3 = [s * 0.12, 0.98, 0];
    const kn: V3 = [s * 0.13, 0.55, 0.02];
    const an: V3 = [s * 0.13, 0.1, 0];

    // Layered shoulder: etched dome, lames and a gold rim
    put(new THREE.SphereGeometry(0.15, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, spine, [s * 0.25, 1.36, 0], {
      texture: filigreeTex,
    });
    put(new THREE.CylinderGeometry(0.155, 0.165, 0.05, 10), armour, spine, [s * 0.26, 1.31, 0]);
    put(new THREE.CylinderGeometry(0.165, 0.175, 0.05, 10), STEEL_D, spine, [s * 0.26, 1.27, 0]);
    put(new THREE.TorusGeometry(0.152, 0.008, 4, 14), GOLD, spine, [s * 0.25, 1.36, 0], { rotation: [90, 0, 0] });

    // Arm
    tube(sh, el, 0.07, 0.06, armour, shoulder);
    put(new THREE.SphereGeometry(0.068, 8, 6), armour, elbow, el);
    tube(el, wr, 0.058, 0.05, armour, elbow);
    put(new THREE.BoxGeometry(0.1, 0.12, 0.09), armour, wrist, [s * 0.32, 0.84, 0.1]);

    // Leg
    tube(hp, kn, 0.075, 0.066, armour, hip);
    put(new THREE.SphereGeometry(0.072, 8, 6), armour, knee, kn);
    tube(kn, an, 0.068, 0.058, armour, knee);
    put(new THREE.BoxGeometry(0.13, 0.1, 0.28), STEEL_D, ankle, [s * 0.13, 0.05, 0.07]);

    if (s > 0) {
      // Kite shield on the left arm, with the same griffin as the surcoat
      const kite: OutlinePoint[] = [
        [-0.17, 0.28],
        [0.17, 0.28],
        [0.17, 0],
        [0, -0.42, "sharp"],
        [-0.17, 0],
      ];
      b.extrude(kite, {
        at: [0.38, 0.92, 0.18],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.03,
        bevel: 0.006,
        smoothing: 0,
        color: armour,
        bone: wrist,
      });
      b.part(new THREE.PlaneGeometry(0.34, 0.7), BLUE, wrist, [0.38, 0.85, 0.2], {
        dir: [0, 0, 1],
        axis: "z",
        texture: shieldTex,
      });
      put(new THREE.SphereGeometry(0.055, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, wrist, [0.38, 0.92, 0.2], {
        dir: [0, 0, 1],
      });
    } else {
      // Broadsword planted point-down at the right hand
      put(new THREE.SphereGeometry(0.032, 8, 6), GOLD, wrist, [-0.34, 0.94, 0.12]);
      put(new THREE.CylinderGeometry(0.018, 0.018, 0.13, 8), LEATHER, wrist, [-0.34, 0.86, 0.12]);
      put(new THREE.BoxGeometry(0.035, 0.03, 0.2), GOLD, wrist, [-0.34, 0.78, 0.12]);
      const blade: OutlinePoint[] = [
        [-0.035, 0],
        [0.035, 0],
        [0.035, -0.66],
        [0, -0.76, "sharp"],
        [-0.035, -0.66],
      ];
      b.extrude(blade, {
        at: [-0.34, 0.78, 0.12],
        x: [0, 0, 1],
        thickness: [0.004, 0.012],
        bevel: 0.002,
        smoothing: 0,
        color: bladePaint,
        bone: wrist,
      });
    }
  }

  // Torso: blue surcoat, leather belt, steel gorget
  const tunicProfile: OutlinePoint[] = [
    [0, 0.5],
    [0.3, 0.5],
    [0.27, 0.7],
    [0.24, 0.95],
    [0.26, 1.2],
    [0.2, 1.32],
    [0, 1.32],
  ];
  const tunic = b.lathe(tunicProfile, { at: [0, 0, 0], bone: hips, color: surcoatPaint, smoothing: 1 });

  // Griffin on the surcoat, projected onto the curved cloth
  b.decal(tunic, tabardTex, { at: [0, 1.08, 0.25], dir: [0, 0, 1], size: [0.22, 0.45] });

  put(new THREE.CylinderGeometry(0.275, 0.275, 0.07, 12), LEATHER, hips, [0, 0.92, 0]);
  put(new THREE.BoxGeometry(0.07, 0.06, 0.03), GOLD, hips, [0, 0.92, 0.285]);
  put(new THREE.CylinderGeometry(0.13, 0.15, 0.1, 10), armour, spine, [0, 1.38, 0]);

  // Great helm: bucket dome, narrow eye slit, dents, gold rim
  const helmProfile: OutlinePoint[] = [
    [0, 0],
    [0.14, 0],
    [0.15, 0.05],
    [0.15, 0.22],
    [0.12, 0.31],
    [0.05, 0.345],
    [0, 0.35],
  ];
  const helm = b.lathe(helmProfile, { at: [0, 1.5, 0], bone: head, color: armour, smoothing: 1 });

  for (const h of b.surface(helm).scatter(9, { rng: rng(5), minDist: 0.05, filter: (q) => q.n.z > -0.3 })) {
    b.stick(new THREE.SphereGeometry(0.012, 5, 4), STEEL_D, h, { embed: 0.5 });
  }

  put(new THREE.BoxGeometry(0.2, 0.17, 0.04), armour, head, [0, 1.64, 0.14]);
  put(new THREE.BoxGeometry(0.16, 0.025, 0.02), EYE, head, [0, 1.67, 0.165]);
  put(new THREE.BoxGeometry(0.03, 0.09, 0.03), armour, head, [0, 1.6, 0.165]);
  put(new THREE.BoxGeometry(0.02, 0.02, 0.01), EYE, head, [-0.05, 1.58, 0.165]);
  put(new THREE.BoxGeometry(0.02, 0.02, 0.01), EYE, head, [0.05, 1.58, 0.165]);
  put(new THREE.TorusGeometry(0.152, 0.009, 4, 14), GOLD, head, [0, 1.52, 0], { rotation: [90, 0, 0] });

  // Tall crimson plume sweeping back from the crown
  const plume: OutlinePoint[] = [
    [0.07, 0],
    [0.05, 0.2],
    [0, 0.36],
    [-0.12, 0.44, "sharp"],
    [-0.1, 0.3],
    [-0.16, 0.22, "sharp"],
    [-0.11, 0.1],
    [-0.09, 0],
  ];
  b.extrude(plume, {
    at: [0, 1.84, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.035,
    bevel: 0.004,
    smoothing: 1,
    color: CRIMSON,
    bone: head,
  });

  // Torn crimson cape hanging from the shoulders
  const cape: OutlinePoint[] = [
    [-0.27, 0.12],
    [0.27, 0.12],
    [0.3, -0.2],
    [0.3, -0.55],
    [0.34, -0.8],
    [0.24, -0.72, "sharp"],
    [0.2, -0.98, "sharp"],
    [0.1, -0.82],
    [0.04, -1.02, "sharp"],
    [-0.05, -0.86],
    [-0.12, -0.97, "sharp"],
    [-0.2, -0.8],
    [-0.3, -0.9, "sharp"],
    [-0.3, -0.5],
    [-0.27, -0.2],
  ];
  b.extrude(cape, {
    at: [0, 1.3, -0.27],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.014,
    bevel: 0.002,
    smoothing: 0,
    color: capePaint,
    bone: spine,
  });

  return b.root;
}
