import * as THREE from "three";
import { type Builder, createBuilder, frame } from "../../../../src/index";

type BasePartFn = (b: Builder) => void;
const PARTS: BasePartFn[] = [
  // chestDetail
  (() => {
function buildChestDetail(b: Builder) {
  const bone = "chest";
  const WOOD = "#8a5a2b", WOOD_D = "#6b4220", IRON = "#3a3d46", IRON_L = "#5a5f6b";
  const GOLD = "#ffd23a", GOLD_D = "#d9a21c", BRASS = "#e0b040";
  const CZ = -0.45, W = 0.96, R = 0.3, BASE_Y = 0.5;
  const X = [0, 0, 1] as const;

  // curved lid: half cylinder along X
  const lidGeo = (len: number, r: number) =>
    new THREE.CylinderGeometry(r, r, len, 12, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateX(0);
  // cylinder axis Y -> rotateZ makes axis X; half arc faces +Y after rotation tweak
  const half = (len: number, r: number) => {
    const g = new THREE.CylinderGeometry(r, r, len, 12, 1, false, -Math.PI / 2, Math.PI);
    g.rotateZ(Math.PI / 2);
    g.rotateY(0);
    return g;
  };
  // after rotateZ(90deg), arc direction points toward +Y/-Y; build it so the dome faces up
  const dome = (len: number, r: number, x: number) => {
    const g = new THREE.CylinderGeometry(r, r, len, 12, 1, false, 0, Math.PI);
    g.rotateZ(Math.PI / 2);
    g.rotateX(-Math.PI / 2);
    g.scale(1, 1, 1);
    return g.translate(x, 0, 0);
  };
  void lidGeo; void half;

  const put = (g: THREE.BufferGeometry, c: string, at: [number, number, number]) =>
    b.part(g, c, { bone, at, flat: true });

  // lid body, scaled so depth 0.6 (r=0.3) and height 0.3 above the rim
  put(dome(W, R, 0), WOOD, [0, BASE_Y + 0.02, CZ]);
  // lid base rim slab
  put(new THREE.BoxGeometry(W, 0.04, 0.6), WOOD_D, [0, BASE_Y + 0.02, CZ]);

  // iron bands over the arch
  for (const x of [-0.32, 0.32]) {
    const g = new THREE.CylinderGeometry(R + 0.012, R + 0.012, 0.08, 12, 1, false, 0, Math.PI);
    g.rotateZ(Math.PI / 2);
    g.rotateX(-Math.PI / 2);
    put(g, IRON, [x, BASE_Y + 0.02, CZ]);
    // studs along the band
    for (let i = 0; i < 5; i++) {
      const a = (i / 4) * Math.PI;
      put(new THREE.SphereGeometry(0.02, 6, 4), IRON_L, [x, BASE_Y + 0.02 + Math.sin(a) * (R + 0.02), CZ + Math.cos(a) * (R + 0.02)]);
    }
  }
  // end caps (plates on lid sides)
  for (const s of [1, -1]) {
    put(new THREE.CylinderGeometry(R + 0.005, R + 0.005, 0.03, 12, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateX(-Math.PI / 2), IRON, [s * (W / 2 + 0.005), BASE_Y + 0.02, CZ]);
  }
  // corner plates on the front-lower lid corners
  for (const s of [1, -1]) {
    put(new THREE.BoxGeometry(0.1, 0.1, 0.03), IRON, [s * 0.44, BASE_Y + 0.07, -0.315]);
    put(new THREE.SphereGeometry(0.015, 6, 4), IRON_L, [s * 0.44, BASE_Y + 0.07, -0.33]);
    // hinges at back
    put(new THREE.BoxGeometry(0.1, 0.12, 0.03), IRON, [s * 0.3, BASE_Y + 0.08, -0.62]);
    put(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8).rotateZ(Math.PI / 2), IRON_L, [s * 0.3, BASE_Y + 0.02, -0.63]);
  }
  // hasp + lock plate on the front
  put(new THREE.BoxGeometry(0.1, 0.16, 0.025), IRON, [0, BASE_Y + 0.1, -0.31]);
  put(new THREE.BoxGeometry(0.16, 0.14, 0.03), BRASS, [0, BASE_Y - 0.06, -0.315]);
  put(new THREE.BoxGeometry(0.03, 0.06, 0.035), "#1a1a1f", [0, BASE_Y - 0.06, -0.33]);
  put(new THREE.CylinderGeometry(0.016, 0.016, 0.035, 8).rotateX(Math.PI / 2), "#1a1a1f", [0, BASE_Y - 0.04, -0.33]);
  // studs on the front lid edge
  for (let i = -3; i <= 3; i++) {
    if (Math.abs(i) < 1) continue;
    put(new THREE.BoxGeometry(0.03, 0.03, 0.02), IRON_L, [i * 0.12, BASE_Y + 0.02, -0.31]);
  }

  // spilled gold coins in front of the chest
  const coin = (x: number, y: number, z: number, tilt: number, c: string) => {
    const g = new THREE.CylinderGeometry(0.04, 0.04, 0.012, 8);
    g.rotateZ(tilt);
    put(g, c, [x, y, z]);
  };
  const pts: [number, number, number, number][] = [
    [-0.15, 0.412, -0.38, 0], [-0.05, 0.412, -0.45, 0.1], [0.08, 0.412, -0.4, 0],
    [0.2, 0.412, -0.5, -0.1], [-0.22, 0.412, -0.55, 0.05], [0.0, 0.412, -0.58, 0],
    [0.14, 0.412, -0.64, 0.1], [-0.1, 0.425, -0.5, 0], [0.04, 0.425, -0.46, 0.15],
    [-0.28, 0.412, -0.68, 0], [0.26, 0.412, -0.4, 0], [-0.02, 0.412, -0.7, 0.05],
    [0.1, 0.437, -0.43, 0], [-0.18, 0.437, -0.46, 0.1], [0.3, 0.412, -0.62, 0],
  ];
  pts.forEach((p, i) => coin(p[0], p[1], p[2], p[3], i % 3 ? GOLD : GOLD_D));
  // coins peeking from the lid gap
  for (let i = 0; i < 4; i++) coin(-0.15 + i * 0.1, BASE_Y + 0.03, -0.31, 0.2, GOLD);
  void frame; void X;
}
    return buildChestDetail;
  })(),
  // torches
  (() => {
function buildTorches(b: Builder) {
  const WALL_Z = -0.95;
  const IRON = "#3a3d4a";
  const IRON_L = "#5c6070";
  const WOOD = "#6b4423";
  const WOOD_D = "#4a2e16";
  const CLOTH = "#b89a63";
  const CLOTH_D = "#8a6f3e";
  const PITCH = "#2a1a10";
  const F_RED = "#d8321c";
  const F_ORG = "#ff8a1c";
  const F_YEL = "#ffd23c";
  const F_WHT = "#fff4b0";
  const EMBER = "#ff5a1a";
  const T = 0.04; // pixel unit

  const bone = "wall";
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: [x, y, z] });

  for (const s of [1, -1]) {
    const cx = s * 1.3;
    // Back plate on the wall
    box(0.2, 0.2, 0.04, IRON, cx, 1.62, WALL_Z + 0.02);
    box(0.12, 0.12, 0.02, IRON_L, cx, 1.62, WALL_Z + 0.05);
    // rivets
    for (const [dx, dy] of [[-0.07, -0.07], [0.07, -0.07], [-0.07, 0.07], [0.07, 0.07]])
      box(0.03, 0.03, 0.02, IRON_L, cx + dx, 1.62 + dy, WALL_Z + 0.05);
    // Arm out from the wall
    box(0.06, 0.06, 0.14, IRON, cx, 1.58, WALL_Z + 0.11);
    // Cup ring: four bars around the handle
    const cy = 1.56;
    const cz = WALL_Z + 0.2;
    box(0.2, 0.04, 0.04, IRON, cx, cy, cz - 0.08);
    box(0.2, 0.04, 0.04, IRON, cx, cy, cz + 0.08);
    box(0.04, 0.04, 0.2, IRON, cx - 0.08, cy, cz);
    box(0.04, 0.04, 0.2, IRON, cx + 0.08, cy, cz);
    // Diagonal brace
    box(0.04, 0.04, 0.16, IRON_L, cx, 1.5, WALL_Z + 0.1);
    // Wooden handle (slightly tilted pixel steps)
    box(0.1, 0.34, 0.1, WOOD, cx, 1.66, cz);
    box(0.04, 0.3, 0.02, WOOD_D, cx + 0.03, 1.66, cz + 0.055);
    box(0.1, 0.04, 0.1, WOOD_D, cx, 1.5, cz);
    // Wrapped head: cloth bands
    box(0.16, 0.1, 0.16, CLOTH, cx, 1.88, cz);
    box(0.18, 0.04, 0.18, CLOTH_D, cx, 1.84, cz);
    box(0.18, 0.04, 0.18, CLOTH_D, cx, 1.93, cz);
    box(0.14, 0.04, 0.14, PITCH, cx, 1.97, cz);
    // Pixel flame: stacked, narrowing
    box(0.14, 0.08, 0.14, F_RED, cx, 2.03, cz);
    box(0.12, 0.1, 0.12, F_ORG, cx, 2.1, cz);
    box(0.08, 0.1, 0.08, F_YEL, cx, 2.18, cz);
    box(0.04, 0.08, 0.04, F_WHT, cx, 2.2, cz);
    box(0.04, 0.06, 0.04, F_ORG, cx + s * 0.02, 2.26, cz);
    // flame side licks
    box(0.04, 0.06, 0.04, F_RED, cx - 0.09, 2.06, cz);
    box(0.04, 0.04, 0.04, F_ORG, cx + 0.09, 2.1, cz + 0.02);
    // Embers floating
    const embers: [number, number, number][] = [
      [0.1, 2.24, 0.04],
      [-0.1, 2.16, -0.03],
      [0.05, 2.29, -0.05],
      [-0.06, 2.28, 0.05],
    ];
    for (const [dx, y, dz] of embers) box(T * 0.6, T * 0.6, T * 0.6, EMBER, cx + dx * s, y, cz + dz);
    // Soot stain on the wall above
    box(0.12, 0.1, 0.01, "#2a2622", cx, 1.9, WALL_Z + 0.005);
  }
}
    return buildTorches;
  })(),
  // barrels
  (() => {
function buildBarrels(b: Builder) {
  const bone = "floor";
  const WOOD = "#8a5a2b", WOOD2 = "#6e451f", WOOD3 = "#a06b35";
  const IRON = "#3b3d46", IRON2 = "#5a5d68", LID = "#7a4d24", DARK = "#2a1a0c";
  const Y0 = 0.1;

  const put = (g: THREE.BufferGeometry, c: string, at: [number, number, number], rot?: [number, number, number]) =>
    b.part(g, c, { bone, at, rotation: rot, flat: true });

  // Upright barrel: base centre (x,z), base y, radius, height.
  const barrel = (x: number, y: number, z: number, r: number, h: number, seed: number) => {
    const cy = y + h / 2;
    // body: belly-wide octagon with narrower ends
    put(new THREE.CylinderGeometry(r, r, h * 0.5, 10), WOOD, [x, cy, z]);
    put(new THREE.CylinderGeometry(r * 0.88, r, h * 0.26, 10), WOOD, [x, y + h * 0.13 + 0.0, z].map((v, i) => (i === 1 ? y + h * 0.13 : v)) as [number, number, number]);
    put(new THREE.CylinderGeometry(r, r * 0.88, h * 0.26, 10), WOOD, [x, y + h * 0.87, z]);
    // stave seams
    for (let i = 0; i < 10; i += 2) {
      const a = (i / 10) * Math.PI * 2 + seed;
      put(new THREE.BoxGeometry(0.012, h * 0.98, 0.012), WOOD2, [x + Math.sin(a) * r * 0.99, cy, z + Math.cos(a) * r * 0.99], [0, (a * 180) / Math.PI, 0]);
    }
    // lighter stave patches
    for (let i = 1; i < 10; i += 3) {
      const a = (i / 10) * Math.PI * 2 + seed;
      put(new THREE.BoxGeometry(0.05, h * 0.5, 0.01), WOOD3, [x + Math.sin(a) * r * 1.0, cy, z + Math.cos(a) * r * 1.0], [0, (a * 180) / Math.PI, 0]);
    }
    // hoops
    for (const [f, rr] of [[0.1, 0.9], [0.3, 0.99], [0.7, 0.99], [0.9, 0.9]] as const) {
      put(new THREE.CylinderGeometry(r * rr + 0.012, r * rr + 0.012, 0.035, 10), IRON, [x, y + h * f, z]);
      put(new THREE.CylinderGeometry(r * rr + 0.016, r * rr + 0.016, 0.01, 10), IRON2, [x, y + h * f + 0.012, z]);
    }
    // lid
    put(new THREE.CylinderGeometry(r * 0.86, r * 0.86, 0.03, 10), LID, [x, y + h + 0.005, z]);
    put(new THREE.BoxGeometry(r * 1.5, 0.012, 0.03), WOOD2, [x, y + h + 0.025, z]);
    put(new THREE.BoxGeometry(0.03, 0.012, r * 1.5), WOOD2, [x, y + h + 0.027, z]);
  };

  // two standing at back, one stacked on top
  barrel(-1.45, Y0, -0.2, 0.26, 0.55, 0.3);
  barrel(-1.02, Y0, -0.28, 0.24, 0.5, 1.1);
  barrel(-1.3, Y0 + 0.55 + 0.04, -0.22, 0.22, 0.5, 2.0);

  // tipped barrel lying on its side, opening toward +Z
  {
    const r = 0.22, h = 0.5, cx = -1.5, cz = 0.32, cy = Y0 + r + 0.005;
    const rot: [number, number, number] = [90, 0, 0];
    put(new THREE.CylinderGeometry(r, r, h * 0.5, 10), WOOD, [cx, cy, cz], rot);
    put(new THREE.CylinderGeometry(r * 0.88, r, h * 0.26, 10), WOOD, [cx, cy, cz - h * 0.38], rot);
    put(new THREE.CylinderGeometry(r, r * 0.88, h * 0.26, 10), WOOD, [cx, cy, cz + h * 0.38], rot);
    for (const f of [-0.4, -0.2, 0.2, 0.4])
      put(new THREE.CylinderGeometry(r * (Math.abs(f) > 0.3 ? 0.9 : 1) + 0.012, r * (Math.abs(f) > 0.3 ? 0.9 : 1) + 0.012, 0.035, 10), IRON, [cx, cy, cz + f * h * 1.0 * 0.95], rot);
    // open end: dark interior and rim
    put(new THREE.CylinderGeometry(r * 0.8, r * 0.8, 0.02, 10), DARK, [cx, cy, cz + h / 2 + 0.002], rot);
    // seams
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      put(new THREE.BoxGeometry(0.012, 0.012, h * 0.95), WOOD2, [cx + Math.sin(a) * r, cy + Math.cos(a) * r, cz]);
    }
    // spilled planks / chocks
    put(new THREE.BoxGeometry(0.08, 0.06, 0.06), WOOD2, [cx - 0.3, Y0 + 0.03, cz]);
    put(new THREE.BoxGeometry(0.08, 0.06, 0.06), WOOD2, [cx + 0.3, Y0 + 0.03, cz]);
  }

  // plank crate at right of the box
  {
    const cx = -1.0, cz = 0.3, s = 0.4, cy = Y0 + s / 2;
    put(new THREE.BoxGeometry(s, s, s), WOOD2, [cx, cy, cz]);
    // corner posts
    for (const sx of [-1, 1]) for (const sz of [-1, 1])
      put(new THREE.BoxGeometry(0.05, s + 0.01, 0.05), WOOD, [cx + sx * (s / 2 - 0.02), cy, cz + sz * (s / 2 - 0.02)]);
    // front planks
    for (let i = 0; i < 4; i++) {
      put(new THREE.BoxGeometry(s - 0.08, 0.075, 0.015), i % 2 ? WOOD3 : WOOD, [cx, Y0 + 0.06 + i * 0.095, cz + s / 2 + 0.003]);
      put(new THREE.BoxGeometry(0.015, 0.075, s - 0.08), i % 2 ? WOOD : WOOD3, [cx + s / 2 + 0.003, Y0 + 0.06 + i * 0.095, cz]);
    }
    // top slats
    for (let i = 0; i < 4; i++)
      put(new THREE.BoxGeometry(0.08, 0.02, s + 0.02), i % 2 ? WOOD3 : WOOD, [cx - 0.15 + i * 0.1, Y0 + s + 0.008, cz]);
    // diagonal brace
    put(new THREE.BoxGeometry(0.04, 0.5, 0.012), WOOD3, [cx, cy, cz + s / 2 + 0.016], [0, 0, 45]);
    // nails
    for (const sx of [-1, 1]) for (const sy of [-1, 1])
      put(new THREE.BoxGeometry(0.02, 0.02, 0.012), IRON, [cx + sx * 0.15, cy + sy * 0.15, cz + s / 2 + 0.024]);
  }

  // join marker frame (keeps frame import used)
  void frame;
}
    return buildBarrels;
  })(),
  // bones
  (() => {
function buildBones(b: Builder) {
  const BONE = "#e8e0c8";
  const BONE_D = "#b8ad8c";
  const DARK = "#14110e";
  const CRACK = "#7a7058";
  const Y0 = 0.1;
  const bone = "floor";

  const box = (w: number, h: number, d: number, c: string, at: [number, number, number], rotY = 0, rotZ = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, {
      bone,
      at,
      rotation: [0, (rotY * 180) / Math.PI, (rotZ * 180) / Math.PI],
    });

  // Skull (blocky pixel style)
  const sx = 1.55, sz = 0.45;
  const sy = Y0 + 0.09;
  box(0.22, 0.16, 0.2, BONE, [sx, sy, sz], 0.4);
  box(0.16, 0.06, 0.16, BONE_D, [sx + 0.02, Y0 + 0.03, sz - 0.02], 0.4); // jaw
  // eye sockets
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.05, 0.05, 0.03), DARK, {
      bone,
      at: [sx + 0.09 * Math.cos(0.4) * 0 + 0.0 + s * 0.05 * Math.cos(0.4) + 0.1 * Math.sin(0.4), sy + 0.02, sz + 0.1 * Math.cos(0.4) - s * 0.05 * Math.sin(0.4)],
      rotation: [0, (0.4 * 180) / Math.PI, 0],
    });
  }
  box(0.03, 0.04, 0.03, DARK, [sx + 0.1 * Math.sin(0.4), sy - 0.03, sz + 0.1 * Math.cos(0.4)], 0.4); // nose
  box(0.02, 0.1, 0.02, CRACK, [sx - 0.03, sy + 0.05, sz + 0.0], 0.4); // crack

  // Ribcage: spine + curved ribs
  const rx = 1.2, rz = -0.1;
  box(0.05, 0.05, 0.5, BONE_D, [rx, Y0 + 0.03, rz]);
  for (let i = 0; i < 6; i++) {
    const z = rz - 0.2 + i * 0.08;
    const h = 0.16 - Math.abs(i - 2.5) * 0.02;
    for (const s of [1, -1]) {
      box(0.04, 0.04, 0.04, BONE, [rx + s * 0.08, Y0 + 0.1 + h * 0.4, z]);
      box(0.04, 0.04, 0.04, BONE, [rx + s * 0.13, Y0 + 0.07, z]);
      box(0.04, 0.04, 0.04, BONE, [rx + s * 0.1, Y0 + 0.015 + 0.02, z]);
    }
  }
  box(0.05, 0.03, 0.03, CRACK, [rx, Y0 + 0.07, rz]);

  // Crossed femurs
  const fx = 1.5, fz = -0.1;
  for (const s of [1, -1]) {
    const a = s * 0.6;
    const fy = Y0 + 0.03 + (s > 0 ? 0 : 0.04);
    box(0.45, 0.05, 0.06, BONE, [fx, fy, fz], a);
    for (const e of [1, -1]) {
      const ex = fx + e * 0.225 * Math.cos(a);
      const ez = fz - e * 0.225 * Math.sin(a);
      box(0.08, 0.07, 0.08, BONE, [ex, fy, ez], a);
    }
  }

  // Scattered vertebrae and small bones
  const spots: [number, number][] = [
    [1.0, 0.5], [1.75, 0.1], [1.85, -0.3], [0.9, -0.3], [1.3, 0.7], [1.75, 0.65], [1.0, 0.2], [1.65, -0.35],
  ];
  spots.forEach(([x, z], i) => {
    if (i % 2 === 0) {
      box(0.06, 0.05, 0.06, BONE_D, [x, Y0 + 0.025, z], i);
      box(0.02, 0.03, 0.02, CRACK, [x, Y0 + 0.06, z], i);
    } else {
      box(0.14, 0.03, 0.035, BONE, [x, Y0 + 0.015, z], i * 0.7);
      box(0.04, 0.04, 0.04, BONE, [x + 0.07 * Math.cos(i * 0.7), Y0 + 0.02, z - 0.07 * Math.sin(i * 0.7)], i * 0.7);
    }
  });
}
    return buildBones;
  })(),
  // spikeTrap
  (() => {
function buildSpikeTrap(b: Builder) {
  const CX = 0, CZ = 0.8, Y0 = 0.1;
  const RUST = "#7a3b1e", RUST2 = "#9a5326", DARK = "#1b1512", IRON = "#5d6169", IRONL = "#9aa0a8", BLOOD = "#6b1010", WIRE = "#c9b98a";
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });

  // pit floor
  box(0.86, 0.02, 0.86, DARK, CX, Y0 + 0.01, CZ);
  // rusty frame rim
  const S = 0.45;
  box(1.0, 0.05, 0.08, RUST, CX, Y0 + 0.025, CZ + S);
  box(1.0, 0.05, 0.08, RUST, CX, Y0 + 0.025, CZ - S);
  box(0.08, 0.05, 0.9, RUST, CX + S, Y0 + 0.025, CZ);
  box(0.08, 0.05, 0.9, RUST, CX - S, Y0 + 0.025, CZ);
  // rim highlights and rivets
  box(0.96, 0.01, 0.02, RUST2, CX, Y0 + 0.055, CZ + S);
  box(0.96, 0.01, 0.02, RUST2, CX, Y0 + 0.055, CZ - S);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.04, 0.03, 0.04, IRON, CX + sx * S, Y0 + 0.065, CZ + sz * S);

  // spike grid
  const n = 5, step = 0.15;
  const raised = new Set(["0,1", "1,3", "2,2", "3,0", "4,4", "3,3"]);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x = CX + (i - 2) * step, z = CZ + (j - 2) * step;
    box(0.07, 0.025, 0.07, IRON, x, Y0 + 0.032, z);
    const up = raised.has(`${i},${j}`);
    const h = up ? 0.36 : 0.04;
    b.part(new THREE.ConeGeometry(0.028, h, 4), up ? IRONL : IRON, { at: [x, Y0 + 0.04 + h / 2, z] });
    if (up) box(0.03, 0.03, 0.03, BLOOD, x, Y0 + 0.07, z);
  }
  // blood stains on the pit floor
  box(0.2, 0.004, 0.14, BLOOD, CX - 0.12, Y0 + 0.022, CZ + 0.18);
  box(0.12, 0.004, 0.1, BLOOD, CX + 0.2, Y0 + 0.022, CZ - 0.15);
  box(0.06, 0.004, 0.06, BLOOD, CX + 0.05, Y0 + 0.022, CZ + 0.3);
  // loose tripwire across the front
  const zf = CZ + 0.62;
  box(0.04, 0.08, 0.04, RUST, CX - 0.42, Y0 + 0.04, zf);
  box(0.04, 0.08, 0.04, RUST, CX + 0.42, Y0 + 0.04, zf);
  b.rod([CX - 0.42, Y0 + 0.07, zf], [CX + 0.08, Y0 + 0.035, zf + 0.04], 0.006, WIRE);
  b.rod([CX + 0.08, Y0 + 0.035, zf + 0.04], [CX + 0.3, Y0 + 0.012, zf + 0.1], 0.006, WIRE);
}
    return buildSpikeTrap;
  })(),
];

