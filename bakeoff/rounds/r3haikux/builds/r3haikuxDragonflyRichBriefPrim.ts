import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Emperor dragonfly",
  description:
    "An emperor dragonfly hovering over a pond: electric-blue abdomen with black dorsal markings, apple-green thorax, huge turquoise eyes and four veined, glassy wings held flat.",
};

type V = [number, number, number];

const H = 0.14; // thorax height above the pond (m)
const NSEG = 10; // abdominal segments
const ER: V = [0.0105, 0.0105, 0.0115]; // eye radii
const TR: V = [0.0088, 0.0098, 0.0150]; // thorax radii
const THORAX: V = [0, H, 0];

const COL = {
  green: "#9ccf43",
  blue: "#0b6cff",
  black: "#111419",
  navy: "#1d2f5e",
  eye: "#20c4b6",
  eyeDot: "#9ff6e8",
  face: "#c4e06a",
  glass: "#ebdfa6",
  vein: "#2a2216",
  stigma: "#4b3418",
  leg: "#1b2026",
};

type Prof = { st: number[]; lead: number[]; trail: number[] };

// Wing outlines, relative to the wing root: u runs outward along the span,
// lead/trail are chord offsets (+ forward, toward the head).
const FORE: Prof = {
  st: [0.002, 0.01, 0.02, 0.03, 0.04, 0.046, 0.0495],
  lead: [0.0042, 0.005, 0.005, 0.0044, 0.0034, 0.002, 0.0007],
  trail: [-0.0018, -0.0028, -0.0034, -0.0034, -0.0028, -0.0016, -0.0001],
};
const HIND: Prof = {
  st: [0.002, 0.01, 0.02, 0.03, 0.038, 0.0425, 0.0445],
  lead: [0.0062, 0.0078, 0.0072, 0.0058, 0.0038, 0.0018, 0.0006],
  trail: [-0.0036, -0.005, -0.0056, -0.005, -0.0038, -0.002, -0.0002],
};

