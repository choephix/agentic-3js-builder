import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { polyline } from "../src/path";
import { cellPaint, pixelArt, snapColor } from "../kits/pixel";

export const meta = {
  name: "Amiga Sea Turtle",
  description: "A metre-twenty green sea turtle resting belly-down on sand: a rigid scuted carapace, creamy plastron, beaked face, separate lower jaw and four articulated paddles. Thirty-two Amiga colours, 12.5 mm square pixels and ordered Bayer dithering throughout.",
  builtBy: "GPT-6 Astra",
};

// Thirty-two colours on the Amiga's 4-bit-per-channel DAC, arranged into smooth ramps.
const GREEN = ["#112222", "#224433", "#335533", "#446644", "#558844", "#779955", "#99bb66", "#bbcc88"].map(c => snapColor(c, 16));
const JADE = ["#112233", "#224444", "#336655", "#448866", "#66aa77", "#88bb88", "#aacc99", "#ccd daa".replace(" ", "")].map(c => snapColor(c, 16));
const SAND = ["#443322", "#665533", "#887744", "#aa9955", "#bbaa77", "#ccbb88", "#ddcc99", "#eedd bb".replace(" ", "")].map(c => snapColor(c, 16));
const DETAIL = ["#111122", "#332233", "#664444", "#996655", "#cc8855", "#ddaa66", "#ffdd99", "#ffffdd"].map(c => snapColor(c, 16));
const PIXEL = 0.0125;
type Point = [number, number, number];

// Five vertebral scutes and four pairs of costals; a Voronoi partition paints fitted polygons, not scattered tiles.
const SCUTES: [number, number][] = [];
for (let i = 0; i < 5; i++) SCUTES.push([0, -0.34 + i * 0.145]);
for (const s of [-1, 1]) for (let i = 0; i < 4; i++) SCUTES.push([s * 0.19, -0.265 + i * 0.145]);
const shellPaint = cellPaint(PIXEL, c => {
  const x = c.at.x, z = c.at.z + 0.07;
  const radius = Math.hypot(x / 0.32, z / 0.42);
  if (radius > 0.87) {
    const angle = Math.atan2(x / 0.32, z / 0.42);
    const seam = Math.abs(Math.sin(angle * 12)) < 0.14;
    return seam ? GREEN[1] : c.pick(GREEN, 0.52 + 0.18 * (1 - radius));
  }
  let first = Infinity, second = Infinity, which = 0;
  for (let i = 0; i < SCUTES.length; i++) {
    const d = Math.hypot(x - SCUTES[i][0], c.at.z - SCUTES[i][1]);
    if (d < first) { second = first; first = d; which = i; }
    else if (d < second) second = d;
  }
  const edge = second - first;
  if (edge < 0.013) return GREEN[0];
  if (edge < 0.027) return GREEN[5];
  const ring = Math.floor(first / 0.022) % 3 === 0 ? -0.09 : 0;
  return c.pick(GREEN, 0.45 + 0.25 * (1 - radius) + ring + (which % 3) * 0.035);
}, { dither: true });
const skinPaint = cellPaint(PIXEL, c => {
  const row = Math.floor(c.v / 4), col = ((c.u + (row & 1) * 2) % 5 + 5) % 5;
  const seam = ((c.v % 4 + 4) % 4 === 0 || col === 0);
  return seam ? JADE[2] : c.pick(JADE, 0.44 + 0.22 * Math.sin(c.at.z * 7) + c.at.y * 0.6);
}, { dither: true });
const bellyPaint = cellPaint(PIXEL, c => {
  const seam = Math.abs(c.at.x) < PIXEL * 0.6 || Math.abs(Math.sin(c.at.z * 24)) < 0.14;
  return seam ? SAND[3] : c.pick(SAND, 0.79 + 0.12 * Math.cos(c.at.z * 11));
}, { dither: true });
const beakPaint = cellPaint(PIXEL, c => c.pick(SAND, 0.6 + c.at.y), { dither: true });
const mouthPaint = cellPaint(PIXEL, c => c.pick(DETAIL.slice(0, 4), 0.3 + 0.3 * Math.cos(c.at.z * 22)), { dither: true });
const sandPaint = cellPaint(PIXEL, c => c.pick(SAND, 0.60 + 0.13 * Math.sin(c.at.x * 20 + c.at.z * 12) + 0.06 * Math.cos(c.at.z * 55)), { dither: true });
const eyeArt = pixelArt([
  ".gggg.", "gakkkg", "gkwkkg", "gkkkkg", ".gkkg.", "..gg..",
], { g: DETAIL[5], a: DETAIL[4], k: DETAIL[0], w: DETAIL[7] });

