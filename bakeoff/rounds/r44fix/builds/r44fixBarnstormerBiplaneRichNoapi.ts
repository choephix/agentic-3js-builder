import * as THREE from "three";
import { createBuilder, svg, paint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { catmull } from "../../../../src/index";

export const meta = {
  name: "Barnstormer Biplane",
  description: "Chubby whimsical biplane with a googly-eyed cowling, bunting, a scarfed pilot, balloon tires and a spinning prop.",
};

const CREAM = "#f6e8c4", RED = "#e2432f", TEAL = "#2aa6a0", MUST = "#f2b632", DARK = "#2b2430";
const WOOD = "#b9783f", TIRE = "#2a2630", METAL = "#a9b0bb";

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "biplane", paintSize: 1024 });
  const body = b.joint("fuselage", { at: [0, 1.3, 0], dir: [0, 0, 1], role: "spine" });
  const prop = b.joint("prop", { parent: body, at: [0, 1.3, 1.85], dir: [0, 0, 1], role: "hinge" });
  const rudder = b.joint("rudder", { parent: body, at: [0, 1.4, -3.0], dir: [0, 1, 0], role: "hinge" });
  const wheelL = b.joint("wheelL", { parent: body, at: [0.95, 0.42, 0.7], dir: [1, 0, 0], role: "hinge" });
  const wheelR = b.joint("wheelR", { parent: body, at: [-0.95, 0.42, 0.7], dir: [1, 0, 0], role: "hinge" });
  const tailWheel = b.joint("tailWheel", { parent: body, at: [0, 0.2, -2.7], dir: [1, 0, 0], role: "hinge" });

  // ---- textures
  const ROUNDEL = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="${DARK}"/><circle cx="50" cy="50" r="38" fill="${CREAM}"/><circle cx="50" cy="50" r="28" fill="${RED}"/><path d="M50 26 L56 44 L75 44 L60 55 L66 74 L50 62 L34 74 L40 55 L25 44 L44 44Z" fill="${MUST}" stroke="${DARK}" stroke-width="3" stroke-linejoin="round"/></svg>`, { size: 256 });
  const EYE = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#fff" stroke="${DARK}" stroke-width="7"/><circle cx="58" cy="58" r="22" fill="${DARK}"/><circle cx="64" cy="50" r="8" fill="#fff"/></svg>`, { size: 192 });
  const NUM = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80"><text x="60" y="64" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="70" fill="${DARK}">7</text></svg>`, { size: 240 });
  const FLAG = svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 24"><path d="M1 1 H19 L10 23Z" fill="#fff" stroke="#555" stroke-width="1.2"/></svg>`, { size: 96 });

  // ---- paints
  const fusePaint = paint((p, n) => {
    if (n.y > 0.5) return p.z > -0.1 && p.z < 1.1 ? TEAL : RED;
    if (n.y < -0.5) return CREAM;
    const st = Math.floor((p.z + 4) / 0.5);
    if (p.z < -1.4) return st % 2 ? CREAM : RED;
    if (p.y < 1.05) return TEAL;
    return CREAM;
  });
  const wingPaint = paint((p, n) => {
    const ax = Math.abs(p.x);
    if (ax > 3.35 && ax < 3.65) return RED;
    if (ax > 3.65) return MUST;
    if (n.y < -0.5) return CREAM;
    return Math.floor(ax / 0.5) % 2 ? "#f9efd6" : CREAM;
  });

  // ---- fuselage
  b.loft([
    { at: [0, 1.3, -3.0], w: 0.12, h: 0.18 },
    { at: [0, 1.32, -2.2], w: 0.3, h: 0.45 },
    { at: [0, 1.32, -1.0], w: 0.75, h: 0.95 },
    { at: [0, 1.3, 0.2], w: 1.1, h: 1.15 },
    { at: [0, 1.3, 1.0], w: 1.1, h: 1.1 },
  ], { bone: body, sides: 12, color: fusePaint, caps: { start: "flat", end: "flat" }, name: "fuselage" });
  b.lathe([[0.55, 0], [0.63, 0.3], [0.58, 0.6], [0.4, 0.78], [0, 0.82]], { at: [0, 1.3, 1.0], axis: [0, 0, 1], segments: 14, bone: body, color: MUST, name: "cowling" });
  b.lathe([[0.57, 0.28], [0.65, 0.3], [0.65, 0.4], [0.57, 0.4]], { at: [0, 1.3, 1.0], axis: [0, 0, 1], segments: 14, bone: body, color: RED, name: "cowlBand" });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { bone: body, at: [s * 0.24, 1.58, 1.74], dir: [s * 0.2, 0.1, 1], axis: "z", texture: EYE, name: "eye" });
    // exhaust stubs
    b.rod([s * 0.58, 1.1, 1.3], [s * 0.7, 1.0, 0.7], 0.06, { bone: body, color: METAL, name: "exhaust" });
    b.part(new THREE.PlaneGeometry(0.7, 0.7), "#ffffff", { bone: body, at: [s * 0.56, 1.3, -0.9], dir: [s, 0, 0], axis: "z", texture: ROUNDEL, name: "roundel" });
    b.part(new THREE.PlaneGeometry(0.5, 0.33), "#ffffff", { bone: body, at: [s * 0.4, 1.35, -2.05], dir: [s, 0.1, 0], axis: "z", texture: NUM, name: "number" });
  }
  // cockpit
  b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 14), DARK, { bone: body, at: [0, 1.84, -0.35], scale: [1, 1, 1.5], name: "cockpit" });
  b.part(new THREE.TorusGeometry(0.31, 0.05, 6, 14), WOOD, { bone: body, at: [0, 1.86, -0.35], dir: [0, 1, 0], axis: "z", scale: [1, 1.5, 1], name: "coaming" });
  // windscreen
  b.part(new THREE.BoxGeometry(0.55, 0.28, 0.03), "#bfe8f0", { bone: body, at: [0, 2.0, 0.12], rotation: [-25, 0, 0], name: "windscreen" });

  // ---- pilot
  b.part(new THREE.SphereGeometry(0.24, 8, 6), "#f0b88c", { bone: body, at: [0, 2.05, -0.35], name: "head" });
  b.part(new THREE.SphereGeometry(0.27, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), "#7a4a2a", { bone: body, at: [0, 2.08, -0.37], name: "helmet" });
  b.part(new THREE.CylinderGeometry(0.26, 0.26, 0.07, 10), DARK, { bone: body, at: [0, 2.11, -0.2], dir: [0, 0, 1], name: "gogglesStrap" });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.06, 10), "#9fe3f0", { bone: body, at: [s * 0.1, 2.1, -0.13], dir: [0, 0, 1], name: "lens" });
    b.part(new THREE.SphereGeometry(0.05, 6, 4), "#f0b88c", { bone: body, at: [s * 0.02, 2.0, -0.12], name: "nose" });
  }
  b.part(new THREE.CylinderGeometry(0.28, 0.32, 0.3, 8), RED, { bone: body, at: [0, 1.82, -0.37], name: "jacket" });
  b.sweep(catmull([[0.0, 1.95, -0.5], [0.1, 2.0, -1.0], [-0.1, 2.05, -1.6], [0.1, 1.95, -2.1]] as V[]), [0.07, 0.03], { bone: body, color: MUST, caps: "round", name: "scarf" });

  // ---- wings
  const wing = (y: number, span: number, chord: number, zc: number, name: string) => {
    for (const s of [1, -1]) {
      b.extrude([[0, zc + chord], [span - 0.4, zc + chord - 0.05], [span, zc + chord * 0.4], [span - 0.3, zc - chord * 0.7], [0, zc - chord * 0.8]], {
        at: [0, y, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.14, bevel: 0.04, color: wingPaint, bone: body, name: `${name}${s > 0 ? "L" : "R"}`,
      });
    }
  };
  wing(2.65, 4.1, 0.75, 0.35, "wingUpper");
  wing(1.15, 3.7, 0.65, 0.3, "wingLower");
  // struts & wires
  for (const s of [1, -1]) {
    for (const x of [1.8, 3.3]) {
      for (const z of [0.7, 0.0]) b.rod([s * x, 1.1, z], [s * x, 2.6, z], 0.045, { bone: body, color: WOOD, name: "strut" });
    }
    b.rod([s * 0.3, 1.8, 0.5], [s * 1.8, 2.6, 0.7], 0.04, { bone: body, color: WOOD, name: "cabane" });
    b.rod([s * 0.3, 1.8, 0.0], [s * 1.8, 2.6, 0.0], 0.04, { bone: body, color: WOOD, name: "cabane" });
    b.rod([s * 1.8, 1.1, 0.35], [s * 3.3, 2.6, 0.35], 0.015, { bone: body, color: DARK, name: "wire" });
    b.rod([s * 3.3, 1.1, 0.35], [s * 1.8, 2.6, 0.35], 0.015, { bone: body, color: DARK, name: "wire" });
  }
  // bunting between upper wing struts
  const bunt = catmull([[-3.3, 2.45, 0.85], [-1.6, 2.2, 0.9], [0, 2.1, 0.9], [1.6, 2.2, 0.9], [3.3, 2.45, 0.85]] as V[]);
  b.sweep(bunt, 0.015, { bone: body, color: DARK, caps: "none", name: "buntingLine" });
  const cols = [RED, MUST, TEAL];
  for (let i = 0; i < 3; i++) {
    const fr: THREE.Vector3[] = [];
    for (let k = 1; k < 18; k++) if (k % 3 === i) fr.push(bunt.at(k / 18));
    for (const p of fr) {
      b.part(new THREE.ConeGeometry(0.1, 0.26, 3), cols[i], { bone: body, at: [p.x, p.y - 0.13, p.z], rotation: [180, 0, 0], name: "flag" });
    }
  }
  void FLAG;

  // ---- tail
  b.extrude([[0, 0], [0.15, 0.4], [0.2, 0.95], [0.6, 0.8], [0.75, 0.0]], { at: [0, 1.35, -2.35], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.1, bevel: 0.03, color: TEAL, bone: body, name: "fin" });
  b.extrude([[0, 0], [0, 0.85], [-0.45, 0.7], [-0.55, 0.0]], { at: [0, 1.35, -3.1], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.08, bevel: 0.02, color: RED, bone: rudder, name: "rudderBlade" });
  for (const s of [1, -1]) {
    b.extrude([[0, -2.1], [1.2, -2.5], [1.3, -3.0], [0, -3.0]], { at: [0, 1.3, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.09, bevel: 0.025, color: MUST, bone: body, name: `stab${s > 0 ? "L" : "R"}` });
    b.rod([s * 0.3, 1.2, -2.3], [s * 0.8, 1.3, -2.6], 0.025, { bone: body, color: WOOD, name: "tailBrace" });
  }

  // ---- propeller
  b.part(new THREE.SphereGeometry(0.2, 8, 6), RED, { bone: prop, at: [0, 1.3, 1.85], scale: [1, 1, 1.3], name: "spinner" });
  for (let i = 0; i < 2; i++) {
    b.part(new THREE.BoxGeometry(0.22, 1.2, 0.05), WOOD, { bone: prop, at: [0, 1.3, 1.9], rotation: [0, 0, i * 180 + 25], anchor: undefined, name: "blade" } as never);
  }
  b.part(new THREE.BoxGeometry(0.2, 0.2, 0.05), MUST, { bone: prop, at: [0, 1.3, 1.92], name: "bladeTipCap" });

  // ---- landing gear
  for (const [s, wj] of [[1, wheelL], [-1, wheelR]] as const) {
    b.rod([s * 0.4, 1.0, 0.9], [s * 0.95, 0.42, 0.7], 0.06, { bone: body, color: METAL, name: "gearLeg" });
    b.rod([s * 0.4, 1.0, 0.4], [s * 0.95, 0.42, 0.7], 0.05, { bone: body, color: METAL, name: "gearBrace" });
    b.part(new THREE.CylinderGeometry(0.42, 0.42, 0.24, 16), TIRE, { bone: wj, at: [s * 0.95, 0.42, 0.7], dir: [1, 0, 0], name: "tire" });
    b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.27, 12), CREAM, { bone: wj, at: [s * 0.95, 0.42, 0.7], dir: [1, 0, 0], name: "hubcap" });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.3, 8), RED, { bone: wj, at: [s * 0.95, 0.42, 0.7], dir: [1, 0, 0], name: "hubDot" });
  }
  b.rod([-0.95, 0.42, 0.7], [0.95, 0.42, 0.7], 0.04, { bone: body, color: METAL, name: "axle" });
  b.rod([0, 1.2, -2.5], [0, 0.22, -2.7], 0.04, { bone: body, color: METAL, name: "tailSkid" });
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 10), TIRE, { bone: tailWheel, at: [0, 0.2, -2.7], dir: [1, 0, 0], name: "tailTire" });

  // ---- lantern on the wing tip, glowing
  for (const s of [1, -1])
    glow(b.part(new THREE.SphereGeometry(0.08, 6, 5), s > 0 ? "#ff5a4a" : "#5aff8a", { bone: body, at: [s * 4.1, 2.6, 0.2], name: "navLight" }), 1.5);

  return b.root;
}
