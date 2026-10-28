import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng, catmull, offset } from "../../../../src/index";

export const meta = {
  "name": "Chibi Axolotl",
  "description": "A chibi axolotl with a huge round head, tiny stubby legs, a finned tail and three frilly pink gill stalks per side."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  skin: "#f4b6c2",
  skinDark: "#e592a7",
  belly: "#ffe3e6",
  back: "#e9a0b4",
  gillRose: "#ff5f8f",
  gillPink: "#ff8fb1",
  gillTip: "#ffc2d6",
  eye: "#1a1220",
  eyeShine: "#ffffff",
  mouth: "#c4566f",
  blush: "#ff8aa3",
  spot: "#c97088",
  fin: "#f7a6bb",
  finEdge: "#ff7ea0",
  toe: "#ffd0da",
  nostril: "#b04a63",
};
const M = {
  headCenter: [0, 0.19, 0.45] as [number, number, number],
  neck: [0, 0.17, 0.28] as [number, number, number],
  gillBaseL: [0.3, 0.26, 0.28] as [number, number, number],
  gillBaseR: [-0.3, 0.26, 0.28] as [number, number, number],
  jawHinge: [0, 0.1, 0.55] as [number, number, number],
  hipBase: [0, 0.15, -0.28] as [number, number, number],
  shoulderL: [0.27, 0.1, 0.18] as [number, number, number],
  shoulderR: [-0.27, 0.1, 0.18] as [number, number, number],
  hipL: [0.24, 0.1, -0.22] as [number, number, number],
  hipR: [-0.24, 0.1, -0.22] as [number, number, number],
  tailRoot: [0, 0.15, -0.35] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // head
  (() => {
function buildHead({ b, J, P, M }: Ctx) {
  const head = J.head, jaw = J.jaw, neck = J.neck;
  const sph = (rx: number, ry: number, rz: number, color: string, at: number[], bone: any, seg = 10) =>
    b.part(new THREE.SphereGeometry(1, seg, Math.max(5, seg - 3)), color, { bone, at, scale: [rx, ry, rz] });

  // neck blend
  sph(0.22, 0.14, 0.14, P.skin, [0, 0.17, 0.3], neck);
  // skull: wide flattened
  sph(0.37, 0.19, 0.24, P.skin, [0, 0.19, 0.45], head, 14);
  // darker crown
  sph(0.3, 0.07, 0.19, P.back, [0, 0.33, 0.43], head, 10);
  // snout / upper jaw
  sph(0.27, 0.09, 0.15, P.belly, [0, 0.13, 0.57], head, 10);
  sph(0.25, 0.06, 0.12, P.skin, [0, 0.17, 0.6], head, 10);

  // lower jaw on jaw joint
  sph(0.25, 0.05, 0.14, P.belly, [0, 0.06, 0.55], jaw, 10);
  // mouth inner strip
  b.part(new THREE.BoxGeometry(0.4, 0.012, 0.1), P.mouth, { bone: jaw, at: [0, 0.1, 0.57] });
  // smile line (curved dots)
  for (let i = -6; i <= 6; i++) {
    const x = i * 0.034;
    const y = 0.115 - 0.02 * (1 - (i / 6) ** 2) * -1 - 0.025 * (i / 6) ** 2 + 0.015;
    const z = 0.655 - 0.1 * (i / 6) ** 2;
    sph(0.014, 0.01, 0.012, P.mouth, [x, y, z], head, 5);
  }
  // nostrils
  for (const s of [1, -1]) sph(0.012, 0.008, 0.01, P.nostril, [s * 0.06, 0.2, 0.7], head, 5);

  // eyes
  for (const s of [1, -1]) {
    sph(0.065, 0.05, 0.035, P.skinDark, [s * 0.2, 0.34, 0.55], head, 8);
    sph(0.05, 0.045, 0.03, P.eye, [s * 0.2, 0.345, 0.575], head, 8);
    sph(0.016, 0.016, 0.01, P.eyeShine, [s * 0.185, 0.365, 0.6], head, 5);
    sph(0.008, 0.008, 0.006, P.eyeShine, [s * 0.215, 0.33, 0.604], head, 4);
    // blush cheeks
    sph(0.07, 0.035, 0.03, P.blush, [s * 0.3, 0.14, 0.52], head, 7);
    // cheek bumps toward gill base
    sph(0.07, 0.09, 0.08, P.skin, [s * 0.31, 0.2, 0.36], head, 8);
  }

  // speckles on the back of the skull
  const r = rng(11);
  for (let i = 0; i < 14; i++) {
    const x = (r() - 0.5) * 0.46, z = 0.32 + r() * 0.2;
    const y = 0.34 + 0.0 - (Math.abs(x) * 0.25) - ((z - 0.45) ** 2) * 0.5 + 0.01;
    sph(0.014 + r() * 0.01, 0.006, 0.014 + r() * 0.01, P.spot, [x, y, z], head, 5);
  }
}
    return buildHead;
  })(),
  // gills
  (() => {
function buildGills({ b, J, P, M }: any) {
  const rand = rng(11);
  const GILL = [P.gillRose, P.gillPink, P.gillTip];
  const defs = [
    { n: "1", dy: 0.6, len: 0.3, rise: 0.15 },
    { n: "2", dy: 0.1, len: 0.25, rise: 0.04 },
    { n: "3", dy: -0.4, len: 0.2, rise: -0.05 },
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const d of defs) {
      const joint = J["gill" + side + d.n];
      const base = new THREE.Vector3(s * 0.3, joint.at.y, 0.28);
      const tip = new THREE.Vector3(s * (0.3 + d.len), base.y + d.rise + 0.07, 0.24 - d.len * 0.25);
      const mid = new THREE.Vector3(s * (0.3 + d.len * 0.55), base.y + d.rise * 0.4 + 0.05, 0.27);
      const path = catmull([base, mid, tip]);
      b.sweep(path, [0.017, 0.007], { bone: joint, color: P.gillRose, sides: 6, caps: "round" });
      b.part(new THREE.SphereGeometry(0.026, 6, 4), P.gillRose, { bone: joint, at: base.toArray() });
      const count = 10;
      for (let i = 0; i < count; i++) {
        const t = 0.1 + (0.9 * i) / (count - 1);
        const p = path.at(t);
        const col = t < 0.35 ? GILL[0] : t < 0.7 ? GILL[1] : GILL[2];
        const len = (0.1 - t * 0.04) * (d.len / 0.3 + 0.4);
        for (const k of [-1, 1]) {
          const ang = k * (0.7 + rand() * 0.3);
          const dir = new THREE.Vector3(s * 0.3, Math.cos(ang) * 0.9 + 0.3, Math.sin(ang) * 1.1).normalize();
          const tp = offset(p, dir, len);
          b.spike(p, tp, null, 0.016 - t * 0.006, { bone: joint, color: col, sides: 5 });
        }
      }
      const e = path.at(1);
      b.part(new THREE.SphereGeometry(0.014, 6, 4), P.gillTip, { bone: joint, at: [e.x, e.y, e.z] });
    }
  }
}
    return buildGills;
  })(),
  // body
  (() => {
function buildBody({ b, J, P, M }: any) {
  const bone = J.body;
  const R = rng(11);

  // Torso loft: z from 0.30 (neck) to -0.36 (tail root), resting on the floor.
  const st = [
    { z: 0.3, w: 0.44, h: 0.26, y: 0.14 },
    { z: 0.18, w: 0.56, h: 0.3, y: 0.16 },
    { z: 0.0, w: 0.58, h: 0.32, y: 0.17 },
    { z: -0.18, w: 0.52, h: 0.3, y: 0.16 },
    { z: -0.36, w: 0.34, h: 0.24, y: 0.14 },
  ];
  b.loft(
    st.map((s) => ({ at: [0, s.y, s.z], w: s.w, h: s.h })),
    { bone, color: P.back }
  );

  // Pale belly: flattened loft underneath, kept inside the floor
  b.loft(
    [
      { at: [0, 0.035, 0.26], w: 0.3, h: 0.07 },
      { at: [0, 0.035, 0.0], w: 0.4, h: 0.07 },
      { at: [0, 0.035, -0.3], w: 0.2, h: 0.07 },
    ],
    { bone, color: P.belly }
  );

  // Dorsal fin crest: extruded outline lying along the top, with edge strip
  const fin: [number, number][] = [];
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    fin.push([0.3 - t * 0.66, 0.0 + 0.045 * Math.sin(t * Math.PI) + 0.012]);
  }
  fin.push([-0.36, -0.03], [0.3, -0.03]);
  b.extrude(fin as any, {
    at: [0, 0.31, 0],
    x: [0, 0, -1],
    thickness: 0.012,
    color: P.fin,
    bone,
  });
  // edge strip beads along the fin crest
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    const z = 0.28 - t * 0.62;
    const hgt = 0.31 + 0.012 + 0.045 * Math.sin(t * Math.PI * 0.97 + 0.05);
    b.part(new THREE.SphereGeometry(0.011, 6, 4), P.finEdge, { bone, at: [0, hgt, z] });
  }

  // Back speckles
  for (let i = 0; i < 40; i++) {
    const z = -0.3 + R() * 0.55;
    const ang = (R() - 0.5) * 2.0; // around the top
    const t = (0.3 - z) / 0.66;
    const wr = 0.29 * (0.7 + 0.3 * Math.sin(Math.min(1, t * 1.2 + 0.1) * Math.PI)) ;
    const hr = 0.15;
    const x = Math.sin(ang) * wr * 0.85;
    const y = 0.17 + Math.cos(ang) * hr * 1.0 + 0.0;
    const r = 0.008 + R() * 0.012;
    b.part(new THREE.SphereGeometry(r, 6, 4), P.spot, {
      bone,
      at: [x, y, z],
      scale: [1, 0.45, 1],
    });
  }

  // Side stripe of light dots, both sides
  for (const s of [1, -1]) {
    for (let i = 0; i < 9; i++) {
      const z = 0.22 - i * 0.063;
      const k = 1 - Math.abs(z + 0.05) * 1.3;
      const x = s * (0.285 * Math.max(0.65, k) + 0.002);
      b.part(new THREE.SphereGeometry(0.011, 6, 4), P.belly, {
        bone,
        at: [x, 0.16, z],
        scale: [0.5, 1, 1],
      });
    }
  }
}
    return buildBody;
  })(),
  // limbs
  (() => {
function buildLimbs({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const legs: [string, number, number][] = [
    ["armL", 1, 1],
    ["armR", -1, 1],
    ["legL", 1, -1],
    ["legR", -1, -1],
  ];
  for (const [name, s, fz] of legs) {
    const root = (name.startsWith("arm") ? (s > 0 ? M.shoulderL : M.shoulderR) : s > 0 ? M.hipL : M.hipR) as number[];
    const joint = J[name];
    // upper segment: from the body side out and down to the floor-resting paw
    const pawX = root[0] + s * 0.2;
    const pawZ = root[2] + fz * 0.07;
    const pawY = 0.045;
    const elbow: number[] = [root[0] + s * 0.1, 0.085, root[2] + fz * 0.03];
    b.capsule(root, elbow, [0.06, 0.05], P.skin, { bone: joint });
    b.capsule(elbow, [pawX, pawY, pawZ], [0.05, 0.042], P.skin, { bone: joint });
    // shadow band at the joint
    b.part(new THREE.SphereGeometry(0.052, 7, 5), P.skinDark, { bone: joint, at: elbow, scale: [1, 0.8, 1] });
    // paw: flat rounded pad
    const paw = b.part(new THREE.SphereGeometry(0.06, 8, 6), P.toe, {
      bone: joint,
      at: [pawX + s * 0.01, 0.036, pawZ],
      scale: [1.1, 0.6, 1.1],
    });
    // four toes fanned out flat
    for (let i = 0; i < 4; i++) {
      const a = (-1.5 + i) * 0.38; // fan angle
      const dx = s * Math.cos(a);
      const dz = Math.sin(a) + fz * 0.15 * (name.startsWith("arm") ? 1 : -1) * 0;
      const base: number[] = [pawX + dx * 0.04, 0.026, pawZ + dz * 0.04];
      const tip: number[] = [pawX + dx * 0.115, 0.02, pawZ + dz * 0.115 + (R() - 0.5) * 0.004];
      b.capsule(base, tip, [0.017, 0.013], P.toe, { bone: joint });
      b.part(new THREE.SphereGeometry(0.0155, 6, 4), P.gillTip, {
        bone: joint,
        at: tip,
        scale: [1, 0.8, 1],
      });
      b.part(new THREE.SphereGeometry(0.006, 5, 3), P.blush, {
        bone: joint,
        at: [tip[0] + dx * 0.008, 0.023, tip[2] + dz * 0.008],
      });
    }
    // little spots on the upper leg
    for (let k = 0; k < 2; k++) {
      b.part(new THREE.SphereGeometry(0.01, 5, 3), P.spot, {
        bone: joint,
        at: [root[0] + s * (0.06 + k * 0.05), 0.1 - k * 0.01, root[2] + fz * 0.02 + (R() - 0.5) * 0.03],
        scale: [1, 0.5, 1],
      });
    }
  }
}
    return buildLimbs;
  })(),
  // tail
  (() => {
function buildTail({ b, J, P, M }: any) {
  const R = rng(11);
  // centreline from tailRoot to tip, lying low, with a gentle sideways curve
  const pts: number[][] = [
    [0, 0.15, -0.33],
    [0.0, 0.14, -0.6],
    [0.03, 0.13, -0.85],
    [0.06, 0.11, -1.08],
    [0.07, 0.09, -1.26],
  ];
  const path = catmull(pts);
  const chain = [J.tail1, J.tail2, J.tail3, J.tail4];
  const rad = (t: number): [number, number] => {
    const k = 1 - t;
    return [0.085 * k + 0.02, 0.1 * k + 0.035];
  };
  const body = b.sweep(path, rad, {
    bone: chain,
    color: P.skin,
    sides: 8,
    caps: "round",
    sectors: [[125, 235, P.belly]],
  });

  // dorsal fin
  const top = body.line(0, 0.0);
  const topUp = body.line(0, 0.1);
  const n = 10;
  const dorsalEdge: number[][] = [];
  const topPts: number[][] = [];
  for (let i = 0; i <= n; i++) {
    const t = 0.02 + (0.9 * i) / n;
    const s = body.at(t, 0);
    const h = 0.12 * (1 - t) + 0.03;
    topPts.push([s.at.x, s.at.y - 0.01, s.at.z]);
    dorsalEdge.push([s.at.x, s.at.y + h, s.at.z]);
  }
  b.membrane(topPts, dorsalEdge, { color: P.fin, thickness: 0.008, bone: chain[1] });
  const edgeStrip = dorsalEdge.map((p) => [p[0], p[1] + 0.008, p[2]]);
  b.membrane(dorsalEdge, edgeStrip, { color: P.finEdge, thickness: 0.01, bone: chain[1] });

  // ventral fin
  const botPts: number[][] = [];
  const botEdge: number[][] = [];
  for (let i = 0; i <= 8; i++) {
    const t = 0.25 + (0.7 * i) / 8;
    const s = body.at(t, 180);
    const h = 0.05 * (1 - t) + 0.015;
    botPts.push([s.at.x, s.at.y + 0.01, s.at.z]);
    botEdge.push([s.at.x, Math.max(0.003, s.at.y - h), s.at.z]);
  }
  b.membrane(botPts, botEdge, { color: P.fin, thickness: 0.007, bone: chain[2] });

  // rib lines: small bars on each side
  for (const sd of [1, -1]) {
    for (let i = 0; i < 9; i++) {
      const t = 0.1 + i * 0.09;
      const s = body.at(t, sd * 90);
      b.stick(new THREE.BoxGeometry(0.004, 0.05 * (1 - t) + 0.015, 0.006), P.skinDark, s, { embed: 0.3 });
    }
  }
  // spots on the back
  for (let i = 0; i < 16; i++) {
    const t = 0.05 + R() * 0.8;
    const ang = (R() - 0.5) * 100;
    const s = body.at(t, ang);
    const r = 0.012 * (1 - t) + 0.006;
    b.stick(new THREE.CylinderGeometry(r, r, 0.006, 6), P.spot, s, { embed: 0.4 });
  }
  // fin spots
  for (let i = 0; i < 6; i++) {
    const t = 0.12 + i * 0.13;
    const s = body.at(t, 0);
    b.part(new THREE.SphereGeometry(0.01, 6, 4), P.spot, {
      bone: chain[Math.min(3, Math.floor(t * 4))],
      at: [s.at.x, s.at.y + 0.05 * (1 - t) + 0.02, s.at.z],
      scale: [0.4, 1, 1],
    });
  }
}
    return buildTail;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "chibiAxolotl" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,0.15,0], dir: [0,0,1], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["body"], at: [0,0.17,0.28], dir: [0,0,1], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,0.19,0.4], dir: [0,0,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,0.1,0.55], dir: [0,0,1], role: "jaw" });
  J["gillL1"] = b.joint("gillL1", { parent: J["head"], at: [0.3,0.26,0.28], dir: [1,0.6,0], role: "fan", group: "gills" });
  J["gillL2"] = b.joint("gillL2", { parent: J["head"], at: [0.3,0.2,0.28], dir: [1,0.1,-0.2], role: "fan", group: "gills" });
  J["gillL3"] = b.joint("gillL3", { parent: J["head"], at: [0.3,0.14,0.28], dir: [1,-0.4,-0.3], role: "fan", group: "gills" });
  J["gillR1"] = b.joint("gillR1", { parent: J["head"], at: [-0.3,0.26,0.28], dir: [-1,0.6,0], role: "fan", group: "gills" });
  J["gillR2"] = b.joint("gillR2", { parent: J["head"], at: [-0.3,0.2,0.28], dir: [-1,0.1,-0.2], role: "fan", group: "gills" });
  J["gillR3"] = b.joint("gillR3", { parent: J["head"], at: [-0.3,0.14,0.28], dir: [-1,-0.4,-0.3], role: "fan", group: "gills" });
  J["armL"] = b.joint("armL", { parent: J["body"], at: [0.27,0.1,0.18], dir: [1,-0.3,0.3], role: "arm", group: "legs" });
  J["armR"] = b.joint("armR", { parent: J["body"], at: [-0.27,0.1,0.18], dir: [-1,-0.3,0.3], role: "arm", group: "legs" });
  J["legL"] = b.joint("legL", { parent: J["body"], at: [0.24,0.1,-0.22], dir: [1,-0.3,-0.3], role: "leg", group: "legs" });
  J["legR"] = b.joint("legR", { parent: J["body"], at: [-0.24,0.1,-0.22], dir: [-1,-0.3,-0.3], role: "leg", group: "legs" });
  J["tail1"] = b.joint("tail1", { parent: J["body"], at: [0,0.15,-0.35], dir: [0,0,-1], role: "tail", group: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,0.15,-0.6], dir: [0,0,-1], role: "tail", group: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,0.14,-0.85], dir: [0,0,-1], role: "tail", group: "tail" });
  J["tail4"] = b.joint("tail4", { parent: J["tail3"], at: [0,0.13,-1.05], dir: [0,0,-1], role: "tail", group: "tail" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
