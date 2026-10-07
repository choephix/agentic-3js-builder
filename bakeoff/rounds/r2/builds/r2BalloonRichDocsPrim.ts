import * as THREE from "three";
import { createBuilder, paint } from "../../../../src/index";

export const meta = {
  name: "Hot-air balloon at take-off",
  description:
    "Striped envelope with a diamond band, glowing burner, rope rigging, wicker basket with sandbags, a corner flag and a tether line.",
};

const YEL = "#ffc928";
const RED = "#e8412c";
const BLUE = "#4aa8e0";
const NAVY = "#1d2b53";
const CREAM = "#f6e8c4";
const GOLD = "#e0a82a";
const WICK1 = "#b9833f";
const WICK2 = "#96662a";
const LEATHER = "#5e3519";
const STEEL = "#8d949c";
const ROPE = "#d9c9a0";
const SAND = "#d9c08a";
const FLAME = "#ff8a1f";
const CORE = "#ffd84a";

export default function build() {
  const b = createBuilder({ name: "balloon" });
  const basket = b.joint("basket", { at: [0, 0.55, 0] });
  const env = b.joint("envelope", { parent: basket, at: [0, 4.5, 0], dir: [0, 1, 0] });
  const burner = b.joint("burner", { parent: basket, at: [0, 3.3, 0], dir: [0, 1, 0] });
  const flagJ = b.joint("flag", { parent: basket, at: [0.65, 1.95, 0.65], dir: [1, 0, 0] });

  // ---------- envelope ----------
  const envPaint = paint((p) => {
    if (p.y > 18.5) return CREAM;
    if (p.y < 5.3) return "#efe0b8";
    const a = Math.atan2(p.x, p.z);
    const g = (a / (Math.PI * 2) + 0.5) * 12;
    const gi = Math.floor(g);
    const u = g - gi;
    if (p.y > 9.2 && p.y < 10.8) {
      const v = (p.y - 9.2) / 1.6;
      if (v < 0.09 || v > 0.91) return GOLD;
      const d = Math.abs(u - 0.5) + Math.abs(v - 0.5) * 0.55;
      if (d < 0.2) return gi % 2 ? RED : YEL;
      if (d < 0.32) return CREAM;
      return NAVY;
    }
    return [YEL, RED, BLUE][((gi % 3) + 3) % 3];
  });
  const outline: [number, number][] = [
    [0, 4.5],
    [1.5, 4.5],
    [1.8, 5.2],
    [2.7, 6.2],
    [3.8, 7.2],
    [5.0, 8.2],
    [6.0, 9.2],
    [6.7, 10.4],
    [7.0, 11.8],
    [6.9, 13.2],
    [6.4, 14.7],
    [5.5, 16.0],
    [4.3, 17.2],
    [3.0, 18.2],
    [1.6, 18.9],
    [0, 19.3],
  ];
  b.lathe(outline, { at: [0, 0, 0], bone: env, segments: 36, color: envPaint });
  // mouth ring
  b.part(new THREE.TorusGeometry(1.52, 0.06, 5, 20), STEEL, { bone: env, at: [0, 4.5, 0], rotation: [90, 0, 0] });

  // ---------- basket ----------
  const weave = paint((p) => {
    const k = Math.floor(p.y / 0.06) + Math.floor((p.x + p.z) / 0.06);
    return k % 2 ? WICK1 : WICK2;
  });
  b.part(new THREE.BoxGeometry(1.3, 1.1, 1.3), weave, { bone: basket, at: [0, 0.53, 0] });
  b.part(new THREE.BoxGeometry(1.36, 0.1, 1.36), LEATHER, { bone: basket, at: [0, 0.3, 0] });
  b.part(new THREE.BoxGeometry(1.4, 0.1, 1.4), LEATHER, { bone: basket, at: [0, 1.1, 0] });
  b.part(new THREE.BoxGeometry(1.2, 0.04, 1.2), WICK2, { bone: basket, at: [0, 1.1, 0] });
  // rim top (open dark interior look)
  b.part(new THREE.BoxGeometry(1.1, 0.02, 1.1), "#3a2412", { bone: basket, at: [0, 1.125, 0] });

  const corners: [number, number][] = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  const ropeAt = (a: number[], c: number[]) => b.rod(a, c, 0.012, { color: ROPE, sides: 5, bone: basket });

  for (const [sx, sz] of corners) {
    // leather corner pads
    b.part(new THREE.BoxGeometry(0.1, 1.1, 0.1), LEATHER, { bone: basket, at: [sx * 0.66, 0.55, sz * 0.66] });
    // support pole
    const top = [sx * 0.75, 3.3, sz * 0.75];
    b.rod([sx * 0.66, 1.1, sz * 0.66], top, 0.03, { color: STEEL, sides: 6, bone: basket });
    // ropes to envelope mouth
    const th = Math.atan2(sx, sz);
    for (const d of [-0.3, 0.3]) {
      const a = th + d;
      ropeAt(top, [Math.sin(a) * 1.52, 4.5, Math.cos(a) * 1.52]);
    }
  }
  // burner frame
  for (let i = 0; i < 4; i++) {
    const [ax, az] = corners[[0, 1, 3, 2][i]];
    const [cx, cz] = corners[[0, 1, 3, 2][(i + 1) % 4]];
    b.rod([ax * 0.75, 3.3, az * 0.75], [cx * 0.75, 3.3, cz * 0.75], 0.025, { color: STEEL, sides: 6, bone: basket });
  }
  b.rod([-0.75, 3.3, 0], [0.75, 3.3, 0], 0.02, { color: STEEL, sides: 6, bone: basket });
  b.rod([0, 3.3, -0.75], [0, 3.3, 0.75], 0.02, { color: STEEL, sides: 6, bone: basket });
  // burner unit
  b.part(new THREE.CylinderGeometry(0.1, 0.13, 0.3, 8), STEEL, { bone: burner, at: [0, 3.4, 0] });
  b.part(new THREE.TorusGeometry(0.28, 0.045, 5, 12), "#c4561a", { bone: burner, at: [0, 3.6, 0], rotation: [90, 0, 0] });
  b.part(new THREE.ConeGeometry(0.3, 1.5, 8, 1, true), FLAME, { bone: burner, at: [0, 4.4, 0], flat: true });
  b.part(new THREE.ConeGeometry(0.17, 1.0, 7), CORE, { bone: burner, at: [0, 4.2, 0], flat: true });
  b.part(new THREE.SphereGeometry(0.12, 6, 4), "#fff2b0", { bone: burner, at: [0, 3.75, 0] });

  // ---------- sandbags ----------
  const bags: [number, number, number][] = [
    [1, 0, 0.3],
    [1, 0, -0.3],
    [-1, 0, 0.3],
    [-1, 0, -0.3],
    [0, 1, 0.3],
    [0, 1, -0.3],
  ];
  for (const [nx, nz, off] of bags) {
    // nx: side x sign; nz: 1 → front face (z)
    const isFront = nz === 1;
    const pos = isFront ? [off, 0.86, 0.8] : [nx * 0.8, 0.86, off];
    const attach = isFront ? [off, 1.1, 0.7] : [nx * 0.7, 1.1, off];
    ropeAt(attach, [pos[0], pos[1] + 0.2, pos[2]]);
    b.part(new THREE.SphereGeometry(0.18, 7, 5), SAND, { bone: basket, at: pos, scale: [1, 1.3, 1] });
    b.part(new THREE.CylinderGeometry(0.04, 0.06, 0.07, 6), LEATHER, {
      bone: basket,
      at: [pos[0], pos[1] + 0.22, pos[2]],
    });
  }

  // ---------- flag ----------
  b.rod([0.65, 1.1, 0.65], [0.65, 2.0, 0.65], 0.016, { color: "#f2f2f2", sides: 6, bone: basket });
  b.part(new THREE.SphereGeometry(0.035, 6, 4), GOLD, { bone: flagJ, at: [0.65, 2.03, 0.65] });
  b.extrude(
    [
      [0, 0],
      [0.55, 0],
      [0.42, 0.12],
      [0.55, 0.24],
      [0, 0.24],
    ],
    { at: [0.65, 1.74, 0.65], x: [1, 0, 0], thickness: 0.012, color: RED, bone: flagJ },
  );
  b.extrude(
    [
      [0, 0.08],
      [0.4, 0.08],
      [0.4, 0.16],
      [0, 0.16],
    ],
    { at: [0.65, 1.74, 0.668], x: [1, 0, 0], thickness: 0.008, color: YEL, bone: flagJ },
  );

  // ---------- tether ----------
  b.rod([0, 0.35, 0.68], [0, 0.12, 2.6], 0.02, { color: ROPE, sides: 5, bone: basket });
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 6), LEATHER, {
    bone: basket,
    at: [0, 0.12, 2.65],
    rotation: [-30, 0, 0],
  });

  return b.root;
}
