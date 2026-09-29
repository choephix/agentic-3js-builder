// Scarecrow on its post. A weathered post and crossbar stand in a grassy mound with a pumpkin at the foot; the
// figure hangs on them at human height, skeleton first: hips, spine and chest up the post, a neck and a burlap head
// with a hinged jaw (the stitched mouth is the cut), arms along the crossbar and legs dangling in old boots.
// Surfaces carry most of the detail: a flannel tartan, denim overalls with stitched bib, straps and patches, burlap
// weave with a painted face, a coiled straw hat and wood grain are paints; the button eyes and the sunflower in the
// hat band are SVG drawings; straw bursting from cuffs, collar, hat and a torn seam, the frayed brim and the grass
// are cards.
import { ConeGeometry, CylinderGeometry, SphereGeometry, TorusGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import { limb } from "../src/ik";
import { offset, rng } from "../src/math";
import type { V3 } from "../src/math";
import { bezier, catmull, polyline, spiral } from "../src/path";
import { grain, mix, mottle, noise, paint, scales, smoothstep, spots } from "../src/paint";
import type { ColorInput, Rgb } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Scarecrow",
  description:
    "A burlap-headed scarecrow on its post: flannel tartan, patched denim overalls, a coiled straw hat with a sunflower, straw bursting from every cuff, and a crow on its arm.",
};

// Palette.
const WOOD = "#8b6c4a";
const WOOD_DK = "#5a4330";
const WOOD_GREY = "#9a8f7e";
const SOIL = "#5d4431";
const SOIL_DK = "#3b2b1f";
const PEBBLE = "#8c7d69";
const BURLAP = "#d2b27f";
const BURLAP_DK = "#9a7c50";
const BURLAP_THREAD = "#6f5635";
const RED = "#b3322a";
const RED_MID = "#74211f";
const RED_DK = "#2f1618";
const TARTAN_LINE = "#e2b84c";
const DENIM = "#3f6090";
const DENIM_DK = "#2b4569";
const DENIM_FADED = "#6a88b0";
const THREAD = "#e0a843";
const MUSTARD = "#d4a24a";
const MUSTARD_DK = "#9c6c22";
const LEATHER = "#6d4229";
const LEATHER_DK = "#3e2617";
const SOLE = "#231912";
const ROPE = "#cfae6f";
const ROPE_DK = "#8d6f3f";
const HAT = "#dfbd6d";
const HAT_DK = "#a98435";
const BAND = "#9e2e27";
const BRASS = "#c9a13f";
const MOUTH = "#1c120d";
const NOSE = "#7d3a24";
const CHEEK = "#c8674a";
const CROW_EDGE = "#0e1015";
const BEAK = "#34343a";
const EYE = "#0b0a0a";
const PUMPKIN = "#e27b25";
const PUMPKIN_DK = "#b0561a";
const STEM = "#6e5b30";
const LEAF = "#4d7a36";
const LEAF_DK = "#35592a";

// Layout: the post stands at the origin; the figure hangs just in front of it, the crossbar at shoulder height.
const BZ = 0.17; // body centre plane
const AZ = 0.185; // arm axis, just in front of the crossbar
const ARM_Y = 1.44;
const MOUTH_Y = 1.62; // the jaw cut
const WAIST = 1.1;

const fract = (x: number) => x - Math.floor(x);
/** Two surface coordinates across the dominant normal axis, so a flat pattern wraps a blocky body. */
const planar = (p: Vector3, n: Vector3): [number, number] => {
  const [ax, ay, az] = [Math.abs(n.x), Math.abs(n.y), Math.abs(n.z)];
  if (ax >= ay && ax >= az) return [p.z, p.y];
  if (ay >= az) return [p.x, p.z];
  return [p.x, p.y];
};
/** A running stitch `d` meters inside an edge, dashed along `along`. */
const stitch = (d: number, along: number, inset = 0.006) => Math.abs(d - inset) < 0.0014 && fract(along / 0.011) < 0.58;
const shade = (c: Rgb, k: number): Rgb => [c[0] * k, c[1] * k, c[2] * k];

// ---------------------------------------------------------------------------------------------------------------
// Textures (SVG) and paints.

function strawTexture(seed: number) {
  const r = rng(seed);
  const colors = ["#f3d67f", "#e8c05c", "#d8a943", "#f7e4a6", "#c8973a", "#ecc86a"];
  let strands = "";
  for (let i = 0; i < 9; i++) {
    const x0 = 20 + (r() - 0.5) * 10;
    const x1 = 20 + (r() - 0.5) * 32;
    const y1 = 4 + r() * 46;
    const cx = (x0 + x1) / 2 + (r() - 0.5) * 10;
    const w = 2.6 + r() * 1.8;
    const d = `M${x0.toFixed(1)} 160 Q${cx.toFixed(1)} ${(80 + y1 / 2).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    const c = colors[Math.floor(r() * colors.length)];
    strands += `<path d="${d}" stroke="#8a6526" stroke-width="${(w + 1.8).toFixed(1)}"/>`;
    strands += `<path d="${d}" stroke="${c}" stroke-width="${w.toFixed(1)}"/>`;
  }
  return svg(
    `<svg viewBox="0 0 40 160" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round">${strands}</g></svg>`,
    { size: 256 },
  );
}

