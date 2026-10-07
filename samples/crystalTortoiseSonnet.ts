import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import type { JointRef } from "../src/context";
import { cells, mottle, paint, scales } from "../src/paint";
import type { Paint } from "../src/paint";
import { svg } from "../src/texture";
import { animeEye, cel, furEdge, INK } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Geode Guardian Tortoise",
  description:
    "A gentle giant tortoise whose sandstone shell has cracked open into a glowing amethyst geode: gold filigree, tassels, a jewelled collar and floating sparkles, in cel-shaded anime style.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const GOLD = "#ffc93c";
const GOLD_D = "#b9731c";
const IVORY = "#fff0c8";
const GEM_CYAN = "#52e4ff";
const CRYSTALS: [string, string][] = [
  ["#8a55ee", "#dcc0ff"], // amethyst
  ["#2fc4ec", "#bcf6ff"], // aqua
  ["#ee63bd", "#ffcdee"], // rose
];

const SKIN_A = "#79d3b4";
const SKIN_B = "#62c2a6";
const BELLY = "#f3f6c6";

// Shell scutes: four sandstone tones, ring-lit by growth lines, divided by gold seams.
const SCUTE = [cel("#f2dba5"), cel("#e8c88c"), cel("#f7e8c2"), cel("#dfb97b")];
const SCUTE_RING = [cel("#f8e9bf"), cel("#f1d9a4"), cel("#fbf1d4"), cel("#e9c88c")];
const SEAM_GOLD = cel("#ffc93c", "#d98d1e");
const SEAM_INK = cel("#8e5a2a", "#6b3f2a");
const LOW = [cel("#e1b274"), cel("#d8a266"), cel("#e6bf86"), cel("#cf9a5e")];
const GEM_SPECK = [cel("#a8ecff", "#6cc4e6"), cel("#ffc2e6", "#e48cc0"), cel("#d6b8ff", "#a584e8")];
const SHELL = paint((p, _n) => {
  const c = cells(p, 0.23, 5);
  const e = c.d2 - c.d1;
  if (e < 0.045) return SEAM_INK;
  if (e < 0.11) return SEAM_GOLD;
  const k = Math.min(Math.floor(c.id * 4), 3);
  if (e > 0.15) {
    const q = cells(p, 0.06, 31);
    if (q.d1 < 0.16 && q.id > 0.5) return GEM_SPECK[Math.min(Math.floor(q.id * 3), 2)];
  }
  if (p.y < 0.3 + 0.03 * Math.sin(p.x * 30 + p.z * 20)) return LOW[k];
  if (e > 0.17 && Math.floor(c.d1 / 0.16) % 2 === 1) return SCUTE_RING[k];
  return SCUTE[k];
});
const ROCK_BASE = cel(mottle("#a78fc9", "#c8b2e6", { size: 0.06, contrast: 1.2 }));
const ROCK = paint((p, _n) => {
  const c = cells(p, 0.09, 11);
  return c.d2 - c.d1 < 0.07 ? SEAM_GOLD : ROCK_BASE;
});
const PLATE_A = cel("#35bdb4", "#2a8fa8");
const PLATE_B = cel("#4fd2c4", "#37a3b4");
const PLASTRON = cel("#e6c486", "#c1966a");

const SKIN_HEAD = cel(
  furEdge(mottle(SKIN_A, SKIN_B, { size: 0.05, contrast: 0.8 }), BELLY, { level: -0.3, teeth: 0.2, period: 0.03 }),
);
const SKIN_LEG = cel(scales([SKIN_A, "#6ac9ac", "#88dfc4"], "#3f9d8a", { size: 0.05, width: 0.2 }));
const SKIN_PAD = cel("#6bc7aa");

// ---------------------------------------------------------------------------------------------------------------
// Drawings
const gold2 = (d: string) =>
  `<path d="${d}" stroke="#a8661a" stroke-width="4.6"/><path d="${d}" stroke="#ffd04d" stroke-width="2.6"/>`;
