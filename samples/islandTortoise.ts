// Island tortoise. A giant tortoise carrying a tiny island on its back, in flat-colour low-poly: every surface is a
// solid fill, every texture an SVG of flat polygons. The shell is a faceted hemisphere tiled with hexagonal scutes
// (each with a paler growth ring) above a notched marginal rim; on top sits a soil-and-turf mound with an oak, a
// tiered pine, a bush, ferns, grass tufts, flowers, toadstools, rocks, a little pool that spills over the edge as
// a waterfall, and a birdhouse on a post. The island rides the body joint; legs, neck, head, jaw and tail are rigged.
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
type V3 = [number, number, number];
import { catmull } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Island Tortoise",
  description:
    "A 1.4 m giant tortoise carrying a tiny island on its shell: turf and moss, an oak and a pine, ferns, flowers, toadstools, rocks, a waterfall pool and a birdhouse, in flat-colour low-poly.",
  builtBy: "Claude Opus 5.5",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: flat fills only.

const SKIN = "#8d8a6a";
const SKIN_DARK = "#6c6a50";
const SKIN_LIGHT = "#b0ab84";
const SCALE = "#a29c74";
const CLAW = "#3b352c";
const SHELL = "#5b4631";
const SHELL_MID = "#7a5d3b";
const SHELL_RING = "#9c7a4a";
const RIM_A = "#4a3826";
const RIM_B = "#6a5034";
const PLASTRON = "#c9b27a";
const EYE = "#16120e";
const GLINT = "#fff8e6";
const BEAK = "#4f4a3a";
const SOIL = "#6b4a2f";
const SOIL_DARK = "#4d3421";
const TURF = "#6f9a3a";
const TURF_DARK = "#557c2c";
const BARK = "#6e4a2e";
const BARK_DARK = "#4c3220";
const LEAF_A = "#3f7a34";
const LEAF_B = "#5c9a3c";
const LEAF_C = "#86b848";
const PINE_A = "#23513a";
const PINE_B = "#2f6a46";
const PINE_C = "#3f8052";
const ROCK_A = "#8b8d8a";
const ROCK_B = "#6d6f6e";
const ROCK_C = "#a8a79e";
const WATER = "#4fa6c9";
const WATER_LIGHT = "#8fd3e6";
const FOAM = "#e6f6f8";
const CAP_RED = "#c8412f";
const DOT = "#f4efe0";
const STEM = "#efe3c4";
const CAP_BROWN = "#b07a3e";
const WOOD = "#c98f4f";
const WOOD_DARK = "#8e5a2c";
const ROOF = "#b8452f";
const HOLE = "#241a12";
const BIRCH = "#ece8dc";
const BIRCH_MARK = "#34302b";
const LEAF_GOLD = "#c8c44c";
const BIRD = "#3d6fb4";
const BIRD_BREAST = "#e0873a";
const LILY = "#f08fb0";

// ---------------------------------------------------------------------------------------------------------------
// Drawings: flat-filled polygons only.

/** A trailing ivy strand, root at the bottom edge: a zigzag stem with alternating flat three-point leaves. */
function vineSvg(seed: number) {
  const r = rng(seed);
  let stem = "";
  let leaves = "";
  let x = 16;
  for (let i = 0; i < 8; i++) {
    const y0 = 96 - i * 11.5;
    const x1 = 16 + (r() - 0.5) * 8;
    stem += `<polygon points="${(x - 0.8).toFixed(1)},${y0} ${(x + 0.8).toFixed(1)},${y0} ${(x1 + 0.7).toFixed(1)},${y0 - 12} ${(x1 - 0.7).toFixed(1)},${y0 - 12}" fill="#4a5a26"/>`;
    x = x1;
    const s = i % 2 ? 1 : -1;
    const size = 6.5 - i * 0.4;
    const lx = x + s * size * 0.9;
    const ly = y0 - 8;
    const fill = i % 3 ? "#3f7a34" : "#5c9a3c";
    leaves += `<polygon points="${x.toFixed(1)},${(ly + 2).toFixed(1)} ${(lx - s * size * 0.2).toFixed(1)},${(ly + size * 0.8).toFixed(1)} ${(lx + s * size * 0.7).toFixed(1)},${(ly + size * 0.2).toFixed(1)} ${(lx + s * size * 0.3).toFixed(1)},${(ly - size * 0.3).toFixed(1)} ${(lx + s * size * 0.2).toFixed(1)},${(ly - size).toFixed(1)} ${(lx - s * size * 0.4).toFixed(1)},${(ly - size * 0.4).toFixed(1)}" fill="${fill}"/>`;
  }
  return svg(`<svg viewBox="0 0 32 96" xmlns="http://www.w3.org/2000/svg">${stem}${leaves}</svg>`, { size: 256 });
}

