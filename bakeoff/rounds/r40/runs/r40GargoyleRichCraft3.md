```ts
import * as THREE from "three";
import {
  createBuilder,
  limb,
  paint,
  mix,
  noise,
  cells,
  smoothstep,
  catmull,
  bezier,
  rng,
  svg,
} from "agentic-3js-builder";
import type { Joint, ColorInput } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Cathedral Gargoyle",
  description:
    "A crouching gothic stone gargoyle gripping the lip of a weathered cathedral ledge: horned, fanged, bat-winged, mossy, with glowing amber eyes and a rune medallion on its chest.",
};

type V = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Constants

const L = 0.2; // top of the ledge
const HC = { x: 0, y: L + 0.84, z: 0.4 }; // skull centre
const hp = (x: number, y: number, z: number): V => [HC.x + x, HC.y + y, HC.z + z];
const nrm = (x: number, y: number, z: number): V => {
  const l = Math.hypot(x, y, z) || 1;
  return [x / l, y / l, z / l];
};

const TOOTH = "#d8cfb6";
const MOUTH = "#2a1613";
const TONGUE = "#4a2420";
const EYEBALL = "#262220";

// ---------------------------------------------------------------------------------------------------------------
// Paints: weathered limestone, lit warm on top, cool below, rain streaks, pitting, moss on upward faces

const scratch = new THREE.Vector3();
function stonePaint(lo: string, hi: string, seed: number, mossy: number, cracks = false) {
  return paint((p, n) => {
    const big = noise(p, 0.18, seed);
    const fine = noise(p, 0.035, seed + 4);
    let c = mix(lo, hi, smoothstep(0.25, 0.75, big) * 0.7 + fine * 0.3);
    const pit = smoothstep(0.62, 0.8, noise(p, 0.02, seed + 8));
    c = mix(c, "#4b4741", pit * 0.5);
    c = mix(c, "#e2dac4", Math.max(0, n.y) * 0.18);
    c = mix(c, "#48506a", Math.max(0, -n.y) * 0.25);
    scratch.set(p.x * 6, p.y * 0.5, p.z * 6);
    const streak = noise(scratch, 0.1, seed + 11);
    c = mix(c, "#3a3631", smoothstep(0.58, 0.8, streak) * 0.4 * smoothstep(0.7, -0.2, n.y));
    if (cracks) {
      const cl = cells(p, 0.45, seed + 2);
      if (cl.d2 - cl.d1 < 0.025) c = mix(c, "#2c2925", 0.7);
    }
    const m = smoothstep(0.52, 0.66, noise(p, 0.07, seed + 21)) * smoothstep(0.3, 0.8, n.y);
    c = mix(c, mix("#436328", "#7c9c45", noise(p, 0.02, seed + 3)), m * mossy);
    return c;
  });
}

const STONE = stonePaint("#8d897d", "#b5b0a0", 3, 0.7);
const STONE_DK = stonePaint("#66625a", "#8a8579", 8, 0.3);
const LEDGE = stonePaint("#7a766b", "#a29d8d", 13, 0.9, true);
const WING_BASE = stonePaint("#767a84", "#a2a5a9", 17, 0.35);
const WING = paint((_p, _n, s) => {
  if (s[1] < 0.035 || s[1] > 0.965 || s[0] > 0.975) return "#3f3f46";
  if (Math.abs(Math.sin(s[0] * Math.PI * 6)) < 0.05) return "#5a5a62";
  return WING_BASE;
});
const HORN = paint((_p, _n, s) => (Math.floor(s[0] * 9) % 2 ? "#5b4e40" : "#76674f"));

// ---------------------------------------------------------------------------------------------------------------
// Textures

const EYE = svg(
  `<svg viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="g" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stop-color="#fff3a0"/><stop offset="0.5" stop-color="#ffb21c"/><stop offset="1" stop-color="#d85a08"/></radialGradient></defs>
  <path d="M3 32 Q38 -2 77 22 Q44 52 3 32Z" fill="#1b0f08"/>
  <path d="M9 30 Q38 5 71 22 Q44 46 9 30Z" fill="url(#g)"/>
  <path d="M40 9 Q46 26 40 42 Q34 26 40 9Z" fill="#1b0f08"/>
  <circle cx="30" cy="20" r="3.4" fill="#ffffff"/>
