```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

type Builder = ReturnType<typeof createBuilder>;
type Joint = ReturnType<Builder["joint"]>;
type V3 = [number, number, number];

export const meta = {
  name: "Chameleon",
  description:
    "Veiled-style chameleon in leaf green with a turquoise casque, gold turret eyes, a banded tail curled above a log, and a tongue flicked out.",
};

const GREEN = "#2ea84e";
const BAND = "#0d6e4f";
const LIME = "#c9dc4a";
const GOLD = "#f2b632";
const TURQ = "#18b9a0";
const LID = "#1b7d45";
const EYE = "#f7c531";
const PUPIL = "#0a1a12";
const ORANGE = "#f0792b";
const MOUTH = "#8a2b3c";
const TONGUE = "#ff5d7d";
const TONGUE_TIP = "#ffc2cf";
const IVORY = "#efe6c4";
const BARK = "#7a5636";
const BARK_DARK = "#4f3520";

// Torso ellipsoids. Shared by the body, the crest, the flank bars and the flecks.
const TORSO: { c: V3; r: V3; on: "pelvis" | "chest" }[] = [
  { c: [0, 0.14, -0.07], r: [0.03, 0.046, 0.056], on: "pelvis" },
  { c: [0, 0.15, 0.02], r: [0.031, 0.05, 0.05], on: "chest" },
  { c: [0, 0.147, 0.076], r: [0.03, 0.046, 0.042], on: "chest" },
];

function ellipsoid(r: V3, seg = 14): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7));
  g.scale(r[0], r[1], r[2]);
  return g;
}

function ball(radius: number, seg = 10): THREE.BufferGeometry {
  return new THREE.SphereGeometry(radius, seg, Math.max(5, Math.round(seg * 0.7)));
}

// Cross-section of the torso at depth z: centre height, half-width, half-height, top.
function section(z: number) {
  let best = { cy: 0, rx: 0, ry: 0, top: -Infinity };
  for (const e of TORSO) {
    const t = (z - e.c[2]) / e.r[2];
    if (Math.abs(t) >= 1) continue;
    const s = Math.sqrt(1 - t * t);
    const top = e.c[1] + e.r[1] * s;
    if (top > best.top) best = { cy: e.c[1], rx: e.r[0] * s, ry: e.r[1] * s, top };
  }
  return best;
}

export default function build() {
  const b = createBuilder({ name: "chameleon" });

  // ---------- skeleton: trunk and head ----------
  const pelvis = b.joint("pelvis", { at: [0, 0.135, -0.07] });
  const chest = b.joint("chest", { at: [0, 0.15, 0.02], parent: pelvis });
  const neck = b.joint("neck", { at: [0, 0.17, 0.1], parent: chest });
  const head = b.joint("head", { at: [0, 0.19, 0.125], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.157, 0.1], parent: head });

  const bone = (on: "pelvis" | "chest") => (on === "pelvis" ? pelvis : chest);
  const boneAt = (z: number) => (z < -0.02 ? pelvis : chest);

  // ---------- body ----------
  for (const e of TORSO) b.part(ellipsoid(e.r), GREEN, { at: e.c, bone: bone(e.on) });
  b.part(ellipsoid([0.023, 0.022, 0.08]), LIME, { at: [0, 0.112, 0], bone: chest });
  b.part(ellipsoid([0.026, 0.034, 0.03]), GREEN, { at: [0, 0.168, 0.1], bone: neck });

  // ---------- head ----------
  b.part(ellipsoid([0.036, 0.036, 0.044]), GREEN, { at: [0, 0.196, 0.12], bone: head });
  b.part(ellipsoid([0.026, 0.024, 0.038]), GREEN, { at: [0, 0.181, 0.164], bone: head });

  // Casque: a fin drawn in the side plane (shape x = z, y = y), extruded, then turned so its thickness runs along x.
  const casque = new THREE.Shape();
  const outline: [number, number][] = [
    [0.13, 0.2], [0.112, 0.24], [0.086, 0.27], [0.058, 0.292],
    [0.038, 0.281], [0.026, 0.25], [0.03, 0.205], [0.06, 0.19], [0.11, 0.19],
  ];
  casque.moveTo(outline[0][0], outline[0][1]);
  for (const [z, y] of outline.slice(1)) casque.lineTo(z, y);
  casque.closePath();
  const fin = new THREE.ExtrudeGeometry(casque, {
    depth: 0.012,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.003,
    bevelSegments: 1,
    curveSegments: 4,
  });
  fin.rotateY(-Math.PI / 2);
  fin.translate(0.006, 0, 0);
  b.part(fin, TURQ, { at: [0, 0, 0], bone: head });

  // ---------- jaw, mouth and throat ----------
  b.part(ellipsoid([0.018, 0.012, 0.05]), GREEN, { at: [0, 0.137, 0.152], bone: jaw });
  b.part(ellipsoid([0.02, 0.004, 0.04]), MOUTH, { at: [0, 0.153, 0.158], bone: jaw });
  b.part(ellipsoid([0.016, 0.009, 0.032]), ORANGE, { at: [0, 0.124, 0.132], bone: jaw });

  // ---------- turret eyes ----------
  for (const side of ["L", "R"] as const) {
    const s = side === "L" ? 1 : -1;
    const eye = b.joint(`eye${side}`, { at: [s * 0.036, 0.205, 0.12], parent: head });
    b.part(ellipsoid([0.018, 0.018, 0.016]), LID, { at: [s * 0.034, 0.205, 0.12], bone: eye });
    b.part(ball(0.0125, 12), EYE, { at: [s * 0.046, 0.205, 0.121], bone: eye });
    b.part(ball(0.0055, 8), PUPIL, { at: [s * 0.057, 0.205, 0.121], bone: eye });
  }

  // ---------- dorsal crest: gold spines tallest mid-back ----------
  const crestZ = [-0.11, -0.09, -0.07, -0.05, -0.03, -0.01, 0.01, 0.03, 0.05, 0.07, 0.09];
  crestZ.forEach((z, i) => {
    const h = 0.02 + 0.01 * Math.sin((Math.PI * i) / (crestZ.length - 1));
    const top = section(z).top;
    b.part(new THREE.ConeGeometry(0.0065, h, 6), GOLD, {
      at: [0, top - 0.003 + h / 2, z],
      bone: boneAt(z),
    });
  });

  // ---------- flank bars (teal arcs round the sides) and lime flecks ----------
  for (const z of [-0.1, -0.066, -0.032, 0.002, 0.036]) {
    const sec = section(z);
    const arc = 1.8;
    const bar = new THREE.TorusGeometry(1, 0.22, 6, 18, arc);
    bar.scale(sec.rx * 1.03, sec.ry * 1.03, 0.04);
    bar.rotateZ(-arc / 2);
    const otherSide = bar.clone().rotateZ(Math.PI);
    b.part(bar, BAND, { at: [0, sec.cy, z], bone: boneAt(z) });
    b.part(otherSide, BAND, { at: [0, sec.cy, z], bone: boneAt(z) });
  }
  for (const z of [-0.118, -0.083, -0.049, -0.015, 0.019, 0.053]) {
    const sec = section(z);
    for (const a of [-0.6, 0.6]) {
      for (const side of [1, -1]) {
        b.part(ball(0.0038, 6), LIME, {
          at: [side * sec.rx * Math.cos(a), sec.cy + sec.ry * Math.sin(a), z],
          bone: boneAt(z),
        });
      }
    }
  }

  // ---------- perch: a log, with two bark stubs ----------
  const log = new THREE.CylinderGeometry(0.03, 0.03, 1, 12, 1);
  log.rotateX(Math.PI / 2);
  b.part(log, BARK, { at: [0, 0.03, 0], bone: pelvis });
  for (const [z, s] of [[0.27, 1], [-0.4, -1]] as const) {
    const stub = new THREE.ConeGeometry(0.01, 0.05, 6);
    stub.rotateZ((-s * Math.PI) / 2);
    b.part(stub, BARK_DARK, { at: [s * 0.045, 0.036, z], bone: pelvis });
  }

  // ---------- limbs: two arms from the chest, two legs from the pelvis ----------
  // Given on the left side (+X); the right side mirrors x.
  const limb = (side: "L" | "R", kind: "arm" | "leg", parent: Joint, pts: V3[], toeZ: number) => {
    const s = side === "L" ? 1 : -1;
    const m = (p: V3): V3 => [s * p[0], p[1], p[2]];
    const p0 = m(pts[0]);
    const p1 = m(pts[1]);
    const p2 = m(pts[2]);
    const names = kind === "arm" ? ["shoulder", "elbow", "wrist"] : ["hip", "knee", "ankle"];
    const tag = kind === "arm" ? "F" : "H";

    const j0 = b.joint(names[0] + side, { at: p0, parent });
    const j1 = b.joint(names[1] + side, { at: p1, parent: j0 });
    const j2 = b.joint(names[2] + side, { at: p2, parent: j1 });

    b.sweep([p0, p1], 0.0105, { color: GREEN });
    b.sweep([p1, p2], 0.0085, { color: GREEN });
    b.part(ball(0.0115, 12), GREEN, { at: p1, bone: j1 });
    b.part(ball(0.0095, 10), GREEN, { at: p2, bone: j2 });

    // Zygodactyl foot: two digits over the top of the log, three round its side.
    const digits: [number, number][] = [
      [1.25, 0.004],
      [0.95, -0.004],
      [-0.45, 0.006],
      [-0.7, 0],
      [-0.92, -0.006],
    ];
    digits.forEach(([a, dz], i) => {
      const tip: V3 = [s * 0.036 * Math.cos(a), 0.03 + 0.036 * Math.sin(a), toeZ + dz];
      const dj = b.joint(`digit${tag}${side}${i}`, { at: tip, parent: j2 });
      b.sweep([p2, tip], 0.0042, { color: GREEN });
      b.part(ball(0.0052, 8), IVORY, { at: tip, bone: dj });
    });
  };

  const armPts: V3[] = [[0.03, 0.142, 0.07], [0.068, 0.11, 0.055], [0.04, 0.076, 0.085]];
  const legPts: V3[] = [[0.03, 0.14, -0.075], [0.07, 0.108, -0.045], [0.04, 0.076, -0.09]];
  limb("L", "arm", chest, armPts, 0.085);
  limb("R", "arm", chest, armPts, 0.085);
  limb("L", "leg", pelvis, legPts, -0.09);
  limb("R", "leg", pelvis, legPts, -0.09);

  // ---------- tail: a short root, then a spiral curled above the log ----------
  const tailPts: V3[] = [
    [0, 0.128, -0.12],
    [0, 0.102, -0.15],
  ];
  const SN = 12;
  for (let i = 0; i < SN; i++) {
    const f = i / (SN - 1);
    const phi = -0.85 + 5.6 * f;
    const R = 0.07 - 0.04 * f;
    tailPts.push([0, 0.135 + R * Math.sin(phi), -0.235 + R * Math.cos(phi)]);
  }
  const tailJoints: Joint[] = [];
  let prev: Joint = pelvis;
  tailPts.forEach((p, i) => {
    const j = b.joint(`tail${i}`, { at: p, parent: prev });
    tailJoints.push(j);
    prev = j;
  });
  const tailR = (k: number) =>
    k === 0 ? 0.0125 : k === 1 ? 0.0118 : 0.0105 - 0.005 * ((k - 2) / (SN - 2));
  for (let k = 0; k < tailPts.length - 1; k++) {
    const col = k === tailPts.length - 2 ? LIME : k % 2 ? BAND : GREEN;
    b.sweep([tailPts[k], tailPts[k + 1]], tailR(k), { color: col });
    b.part(ball(tailR(k) * 1.02, 10), col, { at: tailPts[k], bone: tailJoints[k] });
  }

  // ---------- tongue, flicked out through the mouth ----------
  const tg0 = b.joint("tongue0", { at: [0, 0.152, 0.2], parent: jaw });
  const tg1 = b.joint("tongue1", { at: [0, 0.149, 0.255], parent: tg0 });
  const tg2 = b.joint("tongue2", { at: [0, 0.146, 0.31], parent: tg1 });
  b.sweep([[0, 0.152, 0.165], [0, 0.152, 0.2]], 0.0085, { color: TONGUE });
  b.sweep([[0, 0.152, 0.2], [0, 0.149, 0.255]], 0.0075, { color: TONGUE });
  b.sweep([[0, 0.149, 0.255], [0, 0.146, 0.31]], 0.0062, { color: TONGUE });
  b.part(ball(0.0105, 12), TONGUE_TIP, { at: [0, 0.146, 0.318], bone: tg2 });

  return b.root;
}
```