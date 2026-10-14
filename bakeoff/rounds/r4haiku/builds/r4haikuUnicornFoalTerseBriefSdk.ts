import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Unicorn foal",
  description:
    "A stylised unicorn foal on a rigged skeleton: cream coat, gold banded horn and hooves, pastel mane and tail, a gold star on each flank.",
};

// Palette. Each colour string is one shared material.
const COAT = "#f8f3ec";
const BELLY = "#e6daf4";
const MUZZLE = "#f9d3d9";
const BLUSH = "#ff9bc6";
const HOOF = "#f3cc7a";
const HORN = "#ffc93f";
const HORN_LIGHT = "#fff2c4";
const EYE = "#3b2a6e";
const SHINE = "#ffffff";
const NOSTRIL = "#7a5577";
const STAR = "#ffc53d";
const PINK = "#ff7ec6";
const LILAC = "#a98dff";
const AQUA = "#5ad9e4";
const ROSE = "#ffb3e0";
const MANE = [PINK, LILAC, AQUA, ROSE];

// Rig layout, model space in metres (+Y up, faces +Z, left = +X).
type Pt = number[];
const SPINE: Pt[] = [[0, 0.74, -0.3], [0, 0.75, -0.1], [0, 0.76, 0.06], [0, 0.78, 0.2]];
const NECK: Pt[] = [[0, 0.775, 0.14], [0, 0.92, 0.3], [0, 1.03, 0.4], [0, 1.1, 0.5]];
const HEAD_TIP: Pt = [0, 1.16, 0.64];
const TAIL: Pt[] = [[0, 0.76, -0.44], [0, 0.8, -0.56], [0, 0.76, -0.7], [0, 0.66, -0.78], [0, 0.54, -0.8]];
const FORE_LEG: Pt[] = [[0.13, 0.7, 0.2], [0.14, 0.5, 0.2], [0.14, 0.38, 0.21], [0.14, 0.14, 0.22], [0.14, 0.05, 0.24]];
const HIND_LEG: Pt[] = [[0.13, 0.7, -0.28], [0.15, 0.5, -0.24], [0.15, 0.3, -0.32], [0.15, 0.13, -0.34], [0.15, 0.05, -0.33]];
const HORN_BASE: Pt = [0, 1.268, 0.6];
const HORN_TIP: Pt = [0, 1.47, 0.7];

/** Point at arc-length fraction t along a polyline. */
function polyAt(pts: Pt[], t: number): Pt {
  const lens: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(
      pts[i][0] - pts[i - 1][0],
      pts[i][1] - pts[i - 1][1],
      pts[i][2] - pts[i - 1][2],
    );
    lens.push(d);
    total += d;
  }
  let s = Math.min(1, Math.max(0, t)) * total;
  for (let i = 0; i < lens.length; i++) {
    if (s <= lens[i] || i === lens.length - 1) {
      const u = lens[i] > 0 ? Math.min(1, s / lens[i]) : 0;
      return [0, 1, 2].map((k) => pts[i][k] + (pts[i + 1][k] - pts[i][k]) * u);
    }
    s -= lens[i];
  }
  return pts[pts.length - 1].slice();
}

/** Ellipsoid centred on the origin. */
function ell(rx: number, ry: number, rz: number, seg = 10): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1, seg, Math.max(6, seg - 2));
  g.scale(rx, ry, rz);
  return g;
}

/** Cone standing on its base at the origin, so stick() seats it on the surface. */
function cone(r: number, len: number, seg: number): THREE.BufferGeometry {
  const g = new THREE.ConeGeometry(r, len, seg, 1);
  g.translate(0, len / 2, 0);
  return g;
}

/** Hoof: a short cylinder standing on y = 0. */
function hoof(): THREE.BufferGeometry {
  const g = new THREE.CylinderGeometry(0.046, 0.052, 0.05, 8, 1);
  g.translate(0, 0.025, 0);
  return g;
}

/** Five-point star, extruded along +Y so its base sits at the origin. */
function starPlate(outer: number, inner: number, depth: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? outer : inner;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);
  return g;
}

