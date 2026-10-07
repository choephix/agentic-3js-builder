import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { aim, rng } from "../src/math";
import { catmull, bezier, polyline } from "../src/path";
import { glow } from "../kits/glow";
import { gradient, mix, noise, paint, smoothstep } from "../src/paint";
import type { Rgb } from "../src/paint";
import type { Chain, Joint } from "../src/skeleton";
import type { Sweep } from "../src/sweep";
import { Part } from "../src/parts";
import type { Frame } from "../src/frame";
import { svg } from "../src/texture";

export const meta = {
  name: "Swamp Troll",
  description:
    "A hunched Warcraft-style swamp troll: teal hand-painted hide with moss and mud, curved tusks with gold rings, a magenta mohawk of blades, glowing yellow eyes, war paint and tribal tattoos, hung with bone fetishes, skull trophies, feathers and a bone necklace.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

type P = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Palette

const BONE = "#efe2bd";
const BONE_D = "#c4ad7c";
const BONE_S = "#8c7650";
const LEATHER = "#7a4a2a";
const LEATHER_D = "#41271a";
const LEATHER_L = "#a86d3c";
const GOLD = "#f2b72f";
const GOLD_D = "#a9741a";
const IRON = "#6d7280";
const IRON_D = "#383a47";
const EYE = "#ffd51c";
const PUPIL = "#190d12";
const SOCKET = "#1d1214";
const MOUTH = "#74202e";
const TONGUE = "#c8465c";
const CLAW = "#2d2321";
const WART = "#3b7a63";
const KNOB = "#2b6858";
const ROPE = "#cfa966";
const CORD_RED = "#b02a28";
const GLOWGREEN = "#6dff7a";
const HAIR_D = "#4d1368";

const SKIN = { base: "#4b9a80", hi: "#9fe0a2", lo: "#29605f", deep: "#1c3a56", moss: "#7ca838", mud: "#5c4a2e", belly: "#a7cd8c" };
const KEY = new THREE.Vector3(0.35, 0.85, 0.45).normalize();

// Hand-painted hide: warm highlight on top, hue-shifted cool shadow below, blotches, pale belly, moss and mud.
const hide = paint((p, n) => {
  const l = n.dot(KEY);
  let c: Rgb = mix(SKIN.lo, SKIN.base, smoothstep(-0.55, 0.2, l));
  c = mix(c, SKIN.hi, smoothstep(0.4, 1, l) * 0.7);
  c = mix(c, SKIN.deep, smoothstep(-0.45, -1, l) * 0.65);
  c = mix(c, "#2e7c69", smoothstep(0.55, 0.78, noise(p, 0.17, 3)) * 0.55);
  c = mix(c, "#6bb88a", smoothstep(0.62, 0.8, noise(p, 0.06, 8)) * 0.35);
  const belly =
    smoothstep(0.25, 0.85, n.z) * (1 - smoothstep(0.34, 0.52, Math.abs(p.x))) * smoothstep(1.85, 1.55, p.y) * smoothstep(0.85, 1.05, p.y);
  c = mix(c, mix(SKIN.belly, SKIN.base, smoothstep(0.2, -0.6, l) * 0.6), belly * 0.7);
  const mossy = smoothstep(0.35, 0.8, n.y) * smoothstep(1.75, 1.95, p.y) * smoothstep(0.5, 0.68, noise(p, 0.13, 11));
  c = mix(c, SKIN.moss, mossy * 0.85);
  const mud = smoothstep(0.62, 0.12, p.y) * (0.45 + 0.55 * smoothstep(0.35, 0.7, noise(p, 0.09, 5)));
  c = mix(c, SKIN.mud, Math.min(1, mud) * 0.9);
  return c;
});

function bonePaint(seed: number) {
  return paint((p, n) => {
    const l = n.dot(KEY);
    let c: Rgb = mix(BONE_S, BONE_D, smoothstep(-0.6, 0.1, l));
    c = mix(c, BONE, smoothstep(0.0, 0.7, l));
    c = mix(c, "#fff8e0", smoothstep(0.65, 1, l) * 0.6);
    c = mix(c, BONE_S, smoothstep(0.6, 0.85, noise(p, 0.03, seed)) * 0.5);
    return c;
  });
}
const BONEP = bonePaint(2);

function leatherPaint(base: string, seed: number) {
  return paint((p, n) => {
    const l = n.dot(KEY);
    let c: Rgb = mix(LEATHER_D, base, smoothstep(-0.5, 0.2, l));
    c = mix(c, LEATHER_L, smoothstep(0.45, 1, l) * 0.6);
    c = mix(c, LEATHER_D, smoothstep(0.55, 0.8, noise(p, 0.035, seed)) * 0.45);
    return c;
  });
}
const LEATHERP = leatherPaint(LEATHER, 4);

// Hanging loincloth: weave, hem band, diamond totem motif.
const clothPaint = paint((p, _n, s) => {
  const [x, y] = s;
  let c: string | Rgb = mix("#8c2025", "#c9402f", smoothstep(0.3, 0.7, noise(p, 0.05, 6)));
  const weave = Math.sin(x * 190) * Math.sin(y * 190) > 0.25 ? 0.08 : 0;
  c = mix(c, "#5a1219", weave);
  if (y > -0.065) c = "#3a2216";
  else if (y > -0.095) c = GOLD;
  const d = Math.abs(x) / 0.13 + Math.abs(y + 0.3) / 0.15;
  if (d < 1.0) c = "#5b2a86";
  if (d < 0.72) c = GOLD;
  if (d < 0.4) c = "#b02a28";
  if (d < 0.14) c = "#2a1220";
  const ring = Math.abs(x) / 0.2 + Math.abs(y + 0.3) / 0.24;
  if (ring > 1 && ring < 1.12) c = "#f0dca0";
  return c;
});

// Mohawk blades: deep violet root to hot pink-orange tips.
const hairPaint = paint((_p, _n, s) => {
  const t = smoothstep(0.02, 0.42, s[1]);
  let c: Rgb = mix(HAIR_D, "#b3249b", smoothstep(0, 0.55, t));
  c = mix(c, "#ff5d8f", smoothstep(0.5, 0.9, t));
  c = mix(c, "#ffb25a", smoothstep(0.88, 1.0, t) * 0.8);
  return c;
});
const braidPaint = gradient("#4d1368", "#b3249b", [0, 2.3, 0], [0, 1.7, 0]);

// ---------------------------------------------------------------------------------------------------------------
// Drawings

function feather(body: string, rib: string, edge: string) {
  return svg(
    `<svg viewBox="0 0 24 64"><path d="M12 1 C23 14 25 40 12 63 C-1 40 1 14 12 1Z" fill="${body}"/>` +
      `<path d="M12 1 C20 14 21 36 12 58 C14 36 14 14 12 1Z" fill="${edge}" opacity="0.55"/>` +
      `<path d="M12 5 L12 63" stroke="${rib}" stroke-width="1.8"/>` +
      `<path d="M12 22 L4 14 M12 32 L3 24 M12 42 L4 35 M12 22 L20 14 M12 32 L21 24 M12 42 L20 35" stroke="${edge}" stroke-width="1.1"/></svg>`,
    { size: 192 },
  );
}
const FEATHER_R = feather("#c42e2a", "#f6e6b0", "#7d1a1f");
const FEATHER_T = feather("#16a58f", "#f6e6b0", "#0b5f62");
const FEATHER_Y = feather("#f2b430", "#fff2c0", "#b5651a");

const MOSS = svg(
  `<svg viewBox="0 0 32 48"><path d="M16 0 C20 14 18 34 16 47 C13 34 12 14 16 0Z" fill="#6f9a2e"/>` +
    `<path d="M9 4 C14 16 12 32 8 46 C5 32 5 16 9 4Z" fill="#8bb83c"/>` +
    `<path d="M23 3 C28 16 27 32 24 46 C19 32 19 14 23 3Z" fill="#587f24"/>` +
    `<path d="M3 12 C7 22 6 34 4 44 C1 32 1 22 3 12Z" fill="#a4cf55"/>` +
    `<path d="M29 12 C32 22 31 34 28 44 C26 32 26 22 29 12Z" fill="#45701f"/></svg>`,
  { size: 128 },
);

const TATTOO = svg(
  `<svg viewBox="0 0 64 64" fill="none" stroke="#6f2fb0" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="M32 8 C52 8 58 30 44 40 C33 48 20 40 24 29 C27 21 38 24 36 31"/>` +
    `<path d="M8 22 L16 14 L24 22 L32 14"/><path d="M8 52 L16 44 L24 52 L32 44 L40 52 L48 44 L56 52"/>` +
    `<path d="M50 12 L56 6 M54 22 L60 16"/></svg>`,
  { size: 256 },
);

const CHEEK = svg(
  `<svg viewBox="0 0 60 44" fill="none" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="M6 10 L54 28 M4 26 L40 40" stroke="#f3eedc" stroke-width="8"/>` +
    `<circle cx="50" cy="8" r="4" fill="#d6372e" stroke="none"/></svg>`,
  { size: 256 },
);
const BROW = svg(
  `<svg viewBox="0 0 60 60" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke="#c58cff">` +
    `<path d="M30 4 L30 40" stroke-width="7"/><path d="M10 14 L28 34 M50 14 L32 34" stroke-width="6"/>` +
    `<circle cx="30" cy="50" r="4" fill="#d6372e" stroke="none"/></svg>`,
  { size: 256 },
);

const SCAR = svg(
  `<svg viewBox="0 0 64 40" fill="none" stroke-linecap="round"><path d="M6 8 C22 18 40 20 58 32" stroke="#d98f8a" stroke-width="4"/>` +
    `<path d="M14 2 L18 14 M24 6 L28 18 M34 10 L38 22 M44 16 L48 28 M54 22 L58 34" stroke="#f0dcc0" stroke-width="2.6"/></svg>`,
  { size: 256 },
);

const RUNE = svg(
  `<svg viewBox="0 0 32 32" fill="none" stroke="#f3eedc" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="M16 4 L16 28 M8 11 L16 17 L24 11 M9 22 L16 16 L23 22"/></svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------

const piece = (keys: number[][]) => (t: number) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
    }
  }
  return keys[keys.length - 1][1];
};

export default function build() {
  const b = createBuilder({ name: "swampTroll", paintSize: 2048 });
  const rand = rng(77);

  // ------------------------------------------------------------------------------------------------ merged bags
  const bags = new Map<string, { bone: Joint; color: string | typeof BONEP; geos: THREE.BufferGeometry[] }>();
  const M = new THREE.Matrix4();
  function bag(
    bone: Joint,
    color: string | typeof BONEP,
    geo: THREE.BufferGeometry,
    at: P | THREE.Vector3,
    o: { dir?: P | THREE.Vector3; scale?: number | P } = {},
  ) {
    const q = o.dir ? aim(o.dir) : new THREE.Quaternion();
    const sc = o.scale === undefined ? [1, 1, 1] : typeof o.scale === "number" ? [o.scale, o.scale, o.scale] : o.scale;
    const pos = Array.isArray(at) ? new THREE.Vector3(...at) : at;
    M.compose(pos, q, new THREE.Vector3(sc[0], sc[1], sc[2]));
    const g = geo.clone().applyMatrix4(M);
    const key = `${bone.name}|${String(color)}`;
    let e = bags.get(key);
    if (!e) bags.set(key, (e = { bone, color, geos: [] }));
    e.geos.push(g);
  }
  const flush = () => {
    for (const e of bags.values()) {
      const merged = mergeGeometries(e.geos);
      if (!merged) throw new Error("bag merge failed " + e.bone.name);
      b.part(merged, e.color, { bone: e.bone, at: [0, 0, 0] });
    }
  };

  const sphere = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const cone = (r: number, h: number, s = 6) => new THREE.ConeGeometry(r, h, s);
  const torus = (r: number, t: number, a = 5, c = 10) => new THREE.TorusGeometry(r, t, a, c);

  // ------------------------------------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 1.12, -0.2], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.12, -0.2],
      [0, 1.4, -0.12],
      [0, 1.72, 0.02],
      [0, 1.98, 0.22],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const spine3 = spine.joints[2];
  const spine2 = spine.joints[1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.98, 0.22],
      [0, 2.08, 0.42],
      [0, 2.16, 0.62],
    ]),
    { parent: spine3, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 2.16, 0.62], dir: [0, -0.1, 1], role: "head" });
  const HS = 1.38; // head size: Warcraft heads are oversized
  const q = (n: number) => n * HS;
  const q3 = (x: number, y: number, z: number): P => [x * HS, y * HS, z * HS];
  const F = (l: number, u: number, f: number) => head.local({ left: l * HS, up: u * HS, forward: f * HS });
  const jaw = b.joint("jaw", { parent: head, at: F(0, -0.05, 0.05), aim: F(0, -0.12, 0.45), role: "jaw" });

  // ------------------------------------------------------------------------------------------------ torso
  const torso = b.loft(
    [
      { at: [0, 1.05, -0.2], w: 0.7, h: 0.52 },
      { at: [0, 1.3, -0.02], w: 0.86, h: 0.78 },
      { at: [0, 1.62, 0.04], w: 1.1, h: 0.82 },
      { at: [0, 1.92, 0.2], w: 1.3, h: 0.7 },
    ],
    { bone: [hips, spine], color: hide, sides: 12, caps: "round" },
  );
  const bellyBulge = b.part(sphere(1, 10, 8), hide, { bone: spine2, at: [0, 1.25, 0.12], scale: [0.42, 0.34, 0.34] });
  const trap = b.part(sphere(1, 10, 8), hide, { bone: spine3, at: [0, 2.0, 0.06], scale: [0.4, 0.28, 0.34] });
  for (const s of [1, -1]) b.part(sphere(1, 10, 8), hide, { bone: spine3, at: [s * 0.26, 1.78, 0.34], scale: [0.27, 0.22, 0.2] }); // pecs
  const neckTube = b.sweep(neck, [0.24, 0.22], { color: hide, sides: 10 });
  const body = b.surface([torso, bellyBulge, trap, neckTube]);

  // spine ridge knobs
  b.along(torso, 6, (at) => {
    b.stick(cone(0.075, 0.2, 6), KNOB, at, { embed: 0.3 });
  });

  // ------------------------------------------------------------------------------------------------ head
  const skull = b.part(sphere(1, 12, 9), hide, { bone: head, at: F(0, 0.1, 0.1), scale: q3(0.24, 0.22, 0.26) });
  const muzzle = b.part(sphere(1, 10, 7), hide, { bone: head, at: F(0, -0.02, 0.32), scale: q3(0.17, 0.12, 0.2) });
  const facial: Array<Part | Sweep> = [];
  const nose = b.part(sphere(1, 8, 6), hide, { bone: head, at: F(0, -0.02, 0.55), scale: q3(0.075, 0.075, 0.085) });
  b.sweep(catmull([F(0, 0.2, 0.26), F(0, 0.14, 0.4), F(0, 0.06, 0.5), F(0, -0.01, 0.54)]), [q(0.048), q(0.06), q(0.066), q(0.06)], { bone: head, color: hide, sides: 7 });
  // septum ring
  b.part(torus(q(0.03), q(0.007), 4, 9), GOLD, { bone: head, at: F(0, -0.085, 0.545), dir: [0, 0, 1], axis: "z", rotation: [0, 0, 0] });
  for (const s of [1, -1]) {
    b.part(sphere(q(0.022), 6, 4), SOCKET, { bone: head, at: F(s * 0.04, -0.075, 0.565), scale: [1, 1.3, 1] }); // nostrils
    facial.push(b.part(sphere(1, 7, 5), hide, { bone: head, at: F(s * 0.17, 0.04, 0.27), scale: q3(0.075, 0.06, 0.07) })); // cheekbones
    facial.push(b.part(sphere(1, 7, 5), hide, { bone: head, at: F(s * 0.19, -0.04, 0.18), scale: q3(0.07, 0.09, 0.09) })); // cheeks
  }
  // brow
  const browRidge = b.sweep(catmull([F(-0.23, 0.18, 0.08), F(-0.14, 0.22, 0.26), F(0, 0.205, 0.35), F(0.14, 0.22, 0.26), F(0.23, 0.18, 0.08)]), [q(0.03), q(0.055), q(0.062), q(0.055), q(0.03)], {
    bone: head,
    color: hide,
    sides: 7,
  });
  // eyes
  for (const s of [1, -1]) {
    b.part(sphere(q(0.052), 8, 6), SOCKET, { bone: head, at: F(s * 0.105, 0.13, 0.305), scale: [1, 0.8, 0.8] });
    glow(b.part(sphere(q(0.034), 8, 6), EYE, { bone: head, at: F(s * 0.105, 0.125, 0.325) }), 1.2);
    b.part(sphere(1, 6, 5), PUPIL, { bone: head, at: F(s * 0.105, 0.126, 0.358), scale: q3(0.008, 0.022, 0.01) });
    b.sweep(catmull([F(s * 0.155, 0.158, 0.27), F(s * 0.105, 0.172, 0.33), F(s * 0.055, 0.155, 0.335)]), q(0.016), { bone: head, color: hide, sides: 5 });
  }
  // mouth cavity and upper lip
  b.part(sphere(1, 8, 6), MOUTH, { bone: head, at: F(0, -0.065, 0.3), scale: q3(0.13, 0.05, 0.17) });
  b.sweep(catmull([F(-0.15, -0.055, 0.14), F(-0.13, -0.05, 0.36), F(0, -0.055, 0.5), F(0.13, -0.05, 0.36), F(0.15, -0.055, 0.14)]), q(0.026), {
    bone: head,
    color: "#2c6a56",
    sides: 6,
  });
  // upper teeth and fangs
  for (let i = -3; i <= 3; i++) {
    bag(head, BONE, cone(q(0.017), q(0.045), 5), F(i * 0.032, -0.075, 0.47 - 0.03 * Math.abs(i)), { dir: [0, -1, 0] });
  }
  for (const s of [1, -1]) {
    bag(head, BONE, cone(q(0.024), q(0.075), 6), F(s * 0.095, -0.07, 0.43), { dir: [0, -1, 0] });
  }

  // lower jaw
  for (const s of [1, -1]) {
    b.capsule(F(s * 0.15, -0.06, 0.08), F(s * 0.115, -0.12, 0.34), q(0.055), { bone: jaw, color: hide, sides: 7 });
  }
  b.part(sphere(1, 9, 6), hide, { bone: jaw, at: F(0, -0.115, 0.35), scale: q3(0.15, 0.085, 0.17) });
  b.part(sphere(1, 8, 5), MOUTH, { bone: jaw, at: F(0, -0.085, 0.3), scale: q3(0.115, 0.03, 0.14) });
  b.part(sphere(1, 8, 5), TONGUE, { bone: jaw, at: F(0, -0.08, 0.26), scale: q3(0.07, 0.02, 0.11) });
  for (let i = -3; i <= 3; i++) {
    bag(jaw, BONE_D, cone(q(0.016), q(0.04), 5), F(i * 0.031, -0.09, 0.46 - 0.028 * Math.abs(i)), { dir: [0, 1, 0] });
  }
  // chin braids with beads
  for (const s of [1, -1, 0]) {
    const tip = F(s * 0.07, -0.3, 0.43);
    b.sweep(catmull([F(s * 0.05, -0.19, 0.4), F(s * 0.065, -0.245, 0.425), tip]), q(0.014), { bone: jaw, color: braidPaint, sides: 5, caps: "round" });
    bag(jaw, BONE, sphere(q(0.021), 6, 4), F(s * 0.065, -0.245, 0.425));
    bag(jaw, GOLD, sphere(q(0.017), 5, 4), tip);
  }

  // tusks, gold ringed
  for (const s of [1, -1]) {
    const tp = bezier(F(s * 0.125, -0.1, 0.4), F(s * 0.18, 0.0, 0.52), F(s * 0.2, 0.1, 0.5), F(s * 0.16, 0.22, 0.42));
    b.sweep(tp, [q(0.044), 0], { bone: jaw, color: gradient(BONE, BONE_D, tp.at(0), tp.at(1)), caps: "point", sides: 7 });
    for (const t of [0.22, 0.45]) {
      const r = q(0.044) * (1 - t) + 0.006;
      b.part(torus(r, 0.012, 5, 9), GOLD, { bone: jaw, at: tp.at(t), dir: tp.tangentAt(t), axis: "z" });
    }
    b.part(torus(q(0.02), 0.006, 4, 8), GOLD_D, { bone: jaw, at: tp.at(0.7), dir: tp.tangentAt(0.7), axis: "z" });
  }

  // ears with gold hoops and bone studs
  const earOutline: Array<[number, number] | [number, number, "sharp"]> = [
    [q(0), q(-0.1)],
    [q(0.1), q(-0.06)],
    [q(0.26), q(0.08)],
    [q(0.5), q(0.38), "sharp"],
    [q(0.24), q(0.2)],
    [q(0.1), q(0.16)],
    [q(0), q(0.1)],
  ];
  const innerEar: Array<[number, number]> = [
    [q(0.03), q(-0.04)],
    [q(0.12), q(-0.01)],
    [q(0.28), q(0.11)],
    [q(0.2), q(0.12)],
    [q(0.08), q(0.1)],
  ];
  for (const s of [1, -1]) {
    const ex: P = [s * 0.82, 0.05, -0.5];
    b.extrude(earOutline, { at: F(s * 0.21, 0.08, 0.0), x: ex, thickness: 0.04, bevel: 0.01, color: hide, bone: head });
    b.extrude(innerEar, { at: F(s * 0.21, 0.08, 0.0), x: ex, thickness: 0.049, color: "#a9456a", bone: head });
    for (const [u, v] of [
      [0.16, 0.035],
      [0.31, 0.17],
    ]) {
      const c = F(s * (0.21 + u * 0.82), 0.08 + v, -u * 0.5);
      b.part(torus(q(0.026), 0.008, 4, 8), GOLD, { bone: head, at: c, dir: [s, 0, 0], axis: "z" });
      b.part(sphere(q(0.014), 5, 4), BONE, { bone: head, at: c });
    }
  }

  // mohawk: base ridge, blades, neck blades
  const mPath = catmull([F(0, 0.27, 0.3), F(0, 0.33, 0.12), F(0, 0.305, -0.08), F(0, 0.21, -0.19)]);
  b.sweep(mPath, q(0.055), { bone: head, color: HAIR_D, sides: 6 });
  const blade = (k: number): Array<[number, number] | [number, number, "sharp"]> => [
    [-0.05 * k, 0],
    [0.08 * k, 0],
    [0.115 * k, 0.1 * k],
    [0.16 * k, 0.24 * k],
    [0.23 * k, 0.37 * k, "sharp"],
    [0.07 * k, 0.26 * k],
    [-0.015 * k, 0.12 * k],
  ];
  const bladeCount = 15;
  b.along(mPath, bladeCount, (at) => {
    const i = Math.floor(at.t * bladeCount);
    const k = 0.85 + 0.55 * Math.sin(Math.PI * Math.min(1, at.t * 1.05 + 0.04));
    const side = i % 2 ? 1 : -1;
    b.extrude(blade(k), {
      at: [at.at.x + side * 0.014, at.at.y - 0.03, at.at.z],
      x: [0, -0.3, -1],
      y: [side * 0.28, 1, 0.3],
      thickness: [0.075, 0.022],
      bevel: 0.01,
      color: hairPaint,
      bone: head,
    });
  });
  b.along(mPath, 12, (at) => {
    const i = Math.floor(at.t * 12);
    const k = 0.55 + 0.4 * Math.sin(Math.PI * Math.min(1, at.t * 1.05 + 0.04));
    const side = i % 2 ? 1 : -1;
    b.extrude(blade(k), {
      at: [at.at.x + side * 0.07, at.at.y - 0.05, at.at.z + 0.02],
      x: [0, -0.3, -1],
      y: [side * 0.7, 1, 0.2],
      thickness: [0.06, 0.02],
      bevel: 0.008,
      color: hairPaint,
      bone: head,
    });
  });
  for (let i = 0; i < 5; i++) {
    const k = 0.9 - 0.09 * i;
    const side = i % 2 ? 1 : -1;
    const hit = body.ray([0, 3.4, 0.36 - 0.12 * i], [0, -1, 0]);
    if (!hit) throw new Error("no back surface for neck blade " + i);
    b.extrude(blade(k), {
      at: [side * 0.014, hit.at.y - 0.02, hit.at.z],
      x: [0, -0.5, -1],
      y: [side * 0.25, 1, -0.2],
      thickness: [0.075, 0.022],
      bevel: 0.008,
      color: hairPaint,
      bone: i < 2 ? neck.joints[1] : i < 4 ? neck.joints[0] : spine3,
    });
  }
  // braids from the back of the head
  for (const s of [1, -1]) {
    const bp = catmull([F(s * 0.17, 0.07, -0.08), F(s * 0.23, -0.05, -0.14), F(s * 0.26, -0.22, -0.12), F(s * 0.27, -0.42, -0.06)]);
    b.sweep(bp, [q(0.028), q(0.018)], { bone: head, color: braidPaint, sides: 6 });
    for (const t of [0.3, 0.55, 0.8]) bag(head, BONE, sphere(q(0.034), 6, 4), bp.at(t));
    bag(head, GOLD, sphere(q(0.026), 6, 4), bp.at(1));
    bag(head, CORD_RED, torus(q(0.022), 0.006, 4, 8), bp.at(0.12), { dir: bp.tangentAt(0.12) });
    b.cards([frame(bp.at(0.97), [0, 1, 0])], FEATHER_T, { size: [0.045, 0.18], lean: 180, flow: [0, 0, 1], bone: head });
  }
  // bone fetish stuck in the mohawk
  bag(head, BONE, new THREE.CylinderGeometry(0.014, 0.014, 0.3, 6), F(0.08, 0.46, 0.0), { dir: [0.35, 1, -0.15] });
  bag(head, BONE, sphere(0.026, 5, 4), F(0.08 + 0.05, 0.6, -0.02));
  b.cards([frame(F(0.1, 0.54, -0.02), [0, 1, 0])], FEATHER_Y, { size: [0.05, 0.2], lean: 180, flow: [0, 0, 1], bone: head });

  // face: war paint decal
  const facePatch = b.surface([skull, muzzle, nose, browRidge, ...facial.map((p) => (p instanceof Part ? p.mesh : p.meshes)).flat()]);
  b.decal(facePatch, BROW, { at: F(0, 0.285, 0.25), dir: [0, 0.9, 1], size: [0.2, 0.17], segments: 12, bone: head });
  for (const s of [1, -1])
    b.decal(facePatch, CHEEK, { at: F(s * 0.16, 0.02, 0.3), dir: [s * 0.7, 0.0, 1], size: [0.24, 0.17], segments: 12, bone: head, mirror: s > 0, roll: s * 8 });
  for (const s of [1, -1]) {
    for (const [x, y, z] of [
      [0.17, 0.03, 0.33],
      [0.2, -0.02, 0.22],
      [0.09, 0.2, 0.27],
    ])
      b.part(sphere(q(0.013), 5, 4), WART, { bone: head, at: F(s * x, y, z) });
  }

  // ------------------------------------------------------------------------------------------------ arms
  const armR = piece([
    [0, 0.27],
    [0.25, 0.25],
    [0.5, 0.2],
    [0.65, 0.215],
    [0.85, 0.17],
    [1, 0.14],
  ]);
  const handTargets: Record<number, P> = { 1: [1.04, 0.86, 0.5], [-1]: [-1.04, 0.86, 0.5] };
  const arms: Record<number, Chain> = {};
  const armSweeps: Record<number, Sweep> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const H = handTargets[s];
    const pts = limb([s * 0.66, 1.94, 0.2], H, [0.78, 0.76], [s * 0.45, 0, -1]);
    const arm = b.chain(`arm${side}`, polyline(pts), {
      parent: spine3,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    arms[s] = arm;
    const [sh, el, wr] = arm.joints;
    armSweeps[s] = b.sweep(arm, armR, { color: hide, sides: 10 });
    b.part(sphere(1, 10, 8), hide, { bone: sh, at: [s * 0.68, 1.98, 0.2], scale: [0.29, 0.27, 0.28] }); // deltoid
    b.part(sphere(1, 8, 6), hide, { bone: el, at: pts[1], scale: [0.2, 0.2, 0.2] });
    b.spike(pts[1], [s * 0.7, 0.15, -1], 0.2, 0.055, { bone: el, color: bonePaint(5), sides: 6 }); // elbow spur
    // bracers
    b.sweep(arm, (t) => armR(t) + 0.014, { from: 0.64, to: 0.82, color: LEATHERP, sides: 10, caps: "flat" });
    for (const [a, c] of [[0.635, 0.65], [0.81, 0.825]]) b.sweep(arm, (u) => armR(u) + 0.022, { from: a, to: c, color: GOLD_D, sides: 10, caps: "flat" });
    const rivetsPath = arm.path;
    for (const t of [0.66, 0.8]) {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const c = rivetsPath.at(t);
        const tan = rivetsPath.tangentAt(t);
        const ref = Math.abs(tan.y) > 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
        const sideV = tan.clone().cross(ref).normalize();
        const up = sideV.clone().cross(tan).normalize();
        const rr = armR(t) + 0.022;
        const pos = c.clone().add(sideV.clone().multiplyScalar(Math.cos(a) * rr)).add(up.clone().multiplyScalar(Math.sin(a) * rr));
        bag(arm.joints[1], GOLD, sphere(0.014, 4, 3), pos);
      }
    }
    // upper-arm bone armlet with spikes
    b.sweep(arm, (t) => armR(t) + 0.02, { from: 0.18, to: 0.26, color: IRON_D, sides: 10, caps: "flat" });
    b.ring(arm.at(0.22), { count: 7, radius: armR(0.22) + 0.015 }, (it) => {
      b.spike(it, it, 0.1, 0.028, { color: BONE, sides: 5 });
    });
    // tribal tattoo on the upper arm
    const upper = armSweeps[s].at(0.32, s * 90 - 90 + 90);
    b.decal(armSweeps[s], TATTOO, { at: upper, size: [0.2, 0.2], dir: [s, 0, 0], segments: 10, bone: sh });

    // hand: oversized palm, knuckles, fingers, thumb, claws
    const K = 1.45;
    const hx = H[0];
    const hy = H[1];
    const hz = H[2];
    b.sweep(polyline([[hx, hy - 0.03, hz], [hx, hy - 0.26 * K, hz + 0.02]]), (u) => [0.09 + 0.035 * u, 0.15 + 0.06 * u], { bone: wr, color: hide, sides: 8 });
    for (let i = 0; i < 4; i++) {
      const dz = (-0.095 + i * 0.064 + 0.02) * K;
      const len = [0.95, 1.05, 1.0, 0.82][i] * K;
      const p0: P = [hx, hy - 0.25 * K, hz + dz];
      const p1: P = [hx - s * 0.035, hy - 0.25 * K - 0.1 * len, hz + dz];
      const p2: P = [hx - s * 0.12 * K, hy - 0.25 * K - 0.17 * len, hz + dz];
      const f = b.chain(`finger${i + 1}${side}`, catmull([p0, p1, p2]), {
        parent: wr,
        names: [`finger${i + 1}${side}a`, `finger${i + 1}${side}b`],
        role: "digit",
      });
      b.sweep(f, [0.04 * K, 0.03 * K], { color: hide, sides: 7 });
      b.part(sphere(0.047 * K, 7, 5), hide, { bone: f.joints[0], at: p0 });
      b.spike(f.at(1), [-s * 0.55, -1, 0], 0.09 * K, 0.026 * K, { color: CLAW, sides: 5 });
      // knuckle stud on the back of the hand
      bag(f.joints[0], GOLD_D, cone(0.016, 0.04, 5), [hx + s * 0.07 * K, hy - 0.25 * K, hz + dz], { dir: [s, 0.15, 0] });
    }
    {
      const p0: P = [hx - s * 0.07 * K, hy - 0.1 * K, hz + 0.1 * K];
      const p1: P = [hx - s * 0.11 * K, hy - 0.2 * K, hz + 0.19 * K];
      const p2: P = [hx - s * 0.11 * K, hy - 0.3 * K, hz + 0.24 * K];
      const th = b.chain(`thumb${side}`, catmull([p0, p1, p2]), {
        parent: wr,
        names: [`thumb${side}a`, `thumb${side}b`],
        role: "digit",
      });
      b.sweep(th, [0.052 * K, 0.036 * K], { color: hide, sides: 7 });
      b.spike(th.at(1), [0, -1, 0.5], 0.09 * K, 0.028 * K, { color: CLAW, sides: 5 });
    }
    // wrist cuff of braided cord with a bone bead
    b.sweep(arm, (t) => armR(t) + 0.012, { from: 0.86, to: 0.93, color: CORD_RED, sides: 8, caps: "flat" });
  }


  // ------------------------------------------------------------------------------------------------ legs
  const legR = piece([
    [0, 0.25],
    [0.28, 0.215],
    [0.5, 0.18],
    [0.64, 0.19],
    [0.88, 0.135],
    [1, 0.105],
  ]);
  const legs: Record<number, Chain> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip: P = [s * 0.34, 1.06, -0.2];
    const ankle: P = [s * 0.42, 0.2, -0.06];
    const pts = limb(hip, ankle, [0.56, 0.55], [0, 0, 1]);
    const leg = b.chain(`leg${side}`, polyline(pts), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [ankle[0], 0, ankle[2] + 0.1],
    });
    legs[s] = leg;
    const [hp, kn, an] = leg.joints;
    const legTube = b.sweep(leg, legR, { color: hide, sides: 10 });
    b.part(sphere(1, 9, 7), hide, { bone: hp, at: [s * 0.37, 0.95, -0.17], scale: [0.26, 0.24, 0.22] }); // hip mass
    b.part(sphere(1, 8, 6), hide, { bone: kn, at: pts[1], scale: [0.2, 0.2, 0.2] });
    // knee spur and strap
    b.spike(pts[1], [s * 0.2, 0.2, 1], 0.14, 0.05, { bone: kn, color: bonePaint(6), sides: 6 });
    b.sweep(leg, (t) => legR(t) + 0.02, { from: 0.4, to: 0.47, color: LEATHERP, sides: 10, caps: "flat" });
    // calf wrap
    b.sweep(leg, (t) => legR(t) + 0.018, { from: 0.68, to: 0.84, color: LEATHERP, sides: 10, caps: "flat" });
    b.sweep(leg, (t) => legR(t) + 0.03, { from: 0.745, to: 0.775, color: GOLD_D, sides: 10, caps: "flat" });
    // anklet of bones
    b.ring(leg.at(0.93), { count: 6, radius: legR(0.93) + 0.012 }, (it) => {
      b.spike(it, it, 0.07, 0.022, { color: BONE, sides: 5 });
    });
    b.sweep(leg, (t) => legR(t) + 0.016, { from: 0.9, to: 0.94, color: CORD_RED, sides: 8, caps: "flat" });

    const thighSkin = b.surface(legTube);
    const thighHit = thighSkin.around(leg.at(0.2).at).at(s * 90, 0);
    if (thighHit) b.decal(thighSkin, TATTOO, { at: thighHit, size: [0.22, 0.22], dir: [s, 0, 0.1], segments: 10, bone: hp, mirror: s > 0 });
    for (const h of thighSkin.scatter(8, { rng: rng(40 + s), minDist: 0.14, filter: (h) => h.n.y > -0.3 })) b.stick(sphere(0.024, 6, 4), WART, h, { embed: 0.45 });

    // foot
    const x0 = ankle[0];
    b.part(sphere(1, 9, 7), hide, { bone: an, at: [x0, 0.14, ankle[2] - 0.1], scale: [0.17, 0.14, 0.17] }); // heel
    b.part(sphere(1, 10, 7), hide, { bone: an, at: [x0, 0.105, ankle[2] + 0.19], scale: [0.2, 0.11, 0.3] }); // foot body
    b.part(sphere(1, 8, 6), hide, { bone: an, at: [x0, 0.2, ankle[2] + 0.02], scale: [0.16, 0.11, 0.19] }); // instep
    const ball = b.joint(`ball${side}`, { parent: an, at: [x0, 0.09, ankle[2] + 0.36], dir: [0, -0.1, 1], role: "hinge" });
    for (let i = 0; i < 3; i++) {
      const tx = x0 + s * (1 - i) * 0.125;
      const len = i === 1 ? 0.22 : 0.19;
      const p0: P = [tx, 0.085, ankle[2] + 0.34];
      const p1: P = [tx, 0.075, ankle[2] + 0.34 + len];
      const toe = b.chain(`toe${i + 1}${side}`, [p0, p1], { parent: ball, names: [`toe${i + 1}${side}`], role: "digit" });
      b.sweep(toe, [0.068, 0.06], { color: hide, sides: 7 });
      b.spike(p1, [0, -0.25, 1], 0.085, 0.04, { bone: toe.joints[0], color: CLAW, sides: 5 });
    }
    b.spike([x0 - s * 0.01, 0.13, ankle[2] - 0.26], [0, 0.35, -1], 0.11, 0.045, { bone: an, color: CLAW, sides: 5 }); // heel spur
  }

  // ------------------------------------------------------------------------------------------------ clothes
  // belt
  const beltPath = body.loop([0, 1.2, -0.1], { lift: 0.03 });
  b.sweep(beltPath, [0.05, 0.026], { color: LEATHERP, section: "box", bone: hips });
  b.along(body.loop([0, 1.2, -0.1], { lift: 0.058 }), 22, (at) => {
    bag(hips, GOLD, sphere(0.014, 4, 3), at.at);
  });
  const frontHit = body.ray([0, 1.2, 3], [0, 0, -1]);
  const backHit = body.ray([0, 1.2, -3], [0, 0, 1]);
  if (!frontHit || !backHit) throw new Error("no belt surface");
  const bz = frontHit.at.z;
  const bzBack = backHit.at.z;
  // buckle: gold plate with a skull
  b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 8), GOLD_D, { bone: hips, at: [0, 1.2, bz + 0.03], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.036, 8), IRON_D, { bone: hips, at: [0, 1.2, bz + 0.033], dir: [0, 0, 1] });

  // diagonal harness strap
  const strapLoop = catmull(
    [
      [-0.5, 2.05, 0.1],
      [-0.2, 1.78, 0.55],
      [0.2, 1.45, 0.52],
      [0.5, 1.15, 0.38],
      [0.5, 1.15, -0.35],
      [0.15, 1.5, -0.4],
      [-0.3, 1.95, -0.2],
    ],
    { closed: true },
  );
  b.sweep(body.drape(strapLoop, { lift: 0.02 }), [0.04, 0.022], { color: LEATHERP, section: "box", bone: spine2 });

  // loincloth, front and back, tattered hems
  const flap = (hw: number, len: number, tear: number): Array<[number, number]> => {
    const o: Array<[number, number]> = [
      [-hw, 0],
      [hw, 0],
      [hw + 0.02, -len * 0.5],
    ];
    const n = 5;
    for (let i = 0; i < n; i++) {
      const x = hw - ((2 * hw) / n) * (i + 0.5) + (i % 2 ? 0.02 : -0.01);
      o.push([hw - (2 * hw * i) / n - hw / n, -len - (i % 2 ? 0 : tear) * (0.6 + 0.4 * ((i * 7) % 3) / 2)]);
      o.push([x, -len + tear * 0.6]);
    }
    o.push([-hw - 0.02, -len * 0.5]);
    return o;
  };
  const fy = 1.1;
  const fz = body.ray([0, fy, 3], [0, 0, -1])!.at.z;
  b.extrude(flap(0.36, 0.62, 0.12), { at: [0, fy, fz + 0.015], x: [-1, 0, 0], thickness: 0.02, bevel: 0.005, color: LEATHERP, bone: hips });
  b.extrude(flap(0.27, 0.64, 0.1), { at: [0, fy + 0.02, fz + 0.04], x: [-1, 0, 0], thickness: 0.022, bevel: 0.006, color: clothPaint, bone: hips });
  b.extrude(flap(0.34, 0.6, 0.1), { at: [0, fy + 0.05, bzBack - 0.06], x: [1, 0, 0], thickness: 0.02, bevel: 0.005, color: LEATHERP, bone: hips });
  b.extrude(flap(0.26, 0.58, 0.1), { at: [0, fy + 0.07, bzBack - 0.09], x: [1, 0, 0], thickness: 0.022, bevel: 0.006, color: clothPaint, bone: hips });
  for (let i = -2; i <= 2; i++) bag(hips, BONE, cone(0.018, 0.07, 5), [i * 0.1, fy - 0.64, fz + 0.06], { dir: [0, -1, 0] });
  // gold studs along the loincloth waistband
  for (let i = -4; i <= 4; i++) bag(hips, GOLD, sphere(0.013, 4, 3), [i * 0.06, fy - 0.025, fz + 0.056]);

  // ------------------------------------------------------------------------------------------------ bone fetishes
  function skullFetish(c: P, k: number, yaw: number, bone: Joint, horns: boolean, eyes?: string) {
    const rot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (yaw * Math.PI) / 180);
    const at = (x: number, y: number, z: number): P => {
      const v = new THREE.Vector3(x, y, z).multiplyScalar(k).applyQuaternion(rot);
      return [c[0] + v.x, c[1] + v.y, c[2] + v.z];
    };
    b.part(sphere(1, 8, 6), BONEP, { bone, at: at(0, 0, 0), scale: [0.9 * k, 0.8 * k, 1 * k], rotation: [0, yaw, 0] });
    b.part(new THREE.BoxGeometry(0.62 * k, 0.5 * k, 0.9 * k), BONEP, { bone, at: at(0, -0.42, 0.9), rotation: [0, yaw, 0] });
    b.part(new THREE.BoxGeometry(0.5 * k, 0.12 * k, 0.78 * k), BONE_D, { bone, at: at(0, -0.82, 0.82), rotation: [0, yaw, 0] });
    for (const sx of [1, -1]) {
      b.part(sphere(0.23 * k, 6, 5), SOCKET, { bone, at: at(sx * 0.46, 0.08, 0.76) });
      if (eyes) glow(b.part(sphere(0.1 * k, 5, 4), eyes, { bone, at: at(sx * 0.46, 0.08, 0.9) }), 1.3);
      b.part(sphere(0.07 * k, 5, 4), SOCKET, { bone, at: at(sx * 0.1, -0.35, 1.38) });
      for (let i = 0; i < 2; i++)
        b.part(new THREE.BoxGeometry(0.08 * k, 0.16 * k, 0.07 * k), BONE, { bone, at: at(sx * (0.1 + i * 0.12), -0.7, 1.28 - i * 0.08), rotation: [0, yaw, 0] });
      if (horns) {
        const hp = bezier(at(sx * 0.7, 0.3, 0.1), at(sx * 1.4, 0.4, 0.0), at(sx * 1.7, 1.0, 0.1), at(sx * 1.5, 1.7, 0.3));
        b.sweep(hp, [0.2 * k, 0], { bone, color: bonePaint(9), caps: "point", sides: 6 });
      }
    }
  }
  const featherCards = (at: P, tex: typeof FEATHER_R, bone: Joint, n: number, spread: number, len: number) => {
    const fs: Frame[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i - (n - 1) / 2) * spread;
      fs.push(frame(at, [Math.sin((a * Math.PI) / 180), Math.cos((a * Math.PI) / 180), 0]));
    }
    b.cards(fs, tex, { size: [len * 0.28, len], lean: 0, flow: [0, 0, 1], bone, bend: 18, mirror: true });
  };

  // necklace of bone beads, fangs and skulls
  const neckLoop = catmull(
    [
      [0, 2.14, 0.0],
      [0.36, 2.1, 0.22],
      [0.3, 1.82, 0.55],
      [0, 1.66, 0.62],
      [-0.3, 1.82, 0.55],
      [-0.36, 2.1, 0.22],
    ],
    { closed: true },
  );
  const necklace = body.drape(neckLoop, { lift: 0.035 });
  b.sweep(necklace, 0.016, { color: ROPE, bone: spine3, sides: 5 });
  const nlen = 26;
  for (let i = 0; i < nlen; i++) {
    const t = i / nlen;
    const pnt = necklace.at(t);
    if (i % 3 === 0) bag(spine3, BONE, new THREE.CylinderGeometry(0.02, 0.02, 0.07, 6), pnt, { dir: necklace.tangentAt(t) });
    else bag(spine3, i % 3 === 1 ? GOLD : CORD_RED, sphere(0.022, 6, 4), pnt);
    if (i % 3 === 0 && t > 0.25 && t < 0.75) bag(spine3, BONE, cone(0.02, 0.1, 5), pnt.clone().add(new THREE.Vector3(0, -0.04, 0.03)), { dir: [0, -1, 0.4] });
  }
  // central fetish pendant: skull with crossed bones and feathers
  const pc = necklace.at(0.5);
  const pendant: P = [pc.x, pc.y - 0.12, pc.z + 0.04];
  b.sweep(polyline([[pc.x, pc.y, pc.z + 0.01], [pendant[0], pendant[1] + 0.05, pendant[2]]]), 0.008, { color: ROPE, bone: spine3, sides: 4 });
  skullFetish(pendant, 0.075, 0, spine3, false, GLOWGREEN);
  for (const s of [1, -1]) {
    b.capsule([pendant[0] - s * 0.12, pendant[1] - 0.12, pendant[2] - 0.005], [pendant[0] + s * 0.12, pendant[1] + 0.08, pendant[2] - 0.005], 0.013, { bone: spine3, color: BONE, sides: 5 });
    bag(spine3, BONE, sphere(0.024, 5, 4), [pendant[0] - s * 0.12, pendant[1] - 0.12, pendant[2] - 0.005]);
    bag(spine3, BONE, sphere(0.024, 5, 4), [pendant[0] + s * 0.12, pendant[1] + 0.08, pendant[2] - 0.005]);
  }
  b.cards(
    [frame([pendant[0] - 0.06, pendant[1] - 0.06, pendant[2] - 0.01], [0, 1, 0]), frame([pendant[0] + 0.06, pendant[1] - 0.06, pendant[2] - 0.01], [0, 1, 0])],
    [FEATHER_R, FEATHER_Y],
    { size: [0.035, 0.14], lean: 180, flow: [0, 0, 1], bone: spine3, rng: rand },
  );

  // left shoulder: horned beast skull trophy
  skullFetish([0.74, 2.3, 0.2], 0.16, 55, arms[1].joints[0], true);
  b.sweep(catmull([[0.62, 2.2, 0.42], [0.8, 2.12, 0.42], [0.95, 2.1, 0.2], [0.9, 2.14, -0.02], [0.7, 2.2, -0.04]]), 0.018, { bone: arms[1].joints[0], color: LEATHERP, sides: 5 });
  // right shoulder: layered leather pauldron with bone spikes, studs and feathers
  {
    const sh = arms[-1].joints[0];
    const cx = -0.78;
    const cz = 0.2;
    const layers: Array<[number, number, number]> = [
      [2.1, 0.33, 0.1],
      [2.19, 0.27, 0.09],
      [2.27, 0.2, 0.085],
    ];
    for (const [y, r, h] of layers) {
      b.part(sphere(1, 10, 6), LEATHERP, { bone: sh, at: [cx, y, cz], scale: [r, h, r] });
      b.part(torus(r * 0.93, 0.016, 4, 14), IRON, { bone: sh, at: [cx, y - 0.015, cz], rotation: [90, 0, 0] });
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        bag(sh, GOLD, sphere(0.015, 4, 3), [cx + Math.cos(a) * r * 0.9, y + h * 0.35, cz + Math.sin(a) * r * 0.9]);
      }
    }
    b.ring(frame([cx, 2.08, cz], [0, 1, 0]), { count: 9, radius: 0.3, tilt: 55 }, (it) => {
      b.spike(it, it, 0.2, 0.045, { bone: sh, color: BONE, sides: 5 });
    });
    b.part(cone(0.075, 0.2, 6), BONE, { bone: sh, at: [cx, 2.4, cz] });
    b.part(torus(0.07, 0.014, 4, 8), GOLD, { bone: sh, at: [cx, 2.33, cz], rotation: [90, 0, 0] });
    featherCards([cx + 0.02, 2.33, cz - 0.08], FEATHER_R, sh, 3, 22, 0.46);
    featherCards([cx - 0.04, 2.32, cz + 0.1], FEATHER_Y, sh, 2, 30, 0.36);
    featherCards([cx + 0.04, 2.32, cz + 0.12], FEATHER_T, sh, 2, 26, 0.3);
  }
  // moss on shoulders and back
  b.cards(
    b.surface([trap, ...Object.values(armSweeps).flatMap((a) => a.meshes)]).scatter(30, {
      rng: rng(21),
      minDist: 0.1,
      filter: (h) => h.n.y > 0.4 && h.at.y > 1.85,
    }),
    MOSS,
    { size: [0.12, 0.2], lean: 55, bend: 50, flow: (f) => [f.at.x * 1.2, -0.5, 0.15], vary: 0.3, rng: rng(5) },
  );

  // belt fetishes: hanging bundle of bones, skulls and feathers at each hip
  for (const s of [1, -1]) {
    const x = s * 0.5;
    const top: P = [x, 1.2, 0.18];
    b.sweep(polyline([top, [x + s * 0.02, 1.0, 0.2], [x + s * 0.03, 0.84, 0.2]]), 0.01, { bone: hips, color: ROPE, sides: 4 });
    skullFetish([x + s * 0.03, 0.78, 0.22], 0.062, s * 30, hips, s > 0, s > 0 ? GLOWGREEN : undefined);
    b.capsule([x + s * 0.03, 0.9, 0.17], [x + s * 0.03, 0.63, 0.17], 0.013, { bone: hips, color: BONE, sides: 5 });
    for (const dy of [0.9, 0.63]) bag(hips, BONE, sphere(0.024, 5, 4), [x + s * 0.03, dy, 0.17]);
    b.cards([frame([x + s * 0.02, 1.18, 0.2], [0, 1, 0]), frame([x + s * 0.05, 1.17, 0.18], [0, 1, 0])], s > 0 ? [FEATHER_T, FEATHER_Y] : [FEATHER_R, FEATHER_T], {
      size: [0.04, 0.2],
      lean: 180,
      flow: [0, 0, 1],
      bone: hips,
      rng: rand,
    });
    b.part(torus(0.03, 0.009, 4, 8), CORD_RED, { bone: hips, at: [x + s * 0.02, 1.0, 0.2], dir: [0, 1, 0], axis: "z", rotation: [90, 0, 0] });
  }
  // back: bone-totem frame strapped on, with hanging skulls and feathers
  {
    const rayZ = (y: number) => {
      const h = body.ray([0, y, -3], [0, 0, 1]);
      if (!h) throw new Error("no back at " + y);
      return h.at.z;
    };
    const zLo = rayZ(1.35) - 0.12;
    const zHi = rayZ(2.15) - 0.1;
    for (const s of [1, -1]) {
      b.capsule([s * 0.32, 1.2, zLo], [s * 0.26, 2.32, zHi], 0.03, { bone: spine2, color: BONE_D, sides: 6 });
      bag(spine2, GOLD, torus(0.04, 0.012, 4, 8), [s * 0.31, 1.3, zLo], { dir: [0, 1, 0] });
    }
    const zMid = (rayZ(1.3) + rayZ(1.5)) / 2 - 0.12;
    b.capsule([-0.4, 1.46, zMid], [0.4, 1.46, zMid], 0.028, { bone: spine2, color: BONE, sides: 6 });
    b.capsule([-0.34, 2.12, zHi + 0.02], [0.34, 2.12, zHi + 0.02], 0.026, { bone: spine2, color: BONE, sides: 6 });
    b.capsule([0, 1.7, zMid + 0.03], [0, 2.42, zHi - 0.04], 0.034, { bone: spine2, color: BONE_D, sides: 6 });
    for (const x of [-0.4, 0.4]) bag(spine2, BONE, sphere(0.045, 6, 5), [x, 1.46, zMid]);
    for (const x of [-0.34, 0.34]) bag(spine2, BONE, sphere(0.04, 6, 5), [x, 2.12, zHi + 0.02]);
    for (const [x, k] of [
      [-0.26, 0.07],
      [0, 0.09],
      [0.26, 0.07],
    ] as Array<[number, number]>) {
      b.sweep(polyline([[x, 1.46, zMid], [x, 1.33, zMid - 0.01]]), 0.008, { bone: spine2, color: ROPE, sides: 4 });
      skullFetish([x, 1.33 - k * 0.8, zMid - 0.03], k, 180, spine2, k > 0.08, k > 0.08 ? GLOWGREEN : undefined);
    }
    skullFetish([0, 2.48, zHi - 0.06], 0.1, 180, spine2, true);
    for (const x of [-0.22, 0.22])
      b.cards([frame([x, 2.12, zHi - 0.02], [0, 1, 0])], x < 0 ? FEATHER_R : FEATHER_T, { size: [0.07, 0.34], lean: 180, flow: [0, 0, -1], bone: spine2, mirror: true });
    b.cards([frame([0.0, 2.12, zHi - 0.02], [0, 1, 0])], FEATHER_Y, { size: [0.07, 0.3], lean: 180, flow: [0, 0, -1], bone: spine2, mirror: true });
    // lashings where poles meet bars
    for (const [x, y, z] of [
      [-0.3, 1.46, zMid],
      [0.3, 1.46, zMid],
      [-0.27, 2.12, zHi + 0.02],
      [0.27, 2.12, zHi + 0.02],
    ] as P[])
      b.part(torus(0.04, 0.012, 4, 8), CORD_RED, { bone: spine2, at: [x, y, z], dir: [x * 0.3, 1, 0] });
    // buckle skull
    skullFetish([0, 1.2, bz + 0.05], 0.05, 0, hips, false);
  }
  // big tribal mark on the back, a scar across the belly
  {
    const bh = body.ray([0, 1.75, -3], [0, 0, 1]);
    if (bh) b.decal(body, TATTOO, { at: bh, dir: [0, 0, -1], up: [0, 1, 0], size: [0.34, 0.34], segments: 12, bone: spine2 });
    b.decal(body, SCAR, { at: body.around([0, 1.4, 0.1]).at(30, -10)!, dir: [0.5, 0, 1], size: [0.3, 0.19], segments: 10, roll: 20, bone: spine2 });
  }

  // fang fringe on the belt
  b.along(body.loop([0, 1.17, -0.1], { lift: 0.035 }), 18, (at) => {
    bag(hips, BONE, cone(0.016, 0.075, 5), at.at.clone().add(new THREE.Vector3(0, -0.04, 0)), { dir: [0, -1, 0] });
  });
  // rune tiles (small bone plaques) on the belt
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.1, 0.1), BONE, { bone: hips, at: [s * 0.2, 1.2, 0.325], dir: [s * 0.3, 0, 1], axis: "z", texture: RUNE });

  // chest tattoos
  for (const s of [1, -1]) {
    const hit = body.around([0, 1.7, 0.1]).at(s * 28, 8);
    if (hit) b.decal(body, TATTOO, { at: hit, size: [0.24, 0.24], dir: [s * 0.3, 0.1, 1], segments: 12, bone: spine3, mirror: s > 0 });
  }

  // warts and boils on the hide
  for (const h of b.surface([torso, bellyBulge]).scatter(26, { rng: rng(9), minDist: 0.14, filter: (h) => h.n.y > -0.4 }))
    b.stick(sphere(0.026, 6, 4), WART, h, { embed: 0.45 });

  // swamp toadstools growing from the hide: two glow teal
  {
    const stalk = new THREE.CylinderGeometry(0.011, 0.018, 0.09, 6).translate(0, 0.045, 0);
    const cap = new THREE.SphereGeometry(0.045, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.7, 1).translate(0, 0.09, 0);
    const spots = new THREE.SphereGeometry(0.008, 4, 3);
    const capCols = ["#e5532f", "#e5532f", "#3be0c6", "#f0b431", "#3be0c6"];
    const spots2: Array<[number, number, number, number]> = [
      [0.36, 2.2, 0.0, 1.9],
      [0.26, 2.2, -0.12, 1.2],
      [-0.34, 2.2, 0.04, 1.6],
      [-0.44, 2.1, -0.08, 1.0],
      [0.14, 2.25, -0.2, 1.3],
    ];
    spots2.forEach(([x, y, z, k], i) => {
      const hit = body.ray([x, y + 0.6, z], [0, -1, 0]);
      if (!hit) return;
      b.part(stalk.clone().scale(k, k, k).translate(0, -0.012, 0), "#efe6c8", { frame: hit, bone: spine3 });
      const capPart = b.part(cap.clone().scale(k, k, k).translate(0, -0.012, 0), capCols[i], { frame: hit, bone: spine3 });
      if (capCols[i] === "#3be0c6") glow(capPart, 1.1);
      else {
        const dots: THREE.BufferGeometry[] = [];
        for (let d = 0; d < 5; d++) {
          const th = 0.35 + 0.18 * (d % 3);
          const ph = d * 1.9 + i;
          const R = 0.047 * k;
          dots.push(
            spots
              .clone()
              .scale(k, k, k)
              .translate(R * Math.sin(th) * Math.cos(ph), 0.09 * k + 0.7 * R * Math.cos(th) - 0.012, R * Math.sin(th) * Math.sin(ph)),
          );
        }
        b.part(mergeGeometries(dots), "#fff2d0", { frame: hit, bone: spine3 });
      }
    });
  }

  flush();
  b.pose(jaw, { axis: [1, 0, 0], deg: 13 });
  return b.root;
}
