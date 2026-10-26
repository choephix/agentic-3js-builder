<!-- call: stage1 -->

```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Gunblade",
  description: "Final Fantasy style revolver gunblade: steel blade with a barrel along the spine, a revolver cylinder, gold wing guard, leather grip and a glowing blue gem.",
};

// Palette (top level so stage 2 can use the names)
export const STEEL = "#c9d3e0";
export const STEEL_LIGHT = "#f2f6fb";
export const STEEL_DARK = "#7b8798";
export const GUNMETAL = "#3a4152";
export const GUNMETAL_DARK = "#222733";
export const GOLD = "#e3b04b";
export const GOLD_DARK = "#a8741f";
export const LEATHER = "#3b2a22";
export const LEATHER_LIGHT = "#5c4034";
export const CRYSTAL = "#4fd2ff";
export const CRYSTAL_DEEP = "#1b6fc4";
export const RED = "#b3262e";
export const BLACK = "#0d0f14";

export const STAGE2: ((b: Builder) => void)[] = [];

export const REQUESTS = [
  {
    id: "bladeEmblem",
    kind: "add",
    part: "bladeSideL",
    what: "Lion-head emblem engraved on the blade's left face near the ricasso, as a small raised relief in GOLD with GOLD_DARK outline, plus two tiny rivets either side. Mirror a plainer version on the right face.",
    at: [0.0135, 0.78, 0.0],
    normal: [1, 0, 0],
    bone: null,
    room: [0.03, 0.14, 0.09],
  },
  {
    id: "wingGuardFiligree",
    kind: "add",
    part: "guardWingL",
    what: "Ornate filigree on both gold wing guards: layered feather-like ridges in GOLD_DARK and GOLD_LIGHT-ish trims, small studs along the edges.",
    at: [0.04, 0.56, 0.07],
    normal: [1, 0, 0],
    bone: null,
    room: [0.04, 0.1, 0.16],
  },
  {
    id: "cylinderEngraving",
    kind: "add",
    part: "cylinder",
    what: "Engraved rings, tiny screws and a gold bezel around each of the six chamber holes on both faces of the revolver cylinder; chamber rims in GOLD, tiny CRYSTAL lights between chambers.",
    at: [0.035, 0.5, 0.0],
    normal: [1, 0, 0],
    bone: null,
    room: [0.03, 0.13, 0.13],
  },
  {
    id: "muzzleDetail",
    kind: "add",
    part: "barrel",
    what: "Muzzle brake at the barrel tip: ventilated slots, a gold crown ring and a small front sight blade, plus a fine ring of grooves under it.",
    at: [0, 1.2, -0.06],
    normal: [0, 1, 0],
    bone: null,
    room: [0.07, 0.1, 0.07],
  },
  {
    id: "hammerTrigger",
    kind: "add",
    part: "hammer",
    what: "Detailed hammer spur with knurling, a trigger with a small pivot pin and a spring behind it, in GUNMETAL_DARK and STEEL.",
    at: [0, 0.47, -0.075],
    normal: [0, 0, -1],
    bone: null,
    room: [0.05, 0.12, 0.08],
  },
  {
    id: "gripFittings",
    kind: "add",
    part: "grip",
    what: "Crossed leather wrapping bands with gold studs at the top and bottom of the grip and a small red cloth tassel strap wrapped around the middle.",
    at: [0, 0.22, 0],
    normal: [0, 0, 1],
    bone: null,
    room: [0.08, 0.3, 0.08],
  },
  {
    id: "pommelCharm",
    kind: "add",
    part: "pommel",
    what: "A short silver chain hanging from the pommel ring ending in a lion-head pendant charm (GOLD) with a tiny CRYSTAL eye. Chain hangs but must not go below y = 0 more than 2 cm; keep it coiled beside the pommel.",
    at: [0, 0.02, 0.04],
    normal: [0, 0, 1],
    bone: null,
    room: [0.1, 0.1, 0.1],
  },
  {
    id: "bladeSpineTeeth",
    kind: "add",
    part: "bladeSideL",
    what: "Decorative notches and small gold clamps joining the barrel to the blade spine, three of them evenly along the barrel with bolts.",
    at: [0, 0.9, -0.055],
    normal: [0, 0, -1],
    bone: null,
    room: [0.07, 0.5, 0.05],
  },
  {
    id: "bladeEtching",
    kind: "texture",
    part: "bladeSideL",
    what: "Fine etched steel look on both blade faces: brushed streaks along the length, a lighter bevel near the edge, faint blue-tinted rune line down the fuller in CRYSTAL, and subtle battle scratches.",
  },
  {
    id: "gripLeather",
    kind: "texture",
    part: "grip",
    what: "Dark stitched leather in LEATHER and LEATHER_LIGHT with diagonal wrap seams and worn highlights.",
  },
  {
    id: "cylinderMetal",
    kind: "texture",
    part: "cylinder",
    what: "Polished silver-steel with gold inlaid lines and slight bluing near chambers, matching the STEEL and GOLD palette.",
  },
];

export default function build() {
  const b = createBuilder({ name: "gunblade" });

  const box = (w: number, h: number, d: number, color: string, at: number[], name: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, name, flat: true, ...(rot ? { rotation: rot } : {}) });
  const cylX = (r: number, len: number, color: string, at: number[], name: string, seg = 12) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at, dir: [1, 0, 0], name, flat: true });

  // ---- pommel
  b.lathe(
    [[0, 0], [0.026, 0.004], [0.04, 0.025], [0.036, 0.05], [0.026, 0.07], [0.024, 0.085], [0, 0.085]],
    { at: [0, 0, 0], segments: 8, color: GOLD, name: "pommel" },
  );
  glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), CRYSTAL, { at: [0, 0.004, 0], name: "pommelGem" }), 1.4);
  b.part(new THREE.TorusGeometry(0.03, 0.006, 5, 10), GOLD_DARK, { at: [0, 0.06, 0], rotation: [90, 0, 0], name: "pommelRing", flat: true });

  // ---- grip
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8), LEATHER, { at: [0, 0.235, 0], name: "grip", flat: true });
  for (let i = 0; i < 7; i++) {
    b.part(new THREE.TorusGeometry(0.0215, 0.0035, 4, 8), i % 2 ? LEATHER_LIGHT : GOLD_DARK, {
      at: [0, 0.11 + i * 0.04, 0], rotation: [90, 0, 0], name: "gripWrap" + i, flat: true,
    });
  }
  b.part(new THREE.CylinderGeometry(0.03, 0.022, 0.02, 8), GOLD, { at: [0, 0.395, 0], name: "gripCollar", flat: true });
  b.part(new THREE.CylinderGeometry(0.022, 0.03, 0.02, 8), GOLD, { at: [0, 0.095, 0], name: "gripBase", flat: true });

  // ---- receiver
  box(0.05, 0.13, 0.12, GUNMETAL, [0, 0.45, 0.0], "receiver");
  box(0.056, 0.03, 0.125, GOLD_DARK, [0, 0.395, 0.0], "receiverBand");
  // trigger guard and trigger
  for (const x of [0.02, -0.02]) {
    b.part(new THREE.TorusGeometry(0.05, 0.007, 4, 12, Math.PI), GOLD, {
      at: [x * 0.0, 0.405, 0.045], dir: [1, 0, 0], axis: "z", rotation: [0, 0, 0], name: "triggerGuardArc" + (x > 0 ? "L" : "R"), flat: true,
      ...{},
    }).mesh.visible = false; // placeholder removed below
  }
  // proper trigger guard: rods + bottom bar
  box(0.012, 0.012, 0.09, GOLD, [0, 0.355, 0.09], "triggerGuardBottom");
  box(0.012, 0.07, 0.012, GOLD, [0, 0.39, 0.135], "triggerGuardFront");
  box(0.012, 0.012, 0.03, GOLD, [0, 0.425, 0.12], "triggerGuardTop");
  box(0.01, 0.045, 0.012, STEEL, [0, 0.4, 0.07], "trigger", [20, 0, 0]);
  // hammer
  box(0.018, 0.06, 0.018, GUNMETAL_DARK, [0, 0.515, -0.075], "hammer", [-30, 0, 0]);
  box(0.022, 0.016, 0.03, STEEL_DARK, [0, 0.5, -0.07], "hammerBase");

  // ---- revolver cylinder
  cylX(0.058, 0.07, STEEL, [0, 0.52, 0.01], "cylinder", 12);
  for (const s of [1, -1]) {
    cylX(0.062, 0.008, GOLD, [s * 0.036, 0.52, 0.01], "cylinderRim" + (s > 0 ? "L" : "R"), 12);
    cylX(0.02, 0.01, GOLD_DARK, [s * 0.04, 0.52, 0.01], "cylinderHub" + (s > 0 ? "L" : "R"), 8);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      cylX(0.011, 0.01, BLACK, [s * 0.04, 0.52 + Math.cos(a) * 0.038, 0.01 + Math.sin(a) * 0.038], "chamber", 6);
    }
  }

  // ---- wing guards (gold), extruded in YZ plane, one per side
  const wing: [number, number][] = [[-0.07, 0.0], [0.0, 0.03], [0.1, 0.035], [0.17, 0.005], [0.12, -0.02], [0.05, -0.045], [-0.03, -0.04]];
  for (const s of [1, -1]) {
    b.extrude(wing, {
      at: [s * 0.04, 0.56, 0.0], x: [0, 0, 1], thickness: 0.012, bevel: 0.002, color: GOLD,
      name: "guardWing" + (s > 0 ? "L" : "R"),
    });
    box(0.012, 0.012, 0.14, GOLD_DARK, [s * 0.047, 0.565, 0.04], "guardWingRidge" + (s > 0 ? "L" : "R"));
    box(0.012, 0.07, 0.012, GOLD_DARK, [s * 0.047, 0.575, -0.04], "guardBack" + (s > 0 ? "L" : "R"));
  }
  // blade holder block
  box(0.05, 0.03, 0.12, GOLD_DARK, [0, 0.575, 0.0], "bladeSeat");
  // crystal gem on the receiver front
  glow(b.part(new THREE.OctahedronGeometry(0.018, 0), CRYSTAL, { at: [0, 0.575, 0.075], scale: [0.8, 1.4, 0.8], name: "gem", flat: true }), 1.5);
  b.part(new THREE.TorusGeometry(0.02, 0.005, 4, 8), GOLD, { at: [0, 0.575, 0.066], dir: [0, 0, 1], axis: "z", name: "gemSetting", flat: true });

  // ---- blade
  const bladeOutline: [number, number][] = [
    [-0.045, 0.0], [0.065, 0.0], [0.068, 0.06], [0.06, 0.62], [0.0, 0.8, ] as any,
    [-0.045, 0.74],
  ];
  const blade = bladeOutline.map((p) => [p[0], p[1]] as [number, number]);
  // tip point: make a long angled tip
  blade[4] = [0.008, 0.82];
  blade[3] = [0.062, 0.62];
  blade.splice(4, 0, [0.045, 0.74]);
  const thick = 0.022;
  for (const s of [1, -1]) {
    // blade body split into two half-slabs so each face is its own named part
    b.extrude(blade, {
      at: [s * thick * 0.25, 0.58, 0.0], x: [0, 0, 1], thickness: thick * 0.5, color: STEEL,
      name: "bladeSide" + (s > 0 ? "L" : "R"),
    });
    // fuller groove
    box(0.002, 0.5, 0.016, STEEL_DARK, [s * (thick * 0.5 + 0.0005), 0.9, 0.0], "fuller" + (s > 0 ? "L" : "R"));
    // ricasso gold plate
    box(0.003, 0.08, 0.1, GOLD_DARK, [s * (thick * 0.5 + 0.001), 0.63, 0.005], "ricasso" + (s > 0 ? "L" : "R"));
  }
  // sharpened edge
  b.extrude([[0.04, 0.12], [0.068, 0.12], [0.064, 0.62], [0.05, 0.7], [0.04, 0.7]], {
    at: [0, 0.58, 0.0], x: [0, 0, 1], thickness: 0.012, color: STEEL_LIGHT, name: "bladeEdge",
  });
  b.extrude([[0.058, 0.1], [0.069, 0.1], [0.065, 0.62], [0.02, 0.81], [0.01, 0.815], [0.03, 0.7]], {
    at: [0, 0.58, 0.0], x: [0, 0, 1], thickness: 0.005, color: STEEL_LIGHT, name: "bladeEdgeTip",
  });

  // ---- barrel along spine
  box(0.036, 0.62, 0.034, GUNMETAL, [0, 0.9, -0.062], "barrel");
  box(0.028, 0.6, 0.012, GUNMETAL_DARK, [0, 0.9, -0.083], "barrelBack");
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.035, 8), GOLD, { at: [0, 1.225, -0.062], name: "muzzleRing", flat: true });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 8), BLACK, { at: [0, 1.245, -0.062], name: "muzzle", flat: true });
  for (const y of [0.7, 0.9, 1.1]) {
    box(0.044, 0.025, 0.044, GOLD_DARK, [0, y, -0.062], "barrelClamp");
  }
  box(0.01, 0.03, 0.01, STEEL, [0, 1.23, -0.085], "frontSight");

  for (const add of STAGE2) add(b);
  return b.root;
}
```

