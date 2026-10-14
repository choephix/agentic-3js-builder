import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Autumn hedgehog",
  description:
    "A plump chestnut hedgehog on an autumn evening walk, with a red maple leaf caught on its spines.",
};

type V = [number, number, number];

const PAL = {
  chestnut: "#7a4828",
  cream: "#f5e8cb",
  dark: "#4a2a18",
  fawn: "#d9a86a",
  earOuter: "#c48a56",
  pink: "#f0a2ae",
  nose: "#151010",
  eye: "#100b09",
  glint: "#ffffff",
  leaf: "#c2331f",
  vein: "#6e1610",
};

const BODY_C: V = [0, 0.086, -0.015];
const BODY_R: V = [0.08, 0.062, 0.09];
const HEAD_C: V = [0, 0.068, 0.085];
const HEAD_R = 0.046;
const SNOUT_C: V = [0, 0.066, 0.13];
const LEAF_C: V = [0, 0.158, -0.015];
const LEAF_YAW = 0.35;
const SPINE_COUNT = 560;

const unit = (v: V): V => {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
};

const onHead = (d: V): V => [
  HEAD_C[0] + HEAD_R * d[0],
  HEAD_C[1] + HEAD_R * d[1],
  HEAD_C[2] + HEAD_R * d[2],
];

const unitBall = (w: number, h: number) => new THREE.SphereGeometry(1, w, h);

const LEGS: { id: string; sh: V; ft: V }[] = [
  { id: "FL", sh: [0.046, 0.042, 0.02], ft: [0.048, 0.0105, 0.035] },
  { id: "FR", sh: [-0.046, 0.042, 0.02], ft: [-0.048, 0.0105, 0.035] },
  { id: "BL", sh: [0.046, 0.04, -0.08], ft: [0.048, 0.0105, -0.08] },
  { id: "BR", sh: [-0.046, 0.04, -0.08], ft: [-0.048, 0.0105, -0.08] },
];

