import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  lerp,
  catmull,
  bezier,
  limb,
  paint,
  mix,
  resolve,
  smoothstep,
  noise,
  grain,
  mottle,
  patches,
  svg,
} from "../../../../src/index";
import type { ColorInput, Joint, OutlinePoint } from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "A stout, barrel-chested Ironforge-style dwarf rifleman in chunky Warcraft proportions: braided copper beard, kettle helmet with glowing goggles, tiered steel pauldrons, a brass-lipped blunderbuss held low-ready in both hands, bandolier, backpack with shoulder straps, powder horn and a small stone base with a powder keg, lantern and crates.",
};

// ---------------------------------------------------------------------------------------------------------------
// Textures

const EYE = svg(
  `<svg viewBox="0 0 40 22" xmlns="http://www.w3.org/2000/svg">
  <defs><clipPath id="c"><path d="M3 11.5 Q22 2 37 13 Q22 20.5 3 11.5Z"/></clipPath></defs>
  <path d="M1.5 11.5 Q22 -0.5 38.5 13.5 Q22 22 1.5 11.5Z" fill="#1c1218"/>
  <path d="M3 11.5 Q22 2 37 13 Q22 20.5 3 11.5Z" fill="#f2e9dc"/>
  <g clip-path="url(#c)">
    <circle cx="21" cy="12" r="6.6" fill="#2f86d8"/>
    <circle cx="21" cy="14.5" r="6.6" fill="#63b6f0" opacity="0.5"/>
    <circle cx="21" cy="12" r="6.6" fill="none" stroke="#12304f" stroke-width="1.4"/>
    <circle cx="21" cy="12.4" r="3" fill="#0b0b12"/>
    <circle cx="23.4" cy="10.2" r="1.7" fill="#ffffff"/>
    <path d="M0 0H40V8Q22 5 0 9.5Z" fill="#1c1218" opacity="0.6"/>
  </g>
  <path d="M1.5 11.5 Q22 -0.5 38.5 13.5" stroke="#1c1218" stroke-width="2.8" fill="none" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);

const LENS = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="31" fill="#0c4a56"/>
  <circle cx="32" cy="32" r="25" fill="#2aa9ba"/>
  <circle cx="32" cy="34" r="15" fill="#4fc9d8"/>
  <ellipse cx="22" cy="21" rx="7" ry="3.6" transform="rotate(-35 22 21)" fill="#e8ffff" opacity="0.9"/>
  <circle cx="42" cy="43" r="2.2" fill="#d4fbff" opacity="0.7"/>
</svg>`,
  { size: 128 },
);

const ANVIL = `<path d="M11 30H35Q39 30 40 27V33Q38 37 34 38H30L32 46H38V50H12V46H18L20 38H17Q12 37 11 30Z"/>`;

const TABARD = svg(
  `<svg viewBox="0 0 50 90" xmlns="http://www.w3.org/2000/svg">
  <path d="M1 0H49V66L25 89L1 66Z" fill="#c99a2e" stroke="#5a3d0c" stroke-width="1.5"/>
  <path d="M4 3H46V64L25 84L4 64Z" fill="#2a4fa2"/>
  <path d="M4 3H46V10H4Z" fill="#1d3676"/>
  <path d="M15 10V70M35 10V70" stroke="#244694" stroke-width="2"/>
  <g transform="translate(0,12)" fill="#f7d36a" stroke="#5a3d0c" stroke-width="1.4">${ANVIL}</g>
  <path d="M8 62L25 79L42 62" stroke="#f7d36a" stroke-width="1.6" fill="none" stroke-dasharray="3 2.5"/>
  <circle cx="25" cy="73" r="2" fill="#f7d36a"/>
</svg>`,
  { size: 256 },
);

const KEG_LABEL = svg(
  `<svg viewBox="0 0 48 56" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="44" height="52" rx="4" fill="#eadcb2" stroke="#4a2c14" stroke-width="2.5"/>
  <circle cx="24" cy="27" r="11" fill="#1c1a22"/>
  <path d="M22 17 Q26 10 33 12" stroke="#4a2c14" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <circle cx="34" cy="11" r="2.6" fill="#ff8a1c"/>
  <path d="M17 24 A8 8 0 0 1 22 19" stroke="#ffffff" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <text x="24" y="49" text-anchor="middle" font-size="9" font-weight="bold" font-family="serif" fill="#a3231a">POWDER</text>
</svg>`,
  { size: 192 },
);

const GRASS = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 64Q6 30 3 6Q12 30 14 64Z" fill="#3f7a2a"/>
  <path d="M10 64Q14 28 16 0Q20 28 22 64Z" fill="#5da03a"/>
  <path d="M18 64Q24 36 30 12Q28 40 30 64Z" fill="#4a8a30"/>
</svg>`,
  { size: 128 },
);

const SCROLL = svg(
  `<svg viewBox="0 0 80 20" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 10C14 0 22 0 30 10S46 20 56 10S70 2 76 10" stroke="#f2c14e" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="30" cy="10" r="2.4" fill="#f2c14e"/><circle cx="56" cy="10" r="2.4" fill="#f2c14e"/>
</svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------
// Coordinates: legs are shortened (0.8x) and the torso/head shifted down 0.10; FL is the turf surface the boots stand on.

const Y0 = 0.085; // top of the stone base
const FL = Y0 + 0.008; // top of the turf
const cy = (y: number) => (y <= 0.5 ? 0.8 * y : y - 0.1);
const yv = (y: number) => cy(y) + FL;
const P = (x: number, y: number, z: number): [number, number, number] => [x, cy(y) + FL, z];

// ---------------------------------------------------------------------------------------------------------------
// Paints

const SHADOW_TINT = "#2a1840";
const WARM_TINT = "#ffe8b0";
const tone = (c: ColorInput, dark = 0.3) =>
  paint((p, n) => {
    const base = resolve(c, p, n);
    return mix(mix(base, SHADOW_TINT, dark), mix(base, WARM_TINT, 0.12), smoothstep(-0.7, 0.8, n.y));
  });

