```ts
import * as THREE from "three";

export const meta = {
  name: "Jukebox",
  description:
    "A 1940s-style arched jukebox: walnut cabinet, burgundy-and-gold speaker grille, glowing marquee, sloped selector deck with buttons and title card, and a rainbow light-tube arch around a window holding a record carousel on a sunburst back panel, with a gold crest on top.",
};

const TAU = Math.PI * 2;
type Ctx = CanvasRenderingContext2D;

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

function canvasTex(
  w: number,
  h: number,
  draw: (g: Ctx, w: number, h: number) => void
): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  if (!g) return null;
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function star(g: Ctx, cx: number, cy: number, r: number, color: string) {
  g.fillStyle = color;
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr;
    if (i) g.lineTo(x, y);
    else g.moveTo(x, y);
  }
  g.closePath();
  g.fill();
}

function drawRecord(g: Ctx, w: number, h: number, c1: string, c2: string, c3: string, variant: number) {
  const cx = w / 2;
  const cy = h / 2;
  g.fillStyle = "#17171b";
  g.fillRect(0, 0, w, h);
  for (let r = w * 0.27; r < w * 0.495; r += 2.5) {
    g.strokeStyle = Math.floor(r / 2.5) % 2 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.4)";
    g.lineWidth = 1;
    g.beginPath();
    g.arc(cx, cy, r, 0, TAU);
    g.stroke();
  }
  g.fillStyle = "rgba(255,255,255,0.10)";
  for (const a0 of [0.3, Math.PI + 0.3]) {
    g.beginPath();
    g.moveTo(cx, cy);
    g.arc(cx, cy, w * 0.49, a0, a0 + 0.35);
    g.closePath();
    g.fill();
  }
  g.fillStyle = c1;
  g.beginPath();
  g.arc(cx, cy, w * 0.25, 0, TAU);
  g.fill();
  g.strokeStyle = c2;
  g.lineWidth = 3;
  g.beginPath();
  g.arc(cx, cy, w * 0.22, 0, TAU);
  g.stroke();
  g.fillStyle = c3;
  if (variant === 0) {
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU;
      g.beginPath();
      g.arc(cx + Math.cos(a) * w * 0.15, cy + Math.sin(a) * w * 0.15, 2.2, 0, TAU);
      g.fill();
    }
  } else if (variant === 1) {
    g.fillRect(cx - w * 0.2, cy - 4, w * 0.4, 8);
  } else if (variant === 2) {
    star(g, cx, cy, w * 0.15, c3);
  } else {
    g.beginPath();
    g.arc(cx, cy, w * 0.16, 0, Math.PI);
    g.closePath();
    g.fill();
  }
  g.fillStyle = "#0a0a0c";
  g.beginPath();
  g.arc(cx, cy, w * 0.03, 0, TAU);
  g.fill();
}

function archPts(r: number, yb: number, ys: number, segs: number): THREE.Vector2[] {
  const pts: THREE.Vector2[] = [
    new THREE.Vector2(-r, yb),
    new THREE.Vector2(r, yb),
    new THREE.Vector2(r, ys),
  ];
  for (let i = 1; i < segs; i++) {
    const a = (i / segs) * Math.PI;
    pts.push(new THREE.Vector2(r * Math.cos(a), ys + r * Math.sin(a)));
  }
  pts.push(new THREE.Vector2(-r, ys));
  return pts;
}

function ringGeo(outerR: number, innerR: number, yBO: number, yBI: number, ys: number, depth: number, segs: number) {
  const s = new THREE.Shape(archPts(outerR, yBO, ys, segs));
  s.holes.push(new THREE.Path(archPts(innerR, yBI, ys, segs)));
  return new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
}

function planarUV(geo: THREE.BufferGeometry) {
  geo.computeBoundingBox();
  const bb = geo.boundingBox!;
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(
      i,
      (pos.getX(i) - bb.min.x) / (bb.max.x - bb.min.x),
      (pos.getY(i) - bb.min.y) / (bb.max.y - bb.min.y)
    );
  }
  uv.needsUpdate = true;
}

function extrudeX(pts: [number, number][], width: number) {
  const s = new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], p[1])));
  const g = new THREE.ExtrudeGeometry(s, { depth: width, bevelEnabled: false });
  g.rotateY(-Math.PI / 2);
  g.translate(width / 2, 0, 0);
  return g;
}

export default function buildJukebox(): THREE.Object3D {
  const rnd = mulberry32(1948);
  const root = new THREE.Group();
  root.name = "Jukebox";

  // ---------- helpers ----------
  const std = (color: number, o: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0, flatShading: true, ...o });

  const box = (
    w: number, h: number, d: number, m: THREE.Material,
    x: number, y: number, z: number, p: THREE.Object3D = root
  ) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    p.add(mesh);
    return mesh;
  };

  const cyl = (
    rt: number, rb: number, h: number, seg: number, m: THREE.Material | THREE.Material[],
    x: number, y: number, z: number, p: THREE.Object3D = root, axis: "x" | "y" | "z" = "y"
  ) => {
    const g = new THREE.CylinderGeometry(rt, rb, h, seg);
    if (axis === "z") g.rotateX(Math.PI / 2);
    else if (axis === "x") g.rotateZ(Math.PI / 2);
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(x, y, z);
    p.add(mesh);
    return mesh;
  };

  const frame = (
    cx: number, cy: number, w: number, h: number, t: number, d: number,
    m: THREE.Material, z: number, p: THREE.Object3D = root
  ) => {
    box(w + 2 * t, t, d, m, cx, cy + h / 2 + t / 2, z, p);
    box(w + 2 * t, t, d, m, cx, cy - h / 2 - t / 2, z, p);
    box(t, h, d, m, cx - w / 2 - t / 2, cy, z, p);
    box(t, h, d, m, cx + w / 2 + t / 2, cy, z, p);
  };

  // ---------- textures ----------
  const woodTex = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#7b4626";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      const x = rnd() * w;
      const dark = rnd() < 0.55;
      g.strokeStyle = dark
        ? `rgba(45,20,8,${0.1 + rnd() * 0.22})`
        : `rgba(210,140,80,${0.06 + rnd() * 0.14})`;
      g.lineWidth = 1 + rnd() * 3.5;
      g.beginPath();
      g.moveTo(x, 0);
      const ph = rnd() * 6;
      const amp = 1 + rnd() * 5;
      for (let y = 8; y <= h; y += 8) g.lineTo(x + Math.sin(y * 0.04 + ph) * amp, y);
      g.stroke();
    }
  });
  if (woodTex) {
    woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping;
    woodTex.repeat.set(2, 2);
  }

  const grilleTex = canvasTex(640, 256, (g, w, h) => {
    g.fillStyle = "#5b1526";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(0,0,0,0.25)";
    g.lineWidth = 1;
    for (let x = 0; x < w; x += 4) {
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke();
    }
    g.strokeStyle = "rgba(255,180,200,0.10)";
    for (let y = 0; y < h; y += 4) {
      g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
    }
    g.strokeStyle = "#d9a441";
    g.lineWidth = 3;
    const s = 64;
    for (let k = -h; k < w + h; k += s) {
      g.beginPath(); g.moveTo(k, 0); g.lineTo(k + h, h); g.stroke();
      g.beginPath(); g.moveTo(k, h); g.lineTo(k + h, 0); g.stroke();
    }
    g.fillStyle = "#f3d27a";
    for (let x = 0; x <= w; x += s) {
      for (let y = 0; y <= h; y += s) {
        g.beginPath(); g.arc(x + 32, y, 4, 0, TAU); g.fill();
      }
    }
  });

  const headerTex = canvasTex(1024, 128, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "#c22a20");
    grd.addColorStop(1, "#6e120f");
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#f6e3b4";
    g.lineWidth = 4;
    g.strokeRect(8, 8, w - 16, h - 16);
    g.lineWidth = 1.5;
    g.strokeRect(15, 15, w - 30, h - 30);
    g.textAlign = "center";
    g.textBaseline = "middle";
    try { (g as any).letterSpacing = "8px"; } catch (e) { /* optional */ }
    g.font = '900 86px Impact, "Arial Black", sans-serif';
    g.fillStyle = "#2a0a08";
    g.fillText("JUKEBOX", w / 2 + 5, h / 2 + 6);
    g.fillStyle = "#ffe9a8";
    g.fillText("JUKEBOX", w / 2, h / 2);
    try { (g as any).letterSpacing = "2px"; } catch (e) { /* optional */ }
    g.font = 'bold 24px "Arial Black", Arial, sans-serif';
    g.fillStyle = "#ffd25a";
    g.fillText("HI-FI", 120, h / 2 - 15);
    g.fillText("45 RPM", 120, h / 2 + 15);
    g.fillText("MUSIC", w - 120, h / 2 - 15);
    g.fillText("NICKEL", w - 120, h / 2 + 15);
    star(g, 235, h / 2, 17, "#ffd25a");
    star(g, w - 235, h / 2, 17, "#ffd25a");
  });

  const songs = [
    "Neon Rain", "Dancing Fool", "Moonlight Drive", "Cherry Soda", "Rocket Baby",
    "Slow Train South", "Honey Bee Boogie", "Blue Skies Twist", "Diner Lights", "Sweet Sixteen",
  ];
  const cardTex = canvasTex(920, 200, (g, w, h) => {
    g.fillStyle = "#f3e7c4";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#b3261e";
    g.fillRect(0, 0, w, 36);
    g.fillStyle = "#f6e3b4";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = 'bold 22px "Arial Black", Arial, sans-serif';
    g.fillText("\u2605  SELECT YOUR HIT  \u2605", w / 2, 19);
    g.textAlign = "left";
    for (let col = 0; col < 2; col++) {
      for (let row = 0; row < 5; row++) {
        const idx = col * 5 + row;
        const x = 22 + col * 450;
        const y = 36 + 8 + row * 31;
        g.fillStyle = idx % 3 === 0 ? "#c4271d" : idx % 3 === 1 ? "#1f7a78" : "#d99a1c";
        g.fillRect(x, y, 52, 25);
        g.fillStyle = "#fff6dc";
        g.font = "bold 17px Arial, sans-serif";
        g.textBaseline = "middle";
        g.fillText((col ? "B" : "A") + (row + 1), x + 8, y + 13);
        g.fillStyle = "#2a1a14";
        g.font = "bold 21px 'Trebuchet MS', Arial, sans-serif";
        g.fillText(songs[idx], x + 66, y + 13);
        g.strokeStyle = "rgba(60,30,10,0.35)";
        g.lineWidth = 1;
        g.beginPath(); g.moveTo(x, y + 28); g.lineTo(x + 400, y + 28); g.stroke();
      }
    }
  });

  const slopeLen = Math.hypot(0.18, 0.12);
  const plateTex = canvasTex(1024, 244, (g, w, h) => {
    g.fillStyle = "#1d1618";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#c79a3a";
    g.lineWidth = 3;
    g.strokeRect(6, 6, w - 12, h - 12);
    const px = (x: number) => ((x + 0.4) / 0.8) * w;
    const yMin = slopeLen / 2 - 0.095;
    const py = (y: number) => (1 - (y - yMin) / 0.19) * h;
    g.fillStyle = "#f3e6c0";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = "bold 20px Arial, sans-serif";
    for (let i = 0; i < 12; i++) g.fillText(String(i + 1), px(-0.22 + i * 0.04), py(0.068));
    g.font = "bold 15px Arial, sans-serif";
    g.fillStyle = "#d9a53a";
    g.fillText("VOLUME", px(-0.33), py(0.182));
    g.fillText("INSERT COIN", px(0.33), py(0.19));
    g.fillText("PRESS TO PLAY", px(0), py(0.027));
  });

  const glowTex = canvasTex(512, 512, (g, w, h) => {
    const cx = 256;
    const cy = 301;
    const n = 24;
    for (let i = 0; i < n; i++) {
      g.fillStyle = i % 2 ? "#ffcf4d" : "#ff8c1f";
      g.beginPath();
      g.moveTo(cx, cy);
      g.arc(cx, cy, 700, (i / n) * TAU, ((i + 1) / n) * TAU);
      g.closePath();
      g.fill();
    }
    const r1 = g.createRadialGradient(cx, cy, 10, cx, cy, 330);
    r1.addColorStop(0, "rgba(255,250,200,0.9)");
    r1.addColorStop(1, "rgba(255,140,30,0)");
    g.fillStyle = r1;
    g.fillRect(0, 0, w, h);
    const r2 = g.createRadialGradient(cx, cy, 160, cx, cy, 360);
    r2.addColorStop(0, "rgba(90,20,0,0)");
    r2.addColorStop(1, "rgba(90,20,0,0.55)");
    g.fillStyle = r2;
    g.fillRect(0, 0, w, h);
  });

  const labelDefs: [string, string, string][] = [
    ["#d63a2c", "#f6e3b4", "#1a1a1a"],
    ["#f2b632", "#1a1a1a", "#d63a2c"],
    ["#2aa6a0", "#f6e3b4", "#1d3b58"],
    ["#d9559b", "#fff2d8", "#6b1b46"],
  ];

  // ---------- materials ----------
  const walnut = std(woodTex ? 0xffffff : 0x7b4626, { map: woodTex ?? null, roughness: 0.5 });
  const woodDark = std(woodTex ? 0x7a625a : 0x3a2418, { map: woodTex ?? null, roughness: 0.6 });
  const chrome = std(0xdfe7ee, { metalness: 0.65, roughness: 0.25 });
  const brass = std(0xd9a53a, { metalness: 0.55, roughness: 0.35 });
  const black = std(0x16120f, { roughness: 0.5 });
  const rubber = std(0x241d1a, { roughness: 0.9 });
  const creamM = std(0xf3e6c0, { roughness: 0.5 });
  const redEnamel = std(0xc4271d, { roughness: 0.35 });
  const amberBtn = std(0xf0a21a, { roughness: 0.35 });
  const backingDark = std(0x1b1210, { roughness: 0.7 });
  const bulbMat = std(0xffc24a, { emissive: 0xffa526, emissiveIntensity: 0.9, roughness: 0.3 });

  const glowMat = (c: number) => std(c, { emissive: c, emissiveIntensity: 0.8, roughness: 0.3 });
  const tRed = glowMat(0xff3b2e);
  const tOrange = glowMat(0xff8a1f);
  const tYellow = glowMat(0xffd93a);
  const tLime = glowMat(0x8bf04a);
  const tCyan = glowMat(0x3fe0ff);

  const grilleMat = std(grilleTex ? 0xffffff : 0x5b1526, { map: grilleTex ?? null, roughness: 0.9 });
  const headerMat = std(headerTex ? 0xffffff : 0xa81f18, {
    map: headerTex ?? null, emissive: headerTex ? 0xffffff : 0x551008,
    emissiveMap: headerTex ?? null, emissiveIntensity: 0.55, roughness: 0.4,
  });
  const cardMat = std(cardTex ? 0xffffff : 0xf3e7c4, {
    map: cardTex ?? null, emissive: cardTex ? 0xffffff : 0x333022,
    emissiveMap: cardTex ?? null, emissiveIntensity: 0.25, roughness: 0.5,
  });
  const plateMat = std(plateTex ? 0xffffff : 0x1d1618, { map: plateTex ?? null, roughness: 0.6 });
  const glowPanelMat = std(glowTex ? 0xffffff : 0xffa030, {
    map: glowTex ?? null, emissive: glowTex ? 0xffffff : 0xff9a2e,
    emissiveMap: glowTex ?? null, emissiveIntensity: 0.75, roughness: 0.8,
  });
  const linerMat = std(0xe3a53a, { emissive: 0x3a1f00, emissiveIntensity: 0.6, metalness: 0.3, roughness: 0.5 });
  const glassMat = std(0xcfeaff, {
    transparent: true, opacity: 0.13, roughness: 0.1, depthWrite: false, side: THREE.DoubleSide,
  });
  const shineMat = std(0xffffff, {
    transparent: true, opacity: 0.12, roughness: 0.2, depthWrite: false, side: THREE.DoubleSide,
  });
  const vinylSide = std(0x121216, { roughness: 0.4 });
  const labelMats = labelDefs.map((d, k) => {
    const t = canvasTex(128, 128, (g, w, h) => drawRecord(g, w, h, d[0], d[1], d[2], k));
    return std(t ? 0xffffff : parseInt(d[0].slice(1), 16), { map: t ?? null, roughness: 0.35 });
  });

  // ---------- base ----------
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      cyl(0.034, 0.04, 0.05, 8, rubber, sx * 0.39, 0.025, sz * 0.26);
    }
  }
  box(0.92, 0.1, 0.66, woodDark, 0, 0.1, 0);
  box(0.94, 0.03, 0.68, chrome, 0, 0.165, 0);
  // plinth vent slots
  for (let i = 0; i < 5; i++) box(0.012, 0.045, 0.004, black, -0.2 + i * 0.1, 0.10, 0.332);

  // ---------- lower cabinet ----------
  box(0.88, 0.46, 0.62, walnut, 0, 0.41, 0);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) cyl(0.014, 0.014, 0.46, 8, chrome, sx * 0.44, 0.41, sz * 0.31);
  }
  // side panels: chrome rectangle + medallion
  for (const sx of [-1, 1]) {
    const x = sx * 0.4425;
    box(0.006, 0.008, 0.508, chrome, x, 0.41 + 0.154, 0);
    box(0.006, 0.008, 0.508, chrome, x, 0.41 - 0.154, 0);
    box(0.006, 0.3, 0.008, chrome, x, 0.41, 0.254);
    box(0.006, 0.3, 0.008, chrome, x, 0.41, -0.254);
    cyl(0.05, 0.05, 0.008, 8, brass, sx * 0.444, 0.41, 0, root, "x");
    cyl(0.032, 0.032, 0.01, 8, redEnamel, sx * 0.446, 0.41, 0, root, "x");
    cyl(0.013, 0.013, 0.012, 6, creamM, sx * 0.448, 0.41, 0, root, "x");
  }

  // grille
  const gy = 0.365, gw = 0.72, gh = 0.27, zF = 0.31;
  const grille = new THREE.Mesh(new THREE.PlaneGeometry(gw, gh), grilleMat);
  grille.position.set(0, gy, zF + 0.002);
  root.add(grille);
  frame(0, gy, gw, gh, 0.015, 0.014, chrome, zF + 0.006);
  for (const x of [-0.27, -0.15, 0.15, 0.27]) box(0.012, gh, 0.012, chrome, x, gy, zF + 0.01);
  cyl(0.068, 0.068, 0.012, 12, brass, 0, gy, zF + 0.008, root, "z");
  cyl(0.047, 0.047, 0.012, 12, redEnamel, 0, gy, zF + 0.013, root, "z");
  cyl(0.022, 0.022, 0.012, 6, creamM, 0, gy, zF + 0.018, root, "z");

  // header sign
  const header = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.09), headerMat);
  header.position.set(0, 0.575, zF + 0.002);
  root.add(header);
  frame(0, 0.575, 0.72, 0.09, 0.012, 0.014, chrome, zF + 0.006);

  // back panel + screws
  box(0.7, 0.36, 0.006, woodDark, 0, 0.41, -0.313);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) cyl(0.008, 0.008, 0.008, 6, chrome, sx * 0.33, 0.41 + sy * 0.16, -0.318, root, "z");

  // ---------- control deck ----------
  const deck = new THREE.Mesh(
    extrudeX([[-0.31, 0.64], [0.38, 0.64], [0.38, 0.7], [0.2, 0.82], [-0.31, 0.82]], 0.88),
    walnut
  );
  root.add(deck);
  box(0.9, 0.05, 0.012, chrome, 0, 0.67, 0.386);
  const bulbGeo = new THREE.CylinderGeometry(0.0065, 0.0065, 0.008, 6);
  bulbGeo.rotateX(Math.PI / 2);
  for (let i = 0; i < 15; i++) {
    const b = new THREE.Mesh(bulbGeo, bulbMat);
    b.position.set(-0.42 + i * 0.06, 0.67, 0.394);
    root.add(b);
  }

  const slope = new THREE.Group();
  slope.position.set(0, 0.7, 0.38);
  slope.rotation.x = -(Math.PI / 2 - Math.atan2(0.12, 0.18));
  root.add(slope);

  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.19), plateMat);
  plate.position.set(0, slopeLen / 2, 0.0025);
  slope.add(plate);
  box(0.88, 0.012, 0.012, chrome, 0, 0.004, 0.004, slope);
  box(0.88, 0.012, 0.012, chrome, 0, slopeLen - 0.004, 0.004, slope);

  // buttons
  const btnRingGeo = new THREE.CylinderGeometry(0.017, 0.017, 0.005, 10);
  btnRingGeo.rotateX(Math.PI / 2);
  const btnGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.012, 8);
  btnGeo.rotateX(Math.PI / 2);
  const btnMats = [redEnamel, creamM, amberBtn];
  for (let i = 0; i < 12; i++) {
    const x = -0.22 + i * 0.04;
    const ring = new THREE.Mesh(btnRingGeo, chrome);
    ring.position.set(x, 0.04, 0.005);
    slope.add(ring);
    const b = new THREE.Mesh(btnGeo, btnMats[i % 3]);
    b.position.set(x, 0.04, 0.009);
    slope.add(b);
  }

  // title card
  const card = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.1), cardMat);
  card.position.set(0, 0.135, 0.003);
  slope.add(card);
  frame(0, 0.135, 0.46, 0.1, 0.008, 0.012, chrome, 0.006, slope);
  const cardGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.1), glassMat);
  cardGlass.position.set(0, 0.135, 0.011);
  slope.add(cardGlass);

  // coin mechanism
  box(0.1, 0.15, 0.008, chrome, 0.33, 0.105, 0.006, slope);
  cyl(0.02, 0.02, 0.008, 8, brass, 0.33, 0.14, 0.012, slope, "z");
  box(0.026, 0.006, 0.002, black, 0.33, 0.14, 0.017, slope);
  cyl(0.014, 0.014, 0.01, 8, redEnamel, 0.33, 0.075, 0.013, slope, "z");

  // volume dial
  cyl(0.033, 0.033, 0.006, 10, chrome, -0.33, 0.105, 0.006, slope, "z");
  cyl(0.025, 0.025, 0.022, 10, black, -0.33, 0.105, 0.017, slope, "z");
  const ind = box(0.004, 0.02, 0.002, creamM, -0.324, 0.112, 0.029, slope);
  ind.rotation.z = -0.5;
  for (let k = 0; k < 7; k++) {
    const a = ((-135 + k * 45) * Math.PI) / 180;
    const t = box(0.003, 0.009, 0.001, creamM, -0.33 + Math.sin(a) * 0.044, 0.105 + Math.cos(a) * 0.044, 0.0035, slope);
    t.rotation.z = -a;
  }

  // ---------- dome ----------
  const yb = 0.82, ys = 1.11, R = 0.44;
  const backGeo = new THREE.ExtrudeGeometry(new THREE.Shape(archPts(R, yb, ys, 16)), {
    depth: 0.09, bevelEnabled: false,
  });
  const domeBack = new THREE.Mesh(backGeo, walnut);
  domeBack.position.z = -0.31;
  root.add(domeBack);

  const frameShape = new THREE.Shape(archPts(R, yb, ys, 16));
  frameShape.holes.push(new THREE.Path(archPts(0.3, 0.9, ys, 12)));
  const domeFront = new THREE.Mesh(
    new THREE.ExtrudeGeometry(frameShape, { depth: 0.42, bevelEnabled: false }),
    walnut
  );
  domeFront.position.z = -0.22;
  root.add(domeFront);

  // base trim
  box(0.9, 0.012, 0.52, chrome, 0, 0.826, -0.055);

  // liner inside window
  const liner = new THREE.Mesh(ringGeo(0.2995, 0.292, 0.9005, 0.908, ys, 0.42, 12), linerMat);
  liner.position.z = -0.22;
  root.add(liner);

  // glowing sunburst back panel
  const glowGeo = new THREE.ShapeGeometry(new THREE.Shape(archPts(0.3, 0.9, ys, 12)));
  planarUV(glowGeo);
  const glowPanel = new THREE.Mesh(glowGeo, glowPanelMat);
  glowPanel.position.z = -0.219;
  root.add(glowPanel);

  // shelf
  box(0.58, 0.02, 0.4, brass, 0, 0.91, -0.02);

  // record carousel
  const wheel = new THREE.Group();
  wheel.position.set(0, 1.15, -0.06);
  root.add(wheel);
  const ringR = 0.16, discR = 0.058;
  const discGeo = new THREE.CylinderGeometry(discR, discR, 0.006, 20);
  discGeo.rotateX(Math.PI / 2);
  const labelIdx = [1, 2, 0, 3, 2, 1, 0, 3];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const x = Math.cos(a) * ringR;
    const y = Math.sin(a) * ringR;
    const lab = labelMats[labelIdx[i]];
    const disc = new THREE.Mesh(discGeo, [vinylSide, lab, lab]);
    disc.position.set(x, y, 0);
    wheel.add(disc);
    cyl(0.009, 0.009, 0.02, 6, chrome, x, y, 0.004, wheel, "z");
    cyl(0.016, 0.016, 0.01, 6, chrome, x, y, -0.008, wheel, "z");
    const spoke = box(ringR, 0.012, 0.008, chrome, Math.cos(a) * ringR * 0.5, Math.sin(a) * ringR * 0.5, -0.012, wheel);
    spoke.rotation.z = a;
  }
  const rim = new THREE.Mesh(new THREE.TorusGeometry(ringR, 0.005, 5, 24), chrome);
  rim.position.z = -0.014;
  wheel.add(rim);
  cyl(0.035, 0.035, 0.03, 10, chrome, 0, 0, -0.005, wheel, "z");
  cyl(0.022, 0.022, 0.012, 10, redEnamel, 0, 0, 0.012, wheel, "z");
  cyl(0.008, 0.008, 0.014, 6, brass, 0, 0, 0.018, wheel, "z");
  cyl(0.018, 0.018, 0.16, 8, chrome, 0, 1.15, -0.145, root, "z");

  // tonearm
  cyl(0.016, 0.02, 0.06, 8, chrome, 0.22, 0.95, -0.04);
  {
    const px = 0.22, py = 0.977, qx = 0.035, qy = 0.99;
    const len = Math.hypot(qx - px, qy - py);
    const arm = box(len, 0.008, 0.008, chrome, (px + qx) / 2, (py + qy) / 2, -0.04);
    arm.rotation.z = Math.atan2(qy - py, qx - px);
    const head = box(0.03, 0.012, 0.014, black, 0.03, 0.99, -0.04);
    head.rotation.z = 0.1;
    cyl(0.013, 0.013, 0.03, 6, black, 0.255, 0.978, -0.04, root, "x");
  }

  // window glass and shine
  const glass = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(archPts(0.3, 0.9, ys, 12))), glassMat);
  glass.position.z = 0.197;
  root.add(glass);
  const shineA = new THREE.Mesh(
    new THREE.ShapeGeometry(new THREE.Shape([
      new THREE.Vector2(-0.21, 0.92), new THREE.Vector2(-0.15, 0.92),
      new THREE.Vector2(0.03, 1.36), new THREE.Vector2(-0.03, 1.36),
    ])), shineMat);
  shineA.position.z = 0.199;
  root.add(shineA);
  const shineB = new THREE.Mesh(
    new THREE.ShapeGeometry(new THREE.Shape([
      new THREE.Vector2(-0.12, 0.92), new THREE.Vector2(-0.095, 0.92),
      new THREE.Vector2(0.085, 1.36), new THREE.Vector2(0.06, 1.36),
    ])), shineMat);
  shineB.position.z = 0.199;
  root.add(shineB);

  // front rings: backing, bezel, outer trim
  const backing = new THREE.Mesh(ringGeo(0.397, 0.3, 0.865, 0.9, ys, 0.004, 14), backingDark);
  backing.position.z = 0.2;
  root.add(backing);
  const bezel = new THREE.Mesh(ringGeo(0.335, 0.3, 0.865, 0.9, ys, 0.02, 14), chrome);
  bezel.position.z = 0.2;
  root.add(bezel);
  const outer = new THREE.Mesh(ringGeo(0.425, 0.395, 0.835, 0.865, ys, 0.012, 16), chrome);
  outer.position.z = 0.2;
  root.add(outer);

  // ---------- light tubes ----------
  const TR = 0.365, tr = 0.02, zT = 0.216;
  const vtube = (x: number, y0: number, y1: number, m: THREE.Material) =>
    cyl(tr, tr, y1 - y0, 6, m, x, (y0 + y1) / 2, zT);
  const atube = (a0: number, a1: number, m: THREE.Material) => {
    const segs = Math.max(2, Math.round((a1 - a0) / 0.2));
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(TR, tr, 6, segs, a1 - a0), m);
    mesh.rotation.z = a0;
    mesh.position.set(0, ys, zT);
    root.add(mesh);
  };
  const yBot = 0.885, yMid = 0.9975;
  for (const sx of [-1, 1]) {
    vtube(sx * TR, yBot, yMid, tRed);
    vtube(sx * TR, yMid, ys, tOrange);
    cyl(0.027, 0.027, 0.014, 8, brass, sx * TR, yBot - 0.002, zT);
    cyl(0.026, 0.026, 0.012, 8, chrome, sx * TR, yMid, zT);
    cyl(0.026, 0.026, 0.012, 8, chrome, sx * TR, ys, zT);
  }
  const d36 = Math.PI / 5;
  const arcCols = [tYellow, tLime, tCyan, tLime, tYellow];
  for (let i = 0; i < 5; i++) atube(i * d36, (i + 1) * d36, arcCols[i]);
  for (let i = 1; i < 5; i++) {
    const a = i * d36;
    const c = cyl(0.026, 0.026, 0.012, 8, chrome, Math.cos(a) * TR, ys + Math.sin(a) * TR, zT);
    c.rotation.z = a;
  }

  // ---------- crest ----------
  const fan = (r: number, depth: number, m: THREE.Material, z: number) => {
    const g = new THREE.CylinderGeometry(r, r, depth, 6, 1, false, Math.PI / 2, Math.PI);
    g.rotateX(Math.PI / 2);
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(0, 1.543, z);
    root.add(mesh);
  };
  fan(0.075, 0.03, brass, 0.19);
  fan(0.052, 0.036, redEnamel, 0.19);
  fan(0.026, 0.042, creamM, 0.19);

  // dome back vents
  for (let i = 0; i < 6; i++) box(0.5, 0.012, 0.006, black, 0, 0.88 + i * 0.03, -0.313);

  // ---------- power cord ----------
  const cordCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.25, 0.1, -0.325),
    new THREE.Vector3(0.25, 0.06, -0.38),
    new THREE.Vector3(0.24, 0.012, -0.45),
    new THREE.Vector3(0.12, 0.009, -0.55),
    new THREE.Vector3(0.0, 0.009, -0.6),
    new THREE.Vector3(-0.08, 0.009, -0.6),
  ]);
  const cord = new THREE.Mesh(new THREE.TubeGeometry(cordCurve, 24, 0.008, 5, false), rubber);
  root.add(cord);
  box(0.045, 0.02, 0.03, black, -0.105, 0.011, -0.6);
  box(0.02, 0.004, 0.004, chrome, -0.14, 0.011, -0.608);
  box(0.02, 0.004, 0.004, chrome, -0.14, 0.011, -0.592);

  // ---------- finishing ----------
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      const mat = m.material as THREE.Material;
      const transparent = !Array.isArray(mat) && mat.transparent;
      m.castShadow = !transparent;
      m.receiveShadow = true;
    }
  });

  return root;
}
```