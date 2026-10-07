import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { line } from "../src/frame";
import type { Segment } from "../src/frame";
import { limb } from "../src/ik";
import type { Joint } from "../src/skeleton";
import { mid, rng, vec } from "../src/math";
import type { V3 } from "../src/math";
import { cells, countershade, gradient, mix, noise, paint, resolve, smoothstep, stripes } from "../src/paint";
import { bezier, catmull, polyline } from "../src/path";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Ember-Fang Manticore",
  description:
    "A towering lion-bodied manticore with bat wings and a scorpion tail: crimson flame mane, curved horns, runed gold trim and teal venom glow, in a League of Legends style.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---- palette: warm amber coat against deep violet wings, hot-pink mane, one teal magic accent ----
const FUR = "#e9852d";
const FUR_D = "#a53b1c";
const FUR_L = "#f7b25a";
const CREAM = "#f8dca2";
const SOCK = "#5a1f2e";
const MANE_D = "#5a0f3c";
const MANE_CORE = "#74123f";
const MANE = "#c4205f";
const MANE_HI = "#ff5a8c";
const WING_D = "#1d1352";
const WING_M = "#4a2aa6";
const WING_HI = "#c13fd6";
const WING_V = "#0f0a33";
const BONE = "#2a1b5e";
const HORN = "#f5e8c8";
const HORN_D = "#3a2150";
const GOLD = "#ffc43a";
const GOLD_D = "#a9690f";
const CH_A = "#3b1f78";
const CH_B = "#5b34b3";
const CH_D = "#1c0f45";
const TEAL = "#35fff0";
const VENOM = "#63ffb0";
const NOSE = "#2a0f1f";
const MOUTH = "#7a1230";
const TONGUE = "#e0507a";
const TEETH = "#fff6e0";
const CLAW = "#f2e6c6";

// ---- drawings ----
const EYE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32">
  <path d="M1 25 Q26 0 63 3 Q40 33 1 25Z" fill="#14061f"/>
  <path d="M6 24 Q28 7 57 7 Q38 29 6 24Z" fill="#35fff0"/>
  <path d="M30 9 Q35 17 31 26 Q26 17 30 9Z" fill="#06141a"/>
  <circle cx="22" cy="16" r="2.6" fill="#ffffff"/>
</svg>`,
  { size: 128 },
);
const RUNE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="27" fill="none" stroke="#35fff0" stroke-width="3"/>
  <path d="M32 8 L53 44 L11 44Z" fill="none" stroke="#35fff0" stroke-width="3" stroke-linejoin="round"/>
  <path d="M32 22 V52 M20 34 H44" fill="none" stroke="#35fff0" stroke-width="3" stroke-linecap="round"/>
  <circle cx="32" cy="35" r="4.5" fill="#35fff0"/>
  <circle cx="32" cy="6" r="3" fill="#35fff0"/>
</svg>`,
  { size: 256 },
);
const BROWMARK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 48">
  <path d="M48 2 L60 20 L48 14 L36 20Z" fill="#3a0f1a"/>
  <path d="M44 22 L50 46 L40 30Z M52 22 L56 46 L58 30Z" fill="#3a0f1a"/>
  <path d="M30 14 L4 8 L18 22 L2 24 L26 30Z" fill="#3a0f1a"/>
  <path d="M66 14 L92 8 L78 22 L94 24 L70 30Z" fill="#3a0f1a"/>
</svg>`,
  { size: 192 },
);
const CHEEK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32">
  <path d="M0 4 L44 8 L8 11Z M0 14 L40 18 L6 21Z M2 24 L34 27 L8 30Z" fill="#6a1d17"/>
</svg>`,
  { size: 96 },
);
const TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
  <path d="M16 0 C5 20 2 44 7 64 L25 64 C30 44 27 20 16 0Z" fill="#ffffff"/>
  <path d="M16 6 C11 24 10 44 13 64" fill="none" stroke="#c4c4c4" stroke-width="2.5"/>
  <path d="M20 14 C20 30 21 46 23 64" fill="none" stroke="#d6d6d6" stroke-width="2.2"/>
</svg>`,
  { size: 128 },
);
const LOCK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 96">
  <path d="M9 96 C1 70 5 36 22 0 C27 32 31 64 23 96Z" fill="#ffffff"/>
  <path d="M13 96 C9 70 13 44 21 12" fill="none" stroke="#a8a8a8" stroke-width="3"/>
  <path d="M19 96 C18 76 20 56 25 36" fill="none" stroke="#c8c8c8" stroke-width="2.5"/>
</svg>`,
  { size: 192 },
);

