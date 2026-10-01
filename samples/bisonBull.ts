import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { rng, toDirection } from "../src/math";
import { bezier, catmull } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Bison Bull",
  description:
    "Flat low-poly American bison bull, 1.8 m at the hump: shaggy dark forequarters and beard, lean tan hindquarter, short black-tipped horns, tufted tail and cloven hooves on a patch of prairie.",
};

// ---- palette -------------------------------------------------------------------------------------------------
const TAN = "#80592f";
const TAN_LEG = "#5c3f24";
const DARK = "#3a2416";
const DARKER = "#271710";
const MID = "#573821";
const MUZZLE = "#4a3326";
const FACE = "#35231a";
const NOSE = "#191211";
const HORN_BASE = "#b5a684";
const HORN_MID = "#5e5243";
const HORN_TIP = "#17120f";
const HOOF = "#1c1613";
const SOIL = "#58401f";
const BELLY = "#4b2f1c";

// ---- drawings --------------------------------------------------------------------------------------------------

// Hair tufts are drawn in greys so each card takes its tint from the coat colour it grows on.
const TUFT = svg(
  `<svg viewBox="0 0 32 64">
    <path d="M3 64 L6 34 L9 14 L13 36 L16 2 L20 34 L23 12 L26 38 L29 64 Z" fill="#ffffff"/>
    <path d="M10 64 L11 38 L13 22 L15 40 L16 18 L18 44 L20 64 Z" fill="#c9c9c9"/>
    <path d="M14 64 L15 44 L16 30 L17 46 L18 64 Z" fill="#9a9a9a"/>
  </svg>`,
  { size: 128 },
);
const LOCK = svg(
  `<svg viewBox="0 0 24 96">
    <path d="M3 96 L5 52 L7 20 L10 54 L12 2 L15 50 L18 24 L20 60 L21 96 Z" fill="#ffffff"/>
    <path d="M9 96 L10 60 L12 34 L13 62 L15 96 Z" fill="#bdbdbd"/>
  </svg>`,
  { size: 128 },
);

function blade(x: number, tipX: number, tipY: number, w: number, fill: string) {
  return `<path d="M${x - w} 96 Q${(x + tipX) / 2 - 2} ${(96 + tipY) / 2} ${tipX} ${tipY} Q${(x + tipX) / 2 + 3} ${(96 + tipY) / 2 + 6} ${x + w} 96 Z" fill="${fill}"/>`;
}
const GRASS_A = svg(
  `<svg viewBox="0 0 96 96">
    ${blade(40, 12, 14, 4, "#4c7430")}${blade(48, 84, 10, 4, "#5b8536")}${blade(44, 30, 4, 4, "#6d9a3c")}
    ${blade(52, 66, 2, 4, "#486d2d")}${blade(46, 48, 18, 3, "#7aa844")}${blade(36, 4, 38, 3, "#567e33")}
    ${blade(56, 92, 40, 3, "#6d9a3c")}
    <rect x="61" y="14" width="2.4" height="82" fill="#b7a457"/>
    <path d="M62 4 L66 14 L62 26 L58 14 Z" fill="#c9b662"/>
    <rect x="22" y="30" width="2.4" height="66" fill="#b7a457"/>
    <path d="M23 18 L27 28 L23 38 L19 28 Z" fill="#a9963f"/>
  </svg>`,
  { size: 192 },
);
const GRASS_B = svg(
  `<svg viewBox="0 0 96 96">
    ${blade(42, 10, 22, 4, "#b3a055")}${blade(50, 86, 16, 4, "#c4b163")}${blade(46, 28, 6, 4, "#9c8c45")}
    ${blade(52, 70, 4, 4, "#a8964c")}${blade(44, 46, 24, 3, "#6d9a3c")}${blade(48, 60, 34, 3, "#5b8536")}
    ${blade(38, 2, 52, 3, "#8b7c3c")}
  </svg>`,
  { size: 192 },
);
const FLOWER = svg(
  `<svg viewBox="0 0 48 96">
    <rect x="22.5" y="36" width="3" height="60" fill="#56803a"/>
    <path d="M24 70 L38 58 L26 76 Z" fill="#56803a"/>
    <path d="M24 12 L17 2 L21 14 Z M24 12 L31 2 L27 14 Z M24 12 L8 8 L18 18 Z M24 12 L40 8 L30 18 Z M24 34 L8 40 L20 28 Z M24 34 L40 40 L28 28 Z" fill="#a265ad"/>
    <ellipse cx="24" cy="23" rx="8" ry="10" fill="#5a3422"/>
  </svg>`,
  { size: 192 },
);

