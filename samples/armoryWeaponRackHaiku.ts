import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Fill } from "../src/context";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { mix, noise, paint, rgb, smoothstep } from "../src/paint";
import type { Rgb } from "../src/paint";
import { bezier, catmull } from "../src/path";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";

export const meta = {
  name: "Armory Weapon Rack",
  description:
    "A free-standing oak weapon rack on an iron-rail hanger: a crimson banner, three swords, an axe and a warhammer, three shields (one on a hinge), three helms on the top beam, and a floor cluster of a gold-filled chest with its lid open, a spear barrel, a longbow and a helm on a stand.",
  style: "Blizzard/Warcraft",
  commit: "b816db2",
};

type V3t = [number, number, number];

const LIGHT = new THREE.Vector3(0.3, 0.75, 0.6).normalize();
const UP = new THREE.Vector3(0, 1, 0);
const FRONT = new THREE.Vector3(0, 0, 1);

/** Hand-painted light: a cool shadow tone turning in below the key light, a warm glint on the lit top. */
function tone(c: Rgb, n: THREE.Vector3, shade: Rgb, glint: Rgb, sh: number, gl: number): Rgb {
  const d = n.dot(LIGHT);
  const dark = (1 - smoothstep(-0.35, 0.15, d)) * sh;
  const hi = smoothstep(0.45, 0.92, d) * gl;
  return mix(mix(c, shade, dark), glint, hi);
}

/** Brush streaks, -1..1 (negative takes the shade, positive the glint), in model space. */
type Streak = (p: THREE.Vector3) => number;
const woodStreak: Streak = (p) =>
  Math.sin(70 * (p.x + p.z) + 7 * noise(p, 0.3, 2)) * 0.6 + (noise(p, 0.12, 4) - 0.5) * 1.6;
const brushed: Streak = (p) => Math.sin(120 * p.y + 3 * noise(p, 0.05, 9)) * 0.7;

function finish(base: string, shade: string, glint: string, streak?: Streak, sh = 0.55, gl = 0.5) {
  const B = rgb(base);
  const S = rgb(shade);
  const G = rgb(glint);
  return paint((p, n) => {
    const k = streak ? Math.max(-1, Math.min(1, streak(p))) : 0;
    return tone(mix(B, k > 0 ? G : S, Math.abs(k) * 0.3), n, S, G, sh, gl);
  });
}

// Palette: saturated, hand-painted, one paint per material so parts that share it continue one field.
const WOOD = finish("#8a5230", "#3a1d0c", "#d9955a", woodStreak);
const WOOD_D = finish("#5c3520", "#24120a", "#9a6a40", woodStreak);
const STEEL = finish("#aab5c4", "#3d485a", "#f5f9ff", brushed, 0.6, 0.6);
const IRON = finish("#50565f", "#1d2026", "#9aa3b0", brushed, 0.6, 0.45);
const GOLD = finish("#e8b444", "#7a4812", "#fff3b8", undefined, 0.6, 0.6);
const CRIMSON = finish("#b41f2e", "#4c0912", "#f26a72", woodStreak, 0.55, 0.45);
const BLUE = finish("#2a5cc8", "#10215c", "#90c4ff", undefined, 0.55, 0.5);
const BRONZE = finish("#bd7a3a", "#4a2410", "#fbcf8e", brushed, 0.6, 0.55);
const BONE = finish("#eadcb8", "#7d6a4a", "#fff8e6");
const LEATHER = finish("#6e3f22", "#2a160b", "#b97a42", woodStreak);
const GEM_RED = finish("#d8283a", "#5a0a14", "#ffb3b8", undefined, 0.5, 0.7);
const GEM_BLUE = finish("#3f8cff", "#0d2466", "#e6f2ff", undefined, 0.5, 0.7);
const INK = "#140e0b";

/** Blades: a bright edge, a dark fuller down the middle, a glint toward the tip. */
const BLADE = paint((_p, n, s) => {
  const x = Math.abs(s[0]);
  let c: Rgb = mix("#7d8899", "#dfe7f2", smoothstep(0.016, 0.03, x));
  if (x < 0.004 && s[1] < -0.04) c = mix(c, "#3f4a5c", 0.8);
  c = mix(c, "#ffffff", 0.25 * smoothstep(-0.9, -0.5, s[1]) * (1 - smoothstep(0.0, 0.03, x)));
  return tone(c, n, rgb("#3d485a"), rgb("#f5f9ff"), 0.6, 0.6);
});

