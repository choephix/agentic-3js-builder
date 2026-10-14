```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Red-eyed tree frog on a leaf",
  description:
    "Lime-green tree frog with huge ruby eyes, blue and cream flank stripes, orange toes with sticky pads, clinging to a leaf. Rigged with spine, jaw, arms and legs.",
};

export default function build() {
  const b = createBuilder({ name: "treefrog" });

  // ---------- palette ----------
  const LIME = "#7ddc2a";
  const LIME_D = "#5fbf22";
  const CREAM = "#fff4d0";
  const BLUE = "#2f6fe0";
  const ORANGE = "#ff8a1c";
  const PAD = "#ffb347";
  const RED = "#d3122a";
  const BLACK = "#0b0b10";
  const LEAF = "#2e8a3c";
  const LEAF_L = "#58b14f";

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.0175, -0.014], role: "spine" } as any);
  const chest = b.joint("chest", { at: [0, 0.0185, 0.01], parent: hips, role: "spine" } as any);
  const neck = b.joint("neck", { at: [0, 0.02, 0.02], parent: chest, role: "neck" } as any);
  const head = b.joint("head", { at: [0, 0.0225, 0.026], parent: neck, role: "head" } as any);
  const jaw = b.joint("jaw", { at: [0, 0.0225, 0.0385], parent: head, role: "jaw" } as any);
  const leafJ = b.joint("leaf", { at: [0, 0.002, 0], parent: hips } as any);

  // ---------- geometry helpers ----------
  const Y = new THREE.Vector3(0, 1, 0);
  const add = (geo: THREE.BufferGeometry, color: string, bone: any) =>
    b.part(geo, color, { at: [0, 0, 0], bone } as any);

  const ell = (
    color: string, bone: any,
    c: number[], r: number[],
    rot: number[] = [0, 0, 0], seg = 10
  ) => {
    const g = new THREE.SphereGeometry(1, seg, Math.max(5, seg - 3));
    g.scale(r[0], r[1], r[2]);
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0], rot[1], rot[2])));
    g.translate(c[0], c[1], c[2]);
    return add(g, color, bone);
  };

  const seg = (
    a: number[], c: number[], r1: number, r2: number,
    color: string, bone: any, sides = 7
  ) => {
    const A = new THREE.Vector3(...a), C = new THREE.Vector3(...c);
    const d = C.clone().sub(A);
    const len = d.length();
    const g = new THREE.CylinderGeometry(r2, r1, len, sides, 1);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(Y, d.clone().normalize()));
    const m = A.clone().add(C).multiplyScalar(0.5);
    g.translate(m.x, m.y, m.z);
    return add(g, color, bone);
  };

  // ---------- body ----------
  const BC = [0, 0.0175, -0.002];
  const BR = [0.017, 0.0125, 0.025];
  ell(LIME, hips, BC, BR, [0, 0, 0], 12);
  // rump
  ell(LIME, hips, [0, 0.0165, -0.017], [0.0165, 0.011, 0.013], [0, 0, 0], 10);
  // belly and chest (cream)
  ell(CREAM, chest, [0, 0.0135, 0.004], [0.0135, 0.0095, 0.021], [0, 0, 0], 10);
  // darker back saddle
  ell(LIME_D, hips, [0, 0.0265, -0.006], [0.009, 0.003, 0.013], [0, 0, 0], 8);

  // flank stripes (blue band with cream edges)
  const surfX = (zi: number, dy: number) => {
    const t = 1 - (zi / BR[2]) ** 2 - (dy / BR[1]) ** 2;
    return BR[0] * Math.sqrt(Math.max(0, t));
  };
  const stripes: [number, string, number][] = [
    [-0.0055, CREAM, 0.0013],
    [0.0005, BLUE, 0.0034],
    [0.0068, CREAM, 0.0013],
  ];
  for (const s of [1, -1]) {
    for (const [dy, col, th] of stripes) {
      for (let zi = -0.016; zi <= 0.0121; zi += 0.0042) {
        const x = surfX(zi, dy) - 0.0006;
        ell(col, hips, [s * x, BC[1] + dy, BC[2] + zi], [0.0013, th, 0.0028], [0, s * -0.25 * (zi / 0.02), 0], 6);
      }
    }
  }

  // ---------- head ----------
  ell(LIME, head, [0, 0.0235, 0.026], [0.0165, 0.0085, 0.0145], [0, 0, 0], 12);
  // snout
  ell(LIME, head, [0, 0.0225, 0.034], [0.0115, 0.006, 0.0085], [0, 0, 0], 10);
  // lower jaw
  ell(CREAM, jaw, [0, 0.0205, 0.033], [0.0105, 0.0032, 0.0095], [0, 0, 0], 10);
  // throat
  ell(CREAM, neck, [0, 0.0175, 0.022], [0.009, 0.005, 0.01], [0, 0, 0], 8);
  // nostrils
  for (const s of [1, -1]) {
    ell(BLACK, head, [s * 0.003, 0.0255, 0.0415], [0.0007, 0.0007, 0.0007], [0, 0, 0], 5);
  }

  // eyes
  const ER = 0.0087;
  for (const s of [1, -1]) {
    const ec = [s * 0.0112, 0.0318, 0.0285];
    ell(RED, head, ec, [ER, ER, ER], [0, 0, 0], 12);
    // glossy orange inner ring
    const dir = new THREE.Vector3(s * 0.5, 0.1, 0.86).normalize();
    const yaw = Math.atan2(dir.x, dir.z);
    ell("#ff5a1a", head,
      [ec[0] + dir.x * ER * 0.93, ec[1] + dir.y * ER * 0.93, ec[2] + dir.z * ER * 0.93],
      [0.0055, 0.0055, 0.0018], [0, yaw, 0], 9);
    // slit pupil
    ell(BLACK, head,
      [ec[0] + dir.x * ER * 1.0, ec[1] + dir.y * ER * 1.0, ec[2] + dir.z * ER * 1.0],
      [0.0009, 0.0052, 0.0012], [0, yaw, 0], 6);
    // raised eyelid cap (surprised)
    const g = new THREE.SphereGeometry(ER * 1.06, 10, 4, 0, Math.PI * 2, 0, Math.PI * 0.33);
    g.rotateX(0.25);
    g.rotateZ(-s * 0.15);
    g.translate(ec[0], ec[1] + 0.0004, ec[2]);
    add(g, LIME, head);
  }

  // ---------- legs ----------
  const toeFan = (
    root: any, base: number[], side: number, prefix: string, n: number,
    len: number, y: number, spread: number
  ) => {
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : i / (n - 1) - 0.5;
      const ang = t * spread + side * 0.18; // yaw from +Z, outward positive for left
      const dx = Math.sin(ang), dz = Math.cos(ang);
      const tj = b.joint(`${prefix}${i + 1}`, {
        at: [base[0], y, base[2]], parent: root, role: "digit",
      } as any);
      const tip = [base[0] + dx * len, y, base[2] + dz * len];
      const mid = [base[0] + dx * len * 0.5, y, base[2] + dz * len * 0.5];
      seg([base[0], y, base[2]], tip, 0.0022, 0.0017, ORANGE, tj, 6);
      ell(PAD, tj, [tip[0], y + 0.0004, tip[2]], [0.0036, 0.0017, 0.0036], [0, 0, 0], 8);
      ell(ORANGE, tj, [mid[0], y + 0.0003, mid[2]], [0.0021, 0.0019, 0.0021], [0, 0, 0], 5);
    }
  };

  for (const s of [1, -1]) {
    const L = s === 1 ? "L" : "R";

    // hind leg
    const hipP = [s * 0.0135, 0.0155, -0.02];
    const kneeP = [s * 0.0345, 0.0085, -0.034];
    const ankP = [s * 0.0405, 0.0058, -0.0085];
    const hipJ = b.joint(`hip${L}`, { at: hipP, parent: hips, role: "leg" } as any);
    const kneeJ = b.joint(`knee${L}`, { at: kneeP, parent: hipJ, role: "leg" } as any);
    const ankJ = b.joint(`ankle${L}`, { at: ankP, parent: kneeJ, role: "leg" } as any);
    ell(LIME, hipJ, hipP, [0.0075, 0.0075, 0.0085], [0, 0, 0], 8);
    seg(hipP, kneeP, 0.0068, 0.0042, LIME, hipJ);
    ell(LIME, kneeJ, kneeP, [0.0042, 0.0042, 0.0042], [0, 0, 0], 6);
    seg(kneeP, ankP, 0.004, 0.0028, LIME, kneeJ);
    // blue patch on thigh/shin
    ell(BLUE, hipJ, [(hipP[0] + kneeP[0]) / 2 + s * 0.0022, 0.012, (hipP[2] + kneeP[2]) / 2], [0.0018, 0.0028, 0.007], [0, Math.atan2(kneeP[0] - hipP[0], kneeP[2] - hipP[2]) * 0 + s * 0.5, 0], 6);
    ell(BLUE, kneeJ, [(kneeP[0] + ankP[0]) / 2 + s * 0.002, 0.0072, (kneeP[2] + ankP[2]) / 2], [0.0016, 0.0022, 0.0075], [0, -s * 0.25, 0], 6);
    // foot
    ell(ORANGE, ankJ, [ankP[0], 0.0052, ankP[2] + 0.003], [0.0035, 0.002, 0.0055], [0, 0, 0], 6);
    toeFan(ankJ, [ankP[0], 0, ankP[2] + 0.007], s, `toe${L}`, 4, 0.0135, 0.0058, 0.9);
  }

  // front arms
  for (const s of [1, -1]) {
    const L = s === 1 ? "L" : "R";
    const shP = [s * 0.0125, 0.0155, 0.012];
    const elP = [s * 0.0245, 0.0095, 0.0185];
    const wrP = [s * 0.0285, 0.0058, 0.0325];
    const shJ = b.joint(`shoulder${L}`, { at: shP, parent: chest, role: "arm" } as any);
    const elJ = b.joint(`elbow${L}`, { at: elP, parent: shJ, role: "arm" } as any);
    const wrJ = b.joint(`wrist${L}`, { at: wrP, parent: elJ, role: "arm" } as any);
    ell(LIME, shJ, shP, [0.0055, 0.0055, 0.0055], [0, 0, 0], 7);
    seg(shP, elP, 0.0048, 0.0034, LIME, shJ);
    ell(LIME, elJ, elP, [0.0035, 0.0035, 0.0035], [0, 0, 0], 6);
    seg(elP, wrP, 0.0033, 0.0026, LIME, elJ);
    ell(ORANGE, wrJ, [wrP[0], 0.0052, wrP[2] + 0.001], [0.0033, 0.002, 0.0035], [0, 0, 0], 6);
    toeFan(wrJ, [wrP[0], 0, wrP[2] + 0.003], s, `finger${L}`, 4, 0.0095, 0.0057, 1.0);
  }

  // ---------- leaf ----------
  const sh = new THREE.Shape();
  sh.moveTo(0, -0.075);
  sh.bezierCurveTo(0.03, -0.06, 0.06, -0.02, 0.05, 0.02);
  sh.bezierCurveTo(0.042, 0.06, 0.015, 0.085, 0, 0.115);
  sh.bezierCurveTo(-0.015, 0.085, -0.042, 0.06, -0.05, 0.02);
  sh.bezierCurveTo(-0.06, -0.02, -0.03, -0.06, 0, -0.075);
  const lg = new THREE.ExtrudeGeometry(sh, { depth: 0.004, bevelEnabled: false, curveSegments: 8 });
  lg.rotateX(-Math.PI / 2); // shape y -> -z, depth -> +y
  lg.scale(1, 1, -1); // keep tip toward +z, flip winding
  lg.translate(0, 0, 0);
  const lgFixed = lg.clone();
  // flip winding after mirror
  const idx = lgFixed.index;
  if (idx) {
    for (let i = 0; i < idx.count; i += 3) {
      const a = idx.getX(i + 1), c = idx.getX(i + 2);
      idx.setX(i + 1, c); idx.setX(i + 2, a);
    }
  } else {
    const pos = lgFixed.getAttribute("position");
    for (let i = 0; i < pos.count; i += 3) {
      const x = pos.getX(i + 1), y = pos.getY(i + 1), z = pos.getZ(i + 1);
      pos.setXYZ(i + 1, pos.getX(i + 2), pos.getY(i + 2), pos.getZ(i + 2));
      pos.setXYZ(i + 2, x, y, z);
    }
  }
  lgFixed.computeVertexNormals();
  add(lgFixed, LEAF, leafJ);

  // midrib and veins
  const rib = new THREE.BoxGeometry(0.004, 0.0012, 0.185);
  rib.translate(0, 0.0043, 0.02);
  add(rib, LEAF_L, leafJ);
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      const z = -0.05 + i * 0.028;
      const v = new THREE.BoxGeometry(0.032, 0.001, 0.0022);
      v.rotateY(s * 0.6);
      v.translate(s * 0.016, 0.0042, z + 0.008);
      add(v, LEAF_L, leafJ);
    }
  }
  // stem
  seg([0, 0.002, -0.07], [0, 0.0025, -0.12], 0.003, 0.002, "#3d7a2b", leafJ, 6);

  return b.root;
}
```