export default function build() {
  const rand = rng(2024);
  const b = createBuilder({ name: "hedgehog" });

  // ---- skeleton ---------------------------------------------------------
  const body = b.joint("body", { at: BODY_C });
  const neck = b.joint("neck", { at: [0, 0.08, 0.06], parent: body });
  const head = b.joint("head", { at: HEAD_C, parent: neck });
  const snout = b.joint("snout", { at: SNOUT_C, parent: head });

  // ---- body: a chestnut dome over a dark skin, fawn belly -----------------
  const bodyPart = b.part(unitBall(22, 14), PAL.dark, {
    at: BODY_C,
    bone: body,
    scale: BODY_R,
  });
  b.part(unitBall(14, 10), PAL.fawn, {
    at: [0, 0.034, 0.004],
    bone: body,
    scale: [0.07, 0.024, 0.08],
  });

  // ---- spines: a golden-spiral dome of chestnut stalks with cream tips ----
  // Each direction leaves the body centre; the surface point is found on the
  // ellipsoid analytically, so the dome skips the face and the belly.
  const bodySurf = b.surface(bodyPart);
  const GOLDEN = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < SPINE_COUNT; i++) {
    const y = 1 - (2 * i + 1) / SPINE_COUNT;
    const ring = Math.sqrt(1 - y * y);
    const phi = i * GOLDEN;
    const d: V = [Math.cos(phi) * ring, y, Math.sin(phi) * ring];

    const k = 1 / Math.hypot(d[0] / BODY_R[0], d[1] / BODY_R[1], d[2] / BODY_R[2]);
    const px = BODY_C[0] + k * d[0];
    const py = BODY_C[1] + k * d[1];
    const pz = BODY_C[2] + k * d[2];
    if (py < BODY_C[1] - 0.012 || pz > 0.035) continue;

    const len = 0.026 + 0.012 * rand();
    const tx = (rand() - 0.5) * 0.7;
    const tz = (rand() - 0.5) * 0.7;

    const stalk = new THREE.CylinderGeometry(0.0042, 0.0058, len * 0.62, 5);
    stalk.translate(0, len * 0.31, 0);
    const tip = new THREE.CylinderGeometry(0.0006, 0.0042, len * 0.38, 5);
    tip.translate(0, len * 0.81, 0);
    for (const g of [stalk, tip]) {
      g.rotateX(tx);
      g.rotateZ(tz);
    }

    const hit = bodySurf.ray(BODY_C, d);
    b.stick(stalk, PAL.chestnut, hit);
    b.stick(tip, PAL.cream, hit);
  }

  // ---- head: fawn face, pointed twitchy snout, black nose -----------------
  const headPart = b.part(new THREE.SphereGeometry(HEAD_R, 16, 12), PAL.fawn, {
    at: HEAD_C,
    bone: head,
  });
  const headSurf = b.surface(headPart);

  const snoutGeo = new THREE.ConeGeometry(0.028, 0.075, 8);
  snoutGeo.rotateX(Math.PI / 2); // apex toward +Z
  const snoutPart = b.part(snoutGeo, PAL.fawn, { at: SNOUT_C, bone: snout });

  const snoutSurf = b.surface(snoutPart);
  const noseGeo = new THREE.SphereGeometry(0.0125, 12, 8);
  noseGeo.scale(1, 0.85, 1.05);
  const nose = b.stick(noseGeo, PAL.nose, snoutSurf.nearest([0, 0.066, 0.2]));
  b.stick(
    new THREE.SphereGeometry(0.0032, 8, 6),
    PAL.glint,
    b.surface(nose).ray([0, 0.066, 0.1675], unit([0.4, 0.8, 0.6])),
  );

  // Bright beady eyes, each with a small glint on its upper front.
  for (const s of [-1, 1]) {
    const d = unit([s * 0.77, 0.25, 0.6]);
    const eye = b.stick(
      new THREE.SphereGeometry(0.0125, 12, 9),
      PAL.eye,
      headSurf.ray(HEAD_C, d),
    );
    b.stick(
      new THREE.SphereGeometry(0.0036, 8, 6),
      PAL.glint,
      b.surface(eye).ray(onHead(d), unit([d[0] * 0.6, d[1] + 0.55, d[2] * 0.6])),
    );
  }

  // Tiny round ears: a fawn dome with a pink inner cap, on the head's sides.
  for (const s of [-1, 1]) {
    const hit = headSurf.ray(HEAD_C, unit([s * 0.8, 0.45, 0.2]));
    b.stick(
      new THREE.SphereGeometry(0.016, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      PAL.earOuter,
      hit,
    );
    const inner = new THREE.SphereGeometry(0.0102, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2);
    inner.translate(0, 0.0075, 0);
    b.stick(inner, PAL.pink, hit);
  }

  // ---- legs and little pink paws ----------------------------------------
  for (const L of LEGS) {
    const sh = b.joint(`shoulder${L.id}`, { at: L.sh, parent: body });
    const ft = b.joint(`foot${L.id}`, { at: L.ft, parent: sh });

    b.part(unitBall(10, 8), PAL.fawn, {
      at: [L.sh[0], 0.026, L.sh[2]],
      bone: sh,
      scale: [0.024, 0.026, 0.026],
    });
    b.part(unitBall(10, 8), PAL.pink, {
      at: L.ft,
      bone: ft,
      scale: [0.023, 0.0105, 0.027],
    });
    for (const o of [-0.0085, 0, 0.0085]) {
      b.part(unitBall(8, 6), PAL.pink, {
        at: [L.ft[0] + o, 0.0062, L.ft[2] + 0.02],
        bone: ft,
        scale: [0.0058, 0.0055, 0.0058],
      });
    }
  }

  // ---- the red maple leaf, lying on the spine tips -----------------------
  const cs = Math.cos(LEAF_YAW);
  const sn = Math.sin(LEAF_YAW);
  // Leaf plane: u along (cs,0,sn), v (leaf up) along (sn,0,-cs), normal +Y.
  const flat = new THREE.Matrix4().makeBasis(
    new THREE.Vector3(cs, 0, sn),
    new THREE.Vector3(sn, 0, -cs),
    new THREE.Vector3(0, 1, 0),
  );

  const deg = Math.PI / 180;
  const polar = (a: number, r: number) =>
    new THREE.Vector2(Math.cos(a * deg) * r, Math.sin(a * deg) * r);

  // Five pointed lobes with notches between them.
  const outline: THREE.Vector2[] = [];
  for (let k = 0; k < 5; k++) {
    const t = 18 + 72 * k;
    outline.push(polar(t - 36, 0.03), polar(t - 15, 0.05), polar(t, 0.077), polar(t + 15, 0.05));
  }

  const leafGeo = new THREE.ExtrudeGeometry(new THREE.Shape(outline), {
    depth: 0.006,
    bevelEnabled: false,
  });
  leafGeo.translate(0, 0, -0.003);
  leafGeo.applyMatrix4(flat);
  b.part(leafGeo, PAL.leaf, { at: LEAF_C, bone: body });

  // Veins: a midrib and four radial veins, raised slightly off the leaf.
  const vein = (p0: [number, number], p1: [number, number], w: number) => {
    const dx = p1[0] - p0[0];
    const dy = p1[1] - p0[1];
    const len = Math.hypot(dx, dy);
    const nx = (-dy / len) * (w / 2);
    const ny = (dx / len) * (w / 2);
    const shape = new THREE.Shape([
      new THREE.Vector2(p0[0] + nx, p0[1] + ny),
      new THREE.Vector2(p1[0] + nx, p1[1] + ny),
      new THREE.Vector2(p1[0] - nx, p1[1] - ny),
      new THREE.Vector2(p0[0] - nx, p0[1] - ny),
    ]);
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.002, bevelEnabled: false });
    g.translate(0, 0, 0.0025);
    return g.applyMatrix4(flat);
  };

  for (const t of [18, 90, 162, 234, 306]) {
    const tip = polar(t, 0.062);
    b.part(vein([0, 0], [tip.x, tip.y], 0.0038), PAL.vein, { at: LEAF_C, bone: body });
  }

  return b.root;
}
