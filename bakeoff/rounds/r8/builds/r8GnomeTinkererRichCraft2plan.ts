import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  limb,
  paint,
  mix,
  smoothstep,
  noise,
  mottle,
  grain,
  countershade,
  stripes,
  spots,
  gradient,
  svg,
} from "../../../../src/index";
import { gearTrain, gearGeometry, gearSize, gearTexture, gaugeTexture, metal, coil, TINT } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gnome Tinkerer",
  description:
    "A whimsical low-poly gnome tinkerer: floppy red goggled hat, braided white beard, and a huge backpack of gadgets (boiler, funnel, gear train, gauge, vials, coil, lantern) on a mossy workshop plank.",
};

type V3 = [number, number, number];

// ---------------------------------------------------------------- scale constants
const G = 0.05; // top of the base plank = the floor the gnome stands on
const HIP_Y = G + 0.25;
const NECK_Y = G + 0.5;
const HY = 0.68; // head centre height
const H = 1.0; // head scale
const HA = 1.0; // hand scale
const PZ = -0.205; // backpack centre depth

// ---------------------------------------------------------------- flat colours
const INK = "#2a1a14";
const CREAM = "#f3ead2";
const LEATHER_D = "#5a361b";
const PINK = "#f08f86";
const NOSE_C = "#e2776a";
const BRASS_F = "#c9964a";
const DARK = "#241812";
const STEEL_F = "#aab4c4";
const ORANGE = "#e8642a";
const CORK = "#a8743c";
const SMOKE = "#d9d9de";

// ---------------------------------------------------------------- paints
const BRASS = metal("brass");
const COPPER = metal("copper", { verdigris: 0.45 });
const BLUED = metal("blued");
const IRON = metal("iron");
const GILT = metal("gilt");
const SKIN = mottle("#f0b394", "#e8a183", { size: 0.06, contrast: 0.8 });
const SKIN_HEAD = paint((p, n) => {
  const d = Math.hypot((Math.abs(p.x) - 0.056) / 0.032, (p.y - (HY - 0.03)) / 0.026);
  return d < 1 && n.z > 0.2 ? PINK : SKIN;
});
const HAT_P = paint((_p, n, s) => {
  const fold = 0.5 + 0.5 * Math.sin(s[1] * 0.07 + s[0] * 9);
  const base = mix("#c42f2b", "#e5553a", fold * 0.55);
  const cool = mix(base, "#74203a", smoothstep(0.25, -0.7, n.y) * 0.6);
  return mix(cool, "#ffcf8a", smoothstep(0.3, 1, n.y) * 0.14);
});
const TUNIC_P = countershade(mottle("#6aa043", "#5a9038", { size: 0.03 }), "#3f7a3a", { level: -0.15 });
const CUFF_P = stripes("#ecdca4", "#b5472f", { size: 0.014, axis: "y", width: 0.5 });
const TROUSER_P = countershade(mottle("#8a6a46", "#78593a", { size: 0.04 }), "#5a4128", { level: -0.2 });
const BOOT_P = gradient("#5b3a22", "#8a7650", [0, G + 0.12, 0], [0, G + 0.004, 0]);
const LEATHER = grain("#8a5530", "#6a3c20", { size: 0.012, axis: "y" });
const BEARD_P = paint((_p, _n, s) => mix("#fcf7e8", "#b4bccb", smoothstep(0.0, 0.14, s[1])));
const BEARD_W = grain("#fbf6e8", "#d6d9de", { size: 0.01, axis: "x" });
const MOSS = mottle("#62923c", "#4a7a2c", { size: 0.02 });
const WOOD = grain("#a9763e", "#7f5428", { size: 0.012, axis: "x" });
const WOOD_F = grain("#9a6a38", "#7a5026", { size: 0.02, axis: "x" });
const FLOOR = paint((p, n) => {
  if (n.y > 0.5) {
    const r = Math.hypot(p.x, p.z + 0.05);
    const f = ((((p.z + 0.05) / 0.11) % 1) + 1) % 1;
    if (f < 0.035) return "#3a2412";
    if (r > 0.372 && noise(p, 0.05, 3) > 0.42) return MOSS;
    return WOOD_F;
  }
  return "#5a3c1e";
});
const CAP_P = spots("#d83a34", "#fff3df", { size: 0.022, amount: 0.55, seed: 4 });

// ---------------------------------------------------------------- drawings
function gearPath(cx: number, cy: number, ro: number, ri: number, n: number) {
  let d = "";
  const step = (Math.PI * 2) / n;
  for (let i = 0; i < n; i++) {
    for (const [o, r] of [[-0.3, ri], [-0.16, ro], [0.16, ro], [0.3, ri]] as const) {
      const a = (i + o) * step;
      d += `${d ? "L" : "M"}${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`;
    }
  }
  return d + "Z";
}

