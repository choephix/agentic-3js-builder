import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { cells, mottle, noise, paint, spots } from "../src/paint";
import { svg } from "../src/texture";
import { animeEye, cel, furEdge, inkLines } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Giant Pacific Octopus",
  description:
    "A giant Pacific octopus sprawled over a cracked, mossy rock with its eight arms draped down to the floor. Cel-shaded coral mantle with big amber anime eyes, a gold collar and band with crimson tassels, gold-banded arms with painted suckers, and glowing crystals and gold filigree on the stone.",
  style: "Genshin/anime mix",
  commit: "b816db2",
};

const DEG = Math.PI / 180;

// Flat colour strings; each is shaded once where it is used.
const CORAL = "#ff7d5c";
const CORAL_LIGHT = "#ffb49a";
const CRIMSON = "#c8415f";
const CREAM = "#fff3e2";
const PIT = "#7a2740";
const SUCKER_RIM = "#fff1ea";
const GOLD = "#ffd66b";
const GOLD_DARK = "#c9852c";
const INK_RIM = "#3a1a2e";
const CRYSTAL = "#7ff3ff";
const MOSS = "#8ed66e";
const MOSS_DEEP = "#4f9a5c";
const ROCK_A = "#b4c4d6";
const ROCK_B = "#8ea2b8";
const ROCK_CRACK = "#4a5668";

// Cel materials. Each colour string is wrapped in cel once; nested paints are never cel'd twice.
const MANTLE = inkLines(
  cel(
    furEdge(spots(CORAL, CRIMSON, { size: 0.1, amount: 0.32, seed: 4 }), CREAM, {
      by: "position",
      axis: [0, 1, 0],
      level: 0.68,
      teeth: 0.035,
      period: 0.03,
    }),
  ),
  { levels: [0], axis: [0, 0, 1], width: 0.1, ink: INK_RIM },
);
const CORAL_CEL = cel(CORAL);
const CREAM_CEL = cel(CREAM, "#f1cdb6");
const FUNNEL = cel("#ef6a52");
const BEAK = cel("#4a2c58");
const GOLD_CEL = cel(GOLD, "#d89a3a");
const CRIMSON_CEL = cel(CRIMSON);
const PEBBLE = cel("#a6adb8");
const BARNACLE = cel("#f1e7d6");
const SHELL = cel("#ffe2b8", "#e7b98f");
const ROCK = cel(
  paint((p, n) => {
    if (n.y > 0.5 && noise(p, 0.12, 5) > 0.6) return noise(p, 0.05, 8) > 0.5 ? MOSS : MOSS_DEEP;
    const c = cells(p, 0.16);
    return c.d2 - c.d1 < 0.09 ? ROCK_CRACK : mottle(ROCK_A, ROCK_B, { size: 0.16, contrast: 0.5, seed: 9 });
  }),
);

const EYE = animeEye({ iris: "#f5a623", irisLight: "#ffd977", irisDark: "#a8501c", blush: "#ff8fa8" });

// A gold filigree roundel: rings, a dotted ring, eight curls and a boss.
const CURLS = Array.from(
  { length: 8 },
  (_, i) => `<path transform="rotate(${i * 45} 50 50)" d="M50 12 C58 4 70 8 68 18 C66 25 57 24 58 17"/>`,
).join("");
const FILIGREE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#ffd45c" stroke-width="3" stroke-linecap="round"><circle cx="50" cy="50" r="46"/><circle cx="50" cy="50" r="33" stroke-dasharray="2 4"/>${CURLS}<circle cx="50" cy="50" r="9"/></g></svg>`,
  { size: 512 },
);

// Piecewise-linear profile over t in [0, 1].
function keys(pairs: [number, number][]): (t: number) => number {
  return (t) => {
    if (t <= pairs[0][0]) return pairs[0][1];
    for (let i = 1; i < pairs.length; i++) {
      const [t0, r0] = pairs[i - 1];
      const [t1, r1] = pairs[i];
      if (t <= t1) return r0 + ((r1 - r0) * (t - t0)) / (t1 - t0);
    }
    return pairs[pairs.length - 1][1];
  };
}

