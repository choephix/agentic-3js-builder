import * as THREE from "three";

export const meta = {
  name: "Treehouse",
  description:
    "A stilted wooden treehouse in a broad oak: a plank deck on trunk braces and posts, a gabled cabin with a red roof and glowing windows, railings, a rope ladder, tire swing, lantern, string lights and pennant.",
};

// ---- seeded randomness ---------------------------------------------------
let seed = 1;
function rnd(): number {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}
function rr(a: number, b: number): number {
  return a + (b - a) * rnd();
}

// ---- canvas textures (optional: flat colours are used if no canvas) ------
type Ctx = any;

function canvasTexture(
  w: number,
  h: number,
  paint: (g: Ctx, w: number, h: number) => void,
): THREE.CanvasTexture | null {
  const doc: any = (globalThis as any).document;
  if (!doc) return null;
  try {
    const c = doc.createElement("canvas");
    c.width = w;
    c.height = h;
    const g: Ctx = c.getContext("2d");
    if (!g) return null;
    paint(g, w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    return t;
  } catch {
    return null;
  }
}

function paintBark(g: Ctx, w: number, h: number): void {
  g.fillStyle = "#7a5333";
  g.fillRect(0, 0, w, h);
  for (let i = 0; i < 160; i++) {
    g.fillStyle = rnd() < 0.6 ? "rgba(45,26,12,0.4)" : "rgba(190,150,100,0.22)";
    g.fillRect(rnd() * w, rnd() * h, rr(1, 3), rr(h * 0.1, h * 0.5));
  }
  for (let i = 0; i < 26; i++) {
    g.fillStyle = "rgba(35,20,8,0.45)";
    g.fillRect(rnd() * w, rnd() * h, rr(3, 10), 1.2);
  }
}

function paintBoards(g: Ctx, w: number, h: number): void {
  g.fillStyle = "#d9a066";
  g.fillRect(0, 0, w, h);
  const rows = 8;
  const bh = h / rows;
  for (let i = 0; i < rows; i++) {
    const y0 = i * bh;
    g.fillStyle = rnd() < 0.5 ? "rgba(255,236,200,0.12)" : "rgba(120,60,20,0.1)";
    g.fillRect(0, y0, w, bh);
    for (let k = 0; k < 7; k++) {
      g.fillStyle = `rgba(105,58,24,${rr(0.08, 0.2).toFixed(3)})`;
      g.fillRect(rnd() * w, y0 + rr(0.15, 0.85) * bh, rr(20, 90), rr(0.8, 1.6));
    }
    g.fillStyle = "rgba(70,36,12,0.9)";
    g.fillRect(0, y0, w, 3);
    g.fillRect(rnd() * w, y0, 2, bh);
  }
}

// ---- geometry helpers ----------------------------------------------------
const UP = new THREE.Vector3(0, 1, 0);
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Tapered cylinder from a (radius rA) to b (radius rB). */
function link(
  a: THREE.Vector3,
  b: THREE.Vector3,
  rA: number,
  rB: number,
  m: THREE.Material,
  seg = 6,
): THREE.Mesh {
  const d = new THREE.Vector3().subVectors(b, a);
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(rB, rA, d.length(), seg, 1),
    m,
  );
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(UP, d.normalize());
  return mesh;
}

function put(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  m: THREE.Material,
  x: number,
  y: number,
  z: number,
  ry = 0,
): THREE.Mesh {
  const o = new THREE.Mesh(geo, m);
  o.position.set(x, y, z);
  o.rotation.y = ry;
  parent.add(o);
  return o;
}