/** Heater shield: crimson field lit toward the top, a gold border, a gold pale and bend; wood behind; iron edges. */
const HEATER = paint((_p, n, s) => {
  if (Math.abs(n.z) < 0.5) return tone(rgb("#8b94a3"), n, rgb("#262b36"), rgb("#f2f6ff"), 0.6, 0.5);
  if (n.z < 0) return tone(rgb("#5c3520"), n, rgb("#24120a"), rgb("#9a6a40"), 0.55, 0.45);
  const x = s[0];
  const y = s[1];
  const hw = y > 0 ? 0.23 : 0.23 * Math.sqrt(Math.max(0, 1 - (y / 0.36) ** 2));
  const edge = Math.min(hw - Math.abs(x), y > 0 ? 0.34 - y : y + 0.36);
  const gold = edge < 0.03 || Math.abs(y + 0.03) < 0.018 || (Math.abs(x) < 0.025 && y < 0.26);
  const field = mix("#b41f2e", "#e0485a", smoothstep(0.1, 0.34, y) * 0.5);
  return tone(gold ? rgb("#e8b444") : field, n, rgb("#4c0912"), rgb("#f26a72"), 0.55, 0.45);
});

/** Banner cloth: crimson with a gold border and a chevron of gold, faint folds across it. */
const CLOTH = paint((p, n, s) => {
  const edge = Math.max(Math.abs(s[0]) - 0.72, Math.abs(s[1]) - 0.5);
  const folds = 0.5 + 0.5 * Math.sin(40 * s[0] + 3 * noise(p, 0.4, 6));
  let c: Rgb = mix("#9e1b28", "#5a0a14", 0.25 * folds);
  const q = ((s[1] + 0.9 * Math.abs(s[0])) % 0.32) + 0.32;
  if (Math.abs((q % 0.32) - 0.16) < 0.022 && s[1] > -0.1) c = rgb("#e8b444");
  if (edge > -0.04) c = rgb("#e8b444");
  return tone(c, n, rgb("#4c0912"), rgb("#f26a72"), 0.5, 0.35);
});

const BLUE_SHIELD = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="rb" cx="38%" cy="30%" r="75%"><stop offset="0" stop-color="#7fb0ff"/><stop offset="0.55" stop-color="#2a5cc8"/><stop offset="1" stop-color="#0c1a48"/></radialGradient></defs>
<circle cx="50" cy="50" r="50" fill="url(#rb)"/>
<circle cx="50" cy="50" r="45" fill="none" stroke="#e8b444" stroke-width="2.5"/>
<path d="M12 40 L50 70 L88 40 L88 54 L50 84 L12 54 Z" fill="#e8b444" stroke="#6b3d0c" stroke-width="1.5"/>
<path d="M50 14 L57 27 L50 40 L43 27 Z" fill="#fff3b8" stroke="#6b3d0c" stroke-width="1.2"/>
<circle cx="50" cy="50" r="7" fill="#b41f2e" stroke="#e8b444" stroke-width="2"/>
</svg>`,
  { size: 256 },
);

const RED_SHIELD = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="rr" cx="38%" cy="30%" r="75%"><stop offset="0" stop-color="#ff8a8a"/><stop offset="0.55" stop-color="#b41f2e"/><stop offset="1" stop-color="#4c0912"/></radialGradient></defs>
<circle cx="50" cy="50" r="50" fill="url(#rr)"/>
<circle cx="50" cy="50" r="45" fill="none" stroke="#e8b444" stroke-width="2.5"/>
<rect x="14" y="43" width="72" height="14" fill="#e8b444" stroke="#6b3d0c" stroke-width="1.5"/>
<circle cx="50" cy="50" r="13" fill="#2a5cc8" stroke="#e8b444" stroke-width="2.5"/>
<path d="M50 30 L53 36 L50 42 L47 36 Z" fill="#fff3b8"/>
</svg>`,
  { size: 256 },
);

const b = createBuilder({ name: "armoryWeaponRack" });
const ROOT = b.joint("rack", { at: [0, 0, 0] });

