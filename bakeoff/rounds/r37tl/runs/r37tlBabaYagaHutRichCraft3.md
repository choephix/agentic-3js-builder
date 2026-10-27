```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  rng,
  paint,
  mottle,
  grain,
  spots,
  frame,
} from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { cel, furEdge, INK } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Baba Yaga's Hut on Chicken Legs",
  description:
    "A richly painted Slavic folk-art diorama of Baba Yaga's crooked hut, perched on articulated chicken legs with carved trim, glowing windows, a witch's door, and a mossy patch of earth.",
};

const WOOD_LIT = "#9b542d";
const WOOD_DARK = "#542b24";
const WOOD_SHADOW = "#3a2020";
const ROOF = "#342b42";
const ROOF_EDGE = "#6d3f55";
const GOLD = "#d99c3c";
const CREAM = "#f4d28c";
const RED = "#a63732";
const TEAL = "#326d68";
const INK_DARK = "#241624";
const LEG = "#8b4a2c";
const LEG_DARK = "#4a2924";
const CLAW = "#d0a45a";
const WINDOW_GLOW = "#ffd978";

const wood = cel(grain(WOOD_LIT, WOOD_DARK, { size: 0.045, axis: "z", seed: 4 }), WOOD_SHADOW);
const roofPaint = cel(mottle(ROOF, ROOF_EDGE, { size: 0.16, contrast: 1.8, seed: 8 }), "#211b31");
const legPaint = cel(grain(LEG, LEG_DARK, { size: 0.06, axis: "y", seed: 21 }), "#352025");
const creamPaint = cel(CREAM, "#bb794d");
const redPaint = cel(RED, "#662433");
const tealPaint = cel(TEAL, "#193d4a");

const windowTex = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="128" rx="10" fill="#17152a" stroke="#d99c3c" stroke-width="8"/>
    <rect x="17" y="17" width="94" height="94" fill="#ffd978" stroke="#542b24" stroke-width="6"/>
    <path d="M64 18V110M18 64H110" stroke="#542b24" stroke-width="9"/>
    <path d="M24 29 Q44 48 64 28 T104 29 M24 99 Q44 80 64 100 T104 99" fill="none" stroke="#a63732" stroke-width="5"/>
    <circle cx="64" cy="64" r="10" fill="#f4d28c"/>
  </svg>`,
  { size: 256 },
);

const doorTex = svg(
  `<svg viewBox="0 0 128 192" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="192" rx="30" fill="#542b24" stroke="#241624" stroke-width="7"/>
    <path d="M20 165 Q64 137 108 165 M17 125 Q64 98 111 125 M17 86 Q64 58 111 86 M19 45 Q64 20 109 45"
      fill="none" stroke="#b86a35" stroke-width="9"/>
    <path d="M64 18V173" stroke="#3a2020" stroke-width="6"/>
    <circle cx="91" cy="100" r="8" fill="#d99c3c" stroke="#241624" stroke-width="4"/>
    <path d="M29 31 Q64 4 99 31" fill="none" stroke="#f4d28c" stroke-width="5"/>
  </svg>`,
  { size: 256 },
);

const folkBand = svg(
  `<svg viewBox="0 0 256 48" xmlns="http://www.w3.org/2000/svg">
    <rect width="256" height="48" fill="#542b24"/>
    <path d="M0 24 L16 5 L32 24 L48 5 L64 24 L80 5 L96 24 L112 5 L128 24 L144 5 L160 24 L176 5 L192 24 L208 5 L224 24 L240 5 L256 24"
      fill="none" stroke="#f4d28c" stroke-width="8"/>
    <path d="M0 24 L16 43 L32 24 L48 43 L64 24 L80 43 L96 24 L112 43 L128 24 L144 43 L160 24 L176 43 L192 24 L208 43 L224 24 L240 43 L256 24"
      fill="none" stroke="#a63732" stroke-width="5"/>
  </svg>`,
  { size: 256 },
);

const leafTex = svg(
  `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 126 C28 88 11 75 9 47 C7 21 24 7 32 2 C40 7 57 21 55 47 C53 75 36 88 32 126Z"
      fill="#326d68" stroke="#241624" stroke-width="5"/>
    <path d="M32 115V13M31 70L17 48M33 81L48 57" fill="none" stroke="#d99c3c" stroke-width="4"/>
  </svg>`,
  { size: 128 },
);

