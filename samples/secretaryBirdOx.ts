// Secretary Bird · Ox — a 1.3 m secretary bird at rest: long black-feathered thighs and
// bare scaly shins, grey body with pale belly, black wings held slightly out, two long
// black central tail feathers, a bare orange-red face, a hooked grey beak with a separate
// lower jaw, and a fan of long black-tipped quills behind the head.
import * as THREE from "three";
import { createBuilder, type OutlinePoint } from "../src/builder";
import type { JointRef } from "../src/context";
import { frame, line } from "../src/frame";
import { lerp, offset, rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import { limb } from "../src/ik";
import { countershade, mottle, paint, scales, smoothstep, mix } from "../src/paint";
import { svg } from "../src/texture";

type V3 = [number, number, number];

// Palette
const SLATE = "#98a1ab"; // grey back and wing coverts
const SLATE_L = "#aab2bc"; // lighter grey mottle / crest vane
const SLATE_D = "#7d848f"; // darker grey: wing arm, outer tail feathers
const PEARL = "#dedcd2"; // pale underparts
const INK = "#23252b"; // black flight feathers, thigh trousers, tail spikes
const QUILL = "#c9c0ad"; // pale quill shaft
const FACE = "#c94e26"; // bare orange-red face skin
const BEAK = "#9aa4ae"; // grey beak
const BEAK_D = "#565e6a"; // dark beak tip, nail, nostril
const EYE = "#17110b"; // dark eye
const SCUTE = "#c3b5a4"; // leg scales
const SCUTE_D = "#8e8172"; // scale edges
const CLAW = "#3a3d44"; // claws

const toVec = (v: V3 | THREE.Vector3) => (v instanceof THREE.Vector3 ? v.clone() : new THREE.Vector3(...v));
const dir = (v: V3 | THREE.Vector3) => toVec(v).normalize();

// A stylised flight-feather silhouette, drawn in its own plane (x along the shaft).
const featherOutline = (L: number, w: number): OutlinePoint[] => [
  [0, 0],
  [0.2 * L, 0.5 * w],
  [0.62 * L, 0.5 * w],
  [L, 0.02 * w, "sharp"],
  [0.62 * L, -0.5 * w],
  [0.2 * L, -0.5 * w],
];

export default function build() {
  const b = createBuilder({ name: "secretaryBirdOx" });

  // Coat: grey back, pale belly, faint mottle.
  const coat = countershade(mottle(SLATE, SLATE_L, { size: 0.07, seed: 21 }), PEARL, { level: -0.35 });
  const trousers = mottle("#34373e", "#454952", { size: 0.05, seed: 8 });
  const legSkin = scales(SCUTE, SCUTE_D, { size: 0.016, width: 0.42, seed: 5 });
  const toeSkin = scales(SCUTE, SCUTE_D, { size: 0.009, width: 0.45, seed: 9 });

  // One flight feather: flat slab from `base` toward tip point `tip`, width perpendicular.
  const feather = (base: V3 | THREE.Vector3, tip: V3 | THREE.Vector3, span: V3, L: number, w: number, color: string, bone?: JointRef, thick = 0.005) =>
    b.extrude(featherOutline(L, w), {
      at: base,
      x: toVec(tip).sub(toVec(base)).normalize(),
      y: span,
      thickness: thick,
      bevel: thick * 0.3,
      smoothing: 1,
      color,
      bone,
    });

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.79, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.79, 0],
      [0, 0.885, 0.045],
      [0, 0.955, 0.1],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const chest = spine.joints[1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.955, 0.1],
      [0, 1.07, 0.185],
      [0, 1.14, 0.25],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.155, 0.28], dir: [0, -0.06, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.129, 0.342], dir: [0, -0.5, 1], role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.78, -0.07],
      [0, 0.755, -0.2],
      [0, 0.73, -0.3],
    ]),
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );

  // ---------------------------------------------------------------- legs
  const fringeTex = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 62 C10 48 10 22 16 3 C22 22 22 48 16 62 Z" fill="#3f434c"/><line x1="16" y1="6" x2="16" y2="59" stroke="#6b7078" stroke-width="2.4"/></svg>`,
    { size: 128 },
  );

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipPt: V3 = [s * 0.09, 0.78, 0.005];
    const pts = limb(hipPt, [s * 0.118, 0.09, 0.015], [0.31, 0.4], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const [knee, ankle] = [pts[1], pts[2]];
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.12, 0.004, 0.055],
    });

    // Feathered thigh: a thick black tube over the femur, ragged feather fringe behind.
    const shinDir = toVec(ankle).sub(toVec(knee)).normalize();
    const femur = b.sweep(polyline([hipPt, offset(knee, shinDir, 0.025)]), [0.052, 0.043], {
      bone: leg,
      color: trousers,
      detail: 0.6,
    });
    b.cards([0.28, 0.42, 0.56, 0.7, 0.84].map((t) => femur.at(t, 196)), fringeTex, {
      size: [0.027, 0.048],
      lean: 70,
      bend: 32,
      flow: [0, -0.5, -1],
      vary: 0.25,
      rng: rng(s * 7 + 3),
    });

    // Ragged hem: short dark feathers hanging from the cuff.
    const cuffC = new THREE.Vector3(...offset(knee, shinDir, 0.022));
    const hemU = new THREE.Vector3().crossVectors(shinDir, new THREE.Vector3(0, 0, 1)).normalize();
    const hemV = new THREE.Vector3().crossVectors(shinDir, hemU).normalize();
    b.cards(
      [0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const around = hemU.clone().multiplyScalar(Math.cos(rad) * 0.04).add(hemV.clone().multiplyScalar(Math.sin(rad) * 0.04));
        return frame(cuffC.clone().add(around), [0, 1, 0]);
      }),
      fringeTex,
      { size: [0.026, 0.05], lean: 180, flow: [0, -1, -0.2], vary: 0.3, rng: rng(s * 11 + 1) },
    );

    // Bare scaly shin.
    b.sweep(polyline([knee, ankle]), [0.024, 0.02], { bone: leg, color: legSkin, detail: 0.6 });

    // Toes: long mid toe, two splayed, hallux back; dark claws.
    const toeDefs: Array<{ name: string; claw: string; path: (V3 | THREE.Vector3)[] }> = [
      { name: `toe${side}`, claw: `claw${side}`, path: [ankle, [s * 0.124, 0.036, 0.052], [s * 0.128, 0.007, 0.088]] },
      { name: `toe2${side}`, claw: `claw2${side}`, path: [ankle, [s * 0.146, 0.034, 0.03], [s * 0.158, 0.007, 0.042]] },
      { name: `toe3${side}`, claw: `claw3${side}`, path: [ankle, [s * 0.1, 0.034, 0.028], [s * 0.09, 0.007, 0.04]] },
      { name: `hallux${side}`, claw: `halluxClaw${side}`, path: [ankle, [s * 0.112, 0.05, -0.008], [s * 0.106, 0.014, -0.03]] },
    ];
    for (const td of toeDefs) {
      const chain = b.chain(td.name, td.path, { parent: leg.joints[2], names: [td.name, td.claw], role: "digit" });
      b.sweep(polyline(td.path), [0.012, 0.0038], { bone: chain, color: toeSkin, bands: [[0.78, CLAW]], caps: "point", detail: 0.4 });
    }
  }

  // ---------------------------------------------------------------- body
  b.loft(
    [
      { at: [0, 0.775, -0.01], w: 0.15, h: 0.14 },
      { at: [0, 0.85, 0.03], w: 0.21, h: 0.19 },
      { at: [0, 0.925, 0.085], w: 0.205, h: 0.175 },
      { at: [0, 0.975, 0.125], w: 0.14, h: 0.13 },
    ],
    { bone: spine, color: coat },
  );
  b.sweep(neck, [0.052, 0.045, 0.039], { color: coat });
  b.sweep(tail, [0.055, 0.028], { color: coat, caps: { end: "flat" } });

  // Central black tail spikes, long, drooping back.
  for (const s of [1, -1]) {
    feather([s * 0.022, 0.74, -0.285], [s * 0.042, 0.615, -0.585], [1, 0, 0], 0.335, 0.034, INK, tail.joints[1]);
  }
  // Shorter grey rectrices splayed either side.
  for (const s of [1, -1]) {
    feather([s * 0.03, 0.745, -0.265], [s * 0.125, 0.635, -0.468], [1, 0, 0], 0.25, 0.036, SLATE_D, tail.joints[1]);
    feather([s * 0.03, 0.745, -0.265], [s * 0.066, 0.635, -0.492], [1, 0, 0], 0.27, 0.036, SLATE_D, tail.joints[1]);
    feather([s * 0.024, 0.748, -0.262], [s * 0.026, 0.642, -0.484], [1, 0, 0], 0.235, 0.034, SLATE_D, tail.joints[1]);
  }
  // Pale under-tail coverts.
  for (const s of [1, -1]) {
    feather([s * 0.025, 0.745, -0.25], [s * 0.027, 0.68, -0.35], [1, 0, 0], 0.12, 0.03, PEARL, tail.joints[0]);
  }

  // ---------------------------------------------------------------- wings, held slightly out
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const elbow: V3 = [s * 0.17, 0.858, 0.0];
    const wrist: V3 = [s * 0.245, 0.832, -0.1];
    const hand: V3 = [s * 0.312, 0.798, -0.182];
    const wing = b.chain(`wing${side}`, [[s * 0.07, 0.915, 0.08], elbow, wrist, hand], {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "wing",
    });
    b.sweep(wing, [0.042, 0.034, 0.027, 0.013], { color: SLATE_D });
    const span: V3 = [s, 0, 0.3];

    // Secondaries along the forearm's trailing edge.
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const base = new THREE.Vector3(...lerp(elbow, wrist, t)).add(new THREE.Vector3(0, -0.006, -0.004));
      const along = base.clone().add(dir([s * 0.06, -0.5, -1]).multiplyScalar(0.215));
      feather(base, along, span, 0.215, 0.045, INK, wing.joints[1]);
    }
    // Primaries fanning out along the hand, tips angling out and down.
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const base = new THREE.Vector3(...lerp(wrist, hand, 0.08 + 0.92 * t));
      const along = base.clone().add(dir([s * (0.1 + 0.5 * t), -0.4 - 0.1 * t, -1]).multiplyScalar(0.28 - 0.09 * t));
      feather(base, along, span, 0.28 - 0.09 * t, 0.042, INK, wing.joints[2]);
    }
    // Grey coverts covering the feather roots.
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const base = new THREE.Vector3(...lerp(elbow, wrist, t * 0.75))
        .add(new THREE.Vector3(0, 0.014, 0.012))
        .add(new THREE.Vector3(s * 0.02 * t, 0, 0));
      const along = base.clone().add(dir([s * 0.04, -0.18, -1]).multiplyScalar(0.125));
      feather(base, along, span, 0.125, 0.038, SLATE, wing.joints[1], 0.004);
    }
  }

  // ---------------------------------------------------------------- head
  // Bare orange-red face around the eyes and beak base, painted on the skull.
  const faceC = new THREE.Vector3(0, 1.148, 0.352);
  const eyeC = new THREE.Vector3(0.044, 1.176, 0.313);
  const facePaint = paint((p) => {
    const d = Math.min(p.distanceTo(faceC), p.distanceTo(eyeC), p.distanceTo(new THREE.Vector3(-eyeC.x, eyeC.y, eyeC.z)));
    return mix(SLATE, FACE, smoothstep(0.052, 0.036, d));
  });
  b.part(new THREE.SphereGeometry(0.052, 10, 8), facePaint, {
    bone: head,
    at: [0, 1.163, 0.298],
    scale: [0.9, 0.92, 1.25],
    flat: true,
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0135, 8, 6), EYE, { bone: head, at: [s * 0.044, 1.176, 0.316], flat: true });
    b.part(new THREE.SphereGeometry(0.0032, 6, 4), BEAK_D, { bone: head, at: [s * 0.006, 1.1665, 0.3605], flat: true });
  }

  // Hooked upper beak, dark toward the tip.
  b.extrude(
    [
      [0, 0.012],
      [0.045, 0.02],
      [0.08, 0.012],
      [0.104, -0.026, "sharp"],
      [0.088, -0.006],
      [0.045, -0.002],
      [0, -0.012],
    ],
    {
      at: [0, 1.146, 0.345],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.017,
      bevel: 0.002,
      smoothing: 1,
      color: paint((_p, _n, s) => (s[0] > 0.08 ? BEAK_D : BEAK)),
      bone: head,
    },
  );
  // Lower beak on its own jaw joint.
  b.extrude(
    [
      [0, 0.005],
      [0.035, 0.004],
      [0.06, 0.009],
      [0.042, 0.012],
      [0, 0.012],
    ],
    {
      at: [0, 1.129, 0.342],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.014,
      bevel: 0.0015,
      smoothing: 1,
      color: BEAK_D,
      bone: jaw,
    },
  );

  // Quill-pen crest: a fan of grey feathers with black tips behind the head.
  b.ring(
    line([-0.01, 1.196, 0.248], [0.01, 1.196, 0.248]),
    { count: 11, radius: 0.011, fromDeg: 240, toDeg: 322, joints: 4, name: "crest", role: "fan", parent: head },
    (quill) => {
      const t = quill.t;
      const L = 0.1 + 0.06 * Math.sin(Math.PI * t);
      const droop = new THREE.Vector3(0, -0.04, -0.12).multiplyScalar(L * (1.1 - Math.sin(Math.PI * t)));
      const path = catmull([
        quill.at,
        offset(quill, quill.outward, L * 0.45),
        new THREE.Vector3(...offset(quill, quill.outward, L * 0.75)).add(droop.clone().multiplyScalar(0.4)),
        new THREE.Vector3(...offset(quill, quill.outward, L)).add(droop),
      ]);
      const baseP = toVec(quill.at);
      const crestColor = paint((p) => {
        const d = p.distanceTo(baseP) / L;
        return d > 0.52 ? INK : d > 0.12 ? SLATE_D : QUILL;
      });
      b.sweep(path, [0.0072, 0.002], { color: crestColor, caps: "point", detail: 0.6 });
    },
  );

  return b.root;
}

export const meta = {
  name: "Secretary Bird · Ox",
  description:
    "A 1.3 m secretary bird at rest: black-feathered thighs over bare scaly shins, grey coat with a pale belly, black wings held slightly out, two long black central tail feathers, a bare orange-red face, a hooked grey beak with a separate lower jaw and a fan of black-tipped quill feathers behind the head.",
};
