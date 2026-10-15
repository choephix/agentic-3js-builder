import * as THREE from "three";
import {
  aim,
  bezier,
  catmull,
  cells,
  countershade,
  createBuilder,
  frame,
  grain,
  limb,
  mix,
  mottle,
  noise,
  paint,
  resolve,
  rng,
  smoothstep,
  stripes,
  svg,
} from "../../../../src/index";
import type { Joint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Swamp Troll",
  description:
    "Hunched Warcraft-style swamp troll: teal mottled hide with mud and moss, huge upturned gold-ringed tusks, a crimson-to-orange mohawk, voodoo bone fetishes with glowing green eyes (necklace, belt, shoulder skull, back totem), tribal war paint and a tattered loincloth.",
};

type V3 = [number, number, number];
type Outline = ([number, number] | [number, number, "sharp"])[];
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------- palette
const MOSS_C = "#6f9b3a";
const MUD_C = "#4b3a24";
const WART_C = "#2a5c52";
const IVORY = "#efe6cb";
const GOLD = "#e0aa2c";
const DARK = "#15100c";
const CLAW = "#2b2218";
const MOUTH = "#4a1422";
const TONGUE = "#b8405a";
const GLOW_GREEN = "#8dff3a";
const MOH_ROOT = "#5a0b2c";
const MOH_MID = "#d22a2f";
const MOH_TIP = "#ff9a2a";
const CLOTH_RED = "#a8321f";
const CLOTH_DK = "#5b1913";

// ---------------------------------------------------------------- paints
const SKIN_CORE = countershade(
  mottle("#4a9c8a", "#2f6f6c", { size: 0.2, seed: 4, contrast: 1.3 }),
  "#98c8a0",
  { level: -0.3, soft: 0.5 },
);
const SKIN = paint((p, n) => {
  let c = resolve(SKIN_CORE, p, n);
  const mud = smoothstep(0.38, 0.12, p.y + 0.09 * noise(p, 0.06, 6));
  const moss = smoothstep(0.45, 0.9, n.y) * smoothstep(0.52, 0.7, noise(p, 0.16, 8));
  c = mix(c, MOSS_C, moss * 0.8);
  c = mix(c, MUD_C, mud * 0.9);
  const w = cells(p, 0.11, 3);
  if (w.id > 0.86 && w.d1 < 0.16) c = mix(c, WART_C, 0.8);
  const k = 0.88 + 0.16 * smoothstep(-0.8, 0.8, n.y);
  return [c[0] * k, c[1] * k, c[2] * k];
});
const LEATHER_P = grain("#8a5530", "#4e2e19", { size: 0.02, axis: "y" });
const BONEP = mottle("#f2e9cf", "#cdbf96", { size: 0.05, seed: 2, contrast: 1.2 });
const TUSK = paint((_p, _n, s) => mix("#c9b27a", "#f6efd8", smoothstep(0, 0.55, s[0])));
const MOH = paint((_p, _n, s) =>
  mix(mix(MOH_ROOT, MOH_MID, smoothstep(0, 0.16, s[1])), MOH_TIP, smoothstep(0.2, 0.42, s[1])),
);
const CLOTH_BASE = stripes(CLOTH_RED, CLOTH_DK, { size: 0.07, axis: "x", width: 0.3, wobble: 0.3, seed: 3 });
const CLOTH = paint((_p, _n, s) => (s[1] > -0.05 ? "#2a1a12" : s[1] < -0.52 ? CLOTH_DK : CLOTH_BASE));