<!-- call: texture -->

Blade etching: a brushed-steel paint with a lighter bevel toward the edge, a faint blue rune line down the fuller, and sparse scratches, on both blade faces (`bladeSideL`/`bladeSideR`).
Grip leather: a dark leather paint with diagonal wrap seams, stitch dashes along the seams and worn highlights, on `grip`.
Cylinder metal: a silver-steel paint with gold inlaid rings, bluing near the chambers and a polish sheen, on `cylinder`.

<<<<<<< SEARCH
export const STAGE2: ((b: Builder) => void)[] = [];
=======
export const STAGE2: ((b: Builder) => void)[] = [];

const BLADE_PAINT = paint((p, n, s) => {
  const streak = noise(new THREE.Vector3(p.x * 8, p.y * 0.6, p.z * 8), 0.05, 3);
  let c: Rgb = mix(STEEL_DARK, STEEL_LIGHT, 0.35 + streak * 0.55);
  const edge = smoothstep(0.035, 0.06, p.z);
  c = mix(c, STEEL_LIGHT, edge * 0.7);
  if (Math.abs(n.x) > 0.5) {
    const rune = Math.abs(p.z) < 0.0035 && p.y > 0.55 && p.y < 1.2;
    if (rune) c = mix(c, CRYSTAL, 0.55);
    const dash = Math.abs(p.z - 0.012) < 0.0015 && Math.floor(p.y / 0.03) % 2 === 0 && p.y > 0.6;
    if (dash) c = mix(c, CRYSTAL_DEEP, 0.4);
  }
  const sc = noise(new THREE.Vector3(p.y * 3, p.z * 40, p.x), 0.02, 11);
  if (sc > 0.74) c = mix(c, GUNMETAL, 0.35);
  return c;
});

