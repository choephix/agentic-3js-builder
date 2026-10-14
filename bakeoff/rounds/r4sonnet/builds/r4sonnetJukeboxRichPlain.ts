import * as THREE from "three";

export const meta = {
  name: "Starlite 45 Jukebox",
  description:
    "A 1950s diner jukebox in cream, teal and cherry red: a tall arch of glowing red, amber and teal tubes with chrome ribs, a domed glass window with a tilted stack of 45s and a picker arm mid-lift, a sloped deck of chrome selection buttons with title cards, a coin plate, and a starburst speaker grille.",
};

/* ------------------------------------------------------------------ */
/* utilities                                                           */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Ctx = CanvasRenderingContext2D;

function makeCanvas(w: number, h: number): [HTMLCanvasElement, Ctx] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!];
}

function toTexture(c: HTMLCanvasElement): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function drawStar2D(g: Ctx, x: number, y: number, ro: number, ri: number, n = 5) {
  g.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? ro : ri;
    const a = -Math.PI / 2 + (i * Math.PI) / n;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
  g.fill();
}

function fitText(g: Ctx, text: string, x: number, y: number, maxW: number, size: number, style: string, family: string) {
  let s = size;
  for (;;) {
    g.font = `${style} ${s}px ${family}`;
    if (g.measureText(text).width <= maxW || s <= 8) break;
    s -= 1;
  }
  g.fillText(text, x, y);
}

function addMesh(parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}

function box(parent: THREE.Object3D, w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number) {
  return addMesh(parent, new THREE.BoxGeometry(w, h, d), mat, x, y, z);
}

/** cylinder whose axis points along +Z */
function cylZ(parent: THREE.Object3D, rTop: number, rBot: number, len: number, seg: number, mat: THREE.Material, x: number, y: number, z: number) {
  const m = addMesh(parent, new THREE.CylinderGeometry(rTop, rBot, len, seg), mat, x, y, z);
  m.rotation.x = Math.PI / 2;
  return m;
}

function rod(parent: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material, seg = 8) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  parent.add(m);
  return m;
}

function starGeo(outer: number, inner: number, depth: number, n = 5) {
  const s = new THREE.Shape();
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = Math.PI / 2 + (i * Math.PI) / n;
    if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, {
    depth,
    bevelEnabled: true,
    bevelThickness: depth * 0.25,
    bevelSize: outer * 0.04,
    bevelSegments: 1,
  });
  g.translate(0, 0, -depth / 2);
  return g;
}

function rayGeo(len: number, w: number, depth: number) {
  const s = new THREE.Shape();
  s.moveTo(0, -w / 2);
  s.lineTo(len, 0);
  s.lineTo(0, w / 2);
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
}

function atlasCell(geo: THREE.BufferGeometry, col: number, row: number, cols: number, rows: number) {
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) {
    const u = uv.getX(i);
    const v = uv.getY(i);
    uv.setXY(i, (col + u) / cols, 1 - (row + (1 - v)) / rows);
  }
  uv.needsUpdate = true;
  return geo;
}

/* shapes ----------------------------------------------------------- */

function archShape(R: number, yb: number, ys: number): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(R, yb);
  s.lineTo(R, ys);
  s.absarc(0, ys, R, 0, Math.PI, false);
  s.lineTo(-R, yb);
  s.closePath();
  return s;
}

function archRingShape(R1: number, R2: number, yb: number, ys: number): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(R1, yb);
  s.lineTo(R1, ys);
  s.absarc(0, ys, R1, 0, Math.PI, false);
  s.lineTo(-R1, yb);
  s.lineTo(-R2, yb);
  s.lineTo(-R2, ys);
  s.absarc(0, ys, R2, Math.PI, 0, true);
  s.lineTo(R2, yb);
  s.closePath();
  return s;
}

function windowShape(R: number, yb: number, ys: number): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(-R, yb);
  s.lineTo(R, yb);
  s.lineTo(R, ys);
  s.absarc(0, ys, R, 0, Math.PI, false);
  s.lineTo(-R, yb);
  return s;
}

/** ∩-shaped path: up the left side, over the arch, down the right side */
class ArchCurve extends THREE.Curve<THREE.Vector3> {
  r: number;
  yb: number;
  ys: number;
  z: number;
  constructor(r: number, yb: number, ys: number, z: number) {
    super();
    this.r = r;
    this.yb = yb;
    this.ys = ys;
    this.z = z;
  }
  getPoint(t: number, optionalTarget: THREE.Vector3 = new THREE.Vector3()): THREE.Vector3 {
    const L = this.ys - this.yb;
    const A = Math.PI * this.r;
    let s = t * (2 * L + A);
    if (s < L) return optionalTarget.set(-this.r, this.yb + s, this.z);
    s -= L;
    if (s < A) {
      const ang = Math.PI - (s / A) * Math.PI;
      return optionalTarget.set(Math.cos(ang) * this.r, this.ys + Math.sin(ang) * this.r, this.z);
    }
    s -= A;
    return optionalTarget.set(this.r, this.ys - s, this.z);
  }
}

/* ------------------------------------------------------------------ */
/* canvas textures                                                     */
/* ------------------------------------------------------------------ */

