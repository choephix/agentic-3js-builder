import * as THREE from "three";
import { createBuilder, mottle, stripes, svg } from "../../../../src/index";

export const meta = {
  name: "Dragonfly",
  description: "A perched dragonfly: blue ringed abdomen, green-striped thorax, big teal compound eyes and four veined wings held flat.",
};

// Forewing outline in metres: [span from the root, chord from the leading edge]. Shared by the wing geometry and
// the wing's SVG texture, so the veins land where the mesh has them.
const FORE: Array<[number, number]> = [
  [0.0, 0.0],
  [0.015, 0.0],
  [0.032, 0.0015],
  [0.046, 0.0035],
  [0.0505, 0.0065],
  [0.0495, 0.0085],
  [0.042, 0.0088],
  [0.03, 0.008],
  [0.016, 0.006],
  [0.004, 0.0035],
  [0.0, 0.0022],
];
const maxS = Math.max(...FORE.map((p) => p[0]));
const maxF = Math.max(...FORE.map((p) => p[1]));

// Vein lines [s0, f0, s1, f1] in the same metres.
const VEINS: Array<[number, number, number, number]> = [
  [0.002, 0.0012, 0.05, 0.005],
  [0.002, 0.0026, 0.048, 0.0068],
  [0.002, 0.004, 0.042, 0.008],
  [0.002, 0.0055, 0.031, 0.0086],
  [0.01, 0.0004, 0.01, 0.0058],
  [0.018, 0.001, 0.018, 0.0066],
  [0.027, 0.0016, 0.027, 0.0078],
  [0.036, 0.0024, 0.036, 0.0084],
];

