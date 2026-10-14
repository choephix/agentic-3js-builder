import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Mossy Stone Deer Spirit",
  description:
    "A small forest spirit, part deer and part mossy river stone: a moss-capped stone body, slender wooden legs ending in hooves, a pale wooden mask face with glowing green eyes, flowering antlers and a few fireflies.",
};

type V = [number, number, number];
type Builder = ReturnType<typeof createBuilder>;
type Joint = ReturnType<Builder["joint"]>;

const COL = {
  stone: "#8d928b",
  stoneDark: "#5f655e",
  skull: "#3c4240",
  moss: "#4b8433",
  mossLight: "#7fbb4c",
  wood: "#b98d5a",
  woodDark: "#6e4c2e",
  antler: "#8f6d48",
  mask: "#eee3c9",
  eye: "#7dff55",
  eyeRing: "#2f5f23",
  nose: "#2c2620",
  flower: "#fbfbf2",
  flowerCore: "#f3c94f",
  leaf: "#5ea845",
  firefly: "#f2ff8a",
  hoof: "#3b2b1d",
};

interface Lump {
  sx: number;
  sy: number;
  sz: number;
  wob: number;
  ph: number;
  grow: number;
}

// Displacement depends only on position, so shared vertices agree and the stone stays closed.
function warp(x: number, y: number, z: number, q: Lump): THREE.Vector3 {
  const k =
    q.grow *
    (1 + q.wob * 0.5 * (Math.sin(x * 9 + q.ph) * Math.cos(y * 7 - q.ph) + Math.sin(z * 8 + y * 5)));
  return new THREE.Vector3(x * k * q.sx, y * k * q.sy, z * k * q.sz);
}