/** A fern frond: a central rachis with paired pinnae, drawn as flat triangles in two greens. */
function fernSvg(seed: number) {
  const r = rng(seed);
  let body = `<polygon points="15,96 17,96 16.4,4 15.6,4" fill="#3e6b2a"/>`;
  const pairs = 11;
  for (let i = 0; i < pairs; i++) {
    const t = i / pairs;
    const y = 88 - t * 80;
    const len = 13 * (1 - t) ** 0.7 + 2;
    const droop = 3 + r() * 2;
    for (const s of [-1, 1]) {
      const fill = (i + (s > 0 ? 1 : 0)) % 2 ? "#4f8a32" : "#6aa83e";
      const tip = 16 + s * len;
      body += `<polygon points="16,${y.toFixed(1)} ${tip.toFixed(1)},${(y - droop).toFixed(1)} 16,${(y - 6).toFixed(1)}" fill="${fill}"/>`;
    }
  }
  return svg(`<svg viewBox="0 0 32 96" xmlns="http://www.w3.org/2000/svg">${body}</svg>`, { size: 256 });
}

/** A grass tuft: sharp blades fanning from the root. */
function grassSvg(seed: number, shades: string[]) {
  const r = rng(seed);
  let body = "";
  for (let i = 0; i < 9; i++) {
    const x = 10 + r() * 12;
    const tipX = x + (r() - 0.5) * 22;
    const tipY = 2 + r() * 18;
    const w = 1.6 + r() * 1.6;
    body += `<polygon points="${(x - w).toFixed(1)},48 ${(x + w).toFixed(1)},48 ${tipX.toFixed(1)},${tipY.toFixed(1)}" fill="${shades[i % shades.length]}"/>`;
  }
  return svg(`<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">${body}</svg>`, { size: 128 });
}

/** A flower on a stem with two leaves: petals as flat polygons round a disc. */
function flowerSvg(petal: string, centre: string, petals: number) {
  let body = `<polygon points="15,64 17,64 16.6,22 15.4,22" fill="#4a7a2c"/>`;
  body += `<polygon points="16,50 5,40 8,38" fill="#5c9a3c"/><polygon points="16,44 27,34 24,32" fill="#5c9a3c"/>`;
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2;
    const p = (d: number, da: number) =>
      `${(16 + Math.cos(a + da) * d).toFixed(1)},${(16 + Math.sin(a + da) * d).toFixed(1)}`;
    body += `<polygon points="${p(2, -0.5)} ${p(11, -0.18)} ${p(12.5, 0)} ${p(11, 0.18)} ${p(2, 0.5)}" fill="${petal}"/>`;
  }
  body += `<polygon points="${[0, 1, 2, 3, 4, 5].map((k) => `${(16 + Math.cos(k * 1.047) * 3.6).toFixed(1)},${(16 + Math.sin(k * 1.047) * 3.6).toFixed(1)}`).join(" ")}" fill="${centre}"/>`;
  return svg(`<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">${body}</svg>`, { size: 128 });
}

/** A leaf spray: faceted leaves (each split along its midrib into a light and a dark half). */
function leafSvg(seed: number, light: string, dark: string) {
  const r = rng(seed);
  let body = `<polygon points="15,64 17,64 16.5,20 15.5,20" fill="#5a3d25"/>`;
  for (let i = 0; i < 7; i++) {
    const a = -1.2 + (i / 6) * 2.4 + (r() - 0.5) * 0.2;
    const baseY = 58 - i * 5;
    const len = 18 + r() * 8;
    const bx = 16;
    const tx = bx + Math.sin(a) * len;
    const ty = baseY - Math.cos(a) * len;
    const nx = Math.cos(a) * 5;
    const ny = Math.sin(a) * 5;
    const mx = (bx + tx) / 2;
    const my = (baseY + ty) / 2;
    body += `<polygon points="${bx},${baseY} ${(mx + nx).toFixed(1)},${(my + ny).toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)}" fill="${light}"/>`;
    body += `<polygon points="${bx},${baseY} ${(mx - nx).toFixed(1)},${(my - ny).toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)}" fill="${dark}"/>`;
  }
  return svg(`<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">${body}</svg>`, { size: 128 });
}