// Layout (metres, +Z front, centred on x=0):
// Chest at centre-back, torches on wall posts at the sides, barrels front-left,
// bones pile front-right, spike trap plate in front of the chest.
// Base: a flagstone floor slab, a back wall segment, and the chest body (box, no lid detail).

export const BASE_PARTS = [
  {
    id: "chestDetail",
    builds: "chest lid with curved top, iron bands, corner plates, lock plate, hasp, studs, hinges, gold coins spilling out",
    box: [
      [-0.5, 0.4, -0.75],
      [0.5, 1.0, -0.15],
    ],
    attaches: "top face of the chest body at y=0.5 and its front face z=-0.3",
    joints: ["chest"],
    floor: false,
    budget: 200,
  },
  {
    id: "torches",
    builds: "two wall torches: iron sconce brackets, wooden handles, wrapped heads, glowing pixel flames and embers",
    box: [
      [-1.6, 1.2, -1.05],
      [1.6, 2.3, -0.75],
    ],
    attaches: "front face of the back wall at z=-0.95, at x=+-1.3 near y=1.7",
    joints: ["wall"],
    floor: false,
    budget: 150,
  },
  {
    id: "barrels",
    builds: "two or three stacked and standing barrels with staves, iron hoops, lids, a tipped one, plank crate beside them",
    box: [
      [-1.9, 0.1, -0.5],
      [-0.8, 1.3, 0.7],
    ],
    attaches: "stone floor top surface at y=0.1, left-front area",
    joints: ["floor"],
    floor: false,
    budget: 200,
  },
  {
    id: "bones",
    builds: "skull, ribcage, crossed femurs, scattered vertebrae and small bones, cracks and eye sockets",
    box: [
      [0.8, 0.1, -0.4],
      [1.9, 0.6, 0.8],
    ],
    attaches: "stone floor top surface at y=0.1, right-front area",
    joints: ["floor"],
    floor: false,
    budget: 150,
  },
  {
    id: "spikeTrap",
    builds: "retractable iron spikes in a grid, rusty plate frame, blood stains, a few raised spikes and a loose tripwire",
    box: [
      [-0.5, 0.05, 0.3],
      [0.5, 0.6, 1.3],
    ],
    attaches: "recessed square pit cut in the floor top at y=0.1 in front of the chest",
    joints: ["floor"],
    floor: false,
    budget: 150,
  },
];

