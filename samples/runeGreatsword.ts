import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { mottle } from "../src/paint";
import { svg } from "../src/texture";
import { metal } from "../kits/clockwork";
import { glow } from "../kits/glow";

const STONE = mottle("#45464f", "#777782", { size: 0.24, contrast: 0.72, seed: 31 });
const STONE_DARK = mottle("#30313a", "#595a65", { size: 0.18, contrast: 0.8, seed: 37 });
const IRON = metal("iron", { polish: 0.22, tarnish: 0.38, seed: 12 });
const STEEL = metal("steel", { polish: 0.5, tarnish: 0.18, seed: 19 });
const BRONZE = metal("bronze", { polish: 0.35, tarnish: 0.22, verdigris: 0.08, seed: 23 });
const GILT = metal("gilt", { polish: 0.75, tarnish: 0.12, seed: 29 });
const LEATHER = mottle("#24151a", "#5b2b25", { size: 0.06, contrast: 0.5, seed: 43 });
const RUNELIGHT = "#79ecff";
const RUNE_DARK = "#183c50";
const GEM = "#49d9ff";

const runeTexture = svg(
  `<svg viewBox="0 0 64 512" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#d8fbff" stroke-width="5" stroke-linecap="square" stroke-linejoin="miter">
      <path d="M32 18v42M15 37h34M18 60l14-20 14 20"/>
      <path d="M17 91l15 18 15-18M32 109v38M17 130h30"/>
      <path d="M16 180h32M24 180l8-31 8 31M32 180v32"/>
      <path d="M16 232l16 16 16-16M32 248v42M18 270h28"/>
      <path d="M17 332h30M32 300v64M17 332l15-15 15 15"/>
      <path d="M16 402l16-25 16 25M32 377v54M18 431h28"/>
      <path d="M18 476h28M32 450v44M18 476l14 18 14-18"/>
    </g>
  </svg>`,
  { size: 256 },
);

const pedestalRunes = svg(
  `<svg viewBox="0 0 256 72" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#c9faff" stroke-width="7" stroke-linecap="square" stroke-linejoin="miter">
      <path d="M18 57V15l24 22 24-22v42M78 15l16 21-16 21M96 15l-16 21 16 21"/>
      <path d="M116 15v42M116 37h28M144 15v42M172 15l20 42M192 15l-20 42M210 15v42l28-42v42"/>
    </g>
  </svg>`,
  { size: 256 },
);

export const meta = {
  name: "Runed Greatsword on a Stone Display",
  description: "A chunky Warcraft-style runed greatsword presented in a hand-painted, rune-lit stone shrine.",
  style: "Blizzard/Warcraft",
  commit: "67d30d1",
};