function makeEnvTexture(): THREE.CanvasTexture {
  const [c, g] = makeCanvas(512, 256);
  const sky = g.createLinearGradient(0, 0, 0, 256);
  sky.addColorStop(0.0, "#7f95a8");
  sky.addColorStop(0.3, "#d8e4ec");
  sky.addColorStop(0.49, "#fff3d8");
  sky.addColorStop(0.5, "#6a625b");
  sky.addColorStop(0.75, "#2f2a27");
  sky.addColorStop(1.0, "#181513");
  g.fillStyle = sky;
  g.fillRect(0, 0, 512, 256);
  g.fillStyle = "#ffffff";
  const boxes = [
    [20, 40, 46, 100],
    [110, 20, 34, 120],
    [200, 50, 56, 90],
    [300, 30, 40, 115],
    [390, 45, 50, 95],
    [470, 25, 32, 110],
  ];
  for (const [x, y, w, h] of boxes) g.fillRect(x, y, w, h);
  g.fillStyle = "#ffb878";
  g.fillRect(160, 60, 14, 100);
  g.fillStyle = "#7fe6dc";
  g.fillRect(352, 70, 12, 90);
  g.fillStyle = "#ff8a80";
  g.fillRect(70, 80, 10, 80);
  g.fillStyle = "#23262b";
  g.fillRect(262, 10, 8, 150);
  g.fillRect(430, 30, 6, 130);
  g.fillRect(90, 30, 6, 130);
  g.fillStyle = "rgba(255,240,210,0.55)";
  g.fillRect(60, 160, 80, 30);
  g.fillRect(320, 170, 90, 26);
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeGrilleTexture(): THREE.CanvasTexture {
  const W = 760;
  const H = 320;
  const [c, g] = makeCanvas(W, H);
  const cx = W / 2;
  const cy = H / 2;
  g.fillStyle = "#0b3640";
  g.fillRect(0, 0, W, H);
  const n = 48;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    g.fillStyle = i % 2 ? "#0f4a56" : "#0a2f38";
    g.beginPath();
    g.moveTo(cx, cy);
    g.arc(cx, cy, 900, a0, a1);
    g.closePath();
    g.fill();
  }
  g.strokeStyle = "rgba(236,180,80,0.5)";
  g.lineWidth = 1.5;
  for (let i = 0; i < n; i += 2) {
    const a = (i / n) * Math.PI * 2;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * 70, cy + Math.sin(a) * 70);
    g.lineTo(cx + Math.cos(a) * 900, cy + Math.sin(a) * 900);
    g.stroke();
  }
  for (const [rx, ry] of [
    [120, 56],
    [230, 100],
    [340, 150],
  ]) {
    g.beginPath();
    g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    g.stroke();
  }
  g.fillStyle = "rgba(0,0,0,0.22)";
  for (let x = 0; x < W; x += 4) g.fillRect(x, 0, 1, H);
  for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 1);
  const v = g.createRadialGradient(cx, cy, 60, cx, cy, W * 0.6);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,0.55)");
  g.fillStyle = v;
  g.fillRect(0, 0, W, H);
  return toTexture(c);
}

function makeBannerTexture(): THREE.CanvasTexture {
  const W = 1520;
  const H = 120;
  const [c, g] = makeCanvas(W, H);
  const grad = g.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#d02a36");
  grad.addColorStop(1, "#9c1520");
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  g.strokeStyle = "#f3e7c8";
  g.lineWidth = 3;
  g.strokeRect(8, 8, W - 16, H - 16);
  g.fillStyle = "#f3e7c8";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.shadowColor = "rgba(50,0,8,0.8)";
  g.shadowOffsetX = 3;
  g.shadowOffsetY = 3;
  g.font = "italic bold 86px Georgia, 'Times New Roman', serif";
  g.fillText("Starlite", W / 2, 62);
  g.font = "bold 36px Arial, sans-serif";
  g.fillText("HI-FI", 270, 62);
  g.fillText("PHONOGRAPH", 1250, 62);
  g.shadowColor = "transparent";
  drawStar2D(g, 140, 60, 26, 11);
  drawStar2D(g, 1385, 60, 26, 11);
  drawStar2D(g, 500, 62, 14, 6);
  drawStar2D(g, 1020, 62, 14, 6);
  return toTexture(c);
}

function makeDeckTexture(): THREE.CanvasTexture {
  const W = 920;
  const H = 324;
  const [c, g] = makeCanvas(W, H);
  const grad = g.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#7a1624");
  grad.addColorStop(1, "#4a0b16");
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(255,220,170,0.08)";
  g.lineWidth = 2;
  for (let x = -H; x < W; x += 14) {
    g.beginPath();
    g.moveTo(x, H);
    g.lineTo(x + H, 0);
    g.stroke();
  }
  // heading band
  g.fillStyle = "#f2e6c6";
  g.fillRect(50, 5, 668, 28);
  g.fillStyle = "#b81c2a";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = "bold 19px Georgia, serif";
  g.fillText("MAKE YOUR SELECTION", 384, 20);
  drawStar2D(g, 90, 19, 9, 4);
  drawStar2D(g, 678, 19, 9, 4);
  // row bands
  for (let k = 0; k < 3; k++) {
    g.fillStyle = "rgba(0,0,0,0.22)";
    g.fillRect(50, 38 + 85 * k, 668, 74);
    g.fillStyle = "rgba(230,170,70,0.5)";
    g.fillRect(50, 38 + 85 * k, 668, 2);
  }
  g.fillStyle = "#d9a53a";
  g.fillRect(50, 288, 668, 2);
  g.fillStyle = "#f2e6c6";
  g.font = "bold 15px Arial, sans-serif";
  g.fillText("5¢ PLAYS ONE  ·  PRESS BUTTON TO SELECT  ·  6 FOR 25¢", 384, 306);
  return toTexture(c);
}

