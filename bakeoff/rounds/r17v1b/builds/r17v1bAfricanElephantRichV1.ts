import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { cells, mix, noise, paint, resolve, rgb, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "African Bush Elephant",
  description:
    "A low-poly adult African bush elephant bull: faceted body, creased dusty hide, big Africa-shaped ears, curved ivory tusks and a ringed trunk, fully rigged.",
  style: "low-poly",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette

const SKIN_TOP = rgb("#6f6a65");
const SKIN_MID = rgb("#7f7a73");
const SKIN_BELLY = rgb("#9a9187");
const SKIN_SHADE = rgb("#4f4b48");
const DUST = rgb("#a8906f");
const DUST_DEEP = rgb("#8c7456");
const PINK = rgb("#b79388");
const EAR_IN = rgb("#a8857d");
const EAR_VEIN = rgb("#6f5550");
const EAR_RIM = rgb("#5c5753");

const IVORY = "#f1e6cb";
const IVORY_D = "#d6c49c";
const IVORY_ROOT = "#8d7a58";
const NAIL = "#d3c7b2";
const NAIL_D = "#a39880";
const AMBER = "#c98a2c";
const PUPIL = "#16120f";
const GLINT = "#fff7e6";
const HAIR = "#2a2522";
const LASH = "#1e1a18";
const MOUTH = "#8e5f58";
const SOCKET = "#4a4542";
const GLAND = "#3e3835";

// ---------------------------------------------------------------------------------------------------------------
// Hide paint: belly-light / back-dark, soft mottle, dust on the lower body and back, cell creases

function crease(p: THREE.Vector3, size: number, seed: number) {
  const c = cells(p, size, seed);
  return 1 - smoothstep(0.02, 0.14, c.d2 - c.d1);
}

const hide = paint((p, n) => {
  let base = mix(SKIN_BELLY, SKIN_MID, smoothstep(-0.75, 0.0, n.y));
  base = mix(base, SKIN_TOP, smoothstep(0.1, 0.85, n.y) * 0.8);
  // soft mottle
  base = mix(base, SKIN_SHADE, smoothstep(0.52, 0.72, noise(p, 0.7, 2)) * 0.35);
  // dust: from the ground up, and settled on the back
  const low = 1 - smoothstep(0.08, 1.05, p.y);
  const dusted = smoothstep(0.55, 0.75, noise(p, 0.9, 9)) * smoothstep(0.35, 0.85, n.y) * 0.65;
  let d = Math.max(low * 0.8, dusted);
  base = mix(base, mix(DUST, DUST_DEEP, noise(p, 0.3, 4)), d);
  // creases in two scales
  const c1 = crease(p, 0.2, 3);
  const c2 = crease(p, 0.07, 11) * 0.4;
  base = mix(base, SKIN_SHADE, Math.max(c1 * 0.5, c2 * (1 - low)));
  return base;
});

// knee, ankle and elbow wrinkle rows on the legs
const legHide = paint((p, n, s) => {
  const base = resolve(hide, p, n);
  const w = noise(p, 0.25, 21) * 0.1;
  const rows = Math.abs(Math.sin((p.y + w) * 42));
  const zones =
    smoothstep(0.25, 0.4, p.y) * (1 - smoothstep(1.55, 1.75, p.y)) * (0.4 + 0.6 * smoothstep(0.35, 0.75, noise(p, 0.5, 5)));
  const line = smoothstep(0.9, 0.97, rows) * zones;
  void s;
  return mix(base, SKIN_SHADE, line * 0.55);
});

const earPaint = paint((p, n, s) => {
  // faces vs rim walls: walls face squarely away from the slab's thickness
  const nx = Math.abs(n.x);
  const veins = 1 - smoothstep(0.02, 0.1, (() => { const c = cells(p, 0.22, 5); return c.d2 - c.d1; })());
  let base = mix(EAR_IN, resolve(hide, p, n), smoothstep(-0.2, 0.2, s[1]) * 0.9);
  base = mix(base, PINK, smoothstep(0.55, 0.8, noise(p, 0.3, 7)) * 0.5);
  base = mix(base, EAR_VEIN, veins * 0.5 * (1 - smoothstep(0.1, 0.4, s[1])));
  const wall = 1 - smoothstep(0.55, 0.85, nx);
  return mix(base, EAR_RIM, wall * 0.0 + Math.min(1, Math.max(0, 1 - Math.abs(n.y) * 0 - nx * 0)) * 0);
});

// ---------------------------------------------------------------------------------------------------------------
// Textures

const tuft = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
     <g fill="none" stroke="#1c1816" stroke-width="3.4" stroke-linecap="round">
       <path d="M16 64 C14 44 10 28 5 6"/>
       <path d="M16 64 C16 42 16 26 17 2"/>
       <path d="M16 64 C18 44 23 28 28 8"/>
     </g>
   </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "africanElephant", paintSize: 2048 });
  const rand = rng(11);

  // =========================================================================================================
  // Skeleton
  const hips = b.joint("hips", { at: [0, 2.5, -1.6], dir: [0, 0, 1], role: "spine", group: "body" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.5, -1.2],
      [0, 2.55, -0.3],
      [0, 2.6, 0.6],
      [0, 2.6, 1.2],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine", group: "body" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 2.6, 1.2], aim: [0, 2.7, 1.55], role: "neck", group: "head" });
  const head = b.joint("head", { parent: neck, at: [0, 2.7, 1.5], dir: [0, -0.05, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.4, 1.6], aim: [0, 2.26, 2.1], role: "jaw", group: "head" });

  // tail
  const tailPath = catmull([
    [0, 2.55, -1.9],
    [0, 2.3, -2.18],
    [0, 1.75, -2.28],
    [0, 1.25, -2.27],
    [0, 1.0, -2.24],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, count: 5, role: "tail", group: "tail" });

  // trunk
  const trunkPath = catmull([
    [0, 2.55, 2.0],
    [0, 1.95, 2.3],
    [0, 1.35, 2.42],
    [0, 0.82, 2.46],
    [0, 0.47, 2.62],
    [0, 0.36, 2.88],
    [0, 0.5, 3.05],
  ]);
  const trunk = b.chain("trunk", trunkPath, { parent: head, count: 7, role: "tentacle", group: "trunk" });

  // legs
  const legs: Record<string, { chain: ReturnType<typeof b.chain>; x: number; z: number }> = {};
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const front = b.chain(
      `legF${L}`,
      catmull([
        [s * 0.52, 2.2, 0.72],
        [s * 0.56, 1.3, 0.7],
        [s * 0.56, 0.6, 0.72],
        [s * 0.56, 0.3, 0.72],
      ]),
      {
        parent: chest,
        names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `footF${L}`],
        role: "leg",
        group: `leg${L}`,
        contact: [s * 0.56, 0, 0.72],
      },
    );
    legs[`F${L}`] = { chain: front, x: s * 0.56, z: 0.72 };
    const hind = b.chain(
      `legH${L}`,
      catmull([
        [s * 0.55, 2.2, -1.38],
        [s * 0.6, 1.25, -1.08],
        [s * 0.58, 0.58, -1.4],
        [s * 0.58, 0.3, -1.42],
      ]),
      {
        parent: hips,
        names: [`hip${L}`, `knee${L}`, `hock${L}`, `footH${L}`],
        role: "leg",
        group: `leg${L}`,
        contact: [s * 0.58, 0, -1.42],
      },
    );
    legs[`H${L}`] = { chain: hind, x: s * 0.58, z: -1.42 };
  }

  // ears
  const ears: Record<string, THREE.Object3D | any> = {};
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    ears[L] = b.joint(`ear${L}`, {
      parent: head,
      at: [s * 0.46, 3.18, 1.45],
      dir: [s * 0.5, -0.5, -0.8],
      role: "hinge",
      group: `ear${L}`,
    });
  }

  // =========================================================================================================
  // Body
  const body = b.loft(
    [
      { at: [0, 2.45, -2.1], w: 0.55, h: 0.7 },
      { at: [0, 2.5, -1.92], w: 1.0, h: 1.3 },
      { at: [0, 2.42, -1.5], w: 1.45, h: 1.85 },
      { at: [0, 2.12, -0.7], w: 1.55, h: 1.95 },
      { at: [0, 2.12, 0.25], w: 1.55, h: 2.0 },
      { at: [0, 2.22, 0.85], w: 1.45, h: 2.05 },
      { at: [0, 2.25, 1.3], w: 1.15, h: 1.7 },
    ],
    { bone: [spine, hips], sides: 10, smooth: false, color: hide, name: "body", group: "body" },
  );

  // girth folds across the belly and flanks
  const skin = b.surface(body);
  for (const z of [-0.95, -0.45, 0.0]) {
    const ring = skin.loop([0, 2.1, z], { dir: [0, 0, 1], lift: 0.012 });
    b.sweep(ring.slice(0.2, 0.8), 0.022, { color: SKIN_SHADE.map((v) => v * 0.9) as unknown as string, sides: 4, group: "body" });
  }
  // shoulder blade and hip bulge pads
  for (const s of [1, -1]) {
    const hipHit = skin.nearest([s * 0.9, 2.35, -1.45]);
    b.stick(new THREE.SphereGeometry(0.3, 7, 5), hide, hipHit, { embed: 0.5, scale: [1, 0.6, 1.2], flat: true, group: "body" });
    const shoulder = skin.nearest([s * 0.9, 2.5, 0.8]);
    b.stick(new THREE.SphereGeometry(0.3, 7, 5), hide, shoulder, { embed: 0.5, scale: [1, 0.55, 1.2], flat: true, group: "body" });
  }
  // backbone ridge: small bristle tufts
  const backHits = skin.scatter(70, { rng: rand, minDist: 0.22, filter: (h) => h.n.y > 0.8 });
  b.cards(backHits, tuft, { size: [0.05, 0.09], lean: 20, vary: 0.35, rng: rng(5), cross: true });

  // =========================================================================================================
  // Head
  const skull = b.loft(
    [
      { at: [0, 2.78, 1.05], w: 0.85, h: 1.05 },
      { at: [0, 2.85, 1.45], w: 0.98, h: 1.28 },
      { at: [0, 2.72, 1.85], w: 0.8, h: 1.2 },
      { at: [0, 2.5, 2.13], w: 0.5, h: 0.78 },
    ],
    { bone: head, sides: 8, smooth: false, color: hide, name: "skull", group: "head" },
  );
  const jawMesh = b.loft(
    [
      { at: [0, 2.34, 1.65], w: 0.5, h: 0.26 },
      { at: [0, 2.27, 2.0], w: 0.42, h: 0.22 },
      { at: [0, 2.24, 2.18], w: 0.28, h: 0.18 },
    ],
    { bone: jaw, sides: 6, smooth: false, color: mix(SKIN_BELLY, PINK, 0.35) as unknown as string, name: "lowerJaw", group: "head" },
  );
  void jawMesh;
  const faceSkin = b.surface(skull);

  // forehead lobes and cheeks
  for (const s of [1, -1]) {
    const crown = faceSkin.nearest([s * 0.25, 3.5, 1.45]);
    b.stick(new THREE.SphereGeometry(0.3, 7, 5), hide, crown, { embed: 0.55, scale: [1, 0.75, 1], flat: true, group: "head" });
    const cheek = faceSkin.nearest([s * 0.6, 2.45, 1.7]);
    b.stick(new THREE.SphereGeometry(0.22, 6, 4), hide, cheek, { embed: 0.5, flat: true, group: "head" });
  }
  // brow wrinkles draped on the forehead
  for (const [y, z, amp] of [
    [3.12, 1.95, 0.05],
    [3.3, 1.7, 0.06],
    [3.43, 1.45, 0.05],
  ] as const) {
    const arc = faceSkin.drape(
      catmull([
        [-0.36, y - 0.1, z],
        [-0.18, y + amp, z],
        [0.18, y + amp, z],
        [0.36, y - 0.1, z],
      ]),
      { lift: 0.01 },
    );
    b.sweep(arc, 0.014, { color: "#4d4845", sides: 4, group: "head" });
  }
  // crown and chin bristles
  const crownHits = faceSkin.scatter(40, { rng: rng(8), minDist: 0.11, filter: (h) => h.n.y > 0.55 && h.at.y > 3.2 });
  b.cards(crownHits, tuft, { size: [0.05, 0.1], lean: 25, vary: 0.3, rng: rng(9), cross: true });

  // eyes
  for (const s of [1, -1]) {
    const hit = faceSkin.nearest([s * 0.6, 2.8, 1.85]);
    b.stick(new THREE.SphereGeometry(0.08, 7, 4), SOCKET, hit, { embed: 0.6, scale: [1, 0.5, 1], flat: true, group: "head" });
    const eye = b.stick(new THREE.SphereGeometry(0.045, 7, 5), AMBER, hit, { embed: 0.45, flat: true, group: "head" });
    b.stick(new THREE.SphereGeometry(0.025, 6, 4), PUPIL, hit.moved([0, 0.03, 0]), { embed: 0.3, group: "head" });
    b.stick(new THREE.SphereGeometry(0.01, 5, 3), GLINT, hit.moved([0.012, 0.048, 0.014]), { embed: 0.3, group: "head" });
    b.ring(hit, { count: 6, radius: 0.055, fromDeg: -80, toDeg: 80, tilt: 40 }, (lash) =>
      b.spike(lash, lash, 0.06, 0.007, { color: LASH, sides: 4, group: "head" }),
    );
    void eye;
    // temporal gland streak
    const gland = faceSkin.nearest([s * 0.55, 2.64, 1.8]);
    b.stick(new THREE.SphereGeometry(0.035, 5, 3), GLAND, gland, { embed: 0.5, scale: [1, 0.5, 2.2], flat: true, group: "head" });
  }

  // =========================================================================================================
  // Trunk
  const trunkL = trunkPath.length;
  const trunkPaint = paint((p, n, s) => {
    const base = resolve(hide, p, n);
    const along = (s[0] * trunkL) / 0.075;
    const f = along - Math.floor(along);
    const ring = (1 - smoothstep(0.12, 0.34, f)) * (1 - smoothstep(0.88, 0.97, s[0]));
    const under = smoothstep(120, 180, s[1]) * 0.45;
    let c = mix(base, PINK, under);
    c = mix(c, SKIN_SHADE, ring * 0.7);
    return mix(c, PINK, smoothstep(0.9, 1.0, s[0]) * 0.6);
  });
  const trunkSweep = b.sweep(trunk, [0.3, 0.27, 0.215, 0.165, 0.125, 0.095, 0.075], {
    sides: 8,
    smooth: false,
    color: trunkPaint,
    name: "trunk",
    group: "trunk",
  });
  void trunkSweep;
  // trunk fingers and nostril
  const tipEnd = trunk.joints[trunk.joints.length - 1];
  const tipFrame = trunk.at(1);
  b.spike(tipFrame, [0, 0.55, 3.28], null, 0.055, {
    color: mix(SKIN_MID, PINK, 0.4) as unknown as string,
    sides: 5,
    bone: tipEnd,
    group: "trunk",
  });
  b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.02, 6), PUPIL, {
    bone: tipEnd,
    at: [0, 0.53, 3.05],
    dir: [0, 0.2, 1],
    axis: "z",
    group: "trunk",
  });
  b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.02, 6), PUPIL, {
    bone: tipEnd,
    at: [0, 0.455, 3.04],
    dir: [0, -0.4, 1],
    axis: "z",
    group: "trunk",
  });
  // whisker hairs on the trunk's base
  const trunkHairHits = b.surface(trunkSweep).scatter(26, { rng: rng(12), minDist: 0.1, filter: (h) => h.at.y > 1.8 });
  b.cards(trunkHairHits, tuft, { size: [0.04, 0.08], lean: 40, vary: 0.3, rng: rng(13) });

  // =========================================================================================================
  // Tusks
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const full = catmull([
      [s * 0.26, 2.3, 1.85],
      [s * 0.36, 1.97, 2.3],
      [s * 0.42, 1.6, 2.8],
      [s * 0.4, 1.4, 3.3],
      [s * 0.34, 1.36, 3.72],
      [s * 0.3, 1.5, 4.0],
    ]);
    const broken = s < 0;
    const path = broken ? full.slice(0, 0.88) : full;
    const tusk = b.sweep(path, broken ? [0.1, 0.092, 0.07, 0.05, 0.034] : [0.1, 0.092, 0.07, 0.045, 0.02], {
      bone: head,
      sides: 7,
      smooth: false,
      caps: { start: "flat", end: broken ? "flat" : "point" },
      color: paint((p, n, s2) => {
        if (s2[0] < 0.09) return IVORY_ROOT;
        const c = mix(IVORY, IVORY_D, smoothstep(0.5, 0.8, noise(p, 0.12, 3)) * 0.8 + smoothstep(0.55, 1, s2[0]) * 0.0);
        void n;
        return mix(c, IVORY_D, smoothstep(0.85, 1.0, s2[0]) * 0.5);
      }),
      name: `tusk${L}`,
      group: `tusk${L}`,
    });
    void tusk;
    // gum collar where the tusk leaves the lip
    b.sweep([[s * 0.28, 2.25, 1.9], [s * 0.32, 2.1, 2.1]], 0.13, { bone: head, color: mix(SKIN_MID, PINK, 0.25) as unknown as string, sides: 7, smooth: false, caps: "round", group: `tusk${L}` });
  }

  // =========================================================================================================
  // Ears: Africa-shaped slabs on hinge joints
  const earOutline: OutlinePoint[] = [
    [0, 0.05],
    [0.3, 0.2],
    [0.7, 0.18],
    [1.0, -0.02],
    [1.15, -0.35],
    [1.05, -0.7],
    [0.95, -1.05],
    [0.7, -1.4],
    [0.5, -1.58, "sharp"],
    [0.38, -1.2],
    [0.22, -0.85],
    [0.05, -0.6],
    [0, -0.3],
  ];
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const ear = b.extrude(earOutline, {
      at: [s * 0.46, 3.18, 1.45],
      x: [s * 0.55, 0, -1],
      y: [0, 1, 0],
      thickness: 0.05,
      bevel: 0.015,
      smoothing: 0,
      color: earPaint,
      bone: ears[L],
      name: `ear${L}`,
      group: `ear${L}`,
    });
    void ear;
  }

  // =========================================================================================================
  // Legs, feet and toenails
  for (const key of Object.keys(legs)) {
    const { chain, x, z } = legs[key];
    const hind = key[0] === "H";
    const radii = hind ? [0.36, 0.33, 0.28, 0.25] : [0.34, 0.3, 0.27, 0.25];
    b.sweep(chain, radii, { sides: 7, smooth: false, color: legHide, name: `leg${key}`, group: `leg${key[1]}` });
    const foot = chain.tip!;
    // foot drum with a darker sole rim
    b.part(new THREE.CylinderGeometry(0.28, 0.32, 0.3, 8), legHide, { bone: foot, at: [x, 0.14, z], flat: true, group: `leg${key[1]}` });
    b.part(new THREE.CylinderGeometry(0.325, 0.33, 0.045, 8), "#5d564f", { bone: foot, at: [x, 0.012, z], flat: true, group: `leg${key[1]}` });
    const angles = hind ? [-26, 0, 26] : [-38, -13, 13, 38];
    for (const a of angles) {
      const rad = (a * Math.PI) / 180;
      const R = 0.335;
      const at: [number, number, number] = [x + R * Math.sin(rad), 0.085, z + R * Math.cos(rad)];
      b.part(new THREE.BoxGeometry(0.115, 0.115, 0.055), NAIL, {
        bone: foot,
        at,
        dir: [Math.sin(rad), 0.12, Math.cos(rad)],
        axis: "z",
        group: `leg${key[1]}`,
      });
      b.part(new THREE.BoxGeometry(0.115, 0.03, 0.056), NAIL_D, {
        bone: foot,
        at: [at[0], 0.03, at[2]],
        dir: [Math.sin(rad), 0.12, Math.cos(rad)],
        axis: "z",
        group: `leg${key[1]}`,
      });
    }
  }

  // =========================================================================================================
  // Tail
  b.sweep(tail, [0.1, 0.075, 0.05, 0.035, 0.03], { sides: 6, smooth: false, color: legHide, name: "tail", group: "tail" });
  b.ring(
    tail.at(1),
    { count: 9, radius: 0.012, tilt: 38 },
    (h) => b.spike(h, h, 0.28, 0.014, { color: HAIR, sides: 4, group: "tail" }),
  );
  b.ring(
    tail.at(1),
    { count: 6, radius: 0.012, tilt: 18 },
    (h) => b.spike(h, h, 0.4, 0.012, { color: HAIR, sides: 4, group: "tail" }),
  );

  // mouth: lip line draped under the trunk base
  const mouthLine = faceSkin.drape(
    catmull([
      [-0.24, 2.3, 1.95],
      [-0.12, 2.27, 2.12],
      [0.12, 2.27, 2.12],
      [0.24, 2.3, 1.95],
    ]),
    { lift: 0.01 },
  );
  b.sweep(mouthLine, 0.016, { color: MOUTH, sides: 4, group: "head" });

  return b.root;
}
