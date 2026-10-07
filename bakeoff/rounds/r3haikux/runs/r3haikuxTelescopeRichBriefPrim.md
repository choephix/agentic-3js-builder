```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Brass explorer's telescope",
  description:
    "A polished brass explorer's telescope with leather-wrapped sections, engraved rings, a finder scope, a rubber eyecup and focusing knobs, on a mahogany tripod with a baize tray holding a rolled star chart.",
};

// Palette: one flat colour each.
const BRASS = "#cf9c44";
const BRASS_HI = "#ecc76f";
const BRASS_DK = "#7a5520";
const ENGRAVE = "#3a2812";
const LEATHER = "#6b3d20";
const STITCH = "#eedcae";
const MAHOGANY = "#7a3a20";
const MAHOGANY_DK = "#4a2214";
const SATIN = "#b8733f";
const BAIZE = "#2c5c4e";
const PAPER = "#f0e3c0";
const RIBBON = "#1f3d6e";
const RUBBER = "#1a1612";
const GLASS = "#2f6f82";
const FINDER = "#2b2420";

// Telescope frame. The tube pivots about T and points 30 degrees up and forward (+Z).
const TILT = THREE.MathUtils.degToRad(30);
const T = new THREE.Vector3(0, 1.13, 0); // trunnion: the tube pivots here
const D = new THREE.Vector3(0, Math.sin(TILT), Math.cos(TILT)); // tube axis, eyepiece toward objective
const U = new THREE.Vector3(0, Math.cos(TILT), -Math.sin(TILT)); // tube top
const S = new THREE.Vector3(1, 0, 0); // tube side (model left)

/** Point on the tube: s along the axis, `off` away from it, `ang` round it (0 = top, PI/2 = left side). */
function ax(s: number, off = 0, ang = 0): THREE.Vector3 {
  const r = U.clone().multiplyScalar(Math.cos(ang)).addScaledVector(S, Math.sin(ang));
  return T.clone().addScaledVector(D, s).addScaledVector(r, off);
}

export default function build() {
  const b = createBuilder({ name: "explorer-telescope" });
  const base = b.joint("base", { at: [0, 0, 0] });
  const tilt = b.joint("tilt", { at: [T.x, T.y, T.z], parent: base });
  type Bone = typeof base;

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // Cylinder or cone from a to c; radius rA at a, rC at c.
  const seg = (bone: Bone, color: string, a: THREE.Vector3, c: THREE.Vector3, rA: number, rC: number, n = 14) => {
    const len = a.distanceTo(c);
    b.part(new THREE.CylinderGeometry(rC, rA, len, n, 1), color, {
      at: a.clone().add(c).multiplyScalar(0.5),
      dir: c.clone().sub(a).divideScalar(len),
      bone,
    });
  };
  const dot = (bone: Bone, color: string, p: THREE.Vector3, r: number) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), color, { at: p, bone });
  const box = (bone: Bone, color: string, p: THREE.Vector3, w: number, h: number, d: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: p, bone });
  // Flat ring lying across the given axis.
  const ring = (bone: Bone, color: string, p: THREE.Vector3, axis: THREE.Vector3, R: number, r: number) =>
    b.part(new THREE.TorusGeometry(R, r, 6, 28).rotateX(Math.PI / 2), color, {
      at: p,
      dir: axis.clone().normalize(),
      bone,
    });

  // ---------- Tripod: three mahogany legs, brass fittings, hub, yoke ----------
  const legs = [
    { top: V(0, 0.9, -0.04), foot: V(0, 0.008, -0.6) },
    { top: V(0.043, 0.9, 0.025), foot: V(0.52, 0.008, 0.3) },
    { top: V(-0.043, 0.9, 0.025), foot: V(-0.52, 0.008, 0.3) },
  ];
  for (const { top, foot } of legs) {
    const at = (t: number) => top.clone().lerp(foot, t);
    seg(base, MAHOGANY, at(0), at(1), 0.03, 0.02, 12); // tapered wooden leg
    seg(base, BRASS_HI, at(0.14), at(0.17), 0.034, 0.034, 14); // hinge collar
    seg(base, BRASS_HI, at(0.545), at(0.575), 0.034, 0.034, 14); // spreader collar
    seg(base, BRASS, at(0.935), at(0.995), 0.024, 0.024, 14); // foot ferrule
    seg(base, RUBBER, at(0.985), at(1), 0.016, 0.016, 10); // rubber foot
  }

  seg(base, BRASS_HI, V(0, 0.9, 0), V(0, 0.96, 0), 0.07, 0.07, 18); // hub
  seg(base, BRASS_DK, V(0, 0.96, 0), V(0, 0.972, 0), 0.05, 0.05, 16); // hub cap

  for (const sx of [1, -1]) {
    seg(base, BRASS, V(sx * 0.055, 0.95, 0), V(sx * 0.1, T.y, 0), 0.011, 0.011, 10); // yoke arm
    seg(base, BRASS_HI, V(sx * 0.094, T.y, 0), V(sx * 0.106, T.y, 0), 0.017, 0.017, 14); // bearing boss
  }

  // Shelf bar between the front legs, carrying the tray.
  seg(base, BRASS_DK, V(-0.31, 0.4, 0.179), V(0.31, 0.4, 0.179), 0.008, 0.008, 10);

  // Baize-lined tray: wooden floor, green lining, four walls.
  box(base, SATIN, V(0, 0.414, 0.18), 0.4, 0.012, 0.16);
  box(base, BAIZE, V(0, 0.422, 0.18), 0.37, 0.004, 0.13);
  box(base, SATIN, V(-0.194, 0.435, 0.18), 0.012, 0.03, 0.16);
  box(base, SATIN, V(0.194, 0.435, 0.18), 0.012, 0.03, 0.16);
  box(base, SATIN, V(0, 0.435, 0.106), 0.4, 0.03, 0.012);
  box(base, SATIN, V(0, 0.435, 0.254), 0.4, 0.03, 0.012);

  // Rolled star chart lying in the tray.
  const ROLL_Y = 0.442;
  seg(base, PAPER, V(-0.15, ROLL_Y, 0.18), V(0.15, ROLL_Y, 0.18), 0.022, 0.022, 16);
  for (const sx of [1, -1]) {
    seg(base, MAHOGANY_DK, V(sx * 0.15, ROLL_Y, 0.18), V(sx * 0.156, ROLL_Y, 0.18), 0.024, 0.024, 16);
  }
  seg(base, RIBBON, V(-0.05, ROLL_Y, 0.18), V(-0.038, ROLL_Y, 0.18), 0.0235, 0.0235, 16);
  seg(base, RIBBON, V(0.038, ROLL_Y, 0.18), V(0.05, ROLL_Y, 0.18), 0.0235, 0.0235, 16);
  const stars = [
    [0.008, 0.004],
    [-0.007, 0.009],
    [0.004, -0.01],
    [-0.009, -0.005],
  ] as const;
  for (const [dy, dz] of stars) {
    dot(base, BRASS_HI, V(0.158, ROLL_Y + dy, 0.18 + dz), 0.0022);
  }

  // ---------- Telescope tube (bone: tilt) ----------
  // Eyepiece end: barrel, rubber eyecup, focuser drawtube.
  seg(tilt, BRASS_HI, ax(-0.5), ax(-0.58), 0.02, 0.02, 14);
  seg(tilt, BRASS_HI, ax(-0.5), ax(-0.51), 0.027, 0.027, 16);
  seg(tilt, RUBBER, ax(-0.575), ax(-0.615), 0.024, 0.03, 16);
  ring(tilt, RUBBER, ax(-0.615), D, 0.03, 0.0045);
  seg(tilt, BRASS, ax(-0.51), ax(-0.345), 0.034, 0.034, 16);

  // Focusing knobs: mahogany wheels on brass shafts, one each side of the drawtube.
  for (const sx of [1, -1]) {
    const k = ax(-0.42);
    seg(tilt, BRASS_DK, k.clone().addScaledVector(S, sx * 0.03), k.clone().addScaledVector(S, sx * 0.05), 0.008, 0.008, 10);
    seg(tilt, MAHOGANY_DK, k.clone().addScaledVector(S, sx * 0.05), k.clone().addScaledVector(S, sx * 0.064), 0.027, 0.027, 14);
    seg(tilt, BRASS_HI, k.clone().addScaledVector(S, sx * 0.064), k.clone().addScaledVector(S, sx * 0.068), 0.013, 0.013, 12);
  }

  // Main brass body, collars and objective.
  seg(tilt, BRASS_HI, ax(-0.345), ax(-0.33), 0.058, 0.058, 16);
  seg(tilt, BRASS, ax(-0.33), ax(0.36), 0.05, 0.05, 16);
  seg(tilt, BRASS_HI, ax(-0.025), ax(0.025), 0.0575, 0.0575, 16);
  seg(tilt, BRASS_HI, ax(0.36), ax(0.42), 0.062, 0.062, 18);
  ring(tilt, BRASS_HI, ax(0.42), D, 0.058, 0.0065);
  seg(tilt, GLASS, ax(0.41), ax(0.424), 0.055, 0.055, 18);

  // Engraved rings: thin dark bands in pairs.
  for (const s of [-0.305, -0.293, 0.345, 0.355]) {
    seg(tilt, ENGRAVE, ax(s - 0.0018), ax(s + 0.0018), 0.0508, 0.0508, 16);
  }

  // Leather wraps with brass end caps and two rows of stitching each.
  const wraps = [
    [-0.27, -0.15],
    [0.1, 0.22],
  ] as const;
  for (const [s0, s1] of wraps) {
    seg(tilt, LEATHER, ax(s0), ax(s1), 0.0535, 0.0535, 20);
    seg(tilt, BRASS_HI, ax(s0 - 0.004), ax(s0 + 0.002), 0.0562, 0.0562, 18);
    seg(tilt, BRASS_HI, ax(s1 - 0.002), ax(s1 + 0.004), 0.0562, 0.0562, 18);
    for (const sr of [s0 + 0.011, s1 - 0.011]) {
      for (let i = 0; i < 16; i++) {
        dot(tilt, STITCH, ax(sr, 0.0545, (i / 16) * Math.PI * 2), 0.0027);
      }
    }
  }

  // Graduation dots along the top of the front stretch.
  for (let i = 0; i < 9; i++) {
    dot(tilt, ENGRAVE, ax(0.238 + i * 0.0125, 0.0505, 0), i % 2 ? 0.0016 : 0.0026);
  }

  // Engraved medallion on the left side of the body.
  const medal = ax(-0.07, 0.0505, Math.PI / 2);
  seg(tilt, BRASS_HI, medal.clone().addScaledVector(S, -0.002), medal.clone().addScaledVector(S, 0.002), 0.013, 0.013, 16);
  ring(tilt, ENGRAVE, medal.clone().addScaledVector(S, 0.002), S, 0.0095, 0.0012);

  // Trunnion pin with clamp knobs, which carry the tube on the yoke.
  seg(tilt, BRASS_DK, V(-0.13, T.y, 0), V(0.13, T.y, 0), 0.011, 0.011, 10);
  for (const sx of [1, -1]) {
    seg(tilt, MAHOGANY_DK, V(sx * 0.13, T.y, 0), V(sx * 0.15, T.y, 0), 0.02, 0.02, 14);
  }

  // ---------- Finder scope on top (bone: tilt) ----------
  const FO = 0.082; // finder axis offset above the main tube
  for (const sc of [-0.11, 0.06]) {
    seg(tilt, BRASS_DK, ax(sc - 0.01), ax(sc + 0.01), 0.0585, 0.0585, 16); // saddle collar
    seg(tilt, BRASS, ax(sc, 0.04), ax(sc, FO), 0.007, 0.007, 10); // arm up to the finder
  }
  seg(tilt, FINDER, ax(-0.2, FO), ax(0.14, FO), 0.021, 0.021, 14);
  seg(tilt, BRASS, ax(-0.03, FO), ax(-0.02, FO), 0.0222, 0.0222, 14);
  seg(tilt, BRASS, ax(-0.2, FO), ax(-0.23, FO), 0.013, 0.013, 12);
  seg(tilt, RUBBER, ax(-0.23, FO), ax(-0.25, FO), 0.014, 0.019, 12);
  seg(tilt, BRASS_HI, ax(0.14, FO), ax(0.165, FO), 0.025, 0.025, 14);
  seg(tilt, GLASS, ax(0.16, FO), ax(0.172, FO), 0.02, 0.02, 14);

  return b.root;
}
```