// Oriented cylinder from a to c (radius r0 at a, r1 at c), centred on its midpoint.
function tube(a: V, c: V, r0: number, r1: number, sides = 6) {
  const d = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
  const len = d.length();
  const y = d.clone().divideScalar(len);
  const ref =
    Math.abs(y.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const x = new THREE.Vector3().crossVectors(ref, y).normalize();
  const z = new THREE.Vector3().crossVectors(x, y);
  const geo = new THREE.CylinderGeometry(r1, r0, len, sides, 1);
  geo.applyMatrix4(new THREE.Matrix4().makeBasis(x, y, z));
  const mid: V = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
  return { geo, mid };
}

// Point on an ellipsoid (centre c, radii r) in direction dir, scaled by k.
function onEllipsoid(c: V, r: V, dir: V, k = 1): V {
  const n = Math.hypot(dir[0], dir[1], dir[2]);
  const u: V = [dir[0] / n, dir[1] / n, dir[2] / n];
  const t = k / Math.hypot(u[0] / r[0], u[1] / r[1], u[2] / r[2]);
  return [c[0] + u[0] * t, c[1] + u[1] * t, c[2] + u[2] * t];
}

function lerp3(p: V, q: V, t: number): V {
  return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
}

function lerpAt(arr: number[], st: number[], u: number): number {
  for (let i = 0; i < st.length - 1; i++) {
    if (u <= st[i + 1]) {
      const t = (u - st[i]) / (st[i + 1] - st[i]);
      return arr[i] + (arr[i + 1] - arr[i]) * t;
    }
  }
  return arr[arr.length - 1];
}

export default function build() {
  const b = createBuilder({ name: "emperor-dragonfly" });

  // ---- thorax and head ----
  const thorax = b.joint("thorax", { at: THORAX });
  const head = b.joint("head", { at: [0, H + 0.002, 0.024], parent: thorax });

  const thoraxGeo = new THREE.SphereGeometry(1, 14, 10);
  thoraxGeo.scale(TR[0], TR[1], TR[2]);
  b.part(thoraxGeo, COL.green, { at: THORAX, bone: thorax });

  // Navy flank stripes wrapping the thorax.
  for (const s of [1, -1]) {
    const stripes: [V, V][] = [
      [[s, 0.55, 0.3], [s, 0.3, -0.1]],
      [[s, 0.05, 0.15], [s, -0.25, -0.35]],
    ];
    for (const [p, q] of stripes) {
      const pts = [0, 1, 2, 3].map((i) =>
        onEllipsoid(THORAX, TR, lerp3(p, q, i / 3), 1.02),
      );
      for (let i = 0; i < pts.length - 1; i++) {
        const t = tube(pts[i], pts[i + 1], 0.00075, 0.00075, 5);
        b.part(t.geo, COL.navy, { at: t.mid, bone: thorax });
      }
    }
  }

  // Huge wraparound compound eyes with a sparse lattice of lighter facets.
  for (const s of [1, -1]) {
    const ec: V = [s * 0.0062, H + 0.0036, 0.0252];
    const eg = new THREE.SphereGeometry(1, 16, 12);
    eg.scale(ER[0], ER[1], ER[2]);
    b.part(eg, COL.eye, { at: ec, bone: head });

    for (const a of [0.5, 0.95, 1.4]) {
      for (const p of [-0.4, 0.15, 0.6]) {
        const dir: V = [s * Math.cos(a) * Math.cos(p), Math.sin(p), Math.sin(a) * Math.cos(p)];
        const dot = new THREE.SphereGeometry(0.0011, 6, 4);
        b.part(dot, COL.eyeDot, { at: onEllipsoid(ec, ER, dir), bone: head });
      }
    }
  }

  // Small pale face between the eyes.
  const faceGeo = new THREE.SphereGeometry(1, 10, 8);
  faceGeo.scale(0.004, 0.0055, 0.0032);
  b.part(faceGeo, COL.face, { at: [0, H - 0.0005, 0.034], bone: head });

  // Tiny antennae.
  for (const s of [1, -1]) {
    const an = tube(
      [s * 0.0009, H + 0.0112, 0.0318],
      [s * 0.0016, H + 0.0142, 0.0342],
      0.00026,
      0.0001,
      4,
    );
    b.part(an.geo, COL.leg, { at: an.mid, bone: head });
  }

  // ---- abdomen: ten segments, slim and tapering, with a black dorsal line ----
  const zb = (k: number) => -0.013 - 0.0055 * k;
  const yb = (k: number) => H - 0.0012 - 0.005 * (k / NSEG) ** 2;
  const rad = (k: number) =>
    0.0021 + 0.0013 * Math.sin(Math.PI * Math.min(1, (k / NSEG) * 1.15));

  const tails: (typeof thorax)[] = [];
  let parent = thorax;
  for (let k = 0; k < NSEG; k++) {
    const j = b.joint(`tail${k + 1}`, { at: [0, yb(k), zb(k)], parent });
    tails.push(j);
    parent = j;
  }

  for (let k = 0; k < NSEG; k++) {
    const a: V = [0, yb(k), zb(k)];
    const c: V = [0, yb(k + 1), zb(k + 1)];
    const seg = tube(a, c, rad(k), rad(k + 1), 8);
    b.part(seg.geo, COL.blue, { at: seg.mid, bone: tails[k] });

    const ta: V = [0, a[1] + rad(k) * 0.96, a[2]];
    const tc: V = [0, c[1] + rad(k + 1) * 0.96, c[2]];
    const st = tube(lerp3(ta, tc, 0.08), lerp3(ta, tc, 0.92), 0.00055, 0.00055, 4);
    b.part(st.geo, COL.black, { at: st.mid, bone: tails[k] });
  }

  // Terminal appendages.
  const yEnd = yb(NSEG);
  const zEnd = zb(NSEG);
  for (const s of [1, -1]) {
    const cerc = tube(
      [s * 0.0007, yEnd, zEnd + 0.0002],
      [s * 0.0024, yEnd - 0.0005, zEnd - 0.0032],
      0.00065,
      0.00014,
      5,
    );
    b.part(cerc.geo, COL.black, { at: cerc.mid, bone: tails[NSEG - 1] });
  }

  // ---- four glassy wings: pale membrane, fine vein net, dark pterostigma ----
  const wing = (name: string, s: number, root: V, p: Prof) => {
    const j = b.joint(name, { at: root, parent: thorax });
    const n = p.st.length;

    // Membrane: outline in the wing plane, extruded thin.
    const shape = new THREE.Shape();
    for (let i = 0; i < n; i++) {
      if (i === 0) shape.moveTo(s * p.st[i], -p.lead[i]);
      else shape.lineTo(s * p.st[i], -p.lead[i]);
    }
    for (let i = n - 1; i >= 0; i--) shape.lineTo(s * p.st[i], -p.trail[i]);
    shape.closePath();
    const skin = new THREE.ExtrudeGeometry(shape, { depth: 0.00035, bevelEnabled: false });
    skin.rotateX(-Math.PI / 2);
    b.part(skin, COL.glass, { at: root, bone: j });

    // Vein net: longitudinal veins and cross veins on a grid.
    const uStart = 0.0035;
    const uEnd = p.st[n - 1] - 0.0008;
    const N = 6;
    const uk = (k: number) => uStart + ((uEnd - uStart) * k) / N;
    const pt = (u: number, f: number): V => {
      const tr = lerpAt(p.trail, p.st, u);
      const ld = lerpAt(p.lead, p.st, u);
      return [root[0] + s * u, root[1] + 0.0004, root[2] + tr + (ld - tr) * f];
    };

    const FS = [0.03, 0.15, 0.28, 0.42, 0.56, 0.7, 0.84, 0.96];
    for (const f of FS) {
      const r = f < 0.05 || f > 0.95 ? 0.00055 : 0.00035;
      for (let k = 0; k < N; k++) {
        const v = tube(pt(uk(k), f), pt(uk(k + 1), f), r, r, 4);
        b.part(v.geo, COL.vein, { at: v.mid, bone: j });
      }
    }
    for (let k = 1; k < N; k++) {
      for (let i = 0; i < FS.length - 1; i++) {
        const v = tube(pt(uk(k), FS[i]), pt(uk(k), FS[i + 1]), 0.00028, 0.00028, 4);
        b.part(v.geo, COL.vein, { at: v.mid, bone: j });
      }
    }

    // Pterostigma: the dark spot on the leading edge near the tip.
    const ps = tube(pt(uEnd - 0.0055, 0.97), pt(uEnd - 0.0008, 0.97), 0.0009, 0.0009, 4);
    b.part(ps.geo, COL.stigma, { at: ps.mid, bone: j });
  };

  wing("wingFL", 1, [0.0055, H + 0.007, 0.006], FORE);
  wing("wingFR", -1, [-0.0055, H + 0.007, 0.006], FORE);
  wing("wingHL", 1, [0.0055, H + 0.007, -0.006], HIND);
  wing("wingHR", -1, [-0.0055, H + 0.007, -0.006], HIND);

  // ---- six thin legs, folded forward under the thorax ----
  const LEGS: { n: string; hip: V; knee: V; ankle: V }[] = [
    { n: "F", hip: [0.0045, H - 0.006, 0.0085], knee: [0.0095, H - 0.012, 0.016], ankle: [0.008, H - 0.0185, 0.0235] },
    { n: "M", hip: [0.0055, H - 0.007, -0.001], knee: [0.012, H - 0.0125, 0.001], ankle: [0.011, H - 0.02, 0.006] },
    { n: "H", hip: [0.005, H - 0.0065, -0.008], knee: [0.012, H - 0.012, -0.0085], ankle: [0.0105, H - 0.0185, -0.0045] },
  ];

  for (const L of LEGS) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const mirror = (p: V): V => [s * p[0], p[1], p[2]];
      const hipP = mirror(L.hip);
      const kneeP = mirror(L.knee);
      const ankleP = mirror(L.ankle);

      const hip = b.joint(`hip${L.n}${side}`, { at: hipP, parent: thorax });
      const knee = b.joint(`knee${L.n}${side}`, { at: kneeP, parent: hip });
      const ankle = b.joint(`ankle${L.n}${side}`, { at: ankleP, parent: knee });

      const thigh = tube(hipP, kneeP, 0.00075, 0.0006, 5);
      b.part(thigh.geo, COL.leg, { at: thigh.mid, bone: hip });
      const shin = tube(kneeP, ankleP, 0.0006, 0.00032, 5);
      b.part(shin.geo, COL.leg, { at: shin.mid, bone: knee });
      const claw = tube(
        ankleP,
        [ankleP[0], ankleP[1] - 0.0009, ankleP[2] + 0.0009],
        0.0003,
        0.00005,
        4,
      );
      b.part(claw.geo, COL.leg, { at: claw.mid, bone: ankle });
    }
  }

  return b.root;
}
