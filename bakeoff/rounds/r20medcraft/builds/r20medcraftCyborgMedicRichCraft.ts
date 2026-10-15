// Support-hero cyborg medic with a healing staff, in a polished Overwatch-style look: clean bold shapes, crisp colour
// blocking (white armour, graphite suit, ONE strong teal accent), bevel-like layered plates and glowing details.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { bezier, catmull, spiral } from "../../../../src/path";
import { mix, noise, paint, smoothstep } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cyborg Medic",
  description:
    "A support-hero cyborg medic: white plated armour, graphite bodysuit, a prosthetic left arm, leg and cyber-eye, a glowing teal accent, a medic backpack with fins, and a winged healing staff planted on the floor.",
  style: "Overwatch",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "cyborgMedic" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------------------------------------------------------------- palette
  const WHITE = "#f1f5f9";
  const WHITE_S = "#a9b8c8";
  const GRAPH = "#2b3340";
  const GRAPH_S = "#171c25";
  const GRAPH_L = "#47525f";
  const DARK = "#12161d";
  const SILVER = "#b4bfcb";
  const SILVER_D = "#5d6977";
  const TEAL = "#16e6b8";
  const TEAL_D = "#0b8a78";
  const SEAM = "#6f7e8e";
  const SKIN = "#a8734f";
  const SKIN_S = "#7d4f36";
  const HAIR = "#2f2540";
  const STREAK = "#17cfa6";
  const AMBER = "#c98a2b";

  const ARMOR: Paint = paint((p, n) => {
    let c = mix(WHITE_S, WHITE, smoothstep(-0.5, 0.65, n.y));
    if (noise(p, 0.05, 5) > 0.8) c = mix(c, "#d4deea", 0.7);
    return c;
  });
  const SUIT: Paint = paint((_p, n) => mix(GRAPH_S, GRAPH, smoothstep(-0.5, 0.7, n.y)));
  const METAL: Paint = paint((p, n) => {
    let c = mix("#79869a", SILVER, smoothstep(-0.4, 0.8, n.y));
    if (Math.abs(((p.y * 60) % 1) - 0.5) < 0.03) c = mix(c, "#46525f", 0.7);
    return c;
  });
  const SKIN_P: Paint = paint((_p, n) => mix(SKIN_S, SKIN, smoothstep(-0.5, 0.6, n.y)));
  const HAIR_P: Paint = paint((p, n) => {
    if (n.y > 0.6 && noise(p, 0.035, 2) > 0.6) return "#6a5a8c";
    return mix("#17111f", HAIR, smoothstep(-0.3, 0.8, n.y));
  });
  const CHEST: Paint = paint((p, n) => {
    if (n.z > 0.35) {
      if (Math.abs(p.x) < 0.004) return SEAM;
      if (Math.abs(Math.abs(p.x) - 0.085) < 0.005 && p.y > 1.27) return TEAL;
      if (Math.abs(p.y - 1.385) < 0.003) return SEAM;
    }
    return ARMOR;
  });

  // ---------------------------------------------------------------- textures
  const EYE_R = svg(
    `<svg viewBox="0 0 64 40">
    <defs><clipPath id="a"><path d="M4 22 Q32 -2 60 22 Q32 40 4 22 Z"/></clipPath></defs>
    <path d="M4 22 Q32 -2 60 22 Q32 40 4 22 Z" fill="#f4f1ee"/>
    <g clip-path="url(#a)">
      <circle cx="32" cy="21" r="13" fill="${AMBER}"/>
      <circle cx="32" cy="21" r="13" fill="none" stroke="#7a4a12" stroke-width="2.2"/>
      <circle cx="32" cy="21" r="5.5" fill="#17171c"/>
      <ellipse cx="32" cy="9" rx="20" ry="6" fill="#3a2418" opacity="0.35"/>
    </g>
    <circle cx="26.5" cy="16" r="3" fill="#ffffff"/>
    <circle cx="37" cy="26" r="1.6" fill="#ffffff"/>
    <path d="M3 23 Q32 -5 61 23" stroke="#2a1b24" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M8 28 Q32 37 56 27" stroke="#6b4535" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M58 22 l5 -5" stroke="#2a1b24" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
    { size: 256 },
  );
  const EYE_L = svg(
    `<svg viewBox="0 0 64 40">
    <path d="M4 22 Q32 -2 60 22 Q32 40 4 22 Z" fill="#0b0f15"/>
    <circle cx="32" cy="21" r="13" fill="none" stroke="${TEAL}" stroke-width="2.6"/>
    <circle cx="32" cy="21" r="8.5" fill="none" stroke="${TEAL_D}" stroke-width="2"/>
    <circle cx="32" cy="21" r="4.2" fill="#dffff8"/>
    <path d="M32 3 v6 M32 33 v6 M14 21 h6 M44 21 h6" stroke="${TEAL}" stroke-width="2" stroke-linecap="round"/>
    <path d="M3 23 Q32 -5 61 23" stroke="#1a222c" stroke-width="4" fill="none" stroke-linecap="round"/>
  </svg>`,
    { size: 256 },
  );
  const MOUTH = svg(
    `<svg viewBox="0 0 64 24">
    <path d="M4 11 Q16 4 32 8 Q48 4 60 11 Q48 12 32 12 Q16 12 4 11Z" fill="#a85a52"/>
    <path d="M4 11 Q32 14 60 11 Q50 22 32 22 Q14 22 4 11Z" fill="#c4756a"/>
    <path d="M4 11 Q32 14 60 11" stroke="#3a1c20" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`,
    { size: 192 },
  );
  const CORE = svg(
    `<svg viewBox="0 0 96 96">
    <circle cx="48" cy="48" r="44" fill="#0c1a1f"/>
    <circle cx="48" cy="48" r="39" fill="none" stroke="${TEAL}" stroke-width="4"/>
    <rect x="40" y="22" width="16" height="52" rx="3" fill="${TEAL}"/>
    <rect x="22" y="40" width="52" height="16" rx="3" fill="${TEAL}"/>
    <path d="M48 4 v8 M48 84 v8 M4 48 h8 M84 48 h8" stroke="${TEAL}" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
    { size: 256 },
  );
  const GRILLE = svg(
    `<svg viewBox="0 0 64 44">
    <rect width="64" height="44" fill="#1a212b"/>
    ${[4, 12, 20, 28, 36].map((y) => `<rect x="5" y="${y}" width="54" height="4" rx="1" fill="${TEAL}"/>`).join("")}
    <rect x="0" y="0" width="64" height="44" fill="none" stroke="#47525f" stroke-width="3"/>
  </svg>`,
    { size: 192 },
  );

  // ---------------------------------------------------------------- geometry helpers
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const tor = (r: number, t: number, s = 14) => new THREE.TorusGeometry(r, t, 5, s);
  const put = (
    geo: THREE.BufferGeometry,
    color: string | Paint,
    bone: Joint,
    at: readonly number[],
    opts: PartOptions = {},
  ) => b.part(geo, color, { ...opts, bone, at });
  const scaleOutline = (o: OutlinePoint[], k: number, dy: number): OutlinePoint[] =>
    o.map((q) => [q[0] * k, q[1] * k + dy] as [number, number]);
  const curled = (base: THREE.Vector3, dir: THREE.Vector3, axis: THREE.Vector3, lens: number[], curls: number[]) => {
    const pts = [base.clone()];
    const d = dir.clone().normalize();
    let p = base.clone();
    lens.forEach((l, i) => {
      d.applyAxisAngle(axis, curls[i]);
      p = p.clone().addScaledVector(d, l);
      pts.push(p);
    });
    return pts;
  };
  const makeFinger = (name: string, parent: Joint, pts: THREE.Vector3[], r: number, color: string) => {
    const names = pts.slice(1).map((_, i) => `${name}${i + 1}`);
    const ch = b.chain(name, pts, { parent, names, role: "digit" });
    b.sweep(ch, [r, r * 0.75], { color, sides: 6 });
    return ch;
  };

  // ---------------------------------------------------------------- skeleton: spine, neck, head
  const hips = b.joint("hips", { at: [0, 0.95, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.95, 0],
      [0, 1.12, 0],
      [0, 1.3, 0.01],
      [0, 1.46, 0],
    ],
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const spine1 = spine.joints[0];
  const spine2 = spine.joints[1];
  const chestJ = spine.joints[2];
  const neck = b.chain(
    "neck",
    [
      [0, 1.46, 0],
      [0, 1.56, 0.015],
    ],
    { parent: chestJ, names: ["neck"], role: "neck" },
  );
  const neckJ = neck.joints[0];
  const head = b.joint("head", { parent: neckJ, at: [0, 1.56, 0.015], dir: [0, 1, 0.12], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.64, 0.0], aim: [0, 1.6, 0.1], role: "jaw" });

  // ---------------------------------------------------------------- torso
  const torso = b.loft(
    [
      { at: [0, 0.93, 0], w: 0.3, h: 0.19 },
      { at: [0, 1.05, 0], w: 0.275, h: 0.19 },
      { at: [0, 1.18, 0], w: 0.27, h: 0.2 },
      { at: [0, 1.32, 0.012], w: 0.345, h: 0.235 },
      { at: [0, 1.43, 0.005], w: 0.4, h: 0.22 },
      { at: [0, 1.48, 0], w: 0.3, h: 0.16 },
    ],
    { color: SUIT, bone: spine },
  );
  const chestArmor = b.loft(
    [
      { at: [0, 1.26, 0.04], w: 0.31, h: 0.2 },
      { at: [0, 1.35, 0.05], w: 0.355, h: 0.22 },
      { at: [0, 1.44, 0.03], w: 0.33, h: 0.18 },
    ],
    { color: CHEST, bone: spine },
  );
  const armorSkin = b.surface(chestArmor);
  const coreHit = armorSkin.ray([0, 1.33, 1], [0, 0, -1]);
  if (coreHit) glow(b.decal(armorSkin, CORE, { at: coreHit, size: [0.07, 0.07], lift: 0.002 }), 1.3);
  // bandolier strap draped over the torso
  const torsoSkin = b.surface([torso, chestArmor]);
  const strap = torsoSkin.drape(
    catmull([
      [-0.14, 1.46, 0.1],
      [-0.07, 1.38, 0.17],
      [0, 1.29, 0.17],
      [0.08, 1.2, 0.15],
      [0.14, 1.12, 0.12],
    ]),
    { lift: 0.01 },
  );
  b.sweep(strap, 0.014, { color: TEAL_D, sides: 6 });
  // abdominal plates
  [0.17, 0.19, 0.2].forEach((w, i) => put(box(w, 0.032, 0.04), ARMOR, spine2, [0, 1.11 + 0.04 * i, 0.105]));
  // side piping
  for (const s of [1, -1]) {
    glow(b.rod([s * 0.141, 0.97, 0.01], [s * 0.139, 1.2, 0.0], 0.005, { color: TEAL, bone: spine1, sides: 5 }), 1);
  }
  // belt
  put(cyl(1, 1, 0.07, 14), GRAPH_L, hips, [0, 1.045, 0], { scale: [0.155, 1, 0.118] });
  glow(put(cyl(1, 1, 0.01, 14), TEAL, hips, [0, 1.085, 0], { scale: [0.157, 1, 0.12] }), 1);
  glow(put(cyl(1, 1, 0.01, 14), TEAL, hips, [0, 1.005, 0], { scale: [0.157, 1, 0.12] }), 1);
  put(box(0.075, 0.06, 0.03), ARMOR, hips, [0, 1.045, 0.126]);
  glow(put(sph(0.014), TEAL, hips, [0, 1.045, 0.144]), 1.4);
  for (const s of [1, -1]) {
    put(box(0.07, 0.09, 0.05), GRAPH_L, hips, [s * 0.118, 1.03, 0.09], { rotation: [0, s * 25, 0] });
    put(box(0.074, 0.016, 0.054), ARMOR, hips, [s * 0.118, 1.078, 0.09], { rotation: [0, s * 25, 0] });
    put(box(0.062, 0.14, 0.2), ARMOR, hips, [s * 0.168, 0.88, 0], { rotation: [0, 0, s * -8] });
    glow(put(box(0.008, 0.1, 0.1), TEAL, hips, [s * 0.1745, 0.88, 0.0], { rotation: [0, 0, s * -8] }), 1);
    [0.045, 0.08].forEach((x, i) => {
      const bx = s * x;
      const bz = 0.118 * Math.sqrt(1 - (x / 0.155) ** 2) + 0.012;
      glow(put(cyl(0.011, 0.011, 0.06, 6), TEAL, hips, [bx, 1.0, bz + i * 0.0]), 0.9);
      put(cyl(0.013, 0.013, 0.012, 6), DARK, hips, [bx, 1.034, bz]);
      put(cyl(0.013, 0.013, 0.012, 6), DARK, hips, [bx, 0.97, bz]);
    });
  }
  put(box(0.1, 0.07, 0.08), GRAPH_L, hips, [0, 0.9, 0.08]);

  // collar + neck
  b.capsule([0, 1.46, 0], [0, 1.585, 0.02], 0.05, { color: SKIN_P, bone: neckJ });
  put(cyl(0.075, 0.09, 0.055, 10), ARMOR, neckJ, [0, 1.5, 0.0]);
  glow(put(tor(0.078, 0.006), TEAL, neckJ, [0, 1.53, 0.0], { rotation: [90, 0, 0] }), 1);

  // ---------------------------------------------------------------- backpack, cables and fins
  put(box(0.28, 0.3, 0.12), ARMOR, chestJ, [0, 1.26, -0.16]);
  put(box(0.3, 0.03, 0.13), GRAPH_L, chestJ, [0, 1.42, -0.16]);
  put(box(0.3, 0.03, 0.13), GRAPH_L, chestJ, [0, 1.11, -0.16]);
  b.part(new THREE.PlaneGeometry(0.2, 0.14), "#ffffff", {
    at: [0, 1.27, -0.2205],
    dir: [0, 0, -1],
    axis: "z",
    texture: GRILLE,
    bone: chestJ,
  });
  for (const s of [1, -1]) {
    glow(put(cyl(0.032, 0.032, 0.24, 8), TEAL, chestJ, [s * 0.105, 1.27, -0.248]), 0.8);
    put(cyl(0.036, 0.036, 0.022, 8), DARK, chestJ, [s * 0.105, 1.395, -0.248]);
    put(cyl(0.036, 0.036, 0.022, 8), DARK, chestJ, [s * 0.105, 1.145, -0.248]);
    b.sweep(
      catmull([
        [s * 0.03, 1.4, -0.2],
        [s * 0.045, 1.48, -0.12],
        [s * 0.032, 1.52, -0.05],
      ]),
      0.008,
      { color: SILVER_D, bone: chestJ, sides: 6 },
    );
  }
  const FIN: OutlinePoint[] = [
    [0, -0.03],
    [0.18, -0.015],
    [0.34, 0.06],
    [0.46, 0.17],
    [0.3, 0.15],
    [0.2, 0.11],
    [0.12, 0.08],
    [0, 0.05],
  ];
  const FIN_STRIP: OutlinePoint[] = [
    [0.06, 0.0],
    [0.22, 0.02],
    [0.35, 0.08],
    [0.3, 0.115],
    [0.2, 0.08],
    [0.08, 0.05],
  ];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const root = V(s * 0.1, 1.4, -0.2);
    const wing = b.joint(`wing${S}`, { parent: chestJ, at: root, dir: [s * 0.4, 0.4, -0.4], role: "hinge" });
    const dirX = V(s * 0.86, 0, -0.51);
    b.extrude(FIN, { at: root, x: dirX, thickness: 0.012, bevel: 0.003, color: ARMOR, bone: wing });
    glow(b.extrude(FIN_STRIP, { at: root, x: dirX, thickness: 0.017, color: TEAL, bone: wing }), 1);
  }

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb(V(s * 0.1, 0.93, 0), V(s * 0.105, 0.095, 0.02), [0.425, 0.425], [0, 0, 1]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
    });
    const kneeJ = leg.joints[1];
    const ankleJ = leg.tip!;
    const kneeP = pts[1];
    const ball = b.joint(`ball${S}`, {
      parent: ankleJ,
      at: [s * 0.105, 0.045, 0.12],
      aim: [s * 0.105, 0.03, 0.24],
      role: "digit",
    });
    b.sweep(leg, [0.093, 0.09, 0.074, 0.066, 0.076, 0.055, 0.046], {
      color: (t) => (s > 0 && t > 0.52 ? SILVER_D : GRAPH),
      sides: 8,
    });
    // thigh guard + teal ring
    b.sweep(leg, [0.103, 0.098, 0.084], { from: 0.04, to: 0.44, color: ARMOR, sides: 8 });
    glow(b.sweep(leg, 0.099, { from: 0.3, to: 0.325, color: TEAL, caps: "flat", sides: 8 }), 1);
    // knee pad
    put(sph(1), ARMOR, kneeJ, [kneeP.x, kneeP.y, kneeP.z + 0.062], { scale: [0.064, 0.072, 0.05] });
    glow(put(sph(0.012, 6, 4), TEAL, kneeJ, [kneeP.x, kneeP.y, kneeP.z + 0.108]), 1.3);
    if (s < 0) {
      b.sweep(leg, [0.075, 0.083, 0.07, 0.058], { from: 0.55, to: 0.93, color: ARMOR, sides: 8 });
      glow(b.sweep(leg, 0.086, { from: 0.7, to: 0.725, color: TEAL, caps: "flat", sides: 8 }), 1);
    } else {
      // prosthetic shin: plates, glowing ring, hydraulic pistons
      b.sweep(leg, [0.074, 0.08, 0.066], { from: 0.55, to: 0.76, color: METAL, sides: 8 });
      glow(b.sweep(leg, 0.083, { from: 0.76, to: 0.785, color: TEAL, caps: "flat", sides: 8 }), 1);
      b.sweep(leg, [0.066, 0.056], { from: 0.8, to: 0.94, color: METAL, sides: 8 });
      b.rod([kneeP.x - 0.025, kneeP.y - 0.05, kneeP.z - 0.075], [0.1 + 0.02, 0.24, -0.05], 0.011, {
        color: SILVER_D,
        bone: kneeJ,
        sides: 6,
      });
      b.rod([kneeP.x + 0.025, kneeP.y - 0.05, kneeP.z - 0.075], [0.1 + 0.05, 0.24, -0.05], 0.011, {
        color: SILVER_D,
        bone: kneeJ,
        sides: 6,
      });
      b.rod([0.095, 0.3, -0.06], [0.11, 0.17, -0.06], 0.017, { color: SILVER, bone: ankleJ, sides: 6 });
    }
    // boot
    b.loft(
      [
        { at: [s * 0.105, 0.07, -0.07], w: 0.095, h: 0.085 },
        { at: [s * 0.105, 0.065, 0.04], w: 0.105, h: 0.08 },
        { at: [s * 0.105, 0.052, 0.17], w: 0.095, h: 0.06 },
        { at: [s * 0.105, 0.04, 0.235], w: 0.07, h: 0.05 },
      ],
      { color: ARMOR, bone: [ankleJ, ball] },
    );
    put(box(0.108, 0.028, 0.16), GRAPH_L, ankleJ, [s * 0.105, 0.014, 0.0]);
    put(box(0.1, 0.028, 0.15), GRAPH_L, ball, [s * 0.105, 0.014, 0.155]);
    put(sph(1), GRAPH, ball, [s * 0.105, 0.04, 0.215], { scale: [0.04, 0.028, 0.045] });
    glow(put(tor(0.058, 0.007), TEAL, ankleJ, [s * 0.105, 0.115, 0.02], { rotation: [90, 0, 0] }), 1);
    put(box(0.05, 0.012, 0.06), TEAL_D, ankleJ, [s * 0.105, 0.108, 0.09], { rotation: [-10, 0, 0] });
  }

  // ---------------------------------------------------------------- arms
  const xs = -0.372;
  const zs = 0.352;
  const ELBOW: Record<number, number[]> = { 1: [0.314, 1.13, 0.01], [-1]: [-0.33, 1.14, 0.02] };
  const WRIST: Record<number, number[]> = { 1: [0.369, 0.87, 0.043], [-1]: [-0.362, 1.045, 0.271] };
  const arms: Record<number, ReturnType<typeof b.chain>> = {};
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const arm = b.chain(`arm${S}`, [[s * 0.23, 1.42, 0], ELBOW[s], WRIST[s]], {
      parent: chestJ,
      names: [`shoulder${S}`, `elbow${S}`, `hand${S}`],
      role: "arm",
    });
    arms[s] = arm;
    const shoulderJ = arm.joints[0];
    const elbowJ = arm.joints[1];
    b.sweep(arm, [0.057, 0.053, 0.046, 0.044, 0.04, 0.036], {
      color: (t) => (s > 0 ? (t < 0.56 ? GRAPH : "#566272") : t < 0.93 ? GRAPH : DARK),
      sides: 8,
    });
    // upper-arm guard, pauldron
    b.sweep(arm, [0.065, 0.064, 0.056], { from: 0.12, to: 0.42, color: ARMOR, sides: 8 });
    glow(b.sweep(arm, 0.066, { from: 0.41, to: 0.43, color: TEAL, caps: "flat", sides: 8 }), 1);
    put(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, 1.35), ARMOR, shoulderJ, [s * 0.255, 1.465, 0], {
      scale: [0.1, 0.075, 0.105],
    });
    glow(put(tor(0.094, 0.008, 16), TEAL, shoulderJ, [s * 0.255, 1.45, 0], { rotation: [90, 0, 0] }), 1);
    put(sph(1, 8, 6), ARMOR, elbowJ, [ELBOW[s][0], ELBOW[s][1], ELBOW[s][2] - 0.045], { scale: [0.05, 0.055, 0.045] });
    if (s > 0) {
      // prosthetic forearm
      b.sweep(arm, [0.05, 0.049], { from: 0.58, to: 0.72, color: METAL, sides: 8 });
      glow(b.sweep(arm, 0.052, { from: 0.72, to: 0.76, color: TEAL, caps: "flat", sides: 8 }), 1.1);
      b.sweep(arm, [0.046, 0.043], { from: 0.76, to: 0.9, color: METAL, sides: 8 });
      b.sweep(arm, [0.04, 0.037], { from: 0.9, to: 0.99, color: "#2a323d", sides: 8 });
      for (const dx of [-0.026, 0.026]) {
        const q0 = arm.at(0.6).at;
        const q1 = arm.at(0.95).at;
        glow(
          b.rod([q0.x + dx + 0.012, q0.y, q0.z + 0.046], [q1.x + dx * 0.8 + 0.012, q1.y, q1.z + 0.04], 0.006, {
            color: TEAL,
            bone: arm.joints[1],
            sides: 5,
          }),
          1,
        );
      }
      glow(put(sph(0.024, 7, 5), TEAL, elbowJ, [ELBOW[s][0], ELBOW[s][1] - 0.01, ELBOW[s][2] + 0.04]), 1.2);
    } else {
      b.sweep(arm, [0.05, 0.048, 0.043], { from: 0.6, to: 0.93, color: ARMOR, sides: 8 });
      glow(b.sweep(arm, 0.053, { from: 0.59, to: 0.615, color: TEAL, caps: "flat", sides: 8 }), 1);
    }
  }

  // left hand: silver prosthetic, relaxed
  {
    const armL = arms[1];
    const handL = armL.tip!;
    const wr = V(...(WRIST[1] as [number, number, number]));
    const hd = V(0.12, -0.97, 0.22).normalize();
    const palmC = wr.clone().addScaledVector(hd, 0.055);
    put(box(0.032, 0.1, 0.085), METAL, handL, palmC.toArray(), { dir: hd.toArray() });
    put(box(0.036, 0.03, 0.09), SILVER_D, handL, wr.clone().addScaledVector(hd, 0.012).toArray(), {
      dir: hd.toArray(),
    });
    glow(put(sph(0.011, 6, 4), TEAL, handL, palmC.clone().add(V(-0.019, -0.005, 0)).toArray()), 1);
    const axis = V(0, 0, -1);
    const zoff = [0.03, 0.01, -0.01, -0.028];
    const fl = [1, 1.08, 1, 0.82];
    const names = ["indexL", "middleL", "ringL", "pinkyL"];
    names.forEach((nm, i) => {
      const base = palmC.clone().addScaledVector(hd, 0.05).add(V(0, 0, zoff[i]));
      const pts = curled(base, hd, axis, [0.036 * fl[i], 0.026 * fl[i], 0.022 * fl[i]], [0.25, 0.45, 0.4]);
      makeFinger(nm, handL, pts, 0.0105, SILVER);
    });
    const tBase = palmC.clone().add(V(-0.012, 0.02, 0.04));
    makeFinger(
      "thumbL",
      handL,
      curled(tBase, V(0.1, -0.75, 0.65), axis, [0.034, 0.028], [0.1, 0.3]),
      0.0115,
      SILVER,
    );
  }

  // right hand: gloved fist around the staff
  const handR = arms[-1].tip!;
  {
    put(box(0.05, 0.095, 0.07), GRAPH_L, handR, [-0.368, 1.04, 0.292]);
    put(box(0.056, 0.1, 0.03), DARK, handR, [-0.366, 1.04, 0.262]);
    const rr = 0.036;
    const arcPoint = (y: number, phiDeg: number) => {
      const phi = (phiDeg * Math.PI) / 180;
      return V(xs - rr * Math.sin(phi), y, zs - rr * Math.cos(phi));
    };
    ["indexR", "middleR", "ringR", "pinkyR"].forEach((nm, i) => {
      const y = 1.075 - i * 0.023;
      const pts = [0, 70, 140, 205].map((a) => arcPoint(y, a));
      makeFinger(nm, handR, pts, 0.0105 - i * 0.0005, i % 2 ? GRAPH : GRAPH_L);
      put(sph(0.0115, 6, 4), DARK, handR, [xs, y, zs - rr]);
    });
    makeFinger(
      "thumbR",
      handR,
      [-70, 20, 110].map((a) => arcPoint(1.1, a)),
      0.0115,
      GRAPH_L,
    );
  }

  // ---------------------------------------------------------------- staff
  const staff = b.joint("staff", { parent: handR, at: [xs, 0, zs], aim: [xs, 1, zs] });
  b.rod([xs, 0.03, zs], [xs, 1.62, zs], 0.019, { color: GRAPH_L, bone: staff, sides: 8 });
  b.rod([xs, 0.93, zs], [xs, 1.17, zs], 0.023, { color: DARK, bone: staff, sides: 8 });
  b.spike([xs, 0.1, zs], [xs, 0, zs], null, 0.024, { color: DARK, bone: staff, sides: 8 });
  put(cyl(0.028, 0.026, 0.26, 8), ARMOR, staff, [xs, 0.34, zs]);
  put(cyl(0.027, 0.027, 0.3, 8), ARMOR, staff, [xs, 1.4, zs]);
  [0.2, 0.47, 0.9, 1.2, 1.56].forEach((y) =>
    glow(put(tor(0.027, 0.0055, 10), TEAL, staff, [xs, y, zs], { rotation: [90, 0, 0] }), 1),
  );
  put(cyl(0.022, 0.032, 0.1, 8), ARMOR, staff, [xs, 1.68, zs]);
  put(tor(0.08, 0.011, 18), ARMOR, staff, [xs, 1.8, zs]);
  glow(put(tor(0.058, 0.005, 16), TEAL, staff, [xs, 1.8, zs]), 1);
  glow(put(sph(0.036, 8, 6), TEAL, staff, [xs, 1.8, zs]), 1.6);
  glow(b.sweep(spiral([xs, 0.5, zs], [xs + 0.034, 0.5, zs], [0, 1, 0], { turns: 3, r1: 0.034, pitch: 0.11 }), 0.0055, {
    color: TEAL,
    bone: staff,
    sides: 5,
  }), 1);
  const WING: OutlinePoint[] = [
    [0, -0.02],
    [0.07, 0],
    [0.16, 0.07],
    [0.22, 0.17],
    [0.12, 0.12],
    [0.05, 0.07],
    [0, 0.04],
  ];
  for (const s of [1, -1]) {
    [
      [1, 0, 0.0],
      [0.72, -0.045, -0.014],
    ].forEach(([k, dy, dz], layer) => {
      const root = V(xs + s * 0.07, 1.8 + dy, zs + dz);
      b.extrude(scaleOutline(WING, k, 0), {
        at: root,
        x: V(s, 0, 0),
        thickness: 0.01,
        bevel: 0.002,
        color: layer ? SILVER : ARMOR,
        bone: staff,
      });
    });
    glow(
      b.extrude(scaleOutline(WING, 0.5, 0.0), {
        at: V(xs + s * 0.075, 1.81, zs),
        x: V(s, 0, 0),
        thickness: 0.014,
        color: TEAL,
        bone: staff,
      }),
      1,
    );
  }

  // ---------------------------------------------------------------- head
  const HEADC = [0, 1.68, 0.03];
  const skull = put(sph(1, 12, 9), SKIN_P, head, [0, 1.69, 0.03], { scale: [0.088, 0.098, 0.092] });
  const jawPart = put(sph(1, 10, 7), SKIN_P, jaw, [0, 1.615, 0.05], { scale: [0.074, 0.052, 0.086] });
  const plate = put(new THREE.SphereGeometry(1, 10, 8, 1.75, 1.45, 0.75, 1.4), METAL, head, [0, 1.69, 0.03], {
    scale: [0.0915, 0.102, 0.0955],
  });
  const skullSkin = b.surface(skull);
  const plateSkin = b.surface(plate);
  const jawSkin = b.surface(jawPart);
  const eR = skullSkin.around(HEADC).at(-24, 3);
  const eL = plateSkin.around(HEADC).at(24, 3);
  if (eR) b.decal(skullSkin, EYE_R, { at: eR, size: [0.046, 0.03], lift: 0.0015 });
  if (eL) glow(b.decal(plateSkin, EYE_L, { at: eL, size: [0.046, 0.03], lift: 0.0015 }), 1.2);
  const mouth = jawSkin.around([0, 1.615, 0.05]).at(0, 22);
  if (mouth) b.decal(jawSkin, MOUTH, { at: mouth, size: [0.04, 0.014], lift: 0.0015 });
  const nose = skullSkin.around(HEADC).at(0, -6);
  const bridge = skullSkin.around(HEADC).at(0, 8);
  if (nose && bridge) {
    b.stick(sph(0.014, 6, 5), SKIN, nose, { scale: [1, 0.9, 1.2] });
    b.rod(bridge, nose, 0.008, { color: SKIN, bone: head, sides: 5 });
  }
  const browR = [skullSkin.around(HEADC).at(-12, 16), skullSkin.around(HEADC).at(-35, 19)];
  if (browR[0] && browR[1]) b.rod(browR[0], browR[1], 0.0065, { color: HAIR, bone: head, sides: 5 });
  const browL = [plateSkin.around(HEADC).at(12, 16), plateSkin.around(HEADC).at(35, 19)];
  if (browL[0] && browL[1]) b.rod(browL[0], browL[1], 0.0065, { color: SILVER_D, bone: head, sides: 5 });
  // glowing circuit trace on the cyber plate
  const trace = [plateSkin.around(HEADC).at(40, 10), plateSkin.around(HEADC).at(62, 17), plateSkin.around(HEADC).at(82, 11)];
  if (trace.every((h) => h !== null))
    glow(b.sweep(catmull(trace.map((h) => h!)), 0.0035, { color: TEAL, bone: head, sides: 5 }), 1);
  // ear + headset
  put(sph(1, 7, 5), SKIN, head, [-0.094, 1.67, 0.01], { scale: [0.012, 0.026, 0.02] });
  put(cyl(0.032, 0.032, 0.025, 10), SILVER, head, [0.098, 1.68, 0.0], { dir: [1, 0, 0] });
  glow(put(cyl(0.02, 0.02, 0.01, 10), TEAL, head, [0.113, 1.68, 0.0], { dir: [1, 0, 0] }), 1.2);
  put(new THREE.TorusGeometry(0.098, 0.006, 5, 14, Math.PI), SILVER, head, [0, 1.68, 0.0], { scale: [1, 1.2, 1] });
  b.sweep(
    catmull([
      [0.105, 1.675, 0.01],
      [0.1, 1.64, 0.07],
      [0.07, 1.627, 0.125],
    ]),
    0.004,
    { color: SILVER_D, bone: head, sides: 5 },
  );
  glow(put(sph(0.009, 6, 4), TEAL, head, [0.07, 1.627, 0.125]), 1.2);
  // hair: cap, back mass, fringe tufts, side lock, ponytail
  put(new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, 1.1), HAIR_P, head, [0, 1.698, 0.01], {
    scale: [0.097, 0.102, 0.1],
    rotation: [-14, 0, 0],
  });
  put(sph(1, 10, 8), HAIR_P, head, [0, 1.68, -0.02], { scale: [0.094, 0.098, 0.088] });
  [-0.05, -0.025, 0, 0.025, 0.05].forEach((x, i) => {
    b.sweep(
      bezier(V(x, 1.78, 0.06), V(x * 1.2 + 0.01, 1.795, 0.125), V(x * 1.4 + 0.035, 1.73, 0.118)),
      [0.021, 0.004],
      { color: i === 3 ? STREAK : HAIR_P, bone: head, sides: 6 },
    );
  });
  b.sweep(bezier(V(-0.085, 1.72, 0.0), V(-0.102, 1.68, -0.04), V(-0.087, 1.636, -0.075)), [0.02, 0.003], {
    color: HAIR,
    bone: head,
    sides: 6,
  });
  const pony = b.chain(
    "pony",
    [
      [0, 1.745, -0.085],
      [0, 1.72, -0.18],
      [0, 1.64, -0.235],
      [0, 1.54, -0.21],
    ],
    { parent: head, names: ["pony1", "pony2", "pony3"], role: "tail" },
  );
  b.sweep(pony, [0.03, 0.037, 0.03, 0.012], {
    bands: [
      [0.6, HAIR],
      [1, STREAK],
    ],
    sides: 7,
  });
  glow(put(tor(0.03, 0.007, 8), TEAL, head, [0, 1.74, -0.09], { dir: [0, -0.25, -1], axis: "z" }), 1);

  return b.root;
}
