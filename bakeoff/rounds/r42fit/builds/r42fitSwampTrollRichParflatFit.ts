import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng, catmull } from "../../../../src/index";

export const meta = {
  "name": "Swamp Troll",
  "description": "A hunched, long-armed Warcraft-style swamp troll with curved tusks, a tall red mohawk, mossy teal skin and bone fetishes hanging from a hide loincloth and belt."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  skin: "#3f8f8a",
  skinDark: "#2b6068",
  skinLight: "#7ac2b0",
  belly: "#a9d3a0",
  moss: "#5f8a2e",
  mohawk: "#c72f2a",
  mohawkTip: "#ff7a2a",
  bone: "#e8dcb8",
  boneShade: "#b9a77c",
  tusk: "#f2e8c4",
  hide: "#6b4428",
  hideDark: "#432a18",
  leather: "#2e1e14",
  eye: "#ffd23a",
  pupil: "#1a0a0a",
  gum: "#8a2f4a",
  claw: "#2a2a22",
  feather: "#2f9ad6",
  bead: "#e0a82a",
  rune: "#7af2c8",
};
const M = {
  pelvis: [0, 1, 0] as [number, number, number],
  waist: [0, 1.3, 0.08] as [number, number, number],
  neckBase: [0, 2.05, 0.3] as [number, number, number],
  headCenter: [0, 2.3, 0.5] as [number, number, number],
  jawHinge: [0, 2.18, 0.45] as [number, number, number],
  shoulderL: [0.5, 2, 0.2] as [number, number, number],
  shoulderR: [-0.5, 2, 0.2] as [number, number, number],
  hipL: [0.25, 1, 0] as [number, number, number],
  hipR: [-0.25, 1, 0] as [number, number, number],
  handL: [0.78, 0.62, 0.3] as [number, number, number],
  handR: [-0.78, 0.62, 0.3] as [number, number, number],
  footL: [0.3, 0.1, 0.15] as [number, number, number],
  footR: [-0.3, 0.1, 0.15] as [number, number, number],
  belt: [0, 1.15, 0.05] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // torso
  (() => {
function buildTorso({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const stations = [
    { at: [0, 1.08, 0.0], w: 0.62, h: 0.4 },
    { at: [0, 1.3, 0.08], w: 0.7, h: 0.5 },
    { at: [0, 1.65, 0.2], w: 1.1, h: 0.6 },
    { at: [0, 1.92, 0.26], w: 1.3, h: 0.5 },
  ];
  const body = b.loft(stations as any, { bone: [J.pelvis, J.spine1, J.spine2], color: P.skin, sides: 10, caps: "flat" } as any);

  // pale belly panel
  b.part(new THREE.SphereGeometry(1, 10, 8), P.belly, { bone: J.spine1, at: [0, 1.42, 0.33], scale: [0.3, 0.5, 0.16] });
  // abs bumps
  for (let i = 0; i < 3; i++)
    for (const s of [1, -1])
      b.part(new THREE.SphereGeometry(0.07, 6, 4), P.belly, { bone: J.spine1, at: [s * 0.1, 1.2 + i * 0.16, 0.45 - i * 0.02], scale: [1.2, 0.8, 0.7] });
  // ribs
  for (let i = 0; i < 3; i++)
    for (const s of [1, -1])
      b.part(new THREE.CapsuleGeometry(0.018, 0.2, 3, 6), P.skinDark, {
        bone: J.spine2, at: [s * 0.3, 1.72 + i * 0.1, 0.48 - i * 0.02], rotation: [0, 0, s * 80],
      });
  // hunch hump
  b.part(new THREE.SphereGeometry(1, 10, 8), P.skin, { bone: J.spine2, at: [0, 2.0, -0.1], scale: [0.45, 0.32, 0.35] });
  b.part(new THREE.SphereGeometry(1, 8, 6), P.moss, { bone: J.spine2, at: [0, 2.15, -0.14], scale: [0.34, 0.12, 0.26] });
  // spine knobs
  for (let i = 0; i < 7; i++) {
    const y = 1.1 + i * 0.16;
    const z = -0.2 + Math.min(i, 5) * 0.03 - (i > 3 ? 0.12 : 0);
    b.part(new THREE.ConeGeometry(0.045, 0.1, 6), P.skinDark, {
      bone: i < 2 ? J.pelvis : i < 4 ? J.spine1 : J.spine2, at: [0, y + 0.1, z - 0.05 + (i > 4 ? -0.1 : 0)], rotation: [-120, 0, 0],
    });
  }
  // moss patches on back
  for (let i = 0; i < 5; i++)
    b.part(new THREE.SphereGeometry(1, 6, 4), P.moss, {
      bone: J.spine2, at: [(R() - 0.5) * 0.9, 1.75 + R() * 0.3, -0.22 - R() * 0.05], scale: [0.1 + R() * 0.08, 0.07, 0.03],
    });
  // shoulder pads
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 8), P.skin, { bone: J.spine2, at: [s * 0.62, 2.02, 0.2], scale: [0.26, 0.2, 0.26] });
    b.part(new THREE.SphereGeometry(1, 8, 6), P.moss, { bone: J.spine2, at: [s * 0.62, 2.16, 0.18], scale: [0.2, 0.08, 0.2] });
    for (let k = 0; k < 3; k++)
      b.part(new THREE.ConeGeometry(0.03, 0.12, 5), P.moss, { bone: J.spine2, at: [s * (0.55 + k * 0.07), 2.24, 0.12 + k * 0.05], rotation: [0, 0, -s * 15] });
  }
  // bandolier: right shoulder (-x) to left hip (+x)
  const a = [-0.5, 2.14, 0.3], c = [0.4, 1.12, 0.42];
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = a[0] + (c[0] - a[0]) * t, y = a[1] + (c[1] - a[1]) * t;
    const z = 0.36 + 0.2 * Math.sin(Math.PI * t) + 0.1 * (1 - t);
    b.part(new THREE.BoxGeometry(0.15, 0.1, 0.05), P.leather, {
      bone: t < 0.5 ? J.spine2 : J.spine1, at: [x, y, z + 0.0], rotation: [0, 0, -42],
    });
    if (i % 2 === 1)
      b.part(new THREE.SphereGeometry(0.035, 6, 4), i % 4 === 1 ? P.bead : P.bone, {
        bone: t < 0.5 ? J.spine2 : J.spine1, at: [x, y, z + 0.05],
      });
  }
}
    return buildTorso;
  })(),
  // head
  (() => {
function buildHead({ b, J, P, M }: Ctx) {
  const head = J.head, jaw = J.jaw, neck = J.neck;
  const R = rng(5);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const put = (g: THREE.BufferGeometry, c: string, bone: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone, at, ...o });

  // neck
  b.capsule([0, 2.05, 0.28], [0, 2.22, 0.45], 0.2, P.skin, { bone: neck });
  put(sph(0.2), P.skinDark, neck, [0, 2.12, 0.2], { scale: [1.2, 1, 1] });

  // skull
  put(sph(0.3, 10, 8), P.skin, head, [0, 2.38, 0.5], { scale: [1.05, 0.95, 1.1] });
  // brow ridge
  put(new THREE.BoxGeometry(0.6, 0.09, 0.14), P.skinDark, head, [0, 2.46, 0.76], { rotation: [-10, 0, 0] });
  // cheeks and snout
  for (const s of [1, -1]) put(sph(0.12), P.skinLight, head, [s * 0.2, 2.3, 0.72], { scale: [1, 0.8, 1] });
  put(new THREE.BoxGeometry(0.34, 0.16, 0.24), P.skin, head, [0, 2.3, 0.82]);
  // nose
  put(new THREE.BoxGeometry(0.24, 0.1, 0.1), P.skinDark, head, [0, 2.34, 0.96]);
  for (const s of [1, -1]) put(sph(0.025, 6, 4), P.pupil, head, [s * 0.06, 2.34, 1.01]);

  // eyes and brows
  for (const s of [1, -1]) {
    put(sph(0.06, 8, 6), P.eye, head, [s * 0.19, 2.42, 0.8]);
    put(sph(0.028, 6, 4), P.pupil, head, [s * 0.19, 2.42, 0.855], { scale: [0.7, 1.3, 0.6] });
    put(new THREE.BoxGeometry(0.2, 0.05, 0.08), P.leather, head, [s * 0.19, 2.51, 0.81], { rotation: [0, 0, s * -18] });
    // war paint
    for (let i = 0; i < 2; i++)
      put(new THREE.BoxGeometry(0.03, 0.1, 0.01), P.rune, head, [s * (0.27 + i * 0.04), 2.28 - i * 0.02, 0.76 - i * 0.04], { rotation: [0, s * -50, s * 15] });
    // ears
    b.spike([s * 0.3, 2.45, 0.45], [s * 0.5, 0.35, -0.3], 0.5, 0.07, { color: P.skin, bone: head });
    put(new THREE.TorusGeometry(0.04, 0.01, 5, 8), P.bead, head, [s * 0.4, 2.42, 0.38], { rotation: [0, 90, 0] });
    put(sph(0.03, 6, 4), P.bone, head, [s * 0.4, 2.37, 0.38]);
    // warts
    put(sph(0.02, 5, 4), P.skinLight, head, [s * 0.1, 2.58, 0.7]);
  }

  // mohawk blades
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const z = 0.78 - t * 0.6, y = 2.5 + Math.sin(t * Math.PI) * 0.04 - t * 0.06;
    const h = 0.1 + Math.sin(t * Math.PI) * 0.05 + R() * 0.01;
    put(new THREE.BoxGeometry(0.05, h, 0.14), P.mohawk, head, [0, y + h / 2, z], { rotation: [-25 + t * 40, 0, 0] });
    put(new THREE.ConeGeometry(0.04, h * 0.6, 4), P.mohawkTip, head, [0, y + h + 0.02, z - 0.02], { rotation: [-25 + t * 40, 0, 0] });
  }

  // jaw
  put(new THREE.BoxGeometry(0.4, 0.1, 0.34), P.skin, jaw, [0, 2.17, 0.8]);
  put(new THREE.BoxGeometry(0.3, 0.1, 0.1), P.skinDark, jaw, [0, 2.15, 0.99]);
  put(new THREE.BoxGeometry(0.34, 0.03, 0.26), P.gum, jaw, [0, 2.23, 0.8]);
  put(new THREE.BoxGeometry(0.12, 0.08, 0.1), P.skin, jaw, [0, 2.14, 0.6]);
  for (const s of [1, -1]) {
    b.spike([s * 0.16, 2.2, 0.95], [0, 1, 0.15], 0.3, 0.05, { color: P.tusk, bone: jaw });
    for (let i = 0; i < 3; i++)
      put(new THREE.ConeGeometry(0.014, 0.04, 4), P.bone, jaw, [s * (0.05 + i * 0.045), 2.25, 0.96 - i * 0.02]);
  }
  // upper teeth
  for (let i = -2; i <= 2; i++)
    put(new THREE.ConeGeometry(0.014, 0.05, 4), P.bone, head, [i * 0.05, 2.24, 0.93], { rotation: [180, 0, 0] });
}
    return buildHead;
  })(),
  // arms
  (() => {
function buildArms({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = J["shoulder" + side], el = J["elbow" + side], wr = J["wrist" + side];
    const S: [number, number, number] = [0.5 * s, 2.0, 0.2];
    const E: [number, number, number] = [0.8 * s, 1.45, 0.2];
    const W: [number, number, number] = [0.85 * s, 0.85, 0.3];

    // upper arm and forearm tubes
    b.sweep(catmull([S, [0.66 * s, 1.75, 0.2], E]), [0.17, 0.13], { bone: [sh, el], color: P.skin });
    b.sweep(catmull([E, [0.83 * s, 1.15, 0.25], W]), [0.13, 0.1], { bone: [el, wr], color: P.skin });
    // shoulder bulge, elbow, forearm
    b.part(sph(0.24), P.skin, { bone: sh, at: [0.52 * s, 2.0, 0.2] });
    b.part(sph(0.16), P.skinDark, { bone: sh, at: [0.62 * s, 1.72, 0.12], scale: [1, 1.4, 1] });
    b.part(sph(0.15), P.skinDark, { bone: el, at: [0.81 * s, 1.43, 0.14] });
    b.part(sph(0.12), P.skinLight, { bone: el, at: [0.86 * s, 1.2, 0.3], scale: [1, 1.6, 1] });

    // moss tufts at the shoulder
    for (let i = 0; i < 5; i++) {
      const a = R() * 6.28;
      b.part(new THREE.ConeGeometry(0.04, 0.14, 5), P.moss, {
        bone: sh,
        at: [(0.52 + Math.cos(a) * 0.12) * s, 2.2 - R() * 0.05, 0.2 + Math.sin(a) * 0.12],
        rotation: [Math.sin(a) * 25, 0, -Math.cos(a) * 25],
      });
    }

    // leather wrist wrap and bone bracer
    b.part(new THREE.CylinderGeometry(0.125, 0.115, 0.14, 8), P.leather, { bone: wr, at: [0.85 * s, 0.93, 0.28] });
    b.part(new THREE.CylinderGeometry(0.14, 0.13, 0.05, 8), P.bone, { bone: el, at: [0.84 * s, 1.1, 0.26] });
    b.part(new THREE.CylinderGeometry(0.14, 0.13, 0.05, 8), P.boneShade, { bone: el, at: [0.84 * s, 1.0, 0.27] });
    // ring charm on cord
    b.part(new THREE.TorusGeometry(0.04, 0.012, 5, 8), P.bone, {
      bone: wr, at: [0.97 * s, 0.84, 0.28], rotation: [0, 90, 0],
    });
    b.part(sph(0.02, 5, 4), P.bone, { bone: wr, at: [0.95 * s, 0.9, 0.28] });

    // hand: palm, knuckles, fingers, thumb
    b.part(new THREE.BoxGeometry(0.24, 0.2, 0.12), P.skin, { bone: wr, at: [0.85 * s, 0.74, 0.32] });
    b.part(new THREE.BoxGeometry(0.22, 0.05, 0.05), P.skinDark, { bone: wr, at: [0.85 * s, 0.82, 0.38] });
    for (let i = 0; i < 4; i++) {
      const x = (0.85 + (i - 1.5) * 0.07) * s;
      const sp = (i - 1.5) * 0.1 * s;
      const tip: [number, number, number] = [x + sp * 0.5, 0.45, 0.36 + (i === 1 || i === 2 ? 0.02 : 0)];
      b.part(sph(0.032, 6, 4), P.skinLight, { bone: wr, at: [x, 0.66, 0.38] });
      b.rod([x, 0.66, 0.34], tip, [0.032, 0.025], P.skin, { bone: wr });
      b.spike(tip, [0, -1, 0.35], 0.09, 0.026, { color: P.claw, bone: wr });
    }
    // thumb
    const t0: [number, number, number] = [0.85 * s - 0.12 * s, 0.72, 0.36];
    const t1: [number, number, number] = [0.85 * s - 0.2 * s, 0.6, 0.42];
    b.rod(t0, t1, [0.035, 0.028], P.skin, { bone: wr });
    b.spike(t1, [-s, -0.8, 0.5], 0.08, 0.026, { color: P.claw, bone: wr });
  }
}
    return buildArms;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P, M }: any) {
  const R = rng(5);
  const sides: [string, number][] = [["L", 1], ["R", -1]];
  for (const [n, s] of sides) {
    const hip = J["hip" + n], knee = J["knee" + n], ankle = J["ankle" + n];
    const hp: number[] = [s * 0.25, 1.0, 0];
    const kp: number[] = [s * 0.3, 0.6, 0.2];
    const ap: number[] = [s * 0.3, 0.2, 0.05];
    // thigh
    b.capsule(hp, kp, [0.19, 0.15], P.skin, { bone: hip });
    b.capsule(kp, ap, [0.14, 0.09], P.skin, { bone: knee });
    // thigh shading outer
    b.capsule([s * 0.33, 0.97, 0], [s * 0.36, 0.64, 0.2], 0.07, P.skinDark, { bone: hip });
    // knee bump
    b.part(new THREE.SphereGeometry(0.15, 8, 6), P.skin, { bone: knee, at: [s * 0.3, 0.6, 0.3] });
    b.part(new THREE.SphereGeometry(0.09, 7, 5), P.moss, { bone: knee, at: [s * 0.3, 0.66, 0.37], scale: [1.3, 0.7, 0.8] });
    for (let i = 0; i < 3; i++)
      b.part(new THREE.SphereGeometry(0.04, 6, 4), P.moss, { bone: knee, at: [s * (0.22 + i * 0.07), 0.7, 0.3 + R() * 0.05] });
    // calf bulge back
    b.part(new THREE.SphereGeometry(0.12, 8, 6), P.skinDark, { bone: knee, at: [s * 0.3, 0.45, 0.0], scale: [0.9, 1.2, 0.9] });
    // ankle strap + bead
    b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.06, 8), P.leather, { bone: ankle, at: [s * 0.3, 0.27, 0.06] });
    b.part(new THREE.SphereGeometry(0.035, 6, 5), P.bone, { bone: ankle, at: [s * 0.3, 0.25, 0.18] });
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.08, 5), P.bone, { bone: ankle, at: [s * 0.3, 0.2, 0.19] });
    // foot
    b.part(new THREE.BoxGeometry(0.32, 0.1, 0.42), P.skin, { bone: ankle, at: [s * 0.3, 0.07, 0.17] });
    b.part(new THREE.BoxGeometry(0.34, 0.04, 0.4), P.hideDark, { bone: ankle, at: [s * 0.3, 0.02, 0.17] });
    b.part(new THREE.BoxGeometry(0.2, 0.12, 0.2), P.skin, { bone: ankle, at: [s * 0.3, 0.14, 0.05] });
    // heel
    b.part(new THREE.SphereGeometry(0.09, 7, 5), P.skinDark, { bone: ankle, at: [s * 0.3, 0.1, -0.06] });
    // toes (3)
    for (let i = -1; i <= 1; i++) {
      const x = s * 0.3 + i * 0.11;
      const z = 0.4 + (i === 0 ? 0.06 : 0);
      b.capsule([x, 0.07, 0.3], [x, 0.065, z], 0.055, P.skin, { bone: ankle });
      b.spike([x, 0.065, z + 0.04], [0, -0.1, 1], 0.12, 0.04, P.claw, { bone: ankle });
      b.part(new THREE.SphereGeometry(0.03, 5, 4), P.skinDark, { bone: ankle, at: [x, 0.12, 0.33] });
    }
    // mud stains
    b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.08, 8), P.hideDark, { bone: ankle, at: [s * 0.3, 0.18, 0.05] });
    for (let i = 0; i < 4; i++)
      b.part(new THREE.SphereGeometry(0.03 + R() * 0.02, 5, 4), P.hideDark, { bone: knee, at: [s * (0.22 + R() * 0.16), 0.3 + R() * 0.1, 0.12 + R() * 0.1] });
  }
}
    return buildLegs;
  })(),
  // fetishes
  (() => {
function buildFetishes({ b, J, P, M }: any) {
  const R = rng(11);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], bone: any, o: any = {}) =>
    b.part(g, c, { at, bone, ...o });
  const cord = (a: number[], c: number[], r: number, col: string, bone: any) =>
    b.rod(a, c, r, col, { bone });

  // belt
  const belt = M.belt;
  put(new THREE.CylinderGeometry(0.5, 0.52, 0.12, 12), P.leather, [0, belt[1], belt[2]], J.pelvis);
  put(new THREE.CylinderGeometry(0.505, 0.525, 0.02, 12), P.hideDark, [0, belt[1] + 0.05, belt[2]], J.pelvis);
  // buckle: small skull
  const bz = belt[2] + 0.5;
  put(box(0.2, 0.17, 0.04), P.boneShade, [0, belt[1], bz], J.pelvis);
  put(sph(0.075, 8, 6), P.bone, [0, belt[1] + 0.01, bz + 0.03], J.pelvis);
  put(box(0.07, 0.04, 0.05), P.bone, [0, belt[1] - 0.06, bz + 0.03], J.pelvis);
  for (const s of [1, -1]) {
    put(sph(0.022, 6, 4), P.pupil, [s * 0.03, belt[1] + 0.02, bz + 0.09], J.pelvis);
  }

  // loincloth flaps
  const flap = (z: number, ang: number, len: number, bone: any) => {
    const outline: any[] = [[-0.22, 0], [0.22, 0], [0.2, -len * 0.7]];
    const teeth = 5;
    for (let i = 0; i <= teeth; i++) {
      const x = 0.2 - (0.4 * i) / teeth;
      outline.push([x, -len + (i % 2 ? 0.07 : 0), "sharp"]);
    }
    outline.push([-0.2, -len * 0.7]);
    const f = b.extrude(outline, { at: [0, belt[1] - 0.06, z], x: [1, 0, 0], y: [0, 1, ang], thickness: 0.03, color: P.hide, bone: J.pelvis });
    b.extrude([[-0.22, -0.02], [0.22, -0.02], [0.21, -0.07], [-0.21, -0.07]], { at: [0, belt[1] - 0.06, z + 0.016 * Math.sign(z - belt[2] || 1)], x: [1, 0, 0], y: [0, 1, ang], thickness: 0.02, color: P.hideDark, bone: J.pelvis });
    // runes
    const sg = Math.sign(z - belt[2]) || 1;
    for (let i = 0; i < 3; i++) {
      put(box(0.025, 0.1, 0.01), P.rune, [(i - 1) * 0.08, belt[1] - 0.22 - (i % 2) * 0.04, z + sg * 0.025], J.pelvis);
    }
    put(box(0.2, 0.025, 0.01), P.rune, [0, belt[1] - 0.2, z + sg * 0.025], J.pelvis);
    return f;
  };
  flap(belt[2] + 0.5, 0.15, 0.5, J.pelvis);
  flap(belt[2] - 0.5, -0.15, 0.45, J.pelvis);

  // dangling teeth and beads on belt
  for (let i = 0; i < 9; i++) {
    const a = -1.3 + i * 0.33;
    const x = Math.sin(a) * 0.52, z = belt[2] + Math.cos(a) * 0.52;
    if (Math.abs(x) < 0.12 && z > belt[2]) continue;
    cord([x, belt[1] - 0.05, z], [x, belt[1] - 0.2, z], 0.006, P.leather, J.pelvis);
    put(new THREE.ConeGeometry(0.025, 0.09, 5), P.bone, [x, belt[1] - 0.26, z], J.pelvis, { rotation: [180, 0, 0] });
  }
  // rib charms
  for (const s of [1, -1]) {
    const x = s * 0.4, z = belt[2] + 0.34;
    cord([x, belt[1] - 0.04, z], [x, belt[1] - 0.18, z + 0.02], 0.008, P.leather, J.pelvis);
    for (let k = 0; k < 3; k++)
      b.sweep([[x + s * 0.03 * k, belt[1] - 0.2 - k * 0.0, z + 0.02], [x + s * (0.03 * k + 0.05), belt[1] - 0.3 - k * 0.02, z + 0.03], [x + s * 0.03 * k, belt[1] - 0.4, z + 0.04]], 0.01, P.bone, { bone: J.pelvis });
  }
  // left hip small skull on cord
  const hx = 0.5, hz = belt[2] + 0.1;
  cord([hx, belt[1] - 0.03, hz], [hx + 0.04, belt[1] - 0.3, hz], 0.008, P.leather, J.pelvis);
  put(sph(0.065, 8, 6), P.bone, [hx + 0.04, belt[1] - 0.36, hz], J.pelvis);
  put(box(0.05, 0.04, 0.05), P.boneShade, [hx + 0.04, belt[1] - 0.42, hz + 0.01], J.pelvis);
  for (const s of [1, -1]) put(sph(0.016, 5, 4), P.pupil, [hx + 0.04 + s * 0.025, belt[1] - 0.35, hz + 0.055], J.pelvis);
  for (let k = 0; k < 3; k++) {
    put(new THREE.ConeGeometry(0.012, 0.1, 5), P.feather, [hx + 0.04 + (k - 1) * 0.03, belt[1] - 0.5 - (k % 2) * 0.03, hz], J.pelvis, { rotation: [180, 0, 0] });
  }

  // necklace around neckBase
  const nb = M.neckBase;
  const pts: number[][] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const front = Math.cos(a) > 0 ? 0.08 * Math.cos(a) : 0;
    pts.push([Math.sin(a) * 0.3, nb[1] - 0.05 - front, nb[2] - 0.05 + Math.cos(a) * 0.26]);
  }
  b.sweep(pts, 0.01, P.leather, { bone: J.spine2, closed: true });
  pts.forEach((p, i) => {
    if (i % 2 === 0) put(sph(0.026, 6, 4), P.bead, p, J.spine2);
    else if (p[2] > nb[2] - 0.2) {
      put(new THREE.ConeGeometry(0.02, 0.09, 5), i % 4 === 1 ? P.bone : P.feather, [p[0], p[1] - 0.06, p[2]], J.spine2, { rotation: [180, 0, 0] });
    }
  });
  // horned skull pendant
  const sx = 0, sy = nb[1] - 0.32, sz = nb[2] + 0.3;
  cord([0, nb[1] - 0.1, sz - 0.04], [0, sy + 0.08, sz], 0.01, P.leather, J.spine2);
  put(sph(0.1, 9, 7), P.bone, [sx, sy, sz], J.spine2, { scale: [1, 0.9, 1] });
  put(box(0.1, 0.06, 0.08), P.boneShade, [0, sy - 0.08, sz + 0.02], J.spine2);
  for (const s of [1, -1]) {
    put(sph(0.028, 6, 4), P.pupil, [s * 0.04, sy + 0.01, sz + 0.085], J.spine2);
    put(sph(0.01, 4, 3), P.rune, [s * 0.04, sy + 0.01, sz + 0.105], J.spine2);
    b.sweep([[s * 0.08, sy + 0.06, sz], [s * 0.15, sy + 0.1, sz], [s * 0.18, sy + 0.2, sz]], [0.028, 0.004], P.boneShade, { bone: J.spine2, caps: { end: "point" } });
  }
  put(box(0.03, 0.05, 0.03), P.pupil, [0, sy - 0.02, sz + 0.095], J.spine2);

  // shoulder feather strings
  for (const s of [1, -1]) {
    const x = s * 0.55, y = 1.95, z = 0.2;
    cord([x, y, z + 0.15], [x + s * 0.02, y - 0.2, z + 0.28], 0.008, P.leather, J.spine2);
    for (let k = 0; k < 3; k++) {
      const yy = y - 0.12 - k * 0.1;
      put(sph(0.022, 6, 4), P.bead, [x + s * 0.01, yy, z + 0.22 + k * 0.01], J.spine2);
    }
    for (let k = 0; k < 3; k++) {
      const fx = x + s * 0.02 + (k - 1) * 0.04;
      b.extrude([[0, 0], [0.025, -0.1], [0, -0.25], [-0.025, -0.1]], { at: [fx, y - 0.4, z + 0.3], x: [1, 0, 0], thickness: 0.008, color: P.feather, bone: J.spine2, smoothing: 1 });
      put(box(0.006, 0.12, 0.006), P.bone, [fx, y - 0.46, z + 0.3], J.spine2);
    }
  }
}
    return buildFetishes;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "swampTroll" });
  const J: Record<string, Joint> = {};
  J["pelvis"] = b.joint("pelvis", { at: [0,1,0], dir: [0,1,0], role: "spine" });
  J["spine1"] = b.joint("spine1", { parent: J["pelvis"], at: [0,1.3,0.08], dir: [0,1,0.3], role: "spine" });
  J["spine2"] = b.joint("spine2", { parent: J["spine1"], at: [0,1.7,0.2], dir: [0,1,0.3], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["spine2"], at: [0,2.05,0.3], dir: [0,0.5,1], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,2.2,0.45], dir: [0,0,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,2.18,0.45], dir: [0,0,1], role: "jaw" });
  J["shoulderL"] = b.joint("shoulderL", { parent: J["spine2"], at: [0.5,2,0.2], dir: [1,-0.3,0], role: "arm", group: "arms" });
  J["elbowL"] = b.joint("elbowL", { parent: J["shoulderL"], at: [0.8,1.45,0.2], dir: [0.2,-1,0.1], role: "arm", group: "arms" });
  J["wristL"] = b.joint("wristL", { parent: J["elbowL"], at: [0.85,0.85,0.3], dir: [0,-1,0.1], role: "arm", group: "arms" });
  J["shoulderR"] = b.joint("shoulderR", { parent: J["spine2"], at: [-0.5,2,0.2], dir: [-1,-0.3,0], role: "arm", group: "arms" });
  J["elbowR"] = b.joint("elbowR", { parent: J["shoulderR"], at: [-0.8,1.45,0.2], dir: [-0.2,-1,0.1], role: "arm", group: "arms" });
  J["wristR"] = b.joint("wristR", { parent: J["elbowR"], at: [-0.85,0.85,0.3], dir: [0,-1,0.1], role: "arm", group: "arms" });
  J["hipL"] = b.joint("hipL", { parent: J["pelvis"], at: [0.25,1,0], dir: [0,-1,0.3], role: "leg", group: "legs" });
  J["kneeL"] = b.joint("kneeL", { parent: J["hipL"], at: [0.3,0.6,0.2], dir: [0,-1,-0.3], role: "leg", group: "legs" });
  J["ankleL"] = b.joint("ankleL", { parent: J["kneeL"], at: [0.3,0.2,0.05], dir: [0,0,1], role: "leg", group: "legs" });
  J["hipR"] = b.joint("hipR", { parent: J["pelvis"], at: [-0.25,1,0], dir: [0,-1,0.3], role: "leg", group: "legs" });
  J["kneeR"] = b.joint("kneeR", { parent: J["hipR"], at: [-0.3,0.6,0.2], dir: [0,-1,-0.3], role: "leg", group: "legs" });
  J["ankleR"] = b.joint("ankleR", { parent: J["kneeR"], at: [-0.3,0.2,0.05], dir: [0,0,1], role: "leg", group: "legs" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
