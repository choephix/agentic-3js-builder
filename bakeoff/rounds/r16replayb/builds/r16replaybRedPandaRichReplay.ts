// Red panda balancing on a mossy stone: Genshin Impact style (cel-shaded, gold filigree, tassels, dendro glow).
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull, polyline } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { cells, mottle, noise, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A bright cel-shaded red panda in a wide balancing stance on a moss-capped boulder, tail raised in an S, wearing a teal ribbon collar with a gold dendro medallion, tassels and a gold tail ring; glowing dendro runes, mushrooms and drifting leaves.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (cel paints: lit tone + hue-shifted hard shadow) and flat colours

const WHITE_FUR = "#fff8ea";
const RUST_A = "#f4742f";
const RUST_B = "#e25a22";
const RUST_C = "#c24a1e";
const DARK_FUR = "#4b2a30";
const BLACK_FUR = "#2a1824";
const TEAR = "#8a3220";
const CLAW = "#f6e8cf";

const DARK = cel(DARK_FUR, "#2c1a2e");
const BLACKISH = cel(BLACK_FUR, "#180e1e");
const CREAM = cel(WHITE_FUR, "#ecd0d8");
const GOLD = cel("#ffd56e", "#d98a2a");
const TEAL = cel("#33c9b0", "#2379a0");
const NOSE = cel("#2b1630", INK);
const MAROON = cel("#7a1f3a", "#4a1030");
const PINK = cel("#ff8aa0", "#d0507a");
const GOLD_FLAT = "#ffd56e";
const GEM = "#8cff63";
const MOTE = "#c4ff7a";

const MOSS_PAT = mottle("#93d853", "#62bb46", { size: 0.07, seed: 11 });
const STONE_PAT = mottle("#a7aec6", "#8f98b6", { size: 0.13, seed: 4 });
const GRASS_PAT = mottle("#7fd05a", "#58b248", { size: 0.14, seed: 7 });
const RUST_PAT = mottle(RUST_A, RUST_B, { size: 0.08, seed: 2 });

// ---------------------------------------------------------------------------------------------------------------
// Textures (svg)

const TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 48">
  <path d="M12 0 C15 16 21 32 19 48 L5 48 C3 32 9 16 12 0Z" fill="#ffffff"/>
  <path d="M4 14 C6 24 8 36 8 48 L1 48 C1 36 2 24 4 14Z" fill="#f2f2f2"/>
  <path d="M20 16 C22 26 23 38 23 48 L16 48 C16 36 18 26 20 16Z" fill="#f2f2f2"/>
  <path d="M12 8 C13 22 13 34 12 48" stroke="#dcdcdc" stroke-width="1.6" fill="none"/></svg>`,
  { size: 96 },
);

const GRASS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64">
  <path d="M24 64 C22 40 18 20 8 2 C22 14 30 36 30 64Z" fill="#58b248"/>
  <path d="M16 64 C14 46 10 34 2 22 C14 30 22 46 22 64Z" fill="#3c9a4a"/>
  <path d="M26 64 C28 40 34 20 44 6 C36 24 38 44 34 64Z" fill="#7fd05a"/>
  <path d="M30 64 C32 50 38 40 46 34 C40 46 40 54 38 64Z" fill="#a3e66f"/>
  <path d="M24 64 C25 46 26 34 24 14 C28 32 28 48 28 64Z" fill="#b9f08a"/></svg>`,
  { size: 192 },
);

const MOSS_TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 32">
  <path d="M2 32 C0 20 6 10 12 14 C14 4 24 0 28 10 C34 4 44 12 40 22 C46 24 46 30 46 32Z" fill="#62bb46"/>
  <path d="M8 32 C6 24 10 18 14 20 C16 12 22 10 26 16 C32 12 38 18 36 26 C40 28 40 30 40 32Z" fill="#8ed14e"/>
  <path d="M16 32 C14 28 18 24 20 26 C22 20 28 20 30 26 C34 26 34 30 34 32Z" fill="#b6ee78"/></svg>`,
  { size: 128 },
);

const MOSS_HANG = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 40">
  <path d="M0 40 C0 26 4 12 8 2 C10 14 12 26 12 40Z" fill="#4ea84a"/>
  <path d="M10 40 C10 24 14 10 17 0 C20 12 22 26 24 40Z" fill="#6cc24a"/>
  <path d="M6 40 C6 30 9 20 12 12 C14 22 16 32 16 40Z" fill="#8ed14e"/></svg>`,
  { size: 128 },
);

