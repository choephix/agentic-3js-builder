import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import type { Path } from "../src/path";
import type { Chain, Joint } from "../src/skeleton";
import type { Sweep } from "../src/sweep";
import { gradient, spots } from "../src/paint";
import { svg } from "../src/texture";
import { animeEye, cel, furEdge } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Spirit Stag of the Evergreen Grove",
  description:
    "A glowing forest-spirit stag with faceted crystal antlers, gold filigree regalia, tassels, a floating halo and wind-borne leaves, cel-shaded in a bright teal and gold anime palette.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const TEAL = "#52d6c6";
const TEAL_SPOT = "#b9f8e8";
const CREAM = "#f4fff2";
const DEEP = "#2b93ad";
const GOLD = cel("#ffd552", "#d98a22");
const NAVY = cel("#3c5c8c", "#27395f");
const NOSE = cel("#47396f", "#2b2250");
const INNER = cel("#ffcfc2", "#e69aae");
const TASSEL = "#35cdc4";
const DARK = "#1d1f3a";
const GEM = "#9ff7ff";

type Pal = readonly [string, string, string];
const PAL_DEEP: Pal = ["#4fd3ea", "#7be6f0", "#2fa6dc"];
const PAL_MID: Pal = ["#6af0e2", "#a4fbef", "#38cbe0"];
const PAL_PALE: Pal = ["#c4fff4", "#effffd", "#86ecf2"];
const PAL_LILAC: Pal = ["#b9a4ff", "#e1d8ff", "#7f8cf0"];

// ---------------------------------------------------------------- textures
const EYE = animeEye({ iris: "#ffc22e", irisLight: "#fff08a", irisDark: "#e0781c", blush: "#ff9ec0" });

const TUFT = svg(
  `<svg viewBox="0 0 24 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M1 64 C 4 42 8 18 12 1 C 16 18 20 42 23 64 Z" fill="#fbfff4" stroke="#78cbc8" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M12 3 C 16 18 20 42 22 63 L 12 63 Z" fill="#d9f3ec"/>
</svg>`,
  { size: 128 },
);

const LEAF = svg(
  `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 79 C 3 58 3 22 20 1 C 37 22 37 58 20 79 Z" fill="#7de07c" stroke="#2c8a5c" stroke-width="2" stroke-linejoin="round"/>
  <path d="M20 79 C 37 58 37 22 20 1 Z" fill="#46b872"/>
  <path d="M20 77 L20 10" stroke="#2c8a5c" stroke-width="2" stroke-linecap="round"/>
  <path d="M20 50 L10 38 M20 50 L30 38 M20 32 L12 22 M20 32 L28 22" stroke="#2c8a5c" stroke-width="1.5" stroke-linecap="round"/>
</svg>`,
  { size: 128 },
);

const WISP = svg(
  `<svg viewBox="0 0 32 96" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#52e8dc"/><stop offset="0.6" stop-color="#b6fff3"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
  <path d="M16 95 C 0 72 6 42 14 14 C 15 8 16 4 17 1 C 18 6 19 10 20 16 C 28 44 32 72 16 95 Z" fill="url(#g)"/>
</svg>`,
  { size: 128 },
);

const TASSEL_TEX = svg(
  `<svg viewBox="0 0 30 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 66 L2 2 L11 66 Z M13 66 L11 0 L17 66 Z M19 66 L21 1 L22 66 Z M24 66 L29 3 L22 66 Z" fill="#35cdc4"/>
  <path d="M11 66 L8 8 M17 66 L16 4" stroke="#b6fff3" stroke-width="1.6"/>
  <rect x="6" y="64" width="18" height="6" rx="2" fill="#ffd552"/>
  <rect x="9" y="70" width="12" height="8" rx="3" fill="#e5a02c"/>
</svg>`,
  { size: 128 },
);

const SCROLL = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <g stroke="#c9741c" stroke-width="6.5">
      <path d="M12 78 C 12 40 48 24 66 40 C 80 54 64 72 52 62 C 44 55 52 46 58 50"/>
      <path d="M30 86 C 52 90 82 80 91 52 C 95 40 89 28 78 24"/>
      <path d="M18 62 C 26 50 38 52 40 64"/>
    </g>
    <g stroke="#ffd552" stroke-width="3.6">
      <path d="M12 78 C 12 40 48 24 66 40 C 80 54 64 72 52 62 C 44 55 52 46 58 50"/>
      <path d="M30 86 C 52 90 82 80 91 52 C 95 40 89 28 78 24"/>
      <path d="M18 62 C 26 50 38 52 40 64"/>
    </g>
  </g>
  <circle cx="58" cy="50" r="5" fill="#ffe99a" stroke="#c9741c" stroke-width="1.6"/>
  <circle cx="78" cy="24" r="4" fill="#ffe99a" stroke="#c9741c" stroke-width="1.6"/>
  <circle cx="40" cy="64" r="3.4" fill="#ffe99a" stroke="#c9741c" stroke-width="1.4"/>
  <path d="M12 78 L7 94 L24 86 Z" fill="#ffd552" stroke="#c9741c" stroke-width="1.6" stroke-linejoin="round"/>
