import * as THREE from "three";

export const meta = {
  name: "Lighthouse on a Tiny Island",
  description:
    "A red-and-white striped lighthouse on a wave-ringed rock islet, with a keeper's cottage, a flagpole, a glowing lantern, a sweeping beam and a gull on the rail.",
};

type V3 = [number, number, number];

// mulberry32: a small seeded PRNG so every build is identical.
function makeRng(seed: number) {
  let a = seed >>> 0;
  return (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Wobbles a cylinder's radius by a function of each vertex's own angle, so the
// rim looks chipped while duplicated seam vertices (same position) stay welded.
function rockify(geo: THREE.BufferGeometry, amp: number): THREE.BufferGeometry {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const th = Math.atan2(x, z);
    const s =
      1 +
      amp *
        (0.6 * Math.sin(3 * th + 0.7) +
          0.4 * Math.sin(5 * th + 2.1) +
          0.3 * Math.sin(7 * th + 4.0));
    pos.setXYZ(i, x * s, y, z * s);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

// Adds a mesh at a position/rotation inside a parent.
function put(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  material: THREE.Material | THREE.Material[],
  pos: V3 = [0, 0, 0],
  rot: V3 = [0, 0, 0],
): THREE.Mesh {
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.rotation.set(rot[0], rot[1], rot[2]);
  parent.add(mesh);
  return mesh;
}

// Places a mesh on a ring around the tower axis, facing outward at `angle`.
function ring(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  material: THREE.Material,
  angle: number,
  radius: number,
  y: number,
): THREE.Mesh {
  return put(
    parent,
    geo,
    material,
    [Math.sin(angle) * radius, y, Math.cos(angle) * radius],
    [0, angle, 0],
  );
}

export default function buildLighthouse(): THREE.Object3D {
  const rnd = makeRng(20240611);
  const root = new THREE.Group();
  root.name = "lighthouse-islet";

  const std = (color: number, p: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0, ...p });

  // One material per colour, shared by every mesh that uses it.
  const M = {
    rockDark: std(0x5a6360, { flatShading: true, roughness: 0.95 }),
    rockMid: std(0x7b8480, { flatShading: true, roughness: 0.95 }),
    rockLight: std(0x9ca398, { flatShading: true, roughness: 0.95 }),
    turf: std(0x6f9b4a, { roughness: 0.9 }),
    bushDark: std(0x3b6e36, { flatShading: true }),
    bushLight: std(0x5f9a45, { flatShading: true }),
    stone: std(0xb7b0a2),
    stoneLight: std(0xddd6c6),
    white: std(0xf4f0e7),
    red: std(0xc0352b),
    iron: std(0x2b2f34, { metalness: 0.35, roughness: 0.55 }),
    pane: std(0x1f2a33, { roughness: 0.25, metalness: 0.2 }),
    glass: new THREE.MeshStandardMaterial({
      color: 0xcfeeff,
      transparent: true,
      opacity: 0.3,
      roughness: 0.05,
      side: THREE.DoubleSide,
      emissive: 0x3d3520,
      emissiveIntensity: 0.5,
    }),
    lamp: new THREE.MeshStandardMaterial({
      color: 0xfff5cc,
      emissive: 0xffc53d,
      emissiveIntensity: 2.6,
      roughness: 0.4,
    }),
    halo: new THREE.MeshStandardMaterial({
      color: 0xfff0b0,
      emissive: 0xffd66b,
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
      roughness: 1,
    }),
    beam: new THREE.MeshStandardMaterial({
      color: 0xfff1b5,
      emissive: 0xffe08a,
      emissiveIntensity: 1.1,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      side: THREE.DoubleSide,
      roughness: 1,
    }),
    water: std(0x2a7d98, { roughness: 0.2, transparent: true, opacity: 0.72 }),
    foam: std(0xeef9fc, { transparent: true, opacity: 0.6 }),
    cottage: std(0xeadcbc),
    slate: std(0x4a5769),
    brick: std(0x8a4b3a),
    wood: std(0x5b3b25),
    glow: new THREE.MeshStandardMaterial({
      color: 0xffd98a,
      emissive: 0xffb548,
      emissiveIntensity: 1.1,
      roughness: 0.5,
    }),
    gullGrey: std(0xa9b3bd),
    beak: std(0xf0a23a),
  };

  // ---------------------------------------------------------------- water
  put(
    root,
    new THREE.CircleGeometry(15, 40).rotateX(-Math.PI / 2),
    M.water,
    [0, -0.04, 0],
  );
  put(
    root,
    new THREE.RingGeometry(9.3, 10.6, 36).rotateX(-Math.PI / 2),
    M.foam,
    [0, 0.02, 0],
  );

  // --------------------------------------------------------------- islet
  const TOP = 0.9; // height of the grassy top
  const islet = new THREE.Group();
  root.add(islet);

  const islandGeo = rockify(
    new THREE.CylinderGeometry(8.2, 9.3, 1.1, 12, 3),
    0.05,
  );
  islandGeo.translate(0, 0.35, 0); // spans y = -0.2 .. 0.9
  put(islet, islandGeo, [M.rockMid, M.turf, M.rockDark]);

  // Boulders around the rim, sitting partly in the water.
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + (rnd() - 0.5) * 0.3;
    const dist = 8.0 + rnd() * 1.3;
    const size = 0.42 + rnd() * 0.6;
    const sy = 0.55 + rnd() * 0.35;
    const geo = new THREE.DodecahedronGeometry(size, 0).scale(1, sy, 1);
    const y = -0.15 + 0.934 * size * sy; // lowest vertex sits at -0.15
    put(
      islet,
      geo,
      rnd() < 0.5 ? M.rockDark : M.rockLight,
      [Math.sin(a) * dist, y, Math.cos(a) * dist],
      [0, rnd() * Math.PI * 2, 0],
    );
  }

  // Low-poly shrubs dotted over the turf.
  const bushSpots: [number, number][] = [
    [-3.6, 2.4],
    [-2.6, 4.5],
    [3.7, 4.1],
    [5.7, -1.2],
    [4.6, -3.9],
    [-1.6, -5.3],
    [0.4, -6.1],
    [-5.6, -3.0],
  ];
  for (const [bx, bz] of bushSpots) {
    const blobs = 2 + Math.floor(rnd() * 2);
    for (let k = 0; k < blobs; k++) {
      const s = 0.42 + rnd() * 0.35;
      const g = new THREE.IcosahedronGeometry(s, 0).scale(1, 0.75, 1);
      put(
        islet,
        g,
        rnd() < 0.5 ? M.bushDark : M.bushLight,
        [bx + (rnd() - 0.5) * 0.9, TOP + s * 0.4, bz + (rnd() - 0.5) * 0.9],
      );
    }
  }

  // ------------------------------------------------------------- tower
  const tower = new THREE.Group();
  root.add(tower);

  // Stone plinth and cornice.
  put(tower, new THREE.CylinderGeometry(3.0, 3.15, 1.2, 12), M.stone, [0, 1.5, 0]);
  put(tower, new THREE.CylinderGeometry(3.1, 3.25, 0.26, 12), M.stoneLight, [0, 2.23, 0]);

  // Striped shaft: six tapering bands, alternating white and red.
  const T0 = 2.36;
  const T1 = 14.5;
  const RB = 2.5;
  const RT = 1.7;
  const radiusAt = (y: number) => RB + (RT - RB) * ((y - T0) / (T1 - T0));
  const bands = 6;
  const bh = (T1 - T0) / bands;
  for (let i = 0; i < bands; i++) {
    const ya = T0 + i * bh;
    const yb = ya + bh;
    const geo = new THREE.CylinderGeometry(radiusAt(yb), radiusAt(ya), bh, 12, 1, false);
    put(tower, geo, i % 2 === 0 ? M.white : M.red, [0, (ya + yb) / 2, 0]);
  }

  // Dark-glazed windows with light frames and sills.
  const paneGeo = new THREE.BoxGeometry(0.46, 0.7, 0.1);
  const frameGeo = new THREE.BoxGeometry(0.6, 0.86, 0.06);
  const sillGeo = new THREE.BoxGeometry(0.72, 0.08, 0.16);
  const windowAt = (angle: number, y: number) => {
    const r = radiusAt(y);
    ring(tower, frameGeo, M.stoneLight, angle, r - 0.01, y);
    ring(tower, paneGeo, M.pane, angle, r - 0.02, y);
    ring(tower, sillGeo, M.stoneLight, angle, r, y - 0.47);
  };
  windowAt(0, 7.4);
  windowAt(0, 11.4);
  windowAt(Math.PI / 2, 7.4);
  windowAt(-Math.PI / 2, 7.4);

  // Arched-looking door, lintel and step.
  ring(tower, new THREE.BoxGeometry(0.9, 1.0, 0.16), M.wood, 0, 3.06, 1.4);
  ring(tower, new THREE.BoxGeometry(1.2, 0.14, 0.24), M.stoneLight, 0, 3.05, 1.97);
  put(tower, new THREE.BoxGeometry(1.3, 0.12, 0.5), M.stone, [0, TOP + 0.06, 3.3]);

  // Gallery deck, brackets, railing posts and rail.
  put(tower, new THREE.CylinderGeometry(2.4, 2.25, 0.3, 12), M.iron, [0, 14.65, 0]);
  const bracketGeo = new THREE.BoxGeometry(0.2, 0.34, 0.2);
  for (let k = 0; k < 8; k++) {
    ring(tower, bracketGeo, M.iron, (k * Math.PI) / 4 + Math.PI / 8, 1.82, 14.33);
  }
  const postGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.9, 5);
  for (let k = 0; k < 12; k++) {
    ring(tower, postGeo, M.iron, (k * Math.PI) / 6, 2.2, 15.25);
  }
  const railGeo = new THREE.TorusGeometry(2.2, 0.035, 4, 32).rotateX(Math.PI / 2);
  put(tower, railGeo, M.iron, [0, 15.7, 0]);

  // Lantern room: iron base, glass drum with corner mullions, red cap, finial.
  put(tower, new THREE.CylinderGeometry(1.5, 1.5, 0.2, 8), M.iron, [0, 14.9, 0]);
  put(tower, new THREE.CylinderGeometry(1.3, 1.3, 1.9, 8, 1, true), M.glass, [0, 15.95, 0]);
  const mullionGeo = new THREE.BoxGeometry(0.1, 1.9, 0.1);
  for (let k = 0; k < 8; k++) {
    ring(tower, mullionGeo, M.iron, (k * Math.PI) / 4, 1.3, 15.95);
  }
  put(tower, new THREE.CylinderGeometry(1.5, 1.5, 0.18, 8), M.iron, [0, 16.99, 0]);
  put(tower, new THREE.ConeGeometry(1.75, 1.0, 8), M.red, [0, 17.58, 0]);
  put(tower, new THREE.SphereGeometry(0.16, 8, 6), M.iron, [0, 18.18, 0]);

  // The lamp, its soft halo, and a sweeping beam reaching out to sea.
  put(tower, new THREE.SphereGeometry(0.5, 12, 8), M.lamp, [0, 15.95, 0]);
  put(tower, new THREE.SphereGeometry(1.05, 12, 8), M.halo, [0, 15.95, 0]);
  const beamGeo = new THREE.ConeGeometry(3.8, 26, 16, 1, true).rotateX(-Math.PI / 2);
  put(tower, beamGeo, M.beam, [0, 15.95, 13]); // apex at the lamp, opening toward +Z

  // A gull perched on the railing, facing outward.
  const gullAngle = -0.9;
  const gull = new THREE.Group();
  gull.position.set(Math.sin(gullAngle) * 2.2, 15.735, Math.cos(gullAngle) * 2.2);
  gull.rotation.y = gullAngle;
  root.add(gull);
  const gullBody = new THREE.SphereGeometry(0.12, 10, 7).scale(1, 0.9, 1.9);
  put(gull, gullBody, M.white, [0, 0.2, 0]);
  put(gull, new THREE.SphereGeometry(0.085, 8, 6), M.white, [0, 0.32, 0.22]);
  put(
    gull,
    new THREE.ConeGeometry(0.025, 0.13, 5).rotateX(Math.PI / 2),
    M.beak,
    [0, 0.33, 0.37],
  );
  for (const s of [-1, 1]) {
    put(gull, new THREE.BoxGeometry(0.12, 0.025, 0.42), M.gullGrey, [s * 0.085, 0.28, -0.08], [0, 0, -s * 0.12]);
    put(gull, new THREE.CylinderGeometry(0.01, 0.01, 0.12, 4), M.beak, [s * 0.035, 0.06, 0.02]);
  }
  put(gull, new THREE.BoxGeometry(0.14, 0.02, 0.16), M.gullGrey, [0, 0.2, -0.3]);

  // ----------------------------------------------------------- cottage
  const cottage = new THREE.Group();
  cottage.position.set(-5.0, 0, -0.4);
  root.add(cottage);

  put(cottage, new THREE.BoxGeometry(2.8, 2.2, 2.8), M.cottage, [0, TOP + 1.1, 0]);
  put(cottage, new THREE.BoxGeometry(3.0, 0.1, 3.0), M.stoneLight, [0, TOP + 2.18, 0]);
  const roofGeo = new THREE.ConeGeometry(1.98, 1.4, 4).rotateY(Math.PI / 4);
  put(cottage, roofGeo, M.slate, [0, TOP + 2.9, 0]);
  put(cottage, new THREE.BoxGeometry(0.42, 1.2, 0.42), M.brick, [0.75, 4.0, -0.7]);
  put(cottage, new THREE.BoxGeometry(0.5, 0.95, 0.1), M.wood, [0, TOP + 0.475, 1.4]);
  for (const sx of [-0.85, 0.85]) {
    put(cottage, new THREE.BoxGeometry(0.62, 0.67, 0.05), M.stoneLight, [sx, 2.1, 1.4]);
    put(cottage, new THREE.BoxGeometry(0.5, 0.55, 0.06), M.glow, [sx, 2.1, 1.43]);
  }
  // Side window on the +X wall.
  put(cottage, new THREE.BoxGeometry(0.05, 0.67, 0.62), M.stoneLight, [1.4, 2.1, 0]);
  put(cottage, new THREE.BoxGeometry(0.06, 0.55, 0.5), M.glow, [1.43, 2.1, 0]);

  // ----------------------------------------------------------- flagpole
  const flagX = 2.7;
  const flagZ = 3.7;
  put(islet, new THREE.CylinderGeometry(0.04, 0.05, 3.4, 6), M.iron, [flagX, TOP + 1.7, flagZ]);
  put(islet, new THREE.SphereGeometry(0.09, 8, 6), M.iron, [flagX, TOP + 3.45, flagZ]);
  const flagGeo = new THREE.PlaneGeometry(0.95, 0.6);
  put(islet, flagGeo, M.red, [flagX + 0.49, TOP + 3.1, flagZ + 0.01]);
  put(islet, flagGeo, M.red, [flagX + 0.49, TOP + 3.1, flagZ - 0.01], [0, Math.PI, 0]);

  return root;
}
