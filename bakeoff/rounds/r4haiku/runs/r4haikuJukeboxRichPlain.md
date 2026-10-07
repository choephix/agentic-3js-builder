```ts
import * as THREE from "three";

export const meta = {
  name: "1950s Diner Jukebox",
  description:
    "Chrome-trimmed diner jukebox: a glowing arch of red, amber and teal neon tubes over a domed record window with a tone arm, two rows of chrome selection buttons with title cards, a starburst speaker grille and a coin slot.",
};

const V = THREE.Vector3;

// Small seeded PRNG (mulberry32) so every build is identical.
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

// Canvas-drawn texture. Returns null where no DOM canvas exists.
function canvasTexture(
  w: number,
  h: number,
  draw: (g: CanvasRenderingContext2D) => void,
): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d");
  if (!g) return null;
  draw(g);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// Rounded-rectangle outline centred on the origin.
function rrPath(p: THREE.Path, w: number, h: number, r: number): void {
  const x = -w / 2;
  const y = -h / 2;
  p.moveTo(x + r, y);
  p.lineTo(x + w - r, y);
  p.quadraticCurveTo(x + w, y, x + w, y + r);
  p.lineTo(x + w, y + h - r);
  p.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  p.lineTo(x + r, y + h);
  p.quadraticCurveTo(x, y + h, x, y + h - r);
  p.lineTo(x, y + r);
  p.quadraticCurveTo(x, y, x + r, y);
}

function starburstTexture(): THREE.CanvasTexture | null {
  return canvasTexture(512, 512, (g) => {
    const c = 256;
    g.fillStyle = "#3d0c14";
    g.fillRect(0, 0, 512, 512);
    const rays = 44;
    for (let i = 0; i < rays; i++) {
      const a = (i / rays) * Math.PI * 2;
      const long = i % 2 === 0;
      g.strokeStyle = long ? "#f6c25e" : "#f8e9c8";
      g.lineWidth = long ? 9 : 5;
      g.beginPath();
      g.moveTo(c + Math.cos(a) * 62, c + Math.sin(a) * 62);
      const len = long ? 252 : 185;
      g.lineTo(c + Math.cos(a) * len, c + Math.sin(a) * len);
      g.stroke();
    }
    g.strokeStyle = "#f6c25e";
    g.lineWidth = 6;
    for (const r of [150, 205]) {
      g.beginPath();
      g.arc(c, c, r, 0, Math.PI * 2);
      g.stroke();
    }
    const boss = g.createRadialGradient(c, c, 6, c, c, 60);
    boss.addColorStop(0, "#ffffff");
    boss.addColorStop(0.5, "#d9dee6");
    boss.addColorStop(1, "#6e7784");
    g.fillStyle = boss;
    g.beginPath();
    g.arc(c, c, 60, 0, Math.PI * 2);
    g.fill();
  });
}

function titleTexture(text: string, band: string): THREE.CanvasTexture | null {
  return canvasTexture(256, 76, (g) => {
    g.fillStyle = "#fff3d6";
    g.fillRect(0, 0, 256, 76);
    g.fillStyle = band;
    g.fillRect(0, 0, 18, 76);
    g.fillRect(238, 0, 18, 76);
    g.fillStyle = "#2b1518";
    g.textAlign = "center";
    g.textBaseline = "middle";
    let size = 40;
    g.font = `bold ${size}px Arial, Helvetica, sans-serif`;
    while (g.measureText(text).width > 200 && size > 14) {
      size -= 2;
      g.font = `bold ${size}px Arial, Helvetica, sans-serif`;
    }
    g.fillText(text, 128, 39);
  });
}

function coinTexture(): THREE.CanvasTexture | null {
  return canvasTexture(128, 64, (g) => {
    g.fillStyle = "#fff1c9";
    g.fillRect(0, 0, 128, 64);
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "#c42a36";
    g.font = "bold 34px Arial, Helvetica, sans-serif";
    g.fillText("25\u00A2", 64, 27);
    g.fillStyle = "#0f7d72";
    g.font = "bold 15px Arial, Helvetica, sans-serif";
    g.fillText("PLAY", 64, 50);
  });
}

export default function createJukebox(): THREE.Object3D {
  const rand = mulberry32(1957);
  const root = new THREE.Group();
  root.name = "jukebox";

  // ---------- materials: one per colour, shared between meshes ----------
  const lacquer = (color: number, roughness = 0.4) =>
    new THREE.MeshStandardMaterial({ color, roughness });
  const neon = (color: number) =>
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 1.6,
      roughness: 0.3,
    });

  const chrome = new THREE.MeshStandardMaterial({
    color: 0xeef2f6,
    metalness: 1,
    roughness: 0.18,
    emissive: 0x2a3038,
    emissiveIntensity: 1,
  });
  const red = lacquer(0xb8202f, 0.35);
  const ivory = lacquer(0xf3e8d0, 0.42);
  const wine = lacquer(0x2c0e16, 0.5);
  const walnut = lacquer(0x1b1417, 0.55);
  const black = lacquer(0x141216, 0.35);
  const cream = lacquer(0xfff1c9, 0.5);
  const neonRed = neon(0xff2e3d);
  const neonAmber = neon(0xffb020);
  const neonTeal = neon(0x1fe3cf);
  const btnRed = lacquer(0xd42a36, 0.3);
  const btnAmber = lacquer(0xf7a51c, 0.3);
  const btnTeal = lacquer(0x17b3a4, 0.3);
  const vinylRed = lacquer(0xc42a36, 0.3);
  const vinylTeal = lacquer(0x1aa595, 0.3);
  const vinylAmber = lacquer(0xe9a22a, 0.3);
  const glass = new THREE.MeshStandardMaterial({
    color: 0xd6f3ff,
    roughness: 0.04,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  });

  // ---------- helpers ----------
  const add = (
    geo: THREE.BufferGeometry,
    m: THREE.Material,
    x: number,
    y: number,
    z: number,
    rx = 0,
    parent: THREE.Object3D = root,
  ): THREE.Mesh => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z);
    mesh.rotation.x = rx;
    parent.add(mesh);
    return mesh;
  };

  const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number) =>
    add(new THREE.BoxGeometry(w, h, d), m, x, y, z);

  // Cylinder stood between two points (used for chrome rods and neon legs).
  const rod = (a: THREE.Vector3, b: THREE.Vector3, r: number, m: THREE.Material, seg = 10) => {
    const dir = new THREE.Vector3().subVectors(b, a);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, dir.length(), seg), m);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    root.add(mesh);
    return mesh;
  };

  // Softly rounded body block, centred on x/z = (0, z).
  const body = (
    w: number,
    h: number,
    d: number,
    r: number,
    m: THREE.Material,
    y: number,
    z = 0,
  ) => {
    const bev = 0.012;
    const s = new THREE.Shape();
    rrPath(s, w - 2 * bev, h - 2 * bev, Math.max(r - bev, 0.006));
    const depth = d - 2 * bev;
    const geo = new THREE.ExtrudeGeometry(s, {
      depth,
      bevelEnabled: true,
      bevelThickness: bev,
      bevelSize: bev,
      bevelSegments: 2,
      curveSegments: 6,
    });
    geo.translate(0, 0, -depth / 2);
    return add(geo, m, 0, y, z);
  };

  // ---------- plinth and lower cabinet ----------
  body(0.66, 0.08, 0.48, 0.03, chrome, 0.04);
  body(0.70, 0.48, 0.52, 0.05, red, 0.32);

  // ---------- console (ivory) ----------
  body(0.70, 0.24, 0.52, 0.04, ivory, 0.70);

  // ---------- record window housing (red) ----------
  body(0.70, 0.26, 0.52, 0.04, red, 0.97);

  // chrome bands between sections
  box(0.72, 0.02, 0.545, chrome, 0, 0.57, 0);
  box(0.72, 0.02, 0.545, chrome, 0, 0.83, 0);
  box(0.72, 0.02, 0.545, chrome, 0, 1.11, 0);

  // chrome corner beads on every vertical body edge
  const bands: [number, number][] = [
    [0.08, 0.56],
    [0.58, 0.82],
    [0.84, 1.1],
  ];
  for (const [y0, y1] of bands) {
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        rod(new V(sx * 0.345, y0, sz * 0.258), new V(sx * 0.345, y1, sz * 0.258), 0.01, chrome, 8);
      }
    }
  }

  // ---------- speaker grille with starburst (lower front) ----------
  const starTex = starburstTexture();
  const grilleMat = new THREE.MeshStandardMaterial({
    map: starTex,
    color: starTex ? 0xffffff : 0x4a1119,
    roughness: 0.4,
  });
  add(new THREE.CircleGeometry(0.19, 48), walnut, 0, 0.32, 0.2615);
  add(new THREE.CircleGeometry(0.17, 48), grilleMat, 0, 0.32, 0.2625);
  add(new THREE.TorusGeometry(0.172, 0.011, 10, 56), chrome, 0, 0.32, 0.266);

  // ---------- coin slot ----------
  const coinMat = new THREE.MeshStandardMaterial({
    map: coinTexture(),
    color: 0xfff1c9,
    roughness: 0.5,
  });
  box(0.085, 0.13, 0.012, chrome, 0.25, 0.37, 0.267);
  add(new THREE.PlaneGeometry(0.06, 0.03), coinMat, 0.25, 0.42, 0.2745);
  box(0.012, 0.05, 0.008, black, 0.25, 0.36, 0.2735);
  add(new THREE.CylinderGeometry(0.011, 0.011, 0.014, 14), chrome, 0.25, 0.31, 0.277, Math.PI / 2);

  // ---------- selection console: dark panel, chrome frame ----------
  box(0.62, 0.215, 0.012, walnut, 0, 0.7025, 0.266);
  box(0.64, 0.012, 0.014, chrome, 0, 0.81, 0.27);
  box(0.64, 0.012, 0.014, chrome, 0, 0.595, 0.27);
  box(0.012, 0.215, 0.014, chrome, -0.316, 0.7025, 0.27);
  box(0.012, 0.215, 0.014, chrome, 0.316, 0.7025, 0.27);

  // two rows of five chrome buttons, each with a title card above
  const titles = [
    ["BLUE MOON", "ROCK AROUND", "HOUND DOG", "TUTTI FRUTTI", "BE BOP LULA"],
    ["JAILHOUSE ROCK", "LONG TALL SALLY", "GREAT BALLS", "ALL SHOOK UP", "SHAKE IT"],
  ];
  const capMats = [btnRed, btnAmber, btnTeal, ivory, btnRed];
  const capHex = ["#d42a36", "#f7a51c", "#17b3a4", "#f3e8d0", "#d42a36"];
  const cardY = [0.773, 0.683];
  const btnY = [0.733, 0.643];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 5; c++) {
      const x = -0.22 + c * 0.11;
      const key = (c * 2 + r) % 5;
      const tex = titleTexture(titles[r][c], capHex[key]);
      const cardMat = new THREE.MeshStandardMaterial({
        map: tex,
        color: tex ? 0xffffff : 0xfff3d6,
        roughness: 0.6,
      });
      add(new THREE.PlaneGeometry(0.088, 0.026), cardMat, x, cardY[r], 0.2785);
      add(new THREE.CylinderGeometry(0.024, 0.024, 0.012, 24), chrome, x, btnY[r], 0.276, Math.PI / 2);
      add(new THREE.CylinderGeometry(0.017, 0.017, 0.014, 24), capMats[key], x, btnY[r], 0.282, Math.PI / 2);
    }
  }

  // ---------- record window: chrome frame, dark well, domed glass ----------
  const frameShape = new THREE.Shape();
  rrPath(frameShape, 0.48, 0.25, 0.03);
  const frameHole = new THREE.Path();
  rrPath(frameHole, 0.44, 0.22, 0.012);
  frameShape.holes.push(frameHole);
  add(
    new THREE.ExtrudeGeometry(frameShape, { depth: 0.012, bevelEnabled: false, curveSegments: 6 }),
    chrome,
    0,
    0.97,
    0.26,
  );
  box(0.44, 0.22, 0.012, walnut, 0, 0.97, 0.256);

  // hemispherical dome, apex toward +Z, slightly elliptical
  const dome = new THREE.SphereGeometry(1, 32, 14, 0, Math.PI * 2, 0, Math.PI / 2);
  dome.rotateX(Math.PI / 2);
  dome.scale(0.215, 0.105, 0.1);
  add(dome, glass, 0, 0.97, 0.262);

  // stack of records on a spindle, tipped toward the viewer
  const stack = new THREE.Group();
  stack.position.set(0, 0.965, 0.282);
  stack.rotation.x = 0.55;
  root.add(stack);
  add(new THREE.CylinderGeometry(0.005, 0.005, 0.2, 8), chrome, 0, 0, 0, 0, stack);
  const vinyls = [black, vinylRed, vinylTeal, vinylAmber];
  const recordCount = 7;
  for (let i = 0; i < recordCount; i++) {
    const y = -0.03 + i * 0.011;
    const top = i === recordCount - 1;
    const x = top ? 0.025 : 0; // the top record is slid out for the arm
    const m = i === 0 ? black : vinyls[Math.floor(rand() * vinyls.length)];
    add(new THREE.CylinderGeometry(0.075, 0.075, 0.009, 32), m, x, y, 0, 0, stack);
    add(new THREE.CylinderGeometry(0.03, 0.03, 0.0015, 20), cream, x, y + 0.0053, 0, 0, stack);
  }

  // tone arm that picks the records
  const pivotLo = new V(0.13, 0.985, 0.285);
  const pivotHi = new V(0.13, 1.03, 0.285);
  const armEnd = new V(0.03, 1.008, 0.305);
  rod(pivotLo, pivotHi, 0.007, chrome);
  add(new THREE.SphereGeometry(0.011, 12, 10), chrome, pivotHi.x, pivotHi.y, pivotHi.z);
  rod(pivotHi, armEnd, 0.0045, chrome, 8);
  add(new THREE.BoxGeometry(0.022, 0.01, 0.03), chrome, armEnd.x, armEnd.y, armEnd.z);

  // ---------- top: neon arch of tubes ----------
  const AY = 1.12; // arch springs from the top chrome band
  const LEG = 0.15;
  const CY = AY + LEG; // arc centre height
  const AW = 0.33; // arch half-width

  // dark wine-coloured arch body
  const archShape = new THREE.Shape();
  archShape.moveTo(-AW, 0);
  archShape.lineTo(AW, 0);
  archShape.lineTo(AW, LEG);
  archShape.absarc(0, LEG, AW, 0, Math.PI, false);
  archShape.lineTo(-AW, 0);
  const archGeo = new THREE.ExtrudeGeometry(archShape, {
    depth: 0.52,
    bevelEnabled: false,
    curveSegments: 48,
  });
  archGeo.translate(0, 0, -0.26);
  add(archGeo, wine, 0, AY, 0);

  // chrome arch trim with legs
  const CR = AW + 0.004;
  const TZ = 0.278; // neon tube front plane
  add(new THREE.TorusGeometry(CR, 0.011, 10, 64, Math.PI), chrome, 0, CY, 0.266);
  rod(new V(-CR, AY, 0.266), new V(-CR, CY, 0.266), 0.011, chrome, 8);
  rod(new V(CR, AY, 0.266), new V(CR, CY, 0.266), 0.011, chrome, 8);

  // concentric neon arches: red, amber, teal, amber
  const arcs: Array<[number, THREE.Material]> = [
    [0.285, neonRed],
    [0.235, neonAmber],
    [0.185, neonTeal],
    [0.135, neonAmber],
  ];
  for (const [R, m] of arcs) {
    add(new THREE.TorusGeometry(R, 0.014, 10, 60, Math.PI), m, 0, CY, TZ);
    rod(new V(-R, AY, TZ), new V(-R, CY, TZ), 0.014, m);
    rod(new V(R, AY, TZ), new V(R, CY, TZ), 0.014, m);
  }

  // small glowing bulbs running over the chrome arch
  const bulbMats = [neonRed, neonAmber, neonTeal];
  for (let k = 0; k <= 8; k++) {
    const t = (k / 8) * Math.PI;
    add(
      new THREE.SphereGeometry(0.019, 12, 8),
      bulbMats[k % 3],
      Math.cos(t) * CR,
      CY + Math.sin(t) * CR,
      0.28,
    );
  }

  // ivory crown seated on top of the arch, with chrome cap and finial
  body(0.26, 0.07, 0.14, 0.03, ivory, 1.605, 0.19);
  box(0.28, 0.012, 0.155, chrome, 0, 1.645, 0.19);
  add(new THREE.SphereGeometry(0.022, 16, 12), chrome, 0, 1.665, 0.19);

  return root;
}
```