const SKIN = tone(mottle("#e5a67f", "#d68e68", { size: 0.04, seed: 11 }));
const NOSE = tone(mottle("#e68a74", "#cf6c5c", { size: 0.03, seed: 12 }));

const COPPER_A = grain("#a24a1b", "#b2531e", { size: 0.012, axis: "y", seed: 13 });
const COPPER_B = grain("#cf6c26", "#dc7e30", { size: 0.012, axis: "y", seed: 14 });
const BEARD = paint((p, n) => {
  const base = resolve(COPPER_A, p, n);
  const root = smoothstep(0.95 + FL, 1.1 + FL, p.y);
  const ridge = smoothstep(0.25, 0.85, Math.max(n.z, Math.abs(n.x) * 0.8)) * (1 - root);
  let c = mix(base, "#5e2a10", 0.6 * root);
  c = mix(c, "#e8923a", 0.5 * ridge);
  return mix(c, SHADOW_TINT, 0.28 * (1 - smoothstep(-0.6, 0.5, n.y)));
});
const BEARD_HI = paint((p, n) => {
  const base = resolve(COPPER_B, p, n);
  const root = smoothstep(0.95 + FL, 1.12 + FL, p.y);
  const ridge = smoothstep(0.2, 0.8, Math.max(n.z, Math.abs(n.x) * 0.8));
  let c = mix(base, "#7a3612", 0.4 * root);
  c = mix(c, "#f2a548", 0.4 * ridge * (1 - root));
  return mix(c, SHADOW_TINT, 0.24 * (1 - smoothstep(-0.6, 0.5, n.y)));
});

const BLUE = tone(mottle("#2a53ab", "#264a9c", { size: 0.05, seed: 15 }));
const LEATHER = tone(mottle("#7a4a2a", "#5a3319", { size: 0.03, seed: 16 }));
const LEATHER_D = tone(mottle("#45291a", "#2f1b10", { size: 0.03, seed: 17 }));
const PANTS = tone(mottle("#6f5a42", "#54422f", { size: 0.05, seed: 18 }));
const WOOD = tone(grain("#8c5630", "#764826", { size: 0.01, axis: "y", seed: 19 }));
const WALNUT = tone(grain("#4a2916", "#3a1f10", { size: 0.01, axis: "x", seed: 22 }), 0.25);
const STONE = tone(patches("#35323c", ["#8f8b94", "#7b7882", "#a29c92"], { size: 0.16, gap: 0.08, seed: 20 }));
const MOSS = tone(mottle("#4f8a30", "#467d2b", { size: 0.08, seed: 21 }));
const STEEL = paint((p, n) => {
  const up = smoothstep(-0.1, 0.85, n.y);
  const mid = mix("#2b3448", "#8a98b0", smoothstep(-0.9, 0.2, n.y));
  const c = mix(mid, "#dbe4f1", up * up);
  return mix(c, "#1c2232", 0.14 * (1 - noise(p, 0.06, 3)));
});
const STEEL_EDGE = "#dde6f2";
const BRASS = metal("brass", { polish: 0.4 });
const GILT = metal("gilt");
const IRON = metal("iron");
const BRONZE = metal("bronze");
const INKC = "#1a1020";

// ---------------------------------------------------------------------------------------------------------------

type Pt = number[] | THREE.Vector3;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const L2 = (pts: [number, number][]) => pts.map(([x, y]) => new THREE.Vector2(x, y));

