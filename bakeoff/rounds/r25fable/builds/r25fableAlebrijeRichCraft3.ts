import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  vec,
  offset,
  catmull,
  bezier,
  limb,
  paint,
  cells,
  noise,
  svg,
} from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description:
    "A carved-wood Oaxacan alebrije: a jaguar body on sturdy legs with great eagle wings, a feathered ruff and crest, a fanned eagle tail and a curling jaguar tail, every surface painted in dots, rosettes and bright bands.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: the saturated Oaxacan alebrije colours, each used as a flat colour or inside a paint.
const MAGENTA = "#e0218a";
const ORANGE = "#ff7a1a";
const YELLOW = "#ffd21f";
const TEAL = "#19b3b1";
const BLUE = "#2448b8";
const PURPLE = "#6b2ea0";
const LIME = "#8fd63a";
const CREAM = "#fff2cf";
const BLACK = "#1a1020";
const WHITE = "#ffffff";
const RED = "#d9262b";
const PINK = "#ff8ab0";

// ---------------------------------------------------------------------------------------------------------------
// Paints: alebrije dotwork. Dots are laid in Worley cells so they tile every surface at one size in meters.

/** Round dots about `size` apart over a base colour, each dot one of `dots`. */
function dotted(base: string, dots: string[], size: number, r = 0.28, seed = 1) {
  return paint((p) => {
    const c = cells(p, size, seed);
    if (c.d1 < r) return dots[Math.floor(c.id * dots.length) % dots.length];
    return base;
  });
}

/** Jaguar rosettes drawn the alebrije way: a core dot ringed by a circle of smaller dots. */
function rosettes(base: string, ring: string, core: string, size: number, seed: number) {
  return paint((p, n) => {
    const c = cells(p, size, seed);
    if (c.d1 < 0.14) return core;
    if (c.d1 > 0.3 && c.d1 < 0.46) {
      const d = p.clone().sub(c.center);
      const ax = Math.abs(n.x);
      const ay = Math.abs(n.y);
      const az = Math.abs(n.z);
      const [u, v] = ax > ay && ax > az ? [d.y, d.z] : ay > az ? [d.x, d.z] : [d.x, d.y];
      const a = (Math.atan2(v, u) / (Math.PI * 2)) * 9;
      const f = a - Math.floor(a);
      if (Math.abs(f - 0.5) < 0.2) return ring;
    }
    return base;
  });
}

/** Fine zigzag line pattern (the alebrije "hatching") over a base. */
function zigzagged(base: string, lineColor: string, size: number, axis: "x" | "z") {
  return paint((p) => {
    const u = axis === "x" ? p.x : p.z;
    const v = p.y;
    const tri = Math.abs(((u / size) % 1 + 1) % 1 * 2 - 1);
    const d = Math.abs((((v / size + tri * 0.5) % 1) + 1) % 1 - 0.5);
    return d < 0.1 ? lineColor : base;
  });
}

const ROSETTE = rosettes(ORANGE, TEAL, MAGENTA, 0.11, 3);
const BELLY = dotted(CREAM, [MAGENTA, TEAL, PURPLE], 0.032, 0.25, 8);
const BODY = paint((_p, n) => {
  if (n.y < -0.45) return BELLY;
  if (n.y < -0.32) return BLACK;
  if (n.y < -0.26) return YELLOW;
  return ROSETTE;
});

const SOCK = dotted(PURPLE, [YELLOW, LIME], 0.026, 0.3, 11);
const LEG = paint((p, n) => {
  if (p.y < 0.19) return SOCK;
  if (p.y < 0.205) return WHITE;
  if (p.y < 0.215) return BLACK;
  return BODY.at(p, n);
});

