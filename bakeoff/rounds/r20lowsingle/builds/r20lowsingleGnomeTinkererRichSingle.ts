import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "../../../../kits/glow";
import { createBuilder } from "../../../../src/builder";
import { lerp, rng } from "../../../../src/math";
import { mottle, patches, spots, stripes } from "../../../../src/paint";
import { catmull, polyline, spiral } from "../../../../src/path";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Gnome Tinkerer",
  description:
    "A stout, bearded gnome inventor in a spotted pointy hat and striped sleeves, hauling a huge leather backpack bristling with gadgets: gauge, gears, telescope, propeller, lantern, potion tubes and tools.",
  style: "whimsical low-poly mix",
  commit: "88fc1f0",
};

const SKIN = "#f0b48c";
const NOSE = "#e8736a";
const CHEEK = "#f09a8a";
const WHITE = "#f6f1e6";
const CREAM = "#e8d9b0";
const RED = "#d6483d";
const DRED = "#a8302c";
const TEAL = "#3f8f9a";
const MUSTARD = "#b5782e";
const MUSTARD2 = "#9a6224";
const LEATHER = "#8a5a33";
const LEATHER2 = "#6d4426";
const DLEATHER = "#4e301b";
const TAN = "#c9a066";
const BRASS = "#d9a53a";
const DBRASS = "#a87a22";
const COPPER = "#c9703a";
const STEEL = "#9aa6b0";
const DSTEEL = "#5f6b75";
const PUPIL = "#2a2020";
const GLASS = "#5fe0d0";
const LAMP = "#ffb347";
const BLUE = "#4a7fc4";
const YELLOW = "#ffd45a";
const PINK = "#f07ab4";
const GREEN = "#4f9a4a";

