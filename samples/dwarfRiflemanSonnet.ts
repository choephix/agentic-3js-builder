import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import type { Chain, Joint } from "../src/skeleton";
import { rng } from "../src/math";
import { arc, bezier, catmull, polyline } from "../src/path";
import { glow } from "../kits/glow";
import { grain, mix, mottle, noise, paint, resolve, smoothstep, stripes } from "../src/paint";
import type { ColorInput, Rgb } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "A stocky, heroic dwarf marksman with a braided copper beard, riveted steel pauldrons, a kettle helmet with goggles and plume, a bandolier of cartridges and a brass-bound flintlock blunderbuss, painted in a chunky hand-painted Warcraft look.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (flat colours for small parts; big surfaces use hand-painted paints below)

const SKIN = "#e8a37b";
const BEARD = "#c9632a";
const BEARD_HI = "#f0a345";
const BEARD_DK = "#7a3317";
const STEEL = "#6d80a6";
const STEEL_DK = "#4a5878";
const GOLD = "#f0bb33";
const BRASS = "#c88a2a";
const LEATHER = "#8a512a";
const LEATHER_DK = "#4d2d1a";
const BLUE = "#2f64bd";
const BLUE_DK = "#1c3a85";
const CREAM = "#f0e2bb";
const RED = "#c63a2d";
const WOOD = "#a06636";
const WOOD_DK = "#5a3419";
const PANTS = "#62503f";
const COAL = "#241b26";
const GLASS = "#a8ecff";

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const vv = (a: readonly number[]) => new THREE.Vector3(a[0], a[1], a[2]);

// ---------------------------------------------------------------------------------------------------------------
// Hand-painted paints: warm highlight from the key, cool shadow, brush noise

const KEY = v(0.35, 0.8, 0.5).normalize();
const WARM: Rgb = [1, 0.86, 0.5];
const COOL: Rgb = [0.16, 0.08, 0.3];

function brush(base: ColorInput, o: { seed?: number; hi?: number; lo?: number; mot?: number; size?: number; floor?: number } = {}) {
  const { seed = 1, hi = 0.38, lo = 0.5, mot = 0.5, size = 0.05, floor = 0 } = o;
  return paint((p, n, s) => {
    const bc = resolve(base, p, n);
    void s;
    const d = n.dot(KEY);
    const dark = mix(bc, COOL, lo);
    const light = mix(bc, WARM, hi);
    let c = mix(dark, bc, smoothstep(-0.55, 0.15, d));
    c = mix(c, light, smoothstep(0.4, 0.95, d));
    const m = noise(p, size, seed) - 0.5;
    c = m > 0 ? mix(c, light, m * mot) : mix(c, dark, -m * mot);
    if (floor > 0) c = mix(c, dark, smoothstep(0.22, 0.02, p.y) * floor);
    return c;
  });
}

function steel(base: string, seed = 2, lift = 0.55) {
  const dark = mix(base, COOL, 0.62);
  const light = mix(base, [0.9, 0.95, 1], lift);
  return paint((p, n) => {
    const d = n.dot(KEY);
    let c = mix(dark, base, smoothstep(-0.45, 0.2, d));
    c = mix(c, light, smoothstep(0.35, 0.95, d) * 0.85);
    const speck = noise(p, 0.009, seed);
    if (speck > 0.72) c = mix(c, light, 0.22);
    const pit = noise(p, 0.03, seed + 5);
    if (pit > 0.74) c = mix(c, dark, 0.3 * smoothstep(0.74, 0.85, pit));
    return c;
  });
}

function gilt(base: string, seed = 3) {
  const dark = mix(base, [0.42, 0.18, 0.05], 0.6);
  const light = mix(base, [1, 1, 0.8], 0.6);
  return paint((p, n) => {
    const d = n.dot(KEY);
    let c = mix(dark, base, smoothstep(-0.4, 0.2, d));
    c = mix(c, light, smoothstep(0.35, 0.9, d));
    if (noise(p, 0.01, seed) > 0.7) c = mix(c, light, 0.4);
    return c;
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Drawings

function strandTuft(a: string, bcol: string, c: string, ink: string) {
  return svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 64 C3 50 4 24 12 3 C16 20 18 40 16 64Z" fill="${a}"/>
      <path d="M16 64 C28 50 28 24 21 5 C15 22 14 42 16 64Z" fill="${bcol}"/>
      <path d="M16 64 C9 48 12 26 17 0 C22 26 24 48 16 64Z" fill="${c}"/>
      <path d="M16 60 C14 42 15 24 17 8" stroke="${ink}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <path d="M11 58 C8 44 10 30 12 14" stroke="${ink}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );
}

const BEARD_TUFT = strandTuft("#a94a1d", "#d9732c", "#f2a650", "#6d2c12");
const FUR_TUFT = strandTuft("#d8c9a6", "#efe3c4", "#fff6df", "#9c8c6a");
const HAIR_TUFT = strandTuft("#8a3d17", "#b9561f", "#d9732c", "#4e2210");

const FRINGE = strandTuft("#c9962a", "#f0bb33", "#ffe27a", "#7a5410");

const FEATHER = svg(
  `<svg viewBox="0 0 24 96" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 96 C0 80 0 36 10 4 C12 -2 12 -2 14 4 C24 36 24 80 12 96Z" fill="#c9372b"/>
    <path d="M12 96 C20 80 22 40 14 6 C12 40 14 70 12 96Z" fill="#e5594a"/>
    <path d="M12 94 L12 6" stroke="#f6e3b0" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M12 70 L4 60 M12 56 L3 44 M12 42 L5 30 M12 70 L20 60 M12 56 L21 44 M12 42 L19 30" stroke="#8d1d1a" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);

const EYE = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 24 Q32 -4 61 24 Q32 40 3 24Z" fill="#f7ecd2" stroke="#2a1608" stroke-width="2.4" stroke-linejoin="round"/>
    <circle cx="33" cy="21" r="12" fill="#1f6fcf"/>
    <circle cx="33" cy="24" r="9" fill="#4db3f0"/>
    <path d="M21 17 Q33 5 45 17 Q33 11 21 17Z" fill="#12408a"/>
    <circle cx="33" cy="21" r="5" fill="#0a0c18"/>
    <circle cx="38" cy="16.5" r="3" fill="#ffffff"/>
    <circle cx="29" cy="26" r="1.4" fill="#d6f1ff"/>
    <path d="M3 24 Q32 -4 61 24" fill="none" stroke="#2a1608" stroke-width="4" stroke-linecap="round"/>
    <path d="M10 28 Q32 38 54 28" fill="none" stroke="#a5583a" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const SCROLL = svg(
  `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#f4c443" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 20 C16 2 36 4 40 16 C44 27 30 31 29 22 C28 16 36 14 38 19"/>
      <path d="M114 20 C104 2 84 4 80 16 C76 27 90 31 91 22 C92 16 84 14 82 19"/>
      <path d="M40 16 C50 6 70 6 80 16"/>
      <path d="M46 24 C54 34 66 34 74 24"/>
      <path d="M16 12 C14 6 20 4 22 8"/>
      <path d="M104 12 C106 6 100 4 98 8"/>
    </g>
    <circle cx="60" cy="20" r="5" fill="#f4c443"/>
    <circle cx="60" cy="20" r="2" fill="#7a3a10"/>
  </svg>`,
  { size: 512 },
);

const BUCKLE = svg(
  `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="62" height="46" rx="6" fill="#d9a032" stroke="#6b3a10" stroke-width="3"/>
    <rect x="7" y="7" width="50" height="34" rx="4" fill="none" stroke="#fbe08a" stroke-width="2.4"/>
    <path d="M32 11 L46 24 L32 37 L18 24Z" fill="#a1521b" stroke="#fbe08a" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M32 18 L38 24 L32 30 L26 24Z" fill="#fbe08a"/>
  </svg>`,
  { size: 256 },
);

const SCAR = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 4 L26 44" stroke="#f5cbb0" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M3 14 L11 10 M7 22 L15 18 M12 31 L20 27 M16 39 L24 35" stroke="#7a2d25" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);

const RUNES = svg(
  `<svg viewBox="0 0 64 24" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#f4c443" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <path d="M5 4 L5 20 M5 12 L13 6 M5 12 L13 18"/>
      <path d="M22 20 L22 4 L30 12 L22 20"/>
      <path d="M36 4 L44 20 L36 20 M44 4 L36 12"/>
      <path d="M52 4 L52 20 M52 8 L60 4 M52 20 L60 14"/>
    </g>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------

function ip(t: number, keys: number[], vals: number[]) {
  if (t <= keys[0]) return vals[0];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i]) {
      const k = (t - keys[i - 1]) / (keys[i] - keys[i - 1]);
      const e = k * k * (3 - 2 * k);
      return vals[i - 1] + (vals[i] - vals[i - 1]) * e;
    }
  }
  return vals[vals.length - 1];
}