function grassTexture(seed: number) {
  const r = rng(seed);
  const greens = ["#5f8a3a", "#76a043", "#4d7630", "#8fae4e", "#a3a24c"];
  let blades = "";
  for (let i = 0; i < 7; i++) {
    const x = 10 + r() * 44;
    const w = 2.5 + r() * 2.5;
    const tx = x + (r() - 0.5) * 30;
    const ty = 2 + r() * 26;
    const cx = (x + tx) / 2 + (r() - 0.5) * 8;
    blades += `<path d="M${(x - w).toFixed(1)} 64 Q${cx.toFixed(1)} 34 ${tx.toFixed(1)} ${ty.toFixed(1)} Q${(cx + w * 0.4).toFixed(1)} 36 ${(x + w).toFixed(1)} 64 Z" fill="${greens[Math.floor(r() * greens.length)]}"/>`;
  }
  return svg(`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${blades}</svg>`, { size: 128 });
}

function buttonTexture(face: string, rim: string, glint: string) {
  const holes = [
    [22, 22],
    [42, 22],
    [22, 42],
    [42, 42],
  ]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.5" fill="#0b0806"/>`)
    .join("");
  return svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="31.5" fill="${rim}"/>
      <circle cx="32" cy="32" r="26" fill="${face}"/>
      <path d="M11 24 A22 22 0 0 1 24 11" fill="none" stroke="${glint}" stroke-width="3.5" stroke-linecap="round"/>
      ${holes}
      <path d="M22 22 L42 42 M42 22 L22 42" stroke="#1a120c" stroke-width="7.5" stroke-linecap="round"/>
      <path d="M22 22 L42 42 M42 22 L22 42" stroke="#efe2bd" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );
}

function sunflowerTexture() {
  let petals = "";
  for (let i = 0; i < 16; i++)
    petals += `<ellipse cx="64" cy="27" rx="9.5" ry="25" fill="#e9a10a" stroke="#b86e04" stroke-width="2" transform="rotate(${i * 22.5 + 11.25} 64 64)"/>`;
  for (let i = 0; i < 16; i++)
    petals += `<ellipse cx="64" cy="24" rx="9" ry="24" fill="#f6c21c" stroke="#c98506" stroke-width="2" transform="rotate(${i * 22.5} 64 64)"/>`;
  let seeds = "";
  for (let i = 0; i < 60; i++) {
    const a = i * 2.39996;
    const d = 2.6 * Math.sqrt(i);
    seeds += `<circle cx="${(64 + d * Math.cos(a)).toFixed(1)}" cy="${(64 + d * Math.sin(a)).toFixed(1)}" r="1.7" fill="#2e1807"/>`;
  }
  return svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">${petals}<circle cx="64" cy="64" r="23" fill="#6a3b12"/><circle cx="64" cy="64" r="23" fill="none" stroke="#3e2108" stroke-width="3"/>${seeds}</svg>`,
    { size: 256 },
  );
}

/** Flannel tartan: dark bands both ways over red, darker where they cross, a thin gold line, soft nap. */
const tartan = paint((p, n) => {
  const [u, v] = planar(p, n);
  const P = 0.1;
  const band = (x: number) => smoothstep(0.019, 0.016, Math.abs(fract(x / P) - 0.5) * P);
  const line = (x: number) => smoothstep(0.0032, 0.0016, Math.min(fract(x / P), 1 - fract(x / P)) * P);
  const bu = band(u);
  const bv = band(v);
  let c = mix(mix(RED, RED_MID, Math.max(bu, bv)), RED_DK, bu * bv);
  c = mix(c, TARTAN_LINE, 0.85 * Math.max(line(u + 0.25 * P), line(v + 0.25 * P)));
  return shade(c, 0.9 + 0.18 * noise(p, 0.012, 11));
});

const denimCloth = mottle(grain(DENIM, DENIM_DK, { size: 0.004, seed: 2 }), DENIM_FADED, {
  size: 0.14,
  contrast: 0.55,
  seed: 3,
});

const gingham = paint((p, n) => {
  const [u, v] = planar(p, n);
  const a = fract(u / 0.02) < 0.5 ? 1 : 0;
  const b = fract(v / 0.02) < 0.5 ? 1 : 0;
  return a && b ? MUSTARD_DK : a || b ? mix(MUSTARD, MUSTARD_DK, 0.45) : MUSTARD;
});

const burlapCloth = paint((p, n) => {
  const [u, v] = planar(p, n);
  const P = 0.011;
  const gap = Math.max(
    smoothstep(0.32, 0.47, Math.abs(fract(u / P) - 0.5)),
    smoothstep(0.32, 0.47, Math.abs(fract(v / P) - 0.5)),
  );
  const base = mix(BURLAP, BURLAP_DK, smoothstep(0.35, 0.8, noise(p, 0.07, 4)));
  return shade(mix(base, BURLAP_THREAD, 0.38 * gap), 0.94 + 0.12 * noise(p, 0.02, 5));
});

