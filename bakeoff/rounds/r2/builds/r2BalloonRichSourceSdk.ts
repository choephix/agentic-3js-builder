import * as THREE from "three";
import { createBuilder, paint } from "../../../../src/index";

export const meta = {
  name: "Hot-Air Balloon",
  description:
    "A hot-air balloon about to take off: striped envelope with a patterned band, glowing burner, rope rigging, wicker basket with sandbags, propane tanks and a pennant.",
};

const DEG = Math.PI / 180;

export default function build() {
  const b = createBuilder({ name: "balloon", paintSize: 2048 });

  // ---- skeleton (a prop: a few joints) ----
  b.joint("basket", { at: [0, 0.5, 0] });
  b.joint("envelope", { parent: "basket", at: [0, 10.4, 0], dir: [0, 1, 0] });
  b.joint("burner", { parent: "basket", at: [0, 3.2, 0], dir: [0, 1, 0] });
  b.joint("flag", { parent: "basket", at: [-0.7, 1.0, -0.55], dir: [0, 1, 0] });

  const YEL = "#ffc928";
  const RED = "#e8452e";
  const BLU = "#3fa3e0";
  const CREAM = "#fff1cf";
  const NAVY = "#1d2f5c";
  const gore = [YEL, RED, BLU];

  // ---- envelope paint: 12 gores, tapes, skirt, patterned band ----
  const BAND0 = 9.3;
  const BAND1 = 11.5;
  const envPaint = paint((p) => {
    const ang = (Math.atan2(p.x, p.z) / DEG + 360) % 360;
    const gi = Math.floor(ang / 30);
    const f = (ang % 30) / 30;
    const y = p.y;
    if (y < 5.15) return y < 4.75 ? "#2a2024" : "#4a2a2a";
    if (y > BAND0 && y < BAND1) {
      const v = (y - BAND0) / (BAND1 - BAND0);
      if (v < 0.1 || v > 0.9) return NAVY;
      if (v < 0.16 || v > 0.84) return "#ffd34a";
      const d = Math.abs(v - 0.5) * 2.2 + Math.abs(f - 0.5) * 2;
      if (d < 0.75) return gi % 2 ? RED : YEL;
      if (d < 0.95) return NAVY;
      return CREAM;
    }
    if (f < 0.018 || f > 0.982) return CREAM;
    return gore[gi % 3];
  });

  const envelope = b.lathe(
    [
      [0, 4.9, "sharp"],
      [1.35, 4.4, "sharp"],
      [2.4, 5.4],
      [3.9, 6.8],
      [5.0, 8.4],
      [5.6, 10.4],
      [5.1, 12.6],
      [3.8, 14.6],
      [2.0, 16.0],
      [0, 16.7, "sharp"],
    ],
    { color: envPaint, at: [0, 0, 0], segments: 24, smoothing: 1, bone: "envelope", name: "envelope" },
  );
  void envelope;

  // top vent cap
  b.part(new THREE.CylinderGeometry(0.8, 0.9, 0.14, 12), "#2a2a35", { at: [0, 16.62, 0], bone: "envelope" });

  // ---- basket ----
  const weave = paint((p, n) => {
    if (Math.abs(n.y) > 0.8) return "#8b5a24";
    const hc = Math.abs(n.z) > Math.abs(n.x) ? p.x : p.z;
    const i = Math.floor(hc / 0.06);
    const j = Math.floor(p.y / 0.05);
    const fx = hc / 0.06 - i;
    const fy = p.y / 0.05 - j;
    if (fx < 0.08 || fy < 0.1) return "#6e4519";
    return (i + j) & 1 ? "#d49a47" : "#b9792f";
  });
  b.part(new THREE.BoxGeometry(1.4, 0.95, 1.1), weave, { at: [0, 0.52, 0], bone: "basket", name: "wicker" });
  b.part(new THREE.BoxGeometry(1.5, 0.1, 1.2), "#5a3716", { at: [0, 0.03, 0], bone: "basket", name: "skid" });
  // padded leather rim
  const rim = "#6b3a1f";
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(1.52, 0.13, 0.16), rim, { at: [0, 1.02, s * 0.55], bone: "basket" });
    b.part(new THREE.BoxGeometry(0.16, 0.13, 1.2), rim, { at: [s * 0.7, 1.02, 0], bone: "basket" });
  }

  // corner poles, frame, ropes
  const steel = "#8d939c";
  const tops: Array<[number, number, number]> = [];
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const top: [number, number, number] = [sx * 0.55, 3.0, sz * 0.42];
      tops.push(top);
      b.rod([sx * 0.62, 0.95, sz * 0.47], top, 0.035, { color: steel, bone: "basket", sides: 6 });
      b.part(new THREE.SphereGeometry(0.06, 6, 5), "#444a55", { at: top, bone: "basket" });
      const a0 = Math.atan2(sx, sz);
      for (const da of [-0.4, 0.4]) {
        const a = a0 + da;
        b.rod([1.35 * Math.sin(a), 4.5, 1.35 * Math.cos(a)], top, 0.018, { color: "#e3d3a6", bone: "basket", sides: 5 });
      }
    }
  const frameRods: Array<[[number, number, number], [number, number, number]]> = [
    [[-0.55, 3.0, 0.42], [0.55, 3.0, 0.42]],
    [[-0.55, 3.0, -0.42], [0.55, 3.0, -0.42]],
    [[-0.55, 3.0, -0.42], [-0.55, 3.0, 0.42]],
    [[0.55, 3.0, -0.42], [0.55, 3.0, 0.42]],
    [[-0.55, 3.0, 0], [0.55, 3.0, 0]],
  ];
  for (const [a, c] of frameRods) b.rod(a, c, 0.03, { color: steel, bone: "basket", sides: 6 });

  // ---- burner ----
  b.part(new THREE.CylinderGeometry(0.1, 0.13, 0.4, 8), "#4b5059", { at: [0, 3.25, 0], bone: "burner" });
  b.part(new THREE.TorusGeometry(0.17, 0.035, 5, 10), "#c9732a", { at: [0, 3.42, 0], rotation: [90, 0, 0], bone: "burner" });
  b.part(new THREE.CylinderGeometry(0.2, 0.1, 0.12, 8), "#2e323a", { at: [0, 3.5, 0], bone: "burner" });
  b.spike([0, 3.55, 0], [0, 1, 0], 1.5, 0.3, { color: "#ff7a1a", bone: "burner", sides: 6, name: "flame" });
  b.spike([0, 3.55, 0], [0, 1, 0], 0.95, 0.17, { color: "#ffd23a", bone: "burner", sides: 6, name: "flameCore" });
  // propane tanks + hoses
  for (const s of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 1.2, 10), "#d9402f", { at: [s * 0.33, 0.7, 0], bone: "basket" });
    b.part(new THREE.SphereGeometry(0.2, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), "#d9402f", { at: [s * 0.33, 1.3, 0], bone: "basket" });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 6), "#b8923a", { at: [s * 0.33, 1.52, 0], bone: "basket" });
    b.rod([s * 0.33, 1.55, 0], [s * 0.07, 3.15, 0], 0.02, { color: "#222428", bone: "basket", sides: 5 });
  }

  // ---- sandbags ----
  const bagProfile: Array<[number, number]> = [
    [0, 0], [0.1, 0.02], [0.17, 0.12], [0.16, 0.25], [0.07, 0.33], [0.045, 0.4], [0, 0.4],
  ];
  for (const sx of [-1, 1])
    for (const z of [-0.28, 0.28]) {
      b.lathe(bagProfile, { color: "#bfa070", at: [sx * 0.98, 0.52, z], segments: 8, bone: "basket", name: "sandbag" });
      b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 6), "#5a3d20", { at: [sx * 0.98, 0.9, z], bone: "basket" });
      b.rod([sx * 0.76, 1.0, z], [sx * 0.98, 0.93, z], 0.014, { color: "#e3d3a6", bone: "basket", sides: 5 });
    }

  // ---- flag ----
  b.rod([-0.7, 1.0, -0.55], [-0.7, 2.5, -0.55], 0.018, { color: "#3a3a3f", bone: "flag", sides: 6 });
  b.part(new THREE.SphereGeometry(0.04, 6, 5), "#e6b422", { at: [-0.7, 2.53, -0.55], bone: "flag" });
  b.extrude(
    [[0, 0], [0.7, 0], [0.55, 0.17], [0.7, 0.34], [0, 0.34]],
    { color: RED, at: [-0.7, 2.1, -0.57], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.012, bone: "flag", name: "pennant" },
  );
  b.extrude(
    [[0.08, 0.08], [0.42, 0.08], [0.34, 0.17], [0.42, 0.26], [0.08, 0.26]],
    { color: YEL, at: [-0.7, 2.1, -0.57], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.02, bone: "flag", name: "pennantStripe" },
  );

  return b.root;
}
