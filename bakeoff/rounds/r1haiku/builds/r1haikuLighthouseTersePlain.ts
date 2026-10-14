import * as THREE from "three";

export const meta = {
  name: "Lighthouse on a Tiny Island",
  description:
    "A red-and-white striped lighthouse with a glowing lantern room, a small keeper's cottage and rocks and shrubs on a tiny sea-washed island.",
};

// Small seeded PRNG (mulberry32) so every build is identical.
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function buildLighthouse(): THREE.Object3D {
  const rand = makeRng(7);

  // ---- Shared materials (one per colour) ----
  const M = {
    stone: new THREE.MeshStandardMaterial({ color: "#7d848d", roughness: 0.95 }),
    grass: new THREE.MeshStandardMaterial({ color: "#7aaa5c", roughness: 0.9 }),
    sand: new THREE.MeshStandardMaterial({ color: "#dcc692", roughness: 0.95 }),
    shrub: new THREE.MeshStandardMaterial({ color: "#4f8747", roughness: 0.9 }),
    plinth: new THREE.MeshStandardMaterial({ color: "#c4bcaa", roughness: 0.85 }),
    red: new THREE.MeshStandardMaterial({ color: "#c2362c", roughness: 0.6 }),
    white: new THREE.MeshStandardMaterial({ color: "#f4f0e6", roughness: 0.6 }),
    iron: new THREE.MeshStandardMaterial({ color: "#2f3439", roughness: 0.5, metalness: 0.4 }),
    brass: new THREE.MeshStandardMaterial({ color: "#d4a84c", roughness: 0.35, metalness: 0.7 }),
    lampGlass: new THREE.MeshStandardMaterial({
      color: "#fff2c4",
      emissive: "#ffd45e",
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.45,
      roughness: 0.2,
    }),
    lampCore: new THREE.MeshStandardMaterial({
      color: "#fff7d0",
      emissive: "#ffe27a",
      emissiveIntensity: 2.4,
    }),
    wood: new THREE.MeshStandardMaterial({ color: "#5b3b24", roughness: 0.8 }),
    windowGlass: new THREE.MeshStandardMaterial({ color: "#2a3b4d", roughness: 0.25, metalness: 0.1 }),
    houseWall: new THREE.MeshStandardMaterial({ color: "#efe6d4", roughness: 0.85 }),
    roofRed: new THREE.MeshStandardMaterial({ color: "#923027", roughness: 0.7 }),
    lanternRoof: new THREE.MeshStandardMaterial({ color: "#6e1f1b", roughness: 0.6 }),
  };

  const g = new THREE.Group();

  function add(
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = g,
  ): THREE.Mesh {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  }

  // ---- Island (bottom at y = -0.02, top at y = 0.76) ----
  add(new THREE.CylinderGeometry(4.0, 4.4, 0.72, 14), M.stone, 0, 0.34, 0);
  add(new THREE.CylinderGeometry(3.4, 3.7, 0.12, 14), M.grass, 0, 0.70, 0);
  const sand = new THREE.Mesh(new THREE.RingGeometry(3.3, 4.0, 16), M.sand);
  sand.rotation.x = -Math.PI / 2;
  sand.position.y = 0.755;
  g.add(sand);

  // Rocks around the shoreline
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + (rand() - 0.5) * 0.3;
    const r = 3.85 + rand() * 0.3;
    const s = 0.26 + rand() * 0.22;
    const rock = add(
      new THREE.DodecahedronGeometry(s, 0),
      rand() < 0.5 ? M.stone : M.plinth,
      Math.sin(a) * r,
      0.7,
      Math.cos(a) * r,
    );
    rock.scale.set(1, 0.6 + rand() * 0.3, 1);
    rock.rotation.set(rand() * 3, rand() * 3, rand() * 3);
  }

  // Shrubs on open grass, away from the tower and cottage
  const houseX = 1.8;
  const houseZ = -1.2;
  let placed = 0;
  for (let tries = 0; tries < 80 && placed < 7; tries++) {
    const a = rand() * Math.PI * 2;
    const r = 0.8 + rand() * 2.2;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    if (Math.hypot(x, z) < 1.9) continue;
    if (Math.hypot(x - houseX, z - houseZ) < 1.6) continue;
    const s = 0.22 + rand() * 0.2;
    const shrub = add(new THREE.IcosahedronGeometry(s, 0), M.shrub, x, 0.76 + s * 0.6, z);
    shrub.scale.set(1, 0.7, 1);
    shrub.rotation.y = rand() * 3;
    placed++;
  }

  // ---- Lighthouse plinth ----
  const TB = 1.46; // tower base y
  const TH = 6.5; // tower height
  const rAt = (y: number) => 1.25 - 0.45 * ((y - TB) / TH);

  add(new THREE.CylinderGeometry(1.5, 1.6, 0.7, 10), M.plinth, 0, 1.11, 0);

  // ---- Striped tower: stacked tapered bands ----
  for (let i = 0; i < 5; i++) {
    const y0 = TB + i * 1.3;
    const y1 = y0 + 1.3;
    const mat = i % 2 === 0 ? M.white : M.red;
    add(new THREE.CylinderGeometry(rAt(y1), rAt(y0), 1.3, 12), mat, 0, (y0 + y1) / 2, 0);
  }
  // Decorative iron bands at the joints
  for (let i = 1; i < 5; i++) {
    const y = TB + i * 1.3;
    const ring = add(new THREE.TorusGeometry(rAt(y) + 0.02, 0.05, 6, 16), M.iron, 0, y, 0);
    ring.rotation.x = Math.PI / 2;
  }

  // Portholes/windows around the tower
  const addWindow = (theta: number, y: number, r: number, w: number, h: number) => {
    const sx = Math.sin(theta);
    const cz = Math.cos(theta);
    const frame = add(new THREE.BoxGeometry(w + 0.08, h + 0.08, 0.08), M.white, sx * (r - 0.02), y, cz * (r - 0.02));
    frame.rotation.y = theta;
    const glass = add(new THREE.BoxGeometry(w, h, 0.08), M.windowGlass, sx * (r + 0.03), y, cz * (r + 0.03));
    glass.rotation.y = theta;
  };
  for (let k = 0; k < 4; k++) addWindow((k * Math.PI) / 2, 4.1, 1.08, 0.26, 0.42);
  addWindow(0, 6.2, 0.94, 0.2, 0.34);
  addWindow(Math.PI, 6.2, 0.94, 0.2, 0.34);

  // Front door with arched top
  const doorY = TB + 0.425;
  const doorR = rAt(doorY);
  add(new THREE.BoxGeometry(0.46, 0.85, 0.12), M.wood, 0, doorY, doorR + 0.02);
  const arch = add(new THREE.CylinderGeometry(0.23, 0.23, 0.12, 10), M.wood, 0, TB + 0.85, doorR + 0.02);
  arch.rotation.x = Math.PI / 2;
  add(new THREE.BoxGeometry(0.06, 0.06, 0.06), M.brass, 0.14, doorY, doorR + 0.1);

  // ---- Gallery deck and cap ----
  const topY = TB + TH; // 7.96
  add(new THREE.CylinderGeometry(0.9, 0.9, 0.2, 12), M.iron, 0, topY + 0.1, 0);
  add(new THREE.CylinderGeometry(1.05, 1.05, 0.12, 12), M.iron, 0, 8.12, 0);

  // Railing posts and top rail
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    add(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 4), M.iron, Math.sin(a) * 0.95, 8.43, Math.cos(a) * 0.95);
  }
  const rail = add(new THREE.TorusGeometry(0.95, 0.03, 6, 24), M.iron, 0, 8.68, 0);
  rail.rotation.x = Math.PI / 2;

  // ---- Lantern room ----
  add(new THREE.CylinderGeometry(0.68, 0.68, 0.08, 8), M.iron, 0, 8.22, 0);
  add(new THREE.CylinderGeometry(0.6, 0.6, 1.12, 8), M.lampGlass, 0, 8.82, 0);
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    add(new THREE.BoxGeometry(0.05, 1.14, 0.05), M.iron, Math.sin(a) * 0.61, 8.82, Math.cos(a) * 0.61);
  }
  add(new THREE.CylinderGeometry(0.68, 0.68, 0.07, 8), M.iron, 0, 9.4, 0);
  add(new THREE.SphereGeometry(0.3, 12, 8), M.lampCore, 0, 8.82, 0);

  // Roof, finial
  add(new THREE.ConeGeometry(0.8, 0.6, 8), M.lanternRoof, 0, 9.735, 0);
  add(new THREE.SphereGeometry(0.08, 10, 8), M.brass, 0, 10.07, 0);
  add(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 5), M.brass, 0, 10.2, 0);

  // ---- Keeper's cottage ----
  const house = new THREE.Group();
  house.position.set(houseX, 0.76, houseZ);
  house.rotation.y = 0.3;
  g.add(house);

  add(new THREE.BoxGeometry(1.9, 1.1, 1.4), M.houseWall, 0, 0.55, 0, house);
  // Triangular-prism roof (3-sided cylinder rotated so the apex points up)
  const roof = add(new THREE.CylinderGeometry(1.1, 1.1, 1.7, 3), M.roofRed, 0, 1.65, 0, house);
  roof.rotation.x = -Math.PI / 2;
  add(new THREE.BoxGeometry(0.34, 0.62, 0.06), M.wood, 0, 0.31, 0.72, house);
  add(new THREE.BoxGeometry(0.36, 0.36, 0.06), M.windowGlass, -0.55, 0.6, 0.72, house);
  add(new THREE.BoxGeometry(0.36, 0.36, 0.06), M.windowGlass, 0.55, 0.6, 0.72, house);
  add(new THREE.BoxGeometry(0.2, 0.6, 0.2), M.stone, 0.5, 2.0, -0.2, house);

  // Little lamp post beside the cottage
  add(new THREE.CylinderGeometry(0.03, 0.04, 0.9, 6), M.iron, -1.2, 0.45, 0.9, g);
  add(new THREE.BoxGeometry(0.14, 0.16, 0.14), M.lampCore, -1.2, 0.95, 0.9, g);

  return g;
}
