import * as THREE from "three";
import { createBuilder, grain, paint, rng } from "../../../../src/index";

export const meta = {
  name: "Hot-air balloon",
  description: "A tethered hot-air balloon: striped gored envelope, wicker basket, burner with flame and rigging ropes. Real size, about 21 m tall.",
};

const RED = "#c8382e";
const CREAM = "#f3e5c2";
const GOLD = "#e0b04a";
const DARK = "#2b2f36";
const STEEL = "#8a9099";
const ROPE = "#b99a6b";
const WICKER_A = "#b8864e";
const WICKER_B = "#8c5e31";
const FLAME = "#ff9b2e";
const CORE = "#ffe27a";

export default function build() {
  const b = createBuilder({ name: "hot-air-balloon" });
  const root = b.joint("root", { at: [0, 0, 0] });

  // Envelope: a solid of revolution, flat base at y = 2.9, widest near y = 11.
  // Twelve gores of 30 degrees alternate red and cream around the axis.
  const gores = paint((_p, _n, s) => (Math.floor(s[1] / 30) % 2 ? CREAM : RED));
  b.lathe(
    [
      [0, 2.9],
      [2.3, 2.9],
      [3.8, 4.4],
      [6.0, 7.2],
      [7.8, 10.5],
      [8.2, 13.0],
      [7.6, 16.0],
      [5.8, 18.6],
      [3.2, 20.6],
      [0, 21.2],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 16, smoothing: 1, color: gores, bone: root, name: "envelope" },
  );

  // Gold skirt ring where the envelope meets the burner mouth.
  b.part(new THREE.TorusGeometry(2.3, 0.09, 6, 16), GOLD, {
    at: [0, 2.9, 0],
    rotation: [90, 0, 0],
    bone: root,
    name: "skirt",
  });

  // Deflation vent cap on the crown.
  b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 8), DARK, {
    at: [0, 21.1, 0],
    bone: root,
    name: "vent",
  });

  // Wicker basket: a truncated cone standing on the floor, with a rim.
  const wicker = grain(WICKER_A, WICKER_B, { size: 0.04, axis: "y" });
  b.lathe(
    [
      [0, 0],
      [0.6, 0],
      [0.72, 1.0],
      [0, 1.0],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 10, color: wicker, bone: root, name: "basket" },
  );
  b.part(new THREE.TorusGeometry(0.68, 0.05, 6, 14), WICKER_B, {
    at: [0, 1.0, 0],
    rotation: [90, 0, 0],
    bone: root,
    name: "basketRim",
  });

  // Burner: a steel column, a head block, and a two-layer flame under the mouth.
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 1.0, 8), STEEL, {
    at: [0, 1.5, 0],
    bone: root,
    name: "burnerColumn",
  });
  b.part(new THREE.BoxGeometry(0.45, 0.3, 0.45), STEEL, {
    at: [0, 2.1, 0],
    bone: root,
    name: "burnerHead",
  });
  b.part(new THREE.ConeGeometry(0.2, 0.55, 8), FLAME, {
    at: [0, 2.55, 0],
    bone: root,
    flat: true,
    name: "flame",
  });
  b.part(new THREE.ConeGeometry(0.1, 0.35, 6), CORE, {
    at: [0, 2.42, 0],
    bone: root,
    flat: true,
    name: "flameCore",
  });

  // Rigging: eight ropes from the basket rim up to the skirt ring.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const rim: [number, number, number] = [0.62 * Math.cos(a), 1.0, 0.62 * Math.sin(a)];
    const mouth: [number, number, number] = [2.3 * Math.cos(a), 2.9, 2.3 * Math.sin(a)];
    b.rod(rim, mouth, 0.012, { color: ROPE, name: `rope${i}` });
  }

  return b.root;
}
