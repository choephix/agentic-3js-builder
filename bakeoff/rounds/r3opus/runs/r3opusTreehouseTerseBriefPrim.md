```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Treehouse",
  description:
    "A storybook treehouse: a chunky oak with flared roots, a plank deck on stilts and braces, a board-sided cabin with a shingled gable roof the trunk punches through, glowing windows, bunting, a ladder, a pulley bucket, a rope swing, apples and an owl peeking from a knot hole.",
};

export default function build() {
  const b = createBuilder({ name: "treehouse" });
  b.joint("root", { at: [0, 0, 0] });

  // ---------- randomness ----------
  const _r: any = rng(7);
  const rand = (): number =>
    typeof _r === "function" ? _r() : typeof _r.next === "function" ? _r.next() : _r.float();
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length) % arr.length];

  // ---------- palette ----------
  const BARK = "#6b4a32", BARK_D = "#4e3424", BARK_L = "#80603f";
  const WOOD1 = "#c48a4d", WOOD2 = "#b07a42", WOOD3 = "#d29a5a", WOOD_D = "#8a5a30";
  const CREAM = "#f1e4c4", TEAL = "#2f8a8f", TEAL_D = "#1f6468";
  const ROOF1 = "#c4532f", ROOF2 = "#b0452a", ROOF3 = "#d66b3c", ROOF_D = "#7e2f1f";
  const GLOW = "#ffd27a";
  const LEAF1 = "#4f9a3e", LEAF2 = "#3d8236", LEAF3 = "#79c04f", LEAF4 = "#2f6b30";
  const GRASS = "#7fbf4f", GRASS_D = "#5c9b3a", DIRT = "#8b6a45";
  const ROPE = "#d9c08a", RED = "#d8342c", PINK = "#f08aa0", YELLOW = "#f5c542";
  const WHITE = "#fbf7ee", STONE = "#9a9a92", STONE_D = "#7c7c76", METAL = "#55616b";
  const BRASS = "#d4a73a", BLUE = "#5b7fd6", DARK = "#2b1d14", BLACK = "#141414";

  // ---------- helpers ----------
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const P = (geo: THREE.BufferGeometry, color: string, x: number, y: number, z: number) =>
    b.part(geo, color, { at: [x, y, z] });
  const UP = new THREE.Vector3(0, 1, 0);
  function between(geo: THREE.BufferGeometry, a: THREE.Vector3, c: THREE.Vector3, color: string) {
    const d = c.clone().sub(a);
    d.normalize();
    const axis = new THREE.Vector3().crossVectors(UP, d);
    const s = axis.length();
    if (s > 1e-6) {
      geo.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(axis.normalize(), Math.atan2(s, UP.dot(d))));
    } else if (UP.dot(d) < 0) geo.rotateX(Math.PI);
    return b.part(geo, color, { at: a.clone().add(c).multiplyScalar(0.5) });
  }
  const beam = (a: THREE.Vector3, c: THREE.Vector3, w: number, color: string, h = w) =>
    between(new THREE.BoxGeometry(w, a.distanceTo(c), h), a, c, color);
  const rod = (a: THREE.Vector3, c: THREE.Vector3, r0: number, r1: number, color: string, seg = 6) =>
    between(new THREE.CylinderGeometry(r1, r0, a.distanceTo(c), seg), a, c, color);
  const blob = (r: number, sx: number, sy: number, sz: number) =>
    new THREE.DodecahedronGeometry(r, 0).scale(sx, sy, sz);

  // ---------- key dimensions ----------
  const TZ = -0.4; // trunk z
  const TH = 8.6; // trunk height
  const trunkR = (y: number) => 0.55 - 0.23 * (y / TH);
  const DY = 3.0; // deck top
  const HW = 2.6, HD = 2.0, WH = 1.8;
  const WT = DY + WH;
  const A = (40 * Math.PI) / 180;
  const RISE = (HW / 2) * Math.tan(A);
  const zF = TZ + HD / 2 + 0.045; // front siding face

  // ---------- ground mound ----------
  P(new THREE.CylinderGeometry(2.8, 3.1, 0.2, 10), GRASS, 0, 0.1, 0);
  P(new THREE.CylinderGeometry(3.1, 3.15, 0.04, 10), DIRT, 0, 0.02, 0);
  // dirt patch under ladder
  P(new THREE.CylinderGeometry(0.55, 0.6, 0.03, 7), DIRT, 0.8, 0.205, 2.3);

  // ---------- trunk ----------
  P(new THREE.CylinderGeometry(0.32, 0.55, TH, 9), BARK, 0, TH / 2, TZ);
  for (let i = 0; i < 6; i++) {
    const az = (i / 6) * Math.PI * 2 + rand() * 0.4;
    const dx = Math.sin(az), dz = Math.cos(az);
    rod(V(dx * 0.35, 0.75, TZ + dz * 0.35), V(dx * 1.3, 0.14, TZ + dz * 1.3), 0.26, 0.07, i % 2 ? BARK : BARK_D, 6);
  }
  // bark ridges
  for (let i = 0; i < 26; i++) {
    const az = rand() * Math.PI * 2;
    const high = i % 3 === 0;
    const len = 0.4 + rand() * 0.7;
    const ym = high ? 6.0 + rand() * 1.2 : 0.9 + rand() * 1.6;
    const rr = trunkR(ym) - 0.005;
    const g = new THREE.BoxGeometry(0.07, len, 0.06).rotateY(az);
    P(g, i % 2 ? BARK_D : BARK_L, Math.sin(az) * rr, ym, TZ + Math.cos(az) * rr);
  }
  // knot hole with an owl peeking out
  {
    const y = 1.75, zr = TZ + trunkR(y) - 0.03;
    P(new THREE.TorusGeometry(0.15, 0.05, 5, 10).scale(1, 1.3, 1), BARK_L, 0, y, zr + 0.02);
    P(new THREE.SphereGeometry(0.14, 8, 6).scale(1, 1.3, 0.35), DARK, 0, y, zr);
    for (const s of [-1, 1]) {
      P(new THREE.SphereGeometry(0.042, 8, 6), "#ffe14a", s * 0.05, y + 0.03, zr + 0.04);
      P(new THREE.SphereGeometry(0.02, 6, 4), BLACK, s * 0.05, y + 0.03, zr + 0.075);
    }
    P(new THREE.ConeGeometry(0.02, 0.05, 4).rotateX(Math.PI), "#e09a2a", 0, y - 0.03, zr + 0.06);
  }

  // ---------- branches ----------
  rod(V(0, 6.1, TZ), V(-3.1, 6.9, 0.3), 0.2, 0.08, BARK);
  rod(V(0, 6.0, TZ), V(2.5, 7.3, -1.0), 0.2, 0.08, BARK);
  rod(V(0, 6.6, TZ), V(-0.9, 8.3, 0.9), 0.18, 0.07, BARK);
  rod(V(0, 7.0, TZ), V(1.2, 8.6, 0.5), 0.16, 0.06, BARK);
  rod(V(0, 7.2, TZ), V(-1.4, 8.1, -1.5), 0.15, 0.06, BARK);

  // ---------- canopy ----------
  const clusters: [number, number, number, number, string][] = [
    [0, 8.7, TZ, 1.9, LEAF1],
    [-2.3, 7.4, 0.2, 1.35, LEAF2],
    [2.3, 7.6, -0.9, 1.45, LEAF1],
    [-1.0, 8.5, 1.1, 1.3, LEAF2],
    [1.3, 8.9, 0.6, 1.3, LEAF1],
    [0.3, 9.7, -0.8, 1.2, LEAF2],
    [-1.5, 8.1, -1.5, 1.3, LEAF4],
    [2.0, 6.9, 0.7, 0.95, LEAF2],
  ];
  for (const [x, y, z, r, c] of clusters) {
    P(blob(r, 1, 0.85, 1).rotateY(rand() * 3), c, x, y, z);
  }
  for (const [x, y, z, r] of clusters) {
    // leafy accents on the top half
    for (let k = 0; k < 6; k++) {
      const az = rand() * Math.PI * 2, el = -0.1 + rand() * 1.2;
      const rr = r * 0.88;
      const px = x + Math.cos(el) * Math.sin(az) * rr;
      const py = y + Math.sin(el) * rr * 0.85;
      const pz = z + Math.cos(el) * Math.cos(az) * rr;
      P(blob(r * (0.3 + rand() * 0.12), 1, 0.8, 1).rotateY(rand() * 3), k % 3 === 0 ? LEAF2 : LEAF3, px, py, pz);
    }
    // apples on the lower half
    for (let k = 0; k < 2; k++) {
      const az = rand() * Math.PI * 2, el = -0.5 + rand() * 0.6;
      const rr = r * 0.97;
      const px = x + Math.cos(el) * Math.sin(az) * rr;
      const py = y + Math.sin(el) * rr * 0.85;
      const pz = z + Math.cos(el) * Math.cos(az) * rr;
      P(new THREE.SphereGeometry(0.1, 7, 5), RED, px, py, pz);
      P(new THREE.BoxGeometry(0.015, 0.06, 0.015), BARK_D, px, py + 0.11, pz);
      P(new THREE.ConeGeometry(0.035, 0.08, 3).rotateZ(-1.0).scale(1, 1, 0.3), LEAF3, px + 0.04, py + 0.12, pz);
    }
  }

  // ---------- deck ----------
  const nPl = 12, z0 = -1.6, z1 = 1.95, pw = (z1 - z0) / nPl;
  for (let i = 0; i < nPl; i++) {
    const z = z0 + pw * (i + 0.5);
    P(new THREE.BoxGeometry(3.7, 0.08, pw - 0.025).rotateZ((rand() - 0.5) * 0.01), pick([WOOD1, WOOD2, WOOD3]), (rand() - 0.5) * 0.06, DY - 0.04, z);
    for (const sx of [-1, 1]) P(new THREE.BoxGeometry(0.03, 0.02, 0.03), METAL, sx * 1.72, DY + 0.005, z);
  }
  P(new THREE.BoxGeometry(3.76, 0.18, 0.08), WOOD_D, 0, DY - 0.17, 1.98);
  P(new THREE.BoxGeometry(3.76, 0.18, 0.08), WOOD_D, 0, DY - 0.17, -1.63);
  for (const sx of [-1, 1]) P(new THREE.BoxGeometry(0.08, 0.18, 3.6), WOOD_D, sx * 1.88, DY - 0.17, 0.17);
  for (const x of [-1.2, 0, 1.2]) P(new THREE.BoxGeometry(0.12, 0.18, 3.5), WOOD_D, x, DY - 0.17, 0.17);

  // stilts (tall: they double as bunting poles) and footing stones
  const postTop = DY + 1.75;
  for (const sx of [-1, 1]) {
    P(new THREE.BoxGeometry(0.2, postTop, 0.2), WOOD_D, sx * 1.72, postTop / 2, 1.85);
    P(new THREE.ConeGeometry(0.16, 0.18, 4).rotateY(Math.PI / 4), CREAM, sx * 1.72, postTop + 0.09, 1.85);
    P(blob(0.26, 1, 0.5, 1), STONE, sx * 1.72, 0.12, 1.85);
  }
  // braces to trunk
  for (const sx of [-1, 1]) {
    beam(V(sx * 0.25, 1.55, TZ), V(sx * 1.6, DY - 0.26, -1.45), 0.14, WOOD_D);
    beam(V(sx * 0.25, 1.75, TZ), V(sx * 1.6, DY - 0.26, 0.95), 0.14, WOOD_D);
  }
  beam(V(-1.72, 0.5, 1.85), V(1.72, 2.75, 1.85), 0.12, WOOD2);

  // ---------- ladder ----------
  {
    const xc = 0.8;
    const bot = V(0, 0.2, 2.6), top = V(0, DY + 0.65, 1.92);
    for (const s of [-1, 1]) beam(V(xc + s * 0.27, bot.y, bot.z), V(xc + s * 0.27, top.y, top.z), 0.08, WOOD2);
    for (let i = 0; i < 9; i++) {
      const y = 0.5 + i * 0.3;
      const t = (y - bot.y) / (top.y - bot.y);
      const z = bot.z + (top.z - bot.z) * t;
      rod(V(xc - 0.27, y, z), V(xc + 0.27, y, z), 0.035, 0.035, WOOD3, 5);
    }
  }

  // ---------- railings ----------
  function railing(ax: number, az: number, cx: number, cz: number) {
    const a = V(ax, DY, az), c = V(cx, DY, cz);
    const len = a.distanceTo(c);
    for (const p of [a, c]) P(new THREE.BoxGeometry(0.11, 0.95, 0.11), WOOD_D, p.x, DY + 0.475, p.z);
    beam(V(ax, DY + 0.9, az), V(cx, DY + 0.9, cz), 0.1, WOOD3, 0.06);
    beam(V(ax, DY + 0.3, az), V(cx, DY + 0.3, cz), 0.05, WOOD2, 0.05);
    const n = Math.max(1, Math.round(len / 0.24));
    for (let i = 1; i < n; i++) {
      const p = a.clone().lerp(c, i / n);
      P(new THREE.BoxGeometry(0.045, 0.82, 0.045), i % 2 ? WOOD1 : WOOD2, p.x, DY + 0.45, p.z);
    }
  }
  railing(-1.75, 1.88, 0.45, 1.88);
  railing(1.15, 1.88, 1.75, 1.88);
  railing(-1.75, 1.88, -1.75, -1.55);
  railing(1.75, 1.88, 1.75, -1.55);
  railing(-1.75, -1.55, 1.75, -1.55);

  // little sign on the front rail
  P(new THREE.BoxGeometry(0.62, 0.26, 0.04), WOOD3, -0.6, DY + 0.62, 1.92);
  P(new THREE.BoxGeometry(0.5, 0.06, 0.01), RED, -0.6, DY + 0.66, 1.945);
  P(new THREE.BoxGeometry(0.34, 0.035, 0.01), TEAL, -0.6, DY + 0.57, 1.945);
  for (const s of [-1, 1]) P(new THREE.SphereGeometry(0.018, 5, 4), METAL, -0.6 + s * 0.26, DY + 0.7, 1.95);

  // ---------- cabin ----------
  P(new THREE.BoxGeometry(HW, WH, HD), WOOD_D, 0, DY + WH / 2, TZ);
  for (let k = 0; k < 7; k++) {
    const y = DY + 0.14 + k * 0.257;
    for (const s of [-1, 1]) {
      P(new THREE.BoxGeometry(HW + 0.02, 0.27, 0.045).rotateZ((rand() - 0.5) * 0.012), pick([WOOD1, WOOD3, WOOD1]), 0, y, TZ + s * (HD / 2 + 0.02));
      P(new THREE.BoxGeometry(0.045, 0.27, HD + 0.02).rotateX((rand() - 0.5) * 0.012), pick([WOOD1, WOOD3, WOOD1]), s * (HW / 2 + 0.02), y, TZ);
    }
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    P(new THREE.BoxGeometry(0.12, WH, 0.12), CREAM, sx * (HW / 2 + 0.03), DY + WH / 2, TZ + sz * (HD / 2 + 0.03));

  // gables
  {
    const sh = new THREE.Shape();
    sh.moveTo(-HW / 2, 0);
    sh.lineTo(HW / 2, 0);
    sh.lineTo(0, RISE);
    sh.closePath();
    for (const s of [-1, 1]) {
      const g = new THREE.ExtrudeGeometry(sh, { depth: 0.08, bevelEnabled: false });
      g.translate(0, 0, -0.04);
      P(g, WOOD3, 0, WT, TZ + s * (HD / 2 + 0.02));
    }
    // gable battens
    for (const x of [-0.75, -0.4, 0.4, 0.75]) {
      const h = RISE * (1 - Math.abs(x) / (HW / 2)) - 0.05;
      P(new THREE.BoxGeometry(0.05, h, 0.03), WOOD2, x, WT + h / 2, TZ + HD / 2 + 0.07);
    }
  }
  // round gable window
  {
    const y = WT + 0.45, z = TZ + HD / 2 + 0.08;
    P(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 12).rotateX(Math.PI / 2), GLOW, 0, y, z);
    P(new THREE.TorusGeometry(0.24, 0.05, 5, 12), CREAM, 0, y, z + 0.01);
    P(new THREE.BoxGeometry(0.04, 0.44, 0.03), CREAM, 0, y, z + 0.02);
    P(new THREE.BoxGeometry(0.44, 0.04, 0.03), CREAM, 0, y, z + 0.02);
  }

  // ---------- roof ----------
  {
    const ridge = V(0, WT + RISE, TZ);
    const L = (HW / 2 + 0.3) / Math.cos(A);
    const t = 0.08, len = HD + 0.6;
    for (const sg of [1, -1]) {
      const s = V(sg * Math.cos(A), -Math.sin(A), 0);
      const n = V(sg * Math.sin(A), Math.cos(A), 0);
      const c = ridge.clone().addScaledVector(s, L / 2).addScaledVector(n, t / 2);
      P(new THREE.BoxGeometry(L, t, len).rotateZ(-sg * A), ROOF_D, c.x, c.y, c.z);
      for (let j = 0; j < 7; j++) {
        const v = L - 0.16 - j * 0.3;
        const odd = j % 2 === 1;
        const cnt = odd ? 8 : 9;
        for (let i = 0; i < cnt; i++) {
          const z = TZ - len / 2 + 0.145 + i * 0.289 + (odd ? 0.144 : 0);
          const p = ridge.clone().addScaledVector(s, v).addScaledVector(n, t + 0.035);
          const g = new THREE.BoxGeometry(0.34, 0.045, 0.27).rotateZ(-sg * (A - 0.09 + (rand() - 0.5) * 0.04));
          P(g, pick([ROOF1, ROOF2, ROOF3, ROOF1]), p.x, p.y, z);
        }
      }
      // bargeboards front & back
      for (const sz of [-1, 1]) {
        const zz = TZ + sz * (len / 2 + 0.02);
        const a = ridge.clone().addScaledVector(n, t / 2);
        const e = ridge.clone().addScaledVector(s, L).addScaledVector(n, t / 2);
        beam(V(a.x, a.y, zz), V(e.x, e.y, zz), 0.17, CREAM, 0.07);
      }
    }
    P(new THREE.BoxGeometry(0.2, 0.2, len + 0.1).rotateZ(Math.PI / 4), ROOF_D, 0, ridge.y + 0.12, TZ);
    P(new THREE.SphereGeometry(0.09, 6, 5), CREAM, 0, ridge.y + 0.2, TZ + len / 2 + 0.03);
    // collar where the trunk bursts through the roof
    P(new THREE.TorusGeometry(trunkR(ridge.y) + 0.06, 0.07, 5, 10).rotateX(Math.PI / 2), BARK_D, 0, ridge.y + 0.2, TZ);
  }

  // ---------- door ----------
  {
    const x = -0.5, z = zF + 0.03;
    P(new THREE.BoxGeometry(0.72, 1.15, 0.06), TEAL, x, DY + 0.575, z);
    P(new THREE.CylinderGeometry(0.36, 0.36, 0.06, 10, 1, false, Math.PI / 2, Math.PI).rotateX(Math.PI / 2), TEAL, x, DY + 1.15, z);
    for (const dx of [-0.18, 0.18]) P(new THREE.BoxGeometry(0.025, 1.25, 0.02), TEAL_D, x + dx, DY + 0.68, z + 0.035);
    for (const s of [-1, 1]) P(new THREE.BoxGeometry(0.09, 1.17, 0.08), CREAM, x + s * 0.405, DY + 0.585, z + 0.01);
    P(new THREE.TorusGeometry(0.405, 0.045, 4, 10, Math.PI), CREAM, x, DY + 1.15, z + 0.01);
    P(new THREE.SphereGeometry(0.045, 6, 5), BRASS, x + 0.25, DY + 0.6, z + 0.06);
    P(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 10).rotateX(Math.PI / 2), GLOW, x, DY + 1.17, z + 0.035);
    P(new THREE.TorusGeometry(0.105, 0.025, 4, 10), CREAM, x, DY + 1.17, z + 0.045);
    P(new THREE.BoxGeometry(0.9, 0.05, 0.22), WOOD_D, x, DY + 0.025, zF + 0.1);
  }

  // ---------- front window with shutters and flower box ----------
  {
    const x = 0.6, y = DY + 1.0, z = zF;
    P(new THREE.BoxGeometry(0.56, 0.56, 0.03), GLOW, x, y, z + 0.015);
    P(new THREE.BoxGeometry(0.045, 0.56, 0.04), CREAM, x, y, z + 0.04);
    P(new THREE.BoxGeometry(0.56, 0.045, 0.04), CREAM, x, y, z + 0.04);
    for (const s of [-1, 1]) {
      P(new THREE.BoxGeometry(0.08, 0.72, 0.06), CREAM, x + s * 0.32, y, z + 0.03);
      P(new THREE.BoxGeometry(0.72, 0.08, 0.06), CREAM, x, y + s * 0.32, z + 0.03);
      const sx = x + s * 0.5;
      P(new THREE.BoxGeometry(0.26, 0.64, 0.04), TEAL, sx, y, z + 0.02);
      for (const dy of [-0.18, 0, 0.18]) P(new THREE.BoxGeometry(0.2, 0.02, 0.015), TEAL_D, sx, y + dy, z + 0.045);
    }
    P(new THREE.BoxGeometry(0.72, 0.16, 0.18), WOOD_D, x, y - 0.42, z + 0.1);
    for (let i = 0; i < 6; i++) {
      const fx = x - 0.28 + i * 0.112;
      P(blob(0.06, 1, 0.8, 1), LEAF3, fx, y - 0.32, z + 0.1 + (rand() - 0.5) * 0.06);
      P(new THREE.SphereGeometry(0.055, 6, 4), pick([RED, PINK, YELLOW, WHITE]), fx + 0.03, y - 0.25 + rand() * 0.05, z + 0.12);
    }
  }

  // ---------- side windows ----------
  {
    const xs = HW / 2 + 0.045;
    // +X porthole
    P(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 12).rotateZ(Math.PI / 2), GLOW, xs + 0.01, DY + 1.05, TZ);
    P(new THREE.TorusGeometry(0.24, 0.05, 5, 12).rotateY(Math.PI / 2), CREAM, xs + 0.02, DY + 1.05, TZ);
    P(new THREE.BoxGeometry(0.03, 0.44, 0.04), CREAM, xs + 0.03, DY + 1.05, TZ);
    // -X square window
    P(new THREE.BoxGeometry(0.03, 0.5, 0.5), GLOW, -xs - 0.01, DY + 1.0, TZ);
    for (const s of [-1, 1]) {
      P(new THREE.BoxGeometry(0.06, 0.64, 0.07), CREAM, -xs - 0.02, DY + 1.0, TZ + s * 0.285);
      P(new THREE.BoxGeometry(0.06, 0.07, 0.64), CREAM, -xs - 0.02, DY + 1.0 + s * 0.285, TZ);
    }
    P(new THREE.BoxGeometry(0.04, 0.5, 0.04), CREAM, -xs - 0.03, DY + 1.0, TZ);
    P(new THREE.BoxGeometry(0.04, 0.04, 0.5), CREAM, -xs - 0.03, DY + 1.0, TZ);
  }

  // ---------- bunting between the front poles ----------
  {
    const N = 12, sag = 0.38, y0 = DY + 1.65, z = 1.85;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const x = -1.72 + 3.44 * t;
      pts.push(V(x, y0 - sag * 4 * t * (1 - t), z));
    }
    for (let i = 0; i < N; i++) rod(pts[i], pts[i + 1], 0.012, 0.012, ROPE, 4);
    const fc = [RED, YELLOW, TEAL, CREAM, BLUE, PINK];
    for (let i = 1; i < N; i++) {
      const p = pts[i];
      P(new THREE.ConeGeometry(0.1, 0.24, 3).rotateX(Math.PI).scale(1, 1, 0.3), fc[i % fc.length], p.x, p.y - 0.13, p.z);
    }
  }

  // ---------- hanging lantern under the front eave ----------
  {
    const x = 1.35, z = TZ + HD / 2 + 0.3 - 0.05;
    const yTop = WT + 0.2;
    rod(V(x, yTop, z), V(x, WT - 0.15, z), 0.01, 0.01, METAL, 4);
    P(new THREE.ConeGeometry(0.13, 0.1, 4).rotateY(Math.PI / 4), METAL, x, WT - 0.2, z);
    P(new THREE.BoxGeometry(0.14, 0.2, 0.14), GLOW, x, WT - 0.35, z);
    for (const sx of [-1, 1]) for (const sz of [-1, 1])
      P(new THREE.BoxGeometry(0.02, 0.2, 0.02), METAL, x + sx * 0.07, WT - 0.35, z + sz * 0.07);
    P(new THREE.BoxGeometry(0.17, 0.04, 0.17), METAL, x, WT - 0.47, z);
  }

  // ---------- porch props: crate + telescope ----------
  {
    const cx = -1.2, cz = 1.35, s = 0.46;
    P(new THREE.BoxGeometry(s, s, s), WOOD2, cx, DY + s / 2, cz);
    for (const sy of [-1, 1]) P(new THREE.BoxGeometry(s + 0.02, 0.06, s + 0.02), WOOD_D, cx, DY + s / 2 + sy * 0.18, cz);
    P(new THREE.BoxGeometry(0.06, s + 0.01, s + 0.02), WOOD_D, cx, DY + s / 2, cz);
    rod(V(cx, DY + s + 0.02, cz), V(cx + 0.3, DY + s + 0.4, cz + 0.32), 0.045, 0.065, BRASS, 8);
    P(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 8).rotateX(0.75).rotateY(0.75), BLACK, cx + 0.3, DY + s + 0.4, cz + 0.32);
  }

  // ---------- pulley bucket on the +X side ----------
  {
    const z = 0.2;
    beam(V(1.78, DY, z), V(1.78, DY + 1.6, z), 0.1, WOOD_D);
    beam(V(1.78, DY + 1.55, z), V(2.5, DY + 1.55, z), 0.09, WOOD_D);
    beam(V(1.78, DY + 1.2, z), V(2.15, DY + 1.55, z), 0.06, WOOD2);
    P(new THREE.TorusGeometry(0.1, 0.03, 5, 10), METAL, 2.42, DY + 1.42, z);
    rod(V(2.52, DY + 1.42, z), V(2.52, 1.42, z), 0.012, 0.012, ROPE, 4);
    rod(V(2.32, DY + 1.42, z), V(1.82, DY + 0.75, z), 0.012, 0.012, ROPE, 4);
    P(new THREE.CylinderGeometry(0.18, 0.14, 0.28, 8), WOOD2, 2.52, 1.12, z);
    for (const dy of [-0.08, 0.08]) P(new THREE.TorusGeometry(0.165 - dy * 0.12, 0.018, 4, 10).rotateX(Math.PI / 2), METAL, 2.52, 1.12 + dy, z);
    P(new THREE.TorusGeometry(0.18, 0.012, 4, 10, Math.PI), METAL, 2.52, 1.26, z);
    P(new THREE.SphereGeometry(0.06, 6, 5), RED, 2.47, 1.27, z + 0.03);
    P(new THREE.SphereGeometry(0.06, 6, 5), RED, 2.57, 1.26, z - 0.02);
  }

  // ---------- rope swing from the -X branch ----------
  {
    const x = -2.4, zc = 0.142, ytop = 6.66, ys = 0.6;
    for (const s of [-1, 1]) {
      rod(V(x, ytop, zc), V(x, ys + 0.03, zc + s * 0.27), 0.014, 0.014, ROPE, 4);
      P(new THREE.SphereGeometry(0.035, 5, 4), ROPE, x, ys + 0.05, zc + s * 0.27);
    }
    P(new THREE.TorusGeometry(0.08, 0.025, 4, 8).rotateY(Math.PI / 2), ROPE, x, ytop, zc);
    P(new THREE.BoxGeometry(0.26, 0.05, 0.68), WOOD3, x, ys, zc);
    P(new THREE.BoxGeometry(0.27, 0.02, 0.06), RED, x, ys + 0.03, zc);
  }

  // ---------- ground details ----------
  const occupied = [V(0.8, 0, 2.4), V(1.72, 0, 1.85), V(-1.72, 0, 1.85), V(0, 0, TZ), V(-2.4, 0, 0.14)];
  const freeSpot = (rmin: number, rmax: number, clear: number) => {
    for (let k = 0; k < 20; k++) {
      const az = rand() * Math.PI * 2, r = rmin + rand() * (rmax - rmin);
      const p = V(Math.sin(az) * r, 0, Math.cos(az) * r + TZ * 0.3);
      if (occupied.every((o) => Math.hypot(o.x - p.x, o.z - p.z) > clear)) {
        occupied.push(p);
        return p;
      }
    }
    return V(0, 0, -2.4);
  };
  // rocks
  for (let i = 0; i < 6; i++) {
    const p = freeSpot(1.4, 2.6, 0.45);
    const r = 0.12 + rand() * 0.14;
    P(blob(r, 1.2, 0.7, 1).rotateY(rand() * 3), i % 2 ? STONE : STONE_D, p.x, 0.2 + r * 0.3, p.z);
  }
  // mushrooms
  for (let i = 0; i < 5; i++) {
    const p = freeSpot(1.0, 2.3, 0.35);
    const h = 0.1 + rand() * 0.08, r = 0.07 + rand() * 0.05;
    P(new THREE.CylinderGeometry(r * 0.35, r * 0.45, h, 6), WHITE, p.x, 0.2 + h / 2, p.z);
    P(new THREE.SphereGeometry(r, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), RED, p.x, 0.2 + h - 0.01, p.z);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + rand();
      P(new THREE.SphereGeometry(r * 0.17, 4, 3), WHITE, p.x + Math.sin(a) * r * 0.6, 0.2 + h + r * 0.62, p.z + Math.cos(a) * r * 0.6);
    }
  }
  // flowers
  for (let i = 0; i < 12; i++) {
    const p = freeSpot(0.9, 2.65, 0.2);
    const h = 0.15 + rand() * 0.15;
    P(new THREE.CylinderGeometry(0.01, 0.012, h, 4), GRASS_D, p.x, 0.2 + h / 2, p.z);
    P(new THREE.SphereGeometry(0.045, 6, 4).scale(1, 0.6, 1), pick([RED, PINK, YELLOW, WHITE, BLUE]), p.x, 0.2 + h, p.z);
    P(new THREE.SphereGeometry(0.018, 4, 3), YELLOW, p.x, 0.2 + h + 0.025, p.z);
  }
  // grass tufts
  for (let i = 0; i < 18; i++) {
    const p = freeSpot(0.8, 2.75, 0.15);
    for (let k = 0; k < 3; k++) {
      const h = 0.14 + rand() * 0.12;
      const g = new THREE.ConeGeometry(0.035, h, 3).rotateZ((k - 1) * 0.35).rotateY(rand() * 3);
      P(g, k === 1 ? GRASS_D : LEAF3, p.x + (k - 1) * 0.03, 0.2 + h / 2 - 0.01, p.z);
    }
  }

  return b.root;
}
```