/** A cushion of moss: overlapping flat hexagons. */
function mossSvg() {
  const r = rng(71);
  let body = "";
  for (let i = 0; i < 22; i++) {
    const x = 3 + r() * 26;
    const y = 22 - r() * 10;
    const rad = 2 + r() * 2.4;
    const shade = ["#4a6d2a", "#5f8a32", "#7aa63c", "#9cc24c"][Math.floor(r() * 4)];
    const pts = [0, 1, 2, 3, 4, 5]
      .map(
        (k) =>
          `${(x + Math.cos(k * 1.047 + 0.3) * rad).toFixed(1)},${(y + Math.sin(k * 1.047 + 0.3) * rad).toFixed(1)}`,
      )
      .join(" ");
    body += `<polygon points="${pts}" fill="${shade}"/>`;
  }
  return svg(`<svg viewBox="0 0 32 24" xmlns="http://www.w3.org/2000/svg">${body}</svg>`, { size: 128 });
}

// ---------------------------------------------------------------------------------------------------------------

/** Unshared vertices so every triangle shades as one crisp facet. */
function facet<T extends THREE.BufferGeometry>(g: T): THREE.BufferGeometry {
  const n = g.index ? g.toNonIndexed() : g;
  n.computeVertexNormals();
  return n;
}

