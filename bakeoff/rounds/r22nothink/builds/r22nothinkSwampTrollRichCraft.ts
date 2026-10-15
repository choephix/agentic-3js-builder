import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull, polyline } from "../../../../src/path";
import { rng } from "../../../../src/math";
import { grain, mottle, paint, scales, noise, spots, countershade, patches } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Swamp Troll",
  description:
    "A hulking hunch-backed swamp troll with mossy warty hide, tusks, glowing eyes, a bone-and-moss pauldron, a ragged hide kilt and a spiked log club, in chunky hand-painted Blizzard/Warcraft style.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

// ---------- palette ----------
const SKIN = "#5f8f3a";
const SKIN_DK = "#3d6226";
const SKIN_LT = "#9cc652";
const BELLY = "#b6b872";
const MOSS = "#4f8a2a";
const MOSS_LT = "#8fc23c";
const BONE = "#e6d8b0";
const BONE_DK = "#b39d6c";
const IRON = "#5b5f66";
const IRON_DK = "#33363c";
const RUST = "#8a4a22";
const LEATHER = "#7a4a2a";
const LEATHER_DK = "#4a2c18";
const HIDE = "#9a6a3c";
const WOOD = "#7a5230";
const WOOD_DK = "#4a3019";
const GOLD = "#e0b030";
const EYE = "#ffe23a";
const NAIL = "#2c2a1e";
const TONGUE = "#c0485a";
const MUSH = "#d84a3a";
const MUSH_LT = "#f4e6c8";
const RED = "#b3342a";
const TEAL = "#2fa89a";

// ---------- paints ----------
const hideSkin = paint((p, n, s) => {
  const base = mottle(SKIN, SKIN_DK, { size: 0.18, contrast: 0.9, seed: 3 }).at(p, n, s);
  const lit = mottle(base, SKIN_LT, { size: 0.07, contrast: 0.5, seed: 8 });
  const belly = countershade(lit, BELLY, { level: -0.35, soft: 0.25 });
  return belly;
});
const armSkin = paint((p, n, s) => {
  const warty = spots(hideSkin, SKIN_DK, { size: 0.09, amount: 0.22, seed: 5 });
  return warty.at(p, n, s);
});
const scaleSkin = scales([SKIN, SKIN_DK, "#6fa040"], "#33541f", { size: 0.07, width: 0.12, seed: 2 });
const mossy = paint((p, n, s) => {
  const nz = noise(p, 0.12, 11);
  const base = mottle(MOSS, "#35691f", { size: 0.1, contrast: 0.8, seed: 4 });
  return nz > 0.62 ? MOSS_LT : base.at(p, n, s);
});
const woodPaint = grain(WOOD, WOOD_DK, { size: 0.025, axis: "y", seed: 6 });
const leatherPaint = mottle(LEATHER, LEATHER_DK, { size: 0.05, contrast: 0.7, seed: 9 });
const hidePaint = patches(HIDE, ["#6f4a2a", "#c8964e"], { size: 0.2, gap: 0.01, seed: 12 });
const bonePaint = mottle(BONE, BONE_DK, { size: 0.05, contrast: 0.6, seed: 13 });
const ironPaint = mottle(IRON, IRON_DK, { size: 0.05, contrast: 0.7, seed: 14 });

// ---------- textures ----------
const WART_TEX = svg(
  `<svg viewBox="0 0 32 32"><circle cx="16" cy="18" r="11" fill="#7fae48"/><circle cx="13" cy="14" r="4" fill="#b4d874"/><ellipse cx="16" cy="28" rx="10" ry="3" fill="#2b4a18" opacity="0.8"/></svg>`,
  { size: 64 },
);
const GRASS_TEX = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 64 C14 40 6 24 2 4 C12 20 16 34 18 64Z" fill="#6fae33"/><path d="M16 64 C18 36 24 20 30 2 C24 26 20 40 22 64Z" fill="#9fd246"/><path d="M14 64 C15 44 14 30 16 8 C19 30 20 46 20 64Z" fill="#4f8a2a"/></svg>`,
  { size: 128 },
);
const TOOTH_RUNE = svg(
  `<svg viewBox="0 0 64 64"><g fill="none" stroke="#e0b030" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 52 L32 10 L52 52"/><path d="M20 38 H44"/><path d="M32 10 V56"/></g></svg>`,
  { size: 128 },
);
const WAR_PAINT = svg(
  `<svg viewBox="0 0 64 32"><g fill="none" stroke="#b3342a" stroke-width="6" stroke-linecap="round"><path d="M6 6 L28 26"/><path d="M20 4 L40 26"/><path d="M36 4 L58 24"/></g></svg>`,
  { size: 128 },
);
const KILT_PATTERN = svg(
  `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#9a6a3c"/><path d="M0 12H64M0 52H64" stroke="#4a2c18" stroke-width="4"/><g fill="#e0b030"><circle cx="8" cy="32" r="3"/><circle cx="32" cy="32" r="3"/><circle cx="56" cy="32" r="3"/></g><path d="M8 20 L32 44 L56 20" fill="none" stroke="#b3342a" stroke-width="4"/></svg>`,
  { size: 128 },
);
const PUPIL_EYE = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#ffe23a"/><ellipse cx="32" cy="32" rx="7" ry="22" fill="#2a1408"/><circle cx="24" cy="22" r="5" fill="#ffffff"/><path d="M2 20 Q32 4 62 20" fill="none" stroke="#3d6226" stroke-width="5"/></svg>`,
  { size: 128 },
);

