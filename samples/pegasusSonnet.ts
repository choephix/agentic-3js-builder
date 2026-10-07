import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import type { Fill } from "../src/context";
import { DEG } from "../src/math";
import { limb } from "../src/ik";
import { catmull, polyline } from "../src/path";
import { countershade, mottle, noise, paint, spots } from "../src/paint";
import type { Chain, Joint } from "../src/skeleton";
import { svg } from "../src/texture";

export const meta = {
  name: "Pegasus",
  description:
    "A pearl-white winged horse with spread, layered feather wings, a flowing blue-violet mane and tail, golden hooves and a gem-set brow band.",
  style: "low-poly",
  commit: "88fc1f0",
};

const COAT = "#f3f4fb";
const BELLY = "#cdd3ec";
const SOCK = "#aebcf0";
const PINK = "#f1c3d2";
const PINK_D = "#b5607f";
const GOLD = "#e8b83a";
const GOLD_D = "#a97a1c";
const GOLD_L = "#ffe07a";
const GEM = "#3d7bff";
const GEM_L = "#9fd0ff";
const MANE_D = "#4f5fe0";
const MANE_M = "#7f8cf2";
const MANE_L = "#b9aaf8";
const MANE_P = "#f3aedb";
const TEETH = "#fffaf0";

type Vec = THREE.Vector3;

