import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gunblade",
  description: "Final Fantasy style revolver gunblade: steel blade, gold lion-wing guard, revolver chamber, glowing materia.",
};

const STEEL = "#aab4c4";
const STEEL_DK = "#5d6678";
const EDGE = "#f1f6ff";
const GOLD = "#d9a935";
const GOLD_DK = "#9a6f1c";
const GUN = "#3a3f4d";
const GUN_DK = "#1d2029";
const LEATHER = "#2a1a1e";
const BLUE = "#4fc8ff";
const GREEN = "#47ff8c";

export default function build() {
  const b = createBuilder({ name: "gunblade" });

  const box = (w: number, h: number, d: number, color: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: at as any, rotation: rot as any });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: number[], rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: at as any, rotation: rot as any });

  // ---- pommel
  b.lathe(
    [[0, 0], [0.02, 0], [0.032, 0.018], [0.03, 0.045], [0.022, 0.062], [0, 0.062]],
    { at: [0, 0, 0], color: GOLD, segments: 8 },
  );
  cyl(0.034, 0.034, 0.008, 8, GOLD_DK, [0, 0.03, 0]);
  glow(b.part(new THREE.SphereGeometry(0.012, 6, 4), BLUE, { at: [0, 0.0, 0.0] }), 1.2);
  // the glow gem on the pommel cap's side (kept above floor)
  for (const s of [1, -1]) glow(b.part(new THREE.SphereGeometry(0.009, 6, 4), BLUE, { at: [s * 0.03, 0.03, 0] }), 1.3);

  // ---- grip with wraps
  cyl(0.022, 0.022, 0.24, 8, LEATHER, [0, 0.19, 0]);
  for (let i = 0; i < 7; i++) {
    cyl(0.0245, 0.0245, 0.007, 8, i % 2 ? GOLD_DK : GOLD, [0, 0.085 + i * 0.03, 0]);
  }
  cyl(0.028, 0.028, 0.014, 8, GOLD, [0, 0.31, 0]);

  // ---- revolver body
  box(0.044, 0.22, 0.11, GUN, [0, 0.41, 0]);
  box(0.05, 0.03, 0.12, GOLD, [0, 0.305, 0]);
  box(0.05, 0.02, 0.12, GOLD, [0, 0.52, 0]);
  // body plating accents
  for (const s of [1, -1]) {
    box(0.004, 0.14, 0.012, GOLD_DK, [s * 0.023, 0.41, -0.035]);
    box(0.004, 0.06, 0.03, STEEL_DK, [s * 0.023, 0.34, 0.03]);
  }
  // revolver chamber
  cyl(0.052, 0.052, 0.07, 12, STEEL_DK, [0, 0.445, 0.02], [0, 0, 90]);
  cyl(0.058, 0.058, 0.01, 12, GOLD, [0, 0.445, 0.02], [0, 0, 90]);
  for (const s of [1, -1]) {
    cyl(0.058, 0.058, 0.008, 12, GOLD, [s * 0.04, 0.445, 0.02], [0, 0, 90]);
    cyl(0.012, 0.012, 0.01, 6, GUN_DK, [s * 0.044, 0.445, 0.02], [0, 0, 90]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      cyl(0.0085, 0.0085, 0.008, 6, GUN_DK, [s * 0.044, 0.445 + Math.cos(a) * 0.036, 0.02 + Math.sin(a) * 0.036], [0, 0, 90]);
    }
  }
  // hammer
  box(0.014, 0.06, 0.016, GUN_DK, [0, 0.54, -0.065], [-30, 0, 0]);
  box(0.02, 0.014, 0.024, STEEL, [0, 0.572, -0.085], [-30, 0, 0]);
  // trigger + guard
  box(0.01, 0.045, 0.012, GOLD, [0, 0.335, 0.045], [-18, 0, 0]);
  b.part(new THREE.TorusGeometry(0.045, 0.005, 5, 14, Math.PI * 1.25), GOLD, {
    at: [0, 0.32, 0.06], rotation: [0, 90, 200],
  });
  // materia sockets
  for (const s of [1, -1]) {
    cyl(0.02, 0.02, 0.006, 8, GOLD, [s * 0.024, 0.37, -0.03], [0, 0, 90]);
    glow(b.part(new THREE.SphereGeometry(0.014, 7, 5), GREEN, { at: [s * 0.03, 0.37, -0.03] }), 1.5);
    cyl(0.016, 0.016, 0.006, 8, GOLD, [s * 0.024, 0.455, -0.045], [0, 0, 90]);
    glow(b.part(new THREE.SphereGeometry(0.01, 6, 4), BLUE, { at: [s * 0.028, 0.455, -0.045] }), 1.5);
  }

  // ---- lion-wing guard
  for (const s of [1, -1]) {
    b.extrude(
      [[0, 0], [0.07, 0.015], [0.125, 0.07], [0.15, 0.13], [0.09, 0.1], [0.07, 0.125], [0.04, 0.08], [0, 0.06, "sharp"]],
      { at: [0, 0.5, 0], x: [s, 0, 0], thickness: 0.016, bevel: 0.003, color: GOLD },
    );
    b.extrude(
      [[0.01, 0.015], [0.07, 0.03], [0.1, 0.07], [0.04, 0.05]],
      { at: [0, 0.5, 0.0], x: [s, 0, 0], thickness: 0.02, color: GOLD_DK },
    );
    glow(b.part(new THREE.SphereGeometry(0.008, 6, 4), BLUE, { at: [s * 0.09, 0.532, 0] }), 1.4);
  }

  // ---- blade
  const blade = b.extrude(
    [[-0.03, 0], [0.04, 0], [0.04, 0.55], [0.0, 0.76, "sharp"], [-0.03, 0.7]],
    { at: [0, 0.52, 0], x: [0, 0, 1], thickness: [0.012, 0.006], color: STEEL },
  );
  void blade;
  // sharpened edge
  b.extrude(
    [[0.024, 0.02], [0.04, 0.02], [0.04, 0.55], [0.0, 0.76, "sharp"], [0.018, 0.5]],
    { at: [0, 0.52, 0], x: [0, 0, 1], thickness: [0.016, 0.003], color: EDGE },
  );
  // spine rail and muzzle vents
  box(0.018, 0.72, 0.012, STEEL_DK, [0, 0.52 + 0.35, -0.032]);
  for (let i = 0; i < 4; i++) box(0.02, 0.012, 0.014, GUN_DK, [0, 0.62 + i * 0.045, -0.034]);
  // fuller inlay
  box(0.014, 0.4, 0.008, STEEL_DK, [0, 0.76, -0.006]);
  // ricasso trim
  box(0.016, 0.03, 0.082, GOLD, [0, 0.545, 0.005]);
  box(0.018, 0.012, 0.086, GOLD_DK, [0, 0.572, 0.005]);
  // glowing runes along blade
  for (let i = 0; i < 5; i++) {
    for (const s of [1, -1]) {
      glow(box(0.016, 0.014 - i * 0.001, 0.01, BLUE, [s * 0.0, 0.62 + i * 0.05, 0.015]), 1.2);
    }
  }
  // notch cutout look near base
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.016, 6), GUN_DK, { at: [0, 0.6, -0.015], rotation: [0, 0, 90] });
    void s;
  }

  // ---- chain loop from pommel
  b.part(new THREE.TorusGeometry(0.02, 0.004, 5, 10), STEEL, { at: [0.045, 0.045, 0], rotation: [0, 90, 0] });
  b.part(new THREE.TorusGeometry(0.02, 0.004, 5, 10), STEEL, { at: [0.045, 0.07, 0], rotation: [0, 0, 0] });

  return b.root;
}
