import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Racing Green Typewriter",
  description:
    "1930s desk typewriter in glossy racing green with round chrome-rimmed keys, a semicircular type-bar basket, a carriage return lever, a black platen with a half-typed sheet, and a brass maker's badge.",
};

const GREEN = "#0b4d2e";
const DKGREEN = "#073320";
const CHROME = "#d6dcdf";
const BLACK = "#141414";
const BRASS = "#b88a2e";
const PAPER = "#f3ecd8";
const INK = "#2b2b2b";
const RED = "#8a2020";
const GREY = "#3b3f41";

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  const base = b.joint("base", { at: [0, 0, 0] });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const P = (g: THREE.BufferGeometry, color: string) =>
    b.part(g, color, { at: [0, 0, 0], bone: base });
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, c: string) =>
    P(new THREE.BoxGeometry(w, h, d).translate(x, y, z), c);
  const cyl = (r: number, h: number, x: number, y: number, z: number, c: string, seg = 10) =>
    P(new THREE.CylinderGeometry(r, r, h, seg).translate(x, y, z), c);
  const cylX = (r: number, len: number, x: number, y: number, z: number, c: string, seg = 12) =>
    P(new THREE.CylinderGeometry(r, r, len, seg).rotateZ(Math.PI / 2).translate(x, y, z), c);
  const rod = (a: THREE.Vector3, c: THREE.Vector3, r: number, color: string, seg = 6) => {
    const d = c.clone().sub(a);
    const g = new THREE.CylinderGeometry(r, r, d.length(), seg);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize()));
    const m = a.clone().add(c).multiplyScalar(0.5);
    g.translate(m.x, m.y, m.z);
    return P(g, color);
  };

  // deterministic random
  let seed = 12345;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  // ---------- body ----------
  // feet
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) cyl(0.016, 0.014, sx * 0.17, 0.007, sz > 0 ? 0.17 : -0.22, BLACK, 8);
  // plinth
  box(0.41, 0.03, 0.47, 0, 0.027, -0.025, DKGREEN);
  box(0.412, 0.006, 0.006, 0, 0.032, 0.212, CHROME);

  // main wedge body (profile in z,y; extruded across x)
  const slope = 0.07 / 0.19;
  const shape = new THREE.Shape();
  shape.moveTo(0.2, 0.04);
  shape.lineTo(0.2, 0.075);
  shape.lineTo(0.01, 0.145);
  shape.lineTo(-0.02, 0.145);
  shape.lineTo(-0.02, 0.1);
  shape.lineTo(-0.25, 0.1);
  shape.lineTo(-0.25, 0.04);
  shape.closePath();
  const wedge = new THREE.ExtrudeGeometry(shape, { depth: 0.38, bevelEnabled: false });
  wedge.rotateY(-Math.PI / 2);
  wedge.translate(0.19, 0, 0);
  P(wedge, GREEN);

  // chrome edge trims on the body
  box(0.382, 0.005, 0.005, 0, 0.073, 0.2, CHROME);
  for (const sx of [-1, 1]) box(0.004, 0.004, 0.44, sx * 0.191, 0.1, -0.03, CHROME);

  // brass badge with embossed text
  box(0.09, 0.034, 0.004, 0, 0.056, 0.2015, BRASS);
  for (const sx of [-1, 1]) cyl(0.0035, 0.005, sx * 0.04, 0.056, 0.203, "#8a6620", 6).constructor;
  if (typeof document !== "undefined") {
    const cv = document.createElement("canvas");
    cv.width = 256;
    cv.height = 96;
    const g = cv.getContext("2d")!;
    g.fillStyle = BRASS;
    g.fillRect(0, 0, 256, 96);
    g.strokeStyle = "#6b4c14";
    g.lineWidth = 4;
    g.strokeRect(6, 6, 244, 84);
    g.fillStyle = "#3a2808";
    g.font = "bold 40px serif";
    g.textAlign = "center";
    g.fillText("MERIDIAN", 128, 50);
    g.font = "italic 20px serif";
    g.fillText("Standard No. 7", 128, 78);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35, metalness: 0.5 });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.082, 0.028).translate(0, 0.056, 0.2042), mat);
    base.add(m);
  }

  // ---------- keys ----------
  const rows = ["1234567890-", "QWERTYUIOP", "ASDFGHJKL;", "ZXCVBNM,./"];
  const rowZ = [0.03, 0.07, 0.11, 0.15];
  const chars: string[] = [];
  rows.forEach((r) => r.split("").forEach((c) => chars.push(c)));

  let atlasMat: THREE.MeshStandardMaterial | null = null;
  if (typeof document !== "undefined") {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 512;
    const g = cv.getContext("2d")!;
    g.fillStyle = "#161616";
    g.fillRect(0, 0, 512, 512);
    g.fillStyle = "#f2e8c6";
    g.font = "bold 44px serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    chars.forEach((c, i) => g.fillText(c, (i % 8) * 64 + 32, Math.floor(i / 8) * 64 + 34));
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    atlasMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3, metalness: 0.1 });
  }

  let ci = 0;
  rows.forEach((row, ri) => {
    const n = row.length;
    const pitch = 0.029;
    const z = rowZ[ri];
    const yb = 0.075 + (0.2 - z) * slope;
    for (let i = 0; i < n; i++) {
      const x = (i - (n - 1) / 2) * pitch + (ri - 1.5) * 0.007;
      cyl(0.004, 0.02, x, yb + 0.008, z, GREY, 5); // stem
      cyl(0.0138, 0.008, x, yb + 0.02, z, CHROME, 10); // rim
      cyl(0.0116, 0.009, x, yb + 0.0205, z, BLACK, 10); // cap
      if (atlasMat) {
        const g = new THREE.CircleGeometry(0.0108, 10);
        const uv = g.attributes.uv as THREE.BufferAttribute;
        const cx = ci % 8;
        const cy = Math.floor(ci / 8);
        for (let k = 0; k < uv.count; k++) {
          const u = uv.getX(k);
          const v = uv.getY(k);
          uv.setXY(k, (cx + 0.08 + u * 0.84) / 8, 1 - (cy + 1 - (0.08 + v * 0.84)) / 8);
        }
        g.rotateX(-Math.PI / 2);
        g.translate(x, yb + 0.0256, z);
        base.add(new THREE.Mesh(g, atlasMat));
      } else {
        box(0.004, 0.001, 0.012, x, yb + 0.0256, z, "#f2e8c6");
      }
      ci++;
    }
  });
  // space bar
  {
    const z = 0.184;
    const yb = 0.075 + (0.2 - z) * slope;
    box(0.2, 0.011, 0.02, 0, yb + 0.014, z, CHROME);
    box(0.19, 0.003, 0.012, 0, yb + 0.0205, z, GREY);
    for (const sx of [-1, 1]) box(0.006, 0.012, 0.006, sx * 0.08, yb + 0.005, z, GREY);
  }

  // ---------- type bar basket ----------
  const cz = -0.06;
  const R = 0.15;
  P(
    new THREE.TorusGeometry(R, 0.0045, 5, 28, Math.PI).rotateX(-Math.PI / 2).translate(0, 0.106, cz),
    CHROME
  );
  const N = 21;
  for (let i = 0; i < N; i++) {
    const th = (i / (N - 1)) * Math.PI;
    const a = V(R * Math.cos(th), 0.108, cz - R * Math.sin(th));
    const t = V(0.013 * Math.cos(th), 0.215, cz - 0.013 * Math.sin(th));
    rod(a, t, 0.0021, CHROME, 4);
    P(new THREE.SphereGeometry(0.0045, 5, 4).translate(a.x, a.y, a.z), GREY);
    P(new THREE.BoxGeometry(0.006, 0.007, 0.006).translate(t.x, t.y, t.z), "#aeb4b7");
  }
  // type guide
  box(0.03, 0.012, 0.012, 0, 0.226, cz + 0.004, GREY);

  // ribbon spools
  for (const sx of [-1, 1]) {
    cyl(0.03, 0.014, sx * 0.115, 0.107, -0.212, BLACK, 12);
    cyl(0.012, 0.018, sx * 0.115, 0.115, -0.212, CHROME, 8);
  }

  // ---------- carriage ----------
  const pz = -0.1;
  const py = 0.27;
  // uprights and end plates
  for (const sx of [-1, 1]) {
    box(0.026, 0.16, 0.04, sx * 0.205, 0.18, -0.17, GREEN);
    box(0.02, 0.07, 0.15, sx * 0.205, py, pz, GREEN);
    box(0.004, 0.06, 0.14, sx * 0.217, py, pz, CHROME);
  }
  // rails
  cylX(0.006, 0.43, 0, 0.235, -0.15, CHROME, 8);
  box(0.4, 0.014, 0.012, 0, 0.255, -0.17, GREEN);
  // platen
  cylX(0.03, 0.4, 0, py, pz, BLACK, 14);
  cylX(0.006, 0.52, 0, py, pz, CHROME, 6);
  for (const sx of [-1, 1]) {
    cylX(0.02, 0.022, sx * 0.248, py, pz, BLACK, 10);
    cylX(0.012, 0.01, sx * 0.264, py, pz, CHROME, 8);
    // knob ridges
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      box(0.022, 0.006, 0.006, sx * 0.248, py + Math.cos(a) * 0.02, pz + Math.sin(a) * 0.02, BLACK);
    }
  }
  // paper bail
  rod(V(-0.18, 0.31, -0.05), V(0.18, 0.31, -0.05), 0.0025, CHROME, 5);
  for (const sx of [-1, 1]) rod(V(sx * 0.18, 0.31, -0.05), V(sx * 0.2, 0.29, -0.11), 0.0025, CHROME, 5);

  // carriage return lever (left = +X)
  const l1 = V(0.222, 0.3, -0.16);
  const l2 = V(0.245, 0.345, -0.08);
  const l3 = V(0.26, 0.345, 0.0);
  P(new THREE.SphereGeometry(0.007, 6, 5).translate(l1.x, l1.y, l1.z), CHROME);
  rod(l1, l2, 0.0055, CHROME, 6);
  P(new THREE.SphereGeometry(0.006, 6, 5).translate(l2.x, l2.y, l2.z), CHROME);
  rod(l2, l3, 0.0055, CHROME, 6);
  P(new THREE.SphereGeometry(0.0145, 8, 6).translate(l3.x, l3.y, l3.z + 0.008), BLACK);

  // ---------- paper ----------
  const alpha = (20 * Math.PI) / 180;
  const u = V(0, Math.cos(alpha), -Math.sin(alpha));
  const n = V(0, Math.sin(alpha), Math.cos(alpha));
  const r0 = 0.03 + 0.0015;
  const contact = V(0, py, pz).add(n.clone().multiplyScalar(r0));
  const center = contact.clone().add(u.clone().multiplyScalar(0.1));
  P(new THREE.BoxGeometry(0.215, 0.24, 0.002).rotateX(-alpha).translate(center.x, center.y, center.z), PAPER);
  const inkLine = (s: number, h: number, w: number, color: string) => {
    const pos = center.clone().add(u.clone().multiplyScalar(h)).add(n.clone().multiplyScalar(0.0013));
    P(
      new THREE.BoxGeometry(w, 0.0028, 0.0006).rotateX(-alpha).translate(pos.x + s, pos.y, pos.z),
      color
    );
  };
  for (let li = 0; li < 9; li++) {
    const h = -0.085 + li * 0.0105;
    let s = -0.09;
    const maxS = li === 8 ? -0.03 : 0.09;
    const col = li === 0 ? RED : INK;
    while (s < maxS - 0.01) {
      const w = Math.min(0.012 + rnd() * 0.028, maxS - s);
      if (w < 0.006) break;
      inkLine(s + w / 2, h, w, col);
      s += w + 0.006;
    }
  }
  // cursor mark on last line
  inkLine(-0.025, -0.085 + 8 * 0.0105 - 0.0005, 0.004, RED);

  // ---------- tweak materials for gloss ----------
  const seen = new Set<THREE.Material>();
  b.root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const mat = m.material as THREE.MeshStandardMaterial;
    if (!mat || Array.isArray(mat) || seen.has(mat) || !mat.color) return;
    seen.add(mat);
    if (mat.map) return;
    const hex = "#" + mat.color.getHexString();
    if (hex === CHROME.toLowerCase() || hex === "#aeb4b7") {
      mat.metalness = 0.75;
      mat.roughness = 0.2;
    } else if (hex === GREEN.toLowerCase() || hex === DKGREEN.toLowerCase()) {
      mat.roughness = 0.22;
      mat.metalness = 0.15;
    } else if (hex === BRASS.toLowerCase()) {
      mat.metalness = 0.7;
      mat.roughness = 0.3;
    } else if (hex === BLACK.toLowerCase()) {
      mat.roughness = 0.35;
    }
  });

  return b.root;
}
