// Elder Chimera: a low-poly boss creature, 4.5 m at the shoulder. A faceted lion body (one ten-sided loft from rump
// to skull) carries a crimson mane of chunky extruded locks, a ridge of teal armour plates with bone spikes, a horned
// goat neck rising from the back, great bat wings and a long serpent tail arching up over the back to a hooded viper
// head. Every head has its own jaw joint; the paws, wing fingers and toes are digit chains. Flat colours only: value
// comes from separate lighter and darker parts. Story details: gold shackles with broken chains on the forelegs,
// spear shafts stuck in the hide, claw scars, and cyan rune-glow in the eyes and the armour.
import * as THREE from "three";
import { glow } from "../kits/glow";
import { createBuilder } from "../src/builder";
import type { Frame } from "../src/frame";
import { frame } from "../src/frame";
import { aim, DEG, lerp, offset, rng } from "../src/math";
import type { V3 } from "../src/math";
import type { OutlinePoint } from "../src/outline";
import { paint } from "../src/paint";
import { bezier, catmull } from "../src/path";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";

export const meta = {
  name: "Elder Chimera",
  description:
    "A low-poly boss chimera, 4.5 m at the shoulder: maned lion, horned goat head rising from the back, bat wings and a hooded serpent tail, with armour plates, shackles, scars and glowing runes.",
  builtBy: "Claude Opus 5.5",
};

// ---- Palette: lion gold, mane crimson, armour teal, bone ivory, goat ash, charcoal; gold accent; cyan glow -------
const LION_D = "#9a5a28";
const LION = "#c98a3d";
const LION_L = "#e8b766";
const CREAM = "#f1d9a2";
const MANE_D = "#521b1d";
const MANE = "#7f2a25";
const MANE_L = "#ab452f";
const WING_D = "#7a2733";
const WING = "#a8383f";
const WING_L = "#cf5a4c";
const TEAL_D = "#1e3946";
const TEAL = "#2f5f70";
const TEAL_L = "#4d8f9b";
const TEAL_XL = "#86c4bd";
const BONE = "#d6c49d";
const BONE_L = "#f4ead0";
const GOAT_D = "#77706a";
const GOAT = "#aba297";
const GOAT_L = "#d6cec1";
const HORN_D = "#3a2f2b";
const HORN = "#5b4a40";
const CHAR = "#1b1417";
const CHAR_L = "#33262b";
const MOUTH = "#9c3a4b";
const TONGUE = "#cf6278";
const GOLD_D = "#b2781f";
const GOLD = "#eeb43b";
const GLOW = "#6ff4ff";
const GLOW_CORE = "#e4ffff";
const SCAR = "#e8a597";

const SIDES = [
  [1, "L"],
  [-1, "R"],
] as const;

const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---- Outlines ----------------------------------------------------------------------------------------------------
/** A shield-shaped armour plate drawn from its front edge (y = 0) to its point (y = len). */
const shield = (len: number, w: number): OutlinePoint[] => [
  [-w, 0, "sharp"],
  [w, 0, "sharp"],
  [w * 0.95, len * 0.5, "sharp"],
  [0, len, "sharp"],
  [-w * 0.95, len * 0.5, "sharp"],
];
/** A flame-shaped mane lock, hooked a little to one side. */
const flame = (len: number, w: number): OutlinePoint[] => [
  [-w, 0, "sharp"],
  [w, 0, "sharp"],
  [w * 0.85, len * 0.42, "sharp"],
  [w * 0.2, len, "sharp"],
  [-w * 0.35, len * 0.62, "sharp"],
  [-w * 0.8, len * 0.3, "sharp"],
];
/** A rounded leaf (ears). */
const leaf = (len: number, w: number): OutlinePoint[] => [
  [-w, 0, "sharp"],
  [w, 0, "sharp"],
  [w * 0.9, len * 0.5, "sharp"],
  [w * 0.35, len * 0.9, "sharp"],
  [0, len, "sharp"],
  [-w * 0.45, len * 0.85, "sharp"],
  [-w * 0.95, len * 0.45, "sharp"],
];
/** An almond eye, its outer corner (+x) swept up. */
const almond = (len: number, h: number): OutlinePoint[] => [
  [-len * 0.5, -h * 0.1, "sharp"],
  [-len * 0.1, -h * 0.5, "sharp"],
  [len * 0.35, -h * 0.35, "sharp"],
  [len * 0.5, h * 0.45, "sharp"],
  [len * 0.05, h * 0.5, "sharp"],
];