const GRIP_PAINT = paint((p, n, s) => {
  const d = (p.y * 1.0 + Math.atan2(p.z, p.x) * 0.02) / 0.03;
  const f = d - Math.floor(d);
  let c: Rgb = mix(LEATHER, LEATHER_LIGHT, noise(p, 0.02, 5) * 0.8);
  if (f < 0.1) c = mix(c, BLACK, 0.7);
  const st = Math.floor(p.y / 0.006) % 2 === 0;
  if (f > 0.14 && f < 0.2 && st) c = mix(c, GOLD, 0.6);
  const wear = smoothstep(0.62, 0.85, noise(p, 0.03, 8));
  return mix(c, LEATHER_LIGHT, wear * 0.5 * smoothstep(0, 1, n.y + 0.6));
});

const CYL_PAINT = paint((p, n) => {
  const r = Math.hypot(p.y - 0.52, p.z - 0.01);
  let c: Rgb = mix(STEEL, STEEL_LIGHT, noise(p, 0.03, 2) * 0.7);
  if (Math.abs(n.x) > 0.5) {
    if (Math.abs(r - 0.048) < 0.0025 || Math.abs(r - 0.025) < 0.0015) c = mix(c, GOLD, 0.85);
    c = mix(c, CRYSTAL_DEEP, 0.35 * smoothstep(0.03, 0.05, r) * smoothstep(0.058, 0.04, r) * noise(p, 0.02, 4));
  } else {
    const ang = Math.atan2(p.z - 0.01, p.y - 0.52);
    if (Math.abs(((ang / (Math.PI / 3)) % 1)) < 0.04) c = mix(c, GOLD, 0.8);
    c = mix(c, STEEL_LIGHT, 0.4 * smoothstep(0.4, 1, n.y));
  }
  return c;
});
>>>>>>> REPLACE

<<<<<<< SEARCH
import { createBuilder } from "agentic-3js-builder";
=======
import { createBuilder, paint, noise, mix, smoothstep } from "agentic-3js-builder";
import type { Rgb } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  cylX(0.058, 0.07, STEEL, [0, 0.52, 0.01], "cylinder", 12);
=======
  cylX(0.058, 0.07, CYL_PAINT, [0, 0.52, 0.01], "cylinder", 12);
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8), LEATHER, { at: [0, 0.235, 0], name: "grip", flat: true });
=======
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8), GRIP_PAINT, { at: [0, 0.235, 0], name: "grip", flat: true });
>>>>>>> REPLACE

