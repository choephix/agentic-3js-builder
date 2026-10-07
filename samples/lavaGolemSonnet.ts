import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { mottle } from "../src/paint";
import { bezier, catmull } from "../src/path";
import type { Part } from "../src/parts";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";
import { cel, INK } from "../kits/toon";

export const meta = {
  name: "Lava Golem",
  description:
    "A hunched three-metre golem of basalt column plates over a molten core: lava seams glow between the plates, gold filigree trims, a caged heart-core, flame crest, horns and a molten tail.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const BAS_A = cel(mottle("#7a76a4", "#8884b0", { size: 0.35, seed: 1, contrast: 0.7 }), "#3d3766");
const BAS_B = cel(mottle("#67638f", "#757198", { size: 0.3, seed: 2, contrast: 0.7 }), "#322d57");
const BAS_C = cel(mottle("#605478", "#6e6286", { size: 0.3, seed: 3, contrast: 0.7 }), "#2d2342");
const BAS_D = cel(mottle("#4f4a70", "#5b5679", { size: 0.3, seed: 4, contrast: 0.7 }), "#27213e");
const OBSIDIAN = cel("#46385f", "#1f1630");
const GOLD = cel("#ffd75a", "#c4772a");
const GOLD_DK = cel("#e8a93a", "#93501e");
const IVORY = cel("#fff3d4", "#dca777");
const CORE_RED = "#ff4a12";
const CORE = "#ff7a1c";
const CORE_HOT = "#ffb62e";
const CORE_WHITE = "#fff2a6";
const UPPER = [BAS_A, BAS_A, BAS_B];
const LOWER = [BAS_B, BAS_C, BAS_D];

const prof = (keys: number[]) => (t: number) => {
  const x = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
  const i = Math.min(Math.floor(x), keys.length - 2);
  return keys[i]! + (keys[i + 1]! - keys[i]!) * (x - i);
};
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------- drawings
const FIL_PATH = `M50 6 L58 28 Q76 18 87 35 Q95 52 79 58 Q66 62 64 51 M50 6 L42 28 Q24 18 13 35 Q5 52 21 58 Q34 62 36 51 M50 94 L58 72 Q76 82 87 65 Q95 48 79 42 Q66 38 64 49 M50 94 L42 72 Q24 82 13 65 Q5 48 21 42 Q34 38 36 49 M50 33 L62 50 L50 67 L38 50 Z`;
const FILIGREE = svg(
  `<svg viewBox="0 0 100 100"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <g stroke="#8f4a16" stroke-width="5.5" transform="translate(1.6 1.8)"><path d="${FIL_PATH}"/></g>
    <g stroke="#ffd45a" stroke-width="4.2"><path d="${FIL_PATH}"/></g>
    <g stroke="#fff4bc" stroke-width="1.3"><path d="${FIL_PATH}"/></g>
    <circle cx="50" cy="50" r="6" fill="#ffd45a" stroke="#8f4a16" stroke-width="2"/>
  </g></svg>`,
  { size: 384 },
);

const FLAME = svg(
  `<svg viewBox="0 0 60 100">
    <path d="M30 0 C34 22 56 36 54 64 C52 88 38 98 30 98 C22 98 8 88 6 64 C4 44 18 38 22 22 C24 34 28 30 30 0 Z" fill="#ff4a12"/>
    <path d="M30 24 C33 40 46 50 44 68 C43 84 36 92 30 92 C24 92 17 84 16 68 C15 54 26 44 30 24 Z" fill="#ff9a24"/>
    <path d="M30 50 C33 60 38 66 37 76 C36 86 33 90 30 90 C27 90 24 86 23 76 C22 66 28 60 30 50 Z" fill="#ffd95a"/>
    <ellipse cx="30" cy="85" rx="6" ry="8" fill="#fff6c4"/>
  </svg>`,
  { size: 192 },
);

const crackPaths = [
  "M2 30 L18 22 L30 36 L44 20 L58 34 L70 18 L84 30 L98 24 M30 36 L36 54 M58 34 L52 50 L60 58 M70 18 L76 4",
  "M3 14 L20 28 L34 18 L48 38 L62 26 L76 44 L97 36 M48 38 L44 56 M62 26 L66 8 M76 44 L84 58",
  "M2 44 L16 30 L28 40 L40 22 L56 30 L66 12 L80 24 L98 8 M40 22 L34 6 M56 30 L58 50 M80 24 L90 40",
];
const CRACKS = crackPaths.map((d) =>
  svg(
    `<svg viewBox="0 0 100 60"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="${d}" stroke="#ff7a1c" stroke-width="6.5"/>
      <path d="${d}" stroke="#ffd45a" stroke-width="3"/>
      <path d="${d}" stroke="#fff6c4" stroke-width="1.1"/></g></svg>`,
    { size: 256 },
  ),
);

const EYE = svg(
  `<svg viewBox="0 0 100 44">
    <path d="M3 8 Q50 -8 97 30 Q55 46 3 8 Z" fill="#fff0a0" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M12 12 Q50 0 90 28 Q54 38 12 12 Z" fill="#ffd24a"/>
    <path d="M30 14 Q55 8 80 26 Q58 30 30 14 Z" fill="#fffbe0"/>
    <ellipse cx="62" cy="20" rx="4" ry="10" fill="#c8300f"/>
    <path d="M3 8 L-0 2" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const tassel = (() => {
  let strands = "";
  for (let i = 0; i < 6; i++) strands += `<path d="M${9 + i * 4.4} 74 L${9 + i * 4.4} ${110 + (i % 2) * 6}" stroke="#ffd45a" stroke-width="3" stroke-linecap="round"/>`;
  return svg(
    `<svg viewBox="0 0 40 120">
      <rect x="16" y="0" width="8" height="16" rx="3" fill="#ffd45a" stroke="#8f4a16" stroke-width="1.5"/>
      <path d="M9 15 L31 15 L35 72 Q20 80 5 72 Z" fill="#d83a2c"/>
      <path d="M20 15 L20 77" stroke="#9c1f2e" stroke-width="2.4"/>
      <rect x="7" y="38" width="26" height="7" fill="#ffd45a"/>
      <rect x="6" y="66" width="28" height="6" fill="#ffd45a"/>
      ${strands}
    </svg>`,
    { size: 192 },
  );
})();

const BANNER = svg(
  `<svg viewBox="0 0 60 84">
    <path d="M2 0 L58 0 L58 70 L30 84 L2 70 Z" fill="#8f4a16"/>
    <path d="M5 3 L55 3 L55 68 L30 80 L5 68 Z" fill="#c92f2a"/>
    <path d="M9 7 L51 7 L51 65 L30 75 L9 65 Z" fill="none" stroke="#ffd45a" stroke-width="2.2"/>
    <path d="M30 14 L42 34 L30 54 L18 34 Z" fill="none" stroke="#ffd45a" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M30 22 L36 34 L30 46 L24 34 Z" fill="#ffb62e"/>
    <circle cx="30" cy="34" r="2.6" fill="#fff4bc"/>
    <path d="M14 58 Q22 50 30 58 Q38 50 46 58" fill="none" stroke="#ffd45a" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------- plate geometry
function plateGeo(sides: number, seed: number) {
  const r = rng(seed);
  const pts: THREE.Vector2[] = [];
  const off = r() * (Math.PI / sides);
  for (let i = 0; i < sides; i++) {
    const a = off + (i / sides) * Math.PI * 2;
    const k = 0.5 * (0.84 + 0.3 * r());
    pts.push(new THREE.Vector2(Math.cos(a) * k, Math.sin(a) * k));
  }
  const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts), {
    depth: 0.5,
    bevelEnabled: true,
    bevelThickness: 0.14,
    bevelSize: 0.07,
    bevelSegments: 1,
    steps: 1,
  });
  g.clearGroups();
  g.rotateX(-Math.PI / 2);
  g.center();
  return g;
}
const PLATES = [plateGeo(5, 1), plateGeo(6, 2), plateGeo(5, 3), plateGeo(6, 4), plateGeo(5, 5), plateGeo(6, 6)];
const PLATE_Y = 0.78;
const hexGeo = (rt: number, rb: number) => new THREE.CylinderGeometry(rt, rb, 1, 6);