const EYE = svg(
  `<svg viewBox="0 0 60 64" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="30" cy="34" rx="26" ry="29" fill="#2b1a14"/>
  <ellipse cx="30" cy="34" rx="22.5" ry="25.5" fill="#fffaf0"/>
  <circle cx="32" cy="38" r="15.5" fill="#5b9a3c"/>
  <circle cx="32" cy="38" r="15.5" fill="none" stroke="#2f5a22" stroke-width="3"/>
  <circle cx="32" cy="38" r="8" fill="#1a1210"/>
  <circle cx="25" cy="30" r="6" fill="#ffffff"/>
  <circle cx="39" cy="46" r="2.6" fill="#ffffff"/>
  <path d="M7 24 Q30 4 53 24" stroke="#2b1a14" stroke-width="5" fill="none" stroke-linecap="round"/>
</svg>`,
  { size: 128 },
);

const BADGE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="3" width="58" height="58" rx="10" fill="#e9d9a6" stroke="#6b4a22" stroke-width="3"/>
  <rect x="8" y="8" width="48" height="48" rx="7" fill="none" stroke="#a9833f" stroke-width="2" stroke-dasharray="4 3"/>
  <path d="${gearPath(32, 32, 19, 14, 9)}" fill="#c9964a" stroke="#4a3014" stroke-width="2.5" stroke-linejoin="round"/>
  <circle cx="32" cy="32" r="6.5" fill="#e9d9a6" stroke="#4a3014" stroke-width="2.5"/>
</svg>`,
  { size: 128 },
);

const PATCH = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="56" height="56" rx="4" fill="#3a6aa8" stroke="#1e3a66" stroke-width="3"/>
  <path d="M12 12 L52 52 M52 12 L12 52" stroke="#e9d9a6" stroke-width="4" stroke-linecap="round" stroke-dasharray="5 6"/>
  <rect x="8" y="8" width="48" height="48" fill="none" stroke="#e9d9a6" stroke-width="2" stroke-dasharray="3 3"/>
</svg>`,
  { size: 96 },
);

const APRON = svg(
  `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 4 L68 4 L70 38 L92 50 L96 124 L4 124 L8 50 L30 38Z" fill="#e6d9b8" stroke="#8a7650" stroke-width="3" stroke-linejoin="round"/>
  <path d="M36 12 L64 12" stroke="#8a7650" stroke-width="2" stroke-dasharray="3 3"/>
  <rect x="6" y="60" width="24" height="32" rx="3" fill="#d9c9a0" stroke="#8a7650" stroke-width="2.5"/>
  <rect x="70" y="60" width="24" height="32" rx="3" fill="#d9c9a0" stroke="#8a7650" stroke-width="2.5"/>
  <path d="M9 64 H27 M73 64 H91" stroke="#8a7650" stroke-width="1.6" stroke-dasharray="3 2.5"/>
  <path d="${gearPath(50, 24, 8, 5.8, 7)}" fill="#c9964a" stroke="#6b4a22" stroke-width="1.5" stroke-linejoin="round"/>
  <ellipse cx="22" cy="106" rx="11" ry="6" fill="#bfae86"/>
  <ellipse cx="74" cy="112" rx="14" ry="6" fill="#a89a78"/>
  <ellipse cx="50" cy="118" rx="18" ry="4" fill="#c9bc98"/>
  <ellipse cx="82" cy="78" rx="5" ry="7" fill="#7a6a4a"/>
  <path d="M8 120 H92" stroke="#8a7650" stroke-width="2" stroke-dasharray="4 3"/>
</svg>`,
  { size: 192 },
);

const RUNE = svg(
  `<svg viewBox="0 0 80 40" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="76" height="36" rx="6" fill="#b7893f" stroke="#4a3014" stroke-width="3"/>
  <rect x="7" y="7" width="66" height="26" rx="3" fill="#8a6428"/>
  <g stroke="#2a1a0a" stroke-width="3" stroke-linecap="round" fill="none">
    <path d="M14 12 V28 M14 20 L22 12 M14 20 L22 28"/>
    <path d="M30 12 L38 28 L46 12"/>
    <path d="M52 12 V28 M52 12 H60 M52 20 H58"/>
    <path d="M66 14 L66 28 M62 20 H70"/>
  </g>
</svg>`,
  { size: 128 },
);

const LABEL = svg(
  `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="60" height="44" rx="5" fill="#f1e4b8" stroke="#6b4a22" stroke-width="3"/>
  <text x="32" y="32" text-anchor="middle" font-family="serif" font-weight="bold" font-size="22" fill="#b3261e">OIL</text>
  <path d="M10 38 H54" stroke="#6b4a22" stroke-width="2"/>
</svg>`,
  { size: 128 },
);

