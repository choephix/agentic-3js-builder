```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Brass explorer's telescope",
  description:
    "A polished brass explorer's telescope with leather-wrapped sections, engraved rings and graduations, a finder scope, rubber eyecup and focusing knobs, on a mahogany tripod with brass fittings and a tray holding a rolled star chart.",
};

type V = THREE.Vector3;
const v3 = (x: number, y: number, z: number): V => new THREE.Vector3(x, y, z);
const X: V = v3(1, 0, 0);
const Y: V = v3(0, 1, 0);

const COL = {
  brass: "#d4a84f",
  brassHi: "#eccb7e",
  brassDk: "#8a6428",
  mahogany: "#7d3d22",
  mahoganyDk: "#4d2414",
  leather: "#5c3622",
  rubber: "#1d1a18",
  glass: "#2f6680",
  paper: "#efe4c2",
  ribbon: "#9e2f26",
};

// Placement matrix: local +Y runs along `axis`, origin moves to `o`.
function frameY(axis: V, o: V): THREE.Matrix4 {
  const ny = axis.clone().normalize();
  const ref = Math.abs(ny.y) > 0.9 ? X : Y;
  const nx = new THREE.Vector3().crossVectors(ref, ny).normalize();
  const nz = new THREE.Vector3().crossVectors(nx, ny).normalize();
  return new THREE.Matrix4().makeBasis(nx, ny, nz).setPosition(o);
}

export default function build() {
  const b = createBuilder({ name: "explorer-telescope" });
  b.joint("base", { at: [0, 0, 0] });

  // Tapered cylinder from p (radius rp) to q (radius rq).
  const cyl = (p: V, q: V, rp: number, rq: number, color: string, n = 12) => {
    const d = q.clone().sub(p);
    const g = new THREE.CylinderGeometry(rq, rp, d.length(), n, 1, false);
    g.applyMatrix4(frameY(d, p.clone().add(q).multiplyScalar(0.5)));
    b.part(g, color);
  };

  // Flat disc of radius r and thickness t, facing `axis`, centred on c.
  const disc = (c: V, axis: V, r: number, t: number, color: string, n = 16) => {
    const g = new THREE.CylinderGeometry(r, r, t, n, 1, false);
    g.applyMatrix4(frameY(axis, c));
    b.part(g, color);
  };

  // Turned solid: [radius, height] pairs, measured along `axis` from o.
  const lathe = (o: V, axis: V, prof: [number, number][], color: string, n = 20) => {
    const g = new THREE.LatheGeometry(prof.map(([r, h]) => new THREE.Vector2(r, h)), n);
    g.applyMatrix4(frameY(axis, o));
    b.part(g, color);
  };

  // Box with x/y axes given (unit, perpendicular), centred on c.
  const block = (size: [number, number, number], c: V, x: V, y: V, color: string) => {
    const g = new THREE.BoxGeometry(size[0], size[1], size[2]);
    const z = new THREE.Vector3().crossVectors(x, y);
    g.applyMatrix4(new THREE.Matrix4().makeBasis(x, y, z).setPosition(c));
    b.part(g, color);
  };

  // ---- tripod: three octagonal mahogany legs under a brass hub ----
  const TOP_Y = 0.955, TOP_R = 0.06, FOOT_Y = 0.035, FOOT_R = 0.42;
  const legR = (y: number) => TOP_R + (FOOT_R - TOP_R) * ((TOP_Y - y) / (TOP_Y - FOOT_Y));
  const legAt = (phi: number, y: number): V =>
    v3(legR(y) * Math.sin(phi), y, legR(y) * Math.cos(phi));
  const LEGS = [Math.PI, Math.PI / 3, -Math.PI / 3]; // back, front-left (+X), front-right (-X)

  for (const phi of LEGS) {
    cyl(legAt(phi, TOP_Y), legAt(phi, FOOT_Y), 0.024, 0.013, COL.mahogany, 8);
    cyl(legAt(phi, 0.94), legAt(phi, 0.97), 0.031, 0.031, COL.brass, 10); // hinge knuckle
    cyl(legAt(phi, 0.52), legAt(phi, 0.5), 0.0195, 0.0195, COL.brass, 10); // mid band
    cyl(legAt(phi, 0.09), legAt(phi, FOOT_Y), 0.0175, 0.0175, COL.brassDk, 10); // ferrule
    cyl(
      v3(FOOT_R * Math.sin(phi), 0, FOOT_R * Math.cos(phi)),
      legAt(phi, FOOT_Y),
      0.0165,
      0.0165,
      COL.rubber,
      10,
    ); // rubber foot
  }

  // brass head plate
  lathe(
    v3(0, TOP_Y, 0),
    Y,
    [[0, 0], [0.125, 0], [0.125, 0.012], [0.1, 0.028], [0.07, 0.046], [0.05, 0.06], [0, 0.06]],
    COL.brass,
    24,
  );
  for (const phi of LEGS) {
    const x = 0.06 * Math.sin(phi), z = 0.06 * Math.cos(phi);
    cyl(v3(x, 1.0, z), v3(x, 1.016, z), 0.008, 0.008, COL.brassHi, 8); // hinge bolts
  }
  cyl(v3(0, 0.99, 0), v3(0, 1.1, 0), 0.02, 0.02, COL.brassDk, 10); // central column

  // ---- telescope frame ----
  // Barrel centre T, axis D (30 degrees up, toward +Z), U = its top side, S = its left side.
  const T = v3(0, 1.14, 0);
  const H = Math.sqrt(0.75);
  const D = v3(0, 0.5, H);
  const U = v3(0, H, -0.5);
  const S = X;
  // P(s, r, a): s along the barrel, r out from the axis, a round it (0 = left, PI/2 = top).
  const P = (s: number, r = 0, a = 0): V =>
    T.clone()
      .addScaledVector(D, s)
      .addScaledVector(S, r * Math.cos(a))
      .addScaledVector(U, r * Math.sin(a));
  const tangent = (a: number): V =>
    S.clone().multiplyScalar(-Math.sin(a)).addScaledVector(U, Math.cos(a));
  // small brass stud on the barrel surface at (s, a)
  const stud = (s: number, a: number, r: number, size: number, color: string) =>
    block([size, size, size * 0.8], P(s, r, a), tangent(a), D, color);

  // trunnion: cheek plates, pin, thumbscrew
  for (const side of [1, -1]) {
    block([0.012, 0.14, 0.06], v3(side * 0.088, 1.07, 0), X, Y, COL.brass);
    disc(v3(side * 0.095, 1.1, 0.02), X, 0.006, 0.004, COL.brassHi, 8);
    disc(v3(side * 0.095, 1.1, -0.02), X, 0.006, 0.004, COL.brassHi, 8);
  }
  cyl(v3(-0.088, T.y, 0), v3(0.088, T.y, 0), 0.009, 0.009, COL.brassDk, 10);
  disc(v3(-0.102, T.y, 0), X, 0.017, 0.014, COL.brassHi, 14);

  // mount collar at the barrel's centre
  cyl(P(-0.025), P(0.025), 0.05, 0.05, COL.brassHi, 18);
  cyl(P(-0.025), P(-0.022), 0.0525, 0.0525, COL.brassDk, 18);
  cyl(P(0.022), P(0.025), 0.0525, 0.0525, COL.brassDk, 18);

  // ---- barrel, rear to front ----
  // rubber eyecup
  lathe(
    P(-0.318),
    D,
    [[0, 0], [0.024, 0], [0.026, 0.008], [0.027, 0.022], [0.034, 0.032], [0.036, 0.036]],
    COL.rubber,
    20,
  );
  // eyepiece barrel with engraved ring, then the polished draw tube
  cyl(P(-0.282), P(-0.25), 0.029, 0.029, COL.brass, 16);
  cyl(P(-0.25), P(-0.246), 0.0315, 0.0315, COL.brassDk, 16);
  cyl(P(-0.246), P(-0.165), 0.031, 0.031, COL.brassHi, 16);

  // focusing knobs on both sides of the draw tube
  for (const a of [0, Math.PI]) {
    cyl(P(-0.21, 0.02, a), P(-0.21, 0.038, a), 0.006, 0.006, COL.brassDk, 8);
    disc(P(-0.21, 0.042, a), X, 0.02, 0.012, COL.brassDk, 18);
    disc(P(-0.21, 0.049, a), X, 0.013, 0.004, COL.brassHi, 18);
  }

  // rear body, leather wrap A with brass stitching
  cyl(P(-0.165), P(-0.1), 0.04, 0.04, COL.brass, 16);
  cyl(P(-0.1), P(-0.04), 0.0415, 0.0415, COL.leather, 16);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    stud(-0.0955, a, 0.0415, 0.0028, COL.brassHi);
    stud(-0.0445, a, 0.0415, 0.0028, COL.brassHi);
  }
  cyl(P(-0.04), P(-0.037), 0.0412, 0.0412, COL.brassDk, 16);
  cyl(P(-0.037), P(-0.025), 0.04, 0.04, COL.brass, 16);

  // front body, leather wrap B
  cyl(P(0.025), P(0.08), 0.04, 0.04, COL.brass, 16);
  cyl(P(0.08), P(0.083), 0.0412, 0.0412, COL.brassDk, 16);
  cyl(P(0.083), P(0.14), 0.0415, 0.0415, COL.leather, 16);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    stud(0.0865, a, 0.0415, 0.0028, COL.brassHi);
    stud(0.1365, a, 0.0415, 0.0028, COL.brassHi);
  }

  // brass body with engraved graduation ticks
  cyl(P(0.14), P(0.215), 0.04, 0.04, COL.brass, 16);
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    block(
      [0.0013, i % 3 === 0 ? 0.009 : 0.0045, 0.003],
      P(0.19, 0.04, a),
      tangent(a),
      D,
      COL.brassDk,
    );
  }

  // objective cell, engraved rim, flared dew cap and glass
  cyl(P(0.215), P(0.27), 0.044, 0.044, COL.brassHi, 18);
  cyl(P(0.215), P(0.217), 0.0455, 0.0455, COL.brassDk, 18);
  lathe(
    P(0.27),
    D,
    [[0.044, 0], [0.047, 0.012], [0.053, 0.036], [0.058, 0.05], [0.06, 0.054]],
    COL.brass,
    20,
  );
  disc(P(0.29), D, 0.043, 0.006, COL.glass, 24);

  // ---- finder scope on the barrel's top side ----
  const Q = (s: number) => P(s, 0.075, Math.PI / 2);
  for (const s of [-0.13, 0.05]) {
    cyl(P(s - 0.006), P(s + 0.006), 0.046, 0.046, COL.brassDk, 16); // clamp band
    cyl(P(s, 0.036, Math.PI / 2), P(s, 0.07, Math.PI / 2), 0.0055, 0.0055, COL.brassDk, 8);
  }
  cyl(Q(-0.17), Q(0.1), 0.015, 0.015, COL.brassHi, 12); // finder tube
  cyl(Q(-0.2), Q(-0.172), 0.0155, 0.0125, COL.rubber, 12); // finder eyecup
  cyl(Q(-0.172), Q(-0.166), 0.018, 0.018, COL.brassDk, 12);
  cyl(Q(0.1), Q(0.12), 0.0185, 0.0185, COL.brass, 12); // finder objective collar
  disc(Q(0.119), D, 0.0135, 0.002, COL.glass, 12);

  // ---- tripod: spreader, star-chart tray between the front legs ----
  const trayZ = legAt(Math.PI / 3, 0.3).z;
  cyl(legAt(Math.PI / 3, 0.3), legAt(-Math.PI / 3, 0.3), 0.01, 0.01, COL.brassDk, 10);
  block([0.36, 0.016, 0.17], v3(0, 0.318, trayZ), X, Y, COL.mahoganyDk);
  block([0.364, 0.022, 0.006], v3(0, 0.332, trayZ - 0.085), X, Y, COL.brassHi);
  block([0.364, 0.022, 0.006], v3(0, 0.332, trayZ + 0.085), X, Y, COL.brassHi);
  block([0.006, 0.022, 0.176], v3(-0.18, 0.332, trayZ), X, Y, COL.brassHi);
  block([0.006, 0.022, 0.176], v3(0.18, 0.332, trayZ), X, Y, COL.brassHi);
  // rolled star chart with a red ribbon
  cyl(v3(-0.1, 0.353, trayZ), v3(0.1, 0.353, trayZ), 0.027, 0.027, COL.paper, 14);
  cyl(v3(0.03, 0.353, trayZ), v3(0.042, 0.353, trayZ), 0.0285, 0.0285, COL.ribbon, 14);

  return b.root;
}
```