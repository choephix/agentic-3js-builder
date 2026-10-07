```ts
import * as THREE from "three";
import { createBuilder, grain } from "agentic-3js-builder";

export const meta = {
  name: "Explorer's Telescope",
  description: "Brass telescope with leather wraps, finder scope, rubber eyecup and focus knobs on a mahogany tripod with a star chart tray.",
};

export default function build() {
  const b = createBuilder({ name: "telescope" });
  const BRASS = "#c8963e", DBRASS = "#8a6428", LEATHER = "#7a4a2a", DLEATHER = "#2e1a10";
  const RUBBER = "#1a1a1a", GLASS = "#7fb0c8", MAHOG = "#6b2e1a";
  const wood = grain("#5a2416", "#80402a", { size: 0.02, axis: "y" });

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  b.joint("base", { at: [0, 0, 0] });
  b.joint("pan", { parent: "base", at: [0, 1.27, 0] });
  b.joint("altitude", { parent: "pan", at: [0, 1.45, 0] });
  b.joint("drawtube", { parent: "altitude", at: [0, 1.45 - 0.36 * 0.5, -0.36 * 0.866], dir: [0, 0.5, 0.866] });
  b.joint("focusL", { parent: "altitude", at: [0.07, 1.45 - 0.26 * 0.5, -0.26 * 0.866] });
  b.joint("focusR", { parent: "altitude", at: [-0.07, 1.45 - 0.26 * 0.5, -0.26 * 0.866] });

  // ---- tripod
  const head = b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.1, 12), MAHOG, { at: [0, 1.2, 0], bone: "base" });
  b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.025, 12), BRASS, { at: [0, 1.255, 0], bone: "base" });
  b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.03, 12), BRASS, { at: [0, 1.285, 0], bone: "pan" });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 8), DBRASS, { at: [0, 1.31, 0], bone: "pan" });
  void head;
  [0, 120, 240].forEach((deg) => {
    const a = (deg * Math.PI) / 180, s = Math.sin(a), c = Math.cos(a);
    const top = V(s * 0.07, 1.2, c * 0.07), foot = V(s * 0.55, 0, c * 0.55);
    b.rod(top, foot, [0.032, 0.02], { color: wood, bone: "base", sides: 6 });
    const up = top.clone().sub(foot).normalize();
    b.part(new THREE.BoxGeometry(0.06, 0.07, 0.06), BRASS, { at: top.clone().addScaledVector(up, -0.02), dir: up, bone: "base" });
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.03, 8), BRASS, { at: foot.clone().lerp(top, 0.3), dir: up, bone: "base" });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.015, 8), DBRASS, { at: foot.clone().lerp(top, 0.62), dir: up, bone: "base" });
    b.part(new THREE.CylinderGeometry(0.027, 0.022, 0.08, 8), DBRASS, { at: foot.clone().addScaledVector(up, 0.04), dir: up, bone: "base" });
  });
  // tray
  b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 3), "#4a1c10", { at: [0, 0.6, 0], bone: "base" });
  b.part(new THREE.CylinderGeometry(0.31, 0.31, 0.008, 3), BRASS, { at: [0, 0.588, 0], bone: "base" });
  // star chart
  b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.26, 12), "#e8dcb8", { at: [0, 0.645, -0.03], rotation: [0, 0, 90], bone: "base" });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.265, 8), "#cdbb8c", { at: [0, 0.645, -0.03], rotation: [0, 0, 90], bone: "base" });
  b.part(new THREE.TorusGeometry(0.034, 0.005, 5, 12), "#8c1c1c", { at: [0.06, 0.645, -0.03], rotation: [0, 90, 0], bone: "base" });
  b.part(new THREE.TorusGeometry(0.034, 0.005, 5, 12), "#8c1c1c", { at: [-0.06, 0.645, -0.03], rotation: [0, 90, 0], bone: "base" });

  // ---- fork
  [1, -1].forEach((k) => {
    b.part(new THREE.BoxGeometry(0.03, 0.2, 0.05), BRASS, { at: [k * 0.085, 1.37, 0], bone: "pan" });
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.05, 10), DBRASS, { at: [k * 0.11, 1.45, 0], rotation: [0, 0, 90], bone: "altitude" });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8), BRASS, { at: [k * 0.14, 1.45, 0], rotation: [0, 0, 90], bone: "altitude" });
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.04, 8), DBRASS, { at: [k * 0.065, 1.45, 0], rotation: [0, 0, 90], bone: "altitude" });
  });
  b.part(new THREE.BoxGeometry(0.2, 0.03, 0.05), BRASS, { at: [0, 1.29, 0], bone: "pan" });

  // ---- tube
  const ang = Math.PI / 6;
  const D = V(0, Math.sin(ang), Math.cos(ang));
  const N = V(0, Math.cos(ang), -Math.sin(ang));
  const piv = V(0, 1.45, 0);
  const along = (s: number, off = 0) => piv.clone().addScaledVector(D, s).addScaledVector(N, off);
  const cyl = (s0: number, s1: number, r0: number, r1: number, color: string, bone = "altitude", off = 0, seg = 12, open = false) =>
    b.part(new THREE.CylinderGeometry(r1, r0, s1 - s0, seg, 1, open), color, { at: along((s0 + s1) / 2, off), dir: D, bone });
  const ring = (s: number, R: number, t: number, color: string, bone = "altitude", off = 0) =>
    b.part(new THREE.TorusGeometry(R, t, 5, 14), color, { at: along(s, off), dir: D, axis: "z", bone });

  const secs: Array<[number, number, string, number]> = [
    [-0.3, -0.18, BRASS, 0.046], [-0.18, 0.02, LEATHER, 0.049], [0.02, 0.14, BRASS, 0.046],
    [0.14, 0.3, LEATHER, 0.049], [0.3, 0.42, BRASS, 0.046],
  ];
  secs.forEach(([s0, s1, c, r]) => cyl(s0, s1, r, r, c));
  // engraved rings
  [-0.3, -0.18, 0.02, 0.05, 0.08, 0.11, 0.14, 0.3, 0.33, 0.42].forEach((s, i) =>
    ring(s, 0.047, i % 3 === 0 ? 0.007 : 0.004, i % 3 === 0 ? DBRASS : "#a97a2e"));
  [-0.1, -0.02, 0.2, 0.25].forEach((s) => ring(s, 0.05, 0.003, DLEATHER));
  // objective bell, dew shade, lens
  cyl(0.42, 0.58, 0.046, 0.07, BRASS);
  cyl(0.58, 0.72, 0.071, 0.071, DBRASS, "altitude", 0, 14, true);
  ring(0.72, 0.071, 0.008, BRASS);
  ring(0.58, 0.073, 0.006, BRASS);
  cyl(0.655, 0.665, 0.066, 0.066, GLASS, "altitude", 0, 14);
  // rear: taper, draw tube, eyepiece
  cyl(-0.36, -0.3, 0.032, 0.046, BRASS);
  cyl(-0.52, -0.36, 0.03, 0.03, DBRASS, "drawtube");
  ring(-0.4, 0.031, 0.005, BRASS, "drawtube");
  ring(-0.48, 0.031, 0.005, BRASS, "drawtube");
  cyl(-0.6, -0.52, 0.022, 0.022, BRASS, "drawtube");
  ring(-0.55, 0.024, 0.005, DBRASS, "drawtube");
  cyl(-0.665, -0.6, 0.032, 0.026, RUBBER, "drawtube");
  ring(-0.664, 0.031, 0.005, "#2c2c2c", "drawtube");
  cyl(-0.667, -0.66, 0.018, 0.018, "#10202a", "drawtube");
  // focus knobs
  [1, -1].forEach((k) => {
    const j = k > 0 ? "focusL" : "focusR";
    const at = along(-0.26, 0);
    b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.05, 6), DBRASS, { at: at.clone().add(V(k * 0.055, 0, 0)), rotation: [0, 0, 90], bone: j });
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.026, 8), BRASS, { at: at.clone().add(V(k * 0.085, 0, 0)), rotation: [0, 0, 90], bone: j });
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.01, 8), DBRASS, { at: at.clone().add(V(k * 0.1, 0, 0)), rotation: [0, 0, 90], bone: j });
  });

  // ---- finder scope
  const off = 0.088;
  cyl(-0.06, 0.24, 0.016, 0.016, BRASS, "altitude", off, 10);
  cyl(-0.12, -0.06, 0.011, 0.011, DBRASS, "altitude", off, 8);
  cyl(-0.15, -0.12, 0.016, 0.012, RUBBER, "altitude", off, 8);
  cyl(0.24, 0.3, 0.016, 0.024, BRASS, "altitude", off, 10);
  cyl(0.3, 0.305, 0.021, 0.021, GLASS, "altitude", off, 10);
  [0.0, 0.17].forEach((s) => {
    ring(s, 0.02, 0.005, DBRASS, "altitude", off);
    b.rod(along(s, 0.043), along(s, 0.07), 0.008, { color: DBRASS, bone: "altitude", sides: 6 });
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.016, 8), BRASS, { at: along(s, 0.04), dir: D, bone: "altitude" });
  });
  [0, 0.17].forEach((s) =>
    b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.045, 6), DBRASS, { at: along(s, off + 0.026).add(V(0.02, 0, 0)), rotation: [0, 0, 90], bone: "altitude" }));

  return b.root;
}
```