/** One mesh already in model space, riding `bone` (rigid). */
function add(geo: THREE.BufferGeometry, color: Fill, bone: Joint = ROOT, texture?: THREE.Texture) {
  return b.part(geo, color, { bone, at: [0, 0, 0], texture });
}

function box(c: V3t, size: V3t, color: Fill, bone?: Joint) {
  return add(new THREE.BoxGeometry(size[0], size[1], size[2]).translate(c[0], c[1], c[2]), color, bone);
}

function peg(a: V3t, c: V3t, r: number, color: Fill, bone: Joint = ROOT) {
  return b.capsule(a, c, r, { color, bone });
}

/** Turn a geometry whose axis is `from` onto `dir`, then move it to `at`. */
function orient(geo: THREE.BufferGeometry, dir: THREE.Vector3, at: THREE.Vector3, from = UP) {
  geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(from, dir.clone().normalize()));
  return geo.translate(at.x, at.y, at.z);
}

// ---------------------------------------------------------------------------------------------------------------
// The rack: base, two oak uprights, top beam, backboard planks, a crimson banner and the iron hanging rail.

box([0, 0.04, 0], [2.5, 0.08, 0.7], WOOD_D);
for (const sx of [-1, 1]) for (const sz of [-1, 1]) box([sx * 1.2, 0.05, sz * 0.3], [0.12, 0.1, 0.12], IRON);

for (const sx of [-1, 1]) {
  const x = sx * 1.02;
  box([x, 1.1, -0.02], [0.12, 2.04, 0.12], WOOD);
  box([x, 0.14, -0.02], [0.16, 0.08, 0.16], IRON);
  box([x, 2.14, -0.02], [0.15, 0.06, 0.15], GOLD);
  for (const y of [0.42, 1.2, 1.8]) {
    box([x, y, 0.045], [0.14, 0.05, 0.02], IRON);
    for (const dx of [-0.045, 0.045]) add(new THREE.SphereGeometry(0.012, 6, 4).translate(x + dx, y, 0.064), STEEL);
  }
  peg([x, 0.16, -0.3], [x, 1.5, -0.12], 0.03, WOOD_D);
}

box([0, 2.16, -0.02], [2.4, 0.08, 0.16], WOOD);
box([0, 2.16, 0.075], [2.4, 0.03, 0.02], GOLD);
for (const sx of [-1, 1]) box([sx * 1.2, 2.16, -0.02], [0.04, 0.1, 0.18], IRON);
for (let i = 0; i < 9; i++) add(new THREE.SphereGeometry(0.014, 6, 4).translate(-1.04 + i * 0.26, 2.16, 0.09), GOLD);

for (const x of [-0.69, -0.23, 0.23, 0.69]) box([x, 1.16, -0.1], [0.44, 1.92, 0.04], WOOD_D);
for (const y of [0.3, 0.75]) box([0, y, -0.06], [1.9, 0.05, 0.03], IRON);
// Back battens and nail heads, behind the planks, so the rear reads as built.
for (const y of [0.5, 1.2, 1.9]) {
  box([0, y, -0.135], [1.9, 0.1, 0.03], WOOD_D);
  for (const x of [-0.8, 0.8]) add(new THREE.SphereGeometry(0.012, 6, 4).translate(x, y, -0.152), IRON);
}

b.extrude(
  [
    [-0.72, 0.5],
    [0.72, 0.5],
    [0.72, -0.52],
    [0, -0.22, "sharp"],
    [-0.72, -0.52],
  ],
  { at: [0, 1.62, -0.07], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, color: CLOTH, bone: ROOT },
);

peg([-0.92, 1.98, 0.07], [0.92, 1.98, 0.07], 0.022, IRON);
for (const x of [-0.9, -0.4, 0.1, 0.9]) peg([x, 1.98, 0.07], [x, 1.98, -0.09], 0.016, IRON);

// ---------------------------------------------------------------------------------------------------------------
// Upper tier: swords, an axe and a warhammer hung from the rail.

