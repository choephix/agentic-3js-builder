import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import type { Spot } from "../src/frame";
import { rng } from "../src/math";
import { bezier } from "../src/path";
import { countershade, paint, scales } from "../src/paint";
import { svg } from "../src/texture";
import { animeEye, cel, inkLines } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Phoenix",
  description:
    "A standing phoenix with its wings spread wide. Flame plumage shades from gold through orange and red to rose, a gold filigree collar hangs tassels, a chest medallion holds a glowing core, and flame streamers trail from the crest and tail.",
  style: "Genshin Impact",
  commit: "b816db2",
};

// Palette: bright, saturated, warm, with one cool teal accent.
const GOLD = "#ffd45a";
const AMBER = "#ffa53a";
const ORANGE = "#ff8a2a";
const RED = "#e8452e";
const ROSE = "#c42c6e";
const CREAM = "#fff1cf";
const BEAK = "#ffc94d";
const TEAL = "#3fd6c8";
const GEM = "#ffe27a";

// Toon-shaded paints. Each cel() is applied once, to the outermost paint.
const PLUME = cel(countershade(scales(ORANGE, RED, { size: 0.07, width: 0.16 }), GOLD, { level: -0.2, soft: 0.3 }));
const FLAME = cel(paint((_p, _n, s) => (s[0] < 0.3 ? GOLD : s[0] < 0.62 ? ORANGE : s[0] < 0.86 ? RED : ROSE)));
const GOLD_C = cel(GOLD);
const LEG = cel(scales(GOLD, AMBER, { size: 0.03, width: 0.2 }));
const CHEST = cel(scales(GOLD, AMBER, { size: 0.04, width: 0.2 }));
const HEAD = cel(inkLines(countershade(ORANGE, CREAM, { level: 0.25 }), { levels: [0.1], axis: [0, 0, 1], width: 0.08 }));
const BEAK_C = cel(BEAK, "#d9782e");
const TALON = cel("#f0a040", "#b8602a");
const TEAL_C = cel(TEAL);

// Feather cards: one drawing per card, root at the bottom edge.
const FEATHER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 64">
<defs><linearGradient id="fg" x1="0" y1="1" x2="0" y2="0">
<stop offset="0" stop-color="#ffe27a"/><stop offset="0.38" stop-color="#ffa53a"/>
<stop offset="0.7" stop-color="#ec4a2c"/><stop offset="1" stop-color="#b8286e"/></linearGradient></defs>
<path d="M20 63 C8 50 4 32 8 16 C10 8 16 3 20 1 C24 3 30 8 32 16 C36 32 32 50 20 63 Z" fill="url(#fg)" stroke="#4a0f26" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M20 60 L20 9" stroke="#fff3c0" stroke-width="1.3" fill="none" opacity="0.9"/>
<g stroke="#ffeeb0" stroke-width="1" fill="none" opacity="0.5"><path d="M20 48 L12 39 M20 48 L28 39 M20 35 L10 26 M20 35 L30 26 M20 22 L13 15 M20 22 L27 15"/></g>
</svg>`;

const PRIMARY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 96">
<defs><linearGradient id="pg" x1="0" y1="1" x2="0" y2="0">
<stop offset="0" stop-color="#ffe27a"/><stop offset="0.35" stop-color="#ffab3a"/>
<stop offset="0.7" stop-color="#f0502c"/><stop offset="1" stop-color="#9e1f5e"/></linearGradient></defs>
<path d="M20 95 C6 82 3 60 7 44 C9 34 5 28 9 20 C12 13 16 8 20 1 C23 9 27 13 31 20 C35 28 31 34 33 44 C37 60 34 82 20 95 Z" fill="url(#pg)" stroke="#4a0f26" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M20 92 Q15 62 20 30 Q25 62 20 92" fill="#ffd45a" opacity="0.55"/>
<path d="M20 92 L20 6" stroke="#fff3c0" stroke-width="1.3" fill="none" opacity="0.9"/>
<g stroke="#ffe9a6" stroke-width="1" fill="none" opacity="0.45"><path d="M20 70 L9 60 M20 70 L31 60 M20 52 L8 42 M20 52 L32 42 M20 34 L12 25 M20 34 L28 25"/></g>
</svg>`;