// ---- paints ----
const coatBase = countershade(stripes(FUR, FUR_D, { size: 0.17, width: 0.38 }), CREAM, { level: -0.4, soft: 0.25 });
const coat = paint((p, n) => mix(resolve(coatBase, p, n), "#6e2410", 0.55 * smoothstep(0.55, 0.98, n.y)));
const legCoat = gradient(coat, SOCK, [0, 0.55, 0], [0, 0.08, 0]);
const tailPaint = paint((_p, n, s) => {
  const seg = Math.floor(s[0] * 8 * 0.9999);
  let c = mix(seg % 2 ? CH_B : CH_A, "#a47bff", 0.4 * smoothstep(0.2, 0.95, n.y));
  c = mix(c, CH_D, 0.55 * smoothstep(0.1, 0.8, -n.y));
  const u = (s[0] * 8) % 1;
  c = mix(c, CH_D, 0.5 * Math.max(smoothstep(0.82, 1, u), 1 - smoothstep(0, 0.16, u)));
  return s[0] < 0.1 ? FUR : c;
});
const wingSkin = paint((p, _n, s) => {
  let c = mix(WING_D, WING_M, smoothstep(0.0, 0.75, s[0]) * (0.75 + 0.35 * noise(p, 0.35, 3)));
  const cl = cells(p, 0.3, 5);
  if (cl.d2 - cl.d1 < 0.035) c = mix(c, WING_V, 0.7);
  c = mix(c, WING_HI, smoothstep(0.72, 1, s[0]) * 0.85);
  return Math.abs(s[1] - 0.5) < 0.014 ? TEAL : c;
});