/** A sword hung by its crossguard, the guard resting on the rail at (x, z). `tilt` turns it about the front axis. */
function sword(x: number, z: number, tilt: number, len: number) {
  const gy = 2.03;
  const cs = Math.cos(tilt);
  const sn = Math.sin(tilt);
  const X: V3t = [cs, sn, 0];
  const Y: V3t = [-sn, cs, 0];
  const at: V3t = [x, gy, z];
  // Local (a across, c up the blade, d out of the plane) to model space.
  const at3 = (a: number, c: number, d = 0) => new THREE.Vector3(x + cs * a - sn * c, gy + sn * a + cs * c, z + d);

  b.extrude(
    [
      [-0.04, -0.02],
      [0.04, -0.02],
      [0.036, -0.34],
      [0.018, -len * 0.92],
      [0, -len, "sharp"],
      [-0.018, -len * 0.92],
      [-0.036, -0.34],
    ],
    { at, x: X, y: Y, thickness: 0.013, bevel: 0.004, color: BLADE, bone: ROOT },
  );
  b.extrude(
    [
      [-0.17, 0, "sharp"],
      [-0.12, 0.022],
      [0.12, 0.022],
      [0.17, 0, "sharp"],
      [0.13, -0.024],
      [-0.13, -0.024],
    ],
    { at, x: X, y: Y, thickness: 0.034, bevel: 0.008, color: GOLD, bone: ROOT },
  );
  b.part(new THREE.OctahedronGeometry(0.022), GEM_RED, { at: at3(0, 0, 0.026), bone: ROOT });
  b.capsule(at3(0, 0.02), at3(0, 0.15), 0.018, { color: LEATHER, bone: ROOT });
  for (const c of [0.05, 0.085, 0.12]) {
    add(orient(new THREE.TorusGeometry(0.021, 0.005, 5, 10), new THREE.Vector3(-sn, cs, 0), at3(0, c), FRONT), GOLD);
  }
  add(new THREE.SphereGeometry(0.03, 8, 6).translate(...at3(0, 0.17).toArray()), GOLD);
  b.part(new THREE.OctahedronGeometry(0.014), GEM_BLUE, { at: at3(0, 0.17, 0.022), bone: ROOT });
}

sword(-0.76, 0.1, -0.04, 0.82);
sword(-0.5, 0.1, 0.05, 0.78);
sword(0.7, 0.1, -0.03, 0.8);

/** A crescent axe hung by its eye from the rail; a convex bit edge on the right, the haft running down the rack. */
function axe(x: number, z: number) {
  b.capsule([x, 1.95, z], [x, 1.04, z], 0.022, { color: WOOD, bone: ROOT });
  for (const y of [1.5, 1.36]) add(new THREE.TorusGeometry(0.025, 0.007, 5, 10).rotateX(Math.PI / 2).translate(x, y, z), LEATHER);
  add(new THREE.SphereGeometry(0.03, 8, 6).translate(x, 1.04, z), IRON);
  b.extrude(
    [
      [-0.03, 0.24, "sharp"],
      [0.1, 0.22],
      [0.2, 0.14],
      [0.25, 0.0],
      [0.22, -0.14],
      [0.12, -0.24],
      [0.02, -0.25, "sharp"],
      [0.04, -0.12],
      [0.05, 0.0],
      [0.03, 0.12],
    ],
    { at: [x, 1.93, z], x: [1, 0, 0], y: [0, 1, 0], thickness: [0.01, 0.02], bevel: 0.004, color: BLADE, bone: ROOT },
  );
  b.spike([x, 2.1, z], [0, 1, 0], 0.07, 0.014, { color: STEEL, bone: ROOT });
}
axe(-0.14, 0.1);

/** A warhammer: iron block head with a gold band and a back spike, on a dark haft. */
function hammer(x: number, z: number) {
  b.capsule([x, 1.95, z], [x, 1.04, z], 0.02, { color: WOOD_D, bone: ROOT });
  box([x + 0.02, 1.97, z], [0.24, 0.12, 0.08], IRON);
  box([x + 0.1, 1.97, z], [0.03, 0.13, 0.086], GOLD);
  b.spike([x - 0.1, 1.97, z], [-1, 0, 0], 0.08, 0.02, { color: IRON, bone: ROOT });
  for (const dy of [-0.035, 0.035]) add(new THREE.SphereGeometry(0.009, 6, 4).translate(x - 0.02, 1.97 + dy, z + 0.046), STEEL);
}
hammer(0.36, 0.1);