export default function build() {
  const b = createBuilder({ name: "dwarf_rifleman" });
  const r = rng(7);

  // ---- helpers ------------------------------------------------------------------------------------------------
  const blob = (
    color: ColorInput,
    at: Pt,
    rad: number | number[],
    bone: Joint,
    o: { dir?: Pt; q?: THREE.Quaternion; seg?: number; flat?: boolean } = {},
  ) => {
    const seg = o.seg ?? 8;
    const s: [number, number, number] = typeof rad === "number" ? [rad, rad, rad] : [rad[0], rad[1], rad[2]];
    return b.part(new THREE.SphereGeometry(1, seg, Math.max(4, seg - 2)), color, {
      bone,
      at,
      scale: s,
      flat: o.flat ?? true,
      ...(o.q ? { quat: o.q } : o.dir ? { dir: o.dir } : {}),
    });
  };
  const box = (
    color: ColorInput,
    at: Pt,
    size: [number, number, number],
    bone: Joint,
    o: { dir?: Pt; rot?: [number, number, number] } = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone,
      at,
      flat: true,
      ...(o.dir ? { dir: o.dir } : {}),
      ...(o.rot ? { rotation: o.rot } : {}),
    });
  const cyl = (color: ColorInput, at: Pt, rTop: number, rBot: number, h: number, bone: Joint, dir?: Pt, seg = 8) =>
    b.part(new THREE.CylinderGeometry(rTop, rBot, h, seg), color, {
      bone,
      at,
      flat: true,
      ...(dir ? { dir } : {}),
    });
  const torus = (color: ColorInput, at: Pt, R: number, tube: number, dir: Pt, bone: Joint, seg = 10) =>
    b.part(new THREE.TorusGeometry(R, tube, 5, seg), color, { bone, at, dir, axis: "z", flat: true });
  const rod = (a: Pt, c: Pt, rad: number | [number, number], color: ColorInput, bone: Joint) =>
    b.rod(a, c, rad, color, { bone });
  // frame buckle with prong bar and a strap tongue, lying on a surface facing +Z (sg = 1) or -Z (sg = -1)
  const buckle = (c: Pt, sg: number, w: number, h: number, col: ColorInput, bone: Joint) => {
    const [x, y, z] = [c[0], c[1], c[2]];
    const t = 0.009;
    const d = 0.012;
    box(col, [x, y + h / 2 - t / 2, z], [w, t, d], bone);
    box(col, [x, y - h / 2 + t / 2, z], [w, t, d], bone);
    box(col, [x - w / 2 + t / 2, y, z], [t, h, d], bone);
    box(col, [x + w / 2 - t / 2, y, z], [t, h, d], bone);
    box(IRON, [x, y + h * 0.12, z + sg * 0.003], [w - 2 * t, 0.006, 0.01], bone);
    box(LEATHER_D, [x, y - h * 0.62, z - sg * 0.003], [w * 0.62, h * 0.7, 0.008], bone);
  };

  // ---- gun frame (model space): GA along the barrel, GS toward the gun's back side, GU up ----------------------
  const GB = V(...P(-0.32, 0.6, 0.16));
  const GM = V(...P(0.53, 0.75, 0.46));
  const GA = GM.clone().sub(GB).normalize();
  const GS = new THREE.Vector3().crossVectors(V(0, 1, 0), GA).normalize();
  const GU = new THREE.Vector3().crossVectors(GA, GS).normalize();
  // local x = toward the camera side of the gun, y = along the barrel, z = up
  const GQ = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(GS.clone().negate(), GA, GU),
  );
  const gp = (u: number, v = 0, w = 0) =>
    GB.clone().addScaledVector(GA, u).addScaledVector(GU, v).addScaledVector(GS, w);
  const GRIP = gp(0.205, -0.005, -0.062);
  const LHAND = gp(0.535, -0.08, 0);

  // ---- skeleton -----------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: P(0, 0.52, 0) });
  const spine = b.chain("spine", catmull([P(0, 0.52, 0), P(0, 0.7, 0.01), P(0, 0.9, 0.03), P(0, 1.04, 0.03)]), {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const chest = spine.joints[2];
  const spine1 = spine.joints[0];
  const neckJ = b.joint("neck", { parent: chest, at: P(0, 1.05, 0.03), aim: P(0, 1.17, 0.07), role: "neck" });
  const head = b.joint("head", { parent: neckJ, at: P(0, 1.17, 0.07), dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: P(0, 1.2, 0.1), aim: P(0, 1.17, 0.22), role: "jaw" });

  // ---- torso: barrel chest with flat-topped shoulders ---------------------------------------------------------
  const torso = b.loft(
    [
      { at: P(0, 0.5, 0), w: 0.48, h: 0.32 },
      { at: P(0, 0.72, 0.01), w: 0.58, h: 0.38 },
      { at: P(0, 0.9, 0.03), w: 0.66, h: 0.38 },
      { at: P(0, 1.02, 0.025), w: 0.4, h: 0.28 },
    ],
    { color: BLUE, bone: [hips, spine], caps: "flat" },
  );
  blob(PANTS, P(0, 0.47, 0), [0.25, 0.1, 0.18], hips, { seg: 8 });
  rod(P(0, 1.0, 0.03), P(0, 1.2, 0.08), 0.085, SKIN, neckJ);
  b.lathe(
    [
      [0.09, -0.02],
      [0.15, -0.045],
      [0.17, 0.0],
      [0.13, 0.04],
      [0.095, 0.04],
    ],
    { at: P(0, 1.04, 0.03), segments: 10, color: LEATHER_D, bone: chest },
  );

  // chest plate: bronze frame, steel face, gilt boss
  const PLATE: OutlinePoint[] = [
    [-0.18, 0],
    [0.18, 0],
    [0.2, 0.14],
    [0.155, 0.29],
    [0, 0.33],
    [-0.155, 0.29],
    [-0.2, 0.14],
  ];
  const PLATE_IN: OutlinePoint[] = PLATE.map(([x, y]) => [x * 0.84, y * 0.84 + 0.02] as OutlinePoint);
  const plateA = b.extrude(PLATE, { at: P(0, 0.7, 0.228), x: [1, 0, 0], thickness: 0.04, bevel: 0.008, color: BRONZE, bone: chest });
  const plateB = b.extrude(PLATE_IN, { at: P(0, 0.7, 0.234), x: [1, 0, 0], thickness: 0.044, bevel: 0.01, color: STEEL, bone: chest });
  blob(GILT, P(0, 0.84, 0.262), [0.036, 0.036, 0.02], chest, { seg: 8 });
  torus(BRONZE, P(0, 0.84, 0.262), 0.04, 0.007, [0, 0, 1], chest, 10);

  // belt, buckle, tabard
  const beltPts = L2([
    [0.19, -0.04],
    [0.215, -0.04],
    [0.215, 0.04],
    [0.19, 0.04],
    [0.19, -0.04],
  ]);
  b.part(new THREE.LatheGeometry(beltPts, 14), LEATHER_D, {
    bone: spine1,
    at: P(0, 0.66, 0.01),
    scale: [1.24, 1, 0.96],
    flat: true,
  });
  buckle(P(0, 0.66, 0.222), 1, 0.08, 0.065, GILT, spine1);
  b.part(new THREE.PlaneGeometry(0.2, 0.32), "#ffffff", {
    bone: hips,
    at: P(0, 0.46, 0.226),
    dir: [0, 0.12, 1],
    axis: "z",
    texture: TABARD,
  });
  // pouch (right hip) and powder horn (left hip)
  box(LEATHER, P(-0.27, 0.57, -0.01), [0.08, 0.1, 0.07], spine1);
  box(LEATHER_D, P(-0.27, 0.62, -0.005), [0.088, 0.04, 0.078], spine1);
  blob(BRONZE, P(-0.27, 0.6, 0.034), 0.01, spine1, { seg: 6 });
  b.sweep(bezier(P(0.25, 0.63, 0.03), P(0.3, 0.5, 0.1), P(0.22, 0.43, 0.2)), [0.045, 0.008], {
    color: tone("#e4d6ac"),
    bone: hips,
    caps: { start: "flat", end: "point" },
    sides: 8,
  });
  cyl(BRONZE, P(0.25, 0.635, 0.03), 0.047, 0.047, 0.025, hips, [0.1, 1, 0.1], 8);
  rod(P(0.25, 0.64, 0.03), P(0.19, 0.7, 0.05), 0.006, LEATHER_D, spine1);

  // chest surface for straps: torso plus the plate
  const chestSurf = b.surface([torso, plateA, plateB]);

  // bandolier: one strap from behind the right shoulder, over it, diagonally across the chest, round the left hip
  const bandRough = catmull([
    P(-0.13, 1.0, -0.1),
    P(-0.12, 1.03, 0.02),
    P(-0.1, 0.95, 0.24),
    P(0.03, 0.85, 0.27),
    P(0.17, 0.74, 0.27),
    P(0.27, 0.66, 0.12),
    P(0.27, 0.65, -0.06),
    P(0.2, 0.7, -0.14),
  ]);
  const band = chestSurf.drape(bandRough, { lift: 0.009 });
  b.sweep(band, () => [0.026, 0.007], { color: LEATHER_D, bone: chest, section: "box", caps: "flat", up: [0, 0, -1] });
  b.along(
    band,
    6,
    (at) => {
      const h = chestSurf.nearest(at.at);
      const axis = new THREE.Vector3().crossVectors(V(at.axis[0], at.axis[1], at.axis[2]), h.n).normalize();
      const p = V(at.at.x, at.at.y, at.at.z).addScaledVector(h.n, 0.024);
      cyl(tone("#e4d6ac"), p, 0.014, 0.014, 0.05, chest, axis.toArray(), 6);
      cyl(BRASS, p.clone().addScaledVector(axis, 0.027), 0.015, 0.015, 0.012, chest, axis.toArray(), 6);
    },
    { from: 0.34, to: 0.7 },
  );

  // backpack: bevelled leather body and lid, bedroll, bedroll straps
  const rect = (hw: number, hh: number): OutlinePoint[] => [
    [-hw, -hh],
    [hw, -hh],
    [hw, hh],
    [-hw, hh],
  ];
  b.extrude(rect(0.23, 0.17), { at: P(0, 0.85, -0.2), x: [1, 0, 0], thickness: 0.17, bevel: 0.015, color: LEATHER, bone: chest });
  b.extrude(rect(0.24, 0.05), { at: P(0, 1.0, -0.2), x: [1, 0, 0], thickness: 0.19, bevel: 0.015, color: LEATHER_D, bone: chest });
  cyl(tone("#6f7f9a", 0.2), P(0, 1.12, -0.2), 0.07, 0.07, 0.56, chest, [1, 0, 0], 10);
  for (const s of [1, -1]) {
    cyl(tone("#8c99b0", 0.2), P(s * 0.281, 1.12, -0.2), 0.055, 0.055, 0.012, chest, [1, 0, 0], 10);
    torus(LEATHER_D, P(s * 0.13, 1.12, -0.2), 0.073, 0.01, [1, 0, 0], chest, 10);
    b.sweep(
      catmull([
        P(s * 0.13, 1.18, -0.232),
        P(s * 0.13, 1.13, -0.27),
        P(s * 0.13, 1.06, -0.303),
        P(s * 0.13, 0.9, -0.303),
        P(s * 0.13, 0.76, -0.303),
      ]),
      () => [0.026, 0.0075],
      { color: LEATHER_D, bone: chest, section: "box", caps: "flat" },
    );
    buckle(P(s * 0.13, 0.79, -0.31), -1, 0.055, 0.05, BRONZE, chest);

    // pack shoulder strap: pack top corner, over the shoulder, down the chest, under the arm, back to the pack
    const sp = chestSurf.drape(
      catmull([
        P(s * 0.17, 1.0, -0.13),
        P(s * 0.17, 1.03, 0.0),
        P(s * 0.175, 0.97, 0.14),
        P(s * 0.175, 0.9, 0.26),
        P(s * 0.19, 0.8, 0.255),
        P(s * 0.26, 0.72, 0.15),
        P(s * 0.3, 0.7, 0.0),
        P(s * 0.27, 0.7, -0.14),
      ]),
      { lift: 0.007 },
    );
    b.sweep(sp, () => [0.0175, 0.006], { color: LEATHER, bone: chest, section: "box", caps: "flat", up: [0, 0, -1] });
    const bp = sp.at(0.5);
    buckle([bp.x, bp.y, bp.z + 0.012], 1, 0.052, 0.046, BRONZE, chest);
    const ep = sp.at(1);
    box(BRONZE, [ep.x, ep.y, ep.z], [0.04, 0.03, 0.012], chest);
  }
  // tin cup hung on the pack back, mouth facing outward, with a leather loop and a handle
  const CUP: [number, number, number] = P(0.12, 0.76, -0.285);
  b.lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.05, 0.07],
      [0.044, 0.07],
      [0.034, 0.012],
      [0, 0.012],
    ],
    { at: [CUP[0], CUP[1], CUP[2] - 0.004], axis: [0, 0, -1], segments: 10, color: IRON, bone: chest },
  );
  torus(LEATHER_D, [CUP[0], CUP[1], CUP[2] - 0.034], 0.047, 0.007, [0, 0, 1], chest, 10);
  box(LEATHER_D, [CUP[0], CUP[1] + 0.049, CUP[2] - 0.017], [0.02, 0.014, 0.034], chest);
  b.sweep(
    catmull([
      V(CUP[0] + 0.05, CUP[1], CUP[2] - 0.034),
      V(CUP[0] + 0.074, CUP[1], CUP[2] - 0.042),
      V(CUP[0] + 0.078, CUP[1], CUP[2] - 0.062),
      V(CUP[0] + 0.054, CUP[1], CUP[2] - 0.07),
    ]),
    0.005,
    { color: IRON, bone: chest, sides: 5, caps: "flat" },
  );

  // ---- legs ---------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s === 1 ? "L" : "R";
    const pts = limb(P(s * 0.13, 0.5, 0), P(s * 0.155, 0.1, 0.02), [0.18, 0.17], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: P(s * 0.155, 0, 0.06),
    });
    b.sweep(leg, [0.12, 0.105, 0.095, 0.09], { color: PANTS });
    const knee = leg.joints[1];
    const ankle = leg.tip!;
    const x = s * 0.155;
    b.joint(`toe${S}`, { parent: ankle, at: P(x, 0.075, 0.12), aim: P(x, 0.075, 0.22) });
    // knee guard
    const kp = pts[1].clone().add(V(0, 0.0, 0.085));
    blob(STEEL, kp, [0.085, 0.08, 0.045], knee, { seg: 7 });
    torus(BRONZE, kp, 0.08, 0.008, [0, 0.1, 1], knee, 10);
    // boot
    rod(P(x, 0.27, 0.02), P(x, 0.09, 0.02), [0.115, 0.1], LEATHER, ankle);
    rod(P(x, 0.285, 0.02), P(x, 0.235, 0.02), 0.125, LEATHER_D, ankle);
    b.ring(frame(P(x, 0.26, 0.02), [0, 1, 0]), { count: 8, radius: 0.125 }, (it) =>
      b.stick(new THREE.SphereGeometry(0.011, 5, 4), BRONZE, it, { bone: ankle, embed: 0.4 }),
    );
    b.capsule(P(x, 0.078, -0.04), P(x, 0.078, 0.14), 0.088, LEATHER, { bone: ankle });
    box(LEATHER_D, P(x, 0.015, 0.07), [0.21, 0.03, 0.34], ankle);
    blob(STEEL, P(x, 0.065, 0.175), [0.095, 0.062, 0.075], ankle, { seg: 7 });
    torus(BRASS, P(x, 0.17, 0.02), 0.11, 0.011, [0, 1, 0], ankle, 10);
    box(BRONZE, P(x, 0.17, 0.134), [0.03, 0.035, 0.012], ankle);
  }

  // ---- arms ---------------------------------------------------------------------------------------------------
  let wristR: Joint | null = null;
  for (const s of [1, -1]) {
    const S = s === 1 ? "L" : "R";
    const sh = P(s * 0.34, 0.98, 0);
    const handT = s === 1 ? LHAND.toArray() : GRIP.toArray();
    const pts = limb(sh, handT, [0.28, 0.27], [[s * 1, -0.2, -0.6]]);
    const arm = b.chain(`arm${S}`, pts, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const wrist = arm.tip!;
    b.sweep(arm, [0.1, 0.092, 0.075, 0.062], {
      bands: [
        [0.5, BLUE],
        [1, SKIN],
      ],
    });
    // leather bracer + studs
    rod(lerp(pts[1], pts[2], 0.3), lerp(pts[1], pts[2], 0.92), [0.08, 0.07], LEATHER, elbow);
    const outN = V(s * 0.7, 0.5, 0.3).normalize();
    for (const t of [0.4, 0.62, 0.84])
      blob(BRONZE, lerp(pts[1], pts[2], t).add(outN.clone().multiplyScalar(0.075)), 0.011, elbow, { seg: 5 });
    blob(BRONZE, pts[1].clone().add(V(s * 0.05, -0.01, -0.06)), [0.06, 0.06, 0.05], elbow, { seg: 6 });

    // pauldron: three overlapping lames; gilt only on the outer rim, bronze middle, bright steel bevel on top
    const C = P(s * 0.37, 1.0, 0);
    const up = V(s * 0.45, 1, 0).normalize();
    const tiers: [number, number, number, ColorInput, ColorInput][] = [
      [-0.04, 0.22, 0.075, STEEL, GILT],
      [0.0, 0.195, 0.075, BRONZE, BRONZE],
      [0.04, 0.16, 0.075, STEEL, STEEL_EDGE],
    ];
    for (const [off, rad, h, col, rim] of tiers) {
      const c = V(C[0], C[1], C[2]).addScaledVector(up, off);
      b.part(new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), col, {
        bone: shoulder,
        at: c,
        dir: up,
        scale: [rad, h, rad],
        flat: true,
      });
      torus(rim, c, rad, 0.008, up, shoulder, 12);
    }
    const mid = V(C[0], C[1], C[2]);
    b.ring(frame(mid.clone(), up), { count: 8, radius: 0.19 }, (it) =>
      b.stick(new THREE.SphereGeometry(0.012, 5, 4), BRONZE, it, { bone: shoulder, embed: 0.3 }),
    );
    b.spike(mid.clone().addScaledVector(up, 0.1), up, 0.09, 0.03, { color: BRONZE, bone: shoulder, sides: 6 });

    if (s === 1) {
      // support hand: palm under the forestock, fingers root on the underside and wrap onto the camera-facing side
      blob(SKIN, gp(0.6, -0.075), [0.048, 0.056, 0.022], wrist, { q: GQ, seg: 7, flat: false });
      const lens = [0.95, 1.05, 1, 0.85];
      for (let k = 0; k < 4; k++) {
        const u = 0.545 + k * 0.026;
        const pk = [gp(u, -0.079, -0.018), gp(u, -0.08, -0.04), gp(u, -0.05, -0.049), gp(u, -0.028 + 0.004 * (1 - lens[k]), -0.041)];
        const ch = b.chain(`finger${k + 1}${S}`, pk, {
          parent: wrist,
          names: [`finger${k + 1}a${S}`, `finger${k + 1}b${S}`, `finger${k + 1}c${S}`],
          role: "digit",
        });
        b.sweep(ch, [0.016, 0.014, 0.013, 0.01], { color: SKIN, sides: 6 });
      }
      const th = b.chain(`thumb${S}`, [gp(0.54, -0.07, 0.03), gp(0.545, -0.058, 0.058), gp(0.562, -0.032, 0.058)], {
        parent: wrist,
        names: [`thumb1${S}`, `thumb2${S}`],
        role: "digit",
      });
      b.sweep(th, [0.018, 0.015, 0.012], { color: SKIN, sides: 6 });
    } else {
      wristR = wrist;
      // firing hand: palm on the camera side of the grip, three bent fingers under the stock, thumb over the top
      blob(SKIN, gp(0.255, -0.002, -0.056), [0.024, 0.052, 0.046], wrist, { q: GQ, seg: 7, flat: false });
      for (let k = 0; k < 3; k++) {
        const u = 0.215 + k * 0.027;
        const pk = [gp(u, -0.035, -0.052), gp(u, -0.075, -0.045), gp(u, -0.087, -0.01), gp(u, -0.078, 0.025)];
        const ch = b.chain(`finger${k + 2}${S}`, pk, {
          parent: wrist,
          names: [`finger${k + 2}a${S}`, `finger${k + 2}b${S}`, `finger${k + 2}c${S}`],
          role: "digit",
        });
        b.sweep(ch, [0.016, 0.014, 0.013, 0.011], { color: SKIN, sides: 6 });
      }
      const idx = b.chain(
        `finger1${S}`,
        [gp(0.29, -0.01, -0.055), gp(0.318, -0.03, -0.05), gp(0.345, -0.048, -0.03), gp(0.36, -0.05, -0.003)],
        { parent: wrist, names: [`finger1a${S}`, `finger1b${S}`, `finger1c${S}`], role: "digit" },
      );
      b.sweep(idx, [0.014, 0.0125, 0.011, 0.009], { color: SKIN, sides: 6 });
      const th = b.chain(
        `thumb${S}`,
        [gp(0.2, 0.02, -0.05), gp(0.215, 0.058, -0.04), gp(0.245, 0.066, -0.012), gp(0.275, 0.058, 0.012)],
        { parent: wrist, names: [`thumb1${S}`, `thumb2${S}`, `thumb3${S}`], role: "digit" },
      );
      b.sweep(th, [0.018, 0.016, 0.014, 0.011], { color: SKIN, sides: 6 });
    }
  }

  // ---- blunderbuss --------------------------------------------------------------------------------------------
  const W = wristR!;
  const gUp = GU.toArray() as [number, number, number];
  // stock (butt tapering to the lock), butt plate, forestock
  b.frustumBox(gp(0.02, -0.03), gp(0.36, -0.005), [0.06, 0.156], [0.05, 0.084], { color: WALNUT, bone: W, up: gUp });
  b.frustumBox(gp(0.004, -0.03), gp(0.022, -0.03), [0.065, 0.162], [0.065, 0.162], { color: BRONZE, bone: W, up: gUp });
  b.frustumBox(gp(0.36, -0.04), gp(0.66, -0.04), [0.074, 0.06], [0.062, 0.048], { color: WALNUT, bone: W, up: gUp });
  rod(gp(0.34), gp(0.71), [0.04, 0.036], STEEL, W);
  for (const u of [0.45, 0.55, 0.65]) torus(BRONZE, gp(u), 0.045, 0.008, GA, W, 10);
  // lock plates and flintlock on the camera side
  b.frustumBox(gp(0.36, 0.0, -0.043), gp(0.47, 0.005, -0.043), [0.012, 0.05], [0.012, 0.04], { color: BRONZE, bone: W, up: gUp });
  b.frustumBox(gp(0.36, 0.0, 0.043), gp(0.47, 0.005, 0.043), [0.012, 0.05], [0.012, 0.04], { color: BRONZE, bone: W, up: gUp });
  blob(BRASS, gp(0.42, 0.0, -0.05), 0.008, W, { seg: 5 });
  rod(gp(0.4, 0.025, -0.047), gp(0.37, 0.085, -0.047), 0.008, IRON, W);
  blob(IRON, gp(0.367, 0.088, -0.047), 0.014, W, { seg: 5 });
  b.frustumBox(gp(0.455, 0.03, -0.047), gp(0.5, 0.03, -0.047), [0.02, 0.014], [0.026, 0.014], { color: BRONZE, bone: W, up: gUp });
  // trigger guard and trigger
  b.sweep(catmull([gp(0.31, -0.022), gp(0.325, -0.08), gp(0.385, -0.088), gp(0.415, -0.03)]), 0.0065, {
    color: BRONZE,
    bone: W,
    sides: 5,
    caps: "flat",
  });
  rod(gp(0.36, -0.02), gp(0.365, -0.05), 0.005, IRON, W);
  // ramrod on the back side
  rod(gp(0.4, -0.04, 0.052), gp(0.86, -0.04, 0.052), 0.008, WOOD, W);
  // engraved scroll plate on the stock, camera side
  b.part(new THREE.PlaneGeometry(0.16, 0.05), "#ffffff", {
    bone: W,
    at: gp(0.12, -0.012, -0.0305),
    dir: GS.clone().negate(),
    axis: "z",
    up: GU,
    texture: SCROLL,
  });
  // flared muzzle bell: hollow, with an inner return wall and a thick gilt lip
  const BELL: OutlinePoint[] = [
    [0, 0],
    [0.04, 0],
    [0.043, 0.04],
    [0.058, 0.1],
    [0.085, 0.16],
    [0.108, 0.205],
    [0.11, 0.222],
    [0.094, 0.222],
    [0.088, 0.2],
    [0.066, 0.15],
    [0.046, 0.1],
    [0.033, 0.075],
    [0, 0.07],
  ];
  const BELLP = paint((_p, n) => {
    const d = n.dot(GA);
    if (d > 0.9) return "#f2c458";
    if (d > 0.03) return "#2a180e";
    return BRONZE;
  });
  b.lathe(BELL, { at: gp(0.7), axis: GA, segments: 10, color: BELLP, bone: W });
  torus(GILT, gp(0.921), 0.1025, 0.008, GA, W, 12);
  b.part(new THREE.CircleGeometry(0.076, 10), INKC, { bone: W, at: gp(0.884), dir: GA, axis: "z" });

  // ---- head ---------------------------------------------------------------------------------------------------
  const HC = P(0, 1.29, 0.05);
  const skull = blob(SKIN, HC, [0.19, 0.16, 0.16], head, { seg: 12, flat: false });
  blob(SKIN, P(0, 1.185, 0.115), [0.14, 0.065, 0.11], jaw, { seg: 8, flat: false }); // lower jaw
  box(tone("#e4d6ac"), P(0, 1.2, 0.2), [0.08, 0.014, 0.02], jaw);
  blob(NOSE, P(0, 1.255, 0.215), [0.055, 0.047, 0.055], head, { seg: 8, flat: false });
  rod(P(0, 1.31, 0.2), P(0, 1.268, 0.225), 0.03, SKIN, head);
  const skin = b.surface(skull);
  const BROW: OutlinePoint[] = [
    [0, -0.014],
    [0.095, 0.0],
    [0.09, 0.011],
    [0, 0.014],
  ];
  for (const s of [1, -1]) {
    // tapered brow wedge, thick at the nose and angled down toward it
    b.extrude(BROW, {
      at: P(s * 0.02, 1.332, 0.208),
      x: [s, 0.22, -0.3],
      y: [0, 1, 0],
      thickness: 0.025,
      color: BEARD,
      bone: head,
    });
    blob(SKIN, P(s * 0.11, 1.217, 0.14), [0.05, 0.048, 0.05], head, { seg: 7, flat: false }); // cheek mass
    blob(SKIN, P(s * 0.185, 1.28, 0.04), [0.025, 0.05, 0.04], head, { seg: 6 }); // ear
    const ey = yv(1.28);
    const eh = skin.ray([s * 0.085, ey, 1], [0, 0, -1]);
    b.decal(skull, EYE, {
      at: eh ? eh.at : [s * 0.085, ey, 0.19],
      dir: [0, 0, 1],
      size: [0.072, 0.04],
      mirror: s > 0,
    });
    // moustache with an upward curl
    b.sweep(bezier(P(s * 0.012, 1.218, 0.225), P(s * 0.085, 1.185, 0.245), P(s * 0.15, 1.235, 0.19)), [0.04, 0.008], {
      color: BEARD_HI,
      bone: head,
      sides: 6,
    });
    // side whiskers
    b.sweep(catmull([P(s * 0.16, 1.2, 0.06), P(s * 0.14, 1.15, 0.13), P(s * 0.08, 1.12, 0.2)]), [0.04, 0.05], {
      color: BEARD,
      bone: jaw,
      sides: 7,
    });
  }

  // beard: one continuous tapered mass
  const beard = b.sweep(
    catmull([P(0, 1.18, 0.14), P(0, 1.05, 0.23), P(0, 0.85, 0.24)]),
    (t) => [0.15 - 0.115 * Math.pow(t, 1.25), 0.085 - 0.04 * t],
    { color: BEARD, bone: jaw, sides: 8 },
  );
  const beardSurf = b.surface(beard);

  // braids: three crossing strands plaited around a core, riding proud of the beard
  const braid = (s: number) => {
    const N = 48;
    const A = 0.02;
    const B = 0.012;
    const R = 0.017;
    const centers: THREE.Vector3[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const x = s * (0.085 - 0.03 * t);
      const y = yv(1.075 - 0.27 * t);
      const hit = beardSurf.ray([x, y, 1], [0, 0, -1]);
      const z0 = hit ? hit.at.z : 0.25;
      centers.push(V(x, y, z0 + 0.03));
    }
    const ctrl = catmull(centers);
    const taper = (t: number) => 1 - 0.55 * smoothstep(0.75, 1, t);
    b.sweep(ctrl, (t) => 0.012 * taper(t), { color: BEARD, bone: jaw, sides: 6 });
    for (let k = 0; k < 3; k++) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        const c = ctrl.at(t);
        const ph = 2 * Math.PI * 3.5 * t + (k * 2 * Math.PI) / 3;
        pts.push(V(c.x + A * taper(t) * Math.sin(ph), c.y, c.z + B * Math.cos(ph)));
      }
      b.sweep(catmull(pts), (t) => R * taper(t), { color: k === 1 ? BEARD : BEARD_HI, bone: jaw, sides: 6 });
    }
    const tip = ctrl.at(0.97);
    torus(GILT, [tip.x, tip.y, tip.z], 0.036, 0.01, [0, 1, 0], jaw, 8);
    const end = ctrl.at(1);
    b.spike([end.x, end.y - 0.005, end.z], [0, -1, 0], 0.07, 0.026, { color: BEARD_HI, bone: jaw, sides: 6 });
  };
  braid(1);
  braid(-1);

  // ---- helmet -------------------------------------------------------------------------------------------------
  const HAT: OutlinePoint[] = [
    [0, 0],
    [0.225, 0],
    [0.245, 0.015],
    [0.232, 0.03],
    [0.185, 0.04],
    [0.182, 0.09],
    [0.15, 0.125],
    [0.085, 0.15],
    [0, 0.155],
  ];
  const HZ = 0.045;
  const HY = 1.375;
  b.lathe(HAT, { at: P(0, HY, HZ), segments: 12, color: STEEL, bone: head });
  torus(GILT, P(0, HY + 0.015, HZ), 0.242, 0.009, [0, 1, 0], head, 14);
  torus(LEATHER_D, P(0, HY + 0.065, HZ), 0.186, 0.016, [0, 1, 0], head, 14);
  b.ring(frame(P(0, HY + 0.105, HZ), [0, 1, 0]), { count: 10, radius: 0.17 }, (it) =>
    b.stick(new THREE.SphereGeometry(0.011, 5, 4), BRONZE, it, { bone: head, embed: 0.3 }),
  );
  for (const s of [1, -1]) {
    const lc = P(s * 0.06, HY + 0.07, HZ + 0.19);
    const ld: [number, number, number] = [0, 0.12, 1];
    cyl(BRASS, lc, 0.04, 0.04, 0.035, head, ld, 8);
    torus(BRONZE, lc, 0.04, 0.007, ld, head, 8);
    glow(
      b.part(new THREE.CircleGeometry(0.031, 8), "#ffffff", {
        bone: head,
        at: [lc[0], lc[1] + 0.003, lc[2] + 0.02],
        dir: ld,
        axis: "z",
        texture: LENS,
      }),
      0.5,
    );
  }
  rod(P(0, HY + 0.07, HZ + 0.18), P(0, HY + 0.07, HZ + 0.2), 0.02, BRASS, head);
  cyl(BRONZE, P(0, HY + 0.158, HZ), 0.02, 0.03, 0.03, head, [0, 1, 0], 6);
  b.sweep(bezier(P(0, HY + 0.17, HZ), P(0, HY + 0.33, HZ - 0.1), P(0, HY + 0.24, HZ - 0.27)), [0.03, 0.004], {
    color: tone("#b3261e"),
    bone: head,
    sides: 6,
    caps: "point",
  });

  // ---- base and set dressing ----------------------------------------------------------------------------------
  const BASE: [number, number][] = [
    [0, 0],
    [0.49, 0],
    [0.51, 0.03],
    [0.475, Y0 - 0.005],
    [0, Y0 - 0.005],
  ];
  b.part(new THREE.LatheGeometry(L2(BASE), 14), STONE, { bone: hips, at: [0, 0, 0], scale: [1.02, 1, 0.88], flat: true });
  const TURF: [number, number][] = [
    [0, Y0 - 0.012],
    [0.46, Y0 - 0.012],
    [0.46, Y0 - 0.002],
    [0.33, FL],
    [0, FL],
  ];
  const turf = b.part(new THREE.LatheGeometry(L2(TURF), 14), MOSS, {
    bone: hips,
    at: [0, 0, 0],
    scale: [1.02, 1, 0.88],
    flat: true,
  });
  for (let i = 0; i < 11; i++) {
    const th = (i / 11) * Math.PI * 2 + 0.2 * r();
    const sz = 0.035 + 0.03 * r();
    b.part(new THREE.IcosahedronGeometry(1, 0), STONE, {
      bone: hips,
      at: [Math.cos(th) * 0.47, Y0 * 0.55, Math.sin(th) * 0.41],
      scale: [sz * 1.2, sz, sz * 1.1],
      rotation: [r() * 360, r() * 360, r() * 360],
      flat: true,
    });
  }
  const blades = b.surface(turf).scatter(40, {
    rng: r,
    minDist: 0.08,
    filter: (h) => {
      const { x, z } = h.at;
      if (h.n.y < 0.5 || Math.hypot(x / 0.47, z / 0.405) > 0.93) return false;
      if (Math.abs(x) < 0.33 && z > -0.14 && z < 0.3) return false; // boots
      if (Math.hypot(x - 0.32, z + 0.24) < 0.16) return false; // keg
      if (Math.abs(x + 0.24) < 0.15 && Math.abs(z + 0.25) < 0.14) return false; // crates
      return true;
    },
  });
  b.cards(blades, GRASS, { size: [0.04, 0.055], lean: 18, bend: 25, cross: true, vary: 0.3, rng: r, bone: hips });

  // powder keg with a lantern, tucked behind the heels
  const KX = 0.32;
  const KZ = -0.24;
  const KS = 0.82;
  const KEG: OutlinePoint[] = (
    [
      [0, 0],
      [0.092, 0],
      [0.108, 0.04],
      [0.12, 0.112],
      [0.108, 0.192],
      [0.092, 0.228],
      [0, 0.228],
    ] as [number, number][]
  ).map(([x, y]) => [x * KS, y * KS] as OutlinePoint);
  b.lathe(KEG, { at: [KX, FL, KZ], segments: 10, color: WOOD, bone: hips });
  for (const [y, rr] of [
    [0.04, 0.11],
    [0.112, 0.123],
    [0.192, 0.11],
  ])
    b.part(new THREE.TorusGeometry(rr * KS, 0.007, 5, 12), IRON, { bone: hips, at: [KX, FL + y * KS, KZ], dir: [0, 1, 0], axis: "z", flat: true });
  const kd = V(0.2, 0, 1).normalize();
  b.part(new THREE.PlaneGeometry(0.07, 0.08), "#ffffff", {
    bone: hips,
    at: [KX + kd.x * 0.104, FL + 0.112 * KS, KZ + kd.z * 0.104],
    dir: kd,
    axis: "z",
    texture: KEG_LABEL,
  });
  const LT = FL + 0.228 * KS;
  box(BRASS, [KX, LT + 0.006, KZ], [0.065, 0.012, 0.065], hips);
  glow(box("#ffcf5a", [KX, LT + 0.044, KZ], [0.044, 0.062, 0.044], hips), 1.8);
  for (const [dx, dz] of [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ])
    rod([KX + dx * 0.024, LT + 0.012, KZ + dz * 0.024], [KX + dx * 0.024, LT + 0.078, KZ + dz * 0.024], 0.0035, BRASS, hips);
  b.part(new THREE.ConeGeometry(0.044, 0.03, 4), BRASS, { bone: hips, at: [KX, LT + 0.093, KZ], rotation: [0, 45, 0] });
  torus(BRASS, [KX, LT + 0.108, KZ], 0.017, 0.003, [1, 0, 0], hips, 8);

  // crates (smaller, behind the boots)
  box(WOOD, [-0.24, FL + 0.06, -0.25], [0.19, 0.12, 0.15], hips, { rot: [0, 15, 0] });
  box(WOOD, [-0.23, FL + 0.152, -0.245], [0.13, 0.065, 0.11], hips, { rot: [0, -12, 0] });
  for (const dy of [0.013, 0.107])
    box(IRON, [-0.24, FL + dy, -0.25], [0.2, 0.016, 0.16], hips, { rot: [0, 15, 0] });
  box(BRONZE, [-0.2, FL + 0.06, -0.176], [0.03, 0.04, 0.01], hips, { rot: [0, 15, 0] });
  // spare cannonballs
  for (const [x, z] of [
    [0.02, -0.33],
    [0.08, -0.3],
    [0.06, -0.37],
  ])
    blob(IRON, [x, FL + 0.03, z], 0.03, hips, { seg: 7 });

  return b.root;
}
