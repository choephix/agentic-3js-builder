import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "lighthouse-diorama",
  description:
    "A striped lighthouse on a tiny rocky island with a keeper's cottage, a jetty and rowboat, two gulls, grass and wildflowers, turquoise water with foam, on a round wooden base.",
};

// Heights (metres)
const WATER_TOP = 0.26;
const GROUND = 0.44; // grass top of the island

// Lighthouse position and size
const LX = -0.3;
const LZ = -0.2;
const TOWER_H = 1.6;

// Cottage
const CX = 0.4;
const CZ = 0.2;

// Jetty and boat
const JX = -0.45;
const BX = -0.78;
const BZ = 0.85;

export default function build() {
  const b = createBuilder({ name: "lighthouse-diorama" });
  const rand = rng(11);

  const put = (geo: THREE.BufferGeometry, color: string, x: number, y: number, z: number) => {
    b.part(geo, color, { at: [x, y, z] });
  };

  // ---------- Round display base ----------
  put(new THREE.CylinderGeometry(1.25, 1.3, 0.18, 40), "#7a4f2a", 0, 0.09, 0);
  put(new THREE.CylinderGeometry(1.2, 1.25, 0.03, 40), "#a0703f", 0, 0.175, 0);

  // ---------- Water ----------
  put(new THREE.CylinderGeometry(1.2, 1.2, 0.08, 40), "#20c4b8", 0, 0.22, 0);
  put(new THREE.CylinderGeometry(1.12, 1.14, 0.02, 40), "#5ee8d8", 0, 0.265, 0);

  // Water rocks poking out at the edge
  const waterRocks = [0.6, 2.0, 4.3];
  for (const a of waterRocks) {
    const r = 0.09 + rand() * 0.04;
    put(
      new THREE.DodecahedronGeometry(r, 0),
      "#8a939c",
      Math.cos(a) * 1.02,
      WATER_TOP - 0.02,
      Math.sin(a) * 1.02,
    );
  }

  // ---------- Foam around the shore ----------
  const FOAM_N = 34;
  for (let i = 0; i < FOAM_N; i++) {
    const a = (i / FOAM_N) * Math.PI * 2 + (rand() - 0.5) * 0.15;
    const r = 0.93 + rand() * 0.08;
    const s = 0.045 + rand() * 0.025;
    const g = new THREE.SphereGeometry(s, 6, 4);
    g.scale(1, 0.5, 1);
    put(g, "#ffffff", Math.cos(a) * r, WATER_TOP + 0.005, Math.sin(a) * r);
  }

  // ---------- Island ----------
  put(new THREE.CylinderGeometry(0.9, 0.98, 0.12, 14), "#8c8577", 0, 0.32, 0);
  put(new THREE.CylinderGeometry(0.8, 0.86, 0.06, 14), "#8fbf5a", 0, 0.41, 0);

  // Rim rocks
  const rimAngles = [0.3, 1.2, 2.4, 3.1, 3.9, 4.7, 5.6];
  rimAngles.forEach((a, i) => {
    const r = 0.07 + rand() * 0.05;
    const rad = 0.72 + rand() * 0.1;
    const color = i % 2 ? "#7d8590" : "#9aa3ad";
    put(
      new THREE.DodecahedronGeometry(r, 0),
      color,
      Math.cos(a) * rad,
      GROUND + 0.01,
      Math.sin(a) * rad,
    );
  });

  // ---------- Grass tufts and wildflowers ----------
  const onFreeGround = (x: number, z: number) => {
    if (Math.hypot(x - LX, z - LZ) < 0.32) return false;
    if (Math.abs(x - CX) < 0.4 && Math.abs(z - CZ) < 0.4) return false;
    if (Math.abs(x - JX) < 0.25 && z > 0.3) return false;
    return true;
  };

  const grassColors = ["#5fa23a", "#7bbf4a", "#4e8f33"];
  let placedTufts = 0;
  for (let attempt = 0; attempt < 120 && placedTufts < 22; attempt++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * 0.7;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (!onFreeGround(x, z)) continue;
    placedTufts++;
    for (let k = 0; k < 3; k++) {
      const ox = (rand() - 0.5) * 0.05;
      const oz = (rand() - 0.5) * 0.05;
      const h = 0.09 + rand() * 0.05;
      const g = new THREE.ConeGeometry(0.022, h, 4);
      put(g, grassColors[k % grassColors.length], x + ox, GROUND + h / 2, z + oz);
    }
  }

  const flowerColors = ["#ff6fa8", "#ffd23f", "#b58cff", "#ffffff"];
  let placedFlowers = 0;
  for (let attempt = 0; attempt < 160 && placedFlowers < 14; attempt++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * 0.7;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (!onFreeGround(x, z)) continue;
    placedFlowers++;
    const stemH = 0.07;
    put(new THREE.CylinderGeometry(0.004, 0.004, stemH, 4), "#3f7a2c", x, GROUND + stemH / 2, z);
    put(
      new THREE.SphereGeometry(0.022, 6, 5),
      flowerColors[placedFlowers % flowerColors.length],
      x,
      GROUND + stemH + 0.01,
      z,
    );
  }

  // ---------- Lighthouse tower (striped, tapering) ----------
  const rAt = (t: number) => 0.2 - 0.06 * t;
  const STRIPES = 6;
  const seg = TOWER_H / STRIPES;
  for (let k = 0; k < STRIPES; k++) {
    const y0 = GROUND + k * seg;
    const rb = rAt((k * seg) / TOWER_H);
    const rt = rAt(((k + 1) * seg) / TOWER_H);
    const g = new THREE.CylinderGeometry(rt, rb, seg + 0.005, 12);
    put(g, k % 2 === 0 ? "#d9372c" : "#f5f2ea", LX, y0 + seg / 2, LZ);
  }

  // Tower door and a small gallery window
  put(new THREE.BoxGeometry(0.08, 0.14, 0.02), "#22262b", LX, GROUND + 0.07, LZ + 0.195);
  put(new THREE.BoxGeometry(0.05, 0.08, 0.02), "#ffd96a", LX, 1.2, LZ + 0.175);

  // Black iron balcony
  const TOP = GROUND + TOWER_H; // 2.04
  put(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 16), "#1d1d20", LX, TOP - 0.005, LZ);
  const RAIL_N = 14;
  for (let i = 0; i < RAIL_N; i++) {
    const a = (i / RAIL_N) * Math.PI * 2;
    put(
      new THREE.CylinderGeometry(0.01, 0.01, 0.16, 4),
      "#1d1d20",
      LX + Math.cos(a) * 0.225,
      TOP + 0.08,
      LZ + Math.sin(a) * 0.225,
    );
  }
  const topRail = new THREE.TorusGeometry(0.225, 0.008, 4, 18);
  topRail.rotateX(Math.PI / 2);
  put(topRail, "#1d1d20", LX, TOP + 0.16, LZ);

  // Lantern room: glowing glass, black frame, cap and finial
  put(new THREE.CylinderGeometry(0.13, 0.13, 0.3, 8), "#ffe38a", LX, TOP + 0.15, LZ);
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    put(
      new THREE.BoxGeometry(0.02, 0.3, 0.02),
      "#1d1d20",
      LX + Math.cos(a) * 0.13,
      TOP + 0.15,
      LZ + Math.sin(a) * 0.13,
    );
  }
  put(new THREE.ConeGeometry(0.17, 0.14, 8), "#1d1d20", LX, TOP + 0.37, LZ);
  put(new THREE.SphereGeometry(0.025, 8, 6), "#d9372c", LX, TOP + 0.47, LZ);

  // ---------- Keeper's cottage ----------
  put(new THREE.BoxGeometry(0.45, 0.32, 0.36), "#f3e4c6", CX, GROUND + 0.16, CZ);

  const roof = new THREE.ConeGeometry(0.33, 0.24, 4);
  roof.rotateY(Math.PI / 4);
  put(roof, "#b5452f", CX, GROUND + 0.44, CZ);

  // Crooked chimney, tilted by baking the rotation into the geometry
  const chimney = new THREE.BoxGeometry(0.08, 0.3, 0.08);
  chimney.rotateZ(0.15);
  put(chimney, "#7a6f66", CX + 0.14, GROUND + 0.5, CZ - 0.1);

  // Blue door, window with frame
  put(new THREE.BoxGeometry(0.09, 0.17, 0.02), "#2d6cc4", CX, GROUND + 0.085, CZ + 0.185);
  put(new THREE.BoxGeometry(0.12, 0.11, 0.01), "#ffffff", CX + 0.13, GROUND + 0.2, CZ + 0.18);
  put(new THREE.BoxGeometry(0.1, 0.09, 0.02), "#ffd96a", CX + 0.13, GROUND + 0.2, CZ + 0.185);

  // ---------- Jetty ----------
  for (let i = 0; i < 6; i++) {
    put(new THREE.BoxGeometry(0.28, 0.035, 0.09), "#9c6b3f", JX, 0.46, 0.6 + i * 0.1);
  }
  for (const z of [0.6, 1.1]) {
    for (const dx of [-0.12, 0.12]) {
      put(new THREE.CylinderGeometry(0.022, 0.022, 0.24, 6), "#5b3a20", JX + dx, 0.34, z);
    }
  }

  // ---------- Rowboat tied at the jetty ----------
  put(new THREE.BoxGeometry(0.2, 0.09, 0.5), "#ffc53d", BX, 0.28, BZ);
  put(new THREE.BoxGeometry(0.19, 0.03, 0.06), "#8a5a33", BX, 0.33, BZ - 0.12);
  put(new THREE.BoxGeometry(0.19, 0.03, 0.06), "#8a5a33", BX, 0.33, BZ + 0.12);
  put(new THREE.BoxGeometry(0.44, 0.012, 0.012), "#f2e2c0", BX, 0.36, BZ + 0.02);

  // ---------- Seagulls ----------
  const gull = (cx: number, cy: number, cz: number, yaw: number, flap: number) => {
    const white = "#f7f7f2";
    const grey = "#9aa5b1";

    const body = new THREE.SphereGeometry(0.065, 10, 8);
    body.scale(1, 0.85, 1.7);
    put2(body.rotateY(yaw).translate(cx, cy, cz), white);

    const head = new THREE.SphereGeometry(0.042, 8, 6).translate(0, 0.035, 0.085);
    put2(head.rotateY(yaw).translate(cx, cy, cz), white);

    const beak = new THREE.ConeGeometry(0.013, 0.07, 5)
      .rotateX(Math.PI / 2)
      .translate(0, 0.03, 0.13);
    put2(beak.rotateY(yaw).translate(cx, cy, cz), "#f4a53a");

    const tail = new THREE.BoxGeometry(0.05, 0.012, 0.09).translate(0, 0.005, -0.11);
    put2(tail.rotateY(yaw).translate(cx, cy, cz), grey);

    for (const side of [1, -1]) {
      const f = side > 0 ? flap : -flap;
      const wing = new THREE.BoxGeometry(0.22, 0.012, 0.07)
        .rotateZ(f)
        .translate(side * 0.16, 0.02 + 0.1 * Math.sin(flap), 0);
      put2(wing.rotateY(yaw).translate(cx, cy, cz), white);

      const tip = new THREE.BoxGeometry(0.07, 0.014, 0.072)
        .rotateZ(f)
        .translate(side * 0.25 * Math.cos(flap), 0.02 + 0.25 * Math.sin(flap), 0);
      put2(tip.rotateY(yaw).translate(cx, cy, cz), grey);
    }
  };

  const put2 = (geo: THREE.BufferGeometry, color: string) => {
    b.part(geo, color, { at: [0, 0, 0] });
  };

  gull(0.15, 1.95, -0.55, 0.6, 0.35);
  gull(-0.6, 2.1, 0.1, -0.9, 0.5);

  return b.root;
}