<<<<<<< SEARCH
      at: [s * thick * 0.25, 0.58, 0.0], x: [0, 0, 1], thickness: thick * 0.5, color: STEEL,
=======
      at: [s * thick * 0.25, 0.58, 0.0], x: [0, 0, 1], thickness: thick * 0.5, color: BLADE_PAINT,
>>>>>>> REPLACE

<!-- call: add1 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addBladeEmblem(b: Builder) {
  // Lion-head emblem drawn as an SVG texture (gold with dark outline)
  const LION = svg(
    `<svg viewBox="0 0 64 64">
      <path d="M32 3 L40 10 L52 8 L50 20 L58 28 L52 38 L54 50 L42 52 L32 61 L22 52 L10 50 L12 38 L6 28 L14 20 L12 8 L24 10 Z" fill="#e3b04b" stroke="#a8741f" stroke-width="3" stroke-linejoin="round"/>
      <path d="M32 14 L42 22 L40 38 L32 46 L24 38 L22 22 Z" fill="#f3cf7a" stroke="#a8741f" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M24 26 L30 29 L24 31 Z M40 26 L34 29 L40 31 Z" fill="#222733"/>
      <path d="M32 31 L29 38 L32 40 L35 38 Z" fill="#a8741f"/>
      <path d="M27 42 Q32 46 37 42" stroke="#222733" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M26 20 L32 16 L38 20" stroke="#a8741f" stroke-width="2" fill="none"/>
    </svg>`,
    { size: 192 },
  );
  const PLAIN = svg(
    `<svg viewBox="0 0 64 64">
      <path d="M32 6 L54 32 L32 58 L10 32 Z" fill="#a8741f" stroke="#e3b04b" stroke-width="4" stroke-linejoin="round"/>
      <path d="M32 18 L44 32 L32 46 L20 32 Z" fill="#e3b04b"/>
    </svg>`,
    { size: 128 },
  );

  const surfaceX = 0.0135;
  const cy = 0.78;
  const plate = (s: number, tex: THREE.Texture, size: number, name: string) => {
    // backing plate (dark gold) then textured relief on top
    b.part(new THREE.BoxGeometry(0.004, size * 1.12, size * 1.12), "#a8741f", {
      at: [s * (surfaceX + 0.0012), cy, 0],
      name: name + "Backing",
      flat: true,
    });
    b.part(new THREE.PlaneGeometry(size, size), "#ffffff", {
      at: [s * (surfaceX + 0.0036), cy, 0],
      dir: [s, 0, 0],
      axis: "z",
      texture: tex,
      name,
    });
    // rivets above and below
    for (const dz of [-1, 1]) {
      b.part(new THREE.SphereGeometry(0.0045, 6, 4), "#e3b04b", {
        at: [s * (surfaceX + 0.003), cy, dz * size * 0.68],
        name: name + "Rivet",
        flat: true,
      });
    }
    // small corner studs
    for (const dy of [-1, 1]) {
      b.part(new THREE.SphereGeometry(0.0032, 6, 4), "#a8741f", {
        at: [s * (surfaceX + 0.003), cy + dy * size * 0.62, 0],
        name: name + "Stud",
        flat: true,
      });
    }
  };
  plate(1, LION, 0.085, "emblemL");
  plate(-1, PLAIN, 0.06, "emblemR");

  // small glowing inlay accent beneath the emblem
  glow(
    b.part(new THREE.BoxGeometry(0.002, 0.03, 0.004), "#4fd2ff", {
      at: [surfaceX + 0.002, cy - 0.075, 0],
      name: "emblemRune",
      flat: true,
    }),
    1.2,
  );
}
```

<!-- call: add2 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addWingGuardFiligree(b: Builder) {
  const GOLD_LIGHT = "#f6d27a";
  const GOLD_DEEP = "#7a4f14";

  // Wing guard geometry (stage 1): extrude at x = s*0.04, thickness 0.012 along X,
  // outline in (z, y) with offset at y = 0.56. Outline z from -0.07..0.17, y -0.045..0.035.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const xo = s * 0.0475; // just outside the guard's outer face (0.04 + 0.006 + margin)
    const xl = s * 0.0505;

    // Layered feather ridges: fan of tapered bars from root toward the tip.
    const feathers = 6;
    for (let i = 0; i < feathers; i++) {
      const t = i / (feathers - 1);
      const z0 = -0.04 + t * 0.07;
      const z1 = 0.03 + t * 0.13;
      const y0 = 0.555 + (t - 0.5) * 0.012;
      const y1 = 0.56 + (t - 0.5) * 0.03 - 0.005 + t * 0.002;
      const len = Math.hypot(z1 - z0, y1 - y0);
      const ang = Math.atan2(y1 - y0, z1 - z0);
      const mz = (z0 + z1) / 2;
      const my = (y0 + y1) / 2;
      b.part(new THREE.BoxGeometry(0.005, 0.007 - t * 0.0015, len), i % 2 ? GOLD_DARK : GOLD_LIGHT, {
        at: [xo + s * 0.0005 * i, my, mz],
        rotation: [(-ang * 180) / Math.PI, 0, 0],
        name: `s22Feather${side}${i}`,
        flat: true,
      });
    }

    // Edge trim along the top rim
    b.part(new THREE.BoxGeometry(0.004, 0.004, 0.17), GOLD_LIGHT, {
      at: [xl, 0.592, 0.045],
      rotation: [-1.5, 0, 0],
      name: `s22TrimTop${side}`,
      flat: true,
    });
    // Lower rim trim
    b.part(new THREE.BoxGeometry(0.004, 0.004, 0.15), GOLD_DEEP, {
      at: [xl, 0.52, 0.04],
      rotation: [6, 0, 0],
      name: `s22TrimBot${side}`,
      flat: true,
    });

    // Studs along the edges
    for (let k = 0; k < 7; k++) {
      const z = -0.045 + k * 0.03;
      const yTop = 0.588 + (k > 3 ? -0.006 * (k - 3) : 0);
      b.part(new THREE.SphereGeometry(0.0042, 6, 4), GOLD_LIGHT, {
        at: [xl + s * 0.001, yTop - 0.004, z],
        name: `s22StudTop${side}${k}`,
      });
    }
    for (let k = 0; k < 5; k++) {
      const z = -0.02 + k * 0.035;
      b.part(new THREE.SphereGeometry(0.0038, 6, 4), GOLD_DEEP, {
        at: [xl + s * 0.001, 0.527 + k * 0.001, z],
        name: `s22StudBot${side}${k}`,
      });
    }

    // Root medallion at the guard base
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.005, 10), GOLD_DEEP, {
      at: [xo + s * 0.001, 0.565, -0.035],
      dir: [s, 0, 0],
      name: `s22MedallionOuter${side}`,
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.007, 8), GOLD_LIGHT, {
      at: [xo + s * 0.002, 0.565, -0.035],
      dir: [s, 0, 0],
      name: `s22MedallionInner${side}`,
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.004, 6, 4), CRYSTAL, {
      at: [xo + s * 0.0055, 0.565, -0.035],
      name: `s22MedallionGem${side}`,
    });

    // Tip spike
    b.part(new THREE.ConeGeometry(0.006, 0.03, 6), GOLD_LIGHT, {
      at: [s * 0.04, 0.562, 0.185],
      dir: [0, 0.1, 1],
      name: `s22Tip${side}`,
      flat: true,
    });
  }
}
```

