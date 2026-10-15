import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  vec,
  catmull,
  limb,
  paint,
  stripes,
  mottle,
  spots,
  scales,
  grain,
  mix,
  noise,
  smoothstep,
  resolve,
  svg,
} from "../../../../src/index";
import { coil, gaugeTexture, gearGeometry, gearTrain, metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gnome Tinkerer",
  description:
    "A whimsical low-poly gnome inventor with a patchwork hat, goggles, a huge white beard and a backpack crammed with gadgets: a spinning gear train, a copper steam tank with a pressure gauge, a telescope, a rotor, a glowing jar and a lantern on a staff. He stands on a mossy cobble plinth with toadstools, a blueprint crate and a clockwork beetle.",
};

type ColorIn = Parameters<typeof resolve>[0];

// ---------------------------------------------------------------- palette
const SKIN = "#f2b48c";
const SKIN_L = "#f8c9a2";
const NOSE = "#ea8068";
const BLUSH = "#f2937e";
const WHITE = "#f7f2e8";
const CREAM = "#e6dfcc";
const GREY_W = "#c9c2b0";
const HAT_R = "#d9472b";
const HAT_L = "#f06a3a";
const TEAL = "#2a7884";
const TEAL_L = "#3a9a9c";
const MUSTARD = "#e0a83a";
const MUSTARD_B = "#cf9230";
const MUSTARD_BL = "#e2ad45";
const THREAD = "#fbe7a8";
const SEAM = "#6b3e18";
const LEATHER = "#7a4a2a";
const LEATHER_D = "#4d2e18";
const LEATHER_L = "#9a6234";
const CANVAS_A = "#8f7040";
const CANVAS_B = "#a58450";
const PANTS_A = "#6b5a3e";
const PANTS_B = "#7d6a4a";
const SOLE = "#2b1a10";
const DARK = "#2a1a14";
const MOUTH = "#5a1822";
const TONGUE = "#d9667a";
const AMBER = "#ffb23a";
const GREEN_G = "#7dff7a";
const CYAN_G = "#7ff3ff";
const STEM = "#efe3c4";
const WOOD_A = "#a8783e";
const WOOD_B = "#8a5e2e";
const MOSS = "#5d8a3a";
const RED_BEDROLL = "#c8554f";
const GOLD_BED = "#e8c27a";

// ---------------------------------------------------------------- svg helpers
function gearPath(cx: number, cy: number, ro: number, ri: number, n: number) {
  const step = (Math.PI * 2) / n;
  const pts: string[] = [];
  for (let k = 0; k < n; k++) {
    for (const [r, f] of [
      [ri, -0.3],
      [ro, -0.17],
      [ro, 0.17],
      [ri, 0.3],
    ] as [number, number][]) {
      const a = (k + f) * step;
      pts.push(`${(cx + Math.sin(a) * r).toFixed(2)} ${(cy - Math.cos(a) * r).toFixed(2)}`);
    }
  }
  return `M${pts.join("L")}Z`;
}

// warm light from above, cool shade from below, on any base colour or paint
const WARM = [1.07, 1.02, 0.94];
const COOL = [0.74, 0.78, 0.92];
function lit(base: ColorIn) {
  return paint((p, n) => {
    const c = resolve(base, p, n);
    const t = smoothstep(-0.7, 0.8, n.y);
    return [0, 1, 2].map((i) => Math.min(1, c[i] * (COOL[i] + (WARM[i] - COOL[i]) * t))) as [number, number, number];
  });
}

