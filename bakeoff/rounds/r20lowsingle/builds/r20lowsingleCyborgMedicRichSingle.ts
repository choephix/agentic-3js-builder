import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { catmull, polyline } from "../../../../src/path";
import { countershade, paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cyborg Medic",
  description:
    "Support-hero cyborg medic: white armour with one teal accent, a mechanical left arm and leg, a half-cyber face, a medi-pack and a winged healing staff planted on the floor.",
  style: "Overwatch",
  commit: "88fc1f0",
};

type V = [number, number, number];
type Col = string | Paint;

const WHITE = "#eef2f6";
const WHITE_S = "#bcc7d6";
const SUIT_D = "#1f2530";
const METAL = "#8993a3";
const METAL_D = "#4a5260";
const ACC = "#19e0b4";
const SKIN_D = "#8a553a";
const HAIR = "#2b2433";

const WHITEP = countershade(WHITE, WHITE_S, { level: -0.15, soft: 0.5 });
const SUITP = paint((p, n) =>
  Math.abs(((p.y * 22) % 1) - 0.5) < 0.025 ? SUIT_D : n.y > 0 ? "#3d485c" : "#2a3240",
);
const METALP = countershade(METAL, METAL_D, { level: -0.1, soft: 0.6 });
const SKINP = countershade("#b0714f", SKIN_D, { level: -0.2, soft: 0.6 });

const SX = -0.69; // staff x
const SZ = 0.23; // staff z