// Faceted river-stone lump, centred on the origin.
function rock(
  r: number,
  sx: number,
  sy: number,
  sz: number,
  o: { detail?: number; wob?: number; ph?: number } = {},
) {
  const g = new THREE.IcosahedronGeometry(r, o.detail ?? 1);
  const p = g.attributes.position as THREE.BufferAttribute;
  const q: Lump = { sx, sy, sz, wob: o.wob ?? 0.16, ph: o.ph ?? 0, grow: 1 };
  for (let i = 0; i < p.count; i++) {
    const v = warp(p.getX(i), p.getY(i), p.getZ(i), q);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

// A slightly larger shell of the same stone, keeping only its upper, ragged part: a moss cap.
function mossCap(
  r: number,
  sx: number,
  sy: number,
  sz: number,
  o: { ph: number; wob: number; cut: number; grow: number },
) {
  const g = new THREE.IcosahedronGeometry(r, 2);
  const p = g.attributes.position as THREE.BufferAttribute;
  const q: Lump = { sx, sy, sz, wob: o.wob, ph: o.ph, grow: o.grow };
  const keep: number[] = [];
  for (let t = 0; t < p.count; t += 3) {
    const vs = [0, 1, 2].map((k) => warp(p.getX(t + k), p.getY(t + k), p.getZ(t + k), q));
    const cx = (vs[0].x + vs[1].x + vs[2].x) / 3;
    const cy = (vs[0].y + vs[1].y + vs[2].y) / 3;
    const cz = (vs[0].z + vs[1].z + vs[2].z) / 3;
    const height = cy / (r * sy * o.grow);
    const ragged = 0.2 * Math.sin(cx * 23 + cz * 17) + 0.12 * Math.sin(cz * 31 - cx * 11);
    if (height + ragged > o.cut) for (const v of vs) keep.push(v.x, v.y, v.z);
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.Float32BufferAttribute(keep, 3));
  out.computeVertexNormals();
  return out;
}

// Pale wooden mask: a shield-shaped plate with two eye holes, extruded toward +Z.
function maskGeometry() {
  const edge: [number, number][] = [
    [0, 0.15],
    [0.07, 0.14],
    [0.1, 0.1],
    [0.1, 0.02],
    [0.08, -0.06],
    [0.045, -0.13],
    [0, -0.16],
  ];
  const shape = new THREE.Shape();
  shape.moveTo(edge[0][0], edge[0][1]);
  for (let i = 1; i < edge.length; i++) shape.lineTo(edge[i][0], edge[i][1]);
  for (let i = edge.length - 2; i >= 1; i--) shape.lineTo(-edge[i][0], edge[i][1]);
  shape.closePath();
  for (const ex of [-0.042, 0.042]) {
    const hole = new THREE.Path();
    hole.absarc(ex, 0.025, 0.03, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.008,
    bevelSegments: 1,
    curveSegments: 4,
  });
  g.translate(0, 0, -0.015);
  return g;
}

const mix = (p: V, q: V, t = 0.5): V => [
  p[0] + (q[0] - p[0]) * t,
  p[1] + (q[1] - p[1]) * t,
  p[2] + (q[2] - p[2]) * t,
];

// Tapered rigid segment on a bone: its +Y runs from a toward c.
function strut(b: Builder, a: V, c: V, rA: number, rB: number, color: string, bone: Joint) {
  const len = Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
  b.part(new THREE.CylinderGeometry(rB, rA, len, 6), color, { at: mix(a, c), aim: c, bone });
}

// Tiny white blossom with a yellow centre.
function bloom(b: Builder, at: V, bone: Joint) {
  b.part(new THREE.DodecahedronGeometry(0.014, 0), COL.flower, { at, bone });
  b.part(new THREE.SphereGeometry(0.006, 5, 4), COL.flowerCore, {
    at: [at[0], at[1] + 0.012, at[2]],
    bone,
  });
}

// Flat leaf: a squashed octahedron turned by yaw and roll.
function leaf(b: Builder, at: V, bone: Joint, yaw: number, roll: number) {
  const g = new THREE.OctahedronGeometry(0.036, 0);
  g.scale(0.5, 0.16, 1.4);
  g.rotateY(yaw);
  g.rotateZ(roll);
  b.part(g, COL.leaf, { at, bone });
}

// Point on the body ellipsoid (centre [0,1,0], radii 0.255 / 0.255 / 0.45).
function bodyPoint(dx: number, dy: number, dz: number, k = 0.97): V {
  const n = Math.hypot(dx, dy, dz);
  return [(dx / n) * 0.255 * k, 1 + (dy / n) * 0.255 * k, (dz / n) * 0.45 * k];
}

export default function build() {
  const b = createBuilder({ name: "forest-spirit" });
  const rand = rng(7);

  const NECK: V = [0, 1.1, 0.34];
  const HEAD: V = [0, 1.53, 0.62];
  const JAW: V = [0, 1.44, 0.7];

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 1.0, 0] });
  const tail = b.joint("tail", { at: [0, 1.06, -0.45], parent: hips });
  const neck = b.joint("neck", { at: NECK, parent: hips, aim: HEAD });
  const head = b.joint("head", { at: HEAD, parent: neck });
  const jaw = b.joint("jaw", { at: [0, 1.47, 0.6], parent: head, aim: JAW });

  // ---- body: river stone under a moss cap ----
  b.part(rock(0.3, 0.85, 0.85, 1.5, { detail: 1, wob: 0.16, ph: 0.4 }), COL.stone, {
    at: [0, 1.0, 0],
    bone: hips,
  });
  b.part(mossCap(0.3, 0.85, 0.85, 1.5, { ph: 0.4, wob: 0.16, cut: 0.15, grow: 1.1 }), COL.moss, {
    at: [0, 1.0, 0],
    bone: hips,
  });

  const tufts: { at: V; r: number; c: string }[] = [
    { at: bodyPoint(0.5, 1, 0.25, 0.98), r: 0.06, c: COL.mossLight },
    { at: bodyPoint(-0.55, 0.95, -0.2, 0.98), r: 0.05, c: COL.moss },
    { at: bodyPoint(0.15, 1, -0.6, 0.98), r: 0.055, c: COL.mossLight },
    { at: bodyPoint(-0.2, 1, 0.5, 0.98), r: 0.045, c: COL.moss },
    { at: bodyPoint(0.85, 0.5, -0.45, 0.98), r: 0.04, c: COL.mossLight },
    { at: bodyPoint(-0.85, 0.6, 0.15, 0.98), r: 0.04, c: COL.moss },
  ];
  tufts.forEach((t, i) =>
    b.part(rock(t.r, 1.15, 0.7, 1.05, { detail: 1, wob: 0.24, ph: i * 1.7 }), t.c, {
      at: t.at,
      bone: hips,
    }),
  );

  const pebbles: { at: V; r: number }[] = [
    { at: bodyPoint(0.9, -0.35, 0.25, 0.97), r: 0.05 },
    { at: bodyPoint(-0.95, -0.2, -0.2, 0.97), r: 0.045 },
    { at: bodyPoint(0.55, -0.8, -0.55, 0.97), r: 0.04 },
  ];
  pebbles.forEach((p, i) =>
    b.part(rock(p.r, 1, 0.8, 1.1, { detail: 1, wob: 0.2, ph: 5 + i }), COL.stoneDark, {
      at: p.at,
      bone: hips,
    }),
  );

  bloom(b, bodyPoint(0.35, 1, 0.2, 1.05), hips);
  bloom(b, bodyPoint(-0.5, 0.9, -0.35, 1.05), hips);

  b.part(rock(0.075, 1.0, 0.85, 1.1, { detail: 1, wob: 0.22, ph: 4 }), COL.mossLight, {
    at: [0, 1.1, -0.5],
    bone: tail,
  });

  // ---- neck: a stone column with moss tufts ----
  b.part(rock(0.1, 1.0, 2.5, 1.05, { detail: 1, wob: 0.14, ph: 1.3 }), COL.stone, {
    at: mix(NECK, HEAD),
    aim: HEAD,
    bone: neck,
  });
  b.part(rock(0.045, 1, 0.8, 1, { detail: 1, wob: 0.22, ph: 6 }), COL.mossLight, {
    at: [0.094, 1.3, 0.47],
    bone: neck,
  });
  b.part(rock(0.04, 1, 0.8, 1, { detail: 1, wob: 0.22, ph: 7 }), COL.moss, {
    at: [-0.092, 1.38, 0.55],
    bone: neck,
  });

  // ---- head: dark stone skull, pale wooden mask, glowing eyes ----
  b.part(rock(0.11, 0.95, 1.0, 1.25, { detail: 1, wob: 0.12, ph: 2.1 }), COL.skull, {
    at: HEAD,
    bone: head,
  });
  b.part(maskGeometry(), COL.mask, { at: [0, 1.53, 0.775], bone: head });

  for (const s of [1, -1]) {
    const ex = s * 0.042;
    b.part(new THREE.SphereGeometry(0.024, 8, 6), COL.eye, { at: [ex, 1.555, 0.78], bone: head });
    b.part(new THREE.TorusGeometry(0.033, 0.006, 4, 9), COL.eyeRing, {
      at: [ex, 1.555, 0.797],
      bone: head,
    });
  }

  b.part(new THREE.SphereGeometry(0.016, 6, 5), COL.nose, { at: [0, 1.39, 0.79], bone: head });

  // Lower jaw: its own bone so the mouth can open.
  b.part(rock(0.05, 0.9, 0.9, 1.3, { detail: 1, wob: 0.1, ph: 3 }), COL.mask, {
    at: JAW,
    bone: jaw,
  });

  // Leaf ears on the sides of the head.
  for (const s of [1, -1]) {
    const base: V = [s * 0.1, 1.55, 0.6];
    const tip: V = [s * 0.27, 1.62, 0.5];
    const g = new THREE.OctahedronGeometry(0.1, 0);
    g.scale(0.35, 1, 0.13);
    b.part(g, COL.leaf, { at: mix(base, tip), aim: tip, bone: head });
  }

  // ---- antlers: wooden beams with tines, blossoms and leaves ----
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const P = (x: number, y: number, z: number): V => [s * x, y, z];

    const bA = P(0.058, 1.63, 0.6);
    const mM = P(0.13, 1.8, 0.55);
    const tT = P(0.21, 1.98, 0.44);

    const aB = b.joint(`antlerBase${side}`, { at: bA, parent: head, aim: mM });
    const aM = b.joint(`antlerMid${side}`, { at: mM, parent: aB, aim: tT });
    const aT = b.joint(`antlerTip${side}`, { at: tT, parent: aM });

    strut(b, bA, mM, 0.024, 0.017, COL.antler, aB);
    strut(b, mM, tT, 0.017, 0.008, COL.antler, aM);
    strut(b, mM, P(0.23, 1.9, 0.66), 0.013, 0.006, COL.antler, aM);
    strut(b, mix(mM, tT), P(0.27, 2.11, 0.38), 0.012, 0.005, COL.antler, aM);

    bloom(b, P(0.1, 1.72, 0.59), aB);
    b.part(new THREE.OctahedronGeometry(0.001, 0), COL.leaf, { at: P(0, 0, 0), bone: aB });
    leaf(b, P(0.12, 1.75, 0.6), aB, rand() * Math.PI * 2, 0.4);
    bloom(b, P(0.16, 1.86, 0.52), aM);
    leaf(b, P(0.19, 1.92, 0.5), aM, rand() * Math.PI * 2, -0.5);
    bloom(b, P(0.215, 1.99, 0.43), aT);
    bloom(b, P(0.235, 1.92, 0.67), aM);
    bloom(b, P(0.275, 2.12, 0.38), aT);
    leaf(b, P(0.25, 2.02, 0.36), aT, rand() * Math.PI * 2, 0.9);
  }

  // ---- legs: slender wooden limbs with knee knobs and hooves ----
  const legSpec: { id: string; front: boolean; hip: V; mid: V; ankle: V }[] = [
    { id: "FL", front: true, hip: [0.15, 0.98, 0.26], mid: [0.16, 0.52, 0.28], ankle: [0.155, 0.075, 0.3] },
    { id: "FR", front: true, hip: [-0.15, 0.98, 0.26], mid: [-0.16, 0.52, 0.28], ankle: [-0.155, 0.075, 0.3] },
    { id: "BL", front: false, hip: [0.15, 0.98, -0.26], mid: [0.16, 0.5, -0.36], ankle: [0.155, 0.075, -0.32] },
    { id: "BR", front: false, hip: [-0.15, 0.98, -0.26], mid: [-0.16, 0.5, -0.36], ankle: [-0.155, 0.075, -0.32] },
  ];
  for (const L of legSpec) {
    const hipJ = b.joint(`hip${L.id}`, { at: L.hip, parent: hips, aim: L.mid });
    const midJ = b.joint(`${L.front ? "knee" : "hock"}${L.id}`, {
      at: L.mid,
      parent: hipJ,
      aim: L.ankle,
    });
    const ankleJ = b.joint(`ankle${L.id}`, { at: L.ankle, parent: midJ });

    strut(b, L.hip, L.mid, 0.03, 0.024, COL.wood, hipJ);
    strut(b, L.mid, L.ankle, 0.024, 0.018, COL.wood, midJ);
    b.part(new THREE.SphereGeometry(0.028, 7, 5), COL.woodDark, { at: L.mid, bone: midJ });
    b.part(new THREE.CylinderGeometry(0.028, 0.034, 0.08, 6), COL.hoof, {
      at: [L.ankle[0], 0.04, L.ankle[2]],
      bone: ankleJ,
    });
  }

  // ---- fireflies circling the head ----
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.35;
    const rr = 0.3 + rand() * 0.14;
    const at: V = [Math.cos(a) * rr, 1.56 + Math.sin(a * 2) * 0.12, 0.62 + Math.sin(a) * rr];
    b.part(new THREE.IcosahedronGeometry(0.016, 0), COL.firefly, { at, bone: hips });
  }

  return b.root;
}
