import * as THREE from "three";

export const meta = {
  name: "Brass Explorer's Telescope",
  description:
    "A polished brass refractor with leather-wrapped tube, engraved scale rings, a finder scope and a rubber-cupped eyepiece, on a mahogany tripod with brass fittings and a tray holding a rolled star chart.",
};

type Rnd = () => number;
type Cv = { c: HTMLCanvasElement; g: CanvasRenderingContext2D };

/* ------------------------------------------------------------------ */
/* seeded randomness (mulberry32)                                      */
/* ------------------------------------------------------------------ */
function rng(seed: number): Rnd {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* canvas textures (skipped cleanly when there is no DOM)              */
/* ------------------------------------------------------------------ */
function makeCanvas(w: number, h: number): Cv | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  return g ? { c, g } : null;
}

function toTex(cv: Cv | null): THREE.CanvasTexture | null {
  if (!cv) return null;
  const t = new THREE.CanvasTexture(cv.c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

function woodTexture(rnd: Rnd) {
  const cv = makeCanvas(256, 512);
  if (!cv) return null;
  const { g } = cv;
  g.fillStyle = "#6e3020";
  g.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 110; i++) {
    const dark = rnd() < 0.62;
    g.strokeStyle = dark
      ? `rgba(34,10,4,${(0.12 + rnd() * 0.28).toFixed(3)})`
      : `rgba(190,100,60,${(0.08 + rnd() * 0.18).toFixed(3)})`;
    g.lineWidth = 0.6 + rnd() * 2;
    const x0 = rnd() * 256;
    const amp = 1.5 + rnd() * 5;
    const ph = rnd() * 6.283;
    const fr = 0.01 + rnd() * 0.02;
    g.beginPath();
    for (let y = 0; y <= 512; y += 8) {
      const x = x0 + Math.sin(y * fr + ph) * amp;
      if (y === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
  }
  return toTex(cv);
}

function leatherTexture(rnd: Rnd) {
  const cv = makeCanvas(256, 256);
  if (!cv) return null;
  const { g } = cv;
  g.fillStyle = "#5d3520";
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) {
    g.fillStyle = rnd() < 0.5 ? "rgba(0,0,0,0.18)" : "rgba(255,220,170,0.07)";
    g.fillRect(rnd() * 256, rnd() * 256, 1 + rnd() * 2, 1 + rnd() * 2);
  }
  g.strokeStyle = "#d9b377";
  g.lineWidth = 2;
  g.setLineDash([7, 5]);
  for (const y of [22, 234]) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(256, y);
    g.stroke();
  }
  g.setLineDash([]);
  return toTex(cv);
}

function paperTexture(rnd: Rnd) {
  const S = 512;
  const cv = makeCanvas(S, S);
  if (!cv) return null;
  const { g } = cv;
  g.fillStyle = "#eedfb9";
  g.fillRect(0, 0, S, S);
  for (let i = 0; i < 14; i++) {
    const x = rnd() * S;
    const y = rnd() * S;
    const r = 20 + rnd() * 60;
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, "rgba(160,110,50,0.10)");
    rg.addColorStop(1, "rgba(160,110,50,0)");
    g.fillStyle = rg;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  g.strokeStyle = "rgba(96,64,32,0.22)";
  g.lineWidth = 1;
  for (let k = 0; k <= S; k += 64) {
    g.beginPath();
    g.moveTo(k, 0);
    g.lineTo(k, S);
    g.stroke();
    g.beginPath();
    g.moveTo(0, k);
    g.lineTo(S, k);
    g.stroke();
  }
  const stars: [number, number, number][] = [];
  for (let i = 0; i < 54; i++) stars.push([rnd() * S, rnd() * S, 0.8 + rnd() * 2.6]);
  g.strokeStyle = "rgba(40,28,18,0.5)";
  g.lineWidth = 1.2;
  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      const dx = stars[i][0] - stars[j][0];
      const dy = stars[i][1] - stars[j][1];
      if (Math.hypot(dx, dy) < 85 && rnd() < 0.3) {
        g.beginPath();
        g.moveTo(stars[i][0], stars[i][1]);
        g.lineTo(stars[j][0], stars[j][1]);
        g.stroke();
      }
    }
  }
  g.fillStyle = "#2a1f16";
  for (const [x, y, r] of stars) {
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  g.font = "italic 36px Georgia, serif";
  g.fillStyle = "rgba(42,31,22,0.85)";
  g.fillText("Carta Coeli", 36, 64);
  return toTex(cv);
}

