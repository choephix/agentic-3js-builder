import * as THREE from "three";

export const meta = {
  name: "Cozy Treehouse",
  description:
    "A red-roofed cabin with a round window, nestled in a thick old oak on a grassy round base, with a rope ladder, a plank swing, a pennant, a lantern, mushrooms and a bicycle.",
};

type Vec3 = [number, number, number];
type MatOpts = {
  map?: THREE.Texture | null;
  emissive?: string;
  ei?: number;
  rough?: number;
  metal?: number;
  side?: THREE.Side;
};

const TAU = Math.PI * 2;
const GRASS_R = 5.5;
const GRASS_Y = 0.62;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Gentle deterministic lumps on the grass. Never dips below the soil top.
function grassBump(x: number, z: number): number {
  const r2 = Math.min(1, (x * x + z * z) / (GRASS_R * GRASS_R));
  const n =
    0.5 +
    0.25 * Math.sin(x * 1.3 + 0.7) * Math.cos(z * 1.7 - 0.4) +
    0.25 * Math.sin((x + z) * 2.3 + 1.1);
  return 0.02 + (1 - r2) * 0.07 * n;
}
const groundY = (x: number, z: number): number => GRASS_Y + grassBump(x, z);

function makeTexture(
  w: number,
  h: number,
  draw: (g: CanvasRenderingContext2D, w: number, h: number) => void,
  repeat: [number, number],
): THREE.CanvasTexture | null {
  try {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d");
    if (!g) return null;
    draw(g, w, h);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  } catch {
    return null;
  }
}