export default function build() {
  const b = createBuilder({ name: "model" });
  const floor = b.joint("floor", { at: [0, 0, 0] });
  const wall = b.joint("wall", { parent: floor, at: [0, 0, -0.95] });
  const chest = b.joint("chest", { parent: floor, at: [0, 0.1, -0.45] });

  const box = (w: number, h: number, d: number, color: string, at: [number, number, number], bone: any) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, bone });

  // Flagstone floor slab (top at y=0.1)
  box(4.4, 0.2, 3.2, "#4a4a58", [0, 0, 0.2], floor).mesh.position.y = 0.0;
  // Stone tile accents (pixel-like checker)
  const tones = ["#5a5a68", "#42424e", "#51515f"];
  let k = 0;
  for (let x = -2; x <= 2; x += 1) {
    for (let z = -1; z <= 2; z += 1) {
      if (Math.abs(x) > 2) continue;
      box(0.94, 0.02, 0.94, tones[k++ % 3], [x * 1.0 * 0.95 + 0, 0.105, z * 0.95 + 0.2], floor);
    }
  }

  // Back wall
  box(4.4, 2.4, 0.3, "#3a3a46", [0, 1.2, -1.1], wall);
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 5; c++) {
      box(0.8, 0.36, 0.04, tones[(r + c) % 3], [-1.7 + c * 0.85 + (r % 2) * 0.2, 0.25 + r * 0.4, -0.93], wall);
    }
  }
  // Wall base trim
  box(4.4, 0.12, 0.1, "#2c2c36", [0, 0.26, -0.92], wall);

  // Chest body
  box(1.0, 0.4, 0.6, "#7a4a22", [0, 0.3, -0.45], chest);
  box(0.9, 0.04, 0.5, "#5c3516", [0, 0.51, -0.45], chest);
  // Chest base rim
  box(1.04, 0.06, 0.64, "#4a2a12", [0, 0.13, -0.45], chest);

  // Recessed pit for spike trap
  box(1.0, 0.03, 1.0, "#22222a", [0, 0.115, 0.8], floor);

    for (const add of PARTS) add(b);
  return b.root;
}
