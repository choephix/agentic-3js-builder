import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, type OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { cells, mottle, noise, paint, type Paint } from "../src/paint";
import { catmull, polyline } from "../src/path";
import type { Joint as Bone } from "../src/skeleton";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";
import { animeEye, cel, furEdge, INK, zigzag } from "../kits/toon";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A chubby cel-shaded red panda perched on a mossy dendro stone: gold-trimmed teal scarf with tassels, leaf circlet, embroidered saddle cloth, ringed tail with a gold band, glowing runes, mushrooms and drifting seeds.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: every surface colour is a two-tone cel; ink and small details are flat colours.

const RUST_L = "#f0722c";
const RUST_GOLD = "#f9993f";
const RUST_DEEP = "#cf4a2a";
const CREAM_L = "#fff4de";
const CREAM_S = "#f3cdbd";
const DARK_L = "#4b2a33";
const DARK_S = "#2c1a2e";
const TAIL_PALE = "#f8b568";
const TAIL_TIP = "#3d2330";
const PLUM = "#2b1732";

const RUST = cel(RUST_L, "#c4412f");
const CREAM = cel(CREAM_L, CREAM_S);
const DARK = cel(DARK_L, DARK_S);
const TEAR = cel(RUST_DEEP, "#9c2f33");
const EAR_IN = cel("#6a3345", "#43233a");
const NOSE = cel(PLUM, INK);
const CLAW = cel("#fff0d2", "#e0b8a0");

const GOLD = cel("#ffd552", "#d98a30");
const TEAL = cel("#27c9b4", "#1c86a6");
const TEAL_D = cel("#1ba58f", "#17708f");
const JADE_GLOW = "#a6ff86";
const MINT_GLOW = "#58f0c4";

const STONE_C = cel("#a2abc2", "#6c7499");
const STONE_LIGHT = cel("#b4bdd2", "#7b84a8");
const STONE_DARK = cel("#78819f", "#555c86");
const GOLD_VEIN = cel("#e7c156", "#b8873a");
const MOSS_L = "#7bdc5c";
const MOSS = cel(mottle(MOSS_L, "#5fcb5c", { size: 0.05, seed: 2 }), "#2f9a66");
const MOSS_EDGE = cel("#2f9f55", "#237a62");

// ---------------------------------------------------------------------------------------------------------------
// Textures (SVG drawings)

const MOSS_TUFT = svg(
  `<svg viewBox="0 0 48 40">
    <rect x="4" y="30" width="40" height="10" fill="#3fb061"/>
    <circle cx="13" cy="29" r="11" fill="#3fb061"/>
    <circle cx="36" cy="30" r="10" fill="#45b862"/>
    <circle cx="25" cy="23" r="14" fill="#5ccf5f"/>
    <circle cx="14" cy="20" r="8" fill="#6fdc64"/>
    <circle cx="33" cy="17" r="8" fill="#7be86a"/>
    <circle cx="24" cy="12" r="7" fill="#8cf079"/>
    <circle cx="21" cy="9" r="3" fill="#c3fba0"/>
    <circle cx="31" cy="14" r="2.4" fill="#c3fba0"/>
    <circle cx="11" cy="17" r="2.2" fill="#c3fba0"/>
  </svg>`,
  { size: 128 },
);

const GRASS = svg(
  `<svg viewBox="0 0 48 64">
    <path d="M4 64 Q8 30 6 4 Q16 28 18 64Z" fill="#35a85a"/>
    <path d="M14 64 Q20 30 26 0 Q32 30 32 64Z" fill="#62d062"/>
    <path d="M28 64 Q34 34 42 8 Q44 36 40 64Z" fill="#3fb061"/>
    <path d="M20 64 Q24 40 28 22 Q30 42 30 64Z" fill="#a8f07c"/>
  </svg>`,
  { size: 128 },
);

const LEAF = svg(
  `<svg viewBox="0 0 24 80">
    <path d="M12 80 Q0 46 12 0 Q24 46 12 80Z" fill="#46bd62"/>
    <path d="M12 80 Q24 46 12 0 Q16 40 12 80Z" fill="#2f9d58"/>
    <path d="M12 80 L12 8" stroke="#b6f58a" stroke-width="1.6" fill="none"/>
  </svg>`,
  { size: 192 },
);

const FUR = svg(
  `<svg viewBox="0 0 24 40">
    <path d="M2 40 C0 22 5 8 12 0 C19 8 24 22 22 40Z" fill="#ffffff"/>
    <path d="M7 40 C6 26 10 14 13 8 C17 16 18 28 17 40Z" fill="#e9e0e0"/>
  </svg>`,
  { size: 96 },
);

