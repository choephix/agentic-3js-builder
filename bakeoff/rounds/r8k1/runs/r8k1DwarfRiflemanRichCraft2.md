1. **Broad, planted dwarf.** A character-only `cy()`/`P()` maps `y ≤ 0.5` to `0.8y` and subtracts 0.10 above that. Every character joint, part and the gun frame goes through it, and the scenery uses plain `Y0` offsets. The torso loft is 0.43–0.64 wide with depths +15%, shoulder roots are at ±0.30, pauldron centres at ±0.35 and ankles at ±0.155. Boot soles are 0.21 m and the boot bodies are enlarged to match. The skull is `[0.17, 0.16, 0.16]`, and the hips, pants, arms, plate, belt and tabard were widened and thickened to fit.
2. **Visible eyes.** The skin brow rod is 0.021 with endpoints raised by 0.015, and the eyebrow sweep starts at 0.021. The cheek blobs are lowered by 0.018 and shrunk to 0.048, and the side whiskers now sit below the outer eye corners. The eye decals are `[0.072, 0.050]`, placed by a ray against the enlarged skull. `HY` is raised by 0.02 and the outer brim is 0.235. The nose and the upward moustache curl are kept.
3. **Rifleman pose.** The gun is rebuilt on `GB = P(-0.32, 0.6, 0.16)` and `GM = P(0.53, 0.75, 0.46)`, so it runs diagonally across the waist (I nudged both y values up so the arms can reach). A `GQ` basis quaternion plus `up: GU` orients every gun piece. The right wrist is at `GRIP = gp(0.25)`, and the left wrist is at `gp(0.57, -0.085)`. The left hand has a palm under the forestock, four bent fingers wrapping the camera-facing side and a thumb over the far edge. Arm lengths are [0.28, 0.27] with elbow hints that push outward and back. The lock plate, hammer and scroll are on the camera-facing side.
4. **Beard and braids.** The 60-card scatter is replaced by about 10 short embedded accents. The beard is three overlapping tapered sweeps: broad under the jaw, mid, and a pointed tip. Each braid starts at `P(±0.065, 1.08, 0.255)` inside the beard. It is built from two intertwined helical sweeps of radius ~0.02 around a core sweep, with gilt bindings that follow the path and a tapered tail spike.
5. **Hollow bell.** The `BELL` profile now has an outer lip at 0.092 and an inner lip at 0.081, an 11 mm wall, then an inner taper back to the barrel. The bell paint darkens the interior and brightens the lip. The bore disk sits 42 mm behind the lip, facing outward, and the gilt rim torus meets the mouth.
6. **Smaller scene.** The base and turf radii are reduced to 0.49 and 0.46 and stretched 1.15× in x so the gun still sits over it. The keg moves to (0.34, -0.23) at 0.8 scale and the crate stack shrinks about 20% and sits behind the boots. The rocks, grass and cannonballs are re-placed for the new perimeter, and grass is excluded from the boots, keg and crates. I can't change the render camera framing from the module, so the tighter framing and the head close-up are left to the app.
7. **Colour blocks.** The beard, blue, wood and moss variation is cut by roughly 60%. `STEEL` is now a normal-driven paint: cool grey, light on upward facets, dark underneath. The beard is dark copper at the roots and gold on outward ridges. Brass is limited to rims, bindings and the muzzle lip, with bronze elsewhere. The backpack is built from bevelled (0.015) extrudes, with two wide leather straps running from the bedroll bindings down the pack back.

