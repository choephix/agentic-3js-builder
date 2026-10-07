import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { grain, mix, mottle, noise, paint, smoothstep } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Frost-Forged Battle Axe",
  description:
    "A double-bit battle axe of blue frost steel standing on an ice-capped plinth: crescent blades with gold edge trim and inlay, cyan glowing runes and frost spikes, a plum leather grip and a glowing crystal tassel.",
  style: "League of Legends",
  commit: "b816db2",
};

// Palette: deep cobalt and ice-blue steel, gold trim, plum leather, one saturated cyan magic accent.
const COBALT = "#1b4f8a";
const ICE = "#5fc4f0";
const FROST = "#eafbff";
const STEEL = "#26334d";
const SOCKET = "#33425e";
const SOCKET_LIT = "#5a6e90";
const GOLD = "#f2c15a";
const CYAN = "#6ff3ff";
const CRYSTAL = "#bdf1ff";
const LEATHER = "#3a2448";
const LEATHER_LIT = "#5e3d74";
const CORD = "#c9d8e6";
const HAFT_A = "#eef6fc";
const HAFT_B = "#9bbcd3";
const PLINTH_A = "#222c45";
const PLINTH_B = "#3d5a8c";
const ICE_CAP = "#a9ecff";
const ROCK = "#7cc8ea";

// A crescent blade in the x-y plane (x out from the haft, y up), drawn for the +x side and mirrored for -x.
// Horn tips curl back toward the haft; the cutting edge bows out to the belly at (0.33, 1.26).
const BLADE_OUTLINE: OutlinePoint[] = [
  [0.03, 1.52, "sharp"],
  [0.13, 1.47],
  [0.23, 1.39],
  [0.3, 1.31],
  [0.33, 1.26],
  [0.3, 1.21],
  [0.23, 1.13],
  [0.13, 1.07],
  [0.03, 1.02, "sharp"],
  [0.02, 1.2],
];
const BLADE_CENTRE_Y = 1.27;

// Outer cutting edge (upper horn to lower horn), the frost spikes that grow out of it ([outline index, length]),
// and the gold inlay that runs inside it on each face.
const EDGE = BLADE_OUTLINE.slice(0, 9);
const EDGE_SPIKES: ReadonlyArray<readonly [number, number]> = [
  [1, 0.04],
  [2, 0.055],
  [3, 0.07],
  [4, 0.1],
  [5, 0.07],
  [6, 0.055],
  [7, 0.04],
];
const INLAY = EDGE.slice(1, 8).map(([u, v]) => [u * 0.8, BLADE_CENTRE_Y + (v - BLADE_CENTRE_Y) * 0.8] as [number, number]);

const BLADE = paint((p, n) => {
  if (Math.abs(n.z) < 0.6) return STEEL; // bevelled rims and walls
  const u = Math.abs(p.x);
  const body = mix(COBALT, ICE, smoothstep(0.03, 0.2, u));
  const edge = mix(body, FROST, smoothstep(0.24, 0.32, u));
  if (Math.abs(noise(p, 0.12, 11) - 0.5) < 0.014) return COBALT; // frost fracture lines
  return noise(p, 0.035, 7) > 0.66 ? mix(edge, FROST, 0.45) : edge;
});

const SOCKET_PAINT = paint((p, _n, s) => (s[0] < 0.018 || s[0] > 0.137 ? GOLD : mix(SOCKET, SOCKET_LIT, noise(p, 0.025, 3))));

const GRIP = paint((_p, _n, s) => {
  const k = (s[1] + 1100 * s[0]) % 40;
  return k < 15 ? LEATHER : k < 18 ? CORD : LEATHER_LIT;
});

const PLINTH = mottle(PLINTH_A, PLINTH_B, { size: 0.09, seed: 5 });