// Arc lengths (metres from the crown) where gold bands sit on each arm.
const BANDS = [0.3, 0.64, 0.98];
const SUCKER_SPACING = 0.044;
// Three rows of suckers down the arm: two flanks and the belly. Alternate rows are staggered.
const SUCKER_ROWS = [
  { deg: 122, off: 0 },
  { deg: 180, off: SUCKER_SPACING / 2 },
  { deg: 238, off: 0 },
];

// Arm colour: coral with a paler underside, painted sucker rows, and three gold bands.
// s = [t, deg]; t is converted to metres of arm for the bands and sucker spacing.
function armPaint(len: number, rOf: (t: number) => number) {
  return cel(
    paint((p, _n, s) => {
      const a = s[0] * len;
      const deg = s[1];
      const r = rOf(s[0]);
      for (const g of BANDS) {
        const d = Math.abs(a - g);
        if (d < 0.022) return d < 0.007 ? GOLD_DARK : GOLD;
      }
      for (const row of SUCKER_ROWS) {
        const k = Math.round((a - row.off) / SUCKER_SPACING);
        const da = a - (k * SUCKER_SPACING + row.off);
        const dRow = ((((deg - row.deg + 180) % 360) + 360) % 360) - 180;
        const dm = Math.hypot(da, dRow * DEG * r);
        const rs = Math.min(0.015, 0.45 * r);
        if (dm < rs) return dm < rs * 0.5 ? PIT : SUCKER_RIM;
      }
      const belly = (((deg % 360) + 360) % 360) - 180;
      if (Math.abs(belly) < 70) return CORAL_LIGHT;
      return noise(p, 0.045, 11) > 0.76 ? CRIMSON : CORAL;
    }),
  );
}

// A boulder: an ellipsoid-ish lump with a flat base on y = 0, built in model space with smooth bumps.
function rockGeometry() {
  const g = new THREE.IcosahedronGeometry(1, 3);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const bump =
      1 + 0.12 * Math.sin(3.1 * x + 1.3 * z) * Math.cos(2.2 * y - 0.7 * x) + 0.05 * Math.sin(6.7 * x * y + 4.9 * z);
    pos.setXYZ(i, x * 0.5 * bump, Math.max(0, 0.25 + y * 0.25 * bump), z * 0.42 * bump);
  }
  g.computeVertexNormals();
  return g;
}

// Eight arms, azimuth phi from +Z (+X is the creature's left). Each arm drapes over the rock flank, then
// lies on the floor with its tip curled up. `sway` bows it sideways along the tangent.
const ARM_PHI = [-166, -124, -74, -30, 30, 74, 124, 166];
const ARM_SWAY = [0.8, -0.5, 0.6, -0.3, 0.3, -0.6, 0.5, -0.8];
function armPoints(phi: number, sway: number): number[][] {
  const s = Math.sin(phi * DEG);
  const c = Math.cos(phi * DEG);
  const P = (r: number, y: number, w: number) => [r * s + w * c, y, r * c - w * s];
  return [
    P(0.1, 0.56, 0),
    P(0.3, 0.52, sway * 0.03),
    P(0.52, 0.42, sway * 0.1),
    P(0.78, 0.13, sway * 0.16),
    P(1.02, 0.05, sway * 0.18),
    P(1.3, 0.04, sway * 0.14),
    P(1.46, 0.1, sway * 0.1),
  ];
}
const ARM_RADIUS = keys([
  [0, 0.075],
  [0.12, 0.065],
  [0.4, 0.048],
  [0.75, 0.03],
  [1, 0.02],
]);

const MANTLE_RADIUS = keys([
  [0, 0.07],
  [0.1, 0.15],
  [0.35, 0.21],
  [0.6, 0.2],
  [0.8, 0.17],
  [0.92, 0.13],
  [1, 0.07],
]);

