```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Island Lighthouse",
  description:
    "A red-and-white stone lighthouse with a glowing lantern and lit beam on a tiny rocky island, with a keeper's cottage, stepping-stone path, flowers, rocks and a rowboat.",
};

type V3 = [number, number, number];

const C = {
  sea: "#2b75a0",
  shallow: "#4aa6cc",
  foam: "#eef8fb",
  stone: "#7d766a",
  stoneDark: "#5e5a52",
  stoneLight: "#968f82",
  grass: "#7fa650",
  bush: "#5a8b3d",
  bushLight: "#6f9d48",
  path: "#d9cfb6",
  red: "#c93a2e",
  white: "#f5f1e6",
  cream: "#e6dfcc",
  deck: "#6a645c",
  iron: "#2c3538",
  glass: "#1f2c36",
  glow: "#ffe49a",
  roof: "#2f7a66",
  gold: "#d9a94c",
  rod: "#b3bac0",
  door: "#4a2f20",
  cottage: "#f1e7cf",
  cottageRoof: "#a2473a",
  cottageGlow: "#ffd27a",
  boat: "#f0ead8",
  beam: "#fff2b0",
  flowerYellow: "#f2c94c",
  flowerPink: "#f08a8a",
};

const BASE_Y = 1.9; // grass cap of the island
const TOP_Y = 14.4; // tower top, under the gallery
const LANTERN_Y = 15.93; // centre of the lit glass
const towerR = (y: number) => 2.75 - (0.9 * (y - BASE_Y)) / (TOP_Y - BASE_Y);
const SIDES = 14;

export default function build() {
  const b = createBuilder({ name: "lighthouse" });
  b.joint("root", { at: [0, 0, 0] });

  const put = (geo: THREE.BufferGeometry, color: string, at: V3) => {
    b.part({ geo, color, at, dir: [0, 1, 0] });
  };

  // Geometry built with local +Z pointing outward, hugging the tower at a compass angle.
  const onTower = (
    geo: THREE.BufferGeometry,
    color: string,
    deg: number,
    y: number,
    push: number,
  ) => {
    const a = (deg * Math.PI) / 180;
    const r = towerR(y) + push;
    put(geo.rotateY(a), color, [r * Math.sin(a), y, r * Math.cos(a)]);
  };

  // ---------- sea ----------
  put(new THREE.CylinderGeometry(13, 13, 0.2, 28), C.sea, [0, -0.08, 0]);
  put(new THREE.CylinderGeometry(10.6, 10.6, 0.23, 28), C.shallow, [0, -0.065, 0]);
  put(new THREE.TorusGeometry(10.6, 0.14, 6, 40).rotateX(Math.PI / 2), C.foam, [0, 0.04, 0]);

  const seaFoam: [number, number][] = [
    [-4.04, -11.09],
    [-7.6, 9.0],
    [10.2, -5.9],
  ];
  for (const [x, z] of seaFoam) {
    put(new THREE.SphereGeometry(0.55, 8, 5).scale(1.0, 0.22, 1.0), C.foam, [x, 0.02, z]);
  }

  // ---------- island ----------
  put(new THREE.CylinderGeometry(8.6, 9.6, 1.5, 16), C.stone, [0, 0.65, 0]); // -0.1 .. 1.4
  put(new THREE.CylinderGeometry(6.6, 7.4, 0.5, 16), C.grass, [0, 1.65, 0]); // 1.4 .. 1.9

  const rocks: [number, number, number, string][] = [
    [5.9, 8.4, 0.9, C.stone],
    [5.1, -8.9, 0.7, C.stoneDark],
    [-4.4, -9.3, 1.0, C.stoneLight],
    [-9.7, -3.5, 0.75, C.stoneDark],
    [-8.9, 5.2, 0.85, C.stone],
  ];
  rocks.forEach(([x, z, s, col], i) => {
    const g = new THREE.IcosahedronGeometry(0.85 * s, 0)
      .scale(1.15, 0.55, 0.95)
      .rotateY(i * 1.3);
    put(g, col, [x, 0.26, z]);
  });

  const bush = (x: number, z: number, r: number, col: string) => {
    put(new THREE.SphereGeometry(r, 8, 6).scale(1.1, 0.8, 1.0), col, [x, BASE_Y + 0.22, z]);
  };
  bush(3.3, 3.5, 0.6, C.bush);
  bush(3.95, 2.95, 0.42, C.bushLight);
  bush(4.7, -0.9, 0.55, C.bush);
  bush(-1.4, -4.6, 0.62, C.bush);
  bush(0.9, -5.0, 0.4, C.bushLight);

  const flowers: [number, number, string][] = [
    [-2.2, 3.2, C.flowerYellow],
    [-1.0, 5.6, C.flowerPink],
    [2.2, 4.4, C.flowerPink],
    [4.0, 1.8, C.flowerYellow],
    [-2.6, -4.0, C.flowerYellow],
    [1.4, -3.2, C.flowerPink],
  ];
  for (const [x, z, col] of flowers) {
    put(new THREE.SphereGeometry(0.12, 6, 4), col, [x, BASE_Y + 0.08, z]);
  }

  // stepping-stone path from the tower door
  const stones: [number, number][] = [
    [0.15, 3.9],
    [-0.2, 4.7],
    [0.1, 5.4],
  ];
  for (const [x, z] of stones) {
    put(new THREE.CylinderGeometry(0.5, 0.52, 0.08, 10), C.path, [x, BASE_Y + 0.04, z]);
  }

  // ---------- lighthouse tower ----------
  const edges = [BASE_Y, 5.4, 8.3, 11.2, TOP_Y];
  const bands = [C.red, C.white, C.red, C.white];
  bands.forEach((col, i) => {
    const y0 = edges[i];
    const y1 = edges[i + 1];
    const g = new THREE.CylinderGeometry(towerR(y1), towerR(y0), y1 - y0, SIDES).rotateY(
      -Math.PI / SIDES,
    );
    put(g, col, [0, (y0 + y1) / 2, 0]);
  });

  // cream cornice rings where the bands meet
  for (const y of [5.4, 8.3, 11.2]) {
    const g = new THREE.CylinderGeometry(
      towerR(y) + 0.22,
      towerR(y) + 0.24,
      0.28,
      SIDES,
    ).rotateY(-Math.PI / SIDES);
    put(g, C.cream, [0, y, 0]);
  }

  // front door with white trim and arched top, plus a step
  onTower(new THREE.BoxGeometry(1.3, 2.45, 0.14), C.white, 0, 3.125, 0.02);
  onTower(new THREE.BoxGeometry(0.9, 2.0, 0.12), C.door, 0, 2.9, 0.07);
  onTower(new THREE.CylinderGeometry(0.45, 0.45, 0.12, 12).rotateX(Math.PI / 2), C.door, 0, 3.9, 0.07);
  put(new THREE.SphereGeometry(0.06, 6, 4), C.gold, [0.24, 2.6, towerR(2.6) + 0.1]);
  put(new THREE.BoxGeometry(1.7, 0.1, 0.6), C.stoneLight, [0, 1.95, 3.0]);

  // arrow slits on the lower red band
  onTower(new THREE.BoxGeometry(0.16, 0.7, 0.1), C.glass, 120, 3.2, 0.04);
  onTower(new THREE.BoxGeometry(0.16, 0.7, 0.1), C.glass, 240, 3.2, 0.04);

  // windows on the second (white) band
  for (const deg of [0, 90, 180, 270]) {
    onTower(new THREE.BoxGeometry(0.76, 1.1, 0.12), C.iron, deg, 6.85, 0.0);
    onTower(new THREE.BoxGeometry(0.5, 0.8, 0.1), C.glass, deg, 6.85, 0.07);
  }

  // portholes on the top (white) band
  for (const deg of [45, 135, 225, 315]) {
    onTower(
      new THREE.CylinderGeometry(0.24, 0.24, 0.14, 10).rotateX(Math.PI / 2),
      C.iron,
      deg,
      12.7,
      0.02,
    );
    onTower(
      new THREE.CylinderGeometry(0.18, 0.18, 0.16, 10).rotateX(Math.PI / 2),
      C.glass,
      deg,
      12.7,
      0.06,
    );
  }

  // ---------- gallery ----------
  put(new THREE.CylinderGeometry(2.45, 2.25, 0.28, 16), C.deck, [0, TOP_Y + 0.14, 0]);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    put(
      new THREE.CylinderGeometry(0.045, 0.045, 0.92, 5),
      C.iron,
      [2.3 * Math.sin(a), 15.14, 2.3 * Math.cos(a)],
    );
  }
  put(new THREE.TorusGeometry(2.3, 0.05, 6, 36).rotateX(Math.PI / 2), C.iron, [0, 15.6, 0]);
  put(new THREE.TorusGeometry(2.3, 0.035, 6, 36).rotateX(Math.PI / 2), C.iron, [0, 15.16, 0]);

  // ---------- lantern room ----------
  put(new THREE.CylinderGeometry(1.7, 1.85, 0.25, 12), C.iron, [0, 14.8, 0]);
  put(new THREE.CylinderGeometry(1.3, 1.3, 2.0, 12), C.glow, [0, LANTERN_Y, 0]);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    put(
      new THREE.BoxGeometry(0.12, 2.0, 0.12),
      C.iron,
      [1.36 * Math.sin(a), LANTERN_Y, 1.36 * Math.cos(a)],
    );
  }
  put(new THREE.CylinderGeometry(1.55, 1.55, 0.16, 12), C.iron, [0, 17.01, 0]);
  put(new THREE.ConeGeometry(2.0, 1.2, 12), C.roof, [0, 17.69, 0]);
  put(new THREE.SphereGeometry(0.22, 10, 8), C.gold, [0, 18.36, 0]);
  put(new THREE.CylinderGeometry(0.035, 0.035, 1.2, 5), C.rod, [0, 19.0, 0]);
  put(new THREE.SphereGeometry(0.07, 6, 4), C.gold, [0, 19.62, 0]);

  // lit beam: a flat wedge sweeping out over the sea
  const beamShape = new THREE.Shape();
  beamShape.moveTo(-0.45, 0);
  beamShape.lineTo(0.45, 0);
  beamShape.lineTo(2.9, 9);
  beamShape.lineTo(-2.9, 9);
  beamShape.closePath();
  const beam = new THREE.ExtrudeGeometry(beamShape, { depth: 0.12, bevelEnabled: false })
    .rotateX(Math.PI / 2)
    .translate(0, 0.06, 0)
    .rotateY(Math.PI / 6);
  put(beam, C.beam, [0, LANTERN_Y, 0]);

  // ---------- keeper's cottage ----------
  const cx = -4.4;
  const cz = -1.0;
  put(new THREE.BoxGeometry(2.6, 1.7, 2.4), C.cottage, [cx, BASE_Y + 0.85, cz]);

  const roofShape = new THREE.Shape();
  roofShape.moveTo(-1.55, 0);
  roofShape.lineTo(1.55, 0);
  roofShape.lineTo(0, 1.25);
  roofShape.closePath();
  put(
    new THREE.ExtrudeGeometry(roofShape, { depth: 2.8, bevelEnabled: false }).translate(0, 0, -1.4),
    C.cottageRoof,
    [cx, 3.6, cz],
  );

  put(new THREE.BoxGeometry(0.86, 1.36, 0.06), C.white, [cx, 2.58, 0.22]);
  put(new THREE.BoxGeometry(0.7, 1.2, 0.1), C.door, [cx, 2.5, 0.25]);
  for (const dx of [-0.95, 0.95]) {
    const wx = cx + dx;
    put(new THREE.BoxGeometry(0.62, 0.66, 0.06), C.white, [wx, 2.8, 0.22]);
    put(new THREE.BoxGeometry(0.46, 0.5, 0.07), C.cottageGlow, [wx, 2.8, 0.27]);
    put(new THREE.BoxGeometry(0.46, 0.05, 0.08), C.white, [wx, 2.8, 0.29]);
    put(new THREE.BoxGeometry(0.05, 0.5, 0.08), C.white, [wx, 2.8, 0.29]);
  }

  put(new THREE.BoxGeometry(0.42, 1.1, 0.42), C.stoneDark, [cx + 0.6, 4.1, cz - 0.5]);
  put(new THREE.BoxGeometry(0.54, 0.12, 0.54), C.iron, [cx + 0.6, 4.71, cz - 0.5]);

  // ---------- rowboat on the sea ----------
  put(new THREE.BoxGeometry(1.4, 0.42, 3.0), C.boat, [11.07, 0.21, 1.94]);
  put(new THREE.BoxGeometry(1.48, 0.07, 3.08), C.red, [11.07, 0.4, 1.94]);

  return b.root;
}
```