```ts
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
} from "agentic-3js-builder";
import type { ColorInput, Joint, OutlinePoint } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dwarf Rifleman",
  description:
    "A stout, barrel-chested Ironforge-style dwarf rifleman in chunky Warcraft proportions: braided copper beard, kettle helmet with glowing goggles, tiered steel pauldrons, a brass-lipped blunderbuss held low-ready in both hands, bandolier, powder horn and a small stone base with a powder keg, lantern and crates.",
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
// Coordinates: the character is shortened (legs 0.8x, torso/head shifted down 0.10); scenery uses Y0 directly.

const Y0 = 0.085; // height of the base top
const cy = (y: number) => (y <= 0.5 ? 0.8 * y : y - 0.1);
const P = (x: number, y: number, z: number): [number, number, number] => [x, cy(y) + Y0, z];

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
  const root = smoothstep(0.95 + Y0, 1.1 + Y0, p.y);
  const ridge = smoothstep(0.25, 0.85, Math.max(n.z, Math.abs(n.x) * 0.8)) * (1 - root);
  let c = mix(base, "#5e2a10", 0.6 * root);
  c = mix(c, "#e8923a", 0.5 * ridge);
  return mix(c, SHADOW_TINT, 0.28 * (1 - smoothstep(-0.6, 0.5, n.y)));
});
const BEARD_HI = paint((p, n) => {
  const base = resolve(COPPER_B, p, n);
  const root = smoothstep(0.95 + Y0, 1.12 + Y0, p.y);
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
const CREAM = tone("#e4d6ac");
const RED = tone("#b3261e");
const STONE = tone(patches("#35323c", ["#8f8b94", "#7b7882", "#a29c92"], { size: 0.16, gap: 0.08, seed: 20 }));
const MOSS = tone(mottle("#4f8a30", "#467d2b", { size: 0.08, seed: 21 }));
const STEEL = paint((p, n) => {
  const up = smoothstep(-0.1, 0.85, n.y);
  const mid = mix("#4a566e", "#8a98b0", smoothstep(-0.8, 0.15, n.y));
  const c = mix(mid, "#d6dfec", up * up);
  return mix(c, "#2a3040", 0.1 * (1 - noise(p, 0.06, 3)));
});
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

  // ---- gun frame (model space): GA along the barrel, GS toward the gun's back side, GU up ----------------------
  const GB = V(...P(-0.32, 0.6, 0.16));
  const GM = V(...P(0.53, 0.75, 0.46));
  const GA = GM.clone().sub(GB).normalize();
  const GS = new THREE.Vector3().crossVectors(V(0, 1, 0), GA).normalize();
  const GU = new THREE.Vector3().crossVectors(GA, GS).normalize();
  // local x = gun's right side (toward the camera), y = along the barrel, z = up
  const GQ = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(GS.clone().negate(), GA, GU),
  );
  const gp = (u: number, v = 0, w = 0) =>
    GB.clone().addScaledVector(GA, u).addScaledVector(GU, v).addScaledVector(GS, w);
  const GRIP = gp(0.25);
  const LHAND = gp(0.57, -0.085);

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
      { at: P(0, 0.5, 0), w: 0.43, h: 0.3 },
      { at: P(0, 0.68, 0.01), w: 0.46, h: 0.322 },
      { at: P(0, 0.88, 0.03), w: 0.55, h: 0.345 },
      { at: P(0, 1.02, 0.025), w: 0.64, h: 0.322 },
    ],
    { color: BLUE, bone: [hips, spine] },
  );
  blob(PANTS, P(0, 0.47, 0), [0.24, 0.1, 0.17], hips, { seg: 8 });
  rod(P(0, 1.0, 0.03), P(0, 1.2, 0.08), 0.085, SKIN, neckJ);
  b.lathe(
    [
      [0.1, -0.02],
      [0.17, -0.045],
      [0.2, 0.0],
      [0.15, 0.04],
      [0.105, 0.04],
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
  b.extrude(PLATE, { at: P(0, 0.7, 0.2), x: [1, 0, 0], thickness: 0.04, bevel: 0.008, color: BRONZE, bone: chest });
  b.extrude(PLATE_IN, { at: P(0, 0.7, 0.206), x: [1, 0, 0], thickness: 0.044, bevel: 0.01, color: STEEL, bone: chest });
  blob(GILT, P(0, 0.84, 0.235), [0.036, 0.036, 0.02], chest, { seg: 8 });
  torus(BRONZE, P(0, 0.84, 0.235), 0.04, 0.007, [0, 0, 1], chest, 10);

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
    scale: [1.18, 1, 0.88],
    flat: true,
  });
  box(GILT, P(0, 0.66, 0.208), [0.07, 0.06, 0.02], spine1);
  box(IRON, P(0, 0.66, 0.219), [0.04, 0.032, 0.01], spine1);
  b.part(new THREE.PlaneGeometry(0.2, 0.32), "#ffffff", {
    bone: hips,
    at: P(0, 0.46, 0.208),
    dir: [0, 0.05, 1],
    axis: "z",
    texture: TABARD,
  });
  // pouch (right hip) and powder horn (left hip)
  box(LEATHER, P(-0.24, 0.57, -0.01), [0.08, 0.1, 0.07], spine1);
  box(LEATHER_D, P(-0.24, 0.62, -0.005), [0.088, 0.04, 0.078], spine1);
  blob(BRASS, P(-0.24, 0.6, 0.034), 0.01, spine1, { seg: 6 });
  b.sweep(bezier(P(0.22, 0.63, 0.03), P(0.27, 0.5, 0.1), P(0.19, 0.43, 0.2)), [0.045, 0.008], {
    color: CREAM,
    bone: hips,
    caps: { start: "flat", end: "point" },
    sides: 8,
  });
  cyl(BRASS, P(0.22, 0.635, 0.03), 0.047, 0.047, 0.025, hips, [0.1, 1, 0.1], 8);
  rod(P(0.22, 0.64, 0.03), P(0.16, 0.7, 0.05), 0.006, LEATHER_D, spine1);

  // bandolier with cartridges (across right shoulder to left hip)
  const bandPath = catmull([
    P(-0.2, 1.0, 0.14),
    P(-0.1, 0.92, 0.235),
    P(0.02, 0.84, 0.25),
    P(0.14, 0.75, 0.24),
    P(0.22, 0.66, 0.17),
  ]);
  b.sweep(bandPath, () => [0.03, 0.01], { color: LEATHER_D, bone: chest, section: "box", caps: "flat" });
  b.along(bandPath, 7, (at) => {
    const p = at.at.clone().add(V(0, 0, 0.02));
    cyl(CREAM, p, 0.014, 0.014, 0.055, chest, [0.5, 1, 0], 6);
    cyl(BRASS, p.clone().add(V(0.012, 0.03, 0)), 0.015, 0.015, 0.014, chest, [0.5, 1, 0], 6);
  });

  // backpack: bevelled leather body and lid, bedroll, two straps
  const rect = (hw: number, hh: number): OutlinePoint[] => [
    [-hw, -hh],
    [hw, -hh],
    [hw, hh],
    [-hw, hh],
  ];
  b.extrude(rect(0.2, 0.17), { at: P(0, 0.85, -0.2), x: [1, 0, 0], thickness: 0.17, bevel: 0.015, color: LEATHER, bone: chest });
  b.extrude(rect(0.21, 0.05), { at: P(0, 1.0, -0.2), x: [1, 0, 0], thickness: 0.19, bevel: 0.015, color: LEATHER_D, bone: chest });
  cyl(tone("#6f7f9a", 0.2), P(0, 1.12, -0.2), 0.07, 0.07, 0.5, chest, [1, 0, 0], 10);
  for (const s of [1, -1]) {
    cyl(tone("#8c99b0", 0.2), P(s * 0.251, 1.12, -0.2), 0.055, 0.055, 0.012, chest, [1, 0, 0], 10);
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
    box(BRASS, P(s * 0.13, 0.78, -0.31), [0.05, 0.05, 0.012], chest);
    rod(P(s * 0.17, 1.0, -0.12), P(s * 0.2, 0.86, -0.1), 0.012, LEATHER_D, chest);
  }
  cyl(IRON, P(0.25, 0.8, -0.2), 0.05, 0.045, 0.08, chest, [0, 0, 1], 8); // tin cup
  torus(IRON, P(0, 0.86, -0.292), 0.03, 0.007, [0, 0, 1], chest, 8);

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
      b.stick(new THREE.SphereGeometry(0.011, 5, 4), GILT, it, { bone: ankle, embed: 0.4 }),
    );
    b.capsule(P(x, 0.078, -0.04), P(x, 0.078, 0.14), 0.088, LEATHER, { bone: ankle });
    box(LEATHER_D, P(x, 0.015, 0.07), [0.21, 0.03, 0.34], ankle);
    blob(STEEL, P(x, 0.065, 0.175), [0.095, 0.062, 0.075], ankle, { seg: 7 });
    torus(BRASS, P(x, 0.17, 0.02), 0.11, 0.011, [0, 1, 0], ankle, 10);
    box(GILT, P(x, 0.17, 0.134), [0.03, 0.035, 0.012], ankle);
  }

  // ---- arms ---------------------------------------------------------------------------------------------------
  let wristR: Joint | null = null;
  for (const s of [1, -1]) {
    const S = s === 1 ? "L" : "R";
    const sh = P(s * 0.3, 0.98, 0);
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
    b.sweep(arm, [0.085, 0.078, 0.07, 0.062], {
      bands: [
        [0.5, BLUE],
        [1, SKIN],
      ],
    });
    // leather bracer + studs
    rod(lerp(pts[1], pts[2], 0.3), lerp(pts[1], pts[2], 0.92), [0.075, 0.067], LEATHER, elbow);
    const outN = V(s * 0.7, 0.5, 0.3).normalize();
    for (const t of [0.4, 0.62, 0.84])
      blob(GILT, lerp(pts[1], pts[2], t).add(outN.clone().multiplyScalar(0.07)), 0.011, elbow, { seg: 5 });
    blob(BRONZE, pts[1].clone().add(V(s * 0.035, -0.01, -0.04)), [0.058, 0.058, 0.05], elbow, { seg: 6 });

    // pauldron: three overlapping lames, gilt rims, rivets and a spike
    const C = P(s * 0.35, 1.0, 0);
    const up = V(s * 0.45, 1, 0).normalize();
    const tiers: [number, number, number, ColorInput][] = [
      [-0.04, 0.22, 0.075, STEEL],
      [0.0, 0.195, 0.075, BRONZE],
      [0.04, 0.16, 0.075, STEEL],
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
    b.ring(frame(mid.clone(), up), { count: 8, radius: 0.19 }, (it) =>
      b.stick(new THREE.SphereGeometry(0.012, 5, 4), GILT, it, { bone: shoulder, embed: 0.3 }),
    );
    b.spike(mid.clone().addScaledVector(up, 0.1), up, 0.09, 0.03, { color: BRONZE, bone: shoulder, sides: 6 });

    if (s === 1) {
      // left hand: palm under the forestock, fingers wrapping the camera side, thumb over the far edge
      blob(SKIN, gp(0.6, -0.088), [0.048, 0.056, 0.022], wrist, { q: GQ, seg: 7, flat: false });
      const lens = [0.95, 1.05, 1, 0.85];
      for (let k = 0; k < 4; k++) {
        const u = 0.565 + k * 0.026;
        const pk = [
          gp(u, -0.085, -0.018),
          gp(u, -0.075, -0.052),
          gp(u, -0.04, -0.057),
          gp(u, -0.04 + 0.03 * lens[k], -0.042),
        ];
        const ch = b.chain(`finger${k + 1}${S}`, pk, {
          parent: wrist,
          names: [`finger${k + 1}a${S}`, `finger${k + 1}b${S}`, `finger${k + 1}c${S}`],
          role: "digit",
        });
        b.sweep(ch, [0.016, 0.014, 0.013, 0.01], { color: SKIN, sides: 6 });
      }
      const th = b.chain(`thumb${S}`, [gp(0.545, -0.085, 0.02), gp(0.555, -0.06, 0.05), gp(0.575, -0.025, 0.047)], {
        parent: wrist,
        names: [`thumb1${S}`, `thumb2${S}`],
        role: "digit",
      });
      b.sweep(th, [0.018, 0.015, 0.012], { color: SKIN, sides: 6 });
    } else {
      wristR = wrist;
      // gloved fist wrapped round the small of the stock
      for (let k = 0; k < 4; k++) torus(LEATHER, gp(0.21 + 0.025 * k, -0.012), 0.047, 0.014, GA, wrist, 8);
      blob(LEATHER, gp(0.25, -0.012), [0.05, 0.06, 0.05], wrist, { q: GQ, seg: 6 });
      blob(SKIN, gp(0.25, 0.042, -0.012), 0.022, wrist, { seg: 6 });
      b.capsule(gp(0.21, 0.045, -0.012), gp(0.3, 0.043, -0.012), 0.014, SKIN, { bone: wrist });
    }
  }

  // ---- blunderbuss --------------------------------------------------------------------------------------------
  const W = wristR!;
  const up = GU.toArray() as [number, number, number];
  b.frustumBox(gp(0.02, -0.03), gp(0.36, -0.005), [0.05, 0.13], [0.042, 0.07], { color: WOOD, bone: W, up });
  b.frustumBox(gp(0.004, -0.03), gp(0.022, -0.03), [0.054, 0.135], [0.054, 0.135], { color: BRONZE, bone: W, up });
  b.frustumBox(gp(0.36, -0.036), gp(0.66, -0.04), [0.07, 0.05], [0.058, 0.04], { color: WOOD, bone: W, up });
  rod(gp(0.34), gp(0.71), [0.034, 0.03], STEEL, W);
  for (const u of [0.45, 0.55, 0.65]) torus(BRONZE, gp(u), 0.037, 0.008, GA, W, 10);
  // lock plate and flintlock on the camera side
  b.frustumBox(gp(0.36, 0.0, -0.03), gp(0.47, 0.005, -0.03), [0.012, 0.05], [0.012, 0.04], { color: BRONZE, bone: W, up });
  b.frustumBox(gp(0.36, 0.0, 0.03), gp(0.47, 0.005, 0.03), [0.012, 0.05], [0.012, 0.04], { color: BRONZE, bone: W, up });
  blob(GILT, gp(0.42, 0.0, -0.037), 0.008, W, { seg: 5 });
  rod(gp(0.4, 0.025, -0.034), gp(0.37, 0.085, -0.034), 0.008, IRON, W);
  blob(IRON, gp(0.367, 0.088, -0.034), 0.014, W, { seg: 5 });
  b.frustumBox(gp(0.455, 0.03, -0.034), gp(0.5, 0.03, -0.034), [0.02, 0.014], [0.026, 0.014], { color: BRONZE, bone: W, up });
  // trigger guard
  b.sweep(catmull([gp(0.31, -0.022), gp(0.325, -0.08), gp(0.385, -0.088), gp(0.415, -0.03)]), 0.0065, {
    color: BRONZE,
    bone: W,
    sides: 5,
    caps: "flat",
  });
  rod(gp(0.36, -0.02), gp(0.365, -0.05), 0.005, IRON, W);
  // ramrod on the back side
  rod(gp(0.4, -0.04, 0.042), gp(0.86, -0.04, 0.042), 0.008, WOOD, W);
  // engraved scroll plate on the stock, camera side
  b.part(new THREE.PlaneGeometry(0.16, 0.05), "#ffffff", {
    bone: W,
    at: gp(0.12, -0.012, -0.0265),
    dir: GS.clone().negate(),
    axis: "z",
    up: GU,
    texture: SCROLL,
  });
  // flared muzzle bell: hollow, with an inner return wall and a thick lip
  const BELL: OutlinePoint[] = [
    [0, 0],
    [0.034, 0],
    [0.037, 0.04],
    [0.05, 0.1],
    [0.072, 0.16],
    [0.092, 0.205],
    [0.092, 0.222],
    [0.081, 0.222],
    [0.076, 0.2],
    [0.058, 0.15],
    [0.042, 0.1],
    [0.03, 0.075],
    [0, 0.07],
  ];
  const BELLP = paint((_p, n) => {
    const d = n.dot(GA);
    if (d > 0.9) return "#f2c458";
    if (d > 0.03) return "#2a180e";
    return BRONZE;
  });
  b.lathe(BELL, { at: gp(0.7), axis: GA, segments: 10, color: BELLP, bone: W });
  torus(GILT, gp(0.921), 0.0865, 0.007, GA, W, 12);
  b.part(new THREE.CircleGeometry(0.066, 10), INKC, { bone: W, at: gp(0.881), dir: GA, axis: "z" });

  // ---- head ---------------------------------------------------------------------------------------------------
  const HC = P(0, 1.29, 0.05);
  const skull = blob(SKIN, HC, [0.17, 0.16, 0.16], head, { seg: 12, flat: false });
  blob(SKIN, P(0, 1.185, 0.115), [0.115, 0.065, 0.11], jaw, { seg: 8, flat: false }); // lower jaw
  box(CREAM, P(0, 1.2, 0.19), [0.07, 0.014, 0.02], jaw);
  blob(NOSE, P(0, 1.255, 0.215), [0.048, 0.047, 0.055], head, { seg: 8, flat: false });
  rod(P(0, 1.31, 0.2), P(0, 1.268, 0.225), 0.03, SKIN, head);
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    rod(P(s * 0.015, 1.335, 0.205), P(s * 0.14, 1.342, 0.13), 0.021, SKIN, head);
    b.sweep(bezier(P(s * 0.01, 1.34, 0.21), P(s * 0.07, 1.358, 0.205), P(s * 0.135, 1.348, 0.14)), [0.021, 0.008], {
      color: BEARD,
      bone: head,
      sides: 6,
    });
    blob(SKIN, P(s * 0.095, 1.217, 0.14), 0.048, head, { seg: 7, flat: false });
    blob(SKIN, P(s * 0.165, 1.28, 0.04), [0.025, 0.05, 0.04], head, { seg: 6 });
    const ey = P(0, 1.28, 0)[1];
    const eh = skin.ray([s * 0.085, ey, 1], [0, 0, -1]);
    b.decal(skull, EYE, {
      at: eh ? eh.at : [s * 0.085, ey, 0.19],
      dir: [0, 0, 1],
      size: [0.072, 0.05],
      mirror: s > 0,
    });
    // moustache with an upward curl
    b.sweep(bezier(P(s * 0.012, 1.218, 0.225), P(s * 0.085, 1.185, 0.245), P(s * 0.14, 1.235, 0.19)), [0.04, 0.008], {
      color: BEARD_HI,
      bone: head,
      sides: 6,
    });
    // side whiskers, kept below the outer eye corners
    b.sweep(catmull([P(s * 0.14, 1.2, 0.06), P(s * 0.125, 1.15, 0.13), P(s * 0.07, 1.12, 0.2)]), [0.04, 0.05], {
      color: BEARD,
      bone: jaw,
      sides: 7,
    });
  }

  // beard: three overlapping tapered volumes
  const beardA = b.sweep(catmull([P(0, 1.18, 0.12), P(0, 1.12, 0.2), P(0, 1.06, 0.225)]), (t) => [0.15 - 0.04 * t, 0.085 - 0.01 * t], {
    color: BEARD,
    bone: jaw,
    sides: 8,
  });
  const beardB = b.sweep(catmull([P(0, 1.1, 0.205), P(0, 1.0, 0.23), P(0, 0.92, 0.24)]), (t) => [0.125 - 0.04 * t, 0.075 - 0.015 * t], {
    color: BEARD,
    bone: jaw,
    sides: 8,
  });
  const beardC = b.sweep(catmull([P(0, 1.0, 0.225), P(0, 0.9, 0.235), P(0, 0.83, 0.235)]), (t) => [0.095 - 0.08 * t, 0.06 - 0.04 * t], {
    color: BEARD_HI,
    bone: jaw,
    sides: 8,
    caps: "point",
  });
  const accents = b.surface([beardA, beardB, beardC]).scatter(10, {
    rng: r,
    minDist: 0.07,
    filter: (h) => Math.abs(h.n.x) > 0.55,
  });
  b.cards(accents, HAIR, {
    size: [0.04, 0.075],
    lean: 40,
    flow: [0, -1, 0.15],
    bend: 10,
    vary: 0.2,
    sink: 0.3,
    rng: r,
    color: BEARD_HI,
    bone: jaw,
  });

  // braids: two intertwined strands around a core, with gilt bindings
  const braid = (s: number) => {
    const ctrl = catmull([P(s * 0.065, 1.08, 0.255), P(s * 0.07, 0.96, 0.262), P(s * 0.074, 0.86, 0.258), P(s * 0.076, 0.78, 0.252)]);
    const N = 44;
    const strand = (k: number) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        const c = ctrl.at(t);
        const R = 0.02 * (1 - 0.55 * smoothstep(0.72, 1, t));
        const ph = 2 * Math.PI * 5 * t + k * Math.PI;
        pts.push(V(c.x + Math.cos(ph) * R, c.y, c.z + Math.sin(ph) * R));
      }
      return catmull(pts);
    };
    b.sweep(ctrl, (t) => 0.017 * (1 - 0.5 * smoothstep(0.75, 1, t)), { color: BEARD, bone: jaw, sides: 6 });
    for (const k of [0, 1])
      b.sweep(strand(k), (t) => 0.021 - 0.007 * smoothstep(0.72, 1, t), {
        color: k ? BEARD_HI : BEARD,
        bone: jaw,
        sides: 6,
      });
    torus(GILT, P(s * 0.07, 0.965, 0.262), 0.034, 0.009, [0, 1, 0], jaw, 8);
    torus(GILT, P(s * 0.076, 0.79, 0.253), 0.032, 0.009, [0, 1, 0], jaw, 8);
    blob(GILT, P(s * 0.066, 1.0, 0.262), [0.02, 0.012, 0.02], jaw, { seg: 6 });
    b.spike(P(s * 0.076, 0.78, 0.252), [0, -1, 0], 0.07, 0.03, { color: BEARD_HI, bone: jaw, sides: 6 });
  };
  braid(1);
  braid(-1);

  // ---- helmet -------------------------------------------------------------------------------------------------
  const HAT: OutlinePoint[] = [
    [0, 0],
    [0.215, 0],
    [0.235, 0.015],
    [0.222, 0.03],
    [0.17, 0.04],
    [0.167, 0.09],
    [0.14, 0.125],
    [0.08, 0.15],
    [0, 0.155],
  ];
  const HZ = 0.045;
  const HY = 1.375;
  b.lathe(HAT, { at: P(0, HY, HZ), segments: 12, color: STEEL, bone: head });
  torus(BRASS, P(0, HY + 0.015, HZ), 0.232, 0.01, [0, 1, 0], head, 14);
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
  b.sweep(bezier(P(0, HY + 0.17, HZ), P(0, HY + 0.33, HZ - 0.1), P(0, HY + 0.24, HZ - 0.27)), [0.03, 0.004], {
    color: RED,
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
  b.part(new THREE.LatheGeometry(L2(BASE), 14), STONE, { bone: hips, at: [0, 0, 0], scale: [1.15, 1, 1], flat: true });
  const TURF: [number, number][] = [
    [0, Y0 - 0.012],
    [0.46, Y0 - 0.012],
    [0.46, Y0 - 0.002],
    [0.33, Y0 + 0.008],
    [0, Y0 + 0.01],
  ];
  const turf = b.part(new THREE.LatheGeometry(L2(TURF), 14), MOSS, {
    bone: hips,
    at: [0, 0, 0],
    scale: [1.15, 1, 1],
    flat: true,
  });
  for (let i = 0; i < 11; i++) {
    const th = (i / 11) * Math.PI * 2 + 0.2 * r();
    const sz = 0.04 + 0.035 * r();
    b.part(new THREE.IcosahedronGeometry(1, 0), STONE, {
      bone: hips,
      at: [Math.cos(th) * 0.53, Y0 * 0.55, Math.sin(th) * 0.465],
      scale: [sz * 1.2, sz, sz * 1.1],
      rotation: [r() * 360, r() * 360, r() * 360],
      flat: true,
    });
  }
  const blades = b.surface(turf).scatter(80, {
    rng: r,
    minDist: 0.07,
    filter: (h) => {
      const { x, z } = h.at;
      if (h.n.y < 0.5 || Math.hypot(x / 0.53, z / 0.46) < 0.5 || Math.hypot(x / 0.53, z / 0.46) > 0.95) return false;
      if (Math.abs(x) < 0.3 && z > -0.15 && z < 0.27) return false; // boots
      if (Math.hypot(x - 0.34, z + 0.23) < 0.2) return false; // keg
      if (x > -0.4 && x < -0.04 && z > -0.45 && z < -0.15) return false; // crates
      return true;
    },
  });
  b.cards(blades, GRASS, { size: [0.045, 0.085], lean: 18, bend: 25, cross: true, vary: 0.35, rng: r, bone: hips });

  // powder keg with a lantern
  const KX = 0.34;
  const KZ = -0.23;
  const KEG: OutlinePoint[] = [
    [0, 0],
    [0.092, 0],
    [0.108, 0.04],
    [0.12, 0.112],
    [0.108, 0.192],
    [0.092, 0.228],
    [0, 0.228],
  ];
  b.lathe(KEG, { at: [KX, Y0, KZ], segments: 10, color: WOOD, bone: hips });
  for (const [y, rr] of [
    [0.04, 0.11],
    [0.112, 0.123],
    [0.192, 0.11],
  ])
    b.part(new THREE.TorusGeometry(rr, 0.008, 5, 12), IRON, { bone: hips, at: [KX, Y0 + y, KZ], dir: [0, 1, 0], axis: "z", flat: true });
  const kd = V(0.2, 0, 1).normalize();
  b.part(new THREE.PlaneGeometry(0.08, 0.09), "#ffffff", {
    bone: hips,
    at: [KX + kd.x * 0.126, Y0 + 0.112, KZ + kd.z * 0.126],
    dir: kd,
    axis: "z",
    texture: KEG_LABEL,
  });
  const LT = Y0 + 0.228;
  box(BRASS, [KX, LT + 0.007, KZ], [0.075, 0.014, 0.075], hips);
  glow(box("#ffcf5a", [KX, LT + 0.05, KZ], [0.05, 0.07, 0.05], hips), 1.8);
  for (const [dx, dz] of [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ])
    rod([KX + dx * 0.028, LT + 0.014, KZ + dz * 0.028], [KX + dx * 0.028, LT + 0.09, KZ + dz * 0.028], 0.004, BRASS, hips);
  b.part(new THREE.ConeGeometry(0.05, 0.034, 4), BRASS, { bone: hips, at: [KX, LT + 0.107, KZ], rotation: [0, 45, 0] });
  torus(BRASS, [KX, LT + 0.125, KZ], 0.02, 0.0035, [1, 0, 0], hips, 8);

  // crates (smaller, tucked behind the boots)
  box(WOOD, [-0.22, Y0 + 0.08, -0.3], [0.24, 0.16, 0.19], hips, { rot: [0, 15, 0] });
  box(WOOD, [-0.2, Y0 + 0.2, -0.29], [0.16, 0.08, 0.13], hips, { rot: [0, -12, 0] });
  for (const dy of [0.016, 0.144])
    box(IRON, [-0.22, Y0 + dy, -0.3], [0.25, 0.018, 0.2], hips, { rot: [0, 15, 0] });
  box(BRONZE, [-0.17, Y0 + 0.08, -0.205], [0.035, 0.045, 0.01], hips, { rot: [0, 15, 0] });
  // spare cannonballs
  for (const [x, z] of [
    [0.04, -0.36],
    [0.1, -0.32],
    [0.1, -0.4],
  ])
    blob(IRON, [x, Y0 + 0.035, z], 0.035, hips, { seg: 7 });

  return b.root;
}
```