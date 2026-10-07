```ts
import * as THREE from "three";
import { createBuilder, grain, svg } from "agentic-3js-builder";

export const meta = {
  name: "Brass explorer's telescope",
  description:
    "A polished brass telescope with leather-wrapped sections, engraved rings, a finder scope and a mahogany tripod with a star-chart tray.",
};

type ColourArg = Parameters<typeof grain>[0];

const BRASS: ColourArg = "#c99a3c";
const BRASS_DARK: ColourArg = "#8a6526";
const BRASS_LIGHT: ColourArg = "#e4c274";
const RUBBER: ColourArg = "#1d1b19";
const GLASS: ColourArg = "#2c5f8c";
const DARK_GLASS: ColourArg = "#15262f";
const PAPER: ColourArg = "#eadcb6";
const LEATHER: ColourArg = grain("#7a4524", "#4f2a15", { size: 0.012, axis: "z" });
const MAHOGANY: ColourArg = grain("#7b3219", "#4a1a0b", { size: 0.035, axis: "y" });

// Tube axis: pivot at the tripod head, tilted up and forward.
const HEAD = new THREE.Vector3(0, 0.95, 0);
const D = new THREE.Vector3(0, 0.447, 0.894).normalize(); // along the tube, objective forward
const U = new THREE.Vector3(0, 0.894, -0.447).normalize(); // perpendicular to D, "up" on the tube
const P = (s: number, k = 0) => HEAD.clone().addScaledVector(D, s).addScaledVector(U, k);

export default function build() {
  const b = createBuilder({ name: "brass-telescope" });

  const stand = b.joint("stand", { at: [0, 0, 0] });
  const tube = b.joint("tube", { parent: stand, at: HEAD, aim: P(0.75) });

  // Main tube section: a flat-capped segment of the brass barrel.
  const seg = (s0: number, s1: number, r: number | [number, number], color: ColourArg) =>
    b.sweep([P(s0), P(s1)], r, { bone: tube, color, caps: "flat" });

  // Eyepiece end to objective end.
  seg(-0.46, -0.36, 0.024, BRASS);
  seg(-0.52, -0.46, [0.03, 0.028], RUBBER);
  seg(-0.36, 0.0, 0.04, BRASS);
  seg(0.0, 0.2, 0.043, LEATHER);
  seg(0.2, 0.3, 0.04, BRASS);
  seg(0.3, 0.42, 0.043, LEATHER);
  seg(0.42, 0.47, 0.04, BRASS);
  // Engraved rings: darker bands proud of the barrel.
  seg(0.47, 0.485, 0.0415, BRASS_DARK);
  seg(0.5, 0.515, 0.0415, BRASS_DARK);
  seg(0.515, 0.55, 0.04, BRASS);
  seg(0.55, 0.72, 0.048, BRASS);
  seg(0.72, 0.75, 0.054, BRASS_LIGHT);

  // Lenses.
  b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.008, 18), GLASS, { bone: tube, at: P(0.75), dir: D });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.004, 14), DARK_GLASS, { bone: tube, at: P(-0.525), dir: D });

  // Focus knobs on both flanks, each on a short brass stem.
  for (const s of [1, -1]) {
    const knob = P(0.1).add(new THREE.Vector3(s * 0.056, 0, 0));
    b.rod(P(0.1), knob, 0.009, { bone: tube, color: BRASS_DARK });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.022, 16), BRASS_LIGHT, {
      bone: tube,
      at: knob,
      dir: [s, 0, 0],
    });
  }

  // Finder scope riding on top of the main tube.
  const FU = 0.088;
  b.sweep([P(0.08, FU), P(0.5, FU)], 0.02, { bone: tube, color: BRASS, caps: "flat" });
  b.sweep([P(-0.02, FU), P(0.08, FU)], [0.026, 0.022], { bone: tube, color: RUBBER, caps: "flat" });
  b.sweep([P(0.5, FU), P(0.515, FU)], 0.023, { bone: tube, color: BRASS_LIGHT, caps: "flat" });
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.006, 14), GLASS, { bone: tube, at: P(0.52, FU), dir: D });
  for (const s0 of [0.15, 0.42]) {
    b.rod(P(s0, 0.02), P(s0, FU), 0.008, { bone: tube, color: BRASS_DARK });
  }

  // Clamp at the pivot.
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.1, 14), BRASS, { bone: tube, at: P(0.0), dir: D });

  // Tripod: three mahogany legs with brass collars and ferrules.
  b.part(new THREE.CylinderGeometry(0.05, 0.06, 0.08, 12), BRASS, { bone: stand, at: [0, 0.9, 0] });
  for (const deg of [0, 120, 240]) {
    const a = THREE.MathUtils.degToRad(deg);
    const sx = Math.sin(a);
    const cz = Math.cos(a);
    const top: [number, number, number] = [0.05 * sx, 0.9, 0.05 * cz];
    const foot: [number, number, number] = [0.44 * sx, 0, 0.44 * cz];
    b.sweep([top, foot], [0.024, 0.014], { bone: stand, color: MAHOGANY, caps: "flat" });
    b.part(new THREE.CylinderGeometry(0.02, 0.016, 0.03, 10), BRASS, {
      bone: stand,
      at: [0.44 * sx, 0.015, 0.44 * cz],
    });
    const mid: [number, number, number] = [0.245 * sx, 0.45, 0.245 * cz];
    const legDir = new THREE.Vector3(0.39 * sx, -0.9, 0.39 * cz).normalize();
    b.part(new THREE.CylinderGeometry(0.021, 0.021, 0.035, 10), BRASS, {
      bone: stand,
      at: mid,
      dir: legDir,
    });
  }

  // Star-chart tray slung between the two rear legs.
  const TY = 0.36;
  b.part(new THREE.BoxGeometry(0.36, 0.015, 0.2), MAHOGANY, { bone: stand, at: [0, TY, -0.12] });
  b.part(new THREE.BoxGeometry(0.36, 0.03, 0.012), MAHOGANY, { bone: stand, at: [0, TY + 0.0225, -0.02] });
  b.part(new THREE.BoxGeometry(0.36, 0.03, 0.012), MAHOGANY, { bone: stand, at: [0, TY + 0.0225, -0.22] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.012, 0.03, 0.2), MAHOGANY, { bone: stand, at: [s * 0.18, TY + 0.0225, -0.12] });
    b.rod([s * 0.18, TY - 0.005, -0.12], [s * 0.246, TY - 0.005, -0.142], 0.008, {
      bone: stand,
      color: BRASS_DARK,
    });
  }

  // A flat chart on the tray, and a rolled one beside it.
  const chart = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 70">` +
      `<rect width="100" height="70" fill="#1d2b4f"/>` +
      `<circle cx="50" cy="35" r="30" fill="none" stroke="#c9a85a" stroke-width="1.5"/>` +
      `<circle cx="50" cy="35" r="18" fill="none" stroke="#c9a85a" stroke-width="1"/>` +
      `<path d="M30 20 L44 48 L62 28" stroke="#e0c27a" stroke-width="0.8" fill="none"/>` +
      `<g fill="#f4ecd0"><circle cx="30" cy="20" r="1.4"/><circle cx="62" cy="28" r="1"/>` +
      `<circle cx="44" cy="48" r="1.6"/><circle cx="70" cy="52" r="1"/>` +
      `<circle cx="25" cy="44" r="0.9"/><circle cx="55" cy="14" r="1.2"/></g>` +
      `</svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.17, 0.13), "#ffffff", {
    bone: stand,
    at: [-0.07, TY + 0.0095, -0.12],
    dir: [0, 1, 0],
    axis: "z",
    texture: chart,
  });
  b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.15, 10), PAPER, {
    bone: stand,
    at: [0.1, TY + 0.032, -0.12],
    dir: [0, 0, 1],
  });

  return b.root;
}
```