function brassGradient(g: CanvasRenderingContext2D, w: number, h: number) {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#ecd08c");
  gr.addColorStop(0.5, "#c99c4c");
  gr.addColorStop(1, "#a37630");
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
}

// engraved graduated scale on the tube
function scaleTexture() {
  const W = 1024;
  const H = 96;
  const cv = makeCanvas(W, H);
  if (!cv) return null;
  const { g } = cv;
  brassGradient(g, W, H);
  g.fillStyle = "#4a2d0e";
  g.fillRect(0, 5, W, 2);
  g.fillRect(0, H - 7, W, 2);
  for (let i = 0; i < 72; i++) {
    const x = (i / 72) * W;
    const major = i % 6 === 0;
    const len = major ? H * 0.5 : i % 2 === 0 ? H * 0.28 : H * 0.16;
    g.fillRect(x, 9, major ? 3 : 2, len);
  }
  g.font = "bold 15px Georgia, serif";
  g.fillStyle = "#3d2409";
  for (let i = 0; i < 72; i += 6) {
    g.fillText(String(i * 5), (i / 72) * W + 6, H - 14);
  }
  return toTex(cv);
}

// engraved zig-zag band
function chevronTexture() {
  const W = 1024;
  const H = 96;
  const cv = makeCanvas(W, H);
  if (!cv) return null;
  const { g } = cv;
  brassGradient(g, W, H);
  g.strokeStyle = "#4a2d0e";
  g.lineWidth = 3;
  for (const [ya, yb] of [
    [14, 34],
    [62, 82],
  ]) {
    g.beginPath();
    for (let x = 0; x <= W; x += 32) {
      const y = (x / 32) % 2 === 0 ? ya : yb;
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
  }
  g.fillStyle = "#4a2d0e";
  for (let x = 16; x < W; x += 32) {
    g.beginPath();
    g.arc(x, 48, 3, 0, Math.PI * 2);
    g.fill();
  }
  return toTex(cv);
}

// engraved name plate
function plaqueTexture() {
  const W = 512;
  const H = 96;
  const cv = makeCanvas(W, H);
  if (!cv) return null;
  const { g } = cv;
  brassGradient(g, W, H);
  g.strokeStyle = "#4a2d0e";
  g.lineWidth = 3;
  g.strokeRect(8, 8, W - 16, H - 16);
  g.fillStyle = "#3d2409";
  g.font = "bold 40px Georgia, serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("EXPLORER \u00B7 No. 7", W / 2, H / 2 + 2);
  return toTex(cv);
}

/* ------------------------------------------------------------------ */
/* materials: one per surface, shared by every mesh that uses it       */
/* ------------------------------------------------------------------ */
function makeMaterials(rnd: Rnd) {
  const surf = (
    map: THREE.Texture | null,
    fallback: number,
    p: THREE.MeshStandardMaterialParameters = {}
  ) =>
    new THREE.MeshStandardMaterial({
      roughness: 0.6,
      ...p,
      map,
      color: map ? 0xffffff : fallback,
    });

  return {
    brass: new THREE.MeshStandardMaterial({ color: 0xd4a95c, metalness: 0.8, roughness: 0.26 }),
    brassAged: new THREE.MeshStandardMaterial({ color: 0x8e6a31, metalness: 0.7, roughness: 0.42 }),
    brassScale: surf(scaleTexture(), 0xd4a95c, { metalness: 0.8, roughness: 0.3 }),
    brassChevron: surf(chevronTexture(), 0xd4a95c, { metalness: 0.8, roughness: 0.3 }),
    plaque: surf(plaqueTexture(), 0xd4a95c, { metalness: 0.8, roughness: 0.3 }),
    leather: surf(leatherTexture(rnd), 0x5d3520, { roughness: 0.8 }),
    mahogany: surf(woodTexture(rnd), 0x6e3020, { roughness: 0.5 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x1c1815, roughness: 0.85 }),
    lens: new THREE.MeshStandardMaterial({ color: 0x2c4a66, roughness: 0.1, metalness: 0.3 }),
    paper: surf(paperTexture(rnd), 0xecdcb2, { roughness: 0.92 }),
    ribbon: new THREE.MeshStandardMaterial({ color: 0x8b1e22, roughness: 0.6 }),
  };
}
type Mats = ReturnType<typeof makeMaterials>;

/* ------------------------------------------------------------------ */
/* geometry helpers                                                    */
/* ------------------------------------------------------------------ */
const UP = new THREE.Vector3(0, 1, 0);

function mesh(
  parent: THREE.Object3D,
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  x = 0,
  y = 0,
  z = 0
): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}

