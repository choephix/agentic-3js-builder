// Cyborg Medic: a support-hero in the Overwatch manner. Clean white armour shells with bevel-like plate breaks over a
// graphite undersuit, one strong cyan accent (glow kit), an exposed robotic right arm and a winged healing staff.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { catmull } from "../../../../src/path";
import { grain, mottle } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cyborg Medic",
  description:
    "Support-hero cyborg medic: white armour over a graphite suit, cyan healing light, robotic right arm, winged healing staff.",
  style: "Overwatch",
  commit: "88fc1f0",
};

type Col = string | Paint;
type Pt = number[] | THREE.Vector3;

const WHITE = "#f1f4f7";
const WHITE_SH = "#cdd6df";
const GRAPH = "#2a323d";
const GRAPH2 = "#3b4655";
const STEEL = "#9aa6b5";
const STEEL_D = "#5d6877";
const CYAN = "#1fe0d0";
const CYAN_D = "#118d92";
const SKIN = "#c68a67";
const SKIN_D = "#a56d4f";
const HAIR = "#3a2622";
const IRIS = "#5a3a28";
const AMBER = "#ffb347";
const DARK = "#161b22";

const EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><polygon points="32,3 58,17.5 58,46.5 32,61 6,46.5 6,17.5" fill="#1b2430" stroke="#1fe0d0" stroke-width="4"/><rect x="26" y="14" width="12" height="36" rx="2" fill="#1fe0d0"/><rect x="14" y="26" width="36" height="12" rx="2" fill="#1fe0d0"/></svg>`,
  { size: 256 },
);
const TECH = svg(
  `<svg viewBox="0 0 32 80"><rect x="0" y="0" width="32" height="80" rx="3" fill="#18202a"/><rect x="3" y="3" width="26" height="3" fill="#1fe0d0"/>${Array.from(
    { length: 9 },
    (_, i) => `<rect x="4" y="${11 + i * 7}" width="${6 + ((i * 7) % 20)}" height="4" fill="${i % 4 === 0 ? "#ffb347" : "#1fe0d0"}"/>`,
  ).join("")}<rect x="3" y="74" width="26" height="3" fill="#1fe0d0"/></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "cyborgMedic" });

  const ARMOR = mottle(WHITE, WHITE_SH, { size: 0.18, contrast: 0.6, seed: 3 });
  const SUIT = grain(GRAPH, GRAPH2, { size: 0.012, axis: "y", seed: 2 });

  // ---------------------------------------------------------------- helpers
  const v = (p: Pt) => (Array.isArray(p) ? new THREE.Vector3().fromArray(p) : p.clone());
  const mid = (a: Pt, c: Pt, t: number) => v(a).lerp(v(c), t);
  const P = (
    geo: THREE.BufferGeometry,
    color: Col,
    bone: Joint,
    at: Pt,
    rot?: number[],
    scale?: number | number[],
  ) => {
    const o: PartOptions = { bone, at: v(at) };
    if (rot) o.rotation = rot;
    if (scale !== undefined) o.scale = scale;
    return b.part(geo, color, o);
  };
  const seg = (a: Pt, c: Pt, r0: number, r1: number, color: Col, bone: Joint, sides = 10) => {
    const A = v(a);
    const C = v(c);
    return b.part(new THREE.CylinderGeometry(r1, r0, A.distanceTo(C), sides), color, {
      bone,
      at: A.clone().add(C).multiplyScalar(0.5),
      dir: C.clone().sub(A),
    });
  };
  const ball = (r: number, color: Col, bone: Joint, at: Pt, scale?: number[]) =>
    P(new THREE.SphereGeometry(r, 10, 7), color, bone, at, undefined, scale);
  const box = (w: number, h: number, d: number, color: Col, bone: Joint, at: Pt, rot?: number[]) =>
    P(new THREE.BoxGeometry(w, h, d), color, bone, at, rot);
  const ringAt = (at: Pt, dir: Pt, R: number, tube: number, color: Col, bone: Joint, sides = 14) =>
    b.part(new THREE.TorusGeometry(R, tube, 6, sides), color, { bone, at: v(at), dir: v(dir), axis: "z" });

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.98, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.98, 0],
      [0, 1.2, 0.005],
      [0, 1.42, 0.01],
    ],
    { parent: hips, names: ["spine1", "chest", "chestTip"], role: "spine" },
  );
  const chest = spine.joints[1];
  const chestTip = spine.joints[2];
  const neck = b.chain(
    "neck",
    [
      [0, 1.45, 0.01],
      [0, 1.57, 0.03],
    ],
    { parent: chestTip, names: ["neck", "neckTip"], role: "neck" },
  );
  const neckTip = neck.joints[1];
  const head = b.joint("head", { parent: neckTip, at: [0, 1.57, 0.03], dir: [0, 1, 0.15], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.645, 0.02], dir: [0, -0.2, 1], role: "jaw" });

  // ---------------------------------------------------------------- torso
  b.loft(
    [
      { at: [0, 0.97, 0], w: 0.34, h: 0.22 },
      { at: [0, 1.1, 0], w: 0.29, h: 0.2 },
      { at: [0, 1.25, 0.005], w: 0.32, h: 0.22 },
      { at: [0, 1.4, 0.01], w: 0.34, h: 0.22 },
    ],
    { bone: spine, color: SUIT },
  );
  const shell = b.loft(
    [
      { at: [0, 1.22, 0.02], w: 0.3, h: 0.22 },
      { at: [0, 1.33, 0.03], w: 0.4, h: 0.26 },
      { at: [0, 1.43, 0.025], w: 0.4, h: 0.25 },
      { at: [0, 1.49, 0.015], w: 0.3, h: 0.2 },
    ],
    { bone: spine, color: ARMOR },
  );
  glow(b.decal(shell, EMBLEM, { at: [0, 1.35, 0.2], dir: [0, 0, 1], size: [0.11, 0.11] }), 1.1);
  // chest cyan seams and side heal ports
  for (const s of [1, -1]) {
    glow(box(0.012, 0.1, 0.012, CYAN, chest, [s * 0.1, 1.31, 0.158], [0, 0, s * -8]));
    glow(box(0.05, 0.012, 0.012, CYAN, chest, [s * 0.145, 1.4, 0.108], [0, s * -35, 0]));
    box(0.03, 0.05, 0.02, STEEL_D, chest, [s * 0.17, 1.27, 0.085], [0, s * -50, 0]);
  }
  // collar bones / upper collar plates
  for (const s of [1, -1]) {
    box(0.1, 0.03, 0.12, ARMOR, chest, [s * 0.075, 1.5, 0.0], [0, 0, s * -18]);
    box(0.07, 0.016, 0.016, GRAPH2, chest, [s * 0.075, 1.515, 0.07], [0, 0, s * -18]);
  }
  // abs plates
  for (let i = 0; i < 3; i++)
    for (const s of [1, -1]) {
      box(0.078, 0.04, 0.022, i === 1 ? STEEL : ARMOR, spine.joints[0], [s * 0.043, 1.06 + i * 0.05, 0.1]);
    }
  // belt
  const beltPts = Array.from({ length: 8 }, (_, k) => [
    0.19 * Math.cos((k * Math.PI) / 4),
    1.03,
    0.13 * Math.sin((k * Math.PI) / 4),
  ]);
  b.sweep(catmull(beltPts, { closed: true }), 0.022, { bone: hips, color: STEEL_D });
  box(0.08, 0.07, 0.03, ARMOR, hips, [0, 1.03, 0.14]);
  glow(box(0.04, 0.03, 0.012, CYAN, hips, [0, 1.03, 0.158]));
  // pelvis plates, tabard, tail plate
  for (const s of [1, -1]) {
    box(0.07, 0.16, 0.2, ARMOR, hips, [s * 0.17, 0.97, 0], [0, 0, s * 8]);
    glow(box(0.006, 0.12, 0.02, CYAN, hips, [s * 0.207, 0.97, 0.05], [0, 0, s * 8]));
    box(0.05, 0.05, 0.05, GRAPH2, hips, [s * 0.105, 1.03, -0.12]);
  }
  box(0.15, 0.2, 0.025, ARMOR, hips, [0, 0.88, 0.125], [8, 0, 0]);
  glow(box(0.15, 0.012, 0.03, CYAN, hips, [0, 0.775, 0.14], [8, 0, 0]));
  box(0.17, 0.18, 0.025, ARMOR, hips, [0, 0.9, -0.125], [-8, 0, 0]);
  box(0.06, 0.1, 0.012, STEEL_D, hips, [0, 0.9, -0.14], [-8, 0, 0]);
  // pouches and med canisters on the belt
  for (const s of [1, -1]) {
    box(0.06, 0.07, 0.045, GRAPH2, hips, [s * 0.11, 1.0, 0.125], [0, s * -20, 0]);
    box(0.062, 0.02, 0.048, STEEL_D, hips, [s * 0.11, 1.03, 0.125], [0, s * -20, 0]);
    seg([s * 0.15, 0.96, 0.095], [s * 0.15, 1.04, 0.095], 0.016, 0.016, WHITE, hips, 8);
    glow(ball(0.014, CYAN, hips, [s * 0.15, 1.045, 0.095]));
  }

  // backpack on the chest bone
  const pack = box(0.3, 0.32, 0.12, ARMOR, chest, [0, 1.32, -0.17]);
  box(0.32, 0.03, 0.13, GRAPH2, chest, [0, 1.485, -0.17]);
  box(0.32, 0.03, 0.13, GRAPH2, chest, [0, 1.155, -0.17]);
  glow(b.decal(pack, EMBLEM, { at: [0, 1.34, -0.235], dir: [0, 0, -1], size: [0.1, 0.1] }), 1.1);
  for (const s of [1, -1]) {
    seg([s * 0.1, 1.17, -0.245], [s * 0.1, 1.47, -0.245], 0.04, 0.04, STEEL, chest, 8);
    glow(seg([s * 0.1, 1.2, -0.245], [s * 0.1, 1.44, -0.245], 0.022, 0.022, CYAN, chest, 8), 1.1);
    ringAt([s * 0.1, 1.3, -0.245], [0, 1, 0], 0.042, 0.007, STEEL_D, chest);
    ringAt([s * 0.1, 1.4, -0.245], [0, 1, 0], 0.042, 0.007, STEEL_D, chest);
    seg([s * 0.14, 1.17, -0.17], [s * 0.15, 1.1, -0.2], 0.018, 0.026, GRAPH2, chest, 8);
    b.sweep(
      catmull([
        [s * 0.12, 1.19, -0.23],
        [s * 0.2, 1.12, -0.17],
        [s * 0.2, 1.02, -0.08],
      ]),
      0.01,
      { bone: chest, color: GRAPH },
    );
  }

  // ---------------------------------------------------------------- neck and head
  b.sweep(neck, 0.045, { color: SKIN_D });
  seg([0, 1.455, 0.01], [0, 1.5, 0.012], 0.075, 0.062, GRAPH2, chestTip, 12);
  glow(ringAt([0, 1.466, 0.01], [0, 1, 0], 0.077, 0.005, CYAN, chestTip, 16));
  for (const s of [1, -1])
    b.sweep(
      catmull([
        [s * 0.03, 1.66, -0.07],
        [s * 0.05, 1.56, -0.075],
        [s * 0.06, 1.47, -0.05],
      ]),
      0.009,
      { bone: neckTip, color: GRAPH2 },
    );

  P(new THREE.SphereGeometry(1, 12, 9), SKIN, head, [0, 1.68, 0.03], undefined, [0.088, 0.1, 0.1]);
  P(new THREE.SphereGeometry(1, 10, 7), SKIN, jaw, [0, 1.615, 0.055], undefined, [0.068, 0.048, 0.07]);
  // helmet shell tilted back to leave the face open
  P(new THREE.SphereGeometry(1, 14, 9, 0, Math.PI * 2, 0, Math.PI * 0.62), ARMOR, head, [0, 1.68, 0.03], [-50, 0, 0], [
    0.105, 0.115, 0.115,
  ]);
  glow(ringAt([0, 1.6527, 0.0625], [0, 0.643, -0.766], 0.1, 0.006, CYAN, head, 20));
  // crest fin
  b.extrude(
    [
      [0, 0],
      [0.06, 0.03],
      [0.14, 0.032],
      [0.19, 0],
      [0.14, -0.02],
      [0.05, -0.012],
    ],
    { at: [0, 1.775, 0.06], x: [0, 0, -1], thickness: 0.012, bevel: 0.003, color: CYAN, bone: head },
  );
  box(0.02, 0.012, 0.1, GRAPH2, head, [0, 1.795, -0.01], [-25, 0, 0]);

  // face
  box(0.018, 0.03, 0.025, SKIN, head, [0, 1.662, 0.131], [-12, 0, 0]);
  box(0.042, 0.004, 0.008, "#5a2e2e", jaw, [0, 1.628, 0.121]);
  box(0.05, 0.006, 0.01, SKIN_D, jaw, [0, 1.616, 0.118]);
  for (const s of [1, -1]) {
    const cyber = s === -1;
    ball(0.0175, "#f4f4ee", head, [s * 0.036, 1.69, 0.113], [1, 0.9, 1]);
    if (cyber) {
      glow(ball(0.0095, CYAN, head, [s * 0.036, 1.69, 0.124]), 1.4);
      ball(0.0045, DARK, head, [s * 0.036, 1.69, 0.132]);
      ringAt([s * 0.036, 1.69, 0.119], [0, 0, 1], 0.027, 0.0045, STEEL, head, 12);
      glow(ringAt([s * 0.036, 1.69, 0.123], [0, 0, 1], 0.021, 0.0025, CYAN, head, 12));
      box(0.045, 0.012, 0.012, STEEL, head, [s * 0.037, 1.718, 0.113]);
    } else {
      ball(0.0095, IRIS, head, [s * 0.037, 1.69, 0.124]);
      ball(0.0045, DARK, head, [s * 0.037, 1.69, 0.132]);
      box(0.04, 0.008, 0.01, HAIR, head, [s * 0.037, 1.717, 0.114], [0, 0, s * 8]);
    }
  }
  // cheek plate and cyber jaw on the right side
  ball(1, STEEL, head, [-0.065, 1.648, 0.088], [0.03, 0.05, 0.03]);
  glow(box(0.004, 0.05, 0.012, CYAN, head, [-0.078, 1.645, 0.1], [0, -25, 0]));
  ball(1, STEEL, jaw, [-0.04, 1.612, 0.085], [0.028, 0.034, 0.04]);
  // headset: ear cups, boom mic, antenna
  for (const s of [1, -1]) {
    seg([s * 0.098, 1.672, 0.015], [s * 0.128, 1.672, 0.015], 0.042, 0.042, GRAPH2, head, 12);
    glow(seg([s * 0.127, 1.672, 0.015], [s * 0.134, 1.672, 0.015], 0.03, 0.03, CYAN, head, 12));
  }
  b.sweep(
    catmull([
      [-0.13, 1.665, 0.02],
      [-0.125, 1.615, 0.095],
      [-0.085, 1.598, 0.135],
    ]),
    0.005,
    { bone: head, color: STEEL_D },
  );
  glow(ball(0.01, AMBER, head, [-0.085, 1.598, 0.135]));
  seg([0.12, 1.7, -0.02], [0.14, 1.82, -0.05], 0.004, 0.003, STEEL, head, 6);
  glow(ball(0.008, CYAN, head, [0.14, 1.82, -0.05]));
  // ponytail
  const tail = catmull([
    [0, 1.7, -0.085],
    [0, 1.69, -0.16],
    [0, 1.61, -0.21],
    [0, 1.5, -0.19],
  ]);
  b.sweep(tail, [0.034, 0.03, 0.02, 0.005], { bone: head, color: HAIR, caps: { start: "flat", end: "point" } });
  glow(ringAt(tail.at(0.3), tail.tangentAt(0.3), 0.036, 0.007, CYAN, head));
  // side-swept bangs under the helmet rim
  for (const s of [1, -1]) box(0.03, 0.05, 0.02, HAIR, head, [s * 0.07, 1.705, 0.1], [-10, s * -25, s * 20]);

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const S = s === 1 ? "L" : "R";
    const cyborg = s === -1;
    const pts = limb([s * 0.1, 0.93, 0], [s * 0.105, 0.095, 0.02], [0.46, 0.42], [0, 0, 1]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.105, 0, 0.07],
    });
    const hipJ = leg.joints[0];
    const kneeJ = leg.joints[1];
    const footJ = leg.joints[2];
    const H = pts[0];
    const K = pts[1];
    const A = pts[2];
    b.sweep(leg, [0.088, 0.074, 0.062, 0.052], { color: SUIT });

    // thigh
    seg(mid(H, K, 0.1), mid(H, K, 0.78), 0.102, 0.086, ARMOR, hipJ, 10);
    ringAt(mid(H, K, 0.8), K.clone().sub(H), 0.088, 0.008, GRAPH2, hipJ);
    glow(ringAt(mid(H, K, 0.2), K.clone().sub(H), 0.104, 0.005, CYAN, hipJ));
    box(0.012, 0.22, 0.012, GRAPH2, hipJ, [s * 0.19, mid(H, K, 0.45).y, 0.01]);
    // knee guard
    ball(0.07, ARMOR, kneeJ, [K.x, K.y, K.z + 0.045], [1, 1.1, 0.85]);
    glow(ball(0.011, CYAN, kneeJ, [K.x, K.y + 0.005, K.z + 0.105]));
    ringAt(K, [s * 1, 0, 0], 0.062, 0.012, GRAPH2, kneeJ, 10);

    if (!cyborg) {
      // armoured greave
      seg(mid(K, A, 0.14), mid(K, A, 0.86), 0.07, 0.056, ARMOR, kneeJ, 10);
      b.frustumBox(
        v(mid(K, A, 0.12)).add(new THREE.Vector3(0, 0, 0.05)),
        v(mid(K, A, 0.8)).add(new THREE.Vector3(0, 0, 0.04)),
        [0.07, 0.03],
        [0.05, 0.022],
        { bone: kneeJ, color: WHITE_SH },
      );
      glow(
        b.frustumBox(
          v(mid(K, A, 0.2)).add(new THREE.Vector3(0, 0, 0.066)),
          v(mid(K, A, 0.7)).add(new THREE.Vector3(0, 0, 0.056)),
          [0.012, 0.008],
          [0.01, 0.008],
          { bone: kneeJ, color: CYAN },
        ),
      );
      // thigh injector holster (left only)
      if (s === 1) {
        box(0.045, 0.2, 0.06, GRAPH2, hipJ, [0.21, mid(H, K, 0.48).y, 0.015]);
        seg([0.215, mid(H, K, 0.38).y, 0.06], [0.215, mid(H, K, 0.62).y, 0.06], 0.016, 0.016, WHITE, hipJ, 8);
        glow(seg([0.215, mid(H, K, 0.62).y, 0.06], [0.215, mid(H, K, 0.7).y, 0.06], 0.01, 0.006, AMBER, hipJ, 8));
      }
    } else {
      // exposed robotic shin: pistons and shroud plates
      for (const t of [-1, 1]) {
        seg(
          v(mid(K, A, 0.18)).add(new THREE.Vector3(t * 0.045, 0, 0.03)),
          v(mid(K, A, 0.82)).add(new THREE.Vector3(t * 0.04, 0, 0.03)),
          0.012,
          0.012,
          STEEL,
          kneeJ,
          6,
        );
      }
      glow(
        b.frustumBox(
          v(mid(K, A, 0.16)).add(new THREE.Vector3(0, 0, 0.05)),
          v(mid(K, A, 0.84)).add(new THREE.Vector3(0, 0, 0.04)),
          [0.02, 0.012],
          [0.018, 0.012],
          { bone: kneeJ, color: CYAN },
        ),
      );
      b.frustumBox(
        v(mid(K, A, 0.14)).add(new THREE.Vector3(s * 0.045, 0, -0.01)),
        v(mid(K, A, 0.5)).add(new THREE.Vector3(s * 0.04, 0, -0.01)),
        [0.025, 0.07],
        [0.02, 0.06],
        { bone: kneeJ, color: ARMOR },
      );
      for (const t of [0.3, 0.55, 0.78]) ringAt(mid(K, A, t), A.clone().sub(K), 0.062 - t * 0.012, 0.01, STEEL_D, kneeJ, 10);
    }
    // calf armour at the back
    seg(mid(K, A, 0.12), mid(K, A, 0.55), 0.068, 0.062, cyborg ? STEEL_D : ARMOR, kneeJ, 9);

    // boot
    const x = s * 0.105;
    box(0.11, 0.025, 0.28, STEEL_D, footJ, [x, 0.0125, 0.07]);
    box(0.1, 0.07, 0.25, GRAPH2, footJ, [x, 0.06, 0.07]);
    ball(0.05, ARMOR, footJ, [x, 0.058, 0.17], [1, 0.75, 1.1]);
    box(0.09, 0.03, 0.12, ARMOR, footJ, [x, 0.108, 0.05], [-6, 0, 0]);
    box(0.1, 0.07, 0.06, GRAPH, footJ, [x, 0.06, -0.04]);
    seg([x, 0.09, 0.02], [x, 0.21, 0.015], 0.064, 0.058, cyborg ? STEEL : ARMOR, footJ, 10);
    glow(ringAt([x, 0.125, 0.019], [0, 1, 0], 0.066, 0.005, CYAN, footJ));
    for (const t of [1, -1]) glow(box(0.004, 0.012, 0.2, CYAN, footJ, [x + t * 0.056, 0.032, 0.07]));
  }

  // ---------------------------------------------------------------- arms
  const S0 = (s: number) => new THREE.Vector3(s * 0.22, 1.39, 0);
  const E0 = (s: number) => new THREE.Vector3(s * 0.35, 1.13, -0.02);
  const W0 = (s: number) => new THREE.Vector3(s * 0.445, 0.875, 0.07);
  let staffHand: Joint | null = null;

  for (const s of [1, -1]) {
    const S = s === 1 ? "L" : "R";
    const cyborg = s === -1;
    const a = S0(s);
    const e = E0(s);
    const w = W0(s);
    const arm = b.chain(`arm${S}`, [a, e, w], {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const uArm = arm.joints[0];
    const fArm = arm.joints[1];
    const wrist = arm.joints[2];
    const d1 = e.clone().sub(a);
    const d2 = w.clone().sub(e);
    b.sweep(arm, [0.058, 0.052, 0.046, 0.04], { color: cyborg ? STEEL_D : SUIT });

    // pauldron: dome tilted outward with a cyan rim
    const k = cyborg ? 0.85 : 1;
    P(new THREE.SphereGeometry(0.1 * k, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), ARMOR, uArm, [s * 0.235, 1.415, 0], [0, 0, -s * 35], [1, 0.9, 1.05]);
    const axis = new THREE.Vector3(s * Math.sin(Math.PI * (35 / 180)), Math.cos(Math.PI * (35 / 180)), 0);
    glow(
      ringAt(
        new THREE.Vector3(s * 0.235, 1.415, 0).addScaledVector(axis, -0.0156 * k * 10),
        axis,
        0.1 * k,
        0.006,
        CYAN,
        uArm,
        16,
      ),
    );
    box(0.02, 0.03, 0.06, GRAPH2, uArm, [s * 0.3, 1.46, 0], [0, 0, -s * 35]);

    if (!cyborg) {
      // human left arm in white sleeve armour
      seg(mid(a, e, 0.3), mid(a, e, 0.62), 0.063, 0.058, ARMOR, uArm, 10);
      glow(ringAt(mid(a, e, 0.3), d1, 0.065, 0.006, CYAN, uArm));
      ringAt(mid(a, e, 0.66), d1, 0.06, 0.007, GRAPH2, uArm);
      ball(0.058, ARMOR, fArm, [e.x, e.y, e.z - 0.03], [1, 1, 0.9]);
      seg(mid(e, w, 0.16), mid(e, w, 0.8), 0.058, 0.05, ARMOR, fArm, 10);
      glow(ringAt(mid(e, w, 0.45), d2, 0.06, 0.006, CYAN, fArm));
      ringAt(mid(e, w, 0.14), d2, 0.06, 0.008, GRAPH2, fArm);
      box(0.04, 0.07, 0.014, STEEL_D, fArm, [e.x + 0.02, mid(e, w, 0.62).y, mid(e, w, 0.62).z + 0.05], [-20, 0, 0]);
    } else {
      // robotic right arm: pistons, servo rings, exposed core, armour plates
      ball(0.065, STEEL, uArm, a);
      ringAt(a, [s, 0, 0], 0.062, 0.008, GRAPH2, uArm, 10);
      for (const t of [-1, 1]) {
        seg(
          mid(a, e, 0.15).add(new THREE.Vector3(t * 0.045, 0, 0.0)),
          mid(a, e, 0.82).add(new THREE.Vector3(t * 0.045, 0, 0.0)),
          0.013,
          0.013,
          STEEL,
          uArm,
          6,
        );
      }
      for (const t of [0.25, 0.5, 0.75]) ringAt(mid(a, e, t), d1, 0.058 - t * 0.008, 0.01, GRAPH2, uArm, 10);
      glow(seg(mid(a, e, 0.2), mid(a, e, 0.8), 0.012, 0.012, CYAN, uArm, 6).mesh);
      ball(0.058, STEEL, fArm, e);
      glow(ringAt(e, [s, 0, 0], 0.052, 0.008, CYAN, fArm, 10));
      for (const t of [0.22, 0.45, 0.68]) ringAt(mid(e, w, t), d2, 0.05, 0.01, GRAPH2, fArm, 10);
      for (const t of [-1, 1])
        seg(
          mid(e, w, 0.1).add(new THREE.Vector3(t * 0.04, 0, 0.012)),
          mid(e, w, 0.85).add(new THREE.Vector3(t * 0.04, 0, 0.012)),
          0.009,
          0.009,
          STEEL,
          fArm,
          6,
        );
      glow(seg(mid(e, w, 0.15), mid(e, w, 0.8), 0.008, 0.008, CYAN, fArm, 6).mesh);
      // outer armour plate with tech readout
      const pa = mid(e, w, 0.12).add(new THREE.Vector3(s * 0.052, 0, 0));
      const pb = mid(e, w, 0.78).add(new THREE.Vector3(s * 0.05, 0, 0));
      b.frustumBox(pa, pb, [0.026, 0.07], [0.022, 0.058], { bone: fArm, color: ARMOR });
      b.part(new THREE.PlaneGeometry(0.045, 0.11), "#ffffff", {
        bone: fArm,
        at: mid(pa, pb, 0.5).add(new THREE.Vector3(s * 0.015, 0, 0)),
        dir: [s, 0, 0],
        axis: "z",
        texture: TECH,
      });
    }
    // wrist cuff
    seg(mid(e, w, 0.84), mid(e, w, 1.0), 0.052, 0.047, cyborg ? WHITE_SH : GRAPH2, fArm, 10);

    // hands
    const finger = (name: string, p: number[][], r: number[], color: Col) => {
      const ch = b.chain(name, p, { parent: wrist, names: [`${name}1`, `${name}2`, `${name}3`], role: "digit" });
      b.sweep(ch, r, { color });
    };
    if (cyborg) {
      box(0.07, 0.085, 0.032, STEEL, wrist, [s * 0.455, 0.835, 0.095], [-12, 0, 0]);
      box(0.012, 0.06, 0.05, ARMOR, wrist, [s * 0.492, 0.84, 0.095]);
      glow(box(0.004, 0.04, 0.012, CYAN, wrist, [s * 0.499, 0.84, 0.095]));
      const names = ["index", "middle", "ring", "pinky"];
      const lens = [0.048, 0.054, 0.05, 0.04];
      names.forEach((nm, i) => {
        const x = s * 0.455 + (i - 1.5) * 0.0165;
        const l = lens[i];
        const y1 = 0.8 - l * 0.55;
        const y2 = y1 - l * 0.45 * 0.9;
        finger(`${nm}${S}`, [[x, 0.8, 0.098], [x, y1, 0.104], [x, y2, 0.122]], [0.0095, 0.008, 0.0065], STEEL);
        glow(ball(0.0055, CYAN, wrist, [x, y2 - 0.003, 0.124]));
      });
      finger(`thumb${S}`, [[s * 0.42, 0.85, 0.1], [s * 0.412, 0.82, 0.118], [s * 0.418, 0.795, 0.135]], [0.011, 0.009, 0.007], STEEL);
    } else {
      staffHand = wrist;
      box(0.075, 0.095, 0.04, GRAPH, wrist, [0.455, 0.84, 0.095], [-10, 0, 0]);
      box(0.06, 0.05, 0.014, ARMOR, wrist, [0.455, 0.865, 0.072], [-10, 0, 0]);
      const names = ["index", "middle", "ring", "pinky"];
      names.forEach((nm, i) => {
        const y = 0.87 - i * 0.02;
        finger(`${nm}${S}`, [[0.494, y, 0.105], [0.49, y, 0.158], [0.44, y, 0.172]], [0.0095, 0.0085, 0.0075], GRAPH2);
      });
      finger(`thumb${S}`, [[0.43, 0.885, 0.105], [0.44, 0.892, 0.165], [0.48, 0.887, 0.168]], [0.011, 0.01, 0.008], GRAPH2);
    }
  }

  // ---------------------------------------------------------------- healing staff (held in the left hand)
  const staff = b.joint("staff", { parent: staffHand as unknown as Joint, at: [0.46, 0.86, 0.13], dir: [0, 1, 0] });
  const sx = 0.46;
  const sz = 0.13;
  const at = (y: number): number[] => [sx, y, sz];
  seg(at(0.0), at(0.1), 0.012, 0.022, GRAPH2, staff, 8);
  glow(ringAt(at(0.1), [0, 1, 0], 0.024, 0.005, CYAN, staff));
  seg(at(0.1), at(0.5), 0.021, 0.021, ARMOR, staff, 8);
  glow(ringAt(at(0.5), [0, 1, 0], 0.023, 0.005, CYAN, staff));
  seg(at(0.5), at(0.72), 0.018, 0.018, STEEL_D, staff, 8);
  seg(at(0.72), at(0.97), 0.023, 0.023, GRAPH, staff, 8);
  ringAt(at(0.72), [0, 1, 0], 0.025, 0.006, STEEL, staff);
  ringAt(at(0.97), [0, 1, 0], 0.025, 0.006, STEEL, staff);
  seg(at(0.97), at(1.52), 0.018, 0.018, STEEL, staff, 8);
  seg(at(1.18), at(1.24), 0.027, 0.027, ARMOR, staff, 8);
  glow(ringAt(at(1.3), [0, 1, 0], 0.02, 0.004, CYAN, staff));
  glow(ringAt(at(1.4), [0, 1, 0], 0.02, 0.004, CYAN, staff));
  seg(at(1.52), at(1.585), 0.018, 0.04, ARMOR, staff, 8);
  glow(ringAt(at(1.585), [0, 1, 0], 0.041, 0.005, CYAN, staff));
  // orb and gyro rings
  const orb = [sx, 1.67, sz];
  glow(ball(0.052, CYAN, staff, orb), 1.6);
  glow(ball(0.025, "#e8fffc", staff, orb), 1.2);
  ringAt(orb, [0, 0, 1], 0.092, 0.009, ARMOR, staff, 20);
  glow(ringAt(orb, [1, 0, 0], 0.075, 0.005, CYAN, staff, 18), 1.3);
  glow(ringAt(orb, [0, 0, 1], 0.07, 0.004, CYAN, staff, 18), 1.2);
  for (const t of [0, 1, 2, 3]) {
    const ang = (t * Math.PI) / 2;
    ball(0.01, STEEL, staff, [sx + 0.092 * Math.cos(ang), 1.67 + 0.092 * Math.sin(ang), sz]);
  }
  // wings
  const wing = [
    [0, 0],
    [0.12, -0.01],
    [0.22, 0.07],
    [0.28, 0.2],
    [0.2, 0.17],
    [0.14, 0.1],
    [0.07, 0.07],
    [0, 0.07],
  ].map(([x, y]) => [x * 0.85, y * 0.85]);
  const glowWing = [
    [0.05, 0.02],
    [0.12, 0.02],
    [0.19, 0.08],
    [0.22, 0.15],
    [0.17, 0.12],
    [0.12, 0.07],
    [0.07, 0.045],
    [0.05, 0.045],
  ].map(([x, y]) => [x * 0.85, y * 0.85]);
  for (const s of [1, -1]) {
    b.extrude(wing, { at: [sx + s * 0.022, 1.59, sz], x: [s, 0, 0], thickness: 0.012, bevel: 0.003, color: ARMOR, bone: staff });
    glow(
      b.extrude(glowWing, { at: [sx + s * 0.022, 1.59, sz], x: [s, 0, 0], thickness: 0.018, color: CYAN, bone: staff }),
      1.3,
    );
  }
  // staff foot spike glow dot
  glow(ball(0.008, CYAN_D, staff, [sx, 0.03, sz + 0.02]));

  return b.root;
}
