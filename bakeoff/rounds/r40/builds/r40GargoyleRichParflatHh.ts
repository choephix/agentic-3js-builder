import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, catmull, polyline, bezier } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Cathedral Gargoyle",
  "description": "A chunky, chisel-faceted stone gargoyle crouched on a weathered cathedral ledge, wings half-open, grinning with fangs and gripping the stone edge with its claws."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  stone: "#8a8a84",
  stoneLight: "#a9a89e",
  stoneDark: "#5f6064",
  stoneDeep: "#3e4046",
  mortar: "#77746b",
  moss: "#5a6b3a",
  mossDark: "#3d4a28",
  soot: "#2c2b2e",
  waterStain: "#4a525a",
  crack: "#26262a",
  wing: "#70717a",
  wingRib: "#8e8d86",
  claw: "#3a3a3e",
  fang: "#d8d4c4",
  eyeGlow: "#ffb347",
  rust: "#7a4a2e",
};
const M = {
  ledgeTop: [0, 0.3, 0] as [number, number, number],
  ledgeFront: [0, 0.3, 0.88] as [number, number, number],
  pelvis: [0, 0.68, -0.2] as [number, number, number],
  chestC: [0, 1, 0.28] as [number, number, number],
  tailRoot: [0, 0.66, -0.3] as [number, number, number],
  tailTip: [-0.7, 0.42, -0.45] as [number, number, number],
  neckBase: [0, 1.08, 0.38] as [number, number, number],
  headBase: [0, 1.2, 0.58] as [number, number, number],
  jawHinge: [0, 1.12, 0.72] as [number, number, number],
  shoulderL: [0.3, 1, 0.3] as [number, number, number],
  shoulderR: [-0.3, 1, 0.3] as [number, number, number],
  hipL: [0.3, 0.68, -0.2] as [number, number, number],
  hipR: [-0.3, 0.68, -0.2] as [number, number, number],
  handL: [0.34, 0.34, 0.7] as [number, number, number],
  handR: [-0.34, 0.34, 0.7] as [number, number, number],
  footL: [0.36, 0.34, 0.18] as [number, number, number],
  footR: [-0.36, 0.34, 0.18] as [number, number, number],
  wingRootL: [0.2, 1.05, 0.1] as [number, number, number],
  wingRootR: [-0.2, 1.05, 0.1] as [number, number, number],
  wingWristL: [0.95, 1.3, -0.3] as [number, number, number],
  wingWristR: [-0.95, 1.3, -0.3] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // ledge
  (() => {
function buildLedge({ b, J, P }: Ctx) {
  const bone = J.pelvis;
  const R = rng(311);

  // Box helper: size, centre, colour, optional rotation in degrees.
  const box = (
    w: number, h: number, d: number,
    cx: number, cy: number, cz: number,
    color: string, rot?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, {
      bone,
      at: [cx, cy, cz],
      ...(rot ? { rotation: rot } : {}),
    });

  // Flat moss blob: low faceted disc, squashed in x and z for an irregular outline.
  const blob = (
    cx: number, cz: number, r: number, y: number, color: string, h = 0.012,
  ) => {
    const g = new THREE.CylinderGeometry(r, r * 1.08, h, 7, 1);
    b.part(g, color, {
      bone,
      at: [cx, y + h / 2, cz],
      scale: [0.8 + R() * 0.6, 1, 0.8 + R() * 0.6],
      rotation: [0, R() * 180, 0],
      flat: true,
    });
  };

  // ---- Main masonry body -------------------------------------------------
  // Base course (darker), main courses, stepped moulding, cornice.
  box(1.66, 0.06, 1.72, 0, 0.03, 0, P.stoneDark);
  box(1.6, 0.16, 1.66, 0, 0.14, 0, P.stone);
  box(1.66, 0.04, 1.72, 0, 0.24, 0, P.stoneLight);
  box(1.7, 0.04, 1.76, 0, 0.28, 0, P.stoneLight);

  // Thin shadow line between moulding step and cornice
  box(1.64, 0.006, 1.7, 0, 0.222, 0, P.stoneDeep);

  const FZ = 0.83; // front face of body
  const SX = 0.8;  // side face of body

  // ---- Corbels under front edge -----------------------------------------
  const corbelX = [-0.55, -0.19, 0.19, 0.55];
  for (const x of corbelX) {
    box(0.14, 0.09, 0.09, x, 0.205, FZ + 0.045 - 0.0, P.stoneDark);
    box(0.1, 0.07, 0.06, x, 0.125, FZ + 0.03, P.stoneDark);
    box(0.06, 0.05, 0.035, x, 0.065, FZ + 0.018, P.stoneDeep);
  }

  // Dentils between corbels, under the moulding
  for (let x = -0.76; x <= 0.77; x += 0.07) {
    if (corbelX.some((c) => Math.abs(c - x) < 0.1)) continue;
    box(0.04, 0.025, 0.03, x, 0.2, FZ + 0.015, P.stoneLight);
  }

  // ---- Masonry joints (front) -------------------------------------------
  box(1.6, 0.006, 0.004, 0, 0.14, FZ + 0.002, P.mortar);
  box(1.6, 0.006, 0.004, 0, 0.06, FZ + 0.002, P.mortar);
  for (const x of [-0.7, -0.12, 0.36, 0.7]) box(0.006, 0.08, 0.004, x, 0.1, FZ + 0.002, P.mortar);
  for (const x of [-0.35, 0.05, 0.62]) box(0.006, 0.07, 0.004, x, 0.175, FZ + 0.002, P.mortar);

  // ---- Masonry joints (sides, back) --------------------------------------
  for (const s of [1, -1]) {
    box(0.004, 0.006, 1.66, s * (SX + 0.002), 0.14, 0, P.mortar);
    for (const z of [-0.55, -0.05, 0.45]) box(0.004, 0.08, 0.006, s * (SX + 0.002), 0.1, z, P.mortar);
    for (const z of [-0.3, 0.2, 0.65]) box(0.004, 0.07, 0.006, s * (SX + 0.002), 0.175, z, P.mortar);
  }
  box(1.6, 0.006, 0.004, 0, 0.14, -FZ - 0.002, P.mortar);
  for (const x of [-0.5, 0.1, 0.55]) box(0.006, 0.08, 0.004, x, 0.1, -FZ - 0.002, P.mortar);

  // Offset block faces, slightly proud
  box(0.3, 0.075, 0.008, -0.4, 0.1, FZ + 0.004, P.stoneLight);
  box(0.24, 0.065, 0.008, 0.28, 0.175, FZ + 0.004, P.stoneLight);
  box(0.008, 0.075, 0.3, SX + 0.004, 0.1, 0.25, P.stoneLight);
  box(0.008, 0.065, 0.26, -SX - 0.004, 0.175, -0.2, P.stoneLight);

  // ---- Rain gutter groove on top -----------------------------------------
  box(1.62, 0.006, 0.07, 0, 0.3, 0.76, P.stoneDeep);
  box(0.09, 0.006, 0.14, 0, 0.3, 0.83, P.stoneDeep); // outlet notch to the front edge
  box(1.62, 0.004, 0.012, 0, 0.3, 0.8, P.stoneDark);  // lip

  // ---- Plinth under the gargoyle -----------------------------------------
  box(0.98, 0.02, 1.12, 0, 0.31, 0.27, P.stoneDark);
  box(0.9, 0.02, 1.04, 0, 0.33, 0.27, P.stone);
  box(0.92, 0.006, 0.004, 0, 0.331, 0.795, P.mortar);

  // ---- Iron cramps on top -------------------------------------------------
  const cramp = (x: number, z: number, ry: number) => {
    box(0.16, 0.012, 0.03, x, 0.306, z, P.rust, [0, ry, 0]);
    const c = Math.cos((ry * Math.PI) / 180);
    const s = Math.sin((ry * Math.PI) / 180);
    for (const e of [-1, 1]) box(0.035, 0.022, 0.05, x + e * 0.08 * c, 0.31, z - e * 0.08 * s, P.rust, [0, ry, 0]);
  };
  cramp(-0.62, -0.5, 8);
  cramp(0.6, -0.12, -12);

  // ---- Moss on upward faces ---------------------------------------------
  blob(-0.72, -0.76, 0.1, 0.3, P.moss);
  blob(-0.66, -0.7, 0.05, 0.31, P.mossDark, 0.01);
  blob(0.72, -0.74, 0.09, 0.3, P.moss);
  blob(0.74, 0.74, 0.1, 0.3, P.moss);
  blob(0.7, 0.68, 0.05, 0.31, P.mossDark, 0.01);
  blob(-0.74, 0.72, 0.09, 0.3, P.moss);
  blob(-0.46, 0.84, 0.06, 0.3, P.mossDark);
  blob(0.4, 0.62, 0.06, 0.3, P.moss);
  blob(-0.78, -0.1, 0.07, 0.3, P.moss);
  blob(0.79, 0.2, 0.06, 0.3, P.mossDark);
  blob(0.1, -0.82, 0.08, 0.3, P.moss);
  blob(-0.3, -0.84, 0.05, 0.3, P.mossDark);
  // moss on the plinth edge
  blob(0.42, -0.2, 0.05, 0.35, P.moss, 0.01);

  // Moss tufts creeping down corners of the moulding
  box(0.1, 0.06, 0.012, 0.8, 0.205, FZ + 0.0, P.mossDark);
  box(0.09, 0.05, 0.012, -0.79, 0.205, FZ + 0.0, P.moss);
  box(0.012, 0.05, 0.1, SX + 0.004, 0.2, -0.78, P.mossDark);

  // ---- Soot and water-stain streaks down the front ------------------------
  const streak = (x: number, top: number, len: number, w: number, color: string) =>
    box(w, len, 0.005, x, top - len / 2, FZ + 0.005, color);
  streak(-0.1, 0.22, 0.17, 0.05, P.soot);
  streak(-0.04, 0.22, 0.12, 0.025, P.soot);
  streak(0.0, 0.22, 0.2, 0.03, P.waterStain);
  streak(0.17, 0.22, 0.14, 0.04, P.soot);
  streak(0.3, 0.22, 0.09, 0.02, P.waterStain);
  streak(-0.3, 0.22, 0.12, 0.035, P.waterStain);
  streak(-0.74, 0.22, 0.1, 0.03, P.soot);
  streak(0.0, 0.3, 0.04, 0.06, P.soot); // soot at the gutter outlet
  // stains down the cornice front
  box(0.045, 0.07, 0.004, -0.1, 0.27, 0.882, P.waterStain);
  box(0.03, 0.06, 0.004, 0.17, 0.27, 0.882, P.soot);
  // side stains
  box(0.005, 0.12, 0.04, SX + 0.005, 0.16, -0.4, P.waterStain);
  box(0.005, 0.1, 0.03, -SX - 0.005, 0.16, 0.35, P.soot);

  // ---- Cracks (thin dark parts) --------------------------------------------
  box(0.2, 0.003, 0.008, -0.3, 0.3, -0.35, P.crack, [0, 28, 0]);
  box(0.12, 0.003, 0.008, -0.2, 0.3, -0.27, P.crack, [0, -35, 0]);
  box(0.16, 0.003, 0.008, 0.5, 0.3, 0.45, P.crack, [0, 62, 0]);
  box(0.006, 0.09, 0.004, 0.45, 0.1, FZ + 0.004, P.crack, [0, 0, 12]);
  box(0.006, 0.06, 0.004, 0.48, 0.045, FZ + 0.004, P.crack, [0, 0, -20]);
  box(0.004, 0.08, 0.006, SX + 0.004, 0.1, -0.5, P.crack, [10, 0, 0]);

  // ---- Pale chip patches -----------------------------------------------------
  const chip = (x: number, y: number, z: number, w: number, h: number, d: number, rot?: [number, number, number]) =>
    box(w, h, d, x, y, z, P.stoneLight, rot);
  chip(-0.62, 0.3, 0.3, 0.07, 0.004, 0.05, [0, 20, 0]);
  chip(0.66, 0.3, -0.45, 0.06, 0.004, 0.08, [0, -30, 0]);
  chip(0.62, 0.1, FZ + 0.003, 0.06, 0.05, 0.005, [0, 0, 10]);
  chip(-0.58, 0.03, FZ + 0.0, 0.08, 0.035, 0.005);
  chip(0.82, 0.27, 0.6, 0.006, 0.03, 0.07);
  // chipped corner notch on the cornice
  box(0.05, 0.035, 0.05, 0.835, 0.282, 0.865, P.stoneDark);
  box(0.04, 0.025, 0.04, -0.835, 0.285, -0.865, P.stoneDark);
}
    return buildLedge;
  })(),
  // torso
  (() => {
function buildTorso({ b, J, P, M }: Ctx) {
  const R = rng(11);

  // ---------- helpers ----------
  const ico = (rx: number, ry: number, rz: number, d = 1) => new THREE.IcosahedronGeometry(1, d).scale(rx, ry, rz);
  const smooth = (x: number) => x * x * (3 - 2 * x);
  const keyed = (ts: number[], vs: number[], t: number) => {
    if (t <= ts[0]) return vs[0];
    for (let i = 1; i < ts.length; i++) {
      if (t <= ts[i]) {
        const u = (t - ts[i - 1]) / Math.max(1e-6, ts[i] - ts[i - 1]);
        return vs[i - 1] + (vs[i] - vs[i - 1]) * smooth(u);
      }
    }
    return vs[vs.length - 1];
  };

  // ---------- body: loft-like sweep over pelvis, spine2, chest ----------
  const bodyPts: [number, number, number][] = [
    [0, 0.66, -0.38],
    [0, 0.68, -0.2],
    [0, 0.83, 0.05],
    [0, 0.965, 0.27],
    [0, 1.05, 0.4],
  ];
  const bodyPath = catmull(bodyPts);
  const bts = bodyPts.map((p) => bodyPath.closestT(p));
  const bRx = [0.17, 0.28, 0.27, 0.31, 0.2];
  const bRy = [0.15, 0.23, 0.25, 0.21, 0.17];
  const body = b.sweep(
    bodyPath,
    (t: number): [number, number] => [keyed(bts, bRx, t), keyed(bts, bRy, t)],
    {
      bone: [J.pelvis, J.spine2, J.chest],
      color: P.stone,
      sectors: [
        [-60, 60, P.stoneLight],
        [125, 235, P.stoneDark],
      ],
      sides: 10,
      smooth: false,
      caps: "round",
    },
  );

  // ---------- tail ----------
  const tailPts: [number, number, number][] = [
    [0, 0.66, -0.3],
    [0, 0.6, -0.58],
    [-0.2, 0.47, -0.75],
    [-0.5, 0.4, -0.7],
    [-0.62, 0.41, -0.58],
    [M.tailTip[0], M.tailTip[1], M.tailTip[2]],
  ];
  const tailPath = catmull(tailPts);
  const tts = tailPts.map((p) => tailPath.closestT(p));
  const tR = [0.1, 0.095, 0.075, 0.058, 0.048, 0.04];
  const tail = b.sweep(tailPath, (t: number) => keyed(tts, tR, t), {
    bone: [J.tail1, J.tail2, J.tail3, J.tail4, J.tail5],
    color: P.stone,
    sectors: [
      [-55, 55, P.stoneLight],
      [130, 230, P.stoneDark],
    ],
    sides: 8,
    smooth: false,
    caps: "round",
  });

  // tail collar bands
  for (const t of [0.3, 0.55, 0.8]) {
    const pts: any[] = [];
    for (let a = 0; a < 360; a += 30) pts.push(tail.at(t, a, 0.008));
    b.sweep(catmull(pts, { closed: true }), 0.011, { color: P.stoneDark, sides: 4 });
  }
  // tail ridge spines
  [0.08, 0.22, 0.36, 0.5, 0.64, 0.78].forEach((t, i) => {
    const k = 0.04 - i * 0.004;
    b.stick(new THREE.ConeGeometry(k, k * 2.4, 5), P.stoneLight, tail.at(t, 0), { embed: 0.25, flow: tail.at(t, 0).tangent });
  });

  // spade tip
  {
    const d = new THREE.Vector3(-0.52, 0.06, 0.85).normalize();
    const across: [number, number, number] = [0.85, 0, 0.52];
    const tip = new THREE.Vector3(...M.tailTip);
    const start = tip.clone().addScaledVector(d, -0.03);
    const spade = b.extrude(
      [
        [0, 0, "sharp"],
        [0.06, 0.07, "sharp"],
        [0.18, 0, "sharp"],
        [0.06, -0.07, "sharp"],
      ],
      { at: start, x: [d.x, d.y, d.z], y: across, thickness: 0.036, color: P.stoneLight, bone: J.tail5 },
    );
    const end = start.clone().addScaledVector(d, 0.17).add(new THREE.Vector3(0, 0.02, 0));
    b.rod(start.clone().add(new THREE.Vector3(0, 0.02, 0)), end, [0.014, 0.006], { color: P.stoneDark, bone: J.tail5 });
    // edge chisel highlights
    for (const sg of [1, -1]) {
      const a = start.clone().addScaledVector(d, 0.06).addScaledVector(new THREE.Vector3(...across), sg * 0.06).add(new THREE.Vector3(0, 0.02, 0));
      b.rod(start.clone().add(new THREE.Vector3(0, 0.02, 0)), a, 0.006, { color: P.mortar, bone: J.tail5 });
      b.rod(a, end, 0.006, { color: P.mortar, bone: J.tail5 });
    }
    void spade;
  }

  // ---------- haunches ----------
  const hauches: any[] = [];
  for (const s of [1, -1]) {
    const c: [number, number, number] = [s * 0.28, 0.7, -0.2];
    const h = b.part(ico(0.19, 0.22, 0.25, 1), P.stone, { bone: J.pelvis, at: c, flat: true });
    hauches.push({ s, c, h });
    const surf = b.surface(h);
    const top = surf.around(c).at(s * 25, 70);
    if (top) b.stick(new THREE.BoxGeometry(0.15, 0.035, 0.18), P.stoneLight, top, { embed: 0.4 });
    // hip knob
    const side = surf.around(c).at(s * 90, 15);
    if (side) b.stick(ico(0.045, 0.03, 0.045, 0), P.stoneLight, side, { embed: 0.3 });
    // soot patch + drip
    const soot = surf.around(c).at(s * 80, -10);
    if (soot) {
      b.stick(ico(0.06, 0.01, 0.08, 0), P.soot, soot, { embed: 0.5, spin: 20 });
      b.stick(ico(0.015, 0.008, 0.06, 0), P.soot, soot.moved([0, 0, -0.07]), { embed: 0.5 });
    }
    // moss on haunch top
    const mt = surf.around(c).at(s * 20, 60);
    if (mt) {
      b.stick(ico(0.05, 0.012, 0.04, 0), P.mossDark, mt, { embed: 0.5, spin: R() * 360 });
      b.stick(ico(0.03, 0.02, 0.025, 0), P.moss, mt, { embed: 0.5, spin: R() * 360 });
    }
  }

  // ---------- shoulders ----------
  for (const s of [1, -1]) {
    const c: [number, number, number] = [s * 0.3, 0.97, 0.3];
    const sh = b.part(ico(0.2, 0.19, 0.21, 1), P.stone, { bone: J.chest, at: c, flat: true });
    const surf = b.surface(sh);
    const cap = surf.around(c).at(0, 80);
    if (cap) b.stick(new THREE.BoxGeometry(0.19, 0.035, 0.16), P.stoneLight, cap, { embed: 0.4 });
    // studs / chisel ridges on the shoulder
    [[s * 55, 55], [s * 70, 30], [s * 40, 35]].forEach(([az, el], i) => {
      const hh = surf.around(c).at(az, el);
      if (hh) b.stick(new THREE.ConeGeometry(0.025 - i * 0.002, 0.06, 5), P.stoneLight, hh, { embed: 0.25 });
    });
    // moss on top
    const mt = surf.around(c).at(s * 30, 65);
    if (mt) {
      b.stick(ico(0.075, 0.014, 0.06, 0), P.mossDark, mt, { embed: 0.5, spin: 30 });
      b.stick(ico(0.045, 0.022, 0.035, 0), P.moss, mt, { embed: 0.5, spin: 70 });
    }
    // crack
    const c1 = surf.around(c).at(s * 100, 20);
    if (c1) {
      b.stick(new THREE.BoxGeometry(0.006, 0.004, 0.09), P.crack, c1, { embed: 0.5, spin: 25 });
      b.stick(new THREE.BoxGeometry(0.006, 0.004, 0.05), P.crack, c1.moved([0.02, 0, 0.04]), { embed: 0.5, spin: -35 });
    }
  }

  // ---------- spinal knobs and ridge blades ----------
  const knobT = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
  knobT.forEach((t, i) => {
    const k = 0.04 + 0.016 * Math.sin(Math.PI * (0.2 + i / 9));
    const at = body.at(t, 0);
    b.stick(new THREE.CylinderGeometry(k * 1.5, k * 1.7, 0.03, 6), P.stoneDark, at, { embed: 0.5 });
    b.stick(new THREE.ConeGeometry(k, k * 2.3, 5), P.stoneLight, at, { embed: 0.2 });
    if (i < knobT.length - 1) {
      const tm = t + 0.05;
      const bp = body.at(tm, 0);
      b.stick(new THREE.ConeGeometry(0.035, 0.06, 4).scale(0.3, 1, 1), P.stoneLight, bp, { embed: 0.2, flow: bp.tangent });
    }
  });

  // ---------- ribs on flanks ----------
  [0.34, 0.41, 0.48, 0.55, 0.62, 0.69].forEach((t) => {
    for (const s of [1, -1]) {
      const pts: any[] = [];
      for (let a = 52; a <= 138; a += 14) pts.push(body.at(t, s * a, 0.008));
      b.sweep(catmull(pts), [0.005, 0.016, 0.013, 0.004].length ? [0.004, 0.016, 0.014, 0.004] : 0.012, {
        color: P.stoneLight,
        sides: 5,
        caps: "round",
      });
    }
  });

  // ---------- plated belly bands ----------
  [0.2, 0.3, 0.4, 0.5, 0.6].forEach((t) => {
    const pts: any[] = [];
    const pts2: any[] = [];
    for (let a = 112; a <= 248; a += 17) {
      pts.push(body.at(t, a, 0.012));
      pts2.push(body.at(t + 0.016, a, 0.016));
    }
    b.sweep(catmull(pts), [0.014, 0.03, 0.03, 0.014], { color: P.stoneDeep, sides: 6, caps: "round" });
    b.sweep(catmull(pts2), 0.007, { color: P.mortar, sides: 4, caps: "round" });
  });

  // ---------- pectoral plates ----------
  const chestC: [number, number, number] = [0, 0.97, 0.27];
  const bodySurf = b.surface(body);
  for (const s of [1, -1]) {
    const hh = bodySurf.around(chestC).at(s * 24, 8);
    if (hh) {
      b.stick(new THREE.BoxGeometry(0.17, 0.035, 0.13), P.stoneDark, hh, { embed: 0.4, spin: s * 12 });
      b.stick(new THREE.BoxGeometry(0.15, 0.035, 0.1), P.stoneLight, hh.moved([0, 0.012, 0.005]), { embed: 0.3, spin: s * 12 });
      b.stick(ico(0.02, 0.012, 0.02, 0), P.stoneDark, hh.moved([0, 0.03, 0]), { embed: 0.3 });
    }
  }
  const sternum = bodySurf.around(chestC).at(0, -12);
  if (sternum) b.stick(new THREE.ConeGeometry(0.03, 0.12, 4).scale(0.5, 1, 1), P.stoneLight, sternum, { embed: 0.3 });

  // ---------- wing root sockets ----------
  for (const m of [M.wingRootL, M.wingRootR]) {
    const hit = bodySurf.nearest(m);
    b.stick(new THREE.CylinderGeometry(0.08, 0.095, 0.05, 6), P.stoneDark, hit, { embed: 0.5 });
    b.stick(new THREE.CylinderGeometry(0.05, 0.055, 0.04, 6), P.stoneDeep, hit.moved([0, 0.02, 0]), { embed: 0.3 });
    b.stick(ico(0.028, 0.02, 0.028, 0), P.stoneLight, hit.moved([0, 0.04, 0]), { embed: 0.3 });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      b.stick(ico(0.012, 0.01, 0.012, 0), P.rust, hit.moved([Math.cos(a) * 0.07, 0.01, Math.sin(a) * 0.07]), { embed: 0.4 });
    }
  }

  // ---------- moss on the back ----------
  [[0.22, 28, 0.06], [0.36, -30, 0.07], [0.5, 22, 0.055], [0.64, -38, 0.06], [0.45, 55, 0.04], [0.3, -58, 0.04]].forEach(
    ([t, a, r]) => {
      const hh = body.at(t, a);
      b.stick(ico(r, 0.012, r * 0.8, 0), P.mossDark, hh, { embed: 0.5, spin: R() * 360 });
      b.stick(ico(r * 0.6, 0.02, r * 0.5, 0), P.moss, hh, { embed: 0.5, spin: R() * 360 });
    },
  );
  // moss on tail top
  [0.18, 0.46].forEach((t) => {
    const hh = tail.at(t, 40);
    b.stick(ico(0.035, 0.01, 0.03, 0), P.mossDark, hh, { embed: 0.5 });
    b.stick(ico(0.02, 0.016, 0.018, 0), P.moss, hh, { embed: 0.5 });
  });

  // ---------- cracks and chips ----------
  const crack = (pts: [number, number][], tgt: any = body) =>
    b.sweep(polyline(pts.map(([t, a]) => tgt.at(t, a, 0.004))), 0.005, { color: P.crack, sides: 4, caps: "flat" });
  crack([[0.42, 70], [0.45, 80], [0.47, 72], [0.51, 86], [0.54, 78]]);
  crack([[0.28, -75], [0.31, -66], [0.33, -78], [0.37, -70]]);
  crack([[0.3, 30], [0.33, 38], [0.34, 30], [0.38, 42]], tail);
  [[0.38, 45], [0.58, -50], [0.25, -35], [0.7, 40]].forEach(([t, a]) => {
    b.stick(ico(0.03, 0.008, 0.022, 0), P.stoneLight, body.at(t, a), { embed: 0.5, spin: R() * 180 });
  });
  b.stick(ico(0.025, 0.008, 0.018, 0), P.stoneLight, tail.at(0.62, -45), { embed: 0.5 });

  // soot streak on belly flank
  b.stick(ico(0.05, 0.008, 0.1, 0), P.soot, body.at(0.3, 100), { embed: 0.5 });
  void hauches;
}
    return buildTorso;
  })(),
  // head
  (() => {
type V = [number, number, number];
type Pt = [number, number] | [number, number, "sharp"];

function buildHead({ b, J, P, M }: Ctx) {
  const head = J.head;
  const jaw = J.jaw;
  const n1 = J.neck1;
  const n2 = J.neck2;

  // ---------- helpers ----------
  const norm = (d: V) => new THREE.Vector3(d[0], d[1], d[2]).normalize();

  const box = (w: number, h: number, d: number, color: string, at: V, bone: any = head, rot?: V) => {
    const o: any = { at, bone };
    if (rot) o.rotation = rot;
    return b.part(new THREE.BoxGeometry(w, h, d), color, o);
  };

  const blob = (rx: number, ry: number, rz: number, color: string, at: V, bone: any = head, rot?: V, seg: [number, number] = [7, 5]) => {
    const o: any = { at, bone, flat: true };
    if (rot) o.rotation = rot;
    return b.part(new THREE.SphereGeometry(1, seg[0], seg[1]).scale(rx, ry, rz), color, o);
  };

  // cone whose base centre is `base`, pointing along dir
  const spike = (base: V, dir: V, r: number, h: number, color: string, bone: any = head, sides = 5) => {
    const d = norm(dir);
    const c: V = [base[0] + (d.x * h) / 2, base[1] + (d.y * h) / 2, base[2] + (d.z * h) / 2];
    return b.part(new THREE.ConeGeometry(r, h, sides), color, { at: c, bone, dir: [d.x, d.y, d.z], flat: true });
  };

  // cylinder / frustum from a to c (r0 at a, r1 at c)
  const seg = (a: V, c: V, r0: number, r1: number, sides: number, color: string, bone: any) => {
    const d = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const len = d.length();
    d.normalize();
    return b.part(new THREE.CylinderGeometry(r1, r0, len, sides), color, {
      at: [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2],
      dir: [d.x, d.y, d.z],
      bone,
      flat: true,
    });
  };

  const ring = (at: V, dir: V, r: number, h: number, sides: number, color: string, bone: any) =>
    b.part(new THREE.CylinderGeometry(r, r, h, sides), color, { at, dir, bone, flat: true });

  // dome of the cranium: surface height at (x, z)
  const DOME_C: V = [0, 1.38, 0.565];
  const domeY = (x: number, z: number) => {
    const q = 1 - (x / 0.255) ** 2 - ((z - DOME_C[2]) / 0.19) ** 2;
    return DOME_C[1] + 0.075 * Math.sqrt(Math.max(0, q));
  };

  // ---------- neck ----------
  const a1: V = [0, 1.04, 0.34];
  const b1: V = [0, 1.17, 0.5];
  const b2: V = [0, 1.23, 0.62];
  seg(a1, b1, 0.15, 0.145, 6, P.stone, n1);
  seg([0, 1.15, 0.48], b2, 0.145, 0.14, 6, P.stone, n2);
  // collar bands
  const d1 = norm([b1[0] - a1[0], b1[1] - a1[1], b1[2] - a1[2]]);
  const dd1: V = [d1.x, d1.y, d1.z];
  ring([0, 1.04 + 0.13 * 0.3, 0.34 + 0.16 * 0.3], dd1, 0.162, 0.024, 6, P.stoneDark, n1);
  ring([0, 1.04 + 0.13 * 0.7, 0.34 + 0.16 * 0.7], dd1, 0.158, 0.02, 6, P.stoneDark, n1);
  // nape blocks
  [0.05, 0.3].forEach((t, i) => {
    box(0.08 - i * 0.01, 0.05, 0.07, P.stoneLight, [0, a1[1] + 0.13 * t + 0.145, a1[2] + 0.16 * t], n1, [-38, 0, 0]);
  });
  // throat plates under the chin, on the neck front
  [0.35, 0.65].forEach((t) => {
    box(0.16, 0.012, 0.05, P.stoneDark, [0, a1[1] + 0.13 * t - 0.12, a1[2] + 0.16 * t + 0.1], n1, [-38, 0, 0]);
  });
  // occiput plate at back of skull
  box(0.3, 0.12, 0.02, P.stoneDark, [0, 1.24, 0.395]);
  box(0.2, 0.05, 0.02, P.stoneLight, [0, 1.33, 0.392]);

  // ---------- skull ----------
  box(0.5, 0.28, 0.34, P.stone, [0, 1.26, 0.57]);
  blob(0.255, 0.075, 0.19, P.stone, DOME_C, head, undefined, [8, 5]);
  // light top planes on the skull sides
  box(0.5, 0.025, 0.3, P.stoneLight, [0, 1.395, 0.57]);

  // ridge blocks along the crown
  for (let i = 0; i < 5; i++) {
    const z = 0.47 + 0.055 * i;
    box(0.045, 0.04 - 0.003 * i, 0.045, P.stoneLight, [0, domeY(0, z) + 0.008, z], head, [-12 + i * 6, 0, 0]);
  }
  // moss on the crown
  blob(0.06, 0.012, 0.045, P.moss, [0.11, domeY(0.11, 0.5) + 0.002, 0.5]);
  blob(0.05, 0.012, 0.04, P.moss, [-0.1, domeY(-0.1, 0.55) + 0.002, 0.55]);
  blob(0.04, 0.012, 0.035, P.moss, [0.05, domeY(0.05, 0.64) + 0.002, 0.64]);
  blob(0.028, 0.012, 0.025, P.mossDark, [0.11, domeY(0.11, 0.5) + 0.01, 0.5]);
  blob(0.025, 0.012, 0.022, P.mossDark, [-0.1, domeY(-0.1, 0.55) + 0.01, 0.55]);
  // cracks and chips on the skull
  box(0.006, 0.004, 0.09, P.crack, [-0.07, domeY(-0.07, 0.45) + 0.003, 0.46], head, [0, 20, 0]);
  box(0.006, 0.004, 0.05, P.crack, [-0.1, domeY(-0.1, 0.4) + 0.001, 0.41], head, [0, -30, 0]);
  box(0.035, 0.004, 0.025, P.stoneLight, [0.17, domeY(0.17, 0.6) + 0.001, 0.6], head, [0, 25, 0]);

  // ---------- brow ----------
  box(0.1, 0.07, 0.11, P.stoneLight, [0, 1.405, 0.75]);
  box(0.04, 0.04, 0.012, P.stoneDark, [0, 1.405, 0.808], head, [0, 0, 45]);
  for (const s of [1, -1]) {
    box(0.28, 0.07, 0.12, P.stoneLight, [s * 0.14, 1.415, 0.745], head, [0, 0, s * 15]);
    for (let i = 0; i < 4; i++) {
      const ux = 0.04 + 0.055 * i;
      const y = 1.415 + (ux - 0.14) * 0.268 + 0.01;
      box(0.012, 0.045, 0.01, P.stoneDeep, [s * ux, y, 0.804], head, [0, 0, s * 15]);
    }
    // moss on the outer brow top
    blob(0.04, 0.01, 0.035, P.moss, [s * 0.22, 1.415 + (0.22 - 0.14) * 0.268 + 0.04, 0.74]);

    // ---------- eye socket + eye ----------
    box(0.15, 0.1, 0.035, P.stoneDeep, [s * 0.11, 1.33, 0.74]);
    box(0.17, 0.022, 0.05, P.stoneLight, [s * 0.11, 1.272, 0.745]); // lower lid ledge
    glow(b.part(new THREE.SphereGeometry(0.034, 8, 6), P.eyeGlow, { at: [s * 0.11, 1.33, 0.755], bone: head, flat: true }), 1.6);
    box(0.009, 0.044, 0.006, P.soot, [s * 0.11, 1.33, 0.787]);
    // water stain streak below the eye
    box(0.012, 0.05, 0.005, P.waterStain, [s * 0.197, 1.31, 0.742]);

    // ---------- cheeks ----------
    box(0.09, 0.06, 0.17, P.stoneLight, [s * 0.225, 1.2, 0.69], head, [0, s * 15, 0]);
    box(0.003, 0.03, 0.04, P.stoneLight, [s * 0.1835, 1.21, 0.8]); // chip on muzzle side
    for (let i = 0; i < 3; i++) {
      const col = [P.stoneLight, P.stone, P.stoneDark][i];
      spike([s * 0.245, 1.19 - 0.04 * i, 0.6 - 0.02 * i], [s * 0.85, -0.15, -0.55], 0.042 - 0.006 * i, 0.13 - 0.015 * i, col);
      spike([s * 0.24, 1.17 - 0.04 * i, 0.52 - 0.02 * i], [s * 0.75, -0.25, -0.6], 0.034 - 0.005 * i, 0.1 - 0.012 * i, [P.stone, P.stoneDark, P.stoneDark][i]);
    }
    // hinge knob
    ring([s * 0.2, 1.12, 0.735], [1, 0, 0], 0.035, 0.04, 6, P.stoneDark, head);
    // mouth-corner folds
    box(0.005, 0.012, 0.09, P.stoneDeep, [s * 0.183, 1.185, 0.84]);
    box(0.005, 0.05, 0.012, P.stoneDeep, [s * 0.183, 1.2, 0.745], head, [0, 0, s * -18]);
    // tear/soot stains down the side of the cranium
    box(0.004, 0.08, 0.012, P.waterStain, [s * 0.2515, 1.2, 0.5]);
    box(0.004, 0.05, 0.01, P.crack, [s * 0.2515, 1.3, 0.58], head, [0, 0, s * 12]);
    box(0.004, 0.04, 0.01, P.crack, [s * 0.2515, 1.26, 0.585], head, [0, 0, s * -25]);
  }

  // ---------- muzzle / upper jaw ----------
  box(0.36, 0.1, 0.22, P.stone, [0, 1.23, 0.83]); // muzzle block
  box(0.3, 0.02, 0.18, P.stoneLight, [0, 1.29, 0.82]); // top cap
  box(0.1, 0.05, 0.2, P.stoneLight, [0, 1.305, 0.82], head, [-6, 0, 0]); // nose bridge
  box(0.38, 0.03, 0.025, P.stoneLight, [0, 1.195, 0.945]); // lip front
  for (const s of [1, -1]) {
    box(0.02, 0.03, 0.2, P.stoneLight, [s * 0.185, 1.195, 0.83]); // lip sides
    // chisel grooves on the muzzle top
    box(0.01, 0.004, 0.17, P.stoneDark, [s * 0.075, 1.302, 0.82]);
    box(0.01, 0.004, 0.14, P.stoneDark, [s * 0.125, 1.302, 0.83]);
  }
  // pug nose
  box(0.14, 0.07, 0.08, P.stoneLight, [0, 1.285, 0.925]);
  box(0.06, 0.012, 0.05, P.stone, [0, 1.327, 0.93]);
  for (const s of [1, -1]) {
    box(0.045, 0.055, 0.06, P.stoneLight, [s * 0.088, 1.272, 0.915], head, [0, 0, s * -12]); // nose wings
    box(0.036, 0.028, 0.012, P.stoneDeep, [s * 0.042, 1.282, 0.966], head, [0, 0, s * 22]); // nostril
    box(0.012, 0.03, 0.012, P.stoneDeep, [s * 0.076, 1.268, 0.955]); // flare slit
  }
  // mouth interior
  box(0.3, 0.1, 0.01, P.stoneDeep, [0, 1.14, 0.725]);
  box(0.3, 0.004, 0.2, P.stoneDeep, [0, 1.179, 0.83]);
  // upper fangs: 2 canines, 2 incisors pairs, 2 side molars
  for (const s of [1, -1]) {
    spike([s * 0.135, 1.18, 0.915], [0, -1, 0.1], 0.028, 0.095, P.fang, head, 5);
    spike([s * 0.055, 1.18, 0.925], [0, -1, 0.08], 0.02, 0.05, P.fang, head, 5);
    spike([s * 0.17, 1.18, 0.8], [0, -1, 0], 0.018, 0.04, P.fang, head, 4);
  }

  // ---------- lower jaw ----------
  box(0.32, 0.07, 0.21, P.stone, [0, 1.065, 0.835], jaw); // body
  box(0.2, 0.09, 0.05, P.stoneLight, [0, 1.055, 0.95], jaw); // protruding chin
  box(0.28, 0.01, 0.19, P.stoneDeep, [0, 1.105, 0.835], jaw); // floor
  box(0.15, 0.02, 0.13, P.rust, [0, 1.12, 0.82], jaw); // tongue
  box(0.14, 0.012, 0.03, P.rust, [0, 1.13, 0.9], jaw, [10, 0, 0]);
  for (const s of [1, -1]) {
    box(0.03, 0.04, 0.2, P.stone, [s * 0.145, 1.12, 0.835], jaw); // lip walls
    box(0.012, 0.06, 0.2, P.stoneDark, [s * 0.162, 1.065, 0.835], jaw); // darker flank band
    // lower underbite fangs
    spike([s * 0.095, 1.1, 0.948], [0, 1, 0.12], 0.024, 0.085, P.fang, jaw, 5);
    spike([s * 0.025, 1.1, 0.948], [0, 1, 0.1], 0.02, 0.06, P.fang, jaw, 5);
  }
  // chin grooves
  box(0.004, 0.06, 0.006, P.stoneDark, [0.04, 1.055, 0.976], jaw);
  box(0.004, 0.06, 0.006, P.stoneDark, [-0.04, 1.055, 0.976], jaw);
  // beard tuft
  box(0.13, 0.03, 0.08, P.stoneDark, [0, 1.0, 0.935], jaw);
  spike([-0.045, 0.985, 0.95], [0, -1, 0.3], 0.028, 0.045, P.stoneLight, jaw, 4);
  spike([0, 0.985, 0.955], [0, -1, 0.35], 0.032, 0.06, P.stoneLight, jaw, 4);
  spike([0.045, 0.985, 0.95], [0, -1, 0.3], 0.028, 0.045, P.stoneLight, jaw, 4);
  // soot under the chin and stains down the front
  box(0.12, 0.004, 0.12, P.soot, [0, 1.029, 0.84], jaw);
  box(0.02, 0.004, 0.14, P.soot, [0.07, 1.029, 0.84], jaw);
  box(0.016, 0.07, 0.005, P.waterStain, [0.07, 1.055, 0.977], jaw);
  box(0.012, 0.05, 0.005, P.soot, [-0.1, 1.06, 0.9755], jaw);

  // ---------- horns ----------
  for (const s of [1, -1]) {
    const pts: V[] = [
      [s * 0.15, 1.37, 0.66],
      [s * 0.19, 1.43, 0.58],
      [s * 0.23, 1.49, 0.51],
      [s * 0.25, 1.54, 0.44],
    ];
    const path = catmull(pts);
    b.sweep(path, [0.058, 0.006], {
      bone: head,
      color: P.stoneLight,
      bands: [
        [0.55, P.stoneLight],
        [0.85, P.stoneDark],
        [1, P.claw],
      ],
      caps: { start: "flat", end: "point" },
      sides: 6,
    });
    blob(0.075, 0.055, 0.075, P.stoneLight, [s * 0.15, 1.37, 0.66]);
    [0.22, 0.42, 0.68].forEach((t, i) => {
      const p = path.at(t);
      const T = path.tangentAt(t);
      const r = (0.058 * (1 - t) + 0.006 * t) * 1.28;
      ring([p.x, p.y, p.z], [T.x, T.y, T.z], r, 0.018, 6, i < 2 ? P.stoneDark : P.stoneLight, head);
    });
  }

  // ---------- ears ----------
  const EAR: Pt[] = [
    [0, 0],
    [0.108, 0.036],
    [0.144, 0.252, "sharp"],
    [0.048, 0.168],
    [0, 0.12],
  ];
  const EAR_IN: Pt[] = [
    [0.024, 0.036],
    [0.09, 0.06],
    [0.114, 0.204, "sharp"],
    [0.054, 0.144],
    [0.024, 0.108],
  ];
  for (const s of [1, -1]) {
    const X: V = [s, 0, 0];
    const Y: V = [0, 1, -0.35];
    const zdir = new THREE.Vector3(...X).cross(new THREE.Vector3(...Y)).normalize();
    if (zdir.z < 0) zdir.multiplyScalar(-1);
    const base: V = [s * 0.235, 1.25, 0.52];
    b.extrude(EAR, { at: base, x: X, y: Y, thickness: [0.05, 0.025], color: P.stone, bone: head });
    const inner: V = [base[0] + zdir.x * 0.0225, base[1] + zdir.y * 0.0225, base[2] + zdir.z * 0.0225];
    b.extrude(EAR_IN, { at: inner, x: X, y: Y, thickness: 0.012, color: P.stoneDark, bone: head });
    // ear base block seating it on the skull
    box(0.05, 0.1, 0.07, P.stoneDark, [s * 0.255, 1.28, 0.52], head, [0, 0, s * -10]);
  }

  return;
}
    return buildHead;
  })(),
  // limbs
  (() => {
function buildLimbs({ b, J, P, M }: Ctx) {
  const R = rng(23);
  const CHIP = "#c4c2b4";
  type Sw = ReturnType<typeof b.sweep>;
  const ico = (r: number) => new THREE.IcosahedronGeometry(r, 0);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // groove strip seated on a tube
  const groove = (sw: Sw, t: number, ang: number, len: number, color = P.stoneDeep, w = 0.014) =>
    b.stick(box(w, 0.012, len), color, sw.at(t, ang), { embed: 0.45 });
  // short chord tick across a tube
  const tick = (sw: Sw, t: number, ang: number, w: number, color = P.stoneDeep) =>
    b.stick(box(w, 0.012, 0.014), color, sw.at(t, ang), { embed: 0.45 });
  // flat moss blob
  const moss = (sw: Sw, t: number, ang: number, rx: number, rz: number, dark = false) =>
    b.stick(ico(1), dark ? P.mossDark : P.moss, sw.at(t, ang), { embed: 0.3, scale: [rx, 0.012, rz], spin: R() * 180 });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = J["shoulder" + side];
    const el = J["elbow" + side];
    const wr = J["wrist" + side];
    const hd = J["hand" + side];
    const hip = J["hip" + side];
    const knee = J["knee" + side];
    const ankle = J["ankle" + side];
    const foot = J["foot" + side];
    const hm = M["hand" + side];
    const fm = M["foot" + side];
    const hx = hm[0];
    const fx = fm[0];

    // ---------------------------------------------------------------- ARM
    const arm = b.sweep(catmull([sh.at, el.at, wr.at]), [0.11, 0.13, 0.1, 0.082, 0.072], {
      bone: [sh, el, wr],
      sides: 8,
      smooth: false,
      color: P.stone,
      sectors: [
        [-28, 28, P.stoneLight],
        [115, 245, P.stoneDark],
      ],
    });
    // deltoid mass + elbow knob
    b.part(ico(1), P.stone, { bone: sh, at: [sh.at.x + s * 0.07, sh.at.y - 0.03, sh.at.z - 0.02], scale: [0.11, 0.1, 0.12] });
    b.part(ico(1), P.stoneLight, { bone: sh, at: [sh.at.x + s * 0.08, sh.at.y + 0.04, sh.at.z - 0.02], scale: [0.08, 0.04, 0.09] });
    b.part(ico(0.075), P.stoneLight, { bone: el, at: [el.at.x + s * 0.06, el.at.y + 0.01, el.at.z - 0.075], flat: true });
    b.part(ico(0.04), P.stoneDark, { bone: el, at: [el.at.x + s * 0.1, el.at.y + 0.01, el.at.z - 0.09], flat: true });
    // chisel grooves
    for (const ang of [-70, 70]) groove(arm, 0.2, s * ang, 0.12);
    for (const ang of [-50, 0, 50]) groove(arm, 0.7, s * ang, 0.16);
    for (const t of [0.52, 0.6, 0.68]) tick(arm, t, 0, 0.07);
    // moss / chips / cracks
    moss(arm, 0.14, s * 10, 0.045, 0.05);
    moss(arm, 0.2, s * -25, 0.025, 0.03, true);
    b.stick(box(0.035, 0.008, 0.028), CHIP, arm.at(0.78, s * 35), { embed: 0.4, spin: 20 });
    b.stick(box(0.006, 0.008, 0.07), P.crack, arm.at(0.38, s * 60), { embed: 0.4, spin: 18 });

    // wrist cuff
    const hdir = new THREE.Vector3().subVectors(hd.at, wr.at).normalize();
    b.part(new THREE.CylinderGeometry(0.085, 0.092, 0.05, 8), P.stoneDark, {
      bone: wr,
      at: [wr.at.x, wr.at.y - 0.01, wr.at.z + 0.01],
      dir: hdir,
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.088, 0.088, 0.012, 8), P.stoneDeep, {
      bone: wr,
      at: [wr.at.x, wr.at.y - 0.03, wr.at.z + 0.025],
      dir: hdir,
      flat: true,
    });

    // ---------------------------------------------------------------- HAND
    b.part(box(0.19, 0.084, 0.15), P.stone, { bone: hd, at: [hx, 0.338, 0.645], flat: true });
    b.part(box(0.15, 0.014, 0.11), P.stoneLight, { bone: hd, at: [hx, 0.385, 0.64], flat: true });
    b.part(box(0.17, 0.02, 0.014), P.stoneDeep, { bone: hd, at: [hx, 0.33, 0.715] });
    b.part(box(0.04, 0.006, 0.05), P.soot, { bone: hd, at: [hx + s * 0.02, 0.393, 0.62] });

    const digits: { n: string; pts: [number, number, number][]; claw: [number, number, number] }[] = [];
    for (const [n, dx, sp] of [
      ["A", 0.065, 0.018],
      ["B", 0.0, 0.0],
      ["C", -0.065, -0.018],
    ] as [string, number, number][]) {
      const x = hx + s * dx;
      digits.push({
        n,
        pts: [
          [x, 0.345, 0.7],
          [x + s * sp, 0.338, 0.745],
          [x + s * sp * 1.8, 0.326, 0.787],
        ],
        claw: [x + s * sp * 2.5, 0.298, 0.838],
      });
    }
    digits.push({
      n: "D",
      pts: [
        [hx - s * 0.08, 0.342, 0.63],
        [hx - s * 0.118, 0.336, 0.668],
        [hx - s * 0.143, 0.326, 0.705],
      ],
      claw: [hx - s * 0.165, 0.298, 0.752],
    });
    for (const d of digits) {
      const ch = b.chain(`finger${side}${d.n}`, catmull(d.pts), {
        parent: hd,
        names: [`finger${side}${d.n}1`, `finger${side}${d.n}2`],
        role: "digit",
      });
      b.sweep(ch, [0.031, 0.023], { sides: 6, smooth: false, color: P.stone });
      const tip = d.pts[2];
      const ctrl: [number, number, number] = [(tip[0] + d.claw[0]) / 2, tip[1] + 0.006, (tip[2] + d.claw[2]) / 2 + 0.012];
      b.sweep(bezier(tip, ctrl, d.claw), [0.02, 0], {
        bone: ch.joints[1],
        color: P.claw,
        sides: 6,
        caps: { start: "flat", end: "point" },
      });
      b.part(ico(0.029), P.stoneLight, {
        bone: ch.joints[0],
        at: [d.pts[0][0], 0.372, d.pts[0][2] - 0.005],
        scale: [1, 0.8, 1],
        flat: true,
      });
    }

    // ---------------------------------------------------------------- LEG
    const leg = b.sweep(catmull([hip.at, knee.at, ankle.at]), [0.12, 0.14, 0.1, 0.07, 0.055], {
      bone: [hip, knee, ankle],
      sides: 8,
      smooth: false,
      color: P.stone,
      sectors: [
        [-28, 28, P.stoneLight],
        [115, 245, P.stoneDark],
      ],
    });
    // bulky haunch
    const hc = new THREE.Vector3().lerpVectors(hip.at, knee.at, 0.42);
    b.part(ico(1), P.stone, { bone: hip, at: [hc.x + s * 0.03, hc.y - 0.01, hc.z - 0.03], scale: [0.15, 0.17, 0.2] });
    b.part(ico(1), P.stoneLight, { bone: hip, at: [hc.x + s * 0.03, hc.y + 0.1, hc.z - 0.03], scale: [0.12, 0.07, 0.15] });
    b.part(ico(1), P.stoneDark, { bone: hip, at: [hc.x + s * 0.02, hc.y - 0.12, hc.z], scale: [0.11, 0.06, 0.15] });
    // knee knob + hock
    b.part(ico(0.078), P.stoneLight, { bone: knee, at: [knee.at.x + s * 0.05, knee.at.y + 0.02, knee.at.z + 0.07], flat: true });
    b.part(ico(0.04), P.stoneDark, { bone: knee, at: [knee.at.x + s * 0.09, knee.at.y + 0.02, knee.at.z + 0.08], flat: true });
    b.part(ico(0.058), P.stoneLight, { bone: ankle, at: [ankle.at.x, ankle.at.y + 0.01, ankle.at.z - 0.06], flat: true });
    b.spike([ankle.at.x, ankle.at.y - 0.01, ankle.at.z - 0.09], [0, -0.45, -1], 0.1, 0.022, { bone: ankle, color: P.claw });
    // chisel grooves, moss, cracks
    for (const ang of [-60, 60]) groove(leg, 0.22, s * ang, 0.14);
    for (const ang of [-40, 0, 40]) groove(leg, 0.74, s * ang, 0.15);
    for (const t of [0.6, 0.68, 0.82]) tick(leg, t, 0, 0.06);
    moss(leg, 0.18, s * 8, 0.06, 0.07);
    moss(leg, 0.3, s * -20, 0.04, 0.045, true);
    moss(leg, 0.12, s * 40, 0.03, 0.035, true);
    b.stick(box(0.006, 0.008, 0.09), P.crack, leg.at(0.3, s * 75), { embed: 0.4, spin: 25 });
    b.stick(box(0.035, 0.008, 0.03), CHIP, leg.at(0.62, s * -50), { embed: 0.4, spin: 10 });

    // ---------------------------------------------------------------- FOOT
    b.part(box(0.125, 0.077, 0.15), P.stoneDark, { bone: ankle, at: [fx, 0.336, ankle.at.z], flat: true });
    b.sweep(catmull([[fx, 0.372, -0.02], [fx, 0.34, 0.17]]), (t: number) => [0.057 - 0.005 * t, 0.037], {
      bone: [ankle, foot],
      section: "box",
      caps: "flat",
      color: P.stone,
    });
    b.part(box(0.09, 0.012, 0.09), P.stoneLight, { bone: foot, at: [fx, 0.381, 0.08], flat: true });
    b.part(box(0.1, 0.02, 0.012), P.stoneDeep, { bone: foot, at: [fx, 0.37, 0.178] });

    for (const [n, dx, sp] of [
      ["A", 0.052, 0.016],
      ["B", 0.0, 0.0],
      ["C", -0.052, -0.016],
    ] as [string, number, number][]) {
      const x = fx + s * dx;
      const pts: [number, number, number][] = [
        [x, 0.336, 0.2],
        [x + s * sp, 0.332, 0.258],
        [x + s * sp * 1.8, 0.326, 0.308],
      ];
      const ch = b.chain(`toe${side}${n}`, catmull(pts), {
        parent: foot,
        names: [`toe${side}${n}1`, `toe${side}${n}2`],
        role: "digit",
      });
      b.sweep(ch, [0.033, 0.024], { sides: 6, smooth: false, color: P.stone });
      const tip = pts[2];
      const end: [number, number, number] = [x + s * sp * 2.6, 0.298, 0.368];
      b.sweep(bezier(tip, [(tip[0] + end[0]) / 2, tip[1] + 0.006, (tip[2] + end[2]) / 2 + 0.012], end), [0.021, 0], {
        bone: ch.joints[1],
        color: P.claw,
        sides: 6,
        caps: { start: "flat", end: "point" },
      });
      b.part(ico(0.03), P.stoneLight, {
        bone: ch.joints[0],
        at: [x, 0.368, 0.205],
        scale: [1, 0.8, 1],
        flat: true,
      });
    }

    // soot scuffs on the ledge and moss on the foot
    for (const [px, pz, rx, rz] of [
      [fx + s * 0.03, 0.1, 0.07, 0.05],
      [fx - s * 0.04, 0.3, 0.05, 0.035],
      [hx + s * 0.02, 0.76, 0.06, 0.04],
    ] as number[][]) {
      b.part(ico(1), P.soot, { bone: pz > 0.5 ? hd : foot, at: [px, 0.3, pz], scale: [rx, 0.004, rz], rotation: [0, R() * 90, 0] });
    }
    b.part(ico(1), P.mossDark, { bone: ankle, at: [fx + s * 0.02, 0.37, -0.1], scale: [0.04, 0.012, 0.045] });
  }
}
    return buildLimbs;
  })(),
  // wings
  (() => {
function buildWings({ b, J, P, M }: Ctx) {
  const rand = rng(77);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  type Edge = { at: (t: number) => THREE.Vector3; tan: (t: number) => THREE.Vector3 };
  const chainEdge = (c: any): Edge => ({
    at: (t) => new THREE.Vector3().copy(c.at(t).at),
    tan: (t) => new THREE.Vector3().copy(c.at(t).tangent),
  });
  const pathEdge = (p: any): Edge => ({
    at: (t) => new THREE.Vector3().copy(p.at(t)),
    tan: (t) => new THREE.Vector3().copy(p.tangentAt(t)),
  });

  // point and normal on the membrane midsurface between two edges
  const panelAt = (A: Edge, B: Edge, t: number, u: number) => {
    const pA = A.at(t);
    const pB = B.at(t);
    const pos = pA.clone().lerp(pB, u);
    const tan = A.tan(t).normalize();
    const n = pB.clone().sub(pA).cross(tan).normalize();
    if (n.y < 0) n.negate();
    return { pos, n, tan };
  };

  const OFF = 0.0165;

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const armJ = J[`wingArm${side}`];
    const elbowJ = J[`wingElbow${side}`];
    const wristJ = J[`wingWrist${side}`];
    const armBones = [armJ, elbowJ, wristJ];

    const root = V(0, 0, 0).copy(armJ.at);
    const elbow = V(0, 0, 0).copy(elbowJ.at);
    const wrist = V(0, 0, 0).copy(wristJ.at);
    const flank = V(0.2 * s, 0.82, -0.4);

    // ---------------- arm bone ----------------
    const armPath = catmull([root.clone(), elbow.clone(), wrist.clone()]);
    const rad = (t: number) => 0.075 - 0.025 * t;
    const armSweep = b.sweep(armPath, rad, {
      bone: armBones,
      color: P.stone,
      sides: 8,
      smooth: false,
      sectors: [
        [-55, 55, P.stoneLight],
        [130, 230, P.stoneDark],
      ],
    });
    // chisel collars
    for (const t0 of [0.16, 0.3, 0.72, 0.84]) {
      b.sweep(armPath, (t: number) => rad(t) + 0.012, {
        from: t0,
        to: t0 + 0.035,
        caps: "flat",
        bone: armBones,
        color: P.stoneDark,
        sides: 8,
        smooth: false,
      });
    }
    // moss on the upper arm
    b.along(armSweep, 4, (at: any) =>
      b.stick(new THREE.SphereGeometry(0.028 + 0.016 * rand(), 5, 3), P.moss, at, {
        embed: 0.55,
        scale: [1.2, 0.5, 1.7],
      }),
    );
    b.along(armSweep, 3, (at: any) =>
      b.stick(new THREE.SphereGeometry(0.016 + 0.008 * rand(), 5, 3), P.mossDark, at, {
        embed: 0.4,
        scale: [1.1, 0.5, 1.4],
      }),
    );

    // shoulder block
    const shoulderAt = V(0.2 * s, 1.05, 0.04);
    b.part(new THREE.BoxGeometry(0.19, 0.2, 0.17), P.stone, {
      at: shoulderAt,
      bone: armJ,
      rotation: [10, s * 20, s * -20],
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.14, 0.05, 0.12), P.stoneLight, {
      at: shoulderAt.clone().add(V(0.01 * s, 0.11, -0.01)),
      bone: armJ,
      rotation: [10, s * 20, s * -20],
      flat: true,
    });

    // elbow knuckle, spike, moss cap
    b.part(new THREE.DodecahedronGeometry(0.08, 0), P.stoneLight, { at: elbow, bone: elbowJ, flat: true });
    b.spike(elbow.clone(), [0.35 * s, 1, -0.15], 0.1, 0.04, { color: P.stoneLight, bone: elbowJ, sides: 6 });
    b.part(new THREE.SphereGeometry(0.035, 5, 3), P.moss, {
      at: elbow.clone().add(V(-0.02 * s, 0.06, 0.02)),
      bone: elbowJ,
      scale: [1.2, 0.45, 1.2],
    });

    // wrist knuckle and hook claw
    b.part(new THREE.DodecahedronGeometry(0.065, 0), P.stoneLight, { at: wrist, bone: wristJ, flat: true });
    b.sweep(
      bezier(
        wrist.clone().add(V(0.03 * s, 0.05, 0.02)),
        wrist.clone().add(V(0.1 * s, 0.17, 0.08)),
        wrist.clone().add(V(0.14 * s, 0.1, 0.2)),
      ),
      [0.04, 0],
      { bone: wristJ, color: P.claw, caps: { start: "flat", end: "point" }, sides: 6 },
    );

    // ---------------- fingers ----------------
    const tips = [V(1.1 * s, 1.55, -0.7), V(1.05 * s, 1.0, -0.85), V(0.85 * s, 0.65, -0.75)];
    const bows = [V(0.05 * s, 0.07, 0.02), V(0.03 * s, 0.05, 0.02), V(0, 0.05, 0.03)];
    const fingers: any[] = [];
    tips.forEach((tip, i) => {
      const mid = wrist.clone().lerp(tip, 0.5).add(bows[i]);
      const chain = b.chain(`wingFinger${side}${i + 1}`, catmull([wrist.clone(), mid, tip.clone()]), {
        parent: wristJ,
        role: "wing",
      });
      fingers.push(chain);
      const fs = b.sweep(chain, [0.032, 0.012], { color: P.wingRib, sides: 6, smooth: false });
      // ridges along the rib
      b.along(fs, 2, (at: any) =>
        b.stick(new THREE.BoxGeometry(0.04, 0.03, 0.03), P.stoneLight, at, { embed: 0.5, flat: true }),
      );
      // mid knuckle
      b.part(new THREE.OctahedronGeometry(0.04, 0), P.stoneLight, {
        at: mid,
        bone: chain.joints[1],
        flat: true,
      });
      // tip claw, swept back
      const tipFrame = chain.at(1);
      const dir = new THREE.Vector3()
        .copy(tipFrame.tangent)
        .multiplyScalar(0.6)
        .add(V(0, 0.15, -0.7))
        .normalize();
      b.spike(tipFrame, dir, 0.08, 0.022, { color: P.claw, sides: 5 });
    });

    // ---------------- membrane ----------------
    const flankPath = polyline([wrist.clone(), flank.clone()]);
    const eF1 = chainEdge(fingers[0]);
    const eF2 = chainEdge(fingers[1]);
    const eF3 = chainEdge(fingers[2]);
    const eFlank = pathEdge(flankPath);

    // between finger 1 and finger 2
    b.membrane(fingers[0], fingers[1], { color: P.wing, thickness: 0.03, scallop: 0.14 });
    // between finger 2 and finger 3
    b.membrane(fingers[1], fingers[2], { color: P.wing, thickness: 0.03, scallop: 0.14 });
    // finger 3 to the flank
    b.membrane(fingers[2], flankPath, { color: P.wing, thickness: 0.03, scallop: 0.16 });
    // arm to flank (inner panel)
    b.membrane(armPath, polyline([root.clone(), flank.clone(), wrist.clone()]), {
      color: P.wing,
      thickness: 0.03,
      bone: armJ,
    });
    // leading panel between elbow, wrist and first finger
    b.membrane(
      polyline([elbow.clone(), wrist.clone(), wrist.clone().lerp(tips[0], 0.5).add(bows[0]), tips[0].clone()]),
      polyline([elbow.clone(), tips[0].clone()]),
      { color: P.wing, thickness: 0.03, scallop: 0.08, bone: elbowJ },
    );

    // ---------------- seams, chips, streaks ----------------
    const seam = (A: Edge, B: Edge, t: number) => {
      const p0 = panelAt(A, B, t, 0.05);
      const p1 = panelAt(A, B, t, 0.95);
      for (const sg of [1, -1]) {
        b.rod(
          p0.pos.clone().addScaledVector(p0.n, OFF * sg),
          p1.pos.clone().addScaledVector(p1.n, OFF * sg),
          0.006,
          P.stoneDeep,
          { bone: wristJ, sides: 5 },
        );
      }
    };
    const patch = (
      A: Edge,
      B: Edge,
      t: number,
      u: number,
      w: number,
      len: number,
      color: string,
      both: boolean,
    ) => {
      const p = panelAt(A, B, t, u);
      for (const sg of both ? [1, -1] : [1]) {
        b.part(new THREE.BoxGeometry(w, 0.006, len), color, {
          at: p.pos.clone().addScaledVector(p.n, OFF * sg),
          dir: p.n.clone().multiplyScalar(sg),
          up: p.tan,
          bone: wristJ,
          flat: true,
        });
      }
    };

    seam(eF1, eF2, 0.4);
    seam(eF1, eF2, 0.72);
    seam(eF2, eF3, 0.32);
    seam(eF2, eF3, 0.58);
    seam(eF2, eF3, 0.82);
    seam(eF3, eFlank, 0.45);
    seam(eF3, eFlank, 0.72);

    // carved chips
    patch(eF1, eF2, 0.55, 0.4, 0.07, 0.05, P.stoneLight, false);
    patch(eF2, eF3, 0.68, 0.62, 0.06, 0.05, P.wingRib, false);
    patch(eF3, eFlank, 0.55, 0.5, 0.08, 0.06, P.stoneLight, false);

    // soot and water-stain streaks near the lower edge
    patch(eF2, eF3, 0.84, 0.5, 0.025, 0.14, P.waterStain, true);
    patch(eF3, eFlank, 0.84, 0.3, 0.03, 0.14, P.soot, true);
    patch(eF3, eFlank, 0.8, 0.7, 0.022, 0.12, P.waterStain, true);
  }
}
    return buildWings;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "cathedralGargoyle" });
  const J: Record<string, Joint> = {};
  J["pelvis"] = b.joint("pelvis", { at: [0,0.68,-0.2], dir: [0,0.49,0.87], role: "spine" });
  J["spine2"] = b.joint("spine2", { parent: J["pelvis"], at: [0,0.82,0.05], dir: [0,0.5,0.87], role: "spine" });
  J["chest"] = b.joint("chest", { parent: J["spine2"], at: [0,0.98,0.28], dir: [0,0.5,0.87], role: "spine" });
  J["neck1"] = b.joint("neck1", { parent: J["chest"], at: [0,1.08,0.38], dir: [0,0.6,0.8], role: "neck" });
  J["neck2"] = b.joint("neck2", { parent: J["neck1"], at: [0,1.16,0.5], dir: [0,0.3,0.95], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck2"], at: [0,1.2,0.58], dir: [0,-0.1,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.12,0.72], dir: [0,-0.05,1], role: "jaw" });
  J["tail1"] = b.joint("tail1", { parent: J["pelvis"], at: [0,0.66,-0.3], dir: [0,-0.2,-1], role: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,0.6,-0.58], dir: [-0.35,-0.25,-0.9], role: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [-0.2,0.47,-0.75], dir: [-0.9,-0.1,-0.1], role: "tail" });
  J["tail4"] = b.joint("tail4", { parent: J["tail3"], at: [-0.5,0.4,-0.7], dir: [-0.6,0.1,0.6], role: "tail" });
  J["tail5"] = b.joint("tail5", { parent: J["tail4"], at: [-0.62,0.41,-0.58], dir: [-0.3,0.1,0.9], role: "tail" });
  J["shoulderL"] = b.joint("shoulderL", { parent: J["chest"], at: [0.3,1,0.3], dir: [0.3,-0.8,-0.2], role: "arm", group: "arms" });
  J["elbowL"] = b.joint("elbowL", { parent: J["shoulderL"], at: [0.42,0.72,0.2], dir: [-0.2,-0.7,0.7], role: "arm", group: "arms" });
  J["wristL"] = b.joint("wristL", { parent: J["elbowL"], at: [0.34,0.4,0.58], dir: [0,-0.4,0.9], role: "arm", group: "arms" });
  J["handL"] = b.joint("handL", { parent: J["wristL"], at: [0.34,0.34,0.7], dir: [0,0,1], role: "arm", group: "arms" });
  J["shoulderR"] = b.joint("shoulderR", { parent: J["chest"], at: [-0.3,1,0.3], dir: [-0.3,-0.8,-0.2], role: "arm", group: "arms" });
  J["elbowR"] = b.joint("elbowR", { parent: J["shoulderR"], at: [-0.42,0.72,0.2], dir: [0.2,-0.7,0.7], role: "arm", group: "arms" });
  J["wristR"] = b.joint("wristR", { parent: J["elbowR"], at: [-0.34,0.4,0.58], dir: [0,-0.4,0.9], role: "arm", group: "arms" });
  J["handR"] = b.joint("handR", { parent: J["wristR"], at: [-0.34,0.34,0.7], dir: [0,0,1], role: "arm", group: "arms" });
  J["hipL"] = b.joint("hipL", { parent: J["pelvis"], at: [0.3,0.68,-0.2], dir: [0.3,0.4,0.85], role: "leg", group: "legs" });
  J["kneeL"] = b.joint("kneeL", { parent: J["hipL"], at: [0.42,0.82,0.12], dir: [-0.15,-0.9,-0.4], role: "leg", group: "legs" });
  J["ankleL"] = b.joint("ankleL", { parent: J["kneeL"], at: [0.36,0.42,-0.06], dir: [0,-0.4,0.9], role: "leg", group: "legs" });
  J["footL"] = b.joint("footL", { parent: J["ankleL"], at: [0.36,0.34,0.18], dir: [0,0,1], role: "leg", group: "legs" });
  J["hipR"] = b.joint("hipR", { parent: J["pelvis"], at: [-0.3,0.68,-0.2], dir: [-0.3,0.4,0.85], role: "leg", group: "legs" });
  J["kneeR"] = b.joint("kneeR", { parent: J["hipR"], at: [-0.42,0.82,0.12], dir: [0.15,-0.9,-0.4], role: "leg", group: "legs" });
  J["ankleR"] = b.joint("ankleR", { parent: J["kneeR"], at: [-0.36,0.42,-0.06], dir: [0,-0.4,0.9], role: "leg", group: "legs" });
  J["footR"] = b.joint("footR", { parent: J["ankleR"], at: [-0.36,0.34,0.18], dir: [0,0,1], role: "leg", group: "legs" });
  J["wingArmL"] = b.joint("wingArmL", { parent: J["chest"], at: [0.2,1.05,0.1], dir: [0.6,0.7,-0.35], role: "wing", group: "wings" });
  J["wingElbowL"] = b.joint("wingElbowL", { parent: J["wingArmL"], at: [0.55,1.5,-0.1], dir: [0.9,-0.3,-0.3], role: "wing", group: "wings" });
  J["wingWristL"] = b.joint("wingWristL", { parent: J["wingElbowL"], at: [0.95,1.3,-0.3], dir: [0.8,0.1,-0.5], role: "wing", group: "wings" });
  J["wingArmR"] = b.joint("wingArmR", { parent: J["chest"], at: [-0.2,1.05,0.1], dir: [-0.6,0.7,-0.35], role: "wing", group: "wings" });
  J["wingElbowR"] = b.joint("wingElbowR", { parent: J["wingArmR"], at: [-0.55,1.5,-0.1], dir: [-0.9,-0.3,-0.3], role: "wing", group: "wings" });
  J["wingWristR"] = b.joint("wingWristR", { parent: J["wingElbowR"], at: [-0.95,1.3,-0.3], dir: [-0.8,0.1,-0.5], role: "wing", group: "wings" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
