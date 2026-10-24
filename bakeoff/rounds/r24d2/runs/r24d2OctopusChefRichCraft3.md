```ts
import * as THREE from "three";
import {
  aim,
  bezier,
  catmull,
  cells,
  createBuilder,
  DEG,
  frame,
  mix,
  noise,
  offset,
  paint,
  rgb,
  rng,
  smoothstep,
  spiral,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Chef Octavio, the juggling octopus",
  description:
    "A Pixar-style octopus chef in a toque, mustache, neckerchief and apron. He stands on four tentacles and juggles pans with the other four. Sizzling flames, a flying pancake, fish and tomato, with a ladle and whisk in his back arms.",
};

// ------------------------------------------------------------------------------------------------
// Palette
const C_LO = rgb("#c9443f");
const C_MID = rgb("#f4724f");
const C_HI = rgb("#ff9b70");
const C_PALE = rgb("#ffd6b8");
const C_SPECK = rgb("#bd3c3f");
const C_PINK = rgb("#ff8fa3");

const SUCKER = "#ffe3d2";
const SUCKER_IN = "#e98a86";
const LID_EDGE = "#a93b3d";
const BROW = "#b53c3b";
const STACHE = "#3d2230";
const STEEL = "#cfd5e0";
const WOOD = "#b0713b";
const WOOD_LT = "#d39a5c";
const BRASS = "#e2b04a";
const BLUE = "#3b78b8";
const HAT_WHITE = "#fffaf1";

const RIM = rgb("#d4d8e2");
const PAN_IN_A = rgb("#2b2d38");
const PAN_IN_B = rgb("#454859");
const COPPER_LO = rgb("#9a4a22");
const COPPER_HI = rgb("#e08a4c");

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const P3 = (v: THREE.Vector3): [number, number, number] => [v.x, v.y, v.z];

// ------------------------------------------------------------------------------------------------
// Paints
function skinColor(p: THREE.Vector3, n: THREE.Vector3) {
  let c = mix(C_LO, C_MID, smoothstep(-0.8, 0.1, n.y));
  c = mix(c, C_HI, smoothstep(0.15, 1, n.y) * 0.75);
  c = mix(c, C_LO, smoothstep(0.58, 0.85, noise(p, 0.1, 3)) * 0.3);
  const k = cells(p, 0.07, 9);
  if (k.id > 0.45 && k.d1 < 0.16) c = mix(c, C_SPECK, 0.6);
  return c;
}

const bodyPaint = paint((p, n) => skinColor(p, n));

const headPaint = paint((p, n) => {
  let c = skinColor(p, n);
  for (const s of [1, -1]) {
    const d = Math.hypot(p.x - s * 0.2, (p.y - 0.72) * 1.3);
    c = mix(c, C_PINK, 0.65 * smoothstep(0.08, 0.03, d) * smoothstep(0.0, 0.3, n.z));
  }
  return c;
});

const limbPaint = paint((p, n, s) => {
  let c = skinColor(p, n);
  c = mix(c, C_PALE, smoothstep(-0.2, -0.65, Math.cos(s[1] * DEG)) * 0.9);
  c = mix(c, C_PINK, smoothstep(0.84, 1, s[0]) * 0.55);
  return c;
});

const SCARF_A = rgb("#16a6a0");
const SCARF_B = rgb("#0f7f86");
const WHITE_DOT = rgb("#fff4ea");
const scarfPaint = paint((p, n) => {
  const k = cells(p, 0.05, 4);
  return k.d1 < 0.17 ? WHITE_DOT : mix(SCARF_A, SCARF_B, smoothstep(-0.5, 0.8, -n.y));
});

const PLEAT_A = rgb("#fffaf1");
const PLEAT_B = rgb("#e4dccd");
const PLEAT_C = rgb("#c9d3e6");
const toquePaint = paint((_p, n, s) => {
  const f = 0.5 + 0.5 * Math.sin(s[1] * DEG * 16);
  let c = mix(PLEAT_A, PLEAT_B, f * 0.55);
  c = mix(c, PLEAT_C, smoothstep(0.2, -0.8, n.y) * 0.5);
  return c;
});

const panPaint = (N: THREE.Vector3) =>
  paint((p, n, s) => {
    if (s[0] > 0.0625) return RIM;
    const up = n.dot(N);
    if (up > 0.2) return mix(PAN_IN_A, PAN_IN_B, smoothstep(0.3, 0.8, noise(p, 0.05, 2)));
    return mix(COPPER_LO, COPPER_HI, smoothstep(-1, 0.2, up) * 0.7 + noise(p, 0.06, 6) * 0.3);
  });

// ------------------------------------------------------------------------------------------------
// Textures
function makeTextures() {
  const EYE = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="i" cx="0.5" cy="0.64" r="0.62">
        <stop offset="0" stop-color="#9be7ff"/><stop offset="0.55" stop-color="#2f9ad6"/><stop offset="1" stop-color="#0f3f6e"/>
      </radialGradient></defs>
      <circle cx="50" cy="50" r="46" fill="#0d2a4a"/>
      <circle cx="50" cy="50" r="42" fill="url(#i)"/>
      <circle cx="50" cy="52" r="21" fill="#07101e"/>
      <ellipse cx="34" cy="32" rx="12" ry="10" fill="#ffffff"/>
      <circle cx="65" cy="67" r="5.5" fill="#e8f8ff"/>
      <circle cx="60" cy="74" r="2.4" fill="#e8f8ff"/>
    </svg>`,
    { size: 256 },
  );

  const D = "M30 0 L70 0 L72 12 Q97 18 97 46 L97 80 Q97 92 85 92 L15 92 Q3 92 3 80 L3 46 Q3 18 28 12 Z";
  let stripes = "";
  for (let i = 0; i < 10; i++) stripes += `<rect x="${6 + i * 10}" y="0" width="4" height="94" fill="#d3e3f7"/>`;
  const APRON = svg(
    `<svg viewBox="0 0 100 94" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="c"><path d="${D}"/></clipPath></defs>
      <path d="${D}" fill="#fbf2df"/>
      <g clip-path="url(#c)">${stripes}</g>
      <path d="${D}" fill="none" stroke="#8f7f66" stroke-width="1.8"/>
      <path d="${D}" transform="translate(50 47) scale(0.9) translate(-50 -47)" fill="none" stroke="#6f9bd1" stroke-width="1.1" stroke-dasharray="3 2.5"/>
      <text x="50" y="29" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="9" fill="#2b5fa3">CHEZ OCTO</text>
      <rect x="55" y="40" width="4.6" height="26" rx="2" fill="#b0713b"/>
      <ellipse cx="57.3" cy="37" rx="5.6" ry="7" fill="#b0713b"/>
      <rect x="36" y="46" width="4" height="22" fill="#cfd5e0"/>
      <rect x="32" y="36" width="12" height="12" rx="2" fill="#cfd5e0"/>
      <path d="M26 58 H74 V84 Q74 88 70 88 H30 Q26 88 26 84 Z" fill="#f2e3c6" stroke="#8f7f66" stroke-width="1.5"/>
      <path d="M30 62 H70 V83 Q70 85 68 85 H32 Q30 85 30 83 Z" fill="none" stroke="#6f9bd1" stroke-width="1" stroke-dasharray="2.5 2"/>
      <path d="M50 66 q-5 -4 -2 -7 q2 -2 2 1 q0 -3 2 -1 q3 3 -2 7z" fill="#e0453a"/>
    </svg>`,
    { size: 384 },
  );

  const FLAME = svg(
    `<svg viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 2 C34 24 56 40 54 64 C52 82 40 88 30 88 C20 88 8 82 6 64 C4 46 18 38 22 22 C26 30 28 20 30 2 Z" fill="#ff5a1f"/>
      <path d="M30 30 C32 46 46 54 44 68 C43 80 36 84 30 84 C24 84 17 80 16 68 C15 56 26 50 26 40 C28 44 29 38 30 30 Z" fill="#ffab1f"/>
      <path d="M30 56 C33 64 38 68 37 76 C36 82 33 84 30 84 C27 84 24 82 23 76 C22 68 28 64 30 56 Z" fill="#fff2a0"/>
    </svg>`,
    { size: 192 },
  );
  return { EYE, APRON, FLAME };
}