const WINGARM = dotted(BLUE, [WHITE, YELLOW], 0.03, 0.3, 21);
const TAIL_A = dotted(MAGENTA, [YELLOW], 0.025, 0.3, 31);
const TAIL_B = dotted(TEAL, [WHITE], 0.025, 0.3, 32);
const TAIL_C = dotted(PURPLE, [LIME], 0.025, 0.3, 33);
const MUZZLE = dotted(CREAM, [BLACK], 0.03, 0.2, 41);
const JAW = dotted(CREAM, [TEAL], 0.03, 0.2, 42);
const SPIKE = zigzagged(YELLOW, BLACK, 0.02, "x");

/** A flight feather, painted along its own length: dotted blue root, yellow band, dotted magenta, white, black tip. */
function flightPaint(len: number) {
  return paint((p, _n, s) => {
    const u = s[0] / len;
    const v = Math.abs(s[1]);
    if (u > 0.9) return BLACK;
    if (u > 0.8) return WHITE;
    if (v < 0.005) return YELLOW;
    if (u > 0.5) {
      const c = cells(p, 0.03, 4);
      return c.d1 < 0.28 ? WHITE : MAGENTA;
    }
    if (u > 0.38) return u > 0.44 ? YELLOW : RED;
    const c = cells(p, 0.028, 5);
    return c.d1 < 0.26 ? TEAL : BLUE;
  });
}

