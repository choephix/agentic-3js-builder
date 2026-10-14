import * as THREE from "three";

export const meta = {
  name: "Tidewater Light",
  description:
    "A cosy lighthouse diorama on a round display base: a red-and-white striped tower with a glowing lantern room and iron gallery, a keeper's cottage with a crooked chimney and blue door, a wooden jetty with a yellow rowboat, two seagulls, and grass and wildflowers on a tiny rocky island in turquoise water.",
};

type V3 = [number, number, number];

function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function part(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  p: V3 = [0, 0, 0],
  r: V3 = [0, 0, 0],
  s: V3 = [1, 1, 1]
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(p[0], p[1], p[2]);
  m.rotation.set(r[0], r[1], r[2]);
  m.scale.set(s[0], s[1], s[2]);
  parent.add(m);
  return m;
}

// a thin cylinder between two points
function strut(parent: THREE.Object3D, a: V3, b: V3, radius: number, mat: THREE.Material): THREE.Mesh {
  const from = new THREE.Vector3(a[0], a[1], a[2]);
  const to = new THREE.Vector3(b[0], b[1], b[2]);
  const dir = to.clone().sub(from);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, dir.length(), 4), mat);
  m.position.copy(from).add(to).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  parent.add(m);
  return m;
}

function canvasTexture(
  w: number,
  h: number,
  draw: (g: CanvasRenderingContext2D, w: number, h: number) => void
): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d");
  if (!g) return null;
  draw(g, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Seam-safe radial jitter: offsets are looked up per radial segment, so the
// duplicated seam vertices of a CylinderGeometry move together.
function jitterRadial(geo: THREE.BufferGeometry, segs: number, amp: number, lift: number, rnd: () => number): void {
  const radial: number[] = [];
  const up: number[] = [];
  for (let i = 0; i < segs; i++) {
    radial.push(1 + (rnd() * 2 - 1) * amp);
    up.push((rnd() * 2 - 1) * lift);
  }
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  const step = (Math.PI * 2) / segs;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (Math.hypot(x, z) < 1e-5) continue;
    let k = Math.round(Math.atan2(x, z) / step) % segs;
    if (k < 0) k += segs;
    const f = radial[k];
    pos.setXYZ(i, x * f, y > 0 ? y + up[k] : y, z * f);
  }
  geo.computeVertexNormals();
}

// a window set into a wall whose outward normal is +Z; zs is the wall surface
function frontWindow(
  parent: THREE.Object3D,
  x: number,
  y: number,
  zs: number,
  w: number,
  h: number,
  glass: THREE.Material,
  frame: THREE.Material
): void {
  part(parent, new THREE.BoxGeometry(w + 0.012, h + 0.012, 0.008), frame, [x, y, zs + 0.004]);
  part(parent, new THREE.BoxGeometry(w, h, 0.006), glass, [x, y, zs + 0.011]);
  part(parent, new THREE.BoxGeometry(w, 0.0035, 0.004), frame, [x, y, zs + 0.016]);
  part(parent, new THREE.BoxGeometry(0.0035, h, 0.004), frame, [x, y, zs + 0.016]);
}