// ---- the treehouse -------------------------------------------------------
export default function buildTreehouse(): THREE.Object3D {
  seed = 20240611;

  const barkTex = canvasTexture(128, 256, paintBark);
  const boardTex = canvasTexture(256, 256, paintBoards);

  const mat = (color: number, p: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...p });

  const M = {
    bark: mat(barkTex ? 0xffffff : 0x6f4c2d, {
      map: barkTex,
      roughness: 0.95,
      flatShading: true,
    }),
    leafDk: mat(0x2e6e3b, { flatShading: true }),
    leafMd: mat(0x4f9a3c, { flatShading: true }),
    leafLt: mat(0x8ccb5c, { flatShading: true }),
    wall: mat(boardTex ? 0xffffff : 0xd9a066, { map: boardTex, roughness: 0.9 }),
    deckBase: mat(0x5a3820),
    deckA: mat(0xc98d56),
    deckB: mat(0xb97d4b),
    wood: mat(0x8a5c36),
    trim: mat(0xf3e6c8),
    roof: mat(0xb5463a),
    roofDk: mat(0x7a2d27),
    teal: mat(0x2e7d7a),
    glass: mat(0xffe9b8, { emissive: 0xffb347, emissiveIntensity: 0.6, roughness: 0.3 }),
    gold: mat(0xf2c14e, { metalness: 0.3, roughness: 0.5, side: THREE.DoubleSide }),
    rubber: mat(0x3b302a),
    lantern: mat(0xffd27a, { emissive: 0xffb040, emissiveIntensity: 1.2 }),
    metalDk: mat(0x3a2e26),
    mushroom: mat(0xd9483b),
    grass: mat(0x6fae4a),
    rock: mat(0x8d8a82, { flatShading: true }),
    pot: mat(0xc0603a),
    pink: mat(0xf06292),
    yellow: mat(0xffd54f),
  };

  const root = new THREE.Group();
  const rod = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    rA: number,
    rB: number,
    m: THREE.Material,
    seg = 6,
  ) => root.add(link(a, b, rA, rB, m, seg));
  const at = (
    geo: THREE.BufferGeometry,
    m: THREE.Material,
    x: number,
    y: number,
    z: number,
    ry = 0,
  ) => put(root, geo, m, x, y, z, ry);

  // ---- ground: grass patch, roots, trunk -------------------------------
  at(new THREE.CylinderGeometry(3.6, 3.9, 0.16, 18), M.grass, 0, 0, 0.8);

  for (let i = 0; i < 5; i++) {
    const a = 0.3 + i * 1.26;
    at(
      new THREE.SphereGeometry(0.42, 7, 4),
      M.bark,
      Math.cos(a) * 0.5,
      0.17,
      -1.3 + Math.sin(a) * 0.5,
    ).scale.set(1, 0.45, 1);
  }

  rod(V(0, -0.05, -1.3), V(0, 9.0, -1.3), 0.62, 0.2, M.bark, 9);

  // ---- limbs and twigs ---------------------------------------------------
  rod(V(0, 5.6, -1.3), V(-3.3, 6.6, -2.7), 0.17, 0.06, M.bark, 7);
  rod(V(0, 6.4, -1.3), V(2.9, 8.0, -2.4), 0.17, 0.06, M.bark, 7);
  rod(V(0, 7.6, -1.3), V(-0.9, 9.7, -1.2), 0.14, 0.05, M.bark, 7);
  rod(V(0, 4.3, -1.3), V(3.0, 4.9, -2.4), 0.13, 0.05, M.bark, 7);
  rod(V(0, 4.3, -1.3), V(-2.8, 4.8, -2.2), 0.13, 0.05, M.bark, 7);

  rod(V(-1.6, 6.08, -1.98), V(-2.2, 7.3, -3.0), 0.07, 0.025, M.bark, 5);
  rod(V(1.5, 7.23, -1.87), V(1.9, 8.6, -2.0), 0.07, 0.025, M.bark, 5);
  rod(V(-0.5, 8.77, -1.25), V(-1.9, 8.9, -1.4), 0.06, 0.02, M.bark, 5);
  rod(V(1.6, 4.62, -1.9), V(2.2, 5.9, -2.6), 0.06, 0.02, M.bark, 5);

  // ---- deck braces, stilts, deck --------------------------------------
  rod(V(0.05, 2.3, -1.3), V(-2.0, 2.85, -1.0), 0.13, 0.09, M.bark, 6);
  rod(V(-0.05, 2.3, -1.3), V(2.0, 2.85, -1.0), 0.13, 0.09, M.bark, 6);
  for (const x of [-1.95, 0, 1.95]) {
    rod(V(x, 0, 2.2), V(x, 2.9, 2.2), 0.13, 0.11, M.wood, 6);
  }
  rod(V(-1.95, 1.2, 2.2), V(1.95, 1.2, 2.2), 0.05, 0.05, M.wood, 5);

  at(new THREE.BoxGeometry(4.4, 0.2, 4.2), M.deckBase, 0, 2.9, 0.4);
  for (let i = 0; i < 10; i++) {
    at(
      new THREE.BoxGeometry(4.36, 0.03, 0.34),
      i % 2 ? M.deckA : M.deckB,
      0,
      3.015,
      -1.5 + i * 0.4,
    );
  }

  // ---- railings --------------------------------------------------------
  const run = (ax: number, az: number, bx: number, bz: number, n: number) => {
    rod(V(ax, 3.95, az), V(bx, 3.95, bz), 0.045, 0.045, M.wood, 6);
    rod(V(ax, 3.45, az), V(bx, 3.45, bz), 0.03, 0.03, M.wood, 5);
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = ax + (bx - ax) * t;
      const z = az + (bz - az) * t;
      rod(V(x, 3.0, z), V(x, 3.95, z), 0.045, 0.045, M.wood, 6);
    }
  };
  run(-2.1, 2.4, 0.9, 2.4, 5); // front, gap left for the ladder
  run(2.1, 2.4, 2.1, -1.6, 5); // right
  run(-2.1, 2.4, -2.1, -1.6, 5); // left
  run(-2.1, -1.6, -0.8, -1.6, 2); // back, around the trunk
  run(0.8, -1.6, 2.1, -1.6, 2);

  // ---- rope ladder ------------------------------------------------------
  for (const x of [1.25, 1.75]) {
    rod(V(x, 3.0, 2.45), V(x, 0, 4.2), 0.035, 0.035, M.wood, 5);
  }
  for (const t of [0.15, 0.3, 0.45, 0.6, 0.75, 0.9]) {
    const y = 3.0 * (1 - t);
    const z = 2.45 + 1.75 * t;
    rod(V(1.1, y, z), V(1.9, y, z), 0.025, 0.025, M.wood, 4);
  }

  // ---- cabin -----------------------------------------------------------
  at(new THREE.BoxGeometry(3.0, 2.2, 2.6), M.wall, 0, 4.1, 0.8);
  for (const x of [-1.5, 1.5]) {
    for (const z of [2.1, -0.5]) {
      at(new THREE.BoxGeometry(0.12, 2.2, 0.12), M.trim, x, 4.1, z);
    }
  }

  // cream gable ends with dark timber edges
  const gShape = new THREE.Shape();
  gShape.moveTo(-1.5, 0);
  gShape.lineTo(1.5, 0);
  gShape.lineTo(0, 1.4);
  gShape.closePath();
  const gGeo = new THREE.ShapeGeometry(gShape);
  at(gGeo, M.trim, 0, 5.2, 2.11);
  at(gGeo, M.trim, 0, 5.2, -0.51, Math.PI);
  for (const z of [2.14, -0.54]) {
    rod(V(-1.5, 5.2, z), V(0, 6.6, z), 0.05, 0.05, M.wood, 5);
    rod(V(1.5, 5.2, z), V(0, 6.6, z), 0.05, 0.05, M.wood, 5);
  }

  // red roof: two slabs meeting at a ridge along z
  const roofAng = Math.atan2(1.4, 1.7);
  const roofL = at(new THREE.BoxGeometry(2.25, 0.15, 3.1), M.roof, -0.85, 5.9, 0.8);
  roofL.rotation.z = roofAng;
  const roofR = at(new THREE.BoxGeometry(2.25, 0.15, 3.1), M.roof, 0.85, 5.9, 0.8);
  roofR.rotation.z = -roofAng;
  at(new THREE.BoxGeometry(0.26, 0.12, 3.2), M.roofDk, 0, 6.7, 0.8);
  for (const x of [-1.72, 1.72]) {
    at(new THREE.BoxGeometry(0.1, 0.1, 3.1), M.trim, x, 5.12, 0.8);
  }

  // windows: front, back, right, left
  const windowUnit = (x: number, y: number, z: number, ry: number) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = ry;
    put(g, new THREE.BoxGeometry(0.98, 0.88, 0.04), M.trim, 0, 0, 0.02);
    put(g, new THREE.BoxGeometry(0.8, 0.7, 0.05), M.glass, 0, 0, 0.05);
    put(g, new THREE.BoxGeometry(0.05, 0.7, 0.06), M.trim, 0, 0, 0.08);
    put(g, new THREE.BoxGeometry(0.8, 0.05, 0.06), M.trim, 0, 0, 0.08);
    put(g, new THREE.BoxGeometry(0.22, 0.7, 0.04), M.teal, -0.6, 0, 0.06);
    put(g, new THREE.BoxGeometry(0.22, 0.7, 0.04), M.teal, 0.6, 0, 0.06);
    put(g, new THREE.BoxGeometry(1.08, 0.07, 0.16), M.trim, 0, -0.47, 0.08);
    root.add(g);
  };
  windowUnit(0.6, 4.2, 2.1, 0);
  windowUnit(-0.6, 4.2, -0.5, Math.PI);
  windowUnit(1.5, 4.2, 0.2, Math.PI / 2);
  windowUnit(-1.5, 4.2, 0.6, -Math.PI / 2);

  // flower box under the front window
  at(new THREE.BoxGeometry(0.95, 0.14, 0.2), M.wood, 0.6, 3.56, 2.22);
  for (let k = 0; k < 5; k++) {
    at(
      new THREE.IcosahedronGeometry(0.06, 0),
      k % 2 ? M.pink : M.yellow,
      0.2 + k * 0.2,
      3.68,
      2.3,
    );
  }

  // teal door with a porthole and brass knob
  at(new THREE.BoxGeometry(1.0, 1.85, 0.05), M.trim, -0.5, 3.925, 2.125);
  at(new THREE.BoxGeometry(0.8, 1.7, 0.07), M.teal, -0.5, 3.85, 2.16);
  at(new THREE.CircleGeometry(0.12, 10), M.glass, -0.5, 4.3, 2.2);
  at(new THREE.SphereGeometry(0.05, 6, 4), M.gold, -0.25, 3.8, 2.22);

  // lantern on a bracket by the door
  rod(V(-1.2, 4.9, 2.1), V(-1.2, 4.9, 2.5), 0.03, 0.03, M.wood, 5);
  rod(V(-1.2, 4.9, 2.5), V(-1.2, 4.77, 2.5), 0.008, 0.008, M.metalDk, 3);
  at(new THREE.CylinderGeometry(0.02, 0.1, 0.06, 6), M.metalDk, -1.2, 4.74, 2.5);
  at(new THREE.SphereGeometry(0.12, 8, 6), M.lantern, -1.2, 4.56, 2.5).scale.y = 1.25;

  // pennant on a pole at the ridge
  rod(V(0, 6.7, 1.7), V(0, 8.3, 1.7), 0.03, 0.025, M.wood, 5);
  const flagShape = new THREE.Shape();
  flagShape.moveTo(0, 0.3);
  flagShape.lineTo(1.0, 0.08);
  flagShape.lineTo(0.75, -0.05);
  flagShape.lineTo(1.0, -0.22);
  flagShape.lineTo(0, -0.3);
  flagShape.closePath();
  at(new THREE.ShapeGeometry(flagShape), M.gold, 0, 7.8, 1.7);

  // string lights along the right railing
  const wire = (t: number) =>
    V(2.2, 3.92 - 0.12 * Math.sin(Math.PI * t), 2.3 - 3.9 * t);
  for (let i = 0; i < 8; i++) {
    rod(wire(i / 8), wire((i + 1) / 8), 0.008, 0.008, M.metalDk, 3);
  }
  for (let i = 1; i < 8; i++) {
    const p = wire(i / 8);
    at(new THREE.SphereGeometry(0.04, 6, 4), M.lantern, p.x, p.y - 0.05, p.z);
  }

  // planter on the deck
  at(new THREE.CylinderGeometry(0.22, 0.17, 0.24, 8), M.pot, -1.7, 3.12, 1.7);
  at(new THREE.IcosahedronGeometry(0.3, 1), M.leafLt, -1.7, 3.48, 1.7).scale.y = 0.8;

  // ---- tire swing hanging from the left limb ---------------------------
  rod(V(-3.3, 6.6, -2.7), V(-3.3, 2.13, -2.7), 0.02, 0.02, M.wood, 4);
  at(new THREE.TorusGeometry(0.38, 0.06, 6, 14), M.rubber, -3.3, 1.75, -2.7);

  // ---- foliage crown: [x, y, z, radius, leaf shade 0 dark / 1 mid / 2 light]
  const leafMats = [M.leafDk, M.leafMd, M.leafLt];
  const crown: [number, number, number, number, number][] = [
    [0.0, 9.3, -1.3, 1.5, 2],
    [0.2, 10.1, -1.2, 0.95, 2],
    [-1.7, 8.4, -1.6, 1.3, 1],
    [1.6, 8.6, -1.8, 1.35, 2],
    [-1.2, 10.0, -2.3, 0.95, 1],
    [1.1, 9.8, -0.6, 0.9, 1],
    [-0.6, 7.3, -2.9, 1.3, 1],
    [1.0, 7.1, -2.8, 1.25, 0],
    [-3.0, 7.0, -2.9, 1.0, 1],
    [2.9, 7.7, -2.5, 1.1, 2],
    [-3.4, 6.5, -2.5, 0.85, 0],
    [-3.9, 8.2, -2.2, 0.8, 2],
    [3.5, 6.2, -1.2, 0.9, 1],
    [3.3, 5.0, -2.4, 0.85, 1],
    [2.7, 5.9, -1.3, 0.85, 0],
    [-2.6, 5.5, -1.2, 0.85, 1],
    [-2.9, 4.6, -2.3, 0.85, 1],
    [0.2, 6.6, -3.6, 1.2, 0],
    [-2.2, 9.2, -3.4, 1.0, 0],
    [3.2, 9.4, -3.6, 0.9, 1],
    [0.0, 5.4, -3.2, 1.0, 0],
  ];
  for (const [x, y, z, r, k] of crown) {
    const o = at(new THREE.IcosahedronGeometry(r, 1), leafMats[k], x, y, z);
    o.scale.y = rr(0.8, 1.0);
    o.rotation.set(rr(0, 3), rr(0, 3), rr(0, 3));
  }

  // ---- ground dressing (bottoms kept at or just below y = 0) -----------
  const bush = (x: number, z: number, r: number, m: THREE.Material) => {
    at(new THREE.IcosahedronGeometry(r, 1), m, x, r * 0.75 - 0.02, z).scale.y = 0.75;
  };
  bush(2.9, 2.6, 0.7, M.leafMd);
  bush(-3.1, 1.6, 0.6, M.leafDk);
  bush(3.4, -1.4, 0.55, M.leafLt);
  bush(-2.6, -3.0, 0.6, M.leafMd);
  bush(-3.6, -0.6, 0.45, M.leafLt);

  for (const [x, z] of [
    [2.6, 3.3],
    [-2.3, 3.5],
  ]) {
    const rock = at(new THREE.IcosahedronGeometry(0.25, 0), M.rock, x, 0.14, z);
    rock.scale.set(1.1, 0.55, 0.9);
    rock.rotation.y = rr(0, 3);
  }

  rod(V(0.85, 0, -0.5), V(0.85, 0.12, -0.5), 0.03, 0.03, M.trim, 5);
  at(new THREE.SphereGeometry(0.09, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), M.mushroom, 0.85, 0.12, -0.5);

  return root;
}
