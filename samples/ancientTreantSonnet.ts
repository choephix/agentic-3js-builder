import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { OutlinePoint } from "../src/builder";
import type { FrameInput } from "../src/math";
import type { Joint } from "../src/skeleton";
import type { Sweep } from "../src/sweep";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import { cells, mix, mottle, noise, paint, smoothstep, spots } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Ancient Treant",
  description:
    "A 7.5 m walking tree guardian in chunky Warcraft-style proportions: mossy bark titan with burl pauldrons, bronze bracers, glowing heartwood, a mossy beard and a canopy of leafy branches.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const BK = { dd: "#22130b", d: "#432810", m: "#6b4424", l: "#98683a", hi: "#d29c58" };
const MS = { dd: "#1b4310", d: "#2c6317", m: "#4f9a25", l: "#8fd13a" };
// hand-painted bronze: dark underside, warm body, bright top edge, green patina flecks
const BRONZE = paint((p, n) => {
  let c = mix("#6b4417", "#c08a30", smoothstep(-0.6, 0.6, n.y));
  c = mix(c, "#f6cc62", smoothstep(0.5, 1, n.y) * 0.85);
  c = mix(c, "#4f8a5a", smoothstep(0.62, 0.8, noise(p, 0.07, 55)) * 0.45);
  return c;
});
const BRONZE_D = "#6b4417";
const BRONZE_L = "#f2c455";
const STONE = "#7f8c88";
const STONE_D = "#4a5753";
const AMBER = "#ffb42a";
const SAP = "#7dff4e";
const DARK = "#1c0d07";
const CREAM = "#efe0b6";
const HEART = "#d8b574";
const RED = "#d5352a";
const VINE = "#3c6b20";
const STRAW = "#a98440";
const STRAW_D = "#6b4f22";
const EGG = "#79cde6";
const LEATHER = "#8a4a26";
const LEATHER_D = "#5a2e16";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------------------------------------------------------
// Paints: hand-painted bark with fissures, painted highlights, shadowed undersides and moss on top
function bark(ridges: number, seed: number, moss = 1, world: boolean | "uv" = false, tint?: string, tintAmt = 0) {
  const q = new THREE.Vector3();
  return paint((p, n, s) => {
    const warp = (noise(p, 1.4, seed) - 0.5) * 1.3 + (noise(p, 0.5, seed + 4) - 0.5) * 0.5;
    let e: number;
    if (world === "uv") {
      const f = ((((s[0] * ridges + warp) % 1) + 1) % 1);
      e = Math.min(f, 1 - f) * 2;
    } else if (world) {
      const c = cells(q.set(p.x, p.y * 0.12, p.z), 1 / ridges, seed);
      e = Math.min(1, (c.d2 - c.d1) * 2.2);
    } else {
      const f = ((((s[1] / 360) * ridges + warp) % 1) + 1) % 1;
      e = Math.min(f, 1 - f) * 2;
    }
    const gate = smoothstep(0.1, 0.4, noise(p, 0.6, seed + 8));
    const fis = (1 - smoothstep(0.08, 0.36, e)) * (0.6 + 0.4 * gate);
    const crack = 1 - smoothstep(0.012, 0.035, Math.abs(noise(q.set(p.x, p.y * 2.6, p.z), 0.5, seed + 30) - 0.5));
    let c = mix(BK.m, BK.l, smoothstep(0.2, 1, e));
    c = mix(c, BK.d, smoothstep(0.3, 0.75, noise(p, 0.38, seed + 2)) * 0.32);
    c = mix(c, BK.hi, smoothstep(0.1, 0.95, n.y + 0.25) * smoothstep(0.6, 1, e) * 0.55);
    c = mix(c, BK.dd, (1 - smoothstep(-0.7, 0.3, n.y)) * 0.38);
    c = mix(c, BK.dd, 0.38 * (1 - smoothstep(0, 1.6, p.y)));
    c = mix(c, BK.dd, Math.max(fis * 0.97, crack * 0.55 * smoothstep(0.2, 0.8, e)));
    const mm = n.y * 0.9 + (noise(p, 0.5, seed + 11) - 0.5) * 1.5 + (p.y < 0.9 ? 0.25 : 0) - (1 - moss) * 0.9;
    const cover = smoothstep(0.38, 0.5, mm);
    if (cover > 0) {
      let mc = mix(MS.d, MS.m, smoothstep(0.3, 0.7, noise(p, 0.17, seed + 12)));
      mc = mix(mc, MS.l, smoothstep(0.55, 0.95, n.y) * 0.6 * smoothstep(0.4, 0.7, noise(p, 0.1, seed + 14)));
      const rim = smoothstep(0.38, 0.46, mm) * (1 - smoothstep(0.46, 0.58, mm));
      mc = mix(mc, MS.dd, rim * 0.75);
      c = mix(c, mc, cover);
    }
    return tint ? mix(c, tint, tintAmt) : c;
  });
}

const BARK_TORSO = bark(24, 1, 0.5);
const BARK_ARM = bark(10, 2, 0.7);
const BARK_LEG = bark(11, 3, 0.55);
const BARK_FINGER = bark(4, 4, 0.2);
const BARK_BRANCH = bark(6, 5, 0.7);
const BARK_TWIG = bark(3, 6, 0.35);
const BARK_W = bark(3.2, 7, 0.6, true);
const BARK_HEAD = bark(3.6, 8, 0.45, true);
const BARK_SKULL = bark(14, 8, 0.45, "uv");
const BARK_FACE = bark(6, 8, 0.4);
const BARK_PLATE = bark(3.4, 9, 0.35, true, "#a8582a", 0.3);
const BARK_PLATE_B = bark(3.0, 10, 0.2, true, "#8a4424", 0.25);
const MOSS_PAINT = paint((p, n) => {
  const base = mix(MS.d, MS.m, smoothstep(0.3, 0.7, noise(p, 0.16, 21)));
  return mix(base, MS.l, smoothstep(0.4, 0.8, noise(p, 0.07, 22)) * (0.35 + 0.4 * smoothstep(0, 1, n.y)));
});
const FUNGUS = mottle("#e8982f", "#bd5f1c", { size: 0.16, seed: 31 });
const TOAD = spots(RED, CREAM, { size: 0.07, amount: 0.38, seed: 33 });
const STONE_PAINT = mottle(STONE, STONE_D, { size: 0.09, seed: 41, contrast: 1.2 });

// ---------------------------------------------------------------------------------------------------------------
// Textures
const leafPath = "M0 0 C-17 -22 -19 -54 0 -86 C19 -54 17 -22 0 0Z";
function sprig(c: { d: string; m: string; l: string; v: string; o: string }, id: string) {
  const leaf = (x: number, y: number, rot: number, sc: number) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})"><path d="${leafPath}" fill="url(#${id})" stroke="${c.o}" stroke-width="3.6"/>` +
    `<path d="M0 -6 L0 -74" stroke="${c.v}" stroke-width="3" fill="none"/>` +
    `<path d="M0 -28 L-10 -44 M0 -28 L10 -44 M0 -50 L-8 -64 M0 -50 L8 -64" stroke="${c.v}" stroke-width="2.6" fill="none"/></g>`;
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="${id}" x1="0" y1="1" x2="0.15" y2="0"><stop offset="0" stop-color="${c.d}"/><stop offset="0.55" stop-color="${c.m}"/><stop offset="1" stop-color="${c.l}"/></linearGradient></defs>` +
      `<path d="M64 128 C62 110 66 90 64 66" stroke="${BK.d}" stroke-width="4" fill="none"/>` +
      leaf(64, 112, -52, 0.55) +
      leaf(64, 112, 52, 0.55) +
      leaf(64, 92, -30, 0.68) +
      leaf(64, 92, 30, 0.68) +
      leaf(64, 70, 0, 0.78) +
      `</svg>`,
    { size: 160 },
  );
}
const SPRIG_G = sprig({ d: "#1f5a14", m: "#3f9422", l: "#8fd53a", v: "#c9ee7c", o: "#143d0d" }, "g1");
const SPRIG_L = sprig({ d: "#2f7a1a", m: "#62b82c", l: "#c4ea4e", v: "#f0ff9c", o: "#1d5a10" }, "g2");
const SPRIG_GOLD = sprig({ d: "#a8480f", m: "#e3881c", l: "#ffd44a", v: "#fff1a0", o: "#6e2c08" }, "g3");

const LEAF = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96"><defs><linearGradient id="gl" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#215d15"/><stop offset="1" stop-color="#8fd53a"/></linearGradient></defs>` +
    `<g transform="translate(32 94)"><path d="${leafPath}" fill="url(#gl)" stroke="#143d0d" stroke-width="3.4"/><path d="M0 -6 L0 -74" stroke="#c9ee7c" stroke-width="3" fill="none"/></g></svg>`,
  { size: 96 },
);