</svg>`,
  { size: 128 },
);

const QUATREFOIL = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <g fill="#2f2c28">
    <circle cx="32" cy="16" r="15"/><circle cx="48" cy="32" r="15"/><circle cx="32" cy="48" r="15"/><circle cx="16" cy="32" r="15"/>
    <rect x="17" y="17" width="30" height="30" transform="rotate(45 32 32)"/>
  </g>
  <g fill="#5d594f">
    <circle cx="32" cy="16" r="11"/><circle cx="48" cy="32" r="11"/><circle cx="32" cy="48" r="11"/><circle cx="16" cy="32" r="11"/>
    <rect x="20" y="20" width="24" height="24" transform="rotate(45 32 32)"/>
  </g>
  <g fill="none" stroke="#8c877a" stroke-width="2" stroke-linecap="round">
    <path d="M24 12 Q32 6 40 12"/><path d="M52 24 Q58 32 52 40"/><path d="M24 52 Q32 58 40 52"/><path d="M12 24 Q6 32 12 40"/>
  </g>
  <circle cx="32" cy="32" r="5" fill="#a8a392" stroke="#2f2c28" stroke-width="2"/>
</svg>`,
  { size: 128 },
);

const PLAQUE = svg(
  `<svg viewBox="0 0 120 36" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="116" height="32" rx="5" fill="#3b3834" stroke="#a39d8a" stroke-width="2.5"/>
  <rect x="7" y="7" width="106" height="22" rx="3" fill="none" stroke="#6b665a" stroke-width="1.5"/>
  <text x="60" y="26" text-anchor="middle" font-family="serif" font-weight="bold" font-size="20" letter-spacing="4" fill="#d3cbb0">VIGILO</text>
</svg>`,
  { size: 256 },
);

const MOSS = svg(
  `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 60 Q8 40 4 8 Q16 30 20 60Z" fill="#4e7a2a"/>
  <path d="M20 60 Q32 40 37 12 Q26 34 20 60Z" fill="#3f6622"/>
  <path d="M20 60 Q22 30 20 2 Q30 30 20 60Z" fill="#6c9b36"/>
  <path d="M20 60 Q14 46 12 26 Q20 40 20 60Z" fill="#86b445"/>
  <path d="M20 60 Q28 46 29 28 Q22 42 20 60Z" fill="#5a8a30"/>
</svg>`,
  { size: 96 },
);

const LICHEN = svg(
  `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <circle cx="26" cy="30" r="18" fill="#a79a3a"/><circle cx="40" cy="22" r="11" fill="#bfb04a"/>
  <circle cx="20" cy="42" r="10" fill="#c8ba58"/><circle cx="32" cy="34" r="9" fill="#d9cc6a"/>
  <circle cx="28" cy="28" r="2" fill="#6e6420"/><circle cx="36" cy="38" r="2" fill="#6e6420"/><circle cx="18" cy="36" r="1.6" fill="#6e6420"/>
</svg>`,
  { size: 96 },
);

const EMBLEM = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="30" fill="#1f1a16" stroke="#e89a1c" stroke-width="3"/>
  <circle cx="32" cy="32" r="23" fill="none" stroke="#a8620f" stroke-width="1.5"/>
  <g fill="none" stroke="#f2a823" stroke-width="2.6" stroke-linecap="round">
    <circle cx="32" cy="21" r="8"/><circle cx="43" cy="32" r="8"/><circle cx="32" cy="43" r="8"/><circle cx="21" cy="32" r="8"/>
  </g>
  <circle cx="32" cy="32" r="4.5" fill="#ffd24a"/>
</svg>`,
  { size: 128 },
);

const CRACK = svg(
  `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#2a2723" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 0 L16 12 L24 22 L15 34 L22 44 L18 60"/><path d="M24 22 L33 27 L36 38"/><path d="M15 34 L7 38"/>
  </g>
</svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "gargoyle" });

  // ---- helpers ----------------------------------------------------------------------------------------------
  const ell = (at: V, r: V, color: ColorInput, bone: Joint, seg: [number, number] = [8, 6]) =>
    b.part(new THREE.SphereGeometry(1, seg[0], seg[1]), color, { at, bone, scale: r, flat: true });
  const claw = (base: V, dir: V, len: number, r: number, bone: Joint, color: ColorInput = HORN) =>
    b.spike(base, dir, len, r, { color, bone, sides: 6 });
  const arr = (v: THREE.Vector3): V => [v.x, v.y, v.z];

  // ---- skeleton ---------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, L + 0.34, -0.22], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, L + 0.34, -0.22],
      [0, L + 0.42, -0.05],
      [0, L + 0.54, 0.1],
      [0, L + 0.62, 0.22],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, L + 0.62, 0.22],
      [0, L + 0.7, 0.27],
      [0, L + 0.76, 0.32],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, L + 0.76, 0.32], dir: [0, 0.06, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.07, 0.04), aim: hp(0, -0.09, 0.3), role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, L + 0.34, -0.3],
      [0, L + 0.22, -0.5],
      [0.08, L + 0.14, -0.64],
      [0.28, L + 0.07, -0.66],
      [0.42, L + 0.035, -0.5],
    ]),
    { parent: hips, role: "tail" },
  );

  // ---- ledge ------------------------------------------------------------------------------------------------
  b.part(new THREE.BoxGeometry(1.16, 0.12, 1.26), LEDGE, { at: [0, 0.06, -0.1], bone: hips });
  b.frustumBox([0, 0.12, -0.1], [0, 0.16, -0.1], [1.16, 1.26], [1.3, 1.36], { color: LEDGE, bone: hips });
  const cap = b.part(new THREE.BoxGeometry(1.3, 0.04, 1.36), LEDGE, { at: [0, 0.18, -0.1], bone: hips });
  for (let k = 0; k < 5; k++) {
    const x = -0.46 + k * 0.23;
    if (k === 2) {
      b.part(new THREE.PlaneGeometry(0.3, 0.09), "#ffffff", {
        at: [0, 0.06, 0.532],
        dir: [0, 0, 1],
        axis: "z",
        texture: PLAQUE,
        bone: hips,
      });
    } else {
      b.part(new THREE.PlaneGeometry(0.095, 0.095), "#ffffff", {
        at: [x, 0.06, 0.532],
        dir: [0, 0, 1],
        axis: "z",
        texture: QUATREFOIL,
        bone: hips,
      });
    }
  }
  for (const s of [1, -1])
    for (const z of [-0.5, -0.1, 0.3])
      b.part(new THREE.PlaneGeometry(0.095, 0.095), "#ffffff", {
        at: [s * 0.582, 0.06, z],
        dir: [s, 0, 0],
        axis: "z",
        texture: QUATREFOIL,
        bone: hips,
      });
  // corner posts
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.part(new THREE.BoxGeometry(0.1, 0.05, 0.1), STONE_DK, { at: [sx * 0.6, 0.145, -0.1 + sz * 0.64], bone: hips });

  // ---- torso ------------------------------------------------------------------------------------------------
  const torso = b.loft(
    [
      { at: [0, L + 0.33, -0.28], w: 0.3, h: 0.3 },
      { at: [0, L + 0.38, -0.12], w: 0.38, h: 0.34 },
      { at: [0, L + 0.5, 0.06], w: 0.46, h: 0.4 },
      { at: [0, L + 0.58, 0.2], w: 0.54, h: 0.4 },
      { at: [0, L + 0.64, 0.27], w: 0.46, h: 0.34 },
    ],
    { bone: [hips, spine], color: STONE },
  );
  let ri = 0;
  b.along(torso, 6, (at) => {
    ri++;
    return b.spike(at, at, 0.07 + 0.02 * Math.sin(ri * 1.7), 0.03, { color: HORN, sides: 5 });
  });
  for (const s of [1, -1]) ell([s * 0.13, L + 0.5, 0.3], [0.12, 0.1, 0.1], STONE, chest);

  // ---- neck -------------------------------------------------------------------------------------------------
  b.sweep(neck, [0.14, 0.115], { color: STONE });
  b.ring(neck.at(0.35), { count: 10, radius: 0.12, tilt: -30 }, (it) =>
    b.spike(it, it, 0.1, 0.03, { color: HORN, sides: 5 }),
  );

  // ---- limbs ------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";

    // hind leg
    const hipP: V = [s * 0.2, L + 0.36, -0.2];
    const ankP: V = [s * 0.27, L + 0.1, -0.14];
    const lp = limb(hipP, ankP, [0.3, 0.3], [[s * 0.4, 0, 1]]);
    const leg = b.chain(`leg${sd}`, lp, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`],
      role: "leg",
      contact: [s * 0.27, L, 0.05],
    });
    b.sweep(leg, [0.1, 0.09, 0.065, 0.05, 0.045], { color: STONE });
    const [hipJ, kneeJ, ankJ] = leg.joints;
    ell(arr(lp[0].clone().lerp(lp[1], 0.4)), [0.125, 0.11, 0.14], STONE, hipJ);
    ell(arr(lp[1]), [0.075, 0.075, 0.075], STONE, kneeJ);
    claw(arr(lp[1]), [s * 0.8, 0.5, 0.6], 0.1, 0.032, kneeJ);
    const ball: V = [s * 0.27, L + 0.045, 0.06];
    b.rod(ankP, ball, [0.05, 0.045], { color: STONE, bone: ankJ });
    ell(ball, [0.058, 0.04, 0.06], STONE, ankJ);
    [-1, 0, 1].forEach((k, i) => {
      const dx = k * 0.065;
      const tp: V[] = [
        ball,
        [ball[0] + dx * 0.5, L + 0.035, ball[2] + 0.07],
        [ball[0] + dx, L + 0.03, ball[2] + 0.14],
      ];
      const toe = b.chain(`toe${i + 1}${sd}`, tp, {
        parent: ankJ,
        names: [`toe${i + 1}${sd}a`, `toe${i + 1}${sd}b`],
        role: "digit",
      });
      b.sweep(toe, [0.032, 0.024], { color: STONE, sides: 6 });
      claw(tp[2], [dx * 0.8, -0.45, 1], 0.07, 0.02, toe.joints[1]);
    });

    // fore arm
    const shP: V = [s * 0.27, L + 0.66, 0.16];
    const wrP: V = [s * 0.25, L + 0.07, 0.37];
    const ap = limb(shP, wrP, [0.34, 0.34], [[s * 1, 0.2, -0.5]]);
    const arm = b.chain(`arm${sd}`, ap, {
      parent: chest,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`],
      role: "arm",
    });
    b.sweep(arm, [0.09, 0.075, 0.055, 0.05], { color: STONE });
    const [shJ, elJ, wrJ] = arm.joints;
    ell(shP, [0.115, 0.1, 0.12], STONE, shJ);
    claw(shP, [s * 0.6, 1, -0.3], 0.13, 0.04, shJ);
    ell(arr(ap[1]), [0.06, 0.06, 0.06], STONE, elJ);
    claw(arr(ap[1]), [s, 0.2, -1], 0.13, 0.035, elJ);
    b.part(new THREE.BoxGeometry(0.11, 0.05, 0.13), STONE, { at: [s * 0.25, L + 0.04, 0.42], bone: wrJ, flat: true });
    [-1, 0, 1].forEach((k, i) => {
      const x = s * (0.25 + k * 0.04);
      const fp: V[] = [
        [x, L + 0.045, 0.47],
        [x, L + 0.04, 0.54],
        [x, L + 0.012, 0.61],
      ];
      const fg = b.chain(`finger${i + 1}${sd}`, fp, {
        parent: wrJ,
        names: [`finger${i + 1}${sd}a`, `finger${i + 1}${sd}b`],
        role: "digit",
      });
      b.sweep(fg, [0.026, 0.019], { color: STONE, sides: 6 });
      claw(fp[2], [0, -1, 0.15], 0.07, 0.02, fg.joints[1]);
    });
    const thp: V[] = [
      [s * 0.2, L + 0.045, 0.4],
      [s * 0.165, L + 0.04, 0.46],
      [s * 0.15, L + 0.03, 0.51],
    ];
    const thumb = b.chain(`thumb${sd}`, thp, {
      parent: wrJ,
      names: [`thumb${sd}a`, `thumb${sd}b`],
      role: "digit",
    });
    b.sweep(thumb, [0.028, 0.02], { color: STONE, sides: 6 });
    claw(thp[2], [-s * 0.3, -0.4, 1], 0.07, 0.02, thumb.joints[1]);

    // wing
    const wrt: V = [s * 0.7, L + 1.12, -0.35];
    const wp: V[] = [
      [s * 0.16, L + 0.74, 0.08],
      [s * 0.42, L + 1.0, -0.05],
      wrt,
    ];
    const wing = b.chain(`wing${sd}`, wp, {
      parent: chest,
      names: [`wingRoot${sd}`, `wingElbow${sd}`, `wingWrist${sd}`],
      role: "wing",
    });
    b.sweep(wing, [0.06, 0.045, 0.032], { color: STONE });
    const wingTip = wing.joints[wing.joints.length - 1];
    ell(wp[0], [0.09, 0.08, 0.1], STONE, wing.joints[0]);
    ell(wp[1], [0.055, 0.055, 0.055], STONE, wing.joints[1]);
    claw(wrt, [s * 0.2, 1, 0.4], 0.13, 0.03, wingTip);
    const tips: V[] = [
      [1.0, 0.78, -0.58],
      [0.84, 0.46, -0.72],
      [0.54, 0.34, -0.74],
    ];
    const fingers = tips.map((t, i) => {
      const T: V = [s * t[0], L + t[1], t[2]];
      const M: V = [(wrt[0] + T[0]) / 2 + s * 0.05, (wrt[1] + T[1]) / 2 + 0.07, (wrt[2] + T[2]) / 2 + 0.03];
      const f = b.chain(`wingFinger${i + 1}${sd}`, [wrt, M, T], {
        parent: wingTip,
        names: [`wf${i + 1}${sd}a`, `wf${i + 1}${sd}b`],
        role: "digit",
      });
      b.sweep(f, [0.026, 0.01], { color: STONE_DK, sides: 6, caps: { start: "round", end: "point" } });
      claw(T, [s * 0.1, -1, -0.3], 0.06, 0.016, f.joints[1]);
      return f;
    });
    const edge: V[] = [
      [s * 0.17, L + 0.7, 0.06],
      [s * 0.18, L + 0.52, -0.1],
      [s * 0.16, L + 0.38, -0.3],
    ];
    const mo = { color: WING, thickness: 0.014, scallop: 0.12 };
    b.membrane(fingers[0], fingers[1], mo);
    b.membrane(fingers[1], fingers[2], mo);
    b.membrane(fingers[2], edge, { ...mo, bone: spine.joints[1] });
  }

  // ---- tail -------------------------------------------------------------------------------------------------
  const tailSweep = b.sweep(tail, [0.085, 0.07, 0.055, 0.042, 0.032], { color: STONE });
  b.along(tailSweep, 5, (at) => b.spike(at, at, 0.06, 0.022, { color: HORN, sides: 5 }));
  const tailTip = tail.joints[tail.joints.length - 1];
  b.extrude(
    [
      [0, 0],
      [0.05, 0.07],
      [0.18, 0, "sharp"],
      [0.05, -0.07],
    ],
    {
      at: [0.42, L + 0.035, -0.5],
      x: [0.66, 0, 0.75],
      y: [-0.75, 0, 0.66],
      thickness: 0.03,
      bevel: 0.006,
      color: STONE_DK,
      bone: tailTip,
    },
  );

  // ---- head -------------------------------------------------------------------------------------------------
  const skull = ell(hp(0, 0.02, -0.02), [0.15, 0.13, 0.14], STONE, head, [10, 7]);
  ell(hp(0, 0.0, -0.1), [0.12, 0.11, 0.1], STONE, head);
  b.frustumBox(hp(0, 0, 0.06), hp(0, -0.015, 0.31), [0.2, 0.11], [0.16, 0.085], { color: STONE, bone: head });
  ell(hp(0, 0.012, 0.31), [0.09, 0.055, 0.055], STONE, head);
  b.rod(hp(0, 0.1, 0.06), hp(0, 0.05, 0.3), [0.03, 0.035], { color: STONE, bone: head });
  b.part(new THREE.BoxGeometry(0.15, 0.02, 0.24), MOUTH, { at: hp(0, -0.062, 0.18), bone: head });

  // jaw
  b.frustumBox(hp(0, -0.09, 0.07), hp(0, -0.1, 0.31), [0.17, 0.055], [0.125, 0.05], { color: STONE, bone: jaw });
  ell(hp(0, -0.105, 0.3), [0.07, 0.04, 0.04], STONE, jaw);
  claw(hp(0, -0.12, 0.31), [0, -1, 0.4], 0.1, 0.028, jaw);
  b.part(new THREE.BoxGeometry(0.08, 0.014, 0.15), TONGUE, { at: hp(0, -0.068, 0.17), bone: jaw });

  for (const s of [1, -1]) {
    // brows, cheeks, lips
    b.capsule(hp(s * 0.14, 0.13, 0.06), hp(s * 0.02, 0.105, 0.18), 0.028, { color: STONE_DK, bone: head });
    claw(hp(s * 0.145, 0.12, 0.04), [s * 0.5, 1, -0.3], 0.08, 0.025, head);
    ell(hp(s * 0.12, -0.02, 0.06), [0.06, 0.07, 0.09], STONE_DK, head);
    ell(hp(s * 0.1, -0.09, 0.06), [0.05, 0.045, 0.07], STONE_DK, jaw);
    b.rod(hp(s * 0.1, -0.057, 0.05), hp(s * 0.077, -0.06, 0.3), 0.012, { color: STONE_DK, bone: head });
    b.rod(hp(s * 0.08, -0.065, 0.08), hp(s * 0.06, -0.07, 0.3), 0.011, { color: STONE_DK, bone: jaw });
    // nostrils
    ell(hp(s * 0.035, 0.022, 0.352), [0.014, 0.012, 0.012], MOUTH, head, [6, 4]);

    // teeth
    for (let i = 0; i < 5; i++) {
      const z = 0.1 + i * 0.045;
      claw(hp(s * (0.075 - i * 0.004), -0.058, z), [0, -1, 0], 0.032 + (i === 4 ? 0.008 : 0), 0.011, head, TOOTH);
      claw(hp(s * (0.07 - i * 0.004), -0.063, z + 0.02), [0, 1, 0], 0.03, 0.01, jaw, TOOTH);
    }
    claw(hp(s * 0.058, -0.058, 0.285), [0, -1, -0.1], 0.085, 0.022, head, TOOTH);
    claw(hp(s * 0.068, -0.063, 0.29), [0, 1, 0.1], 0.07, 0.018, jaw, TOOTH);

    // eyes: dark socket ball with a glowing drawn eye decal
    const EC = hp(s * 0.08, 0.075, 0.12);
    const d = nrm(s * 0.3, 0, 1);
    const ball = ell(EC, [0.046, 0.046, 0.046], EYEBALL, head);
    const front: V = [EC[0] + d[0] * 0.046, EC[1], EC[2] + d[2] * 0.046];
    glow(b.decal(ball, EYE, { at: front, dir: d, size: [0.085, 0.054], mirror: s < 0, lift: 0.002 }), 1.2);

    // horns
    b.sweep(bezier(hp(s * 0.07, 0.11, -0.04), hp(s * 0.14, 0.27, -0.04), hp(s * 0.09, 0.3, -0.3)), [0.05, 0.0], {
      bone: head,
      color: HORN,
      caps: { start: "flat", end: "point" },
      sides: 7,
    });
    b.sweep(bezier(hp(s * 0.14, 0.0, -0.04), hp(s * 0.25, 0.02, -0.1), hp(s * 0.27, -0.08, -0.2)), [0.03, 0.0], {
      bone: head,
      color: HORN,
      caps: { start: "flat", end: "point" },
      sides: 6,
    });

    // ears
    const EAR: Array<[number, number] | [number, number, "sharp"]> = [
      [0, -0.02],
      [0.07, 0.0],
      [0.14, 0.1],
      [0.17, 0.24, "sharp"],
      [0.07, 0.17],
      [0, 0.08],
    ];
    b.extrude(EAR, {
      at: hp(s * 0.1, 0.07, -0.06),
      x: [s, 0, 0],
      y: [0, 1, -0.25],
      thickness: 0.025,
      bevel: 0.004,
      color: STONE,
      bone: head,
    });
    b.extrude(
      [
        [0.02, 0.0],
        [0.07, 0.02],
        [0.11, 0.11],
        [0.13, 0.19, "sharp"],
        [0.07, 0.13],
        [0.02, 0.07],
      ],
      {
        at: hp(s * 0.1, 0.07, -0.06),
        x: [s, 0, 0],
        y: [0, 1, -0.25],
        thickness: 0.03,
        color: MOUTH,
        bone: head,
      },
    );

    // cheek fins
    b.extrude(
      [
        [0, 0.05],
        [0.14, -0.02],
        [0.05, -0.03],
        [0, -0.05],
      ],
      { at: hp(s * 0.15, -0.035, 0.0), x: [0, 0, -1], y: [0, 1, 0], thickness: 0.02, color: STONE_DK, bone: head },
    );
  }

  // crest along the back of the skull
  b.extrude(
    [
      [0, 0],
      [0.04, 0.1, "sharp"],
      [0.09, 0.04],
      [0.14, 0.12, "sharp"],
      [0.19, 0.03],
      [0.24, 0.1, "sharp"],
      [0.28, -0.02],
      [0, -0.04],
    ],
    {
      at: hp(0, 0.12, 0.04),
      x: [0, -0.24, -0.97],
      y: [0, 0.97, -0.24],
      thickness: 0.03,
      color: STONE_DK,
      bone: head,
    },
  );

  // open the mouth a little
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });

  // ---- surface detail ---------------------------------------------------------------------------------------
  const tSkin = b.surface(torso);
  const emblemHit = tSkin.nearest([0, L + 0.5, 0.5]);
  glow(b.decal(torso, EMBLEM, { at: emblemHit, size: [0.15, 0.15] }), 0.7);
  const crackHit = tSkin.nearest([0.32, L + 0.42, -0.1]);
  b.decal(torso, CRACK, { at: crackHit, size: [0.12, 0.18] });

  const bodyMoss = tSkin.scatter(16, { rng: rng(5), minDist: 0.07, filter: (h) => h.n.y > 0.55 });
  b.cards(bodyMoss, MOSS, { size: [0.05, 0.06], lean: 8, vary: 0.35, rng: rng(6), cross: true });
  const headMoss = b.surface(skull).scatter(7, { rng: rng(9), minDist: 0.05, filter: (h) => h.n.y > 0.7 });
  b.cards(headMoss, MOSS, { size: [0.035, 0.045], lean: 8, vary: 0.3, rng: rng(10), cross: true });

  const capSkin = b.surface(cap);
  const edgeMoss = capSkin.scatter(26, {
    rng: rng(2),
    minDist: 0.07,
    filter: (h) => h.n.y > 0.8 && (Math.abs(h.at.x) > 0.5 || h.at.z > 0.5 || h.at.z < -0.62),
  });
  b.cards(edgeMoss, MOSS, { size: [0.06, 0.07], lean: 6, vary: 0.4, rng: rng(3), cross: true, bone: hips });
  const lichen = capSkin.scatter(14, { rng: rng(4), minDist: 0.14, filter: (h) => h.n.y > 0.8 });
  b.cards(lichen, LICHEN, {
    size: 0.09,
    lean: 90,
    flow: [1, 0, 0.3],
    mirror: true,
    vary: 0.4,
    spin: 180,
    rng: rng(7),
    bone: hips,
  });

  return b.root;
}
```