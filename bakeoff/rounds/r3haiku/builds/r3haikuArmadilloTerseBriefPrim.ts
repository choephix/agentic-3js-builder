import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "armadillo",
  description:
    "A nine-banded armadillo: a domed, banded shell over a pale belly, a long snout with a movable jaw, stubby digging legs with claws, and a ringed tail.",
};

type V = [number, number, number];
type Builder = ReturnType<typeof createBuilder>;
type Joint = ReturnType<Builder["joint"]>;

const SHELL = "#a9825c";
const BAND = "#6b4d35";
const SCUTE = "#d8b98f";
const BELLY = "#ead2aa";
const SNOUT = "#c99a80";
const EAR = "#e3a08c";
const LEG = "#7a5a42";
const PAD = "#4f3a2d";
const CLAW = "#efe4cc";
const EYE = "#171210";
const NOSE = "#3b2a25";

// Carapace: a dome centred on the body joint.
const SH = { cy: 0.2, rx: 0.13, ry: 0.1, rz: 0.2 };

const sub = (a: V, c: V): V => [a[0] - c[0], a[1] - c[1], a[2] - c[2]];
const lerp3 = (a: V, c: V, t: number): V => [
  a[0] + (c[0] - a[0]) * t,
  a[1] + (c[1] - a[1]) * t,
  a[2] + (c[2] - a[2]) * t,
];
function unit(v: V): V {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}
function ellipsoid(rx: number, ry: number, rz: number, w: number, h: number) {
  const g = new THREE.SphereGeometry(1, w, h);
  g.scale(rx, ry, rz);
  return g;
}

/** Tapered cylinder from a (radius ra) to c (radius rc), oriented along the segment. */
function link(b: Builder, a: V, c: V, ra: number, rc: number, color: string, bone: Joint) {
  const d = sub(c, a);
  const len = Math.hypot(d[0], d[1], d[2]);
  const geo = new THREE.CylinderGeometry(rc, ra, len, 10, 1);
  b.part(geo, color, { at: lerp3(a, c, 0.5), bone, dir: unit(d) });
}

/** Point on the top of the carapace above (x, z), with its outward normal. */
function shellPoint(x: number, z: number): { p: V; n: V } | null {
  const q = 1 - (x / SH.rx) ** 2 - (z / SH.rz) ** 2;
  if (q <= 0.15) return null;
  const y = SH.cy + SH.ry * Math.sqrt(q);
  const n = unit([x / (SH.rx * SH.rx), (y - SH.cy) / (SH.ry * SH.ry), z / (SH.rz * SH.rz)]);
  return { p: [x, y, z], n };
}

