// Gray wolf standing alert, Blizzard/Warcraft style: chunky heroic proportions, hand-painted coat with painted
// highlight and shadow gradients, saturated amber eyes, tuft cards for a ragged silhouette, worn leather collar.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { lerp, offset, rng } from "../../../../src/math";
import { catmull, polyline } from "../../../../src/path";
import { gradient, mix, mottle, noise, paint, smoothstep } from "../../../../src/paint";
import type { Rgb } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gray Wolf (alert)",
  description:
    "A heavy-shouldered gray wolf standing alert, painted in a hand-brushed heroic style with a ragged fur silhouette, amber eyes, a scarred muzzle and a worn leather collar with a fang charm.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const GRAY_D = "#2c313e";
const GRAY_M = "#6c7686";
const GRAY_L = "#a2abb7";
const FROST = "#d3dae2";
const CREAM = "#eadfc4";
const TAN = "#b08a58";
const MUZZLE = "#8a7152";
const SHADE = "#38395a";
const DIRT = "#5d5446";
const NOSE = "#17121b";
const BONE = "#f1e4c1";
const CLAW = "#3a3029";
const LEATHER = "#8a4a22";
const LEATHER_D = "#5c2c12";
const IRON = "#8d96a3";
const IRON_D = "#4b525c";
const TEAL = "#22b3a2";
const RED = "#d8432a";
const MOUTH = "#4a1220";
const TONGUE = "#d9566f";
const EAR_IN = "#d9b295";

// ---------------------------------------------------------------------------------------------------------------
// Coat: one paint for the whole animal so patterns run across body, legs, head and tail.
const HEAD_Y = 1.0;
const HEAD_Z = 0.62;
const hairQ = new THREE.Vector3();
const coat = paint((p, n) => {
  hairQ.set(p.x * 3.2, p.y * 3.2, p.z * 0.9);
  const streak = noise(hairQ, 0.06, 4);
  const clump = noise(p, 0.18, 11);
  const w = (noise(p, 0.13, 3) - 0.5) * 0.8;
  let c: Rgb = mix(GRAY_M, GRAY_L, smoothstep(0.4, 0.72, streak) * 0.85);
  c = mix(c, GRAY_D, smoothstep(0.72, 0.92, noise(hairQ, 0.04, 7)) * 0.25);
  c = mix(c, TAN, smoothstep(0.6, 0.28, p.y) * smoothstep(0.3, 0.6, clump) * 0.6);
  // dark saddle over the back, shoulders and tail top
  c = mix(c, GRAY_D, smoothstep(0.05, 0.6, n.y + w - 0.05) * smoothstep(0.5, 0.7, p.y) * 0.9);
  // pale underside, chest bib and inner legs
  c = mix(c, CREAM, smoothstep(-0.25, -0.65, n.y + w * 0.5) * 0.95);
  const inner = -n.x * Math.sign(p.x);
  c = mix(c, CREAM, smoothstep(0.05, 0.55, inner + w * 0.3) * smoothstep(0.64, 0.5, p.y) * 0.9);
  const bib = smoothstep(0.35, 0.8, n.z + w) * smoothstep(0.3, 0.42, p.z) * smoothstep(0.6, 0.46, p.y) * (Math.abs(p.x) < 0.2 ? 1 : 0);
  c = mix(c, CREAM, bib * smoothstep(0.55, 0.42, p.y) * 0.8);
  // dark pencil stripe down the front of the forelegs
  const stripe = smoothstep(0.45, 0.75, n.z + w * 0.3) * smoothstep(0.5, 0.4, p.y) * smoothstep(0.15, 0.25, p.z) * smoothstep(0.05, 0.12, p.y);
  c = mix(c, GRAY_D, stripe * 0.85);
  // head markings
  const hz = p.z - HEAD_Z;
  const hd = smoothstep(0.02, 0.08, hz) * smoothstep(0.85, 0.93, p.y);
  if (hd > 0) {
    let hc: Rgb = mix(GRAY_M, GRAY_L, smoothstep(0.4, 0.72, streak) * 0.7);
    hc = mix(hc, GRAY_D, smoothstep(0.3, 0.7, n.y) * smoothstep(0.1, 0.0, hz - 0.1) * 0.5);
    // cream cheeks, lips and chin
    const pale = smoothstep(HEAD_Y + 0.035, HEAD_Y - 0.015, p.y) * smoothstep(0.08, 0.2, hz);
    hc = mix(hc, CREAM, pale * 0.95);
    // tan muzzle bridge with a dark centre line
    const snout = smoothstep(0.16, 0.24, hz) * smoothstep(0.0, 0.55, n.y);
    hc = mix(hc, MUZZLE, snout * 0.9);
    hc = mix(hc, GRAY_D, snout * smoothstep(0.028, 0.012, Math.abs(p.x)) * 0.7);
    // dark spectacles around the eyes
    const de = Math.hypot(Math.abs(p.x) - 0.095, p.y - (HEAD_Y + 0.045), (p.z - (HEAD_Z + 0.13)) * 0.9);
    hc = mix(hc, GRAY_D, smoothstep(0.045, 0.03, de) * 0.9);
    c = mix(c, hc, hd);
  }
  // painted light from above, cool shadow from below, dirt on the paws
  c = mix(c, FROST, smoothstep(0.5, 0.95, n.y) * 0.3);
  c = mix(c, SHADE, smoothstep(-0.1, -0.9, n.y) * 0.4);
  c = mix(c, DIRT, smoothstep(0.14, 0.02, p.y) * 0.65);
  return c;
});

