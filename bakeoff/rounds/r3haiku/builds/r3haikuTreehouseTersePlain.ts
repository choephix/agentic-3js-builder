import * as THREE from "three";

export const meta = {
  name: "Treehouse",
  description:
    "A plank cabin with a red gabled roof, glowing round window and hanging lantern, built on a stylized oak with a ladder, swing, and rope bridge to a second tree.",
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function buildTreehouse(): THREE.Object3D {
  const rand = rng(20240611);
  const root = new THREE.Group();

  const mat = (color: number, extra: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...extra });

  const M = {
    bark: mat(0x6b4a2e),
    grass: mat(0x7fb257),
    stone: mat(0x9a9590),
    leafA: mat(0x3f8a3a),
    leafB: mat(0x5ea84a),
    leafC: mat(0x2f6b33),
    plank: mat(0xd1a064),
    plankDark: mat(0x9a6a3a),
    trim: mat(0xf1e3c2),
    roof: mat(0xb8473a),
    door: mat(0x6e4425),
    glass: mat(0xffe39a, { emissive: 0xffc860, emissiveIntensity: 0.9 }),
    lamp: mat(0xffb347, { emissive: 0xff9a2e, emissiveIntensity: 1.2 }),
    iron: mat(0x3a3a40, { metalness: 0.5, roughness: 0.5 }),
    rope: mat(0xd9c08a),
    knob: mat(0xf4c542, { metalness: 0.6, roughness: 0.35 }),
  };
  const leaves = [M.leafA, M.leafB, M.leafC];

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const box = (
    w: number, h: number, d: number, m: THREE.Material,
    x: number, y: number, z: number, rz = 0,
  ) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    mesh.rotation.z = rz;
    root.add(mesh);
    return mesh;
  };

  // Cylinder stretched between two points (top radius r1 at b, bottom r0 at a).
  const seg = (
    a: THREE.Vector3, b: THREE.Vector3,
    r0: number, r1: number, m: THREE.Material, sides = 6,
  ) => {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, sides), m);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(V(0, 1, 0), dir.normalize());
    root.add(mesh);
    return mesh;
  };

  const blob = (x: number, y: number, z: number, r: number, m: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), m);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rand() * 3, rand() * 3, rand() * 3);
    mesh.scale.set(1, 0.8, 1);
    root.add(mesh);
  };

  const canopy = (cx: number, cy: number, cz: number, spread: number, count: number, r0: number, r1: number) => {
    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2;
      const d = rand() * spread;
      const x = cx + Math.cos(a) * d;
      const z = cz + Math.sin(a) * d * 0.8;
      const y = cy + (rand() - 0.4) * spread * 0.5;
      const r = r0 + rand() * (r1 - r0);
      const m = y < cy - 0.2 ? M.leafC : leaves[Math.floor(rand() * 3)];
      blob(x, y, z, r, m);
    }
  };

  // ---------- Ground ----------
  box(0.001, 0.001, 0.001, M.grass, 0, 0, 0); // placeholder-free anchor (tiny, invisible)
  {
    const g = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.8, 0.1, 20), M.grass);
    g.position.set(0, -0.05, 0);
    root.add(g);
  }
  const stones: [number, number, number, number][] = [
    [2.9, 0.1, 2.6, 0.28], [-2.6, 0.08, 2.9, 0.22], [3.4, 0.05, -1.4, 0.2],
  ];
  for (const [x, y, z, r] of stones) {
    const s = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), M.stone);
    s.position.set(x, y, z);
    s.rotation.set(rand() * 3, rand() * 3, rand() * 3);
    s.scale.set(1, 0.6, 1);
    root.add(s);
  }

  // ---------- Tree 1 (the house tree) ----------
  seg(V(0, 0, 0), V(0, 9, 0), 0.62, 0.3, M.bark, 8);
  const roots: [number, number][] = [[1.0, 0.4], [-1.0, 0.5], [0.2, -1.0], [-0.6, -0.9]];
  for (const [x, z] of roots) seg(V(0, 0.9, 0), V(x, 0.02, z), 0.2, 0.08, M.bark, 5);

  const limbs: [THREE.Vector3, THREE.Vector3, number, number][] = [
    [V(0, 4.7, -0.2), V(-2.4, 5.6, -1.6), 0.22, 0.09],
    [V(0, 5.4, 0), V(-2.3, 8.2, -0.6), 0.28, 0.1],
    [V(0, 6.2, 0), V(2.2, 8.9, -0.4), 0.26, 0.1],
    [V(0, 6.8, 0), V(-0.4, 9.8, -1.2), 0.2, 0.09],
    [V(0, 7.3, 0), V(0.9, 10.2, 0.9), 0.18, 0.08],
  ];
  for (const [a, b, r0, r1] of limbs) seg(a, b, r0, r1, M.bark, 6);

  canopy(0, 9.0, 0, 2.2, 22, 0.85, 1.35);

  // Swing hanging from a branch tip
  seg(V(-2.3, 8.1, -0.6), V(-2.3, 6.5, -0.6), 0.02, 0.02, M.rope, 4);
  box(0.5, 0.06, 0.25, M.plank, -2.3, 6.45, -0.6);

  // ---------- Platform ----------
  box(3.2, 0.18, 2.4, M.plank, 0, 4.2, 1.5);
  // Support posts
  const postPositions: [number, number][] = [[-1.45, 0.5], [1.45, 0.5], [-1.45, 2.55], [1.45, 2.55]];
  for (const [x, z] of postPositions) box(0.22, 4.2, 0.22, M.bark, x, 2.1, z);
  // Diagonal braces
  box(0.14, 2.4, 0.14, M.plankDark, -1.45, 2.4, 0.0, 0.0);
  box(0.14, 1.6, 0.14, M.plankDark, -1.0, 1.1, 0.5, 0.0);
  // Railings (left side, front-right; right side left open for the bridge)
  box(0.07, 0.07, 2.3, M.plank, -1.56, 5.1, 1.55);
  box(0.07, 0.07, 1.1, M.plank, 1.0, 5.1, 2.66);
  box(0.07, 0.07, 1.0, M.plank, 0.1, 5.1, 2.66); // gap at x 0.1..-0.4 not needed; short rail
  for (const z of [0.5, 1.5, 2.6]) box(0.08, 0.9, 0.08, M.plankDark, -1.56, 4.65, z);
  for (const x of [-0.5, 0.5, 1.56]) box(0.08, 0.9, 0.08, M.plankDark, x, 4.65, 2.66);

  // ---------- Cabin ----------
  const floorY = 4.3;
  const wallH = 1.8;
  const wallMid = floorY + wallH / 2; // 5.2
  // Back wall
  box(2.8, wallH, 0.12, M.plank, 0, wallMid, 0.55);
  // Side walls
  box(0.12, wallH, 2.0, M.plank, -1.4, wallMid, 1.5);
  box(0.12, wallH, 2.0, M.plank, 1.4, wallMid, 1.5);
  // Front wall with door opening
  box(1.1, wallH, 0.12, M.plank, -0.85, wallMid, 2.5);
  box(1.1, wallH, 0.12, M.plank, 0.85, wallMid, 2.5);
  box(0.6, 0.4, 0.12, M.plank, 0, 5.9, 2.5);
  // Door
  box(0.56, 1.36, 0.05, M.door, 0, 4.98, 2.52);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), M.knob);
  knob.position.set(0.2, 4.95, 2.56);
  root.add(knob);

  // Corner trims
  for (const [x, z] of [[-1.4, 0.55], [1.4, 0.55], [-1.4, 2.5], [1.4, 2.5]] as [number, number][]) {
    box(0.15, wallH + 0.04, 0.15, M.trim, x, wallMid, z);
  }
  // Plank seams on side walls (vertical), avoiding the window
  for (const x of [-1.47, 1.47]) {
    box(0.03, wallH, 0.03, M.plankDark, x, wallMid, 0.8);
    box(0.03, wallH, 0.03, M.plankDark, x, wallMid, 2.2);
  }
  // Horizontal board lines on the front wall pieces
  for (const y of [4.6, 4.9, 5.5, 5.8]) {
    box(1.1, 0.035, 0.03, M.plankDark, -0.85, y, 2.575);
    box(1.1, 0.035, 0.03, M.plankDark, 0.85, y, 2.575);
  }

  // Side windows with glowing panes
  for (const side of [-1, 1]) {
    const x = side * 1.47;
    box(0.03, 0.95, 0.95, M.trim, x, 5.2, 1.5);
    box(0.035, 0.7, 0.7, M.glass, x + side * 0.02, 5.2, 1.5);
    box(0.045, 0.06, 0.72, M.plankDark, x + side * 0.03, 5.2, 1.5);
    box(0.045, 0.72, 0.06, M.plankDark, x + side * 0.03, 5.2, 1.5);
  }

  // Gable ends
  const gableShape = new THREE.Shape();
  gableShape.moveTo(-1.5, 0);
  gableShape.lineTo(1.5, 0);
  gableShape.lineTo(0, 1.15);
  gableShape.closePath();
  const gableGeo = new THREE.ExtrudeGeometry(gableShape, { depth: 0.1, bevelEnabled: false });
  const gableFront = new THREE.Mesh(gableGeo, M.plank);
  gableFront.position.set(0, 6.1, 2.5);
  root.add(gableFront);
  const gableBack = new THREE.Mesh(gableGeo, M.plank);
  gableBack.position.set(0, 6.1, 0.42);
  root.add(gableBack);

  // Round window in the front gable
  const pane = new THREE.Mesh(new THREE.CircleGeometry(0.22, 16), M.glass);
  pane.position.set(0, 6.55, 2.63);
  root.add(pane);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.035, 6, 16), M.trim);
  ring.position.set(0, 6.55, 2.64);
  root.add(ring);

  // Roof slabs (gable roof)
  const roofAngle = Math.atan2(1.15, 1.6);
  const slabLen = Math.sqrt(1.6 * 1.6 + 1.15 * 1.15) + 0.08;
  box(slabLen, 0.1, 2.6, M.roof, -0.82, 6.72, 1.5, roofAngle);
  box(slabLen, 0.1, 2.6, M.roof, 0.82, 6.72, 1.5, -roofAngle);
  // Ridge
  box(0.14, 0.14, 2.7, M.plankDark, 0, 7.27, 1.5);

  // Chimney
  box(0.4, 1.2, 0.4, M.stone, 0.6, 7.0, 1.0);
  box(0.5, 0.1, 0.5, M.stone, 0.6, 7.65, 1.0);

  // Hanging lantern at the front-left corner
  box(0.5, 0.05, 0.05, M.plankDark, -1.65, 5.95, 2.5);
  seg(V(-1.9, 5.92, 2.5), V(-1.9, 5.47, 2.5), 0.012, 0.012, M.iron, 4);
  box(0.24, 0.3, 0.24, M.lamp, -1.9, 5.3, 2.5);
  box(0.3, 0.05, 0.3, M.iron, -1.9, 5.47, 2.5);

  // ---------- Ladder down the front-left ----------
  const G = V(-0.9, 0, 3.9);
  const T = V(-0.9, 4.3, 2.75);
  for (const dx of [-0.22, 0.22]) {
    seg(G.clone().add(V(dx, 0, 0)), T.clone().add(V(dx, 0, 0)), 0.03, 0.03, M.plankDark, 5);
  }
  for (let i = 0; i < 10; i++) {
    const t = (i + 1) / 11;
    const p = G.clone().lerp(T, t);
    seg(p.clone().add(V(-0.25, 0, 0)), p.clone().add(V(0.25, 0, 0)), 0.025, 0.025, M.plank, 5);
  }

  // ---------- Tree 2 with bridge ----------
  seg(V(5.2, 0, 0), V(5.4, 5.4, 0), 0.42, 0.22, M.bark, 7);
  for (const [x, z] of [[0.8, 0.5], [-0.7, -0.6]] as [number, number][]) {
    seg(V(5.2, 0.9, 0), V(5.2 + x, 0.02, z), 0.16, 0.07, M.bark, 5);
  }
  seg(V(5.3, 4.2, 0), V(7.0, 5.8, -0.8), 0.18, 0.08, M.bark, 6);
  seg(V(5.3, 5.2, 0), V(3.6, 6.2, -0.6), 0.16, 0.08, M.bark, 6);
  canopy(5.2, 6.4, 0, 1.5, 12, 0.7, 1.0);

  // Deck 2
  box(2.0, 0.18, 2.0, M.plank, 5.2, 3.6, 1.5);
  for (const [x, z] of [[4.25, 0.55], [6.15, 0.55], [4.25, 2.45], [6.15, 2.45]] as [number, number][]) {
    box(0.08, 0.9, 0.08, M.plankDark, x, 4.14, z);
  }

  // Rope bridge: sagging catenary-ish curve from deck 1 to deck 2
  const bx0 = 1.6, bx1 = 4.2;
  const by0 = 4.3, by1 = 3.7;
  const L = bx1 - bx0;
  const sag = 0.45;
  const bz = 1.5;
  const curveY = (t: number) => by0 + (by1 - by0) * t - sag * 4 * t * (1 - t);
  const N = 11;
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) / N;
    const x = bx0 + L * t;
    const y = curveY(t);
    const dydt = (by1 - by0) - sag * 4 * (1 - 2 * t);
    const angle = Math.atan(dydt / L);
    box(0.24, 0.05, 1.0, M.plankDark, x, y - 0.03, bz, angle);
  }
  const RS = 12;
  for (const dz of [-0.55, 0.55]) {
    let prev: THREE.Vector3 | null = null;
    for (let s = 0; s <= RS; s++) {
      const t = s / RS;
      const p = V(bx0 + L * t, curveY(t) + 0.5, bz + dz);
      if (prev) seg(prev, p, 0.025, 0.025, M.rope, 4);
      prev = p;
    }
    // rope posts at the ends
    seg(V(bx0, by0, bz + dz), V(bx0, by0 + 0.5, bz + dz), 0.03, 0.03, M.plankDark, 4);
    seg(V(bx1, by1, bz + dz), V(bx1, by1 + 0.5, bz + dz), 0.03, 0.03, M.plankDark, 4);
  }

  return root;
}