// ---- Drawings ----------------------------------------------------------------------------------------------------
const SCAR_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <polygon points="10,8 16,6 34,58 29,60" fill="${SCAR}"/>
    <polygon points="23,4 29,3 46,54 41,57" fill="${SCAR}"/>
    <polygon points="36,7 42,7 56,48 51,51" fill="${SCAR}"/>
    <polygon points="14,12 16,11 31,54 29,55" fill="#b8635e"/>
    <polygon points="27,8 29,8 43,50 41,51" fill="#b8635e"/>
    <polygon points="40,11 42,11 53,45 51,46" fill="#b8635e"/>
  </svg>`,
  { size: 128 },
);
const RUNE_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <g fill="none" stroke="${GLOW}" stroke-width="5" stroke-linejoin="miter" stroke-linecap="square">
      <polygon points="32,6 56,32 32,58 8,32"/>
      <polyline points="32,16 32,48"/>
      <polyline points="20,26 32,36 44,26"/>
    </g>
    <rect x="28" y="29" width="8" height="8" fill="${GLOW_CORE}"/>
  </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "lowPolyChimera" });
  const r = rng(17);

  // Flat-shaded tube defaults: faceted, few sides.
  const facet = (sides: number) => ({ sides, smooth: false });

  /** An extruded plate lying on a surface frame `p`, its point flowing along `flow`, tipped `tilt` degrees off it. */
  const plate = (
    p: Frame,
    flow: THREE.Vector3,
    outline: OutlinePoint[],
    th: number,
    color: string,
    lift: number,
    tilt: number,
    group: string,
    bone?: Joint,
  ) => {
    const n = p.axis;
    const y = flow
      .clone()
      .addScaledVector(n, -flow.dot(n))
      .normalize()
      .multiplyScalar(Math.cos(tilt * DEG))
      .addScaledVector(n, Math.sin(tilt * DEG))
      .normalize();
    return b.extrude(outline, {
      at: p.moved([0, lift, 0]),
      x: new THREE.Vector3().crossVectors(y, n).normalize(),
      y,
      thickness: th,
      bevel: th * 0.3,
      detail: 0.34,
      color,
      group,
      ...(bone ? { bone } : {}),
    });
  };

  // ================================================================================================================
  // Body: one loft from the rump through the spine and neck to the back of the skull.
  // ================================================================================================================
  const ST = [
    { at: [0, 3.1, -3.6], w: 1.3, h: 1.3 },
    { at: [0, 3.25, -2.8], w: 2.0, h: 2.0 },
    { at: [0, 3.2, -1.6], w: 1.85, h: 1.8 },
    { at: [0, 3.25, -0.3], w: 2.3, h: 2.25 },
    { at: [0, 3.35, 0.95], w: 2.7, h: 2.5 },
    { at: [0, 3.55, 1.95], w: 2.35, h: 2.3 },
    { at: [0, 4.1, 2.7], w: 1.75, h: 1.75 },
    { at: [0, 4.7, 3.2], w: 1.4, h: 1.4 },
    { at: [0, 5.1, 3.55], w: 1.2, h: 1.2 },
  ] as const;
  const curve = catmull(ST.map((s) => s.at));
  const hipsT = curve.knots[1];
  const chestT = curve.knots[4];
  const neckT = curve.knots[5];
  const hips = b.joint("hips", { at: ST[1].at, role: "spine", group: "body" });
  const spine = b.chain("spine", curve.slice(hipsT, chestT), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
    group: "body",
  });
  const chest = spine.joints[2];
  const neck = b.chain("neck", curve.slice(chestT, 1), {
    parent: chest,
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
    group: "neck",
  });
  const body = b.loft(ST, {
    bone: [hips, spine, neck],
    color: LION,
    sectors: [
      [-40, 40, LION_L],
      [100, 140, LION_D],
      [140, 220, CREAM],
      [220, 260, LION_D],
    ],
    ...facet(10),
    group: "body",
  });
  const skin = b.surface(body);

  // ---- Dorsal armour: a centre row of big plates with bone spikes, and a smaller row each side -------------------
  const ridgeFrom = 0.085;
  const ridgeTo = neckT + 0.04;
  const ridgeN = 13;
  for (let i = 0; i < ridgeN; i++) {
    const t = ridgeFrom + ((ridgeTo - ridgeFrom) * i) / (ridgeN - 1);
    const k = Math.sin((Math.PI * i) / (ridgeN - 1));
    const len = 0.55 + 0.35 * k;
    const w = 0.26 + 0.18 * k;
    const p = body.at(t, 0);
    const back = p.tangent.negate();
    const pl = plate(p, back, shield(len, w), 0.12, i % 2 ? TEAL : TEAL_L, 0.04, 10, "armour");
    plate(p, back, shield(len * 0.62, w * 0.55), 0.06, TEAL_D, 0.13, 12, "armour");
    b.spike(
      pl.local([0, len * 0.3, 0]),
      offset([0, 0, 0], p.axis.clone().addScaledVector(back, 0.55), 1),
      0.35 + 0.45 * k,
      0.11 + 0.05 * k,
      {
        color: i % 2 ? BONE : BONE_L,
        ...facet(4),
        caps: { start: "flat", end: "point" },
        group: "armour",
      },
    );
    for (const [s] of SIDES) {
      if (i === 0 || i === ridgeN - 1) continue;
      const q = body.at(t + 0.012, s * -34);
      const sp = plate(q, back, shield(len * 0.7, w * 0.75), 0.09, i % 2 ? TEAL_L : TEAL, 0.03, 8, "armour");
      if (i % 2 === 0 && i < ridgeN - 2)
        glow(
          b.part(new THREE.PlaneGeometry(w * 0.7, w * 0.7), "#ffffff", {
            bone: sp.bone ?? chest,
            at: sp.local([0, len * 0.28, 0.055]),
            dir: sp.axis,
            up: sp.dir([0, -1, 0]),
            axis: "z",
            texture: RUNE_TEX,
            group: "armour",
          }),
          1.4,
        );
    }
  }

  // ================================================================================================================
  // Lion head
  // ================================================================================================================
  const headDir: V3 = [0, -0.22, 1];
  const head = b.joint("head", { at: neck.at(1), dir: headDir, role: "head", group: "head" });
  // Head units: +x the lion's left, +y up, +z forward along the head; one number sizes the whole head.
  const H = b.region({ at: head, quat: aim(headDir, [0, 1, 0], "z"), scale: 1.28 });
  const cranium = b.loft(
    [
      { at: H.p([0, 0.1, -0.35]), w: H.s(1.0), h: H.s(0.95) },
      { at: H.p([0, 0.12, 0.05]), w: H.s(1.25), h: H.s(1.02) },
      { at: H.p([0, 0.04, 0.42]), w: H.s(1.12), h: H.s(0.8) },
      { at: H.p([0, -0.04, 0.6]), w: H.s(0.95), h: H.s(0.62) },
    ],
    { bone: head, color: LION, sectors: [[-40, 40, LION_L]], ...facet(8), group: "head", name: "cranium" },
  );
  const muzzle = b.loft(
    [
      { at: H.p([0, -0.1, 0.45]), w: H.s(0.98), h: H.s(0.6) },
      { at: H.p([0, -0.12, 0.85]), w: H.s(0.9), h: H.s(0.5) },
      { at: H.p([0, -0.14, 1.05]), w: H.s(0.74), h: H.s(0.4) },
    ],
    {
      bone: head,
      color: LION_L,
      sectors: [[150, 210, CREAM]],
      ...facet(8),
      caps: { start: "flat", end: "flat" },
      group: "head",
      name: "muzzle",
    },
  );
  // Dark forehead chevron, a lighter nose bridge and the big dark nose pad.
  b.frustumBox(H.p([0, 0.22, 0.42]), H.p([0, 0.14, 1.02]), [H.s(0.32), H.s(0.1)], [H.s(0.26), H.s(0.08)], {
    bone: head,
    color: CREAM,
    group: "head",
  });
  for (const [s] of SIDES)
    b.frustumBox(H.p([s * 0.05, 0.6, 0.0]), H.p([s * 0.17, 0.3, 0.52]), [H.s(0.1), H.s(0.08)], [H.s(0.06), H.s(0.06)], {
      bone: head,
      color: LION_D,
      group: "head",
    });
  b.extrude(
    [
      [-0.24, 0.05, "sharp"],
      [0.24, 0.05, "sharp"],
      [0.16, -0.1, "sharp"],
      [0, -0.19, "sharp"],
      [-0.16, -0.1, "sharp"],
    ].map(([x, y, c]) => [H.s(x as number), H.s(y as number), c] as OutlinePoint),
    {
      at: H.p([0, 0.1, 1.08]),
      x: H.d([1, 0, 0]),
      y: H.d([0, 1, 0.25]),
      thickness: H.s(0.14),
      bevel: H.s(0.035),
      detail: 0.34,
      bone: head,
      color: CHAR,
      group: "head",
      name: "nose",
    },
  );
  // Palate: a dark shelf filling the mouth between the jaws.
  b.frustumBox(H.p([0, -0.33, 0.3]), H.p([0, -0.33, 0.98]), [H.s(0.8), H.s(0.08)], [H.s(0.56), H.s(0.06)], {
    bone: head,
    color: MOUTH,
    group: "head",
  });

  // Whisker pads and their dark spots.
  for (const [s] of SIDES) {
    b.part(new THREE.IcosahedronGeometry(H.s(0.2), 0), CREAM, {
      bone: head,
      at: H.p([s * 0.22, -0.2, 0.98]),
      scale: [1.1, 0.7, 0.8],
      flat: true,
      group: "head",
    });
    for (const [dx, dy] of [
      [0.08, 0.04],
      [0.16, -0.02],
      [0.1, -0.09],
    ])
      b.part(new THREE.IcosahedronGeometry(H.s(0.025), 0), CHAR, {
        bone: head,
        at: H.p([s * (0.22 + dx * 0.8), -0.2 + dy, 1.14 - dx * 0.4]),
        flat: true,
        group: "head",
      });
  }

  // Upper teeth: two huge canines, a row of incisors and cheek teeth.
  const fang = (base: THREE.Vector3, dir: THREE.Vector3, len: number, rad: number, bone: Joint, group: string) =>
    b.spike(base, dir, len, rad, { bone, color: BONE_L, ...facet(4), caps: { start: "flat", end: "point" }, group });
  for (const [s] of SIDES) {
    fang(H.p([s * 0.27, -0.3, 0.9]), H.d([s * 0.08, -1, 0.15]), H.s(0.38), H.s(0.07), head, "head");
    for (let i = 0; i < 3; i++)
      fang(H.p([s * 0.35, -0.31, 0.72 - i * 0.14]), H.d([0, -1, 0]), H.s(0.1), H.s(0.045), head, "head");
  }
  for (let i = 0; i < 4; i++)
    fang(H.p([(i - 1.5) * 0.1, -0.31, 1.0]), H.d([0, -1, 0.1]), H.s(0.09), H.s(0.035), head, "head");

  // Lower jaw on its own joint.
  const jawAim = H.p([0, -0.48, 1.0]);
  const jaw = b.joint("jaw", { parent: head, at: H.p([0, -0.32, 0.08]), aim: jawAim, role: "jaw", group: "jaw" });
  const J = b.region({ at: jaw, quat: aim(jawAim.clone().sub(jaw.at), [0, 1, 0], "z"), scale: 1.28 });
  b.loft(
    [
      { at: J.p([0, -0.02, 0.0]), w: H.s(0.92), h: H.s(0.3) },
      { at: J.p([0, -0.04, 0.5]), w: H.s(0.8), h: H.s(0.26) },
      { at: J.p([0, -0.04, 0.92]), w: H.s(0.6), h: H.s(0.22) },
    ],
    { bone: jaw, color: LION, sectors: [[120, 240, CREAM]], ...facet(8), group: "jaw", name: "jawLion" },
  );
  b.frustumBox(J.p([0, 0.08, 0.1]), J.p([0, 0.08, 0.86]), [H.s(0.7), H.s(0.06)], [H.s(0.46), H.s(0.05)], {
    bone: jaw,
    color: TONGUE,
    group: "jaw",
  });
  for (const [s] of SIDES) {
    fang(J.p([s * 0.23, 0.08, 0.86]), J.d([s * 0.1, 1, 0.1]), H.s(0.26), H.s(0.055), jaw, "jaw");
    for (let i = 0; i < 3; i++)
      fang(J.p([s * 0.31, 0.08, 0.68 - i * 0.15]), J.d([0, 1, 0]), H.s(0.09), H.s(0.04), jaw, "jaw");
  }
  // Chin beard tuft.
  for (const [dx, len] of [
    [-0.14, 0.42],
    [0.0, 0.55],
    [0.14, 0.42],
  ])
    b.extrude(flame(H.s(len), H.s(0.11)), {
      at: J.p([dx, -0.12, 0.7]),
      x: J.d([1, 0, 0]),
      y: J.d([0, -1, -0.45]),
      thickness: H.s(0.1),
      bevel: H.s(0.03),
      detail: 0.34,
      bone: jaw,
      color: dx === 0 ? MANE_L : MANE,
      group: "jaw",
    });

  // Eyes: dark socket plate, glowing almond, slit pupil; sizes in the head's own units.
  const eye = (R: typeof H, bone: Joint, s: number, at: V3, n: V3, len: number, ht: number, group: string) => {
    const normal = R.d(n).normalize();
    const up = R.d([0, 1, 0]);
    const x = new THREE.Vector3().crossVectors(up, normal).multiplyScalar(s).normalize();
    const c = R.p(at);
    const [l, h] = [R.s(len), R.s(ht)];
    b.extrude(almond(l * 1.35, h * 1.6), { at: c, x, y: up, thickness: R.s(0.05), bone, color: CHAR, group });
    glow(
      b.extrude(almond(l, h), {
        at: offset(c, normal, R.s(0.03)),
        x,
        y: up,
        thickness: R.s(0.04),
        bone,
        color: GLOW,
        group,
      }),
      1.6,
    );
    glow(
      b.extrude(
        [
          [-l * 0.05, -h * 0.42],
          [l * 0.05, -h * 0.42],
          [l * 0.05, h * 0.42],
          [-l * 0.05, h * 0.42],
        ],
        { at: offset(c, normal, R.s(0.055)), x, y: up, thickness: R.s(0.02), bone, color: GLOW_CORE, group },
      ),
      2,
    );
    return { c, normal, x, up };
  };
  for (const [s, side] of SIDES) {
    const e = eye(H, head, s, [s * 0.42, 0.2, 0.5], [s * 0.55, 0.15, 0.8], 0.24, 0.13, "head");
    b.extrude(
      [
        [-0.2, -0.05, "sharp"],
        [0.24, 0.02, "sharp"],
        [0.22, 0.13, "sharp"],
        [-0.16, 0.08, "sharp"],
      ].map(([x, y, c]) => [H.s(x as number), H.s(y as number), c] as OutlinePoint),
      {
        at: offset(offset(e.c, e.up, H.s(0.12)), e.normal, H.s(0.04)),
        x: e.x.clone().addScaledVector(e.up, 0.3),
        y: e.up.clone().addScaledVector(e.normal, 0.8),
        thickness: H.s(0.1),
        bevel: H.s(0.03),
        detail: 0.34,
        bone: head,
        color: LION_D,
        group: "head",
        name: `brow${side}`,
      },
    );
    // Pale cheek tufts flaring out below the eyes.
    for (let k = 0; k < 3; k++)
      b.extrude(flame(H.s(0.36 - k * 0.05), H.s(0.1)), {
        at: H.p([s * 0.5, -0.12 - k * 0.12, 0.42 - k * 0.05]),
        x: H.d([0, 0.3, 1]),
        y: H.d([s, -0.2 - k * 0.35, -0.35]),
        thickness: H.s(0.08),
        bevel: H.s(0.02),
        detail: 0.34,
        bone: head,
        color: k === 1 ? LION_L : CREAM,
        group: "head",
      });
    // Ears on hinge joints, poking out of the mane.
    const earBase = H.p([s * 0.38, 0.5, -0.12]);
    const earTip = H.p([s * 0.68, 1.05, -0.25]);
    const ear = b.joint(`ear${side}`, { parent: head, at: earBase, aim: earTip, role: "hinge", group: "head" });
    const earX = H.d([s * -0.85, 0.35, 0.1]).multiplyScalar(s);
    b.extrude(leaf(H.s(0.62), H.s(0.22)), {
      at: ear,
      x: earX,
      y: earTip.clone().sub(earBase),
      thickness: H.s(0.09),
      bevel: H.s(0.025),
      detail: 0.34,
      bone: ear,
      color: LION,
      group: "head",
    });
    b.extrude(leaf(H.s(0.42), H.s(0.12)), {
      at: offset(ear, H.d([0, 0, 1]), H.s(0.05)),
      x: earX,
      y: earTip.clone().sub(earBase),
      thickness: H.s(0.06),
      bone: ear,
      color: CHAR_L,
      group: "head",
    });
    // Gold rings through the left ear.
    if (s > 0)
      for (const u of [0.25, 0.4])
        b.part(new THREE.TorusGeometry(H.s(0.07), H.s(0.02), 4, 8), GOLD, {
          bone: ear,
          at: offset(earBase, earTip.clone().sub(earBase).normalize(), H.s(u)).addScaledVector(
            H.d([1, 0, 0]),
            H.s(0.15),
          ),
          dir: H.d([0, 0, 1]),
          axis: "z",
          flat: true,
          group: "head",
        });
  }
  // A glowing rune on the brow, between the dark forehead chevrons.
  glow(
    b.decal(cranium, RUNE_TEX, {
      at: H.p([0, 0.55, 0.3]),
      dir: H.d([0, 0.8, 1]),
      size: [H.s(0.22), H.s(0.22)],
      lift: 0.01,
      bone: head,
      group: "head",
    }),
    1.5,
  );
  // A claw scar across the right eye.
  b.decal([cranium, muzzle], SCAR_TEX, {
    at: H.p([-0.44, 0.15, 0.6]),
    dir: H.d([-0.7, 0.2, 0.7]),
    size: [H.s(0.5), H.s(0.5)],
    roll: -15,
    group: "head",
  });

  // ---- Mane: three rings of flame locks round the face, then rows of locks down the neck to the shoulders -------
  const maneColors = [MANE_L, MANE, MANE_D];
  const ruff = [
    { z: 0.14, radius: 0.55, count: 18, tilt: 14, len: 0.5, w: 0.17 },
    { z: -0.08, radius: 0.58, count: 16, tilt: 28, len: 0.72, w: 0.22 },
    { z: -0.3, radius: 0.6, count: 15, tilt: 44, len: 0.85, w: 0.25 },
    { z: -0.5, radius: 0.56, count: 13, tilt: 60, len: 0.85, w: 0.27 },
  ];
  ruff.forEach((L, li) => {
    const centre = H.p([0, 0.04, L.z]);
    b.ring(
      frame(centre, H.d([0, 0, -1])),
      {
        count: L.count,
        radius: H.s(L.radius),
        tilt: L.tilt,
        fromDeg: (li * 180) / L.count,
        toDeg: 360 + (li * 180) / L.count,
      },
      (item) => {
        const lift = item.i % 2 ? 1.1 : 0.9;
        b.extrude(flame(H.s(L.len * lift), H.s(L.w)), {
          at: item,
          x: item.dir([1, 0, 0]),
          y: item.axis,
          thickness: H.s(0.1),
          bevel: H.s(0.03),
          detail: 0.34,
          bone: head,
          color: li === 0 ? (item.i % 2 ? MANE_L : LION_D) : maneColors[(li + item.i) % 3 === 0 ? 0 : li % 3],
          group: "mane",
        });
      },
    );
  });
  // Neck locks, shingled back toward the shoulders.
  for (let row = 0; row < 6; row++) {
    const t = 0.97 - row * ((0.97 - neckT + 0.02) / 5);
    const count = 11;
    for (let i = 0; i < count; i++) {
      const deg = ((i + (row % 2) * 0.5) * 360) / count;
      const p = body.at(t, deg);
      const len = 0.8 + 0.25 * (row / 5) + 0.1 * r();
      plate(p, p.tangent.negate(), flame(len, 0.26), 0.12, maneColors[(row + i) % 3], 0.02, 40 - row * 3, "mane");
    }
  }

  // ================================================================================================================
  // Goat neck and head, rising from the middle of the back
  // ================================================================================================================
  const goatRoot = skin.ray([0, 7, -0.95], [0, -1, 0]);
  if (!goatRoot) throw new Error("chimera: no back under the goat neck");
  const GOAT_END = v3(0.35, 7.0, -0.4);
  const goatNeck = b.sprout(
    "goatNeck",
    goatRoot,
    catmull([goatRoot.at, v3(0.05, 5.2, -1.15), v3(0.2, 6.2, -1.0), GOAT_END]),
    [0.5, 0.36],
    { names: ["goatNeck1", "goatNeck2", "goatNeck3"], role: "neck", color: GOAT, ...facet(7), group: "goat" },
  );
  const goatDir: V3 = [0, -0.35, 1];
  const goatHead = b.joint("goatHead", {
    parent: goatNeck.chain!.joints[2],
    at: GOAT_END,
    dir: goatDir,
    role: "head",
    group: "goat",
  });
  const G = b.region({ at: goatHead, quat: aim(goatDir, [0, 1, 0], "z"), scale: 1.4 });
  b.loft(
    [
      { at: G.p([0, 0.05, -0.22]), w: G.s(0.5), h: G.s(0.5) },
      { at: G.p([0, 0.06, 0.08]), w: G.s(0.56), h: G.s(0.5) },
      { at: G.p([0, -0.04, 0.42]), w: G.s(0.4), h: G.s(0.36) },
      { at: G.p([0, -0.1, 0.72]), w: G.s(0.3), h: G.s(0.25) },
    ],
    { bone: goatHead, color: GOAT, sectors: [[-40, 40, GOAT_L]], ...facet(6), group: "goat", name: "goatSkull" },
  );
  // Dark face blaze down the nose and the nose pad.
  b.frustumBox(G.p([0, 0.24, 0.12]), G.p([0, 0.03, 0.78]), [G.s(0.12), G.s(0.06)], [G.s(0.1), G.s(0.05)], {
    bone: goatHead,
    color: GOAT_D,
    group: "goat",
  });
  b.extrude(
    [
      [-G.s(0.08), G.s(0.03), "sharp"],
      [G.s(0.08), G.s(0.03), "sharp"],
      [G.s(0.05), -G.s(0.05), "sharp"],
      [-G.s(0.05), -G.s(0.05), "sharp"],
    ],
    {
      at: G.p([0, -0.05, 0.84]),
      x: G.d([1, 0, 0]),
      y: G.d([0, 1, 0.3]),
      thickness: G.s(0.06),
      bone: goatHead,
      color: CHAR,
      group: "goat",
    },
  );
  b.frustumBox(G.p([0, -0.2, 0.2]), G.p([0, -0.2, 0.74]), [G.s(0.3), G.s(0.04)], [G.s(0.2), G.s(0.04)], {
    bone: goatHead,
    color: MOUTH,
    group: "goat",
  });
  const goatJawAim = G.p([0, -0.27, 0.7]);
  const goatJaw = b.joint("goatJaw", {
    parent: goatHead,
    at: G.p([0, -0.15, 0.12]),
    aim: goatJawAim,
    role: "jaw",
    group: "goat",
  });
  const GJ = b.region({ at: goatJaw, quat: aim(goatJawAim.clone().sub(goatJaw.at), [0, 1, 0], "z"), scale: 1.4 });
  b.loft(
    [
      { at: GJ.p([0, 0, 0]), w: G.s(0.32), h: G.s(0.14) },
      { at: GJ.p([0, -0.01, 0.55]), w: G.s(0.22), h: G.s(0.1) },
    ],
    { bone: goatJaw, color: GOAT_D, ...facet(6), group: "goat" },
  );
  for (let i = 0; i < 4; i++)
    fang(GJ.p([(i - 1.5) * 0.04, 0.04, 0.53]), GJ.d([0, 1, 0.3]), G.s(0.05), G.s(0.018), goatJaw, "goat");
  // Goat beard: long pointed locks hanging from the chin.
  for (const [dx, len] of [
    [-0.06, 0.4],
    [0, 0.6],
    [0.06, 0.4],
  ])
    b.extrude(flame(G.s(len), G.s(0.07)), {
      at: GJ.p([dx, -0.05, 0.4]),
      x: GJ.d([1, 0, 0]),
      y: v3(0, -1, -0.15),
      thickness: G.s(0.06),
      bevel: G.s(0.02),
      detail: 0.34,
      bone: goatJaw,
      color: dx === 0 ? GOAT_L : GOAT,
      group: "goat",
    });
  for (const [s, side] of SIDES) {
    eye(G, goatHead, s, [s * 0.22, 0.1, 0.2], [s * 0.75, 0.1, 0.55], 0.12, 0.07, "goat");
    // Drooping ears.
    const earBase = G.p([s * 0.24, 0.12, -0.08]);
    const earTip = G.p([s * 0.62, -0.05, -0.18]);
    const ear = b.joint(`goatEar${side}`, { parent: goatHead, at: earBase, aim: earTip, role: "hinge", group: "goat" });
    b.extrude(leaf(G.s(0.42), G.s(0.1)), {
      at: ear,
      x: G.d([0, 0, 1]),
      y: earTip.clone().sub(earBase),
      thickness: G.s(0.05),
      bevel: G.s(0.015),
      detail: 0.34,
      bone: ear,
      color: GOAT_L,
      group: "goat",
    });
    b.extrude(leaf(G.s(0.28), G.s(0.055)), {
      at: offset(ear, G.d([0, -1, 0]), G.s(0.025)),
      x: G.d([0, 0, 1]),
      y: earTip.clone().sub(earBase),
      thickness: G.s(0.03),
      bone: ear,
      color: MOUTH,
      group: "goat",
    });
    // Long ridged horns sweeping back, gold rings near the base.
    const hb = G.p([s * 0.15, 0.24, 0.0]);
    const hornPath = bezier(
      hb,
      G.p([s * 0.28, 0.85, -0.05]),
      G.p([s * 0.45, 1.2, -0.75]),
      G.p([s * 0.62, 0.75, -1.25]),
    );
    const ridges: [number, string][] = [];
    for (let k = 1; k <= 16; k++) ridges.push([k / 16, k % 2 ? HORN : HORN_D]);
    b.sweep(hornPath, (t) => G.s(0.15 * (1 - t) + 0.015), {
      bone: goatHead,
      bands: ridges,
      section: { ngon: 5 },
      caps: { start: "flat", end: "point" },
      group: "goat",
      name: `goatHorn${side}`,
    });
    for (const u of [0.14, 0.24]) {
      const rr = G.s(0.15 * (1 - u) + 0.03);
      b.lathe(
        [
          [rr - G.s(0.03), -G.s(0.03)],
          [rr, -G.s(0.03)],
          [rr, G.s(0.03)],
          [rr - G.s(0.03), G.s(0.03)],
        ],
        {
          at: hornPath.at(u),
          axis: hornPath.tangentAt(u),
          segments: 6,
          bone: goatHead,
          color: u < 0.2 ? GOLD : GOLD_D,
          group: "goat",
        },
      );
    }
  }
  // A glowing rune on the goat's brow.
  glow(
    b.part(new THREE.PlaneGeometry(G.s(0.2), G.s(0.2)), "#ffffff", {
      bone: goatHead,
      at: G.p([0, 0.33, 0.1]),
      dir: G.d([0, 1, 0.4]),
      up: G.d([0, 0, 1]),
      axis: "z",
      texture: RUNE_TEX,
      group: "goat",
    }),
    1.5,
  );
  // Shaggy ash ruff where the goat neck grows from the lion's back, a crest down its nape and locks down its throat.
  b.ring(frame(goatRoot.moved([0, 0.2, 0]), [0, 1, 0]), { count: 13, radius: 0.5, tilt: -50 }, (item) =>
    b.extrude(flame(0.6 + 0.15 * (item.i % 2), 0.18), {
      at: item,
      x: item.dir([1, 0, 0]),
      y: item.axis,
      thickness: 0.09,
      bevel: 0.025,
      detail: 0.34,
      color: item.i % 2 ? GOAT : GOAT_L,
      group: "goat",
    }),
  );
  for (let row = 0; row < 5; row++)
    for (let i = -3; i <= 3; i++) {
      const p = goatNeck.sweep.at(0.25 + row * 0.14, 180 + i * 28);
      plate(p, v3(0, -1, 0), flame(0.4, 0.12), 0.06, (row + i) % 2 ? GOAT : GOAT_D, 0.01, 30, "goat");
    }
  for (let k = 0; k < 7; k++) {
    const p = goatNeck.sweep.at(0.2 + k * 0.11, 0);
    plate(p, v3(0, -1, -0.4), flame(0.45, 0.13), 0.07, k % 2 ? GOAT_L : GOAT, 0.01, 35, "goat");
  }

  // ================================================================================================================
  // Serpent tail: a long chain arching up over the back to a hooded viper head
  // ================================================================================================================
  const tailPath = catmull([
    v3(0, 3.3, -3.0),
    v3(-0.1, 3.0, -4.4),
    v3(-0.4, 3.4, -5.8),
    v3(-0.9, 4.8, -6.7),
    v3(-1.35, 6.6, -6.8),
    v3(-1.55, 7.9, -6.1),
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, count: 12, role: "tail", group: "tail" });
  const scutes = paint((_p, _n, s) => (Math.floor(s[0] * 70) % 2 ? BONE : BONE_L));
  const tailTube = b.sweep(tail, (t) => 0.55 - 0.33 * Math.pow(t, 0.8), {
    bands: [
      [0.1, LION],
      [0.14, MANE],
      [1, TEAL],
    ],
    sectors: [
      [-35, 35, TEAL_D, 0.14, 1],
      [140, 220, scutes, 0.14, 1],
      [-38, 38, LION_L, 0, 0.1],
      [140, 220, CREAM, 0, 0.1],
    ],
    ...facet(8),
    caps: { start: "round", end: "flat" },
    group: "tail",
  });
  b.along(
    tailTube,
    16,
    (at) => {
      const back = at.tangent.negate();
      plate(at, back, shield(0.42, 0.2), 0.08, TEAL_L, 0.02, 10, "tail");
      b.spike(at.moved([0, 0.04, 0]), at.axis.clone().addScaledVector(back, 0.6), 0.32, 0.08, {
        color: BONE,
        ...facet(4),
        caps: { start: "flat", end: "point" },
        group: "tail",
      });
    },
    { from: 0.16, to: 0.9 },
  );

  // Serpent head.
  const snakeDir: V3 = [0.12, -0.12, 1];
  const snake = b.joint("snakeHead", {
    parent: tail.joints[11],
    at: tailPath.at(1),
    dir: snakeDir,
    role: "head",
    group: "snake",
  });
  const S = b.region({ at: snake, quat: aim(snakeDir, [0, 1, 0], "z"), scale: 1.55 });
  const snakeSkull = b.loft(
    [
      { at: S.p([0, 0.0, -0.18]), w: S.s(0.5), h: S.s(0.42) },
      { at: S.p([0, 0.04, 0.2]), w: S.s(0.66), h: S.s(0.4) },
      { at: S.p([0, 0.0, 0.58]), w: S.s(0.46), h: S.s(0.28) },
      { at: S.p([0, -0.03, 0.85]), w: S.s(0.3), h: S.s(0.18) },
    ],
    { bone: snake, color: TEAL, sectors: [[-45, 45, TEAL_L]], ...facet(6), group: "snake", name: "snakeSkull" },
  );
  b.frustumBox(S.p([0, -0.12, 0.05]), S.p([0, -0.12, 0.8]), [S.s(0.5), S.s(0.05)], [S.s(0.24), S.s(0.04)], {
    bone: snake,
    color: MOUTH,
    group: "snake",
  });
  // Head scales: a row of pale shields down the crown.
  const crown = b.surface(snakeSkull);
  for (let k = 0; k < 4; k++) {
    const hit = crown.ray(S.p([0, 1, 0.7 - k * 0.2]), S.d([0, -1, 0]));
    if (hit)
      plate(
        hit,
        S.d([0, 0, -1]),
        shield(S.s(0.22), S.s(0.1 + k * 0.015)),
        S.s(0.03),
        k % 2 ? TEAL_XL : TEAL_L,
        0.005,
        6,
        "snake",
        snake,
      );
  }
  for (const [s] of SIDES) {
    fang(S.p([s * 0.12, -0.1, 0.78]), S.d([0, -1, 0.25]), S.s(0.3), S.s(0.04), snake, "snake");
    for (let i = 0; i < 3; i++)
      fang(S.p([s * 0.2, -0.1, 0.6 - i * 0.14]), S.d([0, -1, 0]), S.s(0.06), S.s(0.025), snake, "snake");
    b.part(new THREE.IcosahedronGeometry(S.s(0.025), 0), CHAR, {
      bone: snake,
      at: S.p([s * 0.09, 0.04, 0.95]),
      flat: true,
      group: "snake",
    });
  }
  const snakeJawAim = S.p([0, -0.24, 0.82]);
  const snakeJaw = b.joint("snakeJaw", {
    parent: snake,
    at: S.p([0, -0.14, -0.05]),
    aim: snakeJawAim,
    role: "jaw",
    group: "snake",
  });
  const SJ = b.region({ at: snakeJaw, quat: aim(snakeJawAim.clone().sub(snakeJaw.at), [0, 1, 0], "z"), scale: 1.55 });
  b.loft(
    [
      { at: SJ.p([0, 0, 0]), w: S.s(0.48), h: S.s(0.14) },
      { at: SJ.p([0, 0, 0.85]), w: S.s(0.24), h: S.s(0.1) },
    ],
    { bone: snakeJaw, color: BONE, sectors: [[-50, 50, TEAL]], ...facet(6), group: "snake", name: "snakeJawBone" },
  );
  for (const [s] of SIDES)
    fang(SJ.p([s * 0.09, 0.05, 0.75]), SJ.d([0, 1, 0.1]), S.s(0.1), S.s(0.025), snakeJaw, "snake");
  // Forked tongue.
  b.extrude(
    [
      [-0.03, 0, "sharp"],
      [0.03, 0, "sharp"],
      [0.03, 0.4, "sharp"],
      [0.09, 0.62, "sharp"],
      [0.0, 0.46, "sharp"],
      [-0.09, 0.62, "sharp"],
      [-0.03, 0.4, "sharp"],
    ].map(([x, y, c]) => [S.s(x as number), S.s(y as number), c] as OutlinePoint),
    {
      at: SJ.p([0, 0.06, 0.5]),
      x: SJ.d([1, 0, 0]),
      y: SJ.d([0, 0.25, 1]),
      thickness: S.s(0.025),
      bone: snakeJaw,
      color: TONGUE,
      group: "snake",
    },
  );
  for (const [s, side] of SIDES) {
    eye(S, snake, s, [s * 0.25, 0.1, 0.38], [s * 0.75, 0.3, 0.45], 0.14, 0.07, "snake");
    // Swept-back brow horns and a smaller pair behind them.
    b.sweep(
      bezier(S.p([s * 0.2, 0.15, 0.3]), S.p([s * 0.28, 0.32, 0.0]), S.p([s * 0.36, 0.38, -0.45])),
      [S.s(0.07), 0],
      {
        bone: snake,
        color: BONE,
        ...facet(4),
        caps: { start: "flat", end: "point" },
        group: "snake",
        name: `snakeHorn${side}`,
      },
    );
    b.sweep(
      bezier(S.p([s * 0.24, 0.05, 0.0]), S.p([s * 0.34, 0.12, -0.2]), S.p([s * 0.42, 0.1, -0.42])),
      [S.s(0.045), 0],
      {
        bone: snake,
        color: BONE_L,
        ...facet(4),
        caps: { start: "flat", end: "point" },
        group: "snake",
      },
    );
    // Hood: a ribbed fan each side of the neck behind the head, a gold eye-spot on each face.
    const hood = b.extrude(
      [
        [0, -0.25, "sharp"],
        [0.35, -0.3, "sharp"],
        [0.85, 0.0, "sharp"],
        [0.75, 0.35, "sharp"],
        [0.5, 0.45, "sharp"],
        [0, 0.3, "sharp"],
      ].map(([x, y, c]) => [S.s(x as number), S.s(y as number), c] as OutlinePoint),
      {
        at: S.p([s * 0.12, 0.0, -0.35]),
        x: S.d([s, 0.15, -0.35]),
        y: S.d([0, 1, -0.25]),
        thickness: S.s(0.06),
        bevel: S.s(0.02),
        detail: 0.34,
        bone: snake,
        color: TEAL_D,
        group: "snake",
        name: `hood${side}`,
      },
    );
    for (const [u, v] of [
      [0.82, 0.05],
      [0.7, 0.34],
      [0.45, 0.42],
    ])
      b.rod(hood.local([S.s(0.05), 0.0, 0]), hood.local([S.s(u), S.s(v), 0]), S.s(0.03), {
        bone: snake,
        color: BONE,
        ...facet(4),
        group: "snake",
      });
    for (const z of [1, -1]) {
      b.extrude(
        [
          [0.32, -0.1, "sharp"],
          [0.55, -0.06, "sharp"],
          [0.52, 0.2, "sharp"],
          [0.32, 0.18, "sharp"],
        ].map(([x, y, c]) => [S.s(x as number), S.s(y as number), c] as OutlinePoint),
        {
          at: hood.local([0, 0, S.s(0.035) * z]),
          x: hood.dir([1, 0, 0]),
          y: hood.dir([0, 1, 0]),
          thickness: S.s(0.02),
          bone: snake,
          color: GOLD,
          group: "snake",
        },
      );
      b.extrude(
        [
          [0.39, 0.0, "sharp"],
          [0.48, 0.01, "sharp"],
          [0.46, 0.11, "sharp"],
          [0.39, 0.1, "sharp"],
        ].map(([x, y, c]) => [S.s(x as number), S.s(y as number), c] as OutlinePoint),
        {
          at: hood.local([0, 0, S.s(0.048) * z]),
          x: hood.dir([1, 0, 0]),
          y: hood.dir([0, 1, 0]),
          thickness: S.s(0.01),
          bone: snake,
          color: CHAR,
          group: "snake",
        },
      );
    }
  }

  // ================================================================================================================
  // Legs: column forelegs and lion hind legs, broad paws with four toes on digit chains and hooked claws
  // ================================================================================================================
  const lerpKeys = (keys: ReadonlyArray<readonly [number, number, number]>) => (t: number) => {
    const next = keys.findIndex((k) => k[0] > t);
    const i = next < 0 ? keys.length - 2 : Math.max(0, Math.min(next - 1, keys.length - 2));
    const [ta, xa, ya] = keys[i];
    const [tb, xb, yb] = keys[i + 1];
    const k = Math.min(Math.max((t - ta) / (tb - ta), 0), 1);
    const e = k * k * (3 - 2 * k);
    return [xa + (xb - xa) * e, ya + (yb - ya) * e] as const;
  };
  const paw = (
    s: number,
    side: string,
    leg: { joints: readonly Joint[] },
    heel: THREE.Vector3,
    fwd: number,
    group: string,
    scale: number,
  ) => {
    const pawJ = leg.joints[3];
    const c = v3(heel.x, 0, heel.z + 0.15 * fwd);
    b.lathe(
      [
        [0, 0],
        [0.5 * scale, 0],
        [0.54 * scale, 0.14],
        [0.44 * scale, 0.36],
        [0.22 * scale, 0.48],
        [0, 0.5],
      ],
      { at: c, segments: 8, spin: 22.5, bone: pawJ, color: LION, group, name: `paw${side}` },
    );
    // Pale pad band round the foot.
    b.lathe(
      [
        [0.47 * scale, 0],
        [0.55 * scale, 0],
        [0.56 * scale, 0.08],
        [0.48 * scale, 0.08],
      ],
      { at: c, segments: 8, spin: 22.5, bone: pawJ, color: LION_D, group },
    );
    [-42, -14, 14, 42].forEach((yaw, k) => {
      const a = (yaw * s + (fwd < 0 ? 180 : 0)) * DEG;
      const d = v3(Math.sin(a), 0, Math.cos(a));
      const root = c
        .clone()
        .addScaledVector(d, 0.28 * scale)
        .setY(0.22);
      const knuckle = c
        .clone()
        .addScaledVector(d, 0.52 * scale)
        .setY(0.2);
      const end = c
        .clone()
        .addScaledVector(d, 0.7 * scale)
        .setY(0.15);
      const toe = b.chain(`toe${k + 1}${side}`, [root, knuckle, end], {
        parent: pawJ,
        names: [`toe${k + 1}a${side}`, `toe${k + 1}b${side}`],
        role: "digit",
        group,
      });
      b.sweep(toe, [0.17 * scale, 0.15 * scale], { color: k % 3 ? LION : LION_L, ...facet(6), group });
      const tip = end.clone().addScaledVector(d, 0.32).setY(0.02);
      b.sweep(
        bezier(end.clone().addScaledVector(d, 0.02).setY(0.2), end.clone().addScaledVector(d, 0.26).setY(0.22), tip),
        [0.08, 0],
        {
          bone: toe.joints[1],
          color: BONE_L,
          ...facet(5),
          caps: { start: "flat", end: "point" },
          group,
        },
      );
    });
  };

  for (const [s, side] of SIDES) {
    // Foreleg.
    const g = `legF${side}`;
    const fore = b.chain(
      g,
      [
        v3(s * 1.0, 3.25, 1.3),
        v3(s * 1.2, 1.95, 0.8),
        v3(s * 1.25, 0.62, 1.15),
        v3(s * 1.25, 0.32, 1.4),
        v3(s * 1.25, 0.32, 1.85),
      ],
      {
        parent: chest,
        names: ["shoulder", "elbow", "wrist", "hand"].map((n) => n + side),
        role: "leg",
        contact: [s * 1.25, 0, 1.55],
        group: g,
      },
    );
    const [, f1, f2, f3] = fore.ts;
    const foreTube = b.sweep(
      fore,
      lerpKeys([
        [0, 0.62, 0.72],
        [f1, 0.42, 0.48],
        [f2, 0.33, 0.34],
        [f3, 0.34, 0.32],
      ]),
      {
        to: f3,
        color: LION,
        sectors: [[150, 210, LION_D]],
        ...facet(8),
        caps: { start: "round", end: "flat" },
        group: g,
      },
    );
    paw(s, side, fore, fore.at(f3).at, 1, g, 1);
    // Elbow tuft and spike, forearm bracer with a gold shackle and a broken chain.
    plate(foreTube.at(f1 + 0.02, 180), v3(0, -0.6, -1), flame(0.6, 0.2), 0.1, MANE, 0.02, 30, g);
    b.spike(foreTube.at(f1, 180), foreTube.at(f1, 180), 0.45, 0.12, {
      color: BONE,
      ...facet(4),
      caps: { start: "flat", end: "point" },
      group: g,
    });
    const cuffAt = fore.at(f1 + (f2 - f1) * 0.82);
    b.lathe(
      [
        [0.3, -0.16],
        [0.42, -0.16],
        [0.44, -0.1],
        [0.44, 0.1],
        [0.42, 0.16],
        [0.3, 0.16],
      ],
      {
        at: cuffAt,
        axis: cuffAt.axis,
        segments: 8,
        spin: 22.5,
        bone: fore.joints[1],
        color: GOLD,
        group: g,
        name: `shackle${side}`,
      },
    );
    b.lathe(
      [
        [0.3, -0.06],
        [0.46, -0.06],
        [0.46, 0.06],
        [0.3, 0.06],
      ],
      { at: cuffAt, axis: cuffAt.axis, segments: 8, spin: 22.5, bone: fore.joints[1], color: GOLD_D, group: g },
    );
    const chainStart = offset(cuffAt.at, v3(s, 0, 0), 0.47);
    for (let k = 0; k < 5; k++) {
      const at = v3(chainStart.x + s * 0.02 * k, chainStart.y - 0.06 - k * 0.16, chainStart.z + 0.04 * k);
      b.part(
        new THREE.TorusGeometry(0.1, 0.035, 3, 6, k === 4 ? Math.PI * 1.4 : Math.PI * 2),
        k === 4 ? HORN_D : CHAR_L,
        {
          bone: fore.joints[1],
          at,
          dir: k % 2 ? v3(0, 0, 1) : v3(1, 0, 0),
          up: v3(0, 1, 0),
          axis: "z",
          scale: [0.8, 1.3, 1],
          flat: true,
          group: g,
        },
      );
    }
    // Forearm armour plates over the bracer.
    for (let k = 0; k < 3; k++) {
      const p = foreTube.at(f1 + (f2 - f1) * (0.2 + k * 0.2), 0);
      plate(p, p.tangent, shield(0.42, 0.26), 0.08, k % 2 ? TEAL : TEAL_L, 0.02, 6, g, fore.joints[1]);
    }

    // Hind leg.
    const h = `legH${side}`;
    const hind = b.chain(
      h,
      [
        v3(s * 0.9, 3.2, -2.75),
        v3(s * 1.05, 2.05, -2.15),
        v3(s * 1.05, 0.95, -3.05),
        v3(s * 1.05, 0.3, -2.85),
        v3(s * 1.05, 0.3, -2.4),
      ],
      {
        parent: hips,
        names: ["hip", "knee", "ankle", "foot"].map((n) => n + side),
        role: "leg",
        contact: [s * 1.05, 0, -2.7],
        group: h,
      },
    );
    const [, h1, h2, h3] = hind.ts;
    const hindTube = b.sweep(
      hind,
      lerpKeys([
        [0, 0.7, 0.85],
        [h1, 0.4, 0.46],
        [h2, 0.26, 0.3],
        [h3, 0.3, 0.3],
      ]),
      {
        to: h3,
        color: LION,
        sectors: [[150, 210, LION_D]],
        ...facet(8),
        caps: { start: "round", end: "flat" },
        group: h,
      },
    );
    paw(s, side.toLowerCase() === "l" ? "HL" : "HR", hind, hind.at(h3).at, 1, h, 0.9);
    const kneeP = hindTube.at(h1, 0);
    plate(kneeP, v3(0, -1, 0.2), shield(0.55, 0.3), 0.1, TEAL, 0.02, 12, h, hind.joints[1]);
    b.spike(hindTube.at(h2 - 0.02, 0), hindTube.at(h2 - 0.02, 0), 0.35, 0.1, {
      color: BONE,
      ...facet(4),
      caps: { start: "flat", end: "point" },
      group: h,
    });
    // Crimson feathering down the back of the shin and the cannon, teal scales over the outer thigh.
    for (let k = 0; k < 3; k++) {
      const p = hindTube.at(h1 + (h2 - h1) * (0.3 + k * 0.2), (k - 1) * 30);
      plate(p, v3(0, -1, -0.3), flame(0.5 - k * 0.05, 0.16), 0.08, maneColors[k], 0.02, 28, h);
    }
    for (let k = 0; k < 2; k++) {
      const p = hindTube.at(h2 + (h3 - h2) * (0.3 + k * 0.35), 180 + (k - 0.5) * 40);
      plate(p, v3(0, -1, -0.2), flame(0.42, 0.15), 0.08, maneColors[k + 1], 0.02, 30, h);
    }
    const thigh = b.surface(hindTube);
    for (let k = 0; k < 3; k++) {
      const p = thigh.ray(v3(s * 3, 2.95 - k * 0.3, -2.55 + k * 0.12), v3(-s, 0, 0));
      if (p) plate(p, v3(0, -1, 0), shield(0.5, 0.24), 0.08, k % 2 ? TEAL_L : TEAL, 0.02, 8, h, hind.joints[0]);
    }

    // Shoulder pauldron with a glowing rune.
    const sh = skin.ray(v3(s * 3, 3.9, 1.2), v3(-s, 0, 0));
    if (!sh) throw new Error("chimera: no shoulder");
    const pauld = plate(sh, v3(0, -1, -0.3), shield(1.1, 0.55), 0.14, TEAL, 0.05, 10, "armour", chest);
    plate(sh.moved([0, 0.0, 0]), v3(0, -1, -0.3), shield(0.8, 0.38), 0.08, TEAL_L, 0.14, 11, "armour", chest);
    glow(
      b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", {
        bone: chest,
        at: offset(pauld.local([0, 0.45, 0]), sh.axis, 0.22),
        dir: sh.axis,
        up: v3(0, 1, 0),
        axis: "z",
        texture: RUNE_TEX,
        group: "armour",
      }),
      1.5,
    );
  }

  // ================================================================================================================
  // Wings: arm chain, four finger chains from the wrist, membranes between them and down to the flank
  // ================================================================================================================
  // Membrane bands in flat colour: dark finger edges and a centre vein, a dark contour arc, a pale trailing band.
  const wingPaint = paint((_p, _n, s) => {
    const [along, across] = s;
    if (across < 0.06 || across > 0.94) return WING_D;
    if (Math.abs(across - 0.5) < 0.022 && along > 0.15) return WING_D;
    if (along > 0.86) return WING_L;
    if (along > 0.6 && along < 0.635) return WING_D;
    return along < 0.25 ? WING_D : WING;
  });
  for (const [s, side] of SIDES) {
    const g = `wing${side}`;
    const arm = b.chain(g, [v3(s * 0.75, 4.35, 0.85), v3(s * 2.6, 5.55, 0.15), v3(s * 4.6, 6.65, 0.6)], {
      parent: chest,
      names: [`wingShoulder${side}`, `wingElbow${side}`, `wingWrist${side}`],
      role: "wing",
      group: g,
    });
    b.sweep(arm, [0.3, 0.17], { color: TEAL, sectors: [[-40, 40, TEAL_L]], ...facet(7), group: g });
    const wrist = arm.joints[2];
    b.part(new THREE.IcosahedronGeometry(0.24, 0), TEAL_L, { bone: wrist, at: wrist.at, flat: true, group: g });
    b.lathe(
      [
        [0.15, -0.08],
        [0.22, -0.08],
        [0.22, 0.08],
        [0.15, 0.08],
      ],
      { at: arm.at(0.8), axis: arm.at(0.8).axis, segments: 6, bone: arm.joints[1], color: GOLD, group: g },
    );
    // Leading-edge spikes along the forearm.
    for (let k = 0; k < 4; k++) {
      const p = arm.at(0.55 + k * 0.1);
      b.spike(p.at, v3(0, 1, 0.4), 0.35 - k * 0.04, 0.08, {
        bone: arm.joints[1],
        color: BONE,
        ...facet(4),
        caps: { start: "flat", end: "point" },
        group: g,
      });
    }
    // A hooked horn on the elbow, a gold-trimmed plate over the humerus.
    const elbow = arm.joints[1];
    b.sweep(
      bezier(elbow.at, offset(elbow.at, v3(s * 0.1, 0.25, -0.5), 1), offset(elbow.at, v3(s * 0.3, -0.05, -1.0), 1)),
      [0.16, 0],
      {
        bone: elbow,
        color: BONE,
        ...facet(5),
        caps: { start: "flat", end: "point" },
        group: g,
      },
    );
    const hum = arm.at(0.25);
    const humBase = offset(offset(hum.at, hum.normal, 0.16), hum.tangent, -0.5);
    b.extrude(shield(1.1, 0.24), {
      at: humBase,
      x: hum.binormal,
      y: hum.tangent,
      thickness: 0.07,
      bevel: 0.02,
      detail: 0.34,
      bone: arm.joints[0],
      color: TEAL_L,
      group: g,
    });
    b.extrude(shield(0.7, 0.13), {
      at: offset(offset(humBase, hum.normal, 0.05), hum.tangent, 0.12),
      x: hum.binormal,
      y: hum.tangent,
      thickness: 0.04,
      bone: arm.joints[0],
      color: GOLD,
      group: g,
    });
    // Thumb claw.
    const thumb = b.chain(`thumb${side}`, [wrist.at, offset(wrist.at, v3(s * 0.3, 0.55, 0.45), 1)], {
      parent: wrist,
      names: [`thumb${side}`],
      role: "digit",
      group: g,
    });
    b.sweep(thumb, [0.12, 0.06], { color: TEAL_D, ...facet(5), group: g });
    const thTip = thumb.at(1).at;
    b.sweep(bezier(thTip, offset(thTip, v3(0, 0.25, 0.15), 1), offset(thTip, v3(s * 0.1, 0.1, 0.45), 1)), [0.07, 0], {
      bone: thumb.joints[0],
      color: BONE_L,
      ...facet(4),
      caps: { start: "flat", end: "point" },
      group: g,
    });

    const tips = [v3(s * 8.3, 7.9, -0.2), v3(s * 8.4, 5.85, -1.9), v3(s * 7.2, 4.15, -3.0), v3(s * 5.3, 3.5, -3.05)];
    const fingers = tips.map((tip, i) => {
      const knuckle = lerp(wrist.at, tip, 0.45).add(v3(0, 0.12, 0.08));
      const fc = b.chain(`finger${i + 1}${side}`, [wrist.at, knuckle, tip], {
        parent: wrist,
        names: [`finger${i + 1}a${side}`, `finger${i + 1}b${side}`],
        role: "digit",
        group: g,
      });
      b.sweep(fc, [0.13, 0.05], { color: TEAL_D, ...facet(6), group: g });
      b.part(new THREE.IcosahedronGeometry(0.13, 0), TEAL_L, { bone: fc.joints[1], at: knuckle, flat: true, group: g });
      const dir = tip.clone().sub(knuckle).normalize();
      b.spike(tip, dir.add(v3(0, -0.4, 0)), 0.32, 0.06, {
        bone: fc.joints[1],
        color: BONE_L,
        ...facet(4),
        caps: { start: "flat", end: "point" },
        group: g,
      });
      return fc;
    });
    for (let i = 0; i < fingers.length - 1; i++)
      b.membrane(fingers[i], fingers[i + 1], { thickness: 0.04, color: wingPaint, scallop: 0.16, group: g });
    const flankFront = v3(s * 1.05, 3.9, -0.5);
    const flankBack = v3(s * 0.95, 3.75, -2.3);
    b.membrane(fingers[3], [wrist.at, flankFront, flankBack], {
      thickness: 0.04,
      color: wingPaint,
      scallop: 0.1,
      bone: spine.joints[1],
      group: g,
    });
    b.membrane(arm, [v3(s * 0.8, 4.1, 0.6), v3(s * 1.0, 4.0, 0.1), flankFront], {
      thickness: 0.04,
      color: WING,
      bone: chest,
      group: g,
    });
  }

  // ================================================================================================================
  // Body extras: a shaggy crimson belly fringe, scale armour over the haunches and gold bands where the serpent begins
  // ================================================================================================================
  for (let i = 0; i < 9; i++) {
    const t = curve.closestT(v3(0, 3.3, -1.9 + i * 0.3));
    for (const [s] of SIDES)
      for (const [deg, len] of [
        [160, 0.62],
        [180, 0.75],
      ] as const) {
        const p = body.at(t, s > 0 ? 360 - deg : deg);
        const k = 0.85 + 0.3 * Math.sin(i * 1.7 + deg);
        b.extrude(flame(len * k, 0.17), {
          at: p.moved([0, -0.05, 0]),
          x: v3(0, 0, s),
          y: v3(s * 0.25, -1, -0.45),
          thickness: 0.08,
          bevel: 0.025,
          detail: 0.34,
          color: maneColors[(i + (deg === 180 ? 1 : 0)) % 3],
          group: "body",
        });
      }
  }
  for (const [s] of SIDES)
    for (let row = 0; row < 3; row++)
      for (let i = 0; i < 4 - (row === 2 ? 1 : 0); i++) {
        const t = curve.closestT(v3(0, 3.3, -3.25 + i * 0.42 + (row % 2) * 0.21));
        const p = body.at(t, s * -(55 + row * 24));
        plate(p, v3(0, -1, -0.5), shield(0.68, 0.3), 0.09, (row + i) % 2 ? TEAL : TEAL_L, 0.02, 8, "armour");
      }
  // A war-harness girth behind the forelegs: a dark strap round the barrel, gold studs and a square gold buckle.
  const girthRing: THREE.Vector3[] = [];
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    girthRing.push(v3(Math.sin(a) * 1.6, 3.3 + Math.cos(a) * 1.6, -0.55));
  }
  const girth = skin.drape(catmull(girthRing, { closed: true }), { lift: 0.02 });
  b.sweep(girth, () => [0.17, 0.045], { section: "box", up: [0, 1, 0], color: HORN, group: "harness", name: "girth" });
  b.along(girth, 22, (at) =>
    b.part(new THREE.IcosahedronGeometry(0.05, 0), GOLD, { at: at.moved([0, 0, 0.05]), flat: true, group: "harness" }),
  );
  for (const [s] of SIDES) {
    const bt = s > 0 ? 0.77 : 0.23;
    const bp = girth.at(bt);
    const radial = v3(bp.x, bp.y - 3.3, 0).normalize();
    b.part(new THREE.TorusGeometry(0.2, 0.045, 3, 4), GOLD, {
      at: offset(bp, radial, 0.06),
      dir: radial,
      up: v3(0, 0, 1),
      axis: "z",
      rotation: [0, 0, 45],
      flat: true,
      group: "harness",
    });
  }
  b.ring(tail.at(0.135), { count: 13, radius: 0.47, tilt: 62 }, (item) =>
    b.extrude(flame(0.62 + 0.14 * (item.i % 2), 0.19), {
      at: item,
      x: item.dir([1, 0, 0]),
      y: item.axis,
      thickness: 0.09,
      bevel: 0.025,
      detail: 0.34,
      color: maneColors[item.i % 3],
      group: "tail",
    }),
  );
  for (const u of [0.11, 0.155]) {
    const at = tail.at(u);
    const rr = 0.55 - 0.33 * Math.pow(u, 0.8);
    b.lathe(
      [
        [rr - 0.04, -0.07],
        [rr + 0.05, -0.07],
        [rr + 0.05, 0.07],
        [rr - 0.04, 0.07],
      ],
      { at, axis: at.tangent, segments: 8, spin: 22.5, bone: at.bone, color: u < 0.13 ? GOLD : GOLD_D, group: "tail" },
    );
  }

  // ================================================================================================================
  // Story: arrows and a broken spear in the hide, claw scars on the flanks
  // ================================================================================================================
  const arrow = (origin: V3, dir: [number, number, number], len: number, rad: number, fletched: boolean) => {
    const hit = skin.ray(origin, dir);
    if (!hit) throw new Error("chimera: arrow misses the body");
    const bone = hit.bone ?? chest;
    const out = v3(-dir[0], -dir[1], -dir[2])
      .normalize()
      .add(v3(0, 0.35, -0.3))
      .normalize();
    const end = offset(hit.at, out, len);
    b.rod(offset(hit.at, out, -0.25), end, rad, { bone, color: HORN, ...facet(5), group: "story" });
    b.rod(offset(hit.at, out, len * 0.35), offset(hit.at, out, len * 0.42), rad * 1.5, {
      bone,
      color: GOLD_D,
      ...facet(5),
      group: "story",
    });
    if (!fletched) {
      // A splintered break: three bone-pale slivers standing off the shaft's end.
      for (let k = 0; k < 3; k++) {
        const a = (k * 120 + 15) * DEG;
        const side = v3(Math.cos(a), 0, Math.sin(a)).cross(out).normalize();
        b.spike(offset(end, side, rad * 0.4), out.clone().addScaledVector(side, 0.25), 0.14 + 0.06 * k, rad * 0.5, {
          bone,
          color: BONE,
          ...facet(3),
          group: "story",
        });
      }
      return;
    }
    for (let k = 0; k < 3; k++) {
      const a = (k * 120 + 30) * DEG;
      const side = v3(Math.cos(a), 0, Math.sin(a)).cross(out).normalize();
      b.extrude(
        [
          [0, 0, "sharp"],
          [0.18, 0.1, "sharp"],
          [0.18, 0.42, "sharp"],
          [0, 0.52, "sharp"],
        ],
        {
          at: offset(end, out, -0.55),
          x: side,
          y: out,
          thickness: 0.025,
          bone,
          color: k ? BONE_L : MANE_L,
          group: "story",
        },
      );
    }
  };
  arrow([4, 3.6, -1.2], [-1, 0, 0], 1.5, 0.06, true);
  arrow([4, 2.8, -1.7], [-1, 0.1, 0.1], 1.3, 0.06, true);
  arrow([-4, 3.9, -1.9], [1, -0.2, 0], 1.4, 0.06, true);
  arrow([-4, 2.9, -1.2], [1, 0.15, -0.1], 2.0, 0.09, false);
  b.decal(body, SCAR_TEX, { at: v3(1.1, 3.0, 0.4), dir: [1, 0, 0.1], size: [0.95, 0.95], roll: 25, group: "story" });
  b.decal(body, SCAR_TEX, {
    at: v3(-1.1, 3.3, -0.1),
    dir: [-1, 0, 0],
    size: [0.85, 0.85],
    roll: -10,
    mirror: true,
    group: "story",
  });

  // Rest pose: every mouth a little open so the jaws read apart.
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });
  b.pose(goatJaw, { axis: [1, 0, 0], deg: 10 });
  b.pose(snakeJaw, { axis: [1, 0, 0], deg: 14 });

  return b.root;
}