export default function build() {
  const b = createBuilder({ name: "amigaSeaTurtle", paintSize: 2048 });
  const core = b.joint("hips", { at: [0, 0.12, -0.07], dir: [0, 0, 1], role: "spine", group: "body" });
  const neck = b.chain("neck", [[0, 0.145, 0.25], [0, 0.155, 0.36], [0, 0.17, 0.43]], { parent: core, count: 2, role: "neck" });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.17, 0.41], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.116, 0.43], dir: [0, 0, 1], role: "jaw" });
  const tail = b.chain("tail", [[0, 0.08, -0.40], [0, 0.065, -0.48], [0, 0.05, -0.54]], { parent: core, count: 2, role: "tail" });
  const limbs = [1, -1].flatMap(s => [true, false].map(front => {
    const side = s > 0 ? "L" : "R";
    const points: Point[] = front
      ? [[s * 0.22, 0.11, 0.19], [s * 0.39, 0.073, 0.21], [s * 0.66, 0.047, 0.07]]
      : [[s * 0.19, 0.09, -0.28], [s * 0.31, 0.055, -0.34], [s * 0.43, 0.035, -0.44]];
    const chain = b.chain(`${front ? "frontFlipper" : "rearFlipper"}${side}`, points, {
      parent: core, count: 2, role: front ? "arm" : "leg",
      names: front ? [`shoulder${side}`, `wrist${side}`] : [`hip${side}`, `ankle${side}`],
    });
    return { s, front, points, chain };
  }));

  // A rigid shell stays a shell in the flex tests. Lathe profile is elliptical in plan and deliberately faceted.
  const dome = new THREE.LatheGeometry([
    new THREE.Vector2(0, 0.052), new THREE.Vector2(0.30, 0.052),
    new THREE.Vector2(0.32, 0.082), new THREE.Vector2(0.30, 0.155),
    new THREE.Vector2(0.24, 0.245), new THREE.Vector2(0.13, 0.285), new THREE.Vector2(0, 0.295),
  ], 16).scale(1, 1, 1.3125);
  b.part(dome, shellPaint, { bone: core, at: [0, 0, -0.07], group: "carapace", name: "scutedCarapace" });
  b.part(new THREE.CylinderGeometry(0.275, 0.23, 0.052, 12).scale(1, 1, 1.34), bellyPaint, {
    bone: core, at: [0, 0.026, -0.07], group: "plastron", name: "flatRestingPlastron",
  });
  b.sweep(neck, t => [0.088 - t * 0.012, 0.069 - t * 0.005], { color: skinPaint, sides: 6, caps: "round", group: "head", name: "neckSkin" });
  const skull = b.part(new THREE.SphereGeometry(1, 8, 6).scale(0.105, 0.086, 0.14), skinPaint, {
    bone: head, at: [0, 0.181, 0.48], group: "head", name: "head",
  });
  b.frustumBox([0, 0.148, 0.55], [0, 0.137, 0.65], [0.148, 0.065], [0.09, 0.040], {
    bone: head, color: beakPaint, group: "head", name: "upperBeak",
  });
  b.extrude([[0.0, 0.03], [0.17, 0.025], [0.20, 0], [0.18, -0.018], [0, -0.028]], {
    at: jaw, x: [0, 0, 1], y: [0, 1, 0], thickness: 0.115, color: bellyPaint, bone: jaw, group: "jaw", name: "lowerJaw",
  });
  b.part(new THREE.BoxGeometry(0.095, 0.0125, 0.15), mouthPaint, { bone: jaw, at: [0, 0.137, 0.52], group: "jaw", name: "mouthInterior" });
  for (const s of [1, -1]) {
    const hit = b.surface(skull).ray([s * 0.3, 0.211, 0.51], [-s, 0, 0]);
    if (!hit) throw new Error("Turtle eye missed its cheek");
    b.part(new THREE.PlaneGeometry(PIXEL * 6, PIXEL * 6), "#ffffff", {
      bone: head, at: hit.at.clone().addScaledVector(hit.n, 0.001), dir: hit.n, axis: "z", up: [0, 1, 0], texture: eyeArt, group: "head", name: s > 0 ? "eyeL" : "eyeR",
    });
    b.part(new THREE.BoxGeometry(PIXEL, PIXEL, PIXEL), DETAIL[0], { bone: head, at: [s * 0.024, 0.169, 0.61], group: "head", name: "nostril" });
  }

  // Both membrane faces share the two-bone chain, so wrists bend the complete paddle rather than a loose tip.
  for (const { s, front, points, chain } of limbs) {
    b.sweep(chain, t => [0.033 * (1 - t) + 0.007, 0.025 * (1 - t) + 0.006], {
      color: skinPaint, sides: 6, caps: "round", group: "flippers", name: "flipperLeadingEdge",
    });
    const leading: Point[] = front
      ? [points[0], [s * 0.40, 0.073, 0.28], points[2]]
      : [points[0], [s * 0.34, 0.055, -0.28], points[2]];
    const trailing: Point[] = front
      ? [[s * 0.20, 0.10, 0.12], [s * 0.40, 0.067, 0.095], points[2]]
      : [[s * 0.17, 0.08, -0.32], [s * 0.29, 0.053, -0.43], points[2]];
    b.membrane(polyline(leading), polyline(trailing), {
      bone: chain, thickness: 0.018, rows: 2, cols: 8, color: skinPaint, group: "flippers", name: front ? "broadFrontPaddle" : "smallRearPaddle",
    });
  }
  b.sweep(tail, [0.03, 0], { color: skinPaint, sides: 6, caps: "flat", group: "tail", name: "shortTail" });
  // A wafer-thin sand footprint belongs to the unbending root, not a flexed spine joint.
  b.part(new THREE.CylinderGeometry(1, 1, 0.002, 12).scale(0.54, 1, 0.55), sandPaint, {
    bone: core, at: [0, 0.001, -0.025], group: "sand", name: "sandFootprint",
  });
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });
  return b.root;
}