const HALF = [
  "M50 40 C42 40 38 30 30 30 C22 30 20 40 27 42 C32 43.5 34 37 30 35",
  "M50 40 C42 40 38 50 30 50 C22 50 20 40 27 38 C32 36.5 34 43 30 45",
  "M26 40 C18 40 14 33 6 35",
  "M22 31 C18 24 12 24 9 19",
  "M22 49 C18 56 12 56 9 61",
  "M46 40 L40 40",
];
const FILIGREE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
  <g>${HALF.map(gold2).join("")}</g>
  <g transform="translate(120,0) scale(-1,1)">${HALF.map(gold2).join("")}</g>
  <path d="M60 11 L75 40 L60 69 L45 40Z" stroke="#a8661a" stroke-width="4.6"/>
  <path d="M60 11 L75 40 L60 69 L45 40Z" stroke="#ffd04d" stroke-width="2.6"/>
  </g>
  <circle cx="60" cy="40" r="8.5" fill="#7be8ff" stroke="#a8661a" stroke-width="2.4"/>
  <circle cx="57.5" cy="37.5" r="2.4" fill="#ffffff"/>
  <circle cx="60" cy="7" r="3.4" fill="#ffd04d" stroke="#a8661a" stroke-width="1.6"/>
  <circle cx="60" cy="73" r="3.4" fill="#ffd04d" stroke="#a8661a" stroke-width="1.6"/>
  <g fill="#ffd04d" stroke="#a8661a" stroke-width="1.4">
   <circle cx="6" cy="35" r="2.8"/><circle cx="114" cy="35" r="2.8"/>
   <circle cx="9" cy="19" r="2.6"/><circle cx="111" cy="19" r="2.6"/>
   <circle cx="9" cy="61" r="2.6"/><circle cx="111" cy="61" r="2.6"/>
  </g></svg>`,
  { size: 600 },
);

// Drawn with its attachment at the bottom: a hanging card shows it upside down, so it reads right side up.
const TASSEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 96">
  <path d="M6 6 Q16 -1 26 6 L22 58 L10 58Z" fill="#35c3c6" stroke="#1d8f9c" stroke-width="1.2"/>
  <path d="M12 8 L13.5 58 M16 5 L16 58 M20 8 L18.5 58" stroke="#a4f3ee" stroke-width="1.7" fill="none"/>
  <rect x="9" y="57" width="14" height="7" rx="2.5" fill="#ffd04d" stroke="#a8661a" stroke-width="1.3"/>
  <circle cx="16" cy="73" r="8.5" fill="#ffd04d" stroke="#a8661a" stroke-width="1.5"/>
  <circle cx="13" cy="70" r="2.4" fill="#fff6c0"/>
  <rect x="9" y="80" width="14" height="5" rx="2" fill="#ffd04d" stroke="#a8661a" stroke-width="1.2"/>
  <rect x="14" y="85" width="4" height="11" fill="#ec5a56"/></svg>`,
  { size: 192 },
);

const TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <path d="M24 48 C13 38 9 24 11 11 C20 21 25 34 24 48Z" fill="#6fd16c" stroke="#2f8a4e" stroke-width="1.6"/>
  <path d="M24 48 C35 38 40 25 37 12 C28 22 22 35 24 48Z" fill="#8be07d" stroke="#2f8a4e" stroke-width="1.6"/>
  <path d="M24 48 C20 36 21 22 24 12 C28 22 28 36 24 48Z" fill="#58c066" stroke="#2f8a4e" stroke-width="1.6"/>
  <g fill="#ff9ccf" stroke="#d1508f" stroke-width="1"><circle cx="24" cy="8" r="3.6"/><circle cx="18.5" cy="11" r="3"/><circle cx="29.5" cy="11" r="3"/></g>
  <circle cx="24" cy="10" r="2.2" fill="#ffe46a"/></svg>`,
  { size: 192 },
);

const STAR = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <path d="M16 0 L19.5 12.5 L32 16 L19.5 19.5 L16 32 L12.5 19.5 L0 16 L12.5 12.5Z" fill="#ffe98a"/>
  <path d="M16 7 L17.5 14.5 L25 16 L17.5 17.5 L16 25 L14.5 17.5 L7 16 L14.5 14.5Z" fill="#ffffff"/></svg>`,
  { size: 96 },
);