<!-- call: add3 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addCylinderEngraving(b: Builder) {
  // ---------- Cylinder engraving ----------
  const CY = 0.52;
  const CZ = 0.01;
  const faceTex = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="47" fill="none" stroke="#555" stroke-width="3"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#777" stroke-width="2"/>
      <circle cx="50" cy="50" r="13" fill="none" stroke="#555" stroke-width="3"/>
      <path d="M50 14 L50 24 M50 76 L50 86 M14 50 L24 50 M76 50 L86 50" stroke="#666" stroke-width="3"/>
    </svg>`,
    { size: 192 },
  );
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = s * 0.0445;
    b.part(new THREE.CircleGeometry(0.056, 24), "#d9e1ec", {
      at: [x, CY, CZ],
      dir: [s, 0, 0],
      axis: "z",
      texture: faceTex,
      name: "cylFaceEngrave" + side,
    });
    // chamber bezels, screws, lights
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const y = CY + Math.cos(a) * 0.038;
      const z = CZ + Math.sin(a) * 0.038;
      b.part(new THREE.TorusGeometry(0.0135, 0.0032, 4, 8), GOLD, {
        at: [x + s * 0.0008, y, z],
        dir: [s, 0, 0],
        axis: "z",
        name: "chamberBezel" + side + i,
        flat: true,
      });
      const a2 = a + Math.PI / 6;
      const y2 = CY + Math.cos(a2) * 0.046;
      const z2 = CZ + Math.sin(a2) * 0.046;
      glow(
        b.part(new THREE.SphereGeometry(0.004, 5, 4), CRYSTAL, {
          at: [x + s * 0.001, y2, z2],
          name: "chamberLight" + side + i,
        }),
        1.5,
      );
      b.part(new THREE.CylinderGeometry(0.003, 0.003, 0.002, 6), GOLD_DARK, {
        at: [x + s * 0.0005, CY + Math.cos(a2) * 0.025, CZ + Math.sin(a2) * 0.025],
        dir: [s, 0, 0],
        name: "cylScrew" + side + i,
        flat: true,
      });
    }
    // hub cap with gem
    b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.004, 8), GOLD, {
      at: [s * 0.046, CY, CZ],
      dir: [s, 0, 0],
      name: "hubCap" + side,
      flat: true,
    });
  }
  // outer cylinder groove rings
  for (const dx of [-0.02, 0, 0.02]) {
    b.part(new THREE.TorusGeometry(0.0585, 0.0016, 4, 12), GUNMETAL_DARK, {
      at: [dx, CY, CZ],
      dir: [1, 0, 0],
      axis: "z",
      name: "cylGroove",
      flat: true,
    });
  }

  // ---------- Muzzle detail ----------
  const MX = 0;
  const MZ = -0.062;
  // crown ring above the muzzle ring
  b.part(new THREE.CylinderGeometry(0.0235, 0.0235, 0.008, 8), GOLD_DARK, {
    at: [MX, 1.2, MZ],
    name: "muzzleCrownLow",
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.026, 0.0235, 0.007, 8), GOLD, {
    at: [MX, 1.248, MZ],
    name: "muzzleCrownTop",
    flat: true,
  });
  // ventilated slots on the brake
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.BoxGeometry(0.004, 0.008, 0.016), BLACK, {
        at: [s * 0.0225, 1.212 + i * 0.011, MZ],
        name: "muzzleSlot",
        flat: true,
      });
    }
  }
  for (let i = 0; i < 3; i++) {
    b.part(new THREE.BoxGeometry(0.016, 0.008, 0.004), BLACK, {
      at: [0, 1.212 + i * 0.011, MZ + 0.0225],
      name: "muzzleSlotF",
      flat: true,
    });
  }
  // fine grooves under the brake
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.CylinderGeometry(0.0215, 0.0215, 0.0025, 8), GUNMETAL_DARK, {
      at: [MX, 1.165 + i * 0.008, MZ],
      name: "muzzleGroove",
      flat: true,
    });
  }
  // front sight blade
  b.extrude(
    [
      [0, 0],
      [0.014, 0],
      [0.01, 0.026],
      [0.003, 0.03],
    ],
    {
      at: [0, 1.24, -0.082],
      x: [0, 0, 1],
      thickness: 0.005,
      color: STEEL,
      name: "sightBlade",
    },
  );
  b.part(new THREE.SphereGeometry(0.004, 5, 4), RED, {
    at: [0, 1.268, -0.0805],
    name: "sightDot",
  });
}
```

<!-- call: add4 -->

```ts
import * as THREE from "three";
import { type Builder, svg, rng } from "agentic-3js-builder";

export function addHammerTrigger(b: Builder) {
  const R = rng(24);
  const BRASS_PIN = "#8a8f9c";
  const part = (g: THREE.BufferGeometry, c: string, at: number[], name: string, rot?: number[]) =>
    b.part(g, c, { at, name, flat: true, ...(rot ? { rotation: rot } : {}) });

  // knurling texture for hammer spur
  const KNURL = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#9aa3b2"/>` +
      Array.from({ length: 8 }, (_, i) => `<path d="M0 ${i * 4} L32 ${i * 4 + 4}" stroke="#2a3040" stroke-width="1.2"/><path d="M0 ${i * 4 + 4} L32 ${i * 4}" stroke="#2a3040" stroke-width="1.2"/>`).join("") +
      `</svg>`,
    { size: 64 },
  );

  // ---- hammer assembly (behind the receiver, y~0.47..0.56, z~-0.075)
  // pivot boss on the receiver back
  part(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 8), STEEL, [0, 0.49, -0.083], "s24HammerBoss", [90, 0, 0]);
  part(new THREE.CylinderGeometry(0.006, 0.006, 0.016, 6), GUNMETAL_DARK, [0, 0.49, -0.085], "s24HammerPin", [90, 0, 0]);
  // hammer body arm sweeping back and up
  part(new THREE.BoxGeometry(0.02, 0.05, 0.016), GUNMETAL_DARK, [0, 0.515, -0.092], "s24HammerArm", [-28, 0, 0]);
  // spur head (knurled)
  b.part(new THREE.BoxGeometry(0.026, 0.02, 0.028), "#ffffff", {
    at: [0, 0.545, -0.108], rotation: [-35, 0, 0], name: "s24HammerSpur", flat: true, texture: KNURL,
  });
  // spur top ridges
  for (let i = 0; i < 4; i++) {
    part(new THREE.BoxGeometry(0.028, 0.0025, 0.004), STEEL, [0, 0.553 + i * 0.0005, -0.1 - i * 0.0065 + 0.003], "s24SpurRidge" + i, [-35, 0, 0]);
  }
  // firing nose
  part(new THREE.ConeGeometry(0.006, 0.02, 6), STEEL, [0, 0.49, -0.07], "s24Striker", [-90, 0, 0]);
  // hammer shoulders
  for (const s of [1, -1]) part(new THREE.BoxGeometry(0.004, 0.026, 0.026), STEEL_DARK, [s * 0.011, 0.5, -0.088], "s24HammerCheek", [-20, 0, 0]);

  // ---- mainspring behind receiver
  const pts: THREE.Vector3[] = [];
  const turns = 5;
  for (let i = 0; i <= turns * 8; i++) {
    const t = i / (turns * 8);
    const a = t * turns * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.sin(a) * 0.006, 0.43 + t * 0.045, -0.092 + Math.cos(a) * 0.006 - t * 0.012));
  }
  const spring = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.0012, 4);
  b.part(spring, STEEL, { at: [0, 0, 0], name: "s24Mainspring", flat: true });
  part(new THREE.BoxGeometry(0.014, 0.008, 0.012), GUNMETAL_DARK, [0, 0.425, -0.09], "s24SpringSeat");
  part(new THREE.BoxGeometry(0.01, 0.006, 0.008), STEEL_DARK, [0, 0.482, -0.103], "s24SpringCap");

  // ---- trigger details (front of grip, near y 0.4, z 0.07)
  part(new THREE.CylinderGeometry(0.005, 0.005, 0.03, 8), BRASS_PIN, [0, 0.42, 0.065], "s24TriggerPivot", [0, 0, 90]);
  for (const s of [1, -1]) {
    part(new THREE.CylinderGeometry(0.0065, 0.0065, 0.003, 8), STEEL, [s * 0.0165, 0.42, 0.065], "s24PivotHead" + (s > 0 ? "L" : "R"), [0, 0, 90]);
    part(new THREE.BoxGeometry(0.003, 0.02, 0.006), STEEL_DARK, [s * 0.0065, 0.43, 0.066], "s24TriggerBracket" + (s > 0 ? "L" : "R"));
  }
  // trigger curved face
  part(new THREE.BoxGeometry(0.012, 0.012, 0.012), STEEL, [0, 0.38, 0.082], "s24TriggerTip", [20, 0, 0]);
  for (let i = 0; i < 3; i++) part(new THREE.BoxGeometry(0.013, 0.0018, 0.003), GUNMETAL_DARK, [0, 0.386 + i * 0.006, 0.0795 + i * 0.002], "s24TriggerGroove" + i, [20, 0, 0]);
  // trigger return spring
  const sp2: THREE.Vector3[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24, a = t * 4 * Math.PI * 2;
    sp2.push(new THREE.Vector3(Math.sin(a) * 0.004, 0.41 - t * 0.012, 0.045 + Math.cos(a) * 0.004));
  }
  b.part(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sp2), 24, 0.0008, 4), STEEL, { at: [0, 0, 0], name: "s24TriggerSpring", flat: true });

  // receiver screws
  for (const [y, z] of [[0.49, -0.04], [0.42, -0.03], [0.5, 0.03]] as number[][]) {
    for (const s of [1, -1]) {
      part(new THREE.CylinderGeometry(0.006, 0.006, 0.003, 8), STEEL, [s * 0.026, y, z], "s24Screw", [0, 0, 90]);
      part(new THREE.BoxGeometry(0.0035, 0.0012, 0.0012), BLACK, [s * 0.0278, y, z], "s24ScrewSlot", [R() * 90, 0, 0]);
    }
  }
}
```

<!-- call: add5 -->

```ts
import * as THREE from "three";
import { type Builder, rng } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";