/** cylinder from a to b; rA is the radius at a, rB the radius at b */
function strut(
  parent: THREE.Object3D,
  a: THREE.Vector3,
  b: THREE.Vector3,
  rA: number,
  rB: number,
  seg: number,
  mat: THREE.Material
): THREE.Mesh {
  const d = new THREE.Vector3().subVectors(b, a);
  const len = d.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rB, rA, len, seg, 1), mat);
  m.position.addVectors(a, b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, d.normalize());
  parent.add(m);
  return m;
}

/** cylinder whose axis runs along Z; rTop is the +Z end */
function alongZ(rTop: number, rBot: number, len: number, seg: number, open = false) {
  return new THREE.CylinderGeometry(rTop, rBot, len, seg, 1, open).rotateX(Math.PI / 2);
}

/** cylinder whose axis runs along X */
function alongX(rTop: number, rBot: number, len: number, seg: number, open = false) {
  return new THREE.CylinderGeometry(rTop, rBot, len, seg, 1, open).rotateZ(Math.PI / 2);
}

/* ------------------------------------------------------------------ */
/* tripod (world space, stands on y = 0)                               */
/* ------------------------------------------------------------------ */
const LEG_ANG = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
const LEG_TOP_Y = 0.87;
const LEG_TOP_R = 0.05;
const FOOT_Y = 0.012;
const FOOT_R = 0.36;

function legPoint(theta: number, s: number): THREE.Vector3 {
  // s = 0 at the head, 1 at the foot
  const r = LEG_TOP_R + (FOOT_R - LEG_TOP_R) * s;
  const y = LEG_TOP_Y + (FOOT_Y - LEG_TOP_Y) * s;
  return new THREE.Vector3(Math.sin(theta) * r, y, Math.cos(theta) * r);
}

function buildTripod(M: Mats): THREE.Group {
  const g = new THREE.Group();
  g.name = "tripod";

  // octagonal brass head with a flat ring
  mesh(g, new THREE.CylinderGeometry(0.075, 0.08, 0.03, 8), M.brass, 0, 0.885, 0);
  mesh(g, new THREE.TorusGeometry(0.076, 0.0045, 6, 24).rotateX(Math.PI / 2), M.brass, 0, 0.9, 0);

  // three splayed mahogany legs, each with a brass collar and shoe
  for (const th of LEG_ANG) {
    const T = legPoint(th, 0);
    const B = legPoint(th, 1);
    const dir = new THREE.Vector3().subVectors(B, T).normalize();
    strut(g, T, B, 0.024, 0.016, 10, M.mahogany);
    const P = legPoint(th, 0.14);
    strut(
      g,
      P.clone().addScaledVector(dir, -0.02),
      P.clone().addScaledVector(dir, 0.02),
      0.03,
      0.03,
      12,
      M.brass
    );
    strut(g, B.clone().addScaledVector(dir, -0.045), B, 0.02, 0.02, 12, M.brass);
    strut(g, B, B.clone().addScaledVector(dir, 0.012), 0.019, 0.017, 10, M.rubber);
  }

  // cross-stretcher between the two back legs, carrying the tray
  const s = 0.641;
  const c1 = legPoint(LEG_ANG[1], s);
  const c2 = legPoint(LEG_ANG[2], s);
  strut(g, c1, c2, 0.011, 0.011, 10, M.mahogany);
  const ballGeo = new THREE.SphereGeometry(0.016, 12, 8);
  mesh(g, ballGeo, M.brass, c1.x, c1.y, c1.z);
  mesh(g, ballGeo, M.brass, c2.x, c2.y, c2.z);

  // little mahogany tray with brass corner caps
  const zc = (c1.z + c2.z) / 2;
  const trayY = c1.y + 0.021;
  const trayTop = trayY + 0.01;
  mesh(g, new THREE.BoxGeometry(0.3, 0.02, 0.2), M.mahogany, 0, trayY, zc);
  const capGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.004, 8);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      mesh(g, capGeo, M.brass, sx * 0.14, trayTop + 0.002, zc + sz * 0.085);
    }
  }

  // rolled star chart, tied with a red ribbon
  const R = 0.03;
  const rollY = trayTop + R;
  mesh(g, alongX(R, R, 0.26, 20), M.paper, 0, rollY, zc);
  for (const sx of [-1, 1]) {
    mesh(g, alongX(R + 0.0006, R + 0.0006, 0.012, 20, true), M.ribbon, sx * 0.07, rollY, zc);
  }
  mesh(g, new THREE.SphereGeometry(0.008, 10, 8), M.ribbon, 0.07, rollY + R + 0.002, zc);

  return g;
}