/** The wing drawing as SVG: an iridescent membrane, dark veins and a pterostigma near the tip. */
function wingMarkup() {
  const K = 1000; // svg units per metre
  const X = (s: number) => (s * K).toFixed(3);
  const Y = (f: number) => ((maxF - f) * K).toFixed(3);
  const points = FORE.map(([s, f]) => `${X(s)},${Y(f)}`).join(" ");
  const veins = VEINS.map(([a, b, c, d]) => `<line x1="${X(a)}" y1="${Y(b)}" x2="${X(c)}" y2="${Y(d)}"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${maxS * K} ${maxF * K}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0.4">
      <stop offset="0" stop-color="#d9f7ff"/>
      <stop offset="0.6" stop-color="#e9dcff"/>
      <stop offset="1" stop-color="#c9f2e2"/>
    </linearGradient>
  </defs>
  <polygon points="${points}" fill="url(#g)" stroke="#2c3b2a" stroke-width="0.35" stroke-linejoin="round"/>
  <g stroke="#4a3a22" stroke-width="0.22" fill="none">${veins}</g>
  <rect x="${X(0.04)}" y="${Y(0.0052)}" width="${(0.0065 * K).toFixed(3)}" height="${(0.0016 * K).toFixed(3)}" rx="0.5" fill="#3b2a14"/>
</svg>`;
}

/**
 * One double-sided wing in the horizontal plane, placed relative to its root: front faces up, back faces down.
 * `side` 1 = left (+X), -1 = right. Texture UVs come from the base outline, so a scaled wing shows the same drawing.
 */
function wingGeometry(side: 1 | -1, grow: number, depth: number) {
  const n = FORE.length;
  const pos: number[] = [];
  const nor: number[] = [];
  const uv: number[] = [];
  for (const sheet of [0, 1]) {
    for (const [s, f] of FORE) {
      pos.push(side * s * grow, s * 0.04 * grow - sheet * 0.00004, f * depth);
      nor.push(0, sheet ? -1 : 1, 0);
      uv.push(s / maxS, f / maxF);
    }
  }
  const faces = THREE.ShapeUtils.triangulateShape(
    FORE.map(([s, f]) => new THREE.Vector2(s, f)),
    [],
  );
  const at = (i: number) => new THREE.Vector3(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
  const index: number[] = [];
  for (const [a, b, c] of faces) {
    const up = at(b).sub(at(a)).cross(at(c).sub(at(a))).y >= 0;
    const [x, y, z] = up ? [a, b, c] : [a, c, b];
    index.push(x, y, z, n + x, n + z, n + y);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(index);
  return geometry;
}

export default function dragonfly() {
  const b = createBuilder({ name: "dragonfly", detail: 1, paintSize: 1024 });

  const thoraxPaint = stripes("#3d8a3a", "#152414", { size: 0.006, axis: "x", width: 0.3 });
  const abdomenPaint = stripes("#1f5fb4", "#0c1a2e", { size: 0.012, axis: "z", width: 0.35, wobble: 0.2 });
  const eyePaint = mottle("#2f8f7a", "#a6e8cf", { size: 0.003, contrast: 1.2 });
  const wingTexture = svg(wingMarkup(), { size: 1024 });

  // Skeleton: thorax root, head with a jaw, an 8-joint abdomen.
  b.joint("thorax", { at: [0, 0.021, 0.018], dir: [0, 0, 1] });
  b.joint("head", { parent: "thorax", at: [0, 0.023, 0.034], dir: [0, 0.25, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.0195, 0.0415], dir: [0, 0, 1], role: "jaw" });

  const abdomen = b.chain(
    "abdomen",
    [
      [0, 0.02, 0.008],
      [0, 0.018, -0.012],
      [0, 0.0155, -0.034],
      [0, 0.0135, -0.058],
    ],
    { parent: "thorax", count: 8, role: "tail" },
  );

  // Thorax and abdomen as tubes: a striped thorax, a tapering abdomen with a bulge behind the thorax.
  b.capsule([0, 0.021, 0.027], [0, 0.021, 0.009], 0.0068, { color: thoraxPaint, bone: "thorax", name: "thorax" });
  b.sweep(abdomen, (t: number) => 0.0017 - 0.0004 * t + 0.0009 * Math.sin(Math.PI * Math.min(t / 0.6, 1)), {
    color: abdomenPaint,
    sides: 8,
  });

  // Head: a green face, two big compound eyes, a jaw, short antennae.
  b.part(new THREE.SphereGeometry(0.0055, b.segments(12), b.segments(8)), "#3d6b2c", {
    at: [0, 0.0235, 0.0375],
    bone: "head",
    name: "face",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0075, b.segments(12), b.segments(9)), eyePaint, {
      at: [s * 0.0055, 0.0275, 0.0405],
      bone: "head",
      name: s > 0 ? "eyeL" : "eyeR",
    });
    b.rod([s * 0.0012, 0.0275, 0.0445], [s * 0.0035, 0.0305, 0.0475], 0.00035, {
      color: "#14140f",
      bone: "head",
      name: s > 0 ? "antennaL" : "antennaR",
    });
    b.rod([s * 0.0008, 0.0135, -0.0575], [s * 0.0025, 0.0125, -0.0665], [0.0006, 0.0002], {
      color: "#1a1a14",
      bone: "abdomen8",
      name: s > 0 ? "cerciL" : "cerciR",
    });
  }
  b.part(new THREE.BoxGeometry(0.0045, 0.0022, 0.0055), "#3d6b2c", {
    at: [0, 0.0195, 0.0425],
    bone: "jaw",
    name: "jaw",
  });

  // Six legs, three pairs, each a three-joint chain ending on the ground.
  const pairs = [
    { name: "fore", hipZ: 0.024, kneeZ: 0.031, footZ: 0.037 },
    { name: "mid", hipZ: 0.016, kneeZ: 0.014, footZ: 0.013 },
    { name: "hind", hipZ: 0.008, kneeZ: 0.002, footZ: -0.004 },
  ];
  for (const leg of pairs)
    for (const s of [1, -1]) {
      const k = `${leg.name}${s > 0 ? "L" : "R"}`;
      const chain = b.chain(
        k,
        [
          [s * 0.0055, 0.0155, leg.hipZ],
          [s * 0.015, 0.0062, leg.kneeZ],
          [s * 0.0235, 0.0005, leg.footZ],
        ],
        { parent: "thorax", names: [`${k}Hip`, `${k}Knee`, `${k}Foot`], role: "leg" },
      );
      b.sweep(chain, [0.0013, 0.0008, 0.0005], { name: k, color: "#2e2a20", sides: 6 });
    }

  // Four wings: the forewings wider and forward, the hindwings slightly smaller and set back. Each is a single
  // textured part riding the thorax.
  const wings = [
    { name: "foreWingL", side: 1 as const, grow: 1, depth: 1, at: [0.003, 0.029, 0.0125] },
    { name: "foreWingR", side: -1 as const, grow: 1, depth: 1, at: [-0.003, 0.029, 0.0125] },
    { name: "hindWingL", side: 1 as const, grow: 0.9, depth: 1.15, at: [0.0028, 0.0283, -0.0035] },
    { name: "hindWingR", side: -1 as const, grow: 0.9, depth: 1.15, at: [-0.0028, 0.0283, -0.0035] },
  ];
  for (const w of wings)
    b.part(wingGeometry(w.side, w.grow, w.depth), "#ffffff", {
      name: w.name,
      at: w.at,
      bone: "thorax",
      texture: wingTexture,
    });

  return b.root;
}
