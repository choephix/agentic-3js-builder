import * as THREE from "three";
import { createBuilder, grain } from "../../../../src/index";

export const meta = {
  name: "Explorer's Brass Telescope",
  description:
    "Polished brass telescope with leather wraps, engraved rings, finder scope, rubber-cup eyepiece and focus knobs, on a mahogany tripod with brass fittings and a tray holding a rolled star chart.",
};

export default function build() {
  const b = createBuilder({ name: "telescope" });
  const BRASS = "#d1a13a";
  const DARK = "#8a6221";
  const LEATHER = "#5a3219";
  const RUBBER = "#1a1a1c";
  const RED = "#8e1f1f";
  const wood = grain("#6e2f1b", "#4a1d10", { size: 0.01, axis: "y" });

  b.joint("base", { at: [0, 0, 0] });
  b.joint("panHead", { at: [0, 1.22, 0], parent: "base", dir: [0, 1, 0] });
  const ang = (25 * Math.PI) / 180;
  const d = new THREE.Vector3(0, Math.sin(ang), Math.cos(ang));
  const u = new THREE.Vector3(0, Math.cos(ang), -Math.sin(ang));
  const P = new THREE.Vector3(0, 1.34, 0);
  b.joint("altitude", { at: P, parent: "panHead", dir: d });
  const A = (s: number, up = 0, x = 0) =>
    P.clone().addScaledVector(d, s).addScaledVector(u, up).add(new THREE.Vector3(x, 0, 0));
  const T = { bone: "altitude" } as const;

  // ---- Tripod ----
  const top = (a: number) => new THREE.Vector3(Math.sin(a) * 0.05, 1.2, Math.cos(a) * 0.05);
  const foot = (a: number) => new THREE.Vector3(Math.sin(a) * 0.62, 0, Math.cos(a) * 0.62);
  for (const deg of [0, 120, 240]) {
    const a = (deg * Math.PI) / 180;
    const t = top(a);
    const f = foot(a);
    const at = (k: number) => t.clone().lerp(f, k);
    b.rod(t, f, [0.03, 0.02], { color: wood, bone: "base" });
    b.rod(at(-0.02), at(0.1), 0.036, { color: BRASS, bone: "base" });
    b.rod(at(0.88), at(1), 0.026, { color: BRASS, bone: "base" });
    b.rod(at(0.85), at(0.88), 0.028, { color: DARK, bone: "base" });
    b.rod(at(0.12), at(0.135), 0.034, { color: DARK, bone: "base" });
    // tray brace
    const p = at(0.5);
    b.rod(new THREE.Vector3(Math.sin(a) * 0.19, 0.64, Math.cos(a) * 0.19), p.clone().setY(0.64), 0.009, {
      color: BRASS,
      bone: "base",
    });
    b.rod(at(0.495), at(0.515), 0.032, { color: BRASS, bone: "base" });
  }
  // head plate & column
  b.lathe([[0, 0], [0.11, 0], [0.12, 0.02], [0.1, 0.04], [0.05, 0.05], [0, 0.05]], {
    color: BRASS, at: [0, 1.19, 0], segments: 12, bone: "panHead",
  });
  b.lathe([[0, 0], [0.07, 0], [0.07, 0.015], [0, 0.015]], {
    color: DARK, at: [0, 1.24, 0], segments: 10, bone: "panHead",
  });
  // yoke arms
  for (const sx of [-1, 1]) {
    b.rod([sx * 0.075, 1.24, 0], [sx * 0.075, 1.35, 0], 0.014, { color: BRASS, bone: "panHead" });
    b.rod([sx * 0.07, 1.34, 0], [sx * 0.11, 1.34, 0], 0.02, { color: DARK, bone: "panHead" });
    b.rod([sx * 0.11, 1.34, 0], [sx * 0.135, 1.34, 0], 0.03, { color: BRASS, bone: "panHead" });
  }
  // tray
  b.lathe([[0, 0], [0.2, 0], [0.2, 0.012], [0.18, 0.02], [0, 0.02]], {
    color: wood, at: [0, 0.62, 0], segments: 6, bone: "base",
  });
  b.lathe([[0.19, 0.012], [0.21, 0.012], [0.21, 0.026], [0.19, 0.026]], {
    color: BRASS, at: [0, 0.62, 0], segments: 6, bone: "base",
  });
  // star chart
  b.capsule([-0.14, 0.675, 0.02], [0.14, 0.675, 0.02], 0.032, { color: "#e8dcb4", bone: "base" });
  b.rod([-0.141, 0.675, 0.02], [-0.133, 0.675, 0.02], 0.026, { color: "#b9a574", bone: "base" });
  for (const x of [-0.07, 0.07]) b.rod([x - 0.007, 0.675, 0.02], [x + 0.007, 0.675, 0.02], 0.0345, { color: RED, bone: "base" });
  b.rod([0.0, 0.7, 0.02], [0.0, 0.708, 0.02], 0.004, { color: RED, bone: "base" });

  // ---- Telescope ----
  b.rod(A(-0.32), A(0.46), 0.042, { color: BRASS, ...T, sides: 12 });
  b.rod(A(0.44), A(0.66), [0.048, 0.062], { color: DARK, ...T, sides: 12 });
  b.rod(A(0.655), A(0.7), 0.066, { color: BRASS, ...T, sides: 12 });
  b.rod(A(0.62), A(0.665), 0.055, { color: "#9fcbd8", ...T, sides: 12 });
  // leather wraps
  for (const [s0, s1] of [[-0.12, 0.08], [0.2, 0.38]]) {
    b.rod(A(s0), A(s1), 0.0465, { color: LEATHER, ...T, sides: 12 });
    for (let s = s0 + 0.02; s < s1; s += 0.04) b.rod(A(s), A(s + 0.006), 0.0475, { color: "#3a1f0e", ...T, sides: 12 });
  }
  // engraved rings
  for (const s of [-0.3, -0.16, 0.1, 0.12, 0.18, 0.4, 0.42, 0.52, 0.58])
    b.rod(A(s), A(s + 0.01), s > 0.44 ? 0.063 : 0.0485, { color: DARK, ...T, sides: 12 });
  // rear draw tube and eyepiece
  b.rod(A(-0.5), A(-0.3), 0.032, { color: BRASS, ...T, sides: 10 });
  b.rod(A(-0.34), A(-0.32), 0.044, { color: DARK, ...T, sides: 10 });
  b.rod(A(-0.5), A(-0.56), 0.036, { color: DARK, ...T, sides: 10 });
  b.rod(A(-0.56), A(-0.62), [0.026, 0.024], { color: "#222", ...T, sides: 10 });
  b.rod(A(-0.62), A(-0.67), [0.036, 0.04], { color: RUBBER, ...T, sides: 10 });
  b.rod(A(-0.668), A(-0.67), 0.02, { color: "#2b3c48", ...T, sides: 10 });
  // focus knobs
  for (const sx of [-1, 1]) {
    b.rod(A(-0.26, 0, sx * 0.04), A(-0.26, 0, sx * 0.07), 0.007, { color: DARK, bone: "altitude" });
    b.rod(A(-0.26, 0, sx * 0.07), A(-0.26, 0, sx * 0.095), 0.022, { color: BRASS, bone: "altitude", sides: 8 });
    b.rod(A(-0.26, 0, sx * 0.095), A(-0.26, 0, sx * 0.1), 0.014, { color: DARK, bone: "altitude", sides: 8 });
  }
  // trunnion band
  b.rod(A(-0.03), A(0.03), 0.052, { color: DARK, ...T, sides: 12 });
  b.rod(P.clone().add(new THREE.Vector3(-0.075, 0, 0)), P.clone().add(new THREE.Vector3(0.075, 0, 0)), 0.012, { color: BRASS, ...T });

  // finder scope
  const fu = 0.09;
  b.rod(A(-0.04, fu), A(0.3, fu), 0.0175, { color: BRASS, ...T, sides: 10 });
  b.rod(A(0.3, fu), A(0.36, fu), [0.0175, 0.024], { color: DARK, ...T, sides: 10 });
  b.rod(A(0.358, fu), A(0.362, fu), 0.02, { color: "#9fcbd8", ...T, sides: 10 });
  b.rod(A(-0.04, fu), A(-0.1, fu), 0.012, { color: "#222", ...T, sides: 8 });
  b.rod(A(-0.1, fu), A(-0.125, fu), 0.017, { color: RUBBER, ...T, sides: 8 });
  for (const s of [0.02, 0.22]) {
    b.rod(A(s, 0.03), A(s, fu), 0.007, { color: BRASS, ...T, sides: 6 });
    b.rod(A(s - 0.008, fu), A(s + 0.008, fu), 0.024, { color: DARK, ...T, sides: 10 });
    b.rod(A(s, fu - 0.01, -0.03), A(s, fu - 0.01, 0.03), 0.004, { color: DARK, ...T, sides: 6 });
  }
  // finder adjustment screws
  b.rod(A(0.22, fu + 0.02), A(0.22, fu + 0.04), 0.006, { color: BRASS, ...T, sides: 6 });

  return b.root;
}