// ---------- helpers ----------
function sphere(r: number, w = 10, h = 7) {
  return new THREE.SphereGeometry(r, w, h);
}

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "swampTroll", paintSize: 2048 });
  const R = rng(42);

  // Layout: ~2.7 m tall hunched troll, facing +Z. Feet at y=0.
  // Hips ~1.05, belly centre 1.35, chest 1.75, head 2.25, hunched forward.

  // ===== LEGS =====
  const footPos: Record<number, [number, number, number]> = { 1: [0.34, 0, 0.1], [-1]: [-0.34, 0, 0.1] };
  for (const s of [1, -1]) {
    const f = footPos[s];
    // thigh + calf (bent, chunky)
    const leg = b.sweep(
      catmull([
        [s * 0.3, 1.1, -0.02],
        [s * 0.38, 0.8, 0.08],
        [s * 0.36, 0.45, 0.02],
        [s * 0.34, 0.2, 0.1],
      ]),
      [0.27, 0.2, 0.17, 0.15],
      { color: armSkin, sides: 8 },
    );
    // knee cap
    b.part(sphere(0.19, 8, 6), SKIN_DK, { at: [s * 0.38, 0.72, 0.2], scale: [1, 0.9, 0.8] });
    b.stick(sphere(0.05, 5, 4), SKIN_LT, leg.at(0.4, 0, 0.02));
    // knee wrap strap
    b.sweep(polyline([[s * 0.2, 0.7, 0.05], [s * 0.38, 0.78, 0.3], [s * 0.56, 0.7, 0.1]]), 0.025, { color: LEATHER_DK, sides: 5 });
    // foot: wide bulky with toes
    b.part(new THREE.BoxGeometry(0.34, 0.16, 0.5), hideSkin, { at: [s * 0.34, 0.09, 0.2] });
    b.part(sphere(0.19, 8, 6), SKIN, { at: [s * 0.34, 0.14, 0.07], scale: [1, 0.8, 1] });
    for (let i = -1; i <= 1; i++) {
      const tx = s * 0.34 + i * 0.1;
      b.part(sphere(0.075, 7, 5), SKIN, { at: [tx, 0.08, 0.44], scale: [1, 0.9, 1.2] });
      b.spike([tx, 0.08, 0.5], [0, -0.1, 1], 0.12, 0.04, NAIL, { sides: 5 });
    }
    // ankle bone bangle
    b.rod([f[0] - 0.14, 0.24, f[2]], [f[0] + 0.14, 0.24, f[2]], 0.13, { color: BONE, sides: 8 });
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2;
      b.spike([f[0] + Math.cos(a) * 0.13, 0.24, f[2] + Math.sin(a) * 0.13], [Math.cos(a), 0.2, Math.sin(a)], 0.07, 0.025, BONE_DK, { sides: 5 });
    }
  }

  // ===== PELVIS & KILT =====
  b.part(sphere(0.5, 10, 7), hideSkin, { at: [0, 1.15, -0.05], scale: [1, 0.7, 0.82] });
  // kilt: ragged strips hanging from a belt
  const KILT_Y = 1.18;
  const kiltN = 12;
  for (let i = 0; i < kiltN; i++) {
    const a = (i / kiltN) * Math.PI * 2;
    const x = Math.sin(a) * 0.5;
    const z = Math.cos(a) * 0.42 - 0.04;
    const len = 0.45 + (i % 3) * 0.08 + (z > 0 ? 0.05 : -0.08);
    b.extrude(
      [
        [-0.09, 0],
        [0.09, 0],
        [0.08, -len * 0.7],
        [0.03, -len],
        [-0.02, -len * 0.85],
        [-0.08, -len * 0.95],
      ],
      {
        at: [x, KILT_Y, z],
        x: [Math.cos(a), 0, -Math.sin(a)],
        y: [0, 1, 0],
        thickness: 0.03,
        bevel: 0.006,
        color: i % 2 ? hidePaint : leatherPaint,
      },
    );
  }
  // front loincloth flap with pattern
  b.part(new THREE.PlaneGeometry(0.36, 0.5), "#ffffff", {
    at: [0, 0.88, 0.5],
    dir: [0, 0.1, 1],
    axis: "z",
    texture: KILT_PATTERN,
  });
  b.part(new THREE.PlaneGeometry(0.36, 0.5), "#ffffff", {
    at: [0, 0.88, -0.5],
    dir: [0, 0.1, -1],
    axis: "z",
    texture: KILT_PATTERN,
  });
  // belt
  const belt = b.sweep(
    catmull([[0.5, KILT_Y + 0.02, 0.0], [0.0, KILT_Y + 0.02, 0.44], [-0.5, KILT_Y + 0.02, 0.0], [0.0, KILT_Y + 0.02, -0.5]], { closed: true }),
    [0.055, 0.055],
    { color: leatherPaint, sides: 6 },
  );
  b.along(belt.curve(), 10, (at) => {
    b.stick(sphere(0.03, 5, 4), GOLD, b.surface(belt).nearest(at.at));
  });
  // belt buckle skull
  b.part(sphere(0.11, 8, 6), BONE, { at: [0, KILT_Y + 0.02, 0.47], scale: [1, 1, 0.5] });
  b.part(sphere(0.025, 5, 4), IRON_DK, { at: [0.035, KILT_Y + 0.04, 0.515] });
  b.part(sphere(0.025, 5, 4), IRON_DK, { at: [-0.035, KILT_Y + 0.04, 0.515] });
  b.part(new THREE.BoxGeometry(0.05, 0.035, 0.02), IRON_DK, { at: [0, KILT_Y - 0.03, 0.51] });
  // hanging bone trinkets on kilt
  for (let i = 0; i < 5; i++) {
    const a = -0.9 + i * 0.45;
    const x = Math.sin(a) * 0.46;
    const z = Math.cos(a) * 0.4;
    b.rod([x, KILT_Y - 0.03, z], [x, KILT_Y - 0.24, z + 0.02], 0.02, { color: LEATHER_DK, sides: 4 });
    b.spike([x, KILT_Y - 0.22, z + 0.03], [0, -1, 0], 0.12, 0.035, BONE, { sides: 5 });
  }

  // ===== TORSO =====
  // belly (big round paunch) and chest (barrel) hunched forward
  const torso = b.sweep(
    catmull([
      [0, 1.15, -0.05],
      [0, 1.55, 0.02],
      [0, 1.95, 0.12],
      [0, 2.2, 0.22],
    ]),
    [0.5, 0.62, 0.62, 0.45],
    { color: hideSkin, sides: 10 },
  );
  // belly paunch
  b.part(sphere(0.52, 10, 8), hideSkin, { at: [0, 1.38, 0.2], scale: [1.0, 0.95, 0.85] });
  // belly button wart
  b.part(sphere(0.045, 5, 4), SKIN_DK, { at: [0, 1.36, 0.7] });
  // chest pecs
  for (const s of [1, -1]) {
    b.part(sphere(0.3, 9, 6), hideSkin, { at: [s * 0.3, 1.95, 0.34], scale: [1.1, 0.85, 0.8] });
    b.part(sphere(0.045, 5, 4), SKIN_DK, { at: [s * 0.3, 1.9, 0.62] });
  }
  // rib/scale patch along the back: hump
  b.part(sphere(0.55, 10, 7), scaleSkin, { at: [0, 2.15, -0.28], scale: [1.0, 0.85, 0.8] });
  // back spine ridges
  const spineLine = catmull([[0, 1.5, -0.45], [0, 1.9, -0.62], [0, 2.3, -0.58], [0, 2.55, -0.38]]);
  b.along(spineLine, 7, (at) => {
    b.spike(at.at, [0, 1, -0.5], 0.14 + 0.08 * (1 - Math.abs(at.t - 0.5) * 2), 0.055, BONE_DK, { sides: 5 });
  });
  // warts on belly/back via scatter
  const torsoSurf = b.surface(torso);
  const warts = torsoSurf.scatter(26, { rng: R, minDist: 0.14, filter: (h) => h.n.y > -0.3 });
  for (const h of warts) {
    b.stick(sphere(0.035 + R() * 0.02, 5, 4), SKIN_LT, h);
  }
  // wart cards on belly
  b.cards(
    torsoSurf.scatter(24, { rng: rng(7), minDist: 0.1, filter: (h) => h.n.z > 0.2 }),
    WART_TEX,
    { size: 0.08, lean: 0, rng: rng(8), vary: 0.3 },
  );

  // war-paint stripes on chest
  b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", {
    at: [0, 2.0, 0.66],
    dir: [0, 0.1, 1],
    axis: "z",
    texture: WAR_PAINT,
  });

  // ===== BANDOLIER (leather strap across chest) =====
  const strap = b.sweep(
    catmull([[0.52, 2.35, 0.05], [0.3, 2.0, 0.5], [-0.1, 1.55, 0.62], [-0.5, 1.25, 0.35]]),
    [0.05, 0.05],
    { color: leatherPaint, sides: 4 },
  );
  b.along(strap.curve(), 6, (at) => {
    b.stick(sphere(0.026, 5, 4), GOLD, b.surface(strap).nearest(at.at));
  });
  // bone pouch on strap
  b.part(new THREE.BoxGeometry(0.2, 0.2, 0.1), LEATHER, { at: [-0.1, 1.55, 0.7], rotation: [0, 0, 15] });
  b.part(new THREE.BoxGeometry(0.21, 0.06, 0.11), LEATHER_DK, { at: [-0.08, 1.64, 0.71], rotation: [0, 0, 15] });
  b.part(sphere(0.025, 5, 4), GOLD, { at: [-0.08, 1.6, 0.76] });

  // ===== NECK =====
  b.sweep(catmull([[0, 2.2, 0.15], [0, 2.38, 0.3], [0, 2.5, 0.4]]), [0.3, 0.26, 0.26], { color: armSkin, sides: 8 });

  // ===== HEAD =====
  const HC: [number, number, number] = [0, 2.6, 0.58];
  const skull = b.part(sphere(0.3, 12, 9), hideSkin, { at: HC, scale: [1.0, 0.82, 0.95] });
  // heavy brow ridge
  b.rod([-0.3, HC[1] + 0.1, HC[2] + 0.2], [0.3, HC[1] + 0.1, HC[2] + 0.2], 0.075, { color: SKIN_DK, sides: 7 });
  b.part(sphere(0.1, 6, 4), SKIN_DK, { at: [0.2, HC[1] + 0.1, HC[2] + 0.22], scale: [1.2, 0.8, 1] });
  b.part(sphere(0.1, 6, 4), SKIN_DK, { at: [-0.2, HC[1] + 0.1, HC[2] + 0.22], scale: [1.2, 0.8, 1] });
  // forehead warts
  for (const [x, y, z, r] of [[0.1, 0.22, 0.2, 0.03], [-0.14, 0.2, 0.18, 0.035], [0.0, 0.26, 0.15, 0.028]]) {
    b.part(sphere(r, 5, 4), SKIN_LT, { at: [x, HC[1] + y, HC[2] + z] });
  }
  // eyes: glowing sockets
  for (const s of [1, -1]) {
    b.part(sphere(0.075, 8, 6), SKIN_DK, { at: [s * 0.14, HC[1] + 0.03, HC[2] + 0.24], scale: [1, 0.9, 0.6] });
    glow(
      b.part(new THREE.CircleGeometry(0.058, 12), "#ffffff", {
        at: [s * 0.14, HC[1] + 0.03, HC[2] + 0.275],
        dir: [s * 0.2, 0, 1],
        axis: "z",
        texture: PUPIL_EYE,
      }),
      1.2,
    );
  }
  // nose: flat wide with nostrils
  b.part(sphere(0.085, 7, 5), SKIN, { at: [0, HC[1] - 0.06, HC[2] + 0.3], scale: [1.2, 0.9, 1.1] });
  for (const s of [1, -1]) {
    b.part(sphere(0.025, 5, 4), "#1c2a10", { at: [s * 0.04, HC[1] - 0.07, HC[2] + 0.38] });
  }
  // wart on nose
  b.part(sphere(0.03, 5, 4), SKIN_LT, { at: [0.05, HC[1] - 0.02, HC[2] + 0.37] });
  // massive underbite jaw
  b.part(sphere(0.26, 10, 7), hideSkin, { at: [0, HC[1] - 0.22, HC[2] + 0.12], scale: [1.05, 0.55, 0.95] });
  b.part(new THREE.BoxGeometry(0.46, 0.09, 0.2), SKIN_DK, { at: [0, HC[1] - 0.2, HC[2] + 0.28] });
  // mouth interior
  b.part(new THREE.BoxGeometry(0.4, 0.04, 0.16), "#4a1620", { at: [0, HC[1] - 0.15, HC[2] + 0.28] });
  b.part(new THREE.BoxGeometry(0.2, 0.025, 0.1), TONGUE, { at: [0, HC[1] - 0.17, HC[2] + 0.28] });
  // lower tusks (big, curved up)
  for (const s of [1, -1]) {
    b.sweep(
      catmull([[s * 0.15, HC[1] - 0.2, HC[2] + 0.34], [s * 0.19, HC[1] - 0.12, HC[2] + 0.4], [s * 0.2, HC[1] + 0.02, HC[2] + 0.38]]),
      [0.045, 0.01],
      { color: bonePaint, sides: 6, caps: "point" },
    );
    // small lower teeth row
    for (let i = 0; i < 3; i++) {
      b.spike([s * (0.02 + i * 0.045), HC[1] - 0.16, HC[2] + 0.37], [0, 1, 0.1], 0.04, 0.014, BONE, { sides: 4 });
    }
    // upper small fangs
    b.spike([s * 0.07, HC[1] - 0.1, HC[2] + 0.33], [0, -1, 0.1], 0.05, 0.016, BONE, { sides: 4 });
    // ears: big pointed, swept back
    b.extrude(
      [
        [0, 0],
        [0.22, 0.1],
        [0.42, 0.3, "sharp"],
        [0.22, -0.02],
        [0.1, -0.16],
        [0, -0.12],
      ],
      {
        at: [s * 0.27, HC[1] + 0.02, HC[2] - 0.02],
        x: [s * 0.8, 0.1, -0.6],
        y: [0, 1, 0],
        thickness: 0.035,
        bevel: 0.01,
        smoothing: 1,
        color: SKIN,
      },
    );
    b.extrude(
      [
        [0.04, 0],
        [0.2, 0.09],
        [0.34, 0.24, "sharp"],
        [0.18, 0.0],
        [0.08, -0.1],
      ],
      {
        at: [s * 0.27, HC[1] + 0.02, HC[2] - 0.02],
        x: [s * 0.8, 0.1, -0.6],
        y: [0, 1, 0],
        thickness: 0.045,
        color: "#c9708a",
      },
    );
    // earrings
    b.sweep(
      catmull([[s * 0.4, HC[1] + 0.05, HC[2] - 0.2], [s * 0.45, HC[1] - 0.02, HC[2] - 0.2], [s * 0.4, HC[1] - 0.08, HC[2] - 0.2], [s * 0.36, HC[1] - 0.02, HC[2] - 0.2]], { closed: true }),
      0.012,
      { color: GOLD, sides: 5 },
    );
  }
  // hair: wild moss tuft + bone topknot spikes
  b.part(sphere(0.22, 8, 6), mossy, { at: [0, HC[1] + 0.2, HC[2] - 0.1], scale: [1, 0.55, 1] });
  const hairHits = b.surface(skull).scatter(30, { rng: rng(21), minDist: 0.06, filter: (h) => h.n.y > 0.45 });
  b.cards(hairHits, GRASS_TEX, { size: [0.1, 0.24], lean: 25, bend: 25, vary: 0.35, rng: rng(22), cross: true, flow: [0, -0.2, -1] });
  // little head bones
  for (let i = -1; i <= 1; i++) {
    b.spike([i * 0.1, HC[1] + 0.27, HC[2] - 0.05], [i * 0.3, 1, -0.2], 0.16, 0.025, BONE, { sides: 5 });
  }
  // cheek warts and moss
  for (const s of [1, -1]) {
    b.part(sphere(0.03, 5, 4), SKIN_LT, { at: [s * 0.25, HC[1] - 0.08, HC[2] + 0.2] });
    b.part(sphere(0.022, 5, 4), SKIN_LT, { at: [s * 0.22, HC[1] - 0.14, HC[2] + 0.25] });
  }
  // war paint on cheeks (decals as planes)
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.16, 0.08), "#ffffff", {
      at: [s * 0.2, HC[1] - 0.03, HC[2] + 0.255],
      dir: [s * 0.6, 0, 1],
      axis: "z",
      texture: WAR_PAINT,
    });
  }

  // ===== ARMS =====
  const fistPos: Record<number, [number, number, number]> = { 1: [0.85, 0.62, 0.55], [-1]: [-0.85, 0.5, 0.35] };
  for (const s of [1, -1]) {
    const shoulder: [number, number, number] = [s * 0.68, 2.2, 0.08];
    const elbow: [number, number, number] = [s * 1.0, 1.45, 0.1];
    const wrist = fistPos[s];
    const arm = b.sweep(
      catmull([shoulder, [s * 0.88, 1.85, 0.1], elbow, [s * 0.92, 1.0, 0.35], [wrist[0], wrist[1] + 0.3, wrist[2]]]),
      [0.3, 0.26, 0.23, 0.2, 0.17],
      { color: armSkin, sides: 8 },
    );
    // shoulder ball
    b.part(sphere(0.36, 10, 7), armSkin, { at: shoulder, scale: [1, 0.9, 1] });
    // elbow bump
    b.part(sphere(0.15, 7, 5), SKIN_DK, { at: [s * 1.07, 1.45, -0.04] });
    // bicep/forearm warts
    const armSurf = b.surface(arm);
    for (const h of armSurf.scatter(12, { rng: rng(30 + s), minDist: 0.1 })) {
      b.stick(sphere(0.03, 5, 4), SKIN_LT, h);
    }
    // wrist cuff: iron band w/ rivets
    const cuffC: [number, number, number] = [wrist[0], wrist[1] + 0.33, wrist[2]];
    b.rod([cuffC[0], cuffC[1] + 0.08, cuffC[2]], [cuffC[0], cuffC[1] - 0.08, cuffC[2]], 0.21, { color: ironPaint, sides: 8 });
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      b.part(sphere(0.022, 5, 4), GOLD, { at: [cuffC[0] + Math.cos(a) * 0.21, cuffC[1] + 0.07, cuffC[2] + Math.sin(a) * 0.21] });
    }
    // HAND: massive fist
    const hand: [number, number, number] = [wrist[0], wrist[1] + 0.05, wrist[2] + 0.02];
    b.part(sphere(0.25, 9, 7), armSkin, { at: hand, scale: [1, 0.9, 1.05] });
    // fingers
    for (let i = 0; i < 4; i++) {
      const fx = hand[0] + (i - 1.5) * 0.095;
      b.capsule([fx, hand[1] - 0.02, hand[2] + 0.18], [fx, hand[1] - 0.2, hand[2] + 0.24], [0.052, 0.045], { color: SKIN, sides: 6 });
      b.spike([fx, hand[1] - 0.2, hand[2] + 0.25], [0, -0.7, 0.7], 0.08, 0.035, NAIL, { sides: 5 });
    }
    // thumb
    b.capsule([hand[0] - s * 0.2, hand[1] + 0.02, hand[2] + 0.1], [hand[0] - s * 0.22, hand[1] - 0.12, hand[2] + 0.22], [0.06, 0.05], { color: SKIN, sides: 6 });
    b.spike([hand[0] - s * 0.22, hand[1] - 0.12, hand[2] + 0.23], [0, -0.5, 0.8], 0.08, 0.035, NAIL, { sides: 5 });
    // knuckle bumps
    for (let i = 0; i < 4; i++) {
      b.part(sphere(0.04, 5, 4), SKIN_DK, { at: [hand[0] + (i - 1.5) * 0.095, hand[1] + 0.1, hand[2] + 0.16] });
    }
  }

  // ===== PAULDRON (left shoulder, bone + moss + iron) =====
  {
    const s = 1;
    const sh: [number, number, number] = [s * 0.74, 2.42, 0.06];
    b.lathe(
      [
        [0, 0.0],
        [0.3, 0.0],
        [0.34, 0.06],
        [0.28, 0.16],
        [0.12, 0.24],
        [0, 0.26],
      ],
      { at: sh, axis: [0.5, 1, 0], segments: 10, smoothing: 1, color: ironPaint },
    );
    // rim
    b.sweep(
      catmull(
        Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return [sh[0] + Math.cos(a) * 0.3 * 0.9 - 0.04, sh[1] - 0.06 + Math.cos(a) * 0.12, sh[2] + Math.sin(a) * 0.32] as [number, number, number];
        }),
        { closed: true },
      ),
      0.025,
      { color: GOLD, sides: 5 },
    );
    // bone horns
    for (let i = 0; i < 3; i++) {
      const a = (i - 1) * 0.7;
      b.spike([sh[0] + 0.1, sh[1] + 0.18, sh[2] + Math.sin(a) * 0.2], [0.7, 1, Math.sin(a) * 1.2], 0.34 - Math.abs(i - 1) * 0.07, 0.065, bonePaint, { sides: 6 });
    }
    // moss on top
    b.part(sphere(0.16, 7, 5), mossy, { at: [sh[0] + 0.02, sh[1] + 0.2, sh[2] - 0.12], scale: [1.2, 0.5, 1] });
    b.cards(
      Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return b.surface(b.part(sphere(0.001), MOSS, { at: [sh[0] + Math.cos(a) * 0.1, sh[1] + 0.22, sh[2] + Math.sin(a) * 0.1 - 0.1] })).nearest([sh[0] + Math.cos(a) * 0.1, sh[1] + 0.3, sh[2] + Math.sin(a) * 0.1 - 0.1]);
      }),
      GRASS_TEX,
      { size: [0.08, 0.18], lean: 20, bend: 20, rng: rng(40), vary: 0.3 },
    );
    // rivets
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      b.part(sphere(0.022, 5, 4), GOLD, { at: [sh[0] + Math.cos(a) * 0.27 - 0.03, sh[1] + 0.02 + Math.cos(a) * 0.1, sh[2] + Math.sin(a) * 0.29] });
    }
  }
  // right shoulder: simple fur/hide mantle with bones
  {
    const sh: [number, number, number] = [-0.74, 2.38, 0.06];
    b.part(sphere(0.3, 9, 6), hidePaint, { at: sh, scale: [1.1, 0.55, 1] });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      b.spike([sh[0] + Math.cos(a) * 0.25, sh[1] + 0.02, sh[2] + Math.sin(a) * 0.25], [Math.cos(a), 0.4, Math.sin(a)], 0.2, 0.05, i % 2 ? BONE : BONE_DK, { sides: 5 });
    }
    b.part(sphere(0.12, 6, 4), mossy, { at: [sh[0], sh[1] + 0.12, sh[2]], scale: [1, 0.6, 1] });
    // red rune
    b.part(new THREE.PlaneGeometry(0.16, 0.16), "#ffffff", { at: [sh[0] - 0.2, sh[1] + 0.12, sh[2] + 0.18], dir: [-0.5, 0.5, 1], axis: "z", texture: TOOTH_RUNE });
  }

  // ===== CLUB (right hand -x side... held in +x fist resting on floor) =====
  // Club stands upright beside the left fist (x=+), head on the floor? Rests vertically, base on the floor.
  {
    const hx = 0.85, hz = 0.58;
    // haft
    const club = b.sweep(
      polyline([[hx, 0, hz], [hx + 0.02, 0.9, hz], [hx + 0.05, 1.6, hz - 0.02]]),
      [0.075, 0.1, 0.17],
      { color: woodPaint, sides: 8, caps: "flat" },
    );
    void club;
    // spiked head cap wrapped with iron bands
    for (const [y, r] of [[1.15, 0.12], [1.42, 0.16], [1.68, 0.18]] as const) {
      b.rod([hx + 0.02, y - 0.03, hz], [hx + 0.04, y + 0.03, hz], r + 0.02, { color: ironPaint, sides: 8 });
    }
    b.part(sphere(0.2, 8, 6), WOOD, { at: [hx + 0.06, 1.74, hz - 0.02], scale: [1, 0.8, 1] });
    // spikes (iron)
    const ca: [number, number, number] = [hx + 0.05, 1.5, hz - 0.01];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const lvl = i % 3;
      const y = 1.3 + lvl * 0.2;
      const rr = 0.14 + lvl * 0.015;
      b.spike([ca[0] + Math.cos(a) * rr, y, ca[2] + Math.sin(a) * rr], [Math.cos(a), 0.3, Math.sin(a)], 0.2, 0.04, i % 2 ? IRON : RUST, { sides: 5 });
    }
    b.spike([hx + 0.06, 1.82, hz - 0.02], [0.1, 1, 0], 0.22, 0.05, IRON, { sides: 6 });
    // leather grip wrap + tassel
    b.rod([hx, 0.55, hz], [hx + 0.01, 0.8, hz], 0.095, { color: LEATHER, sides: 8 });
    b.rod([hx, 0.4, hz], [hx, 0.46, hz], 0.1, { color: LEATHER_DK, sides: 8 });
    b.sweep(catmull([[hx - 0.05, 0.5, hz + 0.09], [hx - 0.1, 0.35, hz + 0.12], [hx - 0.1, 0.18, hz + 0.1]]), [0.025, 0.008], { color: RED, sides: 4, caps: "point" });
    // carved runes on the haft
    b.part(new THREE.PlaneGeometry(0.14, 0.14), "#ffffff", { at: [hx + 0.03, 1.0, hz + 0.1], dir: [0, 0, 1], axis: "z", texture: TOOTH_RUNE });
    // base: burl root bumps resting on the floor
    b.part(sphere(0.12, 7, 5), WOOD_DK, { at: [hx, 0.07, hz], scale: [1, 0.7, 1] });
  }

  // ===== BACK-SACK / SKULL TROPHIES =====
  // wooden backpack frame with a hide bag
  b.part(new THREE.BoxGeometry(0.5, 0.45, 0.3), hidePaint, { at: [0, 1.7, -0.78], rotation: [-8, 0, 0] });
  b.part(new THREE.BoxGeometry(0.52, 0.06, 0.32), LEATHER_DK, { at: [0, 1.93, -0.78], rotation: [-8, 0, 0] });
  b.part(sphere(0.04, 5, 4), GOLD, { at: [0, 1.93, -0.63] });
  // dangling skull trophy
  b.part(sphere(0.12, 8, 6), BONE, { at: [0.22, 1.42, -0.72], scale: [1, 1, 1.1] });
  b.part(new THREE.BoxGeometry(0.1, 0.07, 0.1), BONE_DK, { at: [0.22, 1.33, -0.68] });
  for (const s of [1, -1]) {
    b.part(sphere(0.03, 5, 4), IRON_DK, { at: [0.22 + s * 0.045, 1.44, -0.61] });
  }
  b.rod([0.22, 1.54, -0.72], [0.16, 1.7, -0.78], 0.012, { color: LEATHER_DK, sides: 4 });
  // pot of stew strapped on?: iron pot
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.15, 0.06],
      [0.15, 0.16],
      [0.17, 0.18],
      [0.14, 0.18],
      [0.13, 0.14],
      [0, 0.14],
    ],
    { at: [-0.22, 1.5, -0.78], segments: 10, smoothing: 0, color: IRON_DK },
  );
  b.part(sphere(0.12, 8, 4), "#6cc24a", { at: [-0.22, 1.63, -0.78], scale: [1, 0.25, 1] });

  // ===== MOSS & SWAMP DRESSING ON BODY =====
  // moss cape across back
  const mossCape = b.part(sphere(0.38, 9, 6), mossy, { at: [0, 2.35, -0.55], scale: [1.35, 0.4, 0.8] });
  b.cards(
    b.surface(mossCape).scatter(30, { rng: rng(50), minDist: 0.08, filter: (h) => h.n.y > 0.2 }),
    GRASS_TEX,
    { size: [0.1, 0.22], lean: 30, bend: 30, vary: 0.35, rng: rng(51), flow: [0, -0.2, -1], cross: true },
  );
  // hanging moss drips from belly
  b.cards(
    Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return b.surface(torso).nearest([Math.sin(a) * 0.9, 1.1, Math.cos(a) * 0.9]);
    }),
    GRASS_TEX,
    { size: [0.07, 0.18], lean: 180, flow: [0, 0, 1] },
  );

  // mushrooms growing from the hump and shoulder
  const mushSpots = [
    [0.25, 2.55, -0.55, 0.1],
    [-0.15, 2.6, -0.45, 0.14],
    [0.5, 2.48, -0.2, 0.08],
    [-0.5, 2.58, -0.1, 0.09],
  ] as const;
  for (const [x, y, z, r] of mushSpots) {
    b.rod([x, y - 0.04, z], [x + 0.01, y + r, z], r * 0.28, { color: MUSH_LT, sides: 6 });
    b.part(sphere(r, 8, 5), MUSH, { at: [x + 0.01, y + r, z], scale: [1, 0.55, 1] });
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + x;
      b.part(sphere(r * 0.16, 4, 3), MUSH_LT, { at: [x + 0.01 + Math.cos(a) * r * 0.55, y + r + r * 0.38, z + Math.sin(a) * r * 0.55] });
    }
  }
  // teal glowing swamp fungus
  for (const [x, y, z] of [[-0.9, 1.9, 0.18], [1.05, 1.62, -0.16], [0.4, 1.0, 0.62]] as const) {
    glow(b.part(sphere(0.045, 6, 4), TEAL, { at: [x, y, z], scale: [1, 0.6, 1] }), 1.3);
    b.rod([x, y - 0.06, z], [x, y - 0.01, z], 0.012, { color: BONE, sides: 4 });
  }

  // ===== TAIL-ISH: no tail; add belly-lower rear rump moss =====
  b.part(sphere(0.3, 8, 6), hideSkin, { at: [0, 1.0, -0.4], scale: [1.4, 0.8, 0.8] });

  // ===== GOLD COIN TRINKETS =====
  for (let i = 0; i < 3; i++) {
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.01, 8), GOLD, {
      at: [0.1 + i * 0.12, 1.15, 0.5 - i * 0.01],
      rotation: [80, 0, 0],
    });
  }

  // ===== SWAMP MUD BASE SPLATTERS on feet/ankles (low) =====
  for (const s of [1, -1]) {
    b.part(sphere(0.1, 6, 4), "#4a3a22", { at: [s * 0.4, 0.05, 0.38], scale: [1.4, 0.4, 1] });
    b.part(sphere(0.07, 6, 4), "#3a2c18", { at: [s * 0.18, 0.04, 0.3], scale: [1.2, 0.4, 1] });
  }

  return b.root;
}