/** A sewn-on patch: `cloth` inside a tilted rectangle on the side facing `face`, stitched round its edge. */
function patch(
  center: V3,
  half: [number, number],
  tiltDeg: number,
  face: V3,
  cloth: ColorInput,
): (p: Vector3, n: Vector3) => ColorInput | null {
  const [cx, cy, cz] = center;
  const f = new Vector3(...face).normalize();
  // Rectangle axes in the plane facing `face`: u across, v up, then tilted.
  const up = new Vector3(0, 1, 0);
  if (Math.abs(f.y) > 0.9) up.set(0, 0, -1);
  const across = up.clone().cross(f).normalize();
  const vert = f.clone().cross(across);
  const c = Math.cos(tiltDeg * (Math.PI / 180));
  const s = Math.sin(tiltDeg * (Math.PI / 180));
  const U = across.clone().multiplyScalar(c).addScaledVector(vert, s);
  const Vv = vert.clone().multiplyScalar(c).addScaledVector(across, -s);
  const d = new Vector3();
  return (p, n) => {
    if (n.dot(f) < 0.2) return null;
    d.set(p.x - cx, p.y - cy, p.z - cz);
    const x = d.dot(U);
    const y = d.dot(Vv);
    const dx = half[0] - Math.abs(x);
    const dy = half[1] - Math.abs(y);
    if (dx < 0 || dy < 0) return null;
    const edge = Math.min(dx, dy);
    if (stitch(edge, dx < dy ? y : x)) return THREAD;
    if (edge < 0.0018) return RED_DK;
    return cloth;
  };
}