export default function build() {
  const b = createBuilder({ name: "runeGreatsword", detail: 1 });
  const display = b.joint("displayRoot", { at: [0, 0, 0], role: "spine" });

  // Broad, chamfered-looking stepped masonry plinth.
  b.part(new THREE.BoxGeometry(1.2, 0.16, 0.9), STONE_DARK, {
    bone: display,
    at: [0, 0.08, 0],
    name: "plinthBase",
    flat: true,
  });
  b.part(new THREE.BoxGeometry(1.05, 0.14, 0.78), STONE, {
    bone: display,
    at: [0, 0.23, 0],
    name: "plinthStep",
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.86, 0.13, 0.66), STONE_DARK, {
    bone: display,
    at: [0, 0.365, 0],
    name: "plinthUpperStep",
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.43, 0.5, 0.3, 8), STONE, {
    bone: display,
    at: [0, 0.55, 0],
    name: "octagonalShrine",
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.78, 0.12, 0.58), STONE_DARK, {
    bone: display,
    at: [0, 0.76, 0],
    name: "shrineCap",
    flat: true,
  });

  // Bronze trim gives the heavy stone readable tier breaks.
  for (const [i, y] of [0.16, 0.31, 0.7] .entries()) {
    b.part(new THREE.TorusGeometry(i === 2 ? 0.4 : 0.52 - i * 0.06, 0.014, 5, 12), BRONZE, {
      bone: display,
      at: [0, y, 0],
      rotation: [90, 0, 0],
      name: `stoneTrim${i}`,
      flat: true,
    });
  }

  // Chips and corner stones keep the display from reading as a sterile stack of boxes.
  const chips: Array<[number, number, number, number, number, number]> = [
    [-0.46, 0.17, 0.36, 0.1, 0.055, 0.07],
    [0.43, 0.19, -0.31, 0.08, 0.045, 0.06],
    [-0.35, 0.39, -0.28, 0.06, 0.04, 0.045],
    [0.34, 0.4, 0.24, 0.075, 0.035, 0.05],
    [-0.28, 0.67, 0.31, 0.055, 0.03, 0.04],
    [0.27, 0.67, -0.29, 0.05, 0.03, 0.04],
  ];
  chips.forEach(([x, y, z, sx, sy, sz], i) => {
    const chip = new THREE.DodecahedronGeometry(1, 0).scale(sx, sy, sz);
    b.part(chip, STONE_DARK, { bone: display, at: [x, y, z], name: `stoneChip${i}`, flat: true });
  });

  // A carved, glowing face rune on the front of the shrine.
  glow(
    b.part(new THREE.PlaneGeometry(0.56, 0.158), RUNE_DARK, {
      bone: display,
      at: [0, 0.53, 0.438],
      dir: [0, 0, 1],
      axis: "z",
      texture: pedestalRunes,
      name: "shrineRune",
    }),
    1.8,
  );
  b.part(new THREE.BoxGeometry(0.62, 0.018, 0.018), GILT, {
    bone: display,
    at: [0, 0.43, 0.445],
    name: "runeLowerLintel",
    flat: true,
  });

  // Sword grip, seated into the cap and ending just above the pommel.
  b.sweep(
    [[0, 0.39, 0], [0, 0.89, 0]],
    [0.062, 0.055],
    { bone: display, section: { ngon: 6 }, caps: "flat", color: LEATHER, name: "leatherGrip" },
  );
  for (let i = 0; i < 5; i += 1) {
    const y = 0.43 + i * 0.092;
    b.part(new THREE.TorusGeometry(0.071, 0.009, 5, 10), BRONZE, {
      bone: display,
      at: [0, y, 0],
      rotation: [90, 0, 0],
      name: `gripBinding${i}`,
      flat: true,
    });
  }

  // Pommel: a faceted iron crown with a bright cold gem.
  b.lathe(
    [[0, 0], [0.09, 0], [0.14, 0.045], [0.145, 0.11], [0.105, 0.18], [0.055, 0.24], [0, 0.27]],
    { bone: display, at: [0, 0.32, 0], segments: 8, color: IRON, name: "facetedPommel" },
  );
  glow(
    b.part(new THREE.OctahedronGeometry(0.052, 0), GEM, {
      bone: display,
      at: [0, 0.44, 0.13],
      name: "pommelGem",
      flat: true,
    }),
    2.4,
  );

  // Broad, down-swept crossguard, intentionally oversized for a heroic silhouette.
  b.extrude(
    [
      [-0.53, 0.02], [-0.43, 0.1], [-0.25, 0.065], [-0.13, 0.025],
      [0.13, 0.025], [0.25, 0.065], [0.43, 0.1], [0.53, 0.02],
      [0.49, -0.09], [0.38, -0.16], [0.29, -0.08], [0.2, -0.025],
      [-0.2, -0.025], [-0.29, -0.08], [-0.38, -0.16], [-0.49, -0.09],
    ],
    { bone: display, at: [0, 0.91, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.105, bevel: 0.018, color: BRONZE, name: "runedCrossguard" },
  );
  b.part(new THREE.BoxGeometry(0.23, 0.045, 0.122), GILT, {
    bone: display,
    at: [0, 0.92, 0],
    name: "guardCenterPlate",
    flat: true,
  });
  for (const [i, x] of [-0.08, 0, 0.08].entries()) {
    glow(
      b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.014, 8), GEM, {
        bone: display,
        at: [x, 0.92, 0.068],
        dir: [0, 0, 1],
        name: `guardRuneStud${i}`,
        flat: true,
      }),
      1.8,
    );
  }
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.058, 8, 6), GILT, {
      bone: display,
      at: [s * 0.49, 0.9, 0],
      name: `guardCrown${s > 0 ? "R" : "L"}`,
      flat: true,
    });
    b.part(new THREE.OctahedronGeometry(0.034, 0), GEM, {
      bone: display,
      at: [s * 0.49, 0.9, 0.062],
      name: `guardGem${s > 0 ? "R" : "L"}`,
      flat: true,
    });
  }

  // The sword's heavy, tapering silhouette and raised central fuller.
  b.extrude(
    [
      [-0.17, 0], [0.17, 0], [0.19, 0.2], [0.175, 1.3],
      [0.095, 1.53], [0, 1.72, "sharp"], [-0.095, 1.53], [-0.175, 1.3], [-0.19, 0.2],
    ],
    { bone: display, at: [0, 0.94, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: [0.09, 0.03], bevel: 0.012, color: STEEL, name: "greatblade" },
  );
  b.extrude(
    [[-0.034, 0.12], [0.034, 0.12], [0.026, 1.28], [0, 1.57, "sharp"], [-0.026, 1.28]],
    { bone: display, at: [0, 0.94, 0.05], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, bevel: 0.004, color: IRON, name: "bladeFuller" },
  );
  // Bright hand-painted edge rails and a dark shoulder collar break up the long steel plane.
  b.rod([-0.176, 1.13, 0.052], [-0.08, 2.38, 0.052], 0.009, { bone: display, color: GILT, name: "leftBladeEdge" });
  b.rod([0.176, 1.13, 0.052], [0.08, 2.38, 0.052], 0.009, { bone: display, color: GILT, name: "rightBladeEdge" });
  b.part(new THREE.BoxGeometry(0.36, 0.06, 0.11), IRON, {
    bone: display,
    at: [0, 0.99, 0],
    name: "bladeShoulder",
    flat: true,
  });

  // Runes are duplicated on both faces so the relic reads from every hero angle.
  for (const [side, z] of [["front", 0.063], ["back", -0.063]] as const) {
    glow(
      b.part(new THREE.PlaneGeometry(0.15, 1.28), RUNELIGHT, {
        bone: display,
        at: [0, 1.57, z],
        dir: [0, 0, side === "front" ? 1 : -1],
        axis: "z",
        texture: runeTexture,
        name: `bladeRunes${side}`,
      }),
      2.1,
    );
  }

  // Three inset rune studs make the fuller look hammered into the steel rather than printed on.
  for (let i = 0; i < 3; i += 1) {
    glow(
      b.part(new THREE.OctahedronGeometry(0.018, 0), RUNELIGHT, {
        bone: display,
        at: [0, 1.2 + i * 0.28, 0.062],
        name: `runeStud${i}`,
        flat: true,
      }),
      1.6,
    );
  }
  // Broad ward-studs anchor the shrine's upper stone to the rune-lit relic.
  for (const [i, x] of [-0.34, 0.34].entries()) {
    b.part(new THREE.OctahedronGeometry(0.028, 0), GILT, {
      bone: display,
      at: [x, 0.56, 0.34],
      name: `wardStud${i}`,
      flat: true,
    });
  }

  // Tiny corner rivets, kept deliberately graphic at game distance.
  for (const [i, x] of [-0.25, 0.25].entries()) {
    b.part(new THREE.SphereGeometry(0.018, 6, 4), GILT, {
      bone: display,
      at: [x, 0.93, 0.067],
      name: `guardRivet${i}`,
      flat: true,
    });
  }

  return b.root;
}
