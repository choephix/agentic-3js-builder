import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import type { Builder } from "../../../../src/index";

export const meta = {
  name: "Supermarine Spitfire (cyanotype)",
  description:
    "Spitfire fighter in cyanotype blueprint style: Prussian-blue airframe with paper-white linework, elliptical wings, three-blade prop, retractable gear shown down.",
};

// ---- Cyanotype palette (top-level so stage 2 can use the names) ----
export const PRUSSIAN = "#0b3a6e";
export const BLUE_MID = "#1c5ea8";
export const BLUE_LIGHT = "#4f97d6";
export const PAPER = "#e8f3fb";
export const LINE = "#bfe0f5";
export const DEEP = "#06284d";
export const GLASS = "#8fd0ee";

export const REQUESTS = [
  {
    id: "roundelFuselage",
    kind: "add",
    part: "fuselage",
    what: "Fuselage roundel on the left side aft of the cockpit: concentric thin discs in PAPER, BLUE_LIGHT and PRUSSIAN with a fine LINE outline ring, drawn like a blueprint symbol, seated flat on the skin.",
    at: [0.5, 1.85, -2.7],
    normal: [1, 0, 0],
    bone: null,
    room: [0.1, 0.9, 0.9],
  },
  {
    id: "roundelWingTop",
    kind: "add",
    part: "wingL",
    what: "Wing roundel on the upper surface of the left wing: concentric discs PAPER, BLUE_LIGHT, DEEP with a LINE ring, plus a pair of tiny dimension ticks.",
    at: [3.0, 1.23, 0.0],
    normal: [0, 1, 0],
    bone: null,
    room: [1.1, 0.1, 1.1],
  },
  {
    id: "exhaustStacks",
    kind: "add",
    part: "fuselage",
    what: "Two rows of six fishtail exhaust stacks on each side of the engine cowl: small PAPER-edged DEEP tubes with flared ends, angled backwards, in rows.",
    at: [0.5, 1.95, 2.0],
    normal: [1, 0, 0],
    bone: null,
    room: [0.25, 0.4, 1.4],
  },
  {
    id: "cowlGuns",
    kind: "add",
    part: "wingL",
    what: "Cannon and machine-gun fittings: wing leading-edge fairing bumps with blast tubes, ejector-chute slits on the underside, and thin barrel sleeves in LINE and DEEP.",
    at: [2.6, 1.2, 1.3],
    normal: [0, 0, 1],
    bone: null,
    room: [1.0, 0.4, 1.2],
  },
  {
    id: "radiatorGrille",
    kind: "add",
    part: "radiatorL",
    what: "Radiator intake face: a honeycomb grille of thin LINE bars in a DEEP frame, with a small flap at the rear lip.",
    at: [2.9, 0.88, 0.55],
    normal: [0, 0, 1],
    bone: null,
    room: [0.6, 0.4, 0.2],
  },
  {
    id: "canopyFrame",
    kind: "add",
    part: "canopy",
    what: "Canopy framing: slim PAPER ribs, windscreen armoured glass panel frame, a rear-view mirror bump on top and a sliding-hood rail on each side.",
    at: [0, 2.35, -0.3],
    normal: [0, 1, 0],
    bone: null,
    room: [0.9, 0.6, 2.2],
  },
  {
    id: "propHub",
    kind: "add",
    part: "spinner",
    what: "Propeller hub details: a spinner back-plate ring in DEEP, six bolt heads in PAPER, and blade root cuffs in LINE on the three blades.",
    at: [0, 1.75, 3.25],
    normal: [0, 0, 1],
    bone: "prop",
    room: [0.9, 0.9, 0.4],
  },
  {
    id: "gearDetails",
    kind: "add",
    part: "legL",
    what: "Undercarriage detail: oleo scissor links, a brake line, hub bolts and a gear door panel with hinge in BLUE_LIGHT on the left leg and wheel.",
    at: [1.95, 0.7, 0.45],
    normal: [1, 0, 0],
    bone: null,
    room: [0.5, 0.9, 0.6],
  },
  {
    id: "pitotAerial",
    kind: "add",
    part: "wingR",
    what: "Pitot tube on the right wing leading edge (thin LINE rod with a DEEP tip) and a radio mast with aerial wires running to the fin top.",
    at: [-3.6, 1.2, 1.2],
    normal: [0, 0, 1],
    bone: null,
    room: [0.3, 0.3, 0.8],
  },
  {
    id: "tailWheelDetail",
    kind: "add",
    part: "tailstrut",
    what: "Tail wheel fork and small spring oleo, plus a fairing at the fuselage underside in BLUE_MID.",
    at: [0, 0.6, -4.7],
    normal: [0, 0, -1],
    bone: null,
    room: [0.4, 0.9, 0.5],
  },
  {
    id: "fuselageDraft",
    kind: "texture",
    part: "fuselage",
    what: "Blueprint drafting look on fuselage sides: PAPER panel lines, rivet dot rows, stencilled station numbers and a fine dashed centre line, over the BLUE_MID base.",
  },
  {
    id: "wingRibs",
    kind: "texture",
    part: "wingL and wingR",
    what: "Wing upper skin: fine PAPER rib and spar lines, hatch marks near the roots, and walkway rectangles, in cyanotype style with BLUE_LIGHT highlights.",
  },
  {
    id: "rudderMarks",
    kind: "texture",
    part: "rudder",
    what: "Rudder: fabric rib stripes in LINE, a hinge-line dashed edge and the stencilled word 'SPITFIRE Mk I' in PAPER.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "spitfire" });
  const root = b.joint("fuselage", { at: [0, 1.8, 0], dir: [0, 0, 1] });
  const prop = b.joint("prop", { parent: root, at: [0, 1.75, 3.1], dir: [0, 0, 1], role: "hinge" });
  const rudderJ = b.joint("rudder", { parent: root, at: [0, 1.85, -5.0], dir: [0, 1, 0], role: "hinge" });

  // ---- Fuselage ----
  b.loft(
    [
      { at: [0, 1.75, 3.0], w: 0.5, h: 0.55 },
      { at: [0, 1.75, 2.4], w: 0.85, h: 0.95 },
      { at: [0, 1.8, 1.2], w: 1.0, h: 1.2 },
      { at: [0, 1.8, 0], w: 0.95, h: 1.25 },
      { at: [0, 1.75, -1.2], w: 0.8, h: 1.05 },
      { at: [0, 1.7, -2.6], w: 0.55, h: 0.75 },
      { at: [0, 1.75, -4.0], w: 0.3, h: 0.45 },
      { at: [0, 1.85, -5.1], w: 0.15, h: 0.3 },
    ],
    { color: BLUE_MID, bone: root, name: "fuselage" },
  );
  // Spine strip and cowl band
  b.part(new THREE.BoxGeometry(0.1, 0.04, 3.6), BLUE_LIGHT, { bone: root, at: [0, 2.43, -0.8], name: "spine" });
  b.part(new THREE.CylinderGeometry(0.42, 0.45, 0.08, 14), LINE, { bone: root, at: [0, 1.75, 2.75], dir: [0, 0, 1], name: "cowlRing" });

  // ---- Spinner & prop ----
  b.part(new THREE.ConeGeometry(0.3, 0.75, 12), LINE, { bone: prop, at: [0, 1.75, 3.45], dir: [0, 0, 1], name: "spinner" });
  b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.12, 12), DEEP, { bone: prop, at: [0, 1.75, 3.1], dir: [0, 0, 1], name: "spinnerBase" });
  for (let k = 0; k < 3; k++) {
    const a = (k * 120 * Math.PI) / 180;
    const deg = k * 120;
    const dx = -Math.sin(a);
    const dy = Math.cos(a);
    b.part(new THREE.BoxGeometry(0.22, 1.5, 0.045), PAPER, {
      bone: prop, at: [dx * 0.95, 1.75 + dy * 0.95, 3.25], rotation: [0, 0, deg], name: "blade" + k,
    });
    b.part(new THREE.BoxGeometry(0.23, 0.3, 0.05), DEEP, {
      bone: prop, at: [dx * 1.55, 1.75 + dy * 1.55, 3.25], rotation: [0, 0, deg], name: "bladeTip" + k,
    });
  }

  // ---- Canopy ----
  b.part(new THREE.SphereGeometry(1, 12, 8), GLASS, {
    bone: root, at: [0, 2.35, -0.3], scale: [0.4, 0.32, 1.1], name: "canopy",
  });
  b.part(new THREE.BoxGeometry(0.62, 0.3, 0.1), GLASS, {
    bone: root, at: [0, 2.35, 0.95], rotation: [-35, 0, 0], name: "windscreen",
  });
  for (const z of [0.7, -0.3, -1.2]) {
    b.part(new THREE.BoxGeometry(0.7, 0.04, 0.05), PAPER, { bone: root, at: [0, 2.5 - Math.abs(z) * 0.03, z], name: "canopyRib" });
  }

  // ---- Wings ----
  const chord = (x: number) => 2.5 * Math.sqrt(Math.max(0, 1 - (x / 5.6) ** 2));
  const WY = 1.15;
  const wingPts: [number, number][] = [];
  const N = 12;
  for (let i = 0; i <= N; i++) {
    const x = 0.1 + (i * 5.3) / N;
    wingPts.push([x, 0.3 + 0.25 * chord(x)]);
  }
  for (let i = N; i >= 0; i--) {
    const x = 0.1 + (i * 5.3) / N;
    wingPts.push([x, 0.3 - 0.75 * chord(x)]);
  }
  const ailPts: [number, number][] = [];
  for (let i = 0; i <= 6; i++) {
    const x = 3.2 + (i * 2.1) / 6;
    ailPts.push([x, 0.3 - 0.75 * chord(x) + 0.5]);
  }
  for (let i = 6; i >= 0; i--) {
    const x = 3.2 + (i * 2.1) / 6;
    ailPts.push([x, 0.3 - 0.75 * chord(x)]);
  }
  const tailPts: [number, number][] = [];
  const tc = (x: number) => 1.5 * Math.sqrt(Math.max(0, 1 - (x / 2) ** 2));
  for (let i = 0; i <= 6; i++) {
    const x = 0.1 + (i * 1.75) / 6;
    tailPts.push([x, 0.35 * tc(x)]);
  }
  for (let i = 6; i >= 0; i--) {
    const x = 0.1 + (i * 1.75) / 6;
    tailPts.push([x, -0.65 * tc(x)]);
  }

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.extrude(wingPts, { at: [0, WY, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.14, bevel: 0.03, color: BLUE_MID, bone: root, name: "wing" + side });
    b.extrude(ailPts, { at: [0, WY, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.17, color: BLUE_LIGHT, bone: root, name: "aileron" + side });
    b.extrude(tailPts, { at: [0, 1.85, -4.4], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.07, bevel: 0.015, color: BLUE_MID, bone: root, name: "tailplane" + side });
    // wing tip stripe
    b.part(new THREE.BoxGeometry(0.35, 0.16, 0.5), PAPER, { bone: root, at: [s * 5.3, WY, 0.05 - 0.12], name: "tipCap" + side });
    // rib lines
    for (let i = 1; i <= 8; i++) {
      const x = 0.7 + i * 0.55;
      if (x > 5.0) break;
      const c = chord(x);
      b.part(new THREE.BoxGeometry(0.025, 0.01, c * 0.85), LINE, {
        bone: root, at: [s * x, WY + 0.077, 0.3 - 0.25 * c + 0.0], name: "ribLine",
      });
    }
    // cannons
    for (const x of [2.6, 3.3]) {
      const le = 0.3 + 0.25 * chord(x);
      b.rod([s * x, WY + 0.02, le - 0.3], [s * x, WY + 0.02, le + 0.85], 0.04, DEEP, { bone: root, name: "barrel" + side });
      b.part(new THREE.BoxGeometry(0.16, 0.16, 0.3), PRUSSIAN, { bone: root, at: [s * x, WY + 0.02, le + 0.05], name: "gunBump" + side });
    }
    // radiators
    const rw = s > 0 ? 0.65 : 0.48;
    b.part(new THREE.BoxGeometry(rw, 0.36, 0.95), DEEP, { bone: root, at: [s * 2.95, 0.88, 0.45], name: "radiator" + side });
    b.part(new THREE.BoxGeometry(rw * 0.7, 0.2, 0.04), LINE, { bone: root, at: [s * 2.95, 0.88, 0.94], name: "radiatorMouth" + side });
    // gear
    b.rod([s * 1.9, 1.1, 0.4], [s * 2.0, 0.4, 0.5], 0.055, PAPER, { bone: root, name: "leg" + side });
    b.part(new THREE.CylinderGeometry(0.38, 0.38, 0.2, 14), DEEP, { bone: root, at: [s * 2.1, 0.38, 0.5], dir: [1, 0, 0], name: "wheel" + side });
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.22, 10), LINE, { bone: root, at: [s * 2.1, 0.38, 0.5], dir: [1, 0, 0], name: "hub" + side });
    b.part(new THREE.BoxGeometry(0.05, 0.7, 0.6), BLUE_LIGHT, { bone: root, at: [s * 1.55, 0.75, 0.45], name: "gearDoor" + side });
  }

  // ---- Tail ----
  b.extrude(
    [[-0.8, 0], [0.3, 0], [-0.3, 1.5], [-0.75, 1.55]],
    { at: [0, 1.85, -4.2], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.1, bevel: 0.02, color: BLUE_MID, bone: root, name: "fin" },
  );
  b.extrude(
    [[0, 0], [-0.4, 0.05], [-0.5, 0.7], [-0.3, 1.35], [0.05, 1.55]],
    { at: [0, 1.85, -5.0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.07, color: BLUE_LIGHT, bone: rudderJ, name: "rudder" },
  );
  b.rod([0, 1.65, -4.6], [0, 0.14, -4.75], 0.04, PAPER, { bone: root, name: "tailstrut" });
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.07, 10), DEEP, { bone: root, at: [0, 0.13, -4.75], dir: [1, 0, 0], name: "tailWheel" });

  for (const add of STAGE2) add(b);
  return b.root;
}