const MOSS_STRAND = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 128">` +
    `<path d="M18 128 C2 90 30 56 12 2 C27 54 6 92 30 128Z" fill="#587d2c" stroke="#33501a" stroke-width="2"/>` +
    `<path d="M28 128 C14 96 44 62 34 6 C47 60 24 98 40 128Z" fill="#86ad40" stroke="#4b6b22" stroke-width="2"/>` +
    `<path d="M10 128 C8 100 22 80 22 40 C26 84 18 104 20 128Z" fill="#a9cc58"/></svg>`,
  { size: 128 },
);

const TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64">` +
    `<path d="M6 64 C8 40 6 22 4 8 C14 24 18 44 22 64Z" fill="#4d8f23"/>` +
    `<path d="M16 64 C18 36 26 18 30 2 C34 22 32 44 32 64Z" fill="#7fc236"/>` +
    `<path d="M28 64 C34 44 40 28 46 14 C44 36 42 50 42 64Z" fill="#3a7a1c"/></svg>`,
  { size: 96 },
);

const FLOWER = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    [0, 72, 144, 216, 288]
      .map((a) => `<ellipse cx="32" cy="15" rx="9.5" ry="13" fill="#ffd9ec" stroke="#d96a9e" stroke-width="2.6" transform="rotate(${a} 32 32)"/>`)
      .join("") +
    `<circle cx="32" cy="32" r="8" fill="#ffc42e" stroke="#c77f10" stroke-width="2.6"/></svg>`,
  { size: 96 },
);