export default function buildTreehouse(): THREE.Object3D {
  const rnd = mulberry32(90210);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const root = new THREE.Group();
  root.name = "treehouse-diorama";

  // ---------------- canvas textures (drawn once, deterministic) ----------------
  const plankCanvas =
    (hue: number, sat: number, light: number, horizontal: boolean) =>
    (g: CanvasRenderingContext2D, w: number, h: number): void => {
      const n = 8;
      const span = horizontal ? h : w;
      const step = span / n;
      for (let i = 0; i < n; i++) {
        g.fillStyle = `hsl(${hue + rnd() * 4 - 2}, ${sat}%, ${light + rnd() * 6 - 3}%)`;
        if (horizontal) g.fillRect(0, i * step, w, step);
        else g.fillRect(i * step, 0, step, h);
      }
      g.fillStyle = `hsl(${hue}, ${sat}%, ${light * 0.5}%)`;
      for (let i = 0; i <= n; i++) {
        if (horizontal) g.fillRect(0, i * step - 2, w, 4);
        else g.fillRect(i * step - 2, 0, 4, h);
      }
      for (let k = 0; k < 60; k++) {
        g.strokeStyle = `hsla(${hue}, ${sat}%, ${light * 0.6}%, 0.35)`;
        g.lineWidth = 1 + rnd();
        g.beginPath();
        if (horizontal) {
          const y = rnd() * h;
          g.moveTo(0, y);
          g.lineTo(w, y + rnd() * 6 - 3);
        } else {
          const x = rnd() * w;
          g.moveTo(x, 0);
          g.lineTo(x + rnd() * 6 - 3, h);
        }
        g.stroke();
      }
    };

  const shingleCanvas = (g: CanvasRenderingContext2D, w: number, h: number): void => {
    g.fillStyle = "#7d2a1e";
    g.fillRect(0, 0, w, h);
    const rows = 8;
    const cols = 6;
    const rh = h / rows;
    const cw = w / cols;
    for (let r = 0; r < rows; r++) {
      for (let c = -1; c <= cols; c++) {
        const x = c * cw + (r % 2) * cw * 0.5;
        const y = r * rh;
        g.fillStyle = `hsl(${6 + rnd() * 8}, ${50 + rnd() * 12}%, ${34 + rnd() * 12}%)`;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + cw, y);
        g.lineTo(x + cw, y + rh * 0.8);
        g.quadraticCurveTo(x + cw / 2, y + rh * 1.2, x, y + rh * 0.8);
        g.closePath();
        g.fill();
        g.strokeStyle = "rgba(50,18,12,0.6)";
        g.lineWidth = 2;
        g.stroke();
      }
    }
  };

  const barkCanvas = (g: CanvasRenderingContext2D, w: number, h: number): void => {
    g.fillStyle = "#6b4a33";
    g.fillRect(0, 0, w, h);
    for (let k = 0; k < 240; k++) {
      const x = rnd() * w;
      const y = rnd() * h;
      const len = 24 + rnd() * 70;
      g.strokeStyle = rnd() < 0.55 ? "rgba(38,24,14,0.5)" : "rgba(170,128,90,0.35)";
      g.lineWidth = 1 + rnd() * 3;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + rnd() * 4 - 2, y + len);
      g.stroke();
    }
  };

  const grassCanvas = (g: CanvasRenderingContext2D, w: number, h: number): void => {
    g.fillStyle = "#6fae4a";
    g.fillRect(0, 0, w, h);
    const cols = ["#5d9c3c", "#86c25c", "#7fb852", "#4f8a33", "#9ccf6a"];
    for (let k = 0; k < 900; k++) {
      g.fillStyle = cols[Math.floor(rnd() * cols.length)];
      g.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 2, 2 + rnd() * 2);
    }
    for (let k = 0; k < 260; k++) {
      const x = rnd() * w;
      const y = rnd() * h;
      g.strokeStyle = cols[Math.floor(rnd() * cols.length)];
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + rnd() * 4 - 2, y - 4 - rnd() * 5);
      g.stroke();
    }
  };

  const wallTex = makeTexture(256, 256, plankCanvas(28, 52, 60, false), [1, 1]);
  const deckTex = makeTexture(256, 256, plankCanvas(24, 40, 44, true), [2, 2]);
  const roofTex = makeTexture(256, 256, shingleCanvas, [2, 3]);
  const barkTex = makeTexture(128, 256, barkCanvas, [2, 3]);
  const grassTex = makeTexture(256, 256, grassCanvas, [4, 4]);

  // ---------------- materials (one per colour, shared) ----------------
  const cache = new Map<string, THREE.MeshStandardMaterial>();
  const mat = (key: string, color: string, o: MatOpts = {}): THREE.MeshStandardMaterial => {
    const hit = cache.get(key);
    if (hit) return hit;
    const m = new THREE.MeshStandardMaterial({
      color,
      map: o.map ?? null,
      emissive: o.emissive ?? "#000000",
      emissiveIntensity: o.ei ?? 1,
      roughness: o.rough ?? 0.85,
      metalness: o.metal ?? 0,
      flatShading: true,
      side: o.side ?? THREE.FrontSide,
    });
    cache.set(key, m);
    return m;
  };
  const tm = (key: string, tex: THREE.Texture | null, fallback: string, o: MatOpts = {}) =>
    mat(key, tex ? "#ffffff" : fallback, { ...o, map: tex });

  const soilM = mat("soil", "#6b4a2e", { rough: 1 });
  const grassM = tm("grass", grassTex, "#6fae4a");
  const barkM = tm("bark", barkTex, "#6b4a33");
  const barkDarkM = mat("barkDark", "#4a3323");
  const trimM = mat("trim", "#5b3a24");
  const wallM = tm("wall", wallTex, "#d69a5e");
  const deckM = tm("deck", deckTex, "#a57447");
  const roofM = tm("roof", roofTex, "#b8432f");
  const ridgeM = mat("ridge", "#7a2c1f");
  const doorM = mat("door", "#3d7a6b");
  const glassM = mat("glass", "#ffe39a", { emissive: "#ffb347", ei: 1.2 });
  const lampM = mat("lamp", "#ffd27a", { emissive: "#ffa53a", ei: 1.6 });
  const stoneM = mat("stone", "#8d877c");
  const smokeM = mat("smoke", "#e8e4dc");
  const ropeM = mat("rope", "#c9a66b");
  const rungM = mat("rung", "#8a5a36");
  const brassM = mat("brass", "#d9a441", { metal: 0.6, rough: 0.35 });
  const chromeM = mat("chrome", "#c9ced6", { metal: 0.5, rough: 0.3 });
  const flagM = mat("flag", "#f2c14e", { side: THREE.DoubleSide });
  const rockM = mat("rock", "#8f9399");
  const stemM = mat("stem", "#4f8a33");
  const tuftM = [mat("tuftA", "#5d9c3c"), mat("tuftB", "#7fb852"), mat("tuftC", "#4f8a33")];
  const flowerM = [mat("fPink", "#f29ab8"), mat("fYellow", "#ffd34e"), mat("fWhite", "#fff6e8")];
  const leafM: Record<string, THREE.MeshStandardMaterial> = {
    leafA: mat("leafA", "#4f9a3d"),
    leafB: mat("leafB", "#3f8836"),
    leafC: mat("leafC", "#67ad4a"),
    leafD: mat("leafD", "#2d6e35"),
    leafE: mat("leafE", "#8ccb5a"),
    leafF: mat("leafF", "#d08a33"),
  };
  const mushRed = mat("mushRed", "#d4483a");
  const mushBrown = mat("mushBrown", "#a0653a");
  const mushYellow = mat("mushYellow", "#f0c04a");
  const cream = mat("cream", "#f3e7cf");
  const spotM = mat("spot", "#fff8ec");
  const tyreM = mat("tyre", "#2b2b2b");
  const frameM = mat("frame", "#3f6fb5");
  const wickerM = mat("wicker", "#c99a5b");
  const saddleM = mat("saddle", "#3a2a20");
  const lanternCapM = mat("lanternCap", "#2f2d38");

  // ---------------- helpers ----------------
  const add = (
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    m: THREE.Material,
    p: Vec3 = [0, 0, 0],
    r: Vec3 = [0, 0, 0],
  ): THREE.Mesh => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(p[0], p[1], p[2]);
    mesh.rotation.set(r[0], r[1], r[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const box = (
    parent: THREE.Object3D,
    w: number,
    h: number,
    d: number,
    m: THREE.Material,
    p: Vec3,
    r: Vec3 = [0, 0, 0],
  ) => add(parent, new THREE.BoxGeometry(w, h, d), m, p, r);

  // A tapered cylinder from a to b (r0 at a, r1 at b).
  const beam = (
    parent: THREE.Object3D,
    a: THREE.Vector3,
    b: THREE.Vector3,
    r0: number,
    r1: number,
    m: THREE.Material,
    seg = 6,
  ): THREE.Mesh => {
    const len = a.distanceTo(b);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, seg, 1), m);
    mesh.position.copy(a).lerp(b, 0.5);
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3().subVectors(b, a).normalize(),
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  // ---------------- round grassy base ----------------
  const base = new THREE.Group();
  root.add(base);
  add(base, new THREE.CylinderGeometry(GRASS_R, 5.2, GRASS_Y, 48, 1), soilM, [0, GRASS_Y / 2, 0]);

  const gGeo = new THREE.CircleGeometry(GRASS_R, 40);
  gGeo.rotateX(-Math.PI / 2);
  const gp = gGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < gp.count; i++) gp.setY(i, groundY(gp.getX(i), gp.getZ(i)));
  gGeo.computeVertexNormals();
  add(base, gGeo, grassM);

  for (let i = 0; i < 70; i++) {
    const a = rnd() * TAU;
    const d = 1.3 + Math.sqrt(rnd()) * 3.9;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    const s = 0.6 + rnd() * 0.8;
    add(
      base,
      new THREE.ConeGeometry(0.06 * s, 0.2 * s, 4),
      tuftM[i % 3],
      [x, groundY(x, z) + 0.1 * s, z],
      [(rnd() - 0.5) * 0.3, rnd() * TAU, (rnd() - 0.5) * 0.3],
    );
  }

  for (let i = 0; i < 18; i++) {
    const a = rnd() * TAU;
    const d = 2.4 + Math.sqrt(rnd()) * 2.6;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    const gy = groundY(x, z);
    const h = 0.16 + rnd() * 0.1;
    beam(base, V(x, gy, z), V(x, gy + h, z), 0.012, 0.01, stemM, 4);
    add(base, new THREE.SphereGeometry(0.05, 6, 4), flowerM[i % 3], [x, gy + h + 0.03, z]);
  }

  for (let i = 0; i < 14; i++) {
    const a = rnd() * TAU;
    const d = 1.6 + rnd() * 3.2;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    const l = add(
      base,
      new THREE.IcosahedronGeometry(0.07, 0),
      i % 2 ? leafM.leafF : leafM.leafE,
      [x, groundY(x, z) + 0.02, z],
      [rnd() * TAU, rnd() * TAU, rnd() * TAU],
    );
    l.scale.set(1, 0.35, 0.8);
  }

  const stones: [number, number, number][] = [
    [2.6, 0.6, 0.12],
    [-1.2, -1.4, 0.09],
    [3.2, -1.8, 0.14],
    [-3.6, -0.4, 0.1],
    [1.1, -2.6, 0.12],
  ];
  for (const [x, z, r] of stones) {
    const s = add(
      base,
      new THREE.DodecahedronGeometry(r, 0),
      rockM,
      [x, groundY(x, z) + r * 0.3, z],
      [rnd() * TAU, rnd() * TAU, 0],
    );
    s.scale.set(1.2, 0.7, 1);
  }

  // ---------------- the oak ----------------
  const tree = new THREE.Group();
  root.add(tree);

  // trunk
  beam(tree, V(0, 0.2, 0), V(0, 6.2, 0), 0.98, 0.56, barkM, 9);

  // knots on the trunk
  const knots: [number, number][] = [
    [1.5, 0.4],
    [2.9, 2.3],
    [4.0, 4.1],
    [5.3, 5.4],
  ];
  for (const [y, a] of knots) {
    const rr = 0.98 - ((y - 0.2) / 6) * 0.42;
    const k = add(
      tree,
      new THREE.SphereGeometry(0.11, 6, 4),
      barkDarkM,
      [Math.cos(a) * rr * 0.95, y, Math.sin(a) * rr * 0.95],
    );
    k.scale.set(1, 1.4, 0.6);
    k.rotation.y = Math.PI / 2 - a;
  }

  // roots, half sunk into the grass
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + 0.3 + rnd() * 0.5;
    const len = 1.7 + rnd() * 0.4;
    const s0 = V(Math.cos(a) * 0.5, 0.5, Math.sin(a) * 0.5);
    const s1 = V(Math.cos(a) * len, 0.5, Math.sin(a) * len);
    beam(tree, s0, s1, 0.3, 0.1, barkM, 6);
  }

  // limbs
  beam(tree, V(-0.3, 5.3, -0.2), V(-3.2, 6.6, -0.9), 0.24, 0.1, barkM);
  beam(tree, V(0.3, 5.0, -0.3), V(3.0, 6.8, -0.6), 0.26, 0.1, barkM);
  beam(tree, V(0.1, 5.8, -0.3), V(0.6, 8.6, -2.4), 0.22, 0.09, barkM);
  beam(tree, V(-0.2, 6.0, -0.4), V(-1.5, 8.3, -2.6), 0.18, 0.08, barkM);
  beam(tree, V(0.3, 5.3, -0.5), V(2.0, 5.6, -2.8), 0.16, 0.07, barkM);
  beam(tree, V(-0.2, 5.1, -0.6), V(-1.8, 5.4, -2.5), 0.16, 0.07, barkM);
  // swing limb
  beam(tree, V(-0.25, 4.9, -0.25), V(-3.7, 5.55, 0.25), 0.28, 0.13, barkM);
  // braces holding up the deck
  beam(tree, V(0.55, 3.9, 0.2), V(1.45, 4.31, 1.2), 0.1, 0.07, trimM);
  beam(tree, V(-0.55, 3.8, 0.2), V(-1.45, 4.31, 1.1), 0.1, 0.07, trimM);

  // crown: clustered, low-poly leafy blobs (x, y, z, radius, material)
  const blobs: [number, number, number, number, string][] = [
    [-2.7, 6.5, -0.7, 1.35, "leafA"],
    [-3.5, 7.7, -1.8, 1.2, "leafF"],
    [-1.9, 8.3, -1.4, 1.4, "leafC"],
    [-0.6, 9.0, -1.5, 1.3, "leafA"],
    [0.7, 9.3, -1.3, 1.25, "leafE"],
    [2.0, 8.4, -1.5, 1.35, "leafC"],
    [3.2, 7.5, -1.7, 1.25, "leafF"],
    [3.4, 6.3, -0.4, 1.25, "leafB"],
    [2.5, 5.4, -2.1, 1.1, "leafD"],
    [-2.5, 5.5, -2.1, 1.05, "leafD"],
    [0.0, 6.9, -3.2, 1.45, "leafC"],
    [-1.3, 7.2, -3.3, 1.3, "leafB"],
    [1.4, 6.9, -3.4, 1.3, "leafA"],
    [-4.0, 6.0, -0.9, 0.95, "leafD"],
    [4.1, 5.6, 0.2, 0.9, "leafD"],
    [2.6, 5.9, 1.2, 0.85, "leafB"],
    [-2.9, 6.8, 1.3, 0.9, "leafA"],
    [0.2, 9.9, -0.8, 1.0, "leafE"],
    [-1.0, 8.0, -0.3, 0.9, "leafB"],
  ];
  for (const [x, y, z, r, key] of blobs) {
    const geo = new THREE.IcosahedronGeometry(r, 1);
    geo.rotateY(rnd() * TAU);
    const p = geo.attributes.position as THREE.BufferAttribute;
    const ph = rnd() * 6;
    for (let i = 0; i < p.count; i++) {
      const px = p.getX(i);
      const py = p.getY(i);
      const pz = p.getZ(i);
      // depends only on position, so shared corners stay welded
      const f = 1 + 0.12 * Math.sin(px * 3.1 + py * 2.3 + ph) * Math.cos(pz * 2.7 - py * 1.9);
      p.setXYZ(i, px * f, py * f * 0.85, pz * f);
    }
    geo.computeVertexNormals();
    add(tree, geo, leafM[key], [x, y, z]);
  }

  // ---------------- the treehouse cabin ----------------
  const cabin = new THREE.Group();
  root.add(cabin);

  // deck
  box(cabin, 3.2, 0.14, 2.6, deckM, [0, 4.38, 1.3]);

  // walls
  box(cabin, 2.4, 1.75, 2.0, wallM, [0, 5.325, 1.3]);
  for (const x of [-1.2, 1.2]) {
    for (const z of [0.3, 2.3]) box(cabin, 0.1, 1.78, 0.1, trimM, [x, 5.325, z]);
  }

  // roof: two slabs meeting at a ridge
  const th = Math.atan2(1.15, 1.5);
  const slabLen = Math.hypot(1.5, 1.15) + 0.12;
  for (const s of [-1, 1]) {
    add(
      cabin,
      new THREE.BoxGeometry(slabLen, 0.12, 2.8),
      roofM,
      [s * 0.786, 6.773, 1.3],
      [0, 0, -s * th],
    );
  }
  box(cabin, 0.26, 0.08, 2.9, ridgeM, [0, 7.37, 1.3]);

  // chimney with a little puff of smoke
  box(cabin, 0.34, 1.1, 0.34, stoneM, [0.85, 6.95, 0.75]);
  box(cabin, 0.44, 0.1, 0.44, trimM, [0.85, 7.53, 0.75]);
  const puffs: [number, number, number, number][] = [
    [0.92, 7.85, 0.7, 0.13],
    [1.0, 8.2, 0.6, 0.18],
    [1.15, 8.6, 0.5, 0.22],
  ];
  for (const [x, y, z, r] of puffs) {
    add(cabin, new THREE.IcosahedronGeometry(r, 1), smokeM, [x, y, z]);
  }

  // gable ends (triangles under the roof)
  const gableShape = new THREE.Shape();
  gableShape.moveTo(-1.3, 6.1);
  gableShape.lineTo(1.3, 6.1);
  gableShape.lineTo(0, 7.3);
  gableShape.closePath();
  const gableGeo = new THREE.ShapeGeometry(gableShape);
  add(cabin, gableGeo, wallM, [0, 0, 2.31]);
  add(cabin, gableGeo, wallM, [0, 0, 0.29], [0, Math.PI, 0]);

  // round window in the front gable
  add(cabin, new THREE.CylinderGeometry(0.27, 0.27, 0.04, 16), glassM, [0, 6.5, 2.34], [Math.PI / 2, 0, 0]);
  add(cabin, new THREE.TorusGeometry(0.27, 0.045, 8, 20), trimM, [0, 6.5, 2.36]);
  box(cabin, 0.52, 0.04, 0.04, trimM, [0, 6.5, 2.38]);
  box(cabin, 0.04, 0.52, 0.04, trimM, [0, 6.5, 2.38]);

  // front door
  box(cabin, 0.62, 1.2, 0.06, doorM, [-0.4, 5.05, 2.33]);
  box(cabin, 0.84, 0.1, 0.1, trimM, [-0.4, 5.72, 2.36]);
  box(cabin, 0.08, 1.24, 0.08, trimM, [-0.76, 5.05, 2.36]);
  box(cabin, 0.08, 1.24, 0.08, trimM, [-0.04, 5.05, 2.36]);
  add(cabin, new THREE.SphereGeometry(0.05, 8, 6), brassM, [-0.26, 5.05, 2.38]);

  // square front window with glowing pane and flower box
  const wx = 0.55;
  const wy = 5.3;
  box(cabin, 0.56, 0.56, 0.03, glassM, [wx, wy, 2.34]);
  box(cabin, 0.8, 0.08, 0.08, trimM, [wx, wy + 0.32, 2.36]);
  box(cabin, 0.8, 0.08, 0.08, trimM, [wx, wy - 0.32, 2.36]);
  box(cabin, 0.08, 0.64, 0.08, trimM, [wx - 0.32, wy, 2.36]);
  box(cabin, 0.08, 0.64, 0.08, trimM, [wx + 0.32, wy, 2.36]);
  box(cabin, 0.56, 0.03, 0.04, trimM, [wx, wy, 2.37]);
  box(cabin, 0.03, 0.56, 0.04, trimM, [wx, wy, 2.37]);
  box(cabin, 0.78, 0.12, 0.2, trimM, [wx, 4.86, 2.42]);
  for (let k = -2; k <= 2; k++) {
    add(cabin, new THREE.SphereGeometry(0.05, 6, 4), flowerM[(k + 5) % 3], [wx + k * 0.13, 4.97, 2.45]);
  }

  // side windows
  for (const s of [-1, 1]) {
    const x = s * 1.21;
    box(cabin, 0.03, 0.56, 0.56, glassM, [x, 5.3, 1.3]);
    box(cabin, 0.08, 0.08, 0.76, trimM, [x, 5.62, 1.3]);
    box(cabin, 0.08, 0.08, 0.76, trimM, [x, 4.98, 1.3]);
    box(cabin, 0.08, 0.64, 0.08, trimM, [x, 5.3, 0.96]);
    box(cabin, 0.08, 0.64, 0.08, trimM, [x, 5.3, 1.64]);
  }

  // deck railings
  const railY = 5.0;
  box(cabin, 2.0, 0.07, 0.07, trimM, [-0.6, railY, 2.54]);
  box(cabin, 0.15, 0.07, 0.07, trimM, [1.525, railY, 2.54]);
  for (const x of [-1.55, -1.1, -0.65, -0.2, 0.35, 1.5]) {
    box(cabin, 0.06, 0.55, 0.06, trimM, [x, 4.725, 2.54]);
  }
  for (const s of [-1, 1]) {
    box(cabin, 0.07, 0.07, 2.2, trimM, [s * 1.55, railY, 1.5]);
    for (const z of [0.6, 1.2, 1.8, 2.4]) {
      box(cabin, 0.06, 0.55, 0.06, trimM, [s * 1.55, 4.725, z]);
    }
  }

  // lantern post on the deck, beside the door
  const lanX = -0.95;
  const lanZ = 2.44;
  box(cabin, 0.16, 0.05, 0.16, trimM, [lanX, 4.475, lanZ]);
  add(cabin, new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), trimM, [lanX, 4.9, lanZ]);
  add(cabin, new THREE.CylinderGeometry(0.12, 0.12, 0.03, 6), trimM, [lanX, 5.31, lanZ]);
  add(cabin, new THREE.CylinderGeometry(0.1, 0.075, 0.24, 6), lampM, [lanX, 5.42, lanZ]);
  add(cabin, new THREE.ConeGeometry(0.15, 0.12, 6), lanternCapM, [lanX, 5.6, lanZ]);
  add(cabin, new THREE.SphereGeometry(0.03, 6, 4), brassM, [lanX, 5.7, lanZ]);

  // pennant on the ridge
  beam(cabin, V(0, 7.25, 1.3), V(0, 8.9, 1.3), 0.03, 0.025, trimM, 5);
  add(cabin, new THREE.SphereGeometry(0.06, 8, 6), brassM, [0, 8.92, 1.3]);
  const flagGeo = (() => {
    const N = 12;
    const len = 1.1;
    const H = 0.5;
    const yc = 8.6;
    const pos: number[] = [];
    const idx: number[] = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const x = u * len;
      const hh = (H / 2) * (1 - u);
      const z = Math.sin(u * 5.5) * 0.1 * u;
      pos.push(x, yc + hh, z, x, yc - hh, z);
    }
    for (let i = 0; i < N; i++) {
      const a = 2 * i;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      idx.push(a, b, c, b, d, c);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  })();
  add(cabin, flagGeo, flagM, [0, 0, 1.3]);

  // rope ladder from the deck edge down to the grass
  const ladder = new THREE.Group();
  root.add(ladder);
  const topL = V(0.68, 4.3, 2.62);
  const topR = V(1.32, 4.3, 2.62);
  const botL = V(0.8, 0.9, 3.2);
  const botR = V(1.44, 0.9, 3.2);
  beam(ladder, topL, botL, 0.022, 0.022, ropeM, 4);
  beam(ladder, topR, botR, 0.022, 0.022, ropeM, 4);
  const rungCount = 9;
  for (let k = 0; k < rungCount; k++) {
    const t = 0.1 + (k / (rungCount - 1)) * 0.82;
    const pl = new THREE.Vector3().lerpVectors(topL, botL, t);
    const pr = new THREE.Vector3().lerpVectors(topR, botR, t);
    beam(ladder, pl, pr, 0.028, 0.028, rungM, 5);
  }
  box(ladder, 0.7, 0.06, 0.06, rungM, [1.0, 4.28, 2.64]);

  // plank swing hanging from the swing limb
  const swing = new THREE.Group();
  root.add(swing);
  const aL = V(-2.97, 5.41, 0.145);
  const aR = V(-2.08, 5.24, 0.015);
  const seatL = V(-3.02, 3.13, 0.1);
  const seatR = V(-2.02, 3.13, 0.1);
  for (const dz of [-0.12, 0.12]) {
    beam(swing, aL.clone().add(V(0, 0, dz)), seatL.clone().add(V(0, 0, dz)), 0.018, 0.018, ropeM, 4);
    beam(swing, aR.clone().add(V(0, 0, dz)), seatR.clone().add(V(0, 0, dz)), 0.018, 0.018, ropeM, 4);
  }
  box(swing, 1.0, 0.06, 0.34, deckM, [-2.52, 3.1, 0.1]);

  // ---------------- mushrooms ----------------
  const mushroom = (x: number, z: number, s: number, capM: THREE.Material, spotted: boolean) => {
    const g = new THREE.Group();
    g.position.set(x, groundY(x, z), z);
    g.rotation.y = rnd() * TAU;
    root.add(g);
    add(g, new THREE.CylinderGeometry(0.035 * s, 0.05 * s, 0.14 * s, 6), cream, [0, 0.07 * s, 0]);
    const cap = add(
      g,
      new THREE.SphereGeometry(0.11 * s, 8, 5, 0, TAU, 0, Math.PI / 2),
      capM,
      [0, 0.14 * s, 0],
    );
    cap.scale.y = 0.65;
    if (spotted) {
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * TAU + 0.3;
        add(
          g,
          new THREE.SphereGeometry(0.022 * s, 5, 4),
          spotM,
          [Math.cos(a) * 0.08 * s, 0.14 * s + 0.045 * s, Math.sin(a) * 0.08 * s],
        );
      }
    }
  };
  mushroom(1.9, 1.5, 1.4, mushRed, true);
  mushroom(2.25, 1.0, 1.0, mushBrown, false);
  mushroom(2.3, 1.8, 1.1, mushYellow, true);
  mushroom(1.6, 1.0, 0.8, mushRed, true);
  mushroom(-1.4, -1.8, 1.2, mushRed, true);
  mushroom(-1.0, -2.1, 0.8, mushYellow, false);

  // ---------------- bicycle, leaning in at the foot of the tree ----------------
  const bike = new THREE.Group();
  bike.position.set(-2.2, groundY(-2.2, 1.7), 1.7);
  bike.rotation.y = -1.0;
  root.add(bike);

  const BB = V(0.02, 0.3, 0);
  const seatTop = V(-0.2, 0.92, 0);
  const headTop = V(0.4, 0.9, 0);
  const headBot = V(0.4, 0.62, 0);
  const rearHub = V(-0.52, 0.37, 0);
  const frontHub = V(0.52, 0.37, 0);
  const tube = (a: THREE.Vector3, b: THREE.Vector3, r = 0.022) => beam(bike, a, b, r, r, frameM, 5);

  tube(BB, seatTop);
  tube(seatTop, headTop);
  tube(BB, V(0.4, 0.74, 0));
  tube(BB, rearHub);
  tube(V(-0.2, 0.8, 0), rearHub);
  tube(headBot, frontHub);
  tube(headBot, headTop, 0.03);
  tube(headTop, V(0.42, 1.02, 0), 0.02);
  beam(bike, V(0.42, 1.02, -0.24), V(0.42, 1.02, 0.24), 0.015, 0.015, chromeM, 4);

  for (const hub of [frontHub, rearHub]) {
    add(bike, new THREE.TorusGeometry(0.34, 0.035, 6, 20), tyreM, [hub.x, hub.y, 0]);
    add(bike, new THREE.TorusGeometry(0.31, 0.01, 4, 18), chromeM, [hub.x, hub.y, 0]);
    add(bike, new THREE.CylinderGeometry(0.03, 0.03, 0.08, 6), chromeM, [hub.x, hub.y, 0], [Math.PI / 2, 0, 0]);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * TAU;
      beam(bike, hub, V(hub.x + Math.cos(a) * 0.34, hub.y + Math.sin(a) * 0.34, 0), 0.005, 0.005, chromeM, 3);
    }
  }

  add(bike, new THREE.CylinderGeometry(0.08, 0.08, 0.012, 12), chromeM, [0.02, 0.3, 0.05], [Math.PI / 2, 0, 0]);
  beam(bike, V(0.02, 0.3, 0.06), V(0.12, 0.2, 0.1), 0.012, 0.012, chromeM, 4);
  box(bike, 0.1, 0.02, 0.06, tyreM, [0.12, 0.18, 0.1]);

  box(bike, 0.26, 0.05, 0.12, saddleM, [-0.2, 0.96, 0], [0, 0, 0.05]);

  // front basket with flowers
  add(bike, new THREE.CylinderGeometry(0.15, 0.11, 0.16, 8), wickerM, [0.62, 0.93, 0]);
  add(bike, new THREE.SphereGeometry(0.04, 6, 4), flowerM[0], [0.62, 1.07, 0.06]);
  add(bike, new THREE.SphereGeometry(0.04, 6, 4), flowerM[1], [0.62, 1.09, -0.05]);
  add(bike, new THREE.SphereGeometry(0.04, 6, 4), flowerM[2], [0.6, 1.06, 0]);

  return root;
}
