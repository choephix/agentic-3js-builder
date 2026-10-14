import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Great Horned Owl",
  description:
    "A great horned owl perched on a gnarled branch, with barred bark-brown plumage, a pale bib, tall ear tufts, a rimmed tawny facial disc, orange eyes and black talons.",
};

export default function build() {
  const b = createBuilder({ name: "great_horned_owl" });
  const R = rng(7);

  const C = {
    brown: "#6b4a2e", dark: "#2f2218", buff: "#c9a66b", tawny: "#c98d4e",
    cream: "#eadfc4", orange: "#f28c0f", black: "#111111", grey: "#7d8387",
    bark: "#5a4636", bark2: "#43352a", mid: "#8a6540",
  };

  // ---------- skeleton ----------
  const body = b.joint("body", { at: [0, 0.3, 0] });
  const spine2 = b.joint("spine2", { at: [0, 0.45, 0.03], parent: body });
  const neck = b.joint("neck", { at: [0, 0.52, 0.04], parent: spine2 });
  const head = b.joint("head", { at: [0, 0.56, 0.04], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.545, 0.1], parent: head });
  const tail1 = b.joint("tail1", { at: [0, 0.2, -0.12], parent: body });
  const tail2 = b.joint("tail2", { at: [0, 0.1, -0.2], parent: tail1 });
  const J: Record<string, THREE.Object3D> = {};
  const sides = [1, -1];
  for (const s of sides) {
    const n = s > 0 ? "L" : "R";
    const wing = b.joint("wing" + n, { at: [0.14 * s, 0.42, -0.02], parent: body });
    const wtip = b.joint("wingTip" + n, { at: [0.15 * s, 0.2, -0.1], parent: wing });
    const hip = b.joint("hip" + n, { at: [0.07 * s, 0.17, 0], parent: body });
    const knee = b.joint("ankle" + n, { at: [0.065 * s, 0.11, 0.0], parent: hip });
    const foot = b.joint("foot" + n, { at: [0.065 * s, 0.1, 0.0], parent: knee });
    J["wing" + n] = wing; J["wtip" + n] = wtip; J["hip" + n] = hip; J["foot" + n] = foot;
  }

  // ---------- helpers ----------
  const ell = (rx: number, ry: number, rz: number, color: string, at: number[], bone: any,
    rot: number[] = [0, 0, 0], seg = 10) => {
    const g = new THREE.SphereGeometry(1, seg, Math.max(6, seg - 3)).scale(rx, ry, rz);
    g.rotateX(rot[0]); g.rotateY(rot[1]); g.rotateZ(rot[2]);
    return b.part(g, color, { at: at as any, bone });
  };
  const box = (w: number, h: number, d: number, color: string, at: number[], bone: any,
    rot: number[] = [0, 0, 0]) => {
    const g = new THREE.BoxGeometry(w, h, d);
    g.rotateX(rot[0]); g.rotateY(rot[1]); g.rotateZ(rot[2]);
    return b.part(g, color, { at: at as any, bone });
  };
  const rod = (a: number[], c: number[], r0: number, r1: number, color: string, bone: any, seg = 6) => {
    const A = new THREE.Vector3(...(a as [number, number, number]));
    const B = new THREE.Vector3(...(c as [number, number, number]));
    const len = A.distanceTo(B);
    const g = new THREE.CylinderGeometry(r1, r0, len, seg);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
    g.applyQuaternion(q);
    const m = A.clone().add(B).multiplyScalar(0.5);
    return b.part(g, color, { at: [m.x, m.y, m.z] as any, bone });
  };
  const cone = (r: number, h: number, color: string, at: number[], bone: any, rot: number[], seg = 6) => {
    const g = new THREE.ConeGeometry(r, h, seg);
    g.rotateX(rot[0]); g.rotateY(rot[1]); g.rotateZ(rot[2]);
    return b.part(g, color, { at: at as any, bone });
  };

  // ---------- branch ----------
  const pts: number[][] = [
    [-0.7, 0.07, 0.03], [-0.4, 0.055, -0.02], [-0.15, 0.05, 0.01],
    [0.15, 0.05, 0.0], [0.4, 0.06, 0.03], [0.7, 0.09, -0.02],
  ];
  const radii = [0.03, 0.04, 0.047, 0.047, 0.04, 0.028];
  for (let i = 0; i < pts.length - 1; i++) {
    rod(pts[i], pts[i + 1], radii[i], radii[i + 1], i % 2 ? C.bark : C.bark2, body, 7);
  }
  for (let i = 0; i < pts.length; i++) {
    ell(radii[i] * 1.15, radii[i] * 1.1, radii[i] * 1.15, C.bark2, pts[i], body, [0, 0, 0], 7);
  }
  // knots and twigs
  ell(0.05, 0.05, 0.05, C.bark2, [-0.3, 0.09, 0.03], body, [0, 0, 0], 7);
  ell(0.04, 0.035, 0.04, C.bark, [0.3, 0.095, -0.02], body, [0, 0, 0], 7);
  rod([-0.4, 0.06, 0.0], [-0.55, 0.2, -0.06], 0.014, 0.006, C.bark, body);
  rod([-0.5, 0.15, -0.05], [-0.6, 0.27, 0.0], 0.008, 0.003, C.bark2, body, 5);
  rod([0.45, 0.06, 0.02], [0.58, 0.18, 0.1], 0.012, 0.005, C.bark, body);
  rod([0.55, 0.1, 0.0], [0.7, 0.04 + 0.05, 0.12], 0.01, 0.005, C.bark2, body, 5);
  rod([0.1, 0.02 + 0.03, 0.02], [0.2, 0.05, 0.12], 0.012, 0.006, C.bark2, body, 5);

  // ---------- torso ----------
  ell(0.17, 0.22, 0.15, C.brown, [0, 0.31, 0], body, [0.12, 0, 0], 12);
  ell(0.14, 0.12, 0.12, C.buff, [0, 0.42, 0.05], spine2, [0.1, 0, 0], 10);
  // pale bib
  ell(0.07, 0.07, 0.04, C.cream, [0, 0.49, 0.1], neck, [0.1, 0, 0], 8);
  ell(0.045, 0.04, 0.03, C.cream, [0, 0.455, 0.115], neck, [0, 0, 0], 7);
  // chest barring
  for (let row = 0; row < 9; row++) {
    const y = 0.21 + row * 0.027;
    const ry = 0.22, rx = 0.17, rz = 0.15;
    const ny = (y - 0.31) / ry;
    for (let col = -3; col <= 3; col++) {
      const x = col * 0.04 + (row % 2) * 0.02;
      const nx = x / rx;
      const t = 1 - nx * nx - ny * ny;
      if (t <= 0.08) continue;
      const z = rz * Math.sqrt(t) + 0.003 + 0.12 * (y - 0.31) * 0.2;
      if (y > 0.43 && Math.abs(x) < 0.06) continue;
      box(0.026, 0.008, 0.006, C.dark, [x, y, z + 0.004], body, [0, 0, (R() - 0.5) * 0.5]);
    }
  }
  // back mottling
  for (let i = 0; i < 40; i++) {
    const y = 0.17 + R() * 0.38;
    const x = (R() - 0.5) * 0.26;
    const nx = x / 0.17, ny = (y - 0.31) / 0.22;
    const t = 1 - nx * nx - ny * ny;
    if (t <= 0.1) continue;
    const z = -0.15 * Math.sqrt(t) - 0.002;
    ell(0.017 + R() * 0.014, 0.01, 0.006, R() > 0.5 ? C.dark : C.buff,
      [x, y, z], body, [0, 0, R() * 3], 5);
  }

  // ---------- head ----------
  ell(0.16, 0.115, 0.12, C.brown, [0, 0.58, 0.04], head, [0, 0, 0], 12);
  ell(0.1, 0.05, 0.08, C.buff, [0, 0.64, 0.02], head, [0, 0, 0], 8);
  for (const s of sides) {
    // facial disc
    ell(0.075, 0.08, 0.025, C.tawny, [0.07 * s, 0.58, 0.13], head, [0, 0.35 * s, 0], 10);
    const tg = new THREE.TorusGeometry(0.078, 0.007, 4, 14);
    tg.scale(1, 1.06, 1); tg.rotateY(0.35 * s);
    b.part(tg, C.black, { at: [0.07 * s, 0.58, 0.14] as any, bone: head });
    // dark flecks inside disc
    for (let k = 0; k < 5; k++) {
      const a = k * 1.25 + (s > 0 ? 0 : 0.5);
      box(0.014, 0.005, 0.004, C.dark,
        [s * (0.07 + Math.cos(a) * 0.05), 0.58 + Math.sin(a) * 0.05, 0.157], head, [0, 0, a]);
    }
    // eyes
    ell(0.034, 0.034, 0.03, C.orange, [0.053 * s, 0.595, 0.15], head, [0, 0, 0], 9);
    ell(0.018, 0.018, 0.012, C.black, [0.055 * s, 0.595, 0.18], head, [0, 0, 0], 6);
    // black eyelid ring and brow
    const eg = new THREE.TorusGeometry(0.034, 0.006, 4, 10);
    b.part(eg, C.black, { at: [0.053 * s, 0.595, 0.162] as any, bone: head });
    box(0.07, 0.014, 0.02, C.dark, [0.058 * s, 0.636, 0.145], head, [0, 0, -0.35 * s]);
    // white brow patch by beak
    ell(0.02, 0.03, 0.015, C.cream, [0.022 * s, 0.625, 0.16], head, [0, 0, 0.3 * s], 6);
    // ear tufts
    cone(0.03, 0.15, C.brown, [0.08 * s, 0.7, 0.03], head, [-0.1, 0, -0.25 * s], 6);
    cone(0.02, 0.07, C.dark, [0.098 * s, 0.775, 0.025], head, [-0.1, 0, -0.25 * s], 5);
    box(0.012, 0.09, 0.008, C.buff, [0.075 * s, 0.7, 0.062], head, [-0.1, 0, -0.25 * s]);
    // side ruff
    ell(0.03, 0.06, 0.04, C.buff, [0.15 * s, 0.54, 0.03], head, [0, 0, 0.2 * s], 6);
  }
  // beak
  cone(0.022, 0.06, C.grey, [0, 0.558, 0.175], head, [Math.PI / 2 + 0.75, 0, 0], 6);
  cone(0.009, 0.02, C.dark, [0, 0.52, 0.2], head, [Math.PI / 2 + 1.3, 0, 0], 5);
  // lower jaw
  box(0.032, 0.012, 0.05, C.grey, [0, 0.535, 0.16], jaw, [0.1, 0, 0]);
  box(0.03, 0.01, 0.02, C.dark, [0, 0.532, 0.188], jaw, [0.1, 0, 0]);
  // chin feathers
  ell(0.05, 0.03, 0.04, C.dark, [0, 0.515, 0.12], jaw, [0, 0, 0], 6);

  // ---------- wings ----------
  for (const s of sides) {
    const n = s > 0 ? "L" : "R";
    const w = J["wing" + n], wt = J["wtip" + n];
    ell(0.05, 0.19, 0.11, C.brown, [0.15 * s, 0.34, -0.03], w, [-0.15, 0, -0.04 * s], 10);
    ell(0.04, 0.1, 0.07, C.buff, [0.16 * s, 0.46, 0.0], w, [0, 0, 0], 7);
    ell(0.035, 0.1, 0.07, C.dark, [0.15 * s, 0.17, -0.1], wt, [-0.3, 0, 0], 7);
    for (let i = 0; i < 6; i++) {
      const y = 0.4 - i * 0.04;
      box(0.012, 0.01, 0.15 - i * 0.008, i % 2 ? C.dark : C.buff,
        [0.198 * s, y, -0.04 - i * 0.01], i < 3 ? w : wt, [-0.15, 0, 0]);
    }
    for (let i = 0; i < 5; i++) {
      ell(0.022, 0.012, 0.008, C.cream, [0.17 * s + (R() - 0.5) * 0.03, 0.42 - i * 0.05, 0.065 - i * 0.012], w, [0, 0, 0.5], 5);
    }
  }

  // ---------- tail ----------
  box(0.14, 0.24, 0.025, C.brown, [0, 0.14, -0.17], tail1, [-0.4, 0, 0]);
  for (let i = 0; i < 4; i++) {
    const y = 0.2 - i * 0.045;
    box(0.142, 0.014, 0.028, C.dark, [0, y, -0.145 - i * 0.025 - 0.0], i < 2 ? tail1 : tail2, [-0.4, 0, 0]);
  }
  box(0.14, 0.02, 0.03, C.buff, [0, 0.03 + 0.0, -0.265], tail2, [-0.4, 0, 0]);

  // ---------- legs & talons ----------
  for (const s of sides) {
    const n = s > 0 ? "L" : "R";
    const hip = J["hip" + n], foot = J["foot" + n];
    // feathered thigh/leg
    ell(0.05, 0.09, 0.05, C.buff, [0.07 * s, 0.17, 0.03], hip, [0, 0, 0], 8);
    rod([0.067 * s, 0.2, 0.03], [0.065 * s, 0.115, 0.01], 0.042, 0.032, C.buff, hip, 7);
    for (let i = 0; i < 4; i++) {
      box(0.075, 0.006, 0.006, C.dark, [0.067 * s, 0.17 - i * 0.022, 0.065 - i * 0.004], hip);
    }
    ell(0.04, 0.025, 0.04, C.cream, [0.065 * s, 0.115, 0.02], foot, [0, 0, 0], 6);
    // toes: three forward, one back
    const toes = [[-0.025, 0.1], [0, 0.115], [0.025, 0.1]];
    for (const [dx, reach] of toes) {
      const x0 = 0.065 * s;
      rod([x0, 0.105, 0.01], [x0 + dx * s, 0.1, reach * 0.55 + 0.02], 0.011, 0.009, C.dark, foot, 5);
      rod([x0 + dx * s, 0.1, reach * 0.55 + 0.02], [x0 + dx * s * 1.2, 0.07, reach * 0.55 + 0.045], 0.009, 0.007, C.dark, foot, 5);
      cone(0.009, 0.04, C.black, [x0 + dx * s * 1.25, 0.045, reach * 0.55 + 0.06], foot, [Math.PI + 0.3, 0, 0], 5);
    }
    rod([0.065 * s, 0.105, 0.0], [0.065 * s, 0.095, -0.055], 0.011, 0.009, C.dark, foot, 5);
    rod([0.065 * s, 0.095, -0.055], [0.065 * s, 0.065, -0.07], 0.009, 0.007, C.dark, foot, 5);
    cone(0.009, 0.04, C.black, [0.065 * s, 0.035, -0.07], foot, [Math.PI - 0.3, 0, 0], 5);
  }

  return b.root;
}