// ---------------------------------------------------------------- textures
const EYE_TEX = svg(
  `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="g" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="#fff6a0"/><stop offset="1" stop-color="#e59a1c"/></radialGradient></defs>
  <rect width="200" height="100" fill="url(#g)"/>
  <circle cx="100" cy="54" r="26" fill="#e8541a"/>
  <circle cx="100" cy="54" r="26" fill="none" stroke="#7a1d08" stroke-width="4"/>
  <ellipse cx="100" cy="54" rx="7" ry="22" fill="#120804"/>
  <circle cx="92" cy="44" r="5" fill="#ffffff"/>
  <path d="M0 0H200V26 Q100 44 0 26Z" fill="#244f52"/>
  <path d="M0 26 Q100 44 200 26" stroke="#0b1d1f" stroke-width="5" fill="none"/>
</svg>`,
  { size: 256 },
);
const FACE_PAINT = svg(
  `<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 10 L50 30" stroke="#0f0b09" stroke-width="13" stroke-linecap="round"/>
  <path d="M8 10 L50 30" stroke="#f3f0e2" stroke-width="9" stroke-linecap="round"/>
  <path d="M6 32 L52 54" stroke="#0f0b09" stroke-width="13" stroke-linecap="round"/>
  <path d="M6 32 L52 54" stroke="#c9301c" stroke-width="9" stroke-linecap="round"/>
  <path d="M10 56 L44 70" stroke="#0f0b09" stroke-width="11" stroke-linecap="round"/>
  <path d="M10 56 L44 70" stroke="#f3f0e2" stroke-width="7" stroke-linecap="round"/>
</svg>`,
  { size: 192 },
);
const TATTOO = svg(
  `<svg viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="50" cy="30" r="16" stroke="#1a0f0a" stroke-width="9"/>
  <circle cx="50" cy="30" r="16" stroke="#f1efe0" stroke-width="5"/>
  <circle cx="50" cy="30" r="6" fill="#c9301c" stroke="#1a0f0a" stroke-width="2"/>
  <path d="M50 6 L50 -2 M72 30 L82 30 M28 30 L18 30 M66 14 L74 6 M34 14 L26 6" stroke="#f1efe0" stroke-width="4"/>
  <path d="M14 56 L50 74 L86 56" stroke="#1a0f0a" stroke-width="10"/>
  <path d="M14 56 L50 74 L86 56" stroke="#c9301c" stroke-width="6"/>
  <path d="M22 70 L50 84 L78 70" stroke="#1a0f0a" stroke-width="8"/>
  <path d="M22 70 L50 84 L78 70" stroke="#f1efe0" stroke-width="4"/>
</svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="34" fill="#2a1a12" stroke="#e0aa2c" stroke-width="5"/>
  <path d="M40 4 L46 14 L34 14Z M40 76 L46 66 L34 66Z M4 40 L14 34 L14 46Z M76 40 L66 34 L66 46Z" fill="#e0aa2c"/>
  <path d="M20 30 L34 36 L34 40 L20 38Z M60 30 L46 36 L46 40 L60 38Z" fill="#8dff3a"/>
  <path d="M40 40 L36 52 L44 52Z" fill="#efe6cb"/>
  <path d="M22 58 L28 52 L34 58 L40 52 L46 58 L52 52 L58 58" fill="none" stroke="#efe6cb" stroke-width="4" stroke-linejoin="round"/>
</svg>`,
  { size: 192 },
);
const FEATHER = svg(
  `<svg viewBox="0 0 40 120" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#17776f"/><stop offset="0.55" stop-color="#2fb0a0"/><stop offset="0.8" stop-color="#e0502a"/><stop offset="1" stop-color="#ffb12a"/></linearGradient></defs>
  <path d="M20 118 C4 92 2 48 20 2 C38 48 36 92 20 118Z" fill="url(#f)" stroke="#0b2f2d" stroke-width="3"/>
  <path d="M20 118 L20 8" stroke="#0b2f2d" stroke-width="3"/>
  <path d="M20 90 L8 74 M20 70 L7 52 M20 50 L10 34 M20 90 L32 74 M20 70 L33 52 M20 50 L30 34" stroke="#0b2f2d" stroke-width="2" opacity="0.6"/>
</svg>`,
  { size: 160 },
);
const MOSS = svg(
  `<svg viewBox="0 0 40 90" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round">
  <path d="M0 0H40V8H0Z" fill="#4f7d2f" stroke="none"/>
  <path d="M6 2 C2 30 8 55 4 88" stroke="#4f7d2f" stroke-width="6"/>
  <path d="M16 2 C20 35 12 60 18 86" stroke="#6f9d3a" stroke-width="6"/>
  <path d="M26 2 C30 28 24 52 28 80" stroke="#3f6a28" stroke-width="6"/>
  <path d="M35 2 C32 25 38 45 34 70" stroke="#86b04a" stroke-width="6"/>
</svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "swampTroll" });
  const H = 1.1; // head scale

  // ================================================================ skeleton
  const hips = b.joint("hips", { at: [0, 1.08, -0.06], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.08, -0.06],
      [0, 1.4, 0.08],
      [0, 1.72, 0.13],
      [0, 1.98, 0.14],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const [sp1, sp2, sp3] = spine.joints;
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.98, 0.14],
      [0, 2.08, 0.29],
      [0, 2.16, 0.44],
    ]),
    { parent: sp3, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 2.16, 0.44], dir: [0, 0.1, 1], role: "head" });
  const hp = (l: number, u: number, f: number) => head.local({ left: l * H, up: u * H, forward: f * H });
  const hsz = (x: number, y: number, z: number): V3 => [x * H, y * H, z * H];
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.045, 0.05), aim: hp(0, -0.12, 0.32), role: "jaw" });

  // ================================================================ helpers
  const sph = (r = 1, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const box = () => new THREE.BoxGeometry(1, 1, 1);

  const cuff = (cp: any, r: number, len: number, color: any) =>
    b.part(new THREE.CylinderGeometry(r, r * 1.06, len, 8), color, { at: cp, dir: cp.tangent });

  const boneSkull = (pos: THREE.Vector3, face: THREE.Vector3, size: number, bone: Joint, horns = false) => {
    const q = aim(face.clone().normalize(), V(0, 1, 0), "z");
    const P = (x: number, y: number, z: number) => pos.clone().add(V(x, y, z).multiplyScalar(size).applyQuaternion(q));
    const S = (x: number, y: number, z: number): V3 => [x * size, y * size, z * size];
    b.part(sph(0.5), BONEP, { bone, at: P(0, 0.08, -0.02), quat: q, scale: S(0.95, 0.9, 1.05) });
    b.part(box(), BONEP, { bone, at: P(0, -0.3, 0.2), quat: q, scale: S(0.52, 0.34, 0.5) });
    b.part(box(), BONEP, { bone, at: P(0, -0.52, 0.18), quat: q, scale: S(0.44, 0.13, 0.46) });
    for (const s of [1, -1]) {
      b.part(sph(0.5), DARK, { bone, at: P(s * 0.22, 0.06, 0.4), quat: q, scale: S(0.36, 0.4, 0.2) });
      glow(b.part(sph(0.5, 6, 4), GLOW_GREEN, { bone, at: P(s * 0.22, 0.06, 0.47), quat: q, scale: S(0.2, 0.22, 0.1) }), 1.4);
    }
    b.part(box(), DARK, { bone, at: P(0, -0.14, 0.5), quat: q, scale: S(0.12, 0.2, 0.06) });
    b.part(box(), DARK, { bone, at: P(0, -0.42, 0.44), quat: q, scale: S(0.42, 0.07, 0.06) });
    for (const k of [-2, -1, 0, 1, 2])
      b.part(box(), IVORY, { bone, at: P(k * 0.1, -0.42, 0.45), quat: q, scale: S(0.07, 0.11, 0.05) });
    if (horns)
      for (const s of [1, -1])
        b.sweep(bezier(P(s * 0.38, 0.3, 0), P(s * 0.8, 0.5, -0.05), P(s * 0.72, 1.0, 0.05)), [size * 0.11, size * 0.015], {
          bone,
          color: BONEP,
          caps: { start: "flat", end: "point" },
          sides: 6,
        });
  };

  const hang = (frames: any[], tex: THREE.Texture, size: [number, number], bone: Joint, seed: number) =>
    b.cards(frames, tex, { size, lean: 180, flow: [0, 0, 1], bone, vary: 0.25, spin: 10, rng: rng(seed) });

  // ================================================================ torso
  const torso = b.loft(
    [
      { at: [0, 1.06, -0.06], w: 0.58, h: 0.4 },
      { at: [0, 1.28, 0.07], w: 0.68, h: 0.6 },
      { at: [0, 1.52, 0.1], w: 0.72, h: 0.54 },
      { at: [0, 1.78, 0.14], w: 0.86, h: 0.54 },
      { at: [0, 1.98, 0.14], w: 0.9, h: 0.44 },
    ],
    { bone: [hips, spine], color: SKIN },
  );
  const tsurf = b.surface(torso);
  const hump = b.part(sph(1, 10, 8), SKIN, { bone: sp3, at: [0, 2.0, 0.0], scale: [0.32, 0.24, 0.26] });

  b.sweep(neck, [0.2, 0.17, 0.15], { color: SKIN });

  // tribal chest tattoo
  b.decal(torso, TATTOO, { at: [0, 1.7, 0.4], dir: [0, 0, 1], size: [0.52, 0.47], lift: 0.004 });

  // warts
  const rw = rng(21);
  for (const hit of tsurf.scatter(18, { rng: rng(5), minDist: 0.18, filter: (h) => h.n.y > -0.2 && h.at.y > 1.3 })) {
    const k = 0.7 + rw() * 0.8;
    b.stick(sph(0.03, 5, 4), WART_C, hit, { embed: 0.5, scale: [k, k, k] });
  }

  // ================================================================ head
  const skull = b.part(sph(1, 12, 9), SKIN, { bone: head, at: hp(0, 0.12, 0.1), scale: hsz(0.2, 0.19, 0.23) });
  b.part(box(), SKIN, { bone: head, at: hp(0, 0.19, -0.1), scale: hsz(0.26, 0.2, 0.26) }); // back of skull bulk
  // muzzle, nose
  b.frustumBox(hp(0, 0.0, 0.14), hp(0, -0.03, 0.38), [0.27 * H, 0.19 * H], [0.24 * H, 0.15 * H], { bone: head, color: SKIN });
  b.frustumBox(hp(0, 0.1, 0.26), hp(0, 0.035, 0.43), [0.075 * H, 0.07 * H], [0.1 * H, 0.085 * H], { bone: head, color: SKIN });
  b.part(sph(1, 8, 6), SKIN, { bone: head, at: hp(0, 0.035, 0.435), scale: hsz(0.055, 0.05, 0.05) });
  b.part(new THREE.TorusGeometry(0.035 * H, 0.007 * H, 5, 10), GOLD, { bone: head, at: hp(0, -0.02, 0.44), dir: [1, 0, 0], axis: "z" });
  // mouth interior, lower jaw
  b.part(box(), MOUTH, { bone: head, at: hp(0, -0.1, 0.22), scale: hsz(0.2, 0.025, 0.3) });
  b.frustumBox(hp(0, -0.11, 0.08), hp(0, -0.17, 0.39), [0.26 * H, 0.09 * H], [0.24 * H, 0.11 * H], { bone: jaw, color: SKIN });
  b.part(sph(1, 8, 6), SKIN, { bone: jaw, at: hp(0, -0.2, 0.37), scale: hsz(0.1, 0.06, 0.07) }); // chin
  b.part(box(), TONGUE, { bone: jaw, at: hp(0, -0.112, 0.2), scale: hsz(0.12, 0.02, 0.2) });
  for (const k of [-2, -1, 0, 1, 2])
    b.spike(hp(k * 0.045, -0.115, 0.375 - Math.abs(k) * 0.012), [0, 1, 0.1], 0.04 * H, 0.011 * H, { color: IVORY, bone: jaw });

  for (const s of [1, -1]) {
    // cheeks, jaw hinge, eyes, brows
    b.part(sph(1, 8, 6), SKIN, { bone: head, at: hp(s * 0.14, -0.02, 0.2), scale: hsz(0.07, 0.07, 0.09) });
    b.part(sph(1, 8, 6), SKIN, { bone: jaw, at: hp(s * 0.12, -0.11, 0.08), scale: hsz(0.075, 0.075, 0.1) });
    b.part(sph(1, 8, 6), DARK, { bone: head, at: hp(s * 0.095, 0.1, 0.262), scale: hsz(0.05, 0.045, 0.045) });
    glow(
      b.part(sph(0.038 * H, 10, 8), "#ffffff", {
        bone: head,
        at: hp(s * 0.095, 0.1, 0.282),
        rotation: [0, -90 + s * 18, 0],
        texture: EYE_TEX,
      }),
      1.1,
    );
    b.part(box(), SKIN, { bone: head, at: hp(s * 0.1, 0.165, 0.275), rotation: [0, 0, s * 16], scale: hsz(0.17, 0.055, 0.13) });
    b.part(sph(1, 6, 4), DARK, { bone: head, at: hp(s * 0.036, -0.012, 0.415), scale: hsz(0.022, 0.016, 0.022) }); // nostrils
    b.part(sph(1, 8, 6), SKIN, { bone: head, at: hp(s * 0.045, 0.012, 0.425), scale: hsz(0.04, 0.035, 0.035) });
    // upper fangs
    b.spike(hp(s * 0.06, -0.09, 0.36), [0, -1, 0], 0.045 * H, 0.012 * H, { color: IVORY, bone: head });

    // tusks: big, upturned, gold-ringed
    const tusk = b.sweep(
      bezier(hp(s * 0.115, -0.115, 0.3), hp(s * 0.165, -0.02, 0.345), hp(s * 0.15, 0.16, 0.32)),
      [0.036 * H, 0.006],
      { bone: jaw, color: TUSK, caps: { start: "flat", end: "point" }, sides: 8 },
    );
    for (const t of [0.16, 0.4]) {
      const pt = tusk.at(t);
      b.part(new THREE.TorusGeometry(pt.radius * 1.08, 0.009, 5, 10), GOLD, { bone: jaw, at: pt.at, dir: pt.tangent, axis: "z" });
    }

    // long swept-back ears
    const ex = V(s * 0.7, 0.1, -1).normalize();
    const ey = V(0, 1, 0).addScaledVector(ex, -ex.y).normalize();
    const ear = b.extrude(
      [[0, -0.05], [0.14, -0.03], [0.36, 0.2, "sharp"], [0.14, 0.1], [0, 0.07]].map((q) => [q[0] * H, q[1] * H]) as Outline,
      { at: hp(s * 0.17, 0.1, 0.0), x: ex, y: ey, thickness: [0.03 * H, 0.008], bevel: 0.004, color: SKIN, bone: head },
    );
    b.part(new THREE.TorusGeometry(0.03 * H, 0.007, 5, 10), GOLD, { bone: head, at: ear.local([0.17 * H, 0.0, 0]), dir: ey, axis: "z" });
    b.part(new THREE.TorusGeometry(0.026 * H, 0.007, 5, 10), GOLD, { bone: head, at: ear.local([0.26 * H, 0.1 * H, 0]), dir: ey, axis: "z" });

    // war paint
    b.decal(skull, FACE_PAINT, {
      at: hp(s * 0.15, 0.03, 0.2),
      dir: [s * 0.55, 0, 0.85],
      size: [0.13 * H, 0.17 * H],
      mirror: s > 0,
      lift: 0.003,
    });
  }
  // warts around the nose
  for (const hit of b.surface(skull).scatter(6, { rng: rng(8), minDist: 0.06, filter: (h) => h.n.z > 0.3 && h.n.y > 0 }))
    b.stick(sph(0.025, 5, 4), WART_C, hit, { embed: 0.5 });

  // ================================================================ mohawk
  const crest = catmull([
    hp(0, 0.255, 0.24),
    hp(0, 0.3, 0.15),
    hp(0, 0.3, 0.03),
    hp(0, 0.24, -0.08),
    hp(0, 0.14, -0.14),
    V(0, 2.27, 0.17),
    V(0, 2.2, 0.05),
    V(0, 2.1, -0.08),
  ]);
  const bladeOutline = (k: number): Outline =>
    [[-0.07, 0], [0.07, 0], [0.09, 0.18], [0.14, 0.36, "sharp"], [-0.02, 0.15]].map((q) =>
      q.length === 3 ? ([q[0] * k, (q[1] as number) * k, "sharp"] as [number, number, "sharp"]) : ([q[0] * k, (q[1] as number) * k] as [number, number]),
    );
  const heights = [0.3, 0.38, 0.44, 0.46, 0.42, 0.38, 0.34, 0.3, 0.26, 0.22, 0.19, 0.16];
  heights.forEach((h, i) => {
    const t = i / (heights.length - 1);
    const th = ((-6 + i * 5.5) * Math.PI) / 180;
    const yd = V(0, Math.cos(th), -Math.sin(th));
    const xd = V(0, -Math.sin(th), -Math.cos(th));
    const pos = crest.at(t).clone().add(V((i % 2 ? 1 : -1) * 0.012, 0, 0));
    b.extrude(bladeOutline(h / 0.36), {
      at: pos,
      x: xd,
      y: yd,
      thickness: [0.045, 0.012],
      bevel: 0.006,
      color: MOH,
      bone: i < 5 ? head : i < 8 ? neck.joints[1] : sp3,
    });
  });

  // ================================================================ necklace of fetishes
  const cord = catmull(
    [
      [0, 2.25, -0.08], [0.2, 2.2, -0.05], [0.3, 2.08, 0.1], [0.26, 1.9, 0.32], [0.14, 1.74, 0.44], [0, 1.7, 0.46],
      [-0.14, 1.74, 0.44], [-0.26, 1.9, 0.32], [-0.3, 2.08, 0.1], [-0.2, 2.2, -0.05],
    ],
    { closed: true },
  );
  b.sweep(cord, 0.014, { bone: sp3, color: LEATHER_P });
  for (const k of [-3, -2, -1, 1, 2, 3]) {
    const t = 0.5 + k * 0.045;
    const pt = cord.at(t);
    if (Math.abs(k) % 2 === 1)
      b.spike(pt, [0, -1, 0.25], 0.1 - Math.abs(k) * 0.012, 0.022, { color: IVORY, bone: sp3 });
    else {
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 6), IVORY, { at: pt, dir: cord.tangentAt(t), bone: sp3 });
      b.part(new THREE.TorusGeometry(0.03, 0.007, 4, 8), GOLD, { at: pt, dir: cord.tangentAt(t), axis: "z", bone: sp3 });
    }
  }
  b.rod(cord.at(0.5), V(0, 1.62, 0.46), 0.008, { color: LEATHER_P, bone: sp3 });
  boneSkull(V(0, 1.56, 0.47), V(0, -0.05, 1), 0.13, sp3);

  // bandolier of teeth over the chest
  const strap = tsurf.drape(
    catmull([
      [-0.36, 2.02, 0.16], [-0.2, 1.78, 0.4], [0.0, 1.55, 0.44], [0.2, 1.33, 0.42], [0.32, 1.12, 0.3],
    ]),
    { lift: 0.03 },
  );
  b.sweep(strap, 0.03, { color: LEATHER_P });
  b.along(strap, 9, (at) => b.part(sph(0.026, 6, 4), IVORY, { at }));

  // belt, buckle skull, belt of fangs
  const belt = tsurf.loop([0, 1.22, 0.0], { dir: [0, 1, 0], lift: 0.02 });
  b.sweep(belt, 0.045, { color: LEATHER_P });
  b.along(belt, 14, (at) => b.part(new THREE.ConeGeometry(0.022, 0.07, 5), IVORY, { at, dir: [0, -1, 0] }));
  boneSkull(V(0, 1.22, 0.37), V(0, 0, 1), 0.15, sp1);
  glow(b.part(new THREE.IcosahedronGeometry(0.022, 0), GLOW_GREEN, { bone: sp1, at: [0.0, 1.31, 0.4] }), 1.3);

  // loincloth front and back
  const flapOutline: Outline = [
    [-0.19, 0], [0.19, 0], [0.17, -0.22], [0.2, -0.46], [0.1, -0.4], [0.05, -0.56, "sharp"], [0, -0.42],
    [-0.06, -0.58, "sharp"], [-0.11, -0.4], [-0.2, -0.48], [-0.17, -0.22],
  ];
  const fy = V(0, 1, -0.25).normalize();
  const flap = b.extrude(flapOutline, { at: [0, 1.2, 0.31], x: [1, 0, 0], y: fy, thickness: 0.018, bevel: 0.004, color: CLOTH, bone: hips });
  glow(
    b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
      bone: hips,
      at: flap.local([0, -0.25, 0.012]),
      dir: flap.axis,
      axis: "z",
      up: fy,
      texture: EMBLEM,
    }),
    0.35,
  );
  const by = V(0, 1, 0.2).normalize();
  b.extrude(flapOutline.map((q) => (q.length === 3 ? [q[0] * 1.15, q[1] * 0.85, "sharp"] : [q[0] * 1.15, q[1] * 0.85])) as Outline, {
    at: [0, 1.2, -0.27],
    x: [-1, 0, 0],
    y: by,
    thickness: 0.018,
    bevel: 0.004,
    color: CLOTH,
    bone: hips,
  });

  // moss hanging from the belt behind
  const beltFrames = b.along(belt, 12, () => {}).filter((f) => f.at.z < 0.05);
  hang(beltFrames.map((f) => frame(f.at, [0, 1, 0])), MOSS, [0.08, 0.22], sp1, 31);

  // fetish bundle on the left hip
  b.sweep(
    catmull([
      [0.34, 1.22, 0.1],
      [0.4, 1.08, 0.14],
      [0.44, 0.95, 0.17],
    ]),
    0.012,
    { bone: sp1, color: LEATHER_P },
  );
  boneSkull(V(0.45, 0.86, 0.2), V(0.5, 0, 0.85), 0.16, sp1);
  hang([frame([0.4, 0.98, 0.2], [0, 1, 0]), frame([0.48, 0.98, 0.18], [0, 1, 0])], FEATHER, [0.07, 0.26], sp1, 41);

  // ================================================================ back totem
  const A = V(-0.25, 1.2, -0.2);
  const B = V(0.34, 2.65, -0.2);
  const dirP = B.clone().sub(A).normalize();
  b.rod(A, B, [0.032, 0.024], { bone: sp2, color: LEATHER_P });
  for (const t of [0.3, 0.52, 0.72]) {
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.07, 8), CLOTH_DK, { bone: sp2, at: A.clone().lerp(B, t), dir: dirP });
  }
  boneSkull(B.clone().addScaledVector(dirP, 0.15), V(0.1, 0, 1), 0.22, sp3, true);
  const C = B.clone().addScaledVector(dirP, -0.2);
  const perp = V(dirP.y, -dirP.x, 0).normalize();
  const E1 = C.clone().addScaledVector(perp, 0.2);
  const E2 = C.clone().addScaledVector(perp, -0.2);
  b.rod(E1, E2, 0.014, { bone: sp3, color: BONEP });
  for (const E of [E1, E2]) b.part(sph(0.028, 6, 4), IVORY, { bone: sp3, at: E });
  hang([frame(E1, [0, 1, 0]), frame(E2, [0, 1, 0])], FEATHER, [0.07, 0.3], sp3, 51);
  hang([frame(C.clone().addScaledVector(perp, 0.07), [0, 1, 0]), frame(C.clone().addScaledVector(perp, -0.07), [0, 1, 0])], MOSS, [0.08, 0.22], sp3, 52);
  for (const k of [-0.1, 0, 0.1]) b.spike(C.clone().addScaledVector(perp, k), [0, -1, 0], 0.09, 0.016, { color: IVORY, bone: sp3 });

  // ================================================================ legs
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const pts = limb(V(s * 0.2, 1.08, -0.08), V(s * 0.27, 0.15, 0.02), [0.56, 0.56], [0, 0, 1]);
    const leg = b.chain(`leg${sd}`, pts, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `ankle${sd}`],
      role: "leg",
      contact: [s * 0.27, 0, 0.12],
    });
    const ank = leg.tip!;
    b.sweep(leg, [0.15, 0.16, 0.085, 0.1, 0.065], { color: SKIN });
    b.part(sph(1, 8, 6), SKIN, { bone: leg.joints[1], at: pts[1].clone().add(V(0, 0.02, 0.07)), scale: [0.1, 0.1, 0.1] });
    b.spike(pts[1].clone().add(V(0, 0.04, 0.1)), [0, 0.3, 1], 0.14, 0.032, { color: BONEP, bone: leg.joints[1] });
    cuff(leg.at(0.18), 0.165, 0.06, CLOTH_DK);
    cuff(leg.at(0.72), 0.108, 0.1, LEATHER_P);
    cuff(leg.at(0.94), 0.08, 0.07, GOLD);

    // foot
    b.frustumBox([s * 0.27, 0.065, -0.1], [s * 0.27, 0.06, 0.2], [0.16, 0.13], [0.22, 0.1], { bone: ank, color: SKIN });
    for (let i = 0; i < 3; i++) {
      const x = s * 0.27 + (i - 1) * 0.085;
      const root = V(x, 0.065, 0.19);
      const tip = V(x + (i - 1) * 0.015, 0.05, 0.36);
      const toe = b.chain(`toe${i + 1}${sd}`, [root, tip], {
        parent: ank,
        names: [`toe${i + 1}${sd}`, `toe${i + 1}${sd}Tip`],
        role: "digit",
      });
      b.sweep(toe, [0.047, 0.037], { color: SKIN });
      b.spike(tip, [(i - 1) * 0.12, -0.25, 1], 0.1, 0.028, { color: CLAW, bone: toe.tip! });
    }
  }

  // ================================================================ arms and hands
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const shP = V(s * 0.46, 1.94, 0.14);
    const elP = V(s * 0.95, 1.76, 0.14);
    const wrP = V(s * 1.4, 1.6, 0.2);
    const arm = b.chain(`arm${sd}`, catmull([shP, elP, wrP]), {
      parent: sp3,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`],
      role: "arm",
    });
    const sh = arm.joints[0];
    const el = arm.joints[1];
    const wr = arm.tip!;
    b.sweep(arm, [0.125, 0.13, 0.09, 0.1, 0.07], { color: SKIN });
    b.part(sph(1, 10, 8), SKIN, { bone: sh, at: shP.clone().add(V(s * 0.02, 0.03, 0)), scale: [0.19, 0.17, 0.18] });
    b.spike(elP.clone().add(V(0, 0.03, -0.07)), [s * 0.15, 0.45, -0.9], 0.16, 0.04, { color: BONEP, bone: el });
    cuff(arm.at(0.22), 0.14, 0.07, GOLD);
    cuff(arm.at(0.88), 0.09, 0.12, LEATHER_P);
    b.ring(arm.at(0.88), { count: 6, radius: 0.085 }, (it) => b.spike(it, it, 0.08, 0.022, { color: IVORY }));

    // shoulder pad with bone spikes and hanging moss
    const padAxis = V(s * 0.45, 1, 0.05).normalize();
    const padAt = shP.clone().add(V(0, 0.08, 0));
    b.lathe([[0, 0], [0.21, 0], [0.235, 0.035], [0.2, 0.1], [0.12, 0.165], [0, 0.19]], {
      at: padAt,
      axis: padAxis,
      smoothing: 1,
      color: LEATHER_P,
      bone: sh,
    });
    b.ring(frame(padAt.clone().addScaledVector(padAxis, 0.11), padAxis), { count: 6, radius: 0.17, tilt: 35 }, (it) =>
      b.spike(it, it, 0.2, 0.035, { color: BONEP, bone: sh }),
    );
    const rim = b.ring(frame(padAt, padAxis), { count: 7, radius: 0.235 });
    hang(rim.items.map((it) => frame(it.at, [0, 1, 0])), MOSS, [0.08, 0.2], sh, 60 + (s > 0 ? 0 : 1));
    const top = padAt.clone().addScaledVector(padAxis, 0.19);
    if (s < 0) {
      boneSkull(top.clone().addScaledVector(padAxis, 0.12), V(-0.45, 0.25, 0.85), 0.26, sh, true);
    } else {
      const fr = [V(0.4, 1, -0.2), V(1, 0.9, -0.1), V(1.4, 0.45, 0.05)].map((d) => frame(top, d.normalize()));
      b.cards(fr, FEATHER, { size: [0.1, 0.42], lean: 0, flow: [0, 0, 1], bone: sh });
    }

    // hand
    const d = wrP.clone().sub(elP).normalize();
    const at = (a: number, off: V3 = [0, 0, 0]) => wrP.clone().addScaledVector(d, a).add(V(off[0], off[1], off[2]));
    b.part(sph(1, 8, 6), SKIN, { bone: wr, at: at(0.1), dir: d, scale: [0.075, 0.12, 0.075] });
    const fingers: { n: string; root: THREE.Vector3; dir: THREE.Vector3; l1: number; l2: number; r: number }[] = [
      { n: "thumb", root: at(0.07, [0, 0, 0.085]), dir: d.clone().multiplyScalar(0.5).add(V(0, -0.25, 0.85)).normalize(), l1: 0.09, l2: 0.08, r: 0.036 },
      { n: "index", root: at(0.17, [0, 0.01, 0.055]), dir: d.clone().add(V(0, -0.1, 0.18)).normalize(), l1: 0.1, l2: 0.09, r: 0.032 },
      { n: "middle", root: at(0.18, [0, 0.01, 0]), dir: d.clone().add(V(0, -0.1, 0)).normalize(), l1: 0.11, l2: 0.1, r: 0.033 },
      { n: "ring", root: at(0.17, [0, 0.01, -0.055]), dir: d.clone().add(V(0, -0.1, -0.18)).normalize(), l1: 0.1, l2: 0.09, r: 0.031 },
    ];
    for (const f of fingers) {
      const p0 = f.root;
      const p1 = p0.clone().addScaledVector(f.dir, f.l1).add(V(0, -0.01, 0));
      const p2 = p1.clone().addScaledVector(f.dir, f.l2).add(V(0, -0.03, 0));
      const fc = b.chain(`${f.n}${sd}`, catmull([p0, p1, p2]), {
        parent: wr,
        names: [`${f.n}${sd}1`, `${f.n}${sd}2`, `${f.n}${sd}3`],
        role: "digit",
      });
      b.sweep(fc, [f.r, f.r * 0.82, f.r * 0.6], { color: SKIN });
      b.spike(p2, f.dir.clone().add(V(0, -0.35, 0)).normalize(), 0.09, 0.022, { color: CLAW, bone: fc.tip! });
    }
  }

  // ================================================================ moss on the hump
  const mossFrames = b
    .surface(hump)
    .scatter(10, { rng: rng(12), minDist: 0.12, filter: (h) => h.n.y > 0.3 && h.n.z < 0.3 })
    .map((h) => frame(h.at.clone().add(V(0, 0.01, 0)), [0, 1, 0]));
  void mossFrames; // hanging through the hump would hide inside the body, so the clumps live on pads, belt and totem

  return b.root;
}