export default function build() {
  const b = createBuilder({ name: "giantPacificOctopusHaiku", paintSize: 2048 });

  // Skeleton: body at the crown, mantle chain up, eight arm chains out, beak under the crown.
  const body = b.joint("body", { at: [0, 0.56, 0], role: "spine" });
  const mantle = b.chain(
    "mantle",
    catmull([
      [0, 0.56, 0],
      [0, 0.78, 0.01],
      [0, 0.98, -0.01],
      [0, 1.12, -0.05],
    ]),
    { parent: body, names: ["mantleLo", "mantleMid", "mantleHi"], role: "head" },
  );
  const beak = b.joint("beak", { parent: body, at: [0, 0.56, 0], aim: [0, 0.44, 0.06] });
  const jaw = b.joint("jaw", { parent: body, at: [0, 0.555, 0.01], aim: [0, 0.42, 0.04], role: "jaw" });

  const arms = ARM_PHI.map((phi, i) => {
    const path = catmull(armPoints(phi, ARM_SWAY[i]));
    const chain = b.chain(`arm${i + 1}`, path, {
      parent: body,
      names: Array.from({ length: 7 }, (_, j) => `arm${i + 1}_${j + 1}`),
      role: "tentacle",
    });
    return { chain, len: path.length };
  });

  // Hub, beak.
  b.part(new THREE.SphereGeometry(0.1, 14, 10), CORAL_CEL, { bone: body, at: [0, 0.56, 0], scale: [1, 0.7, 1] });
  b.spike(beak, [0, -1, 0.4], 0.055, 0.03, { color: BEAK });
  b.spike(jaw, [0, -1, 0.25], 0.04, 0.022, { color: BEAK });

  for (const { chain, len } of arms) {
    b.sweep(chain, ARM_RADIUS, {
      color: armPaint(len, ARM_RADIUS),
      caps: { start: "round", end: "point" },
    });
  }

  // Mantle: a bulb along its chain, with a funnel at the front.
  const mantleSweep = b.sweep(mantle, MANTLE_RADIUS, { color: MANTLE });
  const mantleSkin = b.surface(mantleSweep);
  b.sweep(
    catmull([
      [0, 0.74, 0.1],
      [0, 0.7, 0.22],
      [0, 0.675, 0.27],
    ]),
    [0.05, 0.03],
    { color: FUNNEL, bone: mantle, caps: { start: "round", end: "flat" } },
  );
  b.decal(mantleSkin, FILIGREE, {
    at: mantleSkin.around([0, 0.9, 0]).at(0, 30)!,
    size: [0.14, 0.14],
  });

  // Papillae: small warm warts scattered over the mantle, kept off the eye area.
  const WART = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="13" fill="#ffc2ad" stroke="#b8344f" stroke-width="3"/><circle cx="12" cy="12" r="3" fill="#fff3e6"/></svg>`,
    { size: 64 },
  );
  b.cards(
    mantleSkin.scatter(70, { rng: rng(5), minDist: 0.04, filter: (h) => !(h.at.z > 0.1 && h.at.y > 0.7 && h.at.y < 0.92) }),
    WART,
    { size: 0.03, lean: 0, vary: 0.3, rng: rng(6) },
  );

  // Big anime eyes: a cream eyeball stuck on the mantle with the iris drawing on its face.
  for (const s of [1, -1]) {
    const hit = mantleSkin.around([0, 0.8, 0]).at(s * 42, 4);
    if (!hit) throw new Error("eye hit missed the mantle");
    const ball = b.stick(new THREE.SphereGeometry(0.085, 12, 9), CREAM_CEL, hit, { embed: 0.35 });
    const face = b.surface(ball).around().at(s * 40, 0);
    if (!face) throw new Error("eye face missed");
    b.decal(b.surface(ball), EYE, { at: face, size: [0.13, 0.18], mirror: s > 0 });
  }

  // Gold collar at the base of the mantle and a thinner band above the eyes, each with beads.
  const collar = mantleSkin.loop([0, 0.64, 0], { lift: 0.012 });
  b.sweep(collar, 0.016, { color: GOLD_CEL });
  b.along(collar, 18, (at) => b.part(new THREE.SphereGeometry(0.018, 6, 4), GOLD_CEL, { at }));
  const band = mantleSkin.loop([0, 0.94, 0], { lift: 0.01 });
  b.sweep(band, 0.01, { color: GOLD_CEL });
  b.along(band, 12, (at) => b.part(new THREE.SphereGeometry(0.011, 6, 4), GOLD_CEL, { at }));

  // Crimson-and-gold tassels hanging from the collar.
  for (let i = 0; i < 7; i++) {
    const q = collar.at((i + 0.5) / 7);
    const len = Math.hypot(q.x, q.z);
    const ox = q.x / len;
    const oz = q.z / len;
    const top: [number, number, number] = [q.x + ox * 0.024, q.y, q.z + oz * 0.024];
    const mid: [number, number, number] = [q.x + ox * 0.05, q.y - 0.06, q.z + oz * 0.05];
    const tip: [number, number, number] = [q.x + ox * 0.055, q.y - 0.12, q.z + oz * 0.055];
    b.sweep(catmull([top, mid, tip]), [0.009, 0.005], { color: GOLD_CEL });
    b.spike(tip, [0, -1, 0], 0.05, 0.02, { color: CRIMSON_CEL });
  }

  // Rock: a cracked boulder with glowing crystal clusters, a gold filigree roundel and barnacles.
  const rock = b.part(rockGeometry(), ROCK, { bone: body, at: [0, 0, 0], flat: true });
  const rockSkin = b.surface(rock);
  b.decal(rockSkin, FILIGREE, {
    at: rockSkin.around([0, 0.25, 0]).at(0, 12)!,
    size: [0.3, 0.3],
  });
  const CRYSTALS: [number, number, number][] = [
    [58, 24, 0.32],
    [46, 42, 0.2],
    [-62, 22, 0.3],
    [-50, 40, 0.18],
    [150, 16, 0.24],
    [-142, 12, 0.18],
  ];
  for (const [az, el, h] of CRYSTALS) {
    const hit = rockSkin.around([0, 0.25, 0]).at(az, el);
    if (!hit) throw new Error("crystal hit missed the rock");
    glow(b.stick(new THREE.ConeGeometry(0.05, h, 6), CRYSTAL, hit, { embed: 0.3 }), 1.3);
  }
  for (const h of rockSkin.scatter(40, { rng: rng(21), minDist: 0.07, filter: (x) => x.n.y > -0.1 })) {
    b.stick(new THREE.ConeGeometry(0.02, 0.03, 6), BARNACLE, h, { embed: 0.3 });
  }

  // A glowing rune circle on the floor round the rock: the water-magic motif.
  const GLYPHS = Array.from(
    { length: 8 },
    (_, i) => `<path transform="rotate(${i * 45} 50 50)" d="M50 3 L56 13 L44 13 Z"/>`,
  ).join("");
  const RUNE = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#8ff8ff" stroke-width="2.4" stroke-linecap="round"><circle cx="50" cy="50" r="48"/><circle cx="50" cy="50" r="40"/><circle cx="50" cy="50" r="30" stroke-dasharray="6 5"/>${GLYPHS}</g></svg>`,
    { size: 512 },
  );
  glow(b.part(new THREE.CircleGeometry(0.85, 48), "#ffffff", { bone: body, at: [0, 0.003, 0], rotation: [-90, 0, 0], texture: RUNE }), 1.2);

  // Floor: pebbles around the rock and a conch shell lying in front of it.
  const PEBBLES: [number, number, number][] = [
    [0, 0.95, 0.09],
    [100, 0.85, 0.07],
    [-98, 0.9, 0.08],
    [178, 0.8, 0.06],
    [-168, 0.95, 0.07],
  ];
  for (const [az, r, sc] of PEBBLES) {
    b.part(new THREE.SphereGeometry(sc, 8, 6), PEBBLE, {
      bone: body,
      at: [r * Math.sin(az * DEG), sc * 0.45, r * Math.cos(az * DEG)],
      scale: [1.25, 0.6, 1],
    });
  }
  b.lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.07, 0.02],
      [0.05, 0.06],
      [0.035, 0.11],
      [0.015, 0.15],
      [0, 0.17],
    ],
    { at: [-0.22, 0.07, 0.92], axis: [0, 0, 1], segments: 10, smoothing: 1, color: SHELL, bone: body },
  );

  return b.root;
}
