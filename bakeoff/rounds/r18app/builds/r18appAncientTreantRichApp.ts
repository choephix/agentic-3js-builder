// Ancient treant: a walking tree guardian, Blizzard/Warcraft style. Chunky heroic proportions, hand-painted bark with
// painted highlight/shadow and moss, bronze worn trims with rivets, glowing amber runes and eyes.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { cells, mix, mottle, noise, paint, smoothstep, spots } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ancient Treant",
  description:
    "A towering walking tree guardian: gnarled bark body with mossy shoulders, bronze bracers, a stuck rusty axe, glowing amber runes and eyes, an antler crown of leafy branches with a bird's nest.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (painted, purple-leaning shadows, warm highlights)
const BARK_SHADOW = "#2b1a20";
const BARK_DARK = "#4b3229";
const BARK_MID = "#7b5639";
const BARK_LIGHT = "#a97d4b";
const WARM_HI = "#dcab62";
const CRACK = "#1b1015";
const MOSS_DARK = "#2f5d2c";
const MOSS = "#5f9a37";
const MOSS_LIGHT = "#a4d04b";
const DIRT = "#4a3a2c";
const BRONZE_HI = "#e8b755";
const BRONZE_DARK = "#6b4219";
const PALE_WOOD = "#e3c58f";
const WOOD_HANDLE = "#8a6038";
const AMBER = "#ffb21e";
const AMBER_HOT = "#fff0a8";
const IRON = "#6e7782";
const IRON_LIGHT = "#a9b3bd";
const RUST = "#8d4a28";
const VINE = "#46792f";
const VINE_DARK = "#2e5528";
const MOUTH = "#1a0b0d";
const CAP_RED = "#d0372f";
const CAP_BLUE = "#44c3e8";
const CREAM = "#f4e8c8";
const EGG = "#8fdde6";
const NEST = "#6a4a2b";
const JAY = "#3b7fd6";
const JAY_DARK = "#24508f";

const Q = new THREE.Vector3();

/** Hand-painted bark: vertical streaks, plate cracks, warm top light, violet underside shade, moss on top faces. */
function bark(seed: number, mossy: number, lift = 0) {
  return paint((p, n) => {
    Q.set(p.x * 2.2, p.y * 0.6, p.z * 2.2);
    const streak = noise(Q, 0.2, seed);
    const c = cells(Q, 0.22, seed + 3);
    const edge = smoothstep(0.03, 0.13, c.d2 - c.d1);
    let col = mix(BARK_DARK, BARK_MID, smoothstep(0.25, 0.75, streak));
    col = mix(col, BARK_LIGHT, smoothstep(0.45, 1, c.id * 0.5 + streak * 0.5) * 0.6 + lift);
    col = mix(col, WARM_HI, smoothstep(0.3, 1, n.y) * 0.32);
    col = mix(col, BARK_SHADOW, smoothstep(0, -0.9, n.y) * 0.5);
    col = mix(CRACK, col, 0.12 + 0.88 * edge);
    const m = noise(p, 0.55, seed + 9) + 0.4 * n.y + mossy;
    const amt = smoothstep(0.95, 1.06, m);
    if (amt > 0) {
      let moss = mix(MOSS_DARK, MOSS_LIGHT, smoothstep(0.25, 0.8, noise(p, 0.07, seed + 12)));
      moss = mix(moss, MOSS, 0.25);
      col = mix(col, moss, amt);
    }
    return mix(col, DIRT, smoothstep(0.5, 0.05, p.y) * 0.6);
  });
}

const BODY = bark(1, 0.22);
const HEADP = bark(5, 0.08, 0.1);
const ROOTP = bark(2, 0.3);
const BRONZEP = mottle("#9a6a2c", BRONZE_HI, { size: 0.05, contrast: 1.4, seed: 4 });
const IRONP = mottle(mottle(IRON, IRON_LIGHT, { size: 0.05, seed: 2 }), RUST, { size: 0.09, seed: 3, contrast: 0.9 });
const MOSSP = mottle(MOSS_DARK, MOSS_LIGHT, { size: 0.08, seed: 6, contrast: 1.2 });

// ---------------------------------------------------------------------------------------------------------------
// Drawings
function leafSvg(dark: string, mid: string, light: string, outline: string, vein: string) {
  return svg(
    `<svg viewBox="0 0 48 72"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="${dark}"/><stop offset="0.55" stop-color="${mid}"/><stop offset="1" stop-color="${light}"/>
    </linearGradient></defs>
    <path d="M24 70 C8 56 2 38 10 25 C7 15 16 11 20 5 C22 2 26 2 28 5 C32 11 41 15 38 25 C46 38 40 56 24 70 Z" fill="url(#g)" stroke="${outline}" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M24 66 L24 9" stroke="${vein}" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M24 54 L12 43 M24 54 L36 43 M24 40 L13 29 M24 40 L35 29 M24 27 L17 19 M24 27 L31 19" stroke="${vein}" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
  </svg>`,
    { size: 192 },
  );
}
const LEAF_GREEN = leafSvg("#2b6a2b", "#56ad3b", "#a8dc4a", "#1c4521", "#d4f28c");
const LEAF_TEAL = leafSvg("#1f6a55", "#3fa86a", "#8fdc7a", "#164a3c", "#c8f5a0");
const LEAF_GOLD = leafSvg("#c2561f", "#ecaa2d", "#ffe27a", "#7a3515", "#fff3b0");

const TUFT = svg(
  `<svg viewBox="0 0 40 40">
    <path d="M4 40 C4 26 6 14 3 4 C10 12 13 26 14 40 Z" fill="#3c7a2e" stroke="#244d22" stroke-width="1.2"/>
    <path d="M12 40 C12 24 15 10 14 0 C21 10 22 26 22 40 Z" fill="#78b83e" stroke="#2c5c25" stroke-width="1.2"/>
    <path d="M20 40 C22 28 26 16 32 6 C32 18 30 30 30 40 Z" fill="#5fa036" stroke="#2c5c25" stroke-width="1.2"/>
    <path d="M28 40 C30 32 34 24 39 18 C37 28 36 34 36 40 Z" fill="#a4d04b" stroke="#2c5c25" stroke-width="1.2"/>
  </svg>`,
  { size: 128 },
);

