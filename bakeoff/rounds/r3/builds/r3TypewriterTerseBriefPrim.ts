import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "typewriter",
  description: "A vintage mechanical typewriter with keys, platen, paper and type bars.",
};

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  const base = b.joint("base", { at: [0, 0.0, 0] });
  const carriage = b.joint("carriage", { at: [0, 0.2, -0.08], parent: base });
  const lever = b.joint("carriageLever", { at: [0.22, 0.22, -0.08], parent: carriage });

  const body = "#2a2d33";
  const dark = "#15171a";
  const cream = "#e8e0c8";
  const metal = "#b8bcc2";
  const red = "#a8322d";
  const paper = "#f4f0e4";
  const brass = "#c9a24a";

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 12) => new THREE.CylinderGeometry(rt, rb, h, s);

  // Base plate and feet
  b.part(box(0.38, 0.02, 0.38), dark, { at: [0, 0.01, 0], bone: base });
  for (const x of [-0.17, 0.17]) for (const z of [-0.17, 0.17]) {
    b.part(cyl(0.02, 0.02, 0.012, 8), dark, { at: [x, 0.006, z], bone: base });
  }

  // Lower body: sloping front
  b.part(box(0.36, 0.1, 0.34), body, { at: [0, 0.07, 0], bone: base });
  b.part(box(0.36, 0.07, 0.26), body, { at: [0, 0.155, 0.04], bone: base });
  // Rear body block
  b.part(box(0.36, 0.14, 0.12), body, { at: [0, 0.19, -0.1], bone: base });
  // Sloped keyboard deck
  const deck = b.part(box(0.34, 0.015, 0.2), dark, { at: [0, 0.18, 0.1], bone: base });
  deck.rotation.x = -0.35;
  // side panels trim
  for (const s of [-1, 1]) {
    b.part(box(0.01, 0.12, 0.36), metal, { at: [s * 0.185, 0.1, 0], bone: base });
  }
  // Brass front badge
  b.part(box(0.1, 0.02, 0.005), brass, { at: [0, 0.1, 0.172], bone: base });

  // Keys: 4 rows, staggered
  const rows = [10, 11, 10, 8];
  rows.forEach((n, r) => {
    const z = 0.04 + r * 0.045;
    const y = 0.185 - (z - 0.1) * 0.34 + 0.02;
    for (let i = 0; i < n; i++) {
      const x = (i - (n - 1) / 2) * 0.03 + (r % 2 ? 0.006 : 0);
      b.part(cyl(0.012, 0.012, 0.012, 10), metal, { at: [x, y - 0.012, z], bone: base });
      b.part(cyl(0.0095, 0.0095, 0.008, 10), cream, { at: [x, y - 0.004, z], bone: base });
      b.part(cyl(0.004, 0.004, 0.012, 6), dark, { at: [x, y - 0.02, z], bone: base });
    }
  });
  // Space bar
  b.part(box(0.17, 0.01, 0.022), cream, { at: [0, 0.145, 0.205], bone: base });

  // Type bar basket: fan of arms
  for (let i = 0; i < 15; i++) {
    const a = (i - 7) / 7 * 0.8;
    const arm = b.part(box(0.004, 0.004, 0.09), metal, {
      at: [Math.sin(a) * 0.07, 0.29, -0.01 + Math.cos(a) * 0.02],
      bone: base,
    });
    arm.rotation.set(-0.5, -a * 0.6, 0);
  }
  b.part(cyl(0.07, 0.085, 0.015, 14), metal, { at: [0, 0.265, -0.03], bone: base });

  // Carriage rails and frame
  b.part(box(0.46, 0.02, 0.04), metal, { at: [0, 0.0, 0.0], bone: carriage });
  b.part(box(0.05, 0.03, 0.06), body, { at: [-0.22, 0.14, 0], bone: carriage });
  b.part(box(0.05, 0.03, 0.06), body, { at: [0.22, 0.14, 0], bone: carriage });
  for (const s of [-1, 1]) {
    b.part(box(0.025, 0.2, 0.05), body, { at: [s * 0.22, 0.08, 0], bone: carriage });
  }

  // Platen roller
  const platen = b.part(cyl(0.032, 0.032, 0.42, 14), dark, { at: [0, 0.2, 0.0], bone: carriage });
  platen.rotation.z = Math.PI / 2;
  for (const s of [-1, 1]) {
    const k = b.part(cyl(0.038, 0.038, 0.025, 10), cream, { at: [s * 0.255, 0.2, 0], bone: carriage });
    k.rotation.z = Math.PI / 2;
    const ax = b.part(cyl(0.006, 0.006, 0.04, 6), metal, { at: [s * 0.28, 0.2, 0], bone: carriage });
    ax.rotation.z = Math.PI / 2;
  }

  // Paper sheet: behind and rising from platen
  b.part(box(0.3, 0.015, 0.22), paper, { at: [0, 0.255, -0.1], bone: carriage }).rotation.x = -0.1;
  const sheet = b.part(box(0.3, 0.26, 0.004), paper, { at: [0, 0.37, -0.075], bone: carriage });
  sheet.rotation.x = -0.12;
  // typed text lines
  for (let i = 0; i < 5; i++) {
    const w = 0.22 - (i % 3) * 0.04;
    b.part(box(w, 0.004, 0.002), dark, { at: [(-0.26 + w) * 0.5 + 0.0 - 0.0, 0.31 + i * 0.022, -0.0725 - i * 0.0026], bone: carriage }).rotation.x = -0.12;
  }

  // Paper guide / bail bar
  const bail = b.part(cyl(0.004, 0.004, 0.36, 6), metal, { at: [0, 0.25, 0.04], bone: carriage });
  bail.rotation.z = Math.PI / 2;
  for (const s of [-1, 1]) b.part(box(0.006, 0.006, 0.04), metal, { at: [s * 0.18, 0.25, 0.02], bone: carriage });

  // Carriage return lever
  const lv = b.part(cyl(0.005, 0.005, 0.11, 6), metal, { at: [0.0, 0.0, 0.0], bone: lever });
  lv.rotation.z = -1.1;
  lv.position.set(0.03, 0.045, 0);
  b.part(new THREE.SphereGeometry(0.014, 8, 6), red, { at: [0.255, 0.275, -0.08], bone: lever });

  // Ribbon spools
  for (const s of [-1, 1]) {
    b.part(cyl(0.04, 0.04, 0.012, 14), metal, { at: [s * 0.12, 0.268, -0.12], bone: base });
    b.part(cyl(0.032, 0.032, 0.014, 14), dark, { at: [s * 0.12, 0.268, -0.12], bone: base });
    b.part(cyl(0.006, 0.006, 0.03, 6), brass, { at: [s * 0.12, 0.28, -0.12], bone: base });
  }
  // Red ribbon between spools
  b.part(box(0.2, 0.004, 0.008), red, { at: [0, 0.272, -0.08], bone: base });

  // Side knobs and tab-stop bar
  for (const s of [-1, 1]) {
    b.part(cyl(0.012, 0.012, 0.015, 8), red, { at: [s * 0.19, 0.18, -0.12], bone: base }).rotation.z = Math.PI / 2;
  }

  return b.root;
}