/* ------------------------------------------------------------------ */
/* yoke: pan head, fork arms, trunnion axle, clamp knob                */
/* ------------------------------------------------------------------ */
const PIVOT_Y = 1.03;
const ELEV = Math.PI / 6;

function buildYoke(M: Mats): THREE.Group {
  const g = new THREE.Group();
  g.name = "yoke";
  // base plate sitting on the head, with an engraved plate on its front
  mesh(g, new THREE.BoxGeometry(0.25, 0.02, 0.05), M.brass, 0, 0.905, 0);
  mesh(g, new THREE.PlaneGeometry(0.13, 0.024), M.plaque, 0, 0.905, 0.0256);
  // fork arms and bearings
  for (const sx of [-1, 1]) {
    mesh(g, new THREE.BoxGeometry(0.024, 0.13, 0.05), M.brass, sx * 0.112, 0.98, 0);
    mesh(g, alongX(0.02, 0.02, 0.008, 16), M.brassAged, sx * 0.1245, PIVOT_Y, 0);
  }
  // trunnion axle and the clamp knob on the right
  mesh(g, alongX(0.011, 0.011, 0.27, 12), M.brass, 0, PIVOT_Y, 0);
  mesh(g, alongX(0.026, 0.026, 0.018, 24), M.mahogany, 0.146, PIVOT_Y, 0);
  mesh(g, alongX(0.012, 0.012, 0.012, 12), M.brass, 0.161, PIVOT_Y, 0);
  return g;
}

