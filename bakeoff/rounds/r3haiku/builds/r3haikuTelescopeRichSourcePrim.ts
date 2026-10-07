import * as THREE from "three";
import { createBuilder, grain, mottle, rng, svg } from "../../../../src/index";

export const meta = {
  name: "Brass explorer's telescope",
  description:
    "A polished brass telescope with leather-wrapped sections, engraved rings, a finder scope, a rubber eyecup and focusing knobs, on a mahogany tripod with brass fittings and a star-chart tray.",
};

const BRASS = "#c9a24a";
const BRASS_DARK = "#8e6d2a";
const RUBBER = "#1c1c1e";
const GLASS = "#173247";
const PAPER = "#eadfc0";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function telescope() {
  const b = createBuilder({ name: "brass-telescope", detail: 1, paintSize: 1024 });

  const WOOD = grain("#7d3a1d", "#4a1e0c", { size: 0.025, axis: "y", seed: 3 });
  const LEATHER = mottle("#8e5a32", "#4f2c16", { size: 0.035, seed: 5 });

  // A star chart drawn as an SVG texture.
  const r = rng(7);
  let stars = "";
  for (let i = 0; i < 46; i++) {
    const x = (r() * 200).toFixed(1);
    const y = (r() * 140).toFixed(1);
    const rad = (0.5 + r() * 1.5).toFixed(2);
    stars += `<circle cx="${x}" cy="${y}" r="${rad}" fill="#f6e7b4"/>`;
  }
  const chartMarkup =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 140">` +
    `<rect width="200" height="140" fill="#1d2a4a"/>` +
    `<circle cx="100" cy="70" r="62" fill="none" stroke="#c9a24a" stroke-width="2"/>` +
    `<polyline points="30,30 60,44 88,28 120,60 150,48" fill="none" stroke="#c9a24a" stroke-width="1.2"/>` +
    `<polyline points="54,104 80,92 104,112" fill="none" stroke="#c9a24a" stroke-width="1.2"/>` +
    stars +
    `</svg>`;
  const chart = svg(chartMarkup, { size: 256 });

  // Joints: a root at the floor, the tripod head, and the telescope's mount.
  b.joint("base", { at: [0, 0, 0] });
  b.joint("head", { at: [0, 0.78, 0], parent: "base" });

  const P = V(0, 0.92, 0);
  const d = V(0, 0.35, 1).normalize();
  const n = V(0, 1, 0).addScaledVector(d, -d.y).normalize();
  b.joint("scope", { at: P, parent: "head" });

  const X = V(1, 0, 0);
  const Y = V(0, 1, 0);

  // Helpers -------------------------------------------------------------------------------------------
  const tube = (a: THREE.Vector3, c: THREE.Vector3, rA: number, rB: number, color: any, bone: string, seg = 16) => {
    const len = a.distanceTo(c);
    const mid = a.clone().add(c).multiplyScalar(0.5);
    // CylinderGeometry's +Y end is `radiusTop`, which faces the far end `c`.
    return b.part(new THREE.CylinderGeometry(rB, rA, len, seg), color, { at: mid, aim: c, bone });
  };
  const disc = (center: THREE.Vector3, dir: THREE.Vector3, rad: number, h: number, color: any, bone: string, seg = 20) =>
    b.part(new THREE.CylinderGeometry(rad, rad, h, seg), color, { at: center, dir, bone });
  const hoop = (center: THREE.Vector3, dir: THREE.Vector3, R: number, t: number, color: any, bone: string) =>
    b.part(new THREE.TorusGeometry(R, t, 8, 28), color, { at: center, dir, axis: "z", bone });
  const ball = (center: THREE.Vector3, rad: number, color: any, bone: string) =>
    b.part(new THREE.SphereGeometry(rad, 14, 10), color, { at: center, bone });

  // The telescope tube ------------------------------------------------------------------------------
  const A = P.clone().addScaledVector(d, -0.12);
  const B = P.clone().addScaledVector(d, 0.62);
  const tubePt = (s: number) => A.clone().lerp(B, s);
  const Ae = (s: number) => A.clone().addScaledVector(d, s);
  const Fr = (t: number) => P.clone().addScaledVector(n, 0.08).addScaledVector(d, t);

  // Main brass barrel and the wider rear focuser and front objective collar.
  tube(A, B, 0.044, 0.044, BRASS, "scope", 24);
  tube(tubePt(0), tubePt(0.14), 0.054, 0.054, BRASS, "scope", 24);
  tube(tubePt(0.94), tubePt(1), 0.05, 0.05, BRASS, "scope", 24);

  // Leather wraps.
  for (const [s0, s1] of [
    [0.2, 0.3],
    [0.44, 0.54],
    [0.7, 0.8],
  ])
    tube(tubePt(s0), tubePt(s1), 0.0475, 0.0475, LEATHER, "scope", 24);

  // Engraved brass rings between the sections.
  for (const s of [0.36, 0.62, 0.9]) hoop(tubePt(s), d, 0.0455, 0.0016, BRASS_DARK, "scope");

  // Objective glass.
  disc(tubePt(1.0).addScaledVector(d, 0.002), d, 0.042, 0.004, GLASS, "scope");

  // Focusing knobs on either side of the focuser.
  for (const sx of [1, -1]) {
    const kc = tubePt(0.07);
    const knobAt = kc.clone().addScaledVector(X, sx * 0.085);
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.016, 20), BRASS_DARK, {
      at: knobAt,
      dir: V(sx, 0, 0),
      bone: "scope",
    });
    tube(kc.clone().addScaledVector(X, sx * 0.03), kc.clone().addScaledVector(X, sx * 0.075), 0.007, 0.007, BRASS, "scope", 10);
  }

  // Eyepiece at the rear, with a rubber eyecup.
  tube(Ae(0.02), Ae(-0.1), 0.02, 0.02, BRASS, "scope", 16);
  tube(Ae(-0.1), Ae(-0.13), 0.026, 0.026, RUBBER, "scope", 20);
  disc(Ae(-0.13), d, 0.02, 0.004, "#0b0b0c", "scope");

  // Finder scope on the upper side, with two clamp rings and brackets.
  tube(Fr(-0.17), Fr(0.19), 0.02, 0.02, BRASS, "scope", 16);
  hoop(Fr(0.19), d, 0.021, 0.003, BRASS_DARK, "scope");
  disc(Fr(0.195), d, 0.017, 0.003, GLASS, "scope");
  disc(Fr(-0.2), d, 0.017, 0.006, RUBBER, "scope");
  for (const t of [-0.09, 0.09]) {
    tube(P.clone().addScaledVector(d, t), Fr(t), 0.008, 0.008, BRASS, "scope", 10);
    hoop(Fr(t), d, 0.022, 0.004, BRASS_DARK, "scope");
  }

  // Yoke: trunnion pin and standards on the head.
  tube(P.clone().add(V(-0.15, 0, 0)), P.clone().add(V(0.15, 0, 0)), 0.012, 0.012, BRASS, "scope", 12);
  for (const sx of [1, -1])
    tube(V(sx * 0.12, 0.84, 0), V(sx * 0.12, 0.92, 0), 0.018, 0.018, BRASS, "head", 14);

  // Tripod head ---------------------------------------------------------------------------------------
  disc(V(0, 0.82, 0), Y, 0.045, 0.08, WOOD, "head");
  disc(V(0, 0.865, 0), Y, 0.05, 0.012, BRASS, "head");
  disc(V(0, 0.78, 0), Y, 0.034, 0.03, BRASS, "head");

  // Three legs with brass shoes and rubber feet.
  const H = V(0, 0.78, 0);
  const R = 0.44;
  for (let i = 0; i < 3; i++) {
    const theta = (i * 2 * Math.PI) / 3;
    const foot = V(R * Math.sin(theta), 0.018, R * Math.cos(theta));
    tube(H, foot, 0.024, 0.015, WOOD, "base", 14);
    tube(foot.clone().lerp(H, 0.02), foot.clone().lerp(H, 0.12), 0.02, 0.02, BRASS, "base", 12);
    ball(foot, 0.018, RUBBER, "base");
  }

  // Central column and the star-chart tray.
  tube(V(0, 0.3, 0), V(0, 0.78, 0), 0.018, 0.018, WOOD, "head", 12);
  disc(V(0, 0.3, 0), Y, 0.13, 0.014, WOOD, "head", 28);
  hoop(V(0, 0.307, 0), Y, 0.13, 0.004, BRASS, "head");

  // A rolled star chart tied with a leather strap, with brass end caps.
  tube(V(-0.07, 0.323, 0.03), V(0.07, 0.323, 0.03), 0.016, 0.016, PAPER, "head", 14);
  tube(V(-0.01, 0.323, 0.03), V(0.01, 0.323, 0.03), 0.0165, 0.0165, LEATHER, "head", 14);
  for (const sx of [1, -1]) disc(V(sx * 0.072, 0.323, 0.03), X, 0.017, 0.004, BRASS, "head");

  // A flat sheet of the chart beside the roll.
  b.part(new THREE.PlaneGeometry(0.11, 0.08), "#ffffff", {
    at: V(-0.045, 0.3085, -0.045),
    dir: Y,
    axis: "z",
    texture: chart,
    bone: "head",
  });

  return b.root;
}