export function addGripFittings(b: Builder) {
  const R = rng(25);
  const GRIP_R = 0.02;
  const gy0 = 0.085; // grip spans y 0.085..0.385
  const gy1 = 0.385;

  // Crossed leather wrapping bands: diagonal card-like texture drawn on a sleeve around the grip
  const wrapTex = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#5c4034"/>
      <path d="M-8 20 L20 -8 M-8 52 L52 -8 M12 72 L72 12 M44 72 L72 44 M-8 84 L-8 84" stroke="#222" stroke-width="3"/>
      <path d="M72 20 L44 -8 M72 52 L12 -8 M52 72 L-8 12 M20 72 L-8 44" stroke="#3b2a22" stroke-width="5"/>
      <path d="M-8 20 L20 -8 M-8 52 L52 -8 M12 72 L72 12 M44 72 L72 44" stroke="#8a6350" stroke-width="1.2"/>
    </svg>`,
    { size: 128 },
  );

  const sleeve = (y: number, h: number, name: string) =>
    b.part(new THREE.CylinderGeometry(GRIP_R + 0.0035, GRIP_R + 0.0035, h, 8, 1, true), "#ffffff", {
      at: [0, y, 0],
      texture: wrapTex,
      name,
    });
  sleeve(gy0 + 0.05, 0.07, "s25WrapLow");
  sleeve(gy1 - 0.05, 0.07, "s25WrapHigh");

  // Gold studs ringing top and bottom bands
  const stud = new THREE.SphereGeometry(0.0042, 5, 4);
  for (const y of [gy0 + 0.0, gy0 + 0.1, gy1 - 0.1, gy1 - 0.0]) {
    const n = 8;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (y > 0.2 ? 0.2 : 0);
      b.part(stud, i % 2 ? GOLD : GOLD_DARK, {
        at: [Math.sin(a) * (GRIP_R + 0.0045), y, Math.cos(a) * (GRIP_R + 0.0045)],
        name: "s25Stud",
      });
    }
  }

  // Thin leather cord bands bounding the wraps
  for (const y of [gy0 + 0.1, gy1 - 0.1]) {
    b.part(new THREE.TorusGeometry(GRIP_R + 0.0045, 0.0022, 4, 10), LEATHER, {
      at: [0, y, 0],
      rotation: [90, 0, 0],
      name: "s25Cord",
      flat: true,
    });
  }

  // Red cloth strap wrapped around the middle of the grip (slightly tilted)
  const midY = 0.235;
  const clothTex = svg(
    `<svg viewBox="0 0 32 16" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="16" fill="#b3262e"/>
      <path d="M0 3 H32 M0 13 H32" stroke="#e8c060" stroke-width="1.4"/>
      <path d="M4 8 L8 5 L12 8 L8 11Z M20 8 L24 5 L28 8 L24 11Z" fill="#7a1219"/>
    </svg>`,
    { size: 128 },
  );
  b.part(new THREE.CylinderGeometry(GRIP_R + 0.005, GRIP_R + 0.005, 0.03, 8, 1, true), "#ffffff", {
    at: [0, midY, 0],
    rotation: [6, 0, 0],
    texture: clothTex,
    name: "s25Strap",
  });
  // Knot
  b.part(new THREE.SphereGeometry(0.009, 6, 5), RED, { at: [0, midY - 0.002, GRIP_R + 0.008], scale: [1.2, 1, 0.8], name: "s25Knot" });

  // Tassel: two hanging tails with a binding and fringe
  for (const [dx, len, rot] of [[-0.006, 0.075, 6], [0.007, 0.06, -8]] as const) {
    const top = midY - 0.008;
    b.part(new THREE.BoxGeometry(0.008, len, 0.003), RED, {
      at: [dx, top - len / 2, GRIP_R + 0.012],
      rotation: [0, 0, rot],
      name: "s25TassTail",
      flat: true,
    });
    b.part(new THREE.ConeGeometry(0.006, 0.02, 5), RED, {
      at: [dx + Math.sin((rot * Math.PI) / 180) * -len * 0.55, top - len - 0.006, GRIP_R + 0.012],
      rotation: [180, 0, 0],
      name: "s25TassFringe",
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.0055, 0.0055, 0.005, 6), GOLD, {
      at: [dx, top - len + 0.01, GRIP_R + 0.012],
      rotation: [90, 0, 0],
      name: "s25TassBind",
      flat: true,
    });
  }

  // Small tiny fringe threads at the strap's loose end
  for (let i = 0; i < 5; i++) {
    const x = -0.012 + i * 0.006 + (R() - 0.5) * 0.002;
    b.part(new THREE.BoxGeometry(0.0015, 0.025 + R() * 0.01, 0.0015), i % 2 ? RED : GOLD_DARK, {
      at: [x, midY - 0.02, GRIP_R + 0.007],
      name: "s25Thread",
    });
  }
}
```

<!-- call: add6 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addPommelCharm(b: Builder) {
  const SILVER = "#d9dee6";
  const SILVER_DARK = "#8d95a3";

  // ---- Pommel charm: chain coiled beside the pommel, ending in a lion pendant.
  // Chain links: alternating torus links descending along +Z side of pommel, staying above y=0.
  const links: [number, number, number][] = [];
  const nLinks = 7;
  for (let i = 0; i < nLinks; i++) {
    const t = i / (nLinks - 1);
    const x = 0.012 * Math.sin(t * Math.PI * 1.5);
    const y = 0.075 - t * 0.045;
    const z = 0.04 + 0.014 * Math.cos(t * Math.PI * 1.5);
    links.push([x, y, z]);
  }
  links.forEach((p, i) => {
    b.part(new THREE.TorusGeometry(0.0065, 0.0017, 4, 8), i % 2 ? SILVER : SILVER_DARK, {
      at: p,
      rotation: i % 2 ? [0, 90, 0] : [0, 0, 0],
      name: "s26chainLink" + i,
      flat: true,
    });
  });

  // Anchor ring bridging pommel ring to first link
  b.part(new THREE.TorusGeometry(0.008, 0.002, 4, 8), GOLD_DARK, {
    at: [0, 0.07, 0.034],
    rotation: [0, 90, 0],
    name: "s26chainAnchor",
    flat: true,
  });

  // Pendant: gold lion head
  const px = 0.0, py = 0.02, pz = 0.058;
  b.part(new THREE.CylinderGeometry(0.019, 0.019, 0.006, 10), GOLD, {
    at: [px, py, pz], dir: [0, 0, 1], axis: "y", name: "s26pendantDisc", flat: true,
  });
  b.part(new THREE.TorusGeometry(0.019, 0.0028, 4, 10), GOLD_DARK, {
    at: [px, py, pz + 0.002], name: "s26pendantRim", flat: true,
  });
  // lion face drawn as decal texture
  const lion = svg(
    `<svg viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="30" fill="#e3b04b" stroke="#6b4510" stroke-width="3"/>
      <g fill="#a8741f" stroke="#6b4510" stroke-width="1.5">
        <circle cx="32" cy="9" r="5"/><circle cx="48" cy="15" r="5"/><circle cx="55" cy="32" r="5"/>
        <circle cx="48" cy="49" r="5"/><circle cx="32" cy="55" r="5"/><circle cx="16" cy="49" r="5"/>
        <circle cx="9" cy="32" r="5"/><circle cx="16" cy="15" r="5"/>
      </g>
      <circle cx="32" cy="33" r="17" fill="#f3c968" stroke="#6b4510" stroke-width="2"/>
      <path d="M18 22 L24 12 L28 24Z M46 22 L40 12 L36 24Z" fill="#f3c968" stroke="#6b4510" stroke-width="2"/>
      <path d="M26 38 Q32 34 38 38 L36 46 Q32 49 28 46Z" fill="#c68a2c" stroke="#6b4510" stroke-width="1.5"/>
      <path d="M30 40 L32 43 L34 40Z" fill="#2a1a0a"/>
      <path d="M28 46 Q32 50 36 46" stroke="#2a1a0a" stroke-width="1.5" fill="none"/>
      <path d="M21 28 L28 31 M43 28 L36 31" stroke="#2a1a0a" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.036, 0.036), "#ffffff", {
    at: [px, py, pz + 0.0045], dir: [0, 0, 1], axis: "z", texture: lion, name: "s26pendantFace",
  });
  // crystal eyes
  for (const s of [1, -1]) {
    glow(b.part(new THREE.SphereGeometry(0.0032, 5, 4), CRYSTAL, {
      at: [s * 0.0068, py + 0.0045, pz + 0.0052], name: "s26pendantEye" + (s > 0 ? "L" : "R"),
    }), 1.5);
  }
  // pendant bail
  b.part(new THREE.TorusGeometry(0.005, 0.0015, 4, 8), GOLD_DARK, {
    at: [px, py + 0.022, pz], rotation: [0, 90, 0], name: "s26pendantBail", flat: true,
  });
  // last link connecting chain to pendant
  b.part(new THREE.CylinderGeometry(0.0013, 0.0013, 0.012, 4), SILVER, {
    at: [0.006, 0.04, 0.05], rotation: [30, 0, -10], name: "s26chainTail", flat: true,
  });

  // ---- Barrel clamps: notches, bolts and side plates
  const ys = [0.7, 0.9, 1.1];
  ys.forEach((y, i) => {
    for (const s of [1, -1]) {
      // side clamp plates
      b.part(new THREE.BoxGeometry(0.006, 0.034, 0.05), GOLD, {
        at: [s * 0.024, y, -0.062], name: "s26clampPlate" + i + (s > 0 ? "L" : "R"), flat: true,
      });
      // bolts
      b.part(new THREE.CylinderGeometry(0.0045, 0.0045, 0.006, 6), STEEL_DARK, {
        at: [s * 0.0285, y + 0.009, -0.045], dir: [s, 0, 0], name: "s26bolt" + i + (s > 0 ? "L" : "R") + "a", flat: true,
      });
      b.part(new THREE.CylinderGeometry(0.0045, 0.0045, 0.006, 6), STEEL_DARK, {
        at: [s * 0.0285, y - 0.009, -0.079], dir: [s, 0, 0], name: "s26bolt" + i + (s > 0 ? "L" : "R") + "b", flat: true,
      });
    }
    // rear strap over the barrel back
    b.part(new THREE.BoxGeometry(0.046, 0.012, 0.006), GOLD_DARK, {
      at: [0, y, -0.0895], name: "s26clampStrap" + i, flat: true,
    });
    // blade-spine notches: small triangular teeth between clamps
    if (i < ys.length - 1) {
      const ym = (y + ys[i + 1]) / 2;
      for (const dy of [-0.04, 0, 0.04]) {
        b.part(new THREE.ConeGeometry(0.008, 0.02, 3), STEEL_DARK, {
          at: [0, ym + dy, -0.032], dir: [0, 0, 1], name: "s26notch" + i + "_" + dy, flat: true,
        });
      }
    }
  });
}
```