// ---------------------------------------------------------------------------------------------------------------
// Lower tier: a heater shield, and two round shields (the right one hangs from a hinge on its peg).

/** A round shield on a wall peg: wood disc, painted face, gold rim, boss and rivet ring. */
function roundShield(x: number, y: number, z: number, R: number, emblem: THREE.Texture, rim: Fill, bone: Joint) {
  add(new THREE.CylinderGeometry(R, R, 0.03, 28).rotateX(Math.PI / 2).translate(x, y, z), WOOD_D, bone);
  add(new THREE.CircleGeometry(R - 0.01, 28).translate(x, y, z + 0.0165), "#ffffff", bone, emblem);
  add(new THREE.TorusGeometry(R - 0.006, 0.016, 8, 28).translate(x, y, z + 0.012), rim, bone);
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.078, 0.012],
      [0.072, 0.026],
      [0.036, 0.046],
      [0, 0.052],
    ],
    { at: [x, y, z + 0.015], axis: [0, 0, 1], color: rim, bone },
  );
  b.ring(frame([x, y, z + 0.012], FRONT), { count: 14, radius: R - 0.006 }, (it) =>
    b.part(new THREE.SphereGeometry(0.011, 6, 4), rim, { at: it, bone }),
  );
}

const shieldHinge = b.joint("shieldHinge", { parent: ROOT, at: [0.6, 1.0, 0.0], role: "hinge" });

peg([-0.6, 0.95, -0.09], [-0.6, 0.95, 0.0], 0.014, IRON);
roundShield(-0.6, 0.69, 0.02, 0.31, BLUE_SHIELD, GOLD, ROOT);

peg([0.6, 1.0, -0.09], [0.6, 1.0, 0.0], 0.014, IRON);
roundShield(0.6, 0.69, 0.02, 0.31, RED_SHIELD, GOLD, shieldHinge);

peg([0, 0.98, -0.08], [0, 0.98, 0.0125], 0.014, IRON);
b.extrude(
  [
    [-0.23, 0.34],
    [0.23, 0.34],
    [0.23, 0.04],
    [0.22, -0.06],
    [0.18, -0.18],
    [0.1, -0.28],
    [0, -0.36, "sharp"],
    [-0.1, -0.28],
    [-0.18, -0.18],
    [-0.22, -0.06],
    [-0.23, 0.04],
  ],
  { at: [0, 0.68, 0.03], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.035, bevel: 0.008, color: HEATER, bone: ROOT },
);

// ---------------------------------------------------------------------------------------------------------------
// Top beam: three helms on oak pegs.

/** A great helm on (cx, y0, cz) with a brow, cheek plates, eye slits, a rivet band and a plume or horns. */
function helm(cx: number, y0: number, cz: number, skull: Fill, trim: Fill, crest: "plume" | "horns") {
  b.lathe(
    [
      [0, 0],
      [0.15, 0],
      [0.168, 0.03],
      [0.172, 0.1],
      [0.155, 0.185],
      [0.095, 0.25],
      [0, 0.275],
    ],
    { at: [cx, y0, cz], color: skull, smoothing: 1, segments: 16, bone: ROOT },
  );
  add(new THREE.TorusGeometry(0.174, 0.012, 6, 24).rotateX(Math.PI / 2).translate(cx, y0 + 0.035, cz), trim);
  b.ring(frame([cx, y0 + 0.035, cz], UP), { count: 10, radius: 0.174 }, (it) =>
    b.part(new THREE.SphereGeometry(0.01, 6, 4), trim, { at: it, bone: ROOT }),
  );
  box([cx, y0 + 0.11, cz + 0.165], [0.03, 0.12, 0.024], skull);
  b.capsule([cx - 0.12, y0 + 0.17, cz + 0.135], [cx + 0.12, y0 + 0.17, cz + 0.135], 0.018, { color: trim, bone: ROOT });
  for (const s of [1, -1]) {
    box([cx + s * 0.14, y0 + 0.07, cz + 0.09], [0.05, 0.13, 0.12], skull);
    box([cx + s * 0.055, y0 + 0.135, cz + 0.16], [0.045, 0.02, 0.02], INK);
  }
  if (crest === "plume") {
    b.sweep(
      bezier([cx, y0 + 0.26, cz], [cx, y0 + 0.4, cz - 0.06], [cx, y0 + 0.48, cz - 0.2], [cx, y0 + 0.36, cz - 0.34]),
      [0.035, 0.006],
      { color: CRIMSON, caps: { start: "round", end: "point" }, bone: ROOT },
    );
    return;
  }
  for (const s of [1, -1]) {
    b.sweep(
      bezier(
        [cx + s * 0.15, y0 + 0.1, cz],
        [cx + s * 0.28, y0 + 0.12, cz + 0.02],
        [cx + s * 0.34, y0 + 0.26, cz + 0.02],
        [cx + s * 0.32, y0 + 0.34, cz - 0.02],
      ),
      [0.032, 0.006],
      { color: BONE, caps: { start: "round", end: "point" }, bone: ROOT },
    );
  }
}