export default function build() {
  const b = createBuilder({ name: "manticore", paintSize: 2048 });

  // ================= skeleton =================
  const hips = b.joint("hips", { at: [0, 1.5, -0.8], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.5, -0.8],
      [0, 1.56, -0.25],
      [0, 1.62, 0.3],
      [0, 1.68, 0.75],
    ]),
    { parent: hips, count: 3, role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.68, 0.75],
      [0, 1.84, 1.0],
      [0, 1.96, 1.22],
    ]),
    { parent: chest, count: 2, role: "neck" },
  );
  const head = b.joint("head", { at: neck.at(1), dir: [0, -0.12, 1], role: "head" });
  const hl = (f: number, u: number, l = 0) => head.local({ forward: f, up: u, left: l });
  const jaw = b.joint("jaw", { parent: head, at: hl(0.02, -0.1), aim: hl(0.5, -0.14), role: "jaw" });

  // ================= body =================
  const body = b.loft(
    [
      { at: [0, 1.42, -1.0], w: 0.44, h: 0.52 },
      { at: [0, 1.48, -0.72], w: 0.64, h: 0.76 },
      { at: [0, 1.48, -0.22], w: 0.58, h: 0.68 },
      { at: [0, 1.5, 0.3], w: 0.72, h: 0.88 },
      { at: [0, 1.52, 0.72], w: 0.8, h: 1.0 },
      { at: [0, 1.56, 0.98], w: 0.6, h: 0.84 },
    ],
    { bone: [hips, spine], color: coat, name: "torso" },
  );
  b.sweep(neck, [0.3, 0.27, 0.25], { color: coat, name: "neckTube" });
  const bodySurf = b.surface(body);

  // ================= legs =================
  const pawGeoms = {
    pad: new THREE.SphereGeometry(0.13, 8, 6),
    toe: new THREE.SphereGeometry(0.052, 5, 4),
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // ---- front leg ----
    const fp = limb(
      [s * 0.37, 1.44, 0.62],
      [s * 0.4, 0.06, 0.95],
      [0.6, 0.56, 0.3, 0.22],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
      { sole: [0, 0, 1] },
    );
    const front = b.chain(`foreLeg${side}`, fp, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `forePaw${side}`, `foreToe${side}`],
      role: "leg",
    });
    b.part(new THREE.SphereGeometry(0.27, 9, 7), coat, {
      bone: front.joints[0],
      at: [s * 0.4, 1.48, 0.6],
      scale: [0.85, 1.15, 1.1],
      name: `shoulderMass${side}`,
    });
    const fsw = b.sweep(front, [0.2, 0.17, 0.12, 0.095, 0.075], { color: legCoat, name: `foreLimb${side}` });
    const tuftHits = b.surface(fsw).scatter(26, { rng: rng(40 + s), minDist: 0.07, filter: (h) => h.n.z < 0.2 && h.at.y > 0.25 });
    b.cards(tuftHits, TUFT, { size: [0.07, 0.17], lean: 70, bend: 25, vary: 0.3, rng: rng(41), color: FUR_L, flow: [0, -1, -0.2] });
    // gold bracer on the forearm
    const br = b.surface(fsw).loop(front.at(0.5), { lift: 0.012 });
    b.sweep(br, 0.034, { detail: 0.5, color: GOLD, name: `bracer${side}` });
    b.sweep(b.surface(fsw).loop(front.at(0.58), { lift: 0.01 }), 0.016, { detail: 0.5, color: GOLD_D, name: `bracerTrim${side}` });
    b.along(b.surface(fsw).loop(front.at(0.5), { lift: 0.035 }), 8, (at) =>
      b.part(new THREE.OctahedronGeometry(0.02), TEAL, { at, name: `bracerGem${side}` }),
    );
    // elbow spur
    b.spike(front.joints[1], [0, 0.4 * 1, -1], 0.17, 0.045, { color: HORN_D, name: `elbowSpur${side}` });
    // paw
    pawOn(front.joints[4], fp[3], fp[4], s, 1);
    // ---- hind leg ----
    const hp = limb(
      [s * 0.4, 1.48, -0.76],
      [s * 0.42, 0.06, -0.5],
      [0.64, 0.58, 0.46, 0.2],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
      { sole: [0, 0, 1] },
    );
    const hind = b.chain(`hindLeg${side}`, hp, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `ankle${side}`, `hindToe${side}`],
      role: "leg",
    });
    b.part(new THREE.SphereGeometry(0.33, 9, 7), coat, {
      bone: hind.joints[0],
      at: [s * 0.42, 1.4, -0.72],
      scale: [0.8, 1.2, 1.15],
      name: `haunch${side}`,
    });
    const hsw = b.sweep(hind, [0.25, 0.19, 0.12, 0.09, 0.075], { color: legCoat, name: `hindLimb${side}` });
    const hindTufts = b.surface(hsw).scatter(30, { rng: rng(50 + s), minDist: 0.075, filter: (h) => h.n.z < 0.2 && h.at.y > 0.5 });
    b.cards(hindTufts, TUFT, { size: [0.07, 0.18], lean: 70, bend: 25, vary: 0.3, rng: rng(51), color: FUR_L, flow: [0, -1, -0.2] });
    b.sweep(b.surface(hsw).loop(hind.at(0.62), { lift: 0.012 }), 0.032, { detail: 0.5, color: GOLD, name: `anklet${side}` });
    b.spike(hind.joints[2], [0, 0.2, -1], 0.15, 0.04, { color: HORN_D, name: `hockSpur${side}` });
    pawOn(hind.joints[4], hp[3], hp[4], s, 0.92);
  }

  function pawOn(bone: Joint, heel: THREE.Vector3, toe: THREE.Vector3, s: number, k: number) {
    const c = mid(heel, toe);
    b.part(pawGeoms.pad, FUR_D, {
      bone,
      at: [c.x, 0.1 * k, c.z + 0.03],
      scale: [1.05 * k, 0.72, 1.5 * k],
      name: "pawPad",
    });
    const toes: THREE.BufferGeometry[] = [];
    const claws: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 4; i++) {
      const dx = (i - 1.5) * 0.085 * k;
      const z = toe.z + 0.06 - Math.abs(dx) * 0.35;
      toes.push(pawGeoms.toe.clone().scale(k, 0.9, 1.1 * k).translate(c.x + dx, 0.058, z));
      const cg = new THREE.ConeGeometry(0.02 * k, 0.12 * k, 5);
      // cone points +Y; tip toward +Z and slightly down
      cg.rotateX(Math.PI / 2 + 0.35).translate(c.x + dx, 0.05, z + 0.08 * k);
      claws.push(cg);
    }
    b.part(mergeGeometries(toes), SOCK, { bone, at: [0, 0, 0], name: "toes" });
    b.part(mergeGeometries(claws), CLAW, { bone, at: [0, 0, 0], name: "claws" });
    // dew claw
    b.spike([c.x - s * 0.1, 0.2, c.z - 0.1], [0, -0.2, 1], 0.09, 0.02, { bone, color: CLAW, name: "dewClaw" });
  }

  // ================= head =================
  const faceFur = stripes(FUR, FUR_D, { size: 0.1, axis: "x", width: 0.28 });
  const skull = b.part(new THREE.SphereGeometry(0.27, 10, 8), faceFur, {
    bone: head,
    at: hl(0.02, 0.0),
    scale: [1.12, 1.0, 1.1],
    name: "skull",
  });
  b.loft(
    [
      { at: hl(0.1, -0.0), w: 0.38, h: 0.3 },
      { at: hl(0.34, -0.03), w: 0.32, h: 0.22 },
      { at: hl(0.58, -0.04), w: 0.26, h: 0.17 },
    ],
    { bone: head, color: FUR_L, name: "muzzle" },
  );
  b.frustumBox(hl(0.3, 0.1), hl(0.58, 0.07), [0.15, 0.05], [0.12, 0.05], { bone: head, color: FUR, name: "bridge" });
  b.part(new THREE.SphereGeometry(0.06, 6, 5), NOSE, { bone: head, at: hl(0.63, 0.045), scale: [1.25, 0.8, 0.95], name: "nose" });
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.014, 4, 3), CH_D, { bone: head, at: hl(0.665, 0.04, s * 0.032), name: "nostril" });
  b.frustumBox(hl(0.1, -0.1), hl(0.5, -0.09), [0.3, 0.05], [0.22, 0.05], { bone: head, color: MOUTH, name: "palate" });
  // lower jaw (own bone)
  b.frustumBox(hl(0.06, -0.17), hl(0.56, -0.17), [0.32, 0.1], [0.2, 0.085], { bone: jaw, color: CREAM, name: "lowerJaw" });
  b.frustumBox(hl(0.1, -0.11), hl(0.5, -0.11), [0.26, 0.04], [0.17, 0.04], { bone: jaw, color: MOUTH, name: "mouthFloor" });
  b.frustumBox(hl(0.16, -0.095), hl(0.44, -0.095), [0.1, 0.035], [0.08, 0.035], { bone: jaw, color: TONGUE, name: "tongue" });
  b.part(new THREE.SphereGeometry(0.06, 6, 5), CREAM, { bone: jaw, at: hl(0.6, -0.17), scale: [1.2, 0.8, 0.9], name: "chin" });
  const upperTeeth: THREE.BufferGeometry[] = [];
  const lowerTeeth: THREE.BufferGeometry[] = [];
  for (let i = -3; i <= 3; i++) {
    const p = hl(0.6 - Math.abs(i) * 0.008, -0.075, i * 0.032);
    upperTeeth.push(new THREE.ConeGeometry(0.014, 0.05, 5).rotateX(Math.PI).translate(p.x, p.y, p.z));
    const q = hl(0.57 - Math.abs(i) * 0.008, -0.12, i * 0.028);
    lowerTeeth.push(new THREE.ConeGeometry(0.013, 0.045, 5).translate(q.x, q.y, q.z));
  }
  b.part(mergeGeometries(upperTeeth), TEETH, { bone: head, at: [0, 0, 0], name: "upperTeeth" });
  b.part(mergeGeometries(lowerTeeth), TEETH, { bone: jaw, at: [0, 0, 0], name: "lowerTeeth" });
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.spike(hl(0.5, -0.07, s * 0.1), [0, -1, 0.12], 0.17, 0.034, { bone: head, color: TEETH, name: `upperFang${side}` });
    b.spike(hl(0.5, -0.13, s * 0.085), [0, 1, 0.1], 0.13, 0.03, { bone: jaw, color: TEETH, name: `lowerFang${side}` });
    // cheek pad and whiskers
    b.part(new THREE.SphereGeometry(0.09, 7, 5), CREAM, { bone: head, at: hl(0.42, -0.06, s * 0.13), scale: [1.1, 0.85, 1.1], name: `cheekPad${side}` });
    for (let k = 0; k < 3; k++)
      b.rod(hl(0.45, -0.04 - k * 0.025, s * 0.15), hl(0.6 + k * 0.02, -0.07 - k * 0.07, s * (0.46 + k * 0.02)), 0.006, {
        bone: head,
        color: HORN,
        name: `whisker${side}${k}`,
      });
    // brow ridge
    b.rod(hl(0.17, 0.165, s * 0.04), hl(0.1, 0.22, s * 0.25), [0.045, 0.03], { bone: head, color: FUR_D, name: `brow${side}` });
    // ears
    const ear = b.extrude(
      [
        [0, 0],
        [0.1, 0.04],
        [0.15, 0.15],
        [0.11, 0.27],
        [0.0, 0.34],
        [-0.07, 0.16],
      ],
      { at: hl(-0.05, 0.2, s * 0.17), x: [s, 0, 0], y: [0, 1, 0.1], thickness: 0.035, bevel: 0.01, smoothing: 1, detail: 0.4, color: FUR_D, bone: head, name: `ear${side}` },
    );
    b.extrude(
      [
        [0.015, 0.03],
        [0.08, 0.06],
        [0.1, 0.15],
        [0.07, 0.24],
        [0.0, 0.28],
        [-0.03, 0.14],
      ],
      { at: ear.local([0, 0, 0.02]), x: [s, 0, 0], y: [0, 1, 0.1], thickness: 0.02, smoothing: 1, color: TONGUE, bone: head, name: `earInner${side}` },
    );
    // eyes
    glow(
      b.decal(skull, EYE, {
        at: hl(0.22, 0.07, s * 0.14),
        dir: head.dir([s * -0.55, 0.0, 0.8]),
        up: [0, 1, 0],
        size: [0.2, 0.1],
        mirror: s < 0,
        roll: s * -10,
        name: `eye${side}`,
      }),
    );
    // cheek stripes
    b.decal(skull, CHEEK, {
      at: hl(0.22, -0.04, s * 0.2),
      dir: [s * 0.95, 0, 0.3],
      size: [0.26, 0.16],
      mirror: s < 0,
      name: `cheekMark${side}`,
    });
    // horn
    const hornPath = bezier(hl(0.1, 0.2, s * 0.15), hl(-0.08, 0.36, s * 0.25), hl(-0.4, 0.5, s * 0.5), hl(-0.7, 0.4, s * 0.55));
    b.sweep(
      hornPath,
      [0.085, 0.06, 0.03, 0],
      {
        bone: head,
        bands: [
          [0.14, GOLD],
          [0.8, HORN],
          [1, HORN_D],
        ],
        caps: { start: "flat", end: "point" },
        name: `horn${side}`,
      },
    );
    for (const t of [0.3, 0.46, 0.62]) {
      b.part(new THREE.TorusGeometry(0.075 - t * 0.065, 0.011, 4, 8), GOLD_D, { bone: head, at: hornPath.at(t), dir: hornPath.tangentAt(t), axis: "z", name: `hornRing${side}` });
    }
    // cheek ruff spikes
    for (let k = 0; k < 3; k++)
      b.spike(hl(0.12 - k * 0.07, -0.08 - k * 0.02, s * (0.27 - k * 0.02)), [s * 0.8, -0.2 - k * 0.2, -0.5], 0.17 + k * 0.03, 0.05, {
        bone: head,
        color: k === 1 ? MANE_HI : MANE,
        name: `cheekSpike${side}${k}`,
      });
  }
  // forehead sigil and brow marks
  b.decal(skull, BROWMARK, { at: hl(0.2, 0.18), dir: head.dir([0, 0.5, 0.9]), size: [0.3, 0.15], name: "browMarks" });
  glow(
    b.part(new THREE.OctahedronGeometry(0.065, 0), TEAL, {
      bone: head,
      at: hl(0.18, 0.2),
      scale: [0.8, 1.4, 0.8],
      name: "foreheadGem",
    }),
  );
  b.part(new THREE.TorusGeometry(0.062, 0.013, 4, 8), GOLD, { bone: head, at: hl(0.18, 0.2), dir: head.dir([0, 0.4, 1]), axis: "z", name: "gemSetting" });

  // ================= mane =================
  const maneCore = b.part(new THREE.SphereGeometry(0.46, 10, 8), MANE_CORE, { bone: neck.joints[1], at: [0, 1.76, 1.0], scale: [1.0, 1.0, 0.85], name: "maneCore" });
  const maneHits = b.surface(maneCore).scatter(320, { rng: rng(31), minDist: 0.065, filter: (h) => h.at.z < 1.15 });
  b.cards(maneHits, LOCK, { size: [0.13, 0.34], lean: 55, bend: 30, vary: 0.35, rng: rng(32), color: MANE_HI, flow: [0, -0.15, -1] });
  const beardHits = b.surface(maneCore).scatter(70, { rng: rng(33), minDist: 0.07, filter: (h) => h.at.z > 1.0 && h.n.y < 0.25 });
  b.cards(beardHits, LOCK, { size: [0.12, 0.3], lean: 40, bend: 20, vary: 0.3, rng: rng(34), color: MANE, flow: [0, -1, 0.15] });
  const BACK = new THREE.Vector3(0, -0.12, -1).normalize();
  const FLAME: OutlinePoint[] = [
    [0, -0.08],
    [0.25, -0.12],
    [0.55, -0.07],
    [0.85, 0.05],
    [1.0, 0.24, "sharp"],
    [0.78, 0.14],
    [0.5, 0.11],
    [0.22, 0.1],
    [0, 0.08],
  ];
  const addMane = (ln: Segment, bone: Joint, count: number, radius: number, len: number, wide: number, start: number) =>
    b.ring(ln, { count, radius, fromDeg: start, toDeg: start + 360 * (1 - 1 / count) }, (it) => {
      const ang = it.t * Math.PI * 2;
      const L = len * (0.78 + 0.3 * Math.cos(ang) + 0.12 * Math.sin(ang * 3 + start));
      const lockPaint = paint((_p, _n, st) => {
        const u = st[0] / L;
        return mix(mix(MANE_D, MANE, smoothstep(0.05, 0.5, u)), MANE_HI, smoothstep(0.55, 0.95, u));
      });
      b.extrude(
        FLAME.map(([x, y, sh]): OutlinePoint => (sh ? [x * L, y * L * wide, sh] : [x * L, y * L * wide])),
        { at: it, x: BACK, y: it.axis, thickness: 0.05, bevel: 0.012, smoothing: 1, detail: 0.34, color: lockPaint, bone, name: "maneLock" },
      );
    });
  addMane(line(hl(-0.02, 0.02), hl(-0.6, 0.0)), head, 14, 0.27, 0.8, 1.2, 0);
  addMane(line(hl(-0.12, 0.0), hl(-0.7, -0.02)), head, 12, 0.36, 0.7, 1.1, 14);
  addMane(line(hl(-0.3, -0.04), hl(-0.9, -0.12)), neck.joints[1], 13, 0.42, 0.95, 1.25, 7);

  // ================= wings =================
  const WING_PAINT = wingSkin;
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const R: V3 = [s * 0.34, 1.96, 0.3];
    const E: V3 = [s * 1.0, 2.55, -0.2];
    const W: V3 = [s * 1.7, 2.85, 0.45];
    const arm = b.chain(`wingArm${side}`, polyline([R, E, W]), {
      parent: spine.joints[2],
      names: [`wingRoot${side}`, `wingElbow${side}`, `wingWrist${side}`],
      role: "wing",
    });
    const armSweep = b.sweep(arm, [0.08, 0.06, 0.042], { color: BONE, name: `wingBone${side}` });
    for (const t of [0.18, 0.4, 0.62, 0.85]) {
      const cp = arm.at(t);
      b.part(new THREE.TorusGeometry(0.075 - t * 0.03, 0.014, 4, 8), GOLD, { at: cp, dir: cp, axis: "z", name: `armBand${side}` });
    }
    b.along(armSweep, 5, (at) => b.spike(at, at, 0.1, 0.03, { color: HORN, name: `armSpike${side}` }));
    b.part(new THREE.SphereGeometry(0.2, 8, 6), coat, { bone: arm.joints[0], at: [s * 0.38, 1.92, 0.3], scale: [0.8, 1, 1], name: `wingMount${side}` });
    for (const j of [arm.joints[1], arm.tip!]) {
      b.part(new THREE.SphereGeometry(0.1, 7, 5), GOLD, { bone: j, at: j.at, name: `wingKnuckle${side}` });
      glow(b.part(new THREE.OctahedronGeometry(0.045, 0), TEAL, { bone: j, at: j.local({ up: 0.09 }), name: `wingGem${side}` }));
    }
    b.spike(arm.tip!, [s * 0.1, 0.55, 0.8], 0.34, 0.04, { color: CLAW, name: `thumbClaw${side}` });
    const tips: V3[][] = [
      [[s * 2.3, 3.05, 0.75], [s * 2.95, 3.4, 1.1]],
      [[s * 2.5, 2.95, 0.2], [s * 3.35, 3.0, 0.1]],
      [[s * 2.45, 2.65, -0.2], [s * 3.1, 2.4, -0.75]],
      [[s * 2.1, 2.3, -0.4], [s * 2.35, 1.9, -1.25]],
    ];
    const fingers = tips.map(([m, t], i) => {
      const f = b.chain(`wingFinger${i + 1}${side}`, catmull([W, m, t]), {
        parent: arm.tip!,
        names: [`finger${i + 1}a${side}`, `finger${i + 1}b${side}`, `finger${i + 1}tip${side}`],
        role: "digit",
      });
      b.sweep(f, [0.05, 0.03, 0.012], { color: BONE, name: `fingerBone${i + 1}${side}` });
      glow(b.part(new THREE.OctahedronGeometry(0.038, 0), TEAL, { bone: f.joints[1], at: f.joints[1].at, name: `fingerGem${side}` }));
      b.spike(f.tip!, f.tip!, 0.14, 0.02, { color: CLAW, name: `fingerClaw${side}` });
      return f;
    });
    const sheets = [0, 1, 2].map((i) =>
      b.membrane(fingers[i], fingers[i + 1], { color: WING_PAINT, thickness: 0.012, scallop: 0.16, name: `wingSkin${i + 1}${side}` }),
    );
    for (const [i, f] of fingers.entries())
      for (const t of [0.3, 0.6]) {
        const cp = f.at(t);
        b.part(new THREE.TorusGeometry(0.044 - t * 0.02 - i * 0.002, 0.009, 4, 6), GOLD_D, { at: cp, dir: cp, axis: "z", name: `fingerBand${side}` });
      }
    for (const k of [1, -1])
      glow(b.decal(sheets[1], RUNE, { at: [s * 2.75, 2.7, -0.1], dir: [0, k * 0.83, k * -0.56], size: [0.55, 0.55], mirror: s < 0, name: `wingRune${side}${k}` }));
    b.membrane(
      fingers[3],
      catmull([W, [s * 1.4, 2.7, -0.2], [s * 0.85, 2.3, -0.45], [s * 0.4, 1.8, -0.62], [s * 0.38, 1.6, -0.8]]),
      { color: WING_PAINT, thickness: 0.012, scallop: 0.1, bone: spine.joints[1], name: `wingSkinBody${side}` },
    );
  }

  // ================= tail =================
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.5, -0.85],
      [0, 1.47, -1.35],
      [0, 1.62, -1.9],
      [0, 2.08, -2.22],
      [0, 2.6, -2.02],
      [0, 2.94, -1.45],
      [0, 3.06, -0.8],
      [0, 2.9, -0.2],
      [0, 2.66, 0.15],
    ]),
    { parent: hips, count: 9, role: "tail" },
  );
  const SEG = 8;
  const tailR = (t: number) => (0.14 - 0.075 * t) * (1 + 0.28 * Math.abs(Math.sin(Math.PI * t * SEG)));
  const tailSweep = b.sweep(tail, tailR, {
    color: tailPaint,
    name: "tailTube",
  });
  for (let k = 1; k < SEG; k++) {
    const t = k / SEG;
    const cp = tail.at(t);
    glow(b.part(new THREE.TorusGeometry(tailR(t) + 0.004, 0.013, 4, 10), TEAL, { at: cp, dir: cp, axis: "z", name: "tailRing" }));
  }
  for (const t of [0.1, 0.97]) {
    const cp = tail.at(t);
    b.part(new THREE.TorusGeometry(tailR(t) + 0.012, 0.03, 5, 10), GOLD, { at: cp, dir: cp, axis: "z", name: "tailBand" });
    glow(b.stick(new THREE.OctahedronGeometry(0.04, 0), TEAL, tailSweep.at(t, 0), { embed: 0.2, scale: [1, 1.4, 1], name: "tailBandGem" }));
  }
  b.along(tailSweep, SEG, (at) =>
    b.spike(at, at, 0.12 - at.t * 0.05, 0.05, { color: at.t < 0.1 ? FUR_D : CH_D, name: "tailSpine" }),
  );
  const tailEnd = tail.at(1);
  const E = vec(tailEnd.at);
  const T = vec(tailEnd.tangent).normalize();
  b.part(new THREE.SphereGeometry(0.11, 8, 6), CH_D, { bone: tail.joints[8], at: E.clone().addScaledVector(T, 0.06), scale: [1, 1, 1], name: "stingerBulb" });
  const barbPath = bezier(
    E.clone().addScaledVector(T, 0.06),
    E.clone().addScaledVector(T, 0.26),
    E.clone().add(new THREE.Vector3(0, -0.2, 0.36)),
    E.clone().add(new THREE.Vector3(0, -0.26, 0.42)),
  );
  glow(b.sweep(barbPath, [0.14, 0.1, 0.055, 0.0], { from: 0, to: 0.62, bone: tail.joints[8], color: VENOM, caps: { start: "flat", end: "flat" }, name: "stingerCore" }), 1.2);
  b.sweep(barbPath, [0.14, 0.1, 0.055, 0.0], { from: 0.62, to: 1, bone: tail.joints[8], color: HORN, caps: { start: "flat", end: "point" }, name: "stingerTip" });
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), VENOM, { bone: tail.joints[8], at: E.clone().add(new THREE.Vector3(0, -0.4, 0.46)), scale: [0.8, 1.4, 0.8], name: "venomDrop" }));
  const moteRand = rng(77);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const r = 0.28 + moteRand() * 0.12;
    const c = E.clone().addScaledVector(T, 0.28).add(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r * 0.9 + 0.05, 0.1 * Math.sin(a * 2)));
    glow(b.part(new THREE.OctahedronGeometry(0.018 + moteRand() * 0.016, 0), i % 2 ? TEAL : VENOM, { bone: tail.joints[8], at: c, name: "venomMote" }));
  }
  for (const s of [1, -1])
    b.spike(E.clone().addScaledVector(T, 0.1), [s * 0.7, 0.2, -0.4], 0.12, 0.028, { bone: tail.joints[8], color: CH_D, name: "stingerHook" });

  // ================= surface dressing =================
  // runes on the flanks
  for (const s of [1, -1])
    glow(b.decal(body, RUNE, { at: [s * 0.37, 1.53, 0.42], dir: [s, 0, 0], size: [0.3, 0.3], mirror: s < 0, name: `flankRune${s > 0 ? "L" : "R"}` }));
  // chest crystal on a gold mount
  const chestHit = bodySurf.around([0, 1.4, 0.7]).at(0, -15);
  if (chestHit) {
    b.stick(new THREE.CylinderGeometry(0.09, 0.1, 0.03, 8), GOLD, chestHit, { embed: 0.4, name: "chestMount" });
    glow(b.stick(new THREE.OctahedronGeometry(0.075, 0), TEAL, chestHit.moved([0, 0.05, 0]), { scale: [1, 1.5, 1], embed: 0.2, name: "chestGem" }));
  }
  // dorsal crest
  b.along(body, 7, (at) => {
    const p0 = vec(at.at);
    const bk = new THREE.Vector3(0, 0.25, -1).normalize();
    const L = 0.3 - at.t * 0.08;
    b.sweep(bezier(at, p0.clone().add(new THREE.Vector3(0, 0.12, 0)), p0.clone().addScaledVector(bk, L * 0.7).add(new THREE.Vector3(0, 0.2, 0)), p0.clone().addScaledVector(bk, L * 1.2).add(new THREE.Vector3(0, 0.1, 0))), [0.065, 0.03, 0], {
      bands: [
        [0.5, MANE_D],
        [1, MANE],
      ],
      caps: { start: "flat", end: "point" },
      name: "crestLock",
    });
  });
  // fur cards over the body
  const furHits = bodySurf.scatter(260, { rng: rng(21), minDist: 0.075, filter: (h) => h.n.y > -0.15 && h.at.z < 0.85 });
  b.cards(furHits, TUFT, { size: [0.07, 0.15], lean: 60, bend: 25, vary: 0.3, rng: rng(22), color: coat, flow: [0, -0.3, -1] });
  const bellyHits = bodySurf.scatter(60, { rng: rng(23), minDist: 0.1, filter: (h) => h.n.y < -0.3 && h.at.z > 0.2 });
  b.cards(bellyHits, TUFT, { size: [0.08, 0.17], lean: 80, bend: 20, vary: 0.3, rng: rng(24), color: CREAM, flow: [0, -1, -0.3] });
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // gold pauldron with spikes and a gem
    b.lathe(
      [
        [0, 0],
        [0.2, 0],
        [0.21, 0.04],
        [0.15, 0.1],
        [0.07, 0.14],
        [0, 0.15],
      ],
      { at: [s * 0.46, 1.74, 0.56], axis: [s * 0.55, 0.85, 0], segments: 8, color: GOLD, bone: spine.joints[2], name: `pauldron${side}` },
    );
    b.spike([s * 0.5, 1.84, 0.56], [s * 0.6, 0.85, 0.1], 0.2, 0.045, { bone: spine.joints[2], color: GOLD_D, name: `pauldronSpike${side}` });
    b.spike([s * 0.46, 1.8, 0.7], [s * 0.5, 0.5, 0.8], 0.15, 0.035, { bone: spine.joints[2], color: GOLD_D, name: `pauldronSpike${side}` });
    b.spike([s * 0.46, 1.8, 0.42], [s * 0.5, 0.5, -0.8], 0.15, 0.035, { bone: spine.joints[2], color: GOLD_D, name: `pauldronSpike${side}` });
    glow(b.part(new THREE.OctahedronGeometry(0.05, 0), TEAL, { bone: spine.joints[2], at: [s * 0.5, 1.82, 0.56], scale: [1, 1.4, 1], name: `pauldronGem${side}` }));
  }
  const girth = bodySurf.loop(spine.joints[1], { lift: 0.02 });
  b.sweep(girth, 0.028, { detail: 0.5, color: GOLD_D, name: "girthStrap" });
  let stud = 0;
  b.along(bodySurf.loop(spine.joints[1], { lift: 0.03 }), 16, (at) => {
    b.part(new THREE.OctahedronGeometry(0.03, 0), stud++ % 4 === 0 ? TEAL : GOLD, { at, name: "girthStud" });
  });

  // jaw open a little so the fangs read
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });
  return b.root;
}