const EYE = animeEye({ iris: "#9a5cff", irisLight: "#e6b8ff", irisDark: "#5a2fc0" });

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "crystalTortoise", paintSize: 2048 });
  const rand = rng(42);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // --- Skeleton --------------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.28, -0.26], aim: [0, 0.28, 0.04], role: "spine" });
  const mid = b.joint("spineMid", { parent: hips, at: [0, 0.28, 0.04], aim: [0, 0.28, 0.3], role: "spine" });
  const chest = b.joint("chest", { parent: mid, at: [0, 0.28, 0.3], aim: [0, 0.28, 0.45], role: "spine" });

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.28, 0.32],
      [0, 0.3, 0.55],
      [0, 0.37, 0.7],
      [0, 0.47, 0.8],
    ]),
    { parent: chest, role: "neck", names: ["neck1", "neck2", "neck3"] },
  );
  const head = b.joint("head", { parent: neck.joints[2], at: neck.at(1), dir: [0, -0.04, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.445, 0.9], aim: [0, 0.43, 1.0], role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.26, -0.4],
      [0, 0.22, -0.58],
      [0, 0.17, -0.72],
    ]),
    { parent: hips, role: "tail", names: ["tail1", "tail2", "tail3"] },
  );

  // --- Shell -----------------------------------------------------------------------------------------------------
  const DOME_C = V(0, 0.2, 0);
  const dome = b.part(new THREE.SphereGeometry(1, 28, 11, 0, Math.PI * 2, 0, Math.PI / 2), SHELL, {
    bone: mid,
    at: DOME_C,
    scale: [0.4, 0.4, 0.54],
    name: "dome",
  });
  b.part(new THREE.SphereGeometry(1, 20, 8), PLASTRON, {
    bone: mid,
    at: [0, 0.2, 0],
    scale: [0.37, 0.1, 0.51],
    name: "plastron",
  });
  const domeSurf = b.surface(dome);

  const ellipse = (rx: number, rz: number, y: number, n = 28) =>
    catmull(
      Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        return [rx * Math.sin(a), y, rz * Math.cos(a)];
      }),
      { closed: true },
    );

  // Marginal plates all round the rim, alternating teal.
  const PLATES = 26;
  const plateGeo = new THREE.BoxGeometry(0.1, 0.07, 0.05);
  for (let i = 0; i < PLATES; i++) {
    const a = (i / PLATES) * Math.PI * 2;
    const nx = Math.sin(a) / 0.4;
    const nz = Math.cos(a) / 0.54;
    const out = V(nx, 0, nz).normalize();
    b.part(plateGeo, i % 2 ? PLATE_A : PLATE_B, {
      bone: mid,
      at: [0.405 * Math.sin(a), 0.2, 0.545 * Math.cos(a)],
      dir: out,
      axis: "z",
      up: [0, 1, 0],
      name: `plate${i}`,
    });
  }
  b.sweep(ellipse(0.425, 0.565, 0.24), 0.02, { bone: mid, color: GOLD, name: "rimTop" });
  b.sweep(ellipse(0.42, 0.56, 0.162), 0.013, { bone: mid, color: GOLD_D, name: "rimBottom" });

  // Gold filigree plaques on the four flanks.
  const plaque = (az: number, el: number, dir: [number, number, number], size: [number, number]) => {
    const hit = domeSurf.around(DOME_C).at(az, el);
    if (hit) b.decal(domeSurf, FILIGREE, { at: hit, dir, size, bone: mid });
  };
  plaque(90, 24, [1, 0, 0], [0.3, 0.2]);
  plaque(-90, 24, [-1, 0, 0], [0.3, 0.2]);
  plaque(0, 26, [0, 0.2, 1], [0.27, 0.18]);
  plaque(180, 26, [0, 0.2, -1], [0.27, 0.18]);
  plaque(52, 28, [0.8, 0.3, 0.6], [0.2, 0.135]);
  plaque(-52, 28, [-0.8, 0.3, 0.6], [0.2, 0.135]);
  plaque(128, 28, [0.8, 0.3, -0.6], [0.2, 0.135]);
  plaque(-128, 28, [-0.8, 0.3, -0.6], [0.2, 0.135]);

  // --- The cracked-open geode on top -----------------------------------------------------------------------------
  const CR = V(0, 0.44, -0.03); // crater origin
  b.lathe(
    [
      [0, -0.04],
      [0.32, -0.04],
      [0.32, 0.0],
      [0.265, 0.06],
      [0.22, 0.115],
      [0.205, 0.14],
      [0.178, 0.12],
      [0, 0.12],
    ],
    { at: CR, bone: mid, segments: 10, color: ROCK, name: "geodeMound" },
  );
  const FLOOR = CR.y + 0.12;
  // Agate bands.
  const BANDS: [number, string][] = [
    [0.172, "#fff1cf"],
    [0.146, "#ffd6ef"],
    [0.12, "#e2bfff"],
    [0.094, "#b98aff"],
    [0.066, "#8450e6"],
  ];
  BANDS.forEach(([r, c], i) =>
    b.part(new THREE.CylinderGeometry(r, r, 0.008, 18), c, {
      bone: mid,
      at: [CR.x, FLOOR + 0.004 + i * 0.006, CR.z],
      name: `agate${i}`,
    }),
  );
  // Jagged rim teeth.
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + 0.2;
    const tilt = 0.45 + rand() * 0.2;
    const d = V(Math.sin(a) * Math.sin(tilt), Math.cos(tilt), Math.cos(a) * Math.sin(tilt)).normalize();
    const h = 0.085 + rand() * 0.05;
    const base = V(CR.x + Math.sin(a) * 0.205, CR.y + 0.125, CR.z + Math.cos(a) * 0.205);
    b.part(new THREE.ConeGeometry(0.04 + rand() * 0.012, h, 5), ROCK, {
      bone: mid,
      at: base.clone().addScaledVector(d, h * 0.42),
      dir: d,
      flat: true,
      name: `lipTooth${i}`,
    });
  }

  const crystal = (
    bone: JointRef,
    base: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
    r: number,
    pal: [string, string],
    strength = 0.65,
  ) => {
    const d = dir.clone().normalize();
    const bl = len * 0.68;
    const spin = rand() * 60;
    glow(
      b.lathe(
        [
          [0, 0],
          [r, 0],
          [r * 0.9, bl],
          [0, bl],
        ],
        { at: base, axis: d, segments: 6, spin, color: pal[0], bone, name: "crystal" },
      ),
      strength,
    );
    glow(
      b.lathe(
        [
          [0, 0],
          [r * 0.9, 0],
          [0, len - bl],
        ],
        { at: base.clone().addScaledVector(d, bl), axis: d, segments: 6, spin, color: pal[1], bone, name: "crystalTip" },
      ),
      strength * 1.25,
    );
  };

  // Hero crystal, an inner ring, an outer ring and scattered shards.
  crystal(mid, V(CR.x, FLOOR, CR.z), V(0.04, 1, 0.08), 0.32, 0.058, CRYSTALS[0], 0.7);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const t = 0.3 + rand() * 0.12;
    const d = V(Math.sin(a) * Math.sin(t), Math.cos(t), Math.cos(a) * Math.sin(t));
    crystal(mid, V(CR.x + Math.sin(a) * 0.09, FLOOR, CR.z + Math.cos(a) * 0.09), d, 0.2 + rand() * 0.08, 0.042, CRYSTALS[(i + 1) % 3]);
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.1;
    const t = 0.42 + rand() * 0.2;
    const d = V(Math.sin(a) * Math.sin(t), Math.cos(t), Math.cos(a) * Math.sin(t));
    crystal(mid, V(CR.x + Math.sin(a) * 0.15, FLOOR - 0.005, CR.z + Math.cos(a) * 0.15), d, 0.09 + rand() * 0.05, 0.03, CRYSTALS[(i * 2) % 3]);
  }
  for (let i = 0; i < 5; i++) {
    const a = rand() * Math.PI * 2;
    const rr = 0.05 + rand() * 0.07;
    const t = rand() * 0.5;
    const ba = rand() * Math.PI * 2;
    const d = V(Math.sin(ba) * Math.sin(t), Math.cos(t), Math.cos(ba) * Math.sin(t));
    crystal(mid, V(CR.x + Math.sin(a) * rr, FLOOR, CR.z + Math.cos(a) * rr), d, 0.06 + rand() * 0.06, 0.02, CRYSTALS[i % 3]);
  }
  // Gold lip around the opening.
  b.sweep(
    catmull(
      Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return [CR.x + Math.sin(a) * 0.19, FLOOR + 0.004, CR.z + Math.cos(a) * 0.19];
      }),
      { closed: true },
    ),
    0.011,
    { bone: mid, color: GOLD, name: "geodeLip" },
  );
  // Studs on the rim, a gem on every fourth.
  for (let i = 0; i < PLATES; i++) {
    const a = ((i + 0.5) / PLATES) * Math.PI * 2;
    const at: [number, number, number] = [0.43 * Math.sin(a), 0.243, 0.572 * Math.cos(a)];
    if (i % 4 === 0) glow(b.part(new THREE.OctahedronGeometry(0.026), GEM_CYAN, { bone: mid, at, scale: [1, 0.8, 1], flat: true, name: "rimGem" }), 0.9);
    else b.part(new THREE.SphereGeometry(0.017, 6, 4), GOLD_D, { bone: mid, at, name: "rimStud" });
  }
  // Gold nuggets in the rubble.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.55;
    b.part(new THREE.IcosahedronGeometry(0.02 + rand() * 0.01, 0), GOLD, {
      bone: mid,
      at: [CR.x + Math.sin(a) * 0.19, FLOOR + 0.012, CR.z + Math.cos(a) * 0.19],
      flat: true,
      name: "nugget",
    });
  }

  // Crystal outcrops breaking out through the shell sides.
  const clusters: [number, number, number][] = [
    [62, 36, 3],
    [-62, 36, 3],
    [118, 38, 3],
    [-118, 38, 3],
    [28, 52, 2],
    [-28, 52, 2],
    [152, 48, 2],
    [-152, 48, 2],
  ];
  clusters.forEach(([az, el, count], ci) => {
    const hit = domeSurf.around(DOME_C).at(az, el);
    if (!hit) return;
    for (let k = 0; k < count; k++) {
      const a = (k / count) * Math.PI * 2 + ci;
      const base = hit.local([Math.cos(a) * 0.03 * (k ? 1 : 0), -0.014, Math.sin(a) * 0.03 * (k ? 1 : 0)]);
      const d = hit.dir([Math.cos(a) * 0.45, 1, Math.sin(a) * 0.45]).add(V(0, 0.7, 0));
      crystal(mid, base, d, k ? 0.1 + rand() * 0.05 : 0.17 + rand() * 0.04, k ? 0.026 : 0.038, CRYSTALS[(ci + k) % 3]);
    }
  });

  // Mossy tufts with tiny blossoms.
  const tuftHits = domeSurf
    .scatter(40, {
      rng: rng(3),
      minDist: 0.14,
      filter: (h) => h.n.y > 0.15 && h.at.y < 0.47 && Math.hypot(h.at.x, h.at.z + 0.03) > 0.36,
    })
    .slice(0, 12);
  b.cards(tuftHits, TUFT, { size: [0.075, 0.07], lean: 12, vary: 0.3, rng: rng(5), cross: true, bone: mid });

  // Hanging tassels around the rim.
  const TASSEL_AT = [22, -22, 90, -90, 158, -158];
  const tasselFrames = TASSEL_AT.map((deg) => {
    const a = (deg * Math.PI) / 180;
    return frame([0.425 * Math.sin(a), 0.2, 0.565 * Math.cos(a)], [0, 1, 0]);
  });
  b.cards(tasselFrames, TASSEL, {
    size: [0.095, 0.2],
    lean: 180,
    bone: mid,
    flow: (_f, i) => {
      const a = (TASSEL_AT[i] * Math.PI) / 180;
      return [Math.sin(a), 0, Math.cos(a)];
    },
  });

  // Floating sparkles over the geode.
  const sparkle: [number, number, number][] = [
    [0.14, 0.9, 0.08],
    [-0.16, 0.86, -0.1],
    [0.0, 0.99, -0.05],
    [0.22, 0.8, -0.14],
    [-0.2, 0.93, 0.1],
    [0.06, 0.82, -0.26],
    [-0.28, 0.74, 0.02],
    [0.3, 0.88, 0.12],
  ];
  glow(
    b.cards(
      sparkle.map((p) => frame(p, [0, 1, 0])),
      STAR,
      { size: 0.06, cross: true, flow: [0, 0, 1], vary: 0.4, rng: rng(9), bone: mid },
    ),
    1.2,
  );

  // --- Head ------------------------------------------------------------------------------------------------------
  const SKULL = V(0, 0.5, 0.88);
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), SKIN_HEAD, {
    bone: head,
    at: SKULL,
    scale: [0.12, 0.105, 0.115],
    name: "skull",
  });
  const ell = (bone: JointRef, at: [number, number, number], scale: [number, number, number], color: string | Paint, name: string, seg = 10) =>
    b.part(new THREE.SphereGeometry(1, seg, Math.max(5, seg - 3)), color, { bone, at, scale, name });
  ell(head, [0, 0.475, 0.975], [0.075, 0.045, 0.075], SKIN_HEAD, "snout");
  ell(head, [0, 0.462, 1.032], [0.05, 0.03, 0.05], IVORY, "beakUpper", 8);
  ell(jaw, [0, 0.43, 0.96], [0.066, 0.026, 0.076], SKIN_HEAD, "lowerJaw");
  ell(jaw, [0, 0.428, 1.012], [0.045, 0.016, 0.046], IVORY, "beakLower", 8);
  ell(head, [0, 0.447, 0.97], [0.05, 0.012, 0.07], INK, "mouth", 8);
  for (const s of [1, -1]) {
    ell(head, [s * 0.022, 0.498, 1.05], [0.009, 0.007, 0.009], INK, "nostril", 6);
    // Brow crystals.
    const hit = b.surface(skull).around(SKULL).at(s * 42, 8);
    if (hit) b.decal(skull, EYE, { at: hit, size: [0.076, 0.104], mirror: s > 0, bone: head });
    const brow = b.surface(skull).around(SKULL).at(s * 28, 62);
    if (brow) crystal(head, brow.local([0, -0.012, 0]), V(s * 0.5, 1, -0.7), 0.1, 0.018, CRYSTALS[1], 0.7);
    const brow2 = b.surface(skull).around(SKULL).at(s * 55, 52);
    if (brow2) crystal(head, brow2.local([0, -0.01, 0]), V(s * 1.1, 0.7, -0.5), 0.065, 0.014, CRYSTALS[2], 0.7);
  }
  // Forehead jewel.
  const fh = b.surface(skull).around(SKULL).at(0, 42);
  if (fh) {
    b.extrude(
      [
        [0, -0.03],
        [0.026, 0],
        [0, 0.034],
        [-0.026, 0],
      ],
      { at: fh.local([0, 0.003, 0]), x: [1, 0, 0], y: [0, 0.6, 1], thickness: 0.01, bevel: 0.002, color: GOLD, bone: head, name: "foreheadGold" },
    );
    glow(b.part(new THREE.OctahedronGeometry(0.016), GEM_CYAN, { bone: head, at: fh.local([0, 0.014, 0]), flat: true, name: "foreheadGem" }), 0.9);
  }

  // --- Neck, tail ------------------------------------------------------------------------------------------------
  const neckTube = b.sweep(neck, [0.098, 0.09, 0.086], { color: SKIN_HEAD, name: "neckTube" });
  b.sweep(tail, [0.06, 0.04, 0.012], { color: SKIN_LEG, name: "tailTube", caps: "round" });
  b.rod(tail.at(0.66), tail.at(0.7), 0.045, { color: GOLD, name: "tailRing" });
  crystal(tail.tip ?? hips, V(0, 0.17, -0.74), V(0, 0.55, -1), 0.14, 0.03, CRYSTALS[1], 0.7);
  crystal(tail.tip ?? hips, V(0, 0.17, -0.74), V(0.45, 0.25, -1), 0.09, 0.02, CRYSTALS[0], 0.7);
  crystal(tail.tip ?? hips, V(0, 0.17, -0.74), V(-0.45, 0.25, -1), 0.09, 0.02, CRYSTALS[2], 0.7);

  // Jewelled collar.
  const collar = b.surface(neckTube).loop(neck.at(0.42), { lift: 0.006 });
  b.sweep(collar, 0.016, { color: GOLD, name: "collar" });
  b.sweep(b.surface(neckTube).loop(neck.at(0.48), { lift: 0.004 }), 0.01, { color: GOLD_D, name: "collarCord" });
  const pend = collar.at(0.5);
  b.part(new THREE.OctahedronGeometry(0.034), GOLD, { at: [pend.x, pend.y - 0.03, pend.z + 0.01], scale: [0.9, 1.4, 0.7], bone: neck.joints[0], flat: true, name: "pendant" });
  glow(b.part(new THREE.OctahedronGeometry(0.018), GEM_CYAN, { at: [pend.x, pend.y - 0.03, pend.z + 0.034], scale: [0.9, 1.3, 0.7], bone: neck.joints[0], flat: true, name: "pendantGem" }), 0.9);
  for (let i = 0; i < 7; i++) {
    const p = collar.at(0.04 + 0.13 * i + (i > 3 ? 0.1 : 0));
    ell(neck.joints[0], [p.x, p.y, p.z], [0.014, 0.014, 0.014], i % 2 ? GEM_CYAN : "#ffffff", "bead", 6);
  }

  // --- Legs ------------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const mk = (front: boolean) => {
      const z = front ? 1 : -1;
      const pts = front
        ? [
            [s * 0.3, 0.27, 0.31],
            [s * 0.405, 0.16, 0.385],
            [s * 0.435, 0.075, 0.42],
          ]
        : [
            [s * 0.27, 0.26, -0.3],
            [s * 0.37, 0.15, -0.38],
            [s * 0.4, 0.075, -0.42],
          ];
      const names = front ? [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`] : [`hip${sd}`, `knee${sd}`, `ankle${sd}`];
      const leg = b.chain(front ? `legF${sd}` : `legH${sd}`, catmull(pts), {
        parent: front ? chest : hips,
        role: "leg",
        names,
        contact: [pts[2][0], 0, pts[2][2] + 0.02 * z],
      });
      const tube = b.sweep(leg, [0.085, 0.078, 0.068], { color: SKIN_LEG, name: `leg${front ? "F" : "H"}${sd}` });
      const foot = leg.tip ?? leg.joints[1];
      const fx = pts[2][0];
      const fz = pts[2][2] + 0.03;
      ell(foot, [fx, 0.045, fz], [0.078, 0.045, 0.092], SKIN_PAD, "pad", 10);
      for (let t = 0; t < 3; t++) {
        const dx = (t - 1) * 0.05;
        const base = V(fx + dx * 0.9, 0.035, fz + 0.065);
        const tip = V(fx + dx * 1.5, 0.033, fz + 0.115);
        const toe = b.chain(`toe${front ? "F" : "H"}${sd}${t + 1}`, [base, tip], {
          parent: foot,
          role: "digit",
          names: [`toe${front ? "F" : "H"}${sd}${t + 1}`],
        });
        b.sweep(toe, [0.026, 0.02], { color: SKIN_PAD, sides: 6, name: "toe" });
        b.spike(tip, [dx * 0.6, -0.1, 1], 0.045, 0.017, { bone: toe.joints[0], color: IVORY, sides: 5, name: "claw" });
      }
      // Gold anklet with a gem.
      const ring = b.surface(tube).loop(leg.at(0.8), { lift: 0.005 });
      b.sweep(ring, 0.014, { color: GOLD, name: "anklet" });
      const g = ring.at(0.0);
      glow(b.part(new THREE.OctahedronGeometry(0.02), GEM_CYAN, { at: g, bone: leg.joints[1], flat: true, name: "ankletGem" }), 0.9);
    };
    mk(true);
    mk(false);
  }

  return b.root;
}