</svg>`,
  { size: 384 },
);

const SWIRL = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke-linecap="round">
    <path d="M10 62 C 14 30 52 18 70 34 C 84 48 70 68 56 60 C 48 54 56 44 62 48" stroke="#5de8dc" stroke-width="7"/>
    <path d="M10 62 C 14 30 52 18 70 34 C 84 48 70 68 56 60 C 48 54 56 44 62 48" stroke="#e8fffb" stroke-width="3.2"/>
    <path d="M24 78 C 44 90 82 82 92 56" stroke="#5de8dc" stroke-width="6"/>
    <path d="M24 78 C 44 90 82 82 92 56" stroke="#e8fffb" stroke-width="2.6"/>
    <path d="M30 20 C 42 10 62 10 72 18" stroke="#5de8dc" stroke-width="5"/>
    <path d="M30 20 C 42 10 62 10 72 18" stroke="#e8fffb" stroke-width="2.2"/>
  </g>
  <circle cx="62" cy="48" r="4.6" fill="#ffffff"/>
  <circle cx="92" cy="56" r="3.8" fill="#ffffff"/>
  <circle cx="14" cy="50" r="3.4" fill="#d9fff9"/>
</svg>`,
  { size: 384 },
);

const FILIGREE = svg(
  `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <g stroke="#c9741c" stroke-width="5">
      <path d="M60 104 C 24 84 14 52 40 38 C 56 30 66 44 56 54 C 50 59 44 54 48 49"/>
      <path d="M60 104 C 96 84 106 52 80 38 C 64 30 54 44 64 54 C 70 59 76 54 72 49"/>
      <path d="M60 104 L60 20"/>
    </g>
    <g stroke="#ffd552" stroke-width="2.6">
      <path d="M60 104 C 24 84 14 52 40 38 C 56 30 66 44 56 54 C 50 59 44 54 48 49"/>
      <path d="M60 104 C 96 84 106 52 80 38 C 64 30 54 44 64 54 C 70 59 76 54 72 49"/>
      <path d="M60 104 L60 20"/>
    </g>
  </g>
  <circle cx="60" cy="16" r="6" fill="#ffe99a" stroke="#c9741c" stroke-width="1.8"/>
  <circle cx="48" cy="49" r="3" fill="#ffe99a"/>
  <circle cx="72" cy="49" r="3" fill="#ffe99a"/>
</svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------- helpers
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const prof = (keys: number[]) => (t: number) => {
  const f = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
  const i = Math.min(Math.floor(f), keys.length - 2);
  return keys[i] + (keys[i + 1] - keys[i]) * (f - i);
};

export default function build() {
  const b = createBuilder({ name: "spiritStag", paintSize: 2048 });

  // ------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 1.1, -0.5], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.1, -0.5],
      [0, 1.12, -0.05],
      [0, 1.15, 0.3],
      [0, 1.18, 0.55],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[2];

  const H = V(0, 1.86, 1.0);
  const hd = V(0, -0.5, 1).normalize();
  const hup = V(0, 0.894, 0.447).normalize();
  const hp = (u: number, v: number, x = 0) => H.clone().addScaledVector(hd, u).addScaledVector(hup, v).add(V(x, 0, 0));

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.18, 0.55],
      [0, 1.42, 0.72],
      [0, 1.68, 0.88],
      [H.x, H.y, H.z],
    ]),
    { parent: chest, names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", { at: neck.at(1), dir: [hd.x, hd.y, hd.z], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: hp(0.0, -0.05), aim: hp(0.4, -0.1), role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.2, -0.68],
      [0, 1.26, -0.92],
      [0, 1.22, -1.15],
      [0, 1.08, -1.34],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // ------------------------------------------------------------ palette paints
  const topCoat = spots(TEAL, TEAL_SPOT, { size: 0.1, amount: 0.34, seed: 5 });
  const coatLit = furEdge(topCoat, CREAM, { level: -0.2, teeth: 0.22, period: 0.07 });
  const COAT = cel(coatLit);
  const LEG = cel(gradient(coatLit, DEEP, [0, 0.55, 0], [0, 0.12, 0]));
  const HEAD = cel(gradient(coatLit, CREAM, hp(0.17, 0), hp(0.3, 0)));
  const JAW = cel(CREAM);
  const TAIL = cel(gradient(CREAM, "#86eedb", [0, 1.2, -0.8], [0, 1.05, -1.4]));

  // ------------------------------------------------------------ body
  const body = b.loft(
    [
      { at: [0, 1.1, -0.74], w: 0.24, h: 0.34 },
      { at: [0, 1.08, -0.52], w: 0.36, h: 0.5 },
      { at: [0, 1.03, -0.1], w: 0.33, h: 0.48 },
      { at: [0, 1.02, 0.3], w: 0.35, h: 0.54 },
      { at: [0, 1.06, 0.55], w: 0.31, h: 0.5 },
      { at: [0, 1.12, 0.74], w: 0.2, h: 0.32 },
    ],
    { bone: [hips, spine], color: COAT, name: "body" },
  );

  // neck
  const neckSw = b.sweep(neck, (t) => [0.14 - 0.05 * t, 0.205 - 0.095 * t], { color: COAT, name: "neck" });

  // head: skull + muzzle
  const skull = b.loft(
    [
      { at: hp(-0.08, 0.0), w: 0.15, h: 0.22 },
      { at: hp(0.05, 0.0), w: 0.18, h: 0.245 },
      { at: hp(0.16, -0.015), w: 0.14, h: 0.18 },
      { at: hp(0.28, -0.025), w: 0.105, h: 0.125 },
      { at: hp(0.38, -0.03), w: 0.108, h: 0.12 },
    ],
    { bone: head, color: HEAD, name: "skull" },
  );
  const lower = b.loft(
    [
      { at: hp(0.02, -0.095), w: 0.11, h: 0.075 },
      { at: hp(0.15, -0.1), w: 0.09, h: 0.062 },
      { at: hp(0.27, -0.1), w: 0.075, h: 0.054 },
      { at: hp(0.37, -0.09), w: 0.07, h: 0.05 },
    ],
    { bone: jaw, color: JAW, name: "lowerJaw" },
  );
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    bone: head,
    at: hp(0.39, -0.03),
    dir: [hd.x, hd.y, hd.z],
    scale: [0.056, 0.042, 0.04],
    name: "nose",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 6, 4), DARK, {
      bone: head,
      at: hp(0.428, -0.012, s * 0.024),
      dir: [hd.x, hd.y, hd.z],
      scale: [0.012, 0.016, 0.009],
      name: "nostril",
    });
  }
  const skinHead = b.surface([skull, lower]);
  for (const s of [1, -1]) {
    const lipPath = skinHead.drape(
      catmull([hp(0.39, -0.056, s * 0.04), hp(0.27, -0.074, s * 0.07), hp(0.15, -0.083, s * 0.088), hp(0.08, -0.07, s * 0.09)]),
      { lift: 0.003 },
    );
    b.sweep(lipPath, 0.0045, { bone: head, color: DARK, sides: 5, name: "lip" });
    // eye
    const eyeHit = skinHead.nearest(hp(0.09, 0.03, s * 0.14));
    glow(
      b.decal(skinHead, EYE, {
        at: eyeHit,
        dir: [s * 0.95, 0.12, 0.3],
        size: [0.092, 0.126],
        mirror: s > 0,
        bone: head,
        name: "eye",
      }),
      0.75,
    );
  }

  // ears
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ed = V(s * 0.8, 0.5, -0.3).normalize();
    const eyv = V(0, 1, 0.35).addScaledVector(ed, -V(0, 1, 0.35).dot(ed)).normalize();
    const base = hp(-0.045, 0.075, s * 0.07);
    const earJ = b.joint(`ear${side}`, { parent: head, at: base, dir: [ed.x, ed.y, ed.z], role: "hinge" });
    const outline: [number, number, string?][] = [
      [0, -0.045],
      [0.07, -0.075],
      [0.16, -0.055],
      [0.26, 0.0, "sharp"],
      [0.16, 0.045],
      [0.07, 0.065],
      [0, 0.045],
    ];
    const outerOpts = {
      at: base,
      x: [ed.x, ed.y, ed.z] as [number, number, number],
      y: [eyv.x, eyv.y, eyv.z] as [number, number, number],
      bone: earJ,
      smoothing: 1,
      bevel: 0.004,
      detail: 0.5,
    };
    b.extrude(outline as never, { ...outerOpts, thickness: 0.014, color: COAT, name: "earOuter" });
    const th = ed.clone().cross(eyv).normalize();
    const inward = th.dot(V(-s * 0.4, 0, 1)) > 0 ? 1 : -1;
    const inner: [number, number, string?][] = [
      [0.015, -0.03],
      [0.07, -0.055],
      [0.15, -0.038],
      [0.22, 0.0, "sharp"],
      [0.15, 0.03],
      [0.07, 0.046],
      [0.015, 0.03],
    ];
    b.extrude(inner as never, {
      ...outerOpts,
      at: base.clone().addScaledVector(th, inward * 0.006),
      thickness: 0.012,
      bevel: 0.003,
      detail: 0.5,
      color: INNER,
      name: "earInner",
    });
    // gold ear hoop
    b.part(new THREE.TorusGeometry(0.018, 0.004, 4, 8), GOLD, {
      bone: earJ,
      at: base.clone().addScaledVector(ed, 0.2).addScaledVector(eyv, -0.05),
      dir: [th.x, th.y, th.z],
      axis: "z",
      name: "earHoop",
    });
  }

  // ------------------------------------------------------------ legs
  const legSweeps: Record<string, Sweep> = {};
  const legChains: Record<string, Chain> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // front
    const fl = limb(
      [s * 0.16, 1.0, 0.42],
      [s * 0.17, 0.07, 0.5],
      [0.3, 0.3, 0.26, 0.1],
      [
        [0, 0, -1],
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const legF = b.chain(`legF${side}`, fl, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `fetlockF${side}`, `hoofF${side}`],
      role: "leg",
      contact: [s * 0.17, 0, 0.5],
    });
    legSweeps["F" + side] = b.sweep(legF, prof([0.1, 0.07, 0.046, 0.034, 0.03]), { color: LEG, name: `legF${side}` });
    legChains["F" + side] = legF;
    // hind
    const hl = limb(
      [s * 0.17, 1.02, -0.5],
      [s * 0.17, 0.07, -0.7],
      [0.4, 0.42, 0.36, 0.12],
      [
        [0, 0, 1],
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const legH = b.chain(`legH${side}`, hl, {
      parent: hips,
      names: [`hip${side}`, `stifle${side}`, `hock${side}`, `fetlockH${side}`, `hoofH${side}`],
      role: "leg",
      contact: [s * 0.17, 0, -0.7],
    });
    legSweeps["H" + side] = b.sweep(legH, prof([0.14, 0.095, 0.05, 0.034, 0.029]), { color: LEG, name: `legH${side}` });
    legChains["H" + side] = legH;
  }

  for (const key of Object.keys(legChains)) {
    const chain = legChains[key];
    const sw = legSweeps[key];
    const tip = chain.tip!;
    const foot = tip.at;
    // hoof (cloven-looking, navy) + gold cap
    b.part(new THREE.CylinderGeometry(0.031, 0.044, 0.1, 6), NAVY, {
      bone: tip,
      at: [foot.x, 0.05, foot.z + 0.004],
      name: `hoof${key}`,
    });
    b.part(new THREE.CylinderGeometry(0.043, 0.047, 0.014, 6), GOLD, {
      bone: tip,
      at: [foot.x, 0.1, foot.z + 0.004],
      name: `hoofCap${key}`,
    });
    // gold anklet with glowing gem
    const ringT = 0.83;
    const ring = b.ring(chain.at(ringT), { count: 8, radius: 0.042 });
    b.sweep(catmull(ring.items, { closed: true }), 0.0075, { color: GOLD, sides: 5, name: `anklet${key}` });
    const front = sw.at(ringT, key[0] === "F" ? 0 : 180, 0.01);
    glow(b.stick(new THREE.OctahedronGeometry(0.026), GEM, front, { embed: 0.3, scale: [0.8, 1.35, 0.7] }), 1);
    // upper gold cuff
    const cuff = b.ring(chain.at(0.42), { count: 8, radius: key[0] === "F" ? 0.058 : 0.07 });
    b.sweep(catmull(cuff.items, { closed: true }), 0.011, { color: GOLD, sides: 5, name: `cuff${key}` });
    // fetlock fur tuft
    const tuftFrames = b.ring(chain.at(0.7), { count: 7, radius: 0.034, fromDeg: 90, toDeg: 270 }).items;
    b.cards(tuftFrames, TUFT, { size: [0.03, 0.09], lean: 150, flow: [0, 0, -1], vary: 0.2, rng: rng(21) });
  }
  // knee-hock leaf-fur on the hind legs
  for (const side of ["L", "R"]) {
    const hock = legChains["H" + side];
    const hockFrames = b.ring(hock.at(0.44), { count: 6, radius: 0.05, fromDeg: 120, toDeg: 240 }).items;
    b.cards(hockFrames, TUFT, { size: [0.045, 0.12], lean: 130, flow: [0, 0, -1], rng: rng(22), vary: 0.2 });
  }

  // ------------------------------------------------------------ tail
  const tailSw = b.sweep(tail, (t) => [0.05 + 0.045 * Math.sin(Math.min(t * 1.6, 1) * Math.PI * 0.5) * (1 - 0.55 * t), 0.06], {
    color: TAIL,
    name: "tail",
  });
  const tailHits = b.surface(tailSw).scatter(22, { rng: rng(31), minDist: 0.05 });
  glow(b.cards(tailHits, WISP, { size: [0.045, 0.2], lean: 72, flow: [0, -0.2, -1], bend: 24, rng: rng(32), vary: 0.35 }), 1);
  b.cards(b.surface(tailSw).scatter(26, { rng: rng(33), minDist: 0.05 }), TUFT, {
    size: [0.05, 0.14],
    lean: 70,
    flow: [0, -0.2, -1],
    rng: rng(34),
    vary: 0.3,
  });

  // ------------------------------------------------------------ fur: mane, ruff, back leaves
  const neckSkin = b.surface(neckSw);
  b.cards(neckSkin.scatter(40, { rng: rng(41), minDist: 0.065, filter: (h) => h.n.y > -0.35 }), TUFT, {
    size: [0.055, 0.12],
    lean: 55,
    bend: 20,
    flow: [0, -0.4, -1],
    vary: 0.3,
    rng: rng(42),
  });
  b.cards(neckSkin.scatter(16, { rng: rng(43), minDist: 0.08, filter: (h) => h.n.z > 0.25 && h.n.y < 0.45 }), TUFT, {
    size: [0.06, 0.17],
    lean: 40,
    bend: 25,
    flow: [0, -1, 0.25],
    vary: 0.3,
    rng: rng(44),
  });
  const bodySkin = b.surface(body);
  b.cards(
    bodySkin.scatter(120, { rng: rng(45), minDist: 0.07, filter: (h) => h.n.y > 0.6 && Math.abs(h.at.x) < 0.1 && h.at.z < 0.5 }),
    LEAF,
    { size: [0.05, 0.12], lean: 62, bend: 18, flow: [0, -0.2, -1], vary: 0.3, rng: rng(46), spin: 25 },
  );
  // chest and belly fluff
  b.cards(
    bodySkin.scatter(30, { rng: rng(47), minDist: 0.09, filter: (h) => h.n.y < -0.2 && h.at.z > -0.3 }),
    TUFT,
    { size: [0.05, 0.13], lean: 70, flow: [0, -0.3, -1], vary: 0.3, rng: rng(48) },
  );
  // cheek and chin whiskers of fur
  b.cards(b.surface(lower).scatter(14, { rng: rng(49), minDist: 0.04, filter: (h) => h.n.y < 0 }), TUFT, {
    size: [0.03, 0.08],
    lean: 120,
    flow: [0, -1, 0],
    rng: rng(50),
    vary: 0.3,
  });
  b.cards(
    b.surface(skull).scatter(24, { rng: rng(51), minDist: 0.035, filter: (h) => Math.abs(h.at.x) > 0.04 && h.at.z < 1.12 }),
    TUFT,
    { size: [0.03, 0.08], lean: 70, flow: [0, -0.3, -1], rng: rng(52), vary: 0.3 },
  );

  // flank ornaments
  for (const s of [1, -1]) {
    b.decal(body, SCROLL, {
      at: [s * 0.22, 1.12, 0.32],
      dir: [s, 0, 0],
      size: [0.34, 0.34],
      mirror: s < 0,
      lift: 0.004,
      name: "shoulderScroll",
    });
    glow(
      b.decal(body, SWIRL, {
        at: [s * 0.22, 1.0, -0.4],
        dir: [s, 0.05, 0],
        size: [0.4, 0.4],
        mirror: s < 0,
        lift: 0.004,
        roll: 8 * s,
        name: "haunchSwirl",
      }),
      1,
    );
  }

  // ------------------------------------------------------------ regalia
  // gold collar around the neck base
  const collarLoop = b.surface(neckSw).loop(neck.at(0.2), { lift: 0.014 });
  b.sweep(collarLoop, 0.022, { bone: neck.joints[0], color: GOLD, sides: 5, name: "collar" });
  b.sweep(b.surface(neckSw).loop(neck.at(0.3), { lift: 0.01 }), 0.011, { bone: neck.joints[0], color: GOLD, sides: 5, name: "collar2" });
  b.along(b.surface(neckSw).loop(neck.at(0.2), { lift: 0.03 }), 14, (at) =>
    b.part(new THREE.SphereGeometry(0.014, 6, 4), "#ffe99a", { at, bone: neck.joints[0], name: "collarBead" }),
  );
  // breast pendant
  const chestHit = bodySkin.nearest([0, 1.08, 0.9]);
  const pendantOutline: [number, number, string?][] = [
    [-0.12, 0.05],
    [0, 0.07],
    [0.12, 0.05],
    [0.085, -0.06],
    [0, -0.17, "sharp"],
    [-0.085, -0.06],
  ];
  const pendantAt = chestHit.at.clone().add(V(0, 0.02, 0.01));
  b.extrude(pendantOutline as never, {
    at: pendantAt,
    x: [-1, 0, 0],
    y: [0, 1, -0.28],
    thickness: 0.016,
    bevel: 0.005,
    smoothing: 1,
    color: GOLD,
    bone: chest,
    name: "pendant",
  });
  b.decal(b.surface([body]), FILIGREE, {
    at: pendantAt.clone().add(V(0, -0.02, 0)),
    dir: [0, 0.1, 1],
    size: [0.2, 0.2],
    lift: 0.024,
    name: "pendantFiligree",
    bone: chest,
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.04), GEM, {
      bone: chest,
      at: pendantAt.clone().add(V(0, -0.03, 0.03)),
      scale: [0.8, 1.4, 0.8],
      name: "pendantGem",
    }),
    1,
  );
  // hanging pendant tassels
  for (const dx of [-0.07, 0, 0.07]) {
    const root = pendantAt.clone().add(V(dx, -0.1 + Math.abs(dx) * 0.9 - (dx === 0 ? 0.07 : 0), 0.015));
    b.cards([frame(root, [0, 1, 0])], TASSEL_TEX, { size: [0.04, 0.11], lean: 180, flow: [0, 0, 1], bone: chest, sink: 0 });
  }

  // forehead jewel and brow band
  glow(
    b.part(new THREE.OctahedronGeometry(0.03), GEM, {
      bone: head,
      at: hp(0.1, 0.105),
      dir: [hup.x, hup.y, hup.z],
      scale: [0.8, 1.5, 0.7],
      name: "foreheadGem",
    }),
    1,
  );
  b.part(new THREE.TorusGeometry(0.04, 0.007, 4, 8, Math.PI), GOLD, {
    bone: head,
    at: hp(0.105, 0.085),
    dir: [hd.x, hd.y, hd.z],
    axis: "z",
    rotation: [0, 0, 0],
    name: "browCrescent",
  });

  // ------------------------------------------------------------ crystal antlers
  const crystal = (
    path: Path,
    radius: (t: number) => number,
    pal: Pal,
    bone: Joint,
    opts: { from?: number; to?: number; caps?: "flat" | "none" | "point" } = {},
  ) => {
    const capsEnd = opts.caps ?? "point";
    return glow(
      b.sweep(path, radius, {
        bone,
        section: { ngon: 6 },
        color: pal[2],
        sectors: [
          [-60, 60, pal[0]],
          [60, 180, pal[1]],
        ],
        caps: { start: "none", end: capsEnd },
        from: opts.from,
        to: opts.to,
        name: "crystal",
      }),
      1,
    );
  };

  type Tine = { t: number; dir: [number, number, number]; len: number; r: number };
  const tines: Tine[] = [
    { t: 0.08, dir: [0.25, 0.35, 0.9], len: 0.3, r: 0.034 },
    { t: 0.2, dir: [0.12, 0.55, 0.82], len: 0.32, r: 0.03 },
    { t: 0.36, dir: [0.62, 0.6, 0.5], len: 0.32, r: 0.028 },
    { t: 0.47, dir: [0.35, 0.55, -0.75], len: 0.28, r: 0.025 },
    { t: 0.6, dir: [0.82, 0.55, 0.12], len: 0.26, r: 0.023 },
    { t: 0.8, dir: [0.2, 0.85, 0.5], len: 0.22, r: 0.02 },
    { t: 0.8, dir: [0.75, 0.65, -0.1], len: 0.23, r: 0.02 },
    { t: 0.9, dir: [-0.55, 0.75, 0.3], len: 0.2, r: 0.018 },
  ];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const beamPts: [number, number, number][] = [
      [s * 0.055, 1.94, 1.02],
      [s * 0.11, 2.1, 0.98],
      [s * 0.2, 2.28, 0.92],
      [s * 0.29, 2.45, 0.93],
      [s * 0.31, 2.6, 1.02],
      [s * 0.26, 2.72, 1.12],
    ];
    const beam = catmull(beamPts);
    const antler = b.joint(`antler${side}`, {
      parent: head,
      at: beamPts[0],
      aim: beam.at(0.12),
    });
    const rBeam = prof([0.055, 0.046, 0.037, 0.03, 0.022, 0.014, 0.0]);
    const lo = crystal(beam, rBeam, PAL_DEEP, antler, { from: 0, to: 0.42, caps: "none" });
    const mid = crystal(beam, rBeam, PAL_MID, antler, { from: 0.42, to: 0.75, caps: "none" });
    const hi = crystal(beam, rBeam, PAL_PALE, antler, { from: 0.75, to: 1 });
    void lo;
    void mid;
    void hi;

    // gold burr at the base
    const t0 = beam.tangentAt(0);
    b.lathe(
      [
        [0, -0.03],
        [0.058, -0.03],
        [0.066, 0.0],
        [0.05, 0.025],
        [0.043, 0.05],
        [0, 0.05],
      ],
      { at: beamPts[0], axis: [t0.x, t0.y, t0.z], segments: 8, color: GOLD, bone: antler, name: "burr" },
    );
    // gold bands around beam
    for (const bt of [0.16, 0.42, 0.75]) {
      const pt = beam.at(bt);
      const tg = beam.tangentAt(bt);
      const rr = b.ring(frame(pt, [tg.x, tg.y, tg.z]), { count: 8, radius: rBeam(bt) * 1.18 + 0.004 });
      b.sweep(catmull(rr.items, { closed: true }), 0.0085, { bone: antler, color: GOLD, sides: 5, name: "antlerBand" });
    }

    // tines
    for (const tn of tines) {
      const p0 = beam.at(tn.t);
      const dir = V(tn.dir[0] * s, tn.dir[1], tn.dir[2]).normalize();
      const tip = p0.clone().addScaledVector(dir, tn.len).add(V(0, tn.len * 0.14, 0));
      const midp = p0.clone().addScaledVector(dir, tn.len * 0.5).add(V(0, tn.len * 0.03, 0));
      const tpath = catmull([p0, midp, tip]);
      const pal = tn.t > 0.7 ? PAL_PALE : tn.t > 0.4 ? PAL_MID : PAL_DEEP;
      crystal(tpath, (t) => tn.r * (1 - t) + 0.001, pal, antler);
      // crystal point at the tip
      const td = tpath.tangentAt(1);
      glow(
        b.spike(tip, [td.x, td.y, td.z], 0.07, 0.018, {
          bone: antler,
          section: { ngon: 6 },
          color: PAL_PALE[2],
          sectors: [
            [-60, 60, PAL_PALE[0]],
            [60, 180, PAL_PALE[1]],
          ],
          name: "tineTip",
        }),
        1,
      );
    }

    // crystal shards growing on the beam
    const shardSpec: [number, number, number, number][] = [
      [0.12, 110, 0.12, 0.03],
      [0.27, -110, 0.13, 0.028],
      [0.4, 100, 0.14, 0.026],
      [0.54, -100, 0.12, 0.022],
      [0.68, 110, 0.11, 0.02],
      [0.86, -100, 0.09, 0.016],
    ];
    const bm = b.sweep(beam, rBeam, { bone: antler, section: { ngon: 6 }, color: PAL_DEEP[2], caps: { start: "none", end: "point" }, name: "beamCore" });
    void bm;
    const beamSkin = b.surface(bm);
    const hits = shardSpec.map(([t, ang]) => {
      const pt = beam.at(t);
      const dirHint = V(Math.sign(ang) * 0.4 * s, 0.2, Math.abs(ang) > 105 ? -0.7 : 0.7);
      const h = beamSkin.ray(pt.clone().addScaledVector(dirHint, 0.2), dirHint.clone().negate());
      return h;
    });
    shardSpec.forEach((sp, i) => {
      const h = hits[i];
      if (!h) return;
      const pal = sp[0] > 0.6 ? PAL_PALE : sp[0] > 0.3 ? PAL_MID : PAL_LILAC;
      glow(
        b.spike(h, h, sp[2], sp[3], {
          bone: antler,
          section: { ngon: 6 },
          color: pal[2],
          sectors: [
            [-60, 60, pal[0]],
            [60, 180, pal[1]],
          ],
          name: "shard",
        }),
        1,
      );
    });

    // leaves around the antler base
    const baseRing = b.ring(frame(beamPts[0], [t0.x, t0.y, t0.z]), { count: 7, radius: 0.05, tilt: 20 }).items;
    b.cards(baseRing, LEAF, { size: [0.045, 0.12], lean: 40, flow: [0, 0, -1], vary: 0.25, rng: rng(60 + s), bone: antler });

    // tassel hanging from the outer beam
    const bt = beam.at(0.34);
    const anchor = V(bt.x + s * 0.03, bt.y, bt.z);
    const cord = bezier(anchor, V(anchor.x + s * 0.06, anchor.y - 0.12, anchor.z + 0.02), V(anchor.x + s * 0.07, anchor.y - 0.26, anchor.z), V(anchor.x + s * 0.04, anchor.y - 0.36, anchor.z - 0.01));
    b.sweep(cord, 0.005, { bone: antler, color: TASSEL, sides: 5, name: "tasselCord" });
    b.along(cord, 3, (at) => b.part(new THREE.SphereGeometry(0.013, 6, 4), GOLD, { at, bone: antler, name: "tasselBead" }));
    b.cards([frame(cord.at(1), [0, 1, 0])], TASSEL_TEX, { size: [0.06, 0.15], lean: 180, flow: [0, 0, 1], bone: antler, sink: 0, cross: true });
  }

  // ------------------------------------------------------------ halo
  const haloC = V(0, 2.28, 0.5);
  const circle = (r: number, n: number) =>
    catmull(
      Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        return [haloC.x + r * Math.cos(a), haloC.y + r * Math.sin(a), haloC.z] as [number, number, number];
      }),
      { closed: true },
    );
  b.sweep(circle(0.53, 24), 0.009, { bone: head, color: GOLD, sides: 5, name: "haloOuter" });
  glow(b.sweep(circle(0.47, 24), 0.007, { bone: head, color: "#bffcf4", sides: 5, name: "haloInner" }), 1);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const major = i % 3 === 0;
    glow(
      b.part(new THREE.OctahedronGeometry(major ? 0.034 : 0.02), major ? GEM : "#ffe9a0", {
        bone: head,
        at: [haloC.x + 0.53 * Math.cos(a), haloC.y + 0.53 * Math.sin(a), haloC.z],
        scale: [0.7, 1.4, 0.7],
        rotation: [0, 0, (a * 180) / Math.PI - 90],
        name: "haloGem",
      }),
      1,
    );
  }

  // ------------------------------------------------------------ rune circle on the ground
  const floorRing = (rad: number, y: number) =>
    catmull(
      Array.from({ length: 28 }, (_, i) => {
        const a = (i / 28) * Math.PI * 2;
        return [Math.cos(a) * rad, y, Math.sin(a) * rad - 0.1] as [number, number, number];
      }),
      { closed: true },
    );
  b.sweep(floorRing(0.98, 0.012), 0.01, { bone: hips, color: GOLD, sides: 5, name: "runeRingOuter" });
  glow(b.sweep(floorRing(0.9, 0.012), 0.006, { bone: hips, color: "#bffcf4", sides: 5, name: "runeRingInner" }), 1);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    glow(
      b.part(new THREE.OctahedronGeometry(0.03), i % 2 ? "#ffe9a0" : GEM, {
        bone: hips,
        at: [Math.cos(a) * 0.94, 0.03, Math.sin(a) * 0.94 - 0.1],
        scale: [0.7, 1.1, 1.3],
        rotation: [0, -(a * 180) / Math.PI, 0],
        name: "runeGem",
      }),
      1,
    );
  }

  // ------------------------------------------------------------ drifting motes and leaves
  const r = rng(77);
  const moteFrames: Frame[] = [];
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2;
    const rad = 0.75 + r() * 0.65;
    const p: [number, number, number] = [Math.cos(a) * rad, 0.15 + r() * 2.0, Math.sin(a) * rad * 1.1 + 0.1];
    if (Math.abs(p[0]) < 0.55 && p[2] > -1.0 && p[2] < 1.6 && p[1] < 2.0) continue;
    if (rad < 1.2 && p[1] < 0.5) continue;
    if (i % 2 === 0) {
      const col = i % 4 === 0 ? "#9ff7ff" : "#ffe08a";
      glow(
        b.part(new THREE.OctahedronGeometry(0.022 + r() * 0.018), col, {
          bone: hips,
          at: p,
          rotation: [r() * 90, r() * 90, r() * 90],
          scale: [0.8, 1.4, 0.8],
          name: "mote",
        }),
        1,
      );
    } else {
      moteFrames.push(frame(p, [r() - 0.5, r() * 0.6 + 0.2, r() - 0.5]));
    }
  }
  glow(b.cards(moteFrames, LEAF, { size: [0.05, 0.11], lean: 50, bend: 15, bone: hips, rng: rng(78), vary: 0.25, spin: 180 }), 1);

  return b.root;
}