const BLUEPRINT = svg(
  `<svg viewBox="0 0 140 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="138" height="98" fill="#2b5a96" stroke="#e8f0ff" stroke-width="2"/>
  <g stroke="#e8f0ff" stroke-width="1.6" fill="none" stroke-linecap="round">
    <path d="${gearPath(40, 50, 26, 20, 12)}"/>
    <circle cx="40" cy="50" r="8"/>
    <path d="${gearPath(88, 36, 15, 11, 8)}"/>
    <path d="M10 90 H130 M100 60 H130 M100 68 H125 M100 76 H128"/>
    <path d="M60 50 L74 40" stroke-dasharray="3 3"/>
  </g>
</svg>`,
  { size: 192 },
);

const GAUGE = gaugeTexture({ needle: 60 });
const COGTEX = gearTexture({ teeth: 14, module: 0.004, spokes: 4, bore: 0.004 });
const COGSIDE = gearSize({ teeth: 14, module: 0.004, spokes: 4, bore: 0.004 }).plane;

// ---------------------------------------------------------------- helpers
const sph = (w = 10, h = 7) => new THREE.SphereGeometry(1, w, h);
const cyl = (r0: number, r1: number, h: number, s = 10) => new THREE.CylinderGeometry(r0, r1, h, s);
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

function ringPts(c: V3, r: number, axis: "x" | "y" | "z", n = 14): number[][] {
  const out: number[][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const ca = Math.cos(a) * r;
    const sa = Math.sin(a) * r;
    out.push(axis === "y" ? [c[0] + ca, c[1], c[2] + sa] : axis === "x" ? [c[0], c[1] + ca, c[2] + sa] : [c[0] + ca, c[1] + sa, c[2]]);
  }
  return out;
}