export default function buildTidewaterLight(): THREE.Object3D {
  const rnd = seeded(20417);
  const rr = (a: number, b: number): number => a + (b - a) * rnd();
  const pick = <T>(list: T[]): T => list[Math.floor(rnd() * list.length)];

  // layout (metres, +Z is the front, +X is the model's left)
  const ISL_Z = -0.12; // island centre
  const GRASS_Y = 0.285; // top of the island's grass
  const WATER_Y = 0.12;
  const TZ = -0.28; // lighthouse centre
  const CX = 0.27; // keeper's cottage centre
  const CZ = -0.06;
  const JX = -0.12; // jetty centre
  const JY = 0.225; // jetty deck height

  const std = (color: number, o: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o });

  // canvas-drawn water and a small brass-trimmed plaque
  const wr = seeded(77);
  const waterMap = canvasTexture(256, 256, (g, w, h) => {
    const grad = g.createRadialGradient(w / 2, h / 2, w * 0.08, w / 2, h / 2, w * 0.72);
    grad.addColorStop(0, "#56e6d8");
    grad.addColorStop(1, "#1fb0b2");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    g.lineCap = "round";
    for (let i = 0; i < 28; i++) {
      g.strokeStyle = `rgba(255,255,255,${(0.1 + wr() * 0.14).toFixed(3)})`;
      g.lineWidth = 2 + wr() * 2;
      g.beginPath();
      g.arc(wr() * w, wr() * h, 6 + wr() * 18, 0.2, 2.5);
      g.stroke();
    }
  });
  const plaqueMap = canvasTexture(512, 128, (g, w, h) => {
    g.fillStyle = "#5b3a24";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#d9b25c";
    g.lineWidth = 10;
    g.strokeRect(14, 14, w - 28, h - 28);
    g.fillStyle = "#f6e7c1";
    g.font = "bold 44px Georgia, serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("TIDEWATER LIGHT", w / 2, h / 2 + 2);
  });

  const C = {
    base: std(0x8b5a33),
    brass: std(0xd1a84e, { roughness: 0.35, metalness: 0.7 }),
    darkWood: std(0x4a2e1c),
    plaque: std(waterMap && plaqueMap ? 0xffffff : 0x5b3a24, { map: plaqueMap }),
    water: std(waterMap ? 0xffffff : 0x3cc9c0, { map: waterMap, roughness: 0.25 }),
    shallow: std(0x8ff0e3, { transparent: true, opacity: 0.5, depthWrite: false }),
    foam: std(0xf8fdfc, { roughness: 0.6 }),
    rock: std(0x8d96a4, { flatShading: true }),
    rockDark: std(0x687182, { flatShading: true }),
    rockLight: std(0xb3bbc6, { flatShading: true }),
    grass: std(0x6cb94a, { flatShading: true }),
    grassDeep: std(0x4a9a3a, { flatShading: true }),
    grassLite: std(0x9ad463, { flatShading: true }),
    stem: std(0x3f8c3a),
    pinkPetal: std(0xff7fb0),
    yellowPetal: std(0xffd54a),
    whitePetal: std(0xfff7ec),
    lilacPetal: std(0xb98cff),
    flowerCore: std(0xf5a524),
    cream: std(0xf5ecd6),
    roofRed: std(0x9b3b2f),
    lanternRoof: std(0x7d2629),
    blueDoor: std(0x2f6fb3),
    brick: std(0xad5a43),
    chimneyCap: std(0x3a3d46),
    stripeRed: std(0xd93b3f),
    stripeWhite: std(0xf7f3ea),
    iron: std(0x2a2d33, { roughness: 0.5, metalness: 0.4 }),
    doorDark: std(0x3b2a22),
    glassDark: std(0x2b4256, { roughness: 0.2 }),
    stone: std(0xc2b9a6),
    cottageGlow: std(0xffdf93, { emissive: 0xffb94a, emissiveIntensity: 0.9 }),
    lanternGlass: new THREE.MeshStandardMaterial({
      color: 0xfff3c4,
      emissive: 0xffc94d,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
    }),
    lightBeam: new THREE.MeshStandardMaterial({
      color: 0xfff1b0,
      emissive: 0xfff1b0,
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    halo: new THREE.MeshStandardMaterial({
      color: 0xffe7a0,
      emissive: 0xffd66a,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    }),
    gold: std(0xf2c14e, { roughness: 0.35, metalness: 0.5 }),
    plank: std(0xa8764a),
    plankLight: std(0xc08d58),
    hull: std(0xf2b134, { roughness: 0.55 }),
    hullInside: std(0x7a4a26),
    oar: std(0xead7a6),
    rope: std(0xd6bd84),
    buoyRed: std(0xe0432f),
    buoyWhite: std(0xf5f5f0),
    gullWhite: std(0xf7f9fb),
    gullGrey: std(0xaebccb),
    gullTip: std(0x1f2630),
    beak: std(0xf29a2e),
    eyeBlack: std(0x101418),
    smoke: std(0xeef2f5, { roughness: 1, transparent: true, opacity: 0.8 }),
  };

  const root = new THREE.Group();
  root.name = "tidewater-light";

  // ---------------- round display base, water and foam ----------------
  part(root, new THREE.CylinderGeometry(0.76, 0.8, 0.1, 28), C.base, [0, 0.05, 0]);
  part(root, new THREE.CylinderGeometry(0.812, 0.812, 0.014, 28), C.darkWood, [0, 0.007, 0]);
  part(root, new THREE.TorusGeometry(0.762, 0.011, 6, 28), C.brass, [0, 0.1, 0], [Math.PI / 2, 0, 0]);
  part(root, new THREE.PlaneGeometry(0.16, 0.04), C.plaque, [0, 0.05, 0.783]);

  part(root, new THREE.CylinderGeometry(0.745, 0.745, 0.02, 28), C.water, [0, WATER_Y - 0.01, 0]);
  part(root, new THREE.CylinderGeometry(0.6, 0.62, 0.004, 24), C.shallow, [0, WATER_Y + 0.0015, ISL_Z]);

  const foamGeo = new THREE.SphereGeometry(1, 6, 4);
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * Math.PI * 2 + rr(-0.04, 0.04);
    const rad = rr(0.5, 0.56);
    const s = rr(0.02, 0.036);
    part(
      root,
      foamGeo,
      C.foam,
      [Math.sin(a) * rad, WATER_Y + 0.003, ISL_Z + Math.cos(a) * rad],
      [0, rr(0, 3), 0],
      [s * 1.5, s * 0.3, s]
    );
  }

  // ---------------- tiny rocky island ----------------
  const rockGeo = new THREE.CylinderGeometry(0.43, 0.5, 0.17, 14, 2);
  jitterRadial(rockGeo, 14, 0.14, 0, rnd);
  part(root, rockGeo, C.rock, [0, 0.185, ISL_Z]);

  const capGeo = new THREE.CylinderGeometry(0.44, 0.46, 0.03, 14, 1);
  jitterRadial(capGeo, 14, 0.07, 0.012, rnd);
  part(root, capGeo, C.grass, [0, 0.27, ISL_Z]);

  const boulderGeo = new THREE.DodecahedronGeometry(0.04, 0);
  const rockMats = [C.rock, C.rockDark, C.rockLight];
  const boulder = (x: number, y: number, z: number, size: number): void => {
    part(
      root,
      boulderGeo,
      pick(rockMats),
      [x, y, z],
      [rr(0, 3), rr(0, 3), rr(0, 3)],
      [size * rr(0.9, 1.3), size * rr(0.6, 0.9), size * rr(0.9, 1.2)]
    );
  };

  // boulders along the waterline (kept clear of the jetty)
  for (let i = 0; i < 15; i++) {
    const a = rr(0, Math.PI * 2);
    const rad = rr(0.44, 0.5);
    const x = Math.sin(a) * rad;
    const z = ISL_Z + Math.cos(a) * rad;
    if (x > -0.22 && x < -0.02 && z > 0.2) continue;
    boulder(x, 0.125 + rr(0, 0.02), z, rr(0.7, 1.2) * 0.045);
  }

  // free ground on the island top (not inside tower, cottage or jetty areas)
  const freeSpot = (x: number, z: number): boolean => {
    if (Math.hypot(x, z - ISL_Z) > 0.37) return false;
    if (Math.hypot(x, z - TZ) < 0.19) return false;
    if (x > 0.1 && x < 0.44 && z > -0.22 && z < 0.1) return false;
    if (x > -0.22 && x < -0.02 && z > 0.12) return false;
    return true;
  };

  let tries = 0;
  let placed = 0;
  while (placed < 5 && tries++ < 400) {
    const x = rr(-0.36, 0.36);
    const z = ISL_Z + rr(-0.36, 0.36);
    if (!freeSpot(x, z)) continue;
    boulder(x, GRASS_Y - 0.008, z, rr(0.5, 0.9) * 0.05);
    placed++;
  }

  // grass tufts
  const bladeGeo = new THREE.ConeGeometry(0.0055, 1, 3, 1);
  const tuftMats = [C.grass, C.grassDeep, C.grassLite];
  tries = 0;
  placed = 0;
  while (placed < 26 && tries++ < 1000) {
    const x = rr(-0.4, 0.4);
    const z = ISL_Z + rr(-0.4, 0.4);
    if (!freeSpot(x, z)) continue;
    placed++;
    const tuft = new THREE.Group();
    tuft.position.set(x, GRASS_Y - 0.004, z);
    root.add(tuft);
    const blades = 4 + Math.floor(rnd() * 4);
    for (let k = 0; k < blades; k++) {
      const h = rr(0.03, 0.068);
      const lean = new THREE.Group();
      lean.position.set(rr(-0.008, 0.008), 0, rr(-0.008, 0.008));
      lean.rotation.set(rr(-0.4, 0.4), rr(0, Math.PI * 2), rr(-0.4, 0.4));
      tuft.add(lean);
      part(lean, bladeGeo, pick(tuftMats), [0, h / 2, 0], [0, 0, 0], [1, h, 1]);
    }
  }

  // wildflowers: stem, five-sided head, tiny centre
  const petalMats = [C.pinkPetal, C.yellowPetal, C.whitePetal, C.lilacPetal];
  const headGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.004, 5);
  const coreGeo = new THREE.SphereGeometry(0.0045, 5, 4);
  const stemGeo = new THREE.CylinderGeometry(0.0018, 0.0018, 1, 4);
  tries = 0;
  placed = 0;
  while (placed < 22 && tries++ < 1000) {
    const x = rr(-0.38, 0.38);
    const z = ISL_Z + rr(-0.38, 0.38);
    if (!freeSpot(x, z)) continue;
    placed++;
    const h = rr(0.05, 0.09);
    const f = new THREE.Group();
    f.position.set(x, GRASS_Y - 0.004, z);
    f.rotation.set(rr(-0.15, 0.15), rr(0, Math.PI * 2), rr(-0.15, 0.15));
    root.add(f);
    part(f, stemGeo, C.stem, [0, h / 2, 0], [0, 0, 0], [1, h, 1]);
    part(f, headGeo, pick(petalMats), [0, h + 0.002, 0], [rr(-0.3, 0.3), 0, rr(-0.3, 0.3)]);
    part(f, coreGeo, C.flowerCore, [0, h + 0.005, 0]);
  }

  // ---------------- lighthouse ----------------
  const T0 = 0.27;
  const T1 = 1.17;
  const towerR = (y: number): number => 0.125 - ((y - T0) / (T1 - T0)) * 0.04;
  const bands = 6;
  const bandH = (T1 - T0) / bands;
  for (let i = 0; i < bands; i++) {
    const y0 = T0 + i * bandH;
    const y1 = y0 + bandH;
    part(
      root,
      new THREE.CylinderGeometry(towerR(y1), towerR(y0), bandH, 14),
      i % 2 === 0 ? C.stripeRed : C.stripeWhite,
      [0, (y0 + y1) / 2, TZ]
    );
  }

  // door, step and windows
  part(root, new THREE.BoxGeometry(0.056, 0.086, 0.02), C.cream, [0, GRASS_Y + 0.043, TZ + 0.118]);
  part(root, new THREE.BoxGeometry(0.04, 0.074, 0.024), C.doorDark, [0, GRASS_Y + 0.037, TZ + 0.124]);
  part(root, new THREE.BoxGeometry(0.07, 0.012, 0.03), C.stone, [0, GRASS_Y + 0.006, TZ + 0.15]);
  frontWindow(root, 0, 0.66, TZ + towerR(0.66), 0.03, 0.044, C.glassDark, C.cream);
  frontWindow(root, 0, 0.96, TZ + towerR(0.96), 0.03, 0.044, C.glassDark, C.cream);

  // black iron gallery
  const GY = T1;
  part(root, new THREE.CylinderGeometry(0.118, 0.12, 0.02, 14), C.iron, [0, GY + 0.01, TZ]);
  const postGeo = new THREE.CylinderGeometry(0.0045, 0.0045, 0.05, 4);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    part(root, postGeo, C.iron, [Math.sin(a) * 0.108, GY + 0.045, TZ + Math.cos(a) * 0.108]);
  }
  part(root, new THREE.TorusGeometry(0.108, 0.0045, 4, 24), C.iron, [0, GY + 0.07, TZ], [Math.PI / 2, 0, 0]);

  // glowing lantern room
  part(root, new THREE.CylinderGeometry(0.095, 0.095, 0.014, 12), C.iron, [0, GY + 0.027, TZ]);
  part(root, new THREE.CylinderGeometry(0.088, 0.088, 0.11, 12, 1, true), C.lanternGlass, [0, GY + 0.089, TZ]);
  const mullionGeo = new THREE.BoxGeometry(0.009, 0.11, 0.009);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    part(root, mullionGeo, C.iron, [Math.sin(a) * 0.089, GY + 0.089, TZ + Math.cos(a) * 0.089], [0, a, 0]);
  }
  part(root, new THREE.CylinderGeometry(0.1, 0.1, 0.012, 12), C.iron, [0, GY + 0.15, TZ]);
  part(root, new THREE.ConeGeometry(0.115, 0.07, 8, 1), C.lanternRoof, [0, GY + 0.191, TZ]);
  part(root, new THREE.SphereGeometry(0.013, 8, 6), C.gold, [0, GY + 0.232, TZ]);
  part(root, new THREE.SphereGeometry(0.15, 12, 8), C.halo, [0, GY + 0.089, TZ]);

  // sweeping light beam, pointing out to the model's left
  part(
    root,
    new THREE.ConeGeometry(0.11, 0.6, 16, 1, true),
    C.lightBeam,
    [0.3, GY + 0.089, TZ],
    [0, 0, Math.PI / 2]
  );

  // ---------------- keeper's cottage ----------------
  const CB = GRASS_Y - 0.012; // walls sit just inside the grass
  const WT = CB + 0.12; // wall top
  const RISE = 0.1;
  const RUN = 0.12;
  const ang = Math.atan2(RISE, RUN);
  const roofT = 0.018;

  part(root, new THREE.BoxGeometry(0.2, 0.12, 0.16), C.cream, [CX, CB + 0.06, CZ]);

  const roofGeo = new THREE.BoxGeometry(Math.hypot(RUN, RISE) + 0.012, roofT, 0.22);
  const roofX = RUN / 2 + (Math.sin(ang) * roofT) / 2;
  const roofY = WT + RISE / 2 + (Math.cos(ang) * roofT) / 2;
  part(root, roofGeo, C.roofRed, [CX + roofX, roofY, CZ], [0, 0, -ang]);
  part(root, roofGeo, C.roofRed, [CX - roofX, roofY, CZ], [0, 0, ang]);

  // gable ends, shaped to meet the roof underside
  const gy = RISE * (1 - 0.1 / RUN);
  const gable = new THREE.Shape();
  gable.moveTo(-0.1, 0);
  gable.lineTo(0.1, 0);
  gable.lineTo(0.1, gy);
  gable.lineTo(0, RISE);
  gable.lineTo(-0.1, gy);
  gable.closePath();
  const gableGeo = new THREE.ExtrudeGeometry(gable, { depth: 0.012, bevelEnabled: false });
  part(root, gableGeo, C.cream, [CX, WT - 0.002, CZ + 0.08]);
  part(root, gableGeo, C.cream, [CX, WT - 0.002, CZ - 0.08], [0, Math.PI, 0]);

  // crooked chimney with a little smoke
  const chimney = new THREE.Group();
  chimney.position.set(CX + 0.05, WT + 0.02, CZ - 0.04);
  chimney.rotation.z = -0.18;
  root.add(chimney);
  part(chimney, new THREE.BoxGeometry(0.034, 0.16, 0.034), C.brick, [0, 0.08, 0]);
  part(chimney, new THREE.BoxGeometry(0.044, 0.014, 0.044), C.chimneyCap, [0, 0.167, 0]);
  part(root, new THREE.SphereGeometry(0.024, 7, 5), C.smoke, [CX + 0.085, 0.63, CZ - 0.04]);
  part(root, new THREE.SphereGeometry(0.034, 7, 5), C.smoke, [CX + 0.115, 0.675, CZ - 0.035]);
  part(root, new THREE.SphereGeometry(0.045, 7, 5), C.smoke, [CX + 0.15, 0.73, CZ - 0.03]);

  // front: door, awning, step and two warm windows
  part(root, new THREE.BoxGeometry(0.052, 0.082, 0.006), C.cream, [CX, CB + 0.041, CZ + 0.083]);
  part(root, new THREE.BoxGeometry(0.04, 0.072, 0.008), C.blueDoor, [CX, CB + 0.036, CZ + 0.088]);
  part(root, new THREE.BoxGeometry(0.07, 0.007, 0.034), C.roofRed, [CX, CB + 0.09, CZ + 0.097]);
  part(root, new THREE.BoxGeometry(0.07, 0.012, 0.03), C.stone, [CX, CB + 0.006, CZ + 0.108]);
  frontWindow(root, CX - 0.062, CB + 0.06, CZ + 0.08, 0.036, 0.04, C.cottageGlow, C.cream);
  frontWindow(root, CX + 0.062, CB + 0.06, CZ + 0.08, 0.036, 0.04, C.cottageGlow, C.cream);

  // side window on the +X wall
  const sideWin = new THREE.Group();
  sideWin.position.set(CX + 0.1, CB + 0.06, CZ);
  sideWin.rotation.y = Math.PI / 2;
  root.add(sideWin);
  frontWindow(sideWin, 0, 0, 0, 0.034, 0.04, C.cottageGlow, C.cream);

  // ---------------- jetty and rowboat ----------------
  for (let i = 0, z = 0.22; z <= 0.665; i++, z += 0.036) {
    part(root, new THREE.BoxGeometry(0.11, 0.012, 0.034), i % 2 === 0 ? C.plank : C.plankLight, [JX, JY, z]);
  }
  const pileGeo = new THREE.CylinderGeometry(0.009, 0.011, 0.135, 6);
  for (const px of [-0.16, -0.08]) {
    for (const pz of [0.38, 0.6]) {
      part(root, pileGeo, C.darkWood, [px, 0.165, pz]);
    }
  }
  part(root, new THREE.BoxGeometry(0.012, 0.014, 0.03), C.iron, [-0.168, 0.238, 0.5]);
  part(root, new THREE.CylinderGeometry(0.011, 0.012, 0.016, 8), C.iron, [JX, 0.239, 0.655]);

  // rowboat, tied alongside
  const boatShape = new THREE.Shape();
  boatShape.moveTo(-0.1, -0.04);
  boatShape.lineTo(-0.1, 0.04);
  boatShape.quadraticCurveTo(0.02, 0.058, 0.12, 0);
  boatShape.quadraticCurveTo(0.02, -0.058, -0.1, -0.04);
  const hullGeo = new THREE.ExtrudeGeometry(boatShape, {
    depth: 0.045,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.01,
    bevelSegments: 2,
    curveSegments: 6,
  });
  hullGeo.rotateX(-Math.PI / 2);

  const boat = new THREE.Group();
  boat.position.set(-0.255, WATER_Y - 0.008, 0.5);
  boat.rotation.y = -Math.PI / 2 + 0.15;
  root.add(boat);

  part(boat, hullGeo, C.hull, [0, 0, 0]);

  const innerShape = new THREE.Shape();
  innerShape.moveTo(-0.08, -0.024);
  innerShape.lineTo(-0.08, 0.024);
  innerShape.quadraticCurveTo(0.01, 0.036, 0.09, 0);
  innerShape.quadraticCurveTo(0.01, -0.036, -0.08, -0.024);
  const innerGeo = new THREE.ExtrudeGeometry(innerShape, { depth: 0.009, bevelEnabled: false, curveSegments: 4 });
  innerGeo.rotateX(-Math.PI / 2);
  part(boat, innerGeo, C.hullInside, [0, 0.055, 0]);

  part(boat, new THREE.BoxGeometry(0.02, 0.012, 0.078), C.plankLight, [-0.025, 0.07, 0]);
  part(boat, new THREE.BoxGeometry(0.02, 0.012, 0.044), C.plankLight, [0.05, 0.07, 0]);
  part(boat, new THREE.BoxGeometry(0.24, 0.006, 0.006), C.oar, [-0.02, 0.08, 0.024]);
  part(boat, new THREE.BoxGeometry(0.03, 0.003, 0.024), C.oar, [0.115, 0.08, 0.024]);

  // mooring rope to a cleat on the jetty
  strut(root, [-0.215, 0.168, 0.5], [-0.168, 0.244, 0.5], 0.0022, C.rope);

  // little buoy floating nearby
  part(root, new THREE.CylinderGeometry(0.016, 0.016, 0.028, 8), C.buoyRed, [-0.42, 0.134, 0.26]);
  part(root, new THREE.CylinderGeometry(0.017, 0.017, 0.01, 8), C.buoyWhite, [-0.42, 0.153, 0.26]);
  part(root, new THREE.ConeGeometry(0.008, 0.03, 6), C.buoyRed, [-0.42, 0.173, 0.26]);

  // ---------------- seagulls ----------------
  const seagull = (x: number, y: number, z: number, yaw: number, scale: number): void => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = yaw;
    g.scale.setScalar(scale);
    root.add(g);
    const legGeo = new THREE.CylinderGeometry(0.0022, 0.0022, 0.03, 4);
    part(g, legGeo, C.beak, [-0.006, 0.015, 0]);
    part(g, legGeo, C.beak, [0.006, 0.015, 0]);
    part(g, new THREE.SphereGeometry(0.03, 10, 7), C.gullWhite, [0, 0.053, 0], [0, 0, 0], [1, 0.85, 1.7]);
    part(g, new THREE.SphereGeometry(0.018, 8, 6), C.gullWhite, [0, 0.085, 0.036]);
    part(g, new THREE.ConeGeometry(0.0045, 0.03, 4), C.beak, [0, 0.082, 0.06], [Math.PI / 2, 0, 0]);
    const eyeGeo = new THREE.SphereGeometry(0.003, 5, 4);
    part(g, eyeGeo, C.eyeBlack, [-0.011, 0.091, 0.048]);
    part(g, eyeGeo, C.eyeBlack, [0.011, 0.091, 0.048]);
    const wingGeo = new THREE.BoxGeometry(0.014, 0.005, 0.055);
    const tipGeo = new THREE.BoxGeometry(0.0135, 0.0052, 0.03);
    for (const s of [-1, 1]) {
      part(g, wingGeo, C.gullGrey, [s * 0.017, 0.078, -0.0075]);
      part(g, tipGeo, C.gullTip, [s * 0.017, 0.078, -0.05]);
    }
    part(g, new THREE.BoxGeometry(0.026, 0.005, 0.03), C.gullGrey, [0, 0.064, -0.058]);
  };

  // one perched on the cottage ridge, one on the end of the jetty
  seagull(0, WT + RISE + 0.0117 - 0.004, CZ - 0.02, 0, 0.75);
  seagull(-0.1, JY + 0.006, 0.6, -Math.PI / 2, 0.75);

  return root;
}