function sigil() {
  const ticks = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return `M${50 + Math.cos(a) * 40} ${50 + Math.sin(a) * 40} L${50 + Math.cos(a) * 46} ${50 + Math.sin(a) * 46}`;
  }).join(" ");
  const glyph = "M50 22 L50 80 M50 38 L35 26 M50 38 L65 26 M50 54 L31 40 M50 54 L69 40 M50 68 L37 58 M50 68 L63 58";
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="none" stroke-linecap="round">` +
      `<circle cx="50" cy="50" r="43" stroke="#35a824" stroke-width="5.5"/><circle cx="50" cy="50" r="33" stroke="#35a824" stroke-width="5"/>` +
      `<path d="${glyph}" stroke="#35a824" stroke-width="6"/><path d="${ticks}" stroke="#35a824" stroke-width="5"/>` +
      `<circle cx="50" cy="50" r="43" stroke="#c9ff92" stroke-width="2.4"/><circle cx="50" cy="50" r="33" stroke="#c9ff92" stroke-width="2.2"/>` +
      `<path d="${glyph}" stroke="#c9ff92" stroke-width="2.6"/><path d="${ticks}" stroke="#c9ff92" stroke-width="2.2"/></g></svg>`,
    { size: 256 },
  );
}
const SIGIL = sigil();

// ---------------------------------------------------------------------------------------------------------------
// Helpers
function interp(t: number, keys: number[][]) {
  if (t <= keys[0][0]) return keys[0].slice(1);
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const a = keys[i - 1];
      const b = keys[i];
      const u = (t - a[0]) / (b[0] - a[0]);
      const w = u * u * (3 - 2 * u);
      return a.slice(1).map((v, j) => v + (b[j + 1] - v) * w);
    }
  }
  return keys[keys.length - 1].slice(1);
}

function ringPts(center: THREE.Vector3, axis: THREE.Vector3, r: number, n: number, start = 0) {
  const a = axis.clone().normalize();
  const u = Math.abs(a.y) < 0.9 ? V(0, 1, 0).cross(a).normalize() : V(1, 0, 0).cross(a).normalize();
  const w = a.clone().cross(u);
  return Array.from({ length: n }, (_, i) => {
    const t = start + (i / n) * Math.PI * 2;
    return center.clone().addScaledVector(u, Math.cos(t) * r).addScaledVector(w, Math.sin(t) * r);
  });
}

const dome = (r: number, h: number): [number, number][] => [
  [0, 0],
  [r, 0],
  [r * 0.99, h * 0.22],
  [r * 0.82, h * 0.68],
  [r * 0.46, h * 0.95],
  [0, h],
];

export default function build() {
  const b = createBuilder({ name: "ancientTreant", paintSize: 2048 });
  const R = rng(2024);
  type J = Joint;
  type FrameList = FrameInput[];

  // ===== Skeleton: spine, neck, head ====================================================================
  const pelvis = b.joint("pelvis", { at: [0, 2.55, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.55, 0],
      [0, 3.25, 0.0],
      [0, 3.95, 0.1],
      [0, 4.5, 0.2],
    ]),
    { parent: pelvis, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 4.45, 0.2],
      [0, 4.8, 0.38],
      [0, 5.12, 0.52],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 5.12, 0.52], dir: [0, 0.12, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 5.0, 0.3], aim: [0, 4.95, 1.2], role: "jaw" });

  // ===== Torso =========================================================================================
  const prof = (t: number) =>
    interp(t, [
      [0, 0.74, 0.6],
      [0.3, 0.7, 0.56],
      [0.62, 0.98, 0.74],
      [0.88, 1.18, 0.82],
      [1, 0.95, 0.62],
    ]);
  const torso = b.sweep(spine, (t) => [prof(t)[0], prof(t)[1]] as [number, number], { sides: 10, color: BARK_TORSO, name: "torso" });
  b.part(new THREE.SphereGeometry(1, 10, 7), BARK_W, { at: [0, 2.55, 0], scale: [0.95, 0.58, 0.74], bone: pelvis, name: "pelvisBlock" });
  b.sweep(neck, [0.52, 0.45], { sides: 9, color: BARK_TORSO, name: "neckTube" });
  const skin = b.surface(torso);

  // ===== Head ==========================================================================================
  const K = 1.25;
  const hp = (x: number, y: number, z: number): [number, number, number] => [x * K, 5.0 + (y - 5.0) * K, 0.5 + (z - 0.5) * K];
  const hv = (x: number, y: number, z: number) => V(...hp(x, y, z));
  const sphereScale = (x: number, y: number, z: number): [number, number, number] => [x * K, y * K, z * K];
  const C = V(0, 5.55, 0.55);
  const SR = [0.74, 0.7, 0.68];
  const skullZ = (x: number, y: number) =>
    C.z + SR[2] * Math.sqrt(Math.max(0, 1 - (x / SR[0]) ** 2 - ((y - C.y) / SR[1]) ** 2));
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), BARK_SKULL, { at: hp(C.x, C.y, C.z), scale: sphereScale(SR[0], SR[1], SR[2]), bone: head, name: "skull" });
  const brow = b.sweep(
    catmull([-0.68, -0.36, -0.1, 0.1, 0.36, 0.68].map((x) => hp(x, 5.7 + 0.15 * Math.abs(x), skullZ(x, 5.74) + 0.07))),
    [0.1 * K, 0.16 * K, 0.18 * K, 0.18 * K, 0.16 * K, 0.1 * K],
    { bone: head, color: BARK_FACE, sides: 7, name: "brow" },
  );
  b.stick(new THREE.SphereGeometry(0.1 * K, 6, 4), BARK_HEAD, brow.at(0.5, 0), { embed: 0.4, name: "browKnot" });
  b.cards(
    [0.12, 0.3, 0.7, 0.88].map((t) => brow.at(t, 0)),
    TUFT,
    { size: [0.12, 0.17], lean: 35, vary: 0.25, rng: rng(15), cross: true, bone: head },
  );
  for (const sx of [1, -1]) {
    const ex = sx * 0.3;
    const ez = skullZ(ex, 5.5);
    b.part(new THREE.SphereGeometry(0.17 * K, 7, 5), DARK, { at: hp(ex, 5.5, ez), scale: [1.05, 0.95, 0.6], bone: head, name: "socket" });
    glow(b.part(new THREE.SphereGeometry(0.12 * K, 7, 5), AMBER, { at: hp(ex, 5.5, ez + 0.07), scale: [1.05, 0.85, 0.6], bone: head, name: "eye" }), 1.4);
    b.part(new THREE.SphereGeometry(0.06 * K, 6, 4), DARK, { at: hp(ex, 5.5, ez + 0.12), scale: [0.4, 1.35, 0.4], bone: head, name: "pupil" });
    b.part(new THREE.SphereGeometry(0.19 * K, 8, 5), BARK_FACE, { at: hp(ex, 5.61, ez + 0.03), scale: [1.12, 0.52, 0.75], bone: head, name: "eyelid" });
    b.part(new THREE.SphereGeometry(0.2 * K, 7, 5), BARK_HEAD, { at: hp(sx * 0.43, 5.2, skullZ(0.43, 5.2) - 0.03), scale: [1, 0.78, 0.8], bone: head, name: "cheek" });
    b.part(new THREE.SphereGeometry(0.055 * K, 6, 4), DARK, { at: hp(sx * 0.105, 5.08, 1.47), scale: [0.8, 0.7, 1], bone: head, name: "nostril" });
    // bracket-fungus ears
    const ear = hv(sx * 0.7, 5.5, 0.46);
    const ea = V(sx, 0.32, -0.12).normalize();
    const ead = ea.toArray() as [number, number, number];
    b.lathe(dome(0.3 * K, 0.22 * K), { at: ear, axis: ead, segments: 9, bone: head, color: FUNGUS, name: "earFungus" });
    b.lathe(dome(0.2 * K, 0.18 * K), { at: ear.clone().addScaledVector(ea, 0.2), axis: ead, segments: 8, bone: head, color: FUNGUS, name: "earFungus2" });
    b.part(new THREE.CylinderGeometry(0.28 * K, 0.25 * K, 0.04, 9), CREAM, { at: ear.clone().addScaledVector(ea, -0.01), dir: ead, bone: head, name: "earGills" });
  }
  // nose
  b.sweep(
    catmull([hp(0, 5.62, 1.12), hp(0, 5.36, 1.32), hp(0, 5.15, 1.34)]),
    [0.11 * K, 0.15 * K, 0.19 * K],
    { bone: head, color: BARK_FACE, sides: 7, name: "nose" },
  );
  b.part(new THREE.SphereGeometry(0.06 * K, 6, 4), BARK_HEAD, { at: hp(0.1, 5.38, 1.36), bone: head, name: "noseWart" });
  b.part(new THREE.SphereGeometry(0.045 * K, 6, 4), MS.m, { at: hp(-0.07, 5.5, 1.28), bone: head, name: "noseMoss" });
  // mouth: upper lip, cavity, jaw
  b.part(new THREE.SphereGeometry(1, 8, 6), DARK, { at: hp(0, 4.86, 0.92), scale: sphereScale(0.5, 0.22, 0.36), bone: head, name: "mouthCavity" });
  b.sweep(
    catmull([hp(-0.58, 5.0, 0.84), hp(-0.32, 4.96, 1.14), hp(0, 4.94, 1.24), hp(0.32, 4.96, 1.14), hp(0.58, 5.0, 0.84)]),
    [0.13 * K, 0.15 * K, 0.16 * K, 0.15 * K, 0.13 * K],
    { bone: head, color: BARK_FACE, sides: 7, name: "upperLip" },
  );
  b.sweep(
    catmull([
      hp(-0.54, 4.92, 0.34),
      hp(-0.5, 4.68, 0.78),
      hp(-0.28, 4.52, 1.1),
      hp(0, 4.48, 1.2),
      hp(0.28, 4.52, 1.1),
      hp(0.5, 4.68, 0.78),
      hp(0.54, 4.92, 0.34),
    ]),
    [0.12 * K, 0.17 * K, 0.2 * K, 0.22 * K, 0.2 * K, 0.17 * K, 0.12 * K],
    { bone: jaw, color: BARK_FACE, sides: 7, name: "lowerJaw" },
  );
  b.part(new THREE.SphereGeometry(0.2 * K, 7, 5), BARK_HEAD, { at: hp(0, 4.43, 1.2), scale: [1.2, 0.9, 1], bone: jaw, name: "chin" });
  for (const sx of [1, -1]) {
    // lower tusks and upper fangs: splintered wood teeth
    b.spike(hp(sx * 0.29, 4.6, 1.13), [sx * 0.02, 1, 0.14], 0.42 * K, 0.075 * K, { bone: jaw, color: CREAM, sides: 5, name: "tusk" });
    b.spike(hp(sx * 0.5, 4.68, 0.8), [0, 1, 0.1], 0.25 * K, 0.05 * K, { bone: jaw, color: CREAM, sides: 5, name: "tuskSmall" });
    b.spike(hp(sx * 0.17, 4.94, 1.2), [0, -1, 0.05], 0.13 * K, 0.035 * K, { bone: head, color: CREAM, sides: 5, name: "fang" });
    b.spike(hp(sx * 0.4, 4.97, 1.06), [0, -1, 0.05], 0.1 * K, 0.03 * K, { bone: head, color: CREAM, sides: 5, name: "fangSmall" });
  }
  // moss crown cap and tufts
  const cap = b.part(new THREE.SphereGeometry(1, 9, 6), MOSS_PAINT, { at: hp(0, 6.12, 0.46), scale: sphereScale(0.7, 0.28, 0.62), bone: head, name: "mossCap" });
  b.cards(
    b.surface(cap).scatter(16, { rng: rng(11), minDist: 0.16, filter: (h) => h.n.y > 0.2 }),
    TUFT,
    { size: [0.14, 0.2], lean: 25, vary: 0.3, rng: rng(12), cross: true },
  );
  // moss patches on the skull
  for (const [x, y, z, r] of [
    [-0.5, 5.9, 0.75, 0.1],
    [0.55, 5.75, 0.7, 0.12],
    [0.62, 5.4, 0.45, 0.1],
    [-0.6, 5.3, 0.4, 0.13],
  ]) {
    b.part(new THREE.SphereGeometry(r * K, 6, 4), MOSS_PAINT, { at: hp(x, y, z), scale: [1, 0.8, 1], bone: head, name: "headMoss" });
  }

  // ===== Beard of moss and roots ======================================================================
  const beardSweeps: Sweep[] = [];
  [
    { x: -0.5, len: 0.7, name: "beardR" },
    { x: -0.18, len: 0.95, name: "beardCR" },
    { x: 0.18, len: 0.95, name: "beardCL" },
    { x: 0.5, len: 0.7, name: "beardL" },
  ].forEach(({ x, len, name }) => {
    const y0 = hp(0, 4.55, 1.18)[1];
    const z0 = hp(0, 4.55, 1.18)[2];
    const pts = [
      [x * K, y0, z0 - 0.02],
      [x * K * 1.2, y0 - len * 0.35, z0 + 0.1],
      [x * K * 1.4, y0 - len * 0.7, z0 + 0.04],
      [x * K * 1.2, y0 - len, z0 + 0.1],
    ];
    const ch = b.chain(name, catmull(pts), { parent: jaw, names: [`${name}1`, `${name}2`, `${name}3`], role: "tentacle" });
    beardSweeps.push(b.sweep(ch, [0.085, 0.06, 0.03], { color: BARK_FINGER, sides: 6, caps: { end: "point" }, name }));
  });
  const beardFrames: FrameList = [];
  for (const sw of beardSweeps) for (let i = 0; i < 5; i++) beardFrames.push(sw.at(0.12 + i * 0.17, 90 + (i % 2) * 180));
  for (const x of [-0.6, -0.4, -0.2, 0.2, 0.4, 0.6, 0]) beardFrames.push(frame(hp(x, 4.52, 1.12 - Math.abs(x) * 0.5), [0, 1, 0], [0, 0, 1]));
  b.cards(beardFrames, MOSS_STRAND, { size: [0.2, 0.5], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: rng(21), cross: true, bone: jaw });

  // ===== Antlers ======================================================================================
  const foliageCrown: FrameList = [];
  const crownSweeps: Sweep[] = [];
  const antlerPath = (sx: number) => [
    [sx * 0.62, 6.8, 0.5],
    [sx * 0.98, 7.05, 0.4],
    [sx * 1.08, 7.45, 0.34],
    [sx * 0.86, 7.8, 0.42],
  ];
  for (const sx of [1, -1]) {
    const side = sx > 0 ? "L" : "R";
    const hit = b.surface(skull).around(skull.at).at(sx * 38, 62);
    if (!hit) throw new Error("antler root missed the skull");
    const a = b.sprout(`antler${side}`, hit, catmull([hit, ...antlerPath(sx)]), [0.2, 0.05], {
      count: 3,
      names: [`antler${side}1`, `antler${side}2`, `antler${side}3`],
      role: "tentacle",
      color: BARK_BRANCH,
      sides: 7,
      caps: { end: "point" },
      name: `antler${side}`,
    });
    crownSweeps.push(a.sweep);
    // side twigs
    for (const [t, deg, len, up] of [
      [0.35, 90, 0.55, 0.9],
      [0.55, -90, 0.5, 0.8],
      [0.7, 80, 0.45, 0.7],
    ] as number[][]) {
      const h = a.sweep.at(t, deg * sx);
      const dir = h.n.clone().multiplyScalar(0.8).add(V(0, up, 0)).normalize();
      const tip = h.at.clone().addScaledVector(dir, len);
      const tw = b.sprout(`antlerTwig${side}${Math.round(t * 100)}`, h, tip, [0.07, 0.02], { count: 0, color: BARK_TWIG, sides: 5, caps: { end: "point" } });
      crownSweeps.push(tw.sweep);
      foliageCrown.push(frame(tip, dir));
    }
    foliageCrown.push(frame(antlerPath(sx)[3], [sx * 0.2, 1, 0]));
  }
  for (const sw of crownSweeps) foliageCrown.push(...b.surface(sw).scatter(7, { rng: R, minDist: 0.22, filter: (h) => h.n.y > -0.2 }));
  b.cards(foliageCrown, [SPRIG_G, SPRIG_G, SPRIG_L, SPRIG_GOLD], {
    size: [0.42, 0.55],
    lean: 35,
    flow: [0, 1, 0.2],
    vary: 0.3,
    spin: 180,
    rng: rng(31),
    cross: true,
    bend: 15,
  });

  // ===== Arms and hands ===============================================================================
  const armTubes: Sweep[] = [];
  const handFingers: Sweep[] = [];
  const pauldronBones: J[] = [];
  for (const sx of [1, -1]) {
    const S = sx > 0 ? "L" : "R";
    const sh = V(sx * 1.35, 4.2, 0.05);
    const el = V(sx * 1.95, 3.05, 0.3);
    const wr = V(sx * 2.05, 2.1, 0.42);
    const arm = b.chain(`arm${S}`, polyline([sh, el, wr]), {
      parent: spine.joints[2],
      names: [`shoulder${S}`, `elbow${S}`, `hand${S}`],
      role: "arm",
    });
    pauldronBones.push(arm.joints[0]);
    const tube = b.sweep(arm, (t) => interp(t, [[0, 0.46], [0.5, 0.4], [0.95, 0.3], [1, 0.3]])[0], { sides: 9, color: BARK_ARM, name: `arm${S}` });
    armTubes.push(tube);
    // elbow burl & forearm bracer
    b.part(new THREE.SphereGeometry(0.4, 8, 6), BARK_W, { at: [sx * 2.0, 3.0, 0.3], scale: [1, 0.9, 1.1], bone: arm.joints[1], name: `elbowBurl${S}` });
    b.spike([sx * 2.32, 3.1, 0.2], [sx * 0.85, 0.35, -0.35], 0.5, 0.12, { bone: arm.joints[1], color: BARK_TWIG, sides: 5, name: `elbowSpike${S}` });
    b.spike([sx * 2.2, 3.4, 0.0], [sx * 0.5, 0.8, -0.45], 0.36, 0.08, { bone: arm.joints[1], color: BARK_TWIG, sides: 5, name: `elbowSpikeB${S}` });
    const handJ = arm.tip!;
    // palm
    b.part(new THREE.SphereGeometry(1, 9, 7), BARK_W, { at: [sx * 2.05, 1.76, 0.44], scale: [0.36, 0.44, 0.27], bone: handJ, name: `palm${S}` });
    b.part(new THREE.SphereGeometry(0.2, 7, 5), BARK_W, { at: [sx * 2.05, 1.56, 0.67], scale: [1.55, 0.8, 0.8], bone: handJ, name: `knuckles${S}` });
    // fingers (outer to inner) and thumb
    const splay = [18, 6, -6, -18];
    const flen = [0.95, 1.1, 1.05, 0.9];
    splay.forEach((deg, i) => {
      const xOff = sx * (0.24 - i * 0.16);
      const base = V(sx * 2.05 + xOff, 1.58, 0.52);
      const a = (deg * Math.PI) / 180;
      const d = V(Math.sin(a) * sx, -Math.cos(a), 0.1).normalize();
      const L = flen[i];
      const pts = [0, 0.33, 0.68, 1].map((u, k) =>
        base.clone().addScaledVector(d, L * u).add(V(0, 0, k * k * 0.035)),
      );
      const ch = b.chain(`finger${S}${i + 1}`, catmull(pts), {
        parent: handJ,
        names: [`finger${S}${i + 1}a`, `finger${S}${i + 1}b`, `finger${S}${i + 1}c`],
        role: "digit",
      });
      handFingers.push(
        b.sweep(ch, [0.115, 0.09, 0.065, 0.025], {
          sides: 6,
          caps: { end: "point" },
          bands: [[0.82, BARK_FINGER], [1, BK.hi]],
          name: `finger${S}${i + 1}`,
        }),
      );
      b.part(new THREE.SphereGeometry(0.1, 6, 4), BARK_FINGER, { at: base.clone().addScaledVector(d, L * 0.33), bone: ch.joints[1], name: `fingerKnuckle${S}${i + 1}` });
    });
    {
      const base = V(sx * 1.76, 1.95, 0.5);
      const d = V(-sx * 0.55, -0.55, 0.62).normalize();
      const pts = [0, 0.4, 0.75, 1].map((u) => base.clone().addScaledVector(d, 0.8 * u).add(V(0, 0, 0)));
      const ch = b.chain(`thumb${S}`, catmull(pts), {
        parent: handJ,
        names: [`thumb${S}a`, `thumb${S}b`, `thumb${S}c`],
        role: "digit",
      });
      handFingers.push(b.sweep(ch, [0.13, 0.1, 0.07, 0.03], { sides: 6, caps: { end: "point" }, bands: [[0.82, BARK_FINGER], [1, BK.hi]], name: `thumb${S}` }));
    }
  }

  // ===== Legs and feet ===============================================================================
  const legTubes: Sweep[] = [];
  for (const sx of [1, -1]) {
    const S = sx > 0 ? "L" : "R";
    const hip = V(sx * 0.72, 2.5, 0.0);
    const foot = V(sx * 0.98, 0.55, 0.0);
    const pts = limb(hip, foot, [1.05, 1.05], [[0, 0, 1]]);
    if (pts[pts.length - 1].distanceTo(foot) > 1e-3) throw new Error("leg too short");
    const leg = b.chain(`leg${S}`, pts, { parent: pelvis, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg", contact: [foot.x, 0, foot.z] });
    legTubes.push(b.sweep(leg, (t) => interp(t, [[0, 0.5], [0.45, 0.42], [0.8, 0.33], [1, 0.34]])[0], { sides: 9, color: BARK_LEG, name: `leg${S}` }));
    const ankle = leg.tip!;
    // knee burl
    b.part(new THREE.SphereGeometry(0.4, 8, 6), BARK_W, { at: [sx * 0.9, 1.45, 0.38], scale: [0.95, 1, 0.95], bone: leg.joints[1], name: `kneeBurl${S}` });
    b.lathe(dome(0.27, 0.14), { at: [sx * 0.88, 1.5, 0.68], axis: [0, 0.12, 1], segments: 9, bone: leg.joints[1], color: BRONZE, name: `kneeCap${S}` });
    b.part(new THREE.TorusGeometry(0.27, 0.04, 4, 9), BRONZE_L, { at: [sx * 0.88, 1.5, 0.7], dir: [0, 0.12, 1], axis: "z", bone: leg.joints[1], name: `kneeCapRim${S}` });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), BRONZE_L, { at: [sx * 0.88, 1.52, 0.82], bone: leg.joints[1], name: `kneeStud${S}` });
    const legSkin = b.surface(legTubes[legTubes.length - 1]);
    for (const y of [0.8, 0.97]) b.sweep(legSkin.loop([foot.x, y, foot.z], { dir: [0, 1, 0], lift: 0.02 }), 0.05, { color: BRONZE, sides: 6, name: `anklet${S}` });
    // ankle root-flare
    b.part(new THREE.SphereGeometry(0.46, 8, 6), BARK_W, { at: [sx * 0.98, 0.45, 0.02], scale: [1, 0.8, 1.05], bone: ankle, name: `ankleFlare${S}` });
    // toes: three front roots, two sides, one heel
    const toeDefs: [number, number, number][] = [
      [-30, 1.15, 0.2],
      [0, 1.3, 0.22],
      [30, 1.15, 0.2],
      [180, 0.75, 0.2],
    ];
    toeDefs.forEach(([deg, len, r], i) => {
      const a = (deg * Math.PI) / 180;
      const d = V(Math.sin(a) * sx, 0, Math.cos(a));
      const s0 = V(foot.x + d.x * 0.1, 0.32, foot.z + d.z * 0.1);
      const m = s0.clone().addScaledVector(d, len * 0.5);
      m.y = 0.2;
      const e = s0.clone().addScaledVector(d, len);
      e.y = r * 0.4 - 0.015;
      const ch = b.chain(`toe${S}${i + 1}`, catmull([s0, m, e]), { parent: ankle, names: [`toe${S}${i + 1}a`, `toe${S}${i + 1}b`], role: "digit" });
      b.sweep(ch, [r, r * 0.8, r * 0.4], { sides: 7, caps: { end: "round" }, bands: [[0.85, BARK_LEG], [1, BK.hi]], name: `toe${S}${i + 1}` });
    });
  }

  // ===== Kilt of bark plates, belt and buckle ==========================================================
  const studPts: Record<string, THREE.Vector3[]> = { pelvis: [], chest: [] };
  const plateOutline: OutlinePoint[] = [
    [-0.27, 0],
    [0.27, 0],
    [0.3, -0.2],
    [0.2, -0.55],
    [0, -0.78, "sharp"],
    [-0.2, -0.55],
    [-0.3, -0.2],
  ];

  const nPlates = 12;
  for (let i = 0; i < nPlates; i++) {
    const a = (i / nPlates) * Math.PI * 2 + Math.PI / nPlates;
    const out = V(Math.sin(a), 0, Math.cos(a));
    const tangent = V(Math.cos(a), 0, -Math.sin(a));
    const pos = V(out.x * 1.0, 2.95, out.z * 0.82);
    const len = 0.75 + R() * 0.25;
    b.extrude(
      plateOutline.map((o): OutlinePoint => (o.length === 3 ? [o[0], o[1] * len, "sharp"] : [o[0] * 0.95, o[1] * len])),
      {
        at: pos,
        x: tangent.toArray() as [number, number, number],
        y: out.clone().multiplyScalar(0.22).add(V(0, 1, 0)).normalize().toArray() as [number, number, number],
        thickness: 0.07,
        bevel: 0.02,
        smoothing: 1,
        color: i % 2 ? BARK_W : BARK_ARM,
        bone: pelvis,
        name: "kiltPlate",
      },
    );
    studPts.pelvis.push(pos.clone().addScaledVector(out, 0.05).add(V(0, -0.1, 0)));
    // hanging root tassel under each plate
  }
  const kiltFrames: FrameList = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    kiltFrames.push(frame([Math.sin(a) * 1.0, 3.0, Math.cos(a) * 0.82], [0, 1, 0], [0, 0, 1]));
  }
  b.cards(kiltFrames, MOSS_STRAND, { size: [0.17, 0.42], lean: 180, flow: [0, 0, 1], vary: 0.3, rng: rng(41), bone: pelvis });
  const belt = skin.loop([0, 2.95, 0], { lift: 0.07 });
  b.sweep(belt, 0.1, { color: VINE, sides: 6, name: "beltVine" });
  b.sweep(skin.loop([0, 3.08, 0], { lift: 0.05 }), 0.06, { color: BRONZE, sides: 6, name: "beltBronze" });
  const buckleHit = skin.ray([0, 2.98, 3], [0, 0, -1]);
  if (buckleHit) {
    const bp = buckleHit.at.clone().add(V(0, 0, 0.1));
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 10), STONE_PAINT, { at: bp, dir: [0, 0, 1], bone: spine.joints[0], name: "buckleStone" });
    b.part(new THREE.TorusGeometry(0.32, 0.05, 6, 14), BRONZE, { at: bp.clone().add(V(0, 0, 0.03)), dir: [0, 0, 1], axis: "z", bone: spine.joints[0], name: "buckleRing" });
    glow(b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", { at: bp.clone().add(V(0, 0, 0.056)), dir: [0, 0, 1], axis: "z", texture: SIGIL, bone: spine.joints[0], name: "buckleRune" }), 1.2);
  }

  // ===== Heart of the grove: a hollow in the chest with a glowing core ===============================
  const heartHit = skin.ray([0, 3.65, 3], [0, 0, -1]);
  if (!heartHit) throw new Error("chest ray missed");
  const hz = heartHit.at.z;
  const rough = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2;
    return V(Math.sin(a) * 0.48, 3.65 + Math.cos(a) * 0.62, hz + 0.3);
  });
  b.sweep(skin.drape(catmull(rough, { closed: true }), { lift: 0.05 }), 0.11, { color: BARK_W, sides: 6, name: "heartRim" });
  b.part(new THREE.SphereGeometry(1, 9, 7), DARK, { at: [0, 3.65, hz - 0.02], scale: [0.43, 0.56, 0.12], bone: spine.joints[2], name: "heartHollow" });
  glow(b.part(new THREE.IcosahedronGeometry(0.27, 1), "#4fdc32", { at: [0, 3.67, hz + 0.08], scale: [0.9, 1.25, 0.8], bone: spine.joints[2], flat: true, name: "heartGem" }), 1.2);
  glow(b.part(new THREE.IcosahedronGeometry(0.13, 0), "#e6ffb8", { at: [0, 3.69, hz + 0.2], scale: [0.9, 1.3, 0.9], bone: spine.joints[2], flat: true, name: "heartCore" }), 1.8);
  for (const sx of [1, -1]) {
    b.sweep(
      catmull([
        [sx * 0.38, 3.45, hz + 0.1],
        [sx * 0.25, 3.65, hz + 0.24],
        [sx * 0.34, 4.0, hz + 0.12],
      ]),
      0.04,
      { bone: spine.joints[2], color: BARK_FINGER, sides: 5, name: "heartRoot" },
    );
  }
  // runes carved into the belly and thighs
  for (const sx of [1, -1]) {
    const tube = legTubes[sx > 0 ? 0 : 1];
    const th = b.surface(tube).ray([sx * 0.85, 1.95, 3], [0, 0, -1]);
    if (th) glow(b.decal(tube, SIGIL, { at: th, dir: [0, 0, 1], size: [0.4, 0.4], segments: 8, name: "thighRune" }), 1.2);
  }

  // ===== Trapezius, pauldrons, bracers =================================================================
  const studsShoulder: THREE.Vector3[][] = [[], []];
  const foliageShoulder: FrameList = [];
  const shoulderSweeps: Sweep[] = [];
  [1, -1].forEach((sx, idx) => {
    const S = sx > 0 ? "L" : "R";
    const bone = pauldronBones[idx];
    b.sweep(
      catmull([
        [sx * 0.2, 4.75, 0.15],
        [sx * 0.8, 4.65, 0.08],
        [sx * 1.35, 4.35, 0.05],
      ]),
      [0.4, 0.48, 0.5],
      { bone, color: BARK_TORSO, sides: 8, name: `trapezius${S}` },
    );
    const a = V(sx * 0.85, 1, -0.1).normalize();
    const base = V(sx * 1.4, 4.15, 0.02);
    const defs: [number, number, number, number][] = [
      [1.08, 0.36, 0.0, 0],
      [0.82, 0.34, 0.3, 1],
      [0.56, 0.32, 0.56, 2],
    ];
    defs.forEach(([r, h, off, k]) => {
      const at = base.clone().addScaledVector(a, off);
      b.lathe(dome(r, h), { at, axis: a.toArray() as [number, number, number], segments: 10, bone, color: k === 1 ? BARK_PLATE_B : BARK_PLATE, name: `pauldron${S}${k}` });
      if (k === 0) b.part(new THREE.TorusGeometry(r, 0.07, 6, 20), BRONZE, { at: at.clone().addScaledVector(a, 0.03), dir: a.toArray() as [number, number, number], axis: "z", bone, name: `pauldronRim${S}${k}` });
      ringPts(at.clone().addScaledVector(a, 0.1), a, r * 0.86, 8 - k * 1, k * 0.4).forEach((p) => studsShoulder[idx].push(p));
    });
    // tall bark spikes ringing the top, with moss cap
    const topC = base.clone().addScaledVector(a, 0.86);
    ringPts(topC, a, 0.28, 5, 0.3).forEach((p) => {
      const dir = p.clone().sub(topC).normalize().multiplyScalar(0.55).addScaledVector(a, 1).normalize();
      b.spike(p, dir.toArray() as [number, number, number], 0.5, 0.075, { bone, color: BARK_TWIG, sides: 5, name: `pauldronSpike${S}` });
    });
    if (sx > 0) {
      b.part(new THREE.SphereGeometry(1, 8, 5), MOSS_PAINT, { at: base.clone().addScaledVector(a, 0.9), scale: [0.46, 0.2, 0.46], bone, name: "pauldronMossL" });
      const tw = b.sprout("shoulderTwigL", frame(base.clone().addScaledVector(a, 0.9), a.toArray() as [number, number, number]), catmull([
        base.clone().addScaledVector(a, 0.9),
        V(1.9, 5.6, 0.0),
        V(2.1, 6.2, -0.1),
        V(2.0, 6.7, 0.0),
      ]), [0.1, 0.025], { count: 0, color: BARK_TWIG, sides: 5, caps: { end: "point" } });
      shoulderSweeps.push(tw.sweep);
      foliageShoulder.push(frame([2.0, 6.7, 0.0], [0, 1, 0]));
    }
  });
  // bracers on forearms and upper arms
  const bracerFrames: THREE.Vector3[] = [];
  for (const [i, sw] of armTubes.entries()) {
    const chainName = i === 0 ? "L" : "R";
    void chainName;
    const as = b.surface(sw);
    for (const [y, r, thick] of [
      [2.35, 0.05, 0.05],
      [2.55, 0.05, 0.05],
      [2.75, 0.05, 0.05],
    ] as number[][]) {
      const loop = as.loop([sw.at(0.82, 0).at.x, y, sw.at(0.82, 0).at.z], { dir: [0, 1, 0], lift: 0.02 });
      b.sweep(loop, r, { color: BRONZE, sides: 6, name: "bracerRing" });
      void thick;
    }
    const gem = as.loop([sw.at(0.2, 0).at.x, 3.8, sw.at(0.2, 0).at.z], { dir: [0, 1, 0], lift: 0.03 });
    b.sweep(gem, 0.06, { color: BRONZE, sides: 6, name: "upperBracer" });
    bracerFrames.push(gem.at(0.25));
  }
  void bracerFrames;

  // belt pouch (left hip) and a bronze bell (right hip)
  {
    b.sweep(polyline([V(1.0, 3.0, 0.5), V(1.12, 2.7, 0.52)]), 0.025, { bone: pelvis, color: LEATHER_D, sides: 5, name: "pouchStrap" });
    b.part(new THREE.SphereGeometry(1, 9, 7), LEATHER, { at: [1.14, 2.55, 0.5], scale: [0.2, 0.26, 0.17], bone: pelvis, name: "pouch" });
    b.part(new THREE.SphereGeometry(1, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2), LEATHER_D, { at: [1.14, 2.66, 0.5], scale: [0.22, 0.17, 0.19], bone: pelvis, name: "pouchFlap" });
    b.part(new THREE.TorusGeometry(0.045, 0.014, 4, 6), BRONZE_L, { at: [1.14, 2.6, 0.68], dir: [0, 0, 1], axis: "z", bone: pelvis, name: "pouchClasp" });
    b.sweep(polyline([V(-1.05, 3.0, 0.42), V(-1.1, 2.7, 0.44)]), 0.015, { bone: pelvis, color: LEATHER_D, sides: 5, name: "bellCord" });
    b.lathe(
      [
        [0, 0],
        [0.17, 0],
        [0.15, 0.05],
        [0.11, 0.16],
        [0.08, 0.25],
        [0.035, 0.29],
        [0, 0.29],
      ],
      { at: [-1.1, 2.4, 0.44], axis: [0, 1, 0], segments: 8, bone: pelvis, color: BRONZE, name: "bell" },
    );
    b.part(new THREE.SphereGeometry(0.045, 6, 4), BRONZE_D, { at: [-1.1, 2.37, 0.44], bone: pelvis, name: "bellClapper" });
    b.part(new THREE.TorusGeometry(0.15, 0.018, 4, 8), BRONZE_L, { at: [-1.1, 2.42, 0.44], dir: [0, 1, 0], axis: "z", bone: pelvis, name: "bellRim" });
  }
  // studs (merged per bone)
  const studGeo = (pts: THREE.Vector3[], r: number) => mergeGeometries(pts.map((p) => new THREE.SphereGeometry(r, 5, 3).translate(p.x, p.y, p.z)));
  b.part(studGeo(studPts.pelvis, 0.035)!, BRONZE_L, { at: [0, 0, 0], bone: pelvis, name: "kiltStuds" });
  [0, 1].forEach((i) => b.part(studGeo(studsShoulder[i], 0.04)!, BRONZE_L, { at: [0, 0, 0], bone: pauldronBones[i], name: "pauldronStuds" }));

  // ===== Surface dressing: burls, stumps, knotholes, mushrooms, vines ==================================
  const rootSkin = b.surface([torso, ...legTubes, ...armTubes]);
  const burlHits = rootSkin.scatter(26, { rng: rng(51), minDist: 0.55, filter: (h) => h.at.y > 0.8 && Math.abs(h.n.y) < 0.8 && !(Math.abs(h.at.x) < 0.5 && h.at.z > 0.4 && h.at.y > 3 && h.at.y < 4.4) });
  burlHits.forEach((h, i) => {
    const r = 0.1 + R() * 0.12;
    if (i % 3 === 0) {
      // sawn-off branch stump with pale cut face
      b.stick(new THREE.CylinderGeometry(r * 0.75, r, 0.34, 7), BARK_W, h, { embed: 0.25, name: "stump" });
      b.stick(new THREE.CylinderGeometry(r * 0.8, r * 0.8, 0.03, 7), HEART, h.moved([0, 0.3, 0]), { embed: 0, name: "stumpCut" });
      b.stick(new THREE.CylinderGeometry(r * 0.4, r * 0.4, 0.035, 6), BK.hi, h.moved([0, 0.3, 0]), { embed: 0, name: "stumpRing" });
    } else if (i % 3 === 1) {
      b.stick(new THREE.SphereGeometry(r * 1.3, 7, 5), BARK_W, h, { embed: 0.55, name: "burl" });
    } else {
      const g = new THREE.TorusGeometry(r * 1.1, r * 0.4, 5, 8);
      g.rotateX(Math.PI / 2);
      b.stick(g, BARK_W, h, { embed: 0.2, name: "knotRim" });
      b.stick(new THREE.CylinderGeometry(r, r, 0.05, 8), DARK, h, { embed: 0.5, name: "knotHole" });
    }
  });

  // mushrooms: toadstool clusters and bracket shelves
  const shroomHits = b.surface([torso, ...legTubes, ...armTubes]).scatter(40, { rng: rng(61), minDist: 0.4, filter: (h) => h.n.y > 0.45 && h.at.y > 1.0 && h.at.y < 4.3 });
  shroomHits.slice(0, 9).forEach((h, i) => {
    const s = 0.8 + R() * 0.8;
    b.stick(new THREE.CylinderGeometry(0.035 * s, 0.05 * s, 0.2 * s, 6), CREAM, h, { embed: 0.2, name: "toadStalk" });
    b.stick(new THREE.SphereGeometry(0.12 * s, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), TOAD, h.moved([0, 0.18 * s, 0]), { embed: 0, scale: [1, 0.75, 1], name: "toadCap" });
    if (i % 2 === 0) {
      const h2 = h.moved([0.09, 0, 0.06]);
      b.stick(new THREE.CylinderGeometry(0.025 * s, 0.035 * s, 0.13 * s, 5), CREAM, h2, { embed: 0.2, name: "toadStalkS" });
      b.stick(new THREE.SphereGeometry(0.08 * s, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), TOAD, h2.moved([0, 0.12 * s, 0]), { embed: 0, scale: [1, 0.75, 1], name: "toadCapS" });
    }
  });
  const shelfHits = b.surface([torso, ...legTubes]).scatter(24, { rng: rng(71), minDist: 0.7, filter: (h) => Math.abs(h.n.y) < 0.4 && h.at.y > 0.9 && h.at.y < 4.1 && h.at.z < 0.2 });
  shelfHits.slice(0, 6).forEach((h) => {
    const s = 0.8 + R() * 0.6;
    b.stick(new THREE.SphereGeometry(0.2 * s, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), FUNGUS, h, { embed: 0.1, scale: [1, 0.6, 1], name: "bracket" });
    b.stick(new THREE.SphereGeometry(0.15 * s, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), FUNGUS, h.moved([0, 0.1 * s, 0]), { embed: 0.1, scale: [1, 0.6, 1], name: "bracket2" });
  });

  // moss clumps and tufts over the big shapes
  const mossFrames = b.surface([torso, ...legTubes, ...armTubes]).scatter(70, { rng: rng(81), minDist: 0.28, filter: (h) => h.n.y > 0.5 && h.at.y > 0.5 });
  b.cards(mossFrames, TUFT, { size: [0.17, 0.26], lean: 20, vary: 0.35, rng: rng(82), cross: true });
  const mossBlobs = mossFrames.slice(0, 18);
  mossBlobs.forEach((h) => b.stick(new THREE.SphereGeometry(0.13 + R() * 0.07, 6, 4), MOSS_PAINT, h, { embed: 0.5, scale: [1.3, 0.55, 1.3], name: "mossClump" }));

  // vine bandolier with leaves and flowers
  const vinePath = skin.drape(
    catmull([
      [1.0, 4.62, 0.25],
      [0.55, 4.45, 0.78],
      [0.0, 3.9, 0.95],
      [-0.45, 3.4, 0.78],
      [-0.9, 3.05, 0.4],
    ]),
    { lift: 0.06 },
  );
  const vine = b.sweep(vinePath, 0.07, { color: VINE, sides: 6, name: "vineBandolier" });
  const vineFrames = b.surface(vine).scatter(20, { rng: rng(91), minDist: 0.16 });
  b.cards(vineFrames, [LEAF, LEAF, FLOWER], { size: [0.2, 0.2], lean: 45, flow: [0, 0, 1], vary: 0.25, rng: rng(92), cross: true });
  const vine2 = b.sweep(
    skin.drape(
      catmull([
        [-1.0, 4.55, 0.1],
        [-0.6, 4.2, -0.7],
        [0.2, 3.7, -0.85],
        [0.8, 3.2, -0.6],
      ]),
      { lift: 0.06 },
    ),
    0.06,
    { color: VINE, sides: 6, name: "vineBack" },
  );
  b.cards(b.surface(vine2).scatter(14, { rng: rng(93), minDist: 0.2 }), [LEAF, LEAF, FLOWER], { size: [0.18, 0.18], lean: 45, flow: [0, 0, -1], vary: 0.25, rng: rng(94), cross: true });
  // glowing sap veins
  const veinPts = [
    [
      [-0.2, 3.0, 3],
      [0.1, 3.25, 3],
      [-0.1, 3.5, 3],
    ],
  ];
  void veinPts;
  for (const sx of [1, -1]) {
    const vein = skin.drape(
      catmull([
        [sx * 0.3, 4.9, 0.3],
        [sx * 0.62, 4.35, 0.78],
        [sx * 0.5, 4.15, 0.95],
        [sx * 0.72, 3.5, 0.62],
      ]),
      { lift: 0.025 },
    );
    glow(b.sweep(vein, 0.022, { color: SAP, sides: 4, name: "sapVein" }), 1.3);
  }
  for (const [i, sw] of armTubes.entries()) {
    const sx = i === 0 ? 1 : -1;
    const vein = b.surface(sw).drape(
      catmull([
        [sx * 1.95, 2.95, 0.7],
        [sx * 2.1, 2.55, 0.62],
        [sx * 1.98, 2.3, 0.78],
        [sx * 2.12, 2.0, 0.7],
      ]),
      { lift: 0.025 },
    );
    glow(b.sweep(vein, 0.02, { color: SAP, sides: 4, name: "armVein" }), 1.3);
  }

  // ===== Story details: a nest with eggs and a small bird =============================================
  {
    const sx = -1;
    const a = V(sx * 0.85, 1, -0.1).normalize();
    const base = V(sx * 1.4, 4.15, 0.02).addScaledVector(a, 0.9);
    const bone = pauldronBones[1];
    b.lathe(
      [
        [0, 0],
        [0.3, 0],
        [0.38, 0.05],
        [0.4, 0.14],
        [0.3, 0.1],
        [0, 0.06],
      ],
      { at: base, axis: [0, 1, 0], segments: 9, bone, color: STRAW, name: "nest" },
    );
    b.part(new THREE.TorusGeometry(0.36, 0.045, 5, 12), STRAW_D, { at: base.clone().add(V(0, 0.1, 0)), dir: [0, 1, 0], axis: "z", bone, name: "nestRim" });
    b.part(new THREE.TorusGeometry(0.3, 0.04, 5, 12), STRAW_D, { at: base.clone().add(V(0, 0.04, 0)), dir: [0, 1, 0], axis: "z", bone, name: "nestRim2" });
    [
      [-0.1, 0.08],
      [0.12, 0.05],
      [0.0, -0.13],
    ].forEach(([x, z]) => b.part(new THREE.SphereGeometry(0.075, 7, 5), EGG, { at: base.clone().add(V(x, 0.15, z)), scale: [0.85, 1.15, 0.85], bone, name: "egg" }));
  }
  {
    const base = V(1.4, 4.15, 0.02).addScaledVector(V(0.85, 1, -0.1).normalize(), 0.98).add(V(0.05, 0.06, 0.05));
    const bone = pauldronBones[0];
    const BIRD = "#e8503a";
    b.part(new THREE.SphereGeometry(0.1, 7, 5), BIRD, { at: base.clone().add(V(0, 0.1, 0)), scale: [0.9, 0.9, 1.2], bone, name: "birdBody" });
    b.part(new THREE.SphereGeometry(0.075, 7, 5), BIRD, { at: base.clone().add(V(0, 0.2, 0.12)), bone, name: "birdHead" });
    b.spike(base.clone().add(V(0, 0.2, 0.17)), [0, 0, 1], 0.07, 0.03, { bone, color: AMBER, sides: 4, name: "birdBeak" });
    b.spike(base.clone().add(V(0, 0.1, -0.1)), [0, 0.15, -1], 0.17, 0.045, { bone, color: "#8a2a1c", sides: 4, name: "birdTail" });
    b.part(new THREE.SphereGeometry(0.02, 5, 4), DARK, { at: base.clone().add(V(0.05, 0.22, 0.17)), bone, name: "birdEye" });
    b.part(new THREE.SphereGeometry(0.02, 5, 4), DARK, { at: base.clone().add(V(-0.05, 0.22, 0.17)), bone, name: "birdEye" });
  }
  // a glowing acorn lantern hanging from the right antler
  {
    const at = V(-0.95, 7.2, 0.32);
    const bone = b.joint("lanternHook", { parent: head, at: [-0.95, 7.0, 0.32], dir: [0, -1, 0], role: "hinge" });
    b.rod(V(-0.98, 7.32, 0.32), V(-0.95, 6.82, 0.32), 0.012, { bone, color: BRONZE_D, sides: 4, name: "lanternCord" });
    glow(b.part(new THREE.SphereGeometry(0.14, 8, 6), "#ffcf4a", { at: at.clone().add(V(0, -0.36, 0)), scale: [1, 1.15, 1], bone, name: "lanternAcorn" }), 1.5);
    b.part(new THREE.SphereGeometry(0.15, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), BRONZE, { at: at.clone().add(V(0, -0.33, 0)), scale: [1, 0.8, 1], bone, name: "lanternCap" });
    b.spike(at.clone().add(V(0, -0.52, 0)), [0, -1, 0], 0.08, 0.03, { bone, color: BRONZE, sides: 5, name: "lanternTip" });
  }

  // ===== Back branches and canopy =====================================================================
  const canopy: FrameList = [];
  const canopySweeps: Sweep[] = [];
  const defs: { id: string; sy: number; sx: number; pts: number[][]; r: number }[] = [
    { id: "A", sx: 1, sy: 4.35, pts: [[1.4, 5.1, -0.9], [2.0, 6.0, -1.0], [2.3, 6.9, -0.7], [2.1, 7.45, -0.4]], r: 0.3 },
    { id: "B", sx: 1, sy: 3.9, pts: [[1.0, 4.4, -1.2], [1.6, 5.0, -1.8], [1.8, 5.9, -2.1], [1.4, 6.6, -2.0]], r: 0.28 },
    { id: "C", sx: 1, sy: 4.55, pts: [[0.7, 5.5, -0.8], [0.9, 6.5, -1.0], [0.6, 7.3, -1.0]], r: 0.26 },
  ];
  const mirrored = defs.flatMap((d) => [d, { ...d, id: d.id, sx: -1, pts: d.pts.map(([x, y, z]) => [-x, y, z]) }]);
  for (const d of mirrored) {
    const side = d.sx > 0 ? "L" : "R";
    const sx = d.sx;
    const x0 = sx * 0.55;
    const rootHit = skin.ray([x0, d.sy, -3], [0, 0, 1]);
    if (!rootHit) throw new Error("back branch missed torso");
    const names = [`branch${d.id}${side}1`, `branch${d.id}${side}2`, `branch${d.id}${side}3`];
    const br = b.sprout(`branch${d.id}${side}`, rootHit, catmull([rootHit, ...d.pts]), [d.r, 0.05], {
      count: 3,
      names,
      role: "tentacle",
      color: BARK_BRANCH,
      sides: 8,
      caps: { end: "point" },
      name: `branch${d.id}${side}`,
    });
    canopySweeps.push(br.sweep);
    const twigDefs: number[][] = [
      [0.4, 90, 0.9],
      [0.55, -90, 0.85],
      [0.72, 70, 0.7],
      [0.85, -80, 0.6],
    ];
    twigDefs.forEach(([t, deg, len], k) => {
      const h = br.sweep.at(t, deg * sx);
      const dir = h.n.clone().multiplyScalar(0.8).add(V(0, 0.75, 0)).normalize();
      const tip = h.at.clone().addScaledVector(dir, len);
      const mid = h.at.clone().addScaledVector(dir, len * 0.5).add(V(0, 0.1, 0));
      const tw = b.sprout(`twig${d.id}${side}${k}`, h, catmull([h, mid, tip]), [0.11, 0.025], { count: 0, color: BARK_TWIG, sides: 5, caps: { end: "point" } });
      canopySweeps.push(tw.sweep);
      canopy.push(frame(tip, dir));
    });
    canopy.push(frame(d.pts[d.pts.length - 1], [0, 1, 0]));
  }
  for (const sw of canopySweeps) canopy.push(...b.surface(sw).scatter(12, { rng: R, minDist: 0.2, filter: (h) => h.n.y > -0.3 }));
  b.cards(canopy, [SPRIG_G, SPRIG_G, SPRIG_G, SPRIG_L, SPRIG_GOLD], {
    size: [0.55, 0.7],
    lean: 40,
    flow: [0, 1, 0.1],
    vary: 0.3,
    spin: 180,
    rng: rng(101),
    cross: true,
    bend: 15,
  });
  b.cards(foliageShoulder, [SPRIG_G, SPRIG_L], { size: [0.45, 0.55], lean: 20, flow: [0, 1, 0], rng: rng(111), cross: true });
  for (const sw of shoulderSweeps) b.cards(b.surface(sw).scatter(6, { rng: R, minDist: 0.2 }), [SPRIG_G, SPRIG_L], { size: [0.4, 0.5], lean: 40, flow: [0, 1, 0], vary: 0.3, rng: rng(112), cross: true });

  // ===== Hand roots and finger-tip leaves =============================================================
  const fingerLeaf: FrameList = [];
  for (const f of handFingers) fingerLeaf.push(f.at(0.95, 90));
  b.cards(fingerLeaf, LEAF, { size: [0.18, 0.2], lean: 30, flow: [0, 0, 1], rng: rng(121), cross: true });
  for (const f of handFingers) b.cards([f.at(0.5, 0), f.at(0.2, 0)], TUFT, { size: [0.14, 0.2], lean: 40, flow: [0, 1, 0], rng: rng(122), cross: true });

  // back: dorsal thorns, carved sigil and shelf fungi
  [0.22, 0.32, 0.43, 0.54, 0.65, 0.76, 0.86].forEach((t, i) => {
    const h = torso.at(t, 0);
    b.stick(new THREE.ConeGeometry(0.1 - i * 0.004, 0.42 - Math.abs(i - 3) * 0.04, 6), BARK_TWIG, h, { embed: 0.2, name: "dorsalThorn" });
  });
  const backHit = skin.ray([0, 3.55, -3], [0, 0, 1]);
  if (backHit) {
    glow(b.decal(torso, SIGIL, { at: backHit, dir: [0, 0, -1], size: [0.85, 0.85], segments: 10, name: "backRune" }), 1.3);
  }
  for (const [x, y] of [
    [-0.55, 3.0],
    [0.6, 3.2],
    [-0.45, 3.9],
  ]) {
    const h = skin.ray([x, y, -3], [0, 0, 1]);
    if (!h) continue;
    b.stick(new THREE.SphereGeometry(0.24, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), FUNGUS, h, { embed: 0.1, scale: [1, 0.55, 1], name: "backBracket" });
    b.stick(new THREE.SphereGeometry(0.17, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), FUNGUS, h.moved([0, 0.1, 0]), { embed: 0.1, scale: [1, 0.55, 1], name: "backBracket2" });
  }
  return b.root;
}
