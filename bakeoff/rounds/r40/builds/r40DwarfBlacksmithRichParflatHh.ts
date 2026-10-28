import * as THREE from "three";
import { createBuilder, type Builder, type Joint, aim, rng, frame, catmull } from "../../../../src/index";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Ironforge Dwarf Blacksmith",
  "description": "A stout, broad-shouldered Warcraft-style dwarf smith with a braided ginger beard, standing at a tree-stump anvil and hammering a glowing bar held in tongs."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  skin: "#d9996f",
  skinShade: "#b4694f",
  beard: "#b4501a",
  beardLight: "#e48a3a",
  beardDark: "#6e2c10",
  leather: "#6b4326",
  leatherDark: "#3a2213",
  leatherLight: "#9a6b3a",
  clothBlue: "#2b52a3",
  clothBlueDark: "#1b3170",
  shirt: "#a8452f",
  bronze: "#b0782a",
  gold: "#f2c23e",
  steel: "#919cb3",
  steelDark: "#4c5366",
  iron: "#2b2d36",
  soot: "#1a1715",
  wood: "#7a5230",
  woodDark: "#4a2f18",
  hotCore: "#fff1a0",
  hotMid: "#ffb232",
  hotEdge: "#ff5a14",
  eyeWhite: "#f4efe4",
  eyeIris: "#3a64c8",
};
const M = {
  floor: [0, 0, 0] as [number, number, number],
  hips: [0, 0.58, 0] as [number, number, number],
  waistTop: [0, 0.7, 0] as [number, number, number],
  chestCenter: [0, 0.92, 0] as [number, number, number],
  neckBase: [0, 1.12, 0] as [number, number, number],
  headCenter: [0, 1.31, 0.03] as [number, number, number],
  jawPivot: [0, 1.25, 0] as [number, number, number],
  chinFront: [0, 1.2, 0.17] as [number, number, number],
  beardTip: [0, 0.8, 0.27] as [number, number, number],
  shoulderL: [0.42, 1.02, 0] as [number, number, number],
  shoulderR: [-0.42, 1.02, 0] as [number, number, number],
  wristL: [0.33, 0.86, 0.4] as [number, number, number],
  wristR: [-0.33, 0.92, 0.38] as [number, number, number],
  hammerHead: [-0.02, 0.98, 0.6] as [number, number, number],
  tongGrip: [0.4, 0.795, 0.6] as [number, number, number],
  anvilTop: [0, 0.76, 0.6] as [number, number, number],
  workpieceStart: [-0.05, 0.78, 0.6] as [number, number, number],
  workpieceEnd: [0.44, 0.78, 0.6] as [number, number, number],
  stumpCenter: [0, 0, 0.6] as [number, number, number],
  bootL: [0.17, 0, 0.04] as [number, number, number],
  bootR: [-0.17, 0, 0.04] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // lowerBody
  (() => {
function buildLowerBody({ b, J, P }: Ctx) {
  const rnd = rng(21);
  const hips = J.hips;
  type Bone = typeof hips;
  const D2R = Math.PI / 180;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  type Pt = THREE.Vector3 | [number, number, number];
  type Rot = [number, number, number];

  // ---------------------------------------------------------------- helpers
  const box = (bone: Bone, color: string, at: Pt, size: [number, number, number], rot?: Rot) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at, ...(rot ? { rotation: rot } : {}) });
  const ball = (bone: Bone, color: string, at: Pt, rad: number, scale?: [number, number, number]) =>
    b.part(new THREE.SphereGeometry(rad, 6, 4), color, { bone, at, ...(scale ? { scale } : {}) });
  const cyl = (
    bone: Bone,
    color: string,
    at: Pt,
    rt: number,
    rb: number,
    h: number,
    seg = 8,
    dir?: THREE.Vector3,
  ) => b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, ...(dir ? { dir } : {}) });

  const SPH = new THREE.SphereGeometry(1, 6, 4);
  const BOXU = new THREE.BoxGeometry(1, 1, 1);
  type Item = { g: THREE.BufferGeometry; p: THREE.Vector3; s?: [number, number, number]; q?: THREE.Quaternion };
  const cluster = (bone: Bone, color: string, items: Item[]) => {
    const gs = items.map((it) => {
      const g = it.g.clone();
      g.applyMatrix4(
        new THREE.Matrix4().compose(it.p, it.q ?? new THREE.Quaternion(), it.s ? V(it.s[0], it.s[1], it.s[2]) : V(1, 1, 1)),
      );
      return g;
    });
    return b.part(mergeGeometries(gs)!, color, { bone, at: [0, 0, 0] });
  };
  const dot = (p: THREE.Vector3, rad: number): Item => ({ g: SPH, p, s: [rad, rad, rad] });
  const smudge = (p: THREE.Vector3, n: THREE.Vector3, rx: number, rz: number): Item => ({
    g: SPH,
    p,
    q: aim(n),
    s: [rx, 0.0035, rz],
  });
  const sliver = (p: THREE.Vector3, size: [number, number, number]): Item => ({ g: BOXU, p, s: size });

  // ---------------------------------------------------------------- pelvis + belt
  const R = 0.29;
  const ZS = 0.86;
  const CZ = 0.008;

  b.part(new THREE.CylinderGeometry(0.25, 0.23, 0.2, 10), P.clothBlueDark, {
    bone: hips,
    at: [0, 0.55, CZ],
    scale: [1, 1, 0.8],
  });

  const oct = (yc: number, h: number, rad: number, color: string) => {
    const g = new THREE.CylinderGeometry(rad, rad, h, 8);
    g.rotateY(Math.PI / 8);
    return b.part(g, color, { bone: hips, at: [0, yc, CZ], scale: [1, 1, ZS] });
  };
  oct(0.67, 0.1, R, P.leatherDark);
  oct(0.67, 0.012, R + 0.003, P.leatherLight);
  oct(0.7175, 0.012, R + 0.006, P.gold);
  oct(0.6225, 0.012, R + 0.006, P.gold);

  // belt faces: face k is centred on azimuth 45k degrees (0 = front, +X = left)
  const face = (k: number) => {
    const a1 = (45 * k - 22.5) * D2R;
    const a2 = (45 * k + 22.5) * D2R;
    const v1 = V(R * Math.sin(a1), 0, R * ZS * Math.cos(a1) + CZ);
    const v2 = V(R * Math.sin(a2), 0, R * ZS * Math.cos(a2) + CZ);
    const t = v2.clone().sub(v1);
    const len = t.length();
    t.normalize();
    const n = V(-t.z, 0, t.x);
    const mid = v1.clone().add(v2).multiplyScalar(0.5);
    return { v1, v2, t, n, len, mid, yaw: Math.atan2(n.x, n.z) / D2R };
  };
  type Face = ReturnType<typeof face>;
  const loc = (f: Face, du: number, y: number, dn: number) => {
    const p = f.mid.clone().addScaledVector(f.t, du).addScaledVector(f.n, dn);
    p.y = y;
    return p;
  };

  // gold rivet studs around the belt
  {
    const studs: Item[] = [];
    for (let k = 1; k <= 7; k++) {
      const f = face(k);
      const n = Math.max(1, Math.floor(f.len / 0.05));
      for (let i = 0; i < n; i++) {
        const fr = (i + 0.5) / n;
        const p = f.v1.clone().lerp(f.v2, fr).addScaledVector(f.n, 0.0075);
        p.y = 0.67;
        studs.push(dot(p, 0.008));
      }
    }
    cluster(hips, P.gold, studs);
  }

  // front buckle
  const f0 = face(0);
  const zf = f0.mid.z;
  box(hips, P.gold, V(0, 0.707, zf + 0.012), [0.13, 0.014, 0.02]);
  box(hips, P.gold, V(0, 0.633, zf + 0.012), [0.13, 0.014, 0.02]);
  box(hips, P.gold, V(0.058, 0.67, zf + 0.012), [0.014, 0.075, 0.02]);
  box(hips, P.gold, V(-0.058, 0.67, zf + 0.012), [0.014, 0.075, 0.02]);
  box(hips, P.bronze, V(0, 0.67, zf + 0.008), [0.1, 0.056, 0.016]);
  box(hips, P.iron, V(0, 0.67, zf + 0.019), [0.104, 0.012, 0.008]);
  ball(hips, P.gold, V(0, 0.67, zf + 0.024), 0.012, [1, 1, 0.6]);
  // belt tail strap with gold tip
  box(hips, P.leatherLight, V(0.103, 0.605, zf + 0.012), [0.04, 0.1, 0.01], [0, 0, 4]);
  box(hips, P.gold, V(0.104, 0.553, zf + 0.012), [0.044, 0.014, 0.014], [0, 0, 4]);

  // back plate
  {
    const fb = face(4);
    box(hips, P.bronze, loc(fb, 0, 0.67, 0.01), [0.15, 0.085, 0.012], [0, 180, 0]);
    cluster(
      hips,
      P.gold,
      [-0.06, 0.06].flatMap((x) => [0.025, -0.025].map((y) => dot(loc(fb, x, 0.67 + y, 0.02), 0.008))),
    );
  }

  // pouches
  const pouch = (k: number, du: number, w: number, h: number, d: number) => {
    const f = face(k);
    const yTop = 0.635;
    const yc = yTop - h / 2;
    const rot: Rot = [0, f.yaw, 0];
    box(hips, P.leather, loc(f, du, yc, d / 2 + 0.003), [w, h, d], rot);
    box(hips, P.leatherDark, loc(f, du, yTop - 0.022, d / 2 + 0.009), [w + 0.01, 0.05, d + 0.014], rot);
    box(hips, P.leatherLight, loc(f, du, yTop - 0.055, d + 0.012), [w - 0.02, 0.006, 0.006], rot);
    ball(hips, P.gold, loc(f, du, yTop - 0.045, d + 0.016), 0.01, [1, 1, 0.6]);
  };
  pouch(-2, -0.02, 0.1, 0.12, 0.06);
  pouch(3, 0, 0.09, 0.1, 0.04);
  pouch(-3, 0, 0.08, 0.09, 0.04);

  // hammer loop and tong loop on the left hip
  {
    const f = face(2);
    box(hips, P.leatherLight, loc(f, 0.02, 0.575, 0.01), [0.014, 0.09, 0.04]);
    b.part(new THREE.TorusGeometry(0.03, 0.008, 5, 8), P.steel, {
      bone: hips,
      at: loc(f, 0.02, 0.52, 0.02),
      rotation: [0, 90, 0],
    });
    ball(hips, P.gold, loc(f, 0.02, 0.6, 0.019), 0.008);
    box(hips, P.leatherLight, loc(f, -0.055, 0.59, 0.01), [0.014, 0.06, 0.036]);
    b.part(new THREE.TorusGeometry(0.022, 0.007, 5, 8), P.bronze, {
      bone: hips,
      at: loc(f, -0.055, 0.55, 0.02),
      rotation: [0, 90, 0],
    });
    ball(hips, P.gold, loc(f, -0.055, 0.608, 0.019), 0.007);
  }

  // cloth tassels at the belt sides
  const tassel = (s: number) => {
    const z = face(1).v2.z;
    const x = s * 0.282;
    const ty = 0.622;
    ball(hips, P.gold, V(x, ty - 0.002, z), 0.015);
    cyl(hips, P.clothBlueDark, V(x, ty - 0.022, z), 0.008, 0.008, 0.04, 6);
    cyl(hips, P.clothBlue, V(x, ty - 0.085, z), 0.016, 0.03, 0.09, 6);
    cyl(hips, P.gold, V(x, ty - 0.055, z), 0.023, 0.023, 0.012, 6);
    const fr: Item[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      fr.push(sliver(V(x + Math.sin(a) * 0.025, ty - 0.16, z + Math.cos(a) * 0.025), [0.008, 0.055, 0.008]));
    }
    cluster(hips, P.clothBlueDark, fr);
  };
  tassel(1);
  tassel(-1);

  // ---------------------------------------------------------------- apron
  type Panel = { O: THREE.Vector3; xd: THREE.Vector3; yd: THREE.Vector3; nd: THREE.Vector3; w: number };
  const mkPanel = (O: THREE.Vector3, xd: THREE.Vector3, outN: THREE.Vector3, w: number): Panel => {
    const yd = V(0, 1, 0).addScaledVector(outN, 0.12).normalize();
    const nd = xd.clone().cross(yd).normalize();
    return { O, xd, yd, nd, w };
  };
  const pp = (p: Panel, u: number, v: number, off = 0) =>
    p.O.clone().addScaledVector(p.xd, u).addScaledVector(p.yd, v).addScaledVector(p.nd, off);
  const layer = (p: Panel, outline: [number, number][], color: string, thick: number, off: number) =>
    b.extrude(outline, { at: pp(p, 0, 0, off), x: p.xd, y: p.yd, thickness: thick, color, bone: hips });
  const hemPts = (w: number, teeth: number) => {
    const pts: [number, number][] = [[-w, -0.33]];
    const step = (2 * w) / teeth;
    for (let i = 0; i < teeth; i++) {
      const x0 = -w + i * step;
      pts.push([x0 + step * 0.5, -0.4]);
      pts.push([x0 + step, i === teeth - 1 ? -0.33 : -0.36]);
    }
    return pts;
  };
  const hemBand = (hem: [number, number][], dy: number, width: number): [number, number][] => [
    ...hem.map(([x, y]): [number, number] => [x, y + dy]),
    ...[...hem].reverse().map(([x, y]): [number, number] => [x, y + dy + width]),
  ];
  const rectO = (x0: number, y0: number, x1: number, y1: number): [number, number][] => [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];

  const buildPanel = (p: Panel, teeth: number, center: boolean) => {
    const w = p.w;
    const hem = hemPts(w, teeth);
    const base: [number, number][] = [[-w, 0], [w, 0], ...[...hem].reverse()];
    layer(p, base, P.leather, 0.024, 0);
    layer(p, hemBand(hem, 0.001, 0.045), P.leatherDark, 0.004, 0.013);
    layer(p, hemBand(hem, 0.058, 0.006), P.gold, 0.004, 0.0135);
    layer(p, rectO(-w + 0.012, -0.01, -w + 0.02, -0.3), P.gold, 0.004, 0.0135);
    layer(p, rectO(w - 0.02, -0.01, w - 0.012, -0.3), P.gold, 0.004, 0.0135);
    const rivets = [-1, 1].map((s) => dot(pp(p, s * (w - 0.034), -0.1, 0.014), 0.008));
    if (center) {
      // stitched patch and smudges
      layer(p, rectO(-0.045, -0.15, 0.05, -0.24), P.leatherLight, 0.005, 0.0135);
      layer(p, rectO(-0.04, -0.155, 0.045, -0.158), P.leatherDark, 0.004, 0.0165);
      layer(p, rectO(-0.04, -0.232, 0.045, -0.235), P.leatherDark, 0.004, 0.0165);
      for (const [u, v] of [[-0.036, -0.162], [0.041, -0.162], [-0.036, -0.228], [0.041, -0.228]])
        rivets.push(dot(pp(p, u, v, 0.017), 0.006));
      const sm: Item[] = [];
      for (const [u, v, rx, rz] of [
        [-0.07, -0.08, 0.03, 0.022],
        [0.075, -0.06, 0.022, 0.03],
        [-0.04, -0.27, 0.035, 0.02],
        [0.07, -0.29, 0.02, 0.016],
        [0.0, -0.1, 0.018, 0.012],
      ])
        sm.push(smudge(pp(p, u + (rnd() - 0.5) * 0.01, v, 0.0125), p.nd, rx, rz));
      cluster(hips, P.soot, sm);
    }
    cluster(hips, P.gold, rivets);
  };

  buildPanel(mkPanel(V(0, 0.68, zf - 0.012), V(1, 0, 0), V(0, 0, 1), 0.115), 2, true);
  for (const s of [1, -1]) {
    const f = face(s);
    const near = s > 0 ? f.v1 : f.v2;
    const c = near.clone().addScaledVector(f.t, s > 0 ? 0.077 : -0.077).addScaledVector(f.n, -0.012);
    c.y = 0.68;
    buildPanel(mkPanel(c, f.t.clone(), f.n.clone(), 0.062), 1, false);
  }

  // ---------------------------------------------------------------- legs and boots
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const hip = J["hip" + sd];
    const knee = J["knee" + sd];
    const ankle = J["ankle" + sd];
    const toe = J["toe" + sd];
    const X = 0.17 * s;
    const hipP = V(X, 0.58, 0);
    const kneeP = V(X, 0.34, 0.04);
    const ankP = V(X, 0.12, 0);

    // thigh
    b.capsule(hipP, kneeP, [0.118, 0.098], { color: P.clothBlueDark, bone: hip });
    const tDir = kneeP.clone().sub(hipP).normalize();
    for (const t of [0.35, 0.72]) {
      cyl(hip, P.leatherDark, hipP.clone().lerp(kneeP, t), 0.118 - 0.02 * t + 0.01, 0.118 - 0.02 * t + 0.01, 0.03, 8, tDir);
    }
    // sewn cloth patch on the outer thigh
    box(hip, P.clothBlue, V(X + s * 0.106, 0.47, 0.025), [0.012, 0.09, 0.08]);
    cluster(hip, P.gold, [
      dot(V(X + s * 0.114, 0.505, 0.0), 0.007),
      dot(V(X + s * 0.114, 0.435, 0.05), 0.007),
    ]);

    // calf (leg wraps)
    b.capsule(kneeP, ankP, [0.092, 0.074], { color: P.leatherDark, bone: knee });
    const cDir = ankP.clone().sub(kneeP).normalize();
    for (const t of [0.26, 0.42]) {
      cyl(knee, P.leather, kneeP.clone().lerp(ankP, t), 0.092 - 0.018 * t + 0.01, 0.092 - 0.018 * t + 0.01, 0.028, 8, cDir);
    }

    // bronze fold-over knee pad
    {
      const n = V(0, 0.12, 1).normalize();
      const C = V(X, 0.345, 0.04 + 0.09);
      cyl(knee, P.gold, C, 0.09, 0.094, 0.022, 6, n);
      cyl(knee, P.bronze, C.clone().addScaledVector(n, 0.008), 0.074, 0.08, 0.036, 6, n);
      b.part(new THREE.SphereGeometry(0.02, 6, 4), P.gold, {
        bone: knee,
        at: C.clone().addScaledVector(n, 0.03),
        quat: aim(n),
        scale: [1, 0.6, 1],
      });
      const u = V(1, 0, 0);
      const vv = n.clone().cross(u).normalize();
      const rv: Item[] = [];
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.3;
        rv.push(dot(C.clone().addScaledVector(n, 0.027).addScaledVector(u, Math.cos(a) * 0.058).addScaledVector(vv, Math.sin(a) * 0.058), 0.008));
      }
      cluster(knee, P.gold, rv);
      box(knee, P.bronze, V(X, 0.43, 0.135), [0.15, 0.03, 0.07], [35, 0, 0]);
      box(knee, P.gold, V(X, 0.41, 0.163), [0.15, 0.008, 0.01], [35, 0, 0]);
    }

    // ---- boot
    const bz = -0.01;
    cyl(ankle, P.leather, V(X, 0.1425, bz), 0.103, 0.108, 0.105, 8);
    cyl(ankle, P.leatherLight, V(X, 0.195, bz), 0.113, 0.109, 0.05, 8);
    cyl(ankle, P.leatherDark, V(X, 0.196, bz), 0.1155, 0.1155, 0.02, 8);
    cyl(ankle, P.steel, V(X, 0.222, bz), 0.117, 0.117, 0.012, 8);
    cyl(ankle, P.steel, V(X, 0.168, bz), 0.117, 0.117, 0.012, 8);
    for (const d of [1, -1]) {
      box(ankle, P.gold, V(X + d * 0.12, 0.196, bz), [0.012, 0.042, 0.036]);
      box(ankle, P.bronze, V(X + d * 0.124, 0.196, bz), [0.008, 0.026, 0.022]);
    }
    // foot
    box(ankle, P.leather, V(X, 0.075, 0.0075), [0.195, 0.09, 0.245]);
    box(ankle, P.leatherDark, V(X, 0.016, 0.0), [0.2, 0.032, 0.26]);
    box(ankle, P.leatherLight, V(X, 0.038, 0.0), [0.2, 0.012, 0.25]);
    box(ankle, P.woodDark, V(X, 0.0325, -0.085), [0.17, 0.065, 0.09]);
    // tongue and laces
    box(ankle, P.leatherLight, V(X, 0.13, 0.102), [0.065, 0.09, 0.014]);
    const eye: Item[] = [];
    for (const y of [0.115, 0.14, 0.165]) {
      box(ankle, P.leatherDark, V(X, y, 0.11), [0.08, 0.008, 0.012]);
      for (const sx of [-1, 1]) eye.push(dot(V(X + sx * 0.04, y, 0.111), 0.006));
    }
    cluster(ankle, P.gold, eye);
    // toe section
    box(toe, P.leather, V(X, 0.0725, 0.165), [0.195, 0.085, 0.07]);
    box(toe, P.leatherDark, V(X, 0.016, 0.2), [0.2, 0.032, 0.145]);
    box(toe, P.leatherLight, V(X, 0.038, 0.2), [0.2, 0.012, 0.14]);
    b.part(new THREE.SphereGeometry(1, 8, 6), P.leatherLight, {
      bone: toe,
      at: V(X, 0.07, 0.2),
      scale: [0.097, 0.05, 0.07],
    });
    ball(toe, P.steel, V(X, 0.063, 0.252), 1, [0.072, 0.04, 0.025]);
    // scuffs on the toe cap
    {
      const rr = [0.097, 0.05, 0.07];
      const sc: Item[] = [];
      for (const [dx, dz] of [[-0.03, 0.03], [0.025, 0.045], [0.045, 0.0], [-0.05, -0.01]]) {
        const jx = dx + (rnd() - 0.5) * 0.006;
        const y = 0.07 + rr[1] * Math.sqrt(Math.max(0.05, 1 - (jx / rr[0]) ** 2 - (dz / rr[2]) ** 2));
        const nn = V(jx / rr[0] ** 2, (y - 0.07) / rr[1] ** 2, dz / rr[2] ** 2).normalize();
        sc.push(smudge(V(X + jx, y, 0.2 + dz), nn, 0.014, 0.006));
      }
      cluster(toe, P.leatherDark, sc);
    }
    // soot and mud
    cluster(ankle, P.soot, [
      smudge(V(X + s * 0.108, 0.125, 0.0), V(s, 0, 0), 0.03, 0.022),
      smudge(V(X - s * 0.106, 0.15, 0.02), V(-s, 0, 0), 0.02, 0.016),
      smudge(V(X + s * 0.099, 0.07, 0.05), V(s, 0, 0), 0.03, 0.02),
    ]);
    cluster(ankle, P.woodDark, [
      smudge(V(X + s * 0.1, 0.045, -0.04), V(s, 0, 0), 0.03, 0.012),
      smudge(V(X - s * 0.1, 0.05, 0.03), V(-s, 0, 0), 0.025, 0.012),
    ]);
  }
}
    return buildLowerBody;
  })(),
  // torso
  (() => {
function buildTorso({ b, J, P, M }: Ctx) {
  const D = Math.PI / 180;
  const SHIRT_L = "#c9593b";
  const SHIRT_D = "#7e2f22";
  const R = rng(11);
  void frame;

  // ------------------------------------------------------------------ batching helpers
  // Small pieces are baked into model space and merged per bone + colour: faceted, cheap, few parts.
  type Bucket = { bone: any; color: string; geos: THREE.BufferGeometry[] };
  const buckets = new Map<string, Bucket>();
  const tmpM = new THREE.Matrix4();
  const tmpQ = new THREE.Quaternion();
  const tmpE = new THREE.Euler();
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const YAXIS = V(0, 1, 0);

  type PutOpt = {
    rot?: [number, number, number];
    scale?: [number, number, number];
    q?: THREE.Quaternion;
    bone?: any;
    spin?: number;
  };

  function put(geo: THREE.BufferGeometry, color: string, at: number[] | THREE.Vector3, o: PutOpt = {}) {
    const p = Array.isArray(at) ? V(at[0], at[1], at[2]) : at.clone();
    if (o.q) tmpQ.copy(o.q);
    else {
      const r = o.rot ?? [0, 0, 0];
      tmpE.set(r[0] * D, r[1] * D, r[2] * D, "XYZ");
      tmpQ.setFromEuler(tmpE);
    }
    if (o.spin) tmpQ.multiply(new THREE.Quaternion().setFromAxisAngle(YAXIS, o.spin * D));
    const sc = o.scale ?? [1, 1, 1];
    tmpM.compose(p, tmpQ, V(sc[0], sc[1], sc[2]));
    geo.applyMatrix4(tmpM);
    const g = geo.index ? geo.toNonIndexed() : geo;
    g.deleteAttribute("uv");
    g.clearGroups();
    g.computeVertexNormals();
    const bone = o.bone ?? (p.y < 0.9 ? J.spine : J.chest);
    const key = `${bone.name}|${color}`;
    let bk = buckets.get(key);
    if (!bk) buckets.set(key, (bk = { bone, color, geos: [] }));
    bk.geos.push(g);
  }

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg, 1);
  const sph = (r: number, w = 6, h = 4) => new THREE.SphereGeometry(r, w, h);
  const dome = (r: number, w = 9, h = 4) => new THREE.SphereGeometry(r, w, h, 0, Math.PI * 2, 0, Math.PI / 2);
  const torus = (r: number, t: number, rad = 5, tub = 10) => new THREE.TorusGeometry(r, t, rad, tub);
  const cone = (r: number, h: number, seg = 5) => new THREE.ConeGeometry(r, h, seg, 1);

  const rivet = (at: number[] | THREE.Vector3, color = P.gold, r = 0.008, bone?: any) =>
    put(sph(r, 6, 4), color, at, { scale: [1, 1, 0.75], bone });

  function bar(a: number[], c: number[], z: number, w: number, t: number, color: string, bone: any = J.chest) {
    const dx = c[0] - a[0];
    const dy = c[1] - a[1];
    const len = Math.hypot(dx, dy);
    put(box(len, w, t), color, [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, z], {
      rot: [0, 0, Math.atan2(dy, dx) / D],
      bone,
    });
  }

  function stitchLine(pts: number[][], z: number, color: string, step = 0.03) {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const c = pts[i + 1];
      const dx = c[0] - a[0];
      const dy = c[1] - a[1];
      const len = Math.hypot(dx, dy);
      const n = Math.max(1, Math.round(len / step));
      const ang = Math.atan2(dy, dx) / D;
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n;
        put(box(0.016, 0.005, 0.004), color, [a[0] + dx * t, a[1] + dy * t, z], { rot: [0, 0, ang], bone: J.chest });
      }
    }
  }

  function plate(pts: number[][], depth: number, z: number, color: string, bevel = false) {
    const sh = new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], p[1])));
    const g = new THREE.ExtrudeGeometry(
      sh,
      bevel
        ? { depth, bevelEnabled: true, bevelSegments: 1, bevelSize: 0.004, bevelThickness: 0.004, steps: 1 }
        : { depth, bevelEnabled: false, steps: 1 },
    );
    put(g, color, [0, 0, z], { bone: J.chest });
  }

  // ------------------------------------------------------------------ shirt body (barrel chest loft)
  const shirt: any = b.loft(
    [
      { at: [0, 0.66, 0], w: 0.5, h: 0.4 },
      { at: [0, 0.76, 0], w: 0.58, h: 0.42 },
      { at: [0, 0.88, 0], w: 0.66, h: 0.44 },
      { at: [0, 0.99, 0], w: 0.7, h: 0.44 },
      { at: [0, 1.07, 0], w: 0.56, h: 0.38 },
      { at: [0, 1.12, 0], w: 0.26, h: 0.24 },
    ],
    { bone: [J.spine, J.chest], color: P.shirt, sides: 10, caps: "flat" } as any,
  );
  const skin = b.surface(shirt);
  const L = (h: any, v: number[]) => new THREE.Vector3(v[0], v[1], v[2]).applyQuaternion(h.quat).add(h.at);

  // shirt wrinkles: creases seated on the cloth, dark and light
  const creases: [number[], number, number][] = [
    [[0.25, 0.8, 0.1], 0.07, 15],
    [[0.27, 0.77, -0.05], 0.06, -20],
    [[0.22, 0.84, 0.15], 0.05, 25],
    [[-0.25, 0.8, 0.1], 0.07, -15],
    [[-0.27, 0.77, -0.05], 0.06, 20],
    [[-0.22, 0.84, 0.15], 0.05, -25],
    [[0.22, 0.78, -0.16], 0.07, 10],
    [[-0.22, 0.78, -0.16], 0.07, -10],
    [[0.26, 0.9, -0.12], 0.06, 20],
    [[-0.26, 0.9, -0.12], 0.06, -20],
    [[0.0, 0.76, -0.2], 0.08, 4],
  ];
  for (const [p, len, spin] of creases) {
    const h: any = skin.nearest(p);
    put(box(len, 0.007, 0.012), SHIRT_D, h.at.clone().addScaledVector(h.n, 0.002), { q: h.quat, spin });
    put(box(len * 0.7, 0.006, 0.01), SHIRT_L, L(h, [0.005, 0.002, 0.016]), { q: h.quat, spin });
  }
  // back yoke seam
  b.sweep(
    skin.drape(
      catmull([
        [-0.3, 1.0, -0.1],
        [-0.15, 1.02, -0.2],
        [0.15, 1.02, -0.2],
        [0.3, 1.0, -0.1],
      ]),
      { lift: 0.004 },
    ),
    () => [0.007, 0.003],
    { section: "box", color: SHIRT_D, bone: J.chest, caps: "flat" } as any,
  );
  // soot on the shirt back
  for (const [p, r] of [
    [[-0.2, 0.8, -0.13], 0.03],
    [[0.24, 0.84, 0.1], 0.025],
    [[-0.12, 0.74, -0.19], 0.035],
  ] as [number[], number][]) {
    const h: any = skin.nearest(p);
    put(sph(r, 6, 4), P.soot, h.at.clone().addScaledVector(h.n, 0.0), { q: h.quat, scale: [1, 0.22, 0.8] });
  }

  // trapezius slope up to the neck
  for (const s of [1, -1]) put(sph(0.1, 8, 5), P.shirt, [s * 0.18, 1.085, -0.01], { scale: [1.3, 0.6, 1], bone: J.chest });

  // ------------------------------------------------------------------ neck + collar
  put(cyl(0.1, 0.125, 0.14, 8), P.skin, [0, 1.15, 0.005], { bone: J.neck });
  put(torus(0.15, 0.04, 6, 10), P.leather, [0, M.neckBase[1], 0], { rot: [90, 0, 0], scale: [1, 1.08, 1], bone: J.neck });
  put(torus(0.158, 0.02, 5, 10), P.leatherDark, [0, 1.085, 0], { rot: [90, 0, 0], scale: [1, 1.08, 1], bone: J.chest });
  put(torus(0.152, 0.008, 4, 12), P.leatherLight, [0, 1.15, 0], { rot: [90, 0, 0], scale: [1, 1.08, 1], bone: J.neck });
  put(box(0.05, 0.05, 0.02), P.bronze, [0, 1.12, 0.205], { rot: [0, 0, 45], bone: J.neck });
  put(sph(0.013, 6, 4), P.gold, [0, 1.12, 0.218], { bone: J.neck });
  for (const s of [1, -1]) rivet([s * 0.075, 1.125, 0.18], P.gold, 0.007, J.neck);

  // ------------------------------------------------------------------ leather apron bib
  const O = [
    [-0.17, 0.69],
    [0.17, 0.69],
    [0.175, 0.9],
    [0.125, 1.04],
    [-0.125, 1.04],
    [-0.175, 0.9],
  ];
  plate(O, 0.03, 0.202, P.leather, true);
  // gold-trimmed upper edge, dark piping on the sides
  bar(O[2], O[3], 0.238, 0.014, 0.006, P.gold);
  bar(O[3], O[4], 0.238, 0.014, 0.006, P.gold);
  bar(O[4], O[5], 0.238, 0.014, 0.006, P.gold);
  bar(O[1], O[2], 0.238, 0.012, 0.005, P.leatherDark);
  bar(O[5], O[0], 0.238, 0.012, 0.005, P.leatherDark);
  // stitched seam inset from the edge
  const I = [
    [-0.155, 0.7],
    [0.155, 0.7],
    [0.16, 0.9],
    [0.112, 1.026],
    [-0.112, 1.026],
    [-0.16, 0.9],
  ];
  stitchLine([I[1], I[2], I[3], I[4], I[5], I[0]], 0.237, P.leatherLight, 0.03);
  // sooty chest plate patch
  plate(
    [
      [-0.15, 0.905],
      [0.15, 0.905],
      [0.13, 0.995],
      [-0.13, 0.995],
    ],
    0.008,
    0.234,
    P.leatherDark,
  );
  for (const [x, y] of [
    [-0.125, 0.92],
    [0.125, 0.92],
    [-0.108, 0.98],
    [0.108, 0.98],
  ])
    rivet([x, y, 0.244], P.gold, 0.008);
  stitchLine(
    [
      [-0.135, 0.915],
      [0.135, 0.915],
    ],
    0.243,
    P.leatherLight,
    0.026,
  );
  // upper band with rivet row
  bar([-0.138, 1.006], [0.138, 1.006], 0.24, 0.028, 0.008, P.leatherDark);
  for (let i = 0; i < 7; i++) rivet([-0.12 + i * 0.04, 1.006, 0.246], P.gold, 0.008);
  // side rivet rows
  for (let i = 0; i < 5; i++)
    for (const s of [1, -1]) rivet([s * 0.148, 0.725 + i * 0.044, 0.239], P.gold, 0.007);
  // tool pocket with flap and button
  put(box(0.08, 0.075, 0.012), P.leatherLight, [0.095, 0.765, 0.242], { bone: J.spine });
  put(box(0.086, 0.03, 0.014), P.leatherDark, [0.095, 0.793, 0.246], { bone: J.spine });
  put(sph(0.008, 6, 4), P.gold, [0.095, 0.785, 0.254], { scale: [1, 1, 0.6], bone: J.spine });
  stitchLine(
    [
      [0.058, 0.73],
      [0.058, 0.8],
    ],
    0.249,
    P.leather,
    0.02,
  );
  stitchLine(
    [
      [0.132, 0.73],
      [0.132, 0.8],
    ],
    0.249,
    P.leather,
    0.02,
  );
  // tool loops holding a chisel
  for (const y of [0.73, 0.79]) put(box(0.04, 0.014, 0.014), P.leatherDark, [-0.1, y, 0.243], { bone: J.spine });
  put(cyl(0.009, 0.009, 0.2, 6), P.wood, [-0.1, 0.81, 0.25], { bone: J.spine });
  put(cyl(0.012, 0.012, 0.03, 6), P.woodDark, [-0.1, 0.9, 0.25], { bone: J.chest });
  put(box(0.014, 0.05, 0.008), P.steelDark, [-0.1, 0.72, 0.25], { bone: J.spine });
  // soot smudges and scorch
  for (const [x, y, r] of [
    [-0.12, 0.75, 0.035],
    [0.1, 0.71, 0.03],
    [-0.04, 0.83, 0.025],
    [0.13, 0.86, 0.02],
    [-0.14, 0.88, 0.022],
    [0.02, 0.72, 0.04],
    [-0.06, 0.7, 0.02],
  ])
    put(sph(r, 6, 4), P.soot, [x, y, 0.237], { scale: [1.2, 0.8, 0.12], bone: y < 0.9 ? J.spine : J.chest });

  // ------------------------------------------------------------------ shoulder straps (gold trimmed) over the shirt
  for (const s of [1, -1]) {
    const path = catmull([
      [s * 0.115, 1.02, 0.23],
      [s * 0.14, 1.09, 0.16],
      [s * 0.165, 1.115, 0.05],
      [s * 0.17, 1.105, -0.07],
      [s * 0.15, 1.03, -0.19],
      [s * 0.12, 0.93, -0.215],
    ]);
    b.sweep(skin.drape(path, { lift: 0.012 }), () => [0.026, 0.007], {
      section: "box",
      color: P.leather,
      bone: J.chest,
      caps: "flat",
    } as any);
    b.sweep(skin.drape(path, { lift: 0.022 }), () => [0.006, 0.0035], {
      section: "box",
      color: P.gold,
      bone: J.chest,
      caps: "flat",
    } as any);
    // gold buckle frame on each strap
    const h: any = skin.nearest(path.at(0.2));
    const c = L(h, [0, 0.02, 0]);
    const place = (v: number[], g: THREE.BufferGeometry) => put(g, P.gold, L(h, [v[0], 0.02, v[1]]), { q: h.quat });
    void c;
    place([0, 0.022], box(0.06, 0.008, 0.008));
    place([0, -0.022], box(0.06, 0.008, 0.008));
    place([0.027, 0], box(0.008, 0.008, 0.044));
    place([-0.027, 0], box(0.008, 0.008, 0.044));
    place([0, 0], box(0.006, 0.01, 0.04));
  }

  // ------------------------------------------------------------------ pauldrons
  for (const s of [1, -1]) {
    const cx = s * 0.395;
    // rolled sleeve stub and cuff
    put(cyl(0.105, 0.105, 0.24, 10), P.shirt, [s * 0.42, 0.94, 0], { rot: [0, 0, 90], bone: J.chest });
    put(torus(0.108, 0.022, 5, 10), SHIRT_L, [s * 0.522, 0.94, 0], { rot: [0, 90, 0], bone: J.chest });
    put(torus(0.106, 0.012, 4, 10), SHIRT_D, [s * 0.486, 0.94, 0], { rot: [0, 90, 0], bone: J.chest });

    // cloth mantle drape with dark trim, dags and gold rivets
    put(cyl(0.14, 0.165, 0.1, 10), P.clothBlue, [cx, 0.935, 0], { scale: [1, 1, 1.05], bone: J.chest });
    put(torus(0.166, 0.014, 5, 12), P.clothBlueDark, [cx, 0.888, 0], { rot: [90, 0, 0], scale: [1, 1.05, 1], bone: J.chest });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      put(cone(0.03, 0.075, 4), P.clothBlue, [cx + 0.165 * Math.cos(a), 0.852, 0.165 * 1.05 * Math.sin(a)], {
        rot: [180, 0, 0],
        bone: J.chest,
      });
      put(sph(0.007, 5, 3), P.gold, [cx + 0.165 * Math.cos(a), 0.83, 0.165 * 1.05 * Math.sin(a)], { bone: J.chest });
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.1;
      rivet([cx + 0.158 * Math.cos(a), 0.93, 0.158 * 1.05 * Math.sin(a)], P.gold, 0.009, J.chest);
    }
    // gold rune emblem on the front of the mantle
    put(cyl(0.034, 0.034, 0.008, 8), P.clothBlueDark, [cx, 0.935, 0.162], { rot: [90, 0, 0], bone: J.chest });
    put(box(0.008, 0.05, 0.006), P.gold, [cx, 0.935, 0.168], { bone: J.chest });
    put(box(0.007, 0.032, 0.006), P.gold, [cx + 0.013, 0.945, 0.168], { rot: [0, 0, -35], bone: J.chest });
    put(box(0.007, 0.032, 0.006), P.gold, [cx - 0.013, 0.945, 0.168], { rot: [0, 0, 35], bone: J.chest });

    // tier 1: bronze base plate with gold rim
    put(dome(0.15), P.bronze, [s * 0.405, 0.975, 0], { scale: [1, 0.65, 1.1], bone: J.chest });
    put(torus(0.15, 0.013, 5, 14), P.gold, [s * 0.405, 0.975, 0], { rot: [90, 0, 0], scale: [1, 1.1, 1], bone: J.chest });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      rivet([s * 0.405 + 0.148 * Math.cos(a), 0.99, 0.148 * 1.1 * Math.sin(a)], P.gold, 0.009, J.chest);
    }
    // tier 2: steel plate with dark ridge
    put(dome(0.125), P.steel, [s * 0.415, 1.015, 0], { scale: [1, 0.68, 1.1], bone: J.chest });
    put(torus(0.125, 0.011, 5, 14), P.steelDark, [s * 0.415, 1.015, 0], { rot: [90, 0, 0], scale: [1, 1.1, 1], bone: J.chest });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      rivet([s * 0.415 + 0.124 * Math.cos(a), 1.022, 0.124 * 1.1 * Math.sin(a)], P.gold, 0.008, J.chest);
    }
    // tier 3: bronze cap, gold rim, steel spike
    put(dome(0.09, 8, 4), P.bronze, [s * 0.425, 1.06, 0], { scale: [1, 0.75, 1.1], bone: J.chest });
    put(torus(0.09, 0.01, 5, 12), P.gold, [s * 0.425, 1.06, 0], { rot: [90, 0, 0], scale: [1, 1.1, 1], bone: J.chest });
    put(cone(0.03, 0.09, 5), P.steel, [s * 0.435, 1.155, 0], { rot: [0, 0, -s * 20], bone: J.chest });
    put(cyl(0.032, 0.032, 0.014, 5), P.gold, [s * 0.431, 1.115, 0], { rot: [0, 0, -s * 20], bone: J.chest });
    // side spikes front and back
    put(cone(0.02, 0.06, 4), P.steelDark, [s * 0.42, 1.045, 0.15], { rot: [72, 0, 0], bone: J.chest });
    put(cone(0.02, 0.06, 4), P.steelDark, [s * 0.42, 1.045, -0.15], { rot: [-72, 0, 0], bone: J.chest });
    // scuff marks on the steel
    put(box(0.04, 0.004, 0.006), P.steelDark, [s * 0.455, 1.065, 0.05], { rot: [0, 0, -s * 40], bone: J.chest });
    put(box(0.03, 0.004, 0.006), P.steelDark, [s * 0.46, 1.055, -0.04], { rot: [0, 0, -s * 30], bone: J.chest });
  }

  // ------------------------------------------------------------------ back: satchel, tool roll, hammer
  const BZ = -0.238;
  put(box(0.34, 0.15, 0.05), P.leather, [0, 0.925, BZ], { bone: J.chest });
  put(box(0.34, 0.07, 0.058), P.leatherLight, [0, 0.975, BZ], { bone: J.chest });
  put(box(0.3, 0.006, 0.062), P.leatherDark, [0, 0.94, BZ], { bone: J.chest });
  for (const s of [1, -1]) {
    put(box(0.036, 0.21, 0.064), P.leatherDark, [s * 0.08, 0.93, BZ], { bone: J.chest });
    put(box(0.04, 0.03, 0.008), P.gold, [s * 0.08, 0.945, BZ - 0.034], { bone: J.chest });
    put(box(0.014, 0.012, 0.01), P.bronze, [s * 0.08, 0.945, BZ - 0.037], { bone: J.chest });
    // side loops that hold the hammer
    put(box(0.05, 0.02, 0.04), P.leatherDark, [s * 0.19, 0.9, BZ + 0.0], { bone: J.chest });
  }
  stitchLine(
    [
      [-0.16, 0.9],
      [0.16, 0.9],
    ],
    BZ - 0.026,
    P.leatherLight,
    0.03,
  );
  // tool roll
  put(cyl(0.036, 0.036, 0.3, 8), P.leatherLight, [0, 1.065, BZ - 0.005], { rot: [0, 0, 90], bone: J.chest });
  for (const s of [1, -1]) {
    put(cyl(0.027, 0.027, 0.008, 8), P.leatherDark, [s * 0.152, 1.065, BZ - 0.005], { rot: [0, 0, 90], bone: J.chest });
    put(torus(0.019, 0.004, 4, 8), P.leather, [s * 0.157, 1.065, BZ - 0.005], { rot: [0, 90, 0], bone: J.chest });
    put(torus(0.038, 0.007, 4, 8), P.leatherDark, [s * 0.09, 1.065, BZ - 0.005], { rot: [0, 90, 0], bone: J.chest });
    put(box(0.016, 0.014, 0.01), P.gold, [s * 0.09, 1.1, BZ - 0.02], { bone: J.chest });
  }
  // hammer hanging at the satchel side
  put(cyl(0.012, 0.012, 0.32, 6), P.wood, [0.2, 0.99, BZ], { bone: J.chest });
  put(cyl(0.014, 0.014, 0.05, 6), P.woodDark, [0.2, 0.88, BZ], { bone: J.chest });
  put(box(0.1, 0.05, 0.05), P.steel, [0.2, 1.17, BZ], { bone: J.chest });
  put(box(0.016, 0.054, 0.054), P.bronze, [0.2, 1.17, BZ], { bone: J.chest });
  put(box(0.03, 0.04, 0.044), P.steelDark, [0.255, 1.17, BZ], { bone: J.chest });
  rivet([0.2, 1.17, BZ - 0.027], P.gold, 0.008, J.chest);
  // soot and scuffs on the satchel
  put(sph(0.03, 6, 4), P.soot, [-0.07, 0.975, BZ - 0.03], { scale: [1.4, 1, 0.15], bone: J.chest });
  put(sph(0.02, 6, 4), P.soot, [0.1, 0.9, BZ - 0.028], { scale: [1.2, 1, 0.15], bone: J.chest });
  put(box(0.05, 0.004, 0.004), P.leatherDark, [-0.12, 0.85, BZ - 0.026], { rot: [0, 0, 20], bone: J.chest });

  // random tiny wear specks on the bib hem
  for (let i = 0; i < 5; i++) {
    const x = -0.14 + R() * 0.28;
    put(sph(0.006 + R() * 0.005, 5, 3), P.soot, [x, 0.71 + R() * 0.03, 0.237], { scale: [1, 1, 0.2], bone: J.spine });
  }

  // ------------------------------------------------------------------ flush merged batches
  for (const bk of buckets.values()) {
    const merged = mergeGeometries(bk.geos, false);
    if (merged) b.part(merged, bk.color, { bone: bk.bone, at: [0, 0, 0] });
  }
}
    return buildTorso;
  })(),
  // head
  (() => {
function buildHead({ b, J, P, M }: Ctx) {
  type V = number[];
  const R = rng(11);
  const H = J.head;
  const JAW = J.jaw;
  const NOSE = "#cf7a5c";
  const GLINT = "#e9f4ff";
  const SK = P.skin;
  const SH = P.skinShade;
  const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  type Opt = { bone?: typeof H; rot?: V; seg?: number; rings?: number };
  const put = (geo: THREE.BufferGeometry, color: string, at: V, scale: V | null, o: Opt = {}) => {
    const opts: any = { bone: o.bone ?? H, at, flat: true };
    if (scale) opts.scale = scale;
    if (o.rot) opts.rotation = o.rot;
    return b.part(geo, color, opts);
  };
  const ell = (color: string, at: V, s: V, o: Opt = {}) =>
    put(new THREE.SphereGeometry(1, o.seg ?? 8, o.rings ?? 6), color, at, s, o);
  const box = (color: string, at: V, s: V, o: Opt = {}) => put(new THREE.BoxGeometry(1, 1, 1), color, at, s, o);
  const cyl = (color: string, at: V, s: V, o: Opt = {}) =>
    put(new THREE.CylinderGeometry(1, 1, 1, o.seg ?? 10), color, at, s, o);
  const torus = (color: string, at: V, r: number, tube: number, o: Opt = {}) =>
    put(new THREE.TorusGeometry(r, tube, 5, 14), color, at, null, o);

  const spike = (base: V, tip: V, r: number, color: string, bone: typeof H = H) =>
    b.spike(base, tip, null, r, {
      color,
      bone,
      sides: 5,
      smooth: false,
      caps: { start: "flat", end: "point" },
    } as any);

  // three stacked cones: dark root, mid body, light tip
  const blade = (
    base: THREE.Vector3,
    tip: THREE.Vector3,
    r: number,
    bone: typeof H,
    cols = [P.beardDark, P.beard, P.beardLight],
  ) => {
    const d = tip.clone().sub(base);
    const n = d.clone().normalize();
    const at = (t: number, extra = 0) => base.clone().addScaledVector(d, t).addScaledVector(n, extra).toArray();
    spike(at(0), at(1), r, cols[0], bone);
    spike(at(0.34), at(1, 0.004), r * 0.78, cols[1], bone);
    spike(at(0.62), at(1, 0.009), r * 0.55, cols[2], bone);
  };
  const tuft = (base: THREE.Vector3, tip: THREE.Vector3, r: number, bone: typeof H) => {
    const d = tip.clone().sub(base);
    const n = d.clone().normalize();
    spike(base.toArray(), tip.toArray(), r, P.beard, bone);
    spike(base.clone().addScaledVector(d, 0.45).toArray(), tip.clone().addScaledVector(n, 0.005).toArray(), r * 0.62, P.beardLight, bone);
  };

  // ---------------------------------------------------------------- skull and face
  ell(SK, [0, 1.32, 0.02], [0.15, 0.145, 0.14], { seg: 12, rings: 8 });
  ell(SK, [0, 1.26, 0.07], [0.125, 0.075, 0.1]);

  for (const s of [1, -1]) {
    // cheekbones + blush
    ell(SK, [s * 0.1, 1.28, 0.105], [0.045, 0.04, 0.045]);
    ell(SH, [s * 0.098, 1.272, 0.14], [0.03, 0.022, 0.01], { rot: [0, s * 30, 0] });
    // brow ridge (skin) and bushy brow
    box(SK, [s * 0.07, 1.364, 0.143], [0.12, 0.03, 0.05], { rot: [0, s * 20, s * 14] });
    box(P.beardDark, [s * 0.065, 1.375, 0.153], [0.105, 0.028, 0.045], { rot: [0, s * 20, s * 16] });
    spike([s * 0.09, 1.384, 0.152], [s * 0.118, 1.41, 0.135], 0.014, P.beardDark);
    spike([s * 0.065, 1.384, 0.158], [s * 0.076, 1.41, 0.152], 0.012, P.beardDark);
    // eye
    const c = v3(s * 0.063, 1.325, 0.148);
    const yaw = (s * 10 * Math.PI) / 180;
    const f = v3(Math.sin(yaw), 0, Math.cos(yaw));
    const at = (d: number, ux = 0, uy = 0) => c.clone().addScaledVector(f, d).add(v3(ux, uy, 0)).toArray();
    const rot: V = [0, s * 10, 0];
    ell(P.eyeWhite, c.toArray(), [0.034, 0.036, 0.026], { rot });
    ell(P.eyeIris, at(0.015, 0, -0.002), [0.022, 0.023, 0.012], { rot });
    ell(P.soot, at(0.024, 0, -0.002), [0.011, 0.012, 0.006], { rot, seg: 6, rings: 4 });
    ell(P.eyeWhite, at(0.028, s * 0.007, 0.008), [0.006, 0.006, 0.004], { rot, seg: 5, rings: 3 });
    ell(SK, [s * 0.063, 1.357, 0.152], [0.037, 0.011, 0.03], { rot });
    ell(SH, [s * 0.063, 1.296, 0.146], [0.034, 0.008, 0.02], { rot });
    // nose wings and nostrils
    ell(SK, [s * 0.03, 1.272, 0.165], [0.022, 0.02, 0.02]);
    ell(SH, [s * 0.016, 1.262, 0.2], [0.008, 0.005, 0.008], { seg: 5, rings: 3 });
    // ears + hoop earrings
    ell(SK, [s * 0.152, 1.31, 0.0], [0.016, 0.04, 0.032]);
    ell(SH, [s * 0.159, 1.31, 0.003], [0.01, 0.027, 0.021]);
    torus(P.gold, [s * 0.164, 1.262, 0.0], 0.016, 0.004, { rot: [0, 90, 0] });
    // sideburn on head
    ell(P.beard, [s * 0.135, 1.27, 0.04], [0.03, 0.07, 0.055]);
    ell(P.beardDark, [s * 0.14, 1.3, 0.0], [0.022, 0.04, 0.04]);
    blade(v3(s * 0.14, 1.27, 0.07), v3(s * 0.158, 1.16, 0.085), 0.026, H);
  }
  // nose
  box(SK, [0, 1.31, 0.158], [0.028, 0.05, 0.03], { rot: [-25, 0, 0] });
  ell(SK, [0, 1.285, 0.18], [0.042, 0.036, 0.04]);
  ell(NOSE, [0, 1.278, 0.205], [0.026, 0.021, 0.018]);
  // scar over the right brow
  box("#c46a52", [-0.085, 1.352, 0.177], [0.008, 0.04, 0.004], { rot: [0, -20, 25] });

  // ---------------------------------------------------------------- mouth: upper part on head, lower jaw on jaw
  ell(SK, [0, 1.2, 0.075], [0.115, 0.05, 0.09], { bone: JAW });
  ell(SK, [0, 1.19, 0.138], [0.034, 0.027, 0.03], { bone: JAW });
  box(SH, [0, 1.212, 0.158], [0.08, 0.014, 0.022], { bone: JAW });
  box(P.eyeWhite, [0, 1.222, 0.152], [0.04, 0.007, 0.008], { bone: JAW });
  box(P.beardDark, [0, 1.224, 0.156], [0.095, 0.024, 0.02]);
  box(SH, [0, 1.238, 0.158], [0.09, 0.014, 0.022]);
  box(P.eyeWhite, [0, 1.23, 0.162], [0.05, 0.007, 0.008]);
  for (const s of [1, -1]) ell(SH, [s * 0.052, 1.225, 0.152], [0.008, 0.008, 0.008], { seg: 5, rings: 4 });

  // ---------------------------------------------------------------- moustache
  for (const s of [1, -1]) {
    const pts = [
      [s * 0.004, 1.258, 0.192],
      [s * 0.045, 1.252, 0.207],
      [s * 0.09, 1.236, 0.192],
      [s * 0.125, 1.215, 0.167],
      [s * 0.15, 1.205, 0.142],
      [s * 0.168, 1.212, 0.12],
      [s * 0.168, 1.236, 0.106],
      [s * 0.155, 1.247, 0.1],
    ];
    const rad = [0.022, 0.026, 0.022, 0.017, 0.013, 0.01, 0.007, 0.004];
    b.sweep(pts, rad, { bone: H, color: P.beard, sides: 6, smooth: false } as any);
    b.sweep(
      pts.map((p) => [p[0], p[1] + 0.009, p[2] + 0.005]),
      rad.map((r) => r * 0.5),
      { bone: H, color: P.beardLight, sides: 5, smooth: false } as any,
    );
    spike([s * 0.07, 1.235, 0.2], [s * 0.085, 1.198, 0.19], 0.014, P.beardDark);
    spike([s * 0.11, 1.22, 0.18], [s * 0.122, 1.184, 0.17], 0.012, P.beardDark);
    ell(P.gold, [s * 0.168, 1.225, 0.112], [0.007, 0.007, 0.007], { seg: 6, rings: 4 });
  }

  // ---------------------------------------------------------------- hair: cap, back mass, topknot
  put(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, 1.1), P.beard, [0, 1.325, 0], [0.158, 0.153, 0.155], {
    rot: [-22, 0, 0],
  });
  ell(P.beard, [0, 1.31, -0.045], [0.15, 0.125, 0.11], { seg: 10 });
  ell(P.beardDark, [0, 1.25, -0.06], [0.11, 0.06, 0.09]);
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.05;
    tuft(v3(x, 1.3, -0.12), v3(x * 1.3, 1.19, -0.135), 0.026, H);
  }
  // topknot
  cyl(P.beard, [0, 1.478, -0.035], [0.034, 0.03, 0.034], { seg: 8 });
  ell(P.beard, [0, 1.498, -0.035], [0.042, 0.036, 0.042], { seg: 8 });
  cyl(P.gold, [0, 1.487, -0.035], [0.036, 0.011, 0.036], { seg: 8 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const up = i % 2 === 0;
    const cx = Math.cos(a);
    const cz = Math.sin(a);
    const base = v3(cx * 0.02, 1.5, -0.035 + cz * 0.02);
    const tip = up ? v3(cx * 0.036, 1.538, -0.035 + cz * 0.036) : v3(cx * 0.065, 1.472, -0.035 + cz * 0.065);
    tuft(base, tip, 0.017, H);
  }

  // ---------------------------------------------------------------- goggles pushed up on the forehead
  const gRot: V = [45, 0, 0];
  const nrm = v3(0, 0.7, 0.71);
  for (const s of [1, -1]) {
    const c = v3(s * 0.052, 1.432, 0.128);
    const p = (d: number, ux = 0, uy = 0, uz = 0) =>
      c.clone().addScaledVector(nrm, d).add(v3(ux, uy, uz)).toArray();
    cyl(P.bronze, c.toArray(), [0.036, 0.02, 0.036], { rot: gRot, seg: 10 });
    cyl(P.steel, p(0.006), [0.028, 0.02, 0.028], { rot: gRot, seg: 10 });
    cyl(GLINT, p(0.017, s * -0.008, 0.006, -0.006), [0.007, 0.004, 0.007], { rot: gRot, seg: 6 });
    ell(P.gold, p(0.004, s * 0.034, 0.002, -0.006), [0.007, 0.007, 0.007], { seg: 5, rings: 4 });
  }
  box(P.bronze, [0, 1.431, 0.128], [0.04, 0.012, 0.014], { rot: gRot });
  // strap round the head
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    const y = 1.405 + 0.02 * Math.cos(a);
    box(P.leatherDark, [0.134 * Math.sin(a), y, -0.003 + 0.138 * Math.cos(a)], [0.078, 0.02, 0.01], {
      rot: [0, i * 30, 0],
    });
  }
  {
    const a = (-80 * Math.PI) / 180;
    box(P.gold, [0.138 * Math.sin(a), 1.405 + 0.02 * Math.cos(a), -0.003 + 0.142 * Math.cos(a)], [0.026, 0.024, 0.012], {
      rot: [0, -80, 0],
    });
  }

  // ---------------------------------------------------------------- beard (rides the jaw)
  for (const s of [1, -1]) ell(P.beard, [s * 0.095, 1.17, 0.06], [0.065, 0.07, 0.1], { bone: JAW });
  ell(P.beard, [0, 1.09, 0.17], [0.16, 0.1, 0.1], { bone: JAW, seg: 9 });
  ell(P.beard, [0, 0.97, 0.195], [0.15, 0.13, 0.09], { bone: JAW, seg: 9 });
  put(new THREE.ConeGeometry(1, 1, 6), P.beard, [0, 0.875, 0.2], [0.115, 0.2, 0.09], { bone: JAW, rot: [180, 0, 0] });

  const TAB: number[][] = [
    [1.15, 0.248],
    [1.06, 0.268],
    [0.97, 0.285],
    [0.89, 0.268],
    [0.85, 0.245],
  ];
  const zf = (y: number) => {
    if (y >= TAB[0][0]) return TAB[0][1];
    for (let i = 0; i < TAB.length - 1; i++) {
      const [y0, z0] = TAB[i];
      const [y1, z1] = TAB[i + 1];
      if (y <= y0 && y >= y1) return z0 + ((z1 - z0) * (y0 - y)) / (y0 - y1);
    }
    return TAB[TAB.length - 1][1];
  };
  const zx = (x: number) => 0.07 * (x / 0.16) ** 2;
  const rows: [number, number[], number][] = [
    [1.15, [-0.1, -0.05, 0, 0.05, 0.1], 0.115],
    [1.06, [-0.125, -0.075, -0.025, 0.025, 0.075, 0.125], 0.12],
    [0.97, [-0.1, -0.05, 0, 0.05, 0.1], 0.12],
    [0.89, [-0.05, 0, 0.05], 0.11],
  ];
  for (const [y, xs, L] of rows)
    for (const x of xs) {
      const jx = x + (R() - 0.5) * 0.01;
      const base = v3(jx, y, zf(y) - 0.012 - zx(jx));
      const ty = y - L * (0.9 + R() * 0.2);
      const tip = v3(jx * 1.05, ty, zf(ty) + 0.016 - zx(jx * 1.05));
      blade(base, tip, 0.03 + R() * 0.004, JAW);
    }
  for (const s of [1, -1]) {
    blade(v3(s * 0.135, 1.24, 0.09), v3(s * 0.152, 1.12, 0.1), 0.03, JAW);
    blade(v3(s * 0.12, 1.2, 0.12), v3(s * 0.13, 1.09, 0.15), 0.028, JAW);
  }

  // ---------------------------------------------------------------- braids
  for (const s of [1, -1]) {
    for (let i = 0; i < 8; i++) {
      const y = 1.045 - 0.033 * i;
      const x = s * (0.075 + 0.004 * (i / 7)) + (i % 2 ? 0.006 : -0.006);
      const z = zf(y) - zx(0.075) + 0.014;
      ell(i % 2 ? P.beardLight : P.beard, [x, y, z], [0.024, 0.03, 0.02], {
        bone: JAW,
        rot: [0, 0, (i % 2 ? 1 : -1) * 28],
        seg: 6,
        rings: 4,
      });
    }
    const bx = s * 0.077;
    torus(P.gold, [bx, 0.985, zf(0.985) - zx(0.075) + 0.014], 0.021, 0.005, { bone: JAW, rot: [90, 0, 0] });
    torus(P.gold, [bx, 0.875, zf(0.875) - zx(0.075) + 0.014], 0.021, 0.005, { bone: JAW, rot: [90, 0, 0] });
    const tz = zf(0.8) - zx(0.075) + 0.014;
    cyl(P.leatherDark, [s * 0.079, 0.782, tz], [0.017, 0.009, 0.017], { bone: JAW, seg: 6 });
    tuft(v3(s * 0.079, 0.786, tz), v3(s * 0.083, 0.748, tz - 0.002), 0.02, JAW);
  }
}
    return buildHead;
  })(),
  // arms
  (() => {
function buildArms({ b, J, P, M }: Ctx) {
  const j = J as Record<string, any>;
  const pal = P as Record<string, string>;
  const mnt = M as Record<string, number[]>;
  const C = {
    ...pal,
    shirtLight: "#c4583c",
    shirtDark: "#7c2e1e",
    steelLight: "#c3cce0",
  } as Record<string, string>;
  const R = rng(23);

  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
  const UP = new THREE.Vector3(0, 1, 0);
  const lerpV = (a: THREE.Vector3, c: THREE.Vector3, t: number) => a.clone().lerp(c, t);

  // ---------- local frames and placement helpers ----------
  type Fr = { at: THREE.Vector3; q: THREE.Quaternion; p: (x: number, y: number, z: number) => THREE.Vector3 };
  const mkFrame = (at: THREE.Vector3, dir: THREE.Vector3, up: THREE.Vector3): Fr => {
    const q = aim(dir.clone().normalize(), up.clone()) as THREE.Quaternion;
    return { at: at.clone(), q, p: (x, y, z) => new THREE.Vector3(x, y, z).applyQuaternion(q).add(at) };
  };
  const box = (bone: any, f: Fr, size: [number, number, number], x: number, y: number, z: number, color: string) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at: f.p(x, y, z), quat: f.q.clone() });
  const cyl = (
    bone: any, f: Fr, r0: number, r1: number, len: number, sides: number,
    x: number, y: number, z: number, color: string,
  ) => b.part(new THREE.CylinderGeometry(r0, r1, len, sides), color, { bone, at: f.p(x, y, z), quat: f.q.clone() });
  const ball = (bone: any, at: THREE.Vector3, r: number, color: string) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), color, { bone, at, flat: true });
  const cylAlong = (bone: any, at: THREE.Vector3, dir: THREE.Vector3, r: number, len: number, sides: number, color: string) =>
    b.part(new THREE.CylinderGeometry(r, r, len, sides), color, { bone, at, dir });
  const bar = (bone: any, a: THREE.Vector3, c: THREE.Vector3, r: number, color: string, sides = 6) =>
    b.rod(a, c, r, color, { bone, sides, caps: "flat" });
  const soot = (hit: any, w = 0.022) =>
    b.stick(new THREE.CylinderGeometry(w, w * 1.2, 0.006, 6), C.soot, hit, { embed: 0.5 });

  // ---------- gloved hand ----------
  const hand = (bone: any, wrist: THREE.Vector3, dir: THREE.Vector3, out: number) => {
    const F = mkFrame(wrist, dir, UP);
    // cuff with gold edge
    cyl(bone, F, 0.072, 0.078, 0.055, 8, 0, -0.018, 0, C.leather);
    cyl(bone, F, 0.081, 0.081, 0.009, 8, 0, -0.047, 0, C.gold);
    cyl(bone, F, 0.079, 0.079, 0.006, 8, 0, 0.0, 0, C.leatherDark);
    // fist block (dark so gaps between fingers read as stitching)
    box(bone, F, [0.104, 0.105, 0.092], 0, 0.045, 0, C.leatherDark);
    // back-of-hand plate with stitched border and rivets
    box(bone, F, [0.088, 0.088, 0.014], 0, 0.045, 0.05, C.leatherLight);
    for (const sx of [-1, 1]) box(bone, F, [0.005, 0.09, 0.017], sx * 0.045, 0.045, 0.05, C.leatherDark);
    box(bone, F, [0.09, 0.005, 0.017], 0, 0.092, 0.05, C.leatherDark);
    for (const sx of [-1, 1]) ball(bone, F.p(sx * 0.024, 0.075, 0.058), 0.007, C.bronze);
    box(bone, F, [0.03, 0.02, 0.003], 0.012, 0.03, 0.0585, C.soot);
    // four finger blocks wrapping the tool: side pads + underside pads
    for (let i = 0; i < 4; i++) {
      const yy = 0.012 + i * 0.025;
      box(bone, F, [0.034, 0.022, 0.088], out * 0.052, yy, 0, C.leather);
      box(bone, F, [0.078, 0.022, 0.032], out * 0.0, yy, -0.05, C.leather);
      box(bone, F, [0.03, 0.022, 0.03], out * 0.046, yy, -0.04, C.leatherLight);
    }
    // thumb on top, toward the inside
    box(bone, F, [0.038, 0.078, 0.036], -out * 0.034, 0.068, 0.058, C.leather);
    box(bone, F, [0.034, 0.03, 0.034], -out * 0.034, 0.104, 0.06, C.leatherLight);
    box(bone, F, [0.04, 0.004, 0.038], -out * 0.034, 0.036, 0.058, C.leatherDark);
  };

  // ---------- one arm ----------
  const arm = (side: "L" | "R") => {
    const s = side === "L" ? 1 : -1;
    const S = side === "L" ? V([0.42, 1.02, 0]) : V([-0.42, 1.02, 0]);
    const E = side === "L" ? V([0.5, 0.82, 0.16]) : V([-0.5, 0.82, 0.18]);
    const W = V(mnt[side === "L" ? "wristL" : "wristR"]);
    const jS = j["shoulder" + side];
    const jE = j["elbow" + side];
    const jW = j["wrist" + side];

    // skin core of the upper arm, shoulder cap, elbow
    b.sweep([S, E], [0.074, 0.088, 0.076], { bone: jS, color: C.skin, sides: 10 });
    ball(jS, S, 0.1, C.shirt);
    ball(jE, E, 0.079, C.skin);

    // rolled brick-red sleeve on the upper arm
    const sleeveEnd = lerpV(S, E, 0.66);
    const ud = E.clone().sub(S).normalize();
    const sleeve = b.sweep([S, sleeveEnd], [0.102, 0.096], {
      bone: jS, color: C.shirt, sides: 10, caps: { start: "round", end: "flat" },
    });
    b.part(new THREE.TorusGeometry(0.1, 0.024, 5, 10), C.shirtLight, { bone: jS, at: sleeveEnd, dir: ud, axis: "z" });
    b.part(new THREE.TorusGeometry(0.097, 0.014, 5, 10), C.shirtDark, {
      bone: jS, at: lerpV(S, E, 0.6), dir: ud, axis: "z",
    });
    for (const t of [0.28, 0.44]) {
      b.part(new THREE.TorusGeometry(0.097, 0.006, 4, 10), C.shirtDark, {
        bone: jS, at: lerpV(S, E, t), dir: ud, axis: "z",
      });
    }
    soot(sleeve.at(0.4, 30 * s), 0.024);
    soot(sleeve.at(0.52, -50), 0.018);

    // forearm: muscular, bare, shaded underneath
    const fd = W.clone().sub(E).normalize();
    const fore = b.sweep([E, W], [0.07, 0.079, 0.07, 0.06], {
      bone: jE, color: C.skin, sides: 10, sectors: [[110, 250, C.skinShade]],
    });
    // ginger arm hair
    for (let i = 0; i < 9; i++) {
      const t = 0.12 + 0.55 * R();
      const deg = -50 + 100 * R();
      b.stick(new THREE.ConeGeometry(0.007, 0.032, 4), C.beardDark, fore.at(t, deg), { embed: 0.3 });
    }
    soot(fore.at(0.3, 40), 0.02);
    soot(fore.at(0.62, -20), 0.016);

    // heavy leather bracer with gold edges, bronze plate and rivets
    const bs = lerpV(E, W, 0.4);
    const be = lerpV(E, W, 0.8);
    const br = b.sweep([bs, be], [0.089, 0.077], {
      bone: jE, color: C.leather, sides: 8, caps: "flat",
    });
    for (const [pt, rr] of [[bs, 0.089], [be, 0.077]] as [THREE.Vector3, number][]) {
      cylAlong(jE, pt, fd, rr * 1.09 + 0.004, 0.012, 12, C.gold);
    }
    const top = br.at(0.5, 0);
    b.stick(new THREE.BoxGeometry(0.052, 0.012, 0.11), C.bronze, top, { embed: 0.3 });
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        b.stick(new THREE.SphereGeometry(0.0075, 5, 4), C.gold, top.moved([sx * 0.018, 0.009, sz * 0.04]), {
          embed: 0.3,
        });
    for (const sx of [-1, 1])
      b.stick(new THREE.BoxGeometry(0.01, 0.008, 0.1), C.leatherDark, br.at(0.5, sx * 55), { embed: 0.3 });
    soot(br.at(0.7, -35), 0.016);
    return { W, jW, E, fd };
  };

  const aL = arm("L");
  const aR = arm("R");

  // ================= RIGHT HAND + HAMMER (-X) =================
  {
    const bone = aR.jW;
    const wR = aR.W;
    const hh = V(mnt.hammerHead);
    const u = hh.clone().sub(wR).normalize();
    const v = UP.clone().sub(u.clone().multiplyScalar(UP.dot(u))).normalize(); // head long axis, face down
    hand(bone, wR, u, 1);

    // wooden handle with wraps and leather end cap
    const S0 = wR.clone().addScaledVector(u, -0.035);
    const E0 = hh.clone().addScaledVector(u, 0.05);
    const len = S0.distanceTo(E0);
    b.part(new THREE.CylinderGeometry(0.021, 0.025, len, 8), C.wood, {
      bone, at: lerpV(S0, E0, 0.5), dir: u,
    });
    for (let i = 0; i < 5; i++)
      cylAlong(bone, wR.clone().addScaledVector(u, 0.115 + i * 0.022), u, 0.0265, 0.011, 8, C.woodDark);
    cylAlong(bone, hh.clone().addScaledVector(u, -0.075), u, 0.027, 0.022, 8, C.leather);
    cylAlong(bone, S0.clone().addScaledVector(u, -0.004), u, 0.031, 0.02, 8, C.leather);
    ball(bone, S0.clone().addScaledVector(u, -0.015), 0.022, C.leatherDark);

    // hammer head
    const hf = mkFrame(hh, v, u); // Y = long axis (face at -y), Z = along handle
    box(bone, hf, [0.11, 0.15, 0.11], 0, 0, 0, C.steel);
    box(bone, hf, [0.124, 0.04, 0.124], 0, -0.095, 0, C.steelDark);
    box(bone, hf, [0.105, 0.05, 0.08], 0, 0.1, 0, C.steel);
    box(bone, hf, [0.08, 0.03, 0.05], 0, 0.138, 0, C.steelDark);
    box(bone, hf, [0.118, 0.02, 0.118], 0, -0.05, 0, C.bronze);
    box(bone, hf, [0.118, 0.02, 0.118], 0, 0.052, 0, C.bronze);
    box(bone, hf, [0.07, 0.003, 0.07], 0, -0.1165, 0, C.soot);
    for (const sx of [-1, 1]) {
      ball(bone, hf.p(sx * 0.059, 0.0, 0.0), 0.013, C.gold);
      for (const sz of [-1, 1]) ball(bone, hf.p(sx * 0.061, -0.05, sz * 0.038), 0.008, C.gold);
      box(bone, hf, [0.004, 0.06, 0.014], sx * 0.056, 0.02, -0.04, C.steelLight);
      box(bone, hf, [0.004, 0.02, 0.1], sx * 0.063, -0.095, 0, C.steel);
    }
    cylAlong(bone, hf.p(0, 0, 0.058), u, 0.03, 0.014, 8, C.steelDark);
    cylAlong(bone, hf.p(0, 0, 0.066), u, 0.017, 0.008, 6, C.woodDark);
  }

  // ================= LEFT HAND + TONGS (+X) =================
  {
    const bone = aL.jW;
    const wL = aL.W;
    const g = V(mnt.tongGrip);
    const tL = g.clone().sub(wL).normalize();
    hand(bone, wL, tL, -1);

    const Pv = wL.clone().addScaledVector(tL, 0.12);
    const sd = new THREE.Vector3(tL.z, 0, -tL.x).normalize();
    const nrm = tL.clone().cross(sd).normalize();
    const Lh = 0.32;

    for (const k of [1, -1]) {
      const butt = Pv.clone().addScaledVector(tL, -Lh).addScaledVector(sd, k * 0.065);
      bar(bone, butt, Pv, 0.013, C.iron, 6);
      // leather grip with wraps
      bar(bone, lerpV(butt, Pv, 0.16), lerpV(butt, Pv, 0.8), 0.021, C.leather, 8);
      for (const f of [0.28, 0.4, 0.52, 0.64]) {
        cylAlong(bone, lerpV(butt, Pv, f), butt.clone().sub(Pv), 0.0235, 0.008, 8, C.leatherDark);
      }
      ball(bone, butt, 0.02, C.iron);
      ball(bone, lerpV(butt, Pv, 0.08), 0.015, C.steelDark);
    }

    // jaw arms: crossed past the pivot, one over the bar to the far plate, one to the near plate
    const yP = 0.787;
    const farTop = new THREE.Vector3(g.x, 0.806, g.z + 0.03);
    const nearTop = new THREE.Vector3(g.x, 0.806, g.z - 0.03);
    const q1 = new THREE.Vector3(g.x - 0.02, 0.85, g.z - 0.012);
    bar(bone, Pv, q1, 0.012, C.iron, 6);
    bar(bone, q1, farTop, 0.012, C.iron, 6);
    ball(bone, q1, 0.013, C.iron);
    const q2 = new THREE.Vector3(g.x - 0.015, 0.83, g.z - 0.04);
    bar(bone, Pv, q2, 0.012, C.iron, 6);
    bar(bone, q2, nearTop, 0.012, C.iron, 6);
    ball(bone, q2, 0.013, C.iron);

    // flat jaw plates clamping the bar's end
    for (const sz of [-1, 1]) {
      const z = g.z + sz * 0.03;
      b.part(new THREE.BoxGeometry(0.08, 0.046, 0.01), C.iron, { bone, at: new THREE.Vector3(g.x, yP, z) });
      b.part(new THREE.BoxGeometry(0.034, 0.02, 0.018), C.iron, { bone, at: new THREE.Vector3(g.x, 0.812, z) });
      for (let i = -1; i <= 1; i++)
        b.part(new THREE.BoxGeometry(0.066, 0.004, 0.004), C.steelDark, {
          bone, at: new THREE.Vector3(g.x, yP + i * 0.013, z - sz * 0.0055),
        });
      b.part(new THREE.BoxGeometry(0.082, 0.004, 0.012), C.steelDark, {
        bone, at: new THREE.Vector3(g.x, yP - 0.022, z),
      });
    }

    // bronze pivot rivet
    cylAlong(bone, Pv, nrm, 0.017, 0.05, 8, C.bronze);
    for (const k of [-1, 1]) ball(bone, Pv.clone().addScaledVector(nrm, k * 0.027), 0.013, C.gold);
    cylAlong(bone, Pv, nrm, 0.026, 0.02, 8, C.steelDark);
    // soot on the iron
    b.part(new THREE.BoxGeometry(0.03, 0.004, 0.02), C.soot, {
      bone, at: Pv.clone().addScaledVector(tL, 0.045).add(new THREE.Vector3(0, 0.02, 0)),
    });
  }
}
    return buildArms;
  })(),
  // anvilStation
  (() => {
function buildAnvilStation({ b, J, P, M }: Ctx) {
  const D = Math.PI / 180;
  const r = rng(11);
  const CX = M.stumpCenter[0];
  const CZ = M.stumpCenter[2];
  const bone = J.hips;

  // a few own colours beside the palette
  const WOOD_LIGHT = "#a67a48";
  const STEEL_LIGHT = "#c5cee0";
  const SCORCH = "#6b2e14";

  type V = [number, number, number];
  type PO = NonNullable<Parameters<typeof b.part>[2]>;

  // yaw applied last, tilts local: gives radial placement around the stump
  const Q = (x: number, y: number, z: number) =>
    new THREE.Quaternion().setFromEuler(new THREE.Euler(x * D, y * D, z * D, "YXZ"));
  const polar = (rad: number, deg: number, y: number): V => [
    CX + rad * Math.sin(deg * D),
    y,
    CZ + rad * Math.cos(deg * D),
  ];
  const put = (geo: THREE.BufferGeometry, color: string, at: V, o: PO = {}) =>
    b.part(geo, color, { bone, at, flat: true, ...o });
  const box = (w: number, h: number, d: number, color: string, at: V, o: PO = {}) =>
    put(new THREE.BoxGeometry(w, h, d), color, at, o);
  const ball = (rad: number, color: string, at: V) => put(new THREE.SphereGeometry(rad, 6, 4), color, at);

  // stump vertex radius at height y (10-sided, tapering)
  const R = (y: number) => 0.27 - (0.025 * y) / 0.42;

  // ---------------------------------------------------------------- stump
  put(new THREE.CylinderGeometry(0.245, 0.27, 0.42, 10), P.wood, [CX, 0.21, CZ]);

  // top ring surface, lighter, with growth rings and cracks
  put(new THREE.CylinderGeometry(0.245, 0.245, 0.012, 10), WOOD_LIGHT, [CX, 0.42, CZ]);
  for (const rad of [0.14, 0.17, 0.195, 0.215]) {
    put(new THREE.TorusGeometry(rad, 0.0035, 3, 24), P.woodDark, [CX - 0.012, 0.4265, CZ + 0.008], {
      rotation: [90, 0, 0],
      scale: [1.05, 1, 1],
    });
  }
  for (const a of [20, 215, 330]) {
    box(0.006, 0.003, 0.1, P.woodDark, polar(0.17, a, 0.4272), { quat: Q(0, a, 0) });
  }

  // bark ridges on the vertices of the faceted trunk
  for (let k = 0; k < 10; k++) {
    const a = k * 36;
    // mid ridges, between the hoops
    const hm = 0.12 + 0.03 * r();
    const wm = 0.034 + 0.016 * r();
    box(wm, hm, 0.03, P.woodDark, polar(R(0.26) - 0.003, a, 0.26 + (r() - 0.5) * 0.02), { quat: Q(-3.5, a, 0) });
    if (k % 2 === 0) {
      box(0.036 + 0.01 * r(), 0.1 + 0.03 * r(), 0.03, P.woodDark, polar(R(0.085) - 0.003, a, 0.085), {
        quat: Q(-3.5, a, 0),
      });
    } else {
      box(0.03 + 0.01 * r(), 0.045, 0.03, P.woodDark, polar(R(0.395) - 0.003, a, 0.395), { quat: Q(-3.5, a, 0) });
    }
  }
  // lighter bark strips on a few faces
  for (let k = 0; k < 10; k += 2) {
    const a = 18 + 36 * k;
    box(0.022, 0.1, 0.012, WOOD_LIGHT, polar(R(0.26) * Math.cos(18 * D) + 0.001, a, 0.26), { quat: Q(-3.5, a, 0) });
  }

  // root flares dipping into the floor
  for (let i = 0; i < 7; i++) {
    const a = (i * 360) / 7 + 12;
    b.rod(polar(0.22, a, 0.13), polar(0.295, a, 0.022), [0.05, 0.022], P.wood, { bone, sides: 6 });
  }

  // steel hoops with rivets
  for (const [hy, every] of [
    [0.35, 1],
    [0.17, 2],
  ] as const) {
    put(new THREE.CylinderGeometry(R(hy + 0.02) + 0.014, R(hy - 0.02) + 0.014, 0.04, 10), P.steel, [CX, hy, CZ]);
    for (const dy of [-0.0185, 0.0185]) {
      const rr = R(hy + dy) + 0.0165;
      put(new THREE.CylinderGeometry(rr, rr, 0.007, 10), P.steelDark, [CX, hy + dy, CZ]);
    }
    for (let k = 0; k < 10; k += every) {
      const rad = (R(hy) + 0.014) * Math.cos(18 * D) + 0.002;
      ball(0.0105, P.bronze, polar(rad, 18 + 36 * k, hy));
    }
  }

  // deep axe-cut notches
  for (const a of [54, 162, 270]) {
    const t: V = [Math.cos(a * D), 0, -Math.sin(a * D)];
    const lip: [number, number][] = [
      [-0.055, -0.02],
      [0.055, -0.03],
      [0.0, -0.078],
    ];
    const cut: [number, number][] = [
      [-0.065, 0.055],
      [0.065, 0.04],
      [0.0, -0.045],
    ];
    b.extrude(lip, { at: polar(0.237, a, 0.27), x: t, thickness: 0.026, color: WOOD_LIGHT, bone });
    b.extrude(cut, { at: polar(0.238, a, 0.27), x: t, thickness: 0.03, color: P.soot, bone });
  }

  // ---------------------------------------------------------------- anvil
  const Z = CZ;
  // base
  b.frustumBox([0, 0.42, Z], [0, 0.465, Z], [0.4, 0.2], [0.38, 0.19], { color: P.iron, bone });
  b.frustumBox([0, 0.465, Z], [0, 0.5, Z], [0.34, 0.18], [0.3, 0.16], { color: P.iron, bone });
  for (const s of [1, -1]) box(0.38, 0.007, 0.008, P.bronze, [0, 0.4655, Z + s * 0.093]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) ball(0.0085, P.gold, [sx * 0.178, 0.467, Z + sz * 0.083]);

  // waist
  b.frustumBox([0, 0.5, Z], [0, 0.58, Z], [0.24, 0.15], [0.15, 0.11], { color: P.iron, bone });
  b.frustumBox([0, 0.58, Z], [0, 0.64, Z], [0.15, 0.11], [0.2, 0.14], { color: P.iron, bone });
  b.frustumBox([0, 0.568, Z], [0, 0.592, Z], [0.162, 0.122], [0.162, 0.122], { color: P.bronze, bone });

  // body: lower and upper block, heel, face plate
  box(0.62, 0.04, 0.18, P.steelDark, [-0.03, 0.66, Z]);
  box(0.66, 0.06, 0.22, P.steelDark, [-0.03, 0.71, Z]);
  box(0.1, 0.08, 0.18, P.steelDark, [-0.41, 0.68, Z]);
  box(0.68, 0.02, 0.23, P.steel, [-0.03, 0.75, Z]);

  // horn: squashed cone tapering to +X, tip rising a little
  const hornQ = Q(0, 0, -86);
  put(new THREE.CylinderGeometry(0.012, 0.085, 0.4, 8), P.steelDark, [0.46, 0.718, Z], {
    quat: hornQ,
    scale: [0.62, 1, 1],
  });
  put(new THREE.CylinderGeometry(0.0785, 0.0785, 0.014, 8), P.bronze, [0.31, 0.7075, Z], {
    quat: hornQ,
    scale: [0.62, 1, 1],
  });
  put(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 8), P.bronze, [0.45, 0.7173, Z], {
    quat: hornQ,
    scale: [0.62, 1, 1],
  });

  // bronze edge strips
  for (const s of [1, -1]) box(0.66, 0.006, 0.01, P.bronze, [-0.03, 0.762, Z + s * 0.108]);
  for (const s of [1, -1]) box(0.09, 0.006, 0.008, P.bronze, [-0.41, 0.722, Z + s * 0.083]);

  // hardy hole and pritchel hole
  box(0.034, 0.003, 0.034, P.soot, [-0.27, 0.7605, Z]);
  put(new THREE.CylinderGeometry(0.017, 0.017, 0.004, 8), P.soot, [-0.415, 0.7215, Z]);

  // gold studs on the body sides
  for (const x of [-0.28, -0.1, 0.08, 0.24]) {
    ball(0.011, P.gold, [x, 0.71, Z - 0.11 - 0.001]);
    ball(0.011, P.gold, [x, 0.71, Z + 0.11 + 0.001]);
  }

  // soot on the sides
  box(0.12, 0.025, 0.004, P.soot, [-0.15, 0.66, Z - 0.0905]);
  box(0.08, 0.02, 0.004, P.soot, [0.12, 0.665, Z - 0.0905]);
  box(0.1, 0.025, 0.004, P.soot, [-0.05, 0.66, Z + 0.0905]);
  box(0.09, 0.02, 0.004, P.soot, [0.17, 0.665, Z + 0.0905]);

  // face wear: scorch under the bar, soot, hammer dents, scuffs
  box(0.34, 0.0025, 0.075, SCORCH, [0.12, 0.7615, Z]);
  put(new THREE.CylinderGeometry(0.03, 0.03, 0.003, 7), P.soot, [0.18, 0.7615, Z - 0.055], { scale: [1.6, 1, 0.9] });
  put(new THREE.CylinderGeometry(0.03, 0.03, 0.003, 7), P.soot, [-0.17, 0.7615, Z + 0.065], { scale: [1.2, 1, 1] });
  put(new THREE.CylinderGeometry(0.009, 0.009, 0.003, 6), P.iron, [-0.12, 0.7617, Z - 0.05]);
  put(new THREE.CylinderGeometry(0.007, 0.007, 0.003, 6), P.iron, [0.1, 0.7617, Z + 0.07]);
  for (let i = 0; i < 6; i++) {
    const side = i % 2 ? 1 : -1;
    box(0.05 + 0.04 * r(), 0.002, 0.004, STEEL_LIGHT, [-0.32 + r() * 0.58, 0.7612, Z + side * (0.04 + r() * 0.05)], {
      quat: Q(0, r() * 180, 0),
    });
  }

  // ---------------------------------------------------------------- hot bar
  const sx = M.workpieceStart[0];
  const ex = M.workpieceEnd[0];
  const by = M.workpieceStart[1];
  const cutL = sx + 0.09;
  const cutR = ex - 0.07;
  glow(box(0.09, 0.032, 0.04, P.hotEdge, [(sx + cutL) / 2, by - 0.001, Z]), 1.5);
  glow(box(0.07, 0.032, 0.04, P.hotEdge, [(cutR + ex) / 2, by - 0.001, Z]), 1.5);
  glow(box(cutR - cutL, 0.034, 0.042, P.hotMid, [(cutL + cutR) / 2, by, Z]), 1.8);
  glow(box(0.3, 0.006, 0.018, P.hotCore, [(cutL + cutR) / 2, by + 0.0185, Z]), 2);
  for (const s of [1, -1])
    glow(box(0.28, 0.012, 0.004, P.hotCore, [(cutL + cutR) / 2, by, Z + s * 0.0215]), 2);

  // ---------------------------------------------------------------- sparks
  const sparkAt: [V, number][] = [
    [[0.12, 0.86, Z - 0.04], 0.011],
    [[0.2, 0.9, Z + 0.04], 0.009],
    [[0.27, 0.84, Z - 0.03], 0.012],
    [[0.33, 0.92, Z + 0.02], 0.008],
    [[0.08, 0.83, Z + 0.06], 0.008],
    [[0.17, 0.94, Z - 0.02], 0.01],
    [[0.37, 0.87, Z + 0.06], 0.009],
    [[-0.19, 0.87, Z + 0.06], 0.009],
    [[-0.23, 0.91, Z - 0.05], 0.008],
    [[-0.15, 0.83, Z - 0.04], 0.011],
    [[0.24, 0.81, Z + 0.07], 0.007],
  ];
  const sparkCols = [P.hotCore, P.hotMid, P.hotEdge];
  sparkAt.forEach(([at, rad], i) => {
    glow(put(new THREE.IcosahedronGeometry(rad, 0), sparkCols[i % 3], at, { rotation: [i * 37, i * 61, 0] }), 1.7);
  });
  const streak = (a: V, c: V, col: string) => glow(b.rod(a, c, [0.0055, 0.0015], col, { bone, sides: 4 }), 1.6);
  streak([0.2, 0.83, Z + 0.01], [0.235, 0.875, Z + 0.045], P.hotMid);
  streak([0.3, 0.82, Z - 0.02], [0.33, 0.86, Z - 0.06], P.hotCore);
  streak([-0.1, 0.82, Z + 0.03], [-0.15, 0.86, Z + 0.06], P.hotEdge);

  // ---------------------------------------------------------------- chisel and slag
  const A: V = [-0.13, 0.437, 0.745];
  const B: V = [0.04, 0.437, 0.8];
  const dirAB: V = [B[0] - A[0], 0, B[2] - A[2]];
  b.rod(A, B, 0.011, P.iron, { bone, sides: 6 });
  put(new THREE.CylinderGeometry(0.016, 0.014, 0.012, 6), P.steelDark, [A[0], A[1], A[2]], { dir: dirAB });
  b.rod([A[0] + 0.03, A[1], A[2] + 0.01], [A[0] + 0.06, A[1], A[2] + 0.02], 0.0125, P.bronze, { bone, sides: 6 });
  b.spike(B, dirAB, 0.03, 0.011, { color: STEEL_LIGHT, bone, sides: 6 });

  const chips: [number, number, number, string][] = [
    [0.17, 0.13, 0.02, P.soot],
    [-0.19, 0.13, 0.016, P.iron],
    [0.12, -0.18, 0.018, P.steelDark],
    [-0.15, -0.17, 0.014, P.soot],
    [0.34, 0.1, 0.022, P.iron],
    [-0.33, 0.14, 0.018, P.soot],
    [0.36, -0.1, 0.016, P.steelDark],
  ];
  chips.forEach(([dx, dz, rad, col], i) => {
    const onStump = Math.hypot(dx, dz) < 0.25;
    const base = onStump ? 0.426 : 0;
    put(new THREE.DodecahedronGeometry(rad, 0), col, [CX + dx, base + rad * 0.5, CZ + dz], {
      scale: [1.2, 0.6, 0.9],
      rotation: [r() * 20, i * 53, r() * 20],
    });
  });
}
    return buildAnvilStation;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "dwarfBlacksmith" });
  const J: Record<string, Joint> = {};
  J["hips"] = b.joint("hips", { at: [0,0.58,0], dir: [0,1,0], role: "spine" });
  J["spine"] = b.joint("spine", { parent: J["hips"], at: [0,0.7,0], dir: [0,1,0], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["spine"], at: [0,0.9,0], dir: [0,1,0], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["chest"], at: [0,1.12,0], dir: [0,1,0], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,1.2,0.02], dir: [0,1,0], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.25,0], dir: [0,-0.3,1], role: "jaw" });
  J["hipL"] = b.joint("hipL", { parent: J["hips"], at: [0.17,0.58,0], dir: [0,-1,0.1], role: "leg", group: "legs" });
  J["kneeL"] = b.joint("kneeL", { parent: J["hipL"], at: [0.17,0.34,0.04], dir: [0,-1,-0.1], role: "leg", group: "legs" });
  J["ankleL"] = b.joint("ankleL", { parent: J["kneeL"], at: [0.17,0.12,0], dir: [0,-0.3,1], role: "leg", group: "legs" });
  J["toeL"] = b.joint("toeL", { parent: J["ankleL"], at: [0.17,0.05,0.13], dir: [0,0,1], role: "leg", group: "legs" });
  J["hipR"] = b.joint("hipR", { parent: J["hips"], at: [-0.17,0.58,0], dir: [0,-1,0.1], role: "leg", group: "legs" });
  J["kneeR"] = b.joint("kneeR", { parent: J["hipR"], at: [-0.17,0.34,0.04], dir: [0,-1,-0.1], role: "leg", group: "legs" });
  J["ankleR"] = b.joint("ankleR", { parent: J["kneeR"], at: [-0.17,0.12,0], dir: [0,-0.3,1], role: "leg", group: "legs" });
  J["toeR"] = b.joint("toeR", { parent: J["ankleR"], at: [-0.17,0.05,0.13], dir: [0,0,1], role: "leg", group: "legs" });
  J["shoulderL"] = b.joint("shoulderL", { parent: J["chest"], at: [0.42,1.02,0], dir: [0.08,-0.2,0.16], role: "arm", group: "arms" });
  J["elbowL"] = b.joint("elbowL", { parent: J["shoulderL"], at: [0.5,0.82,0.16], dir: [-0.17,0.04,0.24], role: "arm", group: "arms" });
  J["wristL"] = b.joint("wristL", { parent: J["elbowL"], at: [0.33,0.86,0.4], dir: [0.07,-0.06,0.2], role: "arm", group: "arms" });
  J["shoulderR"] = b.joint("shoulderR", { parent: J["chest"], at: [-0.42,1.02,0], dir: [-0.08,-0.2,0.18], role: "arm", group: "arms" });
  J["elbowR"] = b.joint("elbowR", { parent: J["shoulderR"], at: [-0.5,0.82,0.18], dir: [0.17,0.1,0.2], role: "arm", group: "arms" });
  J["wristR"] = b.joint("wristR", { parent: J["elbowR"], at: [-0.33,0.92,0.38], dir: [0.3,0.06,0.22], role: "arm", group: "arms" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
