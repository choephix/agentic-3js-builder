import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  limb,
  polyline,
  catmull,
  mottle,
  stripes,
  patches,
  grain,
  gradient,
  spots,
  noise,
  paint,
  mix,
  resolve,
  smoothstep,
  svg,
  DEG,
} from "../../../../src/index";
import type { ColorInput, Joint, Paint } from "../../../../src/index";
import { coil, gaugeTexture, gearGeometry, gearTrain, metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gnome Tinkerer",
  description:
    "A whimsical low-poly gnome tinkerer with a floppy red hat topped by a glowing bulb, pushed-up goggles, a big braided-lock beard and a leather backpack bristling with gadgets: spinning gear train, pressure gauge, telescope, lantern, steam pipe, spring antenna and a bedroll. Stands on a mossy tree-stump base with a toolbox, blueprint, wind-up beetle and a sign.",
};

type Vec3 = [number, number, number];
type At = Vec3 | THREE.Vector3;
type PO = {
  dir?: At;
  up?: At;
  axis?: "x" | "y" | "z";
  rotation?: Vec3;
  scale?: Vec3;
  texture?: THREE.Texture;
  flat?: boolean;
};
type Outline = Array<[number, number] | [number, number, "sharp"]>;

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "gnome_tinkerer", paintSize: 2048 });
  const G = 0.07; // height of the stump base the gnome stands on
  const P = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ------------------------------------------------------------------ helpers
  const keyed = (keys: number[]) => (t: number) => {
    const x = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
    const i = Math.min(Math.floor(x), keys.length - 2);
    return keys[i] + (keys[i + 1] - keys[i]) * (x - i);
  };
  const WARM = "#fff1c4";
  const COOL = "#4b4a8f";
  const lit = (base: ColorInput, k = 1): Paint =>
    paint((p, n) => {
      const c = resolve(base, p, n);
      return n.y > 0 ? mix(c, WARM, n.y * 0.14 * k) : mix(c, COOL, -n.y * 0.26 * k);
    });

  const ball = (r: number, color: ColorInput, at: At, bone: Joint, scale?: Vec3, o: PO = {}) =>
    b.part(new THREE.SphereGeometry(r, 9, 7), color, { at, bone, scale, flat: true, ...o });
  const cyl = (rt: number, rb: number, h: number, color: ColorInput, at: At, bone: Joint, dir: At = [0, 1, 0], seg = 10) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, bone, dir, flat: true });
  const box = (w: number, h: number, d: number, color: ColorInput, at: At, bone: Joint, o: PO = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, bone, ...o });

  // ------------------------------------------------------------------ palette (paints light the form by place)
  const SKIN = lit(mottle("#f3b890", "#e9a47c", { size: 0.05, seed: 2 }));
  const NOSE = lit(mottle("#f48f80", "#e2665f", { size: 0.025, seed: 5 }));
  const HAT = lit(mottle("#d4492c", "#b73a22", { size: 0.06, seed: 3 }));
  const HAT_TRIM = lit(mottle("#f4e6bf", "#e4d2a2", { size: 0.03, seed: 8 }));
  const SHIRT = lit(stripes("#f2bf47", "#dc8a2c", { size: 0.058, axis: "y", width: 0.45, wobble: 0.08 }));
  const PANTS = lit(patches("#1b6469", ["#2f8a8c", "#2a7f86", "#399ba0", "#2d8486"], { size: 0.08, gap: 0.05, seed: 4 }));
  const LEATHER = lit(panelled(mottle("#8c5a33", "#7a4a29", { size: 0.05 }), { size: 0.17, aspect: 0.8, rivets: 0.04 }));
  const LEATHER2 = lit(mottle("#74462a", "#633a21", { size: 0.04, seed: 6 }));
  const BOOT = lit(mottle("#5a3320", "#46281a", { size: 0.05, seed: 7 }));
  const SOLE = "#2a1a12";
  const CUFF = lit(mottle("#f1e3bd", "#e3d1a0", { size: 0.03 }));
  const ROLL = lit(stripes("#2b8f8f", "#eadfc2", { size: 0.06, axis: "x", width: 0.4, wobble: 0.05 }));
  const BEARD_A = grain("#f8f4e8", "#dfd5be", { size: 0.011, axis: "y", seed: 1 });
  const BEARD_B = grain("#efe6d0", "#cfc2a4", { size: 0.011, axis: "y", seed: 2 });
  const BEARD = lit(gradient(BEARD_A, BEARD_B, [0, G + 0.7, 0], [0, G + 0.46, 0]), 0.8);
  const BROW = lit(grain("#fbf8f0", "#e6dfcc", { size: 0.01, axis: "x", seed: 3 }), 0.8);
  const GINGER = lit(mottle("#e08a3c", "#c9702a", { size: 0.03 }));
  const BRASS = metal("brass");
  const GILT = metal("gilt");
  const COPPER = metal("copper", { verdigris: 0.3 });
  const STEEL = metal("steel");
  const BLUED = metal("blued");
  const IRON = metal("iron");
  const INK = "#2a1810";
  const GLASS_BLUE = "#86e6ff";

  // ------------------------------------------------------------------ textures
  const EYE = svg(
    `<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="37" rx="25" ry="30" fill="#fffdf6" stroke="#3a2418" stroke-width="3.5"/>
      <circle cx="32" cy="42" r="17" fill="#5e3f1a"/>
      <circle cx="32" cy="42" r="13.5" fill="#86b845"/>
      <circle cx="32" cy="46" r="9" fill="#a8d460"/>
      <circle cx="32" cy="42" r="7" fill="#1c120a"/>
      <path d="M8 36 Q28 -2 53 30 Q30 14 8 36Z" fill="#3a2418"/>
      <circle cx="25" cy="36" r="5.5" fill="#fff"/><circle cx="39" cy="50" r="2.6" fill="#fff"/>
    </svg>`,
    { size: 128 },
  );

  const APRON = svg(
    `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 2 L70 2 L72 40 L94 46 L98 112 Q50 120 2 112 L6 46 L28 40 Z" fill="#9a6a3c" stroke="#4a2c14" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M33 7 L67 7 L68.5 37 L90 42.5 L93.5 107 Q50 114 6.5 107 L10 42.5 L31.5 37 Z" fill="none" stroke="#ecd09a" stroke-width="1.3" stroke-dasharray="3 2.2"/>
      <rect x="13" y="64" width="74" height="42" rx="4" fill="#85562f" stroke="#4a2c14" stroke-width="2"/>
      <path d="M50 64 L50 106" stroke="#4a2c14" stroke-width="2"/>
      <path d="M16 68 H84" stroke="#ecd09a" stroke-width="1.2" stroke-dasharray="3 2.2"/>
      <rect x="21" y="48" width="6" height="22" rx="2.5" fill="#d83a2c" stroke="#3a1008" stroke-width="1.5"/>
      <rect x="22.5" y="40" width="3" height="10" fill="#c8ccd4" stroke="#3a3f4a" stroke-width="1"/>
      <path d="M34 66 L36 50 L42 50 L44 66Z" fill="#8f96a8" stroke="#2c3040" stroke-width="1.5"/>
      <rect x="62" y="50" width="5" height="18" fill="#f2cf4a" stroke="#6a4a10" stroke-width="1.3"/>
      <path d="M62 50 L64.5 44 L67 50Z" fill="#f0c8a0" stroke="#6a4a10" stroke-width="1"/>
      <rect x="72" y="54" width="9" height="14" fill="#d9c9a0" stroke="#5a4a2a" stroke-width="1.2"/>
      <circle cx="30" cy="44" r="4.5" fill="#e2b54a" stroke="#6a4410" stroke-width="1.3"/>
      <circle cx="70" cy="44" r="4.5" fill="#e2b54a" stroke="#6a4410" stroke-width="1.3"/>
      <circle cx="50" cy="22" r="9" fill="none" stroke="#e8c070" stroke-width="2" stroke-dasharray="3 2"/>
      <circle cx="50" cy="22" r="3" fill="#e8c070"/>
    </svg>`,
    { size: 256 },
  );

  const cogPath = (cx: number, cy: number, r0: number, r1: number, n: number) => {
    const step = (Math.PI * 2) / n;
    const pts: string[] = [];
    for (let i = 0; i < n; i++) {
      const a = i * step;
      for (const [da, r] of [[-0.28, r0], [-0.16, r1], [0.16, r1], [0.28, r0]] as [number, number][]) {
        pts.push(`${(cx + Math.sin(a + da * step) * r).toFixed(2)} ${(cy - Math.cos(a + da * step) * r).toFixed(2)}`);
      }
    }
    return `M${pts.join("L")}Z`;
  };

  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="47" fill="#c8892f" stroke="#5a3410" stroke-width="4"/>
      <circle cx="50" cy="50" r="39" fill="#f4cd62" stroke="#8a5a1a" stroke-width="2"/>
      <path d="${cogPath(50, 50, 24, 32, 10)}" fill="#7a4a14" stroke="#4a2a08" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="50" cy="50" r="13" fill="#f4cd62" stroke="#4a2a08" stroke-width="2"/>
      <path d="M50 40 L53 47 L61 48 L55 53 L57 61 L50 57 L43 61 L45 53 L39 48 L47 47Z" fill="#d4492c"/>
    </svg>`,
    { size: 128 },
  );

  const PATCH = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="52" height="52" rx="5" fill="#e0b25c" stroke="#5a3a14" stroke-width="2.5"/>
      <path d="M6 22 H58 M6 40 H58 M22 6 V58 M40 6 V58" stroke="#c4823a" stroke-width="3"/>
      <rect x="10" y="10" width="44" height="44" rx="3" fill="none" stroke="#4a2c10" stroke-width="1.6" stroke-dasharray="4 3"/>
      <path d="M24 24 L40 40 M40 24 L24 40" stroke="#4a2c10" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );

  const FLAME = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="g" cx="0.5" cy="0.6" r="0.7"><stop offset="0" stop-color="#fff6c8"/><stop offset="1" stop-color="#ffb23c"/></radialGradient></defs>
      <rect width="64" height="64" fill="url(#g)"/>
      <path d="M32 8 Q46 28 40 42 Q38 54 32 54 Q24 54 23 42 Q20 28 32 8Z" fill="#ff8a1c"/>
      <path d="M32 24 Q40 36 36 46 Q34 52 32 52 Q28 50 28 44 Q27 34 32 24Z" fill="#ffe27a"/>
      <ellipse cx="32" cy="46" rx="4" ry="6" fill="#ffffff"/>
    </svg>`,
    { size: 96 },
  );

  const SIGN = svg(
    `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="124" height="60" rx="6" fill="#c8945a" stroke="#4a2c14" stroke-width="4"/>
      <path d="M6 18 H122 M6 46 H122" stroke="#a9763f" stroke-width="2"/>
      <text x="64" y="30" text-anchor="middle" font-family="serif" font-weight="bold" font-size="17" fill="#3a2010">GIZMO &amp; CO.</text>
      <text x="64" y="47" text-anchor="middle" font-family="serif" font-style="italic" font-size="11" fill="#5a3418">repairs · inventions</text>
      <circle cx="12" cy="12" r="3" fill="#6a6d7c"/><circle cx="116" cy="12" r="3" fill="#6a6d7c"/>
      <circle cx="12" cy="52" r="3" fill="#6a6d7c"/><circle cx="116" cy="52" r="3" fill="#6a6d7c"/>
    </svg>`,
    { size: 256 },
  );

  const BLUEPRINT = svg(
    `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="90" fill="#2a5aa8"/>
      <path d="M0 15H120M0 30H120M0 45H120M0 60H120M0 75H120M15 0V90M30 0V90M45 0V90M60 0V90M75 0V90M90 0V90M105 0V90" stroke="#4a7ac8" stroke-width="0.6"/>
      <rect x="2" y="2" width="116" height="86" fill="none" stroke="#e8f0ff" stroke-width="1.6"/>
      <path d="${cogPath(40, 42, 17, 23, 12)}" fill="none" stroke="#e8f0ff" stroke-width="1.8"/>
      <circle cx="40" cy="42" r="7" fill="none" stroke="#e8f0ff" stroke-width="1.8"/>
      <path d="${cogPath(82, 34, 9, 13, 8)}" fill="none" stroke="#e8f0ff" stroke-width="1.6"/>
      <path d="M12 76 H68 M12 73 V79 M68 73 V79" stroke="#e8f0ff" stroke-width="1.2"/>
      <text x="40" y="74" text-anchor="middle" font-family="monospace" font-size="6" fill="#e8f0ff">48 cm</text>
      <text x="100" y="82" text-anchor="middle" font-family="monospace" font-size="6" fill="#e8f0ff">PLAN #7</text>
      <path d="M70 55 L110 55 L110 66 L70 66Z" fill="none" stroke="#e8f0ff" stroke-width="1.2"/>
    </svg>`,
    { size: 256 },
  );

  const GRASS = svg(
    `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 64 Q6 30 2 8 Q12 28 14 64Z" fill="#4f9a30"/>
      <path d="M12 64 Q16 26 20 2 Q26 30 24 64Z" fill="#6dbb3c"/>
      <path d="M22 64 Q28 34 38 14 Q34 40 32 64Z" fill="#58a634"/>
      <path d="M16 64 Q18 40 20 22 Q22 42 22 64Z" fill="#8fd656"/>
    </svg>`,
    { size: 96 },
  );
  const GAUGE = gaugeTexture({ needle: 40, label: "STEAM", size: 160 });

  // ------------------------------------------------------------------ skeleton
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, G + 0.4, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, G + 0.4, 0],
      [0, G + 0.52, 0.01],
      [0, G + 0.65, 0.0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, G + 0.67, 0.01], aim: [0, G + 0.74, 0.03], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, G + 0.73, 0.03], aim: [0, G + 0.9, 0.03], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, G + 0.76, 0.0], aim: [0, G + 0.76, 0.12], role: "jaw" });

  // ------------------------------------------------------------------ torso
  const rxT = keyed([0.11, 0.135, 0.125, 0.115, 0.08]);
  const ryT = keyed([0.09, 0.115, 0.1, 0.085, 0.06]);
  const torso = b.sweep(
    catmull([
      [0, G + 0.33, 0],
      [0, G + 0.45, 0.005],
      [0, G + 0.56, 0.0],
      [0, G + 0.67, -0.005],
    ]),
    (t: number) => [rxT(t), ryT(t)],
    { bone: spine, color: SHIRT, caps: { start: "flat", end: "round" }, sides: 12 },
  );
  cyl(0.05, 0.058, 0.09, SKIN, [0, G + 0.72, 0.02], neck, [0, 1, 0], 8);
  const skin = b.surface(torso);

  // belt + buckle
  b.sweep(skin.loop([0, G + 0.43, 0], { lift: 0.008 }), 0.016, { color: LEATHER2, sides: 6 });
  const buckleHit = skin.ray([0, G + 0.43, 1], [0, 0, -1]);
  if (buckleHit) {
    b.stick(new THREE.BoxGeometry(0.054, 0.014, 0.048), GILT, buckleHit, { embed: 0.2 });
    glow(b.stick(new THREE.BoxGeometry(0.03, 0.02, 0.026), "#ff9a3c", buckleHit, { embed: 0.1 }), 1.2);
  }
  const frontZ = buckleHit ? buckleHit.at.z : 0.1;

  // apron drawn onto the belly
  b.decal(torso, APRON, { at: [0, G + 0.5, frontZ], dir: [0, 0, 1], size: [0.25, 0.3], segments: 14, lift: 0.003 });

  // shoulder straps for the pack
  for (const s of [1, -1]) {
    const strapPath = catmull([
      [s * 0.09, G + 0.5, 0.1],
      [s * 0.1, G + 0.62, 0.07],
      [s * 0.11, G + 0.7, 0.0],
      [s * 0.1, G + 0.64, -0.08],
      [s * 0.09, G + 0.52, -0.11],
    ]);
    b.sweep(skin.drape(strapPath, { lift: 0.008 }), () => [0.024, 0.007], {
      color: LEATHER2,
      section: "box",
      bone: chest,
    });
    ball(0.014, GILT, [s * 0.092, G + 0.515, 0.108], chest);
  }

  // tools on the belt
  const WRENCH: Outline = [
    [-0.011, 0], [0.011, 0], [0.011, 0.14], [0.03, 0.165], [0.03, 0.215], [0.011, 0.235],
    [0.011, 0.185], [-0.011, 0.185], [-0.011, 0.235], [-0.03, 0.215], [-0.03, 0.165], [-0.011, 0.14],
  ];
  b.extrude(WRENCH, {
    at: [-0.125, G + 0.44, 0.095],
    x: [1, 0, 0],
    y: [0, -1, 0.12],
    thickness: 0.012,
    bevel: 0.003,
    color: STEEL,
    bone: spine.joints[0],
  });
  cyl(0.009, 0.009, 0.05, LEATHER2, [-0.125, G + 0.435, 0.095], spine.joints[0], [0, 1, 0], 6);
  // hammer on the other hip
  b.rod([0.125, G + 0.44, 0.098], [0.125, G + 0.24, 0.115], 0.01, LEATHER2, { bone: spine.joints[0], sides: 6 });
  box(0.075, 0.034, 0.034, IRON, [0.125, G + 0.225, 0.118], spine.joints[0], { rotation: [0, 0, 0] });
  box(0.014, 0.038, 0.038, BRASS, [0.164, G + 0.225, 0.118], spine.joints[0]);

  // ------------------------------------------------------------------ legs and boots
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const x = s * 0.088;
    const pts = limb([s * 0.075, G + 0.39, 0], [x, G + 0.08, -0.005], [0.17, 0.17], [[0, 0, 1]]);
    const leg = b.chain(`leg${L}`, polyline(pts), {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
      contact: [x, G, 0.03],
    });
    const ankle = leg.joints[2];
    const hipJ = leg.joints[0];
    const legSweep = b.sweep(leg, (t: number) => 0.066 - 0.015 * t, { color: PANTS, sides: 10 });
    ball(0.078, PANTS, [s * 0.07, G + 0.385, 0], hipJ);
    if (s > 0) {
      b.decal(legSweep, PATCH, {
        at: pts[1].clone().add(P(0, 0, 0.055)),
        dir: [0.25, 0, 1],
        size: [0.065, 0.065],
        roll: 8,
      });
    }
    const toe = b.joint(`toe${L}`, {
      parent: ankle,
      at: [x, G + 0.04, 0.06],
      aim: [x, G + 0.035, 0.14],
      role: "digit",
    });
    b.capsule([x, G + 0.12, -0.005], [x, G + 0.06, 0.0], 0.063, BOOT, { bone: ankle, sides: 10 });
    ball(1, BOOT, [x, G + 0.047, 0.055], toe, [0.064, 0.05, 0.088]);
    ball(1, SOLE, [x, G + 0.016, 0.04], ankle, [0.07, 0.018, 0.128]);
    cyl(0.07, 0.066, 0.034, CUFF, [x, G + 0.13, -0.005], ankle, [0, 1, 0], 10);
    // brass boot buckle
    box(0.04, 0.03, 0.01, GILT, [x, G + 0.075, 0.056], toe);
  }

  // ------------------------------------------------------------------ arms and hands
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const shoulderP: Vec3 = [s * 0.165, G + 0.63, 0.0];
    const elbowP: Vec3 = [s * 0.255, G + 0.525, -0.02];
    const wristP: Vec3 = [s * 0.33, G + 0.425, 0.025];
    const arm = b.chain(`arm${L}`, polyline([shoulderP, elbowP, wristP]), {
      parent: chest,
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
      role: "arm",
    });
    b.sweep(arm, [0.054, 0.043], { color: SHIRT, sides: 10 });
    ball(0.062, SHIRT, shoulderP, arm.joints[0]);
    ball(0.047, SHIRT, elbowP, arm.joints[1]);
    const wrist = arm.joints[2];
    const d = P(...wristP).sub(P(...elbowP)).normalize();
    // cuff and brass bracer
    cyl(0.052, 0.05, 0.04, CUFF, P(...wristP).addScaledVector(d, -0.015), wrist, [d.x, d.y, d.z], 10);
    cyl(0.055, 0.055, 0.012, GILT, P(...wristP).addScaledVector(d, 0.008), wrist, [d.x, d.y, d.z], 10);
    // palm
    const palm = P(...wristP).addScaledVector(d, 0.04);
    b.capsule(P(...wristP).addScaledVector(d, 0.01), P(...wristP).addScaledVector(d, 0.065), 0.049, SKIN, {
      bone: wrist,
      sides: 8,
    });
    const fingerDefs: [string, number, number][] = [
      ["index", 0.03, 0.052],
      ["middle", 0.01, 0.058],
      ["ring", -0.01, 0.052],
      ["pinky", -0.03, 0.042],
    ];
    for (const [nm, off, len] of fingerDefs) {
      const base = palm.clone().addScaledVector(d, 0.03).add(P(0, 0, off));
      const fd = d.clone().add(P(0, 0, off * 6)).normalize();
      const curl = P(-s * 0.012, 0, 0);
      const p0 = base;
      const p1 = base.clone().addScaledVector(fd, len * 0.5).addScaledVector(curl, 0.4);
      const p2 = base.clone().addScaledVector(fd, len).addScaledVector(curl, 1.5);
      const fc = b.chain(`${nm}${L}`, polyline([p0, p1, p2]), {
        parent: wrist,
        names: [`${nm}${L}1`, `${nm}${L}2`],
        role: "digit",
      });
      b.sweep(fc, [0.019, 0.014], { color: SKIN, sides: 6 });
    }
    const tbase = palm.clone().add(P(-s * 0.018, 0, 0.028));
    const td = d.clone().multiplyScalar(0.5).add(P(0, 0, 0.8)).normalize();
    const tc = b.chain(
      `thumb${L}`,
      polyline([tbase, tbase.clone().addScaledVector(td, 0.026), tbase.clone().addScaledVector(td, 0.052).add(P(-s * 0.006, 0, 0))]),
      { parent: wrist, names: [`thumb${L}1`, `thumb${L}2`], role: "digit" },
    );
    b.sweep(tc, [0.026, 0.019], { color: SKIN, sides: 6 });
  }

  // ------------------------------------------------------------------ head
  const C: Vec3 = [0, G + 0.82, 0.02];
  const skull = ball(1, SKIN, C, head, [0.118, 0.112, 0.115], {});
  // lower jaw (separate part so it can open)
  ball(1, SKIN, [0, G + 0.752, 0.05], jaw, [0.082, 0.045, 0.082]);
  ball(1, "#7a2a2a", [0, G + 0.742, 0.095], jaw, [0.032, 0.012, 0.02]);
  // eyes
  const headSkin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = headSkin.around(C).at(s * 29, 0);
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.088, 0.1], lift: 0.002, mirror: s > 0 });
    const cheek = headSkin.around(C).at(s * 46, -24);
    if (cheek) b.stick(new THREE.SphereGeometry(0.026, 8, 6), "#f4877f", cheek, { embed: 0.7, scale: [1, 0.3, 0.85], flat: true });
    // bushy brows
    b.sweep(
      catmull([
        [s * 0.012, G + 0.868, 0.128],
        [s * 0.05, G + 0.883, 0.123],
        [s * 0.093, G + 0.862, 0.095],
        [s * 0.108, G + 0.835, 0.07],
      ]),
      [0.022, 0.014, 0.01],
      { bone: head, color: BROW, sides: 6 },
    );
    // ears
    const a = 18 * DEG;
    const ex: Vec3 = [s * Math.cos(a), Math.sin(a), 0];
    const ey: Vec3 = [-s * Math.sin(a), Math.cos(a), 0];
    b.extrude(
      [[0, -0.03], [0.05, 0], [0.12, 0.065, "sharp"], [0.045, 0.045], [0, 0.04]],
      { at: [s * 0.105, G + 0.795, 0.0], x: ex, y: ey, thickness: 0.012, bevel: 0.003, color: SKIN, bone: head },
    );
    b.extrude(
      [[0.01, -0.015], [0.05, 0.0], [0.095, 0.048], [0.04, 0.03], [0.01, 0.025]],
      { at: [s * 0.105, G + 0.795, 0.0], x: ex, y: ey, thickness: 0.016, bevel: 0.002, color: "#f08f86", bone: head },
    );
    // hair tufts under the hat
    const ta = 15 * DEG;
    b.extrude(
      [[-0.028, 0], [0.028, 0], [0.024, -0.05], [0.005, -0.1, "sharp"], [-0.025, -0.05]],
      {
        at: [s * 0.108, G + 0.87, 0.015],
        x: [Math.cos(ta), -s * Math.sin(ta), 0],
        y: [s * Math.sin(ta), Math.cos(ta), 0],
        thickness: [0.004, 0.02],
        color: GINGER,
        bone: head,
      },
    );
  }
  // nose
  ball(1, NOSE, [0, G + 0.795, 0.153], head, [0.034, 0.032, 0.036]);
  ball(0.008, "#ffd7cc", [0.008, G + 0.812, 0.186], head);
  // moustache
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.008, G + 0.752, 0.152],
        [s * 0.05, G + 0.745, 0.155],
        [s * 0.095, G + 0.74, 0.135],
        [s * 0.125, G + 0.775, 0.11],
      ]),
      [0.03, 0.033, 0.022, 0.01],
      { bone: head, color: BEARD, sides: 7 },
    );
  }

  // beard
  const rxB = keyed([0.1, 0.115, 0.1, 0.07, 0.025]);
  const ryB = keyed([0.09, 0.085, 0.075, 0.05, 0.02]);
  const beard = b.sweep(
    catmull([
      [0, G + 0.77, 0.02],
      [0, G + 0.7, 0.06],
      [0, G + 0.6, 0.095],
      [0, G + 0.5, 0.11],
      [0, G + 0.44, 0.115],
    ]),
    (t: number) => [rxB(t), ryB(t)],
    { bone: jaw, color: BEARD, caps: { start: "flat", end: "point" }, sides: 10 },
  );
  const beardSkin = b.surface(beard);
  const lockAt = (x: number, y: number, w: number, len: number, sway: number, lift: number) => {
    const h = beardSkin.ray([x, y, 0.6], [0, 0, -1]);
    if (!h) return;
    const n = h.n.clone();
    const yv = P(0, 1, 0).sub(n.clone().multiplyScalar(n.y)).normalize();
    const xv = yv.clone().cross(n).normalize();
    b.extrude(
      [
        [-w / 2, 0],
        [w / 2, 0],
        [w * 0.45 + sway * 0.5, -len * 0.55],
        [sway, -len, "sharp"],
        [-w * 0.45 + sway * 0.5, -len * 0.55],
      ],
      {
        at: h.at.clone().addScaledVector(n, lift),
        x: xv,
        y: yv,
        thickness: [0.003, 0.018],
        bevel: 0.004,
        smoothing: 1,
        color: BEARD,
        bone: jaw,
      },
    );
  };
  for (const x of [-0.085, -0.045, 0, 0.045, 0.085]) lockAt(x, G + 0.69, 0.07, 0.12, -x * 0.25, 0.012);
  for (const x of [-0.065, -0.022, 0.022, 0.065]) lockAt(x, G + 0.62, 0.07, 0.13, x * 0.2, 0.008);
  for (const x of [-0.04, 0, 0.04]) lockAt(x, G + 0.55, 0.065, 0.12, x * -0.4, 0.004);
  lockAt(0, G + 0.485, 0.06, 0.1, 0.01, 0.0);

  // ------------------------------------------------------------------ hat
  const hatPath = catmull([
    [0, G + 0.87, 0.005],
    [0, G + 0.99, 0.0],
    [0, G + 1.1, -0.04],
    [0, G + 1.19, -0.12],
    [0, G + 1.23, -0.22],
    [0, G + 1.22, -0.31],
  ]);
  const hat = b.sweep(hatPath, [0.136, 0.13, 0.108, 0.08, 0.05, 0.026], {
    bone: head,
    color: HAT,
    caps: { start: "flat", end: "round" },
    sides: 10,
  });
  b.lathe(
    [[0.112, -0.012], [0.15, -0.008], [0.158, 0.01], [0.14, 0.03], [0.112, 0.028]],
    { at: [0, G + 0.872, 0.005], axis: [0, 1, 0.1], segments: 20, smoothing: 1, color: HAT_TRIM, bone: head },
  );
  const hatSkin = b.surface(hat);
  const emblemHit = hatSkin.ray([0, G + 1.05, 1], [0, 0, -1]);
  if (emblemHit) b.decal(hat, EMBLEM, { at: emblemHit, size: [0.07, 0.07], lift: 0.003 });
  // goggles pushed up on the hat band
  b.sweep(hatSkin.loop([0, G + 0.95, -0.01], { dir: [0, 1, 0], lift: 0.006 }), 0.011, {
    color: LEATHER2,
    sides: 6,
    bone: head,
  });
  for (const s of [1, -1]) {
    const gh = hatSkin.ray([s * 0.052, G + 0.95, 1], [0, 0, -1]);
    if (!gh) continue;
    const n = gh.n.clone();
    const c0 = gh.at.clone().addScaledVector(n, 0.014);
    cyl(0.04, 0.04, 0.034, BRASS, c0, head, [n.x, n.y, n.z], 10);
    glow(
      b.part(new THREE.CircleGeometry(0.031, 10), GLASS_BLUE, {
        at: c0.clone().addScaledVector(n, 0.0185),
        dir: n,
        axis: "z",
        bone: head,
      }),
      0.9,
    );
    b.part(new THREE.TorusGeometry(0.035, 0.005, 5, 12), GILT, {
      at: c0.clone().addScaledVector(n, 0.017),
      dir: n,
      axis: "z",
      bone: head,
    });
  }
  box(0.03, 0.012, 0.012, BRASS, [0, G + 0.95, 0.128], head, { rotation: [-15, 0, 0] });
  // glowing idea bulb on the floppy tip
  const tipEnd = hatPath.at(1);
  const tipDir = hatPath.tangentAt(1);
  cyl(0.014, 0.018, 0.026, BRASS, tipEnd.clone().addScaledVector(tipDir, 0.015), head, [tipDir.x, tipDir.y, tipDir.z], 8);
  glow(ball(0.042, "#fff0a0", tipEnd.clone().addScaledVector(tipDir, 0.062), head, undefined, { flat: false }), 1.8);
  glow(ball(0.022, "#ffffff", tipEnd.clone().addScaledVector(tipDir, 0.062), head, undefined, { flat: false }), 2.2);
  cyl(0.02, 0.02, 0.008, GILT, tipEnd.clone().addScaledVector(tipDir, 0.03), head, [tipDir.x, tipDir.y, tipDir.z], 8);
  b.rod(tipEnd.clone().addScaledVector(tipDir, 0.04), tipEnd.clone().addScaledVector(tipDir, 0.06), 0.003, "#b8741c", { bone: head });
  const SPARK = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 0 L37 27 L64 32 L37 37 L32 64 L27 37 L0 32 L27 27Z" fill="#fff4a8"/>
      <path d="M32 14 L35 29 L50 32 L35 35 L32 50 L29 35 L14 32 L29 29Z" fill="#ffffff"/>
    </svg>`,
    { size: 96 },
  );
  const bulbC = tipEnd.clone().addScaledVector(tipDir, 0.062);
  glow(
    b.cards([frame(bulbC.clone().add(P(0, -0.08, 0)), [0, 1, 0])], SPARK, {
      size: 0.16,
      lean: 0,
      flow: [0, 0, 1],
      cross: true,
      sink: 0,
      bone: head,
    }),
    1.6,
  );

  // ------------------------------------------------------------------ backpack
  const PZ = -0.21;
  const BACKZ = PZ - 0.092;
  b.frustumBox([0, G + 0.33, PZ], [0, G + 0.74, PZ], [0.34, 0.18], [0.3, 0.17], { color: LEATHER, bone: chest });
  b.frustumBox([0, G + 0.33, PZ], [0, G + 0.375, PZ], [0.355, 0.19], [0.35, 0.188], { color: LEATHER2, bone: chest });
  b.frustumBox([0, G + 0.7, PZ], [0, G + 0.775, PZ], [0.325, 0.19], [0.305, 0.178], { color: LEATHER2, bone: chest });
  // bedroll
  const roll = cyl(0.056, 0.056, 0.37, ROLL, [0, G + 0.835, PZ], chest, [1, 0, 0], 10);
  void roll;
  for (const s of [1, -1]) {
    cyl(0.06, 0.06, 0.022, LEATHER2, [s * 0.1, G + 0.835, PZ], chest, [1, 0, 0], 10);
    box(0.026, 0.026, 0.01, GILT, [s * 0.1, G + 0.835, PZ + 0.062], chest);
    // side pockets
    box(0.05, 0.16, 0.13, LEATHER, [s * 0.18, G + 0.5, PZ], chest);
    box(0.054, 0.04, 0.136, LEATHER2, [s * 0.18, G + 0.58, PZ], chest);
    ball(0.011, GILT, [s * 0.18, G + 0.58, PZ + 0.07], chest);
    // vertical straps on the back
    box(0.03, 0.4, 0.008, LEATHER2, [s * 0.14, G + 0.54, BACKZ - 0.002], chest);
    box(0.04, 0.03, 0.012, GILT, [s * 0.14, G + 0.44, BACKZ - 0.006], chest);
    for (const yy of [0.36, 0.72]) ball(0.01, GILT, [s * 0.16, G + yy, BACKZ - 0.004], chest);
  }

  // gear train on the back (turns on its own joints)
  const drive = gearTrain(b, {
    at: [0, G + 0.45, BACKZ - 0.004],
    axis: [0, 0, -1],
    module: 0.006,
    spin: "gear",
    bone: chest,
    group: "pack",
    gears: [
      { teeth: 26, spokes: 5, bore: 0.005 },
      { teeth: 14, angle: 55 },
      { teeth: 12, from: 0, angle: -120 },
      { teeth: 10, on: 1, shift: 0.02 },
      { teeth: 18, from: 3, angle: 180, spokes: 4 },
    ],
  });
  drive.spin(14);

  // pressure gauge
  cyl(0.053, 0.053, 0.018, GILT, [-0.07, G + 0.66, BACKZ - 0.004], chest, [0, 0, -1], 12);
  b.part(new THREE.CircleGeometry(0.044, 20), "#ffffff", {
    at: [-0.07, G + 0.66, BACKZ - 0.0145],
    dir: [0, 0, -1],
    axis: "z",
    bone: chest,
    texture: GAUGE,
  });
  b.part(new THREE.TorusGeometry(0.05, 0.004, 5, 14), BRASS, { at: [-0.07, G + 0.66, BACKZ - 0.012], dir: [0, 0, -1], axis: "z", bone: chest });

  // blueprint scroll across the lower back
  b.rod([-0.19, G + 0.345, BACKZ - 0.03], [0.19, G + 0.345, BACKZ - 0.03], 0.03, "#eadcb2", { bone: chest, sides: 10 });
  for (const s of [1, -1]) {
    cyl(0.02, 0.02, 0.012, "#c9b88a", [s * 0.196, G + 0.345, BACKZ - 0.03], chest, [1, 0, 0], 8);
    cyl(0.033, 0.033, 0.02, "#b83a2a", [s * 0.1, G + 0.345, BACKZ - 0.03], chest, [1, 0, 0], 8);
  }

  // telescope strapped to the left pocket
  const tA = P(0.205, G + 0.5, PZ + 0.01);
  const tB = P(0.3, G + 0.86, PZ + 0.04);
  const tD = tB.clone().sub(tA).normalize();
  const t1 = tA.clone().addScaledVector(tD, 0.14);
  const t2 = tA.clone().addScaledVector(tD, 0.26);
  b.rod(tA, t1, 0.03, BRASS, { bone: chest, sides: 10 });
  b.rod(t1, t2, 0.025, GILT, { bone: chest, sides: 10 });
  b.rod(t2, tB, 0.02, COPPER, { bone: chest, sides: 10 });
  ball(0.03, BRASS, tA, chest, [1, 0.6, 1]);
  for (const [pp, r] of [[t1, 0.034], [t2, 0.028], [tB, 0.024]] as [THREE.Vector3, number][])
    cyl(r, r, 0.012, GILT, pp, chest, [tD.x, tD.y, tD.z], 10);
  for (const f of [0.045, 0.095]) cyl(0.034, 0.034, 0.018, LEATHER2, tA.clone().addScaledVector(tD, f), chest, [tD.x, tD.y, tD.z], 10);
  glow(
    b.part(new THREE.CircleGeometry(0.017, 10), GLASS_BLUE, {
      at: tB.clone().addScaledVector(tD, 0.003),
      dir: tD,
      axis: "z",
      bone: chest,
    }),
    0.9,
  );

  // lantern on the right side
  const LX = -0.275;
  const LY = G + 0.52;
  b.rod([-0.17, G + 0.64, PZ], [LX, G + 0.64, PZ], 0.008, BRASS, { bone: chest, sides: 6 });
  b.rod([LX, G + 0.64, PZ], [LX, LY + 0.092, PZ], 0.004, BRASS, { bone: chest, sides: 5 });
  glow(
    b.part(new THREE.BoxGeometry(0.06, 0.08, 0.06), "#ffffff", { at: [LX, LY, PZ], bone: chest, texture: FLAME }),
    1.3,
  );
  for (const [dx, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]])
    b.rod([LX + dx * 0.031, LY - 0.04, PZ + dz * 0.031], [LX + dx * 0.031, LY + 0.04, PZ + dz * 0.031], 0.004, BRASS, { bone: chest, sides: 5 });
  b.part(new THREE.ConeGeometry(0.048, 0.04, 6), BRASS, { at: [LX, LY + 0.06, PZ], bone: chest, flat: true });
  cyl(0.04, 0.034, 0.018, BRASS, [LX, LY - 0.049, PZ], chest, [0, 1, 0], 6);
  b.part(new THREE.TorusGeometry(0.018, 0.004, 5, 10), GILT, { at: [LX, LY + 0.087, PZ], bone: chest });

  // steam pipe + puffs, spring antenna
  b.rod([-0.09, G + 0.86, PZ + 0.02], [-0.09, G + 0.98, PZ + 0.02], 0.02, COPPER, { bone: chest, sides: 8 });
  ball(0.026, COPPER, [-0.09, G + 0.99, PZ + 0.02], chest);
  b.rod([-0.09, G + 0.99, PZ + 0.02], [-0.17, G + 1.02, PZ + 0.0], 0.017, COPPER, { bone: chest, sides: 8 });
  cyl(0.026, 0.026, 0.012, GILT, [-0.09, G + 0.9, PZ + 0.02], chest, [0, 1, 0], 8);
  ball(0.028, "#fbfdfe", [-0.185, G + 1.07, PZ], chest, undefined, { flat: false });
  ball(0.035, "#f4f8fa", [-0.195, G + 1.12, PZ - 0.008], chest, undefined, { flat: false });
  ball(0.043, "#eef3f6", [-0.185, G + 1.18, PZ - 0.005], chest, undefined, { flat: false });
  b.sweep(coil([0.09, G + 0.88, PZ], [0.09, G + 1.07, PZ], 0.022, 7), 0.0045, { bone: chest, color: BLUED, sides: 5 });
  ball(0.017, GILT, [0.09, G + 1.085, PZ], chest);

  // ------------------------------------------------------------------ stump base and its story
  const BASE_PAINT = paint((p, n) => {
    const r = Math.hypot(p.x, p.z);
    if (n.y > 0.7) {
      const wob = (noise(p, 0.1, 4) - 0.5) * 0.05;
      const ring = Math.sin((r + wob) * 170);
      const c = ring > 0.55 ? mix("#8a5a30", "#7a4c28", 0.5) : mix("#dba96a", "#c98f55", noise(p, 0.06, 2));
      const m = smoothstep(0.52, 0.66, noise(p, 0.11, 7) + (r - 0.2) * 0.8);
      return mix(c, mix("#6aa83c", "#4d8a2e", noise(p, 0.03, 3)), m * 0.95);
    }
    const ang = Math.atan2(p.z, p.x);
    const k = noise(p, 0.03, 1) * 0.6 + 0.2 * Math.sin(ang * 26);
    const c = mix("#5b3b22", "#7a5232", Math.min(Math.max(k + 0.2, 0), 1));
    const m = smoothstep(0.5, 0.7, noise(p, 0.07, 9)) * smoothstep(0.03, 0.065, p.y);
    return mix(c, "#4d8a2e", m * 0.85);
  });
  b.lathe(
    [[0, 0], [0.4, 0], [0.425, 0.015], [0.432, 0.05], [0.415, G], [0, G]],
    { at: [0, 0, 0], segments: 22, color: BASE_PAINT, bone: root },
  );

  // grass tufts around the rim
  const r1 = rng(7);
  const avoid: [number, number, number][] = [
    [-0.22, 0.25, 0.13], [-0.05, 0.35, 0.09], [0.04, 0.38, 0.07], [0.15, 0.27, 0.15],
    [0.3, 0.12, 0.06], [0.31, 0.22, 0.05], [0.25, -0.2, 0.12], [-0.32, -0.05, 0.05],
  ];
  const tufts: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 70 && tufts.length < 34; i++) {
    const a = r1() * Math.PI * 2;
    const rad = 0.27 + r1() * 0.14;
    const x = Math.sin(a) * rad;
    const z = Math.cos(a) * rad;
    if (avoid.some(([ax, az, ar]) => Math.hypot(x - ax, z - az) < ar)) continue;
    if (Math.hypot(x, z) > 0.41) continue;
    tufts.push(frame([x, G - 0.004, z], [0, 1, 0]));
  }
  b.cards(tufts, GRASS, { size: [0.05, 0.065], lean: 0, flow: [0, 0, 1], vary: 0.3, spin: 180, rng: r1, cross: true, bend: 20, bone: root });

  // toolbox
  {
    const yaw = 25;
    const tp = (lx: number, ly: number, lz: number): Vec3 => {
      const c = Math.cos(yaw * DEG);
      const sn = Math.sin(yaw * DEG);
      return [-0.22 + lx * c + lz * sn, ly, 0.25 - lx * sn + lz * c];
    };
    const rot: Vec3 = [0, yaw, 0];
    box(0.17, 0.07, 0.09, panelled("#b53b2b", { size: 0.085, aspect: 0.8, rivets: 0.025 }), tp(0, G + 0.035, 0), root, { rotation: rot });
    box(0.176, 0.028, 0.096, lit(mottle("#c8483a", "#b53b2b", { size: 0.05 })), tp(0, G + 0.084, 0), root, { rotation: rot });
    b.part(new THREE.TorusGeometry(0.034, 0.005, 5, 10, Math.PI), STEEL, { at: tp(0, G + 0.098, 0), rotation: rot, bone: root });
    for (const sx of [-1, 1]) {
      box(0.016, 0.03, 0.01, GILT, tp(sx * 0.055, G + 0.07, 0.047), root, { rotation: rot });
      box(0.012, 0.012, 0.012, GILT, tp(sx * 0.082, G + 0.1, 0.045), root, { rotation: rot });
    }
    box(0.05, 0.02, 0.004, "#f1e3bd", tp(0, G + 0.04, 0.046), root, { rotation: rot });
    // screwdriver sticking out of the lid
    b.rod(tp(-0.04, G + 0.095, 0.0), tp(-0.04, G + 0.15, 0.0), 0.007, "#d83a2c", { bone: root, sides: 6 });
  }

  // flat gears lying about
  b.part(gearGeometry({ teeth: 16, module: 0.006, spokes: 4, bore: 0.006 }), BRASS, { at: [-0.05, G + 0.006, 0.35], bone: root });
  b.part(gearGeometry({ teeth: 12, module: 0.005, holes: 3, bore: 0.004 }), COPPER, { at: [0.045, G + 0.006, 0.385], bone: root });
  b.part(gearGeometry({ teeth: 12, module: 0.005, bore: 0.004 }), GILT, { at: [0.045, G + 0.017, 0.385], bone: root, rotation: [0, 15, 0] });

  // blueprint sheet on the ground
  b.part(new THREE.PlaneGeometry(0.2, 0.14), "#ffffff", {
    at: [0.14, G + 0.003, 0.27],
    dir: [0, 1, 0],
    up: [0.26, 0, -0.97],
    axis: "z",
    bone: root,
    texture: BLUEPRINT,
  });

  // wind-up clockwork beetle sitting on the plans
  {
    const cx = 0.16;
    const cz = 0.285;
    ball(1, BRASS, [cx, G + 0.043, cz], root, [0.036, 0.028, 0.05]);
    ball(1, COPPER, [cx, G + 0.04, cz + 0.05], root, [0.024, 0.022, 0.024]);
    for (const s of [1, -1]) {
      glow(ball(0.008, "#9ff4ff", [cx + s * 0.012, G + 0.052, cz + 0.07], root), 1.2);
      b.rod([cx + s * 0.01, G + 0.058, cz + 0.07], [cx + s * 0.03, G + 0.1, cz + 0.095], 0.0028, INK, { bone: root, sides: 4 });
      for (const dz of [-0.02, 0.0, 0.02]) {
        b.rod([cx + s * 0.03, G + 0.035, cz + dz], [cx + s * 0.055, G + 0.012, cz + dz + 0.01], 0.0042, IRON, { bone: root, sides: 4 });
      }
    }
    b.extrude(
      [[-0.01, 0], [0.01, 0], [0.012, 0.02], [0.03, 0.03], [0.03, 0.055], [0.012, 0.05], [0, 0.04], [-0.012, 0.05], [-0.03, 0.055], [-0.03, 0.03], [-0.012, 0.02]],
      { at: [cx, G + 0.066, cz - 0.01], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.006, color: GILT, bone: root },
    );
  }

  // mushrooms
  for (const [mx, mz, k] of [[0.3, 0.12, 1], [0.31, 0.22, 0.65]] as [number, number, number][]) {
    b.part(new THREE.CylinderGeometry(0.014 * k, 0.02 * k, 0.05 * k, 8), "#f4ead2", { at: [mx, G + 0.025 * k, mz], bone: root, flat: true });
    b.lathe(
      [[0, 0.075 * k], [0.03 * k, 0.07 * k], [0.052 * k, 0.045 * k], [0.06 * k, 0.02 * k], [0.055 * k, 0.012 * k], [0.02 * k, 0.02 * k], [0, 0.02 * k]],
      { at: [mx, G + 0.04 * k, mz], segments: 12, color: lit(spots("#d8352a", "#fff6e4", { size: 0.03, amount: 0.6, seed: 4 })), bone: root },
    );
  }

  // signpost
  b.rod([0.25, G, -0.2], [0.25, G + 0.27, -0.2], 0.009, LEATHER2, { bone: root, sides: 6 });
  b.part(new THREE.BoxGeometry(0.2, 0.1, 0.016), "#ffffff", {
    at: [0.25, G + 0.22, -0.185],
    rotation: [0, -25, 0],
    bone: root,
    texture: SIGN,
  });

  // oil can
  cyl(0.026, 0.028, 0.05, COPPER, [-0.32, G + 0.025, -0.05], root, [0, 1, 0], 8);
  cyl(0.012, 0.026, 0.02, COPPER, [-0.32, G + 0.058, -0.05], root, [0, 1, 0], 8);
  b.rod([-0.32, G + 0.066, -0.05], [-0.37, G + 0.1, -0.05], 0.006, BRASS, { bone: root, sides: 5 });
  b.part(new THREE.TorusGeometry(0.022, 0.004, 5, 10, Math.PI), BRASS, { at: [-0.32, G + 0.05, -0.05], rotation: [0, 90, 0], bone: root });

  return b.root;
}
