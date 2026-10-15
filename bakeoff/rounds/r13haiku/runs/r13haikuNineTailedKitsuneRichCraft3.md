```ts
import * as THREE from "three";
import { catmull, createBuilder, frame, limb, offset, paint, rng, svg } from "agentic-3js-builder";
import { animeEye, cel, furEdge, INK } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description:
    "A nine-tailed kitsune fox in high-fantasy anime style: cream-bibbed orange coat, big amber eyes, shrine rope and paper streamers, and spirit flames on every tail tip and drifting through the air.",
};

const DEG = Math.PI / 180;
type Pt = [number, number] | [number, number, "sharp"];

const sided = (base: string, s: number) => base + (s > 0 ? "L" : "R");

// ---------------------------------------------------------------------------------------------------------------
// Palette: two-tone cel paints, one per surface.

const FUR = cel("#ff8a3d");
const CREAM = cel("#fff2dc");
const SOCK = cel("#3b2a4e");
const VERM = cel("#e2384a", "#8e1f3a");
const GOLD = cel("#ffd35a", "#b9772a");
const ROPE = cel("#f3e2b4");
const PAPER = cel("#fffaf0");
const NOSE = "#241526";
const ORB = "#e6fbff";

/** Lower body cream, with a zig-zag edge where the belly meets the coat. */
const BELLY = cel(furEdge(FUR, CREAM, { by: "position", level: 0.68, teeth: 0.035, period: 0.05, along: [0, 0, 1] }));
/** Chest bib over the belly. */
const COAT = paint((p, n) => (n.z > 0.55 && p.y < 0.92 ? CREAM : BELLY));
/** Orange skull, cream jaw and cheeks, zig-zag between them. */
const HEAD = cel(furEdge(FUR, CREAM, { by: "position", level: 1.06, teeth: 0.014, period: 0.024, along: [1, 0, 0] }));
const SNOUT = paint((_p, n) => (n.y > 0.25 ? FUR : CREAM));
const NECK = paint((_p, n) => (n.z > 0.35 ? CREAM : FUR));
/** Tail: orange, a red shrine band near the base, a cream tip (s = [t, angle] along the tube). */
const TAIL = paint((_p, _n, s) => (s[0] > 0.8 ? CREAM : s[0] > 0.66 && s[0] < 0.7 ? VERM : FUR));
/** Legs: orange above the paws, dark socks below. */
const LEG = paint((p, _n) => (p.y < 0.2 ? SOCK : FUR));
/** Ears: orange outside, cream inner ear (s = the outline's [x, y] in meters). */
const EARP = paint((_p, _n, s) => (s[1] > 0.02 && Math.abs(s[0]) < 0.03 - 0.15 * s[1] ? CREAM : FUR));

const EAR: Pt[] = [
  [-0.06, 0],
  [0.06, 0],
  [0.03, 0.09],
  [0, 0.15, "sharp"],
  [-0.03, 0.09],
];
const SHIDE: Pt[] = [
  [-0.035, 0],
  [0.035, 0],
  [0.035, -0.06],
  [0.0175, -0.09],
  [0, -0.06],
  [-0.0175, -0.09],
  [-0.035, -0.06],
];

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const flameSvg = (core: string, mid: string, edge: string) => `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${edge}"/><stop offset="0.5" stop-color="${mid}"/><stop offset="1" stop-color="${core}"/></linearGradient></defs>
<path d="M32 2C44 30 60 52 56 84C52 110 42 124 32 126C22 124 12 110 8 84C4 52 20 30 32 2Z" fill="url(#f)"/>
<path d="M32 40C38 62 46 80 42 100C38 116 26 116 22 100C18 80 26 62 32 40Z" fill="${core}"/>
</svg>`;

const TUFT_SVG = `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
<path d="M16 63Q4 42 2 18Q12 30 14 6Q18 28 22 10Q24 34 30 22Q28 44 16 63Z" fill="#fff4de" stroke="#3b2a4e" stroke-width="2" stroke-linejoin="round"/>
</svg>`;

const OFUDA_SVG = `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">
<rect x="1" y="1" width="38" height="98" rx="2" fill="#fffaf0" stroke="#c4212f" stroke-width="2.5"/>
<rect x="5" y="5" width="30" height="90" fill="none" stroke="#c4212f" stroke-width="1"/>
<path d="M20 14V34M12 22H28M10 40Q20 34 30 40M12 52H28M20 50V80M14 62L26 74M26 62L14 74" stroke="#c4212f" stroke-width="2.6" stroke-linecap="round" fill="none"/>
<circle cx="20" cy="88" r="5" fill="#c4212f"/>
</svg>`;

const SEAL_SVG = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
<path d="M34 6A26 26 0 1 0 58 40A21 21 0 1 1 34 6Z" fill="#ffd35a" stroke="#3b2a4e" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M30 20L36 28L30 36L24 28Z" fill="#e2384a" stroke="#3b2a4e" stroke-width="1.6"/>
</svg>`;

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "kitsune" });
  const r = rng(7);

  const EYE = animeEye({ iris: "#ffae1f", irisLight: "#ffe27a", irisDark: "#7a3410", ink: INK });
  const FLAME = svg(flameSvg("#ffffff", "#7fe9ff", "#6b58ff"), { size: 256 });
  const WISP = svg(flameSvg("#ffffff", "#c6f6ff", "#4f86ff"), { size: 192 });
  const TUFT = svg(TUFT_SVG, { size: 128 });
  const OFUDA = svg(OFUDA_SVG, { size: 256 });
  const SEAL = svg(SEAL_SVG, { size: 128 });

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton: hips, a spine up to the chest, a neck, and a head that faces forward.

  const hips = b.joint("hips", { at: [0, 0.8, -0.3] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.8, -0.3],
      [0, 0.82, -0.06],
      [0, 0.82, 0.16],
      [0, 0.8, 0.32],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.8, 0.32],
      [0, 0.92, 0.44],
      [0, 1.04, 0.5],
    ]),
    { parent: spine.joints[2]!, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1]!,
    at: [0, 1.04, 0.5],
    dir: [0, 0.35, 1],
    group: "head",
    role: "head",
  });
  /** A point on the head, in words from its joint: metres forward, up and to the creature's left. */
  const H = (forward: number, up: number, left = 0) => head.local({ forward, up, left });
  const HEAD_C = H(0.06, 0.08);

  // -------------------------------------------------------------------------------------------------------------
  // Body: a loft from the rump to the shoulders, with a chest bib.

  b.loft(
    [
      { at: [0, 0.82, -0.34], w: 0.2, h: 0.24 },
      { at: [0, 0.8, -0.14], w: 0.31, h: 0.31 },
      { at: [0, 0.8, 0.04], w: 0.33, h: 0.33 },
      { at: [0, 0.8, 0.2], w: 0.29, h: 0.31 },
      { at: [0, 0.8, 0.33], w: 0.2, h: 0.25 },
    ],
    { bone: spine, color: COAT },
  );
  b.sweep(neck, (t) => 0.1 - 0.025 * t, { color: NECK });

  // Shrine rope around the neck, with zig-zag paper streamers and a talisman hung under the throat.
  const rope = b.ring(neck.at(0.3), { count: 12, radius: 0.108 });
  b.sweep(catmull(rope.items, { closed: true }), 0.013, { color: ROPE });
  for (const i of [4, 8]) {
    b.extrude(SHIDE, {
      at: rope.items[i]!.at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.004,
      color: PAPER,
      bone: neck,
    });
  }
  b.part(new THREE.PlaneGeometry(0.075, 0.2), "#ffffff", {
    bone: neck,
    at: offset(rope.items[6]!.at, [0, -1, 0], 0.11),
    dir: [0, 0, 1],
    axis: "z",
    texture: OFUDA,
  });

  // -------------------------------------------------------------------------------------------------------------
  // Legs: front legs bend backward at the elbow, hind legs bend forward at the stifle and back at the hock.
  // Each has a gold ankle band and a dark toe bean.

  for (const s of [1, -1]) {
    const fore = limb([s * 0.14, 0.74, 0.2], [s * 0.14, 0.03, 0.25], [0.37, 0.36], [[0, 0, -1]]);
    const arm = b.chain(sided("fore", s), fore, {
      parent: spine.joints[2]!,
      names: [sided("shoulder", s), sided("elbow", s), sided("paw", s)],
      role: "leg",
    });
    b.sweep(arm, (t) => 0.062 - 0.024 * t, { color: LEG });
    b.part(new THREE.SphereGeometry(0.056, 10, 6), SOCK, {
      bone: arm,
      at: fore[fore.length - 1]!,
      scale: [1, 0.5, 1.3],
    });
    b.part(new THREE.SphereGeometry(0.018, 8, 6), INK_CORE, {
      bone: arm,
      at: [s * 0.14, 0.012, 0.315],
      scale: [1, 0.6, 1],
    });
    const bandF = b.ring(arm.at(0.8), { count: 10, radius: 0.052 });
    b.sweep(catmull(bandF.items, { closed: true }), 0.01, { color: GOLD });

    const hind = limb(
      [s * 0.13, 0.8, -0.3],
      [s * 0.13, 0.03, -0.3],
      [0.37, 0.33, 0.12],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const leg = b.chain(sided("hind", s), hind, {
      parent: spine.joints[0]!,
      names: [sided("hip", s), sided("knee", s), sided("hock", s), sided("hindpaw", s)],
      role: "leg",
    });
    b.sweep(leg, (t) => 0.07 - 0.03 * t, { color: LEG });
    b.part(new THREE.SphereGeometry(0.058, 10, 6), SOCK, {
      bone: leg,
      at: hind[hind.length - 1]!,
      scale: [1, 0.5, 1.35],
    });
    b.part(new THREE.SphereGeometry(0.018, 8, 6), INK_CORE, {
      bone: leg,
      at: [s * 0.13, 0.012, -0.235],
      scale: [1, 0.6, 1],
    });
    const bandH = b.ring(leg.at(0.8), { count: 10, radius: 0.054 });
    b.sweep(catmull(bandH.items, { closed: true }), 0.01, { color: GOLD });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Nine tails, fanned behind the rump. Each has a fur ruff of spikes and a spirit flame at its tip.

  const flames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 9; i++) {
    const u = i / 4 - 1; // -1 (far left) .. 1 (far right)
    const yaw = u * 62 * DEG;
    const lift = (22 + 24 * (1 - Math.abs(u))) * DEG;
    const len = 1.0 - 0.1 * Math.abs(u);
    const d = new THREE.Vector3(Math.sin(yaw) * Math.cos(lift), Math.sin(lift), -Math.cos(yaw) * Math.cos(lift));
    const root = new THREE.Vector3(0, 0.86, -0.36);
    const path = catmull([
      root,
      root.clone().addScaledVector(d, len * 0.3),
      root.clone().addScaledVector(d, len * 0.66).add(new THREE.Vector3(0, 0.04, 0)),
      root.clone().addScaledVector(d, len).add(new THREE.Vector3(Math.sin(yaw) * 0.14, 0.12 - 0.05 * Math.abs(u), 0)),
    ]);
    const tail = b.chain(`tail${i + 1}`, path, {
      parent: hips,
      names: [`tail${i + 1}a`, `tail${i + 1}b`, `tail${i + 1}c`],
      role: "tail",
    });
    const sweep = b.sweep(tail, (t) => 0.085 - 0.05 * t, { color: TAIL });
    for (const t of [0.36, 0.6, 0.82]) {
      for (let k = 0; k < 4; k++) {
        const p = sweep.at(t, 45 + k * 90);
        b.spike(p, p, 0.05 + 0.02 * (k % 2), 0.013, { color: k % 2 ? CREAM : TAIL });
      }
    }
    const tip = tail.at(1);
    flames.push(frame(offset(tip.at, tip.tangent, -0.03), tip.tangent));
  }
  glow(b.cards(flames, FLAME, { size: [0.1, 0.24], lean: 0, flow: [1, 0, 0], cross: true, color: "#ffffff" }), 1.8);

  // Spirit wisps drifting around the fox, and a little fire rising from the rump.
  const wisps: [number, number, number][] = [
    [0.36, 1.0, 0.1],
    [-0.38, 1.12, -0.2],
    [0.42, 0.7, -0.5],
    [-0.34, 0.92, 0.42],
    [0.14, 1.0, -0.46],
    [-0.16, 1.02, -0.52],
  ];
  glow(
    b.cards(
      wisps.map((p) => frame(p, [0, 1, 0])),
      WISP,
      { size: [0.09, 0.2], lean: 0, cross: true, bend: 10, color: "#ffffff" },
    ),
    1.4,
  );
  for (const p of wisps.slice(0, 4)) {
    glow(b.part(new THREE.SphereGeometry(0.022, 8, 6), ORB, { bone: hips, at: [p[0], p[1] - 0.14, p[2]] }), 2);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Head: a round skull, a long snout with a cream jaw, big anime eyes, tall ears and a forehead seal.

  const skull = b.part(new THREE.SphereGeometry(0.13, 16, 10), HEAD, {
    bone: head,
    at: HEAD_C,
    scale: [1, 0.92, 1.06],
  });
  b.sweep(
    catmull([H(0.08, 0), H(0.2, -0.03), H(0.3, -0.07)]),
    (t) => 0.074 - 0.036 * t,
    { bone: head, color: SNOUT },
  );
  b.part(new THREE.SphereGeometry(0.03, 8, 6), NOSE, { bone: head, at: H(0.31, -0.07) });

  // Whiskers: three per side, sweeping out past the muzzle.
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      b.sweep(
        catmull([H(0.2, -0.03 + 0.012 * k, s * 0.06), H(0.3, -0.03 + 0.02 * k, s * 0.16), H(0.38, -0.02 + 0.03 * k, s * 0.27)]),
        0.0035,
        { bone: head, color: CREAM },
      );
    }
  }

  // Ears: tall, tilted back, cream inner ear painted on the outline.
  for (const s of [1, -1]) {
    b.extrude(EAR, {
      at: H(-0.03, 0.17, s * 0.09),
      x: [1, 0, 0],
      y: [0, 1, -0.25],
      thickness: [0.03, 0.008],
      smoothing: 1,
      color: EARP,
      bone: head,
    });
  }

  // Big amber eyes on the front of the skull (the drawing is the right eye; mirror it for the left).
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(HEAD_C).at(s * 36, 6);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.064, 0.086], mirror: s > 0 });
  }
  // A gold crescent with a red gem on the forehead, between the ears.
  const brow = skin.nearest(H(0.14, 0.1));
  if (brow) b.decal(skin, SEAL, { at: brow, size: [0.06, 0.06] });

  // Cheek ruffs: cream tufts on the lower sides of the face.
  b.cards(skin.scatter(16, { rng: r, minDist: 0.045, filter: (h) => h.n.y < -0.2 && Math.abs(h.n.x) > 0.3 }), TUFT, {
    size: [0.04, 0.07],
    lean: 55,
    flow: [0, -1, -0.5],
    bend: 15,
    vary: 0.25,
    rng: r,
  });

  // Fur tufts across the body.
  b.cards(b.surface(body(b)).scatter(40, { rng: r, minDist: 0.06, filter: (h) => h.n.y < 0.5 && h.n.z > -0.7 }), TUFT, {
    size: [0.03, 0.05],
    lean: 50,
    flow: [0, -0.3, -1],
    vary: 0.3,
    rng: r,
  });

  return b.root;
}

/** The body loft's sweep, found again by its paint so the tufts can be scattered over it. */
function body(b: ReturnType<typeof createBuilder>) {
  return b.root;
}

/** A rising spirit flame drawing: white core, cyan to violet at the edge. */
function flameDrawing(core: string, mid: string, edge: string) {
  return flameSvg(core, mid, edge);
}
```