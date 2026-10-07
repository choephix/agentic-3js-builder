import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import type { Chain, Joint } from "../src/skeleton";
import type { PartOptions } from "../src/parts";
import { limb } from "../src/ik";
import { catmull, bezier } from "../src/path";
import { grain, mottle, paint, stripes } from "../src/paint";
import type { Paint } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Gnome Tinkerer",
  description:
    "A knee-high gnome inventor with a droopy red cap, goggles, a great white beard and a towering backpack of gadgets: steam boiler, spinning rotor, dish antenna, telescope, gears, lantern and tools.",
  style: "whimsical low-poly mix",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const HAT = "#dc4a3c";
const HAT_D = "#b93731";
const CREAM = "#f6ecd2";
const CREAM_D = "#e3d0a6";
const APRON = "#ead7a6";
const APRON_D = "#d9bf86";
const ROPE = "#d9c08a";
const GREEN = "#5aa65c";
const BEARD_M = "#ebe8df";
const SKIN = "#f3b79b";
const SKIN_D = "#df9479";
const NOSE = "#ee7f78";
const CHEEK = "#f68c88";
const BEARD = "#f8f4ea";
const BEARD_D = "#d6d6d2";
const SHIRT = "#efb73f";
const SHIRT_D = "#d99a2a";
const OVER = "#2f86a6";
const OVER_D = "#24698a";
const LEATH = "#9b6035";
const LEATH_D = "#6a3f22";
const LEATH_L = "#bd7d47";
const BOOT = "#7d4627";
const SOLE = "#3c2517";
const BRASS = "#e2ab30";
const BRASS_D = "#b07d1f";
const COPPER = "#cf6e38";
const COPPER_D = "#a1502a";
const STEEL = "#aab5bd";
const STEEL_D = "#66737d";
const IRON = "#3b444c";
const OLIVE = "#7d9b46";
const OLIVE_D = "#5e7b34";
const GLASS = "#8de2ee";
const FLAME = "#ffd04e";
const INK = "#2b1e27";
const WHITE = "#ffffff";
type Fill = string | Paint;
const PENCIL = "#f5c63f";
const PINK = "#f2a1ab";
const RED_D = "#8e2a2a";

type V = [number, number, number];

// ---------------------------------------------------------------- drawings
const GAUGE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#f6ecd2"/>
  <path d="M50 50 L20 78 A44 44 0 0 1 14 50 Z" fill="#7bbf6a"/>
  <path d="M50 50 L86 50 A44 44 0 0 1 80 78 Z" fill="#d9473b"/>
  <circle cx="50" cy="50" r="30" fill="#f6ecd2"/>
  <g stroke="#2b1e27" stroke-width="4" stroke-linecap="round">
    <line x1="50" y1="8" x2="50" y2="20"/><line x1="20" y1="22" x2="27" y2="30"/><line x1="80" y1="22" x2="73" y2="30"/>
    <line x1="8" y1="50" x2="20" y2="50"/><line x1="92" y1="50" x2="80" y2="50"/>
  </g>
  <line x1="50" y1="50" x2="68" y2="26" stroke="#b93731" stroke-width="6" stroke-linecap="round"/>
  <circle cx="50" cy="50" r="7" fill="#2b1e27"/>
</svg>`,
  { size: 192 },
);

const WATCH = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="49" fill="#e2ab30"/>
  <circle cx="50" cy="50" r="39" fill="#f8f2df"/>
  <g fill="#2b1e27"><circle cx="50" cy="16" r="4"/><circle cx="50" cy="84" r="4"/><circle cx="16" cy="50" r="4"/><circle cx="84" cy="50" r="4"/></g>
  <g stroke="#2b1e27" stroke-width="5" stroke-linecap="round"><line x1="50" y1="50" x2="50" y2="26"/><line x1="50" y1="50" x2="66" y2="58"/></g>
  <circle cx="50" cy="50" r="5" fill="#b93731"/>
</svg>`,
  { size: 128 },
);

const HAT_PATCH = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="30" fill="#5aa65c"/>
  <circle cx="32" cy="32" r="26" fill="none" stroke="#f6ecd2" stroke-width="3" stroke-dasharray="6 4"/>
  <g fill="#f6ecd2"><circle cx="32" cy="32" r="13"/>
  <rect x="28" y="12" width="8" height="10"/><rect x="28" y="42" width="8" height="10"/><rect x="12" y="28" width="10" height="8"/><rect x="42" y="28" width="10" height="8"/>
  <rect x="28" y="12" width="8" height="10" transform="rotate(45 32 32)"/><rect x="28" y="12" width="8" height="10" transform="rotate(-45 32 32)"/>
  <rect x="28" y="42" width="8" height="10" transform="rotate(45 32 32)"/><rect x="28" y="42" width="8" height="10" transform="rotate(-45 32 32)"/></g>
  <circle cx="32" cy="32" r="6" fill="#5aa65c"/>
</svg>`,
  { size: 192 },
);

const BLUEPRINT = svg(
  `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="64" fill="#3d73b8"/>
  <g fill="none" stroke="#e8f2ff" stroke-width="2.4" stroke-linecap="round">
    <circle cx="26" cy="32" r="14"/><circle cx="26" cy="32" r="5"/>
    <path d="M44 14 H108 M44 50 H108 M60 14 V50 M92 14 V50"/>
    <path d="M64 24 L88 24 L88 40 L64 40 Z"/>
    <path d="M6 58 H120 M6 6 H120" stroke-dasharray="6 4"/>
    <path d="M96 22 L108 32 L96 42"/>
  </g>
</svg>`,
  { size: 256 },
);

const PACK_PATCH = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="60" height="60" rx="8" fill="#dc4a3c"/>
  <rect x="6" y="6" width="52" height="52" rx="5" fill="none" stroke="#f6ecd2" stroke-width="3" stroke-dasharray="7 4"/>
  <g fill="none" stroke="#f6ecd2" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 44 L40 24"/><circle cx="43" cy="21" r="7"/><path d="M18 34 L30 46"/>
  </g>
  <circle cx="43" cy="21" r="2.5" fill="#dc4a3c"/>
</svg>`,
  { size: 192 },
);

const LABEL = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="40" rx="4" fill="#f6ecd2"/>
  <rect x="3" y="3" width="58" height="34" rx="3" fill="none" stroke="#9b6035" stroke-width="2.5"/>
  <g stroke="#2b1e27" stroke-width="3" stroke-linecap="round"><path d="M10 14 H42"/><path d="M10 22 H54"/><path d="M10 30 H34"/></g>
  <circle cx="52" cy="13" r="4" fill="#dc4a3c"/>
</svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------- paints
const HAT_KNIT = paint((_p, _n, s) => {
  const row = Math.floor(s[0] * 18);
  return row % 2 === 0 ? HAT : HAT_D;
});
const RIB = paint((_p, _n, s) => (Math.floor(s[1] / 14) % 2 === 0 ? CREAM : CREAM_D));
const SOCK = stripes(HAT, CREAM, { size: 0.045, axis: "y", width: 0.5, wobble: 0 });
const BLANKET = stripes(COPPER, CREAM, { size: 0.05, axis: "x", width: 0.45, wobble: 0 });
const CANVAS = mottle(OLIVE, OLIVE_D, { size: 0.05, contrast: 0.5, seed: 3 });
const LEATHER = grain(LEATH, "#8a5330", { size: 0.03, axis: "y", seed: 5 });
const BOOTP = grain(BOOT, LEATH_D, { size: 0.02, axis: "y", seed: 2 });
const BEARD_P = grain(BEARD, BEARD_D, { size: 0.018, axis: "y", seed: 9 });
const SHIRT_P = paint((p, _n, s) => (Math.floor(p.y / 0.035) % 2 === 0 || s[0] < 0.43 ? SHIRT : SHIRT_D));

// ---------------------------------------------------------------- geometry helpers
const sph = (r: number, w = 7, h = 5) => new THREE.SphereGeometry(r, w, h);
const ico = (r: number, d = 0) => new THREE.IcosahedronGeometry(r, d);
const cyl = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg, 1);
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const tor = (r: number, t: number, seg = 6, tube = 5) => new THREE.TorusGeometry(r, t, tube, seg);