const FLOWER = svg(
  `<svg viewBox="0 0 40 40">
    <g fill="#fffaf0">
      <circle cx="20" cy="9" r="7"/><circle cx="31" cy="17" r="7"/><circle cx="27" cy="30" r="7"/>
      <circle cx="13" cy="30" r="7"/><circle cx="9" cy="17" r="7"/>
    </g>
    <g fill="#ffc9d6"><circle cx="20" cy="9" r="3"/><circle cx="31" cy="17" r="3"/><circle cx="27" cy="30" r="3"/>
      <circle cx="13" cy="30" r="3"/><circle cx="9" cy="17" r="3"/></g>
    <circle cx="20" cy="20" r="5" fill="#ffd552"/>
    <circle cx="20" cy="20" r="2" fill="#e8962c"/>
  </svg>`,
  { size: 96 },
);

const CLOVER = svg(
  `<svg viewBox="0 0 40 40">
    <g fill="#55c765">
      <path d="M20 22 C8 22 6 6 18 8 C20 9 20 12 20 22Z"/>
      <path d="M20 22 C32 22 34 6 22 8 C20 9 20 12 20 22Z"/>
      <path d="M20 22 C12 30 14 40 20 38 C26 40 28 30 20 22Z"/>
    </g>
    <path d="M20 22 L20 10 M20 22 L12 12 M20 22 L28 12" stroke="#b6f58a" stroke-width="1.4" fill="none"/>
  </svg>`,
  { size: 96 },
);

const TASSEL = svg(
  `<svg viewBox="0 0 24 72">
    <rect x="10" y="0" width="4" height="14" fill="#ffd552"/>
    <circle cx="12" cy="18" r="6" fill="#ffd552"/>
    <circle cx="12" cy="18" r="2.4" fill="#27e0c4"/>
    <path d="M6 24 L18 24 L20 34 L4 34Z" fill="#d98a30"/>
    <path d="M5 34 L8 72 M9 34 L10 72 M12 34 L12 72 M15 34 L14 72 M19 34 L16 72" stroke="#ffd552" stroke-width="2.2" fill="none"/>
    <path d="M6 34 L7 66 M12 34 L12 68 M18 34 L17 66" stroke="#27c9b4" stroke-width="2.2" fill="none"/>
  </svg>`,
  { size: 192 },
);

const RUNE = svg(
  `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="44" fill="none" stroke="#ffe27a" stroke-width="3.4"/>
    <circle cx="50" cy="50" r="36" fill="none" stroke="#7dffb0" stroke-width="3"/>
    <path d="M50 14 L50 22 M50 78 L50 86 M14 50 L22 50 M78 50 L86 50 M24 24 L30 30 M70 70 L76 76 M76 24 L70 30 M24 76 L30 70"
      stroke="#ffe27a" stroke-width="3.2" fill="none"/>
    <path d="M50 70 C32 62 30 42 50 26 C70 42 68 62 50 70Z" fill="none" stroke="#7dffb0" stroke-width="3.4"/>
    <path d="M50 70 L50 36 M50 56 L40 46 M50 48 L60 38" stroke="#7dffb0" stroke-width="3" fill="none"/>
    <circle cx="50" cy="50" r="3.4" fill="#ffffff"/>
  </svg>`,
  { size: 384 },
);

// Embroidered saddle cloth: teal field, gold border, filigree leaf and corner gems.
const SADDLE = svg(
  `<svg viewBox="0 0 100 90">
    <path d="M10 4 H90 Q96 4 96 10 V80 Q96 86 90 86 H10 Q4 86 4 80 V10 Q4 4 10 4Z" fill="#ffd552"/>
    <path d="M12 9 H88 Q91 9 91 12 V78 Q91 81 88 81 H12 Q9 81 9 78 V12 Q9 9 12 9Z" fill="#1fb9a5"/>
    <path d="M15 14 H85 V76 H15Z" fill="none" stroke="#ffe9a0" stroke-width="1.8" stroke-dasharray="5 3"/>
    <path d="M50 20 C32 32 32 58 50 72 C68 58 68 32 50 20Z" fill="#17907f" stroke="#ffd552" stroke-width="2.6"/>
    <path d="M50 24 L50 70 M50 38 L40 30 M50 48 L38 38 M50 58 L40 50 M50 38 L60 30 M50 48 L62 38 M50 58 L60 50"
      stroke="#ffd552" stroke-width="2.2" fill="none"/>
    <g fill="#ffd552"><circle cx="22" cy="45" r="4"/><circle cx="78" cy="45" r="4"/></g>
    <g fill="#58f0c4"><circle cx="22" cy="45" r="2"/><circle cx="78" cy="45" r="2"/>
      <path d="M17 17 l4 -4 l4 4 l-4 4Z"/><path d="M75 17 l4 -4 l4 4 l-4 4Z"/>
      <path d="M17 73 l4 -4 l4 4 l-4 4Z"/><path d="M75 73 l4 -4 l4 4 l-4 4Z"/></g>
  </svg>`,
  { size: 512 },
);

