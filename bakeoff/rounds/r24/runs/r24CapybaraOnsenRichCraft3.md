```ts
import * as THREE from "three";
import { createBuilder, frame, rng, limb, paint, mottle, stripes, grain, noise, mix, smoothstep, svg, catmull } from "agentic-3js-builder";
import { cel, furEdge } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Capybara Onsen",
  description:
    "Kawaii diorama: three chubby capybaras (two adults and a baby) soaking in a steaming rock-rimmed hot spring, with yuzu fruit, a floating sake tray, a bamboo spout, a glowing stone lantern and a wooden bucket.",
};

// ---------------------------------------------------------------------------------------------------------------
// Constants and small helpers

type B = ReturnType<typeof createBuilder>;
type J = ReturnType<B["joint"]>;
type Tup = [number, number, number];

const D2R = Math.PI / 180;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const Y_AXIS = V(0, 1, 0);
const qE = (x = 0, y = 0, z = 0) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x * D2R, y * D2R, z * D2R));

const FLOOR = 0.13; // top of the grass slab: where everything stands
const WATER_Y = 0.38; // water surface

// ---------------------------------------------------------------------------------------------------------------
// Palette: cel-shaded kawaii colours (lit tone + hue-shifted shadow tone)

const FUR_TOP = mottle("#cf9760", "#c28a55", { size: 0.14, contrast: 0.5 });
const BELLY = "#f3d9ae";
const COAT = cel(furEdge(FUR_TOP, BELLY, { level: -0.32, teeth: 0.18, period: 0.04 }));
const MUZZLE = cel("#e6b182");
const CREAM = cel("#f7e3bd");
const NOSE = cel("#5a3a44");
const EAR_IN = cel("#f7aab8");
const FOOT = cel("#8c6241");
const YUZU = cel("#ffb92e");
const LEAF = cel("#6fcb6c");
const TOWEL = cel(stripes("#fffaf0", "#86bfe9", { size: 0.045, axis: "x", width: 0.3, wobble: 0 }));
const TUFT = "#8f5c33";
const DARK = "#34202a";
const WHITE = "#ffffff";

const ROCK = paint((p, n) => {
  const base = mix("#b9b3cd", "#d6d0e6", noise(p, 0.25, 4));
  const lit = 0.88 + 0.12 * smoothstep(-0.6, 0.8, n.y);
  const moss = smoothstep(0.45, 0.85, n.y) * smoothstep(0.3, 0.55, noise(p, 0.14, 9));
  const c = mix(base, "#9ad57e", moss);
  return [c[0] * lit, c[1] * lit, c[2] * lit] as const;
});
const SOIL = grain("#8d6244", "#77513a", { size: 0.05, axis: "y" });
const GRASS = mottle("#a6e48f", "#8ad17c", { size: 0.28, contrast: 0.7 });
const WATER = mottle("#aef0e8", "#92e1da", { size: 0.4, contrast: 0.8 });
const WOOD = grain("#dba569", "#c08a4c", { size: 0.02, axis: "x" });
const BAMBOO = mottle("#9bd36b", "#82c05a", { size: 0.12, contrast: 0.6 });
const BAMBOO_NODE = "#6fa84a";
const BRASS = "#e0aa48";

// ---------------------------------------------------------------------------------------------------------------
// Textures (SVG drawings)

function makeTextures() {
  const eyeDot = svg(
    `<svg viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="24" rx="18" ry="22" fill="#2b1a1e"/>
      <ellipse cx="20" cy="32" rx="13" ry="12" fill="#5b3540"/>
      <circle cx="13" cy="14" r="7" fill="#ffffff"/>
      <circle cx="27" cy="34" r="3.2" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );
  const eyeHappy = svg(
    `<svg viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 22 Q20 -2 35 22" stroke="#2b1a1e" stroke-width="6.5" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 128 },
  );
  const eyeSleep = svg(
    `<svg viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 8 Q20 26 35 8" stroke="#2b1a1e" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M8 17 L3 22 M32 17 L37 22" stroke="#2b1a1e" stroke-width="4" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 128 },
  );
  const blush = svg(
    `<svg viewBox="0 0 60 34" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="17" rx="28" ry="15" fill="#ff98ae"/>
      <path d="M16 24 L22 9 M28 25 L34 9 M40 24 L46 9" stroke="#ff6f90" stroke-width="3.4" stroke-linecap="round"/>
    </svg>`,
    { size: 96 },
  );
  const mouth = svg(
    `<svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 8 Q17 26 30 10 Q43 26 54 8" stroke="#3a2229" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>`,
    { size: 128 },
  );
  const ripple = svg(
    `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="80" rx="92" ry="72" fill="none" stroke="#ffffff" stroke-width="4" stroke-dasharray="46 30" stroke-linecap="round"/>
      <ellipse cx="100" cy="80" rx="68" ry="53" fill="none" stroke="#ffffff" stroke-width="4" stroke-dasharray="26 40" stroke-linecap="round"/>
      <ellipse cx="100" cy="80" rx="44" ry="34" fill="none" stroke="#ffffff" stroke-width="4" stroke-dasharray="18 34" stroke-linecap="round"/>
      <circle cx="30" cy="50" r="3.5" fill="#ffffff"/><circle cx="168" cy="108" r="4" fill="#ffffff"/>
      <circle cx="150" cy="38" r="3" fill="#ffffff"/><circle cx="48" cy="120" r="3" fill="#ffffff"/>
    </svg>`,
    { size: 512 },
  );
  const steam = svg(
    `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 96 C2 80 38 66 20 48 C4 32 36 18 20 4" stroke="#ffffff" stroke-width="9" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 256 },
  );
  const tuft = svg(
    `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 60 Q10 30 4 8 Q20 26 22 60Z" fill="#74cf6e" stroke="#4fa551" stroke-width="2"/>
      <path d="M22 60 Q26 24 30 2 Q38 26 40 60Z" fill="#8fe085" stroke="#4fa551" stroke-width="2"/>
      <path d="M38 60 Q42 34 56 10 Q54 36 52 60Z" fill="#74cf6e" stroke="#4fa551" stroke-width="2"/>
    </svg>`,
    { size: 128 },
  );
  const flower = svg(
    `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 60 L20 28" stroke="#4fa551" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M20 50 Q30 44 34 48 Q26 54 20 50Z" fill="#74cf6e"/>
      <g fill="#ffb8d0" stroke="#f27ba3" stroke-width="1.5">
        <circle cx="20" cy="12" r="8"/><circle cx="31" cy="20" r="8"/><circle cx="27" cy="33" r="8"/>
        <circle cx="13" cy="33" r="8"/><circle cx="9" cy="20" r="8"/>
      </g>
      <circle cx="20" cy="23" r="6.5" fill="#ffe27a" stroke="#f0b93a" stroke-width="1.5"/>
    </svg>`,
    { size: 128 },
  );
  const heart = svg(
    `<svg viewBox="0 0 50 46" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 43 C6 28 2 18 6 10 C11 2 22 4 25 13 C28 4 39 2 44 10 C48 18 44 28 25 43Z" fill="#ff80ab" stroke="#ff4f86" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="14" cy="14" rx="4.5" ry="3" fill="#ffffff" transform="rotate(-35 14 14)"/>
    </svg>`,
    { size: 128 },
  );
  const sparkle = svg(
    `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 1 Q22 18 39 20 Q22 22 20 39 Q18 22 1 20 Q18 18 20 1Z" fill="#fff6a6" stroke="#ffd23f" stroke-width="2" stroke-linejoin="round"/>
    </svg>`,
    { size: 96 },
  );
  const windowTex = svg(
    `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" fill="#ffc760"/>
      <circle cx="20" cy="20" r="14" fill="#fff0b4"/>
      <circle cx="20" cy="20" r="7" fill="#ffffff"/>
      <path d="M0 20 H40 M20 0 V40" stroke="#c98a32" stroke-width="2.5"/>
      <rect x="1" y="1" width="38" height="38" fill="none" stroke="#c98a32" stroke-width="2.5"/>
    </svg>`,
    { size: 96 },
  );
  return { eyeDot, eyeHappy, eyeSleep, blush, mouth, ripple, steam, tuft, flower, heart, sparkle, windowTex };
}
type Tex = ReturnType<typeof makeTextures>;

// ---------------------------------------------------------------------------------------------------------------
// The capybara: a skeleton-first, rigged, chubby kawaii animal. Local frame: +Z forward, origin on the floor.

type Eye = "dot" | "happy" | "sleep";
type Hat = "yuzu" | "towel" | "none";
type CapyOpts = { k: string; x: number; z: number; yaw: number; s: number; eyes: Eye; hat: Hat; head?: number };

function capybara(b: B, parent: J, tex: Tex, o: CapyOpts) {
  const S = o.s;
  const H = o.head ?? 1;
  const k = o.k;
  const pos = V(o.x, FLOOR, o.z);
  const yq = new THREE.Quaternion().setFromAxisAngle(Y_AXIS, o.yaw);
  const P = (x: number, y: number, z: number) => V(x, y, z).multiplyScalar(S).applyQuaternion(yq).add(pos);
  const Dr = (x: number, y: number, z: number) => V(x, y, z).applyQuaternion(yq).normalize();
  const Q = (rx = 0, ry = 0, rz = 0) => yq.clone().multiply(qE(rx, ry, rz));
  const HC: Tup = [0, 0.42, 0.52];
  const hp = (x: number, y: number, z: number) => P(HC[0] + x * H, HC[1] + y * H, HC[2] + z * H);

  const ell = (bone: J, color: any, at: THREE.Vector3, r: Tup, rot: Tup = [0, 0, 0], seg = 10) =>
    b.part(new THREE.SphereGeometry(1, seg, Math.max(4, Math.round(seg * 0.7))), color, {
      bone,
      at,
      quat: Q(rot[0], rot[1], rot[2]),
      scale: [r[0] * S, r[1] * S, r[2] * S],
    });

  // ---- skeleton
  const hips = b.joint(`hips_${k}`, { parent, at: P(0, 0.29, -0.3), dir: Dr(0, 0, 1), role: "spine" });
  const spine = b.chain(
    `spine_${k}`,
    catmull([P(0, 0.29, -0.3), P(0, 0.3, -0.1), P(0, 0.31, 0.12), P(0, 0.33, 0.3)]),
    { parent: hips, names: [`spine1_${k}`, `spine2_${k}`, `spine3_${k}`], role: "spine" },
  );
  const neck = b.chain(`neck_${k}`, catmull([P(0, 0.33, 0.3), P(0, 0.37, 0.41), P(0, 0.4, 0.5)]), {
    parent: spine.joints[2],
    names: [`neck1_${k}`, `neck2_${k}`],
    role: "neck",
  });
  const head = b.joint(`head_${k}`, { parent: neck.joints[1], at: P(0, 0.4, 0.5), dir: Dr(0, 0.05, 1), role: "head" });
  const jaw = b.joint(`jaw_${k}`, { parent: head, at: hp(0, -0.07, 0.03), aim: hp(0, -0.075, 0.2), role: "jaw" });

  // ---- body (barrel) and neck
  const rx = (t: number) => 0.185 + 0.035 * Math.sin(Math.PI * (0.1 + 0.8 * t));
  const ry = (t: number) => 0.2 + 0.03 * Math.sin(Math.PI * (0.1 + 0.8 * t));
  b.sweep(spine, (t: number) => [rx(t) * S, ry(t) * S], { color: COAT, sides: 10 });
  b.sweep(neck, [0.17 * S, 0.16 * S], { color: COAT, sides: 8 });

  // ---- legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const front = limb(P(s * 0.13, 0.2, 0.2), P(s * 0.13, 0.04, 0.25), [0.1 * S, 0.1 * S], [Dr(0, 0, -1)]);
    const arm = b.chain(`arm${side}_${k}`, front, {
      parent: spine.joints[2],
      names: [`shoulder${side}_${k}`, `elbow${side}_${k}`, `hand${side}_${k}`],
      role: "arm",
    });
    b.sweep(arm, [0.07 * S, 0.055 * S], { color: COAT, sides: 8 });
    ell(arm.tip!, FOOT, P(s * 0.13, 0.035, 0.27), [0.055, 0.035, 0.07]);
    for (let i = -1; i <= 1; i++) ell(arm.tip!, NOSE, P(s * 0.13 + i * 0.03, 0.025, 0.33), [0.017, 0.02, 0.02], [0, 0, 0], 6);

    const hind = limb(P(s * 0.15, 0.2, -0.24), P(s * 0.15, 0.04, -0.2), [0.11 * S, 0.11 * S], [Dr(0, 0, 1)]);
    const leg = b.chain(`leg${side}_${k}`, hind, {
      parent: hips,
      names: [`hip${side}_${k}`, `knee${side}_${k}`, `foot${side}_${k}`],
      role: "leg",
    });
    b.sweep(leg, [0.09 * S, 0.055 * S], { color: COAT, sides: 8 });
    ell(leg.tip!, FOOT, P(s * 0.15, 0.035, -0.18), [0.055, 0.035, 0.07]);
    for (let i = -1; i <= 1; i++) ell(leg.tip!, NOSE, P(s * 0.15 + i * 0.03, 0.025, -0.115), [0.017, 0.02, 0.02], [0, 0, 0], 6);
  }

  // ---- tail stub
  const tail = b.joint(`tail1_${k}`, { parent: hips, at: P(0, 0.3, -0.47), aim: P(0, 0.26, -0.56), role: "tail" });
  ell(tail, cel("#9a6a3f"), P(0, 0.28, -0.5), [0.04, 0.035, 0.035], [0, 0, 0], 7);

  // ---- head
  const hel = (bone: J, color: any, d: Tup, r: Tup, rot: Tup = [0, 0, 0], seg = 10) =>
    ell(bone, color, hp(d[0], d[1], d[2]), [r[0] * H, r[1] * H, r[2] * H], rot, seg);

  const skull = hel(head, COAT, [0, 0, 0], [0.17, 0.155, 0.175], [0, 0, 0], 14);
  const muzzle = hel(head, MUZZLE, [0, -0.04, 0.13], [0.1, 0.095, 0.115], [0, 0, 0], 12);
  hel(head, NOSE, [0, 0.005, 0.235], [0.05, 0.032, 0.03], [0, 0, 0], 8);
  hel(head, WHITE, [-0.014, 0.022, 0.258], [0.011, 0.008, 0.006], [0, 0, 0], 5);
  hel(jaw, CREAM, [0, -0.135, 0.11], [0.07, 0.035, 0.09], [0, 0, 0], 9);
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(1, 1, 1), WHITE, {
      bone: head,
      at: hp(s * 0.013, -0.1, 0.228),
      quat: Q(),
      scale: [0.02 * S * H, 0.03 * S * H, 0.012 * S * H],
    });

  // mouth
  b.decal(muzzle, tex.mouth, {
    at: hp(0, -0.075, 0.235),
    dir: Dr(0, -0.1, 1),
    size: [0.07 * S * H, 0.035 * S * H],
  });

  for (const s of [1, -1]) {
    // eyes
    const eyeTex = o.eyes === "dot" ? tex.eyeDot : o.eyes === "happy" ? tex.eyeHappy : tex.eyeSleep;
    const eyeSize: [number, number] = o.eyes === "dot" ? [0.072 * S * H, 0.086 * S * H] : [0.085 * S * H, 0.06 * S * H];
    b.decal(skull, eyeTex, { at: hp(s * 0.12, 0.05, 0.115), dir: Dr(s * 0.55, 0.1, 0.8), size: eyeSize });
    // blush
    b.decal(skull, tex.blush, {
      at: hp(s * 0.135, -0.04, 0.07),
      dir: Dr(s * 0.7, -0.05, 0.7),
      size: [0.075 * S * H, 0.042 * S * H],
    });
    // ears
    const rot: Tup = [-15, 0, -s * 25];
    hel(head, COAT, [s * 0.115, 0.125, -0.045], [0.042, 0.055, 0.03], rot, 9);
    hel(head, EAR_IN, [s * 0.117, 0.125, -0.022], [0.027, 0.038, 0.014], rot, 8);
    // whiskers
    for (let i = 0; i < 3; i++)
      b.spike(hp(s * 0.085, -0.045 - i * 0.012, 0.19), Dr(s * 1, -0.12 + 0.18 * (i - 1) * -1, 0.35), 0.08 * S * H, 0.0035, {
        color: DARK,
        bone: head,
      });
  }

  // ---- hats
  if (o.hat === "yuzu") {
    hel(head, YUZU, [0, 0.175, 0.0], [0.07, 0.058, 0.07], [0, 0, 0], 10);
    hel(head, WHITE, [-0.025, 0.2, 0.035], [0.014, 0.009, 0.01], [0, 0, 0], 5);
    for (const s of [1, -1]) hel(head, LEAF, [s * 0.026, 0.236, 0], [0.032, 0.007, 0.017], [0, s * 25, -s * 25], 6);
    hel(head, cel("#5a8f3d"), [0, 0.232, 0], [0.008, 0.012, 0.008], [0, 0, 0], 5);
  } else if (o.hat === "towel") {
    hel(head, TOWEL, [0, 0.18, 0.0], [0.095, 0.04, 0.075], [0, 0, 0], 10);
    hel(head, TOWEL, [0, 0.22, 0.005], [0.07, 0.03, 0.055], [0, 0, 0], 9);
  } else {
    for (let i = -1; i <= 1; i++)
      b.spike(hp(i * 0.022, 0.15, 0.04), Dr(i * 0.4, 1, 0.55), 0.075 * S * H, 0.02 * S * H, { color: TUFT, bone: head });
  }

  return { head, top: hp(0, 0.3, 0), at: hp(0, 0, 0) };
}

// ---------------------------------------------------------------------------------------------------------------
// Scenery

function rockGeo(seed: number) {
  const g = new THREE.IcosahedronGeometry(1, 1);
  const p = g.getAttribute("position");
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const f = 1 + 0.14 * Math.sin(x * 5.1 + seed) + 0.1 * Math.sin(y * 6.3 + z * 4.7 + seed * 1.7);
    p.setXYZ(i, x * f, y * f, z * f);
  }
  return g;
}

export default function build() {
  const b = createBuilder({ name: "capybara_onsen" });
  const rootJ = b.joint("root", { at: [0, 0, 0] });
  const tex = makeTextures();
  const R = rng(11);

  const sp = (geo: THREE.BufferGeometry, color: any, at: Tup, extra: Record<string, any> = {}) =>
    b.part(geo, color, { bone: rootJ, at, ...extra });
  const blob = (color: any, at: Tup, r: Tup, rot: Tup = [0, 0, 0], seg = 8) =>
    sp(new THREE.SphereGeometry(1, seg, Math.max(4, Math.round(seg * 0.7))), color, at, {
      quat: qE(rot[0], rot[1], rot[2]),
      scale: r,
    });
  const cyl = (rt: number, rb: number, h: number, seg = 12) => new THREE.CylinderGeometry(rt, rb, h, seg);

  // ---- base slab, grass, water
  sp(cyl(1, 1, 0.1, 44), SOIL, [0, 0.05, 0], { scale: [2.4, 1, 1.95] });
  sp(cyl(1, 1, 0.03, 44), GRASS, [0, 0.115, 0], { scale: [2.34, 1, 1.9] });
  sp(cyl(1, 1, WATER_Y - FLOOR, 40), WATER, [0, (WATER_Y + FLOOR) / 2, 0], { scale: [1.62, 1, 1.3] });
  sp(new THREE.PlaneGeometry(3.1, 2.48), WHITE, [0, WATER_Y + 0.004, 0], {
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
    texture: tex.ripple,
  });

  // ---- rim rocks
  const N = 28;
  for (let i = 0; i < N; i++) {
    const th = (i / N) * Math.PI * 2 + (R() - 0.5) * 0.12;
    const front = Math.max(0, Math.sin(th));
    const sx = 0.22 + 0.14 * R();
    const sz = 0.2 + 0.1 * R();
    const sy = 0.22 + 0.1 * R() - 0.06 * front;
    sp(rockGeo(i * 3.7), ROCK, [1.78 * Math.cos(th), FLOOR + 0.1, 1.46 * Math.sin(th)], {
      flat: true,
      scale: [sx, sy, sz],
      quat: qE(0, R() * 360, 0),
    });
  }
  // tall rocks holding the spout
  sp(rockGeo(40), ROCK, [-1.2, FLOOR + 0.3, -1.0], { flat: true, scale: [0.36, 0.38, 0.32], quat: qE(0, 30, 0) });
  sp(rockGeo(41), ROCK, [-0.9, FLOOR + 0.2, -1.2], { flat: true, scale: [0.26, 0.26, 0.24], quat: qE(0, 80, 0) });
  sp(rockGeo(42), ROCK, [-1.5, FLOOR + 0.15, -0.65], { flat: true, scale: [0.28, 0.22, 0.26], quat: qE(0, 10, 0) });

  // ---- bamboo spout
  const pa = V(-1.15, 0.77, -0.95);
  const pb = V(-0.75, 0.7, -0.7);
  b.rod(pa, pb, 0.045, { color: BAMBOO, bone: rootJ, sides: 8 });
  const pipeDir = pb.clone().sub(pa).normalize();
  for (const t of [0.15, 0.5, 0.88])
    sp(cyl(0.052, 0.052, 0.014, 8), BAMBOO_NODE, [0, 0, 0], {
      at: pa.clone().lerp(pb, t),
      dir: pipeDir,
    });
  sp(cyl(0.036, 0.036, 0.01, 8), "#3f6b36", [0, 0, 0], { at: pb.clone().addScaledVector(pipeDir, 0.002), dir: pipeDir });
  b.rod(V(-0.75, 0.69, -0.7), V(-0.75, WATER_Y + 0.005, -0.7), 0.02, { color: "#dff8ff", bone: rootJ, sides: 6 });
  sp(new THREE.TorusGeometry(0.075, 0.012, 5, 14), WHITE, [-0.75, WATER_Y + 0.008, -0.7], { dir: [0, 1, 0], axis: "z", up: [0, 0, 1] });
  sp(new THREE.TorusGeometry(0.13, 0.008, 5, 18), "#e8fffb", [-0.75, WATER_Y + 0.006, -0.7], { dir: [0, 1, 0], axis: "z", up: [0, 0, 1] });

  // ---- capybaras
  const A = capybara(b, rootJ, tex, { k: "A", x: -0.62, z: -0.15, yaw: 0.55, s: 1.0, eyes: "happy", hat: "yuzu" });
  const Bc = capybara(b, rootJ, tex, { k: "B", x: 0.7, z: 0.0, yaw: -0.75, s: 0.95, eyes: "sleep", hat: "towel" });
  const C = capybara(b, rootJ, tex, { k: "C", x: 0.05, z: 0.85, yaw: 0.2, s: 0.5, eyes: "dot", hat: "none", head: 1.25 });

  // ---- floating yuzu fruit
  const floats: [number, number][] = [[0.05, 0.2], [1.1, 0.8], [-1.1, 0.7], [0.55, -0.75], [-0.15, -0.3], [1.15, -0.4]];
  floats.forEach(([x, z], i) => {
    blob(YUZU, [x, WATER_Y + 0.02, z], [0.07, 0.058, 0.07], [0, i * 40, 0], 9);
    blob(WHITE, [x - 0.025, WATER_Y + 0.055, z + 0.03], [0.015, 0.009, 0.01], [0, 0, 0], 5);
    blob(LEAF, [x + 0.03, WATER_Y + 0.07, z], [0.035, 0.007, 0.018], [0, 20 + i * 30, 15], 6);
    sp(new THREE.TorusGeometry(0.095, 0.006, 4, 14), "#f2fffd", [x, WATER_Y + 0.006, z], { dir: [0, 1, 0], axis: "z", up: [0, 0, 1] });
  });

  // ---- floating sake tray
  const tx = 0.12;
  const tz = -0.62;
  sp(new THREE.BoxGeometry(0.34, 0.028, 0.22), WOOD, [tx, WATER_Y + 0.012, tz], { quat: qE(0, 12, 0) });
  sp(new THREE.BoxGeometry(0.36, 0.012, 0.024), cel("#b5783c"), [tx, WATER_Y + 0.03, tz + 0.1], { quat: qE(0, 12, 0) });
  sp(new THREE.BoxGeometry(0.36, 0.012, 0.024), cel("#b5783c"), [tx, WATER_Y + 0.03, tz - 0.1], { quat: qE(0, 12, 0) });
  b.lathe(
    [[0, 0], [0.04, 0], [0.05, 0.04], [0.05, 0.08], [0.02, 0.12], [0.02, 0.15], [0.03, 0.16], [0, 0.16]],
    { at: [tx - 0.07, WATER_Y + 0.026, tz], segments: 10, color: cel("#f4f0ff"), bone: rootJ },
  );
  sp(cyl(0.052, 0.052, 0.012, 10), cel("#7fa9e8"), [tx - 0.07, WATER_Y + 0.07, tz]);
  for (const dx of [0.06, 0.12]) {
    sp(cyl(0.03, 0.024, 0.035, 10), cel("#f4f0ff"), [tx + dx, WATER_Y + 0.045, tz + 0.03]);
    sp(cyl(0.024, 0.024, 0.004, 10), "#d9c07a", [tx + dx, WATER_Y + 0.064, tz + 0.03]);
  }

  // ---- wooden bucket with yuzu and a towel
  const bx = 1.55;
  const bz = 1.0;
  b.lathe([[0, 0], [0.11, 0], [0.13, 0.14], [0.115, 0.14], [0.095, 0.015], [0, 0.015]], {
    at: [bx, FLOOR, bz],
    segments: 14,
    color: WOOD,
    bone: rootJ,
  });
  for (const h of [0.04, 0.1])
    sp(new THREE.TorusGeometry(0.11 + 0.02 * (h / 0.14), 0.007, 5, 18), BRASS, [bx, FLOOR + h, bz], { dir: [0, 1, 0], axis: "z", up: [0, 0, 1] });
  blob(YUZU, [bx - 0.03, FLOOR + 0.12, bz], [0.06, 0.05, 0.06], [0, 0, 0], 9);
  blob(YUZU, [bx + 0.04, FLOOR + 0.125, bz + 0.02], [0.055, 0.047, 0.055], [0, 0, 0], 9);
  blob(TOWEL, [bx, FLOOR + 0.15, bz - 0.04], [0.1, 0.025, 0.06], [0, 20, 0], 9);

  // ---- stone lantern (tōrō) with a glowing window
  const lx = 1.7;
  const lz = -0.9;
  const STONE = ROCK;
  sp(cyl(0.15, 0.17, 0.07, 6), STONE, [lx, FLOOR + 0.035, lz]);
  sp(cyl(0.06, 0.07, 0.34, 6), STONE, [lx, FLOOR + 0.24, lz]);
  sp(cyl(0.13, 0.1, 0.04, 6), STONE, [lx, FLOOR + 0.43, lz]);
  sp(new THREE.BoxGeometry(0.22, 0.025, 0.22), STONE, [lx, FLOOR + 0.4625 + 0.0, lz]);
  glow(
    sp(new THREE.BoxGeometry(0.15, 0.13, 0.15), WHITE, [lx, FLOOR + 0.54, lz], { texture: tex.windowTex }),
    1.3,
  );
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      sp(new THREE.BoxGeometry(0.028, 0.14, 0.028), STONE, [lx + sx * 0.088, FLOOR + 0.54, lz + sz * 0.088]);
  sp(new THREE.BoxGeometry(0.22, 0.025, 0.22), STONE, [lx, FLOOR + 0.6175, lz]);
  b.lathe([[0, 0], [0.21, 0], [0.2, 0.025], [0.07, 0.1], [0.04, 0.13], [0, 0.13]], {
    at: [lx, FLOOR + 0.63, lz],
    segments: 6,
    spin: 30,
    color: STONE,
    bone: rootJ,
  });
  blob(STONE, [lx, FLOOR + 0.79, lz], [0.04, 0.045, 0.04], [0, 0, 0], 8);

  // ---- steam wisps
  const steamFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 14; i++) {
    const x = (R() < 0.5 ? -1 : 1) * (0.2 + 1.3 * R());
    const z = -1.1 + 1.25 * R();
    steamFrames.push(frame(V(x, WATER_Y + 0.02, z), [0, 1, 0]));
  }
  b.cards(steamFrames, tex.steam, {
    size: [0.2, 0.55],
    bone: rootJ,
    cross: true,
    vary: 0.3,
    spin: 180,
    bend: 20,
    rng: rng(5),
  });

  // ---- grass tufts and flowers around the rim
  const tuftFrames: ReturnType<typeof frame>[] = [];
  const flowerFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 52; i++) {
    const th = R() * Math.PI * 2;
    const f = 0.96 + 0.08 * R();
    tuftFrames.push(frame(V(2.2 * f * Math.cos(th), FLOOR, 1.78 * f * Math.sin(th)), [0, 1, 0]));
  }
  for (let i = 0; i < 16; i++) {
    const th = R() * Math.PI * 2;
    const f = 0.94 + 0.08 * R();
    flowerFrames.push(frame(V(2.1 * f * Math.cos(th), FLOOR, 1.7 * f * Math.sin(th)), [0, 1, 0]));
  }
  b.cards(tuftFrames, tex.tuft, { size: [0.16, 0.13], bone: rootJ, cross: true, vary: 0.3, spin: 180, rng: rng(21) });
  b.cards(flowerFrames, tex.flower, { size: [0.1, 0.16], bone: rootJ, cross: true, vary: 0.25, spin: 180, rng: rng(22) });

  // ---- hearts and sparkles
  const up = (v: THREE.Vector3, dx: number, dy: number, dz: number) => frame(v.clone().add(V(dx, dy, dz)), [0, 1, 0]);
  glow(
    b.cards(
      [up(A.top, 0.0, 0.0, 0.0), up(A.top, 0.14, 0.14, 0.04), up(A.top, -0.12, 0.26, 0.0)],
      tex.heart,
      { size: [0.12, 0.11], bone: rootJ, flow: [0, 0, 1], cross: true, spin: 10, rng: rng(31) },
    ),
    0.7,
  );
  glow(
    b.cards(
      [up(Bc.top, 0.1, 0.0, 0.0), up(Bc.top, -0.1, 0.12, 0.0), up(C.top, 0.08, 0.04, 0.0), up(C.top, -0.1, 0.12, 0.02)],
      tex.sparkle,
      { size: 0.1, bone: rootJ, flow: [0, 0, 1], cross: true, rng: rng(32) },
    ),
    0.8,
  );

  return b.root;
}
```