export default function build() {
  const b = createBuilder({ name: "pegasus", paintSize: 2048 });
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const UP = v(0, 1, 0);
  const facet = (p: { at(t: number): THREE.Vector3 }, n: number, closed = true) =>
    polyline(
      Array.from({ length: n }, (_, i) => p.at(closed ? i / n : i / (n - 1))),
      { closed },
    );
  const interp = (keys: readonly (readonly [number, number])[]) => (t: number) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const [t0, a] = keys[i - 1];
        const [t1, c] = keys[i];
        return a + ((c - a) * (t - t0)) / (t1 - t0);
      }
    }
    return keys[keys.length - 1][1];
  };

  // ------------------------------------------------------------------ skeleton
  const Y0 = 0.1; // body lift over the first draft: longer legs
  const hips = b.joint("hips", { at: [0, 1.22 + Y0, -0.6] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.22 + Y0, -0.6],
      [0, 1.22 + Y0, -0.15],
      [0, 1.25 + Y0, 0.3],
      [0, 1.28 + Y0, 0.5],
    ]),
    { parent: hips, role: "spine", names: ["spine1", "spine2", "spine3"] },
  );
  const chest = spine.joints[2];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.42 + Y0, 0.48],
      [0, 1.7 + Y0, 0.7],
      [0, 1.99 + Y0, 0.9],
      [0, 2.14 + Y0, 1.12],
    ]),
    { parent: chest, role: "neck", names: ["neck1", "neck2", "neck3"] },
  );

  const D = v(0, -0.5, 0.866).normalize();
  const U = v(0, 0.866, 0.5).normalize();
  const P0 = neck.at(1).at.clone();
  const HS = 1.18; // head scale
  const hp = (f: number, u: number, x = 0) =>
    P0.clone().addScaledVector(D, f * HS).addScaledVector(U, u * HS).add(v(x * HS, 0, 0));
  const head = b.joint("head", { parent: neck.joints[2], at: P0, dir: D, role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: hp(0.1, -0.1), aim: hp(0.56, -0.13), role: "jaw" });
  const ears: Joint[] = [];
  for (const s of [1, -1])
    ears.push(
      b.joint(`ear${s > 0 ? "L" : "R"}`, {
        parent: head,
        at: hp(-0.03, 0.1, s * 0.07),
        dir: [s * 0.4, 0.8, -0.35],
        role: "hinge",
      }),
    );

  // legs
  type Leg = { s: number; chain: Chain; front: boolean };
  const legs: Leg[] = [];
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const fpts = limb(
      [s * 0.2, 1.1 + Y0, 0.5],
      [s * 0.19, 0.1, 0.56],
      [0.32, 0.4, 0.32, 0.15],
      [
        [0, 0, -1],
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    legs.push({
      s,
      front: true,
      chain: b.chain(`legF${k}`, fpts, {
        parent: chest,
        role: "leg",
        names: [`shoulder${k}`, `elbow${k}`, `knee${k}`, `fetlock${k}`, `hoof${k}`],
        contact: [s * 0.19, 0, 0.56],
      }),
    });
    const hpts = limb(
      [s * 0.2, 1.12 + Y0, -0.6],
      [s * 0.18, 0.1, -0.8],
      [0.48, 0.48, 0.32, 0.13],
      [
        [0, 0, 1],
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    legs.push({
      s,
      front: false,
      chain: b.chain(`legH${k}`, hpts, {
        parent: hips,
        role: "leg",
        names: [`hip${k}`, `stifle${k}`, `hock${k}`, `fetlockH${k}`, `hoofH${k}`],
        contact: [s * 0.18, 0, -0.8],
      }),
    });
  }

  // tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.3 + Y0, -0.88],
      [0, 1.3 + Y0, -1.15],
      [0, 1.1 + Y0, -1.42],
      [0, 0.8 + Y0, -1.6],
      [0, 0.45, -1.58],
    ]),
    { parent: hips, role: "tail", names: ["tail1", "tail2", "tail3", "tail4"] },
  );

  // wings
  type WingFeather = {
    cls: "pri" | "sec" | "ter" | "gc" | "mc" | "lc" | "alula";
    t: number;
    phi: number;
    L: number;
    W: number;
    lift: number;
    group: string;
    dir: Vec;
    root: Vec;
  };
  type Wing = {
    s: number;
    k: string;
    chain: Chain;
    groups: Record<string, Joint>;
    feathers: WingFeather[];
  };
  const wings: Wing[] = [];
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const armPts = [
      v(s * 0.26, 1.58 + Y0, 0.3),
      v(s * 0.85, 1.95 + Y0, 0.0),
      v(s * 1.5, 2.3 + Y0, 0.4),
      v(s * 2.05, 2.52 + Y0, 0.3),
    ];
    const arm = catmull(armPts);
    const chain = b.chain(`wing${k}`, arm, {
      parent: chest,
      role: "wing",
      names: [`wingShoulder${k}`, `wingElbow${k}`, `wingWrist${k}`, `wingTip${k}`],
    });
    const dirFor = (phi: number, slope: number) => {
      const r = phi * DEG;
      return v(s * Math.cos(r), slope * Math.cos(r) - 0.1 * Math.sin(r), -Math.sin(r)).normalize();
    };
    const list: WingFeather[] = [];
    const mk = (
      cls: WingFeather["cls"],
      t: number,
      phi: number,
      L: number,
      W: number,
      lift: number,
      group: string,
      slope = 0.42,
    ) => {
      list.push({
        cls,
        t,
        phi,
        L,
        W,
        lift,
        group,
        dir: dirFor(phi, slope),
        root: arm.at(t).clone().add(v(0, lift, -0.015)),
      });
    };
    const priL = [0.62, 0.78, 0.88, 0.94, 0.97, 0.96, 0.92, 0.88, 0.84];
    const secL = [0.8, 0.79, 0.78, 0.77, 0.75, 0.73, 0.72, 0.7, 0.69, 0.67];
    const terL = [0.62, 0.56, 0.5, 0.45];
    const flight: WingFeather[] = [];
    for (let i = 0; i < 9; i++) {
      mk("pri", 0.97 - i * 0.026, 8 + i * 6.5, priL[i], 0.088, 0.004 * i, `pri${Math.floor(i / 3) + 1}`);
    }
    for (let i = 0; i < 10; i++) {
      mk("sec", 0.72 - i * 0.045, 68 + i * 3, secL[i], 0.092, 0.004 * i, `sec${i < 4 ? 1 : i < 7 ? 2 : 3}`, 0.15);
    }
    for (let i = 0; i < 4; i++) mk("ter", 0.25 - i * 0.065, 100 + i * 6, terL[i], 0.095, 0.004 * i, "ter", 0.06);
    flight.push(...list);
    flight.forEach((f, i) => {
      if (f.cls === "ter") return;
      const sl = f.cls === "pri" ? 0.42 : 0.15;
      mk("gc", f.t, f.phi, f.cls === "pri" ? 0.36 : 0.34, 0.07, 0.03 + f.lift, f.group, sl);
      if (i % 2 === 0) {
        mk("mc", f.t - 0.01, f.phi + 2, 0.23, 0.055, 0.05 + f.lift, f.group, sl);
        mk("lc", f.t - 0.015, f.phi + 4, 0.15, 0.047, 0.07 + f.lift, f.group, sl);
      }
    });
    for (let i = 0; i < 15; i++) {
      const t = 0.05 + i * 0.062;
      const near = flight.reduce((a, f) => (Math.abs(f.t - t) < Math.abs(a.t - t) ? f : a));
      mk("lc", t, 80 + 6 * Math.sin(i), 0.2, 0.058, 0.07, near.group, near.cls === "pri" ? 0.42 : 0.15);
      list[list.length - 1].root.z += 0.045;
    }
    for (let i = 0; i < 3; i++) mk("alula", 0.78 + i * 0.012, -36 + i * 14, 0.24 - i * 0.03, 0.04, 0.085 + i * 0.004, "alula", 0.42);

    const groups: Record<string, Joint> = {};
    const names = [...new Set(list.map((f) => f.group))];
    for (const g of names) {
      const members = list.filter((f) => f.group === g && f.cls !== "gc" && f.cls !== "mc" && f.cls !== "lc");
      const mean = members.reduce((a, f) => a.add(f.dir), v(0, 0, 0)).normalize();
      const rootMean = members.reduce((a, f) => a.add(f.root), v(0, 0, 0)).multiplyScalar(1 / members.length);
      const parent = g.startsWith("sec") ? chain.joints[1] : g === "ter" ? chain.joints[0] : chain.joints[2];
      groups[g] = b.joint(`${g}${k}`, { parent, at: rootMean, dir: mean, role: "fan" });
    }
    wings.push({ s, k, chain, groups, feathers: list });
  }

  // ------------------------------------------------------------------ paints
  const coatBase = countershade(spots(mottle(COAT, "#e6e9f8", { size: 0.22 }), "#d8ddf3", { size: 0.12, amount: 0.3, seed: 4 }), BELLY, { level: -0.2 });
  const coat = paint((p) => (p.y < 0.3 + 0.07 * noise(p, 0.07, 5) ? SOCK : coatBase));
  const muzzle = hp(0.6, -0.05);
  const headCoat = paint((p) => (p.distanceTo(muzzle) < 0.14 ? PINK : coat));

  const featherPaint = (L: number, W: number, root: string, mid: string, tip: string, quill: string) =>
    paint((_p, _n, s) => {
      const u = s[0] / L;
      const a = Math.abs(s[1]) / W;
      if (a < 0.09 && u > 0.03 && u < 0.97) return quill;
      if (u > 0.76 - 0.14 * a) return tip;
      if (u > 0.48 - 0.12 * a) return mid;
      return root;
    });

  const featherOutline = (L: number, W: number) =>
    [
      [0, -0.3 * W],
      [0.2 * L, -0.55 * W],
      [0.6 * L, -0.66 * W],
      [0.86 * L, -0.55 * W],
      [0.96 * L, -0.28 * W],
      [L, 0.02 * W, "sharp"],
      [0.95 * L, 0.45 * W],
      [0.82 * L, 0.85 * W],
      [0.55 * L, W],
      [0.2 * L, 0.88 * W],
      [0, 0.35 * W],
    ] as OutlinePoint[];

  const feather = (o: {
    at: Vec;
    dir: Vec;
    L: number;
    W: number;
    color: Fill;
    bone: Joint;
    vertical?: boolean;
    thick?: number;
  }) => {
    const x = o.dir.clone().normalize();
    let y: Vec;
    if (o.vertical) y = UP.clone().addScaledVector(x, -UP.dot(x)).normalize();
    else {
      y = new THREE.Vector3().crossVectors(UP, x).normalize();
      if (y.z > 0) y.negate();
    }
    return b.extrude(featherOutline(o.L, o.W), {
      at: o.at,
      x: x.toArray() as [number, number, number],
      y: y.toArray() as [number, number, number],
      thickness: o.thick ?? 0.012,
      color: o.color,
      bone: o.bone,
    });
  };

  // ------------------------------------------------------------------ body
  const bodyRx = interp([
    [0, 0.27],
    [0.25, 0.31],
    [0.6, 0.32],
    [1, 0.28],
  ]);
  const bodyRy = interp([
    [0, 0.33],
    [0.25, 0.36],
    [0.6, 0.39],
    [1, 0.38],
  ]);
  const body = b.sweep(spine, (t) => [bodyRx(t), bodyRy(t)], {
    color: coat,
    sides: 12,
    smooth: false,
    shift: (t) => [0, -0.01 - 0.05 * t],
    name: "body",
  });

  const neckRx = interp([
    [0, 0.2],
    [1, 0.115],
  ]);
  const neckRy = interp([
    [0, 0.26],
    [1, 0.14],
  ]);
  const neckTube = b.sweep(neck, (t) => [neckRx(t), neckRy(t)], {
    color: coat,
    sides: 8,
    smooth: false,
    name: "neck",
  });

  // head
  const st = (f: number, u: number, w: number, h: number) => ({ at: hp(f, u), w: w * HS, h: h * HS });
  const skull = b.loft([st(-0.1, -0.01, 0.2, 0.24), st(0.08, -0.04, 0.23, 0.3), st(0.28, -0.04, 0.16, 0.2), st(0.46, -0.045, 0.12, 0.15), st(0.6, -0.05, 0.13, 0.13)], {
    bone: head,
    color: headCoat,
    sides: 8,
    smooth: false,
    name: "skull",
  });
  const jawTube = b.loft([st(0.06, -0.15, 0.14, 0.12), st(0.26, -0.14, 0.1, 0.08), st(0.46, -0.12, 0.09, 0.07), st(0.57, -0.11, 0.1, 0.07)], {
    bone: jaw,
    color: headCoat,
    sides: 6,
    smooth: false,
    name: "jaw",
  });
  // teeth
  b.part(new THREE.BoxGeometry(0.07, 0.012, 0.015), TEETH, { bone: head, at: hp(0.6, -0.1), dir: D.toArray() as [number, number, number] });
  b.part(new THREE.BoxGeometry(0.06, 0.012, 0.015), TEETH, { bone: jaw, at: hp(0.58, -0.105), dir: D.toArray() as [number, number, number] });
  for (const s of [1, -1]) {
    const mouth = b.surface([skull, jawTube]).drape(
      polyline([hp(0.595, -0.075, s * 0.04), hp(0.5, -0.088, s * 0.07), hp(0.3, -0.1, s * 0.09), hp(0.17, -0.07, s * 0.115)]),
      { lift: 0.004 },
    );
    b.sweep(facet(mouth, 6, false), 0.006, { color: PINK_D, sides: 4, bone: head, name: "mouthLine" });
  }
  for (const s of [1, -1]) {
    // nostrils
    b.part(new THREE.IcosahedronGeometry(0.016, 0), PINK_D, {
      bone: head,
      at: hp(0.6, -0.02, s * 0.04),
      scale: [1, 0.6, 1.5],
      dir: D.toArray() as [number, number, number],
      flat: true,
    });
    // ears: outer + inner
    const ear = ears[s > 0 ? 0 : 1];
    b.spike(ear, [s * 0.4, 0.8, -0.35], 0.3, 0.06, { color: coat, sides: 4, smooth: false, bone: ear });
    b.spike(ear.at.clone().add(v(0, 0.012, 0.02)), [s * 0.4, 0.8, -0.35], 0.24, 0.036, {
      color: PINK,
      sides: 4,
      smooth: false,
      bone: ear,
    });
  }

  // eyes
  const eyeTex = svg(
    `<svg viewBox="0 0 64 48">
      <path d="M3 27 Q32 -3 61 25 Q32 52 3 27Z" fill="#241a4a"/>
      <circle cx="32" cy="26" r="16" fill="#5c4fd0"/>
      <circle cx="32" cy="27" r="10" fill="#2b2170"/>
      <path d="M20 30 Q32 40 44 30" stroke="#8fa6ff" stroke-width="3" fill="none"/>
      <circle cx="25" cy="19" r="5.5" fill="#ffffff"/>
      <circle cx="39" cy="33" r="2.6" fill="#d6e4ff"/>
      <path d="M2 28 Q30 -8 62 22" stroke="#241a4a" stroke-width="4" fill="none"/>
      <path d="M58 20 L63 12" stroke="#241a4a" stroke-width="3.5"/>
      <path d="M52 15 L56 7" stroke="#241a4a" stroke-width="3.5"/>
    </svg>`,
    { size: 192 },
  );
  for (const s of [1, -1])
    b.decal(skull, eyeTex, {
      at: hp(0.2, 0.01, s * 0.1),
      dir: [s * 0.9, 0.2, 0.35],
      up: U.toArray() as [number, number, number],
      size: [0.13, 0.098],
      mirror: s < 0,
      name: `eye${s > 0 ? "L" : "R"}`,
    });

  // brow band, gem and noseband
  const brow = b.surface(skull).loop(hp(0.12, 0), { dir: D, lift: 0.006 });
  b.sweep(brow, 0.012, { color: GOLD, sides: 4, bone: head, name: "browband" });
  const noseband = b.surface(skull).loop(hp(0.44, 0), { dir: D, lift: 0.006 });
  b.sweep(facet(noseband, 10), 0.009, { color: GOLD, sides: 4, bone: head, name: "noseband" });
  const gemHit = b.surface(skull).ray(hp(0.12, 0.4), U.clone().negate());
  if (gemHit) {
    b.stick(new THREE.OctahedronGeometry(0.032, 0), GEM, gemHit, { embed: 0.3, flat: true, bone: head, name: "browGem" });
    b.stick(new THREE.OctahedronGeometry(0.044, 0), GOLD, gemHit, { embed: 0.55, flat: true, bone: head, name: "browSetting" });
    b.stick(new THREE.OctahedronGeometry(0.014, 0), GEM_L, gemHit.moved([0, 0.02, 0]), { embed: 0, flat: true, bone: head, name: "browGlint" });
  }

  // ------------------------------------------------------------------ legs
  const frontR = interp([
    [0, 0.095],
    [0.3, 0.08],
    [0.5, 0.062],
    [0.6, 0.05],
    [0.64, 0.04],
    [0.86, 0.04],
    [0.9, 0.05],
    [1, 0.045],
  ]);
  const hindR = interp([
    [0, 0.13],
    [0.25, 0.1],
    [0.45, 0.07],
    [0.62, 0.058],
    [0.68, 0.043],
    [0.88, 0.04],
    [0.92, 0.05],
    [1, 0.045],
  ]);
  for (const leg of legs) {
    const c = leg.chain;
    const tube = b.sweep(c, leg.front ? frontR : hindR, { color: coat, sides: 6, smooth: false, name: `leg${leg.front ? "F" : "H"}${leg.s > 0 ? "L" : "R"}` });
    const [, , j2, j3] = c.joints;
    const tip = c.tip as Joint;
    b.part(new THREE.IcosahedronGeometry(leg.front ? 0.058 : 0.062, 0), coat, { bone: j2, at: j2.at, flat: true });
    const j0 = c.joints[0];
    if (leg.front)
      b.part(new THREE.IcosahedronGeometry(0.16, 1), coat, {
        bone: j0,
        at: j0.at.clone().add(v(leg.s * 0.01, -0.05, -0.02)),
        scale: [0.85, 1.25, 1.05],
        flat: true,
        name: "shoulderMass",
      });
    else
      b.part(new THREE.IcosahedronGeometry(0.165, 1), coat, {
        bone: j0,
        at: j0.at.clone().add(v(leg.s * 0.0, -0.08, -0.03)),
        scale: [0.72, 1.25, 1.15],
        flat: true,
        name: "thighMass",
      });
    b.part(new THREE.CylinderGeometry(0.056, 0.074, 0.105, 6), GOLD, {
      bone: tip,
      at: [tip.at.x, 0.0525, tip.at.z + 0.012],
      flat: true,
      name: "hoof",
    });
    b.part(new THREE.CylinderGeometry(0.05, 0.056, 0.02, 6), GOLD_D, {
      bone: tip,
      at: [tip.at.x, 0.105, tip.at.z + 0.008],
      flat: true,
      name: "hoofRim",
    });
    // anklet and fetlock feathers
    const band = b.surface(tube).loop(c.at(0.74), { lift: 0.008 });
    b.sweep(facet(band, 8), 0.012, { color: GOLD, sides: 4, bone: j3, name: "anklet" });
    b.ring(j3, { count: 6, radius: 0.04, tilt: 62 }, (it) =>
      b.spike(it, it, 0.14, 0.03, { color: MANE_L, sides: 4, smooth: false }),
    );
    b.ring(j3, { count: 4, radius: 0.03, tilt: 75, fromDeg: 120, toDeg: 240 }, (it) =>
      b.spike(it, it, 0.19, 0.026, { color: MANE_M, sides: 4, smooth: false }),
    );
  }

  // ------------------------------------------------------------------ tail
  const dockR = interp([
    [0, 0.07],
    [0.3, 0.055],
    [1, 0.025],
  ]);
  const dock = b.sweep(tail, dockR, {
    color: (t) => (t < 0.28 ? coat : MANE_D),
    sides: 6,
    smooth: false,
    name: "dock",
  });
  const lockCols = [MANE_D, MANE_M, MANE_L, MANE_M, MANE_D, MANE_P, MANE_L, MANE_M, MANE_D, MANE_L, MANE_M, MANE_P];
  for (let kk = 0; kk < 12; kk++) {
    const th = (kk * 2.4) % (Math.PI * 2);
    const t0 = 0.05 + 0.04 * (kk % 3);
    const pts: Vec[] = [];
    const steps = [0, 0.3, 0.6, 1];
    for (const u of steps) {
      const t = t0 + u * (1 - t0);
      const cp = tail.at(t);
      const rho = 0.03 + 0.17 * Math.sin(Math.min(1, u * 1.3) * 1.6) * (0.7 + 0.3 * ((kk * 7) % 3));
      const off = cp.binormal.clone().multiplyScalar(Math.cos(th) * rho).addScaledVector(cp.normal, Math.sin(th) * rho * 0.6);
      pts.push(cp.at.clone().add(off));
    }
    const endTan = tail.at(1).tangent.clone();
    pts.push(
      pts[pts.length - 1]
        .clone()
        .addScaledVector(endTan, 0.14 + 0.09 * (kk % 3))
        .add(v(0.16 * Math.cos(th), -0.03 - 0.03 * (kk % 4), -0.14 - 0.06 * (kk % 2))),
    );
    b.sweep(catmull(pts), [0.035, 0.1 - 0.012 * (kk % 3), 0.085, 0.045, 0], {
      bone: tail,
      color: lockCols[kk],
      sides: 5,
      smooth: false,
      caps: { start: "flat", end: "point" },
      name: `tailLock${kk}`,
    });
  }

  // ------------------------------------------------------------------ mane
  const flame = (L: number, w: number) =>
    [
      [0, w * 0.6],
      [0.2 * L, w * 0.9],
      [0.5 * L, w * 0.7],
      [0.8 * L, w * 0.1],
      [L, -w * 0.9, "sharp"],
      [0.78 * L, -w * 0.55],
      [0.5 * L, -w * 0.35],
      [0.2 * L, -w * 0.45],
      [0, -w * 0.6],
    ] as OutlinePoint[];
  const tuft = (at: Vec, dir: Vec, L: number, w: number, color: Fill, bone: Joint) => {
    const x = dir.clone().normalize();
    const y = UP.clone().addScaledVector(x, -UP.dot(x)).normalize();
    return b.extrude(flame(L, w), {
      at,
      x: x.toArray() as [number, number, number],
      y: y.toArray() as [number, number, number],
      thickness: 0.026,
      color,
      bone,
    });
  };
  b.along(neckTube, 12, (at) => {
    const i = Math.round(at.t * 12);
    const L = 0.42 + 0.12 * Math.sin(i * 1.7) + 0.1 * at.t;
    const base = at.at.clone();
    for (const [dx, lean, col, ll, ww] of [
      [0, 0, MANE_D, 1, 0.095],
      [0.05, 1, MANE_M, 0.9, 0.085],
      [-0.05, -1, MANE_M, 0.9, 0.085],
      [0.025, 0.5, MANE_L, 0.72, 0.07],
    ] as [number, number, string, number, number][]) {
      const dir = v(lean * 0.55, -0.4 + 0.05 * Math.sin(i), -0.8).normalize();
      tuft(base.clone().add(v(dx, 0.02 - Math.abs(dx) * 0.3, 0)), dir, L * ll, ww, col, at.bone as Joint);
    }
  });
  // forelock
  for (let i = 0; i < 5; i++) {
    const s = (i - 2) / 2;
    const dir = v(s * 0.35, -0.45 - 0.1 * (1 - Math.abs(s)), 0.75).normalize();
    tuft(hp(-0.02, 0.1, s * 0.05), dir, 0.24 - Math.abs(s) * 0.05, 0.05, i % 2 ? MANE_M : MANE_D, head);
  }

  // ------------------------------------------------------------------ collar and chest gem
  const collar = b.surface(neckTube).loop(neck.at(0.14), { lift: 0.014 });
  b.sweep(collar, 0.02, { color: GOLD, sides: 4, bone: neck.joints[0], name: "collar" });
  b.along(collar, 14, (at) => b.part(new THREE.IcosahedronGeometry(0.014, 0), GOLD_L, { at, bone: neck.joints[0], flat: true, name: "collarStud" }));
  const front = b.surface(neckTube).around(neck.at(0.14).at).at(0, -12);
  if (front) {
    b.stick(new THREE.OctahedronGeometry(0.05, 0), GOLD, front, { embed: 0.6, flat: true, name: "pendantSetting" });
    b.stick(new THREE.OctahedronGeometry(0.038, 0), GEM, front, { embed: 0.2, flat: true, name: "pendantGem" });
  }
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.05;
    const dir = v(x * 3, -0.92, 0.28 - Math.abs(x)).normalize();
    tuft(front ? front.at.clone().add(v(x, -0.05, 0.02)) : v(x, 1.4, 0.9), dir, 0.24 - Math.abs(x) * 0.5, 0.05, [MANE_M, MANE_L, MANE_P, MANE_L, MANE_M][i], neck.joints[0]);
  }
  const tailBand = b.surface(dock).loop(tail.at(0.2), { lift: 0.008 });
  b.sweep(facet(tailBand, 8), 0.016, { color: GOLD, sides: 4, bone: tail.joints[0], name: "tailBand" });
  const girth = b.surface(body).loop(spine.at(0.8), { lift: 0.012 });
  b.sweep(girth, 0.022, { color: GOLD, sides: 4, name: "girth" });
  for (const t of [0.75, 0.85]) b.sweep(b.surface(body).loop(spine.at(t), { lift: 0.01 }), 0.008, { color: GOLD_D, sides: 4, name: "girthEdge" });
  b.along(girth, 18, (at) => b.part(new THREE.IcosahedronGeometry(0.015, 0), GOLD_L, { at, flat: true, name: "girthStud" }));

  // ------------------------------------------------------------------ flank constellation
  const star = (cx: number, cy: number, r: number) => {
    const pts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const a = (-90 + i * 36) * DEG;
      const rr = i % 2 ? r * 0.45 : r;
      pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
    }
    return `<polygon points="${pts.join(" ")}" fill="#ffd45a"/>`;
  };
  const cons = svg(
    `<svg viewBox="0 0 120 90">
      <polyline points="14,64 38,30 66,44 92,16 106,52" stroke="#e8b83a" stroke-width="3" fill="none"/>
      ${star(14, 64, 9)}${star(38, 30, 11)}${star(66, 44, 8)}${star(92, 16, 12)}${star(106, 52, 9)}
    </svg>`,
    { size: 256 },
  );
  for (const s of [1, -1])
    b.decal(body, cons, {
      at: [s * 0.36, 1.18 + Y0, -0.2],
      dir: [s, 0, 0],
      size: [0.62, 0.465],
      mirror: s < 0,
      name: `constellation${s > 0 ? "L" : "R"}`,
    });

  // ------------------------------------------------------------------ wings
  const wingR = interp([
    [0, 0.06],
    [0.4, 0.045],
    [0.75, 0.032],
    [1, 0.022],
  ]);
  for (const w of wings) {
    const [shoulder, elbow, wrist] = w.chain.joints;
    const armTube = b.sweep(w.chain, wingR, { color: coat, sides: 6, smooth: false, name: `wingArm${w.k}` });
    b.part(new THREE.IcosahedronGeometry(0.115, 0), coat, { bone: shoulder, at: shoulder.at, flat: true });
    for (const t of [0.34, 0.7]) {
      const cuff = b.surface(armTube).loop(w.chain.at(t), { lift: 0.01 });
      b.sweep(facet(cuff, 8), 0.014, { color: GOLD, sides: 4, bone: t < 0.5 ? elbow : wrist, name: `wingCuff${w.k}` });
    }
    // wing claw
    b.spike(w.chain.at(0.78).at, [w.s * 0.25, 0.2, 0.8], 0.1, 0.025, { color: GOLD_D, sides: 4, bone: wrist });

    for (const f of w.feathers) {
      const bone = w.groups[f.group];
      let color: Fill;
      switch (f.cls) {
        case "pri":
          color = featherPaint(f.L, f.W, "#f7f7fd", "#c4cff6", "#7b8fe6", "#d6aa40");
          break;
        case "sec":
          color = featherPaint(f.L, f.W, "#f7f7fd", "#d3c8f3", "#9b88e0", "#d6aa40");
          break;
        case "ter":
          color = featherPaint(f.L, f.W, "#f7f7fd", "#e2dcf8", "#b3a6f0", "#d6aa40");
          break;
        case "gc":
          color = featherPaint(f.L, f.W, "#fbfbfe", "#e6eafb", "#c3cff8", "#e8c860");
          break;
        case "mc":
          color = featherPaint(f.L, f.W, "#fdfdff", "#f0f2fd", "#dfe5fb", "#f0d878");
          break;
        case "lc":
          color = featherPaint(f.L, f.W, "#ffffff", "#f7f8fe", "#eaeefc", "#f4e090");
          break;
        default:
          color = featherPaint(f.L, f.W, "#f7f7fd", "#c4cff6", "#7b8fe6", "#d6aa40");
      }
      feather({ at: f.root, dir: f.dir, L: f.L, W: f.W, color, bone });
    }
  }


  return b.root;
}
