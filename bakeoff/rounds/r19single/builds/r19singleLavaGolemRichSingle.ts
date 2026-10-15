// Cinderback: a lava golem of basalt plates and molten seams, in a Genshin-Impact manner: cel-shaded stone with a
// hue-shifted shadow tone, ornate gold filigree and tassels, and Pyro-orange elemental glow in every seam, the
// sternum core, the eyes and the mouth.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { offset, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { cells, mottle, noise, paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "Cinderback Lava Golem",
  description:
    "A 3 m lava golem built of hexagonal basalt plates and columns, with molten seams, a gold-framed ember core, filigree trim and tassels.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type P3 = number[] | THREE.Vector3;
type Col = string | Paint;

// ---------------------------------------------------------------------------------------------------------------
// Palette: cel-shaded stone, gold, and flat glowing lava colours.
const ROCK = cel(mottle("#5b5880", "#4c4971", { size: 0.3, seed: 3 }));
const ROCK_L = cel(mottle("#7a77a0", "#67648c", { size: 0.25, seed: 5 }));
const ROCK_D = cel(mottle("#3e3b5e", "#312e50", { size: 0.3, seed: 8 }));
const OBS = cel("#2b2644", "#1b1730");
const GOLD = cel("#ffd35a", "#d38b24");
const GOLD_D = cel("#e2a73a", "#a85f1c");
const PUMICE = cel("#f2e3cf", "#cba491");

const LAVA = "#ff7a1c";
const LAVA2 = "#ffb02e";
const LAVA3 = "#ffe58a";
const HOT = "#ff4a12";

/** Basalt with molten cracks along the borders of a Worley field; the cracks are hottest in the middle. */
const cracked = (base: Paint, size: number, seed: number, w = 0.09) =>
  paint((p) => {
    const c = cells(p, size, seed);
    const e = c.d2 - c.d1;
    if (noise(p, 0.55, seed + 4) < 0.4) return base;
    if (e < w * 0.35) return "#ffe58a";
    if (e < w * 0.7) return "#ff9a2a";
    if (e < w * 1.15) return "#b8401c";
    return base;
  });

const CORE_A = cracked(ROCK_D, 0.34, 11);
const CORE_L = cracked(ROCK_D, 0.28, 17, 0.1);
const CORE_H = cracked(ROCK, 0.2, 31, 0.07);

// ---------------------------------------------------------------------------------------------------------------
// Drawings.
const FILIGREE = svg(
  `<svg viewBox="0 0 100 100">
<g fill="none" stroke="#ffd35a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
<path d="M50 6 L60 20 L50 34 L40 20 Z"/>
<path d="M50 34 L50 94"/>
<path d="M50 56 C68 56 78 44 70 36 C64 30 54 38 60 44"/>
<path d="M50 56 C32 56 22 44 30 36 C36 30 46 38 40 44"/>
<path d="M50 76 C72 76 88 62 82 46 C79 38 70 38 70 46"/>
<path d="M50 76 C28 76 12 62 18 46 C21 38 30 38 30 46"/>
<path d="M50 90 C62 90 70 84 74 78"/>
<path d="M50 90 C38 90 30 84 26 78"/>
</g>
<g fill="#fff0b0"><circle cx="50" cy="20" r="3.4"/><circle cx="70" cy="46" r="2.6"/><circle cx="30" cy="46" r="2.6"/><circle cx="74" cy="78" r="2.4"/><circle cx="26" cy="78" r="2.4"/></g>
</svg>`,
  { size: 384 },
);

const runeTicks = Array.from({ length: 24 }, (_, i) => {
  return `<line x1="50" y1="5" x2="50" y2="${i % 2 ? 9 : 13}" transform="rotate(${i * 15} 50 50)"/>`;
}).join("");
const runeDiamonds = Array.from({ length: 6 }, (_, i) => {
  return `<path d="M50 17 l3.5 4 l-3.5 4 l-3.5 -4 z" transform="rotate(${i * 60 + 30} 50 50)"/>`;
}).join("");
const RUNE = svg(
  `<svg viewBox="0 0 100 100">
<g fill="none" stroke="#ff9a2a" stroke-width="2"><circle cx="50" cy="50" r="46"/><circle cx="50" cy="50" r="22" stroke="#ffd35a"/></g>
<g stroke="#ffb02e" stroke-width="2.2" stroke-linecap="round">${runeTicks}</g>
<g fill="#ffe58a">${runeDiamonds}</g>
</svg>`,
  { size: 512 },
);

