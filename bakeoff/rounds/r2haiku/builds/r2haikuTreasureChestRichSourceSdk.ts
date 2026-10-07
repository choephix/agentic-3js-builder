import * as THREE from "three";
import { catmull, createBuilder, grain, mottle, paint, rng } from "../../../../src/index";
import type { Fill, PartOptions } from "../../../../src/index";

export const meta = {
  name: "Pirate treasure chest",
  description:
    "A weathered wooden sea chest with its lid thrown open, iron straps and studs, a loose padlock, a skull-and-crossbones on the front, and spilled gold, pearls, a jewelled goblet and gems.",
};

type V = [number, number, number];

export default function treasureChest() {
  const b = createBuilder({ name: "treasure_chest", detail: 1, paintSize: 1024 });

  // Paints ---------------------------------------------------------------------------------------------
  const plank = grain("#6e4a2a", "#3a2514", { size: 0.06, axis: "x", seed: 2 });
  // Dark seam lines every 14 cm, so the planks read as boards.
  const wood = paint((p) => {
    const f = (((p.y / 0.14) % 1) + 1) % 1;
    return f < 0.035 ? "#1c120a" : plank;
  });
  const iron = mottle("#4a2e1e", "#9a4f22", { size: 0.03, seed: 5 });
  const gold = mottle("#b8861b", "#f2c94c", { size: 0.03, seed: 4 });
  const lock = "#3d3f44";
  const pearl = "#f3eee0";
  const skull = "#e8dcc2";
  const plaque = "#2a1a0e";
  const red = "#b0101c";
  const green = "#0f8f4a";

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const ball = (r: number) => new THREE.SphereGeometry(r, 10, 8);
  const place = (geometry: THREE.BufferGeometry, color: Fill, at: V, options: PartOptions = {}) =>
    b.part(geometry, color, { at, bone: "root", ...options });

  // Skeleton: a root for the body and a hinge joint for the lid at its back top edge.
  b.joint("root", { at: [0, 0, 0] });
  b.joint("lid", { parent: "root", at: [0, 0.42, -0.28], role: "hinge" });

  // Body: floor, front, back and sides, so the chest is hollow ----------------------------------------
  place(box(0.9, 0.04, 0.56), wood, [0, 0.02, 0]);
  place(box(0.9, 0.42, 0.04), wood, [0, 0.21, 0.26]);
  place(box(0.9, 0.42, 0.04), wood, [0, 0.21, -0.26]);
  place(box(0.04, 0.42, 0.48), wood, [0.43, 0.21, 0]);
  place(box(0.04, 0.42, 0.48), wood, [-0.43, 0.21, 0]);

  // Iron straps across the front and back, and round the sides, with rivet studs -------------------
  for (const x of [-0.3, 0.3]) {
    place(box(0.035, 0.44, 0.014), iron, [x, 0.21, 0.288]);
    place(box(0.035, 0.44, 0.014), iron, [x, 0.21, -0.288]);
    for (const y of [0.06, 0.2, 0.36]) place(ball(0.012), iron, [x, y, 0.302]);
  }
  for (const x of [-0.457, 0.457]) place(box(0.014, 0.44, 0.035), iron, [x, 0.21, 0]);

  // Carved front: a dark plaque with a skull and crossbones ------------------------------------------
  place(box(0.26, 0.26, 0.012), plaque, [0, 0.19, 0.292]);
  place(new THREE.SphereGeometry(0.058, 12, 10), skull, [0, 0.25, 0.318]);
  place(box(0.07, 0.03, 0.04), skull, [0, 0.19, 0.315]);
  place(ball(0.017), plaque, [-0.024, 0.26, 0.365]);
  place(ball(0.017), plaque, [0.024, 0.26, 0.365]);
  place(box(0.012, 0.018, 0.012), plaque, [0, 0.232, 0.37]);
  b.rod([-0.08, 0.07, 0.31], [0.08, 0.15, 0.31], 0.011, { color: skull, bone: "root" });
  b.rod([0.08, 0.07, 0.31], [-0.08, 0.15, 0.31], 0.011, { color: skull, bone: "root" });

  // Hasp and a heavy padlock hanging loose from it ---------------------------------------------------
  place(box(0.05, 0.04, 0.014), iron, [0.22, 0.4, 0.296]);
  place(box(0.07, 0.085, 0.03), lock, [0.22, 0.315, 0.31], { rotation: [0, 0, 8] });
  place(new THREE.TorusGeometry(0.018, 0.005, 6, 12), lock, [0.22, 0.362, 0.31]);

  // Gold coins heaped inside, and a few spilled on the ground in front --------------------------------
  const R = rng(11);
  const coin = new THREE.CylinderGeometry(0.022, 0.022, 0.006, 12);
  for (let i = 0; i < 70; i++) {
    const x = (R() * 2 - 1) * 0.38;
    const z = (R() * 2 - 1) * 0.2;
    const d = Math.max(0, 1 - (x * x) / (0.4 * 0.4) - (z * z) / (0.22 * 0.22));
    const y = 0.045 + 0.12 * Math.sqrt(d) * (0.6 + 0.4 * R());
    place(coin, gold, [x, y, z], { rotation: [(R() - 0.5) * 20, R() * 360, (R() - 0.5) * 20] });
  }
  for (let i = 0; i < 16; i++) {
    const x = (R() * 2 - 1) * 0.36;
    const z = 0.33 + R() * 0.22;
    place(coin, gold, [x, 0.003, z], { rotation: [(R() - 0.5) * 8, R() * 360, (R() - 0.5) * 8] });
  }

  // Pearl necklace draped over the coins -------------------------------------------------------------
  const pearlGeo = ball(0.011);
  for (let k = 0; k < 18; k++) {
    const s = k / 17;
    const x = -0.2 + 0.4 * s;
    const z = 0.02 + 0.03 * Math.sin(s * Math.PI);
    const y = 0.165 + 0.04 * (2 * s - 1) ** 2;
    place(pearlGeo, pearl, [x, y, z]);
  }

  // Jewelled goblet standing in the coins -------------------------------------------------------------
  const gx = -0.17;
  const gy = 0.13;
  const gz = -0.09;
  const goblet: Array<[number, number]> = [
    [0, 0],
    [0.045, 0],
    [0.045, 0.01],
    [0.012, 0.02],
    [0.01, 0.1],
    [0.035, 0.11],
    [0.055, 0.17],
    [0.058, 0.2],
    [0.05, 0.215],
    [0, 0.215],
  ];
  b.lathe(goblet, { color: gold, at: [gx, gy, gz], bone: "root", segments: 14, name: "goblet" });
  const jewel = new THREE.OctahedronGeometry(0.009);
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3;
    const color = k % 2 === 0 ? red : green;
    place(jewel, color, [gx + 0.06 * Math.cos(a), gy + 0.18, gz + 0.06 * Math.sin(a)], {
      rotation: [0, k * 40, 0],
    });
  }

  // Loose gems spilling out: a few in the heap, a few on the ground ----------------------------------
  const gem = new THREE.OctahedronGeometry(0.018);
  for (let i = 0; i < 11; i++) {
    const x = (R() * 2 - 1) * 0.26;
    const z = (R() * 2 - 1) * 0.16;
    place(gem, i % 2 === 0 ? red : green, [x, 0.14 + R() * 0.02, z], {
      rotation: [R() * 90, R() * 90, R() * 90],
    });
  }
  for (let i = 0; i < 4; i++) {
    const x = (R() * 2 - 1) * 0.3;
    const z = 0.4 + R() * 0.12;
    place(gem, i % 2 === 0 ? green : red, [x, 0.017, z], { rotation: [R() * 60, R() * 360, R() * 60] });
  }

  // Lid: a half-cylinder dome hinged at the back, with its own straps and hinge pin ------------------
  const dome = new THREE.CylinderGeometry(0.28, 0.28, 0.9, 16, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).scale(1, 0.4, 1);
  place(dome, wood, [0, 0.42, 0], { bone: "lid" });
  for (const x of [-0.3, 0, 0.3]) {
    const arc = Array.from({ length: 13 }, (_, i) => {
      const t = (Math.PI * i) / 12;
      return [x, 0.42 + 0.118 * Math.sin(t), 0.282 * Math.cos(t)] as V;
    });
    b.sweep(catmull(arc), 0.012, { color: iron, bone: "lid" });
    place(ball(0.013), iron, [x, 0.54, 0], { bone: "lid" });
  }
  b.rod([-0.46, 0.42, -0.28], [0.46, 0.42, -0.28], 0.013, { color: iron, bone: "lid" });

  // Pose the lid open, about the hinge, leaning back ---------------------------------------------------
  b.pose("lid", { axis: [1, 0, 0], deg: -110 });

  return b.root;
}