const EYE = animeEye({ iris: "#2ec9a6", irisLight: "#b8ff9a", blush: "#ff8a9a", brow: false });

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "redPanda", paintSize: 2048 });
  const R = rng(5);
  const SPHERE = new THREE.SphereGeometry(1, 10, 7);

  const ell = (c: readonly number[], r: readonly number[], color: string | Paint, bone: Bone, name?: string) =>
    b.part(SPHERE, color, { bone, at: c, scale: r, name });

  // head frame: positions given relative to the skull centre, scaled by K (head size is one number)
  const K = 1.08;
  const HY = 0.385;
  const HZ = 0.3;
  const HC = [0, HY, HZ];
  const hp = (x: number, y: number, z: number) => [x * K, HY + y * K, HZ + z * K];
  const hr = (x: number, y: number, z: number) => [x * K, y * K, z * K];

  // ===== Skeleton =====
  const hips = b.joint("hips", { at: [0, 0.355, -0.17], dir: [0, 0, 1], role: "spine" });
  const stoneJ = b.joint("stone", { parent: hips, at: [0, 0.1, 0], dir: [0, 1, 0] });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.355, -0.17],
      [0, 0.362, -0.06],
      [0, 0.37, 0.05],
      [0, 0.366, 0.145],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.366, 0.145],
      [0, 0.375, 0.195],
      [0, 0.385, 0.24],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.385, 0.24], dir: [0, -0.04, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.028, 0.027), aim: hp(0, -0.045, 0.102), role: "jaw" });
  const earJ: Record<number, Bone> = {};
  for (const s of [1, -1])
    earJ[s] = b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: hp(s * 0.062, 0.053, -0.036),
      dir: [s * 0.45, 1, 0.1],
      role: "hinge",
    });

  // ===== The stone: a low-poly boulder, flat-topped, mossy =====
  const stoneGeo = (() => {
    const g = new THREE.IcosahedronGeometry(1, 3);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).normalize();
      const bump = 1 + 0.22 * (noise(v, 0.8, 5) - 0.5) + 0.08 * (noise(v, 0.3, 9) - 0.5);
      let y = v.y * bump;
      if (y > 0.6) y = 0.6 + (y - 0.6) * 0.35;
      pos.setXYZ(i, v.x * bump * 0.27, Math.max(0, 0.06 + y * 0.2), v.z * bump * 0.34);
    }
    g.computeVertexNormals();
    return g;
  })();

  const mossField = (p: THREE.Vector3, n: THREE.Vector3) =>
    n.y * 0.75 + (noise(p, 0.12, 3) - 0.5) * 0.9 + (p.y - 0.12) * 2.0;
  const MOSS_AT = 0.5;
  const stonePaint = paint((p, n) => {
    const m = mossField(p, n);
    if (m > MOSS_AT + 0.07) return MOSS;
    if (m > MOSS_AT) return MOSS_EDGE;
    const c = cells(p, 0.14, 4);
    const edge = c.d2 - c.d1;
    if (edge < 0.032) return c.id < 0.18 ? GOLD_VEIN : STONE_DARK;
    if (p.y < 0.035) return STONE_DARK;
    return c.id > 0.7 ? STONE_LIGHT : STONE_C;
  });
  const stone = b.part(stoneGeo, stonePaint, { bone: stoneJ, at: [0, 0, 0], flat: true, name: "stone" });
  const stoneSurf = b.surface(stone);
  const topAt = (x: number, z: number) => stoneSurf.ray([x, 1, z], [0, -1, 0])?.at.y ?? 0.2;

  // ===== Body =====
  const coat = cel(
    furEdge(furEdge(RUST_GOLD, RUST_L, { level: 0.55, teeth: 0.2, period: 0.03 }), DARK_L, {
      level: -0.3,
      teeth: 0.22,
      period: 0.03,
    }),
  );
  const bodySweep = b.sweep(spine, [0.092, 0.108, 0.112, 0.1], { color: coat, sides: 12, name: "torso" });
  const neckSweep = b.sweep(neck, [0.084, 0.078], {
    color: cel(furEdge(CREAM_L, RUST_L, { axis: [0, -0.5, 0.85], level: 0.5, teeth: 0.2, period: 0.025 })),
    sides: 12,
    name: "neck",
  });

  // Haunches and shoulders: chunky fur volumes.
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    ell([s * 0.078, 0.35, -0.172], [0.068, 0.076, 0.084], coat, hips, `haunch${sd}`);
    ell([s * 0.084, 0.345, 0.128], [0.058, 0.068, 0.068], coat, spine.joints[2], `shoulder${sd}`);
  }

  // ===== Legs =====
  const legPaint = cel(
    furEdge(RUST_L, DARK_L, { by: "position", axis: [0, 1, 0], level: 0.285, teeth: 0.026, period: 0.032, along: [1, 0, 0] }),
  );
  const pawPts: { toe: THREE.Vector3 }[] = [];
  for (const hind of [false, true])
    for (const s of [1, -1]) {
      const sd = s > 0 ? "L" : "R";
      const x = s * (hind ? 0.098 : 0.094);
      const zA = hind ? -0.2 : 0.165;
      const zT = zA + (hind ? 0.07 : 0.06);
      const ground = topAt(x, (zA + zT) / 2);
      const root: number[] = hind ? [s * 0.074, 0.352, -0.172] : [s * 0.08, 0.347, 0.128];
      const ankle = [x, ground + 0.036, zA];
      const toe = [x, ground + 0.021, zT];
      const pts = limb(root, ankle, hind ? [0.088, 0.082] : [0.082, 0.08], [[0, 0, hind ? 1 : -1]]);
      const names = hind
        ? [`hip${sd}`, `knee${sd}`, `ankle${sd}`, `foot${sd}`]
        : [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`, `hand${sd}`];
      const leg = b.chain(`${hind ? "legH" : "legF"}${sd}`, catmull([...pts, toe]), {
        parent: hind ? hips : spine.joints[2],
        names,
        role: "leg",
        contact: toe,
      });
      const legSweep = b.sweep(leg, hind ? [0.05, 0.04, 0.034, 0.033] : [0.045, 0.037, 0.032, 0.032], {
        color: legPaint,
        sides: 10,
        name: `leg${hind ? "H" : "F"}${sd}`,
      });
      if (!hind) {
        // gold bangle with a jade bead
        b.sweep(b.surface(legSweep).loop(leg.at(0.66), { lift: 0.002 }), 0.0055, { color: GOLD, sides: 8, name: "bangle" });
        ell([x + s * 0.002, ground + 0.07, zA + 0.034], [0.007, 0.007, 0.007], MINT_GLOW, leg.joints[2], "bangleGem");
      }
      const foot = leg.tip!;
      pawPts.push({ toe: new THREE.Vector3(...toe) });
      // paw pad and toes
      ell([x, ground + 0.014, zT - 0.006], [0.033, 0.02, 0.05], DARK, foot, `paw${hind ? "H" : "F"}${sd}`);
      for (let i = -1; i <= 1; i++) {
        const tj = b.joint(`toe${hind ? "H" : "F"}${sd}${i + 2}`, {
          parent: foot,
          at: [x + i * 0.017, ground + 0.016, zT + 0.002],
          dir: [i * 0.3, -0.12, 1],
          role: "digit",
        });
        const tipP = [x + i * 0.026, ground + 0.012, zT + 0.036 - Math.abs(i) * 0.006];
        b.capsule([x + i * 0.017, ground + 0.016, zT + 0.002], tipP, 0.0135, { color: DARK, bone: tj, sides: 6 });
        b.spike(tipP, [i * 0.25, -0.2, 1], 0.014, 0.0035, { color: CLAW, bone: tj, sides: 5 });
      }
      // fur ruff above the paw
      b.spike([x, ground + 0.055, zA - 0.01], [s * 0.2, 0.15, -1], 0.032, 0.013, { color: DARK, bone: leg.joints[2], sides: 5 });
    }

  // ===== Tail =====
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.36, -0.2],
      [0.0, 0.375, -0.32],
      [0.02, 0.41, -0.43],
      [0.045, 0.46, -0.52],
      [0.04, 0.53, -0.575],
    ]),
    { parent: hips, count: 6, role: "tail" },
  );
  const tailPaint = cel(
    paint((_p, _n, s) => {
      const t = s[0];
      if (t > 0.9 - 0.025 * zigzag(s[1] / 40)) return TAIL_TIP;
      const k = Math.floor(t * 9.5 + 0.35 * zigzag(s[1] / 60 + t * 3));
      return k % 2 === 0 || t < 0.12 ? RUST_L : TAIL_PALE;
    }),
  );
  const tailSweep = b.sweep(tail, [0.058, 0.079, 0.093, 0.087, 0.059], { color: tailPaint, sides: 12, name: "tail" });

  // ===== Head =====
  const skullPaint = paint((p, n) => {
    const x = Math.abs(p.x) / K;
    const y = (p.y - HY) / K;
    const z = (p.z - HZ) / K;
    if (z > 0.02) {
      // tear stripe: eye corner to mouth corner
      const ax = 0.034;
      const ay = 0.008;
      const bx = 0.054;
      const by = -0.04;
      const t = Math.min(Math.max(((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2), 0), 1);
      const d = Math.hypot(x - (ax + t * (bx - ax)), y - (ay + t * (by - ay)));
      if (d < 0.0075 - 0.003 * t + 0.002 * zigzag(y / 0.012)) return TEAR;
    }
    if (Math.hypot((x - 0.045) / 0.014, (y - 0.04) / 0.008) < 1 && z > 0.03) return CREAM;
    if (z > 0.03 && x < 0.012 + Math.max(0, 0.02 - y) * 0.5 && y < 0.02) return CREAM;
    if (z > -0.035 && y < -0.01 + 0.012 * zigzag(x / 0.014)) return CREAM;
    return n.y > 0.55 ? cel(RUST_GOLD, RUST_L) : RUST;
  });
  const skull = b.part(SPHERE, skullPaint, { bone: head, at: HC, scale: hr(0.093, 0.078, 0.082), name: "skull" });
  const muzzle = ell(hp(0, -0.02, 0.06), hr(0.042, 0.032, 0.048), CREAM, head, "muzzle");
  ell(hp(0, -0.011, 0.106), hr(0.017, 0.012, 0.012), NOSE, head, "nose");
  b.part(SPHERE, "#ffffff", { bone: head, at: hp(-0.005, -0.004, 0.113), scale: hr(0.004, 0.0025, 0.002) });
  ell(hp(0, -0.042, 0.059), hr(0.03, 0.017, 0.04), CREAM, jaw, "lowerJaw");
  ell(hp(0, -0.039, 0.074), hr(0.018, 0.006, 0.03), cel("#ff8aa0", "#d95a86"), jaw, "tongue");

  // eyes
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(HC).at(s * 38, 9);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.056, 0.076], mirror: s > 0, dir: [s * 0.45, 0, 1] });
  }

  // mouth line on the muzzle
  const muzzleSkin = b.surface(muzzle);
  b.sweep(muzzleSkin.drape(polyline([hp(0, -0.017, 0.109), hp(0, -0.029, 0.106)]), { lift: 0.001 }), 0.0014, {
    color: INK,
    bone: head,
    sides: 4,
  });
  for (const s of [1, -1])
    b.sweep(
      muzzleSkin.drape(catmull([hp(0, -0.029, 0.106), hp(s * 0.018, -0.039, 0.098), hp(s * 0.033, -0.037, 0.078)]), {
        lift: 0.001,
      }),
      0.0014,
      { color: INK, bone: head, sides: 4 },
    );

  // whiskers
  for (const s of [1, -1])
    for (let k = -1; k <= 1; k++)
      b.rod(hp(s * 0.036, -0.021 + k * 0.006, 0.074), hp(s * 0.115, -0.023 + k * 0.022, 0.054), [0.0018, 0.0008], {
        color: "#fffaf0",
        bone: head,
        sides: 4,
      });

  // ears
  const earOutline: OutlinePoint[] = (
    [
      [-0.036, 0],
      [-0.04, 0.028],
      [-0.024, 0.056],
      [0, 0.064],
      [0.024, 0.056],
      [0.04, 0.028],
      [0.036, 0],
      [0, -0.008],
    ] as [number, number][]
  ).map(([x, y]) => [x * K, y * K]);
  const earPaint = paint((_p, n, s) => {
    if (Math.abs(n.z) < 0.55) return CREAM;
    if (n.z < 0) return s[1] > 0.045 * K ? DARK : RUST;
    const e = Math.hypot(s[0] / (0.03 * K), (s[1] - 0.03 * K) / (0.034 * K));
    return e < 0.62 + 0.14 * zigzag(s[0] / 0.009) ? EAR_IN : CREAM;
  });
  for (const s of [1, -1])
    b.extrude(earOutline, {
      at: hp(s * 0.062, 0.053, -0.036),
      x: [s * 0.9, -0.4, 0],
      y: [s * 0.45, 1, 0.1],
      thickness: 0.02,
      bevel: 0.006,
      smoothing: 1,
      detail: 0.5,
      color: earPaint,
      bone: earJ[s],
      name: s > 0 ? "earL" : "earR",
    });

  // cheek ruffs: fluffy cream tufts sweeping back
  const ruff: OutlinePoint[] = (
    [
      [0, 0.034],
      [0.03, 0.046],
      [0.06, 0.036],
      [0.092, 0.018, "sharp"],
      [0.066, 0.0],
      [0.098, -0.016, "sharp"],
      [0.064, -0.024],
      [0.082, -0.044, "sharp"],
      [0.04, -0.038],
      [0.0, -0.032],
    ] as OutlinePoint[]
  ).map((p) => (p.length === 3 ? [p[0] * K, p[1] * K, p[2]] : [p[0] * K, p[1] * K]) as OutlinePoint);
  for (const s of [1, -1])
    b.extrude(ruff, {
      at: hp(s * 0.072, -0.025, 0.047),
      x: [0, 0, -1],
      y: [s * 0.3, 1, 0],
      thickness: 0.032,
      bevel: 0.009,
      color: CREAM,
      bone: head,
      name: s > 0 ? "cheekL" : "cheekR",
    });
  for (const s of [1, -1])
    b.extrude(
      ruff.map((p) => (p.length === 3 ? [p[0] * 0.7, p[1] * 0.7, p[2]] : [p[0] * 0.7, p[1] * 0.7]) as OutlinePoint),
      {
        at: hp(s * 0.058, -0.052, 0.036),
        x: [0, 0, -1],
        y: [s * 0.3, 1, 0],
        thickness: 0.026,
        bevel: 0.007,
        color: CREAM,
        bone: head,
        name: s > 0 ? "cheekLowL" : "cheekLowR",
      },
    );

  // forehead leaf circlet: three gold leaves lying over the crown and a glowing dendro gem
  const leafOutline: OutlinePoint[] = [
    [0, 0],
    [0.015, 0.017],
    [0.012, 0.042],
    [0, 0.064, "sharp"],
    [-0.012, 0.042],
    [-0.015, 0.017],
  ];
  for (const k of [-1, 0, 1]) {
    const dirY = [k * 0.55, 0.28, -1];
    b.extrude(leafOutline, {
      at: hp(k * 0.02, 0.066 - Math.abs(k) * 0.006, 0.058 - Math.abs(k) * 0.008),
      x: [-dirY[2], 0, dirY[0]],
      y: dirY,
      thickness: 0.004,
      bevel: 0.0015,
      detail: 0.4,
      color: GOLD,
      bone: head,
      name: "circletLeaf",
    });
  }
  glow(b.part(new THREE.OctahedronGeometry(0.011, 0), MINT_GLOW, { bone: head, at: hp(0, 0.066, 0.066), scale: [0.8, 0.8, 1.1] }), 1.4);

  // ear ring on the left ear
  b.part(new THREE.TorusGeometry(0.0085, 0.0017, 5, 12), "#ffd552", {
    bone: earJ[1],
    at: hp(0.072, 0.047, -0.036),
    dir: [0, 0, 1],
    axis: "z",
  });
  b.part(new THREE.SphereGeometry(0.004, 6, 4), "#27e0c4", { bone: earJ[1], at: hp(0.072, 0.036, -0.036) });

  // ===== Scarf, pendant, tassels =====
  const neckSkin = b.surface(neckSweep);
  for (const [t, color] of [
    [0.22, TEAL],
    [0.5, TEAL_D],
  ] as const)
    b.sweep(neckSkin.loop(neck.at(t), { lift: 0.003 }), 0.021, { color, sides: 12, name: "scarf" });
  for (const t of [0.02, 0.72])
    b.sweep(neckSkin.loop(neck.at(t), { lift: 0.007 }), 0.005, { color: GOLD, sides: 8, name: "scarfTrim" });

  // scarf knot and tails on the chest
  const bodySkin = b.surface(bodySweep);
  const knotHit = bodySkin.ray([0.03, 0.34, 0.6], [0, 0, -1]);
  const knotAt = knotHit ? knotHit.at : new THREE.Vector3(0.03, 0.34, 0.23);
  const chest = spine.joints[2];
  ell([knotAt.x, knotAt.y + 0.025, knotAt.z + 0.004], [0.028, 0.024, 0.022], TEAL, chest, "knot");
  const ribbon: OutlinePoint[] = [
    [-0.017, 0],
    [0.017, 0],
    [0.017, -0.09],
    [0, -0.074, "sharp"],
    [-0.017, -0.09],
  ];
  const ribbonPaint = paint((_p, n, s) => {
    if (Math.abs(n.z) < 0.5) return GOLD;
    if (s[1] < -0.082 || (s[1] > -0.012 && s[1] < -0.004)) return GOLD;
    if (Math.abs(s[0]) > 0.0135) return GOLD;
    return s[1] > -0.07 && Math.abs(s[0]) < 0.004 ? TEAL_D : TEAL;
  });
  const tasselAt: number[][] = [];
  [-1, 1].forEach((k, i) => {
    const bx = knotAt.x + k * 0.012;
    const hit = bodySkin.ray([bx, knotAt.y + 0.02, 0.6], [0, 0, -1]);
    const at = hit ? hit.at : new THREE.Vector3(bx, knotAt.y, knotAt.z);
    b.extrude(ribbon, {
      at: [at.x + k * 0.01, at.y + 0.004 - i * 0.01, at.z + 0.007],
      x: [1, 0, 0],
      y: [k * 0.18, 1, 0.5],
      thickness: 0.006,
      bevel: 0.002,
      color: ribbonPaint,
      bone: chest,
      name: "scarfTail",
    });
    tasselAt.push([at.x + k * 0.01, at.y - 0.08 - i * 0.01, at.z + 0.002]);
  });
  b.cards(
    tasselAt.map((p) => frame(p, [0, 1, 0])),
    TASSEL,
    { size: [0.032, 0.094], lean: 180, flow: [0, 0, 1], bone: chest },
  );
  // pendant: gold bell with a glowing gem
  ell([knotAt.x, knotAt.y, knotAt.z + 0.026], [0.0135, 0.0135, 0.0135], GOLD, chest, "bell");
  glow(
    b.part(new THREE.OctahedronGeometry(0.008, 0), JADE_GLOW, {
      bone: chest,
      at: [knotAt.x, knotAt.y, knotAt.z + 0.04],
      scale: [0.75, 1.1, 0.75],
    }),
    1.4,
  );

  // embroidered saddle cloth on the back, with tassels at its sides
  const saddleHit = bodySkin.ray([0, 0.9, -0.01], [0, -1, 0]);
  if (saddleHit)
    b.decal(bodySkin, SADDLE, {
      at: saddleHit,
      dir: [0, 1, 0],
      up: [0, 0, 1],
      size: [0.16, 0.14],
      segments: 16,
      lift: 0.003,
      name: "saddle",
    });
  const sideTassels: number[][] = [];
  for (const s of [1, -1])
    for (const z of [-0.055, 0.045]) {
      const hit = bodySkin.ray([s * 0.082, 0.9, z], [0, -1, 0]);
      if (hit) sideTassels.push([hit.at.x, hit.at.y + 0.003, hit.at.z]);
    }
  b.cards(
    sideTassels.map((p) => frame(p, [0, 1, 0])),
    TASSEL,
    { size: [0.028, 0.08], lean: 180, flow: [0, 0, 1], bone: chest },
  );

  // gold tail band with a tiny bell
  const tailSkin = b.surface(tailSweep);
  const bandAt = tail.at(0.2).at;
  b.sweep(tailSkin.loop(tail.at(0.2), { lift: 0.004 }), 0.009, { color: GOLD, name: "tailBand" });
  const bandHit = tailSkin.ray([0, -1, bandAt.z], [0, 1, 0]);
  if (bandHit) {
    ell([bandHit.at.x, bandHit.at.y - 0.02, bandHit.at.z], [0.012, 0.013, 0.012], GOLD, tail.joints[1], "tailBell");
    b.rod(bandHit.at, [bandHit.at.x, bandHit.at.y - 0.012, bandHit.at.z], 0.0025, {
      color: "#ffd552",
      bone: tail.joints[1],
      sides: 4,
    });
  }

  // ===== Fur tufts (cards) =====
  b.cards(tailSkin.scatter(40, { rng: rng(21), minDist: 0.06 }), FUR, {
    size: [0.044, 0.05],
    lean: 76,
    bend: 20,
    vary: 0.3,
    rng: rng(22),
    color: tailPaint,
    flow: (_f, i) => [Math.cos(i * 2.399) * 0.4, -0.4, -1],
  });
  b.cards(neckSkin.scatter(30, { rng: rng(23), minDist: 0.035, filter: (h) => h.n.z > -0.2 }), FUR, {
    size: [0.036, 0.046],
    lean: 62,
    bend: 18,
    vary: 0.3,
    rng: rng(24),
    color: CREAM,
  });

  // ===== Stone dressing =====
  const pawAvoid = (p: THREE.Vector3) =>
    pawPts.some((q) => Math.hypot(p.x - q.toe.x, p.z - q.toe.z + 0.02) < 0.065 && p.y > 0.12);
  const isMoss = (h: { at: THREE.Vector3; n: THREE.Vector3 }) => mossField(h.at, h.n) > MOSS_AT + 0.06;
  b.cards(stoneSurf.scatter(120, { rng: rng(11), minDist: 0.03, filter: isMoss, keepOut: pawAvoid }), MOSS_TUFT, {
    size: [0.044, 0.036],
    lean: 52,
    bend: 20,
    vary: 0.4,
    rng: rng(12),
    cross: true,
    flow: (_f, i) => [Math.cos(i * 2.1), -0.2, Math.sin(i * 2.1)],
  });
  b.cards(
    stoneSurf.scatter(22, { rng: rng(13), minDist: 0.07, filter: (h) => isMoss(h) && h.n.y > 0.7, keepOut: pawAvoid }),
    FLOWER,
    { size: 0.026, lean: 8, vary: 0.25, rng: rng(14), cross: true },
  );
  b.cards(
    stoneSurf
      .scatter(30, { rng: rng(15), minDist: 0.06, filter: (h) => isMoss(h) && h.n.y > 0.8, keepOut: pawAvoid })
      .map((h) => frame(h.moved([0, 0.002, 0]).at, [0, 1, 0])),
    CLOVER,
    { size: 0.036, lean: 90, flow: [1, 0, 0], mirror: true, spin: 180, rng: rng(16), bone: stoneJ },
  );

  // glowing runes carved into the stone
  for (const [az, el, size] of [
    [2, 6, 0.15],
    [58, 4, 0.1],
    [-58, 4, 0.1],
  ] as const) {
    const hit = stoneSurf.around([0, 0.1, 0]).at(az, el);
    if (hit) glow(b.decal(stoneSurf, RUNE, { at: hit, size: [size, size], lift: 0.003, name: "rune" }), 1.2);
  }

  // pebbles round the base
  const pebbles: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 9; i++) {
    const a = i * 0.7 + 0.2;
    const r = 0.3 + R() * 0.12;
    const size = 0.016 + R() * 0.016;
    const g = new THREE.IcosahedronGeometry(size, 0);
    g.scale(1.2, 0.7, 1);
    g.translate(Math.sin(a) * r * 0.85, size * 0.45, Math.cos(a) * r * 1.05);
    pebbles.push(g);
  }
  b.part(mergeGeometries(pebbles), STONE_C, { bone: stoneJ, at: [0, 0, 0], flat: true, name: "pebbles" });

  // ground grass
  const grassFrames = Array.from({ length: 34 }, (_, i) => {
    const a = (i / 34) * Math.PI * 2 + R() * 0.2;
    const r = 0.27 + R() * 0.11;
    return frame([Math.sin(a) * r * 0.9, 0.012, Math.cos(a) * r * 1.08], [0, 1, 0]);
  });
  b.cards(grassFrames, GRASS, {
    size: [0.05, 0.065],
    lean: 25,
    vary: 0.4,
    rng: rng(31),
    cross: true,
    bone: stoneJ,
    flow: (_f, i) => [Math.cos(i * 1.7), -0.2, Math.sin(i * 1.7)],
  });

  // glowing mushrooms growing from the moss
  const capOutline: [number, number][] = [
    [0, 0],
    [0.026, 0.002],
    [0.034, 0.014],
    [0.028, 0.03],
    [0.012, 0.04],
    [0, 0.042],
  ];
  const stemOutline: [number, number][] = [
    [0, 0],
    [0.009, 0],
    [0.0075, 0.03],
    [0, 0.03],
  ];
  for (const [az, el, k] of [
    [88, 18, 1],
    [112, 8, 0.7],
    [-118, 12, 0.85],
    [160, 5, 0.6],
  ] as const) {
    const hit = stoneSurf.around([0, 0.1, 0]).at(az, el);
    if (!hit) continue;
    const base = hit.moved([0, -0.006, 0]).at;
    const up = hit.n.clone().lerp(new THREE.Vector3(0, 1, 0), 0.6).normalize();
    b.lathe(
      stemOutline.map(([x, y]) => [x * k, y * k] as [number, number]),
      { at: base, axis: up, color: cel(CREAM_L, "#d9c8d8"), bone: stoneJ, segments: 6, name: "stem" },
    );
    const cap = base.clone().addScaledVector(up, 0.028 * k);
    glow(
      b.lathe(
        capOutline.map(([x, y]) => [x * k, y * k] as [number, number]),
        { at: cap, axis: up, color: MINT_GLOW, bone: stoneJ, segments: 8, name: "cap" },
      ),
      1.1,
    );
    for (let j = 0; j < 4; j++) {
      const a = j * 1.7;
      const o = new THREE.Vector3(Math.cos(a), 0, Math.sin(a)).multiplyScalar(0.016 * k);
      b.part(new THREE.SphereGeometry(0.004 * k, 5, 4), "#f4fff0", {
        bone: stoneJ,
        at: cap.clone().add(o).addScaledVector(up, 0.03 * k + (j % 2) * 0.005),
      });
    }
  }

  // bamboo behind the stone
  const bamboo = (base: number[], top: number[], r: number, leaves: number, seed: number) => {
    const path = catmull([
      base,
      [base[0] + (top[0] - base[0]) * 0.4, top[1] * 0.4, base[2] + (top[2] - base[2]) * 0.4 + 0.01],
      top,
    ]);
    const culm = b.sweep(path, r, {
      color: cel(paint((_p, _n, s) => ((s[0] * 7) % 1 < 0.07 ? "#d8e68a" : zigzag(s[1] / 90) > 0.9 ? "#4fb067" : "#5cc06a"))),
      sides: 6,
      bone: stoneJ,
      name: "bamboo",
    });
    b.cards(
      b.along(culm, leaves, (a) => a, { from: 0.3 }),
      LEAF,
      {
        size: [0.032, 0.13],
        lean: 62,
        bend: 24,
        vary: 0.3,
        rng: rng(seed),
        bone: stoneJ,
        flow: (_f, i) => [Math.cos(i * 2.8 + seed), 0.1, Math.sin(i * 2.8 + seed)],
        cross: true,
      },
    );
    b.along(culm, 6, (a) =>
      b.part(new THREE.TorusGeometry(r * 1.02, r * 0.28, 4, 6), "#e2f09a", { bone: stoneJ, at: a.at, dir: [0, 1, 0], axis: "z" }),
    );
  };
  bamboo([0.36, 0, -0.2], [0.33, 0.56, -0.24], 0.011, 6, 41);
  bamboo([0.42, 0, -0.12], [0.45, 0.4, -0.14], 0.008, 4, 43);

  // drifting dendro seeds
  [
    [0.26, 0.5, 0.2],
    [-0.28, 0.44, 0.18],
    [-0.22, 0.58, -0.12],
    [0.2, 0.62, -0.05],
    [0.1, 0.56, 0.33],
    [-0.08, 0.5, 0.36],
  ].forEach((p, i) => {
    const k = 0.8 + (i % 3) * 0.3;
    glow(
      b.part(new THREE.OctahedronGeometry(0.01 * k, 0), i % 2 ? JADE_GLOW : MINT_GLOW, {
        bone: stoneJ,
        at: p,
        scale: [0.7, 1.3, 0.7],
      }),
      1.3,
    );
    b.part(new THREE.OctahedronGeometry(0.004 * k, 0), "#ffe27a", { bone: stoneJ, at: [p[0] + 0.012, p[1] - 0.012, p[2]] });
  });

  return b.root;
}