export default function build() {
  const b = createBuilder({ name: "lavaGolem" });
  const R = rng(77);
  const plateParts: Record<string, Part[]> = {};

  // ================================================================ skeleton
  const hips = b.joint("hips", { at: [0, 1.38, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.42, 0],
      [0, 1.8, 0.06],
      [0, 2.2, 0.16],
      [0, 2.55, 0.2],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const spine3 = spine.joints[2]!;
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.55, 0.2],
      [0, 2.7, 0.28],
      [0, 2.85, 0.38],
    ]),
    { parent: spine3, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1]!, at: [0, 2.85, 0.38], dir: [0, -0.05, 1], role: "head" });
  const K = 1.18; // head scale
  const hp = (f: number, u: number, l = 0) => head.local({ forward: f * K, up: u * K, left: l * K });
  const jaw = b.joint("jaw", {
    parent: head,
    at: hp(0.06, -0.1),
    aim: hp(0.5, -0.12),
    role: "jaw",
  });
  const jl = (f: number, u: number, l = 0) => jaw.local({ forward: f * K, up: u * K, left: l * K });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.35, -0.15],
      [0, 1.2, -0.75],
      [0, 0.95, -1.35],
      [0, 0.78, -1.95],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  type Side = { s: number; L: string; arm: ReturnType<typeof b.chain>; leg: ReturnType<typeof b.chain>; W: THREE.Vector3; E: THREE.Vector3; fingers: ReturnType<typeof b.chain>[]; thumb: ReturnType<typeof b.chain>; toes: ReturnType<typeof b.chain>[] };
  const sides: Side[] = [];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const S = V(s * 1.08, 2.5, 0.08);
    const E = V(s * 1.56, 1.9, 0.28);
    const W = V(s * 1.8, 1.2, 0.4);
    const arm = b.chain(`arm${L}`, catmull([S, E, W]), {
      parent: spine3,
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
      role: "arm",
    });
    const wrist = arm.tip!;
    // hand: fingers hang along the forearm direction, splayed and curled a little
    const d = W.clone().sub(E).normalize();
    const fingers: ReturnType<typeof b.chain>[] = [];
    const fnames = ["index", "middle", "ring", "pinky"];
    const flen = [0.95, 1.05, 0.98, 0.8];
    for (let i = 0; i < 4; i++) {
      const u = (i - 1.5) * 0.098;
      const k = flen[i]!;
      const p0 = W.clone().addScaledVector(d, 0.34).add(V(u, 0, 0.02));
      const p1 = p0.clone().addScaledVector(d, 0.2 * k).add(V(u * 0.45, 0, 0.05));
      const p2 = p1.clone().addScaledVector(d, 0.17 * k).add(V(u * 0.25, 0, 0.09));
      const p3 = p2.clone().addScaledVector(d, 0.12 * k).add(V(u * 0.1, 0, 0.08));
      fingers.push(
        b.chain(`${fnames[i]}${L}`, catmull([p0, p1, p2, p3]), {
          parent: wrist,
          names: [`${fnames[i]}${L}1`, `${fnames[i]}${L}2`, `${fnames[i]}${L}3`, `${fnames[i]}${L}4`],
          role: "digit",
        }),
      );
    }
    const t0 = W.clone().addScaledVector(d, 0.12).add(V(-s * 0.2, 0, 0.04));
    const t1 = t0.clone().addScaledVector(d, 0.12).add(V(-s * 0.1, 0, 0.12));
    const t2 = t1.clone().addScaledVector(d, 0.06).add(V(-s * 0.04, 0, 0.14));
    const thumb = b.chain(`thumb${L}`, catmull([t0, t1, t2]), {
      parent: wrist,
      names: [`thumb${L}1`, `thumb${L}2`, `thumb${L}3`],
      role: "digit",
    });

    const hip = V(s * 0.44, 1.28, 0);
    const ankle = V(s * 0.5, 0.3, 0);
    const pts = limb(hip, ankle, [0.68, 0.66], [0, 0, 1]);
    const leg = b.chain(`leg${L}`, pts, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
    });
    const toes: ReturnType<typeof b.chain>[] = [];
    for (let i = 0; i < 3; i++) {
      const dx = (i - 1) * 0.2;
      const x = s * 0.5 + dx;
      const sp = (i - 1) * 0.07 * s;
      toes.push(
        b.chain(
          `toe${i + 1}${L}`,
          catmull([
            [x, 0.1, 0.34],
            [x + sp, 0.1, 0.58 - Math.abs(i - 1) * 0.04],
            [x + sp * 2, 0.09, 0.76 - Math.abs(i - 1) * 0.07],
          ]),
          {
            parent: leg.tip!,
            names: [`toe${i + 1}${L}1`, `toe${i + 1}${L}2`, `toe${i + 1}${L}3`],
            role: "digit",
          },
        ),
      );
    }
    sides.push({ s, L, arm, leg, W, E, fingers, thumb, toes });
  }

  // ================================================================ helpers
  /** One ring of basalt plates round a body: hits come from `skin`, so each plate follows the bones under it. */
  const plateRow = (
    skin: ReturnType<typeof b.surface>,
    at: THREE.Vector3 | number[],
    dir: THREE.Vector3 | number[] | undefined,
    o: {
      zone: string;
      h: number;
      w: number;
      thick: number;
      phase?: number;
      flow: THREE.Vector3 | number[];
      palette: typeof UPPER;
      skip?: (p: THREE.Vector3) => boolean;
      lift?: number;
    },
  ) => {
    const loop = dir ? skin.loop(at, { dir }) : skin.loop(at);
    const count = Math.max(5, Math.round(loop.length / o.w));
    const step = loop.length / count;
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5 + (o.phase ?? 0)) / count;
      const hit = skin.nearest(loop.at(t % 1));
      if (o.skip?.(hit.at)) continue;
      const jw = 0.9 + 0.18 * R();
      const jh = 0.92 + 0.14 * R();
      const jt = 0.85 + 0.35 * R();
      const geo = PLATES[Math.floor(R() * PLATES.length)]!;
      const w = step * 0.99 * jw;
      const h = o.h * jh * 1.12;
      const t3 = o.thick * jt;
      const part = b.stick(geo, o.palette[Math.floor(R() * o.palette.length)]!, hit, {
        embed: 0.32,
        flow: o.flow,
        spin: (R() - 0.5) * 22,
        scale: [w, t3 / PLATE_Y, h],
        flat: true,
        group: o.zone,
      });
      (plateParts[o.zone] ??= []).push(part);
    }
  };

  const tubeRows = (
    core: Parameters<typeof b.surface>[0],
    chain: ReturnType<typeof b.chain>,
    ts: number[],
    o: { zone: string; width: number; thick: number; palette: typeof UPPER; spacing: number },
  ) => {
    const skin = b.surface(core);
    ts.forEach((t, k) => {
      const cp = chain.at(t);
      plateRow(skin, cp.at, cp.tangent, {
        zone: o.zone,
        h: o.spacing * chain.length * 0.9,
        w: o.width,
        thick: o.thick,
        phase: k % 2 ? 0.5 : 0,
        flow: cp.tangent,
        palette: o.palette,
      });
    });
  };

  const goldBand = (chain: ReturnType<typeof b.chain>, radius: (t: number) => number, from: number, to: number, group: string) =>
    b.sweep(chain, radius, { from, to, color: GOLD, caps: "flat", sides: 10, group });

  // ================================================================ torso
  const zAt = prof([0.02, 0.06, 0.16, 0.2]);
  const yToT = (y: number) => (y - 1.4) / 1.3;
  const torso = b.loft(
    [
      { at: [0, 1.4, 0], w: 0.82, h: 0.58 },
      { at: [0, 1.78, 0.06], w: 0.82, h: 0.56 },
      { at: [0, 2.15, 0.16], w: 1.2, h: 0.86 },
      { at: [0, 2.45, 0.2], w: 1.5, h: 0.92 },
      { at: [0, 2.68, 0.22], w: 1.1, h: 0.66 },
    ],
    {
      bone: [hips, spine],
      caps: "flat",
      sides: 12,
      bands: [
        [0.35, CORE_RED],
        [1, CORE],
      ],
      group: "torso",
    },
  );
  glow(torso, 1);
  const torsoSkin = b.surface(torso);
  const HEART = torsoSkin.ray([0, 2.1, 3], [0, 0, -1])!;
  const heartAt = HEART.at.clone();
  const torsoRows = Array.from({ length: 9 }, (_, i) => 1.43 + i * 0.15);
  torsoRows.forEach((y, i) => {
    plateRow(torsoSkin, [0, y, zAt(yToT(y))], undefined, {
      zone: "torso",
      h: 0.16,
      w: y > 2.2 ? 0.28 : 0.24,
      thick: 0.13,
      phase: i % 2 ? 0.5 : 0,
      flow: [0, 1, 0],
      palette: UPPER,
      skip: (p) => p.distanceTo(heartAt) < 0.3,
    });
  });

  // belt, buckle, banners
  {
    const belt = torsoSkin.loop([0, 1.64, 0.05], { lift: 0.1 });
    b.sweep(belt, 0.045, { color: GOLD, sides: 8, group: "belt" });
    const front = torsoSkin.ray([0, 1.64, 3], [0, 0, -1])!;
    const buckle = b.stick(hexGeo(0.14, 0.14), GOLD, front.moved([0, 0.1, 0]), { embed: 0.2, scale: [1, 0.07, 1], flat: true });
    b.stick(new THREE.SphereGeometry(0.07, 8, 6), CORE_HOT, buckle.moved([0, 0.035, 0]), { embed: 0.3, group: "gem" });
    glow(b.part(new THREE.IcosahedronGeometry(0.058, 0), CORE_WHITE, { at: buckle.local([0, 0.06, 0]), bone: hips, group: "gem" }), 1.4);
    b.along(belt, 14, (at) => b.stick(new THREE.SphereGeometry(0.03, 6, 4), GOLD_DK, at, { embed: 0.3, flat: true }));
    // tassels from the belt
    const tFrames = b
      .along(belt, 11, (at) => at)
      .filter((at) => Math.abs(at.at.x) > 0.1 || at.at.z < 0)
      .map((at) => frame(at.moved([0, 0.0, 0.0]).at, [0, 1, 0]));
    b.cards(tFrames, tassel, { size: [0.1, 0.4], lean: 180, flow: [0, 0, 1], vary: 0.2, rng: rng(5), bone: hips });
    b.part(new THREE.PlaneGeometry(0.4, 0.58), "#ffffff", { at: [0, 1.31, 0.455], dir: [0, 0.12, 1], axis: "z", texture: BANNER, bone: hips, group: "banner" });
    b.part(new THREE.PlaneGeometry(0.4, 0.58), "#ffffff", { at: [0, 1.31, -0.4], dir: [0, 0.12, -1], axis: "z", texture: BANNER, bone: hips, group: "banner" });
  }

  // heart core in a gold cage
  {
    const n = HEART.n;
    const heartFrame = frame(HEART.moved([0, 0.05, 0]).at, n);
    const hb = spine.joints[1]!;
    glow(b.part(new THREE.CircleGeometry(0.25, 14), CORE, { at: HEART.moved([0, 0.03, 0]).at, dir: n, axis: "z", bone: hb, group: "heart" }), 1);
    glow(b.part(new THREE.IcosahedronGeometry(0.15, 1), CORE_WHITE, { at: HEART.moved([0, 0.09, 0]).at, bone: hb, group: "heart" }), 1.6);
    b.ring(heartFrame, { count: 8, radius: 0.13 }, (item) => {
      glow(b.spike(item, item, 0.13, 0.034, { color: CORE_HOT, sides: 4, group: "heart" }), 1);
    });
    const ring = b.ring(heartFrame, { count: 14, radius: 0.27 });
    b.sweep(catmull(ring.items, { closed: true }), 0.032, { color: GOLD, sides: 8, group: "heart" });
    const ring2 = b.ring(heartFrame, { count: 14, radius: 0.2 });
    b.sweep(catmull(ring2.items, { closed: true }), 0.016, { color: GOLD_DK, sides: 6, group: "heart" });
    b.ring(heartFrame, { count: 8, radius: 0.28 }, (item) => b.spike(item, item, 0.12, 0.036, { color: GOLD, sides: 4, group: "heart" }));
    const gems: Part[] = [];
    b.ring(heartFrame, { count: 8, radius: 0.3, fromDeg: 22, toDeg: 382 }, (item) => {
      gems.push(b.stick(new THREE.OctahedronGeometry(0.035, 0), CORE_HOT, item, { embed: 0.2, flat: true }));
    });
    for (const gem of gems) glow(gem, 1);
  }

  // pec plates with gold filigree
  {
    for (const s of [1, -1]) {
      const hit = torsoSkin.around([0, 2.4, 0.2]).at(s * 48, 8)!;
      const pl = b.stick(PLATES[1]!, BAS_A, hit, { embed: 0.3, flow: [0, 1, 0], scale: [0.42, 0.13 / PLATE_Y, 0.36], flat: true, spin: s * 8, group: "pec" });
      b.decal(pl, FILIGREE, { at: pl.moved([0, 0.075, 0]), dir: pl.axis, size: [0.26, 0.26], up: [0, 1, 0], group: "pec" });
    }
  }

  // ================================================================ neck
  const neckCore = b.sweep(neck, [0.2, 0.19, 0.2], { color: CORE_RED, sides: 10, group: "neck" });
  glow(neckCore, 1);
  tubeRows(neckCore, neck, [0.25, 0.7], { zone: "neck", width: 0.22, thick: 0.09, palette: UPPER, spacing: 0.3 });
  {
    const ring = b.ring(neck.at(0.5), { count: 12, radius: 0.31 });
    b.sweep(catmull(ring.items, { closed: true }), 0.035, { color: GOLD, sides: 8, group: "torc" });
    b.ring(neck.at(0.5), { count: 7, radius: 0.31, fromDeg: 110, toDeg: 250 }, (item) =>
      b.stick(new THREE.OctahedronGeometry(0.05, 0), GOLD_DK, item, { embed: 0.3, flat: true, group: "torc" }),
    );
  }

  // ================================================================ tail
  const tailR = prof([0.28, 0.23, 0.16, 0.1]);
  const tailCore = b.sweep(tail, tailR, { color: CORE_RED, sides: 10, caps: "round", bands: [[0.6, CORE_RED], [0.85, CORE], [1, CORE_HOT]], group: "tail" });
  glow(tailCore, 1);
  tubeRows(tailCore, tail, [0.06, 0.15, 0.24, 0.33, 0.42, 0.51, 0.6, 0.69], { zone: "tail", width: 0.22, thick: 0.12, palette: LOWER, spacing: 0.09 });
  b.sweep(tail, (t) => tailR(t) + 0.09, { from: 0.74, to: 0.78, color: GOLD, caps: "flat", sides: 10, group: "tail" });
  {
    const tSkin = b.surface(tailCore);
    [
      [-0.5, 0.42],
      [-0.9, 0.38],
      [-1.3, 0.34],
      [-1.7, 0.28],
    ].forEach(([z, h], i) => {
      const hit = tSkin.ray([0, 3, z!], [0, -1, 0]);
      if (!hit) return;
      const r = 0.1 - i * 0.012;
      const col = b.stick(hexGeo(r * 0.75, r), BAS_B, hit.moved([0, 0.04, 0]), { embed: 0.1, scale: [1, h!, 1], flat: true, group: "tailspike" });
      glow(b.part(hexGeo(r * 0.6, r * 0.6), CORE_HOT, { at: col.local([0, h! / 2 + 0.02, 0]), quat: col.quat.clone(), scale: [1, 0.04, 1], group: "tailspike" }), 1.2);
      b.stick(hexGeo(r * 0.85, r * 0.85), CORE, col.moved([0, h! / 2, 0]), { embed: 0.5, scale: [1, 0.05, 1], flat: true, group: "tailspike" });
      b.stick(hexGeo(r * 0.9, r * 1.08), GOLD, col.moved([0, -h! * 0.1, 0]), { embed: 0.5, scale: [1, 0.06, 1], flat: true, group: "tailspike" });
    });
  }

  // ================================================================ limbs
  const armR = prof([0.25, 0.23, 0.21, 0.2, 0.28, 0.27, 0.2]);
  const legR = prof([0.3, 0.29, 0.25, 0.27, 0.2]);
  for (const sd of sides) {
    const { s, L, arm, leg } = sd;
    // ---- arm
    const armCore = b.sweep(arm, armR, {
      sides: 10,
      color: CORE_RED,
      bands: [
        [0.44, CORE_RED],
        [0.56, CORE_HOT],
        [1, CORE],
      ],
      group: `arm${L}`,
    });
    glow(armCore, 1);
    tubeRows(armCore, arm, [0.04, 0.11, 0.18, 0.25, 0.32, 0.39], { zone: `uarm${L}`, width: 0.26, thick: 0.12, palette: UPPER, spacing: 0.07 });
    tubeRows(armCore, arm, [0.59, 0.66, 0.73, 0.8, 0.87], { zone: `farm${L}`, width: 0.28, thick: 0.14, palette: UPPER, spacing: 0.07 });
    goldBand(arm, (t) => armR(t) + 0.13, 0.905, 0.945, `arm${L}`);
    goldBand(arm, (t) => armR(t) + 0.1, 0.46, 0.485, `arm${L}`);
    goldBand(arm, (t) => armR(t) + 0.1, 0.545, 0.57, `arm${L}`);

    // pauldron: dome, gold rim, hex columns, tassels
    {
      const sh = arm.joints[0]!;
      b.part(new THREE.SphereGeometry(1, 10, 7), BAS_B, { at: sh.at, scale: 0.3, bone: sh, flat: true, group: `pauldron${L}` });
      const axis = new THREE.Vector3(s * 0.5, 1, 0.04).normalize();
      const c = V(s * 1.12, 2.58, 0.08);
      b.lathe(
        [
          [0, 0],
          [0.47, 0],
          [0.47, 0.05],
          [0.44, 0.14],
          [0.22, 0.21],
          [0, 0.22],
        ],
        { at: c, axis, segments: 10, smoothing: 1, color: BAS_B, bone: sh, group: `pauldron${L}` },
      );
      const c2 = c.clone().addScaledVector(axis, 0.1);
      const dome = b.lathe(
        [
          [0, 0],
          [0.36, 0],
          [0.36, 0.05],
          [0.31, 0.2],
          [0.17, 0.31],
          [0, 0.34],
        ],
        { at: c2, axis, segments: 10, smoothing: 1, color: BAS_A, bone: sh, group: `pauldron${L}` },
      );
      const rim = b.ring(frame(c.clone().addScaledVector(axis, 0.035), axis), { count: 16, radius: 0.48 });
      b.sweep(catmull(rim.items, { closed: true }), 0.032, { color: GOLD, sides: 8, bone: sh, group: `pauldron${L}` });
      const rim2 = b.ring(frame(c2.clone().addScaledVector(axis, 0.03), axis), { count: 14, radius: 0.37 });
      b.sweep(catmull(rim2.items, { closed: true }), 0.022, { color: GOLD_DK, sides: 6, bone: sh, group: `pauldron${L}` });
      const dSkin = b.surface(dome);
      b.decal(dome, FILIGREE, { at: c2.clone().addScaledVector(axis, 0.26).add(V(s * 0.1, 0.0, 0.3)), dir: [s * 0.45, 0.5, 0.75], size: [0.3, 0.3], segments: 14, bone: sh, group: `pauldron${L}` });
      const cols: [number, number, number, number][] = [
        [s * 90 - s * 20, 72, 0.6, 0.13],
        [s * 90 + s * 140, 68, 0.44, 0.11],
        [s * 90 + s * 70, 64, 0.34, 0.1],
        [s * 90 + s * 190, 60, 0.28, 0.085],
      ];
      for (const [az, el, h, r] of cols) {
        const hit = dSkin.around(c2).at(az, el)!;
        const col = b.stick(hexGeo(r * 0.82, r), BAS_B, hit, { embed: 0.15, scale: [1, h, 1], flat: true, bone: sh, group: `pauldron${L}` });
        const top = col.moved([0, h / 2, 0]);
        b.stick(hexGeo(r * 0.8, r * 0.8), CORE, top, { embed: 0.5, scale: [1, 0.05, 1], flat: true, bone: sh, group: `pauldron${L}` });
        glow(b.part(hexGeo(r * 0.55, r * 0.55), CORE_HOT, { at: col.local([0, h / 2 + 0.03, 0]), quat: col.quat.clone(), scale: [1, 0.04, 1], bone: sh, group: `pauldron${L}` }), 1.3);
        b.stick(hexGeo(r * 0.98, r * 1.1), GOLD, col.moved([0, -h * 0.1, 0]), { embed: 0.5, scale: [1, 0.06, 1], flat: true, bone: sh, group: `pauldron${L}` });
      }
      for (const hit of dSkin.scatter(7, { rng: rng(70 + s), minDist: 0.2, filter: (h) => h.n.y > 0.2 })) {
        b.stick(PLATES[Math.floor(R() * 6)]!, BAS_C, hit, { embed: 0.3, flow: axis, scale: [0.2, 0.07 / PLATE_Y, 0.17], flat: true, spin: R() * 60, bone: sh, group: `pauldron${L}` });
      }
      const tf = rim.items.filter((it) => it.at.z > c.z - 0.1 && it.at.y < c.y + 0.1).map((it) => frame(it.at, [0, 1, 0]));
      b.cards(tf, tassel, { size: [0.09, 0.4], lean: 180, flow: [0, 0, 1], vary: 0.15, rng: rng(9 + s), bone: sh });
    }

    // elbow spike + gold knob
    {
      const ep = arm.at(0.52);
      const hit = b.surface(armCore).around(ep.at).at(s * 90, 0)!;
      b.stick(hexGeo(0.02, 0.1), BAS_B, hit, { embed: 0.1, scale: [1, 0.34, 1], flat: true, group: `uarm${L}` });
      b.stick(hexGeo(0.11, 0.11), GOLD, hit.moved([0, 0.03, 0]), { embed: 0.3, scale: [1, 0.05, 1], flat: true, group: `uarm${L}` });
      const eSkin = b.surface(armCore);
      const flameHits = [-45, 0, 45].flatMap((k) => {
        const h = eSkin.around(ep.at).at(s * 90 + k, 20);
        return h ? [h] : [];
      });
      glow(b.cards(flameHits, FLAME, { size: [0.13, 0.4], lean: 25, flow: [0, 0.5, -1], bend: 20, cross: true, vary: 0.3, spin: 15, rng: rng(300 + s) }), 1);
    }

    // big slabs over the small plates
    {
      const aSkin = b.surface(armCore);
      for (const [t, w, h] of [
        [0.2, 0.34, 0.36],
        [0.73, 0.38, 0.4],
      ] as number[][]) {
        const cp = arm.at(t!);
        const hit = aSkin.ray([s * 4, cp.at.y, cp.at.z], [-s, 0, 0]);
        if (!hit) continue;
        const slab = b.stick(PLATES[1]!, BAS_A, hit.moved([0, 0.05, 0]), { embed: 0.3, flow: cp.tangent, scale: [w!, 0.15 / PLATE_Y, h!], flat: true, group: `arm${L}` });
        b.decal(slab, FILIGREE, { at: slab.moved([0, 0.085, 0]), dir: slab.axis, size: [0.22, 0.22], up: cp.tangent.clone().negate(), group: `arm${L}` });
      }
    }

    // ---- hand: palm, fingers, thumb, claws
    const d = sd.W.clone().sub(sd.E).normalize();
    const palm = b.frustumBox(
      sd.W.clone().addScaledVector(d, -0.04),
      sd.W.clone().addScaledVector(d, 0.36),
      [0.4, 0.3],
      [0.36, 0.22],
      { color: BAS_B, bone: arm.tip!, group: `hand${L}` },
    );
    const palmSkin = b.surface(palm);
    const palmC = sd.W.clone().addScaledVector(d, 0.16);
    for (const [az, el, ds, sc] of [
      [s * 90, 5, 0.1, [0.3, 0.1, 0.26]],
      [s * 90, 5, 0.27, [0.26, 0.1, 0.2]],
      [0, 20, 0.1, [0.34, 0.1, 0.24]],
      [180, 10, 0.1, [0.34, 0.1, 0.24]],
    ] as [number, number, number, number[]][]) {
      const c = palmC.clone().addScaledVector(d, ds - 0.06);
      const hit = palmSkin.around(c).at(az, el)!;
      const pl = b.stick(PLATES[Math.floor(R() * 6)]!, BAS_A, hit, { embed: 0.3, flow: d, scale: [sc[0]!, sc[1]! / PLATE_Y, sc[2]!], flat: true, group: `hand${L}` });
      (plateParts[`hand${L}`] ??= []).push(pl);
    }
    for (const fc of sd.fingers) {
      const fs = b.sweep(fc, [0.062, 0.052, 0.045, 0.036], { color: BAS_C, sides: 6, caps: "round", group: `hand${L}` });
      const fSkin = b.surface(fs);
      const kn = fSkin.around(fc.at(0.25).at).at(s * 90, 10);
      if (kn) b.stick(hexGeo(0.07, 0.085), BAS_A, kn, { embed: 0.25, scale: [1, 0.07, 1], flat: true, group: `hand${L}` });
      const fr = fc.at(0.62);
      b.sweep(fc, (t) => 0.06 - 0.024 * t + 0.014, { from: 0.28, to: 0.33, color: GOLD, sides: 6, caps: "flat", group: `hand${L}` });
      const tipC = fc.at(1);
      b.spike(tipC, tipC, 0.13, 0.034, { color: OBSIDIAN, sides: 5, group: `hand${L}` });
      void fr;
      glow(b.part(new THREE.IcosahedronGeometry(0.02, 0), CORE_HOT, { at: tipC.at.clone().addScaledVector(tipC.axis, 0.14), bone: tipC.bone ?? undefined, group: `hand${L}` }), 1);
    }
    const ts = b.sweep(sd.thumb, [0.075, 0.062, 0.05], { color: BAS_C, sides: 6, group: `hand${L}` });
    void ts;
    b.spike(sd.thumb.at(1), sd.thumb.at(1), 0.12, 0.04, { color: OBSIDIAN, sides: 5, group: `hand${L}` });

    // ---- leg
    const legCore = b.sweep(leg, legR, {
      sides: 10,
      color: CORE_RED,
      bands: [
        [0.44, CORE_RED],
        [0.56, CORE_HOT],
        [1, CORE_RED],
      ],
      group: `leg${L}`,
    });
    glow(legCore, 1);
    tubeRows(legCore, leg, [0.05, 0.12, 0.19, 0.26, 0.33, 0.4], { zone: `thigh${L}`, width: 0.27, thick: 0.13, palette: LOWER, spacing: 0.07 });
    tubeRows(legCore, leg, [0.6, 0.67, 0.74, 0.81, 0.88], { zone: `shin${L}`, width: 0.25, thick: 0.12, palette: LOWER, spacing: 0.07 });
    goldBand(leg, (t) => legR(t) + 0.11, 0.925, 0.955, `leg${L}`);
    goldBand(leg, (t) => legR(t) + 0.11, 0.05, 0.08, `leg${L}`);
    {
      const kp = leg.at(0.5);
      const khit = b.surface(legCore).ray([kp.at.x, kp.at.y, 3], [0, 0, -1])!;
      const kpl = b.stick(PLATES[0]!, BAS_A, khit, { embed: 0.3, flow: [0, 1, 0], scale: [0.36, 0.15 / PLATE_Y, 0.34], flat: true, group: `knee${L}` });
      b.decal(kpl, FILIGREE, { at: kpl.moved([0, 0.08, 0]), dir: kpl.axis, size: [0.24, 0.24], up: [0, 1, 0], group: `knee${L}` });
      const kring = b.ring(kpl, { count: 10, radius: 0.22 });
      b.sweep(catmull(kring.items, { closed: true }), 0.02, { color: GOLD, sides: 6, group: `knee${L}` });
    }

    // hip ball
    {
      const hj = leg.joints[0]!;
      const ball = b.part(new THREE.SphereGeometry(1, 10, 7), BAS_C, { at: hj.at, scale: 0.34, bone: hj, flat: true, group: `hip${L}` });
      for (const hit of b.surface(ball).scatter(9, { rng: rng(400 + s), minDist: 0.17, filter: (h) => h.n.y > -0.2 })) {
        b.stick(PLATES[Math.floor(R() * 6)]!, BAS_D, hit, { embed: 0.3, flow: [0, 1, 0], scale: [0.2, 0.08 / PLATE_Y, 0.18], flat: true, spin: R() * 60, bone: hj, group: `hip${L}` });
      }
    }

    // thigh and shin slabs
    {
      const lSkin = b.surface(legCore);
      for (const [t, w, h] of [
        [0.2, 0.34, 0.38],
        [0.76, 0.3, 0.42],
      ] as number[][]) {
        const cp = leg.at(t!);
        const hit = lSkin.ray([cp.at.x, cp.at.y, 4], [0, 0, -1]);
        if (!hit) continue;
        const slab = b.stick(PLATES[3]!, BAS_B, hit.moved([0, 0.05, 0]), { embed: 0.3, flow: cp.tangent, scale: [w!, 0.15 / PLATE_Y, h!], flat: true, group: `leg${L}` });
        b.decal(slab, FILIGREE, { at: slab.moved([0, 0.085, 0]), dir: slab.axis, size: [0.2, 0.2], up: cp.tangent.clone().negate(), group: `leg${L}` });
      }
    }

    // ---- foot
    const foot = b.frustumBox([s * 0.5, 0.15, -0.22], [s * 0.5, 0.15, 0.4], [0.5, 0.3], [0.46, 0.28], {
      color: BAS_D,
      bone: leg.tip!,
      group: `foot${L}`,
    });
    const fskin = b.surface(foot);
    for (const [x, z, w, h] of [
      [0, -0.1, 0.36, 0.26],
      [0.02, 0.14, 0.34, 0.26],
    ] as number[][]) {
      const hit = fskin.ray([s * 0.5 + x, 1, z], [0, -1, 0])!;
      b.stick(PLATES[Math.floor(R() * 6)]!, BAS_B, hit, { embed: 0.3, flow: [0, 0, 1], scale: [w!, 0.1 / PLATE_Y, h!], flat: true, group: `foot${L}` });
    }
    for (const sx of [1, -1]) {
      const hit = fskin.ray([s * 0.5 + sx * 2, 0.17, 0.05], [-sx, 0, 0])!;
      b.stick(PLATES[Math.floor(R() * 6)]!, BAS_C, hit, { embed: 0.3, flow: [0, 0, 1], scale: [0.28, 0.08 / PLATE_Y, 0.2], flat: true, group: `foot${L}` });
    }
    sd.toes.forEach((tc) => {
      b.sweep(tc, [0.1, 0.09, 0.075], { color: BAS_C, sides: 8, caps: "round", group: `foot${L}` });
      const tip = tc.at(1);
      b.spike(tip, tip, 0.13, 0.05, { color: OBSIDIAN, sides: 5, group: `foot${L}` });
      b.sweep(tc, (t) => 0.1 - 0.025 * t + 0.014, { from: 0.4, to: 0.48, color: GOLD, sides: 8, caps: "flat", group: `foot${L}` });
    });
  }

  // ================================================================ head
  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), BAS_A, { at: hp(0.2, 0.1), scale: [0.34 * K, 0.3 * K, 0.36 * K], bone: head, flat: true, group: "head" });
  const faceC = hp(0.5, 0.06);
  const face = glow(b.part(new THREE.SphereGeometry(1, 12, 8), CORE_RED, { at: faceC, scale: [0.25 * K, 0.2 * K, 0.17 * K], bone: head, flat: true, group: "face" }), 1);
  const fSkin = b.surface(face);
  for (const s of [1, -1]) {
    const hit = fSkin.around(faceC).at(s * 28, 9)!;
    glow(b.decal(face, EYE, { at: hit, dir: [s * 0.3, 0.1, 1], size: [0.24 * K, 0.105 * K], mirror: s > 0, roll: s * -4, segments: 10, group: "eye" }), 1.3);
  }
  // nose ridge, angry brow plates, cheek plates, muzzle
  b.frustumBox(hp(0.5, 0.22), hp(0.77, -0.02), [0.075 * K, 0.09 * K], [0.06 * K, 0.07 * K], { color: BAS_B, bone: head, group: "head" });
  for (const s of [1, -1]) {
    b.part(PLATES[3]!, BAS_B, { at: hp(0.56, 0.24, s * 0.15), rotation: [-8, 0, s * 20], scale: [0.4 * K, 0.1 * K / PLATE_Y, 0.34 * K], bone: head, flat: true, group: "head" });
    const cheek = b.part(PLATES[0]!, BAS_C, { at: hp(0.46, -0.07, s * 0.26), rotation: [0, s * 20, s * -22], scale: [0.26 * K, 0.1 * K / PLATE_Y, 0.3 * K], bone: head, flat: true, group: "head" });
    b.decal(cheek, FILIGREE, { at: cheek.moved([0, 0.06 * K, 0]), dir: cheek.axis, size: [0.13 * K, 0.13 * K], up: [0, 1, 0], bone: head, group: "head" });
    b.spike(hp(0.3, -0.06, s * 0.36), [s * 0.7, -0.2, -0.55], 0.2 * K, 0.05 * K, { color: BAS_D, sides: 6, bone: head, group: "head" });
    b.spike(hp(0.62, 0.3, s * 0.25), [s * 0.25, 0.7, 0.55], 0.17 * K, 0.04 * K, { color: OBSIDIAN, sides: 5, bone: head, group: "head" });
  }
  b.frustumBox(hp(0.4, -0.05), hp(0.76, -0.09), [0.46 * K, 0.15 * K], [0.36 * K, 0.12 * K], { color: BAS_A, bone: head, group: "head" });
  for (const s of [1, -1]) {
    glow(b.part(new THREE.SphereGeometry(0.02 * K, 5, 4), CORE, { at: hp(0.765, -0.05, s * 0.07), bone: head, group: "head" }), 1);
    for (let i = 0; i < 3; i++) {
      const big = i === 0;
      b.spike(hp(0.72 - i * 0.1, -0.15, s * (0.1 + i * 0.045)), [0, -1, 0.15], (big ? 0.14 : 0.085) * K, (big ? 0.032 : 0.022) * K, { color: IVORY, sides: 5, bone: head, group: "teeth" });
    }
  }
  // lower jaw
  b.frustumBox(jl(0.03, -0.02), jl(0.7, -0.045), [0.52 * K, 0.17 * K], [0.38 * K, 0.15 * K], { color: BAS_B, bone: jaw, group: "jaw" });
  glow(b.frustumBox(jl(0.1, 0.05), jl(0.7, 0.055), [0.4 * K, 0.03], [0.28 * K, 0.03], { color: CORE_RED, bone: jaw, group: "jaw" }), 1);
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const big = i === 3;
      b.spike(jl(0.2 + i * 0.13, 0.065, s * (0.19 - i * 0.03)), [0, 1, 0.1], (big ? 0.13 : 0.075) * K, (big ? 0.034 : 0.022) * K, { color: IVORY, sides: 5, bone: jaw, group: "teeth" });
    }
    b.spike(jl(0.42, -0.1, s * 0.24), [s * 0.5, -0.3, 0.6], 0.16 * K, 0.045 * K, { color: BAS_D, sides: 6, bone: jaw, group: "jaw" });
  }
  // chin drip
  glow(
    b.lathe(
      [
        [0, 0],
        [0.028, 0.012],
        [0.04, 0.05],
        [0.03, 0.09],
        [0.012, 0.14],
        [0, 0.17],
      ],
      { at: jl(0.72, -0.2), color: CORE_HOT, segments: 6, bone: jaw },
    ),
    1,
  );
  // horns
  for (const s of [1, -1]) {
    const path = bezier(hp(0.16, 0.24, s * 0.26), hp(0.08, 0.36, s * 0.62), hp(-0.1, 0.5, s * 0.68), hp(-0.3, 0.74, s * 0.42));
    const hr = (t: number) => (0.085 - 0.07 * t) * K;
    b.sweep(path, hr, { from: 0, to: 0.78, bone: head, color: BAS_B, sides: 6, caps: "flat", group: "horn" });
    glow(b.sweep(path, hr, { from: 0.76, to: 1, bone: head, color: CORE_HOT, sides: 6, caps: "point", group: "horn" }), 1);
    for (const [a, c] of [
      [0.04, 0.1],
      [0.3, 0.355],
      [0.52, 0.565],
    ] as number[][])
      b.sweep(path, (t) => hr(t) + 0.016, { from: a, to: c, bone: head, color: GOLD, sides: 6, caps: "flat", group: "horn" });
    const p2 = bezier(hp(0.4, 0.3, s * 0.16), hp(0.5, 0.42, s * 0.2), hp(0.62, 0.52, s * 0.22));
    b.sweep(p2, [0.05 * K, 0.01], { bone: head, color: BAS_D, sides: 5, caps: "point", group: "horn" });
  }
  // flame crest and skull plates
  {
    const skin = b.surface(skull);
    const crown = [-70, -35, 0, 35, 70].flatMap((az) => [skin.around(skull.at).at(180 + az * 0.9, 62)!, skin.around(skull.at).at(180 + az * 0.9, 38)!]);
    glow(b.cards(crown, FLAME, { size: [0.17 * K, 0.52 * K], lean: 22, flow: [0, 0.3, -1], bend: 24, cross: true, vary: 0.35, spin: 12, rng: rng(21), bone: head }), 1);
    for (const hit of skin.scatter(16, { rng: rng(31), minDist: 0.11 * K, filter: (h) => h.n.y > 0.1 && h.n.z < 0.7 && h.n.z > -0.9 })) {
      b.stick(PLATES[Math.floor(R() * 6)]!, BAS_B, hit, { embed: 0.3, flow: [0, 0, 1], scale: [0.17 * K, 0.07 * K / PLATE_Y, 0.15 * K], flat: true, spin: R() * 40, bone: head, group: "head" });
    }
  }

  // ================================================================ halo
  {
    const hf = frame([0, 3.25, -0.6], [0, 0, 1]);
    const outer = b.ring(hf, { count: 28, radius: 0.72 });
    b.sweep(catmull(outer.items, { closed: true }), 0.024, { color: GOLD, sides: 6, bone: spine3, group: "halo" });
    const inner = b.ring(hf, { count: 24, radius: 0.6 });
    glow(b.sweep(catmull(inner.items, { closed: true }), 0.012, { color: CORE_HOT, sides: 4, bone: spine3, group: "halo" }), 1);
    const ticks: Part[] = [];
    b.ring(hf, { count: 12, radius: 0.72 }, (item) => {
      ticks.push(b.stick(new THREE.OctahedronGeometry(0.05, 0), CORE, item, { embed: 0.2, flat: true, bone: spine3, group: "halo" }));
      b.stick(new THREE.OctahedronGeometry(0.03, 0), GOLD, item.moved([0, 0.06, 0]), { embed: 0.2, flat: true, bone: spine3, group: "halo" });
    });
    for (const t of ticks) glow(t, 1);
  }

  // ================================================================ back columns, flames
  {
    const specs: [number, number, number, number, number][] = [
      // x, y, height, radius, lean (x)
      [0, 2.55, 0.95, 0.15, 0],
      [0.32, 2.4, 0.78, 0.13, 0.5],
      [-0.32, 2.4, 0.78, 0.13, -0.5],
      [0.58, 2.28, 0.58, 0.12, 0.9],
      [-0.58, 2.28, 0.58, 0.12, -0.9],
      [0.2, 2.12, 0.5, 0.11, 0.3],
      [-0.2, 2.12, 0.5, 0.11, -0.3],
    ];
    const fr: ReturnType<typeof frame>[] = [];
    for (const [x, y, h, r, lean] of specs) {
      const hit = torsoSkin.ray([x, y, -3], [0, 0, 1])!;
      const f = frame(hit.at, [lean * 0.4, 0.9, -0.55]);
      const col = b.stick(hexGeo(r * 0.8, r), BAS_B, f, { embed: 0.1, scale: [1, h, 1], flat: true, bone: spine.joints[2]!, group: "backcol" });
      const top = col.moved([0, h / 2, 0]);
      b.stick(hexGeo(r * 0.85, r * 0.85), CORE, top, { embed: 0.5, scale: [1, 0.05, 1], flat: true, bone: spine.joints[2]!, group: "backcol" });
      glow(b.part(hexGeo(r * 0.55, r * 0.55), CORE_HOT, { at: col.local([0, h / 2 + 0.03, 0]), quat: col.quat.clone(), scale: [1, 0.04, 1], bone: spine.joints[2]!, group: "backcol" }), 1.3);
      b.stick(hexGeo(r * 0.9, r * 1.08), GOLD, col.moved([0, -h * 0.12, 0]), { embed: 0.5, scale: [1, 0.07, 1], flat: true, bone: spine.joints[2]!, group: "backcol" });
      b.stick(hexGeo(r * 0.84, r * 1.0), GOLD_DK, col.moved([0, h * 0.18, 0]), { embed: 0.5, scale: [1, 0.04, 1], flat: true, bone: spine.joints[2]!, group: "backcol" });
      fr.push(frame(col.local([0, h / 2 + 0.05, 0]), [0, 1, 0]));
    }
    glow(b.cards(fr, FLAME, { size: [0.2, 0.6], lean: 12, flow: [0, 0.2, -1], bend: 26, cross: true, vary: 0.3, spin: 15, rng: rng(41), bone: spine.joints[2]! }), 1);
  }

  // ================================================================ cracks, tail flame
  const allPlates = (zones: string[]) => zones.flatMap((z) => plateParts[z] ?? []);
  const crackSets: [string[], number, number][] = [
    [["torso", "neck"], 60, 0.32],
    [["uarmL", "farmL"], 22, 0.3],
    [["uarmR", "farmR"], 22, 0.3],
    [["thighL", "shinL"], 16, 0.3],
    [["thighR", "shinR"], 16, 0.3],
    [["tail"], 12, 0.3],
  ];
  crackSets.forEach(([zones, n, d], k) => {
    const pl = allPlates(zones);
    if (!pl.length) return;
    const hits = b.surface(pl).scatter(n, { rng: rng(100 + k), minDist: d, filter: (h) => Math.abs(h.n.y) < 0.95 || zones[0] === "torso" });
    glow(b.cards(hits, CRACKS, { size: [0.2, 0.14], lean: 90, flow: [0, -1, 0], vary: 0.3, spin: 180, rng: rng(200 + k) }), 1);
  });
  {
    const tp = tail.at(1).at;
    glow(b.part(new THREE.IcosahedronGeometry(0.14, 1), CORE_HOT, { at: tp.clone().add(V(0, 0.02, -0.12)), bone: tail.tip!, group: "tail" }), 1.2);
    const fr = [-1, 0, 1, 2, -2].map((i) => frame(tp.clone().add(V(i * 0.07, 0.05, -0.1 - Math.abs(i) * 0.03)), [i * 0.15, 1, -0.2]));
    glow(b.cards(fr, FLAME, { size: [0.2, 0.55], lean: 10, flow: [0, 0.3, -1], bend: 20, cross: true, vary: 0.3, spin: 15, rng: rng(51), bone: tail.tip! }), 1);
  }

  // ================================================================ shards, embers, drips
  {
    const shardBone = spine3;
    const shards: [number, number, number, number, number][] = [
      [1.5, 3.1, -0.5, 0.9, 0.25],
      [-1.55, 3.0, -0.4, -0.9, 0.3],
      [1.1, 3.55, -0.9, 0.5, 0.22],
      [-1.15, 3.5, -0.8, -0.5, 0.2],
      [0.0, 3.75, -0.7, 0.0, 0.18],
      [1.85, 2.6, -0.65, 1.2, 0.2],
      [-1.8, 2.55, -0.7, -1.2, 0.2],
    ];
    for (const [x, y, z, lean, sz] of shards) {
      const axis = V(lean * 0.3, 1, -0.2).normalize();
      b.lathe(
        [
          [0, 0],
          [sz * 0.34, 0],
          [0, sz],
        ],
        { at: [x, y, z], axis, segments: 6, color: BAS_B, bone: shardBone, group: "shard" },
      );
      glow(
        b.lathe(
          [
            [0, 0],
            [sz * 0.34, 0],
            [0, -sz * 0.7],
          ],
          { at: [x, y, z], axis, segments: 6, color: CORE_HOT, bone: shardBone, group: "shard" },
        ),
        1,
      );
    }
    const er = rng(61);
    const geos: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 46; i++) {
      const a = er() * Math.PI * 2;
      const rr = 0.8 + er() * 1.1;
      const x = Math.cos(a) * rr * 0.95;
      const z = Math.sin(a) * rr * 0.7 - 0.1;
      const y = 0.6 + er() * 3.1;
      const sz = 0.014 + er() * 0.022;
      geos.push(new THREE.OctahedronGeometry(sz, 0).translate(x, y, z));
    }
    glow(b.part(mergeGeometries(geos), CORE_HOT, { bone: hips, at: [0, 0, 0], flat: true, group: "embers" }), 1.2);
    const geos2: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 14; i++) {
      const a = er() * Math.PI * 2;
      const rr = 0.8 + er() * 1.0;
      geos2.push(new THREE.OctahedronGeometry(0.012 + er() * 0.012, 0).translate(Math.cos(a) * rr, 1 + er() * 2.5, Math.sin(a) * rr * 0.7));
    }
    glow(b.part(mergeGeometries(geos2), CORE_WHITE, { bone: hips, at: [0, 0, 0], flat: true, group: "embers" }), 1.2);
    // drips under fingers
    for (const sd of sides) {
      for (const fc of [sd.fingers[1]!, sd.fingers[3]!]) {
        const tip = fc.at(1).at;
        glow(
          b.lathe(
            [
              [0, 0],
              [0.022, 0.01],
              [0.032, 0.04],
              [0.024, 0.075],
              [0.01, 0.11],
              [0, 0.14],
            ],
            { at: tip.clone().add(V(0, -0.34, 0)), color: CORE_HOT, segments: 6, bone: fc.tip!, group: "drip" },
          ),
          1,
        );
      }
    }
  }

  // jaw rest pose: slightly open
  b.pose(jaw, { axis: [1, 0, 0], deg: 16 });
  return b.root;
}