export default function build() {
  const b = createBuilder({ name: "gnomeTinkerer", paintSize: 2048 });
  type J = ReturnType<typeof b.joint>;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const mk = (geo: THREE.BufferGeometry, color: ColorIn, bone: J, at: number[], o: Record<string, any> = {}) =>
    b.part(geo, color, { bone, at, ...o } as any);

  // ------------------------------------------------------------ textures
  const EYE = svg(
    `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="21" rx="17" ry="17" fill="#2a1a14"/>
    <ellipse cx="20" cy="21" rx="14.5" ry="14.5" fill="#fffaf0"/>
    <circle cx="21" cy="23" r="10" fill="#6a3d1c"/>
    <circle cx="21" cy="23" r="6" fill="#130a08"/>
    <circle cx="17" cy="18.5" r="3.6" fill="#ffffff"/>
    <circle cx="25" cy="27" r="1.8" fill="#ffffff"/>
    <path d="M3 15 Q20 1 37 15" stroke="#2a1a14" stroke-width="4" fill="none" stroke-linecap="round"/>
  </svg>`,
    { size: 128 },
  );
  const LENS = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="g" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#e8ffff"/><stop offset=".5" stop-color="#6fe8ff"/><stop offset="1" stop-color="#1aa7d6"/></radialGradient></defs>
    <circle cx="32" cy="32" r="31" fill="url(#g)"/>
    <ellipse cx="22" cy="20" rx="10" ry="5" fill="#ffffff" opacity=".85" transform="rotate(-35 22 20)"/>
    <circle cx="42" cy="42" r="3" fill="#ffffff" opacity=".7"/>
  </svg>`,
    { size: 128 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#f2c14e" stroke="#4a2a14" stroke-width="3"/>
    <circle cx="32" cy="32" r="25" fill="#2a7884" stroke="#4a2a14" stroke-width="2" stroke-dasharray="4 2.5"/>
    <path d="${gearPath(32, 32, 17, 12.5, 9)}" fill="#f7d980" stroke="#4a2a14" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="32" cy="32" r="5.5" fill="#2a7884" stroke="#4a2a14" stroke-width="2"/>
  </svg>`,
    { size: 256 },
  );
  const PATCH = svg(
    `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="116" height="36" rx="9" fill="#2a7884" stroke="#f2c14e" stroke-width="3" stroke-dasharray="7 3"/>
    <text x="60" y="26" text-anchor="middle" font-family="serif" font-weight="bold" font-size="19" fill="#f7f2e8">GNOMEWORKS</text>
  </svg>`,
    { size: 256 },
  );
  let grid = "";
  for (let i = 1; i < 10; i++) grid += `M0 ${i * 7}H100 `;
  for (let i = 1; i < 14; i++) grid += `M${i * 7.2} 0V70 `;
  const BLUEPRINT = svg(
    `<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="70" fill="#1f56a0"/>
    <path d="${grid}" stroke="#6aa0e0" stroke-width=".4" opacity=".55" fill="none"/>
    <path d="${gearPath(28, 36, 17, 13.5, 12)}" fill="none" stroke="#e8f2ff" stroke-width="1"/>
    <circle cx="28" cy="36" r="6" fill="none" stroke="#e8f2ff" stroke-width="1"/>
    <path d="M60 50 L60 28 M48 28 H72 M52 24 L68 32 M68 24 L52 32" stroke="#e8f2ff" stroke-width="1.2" fill="none"/>
    <path d="M50 58 H88 M50 56 V60 M88 56 V60" stroke="#e8f2ff" stroke-width=".8" fill="none"/>
    <text x="62" y="14" font-family="monospace" font-size="7" fill="#e8f2ff">MK.IV</text>
    <text x="64" y="64" font-family="monospace" font-size="5" fill="#e8f2ff">38 cm</text>
  </svg>`,
    { size: 256 },
  );
  const FLOOR = svg(
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="95" fill="none" stroke="#d6a94a" stroke-width="4"/>
    <circle cx="100" cy="100" r="86" fill="none" stroke="#2a2622" stroke-width="3" stroke-dasharray="7 5"/>
    <path d="${gearPath(100, 100, 72, 60, 16)}" fill="none" stroke="#d6a94a" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="100" cy="100" r="44" fill="none" stroke="#2a2622" stroke-width="3"/>
    <path d="M100 8V192 M8 100H192" stroke="#d6a94a" stroke-width="2.5" opacity=".8"/>
    <path d="M100 4 L108 22 L92 22Z" fill="#d6a94a"/>
  </svg>`,
    { size: 512 },
  );
  const WISP = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 62 C5 44 8 20 16 2 C24 20 27 44 16 62Z" fill="#f7f2e8" stroke="#bdb5a3" stroke-width="2"/>
    <path d="M16 56 C14 40 15 20 16 8" stroke="#d6cfbd" stroke-width="1.5" fill="none"/>
  </svg>`,
    { size: 128 },
  );
  const GRASS = svg(
    `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 48 Q6 22 1 3 Q15 20 14 48Z" fill="#5fae3a"/>
    <path d="M11 48 Q14 20 16 0 Q23 22 22 48Z" fill="#7ccb48"/>
    <path d="M20 48 Q26 26 31 10 Q31 30 29 48Z" fill="#4e9a32"/>
  </svg>`,
    { size: 128 },
  );
  const GAUGE = gaugeTexture({ needle: 52, label: "STEAM" });

  // ------------------------------------------------------------ paints
  const BRASS = metal("brass");
  const GILT = metal("gilt");
  const COPPER_V = metal("copper", { verdigris: 0.45 });
  const IRON = metal("iron");
  const STEEL = metal("steel");
  const SKINP = lit(mottle(SKIN, SKIN_L, { size: 0.07, seed: 3 }));
  const BEARDP = lit(mottle(WHITE, CREAM, { size: 0.05, seed: 6 }));
  const LEATHERP = lit(mottle(LEATHER, LEATHER_L, { size: 0.05, seed: 4 }));
  const LEATHER_DP = lit(mottle(LEATHER_D, LEATHER, { size: 0.04, seed: 5 }));
  const HATP = lit(stripes(HAT_R, HAT_L, { size: 0.12, axis: "y", width: 0.38, wobble: 0.25, seed: 2 }));
  const PANTS = lit(mottle(PANTS_A, PANTS_B, { size: 0.04, seed: 7 }));
  const SOCKS = lit(stripes("#f2ead6", "#c9392f", { size: 0.045, axis: "y", width: 0.5, wobble: 0.05, seed: 9 }));
  const BEDROLL = lit(stripes(RED_BEDROLL, GOLD_BED, { size: 0.05, axis: "x", width: 0.4, wobble: 0.1, seed: 11 }));
  const CANVAS = panelled(lit(mottle(CANVAS_A, CANVAS_B, { size: 0.05, seed: 8 })), {
    size: 0.12,
    aspect: 0.8,
    rivets: 0.03,
    seam: "#3a2412",
  });
  const TANK = panelled(COPPER_V, { size: 0.1, aspect: 1, rivets: 0.02 });
  const PLATE = panelled(IRON, { size: 0.09, aspect: 1, rivets: 0.025 });
  const CRATE = panelled(lit(grain(WOOD_A, WOOD_B, { size: 0.02, axis: "x", seed: 3 })), {
    size: 0.05,
    aspect: 1,
    rivets: 0.04,
    seam: "#3a2412",
  });
  const TUNIC = lit(
    paint((p, n) => {
      const wool = mix(TEAL, TEAL_L, noise(p, 0.045, 3));
      const a = Math.atan2(p.x, p.z);
      const zig = Math.abs(((((a * 14) / Math.PI) % 2) + 2) % 2 - 1);
      if (p.y < 0.268 + 0.016 * zig) return MUSTARD;
      if (p.y < 0.28 + 0.016 * zig) return SEAM;
      const top = 0.56 - 1.5 * Math.max(0, Math.abs(p.x) - 0.045);
      const m = Math.min(0.088 - Math.abs(p.x), top - p.y, p.y - 0.37);
      if (p.z > 0 && n.z > 0.1 && p.y > 0.3) {
        if (m > 0.007 && m < 0.012 && Math.floor((p.x + p.y) * 90) % 2 === 0) return THREAD;
        if (m > 0) return mix(MUSTARD_B, MUSTARD_BL, noise(p, 0.04, 5));
        if (m > -0.004) return SEAM;
      }
      return wool;
    }),
  );
  const COBBLE = paint((p, n) => {
    const base = resolve(scales(["#8d8a80", "#9b968a", "#807d74"], "#4a4741", { size: 0.09, width: 0.18, seed: 4 }), p, n);
    const m = smoothstep(0.52, 0.72, noise(p, 0.16, 9)) * smoothstep(0.3, 0.9, n.y);
    return mix(base as any, MOSS, m * 0.8);
  });

  // ------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.3, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.32, 0],
      [0, 0.46, 0],
      [0, 0.6, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const TB = spine.joints[0];
  const CH = spine.joints[1];
  const neck = b.joint("neck", { parent: CH, at: [0, 0.62, 0], aim: [0, 0.69, 0.01], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.69, 0.01], dir: [0, 1, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.715, 0.015], aim: [0, 0.67, 0.12], role: "jaw" });

  // ------------------------------------------------------------ torso
  const lower = b.lathe(
    [
      [0, 0],
      [0.19, 0],
      [0.18, 0.03],
      [0.14, 0.12],
      [0.153, 0.2],
      [0.153, 0.225],
      [0, 0.225],
    ],
    { at: [0, 0.25, 0], segments: 10, color: TUNIC, bone: TB, name: "torsoLow" },
  );
  const upper = b.lathe(
    [
      [0, 0],
      [0.153, 0],
      [0.16, 0.07],
      [0.13, 0.15],
      [0.06, 0.19],
      [0, 0.19],
    ],
    { at: [0, 0.46, 0], segments: 10, color: TUNIC, bone: CH, name: "torsoUp" },
  );
  mk(new THREE.CylinderGeometry(0.055, 0.06, 0.1, 8), SKINP, neck, [0, 0.65, 0.005]);

  // belt
  b.lathe(
    [
      [0.139, -0.022],
      [0.153, -0.022],
      [0.153, 0.022],
      [0.139, 0.022],
    ],
    { at: [0, 0.37, 0], segments: 10, color: LEATHER_DP, bone: TB, name: "belt" },
  );
  b.ring(frame([0, 0.37, 0], [0, 1, 0]), { count: 10, radius: 0.15 }, (it) =>
    b.stick(new THREE.SphereGeometry(0.007, 5, 4), BRASS, it, { bone: TB, embed: 0.4 }),
  );
  mk(new THREE.BoxGeometry(0.056, 0.048, 0.014), BRASS, TB, [0, 0.37, 0.153]);
  mk(new THREE.BoxGeometry(0.03, 0.026, 0.016), DARK, TB, [0, 0.37, 0.154]);
  glow(mk(new THREE.OctahedronGeometry(0.012), GREEN_G, TB, [0, 0.37, 0.164]), 1.3);

  const skin = b.surface([lower, upper]);

  // straps over the shoulders (they carry the pack)
  for (const s of [1, -1]) {
    const strap = skin.drape(
      catmull([
        [s * 0.07, 0.4, 0.2],
        [s * 0.075, 0.5, 0.2],
        [s * 0.085, 0.6, 0.12],
        [s * 0.09, 0.66, 0.0],
        [s * 0.085, 0.6, -0.12],
        [s * 0.075, 0.5, -0.2],
        [s * 0.07, 0.4, -0.2],
      ]),
      { lift: 0.012 },
    );
    b.sweep(strap, 0.014, { color: LEATHERP, bone: CH, sides: 6 });
    const bh = skin.nearest([s * 0.075, 0.46, 0.22]);
    b.stick(new THREE.BoxGeometry(0.034, 0.012, 0.044), BRASS, bh.moved([0, 0.014, 0]), { bone: CH, flow: [0, -1, 0] });
  }

  // pouch, screwdriver, wrench
  for (const s of [1, -1]) {
    const ph = skin.around([0, 0.37, 0]).at(s * 52, 0)!;
    b.stick(new THREE.BoxGeometry(0.058, 0.04, 0.072), LEATHERP, ph.moved([0, 0.012, 0]), {
      bone: TB,
      flow: [0, -1, 0],
      embed: 0.3,
    });
    b.stick(new THREE.SphereGeometry(0.008, 5, 4), BRASS, ph.moved([0, 0.045, 0.008]), { bone: TB });
    if (s > 0) {
      const p = ph.at;
      b.rod([p.x + 0.006, p.y + 0.02, p.z + 0.02], [p.x + 0.014, p.y + 0.09, p.z + 0.03], 0.004, STEEL, { bone: TB, sides: 5 });
      b.rod([p.x + 0.004, p.y + 0.03, p.z + 0.018], [p.x + 0.0, p.y - 0.005, p.z + 0.016], 0.01, "#d6402f", { bone: TB, sides: 6 });
    }
  }
  {
    const yv = V(0.2, 1, 0).normalize();
    b.extrude(
      [
        [-0.012, -0.09],
        [0.012, -0.09],
        [0.012, 0.035],
        [0.032, 0.055],
        [0.032, 0.1],
        [0.012, 0.115],
        [0.012, 0.085],
        [-0.012, 0.085],
        [-0.012, 0.115],
        [-0.032, 0.1],
        [-0.032, 0.055],
        [-0.012, 0.035],
      ],
      { at: [-0.19, 0.27, 0.03], x: [0, 0, 1], y: yv, thickness: 0.012, bevel: 0.002, color: STEEL, bone: TB },
    );
    mk(new THREE.TorusGeometry(0.014, 0.004, 4, 8), BRASS, TB, [-0.165, 0.375, 0.03], { axis: "z", dir: [1, 0, 0] });
  }

  // ------------------------------------------------------------ legs and boots
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.09, 0.285, 0], [s * 0.09, 0.085, 0.02], [0.13, 0.12], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.09, 0, 0.05],
    });
    b.sweep(leg, [0.062, 0.052, 0.046], {
      sides: 8,
      smooth: false,
      bands: [
        [0.55, PANTS],
        [1, SOCKS],
      ],
    });
    const kp = vec(pts[1]);
    mk(new THREE.SphereGeometry(0.04, 7, 5), LEATHERP, leg.joints[1], [kp.x, kp.y, kp.z + 0.034], { scale: [1, 1, 0.55] });
    const A = leg.tip!;
    const toe = b.joint(`toe${S}`, { parent: A, at: [s * 0.09, 0.04, 0.11], aim: [s * 0.09, 0.035, 0.17], role: "digit" });
    mk(new THREE.SphereGeometry(1, 10, 7), LEATHERP, A, [s * 0.09, 0.042, 0.05], { scale: [0.058, 0.044, 0.105] });
    mk(new THREE.CylinderGeometry(0.055, 0.06, 0.05, 8), LEATHERP, A, [s * 0.09, 0.095, 0.018]);
    mk(new THREE.TorusGeometry(0.058, 0.011, 5, 9), LEATHER_DP, A, [s * 0.09, 0.12, 0.018], { axis: "z", dir: [0, 1, 0] });
    mk(new THREE.BoxGeometry(0.112, 0.014, 0.2), SOLE, A, [s * 0.09, 0.007, 0.05]);
    mk(new THREE.SphereGeometry(1, 8, 6), LEATHER_DP, toe, [s * 0.09, 0.038, 0.135], { scale: [0.05, 0.034, 0.04] });
    mk(new THREE.BoxGeometry(0.04, 0.01, 0.03), BRASS, A, [s * 0.09, 0.09, 0.085]);
  }

  // ------------------------------------------------------------ arms and hands
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.155, 0.575, 0], [s * 0.37, 0.395, 0.05], [0.15, 0.14], [[0, 0, -1]]);
    const arm = b.chain(`arm${S}`, pts, {
      parent: CH,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    b.sweep(arm, (t) => 0.052 - 0.014 * t + (t > 0.86 ? 0.006 : 0), { sides: 8, smooth: false, color: TUNIC });
    mk(new THREE.SphereGeometry(0.064, 8, 6), TUNIC, arm.joints[0], [s * 0.155, 0.575, 0]);
    const wrist = arm.tip!;
    const wristP = vec(pts[2]);
    const dir = wristP.clone().sub(vec(pts[1])).normalize();
    mk(new THREE.TorusGeometry(0.047, 0.011, 5, 9), LEATHER_DP, arm.joints[1], wristP.clone().addScaledVector(dir, -0.022).toArray(), {
      axis: "z",
      dir: dir.toArray(),
    });
    mk(new THREE.TorusGeometry(0.049, 0.004, 4, 9), BRASS, arm.joints[1], wristP.clone().addScaledVector(dir, -0.005).toArray(), {
      axis: "z",
      dir: dir.toArray(),
    });
    const spr = V(0, 0, 1);
    spr.addScaledVector(dir, -spr.dot(dir)).normalize();
    const palm = wristP.clone().addScaledVector(dir, 0.034);
    mk(new THREE.SphereGeometry(0.045, 8, 6), SKIN, wrist, palm.toArray(), { scale: [1, 1, 0.8] });
    const fing: [string, number, number][] = [
      ["index", 0.026, 0.036],
      ["middle", 0.009, 0.04],
      ["ring", -0.009, 0.036],
      ["pinky", -0.026, 0.028],
    ];
    for (const [nm, off, len] of fing) {
      const p0 = palm.clone().addScaledVector(dir, 0.03).addScaledVector(spr, off);
      const p1 = p0.clone().addScaledVector(dir, len).addScaledVector(spr, off * 0.25);
      const p2 = p1.clone().addScaledVector(dir, len * 0.85).addScaledVector(spr, off * 0.25);
      const fc = b.chain(`${nm}${S}`, [p0, p1, p2], { parent: wrist, names: [`${nm}${S}1`, `${nm}${S}2`], role: "digit" });
      b.sweep(fc, [0.0125, 0.0085], { sides: 6, smooth: false, color: SKIN });
    }
    const t0 = wristP.clone().addScaledVector(dir, 0.02).addScaledVector(spr, 0.036);
    const td = dir.clone().multiplyScalar(0.55).addScaledVector(spr, 0.85).normalize();
    const t1 = t0.clone().addScaledVector(td, 0.032);
    const t2 = t1.clone().addScaledVector(td, 0.028);
    const th = b.chain(`thumb${S}`, [t0, t1, t2], { parent: wrist, names: [`thumb${S}1`, `thumb${S}2`], role: "digit" });
    b.sweep(th, [0.015, 0.01], { sides: 6, smooth: false, color: SKIN });
  }

  // ------------------------------------------------------------ head
  const R = 0.12;
  const HC = V(0, 0.745, 0.01);
  const hz = (x: number, y: number, lift = 0) => HC.z + Math.sqrt(Math.max(R * R - x * x - (y - HC.y) ** 2, 0.0004)) + lift;
  const CUT = 0.712;
  const TH = Math.acos((CUT - HC.y) / R);
  const skull = mk(new THREE.SphereGeometry(R, 12, 7, 0, Math.PI * 2, 0, TH), SKINP, head, HC.toArray(), { flat: true });
  mk(new THREE.SphereGeometry(R, 12, 4, 0, Math.PI * 2, TH, Math.PI - TH), SKINP, jaw, HC.toArray(), { flat: true });
  const rc = R * Math.sin(TH) * 0.98;
  mk(new THREE.CircleGeometry(rc, 12), MOUTH, head, [0, CUT, HC.z], { axis: "z", dir: [0, -1, 0] });
  mk(new THREE.CircleGeometry(rc, 12), MOUTH, jaw, [0, CUT - 0.002, HC.z], { axis: "z", dir: [0, 1, 0] });
  mk(new THREE.SphereGeometry(1, 7, 4), TONGUE, jaw, [0, CUT - 0.014, 0.06], { scale: [0.04, 0.012, 0.046] });

  for (const s of [1, -1]) {
    b.decal(skull, EYE, { at: [s * 0.05, 0.775, hz(0.05, 0.775, 0.004)], dir: [0, 0, 1], size: [0.046, 0.046], segments: 6 });
    // brows
    b.sweep(
      catmull([
        [s * 0.018, 0.798, hz(0.018, 0.798, 0.012)],
        [s * 0.05, 0.81, hz(0.05, 0.81, 0.014)],
        [s * 0.085, 0.798, hz(0.085, 0.798, 0.012)],
        [s * 0.102, 0.784, hz(0.102, 0.784, 0.008)],
      ]),
      [0.014, 0.018, 0.014, 0.004],
      { bone: head, color: WHITE, sides: 6, smooth: false, caps: "point" },
    );
    // mustache
    b.sweep(
      catmull([
        [s * 0.014, 0.708, hz(0.014, 0.708, 0.02)],
        [s * 0.05, 0.696, hz(0.05, 0.696, 0.02)],
        [s * 0.092, 0.688, hz(0.092, 0.688, 0.02)],
        [s * 0.112, 0.712, 0.045],
      ]),
      [0.03, 0.034, 0.028, 0.012],
      { bone: head, color: BEARDP, sides: 7, smooth: false, caps: "point" },
    );
    // sideburns
    b.sweep(
      catmull([
        [s * 0.112, 0.8, 0.02],
        [s * 0.116, 0.75, 0.045],
        [s * 0.1, 0.705, 0.07],
        [s * 0.07, 0.69, 0.095],
      ]),
      [0.022, 0.028, 0.026, 0.016],
      { bone: head, color: BEARDP, sides: 6, smooth: false },
    );
    // cheeks and ears
    mk(new THREE.SphereGeometry(0.03, 7, 5), BLUSH, head, [s * 0.075, 0.726, hz(0.075, 0.726, -0.004)]);
    b.spike([s * 0.112, 0.755, 0.0], [s * 0.8, 0.35, -0.45], 0.12, 0.042, { bone: head, color: SKIN, sides: 7 });
    b.spike([s * 0.118, 0.752, 0.012], [s * 0.8, 0.35, -0.45], 0.085, 0.026, { bone: head, color: NOSE, sides: 6 });
  }
  mk(new THREE.SphereGeometry(0.042, 8, 6), NOSE, head, [0, 0.728, hz(0, 0.728, 0.012)], { flat: true });
  mk(new THREE.SphereGeometry(0.012, 5, 4), "#f5a58f", head, [-0.014, 0.738, hz(0, 0.728, 0.044)]);

  // ------------------------------------------------------------ beard (signature)
  const bp = catmull([
    [0, 0.715, 0.07],
    [0, 0.64, 0.13],
    [0, 0.56, 0.175],
    [0, 0.48, 0.195],
    [0, 0.41, 0.195],
  ]);
  const rxF = (t: number) => 0.11 - 0.09 * t;
  const ryF = (t: number) => 0.055 - 0.02 * t;
  const beard = b.sweep(bp, (t) => [rxF(t), ryF(t)], { bone: jaw, color: BEARDP, sides: 8, smooth: false });
  const Xv = V(1, 0, 0);
  const lock = (t: number, xo: number, len: number, w: number, ang: number, col: string, lift: number) => {
    const c = vec(bp.at(t));
    const U = vec(bp.tangentAt(t)).normalize().negate();
    const nrm = Xv.clone().cross(U).normalize();
    const k = Math.sqrt(Math.max(0.05, 1 - (xo / rxF(t)) ** 2));
    const pos = c.clone().addScaledVector(Xv, xo).addScaledVector(nrm, ryF(t) * k + lift);
    const yv = U.clone().applyAxisAngle(nrm, ang);
    const xv = yv.clone().cross(nrm).normalize();
    b.extrude(
      [
        [-w, 0],
        [w, 0],
        [w * 0.7, -len * 0.55],
        [0, -len, "sharp"],
        [-w * 0.7, -len * 0.55],
      ],
      { at: pos, x: xv, y: yv, thickness: 0.016, bevel: 0.004, color: col, bone: jaw },
    );
  };
  const rows: [number, number[], number][] = [
    [0.1, [-0.065, 0, 0.065], 0.12],
    [0.27, [-0.07, -0.03, 0.03, 0.07], 0.12],
    [0.45, [-0.05, 0, 0.05], 0.12],
    [0.62, [-0.035, 0.035], 0.1],
    [0.82, [0], 0.09],
  ];
  rows.forEach(([t, xs, len], ri) =>
    xs.forEach((xo, i) => lock(t, xo, len, Math.max(0.014, rxF(t) * 0.42), -xo * 4, (ri + i) % 2 ? WHITE : CREAM, ri * 0.003)),
  );
  const bh = b.surface(beard).scatter(26, { rng: rng(5), minDist: 0.035, filter: (h) => h.n.z > -0.2 });
  b.cards(bh, WISP, { size: [0.045, 0.085], lean: 75, flow: [0, -1, 0.2], bend: 25, vary: 0.3, rng: rng(6), bone: jaw });

  // ------------------------------------------------------------ hat (signature)
  const hatPath = catmull([
    [0, 0.85, 0],
    [0, 0.97, -0.005],
    [0, 1.08, -0.03],
    [0, 1.17, -0.09],
    [0, 1.21, -0.17],
    [0, 1.19, -0.25],
    [0, 1.13, -0.3],
  ]);
  const hat = b.sweep(hatPath, [0.152, 0.135, 0.11, 0.082, 0.056, 0.034, 0.012], {
    bone: head,
    color: HATP,
    sides: 10,
    smooth: false,
    caps: "point",
  });
  b.lathe(
    [
      [0.13, 0],
      [0.172, 0],
      [0.168, 0.06],
      [0.135, 0.06],
    ],
    { at: [0, 0.825, 0], segments: 12, color: LEATHERP, bone: head, name: "hatCuff" },
  );
  b.ring(frame([0, 0.855, 0], [0, 1, 0]), { count: 12, radius: 0.168 }, (it) =>
    b.stick(new THREE.SphereGeometry(0.009, 5, 4), BRASS, it, { bone: head, embed: 0.4 }),
  );
  const tip = vec(hatPath.at(1));
  mk(new THREE.SphereGeometry(0.026, 7, 5), GILT, head, [tip.x, tip.y - 0.016, tip.z - 0.02]);
  mk(new THREE.TorusGeometry(0.012, 0.004, 4, 7), GILT, head, [tip.x, tip.y + 0.003, tip.z - 0.008], { axis: "z", dir: [1, 0, 0] });
  const hhit = b.surface(hat).ray([0, 1.02, 1], [0, 0, -1]);
  if (hhit) b.decal(hat, EMBLEM, { at: hhit, size: [0.1, 0.1] });
  // goggles
  const ring: number[][] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ring.push([Math.sin(a) * 0.143, 0.925, Math.cos(a) * 0.143]);
  }
  b.sweep(catmull(ring, { closed: true }), 0.008, { bone: head, color: LEATHER_DP, sides: 6 });
  for (const s of [1, -1]) {
    const gd = V(s * 0.25, 0.3, 1).normalize();
    const gc = V(s * 0.055, 0.925, 0.143);
    mk(new THREE.CylinderGeometry(0.04, 0.042, 0.026, 10), IRON, head, gc.toArray(), { dir: gd.toArray() });
    mk(new THREE.TorusGeometry(0.039, 0.006, 5, 10), GILT, head, gc.clone().addScaledVector(gd, 0.013).toArray(), {
      axis: "z",
      dir: gd.toArray(),
    });
    glow(
      mk(new THREE.CircleGeometry(0.034, 12), "#ffffff", head, gc.clone().addScaledVector(gd, 0.0145).toArray(), {
        axis: "z",
        dir: gd.toArray(),
        texture: LENS,
      }),
      1.2,
    );
  }
  b.rod([-0.02, 0.928, 0.145], [0.02, 0.928, 0.145], 0.007, BRASS, { bone: head, sides: 5 });

  // ------------------------------------------------------------ backpack of gadgets
  const pack = b.joint("pack", { parent: CH, at: [0, 0.46, -0.21], dir: [0, 1, 0] });
  mk(new THREE.BoxGeometry(0.3, 0.34, 0.14), CANVAS, pack, [0, 0.46, -0.21]);
  mk(new THREE.BoxGeometry(0.32, 0.05, 0.16), LEATHER_DP, pack, [0, 0.655, -0.21]);
  mk(new THREE.BoxGeometry(0.31, 0.02, 0.15), LEATHER_DP, pack, [0, 0.295, -0.21]);
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.rod([sx * 0.15, 0.29, -0.21 + sz * 0.07], [sx * 0.15, 0.63, -0.21 + sz * 0.07], 0.008, BRASS, { bone: pack, sides: 6 });
  mk(new THREE.BoxGeometry(0.27, 0.3, 0.01), PLATE, pack, [0, 0.46, -0.283]);
  for (const s of [1, -1]) {
    mk(new THREE.BoxGeometry(0.028, 0.34, 0.006), LEATHERP, pack, [s * 0.138, 0.46, -0.2885]);
    mk(new THREE.BoxGeometry(0.036, 0.024, 0.01), BRASS, pack, [s * 0.138, 0.56, -0.291]);
  }
  mk(new THREE.PlaneGeometry(0.12, 0.04), "#ffffff", pack, [0, 0.655, -0.2915], { axis: "z", dir: [0, 0, -1], texture: PATCH });
  gearTrain(b, {
    at: [0, 0.45, -0.292],
    axis: [0, 0, -1],
    module: 0.005,
    spin: "gearJoint",
    bone: pack,
    gears: [
      { teeth: 22, spokes: 5, bore: 0.005 },
      { teeth: 12, angle: 68 },
      { teeth: 14, from: 0, angle: -105 },
      { teeth: 18, on: 1, shift: 0.012, spokes: 4 },
    ],
  });

  // copper steam tank with gauge (left side)
  mk(new THREE.CylinderGeometry(0.055, 0.055, 0.24, 10), TANK, pack, [0.205, 0.43, -0.21]);
  mk(new THREE.SphereGeometry(0.055, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2), TANK, pack, [0.205, 0.55, -0.21]);
  for (const y of [0.35, 0.51]) {
    mk(new THREE.TorusGeometry(0.057, 0.007, 5, 10), BRASS, pack, [0.205, y, -0.21], { axis: "z", dir: [0, 1, 0] });
    b.rod([0.15, y, -0.21], [0.205, y, -0.21], 0.006, BRASS, { bone: pack, sides: 5 });
  }
  mk(new THREE.CylinderGeometry(0.012, 0.016, 0.03, 6), BRASS, pack, [0.205, 0.595, -0.21]);
  mk(new THREE.TorusGeometry(0.022, 0.004, 4, 8), "#d6402f", pack, [0.205, 0.615, -0.21], { axis: "z", dir: [0, 1, 0] });
  mk(new THREE.CylinderGeometry(0.04, 0.04, 0.014, 12), BRASS, pack, [0.262, 0.43, -0.21], { dir: [1, 0, 0] });
  mk(new THREE.CircleGeometry(0.034, 16), "#ffffff", pack, [0.2695, 0.43, -0.21], { axis: "z", dir: [1, 0, 0], texture: GAUGE });
  b.sweep(coil([0.19, 0.6, -0.27], [0.06, 0.675, -0.27], 0.02, 7), 0.0045, { bone: pack, color: COPPER_V, sides: 5 });

  // bedroll
  mk(new THREE.CylinderGeometry(0.055, 0.055, 0.36, 10), BEDROLL, pack, [0, 0.255, -0.27], { dir: [1, 0, 0] });
  for (const x of [-0.1, 0.1])
    mk(new THREE.TorusGeometry(0.057, 0.007, 4, 10), LEATHER_DP, pack, [x, 0.255, -0.27], { axis: "z", dir: [1, 0, 0] });

  // telescope (right side)
  {
    const A = V(-0.18, 0.31, -0.21);
    const d = V(-0.06, 0.94, -0.34).normalize();
    const P1 = A.clone().addScaledVector(d, 0.24);
    const P2 = P1.clone().addScaledVector(d, 0.2);
    const P3 = P2.clone().addScaledVector(d, 0.16);
    b.rod(A.toArray(), P1.toArray(), 0.034, LEATHERP, { bone: pack, sides: 8 });
    b.rod(P1.toArray(), P2.toArray(), 0.027, BRASS, { bone: pack, sides: 8 });
    b.rod(P2.toArray(), P3.toArray(), 0.021, GILT, { bone: pack, sides: 8 });
    for (const [pt, r] of [
      [P1, 0.036],
      [P2, 0.029],
      [P3, 0.023],
    ] as [THREE.Vector3, number][])
      mk(new THREE.TorusGeometry(r, 0.006, 4, 8), IRON, pack, pt.toArray(), { axis: "z", dir: d.toArray() });
    glow(
      mk(new THREE.CircleGeometry(0.019, 10), "#ffffff", pack, P3.clone().addScaledVector(d, 0.002).toArray(), {
        axis: "z",
        dir: d.toArray(),
        texture: LENS,
      }),
      1.1,
    );
    for (const f of [0.06, 0.18]) {
      const c = A.clone().addScaledVector(d, f);
      mk(new THREE.TorusGeometry(0.038, 0.006, 4, 9), LEATHER_DP, pack, c.toArray(), { axis: "z", dir: d.toArray() });
      b.rod([-0.15, c.y, -0.2], c.toArray(), 0.006, LEATHER_DP, { bone: pack, sides: 5 });
    }
  }

  // rotor on a mast
  b.rod([-0.09, 0.68, -0.27], [-0.09, 0.85, -0.27], 0.008, BRASS, { bone: pack, sides: 6 });
  const rotor = b.joint("rotor", { parent: pack, at: [-0.09, 0.852, -0.27], dir: [0, 1, 0], role: "fan" });
  mk(new THREE.SphereGeometry(0.02, 8, 5), GILT, rotor, [-0.09, 0.855, -0.27]);
  for (const s of [1, -1])
    b.extrude(
      [
        [0.01, -0.016],
        [0.08, -0.022],
        [0.15, -0.012],
        [0.16, 0.004],
        [0.08, 0.018],
        [0.01, 0.016],
      ],
      { at: [-0.09, 0.852, -0.27], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.006, smoothing: 1, color: BRASS, bone: rotor },
    );

  // glowing jar
  mk(new THREE.CylinderGeometry(0.034, 0.034, 0.075, 8), "#ffffff", pack, [0.08, 0.7175, -0.19]);
  glow(mk(new THREE.CylinderGeometry(0.03, 0.03, 0.07, 8), GREEN_G, pack, [0.08, 0.7175, -0.19]), 1.3);
  mk(new THREE.TorusGeometry(0.034, 0.005, 4, 8), BRASS, pack, [0.08, 0.683, -0.19], { axis: "z", dir: [0, 1, 0] });
  mk(new THREE.TorusGeometry(0.034, 0.005, 4, 8), BRASS, pack, [0.08, 0.752, -0.19], { axis: "z", dir: [0, 1, 0] });
  mk(new THREE.CylinderGeometry(0.026, 0.03, 0.022, 7), "#b98a5a", pack, [0.08, 0.766, -0.19]);

  // lantern on a staff
  b.sweep(
    catmull([
      [0.14, 0.68, -0.25],
      [0.16, 0.8, -0.265],
      [0.18, 0.93, -0.24],
      [0.205, 0.985, -0.18],
      [0.225, 0.985, -0.13],
    ]),
    0.008,
    { bone: pack, color: IRON, sides: 6 },
  );
  mk(new THREE.TorusGeometry(0.014, 0.0035, 4, 8), BRASS, pack, [0.225, 0.968, -0.13], { axis: "z", dir: [1, 0, 0] });
  glow(mk(new THREE.CylinderGeometry(0.026, 0.03, 0.07, 6), AMBER, pack, [0.225, 0.89, -0.13]), 1.2);
  mk(new THREE.CylinderGeometry(0.034, 0.034, 0.012, 6), IRON, pack, [0.225, 0.849, -0.13]);
  mk(new THREE.ConeGeometry(0.038, 0.03, 6), IRON, pack, [0.225, 0.941, -0.13]);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    mk(new THREE.CylinderGeometry(0.0035, 0.0035, 0.076, 4), BRASS, pack, [0.225 + Math.sin(a) * 0.029, 0.893, -0.13 + Math.cos(a) * 0.029]);
  }

  // ------------------------------------------------------------ base and story props
  const base = b.lathe(
    [
      [0, -0.022],
      [0.58, -0.022],
      [0.6, -0.01],
      [0.6, 0.012],
      [0.55, 0.012],
      [0.52, 0],
      [0, 0],
    ],
    { at: [0, 0, 0], segments: 20, color: COBBLE, bone: hips, name: "base" },
  );
  b.decal(base, FLOOR, { at: [0, 0, 0], dir: [0, 1, 0], up: [0, 0, -1], size: [0.9, 0.9], segments: 16 });
  const gh = b
    .surface(base)
    .scatter(70, {
      rng: rng(12),
      minDist: 0.04,
      filter: (h) => Math.hypot(h.at.x, h.at.z) > 0.4 && h.n.y > 0.8 && !(h.at.z > 0.25 && Math.abs(h.at.x) < 0.3),
    });
  b.cards(gh, GRASS, { size: [0.04, 0.08], vary: 0.3, bend: 12, cross: true, rng: rng(13), bone: hips });

  // toadstools (back right)
  const shroom = (x: number, z: number, h: number, r: number, cap: ColorIn, glows = false) => {
    mk(new THREE.CylinderGeometry(r * 0.3, r * 0.4, h, 7), STEM, hips, [x, h / 2, z]);
    const k = r / 0.06;
    const cp = b.lathe(
      [
        [0, 0],
        [r, 0],
        [r * 0.96, 0.012 * k],
        [r * 0.72, 0.05 * k],
        [r * 0.36, 0.078 * k],
        [0, 0.088 * k],
      ],
      { at: [x, h - 0.005, z], segments: 9, color: cap, bone: hips },
    );
    if (glows) glow(cp, 1.3);
  };
  const CAPP = lit(spots("#d83a35", "#fff2dc", { size: 0.032, amount: 0.55, seed: 3 }));
  shroom(-0.4, -0.28, 0.1, 0.07, CAPP);
  shroom(-0.5, -0.2, 0.065, 0.045, CAPP);
  shroom(-0.33, -0.36, 0.05, 0.035, "#6fd6ff", true);

  // crate with blueprint (back left)
  mk(new THREE.BoxGeometry(0.2, 0.15, 0.16), CRATE, hips, [0.38, 0.075, -0.26]);
  mk(new THREE.BoxGeometry(0.17, 0.004, 0.12), "#ffffff", hips, [0.38, 0.152, -0.26], { texture: BLUEPRINT });
  for (const s of [1, -1])
    mk(new THREE.CylinderGeometry(0.011, 0.011, 0.125, 6), CREAM, hips, [0.38 + s * 0.088, 0.158, -0.26], { dir: [0, 0, 1] });
  b.rod([0.33, 0.16, -0.2], [0.43, 0.16, -0.19], 0.007, WOOD_B, { bone: hips, sides: 6 });
  mk(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 7), IRON, hips, [0.44, 0.165, -0.19], { dir: [1, 0, 0] });

  // loose cogs
  for (const [x, z, t, m] of [
    [-0.3, 0.31, 16, 0.008],
    [-0.4, 0.2, 11, 0.007],
  ] as [number, number, number, number][])
    b.part(gearGeometry({ teeth: t, module: m, bore: m, spokes: t > 12 ? 5 : 0 }), BRASS, {
      bone: hips,
      at: [x, m, z],
      dir: [0, 1, 0],
    } as any);

  // clockwork beetle (front left)
  {
    const bx = 0.34;
    const bz = 0.3;
    mk(new THREE.SphereGeometry(1, 8, 6), BRASS, hips, [bx, 0.04, bz], { scale: [0.036, 0.022, 0.05] });
    mk(new THREE.SphereGeometry(1, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), COPPER_V, hips, [bx, 0.045, bz - 0.004], {
      scale: [0.04, 0.03, 0.05],
    });
    mk(new THREE.SphereGeometry(0.02, 7, 5), BRASS, hips, [bx, 0.04, bz + 0.055]);
    for (const s of [1, -1]) {
      glow(mk(new THREE.SphereGeometry(0.006, 5, 4), CYAN_G, hips, [bx + s * 0.011, 0.047, bz + 0.07]), 1.5);
      b.rod([bx + s * 0.008, 0.055, bz + 0.07], [bx + s * 0.02, 0.085, bz + 0.095], 0.0022, IRON, { bone: hips, sides: 4 });
      for (const i of [-1, 0, 1])
        b.rod([bx + s * 0.03, 0.035, bz + i * 0.03], [bx + s * 0.055, 0.004, bz + i * 0.04], 0.0045, BRASS, { bone: hips, sides: 5 });
    }
    b.rod([bx, 0.062, bz - 0.01], [bx, 0.088, bz - 0.01], 0.003, IRON, { bone: hips, sides: 5 });
    b.extrude(
      [
        [0, 0],
        [0.02, 0.012],
        [0.02, 0.03],
        [0.004, 0.034],
        [0, 0.026],
        [-0.004, 0.034],
        [-0.02, 0.03],
        [-0.02, 0.012],
      ],
      { at: [bx, 0.082, bz - 0.01], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.006, color: GILT, bone: hips },
    );
  }

  return b.root;
}
