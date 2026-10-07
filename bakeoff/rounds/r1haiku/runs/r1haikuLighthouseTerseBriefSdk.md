```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "lighthouse",
  description: "A red-and-white striped lighthouse with a glowing lantern room, keeper's cottage and rocks on a tiny island.",
};

const COLORS = {
  red: "#c8372d",
  white: "#f4f1e8",
  iron: "#3a3f47",
  glass: "#ffe9a6",
  lamp: "#fff2b0",
  rock: "#6b5d4f",
  stone: "#8a8580",
  grass: "#6fa35a",
  wall: "#e9d9b5",
  roof: "#8c3b2e",
  door: "#5a3a24",
  window: "#2b3a4a",
  sea: "#2f7fb8",
  foam: "#f7fbff",
};

const materials = new Map<string, THREE.MeshStandardMaterial>();
function mat(color: string): THREE.MeshStandardMaterial {
  let m = materials.get(color);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.04 });
    materials.set(color, m);
  }
  return m;
}

function put(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  color: string,
  x: number,
  y: number,
  z: number,
  rot: [number, number, number] = [0, 0, 0],
): THREE.Mesh {
  const mesh = new THREE.Mesh(geo, mat(color));
  mesh.position.set(x, y, z);
  mesh.rotation.set(rot[0], rot[1], rot[2]);
  parent.add(mesh);
  return mesh;
}

// Tower radius: a gentle taper from the base up to the gallery.
const TOWER_BASE = 0.8;
const TOWER_TOP = 10.0;
function towerR(y: number): number {
  const t = (y - TOWER_BASE) / (TOWER_TOP - TOWER_BASE);
  return 1.45 - 0.5 * t;
}

export default function build() {
  const b = createBuilder({ name: "lighthouse" });
  const root = b.root;
  const random = rng(11);

  // Sea and foam ring, slightly under y = 0 so the island sits in the water.
  put(root, new THREE.CylinderGeometry(9, 9, 0.08, 20), COLORS.sea, 0, -0.04, 0);
  put(root, new THREE.TorusGeometry(4.9, 0.1, 5, 20), COLORS.foam, 0, 0.0, 0, [Math.PI / 2, 0, 0]);

  // Island: a low faceted rock base with a grassy top.
  put(root, new THREE.CylinderGeometry(4.0, 4.6, 0.8, 12), COLORS.rock, 0, 0.4, 0);
  put(root, new THREE.CylinderGeometry(4.05, 4.05, 0.12, 12), COLORS.grass, 0, 0.86, 0);

  // Rocks round the shoreline, half sunk into the water.
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + random() * 0.4;
    const r = 4.3 + random() * 0.6;
    const s = 0.25 + random() * 0.3;
    const rock = put(
      root,
      new THREE.DodecahedronGeometry(s, 0),
      i % 2 ? COLORS.stone : COLORS.rock,
      Math.cos(a) * r,
      0.1 + random() * 0.15,
      Math.sin(a) * r,
      [random() * 3, random() * 3, random() * 3],
    );
    rock.scale.set(1, 0.7 + random() * 0.4, 1);
  }

  // Tower: alternating red and white frustum bands.
  const bands = 6;
  const span = (TOWER_TOP - TOWER_BASE) / bands;
  for (let i = 0; i < bands; i++) {
    const y0 = TOWER_BASE + i * span;
    const y1 = y0 + span;
    const geo = new THREE.CylinderGeometry(towerR(y1), towerR(y0), span + 0.01, 12);
    put(root, geo, i % 2 === 0 ? COLORS.red : COLORS.white, 0, (y0 + y1) / 2, 0);
  }

  // Door and windows on the tower, facing +Z.
  put(root, new THREE.BoxGeometry(0.36, 0.62, 0.1), COLORS.door, 0, 1.3, towerR(1.3) + 0.02);
  for (const y of [4.2, 6.9]) {
    put(root, new THREE.BoxGeometry(0.22, 0.4, 0.08), COLORS.window, 0, y, towerR(y) + 0.02);
  }

  // Gallery deck with a rail.
  const galleryY = TOWER_TOP + 0.15;
  put(root, new THREE.CylinderGeometry(1.32, 1.3, 0.3, 12), COLORS.iron, 0, galleryY, 0);
  const railTop = galleryY + 0.9;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    put(
      root,
      new THREE.BoxGeometry(0.06, 0.9, 0.06),
      COLORS.iron,
      Math.cos(a) * 1.22,
      galleryY + 0.45 + 0.15,
      Math.sin(a) * 1.22,
    );
  }
  put(root, new THREE.TorusGeometry(1.2, 0.05, 5, 12), COLORS.iron, 0, railTop, 0, [Math.PI / 2, 0, 0]);

  // Lantern room: glowing glass with iron mullions.
  const lanternY0 = galleryY + 0.15;
  const lanternH = 1.2;
  const lanternMid = lanternY0 + lanternH / 2;
  put(root, new THREE.CylinderGeometry(0.85, 0.85, lanternH, 12), COLORS.glass, 0, lanternMid, 0);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    put(
      root,
      new THREE.BoxGeometry(0.07, lanternH, 0.07),
      COLORS.iron,
      Math.cos(a) * 0.86,
      lanternMid,
      Math.sin(a) * 0.86,
    );
  }
  // The lamp itself.
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 10, 8),
    new THREE.MeshStandardMaterial({
      color: COLORS.lamp,
      emissive: COLORS.lamp,
      emissiveIntensity: 1.6,
      roughness: 0.4,
    }),
  );
  lamp.position.set(0, lanternMid, 0);
  root.add(lamp);

  // Roof, cap and finial.
  const roofBase = lanternY0 + lanternH;
  put(root, new THREE.CylinderGeometry(1.0, 1.0, 0.12, 12), COLORS.iron, 0, roofBase + 0.06, 0);
  put(root, new THREE.ConeGeometry(1.05, 0.7, 12), COLORS.red, 0, roofBase + 0.47, 0);
  put(root, new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6), COLORS.iron, 0, roofBase + 0.97, 0);
  put(root, new THREE.SphereGeometry(0.12, 8, 6), COLORS.iron, 0, roofBase + 1.15, 0);

  // Keeper's cottage, square and facing +Z.
  const cx = -2.2;
  const cz = 0.8;
  const wallH = 1.5;
  const wallY = 0.86 + wallH / 2;
  put(root, new THREE.BoxGeometry(2.2, wallH, 1.9), COLORS.wall, cx, wallY, cz);
  put(
    root,
    new THREE.ConeGeometry(1.45, 1.0, 4),
    COLORS.roof,
    cx,
    0.86 + wallH + 0.5,
    cz,
    [0, Math.PI / 4, 0],
  );
  put(root, new THREE.BoxGeometry(0.4, 0.8, 0.05), COLORS.door, cx, 1.26, cz + 0.97);
  put(root, new THREE.BoxGeometry(0.42, 0.36, 0.05), COLORS.window, cx + 0.6, 1.6, cz + 0.97);
  put(root, new THREE.BoxGeometry(0.42, 0.36, 0.05), COLORS.window, cx - 0.6, 1.6, cz + 0.97);

  return root;
}
```