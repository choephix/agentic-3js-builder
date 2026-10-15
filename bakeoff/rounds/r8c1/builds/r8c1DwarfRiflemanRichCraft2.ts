import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  lerp,
  catmull,
  bezier,
  polyline,
  limb,
  paint,
  mix,
  resolve,
  smoothstep,
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
    "A stout Ironforge-style dwarf rifleman in chunky Warcraft proportions: braided copper beard, kettle helmet with glowing goggles, huge tiered pauldrons, brass blunderbuss with a flared muzzle, bandolier, powder horn and a small stone base with a powder keg, lantern and crates.",
};

// ---------------------------------------------------------------------------------------------------------------
// Textures

const EYE = svg(
  `<svg viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg">
  <defs><clipPath id="c"><path d="M4.5 16 Q20 3 35.5 16 Q20 27 4.5 16Z"/></clipPath></defs>
  <path d="M2 16 Q20 -1 38 16 Q20 30 2 16Z" fill="#1c1218"/>
  <path d="M4.5 16 Q20 3 35.5 16 Q20 27 4.5 16Z" fill="#f6efe4"/>
  <g clip-path="url(#c)">
    <circle cx="20" cy="16" r="8.4" fill="#2f86d8"/>
    <circle cx="20" cy="19" r="8.4" fill="#63b6f0" opacity="0.55"/>
    <circle cx="20" cy="16" r="8.4" fill="none" stroke="#12304f" stroke-width="1.8"/>
    <circle cx="20" cy="16.5" r="4" fill="#0b0b12"/>
    <circle cx="23.2" cy="12.8" r="2.6" fill="#ffffff"/>
    <circle cx="16.8" cy="19.4" r="1.2" fill="#d8efff"/>
    <path d="M0 0H40V11Q20 4 0 11Z" fill="#1c1218" opacity="0.35"/>
  </g>
  <path d="M1.5 15.5 Q20 -3 38.5 15.5" stroke="#1c1218" stroke-width="3.2" fill="none" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);

const ANVIL = `<path d="M11 30H35Q39 30 40 27V33Q38 37 34 38H30L32 46H38V50H12V46H18L20 38H17Q12 37 11 30Z"/>`;

const EMBLEM = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="30" fill="#c99a2e" stroke="#6b4a10" stroke-width="2"/>
  <circle cx="32" cy="32" r="25" fill="#2a4fa2" stroke="#1b3470" stroke-width="2"/>
  <g transform="translate(7,8) scale(0.78)" fill="#f7d36a" stroke="#6b4a10" stroke-width="1.6">${ANVIL}</g>
  <path d="M20 16 L32 9 L44 16" stroke="#f7d36a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
</svg>`,
  { size: 192 },
);

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