const TASSEL = svg(
  `<svg viewBox="0 0 40 120">
<g stroke-linecap="round" fill="none" stroke-width="4.6">
<path d="M20 92 L6 12" stroke="#e0452a"/><path d="M20 92 L13 6" stroke="#ff7a2a"/><path d="M20 92 L20 4" stroke="#ffb02e"/><path d="M20 92 L27 6" stroke="#ff7a2a"/><path d="M20 92 L34 12" stroke="#e0452a"/>
</g>
<circle cx="20" cy="100" r="9" fill="#ffd35a" stroke="#c98a1e" stroke-width="2.4"/>
<rect x="16" y="108" width="8" height="10" rx="3" fill="#ffd35a" stroke="#c98a1e" stroke-width="2"/>
</svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "lavaGolem", paintSize: 2048 });
  const R = rng(7);
  const SIDES = [1, -1] as const;

  const V = (p: P3) => (p instanceof THREE.Vector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2]));
  const rockAt = (): Col => {
    const u = R();
    return u < 0.3 ? ROCK_L : u < 0.75 ? ROCK : ROCK_D;
  };

  // ---- helpers ---------------------------------------------------------------------------------------------
  /** A flat-shaded hexagonal prism, axis along `dir`, centred on `at`. */
  const prism = (bone: Joint, at: P3, dir: P3, rTop: number, rBot: number, h: number, color: Col, extra: PartOptions = {}) =>
    b.part(new THREE.CylinderGeometry(rTop, rBot, h, 6, 1), color, { bone, at, dir, flat: true, ...extra });

  /** A basalt column growing from `from` along `dir`, capped with a gold hex. */
  const column = (bone: Joint, from: P3, dir: P3, len: number, rBot: number, rTop: number, color: Col) => {
    const d = V(dir).normalize();
    const f = V(from);
    prism(bone, f.clone().addScaledVector(d, len / 2), d, rTop, rBot, len, color);
    prism(bone, f.clone().addScaledVector(d, len + 0.01), d, rTop * 1.14, rTop * 1.14, 0.03, GOLD);
  };

  const torus = (bone: Joint, at: P3, dir: P3, radius: number, tube: number, color: Col, segs = 10, extra: PartOptions = {}) =>
    b.part(new THREE.TorusGeometry(radius, tube, 4, segs), color, { bone, at, dir, axis: "z", flat: true, ...extra });

  const lava = (bone: Joint, geo: THREE.BufferGeometry, color: string, at: P3, extra: PartOptions = {}) =>
    glow(b.part(geo, color, { bone, at, flat: true, ...extra }), 1.2);

  const sticker = (bone: Joint, tex: THREE.Texture, at: P3, n: P3, size: number) =>
    b.part(new THREE.PlaneGeometry(size, size), "#ffffff", { bone, at, dir: n, axis: "z", texture: tex });

  const hexOutline = (r: number, rot: number, jitter: number): OutlinePoint[] =>
    Array.from({ length: 6 }, (_, i): [number, number] => {
      const a = rot + (i * Math.PI) / 3;
      const rr = r * (1 + jitter * (R() - 0.5));
      return [Math.cos(a) * rr, Math.sin(a) * rr];
    });

  /** A bevelled hex plate lying on a surface point with outward normal `n`. */
  const plate = (bone: Joint, at: P3, nIn: P3, r: number, th: number, color: Col, rot = R() * 1.0) => {
    const n = V(nIn).normalize();
    const t = new THREE.Vector3(0, 1, 0).cross(n);
    if (t.lengthSq() < 1e-4) t.set(1, 0, 0);
    t.normalize();
    const y = n.clone().cross(t);
    return b.extrude(hexOutline(r, rot, 0.28), {
      at,
      x: t.toArray(),
      y: y.toArray(),
      thickness: th,
      bevel: Math.min(th * 0.3, 0.014),
      color,
      bone,
    });
  };

  type SurfHit = { at: THREE.Vector3; n: THREE.Vector3; bone: Joint | null };

  // ---- skeleton --------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 1.3, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.3, 0],
      [0, 1.55, 0.03],
      [0, 1.78, 0.08],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const spine1 = spine.joints[0];
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 2.2, 0.16], aim: [0, 2.46, 0.26], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 2.46, 0.26], dir: [0, 0.12, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.4, 0.3], aim: [0, 2.37, 0.6], role: "jaw" });

  // ---- torso -----------------------------------------------------------------------------------------------
  const rx = (t: number) => 0.42 - 0.04 * Math.min(t / 0.35, 1) + 0.2 * Math.max(0, (t - 0.35) / 0.65);
  const ry = (t: number) => 0.33 - 0.03 * Math.min(t / 0.35, 1) + 0.12 * Math.max(0, (t - 0.35) / 0.65);
  const torso = b.sweep(spine, (t) => [rx(t), ry(t)], {
    color: CORE_A,
    sides: 10,
    shift: (t): [number, number] => [0, -0.05 - 0.04 * t],
  });
  const skin = b.surface(torso);
  const chestAround = skin.around([0, 1.66, 0.05]);
  const pelvisAround = skin.around([0, 1.3, 0.04]);

  // molten lines on the belly and flanks
  for (const a of [90, 270, 150, 210]) {
    glow(b.sweep(torso.line(a, 0.004).slice(0.03, 0.42), 0.011, { color: LAVA, bone: spine1, sides: 5 }), 1.2);
  }

  // hex plate rows on chest and back
  const tile = (hit: SurfHit, r: number, th: number) => {
    const bone = hit.bone ?? chest;
    plate(bone, offset(hit as never, hit.n, 0.022), hit.n, r, th, rockAt());
    if (R() < 0.35) b.part(new THREE.SphereGeometry(0.017, 5, 4), GOLD, { bone, at: offset(hit as never, hit.n, 0.058) });
  };
  [-24, -4, 16, 36, 56].forEach((el, i) => {
    const azs = i % 2 ? [-60, -36, -12, 12, 36, 60] : [-72, -48, -24, 0, 24, 48, 72];
    for (const base of azs)
      for (const face of [0, 180]) {
        if (face === 0 && Math.abs(base) < 15 && el > -12 && el < 28) continue;
        const hit = chestAround.at(base + face, el);
        if (hit) tile(hit as unknown as SurfHit, el > 45 ? 0.1 : 0.12, 0.05);
      }
  });

  // pelvis tassets
  [
    { el: -20, azs: [-60, -30, 0, 30, 60], r: 0.13 },
    { el: -45, azs: [-45, -15, 15, 45], r: 0.11 },
  ].forEach(({ el, azs, r }) => {
    for (const base of azs)
      for (const face of [0, 180]) {
        const hit = pelvisAround.at(base + face, el);
        if (hit) tile(hit as unknown as SurfHit, r, 0.05);
      }
  });

  // dorsal basalt columns, each over a glowing ring
  const backSpec: Array<[number, number, number, number]> = [
    [180, 56, 0.5, 0.1],
    [180, 38, 0.55, 0.11],
    [180, 20, 0.5, 0.11],
    [180, 2, 0.4, 0.095],
    [155, 48, 0.4, 0.075],
    [205, 48, 0.4, 0.075],
    [150, 26, 0.38, 0.075],
    [210, 26, 0.38, 0.075],
    [150, 6, 0.3, 0.065],
    [210, 6, 0.3, 0.065],
    [180, -18, 0.3, 0.08],
  ];
  for (const [az, el, len, rad] of backSpec) {
    const hit = chestAround.at(az, el);
    if (!hit) continue;
    const bone = hit.bone ?? chest;
    const n = hit.n.clone();
    const d = n.clone().add(new THREE.Vector3(0, 0.55, 0)).normalize();
    glow(prism(bone, offset(hit, n, 0.015), n, rad * 1.3, rad * 1.3, 0.035, LAVA));
    column(bone, hit.at.clone().addScaledVector(n, -0.04), d, len, rad, rad * 0.6, rockAt());
  }

  // sternum core: a gold-framed ember with a rune halo
  const gemHit = chestAround.at(0, 8);
  if (gemHit) {
    const n = gemHit.n.clone();
    const g = offset(gemHit, n, 0.03);
    prism(chest, g, n, 0.17, 0.17, 0.03, ROCK_D);
    torus(chest, g, n, 0.17, 0.035, GOLD, 6);
    torus(chest, offset(gemHit, n, 0.02), n, 0.25, 0.016, GOLD_D, 12);
    lava(chest, new THREE.OctahedronGeometry(0.11), "#ffc94a", offset(gemHit, n, 0.07), { scale: [0.9, 1.35, 0.9] });
    glow(sticker(chest, RUNE, offset(gemHit, n, 0.064), n, 0.62));
  }

  // gold belt, buckle and tassels
  torus(spine1, [0, 1.4, 0.07], [0, 1, 0], 0.44, 0.05, GOLD_D, 16, { scale: [1, 0.8, 1] });
  torus(spine1, [0, 1.33, 0.07], [0, 1, 0], 0.43, 0.025, GOLD, 16, { scale: [1, 0.8, 1] });
  plate(spine1, [0, 1.4, 0.43], [0, 0, 1], 0.15, 0.05, ROCK_D, 0);
  sticker(spine1, FILIGREE, [0, 1.4, 0.462], [0, 0, 1], 0.25);
  b.cards(
    [frame([0, 1.37, 0.46], [0, 1, 0]), frame([0.42, 1.38, 0.2], [0, 1, 0]), frame([-0.42, 1.38, 0.2], [0, 1, 0])],
    TASSEL,
    { size: [0.12, 0.38], lean: 180, flow: [0, 0, 1], cross: true, bone: spine1 },
  );

  // neck column, gold collar, molten ring
  prism(neck, [0, 2.33, 0.2], [0, 0.26, 0.1], 0.2, 0.23, 0.3, ROCK_D);
  torus(neck, [0, 2.34, 0.15], [0, 1, 0.1], 0.22, 0.035, GOLD, 10);
  glow(torus(neck, [0, 2.39, 0.17], [0, 1, 0.1], 0.225, 0.015, LAVA, 10), 1.2);

  // ---- head ------------------------------------------------------------------------------------------------
  const H: P3 = [0, 2.52, 0.26];
  b.extrude(
    [
      [-0.2, -0.1],
      [-0.24, 0.08],
      [-0.12, 0.22],
      [0.1, 0.24],
      [0.26, 0.14],
      [0.3, 0.0],
      [0.28, -0.1],
      [0.1, -0.14],
    ],
    { at: H, x: [0, 0, 1], thickness: 0.46, bevel: 0.03, color: CORE_H, bone: head },
  );
  b.part(new THREE.BoxGeometry(0.5, 0.06, 0.13), ROCK_D, { bone: head, at: [0, 2.635, 0.52], rotation: [20, 0, 0], flat: true });
  b.part(new THREE.BoxGeometry(0.5, 0.02, 0.03), GOLD_D, { bone: head, at: [0, 2.6, 0.585], rotation: [20, 0, 0], flat: true });
  plate(head, [0, 2.71, 0.47], [0, 0.6, 0.8], 0.08, 0.03, GOLD, 0);
  lava(head, new THREE.SphereGeometry(0.028, 6, 4), LAVA3, [0, 2.735, 0.5]);

  const eyeOuter: OutlinePoint[] = [
    [-0.065, -0.02],
    [0.01, -0.05],
    [0.105, 0.04],
    [0.0, 0.03],
  ];
  const eyeInner: OutlinePoint[] = [
    [-0.03, -0.011],
    [0.011, -0.028],
    [0.063, 0.022],
    [0.005, 0.017],
  ];
  for (const s of SIDES) {
    glow(b.extrude(eyeOuter, { at: [s * 0.12, 2.57, 0.55], x: [s, 0, 0], thickness: 0.02, color: LAVA, bone: head }), 1.3);
    glow(b.extrude(eyeInner, { at: [s * 0.12, 2.57, 0.56], x: [s, 0, 0], thickness: 0.014, color: LAVA3, bone: head }), 1.5);
    // horns, tipped in gold
    b.sweep(
      bezier([s * 0.2, 2.68, 0.2], [s * 0.45, 2.72, 0.14], [s * 0.46, 2.92, -0.06]),
      [0.075, 0],
      {
        color: ROCK_L,
        bands: [
          [0.7, ROCK_L],
          [1, GOLD],
        ],
        bone: head,
        sides: 6,
        smooth: false,
        caps: { start: "flat", end: "point" },
      },
    );
    torus(head, [s * 0.255, 2.7, 0.18], [s * 0.4, 0.3, -0.2], 0.065, 0.014, GOLD, 6);
    // cheek columns
    for (const k of [0, 1]) {
      column(head, [s * 0.2, 2.5 + k * 0.05, 0.3 - k * 0.07], [s, 0.1 + k * 0.2, -0.4], 0.2, 0.055, 0.04, k ? ROCK : ROCK_L);
    }
  }

  // lower jaw, teeth, molten mouth
  b.extrude(
    [
      [-0.1, 0.0],
      [0.28, 0.02],
      [0.34, -0.04],
      [0.3, -0.15],
      [0.1, -0.19],
      [-0.08, -0.12],
    ],
    { at: [0, 2.38, 0.26], x: [0, 0, 1], thickness: 0.4, bevel: 0.025, color: ROCK_D, bone: jaw },
  );
  b.part(new THREE.BoxGeometry(0.3, 0.02, 0.2), HOT, { bone: jaw, at: [0, 2.385, 0.42] });
  lava(head, new THREE.BoxGeometry(0.3, 0.02, 0.2), LAVA, [0, 2.395, 0.42]);
  for (let i = -2; i <= 2; i++) {
    b.spike([i * 0.065, 2.385, 0.57], [0, 1, 0.1], 0.075, 0.02, { color: PUMICE, bone: jaw, sides: 5 });
    b.spike([i * 0.065 + 0.03, 2.418, 0.53], [0, -1, 0.05], 0.06, 0.02, { color: PUMICE, bone: head, sides: 5 });
  }
  for (const s of SIDES) {
    b.spike([s * 0.17, 2.33, 0.5], [s * 0.2, 1, 0.3], 0.16, 0.045, { color: GOLD, bone: jaw, sides: 5 });
  }

  // ---- arms, hands, pauldrons, legs ---------------------------------------------------------------------------
  for (const s of SIDES) {
    const k = s > 0 ? "L" : "R";

    // arm
    const S: number[] = [s * 0.86, 2.05, 0.0];
    const E: number[] = [s * 1.18, 1.35, 0.12];
    const W: number[] = [s * 1.3, 0.72, 0.3];
    const arm = b.chain(`arm${k}`, [S, E, W], {
      parent: chest,
      names: [`shoulder${k}`, `elbow${k}`, `wrist${k}`],
      role: "arm",
    });
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const wrist = arm.joints[2];
    b.sweep(arm, [0.27, 0.285, 0.25, 0.24, 0.27, 0.22, 0.2], { color: CORE_A, sides: 9 });

    const ringAt = (bone: Joint, A: number[], B: number[], t: number, rad: number, h: number, color: Col) => {
      const a = V(A);
      const d = V(B).sub(a);
      prism(bone, a.clone().addScaledVector(d, t), d, rad, rad * 1.04, h, color);
    };
    const gapAt = (bone: Joint, A: number[], B: number[], t: number, rad: number) => {
      const a = V(A);
      const d = V(B).sub(a);
      glow(prism(bone, a.clone().addScaledVector(d, t), d, rad * 0.95, rad * 0.95, 0.045, LAVA), 1.2);
    };

    // upper arm and forearm plating
    ringAt(shoulder, S, E, 0.45, 0.33, 0.1, ROCK_L);
    ringAt(shoulder, S, E, 0.66, 0.3, 0.1, ROCK);
    gapAt(shoulder, S, E, 0.555, 0.31);
    for (const t of [0.38, 0.56, 0.74]) ringAt(elbow, E, W, t, 0.29 - (t - 0.38) * 0.1, 0.085, t === 0.56 ? ROCK : ROCK_L);
    gapAt(elbow, E, W, 0.47, 0.28);
    gapAt(elbow, E, W, 0.65, 0.275);
    ringAt(elbow, E, W, 0.84, 0.25, 0.03, GOLD);
    torus(elbow, V(E).lerp(V(W), 0.93), V(W).sub(V(E)), 0.22, 0.03, GOLD, 8);

    // elbow guard and spike
    const eb = new THREE.Vector3(s * 0.6, 0.1, -0.7).normalize();
    plate(elbow, V(E).addScaledVector(eb, 0.23), eb, 0.17, 0.08, ROCK_L);
    b.spike(V(E).addScaledVector(eb, 0.27), eb, 0.32, 0.1, {
      color: ROCK_D,
      bands: [
        [0.7, ROCK_D],
        [1, GOLD],
      ],
      bone: elbow,
      sides: 6,
      smooth: false,
    });

    // pauldron: cracked dome, column cluster, side plates, molten and gold rims
    const domeC = new THREE.Vector3(s * 0.9, 2.17, 0);
    b.part(new THREE.SphereGeometry(0.34, 9, 6), CORE_A, { bone: shoulder, at: domeC, scale: [1, 0.72, 1], flat: true });
    column(shoulder, domeC.clone().add(new THREE.Vector3(0, 0.2, 0)), [0, 1, 0], 0.5, 0.1, 0.07, ROCK_L);
    for (let i = 0; i < 6; i++) {
      const th = (i * Math.PI) / 3 + 0.26;
      const phi = 0.84;
      const dir = new THREE.Vector3(Math.sin(phi) * Math.cos(th) + s * 0.28, Math.cos(phi), Math.sin(phi) * Math.sin(th)).normalize();
      column(shoulder, domeC.clone().addScaledVector(dir, 0.2), dir, 0.28 + R() * 0.14, 0.075, 0.05, i % 2 ? ROCK : ROCK_L);
    }
    glow(torus(shoulder, [s * 0.9, 2.02, 0], [0, 1, 0], 0.27, 0.02, LAVA, 12), 1.2);
    torus(shoulder, [s * 0.9, 1.97, 0], [0, 1, 0], 0.3, 0.028, GOLD, 12);
    [
      { p: [s * 1.2, 2.2, 0], n: [s, 0.5, 0], r: 0.14 },
      { p: [s * 1.24, 2.02, 0.0], n: [s, 0.1, 0.05], r: 0.15 },
      { p: [s * 1.2, 1.84, 0.02], n: [s, -0.2, 0.1], r: 0.13 },
    ].forEach(({ p, n, r }, i) => {
      plate(shoulder, p, n, r, 0.05, i === 1 ? ROCK_L : ROCK);
      b.part(new THREE.SphereGeometry(0.018, 5, 4), GOLD, { bone: shoulder, at: V(p).addScaledVector(V(n).normalize(), 0.05) });
    });
    sticker(shoulder, FILIGREE, [s * 1.296, 2.02, 0.0], [s, 0.1, 0.05], 0.2);
    b.cards([frame([s * 1.18, 1.78, 0.14], [0, 1, 0])], TASSEL, {
      size: [0.1, 0.32],
      lean: 180,
      flow: [0, 0, 1],
      cross: true,
      bone: shoulder,
    });

    // hand: palm, back plate, knuckles
    const palm = b.part(new THREE.BoxGeometry(0.38, 0.3, 0.3), CORE_A, { bone: wrist, at: [s * 1.3, 0.58, 0.33], flat: true });
    plate(wrist, [s * 1.49, 0.6, 0.33], [s, 0, 0], 0.13, 0.05, ROCK_L);
    sticker(wrist, FILIGREE, [s * 1.54, 0.6, 0.33], [s, 0, 0], 0.2);
    for (let i = -2; i <= 1; i++) {
      column(wrist, [s * 1.3 + (i + 0.5) * 0.085, 0.5, 0.48], [0, 0.05, 1], 0.05, 0.05, 0.045, ROCK_L);
    }
    void palm;

    // fingers and thumb (3 joints each) with gold knuckle rings and obsidian claws
    const fingers: Array<{ nm: string; pts: number[][] }> = [-0.13, 0, 0.13].map((d, i) => ({
      nm: `finger${k}${i}`,
      pts: [
        [s * 1.3 + s * d, 0.47, 0.36],
        [s * 1.3 + s * d * 1.15, 0.3, 0.42],
        [s * 1.3 + s * d * 1.3, 0.13, 0.44],
      ],
    }));
    fingers.push({
      nm: `thumb${k}`,
      pts: [
        [s * 1.3 - s * 0.17, 0.56, 0.3],
        [s * 1.3 - s * 0.27, 0.46, 0.4],
        [s * 1.3 - s * 0.3, 0.35, 0.52],
      ],
    });
    for (const { nm, pts } of fingers) {
      const ch = b.chain(nm, pts, { parent: wrist, names: [`${nm}1`, `${nm}2`, `${nm}3`], role: "digit" });
      b.sweep(ch, [0.07, 0.06, 0.045], { color: ROCK_L, sides: 6, smooth: false });
      const d0 = V(pts[1]).sub(V(pts[0])).normalize();
      torus(ch.joints[0], V(pts[0]).addScaledVector(d0, 0.03), d0, 0.07, 0.016, GOLD, 8);
      const d2 = V(pts[2]).sub(V(pts[1])).normalize();
      b.spike(pts[2], V(pts[2]).addScaledVector(d2, 0.11), null, 0.035, { color: OBS, bone: ch.joints[2], sides: 5 });
    }

    // leg
    const hipP: number[] = [s * 0.36, 1.15, 0];
    const kneeP: number[] = [s * 0.4, 0.62, 0.12];
    const ankP: number[] = [s * 0.42, 0.22, 0];
    const leg = b.chain(`leg${k}`, [hipP, kneeP, ankP], {
      parent: hips,
      names: [`hip${k}`, `knee${k}`, `ankle${k}`],
      role: "leg",
    });
    const hipJ = leg.joints[0];
    const kneeJ = leg.joints[1];
    const ankleJ = leg.joints[2];
    b.sweep(leg, [0.31, 0.29, 0.25, 0.22, 0.2, 0.19], { color: CORE_L, sides: 9 });
    ringAt(hipJ, hipP, kneeP, 0.3, 0.38, 0.1, ROCK_L);
    ringAt(hipJ, hipP, kneeP, 0.62, 0.35, 0.1, ROCK);
    gapAt(hipJ, hipP, kneeP, 0.46, 0.36);
    ringAt(kneeJ, kneeP, ankP, 0.35, 0.28, 0.09, ROCK_L);
    ringAt(kneeJ, kneeP, ankP, 0.65, 0.26, 0.09, ROCK);
    gapAt(kneeJ, kneeP, ankP, 0.5, 0.265);
    torus(kneeJ, V(kneeP).lerp(V(ankP), 0.9), [0, 1, 0], 0.23, 0.03, GOLD, 8);
    // knee shield with gold border and a spike
    plate(kneeJ, [s * 0.4, 0.62, 0.38], [0, 0.1, 1], 0.2, 0.09, ROCK_L, 0.3);
    torus(kneeJ, [s * 0.4, 0.62, 0.435], [0, 0.1, 1], 0.2, 0.025, GOLD, 6);
    b.spike([s * 0.4, 0.64, 0.45], [0, 0.2, 1], 0.2, 0.07, { color: ROCK_D, bone: kneeJ, sides: 6, smooth: false });
    sticker(kneeJ, FILIGREE, [s * 0.4, 0.62, 0.438], [0, 0.1, 1], 0.2);
    // thigh outer plate
    plate(hipJ, [s * 0.66, 0.95, 0.04], [s, 0.1, 0], 0.15, 0.05, ROCK_L);
    b.part(new THREE.SphereGeometry(0.018, 5, 4), GOLD, { bone: hipJ, at: [s * 0.7, 0.95, 0.04] });
    // foot: block, top plate, toes with claws
    b.part(new THREE.BoxGeometry(0.5, 0.18, 0.52), ROCK_D, { bone: ankleJ, at: [s * 0.42, 0.09, 0.14], flat: true });
    plate(ankleJ, [s * 0.42, 0.2, 0.13], [0, 1, 0], 0.22, 0.06, ROCK_L, 0.5);
    torus(ankleJ, [s * 0.42, 0.215, 0.13], [0, 1, 0], 0.22, 0.02, GOLD_D, 6);
    glow(prism(ankleJ, [s * 0.42, 0.25, 0], [0, 1, 0], 0.2, 0.2, 0.03, LAVA), 1.2);
    for (let i = 0; i < 3; i++) {
      const x = s * 0.42 + (i - 1) * 0.15;
      const toe = b.chain(
        `toe${k}${i}`,
        [
          [x, 0.1, 0.4],
          [x, 0.08, 0.62],
        ],
        { parent: ankleJ, names: [`toe${k}${i}a`, `toe${k}${i}b`], role: "digit" },
      );
      b.sweep(toe, [0.1, 0.08], { color: ROCK_L, sides: 6, smooth: false });
      b.spike([x, 0.08, 0.64], [0, -0.1, 1], 0.1, 0.05, { color: OBS, bone: toe.joints[1], sides: 5 });
    }
  }

  // ---- floating embers ---------------------------------------------------------------------------------------
  for (let i = 0; i < 18; i++) {
    const size = 0.025 + R() * 0.025;
    lava(
      chest,
      new THREE.OctahedronGeometry(size),
      i % 3 ? LAVA2 : LAVA3,
      [(R() - 0.5) * 3.6, 0.9 + R() * 1.9, -0.6 - R() * 0.7],
      { rotation: [R() * 360, R() * 360, R() * 360] },
    );
  }

  // rest pose: jaw a little open so the molten throat shows
  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  return b.root;
}