const FLOWER = svg(
  `<svg viewBox="0 0 32 32">
    <g fill="#fff6e2" stroke="#c9a3a0" stroke-width="1">
      <circle cx="16" cy="7" r="5.5"/><circle cx="25" cy="14" r="5.5"/><circle cx="21.5" cy="24.5" r="5.5"/>
      <circle cx="10.5" cy="24.5" r="5.5"/><circle cx="7" cy="14" r="5.5"/>
    </g>
    <circle cx="16" cy="16" r="5" fill="#ffb21e" stroke="#c4741a" stroke-width="1"/>
  </svg>`,
  { size: 96 },
);

const RUNE = svg(
  `<svg viewBox="0 0 100 100">
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g stroke="#2a1408" stroke-width="8">
        <circle cx="50" cy="50" r="44"/><circle cx="50" cy="50" r="35"/>
        <path d="M50 20 L50 80 M50 38 L36 26 M50 38 L64 26 M50 52 L33 38 M50 52 L67 38 M50 66 L38 78 M50 66 L62 78"/>
        <path d="M50 80 L50 92 M12 50 L20 50 M80 50 L88 50 M50 8 L50 14"/>
      </g>
      <g stroke="${AMBER}" stroke-width="4.2">
        <circle cx="50" cy="50" r="44"/><circle cx="50" cy="50" r="35"/>
        <path d="M50 20 L50 80 M50 38 L36 26 M50 38 L64 26 M50 52 L33 38 M50 52 L67 38 M50 66 L38 78 M50 66 L62 78"/>
        <path d="M50 80 L50 92 M12 50 L20 50 M80 50 L88 50 M50 8 L50 14"/>
      </g>
      <g stroke="${AMBER_HOT}" stroke-width="1.4">
        <circle cx="50" cy="50" r="44"/><circle cx="50" cy="50" r="35"/>
        <path d="M50 20 L50 80 M50 38 L36 26 M50 38 L64 26 M50 52 L33 38 M50 52 L67 38"/>
      </g>
    </g>
  </svg>`,
  { size: 512 },
);

const BUCKLE_RUNE = svg(
  `<svg viewBox="0 0 64 64"><g fill="none" stroke-linecap="round">
    <circle cx="32" cy="32" r="26" stroke="${BRONZE_DARK}" stroke-width="5"/>
    <path d="M32 14 L32 50 M32 26 L22 18 M32 26 L42 18 M32 38 L22 30 M32 38 L42 30" stroke="${BRONZE_DARK}" stroke-width="5"/>
    <circle cx="32" cy="32" r="26" stroke="${BRONZE_HI}" stroke-width="1.8"/>
    <path d="M32 14 L32 50 M32 26 L22 18 M32 26 L42 18 M32 38 L22 30 M32 38 L42 30" stroke="${BRONZE_HI}" stroke-width="1.8"/>
  </g></svg>`,
  { size: 192 },
);

