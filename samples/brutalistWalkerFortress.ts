import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { Joint } from "../src/skeleton";
import { limb } from "../src/ik";
import { glow } from "../kits/glow";
import { mottle, stripes, paint, noise, mix, rgb, smoothstep } from "../src/paint";

export const meta = {
  name: "Brutalist Walker Fortress",
  description:
    "A 6 m four-legged walking fortress in raw board-marked concrete: stacked command block with balconies, stair tower, water tank, antenna masts, swivelling radar dish and a drawbridge ramp, on jointed slab-foot legs.",
};

const RECESS = "#232326";
const STEEL = "#565b61";
const STEEL_DARK = "#3a3d42";
const GLASS = "#43474e";
const LIT = "#ffc06a";
const BEACON = "#ff3b30";
const RUST = "#7e4a28";
const CONC = "#989388";
const CONC_DARK = "#7e7970";
const BOARD_LINE = "#857f75";

export default function build() {
  const b = createBuilder({ name: "brutalistWalkerFortress" });

  // ---------------------------------------------------------- paints
  // Board-marked concrete: horizontal plank lines, cloudy weathering, and
  // rust streaks bleeding down the front/back faces under the window band.
  const boards = stripes(CONC, BOARD_LINE, { size: 0.24, axis: "y", width: 0.09, wobble: 0.2, seed: 4 });
  const blotch = mottle(boards, CONC_DARK, { size: 1.1, seed: 6, contrast: 0.7 });
  const concrete = paint((p, n) => {
    const field = new THREE.Vector3(p.x * 6.0, p.y * 0.5, p.z * 6.0);
    const streak = noise(field, 0.4, 9);
    const band = (1 - smoothstep(4.0, 4.7, p.y)) * smoothstep(3.1, 3.6, p.y);
    const face = Math.max(0, Math.abs(n.z) - 0.5) * 2;
    const r = smoothstep(0.55, 0.85, streak) * Math.min(1, band * face);
    if (r <= 0) return blotch.at(p, n);
    return mix(blotch.at(p, n), rgb(RUST), Math.min(1, r * 0.85));
  });
  const rustSteel = mottle("#6d4a30", "#4e3420", { size: 0.35, seed: 11, contrast: 1 });

  const box = (
    w: number,
    h: number,
    d: number,
    color: string | typeof concrete | typeof rustSteel,
    bone: Joint,
    x: number,
    y: number,
    z: number,
  ) => b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: [x, y, z] });

  // ---------------------------------------------------------- skeleton
  const body = b.joint("body", { at: [0, 3.1, 0], role: "spine" });

  // Four legs: hip-knee-ankle chains solved with IK so slab feet plant flat.
  type XZ = { hip: [number, number, number]; ankle: [number, number, number] };
  const feet: Record<string, XZ> = {
    FL: { hip: [1.05, 2.9, 0.8], ankle: [1.18, 0.42, 0.86] },
    FR: { hip: [-1.05, 2.9, 0.8], ankle: [-1.18, 0.42, 0.86] },
    RL: { hip: [1.05, 2.9, -0.8], ankle: [1.18, 0.42, -0.86] },
    RR: { hip: [-1.05, 2.9, -0.8], ankle: [-1.18, 0.42, -0.86] },
  };
  const legs: Record<string, { hipJ: Joint; kneeJ: Joint; ankleJ: Joint }> = {};
  for (const s of ["FL", "FR", "RL", "RR"]) {
    const f = feet[s];
    const side = s.endsWith("L") ? 1 : -1;
    const front = s.startsWith("F") ? 1 : -1;
    const pts = limb(f.hip, f.ankle, [1.45, 1.25], [[side * 0.25, 0, front * 0.6]]);
    if (pts[pts.length - 1].distanceTo(new THREE.Vector3(...f.ankle)) > 1e-3)
      throw new Error(`leg ${s} too short for its foot`);
    const chain = b.chain(`leg${s}`, pts, {
      parent: body,
      names: [`hip${s}`, `knee${s}`, `ankle${s}`],
      role: "leg",
      contact: [f.ankle[0], 0, f.ankle[2]],
    });
    legs[s] = { hipJ: chain.joints[0], kneeJ: chain.joints[1], ankleJ: chain.joints[2] };
  }

  const rampHinge = b.joint("rampHinge", {
    parent: body,
    at: [0, 3.47, 1.12],
    dir: [0, 0, 1],
    role: "hinge",
  });
  const radar = b.joint("radar", {
    parent: body,
    at: [0.5, 5.75, 0.35],
    dir: [0, 1, 0],
    role: "hinge",
  });

  // ---------------------------------------------------------- legs
  for (const s of ["FL", "FR", "RL", "RR"]) {
    const f = feet[s];
    const { hipJ, kneeJ, ankleJ } = legs[s];
    const hip = new THREE.Vector3(...f.hip);
    const knee = kneeJ.at.clone();
    const ankle = ankleJ.at.clone();
    // Hip housing bolted under the belly tray.
    box(0.72, 0.62, 0.72, concrete, body, f.hip[0], 3.03, f.hip[2]);
    // Thigh and shin, ends buried past each joint so rigid pieces overlap.
    b.frustumBox(hip.clone().lerp(knee, -0.1), hip.clone().lerp(knee, 1.08), [0.56, 0.5], [0.4, 0.36], {
      bone: hipJ,
      color: concrete,
    });
    b.frustumBox(knee.clone().lerp(ankle, -0.12), knee.clone().lerp(ankle, 1.05), [0.4, 0.36], [0.26, 0.24], {
      bone: kneeJ,
      color: concrete,
    });
    // Knee collar + hydraulic ram on the shin.
    box(0.5, 0.34, 0.46, CONC_DARK, kneeJ, knee.x, knee.y, knee.z);
    b.rod([knee.x, knee.y - 0.1, knee.z + 0.26], [ankle.x, ankle.y + 0.55, ankle.z + 0.16], 0.07, {
      bone: kneeJ,
      color: STEEL_DARK,
    });
    // Ankle post + slab foot planted on the floor.
    box(0.32, 0.42, 0.36, concrete, ankleJ, ankle.x, ankle.y - 0.05, ankle.z);
    box(0.62, 0.16, 0.95, concrete, ankleJ, ankle.x, 0.08, ankle.z + 0.06);
    box(0.66, 0.07, 0.3, CONC_DARK, ankleJ, ankle.x, 0.035, ankle.z + 0.42);
  }

  // ---------------------------------------------------------- hull
  box(2.0, 0.32, 1.8, concrete, body, 0, 3.05, 0); // belly tray
  box(2.4, 1.5, 2.2, concrete, body, 0, 4.0, 0); // main command block
  box(1.9, 0.14, 1.7, RECESS, body, 0, 4.82, 0); // shadow gap
  box(1.8, 0.9, 1.6, concrete, body, 0, 5.2, -0.1); // upper block
  // Roof rim.
  box(1.94, 0.12, 0.1, CONC_DARK, body, 0, 5.68, 0.66);
  box(1.94, 0.12, 0.1, CONC_DARK, body, 0, 5.68, -0.86);
  box(0.1, 0.12, 1.62, CONC_DARK, body, 0.92, 5.68, -0.1);
  box(0.1, 0.12, 1.62, CONC_DARK, body, -0.92, 5.68, -0.1);
  // Cantilevered side slabs.
  for (const sd of [1, -1]) {
    box(0.5, 0.16, 2.0, concrete, body, sd * 1.4, 4.5, 0);
    box(0.5, 0.16, 1.6, concrete, body, sd * 1.4, 3.8, -0.1);
  }

  // ---------------------------------------------------------- windows
  // Deep-set slots: dark recess box + inset pane; a few burn warm.
  const slot = (x: number, y: number, z: number, lit: boolean, side: boolean) => {
    const g = side ? new THREE.BoxGeometry(0.06, 0.52, 0.16) : new THREE.BoxGeometry(0.16, 0.52, 0.06);
    b.part(g, RECESS, { bone: body, at: [x, y, z] });
    const pane = side ? new THREE.BoxGeometry(0.03, 0.44, 0.1) : new THREE.BoxGeometry(0.1, 0.44, 0.03);
    const px = side ? x + Math.sign(x) * 0.02 : x;
    const pz = side ? z : z + (z > 0 ? 0.02 : -0.02);
    const p = b.part(pane, lit ? LIT : GLASS, { bone: body, at: [px, y, pz] });
    if (lit) glow(p, 1.6);
  };
  // Front faces.
  slot(-0.7, 4.2, 1.1, false, false);
  slot(-0.25, 4.2, 1.1, true, false);
  slot(0.25, 4.2, 1.1, false, false);
  slot(0.7, 4.2, 1.1, false, false);
  slot(-0.45, 5.25, 0.7, false, false);
  slot(0, 5.25, 0.7, true, false);
  slot(0.45, 5.25, 0.7, false, false);
  // Rear faces.
  slot(-0.5, 4.2, -1.1, false, false);
  slot(0.5, 4.2, -1.1, true, false);
  slot(0, 5.25, -0.9, false, false);
  // Sides (clear of the cantilever slabs).
  for (const sd of [1, -1]) {
    slot(sd * 1.2, 4.2, 0.45, false, true);
    slot(sd * 1.2, 4.2, -0.45, sd > 0, true);
  }

  // ---------------------------------------------------------- balconies
  const barGeos: THREE.BufferGeometry[] = [];
  for (const y of [3.46, 4.08]) {
    box(1.5, 0.09, 0.5, concrete, body, 0, y, 1.35);
    box(1.5, 0.28, 0.06, concrete, body, 0, y + 0.18, 1.57);
    box(1.5, 0.04, 0.04, STEEL_DARK, body, 0, y + 0.52, 1.57);
    box(1.5, 0.03, 0.03, STEEL_DARK, body, 0, y + 0.36, 1.57);
    for (let i = 0; i <= 7; i++)
      barGeos.push(new THREE.BoxGeometry(0.03, 0.34, 0.03).translate(-0.7 + i * 0.2, y + 0.35, 1.57));
  }
  const bars = mergeGeometries(barGeos);
  if (bars) b.part(bars, STEEL_DARK, { bone: body, at: [0, 0, 0] });

  // ---------------------------------------------------------- stair tower (left/rear)
  box(0.8, 2.1, 0.8, concrete, body, -0.9, 4.0, -0.9);
  box(0.86, 0.12, 0.86, CONC_DARK, body, -0.9, 5.09, -0.9);
  // Stair slit windows up the tower front face, one lit.
  for (let i = 0; i < 4; i++) {
    const y = 3.55 + i * 0.36;
    b.part(new THREE.BoxGeometry(0.14, 0.3, 0.06), RECESS, { bone: body, at: [-0.86 + i * 0.04, y, -0.47] });
    if (i === 2) {
      const p = b.part(new THREE.BoxGeometry(0.09, 0.24, 0.03), LIT, {
        bone: body,
        at: [-0.86 + i * 0.04, y, -0.45],
      });
      glow(p, 1.4);
    }
  }

  // ---------------------------------------------------------- rear ladder
  b.rod([-0.5, 3.1, -1.14], [-0.5, 4.9, -1.14], 0.025, { bone: body, color: STEEL_DARK });
  b.rod([-0.14, 3.1, -1.14], [-0.14, 4.9, -1.14], 0.025, { bone: body, color: STEEL_DARK });
  const rungGeos: THREE.BufferGeometry[] = [];
  for (let i = 0; i <= 6; i++)
    rungGeos.push(
      new THREE.CylinderGeometry(0.018, 0.018, 0.36, 6).rotateZ(Math.PI / 2).translate(-0.32, 3.2 + i * 0.26, -1.14),
    );
  const rungs = mergeGeometries(rungGeos);
  if (rungs) b.part(rungs, STEEL_DARK, { bone: body, at: [0, 0, 0] });

  // ---------------------------------------------------------- rooftop
  // Water tank on legs, tucked behind the upper block silhouette.
  for (const dx of [0.28, -0.28])
    for (const dz of [0.28, -0.28]) box(0.09, 0.3, 0.09, STEEL_DARK, body, 0.15 + dx, 5.85, -0.55 + dz);
  b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.5, 12), rustSteel, {
    bone: body,
    at: [0.15, 6.18, -0.55],
  });
  b.part(new THREE.ConeGeometry(0.44, 0.2, 12), CONC_DARK, { bone: body, at: [0.15, 6.5, -0.55] });
  // Antenna masts + red beacon, kept low so the model stays ~6 m.
  b.rod([0.62, 5.74, -0.15], [0.62, 6.3, -0.15], 0.035, { bone: body, color: STEEL_DARK });
  b.rod([0.62, 6.05, -0.15], [0.9, 6.05, -0.15], 0.018, { bone: body, color: STEEL_DARK });
  const beacon = b.part(new THREE.SphereGeometry(0.06, 8, 6), BEACON, { bone: body, at: [0.62, 6.36, -0.15] });
  glow(beacon, 2.0);
  // Radar dish on its hinge: bowl on a post at the roof edge, facing up-forward.
  b.rod([0.5, 5.74, 0.4], [0.5, 6.02, 0.42], 0.06, { bone: radar, color: STEEL_DARK });
  b.part(new THREE.SphereGeometry(0.42, 14, 8, 0, Math.PI * 2, 0, 0.62), STEEL, {
    bone: radar,
    at: [0.5, 6.14, 0.44],
    rotation: [58, 0, 0],
  });
  b.rod([0.5, 6.0, 0.42], [0.5, 6.12, 0.46], 0.02, { bone: radar, color: STEEL_DARK });

  // ---------------------------------------------------------- drawbridge ramp (front)
  box(1.1, 0.85, 0.12, RECESS, body, 0, 3.87, 1.06);
  box(1.2, 0.1, 0.14, CONC_DARK, body, 0, 4.35, 1.06);
  b.part(new THREE.BoxGeometry(1.0, 0.09, 1.5), rustSteel, {
    bone: rampHinge,
    at: [0, 3.41, 1.12],
    rotation: [8, 0, 0],
  });
  const ribGeos: THREE.BufferGeometry[] = [];
  for (let i = 0; i <= 6; i++)
    ribGeos.push(new THREE.BoxGeometry(0.07, 0.03, 1.45).translate(-0.45 + i * 0.15, 3.46, 1.12));
  const ribs = mergeGeometries(ribGeos);
  if (ribs) b.part(ribs, STEEL_DARK, { bone: rampHinge, at: [0, 0, 0] });

  return b.root;
}