function gearOutline(teeth: number, ro: number, ri: number): OutlinePoint[] {
  const pts: OutlinePoint[] = [];
  const w = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * w;
    for (const [f, r] of [
      [0.05, ri],
      [0.2, ro],
      [0.45, ro],
      [0.6, ri],
    ] as const) {
      pts.push([Math.cos(a + f * w) * r, Math.sin(a + f * w) * r, "sharp"]);
    }
  }
  return pts;
}

export default function build() {
  const b = createBuilder({ name: "gnomeTinkerer" });


  const put = (g: THREE.BufferGeometry, color: Fill, bone: Joint, at: V, o: PartOptions = {}) =>
    b.part(g, color, { bone, at, flat: true, ...o });
  const rod = (a: V, c: V, r: number, color: Fill, bone: Joint, sides = 6) =>
    b.rod(a, c, r, { color, bone, sides, smooth: false });
  const merged = (geos: THREE.BufferGeometry[], color: Fill, bone: Joint, o: PartOptions = {}) => {
    const m = mergeGeometries(geos);
    if (!m) throw new Error("merge failed");
    return b.part(m, color, { bone, at: [0, 0, 0], flat: true, ...o });
  };

  // ================================================================ SKELETON
  const hips = b.joint("hips", { at: [0, 0.43, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.43, 0],
      [0, 0.54, 0.015],
      [0, 0.65, 0.0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const spine1 = spine.joints[0];
  const chest = spine.tip!;
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.65, 0],
      [0, 0.75, 0.03],
      [0, 0.845, 0.05],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: neck.at(1), dir: [0, 1, 0.1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.935, 0.03], aim: [0, 0.875, 0.14], role: "jaw" });

  // hat: a floppy chain, tip drooping back over the gnome's right shoulder
  const hatPath = catmull([
    [0, 1.02, 0.05],
    [0, 1.13, 0.05],
    [0, 1.24, 0.02],
    [-0.04, 1.33, -0.04],
    [-0.13, 1.36, -0.13],
    [-0.2, 1.31, -0.2],
  ]);
  const hat = b.chain("hat", hatPath, { parent: head, names: ["hat1", "hat2", "hat3", "hat4", "hat5"], role: "tail" });

  // legs
  const legs: Record<string, { chain: Chain; ankle: Joint; toe: Joint }> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.085, 0.4, 0], [s * 0.09, 0.085, 0], [0.18, 0.165], [0, 0, 1]);
    const chain = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.09, 0, 0.05],
    });
    const ankle = chain.tip!;
    const toe = b.joint(`toe${side}`, { parent: ankle, at: [s * 0.09, 0.045, 0.075], dir: [0, 0, 1], role: "digit" });
    legs[side] = { chain, ankle, toe };
  }

  // arms
  const arms: Record<string, { chain: Chain; wrist: Joint; elbow: Joint; sh: Joint }> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const clav = b.joint(`clavicle${side}`, { parent: chest, at: [s * 0.05, 0.64, 0.0], aim: [s * 0.15, 0.665, 0.0] });
    const pts = limb([s * 0.155, 0.665, 0], [s * 0.325, 0.47, 0.055], [0.165, 0.15], [s * 0.5, 0, -1]);
    const chain = b.chain(`arm${side}`, pts, {
      parent: clav,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    arms[side] = { chain, wrist: chain.tip!, elbow: chain.joints[1], sh: chain.joints[0] };
  }

  // ================================================================ BODY
  const torso = b.sweep(
    spine,
    (t) => [0.1 + 0.052 * Math.sin(Math.PI * (0.05 + 0.7 * t)), 0.1 + 0.058 * Math.sin(Math.PI * (0.05 + 0.7 * t))],
    {
      shift: [0, -0.03],
      sides: 8,
      smooth: false,
      bands: [
        [0.4, OVER],
        [1, SHIRT_P],
      ],
      sectors: [[128, 232, OVER, 0.4, 0.86]],
    },
  );
  const skin = b.surface(torso);

  b.sweep(neck, [0.06, 0.055], { color: SKIN_D, sides: 7, smooth: false });

  // shirt collar ring + shoulder pads (rounded shoulders)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    put(ico(0.062, 1), SHIRT_P, arms[side].sh, [s * 0.145, 0.665, -0.005]);
  }
  put(cyl(0.085, 0.095, 0.03, 8), SHIRT_D, chest, [0, 0.73, 0.01]);

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const { chain, ankle, toe } = legs[side];
    b.sweep(chain, [0.082, 0.078, 0.07, 0.058, 0.05], {
      sides: 7,
      smooth: false,
      bands: [
        [0.5, OVER],
        [1, SOCK],
      ],
    });
    const k = chain.joints[1].at;

    // knee patch + cuff
    put(cyl(0.088, 0.078, 0.045, 7), OVER_D, chain.joints[1], [k.x, k.y + 0.02, k.z]);
    b.stick(box(0.055, 0.012, 0.055), LEATH_L, b.surface(chain.joints[0]).ray([s * 0.09, k.y + 0.05, 1], [0, 0, -1])!, {
      embed: 0.4,
      flow: [0, 1, 0],
    });
    // boots
    put(sph(1, 8, 5), BOOTP, ankle, [s * 0.09, 0.052, 0.04], { scale: [0.062, 0.05, 0.1] });
    put(cyl(0.058, 0.062, 0.085, 8), BOOTP, ankle, [s * 0.09, 0.115, 0.0]);
    put(cyl(0.07, 0.066, 0.03, 8), LEATH_L, ankle, [s * 0.09, 0.165, 0.0]); // folded cuff
    put(tor(0.064, 0.008, 8, 4), BRASS_D, ankle, [s * 0.09, 0.105, 0.0], { rotation: [90, 0, 0] });
    put(box(0.026, 0.026, 0.01), BRASS, ankle, [s * 0.09, 0.105, 0.066]);
    put(box(0.012, 0.012, 0.012), IRON, ankle, [s * 0.09, 0.105, 0.072]);
    put(sph(1, 7, 4), BOOTP, toe, [s * 0.09, 0.05, 0.115], { scale: [0.062, 0.05, 0.062] });
    put(sph(1, 6, 4), BEARD, toe, [s * 0.09, 0.062, 0.155], { scale: [0.022, 0.012, 0.018] }); // scuff patch
    b.extrude(
      [
        [-0.068, -0.04],
        [0.068, -0.04],
        [0.072, 0.06],
        [-0.072, 0.06],
      ],
      { at: [s * 0.09, 0.011, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.022, bone: ankle, color: SOLE, smoothing: 1 },
    );
    b.extrude(
      [
        [-0.072, 0.0],
        [0.072, 0.0],
        [0.058, 0.09],
        [0.0, 0.118],
        [-0.058, 0.09],
      ],
      { at: [s * 0.09, 0.011, 0.06], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.022, bone: toe, color: SOLE, smoothing: 1 },
    );
    // laces: crossed bars
    for (const q of [0.078, 0.092, 0.106]) {
      rod([s * 0.078, q, 0.057], [s * 0.102, q + 0.008, 0.062], 0.003, BEARD, ankle, 4);
      rod([s * 0.102, q, 0.057], [s * 0.078, q + 0.008, 0.062], 0.003, BEARD, ankle, 4);
    }

  }

  // ---------------------------------------------------------------- arms
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const { chain, wrist, elbow } = arms[side];
    const armTube = b.sweep(chain, [0.058, 0.054, 0.05, 0.04, 0.036], {
      sides: 7,
      smooth: false,
      bands: [
        [0.5, SHIRT_P],
        [1, SKIN],
      ],
    });
    {
      const ep = elbow.at.clone().add(new THREE.Vector3(s * 0.05, 0.0, -0.045));
      const eh = b.surface(armTube).nearest(ep);
      b.stick(cyl(0.03, 0.03, 0.014, 7), LEATH_L, eh, { embed: 0.45, flat: true });
      b.stick(cyl(0.012, 0.012, 0.008, 6), BRASS, eh.moved([0, 0.008, 0]), { embed: 0.2, flat: true });
    }
    // rolled sleeve cuff at the elbow
    const e = elbow.at;
    const w = wrist.at;
    const d = w.clone().sub(e).normalize();
    put(cyl(0.064, 0.06, 0.04, 7), SHIRT_D, elbow, [e.x + d.x * 0.02, e.y + d.y * 0.02 - 0.0, e.z + d.z * 0.02], { dir: [d.x, d.y, d.z] });
    // leather bracer w/ brass band + gear stud
    put(cyl(0.046, 0.043, 0.055, 7), LEATH, wrist, [w.x - d.x * 0.02, w.y - d.y * 0.02, w.z - d.z * 0.02], { dir: [d.x, d.y, d.z] });
    put(tor(0.047, 0.006, 7, 4), BRASS, wrist, [w.x - d.x * 0.045, w.y - d.y * 0.045, w.z - d.z * 0.045], { dir: [d.x, d.y, d.z], axis: "z" });
    put(tor(0.045, 0.006, 7, 4), BRASS, wrist, [w.x + d.x * 0.006, w.y + d.y * 0.006, w.z + d.z * 0.006], { dir: [d.x, d.y, d.z], axis: "z" });
    put(cyl(0.012, 0.012, 0.012, 8), BRASS, wrist, [w.x - s * 0.043 - d.x * 0.02, w.y - d.y * 0.02, w.z - d.z * 0.02], {
      dir: [-s, 0, 0],
    });

    // big mitt hand
    const palmC = w.clone().addScaledVector(d, 0.05);
    put(sph(1, 7, 5), SKIN, wrist, [palmC.x, palmC.y, palmC.z], { dir: [d.x, d.y, d.z], scale: [0.03, 0.05, 0.045] });
    const names = ["index", "middle", "ring", "pinky"];
    const zs = [0.03, 0.01, -0.01, -0.029];
    const lens = [0.062, 0.07, 0.064, 0.05];
    names.forEach((nm, i) => {
      const base = palmC.clone().addScaledVector(d, 0.04);
      base.z += zs[i];
      const m = base.clone().addScaledVector(d, lens[i] * 0.52);
      m.x -= s * 0.004;
      const tip = base.clone().addScaledVector(d, lens[i] * 0.94);
      tip.x -= s * 0.017;
      tip.y += 0.005;
      const fc = b.chain(`${nm}${side}`, catmull([base, m, tip]), {
        parent: wrist,
        names: [`${nm}${side}1`, `${nm}${side}2`],
        role: "digit",
      });
      b.sweep(fc, [0.0125, 0.01], { color: SKIN, sides: 5, smooth: false });
    });
    {
      const base = palmC.clone().addScaledVector(d, 0.0);
      base.z += 0.04;
      base.x -= s * 0.008;
      const dir = new THREE.Vector3(-s * 0.18, -0.6, 0.78).normalize();
      const m = base.clone().addScaledVector(dir, 0.033);
      const tip = base.clone().addScaledVector(dir, 0.07);
      tip.x -= s * 0.004;
      const fc = b.chain(`thumb${side}`, catmull([base, m, tip]), {
        parent: wrist,
        names: [`thumb${side}1`, `thumb${side}2`],
        role: "digit",
      });
      b.sweep(fc, [0.015, 0.011], { color: SKIN, sides: 5, smooth: false });
    }
  }

  // ================================================================ HEAD
  put(sph(1, 10, 7), SKIN, head, [0, 0.97, 0.06], { scale: [0.126, 0.116, 0.122] });
  // hair at the back of the head, peeking out below the cap
  for (let row = 0; row < 2; row++) {
    const n = row === 0 ? 9 : 7;
    for (let i = 0; i < n; i++) {
      const a = Math.PI * (0.62 + (0.76 * i) / (n - 1));
      const rr = row === 0 ? 0.116 : 0.104;
      const hy = row === 0 ? 0.985 : 0.925;
      put(ico(row === 0 ? 0.04 : 0.036, 0), (i + row) % 2 ? BEARD_P : BEARD_M, head, [Math.sin(a) * rr, hy, 0.06 + Math.cos(a) * rr], {
        scale: [1, 0.9, 1],
      });
    }
  }
  // cheeks
  for (const s of [1, -1]) {
    put(sph(1, 6, 4), CHEEK, head, [s * 0.088, 0.93, 0.128], { scale: [0.034, 0.026, 0.02], dir: [s * 0.6, 0, 1] });
    // sideburns / cheek fluff
    put(ico(0.055, 0), BEARD_P, head, [s * 0.098, 0.9, 0.07], { scale: [0.8, 1.1, 1.1] });
    put(ico(0.04, 0), BEARD_P, head, [s * 0.108, 0.86, 0.045], { scale: [0.7, 1.2, 1.0] });
  }
  // nose
  put(ico(0.052, 1), NOSE, head, [0, 0.935, 0.196], { scale: [1, 1.08, 1.05] });
  put(sph(1, 5, 3), RED_D, head, [0.016, 0.918, 0.238], { scale: [0.009, 0.006, 0.006] });
  put(sph(1, 5, 3), RED_D, head, [-0.016, 0.918, 0.238], { scale: [0.009, 0.006, 0.006] });
  put(sph(0.012, 5, 3), "#ffd8cf", head, [0.018, 0.958, 0.236]);
  // eyes
  for (const s of [1, -1]) {
    put(sph(1, 8, 5), WHITE, head, [s * 0.05, 0.99, 0.157], { scale: [0.031, 0.034, 0.022] });
    put(sph(1, 7, 5), INK, head, [s * 0.05 - s * 0.003, 0.988, 0.177], { scale: [0.019, 0.023, 0.013] });
    put(sph(0.006, 4, 3), WHITE, head, [s * 0.05 + s * 0.002, 0.998, 0.189]);
    // lids + freckles
    put(sph(1, 6, 3), SKIN_D, head, [s * 0.05, 1.012, 0.165], { scale: [0.03, 0.01, 0.022] });
    for (const [fx, fy] of [
      [0.075, 0.952],
      [0.095, 0.958],
      [0.085, 0.972],
    ]) {
      put(sph(0.004, 4, 3), SKIN_D, head, [s * fx, fy, 0.16 - Math.abs(fx - 0.08) * 0.4]);
    }
    // bushy brows
    b.sweep(
      bezier([s * 0.012, 1.028, 0.172], [s * 0.04, 1.052, 0.18], [s * 0.075, 1.04, 0.162], [s * 0.1, 1.012, 0.128]),
      [0.024, 0.02, 0.015, 0.0],
      { color: BEARD_P, bone: head, sides: 5, smooth: false },
    );
    // pointed ears
    const outline: OutlinePoint[] = [
      [0, -0.028],
      [0.05, -0.034],
      [0.12, 0.01],
      [0.2, 0.078, "sharp"],
      [0.1, 0.07],
      [0.045, 0.05],
      [0, 0.032],
    ];
    b.extrude(outline, { at: [s * 0.112, 0.97, 0.04], x: [s, 0, 0], y: [0, 1, 0.1], thickness: 0.014, bevel: 0.004, bone: head, color: SKIN });
    b.extrude(
      [
        [0.005, -0.016],
        [0.05, -0.02],
        [0.11, 0.012],
        [0.15, 0.052, "sharp"],
        [0.085, 0.048],
        [0.04, 0.034],
        [0.005, 0.02],
      ],
      { at: [s * 0.112, 0.97, 0.047], x: [s, 0, 0], y: [0, 1, 0.1], thickness: 0.006, bone: head, color: SKIN_D },
    );
    // earrings: brass hoop + tiny cog
    put(tor(0.014, 0.003, 7, 4), BRASS, head, [s * 0.18, 0.937, 0.04], { dir: [1, 0, 0], axis: "z" });
    put(cyl(0.01, 0.01, 0.005, 6), BRASS_D, head, [s * 0.18, 0.915, 0.04], { dir: [1, 0, 0] });
  }
  // mouth + jaw
  put(sph(1, 6, 4), RED_D, head, [0, 0.9, 0.145], { scale: [0.036, 0.016, 0.02] });
  put(box(0.01, 0.009, 0.006), WHITE, head, [0.008, 0.911, 0.158]);
  put(box(0.01, 0.009, 0.006), WHITE, head, [-0.008, 0.911, 0.158]);
  put(sph(1, 7, 4), SKIN_D, jaw, [0, 0.882, 0.12], { scale: [0.07, 0.034, 0.055] });
  put(sph(1, 6, 3), PINK, jaw, [0, 0.896, 0.148], { scale: [0.022, 0.008, 0.012] });

  // moustache: great sweeping handlebars
  for (const s of [1, -1]) {
    b.sweep(
      bezier([s * 0.004, 0.926, 0.19], [s * 0.09, 0.9, 0.215], [s * 0.12, 0.89, 0.12], [s * 0.135, 0.945, 0.115]),
      [0.024, 0.034, 0.028, 0.014, 0.0],
      { color: BEARD_P, bone: head, sides: 6, smooth: false },
    );
    // curl tip
    put(sph(0.014, 5, 3), BEARD, head, [s * 0.138, 0.955, 0.11]);
  }

  // beard on the jaw bone: a chain that hangs and sways
  const beard = b.chain(
    "beard",
    catmull([
      [0, 0.905, 0.1],
      [0, 0.81, 0.17],
      [0, 0.72, 0.19],
      [0, 0.615, 0.185],
    ]),
    { parent: jaw, names: ["beard1", "beard2", "beard3"], role: "tail" },
  );
  const beardTube = b.sweep(
    beard,
    (t) => [0.115 * Math.pow(1 - t, 0.55) + 0.016, 0.075 * Math.pow(1 - t * t, 0.7) + 0.012],
    { color: BEARD_P, sides: 8, smooth: false, caps: "point" },
  );
  const bsk = b.surface(beardTube);
  // beard locks: layered pointed panels down the front of the beard (lower rows overlap upper ones)
  const panelRows: [number, [number, number][], number, number][] = [
    [0.865, [[-0.074, 10], [0, 0], [0.074, -10]], 0.105, 0.042],
    [0.805, [[-0.098, 16], [-0.036, 5], [0.036, -5], [0.098, -16]], 0.1, 0.04],
    [0.745, [[-0.064, 9], [0, 0], [0.064, -9]], 0.1, 0.04],
    [0.69, [[-0.032, 5], [0.032, -5]], 0.085, 0.036],
    [0.64, [[0, 0]], 0.09, 0.034],
  ];
  panelRows.forEach(([y, cols, len, hw], ri) => {
    cols.forEach(([x, tilt], i) => {
      const hit = bsk.ray([x, y, 1], [0, 0, -1]);
      if (!hit) return;
      const th = (tilt * Math.PI) / 180;
      const ph = (18 * Math.PI) / 180;
      b.extrude(
        [
          [-hw, 0],
          [hw, 0],
          [hw * 0.9, -len * 0.5],
          [hw * 0.35, -len * 0.85],
          [0, -len, "sharp"],
          [-hw * 0.35, -len * 0.85],
          [-hw * 0.9, -len * 0.5],
        ],
        {
          at: [x, y, hit.at.z + 0.004 + ri * 0.005],
          x: [Math.cos(th), Math.sin(th), 0],
          y: [-Math.sin(th) * Math.cos(ph), Math.cos(th) * Math.cos(ph), -Math.sin(ph)],
          thickness: 0.024,
          bevel: 0.006,
          bone: jaw,
          color: (ri + i) % 2 ? BEARD_P : BEARD_M,
        },
      );
    });
  });
  // braided side locks with brass beads
  for (const s of [1, -1]) {
    const bpath = catmull([
      [s * 0.115, 0.89, 0.09],
      [s * 0.12, 0.83, 0.1],
      [s * 0.115, 0.775, 0.12],
      [s * 0.11, 0.725, 0.13],
    ]);
    b.sweep(bpath, [0.026, 0.022, 0.018, 0.004], { color: BEARD_P, bone: head, sides: 5, smooth: false });
    for (let i = 0; i < 3; i++) {
      const p = bpath.at(0.2 + i * 0.27);
      put(sph(0.024, 5, 3), i % 2 ? BEARD_D : BEARD, head, [p.x, p.y, p.z + 0.012], { scale: [0.8, 0.7, 1] });
    }
    const q = bpath.at(0.62);
    put(tor(0.024, 0.005, 7, 4), BRASS, head, [q.x, q.y, q.z], { dir: [0, 1, 0], axis: "z" });
    const t = bpath.at(1);
    put(sph(0.014, 5, 3), RED_D, head, [t.x, t.y - 0.008, t.z]);
  }

  // ================================================================ HAT
  const hatTube = b.sweep(hat, [0.15, 0.128, 0.102, 0.078, 0.048, 0.02, 0.006], {
    sides: 8,
    smooth: false,
    color: HAT_KNIT,
    caps: { start: "flat", end: "point" },
  });
  // ribbed cuff
  b.lathe(
    [
      [0.14, -0.002],
      [0.16, 0.002],
      [0.168, 0.03],
      [0.16, 0.058],
      [0.14, 0.062],
    ],
    { at: [0, 1.015, 0.05], bone: head, color: RIB, segments: 16 },
  );
  // bobble + bell on the drooping tip
  const tipP = hatPath.at(1);
  put(ico(0.036, 0), SHIRT, hat.joints[4], [tipP.x - 0.01, tipP.y - 0.004, tipP.z - 0.012]);
  put(cyl(0.002, 0.018, 0.028, 6), BRASS, hat.joints[4], [tipP.x - 0.012, tipP.y - 0.046, tipP.z - 0.014]);
  put(sph(0.005, 4, 3), BRASS_D, hat.joints[4], [tipP.x - 0.012, tipP.y - 0.062, tipP.z - 0.014]);
  // patch on the hat
  b.decal(hatTube, HAT_PATCH, { at: [-0.075, 1.16, 0.15], dir: [-0.5, 0.25, 1], size: [0.075, 0.075], segments: 8, up: [0, 1, 0] });
  // goggles strap and lenses
  const hatSurf = b.surface(hatTube);
  const strap = hatSurf.loop([0, 1.085, 0.05], { lift: 0.006 });
  b.sweep(strap, 0.011, { color: LEATH_D, sides: 5, smooth: false });
  for (const s of [1, -1]) {
    const hit = hatSurf.ray([s * 0.056, 1.092, 0.6], [0, 0, -1]);
    if (!hit) continue;
    b.stick(cyl(0.054, 0.058, 0.07, 9), BRASS, hit, { embed: 0.55, bone: head, flat: true });
    b.stick(cyl(0.03, 0.044, 0.06, 9), GLASS, hit, { embed: 0.05, bone: head, flat: true });
    b.stick(tor(0.046, 0.007, 9, 4), BRASS_D, hit, { embed: -0.25, bone: head, flat: true, spin: 0 });
    put(sph(0.007, 4, 3), WHITE, head, [hit.at.x - s * 0.014, hit.at.y + 0.012, hit.at.z + 0.04]);
  }
  rod([0.012, 1.1, 0.205], [-0.012, 1.1, 0.205], 0.008, BRASS_D, head, 5);
  // hat band buckle + stitched band
  put(box(0.034, 0.03, 0.01), BRASS, head, [0, 1.052, 0.212], { rotation: [-5, 0, 0] });
  put(box(0.018, 0.016, 0.012), HAT_D, head, [0, 1.052, 0.214], { rotation: [-5, 0, 0] });
  // loupe on a swing arm (hinge)
  const loupePivot = b.joint("loupe", { parent: head, at: [0.115, 1.075, 0.12], dir: [1, 0, 0], role: "hinge" });
  rod([0.115, 1.075, 0.12], [0.16, 1.1, 0.145], 0.005, BRASS_D, loupePivot, 5);
  put(tor(0.03, 0.006, 8, 4), BRASS, loupePivot, [0.17, 1.115, 0.155], { dir: [0.4, 0.35, 0.85], axis: "z" });
  put(cyl(0.025, 0.025, 0.004, 8), GLASS, loupePivot, [0.17, 1.115, 0.155], { dir: [0.4, 0.35, 0.85] });
  // pencil behind the right ear
  rod([-0.125, 1.0, 0.0], [-0.2, 1.06, -0.015], 0.008, PENCIL, head, 6);
  b.spike([-0.2, 1.06, -0.015], [-0.23, 1.083, -0.02], null, 0.008, { color: CREAM_D, bone: head, sides: 6, smooth: false });
  put(sph(0.008, 4, 3), INK, head, [-0.229, 1.082, -0.02]);
  rod([-0.115, 0.993, 0.002], [-0.126, 1.002, 0.0], 0.0095, PINK, head, 6);

  // ================================================================ CLOTHES
  // belt around the belly
  const belt = skin.loop([0, 0.48, 0], { lift: 0.012 });
  b.sweep(belt, [0.022, 0.017], { color: LEATHER, sides: 6, smooth: false, bone: spine1 });
  const frontHit = skin.ray([0, 0.48, 1], [0, 0, -1])!;
  b.stick(box(0.062, 0.016, 0.052), BRASS, frontHit, { embed: 0.3, bone: spine1, flat: true });
  b.stick(box(0.034, 0.02, 0.028), IRON, frontHit, { embed: 0.1, bone: spine1, flat: true });
  // straps over the shoulders (overall braces)
  for (const s of [1, -1]) {
    const brace = skin.drape(
      catmull([
        [s * 0.07, 0.6, 0.16],
        [s * 0.08, 0.7, 0.115],
        [s * 0.085, 0.76, 0.0],
        [s * 0.082, 0.69, -0.12],
        [s * 0.07, 0.56, -0.14],
      ]),
      { lift: 0.009 },
    );
    b.sweep(brace, 0.017, { color: OVER_D, sides: 5, smooth: false });
    const bh = skin.nearest([s * 0.07, 0.63, 0.16]);
    b.stick(cyl(0.017, 0.017, 0.012, 8), BRASS, bh, { embed: 0.3, flat: true });
  }
  // leather apron (strips draped on the belly)
  const apronTop = 0.6;
  for (let i = -2; i <= 2; i++) {
    const x = i * 0.043;
    const topY = apronTop - Math.abs(i) * 0.008;
    const path = skin.drape(
      catmull([
        [x, topY, 0.2],
        [x, 0.55, 0.21],
        [x, 0.49, 0.2],
        [x, 0.43 + Math.abs(i) * 0.012, 0.16],
      ]),
      { lift: 0.014 },
    );
    b.sweep(path, [0.0225, 0.007], { section: "box", color: i % 2 ? APRON : APRON_D, bone: spine1, caps: "flat" });
  }
  // apron waistband with rivets
  const band = skin.loop([0, 0.6, 0], { lift: 0.022 });
  b.sweep(band, 0.012, { color: LEATH_D, sides: 5, smooth: false, bone: spine1 });
  b.along(band, 14, (at) => b.stick(sph(0.006, 4, 3), BRASS, at, { embed: 0.2, bone: spine1, flat: true }));
  // apron neck strap
  b.sweep(
    skin.drape(
      catmull([
        [-0.045, 0.66, 0.17],
        [-0.03, 0.74, 0.1],
        [0, 0.745, 0.0],
        [0.03, 0.74, 0.1],
        [0.045, 0.66, 0.17],
      ]),
      { lift: 0.012 },
    ),
    0.007,
    { color: LEATH_D, bone: chest, sides: 4, smooth: false },
  );
  // chest pocket with tools
  const pocket = skin.ray([0.045, 0.555, 1], [0, 0, -1])!;
  b.stick(box(0.1, 0.014, 0.065), LEATH_D, pocket, { embed: 0.25, flow: [0, 1, 0], bone: spine1, flat: true });
  const tools: [number, string, number][] = [
    [-0.03, STEEL, 0.1],
    [0.0, COPPER, 0.115],
    [0.028, BRASS, 0.09],
  ];
  for (const [tx, tc, th] of tools) {
    const px = pocket.at.x + tx;
    rod([px, pocket.at.y + 0.0, pocket.at.z + 0.012], [px, pocket.at.y + th * 0.8, pocket.at.z + 0.016], 0.0065, tc, spine1, 5);
    put(box(0.012, 0.03, 0.012), LEATH_L, spine1, [px, pocket.at.y + th * 0.8, pocket.at.z + 0.016]);
  }
  // pocket watch on a chain
  const watchHit = skin.ray([-0.07, 0.5, 1], [0, 0, -1])!;
  b.stick(cyl(0.032, 0.032, 0.014, 10), BRASS, watchHit, { embed: 0.3, bone: spine1, flat: true });
  b.part(new THREE.CircleGeometry(0.027, 12), WHITE, {
    bone: spine1,
    at: watchHit.moved([0, 0.0095, 0]),
    dir: watchHit.n,
    axis: "z",
    texture: WATCH,
  });
  b.sweep(
    skin.drape(
      catmull([
        [-0.07, 0.525, 0.2],
        [-0.1, 0.575, 0.2],
        [-0.1, 0.62, 0.19],
        [-0.085, 0.645, 0.18],
      ]),
      { lift: 0.016 },
    ),
    0.003,
    { color: BRASS, bone: spine1, sides: 4, smooth: false },
  );
  // belt pouches and tool loops
  const pouchSpecs: [number, string][] = [
    [38, LEATH],
    [-38, LEATH],
  ];
  for (const [az, col] of pouchSpecs) {
    const a = (az * Math.PI) / 180;
    const h = skin.ray([Math.sin(a), 0.475, Math.cos(a)], [-Math.sin(a), 0, -Math.cos(a)]);
    if (!h) continue;
    b.stick(box(0.072, 0.05, 0.075), col, h, { embed: 0.25, flow: [0, 1, 0], bone: spine1, flat: true });
    b.stick(box(0.078, 0.016, 0.034), LEATH_L, h.moved([0, 0.03, 0.022]), { embed: 0.0, flow: [0, 1, 0], bone: spine1, flat: true });
    b.stick(cyl(0.008, 0.008, 0.01, 6), BRASS, h.moved([0, 0.044, 0.0]), { embed: 0.2, bone: spine1 });
  }

  // ================================================================ HIP TOOLS
  // hammer on the left hip, head up, handle down
  {
    const hx = 0.172;
    rod([hx, 0.285, 0.075], [hx, 0.5, 0.075], 0.011, LEATH_L, spine1, 6);
    put(box(0.1, 0.05, 0.04), STEEL, spine1, [hx, 0.53, 0.075], { scale: [1, 1, 1] });
    put(box(0.032, 0.052, 0.046), STEEL_D, spine1, [hx + 0.056, 0.53, 0.075]);
    put(cyl(0.008, 0.02, 0.024, 6), STEEL_D, spine1, [hx - 0.062, 0.53, 0.075], { dir: [-1, 0, 0] });
    put(cyl(0.013, 0.013, 0.03, 6), LEATH_D, spine1, [hx, 0.3, 0.075]);
    // loop
    put(box(0.04, 0.012, 0.012), LEATH_D, spine1, [hx, 0.455, 0.1]);
  }
  // spanner on the right hip
  {
    const wx = -0.172;
    const wrench: OutlinePoint[] = [
      [-0.012, -0.13],
      [0.012, -0.13],
      [0.013, 0.05],
      [0.033, 0.075],
      [0.035, 0.12],
      [0.018, 0.142],
      [0.014, 0.12],
      [0.014, 0.093],
      [-0.014, 0.093],
      [-0.014, 0.12],
      [-0.018, 0.142],
      [-0.035, 0.12],
      [-0.033, 0.075],
      [-0.013, 0.05],
    ];
    b.extrude(wrench, { at: [wx, 0.43, 0.08], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, bone: spine1, color: STEEL });
    put(cyl(0.011, 0.011, 0.016, 6), BRASS, spine1, [wx, 0.32, 0.08], { dir: [1, 0, 0] });
  }

  // ================================================================ BACKPACK
  const pack = b.joint("pack", { parent: chest, at: [0, 0.6, -0.15], dir: [0, 1, 0] });
  b.frustumBox([0, 0.45, -0.25], [0, 0.82, -0.25], [0.31, 0.21], [0.28, 0.185], {
    color: CANVAS,
    bone: pack,
  });
  // back-plate and straps
  put(box(0.29, 0.34, 0.016), LEATH_D, pack, [0, 0.62, -0.158]);
  for (const s of [1, -1]) {
    put(box(0.045, 0.36, 0.02), LEATHER, pack, [s * 0.1, 0.63, -0.352]);
    put(box(0.05, 0.03, 0.026), BRASS, pack, [s * 0.1, 0.5, -0.356]);
    put(box(0.028, 0.016, 0.012), IRON, pack, [s * 0.1, 0.5, -0.372]);
  }
  // shoulder straps from the pack over the shoulders
  for (const s of [1, -1]) {
    const strapP = skin.drape(
      catmull([
        [s * 0.105, 0.77, -0.17],
        [s * 0.12, 0.76, -0.1],
        [s * 0.125, 0.745, -0.02],
        [s * 0.115, 0.7, 0.07],
        [s * 0.105, 0.6, 0.15],
        [s * 0.1, 0.51, 0.17],
      ]),
      { lift: 0.013 },
    );
    b.sweep(strapP, [0.026, 0.026], { color: LEATHER, sides: 5, smooth: false, bone: chest });
    const h = skin.nearest([s * 0.105, 0.54, 0.17]);
    b.stick(box(0.036, 0.016, 0.03), BRASS, h, { embed: 0.3, bone: spine1, flat: true });
  }
  // flap with hinge
  const lid = b.joint("packLid", { parent: pack, at: [0, 0.83, -0.16], dir: [-1, 0, 0], role: "hinge" });
  b.extrude(
    [
      [-0.16, 0],
      [0.16, 0],
      [0.155, -0.18],
      [0.08, -0.215],
      [-0.08, -0.215],
      [-0.155, -0.18],
    ],
    { at: [0, 0.862, -0.348], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, bevel: 0.005, bone: lid, color: "#b87a42" },
  );
  {
    const st: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 9; i++) st.push(box(0.012, 0.004, 0.006).translate(-0.1 + i * 0.025, 0.656, -0.361));
    for (let i = 0; i < 5; i++) {
      st.push(box(0.006, 0.012, 0.004).translate(-0.147, 0.7 + i * 0.03, -0.361));
      st.push(box(0.006, 0.012, 0.004).translate(0.147, 0.7 + i * 0.03, -0.361));
    }
    merged(st, CREAM, lid);
  }
  b.part(box(0.32, 0.03, 0.22), LEATHER, { bone: lid, at: [0, 0.848, -0.25], flat: true });
  put(box(0.1, 0.012, 0.006), LEATH_D, lid, [0, 0.848, -0.14]);
  // flap straps and buckles
  for (const s of [1, -1]) {
    put(box(0.034, 0.034, 0.13), LEATH_D, lid, [s * 0.085, 0.866, -0.25]);
    put(box(0.038, 0.02, 0.026), BRASS, lid, [s * 0.085, 0.884, -0.2]);
    put(box(0.034, 0.03, 0.01), LEATH_D, lid, [s * 0.085, 0.84, -0.143]);
  }
  // patches and label on the back face
  b.part(new THREE.PlaneGeometry(0.1, 0.1), WHITE, { bone: pack, at: [-0.075, 0.74, -0.376], dir: [0, 0, -1], axis: "z", texture: PACK_PATCH, up: [0, 1, 0] });
  b.part(new THREE.PlaneGeometry(0.1, 0.0625), WHITE, { bone: pack, at: [0.08, 0.745, -0.376], dir: [0, 0, -1], axis: "z", texture: LABEL, up: [0, 1, 0] });
  // side pouches with flaps
  for (const s of [1, -1]) {
    put(box(0.075, 0.22, 0.15), CANVAS, pack, [s * 0.19, 0.55, -0.26]);
    put(box(0.082, 0.05, 0.16), LEATHER, pack, [s * 0.19, 0.64, -0.26]);
    put(cyl(0.011, 0.011, 0.012, 8), BRASS, pack, [s * 0.232, 0.64, -0.26], { dir: [1, 0, 0] });
    // sewn seam
    put(box(0.003, 0.2, 0.012), CREAM_D, pack, [s * 0.228, 0.54, -0.18]);
    put(box(0.003, 0.2, 0.012), CREAM_D, pack, [s * 0.228, 0.54, -0.34]);
  }
  // corner reinforcements
  for (const s of [1, -1])
    for (const zz of [-0.35, -0.15])
      put(box(0.03, 0.03, 0.03), LEATH_D, pack, [s * 0.155, 0.455, zz], { scale: [1, 1, 1] });

  // bedroll slung under the pack
  put(cyl(0.062, 0.062, 0.37, 8), BLANKET, pack, [0, 0.415, -0.27], { dir: [1, 0, 0] });
  put(cyl(0.05, 0.05, 0.372, 8), CREAM, pack, [0, 0.415, -0.27], { dir: [1, 0, 0], scale: [0.6, 1, 0.6] });
  put(cyl(0.058, 0.058, 0.008, 8), CREAM, pack, [0.192, 0.415, -0.27], { dir: [1, 0, 0] });
  put(cyl(0.058, 0.058, 0.008, 8), CREAM, pack, [-0.192, 0.415, -0.27], { dir: [1, 0, 0] });
  for (const x of [-0.11, 0.11]) {
    put(tor(0.066, 0.01, 8, 4), LEATH_D, pack, [x, 0.415, -0.27], { dir: [1, 0, 0], axis: "z" });
    put(box(0.02, 0.02, 0.014), BRASS, pack, [x, 0.349, -0.27]);
  }
  // rope coil on the left pouch
  for (let i = 0; i < 4; i++) put(tor(0.045, 0.008, 8, 4), ROPE, pack, [0.25 + i * 0.013, 0.6, -0.26], { dir: [1, 0, 0], axis: "z" });
  // amber lamp on the lid corner
  glow(put(cyl(0.017, 0.017, 0.03, 6), "#ffb347", lid, [0.135, 0.89, -0.165]), 1.1);
  put(cyl(0.02, 0.02, 0.008, 6), BRASS_D, lid, [0.135, 0.908, -0.165]);
  put(cyl(0.02, 0.02, 0.008, 6), BRASS_D, lid, [0.135, 0.872, -0.165]);
  // a sprig of leaves and berries tucked in the cap
  {
    const leafOutline: OutlinePoint[] = [
      [0, 0],
      [0.02, 0.013],
      [0.05, 0.01],
      [0.075, 0, "sharp"],
      [0.05, -0.01],
      [0.02, -0.013],
    ];
    b.extrude(leafOutline, { at: [-0.145, 1.07, 0.04], x: [-0.7, 0.7, 0], y: [0.7, 0.7, 0], thickness: 0.004, smoothing: 1, bone: head, color: GREEN });
    b.extrude(leafOutline, { at: [-0.145, 1.07, 0.04], x: [-0.9, 0.3, 0.3], y: [0.3, 0.9, 0], thickness: 0.004, smoothing: 1, bone: head, color: GREEN });
    b.extrude(leafOutline, { at: [-0.145, 1.07, 0.04], x: [-0.6, 0.1, 0.8], y: [0.1, 0.99, 0], thickness: 0.004, smoothing: 1, bone: head, color: GREEN });
    for (const [bx, by, bz] of [
      [-0.15, 1.085, 0.065],
      [-0.158, 1.072, 0.075],
      [-0.14, 1.09, 0.078],
    ])
      put(sph(0.009, 5, 3), HAT, head, [bx, by, bz]);
  }

  // ---------------------------------------------------------------- boiler
  put(cyl(0.062, 0.062, 0.27, 8), COPPER, pack, [0, 0.6, -0.4], { dir: [1, 0, 0] });
  for (const s of [1, -1]) {
    put(sph(0.064, 8, 4), COPPER_D, pack, [s * 0.135, 0.6, -0.4], { scale: [0.55, 1, 1] });
    put(tor(0.064, 0.007, 8, 4), BRASS, pack, [s * 0.09, 0.6, -0.4], { dir: [1, 0, 0], axis: "z" });
    put(tor(0.064, 0.007, 8, 4), BRASS, pack, [s * 0.025, 0.6, -0.4], { dir: [1, 0, 0], axis: "z" });
  }
  // rivets on bands
  {
    const rivets: THREE.BufferGeometry[] = [];
    for (const x of [-0.09, -0.025, 0.025, 0.09])
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        rivets.push(sph(0.0065, 4, 3).translate(x, 0.6 + Math.cos(a) * 0.069, -0.4 + Math.sin(a) * 0.069));
      }
    merged(rivets, BRASS_D, pack);
  }
  // mounting brackets
  for (const x of [-0.07, 0.07]) {
    put(box(0.026, 0.05, 0.095), IRON, pack, [x, 0.6, -0.362]);
    put(box(0.028, 0.012, 0.024), IRON, pack, [x, 0.535, -0.36]);
  }
  // valve wheel and stack
  rod([0.03, 0.66, -0.4], [0.03, 0.715, -0.4], 0.009, BRASS, pack, 6);
  put(tor(0.028, 0.006, 8, 4), RED_D, pack, [0.03, 0.72, -0.4], { rotation: [90, 0, 0] });
  put(cyl(0.007, 0.007, 0.054, 5), RED_D, pack, [0.03, 0.72, -0.4], { rotation: [0, 0, 90] });
  put(cyl(0.007, 0.007, 0.054, 5), RED_D, pack, [0.03, 0.72, -0.4], { rotation: [90, 0, 0] });
  put(sph(0.012, 5, 3), BRASS, pack, [0.03, 0.72, -0.4]);
  // gauge (with dial drawing)
  rod([-0.06, 0.66, -0.4], [-0.06, 0.71, -0.4], 0.008, BRASS, pack, 6);
  put(cyl(0.048, 0.048, 0.03, 10), BRASS, pack, [-0.06, 0.745, -0.41], { dir: [0, 0, -1] });
  put(tor(0.046, 0.007, 10, 4), BRASS_D, pack, [-0.06, 0.745, -0.426], { dir: [0, 0, -1], axis: "z" });
  b.part(new THREE.CircleGeometry(0.041, 14), WHITE, { bone: pack, at: [-0.06, 0.745, -0.4254], dir: [0, 0, -1], axis: "z", texture: GAUGE, up: [0, 1, 0] });
  // pipes from the boiler
  const pipe1 = catmull([
    [-0.12, 0.655, -0.4],
    [-0.17, 0.72, -0.4],
    [-0.17, 0.82, -0.39],
    [-0.16, 0.905, -0.34],
  ]);
  b.sweep(pipe1, 0.013, { color: COPPER_D, bone: pack, sides: 6, smooth: false });
  for (const t of [0.35, 0.7]) {
    const p = pipe1.at(t);
    put(tor(0.015, 0.005, 6, 4), BRASS, pack, [p.x, p.y, p.z], { dir: pipe1.tangentAt(t), axis: "z" });
  }
  put(sph(0.017, 5, 4), BRASS, pack, [-0.12, 0.655, -0.4]);
  // chimney and puffs of steam
  b.lathe(
    [
      [0, 0],
      [0.02, 0],
      [0.02, 0.06],
      [0.032, 0.095],
      [0.032, 0.105],
      [0.0, 0.105],
    ],
    { at: [-0.16, 0.905, -0.34], bone: pack, color: IRON, segments: 8 },
  );
  const puffs: [number, number, number, number][] = [
    [-0.16, 1.04, -0.34, 0.034],
    [-0.14, 1.1, -0.35, 0.027],
    [-0.17, 1.15, -0.34, 0.021],
  ];
  for (const [px, py, pz, pr] of puffs) put(ico(pr, 1), WHITE, pack, [px, py, pz]);

  // ---------------------------------------------------------------- telescope across the top
  {
    const y = 0.905;
    const z = -0.26;
    put(cyl(0.032, 0.032, 0.17, 8), BRASS, pack, [-0.1, y, z], { dir: [1, 0, 0] });
    put(cyl(0.026, 0.026, 0.14, 8), BRASS_D, pack, [0.07, y, z], { dir: [1, 0, 0] });
    put(cyl(0.02, 0.02, 0.1, 8), BRASS, pack, [0.18, y, z], { dir: [1, 0, 0] });
    put(cyl(0.034, 0.034, 0.014, 8), LEATH_D, pack, [-0.19, y, z], { dir: [1, 0, 0] });
    put(cyl(0.028, 0.028, 0.016, 8), IRON, pack, [-0.2, y, z], { dir: [1, 0, 0] });
    put(cyl(0.022, 0.022, 0.006, 8), GLASS, pack, [-0.207, y, z], { dir: [1, 0, 0] });
    put(cyl(0.026, 0.03, 0.03, 8), IRON, pack, [0.235, y, z], { dir: [1, 0, 0] });
    put(cyl(0.02, 0.02, 0.006, 8), GLASS, pack, [0.252, y, z], { dir: [1, 0, 0] });
    for (const x of [-0.035, 0.0, 0.145, 0.215]) put(tor(x < 0.1 ? 0.03 : 0.02, 0.006, 8, 4), BRASS_D, pack, [x, y, z], { dir: [1, 0, 0], axis: "z" });
    for (const x of [-0.1, 0.1]) put(box(0.02, 0.02, 0.04), LEATH_D, pack, [x, y - 0.04, z]);
  }
  // ---------------------------------------------------------------- spinning rotor
  const rotor = b.joint("rotor", { parent: pack, at: [0.13, 1.06, -0.31], dir: [0, 1, 0], role: "hinge" });
  rod([0.13, 0.915, -0.31], [0.13, 1.06, -0.31], 0.012, IRON, pack, 6);
  put(cyl(0.022, 0.026, 0.026, 8), BRASS, rotor, [0.13, 1.075, -0.31]);
  put(new THREE.ConeGeometry(0.014, 0.036, 6), BRASS_D, rotor, [0.13, 1.105, -0.31]);
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0.02, -0.018],
        [0.09, -0.04],
        [0.16, -0.03],
        [0.175, 0.0],
        [0.16, 0.03],
        [0.09, 0.04],
        [0.02, 0.018],
      ],
      { at: [0.13, 1.072, -0.31], x: [s, 0, 0], y: [0, 0.2, 1], thickness: 0.007, bevel: 0.002, bone: rotor, color: s > 0 ? HAT : CREAM },
    );
  }
  // ---------------------------------------------------------------- dish antenna
  const dish = b.joint("dish", { parent: pack, at: [-0.02, 0.915, -0.27], dir: [0, 1, -0.6], role: "hinge" });
  rod([-0.02, 0.82, -0.27], [-0.02, 0.915, -0.27], 0.01, IRON, pack, 6);
  put(sph(0.02, 5, 4), BRASS, dish, [-0.02, 0.915, -0.27]);
  b.lathe(
    [
      [0, 0],
      [0.035, 0.005],
      [0.065, 0.02],
      [0.088, 0.042],
      [0.088, 0.05],
      [0.062, 0.03],
      [0.032, 0.013],
      [0, 0.008],
    ],
    { at: [-0.02, 0.93, -0.285], axis: [0, 0.6, -0.8], bone: dish, color: STEEL, segments: 10 },
  );
  rod([-0.02, 0.93, -0.285], [-0.02, 0.965, -0.345], 0.004, STEEL_D, dish, 4);
  glow(put(sph(0.013, 5, 3), "#ff6a5a", dish, [-0.02, 0.968, -0.352]), 1.1);

  // ---------------------------------------------------------------- gears on the back
  const gearA = b.joint("gearA", { parent: pack, at: [0.08, 0.5, -0.384], dir: [0, 0, -1], role: "hinge" });
  const gearB = b.joint("gearB", { parent: pack, at: [-0.045, 0.495, -0.384], dir: [0, 0, -1], role: "hinge" });

  const addGear = (j: Joint, x: number, y: number, z: number, teeth: number, ro: number, ri: number, th: number, col: string, hub: string) => {
    b.extrude(gearOutline(teeth, ro, ri), { at: [x, y, z], x: [1, 0, 0], y: [0, 1, 0], thickness: th, bone: j, color: col });
    put(cyl(ri * 0.72, ri * 0.72, th + 0.006, 10), hub, j, [x, y, z], { dir: [0, 0, 1] });
    put(cyl(ri * 0.3, ri * 0.3, th + 0.014, 6), IRON, j, [x, y, z], { dir: [0, 0, 1] });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI;
      rod([x - Math.cos(a) * ri * 0.9, y - Math.sin(a) * ri * 0.9, z - 0.004], [x + Math.cos(a) * ri * 0.9, y + Math.sin(a) * ri * 0.9, z - 0.004], 0.004, col, j, 4);
    }
  };
  addGear(gearA, 0.085, 0.485, -0.405, 10, 0.062, 0.05, 0.016, BRASS, BRASS_D);
  addGear(gearB, -0.043, 0.5, -0.407, 8, 0.05, 0.038, 0.014, COPPER, COPPER_D);
  put(cyl(0.014, 0.014, 0.03, 6), IRON, pack, [0.085, 0.485, -0.397], { dir: [0, 0, 1] });
  // wind-up key on the boiler end
  const key = b.joint("windKey", { parent: pack, at: [-0.155, 0.6, -0.4], dir: [-1, 0, 0], role: "hinge" });
  rod([-0.15, 0.6, -0.4], [-0.19, 0.6, -0.4], 0.008, BRASS_D, key, 6);
  put(box(0.01, 0.06, 0.016), BRASS, key, [-0.2, 0.6, -0.4]);
  put(sph(0.016, 5, 3), BRASS, key, [-0.2, 0.635, -0.4]);
  put(sph(0.016, 5, 3), BRASS, key, [-0.2, 0.565, -0.4]);

  // ---------------------------------------------------------------- blueprint scroll, tied to the right pouch
  put(cyl(0.03, 0.03, 0.3, 8), WHITE, pack, [-0.208, 0.55, -0.18], { dir: [0, 1, 0.12], texture: BLUEPRINT });
  put(cyl(0.032, 0.032, 0.012, 8), CREAM_D, pack, [-0.2, 0.7, -0.164], { dir: [0, 1, 0.12] });
  put(cyl(0.032, 0.032, 0.012, 8), CREAM_D, pack, [-0.216, 0.4, -0.2], { dir: [0, 1, 0.12] });
  put(tor(0.032, 0.005, 8, 4), HAT, pack, [-0.208, 0.58, -0.18], { dir: [0, 1, 0.12], axis: "z" });

  // ---------------------------------------------------------------- lantern on a chain (left side)
  const lantern = b.joint("lantern", { parent: pack, at: [0.22, 0.46, -0.23], dir: [0, -1, 0], role: "hinge" });
  {
    const links: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 4; i++) {
      const g = tor(0.011, 0.0032, 6, 4);
      if (i % 2) g.rotateY(Math.PI / 2);
      links.push(g.translate(0.22, 0.45 - i * 0.018, -0.23));
    }
    merged(links, IRON, lantern);
    const cy = 0.31;
    put(cyl(0.032, 0.032, 0.07, 6), FLAME, lantern, [0.22, cy, -0.23]);
    glow(b.part(ico(0.02, 0), "#fff0a8", { bone: lantern, at: [0.22, cy, -0.23], flat: true }), 1.2);
    put(cyl(0.012, 0.042, 0.022, 6), IRON, lantern, [0.22, cy + 0.046, -0.23]);
    put(cyl(0.042, 0.036, 0.014, 6), IRON, lantern, [0.22, cy - 0.042, -0.23]);
    put(sph(0.01, 4, 3), BRASS, lantern, [0.22, cy + 0.064, -0.23]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      rod([0.22 + Math.cos(a) * 0.036, cy - 0.036, -0.23 + Math.sin(a) * 0.036], [0.22 + Math.cos(a) * 0.036, cy + 0.036, -0.23 + Math.sin(a) * 0.036], 0.0033, IRON, lantern, 4);
    }
  }
  // ---------------------------------------------------------------- kettle on the right
  {
    const kc: V = [-0.23, 0.36, -0.24];
    b.lathe(
      [
        [0, 0],
        [0.04, 0],
        [0.058, 0.025],
        [0.058, 0.05],
        [0.04, 0.075],
        [0.022, 0.082],
        [0.022, 0.09],
        [0.0, 0.092],
      ],
      { at: [kc[0], kc[1] - 0.04, kc[2]], bone: pack, color: COPPER, segments: 8 },
    );
    put(sph(0.014, 5, 3), BRASS, pack, [kc[0], kc[1] + 0.056, kc[2]]);
    b.sweep(
      bezier([kc[0] - 0.05, kc[1] + 0.04, kc[2]], [kc[0] - 0.05, kc[1] + 0.13, kc[2]], [kc[0] + 0.05, kc[1] + 0.13, kc[2]], [kc[0] + 0.05, kc[1] + 0.04, kc[2]]),
      0.005,
      { color: IRON, bone: pack, sides: 4, smooth: false },
    );
    b.spike([kc[0], kc[1] - 0.0, kc[2] + 0.05], [kc[0], kc[1] + 0.04, kc[2] + 0.1], null, 0.013, { color: COPPER_D, bone: pack, sides: 5, smooth: false, caps: "flat" });
    rod([kc[0], kc[1] + 0.12, kc[2]], [-0.22, 0.46, -0.24], 0.004, IRON, pack, 4);
  }
  // ---------------------------------------------------------------- extras: spring coil, small bolts, tag
  {
    const pts: V[] = [];
    for (let i = 0; i <= 28; i++) {
      const a = (i / 28) * Math.PI * 2 * 3.5;
      pts.push([0.13 + Math.cos(a) * 0.016, 0.74 + (i / 28) * 0.1 + 0.0, -0.4 + Math.sin(a) * 0.016]);
    }
    b.sweep(pts, 0.004, { color: STEEL, bone: pack, sides: 4, smooth: false });
  }
  // wrench + pliers poking from left pouch
  {
    rod([0.19, 0.62, -0.26], [0.2, 0.78, -0.255], 0.01, STEEL_D, pack, 6);
    put(box(0.034, 0.03, 0.012), STEEL_D, pack, [0.2, 0.795, -0.255]);
    rod([0.17, 0.62, -0.28], [0.15, 0.76, -0.28], 0.008, HAT, pack, 6);
    rod([0.2, 0.62, -0.23], [0.215, 0.74, -0.22], 0.008, LEATH_L, pack, 6);
  }

  // a clockwork beetle riding the left shoulder
  {
    const sh = arms.L.sh;
    const bx = 0.135;
    const by = 0.738;
    const bz = 0.035;
    put(ico(0.02, 0), BRASS, sh, [bx, by, bz], { scale: [1, 0.7, 1.35] });
    put(sph(0.011, 5, 3), BRASS_D, sh, [bx, by - 0.002, bz + 0.03]);
    put(sph(0.003, 4, 3), INK, sh, [bx + 0.005, by + 0.002, bz + 0.039]);
    put(sph(0.003, 4, 3), INK, sh, [bx - 0.005, by + 0.002, bz + 0.039]);
    rod([bx, by + 0.012, bz - 0.005], [bx, by + 0.012, bz + 0.02], 0.0016, IRON, sh, 4);
    for (const q of [-1, 1])
      for (const k of [-0.012, 0.0, 0.012]) {
        rod([bx + q * 0.012, by - 0.006, bz + k], [bx + q * 0.03, by - 0.018, bz + k * 1.6], 0.0022, IRON, sh, 4);
      }
    put(cyl(0.009, 0.009, 0.003, 8), RED_D, sh, [bx, by + 0.014, bz - 0.012], { dir: [0, 1, 0.2] });
    rod([bx, by + 0.008, bz - 0.028], [bx + 0.02, by + 0.03, bz - 0.04], 0.0025, BRASS_D, sh, 4);
    put(tor(0.009, 0.0022, 6, 4), BRASS_D, sh, [bx + 0.022, by + 0.033, bz - 0.042], { rotation: [0, 70, 0] });
  }
  return b.root;
}
