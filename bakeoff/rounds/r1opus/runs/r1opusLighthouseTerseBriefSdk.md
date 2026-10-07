```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Lighthouse Isle",
  description:
    "A stylized low-poly diorama: a red-and-white striped lighthouse with a glowing lantern and sweeping beams, standing on a tiny grassy rock island with a keeper's cottage, wooden dock, rowing boat, pines, flowers, gulls and a ring of foamy sea.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "lighthouse_isle" });
  try {
    b.joint("root", { at: [0, 0, 0] });
  } catch {
    /* props need no rig */
  }

  // ---------- deterministic randomness ----------
  const fallback = (() => {
    let s = 1337 >>> 0;
    return () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  })();
  let rand: () => number = fallback;
  try {
    const R: any = rng(1337);
    if (typeof R === "function") {
      const v = R();
      if (typeof v === "number" && v >= 0 && v < 1) rand = () => R();
    } else if (R && typeof R.next === "function") {
      const v = R.next();
      if (typeof v === "number" && v >= 0 && v < 1) rand = () => R.next();
    }
  } catch {
    /* fallback */
  }
  const range = (a: number, c: number) => a + (c - a) * rand();

  // ---------- palette ----------
  const C = {
    seaDeep: "#1c6d86",
    sea: "#2fa7ba",
    foam: "#eafcfb",
    sand: "#ead6a2",
    rock: "#7f8794",
    rock2: "#68707c",
    grass: "#6cbf4b",
    grass2: "#8fd65e",
    stone: "#b9b1a4",
    stone2: "#d2cbbf",
    white: "#f6f3ea",
    red: "#d6403a",
    dark: "#2d3142",
    pane: "#24324a",
    cream: "#fff6dc",
    wood: "#a87a4f",
    wood2: "#946743",
    woodDark: "#6b4a30",
    door: "#6b3f24",
    gold: "#e8b84a",
    slate: "#34507a",
    brick: "#b0503a",
    cottage: "#f5e9cc",
    blueDoor: "#3f6fa0",
    pine: "#2f8a4a",
    pine2: "#3fa35a",
    trunk: "#7a5232",
    gullGrey: "#9aa3ad",
    orange: "#f2a33a",
    black: "#1a1a1f",
    pink: "#ff7aa8",
    yellow: "#ffd84a",
    boatBlue: "#2f6db5",
  };

  const mats = new Map<string, THREE.Material>();
  const mat = (c: string) => {
    let m = mats.get(c);
    if (!m) {
      m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.72, metalness: 0.04, flatShading: true });
      mats.set(c, m);
    }
    return m;
  };

  const world = new THREE.Group();
  world.name = "lighthouseIsle";
  b.root.add(world);

  const add = (
    geo: THREE.BufferGeometry,
    color: string | THREE.Material,
    pos: V,
    rot: V = [0, 0, 0],
    parent: THREE.Object3D = world,
    scale?: V,
  ) => {
    const m = new THREE.Mesh(geo, typeof color === "string" ? mat(color) : color);
    m.position.set(pos[0], pos[1], pos[2]);
    m.rotation.set(rot[0], rot[1], rot[2]);
    if (scale) m.scale.set(scale[0], scale[1], scale[2]);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };

  // position-hashed jitter: coincident vertices move together, no cracks
  const hash = (x: number, y: number, z: number, k: number) => {
    const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + k * 19.3) * 43758.5453;
    return s - Math.floor(s) - 0.5;
  };
  const jitter = (geo: THREE.BufferGeometry, axz: number, ay: number, minY = -Infinity) => {
    const p = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const kx = Math.round(x * 100), ky = Math.round(y * 100), kz = Math.round(z * 100);
      p.setX(i, x + hash(kx, ky, kz, 1) * axz);
      p.setZ(i, z + hash(kx, ky, kz, 2) * axz);
      if (y > minY) p.setY(i, y + hash(kx, ky, kz, 3) * ay);
    }
    p.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  };

  // ================= SEA =================
  add(new THREE.CylinderGeometry(7.25, 7.3, 0.16, 12), C.seaDeep, [0, 0.08, 0]);
  add(new THREE.CylinderGeometry(7.0, 7.15, 0.3, 12), C.sea, [0, 0.27, 0]);
  // foam ring around shore
  add(new THREE.TorusGeometry(5.05, 0.14, 4, 26), C.foam, [0, 0.42, 0], [Math.PI / 2, 0, 0], world, [1, 1, 0.45]);
  add(new THREE.TorusGeometry(6.95, 0.08, 4, 30), C.foam, [0, 0.41, 0], [Math.PI / 2, 0, 0], world, [1, 1, 0.4]);

  const dockAngle = Math.atan2(-1.6, 5.2);
  const angDiff = (a: number, c: number) => Math.abs(Math.atan2(Math.sin(a - c), Math.cos(a - c)));
  // wave crests
  for (let i = 0; i < 30; i++) {
    const a = range(0, Math.PI * 2);
    const r = range(5.5, 6.75);
    if (angDiff(a, dockAngle) < 0.3 && r < 7) continue;
    const len = range(0.35, 0.7);
    add(new THREE.BoxGeometry(len, 0.05, 0.1), C.foam, [Math.sin(a) * r, 0.43, Math.cos(a) * r], [0, a + Math.PI / 2, 0]);
    add(new THREE.BoxGeometry(len * 0.6, 0.05, 0.08), C.foam, [Math.sin(a + 0.04) * (r + 0.18), 0.43, Math.cos(a + 0.04) * (r + 0.18)], [0, a + Math.PI / 2, 0]);
  }

  // ================= ISLAND =================
  const sandGeo = jitter(new THREE.CylinderGeometry(4.85, 5.0, 0.3, 14, 1), 0.25, 0.04, 0);
  add(sandGeo, C.sand, [0, 0.42, 0], [0, 0, 0], world, [1.03, 1, 0.97]);
  const rockGeo = jitter(new THREE.CylinderGeometry(3.95, 4.5, 1.45, 11, 3), 0.45, 0.08, -0.7);
  add(rockGeo, C.rock, [0, 0.88, 0]);
  const grassGeo = jitter(new THREE.CylinderGeometry(3.75, 4.0, 0.3, 13, 1), 0.2, 0.05, 0.1);
  add(grassGeo, C.grass, [0, 1.6, 0]);
  // grassy mounds
  for (const m of [[-2.6, -0.5, 0.7], [0.9, -2.7, 0.6], [2.9, 0.1, 0.5], [-1.0, 2.6, 0.45]] as number[][]) {
    add(new THREE.IcosahedronGeometry(m[2], 0), C.grass2, [m[0], 1.66, m[1]], [rand(), rand(), 0], world, [1, 0.28, 1]);
  }
  // cliff boulders on the flanks
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + range(-0.2, 0.2);
    if (angDiff(a, dockAngle) < 0.35) continue;
    const r = range(4.0, 4.3);
    const s = range(0.35, 0.6);
    add(new THREE.DodecahedronGeometry(s, 0), i % 2 ? C.rock2 : C.rock, [Math.sin(a) * r, range(0.9, 1.3), Math.cos(a) * r], [rand() * 3, rand() * 3, 0], world, [1, 0.8, 1]);
  }
  // shore rocks in the water
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + range(-0.15, 0.15);
    if (angDiff(a, dockAngle) < 0.45) continue;
    const r = range(4.7, 5.6);
    const s = range(0.22, 0.5);
    add(new THREE.DodecahedronGeometry(s, 0), i % 3 ? C.rock : C.rock2, [Math.sin(a) * r, 0.38, Math.cos(a) * r], [rand() * 3, rand() * 3, rand()], world, [1, 0.65, 1]);
  }

  // ================= LIGHTHOUSE =================
  const T = { x: -0.5, z: -0.7 };
  const tower = new THREE.Group();
  tower.name = "lighthouse";
  tower.position.set(T.x, 0, T.z);
  world.add(tower);

  // plinth
  add(new THREE.CylinderGeometry(1.45, 1.6, 0.6, 8), C.stone, [0, 1.95, 0], [0, Math.PI / 8, 0], tower);
  add(new THREE.CylinderGeometry(1.52, 1.52, 0.08, 8), C.stone2, [0, 2.25, 0], [0, Math.PI / 8, 0], tower);
  // plinth stone blocks
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8 + Math.PI / 8;
    if (angDiff(a, 0) < 0.3) continue;
    add(new THREE.BoxGeometry(0.5, 0.18, 0.06), C.stone2, [Math.sin(a) * 1.42, 1.9, Math.cos(a) * 1.42], [0, a, 0], tower);
  }

  const y0 = 2.29, y1 = 11.0, rB = 1.12, rT = 0.74;
  const rAt = (y: number) => rB + ((rT - rB) * (y - y0)) / (y1 - y0);
  const nBands = 6;
  const bh = (y1 - y0) / nBands;
  for (let i = 0; i < nBands; i++) {
    const ya = y0 + i * bh, yb = ya + bh;
    add(new THREE.CylinderGeometry(rAt(yb), rAt(ya), bh, 14, 1), i % 2 === 0 ? C.white : C.red, [0, (ya + yb) / 2, 0], [0, 0, 0], tower);
  }
  // cornice under gallery
  add(new THREE.CylinderGeometry(0.95, rT, 0.22, 14), C.white, [0, 10.92, 0], [0, 0, 0], tower);

  // spiral of windows
  const winY = [3.9, 5.3, 6.7, 8.1, 9.5];
  winY.forEach((y, k) => {
    const a = 0.9 + k * 1.15;
    const r = rAt(y) - 0.01;
    const w = new THREE.Group();
    w.position.set(Math.sin(a) * r, y, Math.cos(a) * r);
    w.rotation.y = a;
    tower.add(w);
    add(new THREE.BoxGeometry(0.36, 0.52, 0.07), C.cream, [0, 0, 0], [0, 0, 0], w);
    add(new THREE.BoxGeometry(0.25, 0.4, 0.09), C.pane, [0, 0, 0.005], [0, 0, 0], w);
    add(new THREE.BoxGeometry(0.03, 0.4, 0.1), C.cream, [0, 0, 0.01], [0, 0, 0], w);
    add(new THREE.BoxGeometry(0.44, 0.06, 0.16), C.dark, [0, -0.28, 0.04], [0, 0, 0], w);
    add(new THREE.CylinderGeometry(0.18, 0.18, 0.07, 8, 1, false, -Math.PI / 2, Math.PI), C.dark, [0, 0.27, 0.0], [Math.PI / 2, 0, 0], w, [1.2, 1, 0.5]);
  });

  // door (front)
  {
    const r = rAt(2.8);
    add(new THREE.BoxGeometry(0.76, 0.98, 0.1), C.red, [0, y0 + 0.49, r - 0.02], [0, 0, 0], tower);
    add(new THREE.CylinderGeometry(0.38, 0.38, 0.1, 10), C.red, [0, y0 + 0.98, r - 0.02], [Math.PI / 2, 0, 0], tower);
    add(new THREE.BoxGeometry(0.56, 0.9, 0.12), C.door, [0, y0 + 0.45, r + 0.01], [0, 0, 0], tower);
    add(new THREE.CylinderGeometry(0.28, 0.28, 0.12, 10), C.door, [0, y0 + 0.9, r + 0.01], [Math.PI / 2, 0, 0], tower);
    for (const dy of [0.25, 0.6]) add(new THREE.BoxGeometry(0.5, 0.04, 0.13), C.woodDark, [0, y0 + dy, r + 0.02], [0, 0, 0], tower);
    add(new THREE.SphereGeometry(0.035, 6, 4), C.gold, [0.18, y0 + 0.45, r + 0.09], [0, 0, 0], tower);
    // little lamp over door
    add(new THREE.BoxGeometry(0.1, 0.14, 0.1), C.dark, [0, y0 + 1.42, r + 0.04], [0, 0, 0], tower);
    add(new THREE.BoxGeometry(0.07, 0.08, 0.07), new THREE.MeshStandardMaterial({ color: "#ffe27a", emissive: "#ffc833", emissiveIntensity: 1.2, flatShading: true }), [0, y0 + 1.42, r + 0.06], [0, 0, 0], tower);
    // steps
    add(new THREE.BoxGeometry(0.95, 0.2, 0.35), C.stone2, [0, 2.12, 1.55], [0, 0, 0], tower);
    add(new THREE.BoxGeometry(1.05, 0.2, 0.35), C.stone, [0, 1.92, 1.82], [0, 0, 0], tower);
  }

  // gallery
  const deckY = 11.08;
  add(new THREE.CylinderGeometry(1.3, 1.25, 0.16, 16), C.dark, [0, deckY, 0], [0, 0, 0], tower);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    add(new THREE.BoxGeometry(0.1, 0.3, 0.4), C.dark, [Math.sin(a) * 0.95, 10.86, Math.cos(a) * 0.95], [0, a, 0], tower);
    add(new THREE.CylinderGeometry(0.022, 0.022, 0.55, 4), C.dark, [Math.sin(a) * 1.22, deckY + 0.35, Math.cos(a) * 1.22], [0, 0, 0], tower);
  }
  for (const ry of [deckY + 0.36, deckY + 0.62]) {
    add(new THREE.TorusGeometry(1.22, 0.028, 4, 24), C.dark, [0, ry, 0], [Math.PI / 2, 0, 0], tower);
  }

  // lantern room
  add(new THREE.CylinderGeometry(0.7, 0.72, 0.36, 8), C.red, [0, 11.34, 0], [0, 0, 0], tower);
  add(new THREE.CylinderGeometry(0.76, 0.76, 0.05, 8), C.white, [0, 11.53, 0], [0, 0, 0], tower);
  const glass = new THREE.MeshStandardMaterial({ color: "#cfefff", roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.28, depthWrite: false, flatShading: true });
  add(new THREE.CylinderGeometry(0.62, 0.62, 1.0, 8), glass, [0, 12.05, 0], [0, 0, 0], tower);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    add(new THREE.BoxGeometry(0.05, 1.0, 0.05), C.dark, [Math.sin(a) * 0.62, 12.05, Math.cos(a) * 0.62], [0, a, 0], tower);
  }
  add(new THREE.TorusGeometry(0.62, 0.025, 3, 8), C.dark, [0, 12.05, 0], [Math.PI / 2, 0, Math.PI / 8], tower);
  // lamp
  add(new THREE.CylinderGeometry(0.1, 0.16, 0.35, 6), C.gold, [0, 11.73, 0], [0, 0, 0], tower);
  const lampMat = new THREE.MeshStandardMaterial({ color: "#ffe27a", emissive: "#ffcc33", emissiveIntensity: 1.8, flatShading: true });
  add(new THREE.IcosahedronGeometry(0.26, 0), lampMat, [0, 12.05, 0], [0, 0, 0], tower);
  add(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 8), C.gold, [0, 12.05, 0], [0, 0, 0], tower);
  const halo = new THREE.MeshBasicMaterial({ color: "#fff1a0", transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending });
  add(new THREE.IcosahedronGeometry(0.45, 1), halo, [0, 12.05, 0], [0, 0, 0], tower);

  // beams of light
  const beamMat = new THREE.MeshBasicMaterial({ color: "#fff2a8", transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const beams = new THREE.Group();
  beams.position.set(0, 12.05, 0);
  beams.rotation.y = 0.75;
  tower.add(beams);
  for (const ry of [0, Math.PI]) {
    const g = new THREE.ConeGeometry(1.1, 6, 16, 1, true);
    g.rotateZ(Math.PI / 2);
    g.translate(3, 0, 0);
    const m = add(g, beamMat, [0, 0, 0], [0, ry, 0], beams);
    m.castShadow = false;
    m.receiveShadow = false;
  }

  // roof
  add(new THREE.CylinderGeometry(0.8, 0.8, 0.1, 8), C.dark, [0, 12.58, 0], [0, 0, 0], tower);
  add(new THREE.ConeGeometry(0.88, 0.75, 8), C.red, [0, 13.0, 0], [0, 0, 0], tower);
  add(new THREE.CylinderGeometry(0.1, 0.14, 0.12, 6), C.dark, [0, 13.4, 0], [0, 0, 0], tower);
  add(new THREE.SphereGeometry(0.14, 8, 6), C.dark, [0, 13.52, 0], [0, 0, 0], tower);
  add(new THREE.CylinderGeometry(0.022, 0.022, 0.55, 4), C.dark, [0, 13.85, 0], [0, 0, 0], tower);
  add(new THREE.SphereGeometry(0.05, 6, 4), C.gold, [0, 14.13, 0], [0, 0, 0], tower);
  // weathervane arrow
  add(new THREE.BoxGeometry(0.55, 0.025, 0.025), C.dark, [0, 13.98, 0], [0, 0.4, 0], tower);
  {
    const s = new THREE.Shape();
    s.moveTo(0, 0.08); s.lineTo(0.14, 0); s.lineTo(0, -0.08); s.lineTo(0, 0.08);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: false });
    g.translate(0, 0, -0.01);
    const vane = new THREE.Group();
    vane.position.set(0, 13.98, 0);
    vane.rotation.y = 0.4;
    tower.add(vane);
    add(g, C.red, [0.27, 0, 0], [0, 0, 0], vane);
    add(new THREE.BoxGeometry(0.02, 0.16, 0.12), C.red, [-0.26, 0, 0], [0, Math.PI / 2, 0], vane);
  }

  // ================= GULL =================
  const gull = (parent: THREE.Object3D, pos: V, ry: number, s = 1) => {
    const g = new THREE.Group();
    g.position.set(pos[0], pos[1], pos[2]);
    g.rotation.y = ry;
    g.scale.setScalar(s);
    parent.add(g);
    add(new THREE.SphereGeometry(0.11, 6, 4), C.white, [0, 0.12, 0], [0, 0, 0], g, [1, 0.85, 1.6]);
    add(new THREE.SphereGeometry(0.07, 6, 4), C.white, [0, 0.22, 0.14], [0, 0, 0], g);
    add(new THREE.ConeGeometry(0.022, 0.09, 4), C.orange, [0, 0.21, 0.24], [Math.PI / 2, 0, 0], g);
    for (const sx of [1, -1]) {
      add(new THREE.BoxGeometry(0.05, 0.05, 0.24), C.gullGrey, [0.1 * sx, 0.15, -0.03], [0.15, 0, 0.25 * sx], g);
      add(new THREE.BoxGeometry(0.04, 0.03, 0.06), C.black, [0.1 * sx, 0.15, -0.17], [0.15, 0, 0.25 * sx], g);
      add(new THREE.SphereGeometry(0.014, 4, 3), C.black, [0.05 * sx, 0.24, 0.18], [0, 0, 0], g);
      add(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 3), C.orange, [0.035 * sx, 0.03, 0], [0, 0, 0], g);
    }
    add(new THREE.BoxGeometry(0.1, 0.03, 0.1), C.gullGrey, [0, 0.13, -0.19], [0.2, 0, 0], g);
  };
  // gull on the gallery
  gull(tower, [Math.sin(0.5) * 1.2, deckY + 0.66, Math.cos(0.5) * 1.2], 2.0, 0.9);

  // ================= COTTAGE =================
  const cg = new THREE.Group();
  cg.name = "cottage";
  cg.position.set(1.9, 1.7, 1.0);
  cg.rotation.y = -0.5;
  world.add(cg);
  add(new THREE.BoxGeometry(1.86, 0.18, 1.36), C.stone, [0, 0.09, 0], [0, 0, 0], cg);
  add(new THREE.BoxGeometry(1.8, 1.0, 1.3), C.cottage, [0, 0.6, 0], [0, 0, 0], cg);
  {
    const s = new THREE.Shape();
    s.moveTo(-1.08, 0); s.lineTo(1.08, 0); s.lineTo(0, 0.78); s.lineTo(-1.08, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: 1.5, bevelEnabled: false });
    g.translate(0, 0, -0.75);
    add(g, C.slate, [0, 1.1, 0], [0, 0, 0], cg);
    // gable infill (cottage colour) set back slightly
    const s2 = new THREE.Shape();
    s2.moveTo(-0.9, 0); s2.lineTo(0.9, 0); s2.lineTo(0, 0.64); s2.lineTo(-0.9, 0);
    const g2 = new THREE.ExtrudeGeometry(s2, { depth: 1.3, bevelEnabled: false });
    g2.translate(0, 0, -0.65);
    add(g2, C.cottage, [0, 1.1, 0], [0, 0, 0], cg);
  }
  add(new THREE.BoxGeometry(0.1, 0.1, 1.56), C.dark, [0, 1.88, 0], [0, 0, 0], cg);
  // chimney
  add(new THREE.BoxGeometry(0.24, 0.65, 0.24), C.brick, [0.5, 1.6, -0.35], [0, 0, 0], cg);
  add(new THREE.BoxGeometry(0.3, 0.07, 0.3), C.dark, [0.5, 1.95, -0.35], [0, 0, 0], cg);
  // door
  add(new THREE.BoxGeometry(0.46, 0.78, 0.05), C.white, [-0.4, 0.55, 0.66], [0, 0, 0], cg);
  add(new THREE.BoxGeometry(0.38, 0.72, 0.07), C.blueDoor, [-0.4, 0.53, 0.67], [0, 0, 0], cg);
  add(new THREE.SphereGeometry(0.03, 5, 4), C.gold, [-0.28, 0.55, 0.72], [0, 0, 0], cg);
  add(new THREE.BoxGeometry(0.6, 0.06, 0.25), C.stone2, [-0.4, 0.2, 0.78], [0, 0, 0], cg);
  // windows
  const cWin = (pos: V, ry: number) => {
    const w = new THREE.Group();
    w.position.set(pos[0], pos[1], pos[2]);
    w.rotation.y = ry;
    cg.add(w);
    add(new THREE.BoxGeometry(0.42, 0.4, 0.05), C.white, [0, 0, 0], [0, 0, 0], w);
    add(new THREE.BoxGeometry(0.32, 0.3, 0.07), C.pane, [0, 0, 0], [0, 0, 0], w);
    add(new THREE.BoxGeometry(0.03, 0.3, 0.08), C.white, [0, 0, 0.005], [0, 0, 0], w);
    add(new THREE.BoxGeometry(0.32, 0.03, 0.08), C.white, [0, 0, 0.005], [0, 0, 0], w);
    for (const sx of [-1, 1]) add(new THREE.BoxGeometry(0.12, 0.4, 0.04), C.blueDoor, [0.28 * sx, 0, 0.01], [0, 0, 0], w);
    // flower box
    add(new THREE.BoxGeometry(0.44, 0.09, 0.12), C.wood2, [0, -0.25, 0.06], [0, 0, 0], w);
    for (let i = 0; i < 5; i++) {
      add(new THREE.IcosahedronGeometry(0.045, 0), i % 2 ? C.pink : C.yellow, [-0.16 + i * 0.08, -0.18, 0.07], [0, 0, 0], w);
    }
  };
  cWin([0.42, 0.68, 0.66], 0);
  cWin([0.91, 0.68, 0], Math.PI / 2);
  cWin([-0.91, 0.68, 0], -Math.PI / 2);
  // round gable window
  add(new THREE.CylinderGeometry(0.15, 0.15, 0.06, 8), C.white, [0, 1.38, 0.66], [Math.PI / 2, 0, 0], cg);
  add(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 8), C.pane, [0, 1.38, 0.66], [Math.PI / 2, 0, 0], cg);
  // lifebuoy
  for (let k = 0; k < 4; k++) {
    add(new THREE.TorusGeometry(0.13, 0.04, 4, 4, Math.PI / 2), k % 2 ? C.white : C.red, [0.05, 0.62, 0.69], [0, 0, (k * Math.PI) / 2], cg);
  }
  gull(cg, [0.2, 1.91, 0.3], 1.2, 0.85);

  // ================= PINES =================
  const pine = (x: number, z: number, s: number) => {
    const g = new THREE.Group();
    g.position.set(x, 1.68, z);
    g.scale.setScalar(s);
    g.rotation.y = rand() * 3;
    world.add(g);
    add(new THREE.CylinderGeometry(0.08, 0.11, 0.5, 5), C.trunk, [0, 0.25, 0], [0, 0, 0], g);
    add(new THREE.ConeGeometry(0.6, 0.8, 6), C.pine, [0, 0.75, 0], [0, 0, 0], g);
    add(new THREE.ConeGeometry(0.47, 0.7, 6), C.pine2, [0, 1.15, 0], [0, 0.3, 0], g);
    add(new THREE.ConeGeometry(0.32, 0.6, 6), C.pine, [0, 1.52, 0], [0, 0.1, 0], g);
  };
  pine(-2.6, 1.2, 1.1);
  pine(-2.1, -2.5, 1.3);
  pine(-2.95, -1.3, 0.85);
  pine(2.3, -2.0, 1.0);

  // bushes
  for (const p of [[-1.7, 0.5], [1.0, 2.4], [2.9, -0.8], [0.9, -1.7]] as number[][]) {
    add(new THREE.IcosahedronGeometry(0.3, 0), C.pine2, [p[0], 1.8, p[1]], [rand(), rand(), 0], world, [1, 0.8, 1]);
  }

  // flowers & tufts
  const tower2 = (x: number, z: number) => Math.hypot(x - T.x, z - T.z) > 1.75 && Math.hypot(x - 1.9, z - 1.0) > 1.35;
  let placed = 0;
  for (let i = 0; i < 80 && placed < 34; i++) {
    const a = range(0, Math.PI * 2), r = range(1.2, 3.5);
    const x = Math.sin(a) * r, z = Math.cos(a) * r;
    if (!tower2(x, z)) continue;
    placed++;
    if (placed % 3 === 0) {
      add(new THREE.ConeGeometry(0.06, 0.2, 4), C.grass2, [x, 1.8, z], [0, rand(), 0]);
    } else {
      const col = [C.pink, C.yellow, C.white][placed % 3 === 1 ? (rand() < 0.5 ? 0 : 1) : 2];
      add(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 3), C.pine, [x, 1.79, z]);
      add(new THREE.IcosahedronGeometry(0.045, 0), col, [x, 1.87, z]);
    }
  }

  // stepping-stone path from lighthouse door to the dock stairs
  const p0 = new THREE.Vector3(T.x, 1.74, T.z + 2.1);
  const p1 = new THREE.Vector3(-1.6, 1.74, 3.5);
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const p = p0.clone().lerp(p1, t);
    p.x += Math.sin(t * Math.PI) * 0.35;
    add(new THREE.CylinderGeometry(0.22, 0.24, 0.07, 7), C.stone2, [p.x, p.y, p.z], [0, rand() * 2, 0]);
  }

  // ================= DOCK =================
  const dx = -1.6;
  for (let i = 0; i < 4; i++) {
    add(new THREE.BoxGeometry(1.0, 0.12, 0.38), i % 2 ? C.wood2 : C.wood, [dx, 1.6 - i * 0.24, 3.78 + i * 0.17]);
  }
  let pi = 0;
  for (let z = 4.3; z <= 6.75; z += 0.3, pi++) {
    add(new THREE.BoxGeometry(1.1, 0.07, 0.26), pi % 2 ? C.wood2 : C.wood, [dx, 0.8, z], [0, (rand() - 0.5) * 0.04, 0]);
  }
  for (const sx of [-0.45, 0.45]) add(new THREE.BoxGeometry(0.08, 0.1, 2.6), C.woodDark, [dx + sx, 0.72, 5.5]);
  for (const z of [4.4, 5.5, 6.65]) {
    for (const sx of [-0.58, 0.58]) {
      add(new THREE.CylinderGeometry(0.07, 0.08, 0.8, 6), C.woodDark, [dx + sx, 0.52, z]);
      add(new THREE.CylinderGeometry(0.075, 0.075, 0.04, 6), C.stone2, [dx + sx, 0.93, z]);
    }
  }
  // rope coil, barrel, crate, lantern post
  add(new THREE.TorusGeometry(0.13, 0.04, 4, 10), "#d9c08a", [dx + 0.25, 0.86, 4.7], [Math.PI / 2, 0, 0]);
  add(new THREE.TorusGeometry(0.07, 0.035, 4, 8), "#d9c08a", [dx + 0.25, 0.9, 4.7], [Math.PI / 2, 0, 0]);
  add(new THREE.CylinderGeometry(0.17, 0.15, 0.42, 8), C.wood2, [dx - 0.25, 1.05, 6.35]);
  for (const yy of [0.92, 1.18]) add(new THREE.TorusGeometry(0.17, 0.02, 3, 8), C.dark, [dx - 0.25, yy, 6.35], [Math.PI / 2, 0, 0]);
  add(new THREE.BoxGeometry(0.32, 0.32, 0.32), C.wood, [dx - 0.28, 1.0, 5.9], [0, 0.3, 0]);
  add(new THREE.BoxGeometry(0.34, 0.04, 0.04), C.woodDark, [dx - 0.28, 1.0, 5.9], [0, 0.3, 0.78]);
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 4), C.dark, [dx + 0.58, 1.38, 6.65]);
  add(new THREE.BoxGeometry(0.12, 0.16, 0.12), lampMat, [dx + 0.58, 1.9, 6.65]);
  add(new THREE.ConeGeometry(0.11, 0.1, 4), C.dark, [dx + 0.58, 2.03, 6.65], [0, Math.PI / 4, 0]);
  gull(world, [dx - 0.58, 0.95, 4.4], -0.8, 0.85);

  // ================= BOAT =================
  {
    const bg = new THREE.Group();
    bg.position.set(-0.35, 0.4, 5.6);
    bg.rotation.y = -0.2;
    world.add(bg);
    add(new THREE.BoxGeometry(0.8, 0.3, 1.3), C.white, [0, 0.1, 0], [0, 0, 0], bg);
    add(new THREE.BoxGeometry(0.82, 0.08, 1.32), C.boatBlue, [0, 0.21, 0], [0, 0, 0], bg);
    const bow = new THREE.ConeGeometry(0.4, 0.6, 4);
    bow.rotateY(Math.PI / 4);
    bow.scale(1.414, 1, 0.53);
    bow.rotateX(Math.PI / 2);
    add(bow, C.white, [0, 0.1, 0.95], [0, 0, 0], bg);
    add(new THREE.BoxGeometry(0.66, 0.12, 1.14), C.wood2, [0, 0.2, 0], [0, 0, 0], bg);
    add(new THREE.BoxGeometry(0.7, 0.05, 0.22), C.wood, [0, 0.27, 0.15], [0, 0, 0], bg);
    add(new THREE.BoxGeometry(0.7, 0.05, 0.2), C.wood, [0, 0.27, -0.42], [0, 0, 0], bg);
    for (const sx of [-1, 1]) {
      add(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 4), C.wood, [0.32 * sx, 0.32, 0.1], [Math.PI / 2 - 0.15, 0, 0.12 * sx], bg);
      add(new THREE.BoxGeometry(0.1, 0.02, 0.25), C.wood, [0.38 * sx, 0.24, 0.66], [0.15, 0, 0], bg);
    }
    // little red pennant number plate
    add(new THREE.BoxGeometry(0.02, 0.1, 0.25), C.red, [0.415, 0.1, -0.3], [0, 0, 0], bg);
  }

  // ================= FLAGPOLE =================
  {
    const fx = 2.9, fz = 2.0;
    add(new THREE.CylinderGeometry(0.035, 0.045, 2.2, 5), C.white, [fx, 1.7 + 1.1, fz]);
    add(new THREE.SphereGeometry(0.06, 6, 4), C.gold, [fx, 3.83, fz]);
    const s = new THREE.Shape();
    s.moveTo(0, 0.2); s.lineTo(0.7, 0.05); s.lineTo(0.55, 0); s.lineTo(0.7, -0.05); s.lineTo(0, -0.2); s.lineTo(0, 0.2);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: false });
    g.translate(0, 0, -0.01);
    add(g, C.red, [fx + 0.03, 3.55, fz], [0, -0.6, 0]);
    const s2 = new THREE.Shape();
    s2.moveTo(0, 0.07); s2.lineTo(0.5, 0.02); s2.lineTo(0.5, -0.02); s2.lineTo(0, -0.07); s2.lineTo(0, 0.07);
    const g2 = new THREE.ExtrudeGeometry(s2, { depth: 0.03, bevelEnabled: false });
    g2.translate(0, 0, -0.015);
    add(g2, C.white, [fx + 0.03, 3.55, fz], [0, -0.6, 0]);
    add(new THREE.CylinderGeometry(0.15, 0.18, 0.1, 6), C.stone, [fx, 1.75, fz]);
  }

  // gull on a shore rock
  add(new THREE.DodecahedronGeometry(0.42, 0), C.rock2, [3.6, 0.45, 3.6], [0.3, 0.5, 0], world, [1, 0.7, 1]);
  gull(world, [3.6, 0.68, 3.6], 0.6, 0.9);

  return b.root;
}
```