// Hanging tassel. The drawing's bottom edge is the attachment, so the knot sits there.
const TASSEL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 64">
<rect x="3" y="57" width="10" height="7" rx="2" fill="#ffd45a" stroke="#6b3d0c" stroke-width="1"/>
<path d="M8 57 L8 48" stroke="#6b3d0c" stroke-width="1.5"/>
<circle cx="8" cy="44" r="3.2" fill="#3fd6c8" stroke="#1d4a52" stroke-width="1"/>
<g stroke="#ffd45a" stroke-width="1.5" fill="none"><path d="M8 40 L5 4"/><path d="M8 40 L6.5 2"/><path d="M8 40 L8 1"/><path d="M8 40 L9.5 2"/><path d="M8 40 L11 4"/></g>
<g stroke="#ff8a2a" stroke-width="1" fill="none" opacity="0.8"><path d="M7 36 L5.5 6"/><path d="M9 36 L10.5 6"/></g>
</svg>`;

// Chest medallion: gold ring, teal studs, rose field and a flame core.
const MEDAL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<circle cx="32" cy="32" r="30" fill="#b8781e" stroke="#4a2506" stroke-width="2"/>
<circle cx="32" cy="32" r="25" fill="#ffd45a" stroke="#8a4d10" stroke-width="1.5"/>
<circle cx="32" cy="32" r="18" fill="#c42c6e" stroke="#5a1430" stroke-width="1.5"/>
<g fill="#3fd6c8" stroke="#1d4a52" stroke-width="0.8">
<circle cx="59.5" cy="32" r="2.2"/><circle cx="51.4" cy="51.4" r="2.2"/><circle cx="32" cy="59.5" r="2.2"/><circle cx="12.6" cy="51.4" r="2.2"/>
<circle cx="4.5" cy="32" r="2.2"/><circle cx="12.6" cy="12.6" r="2.2"/><circle cx="32" cy="4.5" r="2.2"/><circle cx="51.4" cy="12.6" r="2.2"/>
</g>
<path d="M32 20 C26 28 26 36 32 44 C38 36 38 28 32 20 Z" fill="#ffae2a" stroke="#5a1430" stroke-width="1.2"/>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const FEATHER = svg(FEATHER_SVG, { size: 128 });
  const PRIMARY = svg(PRIMARY_SVG, { size: 256 });
  const TASSEL = svg(TASSEL_SVG, { size: 256 });
  const MEDAL = svg(MEDAL_SVG, { size: 256 });
  const EYE = animeEye({ iris: "#ffae2a", irisLight: "#ffe27a", irisDark: "#b4420e" });

  // ---- Skeleton: pelvis root, spine, neck, head, jaw ----
  const hips = b.joint("hips", { at: [0, 1.0, -0.2], aim: [0, 1.06, -0.16], role: "spine" });
  const spine = b.chain("spine", [[0, 1.06, -0.16], [0, 1.3, 0.04], [0, 1.5, 0.2]], {
    parent: hips,
    names: ["spine1", "spine2"],
    role: "spine",
  });
  const chestJ = spine.joints[1];
  const neck = b.chain("neck", [[0, 1.5, 0.2], [0, 1.7, 0.34], [0, 1.9, 0.5], [0, 2.0, 0.6]], {
    parent: chestJ,
    names: ["neck1", "neck2", "neck3", "neckTip"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.tip!, at: [0, 2.12, 0.66], aim: [0, 2.2, 0.82], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.1, up: -0.06 }),
    aim: head.local({ forward: 0.26, up: -0.1 }),
    role: "jaw",
  });

  // ---- Body and chest ----
  const body = b.sweep(spine, (t) => [0.17 + 0.035 * Math.sin(Math.PI * t) - 0.02 * t, 0.2 + 0.03 * Math.sin(Math.PI * t)], {
    color: PLUME,
  });
  const breast = b.part(new THREE.SphereGeometry(1, 18, 14), CHEST, {
    bone: chestJ,
    at: [0, 1.34, 0.12],
    scale: [0.2, 0.22, 0.2],
  });
  const medal = b.surface(breast).nearest([0, 1.34, 0.4]);
  b.decal(breast, MEDAL, { at: medal, size: [0.16, 0.16] });
  b.part(new THREE.TorusGeometry(0.085, 0.012, 6, 16), GOLD_C, {
    bone: chestJ,
    at: [0, 1.34, 0.318],
    dir: [0, 0, 1],
    axis: "z",
  });
  glow(b.stick(new THREE.OctahedronGeometry(0.035, 0), GEM, medal, { embed: 0.25 }), 1.4);
  b.cards(
    b.surface([body, breast]).scatter(260, {
      rng: rng(3),
      minDist: 0.05,
      filter: (h) => h.at.y > 0.9 && h.at.distanceTo(medal.at) > 0.12,
    }),
    FEATHER,
    { size: [0.09, 0.2], lean: 30, bend: 15, vary: 0.25, rng: rng(4) },
  );

  // ---- Neck, gold collar and tassels ----
  const neckBody = b.sweep(neck, (t) => 0.1 - 0.025 * t, { color: PLUME });
  const collar = b.surface(neckBody).loop(neck.joints[2], { lift: 0.006 });
  b.sweep(collar, 0.014, { color: GOLD_C });
  const tassels: Spot[] = [];
  b.along(collar, 12, (at) => {
    tassels.push(frame(at, [0, 1, 0]));
  });
  b.cards(tassels, TASSEL, { size: [0.035, 0.13], lean: 180, flow: [0, 0, 1] });
  b.along(collar, 6, (at) => {
    b.part(new THREE.SphereGeometry(0.016, 8, 6), TEAL_C, { bone: neck.joints[2], at });
  });
  b.cards(
    b.surface(neckBody).scatter(90, { rng: rng(41), minDist: 0.04, filter: (h) => h.n.z > -0.5 && Math.abs(h.at.y - neck.joints[2].at.y) > 0.12 }),
    FEATHER,
    { size: [0.06, 0.12], lean: 45, bend: 12, vary: 0.25, rng: rng(42) },
  );

  // ---- Head: skull, anime eyes, gold headband, beak, crest ----
  const skull = b.part(new THREE.SphereGeometry(1, 20, 14), HEAD, {
    bone: head,
    at: head.local({ forward: 0.02, up: 0.02 }),
    scale: [0.15, 0.14, 0.16],
  });
  for (const s of [1, -1]) {
    b.decal(skull, EYE, {
      at: head.local({ left: s * 0.08, up: 0.02, forward: 0.13 }),
      dir: [0, 0, 1],
      size: [0.085, 0.11],
      mirror: s > 0,
    });
  }
  b.cards(
    b.surface(skull).scatter(40, { rng: rng(50), minDist: 0.03, filter: (h) => h.n.y < 0.2 && h.n.z < 0.5 && h.at.y < head.at.y + 0.03 }),
    FEATHER,
    { size: [0.05, 0.08], lean: 60, vary: 0.25, rng: rng(51) },
  );
  const band = b.surface(skull).loop(head, { lift: 0.004 });
  b.sweep(band, 0.012, { color: GOLD_C });
  const brow = b.surface(skull).nearest(head.local({ up: 0.13, forward: 0.1 }));
  glow(b.stick(new THREE.OctahedronGeometry(0.03, 0), GEM, brow, { embed: 0.3 }), 1.2);

  b.sweep(
    bezier(
      head.local({ forward: 0.1, up: 0.0 }),
      head.local({ forward: 0.19, up: 0.02 }),
      head.local({ forward: 0.27, up: -0.01 }),
      head.local({ forward: 0.34, up: -0.08 }),
    ),
    (t) => [0.052 * (1 - t) + 0.008, 0.045 * (1 - t) + 0.006],
    { bone: head, color: BEAK_C, caps: { start: "round", end: "point" } },
  );
  b.sweep(
    bezier(
      jaw.at,
      jaw.local({ forward: 0.14, up: -0.02 }),
      jaw.local({ forward: 0.23, up: -0.03 }),
      jaw.local({ forward: 0.29, up: -0.06 }),
    ),
    (t) => [0.036 * (1 - t) + 0.004, 0.03 * (1 - t) + 0.004],
    { bone: jaw, color: BEAK_C, caps: { start: "round", end: "point" } },
  );

  for (let k = -3; k <= 3; k++) {
    const side = k * 0.05;
    const path = bezier(
      head.local({ up: 0.05, back: 0.02, left: side }),
      head.local({ up: 0.16, back: 0.12, left: side * 1.4 }),
      head.local({ up: 0.2, back: 0.3, left: side * 2 }),
      head.local({ up: 0.1, back: 0.5, left: side * 2.4 }),
    );
    b.sweep(path, (t) => 0.035 * (1 - t) + 0.005, {
      bone: head,
      color: FLAME,
      caps: { start: "round", end: "point" },
    });
  }

  // ---- Tail and streamers ----
  const tail = b.chain("tail", [[0, 1.0, -0.3], [0, 0.94, -0.66], [0, 0.98, -1.06], [0, 1.16, -1.4]], {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tailTip"],
    role: "tail",
  });
  b.sweep(tail, (t) => 0.1 * (1 - t) + 0.03, { color: FLAME });
  const tailBase = tail.at(0.45).at;
  for (let k = -3; k <= 3; k++) {
    const a = Math.abs(k);
    const q = (dx: number, dy: number, dz: number): [number, number, number] => [
      tailBase.x + dx,
      tailBase.y + dy,
      tailBase.z + dz,
    ];
    const path = bezier(
      q(k * 0.03, 0.02, 0.0),
      q(k * 0.07, 0.04, -0.3),
      q(k * 0.12, -0.01 * a, -0.7),
      q(k * 0.16, -0.05 - 0.02 * a, -0.95 - 0.06 * (3 - a)),
    );
    b.sweep(path, (t) => 0.06 * (1 - t) + 0.008, {
      bone: tail.joints[1],
      color: FLAME,
      caps: { start: "round", end: "point" },
    });
    glow(
      b.sweep(path.slice(0.78, 1), (t) => 0.02 * (1 - t) + 0.012, {
        bone: tail.joints[1],
        color: GEM,
        caps: { start: "round", end: "point" },
      }),
      1.4,
    );
  }

  // Dorsal flame fin along the tail's top, lying in the tail's mid-plane.
  const fin: Spot[] = [];
  for (let i = 0; i < 9; i++) fin.push(frame(tail.at(0.15 + i * 0.1), [1, 0, 0]));
  b.cards(fin, PRIMARY, { size: [0.16, 0.36], lean: 90, bend: 8, vary: 0.2, rng: rng(90), flow: [0, 1, -0.5] });

  // Gold pauldrons over the wing roots.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 12, 8), GOLD_C, { bone: chestJ, at: [s * 0.19, 1.47, 0], scale: [0.11, 0.085, 0.12] });
  }

  // ---- Legs, toes and wings, per side ----
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const leg = b.chain(
      `leg${side}`,
      [
        [s * 0.17, 0.98, -0.24],
        [s * 0.2, 0.66, 0.02],
        [s * 0.2, 0.3, -0.18],
        [s * 0.2, 0.02, 0.06],
      ],
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`], role: "leg" },
    );
    const thigh = b.sweep(leg, (t) => 0.09 * (1 - t) + 0.024 * t, { bands: [[0.42, PLUME], [1, LEG]] });
    b.cards(
      b.surface(thigh).scatter(50, { rng: rng(20 + (s > 0 ? 1 : 2)), minDist: 0.05, filter: (h) => h.at.y > 0.5 }),
      FEATHER,
      { size: [0.07, 0.14], lean: 40, vary: 0.2, rng: rng(60 + (s > 0 ? 1 : 2)) },
    );
    const ankle = leg.joints[2];
    b.part(new THREE.TorusGeometry(0.03, 0.008, 6, 12), GOLD_C, {
      bone: ankle,
      at: ankle.at,
      dir: ankle,
      axis: "z",
    });

    const foot = leg.tip!;
    const toeBase: [number, number, number] = [s * 0.2, 0.02, 0.12];
    const toes = [
      { name: `toe${side}A`, dx: -0.07, dz: 0.11 },
      { name: `toe${side}B`, dx: 0, dz: 0.13 },
      { name: `toe${side}C`, dx: 0.07, dz: 0.11 },
      { name: `toe${side}H`, dx: 0.02, dz: -0.1 },
    ];
    for (const t of toes) {
      const tip: [number, number, number] = [toeBase[0] + s * t.dx, 0.02, toeBase[2] + t.dz];
      const joint = b.joint(t.name, { parent: foot, at: toeBase, aim: tip, role: "digit" });
      b.rod(joint, tip, [0.022, 0.012], { color: TALON });
      b.spike(tip, joint, 0.05, 0.012, { color: TALON, bone: joint });
    }

    // Wing: a raised arm with flame feathers fanning up and out from it.
    const wing = b.chain(
      `wing${side}`,
      [
        [s * 0.16, 1.45, 0.0],
        [s * 0.5, 1.88, -0.05],
        [s * 0.98, 2.24, -0.2],
        [s * 1.28, 2.38, -0.34],
      ],
      {
        parent: chestJ,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `wingTip${side}`],
        role: "wing",
      },
    );
    b.sweep(wing, (t) => 0.05 - 0.024 * t, { color: GOLD_C });
    for (const t of [0.25, 0.5, 0.78]) {
      const f = wing.at(t);
      b.part(new THREE.TorusGeometry(0.054 - 0.024 * t, 0.009, 6, 14), GOLD_C, {
        bone: f.bone!,
        at: f.at,
        dir: f,
        axis: "z",
      });
    }

    // Feather sheets face forward, so they read from the front; each lies flat in that plane and flares outward.
    const sheet: [number, number, number] = [0, 0.15, 1];
    const primaries: Spot[] = [];
    for (let i = 0; i < 9; i++) primaries.push(frame(wing.at(0.66 + i * 0.0425), sheet));
    b.cards(primaries, PRIMARY, {
      size: [0.22, 0.6],
      lean: 90,
      bend: 6,
      vary: 0.12,
      rng: rng(30 + (s > 0 ? 1 : 2)),
      flow: (_f) => [s * 0.5, 0.6, 0],
    });
    const secondaries: Spot[] = [];
    for (let i = 0; i < 11; i++) secondaries.push(frame(wing.at(0.32 + i * 0.034), sheet));
    b.cards(secondaries, FEATHER, {
      size: [0.26, 0.5],
      lean: 90,
      bend: 6,
      vary: 0.1,
      rng: rng(35 + (s > 0 ? 1 : 2)),
      flow: (_f) => [s * 0.1, 1, 0],
    });
    const coverts: Spot[] = [];
    for (let i = 0; i < 12; i++) coverts.push(frame(wing.at(0.04 + i * 0.024), sheet));
    b.cards(coverts, FEATHER, {
      size: [0.18, 0.32],
      lean: 90,
      bend: 10,
      vary: 0.2,
      rng: rng(80 + (s > 0 ? 1 : 2)),
      flow: (_f) => [s * 0.25, 1, 0],
    });

    glow(b.part(new THREE.SphereGeometry(0.04, 8, 6), GEM, { bone: wing.tip!, at: wing.tip! }), 1.2);
  }

  return b.root;
}