// ---------------------------------------------------------------------------------------------------------------
// Textures
const tuftSvg = (d: string) =>
  svg(
    `<svg viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8a8a8a"/><stop offset="0.55" stop-color="#d4d4d4"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs><path d="${d}" fill="url(#g)"/></svg>`,
    { size: 128 },
  );
const TUFTS = [
  tuftSvg("M16 0 L21 22 L26 12 L28 36 L32 24 L31 64 L1 64 L0 24 L4 36 L6 12 L11 22 Z"),
  tuftSvg("M18 0 L22 26 L30 14 L29 44 L32 64 L2 64 L3 38 L8 20 L12 28 Z"),
  tuftSvg("M12 0 L18 20 L22 10 L27 40 L31 64 L1 64 L4 30 L8 14 L10 26 Z"),
];

const EYE = svg(
  `<svg viewBox="0 0 64 40"><defs>
  <clipPath id="e"><path d="M2 31 Q22 4 62 8 Q46 36 2 31Z"/></clipPath>
  <radialGradient id="i" cx="0.5" cy="0.55" r="0.6"><stop offset="0" stop-color="#ffe680"/><stop offset="0.6" stop-color="#ffaa14"/><stop offset="1" stop-color="#c24c08"/></radialGradient></defs>
  <path d="M2 31 Q22 4 62 8 Q46 36 2 31Z" fill="#2a1d14"/>
  <g clip-path="url(#e)"><ellipse cx="33" cy="20" rx="15" ry="14" fill="url(#i)"/><ellipse cx="33" cy="20" rx="5" ry="8.5" fill="#120c0a"/><path d="M0 0H64V14Q32 6 0 14Z" fill="#1b130e" opacity=".55"/></g>
  <circle cx="28" cy="14" r="3.4" fill="#fff"/><circle cx="39" cy="25" r="1.6" fill="#fff" opacity=".85"/>
  <path d="M2 31 Q22 4 62 8" stroke="#140d0a" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M4 33 Q3 37 1 40" stroke="#140d0a" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  { size: 256 },
);

const SCAR = svg(
  `<svg viewBox="0 0 40 52"><g fill="none" stroke-linecap="round">
  <path d="M8 4 L28 46" stroke="#7a3a3a" stroke-width="7"/><path d="M16 2 L35 40" stroke="#7a3a3a" stroke-width="6"/><path d="M2 12 L20 48" stroke="#7a3a3a" stroke-width="6"/>
  <path d="M8 4 L28 46" stroke="#e6a29a" stroke-width="3.4"/><path d="M16 2 L35 40" stroke="#e6a29a" stroke-width="3"/><path d="M2 12 L20 48" stroke="#e6a29a" stroke-width="3"/></g></svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------------------------------------------------------
const keyed = (keys: number[][]) => (t: number) => {
  if (t <= keys[0][0]) return keys[0].slice(1);
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const k = (t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]);
      return keys[i].slice(1).map((v, j) => keys[i - 1][j + 1] + (v - keys[i - 1][j + 1]) * k);
    }
  }
  return keys[keys.length - 1].slice(1);
};
const pair = (keys: number[][]) => {
  const f = keyed(keys);
  return (t: number): [number, number] => {
    const v = f(t);
    return [v[0], v[1]];
  };
};
const single = (keys: number[][]) => {
  const f = keyed(keys);
  return (t: number) => f(t)[0];
};
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const ball = (rx: number, ry: number, rz: number, w = 10, h = 8) => new THREE.SphereGeometry(1, w, h).scale(rx, ry, rz);

