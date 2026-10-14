import * as THREE from "three";
import { createBuilder, grain, rng } from "../../../../src/index";

export const meta = {
  name: "Treasure chest",
  description: "A banded wooden treasure chest with iron straps, a brass lock, and a heap of gold coins and gems under the open lid.",
};

const WOOD = grain("#7a4a24", "#4a2a12", { size: 0.04, axis: "x" });
const IRON = "#2f2f35";
const BRASS = "#c8912e";
const GOLD = "#e7b13a";
const DARK = "#1c1410";
const RED = "#c0182b";
const BLUE = "#1d6fd1";
const GREEN = "#21b06c";

export default function build() {
  const b = createBuilder({ name: "treasure-chest" });

  // Skeleton: a root for the chest body and a hinge at the back top edge of the lid.
  const chest = b.joint("chest", { at: [0, 0, 0] });
  const lid = b.joint("lid", { parent: chest, at: [0, 0.42, -0.28], role: "hinge" });

  // Body: a solid wooden box sitting on four iron feet.
  b.part(new THREE.BoxGeometry(0.9, 0.37, 0.56), WOOD, { bone: chest, at: [0, 0.235, 0] });
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      b.part(new THREE.BoxGeometry(0.08, 0.05, 0.08), IRON, { bone: chest, at: [sx * 0.36, 0.025, sz * 0.2] });

  // Iron straps on front and back, plus bands along the top and bottom.
  for (const x of [-0.27, 0.27])
    for (const z of [0.29, -0.29])
      b.part(new THREE.BoxGeometry(0.05, 0.37, 0.02), IRON, { bone: chest, at: [x, 0.235, z] });
  b.part(new THREE.BoxGeometry(0.92, 0.04, 0.02), IRON, { bone: chest, at: [0, 0.4, 0.29] });
  b.part(new THREE.BoxGeometry(0.92, 0.04, 0.02), IRON, { bone: chest, at: [0, 0.07, 0.29] });
  b.part(new THREE.BoxGeometry(0.92, 0.04, 0.02), IRON, { bone: chest, at: [0, 0.4, -0.29] });
  b.part(new THREE.BoxGeometry(0.92, 0.04, 0.02), IRON, { bone: chest, at: [0, 0.07, -0.29] });

  // Side straps.
  for (const sx of [-1, 1])
    b.part(new THREE.BoxGeometry(0.02, 0.37, 0.05), IRON, { bone: chest, at: [sx * 0.46, 0.235, 0] });

  // Brass lock plate with a dark keyhole.
  b.part(new THREE.BoxGeometry(0.12, 0.14, 0.03), BRASS, { bone: chest, at: [0, 0.27, 0.295] });
  b.part(new THREE.BoxGeometry(0.03, 0.05, 0.02), DARK, { bone: chest, at: [0, 0.26, 0.315] });

  // Gold and gem heap spilling out of the body, in the chest's open top.
  const r = rng(7);
  for (let i = 0; i < 46; i++) {
    const x = (r() - 0.5) * 0.7;
    const z = (r() - 0.5) * 0.4;
    const h = Math.max(0, 0.12 * (1 - (x * x) / 0.14 - (z * z) / 0.04));
    if (h < 0.005) continue;
    const y = 0.42 + 0.005 + r() * h;
    b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.008, 10), GOLD, {
      bone: chest,
      at: [x, y, z],
      rotation: [r() * 30 - 15, r() * 360, r() * 30 - 15],
    });
  }
  const gems = [RED, BLUE, GREEN, RED, BLUE, GREEN];
  for (let i = 0; i < gems.length; i++) {
    const x = (r() - 0.5) * 0.5;
    const z = (r() - 0.5) * 0.3;
    const h = Math.max(0, 0.12 * (1 - (x * x) / 0.14 - (z * z) / 0.04));
    b.part(new THREE.IcosahedronGeometry(0.028, 0), gems[i], {
      bone: chest,
      at: [x, 0.42 + 0.02 + h * 0.6, z],
      flat: true,
    });
  }

  // Lid: a curved wooden arch extruded across the chest's width.
  b.extrude(
    [
      [0, 0],
      [0.56, 0],
      [0.56, 0.04],
      [0.5, 0.1],
      [0.3, 0.13],
      [0.1, 0.13],
      [0, 0.08],
    ],
    {
      at: [0, 0.42, -0.28],
      bone: lid,
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.9,
      bevel: 0.006,
      color: WOOD,
    },
  );

  // Lid straps and hinge barrel ride the lid joint.
  for (const x of [-0.27, 0, 0.27])
    b.part(new THREE.BoxGeometry(0.05, 0.05, 0.44), IRON, { bone: lid, at: [x, 0.53, 0] });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.92, 8).rotateZ(Math.PI / 2), IRON, {
    bone: lid,
    at: [0, 0.42, -0.28],
  });

  // Open the lid: the front edge lifts about the hinge.
  b.pose(lid, { axis: [1, 0, 0], deg: -42 });

  return b.root;
}
