import * as THREE from "three";
import { createBuilder, type Builder } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Baba Yaga's Hut",
  description: "Slavic folk-art log hut standing on two giant chicken legs, with a carved horse-head ridge, painted shingles and a smoking chimney.",
};

// ---- palette (top level so stage 2 can use the names)
export const LOG = "#8a5a2b";
export const LOG_DARK = "#5e3a1c";
export const LOG_END = "#e0b072";
export const ROOF_A = "#2f7d6d";
export const ROOF_B = "#c8402e";
export const TRIM_RED = "#c8281e";
export const TRIM_BLUE = "#2457a6";
export const CREAM = "#f2e3b8";
export const SUN = "#f6c026";
export const LEG = "#e0a824";
export const LEG_DARK = "#b57a14";
export const TALON = "#4a3b2c";
export const FEATHER = "#a3552a";
export const FEATHER2 = "#d98a3a";
export const STONE = "#8b8b86";
export const STONE_DARK = "#66665f";
export const SMOKE = "#cfd3d6";
export const DOOR = "#7c2a1c";
export const GLASS = "#3a2a4a";
export const PLANK = "#6f4624";

export const REQUESTS = [
  {
    id: "doorCarving", kind: "add", part: "door",
    what: "Carved folk-art door surround: a painted platband arch in TRIM_RED and TRIM_BLUE with scalloped top, iron strap hinges, a ring handle, and a small skull with glowing SUN eyes above the lintel.",
    at: [0, 3.1, 1.36], normal: [0, 0, 1], bone: null, room: [1.2, 1.7, 0.2],
  },
  {
    id: "gableSun", kind: "add", part: "gable",
    what: "Slavic sun emblem in the front gable: a SUN disc with a CREAM ring, 12 triangular rays alternating TRIM_RED and SUN, and a small carved face in the middle.",
    at: [0, 4.75, 1.36], normal: [0, 0, 1], bone: null, room: [1.3, 1.0, 0.2],
  },
  {
    id: "konekDetail", kind: "add", part: "ridgeHorse",
    what: "Details for the carved horse-head (konek) on the front ridge: a mane of five overlapping carved blades in TRIM_RED to SUN, a round eye, nostril, bridle in TRIM_BLUE and a small tassel.",
    at: [0, 5.95, 1.95], normal: [0, 0, 1], bone: null, room: [0.5, 0.8, 1.0],
  },
  {
    id: "windowFrames", kind: "add", part: "windowFront",
    what: "Pair of front windows: carved platbands (TRIM_RED outline, TRIM_BLUE pierced inner trim, CREAM highlights), shutters opened outward with painted flowers, a warm glowing glass pane with a cross mullion. Mirrored on x.",
    at: [0.85, 3.4, 1.34], normal: [0, 0, 1], bone: null, room: [0.9, 0.9, 0.2],
  },
  {
    id: "eaveFringe", kind: "add", part: "pelmet",
    what: "Lace-like carved eave fringe under the front roof edge: a row of pierced pendants and small CREAM discs with TRIM_RED dots, repeating the sun motif.",
    at: [0, 4.0, 1.4], normal: [0, 0, 1], bone: null, room: [3.0, 0.4, 0.3],
  },
  {
    id: "chimneySmoke", kind: "add", part: "chimney",
    what: "Chimney finish: a rooster-topped cap, brick courses in STONE_DARK, and a curling column of SMOKE puffs rising and growing, with a few glowing orange embers.",
    at: [0.7, 5.8, -0.4], normal: [0, 1, 0], bone: null, room: [0.7, 1.8, 0.7],
  },
  {
    id: "herbBundles", kind: "add", part: "pelmet",
    what: "Bundles of dried herbs, mushrooms strings and garlic braids hanging from the side eave on the left, tied with TRIM_RED twine, in muted greens and ochres.",
    at: [-1.3, 4.0, 0.5], normal: [-1, 0, 0], bone: null, room: [0.5, 0.9, 1.6],
  },
  {
    id: "talonsAndSpurs", kind: "add", part: "toe",
    what: "Heavier talon detail on both feet: segmented toe knuckles, dark ridge scutes on top of each toe, and a sharp backward hock spur in TALON colour.",
    at: [0.8, 0.1, 0.5], normal: [0, 1, 0], bone: null, room: [1.0, 0.4, 1.0],
  },
  {
    id: "platformBones", kind: "add", part: "platform",
    what: "Bone and skull trim along the front edge of the platform: small skulls on short stakes at the corners, a row of rib-bone pickets between them in CREAM with dark eye sockets.",
    at: [0, 2.55, 1.55], normal: [0, 0, 1], bone: null, room: [3.0, 0.5, 0.3],
  },
  {
    id: "logPaint", kind: "texture", part: "wallLog",
    what: "Weathered log texture: horizontal grain and ring cracks in LOG_DARK on LOG, moss patches on top faces, darker soot near the chimney side.",
  },
  {
    id: "shingles", kind: "texture", part: "roofBoard",
    what: "Painted scalloped shingle pattern on the roof boards, alternating ROOF_A teal and ROOF_B red rows with CREAM edge lines and small dot rosettes.",
  },
  {
    id: "legScales", kind: "texture", part: "leg",
    what: "Chicken-leg scales: overlapping rounded scutes in LEG and LEG_DARK with pale highlights, wrinkled skin near the joints.",
  },
  {
    id: "doorPaint", kind: "texture", part: "door",
    what: "Folk-art painted door: DOOR red base with TRIM_BLUE and SUN floral vines and a firebird motif, plank seams in dark.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "babaYagaHut" });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, n = 8) => new THREE.CylinderGeometry(r, r, h, n);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // ---------- chicken legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const path = [
      [s * 0.7, 2.05, 0],
      [s * 0.76, 1.45, -0.2],
      [s * 0.8, 0.8, -0.28],
      [s * 0.8, 0.12, 0.05],
    ];
    const leg = b.sweep(path.map((p) => p), [0.15, 0.09], { color: LEG, name: "leg" + side, sides: 8 });
    // thigh feathers
    b.part(sph(0.34, 10, 8), FEATHER, { at: [s * 0.7, 2.0, 0], name: "thigh" });
    for (let r = 0; r < 2; r++)
      for (let k = 0; k < 9; k++) {
        const a = (k / 9) * Math.PI * 2 + r * 0.35;
        const rad = 0.3 - r * 0.04;
        const base = new THREE.Vector3(s * 0.7 + Math.cos(a) * rad, 1.95 - r * 0.2, Math.sin(a) * rad);
        const tip = base.clone().add(new THREE.Vector3(Math.cos(a) * 0.1, -0.5 + r * 0.05, Math.sin(a) * 0.1));
        b.spike(base, tip, null, 0.1, { color: r ? FEATHER2 : FEATHER, name: "feather" });
      }
    // hock knob + spur
    b.part(sph(0.13), LEG_DARK, { at: [s * 0.8, 0.85, -0.3], name: "hock" });
    b.spike([s * 0.8, 0.8, -0.38], [s * 0.8, 0.62, -0.75], null, 0.06, { color: TALON, name: "spur" });
    // scales down the front of the leg
    const crv = leg.curve();
    for (let i = 0; i < 6; i++) {
      const t = 0.18 + i * 0.13;
      const p = crv.at(t);
      b.part(box(0.2, 0.05, 0.12), i % 2 ? LEG_DARK : "#c78f1b", {
        at: [p.x, p.y, p.z + 0.1 - 0.03 * (1 - t)],
        rotation: [-12, 0, 0],
        name: "scute",
      });
    }
    // toes
    const foot = new THREE.Vector3(s * 0.8, 0.09, 0.05);
    b.part(sph(0.13), LEG_DARK, { at: [foot.x, foot.y + 0.02, foot.z], name: "ankle" });
    for (const a of [-38, 0, 38]) {
      const r = (a * Math.PI) / 180;
      const d = new THREE.Vector3(Math.sin(r), 0, Math.cos(r));
      const end = foot.clone().addScaledVector(d, 0.65);
      b.capsule(foot, end, [0.095, 0.07], { color: LEG, name: "toe" });
      b.part(sph(0.085), LEG_DARK, { at: [foot.x + d.x * 0.3, 0.1, foot.z + d.z * 0.3], name: "knuckle" });
      b.spike(end, [d.x, -0.35, d.z], 0.3, 0.075, { color: TALON, name: "talon" });
    }
    const back = foot.clone().add(new THREE.Vector3(0, 0, -0.45));
    b.capsule(foot, back, [0.09, 0.065], { color: LEG, name: "toe" });
    b.spike(back, [0, -0.3, -1], 0.28, 0.07, { color: TALON, name: "talon" });
  }

  // ---------- platform
  b.part(box(3.1, 0.2, 2.9), PLANK, { at: [0, 2.3, 0], name: "platform" });
  b.part(box(3.2, 0.06, 3.0), LOG_DARK, { at: [0, 2.2, 0], name: "platformSkirt" });

  // ---------- log walls
  for (let i = 0; i < 6; i++) {
    const y = 2.56 + i * 0.3;
    for (const z of [1.1, -1.1]) {
      b.part(cyl(0.16, 2.8), i % 2 ? LOG : "#7d4f24", { at: [0, y, z], dir: [1, 0, 0], name: "wallLog" });
      for (const x of [1.4, -1.4]) b.part(cyl(0.125, 0.04), LOG_END, { at: [x, y, z], dir: [1, 0, 0], name: "logEnd" });
    }
    for (const x of [1.2, -1.2]) {
      b.part(cyl(0.16, 2.6), i % 2 ? "#7d4f24" : LOG, { at: [x, y + 0.15, 0], dir: [0, 0, 1], name: "wallLog" });
      for (const z of [1.3, -1.3]) b.part(cyl(0.125, 0.04), LOG_END, { at: [x, y + 0.15, z], dir: [0, 0, 1], name: "logEnd" });
    }
  }
  // inner core to hide gaps
  b.part(box(2.3, 1.8, 2.1), LOG_DARK, { at: [0, 3.35, 0], name: "core" });

  // door (plain panel, details requested)
  b.part(box(0.84, 1.4, 0.06), DOOR, { at: [0, 3.1, 1.3], name: "door" });
  b.part(box(1.0, 0.1, 0.07), TRIM_RED, { at: [0, 3.85, 1.31], name: "doorLintel" });
  for (const s of [1, -1]) b.part(box(0.08, 1.4, 0.07), TRIM_RED, { at: [s * 0.46, 3.1, 1.31], name: "doorJamb" });
  // front windows (plain)
  for (const s of [1, -1]) {
    b.part(box(0.5, 0.5, 0.05), TRIM_BLUE, { at: [s * 0.85, 3.4, 1.29], name: "windowFront" });
    glow(b.part(box(0.36, 0.36, 0.04), "#f7b84a", { at: [s * 0.85, 3.4, 1.32], name: "windowPane" }), 0.8);
  }

  // ---------- gables
  for (const z of [1.25, -1.25]) {
    b.extrude(
      [[-1.45, 0], [1.45, 0], [0, 1.3]],
      { at: [0, 4.2, z], x: [1, 0, 0], thickness: 0.12, color: LOG, name: "gable" },
    );
    b.part(box(1.0, 0.04, 0.04), LOG_DARK, { at: [0, 4.22, z + Math.sign(z) * 0.07], name: "gableSill" });
  }

  // ---------- roof
  const ang = (Math.atan2(1.45, 1.8) * 180) / Math.PI;
  const rowLen = (Math.hypot(1.8, 1.45) / 8) * 1.3;
  for (const s of [1, -1])
    for (let i = 0; i < 8; i++) {
      const t = (i + 0.5) / 8;
      b.part(box(rowLen, 0.07, 3.1), i % 2 ? ROOF_B : ROOF_A, {
        at: [s * 1.8 * (1 - t), 4.1 + 1.45 * t + 0.04, 0],
        rotation: [0, 0, -s * ang],
        name: "roofBoard",
      });
    }
  b.part(cyl(0.11, 3.3, 8), TRIM_RED, { at: [0, 5.6, 0], dir: [0, 0, 1], name: "ridge" });
  // eave lips
  for (const s of [1, -1])
    b.part(cyl(0.06, 3.1, 6), CREAM, { at: [s * 1.86, 4.07, 0], dir: [0, 0, 1], name: "eaveLip" });

  // carved horse heads on the ridge ends
  const horse = [[0, 0], [0.45, 0], [0.5, 0.25], [0.75, 0.5], [0.72, 0.64], [0.45, 0.62], [0.18, 0.45]] as [number, number][];
  for (const f of [1, -1]) {
    b.extrude(horse, {
      at: [0, 5.62, f * 1.55], x: [0, 0, f], thickness: 0.1, bevel: 0.015, smoothing: 1,
      color: ROOF_B, name: "ridgeHorse",
    });
    b.part(sph(0.035, 6, 4), "#1a0f08", { at: [0.07, 6.1, f * 2.0], name: "horseEye" });
    b.part(sph(0.035, 6, 4), "#1a0f08", { at: [-0.07, 6.1, f * 2.0], name: "horseEye" });
  }

  // ---------- eave pelmet
  b.part(box(3.0, 0.14, 0.08), TRIM_RED, { at: [0, 4.17, 1.33], name: "pelmet" });
  for (let i = 0; i < 9; i++)
    b.part(cyl(0.1, 0.05, 10), i % 2 ? CREAM : TRIM_BLUE, {
      at: [-1.2 + i * 0.3, 4.05, 1.33], dir: [0, 0, 1], name: "pelmet",
    });

  // ---------- chimney
  b.part(box(0.45, 1.2, 0.45), STONE, { at: [0.7, 5.0, -0.4], name: "chimney" });
  b.part(box(0.55, 0.1, 0.55), STONE_DARK, { at: [0.7, 5.65, -0.4], name: "chimneyCap" });
  for (let i = 0; i < 4; i++)
    b.part(sph(0.16 + i * 0.05, 8, 6), SMOKE, {
      at: [0.7 + i * 0.14, 6.0 + i * 0.32, -0.4 - i * 0.06], name: "smoke",
    });

  // ---------- small hut-front bits: plank porch step under door
  b.part(box(1.0, 0.08, 0.35), PLANK, { at: [0, 2.44, 1.55], name: "stepBoard" });

  for (const add of STAGE2) add(b);
  return b.root;
}