export default function build() {
  const b = createBuilder({ name: "cyborgMedic" });

  // ---------------------------------------------------------------- helpers
  const J = (c: { joints: Joint[] }, i: number): Joint => c.joints[i] as Joint;
  const vecOf = (v: V | THREE.Vector3) => (v instanceof THREE.Vector3 ? v.clone() : new THREE.Vector3(v[0], v[1], v[2]));
  const box = (w: number, h: number, d: number, color: Col, at: V | THREE.Vector3, bone: Joint, o: PartOptions = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, bone, ...o });
  const ell = (rx: number, ry: number, rz: number, color: Col, at: V | THREE.Vector3, bone: Joint, o: PartOptions = {}) =>
    b.part(new THREE.SphereGeometry(1, 10, 7), color, { at, bone, scale: [rx, ry, rz], ...o });
  const cyl = (rt: number, rb: number, h: number, color: Col, at: V | THREE.Vector3, bone: Joint, o: PartOptions = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, 10), color, { at, bone, ...o });
  const plate = (
    pts: OutlinePoint[],
    at: V,
    x: V,
    thick: number,
    color: Col,
    bone: Joint,
    o: { bevel?: number; smoothing?: number } = {},
  ) => b.extrude(pts, { at, x, thickness: thick, bevel: o.bevel ?? 0.006, smoothing: o.smoothing, color, bone });
  const band = (c: V | THREE.Vector3, d: V | THREE.Vector3, r: number, tr: number, color: Col, bone: Joint) => {
    const dd = vecOf(d).normalize();
    const u = new THREE.Vector3(1, 0, 0);
    if (Math.abs(dd.x) > 0.9) u.set(0, 0, 1);
    u.sub(dd.clone().multiplyScalar(u.dot(dd))).normalize();
    const w = dd.clone().cross(u);
    const cc = vecOf(c);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      pts.push(cc.clone().addScaledVector(u, r * Math.cos(a)).addScaledVector(w, r * Math.sin(a)));
    }
    return b.sweep(catmull(pts, { closed: true }), tr, { color, bone, sides: 6 });
  };
  const ellRing = (cy: number, rx: number, rz: number, slope: number, r: number, color: Col, bone: Joint, cz = 0) => {
    const pts: V[] = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      pts.push([rx * Math.cos(a), cy + slope * Math.cos(a), cz + rz * Math.sin(a)]);
    }
    return b.sweep(catmull(pts, { closed: true }), r, { color, bone, sides: 6 });
  };

  // ---------------------------------------------------------------- textures
  const eyeOrg = svg(
    `<svg viewBox="0 0 40 24">
      <path d="M3 5 Q20 0 37 6" stroke="#241a22" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M4 17 Q20 6 36 17 Q20 24 4 17Z" fill="#f4f1ee"/>
      <circle cx="20" cy="16" r="6" fill="#4d8f86"/>
      <circle cx="20" cy="16" r="2.7" fill="#14101a"/>
      <circle cx="22.2" cy="14" r="1.5" fill="#ffffff"/>
      <path d="M4 17 Q20 6 36 17" stroke="#1b1218" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const eyeCyber = svg(
    `<svg viewBox="0 0 40 24">
      <rect x="2" y="3" width="36" height="18" rx="9" fill="#10151c"/>
      <circle cx="20" cy="12" r="7.5" fill="#19e0b4"/>
      <circle cx="20" cy="12" r="4.6" fill="#0b8f78"/>
      <circle cx="20" cy="12" r="2.4" fill="#06231e"/>
      <path d="M20 2 V6 M20 18 V22 M5 12 H9 M31 12 H35" stroke="#19e0b4" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const mouthTex = svg(
    `<svg viewBox="0 0 40 12"><path d="M5 4 Q20 12 35 3" stroke="#5a2e2a" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg>`,
    { size: 256 },
  );
  const crossTex = svg(
    `<svg viewBox="0 0 64 64">
      <rect x="22" y="8" width="20" height="48" rx="4" fill="#19e0b4" stroke="#eef2f6" stroke-width="4"/>
      <rect x="8" y="22" width="48" height="20" rx="4" fill="#19e0b4" stroke="#eef2f6" stroke-width="4"/>
      <rect x="23" y="23" width="18" height="18" fill="#19e0b4"/>
    </svg>`,
    { size: 128 },
  );
  const panelTex = svg(
    `<svg viewBox="0 0 40 100">
      <rect x="1" y="1" width="38" height="98" rx="4" fill="#dfe6ee" stroke="#8993a3" stroke-width="1.6"/>
      <rect x="6" y="6" width="28" height="28" rx="3" fill="#c3ccd8" stroke="#8993a3" stroke-width="1.2"/>
      <rect x="16" y="10" width="8" height="20" fill="#19e0b4"/>
      <rect x="10" y="16" width="20" height="8" fill="#19e0b4"/>
      <path d="M6 44 H34 M6 52 H34 M6 60 H34" stroke="#4a5260" stroke-width="2.4" stroke-linecap="round"/>
      <rect x="6" y="70" width="28" height="22" rx="3" fill="#2a3240"/>
      <rect x="9" y="76" width="22" height="3" fill="#19e0b4"/>
      <rect x="9" y="83" width="14" height="3" fill="#19e0b4"/>
      <circle cx="5" cy="38" r="1.4" fill="#8993a3"/><circle cx="35" cy="38" r="1.4" fill="#8993a3"/>
      <circle cx="5" cy="95" r="1.4" fill="#8993a3"/><circle cx="35" cy="95" r="1.4" fill="#8993a3"/>
    </svg>`,
    { size: 256 },
  );
  const screenTex = svg(
    `<svg viewBox="0 0 50 90">
      <rect x="0" y="0" width="50" height="90" rx="5" fill="#0b1218"/>
      <rect x="6" y="6" width="38" height="5" fill="#19e0b4"/>
      <polyline points="25,18 25,30 18,38 32,50 25,58 25,66 22,72 28,80 25,86" stroke="#19e0b4" stroke-width="2.4" fill="none" stroke-linejoin="round"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------- skeleton core
  const hips = b.joint("hips", { at: [0, 0.97, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.97, 0],
      [0, 1.13, 0],
      [0, 1.3, 0.01],
      [0, 1.5, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const sp1 = J(spine, 0);
  const sp2 = J(spine, 1);
  const sp3 = J(spine, 2);
  const neck = b.chain(
    "neck",
    polyline([
      [0, 1.5, 0],
      [0, 1.64, 0.02],
    ]),
    { parent: sp3, names: ["neck", "head"], role: "neck" },
  );
  const neckJ = J(neck, 0);
  const head = J(neck, 1);
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.7, 0.03], aim: [0, 1.665, 0.1], role: "jaw" });

  // ---------------------------------------------------------------- torso
  b.loft(
    [
      { at: [0, 0.93, 0], w: 0.3, h: 0.2 },
      { at: [0, 1.05, 0], w: 0.3, h: 0.205 },
      { at: [0, 1.18, 0], w: 0.27, h: 0.195 },
      { at: [0, 1.33, 0.01], w: 0.37, h: 0.24 },
      { at: [0, 1.47, 0], w: 0.39, h: 0.22 },
      { at: [0, 1.54, 0], w: 0.16, h: 0.12 },
    ],
    {
      bone: [hips, spine],
      color: SUITP,
      sectors: [
        [75, 105, ACC],
        [255, 285, ACC],
      ],
    },
  );

  // chest plate
  plate(
    [
      [-0.15, -0.06],
      [0.15, -0.06],
      [0.19, 0.06],
      [0.14, 0.2],
      [-0.14, 0.2],
      [-0.19, 0.06],
    ],
    [0, 1.3, 0.145],
    [1, 0, 0],
    0.04,
    WHITEP,
    sp3,
    { bevel: 0.01, smoothing: 1 },
  );
  box(0.03, 0.1, 0.008, ACC, [0, 1.4, 0.169], sp3);
  box(0.1, 0.03, 0.008, ACC, [0, 1.4, 0.169], sp3);
  glow(box(0.012, 0.14, 0.006, ACC, [0.105, 1.37, 0.167], sp3));
  glow(box(0.012, 0.14, 0.006, ACC, [-0.105, 1.37, 0.167], sp3));
  glow(box(0.03, 0.1, 0.008, ACC, [0, 1.4, 0.171], sp3));
  glow(box(0.1, 0.03, 0.008, ACC, [0, 1.4, 0.171], sp3));
  // abdomen bands
  [
    [0.21, 1.19],
    [0.19, 1.14],
    [0.17, 1.09],
  ].forEach(([w, y], i) => box(w, 0.04, 0.03, i % 2 ? SUITP : WHITEP, [0, y, 0.105], sp2));
  glow(box(0.012, 0.12, 0.01, ACC, [0, 1.14, 0.123], sp2));
  // neck collar
  cyl(0.06, 0.078, 0.05, WHITEP, [0, 1.535, 0], neckJ);
  band([0, 1.512, 0], [0, 1, 0], 0.074, 0.007, ACC, neckJ);
  // belt, buckle, pouches
  ellRing(1.0, 0.17, 0.125, 0, 0.022, SUIT_D, hips);
  box(0.065, 0.055, 0.02, WHITEP, [0, 1.0, 0.142], hips);
  glow(box(0.03, 0.03, 0.01, ACC, [0, 1.0, 0.154], hips));
  for (const s of [1, -1]) {
    box(0.05, 0.09, 0.1, SUIT_D, [s * 0.175, 0.98, 0.03], hips);
    box(0.052, 0.02, 0.102, METALP, [s * 0.175, 1.03, 0.03], hips);
    ell(0.035, 0.075, 0.09, WHITEP, [s * 0.165, 0.93, -0.01], hips);
    plate(
      [
        [-0.05, 0],
        [0.05, 0],
        [0.058, -0.11],
        [0, -0.16],
        [-0.058, -0.11],
      ],
      [s * 0.1, 0.97, 0.115],
      [1, 0, 0],
      0.025,
      WHITEP,
      hips,
      { bevel: 0.006 },
    );
    glow(box(0.04, 0.008, 0.006, ACC, [s * 0.1, 0.835, 0.13], hips));
  }
  // bandolier with healing vials
  ellRing(1.14, 0.16, 0.125, 0.13, 0.012, SUIT_D, sp1);
  [110, 125, 140, 155].forEach((deg) => {
    const a = (deg * Math.PI) / 180;
    const x = 0.16 * Math.cos(a);
    const y = 1.14 + 0.13 * Math.cos(a);
    const z = 0.125 * Math.sin(a) + 0.012;
    glow(cyl(0.013, 0.013, 0.055, ACC, [x, y, z], sp1));
    cyl(0.016, 0.016, 0.01, METAL_D, [x, y + 0.03, z], sp1);
  });

  // medi-pack on the back
  box(0.3, 0.34, 0.13, WHITEP, [0, 1.28, -0.185], sp3);
  box(0.28, 0.04, 0.12, METAL_D, [0, 1.465, -0.185], sp3);
  box(0.26, 0.03, 0.12, METAL_D, [0, 1.11, -0.185], sp3);
  for (const s of [1, -1]) {
    glow(cyl(0.042, 0.042, 0.3, ACC, [s * 0.075, 1.28, -0.285], sp3));
    cyl(0.047, 0.047, 0.02, METAL_D, [s * 0.075, 1.44, -0.285], sp3);
    cyl(0.047, 0.047, 0.02, METAL_D, [s * 0.075, 1.12, -0.285], sp3);
    b.part(new THREE.PlaneGeometry(0.12, 0.3), "#ffffff", {
      at: [s * 0.1515, 1.28, -0.185],
      dir: [s, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: panelTex,
      bone: sp3,
    });
    b.sweep(
      catmull([
        [s * 0.15, 1.22, -0.2],
        [s * 0.22, 1.1, -0.15],
        [s * 0.2, 1.03, -0.04],
        [s * 0.18, 1.01, 0.05],
      ]),
      0.012,
      { color: METAL_D, bone: sp2, sides: 6 },
    );
  }

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const lp = polyline([
      [s * 0.1, 0.95, 0],
      [s * 0.105, 0.52, 0.03],
      [s * 0.11, 0.1, -0.015],
    ]);
    const leg = b.chain(`leg${k}`, lp, {
      parent: hips,
      names: [`hip${k}`, `knee${k}`, `ankle${k}`],
      role: "leg",
      contact: [s * 0.11, 0, 0.0],
    });
    const hipJ = J(leg, 0);
    const kneeJ = J(leg, 1);
    const ankJ = J(leg, 2);
    b.sweep(leg, [0.088, 0.082, 0.066, 0.06, 0.046], {
      color: (t: number) => (s > 0 && t > 0.52 ? METALP : SUITP),
    });
    // thigh guard
    b.rod(lp.at(0.12), lp.at(0.4), [0.096, 0.08], WHITEP, { bone: hipJ, sides: 10 });
    band(lp.at(0.41), lp.tangentAt(0.41), 0.082, 0.007, ACC, hipJ);
    band(lp.at(0.13), lp.tangentAt(0.13), 0.098, 0.006, METAL_D, hipJ);
    // knee
    if (s < 0) {
      ell(0.058, 0.07, 0.042, WHITEP, [s * 0.105, 0.53, 0.098], kneeJ);
      glow(ell(0.016, 0.016, 0.01, ACC, [s * 0.105, 0.53, 0.136], kneeJ));
      // shin guard
      b.rod(lp.at(0.58), lp.at(0.9), [0.072, 0.056], WHITEP, { bone: kneeJ, sides: 10 });
      band(lp.at(0.59), lp.tangentAt(0.59), 0.072, 0.007, ACC, kneeJ);
      // thigh holster with injector
      box(0.045, 0.14, 0.06, METAL_D, [-0.195, 0.74, 0.015], hipJ);
      glow(cyl(0.014, 0.014, 0.05, ACC, [-0.195, 0.83, 0.015], hipJ));
      cyl(0.017, 0.017, 0.012, METAL, [-0.195, 0.862, 0.015], hipJ);
    } else {
      ell(0.056, 0.064, 0.04, METALP, [s * 0.105, 0.53, 0.098], kneeJ);
      glow(ell(0.02, 0.02, 0.012, ACC, [s * 0.105, 0.53, 0.134], kneeJ));
      b.rod(lp.at(0.57), lp.at(0.9), [0.068, 0.054], METALP, { bone: kneeJ, sides: 8 });
      band(lp.at(0.6), lp.tangentAt(0.6), 0.07, 0.007, ACC, kneeJ);
      band(lp.at(0.86), lp.tangentAt(0.86), 0.057, 0.006, ACC, kneeJ);
      for (const dz of [-0.05, 0.05]) {
        const a = lp.at(0.42);
        const c = lp.at(0.78);
        b.rod([a.x, a.y, a.z + dz], [c.x, c.y, c.z + dz], 0.009, METAL, { bone: kneeJ, sides: 6 });
      }
      box(0.06, 0.12, 0.02, METAL_D, [0.11, 0.3, -0.07], kneeJ);
      glow(box(0.02, 0.09, 0.006, ACC, [0.11, 0.3, -0.082], kneeJ));
    }
    band(lp.at(0.96), lp.tangentAt(0.96), 0.054, 0.006, METAL_D, ankJ);
    // foot
    const toe = b.joint(`toe${k}`, {
      parent: ankJ,
      at: [s * 0.11, 0.04, 0.08],
      aim: [s * 0.11, 0.03, 0.18],
      role: "hinge",
    });
    const at: V = [s * 0.11, 0, -0.02];
    plate(
      [
        [-0.075, 0.03],
        [0.08, 0.03],
        [0.08, 0.095],
        [0.06, 0.17],
        [-0.06, 0.17],
        [-0.075, 0.08],
      ],
      at,
      [0, 0, 1],
      0.105,
      WHITEP,
      ankJ,
      { bevel: 0.012 },
    );
    plate(
      [
        [-0.085, 0],
        [0.085, 0],
        [0.085, 0.03],
        [-0.085, 0.03],
      ],
      at,
      [0, 0, 1],
      0.112,
      SUIT_D,
      ankJ,
      { bevel: 0.006 },
    );
    plate(
      [
        [0.075, 0.03],
        [0.16, 0.03],
        [0.19, 0.045],
        [0.17, 0.075],
        [0.075, 0.095],
      ],
      at,
      [0, 0, 1],
      0.105,
      WHITEP,
      toe,
      { bevel: 0.01 },
    );
    plate(
      [
        [0.075, 0],
        [0.2, 0],
        [0.205, 0.018],
        [0.19, 0.03],
        [0.075, 0.03],
      ],
      at,
      [0, 0, 1],
      0.112,
      SUIT_D,
      toe,
      { bevel: 0.006 },
    );
    glow(box(0.06, 0.012, 0.03, ACC, [s * 0.11, 0.07, 0.15], toe));
    band([s * 0.11, 0.165, -0.02], [0, 1, 0], 0.058, 0.006, ACC, ankJ);
  }

  // ---------------------------------------------------------------- arms
  let handR: Joint | undefined;
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const P: V[] =
      s > 0
        ? [
            [0.27, 1.46, 0],
            [0.49, 1.27, 0],
            [0.69, 1.11, 0.04],
            [0.76, 1.05, 0.06],
          ]
        : [
            [-0.27, 1.46, 0],
            [-0.48, 1.28, 0.05],
            [-0.6, 1.09, 0.17],
            [-0.66, 1.05, 0.21],
          ];
    const ap = polyline(P);
    const arm = b.chain(`arm${k}`, ap, {
      parent: sp3,
      names: [`shoulder${k}`, `elbow${k}`, `wrist${k}`, `hand${k}`],
      role: "arm",
    });
    const sh = J(arm, 0);
    const el = J(arm, 1);
    const wr = J(arm, 2);
    const hd = J(arm, 3);
    b.sweep(arm, s > 0 ? [0.058, 0.05, 0.046, 0.04] : [0.055, 0.048, 0.04, 0.034], {
      color: s > 0 ? METALP : SUITP,
    });
    // pauldron with painted stripe and emblem
    const pColor = paint((p, n) => (Math.abs(p.z) < 0.012 && n.y > 0.3 ? ACC : WHITEP));
    const pauld = ell(0.095, 0.066, 0.105, pColor, [s * 0.3, 1.51, 0], sh);
    b.decal(pauld, crossTex, { at: [s * 0.395, 1.51, 0], dir: [s, 0.1, 0], size: [0.065, 0.065] });
    ell(0.07, 0.05, 0.07, METALP, [s * 0.27, 1.43, 0], sh);

    if (s > 0) {
      // cyborg arm
      b.rod(ap.at(0.1), ap.at(0.32), [0.066, 0.06], METALP, { bone: sh, sides: 8 });
      for (const dz of [-0.052, 0.052]) {
        const a = ap.at(0.12);
        const c = ap.at(0.42);
        b.rod([a.x, a.y, a.z + dz], [c.x, c.y, c.z + dz], 0.009, METAL, { bone: sh, sides: 6 });
      }
      ell(0.055, 0.055, 0.055, METALP, ap.at(0.45), el);
      band(ap.at(0.45), ap.tangentAt(0.45), 0.058, 0.007, ACC, el);
      band(ap.at(0.34), ap.tangentAt(0.34), 0.064, 0.006, ACC, sh);
      b.rod(ap.at(0.5), ap.at(0.84), [0.068, 0.052], METALP, { bone: el, sides: 8 });
      band(ap.at(0.51), ap.tangentAt(0.51), 0.07, 0.007, ACC, el);
      band(ap.at(0.83), ap.tangentAt(0.83), 0.054, 0.007, ACC, el);
      const d2 = ap.tangentAt(0.68);
      const nrm = new THREE.Vector3(d2.y, -d2.x, 0).normalize().multiplyScalar(-1);
      if (nrm.y < 0) nrm.multiplyScalar(-1);
      const cen = vecOf(ap.at(0.68)).addScaledVector(nrm, 0.062);
      b.part(new THREE.BoxGeometry(0.056, 0.01, 0.096), METAL_D, { at: cen, dir: nrm, up: d2, bone: el });
      glow(
        b.part(new THREE.PlaneGeometry(0.044, 0.08), "#ffffff", {
          at: cen.clone().addScaledVector(nrm, 0.0065),
          dir: nrm,
          axis: "z",
          up: d2,
          texture: screenTex,
          bone: el,
        }),
      );
      // cyber hand
      const H = vecOf(P[3]);
      const d = H.clone().sub(vecOf(P[2])).normalize();
      const pd = new THREE.Vector3(d.y, -d.x, 0).normalize();
      b.part(new THREE.BoxGeometry(0.036, 0.075, 0.088), METAL_D, {
        at: H.clone().addScaledVector(d, -0.03),
        dir: d,
        bone: wr,
      });
      glow(box(0.01, 0.02, 0.05, ACC, H.clone().addScaledVector(d, -0.03).addScaledVector(pd, -0.019), wr, { dir: d }));
      [0.9, 1, 0.95, 0.8].forEach((len, i) => {
        const zf = (i - 1.5) * 0.0215;
        const st = H.clone().add(new THREE.Vector3(0, 0, zf)).addScaledVector(d, -0.012);
        const pts = [
          st,
          st.clone().addScaledVector(d, 0.042 * len).addScaledVector(pd, 0.004),
          st.clone().addScaledVector(d, 0.075 * len).addScaledVector(pd, 0.018),
        ];
        const f = b.chain(`finger${k}${i}`, polyline(pts), {
          parent: hd,
          names: [`finger${k}${i}a`, `finger${k}${i}b`],
          role: "digit",
        });
        b.sweep(f, [0.011, 0.0085], { color: i % 2 ? METAL : METALP, sides: 6 });
      });
      {
        const st = H.clone().addScaledVector(d, -0.04).add(new THREE.Vector3(0, 0, 0.04));
        const pts = [
          st,
          st.clone().addScaledVector(d, 0.025).add(new THREE.Vector3(0, 0, 0.025)).addScaledVector(pd, 0.004),
          st.clone().addScaledVector(d, 0.05).add(new THREE.Vector3(0, 0, 0.035)).addScaledVector(pd, 0.012),
        ];
        const f = b.chain(`thumb${k}`, polyline(pts), {
          parent: hd,
          names: [`thumb${k}a`, `thumb${k}b`],
          role: "digit",
        });
        b.sweep(f, [0.012, 0.009], { color: METALP, sides: 6 });
      }
    } else {
      // organic arm in white armour
      b.rod(ap.at(0.1), ap.at(0.36), [0.066, 0.06], WHITEP, { bone: sh, sides: 10 });
      band(ap.at(0.37), ap.tangentAt(0.37), 0.062, 0.006, ACC, sh);
      ell(0.052, 0.056, 0.056, WHITEP, vecOf(ap.at(0.45)).add(new THREE.Vector3(0, 0, -0.025)), el);
      b.rod(ap.at(0.5), ap.at(0.86), [0.062, 0.05], WHITEP, { bone: el, sides: 10 });
      band(ap.at(0.51), ap.tangentAt(0.51), 0.064, 0.007, ACC, el);
      band(ap.at(0.87), ap.tangentAt(0.87), 0.046, 0.006, METAL_D, el);
      glow(box(0.04, 0.012, 0.012, ACC, vecOf(ap.at(0.68)).add(new THREE.Vector3(-0.045, 0.045, 0.0)), el));
      // glove palm and fingers wrapped round the staff
      box(0.035, 0.1, 0.06, SUIT_D, [-0.655, 1.05, 0.195], wr);
      box(0.03, 0.06, 0.05, METALP, [-0.64, 1.05, 0.2], wr);
      const ys = [1.083, 1.061, 1.039, 1.017];
      ys.forEach((y, i) => {
        const R = 0.033;
        const pts = [-35, 45, 125].map((a) => {
          const r = (a * Math.PI) / 180;
          return new THREE.Vector3(SX + R * Math.cos(r), y, SZ + R * Math.sin(r));
        });
        const f = b.chain(`finger${k}${i}`, polyline(pts), {
          parent: hd,
          names: [`finger${k}${i}a`, `finger${k}${i}b`],
          role: "digit",
        });
        b.sweep(f, 0.0105, { color: SUIT_D, sides: 6 });
      });
      {
        const pts = [-55, -115, -175].map((a) => {
          const r = (a * Math.PI) / 180;
          return new THREE.Vector3(SX + 0.033 * Math.cos(r), 1.108, SZ + 0.033 * Math.sin(r));
        });
        const f = b.chain(`thumb${k}`, polyline(pts), {
          parent: hd,
          names: [`thumb${k}a`, `thumb${k}b`],
          role: "digit",
        });
        b.sweep(f, 0.0115, { color: SUIT_D, sides: 6 });
      }
      handR = hd;
    }
  }

  // ---------------------------------------------------------------- healing staff
  if (!handR) throw new Error("right hand missing");
  const staffJ = b.joint("staff", { parent: handR, at: [SX, 1.0, SZ], aim: [SX, 1.5, SZ], role: "hinge" });
  b.sweep(
    polyline([
      [SX, 0.0, SZ],
      [SX, 1.64, SZ],
    ]),
    0.02,
    {
      color: WHITEP,
      bone: staffJ,
      caps: "flat",
      bands: [
        [0.4, WHITEP],
        [0.425, ACC],
        [0.7, WHITEP],
        [0.72, ACC],
        [1, WHITEP],
      ],
    },
  );
  b.rod([SX, 0.97, SZ], [SX, 1.13, SZ], 0.0235, SUIT_D, { bone: staffJ, sides: 8 });
  b.rod([SX, 0, SZ], [SX, 0.1, SZ], [0.016, 0.028], METAL_D, { bone: staffJ, sides: 8 });
  band([SX, 0.2, SZ], [0, 1, 0], 0.03, 0.006, ACC, staffJ);
  band([SX, 1.16, SZ], [0, 1, 0], 0.03, 0.006, METAL, staffJ);
  b.lathe(
    [
      [0, 0],
      [0.032, 0],
      [0.04, 0.02],
      [0.03, 0.07],
      [0, 0.07],
    ],
    { at: [SX, 1.62, SZ], color: WHITEP, bone: staffJ, segments: 10 },
  );
  glow(ell(0.062, 0.062, 0.062, ACC, [SX, 1.79, SZ], staffJ), 1.3);
  glow(ell(0.03, 0.03, 0.03, "#c8fff0", [SX, 1.79, SZ], staffJ), 1.5);
  [45, 135, 225, 315].forEach((deg) => {
    const a = (deg * Math.PI) / 180;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    b.sweep(
      catmull([
        [SX, 1.64, SZ],
        [SX + 0.06 * c, 1.72, SZ + 0.06 * sn],
        [SX + 0.08 * c, 1.8, SZ + 0.08 * sn],
        [SX + 0.05 * c, 1.9, SZ + 0.05 * sn],
        [SX, 1.95, SZ],
      ]),
      [0.014, 0.006],
      { color: WHITEP, bone: staffJ, sides: 6, caps: { start: "round", end: "point" } },
    );
  });
  glow(b.part(new THREE.TorusGeometry(0.11, 0.006, 6, 20), ACC, { at: [SX, 1.79, SZ], rotation: [75, 0, 15], bone: staffJ }));
  glow(b.part(new THREE.TorusGeometry(0.11, 0.006, 6, 20), ACC, { at: [SX, 1.79, SZ], rotation: [75, 0, -60], bone: staffJ }));
  glow(box(0.012, 0.045, 0.012, ACC, [SX, 2.0, SZ], staffJ));
  glow(box(0.045, 0.012, 0.012, ACC, [SX, 2.0, SZ], staffJ));
  for (const w of [1, -1]) {
    const wingColor = paint((_p, _n, s) => (s[1] < 0.03 ? ACC : WHITEP));
    plate(
      [
        [0, 0],
        [0.08, 0.01],
        [0.17, 0.08],
        [0.13, 0.1],
        [0.19, 0.17],
        [0.12, 0.17],
        [0.15, 0.24],
        [0.06, 0.18],
        [0, 0.1],
      ],
      [SX + w * 0.04, 1.6, SZ],
      [w, 0, 0],
      0.012,
      wingColor,
      staffJ,
      { bevel: 0.003 },
    );
  }

  // ---------------------------------------------------------------- neck and head
  b.sweep(neck, [0.052, 0.048], { color: SKINP });
  for (const dx of [0.04, 0.062]) b.rod([dx, 1.52, -0.02], [dx - 0.004, 1.66, -0.035], 0.007, METAL_D, { bone: neckJ, sides: 6 });
  const HC: V = [0, 1.74, 0.02];
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), SKINP, { at: HC, bone: head, scale: [0.095, 0.11, 0.1] });
  const jawPart = b.part(new THREE.SphereGeometry(1, 10, 7), SKINP, { at: [0, 1.675, 0.06], bone: jaw, scale: [0.062, 0.042, 0.062] });
  const mask = b.part(
    new THREE.SphereGeometry(1, 10, 8, Math.PI * 0.5 + 0.08, Math.PI * 0.55, Math.PI * 0.28, Math.PI * 0.5),
    METALP,
    { at: HC, bone: head, scale: [0.1, 0.114, 0.104] },
  );
  ell(0.014, 0.02, 0.02, SKINP, [0, 1.725, 0.12], head);
  for (const s of [1, -1]) ell(0.014, 0.028, 0.022, s > 0 ? METALP : SKINP, [s * 0.098, 1.735, 0.01], head);
  const face = b.surface([skull, mask, jawPart]);
  b.decal(face, eyeOrg, { at: [-0.042, 1.752, 0.125], dir: [0, 0, 1], size: [0.042, 0.026] });
  glow(b.decal(face, eyeCyber, { at: [0.042, 1.752, 0.125], dir: [0, 0, 1], size: [0.042, 0.026] }));
  b.decal(face, mouthTex, { at: [0, 1.698, 0.115], dir: [0, 0, 1], size: [0.05, 0.015] });
  // hair
  b.part(new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.34), HAIR, {
    at: [0, 1.742, 0.015],
    bone: head,
    scale: [0.102, 0.118, 0.108],
  });
  b.part(new THREE.SphereGeometry(1, 12, 8, Math.PI, Math.PI, Math.PI * 0.3, Math.PI * 0.5), HAIR, {
    at: [0, 1.742, 0.015],
    bone: head,
    scale: [0.102, 0.118, 0.108],
  });
  [
    [0, 0.0],
    [0.04, 0.04],
    [-0.04, -0.04],
    [0.075, 0.07],
    [-0.075, -0.07],
  ].forEach(([x, tx]) => {
    b.spike([x, 1.8, 0.09], [x + tx, 1.762, 0.115], null, 0.02, { color: HAIR, bone: head, sides: 6 });
  });
  const hair = b.chain(
    "hair",
    polyline([
      [0, 1.79, -0.09],
      [0, 1.74, -0.19],
      [0, 1.62, -0.24],
      [0, 1.52, -0.22],
    ]),
    { parent: head, names: ["hair1", "hair2", "hair3"], role: "tail" },
  );
  b.sweep(hair, [0.032, 0.034, 0.026, 0.012], { color: HAIR, caps: { end: "point" }, sides: 8 });
  band([0, 1.77, -0.1], [0, 0.4, -1], 0.036, 0.007, ACC, head);
  // headset
  const bandPts: V[] = [];
  for (let a = 0; a <= 180; a += 30) {
    const r = (a * Math.PI) / 180;
    bandPts.push([0.114 * Math.cos(r), 1.742 + 0.13 * Math.sin(r), 0.02]);
  }
  b.sweep(catmull(bandPts), 0.008, { color: WHITEP, bone: head, sides: 6 });
  for (const s of [1, -1]) {
    cyl(0.036, 0.036, 0.026, s > 0 ? METALP : WHITEP, [s * 0.116, 1.74, 0.02], head, { dir: [s, 0, 0] });
    glow(cyl(0.022, 0.022, 0.006, ACC, [s * 0.13, 1.74, 0.02], head, { dir: [s, 0, 0] }));
  }
  b.sweep(
    catmull([
      [-0.12, 1.735, 0.04],
      [-0.118, 1.7, 0.08],
      [-0.07, 1.675, 0.115],
    ]),
    0.004,
    { color: METAL_D, bone: head, sides: 6 },
  );
  glow(ell(0.01, 0.01, 0.01, ACC, [-0.07, 1.675, 0.115], head));

  return b.root;
}