function strokes(seed: number, n: number, dark: string, light: string) {
  const q = rng(seed);
  let out = "";
  for (let i = 0; i < n; i++) {
    const x = q() * 110 - 5;
    const y = q() * 74;
    const len = 8 + q() * 12;
    const sway = (q() - 0.5) * 6;
    out += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} q${sway.toFixed(1)} ${(len * 0.5).toFixed(1)} ${(sway * 0.4).toFixed(1)} ${len.toFixed(1)}" fill="none" stroke="${q() > 0.25 ? dark : light}" stroke-width="2.4" stroke-linecap="round"/>`;
  }
  return out;
}
// Drawing right = toward the tail on the model's left flank (see decals below).
const FLANK_HAIR = svg(
  `<svg viewBox="0 0 100 74">
    <path d="M14 20 L34 12 L52 24 L44 44 L24 48 Z" fill="#9a7243"/>
    <path d="M60 40 L82 34 L92 50 L76 64 L58 58 Z" fill="#94693c"/>
    ${strokes(5, 46, "#4b301a", "#b98e58")}
  </svg>`,
  { size: 512 },
);
const CAPE = svg(
  `<svg viewBox="0 0 120 100">
    <path d="M0 0 L86 0 L98 6 L84 12 L104 20 L86 28 L108 36 L88 46 L110 54 L90 62 L106 72 L88 78 L100 88 L84 92 L92 100 L0 100 Z" fill="#3a2416"/>
    <path d="M70 4 L62 18 M80 26 L66 36 M74 50 L58 56 M78 70 L62 76 M50 10 L38 22 M54 40 L40 48" stroke="#241710" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  </svg>`,
  { size: 512 },
);
const EYE = svg(
  `<svg viewBox="0 0 40 28">
    <path d="M1 16 Q12 2 22 3 Q34 4 39 15 Q28 26 16 25 Q6 24 1 16 Z" fill="#100a07"/>
    <ellipse cx="21" cy="15" rx="8.5" ry="8" fill="#4a2b16"/>
    <ellipse cx="21" cy="15" rx="5" ry="5.5" fill="#0b0605"/>
    <circle cx="24" cy="11.5" r="2" fill="#f3e8d6"/>
    <path d="M1 16 Q12 0 22 1.5 Q34 2 39 14" fill="none" stroke="#241710" stroke-width="2.6" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);
const NOSTRILS = svg(
  `<svg viewBox="0 0 80 40">
    <path d="M8 10 Q20 2 30 12 Q26 30 14 34 Q4 26 8 10 Z" fill="#070404"/>
    <path d="M72 10 Q60 2 50 12 Q54 30 66 34 Q76 26 72 10 Z" fill="#070404"/>
    <path d="M36 16 L44 16 L44 38 L36 38 Z" fill="#0a0606"/>
    <path d="M14 10 Q20 7 25 11" fill="none" stroke="#4d3f3a" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M66 10 Q60 7 55 11" fill="none" stroke="#4d3f3a" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);
const MUD = svg(
  `<svg viewBox="0 0 60 100">
    <path d="M6 100 L8 70 L16 54 L22 76 L30 40 L38 72 L46 58 L52 100 Z" fill="#74603d"/>
    <path d="M14 100 L18 82 L24 90 L30 72 L36 92 L42 82 L44 100 Z" fill="#8d7a52"/>
    <circle cx="12" cy="40" r="4" fill="#74603d"/><circle cx="48" cy="32" r="3" fill="#74603d"/>
    <circle cx="30" cy="20" r="3.4" fill="#8d7a52"/>
  </svg>`,
  { size: 256 },
);
const MOUTH_LINE = svg(
  `<svg viewBox="0 0 100 20">
    <path d="M2 14 Q30 4 60 8 Q82 10 98 4" fill="none" stroke="#120a07" stroke-width="5" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

// The prairie patch: one outline drives the soil slab and the drawing laid on top of it.
const PATCH_X = 1.2;
const PATCH_Z = 2.05;
const PATCH_CZ = 0.25;
const patchPts: Array<[number, number]> = [];
{
  const q = rng(23);
  const n = 20;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const j = 0.9 + q() * 0.14;
    patchPts.push([Math.cos(a) * 1.15 * j, Math.sin(a) * 1.95 * j]);
  }
}
const HOOVES: Array<[number, number]> = [
  [0.3, 0.6],
  [-0.3, 0.6],
  [0.27, -0.72],
  [-0.27, -0.72],
];
function patchSvg() {
  const X = (x: number) => ((x + PATCH_X) * 100).toFixed(1);
  const Y = (z: number) => ((z - PATCH_CZ + PATCH_Z) * 100).toFixed(1);
  const outline = patchPts.map(([x, z], i) => `${i ? "L" : "M"}${X(x)} ${Y(z + PATCH_CZ)}`).join(" ") + " Z";
  const q = rng(31);
  let body = `<rect width="260" height="420" fill="#7f9444"/>`;
  for (let i = 0; i < 26; i++)
    body += `<ellipse cx="${(q() * 260).toFixed(0)}" cy="${(q() * 420).toFixed(0)}" rx="${(10 + q() * 20).toFixed(0)}" ry="${(7 + q() * 14).toFixed(0)}" fill="${q() > 0.5 ? "#6b8236" : "#93a450"}"/>`;
  for (let i = 0; i < 22; i++)
    body += `<ellipse cx="${(q() * 260).toFixed(0)}" cy="${(q() * 420).toFixed(0)}" rx="${(6 + q() * 12).toFixed(0)}" ry="${(4 + q() * 8).toFixed(0)}" fill="#b7a75a"/>`;
  for (const [hx, hz] of HOOVES)
    body += `<ellipse cx="${X(hx)}" cy="${Y(hz)}" rx="${(15 + q() * 4).toFixed(0)}" ry="${(19 + q() * 4).toFixed(0)}" fill="#765a33"/><ellipse cx="${X(hx + 0.03)}" cy="${Y(hz + 0.04)}" rx="8" ry="10" fill="#5f4726"/>`;
  for (let i = 0; i < 26; i++)
    body += `<ellipse cx="${(q() * 260).toFixed(0)}" cy="${(q() * 420).toFixed(0)}" rx="${(2 + q() * 3).toFixed(1)}" ry="${(1.5 + q() * 2).toFixed(1)}" fill="#a29b8a"/>`;
  for (let i = 0; i < 30; i++) {
    const cx = q() * 260;
    const cy = q() * 420;
    body += `<path d="M${cx.toFixed(0)} ${cy.toFixed(0)} q${(q() * 10 - 5).toFixed(1)} -8 ${(q() * 14 - 7).toFixed(1)} -2 q-2 6 -8 6 Z" fill="#3d2818"/>`;
  }
  for (let i = 0; i < 34; i++) {
    const cx = q() * 260;
    const cy = q() * 420;
    body += `<path d="M${cx.toFixed(0)} ${cy.toFixed(0)} l${(q() * 16 - 8).toFixed(1)} ${(q() * 10 - 5).toFixed(1)}" stroke="#5b7530" stroke-width="2.6" stroke-linecap="round" fill="none"/>`;
  }
  return `<svg viewBox="0 0 260 420"><defs><clipPath id="c"><path d="${outline}"/></clipPath></defs><g clip-path="url(#c)">${body}</g></svg>`;
}
const GROUND = svg(patchSvg(), { size: 1400 });

// ---- model -----------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "bisonBull", paintSize: 512 });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const ico = (detail = 1) => new THREE.IcosahedronGeometry(1, detail);

  // ---- skeleton -----------------------------------------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0, 0.1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.07, -0.85],
      [0, 1.05, -0.25],
      [0, 1.12, 0.25],
      [0, 1.2, 0.6],
    ]),
    { parent: root, names: ["hips", "spine1", "spine2", "spine3"], role: "spine" },
  );
  const hips = spine.joints[0];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.2, 0.6],
      [0, 1.18, 0.95],
      [0, 1.04, 1.26],
    ]),
    { parent: spine.joints[3], names: ["neck1", "neck2"], role: "neck" },
  );

  // Head frame: origin at the poll, nose pitched down. hp(x, up, forward) is a model-space point.
  const O = V(0, 1.1, 1.24);
  const D = V(0, -0.45, 0.89).normalize();
  const U = V(0, 0.89, 0.45).normalize();
  const hp = (x: number, u: number, f: number) =>
    O.clone()
      .addScaledVector(V(1, 0, 0), x)
      .addScaledVector(U, u)
      .addScaledVector(D, f);
  const head = b.joint("head", { parent: neck.joints[1], at: O, dir: D, role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.12, 0.1), aim: hp(0, -0.2, 0.52), role: "jaw" });
  const headPart = (
    geo: THREE.BufferGeometry,
    color: string,
    [x, u, f]: [number, number, number],
    scale: [number, number, number] | number = 1,
  ) => b.part(geo, color, { bone: head, at: hp(x, u, f), dir: D, up: U, axis: "z", scale, flat: true });

  // ---- torso ---------------------------------------------------------------------------------------------------
  const torso = b.loft(
    [
      { at: [0, 1.05, -0.9], w: 0.44, h: 0.46 },
      { at: [0, 1.08, -0.72], w: 0.6, h: 0.62 },
      { at: [0, 1.06, -0.25], w: 0.7, h: 0.66 },
      { at: [0, 1.14, 0.2], w: 0.8, h: 0.86 },
      { at: [0, 1.2, 0.55], w: 0.88, h: 0.92 },
      { at: [0, 1.15, 0.92], w: 0.84, h: 0.9 },
      { at: [0, 1.0, 1.2], w: 0.66, h: 0.72 },
    ],
    {
      bone: [spine, neck],
      sides: 10,
      smooth: false,
      caps: { start: "round", end: "round" },
      bands: [
        [0.4, TAN],
        [1, DARK],
      ],
    },
  );
  // the hump: a separate heavy mass over the shoulders
  const hump = b.part(ico(1), DARK, {
    bone: spine.joints[2],
    at: [0, 1.36, 0.5],
    scale: [0.4, 0.4, 0.56],
    flat: true,
  });

  // ---- head ----------------------------------------------------------------------------------------------------
  const cranium = headPart(ico(1), FACE, [0, 0.03, 0.05], [0.21, 0.22, 0.25]);
  const topknot = headPart(ico(1), MID, [0, 0.17, 0.1], [0.19, 0.09, 0.16]);
  const snout = headPart(ico(1), MUZZLE, [0, -0.07, 0.4], [0.16, 0.14, 0.25]);
  const pad = headPart(ico(1), NOSE, [0, -0.09, 0.63], [0.12, 0.085, 0.075]);
  const cheeks = [];
  for (const s of [1, -1]) {
    cheeks.push(headPart(ico(0), FACE, [s * 0.13, -0.07, 0.1], [0.1, 0.12, 0.14]));
    // ears tucked under the hair, brow ridge above the eye
    b.part(new THREE.ConeGeometry(0.045, 0.14, 4), DARK, {
      bone: head,
      at: hp(s * 0.2, 0.07, -0.08),
      dir: [s * 0.7, 0.25, -0.5],
      flat: true,
    });
    headPart(ico(0), DARK, [s * 0.13, 0.11, 0.1], [0.08, 0.05, 0.09]);
    // horns: out from the side of the skull, up and in, pale base to black tip
    const horn = bezier(
      hp(s * 0.16, 0.1, 0.02),
      hp(s * 0.36, 0.12, -0.02),
      hp(s * 0.5, 0.26, 0.06),
      hp(s * 0.4, 0.46, 0.16),
    );
    b.sweep(horn, [0.072, 0.008], {
      bone: head,
      sides: 6,
      smooth: false,
      caps: { end: "point" },
      bands: [
        [0.3, HORN_BASE],
        [0.7, HORN_MID],
        [1, HORN_TIP],
      ],
    });
    b.part(new THREE.CylinderGeometry(0.078, 0.09, 0.07, 6), MID, {
      bone: head,
      at: hp(s * 0.17, 0.1, 0.02),
      dir: [s, 0.05, 0],
      flat: true,
    });
  }
  // lower jaw and beard
  b.frustumBox(hp(0, -0.12, 0.1), hp(0, -0.2, 0.54), [0.26, 0.14], [0.16, 0.09], { bone: jaw, color: MUZZLE });
  b.part(new THREE.ConeGeometry(0.075, 0.32, 5), DARKER, {
    bone: jaw,
    at: hp(0, -0.37, 0.46),
    dir: [0, -1, 0.05],
    flat: true,
  });
  b.part(new THREE.ConeGeometry(0.06, 0.22, 5), DARKER, {
    bone: jaw,
    at: hp(0, -0.3, 0.28),
    dir: [0, -1, -0.05],
    flat: true,
  });
  // nostrils on the nose pad
  b.decal(pad, NOSTRILS, {
    at: hp(0, -0.09, 0.85),
    dir: toDirection(D.clone().negate()).negate(),
    up: U,
    size: [0.17, 0.085],
    bone: head,
  });

  // eyes on the skull sides
  const skullSkin = b.surface([cranium, ...cheeks]);
  for (const s of [1, -1])
    b.decal(skullSkin, EYE, {
      at: hp(s * 0.3, 0.0, 0.1),
      dir: [s, 0, 0],
      size: [0.11, 0.078],
      segments: 6,
      mirror: s > 0,
      bone: head,
    });
  // mouth seam between muzzle and jaw
  for (const s of [1, -1])
    b.decal(snout, MOUTH_LINE, {
      at: hp(s * 0.25, -0.17, 0.4),
      dir: [s, 0, 0],
      size: [0.3, 0.05],
      segments: [8, 2],
      mirror: s > 0,
      bone: head,
    });

  // ---- tail ----------------------------------------------------------------------------------------------------
  const tailPath = catmull([
    [0, 1.24, -0.98],
    [0, 1.18, -1.22],
    [0, 1.0, -1.35],
    [0, 0.8, -1.34],
    [0, 0.66, -1.3],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5"],
    role: "tail",
  });
  b.sweep(tail, [0.055, 0.03], { sides: 6, smooth: false, color: TAN });
  const tailTip = tailPath.at(1);
  b.part(new THREE.ConeGeometry(0.07, 0.3, 6), DARKER, {
    bone: tail.tip ?? tail.joints[tail.joints.length - 1],
    at: [tailTip.x, tailTip.y - 0.1, tailTip.z],
    dir: [0, -1, 0],
    flat: true,
  });
  const tuftFrames = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    tuftFrames.push(
      frame([tailTip.x + Math.cos(a) * 0.035, tailTip.y + 0.04, tailTip.z + Math.sin(a) * 0.035], [0, 1, 0]),
    );
  }
  b.cards(tuftFrames, LOCK, {
    size: [0.1, 0.34],
    lean: 170,
    flow: [0, 0, 1],
    bend: 10,
    cross: true,
    vary: 0.25,
    spin: 15,
    rng: rng(3),
    color: DARK,
    bone: tail.tip ?? tail.joints[tail.joints.length - 1],
  });

  // ---- legs ----------------------------------------------------------------------------------------------------
  const foreSweeps = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // forelegs: short, massive, hairy to the knee
    const fPts = limb(
      V(s * 0.3, 1.0, 0.55),
      V(s * 0.3, 0.17, 0.62),
      [0.36, 0.3, 0.24],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const fore = b.chain(`foreleg${side}`, fPts, {
      parent: spine.joints[3],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `handF${side}`],
      role: "leg",
    });
    const foreSweep = b.sweep(fore, [0.19, 0.17, 0.1, 0.07, 0.058, 0.064], {
      sides: 7,
      smooth: false,
      bands: [
        [0.55, DARK],
        [1, TAN_LEG],
      ],
    });
    foreSweeps.push(foreSweep);
    // hind legs: lean, long cannon
    const hPts = limb(
      V(s * 0.25, 0.98, -0.66),
      V(s * 0.26, 0.17, -0.76),
      [0.3, 0.33, 0.25],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hind = b.chain(`hindleg${side}`, hPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `foot${side}`],
      role: "leg",
    });
    const hindSweep = b.sweep(hind, [0.17, 0.13, 0.085, 0.06, 0.05, 0.056], {
      sides: 7,
      smooth: false,
      bands: [
        [0.5, TAN],
        [1, TAN_LEG],
      ],
    });

    for (const [pts, chain, legSweep] of [
      [fPts, fore, foreSweep],
      [hPts, hind, hindSweep],
    ] as const) {
      const foot = pts[pts.length - 1];
      const hoofBone = chain.joints[chain.joints.length - 1];
      // cloven hooves (two toes) and dewclaws
      for (const t of [1, -1]) {
        b.part(new THREE.CylinderGeometry(0.03, 0.05, 0.15, 5), HOOF, {
          bone: hoofBone,
          at: [foot.x + t * 0.033, 0.085, foot.z + 0.02],
          scale: [1, 1, 1.35],
          rotation: [-8, 0, 0],
          flat: true,
        });
        b.part(new THREE.IcosahedronGeometry(0.022, 0), HOOF, {
          bone: hoofBone,
          at: [foot.x + t * 0.04, 0.2, foot.z - 0.06],
          flat: true,
        });
      }
      // mud splashes on the lower legs
      b.decal(legSweep, MUD, {
        at: [foot.x + s * 0.2, 0.36, foot.z],
        dir: [s, 0, 0],
        size: [0.13, 0.22],
        segments: [4, 6],
        mirror: s < 0,
      });
    }
  }

  // ---- fur ---------------------------------------------------------------------------------------------------
  const skin = b.surface([torso, hump]);
  const tuft = (
    hits: Parameters<typeof b.cards>[0],
    color: string,
    size: [number, number],
    seed: number,
    extra: Partial<Parameters<typeof b.cards>[2]> = {},
  ) =>
    b.cards(hits, TUFT, {
      size,
      lean: 58,
      flow: [0, -1, -0.15],
      bend: 18,
      vary: 0.3,
      spin: 20,
      rng: rng(seed),
      color,
      ...extra,
    });
  // heavy dark cape: hump, shoulders, neck, chest (kept off the face)
  const cape = (h: { at: THREE.Vector3; n: THREE.Vector3 }) => h.at.z > 0.12 && h.at.z < 1.12 && h.n.y > -0.35;
  tuft(skin.scatter(340, { rng: rng(41), minDist: 0.1, filter: cape }), DARK, [0.12, 0.22], 51, { lean: 66 });
  tuft(skin.scatter(80, { rng: rng(42), minDist: 0.1, filter: (h) => cape(h) && h.n.y > 0.3 }), MID, [0.11, 0.2], 52, {
    lean: 70,
  });
  // brisket skirt
  tuft(
    skin.scatter(70, { rng: rng(43), minDist: 0.1, filter: (h) => h.at.z > -0.1 && h.at.z < 1.1 && h.n.y < -0.3 }),
    BELLY,
    [0.14, 0.28],
    53,
    {
      lean: 20,
      flow: [0, 0, -1],
    },
  );
  // lean, short hair on the hindquarter
  tuft(
    skin.scatter(130, { rng: rng(44), minDist: 0.1, filter: (h) => h.at.z < 0.05 && h.n.y > -0.2 }),
    TAN,
    [0.07, 0.13],
    54,
    {
      lean: 72,
    },
  );
  tuft(
    skin.scatter(40, { rng: rng(45), minDist: 0.12, filter: (h) => h.at.z < 0.05 && h.n.y > 0.1 }),
    MID,
    [0.06, 0.11],
    55,
    {
      lean: 72,
    },
  );
  // forelegs: shaggy chaps
  for (const [i, leg] of foreSweeps.entries()) {
    const s = i === 0 ? 1 : -1;
    tuft(
      b.surface(leg).scatter(50, { rng: rng(60 + s), minDist: 0.06, filter: (h) => h.at.y > 0.5 }),
      DARK,
      [0.1, 0.2],
      62 + s,
      {
        lean: 48,
      },
    );
    tuft(
      b.surface(leg).scatter(16, { rng: rng(70 + s), minDist: 0.05, filter: (h) => h.at.y > 0.3 && h.at.y < 0.5 }),
      MID,
      [0.07, 0.12],
      72 + s,
      {
        lean: 52,
      },
    );
  }
  // head: bonnet on the crown and a little hair on the cheeks
  tuft(
    b.surface([cranium, topknot]).scatter(44, { rng: rng(81), minDist: 0.06, filter: (h) => h.n.y > 0.3 }),
    MID,
    [0.085, 0.14],
    82,
    { flow: [0, -0.3, -1], lean: 70 },
  );
  tuft(
    b
      .surface([cranium])
      .scatter(14, {
        rng: rng(83),
        minDist: 0.06,
        filter: (h) => h.n.y < 0.3 && Math.abs(h.n.x) > 0.6 && h.n.y > -0.3,
      }),
    DARK,
    [0.07, 0.12],
    84,
    { flow: [0, -1, -0.3], lean: 70 },
  );
  const beard = [];
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const p = hp((i % 2 ? 1 : -1) * 0.05 * (1 - t * 0.4), -0.26 - t * 0.04, 0.12 + t * 0.36);
    beard.push(frame(p, [0, 1, 0]));
  }
  b.cards(beard, LOCK, {
    size: [0.12, 0.36],
    lean: 175,
    flow: [0, 0, 1],
    cross: true,
    vary: 0.25,
    spin: 25,
    rng: rng(9),
    color: DARKER,
    bone: jaw,
  });

  // ---- decals: cape edge and worn flank -------------------------------------------------------------------------
  for (const s of [1, -1]) {
    b.decal(torso, CAPE, {
      at: [s * 0.6, 1.2, 0.2],
      dir: [s, 0, 0],
      size: [1.0, 1.02],
      segments: [14, 14],
      mirror: s < 0,
    });
    b.decal(torso, FLANK_HAIR, {
      at: [s * 0.6, 1.15, -0.5],
      dir: [s, 0, 0],
      size: [0.75, 0.55],
      segments: [10, 8],
      mirror: s < 0,
    });
  }

  // ---- prairie patch -------------------------------------------------------------------------------------------
  b.extrude(patchPts, {
    at: [0, 0.0075, PATCH_CZ],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.065,
    bevel: 0.015,
    color: SOIL,
    bone: root,
  });
  b.part(new THREE.PlaneGeometry(PATCH_X * 2, PATCH_Z * 2), "#ffffff", {
    bone: root,
    at: [0, 0.0415, PATCH_CZ],
    dir: [0, 1, 0],
    up: [0, 0, -1],
    axis: "z",
    texture: GROUND,
  });
  const gq = rng(91);
  const clumps = [];
  const flowers = [];
  while (clumps.length < 95) {
    const a = gq() * Math.PI * 2;
    const rad = Math.sqrt(gq()) * 0.95;
    const x = Math.cos(a) * 1.08 * rad;
    const z = PATCH_CZ + Math.sin(a) * 1.85 * rad;
    if (HOOVES.some(([hx, hz]) => Math.hypot(x - hx, z - hz) < 0.17)) continue;
    clumps.push(frame([x, 0.035, z], [0, 1, 0]));
    if (gq() < 0.12) flowers.push(frame([x + 0.05, 0.035, z + 0.04], [0, 1, 0]));
  }
  b.cards(clumps, [GRASS_A, GRASS_B, GRASS_A], {
    size: [0.3, 0.22],
    vary: 0.35,
    spin: 180,
    cross: true,
    rng: rng(92),
    bone: root,
  });
  b.cards(flowers, FLOWER, { size: [0.08, 0.24], vary: 0.3, spin: 180, cross: true, rng: rng(93), bone: root });
  // a few tufts right at the hooves
  const hoofFrames = HOOVES.flatMap(([hx, hz]) => [
    frame([hx + 0.13, 0.035, hz - 0.05], [0, 1, 0]),
    frame([hx - 0.12, 0.035, hz + 0.07], [0, 1, 0]),
  ]);
  b.cards(hoofFrames, [GRASS_A, GRASS_B], {
    size: [0.22, 0.16],
    vary: 0.25,
    spin: 180,
    cross: true,
    rng: rng(94),
    bone: root,
  });

  return b.root;
}
