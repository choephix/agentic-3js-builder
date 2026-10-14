import * as THREE from "three";

export const meta = {
  name: "Battle-Worn Griffin Knight",
  description:
    "A plate-clad fantasy knight: a great helm with a tall crimson plume, gold-etched layered pauldrons, a deep-blue surcoat bearing a silver griffin, a kite shield, a planted broadsword and a torn crimson cape.",
};

type Draw = (g: CanvasRenderingContext2D, w: number, h: number) => void;
type Rand = () => number;

// ---------- seeded randomness ----------
function mulberry32(seed: number): Rand {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- small helpers ----------
const UP = new THREE.Vector3(0, 1, 0);
const FWD = new THREE.Vector3(0, 0, 1);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const prof = (pts: [number, number][]) => pts.map(([x, y]) => new THREE.Vector2(x, y));

function canvasTexture(w: number, h: number, draw: Draw): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d");
  if (!g) return null;
  draw(g, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function put(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  x: number,
  y: number,
  z: number,
  rx = 0,
  ry = 0,
  rz = 0
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  parent.add(m);
  return m;
}

// Cylinder stretched between two points (limbs, straps).
function limb(
  parent: THREE.Object3D,
  a: THREE.Vector3,
  b: THREE.Vector3,
  r0: number,
  r1: number,
  mat: THREE.Material
): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, 8, 1), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, dir.normalize());
  parent.add(m);
  return m;
}

function alignY(m: THREE.Object3D, dir: THREE.Vector3) {
  m.quaternion.setFromUnitVectors(UP, dir.clone().normalize());
}

// Orient a mesh so its local +Z lies along a surface normal (decals, filigree).
function orientTo(m: THREE.Object3D, n: THREE.Vector3) {
  m.quaternion.setFromUnitVectors(FWD, n.clone().normalize());
}

// Battle damage: push vertices inward around a point (in geometry space).
function dent(geo: THREE.BufferGeometry, c: THREE.Vector3, r: number, depth: number) {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const nor = geo.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const d = Math.hypot(x - c.x, y - c.y, z - c.z) / r;
    if (d >= 1) continue;
    const k = -depth * (1 - d * d);
    pos.setXYZ(i, x + nor.getX(i) * k, y + nor.getY(i) * k, z + nor.getZ(i) * k);
  }
  pos.needsUpdate = true;
}

// Map UVs of a flat-faced extrusion onto 0..1 so a canvas can be painted over it.
function remapUV(geo: THREE.BufferGeometry) {
  geo.computeBoundingBox();
  const bb = geo.boundingBox as THREE.Box3;
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  const w = bb.max.x - bb.min.x;
  const h = bb.max.y - bb.min.y;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) - bb.min.x) / w, (pos.getY(i) - bb.min.y) / h);
  }
  uv.needsUpdate = true;
}

// A flat ribbon strand of plume hair, widths measured along X.
function ribbon(pts: THREE.Vector3[], ws: number[], mat: THREE.Material): THREE.Mesh {
  const p: number[] = [];
  const idx: number[] = [];
  pts.forEach((v, i) => p.push(v.x - ws[i], v.y, v.z, v.x + ws[i], v.y, v.z));
  for (let i = 0; i < pts.length - 1; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    idx.push(a, c, b, b, c, d);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, mat);
}

// Kite shield outline, centred on the origin, 0.56 wide and 0.84 tall at k = 1.
function kite(k: number): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(-0.28 * k, 0.42 * k);
  s.lineTo(0.28 * k, 0.42 * k);
  s.quadraticCurveTo(0.31 * k, 0, 0, -0.42 * k);
  s.quadraticCurveTo(-0.31 * k, 0, -0.28 * k, 0.42 * k);
  return s;
}