export default function build() {
  const b = createBuilder({ name: "gnome_tinkerer" });
  const R = rng(11);

  // ================================================================ skeleton
  const hips = b.joint("hips", { at: [0, HIP_Y, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    [[0, HIP_Y, 0], [0, 0.42, 0], [0, NECK_Y, 0.01]],
    { parent: hips, role: "spine", names: ["spine1", "spine2"] },
  );
  const chest = spine.joints[1];
  const neck = b.joint("neck", { parent: chest, at: [0, NECK_Y, 0.01], dir: [0, 1, 0.1], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, NECK_Y + 0.05, 0.015], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, HY - 0.045, 0.02], dir: [0, 0, 1], role: "jaw" });

  // ================================================================ torso
  const torso = b.loft(
    [
      { at: [0, 0.27, 0], w: 0.24, h: 0.2 },
      { at: [0, 0.35, 0.005], w: 0.31, h: 0.26 },
      { at: [0, 0.43, 0], w: 0.31, h: 0.24 },
      { at: [0, 0.51, -0.005], w: 0.29, h: 0.19 },
      { at: [0, 0.56, -0.005], w: 0.2, h: 0.14 },
    ],
    { bone: [hips, spine], color: TUNIC_P },
  );
  b.capsule([0, 0.54, 0.01], [0, 0.62, 0.02], 0.05, { bone: neck, color: SKIN });
  const skin = b.surface(torso);

  // belt, buckle, pouches, apron
  b.sweep(skin.loop([0, 0.325, 0], { dir: [0, 1, 0], lift: 0.006 }), 0.017, { color: LEATHER_D });
  const bk = skin.nearest([0, 0.325, 0.3]);
  b.stick(box(0.052, 0.014, 0.042), BRASS, bk, { embed: 0.3 });
  b.stick(box(0.03, 0.016, 0.022), DARK, bk.moved([0, 0.003, 0]), { embed: 0.3 });
  for (const s of [1, -1]) {
    const ph = skin.nearest([s * 0.2, 0.3, 0.06]);
    b.stick(box(0.06, 0.045, 0.06), LEATHER, ph, { embed: 0.35 });
    b.stick(box(0.064, 0.05, 0.022), LEATHER_D, ph.moved([0, 0, 0.03]), { embed: 0.35 });
    b.stick(sph(6, 4), BRASS, ph.moved([0, 0.02, 0.018]), { embed: 0.2, scale: [0.008, 0.008, 0.008] });
  }
  b.decal(torso, APRON, { at: [0, 0.415, 0.14], dir: [0, 0, 1], size: [0.23, 0.286], segments: 14 });

  // shoulder straps carrying the pack
  for (const s of [1, -1]) {
    const strap = skin.drape(
      catmull([
        [s * 0.1, 0.46, -0.14],
        [s * 0.115, 0.585, -0.05],
        [s * 0.1, 0.56, 0.07],
        [s * 0.085, 0.47, 0.125],
        [s * 0.075, 0.37, 0.14],
      ]),
      { lift: 0.007 },
    );
    b.sweep(strap, 0.014, { color: LEATHER_D });
    const sb = skin.nearest([s * 0.075, 0.4, 0.3]);
    b.stick(box(0.03, 0.012, 0.024), BRASS, sb, { embed: 0.3 });
  }

  // ================================================================ legs and boots
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.075, HIP_Y - 0.02, 0], [s * 0.08, G + 0.045, 0.015], [0.1, 0.1], [[0, 0, 1]]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      role: "leg",
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      contact: [s * 0.08, G, 0.04],
    });
    b.sweep(leg, [0.064, 0.056], { color: TROUSER_P });
    const ank = leg.tip!;
    b.part(sph(10, 7), BOOT_P, { bone: ank, at: [s * 0.08, G + 0.055, 0.04], scale: [0.06, 0.055, 0.082] });
    b.part(cyl(0.058, 0.062, 0.075, 10), BOOT_P, { bone: ank, at: [s * 0.08, G + 0.1, 0.005] });
    b.part(cyl(0.067, 0.067, 0.016, 10), LEATHER_D, { bone: ank, at: [s * 0.08, G + 0.14, 0.005] });
    b.part(sph(8, 6), BRASS, { bone: ank, at: [s * 0.08, G + 0.045, 0.108], scale: [0.05, 0.04, 0.034] });
    b.part(box(0.125, 0.012, 0.185), DARK, { bone: ank, at: [s * 0.08, G + 0.006, 0.04] });
    b.part(box(0.03, 0.01, 0.006), BRASS, { bone: ank, at: [s * 0.08, G + 0.14, 0.073] });
  }

  // ================================================================ arms and hands
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const W: V3 = [s * 0.29, 0.31, 0.06];
    const pts = limb([s * 0.16, 0.5, 0], W, [0.125, 0.125], [[0, 0, -1]]);
    const arm = b.chain(`arm${side}`, pts, {
      parent: chest,
      role: "arm",
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
    });
    b.sweep(arm, [0.056, 0.046], {
      color: TUNIC_P,
      bands: [
        [0.82, TUNIC_P],
        [1, CUFF_P],
      ],
    });
    const wr = arm.tip!;
    b.part(sph(9, 7), SKIN, {
      bone: wr,
      at: [W[0], W[1] - 0.028 * HA, W[2] + 0.008],
      scale: [0.037 * HA, 0.043 * HA, 0.03 * HA],
    });
    for (let k = 0; k < 3; k++) {
      const x0 = W[0] + (k - 1) * 0.02 * HA;
      const f = b.chain(
        `finger${side}${k + 1}`,
        [
          [x0, W[1] - 0.05 * HA, W[2] + 0.01],
          [x0 + (k - 1) * 0.008, W[1] - 0.085 * HA, W[2] + 0.022],
          [x0 + (k - 1) * 0.016, W[1] - 0.112 * HA, W[2] + 0.034],
        ],
        { parent: wr, role: "digit", names: [`finger${side}${k + 1}a`, `finger${side}${k + 1}b`] },
      );
      b.sweep(f, [0.0125 * HA, 0.0095 * HA], { color: SKIN });
    }
    const th = b.chain(
      `thumb${side}`,
      [
        [W[0] - s * 0.03, W[1] - 0.02, W[2] + 0.02],
        [W[0] - s * 0.052, W[1] - 0.035, W[2] + 0.04],
        [W[0] - s * 0.066, W[1] - 0.05, W[2] + 0.058],
      ],
      { parent: wr, role: "digit", names: [`thumb${side}a`, `thumb${side}b`] },
    );
    b.sweep(th, [0.0135 * HA, 0.01 * HA], { color: SKIN });

    const gy = W[1] - 0.03;
    if (s > 0) {
      // wrench
      b.rod([W[0], gy, W[2] - 0.06], [W[0], gy, W[2] + 0.2], 0.0085, { bone: wr, color: BLUED });
      b.part(cyl(0.03, 0.03, 0.014, 6), BLUED, { bone: wr, at: [W[0], gy, W[2] + 0.215], dir: [1, 0, 0] });
      b.part(cyl(0.014, 0.014, 0.016, 6), DARK, { bone: wr, at: [W[0], gy, W[2] + 0.222], dir: [1, 0, 0] });
      b.part(sph(6, 4), BLUED, { bone: wr, at: [W[0], gy, W[2] - 0.062], scale: [0.014, 0.014, 0.014] });
    } else {
      // screwdriver
      b.capsule([W[0], gy, W[2] - 0.04], [W[0], gy, W[2] + 0.06], 0.017, { bone: wr, color: ORANGE });
      b.rod([W[0], gy, W[2] + 0.07], [W[0], gy, W[2] + 0.2], 0.0042, { bone: wr, color: STEEL_F });
      b.part(box(0.012, 0.003, 0.012), STEEL_F, { bone: wr, at: [W[0], gy, W[2] + 0.205] });
      b.part(cyl(0.019, 0.019, 0.008, 8), BRASS, { bone: wr, at: [W[0], gy, W[2] + 0.066], dir: [0, 0, 1] });
    }
  }

  // ================================================================ head and face
  const skull = b.part(sph(12, 9), SKIN_HEAD, {
    bone: head,
    at: [0, HY + 0.01 * H, 0.005 * H],
    scale: [0.105 * H, 0.085 * H, 0.098 * H],
  });
  b.part(sph(10, 6), SKIN, { bone: jaw, at: [0, HY - 0.062 * H, 0.03 * H], scale: [0.075 * H, 0.038 * H, 0.07 * H] });
  b.part(sph(8, 5), "#5a1f1f", { bone: head, at: [0, HY - 0.05 * H, 0.07 * H], scale: [0.03 * H, 0.01 * H, 0.02 * H] });
  b.part(sph(9, 7), NOSE_C, { bone: head, at: [0, HY - 0.03 * H, 0.1 * H], scale: [0.034 * H, 0.03 * H, 0.034 * H] });
  b.part(sph(6, 4), "#f6a79c", { bone: head, at: [-0.008 * H, HY - 0.022 * H, 0.131 * H], scale: [0.009, 0.007, 0.006] });
  for (const s of [1, -1]) {
    b.decal(skull, EYE, { at: [s * 0.042 * H, HY - 0.005 * H, 0.1 * H], dir: [0, 0, 1], size: [0.05 * H, 0.056 * H] });
    // bushy brows
    b.capsule([s * 0.015 * H, HY + 0.04 * H, 0.095 * H], [s * 0.068 * H, HY + 0.033 * H, 0.071 * H], [0.012 * H, 0.009 * H], {
      bone: head,
      color: BEARD_W,
    });
    // ears
    const earAt: V3 = [s * 0.09 * H, HY - 0.015 * H, 0];
    b.extrude(
      [[0, -0.032], [0.05, -0.02], [0.105, 0.03, "sharp"], [0.05, 0.045], [0, 0.045]],
      { at: earAt, x: [s, 0, -0.4], y: [0, 1, 0], thickness: 0.014, bevel: 0.003, smoothing: 1, color: SKIN, bone: head },
    );
    b.extrude(
      [[0.012, -0.02], [0.05, -0.012], [0.088, 0.026, "sharp"], [0.048, 0.034], [0.012, 0.034]],
      { at: [earAt[0], earAt[1], earAt[2] + 0.001], x: [s, 0, -0.4], y: [0, 1, 0], thickness: 0.018, smoothing: 1, color: "#f4948c", bone: head },
    );
    // moustache
    b.sweep(
      catmull([
        [s * 0.008, HY - 0.05, 0.118],
        [s * 0.045, HY - 0.065, 0.125],
        [s * 0.085, HY - 0.08, 0.105],
        [s * 0.112, HY - 0.062, 0.085],
      ]),
      [0.026, 0.024, 0.017, 0.008],
      { color: BEARD_W, bone: head, sides: 8 },
    );
  }

  // ================================================================ beard
  for (let r = 0; r < 5; r++) {
    const n = 9 - r;
    const Rx = 0.09 - 0.014 * r;
    const zc = 0.02 + 0.018 * r;
    const Rz = 0.075 - 0.006 * r;
    const yRoot = HY - 0.055 - 0.036 * r;
    const yTip = 0.53 - 0.045 * r;
    const w = 0.052 - 0.002 * r;
    for (let i = 0; i < n; i++) {
      const u = (i / (n - 1)) * 2 - 1;
      const phi = (u * 78 * Math.PI) / 180;
      const x = Rx * Math.sin(phi);
      const z = zc + Rz * Math.cos(phi);
      const L = (yRoot - yTip) * (1 - 0.38 * Math.pow(Math.abs(u), 1.6)) * (0.94 + 0.12 * R());
      const xd = new THREE.Vector3(Rx * Math.cos(phi), 0, -Rz * Math.sin(phi)).normalize();
      b.extrude(
        [
          [-w * 0.4, 0],
          [w * 0.4, 0],
          [w * 0.5, L * 0.2],
          [w * 0.42, L * 0.62],
          [0, L, "sharp"],
          [-w * 0.42, L * 0.62],
          [-w * 0.5, L * 0.2],
        ],
        {
          at: [x, yRoot, z],
          x: [xd.x, xd.y, xd.z],
          y: [-Math.sin(phi) * 0.1, -1, 0.3],
          thickness: 0.012,
          bevel: 0.003,
          smoothing: 1,
          color: BEARD_P,
          bone: jaw,
        },
      );
    }
  }
  // braids with brass beads
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const braid = b.chain(
      `braid${side}`,
      catmull([[s * 0.1, 0.62, 0.03], [s * 0.115, 0.52, 0.1], [s * 0.115, 0.44, 0.14], [s * 0.11, 0.37, 0.16]]),
      { parent: head, role: "tail", names: [`braid${side}1`, `braid${side}2`, `braid${side}3`] },
    );
    let j = 0;
    b.along(braid, 8, (at) => {
      const odd = j++ % 2 === 1;
      b.part(sph(7, 5), odd ? "#c3c8d2" : "#f6f0e0", {
        frame: at,
        scale: odd ? [0.024, 0.021, 0.016] : [0.016, 0.021, 0.024],
      });
    });
    const tip = braid.at(1).at;
    b.part(sph(7, 5), BRASS, { bone: braid.joints[2], at: [tip.x, tip.y - 0.012, tip.z + 0.004], scale: [0.016, 0.016, 0.016] });
    b.part(cyl(0.012, 0.012, 0.012, 8), ORANGE, { bone: braid.joints[2], at: [tip.x, tip.y + 0.004, tip.z], dir: [0, 1, 0] });
  }

  // ================================================================ hat
  const hat = b.chain(
    "hat",
    catmull([
      [0, HY + 0.05, -0.005],
      [0, HY + 0.16, -0.01],
      [0, HY + 0.27, -0.05],
      [0, HY + 0.35, -0.11],
      [0, HY + 0.35, -0.19],
    ]),
    { parent: head, role: "tail", names: ["hat1", "hat2", "hat3", "hat4"] },
  );
  const hatSweep = b.sweep(hat, [0.112, 0.1, 0.085, 0.062, 0.036, 0.012], {
    color: HAT_P,
    sides: 10,
    caps: { start: "flat", end: "point" },
  });
  b.lathe(
    [[0.09, -0.008], [0.14, -0.02], [0.18, -0.018], [0.182, -0.008], [0.14, 0.004], [0.09, 0.01]],
    { at: [0, HY + 0.05, -0.005], bone: head, color: "#a82a2a", smoothing: 1, segments: 18 },
  );
  b.sweep(catmull(ringPts([0, HY + 0.075, -0.007], 0.113, "y", 16), { closed: true }), 0.011, { color: LEATHER_D, bone: head });
  b.part(box(0.034, 0.03, 0.008), BRASS, { bone: head, at: [0, HY + 0.075, 0.108] });
  b.part(box(0.02, 0.018, 0.01), DARK, { bone: head, at: [0, HY + 0.075, 0.109] });
  b.part(sph(9, 7), CREAM, { bone: hat.joints[3], at: [0, HY + 0.345, -0.215], scale: [0.032, 0.032, 0.032] });
  b.decal(hatSweep, BADGE, { at: [0.095, HY + 0.17, -0.01], dir: [1, 0.15, 0], size: [0.07, 0.07] });
  b.decal(hatSweep, PATCH, { at: [-0.082, HY + 0.22, -0.05], dir: [-1, 0.2, 0], size: [0.05, 0.05] });

  // goggles pushed up
  const hatSkin = b.surface(hatSweep);
  const gh = [1, -1].map((s) => hatSkin.nearest([s * 0.045, HY + 0.14, 0.14]));
  gh.forEach((hit) => {
    b.stick(cyl(0.034, 0.034, 0.016, 10), BRASS, hit, { embed: 0.3 });
    glow(b.stick(cyl(0.026, 0.026, 0.012, 10), "#73d8ee", hit.moved([0, 0.008, 0]), { embed: 0.3 }), 0.5);
    b.stick(new THREE.TorusGeometry(0.03, 0.004, 5, 10), GILT, hit.moved([0, 0.008, 0]), { embed: 0.3 });
  });
  b.rod(gh[0], gh[1], 0.006, { color: BRASS });

  // ================================================================ backpack
  b.frustumBox([0, 0.25, PZ], [0, 0.6, PZ], [0.36, 0.2], [0.31, 0.17], { bone: chest, color: LEATHER });
  b.frustumBox([0, 0.575, PZ], [0, 0.61, PZ], [0.34, 0.2], [0.32, 0.18], { bone: chest, color: LEATHER_D });
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.part(box(0.03, 0.03, 0.03), BRASS, { bone: chest, at: [sx * 0.178, 0.262, PZ + sz * 0.098] });
    }
  // boiler
  const boiler = b.lathe(
    [[0, -0.15], [0.055, -0.15], [0.07, -0.13], [0.073, -0.1], [0.073, 0.1], [0.07, 0.13], [0.055, 0.15], [0, 0.15]],
    { at: [0, 0.66, PZ], axis: [1, 0, 0], bone: chest, color: COPPER, segments: 12 },
  );
  for (const x of [-0.085, 0.085]) {
    b.sweep(catmull(ringPts([x, 0.66, PZ], 0.076, "x", 16), { closed: true }), 0.006, { color: BRASS, bone: chest });
  }
  for (const x of [-0.16, 0.16]) b.part(sph(7, 5), GILT, { bone: chest, at: [x, 0.66, PZ], scale: [0.02, 0.02, 0.02] });
  b.decal(boiler, RUNE, { at: [0, 0.68, PZ - 0.075], dir: [0, 0.2, -1], size: [0.1, 0.05] });
  // funnel and smoke
  b.lathe(
    [[0.018, 0], [0.015, 0.05], [0.035, 0.11], [0.065, 0.16], [0.06, 0.16], [0.032, 0.11], [0.012, 0.05], [0.013, 0]],
    { at: [0.09, 0.72, PZ], bone: chest, color: BRASS, segments: 10 },
  );
  [[0.09, 0.9, 0.028], [0.082, 0.95, 0.035], [0.065, 1.0, 0.04]].forEach(([x, y, r]) =>
    b.part(new THREE.IcosahedronGeometry(r, 0), SMOKE, { bone: chest, at: [x, y, PZ - 0.005], flat: true }),
  );
  // valve
  b.rod([-0.08, 0.73, PZ], [-0.08, 0.78, PZ], 0.008, { bone: chest, color: BRASS });
  b.part(sph(7, 5), "#d8362e", { bone: chest, at: [-0.08, 0.795, PZ], scale: [0.02, 0.02, 0.02] });
  // gear train on the back
  gearTrain(b, {
    at: [0, 0.42, -0.3],
    axis: [0, 0, -1],
    module: 0.006,
    spin: "gear",
    bone: chest,
    group: "pack",
    thickness: 0.012,
    gears: [
      { teeth: 22, spokes: 5, bore: 0.004 },
      { teeth: 12, angle: 50 },
      { teeth: 16, from: 0, angle: -100, holes: 4 },
      { teeth: 10, from: 1, angle: 130 },
    ],
  });
  // pressure gauge on the left side
  b.part(cyl(0.05, 0.05, 0.012, 16), GILT, { bone: chest, at: [0.168, 0.5, PZ + 0.03], dir: [1, 0, 0] });
  b.part(new THREE.CircleGeometry(0.043, 20), "#ffffff", {
    bone: chest,
    at: [0.176, 0.5, PZ + 0.03],
    dir: [1, 0, 0],
    axis: "z",
    texture: GAUGE,
  });
  // lantern
  b.sweep(catmull([[0.17, 0.36, PZ], [0.21, 0.36, PZ], [0.215, 0.31, PZ]]), 0.004, { bone: chest, color: BRASS });
  const L: V3 = [0.215, 0.26, PZ];
  glow(b.part(box(0.045, 0.055, 0.045), "#ffc04d", { bone: chest, at: L }), 1.6);
  b.part(new THREE.ConeGeometry(0.038, 0.03, 4), BRASS, { bone: chest, at: [L[0], L[1] + 0.042, L[2]], rotation: [0, 45, 0] });
  b.part(box(0.052, 0.01, 0.052), BRASS, { bone: chest, at: [L[0], L[1] - 0.032, L[2]] });
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.part(cyl(0.003, 0.003, 0.058, 5), DARK, { bone: chest, at: [L[0] + sx * 0.023, L[1], L[2] + sz * 0.023] });
  // vial rack and coil on the right side
  b.part(box(0.01, 0.13, 0.17), LEATHER_D, { bone: chest, at: [-0.172, 0.47, PZ] });
  [["#4fd0ff", -0.055], ["#7dff6b", 0], ["#ff6bd1", 0.055]].forEach(([c, dz]) => {
    glow(b.part(cyl(0.017, 0.017, 0.09, 8), c as string, { bone: chest, at: [-0.188, 0.48, PZ + (dz as number)] }), 1.3);
    b.part(cyl(0.012, 0.012, 0.016, 8), CORK, { bone: chest, at: [-0.188, 0.536, PZ + (dz as number)] });
  });
  b.sweep(coil([-0.185, 0.28, PZ], [-0.185, 0.405, PZ], 0.022, 6), 0.0042, { bone: chest, color: BLUED });
  // hanging tools
  b.rod([0.09, 0.25, PZ - 0.05], [0.09, 0.222, PZ - 0.05], 0.004, { bone: chest, color: STEEL_F });
  b.part(new THREE.TorusGeometry(0.018, 0.005, 6, 10), GILT, { bone: chest, at: [0.09, 0.204, PZ - 0.05] });
  b.rod([0.09, 0.186, PZ - 0.05], [0.09, 0.12, PZ - 0.05], 0.0045, { bone: chest, color: GILT });
  b.part(box(0.016, 0.01, 0.006), GILT, { bone: chest, at: [0.098, 0.13, PZ - 0.05] });
  b.part(box(0.012, 0.01, 0.006), GILT, { bone: chest, at: [0.097, 0.145, PZ - 0.05] });
  b.rod([-0.09, 0.25, PZ - 0.05], [-0.09, 0.225, PZ - 0.05], 0.004, { bone: chest, color: STEEL_F });
  b.rod([-0.09, 0.225, PZ - 0.05], [-0.09, 0.115, PZ - 0.05], 0.006, { bone: chest, color: WOOD });
  b.part(box(0.06, 0.03, 0.03), IRON, { bone: chest, at: [-0.09, 0.23, PZ - 0.05] });

  // ================================================================ setting
  b.lathe([[0, 0], [0.38, 0], [0.42, 0.012], [0.42, 0.038], [0.395, 0.05], [0, 0.05]], {
    at: [0, 0, -0.05],
    bone: hips,
    color: FLOOR,
    segments: 22,
  });
  b.sweep(catmull(ringPts([0, G - 0.004, -0.05], 0.412, "y", 22), { closed: true }), 0.011, { color: IRON, bone: hips });

  // crates, back right
  b.part(box(0.11, 0.11, 0.11), WOOD, { bone: hips, at: [-0.27, G + 0.055, -0.17] });
  for (const y of [G + 0.006, G + 0.104])
    b.part(box(0.118, 0.012, 0.118), LEATHER_D, { bone: hips, at: [-0.27, y, -0.17] });
  b.part(box(0.08, 0.08, 0.08), WOOD, { bone: hips, at: [-0.265, G + 0.15, -0.17], rotation: [0, 25, 0] });
  b.part(new THREE.PlaneGeometry(COGSIDE * 0.9, COGSIDE * 0.9), TINT.brass, {
    bone: hips,
    at: [-0.27, G + 0.055, -0.17 + 0.0565],
    dir: [0, 0, 1],
    axis: "z",
    texture: COGTEX,
  });
  // mushrooms, back left
  [[0.3, -0.17, 1.0], [0.34, -0.1, 0.7], [0.26, -0.22, 0.55]].forEach(([x, z, k]) => {
    b.part(cyl(0.012 * k, 0.016 * k, 0.05 * k, 7), CREAM, { bone: hips, at: [x, G + 0.025 * k, z] });
    b.lathe([[0, 0], [0.045 * k, 0], [0.05 * k, 0.012 * k], [0.04 * k, 0.03 * k], [0.02 * k, 0.045 * k], [0, 0.05 * k]], {
      at: [x, G + 0.045 * k, z],
      bone: hips,
      color: CAP_P,
      segments: 9,
    });
  });
  // oil can
  const can = b.part(cyl(0.035, 0.035, 0.07, 10), "#c0392b", { bone: hips, at: [-0.3, G + 0.035, 0.1] });
  b.decal(can, LABEL, { at: [-0.3, G + 0.04, 0.135], dir: [0, 0, 1], size: [0.05, 0.04] });
  b.sweep(catmull([[-0.3, G + 0.07, 0.1], [-0.285, G + 0.1, 0.12], [-0.27, G + 0.115, 0.145]]), [0.01, 0.005], { bone: hips, color: STEEL_F });
  b.sweep(catmull([[-0.325, G + 0.065, 0.1], [-0.345, G + 0.08, 0.1], [-0.335, G + 0.03, 0.1]]), 0.005, { bone: hips, color: STEEL_F });
  // blueprint and cogs
  b.part(new THREE.PlaneGeometry(0.14, 0.1), "#ffffff", {
    bone: hips,
    at: [0.27, G + 0.002, 0.15],
    dir: [0, 1, 0],
    axis: "z",
    up: [0.3, 0, -1],
    texture: BLUEPRINT,
  });
  const cogA = { teeth: 16, module: 0.006, holes: 4, bore: 0.006, thickness: 0.012 };
  const cogB = { teeth: 12, module: 0.006, spokes: 3, bore: 0.005, thickness: 0.012 };
  b.part(gearGeometry(cogA), BRASS, { bone: hips, at: [0.14, G + 0.006, 0.26], dir: [0, 1, 0] });
  b.part(gearGeometry(cogB), COPPER, { bone: hips, at: [-0.13, G + 0.006, 0.3], dir: [0, 1, 0] });
  b.part(gearGeometry(cogB), GILT, { bone: hips, at: [-0.205, G + 0.006, 0.255], dir: [0, 1, 0] });

  return b.root;
}