export default function build() {
  const b = createBuilder({ name: "grayWolf" });
  const R = rng(17);

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.68, -0.4], dir: [0, 0.03, 1], role: "spine" });
  const body = catmull([
    [0, 0.68, -0.4],
    [0, 0.69, -0.12],
    [0, 0.705, 0.14],
    [0, 0.72, 0.38],
    [0, 0.86, 0.5],
    [0, 1.0, 0.62],
  ]);
  const tN = body.closestT([0, 0.72, 0.38]);
  const spine = b.chain("spine", body.slice(0, tN), { parent: hips, count: 3, role: "spine" });
  const neck = b.chain("neck", body.slice(tN, 1), { parent: spine.joints[2], count: 2, role: "neck" });
  const chest = spine.joints[2];
  const head = b.joint("head", { at: neck.at(1), dir: [0, -0.12, 1], role: "head" });

  const tailPath = catmull([
    [0, 0.68, -0.4],
    [0, 0.68, -0.64],
    [0, 0.61, -0.86],
    [0, 0.47, -1.0],
    [0, 0.3, -1.06],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, role: "tail" });

  // ---------------------------------------------------------------- torso and neck
  const torso = b.sweep(body, pair([
    [0, 0.12, 0.125],
    [0.06, 0.15, 0.16],
    [0.2, 0.15, 0.155],
    [0.32, 0.135, 0.14],
    [0.48, 0.17, 0.19],
    [0.62, 0.2, 0.215],
    [0.68, 0.19, 0.2],
    [0.78, 0.14, 0.145],
    [0.9, 0.115, 0.12],
    [1, 0.095, 0.1],
  ]), { bone: [hips, spine, neck], color: coat, sides: 10 });

  for (const s of [1, -1]) {
    b.part(ball(0.1, 0.17, 0.17), coat, { bone: chest, at: [s * 0.15, 0.7, 0.3] });
    b.part(ball(0.1, 0.15, 0.15), coat, { bone: hips, at: [s * 0.15, 0.62, -0.4] });
  }

  // ---------------------------------------------------------------- tail
  const tailPaint = gradient(coat, "#2a2d38", tailPath.at(0.72), tailPath.at(1));
  const tailTube = b.sweep(tail, pair([
    [0, 0.07, 0.07],
    [0.2, 0.1, 0.1],
    [0.55, 0.115, 0.115],
    [0.85, 0.085, 0.085],
    [1, 0.03, 0.03],
  ]), { color: tailPaint, caps: "point" });

  // ---------------------------------------------------------------- legs
  const legSweeps: ReturnType<typeof b.sweep>[] = [];
  const hindSweeps: ReturnType<typeof b.sweep>[] = [];
  const makePaw = (tag: string, base: THREE.Vector3, pawJ: ReturnType<typeof b.joint>) => {
    b.part(ball(0.062, 0.05, 0.088), coat, { bone: pawJ, at: [base.x, base.y - 0.004, base.z + 0.036] });
    [-0.046, -0.015, 0.015, 0.046].forEach((dx, i) => {
      const a = V(base.x + dx * 0.55, 0.045, base.z + 0.035);
      const t = V(base.x + dx * 1.3, 0.036, base.z + 0.118 - Math.abs(dx) * 0.9);
      const dj = b.joint(`digit${tag}${i + 1}`, { parent: pawJ, at: a, aim: t, role: "digit" });
      b.capsule(a, t, [0.032, 0.027], { color: coat, bone: dj });
      b.spike(t, [dx * 0.35, -0.3, 1], 0.065, 0.014, { color: CLAW, bone: dj });
    });
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const fp = limb([s * 0.15, 0.6, 0.3], [s * 0.15, 0.058, 0.44], [0.22, 0.28, 0.14, 0.1], [[0, 0, -1], [0, 0, 1]], { sole: [0, 0, 1] });
    const fl = b.chain(`foreleg${side}`, polyline(fp), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `pastern${side}`, `paw${side}`],
      role: "leg",
    });
    legSweeps.push(
      b.sweep(fl, single([[0, 0.095], [0.31, 0.066], [0.5, 0.05], [0.63, 0.043], [0.85, 0.04], [1, 0.045]]), { color: coat }),
    );
    makePaw(`F${side}`, fp[3], fl.joints[4]);

    const hp = limb([s * 0.14, 0.62, -0.4], [s * 0.15, 0.058, -0.4], [0.25, 0.27, 0.2, 0.1], [[0, 0, 1], [0, 0, -1]], { sole: [0, 0, 1] });
    const hl = b.chain(`hindleg${side}`, polyline(hp), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `metatarsus${side}`, `foot${side}`],
      role: "leg",
    });
    hindSweeps.push(
      b.sweep(hl, single([[0, 0.12], [0.18, 0.115], [0.305, 0.07], [0.47, 0.055], [0.634, 0.047], [0.76, 0.038], [0.878, 0.038], [1, 0.045]]), { color: coat }),
    );
    makePaw(`H${side}`, hp[3], hl.joints[4]);
  }

  // ---------------------------------------------------------------- head
  const hl = (f: number, u: number, l = 0) => head.local({ forward: f, up: u, left: l });
  const skull = b.part(ball(0.105, 0.1, 0.125, 12, 9), coat, { bone: head, at: hl(0.1, 0.03) });
  const snoutLen = 0.24;
  const snoutC = (f: number) => {
    const t = (f - 0.14) / snoutLen;
    return { y: 0.01 - 0.04 * t, rx: 0.065 - 0.03 * t, ry: 0.058 - 0.026 * t };
  };
  const snout = b.sweep([hl(0.14, 0.01), hl(0.38, -0.03)], (t) => [0.065 - 0.03 * t, 0.058 - 0.026 * t], { bone: head, color: coat });
  const faceSkin = b.surface([skull, snout]);

  // nose, lips, brow ridges
  b.part(ball(0.038, 0.028, 0.03, 8, 6), NOSE, { bone: head, at: hl(0.395, -0.022) });
  b.part(ball(0.008, 0.006, 0.006, 5, 4), "#ffffff", { bone: head, at: hl(0.412, -0.012, 0.012) });
  for (const s of [1, -1]) {
    const lipA = snoutC(0.2);
    const lipB = snoutC(0.37);
    b.rod(hl(0.2, lipA.y - 0.6 * lipA.ry, s * lipA.rx * 0.8), hl(0.37, lipB.y - 0.6 * lipB.ry, s * lipB.rx * 0.8), 0.011, NOSE, { bone: head });
    b.rod(hl(0.16, 0.106, s * 0.05), hl(0.1, 0.074, s * 0.095), [0.016, 0.012], GRAY_D, { bone: head });
    // whiskers
    for (let k = 0; k < 4; k++) {
      const base = hl(0.3 - 0.01 * k, -0.025 - 0.01 * k, s * 0.033);
      const tip = hl(0.2 - 0.015 * k, -0.07 - 0.018 * k, s * (0.16 + 0.02 * k));
      b.sweep(catmull([base, lerp(base, tip, 0.5).add(V(0, 0.02, 0)), tip]), [0.003, 0.0008], { bone: head, color: BONE, caps: "none" });
    }
  }

  // lower jaw
  const jaw = b.joint("jaw", { parent: head, at: hl(0.1, -0.04), aim: hl(0.3, -0.07), role: "jaw" });
  b.sweep([hl(0.11, -0.065), hl(0.25, -0.083), hl(0.375, -0.088)], (t) => [0.052 - 0.028 * t, 0.032 - 0.012 * t], { bone: jaw, color: coat });
  b.rod(hl(0.14, -0.062), hl(0.33, -0.072), [0.018, 0.012], TONGUE, { bone: jaw });
  b.rod(hl(0.12, -0.05), hl(0.34, -0.058), 0.03, MOUTH, { bone: jaw });

  // teeth
  for (const s of [1, -1]) {
    const cu = snoutC(0.355);
    b.spike(hl(0.355, cu.y - cu.ry + 0.004, s * cu.rx * 0.8), [0, -1, 0.15], 0.052, 0.012, { color: BONE, bone: head });
    b.spike(hl(0.352, -0.083, s * 0.022), [0, 1, 0.15], 0.042, 0.01, { color: BONE, bone: jaw });
    for (let i = 0; i < 3; i++) {
      const f = 0.22 + 0.045 * i;
      const c = snoutC(f);
      b.spike(hl(f, c.y - c.ry + 0.003, s * c.rx * 0.8), [0, -1, 0], 0.024, 0.008, { color: BONE, bone: head });
      b.spike(hl(f + 0.02, -0.07 - 0.002 * i, s * (0.04 - 0.004 * i)), [0, 1, 0], 0.02, 0.007, { color: BONE, bone: jaw });
    }
  }
  b.pose(jaw, { axis: [1, 0, 0], deg: 7 });

  // eyes
  for (const s of [1, -1]) {
    const eye = b.decal(faceSkin, EYE, {
      at: hl(0.13, 0.045, s * 0.088),
      dir: [s * 0.62, 0.08, 0.78],
      size: [0.068, 0.043],
      mirror: s < 0,
      lift: 0.002,
    });
    glow(eye, 0.7);
  }
  b.decal(faceSkin, SCAR, { at: hl(0.2, 0.0, -0.075), dir: [-0.8, 0.1, 0.5], size: [0.05, 0.066], lift: 0.003, roll: 12 });

  // ears
  const earOutline: OutlinePoint[] = [[-0.065, 0], [0.065, 0], [0.052, 0.05], [0.022, 0.13], [0, 0.19, "sharp"], [-0.032, 0.12], [-0.052, 0.055]];
  const earNotch: OutlinePoint[] = [[-0.065, 0], [0.065, 0], [0.052, 0.05], [0.022, 0.13], [0, 0.19, "sharp"], [-0.02, 0.15], [-0.03, 0.135, "sharp"], [-0.034, 0.12], [-0.05, 0.055]];
  const earIn: OutlinePoint[] = [[-0.04, 0.012], [0.04, 0.012], [0.032, 0.05], [0.012, 0.115], [0, 0.15, "sharp"], [-0.02, 0.11], [-0.034, 0.055]];
  const A = 20 * (Math.PI / 180);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const base = hl(0.05, 0.1, s * 0.07);
    const ear = b.joint(`ear${side}`, { parent: head, at: base, dir: [s * Math.sin(A), Math.cos(A), 0.2], role: "hinge" });
    const x = [Math.cos(A), -s * Math.sin(A), 0];
    const y = [s * Math.sin(A), Math.cos(A), 0.2];
    const outer = b.extrude(s > 0 ? earOutline : earNotch, {
      at: base,
      x,
      y,
      thickness: [0.02, 0.008],
      bevel: 0.004,
      smoothing: 1,
      bone: ear,
      color: paint((_p, _n, c) => (c[1] > 0.14 ? GRAY_D : coat)),
    });
    b.extrude(earIn, { at: offset(base, outer, 0.009), x, y, thickness: [0.012, 0.004], bevel: 0.003, smoothing: 1, bone: ear, color: EAR_IN });
  }

  // ---------------------------------------------------------------- collar and charms
  const neckJ = neck.joints[1];
  const skin = b.surface(torso);
  const collarLoop = skin.loop(neckJ, { lift: 0.032 });
  const leather = mottle(LEATHER, LEATHER_D, { size: 0.03, contrast: 1.2, seed: 5 });
  b.sweep(collarLoop, () => [0.03, 0.013], { color: leather, sides: 6 });
  b.along(skin.loop(neckJ, { lift: 0.046 }), 16, (at) => b.part(new THREE.SphereGeometry(0.0125, 6, 4), IRON, { at }));
  const throat = skin.nearest([0, 0.8, 0.7]);
  const pend = throat.at.clone().add(V(0, 0.0, 0.035));
  b.part(new THREE.TorusGeometry(0.02, 0.005, 6, 10), IRON_D, { bone: neckJ, at: pend, dir: [0, 0, 1], axis: "z" });
  b.spike(pend.clone().add(V(0, -0.012, 0.004)), [0, -1, 0.2], 0.085, 0.02, { color: BONE, bone: neckJ });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 8), IRON, { bone: neckJ, at: pend.clone().add(V(0, -0.02, 0.012)), dir: [0, 0, 1], axis: "y" });
  for (const [dx, col, len] of [[0.06, TEAL, 0.13], [0.085, RED, 0.11]] as const) {
    const top = skin.nearest([dx, 0.8, 0.64]);
    const attach = top.at.clone().add(V(0, 0.0, 0.03));
    b.rod(attach, attach.clone().add(V(0, -0.025, 0.003)), 0.004, LEATHER_D, { bone: neckJ });
    b.extrude(
      [[0, 0], [0.014, 0.03], [0.022, 0.075], [0.012, len * 0.9], [0, len, "sharp"], [-0.012, len * 0.7], [-0.02, 0.05], [-0.008, 0.018]],
      { at: attach.clone().add(V(0, -0.025, 0.006)), x: [1, 0, 0], y: [0, -1, 0.2], thickness: 0.005, smoothing: 1, color: gradient(col, "#fff3d0", [0, 0.8, 0], [0, 0.6, 0]), bone: neckJ },
    );
  }

  // ---------------------------------------------------------------- fur cards
  const R2 = rng(5);
  const collarC = neckJ.at.clone();
  const collarAxis = neckJ.axis.clone();
  const nearCollar = (p: THREE.Vector3) => {
    const d = p.clone().sub(collarC).dot(collarAxis);
    return d > -0.02 && d < 0.1;
  };
  const cardOpts = { rng: R2, color: coat, vary: 0.3, spin: 12 };
  const neckHits = skin.scatter(300, { rng: R, minDist: 0.038, filter: (h) => h.at.z > 0.3 && h.n.y > -0.5 && !nearCollar(h.at) });
  b.cards(neckHits, TUFTS, { ...cardOpts, size: [0.075, 0.13], lean: 62, bend: 25, flow: [0, -0.35, -1] });
  const bibHits = skin.scatter(120, { rng: R, minDist: 0.04, filter: (h) => h.at.z > 0.28 && h.n.y < -0.3 });
  b.cards(bibHits, TUFTS, { ...cardOpts, size: [0.06, 0.1], lean: 60, bend: 20, flow: [0, -0.2, -1] });
  const flankHits = skin.scatter(260, { rng: R, minDist: 0.055, filter: (h) => h.at.z < 0.3 && h.at.z > -0.55 && h.n.y > -0.45 });
  b.cards(flankHits, TUFTS, { ...cardOpts, size: [0.06, 0.1], lean: 74, bend: 20 });
  const maneHits = skin.scatter(110, { rng: R, minDist: 0.04, filter: (h) => h.n.y > 0.7 && Math.abs(h.at.x) < 0.08 && h.at.z < 0.62 });
  b.cards(maneHits, TUFTS, { ...cardOpts, size: [0.05, 0.12], lean: 38, bend: 25 });
  for (const sw of hindSweeps)
    b.cards(b.surface(sw).scatter(90, { rng: R, minDist: 0.04, filter: (h) => h.at.y > 0.3 && h.n.z < 0.35 }), TUFTS, { ...cardOpts, size: [0.05, 0.09], lean: 66, bend: 18 });
  for (const sw of legSweeps)
    b.cards(b.surface(sw).scatter(60, { rng: R, minDist: 0.04, filter: (h) => h.at.y > 0.25 && h.n.z < -0.1 }), TUFTS, { ...cardOpts, size: [0.045, 0.08], lean: 66, bend: 18 });
  b.cards(b.surface(tailTube).scatter(170, { rng: R, minDist: 0.03, filter: (h) => h.at.y > 0.22 }), TUFTS, { ...cardOpts, color: tailPaint, size: [0.06, 0.11], lean: 58, bend: 25 });
  for (const s of [1, -1])
    b.cards(
      faceSkin.scatter(40, { rng: R, minDist: 0.03, filter: (h) => (s > 0 ? h.at.x > 0.06 : h.at.x < -0.06) && Math.abs(h.n.x) > 0.5 && h.at.y < HEAD_Y + 0.05 && h.at.z < HEAD_Z + 0.2 }),
      TUFTS,
      { ...cardOpts, size: [0.05, 0.08], lean: 70, bend: 15, flow: [0, -0.2, -1] },
    );

  return b.root;
}