// ------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "octopusChef" });
  type J = ReturnType<typeof b.joint>;
  const rand = rng(21);
  const { EYE, APRON, FLAME } = makeTextures();

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.45, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.45, 0],
      [0, 0.58, 0],
      [0, 0.72, 0.02],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const head = b.joint("head", { parent: spine, at: [0, 0.74, 0.02], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.63, 0.2], aim: [0, 0.63, 0.34], role: "jaw" });
  const hat = b.joint("hat", { parent: head, at: [0, 1.04, 0.03], dir: [0, 1, 0] });

  // ---------------------------------------------------------------- body
  const bodySweep = b.sweep(spine, [0.27, 0.235, 0.2, 0.18], { color: bodyPaint, sides: 12 });
  const bodySkin = b.surface(bodySweep);

  // ---------------------------------------------------------------- head
  const HS = 1;
  const HC = V(0, 0.8, 0.03);
  const hp = (x: number, y: number, z: number): [number, number, number] => [x * HS, HC.y + y * HS, HC.z + z * HS];
  const headPart = b.part(new THREE.SphereGeometry(1, 20, 14), headPaint, {
    bone: head,
    at: P3(HC),
    scale: [0.3 * HS, 0.32 * HS, 0.3 * HS],
  });
  const hs = b.surface(headPart);
  const hit = (az: number, el: number) => {
    const h = hs.around(HC).at(az, el);
    if (!h) throw new Error(`no head hit at ${az},${el}`);
    return h;
  };
  const pt = (az: number, el: number, lift: number) => {
    const h = hit(az, el);
    return offset(h, h, lift);
  };

  // eyes
  const EYE_R = 0.088;
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ec = hp(s * 0.13, 0.03, 0.225);
    const ecv = V(...ec);
    const gaze = V(s * 0.22, 0.04, 1).normalize();
    const eyeJ = b.joint(`eye${side}`, { parent: head, at: ec, dir: P3(gaze) });
    const lidJ = b.joint(`lid${side}`, { parent: head, at: ec, dir: P3(gaze), role: "hinge" });
    const eyeball = b.part(new THREE.SphereGeometry(EYE_R, 14, 10), "#fffaf2", { bone: eyeJ, at: ec });
    b.decal(eyeball, EYE, {
      at: ecv.clone().addScaledVector(gaze, EYE_R),
      dir: P3(gaze),
      size: [0.115, 0.115],
      lift: 0.002,
      bone: eyeJ,
    });
    // upper lid, lid edge, lower lid
    b.part(new THREE.SphereGeometry(EYE_R * 1.07, 14, 8, 0, Math.PI * 2, 0, 1.15), headPaint, {
      bone: lidJ,
      at: ec,
    });
    b.part(new THREE.TorusGeometry(0.0858, 0.0045, 5, 14, Math.PI).rotateX(Math.PI / 2), LID_EDGE, {
      bone: lidJ,
      at: [ec[0], ec[1] + 0.0384, ec[2]],
    });
    b.part(
      new THREE.SphereGeometry(EYE_R * 1.06, 14, 8, 0, Math.PI * 2, Math.PI - 1.0, 1.0),
      headPaint,
      { bone: head, at: ec },
    );
    // brows
    const brow = catmull([
      pt(s * 14, 39, 0.012),
      pt(s * 24, 42, 0.014),
      pt(s * 35, 38, 0.012),
      pt(s * 44, 32, 0.01),
    ]);
    b.sweep(brow, [0.012, 0.02, 0.014, 0.008], { bone: head, color: BROW });
    // smile crease
    const crease = catmull([pt(s * 19, -24, 0.004), pt(s * 24, -27, 0.004), pt(s * 27, -33, 0.004)]);
    b.sweep(crease, [0.005, 0.006, 0.003], { bone: head, color: LID_EDGE });
    // mustache
    const stache = catmull([
      pt(s * 3, -21, 0.012),
      pt(s * 12, -24, 0.014),
      pt(s * 24, -24, 0.014),
      pt(s * 34, -19, 0.012),
      pt(s * 40, -13, 0.01),
    ]);
    b.sweep(stache, [0.032, 0.028, 0.02, 0.013, 0.006], { bone: head, color: STACHE });
  }

  // mouth: dark opening on the head, pink lower jaw and tongue on the jaw bone
  const mouthHit = hit(0, -33);
  b.stick(new THREE.SphereGeometry(1, 12, 8), "#7a1e32", mouthHit, { embed: 0.3, scale: [0.085, 0.03, 0.042], bone: head });
  const jawHit = hit(0, -41);
  b.stick(new THREE.SphereGeometry(1, 12, 8), "#ff9d86", jawHit, { embed: 0.3, scale: [0.1, 0.03, 0.055], bone: jaw });
  b.stick(new THREE.SphereGeometry(1, 10, 6), "#ff6f86", hit(0, -36), { embed: 0.5, scale: [0.045, 0.016, 0.022], bone: jaw });

  // ---------------------------------------------------------------- chef's hat
  const bandPart = b.lathe(
    [
      [0, 0],
      [0.232, 0],
      [0.242, 0.016],
      [0.242, 0.096],
      [0.232, 0.112],
      [0, 0.112],
    ] as [number, number][],
    { at: [0, 1.04, 0.03], bone: hat, segments: 18, color: HAT_WHITE, name: "hatBand" },
  );
  b.sweep(b.surface(bandPart).loop([0, 1.075, 0.03], { lift: 0.004 }), 0.011, { bone: hat, color: BLUE });
  b.lathe(
    [
      [0, 0.1],
      [0.225, 0.1],
      [0.29, 0.16],
      [0.34, 0.25],
      [0.335, 0.33],
      [0.3, 0.4],
      [0.22, 0.45],
      [0, 0.46],
    ] as [number, number][],
    { at: [0, 1.145, 0.03], axis: [0.1, 1, 0.04], bone: hat, segments: 16, smoothing: 1, color: toquePaint, name: "toque" },
  );

  // ---------------------------------------------------------------- neckerchief
  const neckLoop = bodySkin.loop([0, 0.585, 0], { lift: 0.012 });
  b.sweep(neckLoop, 0.034, { color: scarfPaint, bone: spine.joints[2] });
  const knotAt = neckLoop.at(0);
  const knotP = V(knotAt.x, knotAt.y - 0.005, knotAt.z + 0.03);
  b.part(new THREE.SphereGeometry(0.048, 10, 8), scarfPaint, { bone: spine.joints[2], at: P3(knotP) });
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.025, 0],
        [0.025, 0],
        [0.04, -0.1],
        [0, -0.08],
        [-0.04, -0.1],
      ] as [number, number][],
      {
        at: P3(knotP.clone().add(V(s * 0.02, -0.02, 0.02))),
        x: [1, 0.38 * s, 0],
        y: [-0.38 * s, 1, 0],
        thickness: 0.014,
        bevel: 0.003,
        color: scarfPaint,
        bone: spine.joints[2],
      },
    );
  }

  // ---------------------------------------------------------------- apron
  b.decal(bodySweep, APRON, { at: [0, 0.4, 0.25], dir: [0, 0, 1], size: [0.36, 0.34], segments: 14, lift: 0.004 });
  const strap = bodySkin.loop([0, 0.42, 0], { lift: 0.016 });
  b.sweep(strap, 0.016, { color: BLUE, bone: hips });
  const bowAt = strap.at(0.5);
  const bowP = V(bowAt.x, bowAt.y, bowAt.z - 0.015);
  b.part(new THREE.SphereGeometry(0.03, 8, 6), BLUE, { bone: hips, at: P3(bowP) });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), BLUE, {
      bone: hips,
      at: P3(bowP.clone().add(V(s * 0.05, 0.005, -0.015))),
      scale: [0.05, 0.028, 0.02],
    });
    b.extrude(
      [
        [-0.02, 0],
        [0.02, 0],
        [0.03, -0.11],
        [0, -0.09],
        [-0.03, -0.11],
      ] as [number, number][],
      {
        at: P3(bowP.clone().add(V(s * 0.02, -0.01, -0.02))),
        x: [1, 0.3 * s, 0],
        y: [-0.3 * s, 1, 0],
        thickness: 0.012,
        color: BLUE,
        bone: hips,
      },
    );
  }

  // ---------------------------------------------------------------- tentacles on the floor
  const legR = (t: number) => 0.105 * Math.pow(1 - t, 1.05) + 0.012;
  const legDefs = [
    { id: "FL", a: 38, reach: 0.95, swirl: 24 },
    { id: "FR", a: -42, reach: 1.0, swirl: -28 },
    { id: "BL", a: 148, reach: 1.0, swirl: -26 },
    { id: "BR", a: -146, reach: 0.9, swirl: 24 },
  ];
  for (const d of legDefs) {
    const D = [0.17, 0.31, 0.49, 0.67, 0.81, d.reach, d.reach - 0.07];
    const U = [0, 0.03, 0.2, 0.5, 0.8, 1.0, 1.35];
    const Y = [0.36, 0.215, 0.105, 0.048, 0.036, 0.085, 0.16];
    const pts = D.map((dist, i) => {
      const ang = (d.a + d.swirl * U[i]) * DEG;
      return [dist * Math.sin(ang), Y[i], dist * Math.cos(ang)];
    });
    const chain = b.chain(`leg${d.id}`, catmull(pts), { parent: hips, role: "tentacle", count: 6 });
    b.sweep(chain, legR, { color: limbPaint });
  }

  // ---------------------------------------------------------------- raised arms
  const armR = (t: number) => 0.088 * Math.pow(1 - t, 0.85) + 0.021;
  function raisedArm(tag: string, mids: number[][], grip: THREE.Vector3, H: THREE.Vector3) {
    const pen = V(...(mids[mids.length - 1] as [number, number, number]));
    const perp = pen.clone().sub(grip);
    perp.addScaledVector(H, -perp.dot(H)).normalize();
    const from = grip.clone().addScaledVector(perp, 0.045);
    const chain = b.chain(tag, catmull([...mids, P3(from)]), { parent: hips, role: "tentacle", count: 6 });
    const sw = b.sweep(chain, armR, { color: limbPaint, sides: 10 });
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 8; i++) {
        const t = 0.14 + i * 0.1 + row * 0.05;
        const at = sw.at(t, row ? 205 : 155);
        const k = at.radius * 0.34;
        b.stick(new THREE.CylinderGeometry(1, 1.15, 0.3, 8), SUCKER, at, { embed: 0.35, scale: [k, k, k] });
        b.stick(new THREE.SphereGeometry(1, 6, 4), SUCKER_IN, at.moved([0, k * 0.2, 0]), {
          embed: 0.5,
          scale: [k * 0.55, k * 0.22, k * 0.55],
        });
      }
    }
    const tip = chain.joints[chain.joints.length - 1];
    const wrap = spiral(grip, from, H, { turns: 1.4, r1: 0.034, pitch: 0.03 });
    b.sweep(wrap, [0.02, 0.008], { bone: tip, color: limbPaint });
    return tip;
  }

  // ---------------------------------------------------------------- pans
  const PAN_K = 1.15;
  const PAN_PROFILE = (
    [
      [0, 0],
      [0.115, 0],
      [0.13, 0.012],
      [0.17, 0.052],
      [0.18, 0.055],
      [0.18, 0.06],
      [0.168, 0.06],
      [0.12, 0.018],
      [0, 0.018],
    ] as [number, number][]
  ).map(([x, y]) => [x * PAN_K, y * PAN_K] as [number, number]);

  type PanFrame = { C: THREE.Vector3; N: THREE.Vector3; H: THREE.Vector3 };
  function panFrame(c: number[], n: number[], h: number[]): PanFrame {
    const N = V(n[0], n[1], n[2]).normalize();
    const H = V(h[0], h[1], h[2]);
    H.addScaledVector(N, -H.dot(N)).normalize();
    return { C: V(c[0], c[1], c[2]), N, H };
  }
  function buildPan(P: PanFrame, bone: J, tag: string) {
    const { C, N, H } = P;
    const at = (d: number) => C.clone().addScaledVector(H, d);
    b.lathe(PAN_PROFILE, { at: P3(C), axis: P3(N), segments: 14, bone, color: panPaint(N), name: `pan${tag}` });
    b.rod(at(0.19), at(0.3), [0.02, 0.022], { bone, color: STEEL });
    b.rod(at(0.3), at(0.54), [0.026, 0.021], { bone, color: WOOD });
    b.part(new THREE.SphereGeometry(0.024, 8, 6), WOOD_LT, { bone, at: P3(at(0.545)) });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.014, 8), BRASS, { bone, at: P3(at(0.3)), dir: P3(H) });
    for (const s of [1, -1]) {
      b.part(new THREE.SphereGeometry(0.009, 6, 4), STEEL, {
        bone,
        at: P3(at(0.215).addScaledVector(N, s * 0.012).addScaledVector(H.clone().cross(N), 0)),
      });
    }
  }
  function egg(P: PanFrame, bone: J) {
    const { C, N } = P;
    b.part(new THREE.SphereGeometry(1, 12, 6), "#fffdf6", {
      bone,
      at: P3(C.clone().addScaledVector(N, 0.028)),
      dir: P3(N),
      scale: [0.1, 0.014, 0.09],
    });
    b.part(new THREE.SphereGeometry(1, 10, 8), "#ffb619", {
      bone,
      at: P3(C.clone().addScaledVector(N, 0.04)),
      dir: P3(N),
      scale: [0.035, 0.028, 0.035],
    });
    b.part(new THREE.SphereGeometry(1, 6, 4), "#fff3c4", {
      bone,
      at: P3(C.clone().addScaledVector(N, 0.062).add(V(0.012, 0, 0.012))),
      scale: [0.008, 0.005, 0.008],
    });
  }

  // pan A (left hand, flambé)
  const PA = panFrame([0.98, 1.2, 0.2], [0.18, 1, 0.08], [-1, -0.05, -0.1]);
  const tipA = raisedArm(
    "armUL",
    [
      [0.16, 0.5, 0.08],
      [0.34, 0.55, 0.15],
      [0.5, 0.78, 0.22],
      [0.57, 1.0, 0.22],
    ],
    PA.C.clone().addScaledVector(PA.H, 0.42),
    PA.H,
  );
  buildPan(PA, tipA, "A");
  glow(
    b.cards(
      [-0.07, 0, 0.07].map((dx, i) =>
        frame(P3(PA.C.clone().addScaledVector(PA.N, 0.05).add(V(dx, 0, i === 1 ? 0.03 : -0.01))), [0, 1, 0]),
      ),
      FLAME,
      { size: [0.15, 0.25], flow: [0, 0, 1], cross: true, vary: 0.3, rng: rand, bone: tipA },
    ),
    1.4,
  );

  // pan B (right hand, egg)
  const PB = panFrame([-0.95, 1.45, 0.22], [-0.35, 1, 0.15], [1, 0.12, -0.1]);
  const tipB = raisedArm(
    "armUR",
    [
      [-0.16, 0.5, 0.08],
      [-0.34, 0.56, 0.15],
      [-0.47, 0.85, 0.23],
      [-0.52, 1.2, 0.25],
    ],
    PB.C.clone().addScaledVector(PB.H, 0.42),
    PB.H,
  );
  buildPan(PB, tipB, "B");
  egg(PB, tipB);

  // back-left arm: ladle
  const ladleGrip = V(0.66, 1.28, -0.17);
  const tipLadle = raisedArm(
    "armBL",
    [
      [0.14, 0.5, -0.1],
      [0.33, 0.58, -0.22],
      [0.5, 0.85, -0.27],
      [0.58, 1.12, -0.22],
    ],
    ladleGrip,
    V(0, 1, 0),
  );
  b.rod([0.66, 0.92, -0.17], [0.66, 1.76, -0.17], 0.016, { bone: tipLadle, color: STEEL });
  b.rod([0.66, 1.12, -0.17], [0.66, 1.46, -0.17], 0.024, { bone: tipLadle, color: WOOD });
  b.lathe(
    (
      [
        [0, 0],
        [0.04, 0.006],
        [0.07, 0.03],
        [0.08, 0.06],
        [0.073, 0.06],
        [0.063, 0.032],
        [0.036, 0.012],
        [0, 0.01],
      ] as [number, number][]
    ).map(([x, y]) => [x * 1.35, y * 1.35] as [number, number]),
    { at: [0.66, 1.76, -0.17], axis: [0.35, 1, 0.55], segments: 12, bone: tipLadle, color: STEEL, name: "ladleBowl" },
  );

  // back-right arm: whisk
  const whiskGrip = V(-0.66, 1.2, -0.17);
  const tipWhisk = raisedArm(
    "armBR",
    [
      [-0.14, 0.5, -0.1],
      [-0.33, 0.58, -0.22],
      [-0.5, 0.85, -0.27],
      [-0.58, 1.05, -0.22],
    ],
    whiskGrip,
    V(0, 1, 0),
  );
  b.rod([-0.66, 0.95, -0.17], [-0.66, 1.5, -0.17], 0.021, { bone: tipWhisk, color: WOOD });
  b.part(new THREE.CylinderGeometry(0.03, 0.026, 0.04, 8), BRASS, { bone: tipWhisk, at: [-0.66, 1.51, -0.17] });
  for (let k = 0; k < 5; k++) {
    b.part(new THREE.TorusGeometry(0.06, 0.0035, 4, 14), STEEL, {
      bone: tipWhisk,
      at: [-0.66, 1.625, -0.17],
      rotation: [0, k * 36, 0],
      scale: [0.5, 1.9, 1],
    });
  }

  // ---------------------------------------------------------------- airborne items
  const jugC = b.joint("juggleC", { parent: hips, at: [0.42, 1.9, 0.08] });
  const jugD = b.joint("juggleD", { parent: hips, at: [-0.36, 2.15, -0.08] });
  const jugF = b.joint("juggleFish", { parent: hips, at: [-1.0, 2.0, 0.3] });

  const PC = panFrame([0.42, 1.9, 0.08], [0.45, 0.88, -0.2], [-0.55, 0.35, 0.75]);
  buildPan(PC, jugC, "C");
  const PD = panFrame([-0.36, 2.15, -0.08], [-0.55, 0.7, 0.45], [0.6, 0.2, 0.75]);
  buildPan(PD, jugD, "D");

  // pancake above pan C
  {
    const A = V(0.35, 0.85, -0.4).normalize();
    const c = V(0.52, 2.45, 0.04);
    const cakePaint = paint((_p, n) =>
      Math.abs(n.dot(A)) > 0.8 ? rgb("#e0a050") : rgb("#c98a3e"),
    );
    b.part(new THREE.CylinderGeometry(0.13, 0.135, 0.04, 14), cakePaint, { bone: jugC, at: P3(c), dir: P3(A) });
    b.part(new THREE.SphereGeometry(1, 12, 6), "#c8731c", {
      bone: jugC,
      at: P3(c.clone().addScaledVector(A, 0.021)),
      dir: P3(A),
      scale: [0.1, 0.012, 0.1],
    });
    b.part(new THREE.BoxGeometry(0.06, 0.02, 0.06), "#ffe27a", {
      bone: jugC,
      at: P3(c.clone().addScaledVector(A, 0.034)),
      dir: P3(A),
    });
  }

  // tomato above pan D
  {
    const c = V(-0.2, 2.75, -0.05);
    b.part(new THREE.SphereGeometry(0.075, 12, 9), "#e8322c", { bone: jugD, at: P3(c), scale: [1, 0.88, 1] });
    b.part(new THREE.SphereGeometry(0.036, 8, 5), "#3a9a3c", {
      bone: jugD,
      at: P3(c.clone().add(V(0, 0.062, 0))),
      scale: [1.3, 0.35, 1.3],
    });
    b.part(new THREE.CylinderGeometry(0.006, 0.01, 0.04, 5), "#2f7a31", {
      bone: jugD,
      at: P3(c.clone().add(V(0, 0.09, 0))),
    });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), "#ffb8b0", {
      bone: jugD,
      at: P3(c.clone().add(V(-0.03, 0.025, 0.06))),
      scale: [1, 0.6, 0.5],
    });
  }

  // fish above pan B
  {
    const F = V(-0.4, 0.8, 0.3).normalize();
    const C = V(-1.0, 2.0, 0.3);
    const Z = V(0, 0, 1);
    const Uf = Z.clone().addScaledVector(F, -Z.dot(F)).normalize();
    const side = F.clone().cross(Uf).normalize();
    const fishPaint = paint((p, n) => {
      const k = cells(p, 0.035, 12);
      const back = smoothstep(-0.1, 0.4, n.dot(Uf));
      let c = mix(rgb("#eef4f6"), rgb("#4c86b0"), back);
      if (k.d2 - k.d1 < 0.1) c = mix(c, rgb("#2d5f86"), 0.3);
      return c;
    });
    b.part(new THREE.SphereGeometry(1, 12, 8), fishPaint, {
      bone: jugF,
      at: P3(C),
      quat: aim(F, Uf),
      scale: [0.04, 0.15, 0.06],
    });
    b.extrude(
      [
        [0, 0],
        [0.09, 0.075],
        [0.065, 0],
        [0.09, -0.075],
      ] as [number, number][],
      {
        at: P3(C.clone().addScaledVector(F, -0.13)),
        x: P3(F.clone().negate()),
        y: P3(Uf),
        thickness: 0.01,
        color: "#f09a3a",
        bone: jugF,
      },
    );
    b.extrude(
      [
        [-0.06, 0],
        [0.06, 0],
        [-0.03, 0.075],
      ] as [number, number][],
      {
        at: P3(C.clone().addScaledVector(Uf, 0.045)),
        x: P3(F),
        y: P3(Uf),
        thickness: 0.008,
        color: "#f09a3a",
        bone: jugF,
      },
    );
    for (const s of [1, -1]) {
      const e = C.clone().addScaledVector(F, 0.1).addScaledVector(Uf, 0.015).addScaledVector(side, s * 0.032);
      b.part(new THREE.SphereGeometry(0.017, 8, 6), "#ffffff", { bone: jugF, at: P3(e) });
      b.part(new THREE.SphereGeometry(0.009, 6, 4), "#10141c", {
        bone: jugF,
        at: P3(e.clone().addScaledVector(side, s * 0.011)),
      });
    }
  }

  // ---------------------------------------------------------------- motion swooshes and sparkles
  const swoosh = (a: number[], c: number[], z: number[]) =>
    b.sweep(bezier(a, c, z), [0.012, 0.002], { bone: hips, color: "#fff3d6" });
  swoosh([0.95, 1.6, 0.1], [0.85, 2.0, 0.1], [0.62, 1.95, 0.1]);
  swoosh([-0.75, 1.7, 0.2], [-0.62, 2.15, 0.1], [-0.5, 2.3, 0.0]);
  swoosh([0.1, 2.6, 0.05], [0.25, 2.8, 0.05], [0.42, 2.72, 0.05]);

  const STAR: [number, number][] = [
    [0, 0.05],
    [0.012, 0.012],
    [0.05, 0],
    [0.012, -0.012],
    [0, -0.05],
    [-0.012, -0.012],
    [-0.05, 0],
    [-0.012, 0.012],
  ];
  const sparkles: [number, number, number, number][] = [
    [1.12, 1.55, 0.3, 1.2],
    [0.75, 2.2, 0.2, 0.8],
    [0.1, 2.55, 0.25, 1.0],
    [-0.75, 2.45, 0.2, 0.9],
    [-1.25, 1.75, 0.3, 0.7],
    [-0.6, 1.85, 0.4, 0.6],
  ];
  for (const [x, y, z, sc] of sparkles) {
    glow(
      b.extrude(
        STAR.map(([u, v]) => [u * sc, v * sc] as [number, number]),
        { at: [x, y, z], x: [1, 0, 0], thickness: 0.006, color: "#ffe97a", bone: hips },
      ),
      1.2,
    );
  }

  return b.root;
}
```