/** A covert feather: dotted orange with a teal tip band and black edge line. */
function covertPaint(len: number) {
  return paint((p, _n, s) => {
    const u = s[0] / len;
    if (u > 0.9) return BLACK;
    if (u > 0.7) return TEAL;
    if (u > 0.64) return YELLOW;
    const c = cells(p, 0.022, 6);
    return c.d1 < 0.26 ? PURPLE : ORANGE;
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Textures: SVG drawings for the eyes, the forehead sun, the ruff/crest feathers and the tail fan.

function eyeTexture() {
  let dots = "";
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    dots += `<circle cx="${(50 + 43 * Math.cos(a)).toFixed(1)}" cy="${(50 + 37 * Math.sin(a)).toFixed(1)}" r="3.2" fill="${TEAL}"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="50" rx="48" ry="42" fill="${BLACK}"/>
      ${dots}
      <ellipse cx="50" cy="50" rx="38" ry="32" fill="${CREAM}"/>
      <circle cx="50" cy="52" r="24" fill="${YELLOW}"/>
      <circle cx="50" cy="52" r="17.5" fill="${ORANGE}"/>
      <circle cx="50" cy="52" r="11" fill="${BLACK}"/>
      <circle cx="43" cy="44" r="5" fill="${WHITE}"/>
      <circle cx="56" cy="60" r="2.4" fill="${WHITE}"/>
      <path d="M14 36 Q50 10 86 36" stroke="${BLACK}" stroke-width="6" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
}

function sunTexture() {
  let rays = "";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x0 = 50 + 30 * Math.cos(a);
    const y0 = 50 + 30 * Math.sin(a);
    const x1 = 50 + 47 * Math.cos(a);
    const y1 = 50 + 47 * Math.sin(a);
    rays += `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} L${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="${i % 2 ? MAGENTA : YELLOW}" stroke-width="6" stroke-linecap="round"/>`;
  }
  let dots = "";
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    dots += `<circle cx="${(50 + 20 * Math.cos(a)).toFixed(1)}" cy="${(50 + 20 * Math.sin(a)).toFixed(1)}" r="2.8" fill="${BLACK}"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      ${rays}
      <circle cx="50" cy="50" r="30" fill="${BLACK}"/>
      <circle cx="50" cy="50" r="26" fill="${ORANGE}"/>
      ${dots}
      <circle cx="50" cy="50" r="12" fill="${TEAL}"/>
      <circle cx="50" cy="50" r="5" fill="${WHITE}"/>
    </svg>`,
    { size: 256 },
  );
}

/** A short rounded feather for the ruff and crest: base down, tip up. */
function ruffFeatherTexture() {
  return svg(
    `<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2 C36 20 38 60 20 98 C2 60 4 20 20 2 Z" fill="${BLACK}"/>
      <path d="M20 8 C32 24 34 58 20 92 C6 58 8 24 20 8 Z" fill="${TEAL}"/>
      <path d="M20 8 C32 24 34 58 20 60 C6 58 8 24 20 8 Z" fill="${BLUE}"/>
      <path d="M20 14 L20 86" stroke="${YELLOW}" stroke-width="3"/>
      <circle cx="13" cy="40" r="3" fill="${WHITE}"/><circle cx="27" cy="40" r="3" fill="${WHITE}"/>
      <circle cx="12" cy="56" r="3" fill="${MAGENTA}"/><circle cx="28" cy="56" r="3" fill="${MAGENTA}"/>
      <circle cx="14" cy="72" r="3" fill="${WHITE}"/><circle cx="26" cy="72" r="3" fill="${WHITE}"/>
      <path d="M8 24 C14 20 26 20 32 24" stroke="${BLACK}" stroke-width="2.5" fill="none"/>
    </svg>`,
    { size: 256 },
  );
}

/** A long tail feather for the fan: base down, tip up, banded. */
function tailFeatherTexture() {
  let dots = "";
  for (let i = 0; i < 7; i++) {
    const y = 110 + i * 11;
    dots += `<circle cx="13" cy="${y}" r="2.6" fill="${WHITE}"/><circle cx="27" cy="${y}" r="2.6" fill="${WHITE}"/>`;
  }
  return svg(
    `<svg viewBox="0 0 40 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2 C36 20 40 120 20 198 C0 120 4 20 20 2 Z" fill="${BLACK}"/>
      <path d="M20 7 C33 24 36 120 20 192 C4 120 7 24 20 7 Z" fill="${MAGENTA}"/>
      <path d="M11 100 C14 70 26 70 29 100 L34 150 C30 180 10 180 6 150 Z" fill="${ORANGE}"/>
      <path d="M8 60 C14 40 26 40 32 60 L34 85 C30 95 10 95 6 85 Z" fill="${TEAL}"/>
      <path d="M18 165 C22 165 30 170 32 178 C28 190 12 190 8 178 C10 170 16 165 18 165 Z" fill="${YELLOW}"/>
      <path d="M20 10 L20 185" stroke="${YELLOW}" stroke-width="3"/>
      ${dots}
      <circle cx="20" cy="150" r="4" fill="${BLACK}"/>
      <circle cx="20" cy="40" r="4" fill="${WHITE}"/>
      <path d="M7 98 C14 94 26 94 33 98" stroke="${BLACK}" stroke-width="2.5" fill="none"/>
      <path d="M8 124 C14 120 26 120 32 124" stroke="${BLACK}" stroke-width="2.5" fill="none"/>
    </svg>`,
    { size: 384 },
  );
}

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle", paintSize: 2048 });

  const EYE = eyeTexture();
  const SUN = sunTexture();
  const RUFF = ruffFeatherTexture();
  const TAILFEATHER = tailFeatherTexture();

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton: hips root, spine forward to the chest, neck, head and jaw, tail back, legs by IK, wings sideways.

  const hips = b.joint("hips", { at: [0, 0.74, -0.32], dir: [0, 0.1, 1], role: "spine" });

  const spinePath = catmull([
    [0, 0.74, -0.32],
    [0, 0.8, -0.08],
    [0, 0.82, 0.18],
    [0, 0.8, 0.42],
  ]);
  const spine = b.chain("spine", spinePath, { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" });
  const chest = spine.joints[2];

  const neckPath = catmull([
    [0, 0.8, 0.42],
    [0, 0.9, 0.56],
    [0, 1.0, 0.66],
  ]);
  const neck = b.chain("neck", neckPath, { parent: chest, names: ["neck1", "neck2"], role: "neck" });

  const HC: [number, number, number] = [0, 1.05, 0.74]; // skull centre
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.0, 0.68], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.955, 0.78], dir: [0, -0.15, 1], role: "jaw" });

  // -------------------------------------------------------------------------------------------------------------
  // Body: a carved loft over the spine, with the neck tube continuing it.

  const body = b.loft(
    [
      { at: [0, 0.72, -0.54], w: 0.24, h: 0.24 },
      { at: [0, 0.74, -0.32], w: 0.34, h: 0.34 },
      { at: [0, 0.79, -0.05], w: 0.33, h: 0.35 },
      { at: [0, 0.82, 0.2], w: 0.37, h: 0.4 },
      { at: [0, 0.8, 0.42], w: 0.34, h: 0.36 },
      { at: [0, 0.79, 0.56], w: 0.26, h: 0.28 },
    ],
    { bone: spine, color: BODY, sides: 10 },
  );
  const bodySkin = b.surface(body);

  b.sweep(neck, (t) => 0.15 - 0.04 * t, { color: BODY, sides: 10 });

  // Dorsal crest of carved spikes along the back.
  b.along(
    body,
    6,
    (at) => {
      b.spike(at, at, 0.075, 0.025, { color: SPIKE, sides: 6 });
      b.spike(at.moved([0, 0.0, 0]), at, 0.09, 0.012, { color: BLACK, sides: 5 });
    },
    { from: 0.1, to: 0.56 },
  );

  // Shoulder sun plates on both flanks.
  for (const s of [1, -1]) {
    const hit = bodySkin.around([0, 0.82, 0.2]).at(s * 90, 30);
    if (!hit) continue;
    b.stick(new THREE.CylinderGeometry(0.075, 0.08, 0.02, 14), BLACK, hit, { embed: 0.45 });
    b.part(new THREE.CircleGeometry(0.066, 16), WHITE, {
      at: hit.moved([0, 0.014, 0]),
      dir: hit.n,
      axis: "z",
      texture: SUN,
      bone: hit.bone,
    });
  }

  // Hip plates.
  for (const s of [1, -1]) {
    const hit = bodySkin.around([0, 0.74, -0.3]).at(s * 90, 20);
    if (!hit) continue;
    b.stick(new THREE.CylinderGeometry(0.055, 0.06, 0.018, 12), BLACK, hit, { embed: 0.45 });
    b.part(new THREE.CircleGeometry(0.048, 16), WHITE, {
      at: hit.moved([0, 0.012, 0]),
      dir: hit.n,
      axis: "z",
      texture: SUN,
      bone: hit.bone,
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Head: skull, muzzle, separate lower jaw, teeth, nose, eyes, ears, brows, whiskers, forehead sun, crest.

  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), BODY, {
    bone: head,
    at: HC,
    scale: [0.14, 0.125, 0.135],
  });
  const skullSkin = b.surface(skull);

  // Upper jaw / muzzle.
  b.frustumBox([0, 1.0, 0.8], [0, 0.985, 0.99], [0.18, 0.11], [0.13, 0.08], { bone: head, color: MUZZLE });
  // Cheek ruffs: wide blocks either side of the muzzle, painted cream with dots.
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.06, 0.09, 0.1), JAW, {
      bone: head,
      at: [s * 0.1, 0.98, 0.78],
      rotation: [0, s * -20, s * 15],
    });
  // Nose.
  b.part(new THREE.BoxGeometry(0.06, 0.035, 0.035), BLACK, { bone: head, at: [0, 1.005, 0.995] });
  b.part(new THREE.BoxGeometry(0.02, 0.012, 0.012), PINK, { bone: head, at: [0, 0.998, 1.012] });
  // Lip line.
  b.sweep(
    bezier([-0.062, 0.955, 0.93], [0, 0.94, 1.0], [0.062, 0.955, 0.93]),
    0.006,
    { bone: head, color: BLACK, sides: 5 },
  );

  // Lower jaw on its own joint, with tongue.
  b.frustumBox([0, 0.945, 0.79], [0, 0.93, 0.95], [0.15, 0.07], [0.1, 0.05], { bone: jaw, color: JAW });
  b.part(new THREE.BoxGeometry(0.06, 0.015, 0.09), RED, { bone: jaw, at: [0, 0.967, 0.9] });

  // Fangs: upper canines long, lower canines short, a row of small teeth between.
  for (const s of [1, -1]) {
    b.spike([s * 0.05, 0.955, 0.95], [s * 0.1, -1, 0.15], 0.065, 0.014, { bone: head, color: WHITE, sides: 6 });
    b.spike([s * 0.04, 0.955, 0.925], [s * 0.1, 1, 0.1], 0.04, 0.011, { bone: jaw, color: WHITE, sides: 6 });
    for (let i = 0; i < 3; i++)
      b.spike([s * (0.012 + i * 0.012), 0.95, 0.965 - i * 0.004], [0, -1, 0.1], 0.02, 0.006, {
        bone: head,
        color: WHITE,
        sides: 5,
      });
  }

  // Eyes: big alebrije eye decals on the skull, with a slight glow.
  for (const s of [1, -1]) {
    const eye = b.decal(skull, EYE, {
      at: [s * 0.07, 1.085, 0.86],
      dir: [s * 0.4, 0.2, 1],
      size: [0.08, 0.072],
      mirror: s > 0,
      bone: head,
    });
    glow(eye, 0.35);
    // Carved brow ridge above each eye.
    b.sweep(
      bezier([s * 0.03, 1.135, 0.86], [s * 0.09, 1.15, 0.84], [s * 0.13, 1.12, 0.78]),
      [0.012, 0.007],
      { bone: head, color: BLACK, sides: 6 },
    );
    b.sweep(
      bezier([s * 0.03, 1.145, 0.855], [s * 0.09, 1.16, 0.835], [s * 0.13, 1.13, 0.775]),
      [0.006, 0.004],
      { bone: head, color: YELLOW, sides: 5 },
    );
  }

  // Forehead sun emblem.
  {
    const hit = skullSkin.around(HC).at(0, 48);
    if (hit)
      b.part(new THREE.CircleGeometry(0.045, 16), WHITE, {
        at: hit.moved([0, 0.003, 0]),
        dir: hit.n,
        axis: "z",
        texture: SUN,
        bone: head,
      });
  }

  // Ears: outer cone and inner cone, stuck on the skull.
  for (const s of [1, -1]) {
    const hit = skullSkin.around(HC).at(s * 50, 52);
    if (!hit) continue;
    b.stick(new THREE.ConeGeometry(0.05, 0.11, 6), dotted(TEAL, [YELLOW], 0.022, 0.3, 51), hit, { embed: 0.25, flat: true });
    b.stick(new THREE.ConeGeometry(0.03, 0.08, 6), MAGENTA, hit.moved([0, 0.012, 0]), { embed: 0.2, flat: true });
    b.stick(new THREE.ConeGeometry(0.012, 0.045, 5), BLACK, hit.moved([0, 0.1, 0]), { embed: 0.3, flat: true });
  }

  // Whiskers: three per side, carved rods flaring from the muzzle.
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++) {
      const root: [number, number, number] = [s * 0.07, 0.985 - i * 0.012, 0.95 - i * 0.012];
      const tip: [number, number, number] = [s * 0.26, 1.02 - i * 0.035, 0.9 + i * 0.04];
      b.sweep(bezier(root, [s * 0.16, 1.0 - i * 0.02, 0.96], tip), [0.007, 0.002], {
        bone: head,
        color: i === 1 ? YELLOW : WHITE,
        sides: 4,
        caps: { start: "flat", end: "point" },
      });
    }

  // Eagle crest: a fan of feather cards behind the skull.
  {
    const crest = b.ring(frame([0, 1.07, 0.66], [0, -0.35, -1]), {
      count: 9,
      radius: 0.1,
      fromDeg: -105,
      toDeg: 105,
      tilt: -20,
      joints: 3,
      name: "crest",
      parent: head,
      role: "fan",
    });
    b.cards(crest.items, RUFF, { size: [0.075, 0.2], lean: 25, flow: [0, 0.2, -1], sink: 0.2, bend: 15 });
  }

  // Neck ruff: a collar of feather cards sweeping back over the shoulders.
  {
    const ruff = b.ring(neck.at(0.3), { count: 16, radius: 0.145, tilt: 0 });
    b.cards(ruff.items, RUFF, { size: [0.08, 0.2], lean: 55, flow: [0, -0.5, -1], sink: 0.25, bend: 20, vary: 0.15, rng: rng(5) });
    const ruff2 = b.ring(neck.at(0.62), { count: 14, radius: 0.125 });
    b.cards(ruff2.items, RUFF, { size: [0.07, 0.17], lean: 50, flow: [0, -0.5, -1], sink: 0.25, bend: 20, vary: 0.15, rng: rng(6) });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Legs: four sturdy legs by IK, big round paws, carved toes and talons.

  const FOOT_Y = 0.05;
  const paw = (tipJoint: ReturnType<typeof b.joint>, s: number, front: boolean) => {
    const p = tipJoint.at;
    const pawPaint = dotted(PURPLE, [YELLOW, LIME], 0.026, 0.3, 11);
    b.part(new THREE.SphereGeometry(1, 10, 7), pawPaint, {
      bone: tipJoint,
      at: [p.x, p.y, p.z + 0.02],
      scale: [0.078, 0.05, 0.09],
    });
    // Toes with talons.
    for (let i = 0; i < 4; i++) {
      const tx = p.x + (i - 1.5) * 0.034 * (front ? 1 : 0.95);
      const tz = p.z + 0.095 - Math.abs(i - 1.5) * 0.012;
      b.part(new THREE.SphereGeometry(0.024, 7, 5), i % 2 ? YELLOW : TEAL, { bone: tipJoint, at: [tx, 0.03, tz] });
      b.spike([tx, 0.03, tz + 0.012], [0, -0.35, 1], front ? 0.055 : 0.04, 0.012, {
        bone: tipJoint,
        color: BLACK,
        sides: 5,
      });
    }
    // Heel band.
    b.part(new THREE.TorusGeometry(0.075, 0.012, 6, 12), BLACK, {
      bone: tipJoint,
      at: [p.x, p.y + 0.05, p.z + 0.01],
      rotation: [90, 0, 0],
    });
    void s;
  };

  for (const s of [1, -1]) {
    // Foreleg: shoulder socket low on the chest, elbow pointing back.
    const shoulder: [number, number, number] = [s * 0.14, 0.74, 0.36];
    const fore = limb(shoulder, [s * 0.15, FOOT_Y, 0.4], [0.36, 0.34], [[0, 0, -1]]);
    const side = s > 0 ? "L" : "R";
    const foreChain = b.chain(`legF${side}`, fore, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `pawF${side}`],
      role: "leg",
      contact: [s * 0.15, 0, 0.44],
    });
    b.sweep(foreChain, (t) => 0.085 - 0.03 * t, { color: LEG, sides: 8 });
    paw(foreChain.tip!, s, true);

    // Hind leg: knee forward.
    const hip: [number, number, number] = [s * 0.14, 0.7, -0.32];
    const hind = limb(hip, [s * 0.16, FOOT_Y, -0.38], [0.36, 0.33], [[0, 0, 1]]);
    const hindChain = b.chain(`legH${side}`, hind, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `pawH${side}`],
      role: "leg",
      contact: [s * 0.16, 0, -0.34],
    });
    b.sweep(hindChain, (t) => 0.095 - 0.04 * t, { color: LEG, sides: 8 });
    paw(hindChain.tip!, s, false);
    // Haunch: a thick carved thigh block over the hip.
    b.part(new THREE.SphereGeometry(1, 10, 7), BODY, {
      bone: hindChain.joints[0],
      at: [s * 0.15, 0.66, -0.34],
      scale: [0.085, 0.13, 0.12],
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Wings: an arm bone chain out to each side, with carved flight feathers trailing back and coverts over them.

  const featherOutline = (len: number, w: number): OutlinePoint[] => [
    [0, -w * 0.35],
    [len * 0.45, -w * 0.6],
    [len * 0.85, -w * 0.45],
    [len, 0, "sharp"],
    [len * 0.85, w * 0.45],
    [len * 0.45, w * 0.6],
    [0, w * 0.35],
  ];

  const perpTo = (x: THREE.Vector3, ref: number[]) => {
    const r = vec(ref);
    return r.sub(x.clone().multiplyScalar(r.dot(x))).normalize();
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const wingPts: [number, number, number][] = [
      [s * 0.13, 0.9, 0.22],
      [s * 0.5, 1.03, 0.19],
      [s * 0.9, 1.08, 0.13],
      [s * 1.36, 1.02, 0.03],
    ];
    const wing = b.chain(`wing${side}`, wingPts, {
      parent: chest,
      names: [`wingShoulder${side}`, `wingElbow${side}`, `wingWrist${side}`],
      role: "wing",
    });
    b.sweep(wing, (t) => 0.06 - 0.04 * t, { color: WINGARM, sides: 8, caps: "round" });

    // Elbow and wrist knuckle balls.
    for (const j of [wing.joints[1], wing.joints[2]])
      b.part(new THREE.SphereGeometry(0.05, 8, 6), BLACK, { bone: j, at: j.at, scale: [1, 0.9, 1] });

    const placeFeather = (
      at: THREE.Vector3,
      bone: ReturnType<typeof b.joint>,
      dir: number[],
      len: number,
      w: number,
      color: ReturnType<typeof paint>,
      lift: number,
    ) => {
      const x = vec(dir).normalize();
      const y = perpTo(x, [s, 0, 0]);
      b.extrude(featherOutline(len, w), {
        at: at.clone().add(new THREE.Vector3(0, lift, 0)),
        x,
        y,
        thickness: [0.012, 0.012],
        bevel: 0.003,
        smoothing: 1,
        color,
        bone,
      });
    };

    // Primaries along wrist → tip.
    b.along(
      wing,
      7,
      (at) => {
        const k = (at.t - wing.ts[2]) / (1 - wing.ts[2]);
        const len = 0.5 + 0.22 * k;
        placeFeather(at.at, at.bone, [s * (0.15 + 0.55 * k), -0.3, -1], len, 0.1, flightPaint(len), -0.012);
        placeFeather(at.at, at.bone, [s * (0.12 + 0.45 * k), -0.2, -1], len * 0.45, 0.085, covertPaint(len * 0.45), 0.012);
      },
      { from: wing.ts[2], to: 1 },
    );
    // Secondaries along elbow → wrist.
    b.along(
      wing,
      6,
      (at) => {
        const len = 0.46;
        placeFeather(at.at, at.bone, [s * 0.08, -0.25, -1], len, 0.1, flightPaint(len), -0.012);
        placeFeather(at.at, at.bone, [s * 0.06, -0.15, -1], len * 0.45, 0.085, covertPaint(len * 0.45), 0.012);
      },
      { from: wing.ts[1], to: wing.ts[2] },
    );
    // Tertials along shoulder → elbow.
    b.along(
      wing,
      4,
      (at) => {
        const len = 0.4;
        placeFeather(at.at, at.bone, [s * 0.02, -0.25, -1], len, 0.1, flightPaint(len), -0.012);
        placeFeather(at.at, at.bone, [s * 0.02, -0.15, -1], len * 0.45, 0.085, covertPaint(len * 0.45), 0.012);
      },
      { from: wing.ts[0] + 0.03, to: wing.ts[1] },
    );

    // Alula: a small forward feather tuft at the wrist.
    placeFeather(wing.joints[2].at, wing.joints[2], [s * 0.6, 0.35, 0.6], 0.14, 0.06, covertPaint(0.14), 0.02);

    // Leading-edge dots: a row of carved beads along the top of the arm.
    b.along(
      wing,
      14,
      (at) => {
        const r = 0.06 - 0.04 * at.t;
        b.part(new THREE.SphereGeometry(0.014, 6, 4), at.t % 0.2 < 0.1 ? YELLOW : WHITE, {
          bone: at.bone,
          at: at.at.clone().add(new THREE.Vector3(0, r * 0.95, 0.0)),
        });
      },
      { from: 0.05, to: 0.97 },
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Tails: an eagle fan low behind the rump and a curling jaguar tail rising above it.

  {
    const fan = b.ring(frame([0, 0.69, -0.52], [0, 1, 0]), {
      count: 9,
      fromDeg: 132,
      toDeg: 228,
      tilt: -12,
      joints: 3,
      name: "fan",
      parent: hips,
      role: "tail",
    });
    b.cards(fan.items, TAILFEATHER, { size: [0.11, 0.52], lean: 0, flow: [0, 1, 0], sink: 0.12, bend: -8 });
    // A carved cap where the fan roots into the rump.
    b.part(new THREE.SphereGeometry(1, 10, 6), dotted(BLACK, [YELLOW, MAGENTA], 0.025, 0.3, 61), {
      bone: hips,
      at: [0, 0.69, -0.56],
      scale: [0.14, 0.05, 0.07],
    });
  }

  const tailPath = catmull([
    [0, 0.76, -0.5],
    [0, 0.82, -0.76],
    [0, 0.98, -0.96],
    [0, 1.2, -1.04],
    [0, 1.38, -0.96],
    [0, 1.42, -0.8],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, count: 6, role: "tail" });
  const tailTube = b.sweep(tail, (t) => 0.055 * (1 - t) + 0.022, {
    sides: 8,
    bands: [
      [0.17, TAIL_A],
      [0.2, BLACK],
      [0.37, TAIL_B],
      [0.4, BLACK],
      [0.57, TAIL_C],
      [0.6, BLACK],
      [0.77, TAIL_A],
      [0.8, BLACK],
      [0.95, TAIL_B],
      [1, BLACK],
    ],
  });
  // Rings of beads at each band edge.
  for (const t of [0.2, 0.4, 0.6, 0.8]) {
    const ring = b.ring(tail.at(t), { count: 7, radius: 0.055 * (1 - t) + 0.022 });
    for (const item of ring.items) b.part(new THREE.SphereGeometry(0.011, 6, 4), YELLOW, { at: item });
  }
  // Tuft: a burst of carved spikes at the tail tip.
  {
    const tip = tailTube.at(1);
    const end = tailPath.at(1);
    const dir = tailPath.tangentAt(1);
    b.spike(end, dir, 0.11, 0.03, { bone: tail.joints[tail.joints.length - 1], color: SPIKE, sides: 6 });
    const burst = b.ring(frame(end, dir), { count: 6, radius: 0.012, tilt: -40 });
    for (const item of burst.items) b.spike(item, item, 0.07, 0.012, { color: item.i % 2 ? MAGENTA : TEAL, sides: 5 });
    void tip;
  }

  // -------------------------------------------------------------------------------------------------------------
  // Belly and flank studs: scattered carved beads over the body in the alebrije manner.
  {
    const hits = bodySkin.scatter(28, { rng: rng(9), minDist: 0.09, filter: (h) => h.n.y > -0.2 && Math.abs(h.at.x) > 0.08 });
    for (const h of hits) {
      const v = noise(h.at, 0.2, 2);
      b.stick(new THREE.SphereGeometry(0.014, 6, 4), v > 0.5 ? YELLOW : WHITE, h, { embed: 0.5 });
    }
  }

  // Jaw opened a touch so the fangs read.
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });

  return b.root;
}