function makeCoinTexture(): THREE.CanvasTexture {
  const [c, g] = makeCanvas(220, 540);
  g.fillStyle = "#efe3c3";
  g.fillRect(0, 0, 220, 540);
  g.fillStyle = "#b81c2a";
  g.fillRect(0, 0, 220, 160);
  g.fillStyle = "#f3e7c8";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = "bold 28px Georgia, serif";
  g.fillText("INSERT", 110, 32);
  g.font = "bold 46px Georgia, serif";
  g.fillText("COIN", 110, 78);
  g.font = "bold 17px Arial, sans-serif";
  g.fillText("5¢  ·  ONE PLAY", 110, 120);
  g.fillText("25¢  ·  SIX PLAYS", 110, 142);
  g.fillStyle = "#d9a53a";
  g.fillRect(0, 160, 220, 6);
  g.fillStyle = "#b81c2a";
  g.beginPath();
  g.moveTo(96, 170);
  g.lineTo(124, 170);
  g.lineTo(110, 183);
  g.closePath();
  g.fill();
  g.font = "bold 20px Arial, sans-serif";
  g.fillText("COIN RETURN", 110, 350);
  g.fillStyle = "#cfc19c";
  g.beginPath();
  g.arc(110, 430, 58, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#17a89c";
  g.font = "bold 22px Georgia, serif";
  g.fillText("Thank You", 110, 510);
  return toTexture(c);
}

function makeGlowTexture(): THREE.CanvasTexture {
  const [c, g] = makeCanvas(256, 256);
  const grad = g.createRadialGradient(128, 150, 8, 128, 150, 200);
  grad.addColorStop(0, "#fff0b0");
  grad.addColorStop(0.3, "#ffbf45");
  grad.addColorStop(0.6, "#e8761f");
  grad.addColorStop(1, "#7a1d12");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const n = 20;
  for (let i = 0; i < n; i++) {
    const a0 = -Math.PI + (i / n) * Math.PI;
    const a1 = -Math.PI + ((i + 1) / n) * Math.PI;
    g.fillStyle = i % 2 ? "rgba(255,255,220,0.12)" : "rgba(120,20,0,0.12)";
    g.beginPath();
    g.moveTo(128, 256);
    g.arc(128, 256, 400, a0, a1);
    g.closePath();
    g.fill();
  }
  g.fillStyle = "rgba(60,10,0,0.10)";
  for (let x = 0; x < 256; x += 16) g.fillRect(x, 0, 2, 256);
  return toTexture(c);
}

const SONGS: [string, string][] = [
  ["Cherry Soda Rock", "The Dinettes"],
  ["Moonlight Malt", "Bobby Sox"],
  ["Hot Rod Heart", "Rex Ramjet"],
  ["Poodle Stomp", "Peggy & Pals"],
  ["Milkshake Mambo", "Los Cafeteros"],
  ["Drive-In Blues", "Elmer Fuzz"],
  ["Saturday Soda", "The Jelly Jets"],
  ["Twist & Pop", "Chubby Charlie"],
  ["Crazy Cadillac", "Tex Tailfin"],
  ["Lonely Diner", "Dottie Lane"],
  ["Jukebox Jive", "Sid Sparkle"],
  ["Sweet Sue Waltz", "Hal & Hi-Fis"],
  ["Pink Flamingo", "The Cabanas"],
  ["Rocket Romance", "Buddy Orbit"],
  ["Bop Till Dawn", "Lola Lightning"],
  ["Soda Jerk Stomp", "Mel Malone"],
  ["Pie A La Mode", "Cherry Lee"],
  ["Neon Nights", "Vic Velvet"],
  ["Blue Chrome", "The Hubcaps"],
  ["Candy Apple Red", "Gloria Gleam"],
  ["Penny Serenade", "Tommy Tuxedo"],
  ["Atomic Boogie", "The Sputniks"],
  ["Sock Hop Hop", "Dee Dee Dream"],
  ["Rainy Route 66", "Jack Jalopy"],
  ["Last Dance Slow", "Ruby Rae"],
  ["Gee Whiz Baby", "The Bobbins"],
  ["Home By Ten", "Patty Paige"],
];

function makeCardAtlas(cols: number, rows: number): THREE.CanvasTexture {
  const cw = 128;
  const ch = 64;
  const [c, g] = makeCanvas(cw * cols, ch * rows);
  const papers = ["#f6ecd0", "#f8dcd4", "#d6efe7", "#f8e9ae", "#f2ead8"];
  const stripes = ["#c3202c", "#17a89c", "#e89a10"];
  const letters = "ABC";
  g.textBaseline = "middle";
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const i = r * cols + col;
      const [title, artist] = SONGS[i % SONGS.length];
      const x = col * cw;
      const y = r * ch;
      g.fillStyle = papers[(i * 3 + r) % papers.length];
      g.fillRect(x, y, cw, ch);
      g.fillStyle = stripes[(i + r) % 3];
      g.fillRect(x, y, cw, 15);
      g.fillStyle = "#fff7e0";
      g.font = "bold 12px Arial, sans-serif";
      g.textAlign = "left";
      g.fillText(letters[r] + (col + 1), x + 6, y + 8);
      g.textAlign = "right";
      g.fillText("45", x + cw - 6, y + 8);
      g.textAlign = "center";
      g.fillStyle = "#2a1a1a";
      fitText(g, title, x + cw / 2, y + 31, cw - 12, 16, "bold", "Georgia, serif");
      g.fillStyle = "#7a2f2f";
      fitText(g, artist, x + cw / 2, y + 51, cw - 14, 13, "italic", "Georgia, serif");
      g.strokeStyle = "rgba(40,20,20,0.55)";
      g.lineWidth = 2;
      g.strokeRect(x + 1, y + 1, cw - 2, ch - 2);
    }
  }
  return toTexture(c);
}

