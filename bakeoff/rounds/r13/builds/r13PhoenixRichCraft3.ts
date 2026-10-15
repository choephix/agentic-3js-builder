import * as THREE from "three";
import { createBuilder, frame, rng, bezier, catmull, limb, svg, gradient } from "../../../../src/index";
import { cel, furEdge } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ember Phoenix",
  description:
    "Cel-shaded Genshin-style phoenix perched with wings fully spread: layered glowing flame feathers, gold regalia with ruby gems, a streaming ocellus tail, and an anime eye. Rigged with spine, neck, jaw, wings, tail and legs.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const CRIMSON = "#cf2a1c";
const ORANGE = "#ff7a1f";
const AMBER = "#ffb22e";
const CREAM = "#fff0c0";
const RUBY = "#ff2a3c";

const NS = 'xmlns="http://www.w3.org/2000/svg"';
const mx = (a: number, b: number, t: number) => a + (b - a) * t;
const DEG = Math.PI / 180;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const grad = (id: string, stops: [number, string][], x1 = 0, y1 = 1, x2 = 0, y2 = 0) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops
    .map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`)
    .join("")}</linearGradient>`;

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const R = rng(21);

  // -------------------------------------------------------------------------------------------------------------
  // Textures
  const FLAME_P =
    "M24 120 C12 104 6 78 9 56 C10 44 6 36 11 24 C14 34 18 36 20 30 C20 18 26 8 31 0 C32 10 35 16 38 22 C44 36 44 52 40 70 C37 92 32 106 24 120Z";
  const FLAME_IN =
    "M24 116 C17 100 14 80 17 60 C18 50 18 42 22 34 C24 44 28 50 29 62 C31 80 29 100 24 116Z";
  const flameFeather = (stops: [number, string][], rachis: string) =>
    svg(
      `<svg viewBox="0 0 48 120" ${NS}><defs>${grad("g", stops)}${grad("h", [
        [0, "#ff4d1a"],
        [1, "#fff8d0"],
      ])}</defs>
      <path d="${FLAME_P}" fill="url(#g)"/>
      <path d="${FLAME_IN}" fill="url(#h)" fill-opacity="0.5"/>
      <path d="M24 118 C25 80 26 50 28 14" stroke="${rachis}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M24.5 100 L13 86 M25.5 92 L37 80 M25 78 L14 64 M26 68 L37 54 M26 56 L18 44" stroke="#ffffff" stroke-opacity=".3" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`,
      { size: 256 },
    );
  const FLAME_A = flameFeather(
    [
      [0, "#a4121c"],
      [0.3, "#ff4a1a"],
      [0.62, "#ff9a22"],
      [0.86, "#ffd34a"],
      [1, "#fff4b8"],
    ],
    "#ffe9a0",
  );
  const FLAME_B = flameFeather(
    [
      [0, "#5e0c1c"],
      [0.35, "#c91f26"],
      [0.65, "#ff5a1a"],
      [0.88, "#ffb02e"],
      [1, "#ffe27a"],
    ],
    "#ffd070",
  );

  const COVERT_P =
    "M24 120 C9 104 3 72 8 44 C11 24 18 8 24 3 C30 8 37 24 40 44 C45 72 39 104 24 120Z";
  const COVERT = svg(
    `<svg viewBox="0 0 48 120" ${NS}><defs>${grad("g", [
      [0, "#7a0e1c"],
      [0.45, "#d8281e"],
      [0.8, "#ff7a1f"],
      [1, "#ffc23a"],
    ])}</defs>
    <path d="${COVERT_P}" fill="url(#g)" stroke="#ffd86a" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M10 56 Q24 70 38 56 M12 38 Q24 50 36 38 M16 22 Q24 32 32 22" stroke="#ffe08a" stroke-opacity=".6" stroke-width="2" fill="none"/>
    </svg>`,
    { size: 256 },
  );
  const DOWN = svg(
    `<svg viewBox="0 0 48 120" ${NS}><defs>${grad("g", [
      [0, "#ffa020"],
      [0.5, "#ffd978"],
      [1, "#fff6d6"],
    ])}</defs>
    <path d="${COVERT_P}" fill="url(#g)" stroke="#ffbe3a" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M24 112 L24 18" stroke="#ffe9a8" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );

  const TAIL_P =
    "M20 160 C14 140 12 118 10 96 C6 74 2 56 8 38 C12 26 16 22 14 12 C18 16 20 8 22 0 C24 10 26 16 30 12 C28 24 32 28 34 40 C38 58 34 76 30 96 C28 118 26 140 20 160Z";
  const TAIL = svg(
    `<svg viewBox="0 0 40 160" ${NS}><defs>${grad("g", [
      [0, "#6e0d1c"],
      [0.3, "#d02a20"],
      [0.6, "#ff7a1f"],
      [0.85, "#ffc23a"],
      [1, "#fff0a8"],
    ])}</defs>
    <path d="${TAIL_P}" fill="url(#g)"/>
    <path d="M20 156 C20 110 21 70 22 8" stroke="#ffe08a" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <ellipse cx="20" cy="54" rx="13" ry="17" fill="#ffd45a" stroke="#8a4a10" stroke-width="1.2"/>
    <ellipse cx="20" cy="54" rx="9" ry="12.5" fill="#b3141e"/>
    <ellipse cx="20" cy="54" rx="5" ry="7.5" fill="#fff0b8"/>
    <ellipse cx="19" cy="51" rx="2" ry="3" fill="#ffffff"/>
    </svg>`,
    { size: 320 },
  );

  const PLUME = svg(
    `<svg viewBox="0 0 28 120" ${NS}><defs>${grad("g", [
      [0, "#c4261e"],
      [0.5, "#ff8a22"],
      [1, "#fff2b0"],
    ])}</defs>
    <path d="M12 120 C3 92 5 50 17 0 C23 40 25 82 12 120Z" fill="url(#g)"/>
    <path d="M12 114 C11 80 13 46 17 8" stroke="#fff4c0" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const EYE = svg(
    `<svg viewBox="0 0 64 64" ${NS}><defs>
      <radialGradient id="i" cx=".5" cy=".7" r=".7"><stop offset="0" stop-color="#fff3a0"/><stop offset=".55" stop-color="#ffb42a"/><stop offset="1" stop-color="#d4261c"/></radialGradient></defs>
    <ellipse cx="32" cy="32" rx="30" ry="28" fill="#2a0f1e"/>
    <ellipse cx="32" cy="33" rx="25" ry="24" fill="url(#i)"/>
    <ellipse cx="32" cy="22" rx="25" ry="12" fill="#7a0f1e" fill-opacity=".45"/>
    <ellipse cx="32" cy="34" rx="8.5" ry="15" fill="#1a0a14"/>
    <ellipse cx="23" cy="22" rx="7" ry="8.5" fill="#ffffff"/>
    <circle cx="42" cy="44" r="3.6" fill="#ffffff"/>
    <path d="M7 20 Q3 13 7 7" stroke="#2a0f1e" stroke-width="5" stroke-linecap="round" fill="none"/>
    </svg>`,
    { size: 128 },
  );

  const EMBLEM = svg(
    `<svg viewBox="0 0 64 64" ${NS}><defs>${grad("f", [
      [0, "#ff3a1a"],
      [0.6, "#ff9a22"],
      [1, "#fff2a0"],
    ])}</defs>
    <circle cx="32" cy="32" r="28" fill="#5a0c1c" stroke="#ffd05a" stroke-width="4"/>
    <circle cx="32" cy="32" r="22" fill="none" stroke="#ffd05a" stroke-width="1.5" stroke-dasharray="2 3"/>
    <path d="M32 8 C38 20 48 26 46 40 C45 50 38 56 32 56 C26 56 19 50 18 40 C17 32 22 28 24 22 C26 28 29 30 30 26 C31 20 29 14 32 8Z" fill="url(#f)" stroke="#ffe9a0" stroke-width="1.2"/>
    <path d="M32 26 C36 34 40 38 38 45 C37 50 34 52 32 52 C30 52 27 50 26 45 C25 40 30 36 32 26Z" fill="#fff6c8"/>
    </svg>`,
    { size: 192 },
  );

  const diamonds = Array.from({ length: 8 }, (_, i) => {
    const x = 7.5 + i * 15;
    return `<path d="M${x} 3 L${x + 5} 8 L${x} 13 L${x - 5} 8Z" fill="#c4202a" stroke="#7a3a0c" stroke-width=".8"/><circle cx="${x}" cy="8" r="1.6" fill="#ffe9a0"/>`;
  }).join("");
  const TRIM = svg(
    `<svg viewBox="0 0 120 16" ${NS}><defs>${grad("gt", [
      [0, "#e0a030"],
      [0.5, "#ffe488"],
      [1, "#e0a030"],
    ])}</defs>
    <rect width="120" height="16" fill="url(#gt)"/>
    <rect y="0" width="120" height="1.8" fill="#9a5a10"/><rect y="14.2" width="120" height="1.8" fill="#9a5a10"/>
    ${diamonds}</svg>`,
    { size: 256 },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Paints
  const BACK = gradient(ORANGE, CRIMSON, [0, 1, 0.35], [0, 0.95, -0.5]);
  const BELLY = gradient(CREAM, AMBER, [0, 1, 0.3], [0, 0.9, -0.5]);
  const BODY = cel(furEdge(BACK, BELLY, { level: -0.1, teeth: 0.3, period: 0.05, along: [0, 0, 1] }));
  const NECK = cel(furEdge(CREAM, ORANGE, { axis: [0, 0.3, 1], level: 0.25, teeth: 0.3, period: 0.04, along: [0, 1, 0] }));
  const HEAD = cel(
    furEdge(ORANGE, CREAM, { by: "position", axis: [0, 1, 0], level: 1.585, teeth: 0.02, period: 0.035, along: [1, 0, 0] }),
  );
  const ARM = cel("#e8431c");
  const TAILBASE = cel(CRIMSON);
  const GOLDC = cel("#ffd35c", "#d98a22");
  const BEAK_U = cel("#ffd04a", "#e0902a");
  const BEAK_L = cel("#f2b13a", "#c9731f");
  const LEG = cel("#f0a02c", "#c4661a");
  const THIGH = cel("#ff7a1f");
  const CLAW = cel("#4a2030");

  // -------------------------------------------------------------------------------------------------------------
  // Helpers
  type Bone = ReturnType<typeof b.joint>;
  const glowCards = (meshes: THREE.Mesh[], k = 0.8) => glow(meshes, k);
  const flameCard = (
    p: THREE.Vector3,
    dir: THREE.Vector3,
    size: [number, number],
    tex: THREE.Texture,
    o: { flow?: number[]; bend?: number; bone?: Bone; mirror?: boolean; cross?: boolean; k?: number },
  ) =>
    glowCards(
      b.cards([frame(p, dir)], tex, {
        size,
        flow: o.flow ?? [0, 1, 0],
        bend: o.bend ?? 0,
        bone: o.bone,
        mirror: o.mirror,
        cross: o.cross,
        sink: 0.05,
      }),
      o.k ?? 0.8,
    );
  const band = (geo: THREE.BufferGeometry, fr: Parameters<typeof b.part>[2]) =>
    b.part(geo, "#ffffff", { ...fr, texture: TRIM });

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.92, -0.35], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.92, -0.35],
      [0, 0.95, -0.12],
      [0, 1.0, 0.1],
      [0, 1.08, 0.28],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.08, 0.28],
      [0, 1.24, 0.34],
      [0, 1.46, 0.46],
      [0, 1.62, 0.56],
    ]),
    { parent: chest, names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[2], at: [0, 1.62, 0.56], dir: [0, -0.12, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.12, down: 0.07 }),
    aim: head.local({ forward: 0.36, down: 0.075 }),
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.92, -0.35],
      [0, 0.9, -0.6],
      [0, 0.88, -0.85],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Body, neck, tail base
  const body = b.loft(
    [
      { at: [0, 0.9, -0.5], w: 0.16, h: 0.16 },
      { at: [0, 0.93, -0.28], w: 0.36, h: 0.38 },
      { at: [0, 0.97, 0.0], w: 0.48, h: 0.5 },
      { at: [0, 1.03, 0.2], w: 0.46, h: 0.5 },
      { at: [0, 1.1, 0.34], w: 0.3, h: 0.34 },
    ],
    { bone: spine, color: BODY },
  );
  const neckTube = b.sweep(neck, [0.14, 0.1, 0.08, 0.07], { color: NECK });
  b.sweep(tail, [0.11, 0.04], { color: TAILBASE });

  const bodySkin = b.surface(body);
  const neckSkin = b.surface(neckTube);

  // Chest feathering: layered scalloped coverts on the back and flanks, soft gold down on the front.
  const chestZone = (h: { n: THREE.Vector3; at: THREE.Vector3 }) => h.n.z > 0.55 && Math.abs(h.at.x) < 0.1;
  glowCards(
    b.cards(
      bodySkin.scatter(150, { rng: R, minDist: 0.045, filter: (h) => h.n.y > -0.35 && !chestZone(h) }),
      COVERT,
      { size: [0.1, 0.18], lean: 68, flow: [0, -0.3, -1], bend: 15, vary: 0.25, rng: rng(5), spin: 15 },
    ),
    0.5,
  );
  glowCards(
    b.cards(
      bodySkin.scatter(110, { rng: R, minDist: 0.04, filter: (h) => h.n.y < 0.2 && !chestZone(h) }),
      DOWN,
      { size: [0.08, 0.14], lean: 70, flow: [0, -0.4, -1], bend: 15, vary: 0.2, rng: rng(6) },
    ),
    0.5,
  );
  // Neck ruff
  glowCards(
    b.cards(neckSkin.scatter(70, { rng: R, minDist: 0.04 }), [DOWN, COVERT], {
      size: [0.075, 0.14],
      lean: 66,
      flow: [0, -0.6, -1],
      bend: 18,
      vary: 0.2,
      rng: rng(8),
    }),
    0.55,
  );

  // Pyro emblem on the chest
  const chestHit = bodySkin.ray([0, 1.04, 1.4], [0, -0.05, -1]);
  if (chestHit) {
    glow(
      b.decal(bodySkin, EMBLEM, { at: chestHit, dir: [0, 0.15, 1], up: [0, 1, 0], size: [0.15, 0.15] }),
      0.9,
    );
  }

  // Gold gorget around the neck with a ruby pendant
  try {
    const collar = neckSkin.loop(neck.joints[1], { lift: 0.012 });
    b.sweep(collar, 0.022, { color: GOLDC, sides: 6 });
    b.along(collar, 10, (at) => b.part(new THREE.OctahedronGeometry(0.018, 0), "#ffe9a0", { at: at.at, bone: neck.joints[1] }));
  } catch (e) {
    /* collar is decoration only */
  }
  const pend = neckSkin.ray([0, 1.24, 1.2], [0, 0, -1]);
  if (pend) glow(b.stick(new THREE.OctahedronGeometry(0.04, 0), RUBY, pend, { embed: 0.2 }), 1.3);

  // -------------------------------------------------------------------------------------------------------------
  // Head
  const HC = head.local({ forward: 0.04 });
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), HEAD, {
    bone: head,
    at: HC,
    scale: [0.15, 0.13, 0.16],
  });
  const skullSkin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSkin.around(skull.at).at(s * 48, 8);
    if (hit) b.decal(skullSkin, EYE, { at: hit, size: [0.1, 0.1], mirror: s > 0 });
  }

  // Beak: hooked upper, separate lower on the jaw
  b.sweep(bezier(head.local({ forward: 0.16, down: 0.0 }), head.local({ forward: 0.3, up: 0.045 }), head.local({ forward: 0.4, down: 0.09 })), (t) => [0.065 * (1 - t) + 0.004, 0.055 * (1 - t) + 0.004], {
    bone: head,
    color: BEAK_U,
    caps: { start: "flat", end: "point" },
    sides: 6,
  });
  b.sweep(
    bezier(head.local({ forward: 0.14, down: 0.065 }), head.local({ forward: 0.25, down: 0.08 }), head.local({ forward: 0.35, down: 0.07 })),
    [0.05, 0.004],
    { bone: jaw, color: BEAK_L, caps: { start: "flat", end: "point" }, sides: 6 },
  );

  // Gold crest blade, ruby, and flame plumes
  b.extrude(
    [
      [-0.06, 0],
      [0, 0.09],
      [0.12, 0.2, "sharp"],
      [0.1, 0.1],
      [0.2, 0.14, "sharp"],
      [0.16, 0.04],
      [0.24, 0.0],
      [0.1, -0.04],
    ],
    { at: head.local({ forward: -0.02, up: 0.115 }), x: [0, 0, -1], y: [0, 1, 0], thickness: 0.025, bevel: 0.006, color: GOLDC, bone: head },
  );
  glow(b.part(new THREE.OctahedronGeometry(0.03, 0), RUBY, { bone: head, at: head.local({ forward: 0.07, up: 0.125 }) }), 1.3);

  const crestFrames = [];
  for (let i = 0; i < 7; i++) {
    const a = (i - 3) * 14 * DEG;
    const p = head.local({ up: 0.11, forward: -0.05, left: Math.sin(a) * 0.07 });
    crestFrames.push(frame(p, V(Math.sin(a) * 0.6, 0.55, -0.8).normalize()));
  }
  crestFrames.forEach((f, i) =>
    glowCards(
      b.cards([f], PLUME, { size: [0.1, 0.5 - 0.05 * Math.abs(i - 3)], flow: [0, 0, 1], bend: -35, cross: true, bone: head }),
      0.85,
    ),
  );
  for (const s of [1, -1]) {
    flameCard(head.local({ left: s * 0.11, back: 0.04 }), V(s * 0.5, 0.1, -1).normalize(), [0.14, 0.8], PLUME, {
      bend: 30,
      bone: head,
      mirror: s < 0,
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Tail: ocellus streamers
  const tailBone = tail.joints[1];
  const N = 11;
  for (let i = 0; i < N; i++) {
    const u = (i - 5) / 5;
    const az = u * 36 * DEG;
    const el = (-7 + (1 - Math.abs(u)) * 2) * DEG;
    const dir = V(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el));
    const len = 1.0 + (1 - Math.abs(u)) * 1.1;
    const tex = Math.abs(u) < 0.45 ? TAIL : i % 2 ? FLAME_A : FLAME_B;
    flameCard(V(u * 0.05, 0.9 + (i % 2) * 0.014, -0.7), dir, [Math.abs(u) < 0.45 ? 0.26 : 0.2, len], tex, {
      flow: [u * 0.45, 1, 0],
      bend: 28 + (1 - Math.abs(u)) * 14,
      bone: tailBone,
      mirror: u < 0,
    });
  }
  for (let i = 0; i < 5; i++) {
    const u = (i - 2) / 2;
    const az = u * 22 * DEG;
    const el = 9 * DEG;
    const dir = V(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el));
    flameCard(V(u * 0.04, 0.95, -0.66), dir, [0.18, 1.2 - Math.abs(u) * 0.2], FLAME_A, {
      flow: [u * 0.3, 1, 0],
      bend: 38,
      bone: tailBone,
      mirror: u < 0,
    });
  }
  band(new THREE.CylinderGeometry(0.105, 0.105, 0.07, 12, 1, true), { frame: tail.at(0.3) });

  // -------------------------------------------------------------------------------------------------------------
  // Legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hip: [number, number, number] = [s * 0.17, 0.84, -0.1];
    const foot: [number, number, number] = [s * 0.19, 0.03, 0.1];
    const pts = limb(hip, foot, [0.3, 0.34, 0.3], [[0, 0, 1], [0, 0, -1]]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`],
      role: "leg",
      contact: [foot[0], 0, foot[2]],
    });
    const footJ = leg.joints[3];
    const tube = b.sweep(leg, [0.09, 0.07, 0.045, 0.036, 0.03], {
      color: LEG,
      bands: [
        [0.3, THIGH],
        [1, LEG],
      ],
    });
    glowCards(
      b.cards(
        b.surface(tube).scatter(30, { rng: R, minDist: 0.035, filter: (h) => h.at.y > 0.62 }),
        [COVERT, DOWN],
        { size: [0.07, 0.13], lean: 70, flow: [0, -0.4, -0.6], bend: 15, vary: 0.2, rng: rng(30 + (s > 0 ? 1 : 2)) },
      ),
      0.5,
    );
    band(new THREE.CylinderGeometry(0.048, 0.048, 0.07, 10, 1, true), { frame: leg.at(0.8) });
    b.spike(pts[2], [0, -0.3, -1], 0.08, 0.025, { color: GOLDC, bone: leg.joints[2] });

    const toes: [number, number][] = [
      [-0.085, 0.2],
      [0, 0.25],
      [0.085, 0.2],
      [0, -0.13],
    ];
    for (const [dx, dz] of toes) {
      const tip = V(foot[0] + s * dx, 0.03, foot[2] + dz);
      b.capsule(V(...foot), tip, [0.03, 0.02], LEG, { bone: footJ, sides: 6 });
      const cd = V(s * dx * 0.6, -0.4, dz > 0 ? 1 : -1).normalize();
      b.spike(tip, cd, 0.08, 0.02, { color: CLAW, bone: footJ });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Wings
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${S}`,
      catmull([
        [s * 0.3, 1.14, 0.12],
        [s * 0.88, 1.4, 0.0],
        [s * 1.42, 1.52, -0.1],
        [s * 1.78, 1.5, -0.22],
      ]),
      { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`], role: "wing" },
    );
    const [shoulder, elbow, wrist] = wing.joints;
    const armTube = b.sweep(wing, [0.085, 0.075, 0.055, 0.035], { color: ARM });

    const P = (t: number) => wing.at(t).at.clone();
    const dirAt = (th: number, rise: number) => {
      const a = th * DEG;
      return V(s * Math.sin(a), rise, -Math.cos(a)).normalize();
    };
    const thetaAt = (t: number) =>
      t < 0.4 ? mx(-6, 4, t / 0.4) : t < 0.76 ? mx(4, 22, (t - 0.4) / 0.36) : mx(26, 86, (t - 0.76) / 0.24);
    const feather = (t: number, th: number, len: number, wid: number, tex: THREE.Texture, lift: number, bone: Bone, bend: number) =>
      flameCard(P(t).add(V(0, lift, 0)), dirAt(th, 0.1), [wid, len], tex, { bone, bend, mirror: s < 0 });

    // Under row (dark, behind)
    for (let k = 0; k < 10; k++) {
      const u = k / 9;
      feather(mx(0.14, 0.99, u), thetaAt(mx(0.14, 0.99, u)) + 4, mx(0.6, 0.9, u), 0.18, FLAME_B, -0.04, elbow, 12);
    }
    // Tertials
    for (let k = 0; k < 5; k++) {
      const u = k / 4;
      feather(mx(0.12, 0.38, u), mx(-8, 4, u), mx(0.55, 0.75, u), 0.2, k % 2 ? FLAME_A : FLAME_B, (k % 3) * 0.012, shoulder, 12);
    }
    // Secondaries
    for (let k = 0; k < 10; k++) {
      const u = k / 9;
      feather(mx(0.4, 0.75, u), mx(4, 22, u), mx(0.78, 0.98, u), 0.2, k % 2 ? FLAME_A : FLAME_B, (k % 3) * 0.012, elbow, 14);
    }
    // Primaries
    const PL = [1.05, 1.16, 1.22, 1.24, 1.2, 1.12, 1.02, 0.9, 0.76];
    for (let k = 0; k < 9; k++) {
      const u = k / 8;
      feather(mx(0.76, 0.99, u), mx(26, 86, Math.pow(u, 0.9)), PL[k], 0.2, k % 2 ? FLAME_B : FLAME_A, (k % 3) * 0.012, wrist, 20);
    }
    // Covert rows
    const row = (n: number, t0: number, t1: number, lift: number) => {
      const fr = [];
      for (let k = 0; k < n; k++) {
        const t = mx(t0, t1, k / (n - 1));
        fr.push(frame(P(t).add(V(0, lift + (k % 2) * 0.01, 0)), dirAt(thetaAt(t), 0.1)));
      }
      return fr;
    };
    glowCards(
      b.cards(row(14, 0.1, 0.98, 0.04), COVERT, { size: [0.14, 0.34], flow: [0, 1, 0], bend: 12, vary: 0.15, rng: rng(40 + S.charCodeAt(0)), mirror: s < 0, bone: elbow }),
      0.7,
    );
    glowCards(
      b.cards(row(12, 0.12, 0.96, 0.07), DOWN, { size: [0.1, 0.2], flow: [0, 1, 0], bend: 10, vary: 0.15, rng: rng(50 + S.charCodeAt(0)), mirror: s < 0, bone: elbow }),
      0.7,
    );
    glowCards(
      b.cards(b.surface(armTube).scatter(36, { rng: R, minDist: 0.05 }), DOWN, {
        size: [0.07, 0.12],
        lean: 80,
        flow: [0, 0.1, -1],
        vary: 0.2,
        rng: rng(60 + S.charCodeAt(0)),
      }),
      0.6,
    );

    // Regalia: shoulder boss, bracers, ruby
    b.part(new THREE.SphereGeometry(0.1, 9, 6), GOLDC, {
      bone: shoulder,
      at: shoulder.at,
      dir: [s * 0.6, 0.8, 0],
      scale: [1, 0.65, 1],
    });
    glow(b.part(new THREE.OctahedronGeometry(0.03, 0), RUBY, { bone: shoulder, at: shoulder.local({ up: 0.085 }) }), 1.3);
    band(new THREE.CylinderGeometry(0.065, 0.065, 0.09, 12, 1, true), { frame: wrist });
    glow(b.part(new THREE.OctahedronGeometry(0.03, 0), RUBY, { bone: wrist, at: wrist.local({ up: 0.07 }) }), 1.3);
    band(new THREE.CylinderGeometry(0.052, 0.052, 0.07, 12, 1, true), { frame: wing.at(0.92) });
  }

  // Slightly open beak so the two jaws read
  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  return b.root;
}
