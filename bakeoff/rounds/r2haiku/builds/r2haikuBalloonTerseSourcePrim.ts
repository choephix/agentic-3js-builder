import * as THREE from "three";
import { createBuilder, paint, stripes } from "../../../../src/index";

export const meta = {
  name: "Hot-air balloon",
  description: "A striped gored envelope on a rope ring, wicker basket, burner flame and pennant, about 20 m tall.",
};

const CREAM = "#fff1d6";
const RED = "#d7263d";
const YELLOW = "#ffc93c";
const ROPE = "#5b4636";
const GORES = [RED, CREAM, YELLOW, CREAM, RED, CREAM, YELLOW, CREAM];

export default function balloon() {
  const b = createBuilder({ name: "hot-air-balloon", detail: 1, paintSize: 1024 });

  // Skeleton: a root on the ground and the envelope bone that the balloon hangs from.
  b.joint("root", { at: [0, 0, 0], dir: [0, 1, 0] });
  b.joint("envelope", { parent: "root", at: [0, 11.2, 0], dir: [0, 1, 0] });

  // Envelope: a lathed teardrop, open at the bottom, painted in gores with a dark skirt.
  const envelopePaint = paint((p, n, s) => {
    if (s[0] < -6.9) return "#3b2a1f";
    return GORES[Math.floor(s[1] / 45) % 8];
  });
  b.lathe(
    [
      [1.1, -8],
      [1.9, -7.7],
      [2.9, -6.6],
      [3.8, -4.6],
      [4.5, -2.2],
      [4.8, 0.3],
      [4.6, 2.8],
      [3.9, 5.1],
      [2.8, 6.9],
      [1.5, 7.9],
      [0.5, 8.05],
      [0, 8.1],
    ],
    {
      color: envelopePaint,
      at: [0, 11.2, 0],
      axis: [0, 1, 0],
      segments: 16,
      bone: "envelope",
      name: "envelope",
    },
  );

  // Crown at the top of the envelope, and a pole with a pennant.
  b.part(new THREE.CylinderGeometry(0.42, 0.6, 0.5, 8), "#2b2b2b", { at: [0, 18.95, 0], bone: "envelope" });
  b.rod([0, 19.2, 0], [0, 20.1, 0], 0.04, { color: "#333333", name: "pole" });
  b.slab(
    [
      [0, 20.1, 0],
      [1.1, 19.95, 0],
      [0, 19.75, 0],
    ],
    { color: RED, thickness: 0.03, name: "pennant" },
  );

  // Rope ring round the skirt, and four suspension ropes down to the basket corners.
  const ring = new THREE.TorusGeometry(3.2, 0.09, 6, 16);
  ring.rotateX(Math.PI / 2);
  b.part(ring, ROPE, { at: [0, 5.0, 0], bone: "envelope", name: "ropeRing" });
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.rod([sx * 2.3, 5.0, sz * 2.3], [sx * 0.75, 1.0, sz * 0.5], 0.03, { color: ROPE, name: "rope" });

  // Wicker basket: body, rim, and a fuel tank on its side.
  const wicker = stripes("#9c6b3c", "#6e4424", { size: 0.14, axis: "y", width: 0.45 });
  b.part(new THREE.BoxGeometry(1.6, 0.95, 1.1), wicker, { at: [0, 0.475, 0], bone: "root", name: "basket" });
  b.part(new THREE.BoxGeometry(1.75, 0.1, 1.25), "#5a3a1e", { at: [0, 1.0, 0], bone: "root", name: "basketRim" });
  const tank = new THREE.CylinderGeometry(0.2, 0.2, 0.7, 8);
  tank.rotateZ(Math.PI / 2);
  b.part(tank, "#b8bec6", { at: [-1.05, 0.5, 0.25], bone: "root", name: "fuelTank" });

  // Burner under the mouth, and its flame.
  b.part(new THREE.CylinderGeometry(0.42, 0.5, 0.7, 8), "#8a8f96", { at: [0, 2.2, 0], bone: "root", name: "burner" });
  b.part(new THREE.ConeGeometry(0.2, 0.55, 8), "#ff8a1f", { at: [0, 2.9, 0], bone: "root", name: "flame" });

  return b.root;
}
