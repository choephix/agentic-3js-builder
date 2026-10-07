```ts
import * as THREE from "three";

export const meta = {
  name: "Racing Green Portable Typewriter, 1936",
  description:
    "A glossy racing-green 1930s typewriter: chrome-rimmed round keys with cream letters in four staggered rows, a fan of type bars, a black platen with a half-typed letter, a chrome carriage-return lever and a brass maker's badge.",
};

// ---------------------------------------------------------------
// Seeded random (mulberry32) so every build is identical.
// ---------------------------------------------------------------
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

const doc: any = (globalThis as any).document;

function makeCanvas(w: number, h: number): any {
  if (!doc || typeof doc.createElement !== "function") return null;
  const c = doc.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function put(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  mat: THREE.Material | THREE.Material[],
  x = 0,
  y = 0,
  z = 0
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

// ---------------------------------------------------------------
// Key-top atlas: 8 x 5 cells of cream letters on ebony.
// Each key's disc gets its UVs remapped into its own cell.
// ---------------------------------------------------------------
const KEY_CHARS = "1234567890QWERTYUIOPASDFGHJKL;ZXCVBNM,./";
const ATLAS_COLS = 8;
const ATLAS_ROWS = 5;
const CELL = 128;

function makeKeyAtlas(): any {
  const c = makeCanvas(ATLAS_COLS * CELL, ATLAS_ROWS * CELL);
  if (!c) return null;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#161616";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#f2e8cc";
  ctx.font = "bold 76px Georgia, 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let k = 0; k < KEY_CHARS.length; k++) {
    const col = k % ATLAS_COLS;
    const row = Math.floor(k / ATLAS_COLS);
    ctx.fillText(KEY_CHARS[k], col * CELL + CELL / 2, row * CELL + CELL / 2 + 4);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function keyTopGeometry(k: number, radius: number): THREE.CircleGeometry {
  const g = new THREE.CircleGeometry(radius, 18);
  const uv = g.getAttribute("uv") as THREE.BufferAttribute;
  const col = k % ATLAS_COLS;
  const row = Math.floor(k / ATLAS_COLS);
  const u0 = col / ATLAS_COLS;
  const v0 = 1 - (row + 1) / ATLAS_ROWS;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, u0 + uv.getX(i) / ATLAS_COLS, v0 + uv.getY(i) / ATLAS_ROWS);
  }
  uv.needsUpdate = true;
  g.rotateX(-Math.PI / 2); // face up, top of letters towards the back
  return g;
}

// ---------------------------------------------------------------
// Half-typed letter on the platen.
// ---------------------------------------------------------------
function paperTexture(rng: () => number): any {
  const W = 504;
  const H = 576;
  const c = makeCanvas(W, H);
  if (!c) return null;
  const ctx = c.getContext("2d");

  ctx.fillStyle = "#f6f1e2";
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 1600; i++) {
    ctx.fillStyle = `rgba(110,92,64,${(rng() * 0.06).toFixed(3)})`;
    ctx.fillRect(rng() * W, rng() * H, 1.5, 1.5);
  }

  // red margin rule
  ctx.strokeStyle = "rgba(170,64,52,0.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(40, 0);
  ctx.lineTo(40, H);
  ctx.stroke();

  ctx.font = "17px 'Courier New', Courier, monospace";
  ctx.textBaseline = "alphabetic";
  const adv = ctx.measureText("M").width;

  const lines: [number, number, string][] = [
    [0, 24, "14th March, 1936"],
    [1, 0, "Dear Mr. Hallworth,"],
    [3, 0, "Thank you for your letter of the 9th inst."],
    [4, 0, "I am pleased to confirm the consignment of"],
    [5, 0, "brass fittings will be despatched Monday"],
    [6, 0, "next by rail, and I trust that the goods"],
    [7, 0, "will reach you in good order. Enclosed is"],
    [8, 0, "the revised schedule of prices, which"],
    [9, 0, "takes effect on the first of April. Kindly"],
    [10, 0, "note that the discount applies "],
  ];

  for (const [row, col, text] of lines) {
    const baseY = 92 + row * 28;
    for (let j = 0; j < text.length; j++) {
      const ch = text.charAt(j);
      if (ch === " ") continue;
      ctx.fillStyle = `rgba(34,30,26,${(0.78 + rng() * 0.2).toFixed(3)})`;
      ctx.fillText(
        ch,
        52 + (col + j) * adv + (rng() - 0.5) * 0.6,
        baseY + (rng() - 0.5) * 1.1
      );
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// ---------------------------------------------------------------
// Brass maker's badge.
// ---------------------------------------------------------------
function badgeTexture(): any {
  const c = makeCanvas(256, 96);
  if (!c) return null;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 0, 96);
  g.addColorStop(0, "#e9cb86");
  g.addColorStop(1, "#ad7c33");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 96);
  ctx.strokeStyle = "rgba(60,38,10,0.6)";
  ctx.lineWidth = 3;
  ctx.strokeRect(9, 9, 238, 78);
  ctx.fillStyle = "#2a1a06";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 42px Georgia, 'Times New Roman', serif";
  ctx.fillText("KESTREL", 128, 42);
  ctx.font = "bold 15px Georgia, 'Times New Roman', serif";
  ctx.fillText("STANDARD  \u00B7  MODEL 7", 128, 72);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ---------------------------------------------------------------
// Paper sheet: wraps the front of the platen, then rises and leans back.
// ---------------------------------------------------------------
function paperGeometry(YP: number, ZP: number, RP: number): THREE.BufferGeometry {
  const Rp = RP + 0.0025;
  const a0 = -0.26; // wrap start (below the front of the platen)
  const a1 = 0.44; // wrap end (above the front)
  const W = 0.22;
  const Lf = 0.23; // free length above the wrap
  const Sw = (a1 - a0) * Rp;

  const pts: { y: number; z: number; s: number }[] = [];
  const nW = 4;
  const nF = 12;
  for (let i = 0; i <= nW; i++) {
    const t = i / nW;
    const a = a0 + (a1 - a0) * t;
    pts.push({ y: YP + Rp * Math.sin(a), z: ZP + Rp * Math.cos(a), s: Sw * t });
  }
  const yE = YP + Rp * Math.sin(a1);
  const zE = ZP + Rp * Math.cos(a1);
  const ty = Math.cos(a1);
  const tz = -Math.sin(a1);
  for (let j = 1; j <= nF; j++) {
    const d = (Lf * j) / nF;
    pts.push({ y: yE + ty * d, z: zE + tz * d, s: Sw + d });
  }

  const total = Sw + Lf;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (const p of pts) {
    pos.push(-W / 2, p.y, p.z, W / 2, p.y, p.z);
    const v = p.s / total;
    uv.push(0, v, 1, v);
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const a = 2 * i;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------
// The typewriter
// ---------------------------------------------------------------
export default function buildTypewriter(): THREE.Object3D {
  const rng = mulberry32(1936);
  const root = new THREE.Group();
  root.name = "Typewriter";

  // ---------- materials: one per colour ----------
  const green = new THREE.MeshStandardMaterial({ color: 0x0f4d31, roughness: 0.2, metalness: 0.05 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xdfe4ea, roughness: 0.22, metalness: 0.75 });
  const ebony = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.35, metalness: 0.0 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 0.9, metalness: 0.0 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xd0a254, roughness: 0.32, metalness: 0.6 });

  const atlasTex = makeKeyAtlas();
  const keyTopMat = new THREE.MeshStandardMaterial({
    color: atlasTex ? 0xffffff : 0x2a2a2a,
    map: atlasTex,
    roughness: 0.4,
    metalness: 0,
  });

  const paperTex = paperTexture(rng);
  const paperMat = new THREE.MeshStandardMaterial({
    color: paperTex ? 0xffffff : 0xf2ecdb,
    map: paperTex,
    roughness: 0.95,
    metalness: 0,
    side: THREE.DoubleSide,
  });

  const badgeTex = badgeTexture();
  const badgeMat = new THREE.MeshStandardMaterial({
    color: badgeTex ? 0xffffff : 0xd0a254,
    map: badgeTex,
    roughness: 0.4,
    metalness: 0.35,
  });

  // ---------- body shell: side profile extruded across the width ----------
  // Profile is drawn as (u = -z, y); rotateY(PI/2) then maps u to world z.
  const BT = 0.004;
  const W = 0.44;
  const D = W - 2 * BT;
  const prof: [number, number][] = [
    [0.165, 0.03],
    [-0.15, 0.03],
    [-0.15, 0.064],
    [0.0, 0.136],
    [0.035, 0.158],
    [0.165, 0.158],
  ];
  const shape = new THREE.Shape();
  shape.moveTo(prof[0][0], prof[0][1]);
  for (let i = 1; i < prof.length; i++) shape.lineTo(prof[i][0], prof[i][1]);
  shape.closePath();
  const bodyGeo = new THREE.ExtrudeGeometry(shape, {
    depth: D,
    bevelEnabled: true,
    bevelSize: 0.003,
    bevelThickness: BT,
    bevelSegments: 2,
    curveSegments: 1,
  });
  bodyGeo.rotateY(Math.PI / 2);
  bodyGeo.translate(-D / 2, 0, 0);
  put(root, bodyGeo, green);

  // black base plate and rubber feet
  put(root, new THREE.BoxGeometry(0.41, 0.02, 0.3), ebony, 0, 0.02, -0.01);
  const footGeo = new THREE.CylinderGeometry(0.016, 0.018, 0.01, 12);
  for (const [fx, fz] of [
    [-0.19, -0.13],
    [0.19, -0.13],
    [-0.19, 0.11],
    [0.19, 0.11],
  ]) {
    put(root, footGeo, rubber, fx, 0.005, fz);
  }

  // chrome trim along the front edge of the keyboard well
  put(root, new THREE.BoxGeometry(0.3, 0.004, 0.006), chrome, 0, 0.066, 0.152);

  // brass racing pinstripes on both sides
  const stripeGeo = new THREE.BoxGeometry(0.0028, 0.0028, 0.16);
  const rivetSideGeo = new THREE.CylinderGeometry(0.0038, 0.0038, 0.004, 10);
  rivetSideGeo.rotateZ(Math.PI / 2);
  for (const sx of [-1, 1]) {
    for (const y of [0.094, 0.106]) {
      put(root, stripeGeo, brass, sx * 0.2222, y, -0.05);
    }
    for (const [ry, rz] of [
      [0.048, -0.135],
      [0.048, 0.125],
      [0.135, -0.135],
    ]) {
      put(root, rivetSideGeo, chrome, sx * 0.2232, ry, rz);
    }
  }

  // brass maker's badge on the front face
  const badge = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.024, 0.003), [
    brass,
    brass,
    brass,
    brass,
    badgeMat,
    brass,
  ]);
  badge.position.set(0, 0.047, 0.1565);
  badge.castShadow = true;
  root.add(badge);
  const badgeRivetGeo = new THREE.CylinderGeometry(0.0022, 0.0022, 0.0016, 8);
  badgeRivetGeo.rotateX(Math.PI / 2);
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      put(root, badgeRivetGeo, chrome, sx * 0.031, 0.047 + sy * 0.0075, 0.1575);
    }
  }

  // ---------- keyboard: tilted group, keys sit on the sloped top ----------
  const TILT = 0.45;
  const kb = new THREE.Group();
  kb.name = "keyboard";
  kb.position.set(0, 0.1, 0.075);
  kb.rotation.x = TILT;
  root.add(kb);

  const keyCap = new THREE.CylinderGeometry(0.0095, 0.0105, 0.01, 16, 1);
  const keyCollar = new THREE.CylinderGeometry(0.0112, 0.0118, 0.006, 16, 1);
  const keyRim = new THREE.TorusGeometry(0.0102, 0.0017, 6, 16);
  keyRim.rotateX(Math.PI / 2);

  const PX = 0.027; // key pitch along a row
  const PZ = 0.024; // row spacing
  const ROW_SHIFT = [-0.0162, -0.0054, 0.0054, 0.0162]; // staggered rows
  for (let r = 0; r < 4; r++) {
    for (let i = 0; i < 10; i++) {
      const k = r * 10 + i;
      const x = ROW_SHIFT[r] + (i - 4.5) * PX;
      const z = (r - 1.5) * PZ;
      put(kb, keyCollar, chrome, x, 0.003, z);
      put(kb, keyCap, ebony, x, 0.011, z);
      put(kb, keyRim, chrome, x, 0.0155, z);
      put(kb, keyTopGeometry(k, 0.0086), keyTopMat, x, 0.0162, z);
    }
  }

  // space bar with a chrome top plate
  put(kb, new THREE.BoxGeometry(0.13, 0.01, 0.018), ebony, 0, 0.005, 0.062);
  put(kb, new THREE.BoxGeometry(0.134, 0.002, 0.022), chrome, 0, 0.011, 0.062);

  // ---------- carriage, platen, paper ----------
  const YP = 0.265;
  const ZP = -0.12;
  const RP = 0.032;

  const platenGeo = new THREE.CylinderGeometry(RP, RP, 0.4, 28, 1);
  platenGeo.rotateZ(Math.PI / 2);
  put(root, platenGeo, rubber, 0, YP, ZP);

  const spindleGeo = new THREE.CylinderGeometry(0.0065, 0.0065, 0.022, 12);
  spindleGeo.rotateZ(Math.PI / 2);
  put(root, spindleGeo, chrome, 0.221, YP, ZP);
  put(root, spindleGeo, chrome, -0.221, YP, ZP);

  const knobGeo = new THREE.CylinderGeometry(0.016, 0.019, 0.018, 12);
  knobGeo.rotateZ(Math.PI / 2);
  put(root, knobGeo, brass, 0.238, YP, ZP);

  const plateGeo = new THREE.BoxGeometry(0.012, 0.14, 0.09);
  put(root, plateGeo, green, 0.204, 0.22, -0.12);
  put(root, plateGeo, green, -0.204, 0.22, -0.12);

  // chrome paper bail in front of the sheet
  const bailGeo = new THREE.CylinderGeometry(0.0038, 0.0038, 0.41, 10);
  bailGeo.rotateZ(Math.PI / 2);
  put(root, bailGeo, chrome, 0, YP + 0.02, ZP + RP + 0.02);

  // the half-typed sheet
  put(root, paperGeometry(YP, ZP, RP), paperMat);

  // ---------- type-bar fan: semicircle of thin bars behind the keys ----------
  const C = new THREE.Vector3(0, YP - 0.012, ZP + Math.sqrt(RP * RP - 0.012 * 0.012));
  const RF = 0.07;
  const NB = 36;
  const barGeo = new THREE.BoxGeometry(1, 0.0028, 0.0028);
  const X_AXIS = new THREE.Vector3(1, 0, 0);
  for (let i = 0; i < NB; i++) {
    const phi = Math.PI + ((i + 0.5) * Math.PI) / NB;
    const u = new THREE.Vector3(Math.cos(phi), Math.sin(phi), 0);
    const len = RF - 0.008;
    const bar = new THREE.Mesh(barGeo, chrome);
    bar.position.copy(C).addScaledVector(u, 0.008 + len / 2);
    bar.quaternion.setFromUnitVectors(X_AXIS, u);
    bar.scale.set(len, 1, 1);
    bar.castShadow = true;
    root.add(bar);
  }
  const arcGeo = new THREE.TorusGeometry(RF, 0.0024, 6, 48, Math.PI);
  arcGeo.rotateZ(Math.PI); // lower half, the pivot arc
  put(root, arcGeo, chrome, C.x, C.y, C.z);

  const hubGeo = new THREE.CylinderGeometry(0.0065, 0.0065, 0.006, 12);
  hubGeo.rotateX(Math.PI / 2);
  put(root, hubGeo, brass, C.x, C.y, C.z);

  put(root, new THREE.BoxGeometry(0.012, 0.026, 0.012), chrome, 0, 0.171, C.z);

  // ---------- chrome carriage-return lever on the right side ----------
  const leverCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.226, 0.268, -0.118),
    new THREE.Vector3(-0.244, 0.292, -0.104),
    new THREE.Vector3(-0.254, 0.28, -0.062),
    new THREE.Vector3(-0.255, 0.236, -0.022),
    new THREE.Vector3(-0.248, 0.206, 0.008),
  ]);
  put(root, new THREE.TubeGeometry(leverCurve, 28, 0.0045, 8, false), chrome);
  put(root, new THREE.SphereGeometry(0.0135, 14, 10), ebony, -0.248, 0.206, 0.008);

  root.add(kb);
  return root;
}
```