type Pt = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "gnomeTinkerer", detail: 0.7 });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  type Bone = Parameters<typeof b.pose>[0];

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.42, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.42, 0],
      [0, 0.52, 0.01],
      [0, 0.62, 0.02],
    ]),
    { parent: hips, names: ["spine", "chest"], role: "spine" },
  );
  const chest = spine.joints[1];
  const neck = b.chain(
    "neck",
    polyline([
      [0, 0.62, 0.02],
      [0, 0.76, 0.05],
    ]),
    { parent: chest, names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 0.76, 0.05], dir: [0, 1, 0.15], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.86, 0.12], aim: [0, 0.84, 0.22], role: "jaw" });
  const lid = b.joint("lid", { parent: chest, at: [0, 0.77, -0.31], aim: [0, 0.77, -0.2], role: "hinge" });
  const rotor = b.joint("rotor", { parent: chest, at: [0.1, 0.93, -0.28], dir: [0, 1, 0], role: "hinge" });

  // ---------- helpers ----------
  const blob = (
    color: string,
    at: Pt,
    scale: Pt,
    bone: Bone,
    seg = 8,
    rows = 6,
    rotation?: readonly number[],
  ) =>
    b.part(new THREE.SphereGeometry(1, seg, rows), color, { at, scale, bone, rotation, flat: true });
  const box = (w: number, h: number, d: number, color: string, at: Pt, bone: Bone, rotation?: readonly number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, bone, rotation, flat: true });
  const cyl = (
    rt: number,
    rb: number,
    h: number,
    seg: number,
    color: string,
    at: Pt | THREE.Vector3,
    bone: Bone,
    opts: { dir?: readonly number[]; rotation?: readonly number[] } = {},
  ) => b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, bone, flat: true, ...opts });
  const torus = (
    r: number,
    tube: number,
    color: string,
    at: Pt | THREE.Vector3,
    bone: Bone,
    opts: { dir?: readonly number[]; rotation?: readonly number[]; axis?: "x" | "y" | "z" } = {},
  ) => b.part(new THREE.TorusGeometry(r, tube, 4, 8), color, { at, bone, flat: true, ...opts });
  const frust = (
    base: THREE.Vector3,
    dir: THREE.Vector3,
    rb: number,
    rt: number,
    h: number,
    color: string | ReturnType<typeof spots>,
    bone: Bone,
  ) => {
    const d = dir.clone().normalize();
    const c = base.clone().addScaledVector(d, h / 2);
    b.part(new THREE.CylinderGeometry(rt, rb, h, 7), color, { at: c, bone, dir: d.toArray(), flat: true });
    return base.clone().addScaledVector(d, h);
  };
  const ringPath = (cx: number, cy: number, cz: number, R: number, n = 10) =>
    catmull(
      Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        return [cx + R * Math.sin(a), cy, cz + R * Math.cos(a)];
      }),
      { closed: true },
    );
  const gearGeo = (R: number, teeth: number, thick: number) => {
    const geos: THREE.BufferGeometry[] = [];
    const body = new THREE.CylinderGeometry(R, R, thick, teeth);
    body.rotateX(Math.PI / 2);
    geos.push(body);
    const w = ((2 * Math.PI * R) / teeth) * 0.5;
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const t = new THREE.BoxGeometry(R * 0.32, w, thick);
      t.translate(R * 1.0, 0, 0);
      t.rotateZ(a);
      geos.push(t);
    }
    return mergeGeometries(geos)!;
  };

  // ---------- paints & textures ----------
  const SHIRT = stripes(CREAM, TEAL, { size: 0.07, axis: "y", width: 0.5, wobble: 0 });
  const PANTS = mottle(MUSTARD, MUSTARD2, { size: 0.05, contrast: 0.6, seed: 2 });
  const SOCKS = stripes(CREAM, RED, { size: 0.045, axis: "y", width: 0.5, wobble: 0, seed: 4 });
  const HAT = spots(RED, CREAM, { size: 0.08, amount: 0.25, seed: 3 });
  const PACK = patches(LEATHER, LEATHER2, { size: 0.07, gap: 0.12, seed: 8 });

  let ticks = "";
  for (let i = 0; i < 9; i++) {
    const a = ((-135 + i * 33.75) * Math.PI) / 180;
    const x1 = 32 + 24 * Math.sin(a);
    const y1 = 32 - 24 * Math.cos(a);
    const x2 = 32 + 19 * Math.sin(a);
    const y2 = 32 - 19 * Math.cos(a);
    ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#4e301b" stroke-width="2.5"/>`;
  }
  const DIAL = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="31.5" fill="#f6f1e6"/><path d="M12 46 A24 24 0 0 1 20 16" stroke="#4f9a4a" stroke-width="4" fill="none"/><path d="M44 16 A24 24 0 0 1 52 46" stroke="#d6483d" stroke-width="4" fill="none"/>${ticks}<path d="M32 32 L45 20" stroke="#d6483d" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="32" r="4" fill="#4e301b"/></svg>`,
    { size: 192 },
  );
  const TUFT = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M16 0 C23 20 31 42 29 64 L3 64 C1 42 9 20 16 0Z" fill="#ffffff"/><path d="M16 10 C17 26 17 46 16 64" stroke="#d8d2c0" stroke-width="3" fill="none"/><path d="M9 30 C10 44 9 54 8 64" stroke="#e6e0d0" stroke-width="2.5" fill="none"/></svg>`,
    { size: 128 },
  );

  // ---------- torso ----------
  b.sweep(spine, [0.15, 0.17, 0.17, 0.15, 0.14], {
    sides: 8,
    smooth: false,
    color: SHIRT,
    bands: [
      [0.15, PANTS],
      [1, SHIRT],
    ],
  });
  b.sweep(neck, 0.06, { sides: 6, smooth: false, color: SKIN });

  // overalls bib
  const bib = b.extrude(
    [
      [-0.13, 0],
      [0.13, 0],
      [0.13, 0.1],
      [0.1, 0.18],
      [0.08, 0.22],
      [-0.08, 0.22],
      [-0.1, 0.18],
      [-0.13, 0.1],
    ],
    {
      at: [0, 0.44, 0.185],
      x: [1, 0, 0],
      y: [0, 0.97, -0.24],
      thickness: 0.04,
      bevel: 0.006,
      color: PANTS,
      bone: chest,
    },
  );
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.014, 6, 4), BRASS, {
      at: bib.local([s * 0.07, 0.2, 0.022]),
      bone: chest,
      flat: true,
    });
  b.part(new THREE.BoxGeometry(0.1, 0.06, 0.006), MUSTARD2, {
    at: bib.local([0, 0.07, 0.022]),
    quat: bib.quat,
    bone: chest,
    flat: true,
  });
  for (const [x, y, w, h] of [
    [0, 0.1, 0.1, 0.004],
    [0, 0.04, 0.1, 0.004],
    [-0.05, 0.07, 0.004, 0.06],
    [0.05, 0.07, 0.004, 0.06],
  ])
    b.part(new THREE.BoxGeometry(w, h, 0.003), CREAM, {
      at: bib.local([x, y, 0.026]),
      quat: bib.quat,
      bone: chest,
      flat: true,
    });

  // belt, pouches, collar
  b.sweep(ringPath(0, 0.46, 0.01, 0.185), 0.02, { color: DLEATHER, sides: 5, bone: spine.joints[0] });
  box(0.05, 0.04, 0.012, BRASS, [0, 0.46, 0.2], spine.joints[0]);
  box(0.028, 0.022, 0.014, DBRASS, [0, 0.46, 0.203], spine.joints[0]);
  b.sweep(ringPath(0, 0.73, 0.035, 0.105), 0.022, { color: CREAM, sides: 5, bone: neck.joints[0] });
  for (const s of [1, -1]) {
    const yaw = s * 40;
    box(0.06, 0.08, 0.04, LEATHER, [s * 0.13, 0.41, 0.165], spine.joints[0], [0, yaw, 0]);
    box(0.066, 0.025, 0.044, LEATHER2, [s * 0.13, 0.445, 0.165], spine.joints[0], [0, yaw, 0]);
    blob(BRASS, [s * 0.146, 0.435, 0.183], [0.009, 0.009, 0.006], spine.joints[0], 5, 4, [0, yaw, 0]);
  }
  // tools in belt
  b.rod([-0.14, 0.43, 0.17], [-0.17, 0.53, 0.2], 0.007, STEEL, { bone: spine.joints[0], sides: 5 });
  b.rod([-0.14, 0.43, 0.17], [-0.155, 0.47, 0.185], 0.013, RED, { bone: spine.joints[0], sides: 5 });
  b.rod([0.1, 0.46, 0.2], [0.13, 0.54, 0.225], 0.01, BLUE, { bone: spine.joints[0], sides: 5 });
  b.rod([0.13, 0.54, 0.225], [0.14, 0.58, 0.23], 0.014, STEEL, { bone: spine.joints[0], sides: 5 });

  // ---------- shoulder straps (leather) ----------
  for (const s of [1, -1])
    b.sweep(
      catmull([
        [s * 0.1, 0.74, -0.12],
        [s * 0.108, 0.73, -0.03],
        [s * 0.108, 0.725, 0.06],
        [s * 0.098, 0.665, 0.13],
        [s * 0.09, 0.56, 0.165],
        [s * 0.085, 0.47, 0.19],
      ]),
      () => [0.022, 0.007],
      { section: "box", caps: "flat", color: LEATHER2, bone: chest },
    );

  // ---------- legs & boots ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${S}`,
      polyline([
        [s * 0.085, 0.4, 0],
        [s * 0.09, 0.23, 0.03],
        [s * 0.09, 0.075, 0],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg", contact: [s * 0.09, 0, 0.05] },
    );
    b.sweep(leg, [0.07, 0.058, 0.052], {
      sides: 7,
      smooth: false,
      color: PANTS,
      bands: [
        [0.5, PANTS],
        [1, SOCKS],
      ],
    });
    const ankle = leg.tip!;
    blob(LEATHER, [s * 0.09, 0.065, 0.05], [0.07, 0.07, 0.125], ankle);
    blob(LEATHER2, [s * 0.09, 0.07, 0.165], [0.058, 0.05, 0.06], ankle);
    blob(DLEATHER, [s * 0.09, 0.012, 0.055], [0.074, 0.018, 0.14], ankle);
    cyl(0.07, 0.074, 0.05, 8, LEATHER2, [s * 0.09, 0.125, 0], ankle);
    torus(0.07, 0.008, BRASS, [s * 0.09, 0.15, 0], ankle, { rotation: [90, 0, 0] });
    for (const z of [0.07, 0.11, 0.14])
      box(0.075, 0.008, 0.012, CREAM, [s * 0.09, 0.1 + (0.14 - z) * 0.3, z], ankle);
  }
  // patch on right thigh
  box(0.05, 0.05, 0.01, BLUE, [-0.089, 0.31, 0.073], hips, [8, 0, 0]);
  box(0.058, 0.004, 0.003, CREAM, [-0.089, 0.31, 0.079], hips, [8, 0, 45]);
  box(0.058, 0.004, 0.003, CREAM, [-0.089, 0.31, 0.079], hips, [8, 0, -45]);

  // ---------- arms & hands ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts: Pt[] = [
      [s * 0.17, 0.61, 0.01],
      [s * 0.27, 0.5, 0.04],
      [s * 0.31, 0.39, 0.1],
    ];
    const arm = b.chain(`arm${S}`, polyline(pts), {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    b.sweep(arm, [0.054, 0.048, 0.042], { sides: 7, smooth: false, color: SHIRT });
    const wrist = arm.tip!;
    const elbowP = V(...pts[1]);
    const wristP = V(...pts[2]);
    const dir = wristP.clone().sub(elbowP).normalize();
    b.rod(lerp(elbowP, wristP, 0.78), wristP, 0.05, CREAM, { bone: wrist, sides: 7, smooth: false });
    // elbow patch
    blob(LEATHER, [s * 0.3, 0.5, 0.05], [0.02, 0.045, 0.045], arm.joints[1], 6, 4);
    const H = wristP.clone().addScaledVector(dir, 0.045);
    blob(TAN, H.toArray() as Pt, [0.055, 0.058, 0.055], wrist, 7, 5);
    const fingers = b.joint(`fingers${S}`, {
      parent: wrist,
      at: H.clone().addScaledVector(dir, 0.03),
      aim: H.clone().addScaledVector(dir, 0.1),
      role: "digit",
    });
    for (let i = 0; i < 4; i++) {
      const base = H.clone().addScaledVector(dir, 0.035).add(V((i - 1.5) * 0.02, 0, 0.0));
      const tip = base.clone().addScaledVector(dir, 0.065).add(V(0, 0, 0.012));
      b.capsule(base, tip, 0.015, TAN, { bone: fingers, sides: 5, smooth: false });
    }
    const tb = H.clone().add(V(-s * 0.04, 0.012, 0.01));
    const thumb = b.joint(`thumb${S}`, {
      parent: wrist,
      at: tb,
      aim: tb.clone().add(V(-s * 0.03, -0.04, 0.025)),
      role: "digit",
    });
    b.capsule(tb, tb.clone().add(V(-s * 0.03, -0.04, 0.025)), 0.016, TAN, { bone: thumb, sides: 5, smooth: false });
  }

  // ---------- head ----------
  blob(SKIN, [0, 0.93, 0.05], [0.155, 0.145, 0.15], head, 10, 8);
  blob(NOSE, [0, 0.915, 0.215], [0.04, 0.038, 0.045], head);
  blob("#ffffff", [0.003, 0.925, 0.25], [0.008, 0.008, 0.006], head, 5, 4);
  for (const s of [1, -1]) {
    blob(WHITE, [s * 0.06, 0.955, 0.183], [0.03, 0.034, 0.026], head);
    blob(PUPIL, [s * 0.062, 0.955, 0.205], [0.016, 0.02, 0.012], head, 6, 4);
    blob("#ffffff", [s * 0.066, 0.963, 0.216], [0.005, 0.005, 0.004], head, 4, 3);
    blob(CHEEK, [s * 0.1, 0.9, 0.155], [0.03, 0.022, 0.015], head, 6, 4);
    b.capsule([s * 0.03, 0.995, 0.19], [s * 0.1, 0.985, 0.165], 0.016, WHITE, { bone: head, sides: 5, smooth: false });
    // ears
    frust(V(s * 0.145, 0.93, 0.03), V(s, 0.45, -0.3), 0.045, 0, 0.16, SKIN, head);
    frust(V(s * 0.15, 0.93, 0.035), V(s, 0.45, -0.3), 0.026, 0, 0.1, CHEEK, head);
    // mustache
    b.sweep(
      catmull([
        [0, 0.885, 0.2],
        [s * 0.06, 0.872, 0.222],
        [s * 0.12, 0.888, 0.19],
        [s * 0.155, 0.915, 0.13],
      ]),
      [0.034, 0.012],
      { color: WHITE, bone: head, sides: 6, smooth: false },
    );
    // sideburn tufts
    b.spike([s * 0.14, 0.97, 0.03], [s * 0.4, -1, 0], 0.1, 0.03, { color: WHITE, bone: head, sides: 5 });
  }
  // jaw
  blob(SKIN, [0, 0.83, 0.15], [0.07, 0.045, 0.06], jaw);
  blob(DRED, [0, 0.862, 0.205], [0.035, 0.01, 0.015], jaw, 6, 4);

  // beard
  const beardMain = V(0, 0.9, 0.09);
  const bd = V(0, -1, 0.18);
  frust(beardMain, bd, 0.155, 0, 0.32, WHITE, head);
  const beardParts = [
    b.part(new THREE.ConeGeometry(0.1, 0.3, 7), WHITE, {
      at: V(0, 0.85, 0.19).addScaledVector(V(0, -1, 0.35).normalize(), 0.15),
      dir: V(0, -1, 0.35).normalize().toArray(),
      bone: head,
      flat: true,
      scale: [1, -1, 1],
    }),
  ];
  // the cone above is built apex-up and flipped by scale; remove double facing issues by also using solid side cones
  for (const s of [1, -1])
    beardParts.push(
      b.part(new THREE.CylinderGeometry(0, 0.07, 0.2, 6), WHITE, {
        at: V(s * 0.1, 0.88, 0.1).addScaledVector(V(s * 0.15, -1, 0.2).normalize(), 0.1),
        dir: V(s * 0.15, -1, 0.2).normalize().toArray(),
        bone: head,
        flat: true,
      }),
    );
  torus(0.07, 0.009, BRASS, beardMain.clone().addScaledVector(bd.clone().normalize(), 0.2), head, {
    dir: bd.clone().normalize().toArray(),
    axis: "z",
  });
  blob(BRASS, beardMain.clone().addScaledVector(bd.clone().normalize(), 0.325).toArray() as Pt, [0.014, 0.014, 0.014], head, 5, 4);
  const hits = b.surface(beardParts).scatter(60, { rng: rng(5), minDist: 0.035 });
  b.cards(hits, TUFT, {
    size: [0.045, 0.11],
    lean: 70,
    flow: [0, -1, 0.15],
    vary: 0.3,
    spin: 15,
    rng: rng(6),
    color: "#fff8ea",
  });

  // ---------- hat ----------
  const base = V(0, 1.04, 0);
  const tip1 = frust(base, V(0, 1, -0.15), 0.15, 0.085, 0.2, HAT, head);
  const tip2 = frust(tip1, V(0, 0.55, -0.85), 0.085, 0.0, 0.2, HAT, head);
  blob(CREAM, tip2.toArray() as Pt, [0.035, 0.035, 0.035], head, 6, 4);
  cyl(0.23, 0.23, 0.022, 10, DRED, [0, 1.03, 0.03], head);
  cyl(0.152, 0.152, 0.035, 10, DLEATHER, [0, 1.058, 0], head);
  box(0.04, 0.04, 0.012, BRASS, [0, 1.058, 0.152], head);
  box(0.022, 0.024, 0.014, DLEATHER, [0, 1.058, 0.154], head);
  for (const s of [1, -1]) {
    cyl(0.04, 0.04, 0.03, 8, BRASS, [s * 0.055, 1.088, 0.14], head, { dir: [0, 0, 1] });
    cyl(0.027, 0.027, 0.012, 8, DBRASS, [s * 0.055, 1.088, 0.156], head, { dir: [0, 0, 1] });
    glow(cyl(0.024, 0.024, 0.01, 8, GLASS, [s * 0.055, 1.088, 0.163], head, { dir: [0, 0, 1] }), 1.4);
  }
  box(0.03, 0.012, 0.012, DBRASS, [0, 1.088, 0.14], head);
  // flower
  b.rod([-0.1, 1.06, 0.1], [-0.12, 1.15, 0.11], 0.005, GREEN, { bone: head, sides: 4 });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    blob(i % 2 ? YELLOW : PINK, [-0.12 + 0.024 * Math.cos(a), 1.155 + 0.024 * Math.sin(a), 0.115], [0.016, 0.016, 0.01], head, 5, 4);
  }
  blob(LAMP, [-0.12, 1.155, 0.123], [0.012, 0.012, 0.01], head, 5, 4);

  // ---------- backpack ----------
  box(0.34, 0.42, 0.2, PACK as unknown as string, [0, 0.55, -0.2], chest);
  box(0.36, 0.03, 0.22, DLEATHER, [0, 0.42, -0.2], chest);
  box(0.36, 0.03, 0.22, LEATHER2, [0, 0.775, -0.2], lid);
  for (const s of [1, -1]) box(0.035, 0.012, 0.2, DLEATHER, [s * 0.09, 0.79, -0.2], lid);
  box(0.04, 0.03, 0.012, BRASS, [0, 0.77, -0.092], lid);
  // rivets
  const rivetGeos: THREE.BufferGeometry[] = [];
  for (const x of [-0.15, -0.075, 0, 0.075, 0.15]) {
    rivetGeos.push(new THREE.SphereGeometry(0.01, 5, 4).translate(x, 0.42, -0.32));
    rivetGeos.push(new THREE.SphereGeometry(0.01, 5, 4).translate(x, 0.74, -0.306));
  }
  b.part(mergeGeometries(rivetGeos)!, BRASS, { bone: chest, at: [0, 0, 0], flat: true });
  // side pouches
  for (const s of [1, -1]) {
    box(0.06, 0.14, 0.12, LEATHER, [s * 0.2, 0.6, -0.2], chest);
    box(0.066, 0.03, 0.126, DLEATHER, [s * 0.2, 0.675, -0.2], chest);
    blob(BRASS, [s * 0.235, 0.67, -0.2], [0.008, 0.012, 0.012], chest, 5, 4);
  }
  // screwdrivers (right pouch, -x)
  const handles = [RED, BLUE, YELLOW];
  const tips: Pt[] = [
    [-0.235, 0.82, -0.25],
    [-0.25, 0.78, -0.2],
    [-0.235, 0.81, -0.15],
  ];
  tips.forEach((t, i) => {
    const bs: Pt = [-0.205, 0.69, -0.25 + i * 0.05];
    b.rod(bs, t, 0.006, STEEL, { bone: chest, sides: 5 });
    b.rod(bs, lerp(bs, t, 0.45), 0.013, handles[i], { bone: chest, sides: 5 });
  });
  // test tubes (left pouch, +x)
  const tubes = [GLASS, PINK, "#b8ff6a"];
  tubes.forEach((c, i) => {
    const z = -0.25 + i * 0.05;
    glow(cyl(0.016, 0.016, 0.1, 6, c, [0.205, 0.735, z], chest), 1.2);
    cyl(0.013, 0.016, 0.02, 6, LEATHER2, [0.205, 0.795, z], chest);
  });
  // mug (-x) and lantern (+x) on ropes
  b.rod([-0.215, 0.53, -0.2], [-0.24, 0.4, -0.2], 0.004, TAN, { bone: chest, sides: 4 });
  cyl(0.036, 0.032, 0.06, 8, STEEL, [-0.24, 0.365, -0.2], chest);
  cyl(0.037, 0.037, 0.008, 8, DSTEEL, [-0.24, 0.397, -0.2], chest);
  torus(0.022, 0.006, DSTEEL, [-0.272, 0.365, -0.2], chest);
  b.rod([0.215, 0.53, -0.2], [0.24, 0.46, -0.2], 0.004, TAN, { bone: chest, sides: 4 });
  torus(0.014, 0.004, BRASS, [0.24, 0.463, -0.2], chest, { rotation: [90, 0, 0] });
  cyl(0, 0.055, 0.05, 6, DBRASS, [0.24, 0.43, -0.2], chest);
  glow(box(0.058, 0.07, 0.058, LAMP, [0.24, 0.372, -0.2], chest), 1.6);
  box(0.07, 0.014, 0.07, BRASS, [0.24, 0.332, -0.2], chest);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) b.rod([0.24 + sx * 0.03, 0.34, -0.2 + sz * 0.03], [0.24 + sx * 0.03, 0.41, -0.2 + sz * 0.03], 0.004, BRASS, { bone: chest, sides: 4 });
  // bedroll
  cyl(0.055, 0.055, 0.38, 8, BLUE, [0, 0.3, -0.2], chest, { rotation: [0, 0, 90] });
  for (const x of [-0.11, 0.11]) cyl(0.058, 0.058, 0.03, 8, LEATHER, [x, 0.3, -0.2], chest, { rotation: [0, 0, 90] });
  // gauge
  cyl(0.055, 0.055, 0.02, 10, BRASS, [0, 0.69, -0.31], chest, { rotation: [90, 0, 0] });
  b.part(new THREE.CircleGeometry(0.046, 12), "#ffffff", {
    at: [0, 0.69, -0.321],
    rotation: [0, 180, 0],
    bone: chest,
    texture: DIAL,
  });
  // gears
  b.part(gearGeo(0.065, 10, 0.012), BRASS, { at: [0.095, 0.545, -0.31], bone: chest, flat: true });
  cyl(0.02, 0.02, 0.02, 6, DBRASS, [0.095, 0.545, -0.322], chest, { rotation: [90, 0, 0] });
  b.part(gearGeo(0.04, 8, 0.012), STEEL, { at: [0, 0.48, -0.31], bone: chest, flat: true });
  cyl(0.012, 0.012, 0.02, 6, DSTEEL, [0, 0.48, -0.32], chest, { rotation: [90, 0, 0] });
  // crank
  b.rod([0.095, 0.545, -0.32], [0.095, 0.545, -0.35], 0.008, STEEL, { bone: chest, sides: 5 });
  b.rod([0.095, 0.545, -0.35], [0.095, 0.6, -0.35], 0.008, STEEL, { bone: chest, sides: 5 });
  blob(RED, [0.095, 0.6, -0.36], [0.015, 0.015, 0.015], chest, 6, 4);
  // pipe & valve
  b.sweep(
    catmull([
      [0.03, 0.645, -0.325],
      [-0.03, 0.6, -0.335],
      [-0.07, 0.56, -0.335],
      [-0.07, 0.51, -0.335],
    ]),
    0.01,
    { color: COPPER, bone: chest, sides: 5, smooth: false },
  );
  cyl(0.016, 0.016, 0.03, 6, DBRASS, [-0.07, 0.495, -0.335], chest);
  torus(0.022, 0.005, RED, [-0.07, 0.47, -0.335], chest);
  // wrench
  b.extrude(
    [
      [-0.015, 0],
      [0.015, 0],
      [0.015, 0.2],
      [0.04, 0.22],
      [0.04, 0.28],
      [0.015, 0.3],
      [0.0, 0.28],
      [0.0, 0.25],
      [-0.015, 0.24],
    ],
    { at: [-0.145, 0.44, -0.316], x: [1, 0, 0], thickness: 0.014, bevel: 0.003, color: STEEL, bone: chest },
  );
  // telescope
  b.rod([-0.18, 0.845, -0.17], [-0.05, 0.845, -0.17], 0.028, BRASS, { bone: chest, sides: 8 });
  b.rod([-0.05, 0.845, -0.17], [0.05, 0.845, -0.17], 0.022, STEEL, { bone: chest, sides: 8 });
  b.rod([0.05, 0.845, -0.17], [0.13, 0.845, -0.17], 0.017, BRASS, { bone: chest, sides: 8 });
  for (const x of [-0.05, 0.05]) cyl(0.03, 0.03, 0.012, 8, DBRASS, [x, 0.845, -0.17], chest, { rotation: [0, 0, 90] });
  cyl(0.03, 0.03, 0.02, 8, DLEATHER, [-0.185, 0.845, -0.17], chest, { rotation: [0, 0, 90] });
  glow(cyl(0.014, 0.014, 0.006, 8, GLASS, [0.134, 0.845, -0.17], chest, { dir: [1, 0, 0] }), 1.4);
  for (const x of [-0.12, 0.0]) box(0.03, 0.03, 0.03, DLEATHER, [x, 0.815, -0.17], chest);
  // spring
  b.sweep(spiral([-0.1, 0.8, -0.27], [-0.07, 0.8, -0.27], [0, 1, 0], { turns: 4, r1: 0.03, pitch: 0.022 }), 0.0045, {
    color: STEEL,
    bone: chest,
    sides: 4,
  });
  // funnel
  b.lathe(
    [
      [0, 0],
      [0.015, 0],
      [0.015, 0.04],
      [0.07, 0.11],
      [0.065, 0.115],
      [0, 0.06],
    ],
    { at: [0.0, 0.79, -0.27], segments: 8, color: COPPER, bone: chest },
  );
  // propeller
  b.rod([0.1, 0.8, -0.28], [0.1, 0.93, -0.28], 0.008, STEEL, { bone: chest, sides: 5 });
  cyl(0.02, 0.02, 0.02, 6, DSTEEL, [0.1, 0.8, -0.28], chest);
  blob(RED, [0.1, 0.935, -0.28], [0.02, 0.02, 0.02], rotor, 6, 4);
  box(0.26, 0.006, 0.045, CREAM, [0.1, 0.938, -0.28], rotor, [8, 0, 0]);
  box(0.045, 0.006, 0.26, RED, [0.1, 0.938, -0.28], rotor, [0, 0, 8]);
  for (const [x, z] of [
    [0.22, 0],
    [-0.22, 0],
    [0, 0.22],
    [0, -0.22],
  ])
    blob(BRASS, [0.1 + x * 0.55, 0.94, -0.28 + z * 0.55], [0.012, 0.01, 0.012], rotor, 5, 4);

  return b.root;
}
