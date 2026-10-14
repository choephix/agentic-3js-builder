import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

type V = [number, number, number];

export const meta = {
  name: "Panther chameleon on a twig",
  description:
    "A panther chameleon walking a twig: turquoise head with a ridged crest and turret eyes, lime body with a white flank stripe and red bars, sunset-orange tail curled above the twig, mitten feet wrapped around it.",
};

const add = (a: V, c: V): V => [a[0] + c[0], a[1] + c[1], a[2] + c[2]];
const sub = (a: V, c: V): V => [a[0] - c[0], a[1] - c[1], a[2] - c[2]];
const mul = (a: V, k: number): V => [a[0] * k, a[1] * k, a[2] * k];
const unit = (a: V): V => mul(a, 1 / Math.hypot(a[0], a[1], a[2]));
const mid = (a: V, c: V): V => mul(add(a, c), 0.5);

/** Point on an ellipsoid (centre c, radii r), reached from its centre along d. */
function onEllipsoid(c: V, r: V, d: V): V {
  const k = 1 / Math.hypot(d[0] / r[0], d[1] / r[1], d[2] / r[2]);
  return add(c, mul(d, k));
}

/** Outward unit normal of an ellipsoid at its surface point p. */
function normalOn(c: V, r: V, p: V): V {
  return unit([
    (p[0] - c[0]) / (r[0] * r[0]),
    (p[1] - c[1]) / (r[1] * r[1]),
    (p[2] - c[2]) / (r[2] * r[2]),
  ]);
}

/** Tail coil: 1.8 turns of a helix around the X axis, shrinking slightly. u runs 0 -> 1. */
function coil(u: number): V {
  const phi = -Math.PI / 2 - u * Math.PI * 2 * 1.8;
  const r = 0.026 - 0.007 * u;
  return [-0.0135 + 0.027 * u, 0.084 + r * Math.sin(phi), -0.14 + r * Math.cos(phi)];
}