function fernSvg() {
  let leaves = "";
  for (let i = 0; i < 10; i++) {
    const y = 90 - i * 8.2;
    const w = 15 - i * 1.15;
    const fill = i % 2 ? "#4fb35a" : "#6cc956";
    leaves += `<path d="M20 ${y + 2} C${20 - w * 0.6} ${y - 7} ${20 - w} ${y - 5} ${20 - w - 1} ${y - 2} C${20 - w * 0.6} ${y + 1} 20 ${y + 2} 20 ${y + 2}Z" fill="${fill}"/>`;
    leaves += `<path d="M20 ${y + 2} C${20 + w * 0.6} ${y - 7} ${20 + w} ${y - 5} ${20 + w + 1} ${y - 2} C${20 + w * 0.6} ${y + 1} 20 ${y + 2} 20 ${y + 2}Z" fill="${fill}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 96"><path d="M20 96 C20 60 20 30 20 6" stroke="#2d7a45" stroke-width="2.6" fill="none"/>${leaves}<path d="M20 12 C17 8 19 3 20 0 C21 3 23 8 20 12Z" fill="#8de27a"/></svg>`;
}
const FERN = svg(fernSvg(), { size: 192 });

const TASSEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 48">
  <path d="M3 0 L17 0 L15 34 L5 34Z" fill="#2fb8a0"/>
  <path d="M5 0 L9 0 L9 34 L6 34Z" fill="#7fe6cf"/>
  <path d="M11 0 L15 0 L14 34 L11 34Z" fill="#1f8c8c"/>
  <rect x="4" y="33" width="12" height="4" rx="1.5" fill="#ffd56e" stroke="#c98a2b" stroke-width="0.8"/>
  <circle cx="10" cy="42" r="5.5" fill="#ffd56e" stroke="#c98a2b" stroke-width="1"/>
  <circle cx="8.3" cy="40.3" r="1.6" fill="#fff3b8"/></svg>`,
  { size: 128 },
);

const SIGIL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="29.5" fill="#12413f" stroke="#ffd56e" stroke-width="3"/>
  <circle cx="32" cy="32" r="24" fill="none" stroke="#c98a2b" stroke-width="1.4"/>
  <path d="M32 11 C47 22 47 43 32 54 C17 43 17 22 32 11Z" fill="#9dff5a"/>
  <path d="M32 15 L32 52" stroke="#12413f" stroke-width="1.6"/>
  <path d="M32 25 L40 21 M32 33 L42 28 M32 41 L40 37 M32 25 L24 21 M32 33 L22 28 M32 41 L24 37" stroke="#12413f" stroke-width="1.3" fill="none"/>
  <circle cx="32" cy="5.5" r="1.8" fill="#ffd56e"/><circle cx="32" cy="58.5" r="1.8" fill="#ffd56e"/>
  <circle cx="5.5" cy="32" r="1.8" fill="#ffd56e"/><circle cx="58.5" cy="32" r="1.8" fill="#ffd56e"/></svg>`,
  { size: 256 },
);

function filigreeSvg() {
  let petals = "";
  for (let i = 0; i < 8; i++) {
    const a = i * 45;
    petals += `<g transform="rotate(${a} 32 32)"><path d="M32 4 C37 10 37 18 32 24 C27 18 27 10 32 4Z" fill="#ffd56e" stroke="#b8701c" stroke-width="1.1"/><path d="M32 8 L32 21" stroke="#b8701c" stroke-width="0.9"/></g>`;
    petals += `<g transform="rotate(${a + 22.5} 32 32)"><circle cx="32" cy="7.5" r="1.8" fill="#fff3b8" stroke="#b8701c" stroke-width="0.8"/><path d="M32 11 C34 14 34 18 32 21 C30 18 30 14 32 11Z" fill="#e8a83a" stroke="#b8701c" stroke-width="0.7"/></g>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="none" stroke="#ffd56e" stroke-width="3"/><circle cx="32" cy="32" r="30" fill="none" stroke="#b8701c" stroke-width="0.9" stroke-dasharray="1.2 2.4"/>${petals}<circle cx="32" cy="32" r="12.5" fill="none" stroke="#ffd56e" stroke-width="3"/><circle cx="32" cy="32" r="12.5" fill="none" stroke="#b8701c" stroke-width="0.8"/></svg>`;
}
const FILIGREE = svg(filigreeSvg(), { size: 256 });

const DAISY = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48">
  <path d="M16 48 C16 36 16 28 16 20" stroke="#3c9a4a" stroke-width="2.6" fill="none"/>
  <path d="M16 40 C10 38 7 34 6 30 C12 32 15 35 16 40Z" fill="#58b248"/>
  <g fill="#fffaf0" stroke="#e6d6c8" stroke-width="0.6">
    <ellipse cx="16" cy="9" rx="3.6" ry="6.2"/><ellipse cx="16" cy="9" rx="3.6" ry="6.2" transform="rotate(60 16 15)"/>
    <ellipse cx="16" cy="9" rx="3.6" ry="6.2" transform="rotate(120 16 15)"/><ellipse cx="16" cy="9" rx="3.6" ry="6.2" transform="rotate(180 16 15)"/>
    <ellipse cx="16" cy="9" rx="3.6" ry="6.2" transform="rotate(240 16 15)"/><ellipse cx="16" cy="9" rx="3.6" ry="6.2" transform="rotate(300 16 15)"/>
  </g>
  <circle cx="16" cy="15" r="4" fill="#ffc83a" stroke="#d9962a" stroke-width="0.8"/></svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
// Helpers

function rockGeo(rx: number, ry: number, rz: number, seed: number, top = 1, bot = -1, detail = 1) {
  const g = new THREE.IcosahedronGeometry(1, detail);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const k = 1 + 0.13 * (Math.sin(x * 3.7 + seed) * Math.cos(z * 3.1 + seed * 1.7) + 0.6 * Math.sin(y * 4.3 + seed * 2.1));
    pos.setXYZ(i, x * k * rx, Math.min(Math.max(y * k, bot), top) * ry, z * k * rz);
  }
  g.computeVertexNormals();
  return g;
}

