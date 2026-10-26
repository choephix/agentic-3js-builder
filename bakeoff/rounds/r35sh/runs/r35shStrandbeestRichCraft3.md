```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, catmull, polyline, bezier, paint, noise, mix, smoothstep, svg } from "agentic-3js-builder";
import type { Joint, ColorInput } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Strandbeest Wind Walker",
  description:
    "A Theo Jansen style beach beast: yellow PVC tube frame, twelve Jansen-linkage legs on six crank axles, stacked PET-bottle lungs, a sun-painted dorsal sail, two cloth wings, a long tube neck with a snapping beak, glowing goat eyes, an anemometer crown and a windsock tail.",
};

type V2 = [number, number];
type V3 = [number, number, number];

// ---------------------------------------------------------------------------------------------
// Jansen linkage solver (classic holy numbers). x is "behind", we mirror to forward when placing.
function circ(p0: V2, r0: number, p1: V2, r1: number, score: (p: V2) => number): V2 {
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const d = Math.max(Math.hypot(dx, dy), 1e-6);
  const a = (r0 * r0 - r1 * r1 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(r0 * r0 - a * a, 0));
  const ux = dx / d;
  const uy = dy / d;
  const bx = p0[0] + a * ux;
  const by = p0[1] + a * uy;
  const c1: V2 = [bx - h * uy, by + h * ux];
  const c2: V2 = [bx + h * uy, by - h * ux];
  return score(c1) >= score(c2) ? c1 : c2;
}

function solve(thetaDeg: number) {
  const th = (thetaDeg * Math.PI) / 180;
  const O: V2 = [0, 0];
  const Q: V2 = [-38, -7.8];
  const M: V2 = [15 * Math.cos(th), 15 * Math.sin(th)];
  const A = circ(M, 41.5, Q, 50, (p) => p[1]);
  const N = circ(Q, 39.3, A, 40.1, (p) => -p[0]);
  const D = circ(M, 55.8, N, 39.4, (p) => -p[1]);
  const E = circ(M, 36.7, D, 49, (p) => -p[1]);
  const F = circ(E, 61.9, D, 65.7, (p) => -p[0]);
  return { O, Q, M, A, N, D, E, F };
}

// ---------------------------------------------------------------------------------------------
// Dimensions
const S = 0.0115; // linkage unit -> meters
const LAYERS = [0.34, 0.41, 0.48];
const STATIONS = 6;
const DZ = 0.36;
const Z0 = -1.2;
const PHASE0 = 25;
const BEAM_X = 0.27;

const PHASES = [0, 1, 2, 3, 4, 5].map((k) => PHASE0 + 60 * k);
const MIN_FY = Math.min(...PHASES.map((t) => solve(t).F[1]));
const YB = -MIN_FY * S + 0.02 - 0.003; // hub height so the lowest foot pad touches the sand
const YT = YB + 0.32; // top frame / keel height

// ---------------------------------------------------------------------------------------------
// Palette
const STEEL = "#3d424b";
const STEEL_LIGHT = "#8b929e";
const RUBBER = "#24262b";
const ORANGE = "#e0592a";
const ORANGE_LIGHT = "#f59a3a";
const BEAK = "#e9dfc3";
const BONE = "#f7f2e2";
const ROPE = "#6b4b2a";
const TEAL = "#2f7f93";
const CLOTH = "#f1ead6";

const PVC = paint((p, n) => {
  const up = smoothstep(-0.6, 0.9, n.y);
  let c = mix("#c98f12", "#fbd24a", up);
  c = mix(c, "#fff2b8", 0.3 * up * smoothstep(0.55, 0.85, noise(p, 0.35, 2)));
  c = mix(c, "#b8a074", 0.6 * smoothstep(0.8, 0.05, p.y) * smoothstep(0.3, 0.7, noise(p, 0.1, 6)));
  return c;
});

const clothBase = (p: THREE.Vector3) => mix(CLOTH, "#d6cca9", 0.8 * smoothstep(0.5, 0.8, noise(p, 0.25, 5)));

const SUN_Y = YT + 0.55;
const SUN_Z = -1.1;
const DORSAL_CLOTH = paint((p, _n, s) => {
  let c = clothBase(p);
  const f = s[0] * 5;
  if (Math.abs(f - Math.round(f)) < 0.018) c = mix(c, "#9d9272", 0.7);
  const dz = p.z - SUN_Z;
  const dy = p.y - SUN_Y;
  const d = Math.hypot(dz, dy);
  const ang = Math.atan2(dy, dz);
  if (d < 0.19) return ORANGE_LIGHT;
  if (d < 0.225) return "#7a2e12";
  if (d > 0.27 && d < 0.4 && Math.floor((ang + Math.PI) / (Math.PI / 9)) % 2 === 0) return ORANGE;
  c = mix(c, "#b9a273", 0.55 * smoothstep(0.14, 0.0, s[1]));
  if (s[1] > 0.94) return ORANGE;
  return c;
});

const wingCloth = (panels: number) =>
  paint((p, _n, s) => {
    const f = s[0] * (panels - 1);
    let c = Math.floor(f) % 2 === 0 ? clothBase(p) : mix("#9fd6d2", "#6fb5b4", noise(p, 0.3, 8));
    if (Math.abs(f - Math.round(f)) < 0.022) c = mix(c, "#7d7457", 0.7);
    c = mix(c, "#b9a273", 0.5 * smoothstep(0.12, 0.0, s[1]));
    if (s[1] > 0.95) return TEAL;
    return c;
  });

const BOTTLE = paint((_p, n, s) => {
  const h = s[0];
  let c: ColorInput = "#aee3df";
  if (h > 0.07 && h < 0.17) c = h > 0.1 && h < 0.14 ? "#f4f1e4" : TEAL;
  return mix(c as string, "#ffffff", 0.25 * smoothstep(0.2, 1, n.y));
});

const SOCK = paint((_p, _n, s) => (Math.floor(s[0] / 0.1) % 2 === 0 ? ORANGE : "#f6efdc"));

const EYE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="i" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#fff0a0"/><stop offset="0.55" stop-color="#f4aa22"/><stop offset="1" stop-color="#a24a0c"/>
    </radialGradient></defs>
    <circle cx="50" cy="50" r="46" fill="url(#i)" stroke="#2a1608" stroke-width="5"/>
    <rect x="20" y="40" width="60" height="20" rx="10" fill="#140a05"/>
    <circle cx="33" cy="37" r="9" fill="#ffffff"/>
    <circle cx="65" cy="65" r="4.5" fill="#ffffff" opacity="0.9"/>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "strandbeest", paintSize: 2048 });

  const rod = (a: V3 | THREE.Vector3, c: V3 | THREE.Vector3, r: number, color: ColorInput, bone: Joint, sides = 6) =>
    b.rod(a, c, r, color, { bone, sides });

  // ---------------- skeleton ----------------
  const hips = b.joint("hips", { at: [0, YB, 0], dir: [0, 0, 1] });

  const spinePath = catmull([
    [0, YT, -1.6],
    [0, YT, -0.55],
    [0, YT, 0.5],
    [0, YT, 1.5],
  ]);
  const spine = b.chain("spine", spinePath, { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" });

  const neckPath = catmull([
    [0, YT, 1.5],
    [0, YT + 0.2, 1.78],
    [0, YT + 0.5, 1.95],
    [0, YT + 0.82, 2.05],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: spine.joints[2],
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[2], at: neckPath.at(1), dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.05, up: -0.07 }),
    aim: head.local({ forward: 0.5, up: -0.12 }),
    role: "jaw",
  });
  const vane = b.joint("vane", { parent: head, at: head.local({ up: 0.3 }), dir: [0, 1, 0], role: "fan" });

  const tailPath = catmull([
    [0, YT, -1.6],
    [0, YT + 0.1, -1.95],
    [0, YT + 0.3, -2.25],
    [0, YT + 0.62, -2.42],
  ]);
  const tail = b.chain("tail", tailPath, { parent: spine.joints[0], names: ["tail1", "tail2", "tail3"], role: "tail" });

  const axles = [...Array(STATIONS)].map((_, i) =>
    b.joint(`axle${i + 1}`, { parent: hips, at: [0, YB, Z0 + DZ * i], dir: [1, 0, 0] }),
  );

  // wings: base along the top beams, tips up and out
  const WING_Z = [-0.3, 0.0, 0.3, 0.6, 0.9];
  const WING_H = [0.85, 1.0, 0.95, 0.8, 0.6];
  const WING_X = [0.72, 0.78, 0.78, 0.74, 0.68];
  const wingBases = (s: number): V3[] => WING_Z.map((z) => [s * BEAM_X, YT, z]);
  const wingTips = (s: number): V3[] => WING_Z.map((z, k) => [s * WING_X[k], YT + WING_H[k], z - 0.28]);
  const wings: Record<string, Joint[]> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    wings[side] = b.chain(
      `wing${side}`,
      polyline([
        [s * BEAM_X, YT, 0.3],
        [s * 0.5, YT + 0.5, 0.1],
        [s * 0.75, YT + 0.9, -0.02],
      ]),
      { parent: spine.joints[1], names: [`wing${side}1`, `wing${side}2`], role: "wing" },
    ).joints;
  }

  // ---------------- legs ----------------
  function buildLeg(s: number, idx: number, theta: number) {
    const tag = `${s > 0 ? "L" : "R"}${idx + 1}`;
    const hubZ = Z0 + DZ * idx;
    const lx = s * LAYERS[idx % 3];
    const n = solve(theta);
    const P = (q: V2, dx = 0): V3 => [lx + s * dx, YB + q[1] * S, hubZ - q[0] * S];
    const pf = P(n.F);
    const chain = b.chain(`leg${tag}`, polyline([P(n.O), P(n.D), pf]), {
      parent: axles[idx],
      names: [`hip${tag}`, `knee${tag}`, `foot${tag}`],
      role: "leg",
      contact: [pf[0], 0, pf[2]],
    });
    const [hipJ, kneeJ, footJ] = [chain.joints[0], chain.joints[1], chain.tip ?? chain.joints[1]];
    const IN = -0.017;
    const OUT = 0.017;
    const bar = (a: V2, c: V2, dx: number, bone: Joint) => rod(P(a, dx), P(c, dx), 0.0115, PVC, bone);
    // plane 1
    bar(n.O, n.M, IN, hipJ);
    bar(n.M, n.A, IN, hipJ);
    bar(n.M, n.D, IN, kneeJ);
    bar(n.M, n.E, IN, kneeJ);
    bar(n.E, n.F, IN, footJ);
    // plane 2
    bar(n.Q, n.A, OUT, hipJ);
    bar(n.Q, n.N, OUT, hipJ);
    bar(n.A, n.N, OUT, hipJ);
    bar(n.N, n.D, OUT, kneeJ);
    bar(n.D, n.E, OUT, kneeJ);
    bar(n.D, n.F, OUT, footJ);

    const pin = (q: V2, r = 0.0135, len = 0.075) => {
      const g = new THREE.CylinderGeometry(r, r, len, 6);
      g.rotateZ(Math.PI / 2);
      const p = P(q);
      g.translate(p[0], p[1], p[2]);
      return g;
    };
    const hubPin = pin(n.O, 0.028, 0.06);
    b.part(mergeGeometries([hubPin, pin(n.M), pin(n.A), pin(n.N), pin(n.Q)])!, STEEL, {
      bone: hipJ,
      at: [0, 0, 0],
      flat: true,
    });
    b.part(mergeGeometries([pin(n.D), pin(n.E)])!, STEEL, { bone: kneeJ, at: [0, 0, 0], flat: true });
    b.part(pin(n.F), STEEL, { bone: footJ, at: [0, 0, 0], flat: true });
    // rubber pad
    b.part(new THREE.CylinderGeometry(0.03, 0.042, 0.04, 7), RUBBER, {
      bone: footJ,
      at: [pf[0], pf[1], pf[2]],
      flat: true,
    });
  }
  for (let i = 0; i < STATIONS; i++) {
    buildLeg(1, i, PHASES[i]);
    buildLeg(-1, i, PHASES[i] + 180);
  }

  // ---------------- axles, bearings ----------------
  const bearings: THREE.BufferGeometry[] = [];
  for (let i = 0; i < STATIONS; i++) {
    const z = Z0 + DZ * i;
    rod([-0.62, YB, z], [0.62, YB, z], 0.017, STEEL_LIGHT, axles[i], 8);
    for (const s of [1, -1]) {
      b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 8), STEEL, {
        bone: axles[i],
        at: [s * 0.62, YB, z],
        dir: [1, 0, 0],
        flat: true,
      });
    }
    for (const x of [-BEAM_X, 0, BEAM_X]) {
      bearings.push(new THREE.BoxGeometry(0.07, 0.075, 0.07).translate(x, YB, z));
    }
  }
  b.part(mergeGeometries(bearings)!, STEEL, { bone: hips, at: [0, 0, 0], flat: true });

  // ---------------- frame ----------------
  for (const x of [-BEAM_X, 0, BEAM_X]) rod([x, YB, -1.5], [x, YB, 1.45], 0.022, PVC, hips, 8);
  for (const s of [1, -1]) rod([s * BEAM_X, YT, -1.5], [s * BEAM_X, YT, 1.45], 0.022, PVC, hips, 8);
  for (const y of [YB, YT]) {
    rod([-BEAM_X, y, -1.5], [BEAM_X, y, -1.5], 0.02, PVC, hips);
    rod([-BEAM_X, y, 1.45], [BEAM_X, y, 1.45], 0.02, PVC, hips);
  }
  const POSTS = [-1.4, -0.5, 0.4, 1.35];
  for (const z of POSTS) {
    for (const s of [1, -1]) {
      rod([s * BEAM_X, YB, z], [s * BEAM_X, YT, z], 0.02, PVC, hips);
      rod([s * BEAM_X, YT, z], [0, YT, z], 0.016, PVC, hips);
    }
  }
  for (let k = 0; k < POSTS.length - 1; k++) {
    for (const s of [1, -1]) {
      rod([s * BEAM_X, YB, POSTS[k]], [s * BEAM_X, YT, POSTS[k + 1]], 0.009, PVC, hips, 5);
      rod([s * BEAM_X, YT, POSTS[k]], [s * BEAM_X, YB, POSTS[k + 1]], 0.009, PVC, hips, 5);
    }
  }
  // fixed-pivot rails (one per leg layer and side)
  for (let L = 0; L < 3; L++) {
    const zA = Z0 + DZ * L + 38 * S - 0.12;
    const zB = Z0 + DZ * (L + 3) + 38 * S + 0.12;
    const y = YB - 7.8 * S;
    for (const s of [1, -1]) {
      const x = s * LAYERS[L];
      rod([x, y, zA], [x, y, zB], 0.012, PVC, hips);
      rod([x, y, zA], [s * BEAM_X, YB, zA], 0.009, PVC, hips, 5);
      rod([x, y, zB], [s * BEAM_X, YB, zB], 0.009, PVC, hips, 5);
    }
  }
  // keel along the spine
  b.sweep(spine, 0.026, { color: PVC, sides: 8 });

  // ---------------- PET-bottle lungs ----------------
  const bottleProfile: [number, number][] = [
    [0, 0],
    [0.042, 0],
    [0.054, 0.018],
    [0.056, 0.04],
    [0.056, 0.19],
    [0.05, 0.225],
    [0.03, 0.25],
    [0.0235, 0.262],
    [0.0235, 0.29],
    [0, 0.29],
  ];
  for (const s of [1, -1]) {
    for (let t = 0; t < 2; t++) {
      for (let k = 0; k < 6; k++) {
        const zc = -1.25 + 0.36 * k;
        const d = (k + t) % 2 === 0 ? 1 : -1;
        const x = s * 0.185;
        const y = YB + 0.085 + t * 0.105;
        b.lathe(bottleProfile, {
          at: [x, y, zc - d * 0.145],
          axis: [0, 0, d],
          segments: 10,
          bone: hips,
          color: BOTTLE,
        });
        b.part(new THREE.CylinderGeometry(0.027, 0.027, 0.026, 8), (k + t) % 3 === 0 ? ORANGE : TEAL, {
          bone: hips,
          at: [x, y, zc + d * 0.137],
          dir: [0, 0, d],
          flat: true,
        });
        if (t === 0) {
          b.part(new THREE.TorusGeometry(0.058, 0.006, 5, 10), STEEL_LIGHT, {
            bone: hips,
            at: [x, y, zc + d * 0.04],
            dir: [0, 0, 1],
            axis: "z",
          });
        }
      }
    }
  }

  // ---------------- dorsal sail ----------------
  const dBases: V3[] = [];
  const dTips: V3[] = [];
  const D_H = [0.75, 1.05, 1.3, 1.35, 1.15, 0.85];
  D_H.forEach((h, k) => {
    const z = -1.5 + 0.24 * k;
    dBases.push([0, YT, z]);
    dTips.push([0, YT + h, z - 0.2 * h]);
  });
  const dBone = spine.joints[0];
  b.membrane(polyline(dBases), polyline(dTips), {
    color: DORSAL_CLOTH,
    thickness: 0.01,
    scallop: 0.12,
    bone: dBone,
  });
  dBases.forEach((p, k) => rod(p, dTips[k], 0.015, PVC, dBone));
  b.sweep(polyline(dTips), 0.007, { color: ROPE, bone: dBone, sides: 5 });
  for (let k = 0; k < 5; k += 2) rod(dBases[k], dTips[k + 1], 0.007, PVC, dBone, 5);
  rod(dTips[2], tailPath.at(1), 0.004, ROPE, tail.joints[2], 4);

  // ---------------- wing sails ----------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const bs = wingBases(s);
    const ts = wingTips(s);
    const wb = wings[side][0];
    b.membrane(polyline(bs), polyline(ts), {
      color: wingCloth(WING_Z.length),
      thickness: 0.01,
      scallop: 0.1,
      bone: wb,
    });
    bs.forEach((p, k) => rod(p, ts[k], 0.014, PVC, wb));
    b.sweep(polyline(ts), 0.007, { color: ROPE, bone: wb, sides: 5 });
    for (let k = 0; k < 4; k += 2) rod(bs[k], ts[k + 1], 0.007, PVC, wb, 5);
  }

  // ---------------- neck ----------------
  b.sweep(neck, (t) => 0.034 - 0.008 * t, { color: PVC, sides: 8 });
  b.along(neck, 4, (cp) =>
    b.part(new THREE.TorusGeometry(0.042, 0.008, 5, 10), STEEL_LIGHT, {
      bone: cp.bone,
      at: cp.at,
      dir: cp.tangent,
      axis: "z",
    }),
  );
  for (const s of [1, -1]) {
    rod([s * BEAM_X, YT, 1.35], neckPath.at(0.5), 0.004, ROPE, neck.joints[0], 4);
    rod([s * BEAM_X, YT, 1.35], [0, YT, 1.5], 0.012, PVC, hips, 5);
  }

  // ---------------- tail + windsock ----------------
  b.sweep(tail, (t) => 0.026 - 0.012 * t, { color: PVC, sides: 8 });
  b.along(tail, 3, (cp) =>
    b.part(new THREE.TorusGeometry(0.034, 0.007, 5, 10), STEEL_LIGHT, {
      bone: cp.bone,
      at: cp.at,
      dir: cp.tangent,
      axis: "z",
    }),
  );
  const T = tailPath.at(1);
  const sockDir = new THREE.Vector3(0, 0.12, -1).normalize();
  const sockUp = new THREE.Vector3(0, 1, 0).sub(sockDir.clone().multiplyScalar(sockDir.y)).normalize();
  const sockSide = new THREE.Vector3().crossVectors(sockDir, sockUp);
  const tailBone = tail.joints[2];
  for (let k = 0; k < 3; k++) {
    const a = (k * 2 * Math.PI) / 3 + Math.PI / 6;
    const p = T.clone()
      .addScaledVector(sockUp, Math.cos(a) * 0.14)
      .addScaledVector(sockSide, Math.sin(a) * 0.14);
    rod(T, p, 0.005, STEEL_LIGHT, tailBone, 4);
  }
  b.part(new THREE.TorusGeometry(0.14, 0.007, 5, 14), STEEL_LIGHT, {
    bone: tailBone,
    at: T,
    dir: sockDir,
    axis: "z",
  });
  b.lathe(
    [
      [0.14, 0],
      [0.1, 0.35],
      [0.06, 0.75],
      [0.052, 0.75],
      [0.092, 0.35],
      [0.132, 0],
    ],
    { at: T, axis: sockDir, segments: 10, bone: tailBone, color: SOCK },
  );

  // ---------------- head ----------------
  b.part(new THREE.IcosahedronGeometry(0.13, 1), PVC, {
    bone: head,
    at: head.local({ forward: 0.05 }),
    scale: [0.95, 0.85, 1.15],
    flat: true,
  });
  rod(head.local({ left: 0.2, forward: 0.08 }), head.local({ left: -0.2, forward: 0.08 }), 0.02, PVC, head);
  for (const s of [1, -1]) {
    const c = head.local({ left: s * 0.2, forward: 0.1, up: 0.04 });
    rod(head.local({ left: s * 0.06, forward: 0.04 }), c, 0.018, PVC, head);
    const ball = b.part(new THREE.SphereGeometry(0.085, 12, 8), "#f1ecd9", { bone: head, at: c });
    const dv = new THREE.Vector3(s * 0.4, 0, 1).normalize();
    const eye = b.decal(ball, EYE, {
      at: c.clone().addScaledVector(dv, 0.085),
      dir: [dv.x, dv.y, dv.z],
      size: [0.11, 0.11],
    });
    glow(eye, 0.6);
    b.part(new THREE.SphereGeometry(0.094, 10, 5, 0, Math.PI * 2, 0, 0.8), PVC, {
      bone: head,
      at: c,
      dir: [s * 0.35, 0.85, 0.5],
      flat: true,
    });
  }

  // upper jaw (rigid on head) and lower jaw (on the jaw joint)
  const upper = b.sweep(
    bezier(
      head.local({ forward: 0.1 }),
      head.local({ forward: 0.3, up: 0.05 }),
      head.local({ forward: 0.5, up: 0.0 }),
      head.local({ forward: 0.7, up: -0.12 }),
    ),
    (t) => [0.07 * (1 - t) + 0.02 * t, 0.045 * (1 - t) + 0.016 * t],
    {
      bone: head,
      sides: 8,
      bands: [
        [0.8, BEAK],
        [1, ORANGE],
      ],
      caps: { start: "flat", end: "round" },
    },
  );
  const lower = b.sweep(
    bezier(
      head.local({ forward: 0.08, up: -0.09 }),
      head.local({ forward: 0.28, up: -0.15 }),
      head.local({ forward: 0.46, up: -0.17 }),
      head.local({ forward: 0.62, up: -0.2 }),
    ),
    (t) => [0.05 * (1 - t) + 0.014 * t, 0.03 * (1 - t) + 0.012 * t],
    {
      bone: jaw,
      sides: 8,
      bands: [
        [0.8, BEAK],
        [1, ORANGE],
      ],
      caps: { start: "flat", end: "round" },
    },
  );
  for (const t of [0.3, 0.45, 0.6, 0.75]) {
    for (const a of [-38, 38]) {
      const up = upper.at(t, 180 + a);
      b.spike(up, up, 0.045 * (1 - t * 0.5), 0.009, { color: BONE, sides: 4 });
      const lo = lower.at(t, a);
      b.spike(lo, lo, 0.045 * (1 - t * 0.4), 0.009, { color: BONE, sides: 4 });
    }
  }

  // anemometer crown
  rod(head.local({ up: 0.1 }), head.local({ up: 0.3 }), 0.01, STEEL_LIGHT, head, 6);
  b.part(new THREE.SphereGeometry(0.032, 8, 6), STEEL, { bone: vane, at: vane.at });
  const cupProfile: [number, number][] = [
    [0.045, 0],
    [0.043, 0.02],
    [0.033, 0.035],
    [0.015, 0.044],
    [0, 0.046],
    [0, 0.039],
    [0.012, 0.037],
    [0.029, 0.029],
    [0.037, 0.018],
    [0.038, 0],
  ];
  for (let k = 0; k < 3; k++) {
    const a = (k * 2 * Math.PI) / 3;
    const armDir = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    const tangent = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a));
    const end = vane.at.clone().addScaledVector(armDir, 0.15);
    rod(vane.at, end, 0.006, STEEL_LIGHT, vane, 5);
    b.lathe(cupProfile, {
      at: end.clone().addScaledVector(tangent, -0.02),
      axis: tangent,
      segments: 8,
      bone: vane,
      color: k === 0 ? ORANGE : ORANGE_LIGHT,
    });
  }

  return b.root;
}
```