export default function build() {
  const b = createBuilder({ name: "panther-chameleon" });
  type J = ReturnType<typeof b.joint>;

  const COL = {
    head: "#1fc4b8",
    jaw: "#17a79f",
    neck: "#5fd49c",
    chest: "#9ee05a",
    belly: "#b8e250",
    flank: "#e4dc4c",
    hips: "#f8b13c",
    hindLeg: "#f5a83e",
    tailA: "#ff9a35",
    tailB: "#ff7a2c",
    tailC: "#ff5d2a",
    crest: "#0f8c87",
    dorsal: "#3f9a4a",
    gold: "#f5c542",
    pupil: "#15120f",
    white: "#f3f5ee",
    red: "#e0262b",
    bark: "#6b4a2b",
  };

  const YC = 0.07;
  const HEAD_C: V = [0, 0.1, 0.115];
  const HEAD_R: V = [0.024, 0.026, 0.036];
  const NECK_C: V = [0, YC, 0.075];

  // ---- skeleton -------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.068, -0.03] });
  const chest = b.joint("chest", { at: [0, 0.072, 0.035], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.088, 0.085], parent: chest });
  const head = b.joint("head", { at: HEAD_C, parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.086, 0.098], parent: head });
  const perch = b.joint("perch", { at: [0, 0, 0], parent: hips });

  const tail1 = b.joint("tail1", { at: [0, 0.064, -0.1], parent: hips });
  const tail2 = b.joint("tail2", { at: coil(0), parent: tail1 });
  const tail3 = b.joint("tail3", { at: coil(0.5), parent: tail2 });
  const tail4 = b.joint("tail4", { at: coil(1), parent: tail3 });

  // ---- body: overlapping ellipsoids, one colour band each -------------
  const torso: { z: number; r: V; color: string; bone: J }[] = [
    { z: 0.075, r: [0.02, 0.026, 0.03], color: COL.neck, bone: neck },
    { z: 0.03, r: [0.024, 0.03, 0.036], color: COL.chest, bone: chest },
    { z: -0.02, r: [0.024, 0.031, 0.036], color: COL.belly, bone: hips },
    { z: -0.05, r: [0.021, 0.028, 0.03], color: COL.flank, bone: hips },
    { z: -0.076, r: [0.016, 0.022, 0.03], color: COL.hips, bone: hips },
  ];

  const ellipsoid = (c: V, r: V, color: string, bone: J) => {
    const g = new THREE.SphereGeometry(1, 16, 10);
    g.scale(r[0], r[1], r[2]);
    b.part(g, color, { at: c, bone });
  };

  for (const t of torso) ellipsoid([0, YC, t.z], t.r, t.color, t.bone);
  ellipsoid(HEAD_C, HEAD_R, COL.head, head);

  // Lateral envelope of the torso at height y and station z (surface x).
  const flankX = (y: number, z: number) => {
    let x = 0;
    for (const t of torso) {
      const q = 1 - ((y - YC) / t.r[1]) ** 2 - ((z - t.z) / t.r[2]) ** 2;
      if (q > 0) x = Math.max(x, t.r[0] * Math.sqrt(q));
    }
    return x;
  };

  // Dorsal height of the torso at station z (x = 0).
  const topY = (z: number) => {
    let y = YC;
    for (const t of torso) {
      const q = 1 - ((z - t.z) / t.r[2]) ** 2;
      if (q > 0) y = Math.max(y, YC + t.r[1] * Math.sqrt(q));
    }
    return y;
  };

  // A small cone seated on a surface point, pointing along d.
  const spike = (base: V, d: V, h: number, r: number, color: string, bone: J) => {
    const start = sub(base, mul(d, 0.002));
    const tip = add(start, mul(d, h));
    b.part(new THREE.ConeGeometry(r, h, 4), color, { at: mid(start, tip), aim: tip, bone });
  };

  // ---- flank markings -------------------------------------------------
  // White lateral stripe, split between chest and hips bones.
  const stripe = (s: number, z0: number, z1: number, n: number, bone: J) => {
    const pts: V[] = [];
    for (let i = 0; i <= n; i++) {
      const z = z0 + ((z1 - z0) * i) / n;
      pts.push([s * (flankX(0.066, z) + 0.0006), 0.066, z]);
    }
    b.sweep(pts, 0.0028, { color: COL.white, bone });
  };

  // Red bars slanting across the flank, dorsal to ventral.
  const bar = (s: number, z0: number, bone: J) => {
    const pts: V[] = [];
    for (let i = 0; i <= 4; i++) {
      const u = i / 4;
      const y = 0.09 - 0.03 * u;
      const z = z0 + 0.008 - 0.016 * u;
      pts.push([s * (flankX(y, z) + 0.0006), y, z]);
    }
    b.sweep(pts, 0.0027, { color: COL.red, bone });
  };

  for (const s of [1, -1]) {
    stripe(s, 0.088, 0, 6, chest);
    stripe(s, 0, -0.088, 6, hips);
    bar(s, 0.022, chest);
    bar(s, -0.004, hips);
    bar(s, -0.03, hips);
    bar(s, -0.078, hips);
  }

  // Small dorsal spines running down the back.
  for (let i = 0; i < 7; i++) {
    const z = 0.05 - i * 0.02;
    spike([0, topY(z), z], unit([0, 1, -0.25]), 0.007, 0.0028, COL.dorsal, z > 0 ? chest : hips);
  }

  // ---- head: ridged crest, turret eyes, jaw ----------------------------
  const top = (k: number) => onEllipsoid(HEAD_C, HEAD_R, [0, 1, k]);

  // Crest spikes along the top of the head, leaning back.
  const crest: [number, number][] = [
    [-1.3, 0.012],
    [-0.9, 0.016],
    [-0.5, 0.018],
    [-0.1, 0.017],
    [0.3, 0.014],
    [0.7, 0.01],
  ];
  for (const [k, h] of crest) {
    const p = top(k);
    const d = unit(add(normalOn(HEAD_C, HEAD_R, p), [0, 0, -0.35]));
    spike(p, d, h, 0.0055, COL.crest, head);
  }

  // Continuous ridge joining the crest spikes.
  const ridge: V[] = [];
  for (let i = 0; i <= 8; i++) ridge.push(top(-1.4 + (2.3 * i) / 8));
  b.sweep(ridge, 0.0036, { color: COL.crest, bone: head });

  // Two small spines on the nape, continuing the crest.
  for (const k of [-0.6, -1.2]) {
    const p = onEllipsoid(NECK_C, torso[0].r, [0, 1, k]);
    const d = unit(add(normalOn(NECK_C, torso[0].r, p), [0, 0, -0.35]));
    spike(p, d, 0.009, 0.0045, COL.crest, neck);
  }

  // Turret eyes: a cone out of the head, a gold eyeball and a dark pupil.
  const turret = (d: V) => {
    const base = onEllipsoid(HEAD_C, HEAD_R, d);
    const start = sub(base, mul(d, 0.003));
    const tip = add(start, mul(d, 0.02));
    b.part(new THREE.ConeGeometry(0.0105, 0.02, 10), COL.head, {
      at: mid(start, tip),
      aim: tip,
      bone: head,
    });
    const eyeC = add(tip, mul(d, 0.0015));
    b.part(new THREE.SphereGeometry(0.0095, 14, 10), COL.gold, { at: eyeC, bone: head });
    b.part(new THREE.SphereGeometry(0.0042, 8, 6), COL.pupil, {
      at: add(eyeC, mul(d, 0.0085)),
      bone: head,
    });
  };
  turret(unit([0.9, 0.35, 0.3])); // left eye: forward and out
  turret(unit([-0.9, 0.3, -0.45])); // right eye: back and out

  // Lower jaw, hinged at the back of the head.
  b.sweep(
    [
      [0, 0.086, 0.098],
      [0, 0.08, 0.13],
      [0, 0.076, 0.158],
    ],
    0.0068,
    { color: COL.jaw, bone: jaw },
  );

  // ---- legs and mitten feet -------------------------------------------
  const leg = (s: number, front: boolean) => {
    const L = s > 0 ? "L" : "R";
    const color = front ? COL.chest : COL.hindLeg;
    const zf = front ? 0.05 : -0.05;
    const body = front ? chest : hips;
    const P: { up: V; mid: V; low: V } = front
      ? {
          up: [s * 0.02, 0.072, 0.05],
          mid: [s * 0.055, 0.05, 0.052],
          low: [s * 0.024, 0.024, 0.05],
        }
      : {
          up: [s * 0.018, 0.066, -0.05],
          mid: [s * 0.05, 0.05, -0.052],
          low: [s * 0.024, 0.024, -0.05],
        };
    const F: V = [s * 0.0175, 0.013, zf];
    const [upN, midN, lowN] = front ? ["shoulder", "elbow", "wrist"] : ["hip", "knee", "ankle"];

    const up = b.joint(upN + L, { at: P.up, parent: body });
    const jm = b.joint(midN + L, { at: P.mid, parent: up });
    const low = b.joint(lowN + L, { at: P.low, parent: jm });

    b.sweep([P.up, mid(P.up, P.mid), P.mid], 0.0075, { color, bone: up });
    b.part(new THREE.SphereGeometry(0.0082, 10, 8), color, { at: P.mid, bone: jm });
    b.sweep([P.mid, mid(P.mid, P.low), P.low], 0.0066, { color, bone: jm });
    b.sweep([P.low, mid(P.low, F), F], 0.0062, { color, bone: low });

    const palm = new THREE.SphereGeometry(1, 12, 8);
    palm.scale(0.0068, 0.0075, 0.0105);
    b.part(palm, color, { at: F, bone: low });

    // Toes wrap the twig (centre at y = 0.013, radius 0.013): two groups
    // over the top and round the side, opposed like a zygodactyl grip.
    const toe = (dz: number, a0: number, a1: number, n: number) => {
      const pts: V[] = [];
      for (let i = 0; i <= n; i++) {
        const a = a0 + ((a1 - a0) * i) / n;
        pts.push([s * 0.0168 * Math.cos(a), 0.013 + 0.0168 * Math.sin(a), zf + dz]);
      }
      b.sweep(pts, 0.0034, { color, bone: low });
    };
    for (const dz of [-0.0048, 0.0048]) toe(dz, 0.15, 2.9, 6);
    for (const dz of [-0.0085, 0, 0.0085]) toe(dz, 0.15, -0.7, 5);
  };

  for (const s of [1, -1]) {
    leg(s, true);
    leg(s, false);
  }

  // ---- tail: a lead-in from the hips, then a tight coil ---------------
  b.sweep(
    [[0, 0.064, -0.1], [-0.005, 0.06, -0.12], coil(0)],
    0.0095,
    { color: COL.tailA, bone: tail1 },
  );

  const run = (u0: number, u1: number, n: number): V[] => {
    const out: V[] = [];
    for (let i = 0; i <= n; i++) out.push(coil(u0 + ((u1 - u0) * i) / n));
    return out;
  };
  b.sweep(run(0, 0.5, 24), 0.0075, { color: COL.tailB, bone: tail2 });
  b.sweep(run(0.5, 1, 24), 0.0062, { color: COL.tailC, bone: tail3 });
  b.part(new THREE.SphereGeometry(0.0062, 10, 8), COL.tailC, { at: coil(1), bone: tail4 });

  // ---- twig the chameleon walks along (lowest point on the floor) -----
  b.sweep(
    [
      [0, 0.013, -0.42],
      [0, 0.013, -0.2],
      [0, 0.013, 0],
      [-0.002, 0.013, 0.2],
      [0, 0.013, 0.42],
    ],
    0.013,
    { color: COL.bark, bone: perch },
  );
  b.sweep(
    [
      [0, 0.012, -0.3],
      [0.02, 0.03, -0.31],
      [0.036, 0.052, -0.335],
    ],
    0.0055,
    { color: COL.bark, bone: perch },
  );

  return b.root;
}
