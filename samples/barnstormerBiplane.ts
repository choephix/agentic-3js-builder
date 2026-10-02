import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { countershade, grain, paint, stripes } from "../src/paint";
import { polyline } from "../src/path";

const TEAL = "#4f9f9b";
const TEAL_DARK = "#31706f";
const CREAM = "#f7d89a";
const CORAL = "#e36d52";
const RED = "#b84a48";
const MUSTARD = "#e8b84d";
const WOOD = "#8b573e";
const WOOD_LIGHT = "#c78a58";
const NAVY = "#263c58";
const RUBBER = "#242b35";
const SKY = "#a6dcd1";
const WHITE = "#fff2cf";

const fuselagePaint = countershade(
  stripes(TEAL, CREAM, { size: 0.72, axis: "z", width: 0.42, wobble: 0.08, seed: 12 }),
  TEAL_DARK,
  { level: -0.28 },
);
const wingPaint = paint((_p, _n, s) => (s[1] > 0.22 ? CREAM : CORAL));
const woodPaint = grain(WOOD_LIGHT, WOOD, { size: 0.11, axis: "z", seed: 7 });

export const meta = {
  name: "Barnstormer Biplane",
  description: "A cheerful, riveted storybook biplane with candy-striped wings, wooden struts, and a jaunty propeller.",
  style: "whimsical",
  commit: "67d30d1",
};