/* ------------------------------------------------------------------ */
/* telescope, built in its own frame (origin = trunnion pivot)         */
/* ------------------------------------------------------------------ */
function buildScope(M: Mats): THREE.Group {
  const t = new THREE.Group();
  t.name = "telescope";

  // main tube: one turned brass lathe, rear (-Z) to front (+Z)
  const profile: [number, number][] = [
    [0, -0.38],
    [0.04, -0.38],
    [0.046, -0.37],
    [0.047, -0.3],
    [0.0485, 0.0],
    [0.05, 0.2],
    [0.0515, 0.36],
    [0.0525, 0.4],
    [0, 0.4],
  ];
  const tubePts = profile.map(([r, z]) => new THREE.Vector2(r, z));
  mesh(t, new THREE.LatheGeometry(tubePts, 28).rotateX(Math.PI / 2), M.brass);

  // cradle collar where the trunnion axle meets the tube
  mesh(t, new THREE.TorusGeometry(0.063, 0.011, 10, 28), M.brass, 0, 0, 0);

  // engraved graduated scale and engraved zig-zag band
  mesh(t, alongZ(0.0505, 0.0505, 0.08, 28, true), M.brassScale, 0, 0, -0.29);
  mesh(t, alongZ(0.0505, 0.0505, 0.07, 28, true), M.brassChevron, 0, 0, 0.055);

  // leather-wrapped grip sections
  mesh(t, alongZ(0.0555, 0.0555, 0.19, 28, true), M.leather, 0, 0, -0.125);
  mesh(t, alongZ(0.0555, 0.0555, 0.13, 28, true), M.leather, 0, 0, 0.195);

  // brass collars with rivets at the ends of each leather wrap
  const collarGeo = alongZ(0.0575, 0.0575, 0.008, 28);
  const rivetGeo = new THREE.SphereGeometry(0.0045, 8, 6);
  for (const z of [-0.22, -0.03, 0.13, 0.26]) {
    mesh(t, collarGeo, M.brass, 0, 0, z);
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3;
      mesh(t, rivetGeo, M.brass, Math.cos(a) * 0.0585, Math.sin(a) * 0.0585, z);
    }
  }

  // thin engraved rings near the objective
  const ringGeo = new THREE.TorusGeometry(0.0525, 0.0035, 8, 28);
  mesh(t, ringGeo, M.brassAged, 0, 0, 0.3);
  mesh(t, ringGeo, M.brassAged, 0, 0, 0.335);

  // objective cell, dew cap with rim, and the lens
  mesh(t, alongZ(0.06, 0.06, 0.04, 28), M.brass, 0, 0, 0.42);
  mesh(t, alongZ(0.0625, 0.0625, 0.13, 28, true), M.brass, 0, 0, 0.505);
  mesh(t, new THREE.TorusGeometry(0.0625, 0.0045, 8, 28), M.brass, 0, 0, 0.57);
  mesh(t, new THREE.CircleGeometry(0.058, 28), M.lens, 0, 0, 0.4415);

  // rear focuser: collar, drawtube, and two mahogany focusing knobs
  mesh(t, alongZ(0.042, 0.042, 0.03, 24), M.brass, 0, 0, -0.395);
  mesh(t, alongZ(0.036, 0.036, 0.07, 24), M.brass, 0, 0, -0.45);
  for (const sx of [-1, 1]) {
    mesh(t, alongX(0.007, 0.007, 0.03, 12), M.brass, sx * 0.05, 0, -0.45);
    mesh(t, alongX(0.026, 0.026, 0.02, 24), M.mahogany, sx * 0.075, 0, -0.45);
    mesh(t, alongX(0.011, 0.011, 0.008, 16), M.brass, sx * 0.089, 0, -0.45);
  }

  // eyepiece barrel with a dark band, rubber eyecup and a glass lens
  mesh(t, alongZ(0.024, 0.024, 0.075, 24), M.brass, 0, 0, -0.5225);
  mesh(t, alongZ(0.0255, 0.0255, 0.008, 24), M.brassAged, 0, 0, -0.52);
  const cupProfile: [number, number][] = [
    [0, -0.607],
    [0.028, -0.607],
    [0.033, -0.602],
    [0.033, -0.595],
    [0.03, -0.58],
    [0.024, -0.56],
    [0, -0.56],
  ];
  const cupPts = cupProfile.map(([r, z]) => new THREE.Vector2(r, z));
  mesh(t, new THREE.LatheGeometry(cupPts, 24).rotateX(Math.PI / 2), M.rubber);
  mesh(t, new THREE.CircleGeometry(0.02, 20).rotateY(Math.PI), M.lens, 0, 0, -0.6085);

  // finder scope on top of the tube, on two brass rings and brackets
  const FY = 0.095;
  mesh(t, alongZ(0.02, 0.02, 0.41, 16), M.brass, 0, FY, -0.045);
  for (const z of [-0.12, 0.075]) {
    mesh(t, alongZ(0.026, 0.026, 0.03, 16), M.brassAged, 0, FY, z);
    mesh(t, new THREE.BoxGeometry(0.018, 0.03, 0.03), M.brassAged, 0, 0.062, z);
  }
  mesh(t, alongZ(0.024, 0.024, 0.015, 16), M.brass, 0, FY, 0.1675);
  mesh(t, new THREE.CircleGeometry(0.02, 16), M.lens, 0, FY, 0.1763);
  mesh(t, alongZ(0.016, 0.016, 0.05, 14), M.brass, 0, FY, -0.275);
  mesh(t, alongZ(0.0165, 0.0165, 0.012, 14), M.rubber, 0, FY, -0.306);

  return t;
}

/* ------------------------------------------------------------------ */
/* entry point                                                         */
/* ------------------------------------------------------------------ */
export default function brassExplorerTelescope(): THREE.Object3D {
  const rnd = rng(1851);
  const M = makeMaterials(rnd);

  const root = new THREE.Group();
  root.name = "brass-explorer-telescope";

  root.add(buildTripod(M));
  root.add(buildYoke(M));

  const scope = buildScope(M);
  scope.position.set(0, PIVOT_Y, 0);
  scope.rotation.x = -ELEV; // objective points up and forward (+Z)
  root.add(scope);

  return root;
}
