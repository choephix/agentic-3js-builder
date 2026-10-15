import * as THREE from "three";
import { catmull, cells, createBuilder, limb, mix, noise, paint, rng, smoothstep, svg } from "../../../../src/index";
import type { Builder, Paint, Rgb } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { animeEye, cel, inkLines } from "../../../../kits/toon";

export const meta = {
  name: "Lava Golem",
  description: "A basalt golem of stacked hex plates, a gilt belt and molten seams, cel-shaded in a Genshin Impact style.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette. Cool violet-grey basalt, warm molten seams, gilt trim.

const STONE_DARK = "#221d30";
const STONE_LIGHT = "#6d6690";
const STONE_TOP = "#a59dc4";
const CRACK = "#100b18";
const EMBER_DIM = "#c8481c";
const LAVA = "#ff7a1f";
const LAVA_CORE = "#ffd861";
const GOLD = "#f2bd52";

type Stop = readonly [number, number, number];
type P = { readonly x: number; readonly y: number; readonly z: number };
type Surf = ReturnType<Builder["surface"]>;

const near = (p: P, dx = 0, dy = 0, dz = 0) => new THREE.Vector3(p.x + dx, p.y + dy, p.z + dz);
const midOf = (a: P, c: P) => new THREE.Vector3((a.x + c.x) / 2, (a.y + c.y) / 2, (a.z + c.z) / 2);

function must<T>(hit: T | null, what: string): T {
  if (!hit) throw new Error(`lava golem: no surface for ${what}`);
  return hit;
}

/** Piecewise-linear profile over t: stops of [t, rx, ry]. Returns the [rx, ry] pair a box section takes. */
function ramp(stops: readonly Stop[]): (t: number) => [number, number] {
  return (t) => {
    for (let i = 1; i < stops.length; i++) {
      const [t1, a1, b1] = stops[i];
      if (t <= t1) {
        const [t0, a0, b0] = stops[i - 1];
        const k = (t - t0) / (t1 - t0);
        return [a0 + (a1 - a0) * k, b0 + (b1 - b0) * k];
      }
    }
    const last = stops[stops.length - 1];
    return [last[1], last[2]];
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Basalt: Worley cells read as columnar plates. Grooves run dark, the lip beside each groove glows faintly
// (heat leaking from the seams), and up-facing faces catch a cool top light.

function basalt(seed: number, cell: number): Paint {
  return paint((p, n) => {
    const c = cells(p, cell, seed);
    const edge = c.d2 - c.d1;
    const drift = noise(p, cell * 2.5, seed + 3);
    const tone = Math.min(Math.max(0.2 + 0.45 * c.id + 0.35 * (drift - 0.5), 0), 1);
    let col: Rgb = mix(STONE_DARK, STONE_LIGHT, tone);
    col = mix(col, STONE_TOP, smoothstep(0.55, 1, n.y) * 0.35);
    col = mix(col, EMBER_DIM, smoothstep(0.12, 0.09, edge) * smoothstep(0.02, 0.05, edge) * 0.6);
    col = mix(col, CRACK, smoothstep(0.045, 0, edge));
    return col;
  });
}

// Cel-shaded stone (two tones, hue-shifted shadow), an ink jaw line on the head, gilt trim.
const BASALT = cel(basalt(1, 0.2));
const BASALT_B = cel(basalt(7, 0.13));
const HEAD = inkLines(cel(basalt(3, 0.11)), { levels: [-0.3], axis: [0, 1, 0], width: 0.07, ink: "#0c0912" });
const GOLD_M = cel(GOLD, "#9a5a1a");

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const EYE = animeEye({ iris: "#ffb13a", irisLight: "#fff3a6", blush: false, brow: false, size: 384 });

const CRACK_LINES = [
  "M50 50 L40 42 L27 45 L15 33",
  "M50 50 L58 61 L47 72 L39 88",
  "M50 50 L66 43 L80 50 L91 37",
  "M50 50 L54 35 L62 21",
  "M40 42 L37 30 L29 22",
  "M58 61 L72 66 L84 62",
  "M66 43 L70 30",
];
const crackStrokes = (color: string, width: number) =>
  CRACK_LINES.map((d) => `<path d="${d}" stroke="${color}" stroke-width="${width}"/>`).join("");
const CRACK_TEX = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <g>${crackStrokes("#3a0c02", 6.5)}</g>
    <g>${crackStrokes(LAVA, 3)}</g>
    <circle cx="50" cy="50" r="7" fill="${LAVA_CORE}" stroke="none"/>
  </svg>`,
  { size: 256 },
);

const MOUTH_TEX = svg(
  `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 13 Q50 46 95 13 Q50 25 5 13 Z" fill="#2a0c05" stroke="${LAVA}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M20 20 L26 28 L33 21 L40 29 L48 22 L55 29 L62 21 L69 28 L76 20" fill="none" stroke="${LAVA_CORE}" stroke-width="2.6" stroke-linejoin="round"/>
  </svg>`,
  { size: 256 },
);

const EMBER_TEX = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="f" cx="0.5" cy="0.75" r="0.7">
      <stop offset="0" stop-color="#fff6b0"/><stop offset="0.45" stop-color="#ffa53a"/><stop offset="1" stop-color="#ff4a12"/>
    </radialGradient></defs>
    <path d="M16 2 C24 15 31 24 29 35 C27 44 5 44 3 35 C1 24 8 15 16 2 Z" fill="url(#f)"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
// The golem. Model space: +Y up, faces +Z, its left is +X. Loops over s = ±1 build the left (+X) side first.

export default function build() {
  const b = createBuilder({ name: "lava-golem" });

  // ---- Skeleton: hips, a three-joint spine, a head on the upper joint ---------------------------------------
  const hips = b.joint("hips", { at: [0, 1.0, 0], dir: [0, 1, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.05, 0],
      [0, 1.45, 0.02],
      [0, 1.9, 0.03],
      [0, 2.22, 0],
    ]),
    { parent: hips, names: ["waist", "chest", "upper"], role: "spine" },
  );
  const chest = spine.joints[1];
  const upper = spine.joints[2];
  const head = b.joint("head", { parent: upper, at: [0, 2.6, 0.04], dir: [0, 1, 0], role: "head" });

  // ---- Torso: a box-section column that narrows at the waist and broadens into the chest --------------------
  const torso = b.sweep(
    spine,
    ramp([
      [0, 0.26, 0.2],
      [0.17, 0.2, 0.16],
      [0.5, 0.36, 0.26],
      [0.84, 0.47, 0.3],
      [1, 0.4, 0.26],
    ]),
    { section: "box", caps: "flat", color: BASALT },
  );
  b.capsule([0, 2.12, 0], [0, 2.42, 0.04], 0.15, BASALT_B, { bone: upper });

  // ---- Head: a faceted boulder with a flat-shaded crown ----------------------------------------------------
  const headPart = b.part(new THREE.IcosahedronGeometry(0.33, 1), HEAD, {
    bone: head,
    at: head.at,
    scale: [1.06, 0.98, 0.98],
    flat: true,
  });
  const skinHead = b.surface(headPart);

  // ---- Limbs, shoulders, hips and feet, mirrored -------------------------------------------------------------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // Shoulder pauldron: a hex prism, a gilt rim and a basalt spike.
    b.part(new THREE.CylinderGeometry(0.2, 0.25, 0.2, 6), BASALT_B, {
      bone: upper,
      at: near(upper.at, s * 0.56, 0.2, 0),
      dir: [s, 0, 0],
      flat: true,
    });
    b.part(new THREE.TorusGeometry(0.2, 0.022, 4, 8), GOLD_M, {
      bone: upper,
      at: near(upper.at, s * 0.665, 0.2, 0),
      dir: [s, 0, 0],
      axis: "z",
      flat: true,
    });
    b.spike(near(upper.at, s * 0.5, 0.3, 0), [0, 1, 0], 0.2, 0.05, { color: BASALT_B });

    // Hip plate and a chest side plate: layered armour on the body.
    b.part(new THREE.CylinderGeometry(0.15, 0.17, 0.14, 6), BASALT, {
      bone: hips,
      at: near(hips.at, s * 0.25, 0.08, 0),
      dir: [s, 0, 0],
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.1, 0.22, 0.26), BASALT, {
      bone: chest,
      at: near(chest.at, s * 0.36, 0, 0),
      flat: true,
    });

    // Arm: a tapered tube from the shoulder, hanging to the knuckles, with the fist as its tip joint.
    const arm = b.chain(
      `arm${L}`,
      catmull([
        [s * 0.5, 2.1, 0],
        [s * 0.66, 1.62, 0.1],
        [s * 0.72, 1.2, 0.22],
        [s * 0.66, 0.92, 0.3],
      ]),
      { parent: upper, names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `hand${L}`], role: "arm" },
    );
    const [, elbow, wrist, hand] = arm.joints;
    const armTube = b.sweep(arm, (t) => 0.15 - 0.035 * t, { sides: 6, color: BASALT_B });
    const armSkin = b.surface(armTube);
    glow(b.sweep(armSkin.loop(midOf(arm.joints[0].at, elbow.at), { lift: 0.006 }), 0.008, { color: LAVA, sides: 5 }), 1.4);

    b.part(new THREE.DodecahedronGeometry(0.12, 0), BASALT, {
      bone: elbow,
      at: near(elbow.at, s * 0.05, 0, 0.06),
      scale: [1, 1.1, 0.9],
      flat: true,
    });
    b.part(new THREE.TorusGeometry(0.135, 0.022, 4, 8), GOLD_M, {
      bone: wrist,
      at: wrist.at,
      dir: [0, 1, 0],
      axis: "z",
      flat: true,
    });
    b.part(new THREE.IcosahedronGeometry(0.19, 0), BASALT_B, {
      bone: hand,
      at: hand.at,
      scale: [1.1, 0.95, 1.05],
      flat: true,
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.05, 0), LAVA_CORE, { bone: hand, at: near(hand.at, 0, 0, 0.19), flat: true }),
      2.0,
    );

    // Leg: hip, knee and ankle from a two-bone solve that lands the foot on the floor.
    const hipPt: [number, number, number] = [s * 0.2, 1.0, 0];
    const pts = limb(hipPt, [s * 0.2, 0.14, 0.04], [0.52, 0.46], [0, 0, 1]);
    const leg = b.chain(`leg${L}`, pts, { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg" });
    const [, knee, ankle] = leg.joints;
    const legTube = b.sweep(leg, (t) => 0.16 - 0.035 * t, { sides: 6, color: BASALT_B });
    const legSkin = b.surface(legTube);
    glow(b.sweep(legSkin.loop(midOf(leg.joints[0].at, knee.at), { lift: 0.006 }), 0.008, { color: LAVA, sides: 5 }), 1.4);

    b.part(new THREE.DodecahedronGeometry(0.12, 0), BASALT, {
      bone: knee,
      at: near(knee.at, 0, 0, 0.1),
      scale: [1, 0.9, 0.8],
      flat: true,
    });
    b.part(new THREE.DodecahedronGeometry(0.16, 0), BASALT, {
      bone: ankle,
      at: near(ankle.at, 0, -0.05, 0.1),
      scale: [0.95, 0.55, 1.45],
      flat: true,
    });
  }

  // ---- Torso surface: belt and molten seams, cracks, the chest core and the embers ------------------------
  const skinT = b.surface(torso);

  // A gilt belt at the waist, then two molten rings between the plates.
  b.sweep(skinT.loop([0, 1.3, 0], { lift: 0.014 }), 0.024, { color: GOLD_M, sides: 6 });
  glow(b.sweep(skinT.loop([0, 1.62, 0], { lift: 0.01 }), 0.012, { color: LAVA, sides: 6 }), 1.5);
  glow(b.sweep(skinT.loop([0, 1.96, 0], { lift: 0.01 }), 0.012, { color: LAVA, sides: 6 }), 1.5);

  // Vertical cracks down each flank.
  for (const s of [1, -1]) {
    const crack = skinT.drape(
      catmull([
        [s * 0.42, 1.12, 0.1],
        [s * 0.46, 1.4, 0.05],
        [s * 0.4, 1.7, 0.08],
        [s * 0.44, 1.92, 0.0],
      ]),
      { lift: 0.008 },
    );
    glow(b.sweep(crack, 0.01, { color: LAVA, sides: 5 }), 1.4);
  }

  // The chest: a dark ring of basalt with a glowing core, and a crack drawing radiating from it.
  const front = must(skinT.around([0, 1.6, 0]).at(0, 0), "chest");
  glow(b.decal(skinT, CRACK_TEX, { at: front, size: [0.5, 0.5] }), 1.3);
  b.stick(new THREE.TorusGeometry(0.17, 0.05, 5, 8).rotateX(Math.PI / 2), BASALT_B, front, { embed: 0.2, flat: true });
  glow(b.stick(new THREE.IcosahedronGeometry(0.12, 0), LAVA_CORE, front, { embed: 0.45, flat: true }), 2.2);

  // Gilt buckle at the belt's front.
  b.stick(new THREE.BoxGeometry(0.12, 0.1, 0.04), GOLD_M, must(skinT.around([0, 1.3, 0]).at(0, 0), "buckle"), {
    flat: true,
  });

  // Basalt spines on the back, rising from the shoulders.
  const spines = [
    { az: 180, el: 40, len: 0.34 },
    { az: 150, el: 30, len: 0.26 },
    { az: -150, el: 30, len: 0.26 },
    { az: 165, el: 62, len: 0.22 },
  ];
  for (const { az, el, len } of spines) {
    const h = skinT.around([0, 1.7, 0]).at(az, el);
    if (h) b.spike(h, h, len, 0.07, { color: BASALT });
  }

  // Ember cards drifting from the upward-facing stone above the chest.
  const embers = skinT.scatter(12, { rng: rng(9), minDist: 0.2, filter: (h) => h.n.y > 0.35 });
  glow(b.cards(embers, EMBER_TEX, { size: [0.08, 0.12], lean: 30, flow: [0, 1, 0], vary: 0.3, rng: rng(5) }), 1.8);

  // ---- Head details --------------------------------------------------------------------------------------
  // Big anime eyes, mirrored for the left, glowing; a slanted basalt brow over each.
  for (const s of [1, -1]) {
    const eye = must(skinHead.around(head.at).at(s * 30, 6), "eye");
    glow(b.decal(skinHead, EYE, { at: eye, size: [0.13, 0.178], mirror: s > 0 }), 1.7);
    const brow = skinHead.around(head.at).at(s * 28, 27);
    if (brow) b.stick(new THREE.BoxGeometry(0.16, 0.05, 0.07), BASALT_B, brow, { flat: true, spin: -s * 16 });
  }

  // A cracked lava mouth below the nose.
  glow(
    b.decal(skinHead, MOUTH_TEX, { at: must(skinHead.around(head.at).at(0, -22), "mouth"), size: [0.2, 0.1] }),
    1.4,
  );

  // A forehead gem.
  const gem = skinHead.around(head.at).at(0, 27);
  if (gem) glow(b.stick(new THREE.OctahedronGeometry(0.045, 0), LAVA_CORE, gem, { embed: 0.3, flat: true }), 2.2);

  // A crown of basalt columns.
  const crown = [
    { az: -70, el: 62, len: 0.14 },
    { az: -35, el: 66, len: 0.2 },
    { az: 0, el: 72, len: 0.24 },
    { az: 35, el: 66, len: 0.2 },
    { az: 70, el: 62, len: 0.14 },
  ];
  for (const { az, el, len } of crown) {
    const h = skinHead.around(head.at).at(az, el);
    if (h) b.spike(h, h, len, 0.055, { color: BASALT_B });
  }

  return b.root;
}
