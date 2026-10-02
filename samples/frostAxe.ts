import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { grain, mottle, paint } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Frostforged Battle Axe",
  description: "A League of Legends-style frost-forged battle axe with a rune-lit glacier blade, jeweled socket, and wrapped warwood haft.",
  style: "League of Legends",
  commit: "e503085",
};

export default function build() {
  const b = createBuilder({ name: "frostAxe", detail: 1.15, paintSize: 1024 });
  const root = b.joint("axeRoot", { at: [0, 0, 0] });

  const WOOD = grain("#251a2c", "#6b3854", { size: 0.07, axis: "y", seed: 17 });
  const GRIP = grain("#10162d", "#27386a", { size: 0.045, axis: "y", seed: 23 });
  const IRON = mottle("#18264e", "#355d91", { size: 0.12, contrast: 0.6, seed: 9 });
  const EDGE = paint((_p, n, s) => (Math.abs(n.z) > 0.6 && s[1] < 0.11 ? "#b9f4ff" : "#4ba6cf"));
  const ICE = "#8feaff";
  const ICE_BRIGHT = "#d9ffff";
  const ICE_DEEP = "#2d80d0";
  const VIOLET = "#7548cf";
  const DARK = "#0d1530";
  const BRASS = "#d59b58";

  // A tall, slightly tapered warwood haft, grounded by a faceted pommel.
  b.sweep(
    [
      [0, 0.13, 0],
      [0.012, 0.38, 0],
      [-0.01, 0.78, 0],
      [0.006, 1.105, 0],
    ],
    (t) => 0.057 - t * 0.008,
    { bone: root, section: { ngon: 8 }, color: WOOD, caps: "round", name: "warwoodHaft", group: "haft" },
  );
  b.sweep(
    [
      [0, 0.29, 0.002],
      [0, 0.62, 0.002],
      [0, 0.98, 0.002],
      [0, 1.115, 0.002],
    ],
    0.061,
    { bone: root, section: { ngon: 8 }, color: GRIP, caps: "flat", name: "leatherGrip", group: "haft" },
  );

  // Leather wrap ridges and brass bindings break up the long silhouette.
  for (const [i, y] of [0.31, 0.42, 0.53, 0.64, 0.75, 0.86, 0.97].entries()) {
    b.part(new THREE.CylinderGeometry(0.069, 0.069, 0.018, 8), i % 2 ? VIOLET : ICE_DEEP, {
      bone: root,
      at: [0, y, 0],
      flat: true,
      name: `gripWrap${i}`,
      group: "wraps",
    });
  }
  for (const [i, y] of [0.18, 1.04].entries()) {
    b.part(new THREE.CylinderGeometry(0.078, 0.078, 0.045, 8), BRASS, {
      bone: root,
      at: [0, y, 0],
      flat: true,
      name: `haftCollar${i}`,
      group: "fittings",
    });
  }
  b.part(new THREE.IcosahedronGeometry(0.09, 1), DARK, {
    bone: root,
    at: [0, 0.10, 0],
    scale: [0.8, 1.1, 0.8],
    flat: true,
    name: "pommel",
    group: "fittings",
  });
  glow(
    b.part(new THREE.IcosahedronGeometry(0.047, 0), ICE_DEEP, {
      bone: root,
      at: [0, 0.103, 0.058],
      flat: true,
      name: "pommelGem",
      group: "magic",
    }),
    1.15,
  );

  // Heavy hexagonal socket where the haft enters the axe head.
  b.part(new THREE.CylinderGeometry(0.13, 0.105, 0.23, 8), IRON, {
    bone: root,
    at: [0, 1.13, 0],
    dir: [1, 0, 0],
    axis: "y",
    flat: true,
    name: "axeSocket",
    group: "head",
  });
  b.part(new THREE.CylinderGeometry(0.145, 0.145, 0.19, 8), DARK, {
    bone: root,
    at: [0, 1.13, 0.012],
    dir: [1, 0, 0],
    axis: "y",
    flat: true,
    name: "socketBand",
    group: "head",
  });

  // The broad hooked blade is drawn as a beveled silhouette, with a separate icy cutting edge.
  const blade = b.extrude(
    [
      [-0.095, -0.19],
      [0.14, -0.23],
      [0.38, -0.16],
      [0.56, -0.03],
      [0.64, 0.11],
      [0.61, 0.25],
      [0.49, 0.39],
      [0.30, 0.50],
      [0.08, 0.53],
      [-0.10, 0.40],
      [-0.16, 0.20],
    ],
    {
      at: [0, 1.13, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.105,
      bevel: 0.018,
      smoothing: 1,
      color: IRON,
      bone: root,
      name: "glacierBlade",
      group: "blade",
    },
  );
  const edge = b.extrude(
    [
      [0.02, -0.13],
      [0.18, -0.17],
      [0.40, -0.10],
      [0.57, 0.02],
      [0.62, 0.11],
      [0.54, 0.10],
      [0.36, 0.05],
      [0.18, 0.01],
      [0.02, 0.10],
      [-0.055, 0.20],
      [-0.10, 0.15],
    ],
    {
      at: [0, 1.13, 0.064],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.006,
      smoothing: 1,
      color: EDGE,
      bone: root,
      name: "frostCuttingEdge",
      group: "blade",
    },
  );

  // A raised central ridge gives the blade a readable painted-game highlight.
  b.extrude(
    [
      [-0.04, 0.02],
      [0.08, 0.13],
      [0.31, 0.38],
      [0.39, 0.42],
      [0.30, 0.24],
      [0.10, 0.00],
    ],
    {
      at: [0, 1.13, 0.06],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.02,
      bevel: 0.004,
      color: ICE_DEEP,
      bone: root,
      name: "bladeRidge",
      group: "blade",
    },
  );

  // Frost runes sit on the front face and are self-lit rather than painted onto the metal.
  const runes = svg(
    `<svg viewBox="0 0 128 72" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#d9ffff" stroke-width="5" stroke-linecap="square" stroke-linejoin="miter">
        <path d="M12 58 L28 14 L44 58 M18 42 H38"/>
        <path d="M57 14 L76 14 L57 36 L76 58 L57 58"/>
        <path d="M96 14 H116 L96 36 H114 L96 58 H118"/>
      </g>
      <path d="M4 66 H124" stroke="#4ba6cf" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.42, 0.235), "#ffffff", {
      bone: root,
      at: [0.30, 1.285, 0.123],
      dir: [0, 0, 1],
      axis: "z",
      texture: runes,
      name: "frostRunes",
      group: "magic",
    }),
    1.4,
  );

  // Back counterweight and three crystalline crown shards make the silhouette asymmetrical and dynamic.
  b.spike([-0.10, 1.13, 0], [-0.43, 1.13, 0], null, 0.075, {
    bone: root,
    color: DARK,
    section: { ngon: 6 },
    name: "counterweightSpike",
    group: "head",
  });
  b.spike([-0.37, 1.13, 0], [-0.51, 1.13, 0], null, 0.036, {
    bone: root,
    color: ICE_DEEP,
    section: { ngon: 6 },
    name: "counterweightFrostTip",
    group: "magic",
  });
  for (const [i, x, y, z, tip] of [
    [0, 0.18, 1.54, 0.04, [0.23, 1.70, 0.04]],
    [1, 0.38, 1.48, 0.035, [0.43, 1.60, 0.03]],
    [2, 0.51, 1.35, 0.03, [0.59, 1.44, 0.02]],
  ] as const) {
    glow(
      b.spike([x, y, z], tip, null, 0.034 - i * 0.004, {
        bone: root,
        color: ICE,
        section: { ngon: 5 },
        name: `crownShard${i}`,
        group: "magic",
      }),
      1.2,
    );
  }

  // Faceted rivets and a socket crystal provide close-up detail without softening the low-poly silhouette.
  for (const [i, x, y, z] of [
    [0, 0.16, 1.48, 0.092],
    [1, 0.36, 1.42, 0.095],
    [2, 0.50, 1.29, 0.092],
    [3, -0.06, 1.29, 0.096],
  ] as const) {
    glow(
      b.part(new THREE.IcosahedronGeometry(0.027, 0), i === 3 ? ICE_BRIGHT : ICE, {
        bone: root,
        at: [x, y, z],
        flat: true,
        name: `bladeRivet${i}`,
        group: "magic",
      }),
      0.9,
    );
  }
  glow(
    b.part(new THREE.IcosahedronGeometry(0.075, 1), ICE_BRIGHT, {
      bone: root,
      at: [0.01, 1.13, 0.16],
      scale: [0.7, 1.15, 0.55],
      flat: true,
      name: "socketCrystal",
      group: "magic",
    }),
    1.5,
  );

  // Small brass rivets on the socket and a violet guard flare complete the hand-painted accents.
  for (const [i, x] of [-0.075, 0.075].entries()) {
    b.part(new THREE.SphereGeometry(0.018, 6, 4), BRASS, {
      bone: root,
      at: [x, 1.13, 0.13],
      flat: true,
      name: `socketRivet${i}`,
      group: "fittings",
    });
  }
  b.part(new THREE.TorusGeometry(0.13, 0.012, 5, 8), VIOLET, {
    bone: root,
    at: [0, 1.13, 0.115],
    rotation: [0, 0, 0],
    name: "socketHalo",
    group: "magic",
  });

  // Keep these handles live through the build so the sculpt has named anchor parts in reports.
  void blade;
  void edge;
  return b.root;
}
