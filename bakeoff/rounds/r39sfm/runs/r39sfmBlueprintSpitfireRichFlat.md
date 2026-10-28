```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Spitfire Blueprint",
  description:
    "Supermarine Spitfire fighter in a cyanotype blueprint look: Prussian-blue plates, white drafting lines, roundels, panel seams and a tail-down ground stance.",
};

// Cyanotype palette
const HULL = "#1b56b3";
const HULL_LT = "#2f78d6";
const PALE = "#74b2f0";
const DARK = "#0c2f73";
const NAVY = "#071f52";
const LINE = "#e9f4ff";
const GLASS = "#9fd8ff";
const STACK = "#bcd9f7";

type W = { half: number; c0: number; a: number; k: number; y0: number; dih: number; th: number };
type Station = { z: number; y: number; w: number; h: number };

export default function build() {
  const b = createBuilder({ name: "spitfire" });
  const SIDES = [1, -1];

  // ---------- fuselage ----------
  const ST: Station[] = [
    { z: 2.7, y: 1.82, w: 0.75, h: 0.85 },
    { z: 1.8, y: 1.78, w: 0.85, h: 1.0 },
    { z: 0.6, y: 1.68, w: 0.85, h: 1.15 },
    { z: -0.8, y: 1.58, w: 0.75, h: 1.1 },
    { z: -2.5, y: 1.4, w: 0.5, h: 0.8 },
    { z: -4.2, y: 1.22, w: 0.3, h: 0.5 },
    { z: -5.5, y: 1.1, w: 0.14, h: 0.28 },
  ];
  const fusAt = (z: number) => {
    for (let i = 0; i < ST.length - 1; i++) {
      const a = ST[i];
      const c = ST[i + 1];
      if (z <= a.z && z >= c.z) {
        const t = (a.z - z) / (a.z - c.z);
        return { y: a.y + (c.y - a.y) * t, w: a.w + (c.w - a.w) * t, h: a.h + (c.h - a.h) * t };
      }
    }
    return z > ST[0].z ? ST[0] : ST[ST.length - 1];
  };

  b.loft(
    ST.map((s) => ({ at: [0, s.y, s.z] as [number, number, number], w: s.w, h: s.h })),
    { color: HULL, sectors: [[125, 235, DARK]] },
  );

  // seam rings
  for (let z = 2.0; z > -5.3; z -= 0.55) {
    const f = fusAt(z);
    b.part(new THREE.TorusGeometry(0.5, 0.008, 4, 22), LINE, {
      at: [0, f.y, z],
      scale: [f.w * 1.03, f.h * 1.03, 1],
    });
  }
  // dorsal and side lines
  const dorsal: number[][] = [];
  const sideL: number[][] = [];
  const sideR: number[][] = [];
  for (let z = 1.6; z >= -5.2; z -= 0.4) {
    const f = fusAt(z);
    dorsal.push([0, f.y + f.h * 0.52, z]);
    sideL.push([f.w * 0.52, f.y + 0.02, z]);
    sideR.push([-f.w * 0.52, f.y + 0.02, z]);
  }
  b.sweep(dorsal, 0.009, { color: LINE, caps: "flat" });
  b.sweep(sideL, 0.008, { color: LINE, caps: "flat" });
  b.sweep(sideR, 0.008, { color: LINE, caps: "flat" });

  // ---------- nose ----------
  const NOSE_Y = 1.82;
  b.lathe(
    [[0, 0], [0.44, 0], [0.46, 0.4], [0.42, 0.95], [0.33, 1.3], [0, 1.3]],
    { at: [0, NOSE_Y - 0.02, 1.8], axis: [0, 0, 1], segments: 16, color: HULL_LT, smoothing: 1 },
  );
  for (const z of [2.25, 3.0]) {
    b.part(new THREE.TorusGeometry(z < 2.5 ? 0.46 : 0.35, 0.01, 4, 20), LINE, { at: [0, NOSE_Y - 0.02, z] });
  }
  b.lathe([[0, 0], [0.3, 0], [0.26, 0.18], [0.14, 0.45], [0, 0.62]], {
    at: [0, NOSE_Y, 3.1],
    axis: [0, 0, 1],
    segments: 14,
    color: NAVY,
  });
  b.part(new THREE.TorusGeometry(0.255, 0.012, 4, 14), LINE, { at: [0, NOSE_Y, 3.28] });
  // intake on nose top
  b.part(new THREE.BoxGeometry(0.22, 0.12, 0.45), DARK, { at: [0, NOSE_Y + 0.42, 2.2] });
  b.part(new THREE.BoxGeometry(0.18, 0.08, 0.02), NAVY, { at: [0, NOSE_Y + 0.42, 2.43] });
  // exhaust stacks
  for (const s of SIDES)
    for (let i = 0; i < 6; i++) {
      b.part(new THREE.CylinderGeometry(0.03, 0.04, 0.2, 6), STACK, {
        at: [s * 0.45, NOSE_Y + 0.07, 1.9 + i * 0.2],
        dir: [s * 0.6, 0.15, -0.8],
      });
    }

  // propeller
  for (let i = 0; i < 3; i++) {
    const a = (i * 120 + 25) * (Math.PI / 180);
    const d: [number, number, number] = [Math.sin(a), Math.cos(a), 0];
    const at: [number, number, number] = [0, NOSE_Y, 3.28];
    b.extrude(
      [[0.15, -0.06], [0.7, -0.14], [1.3, -0.12], [1.68, -0.06], [1.7, 0.04], [1.3, 0.1], [0.7, 0.12], [0.15, 0.06]],
      { at, x: d, y: [0, 0, 1], thickness: 0.03, color: NAVY },
    );
    b.extrude([[1.42, -0.1], [1.69, -0.07], [1.69, 0.04], [1.42, 0.09]], {
      at, x: d, y: [0, 0, 1], thickness: 0.034, color: LINE,
    });
  }

  // ---------- canopy ----------
  const CC = [0, 1.98, -0.15];
  b.part(new THREE.SphereGeometry(1, 12, 8), GLASS, { at: CC as [number, number, number], scale: [0.33, 0.34, 1.05] });
  for (const dz of [-0.65, -0.25, 0.2, 0.6]) {
    const f = Math.sqrt(1 - (dz / 1.05) ** 2);
    b.part(new THREE.TorusGeometry(0.34, 0.012, 4, 16, Math.PI), LINE, {
      at: [0, CC[1], CC[2] + dz],
      scale: [f * 1.03, f * 1.03, 1],
    });
  }
  b.rod([0, CC[1] + 0.35, CC[2] - 0.8], [0, CC[1] + 0.35, CC[2] + 0.8], 0.01, LINE);
  // rear fairing
  b.part(new THREE.SphereGeometry(1, 10, 6), HULL_LT, { at: [0, 1.82, -1.45], scale: [0.26, 0.2, 0.75] });
  // mast and aerial
  b.rod([0, 2.0, 0.95], [0, 2.55, 0.9], 0.015, LINE);
  b.rod([0, 2.55, 0.9], [0, 2.6, -4.95], 0.004, LINE);

  // ---------- wings ----------
  const cw = (w: W, u: number) => w.c0 * Math.sqrt(Math.max(0, 1 - (u / (w.half * 1.02)) ** 2));
  const zf = (w: W, u: number, f: number) => w.a + w.k * cw(w, u) - f * cw(w, u);
  const yAt = (w: W, u: number) => w.y0 + w.dih * u;
  const N = 9;

  function buildWing(w: W, color: string) {
    const le: number[][] = [];
    const te: number[][] = [];
    const out: [number, number][] = [];
    for (let i = 0; i < N; i++) {
      const u = (w.half * i) / (N - 1);
      out.push([u, zf(w, u, 0)]);
    }
    for (let i = N - 1; i >= 0; i--) {
      const u = (w.half * i) / (N - 1);
      out.push([u, zf(w, u, 1)]);
    }
    for (const s of SIDES) {
      b.extrude(out, { at: [0, w.y0, 0], x: [s, w.dih, 0], y: [0, 0, 1], thickness: w.th, bevel: 0.01, color });
      const lp: number[][] = [];
      const tp: number[][] = [];
      for (let i = 0; i < N; i++) {
        const u = (w.half * i) / (N - 1);
        lp.push([s * u, yAt(w, u) + w.th / 2 + 0.006, zf(w, u, 0)]);
        tp.push([s * u, yAt(w, u) + w.th / 2 + 0.006, zf(w, u, 1)]);
      }
      for (let i = 0; i < N - 1; i++) {
        b.rod(lp[i], lp[i + 1], 0.011, LINE);
        b.rod(tp[i], tp[i + 1], 0.011, LINE);
      }
      b.rod(lp[N - 1], tp[N - 1], 0.011, LINE);
    }
    return { le, te };
  }

  function panel(w: W, s: number, u0: number, u1: number, f0: number, f1: number, color: string) {
    const make = (a0: number, a1: number, g0: number, g1: number) => {
      const o: [number, number][] = [];
      const us = [0, 1 / 3, 2 / 3, 1].map((t) => a0 + (a1 - a0) * t);
      for (const u of us) o.push([u, zf(w, u, g0)]);
      for (const u of [...us].reverse()) o.push([u, zf(w, u, g1)]);
      return o;
    };
    const pose = (lift: number, th: number, o: [number, number][], c: string) =>
      b.extrude(o, { at: [0, w.y0 + w.th / 2 + lift, 0], x: [s, w.dih, 0], y: [0, 0, 1], thickness: th, color: c });
    pose(0.002, 0.006, make(u0 - 0.04, u1 + 0.04, f0 - 0.03, f1 + 0.03), LINE);
    pose(0.003, 0.008, make(u0, u1, f0, f1), color);
  }

  const wing: W = { half: 5.6, c0: 2.5, a: 0.3, k: 0.28, y0: 1.25, dih: 0.06, th: 0.1 };
  buildWing(wing, HULL);
  for (const s of SIDES) {
    panel(wing, s, 3.2, 5.1, 0.72, 1.0, HULL_LT); // aileron
    panel(wing, s, 1.15, 3.0, 0.7, 1.0, PALE); // flap
    panel(wing, s, 0.9, 5.2, 0.0, 0.14, DARK); // leading edge strip

    // roundel on the upper wing
    const u = 3.7;
    const z = zf(wing, u, 0.42);
    const n: [number, number, number] = [-0.06 * s, 1, 0];
    const base = [s * u, yAt(wing, u) + wing.th / 2 + 0.012, z];
    [[0.62, LINE], [0.5, NAVY], [0.36, LINE], [0.2, HULL_LT]].forEach(([r, c], i) => {
      b.part(new THREE.CylinderGeometry(r as number, r as number, 0.006, 20), c as string, {
        at: [base[0], base[1] + i * 0.005, base[2]],
        dir: n,
      });
    });

    // cannons
    for (const cu of [1.9, 2.5]) {
      const y = yAt(wing, cu);
      const l = zf(wing, cu, 0);
      b.rod([s * cu, y, l - 0.05], [s * cu, y, l + 0.75], 0.028, LINE);
      b.rod([s * cu, y, l + 0.6], [s * cu, y, l + 0.8], 0.018, NAVY);
    }

    // radiators
    const ru = 2.9;
    const ry = yAt(wing, ru) - 0.2;
    b.part(new THREE.BoxGeometry(0.55, 0.24, 0.8), DARK, { at: [s * ru, ry, -0.5] });
    b.part(new THREE.BoxGeometry(0.5, 0.2, 0.02), LINE, { at: [s * ru, ry, -0.09] });
    b.part(new THREE.BoxGeometry(0.42, 0.14, 0.02), NAVY, { at: [s * ru, ry, -0.085] });

    // undercarriage
    const gx = s * 1.9;
    b.rod([s * 1.7, 1.3, 0.6], [gx, 0.4, 0.55], 0.05, LINE);
    b.part(new THREE.BoxGeometry(0.03, 0.75, 0.5), HULL_LT, { at: [s * 2.08, 0.85, 0.58] });
    b.part(new THREE.CylinderGeometry(0.38, 0.38, 0.16, 14), NAVY, { at: [gx + s * 0.04, 0.38, 0.55], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.21, 0.21, 0.172, 10), LINE, { at: [gx + s * 0.04, 0.38, 0.55], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.18, 8), DARK, { at: [gx + s * 0.04, 0.38, 0.55], dir: [1, 0, 0] });

    // fuselage roundel and code letters
    const f = fusAt(-3.0);
    const side = s * (f.w / 2 + 0.01);
    [[0.3, LINE], [0.24, NAVY], [0.17, LINE], [0.09, HULL_LT]].forEach(([r, c], i) => {
      b.part(new THREE.CylinderGeometry(r as number, r as number, 0.006, 18), c as string, {
        at: [side + s * i * 0.004, f.y + 0.05, -3.0],
        dir: [s, 0, 0],
      });
    });
  }
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6), LINE, { at: [-4.4, yAt(wing, 4.4) - 0.1, 0.35], dir: [0, 0, 1] });

  // code letters on the fuselage sides
  const code = svg_tex();
  for (const s of SIDES) {
    const f = fusAt(-1.75);
    b.part(new THREE.PlaneGeometry(0.9, 0.36), "#ffffff", {
      at: [s * (f.w / 2 + 0.02), f.y + 0.15, -1.9],
      dir: [s, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: code,
    });
  }

  // ---------- tail ----------
  const tail: W = { half: 1.7, c0: 1.2, a: -5.05, k: 0.5, y0: 1.2, dih: 0.0, th: 0.06 };
  buildWing(tail, HULL);
  for (const s of SIDES) panel(tail, s, 0.15, 1.55, 0.58, 1.0, HULL_LT);

  const FIN_Z = -4.3;
  const FIN_Y = 1.25;
  b.extrude(
    [[0, 0], [1.3, 0], [1.2, 0.5], [0.95, 1.15], [0.55, 1.35], [0.35, 1.2], [0.1, 0.6]],
    { at: [0, FIN_Y, FIN_Z], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.05, smoothing: 1, color: HULL },
  );
  b.extrude([[0.64, 0.06], [1.24, 0.04], [1.14, 0.5], [0.93, 1.08], [0.62, 1.2]], {
    at: [0, FIN_Y, FIN_Z], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.058, color: HULL_LT,
  });
  for (const s of SIDES) {
    b.rod([s * 0.032, FIN_Y + 0.06, FIN_Z - 0.64], [s * 0.032, FIN_Y + 1.2, FIN_Z - 0.62], 0.01, LINE);
    // tail roundel-free flash: white stripes on fin
    b.part(new THREE.BoxGeometry(0.006, 0.5, 0.2), LINE, { at: [s * 0.03, FIN_Y + 0.55, FIN_Z - 0.45] });
    b.part(new THREE.BoxGeometry(0.008, 0.46, 0.16), NAVY, { at: [s * 0.032, FIN_Y + 0.55, FIN_Z - 0.45] });
  }

  // tail wheel
  b.rod([0, 1.05, -4.8], [0, 0.18, -5.15], 0.035, LINE);
  b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 10), NAVY, { at: [0, 0.15, -5.15], dir: [1, 0, 0] });

  return b.root;
}

function svg_tex() {
  return svgTexture();
}

import { svg } from "agentic-3js-builder";
function svgTexture() {
  return svg(
    `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <text x="50" y="31" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="32" fill="#e9f4ff">QJ-K</text>
    </svg>`,
    { size: 256 },
  );
}
```