export default function build() {
  const b = createBuilder({ name: "armadillo" });
  const r = rng(11);

  // ---- Skeleton -----------------------------------------------------------
  const body = b.joint("body", { at: [0, SH.cy, 0] });
  const head = b.joint("head", { at: [0, 0.2, 0.27], parent: body });
  const jaw = b.joint("jaw", { at: [0, 0.165, 0.3], parent: head });
  const earL = b.joint("earL", { at: [0.05, 0.24, 0.2], parent: head });
  const earR = b.joint("earR", { at: [-0.05, 0.24, 0.2], parent: head });

  // Legs: fore and hind, left (+X) and right (-X).
  for (const side of [1, -1] as const) {
    const L = side > 0 ? "L" : "R";
    const X = side * 0.085;

    const fore = b.joint(`fore${L}`, { at: [X, 0.13, 0.14], parent: body });
    const paw = b.joint(`paw${L}`, { at: [X + side * 0.005, 0.03, 0.165], parent: fore });
    link(b, [X, 0.13, 0.14], [X + side * 0.005, 0.03, 0.165], 0.024, 0.018, LEG, fore);
    b.part(ellipsoid(0.03, 0.018, 0.035, 12, 8), PAD, { at: [X, 0.02, 0.165], bone: paw });
    for (const dx of [-0.014, 0, 0.014]) {
      link(b, [X + dx, 0.024, 0.18], [X + dx, 0.008, 0.214], 0.008, 0.002, CLAW, paw);
    }

    const hip = b.joint(`hip${L}`, { at: [X, 0.13, -0.12], parent: body });
    const ankle = b.joint(`ankle${L}`, { at: [X, 0.03, -0.125], parent: hip });
    link(b, [X, 0.13, -0.12], [X, 0.03, -0.125], 0.028, 0.02, LEG, hip);
    b.part(ellipsoid(0.034, 0.02, 0.04, 12, 8), PAD, { at: [X, 0.02, -0.125], bone: ankle });
  }

  // Tail: four joints along a drooping curve, built as ringed segments.
  const tailPt = (t: number): V => [0, 0.2 - 0.16 * t * t, -0.17 - 0.34 * t];
  const tailJoints: Joint[] = [];
  let prev: Joint = body;
  for (let i = 0; i < 4; i++) {
    const p = tailPt(i / 3);
    const j = b.joint(`tail${i + 1}`, { at: p, parent: prev });
    tailJoints.push(j);
    prev = j;
  }
  const tailR = (t: number) => 0.036 - 0.024 * t;
  const P: V[] = [];
  for (let i = 0; i <= 8; i++) P.push(tailPt(i / 8));

  // ---- Carapace -----------------------------------------------------------
  // Top half of an ellipsoid; the open lower rim is tucked under the belly.
  const shell = new THREE.SphereGeometry(1, 26, 14, 0, Math.PI * 2, 0, Math.PI * 0.57);
  shell.scale(SH.rx, SH.ry, SH.rz);
  b.part(shell, SHELL, { at: [0, SH.cy, 0], bone: body });

  b.part(ellipsoid(0.124, 0.07, 0.19, 14, 9), BELLY, { at: [0, 0.158, 0], bone: body });

  // Nine dark bands across the middle of the shell, each following the dome.
  const bandZ = [0.06, 0.04, 0.02, 0, -0.02, -0.04, -0.06, -0.08, -0.1];
  for (const z of bandZ) {
    const s = Math.sqrt(1 - (z / SH.rz) ** 2);
    const g = new THREE.TorusGeometry(1, 0.05, 5, 30, Math.PI + 0.3);
    g.rotateZ(-0.15);
    g.scale(SH.rx * s, SH.ry * s, 0.1);
    b.part(g, BAND, { at: [0, SH.cy, z], bone: body });
  }

  // Hexagonal scutes on the shoulder shield and the hip shield.
  const shieldZones: [number, number][] = [
    [0.085, 0.185],
    [-0.19, -0.115],
  ];
  for (const [z0, z1] of shieldZones) {
    let row = 0;
    for (let z = z0; z <= z1 + 1e-9; z += 0.0185) {
      const off = row % 2 ? 0.009 : 0;
      for (let x = -0.12 + off; x <= 0.12; x += 0.018) {
        const s = shellPoint(x + (r() - 0.5) * 0.002, z);
        if (!s) continue;
        const [px, py, pz] = s.p;
        const n = s.n;
        b.part(new THREE.CylinderGeometry(0.0065, 0.0075, 0.005, 6, 1), SCUTE, {
          at: [px + n[0] * 0.002, py + n[1] * 0.002, pz + n[2] * 0.002],
          bone: body,
          dir: n,
        });
      }
      row++;
    }
  }

  // ---- Head ---------------------------------------------------------------
  b.part(ellipsoid(0.085, 0.065, 0.1, 16, 10), SHELL, { at: [0, 0.205, 0.27], bone: head });
  // Tapering snout with a small nose.
  link(b, [0, 0.2, 0.3], [0, 0.18, 0.44], 0.05, 0.032, SNOUT, head);
  b.part(ellipsoid(0.034, 0.026, 0.02, 10, 8), NOSE, { at: [0, 0.182, 0.45], bone: head });
  // Lower jaw hangs from the jaw joint so the mouth can open.
  link(b, [0, 0.165, 0.3], [0, 0.155, 0.42], 0.03, 0.022, SNOUT, jaw);

  // Tiny eyes set in the shield.
  for (const side of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.013, 10, 8), EYE, {
      at: [side * 0.062, 0.232, 0.32],
      bone: head,
    });
  }

  // Large, short ears standing up from the shield.
  link(b, [0.05, 0.24, 0.2], [0.068, 0.31, 0.19], 0.028, 0.01, EAR, earL);
  link(b, [-0.05, 0.24, 0.2], [-0.068, 0.31, 0.19], 0.028, 0.01, EAR, earR);

  // ---- Tail ---------------------------------------------------------------
  for (let i = 0; i < 8; i++) {
    const bone = tailJoints[Math.min(3, Math.round(((i + 0.5) / 8) * 3))];
    link(b, P[i], P[i + 1], tailR(i / 8), tailR((i + 1) / 8), SHELL, bone);
  }
  for (let i = 1; i <= 8; i++) {
    if (i % 2 === 0) continue;
    const bone = tailJoints[Math.min(3, Math.round((i / 8) * 3))];
    const t = unit(sub(P[Math.min(8, i + 1)], P[i - 1]));
    const g = new THREE.TorusGeometry(tailR(i / 8) * 1.1, 0.0045, 5, 14);
    g.rotateX(Math.PI / 2);
    b.part(g, BAND, { at: P[i], bone, dir: t });
  }

  return b.root;
}