export default function build() {
  const b = createBuilder({ name: "barnstormerBiplane", detail: 1.15, paintSize: 1024 });
  const root = b.joint("airframe", { at: [0, 1.32, 0], role: "spine" });
  const propHinge = b.joint("propeller", { parent: root, at: [0, 1.42, 2.61], dir: [0, 0, 1], role: "hinge" });
  const wheelL = b.joint("wheelL", { parent: root, at: [0.84, 0.29, 0.18], dir: [1, 0, 0], role: "hinge" });
  const wheelR = b.joint("wheelR", { parent: root, at: [-0.84, 0.29, 0.18], dir: [-1, 0, 0], role: "hinge" });
  const tailWheel = b.joint("tailWheel", { parent: root, at: [0, 0.16, -2.24], dir: [1, 0, 0], role: "hinge" });

  const fuselagePath = polyline([
    [0, 1.32, -2.68],
    [0, 1.35, -2.28],
    [0, 1.38, -1.55],
    [0, 1.4, -0.55],
    [0, 1.43, 0.55],
    [0, 1.45, 1.5],
    [0, 1.43, 2.26],
    [0, 1.42, 2.58],
  ]);
  b.sweep(
    fuselagePath,
    (t) => (t < 0.12 ? 0.24 + t * 1.7 : t > 0.86 ? 0.48 - (t - 0.86) * 2.5 : 0.44 + 0.06 * Math.sin(t * Math.PI)),
    { bone: root, color: fuselagePaint, sides: 10, caps: "round", name: "paintedFuselage", group: "airframe" },
  );
  b.sweep(fuselagePath.slice(0.86, 0.93), 0.51, { bone: root, color: MUSTARD, sides: 10, caps: "none", name: "noseCollar", group: "trim" });
  b.sweep(fuselagePath.slice(0.08, 0.13), 0.39, { bone: root, color: CREAM, sides: 10, caps: "none", name: "tailCollar", group: "trim" });

  const wingOutline = [[0, -0.63], [1.18, -0.6], [2.22, -0.38], [2.34, -0.1, "sharp"], [2.22, 0.42], [1.15, 0.6], [0, 0.58]];
  for (const s of [1, -1]) {
    b.extrude(wingOutline, { at: [0, 1.96, 0.08], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.115, bevel: 0.045, smoothing: 1, color: wingPaint, bone: root, name: s > 0 ? "upperWingL" : "upperWingR", group: "wings" });
    b.extrude(wingOutline, { at: [0, 1.18, 0.05], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.105, bevel: 0.04, smoothing: 1, color: wingPaint, bone: root, name: s > 0 ? "lowerWingL" : "lowerWingR", group: "wings" });
    b.rod([0, 2.03, -0.54], [s * 2.22, 2.03, -0.3], 0.045, { bone: root, color: MUSTARD, name: s > 0 ? "upperLeadingL" : "upperLeadingR", group: "trim" });
    b.rod([0, 1.24, -0.5], [s * 2.2, 1.24, -0.28], 0.04, { bone: root, color: MUSTARD, name: s > 0 ? "lowerLeadingL" : "lowerLeadingR", group: "trim" });
    b.rod([s * 1.92, 2.015, 0.5], [s * 2.15, 2.015, 0.32], 0.032, { bone: root, color: RED, name: s > 0 ? "upperTipTrimL" : "upperTipTrimR", group: "trim" });
    b.rod([s * 1.92, 1.205, 0.5], [s * 2.15, 1.205, 0.32], 0.03, { bone: root, color: RED, name: s > 0 ? "lowerTipTrimL" : "lowerTipTrimR", group: "trim" });
    for (const x of [0.68, 1.3, 1.88]) {
      b.rod([s * x, 2.025, -0.42], [s * x, 2.025, 0.38], 0.016, { bone: root, color: CREAM, name: `${s > 0 ? "upperRibL" : "upperRibR"}${x}`, group: "wingRibs" });
      b.rod([s * x, 1.245, -0.4], [s * x, 1.245, 0.36], 0.014, { bone: root, color: CREAM, name: `${s > 0 ? "lowerRibL" : "lowerRibR"}${x}`, group: "wingRibs" });
    }
  }

  for (const s of [1, -1]) {
    for (const x of [0.48, 1.32]) {
      b.frustumBox([s * x, 1.25, -0.18], [s * x, 1.9, -0.08], [0.085, 0.085], [0.07, 0.07], { bone: root, color: woodPaint, name: `${s > 0 ? "strutL" : "strutR"}${x < 1 ? "Front" : "Rear"}`, group: "woodwork" });
    }
    b.rod([s * 2.12, 1.93, 0.26], [s * 1.55, 1.22, 0.28], 0.022, { bone: root, color: WOOD_LIGHT, name: s > 0 ? "outerBraceL" : "outerBraceR", group: "wires" });
    b.rod([s * 2.08, 1.21, -0.32], [s * 1.5, 1.93, -0.3], 0.018, { bone: root, color: NAVY, name: s > 0 ? "crossWireL" : "crossWireR", group: "wires" });
  }

  b.part(new THREE.SphereGeometry(0.43, 12, 8), NAVY, { bone: root, at: [0, 1.74, 0.22], scale: new THREE.Vector3(1.15, 0.55, 0.95), name: "cockpitBowl", group: "cockpit" });
  b.part(new THREE.TorusGeometry(0.43, 0.045, 7, 18), MUSTARD, { bone: root, at: [0, 1.82, 0.22], rotation: [90, 0, 0], scale: new THREE.Vector3(1.16, 1, 0.94), name: "cockpitRim", group: "cockpit" });
  b.part(new THREE.BoxGeometry(0.48, 0.32, 0.11), WOOD, { bone: root, at: [0, 1.52, -0.02], rotation: [12, 0, 0], name: "pilotSeat", group: "cockpit" });
  b.part(new THREE.BoxGeometry(0.52, 0.19, 0.075), MUSTARD, { bone: root, at: [0, 1.96, 0.4], rotation: [-8, 0, 0], name: "instrumentCoaming", group: "cockpit" });
  for (const s of [1, -1]) b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.025, 8), CREAM, { bone: root, at: [s * 0.17, 1.98, 0.43], dir: [0, 1, 0], axis: "y", name: s > 0 ? "dialL" : "dialR", group: "cockpit" });

  for (const s of [1, -1]) {
    b.extrude([[0, -0.32], [0.85, -0.27], [1.02, -0.08, "sharp"], [0.87, 0.26], [0, 0.31]], { at: [0, 1.55, -2.18], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.075, bevel: 0.025, smoothing: 1, color: wingPaint, bone: root, name: s > 0 ? "tailplaneL" : "tailplaneR", group: "tail" });
  }
  b.extrude([[0, 0], [0.45, 0], [0.72, 0.32, "sharp"], [0.58, 0.88], [0.2, 0.98, "sharp"], [0.05, 0.55]], { at: [0, 1.42, -2.2], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.08, bevel: 0.028, smoothing: 1, color: RED, bone: root, name: "tailFin", group: "tail" });
  b.rod([0, 1.64, -2.18], [0, 2.22, -2.18], 0.025, { bone: root, color: MUSTARD, name: "finLeadingTrim", group: "tail" });

  for (const s of [1, -1]) {
    b.rod([s * 0.3, 1.05, 0.14], [s * 0.84, 0.34, 0.18], 0.075, { bone: root, color: WOOD, name: s > 0 ? "gearLegL" : "gearLegR", group: "landingGear" });
    b.rod([s * 0.84, 0.34, 0.18], [s * 0.84, 0.2, 0.18], 0.055, { bone: root, color: MUSTARD, name: s > 0 ? "axleL" : "axleR", group: "landingGear" });
    b.part(new THREE.CylinderGeometry(0.29, 0.29, 0.16, 12), RUBBER, { bone: s > 0 ? wheelL : wheelR, dir: [1, 0, 0], axis: "y", name: s > 0 ? "wheelL" : "wheelR", group: "wheels" });
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.175, 10), MUSTARD, { bone: s > 0 ? wheelL : wheelR, dir: [1, 0, 0], axis: "y", name: s > 0 ? "hubL" : "hubR", group: "wheels" });
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.19, 8), CREAM, { bone: s > 0 ? wheelL : wheelR, dir: [1, 0, 0], axis: "y", name: s > 0 ? "axleCapL" : "axleCapR", group: "wheels" });
  }
  b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.11, 10), RUBBER, { bone: tailWheel, dir: [1, 0, 0], axis: "y", name: "tailWheel", group: "wheels" });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.125, 8), MUSTARD, { bone: tailWheel, dir: [1, 0, 0], axis: "y", name: "tailHub", group: "wheels" });
  b.rod([0, 0.74, -1.95], [0, 0.25, -2.24], 0.045, { bone: root, color: WOOD, name: "tailGearLeg", group: "landingGear" });

  b.part(new THREE.SphereGeometry(0.51, 12, 8), MUSTARD, { bone: root, at: [0, 1.43, 2.48], scale: new THREE.Vector3(0.96, 0.96, 0.5), name: "engineCowling", group: "engine" });
  b.part(new THREE.SphereGeometry(0.16, 10, 6), WHITE, { bone: root, at: [0, 1.47, 2.78], name: "headlamp", group: "engine" });
  for (const s of [1, -1]) {
    b.rod([s * 0.48, 1.34, 2.18], [s * 0.48, 1.02, 2.18], 0.035, { bone: root, color: WOOD, name: s > 0 ? "exhaustL" : "exhaustR", group: "engine" });
    b.part(new THREE.SphereGeometry(0.052, 7, 5), RUBBER, { bone: root, at: [s * 0.48, 1.0, 2.18], name: s > 0 ? "exhaustCapL" : "exhaustCapR", group: "engine" });
  }
  b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.14, 10), WOOD, { bone: propHinge, dir: [0, 0, 1], axis: "y", name: "propHub", group: "propeller" });
  for (const angle of [35, -35]) b.part(new THREE.BoxGeometry(0.15, 1.5, 0.075), CORAL, { bone: propHinge, rotation: [0, 0, angle], name: `propBlade${angle > 0 ? "A" : "B"}`, group: "propeller" });
  for (const angle of [35, -35]) b.part(new THREE.BoxGeometry(0.18, 0.28, 0.085).translate(0, angle > 0 ? 0.62 : -0.62, 0.12), CREAM, { bone: propHinge, rotation: [0, 0, angle], name: `propTip${angle > 0 ? "A" : "B"}`, group: "propeller" });
  b.part(new THREE.ConeGeometry(0.17, 0.32, 8).translate(0, 0, 0.3), RED, { bone: propHinge, dir: [0, 0, 1], axis: "y", name: "spinner", group: "propeller" });

  for (const z of [-1.75, -1.25, -0.7, -0.15, 0.42, 0.98, 1.48]) for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.035, 7, 5), MUSTARD, { bone: root, at: [s * 0.4, 1.62, z], name: `${s > 0 ? "rivL" : "rivR"}${Math.round((z + 2) * 10)}`, group: "rivets" });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.028, 10), SKY, { bone: root, at: [s * 0.455, 1.47, 0.8], dir: [s, 0, 0], axis: "y", name: s > 0 ? "portholeL" : "portholeR", group: "details" });
    b.part(new THREE.TorusGeometry(0.15, 0.018, 6, 12), MUSTARD, { bone: root, at: [s * 0.47, 1.47, 0.8], rotation: [0, 90, 0], name: s > 0 ? "portholeRimL" : "portholeRimR", group: "details" });
  }
  b.rod([0, 2.19, -2.18], [0, 2.68, -2.18], 0.018, { bone: root, color: WOOD, name: "flagMast", group: "details" });
  b.extrude([[0, 0.44], [0.42, 0.32], [0.42, 0.08], [0, 0.2]], { at: [0, 2.58, -2.18], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.025, bevel: 0.008, color: CORAL, bone: root, name: "tailFlag", group: "details" });

  return b.root;
}