export default function build() {
  const b = createBuilder({ name: "unicorn-foal" });
  const rand = rng(29);

  // Body: the spine is the root of the rig, rump to chest.
  const spine = b.chain("spine", SPINE, { role: "spine" });
  const bodyTube = b.sweep(spine, 0.2, { color: COAT });
  const bodySurf = b.surface(bodyTube);
  b.part(ell(0.21, 0.22, 0.2, 12), COAT, { at: [0, 0.76, -0.3] }); // rump
  b.part(ell(0.19, 0.2, 0.19, 12), COAT, { at: [0, 0.76, 0.2] }); // chest
  b.part(ell(0.17, 0.1, 0.27, 10), BELLY, { at: [0, 0.6, -0.02] }); // lilac underside

  // Gold star on each flank, seated on the body surface.
  const star = starPlate(0.075, 0.032, 0.02);
  for (const s of [1, -1]) {
    b.stick(star, STAR, bodySurf.nearest([s * 0.25, 0.76, -0.12]));
  }

  // Neck: chained from the withers.
  const neck = b.chain("neck", [spine.at(0.85), ...NECK.slice(1)], { role: "neck" });
  const neckTube = b.sweep(neck, 0.085, { color: COAT });
  const neckSurf = b.surface(neckTube);

  // Head: chained from the top of the neck.
  const head = b.chain("head", [neck.at(0.9), HEAD_TIP], { role: "head" });
  const headTube = b.sweep(head, 0.125, { color: COAT });
  const headSurf = b.surface(headTube);

  // Muzzle, and a lower jaw on its own joint so the mouth can open.
  const muzzleTube = b.sweep([[0, 1.1, 0.62], [0, 1.09, 0.74]], 0.08, { color: MUZZLE });
  const muzzleSurf = b.surface(muzzleTube);
  const jaw = b.chain("jaw", [head.at(0.3), [0, 1.03, 0.64], [0, 1.02, 0.74]], { role: "jaw" });
  b.sweep(jaw, 0.036, { color: MUZZLE });

  // Face: eyes with shine, blush, lashes and nostrils.
  for (const s of [1, -1]) {
    b.stick(ell(0.03, 0.03, 0.03, 10), EYE, headSurf.nearest([s * 0.118, 1.16, 0.58]));
    b.stick(ell(0.011, 0.011, 0.011, 6), SHINE, headSurf.nearest([s * 0.122, 1.178, 0.596]));
    b.stick(ell(0.04, 0.012, 0.03, 8), BLUSH, headSurf.nearest([s * 0.12, 1.1, 0.64]));
    for (let k = 0; k < 3; k++) {
      b.stick(cone(0.007, 0.034, 4), EYE, headSurf.nearest([s * 0.122, 1.19, 0.555 + k * 0.025]));
    }
    b.stick(ell(0.014, 0.014, 0.014, 6), NOSTRIL, muzzleSurf.nearest([s * 0.03, 1.1, 0.84]));
  }

  // Ears: pale triangular cones standing up and out from the top of the head.
  for (const s of [1, -1]) {
    b.stick(cone(0.036, 0.13, 3), MUZZLE, headSurf.nearest([s * 0.085, 1.25, 0.47]));
  }

  // Forelock: a short pastel crest on the top of the head.
  for (let i = 0; i < 4; i++) {
    const x = (i % 2 === 0 ? 1 : -1) * 0.022;
    const hit = headSurf.nearest([x, 1.26, 0.47 + i * 0.025]);
    b.stick(cone(0.03, 0.12 + rand() * 0.03, 5), MANE[i], hit);
  }

  // Horn: stacked, banded segments tapering to a sparkle tip.
  const hornHit = headSurf.nearest([0, 1.27, 0.6]);
  const hornAt = (k: number): Pt => HORN_BASE.map((v, i) => v + (HORN_TIP[i] - v) * (k / 6));
  for (let k = 0; k < 6; k++) {
    const from = k === 0 ? hornHit : hornAt(k);
    b.sweep([from, hornAt(k + 1)], 0.042 - k * 0.0052, {
      color: k % 2 === 0 ? HORN : HORN_LIGHT,
    });
  }
  b.part(ell(0.016, 0.016, 0.016, 6), HORN_LIGHT, { at: HORN_TIP });

  // Mane: pastel spikes along the crest of the neck, pointing up and back.
  const crest: Pt = [0, 0.67, -0.74];
  for (let i = 0; i < 15; i++) {
    const p = polyAt(NECK, 0.03 + (i / 14) * 0.9);
    const hit = neckSurf.nearest([
      p[0] + (rand() - 0.5) * 0.05,
      p[1] + crest[1] * 0.075,
      p[2] + crest[2] * 0.075,
    ]);
    b.stick(cone(0.03, 0.1 + rand() * 0.05, 5), MANE[i % MANE.length], hit);
  }

  // Tail: a flowing chain with a pastel tuft over its lower half.
  const tail = b.chain("tail", TAIL, { role: "tail" });
  const tailTube = b.sweep(tail, 0.03, { color: COAT });
  const tailSurf = b.surface(tailTube);
  for (let i = 0; i < 12; i++) {
    const p = polyAt(TAIL, 0.5 + (i / 11) * 0.5);
    const a = (i / 12) * Math.PI * 2 + rand() * 0.4;
    const q = [p[0] + Math.cos(a) * 0.035, p[1] + Math.sin(a) * 0.035, p[2]];
    b.stick(cone(0.028, 0.09 + rand() * 0.05, 5), MANE[(i + 1) % MANE.length], tailSurf.nearest(q));
  }

  // Legs: four chains, each with a knee or hock, fetlock and a gold hoof.
  const legs = [
    { id: "FL", base: FORE_LEG, s: 1 },
    { id: "FR", base: FORE_LEG, s: -1 },
    { id: "BL", base: HIND_LEG, s: 1 },
    { id: "BR", base: HIND_LEG, s: -1 },
  ];
  for (const L of legs) {
    const pts = L.base.map((p) => [p[0] * L.s, p[1], p[2]]);
    const leg = b.chain("leg" + L.id, pts, { role: "leg" });
    b.sweep(leg, 0.04, { color: COAT });
    b.part(ell(0.05, 0.05, 0.05, 8), COAT, { at: pts[2] }); // knee or hock
    b.part(ell(0.04, 0.04, 0.04, 8), COAT, { at: pts[3] }); // fetlock
    b.part(hoof(), HOOF, { at: [pts[4][0], 0, pts[4][2]] });
  }

  return b.root;
}