export default function build() {
  const b = createBuilder({ name: "scarecrow", paintSize: 2048 });
  const random = rng(17);
  const straws = [strawTexture(1), strawTexture(2), strawTexture(3)];
  const grass = [grassTexture(4), grassTexture(5)];

  // ---------------------------------------------------------------------------------------------------------
  // Skeleton. The root is the post; the figure hangs from it.
  const root = b.joint("root", { at: [0, 0, 0], group: "post" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.95, BZ],
      [0, 1.1, BZ],
      [0, 1.28, BZ],
      [0, 1.48, BZ],
    ],
    { parent: root, names: ["hips", "spine", "chest"], role: "spine", group: "body" },
  );
  const [hips, , chest] = spine.joints;
  const neck = b.joint("neck", { parent: chest, at: [0, 1.48, BZ], aim: [0, 1.585, BZ], role: "neck", group: "head" });
  const head = b.joint("head", { parent: neck, at: [0, 1.585, BZ], dir: [0, 1, 0], role: "head", group: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, MOUTH_Y + 0.008, BZ - 0.085],
    aim: [0, MOUTH_Y - 0.02, BZ + 0.12],
    role: "jaw",
    group: "head",
  });

  const sides = [
    [1, "L"],
    [-1, "R"],
  ] as const;
  const arms = sides.map(([s, side]) =>
    b.chain(
      `arm${side}`,
      [
        [s * 0.17, ARM_Y, AZ],
        [s * 0.45, ARM_Y, AZ],
        [s * 0.72, ARM_Y, AZ],
        [s * 0.84, ARM_Y, AZ],
      ],
      { parent: chest, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm", group: `arm${side}` },
    ),
  );
  const legs = sides.map(([s, side]) => {
    const pts = limb([s * 0.105, 0.95, BZ], [s * 0.115, 0.22, BZ + 0.03], [0.375, 0.37], [0, 0, 1]);
    return b.chain(`leg${side}`, [...pts, [s * 0.12, 0.13, BZ + 0.18]], {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      group: `leg${side}`,
    });
  });

  // ---------------------------------------------------------------------------------------------------------
  // Post, crossbar and the mound they stand in.
  const weathered = (axis: V3) =>
    mottle(grain(WOOD, WOOD_DK, { size: 0.011, axis, seed: 8 }), WOOD_GREY, { size: 0.09, contrast: 0.7, seed: 9 });
  b.frustumBox([0, 0, 0], [0, 1.68, 0], [0.1, 0.1], [0.095, 0.095], {
    bone: root,
    color: weathered([0, 1, 0]),
    group: "post",
  });
  b.frustumBox([-0.93, ARM_Y, 0.09], [0.93, ARM_Y, 0.09], [0.08, 0.075], [0.08, 0.075], {
    bone: root,
    color: weathered([1, 0, 0]),
    group: "post",
  });
  // Lashing where the crossbar crosses the post (seen from behind): two diagonal wraps, an X on the back.
  for (const s of [1, -1]) {
    const loop = polyline(
      [
        [s * 0.058, ARM_Y + 0.052, -0.057],
        [-s * 0.058, ARM_Y - 0.052, -0.057],
        [-s * 0.058, ARM_Y - 0.052, 0.138],
        [s * 0.058, ARM_Y + 0.052, 0.138],
      ],
      { closed: true },
    );
    b.sweep(loop, 0.009, {
      sides: 5,
      bone: root,
      color: grain(ROPE, ROPE_DK, { size: 0.004, seed: 12 }),
      group: "post",
    });
  }

  const soil = spots(mottle(SOIL, SOIL_DK, { size: 0.06, seed: 21 }), PEBBLE, { size: 0.035, amount: 0.12, seed: 22 });
  const mound = b.lathe(
    [
      [0, 0],
      [0.36, 0],
      [0.3, 0.025],
      [0.17, 0.06],
      [0, 0.072],
    ],
    { at: [0, 0, 0], smoothing: 1, segments: 12, bone: root, color: soil, group: "ground" },
  );
  const moundHits = b.surface(mound).scatter(70, {
    rng: rng(23),
    minDist: 0.03,
    filter: (h) => h.n.y > 0.35 && h.at.y > 0.022 && Math.hypot(h.at.x, h.at.z) > 0.08,
  });
  b.cards(moundHits, grass, {
    size: [0.07, 0.08],
    cross: true,
    vary: 0.35,
    spin: 180,
    lean: 10,
    bend: 15,
    rng: rng(24),
    bone: root,
    group: "ground",
  });
  // Straw that has fallen out, lying on the mound.
  const fallen = b.surface(mound).scatter(10, {
    rng: rng(25),
    minDist: 0.05,
    filter: (h) => h.n.y > 0.6 && Math.hypot(h.at.x, h.at.z) < 0.2,
  });
  b.cards(fallen, straws, {
    size: [0.03, 0.09],
    lean: 84,
    spin: 180,
    vary: 0.3,
    rng: rng(26),
    bone: root,
    group: "ground",
  });

  // Pumpkin at the foot of the post: lobes around a stem, ribbed with grain, a curling vine and a leaf.
  const PK: V3 = [0.4, 0, 0.26];
  const rind = grain(PUMPKIN, PUMPKIN_DK, { size: 0.02, seed: 31 });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const dir: V3 = [Math.sin(a), 0, Math.cos(a)];
    b.part(new SphereGeometry(0.07, 8, 6), rind, {
      bone: root,
      at: [PK[0] + dir[0] * 0.05, 0.0668, PK[2] + dir[2] * 0.05],
      dir,
      axis: "z",
      scale: [0.8, 0.95, 1],
      group: "ground",
    });
  }
  b.sweep(bezier([PK[0], 0.11, PK[2]], [PK[0], 0.16, PK[2]], [PK[0] + 0.03, 0.18, PK[2] - 0.01]), [0.014, 0.01], {
    bone: root,
    color: grain(STEM, "#4a3d1f", { size: 0.005, seed: 32 }),
    sides: 6,
    caps: { start: "flat", end: "flat" },
    group: "ground",
  });
  b.sweep(
    spiral([PK[0] - 0.03, 0.14, PK[2] + 0.02], [PK[0] - 0.01, 0.13, PK[2] + 0.02], [0.3, 1, 0.2], {
      turns: 2.2,
      r1: 0.008,
      pitch: 0.012,
    }),
    0.0035,
    { sides: 4, bone: root, color: LEAF, group: "ground" },
  );
  b.extrude(
    [
      [0, 0],
      [0.05, 0.05],
      [0.09, 0.03],
      [0.13, 0.06],
      [0.16, 0, "sharp"],
      [0.13, -0.06],
      [0.09, -0.03],
      [0.05, -0.05],
    ],
    {
      at: [PK[0] - 0.02, 0.012, PK[2] - 0.08],
      x: [-0.6, 0, -0.8],
      y: [0.8, 0, -0.6],
      thickness: 0.006,
      smoothing: 1,
      bone: root,
      color: grain(LEAF, LEAF_DK, { size: 0.01, axis: [-0.6, 0, -0.8], seed: 33 }),
      group: "ground",
    },
  );
  const pumpkinGrass: Frame[] = [];
  for (let i = 0; i < 14; i++) {
    const a = random() * Math.PI * 2;
    const r = 0.13 + random() * 0.07;
    pumpkinGrass.push(frame([PK[0] + Math.sin(a) * r, 0.008, PK[2] + Math.cos(a) * r], [0, 1, 0]));
  }
  b.cards(pumpkinGrass, grass, {
    size: [0.07, 0.07],
    cross: true,
    vary: 0.3,
    spin: 180,
    rng: rng(34),
    bone: root,
    group: "ground",
  });

  // ---------------------------------------------------------------------------------------------------------
  // Torso: one loft from crotch to shoulders, painted as overalls over a flannel shirt.
  const TEAR = new Vector3(0.195, 1.22, BZ + 0.02);
  const bibTop = 1.34;
  const seatPatch = patch([0.08, 0.96, BZ - 0.12], [0.055, 0.048], -9, [0, 0, -1], burlapCloth);
  const torsoPaint = paint((p, n) => {
    const tear = p.distanceTo(TEAR) + (noise(p, 0.012, 3) - 0.5) * 0.018;
    if (tear < 0.02) return tear < 0.014 ? MOUTH : shade(mix(RED, RED_DK, 0.3), 0.8);
    if (p.y < WAIST) {
      const seat = seatPatch(p, n);
      if (seat) return seat;
      const top = WAIST - p.y;
      if (stitch(top, p.x + p.z, 0.005) || stitch(top, p.x + p.z, 0.03)) return THREAD;
      return top < 0.035 ? shade(mix(DENIM, DENIM_DK, 0.4), 1) : denimCloth;
    }
    const front = p.z > BZ + 0.035;
    const back = p.z < BZ - 0.035;
    if (front && p.y < bibTop && Math.abs(p.x) < 0.125) {
      const edge = Math.min(0.125 - Math.abs(p.x), bibTop - p.y);
      if (stitch(edge, edge === bibTop - p.y ? p.x : p.y)) return THREAD;
      // Bib pocket: stitched outline only.
      const px = 0.065 - Math.abs(p.x);
      const py = Math.min(p.y - 1.19, 1.285 - p.y);
      if (px > -0.001 && py > -0.001 && Math.min(px, py) < 0.0025) {
        const along = px < py ? p.y : p.x;
        if (fract(along / 0.011) < 0.58) return THREAD;
      }
      return edge < 0.0022 ? DENIM_DK : denimCloth;
    }
    for (const s of [1, -1]) {
      const d = 0.023 - Math.abs(p.x - s * 0.1);
      if (d > 0 && (p.y >= bibTop - 0.01 || back)) {
        if (stitch(d, p.y + p.z, 0.005)) return THREAD;
        return d < 0.002 ? DENIM_DK : denimCloth;
      }
    }
    return tartan;
  });
  const torso = b.loft(
    [
      { at: [0, 0.88, BZ], w: 0.3, h: 0.21 },
      { at: [0, 0.98, BZ], w: 0.37, h: 0.25 },
      { at: [0, 1.12, BZ], w: 0.36, h: 0.24 },
      { at: [0, 1.3, BZ + 0.01], w: 0.4, h: 0.25 },
      { at: [0, 1.43, BZ], w: 0.42, h: 0.23 },
      { at: [0, 1.51, BZ], w: 0.24, h: 0.16 },
    ],
    { bone: spine, color: torsoPaint, sides: 10, group: "body" },
  );
  const torsoSurface = b.surface(torso);
  // Brass buttons where the straps meet the bib.
  for (const s of [1, -1]) {
    const hit = torsoSurface.nearest([s * 0.1, bibTop - 0.018, BZ + 0.3]);
    const btn = b.stick(new CylinderGeometry(0.013, 0.013, 0.008, 8), BRASS, hit, {
      embed: 0.3,
      group: "body",
    });
    b.stick(new CylinderGeometry(0.006, 0.006, 0.004, 6), "#8d6a22", btn.moved([0, 0.004, 0]), {
      embed: 0.3,
      group: "body",
    });
  }
  // Straw bursting from the torn seam.
  const tearHits = torsoSurface.scatter(9, {
    rng: rng(41),
    minDist: 0.006,
    filter: (h) => h.at.distanceTo(TEAR) < 0.014,
  });
  b.cards(tearHits, straws, {
    size: [0.035, 0.09],
    vary: 0.3,
    spin: 40,
    lean: 25,
    flow: [0.3, -1, 0],
    rng: rng(42),
    group: "body",
  });
  // Rope tying the waist to the post.
  b.sweep(
    catmull(
      [
        [0, WAIST + 0.02, BZ + 0.128],
        [0.19, WAIST + 0.02, BZ],
        [0.07, WAIST + 0.02, -0.058],
        [-0.07, WAIST + 0.02, -0.058],
        [-0.19, WAIST + 0.02, BZ],
      ],
      { closed: true },
    ),
    0.009,
    { sides: 5, bone: hips, color: grain(ROPE, ROPE_DK, { size: 0.004, seed: 13 }), group: "body" },
  );

  // Collar flaps and the straw poking out round the neck.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0.012],
        [0.085, 0.004],
        [0.03, -0.075, "sharp"],
      ],
      {
        at: [s * 0.01, 1.515, BZ + 0.06],
        x: [s, 0, 0.25],
        y: [0, 0.55, -0.83],
        thickness: 0.008,
        bevel: 0.002,
        bone: chest,
        color: tartan,
        group: "body",
      },
    );
  }
  const collar = b.ring(frame([0, 1.5, BZ], [0, 1, 0]), { count: 26, radius: 0.075, tilt: 15 });
  b.cards(collar.items, straws, {
    size: [0.045, 0.1],
    vary: 0.3,
    spin: 40,
    lean: 25,
    bend: 30,
    cross: true,
    flow: [0, -1, 0],
    rng: rng(43),
    bone: chest,
    group: "body",
  });

  // ---------------------------------------------------------------------------------------------------------
  // Arms: flannel sleeves with a burlap elbow patch on the right, tied to the crossbar, straw for hands.
  const rope = grain(ROPE, ROPE_DK, { size: 0.004, seed: 14 });
  const elbowPatch = patch([-0.44, ARM_Y, AZ + 0.06], [0.04, 0.034], 8, [0, 0, 1], burlapCloth);
  const sleevePaint = paint((p, n) => elbowPatch(p, n) ?? tartan);
  arms.forEach((arm, i) => {
    const s = sides[i][0];
    const [shoulder, elbow, wrist] = arm.joints;
    b.sweep(arm, (t) => 0.068 - 0.012 * (t / arm.ts[2]), {
      to: arm.ts[2],
      color: sleevePaint,
      caps: { start: "round", end: "flat" },
      group: `arm${sides[i][1]}`,
    });
    // Rolled cuff.
    b.rod([s * 0.68, ARM_Y, AZ], [s * 0.725, ARM_Y, AZ], 0.063, {
      bone: elbow,
      color: tartan,
      group: `arm${sides[i][1]}`,
    });
    // Ties round sleeve and crossbar.
    for (const [x, bone] of [
      [0.3, shoulder],
      [0.63, elbow],
    ] as const) {
      for (const dx of [0, 0.022]) {
        const X = s * (x + dx);
        b.sweep(
          catmull(
            [
              [X, ARM_Y, AZ + 0.066],
              [X, ARM_Y + 0.06, AZ + 0.025],
              [X, ARM_Y + 0.047, 0.07],
              [X, ARM_Y, 0.042],
              [X, ARM_Y - 0.047, 0.07],
              [X, ARM_Y - 0.06, AZ + 0.025],
            ],
            { closed: true },
          ),
          0.0075,
          { sides: 5, bone, color: rope, group: `arm${sides[i][1]}` },
        );
      }
    }
    // Straw hand: rings of cards fanning out of the cuff.
    const out: V3 = [s, 0, 0];
    const cuff = frame([s * 0.715, ARM_Y, AZ], out);
    const hand = [
      ...b.ring(cuff, { count: 24, radius: 0.045, tilt: 62 }).items,
      ...b.ring(cuff, { count: 12, radius: 0.022, tilt: 80 }).items,
      cuff,
      cuff.moved([0, 0, 0.015]),
    ];
    b.cards(hand, straws, {
      size: [0.045, 0.14],
      vary: 0.3,
      spin: 60,
      bend: 18,
      flow: [0, -1, 0],
      rng: rng(50 + i),
      bone: wrist,
      group: `arm${sides[i][1]}`,
    });
  });

  // ---------------------------------------------------------------------------------------------------------
  // Legs: patched denim with rolled cuffs, straw at the ankles, old boots.
  const kneePatch = patch([0.118, 0.57, BZ + 0.1], [0.045, 0.05], 8, [0, 0, 1], gingham);
  const thighPatch = patch([-0.112, 0.8, BZ + 0.1], [0.04, 0.034], -12, [0, 0, 1], tartan);
  const trousers = paint((p, n) => kneePatch(p, n) ?? thighPatch(p, n) ?? denimCloth);
  const leather = mottle(LEATHER, LEATHER_DK, { size: 0.04, contrast: 0.8, seed: 61 });
  legs.forEach((leg, i) => {
    const side = sides[i][1];
    const [, knee, ankle] = leg.joints;
    b.sweep(leg, (t) => 0.079 - 0.013 * (t / leg.ts[2]), {
      to: leg.ts[2],
      extend: [0.08, 0],
      color: trousers,
      caps: { start: "round", end: "flat" },
      group: `leg${side}`,
    });
    const A = ankle.at;
    const cuffTop = new Vector3(A.x, A.y + 0.05, A.z - 0.004);
    b.rod(cuffTop, [A.x, A.y + 0.002, A.z], 0.073, { bone: knee, color: denimCloth, group: `leg${side}` });
    const ankleRing = b.ring(frame([A.x, A.y + 0.01, A.z], [0, -1, 0]), { count: 18, radius: 0.05, tilt: 45 });
    b.cards(ankleRing.items, straws, {
      size: [0.035, 0.075],
      vary: 0.3,
      spin: 40,
      rng: rng(60 + i),
      bone: knee,
      group: `leg${side}`,
    });
    // Boot: shaft, foot, sole and a round toe, riding the ankle.
    const toe = leg.at(1).at;
    const foot = frame(A, toe.clone().sub(A));
    b.rod([A.x, A.y + 0.06, A.z], foot.local([0, 0.01, 0]), 0.056, {
      bone: ankle,
      color: leather,
      group: `leg${side}`,
    });
    b.frustumBox(foot.local([0, -0.05, -0.02]), foot.local([0, 0.12, -0.03]), [0.1, 0.1], [0.095, 0.075], {
      bone: ankle,
      color: leather,
      group: `leg${side}`,
    });
    b.part(new SphereGeometry(0.05, 8, 5), leather, {
      bone: ankle,
      at: foot.local([0, 0.12, -0.035]),
      dir: foot.axis,
      scale: [0.95, 1, 0.75],
      group: `leg${side}`,
    });
    b.frustumBox(foot.local([0, -0.065, -0.075]), foot.local([0, 0.17, -0.07]), [0.108, 0.022], [0.1, 0.022], {
      bone: ankle,
      color: SOLE,
      group: `leg${side}`,
    });
    // Laces across the instep.
    for (let k = 0; k < 3; k++)
      b.rod(
        foot.local([0.035, 0.02 + k * 0.03, 0.03 - k * 0.004]),
        foot.local([-0.035, 0.02 + k * 0.03, 0.03 - k * 0.004]),
        0.004,
        {
          bone: ankle,
          color: ROPE_DK,
          group: `leg${side}`,
        },
      );
  });

  // ---------------------------------------------------------------------------------------------------------
  // Neck and head: a gathered burlap sack tied with rope, the jaw a separate bowl below the stitched mouth.
  b.rod([0, 1.47, BZ], [0, 1.6, BZ], 0.052, { bone: neck, color: burlapCloth, group: "head" });
  b.lathe(
    [
      [0.048, 0],
      [0.056, 0],
      [0.118, -0.07],
      [0.108, -0.074],
    ],
    { at: [0, 1.555, BZ], segments: 10, bone: neck, color: burlapCloth, group: "head" },
  );
  const neckRope = b.ring(frame([0, 1.556, BZ], [0, 1, 0]), { count: 10, radius: 0.058 });
  b.sweep(catmull(neckRope.items, { closed: true }), 0.0095, { sides: 5, bone: neck, color: rope, group: "head" });
  for (const s of [1, -1])
    b.sweep(bezier([s * 0.012, 1.553, BZ + 0.062], [s * 0.03, 1.53, BZ + 0.075], [s * 0.022, 1.49, BZ + 0.1]), 0.0075, {
      sides: 5,
      bone: neck,
      color: rope,
      group: "head",
    });

  const HC: V3 = [0, 1.67, BZ];
  const cheek = (x: number) => new Vector3(x, 1.646, BZ + 0.115);
  const cheeks = [cheek(0.082), cheek(-0.082)];
  const face = paint((p, n) => {
    if (p.z > BZ + 0.05) {
      // Stitched grin across the cut, curling up at the corners.
      const ax = Math.abs(p.x);
      const mouthY = MOUTH_Y + (ax > 0.06 ? (ax - 0.06) ** 2 * 22 : 0);
      if (ax < 0.1 && Math.abs(p.y - mouthY) < 0.016 && Math.abs(fract(p.x / 0.017) - 0.5) < 0.13) return MOUTH;
      if (ax > 0.055 && ax < 0.1 && Math.abs(p.y - mouthY) < 0.0022) return MOUTH;
      // Felt nose, stitched round.
      const ny = p.y - 1.643;
      const w = (ny / 0.042) * 0.028;
      if (ny > 0 && ny < 0.042 && ax < w) {
        const edge = Math.min(w - ax, 0.042 - ny);
        return edge < 0.0035 ? MOUTH : NOSE;
      }
      for (const c of cheeks) {
        const d = p.distanceTo(c);
        if (d < 0.026) return mix(burlapCloth.at(p, n), CHEEK, 0.45 * smoothstep(0.026, 0.012, d));
      }
    }
    return burlapCloth;
  });
  b.lathe(
    [
      [0, 0],
      [0.132, 0, "sharp"],
      [0.14, 0.035],
      [0.136, 0.085],
      [0.118, 0.14],
      [0.08, 0.18],
      [0, 0.192],
    ],
    {
      at: [0, MOUTH_Y, BZ],
      smoothing: 1,
      segments: 12,
      bone: head,
      color: paint((p, n) => (n.y < -0.95 && p.y < MOUTH_Y + 0.002 ? MOUTH : face)),
      group: "head",
    },
  );
  b.lathe(
    [
      [0, 0],
      [0, -0.094],
      [0.065, -0.09],
      [0.106, -0.07],
      [0.127, -0.035],
      [0.132, 0, "sharp"],
    ],
    {
      at: [0, MOUTH_Y, BZ],
      smoothing: 1,
      segments: 12,
      bone: jaw,
      color: paint((p, n) => (n.y > 0.95 && p.y > MOUTH_Y - 0.002 ? MOUTH : face)),
      group: "head",
    },
  );
  // Button eyes: a mismatched pair, each a short cylinder with its drawn face on top.
  const headSurface = b.surface(head);
  const eyes = [
    { s: 1, r: 0.034, tex: buttonTexture("#4a4853", "#232229", "#a2a0ae"), rim: "#232229" },
    { s: -1, r: 0.028, tex: buttonTexture("#8f5d36", "#553318", "#cfa27a"), rim: "#553318" },
  ];
  for (const e of eyes) {
    const hit = headSurface.around(HC).at(e.s * 31, 15);
    if (!hit) continue;
    // The drawn face is a paper-thin disc lifted off the sack (a cylinder's cap shows the texture as a disc),
    // ringed by a torus so the button has a rim and thickness without a surface right behind the drawing.
    const seat = frame(offset(hit, hit, 0.004), hit);
    b.stick(new CylinderGeometry(e.r, e.r, 0.001, 10), "#ffffff", seat, {
      embed: 0,
      bone: head,
      texture: e.tex,
      group: "head",
    });
    b.stick(new TorusGeometry(e.r, 0.0045, 4, 10).rotateX(-Math.PI / 2), e.rim, seat, {
      embed: 0.5,
      bone: head,
      group: "head",
    });
  }

  // Straw hair from under the brim, round the sides and back, drooping down the sack.
  const hairRoots: Frame[] = [];
  for (let k = 0; k < 30; k++) {
    const az = 62 + (k / 29) * 236 + (random() - 0.5) * 6;
    const hit = headSurface.around(HC).at(az, k % 2 ? 30 : 22);
    if (hit) hairRoots.push(hit);
  }
  b.cards(hairRoots, straws, {
    size: [0.05, 0.12],
    vary: 0.3,
    spin: 25,
    lean: 55,
    bend: 20,
    flow: [0, -1, 0],
    rng: rng(70),
    bone: head,
    group: "head",
  });

  // Straw hat: a coiled braid (rings of distance from the crown), tilted rakishly, frayed at the brim.
  const hatAxis = new Vector3(0.1, 1, -0.16).normalize();
  const hatAt = new Vector3(0.012, 1.765, BZ - 0.012);
  const crownTop = hatAt.clone().addScaledVector(hatAxis, 0.16);
  const braid = paint((p) => {
    const d = p.distanceTo(crownTop);
    const ring = fract(d / 0.011);
    const plait = 0.5 + 0.5 * Math.sin(Math.atan2(p.x - crownTop.x, p.z - crownTop.z) * 90 + d * 400);
    const base = mix(HAT, HAT_DK, 0.25 * plait + 0.6 * smoothstep(0.62, 0.95, noise(p, 0.05, 81)));
    return mix(base, HAT_DK, 0.7 * smoothstep(0.78, 0.96, ring));
  });
  b.lathe(
    [
      [0, 0.012],
      [0.25, -0.01],
      [0.272, -0.008, "sharp"],
      [0.268, 0.004, "sharp"],
      [0.135, 0.022],
      [0.128, 0.125],
      [0.1, 0.155],
      [0, 0.16],
    ],
    { at: hatAt, axis: hatAxis, smoothing: 1, segments: 14, bone: head, color: braid, group: "head" },
  );
  const band = b.lathe(
    [
      [0.126, 0.022],
      [0.138, 0.022],
      [0.135, 0.058],
      [0.123, 0.058],
    ],
    { at: hatAt, axis: hatAxis, segments: 14, bone: head, color: BAND, group: "head" },
  );
  // A sunflower tucked into the band, standing clear of the brim.
  const bandHit = b.surface(band).around(hatAt.clone().addScaledVector(hatAxis, 0.045)).at(62, 0);
  if (bandHit) {
    const tucked = frame(offset(offset(bandHit, bandHit, 0.003), hatAxis, 0.02), bandHit);
    b.stick(new CylinderGeometry(0.044, 0.044, 0.001, 12), "#ffffff", tucked, {
      embed: 0,
      bone: head,
      spin: 20,
      texture: sunflowerTexture(),
      group: "head",
    });
  }
  const fray = b.ring(frame(hatAt.clone().addScaledVector(hatAxis, -0.002), hatAxis), { count: 90, radius: 0.258 });
  b.cards(fray.items, straws, {
    size: [0.02, 0.035],
    vary: 0.4,
    spin: 30,
    rng: rng(71),
    bone: head,
    sink: 0.25,
    group: "head",
  });

  // ---------------------------------------------------------------------------------------------------------
  // A crow perched on the left forearm, looking at the scarecrow.
  const elbowL = arms[0].joints[1];
  const feathers = scales(["#1f232c", "#262c38", "#1a1d25"], CROW_EDGE, { size: 0.014, width: 0.2, seed: 91 });
  const base = new Vector3(0.52, ARM_Y + 0.058, AZ + 0.005);
  const fwd = new Vector3(-1, 0, 0.35).normalize();
  const up = new Vector3(0, 1, 0);
  const side = fwd.clone().cross(up).normalize();
  const C = (f: number, u: number, sd = 0) =>
    base.clone().addScaledVector(fwd, f).addScaledVector(up, u).addScaledVector(side, sd);
  const tiltUp = fwd.clone().addScaledVector(up, 0.35).normalize();
  b.part(new SphereGeometry(0.05, 8, 6), feathers, {
    bone: elbowL,
    at: C(0, 0.075),
    dir: tiltUp,
    axis: "z",
    scale: [0.85, 0.9, 1.55],
    group: "crow",
  });
  b.part(new SphereGeometry(0.034, 7, 5), feathers, {
    bone: elbowL,
    at: C(0.07, 0.125),
    group: "crow",
  });
  b.part(new ConeGeometry(0.012, 0.05, 5), BEAK, {
    bone: elbowL,
    at: C(0.118, 0.118),
    dir: fwd.clone().addScaledVector(up, -0.2),
    group: "crow",
  });
  for (const sd of [1, -1]) {
    b.part(new SphereGeometry(0.0075, 5, 4), EYE, { bone: elbowL, at: C(0.088, 0.135, sd * 0.026), group: "crow" });
    b.part(new SphereGeometry(0.0025, 4, 3), "#ffffff", {
      bone: elbowL,
      at: C(0.092, 0.139, sd * 0.031),
      group: "crow",
    });
    b.extrude(
      [
        [0.05, 0.02],
        [-0.02, 0.03],
        [-0.1, 0.01],
        [-0.13, -0.01, "sharp"],
        [-0.06, -0.015],
        [0.03, -0.01],
      ],
      {
        at: C(0, 0.085, sd * 0.042),
        x: fwd.clone().addScaledVector(up, 0.25),
        y: up,
        thickness: 0.01,
        bevel: 0.003,
        smoothing: 1,
        detail: 0.34,
        bone: elbowL,
        color: feathers,
        group: "crow",
      },
    );
    b.rod(C(0.005, 0.04, sd * 0.016), C(0.01, 0.002, sd * 0.018), 0.004, { bone: elbowL, color: BEAK, group: "crow" });
    b.rod(C(-0.01, 0.002, sd * 0.018), C(0.035, 0.002, sd * 0.02), 0.0035, {
      bone: elbowL,
      color: BEAK,
      group: "crow",
    });
  }
  b.extrude(
    [
      [0, -0.012],
      [0.1, -0.03, "sharp"],
      [0.11, 0, "sharp"],
      [0.1, 0.03, "sharp"],
      [0, 0.012],
    ],
    {
      at: C(-0.07, 0.068),
      x: fwd.clone().multiplyScalar(-1).addScaledVector(up, -0.35),
      y: side,
      thickness: 0.008,
      bevel: 0.002,
      bone: elbowL,
      color: feathers,
      group: "crow",
    },
  );

  return b.root;
}