for (const cx of [-0.7, 0, 0.7]) peg([cx, 2.19, -0.02], [cx, 2.32, -0.02], 0.026, WOOD_D);
helm(-0.7, 2.3, -0.02, STEEL, GOLD, "plume");
helm(0, 2.3, -0.02, BRONZE, GOLD, "horns");
helm(0.7, 2.3, -0.02, BLUE, GOLD, "plume");

// ---------------------------------------------------------------------------------------------------------------
// Floor: a gold-filled chest with its lid open, a spear barrel, a longbow, a helm on a stand.

const CHEST_X = 0.62;
const CHEST_Z = 0.62;
box([CHEST_X, 0.2, CHEST_Z], [0.8, 0.4, 0.46], WOOD_D);
for (const x of [0.3, 0.94]) box([x, 0.2, 0.858], [0.05, 0.4, 0.02], IRON);
box([CHEST_X, 0.22, 0.862], [0.12, 0.12, 0.02], GOLD);
box([CHEST_X, 0.21, 0.873], [0.02, 0.05, 0.01], INK);
box([0.225, 0.2, CHEST_Z], [0.02, 0.4, 0.05], IRON);
box([1.015, 0.2, CHEST_Z], [0.02, 0.4, 0.05], IRON);

const lid = b.joint("chestLid", { parent: ROOT, at: [CHEST_X, 0.4, 0.39], role: "hinge" });
box([CHEST_X, 0.43, CHEST_Z], [0.84, 0.06, 0.46], WOOD_D, lid);
box([CHEST_X, 0.468, CHEST_Z], [0.1, 0.01, 0.46], IRON, lid);
box([CHEST_X, 0.43, 0.855], [0.84, 0.07, 0.02], GOLD, lid);
b.pose(lid, { axis: [1, 0, 0], deg: -28 });

const coinRand = rng(11);
for (let i = 0; i < 46; i++) {
  const x = CHEST_X + (coinRand() - 0.5) * 0.6;
  const z = CHEST_Z + (coinRand() - 0.5) * 0.34;
  const heap = Math.max(0, 0.3 - Math.hypot(x - CHEST_X, (z - CHEST_Z) * 1.4)) * 0.22;
  const y = 0.402 + heap + coinRand() * 0.008;
  const coin = new THREE.CylinderGeometry(0.034, 0.034, 0.009, 10)
    .rotateX((coinRand() - 0.5) * 0.5)
    .rotateZ((coinRand() - 0.5) * 0.5)
    .translate(x, y, z);
  add(coin, GOLD);
}
add(new THREE.OctahedronGeometry(0.026).translate(0.5, 0.44, 0.6), GEM_RED);
add(new THREE.OctahedronGeometry(0.022).translate(0.78, 0.43, 0.7), GEM_BLUE);

const BX = -0.95;
const BZ = 0.72;
b.lathe(
  [
    [0, 0],
    [0.2, 0],
    [0.225, 0.05],
    [0.25, 0.2],
    [0.262, 0.36],
    [0.25, 0.55],
    [0.225, 0.68],
    [0.2, 0.72],
    [0, 0.72],
  ],
  { at: [BX, 0, BZ], color: WOOD, smoothing: 1, bone: ROOT },
);
add(new THREE.TorusGeometry(0.233, 0.014, 6, 24).rotateX(Math.PI / 2).translate(BX, 0.1, BZ), IRON);
add(new THREE.TorusGeometry(0.236, 0.014, 6, 24).rotateX(Math.PI / 2).translate(BX, 0.62, BZ), IRON);