function box(
  size: [number, number, number],
  at: [number, number, number],
  color: any,
  bone: any,
  name: string,
  texture?: THREE.Texture,
) {
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    bone,
    texture,
    name,
    flat: true,
  });
}

function cylinder(
  radius: number,
  height: number,
  at: [number, number, number],
  color: any,
  bone: any,
  name: string,
  radial = 8,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius * 1.08, height, radial), color, {
    at,
    bone,
    name,
    flat: true,
  });
}

function folkRivet(at: [number, number, number], bone: any, color = GOLD, name = "rivet") {
  return b.part(new THREE.SphereGeometry(0.018, 6, 4), color, {
    at,
    bone,
    name,
    flat: true,
  });
}

function roofGable(at: [number, number, number], bone: any, name: string) {
  return b.extrude(
    [
      [-0.61, 0],
      [0.61, 0],
      [0.0, 0.43, "sharp"],
    ],
    {
      at,
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.88,
      bevel: 0.012,
      smoothing: 0,
      color: roofPaint,
      bone,
      name,
    },
  );
}

function trimBand(y: number, bone: any, name: string, z = 0) {
  return b.part(new THREE.BoxGeometry(1.18, 0.065, 0.91), CREAM, {
    at: [0, y, z],
    bone,
    texture: folkBand,
    name,
    flat: true,
  });
}

function clawToe(
  root: THREE.Vector3,
  tip: [number, number, number],
  bone: any,
  name: string,
) {
  b.sweep(
    catmull([
      root,
      [root.x + (tip[0] - root.x) * 0.42, root.y - 0.012, root.z + (tip[2] - root.z) * 0.35],
      tip,
    ]),
    [0.027, 0.008],
    {
      color: cel(CLAW, "#805436"),
      bone,
      caps: { start: "round", end: "point" },
      section: { ngon: 6 },
      name,
    },
  );
}

function addWindow(x: number, z: number, bone: any, name: string) {
  const surround = box([0.28, 0.34, 0.045], [x, 1.49, z + 0.39], WOOD_DARK, bone, `${name}_surround`);
  b.part(new THREE.PlaneGeometry(0.22, 0.27), WINDOW_GLOW, {
    at: [x, 1.49, z + 0.417],
    bone,
    dir: [0, 0, 1],
    axis: "z",
    texture: windowTex,
    name: `${name}_glass`,
  });
  for (const dx of [-0.13, 0.13]) {
    for (const dy of [1.35, 1.63]) folkRivet([x + dx, dy, z + 0.445], bone, GOLD, `${name}_rivet`);
  }
  return surround;
}

function addShingleRow(y: number, z: number, bone: any, row: number) {
  for (let i = -4; i <= 4; i++) {
    const x = i * 0.12 + (row % 2 ? 0.06 : 0);
    const hit = frame([x, y, z], [0, 0.7, 0.7]);
    b.part(new THREE.BoxGeometry(0.105, 0.13, 0.025), roofPaint, {
      frame: hit,
      bone,
      rotation: [-(row * 9 + 5), 0, 0],
      name: `shingle_${row}_${i}`,
      flat: true,
    });
  }
}

const b = createBuilder({ name: "baba-yaga-hut", detail: 1 });

/* Skeleton first: root body, then four readable articulated poultry legs. */
const houseRoot = b.joint("houseRoot", {
  at: [0, 0.76, 0],
  dir: [0, 1, 0],
  role: "spine",
});

const legData = [
  { side: "L", x: 0.34, z: 0.22, knee: [0.39, 0.42, 0.19] as [number, number, number], foot: [0.31, 0.09, 0.24] as [number, number, number] },
  { side: "R", x: -0.34, z: 0.22, knee: [-0.39, 0.42, 0.19] as [number, number, number], foot: [-0.31, 0.09, 0.24] as [number, number, number] },
  { side: "L", x: 0.34, z: -0.22, knee: [0.39, 0.43, -0.18] as [number, number, number], foot: [0.31, 0.09, -0.24] as [number, number, number] },
  { side: "R", x: -0.34, z: -0.22, knee: [-0.39, 0.43, -0.18] as [number, number, number], foot: [-0.31, 0.09, -0.24] as [number, number, number] },
];