export default function build() {
  const b = createBuilder({ name: "dwarfRifleman", paintSize: 2048 });
  const R = rng(11);

  // ---- paints ------------------------------------------------------------------------------------------------
  const HEAD_C = v(0, 1.15, 0.05);
  const skinBase = paint((p) => {
    let c: Rgb = mix(SKIN, "#d98d68", noise(p, 0.07, 4));
    for (const x of [-1, 1]) {
      const d = Math.hypot(p.x - x * 0.078, p.y - 1.115, p.z - 0.15);
      c = mix(c, "#e0605a", 0.55 * smoothstep(0.065, 0.0, d));
    }
    const dn = Math.hypot(p.x, p.y - 1.118, p.z - 0.235);
    c = mix(c, "#e2574d", 0.7 * smoothstep(0.06, 0.01, dn));
    c = mix(c, "#9c5a44", 0.35 * smoothstep(1.16, 1.2, p.y) * smoothstep(0.1, 0.17, p.z));
    return c;
  });
  const SKIN_P = brush(skinBase, { seed: 5, mot: 0.35, hi: 0.3, lo: 0.4 });
  const BEARD_P = brush(grain(BEARD, BEARD_DK, { size: 0.016, axis: "y", seed: 7 }), { seed: 8, mot: 0.6, hi: 0.5, lo: 0.45 });
  const BEARD_P2 = brush(grain(BEARD_HI, BEARD, { size: 0.016, axis: "y", seed: 9 }), { seed: 10, mot: 0.6, hi: 0.4, lo: 0.4 });
  const LEATHER_P = brush(mottle(LEATHER, LEATHER_DK, { size: 0.06, contrast: 0.5, seed: 12 }), { seed: 13, mot: 0.5 });
  const VEST_P = brush(
    paint((p) => {
      let c: Rgb = mix(LEATHER, LEATHER_DK, noise(p, 0.07, 12) * 0.6);
      const ax = Math.abs(p.x);
      const dash = (q: number) => Math.floor(q / 0.009) % 2 === 0;
      if (p.y > 0.72) {
        if (Math.abs(ax - 0.1) < 0.0028) c = mix(c, LEATHER_DK, 0.85);
        if (Math.abs(ax - 0.108) < 0.0013 && dash(p.y)) c = mix(c, CREAM, 0.9);
        if (Math.abs(ax - 0.092) < 0.0013 && dash(p.y)) c = mix(c, CREAM, 0.9);
      }
      if (Math.abs(p.y - 0.8) < 0.0028) c = mix(c, LEATHER_DK, 0.85);
      if (Math.abs(p.y - 0.809) < 0.0013 && dash(p.x)) c = mix(c, CREAM, 0.9);
      if (Math.abs(p.y - 0.791) < 0.0013 && dash(p.x)) c = mix(c, CREAM, 0.9);
      return c;
    }),
    { seed: 13, mot: 0.4 },
  );
  const LEATHER_D_P = brush(mottle(LEATHER_DK, "#2c170c", { size: 0.05, contrast: 0.5, seed: 14 }), { seed: 15 });
  const BLUE_P = brush(mottle(BLUE, BLUE_DK, { size: 0.05, contrast: 0.35, seed: 16 }), { seed: 17, mot: 0.45 });
  const PANTS_P = brush(mottle(PANTS, "#4a3b2e", { size: 0.06, contrast: 0.5, seed: 18 }), { seed: 19, floor: 0 });
  const BOOT_P = brush(mottle("#6e3f21", "#3e2214", { size: 0.05, contrast: 0.55, seed: 20 }), { seed: 21, floor: 0.6 });
  const STEEL_P = steel(STEEL, 22);
  const BARREL_P = steel("#6f7c98", 41);
  const IRON_P = steel("#242a3b", 43, 0.12);
  const STEEL_D_P = steel(STEEL_DK, 23);
  const GOLD_P = gilt(GOLD, 24);
  const BRASS_P = gilt(BRASS, 25);
  const WOOD_P = (axis: THREE.Vector3) => {
    const ref = Math.abs(axis.y) > 0.9 ? v(1, 0, 0) : v(0, 1, 0);
    const side1 = new THREE.Vector3().crossVectors(axis, ref).normalize();
    const side2 = new THREE.Vector3().crossVectors(axis, side1).normalize();
    const q = new THREE.Vector3();
    return brush(
      paint((p) => {
        const along = p.dot(axis);
        const wob = noise(q.set(p.dot(side1) * 2, p.dot(side2) * 2, along * 0.35), 0.06, 26) * 7;
        const band = 0.5 + 0.5 * Math.sin(p.dot(side2) * 300 + p.dot(side1) * 140 + wob * 3);
        const c = mix(WOOD_DK, WOOD, smoothstep(0.2, 0.8, band));
        return noise(p, 0.012, 27) > 0.78 ? mix(c, WOOD_DK, 0.5) : c;
      }),
      { seed: 27, mot: 0.25 },
    );
  };
  const HORN_P = paint((_p, n, s) => {
    const base = mix(CREAM, "#6a4526", smoothstep(0.35, 1, s[0]));
    const c = Math.abs(Math.sin(s[0] * 38)) > 0.93 ? mix("#8a5a2c", "#8a5a2c", 0) : base;
    const dd = n.dot(KEY);
    return mix(mix(c, COOL, 0.35), mix(c, WARM, 0.25), smoothstep(-0.4, 0.6, dd));
  });
  const WOOL_P = brush(stripes("#7a5a3a", "#b4452d", { size: 0.04, axis: "x", width: 0.45, seed: 3 }), { seed: 28, mot: 0.4 });

  // ---- skeleton ----------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.56, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.56, 0],
      [0, 0.72, 0.012],
      [0, 0.95, 0.035],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const spine1 = spine.joints[0];
  const spine2 = spine.joints[1];
  const chest = spine.tip!;
  const neckC = b.chain(
    "neck",
    polyline([
      [0, 0.95, 0.035],
      [0, 1.03, 0.058],
    ]),
    { parent: chest, names: ["neck"], role: "neck" },
  );
  const neck = neckC.joints[0];
  const head = b.joint("head", { parent: neck, at: [0, 1.03, 0.058], dir: [0, 1, 0.1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.12, 0.035], aim: [0, 1.07, 0.17], role: "jaw" });

  // =============================================================================================================
  // LEGS and BOOTS
  // =============================================================================================================
  b.part(new THREE.SphereGeometry(1, 12, 8), PANTS_P, { bone: hips, at: [0, 0.575, 0], scale: [0.2, 0.115, 0.15], name: "pelvis" });

  const legs: Record<string, Chain> = {};
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hipP = [s * 0.115, 0.56, 0];
    const kneeP = [s * 0.125, 0.3, 0.05];
    const ankleP = [s * 0.125, 0.1, -0.005];
    const toeP = [s * 0.125, 0.072, 0.17];
    const leg = b.chain(`leg${S}`, polyline([hipP, kneeP, ankleP, toeP]), {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `toe${S}`],
      role: "leg",
      contact: [s * 0.125, 0, 0.05],
    });
    legs[S] = leg;
    const [hipJ, kneeJ, ankleJ] = leg.joints;
    // trousers
    b.sweep(leg, (t) => ip(t, [0, 0.4, 0.55], [0.108, 0.092, 0.088]), { to: 0.58, color: PANTS_P, sides: 8, name: `trouser${S}` });
    // boot: tall shaft into a chunky foot
    b.sweep(
      leg,
      (t) => [ip(t, [0.5, 0.71, 0.86, 1], [0.093, 0.092, 0.098, 0.088]), ip(t, [0.5, 0.71, 0.86, 1], [0.093, 0.082, 0.07, 0.062])] as [number, number],
      { from: 0.5, color: BOOT_P, sides: 8, name: `boot${S}` },
    );
    // sole (flat extrude on the floor), heel block
    const sole: OutlinePoint[] = [
      [-0.085, -0.075],
      [-0.095, 0.0],
      [-0.09, 0.1],
      [-0.1, 0.21],
      [-0.07, 0.275],
      [0.0, 0.3],
      [0.07, 0.275],
      [0.1, 0.21],
      [0.09, 0.1],
      [0.095, 0.0],
      [0.085, -0.075],
      [0.05, -0.115],
      [-0.05, -0.115],
    ];
    b.extrude(sole, {
      at: [s * 0.125, 0.0165, -0.01],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.033,
      bevel: 0.006,
      smoothing: 1,
      color: LEATHER_D_P,
      bone: ankleJ,
      name: `sole${S}`,
    });
    // heel
    b.part(new THREE.BoxGeometry(0.15, 0.04, 0.09), LEATHER_D_P, { bone: ankleJ, at: [s * 0.125, 0.052, -0.075], flat: true, name: `heel${S}` });
    // toe cap in steel with gold rivets
    b.part(new THREE.SphereGeometry(1, 10, 7), IRON_P, {
      bone: ankleJ,
      at: [s * 0.125, 0.066, 0.19],
      scale: [0.09, 0.062, 0.075],
      name: `toecap${S}`,
    });
    b.part(new THREE.TorusGeometry(0.068, 0.007, 4, 12), GOLD_P, { bone: ankleJ, at: [s * 0.125, 0.085, 0.145], dir: [0, 0.15, 1], axis: "z", name: `toeBand${S}` });
    // instep straps with buckles round the foot
    for (const z of [0.045, 0.115]) {
      const cy = 0.1 - (0.028 * (z + 0.005)) / 0.175;
      const rxs = 0.0965;
      const rys = 0.073;
      const ring: number[][] = [];
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        ring.push([s * 0.125 + Math.cos(a) * rxs, cy + Math.sin(a) * rys, z]);
      }
      b.sweep(catmull(ring, { closed: true }), [0.011, 0.005], { color: LEATHER_D_P, section: "box", bone: ankleJ, name: `instep${S}` });
      b.part(new THREE.BoxGeometry(0.014, 0.03, 0.024), BRASS_P, { bone: ankleJ, at: [s * 0.125 + s * rxs, cy, z], flat: true, name: `instepBuckle${S}` });
    }
    // cuff roll at the top of the boot
    const shinDir = vv(ankleP).sub(vv(kneeP)).normalize();
    const cuffAt = vv(kneeP).addScaledVector(shinDir, 0.045);
    b.lathe(
      [
        [0.088, -0.03],
        [0.118, -0.034, "sharp"],
        [0.126, 0.0],
        [0.118, 0.034, "sharp"],
        [0.092, 0.03],
      ],
      { at: cuffAt, axis: [shinDir.x, shinDir.y, shinDir.z], segments: 10, smoothing: 0, color: LEATHER_P, bone: kneeJ, name: `cuff${S}` },
    );
    // buckle straps around the shin
    for (const k of [0.45, 0.78]) {
      const at = vv(kneeP).addScaledVector(shinDir, 0.2 * k + 0.07);
      b.part(new THREE.TorusGeometry(0.094 + 0.0005, 0.0075, 4, 12), LEATHER_D_P, { bone: kneeJ, at, dir: shinDir, axis: "z", name: `shinStrap${S}` });
      const front = at.clone().add(v(0, 0, 0.098));
      b.part(new THREE.BoxGeometry(0.03, 0.026, 0.01), BRASS_P, { bone: kneeJ, at: front, dir: [0, 0, 1], axis: "z", flat: true, name: `shinBuckle${S}` });
    }
    // knee guard
    const kneeFront = vv(kneeP).add(v(0, 0.0, 0.09));
    b.part(new THREE.SphereGeometry(1, 10, 7), STEEL_P, { bone: kneeJ, at: kneeFront, scale: [0.075, 0.075, 0.04], name: `kneeguard${S}` });
    b.part(new THREE.TorusGeometry(0.07, 0.008, 5, 12), GOLD_P, { bone: kneeJ, at: kneeFront.clone().add(v(0, 0, 0.005)), dir: [0, 0, 1], axis: "z", name: `kneeRim${S}` });
    const kr = new THREE.SphereGeometry(0.009, 5, 4);
    const krs = [0, 1, 2, 3, 4, 5].map((i) => {
      const a = (i / 6) * Math.PI * 2;
      return kr.clone().translate(kneeFront.x + Math.cos(a) * 0.055, kneeFront.y + Math.sin(a) * 0.055, kneeFront.z + 0.031);
    });
    b.part(mergeGeometries(krs), GOLD_P, { bone: kneeJ, at: [0, 0, 0], name: `kneeRivets${S}` });
    // cargo pocket on the outer thigh
    b.part(new THREE.BoxGeometry(0.034, 0.1, 0.085), LEATHER_P, { bone: hipJ, at: [s * 0.228, 0.385, 0.015], flat: true, name: `thighPocket${S}` });
    b.part(new THREE.BoxGeometry(0.036, 0.034, 0.088), LEATHER_D_P, { bone: hipJ, at: [s * 0.229, 0.43, 0.015], flat: true, name: `thighPocketFlap${S}` });
    b.part(new THREE.SphereGeometry(0.01, 5, 4), BRASS_P, { bone: hipJ, at: [s * 0.246, 0.425, 0.015], name: `thighPocketStud${S}` });
    // thigh strap with pouch loop
    b.part(new THREE.TorusGeometry(0.106, 0.009, 4, 14), LEATHER_D_P, { bone: hipJ, at: [s * 0.119, 0.43, 0.02], dir: [s * 0.04, 1, 0.2], axis: "z", name: `thighStrap${S}` });
  }

  // =============================================================================================================
  // TORSO
  // =============================================================================================================
  const torsoR = (t: number) =>
    [ip(t, [0, 0.3, 0.62, 0.85, 1], [0.178, 0.165, 0.205, 0.225, 0.205]), ip(t, [0, 0.3, 0.62, 0.85, 1], [0.135, 0.13, 0.15, 0.155, 0.14])] as [number, number];
  const torso = b.sweep(spine, torsoR, {
    color: VEST_P,
    sectors: [
      [148, 152, LEATHER_D_P],
      [152, 208, BLUE_P],
      [208, 212, LEATHER_D_P],
    ],
    shift: [0, -0.012],
    sides: 12,
    name: "torso",
  });
  // yoke across the shoulders
  const yokeSweep = b.capsule([-0.2, 0.955, 0.005], [0.2, 0.955, 0.005], 0.082, { bone: chest, color: BLUE_P, sides: 8, name: "yoke" });
  // belly bulge under the belt
  b.part(new THREE.SphereGeometry(1, 10, 8), BLUE_P, { bone: spine1, at: [0, 0.68, 0.06], scale: [0.15, 0.1, 0.1], name: "belly" });

  const skinT = b.surface(torso);

  // belt
  const beltLoop = skinT.loop([0, 0.615, 0.0], { lift: 0.006 });
  b.sweep(beltLoop, [0.03, 0.014], { color: LEATHER_D_P, section: "box", bone: spine1, name: "belt" });
  b.sweep(skinT.loop([0, 0.62, 0.0], { lift: 0.016 }), [0.004, 0.004], { color: GOLD_P, section: "box", bone: spine1, name: "beltInlay" });
  // buckle
  const buckleHit = skinT.ray([0, 0.615, 0.5], [0, 0, -1]);
  const buckleAt = buckleHit ? buckleHit.at.clone().add(v(0, 0, 0.022)) : v(0, 0.615, 0.17);
  b.part(new THREE.BoxGeometry(0.1, 0.075, 0.016), GOLD_P, { bone: spine1, at: buckleAt, flat: true, name: "buckle" });
  b.part(new THREE.PlaneGeometry(0.088, 0.066), "#ffffff", { bone: spine1, at: buckleAt.clone().add(v(0, 0, 0.0095)), dir: [0, 0, 1], axis: "z", texture: BUCKLE, name: "buckleFace" });
  // belt rivets
  {
    const gs: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const hit = skinT.ray([Math.cos(a) * 0.5, 0.64, Math.sin(a) * 0.5 + 0.01], [-Math.cos(a), 0, -Math.sin(a)]);
      if (!hit || Math.abs(a - Math.PI / 2) < 0.28) continue;
      const q = hit.at.clone().addScaledVector(hit.n, 0.016);
      gs.push(new THREE.SphereGeometry(0.0065, 5, 4).translate(q.x, q.y, q.z));
    }
    b.part(mergeGeometries(gs), BRASS_P, { bone: spine1, at: [0, 0, 0], name: "beltRivets" });
  }

  // tabard flap (front apron) in blue with gold border and runes
  const apron: OutlinePoint[] = [
    [-0.09, 0],
    [0.09, 0],
    [0.095, -0.12],
    [0.0, -0.205, "sharp"],
    [-0.095, -0.12],
  ];
  b.extrude(apron, { at: [0, 0.585, 0.175], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, color: BLUE_P, bone: hips, name: "apron" });
  b.extrude(
    [
      [-0.098, 0.004],
      [0.098, 0.004],
      [0.104, -0.123],
      [0.0, -0.218, "sharp"],
      [-0.104, -0.123],
      [-0.082, -0.115],
      [0.0, -0.186, "sharp"],
      [0.082, -0.115],
      [0.078, -0.012],
      [-0.078, -0.012],
    ],
    { at: [0, 0.585, 0.1715], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.011, bevel: 0.002, color: GOLD_P, bone: hips, name: "apronTrim" },
  );
  b.part(new THREE.PlaneGeometry(0.1, 0.0375), "#ffffff", { bone: hips, at: [0, 0.535, 0.1825], dir: [0, 0, 1], axis: "z", texture: RUNES, name: "apronRunes" });
  // leather side faulds over the hips
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    b.extrude(
      [
        [-0.05, 0],
        [0.05, 0],
        [0.045, -0.11],
        [0.0, -0.15, "sharp"],
        [-0.045, -0.11],
      ],
      {
        at: [s * 0.185, 0.6, 0.075],
        x: [0.55, 0, -0.85],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.003,
        color: LEATHER_P,
        bone: hips,
        name: `fauld${S}`,
      },
    );
  }

  // gold fringe along the apron's lower edge
  {
    const fr: Frame[] = [];
    for (let i = 0; i < 11; i++) {
      const k = i / 10;
      const x = -0.1 + 0.2 * k;
      const y = 0.585 - 0.12 - (0.095 - Math.abs(x)) * (0.085 / 0.095) + 0.0;
      fr.push(frame([x, y, 0.186], [0, 1, 0]));
    }
    b.cards(fr, FRINGE, { size: [0.03, 0.045], lean: 180, flow: [0, 0, 1], bone: hips });
  }
  // brass buttons down the tunic front and a chest strap with a ring
  {
    const gs: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 5; i++) {
      const y = 0.66 + i * 0.045;
      const hit = skinT.ray([0, y, 0.6], [0, 0, -1]);
      if (!hit) continue;
      const q = hit.at.clone().addScaledVector(hit.n, 0.008);
      gs.push(new THREE.SphereGeometry(0.0125, 6, 5).translate(q.x, q.y, q.z));
    }
    b.part(mergeGeometries(gs), GOLD_P, { bone: spine2, at: [0, 0, 0], name: "buttons" });
    b.sweep(skinT.loop([0, 0.835, 0.0], { lift: 0.005 }), [0.014, 0.006], { color: LEATHER_D_P, section: "box", bone: spine2, name: "chestStrap" });
    const ringHit = skinT.ray([0, 0.835, 0.6], [0, 0, -1]);
    if (ringHit) b.part(new THREE.TorusGeometry(0.026, 0.006, 5, 12), BRASS_P, { bone: spine2, at: ringHit.at.clone().add(v(0, 0, 0.012)), dir: [0, 0, 1], axis: "z", name: "chestRing" });
  }

  // bandolier: diagonal strap with brass cartridge tubes
  const bandPath = catmull(
    [
      [0.17, 0.985, 0.06],
      [0.08, 0.9, 0.18],
      [-0.06, 0.8, 0.205],
      [-0.2, 0.68, 0.12],
      [-0.215, 0.7, -0.02],
      [-0.17, 0.8, -0.13],
      [-0.03, 0.9, -0.17],
      [0.12, 0.98, -0.12],
      [0.215, 0.995, 0.0],
    ],
    { closed: true },
  );
  const band = skinT.drape(bandPath, { lift: 0.006 });
  b.sweep(band, [0.022, 0.008], { color: LEATHER_D_P, section: "box", bone: spine2, name: "bandolier" });
  const frontBand = band.slice(0.0, 0.34);
  {
    const sh: THREE.BufferGeometry[] = [];
    const cap: THREE.BufferGeometry[] = [];
    const N = 9;
    for (let i = 0; i < N; i++) {
      const t = 0.07 + (0.9 * (i + 0.5)) / N;
      const p = frontBand.at(t);
      const tan = frontBand.tangentAt(t);
      const hit = skinT.nearest(p);
      const nn = hit.n;
      const across = new THREE.Vector3().crossVectors(tan, nn).normalize();
      const c = p.clone().addScaledVector(nn, 0.022);
      const q = new THREE.Quaternion().setFromUnitVectors(v(0, 1, 0), across);
      const m = new THREE.Matrix4().compose(c, q, v(1, 1, 1));
      sh.push(new THREE.CylinderGeometry(0.0145, 0.0145, 0.052, 7).applyMatrix4(m));
      const m2 = new THREE.Matrix4().compose(c.clone().addScaledVector(across, 0.03), q, v(1, 1, 1));
      cap.push(new THREE.CylinderGeometry(0.0155, 0.0155, 0.014, 7).applyMatrix4(m2));
    }
    b.part(mergeGeometries(sh), RED, { bone: spine2, at: [0, 0, 0], name: "cartridges" });
    b.part(mergeGeometries(cap), BRASS_P, { bone: spine2, at: [0, 0, 0], name: "cartridgeCaps" });
  }
  // strap loops holding the cartridges
  for (const t of [0.18, 0.33, 0.48, 0.63, 0.78]) {
    const p = frontBand.at(t);
    const tan = frontBand.tangentAt(t);
    const nn = skinT.nearest(p).n;
    b.part(new THREE.BoxGeometry(0.05, 0.004, 0.012), LEATHER_D_P, { bone: spine2, at: p.clone().addScaledVector(nn, 0.0385), dir: tan, up: nn, flat: true, name: "bandLoop" });
  }

  // fur mantle across the shoulders
  {
    const yokeHits = b.surface(yokeSweep).scatter(110, { rng: rng(31), minDist: 0.03, filter: (h) => h.n.y > 0.25 });
    b.cards(yokeHits, FUR_TUFT, { size: [0.055, 0.075], lean: 55, flow: [0, 0.5, 0.2], bend: 25, vary: 0.25, rng: rng(32), bone: chest });
  }
  // suspenders from belt over the shoulders to the pack
  for (const s of [1, -1]) {
    const route = skinT.drape(
      catmull([
        [s * 0.105, 0.635, 0.14],
        [s * 0.115, 0.8, 0.19],
        [s * 0.125, 0.95, 0.12],
        [s * 0.14, 0.99, 0.0],
        [s * 0.12, 0.92, -0.12],
        [s * 0.1, 0.77, -0.16],
      ]),
      { lift: 0.006 },
    );
    b.sweep(route, [0.02, 0.0075], { color: LEATHER_D_P, section: "box", bone: spine2, name: "suspender" });
    const q = route.at(0.2);
    b.part(new THREE.TorusGeometry(0.018, 0.005, 4, 8), BRASS_P, { bone: spine2, at: q.clone().add(v(0, 0, 0.012)), dir: [0, 0, 1], axis: "z", name: "suspenderRing" });
  }
  // gold badge on the left breast
  {
    const hit = skinT.ray([0.125, 0.835, 0.6], [0, 0, -1]);
    if (hit) b.decal(torso, BUCKLE, { at: hit, size: [0.058, 0.043], name: "badge", bone: spine2 });
  }

  // powder horn on the left hip
  b.sweep(
    bezier([0.2, 0.62, 0.02], [0.3, 0.57, 0.02], [0.3, 0.46, 0.12], [0.2, 0.42, 0.13]),
    [0.036, 0.011],
    { color: HORN_P, bone: hips, caps: { start: "flat", end: "round" }, sides: 8, name: "powderHorn" },
  );
  b.part(new THREE.CylinderGeometry(0.039, 0.037, 0.026, 8), BRASS_P, { bone: hips, at: [0.202, 0.617, 0.02], dir: [-0.9, 0.15, 0.0], name: "hornCap" });
  b.sweep(catmull([[0.19, 0.63, 0.03], [0.17, 0.66, 0.1], [0.12, 0.64, 0.15]]), 0.004, { color: LEATHER_D_P, bone: hips, name: "hornCord" });
  b.part(new THREE.SphereGeometry(0.013, 6, 4), BRASS_P, { bone: hips, at: [0.2, 0.42, 0.135], name: "hornTip" });
  // shot pouch on the right hip
  b.part(new THREE.BoxGeometry(0.1, 0.105, 0.06), LEATHER_P, { bone: hips, at: [-0.205, 0.545, 0.06], rotation: [0, -14, 0], flat: true, name: "pouch" });
  b.extrude(
    [
      [-0.054, 0],
      [0.054, 0],
      [0.054, -0.06],
      [0.0, -0.085, "sharp"],
      [-0.054, -0.06],
    ],
    { at: [-0.205, 0.603, 0.092], x: [0.97, 0, 0.24], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, color: LEATHER_D_P, bone: hips, name: "pouchFlap" },
  );
  b.part(new THREE.SphereGeometry(0.014, 6, 5), BRASS_P, { bone: hips, at: [-0.212, 0.54, 0.1], name: "pouchStud" });
  // tankard on a hook at the back left
  b.part(new THREE.CylinderGeometry(0.036, 0.04, 0.085, 10), STEEL_P, { bone: hips, at: [0.18, 0.55, -0.145], name: "tankard" });
  b.part(new THREE.TorusGeometry(0.039, 0.005, 4, 12), GOLD_P, { bone: hips, at: [0.18, 0.575, -0.145], dir: [0, 1, 0], axis: "z", name: "tankardBand" });
  b.part(new THREE.TorusGeometry(0.025, 0.006, 5, 10, Math.PI), STEEL_D_P, { bone: hips, at: [0.2, 0.55, -0.145], rotation: [0, 0, -90], name: "tankardHandle" });
  // hand axe at the back right
  b.rod([-0.17, 0.64, -0.14], [-0.2, 0.42, -0.2], 0.012, { bone: hips, color: WOOD_P(v(0, 1, 0)), name: "axeHandle" });
  b.extrude(
    [
      [0, 0],
      [0.07, 0.03],
      [0.085, -0.03],
      [0.07, -0.085],
      [0, -0.06],
    ],
    { at: [-0.182, 0.5, -0.17], x: [-0.2, 0, -1], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, color: STEEL_P, bone: hips, name: "axeHead" },
  );
  b.part(new THREE.SphereGeometry(0.014, 5, 4), GOLD_P, { bone: hips, at: [-0.178, 0.645, -0.14], name: "axePommel" });
  // dagger at front left belt
  b.rod([0.1, 0.64, 0.15], [0.17, 0.5, 0.17], [0.015, 0.011], { bone: hips, color: LEATHER_D_P, name: "sheath" });
  b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.05, 6), WOOD_P(v(0, 1, 0)), { bone: hips, at: [0.095, 0.66, 0.145], rotation: [0, 0, 24], name: "daggerHilt" });
  b.part(new THREE.BoxGeometry(0.06, 0.01, 0.012), BRASS_P, { bone: hips, at: [0.11, 0.627, 0.147], rotation: [0, 0, 24], flat: true, name: "daggerGuard" });
  b.part(new THREE.SphereGeometry(0.0125, 6, 5), GOLD_P, { bone: hips, at: [0.09, 0.685, 0.143], name: "daggerPommel" });

  // backpack and bedroll
  b.part(new THREE.BoxGeometry(0.3, 0.3, 0.13), LEATHER_P, { bone: spine2, at: [0, 0.78, -0.2], flat: true, name: "pack" });
  b.extrude(
    [
      [-0.155, 0],
      [0.155, 0],
      [0.155, -0.1],
      [0.0, -0.17, "sharp"],
      [-0.155, -0.1],
    ],
    { at: [0, 0.935, -0.265], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.014, bevel: 0.004, smoothing: 1, color: LEATHER_D_P, bone: spine2, name: "packFlap" },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.03, 0.04, 0.012), BRASS_P, { bone: spine2, at: [s * 0.07, 0.845, -0.274], flat: true, name: "packBuckle" });
    b.sweep(polyline([[s * 0.07, 0.86, -0.272], [s * 0.07, 0.78, -0.272]]), [0.012, 0.004], { color: LEATHER_D_P, section: "box", bone: spine2, name: "packStrap" });
  }
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.06, 0.1, 0.08), LEATHER_P, { bone: spine2, at: [s * 0.18, 0.72, -0.2], flat: true, name: "packPocket" });
    b.part(new THREE.BoxGeometry(0.062, 0.03, 0.082), LEATHER_D_P, { bone: spine2, at: [s * 0.18, 0.755, -0.2], flat: true, name: "packPocketFlap" });
    b.part(new THREE.SphereGeometry(0.009, 5, 4), BRASS_P, { bone: spine2, at: [s * 0.18, 0.745, -0.242], name: "packPocketStud" });
  }
  b.part(new THREE.PlaneGeometry(0.1, 0.075), "#ffffff", { bone: spine2, at: [0, 0.745, -0.2815], dir: [0, 0, -1], axis: "z", texture: BUCKLE, name: "packBadge" });
  b.capsule([-0.2, 0.97, -0.21], [0.2, 0.97, -0.21], 0.065, { bone: chest, color: WOOL_P, sides: 10, name: "bedroll" });
  for (const x of [-0.12, 0.12]) b.part(new THREE.TorusGeometry(0.066, 0.008, 4, 12), LEATHER_D_P, { bone: chest, at: [x, 0.97, -0.21], dir: [1, 0, 0], axis: "z", name: "bedrollTie" });
  // tin cup + rope on pack
  b.part(new THREE.CylinderGeometry(0.036, 0.03, 0.055, 9), STEEL_P, { bone: spine2, at: [0.12, 0.68, -0.285], name: "tinCup" });
  b.part(new THREE.TorusGeometry(0.02, 0.005, 4, 8, Math.PI * 1.1), STEEL_D_P, { bone: spine2, at: [0.15, 0.68, -0.285], rotation: [0, 0, -90], name: "cupHandle" });
  for (let i = 0; i < 4; i++) b.part(new THREE.TorusGeometry(0.04, 0.007, 4, 12), "#c9a96a", { bone: spine2, at: [-0.1, 0.7 + i * 0.013 - 0.02, -0.28], dir: [0, 0, 1], axis: "z", name: "rope" });
  // =============================================================================================================
  // ARMS
  // =============================================================================================================
  const arms: Record<string, Chain> = {};
  const ARM_R = [0.09, 0.086, 0.077, 0.071, 0.066];
  const armPts: Record<string, number[][]> = {
    L: [
      [0.31, 0.92, 0],
      [0.4, 0.7, -0.015],
      [0.46, 0.505, 0.035],
    ],
    R: [
      [-0.31, 0.92, 0],
      [-0.395, 0.7, -0.04],
      [-0.47, 0.605, 0.15],
    ],
  };
  const hands: Record<string, Joint> = {};
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const clav = b.joint(`clav${S}`, { parent: chest, at: [s * 0.13, 0.935, 0.02], aim: [s * 0.3, 0.925, 0.0] });
    const pts = armPts[S];
    const arm = b.chain(`arm${S}`, polyline(pts), { parent: clav, names: [`shoulder${S}`, `elbow${S}`, `hand${S}`], role: "arm" });
    arms[S] = arm;
    const [shoulderJ, elbowJ, handJ] = arm.joints;
    hands[S] = handJ;
    b.sweep(arm, ARM_R, { color: BLUE_P, sides: 8, name: `sleeve${S}` });
    // leather bracer on forearm
    b.sweep(arm, (t) => ip(t, [0.5, 0.62, 0.9, 1], [0.0, 0.082, 0.078, 0.07]) + 0.0, {
      from: 0.52,
      to: 0.98,
      color: LEATHER_P,
      sides: 8,
      caps: "flat",
      name: `bracer${S}`,
    });
    // bracer straps and studs
    for (const t of [0.66, 0.78, 0.9]) {
      const c = arm.at(t);
      b.part(new THREE.TorusGeometry(0.084 - (t - 0.66) * 0.05, 0.006, 4, 10), STEEL_P, { bone: elbowJ, at: c.at, dir: c.tangent, axis: "z", name: `bracerBand${S}` });
    }
    // arm bands under the pauldron
    for (const [t, tube, col] of [
      [0.17, 0.011, LEATHER_D_P],
      [0.22, 0.006, GOLD_P],
    ] as const) {
      const c = arm.at(t);
      b.part(new THREE.TorusGeometry(0.095, tube, 5, 12), col, { bone: shoulderJ, at: c.at, dir: c.tangent, axis: "z", name: `armBand${S}` });
    }
    // elbow cop
    const ec = arm.at(0.5);
    b.part(new THREE.SphereGeometry(1, 9, 6), STEEL_P, { bone: elbowJ, at: vv(pts[1]).add(v(s * 0.045, -0.005, -0.04)), scale: [0.04, 0.05, 0.05], name: `elbowCop${S}` });
    void ec;
    // shoulder pauldron (big layered plates)
    const sh = vv(pts[0]);
    const ax = v(s * 0.55, 1, 0).normalize();
    const cen = sh.clone().add(v(s * 0.035, 0.05, 0));
    const dome = b.lathe(
      [
        [0, 0.082],
        [0.05, 0.078],
        [0.095, 0.058],
        [0.125, 0.022],
        [0.142, -0.016],
        [0.14, -0.034, "sharp"],
        [0.0, -0.034],
      ],
      { at: cen, axis: [ax.x, ax.y, ax.z], segments: 12, smoothing: 1, color: STEEL_P, bone: shoulderJ, name: `pauldron${S}` },
    );
    b.lathe(
      [
        [0.112, -0.012],
        [0.165, -0.026, "sharp"],
        [0.172, -0.06, "sharp"],
        [0.12, -0.05],
      ],
      { at: cen, axis: [ax.x, ax.y, ax.z], segments: 12, smoothing: 0, color: STEEL_D_P, bone: shoulderJ, name: `pauldronLame${S}` },
    );
    {
      const sk = b.surface(dome);
      const at1 = sk.around(cen).at(s * 24, 44);
      if (at1) b.decal(sk, SCROLL, { at: at1, size: [0.11, 0.037], up: [0, 1, 0], name: `pauldronScroll${S}`, bone: shoulderJ });
      const at2 = sk.around(cen).at(s * 156, 44);
      if (at2) b.decal(sk, SCROLL, { at: at2, size: [0.11, 0.037], up: [0, 1, 0], name: `pauldronScrollB${S}`, bone: shoulderJ });
    }
    // gold trim rings + rivets
    b.part(new THREE.TorusGeometry(0.15, 0.0085, 5, 18), GOLD_P, { bone: shoulderJ, at: cen.clone().addScaledVector(ax, -0.034), dir: ax, axis: "z", name: `pauldronTrim${S}` });
    b.part(new THREE.TorusGeometry(0.17, 0.007, 5, 18), GOLD_P, { bone: shoulderJ, at: cen.clone().addScaledVector(ax, -0.058), dir: ax, axis: "z", name: `pauldronTrim2${S}` });
    {
      const e1 = new THREE.Vector3().crossVectors(ax, v(0, 0, 1)).normalize();
      const e2 = new THREE.Vector3().crossVectors(ax, e1).normalize();
      const gs: THREE.BufferGeometry[] = [];
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const q = cen
          .clone()
          .addScaledVector(e1, Math.cos(a) * 0.125)
          .addScaledVector(e2, Math.sin(a) * 0.125)
          .addScaledVector(ax, 0.026);
        gs.push(new THREE.SphereGeometry(0.0085, 5, 4).translate(q.x, q.y, q.z));
      }
      b.part(mergeGeometries(gs), GOLD_P, { bone: shoulderJ, at: [0, 0, 0], name: `pauldronRivets${S}` });
      // central spike
      b.part(new THREE.ConeGeometry(0.03, 0.09, 6), STEEL_P, { bone: shoulderJ, at: cen.clone().addScaledVector(ax, 0.118), dir: ax, name: `pauldronSpike${S}` });
      b.part(new THREE.CylinderGeometry(0.034, 0.04, 0.016, 8), GOLD_P, { bone: shoulderJ, at: cen.clone().addScaledVector(ax, 0.078), dir: ax, name: `spikeBase${S}` });
    }
    // fur trim under the pauldron
    b.cards(
      b.ring(frame(cen.clone().addScaledVector(ax, -0.06), ax), { count: 18, radius: 0.16 }).items,
      FUR_TUFT,
      { size: [0.045, 0.06], lean: 170, flow: [0, -1, 0], vary: 0.2, rng: rng(40 + (s > 0 ? 1 : 2)), bone: shoulderJ },
    );
  }

  // =============================================================================================================
  // HANDS
  // =============================================================================================================
  const GLOVE_P = brush(mottle("#5c3a20", "#3a2314", { size: 0.04, contrast: 0.5, seed: 33 }), { seed: 34 });
  // ---- left: relaxed open hand
  {
    const s = 1;
    const S = "L";
    const E = vv(armPts.L[1]);
    const W = vv(armPts.L[2]);
    const hand = hands.L;
    const f = W.clone().sub(E).normalize();
    const side = v(0, 0, 1).addScaledVector(f, -f.z).normalize();
    const nrm = new THREE.Vector3().crossVectors(f, side).normalize();
    if (nrm.x * s > 0) nrm.negate();
    const at = (a: number, bb: number, c: number) => W.clone().addScaledVector(f, a).addScaledVector(side, bb).addScaledVector(nrm, c);
    b.part(new THREE.BoxGeometry(0.11, 0.125, 0.066), GLOVE_P, { bone: hand, at: at(0.06, 0, 0), dir: f, up: nrm, flat: true, name: "palmL" });
    b.part(new THREE.BoxGeometry(0.075, 0.04, 0.012), STEEL_P, { bone: hand, at: at(0.06, 0.0, -0.037), dir: f, up: nrm, flat: true, name: "handGuardL" });
    // gauntlet cuff
    b.lathe(
      [
        [0.07, -0.03],
        [0.088, -0.034, "sharp"],
        [0.09, 0.03, "sharp"],
        [0.074, 0.028],
      ],
      { at: at(-0.015, 0, 0), axis: [f.x, f.y, f.z], segments: 9, smoothing: 0, color: STEEL_D_P, bone: hand, name: "cuffL" },
    );
    const names = ["index", "middle", "ring", "pinky"];
    const lens = [0.95, 1.05, 1.0, 0.8];
    for (let k = 0; k < 4; k++) {
      const base = at(0.125, 0.0425 - k * 0.0285, 0.0);
      const pp = [base.clone()];
      let ang = 0;
      const segs = [0.05, 0.04, 0.032];
      const bends = [8, 20, 28];
      for (let j = 0; j < 3; j++) {
        ang += (bends[j] * Math.PI) / 180;
        const d = f.clone().multiplyScalar(Math.cos(ang)).addScaledVector(nrm, Math.sin(ang)).addScaledVector(side, (k - 1.5) * -0.16);
        d.normalize();
        pp.push(pp[j].clone().addScaledVector(d, segs[j] * lens[k]));
      }
      const fc = b.chain(`${names[k]}${S}`, polyline(pp), {
        parent: hand,
        names: [`${names[k]}1${S}`, `${names[k]}2${S}`, `${names[k]}3${S}`],
        role: "digit",
      });
      b.sweep(fc, [0.02, 0.015], { color: SKIN_P, sides: 6, name: `${names[k]}${S}` });
      b.part(new THREE.SphereGeometry(0.023, 6, 5), GLOVE_P, { bone: hand, at: base.clone().addScaledVector(nrm, 0.0), name: `knuckle${S}${k}` });
    }
    const tb = at(0.05, 0.068, 0.0);
    const td1 = f.clone().multiplyScalar(0.55).addScaledVector(side, 0.8).addScaledVector(nrm, 0.1).normalize();
    const td2 = f.clone().multiplyScalar(0.7).addScaledVector(side, 0.55).addScaledVector(nrm, 0.35).normalize();
    const t1 = tb.clone().addScaledVector(td1, 0.05);
    const t2 = t1.clone().addScaledVector(td2, 0.042);
    const thumb = b.chain(`thumb${S}`, polyline([tb, t1, t2]), { parent: hand, names: [`thumb1${S}`, `thumb2${S}`], role: "digit" });
    b.sweep(thumb, [0.024, 0.016], { color: SKIN_P, sides: 6, name: `thumb${S}` });
    b.part(new THREE.SphereGeometry(0.026, 6, 5), GLOVE_P, { bone: hand, at: tb, name: "thumbBaseL" });
  }

  // ---- right: fist around the pistol grip of the blunderbuss
  const GUN_YAW = 8 * (Math.PI / 180);
  const GUN_PITCH = 12 * (Math.PI / 180);
  const fwd = v(Math.sin(GUN_YAW) * Math.cos(GUN_PITCH), Math.sin(GUN_PITCH), Math.cos(GUN_YAW) * Math.cos(GUN_PITCH)).normalize();
  const leftV = new THREE.Vector3().crossVectors(v(0, 1, 0), fwd).normalize();
  const upV = new THREE.Vector3().crossVectors(fwd, leftV).normalize();
  const G = v(-0.508, 0.552, 0.205);
  const K = 1.2;
  const gp = (u: number, w: number, h: number) => G.clone().addScaledVector(fwd, u * K).addScaledVector(upV, w * K).addScaledVector(leftV, h * K);
  const handR = hands.R;
  const gaxis = fwd.clone().multiplyScalar(-0.24).addScaledVector(upV, 0.97).normalize();
  {
    const rightV = v(-1, 0, 0);
    const r0 = rightV.clone().addScaledVector(gaxis, -rightV.dot(gaxis)).normalize();
    const back0 = v(0, 0, -1).addScaledVector(gaxis, -gaxis.z * -1).normalize();
    void back0;
    const fingerNames = ["index", "middle", "ring", "pinky"];
    const hs = [0.04, 0.0135, -0.0135, -0.04];
    for (let k = 0; k < 4; k++) {
      const center = G.clone().addScaledVector(gaxis, hs[k]);
      const rad = 0.054 - (k === 3 ? 0.003 : 0);
      const from = center.clone().addScaledVector(r0, rad);
      const path = arc(center, from, gaxis, k === 3 ? 140 : 155);
      const fc = b.chain(`${fingerNames[k]}R`, path, {
        parent: handR,
        count: 3,
        names: [`${fingerNames[k]}1R`, `${fingerNames[k]}2R`, `${fingerNames[k]}3R`],
        role: "digit",
      });
      b.sweep(fc, [0.0205, 0.0155], { color: SKIN_P, sides: 6, name: `${fingerNames[k]}R` });
      b.part(new THREE.SphereGeometry(0.0235, 6, 5), GLOVE_P, { bone: handR, at: from.clone().addScaledVector(r0, 0.002), name: `knuckleR${k}` });
    }
    // thumb wrapping over the finger tips
    const tc = G.clone().addScaledVector(gaxis, 0.068);
    const backV = v(0, 0, -1).addScaledVector(gaxis, gaxis.z).normalize();
    const tstart = backV.clone().applyAxisAngle(gaxis, (-50 * Math.PI) / 180);
    const tp = arc(tc, tc.clone().addScaledVector(tstart, 0.058), gaxis, -105);
    const thumb = b.chain("thumbR", tp, { parent: handR, count: 2, names: ["thumb1R", "thumb2R"], role: "digit" });
    b.sweep(thumb, [0.025, 0.017], { color: SKIN_P, sides: 6, name: "thumbR" });
    // palm at back-right of the grip
    const pd = r0.clone().add(backV).normalize();
    const palmC = G.clone().addScaledVector(pd, 0.05);
    b.part(new THREE.BoxGeometry(0.095, 0.14, 0.062), GLOVE_P, { bone: handR, at: palmC, dir: gaxis, up: pd, flat: true, name: "palmR" });
    // wrist link and gauntlet cuff
    const W = vv(armPts.R[2]);
    b.capsule(W, palmC, 0.04, { bone: handR, color: GLOVE_P, sides: 8, name: "wristR" });
    const wd = palmC.clone().sub(W).normalize();
    b.lathe(
      [
        [0.07, -0.03],
        [0.088, -0.034, "sharp"],
        [0.09, 0.03, "sharp"],
        [0.074, 0.028],
      ],
      { at: W.clone().addScaledVector(wd, -0.0), axis: [wd.x, wd.y, wd.z], segments: 9, smoothing: 0, color: STEEL_D_P, bone: handR, name: "cuffR" },
    );
  }

  // =============================================================================================================
  // GUN: brass-bound flintlock blunderbuss, held in the right hand (oversized, K times the musket sketch)
  // =============================================================================================================
  {
    const gb = handR;
    const F: [number, number, number] = [fwd.x, fwd.y, fwd.z];
    const U: [number, number, number] = [upV.x, upV.y, upV.z];
    const L: [number, number, number] = [leftV.x, leftV.y, leftV.z];
    const ko = (o: OutlinePoint[]): OutlinePoint[] => o.map((q) => (q.length === 3 ? ([q[0] * K, q[1] * K, "sharp"] as const) : ([q[0] * K, q[1] * K] as const)));
    // stock (side-profile extrude)
    b.extrude(
      ko([
        [-0.28, 0.15],
        [-0.23, 0.162],
        [-0.11, 0.158],
        [-0.01, 0.15],
        [0.09, 0.13],
        [0.37, 0.12],
        [0.385, 0.075],
        [0.09, 0.062],
        [0.05, 0.04],
        [0.026, -0.075],
        [-0.005, -0.098],
        [-0.038, -0.08],
        [-0.03, 0.02],
        [-0.075, 0.045],
        [-0.17, 0.04],
        [-0.255, 0.0],
        [-0.287, 0.03],
      ]),
      { at: gp(0, 0, 0), x: F, y: U, thickness: 0.056 * K, bevel: 0.013, smoothing: 1, color: WOOD_P(fwd), bone: gb, name: "stock" },
    );
    // butt plate
    b.extrude(
      ko([
        [-0.297, 0.03],
        [-0.283, 0.152],
        [-0.272, 0.15],
        [-0.285, 0.027],
      ]),
      { at: gp(0, 0, 0), x: F, y: U, thickness: 0.062 * K, bevel: 0.006, color: BRASS_P, bone: gb, name: "buttPlate" },
    );
    // barrel: swamped tube flaring into a bell mouth
    const bore0 = gp(-0.045, 0.118, 0);
    const gAx = fwd.clone();
    const boreP = paint((p, n) => {
      const d = p.clone().sub(bore0);
      const rad = d.clone().addScaledVector(gAx, -d.dot(gAx));
      const inner = n.dot(rad) < 0 && d.dot(gAx) > 0.2;
      if (inner) return mix("#16121a", "#3a2a22", smoothstep(0.55, 0.25, d.dot(gAx)));
      const u = d.dot(gAx);
      if ((u > 0.1 && u < 0.108) || (u > 0.205 && u < 0.211) || (u > 0.345 && u < 0.353) || (u > 0.425 && u < 0.432)) return GOLD_P.at(p, n);
      return BARREL_P.at(p, n);
    });
    b.lathe(
      ko([
        [0, 0],
        [0.034, 0],
        [0.037, 0.04],
        [0.034, 0.12],
        [0.033, 0.25],
        [0.042, 0.31],
        [0.062, 0.38],
        [0.09, 0.44],
        [0.108, 0.5, "sharp"],
        [0.095, 0.505, "sharp"],
        [0.075, 0.45],
        [0.05, 0.38],
        [0.026, 0.3],
        [0.02, 0.22],
        [0, 0.22],
      ]),
      { at: bore0, axis: [gAx.x, gAx.y, gAx.z], segments: 12, smoothing: 1, color: boreP, bone: gb, name: "barrel" },
    );
    // brass bands + muzzle rim
    for (const [u, r, tube] of [
      [-0.03, 0.043, 0.01],
      [0.05, 0.042, 0.008],
      [0.14, 0.04, 0.008],
      [0.22, 0.039, 0.008],
      [0.31, 0.049, 0.008],
    ]) {
      b.part(new THREE.TorusGeometry(r * K, tube * K, 5, 12), BRASS_P, { bone: gb, at: gp(u, 0.118, 0), dir: F, axis: "z", name: "gunBand" });
    }
    b.part(new THREE.TorusGeometry(0.1 * K + 0.004, 0.0095 * K, 5, 14), GOLD_P, { bone: gb, at: gp(0.457, 0.118, 0), dir: F, axis: "z", name: "muzzleRim" });
    // breech plug + tang
    b.part(new THREE.SphereGeometry(1, 9, 7), STEEL_D_P, { bone: gb, at: gp(-0.05, 0.118, 0), scale: 0.042 * K, name: "breech" });
    b.part(new THREE.BoxGeometry(0.1 * K, 0.01 * K, 0.026 * K), BRASS_P, { bone: gb, at: gp(-0.1, 0.16, 0), dir: F, axis: "x", flat: true, name: "tang" });
    // front sight
    b.part(new THREE.ConeGeometry(0.008 * K, 0.026 * K, 5), BRASS_P, { bone: gb, at: gp(0.16, 0.165, 0), dir: U, name: "sight" });
    // flintlock on the outer (right) side, decorative sideplate on the left
    for (const sd of [-1, 1]) {
      b.extrude(
        ko([
          [-0.095, 0.1],
          [-0.06, 0.145],
          [0.0, 0.148],
          [0.04, 0.126],
          [0.025, 0.098],
          [-0.04, 0.088],
        ]),
        { at: gp(0, 0, sd * 0.0285), x: F, y: U, thickness: 0.011 * K, bevel: 0.003, smoothing: 1, color: sd < 0 ? BRASS_P : GOLD_P, bone: gb, name: sd < 0 ? "lockplate" : "sideplate" },
      );
      b.part(new THREE.PlaneGeometry(0.15 * K, 0.05 * K), "#ffffff", {
        bone: gb,
        at: gp(-0.17, 0.088, sd * 0.0295),
        dir: [L[0] * sd, L[1] * sd, L[2] * sd],
        axis: "z",
        up: U,
        texture: SCROLL,
        name: "stockInlay",
      });
    }
    // hammer (cock) with flint jaw, pan and frizzen on the right
    const lw = -0.037;
    b.sweep(catmull([gp(-0.045, 0.115, lw), gp(-0.06, 0.15, lw), gp(-0.03, 0.19, lw), gp(0.0, 0.2, lw)]), [0.011 * K, 0.008 * K], { color: STEEL_D_P, bone: gb, name: "hammer" });
    b.part(new THREE.BoxGeometry(0.022 * K, 0.026 * K, 0.02 * K), STEEL_P, { bone: gb, at: gp(0.012, 0.198, lw), flat: true, name: "flintJaw" });
    b.part(new THREE.BoxGeometry(0.018 * K, 0.02 * K, 0.012 * K), "#d6d0c2", { bone: gb, at: gp(0.024, 0.2, lw), flat: true, name: "flint" });
    b.part(new THREE.CylinderGeometry(0.013 * K, 0.011 * K, 0.02 * K, 6), BRASS_P, { bone: gb, at: gp(0.035, 0.133, lw + 0.004), dir: L, name: "pan" });
    b.sweep(catmull([gp(0.03, 0.14, lw - 0.002), gp(0.05, 0.18, lw - 0.002), gp(0.045, 0.2, lw - 0.002)]), [0.008 * K, 0.01 * K], { color: STEEL_P, section: "box", bone: gb, name: "frizzen" });
    // trigger guard + trigger
    b.sweep(catmull([gp(0.052, 0.07, 0), gp(0.075, 0.015, 0), gp(0.12, 0.0, 0), gp(0.155, 0.065, 0)]), 0.0075 * K, { color: BRASS_P, bone: gb, name: "triggerGuard" });
    b.part(new THREE.ConeGeometry(0.008 * K, 0.035 * K, 5), STEEL_D_P, { bone: gb, at: gp(0.085, 0.05, 0), dir: [-fwd.x * 0.3 - upV.x * 0.9, -fwd.y * 0.3 - upV.y * 0.9, -fwd.z * 0.3 - upV.z * 0.9], name: "trigger" });
    // ramrod with brass pipes
    b.sweep(polyline([gp(0.0, 0.056, 0), gp(0.36, 0.056, 0)]), 0.0065 * K, { color: WOOD_P(fwd), bone: gb, caps: "flat", name: "ramrod" });
    for (const u of [0.07, 0.19, 0.31, 0.375]) {
      b.part(new THREE.TorusGeometry(0.014 * K, 0.0055 * K, 4, 8), BRASS_P, { bone: gb, at: gp(u, 0.06, 0), dir: F, axis: "z", name: "ramPipe" });
    }
    b.part(new THREE.SphereGeometry(0.009 * K, 6, 4), BRASS_P, { bone: gb, at: gp(0.386, 0.056, 0), name: "ramTip" });
    // sling with swivels
    b.sweep(catmull([gp(-0.205, 0.03, 0.03), gp(-0.1, -0.12, 0.034), gp(0.1, -0.2, 0.034), gp(0.3, 0.05, 0.03)]), [0.014 * K, 0.0035 * K], { color: LEATHER_D_P, section: "box", bone: gb, name: "sling" });
    b.part(new THREE.TorusGeometry(0.012 * K, 0.004 * K, 4, 8), BRASS_P, { bone: gb, at: gp(-0.205, 0.03, 0.03), dir: L, axis: "z", name: "swivelA" });
    b.part(new THREE.TorusGeometry(0.012 * K, 0.004 * K, 4, 8), BRASS_P, { bone: gb, at: gp(0.3, 0.05, 0.03), dir: L, axis: "z", name: "swivelB" });
    // tally studs on the stock
    {
      const gs: THREE.BufferGeometry[] = [];
      for (let i = 0; i < 5; i++) {
        const q = gp(-0.25 + i * 0.012, 0.075 + i * 0.002, -0.0296);
        gs.push(new THREE.SphereGeometry(0.0045 * K, 4, 3).translate(q.x, q.y, q.z));
      }
      b.part(mergeGeometries(gs), GOLD_P, { bone: gb, at: [0, 0, 0], name: "tally" });
    }
  }

  // =============================================================================================================
  // HEAD
  // =============================================================================================================
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), SKIN_P, { bone: head, at: HEAD_C, scale: [0.125, 0.122, 0.13], name: "skull" });
  const skin = b.surface(skull);
  const faceAt = (azi: number, ele: number) => skin.around(HEAD_C).at(azi, ele)!;
  // eyes (decals) + scar
  for (const s of [1, -1]) {
    const hit = faceAt(s * 25, 5);
    b.decal(skin, EYE, { at: hit, size: [0.07, 0.044], mirror: s > 0, name: s > 0 ? "eyeL" : "eyeR", bone: head });
  }
  b.decal(skin, SCAR, { at: faceAt(-34, -4), dir: [-0.6, 0, 0.8], size: [0.025, 0.045], roll: 10, name: "scar", bone: head });
  // heavy brow ridges, nose, cheeks
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.118, 1.175, 0.065],
        [s * 0.085, 1.198, 0.14],
        [s * 0.05, 1.197, 0.176],
        [s * 0.012, 1.18, 0.19],
      ]),
      [0.028, 0.02],
      { bone: head, color: BEARD_P, sides: 7, name: s > 0 ? "browL" : "browR" },
    );
    b.part(new THREE.SphereGeometry(1, 8, 6), SKIN_P, { bone: head, at: [s * 0.078, 1.113, 0.145], scale: [0.05, 0.045, 0.045], name: "cheek" });
    // ears with pointy tips
    b.part(new THREE.SphereGeometry(1, 8, 6), SKIN_P, { bone: head, at: [s * 0.126, 1.145, 0.035], scale: [0.016, 0.044, 0.032], name: "ear" });
    b.part(new THREE.ConeGeometry(0.02, 0.05, 5), SKIN_P, { bone: head, at: [s * 0.136, 1.19, 0.03], rotation: [0, 0, -s * 22], name: "earTip" });
  }
  b.part(new THREE.SphereGeometry(1, 10, 8), SKIN_P, { bone: head, at: [0, 1.118, 0.222], scale: [0.04, 0.043, 0.05], name: "nose" });
  b.sweep(polyline([[0, 1.185, 0.17], [0, 1.15, 0.208]]), [0.022, 0.03], { bone: head, color: SKIN_P, sides: 6, name: "noseBridge" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 6, 5), SKIN_P, { bone: head, at: [s * 0.024, 1.1, 0.226], scale: [0.019, 0.018, 0.02], name: "nostrilWing" });
    b.part(new THREE.SphereGeometry(0.008, 4, 3), COAL, { bone: head, at: [s * 0.013, 1.092, 0.238], name: "nostril" });
  }
  // lower jaw, lips, teeth
  b.capsule([-0.075, 1.09, 0.07], [0.075, 1.09, 0.07], 0.04, { bone: jaw, color: SKIN_P, sides: 7, name: "jawBone" });
  b.capsule([-0.04, 1.07, 0.19], [0.04, 1.07, 0.19], 0.02, { bone: jaw, color: "#c9605a", sides: 6, name: "lowerLip" });
  b.part(new THREE.BoxGeometry(0.02, 0.016, 0.01), CREAM, { bone: head, at: [-0.012, 1.083, 0.205], flat: true, name: "tooth" });
  b.part(new THREE.BoxGeometry(0.02, 0.016, 0.01), CREAM, { bone: head, at: [0.012, 1.083, 0.205], flat: true, name: "tooth2" });
  // earring
  b.part(new THREE.TorusGeometry(0.018, 0.0035, 4, 10), GOLD_P, { bone: head, at: [-0.138, 1.118, 0.035], dir: [1, 0, 0], axis: "z", name: "earring" });

  // mustache (big, curled)
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.008, 1.092, 0.222],
        [s * 0.055, 1.078, 0.225],
        [s * 0.1, 1.07, 0.185],
        [s * 0.135, 1.075, 0.14],
        [s * 0.155, 1.1, 0.115],
        [s * 0.148, 1.12, 0.11],
      ]),
      [0.034, 0.03, 0.026, 0.018, 0.011],
      { bone: head, color: BEARD_P2, sides: 7, caps: { start: "round", end: "point" }, name: s > 0 ? "mustacheL" : "mustacheR" },
    );
  }
  // cheek whiskers
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.114, 1.15, 0.03],
        [s * 0.118, 1.1, 0.07],
        [s * 0.11, 1.06, 0.12],
      ]),
      [0.022, 0.032, 0.04],
      { bone: jaw, color: BEARD_P, sides: 8, name: "sideburn" },
    );
  }

  // the beard: broad collar of copper hair
  const beard = b.loft(
    [
      { at: [0, 1.08, 0.12], w: 0.25, h: 0.1 },
      { at: [0, 1.0, 0.185], w: 0.255, h: 0.13 },
      { at: [0, 0.92, 0.215], w: 0.22, h: 0.13 },
      { at: [0, 0.84, 0.215], w: 0.16, h: 0.1 },
      { at: [0, 0.78, 0.2], w: 0.08, h: 0.05 },
    ],
    { bone: jaw, color: BEARD_P, sides: 10, name: "beard" },
  );
  const beardSkin = b.surface(beard);
  const strands = beardSkin.scatter(180, { rng: rng(51), minDist: 0.028, filter: (h) => h.n.z > -0.2 && h.at.y < 1.06 });
  b.cards(strands, BEARD_TUFT, { size: [0.05, 0.09], lean: 70, flow: [0, -1, 0.25], bend: 20, vary: 0.3, rng: rng(52), bone: jaw });
  const upper = beardSkin.scatter(60, { rng: rng(53), minDist: 0.03, filter: (h) => h.n.z > 0.2 && h.at.y > 1.0 && h.at.y < 1.1 });
  b.cards(upper, HAIR_TUFT, { size: [0.04, 0.06], lean: 60, flow: [0, -1, 0.5], vary: 0.3, rng: rng(54), bone: jaw });

  // braids
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const path = polyline([
      [s * 0.058, 1.0, 0.215],
      [s * 0.062, 0.9, 0.26],
      [s * 0.066, 0.8, 0.275],
      [s * 0.066, 0.7, 0.265],
    ]);
    const braid = b.chain(`braid${S}`, path, { parent: jaw, names: [`braid${S}1`, `braid${S}2`, `braid${S}3`], role: "tail" });
    b.sweep(braid, [0.03, 0.026, 0.02], { color: BEARD_P, sides: 7, caps: "round", name: `braidCore${S}` });
    const plait = new THREE.SphereGeometry(1, 7, 5).scale(0.034, 0.02, 0.022);
    const N = 13;
    for (let i = 0; i < N; i++) {
      const t = 0.04 + (0.9 * (i + 0.5)) / N;
      const c = braid.at(t);
      const dir = i % 2 ? 1 : -1;
      b.part(plait, i % 2 ? BEARD_P2 : BEARD_P, {
        at: c.at.clone().add(v(dir * 0.0, 0, 0.018 - 0.0003 * i)),
        bone: c.bone ?? braid.joints[0],
        rotation: [0, 0, dir * 38],
        name: `plait${S}`,
      });
    }
    // gold clasp rings and tied tail
    for (const t of [0.12, 0.93]) {
      const c = braid.at(t);
      b.part(new THREE.TorusGeometry(0.034, 0.0075, 4, 10), GOLD_P, { at: c.at.clone().add(v(0, 0, 0.002)), dir: c.tangent, axis: "z", bone: c.bone ?? braid.joints[0], name: `braidRing${S}` });
    }
    const tip = braid.at(1);
    b.cards(
      [frame(tip.at.clone().add(v(0, 0.01, 0)), [0, 1, 0])],
      BEARD_TUFT,
      { size: [0.09, 0.1], lean: 180, flow: [0, 0, 1], cross: true, bone: braid.joints[2] },
    );
    b.part(new THREE.SphereGeometry(0.014, 6, 5), GOLD_P, { at: braid.at(0.97).at.clone(), bone: braid.joints[2], name: `braidBead${S}` });
  }

  // little clay pipe at the corner of the mouth
  b.sweep(catmull([[-0.062, 1.072, 0.2], [-0.075, 1.045, 0.25], [-0.08, 1.03, 0.29]]), 0.0065, { bone: jaw, color: CREAM, name: "pipeStem" });
  b.lathe(
    [
      [0, 0],
      [0.015, 0.0],
      [0.025, 0.02],
      [0.03, 0.045],
      [0.027, 0.05],
      [0.017, 0.045],
      [0.0, 0.035],
    ],
    { at: [-0.08, 1.026, 0.295], segments: 8, color: "#a05030", bone: jaw, name: "pipeBowl" },
  );
  glow(b.part(new THREE.SphereGeometry(1, 6, 4), "#ff7a2a", { bone: jaw, at: [-0.08, 1.07, 0.295], scale: [0.015, 0.006, 0.015], name: "pipeEmber" }), 1.6);

  // ---- back hair and a short tied braid
  b.part(new THREE.SphereGeometry(1, 12, 9), BEARD_P, { bone: head, at: [0, 1.15, -0.035], scale: [0.122, 0.118, 0.105], name: "backHair" });
  b.cards(
    b.ring(frame([0, 1.1, -0.04], [0, 1, 0]), { count: 24, radius: 0.1 }).items,
    HAIR_TUFT,
    { size: [0.05, 0.09], lean: 150, flow: [0, -1, -0.2], vary: 0.25, rng: rng(61), bone: head },
  );
  {
    const pony = b.chain(
      "ponytail",
      polyline([
        [0, 1.12, -0.12],
        [0, 1.04, -0.15],
        [0, 0.97, -0.145],
      ]),
      { parent: head, names: ["ponytail1", "ponytail2"], role: "tail" },
    );
    b.sweep(pony, [0.03, 0.022], { color: BEARD_P, sides: 7, name: "ponytailCore" });
    const plait = new THREE.SphereGeometry(1, 7, 5).scale(0.03, 0.018, 0.02);
    for (let i = 0; i < 6; i++) {
      const c = pony.at(0.1 + (0.8 * (i + 0.5)) / 6);
      const dir = i % 2 ? 1 : -1;
      b.part(plait, i % 2 ? BEARD_P2 : BEARD_P, { at: c.at.clone().add(v(0, 0, -0.016)), bone: c.bone ?? pony.joints[0], rotation: [0, 0, dir * 38], name: "ponyPlait" });
    }
    b.part(new THREE.TorusGeometry(0.03, 0.007, 4, 10), GOLD_P, { at: pony.at(0.08).at.clone(), dir: [0, -0.3, 1], axis: "z", bone: pony.joints[0], name: "ponyTie" });
  }

  // ---- helmet: riveted kettle hat with comb, goggles and plume
  const HELM = v(0, 1.205, 0.045);
  b.lathe(
    [
      [0, 0.15],
      [0.05, 0.148],
      [0.1, 0.134],
      [0.13, 0.105],
      [0.148, 0.065],
      [0.154, 0.03],
      [0.158, 0.005],
      [0.185, -0.002],
      [0.208, -0.022, "sharp"],
      [0.203, -0.032, "sharp"],
      [0.172, -0.016],
      [0.15, -0.012],
      [0, -0.012],
    ],
    { at: HELM, segments: 16, smoothing: 1, color: STEEL_P, bone: head, name: "helmet" },
  );
  b.part(new THREE.TorusGeometry(0.158, 0.0095, 5, 18), GOLD_P, { bone: head, at: HELM.clone().add(v(0, 0.012, 0)), dir: [0, 1, 0], axis: "z", name: "helmBand" });
  b.part(new THREE.TorusGeometry(0.207, 0.0075, 5, 20), GOLD_P, { bone: head, at: HELM.clone().add(v(0, -0.027, 0)), dir: [0, 1, 0], axis: "z", name: "brimRim" });
  b.extrude(
    [
      [-0.15, 0],
      [-0.13, 0.03],
      [-0.06, 0.048],
      [0.05, 0.05],
      [0.125, 0.03],
      [0.16, 0.0, "sharp"],
      [0.13, 0.008],
      [0.0, 0.02],
      [-0.12, 0.008],
    ],
    { at: HELM.clone().add(v(0, 0.128, 0)), x: [0, 0, 1], y: [0, 1, 0], thickness: 0.018, bevel: 0.004, smoothing: 1, color: STEEL_D_P, bone: head, name: "helmComb" },
  );
  b.part(new THREE.SphereGeometry(0.02, 6, 5), GOLD_P, { bone: head, at: HELM.clone().add(v(0, 0.142, 0.0)), name: "helmKnob" });
  {
    const gs: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      gs.push(new THREE.SphereGeometry(0.0075, 5, 4).translate(HELM.x + Math.cos(a) * 0.19, HELM.y - 0.001, HELM.z + Math.sin(a) * 0.19));
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.2;
      gs.push(new THREE.SphereGeometry(0.0065, 5, 4).translate(HELM.x + Math.cos(a) * 0.153, HELM.y + 0.04, HELM.z + Math.sin(a) * 0.153));
    }
    b.part(mergeGeometries(gs), GOLD_P, { bone: head, at: [0, 0, 0], name: "helmRivets" });
  }
  {
    const prof: Array<[number, number]> = [
      [0.014, 0.155],
      [0.05, 0.153],
      [0.1, 0.139],
      [0.13, 0.11],
      [0.148, 0.07],
      [0.155, 0.032],
    ];
    for (const deg of [50, 130, 230, 310]) {
      const a = (deg * Math.PI) / 180;
      const pts = prof.map(([r, y]) => v(HELM.x + Math.sin(a) * (r + 0.004), HELM.y + y + 0.002, HELM.z + Math.cos(a) * (r + 0.004)));
      b.sweep(catmull(pts), [0.0055, 0.0045], { color: GOLD_P, bone: head, sides: 4, name: "helmRib" });
    }
  }
  // steel cheek guards hanging from the brim
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.03, 0],
        [0.03, 0],
        [0.026, -0.05],
        [0.0, -0.075, "sharp"],
        [-0.026, -0.05],
      ],
      { at: [s * 0.158, HELM.y - 0.02, HELM.z + 0.015], x: [0.1, 0, s > 0 ? -1 : 1], y: [0, 1, 0], thickness: 0.01, bevel: 0.003, color: STEEL_P, bone: head, name: "cheekGuard" },
    );
  }
  // goggles: strap, lens cups, glass
  {
    const strap = b.ring(frame(HELM.clone().add(v(0, 0.085, 0)), [0, 1, 0]), { count: 20, radius: 0.1405 }).items;
    b.sweep(catmull(strap, { closed: true }), [0.016, 0.006], { color: LEATHER_D_P, section: "box", bone: head, name: "goggleStrap" });
    for (const s of [1, -1]) {
      const c = HELM.clone().add(v(s * 0.05, 0.088, 0.142));
      const out = v(s * 0.3, 0.05, 1).normalize();
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.028, 10), BRASS_P, { bone: head, at: c, dir: out, name: s > 0 ? "gogCupL" : "gogCupR" });
      b.part(new THREE.TorusGeometry(0.029, 0.0065, 5, 12), GOLD_P, { bone: head, at: c.clone().addScaledVector(out, 0.014), dir: out, axis: "z", name: "gogRim" });
      glow(
        b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.01, 10), GLASS, { bone: head, at: c.clone().addScaledVector(out, 0.0155), dir: out, name: s > 0 ? "gogGlassL" : "gogGlassR" }),
        0.5,
      );
      b.part(new THREE.SphereGeometry(0.0075, 5, 4), "#ffffff", { bone: head, at: c.clone().addScaledVector(out, 0.022).add(v(s * 0.008, 0.009, 0)), name: "gogGlint" });
    }
    b.rod(HELM.clone().add(v(0.02, 0.088, 0.156)), HELM.clone().add(v(-0.02, 0.088, 0.156)), 0.006, { bone: head, color: BRASS_P, name: "gogBridge" });
  }
  // plume: brass socket and red feathers
  {
    const base = HELM.clone().add(v(0.14, 0.09, -0.04));
    const d = v(0.6, 0.65, -0.45).normalize();
    b.part(new THREE.CylinderGeometry(0.02, 0.025, 0.04, 8), GOLD_P, { bone: head, at: base, dir: d, name: "plumeSocket" });
    const fr: Frame[] = [];
    for (let i = 0; i < 7; i++) {
      const k = (i - 3) / 3;
      fr.push(frame(base.clone().addScaledVector(d, 0.02), [0.6 + k * 0.25, 0.7 - Math.abs(k) * 0.1, -0.5 + k * 0.5]));
    }
    b.cards(fr, FEATHER, { size: [0.06, 0.2], lean: 30, bend: 40, flow: [-0.3, -0.5, -1], vary: 0.15, rng: R, cross: false, bone: head });
  }

  return b.root;
}