const RINGS = svg(
  `<svg viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="31" fill="#5a3d2a"/>
    <circle cx="32" cy="32" r="28" fill="#dcbc84"/>
    <g fill="none" stroke="#a8773f" stroke-width="1.6">
      <circle cx="32" cy="32" r="23"/><circle cx="33" cy="31" r="18"/><circle cx="32" cy="32" r="13"/><circle cx="31" cy="32" r="8"/><circle cx="32" cy="32" r="3"/>
    </g>
    <path d="M32 32 L58 20" stroke="#8d5f30" stroke-width="1.4"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
type Vec = [number, number, number];

/** Linear lookup in evenly-keyed profile values. */
function key(a: number[], t: number) {
  const f = Math.min(Math.max(t, 0), 1) * (a.length - 1);
  const i = Math.min(Math.floor(f), a.length - 2);
  return a[i] + (a[i + 1] - a[i]) * (f - i);
}

export default function build() {
  const b = createBuilder({ name: "ancientTreant", paintSize: 2048 });
  const R = rng(1971);
  const sphere = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton
  const hips = b.joint("hips", { at: [0, 1.9, -0.08] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.9, -0.08],
      [0, 2.5, -0.04],
      [0, 3.1, 0.06],
      [0, 3.62, 0.22],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const chest = spine.tip!;
  const neck = b.chain(
    "neck",
    catmull([
      [0, 3.62, 0.22],
      [0, 3.8, 0.33],
      [0, 3.95, 0.46],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const HC: Vec = [0, 4.08, 0.56];
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 3.95, 0.46], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 3.86, 0.52], aim: [0, 3.78, 1.0], role: "jaw" });

  // -------------------------------------------------------------------------------------------------------------
  // Torso
  const TX = [0.6, 0.55, 0.62, 0.86, 0.92, 0.42];
  const TY = [0.46, 0.43, 0.48, 0.57, 0.5, 0.34];
  const torso = b.sweep(spine, (t) => [key(TX, t), key(TY, t)], { color: BODY, sides: 10 });
  const torsoSkin = b.surface(torso);

  // Neck
  b.sweep(neck, [0.32, 0.3], { color: HEADP, sides: 8 });

  // -------------------------------------------------------------------------------------------------------------
  // Head
  const skull = b.part(sphere(1, 14, 10), HEADP, { bone: head, at: HC, scale: [0.5, 0.44, 0.47], name: "skull" });
  const skin = b.surface(skull);

  for (const s of [1, -1]) {
    // brow ridge, angled down toward the nose
    b.capsule([s * 0.5, 4.2, 0.72], [s * 0.06, 4.11, 0.99], [0.11, 0.1], { bone: head, color: HEADP });
    // brow moss tuft
    b.capsule([s * 0.46, 4.27, 0.68], [s * 0.12, 4.2, 0.97], [0.04, 0.03], { bone: head, color: MOSSP });
    // cheek burls
    const cheek = skin.nearest([s * 0.5, 3.93, 1.1]);
    b.stick(sphere(0.15, 8, 6), HEADP, cheek, { embed: 0.45 });
    // eye socket + glowing eye
    const sock = skin.nearest([s * 0.22, 4.06, 1.3]);
    b.stick(sphere(0.115, 8, 6), BARK_SHADOW, sock, { embed: 0.55 });
    const eyeHit = skin.nearest([s * 0.22, 4.05, 1.3]);
    glow(b.stick(sphere(0.078, 8, 6), AMBER, eyeHit, { embed: 0.55 }), 1.6);
    b.stick(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 6), CRACK, eyeHit.moved([0, 0.05, 0]), { embed: 0.2 });
    // shelf-fungus ear
    const ear = skin.nearest([s * 1.0, 4.0, 0.5]);
    b.stick(new THREE.CylinderGeometry(0.16, 0.12, 0.05, 9), "#e0903a", ear, { embed: 0.2, flow: [0, 0, 1] });
    b.stick(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 8), "#f4c26a", ear.moved([0, 0.03, 0.04]), { embed: 0.2 });
  }
  // nose: a snapped branch stub
  const noseHit = skin.nearest([0, 3.97, 1.4]);
  b.stick(new THREE.ConeGeometry(0.15, 0.34, 7), HEADP, noseHit, { embed: 0.25 });
  b.stick(sphere(0.075, 6, 4), PALE_WOOD, noseHit.moved([0, 0.3, 0]), { embed: 0.2 });
  for (const s of [1, -1]) b.stick(sphere(0.03, 5, 4), CRACK, noseHit.moved([s * 0.07, 0.12, 0.08]), { embed: 0.3 });
  // forehead glyph slashes
  for (const s of [1, -1]) {
    const f1 = skin.nearest([s * 0.12, 4.32, 1.0]);
    glow(b.stick(new THREE.BoxGeometry(0.03, 0.12, 0.014), AMBER, f1, { embed: 0.4, spin: s * 25 }), 1.3);
    const f2 = skin.nearest([s * 0.26, 4.3, 0.94]);
    glow(b.stick(new THREE.BoxGeometry(0.025, 0.09, 0.014), AMBER, f2, { embed: 0.4, spin: s * 35 }), 1.3);
  }
  // mouth cavity and lip line
  b.part(new THREE.BoxGeometry(0.56, 0.12, 0.34), MOUTH, { bone: head, at: [0, 3.79, 0.88] });
  b.sweep(
    skin.drape(
      catmull([
        [0.36, 3.84, 0.95],
        [0.2, 3.79, 1.12],
        [0, 3.77, 1.14],
        [-0.2, 3.79, 1.12],
        [-0.36, 3.84, 0.95],
      ]),
      { lift: 0.006 },
    ),
    0.012,
    { color: CRACK },
  );
  // upper fang rim
  for (const s of [1, -1]) {
    for (const [x, z] of [
      [0.1, 1.1],
      [0.22, 1.02],
    ]) {
      b.part(new THREE.ConeGeometry(0.028, 0.09, 5), CREAM, {
        bone: head,
        at: [s * x, 3.76, z],
        dir: [0, -1, 0.1],
      });
    }
  }

  // Lower jaw
  const jawBox = b.frustumBox([0, 3.78, 0.6], [0, 3.7, 1.02], [0.82, 0.24], [0.5, 0.22], { bone: jaw, color: HEADP });
  const jawSkin = b.surface(jawBox);
  for (const s of [1, -1]) {
    // big upward tusks (splintered wood)
    const tusk = jawSkin.nearest([s * 0.18, 3.9, 1.0]);
    b.stick(new THREE.ConeGeometry(0.06, 0.26, 6), PALE_WOOD, tusk, { embed: 0.15 });
    for (const x of [0.07, 0.3]) {
      const tooth = jawSkin.nearest([s * x, 3.88, 1.0]);
      b.stick(new THREE.ConeGeometry(0.028, 0.08, 5), CREAM, tooth, { embed: 0.2 });
    }
  }
  b.stick(sphere(0.12, 7, 5), HEADP, jawSkin.nearest([0, 3.7, 1.25]), { embed: 0.3 });
  // chin tendril beard
  for (let i = 0; i < 9; i++) {
    const x = (i - 4) * 0.075;
    const len = 0.62 - Math.abs(i - 4) * 0.06 + R() * 0.08;
    const a = [x, 3.66, 0.9 + (R() - 0.5) * 0.1] as Vec;
    const c = [x * 1.4, 3.5, 1.02] as Vec;
    const e = [x * 1.8, 3.66 - len, 1.0 + R() * 0.1] as Vec;
    b.sweep(bezier(a, c, e), [0.045, 0.006], { bone: jaw, color: ROOTP, caps: { end: "point" }, sides: 5 });
  }
  b.sweep(
    bezier([0.16, 3.66, 0.8], [0.3, 3.52, 0.86], [0.34, 3.2, 0.82]),
    [0.05, 0.006],
    { bone: jaw, color: ROOTP, caps: { end: "point" }, sides: 5 },
  );
  b.sweep(
    bezier([-0.16, 3.66, 0.8], [-0.3, 3.52, 0.86], [-0.34, 3.2, 0.82]),
    [0.05, 0.006],
    { bone: jaw, color: ROOTP, caps: { end: "point" }, sides: 5 },
  );

  // Moss hair on the crown of the skull
  {
    const hits = skin.scatter(26, { rng: rng(31), minDist: 0.09, filter: (h) => h.n.y > 0.2 });
    b.cards(hits, TUFT, { size: [0.1, 0.12], lean: 20, vary: 0.3, rng: rng(32), cross: true, bone: head, sink: 0.2 });
  }

  // Antler crown: sprouts from the skull, each a three-joint branch with leaves and twigs
  const leafSets = [LEAF_GREEN, LEAF_GREEN, LEAF_TEAL, LEAF_GOLD];
  const crown: { az: number; el: number; up: number; out: number; len: number }[] = [
    { az: 50, el: 55, up: 1.25, out: 0.55, len: 1 },
    { az: -50, el: 55, up: 1.3, out: 0.55, len: 1 },
    { az: 100, el: 40, up: 0.95, out: 0.85, len: 1 },
    { az: -100, el: 40, up: 0.9, out: 0.85, len: 1 },
    { az: 150, el: 50, up: 1.0, out: 0.5, len: 1 },
    { az: -150, el: 50, up: 1.1, out: 0.5, len: 1 },
    { az: 20, el: 68, up: 1.1, out: 0.2, len: 1 },
    { az: -22, el: 70, up: 0.95, out: 0.2, len: 1 },
  ];
  crown.forEach((c, i) => {
    const hit = skin.around(HC).at(c.az, c.el)!;
    const p0 = hit.at.clone();
    const o = new THREE.Vector3(hit.n.x, 0, hit.n.z).normalize();
    const p1 = p0.clone().addScaledVector(o, 0.2 * c.out + 0.1).add(new THREE.Vector3(0, 0.3, 0));
    const p2 = p1.clone().addScaledVector(o, 0.35 * c.out + 0.12).add(new THREE.Vector3(0, c.up * 0.42, 0));
    const p3 = p2.clone().addScaledVector(o, 0.3 * c.out + 0.08).add(new THREE.Vector3(0, c.up * 0.45, 0.03 * (i % 3) - 0.04));
    const br = b.sprout(`crown${i}`, hit, catmull([p0, p1, p2, p3]), [0.1, 0.02], {
      count: 3,
      color: ROOTP,
      sides: 6,
      role: "tentacle",
      caps: { end: "point" },
    });
    // side twigs
    b.along(br.sweep, 3, (at) => b.spike(at, at, 0.28, 0.026, { color: ROOTP, sides: 5 }));
    const lf = b.surface(br.sweep).scatter(26, { rng: R, minDist: 0.07 });
    b.cards(lf, leafSets[i % leafSets.length], {
      size: [0.2, 0.28],
      lean: 55,
      bend: 25,
      vary: 0.35,
      spin: 180,
      rng: R,
      sink: 0.05,
      flow: (_f, k) => [Math.cos(k * 2.4), -0.15, Math.sin(k * 2.4)],
    });
    // tip cluster
    const tipDir = p3.clone().sub(p2).normalize();
    const cl = b.ring(frame(p3, tipDir), { count: 5, radius: 0.04, tilt: 55 }).items;
    b.cards(cl, leafSets[(i + 1) % leafSets.length], { size: [0.22, 0.32], lean: 35, bend: 20, vary: 0.2, spin: 10, rng: R, bone: br.chain!.joints[2] });
  });

  // Bird's nest on the crown of the skull
  {
    const NC: Vec = [0, 4.5, 0.38];
    b.lathe(
      [
        [0, 0],
        [0.12, 0],
        [0.2, 0.05],
        [0.22, 0.1],
        [0.18, 0.1],
        [0.14, 0.04],
        [0, 0.03],
      ],
      { at: NC, bone: head, color: NEST, segments: 9 },
    );
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const p = [NC[0] + Math.cos(a) * 0.2, NC[1] + 0.08, NC[2] + Math.sin(a) * 0.2] as Vec;
      const q = [NC[0] + Math.cos(a + 0.9) * 0.22, NC[1] + 0.1 + R() * 0.03, NC[2] + Math.sin(a + 0.9) * 0.22] as Vec;
      b.rod(p, q, 0.013, { bone: head, color: i % 2 ? BARK_LIGHT : BARK_MID, sides: 4 });
    }
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5;
      b.part(sphere(1, 7, 5), EGG, {
        bone: head,
        at: [NC[0] + Math.cos(a) * 0.07, NC[1] + 0.09, NC[2] + Math.sin(a) * 0.07],
        scale: [0.04, 0.052, 0.04],
      });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Arms
  const armTubes: Record<string, ReturnType<typeof b.sweep>> = {};
  const shoulderBurls: Record<string, ReturnType<typeof b.part>> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh: Vec = [s * 1.0, 3.3, 0.05];
    const wrist: Vec = [s * 1.62, 1.5, 0.3];
    const pts = limb(sh, wrist, [1.05, 1.05], [0, 0, -1]);
    const arm = b.chain(`arm${side}`, pts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const wr = arm.tip!;
    const tube = b.sweep(arm, (t) => key([0.34, 0.34, 0.3, 0.4, 0.28], t), { color: BODY, sides: 9 });
    armTubes[side] = tube;
    const armSkin = b.surface(tube);

    // shoulder pauldron burl
    const burl = b.part(sphere(1, 12, 8), BODY, {
      bone: arm.joints[0],
      at: [s * 1.02, 3.45, 0.03],
      scale: [0.52, 0.44, 0.5],
      name: `burl${side}`,
    });
    shoulderBurls[side] = burl;
    const burlSkin = b.surface(burl);
    b.part(sphere(1, 9, 6), BODY, { bone: arm.joints[0], at: [s * 1.12, 3.1, 0.1], scale: [0.4, 0.38, 0.4] });
    // moss and leaf tufts across the shoulder
    {
      const hits = burlSkin.scatter(26, { rng: rng(40 + s), minDist: 0.1, filter: (h) => h.n.y > 0.25 });
      b.cards(hits, TUFT, { size: [0.12, 0.16], lean: 10, vary: 0.3, rng: R, cross: true, sink: 0.2 });
      const fl = burlSkin.scatter(5, { rng: rng(44 + s), minDist: 0.2, filter: (h) => h.n.y > 0.4 });
      b.cards(fl, FLOWER, { size: 0.08, lean: 8, vary: 0.3, rng: R, sink: 0.1, cross: true });
    }

    // shoulder branch with leaves
    const sbHit = burlSkin.nearest([s * 1.3, 4.1, -0.2]);
    const base = sbHit.at;
    const sb = b.sprout(
      `shoulderBranch${side}`,
      sbHit,
      catmull([
        base,
        [base.x + s * 0.25, base.y + 0.35, base.z - 0.05],
        [base.x + s * 0.5, base.y + 0.85, base.z - 0.15],
        [base.x + s * 0.55, base.y + 1.35, base.z - 0.25],
      ]),
      [0.1, 0.018],
      { count: 3, color: ROOTP, sides: 6, role: "tentacle", caps: { end: "point" } },
    );
    b.along(sb.sweep, 4, (at) => b.spike(at, at, 0.3, 0.026, { color: ROOTP, sides: 5 }));
    {
      const lf = b.surface(sb.sweep).scatter(36, { rng: R, minDist: 0.07 });
      b.cards(lf, [LEAF_GREEN, LEAF_TEAL, LEAF_GOLD], {
        size: [0.22, 0.3],
        lean: 55,
        bend: 25,
        vary: 0.35,
        spin: 180,
        rng: R,
        sink: 0.05,
        flow: (_f, k) => [Math.cos(k * 2.4), -0.15, Math.sin(k * 2.4)],
      });
    }

    // elbow burl + forearm bulk plates
    b.part(sphere(1, 9, 6), BODY, {
      bone: arm.joints[1],
      at: [s * 1.5, 2.3, -0.2],
      scale: [0.24, 0.3, 0.24],
    });
    {
      const hits = armSkin.scatter(30, { rng: rng(50 + s), minDist: 0.2, filter: (h) => h.n.y > -0.3 });
      for (const h of hits) b.stick(new THREE.BoxGeometry(0.2, 0.045, 0.26), BODY, h, { embed: 0.4, flow: [0, -1, 0] });
    }

    // bronze bracer: three ribs and rivets on the forearm
    const studPts: THREE.Vector3[] = [];
    for (const t of [0.66, 0.73, 0.8]) {
      const loop = armSkin.loop(arm.at(t), { lift: 0.012 });
      b.sweep(loop, 0.04, { color: BRONZEP, sides: 6 });
      if (t === 0.73) b.along(loop, 12, (at) => studPts.push(at.at.clone()));
    }
    b.part(
      mergeGeometries(studPts.map((p) => sphere(0.026, 6, 4).translate(p.x, p.y, p.z)))!,
      BRONZE_HI,
      { bone: arm.joints[1], at: [0, 0, 0] },
    );

    // hand: palm, knuckles, claw-like root fingers
    b.part(sphere(1, 10, 7), BODY, {
      bone: wr,
      at: [s * 1.64, 1.2, 0.34],
      scale: [0.33, 0.3, 0.24],
      name: `palm${side}`,
    });
    const fingerLen = [0.8, 1.0, 0.95, 0.72];
    for (let i = 0; i < 4; i++) {
      const d = (i - 1.5) * 0.15; // spread across the hand
      const dx = s * d;
      const L = fingerLen[i];
      const knuckle: Vec = [s * 1.64 + dx, 1.04, 0.4];
      const mid: Vec = [s * 1.64 + dx * 1.35, 0.78 - (L - 1) * 0.1, 0.48];
      const tip: Vec = [s * 1.64 + dx * 1.7, 0.78 - 0.5 * L, 0.46 + 0.15 * L];
      const fch = b.chain(`finger${side}${i}`, catmull([knuckle, mid, tip]), {
        parent: wr,
        names: [`finger${side}${i}a`, `finger${side}${i}b`],
        role: "digit",
      });
      b.sweep(fch, [0.085, 0.032], { color: BODY, sides: 6, caps: { end: "point" } });
      b.part(sphere(0.095, 7, 5), BODY, { bone: fch.joints[0], at: knuckle });
      b.spike(tip, [0, -0.5, 0.5], 0.14, 0.03, { color: PALE_WOOD, sides: 5, bone: fch.joints[1] });
    }
    // thumb, inner side, thick and forward
    {
      const knuckle: Vec = [s * 1.4, 1.2, 0.5];
      const mid: Vec = [s * 1.33, 1.0, 0.7];
      const tip: Vec = [s * 1.3, 0.78, 0.82];
      const th = b.chain(`thumb${side}`, catmull([knuckle, mid, tip]), {
        parent: wr,
        names: [`thumb${side}a`, `thumb${side}b`],
        role: "digit",
      });
      b.sweep(th, [0.1, 0.034], { color: BODY, sides: 6, caps: { end: "point" } });
      b.spike(tip, [0, -0.5, 0.5], 0.14, 0.035, { color: PALE_WOOD, sides: 5, bone: th.joints[1] });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Legs
  const legTubes: Record<string, ReturnType<typeof b.sweep>> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip: Vec = [s * 0.42, 1.9, -0.05];
    const ank: Vec = [s * 0.55, 0.3, 0.12];
    const pts = limb(hip, ank, [0.95, 0.8], [0, 0, 1]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    const ankle = leg.tip!;
    const tube = b.sweep(leg, (t) => key([0.42, 0.38, 0.32, 0.34, 0.27], t), { color: BODY, sides: 10 });
    legTubes[side] = tube;
    const legSkin = b.surface(tube);

    // knee burl, bark plates
    b.part(sphere(1, 9, 6), BODY, {
      bone: leg.joints[1],
      at: [s * 0.5, pts[1].y + 0.02, pts[1].z + 0.28],
      scale: [0.3, 0.3, 0.26],
    });
    {
      const hits = legSkin.scatter(34, { rng: rng(60 + s), minDist: 0.18, filter: (h) => h.n.y > -0.4 });
      for (const h of hits) b.stick(new THREE.BoxGeometry(0.2, 0.045, 0.28), BODY, h, { embed: 0.4, flow: [0, -1, 0] });
    }
    // bronze shin band and rivets
    const studPts: THREE.Vector3[] = [];
    for (const t of [0.66, 0.73, 0.8]) {
      const loop = legSkin.loop(leg.at(t), { lift: 0.012 });
      b.sweep(loop, 0.04, { color: BRONZEP, sides: 6 });
      if (t === 0.73) b.along(loop, 12, (at) => studPts.push(at.at.clone()));
    }
    b.part(
      mergeGeometries(studPts.map((p) => sphere(0.026, 6, 4).translate(p.x, p.y, p.z)))!,
      BRONZE_HI,
      { bone: leg.joints[1], at: [0, 0, 0] },
    );

    // foot: wide root mass, four toes, heel root
    b.part(sphere(1, 10, 7), ROOTP, { bone: ankle, at: [s * 0.55, 0.23, 0.18], scale: [0.36, 0.22, 0.5], name: `foot${side}` });
    const toeD = [-0.27, -0.09, 0.09, 0.27];
    toeD.forEach((d, i) => {
      const x = 0.55 + 0.0;
      const base: Vec = [s * (x + d * 0.8), 0.2, 0.28];
      const mid: Vec = [s * (x + d * 1.5), 0.15, 0.65];
      const tip: Vec = [s * (x + d * 2.0), 0.085, 0.98 - Math.abs(d) * 0.35];
      const toe = b.chain(`toe${side}${i}`, catmull([base, mid, tip]), {
        parent: ankle,
        names: [`toe${side}${i}a`, `toe${side}${i}b`],
        role: "digit",
      });
      b.sweep(toe, [0.12, 0.05], { color: ROOTP, sides: 6, caps: { end: "point" } });
      b.spike(tip, [s * d, -0.15, 1], 0.12, 0.04, { color: PALE_WOOD, sides: 5, bone: toe.joints[1] });
    });
    // heel root (to the back)
    b.sweep(
      catmull([
        [s * 0.55, 0.28, -0.05],
        [s * 0.58, 0.16, -0.3],
        [s * 0.62, 0.06, -0.55],
      ]),
      [0.13, 0.04],
      { bone: ankle, color: ROOTP, sides: 6, caps: { end: "point" } },
    );
    // ground roots snaking out from the foot
    for (let k = 0; k < 4; k++) {
      const ang = (k / 4) * 1.9 - 0.25 + (s > 0 ? 0.3 : 0.1);
      const dir = new THREE.Vector3(s * Math.cos(ang), 0, -Math.sin(ang) * 0.9 + 0.1).normalize();
      const origin = new THREE.Vector3(s * 0.55, 0, 0.15);
      const radii = [0.1, 0.075, 0.05, 0.03, 0.012];
      const wob = (R() - 0.5) * 0.4;
      const pts2: Vec[] = radii.map((r, j) => {
        const d = 0.38 + j * 0.3;
        const side2 = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(Math.sin(j * 1.3 + k) * 0.12 + wob * j * 0.1);
        const p = origin.clone().addScaledVector(dir, d).add(side2);
        return [p.x, r * 0.95, p.z] as Vec;
      });
      b.sweep(catmull(pts2), radii, { bone: ankle, color: ROOTP, sides: 6, caps: { end: "point" } });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Torso detail: vertical bark ridges, plates, pecs, belt, runes, veins, stump scars
  // pecs and belly burls
  for (const s of [1, -1]) {
    b.part(sphere(1, 10, 7), BODY, { bone: spine.joints[2], at: [s * 0.4, 3.22, 0.5], scale: [0.4, 0.34, 0.3] });
  }
  // ridges
  for (let i = 0; i < 14; i++) {
    const th = (i / 14) * Math.PI * 2 + R() * 0.2;
    const pts: Vec[] = [];
    const y0 = 2.0 + R() * 0.3;
    for (let k = 0; k < 6; k++) {
      const y = y0 + (k / 5) * (1.45 - R() * 0.1);
      const tt = Math.min((y - 1.9) / 1.72, 1);
      const w = th + Math.sin(k * 1.4 + i) * 0.14;
      pts.push([Math.sin(w) * key(TX, tt) * 1.1, y, 0.06 * tt * 3 + Math.cos(w) * key(TY, tt) * 1.1]);
    }
    const ridge = torsoSkin.drape(catmull(pts), { lift: 0.0 });
    b.sweep(ridge, [0.05, 0.045, 0.035], { color: BODY, sides: 5 });
  }
  {
    const hits = torsoSkin.scatter(44, { rng: rng(71), minDist: 0.22, filter: (h) => h.n.y > -0.3 });
    for (const h of hits) b.stick(new THREE.BoxGeometry(0.22, 0.045, 0.3), BODY, h, { embed: 0.4, flow: [0, -1, 0] });
    const mo = torsoSkin.scatter(14, { rng: rng(72), minDist: 0.2, filter: (h) => h.n.y > 0.1 });
    b.cards(mo, TUFT, { size: [0.11, 0.14], lean: 10, vary: 0.3, rng: R, cross: true, sink: 0.2 });
  }
  // belt of braided vine + bronze buckle
  {
    const belt = torsoSkin.loop(spine.joints[1], { lift: 0.04 });
    b.sweep(belt, 0.07, { color: VINE_DARK, sides: 6 });
    const belt2 = torsoSkin.loop(spine.joints[1], { lift: 0.09 });
    b.sweep(belt2, 0.03, { color: VINE, sides: 5 });
    const front = torsoSkin.ray([0, 2.55, 2], [0, 0, -1])!;
    b.stick(new THREE.CylinderGeometry(0.18, 0.2, 0.06, 10), BRONZEP, front.moved([0, 0.04, 0]), { embed: 0.2 });
    const plate = b.part(new THREE.CircleGeometry(0.145, 10), "#ffffff", {
      at: [0, 2.55, front.at.z + 0.1],
      dir: [0, 0, 1],
      axis: "z",
      texture: BUCKLE_RUNE,
    });
    void plate;
    b.part(sphere(0.035, 6, 4), BRONZE_HI, { bone: spine.joints[1], at: [0.22, 2.55, front.at.z + 0.04] });
    b.part(sphere(0.035, 6, 4), BRONZE_HI, { bone: spine.joints[1], at: [-0.22, 2.55, front.at.z + 0.04] });
    // hanging root tassels from the belt
    for (let i = 0; i < 11; i++) {
      const a = (i / 11) * Math.PI * 2;
      const rx = Math.sin(a) * 0.62;
      const rz = -0.04 + Math.cos(a) * 0.55;
      const p0: Vec = [rx, 2.5, rz];
      const p1: Vec = [rx * 1.12, 2.2, rz * 1.15];
      const p2: Vec = [rx * 1.15, 1.82 - R() * 0.15, rz * 1.18];
      b.sweep(bezier(p0, p1, p2), [0.04, 0.008], { bone: hips, color: ROOTP, caps: { end: "point" }, sides: 5 });
    }
  }
  // chest rune (glowing) and sap veins
  {
    const rune = b.decal(torso, RUNE, { at: [0, 3.2, 1], dir: [0, 0, 1], size: [0.55, 0.55], lift: 0.012 });
    glow(rune, 1.6);
    const veins: Vec[][] = [
      [[0, 2.95, 0.6], [0.1, 2.75, 0.55], [0.18, 2.62, 0.5]],
      [[0.28, 3.28, 0.58], [0.5, 3.4, 0.55], [0.72, 3.45, 0.42]],
      [[-0.28, 3.28, 0.58], [-0.5, 3.4, 0.55], [-0.72, 3.45, 0.42]],
      [[0, 3.5, 0.55], [0.06, 3.65, 0.5], [0.12, 3.8, 0.42]],
      [[-0.2, 2.98, 0.6], [-0.42, 2.82, 0.55], [-0.6, 2.7, 0.45]],
    ];
    for (const v of veins) glow(b.sweep(torsoSkin.drape(catmull(v), { lift: 0.014 }), 0.012, { color: AMBER, sides: 4 }), 1.3);
  }
  // pale stump scars with tree rings
  const stumps: { at: Vec; r: number }[] = [
    { at: [0.7, 2.55, 0.35], r: 0.1 },
    { at: [-0.62, 2.9, 0.4], r: 0.09 },
    { at: [0.0, 2.25, -0.55], r: 0.11 },
  ];
  for (const st of stumps) {
    const hit = torsoSkin.nearest([st.at[0] * 1.6, st.at[1], st.at[2] + (st.at[2] < 0 ? -1 : 1)]);
    const h = 0.3;
    b.stick(new THREE.CylinderGeometry(st.r * 0.85, st.r, h, 8), BODY, hit, { embed: 0.3 });
    const tip = hit.at.clone().addScaledVector(hit.n, h * 0.7 + 0.004);
    b.part(new THREE.CircleGeometry(st.r * 0.88, 10), "#ffffff", { at: tip, dir: hit.n, axis: "z", texture: RINGS });
  }

  // back: leafy canopy branches and a hollow
  {
    for (const s of [1, -1]) {
      const bh = torsoSkin.nearest([s * 0.5, 3.4, -1.2]);
      const p0 = bh.at;
      const br = b.sprout(
        `backBranch${s > 0 ? "L" : "R"}`,
        bh,
        catmull([
          p0,
          [p0.x + s * 0.15, p0.y + 0.3, p0.z - 0.3],
          [p0.x + s * 0.35, p0.y + 0.85, p0.z - 0.5],
          [p0.x + s * 0.3, p0.y + 1.45, p0.z - 0.4],
        ]),
        [0.11, 0.02],
        { count: 3, color: ROOTP, sides: 6, role: "tentacle", caps: { end: "point" } },
      );
      b.along(br.sweep, 4, (at) => b.spike(at, at, 0.3, 0.026, { color: ROOTP, sides: 5 }));
      const lf = b.surface(br.sweep).scatter(40, { rng: R, minDist: 0.07 });
      b.cards(lf, [LEAF_GREEN, LEAF_GREEN, LEAF_TEAL, LEAF_GOLD], {
        size: [0.22, 0.3],
        lean: 55,
        bend: 25,
        vary: 0.35,
        spin: 180,
        rng: R,
        sink: 0.05,
        flow: (_f, k) => [Math.cos(k * 2.4), -0.15, Math.sin(k * 2.4)],
      });
    }
    const hollow = torsoSkin.nearest([0, 2.95, -1.5]);
    b.stick(new THREE.CylinderGeometry(0.2, 0.22, 0.05, 9), MOUTH, hollow, { embed: 0.3 });
    b.stick(new THREE.TorusGeometry(0.22, 0.05, 5, 10), BODY, hollow.moved([0, 0.02, 0]), { embed: 0.2 });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Left shoulder: rusted axe stuck in the burl
  {
    const hit = b.surface(shoulderBurls.L).nearest([1.7, 3.75, -0.1]);
    const C = hit.n.clone().multiplyScalar(-1);
    C.y = 0;
    C.normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const D = up.clone().addScaledVector(C, -up.dot(C)).normalize();
    const nrm = C.clone().negate();
    const at0 = hit.at.clone().addScaledVector(nrm, 0.12);
    b.extrude(
      [
        [0, -0.08],
        [-0.01, 0.1],
        [0.1, 0.12],
        [0.28, 0.2, "sharp"],
        [0.34, 0.02, "sharp"],
        [0.26, -0.18, "sharp"],
        [0.1, -0.12],
      ],
      { at: at0, x: C, y: D, thickness: [0.05, 0.02], bevel: 0.006, color: IRONP, bone: "shoulderL" },
    );
    // sharpened edge strip
    b.extrude(
      [
        [0.28, 0.2, "sharp"],
        [0.34, 0.02, "sharp"],
        [0.26, -0.18, "sharp"],
        [0.23, -0.14],
        [0.28, 0.02],
        [0.24, 0.15],
      ],
      { at: at0.clone().addScaledVector(C, 0.0), x: C, y: D, thickness: 0.012, color: IRON_LIGHT, bone: "shoulderL" },
    );
    // eye/socket of axe head and handle
    const hBase = at0.clone().addScaledVector(C, 0.04).addScaledVector(D, -0.1);
    const hTip = hBase.clone().addScaledVector(D, 0.95).addScaledVector(nrm, 0.12);
    b.rod(hBase, hTip, 0.028, { color: WOOD_HANDLE, bone: "shoulderL", sides: 6, caps: "flat" });
    for (const t of [0.18, 0.3, 0.42]) {
      const p = hBase.clone().lerp(hTip, t);
      b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.02, 6), "#5a3a22", {
        bone: "shoulderL",
        at: p,
        dir: hTip.clone().sub(hBase),
      });
    }
    b.part(sphere(0.04, 6, 4), WOOD_HANDLE, { bone: "shoulderL", at: hTip });
    // vine wrapping the handle
    const wrap: THREE.Vector3[] = [];
    const ax = hTip.clone().sub(hBase).normalize();
    const u = new THREE.Vector3().crossVectors(ax, new THREE.Vector3(0, 0, 1)).normalize();
    const w = new THREE.Vector3().crossVectors(ax, u).normalize();
    for (let k = 0; k <= 16; k++) {
      const t = 0.12 + (k / 16) * 0.8;
      const ang = k * 1.1;
      wrap.push(
        hBase
          .clone()
          .lerp(hTip, t)
          .addScaledVector(u, Math.cos(ang) * 0.04)
          .addScaledVector(w, Math.sin(ang) * 0.04),
      );
    }
    const vine = b.sweep(catmull(wrap), 0.012, { color: VINE, bone: "shoulderL", sides: 4 });
    const vh = b.surface(vine).scatter(8, { rng: R, minDist: 0.06 });
    b.cards(vh, LEAF_GREEN, { size: [0.08, 0.11], lean: 60, vary: 0.2, spin: 180, rng: R, sink: 0.05, bone: "shoulderL" });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Right shoulder: a jay perched on the burl
  {
    const hit = b.surface(shoulderBurls.R).nearest([-1.0, 4.4, 0.18]);
    const o = hit.at;
    const B = "shoulderR";
    b.part(sphere(1, 8, 6), JAY, { bone: B, at: [o.x, o.y + 0.06, o.z], scale: [0.07, 0.07, 0.1], name: "jayBody" });
    b.part(sphere(1, 7, 5), CREAM, { bone: B, at: [o.x, o.y + 0.04, o.z + 0.02], scale: [0.056, 0.05, 0.08] });
    b.part(sphere(0.055, 7, 5), JAY, { bone: B, at: [o.x, o.y + 0.14, o.z + 0.09] });
    b.part(new THREE.ConeGeometry(0.02, 0.06, 5), "#f0b43a", { bone: B, at: [o.x, o.y + 0.13, o.z + 0.16], dir: [0, 0, 1] });
    b.part(new THREE.ConeGeometry(0.028, 0.06, 4), JAY_DARK, { bone: B, at: [o.x, o.y + 0.18, o.z + 0.06], dir: [0, 1, -0.4] });
    for (const s of [1, -1]) {
      b.part(sphere(0.011, 4, 3), CRACK, { bone: B, at: [o.x + s * 0.04, o.y + 0.15, o.z + 0.12] });
      b.part(sphere(1, 6, 4), JAY_DARK, { bone: B, at: [o.x + s * 0.065, o.y + 0.07, o.z - 0.01], scale: [0.015, 0.05, 0.085] });
    }
    b.rod([o.x, o.y + 0.07, o.z - 0.08], [o.x, o.y + 0.04, o.z - 0.22], [0.025, 0.015], { color: JAY_DARK, bone: B, sides: 4, caps: "flat" });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Mushrooms (red, blue glowing) and vines
  const mush = (bone: string, at: Vec, h: number, r: number, cap: string, glows: boolean, tilt: Vec = [0, 1, 0]) => {
    b.part(new THREE.CylinderGeometry(r * 0.28, r * 0.36, h, 6), CREAM, { bone, at, dir: tilt, scale: [1, 1, 1] });
    const top: Vec = [at[0] + tilt[0] * h * 0.5, at[1] + tilt[1] * h * 0.5, at[2] + tilt[2] * h * 0.5];
    const g = new THREE.SphereGeometry(r, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2);
    const capPart = b.part(g, glows ? cap : spots(cap, CREAM, { size: r * 0.9, amount: 0.5, seed: 3 }), {
      bone,
      at: top,
      dir: tilt,
      scale: [1, 0.7, 1],
    });
    if (glows) glow(capPart, 1.2);
  };
  mush("shoulderR", [-1.4, 3.82, 0.1], 0.13, 0.1, CAP_RED, false);
  mush("shoulderR", [-1.25, 3.88, -0.25], 0.09, 0.07, CAP_RED, false, [-0.2, 1, 0.1]);
  mush("shoulderR", [-1.55, 3.64, 0.2], 0.1, 0.06, CAP_RED, false, [-0.5, 1, 0.1]);
  mush("shoulderL", [1.35, 3.88, 0.3], 0.1, 0.08, CAP_RED, false, [0.2, 1, 0.1]);
  mush("shoulderL", [1.55, 3.72, 0.1], 0.07, 0.05, CAP_RED, false, [0.5, 1, 0]);
  mush("ankleL", [0.9, 0.2, 0.1], 0.1, 0.09, CAP_BLUE, true, [0.5, 1, 0]);
  mush("ankleL", [0.95, 0.14, -0.05], 0.06, 0.06, CAP_BLUE, true, [0.7, 1, 0]);
  mush("ankleR", [-0.9, 0.2, 0.0], 0.12, 0.1, CAP_BLUE, true, [-0.5, 1, 0.1]);
  mush("ankleR", [-0.82, 0.13, 0.25], 0.07, 0.06, CAP_BLUE, true, [-0.4, 1, 0.1]);
  mush("spine2", [-0.45, 2.45, -0.65], 0.12, 0.1, CAP_RED, false, [-0.4, 0.5, -1]);
  mush("spine2", [-0.35, 2.3, -0.7], 0.07, 0.06, CAP_RED, false, [-0.3, 0.5, -1]);
  mush("spine2", [0.5, 2.6, -0.62], 0.1, 0.08, CAP_BLUE, true, [0.4, 0.5, -1]);

  // vine spiralling around the right forearm
  {
    const arm = armTubes.R;
    const chainPts: THREE.Vector3[] = [];
    for (let k = 0; k <= 18; k++) {
      const t = 0.5 + (k / 18) * 0.32;
      const pt = arm.at(t, 0);
      const ang = k * 0.95;
      const basis1 = pt.tangent.clone().cross(new THREE.Vector3(0, 0, 1)).normalize();
      const basis2 = pt.tangent.clone().cross(basis1).normalize();
      const rad = pt.radius + 0.02;
      chainPts.push(
        pt.at
          .clone()
          .addScaledVector(pt.n, -pt.radius)
          .addScaledVector(basis1, Math.cos(ang) * rad)
          .addScaledVector(basis2, Math.sin(ang) * rad),
      );
    }
    const vine = b.sweep(catmull(chainPts), 0.022, { color: VINE, bone: arm.bone, sides: 5 });
    const vh = b.surface(vine).scatter(14, { rng: R, minDist: 0.06 });
    b.cards(vh, [LEAF_GREEN, LEAF_TEAL], { size: [0.1, 0.14], lean: 60, bend: 15, vary: 0.25, spin: 180, rng: R, sink: 0.05, bone: arm.bone });
  }
  // hanging vines from shoulders with leaves
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const a: Vec = [s * (1.1 + i * 0.18), 3.55 - i * 0.1, 0.4 - i * 0.2];
      const c: Vec = [s * (1.3 + i * 0.2), 3.1 - i * 0.1, 0.55 - i * 0.2];
      const e: Vec = [s * (1.35 + i * 0.2), 2.5 - i * 0.2 - R() * 0.2, 0.55 - i * 0.2];
      const vine = b.sweep(bezier(a, c, e), [0.025, 0.008], { bone: s > 0 ? "shoulderL" : "shoulderR", color: VINE, sides: 4, caps: { end: "point" } });
      const vh = b.surface(vine).scatter(7, { rng: R, minDist: 0.08 });
      b.cards(vh, [LEAF_GREEN, LEAF_TEAL], { size: [0.1, 0.14], lean: 60, bend: 15, vary: 0.25, spin: 180, rng: R, sink: 0.05, bone: s > 0 ? "shoulderL" : "shoulderR" });
    }
  }
  // flowers and tufts by the feet
  for (const s of [1, -1]) {
    const pts = [
      frame([s * 0.8, 0.02, 0.5], [0, 1, 0]),
      frame([s * 0.95, 0.02, 0.2], [0, 1, 0]),
      frame([s * 0.7, 0.02, 0.9], [0, 1, 0]),
      frame([s * 0.35, 0.02, 1.0], [0, 1, 0]),
      frame([s * 0.4, 0.02, -0.6], [0, 1, 0]),
    ];
    b.cards(pts, TUFT, { size: [0.2, 0.22], lean: 10, vary: 0.3, rng: R, cross: true, bone: s > 0 ? "ankleL" : "ankleR" });
    b.cards(pts.slice(1, 4), FLOWER, { size: 0.09, lean: 8, vary: 0.25, rng: R, cross: true, bone: s > 0 ? "ankleL" : "ankleR" });
  }

  return b.root;
}