const HAIR = svg(
  `<svg viewBox="0 0 24 64" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8c8c8c"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
  <path d="M2 64C4 40 9 18 12 0C15 18 20 40 22 64Z" fill="url(#g)"/>
  <path d="M12 60V10M7 60Q9 35 11 14M17 60Q15 35 13 14" stroke="#777777" stroke-width="1.4" fill="none"/>
</svg>`,
  { size: 128 },
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
const BEARD = tone(grain("#b9501b", "#ec9a3e", { size: 0.012, axis: "y", seed: 13 }), 0.35);
const BEARD_HI = tone(grain("#e07a2c", "#ffc268", { size: 0.012, axis: "y", seed: 14 }), 0.25);
const BLUE = tone(mottle("#2b57b3", "#213f86", { size: 0.05, seed: 15 }));
const LEATHER = tone(mottle("#7a4a2a", "#5a3319", { size: 0.03, seed: 16 }));
const LEATHER_D = tone(mottle("#45291a", "#2f1b10", { size: 0.03, seed: 17 }));
const PANTS = tone(mottle("#6f5a42", "#54422f", { size: 0.05, seed: 18 }));
const WOOD = tone(grain("#96592f", "#5f3718", { size: 0.01, axis: "y", seed: 19 }));
const CREAM = tone("#e4d6ac");
const RED = tone("#b3261e");
const STONE = tone(patches("#35323c", ["#8f8b94", "#7b7882", "#a29c92"], { size: 0.16, gap: 0.08, seed: 20 }));
const MOSS = tone(mottle("#559032", "#3a6322", { size: 0.08, seed: 21 }));
const STEEL = metal("steel", { tarnish: 0.12 });
const BRASS = metal("brass", { polish: 0.4 });
const GILT = metal("gilt");
const IRON = metal("iron");
const BRONZE = metal("bronze");
const INKC = "#1a1020";

// ---------------------------------------------------------------------------------------------------------------

type Pt = number[] | THREE.Vector3;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const Y0 = 0.085; // height of the base top
const P = (x: number, y: number, z: number): [number, number, number] => [x, y + Y0, z];

export default function build() {
  const b = createBuilder({ name: "dwarf_rifleman" });
  const r = rng(7);

  // ---- helpers ------------------------------------------------------------------------------------------------
  const blob = (
    color: ColorInput,
    at: Pt,
    rad: number | number[],
    bone: Joint,
    o: { dir?: Pt; seg?: number; flat?: boolean } = {},
  ) => {
    const seg = o.seg ?? 8;
    const s: [number, number, number] = typeof rad === "number" ? [rad, rad, rad] : [rad[0], rad[1], rad[2]];
    return b.part(new THREE.SphereGeometry(1, seg, Math.max(4, seg - 2)), color, {
      bone,
      at,
      scale: s,
      flat: o.flat ?? true,
      ...(o.dir ? { dir: o.dir } : {}),
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
  const lockOutline = (w: number, len: number): OutlinePoint[] => [
    [-w, 0],
    [w, 0],
    [w * 0.7, -len * 0.55],
    [0, -len, "sharp"],
    [-w * 0.7, -len * 0.55],
  ];
  const lock = (at: Pt, w: number, len: number, thick: number, color: ColorInput, bone: Joint, ang = 0) =>
    b.extrude(lockOutline(w, len), {
      at,
      x: [Math.cos(ang), Math.sin(ang), 0],
      y: [-Math.sin(ang), Math.cos(ang), 0],
      thickness: thick,
      bevel: thick * 0.25,
      smoothing: 1,
      color,
      bone,
    });

  // ---- gun frame (model space) --------------------------------------------------------------------------------
  const GB = V(-0.36, 0.6 + Y0, -0.25);
  const GM = V(-0.3, 0.84 + Y0, 0.62);
  const GA = GM.clone().sub(GB).normalize();
  const GS = new THREE.Vector3().crossVectors(V(0, 1, 0), GA).normalize(); // toward the model's left
  const GU = new THREE.Vector3().crossVectors(GA, GS).normalize();
  const gp = (u: number, v = 0, w = 0) =>
    GB.clone().addScaledVector(GA, u).addScaledVector(GU, v).addScaledVector(GS, w);
  const GRIP = gp(0.38);

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

  // ---- torso --------------------------------------------------------------------------------------------------
  b.loft(
    [
      { at: P(0, 0.5, 0), w: 0.34, h: 0.26 },
      { at: P(0, 0.68, 0.01), w: 0.36, h: 0.28 },
      { at: P(0, 0.88, 0.03), w: 0.44, h: 0.3 },
      { at: P(0, 1.02, 0.025), w: 0.52, h: 0.28 },
    ],
    { color: BLUE, bone: [hips, spine] },
  );
  blob(PANTS, P(0, 0.47, 0), [0.19, 0.1, 0.14], hips, { seg: 8 });
  rod(P(0, 1.0, 0.03), P(0, 1.2, 0.08), 0.075, SKIN, neckJ);
  b.lathe(
    [
      [0.09, -0.02],
      [0.15, -0.045],
      [0.18, 0.0],
      [0.14, 0.04],
      [0.095, 0.04],
    ],
    { at: P(0, 1.04, 0.03), segments: 10, color: LEATHER_D, bone: chest },
  );

  // chest plate: bronze frame, steel face, gilt boss
  const PLATE: OutlinePoint[] = [
    [-0.15, 0],
    [0.15, 0],
    [0.17, 0.12],
    [0.13, 0.25],
    [0, 0.28],
    [-0.13, 0.25],
    [-0.17, 0.12],
  ];
  const PLATE_IN: OutlinePoint[] = PLATE.map(([x, y]) => [x * 0.84, y * 0.84 + 0.02] as OutlinePoint);
  b.extrude(PLATE, { at: P(0, 0.73, 0.172), x: [1, 0, 0], thickness: 0.04, bevel: 0.008, color: BRONZE, bone: chest });
  b.extrude(PLATE_IN, { at: P(0, 0.73, 0.178), x: [1, 0, 0], thickness: 0.044, bevel: 0.01, color: STEEL, bone: chest });
  blob(GILT, P(0, 0.82, 0.205), [0.036, 0.036, 0.02], chest, { seg: 8 });
  torus(BRONZE, P(0, 0.82, 0.205), 0.04, 0.007, [0, 0, 1], chest, 10);

  // belt, buckle, tabard
  const beltPts = [new THREE.Vector2(0.19, -0.04), new THREE.Vector2(0.215, -0.04), new THREE.Vector2(0.215, 0.04), new THREE.Vector2(0.19, 0.04), new THREE.Vector2(0.19, -0.04)];
  b.part(new THREE.LatheGeometry(beltPts, 14), LEATHER_D, { bone: spine1, at: P(0, 0.66, 0.01), scale: [1, 1, 0.78], flat: true });
  box(GILT, P(0, 0.66, 0.177), [0.07, 0.06, 0.02], spine1);
  box(IRON, P(0, 0.66, 0.188), [0.04, 0.032, 0.01], spine1);
  b.part(new THREE.PlaneGeometry(0.2, 0.36), "#ffffff", {
    bone: hips,
    at: P(0, 0.455, 0.172),
    dir: [0, 0.05, 1],
    axis: "z",
    texture: TABARD,
  });
  // pouch (right hip) and powder horn (left hip)
  box(LEATHER, P(-0.2, 0.57, 0.06), [0.08, 0.1, 0.07], spine1);
  box(LEATHER_D, P(-0.2, 0.62, 0.065), [0.088, 0.04, 0.078], spine1);
  blob(GILT, P(-0.2, 0.6, 0.104), 0.01, spine1, { seg: 6 });
  const horn = b.sweep(bezier(P(0.2, 0.63, 0.03), P(0.25, 0.5, 0.1), P(0.17, 0.43, 0.2)), [0.045, 0.008], {
    color: CREAM,
    bone: hips,
    caps: { start: "flat", end: "point" },
    sides: 8,
  });
  void horn;
  cyl(BRASS, P(0.2, 0.635, 0.03), 0.047, 0.047, 0.025, hips, [0.1, 1, 0.1], 8);
  rod(P(0.2, 0.64, 0.03), P(0.14, 0.7, 0.05), 0.006, LEATHER_D, spine1);

  // bandolier with cartridges (across right shoulder to left hip)
  const bandPath = catmull([
    P(-0.17, 1.0, 0.12),
    P(-0.08, 0.92, 0.215),
    P(0.02, 0.84, 0.225),
    P(0.12, 0.75, 0.215),
    P(0.19, 0.66, 0.15),
  ]);
  b.sweep(bandPath, () => [0.03, 0.01], { color: LEATHER_D, bone: chest, section: "box", caps: "flat" });
  b.along(bandPath, 7, (at) => {
    const p = at.at.clone().add(V(0, 0, 0.02));
    cyl(CREAM, p, 0.014, 0.014, 0.055, chest, [0.5, 1, 0], 6);
    cyl(BRASS, p.clone().add(V(0.012, 0.03, 0)), 0.015, 0.015, 0.014, chest, [0.5, 1, 0], 6);
  });

  // backpack with bedroll
  box(LEATHER, P(0, 0.86, -0.2), [0.32, 0.34, 0.16], chest);
  box(LEATHER_D, P(0, 0.99, -0.2), [0.34, 0.1, 0.18], chest);
  cyl(tone("#6f7f9a"), P(0, 1.1, -0.2), 0.07, 0.07, 0.42, chest, [1, 0, 0], 10);
  for (const x of [-0.12, 0.12]) torus(LEATHER_D, P(x, 1.1, -0.2), 0.073, 0.01, [1, 0, 0], chest, 10);
  cyl(IRON, P(0.2, 0.84, -0.2), 0.05, 0.045, 0.08, chest, [0, 0, 1], 8); // tin cup on the side
  torus(BRASS, P(0, 0.88, -0.285), 0.03, 0.007, [0, 0, 1], chest, 8);
  for (const s of [1, -1]) rod(P(s * 0.12, 1.02, -0.13), P(s * 0.15, 0.9, -0.12), 0.012, LEATHER_D, chest);

  // ---- legs ---------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s === 1 ? "L" : "R";
    const pts = limb(P(s * 0.1, 0.5, 0), P(s * 0.115, 0.1, 0.02), [0.22, 0.2], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: P(s * 0.115, 0, 0.06),
    });
    b.sweep(leg, [0.1, 0.09, 0.078, 0.07], { color: PANTS });
    const knee = leg.joints[1];
    const ankle = leg.tip!;
    const x = s * 0.115;
    b.joint(`toe${S}`, { parent: ankle, at: P(x, 0.075, 0.12), aim: P(x, 0.075, 0.22) });
    // knee guard
    const kp = pts[1].clone().add(V(0, 0.0, 0.075));
    blob(STEEL, kp, [0.052, 0.05, 0.032], knee, { seg: 7 });
    torus(BRASS, kp, 0.05, 0.007, [0, 0.1, 1], knee, 10);
    // boot
    rod(P(x, 0.27, 0.02), P(x, 0.09, 0.02), [0.095, 0.082], LEATHER, ankle);
    rod(P(x, 0.285, 0.02), P(x, 0.235, 0.02), 0.105, LEATHER_D, ankle);
    b.ring(frame(P(x, 0.26, 0.02), [0, 1, 0]), { count: 8, radius: 0.105 }, (it) =>
      b.stick(new THREE.SphereGeometry(0.011, 5, 4), GILT, it, { bone: ankle, embed: 0.4 }),
    );
    b.capsule(P(x, 0.078, -0.04), P(x, 0.078, 0.14), 0.07, LEATHER, { bone: ankle });
    box(LEATHER_D, P(x, 0.015, 0.04), [0.17, 0.03, 0.3], ankle);
    blob(STEEL, P(x, 0.065, 0.17), [0.065, 0.05, 0.06], ankle, { seg: 7 });
    torus(BRASS, P(x, 0.17, 0.02), 0.088, 0.012, [0, 1, 0], ankle, 10);
    box(GILT, P(x + s * 0.0, 0.17, 0.11), [0.03, 0.035, 0.012], ankle);
  }

  // ---- arms ---------------------------------------------------------------------------------------------------
  let wristR: Joint | null = null;
  for (const s of [1, -1]) {
    const S = s === 1 ? "L" : "R";
    const sh = P(s * 0.26, 0.98, 0);
    const hand = s === 1 ? P(0.4, 0.6, 0.1) : GRIP.toArray();
    const pts = limb(sh, hand, [0.22, 0.21], [[s * 0.5, -0.2, -1]]);
    const arm = b.chain(`arm${S}`, pts, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const wrist = arm.tip!;
    b.sweep(arm, [0.078, 0.07, 0.062, 0.056], {
      bands: [
        [0.5, BLUE],
        [1, SKIN],
      ],
    });
    // leather bracer + studs
    rod(lerp(pts[1], pts[2], 0.3), lerp(pts[1], pts[2], 0.92), [0.07, 0.062], LEATHER, elbow);
    for (const t of [0.4, 0.62, 0.84])
      blob(GILT, lerp(pts[1], pts[2], t).add(V(s * 0.02, 0.02, 0.055)), 0.011, elbow, { seg: 5 });
    blob(BRONZE, pts[1].clone().add(V(s * 0.02, 0, -0.045)), [0.06, 0.06, 0.05], elbow, { seg: 6 });

    // pauldron: three overlapping lames, gilt rims, rivets and a spike
    const C = P(s * 0.31, 1.0, 0);
    const up = V(s * 0.45, 1, 0).normalize();
    const tiers: [number, number, number, ColorInput][] = [
      [-0.04, 0.21, 0.07, STEEL],
      [0.0, 0.185, 0.07, BRONZE],
      [0.04, 0.15, 0.07, STEEL],
    ];
    for (const [off, rad, h, col] of tiers) {
      const c = V(C[0], C[1], C[2]).addScaledVector(up, off);
      b.part(new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), col, {
        bone: shoulder,
        at: c,
        dir: up,
        scale: [rad, h, rad],
        flat: true,
      });
      torus(GILT, c, rad, 0.009, up, shoulder, 12);
    }
    const mid = V(C[0], C[1], C[2]);
    b.ring(frame(mid.clone().addScaledVector(up, 0.0), up), { count: 8, radius: 0.18 }, (it) =>
      b.stick(new THREE.SphereGeometry(0.012, 5, 4), GILT, it, { bone: shoulder, embed: 0.3 }),
    );
    b.spike(mid.clone().addScaledVector(up, 0.1), up, 0.09, 0.03, { color: BRASS, bone: shoulder, sides: 6 });

    // hands
    if (s === 1) {
      const fd = pts[2].clone().sub(pts[1]).normalize();
      const palm = pts[2].clone().addScaledVector(fd, 0.05);
      blob(SKIN, palm, [0.03, 0.05, 0.048], wrist, { dir: fd, seg: 7, flat: false });
      const lens = [0.9, 1.05, 1, 0.8];
      const curl = fd.clone().add(V(0, 0, 0.35)).normalize();
      for (let k = 0; k < 4; k++) {
        const base = palm.clone().addScaledVector(fd, 0.04).add(V(0, 0, (k - 1.5) * 0.024));
        const p1 = base.clone().addScaledVector(fd, 0.042 * lens[k]);
        const p2 = p1.clone().addScaledVector(curl, 0.036 * lens[k]);
        const ch = b.chain(`finger${k + 1}${S}`, [base, p1, p2], {
          parent: wrist,
          names: [`finger${k + 1}a${S}`, `finger${k + 1}b${S}`],
          role: "digit",
        });
        b.sweep(ch, [0.0155, 0.013, 0.01], { color: SKIN, sides: 6 });
      }
      const tb = palm.clone().add(V(-0.018, 0.0, 0.045));
      const t1 = tb.clone().add(V(-0.012, -0.03, 0.035));
      const t2 = t1.clone().add(V(-0.004, -0.03, 0.025));
      const th = b.chain(`thumb${S}`, [tb, t1, t2], { parent: wrist, names: [`thumb1${S}`, `thumb2${S}`], role: "digit" });
      b.sweep(th, [0.018, 0.015, 0.011], { color: SKIN, sides: 6 });
    } else {
      wristR = wrist;
      // gloved fist wrapped round the stock
      for (let k = 0; k < 4; k++) torus(LEATHER, gp(0.345 + 0.024 * k), 0.043, 0.014, GA, wrist, 8);
      blob(LEATHER, gp(0.385, 0.012), [0.05, 0.04, 0.05], wrist, { dir: GA, seg: 6 });
      b.capsule(gp(0.33, 0.045), gp(0.43, 0.04), 0.014, SKIN, { bone: wrist });
    }
  }

  // ---- blunderbuss --------------------------------------------------------------------------------------------
  const W = wristR!;
  b.frustumBox(gp(0.02, -0.03), gp(0.4, -0.005), [0.05, 0.12], [0.046, 0.06], { color: WOOD, bone: W });
  b.frustumBox(gp(0.004, -0.03), gp(0.022, -0.03), [0.054, 0.13], [0.054, 0.13], { color: BRASS, bone: W });
  b.frustumBox(gp(0.12, 0.03), gp(0.3, 0.025), [0.035, 0.03], [0.04, 0.03], { color: WOOD, bone: W }); // cheek
  b.frustumBox(gp(0.4, -0.035), gp(0.66, -0.04), [0.07, 0.05], [0.058, 0.04], { color: WOOD, bone: W });
  rod(gp(0.38), gp(0.71), [0.034, 0.03], STEEL, W);
  for (const u of [0.45, 0.55, 0.65]) torus(BRASS, gp(u), 0.036, 0.008, GA, W, 10);
  for (const s of [1, -1]) {
    b.frustumBox(gp(0.4, 0, s * 0.027), gp(0.5, 0, s * 0.027), [0.012, 0.05], [0.012, 0.04], { color: BRASS, bone: W });
    blob(GILT, gp(0.45, 0, s * 0.034), 0.008, W, { seg: 5 });
  }
  // flintlock
  rod(gp(0.43, 0.03), gp(0.39, 0.09), 0.008, IRON, W);
  blob(IRON, gp(0.385, 0.092), 0.014, W, { seg: 5 });
  b.frustumBox(gp(0.45, 0.034), gp(0.5, 0.034), [0.02, 0.014], [0.026, 0.014], { color: BRASS, bone: W });
  // trigger guard
  b.sweep(catmull([gp(0.34, -0.022), gp(0.355, -0.075), gp(0.415, -0.082), gp(0.445, -0.028)]), 0.0065, {
    color: BRASS,
    bone: W,
    sides: 5,
    caps: "flat",
  });
  rod(gp(0.39, -0.02), gp(0.395, -0.05), 0.005, IRON, W);
  // flared muzzle bell
  const BELL: OutlinePoint[] = [
    [0, 0],
    [0.034, 0],
    [0.037, 0.04],
    [0.05, 0.1],
    [0.072, 0.16],
    [0.092, 0.205],
    [0.092, 0.222],
    [0, 0.222],
  ];
  b.lathe(BELL, { at: gp(0.7), axis: GA, segments: 10, color: BRASS, bone: W });
  torus(GILT, gp(0.915), 0.088, 0.01, GA, W, 12);
  b.part(new THREE.CircleGeometry(0.074, 10), INKC, { bone: W, at: gp(0.926), dir: GA, axis: "z" });
  cone(gp(0.69, 0.04));
  function cone(at: THREE.Vector3) {
    b.part(new THREE.ConeGeometry(0.01, 0.03, 5), BRASS, { bone: W, at, dir: GU });
  }
  // ramrod and pipes
  rod(gp(0.42, -0.07), gp(0.85, -0.07), 0.008, WOOD, W);
  for (const u of [0.45, 0.62]) torus(BRASS, gp(u, -0.05), 0.012, 0.005, GA, W, 6);
  b.part(new THREE.PlaneGeometry(0.2, 0.05), "#ffffff", {
    bone: W,
    at: gp(0.18, -0.01, -0.0275),
    dir: GS.clone().negate(),
    axis: "z",
    up: GU,
    texture: SCROLL,
  });
  // sling ring and strap loop
  torus(BRASS, gp(0.3, -0.05), 0.016, 0.004, GS, W, 8);

  // ---- head ---------------------------------------------------------------------------------------------------
  const HC = P(0, 1.29, 0.05);
  const skull = blob(SKIN, HC, [0.148, 0.14, 0.15], head, { seg: 12, flat: false });
  blob(SKIN, P(0, 1.185, 0.11), [0.1, 0.06, 0.1], jaw, { seg: 8, flat: false }); // lower jaw
  box(CREAM, P(0, 1.2, 0.18), [0.07, 0.014, 0.02], jaw);
  blob(NOSE, P(0, 1.255, 0.205), [0.05, 0.047, 0.055], head, { seg: 8, flat: false });
  rod(P(0, 1.31, 0.19), P(0, 1.265, 0.215), 0.03, SKIN, head);
  for (const s of [1, -1]) {
    rod(P(s * 0.015, 1.325, 0.2), P(s * 0.14, 1.32, 0.12), 0.034, SKIN, head);
    b.sweep(bezier(P(s * 0.01, 1.338, 0.215), P(s * 0.07, 1.358, 0.21), P(s * 0.135, 1.328, 0.14)), [0.03, 0.01], {
      color: BEARD,
      bone: head,
      sides: 6,
    });
    blob(SKIN, P(s * 0.095, 1.235, 0.14), 0.058, head, { seg: 7, flat: false });
    blob(SKIN, P(s * 0.15, 1.28, 0.04), [0.025, 0.05, 0.04], head, { seg: 6 });
    b.decal(skull, EYE, {
      at: P(s * 0.078, 1.277, 0.2),
      dir: [0, 0, 1],
      size: [0.088, 0.062],
      mirror: s > 0,
    });
    // mustache
    b.sweep(bezier(P(s * 0.012, 1.218, 0.215), P(s * 0.085, 1.185, 0.235), P(s * 0.145, 1.245, 0.185)), [0.04, 0.008], {
      color: BEARD_HI,
      bone: head,
      sides: 6,
    });
    // side whiskers
    b.sweep(catmull([P(s * 0.135, 1.27, 0.06), P(s * 0.125, 1.19, 0.13), P(s * 0.07, 1.16, 0.2)]), [0.05, 0.07], {
      color: BEARD,
      bone: jaw,
      sides: 7,
    });
  }

  // beard
  const beard = b.sweep(catmull([P(0, 1.19, 0.15), P(0, 1.08, 0.19), P(0, 0.98, 0.2), P(0, 0.91, 0.2)]), (t) => [0.12 - 0.045 * t, 0.075 - 0.02 * t], {
    color: BEARD,
    bone: jaw,
    sides: 8,
  });
  const fuzz = b.surface(beard).scatter(60, { rng: r, minDist: 0.04, filter: (h) => h.n.z > 0.1 });
  b.cards(fuzz, HAIR, {
    size: [0.045, 0.085],
    lean: 70,
    flow: [0, -1, 0.2],
    vary: 0.3,
    rng: r,
    bend: 20,
    color: BEARD_HI,
    bone: jaw,
  });
  const lockX = [-0.1, -0.05, 0, 0.05, 0.1];
  const lockL = [0.09, 0.13, 0.17, 0.13, 0.09];
  lockX.forEach((x, i) =>
    lock(P(x, 0.95, 0.205), 0.034, lockL[i], 0.05, i % 2 ? BEARD_HI : BEARD, jaw, Math.sign(x) * 0.18),
  );
  // braids
  const braid = (s: number) => {
    const path = polyline([P(s * 0.065, 0.98, 0.272), P(s * 0.075, 0.83, 0.262), P(s * 0.08, 0.68, 0.25)]);
    let i = 0;
    b.along(path, 11, (at) => {
      const d = at.axis.clone();
      d.x += (i % 2 ? 1 : -1) * 0.8;
      blob(i % 3 === 0 ? BEARD_HI : BEARD, at.at, [0.03, 0.037, 0.026], jaw, { dir: d, seg: 6 });
      i++;
    });
    torus(GILT, P(s * 0.082, 0.66, 0.25), 0.03, 0.009, [0, 1, 0], jaw, 8);
    blob(GILT, P(s * 0.082, 0.775, 0.268), [0.02, 0.012, 0.02], jaw, { seg: 6 });
    lock(P(s * 0.082, 0.655, 0.25), 0.026, 0.08, 0.035, BEARD_HI, jaw, s * 0.1);
  };
  braid(1);
  braid(-1);

  // ---- helmet -------------------------------------------------------------------------------------------------
  const HAT: OutlinePoint[] = [
    [0, 0],
    [0.2, 0],
    [0.228, 0.015],
    [0.21, 0.03],
    [0.168, 0.04],
    [0.165, 0.09],
    [0.14, 0.125],
    [0.08, 0.15],
    [0, 0.155],
  ];
  const HZ = 0.045;
  const HY = 1.38;
  b.lathe(HAT, { at: P(0, HY, HZ), segments: 12, color: STEEL, bone: head });
  torus(BRASS, P(0, HY + 0.015, HZ), 0.225, 0.01, [0, 1, 0], head, 14);
  torus(LEATHER_D, P(0, HY + 0.065, HZ), 0.17, 0.016, [0, 1, 0], head, 14);
  b.ring(frame(P(0, HY + 0.105, HZ), [0, 1, 0]), { count: 10, radius: 0.157 }, (it) =>
    b.stick(new THREE.SphereGeometry(0.011, 5, 4), GILT, it, { bone: head, embed: 0.3 }),
  );
  for (const s of [1, -1]) {
    const lc = P(s * 0.058, HY + 0.07, HZ + 0.182);
    const ld: [number, number, number] = [0, 0.12, 1];
    cyl(BRASS, lc, 0.04, 0.04, 0.035, head, ld, 8);
    torus(BRONZE, lc, 0.04, 0.007, ld, head, 8);
    glow(
      b.part(new THREE.CircleGeometry(0.031, 8), "#7fe8ff", {
        bone: head,
        at: [lc[0], lc[1] + 0.003, lc[2] + 0.02],
        dir: ld,
        axis: "z",
      }),
      1.4,
    );
  }
  rod(P(0, HY + 0.07, HZ + 0.17), P(0, HY + 0.07, HZ + 0.19), 0.02, BRASS, head);
  cyl(BRASS, P(0, HY + 0.158, HZ), 0.02, 0.03, 0.03, head, [0, 1, 0], 6);
  b.sweep(catmull([P(0, HY + 0.16, HZ), P(0, HY + 0.27, HZ - 0.04), P(0, HY + 0.3, HZ - 0.14), P(0, HY + 0.24, HZ - 0.27)]), [0.042, 0.005], {
    color: RED,
    bone: head,
    sides: 6,
    caps: "point",
  });

  // ---- base and set dressing ----------------------------------------------------------------------------------
  const BASE: OutlinePoint[] = [
    [0, 0],
    [0.6, 0],
    [0.62, 0.03],
    [0.58, Y0 - 0.005],
    [0, Y0 - 0.005],
  ];
  b.lathe(BASE, { at: [0, 0, 0], segments: 12, color: STONE, bone: hips });
  const TURF: OutlinePoint[] = [
    [0, Y0 - 0.012],
    [0.56, Y0 - 0.012],
    [0.56, Y0 - 0.002],
    [0.4, Y0 + 0.008],
    [0, Y0 + 0.01],
  ];
  const turf = b.lathe(TURF, { at: [0, 0, 0], segments: 12, color: MOSS, bone: hips });
  b.ring(frame([0, 0.05, 0], [0, 1, 0]), { count: 11, radius: 0.58 }, (it) => {
    const sz = 0.05 + 0.04 * r();
    b.stick(new THREE.IcosahedronGeometry(1, 0), STONE, it, { embed: 0.4, scale: [sz * 1.2, sz, sz * 1.1], bone: hips });
  });
  const blades = b.surface(turf).scatter(80, {
    rng: r,
    minDist: 0.07,
    filter: (h) => h.n.y > 0.5 && Math.hypot(h.at.x, h.at.z) > 0.4 && !(h.at.z > 0.1 && Math.abs(h.at.x) < 0.45),
  });
  b.cards(blades, GRASS, { size: [0.045, 0.085], lean: 18, bend: 25, cross: true, vary: 0.35, rng: r, bone: hips });

  // powder keg
  const KX = 0.4;
  const KZ = -0.3;
  const KEG: OutlinePoint[] = [
    [0, 0],
    [0.115, 0],
    [0.135, 0.05],
    [0.15, 0.14],
    [0.135, 0.24],
    [0.115, 0.285],
    [0, 0.285],
  ];
  b.lathe(KEG, { at: [KX, Y0, KZ], segments: 10, color: WOOD, bone: hips });
  for (const [y, rr] of [
    [0.05, 0.138],
    [0.14, 0.154],
    [0.24, 0.138],
  ])
    b.part(new THREE.TorusGeometry(rr, 0.01, 5, 12), IRON, { bone: hips, at: [KX, Y0 + y, KZ], dir: [0, 1, 0], axis: "z", flat: true });
  const kd = V(0.2, 0, 1).normalize();
  b.part(new THREE.PlaneGeometry(0.095, 0.11), "#ffffff", {
    bone: hips,
    at: [KX + kd.x * 0.159, Y0 + 0.14, KZ + kd.z * 0.159],
    dir: kd,
    axis: "z",
    texture: KEG_LABEL,
  });
  // lantern on the keg
  const LT = Y0 + 0.285;
  box(BRASS, [KX, LT + 0.008, KZ], [0.09, 0.016, 0.09], hips);
  glow(box("#ffcf5a", [KX, LT + 0.06, KZ], [0.06, 0.085, 0.06], hips), 1.8);
  for (const [dx, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]])
    rod([KX + dx * 0.034, LT + 0.016, KZ + dz * 0.034], [KX + dx * 0.034, LT + 0.11, KZ + dz * 0.034], 0.005, BRASS, hips);
  b.part(new THREE.ConeGeometry(0.06, 0.04, 4), BRASS, { bone: hips, at: [KX, LT + 0.13, KZ], rotation: [0, 45, 0] });
  torus(BRASS, [KX, LT + 0.15, KZ], 0.025, 0.004, [1, 0, 0], hips, 8);

  // crates
  box(WOOD, [-0.3, Y0 + 0.1, -0.4], [0.3, 0.2, 0.24], hips, { rot: [0, 15, 0] });
  box(WOOD, [-0.27, Y0 + 0.25, -0.39], [0.2, 0.1, 0.16], hips, { rot: [0, -12, 0] });
  for (const dy of [0.02, 0.18])
    box(IRON, [-0.3, Y0 + dy, -0.4], [0.31, 0.022, 0.25], hips, { rot: [0, 15, 0] });
  box(BRASS, [-0.236, Y0 + 0.1, -0.265], [0.04, 0.05, 0.01], hips, { rot: [0, 15, 0] });
  // glowing fuse ember on the keg
  glow(blob("#ff7a1a", [KX + 0.1, Y0 + 0.285, KZ + 0.06], 0.014, hips, { seg: 6 }), 2.2);
  rod([KX + 0.09, Y0 + 0.28, KZ + 0.05], [KX + 0.04, Y0 + 0.26, KZ + 0.0], 0.005, LEATHER_D, hips);
  // spare cannonballs
  for (const [x, z] of [[0.18, -0.46], [0.24, -0.41], [0.12, -0.42]])
    blob(IRON, [x, Y0 + 0.04, z], 0.04, hips, { seg: 7 });

  return b.root;
}