export default function build() {
  const b = createBuilder({ name: "frostAxe" });
  const axe = b.joint("axe", { at: [0, 0.6, 0] });
  const bone = axe;

  const turned = (y: number, profile: [number, number][], color: Parameters<typeof b.part>[1], segments = 10, group = "haft") =>
    b.lathe(profile, { at: [0, y, 0], axis: [0, 1, 0], segments, color, bone, group });

  // Textures.
  const RUNE_BLADE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128"><g fill="none" stroke="${CYAN}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">` +
      `<path d="M14 4V28M14 4L30 14L14 16M14 28L30 22"/>` +
      `<path d="M10 40L36 60M36 40L10 60"/>` +
      `<path d="M22 72V92M22 78L12 70M22 78L32 70"/>` +
      `<path d="M12 124L32 106L52 124M32 106V124"/>` +
      `<path d="M54 4V124" stroke-width="2"/>` +
      `</g></svg>`,
    { size: 256 },
  );
  const RUNE_STRIP = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 32"><g fill="none" stroke="${CYAN}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">` +
      `<path d="M10 6V26M10 6L20 14L10 16"/>` +
      `<path d="M34 6L42 26L50 6"/>` +
      `<path d="M60 16H76M68 6V26"/>` +
      `<path d="M90 6L104 16L90 26"/>` +
      `<path d="M114 6V26M114 16H122"/>` +
      `</g></svg>`,
    { size: 256 },
  );
  const FERN = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g fill="none" stroke="#effcff" stroke-width="4.5" stroke-linecap="round">` +
      `<path d="M32 62V6M32 16L22 8M32 16L42 8M32 28L18 18M32 28L46 18M32 40L20 32M32 40L44 32M32 52L24 46M32 52L40 46"/>` +
      `</g></svg>`,
    { size: 256 },
  );

  // Plinth: a dark slate block with gold trim, corner posts and an ice cap the axe butt stands on.
  b.part(new THREE.BoxGeometry(0.46, 0.085, 0.34).translate(0, 0.0425, 0), PLINTH, { bone, at: [0, 0, 0], group: "plinth" });
  b.part(new THREE.BoxGeometry(0.47, 0.012, 0.35).translate(0, 0.084, 0), GOLD, { bone, at: [0, 0, 0], group: "plinth" });
  for (const x of [-0.23, 0.23])
    for (const z of [-0.17, 0.17])
      b.part(new THREE.BoxGeometry(0.03, 0.084, 0.03).translate(x, 0.042, z), GOLD, { bone, at: [0, 0, 0], group: "plinth" });
  b.part(new THREE.BoxGeometry(0.4, 0.014, 0.28).translate(0, 0.097, 0), ICE_CAP, { bone, at: [0, 0, 0], group: "plinth" });
  // A glowing summoning circle on the ice cap, round the butt.
  glow(turned(0.1035, [[0.1, 0], [0.12, 0], [0.12, 0.004], [0.1, 0.004]], CYAN, 28, "plinth"));
  glow(
    b.part(new THREE.PlaneGeometry(0.24, 0.06), "#ffffff", {
      bone,
      at: [0, 0.042, 0.1725],
      dir: [0, 0, 1],
      axis: "z",
      texture: RUNE_STRIP,
      group: "plinth",
    }),
  );

  // Ice shards standing on the cap, and chunks lying on the floor.
  for (const [x, y, z] of [
    [0.17, 0.104, 0.08],
    [-0.18, 0.104, -0.06],
    [0.09, 0.104, -0.12],
    [-0.12, 0.104, 0.1],
  ] as const)
    glow(b.spike([x, y, z], [x + 0.02, y + 0.09, z - 0.01], null, 0.016, { color: CYAN, sides: 5, bone, group: "plinth" }));
  for (const [x, r, z, s] of [
    [0.31, 0.05, 0.2, 1],
    [-0.33, 0.04, -0.12, 0.8],
    [0.28, 0.03, -0.22, 0.6],
    [-0.27, 0.035, 0.22, 0.7],
  ] as const)
    b.part(new THREE.IcosahedronGeometry(r * s, 0).scale(1, 0.7, 1).translate(x, r * 0.5, z), ROCK, { bone, at: [0, 0, 0], group: "plinth" });

  // Frost ferns lying on the ice cap.
  const ferns: [[number, number, number], [number, number, number]][] = [
    [[0.13, 0.104, 0.1], [0.8, 0, 0.6]],
    [[-0.15, 0.104, 0.07], [-0.5, 0, 0.9]],
    [[0.05, 0.104, -0.12], [0.2, 0, -1]],
    [[-0.12, 0.104, -0.12], [-1, 0, 0.2]],
  ];
  for (const [at, flow] of ferns) b.cards([frame(at, [0, 1, 0])], FERN, { size: [0.09, 0.2], lean: 90, flow, group: "plinth" });

  // Haft: pale frost birch from the ferrule to the socket.
  turned(0.104, [[0, 0], [0.034, 0], [0.034, 0.02], [0.026, 0.03], [0.026, 0.07], [0.033, 0.08], [0.033, 0.1], [0, 0.1]], GOLD, 10);
  b.rod([0, 0.1, 0], [0, 1.245, 0], [0.024, 0.02], { color: grain(HAFT_A, HAFT_B, { size: 0.03, axis: "y", seed: 2 }), bone, sides: 8, group: "haft" });

  // Leather grip with diagonal cord wraps and gold rings.
  turned(0.268, [[0, 0], [0.034, 0], [0.034, 0.012], [0, 0.012]], GOLD, 12);
  turned(0.28, [[0, 0], [0.031, 0], [0.031, 0.21], [0, 0.21]], GRIP, 12, "grip");
  turned(0.49, [[0, 0], [0.034, 0], [0.034, 0.012], [0, 0.012]], GOLD, 12);
  glow(turned(0.8, [[0, 0], [0.03, 0], [0.03, 0.014], [0, 0.014]], CYAN, 12));

  // Tassel: a leather cord, a gold bead and a hanging glowing crystal.
  b.rod([0, 0.47, 0.034], [0, 0.39, 0.05], 0.0035, { color: LEATHER_LIT, bone, group: "tassel" });
  b.part(new THREE.SphereGeometry(0.008, 6, 4).translate(0, 0.39, 0.05), GOLD, { bone, at: [0, 0, 0], group: "tassel" });
  glow(
    b.part(new THREE.OctahedronGeometry(0.026).scale(1, 1.5, 0.9).translate(0, 0.355, 0.055), CYAN, {
      bone,
      at: [0, 0, 0],
      group: "tassel",
    }),
  );

  // Socket: a faceted drum with gold bands, a glowing gem set in its face, and a crystal finial.
  turned(1.1, [[0, 0], [0.042, 0], [0.05, 0.02], [0.05, 0.13], [0.04, 0.155], [0, 0.155]], SOCKET_PAINT, 8, "head");
  glow(
    b.part(new THREE.OctahedronGeometry(0.028).scale(0.8, 1.3, 0.8).translate(0, 1.18, 0.056), CYAN, {
      bone,
      at: [0, 0, 0],
      group: "head",
    }),
  );
  turned(1.25, [[0, 0], [0.04, 0], [0.04, 0.02], [0, 0.02]], GOLD, 8, "head");
  b.spike([0, 1.265, 0], [0, 1.5, 0], null, 0.03, { color: CRYSTAL, sides: 4, bone, group: "head" });

  // Double-bit blades: a crescent extruded both ways, gold edge trim and inlay, runes and frost spikes.
  for (const s of [1, -1]) {
    const side = s > 0 ? "posX" : "negX";
    b.extrude(BLADE_OUTLINE, {
      at: [0, 0, 0],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.03,
      bevel: 0.008,
      color: BLADE,
      bone,
      group: "head",
      name: `blade.${side}`,
    });
    b.sweep(
      EDGE.map((p) => [s * p[0], p[1], 0]),
      0.011,
      { color: GOLD, sides: 6, bone, group: "head", name: `edge.${side}` },
    );
    for (const z of [1, -1])
      b.sweep(
        INLAY.map((p) => [s * p[0], p[1], z * 0.0145]),
        0.0055,
        { color: GOLD, sides: 5, bone, group: "head", name: `inlay.${side}` },
      );
    for (const [i, len] of EDGE_SPIKES) {
      const [u, v] = BLADE_OUTLINE[i];
      const dx = u;
      const dy = v - BLADE_CENTRE_Y;
      const m = Math.hypot(dx, dy);
      const base: [number, number, number] = [s * u, v, 0];
      const tip: [number, number, number] = [s * (u + (dx / m) * len), v + (dy / m) * len, 0];
      glow(b.spike(base, tip, null, 0.014, { color: CYAN, sides: 5, bone, group: "head" }));
    }
    // Crystal fangs continuing each horn.
    glow(b.spike([s * 0.1, 1.42, 0], [s * 0.04, 1.62, 0], null, 0.02, { color: CRYSTAL, sides: 5, bone, group: "head" }));
    glow(b.spike([s * 0.1, 1.1, 0], [s * 0.05, 0.94, 0], null, 0.02, { color: CRYSTAL, sides: 5, bone, group: "head" }));
    // Gold rivets through the blade.
    for (const y of [1.2, 1.34])
      for (const z of [-0.016, 0.016])
        b.part(new THREE.SphereGeometry(0.0085, 6, 4).translate(s * 0.08, y, z), GOLD, { bone, at: [0, 0, 0], group: "head" });
    // Glowing runes on both faces.
    for (const z of [1, -1])
      glow(
        b.part(new THREE.PlaneGeometry(0.1, 0.2), "#ffffff", {
          bone,
          at: [s * 0.14, 1.27, z * 0.0185],
          dir: [0, 0, z],
          axis: "z",
          texture: RUNE_BLADE,
          group: "head",
        }),
      );
  }

  return b.root;
}