function makeButtonAtlas(cols: number, rows: number): THREE.CanvasTexture {
  const s = 64;
  const [c, g] = makeCanvas(s * cols, s * rows);
  const letters = "ABC";
  g.textAlign = "center";
  g.textBaseline = "middle";
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      g.fillStyle = "#f4ebd2";
      g.fillRect(col * s, r * s, s, s);
      g.fillStyle = "#a71a26";
      g.font = "bold 30px Arial, sans-serif";
      g.fillText(letters[r] + (col + 1), col * s + s / 2, r * s + s / 2 + 2);
    }
  }
  return toTexture(c);
}

/* ------------------------------------------------------------------ */
/* the jukebox                                                         */
/* ------------------------------------------------------------------ */

export default function buildJukebox(): THREE.Object3D {
  const rand = mulberry32(1957);
  const root = new THREE.Group();
  root.name = "StarliteJukebox";
  const noShadow: THREE.Object3D[] = [];

  const env = makeEnvTexture();
  const P = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(o);

  /* ---- materials (one per colour) ---- */
  const chrome = P({ color: 0xf4f6f8, metalness: 1, roughness: 0.1, envMap: env, envMapIntensity: 1.25 });
  const steel = P({ color: 0xaab2b8, metalness: 1, roughness: 0.32, envMap: env, envMapIntensity: 1.0 });
  const gunmetal = P({ color: 0x30343b, metalness: 0.6, roughness: 0.45, envMap: env, envMapIntensity: 0.6 });
  const cream = P({ color: 0xf0e4c2, roughness: 0.5, envMap: env, envMapIntensity: 0.45 });
  const red = P({ color: 0xc3202c, roughness: 0.32, envMap: env, envMapIntensity: 0.6 });
  const tealPaint = P({ color: 0x17a89c, roughness: 0.35, envMap: env, envMapIntensity: 0.55 });
  const plum = P({ color: 0x1a1018, roughness: 0.35, envMap: env, envMapIntensity: 0.6 });
  const maroon = P({ color: 0x5b101b, roughness: 0.4 });
  const black = P({ color: 0x0e0e10, roughness: 0.6 });
  const rubber = P({ color: 0xb81f24, roughness: 0.8 });
  const vinyl = P({ color: 0x0d0d10, roughness: 0.28, metalness: 0.2, envMap: env, envMapIntensity: 0.9 });
  const vinylRed = P({ color: 0xb3151f, roughness: 0.3, metalness: 0.1, envMap: env, envMapIntensity: 0.8 });
  const vinylTeal = P({ color: 0x108f86, roughness: 0.3, metalness: 0.1, envMap: env, envMapIntensity: 0.8 });
  const vinylAmber = P({ color: 0xd98a12, roughness: 0.3, metalness: 0.1, envMap: env, envMapIntensity: 0.8 });
  const grooveMat = P({ color: 0x2b2b32, roughness: 0.2, metalness: 0.4, envMap: env, envMapIntensity: 0.9 });
  const labelCream = P({ color: 0xf1e5c3, roughness: 0.6, envMap: env, envMapIntensity: 0.5 });
  const labelRed = P({ color: 0xd3202c, roughness: 0.6, envMap: env, envMapIntensity: 0.5 });
  const labelTeal = P({ color: 0x14a89b, roughness: 0.6, envMap: env, envMapIntensity: 0.5 });
  const labelAmber = P({ color: 0xf0a31b, roughness: 0.6, envMap: env, envMapIntensity: 0.5 });
  const lampAmber = P({ color: 0xffb02e, emissive: 0xffa020, emissiveIntensity: 1.6, roughness: 0.3 });
  const lampRed = P({ color: 0xff3a30, emissive: 0xff2018, emissiveIntensity: 1.5, roughness: 0.3 });
  const lampTeal = P({ color: 0x30f0dc, emissive: 0x20e8d0, emissiveIntensity: 1.6, roughness: 0.3 });

  const tubeRed = P({ color: 0xd8121c, emissive: 0xff2a22, emissiveIntensity: 1.5, roughness: 0.25 });
  const tubeAmber = P({ color: 0xe89a10, emissive: 0xffa81a, emissiveIntensity: 1.5, roughness: 0.25 });
  const tubeTeal = P({ color: 0x12b8a8, emissive: 0x20e8d0, emissiveIntensity: 1.4, roughness: 0.25 });
  const hiRed = P({ color: 0xffe0dc, emissive: 0xffc9c0, emissiveIntensity: 1.2, roughness: 0.3 });
  const hiAmber = P({ color: 0xfff4d0, emissive: 0xffeaa8, emissiveIntensity: 1.2, roughness: 0.3 });
  const hiTeal = P({ color: 0xdcfff8, emissive: 0xb8fff4, emissiveIntensity: 1.2, roughness: 0.3 });
  const haloOpts = { color: 0x000000, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, roughness: 1 };
  const haloRed = P({ ...haloOpts, emissive: 0xff2a22 });
  const haloAmber = P({ ...haloOpts, emissive: 0xffa81a });
  const haloTeal = P({ ...haloOpts, emissive: 0x20e8d0 });

  const glassMat = P({
    color: 0xcdf5f2,
    metalness: 0,
    roughness: 0.04,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    envMap: env,
    envMapIntensity: 1.6,
  });

  const glowTex = makeGlowTexture();
  glowTex.repeat.set(1 / 0.576, 1 / 0.508);
  glowTex.offset.set(0.5, -0.93 / 0.508);
  const liningCap = P({ map: glowTex, emissiveMap: glowTex, emissive: 0xffffff, emissiveIntensity: 0.95, roughness: 1, side: THREE.BackSide });
  const liningSide = P({ color: 0x6b2312, emissive: 0x3a1206, emissiveIntensity: 1, roughness: 0.8, side: THREE.BackSide });

  const grilleMat = P({ map: makeGrilleTexture(), roughness: 0.9, envMap: env, envMapIntensity: 0.3 });
  const bannerMat = P({ map: makeBannerTexture(), roughness: 0.4, envMap: env, envMapIntensity: 0.5 });
  const deckMat = P({ map: makeDeckTexture(), roughness: 0.4, envMap: env, envMapIntensity: 0.5 });
  const coinMat = P({ map: makeCoinTexture(), roughness: 0.4, envMap: env, envMapIntensity: 0.5 });
  const cardAtlas = makeCardAtlas(9, 3);
  const cardMat = P({ map: cardAtlas, roughness: 0.5, envMap: env, envMapIntensity: 0.4 });
  const buttonAtlas = makeButtonAtlas(9, 3);
  const buttonMat = P({ map: buttonAtlas, roughness: 0.35, envMap: env, envMapIntensity: 0.6 });

  /* ================================================================ */
  /* base and lower cabinet                                            */
  /* ================================================================ */
  box(root, 0.9, 0.09, 0.56, gunmetal, 0, 0.045, 0);
  box(root, 0.86, 0.07, 0.012, steel, 0, 0.05, 0.286);
  box(root, 1.03, 0.014, 0.66, chrome, 0, 0.097, 0.01);
  box(root, 1.0, 0.475, 0.62, cream, 0, 0.3375, 0.01);

  // corner rods
  const cornerGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.471, 8);
  for (const sx of [-1, 1]) {
    addMesh(root, cornerGeo, chrome, sx * 0.5, 0.3395, 0.32);
    addMesh(root, cornerGeo, chrome, sx * 0.5, 0.3395, -0.3);
  }

  // bottom teal band with chrome pinstripes
  box(root, 0.97, 0.022, 0.004, tealPaint, 0, 0.126, 0.322);
  box(root, 0.97, 0.004, 0.005, chrome, 0, 0.11, 0.322);
  box(root, 0.97, 0.004, 0.005, chrome, 0, 0.142, 0.322);

  // front pilasters
  for (const sx of [-1, 1]) {
    const x = sx * 0.445;
    box(root, 0.07, 0.34, 0.004, chrome, x, 0.31, 0.322);
    box(root, 0.058, 0.328, 0.005, tealPaint, x, 0.31, 0.3235);
    addMesh(root, starGeo(0.026, 0.011, 0.006), chrome, x, 0.34, 0.329);
    addMesh(root, starGeo(0.018, 0.0075, 0.006), chrome, x, 0.27, 0.329);
    addMesh(root, starGeo(0.018, 0.0075, 0.006), chrome, x, 0.2, 0.329);
  }

  /* ---- speaker grille with starburst ---- */
  const GY = 0.305;
  box(root, 0.792, 0.016, 0.02, chrome, 0, GY + 0.168, 0.33);
  box(root, 0.792, 0.016, 0.02, chrome, 0, GY - 0.168, 0.33);
  box(root, 0.016, 0.352, 0.02, chrome, 0.388, GY, 0.33);
  box(root, 0.016, 0.352, 0.02, chrome, -0.388, GY, 0.33);
  addMesh(root, new THREE.PlaneGeometry(0.76, 0.32), grilleMat, 0, GY, 0.3215);

  const AX = 0.35;
  const AY = 0.148;
  const tipGeo = new THREE.SphereGeometry(0.011, 8, 6);
  for (let i = 0; i < 16; i++) {
    const th = (i / 16) * Math.PI * 2;
    const cs = Math.cos(th);
    const sn = Math.sin(th);
    const full = 1 / Math.sqrt((cs / AX) ** 2 + (sn / AY) ** 2);
    const long = i % 2 === 0;
    const L = full * (long ? 1 : 0.55);
    const start = 0.034;
    const len = L - start - (long ? 0.012 : 0);
    const m = addMesh(root, rayGeo(len, long ? 0.03 : 0.02, 0.006), chrome, cs * start, GY + sn * start, 0.3225);
    m.rotation.z = th;
    if (long) addMesh(root, tipGeo, chrome, cs * (L - 0.006), GY + sn * (L - 0.006), 0.3255);
  }
  cylZ(root, 0.042, 0.042, 0.012, 16, chrome, 0, GY, 0.3265);
  cylZ(root, 0.03, 0.03, 0.003, 16, red, 0, GY, 0.334);
  addMesh(root, new THREE.SphereGeometry(0.013, 10, 6), chrome, 0, GY, 0.336);

  /* ---- banner ---- */
  box(root, 0.8, 0.074, 0.01, chrome, 0, 0.53, 0.325);
  addMesh(root, new THREE.PlaneGeometry(0.76, 0.06), bannerMat, 0, 0.53, 0.3305);
  const jewelGeo = new THREE.SphereGeometry(0.016, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  for (const sx of [-1, 1]) {
    const x = sx * 0.445;
    const ring = addMesh(root, new THREE.TorusGeometry(0.02, 0.005, 6, 14), chrome, x, 0.53, 0.325);
    ring.rotation.z = 0;
    const j = addMesh(root, jewelGeo, sx < 0 ? lampRed : lampAmber, x, 0.53, 0.327);
    j.rotation.x = Math.PI / 2;
  }

  // back vents
  for (let i = 0; i < 6; i++) box(root, 0.5, 0.012, 0.004, black, 0, 0.18 + i * 0.03, -0.302);
  box(root, 0.56, 0.2, 0.004, chrome, 0, 0.255, -0.3);

  /* ---- cabinet sides ---- */
  for (const sx of [-1, 1]) {
    box(root, 0.006, 0.372, 0.452, chrome, sx * 0.503, 0.34, 0.02);
    box(root, 0.008, 0.34, 0.42, tealPaint, sx * 0.5035, 0.34, 0.02);
    const st = addMesh(root, starGeo(0.085, 0.036, 0.008), chrome, sx * 0.51, 0.34, 0.02);
    st.rotation.y = (sx * Math.PI) / 2;
    box(root, 0.006, 0.012, 0.62, red, sx * 0.503, 0.553, 0.01);
    box(root, 0.006, 0.012, 0.62, red, sx * 0.503, 0.14, 0.01);
    box(root, 0.007, 0.004, 0.62, chrome, sx * 0.504, 0.568, 0.01);
    box(root, 0.007, 0.004, 0.62, chrome, sx * 0.504, 0.126, 0.01);
  }

  /* ================================================================ */
  /* mid section: sloped control deck                                  */
  /* ================================================================ */
  const midShape = new THREE.Shape();
  midShape.moveTo(-0.3, 0.575);
  midShape.lineTo(0.335, 0.575);
  midShape.lineTo(0.225, 0.88);
  midShape.lineTo(0.2, 0.9);
  midShape.lineTo(-0.3, 0.9);
  midShape.closePath();
  const mid = addMesh(root, new THREE.ExtrudeGeometry(midShape, { depth: 1.0, bevelEnabled: false }), cream);
  mid.rotation.y = -Math.PI / 2;
  mid.position.x = 0.5;

  // chrome nosing under the deck
  box(root, 1.02, 0.02, 0.032, chrome, 0, 0.586, 0.328);
  // chrome sill above the deck, below the window
  box(root, 1.0, 0.035, 0.062, chrome, 0, 0.9125, 0.231);
  box(root, 0.96, 0.008, 0.07, steel, 0, 0.934, 0.231);

  const slopeTheta = Math.atan2(0.11, 0.305);
  const slopeLen = Math.hypot(0.11, 0.305);
  const deck = new THREE.Group();
  deck.position.set(0, 0.7275, 0.28);
  deck.rotation.x = -slopeTheta;
  root.add(deck);

  box(deck, 0.92, slopeLen, 0.006, maroon, 0, 0, 0.003);
  addMesh(deck, new THREE.PlaneGeometry(0.92, slopeLen), deckMat, 0, 0, 0.0062);
  box(deck, 0.96, 0.014, 0.014, chrome, 0, slopeLen / 2 + 0.006, 0.007);
  box(deck, 0.96, 0.014, 0.014, chrome, 0, -slopeLen / 2 - 0.006, 0.007);
  box(deck, 0.014, slopeLen + 0.02, 0.014, chrome, 0.467, 0, 0.007);
  box(deck, 0.014, slopeLen + 0.02, 0.014, chrome, -0.467, 0, 0.007);

  const zb = 0.007;
  const colX = (i: number) => -0.075 + (i - 4) * 0.075;
  const cardY = (k: number) => 0.107 - k * 0.085;
  const btnY = (k: number) => cardY(k) - 0.04;
  const ringGeo = new THREE.CylinderGeometry(0.0195, 0.0195, 0.004, 14);
  const bodyGeo = new THREE.CylinderGeometry(0.0155, 0.0175, 0.012, 12);
  const frameGeo = new THREE.BoxGeometry(0.068, 0.034, 0.004);
  for (let k = 0; k < 3; k++) {
    for (let i = 0; i < 9; i++) {
      const x = colX(i);
      addMesh(deck, frameGeo, chrome, x, cardY(k), zb + 0.002);
      addMesh(deck, atlasCell(new THREE.PlaneGeometry(0.062, 0.028), i, k, 9, 3), cardMat, x, cardY(k), zb + 0.0042);
      const y = btnY(k);
      const r1 = addMesh(deck, ringGeo, chrome, x, y, zb + 0.002);
      r1.rotation.x = Math.PI / 2;
      const b1 = addMesh(deck, bodyGeo, chrome, x, y, zb + 0.01);
      b1.rotation.x = Math.PI / 2;
      addMesh(deck, atlasCell(new THREE.CircleGeometry(0.0125, 14), i, k, 9, 3), buttonMat, x, y, zb + 0.0162);
    }
  }

  /* ---- coin plate ---- */
  const coin = new THREE.Group();
  coin.position.set(0.38, 0, zb);
  deck.add(coin);
  box(coin, 0.13, 0.31, 0.008, chrome, 0, 0, 0.004);
  addMesh(coin, new THREE.PlaneGeometry(0.11, 0.27), coinMat, 0, 0, 0.0085);
  box(coin, 0.074, 0.034, 0.008, chrome, 0, 0.025, 0.0125);
  box(coin, 0.05, 0.008, 0.009, black, 0, 0.025, 0.0135);
  box(coin, 0.004, 0.022, 0.003, lampAmber, -0.03, 0.025, 0.0175);
  box(coin, 0.004, 0.022, 0.003, lampAmber, 0.03, 0.025, 0.0175);
  addMesh(coin, new THREE.TorusGeometry(0.026, 0.005, 6, 14), chrome, 0, -0.08, 0.0105);
  addMesh(coin, new THREE.CircleGeometry(0.022, 14), black, 0, -0.08, 0.0098);
  box(coin, 0.03, 0.006, 0.006, steel, 0, -0.066, 0.0125);

  /* ================================================================ */
  /* upper arch                                                        */
  /* ================================================================ */
  const ys = 1.15;
  const shellRear = addMesh(root, new THREE.ExtrudeGeometry(archShape(0.5, 0.9, ys), { depth: 0.15, bevelEnabled: false, curveSegments: 10 }), cream);
  shellRear.position.z = -0.3;
  const frontShape = archShape(0.5, 0.9, ys);
  frontShape.holes.push(windowShape(0.29, 0.93, ys));
  const shellFront = addMesh(root, new THREE.ExtrudeGeometry(frontShape, { depth: 0.35, bevelEnabled: false, curveSegments: 10 }), cream);
  shellFront.position.z = -0.15;

  // dark backing band behind the tubes
  const bandShape = archShape(0.478, 0.9, ys);
  bandShape.holes.push(windowShape(0.296, 0.93, ys));
  addMesh(root, new THREE.ExtrudeGeometry(bandShape, { depth: 0.01, bevelEnabled: false, curveSegments: 10 }), plum, 0, 0, 0.2);

  // chrome outer rims (front and back)
  addMesh(root, new THREE.ExtrudeGeometry(archRingShape(0.503, 0.478, 0.9, ys), { depth: 0.028, bevelEnabled: false, curveSegments: 10 }), chrome, 0, 0, 0.2);
  addMesh(root, new THREE.ExtrudeGeometry(archRingShape(0.503, 0.478, 0.9, ys), { depth: 0.03, bevelEnabled: false, curveSegments: 10 }), chrome, 0, 0, -0.302);

  /* ---- glowing tubes ---- */
  const yb = 0.92;
  const zT = 0.232;
  const tubeDefs = [
    { r: 0.445, tube: tubeRed, hi: hiRed, halo: haloRed },
    { r: 0.39, tube: tubeAmber, hi: hiAmber, halo: haloAmber },
    { r: 0.338, tube: tubeTeal, hi: hiTeal, halo: haloTeal },
  ];
  for (const d of tubeDefs) {
    const path = new ArchCurve(d.r, yb, ys, zT);
    addMesh(root, new THREE.TubeGeometry(path, 30, 0.019, 8, false), d.tube);
    const halo = addMesh(root, new THREE.TubeGeometry(path, 30, 0.034, 8, false), d.halo);
    noShadow.push(halo);
    const pathH = new ArchCurve(d.r + 0.007, yb, ys, zT + 0.0125);
    addMesh(root, new THREE.TubeGeometry(pathH, 30, 0.0045, 5, false), d.hi);
  }
  for (const r of [0.4175, 0.364]) {
    addMesh(root, new THREE.TubeGeometry(new ArchCurve(r, yb, ys, zT), 30, 0.005, 5, false), chrome);
  }
  // chrome bezel round the window
  addMesh(root, new THREE.TubeGeometry(new ArchCurve(0.3, yb, ys, 0.226), 30, 0.012, 6, false), chrome);

  // chrome ribs crossing the tubes
  const ribGeo = new THREE.BoxGeometry(0.185, 0.012, 0.008);
  for (let i = 0; i <= 8; i++) {
    const ph = (i * Math.PI) / 8;
    const m = addMesh(root, ribGeo, chrome, Math.cos(ph) * 0.39, ys + Math.sin(ph) * 0.39, 0.2565);
    m.rotation.z = ph;
  }
  for (const yy of [1.07, 0.99]) {
    addMesh(root, ribGeo, chrome, 0.39, yy, 0.2565);
    addMesh(root, ribGeo, chrome, -0.39, yy, 0.2565);
  }

  /* ---- window interior ---- */
  const liningGeo = new THREE.ExtrudeGeometry(windowShape(0.288, 0.93, ys), { depth: 0.345, bevelEnabled: false, curveSegments: 10 });
  addMesh(root, liningGeo, [liningCap, liningSide] as unknown as THREE.Material, 0, 0, -0.145);

  box(root, 0.58, 0.03, 0.34, gunmetal, 0, 0.945, 0.01);
  box(root, 0.58, 0.012, 0.008, chrome, 0, 0.954, 0.184);

  const A = 0.55;
  const H = 0.2 * Math.tan(A);
  const y0 = 0.96;

  const buildWedge = (cx: number) => {
    const s = new THREE.Shape();
    s.moveTo(-0.1, 0);
    s.lineTo(0.1, 0);
    s.lineTo(-0.1, H);
    s.closePath();
    const m = addMesh(root, new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: false }), steel);
    m.rotation.y = -Math.PI / 2;
    m.position.set(cx + 0.1, y0, 0);
  };
  const grooves = (parent: THREE.Object3D, y: number) => {
    for (const r of [0.07, 0.055, 0.042]) {
      const m = addMesh(parent, new THREE.RingGeometry(r - 0.0025, r, 28), grooveMat, 0, y, 0);
      m.rotation.x = -Math.PI / 2;
    }
  };

  // --- record stack on a tilted spindle
  buildWedge(-0.125);
  const G1 = new THREE.Group();
  G1.position.set(-0.125, y0 + H / 2, 0);
  G1.rotation.x = A;
  root.add(G1);
  G1.updateMatrix();

  addMesh(G1, new THREE.CylinderGeometry(0.093, 0.093, 0.008, 24), chrome, 0, 0.004, 0);
  const discGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.0055, 28);
  const vinylSeq = [vinyl, vinyl, vinylRed, vinyl, vinyl, vinylAmber, vinyl, vinylTeal, vinyl, vinyl, vinylRed, vinyl, vinylAmber, vinyl, vinyl, vinyl];
  let topY = 0;
  for (let k = 0; k < 16; k++) {
    const dy = 0.008 + 0.00275 + k * 0.0068;
    addMesh(G1, discGeo, vinylSeq[k], (rand() - 0.5) * 0.006, dy, (rand() - 0.5) * 0.006);
    topY = dy;
  }
  addMesh(G1, new THREE.CylinderGeometry(0.03, 0.03, 0.0062, 20), labelRed, 0, topY + 0.0004, 0);
  grooves(G1, topY + 0.003);
  addMesh(G1, new THREE.CylinderGeometry(0.0035, 0.0035, 0.145, 8), chrome, 0, 0.0805, 0);
  addMesh(G1, new THREE.SphereGeometry(0.006, 8, 6), chrome, 0, 0.153, 0);

  // lifted record held by the picker arm
  const pivotLocal = new THREE.Vector3(0, 0.19, -0.088);
  const lift = new THREE.Group();
  lift.position.copy(pivotLocal);
  lift.rotation.x = -0.2;
  G1.add(lift);
  addMesh(lift, discGeo, vinyl, 0, 0, 0.088);
  addMesh(lift, new THREE.CylinderGeometry(0.03, 0.03, 0.0062, 20), labelTeal, 0, 0.0004, 0.088);
  const lg = new THREE.Group();
  lg.position.set(0, 0.003, 0.088);
  lift.add(lg);
  grooves(lg, 0);
  box(lift, 0.036, 0.022, 0.006, chrome, 0, 0, -0.006);
  box(lift, 0.036, 0.005, 0.02, chrome, 0, 0.0085, 0.0);
  box(lift, 0.036, 0.005, 0.02, chrome, 0, -0.0085, 0.0);
  box(lift, 0.026, 0.0025, 0.014, rubber, 0, 0.0057, 0.002);
  box(lift, 0.026, 0.0025, 0.014, rubber, 0, -0.0057, 0.002);

  const pivotW = pivotLocal.clone().applyMatrix4(G1.matrix);

  // --- picker arm
  const postBase = new THREE.Vector3(0, y0, -0.11);
  const T = new THREE.Vector3(0, 1.3, -0.11);
  const E = new THREE.Vector3(-0.05, 1.335, -0.04);
  const J = pivotW.clone().add(new THREE.Vector3(0, 0.014, 0));
  addMesh(root, new THREE.CylinderGeometry(0.03, 0.034, 0.014, 14), chrome, postBase.x, y0 + 0.007, postBase.z);
  rod(root, postBase, T, 0.011, chrome, 8);
  addMesh(root, new THREE.CylinderGeometry(0.017, 0.017, 0.03, 12), red, T.x, 1.1, T.z);
  addMesh(root, new THREE.SphereGeometry(0.019, 10, 8), chrome, T.x, T.y, T.z);
  rod(root, T, E, 0.008, chrome, 8);
  addMesh(root, new THREE.SphereGeometry(0.013, 8, 6), chrome, E.x, E.y, E.z);
  rod(root, E, J, 0.007, chrome, 8);

  // --- turntable with tonearm
  buildWedge(0.13);
  const G2 = new THREE.Group();
  G2.position.set(0.13, y0 + H / 2, 0);
  G2.rotation.x = A;
  root.add(G2);
  addMesh(G2, new THREE.CylinderGeometry(0.1, 0.1, 0.014, 26), gunmetal, 0, 0.007, 0);
  addMesh(G2, new THREE.CylinderGeometry(0.104, 0.104, 0.004, 26), chrome, 0, 0.012, 0);
  addMesh(G2, new THREE.CylinderGeometry(0.088, 0.088, 0.003, 28), vinyl, 0, 0.0165, 0);
  addMesh(G2, new THREE.CylinderGeometry(0.03, 0.03, 0.0035, 20), labelAmber, 0, 0.0172, 0);
  const g2g = new THREE.Group();
  g2g.position.set(0, 0.0182, 0);
  G2.add(g2g);
  grooves(g2g, 0);
  addMesh(G2, new THREE.CylinderGeometry(0.0035, 0.0035, 0.02, 8), chrome, 0, 0.027, 0);
  const armPivot = new THREE.Vector3(0.125, 0.032, -0.045);
  const armHead = new THREE.Vector3(0.05, 0.026, 0.02);
  addMesh(G2, new THREE.CylinderGeometry(0.017, 0.019, 0.026, 12), chrome, armPivot.x, 0.013, armPivot.z);
  rod(G2, armPivot, armHead, 0.004, chrome, 6);
  const armDir = new THREE.Vector3().subVectors(armHead, armPivot).normalize();
  rod(G2, armPivot.clone().addScaledVector(armDir, -0.012), armPivot.clone().addScaledVector(armDir, -0.04), 0.009, chrome, 8);
  box(G2, 0.014, 0.006, 0.03, black, armHead.x, armHead.y, armHead.z + 0.006);
  box(G2, 0.008, 0.006, 0.01, rubber, armHead.x, armHead.y - 0.005, armHead.z + 0.018);

  /* ---- domed glass ---- */
  const glass = addMesh(
    root,
    new THREE.ExtrudeGeometry(windowShape(0.29, 0.93, ys), {
      depth: 0.01,
      bevelEnabled: true,
      bevelThickness: 0.07,
      bevelSize: 0.18,
      bevelOffset: -0.18,
      bevelSegments: 5,
      curveSegments: 8,
    }),
    glassMat,
    0,
    0,
    0.19,
  );
  noShadow.push(glass);

  /* ---- finial at the crown ---- */
  addMesh(root, new THREE.CylinderGeometry(0.014, 0.018, 0.05, 8), chrome, 0, 1.665, 0.214);
  addMesh(root, starGeo(0.052, 0.023, 0.012), chrome, 0, 1.738, 0.214);
  addMesh(root, new THREE.SphereGeometry(0.012, 8, 6), lampTeal, 0, 1.738, 0.222);
  for (const sx of [-1, 1]) {
    addMesh(root, new THREE.SphereGeometry(0.011, 8, 6), chrome, sx * 0.07, 1.62, 0.214);
  }

  /* ---- shadows ---- */
  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  for (const o of noShadow) {
    o.castShadow = false;
    o.receiveShadow = false;
  }

  return root;
}