const spears: Array<[number, number, number]> = [
  [-0.04, -0.03, 0.02],
  [0.0, 0.02, -0.02],
  [0.04, 0.0, 0.0],
];
for (const [dx, dz, lean] of spears) {
  const base: V3t = [BX + dx, 0.25, BZ + dz];
  const top: V3t = [BX + dx + lean, 1.92, BZ + dz - 0.05];
  b.rod(base, top, 0.016, { color: WOOD, bone: ROOT });
  const dir = new THREE.Vector3(top[0] - base[0], top[1] - base[1], top[2] - base[2]).normalize();
  b.extrude(
    [
      [-0.04, 0.0],
      [0.0, -0.03],
      [0.04, 0.0],
      [0.014, 0.1],
      [0, 0.22, "sharp"],
      [-0.014, 0.1],
    ],
    { at: top, x: [1, 0, 0], y: [dir.x, dir.y, dir.z], thickness: 0.013, bevel: 0.003, color: BLADE, bone: ROOT },
  );
  const t = (1.86 - base[1]) / (top[1] - base[1]);
  box([base[0] + (top[0] - base[0]) * t, 1.86, base[2] + (top[2] - base[2]) * t], [0.035, 0.09, 0.012], CRIMSON);
}

b.lathe(
  [
    [0, 0],
    [0.13, 0],
    [0.13, 0.035],
    [0.05, 0.06],
    [0.03, 0.12],
    [0.03, 0.5],
    [0, 0.5],
  ],
  { at: [0, 0, 0.72], color: WOOD_D, bone: ROOT },
);
helm(0, 0.5, 0.72, STEEL, BRONZE, "horns");
/** A leather quiver on the plinth: iron band, six arrows with crimson fletching and steel heads. */
function quiver(x: number, z: number) {
  b.lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.055, 0.1],
      [0.05, 0.5],
      [0.045, 0.52],
      [0, 0.52],
    ],
    { at: [x, 0, z], color: LEATHER, smoothing: 1, bone: ROOT },
  );
  add(new THREE.TorusGeometry(0.05, 0.008, 5, 16).rotateX(Math.PI / 2).translate(x, 0.3, z), IRON);
  const rand = rng(5);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const base: V3t = [x + Math.cos(a) * 0.02, 0.42, z + Math.sin(a) * 0.02];
    const lean = 0.06 + rand() * 0.04;
    const dir: V3t = [Math.cos(a) * lean, 1, Math.sin(a) * lean];
    const len = 0.56 + rand() * 0.08;
    const tip: V3t = [base[0] + dir[0] * len, base[1] + dir[1] * len, base[2] + dir[2] * len];
    b.rod(base, tip, 0.006, { color: WOOD, bone: ROOT });
    b.spike(tip, [dir[0], dir[1], dir[2]], 0.035, 0.009, { color: STEEL, bone: ROOT });
    box([base[0] + dir[0] * 0.5, base[1] + dir[1] * 0.5, base[2] + dir[2] * 0.5], [0.03, 0.07, 0.006], CRIMSON);
  }
}
quiver(-1.14, 0.2);

/** A longbow standing on its lower tip against the chest, string on the back side. */
function longbow(x: number, z: number) {
  const upper: V3t[] = [
    [x, 0.8, z],
    [x + 0.05, 1.1, z],
    [x, 1.4, z],
    [x - 0.1, 1.58, z],
  ];
  const lower: V3t[] = upper.map(([px, py, pz]): V3t => [px, 1.6 - py, pz]);
  b.sweep(catmull(upper), [0.018, 0.012], { color: WOOD, bone: ROOT });
  b.sweep(catmull(lower), [0.018, 0.012], { color: WOOD, bone: ROOT });
  b.capsule([x, 0.6, z], [x, 1.0, z], 0.02, { color: WOOD_D, bone: ROOT });
  b.capsule([x, 0.72, z], [x, 0.88, z], 0.024, { color: LEATHER, bone: ROOT });
  b.rod([x - 0.1, 1.58, z - 0.02], [x - 0.1, 0.02, z - 0.02], 0.004, { color: BONE, bone: ROOT });
}
longbow(1.2, 0.55);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  return b.root;
}
