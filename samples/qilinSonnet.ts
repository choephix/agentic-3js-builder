import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { gradient, paint, scales, type Paint } from "../src/paint";
import { bezier, catmull } from "../src/path";
import type { Chain } from "../src/skeleton";
import type { Sweep } from "../src/sweep";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";
import { animeEye, cel, furEdge, INK } from "../kits/toon";

export const meta = {
  name: "Qilin",
  description:
    "Jade-scaled hooved chimera of the mist: dragon head, swept gold antlers, a billowing cloud-flame mane and ox tail, gold filigree and glowing spirit wisps.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

// ---------- palette ----------
const VERM = "#e8403c";
const CORAL = "#ff8a52";
const GOLDHI = "#ffd75e";
const AQUA = "#6df0ff";
const PEARL = "#f3ffff";
const TOOTH = "#fff6e0";
const DARKMOUTH = "#5c1733";
const TONGUE = "#ff7a92";

const jadeScales = (size: number, tone: string[], edge: string) => scales(tone, edge, { size, width: 0.085, seed: 3 });
const TOP_TONE = ["#4be8c6", "#3fdcc0", "#59f0cf"];
const LOW_TONE = ["#1b8f9a", "#1a8794", "#2299a3"];
const toBack = [0, 1.45, 0] as const;
const toBelly = [0, 0.8, 0] as const;
const SCALE = gradient(jadeScales(0.042, TOP_TONE, "#17998a"), jadeScales(0.042, LOW_TONE, "#0f6d7c"), toBack, toBelly);
const SCALE_FINE = gradient(jadeScales(0.027, TOP_TONE, "#17998a"), jadeScales(0.027, LOW_TONE, "#0f6d7c"), [0, 1.95, 0], [0, 1.45, 0]);
const BELLY = scales(["#f7fcf8", "#ecf7f3"], "#c6e2da", { size: 0.042, width: 0.08, seed: 5 });
const BELLY_FINE = scales(["#f7fcf8", "#ecf7f3"], "#c6e2da", { size: 0.027, width: 0.09, seed: 5 });
const LOWLEG = scales(["#fbd366", "#ffe17f", "#f4c04e"], "#c58a2c", { size: 0.032, width: 0.09, seed: 9 });

const BODY = cel(furEdge(SCALE, BELLY, { level: -0.34, teeth: 0.2, period: 0.05, ink: INK, inkWidth: 0.05 }));
const HEAD = cel(furEdge(SCALE_FINE, BELLY_FINE, { level: -0.45, teeth: 0.2, period: 0.03, ink: INK, inkWidth: 0.05 }));
const LEG = cel(
  furEdge(SCALE, LOWLEG, { by: "position", level: 0.5, teeth: 0.05, period: 0.05, along: [1, 0, 1], ink: INK }),
);
const GOLD = cel("#f6bf3a", "#bf7a24");
const CREAM = cel("#fff3d6", "#f1c98f");
const HORN = cel(
  paint((_p, _n, s) => (s[0] < 0.18 ? "#d9962c" : s[0] < 0.6 ? "#f7d98a" : s[0] < 0.85 ? "#fff0c4" : "#ffffff")),
  "#c98a3a",
);
const RED = cel(VERM, "#a8213f");
const JADE_DARK = cel("#14808a", "#0b4f6b");
const HOOF = cel("#f1b43a", "#a3641c");

// ---------- textures ----------
const flameSvg = (outer: string, inner: string, vein: string, stroke: string) =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 100">
      <path d="M40 100 C10 94 0 68 14 48 C22 36 20 22 10 10 C30 10 42 24 40 40 C48 28 56 14 50 0 C72 14 82 44 66 66 C60 78 70 92 40 100 Z" fill="${outer}" stroke="${stroke}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M40 96 C22 90 16 70 26 56 C32 64 38 66 44 60 C52 72 56 86 40 96 Z" fill="${inner}"/>
      <path d="M36 82 C32 74 36 68 40 64" stroke="${vein}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
const tongueSvg = (outer: string, inner: string, vein: string, stroke: string) =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 100">
      <path d="M30 100 C8 82 6 54 24 38 C34 28 34 14 22 4 C46 6 58 24 48 44 C42 56 52 76 38 100 Z" fill="${outer}" stroke="${stroke}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M30 97 C16 80 18 58 30 46 C34 58 40 78 34 97 Z" fill="${inner}"/>
      <path d="M27 72 C26 62 31 55 34 49" stroke="${vein}" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
const FLAME_RED = flameSvg(VERM, "#ffb347", "#fff2a8", INK);
const FLAME_GOLD = flameSvg("#f6bf3a", "#fff0a8", "#ffffff", INK);
const FLAME_CREAM = flameSvg("#fff3d6", "#ffffff", "#ffd98a", "#c98a3a");
const TONGUE_RED = tongueSvg(VERM, "#ffb347", "#fff2a8", INK);
const TONGUE_GOLD = tongueSvg("#f6bf3a", "#fff0a8", "#ffffff", INK);
const WISP_AQUA = tongueSvg(AQUA, PEARL, "#ffffff", "#3fb8e8");

const CLOUD = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 64">
    <path d="M6 54 C-2 40 8 28 20 32 C18 16 36 6 48 16 C60 8 76 18 70 32 C80 42 72 56 60 54 C52 62 38 58 34 54 C26 60 12 60 6 54 Z" fill="#fff6e4" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M22 44 C16 36 26 30 32 36 C36 40 30 46 27 42" stroke="#f0a64a" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M46 30 C42 22 54 18 58 26 C60 32 52 36 50 32" stroke="#f0a64a" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const SWIRL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M52 52 C52 44 62 42 66 48 C72 58 60 68 50 66 C34 62 30 44 40 34 C52 22 74 28 78 44 C80 58 72 70 60 74" fill="none" stroke="#ffd75e" stroke-width="7" stroke-linecap="round"/>
    <path d="M60 74 C52 80 40 80 30 74 C24 70 18 70 14 74" fill="none" stroke="#ffd75e" stroke-width="7" stroke-linecap="round"/>
    <path d="M78 44 C86 40 92 32 90 24" fill="none" stroke="#ffd75e" stroke-width="6" stroke-linecap="round"/>
    <circle cx="52" cy="52" r="5" fill="#ff5a4a"/>
    <circle cx="88" cy="22" r="3" fill="#ffd75e"/>
    <circle cx="14" cy="74" r="3" fill="#ffd75e"/>
  </svg>`,
  { size: 256 },
);

const HS = 1.25; // head scale

export default function build() {
  const b = createBuilder({ name: "qilin", paintSize: 2048 });
  const R = rng(11);

  // ======================= SKELETON =======================
  const hips = b.joint("hips", { at: [0, 1.12, -0.4], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.1, -0.1],
      [0, 1.12, 0.25],
      [0, 1.17, 0.5],
      [0, 1.22, 0.62],
    ]),
    { parent: hips, count: 3, role: "spine" },
  );
  const chestJoint = spine.joints[2];
  const neckPath = catmull([
    [0, 1.24, 0.6],
    [0, 1.45, 0.78],
    [0, 1.66, 0.93],
    [0, 1.8, 1.08],
  ]);
  const neck = b.chain("neck", neckPath, { parent: chestJoint, count: 3, role: "neck" });
  const head = b.joint("head", {
    parent: neck.joints[2],
    at: neckPath.at(1),
    dir: [0, -0.2, 1],
    role: "head",
    group: "head",
  });
  const H = (forward: number, up: number, left: number) =>
    head.local({ forward: forward * HS, up: up * HS, left: left * HS });
  const jaw = b.joint("jaw", { parent: head, at: H(0.1, -0.07, 0), aim: H(0.36, -0.12, 0), role: "jaw", group: "head" });

  const tailPath = catmull([
    [0, 1.18, -0.68],
    [0, 1.26, -1.0],
    [0, 1.26, -1.36],
    [0, 1.1, -1.68],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, count: 5, role: "tail" });

  // ======================= BODY =======================
  const body = b.loft(
    [
      { at: [0, 1.12, -0.82], w: 0.26, h: 0.34 },
      { at: [0, 1.13, -0.58], w: 0.46, h: 0.6 },
      { at: [0, 1.1, -0.2], w: 0.44, h: 0.56 },
      { at: [0, 1.09, 0.2], w: 0.44, h: 0.58 },
      { at: [0, 1.12, 0.5], w: 0.46, h: 0.66 },
      { at: [0, 1.2, 0.72], w: 0.36, h: 0.5 },
    ],
    { bone: [hips, spine], color: BODY, detail: 1.2, name: "body" },
  );
  const bodySkin = b.surface(body);

  const neckTube = b.sweep(neck, [0.24, 0.2, 0.16, 0.125], { color: BODY, name: "neck" });
  const tailTube = b.sweep(tail, [0.1, 0.075, 0.05, 0.035], { color: BODY, name: "tail" });

  // gold back scutes
  b.along(
    body,
    9,
    (at) => b.stick(new THREE.ConeGeometry(0.03, 0.085, 4), GOLD, at, { embed: 0.25, flow: [0, 0, 1] }),
    { from: 0.08, to: 0.62 },
  );

  // ======================= LEGS =======================
  const dressLeg = (chain: Chain, sweep: Sweep, target: [number, number, number], front: boolean) => {
    const tip = chain.tip!;
    for (const k of [1, -1]) {
      b.extrude(
        [
          [-0.065, 0],
          [0.075, 0],
          [0.06, 0.05],
          [0.035, 0.115],
          [-0.04, 0.115],
          [-0.065, 0.06],
        ],
        {
          at: [target[0] + k * 0.04, 0, target[2]],
          x: [0, 0, 1],
          y: [0, 1, 0],
          thickness: 0.065,
          bevel: 0.012,
          smoothing: 1,
          color: HOOF,
          bone: tip,
          name: "hoof",
        },
      );
    }
    // anklet + knee band
    for (const t of [0.66, 0.9]) {
      const cp = chain.at(t);
      b.part(new THREE.TorusGeometry(sweep.at(t).radius + 0.004, 0.01, 5, 10), GOLD, {
        at: cp.at,
        dir: cp.tangent,
        axis: "z",
        bone: cp.bone ?? undefined,
        name: "anklet",
      });
    }
    // dragon fin spur behind knee/hock
    const kt = front ? 0.36 : 0.5;
    const kp = chain.at(kt);
    b.extrude(
      [
        [0, -0.04],
        [0.12, 0.02, "sharp"],
        [0.03, 0.04],
        [0.0, 0.09],
      ],
      {
        at: kp.at,
        x: [0, -0.25, -1],
        y: [0, 1, 0],
        thickness: 0.014,
        bevel: 0.003,
        color: GOLD,
        bone: kp.bone ?? undefined,
        name: "spur",
      },
    );
    // flame tufts at knee/hock and ankle; aqua spirit wisps at the pastern
    for (const [t, dx, tex] of [
      [kt, 0.05, FLAME_RED],
      [kt, -0.05, FLAME_GOLD],
      [0.84, 0.035, FLAME_GOLD],
      [0.84, -0.035, FLAME_RED],
    ] as const) {
      const cp = chain.at(t);
      b.cards([frame([cp.at.x + dx, cp.at.y, cp.at.z - 0.02], [0, 1, 0])], tex, {
        size: [0.11, 0.2],
        lean: 125,
        bend: 20,
        flow: [0, -0.2, -1],
        cross: true,
        bone: cp.bone ?? undefined,
      });
    }
    b.cards([frame([target[0], 0.012, target[2]], [0, 1, 0])], CLOUD, {
      size: [0.5, 0.4],
      lean: 90,
      flow: [1, 0, 0],
      mirror: true,
      bone: tip,
      spin: front ? 12 : -20,
    });
    const wp = chain.at(0.93);
    for (const dx of [0.04, -0.04]) {
      glow(
        b.cards([frame([wp.at.x + dx, wp.at.y + 0.02, wp.at.z], [0, 1, 0])], WISP_AQUA, {
          size: [0.07, 0.22],
          lean: 100,
          bend: 35,
          flow: [dx > 0 ? 1 : -1, -0.2, -0.6],
          bone: wp.bone ?? undefined,
        }),
        1,
      );
    }
  };
  const frontLegs: Sweep[] = [];
  const hindLegs: Sweep[] = [];
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    // front legs
    const shoulder = [s * 0.2, 1.04, 0.5];
    const hoofF: [number, number, number] = [s * 0.2, 0.1, 0.55];
    const fpts = limb(shoulder, hoofF, [0.34, 0.32, 0.26, 0.1], [
      [0, 0, -1],
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const fleg = b.chain(`legF${sd}`, fpts, {
      parent: chestJoint,
      names: [`shoulder${sd}`, `elbow${sd}`, `knee${sd}`, `pasternF${sd}`, `hoofF${sd}`],
      role: "leg",
    });
    const fsweep = b.sweep(fleg, [0.165, 0.115, 0.082, 0.055, 0.047, 0.056], { color: LEG, name: `legF${sd}` });
    frontLegs.push(fsweep);
    dressLeg(fleg, fsweep, hoofF, true);

    // hind legs
    const hip = [s * 0.21, 1.06, -0.55];
    const hoofH: [number, number, number] = [s * 0.21, 0.1, -0.5];
    const hpts = limb(hip, hoofH, [0.36, 0.34, 0.3, 0.12], [
      [0, 0, 1],
      [0, 0, -1],
      [0, 0, 1],
    ]);
    const hleg = b.chain(`legH${sd}`, hpts, {
      parent: hips,
      names: [`hip${sd}`, `stifle${sd}`, `hock${sd}`, `pasternH${sd}`, `hoofH${sd}`],
      role: "leg",
    });
    const hsweep = b.sweep(hleg, [0.19, 0.13, 0.082, 0.055, 0.047, 0.056], { color: LEG, name: `legH${sd}` });
    hindLegs.push(hsweep);
    dressLeg(hleg, hsweep, hoofH, false);
  }

  // ======================= HEAD =======================
  const C = H(0.08, 0, 0);
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), HEAD, {
    bone: head,
    at: C,
    quat: head.quat,
    scale: [0.098 * HS, 0.16 * HS, 0.115 * HS],
    name: "skull",
  });
  const skin = b.surface(skull);

  // muzzle (upper jaw) and lower jaw
  b.sweep([H(0.16, -0.02, 0), H(0.4, -0.065, 0)], (t) => [(0.072 - 0.022 * t) * HS, (0.07 - 0.028 * t) * HS], {
    bone: head,
    color: HEAD,
    sides: 8,
    caps: "round",
    name: "muzzle",
  });
  b.sweep([H(0.1, -0.085, 0), H(0.38, -0.115, 0)], (t) => [(0.052 - 0.014 * t) * HS, (0.03 - 0.008 * t) * HS], {
    bone: jaw,
    color: CREAM,
    sides: 8,
    caps: "round",
    name: "lowerJaw",
  });
  // tongue and mouth lining
  b.capsule(H(0.12, -0.088, 0), H(0.3, -0.1, 0), 0.022, { bone: jaw, color: TONGUE, sides: 6, name: "tongue" });
  b.capsule(H(0.14, -0.06, 0), H(0.34, -0.08, 0), 0.05, { bone: head, color: DARKMOUTH, sides: 6, name: "palate" });
  for (const s of [1, -1]) {
    // nostril bulbs
    b.part(new THREE.SphereGeometry(0.036, 8, 6), JADE_DARK, { bone: head, at: H(0.385, -0.03, s * 0.04), name: "nostril" });
    b.part(new THREE.SphereGeometry(0.014, 6, 4), INK, { bone: head, at: H(0.41, -0.035, s * 0.042), name: "nostrilHole" });
    // fangs and tusks
    b.spike(H(0.31, -0.092, s * 0.04), [0, -1, 0.15], 0.055, 0.012, { bone: head, color: TOOTH, name: "fang" });
    b.spike(H(0.34, -0.1, s * 0.038), [0, 1, 0.1], 0.035, 0.009, { bone: jaw, color: TOOTH, name: "tusk" });
    for (let i = 0; i < 4; i++)
      b.spike(H(0.2 + i * 0.03, -0.085, s * 0.05), [0, -1, 0], 0.016, 0.007, { bone: head, color: TOOTH, name: "tooth" });
  }

  // eyes, brows, whiskers, ears, cheek frills
  const EYE = animeEye({ iris: "#ffb81f", irisLight: "#fff0a0", irisDark: "#c4421a" });
  for (const s of [1, -1]) {
    const hit = skin.around(C).at(s * 52, 8)!;
    b.decal(skin, EYE, { at: hit, size: [0.09, 0.122], mirror: s > 0, name: "eye" });
    const browPts = [24, 44, 66, 88].map((az) => {
      const h = skin.around(C).at(s * az, 34 - az * 0.12)!;
      return h.moved([0, 0.01, 0]).at;
    });
    b.sweep(catmull(browPts), [0.004, 0.016, 0.003], { bone: head, color: GOLD, sides: 5, caps: "point", name: "brow" });
    // long and short whiskers
    const w0 = H(0.36, -0.05, s * 0.05);
    const whisker = bezier(
      w0,
      w0.clone().add(new THREE.Vector3(s * 0.16, 0.08, -0.04)),
      w0.clone().add(new THREE.Vector3(s * 0.4, 0.04, -0.3)),
      w0.clone().add(new THREE.Vector3(s * 0.42, -0.16, -0.56)),
    );
    b.sweep(whisker, [0.011, 0.002], { bone: head, color: GOLD, sides: 5, caps: "round", name: "whisker" });
    b.part(new THREE.SphereGeometry(0.026, 7, 5), AQUA, { bone: head, at: whisker.at(1), name: "whiskerPearl" });
    const w1 = H(0.3, -0.06, s * 0.06);
    b.sweep(
      bezier(
        w1,
        w1.clone().add(new THREE.Vector3(s * 0.1, 0.0, -0.04)),
        w1.clone().add(new THREE.Vector3(s * 0.24, -0.04, -0.2)),
        w1.clone().add(new THREE.Vector3(s * 0.26, -0.2, -0.36)),
      ),
      [0.008, 0.002],
      { bone: head, color: GOLDHI, sides: 5, caps: "round", name: "whisker" },
    );
    // ears (swept fin leaves)
    const earDir: [number, number, number] = [s * 0.65, 0.05, -0.75];
    b.extrude(
      [
        [0, -0.035],
        [0.08, -0.05],
        [0.17, 0.0],
        [0.27, 0.12, "sharp"],
        [0.15, 0.09],
        [0.06, 0.06],
        [0, 0.04],
      ],
      {
        at: H(-0.02, 0.065, s * 0.075),
        x: earDir,
        y: [0, 1, 0],
        thickness: 0.016,
        bevel: 0.004,
        smoothing: 1,
        color: JADE_DARK,
        bone: head,
        name: "ear",
      },
    );
    b.extrude(
      [
        [0.02, -0.018],
        [0.09, -0.028],
        [0.16, 0.005],
        [0.22, 0.09, "sharp"],
        [0.13, 0.06],
        [0.05, 0.035],
      ],
      {
        at: H(-0.02, 0.066, s * 0.077),
        x: earDir,
        y: [0, 1, 0],
        thickness: 0.02,
        smoothing: 1,
        color: CORAL,
        bone: head,
        name: "earInner",
      },
    );
    // cheek frills
    b.extrude(
      [
        [0, 0.02],
        [0.1, 0.07, "sharp"],
        [0.06, 0.02],
        [0.16, 0.0, "sharp"],
        [0.07, -0.02],
        [0.12, -0.07, "sharp"],
        [0, -0.04],
      ],
      {
        at: H(0.03, -0.045, s * 0.085),
        x: [s * 0.5, -0.1, -1],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.003,
        color: RED,
        bone: head,
        name: "cheekFrill",
      },
    );
  }

  // forehead gem on a gold bezel
  const crown = skin.around(C).at(0, 62)!;
  b.stick(new THREE.CylinderGeometry(0.04, 0.047, 0.018, 8), GOLD, crown, { embed: 0.5, name: "gemBezel" });
  glow(b.stick(new THREE.OctahedronGeometry(0.034, 0), AQUA, crown.moved([0, 0.016, 0]), { embed: 0.3, name: "gem" }), 1.4);
  // forelock wisps between the antlers
  b.cards(
    [
      frame(H(-0.01, 0.1, 0.0), [0, 1, 0]),
      frame(H(0.04, 0.11, 0.0), [0, 1, 0.2]),
      frame(H(-0.04, 0.09, 0.03), [0.3, 1, 0]),
      frame(H(-0.04, 0.09, -0.03), [-0.3, 1, 0]),
    ],
    [FLAME_RED, FLAME_GOLD],
    { size: [0.1, 0.22], lean: 50, bend: 30, flow: [0, -0.1, -1], bone: head, rng: R, cross: true },
  );
  // beard
  b.cards(
    [0.14, 0.2, 0.26, 0.32].map((f) => frame(H(f, -0.12, 0), [0, 1, 0])),
    [FLAME_CREAM, FLAME_GOLD],
    { size: [0.08, 0.2], lean: 165, bend: 15, flow: [0, 0, -1], cross: true, bone: jaw, rng: R },
  );

  // ======================= ANTLERS =======================
  const pearls: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    const B = H(0.0, 0.1, s * 0.05);
    const pt = (x: number, y: number, z: number) => B.clone().add(new THREE.Vector3(s * x, y, z));
    const beam = catmull([pt(0, 0, 0), pt(0.05, 0.14, -0.04), pt(0.11, 0.27, -0.14), pt(0.16, 0.38, -0.3), pt(0.17, 0.46, -0.46)]);
    b.sweep(beam, [0.04, 0.008], { bone: head, color: HORN, sides: 6, caps: "point", name: "antler" });
    b.part(new THREE.CylinderGeometry(0.046, 0.06, 0.035, 8), GOLD, { bone: head, at: pt(0, 0.012, 0), name: "antlerCollar" });
    for (const t of [0.2, 0.34]) {
      b.part(new THREE.TorusGeometry(0.036 - t * 0.03, 0.008, 5, 10), GOLD, {
        bone: head,
        at: beam.at(t),
        dir: beam.tangentAt(t),
        axis: "z",
        name: "antlerRing",
      });
    }
    const tine = (t: number, out: [number, number, number], len: number, curl: [number, number, number]) => {
      const p0 = beam.at(t);
      const dir = new THREE.Vector3(s * out[0], out[1], out[2]).normalize();
      const tip = p0.clone().addScaledVector(dir, len).add(new THREE.Vector3(s * curl[0], curl[1], curl[2]));
      const ctrl = p0.clone().addScaledVector(dir, len * 0.6);
      b.sweep(bezier(p0, ctrl, tip), [0.022 * (1 - t * 0.5), 0.005], { bone: head, color: HORN, sides: 6, caps: "point", name: "tine" });
      pearls.push(new THREE.SphereGeometry(0.018, 6, 4).translate(tip.x, tip.y, tip.z));
    };
    tine(0.24, [0.15, 0.3, 1], 0.16, [0, 0.07, 0.03]); // brow tine, forward
    tine(0.44, [1, 0.3, 0.3], 0.15, [0.03, 0.08, 0.02]); // outer tine
    tine(0.62, [0.7, 0.6, 0.6], 0.13, [0.02, 0.08, 0.04]);
    tine(0.8, [0.4, 0.8, -0.2], 0.1, [0.01, 0.07, -0.02]);
    const tp = beam.at(1);
    pearls.push(new THREE.SphereGeometry(0.022, 6, 4).translate(tp.x, tp.y + 0.012, tp.z));
  }
  glow(b.part(mergeGeometries(pearls), AQUA, { bone: head, at: [0, 0, 0], name: "antlerPearls" }), 1.3);

  // ======================= MANE =======================
  const maneBatch = (t0: number, t1: number, n: number, size: [number, number], deg: number, tex: THREE.Texture[]) => {
    const frames = [];
    for (let i = 0; i < n; i++) frames.push(neckTube.at(t0 + ((t1 - t0) * (i + 0.5)) / n, deg));
    b.cards(frames, tex, {
      size,
      lean: 62,
      bend: 35,
      flow: (f) => [Math.abs(f.at.x) < 0.02 ? 0 : Math.sign(f.at.x), -0.25, -0.8],
      vary: 0.25,
      spin: 10,
      rng: R,
      cross: deg === 0,
    });
  };
  const MANES = [FLAME_RED, FLAME_GOLD, FLAME_RED, TONGUE_RED];
  for (const deg of [-45, 0, 45]) {
    maneBatch(0.05, 0.35, 7, [0.2, 0.42], deg, MANES);
    maneBatch(0.35, 0.7, 8, [0.17, 0.36], deg, MANES);
    maneBatch(0.7, 1.0, 7, [0.13, 0.28], deg, [FLAME_RED, FLAME_GOLD, TONGUE_GOLD]);
  }
  for (const deg of [-80, 80]) maneBatch(0.08, 0.92, 12, [0.17, 0.34], deg, [FLAME_RED, FLAME_GOLD, FLAME_RED, TONGUE_GOLD]);
  for (const deg of [-115, 115]) maneBatch(0.1, 0.8, 9, [0.15, 0.3], deg, [FLAME_GOLD, FLAME_RED, FLAME_CREAM, TONGUE_GOLD]);
  // withers/back tuft row
  b.cards(
    [0.62, 0.66, 0.7, 0.74, 0.78, 0.82].map((t) => body.at(t, 0)),
    [FLAME_RED, FLAME_GOLD],
    { size: [0.14, 0.28], lean: 70, bend: 30, flow: [0, -0.3, -1], cross: true, rng: R, vary: 0.2 },
  );
  // chest ruff (hanging cream/gold wisps)
  b.cards(
    [-0.14, -0.07, 0, 0.07, 0.14].map((dx) => frame([dx, 0.92, 0.72 - Math.abs(dx) * 0.4], [0, 1, 0])),
    [FLAME_CREAM, FLAME_GOLD],
    { size: [0.11, 0.26], lean: 168, bend: 15, flow: [0, 0, 1], cross: true, bone: chestJoint, rng: R },
  );

  // ======================= COLLAR & PENDANT =======================
  const chestSkin = b.surface([body, neckTube]);
  const collarLoop = b.surface(neckTube).loop(neck.at(0.3), { lift: 0.012 });
  b.sweep(collarLoop, 0.024, { color: GOLD, sides: 6, name: "collar" });
  b.along(collarLoop, 10, (at) => b.part(new THREE.SphereGeometry(0.028, 6, 4), GOLDHI, { at, name: "collarStud" }));
  const chestHit = chestSkin.ray([0, 1.12, 1.6], [0, -0.12, -1])!;
  const pendChain = chestSkin.drape(catmull([collarLoop.at(0.5), chestHit.at.clone().add(new THREE.Vector3(0, 0.1, 0)), chestHit.at]), { lift: 0.012 });
  b.sweep(pendChain, 0.008, { color: GOLD, sides: 4, name: "pendantChain" });
  b.stick(new THREE.CylinderGeometry(0.06, 0.066, 0.02, 8), GOLD, chestHit, { embed: 0.3, name: "pendantBezel" });
  glow(b.stick(new THREE.OctahedronGeometry(0.05, 0), AQUA, chestHit.moved([0, 0.02, 0]), { embed: 0.3, name: "pendant" }), 1.2);
  b.cards([frame(chestHit.at.clone().add(new THREE.Vector3(0, -0.04, 0.03)), [0, 1, 0])], TONGUE_RED, {
    size: [0.08, 0.22],
    lean: 175,
    flow: [0, 0, 1],
    cross: true,
    bone: chestJoint,
  });

  // ======================= BODY FILIGREE =======================
  const legSkins = [b.surface(frontLegs), b.surface(hindLegs)];
  for (const s of [1, -1]) {
    b.decal(bodySkin, SWIRL, { at: [s * 0.22, 1.14, 0.02], dir: [s, 0, 0], size: [0.5, 0.5], mirror: s < 0, name: "filigree" });
    b.decal(legSkins[0], SWIRL, { at: [s * 0.3, 1.0, 0.5], dir: [s, 0, 0], size: [0.3, 0.3], mirror: s < 0, name: "shoulderSwirl" });
    b.decal(legSkins[1], SWIRL, { at: [s * 0.3, 1.0, -0.55], dir: [s, 0, 0], size: [0.36, 0.36], mirror: s < 0, name: "haunchSwirl" });
    b.decal(b.surface(neckTube), SWIRL, {
      at: [s * 0.16, 1.5, 0.82],
      dir: [s, 0.15, 0.1],
      size: [0.2, 0.2],
      mirror: s < 0,
      name: "neckSwirl",
    });
  }
  // dorsal flame crest between withers and croup
  b.cards(
    [0.2, 0.28, 0.36, 0.44, 0.52, 0.6].map((t) => body.at(t, 0)),
    [FLAME_RED, FLAME_GOLD],
    { size: [0.12, 0.22], lean: 75, bend: 30, flow: [0, -0.3, -1], cross: true, rng: R, vary: 0.2 },
  );

  // ======================= TAIL PLUME =======================
  const E = tailPath.at(1);
  const ribbon = (ctrl1: number[], ctrl2: number[], tipPt: number[], w: number, color: Paint) => {
    b.sweep(
      bezier(E, ctrl1, ctrl2, tipPt),
      (t) => [0.012 + w * Math.sin(Math.PI * Math.min(1, t * 0.9 + 0.05)) ** 0.7 * (1 - 0.35 * t), 0.01 + 0.35 * w * Math.sin(Math.PI * t)],
      { bone: tail.joints[4], color, sides: 4, caps: "point", name: "plume" },
    );
  };
  const PL_RED = cel(paint((_p, _n, s) => (s[0] < 0.55 ? VERM : s[0] < 0.7 ? CORAL : GOLDHI)), "#a8213f");
  const PL_GOLD = cel(paint((_p, _n, s) => (s[0] < 0.5 ? "#f6bf3a" : s[0] < 0.75 ? GOLDHI : "#fff4c0")), "#bf7a24");
  ribbon([0.1, 1.12, -1.85], [0.3, 0.95, -1.95], [0.34, 0.7, -2.0], 0.03, PL_RED);
  ribbon([-0.1, 1.12, -1.85], [-0.3, 0.95, -1.95], [-0.34, 0.7, -2.0], 0.03, PL_RED);
  ribbon([0.04, 1.15, -1.9], [-0.06, 1.0, -2.1], [0.04, 0.62, -2.2], 0.04, PL_GOLD);
  ribbon([-0.04, 1.15, -1.9], [0.06, 1.0, -2.1], [-0.04, 0.62, -2.2], 0.04, PL_GOLD);
  ribbon([0.2, 1.25, -1.8], [0.44, 1.2, -1.9], [0.54, 1.0, -1.92], 0.03, PL_GOLD);
  ribbon([-0.2, 1.25, -1.8], [-0.44, 1.2, -1.9], [-0.54, 1.0, -1.92], 0.03, PL_GOLD);
  ribbon([0, 1.35, -1.85], [0.08, 1.3, -2.1], [0, 1.1, -2.28], 0.035, PL_RED);
  // flame cards fanning out of the tail tip
  b.cards(
    [
      frame(E, [0.6, 0.5, -0.6]),
      frame(E, [-0.6, 0.5, -0.6]),
      frame(E, [0.9, 0.2, -0.3]),
      frame(E, [-0.9, 0.2, -0.3]),
      frame(E, [0.3, 0.8, -0.5]),
      frame(E, [-0.3, 0.8, -0.5]),
      frame(E, [0, 0.4, -1]),
    ],
    [FLAME_RED, FLAME_GOLD],
    { size: [0.26, 0.55], lean: 25, bend: 45, flow: (f) => [Math.sign(f.axis.x) || 1, -0.5, -0.5], rng: R, vary: 0.2, bone: tail.joints[4] },
  );
  // cloud cards along the tail
  b.cards(
    Array.from({ length: 10 }, (_, i) => tailTube.at(0.15 + i * 0.085, i % 2 ? -60 : 60)),
    [FLAME_RED, FLAME_GOLD],
    { size: [0.13, 0.28], lean: 55, bend: 30, flow: (f) => [Math.sign(f.at.x) || 1, -0.2, -0.8], rng: R, vary: 0.2 },
  );
  glow(
    b.cards(
      Array.from({ length: 5 }, (_, i) => tailTube.at(0.5 + i * 0.1, 0)),
      WISP_AQUA,
      { size: [0.09, 0.26], lean: 50, bend: 30, flow: [0, -0.3, -1], cross: true, rng: R, vary: 0.2 },
    ),
    1,
  );

  // cloud puffs on the haunch and shoulder
  b.cards(
    [
      frame([0.17, 1.3, -0.45], [0.5, 1, 0]),
      frame([-0.17, 1.3, -0.45], [-0.5, 1, 0]),
      frame([0.17, 1.33, 0.3], [0.5, 1, 0]),
      frame([-0.17, 1.33, 0.3], [-0.5, 1, 0]),
    ],
    CLOUD,
    { size: [0.3, 0.24], lean: 75, bend: 10, flow: (f) => [Math.sign(f.at.x), -0.3, -0.4], rng: R },
  );

  // ======================= FINAL REST POSE =======================
  b.pose(jaw, { axis: [1, 0, 0], deg: 7 });

  return b.root;
}
