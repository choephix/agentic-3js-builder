import * as THREE from "three";
import { createBuilder, paint } from "../../../../src/index";

export const meta = {
  name: "Hot-air balloon at take-off",
  description:
    "Striped sunflower, tomato and sky-blue envelope with a diamond band, glowing burner, cable rig, woven wicker basket, sandbags and a pennant.",
};

const SUN = "#ffc928";
const RED = "#e8452c";
const SKY = "#3fa7e0";
const CREAM = "#fff1cf";
const NAVY = "#23305e";
const STEEL = "#7b838a";
const DARKSTEEL = "#3b4046";
const ROPE = "#e9dcb8";
const LEATHER = "#5a3418";
const WICK1 = "#c88f48";
const WICK2 = "#a8723a";
const WICKDARK = "#6b4a2a";
const SAND = "#dcc58f";

export default function build() {
  const b = createBuilder({ name: "balloon", paintSize: 2048 });

  const basket = b.joint("basket", { at: [0, 0.5, 0] });
  const env = b.joint("envelope", { parent: basket, at: [0, 10, 0], dir: [0, 1, 0] });
  const flag = b.joint("flagPole", { parent: basket, at: [0.74, 1.0, 0.57], dir: [0, 1, 0] });

  const box = (w: number, h: number, d: number, at: number[], color: any, bone: any = basket) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, bone });

  // ---------- Envelope ----------
  const TAU = Math.PI * 2;
  const COLS = [SUN, RED, SKY];
  const envPaint = paint((p) => {
    const y = p.y;
    if (y > 8.85 && y < 10.75) {
      if (y < 9.05 || y > 10.55) return RED;
      if (y < 9.15 || y > 10.45) return CREAM;
      const ang = Math.atan2(p.x, p.z) + Math.PI;
      const fa = ((ang / TAU) * 36) % 1 - 0.5;
      const fv = (((y - 9.15) / 0.65) % 1) - 0.5;
      if (Math.abs(fa) + Math.abs(fv) < 0.46) {
        return Math.abs(fa) + Math.abs(fv) < 0.2 ? RED : SUN;
      }
      return NAVY;
    }
    const ang = Math.atan2(p.x, p.z) + Math.PI;
    const g = (ang / TAU) * 18;
    const gi = Math.floor(g);
    const f = g - gi;
    if (f < 0.025 || f > 0.975) return CREAM;
    return COLS[((gi % 3) + 3) % 3];
  });

  const envelope = b.lathe(
    [
      [0, 16.6],
      [1.2, 16.1],
      [2.6, 15.1],
      [3.9, 13.5],
      [4.9, 11.7],
      [5.4, 9.9],
      [5.2, 8.0],
      [4.3, 6.4],
      [3.0, 5.2],
      [1.7, 4.55],
      [1.12, 4.3],
      [0, 4.3],
    ],
    { at: [0, 0, 0], segments: 24, bone: env, color: envPaint },
  );
  b.part(new THREE.CylinderGeometry(0.8, 0.9, 0.18, 12), NAVY, { at: [0, 16.5, 0], bone: env });
  b.part(new THREE.SphereGeometry(0.16, 8, 6), SUN, { at: [0, 16.62, 0], bone: env });

  // mouth skirt
  b.lathe(
    [
      [1.14, 4.4],
      [1.02, 3.35],
      [0.95, 3.35],
      [1.06, 4.4],
    ],
    { at: [0, 0, 0], segments: 18, bone: env, color: envPaint },
  );
  b.part(new THREE.TorusGeometry(1.0, 0.03, 5, 18), ROPE, { at: [0, 3.36, 0], rotation: [90, 0, 0], bone: env });

  // ---------- Basket ----------
  const wick = paint((p, n) => {
    const h = Math.abs(n.x) > 0.5 ? p.z : p.x;
    const a = Math.floor(p.y / 0.06);
    const c = Math.floor(h / 0.06);
    return (a + c) & 1 ? WICK1 : WICK2;
  });
  box(1.4, 1.0, 0.07, [0, 0.5, 0.515], wick);
  box(1.4, 1.0, 0.07, [0, 0.5, -0.515], wick);
  box(0.07, 1.0, 1.0, [0.665, 0.5, 0], wick);
  box(0.07, 1.0, 1.0, [-0.665, 0.5, 0], wick);
  box(1.4, 0.1, 1.1, [0, 0.05, 0], WICKDARK);
  box(1.5, 0.06, 1.2, [0, 0.03, 0], LEATHER);
  // rim
  for (const s of [1, -1]) {
    box(1.52, 0.1, 0.12, [0, 0.97, s * 0.55], LEATHER);
    box(0.12, 0.1, 1.22, [s * 0.7, 0.97, 0], LEATHER);
    for (const t of [1, -1]) box(0.09, 1.04, 0.09, [s * 0.7, 0.5, t * 0.55], LEATHER);
    // mid straps
    box(1.46, 0.05, 0.02, [0, 0.45, s * 0.555], LEATHER);
    box(0.02, 0.05, 1.06, [s * 0.705, 0.45, 0], LEATHER);
  }

  // propane tanks
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.6, 10), "#b9c0c6", { at: [s * 0.4, 0.4, -0.25], bone: basket });
    b.part(new THREE.SphereGeometry(0.17, 10, 5, 0, TAU, 0, Math.PI / 2), "#b9c0c6", {
      at: [s * 0.4, 0.7, -0.25],
      bone: basket,
    });
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 6), RED, { at: [s * 0.4, 0.9, -0.25], bone: basket });
  }

  // ---------- Support poles, burner ----------
  const corners: [number, number][] = [
    [0.62, 0.45],
    [-0.62, 0.45],
    [0.62, -0.45],
    [-0.62, -0.45],
  ];
  for (const [x, z] of corners) {
    b.rod([x, 1.0, z], [x, 2.7, z], 0.025, { color: STEEL, bone: basket, sides: 6 });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), STEEL, { at: [x, 2.72, z], bone: basket });
  }
  for (let i = 0; i < 4; i++) {
    const a = corners[i];
    const c = corners[(i + 1) % 4 === 3 && i === 2 ? 3 : [1, 3, 0, 2][i]];
    b.rod([a[0], 2.62, a[1]], [c[0], 2.62, c[1]], 0.02, { color: STEEL, bone: basket, sides: 6 });
  }
  b.rod([0.62, 2.62, 0.45], [-0.62, 2.62, -0.45], 0.018, { color: STEEL, bone: basket, sides: 6 });
  b.rod([-0.62, 2.62, 0.45], [0.62, 2.62, -0.45], 0.018, { color: STEEL, bone: basket, sides: 6 });
  b.part(new THREE.CylinderGeometry(0.09, 0.11, 0.34, 8), DARKSTEEL, { at: [0, 2.78, 0], bone: basket });
  b.part(new THREE.TorusGeometry(0.17, 0.035, 5, 10), "#d9531e", { at: [0, 2.97, 0], rotation: [90, 0, 0], bone: basket });
  b.part(new THREE.CylinderGeometry(0.19, 0.17, 0.05, 10), DARKSTEEL, { at: [0, 2.93, 0], bone: basket });
  // flame
  b.part(new THREE.ConeGeometry(0.22, 1.05, 8), "#ff7a1a", { at: [0, 3.52, 0], bone: basket, flat: true });
  b.part(new THREE.ConeGeometry(0.14, 0.75, 8), "#ffc02e", { at: [0, 3.4, 0], bone: basket, flat: true });
  b.part(new THREE.ConeGeometry(0.07, 0.45, 6), "#fff3b0", { at: [0, 3.25, 0], bone: basket, flat: true });
  // hoses
  for (const s of [1, -1]) {
    b.rod([s * 0.4, 0.95, -0.25], [s * 0.1, 2.65, -0.05], 0.014, { color: DARKSTEEL, bone: basket, sides: 5 });
  }

  // ---------- Suspension ropes ----------
  const skin = b.surface(envelope);
  for (const [x, z] of corners) {
    const base = Math.atan2(z, x);
    for (const off of [-0.2, 0.2]) {
      const a = base + off;
      const dx = Math.cos(a);
      const dz = Math.sin(a);
      const hit = skin.ray([dx * 9, 6.0, dz * 9], [-dx, 0, -dz]);
      const end = hit ? [hit.at.x, hit.at.y, hit.at.z] : [dx * 4.2, 6.0, dz * 4.2];
      b.rod([x, 2.72, z], end, 0.014, { color: ROPE, bone: basket, sides: 5 });
    }
  }

  // ---------- Sandbags ----------
  for (const s of [1, -1]) {
    for (const z of [-0.28, 0.28]) {
      const x = s * 0.88;
      b.rod([s * 0.78, 0.97, z], [x, 0.83, z], 0.012, { color: ROPE, bone: basket, sides: 5 });
      b.part(new THREE.SphereGeometry(0.13, 8, 6), SAND, {
        at: [x, 0.65, z],
        scale: [0.85, 1.2, 0.85],
        bone: basket,
        flat: true,
      });
      b.part(new THREE.ConeGeometry(0.05, 0.1, 6), RED, { at: [x, 0.83, z], bone: basket });
      b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.04, 8), SKY, {
        at: [x, 0.62, z],
        scale: [0.9, 1, 0.9],
        bone: basket,
      });
    }
  }

  // ---------- Flag ----------
  b.rod([0.74, 0.95, 0.57], [0.74, 2.0, 0.57], 0.014, { color: "#e7e2d4", bone: flag, sides: 6 });
  b.part(new THREE.SphereGeometry(0.035, 6, 5), SUN, { at: [0.74, 2.03, 0.57], bone: flag });
  b.extrude(
    [
      [0, 0],
      [0.7, 0.04],
      [0.52, 0.15],
      [0.7, 0.26],
      [0, 0.3],
    ],
    {
      at: [0.74, 1.7, 0.57],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.012,
      bone: flag,
      color: paint((_p, _n, s) => (s[0] < 0.2 ? RED : s[0] < 0.42 ? SUN : SKY)),
    },
  );

  return b.root;
}