// Torn crimson cape: a grid hanging from the shoulders with ragged hem and holes.
function capeGeometry(R: Rand): THREE.BufferGeometry {
  const CW = 12;
  const CH = 14;
  const tear: number[] = [];
  for (let i = 0; i <= CW; i++) tear.push(0.04 + R() * 0.2 + (i % 5 === 2 ? 0.14 : 0));

  const pos: number[] = [];
  const uv: number[] = [];
  for (let j = 0; j <= CH; j++) {
    const v = j / CH;
    for (let i = 0; i <= CW; i++) {
      const u = i / CW;
      const x = (u - 0.5) * (0.46 + 0.06 * v) + Math.sin(v * 5 + u * 3) * 0.015 * v;
      const y = 1.42 - v * 0.96 - tear[i] * Math.pow(v, 2.5);
      const z = -0.17 - 0.03 * Math.sin(u * Math.PI) * v - 0.02 * Math.sin(v * 4 + u * 2) * v;
      pos.push(x, y, z);
      uv.push(u, 1 - v);
    }
  }
  const idx: number[] = [];
  for (let j = 0; j < CH; j++) {
    for (let i = 0; i < CW; i++) {
      if (j > CH * 0.55 && R() < 0.1) continue; // rips in the lower cloth
      const a = j * (CW + 1) + i;
      const b = a + 1;
      const c = a + CW + 1;
      const d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

// ---------- silver griffin, painted on canvas ----------
function griffinPass(g: CanvasRenderingContext2D, fill: string, pad: number) {
  g.fillStyle = fill;
  g.strokeStyle = fill;
  g.lineCap = "round";
  g.lineJoin = "round";
  const edge = () => {
    if (pad > 0) {
      g.lineWidth = pad * 2;
      g.stroke();
    }
  };
  const strut = (x0: number, y0: number, x1: number, y1: number, w: number) => {
    g.beginPath();
    g.moveTo(x0, y0);
    g.lineTo(x1, y1);
    g.lineWidth = w + pad * 2;
    g.stroke();
  };
  const blob = (x: number, y: number, rx: number, ry: number, rot: number) => {
    g.beginPath();
    g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
    g.fill();
    edge();
  };
  const poly = (p: number[]) => {
    g.beginPath();
    g.moveTo(p[0], p[1]);
    for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]);
    g.closePath();
    g.fill();
    edge();
  };

  // raised wing with scalloped trailing feathers
  g.beginPath();
  g.moveTo(0.02, -0.22);
  g.bezierCurveTo(0.22, -0.52, 0.46, -0.78, 0.76, -1.0);
  g.bezierCurveTo(0.66, -0.86, 0.6, -0.74, 0.58, -0.64);
  g.bezierCurveTo(0.5, -0.62, 0.46, -0.54, 0.42, -0.5);
  g.bezierCurveTo(0.36, -0.46, 0.32, -0.38, 0.26, -0.34);
  g.bezierCurveTo(0.18, -0.3, 0.1, -0.26, 0.02, -0.22);
  g.closePath();
  g.fill();
  edge();

  // tail with tuft
  g.beginPath();
  g.moveTo(0.3, 0.14);
  g.quadraticCurveTo(0.64, 0.14, 0.56, 0.46);
  g.lineWidth = 0.07 + pad * 2;
  g.stroke();
  blob(0.56, 0.5, 0.06, 0.09, 0.2);

  // hind legs and haunch
  strut(0.2, 0.34, 0.26, 0.62, 0.13);
  strut(0.06, 0.36, 0.06, 0.62, 0.12);
  blob(0.29, 0.65, 0.08, 0.045, 0);
  blob(0.07, 0.65, 0.08, 0.045, 0);
  blob(0.2, 0.28, 0.16, 0.14, 0);

  // body, neck, head
  blob(0.04, 0.2, 0.3, 0.16, -0.22);
  blob(-0.2, 0.0, 0.14, 0.22, 0.35);
  blob(-0.34, -0.24, 0.15, 0.12, -0.2);

  // raised forelegs with claws
  strut(-0.16, 0.1, -0.42, 0.4, 0.1);
  strut(-0.08, 0.14, -0.3, 0.46, 0.1);
  blob(-0.44, 0.43, 0.07, 0.05, 0);
  blob(-0.31, 0.49, 0.07, 0.05, 0);

  // eagle beak and crest
  poly([-0.44, -0.3, -0.63, -0.32, -0.46, -0.16]);
  poly([-0.27, -0.34, -0.23, -0.55, -0.13, -0.3]);
}

function griffinInk(g: CanvasRenderingContext2D, ink: string) {
  g.fillStyle = ink;
  g.strokeStyle = ink;
  g.lineCap = "round";
  g.lineWidth = 0.022;
  g.beginPath();
  g.moveTo(0.16, -0.36);
  g.quadraticCurveTo(0.38, -0.5, 0.64, -0.82);
  g.stroke();
  g.beginPath();
  g.moveTo(0.26, -0.3);
  g.quadraticCurveTo(0.44, -0.44, 0.58, -0.66);
  g.stroke();
  g.beginPath();
  g.arc(-0.36, -0.27, 0.028, 0, Math.PI * 2);
  g.fill();
  g.lineWidth = 0.016;
  g.beginPath();
  g.moveTo(-0.44, -0.27);
  g.lineTo(-0.57, -0.29);
  g.stroke();
}

function drawGriffin(
  g: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  silver: string,
  ink: string
) {
  g.save();
  // griffin's visual centre (0.06, -0.18) lands on (cx, cy)
  g.setTransform(s, 0, 0, s, cx - 0.06 * s, cy + 0.18 * s);
  griffinPass(g, ink, 0.045);
  griffinPass(g, silver, 0);
  griffinInk(g, ink);
  g.restore();
}

// ---------- the knight ----------
export default function buildGriffinKnight(): THREE.Object3D {
  const rnd = mulberry32(0x7a3c19);
  const R: Rand = () => rnd();
  const root = new THREE.Group();
  root.name = "griffin-knight";

  // ----- canvas-painted surface wear -----
  const scratchLines = (g: CanvasRenderingContext2D, w: number, h: number, count: number, dir: number) => {
    for (let i = 0; i < count; i++) {
      const x = R() * w;
      const y = R() * h;
      const len = 12 + R() * 60;
      const a = dir + (R() - 0.5) * 0.8;
      g.strokeStyle = R() < 0.6 ? "rgba(240,244,250,0.55)" : "rgba(26,24,22,0.5)";
      g.lineWidth = 0.6 + R() * 1.2;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      g.stroke();
    }
  };
  const blowMarks = (g: CanvasRenderingContext2D, w: number, h: number, count: number) => {
    for (let i = 0; i < count; i++) {
      const x = R() * w;
      const y = R() * h;
      const r = 3 + R() * 7;
      g.strokeStyle = "rgba(18,16,14,0.45)";
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.stroke();
      g.strokeStyle = "rgba(255,255,255,0.22)";
      g.beginPath();
      g.arc(x + 1, y + 1, r, 0.2, 2.6);
      g.stroke();
    }
  };
  const grime = (g: CanvasRenderingContext2D, w: number, h: number, count: number, alpha: number) => {
    for (let i = 0; i < count; i++) {
      const x = R() * w;
      const y = R() * h;
      const r = 14 + R() * 46;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(30,24,18,${alpha})`);
      gr.addColorStop(1, "rgba(30,24,18,0)");
      g.fillStyle = gr;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
  };

  const steelTex = canvasTexture(256, 256, (g, w, h) => {
    g.fillStyle = "#b8bec6";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) {
      const v = 150 + Math.floor(R() * 70);
      g.fillStyle = `rgba(${v},${v + 3},${v + 8},0.4)`;
      g.fillRect(R() * w, R() * h, 1 + R() * 2, 1 + R() * 2);
    }
    scratchLines(g, w, h, 110, 0.7);
    blowMarks(g, w, h, 12);
    grime(g, w, h, 10, 0.2);
  });

  const shieldTex = canvasTexture(256, 384, (g, w, h) => {
    const bg = g.createLinearGradient(0, 0, w * 0.5, h);
    bg.addColorStop(0, "#2d55ab");
    bg.addColorStop(1, "#12296a");
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    scratchLines(g, w, h, 90, -0.5);
    blowMarks(g, w, h, 14);
    grime(g, w, h, 10, 0.3);
    drawGriffin(g, w / 2, h / 2, 150, "#e6ebf2", "#0b1430");
  });

  const emblemTex = canvasTexture(256, 256, (g, w, h) => {
    drawGriffin(g, w / 2, h / 2, 140, "#e6ebf2", "#0b1430");
  });

  // ----- materials (one per colour, shared) -----
  const steel = new THREE.MeshStandardMaterial({
    color: steelTex ? 0xffffff : 0xaab1ba,
    map: steelTex,
    metalness: 0.6,
    roughness: 0.42,
    flatShading: true,
  });
  const darkSteel = new THREE.MeshStandardMaterial({ color: 0x4a5059, metalness: 0.6, roughness: 0.5, flatShading: true });
  const blade = new THREE.MeshStandardMaterial({
    color: steelTex ? 0xf2f6fb : 0xdde4ec,
    map: steelTex,
    metalness: 0.7,
    roughness: 0.25,
  });
  const gold = new THREE.MeshStandardMaterial({ color: 0xdba64a, metalness: 0.7, roughness: 0.32 });
  const surcoatMat = new THREE.MeshStandardMaterial({ color: 0x1d3b86, roughness: 0.88 });
  const crimson = new THREE.MeshStandardMaterial({ color: 0x8c1424, roughness: 0.8, side: THREE.DoubleSide });
  const leather = new THREE.MeshStandardMaterial({ color: 0x3a2514, roughness: 0.9 });
  const cloth = new THREE.MeshStandardMaterial({ color: 0x262b36, roughness: 0.95 });
  const black = new THREE.MeshStandardMaterial({ color: 0x060607, roughness: 1 });
  const shieldFace = new THREE.MeshStandardMaterial({
    color: shieldTex ? 0xffffff : 0x1d3b86,
    map: shieldTex,
    roughness: 0.72,
    metalness: 0.1,
  });
  const emblemMat = new THREE.MeshStandardMaterial({ map: emblemTex, alphaTest: 0.5, roughness: 0.4, metalness: 0.3 });

  // ---------- legs and feet ----------
  for (const s of [1, -1]) {
    const x = s * 0.13;

    const cuisseGeo = new THREE.CylinderGeometry(0.09, 0.076, 0.36, 8, 2);
    dent(cuisseGeo, V(0.03, 0.06, 0.07 * s), 0.05, 0.008);
    put(root, cuisseGeo, steel, x, 0.7, 0);

    put(root, new THREE.SphereGeometry(0.078, 8, 6), gold, x, 0.5, 0.03).scale.set(1, 1, 0.8);

    const greaveGeo = new THREE.CylinderGeometry(0.076, 0.062, 0.37, 8, 2);
    dent(greaveGeo, V(-0.03 * s, -0.04, 0.07), 0.05, 0.01);
    dent(greaveGeo, V(0.03 * s, 0.1, 0.07), 0.04, 0.008);
    put(root, greaveGeo, steel, x, 0.285, 0);
    put(root, new THREE.TorusGeometry(0.068, 0.006, 5, 14), gold, x, 0.3, 0, Math.PI / 2);

    put(root, new THREE.BoxGeometry(0.125, 0.1, 0.27), darkSteel, x, 0.05, 0.06);
  }

  // ---------- torso: cuirass, surcoat, belt ----------
  const cuirassGeo = new THREE.LatheGeometry(
    prof([[0.165, 0.95], [0.18, 1.02], [0.2, 1.12], [0.215, 1.22], [0.225, 1.3], [0.2, 1.4], [0.17, 1.44]]),
    10
  );
  dent(cuirassGeo, V(0.1, 1.16, 0.19), 0.07, 0.014);
  dent(cuirassGeo, V(-0.13, 1.02, 0.14), 0.07, 0.018);
  dent(cuirassGeo, V(-0.02, 1.32, -0.19), 0.06, 0.012);
  put(root, cuirassGeo, steel, 0, 0, 0).scale.z = 0.72;

  const surcoatGeo = new THREE.LatheGeometry(
    prof([[0.25, 0.68], [0.238, 0.78], [0.22, 0.9], [0.21, 1.0], [0.225, 1.12], [0.24, 1.24], [0.235, 1.32], [0.205, 1.42]]),
    10
  );
  put(root, surcoatGeo, surcoatMat, 0, 0, 0).scale.z = 0.75;

  const hem = put(root, new THREE.TorusGeometry(0.25, 0.01, 5, 28), gold, 0, 0.69, 0, Math.PI / 2);
  hem.scale.set(1, 0.75, 1);

  const belt = put(root, new THREE.TorusGeometry(0.212, 0.017, 6, 28), leather, 0, 1.0, 0, Math.PI / 2);
  belt.scale.set(1, 0.75, 1);
  put(root, new THREE.BoxGeometry(0.05, 0.042, 0.018), gold, 0, 1.0, 0.166);
  for (let k = 0; k < 9; k++) {
    const a = -1.2 + (k / 8) * 2.4;
    if (Math.abs(a) < 0.25) continue; // leave the buckle clear
    put(root, new THREE.SphereGeometry(0.007, 5, 4), gold, 0.212 * Math.sin(a), 1.0, 0.1575 * Math.cos(a));
  }

  // silver griffin on the blue surcoat
  if (emblemTex) {
    put(root, new THREE.PlaneGeometry(0.2, 0.2), emblemMat, 0, 1.2, 0.186);
  }

  // ---------- neck, gorget, great helm, plume ----------
  put(root, new THREE.CylinderGeometry(0.09, 0.1, 0.2, 8), leather, 0, 1.36, 0);
  put(root, new THREE.CylinderGeometry(0.145, 0.125, 0.1, 10, 1, true), steel, 0, 1.43, 0);

  const helmGeo = new THREE.CylinderGeometry(0.145, 0.15, 0.25, 8, 3);
  dent(helmGeo, V(0.09, 0.07, 0.1), 0.07, 0.012);
  dent(helmGeo, V(-0.12, -0.02, 0.07), 0.06, 0.01);
  dent(helmGeo, V(0.02, 0.1, -0.13), 0.08, 0.014);
  dent(helmGeo, V(-0.1, 0.09, -0.08), 0.05, 0.01);
  put(root, helmGeo, steel, 0, 1.6, 0, 0, Math.PI / 8, 0); // rotated so a flat faces +Z

  // narrow eye slit and breath holes on the front face
  put(root, new THREE.BoxGeometry(0.1, 0.011, 0.008), black, 0, 1.645, 0.136);
  for (const x of [-0.03, 0, 0.03]) {
    for (const y of [1.56, 1.525]) {
      put(root, new THREE.BoxGeometry(0.012, 0.012, 0.008), black, x, y, 0.136);
    }
  }
  put(root, new THREE.TorusGeometry(0.15, 0.0075, 6, 24), gold, 0, 1.478, 0, Math.PI / 2);
  put(root, new THREE.TorusGeometry(0.1445, 0.0065, 6, 24), gold, 0, 1.722, 0, Math.PI / 2);
  put(root, new THREE.CylinderGeometry(0.035, 0.045, 0.05, 10), gold, 0, 1.745, 0);

  // tall crimson plume: a fan of swept horsehair strands
  const STRANDS = 9;
  for (let k = 0; k < STRANDS; k++) {
    const u = k / (STRANDS - 1) - 0.5;
    const len = 0.4 - Math.abs(u) * 0.12 + (R() - 0.5) * 0.05;
    const zOff = (k % 2) * 0.012;
    const pts: THREE.Vector3[] = [];
    const ws: number[] = [];
    for (let s = 0; s <= 10; s++) {
      const t = s / 10;
      pts.push(V(u * (0.03 + 0.1 * Math.pow(t, 1.4)), 1.76 + len * t, zOff - 0.16 * t * t));
      ws.push(0.02 * Math.pow(1 - t, 0.75) + 0.0025);
    }
    root.add(ribbon(pts, ws, crimson));
  }

  // ---------- layered pauldrons with gold filigree ----------
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const r = 0.12 - i * 0.024;
      const grp = new THREE.Group();
      grp.position.set(s * (0.25 + i * 0.035), 1.44 - i * 0.05, 0);
      grp.rotation.z = -s * (0.3 + i * 0.18);
      root.add(grp);

      const capGeo = new THREE.SphereGeometry(r, 10, 4, 0, Math.PI * 2, 0, 0.95);
      const ph = 0.3 + R() * 0.4;
      const az = R() * Math.PI * 2;
      dent(
        capGeo,
        V(r * Math.sin(ph) * Math.sin(az), r * Math.cos(ph), r * Math.sin(ph) * Math.cos(az)),
        r * 0.4,
        r * 0.14
      );
      const cap = new THREE.Mesh(capGeo, steel);
      cap.scale.set(1, 0.6, 1);
      grp.add(cap);

      const rimY = r * Math.cos(0.95) * 0.6;
      const rimR = r * Math.sin(0.95);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(rimR, 0.008, 5, 20), gold);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = rimY;
      grp.add(rim);
      for (let k = 0; k < 6; k++) {
        const t = (k / 6) * Math.PI * 2;
        const rv = new THREE.Mesh(new THREE.SphereGeometry(0.0075, 5, 4), gold);
        rv.position.set(Math.sin(t) * rimR, rimY, Math.cos(t) * rimR);
        grp.add(rv);
      }

      // etched gold scrollwork on the plate
      for (let k = 0; k < 3; k++) {
        const p = 0.4 + R() * 0.35;
        const a = (k / 3) * Math.PI * 2 + R() * 0.8;
        const n = V(Math.sin(p) * Math.sin(a), Math.cos(p) / 0.6, Math.sin(p) * Math.cos(a)).normalize();
        const pt = V(r * Math.sin(p) * Math.sin(a), 0.6 * r * Math.cos(p), r * Math.sin(p) * Math.cos(a));
        const scroll = new THREE.Mesh(
          new THREE.TorusGeometry(r * 0.2, 0.0035, 4, 12, Math.PI * (1.1 + R() * 0.7)),
          gold
        );
        scroll.position.copy(pt).addScaledVector(n, 0.004);
        orientTo(scroll, n);
        grp.add(scroll);
      }
    }
  }

  // ---------- arms ----------
  const arms = [
    { S: V(0.27, 1.4, 0), E: V(0.38, 1.12, 0.08), W: V(0.29, 1.07, 0.26) }, // left arm, bears the shield
    { S: V(-0.27, 1.4, 0), E: V(-0.4, 1.13, 0.1), W: V(-0.33, 0.99, 0.13) }, // right arm, plants the sword
  ];
  for (const a of arms) {
    limb(root, a.S, a.E, 0.05, 0.046, cloth);
    put(root, new THREE.SphereGeometry(0.056, 8, 6), steel, a.E.x, a.E.y, a.E.z);
    limb(root, a.E, a.W, 0.05, 0.042, steel);
    const dir = new THREE.Vector3().subVectors(a.W, a.E).normalize();
    const gaunt = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.11, 0.1), darkSteel);
    gaunt.position.copy(a.W).addScaledVector(dir, 0.03);
    alignY(gaunt, dir);
    root.add(gaunt);
  }

  // ---------- torn crimson cape and clasps ----------
  root.add(new THREE.Mesh(capeGeometry(R), crimson));
  put(root, new THREE.SphereGeometry(0.018, 8, 6), gold, -0.2, 1.41, -0.165);
  put(root, new THREE.SphereGeometry(0.018, 8, 6), gold, 0.2, 1.41, -0.165);

  // ---------- broadsword planted point-down by the right foot ----------
  const sword = new THREE.Group();
  sword.position.set(-0.33, 0.93, 0.135);
  sword.rotation.x = Math.PI - 0.08;
  root.add(sword);

  put(sword, new THREE.CylinderGeometry(0.017, 0.017, 0.12, 8), leather, 0, -0.06, 0);
  for (const y of [-0.028, -0.054, -0.08, -0.106]) {
    put(sword, new THREE.TorusGeometry(0.0185, 0.003, 4, 10), gold, 0, y, 0, Math.PI / 2);
  }
  put(sword, new THREE.SphereGeometry(0.03, 10, 8), gold, 0, -0.14, 0);
  put(sword, new THREE.BoxGeometry(0.2, 0.026, 0.034), gold, 0, 0, 0);
  put(sword, new THREE.SphereGeometry(0.016, 6, 5), gold, -0.1, 0, 0);
  put(sword, new THREE.SphereGeometry(0.016, 6, 5), gold, 0.1, 0, 0);

  const bs = new THREE.Shape();
  bs.moveTo(-0.034, 0.0);
  bs.lineTo(0.034, 0.0);
  bs.lineTo(0.034, 0.38);
  bs.lineTo(0.022, 0.41); // a nick from battle
  bs.lineTo(0.034, 0.45);
  bs.lineTo(0.034, 0.5);
  bs.lineTo(0.03, 0.68);
  bs.lineTo(0.0, 0.86);
  bs.lineTo(-0.03, 0.68);
  bs.lineTo(-0.034, 0.5);
  bs.lineTo(-0.034, 0.0);
  const bladeGeo = new THREE.ExtrudeGeometry(bs, {
    depth: 0.006,
    bevelEnabled: true,
    bevelThickness: 0.002,
    bevelSize: 0.002,
    bevelSegments: 1,
    curveSegments: 1,
  });
  bladeGeo.translate(0, 0, -0.003);
  put(sword, bladeGeo, blade, 0, 0, 0);
  for (const z of [0.0055, -0.0055]) {
    put(sword, new THREE.BoxGeometry(0.007, 0.42, 0.002), darkSteel, 0, 0.28, z); // fullers
  }

  // ---------- kite shield with gold rim and boss ----------
  const shield = new THREE.Group();
  shield.position.set(0.3, 1.02, 0.3);
  shield.rotation.y = 0.22;
  root.add(shield);

  const bodyGeo = new THREE.ExtrudeGeometry(kite(1), {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
    bevelSegments: 2,
    curveSegments: 8,
  });
  remapUV(bodyGeo);
  shield.add(new THREE.Mesh(bodyGeo, [shieldFace, darkSteel]));

  const rimShape = kite(1);
  rimShape.holes.push(kite(0.86));
  const rimMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(rimShape, { depth: 0.02, bevelEnabled: false, curveSegments: 8 }),
    gold
  );
  rimMesh.position.z = 0.024;
  shield.add(rimMesh);

  const boss = new THREE.Mesh(new THREE.SphereGeometry(0.058, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), gold);
  boss.scale.set(1, 0.6, 1);
  boss.rotation.x = Math.PI / 2;
  boss.position.z = 0.034;
  shield.add(boss);

  shield.add(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.04), leather)).position.set(0, 0, -0.025);

  return root;
}