const legChains: any[] = [];
for (let i = 0; i < legData.length; i++) {
  const d = legData[i];
  const path = catmull([
    [d.x, 0.76, d.z],
    d.knee,
    d.foot,
  ]);
  const chain = b.chain(`leg${i + 1}`, path, {
    parent: houseRoot,
    names: [`hip${d.side}${i}`, `knee${d.side}${i}`, `ankle${d.side}${i}`],
    role: "leg",
    contact: d.foot,
    count: 3,
  });
  legChains.push(chain);
  b.sweep(chain, (t: number) => (t < 0.48 ? 0.095 : t < 0.78 ? 0.062 : 0.037), {
    color: legPaint,
    section: { ngon: 6 },
    caps: "round",
    name: `leg_skin_${i}`,
  });
}

/* Main crooked timber cabin. */
box([1.06, 0.58, 0.82], [0, 1.34, 0], wood, houseRoot, "crooked_timber_house");
box([1.12, 0.08, 0.88], [0, 1.05, 0], WOOD_DARK, houseRoot, "lower_foundation");
box([1.12, 0.07, 0.88], [0.02, 1.66, 0], creamPaint, houseRoot, "upper_cornice");
trimBand(1.11, houseRoot, "folk_band_low");
trimBand(1.65, houseRoot, "folk_band_high");

/* Horizontal logs and corner ends. */
for (let y = 1.12, i = 0; y <= 1.57; y += 0.13, i++) {
  box([1.14, 0.035, 0.87], [0, y, 0], woodPaint, houseRoot, `log_front_${i}`);
  for (const x of [-0.55, 0.55]) {
    cylinder(0.035, 0.09, [x, y, 0.425], WOOD_DARK, houseRoot, `log_end_${i}_${x}`, 7);
  }
}

/* Gabled roof, broad eaves, ridge cap and shingles. */
roofGable([0, 1.68, -0.01], houseRoot, "front_gable");
box([0.11, 0.10, 0.98], [0, 1.98, 0], roofPaint, houseRoot, "ridge_cap");
box([1.22, 0.07, 0.94], [0, 1.70, 0], ROOF_EDGE, houseRoot, "roof_eave");
for (let row = 0; row < 4; row++) addShingleRow(1.76 + row * 0.085, 0.03, houseRoot, row);

/* Leaning chimney with a jaunty cap. */
box([0.18, 0.34, 0.18], [-0.31, 1.94, -0.12], WOOD_DARK, houseRoot, "chimney");
box([0.25, 0.06, 0.23], [-0.31, 2.13, -0.12], RED, houseRoot, "chimney_cap");
for (let i = 0; i < 3; i++) folkRivet([-0.39 + i * 0.08, 1.89, -0.215], houseRoot, GOLD, `chimney_rivet_${i}`);

/* Front face: door and glowing folk windows. */
box([0.37, 0.49, 0.055], [0, 1.28, 0.438], WOOD_DARK, houseRoot, "door_frame");
b.part(new THREE.PlaneGeometry(0.30, 0.44), "#ffffff", {
  at: [0, 1.27, 0.472],
  bone: houseRoot,
  dir: [0, 0, 1],
  axis: "z",
  texture: doorTex,
  name: "painted_round_door",
});
addWindow(0.36, 0, houseRoot, "window_left");
addWindow(-0.36, 0, houseRoot, "window_right");
glow(
  b.part(new THREE.PlaneGeometry(0.205, 0.255), WINDOW_GLOW, {
    at: [0.36, 1.49, 0.421],
    bone: houseRoot,
    dir: [0, 0, 1],
    axis: "z",
    texture: windowTex,
    name: "window_left_glow",
  }),
  1.7,
);
glow(
  b.part(new THREE.PlaneGeometry(0.205, 0.255), WINDOW_GLOW, {
    at: [-0.36, 1.49, 0.421],
    bone: houseRoot,
    dir: [0, 0, 1],
    axis: "z",
    texture: windowTex,
    name: "window_right_glow",
  }),
  1.7,
);

