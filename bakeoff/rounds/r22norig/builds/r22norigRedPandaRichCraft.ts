import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { mottle, noise, paint } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A cel-shaded red panda balancing on a moss-capped boulder: one paw raised, ringed tail arched for balance, gold-belled ribbon collar and glowing dendro sprouts.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// palette: every surface colour is a two-tone cel
const RUST = cel("#e0602a");
const RUST_RING = cel("#b43f16");
const RUST_LIGHT = cel("#f2894a");
const DARK = cel("#3b2019", "#241226");
const CREAM = cel("#fff2da", "#f3cfa6");
const EAR_IN = cel("#4a2a22", INK);
const NOSE = cel("#2a1830", INK);
const STONE = cel(mottle("#9097a6", "#737b8c", { size: 0.12, seed: 4 }), "#4f5876");
const MOSS_A = cel("#86cc4c", "#3f9a58");
const MOSS_B = cel("#5ba83e", "#2f7d52");
const GOLD = "#f0c04a";
const RIBBON = cel("#2fa56a", "#1c7a6c");
const CLAW = "#fff0d0";
const GLOWG = "#a6ff72";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "redPanda" });
  const R = rng(11);

  const blob = (
    color: Parameters<typeof b.part>[1],
    scale: [number, number, number],
    at: number[],
    rotation?: number[],
    seg: [number, number] = [10, 7],
  ) =>
    b.part(new THREE.SphereGeometry(1, seg[0], seg[1]), color, {
      at,
      scale,
      rotation: rotation ?? [0, 0, 0],
    });

  // ---------- textures ----------
  const TUFT = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 0 C20 20 28 44 30 64 L2 64 C4 44 12 20 16 0Z" fill="#ffffff"/><path d="M16 10 C17 28 20 46 23 64 L16 64Z" fill="#c9c9c9"/></svg>`,
    { size: 128 },
  );
  const MOSSTEX = svg(
    `<svg viewBox="0 0 48 48"><path d="M8 48 C6 30 8 14 12 4 C16 16 16 34 16 48Z" fill="#5ba83e"/><path d="M18 48 C18 30 22 12 28 0 C30 18 28 34 28 48Z" fill="#86cc4c"/><path d="M30 48 C32 32 36 20 42 10 C42 26 40 38 40 48Z" fill="#3f9a58"/><path d="M20 48 C21 34 24 22 28 10 C27 26 26 38 26 48Z" fill="#b4e870"/></svg>`,
    { size: 128 },
  );
  const LEAF = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 64 C0 44 2 16 16 0 C30 16 32 44 16 64Z" fill="#3f9a58"/><path d="M16 60 C12 40 14 20 16 6 C18 22 20 40 16 60Z" fill="#9be05a"/></svg>`,
    { size: 128 },
  );
  const TEAR = svg(
    `<svg viewBox="0 0 24 64"><path d="M12 0 C22 14 20 44 12 64 C4 44 2 14 12 0Z" fill="#4a2018"/></svg>`,
    { size: 128 },
  );

  // ---------- stone ----------
  const stone = blob(
    paint((p, n) => {
      const m = noise(p, 0.14, 2) * 0.7 + n.y * 0.55;
      if (m > 0.78) return MOSS_A;
      if (m > 0.62) return MOSS_B;
      return STONE;
    }),
    [0.3, 0.1, 0.26],
    [0, 0.1, 0],
    [0, 15, 0],
    [12, 8],
  );
  for (const [x, z, r] of [
    [0.34, 0.12, 0.04],
    [-0.31, -0.15, 0.045],
    [0.12, 0.3, 0.035],
    [-0.2, 0.26, 0.03],
  ] as const) {
    blob(STONE, [r, r * 0.8, r], [x, r * 0.78, z], [0, x * 100, 0], [7, 5]);
  }
  for (const [x, z, sx, sz] of [
    [-0.2, 0.02, 0.1, 0.08],
    [0.2, -0.1, 0.09, 0.07],
    [0.0, 0.12, 0.05, 0.05],
    [-0.1, -0.16, 0.08, 0.06],
  ] as const) {
    blob(MOSS_A, [sx, 0.03, sz], [x, 0.168, z], [0, x * 80, 0], [9, 5]);
  }
  const stoneSkin = b.surface(stone);
  b.cards(stoneSkin.scatter(60, { rng: rng(21), minDist: 0.04, filter: (h) => h.n.y > 0.45 }), MOSSTEX, {
    size: [0.04, 0.05],
    lean: 25,
    vary: 0.35,
    spin: 180,
    rng: rng(22),
    cross: true,
  });
  b.cards(stoneSkin.scatter(10, { rng: rng(23), minDist: 0.08, filter: (h) => h.n.y > 0.5 }), LEAF, {
    size: [0.035, 0.08],
    lean: 40,
    vary: 0.3,
    spin: 180,
    rng: rng(24),
  });
  // dendro glow sprouts and blossoms
  for (const [x, z, k] of [
    [0.24, 0.13, 1],
    [-0.27, 0.0, 0.8],
    [0.1, -0.2, 0.7],
  ] as const) {
    const y = 0.1 + 0.1 * Math.sqrt(Math.max(0.05, 1 - (x / 0.3) ** 2 - (z / 0.26) ** 2)) - 0.015;
    glow(b.spike([x, y, z], [x * 2, 1, z * 2], 0.07 * k, 0.012 * k, GLOWG, { sides: 5 }), 1.4);
    glow(b.spike([x + 0.02, y, z + 0.01], [x * 3, 1.2, z], 0.045 * k, 0.008 * k, "#d8ffa0", { sides: 5 }), 1.4);
    glow(blob("#fff7b0", [0.012, 0.012, 0.012], [x, y + 0.075 * k, z], [0, 0, 0], [6, 4]), 1.6);
  }

  // ---------- body ----------
  const BODY_PAINT = furEdge(RUST, DARK, { level: -0.2, teeth: 0.22, period: 0.034, ink: INK });
  const body = b.capsule([0, 0.38, -0.13], [0, 0.385, 0.1], [0.105, 0.09], BODY_PAINT);
  const bodySkin = b.surface(body);
  b.cards(
    bodySkin.scatter(110, { rng: rng(5), minDist: 0.035, filter: (h) => h.n.y > 0.1 }),
    TUFT,
    { size: [0.026, 0.05], lean: 70, bend: 20, vary: 0.3, rng: rng(6), color: "#f58a48" },
  );
  b.cards(
    bodySkin.scatter(40, { rng: rng(7), minDist: 0.04, filter: (h) => h.n.y < -0.3 }),
    TUFT,
    { size: [0.022, 0.04], lean: 75, vary: 0.3, rng: rng(8), color: "#5a3326" },
  );
  // chest bib-like cream shoulder wedge
  blob(CREAM, [0.05, 0.035, 0.03], [0, 0.31, 0.18], [20, 0, 0], [8, 5]);

  // ---------- legs ----------
  const LEGP = furEdge(RUST, DARK, { by: "position", level: 0.335, teeth: 0.02, period: 0.026, along: [1, 0, 0] });
  const paw = (x: number, y: number, z: number, tilt = 0) => {
    blob(DARK, [0.037, 0.024, 0.05], [x, y, z + 0.01], [tilt, 0, 0], [8, 5]);
    for (const dx of [-0.017, 0, 0.017]) {
      b.spike([x + dx, y - 0.003, z + 0.052], [dx * 0.6, -0.1, 1], 0.02, 0.0045, CLAW, { sides: 4 });
    }
  };
  for (const s of [1, -1]) {
    // hind legs
    blob(RUST, [0.065, 0.085, 0.09], [s * 0.098, 0.345, -0.14], [0, 0, 0], [9, 6]);
    b.capsule([s * 0.095, 0.37, -0.14], [s * 0.09, 0.225, -0.1], [0.04, 0.03], LEGP);
    paw(s * 0.09, 0.205, -0.1);
    // planted front leg (right side); raised left arm below
    if (s < 0) {
      b.capsule([s * 0.078, 0.37, 0.1], [s * 0.082, 0.225, 0.13], [0.04, 0.03], LEGP);
      paw(s * 0.082, 0.2, 0.135);
    }
  }
  // raised left paw, arm flung out for balance
  b.capsule([0.078, 0.37, 0.1], [0.2, 0.44, 0.2], [0.04, 0.03], LEGP);
  blob(DARK, [0.04, 0.03, 0.045], [0.215, 0.452, 0.215], [-20, 30, 0], [8, 6]);
  for (const a of [-0.5, 0, 0.5]) {
    b.spike([0.222 + a * 0.022, 0.452 + 0.012, 0.248], [0.3 + a * 0.4, 0.15, 1], 0.022, 0.0045, CLAW, { sides: 4 });
  }

  // ---------- tail ----------
  const TAILP = paint((_p, _n, s) => {
    if (s[0] > 0.94) return DARK;
    return Math.floor(s[0] * 12) % 2 ? RUST_RING : RUST_LIGHT;
  });
  const tailPath = catmull([
    [0, 0.4, -0.2],
    [0, 0.41, -0.36],
    [0, 0.54, -0.47],
    [0.07, 0.7, -0.46],
    [0.15, 0.82, -0.38],
  ]);
  const tail = b.sweep(tailPath, [0.04, 0.065, 0.078, 0.07, 0.05, 0.026], TAILP, { sides: 8 });
  b.cards(
    b.surface(tail).scatter(70, { rng: rng(9), minDist: 0.035 }),
    TUFT,
    { size: [0.025, 0.05], lean: 70, bend: 20, vary: 0.3, rng: rng(10), color: "#f58a48" },
  );

  // ---------- head ----------
  const HEAD_C = [0, 0.47, 0.27];
  const FACE = paint((p) => {
    const zz = zigzag(p.x / 0.02) * 0.012;
    if (p.y < 0.455 + zz) return CREAM;
    if (Math.abs(p.x) > 0.058 && p.y < 0.495 + zz && p.z > 0.24) return CREAM;
    if (Math.abs(p.x) < 0.02 + 0.01 * zigzag(p.y / 0.02) && p.z > 0.3 && p.y > 0.5) return RUST_LIGHT;
    return RUST;
  });
  const head = blob(FACE, [0.115, 0.09, 0.1], HEAD_C, [0, 0, 0], [14, 10]);
  const skin = b.surface(head);
  const muzzle = blob(CREAM, [0.042, 0.034, 0.05], [0, 0.445, 0.35], [8, 0, 0], [10, 7]);
  blob(NOSE, [0.015, 0.011, 0.012], [0, 0.456, 0.4], [0, 0, 0], [8, 5]);
  b.rod([0, 0.448, 0.4], [0, 0.428, 0.392], 0.003, INK, { sides: 4 });
  for (const s of [1, -1]) {
    b.rod([0, 0.428, 0.392], [s * 0.016, 0.418, 0.382], 0.0025, INK, { sides: 4 });
  }
  void muzzle;

  const EYE = animeEye({ iris: "#e6962a", irisLight: "#ffd36a", blush: false });
  for (const s of [1, -1]) {
    const eye = skin.around(HEAD_C).at(s * 30, 6)!;
    b.decal(skin, EYE, { at: eye, size: [0.04, 0.054], mirror: s > 0 });
    const tear = skin.around(HEAD_C).at(s * 36, -16)!;
    b.decal(skin, TEAR, { at: tear, size: [0.016, 0.052], up: [s * 0.15, 1, 0] });
    const brow = skin.around(HEAD_C).at(s * 26, 28)!;
    b.stick(new THREE.SphereGeometry(0.013, 6, 4), "#fff1d6", brow, {});
    // ears: cream rim, dark inside
    blob(CREAM, [0.046, 0.052, 0.024], [s * 0.074, 0.54, 0.25], [-8, s * 10, -s * 22], [9, 6]);
    blob(EAR_IN, [0.032, 0.038, 0.02], [s * 0.074 - s * 0.003, 0.538, 0.263], [-8, s * 10, -s * 22], [8, 5]);
    // whiskers
    for (const [dy, dz] of [
      [0.012, 0.02],
      [0, 0],
      [-0.012, -0.02],
    ] as const) {
      b.rod([s * 0.03, 0.44 + dy * 0.3, 0.385], [s * 0.13, 0.455 + dy * 2, 0.38 + dz * 2], 0.0016, "#fff6e6", {
        sides: 4,
        caps: "flat",
      });
    }
  }
  b.cards(
    skin.scatter(48, { rng: rng(12), minDist: 0.022, filter: (h) => Math.abs(h.n.x) > 0.55 }),
    TUFT,
    { size: [0.03, 0.045], lean: 62, bend: 15, vary: 0.3, rng: rng(13), color: "#fff1d6" },
  );

  // ---------- collar: ribbon, gold bell and tassel ----------
  const ringPts: number[][] = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    ringPts.push([0.088 * Math.cos(a), 0.435 + 0.082 * Math.sin(a), 0.188]);
  }
  b.sweep(catmull(ringPts, { closed: true }), 0.0085, RIBBON, { sides: 6 });
  blob(GOLD, [0.019, 0.019, 0.019], [0, 0.352, 0.222], [0, 0, 0], [8, 6]);
  b.part(new THREE.TorusGeometry(0.02, 0.004, 5, 10), GOLD, { at: [0, 0.372, 0.208], rotation: [0, 0, 0] });
  b.rod([0, 0.34, 0.222], [0, 0.31, 0.222], 0.004, GOLD, { sides: 5 });
  blob(GOLD, [0.008, 0.012, 0.008], [0, 0.3, 0.222], [0, 0, 0], [6, 4]);
  for (const s of [1, -1]) {
    b.rod([s * 0.004, 0.31, 0.222], [s * 0.012, 0.268, 0.222], [0.003, 0.0015], "#ffe08a", { sides: 4 });
    b.rod([s * 0.03, 0.51, 0.172], [s * 0.07, 0.49, 0.14], [0.01, 0.005], RIBBON, { sides: 4, caps: "flat" });
  }
  b.part(new THREE.TorusGeometry(0.012, 0.004, 5, 8), GOLD, { at: [0, 0.518, 0.176], rotation: [90, 0, 0] });

  void R;
  return b.root;
}
