```ts
import * as THREE from "three";
import { createBuilder, catmull } from "agentic-3js-builder";

type V = [number, number, number];

const BODY = "#e9a23b";
const BAND = "#b35a1f";
const SPOT = "#7a3414";
const TAIL = "#d9842c";
const FIN = "#f7e0a0";
const SPIKE = "#f2c46e";
const EYE = "#fff7e4";
const PUPIL = "#161616";
const MOUTH = "#4a2110";

// Trunk and neck: one cubic curve from the hips up to the head.
const P0: V = [0, 0.05, -0.02];
const P1: V = [0, 0.12, 0.0];
const P2: V = [0, 0.2, 0.05];
const P3: V = [0, 0.255, 0.075];

function cubic(t: number): V {
  const a = (1 - t) ** 3;
  const b = 3 * (1 - t) ** 2 * t;
  const c = 3 * (1 - t) * t * t;
  const d = t ** 3;
  return [0, 1, 2].map((i) => a * P0[i] + b * P1[i] + c * P2[i] + d * P3[i]) as V;
}

function cubicDir(t: number): V {
  const a = 3 * (1 - t) ** 2;
  const b = 6 * (1 - t) * t;
  const c = 3 * t * t;
  const d = [0, 1, 2].map(
    (i) => a * (P1[i] - P0[i]) + b * (P2[i] - P1[i]) + c * (P3[i] - P2[i]),
  );
  const n = Math.hypot(d[0], d[1], d[2]);
  return [d[0] / n, d[1] / n, d[2] / n];
}

// Arc-length table so that u in [0,1] is a fraction of the true length.
const TABLE = 240;
const arc: { t: number; s: number }[] = [{ t: 0, s: 0 }];
let total = 0;
for (let i = 1; i <= TABLE; i++) {
  const a = cubic((i - 1) / TABLE);
  const c = cubic(i / TABLE);
  total += Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
  arc.push({ t: i / TABLE, s: total });
}

function tAt(u: number): number {
  const target = Math.min(1, Math.max(0, u)) * total;
  let i = 1;
  while (i < arc.length - 1 && arc[i].s < target) i++;
  const p = arc[i - 1];
  const q = arc[i];
  const k = q.s === p.s ? 0 : (target - p.s) / (q.s - p.s);
  return p.t + (q.t - p.t) * k;
}

function spineAt(u: number): V {
  return cubic(tAt(u));
}

function spineDirAt(u: number): V {
  return cubicDir(tAt(u));
}

// Trunk thickness: full belly, narrowing to the neck.
const trunkR = (u: number) =>
  0.013 + 0.0085 * Math.sin(Math.PI * Math.min(1, u * 1.1));

// Turn a geometry built along +Y so its axis points along d.
function aimed(geo: THREE.BufferGeometry, d: V): THREE.BufferGeometry {
  const n = Math.hypot(d[0], d[1], d[2]);
  const x = d[0] / n;
  const y = d[1] / n;
  const z = d[2] / n;
  geo.rotateX(Math.asin(z));
  geo.rotateZ(Math.atan2(-x, y));
  return geo;
}

export const meta = {
  name: "Seahorse",
  description:
    "A stylized seahorse: banded armoured trunk, curled prehensile tail, fan fins, and a crown of coronet spikes.",
};

export default function build() {
  const b = createBuilder({ name: "seahorse" });

  // Spine: the trunk and neck share one smooth chain that the body sweeps along.
  const spinePts: V[] = [];
  for (let i = 0; i <= 8; i++) spinePts.push(spineAt(i / 8));
  const spine = b.chain("spine", catmull(spinePts));
  b.sweep(spine, trunkR, { color: BODY });

  // Curled prehensile tail: a spiral in the side plane, tapering to the tip.
  const tailPts: V[] = [];
  for (let i = 0; i <= 8; i++) {
    const s = i / 8;
    const th = 1.2 - 5.7 * s;
    const R = 0.046 - 0.03 * s;
    tailPts.push([0, 0.036 + R * Math.sin(th), -0.03 + R * Math.cos(th)]);
  }
  b.sweep(catmull(tailPts), (u: number) => 0.0085 - 0.0055 * u, { color: TAIL });

  // Bony armour bands, each tilted to follow the trunk.
  for (let i = 0; i < 11; i++) {
    const u = 0.05 + i * 0.088;
    const r = trunkR(u) + 0.0025;
    const h = i % 2 ? 0.007 : 0.011;
    const g = new THREE.CylinderGeometry(r, r * 1.04, h, 10, 1, false);
    aimed(g, spineDirAt(u));
    b.part(g, BAND, { at: spineAt(u) });
  }

  // Dark spots on the flanks, alternating sides.
  for (let i = 0; i < 14; i++) {
    const u = 0.04 + i * 0.07;
    const side = i % 2 ? 1 : -1;
    const c = spineAt(u);
    const r = trunkR(u);
    const g = new THREE.SphereGeometry(0.0035, 6, 5);
    g.scale(0.35, 1, 1);
    b.part(g, SPOT, { at: [c[0] + side * r * 0.95, c[1], c[2]] });
  }

  // Head: a long, slightly flattened skull.
  const headGeo = new THREE.SphereGeometry(0.026, 14, 10);
  headGeo.scale(0.95, 1.0, 1.2);
  b.part(headGeo, BODY, { at: [0, 0.255, 0.075] });

  // Snout: tapering tube leading forward and slightly down.
  b.sweep(
    catmull([
      [0, 0.258, 0.09],
      [0, 0.254, 0.13],
      [0, 0.25, 0.17],
    ]),
    (u: number) => 0.0095 - 0.0022 * u,
    { color: BODY },
  );

  // Dark mouth ring at the snout tip.
  const mouthGeo = new THREE.CylinderGeometry(0.0072, 0.0072, 0.004, 10);
  aimed(mouthGeo, [0, 0, 1]);
  b.part(mouthGeo, MOUTH, { at: [0, 0.25, 0.168] });

  // Turret eyes with pupils facing forward and out.
  for (const s of [1, -1]) {
    const eye = new THREE.SphereGeometry(0.0105, 10, 8);
    b.part(eye, EYE, { at: [s * 0.021, 0.262, 0.08] });
    const pupil = new THREE.SphereGeometry(0.0055, 8, 6);
    b.part(pupil, PUPIL, { at: [s * 0.0275, 0.263, 0.087] });
  }

  // Coronet: a crown of small spikes on top of the head.
  const spike = (base: V, dir: V, len: number, r: number, color: string) => {
    const g = new THREE.ConeGeometry(r, len, 6);
    g.translate(0, len / 2, 0);
    aimed(g, dir);
    b.part(g, color, { at: base });
  };
  spike([0, 0.27, 0.058], [0, 1, -0.2], 0.022, 0.005, SPIKE);
  spike([0.012, 0.266, 0.07], [0.4, 1, -0.1], 0.018, 0.0045, SPIKE);
  spike([-0.012, 0.266, 0.07], [-0.4, 1, -0.1], 0.018, 0.0045, SPIKE);

  // Fin outlines in the side plane, extruded thin and turned to lie along the body.
  const dorsal = new THREE.Shape();
  dorsal.moveTo(0, 0);
  dorsal.lineTo(0, 0.072);
  dorsal.quadraticCurveTo(0.02, 0.1, 0.04, 0.062);
  dorsal.quadraticCurveTo(0.034, 0.034, 0.024, 0.018);
  dorsal.quadraticCurveTo(0.012, 0.004, 0, 0);
  const dorsalGeo = new THREE.ExtrudeGeometry(dorsal, {
    depth: 0.004,
    bevelEnabled: false,
    curveSegments: 4,
  });
  dorsalGeo.translate(0, 0, -0.002);
  dorsalGeo.rotateY(Math.PI / 2);
  b.part(dorsalGeo, FIN, { at: [0, 0.12, -0.006] });

  const fanShape = () => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(0, 0.03);
    s.quadraticCurveTo(0.02, 0.05, 0.036, 0.03);
    s.quadraticCurveTo(0.04, 0.01, 0.026, -0.004);
    s.lineTo(0, 0);
    return s;
  };
  for (const s of [1, -1]) {
    const g = new THREE.ExtrudeGeometry(fanShape(), {
      depth: 0.004,
      bevelEnabled: false,
      curveSegments: 4,
    });
    g.translate(0, 0, -0.002);
    g.rotateY(Math.PI / 2);
    b.part(g, FIN, { at: [s * 0.0215, 0.115, 0.004] });
  }

  return b.root;
}
```