/* Doorstep, crooked porch rail, and hanging charm. */
box([0.54, 0.08, 0.24], [0, 0.99, 0.54], WOOD_DARK, houseRoot, "doorstep");
for (const x of [-0.31, 0.31]) {
  cylinder(0.027, 0.28, [x, 1.10, 0.59], WOOD_DARK, houseRoot, `porch_post_${x}`, 7);
  folkRivet([x, 1.23, 0.59], houseRoot, GOLD, `porch_post_cap_${x}`);
}
b.rod([-0.34, 1.22, 0.59], [0.34, 1.17, 0.59], 0.025, {
  color: CREAM,
  bone: houseRoot,
  name: "crooked_porch_rail",
});
b.sweep(
  catmull([
    [-0.22, 1.82, 0.47],
    [-0.16, 1.72, 0.52],
    [-0.05, 1.66, 0.51],
  ]),
  0.012,
  { color: RED, bone: houseRoot, caps: "round", name: "hanging_charm_cord" },
);
b.cards([frame([-0.05, 1.64, 0.51], [0, -1, 0])], leafTex, {
  size: [0.10, 0.18],
  lean: 180,
  flow: [0, 0, 1],
  color: TEAL,
  name: "hanging_leaf_charm",
});

/* Chicken feet: three splayed toes per leg, readable from every angle. */
for (let i = 0; i < legData.length; i++) {
  const d = legData[i];
  const root = new THREE.Vector3(d.foot[0], 0.105, d.foot[2]);
  const sx = d.x > 0 ? 1 : -1;
  const sz = d.z > 0 ? 1 : -1;
  clawToe(root, [d.foot[0] + 0.18 * sx, 0.025, d.foot[2] + 0.08], legChains[i].tip, `toe_front_${i}`);
  clawToe(root, [d.foot[0] - 0.15 * sx, 0.025, d.foot[2] + 0.11 * sz], legChains[i].tip, `toe_side_${i}`);
  clawToe(root, [d.foot[0] + 0.03 * sx, 0.025, d.foot[2] - 0.17 * sz], legChains[i].tip, `toe_back_${i}`);
  b.part(new THREE.SphereGeometry(0.065, 7, 5), legPaint, {
    at: d.foot,
    bone: legChains[i].tip,
    name: `foot_pad_${i}`,
    flat: true,
  });
}

/* Decorative carved corner posts and folk-art medallions. */
for (const x of [-0.53, 0.53]) {
  for (const z of [-0.39, 0.39]) {
    box([0.085, 0.68, 0.085], [x, 1.35, z], WOOD_DARK, houseRoot, `corner_post_${x}_${z}`);
    for (let j = 0; j < 4; j++) folkRivet([x, 1.10 + j * 0.16, z + (z > 0 ? 0.05 : -0.05)], houseRoot, GOLD, `corner_rivet_${x}_${z}_${j}`);
  }
}
for (const x of [-0.22, 0.22]) {
  const medallion = b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.018, 10), RED, {
    at: [x, 1.77, 0.40],
    bone: houseRoot,
    dir: [0, 0, 1],
    name: `gable_medallion_${x}`,
    flat: true,
  });
  folkRivet([x, 1.77, 0.415], houseRoot, GOLD, `gable_star_${x}`);
}

/* Small mossy earth patch keeps the diorama grounded without competing with the hut. */
b.part(
  new THREE.CylinderGeometry(0.72, 0.82, 0.055, 12),
  mottle("#435b32", "#687c3b", { size: 0.18, contrast: 1.5, seed: 41 }),
  {
    at: [0, 0.018, 0],
    bone: houseRoot,
    name: "mossy_diorama_patch",
    flat: true,
  },
);
for (const p of [
  [-0.63, 0.055, 0.18],
  [0.62, 0.054, -0.19],
  [-0.55, 0.052, -0.38],
  [0.55, 0.053, 0.38],
] as [number, number, number][]) {
  b.part(new THREE.DodecahedronGeometry(0.06, 0), "#5a4937", {
    at: p,
    bone: houseRoot,
    name: "small_ground_stone",
    flat: true,
  });
}

return b.root;
}
```