const prof = (keys: ReadonlyArray<readonly [number, number]>) => (t: number) => {
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      return v0 + ((v1 - v0) * (t - t0)) / Math.max(t1 - t0, 1e-6);
    }
  }
  return keys[keys.length - 1][1];
};

const segDist = (p: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3) => {
  const ab = b.clone().sub(a);
  const t = Math.min(Math.max(p.clone().sub(a).dot(ab) / ab.lengthSq(), 0), 1);
  return p.distanceTo(a.clone().add(ab.multiplyScalar(t)));
};

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "redPanda", paintSize: 2048 });
  const R = rng(20260);
  const TOP = 0.33; // top of the balancing stone
  const base = b.joint("base", { at: [0, 0, 0], dir: [0, 1, 0] });

  // ===== The mossy stone and its ground ======================================================================
  const stoneBase = paint((p, n) => {
    const wob = noise(p, 0.11, 21);
    const m = n.y * 0.8 + (wob - 0.5) * 0.9 + (p.y < 0.07 ? 0.25 : 0);
    if (m > 0.42) return MOSS_PAT;
    const c = cells(p, 0.17, 6);
    if (c.d2 - c.d1 < 0.04) return "#586084";
    return STONE_PAT;
  });
  const STONE = cel(stoneBase);

  const ground = b.lathe(
    [
      [0, 0.02],
      [0.5, 0.024],
      [0.6, 0.012],
      [0.625, 0],
      [0, 0],
    ],
    { at: [0, 0, 0.02], segments: 10, spin: 9, bone: base, color: cel(GRASS_PAT), name: "ground" },
  );
  const lowRock = b.part(rockGeo(0.42, 0.12, 0.46, 1.3, 1, -0.64, 2), STONE, {
    bone: base,
    at: [0.0, 0.065, 0.0],
    flat: true,
    name: "boulder",
  });
  const topRock = b.part(rockGeo(0.26, 0.26, 0.37, 4.1, 0.7, -1, 2), STONE, {
    bone: base,
    at: [0, 0.148, 0],
    flat: true,
    name: "stone",
  });
  const stoneSkin = b.surface(topRock);
  const topHit = stoneSkin.ray([0, 1, 0], [0, -1, 0]);
  if (!topHit || Math.abs(topHit.at.y - TOP) > 0.004) throw new Error(`stone top is ${topHit?.at.y}, expected ${TOP}`);

  // little rocks and pebbles around the base
  const pebbles: Array<[number, number, number, number]> = [
    [0.4, 0.34, 0.06, 5],
    [-0.38, 0.4, 0.05, 6],
    [0.46, -0.28, 0.07, 7],
    [-0.44, -0.26, 0.045, 8],
    [0.1, 0.55, 0.04, 9],
    [-0.2, -0.56, 0.05, 10],
    [0.3, -0.52, 0.035, 11],
    [-0.5, 0.05, 0.06, 12],
  ];
  for (const [x, z, r, seed] of pebbles)
    b.part(rockGeo(r * 1.2, r * 0.8, r, seed, 1, -0.5, 1), STONE, { bone: base, at: [x, r * 0.6, z], flat: true, name: "pebble" });

  // moss pillows over the stone's plateau rim and the boulder
  const pillows: Array<[number, number, number, number, number, number]> = [
    [0.15, TOP - 0.004, 0.27, 0.06, 0.028, 0.05],
    [-0.15, TOP - 0.004, 0.25, 0.055, 0.026, 0.05],
    [0.19, TOP - 0.006, -0.1, 0.045, 0.026, 0.07],
    [-0.19, TOP - 0.006, -0.02, 0.05, 0.026, 0.06],
    [0.12, TOP - 0.006, -0.3, 0.06, 0.026, 0.05],
    [-0.12, TOP - 0.004, -0.31, 0.06, 0.026, 0.05],
    [0.33, 0.16, 0.12, 0.07, 0.035, 0.08],
    [-0.31, 0.16, -0.1, 0.08, 0.04, 0.07],
    [0.05, 0.17, 0.42, 0.09, 0.035, 0.06],
    [-0.1, 0.16, -0.43, 0.09, 0.035, 0.06],
  ];
  for (const [x, y, z, rx, ry, rz] of pillows)
    b.part(new THREE.SphereGeometry(1, 7, 5), cel(MOSS_PAT), { bone: base, at: [x, y, z], scale: [rx, ry, rz], flat: true, name: "moss" });

  // moss tufts on the plateau, hanging moss round the rim, grass round the ground
  const tuftHits = stoneSkin.scatter(26, {
    rng: rng(31),
    minDist: 0.07,
    filter: (h) => h.n.y > 0.3 && h.at.y > 0.2 && Math.hypot(h.at.x / 0.16, (h.at.z + 0.02) / 0.34) > 0.7,
  });
  b.cards(tuftHits, MOSS_TUFT, { bone: base, size: [0.075, 0.05], lean: 20, vary: 0.3, rng: rng(32), cross: true, flow: [0, -0.2, 1] });
  const hangHits = stoneSkin.scatter(40, {
    rng: rng(33),
    minDist: 0.06,
    filter: (h) => h.at.y > 0.17 && h.at.y < 0.31 && h.n.y < 0.75,
  });
  b.cards(
    hangHits.map((h) => frame(h.moved([0, 0.012, 0]).at, [0, 1, 0])),
    MOSS_HANG,
    { bone: base, size: [0.045, 0.07], lean: 180, vary: 0.35, rng: rng(34), flow: [0, 0, 1], cross: true },
  );
  const groundSkin = b.surface(ground);
  const grassHits = groundSkin.scatter(110, {
    rng: rng(35),
    minDist: 0.075,
    filter: (h) => h.n.y > 0.7,
    keepOut: (p) => Math.abs(p.x) < 0.33 && Math.abs(p.z) < 0.36,
  });
  b.cards(grassHits, GRASS, { bone: base, size: [0.09, 0.085], lean: 10, vary: 0.4, rng: rng(36), cross: true, flow: [0, 0, 1] });

  // ferns
  const fernSpots: Array<[number, number, number]> = [
    [0.43, 0.2, 40],
    [-0.42, 0.28, -30],
    [-0.35, -0.38, 150],
    [0.36, -0.42, 200],
    [0.05, 0.5, 0],
  ];
  b.cards(
    fernSpots.flatMap(([x, z, yaw]) => [-1, 0, 1].map((k) => ({ x, z, yaw: yaw + k * 55 }))).map(({ x, z, yaw }) => frame([x, 0.012, z], [0, 1, 0])),
    FERN,
    { bone: base, size: [0.12, 0.26], lean: 58, bend: 40, flow: (_f, i) => [Math.sin(i * 2.1), 0, Math.cos(i * 2.1)], vary: 0.25, rng: rng(37) },
  );

  // daisies
  const daisyFrames = [
    [0.38, 0.4],
    [-0.3, 0.42],
    [0.48, -0.1],
    [-0.46, -0.12],
    [0.22, -0.55],
  ].map(([x, z]) => frame([x, 0.01, z], [0, 1, 0]));
  b.cards(daisyFrames, DAISY, { bone: base, size: [0.07, 0.11], lean: 8, cross: true, flow: [0, 0, 1], vary: 0.2, rng: rng(38) });

  // mushrooms: some glowing teal, some plain red-and-cream
  const capOutline: Array<[number, number]> = [
    [0, 0.03],
    [0.016, 0.028],
    [0.03, 0.018],
    [0.038, 0.004],
    [0.034, 0],
    [0, 0],
  ];
  const shrooms: Array<[number, number, number, boolean]> = [
    [0.38, 0.17, 1.0, true],
    [0.33, 0.21, 0.7, true],
    [-0.4, -0.12, 1.15, true],
    [-0.36, -0.2, 0.7, false],
    [0.2, -0.46, 0.9, false],
    [-0.18, 0.5, 0.8, true],
  ];
  const stems: THREE.BufferGeometry[] = [];
  const spotGeo: THREE.BufferGeometry[] = [];
  for (const [x, z, k, lit] of shrooms) {
    const h = 0.035 * k;
    stems.push(new THREE.CylinderGeometry(0.008 * k, 0.011 * k, h, 6).translate(x, h / 2, z));
    const cap = b.lathe(capOutline, {
      at: [x, h - 0.002, z],
      segments: 8,
      bone: base,
      color: lit ? "#42e8c8" : cel("#e8433e", "#a02a5a"),
      name: "mushroomCap",
    });
    cap.mesh.scale.setScalar(k);
    if (lit) glow(cap, 1.1);
    for (let i = 0; i < 4; i++) {
      const a = i * 1.7 + x * 9;
      spotGeo.push(new THREE.SphereGeometry(0.0055 * k, 5, 4).translate(x + Math.cos(a) * 0.017 * k, h + 0.018 * k, z + Math.sin(a) * 0.017 * k));
    }
  }
  b.part(mergeGeometries(stems)!, CREAM, { bone: base, at: [0, 0, 0], name: "mushroomStems" });
  b.part(mergeGeometries(spotGeo)!, "#fff4d8", { bone: base, at: [0, 0, 0], name: "mushroomSpots" });

  // glowing dendro sigil carved into the stone's front, plus gold-edged rune studs
  const sigilHit = stoneSkin.around([0, 0.2, 0]).at(0, -8);
  if (sigilHit) glow(b.decal(stoneSkin, SIGIL, { at: sigilHit, dir: sigilHit.n, size: [0.13, 0.13], bone: base, name: "sigil" }), 1.1);
  const studGeo: THREE.BufferGeometry[] = [];
  for (const az of [-26, -16, 16, 26]) {
    const h = stoneSkin.around([0, 0.2, 0]).at(az, -8);
    if (h) studGeo.push(new THREE.SphereGeometry(0.008, 6, 4).translate(h.at.x + h.n.x * 0.004, h.at.y + h.n.y * 0.004, h.at.z + h.n.z * 0.004));
  }
  if (studGeo.length) b.part(mergeGeometries(studGeo)!, GOLD, { bone: base, at: [0, 0, 0], name: "studs" });

  // ===== Skeleton ============================================================================================
  const spineP = catmull(
    [
      [0, TOP + 0.185, -0.22],
      [0, TOP + 0.2, -0.04],
      [0, TOP + 0.2, 0.12],
      [0, TOP + 0.205, 0.24],
    ],
    {},
  );
  const spine = b.chain("spine", spineP, { parent: base, names: ["hips", "spine2", "chest"], role: "spine" });
  const hips = spine.joints[0];
  const chest = spine.joints[2];
  const neckP = catmull(
    [
      [0, TOP + 0.205, 0.24],
      [0, TOP + 0.225, 0.3],
      [0, TOP + 0.235, 0.35],
    ],
    {},
  );
  const neck = b.chain("neck", neckP, { parent: chest, names: ["neck1", "neck2"], role: "neck" });
  const HJ = neckP.at(1);
  const head = b.joint("head", { parent: neck.joints[1], at: HJ, dir: [0, -0.08, 1], role: "head" });
  const H = new THREE.Vector3(0, TOP + 0.252, 0.395); // head centre
  const jaw = b.joint("jaw", { parent: head, at: [0, H.y - 0.04, H.z - 0.01], aim: [0, H.y - 0.045, H.z + 0.1], role: "jaw" });

  // tail, raised in an S for balance
  const tailP = catmull(
    [
      [0, TOP + 0.185, -0.29],
      [0, TOP + 0.2, -0.4],
      [0, TOP + 0.26, -0.49],
      [0, TOP + 0.36, -0.53],
      [0, TOP + 0.45, -0.49],
      [0, TOP + 0.5, -0.4],
    ],
    {},
  );
  const tail = b.chain("tail", tailP, { parent: hips, count: 6, role: "tail" });

  // legs: planted flat on the stone
  const PAW_R = 0.026;
  const FOOT_Y = TOP + PAW_R - 0.002;
  type Leg = { chain: ReturnType<typeof b.chain>; sx: number; front: boolean };
  const legs: Leg[] = [];
  for (const sx of [1, -1]) {
    const S = sx > 0 ? "L" : "R";
    const fPts = limb(
      [sx * 0.078, TOP + 0.14, 0.175],
      [sx * 0.088, FOOT_Y, 0.255],
      [0.078, 0.072, 0.07],
      [[0, 0, -1]],
      { sole: [0, 0, 1] },
    );
    const front = b.chain(`legF${S}`, fPts, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `paw${S}`],
      role: "leg",
    });
    legs.push({ chain: front, sx, front: true });
    const hPts = limb(
      [sx * 0.085, TOP + 0.15, -0.2],
      [sx * 0.092, FOOT_Y, -0.12],
      [0.09, 0.09, 0.08],
      [[0, 0, 1]],
      { sole: [0, 0, 1] },
    );
    const hind = b.chain(`legH${S}`, hPts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`],
      role: "leg",
    });
    legs.push({ chain: hind, sx, front: false });
  }

  // ears
  const earJ: Record<number, ReturnType<typeof b.joint>> = {};
  for (const sx of [1, -1])
    earJ[sx] = b.joint(sx > 0 ? "earL" : "earR", {
      parent: head,
      at: [sx * 0.06, H.y + 0.058, H.z - 0.012],
      dir: [sx * 0.45, 1, -0.05],
      role: "hinge",
    });

  // ===== Body ================================================================================================
  const bodyCoat = cel(
    furEdge(RUST_PAT, DARK, { level: -0.1, teeth: 0.3, period: 0.036, ink: "#8c3322", inkWidth: 0.035 }),
  );
  const bodyRadius = (t: number) => {
    const rx = prof([
      [0, 0.088],
      [0.45, 0.1],
      [1, 0.098],
    ])(t);
    const ry = prof([
      [0, 0.088],
      [0.5, 0.096],
      [1, 0.1],
    ])(t);
    return [rx, ry] as [number, number];
  };
  const body = b.sweep(spine, bodyRadius, { color: bodyCoat, name: "body" });
  const neckTube = b.sweep(neck, [0.082, 0.074], { color: bodyCoat, name: "neckTube" });

  // legs
  const legCoat = cel(
    furEdge(RUST_PAT, DARK, { by: "position", axis: [0, 1, 0], level: TOP + 0.118, teeth: 0.03, period: 0.034, along: [1, 0, 0] }),
  );
  const paw = (t: number) => (t > 0.64 ? 1 : 0);
  for (const { chain, sx, front } of legs) {
    const S = sx > 0 ? "L" : "R";
    const f = front;
    const rx = prof(
      f
        ? [[0, 0.04], [0.3, 0.034], [0.62, 0.028], [0.7, 0.03], [1, 0.032]]
        : [[0, 0.055], [0.3, 0.04], [0.6, 0.029], [0.7, 0.03], [1, 0.034]],
    );
    const ry = prof(
      f
        ? [[0, 0.042], [0.3, 0.034], [0.62, 0.028], [0.7, PAW_R], [1, PAW_R]]
        : [[0, 0.056], [0.3, 0.042], [0.6, 0.03], [0.7, PAW_R], [1, PAW_R]],
    );
    b.sweep(chain, (t) => [rx(t), paw(t) ? PAW_R : ry(t)] as [number, number], {
      color: paint((p, n) => (p.y < TOP + 0.075 ? BLACKISH : legCoat)),
      name: `leg${f ? "F" : "H"}${S}`,
    });
    // toes and claws
    const tip = chain.tip!;
    const tipAt = tip.at;
    for (let i = 0; i < 3; i++) {
      const dx = (i - 1) * 0.021 * -sx;
      const p0 = new THREE.Vector3(tipAt.x + dx * 0.6, FOOT_Y - 0.004, tipAt.z + 0.012);
      const p1 = new THREE.Vector3(tipAt.x + dx * 1.2, TOP + 0.012, tipAt.z + 0.045 - Math.abs(i - 1) * 0.008);
      const toe = b.chain(`toe${f ? "F" : "H"}${S}${i + 1}`, polyline([p0, p1]), {
        parent: tip,
        names: [`toe${f ? "F" : "H"}${S}${i + 1}`],
        role: "digit",
      });
      b.sweep(toe, [0.012, 0.009], { color: BLACKISH, sides: 6, name: "toe" });
      b.spike(p1.clone().add(new THREE.Vector3(0, 0.001, 0.004)), [dx * 0.4, -0.5, 1], 0.017, 0.005, {
        color: CLAW,
        bone: toe.joints[0],
        sides: 5,
        name: "claw",
      });
    }
  }

  // ===== Tail ================================================================================================
  const ringColor = (t: number, deg: number) => {
    if (t > 0.9) return BLACK_FUR;
    const idx = Math.floor(t * 11 + 0.3 * (zigzag(deg / 70) - 0.5));
    return idx % 2 === 0 ? RUST_A : RUST_C;
  };
  const tailRadius = prof([
    [0, 0.05],
    [0.25, 0.07],
    [0.55, 0.078],
    [0.82, 0.062],
    [1, 0.024],
  ]);
  const tailSweep = b.sweep(tail, tailRadius, { color: cel(paint((_p, _n, s) => ringColor(s[0], s[1]))), name: "tail" });
  const tailPaint = cel(paint((p) => ringColor(tailP.closestT(p), 0)));
  const tailHits = b.surface(tailSweep).scatter(70, { rng: rng(41), minDist: 0.05 });
  b.cards(tailHits, TUFT, {
    size: [0.04, 0.065],
    lean: 60,
    bend: 20,
    vary: 0.3,
    rng: rng(42),
    color: tailPaint,
    flow: (f) => [f.n.x * 0.2, 0.1, 0.4],
    cross: true,
  });
  // gold tail ring with a small dendro leaf charm
  const ringAt = tail.at(0.2);
  b.part(new THREE.TorusGeometry(tailRadius(0.2) + 0.004, 0.0085, 6, 14), GOLD, {
    at: ringAt.at,
    dir: ringAt.tangent,
    axis: "z",
    bone: ringAt.bone,
    name: "tailRing",
  });
  const charm = b.part(new THREE.OctahedronGeometry(0.014), GEM, {
    at: tail.at(0.2).at.clone().add(new THREE.Vector3(0, tailRadius(0.2) * 0.9 + 0.01, 0)),
    bone: ringAt.bone,
    scale: [0.8, 1.3, 0.6],
    name: "tailCharm",
  });
  glow(charm, 1.2);

  // ===== Head ================================================================================================
  const faceFn = (p: THREE.Vector3) => {
    const dx = p.x - H.x;
    const dy = p.y - H.y;
    const dz = p.z - H.z;
    const ax = Math.abs(dx);
    const tear = segDist(new THREE.Vector3(ax, dy, dz), new THREE.Vector3(0.05, -0.014, 0.076), new THREE.Vector3(0.036, -0.05, 0.1));
    if (tear < 0.0048 && dz > 0.04) return TEAR;
    const brow = ((ax - 0.052) / 0.019) ** 2 + ((dy - 0.042) / 0.012) ** 2 + ((dz - 0.062) / 0.03) ** 2;
    if (brow < 1) return WHITE_FUR;
    const mu = (ax / 0.056) ** 2 + ((dy + 0.034) / 0.05) ** 2 + ((dz - 0.075) / 0.078) ** 2;
    const muLim = 0.95 + 0.4 * zigzag(Math.atan2(dy + 0.034, ax) * 4.2);
    if (mu < muLim) return WHITE_FUR;
    const ch = ((ax - 0.074) / 0.052) ** 2 + ((dy + 0.03) / 0.054) ** 2 + ((dz - 0.002) / 0.068) ** 2;
    const chLim = 0.9 + 0.5 * zigzag(Math.atan2(dy + 0.03, dz) * 3.4);
    if (ch < chLim) return WHITE_FUR;
    // rusty forehead, lighter crown
    return dy > 0.03 ? RUST_A : RUST_PAT;
  };
  const FACE = cel(paint((p) => faceFn(p)));

  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), FACE, {
    bone: head,
    at: H,
    scale: [0.093, 0.075, 0.087],
    name: "skull",
  });
  for (const sx of [1, -1])
    b.part(new THREE.SphereGeometry(1, 9, 7), FACE, {
      bone: head,
      at: [sx * 0.086, H.y - 0.03, H.z + 0.004],
      scale: [0.034, 0.042, 0.052],
      name: "cheek",
    });
  b.part(new THREE.SphereGeometry(1, 10, 8), FACE, {
    bone: head,
    at: [0, H.y - 0.03, H.z + 0.072],
    scale: [0.045, 0.036, 0.054],
    name: "snout",
  });
  const nose = b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    bone: head,
    at: [0, H.y - 0.014, H.z + 0.122],
    scale: [0.02, 0.014, 0.013],
    name: "nose",
  });
  b.part(new THREE.SphereGeometry(0.0035, 5, 4), "#ffffff", {
    bone: head,
    at: [0.005, H.y - 0.008, H.z + 0.134],
    name: "noseGlint",
  });
  // mouth interior and lower jaw
  b.part(new THREE.SphereGeometry(1, 8, 6), MAROON, {
    bone: head,
    at: [0, H.y - 0.047, H.z + 0.066],
    scale: [0.026, 0.01, 0.04],
    name: "mouthInside",
  });
  b.part(new THREE.SphereGeometry(1, 9, 7), CREAM, {
    bone: jaw,
    at: [0, H.y - 0.058, H.z + 0.066],
    scale: [0.03, 0.016, 0.046],
    name: "lowerJaw",
  });
  b.part(new THREE.SphereGeometry(1, 7, 5), PINK, {
    bone: jaw,
    at: [0, H.y - 0.049, H.z + 0.07],
    scale: [0.016, 0.006, 0.026],
    name: "tongue",
  });
  for (const sx of [1, -1]) {
    b.spike([sx * 0.016, H.y - 0.046, H.z + 0.098], [0, -1, 0.15], 0.011, 0.0042, { color: "#ffffff", bone: head, sides: 5, name: "fang" });
    b.spike([sx * 0.014, H.y - 0.06, H.z + 0.095], [0, 1, 0.15], 0.009, 0.0035, { color: "#ffffff", bone: jaw, sides: 5, name: "fangLow" });
  }
  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  // anime eyes
  const EYE = animeEye({ iris: "#8ee04a", irisLight: "#f0ff9a", irisDark: "#2a8f4a", blush: "#ff8f7a" });
  const skin = b.surface(skull);
  for (const sx of [1, -1]) {
    const hit = skin.around(H).at(sx * 33, 4);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.046, 0.063], mirror: sx > 0, bone: head, name: "eye" });
  }

  // ears
  const earOutline: Array<[number, number]> = [
    [-0.036, 0],
    [0.04, -0.002],
    [0.052, 0.036],
    [0.03, 0.082],
    [-0.002, 0.092],
    [-0.03, 0.07],
    [-0.046, 0.034],
  ];
  const earPaint = cel(
    paint((_p, n, s) => {
      if (n.z < 0.35) return n.z < -0.35 ? DARK_FUR : RUST_A;
      const u = s[0];
      const v = s[1];
      const d = Math.hypot((u - 0.0) / 0.03, (v - 0.04) / 0.037);
      if (d < 0.86 + 0.28 * zigzag(Math.atan2(v - 0.04, u) * 3.2)) return WHITE_FUR;
      if (v > 0.07) return WHITE_FUR; // pale tip
      return RUST_PAT;
    }),
  );
  for (const sx of [1, -1]) {
    const ear = b.extrude(earOutline, {
      at: [sx * 0.06, H.y + 0.05, H.z - 0.012],
      x: [sx, 0, 0],
      y: [sx * 0.45, 1, -0.05],
      thickness: 0.022,
      bevel: 0.006,
      smoothing: 1,
      color: earPaint,
      bone: earJ[sx],
      name: "ear",
    });
    // gold clip on the left ear, with a small tassel
    if (sx > 0) {
      const clip = ear.moved(ear.local([0.036, 0.062, 0]));
      b.part(new THREE.TorusGeometry(0.01, 0.0042, 5, 10), GOLD, { frame: clip, bone: earJ[sx], axis: "z", dir: [1, 0, 0.4], name: "earClip" });
      glow(b.part(new THREE.OctahedronGeometry(0.0075), GEM, { at: ear.local([0.04, 0.052, 0.014]), bone: earJ[sx], scale: [0.8, 1.2, 0.8], name: "earGem" }), 1.1);
      b.cards([frame(ear.local([0.043, 0.056, 0.0]), [0, 1, 0])], TASSEL, {
        bone: earJ[sx],
        size: [0.012, 0.03],
        lean: 180,
        flow: [0, 0, 1],
        cross: true,
      });
    }
  }

  // whiskers
  for (const sx of [1, -1])
    for (let i = 0; i < 3; i++) {
      const y0 = H.y - 0.026 - i * 0.006;
      b.sweep(
        catmull([
          [sx * 0.04, y0, H.z + 0.1],
          [sx * 0.085, y0 + 0.008 - i * 0.012, H.z + 0.115],
          [sx * 0.13, y0 - 0.004 - i * 0.026, H.z + 0.1],
        ]),
        [0.0022, 0.0006],
        { color: "#fffdf4", bone: head, sides: 4, caps: "none", name: "whisker" },
      );
    }

  // cheek ruff tufts, crown tufts, chest and belly fringe, mantle
  const headSkin = b.surface(b.part(new THREE.SphereGeometry(1, 8, 6), FACE, { bone: head, at: [0, H.y - 0.004, H.z - 0.01], scale: [0.099, 0.08, 0.09], name: "ruffCore" }));
  const ruffHits = headSkin.scatter(90, {
    rng: rng(51),
    minDist: 0.022,
    filter: (h) => Math.abs(h.at.x) > 0.055 && h.at.z < H.z + 0.04 && h.at.y < H.y + 0.01 && h.at.y > H.y - 0.075,
  });
  b.cards(ruffHits, TUFT, {
    bone: head,
    size: [0.032, 0.05],
    lean: 75,
    bend: 15,
    vary: 0.3,
    rng: rng(52),
    color: FACE,
    flow: (f) => [Math.sign(f.n.x) * 0.5, -0.5, -0.7],
    cross: true,
  });
  const crownHits = headSkin.scatter(40, { rng: rng(53), minDist: 0.03, filter: (h) => h.n.y > 0.6 });
  b.cards(crownHits, TUFT, { bone: head, size: [0.022, 0.034], lean: 40, vary: 0.3, rng: rng(54), color: cel(RUST_A), flow: [0, 0.2, -1] });

  const bodyHits = b.surface([body, neckTube]).scatter(110, {
    rng: rng(55),
    minDist: 0.05,
    filter: (h) => h.at.z < 0.3,
  });
  b.cards(bodyHits, TUFT, {
    size: [0.04, 0.055],
    lean: 70,
    bend: 15,
    vary: 0.3,
    rng: rng(56),
    color: bodyCoat,
    flow: [0, -0.1, -1],
    cross: true,
  });

  // ===== Collar, medallion, tassels ===========================================================================
  const collarPaint = cel(
    paint((_p, _n, s) => {
      const u = s[0] * 26;
      return Math.abs((u % 1) - 0.5) < 0.2 && Math.abs(s[1] - 0.5) < 0.25 ? GOLD_FLAT : "#33c9b0";
    }),
  );
  const nk = neck.at(0.3);
  const nR = 0.082 - 0.008 * 0.3 + 0.014;
  b.part(new THREE.TorusGeometry(nR, 0.014, 6, 18), collarPaint, { at: nk.at, dir: nk.tangent, axis: "z", bone: neck.joints[0], name: "collar" });
  for (const off of [-0.017, 0.017]) {
    const q = neck.at(0.3).at.clone().add(nk.tangent.clone().multiplyScalar(off));
    b.part(new THREE.TorusGeometry(nR + 0.001, 0.0042, 5, 18), GOLD, { at: q, dir: nk.tangent, axis: "z", bone: neck.joints[0], name: "collarTrim" });
  }
  // medallion hanging on the chest
  const chestSkin = b.surface([body, neckTube]);
  const mHit = chestSkin.ray([0, TOP + 0.125, 0.6], [0, 0, -1]);
  if (mHit) {
    const m = mHit.moved([0, 0.014, 0]);
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.008, 14), GOLD, { frame: m, bone: chest, name: "medalDisc" });
    b.part(new THREE.PlaneGeometry(0.084, 0.084), "#ffffff", {
      frame: mHit.moved([0, 0.0225, 0]),
      dir: mHit.n,
      axis: "z",
      up: [0, 1, 0],
      texture: FILIGREE,
      bone: chest,
      name: "medalFiligree",
    });
    glow(b.part(new THREE.OctahedronGeometry(0.019, 1), GEM, { frame: mHit.moved([0, 0.03, 0]), bone: chest, scale: [1, 1.15, 0.8], name: "medalGem" }), 1.3);
    // cords up to the collar
    for (const sx of [1, -1]) {
      const cord = chestSkin.drape(
        catmull([
          mHit.at.clone().add(new THREE.Vector3(sx * 0.012, 0.03, 0)),
          new THREE.Vector3(sx * 0.055, TOP + 0.17, 0.31),
          new THREE.Vector3(sx * 0.082, TOP + 0.2, 0.265),
        ]),
        { lift: 0.008 },
      );
      b.sweep(cord, 0.0045, { color: GOLD, sides: 5, bone: chest, name: "cord" });
    }
    // two tassels under the medallion
    const tFrames = [-0.022, 0.022].map((dx) => frame(mHit.at.clone().add(new THREE.Vector3(dx, -0.028, 0.012)), [0, 1, 0]));
    b.cards(tFrames, TASSEL, { bone: chest, size: [0.028, 0.07], lean: 180, flow: [0, 0, 1], cross: true });
  }

  // ===== Dendro motes and leaves ===============================================================================
  const moteGeo: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 14; i++) {
    const a = i * 2.4;
    const r = 0.45 + R() * 0.2;
    moteGeo.push(
      new THREE.OctahedronGeometry(0.01 + R() * 0.008).scale(0.8, 1.3, 0.8).translate(Math.cos(a) * r, 0.5 + R() * 0.45, Math.sin(a) * r * 0.8),
    );
  }
  glow(b.part(mergeGeometries(moteGeo)!, MOTE, { bone: base, at: [0, 0, 0], name: "motes" }), 1.2);
  const leafOutline: Array<[number, number]> = [
    [0, 0],
    [0.022, 0.014],
    [0.03, 0.04],
    [0.012, 0.072],
    [0, 0.08, "sharp"] as unknown as [number, number],
    [-0.012, 0.072],
    [-0.03, 0.04],
    [-0.022, 0.014],
  ];
  const leaves: Array<[number, number, number, number]> = [
    [0.38, 0.62, 0.3, 20],
    [-0.4, 0.74, 0.12, -40],
    [0.1, 0.9, -0.5, 60],
    [-0.3, 0.55, -0.35, 110],
    [0.52, 0.45, -0.15, -80],
  ];
  for (const [x, y, z, yaw] of leaves) {
    const lf = b.extrude(leafOutline, {
      at: [x, y, z],
      x: [Math.cos(yaw * 0.017), 0.3, Math.sin(yaw * 0.017)],
      y: [-Math.sin(yaw * 0.017) * 0.5, 1, Math.cos(yaw * 0.017) * 0.5],
      thickness: 0.004,
      bevel: 0.0015,
      smoothing: 1,
      color: "#a8f060",
      bone: base,
      name: "leaf",
    });
    glow(lf, 1.0);
  }

  return b.root;
}