export default function build() {
  const b = createBuilder({ name: "islandTortoise" });
  const r = rng(29);

  // ---- Skeleton ------------------------------------------------------------------------------------------------
  const body = b.joint("body", { at: [0, 0.42, 0], group: "body" });

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.38, 0.36],
      [0, 0.44, 0.5],
      [0, 0.52, 0.6],
    ]),
    { parent: body, count: 3, role: "neck", group: "head" },
  );
  const head = b.joint("head", {
    parent: neck.joints[2],
    at: [0, 0.52, 0.6],
    dir: [0, -0.12, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.5, 0.64], aim: [0, 0.49, 0.78], role: "jaw", group: "head" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.34, -0.46],
      [0, 0.31, -0.55],
      [0, 0.26, -0.62],
    ]),
    { parent: body, count: 2, role: "tail", group: "tail" },
  );

  type Leg = { joints: [V3, V3, V3, V3]; name: string; names: string[] };
  const legs: Leg[] = [];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    legs.push({
      name: `legF${side}`,
      names: ["shoulder", "elbow", "wrist", "hand"].map((n) => n + side),
      joints: [
        [s * 0.24, 0.36, 0.3],
        [s * 0.42, 0.28, 0.4],
        [s * 0.42, 0.12, 0.42],
        [s * 0.43, 0.02, 0.47],
      ],
    });
    legs.push({
      name: `legH${side}`,
      names: ["hip", "knee", "ankle", "foot"].map((n) => n + side),
      joints: [
        [s * 0.24, 0.36, -0.3],
        [s * 0.39, 0.27, -0.37],
        [s * 0.38, 0.12, -0.4],
        [s * 0.39, 0.02, -0.46],
      ],
    });
  }

  // ---- Legs ----------------------------------------------------------------------------------------------------
  for (const leg of legs) {
    const [a, k, w, f] = leg.joints;
    const chain = b.chain(leg.name, [a, k, w], {
      parent: body,
      names: leg.names.slice(0, 2),
      role: "leg",
      contact: [w[0], 0, w[2]],
      group: leg.name,
    });
    const foot = b.joint(leg.names[2], { parent: chain.joints[1], at: w, aim: f, group: leg.name });
    b.sweep(chain, [0.095, 0.085], { section: { ngon: 7 }, color: SKIN, caps: "flat", extend: [0.03, 0.02] });
    // Elephantine foot: a faceted drum resting on the floor, with a ring of blunt claws.
    b.part(facet(new THREE.CylinderGeometry(0.095, 0.11, 0.12, 7)), SKIN_DARK, {
      bone: foot,
      at: [w[0], 0.06, w[2]],
    });
    const out = new THREE.Vector3(f[0] - w[0], 0, f[2] - w[2]).normalize();
    for (let c = -2; c <= 2; c++) {
      const ang = c * 0.35;
      const d = out.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), ang);
      const base: V3 = [w[0] + d.x * 0.075, 0.025, w[2] + d.z * 0.075];
      b.spike(base, [d.x, -0.25, d.z], 0.045, 0.016, { bone: foot, color: CLAW, sides: 5 });
    }
    // Scale plates on the outside of the leg.
    const legLine = new THREE.Vector3(...k).sub(new THREE.Vector3(...a));
    for (let i = 0; i < 4; i++) {
      const t = 0.3 + i * 0.2;
      const p = new THREE.Vector3(...a).addScaledVector(legLine, t);
      const n = new THREE.Vector3(Math.sign(a[0]), 0.4, 0.5).normalize();
      b.stick(facet(new THREE.CylinderGeometry(0.03, 0.035, 0.02, 6)), SCALE, frame(p.addScaledVector(n, 0.065), n), {
        bone: chain.joints[0],
        spin: r() * 60,
      });
    }
  }

  // ---- Neck, head, jaw, tail -----------------------------------------------------------------------------------
  b.sweep(neck, (t) => 0.078 - 0.018 * t, {
    section: { ngon: 8 },
    color: (t) => (Math.floor(t * 9) % 2 ? SKIN : SKIN_LIGHT),
    caps: "flat",
    extend: [0.04, 0],
  });
  const skull = b.part(facet(new THREE.SphereGeometry(1, 7, 5)), SKIN, {
    bone: head,
    at: [0, 0.54, 0.66],
    scale: [0.07, 0.06, 0.09],
  });
  // Horny plates across the crown and cheeks.
  const skullSurface = b.surface(skull);
  for (const [az, el, rad, col] of [
    [0, 70, 0.022, SCALE],
    [0, 40, 0.018, SKIN_LIGHT],
    [180, 75, 0.02, SKIN_LIGHT],
    [40, 55, 0.016, SKIN_LIGHT],
    [-40, 55, 0.016, SKIN_LIGHT],
    [80, 5, 0.018, SCALE],
    [-80, 5, 0.018, SCALE],
  ] as const) {
    const hit = skullSurface.around([0, 0.54, 0.66]).at(az, el);
    if (hit)
      b.stick(facet(new THREE.CylinderGeometry(rad * 0.8, rad, 0.008, 6)), col, hit, {
        bone: head,
        embed: 0.4,
        spin: az,
      });
  }
  b.frustumBox([0, 0.53, 0.68], [0, 0.522, 0.78], [0.1, 0.06], [0.06, 0.04], { bone: head, color: BEAK });
  b.frustumBox([0, 0.495, 0.66], [0, 0.49, 0.775], [0.09, 0.03], [0.05, 0.022], { bone: jaw, color: SKIN_DARK });
  for (const s of [1, -1]) {
    const eyeAt: V3 = [s * 0.058, 0.556, 0.7];
    b.part(facet(new THREE.SphereGeometry(0.016, 6, 4)), EYE, { bone: head, at: eyeAt });
    b.part(new THREE.SphereGeometry(0.005, 4, 3), GLINT, { bone: head, at: [s * 0.068, 0.564, 0.708] });
    b.part(facet(new THREE.SphereGeometry(1, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2)), SKIN_DARK, {
      bone: head,
      at: [s * 0.056, 0.56, 0.7],
      scale: [0.022, 0.012, 0.024],
    });
    b.part(new THREE.SphereGeometry(0.005, 4, 3), EYE, { bone: head, at: [s * 0.012, 0.535, 0.781] });
  }
  b.sweep(tail, [0.035, 0.008], { section: { ngon: 6 }, color: SKIN_DARK, caps: { start: "flat", end: "point" } });

  // ---- Shell ---------------------------------------------------------------------------------------------------
  const SHELL_Y = 0.34;
  const shell = b.part(facet(new THREE.SphereGeometry(1, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2)), SHELL, {
    bone: body,
    at: [0, SHELL_Y, 0],
    scale: [0.43, 0.34, 0.53],
    name: "shell",
  });
  b.part(facet(new THREE.SphereGeometry(1, 10, 3, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2)), PLASTRON, {
    bone: body,
    at: [0, SHELL_Y + 0.005, 0],
    scale: [0.38, 0.09, 0.47],
    name: "plastron",
  });
  const rimPts: V3[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    rimPts.push([Math.sin(a) * 0.44, SHELL_Y + 0.01, Math.cos(a) * 0.54]);
  }
  b.sweep(catmull(rimPts, { closed: true }), [0.03, 0.025], {
    section: { ngon: 5 },
    bone: body,
    color: (t) => (Math.floor(t * 24) % 2 ? RIM_A : RIM_B),
    name: "marginals",
  });
  const shellSurface = b.surface(shell);
  const centre: V3 = [0, SHELL_Y, 0];
  for (const [el, count, size, off] of [
    [16, 12, 0.1, 0],
    [40, 9, 0.1, 0.5],
  ] as const) {
    for (let i = 0; i < count; i++) {
      const hit = shellSurface.around(centre).at(((i + off) / count) * 360, el);
      if (!hit) continue;
      const plate = b.stick(facet(new THREE.CylinderGeometry(size * 0.85, size, 0.03, 6)), SHELL_MID, hit, {
        bone: body,
        spin: 30,
        embed: 0.5,
        flow: [0, 1, 0],
      });
      b.stick(
        facet(new THREE.CylinderGeometry(size * 0.5, size * 0.6, 0.02, 6)),
        SHELL_RING,
        plate.moved([0, 0.012, 0]),
        {
          bone: body,
          spin: 30,
          embed: 0.5,
          flow: [0, 1, 0],
        },
      );
    }
  }

  // ---- Island --------------------------------------------------------------------------------------------------
  const ISLAND_Y = 0.6;
  b.part(facet(new THREE.CylinderGeometry(0.33, 0.24, 0.1, 11)), SOIL, {
    bone: body,
    at: [0, ISLAND_Y, -0.02],
    scale: [1, 1, 1.22],
    name: "soil",
  });
  const turf = b.part(facet(new THREE.SphereGeometry(1, 11, 3, 0, Math.PI * 2, 0, Math.PI / 2)), TURF, {
    bone: body,
    at: [0, ISLAND_Y + 0.045, -0.02],
    scale: [0.345, 0.09, 0.42],
    name: "turf",
  });
  const turfSurface = b.surface(turf);

  // Soil lumps hanging under the turf edge.
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + r() * 0.2;
    b.part(facet(new THREE.DodecahedronGeometry(0.035 + r() * 0.02)), i % 2 ? SOIL_DARK : SOIL, {
      bone: body,
      at: [Math.sin(a) * 0.3, ISLAND_Y - 0.02, -0.02 + Math.cos(a) * 0.37],
    });
  }

  // Oak: a leaning trunk with two limbs and a faceted cloud canopy.
  const oakBase: V3 = [0.1, ISLAND_Y + 0.1, -0.14];
  const oakTop: V3 = [0.13, ISLAND_Y + 0.36, -0.12];
  b.sweep(catmull([oakBase, [0.1, ISLAND_Y + 0.22, -0.15], oakTop]), [0.03, 0.018], {
    bone: body,
    section: { ngon: 6 },
    color: BARK,
  });
  b.sweep(
    catmull([
      [0.11, ISLAND_Y + 0.26, -0.14],
      [0.19, ISLAND_Y + 0.34, -0.1],
    ]),
    [0.014, 0.008],
    {
      bone: body,
      section: { ngon: 5 },
      color: BARK_DARK,
    },
  );
  const canopy: THREE.Mesh[] = [];
  const blobs: [V3, number, string][] = [
    [[0.13, ISLAND_Y + 0.42, -0.12], 0.13, LEAF_A],
    [[0.22, ISLAND_Y + 0.38, -0.08], 0.09, LEAF_B],
    [[0.04, ISLAND_Y + 0.38, -0.16], 0.09, LEAF_B],
    [[0.14, ISLAND_Y + 0.5, -0.1], 0.08, LEAF_C],
    [[0.1, ISLAND_Y + 0.4, -0.02], 0.08, LEAF_A],
  ];
  for (const [at, rad, col] of blobs) {
    canopy.push(
      b.part(facet(new THREE.IcosahedronGeometry(rad, 0)), col, { bone: body, at, rotation: [r() * 60, r() * 90, 0] })
        .mesh,
    );
  }
  const leafTex = [leafSvg(3, LEAF_B, LEAF_A), leafSvg(4, LEAF_C, LEAF_B)];
  b.cards(b.surface(canopy).scatter(120, { rng: rng(5), minDist: 0.025, filter: (h) => h.n.y > -0.5 }), leafTex, {
    size: [0.06, 0.08],
    lean: 50,
    bend: 20,
    vary: 0.3,
    rng: rng(6),
    bone: body,
    name: "oakLeaves",
  });

  // Pine: three tiers of faceted cones on a thin trunk.
  const pineAt: V3 = [-0.15, ISLAND_Y + 0.09, -0.02];
  b.rod(pineAt, [pineAt[0], pineAt[1] + 0.12, pineAt[2]], 0.02, { bone: body, section: { ngon: 5 }, color: BARK_DARK });
  const tiers: [number, number, number, string][] = [
    [0.1, 0.14, 0.16, PINE_A],
    [0.2, 0.11, 0.14, PINE_B],
    [0.29, 0.08, 0.12, PINE_C],
  ];
  for (const [y, rad, h, col] of tiers) {
    b.part(facet(new THREE.ConeGeometry(rad, h, 7)), col, {
      bone: body,
      at: [pineAt[0], pineAt[1] + y, pineAt[2]],
      rotation: [0, r() * 50, 0],
    });
  }

  // Bush and rocks.
  for (let i = 0; i < 4; i++) {
    b.part(facet(new THREE.IcosahedronGeometry(0.05 + r() * 0.02, 0)), [LEAF_A, LEAF_B, LEAF_C][i % 3], {
      bone: body,
      at: [-0.2 + r() * 0.08, ISLAND_Y + 0.1, -0.24 + r() * 0.06],
    });
  }
  const rocks: [V3, number, string][] = [
    [[-0.02, ISLAND_Y + 0.07, 0.32], 0.05, ROCK_A],
    [[0.07, ISLAND_Y + 0.06, 0.35], 0.035, ROCK_B],
    [[0.25, ISLAND_Y + 0.08, -0.28], 0.045, ROCK_C],
    [[-0.26, ISLAND_Y + 0.07, 0.14], 0.04, ROCK_A],
  ];
  for (const [at, rad, col] of rocks)
    b.part(facet(new THREE.DodecahedronGeometry(rad, 0)), col, {
      bone: body,
      at,
      rotation: [r() * 90, r() * 90, 0],
      scale: [1.2, 0.8, 1],
    });

  // Pool with a waterfall spilling over the left edge onto the shell.
  const poolAt: V3 = [0.15, ISLAND_Y + 0.113, 0.12];
  b.part(facet(new THREE.CylinderGeometry(0.09, 0.08, 0.02, 9)), WATER, {
    bone: body,
    at: poolAt,
    scale: [1, 1, 0.8],
    name: "pool",
  });
  b.part(facet(new THREE.CircleGeometry(0.03, 6)), WATER_LIGHT, {
    bone: body,
    at: [poolAt[0] - 0.03, poolAt[1] + 0.011, poolAt[2] - 0.01],
    dir: [0, 1, 0],
    axis: "z",
  });
  // Lily pads (notched flat discs) and a pink water lily.
  for (const [dx, dz, rad] of [
    [0.035, 0.02, 0.022],
    [-0.01, 0.035, 0.016],
    [0.02, -0.03, 0.014],
  ])
    b.part(facet(new THREE.CircleGeometry(rad, 7, 0.4, Math.PI * 1.75)), LEAF_B, {
      bone: body,
      at: [poolAt[0] + dx, poolAt[1] + 0.012, poolAt[2] + dz],
      dir: [0, 1, 0],
      axis: "z",
      up: [dx, 0, dz],
    });
  b.part(facet(new THREE.ConeGeometry(0.01, 0.014, 5, 1, true)), LILY, {
    bone: body,
    at: [poolAt[0] + 0.035, poolAt[1] + 0.02, poolAt[2] + 0.02],
    rotation: [180, 0, 0],
  });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    if (Math.abs(a - Math.PI / 2) < 0.35) continue;
    b.part(facet(new THREE.DodecahedronGeometry(0.02 + r() * 0.01, 0)), [ROCK_A, ROCK_B, ROCK_C][i % 3], {
      bone: body,
      at: [poolAt[0] + Math.sin(a) * 0.095, poolAt[1], poolAt[2] + Math.cos(a) * 0.075],
    });
  }
  const landing = shellSurface.ray([0.36, 1, poolAt[2] + 0.06], [0, -1, 0]);
  const fallEnd: V3 = landing ? [landing.at.x, landing.at.y + 0.01, landing.at.z] : [0.4, 0.4, poolAt[2] + 0.06];
  b.sweep(
    catmull([
      [poolAt[0] + 0.06, poolAt[1] + 0.004, poolAt[2] + 0.02],
      [0.3, ISLAND_Y + 0.1, poolAt[2] + 0.04],
      [0.345, ISLAND_Y + 0.06, poolAt[2] + 0.05],
      [0.36, ISLAND_Y - 0.02, poolAt[2] + 0.06],
      fallEnd,
    ]),
    (): [number, number] => [0.028, 0.006],
    { bone: body, section: "box", color: WATER, name: "waterfall" },
  );
  for (let i = 0; i < 4; i++)
    b.part(facet(new THREE.IcosahedronGeometry(0.018 + i * 0.005, 0)), i % 2 ? FOAM : WATER_LIGHT, {
      bone: body,
      at: [fallEnd[0] + (i % 2 ? 0.02 : -0.01), fallEnd[1] + 0.008, fallEnd[2] + (i - 1.5) * 0.025],
    });
  // Darker turf clumps round the rim.
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.2;
    b.part(facet(new THREE.IcosahedronGeometry(0.03 + r() * 0.015, 0)), TURF_DARK, {
      bone: body,
      at: [Math.sin(a) * 0.3, ISLAND_Y + 0.05, -0.02 + Math.cos(a) * 0.37],
      scale: [1, 0.6, 1],
    });
  }
  // Birdhouse on a post at the back, facing forward: box, pyramid roof, round door and a perch.
  const postAt: V3 = [-0.02, ISLAND_Y + 0.09, -0.33];
  b.rod(postAt, [postAt[0], postAt[1] + 0.2, postAt[2]], 0.014, { bone: body, section: { ngon: 4 }, color: WOOD_DARK });
  const houseAt: V3 = [postAt[0], postAt[1] + 0.25, postAt[2]];
  b.part(new THREE.BoxGeometry(0.09, 0.1, 0.09), WOOD, { bone: body, at: houseAt, name: "birdhouse" });
  b.part(new THREE.BoxGeometry(0.1, 0.012, 0.1), WOOD_DARK, {
    bone: body,
    at: [houseAt[0], houseAt[1] - 0.056, houseAt[2]],
  });
  b.part(facet(new THREE.ConeGeometry(0.092, 0.07, 4)), ROOF, {
    bone: body,
    at: [houseAt[0], houseAt[1] + 0.085, houseAt[2]],
    rotation: [0, 45, 0],
  });
  b.part(facet(new THREE.CircleGeometry(0.018, 7)), HOLE, {
    bone: body,
    at: [houseAt[0], houseAt[1] + 0.012, houseAt[2] + 0.0465],
    dir: [0, 0, 1],
    axis: "z",
  });
  b.rod(
    [houseAt[0], houseAt[1] - 0.025, houseAt[2] + 0.045],
    [houseAt[0], houseAt[1] - 0.025, houseAt[2] + 0.085],
    0.004,
    {
      bone: body,
      section: { ngon: 4 },
      color: WOOD_DARK,
    },
  );
  // A little bluebird on the perch, looking out to the left.
  const birdAt: V3 = [houseAt[0], houseAt[1] - 0.004, houseAt[2] + 0.074];
  b.part(facet(new THREE.SphereGeometry(1, 6, 4)), BIRD, {
    bone: body,
    at: birdAt,
    scale: [0.03, 0.02, 0.018],
    rotation: [0, 0, 20],
  });
  b.part(facet(new THREE.SphereGeometry(1, 5, 3)), BIRD_BREAST, {
    bone: body,
    at: [birdAt[0] + 0.012, birdAt[1] - 0.004, birdAt[2]],
    scale: [0.018, 0.015, 0.015],
  });
  b.part(facet(new THREE.SphereGeometry(0.014, 6, 4)), BIRD, {
    bone: body,
    at: [birdAt[0] + 0.024, birdAt[1] + 0.016, birdAt[2]],
  });
  b.spike([birdAt[0] + 0.034, birdAt[1] + 0.016, birdAt[2]], [1, -0.1, 0], 0.014, 0.004, {
    bone: body,
    sides: 4,
    color: CLAW,
  });
  b.spike([birdAt[0] - 0.022, birdAt[1] + 0.006, birdAt[2]], [-1, 0.35, 0], 0.03, 0.009, {
    bone: body,
    sides: 4,
    color: BIRD,
  });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.003, 4, 2), EYE, {
      bone: body,
      at: [birdAt[0] + 0.03, birdAt[1] + 0.021, birdAt[2] + s * 0.009],
    });

  // Ivy trailing over the soil edge.
  const ivy = [vineSvg(61), vineSvg(62)];
  const vineFrames = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + r() * 0.25;
    if (Math.abs(a - 0.95) < 0.25) continue; // leave the waterfall clear
    vineFrames.push(frame([Math.sin(a) * 0.35, ISLAND_Y + 0.03, -0.02 + Math.cos(a) * 0.425], [0, -1, 0]));
  }
  b.cards(vineFrames, ivy, {
    size: [0.06, 0.18],
    flow: (f) => [f.at.x, 0, f.at.z + 0.02],
    lean: 18,
    vary: 0.3,
    rng: rng(63),
    bone: body,
    name: "ivy",
  });

  // Toadstools in two rings: red with white dots, and a few brown ones.
  for (let i = 0; i < 8; i++) {
    const a = r() * Math.PI * 2;
    const [cx, cz] = i < 4 ? [0.24, -0.16] : [-0.06, 0.16];
    const hit = turfSurface.ray([cx + Math.sin(a) * 0.05, 1.3, cz + Math.cos(a) * 0.05], [0, -1, 0]);
    if (!hit) continue;
    const at: V3 = [hit.at.x, hit.at.y - 0.005, hit.at.z];
    const h = 0.035 + r() * 0.035;
    const red = i % 4 !== 3;
    const capR = 0.022 + r() * 0.014;
    b.rod(at, [at[0], at[1] + h, at[2]], capR * 0.3, { bone: body, section: { ngon: 5 }, color: STEM });
    b.part(facet(new THREE.SphereGeometry(capR, 7, 2, 0, Math.PI * 2, 0, Math.PI / 2)), red ? CAP_RED : CAP_BROWN, {
      bone: body,
      at: [at[0], at[1] + h, at[2]],
      scale: [1, 0.7, 1],
    });
    if (red)
      for (let d = 0; d < 4; d++)
        b.part(new THREE.SphereGeometry(capR * 0.17, 4, 2), DOT, {
          bone: body,
          at: [
            at[0] + Math.sin(d * 1.7) * capR * 0.55,
            at[1] + h + capR * 0.56,
            at[2] + Math.cos(d * 1.7) * capR * 0.55,
          ],
        });
  }

  // Birch sapling at the front right: white trunk with dark flecks, a light gold-green crown.
  const birchBase = turfSurface.ray([-0.19, 1.3, 0.2], [0, -1, 0]);
  if (birchBase) {
    const bb: V3 = [birchBase.at.x, birchBase.at.y - 0.01, birchBase.at.z];
    const bt: V3 = [bb[0] - 0.02, bb[1] + 0.3, bb[2] + 0.01];
    b.sweep(catmull([bb, [bb[0] + 0.01, bb[1] + 0.15, bb[2]], bt]), [0.018, 0.009], {
      bone: body,
      section: { ngon: 5 },
      color: (t) => ([2, 5, 8, 11].includes(Math.floor(t * 14)) ? BIRCH_MARK : BIRCH),
      name: "birch",
    });
    const crown: THREE.Mesh[] = [];
    const crownBlobs: [V3, number, string][] = [
      [[bt[0], bt[1] + 0.02, bt[2]], 0.075, LEAF_C],
      [[bt[0] + 0.05, bt[1] - 0.04, bt[2] + 0.02], 0.055, LEAF_GOLD],
      [[bt[0] - 0.05, bt[1] - 0.05, bt[2] - 0.01], 0.055, LEAF_B],
    ];
    for (const [at, rad, col] of crownBlobs)
      crown.push(
        b.part(facet(new THREE.IcosahedronGeometry(rad, 0)), col, {
          bone: body,
          at,
          rotation: [r() * 60, r() * 90, 0],
          scale: [1, 1.25, 1],
        }).mesh,
      );
    b.cards(
      b.surface(crown).scatter(50, { rng: rng(7), minDist: 0.02, filter: (h) => h.n.y > -0.4 }),
      [leafSvg(8, "#d8cf5a", "#a9a83c"), leafSvg(9, LEAF_C, LEAF_B)],
      { size: [0.045, 0.06], lean: 50, bend: 20, vary: 0.3, rng: rng(10), bone: body, name: "birchLeaves" },
    );
  }

  // Turf dressing: grass, ferns, flowers, moss.
  const grassTex = [grassSvg(11, ["#5c8a30", "#78a83c", "#97c24c"]), grassSvg(12, ["#4c7a2a", "#6a9a36", "#8ab444"])];
  /** Outside the pool's rim, so grass and flowers don't grow through the water. */
  const dry = (h: { at: THREE.Vector3 }) => Math.hypot(h.at.x - poolAt[0], h.at.z - poolAt[2]) > 0.1;
  const turfHits = turfSurface.scatter(260, { rng: rng(21), minDist: 0.02, filter: (h) => h.n.y > 0.2 && dry(h) });
  b.cards(turfHits, grassTex, {
    size: [0.05, 0.07],
    cross: true,
    vary: 0.35,
    spin: 90,
    rng: rng(22),
    bone: body,
    name: "grass",
  });
  const fern = [fernSvg(31), fernSvg(32)];
  for (const [x, z] of [
    [-0.26, -0.12],
    [0.28, -0.02],
    [0.02, 0.27],
    [0.15, -0.33],
    [-0.28, 0.02],
  ]) {
    const hit = turfSurface.ray([x, 1.2, z], [0, -1, 0]);
    if (!hit) continue;
    const fronds = b.ring(frame(hit.at, [0, 1, 0]), { count: 6, tilt: 45 }, () => {});
    b.cards(fronds.items, fern, { size: [0.07, 0.2], lean: 0, bend: 40, rng: rng(33), bone: body, name: "fern" });
  }
  const flowers = [
    flowerSvg("#f2d34a", "#c8702a", 6),
    flowerSvg("#f4f1ea", "#e8b830", 8),
    flowerSvg("#e2607a", "#f2d34a", 5),
    flowerSvg("#8a6ad8", "#f4f1ea", 5),
  ];
  const flowerHits = turfSurface.scatter(60, { rng: rng(41), minDist: 0.035, filter: (h) => h.n.y > 0.3 && dry(h) });
  b.cards(flowerHits, flowers, {
    size: [0.055, 0.1],
    cross: true,
    vary: 0.25,
    spin: 90,
    rng: rng(42),
    bone: body,
    name: "flowers",
  });
  const shellMoss = shellSurface.scatter(90, {
    rng: rng(51),
    minDist: 0.03,
    filter: (h) => h.n.y > 0.55 && h.at.y < ISLAND_Y,
  });
  b.cards(shellMoss, mossSvg(), {
    size: [0.05, 0.035],
    cross: true,
    vary: 0.3,
    spin: 90,
    rng: rng(52),
    bone: body,
    name: "moss",
  });

  return b.root;
}
