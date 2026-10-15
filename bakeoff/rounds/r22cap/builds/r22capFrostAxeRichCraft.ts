import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { grain, mix, paint, scales, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Frost-Forged Battle Axe",
  description:
    "Double-bit glacier battle axe on a carved ice plinth: crescent steel-blue blades fading to white edges, glowing cyan runes and crystals, gold trims.",
  style: "League of Legends",
  commit: "88fc1f0",
};

const CYAN = "#5af2ff";
const GOLD = "#e8c36a";
const NAVY = "#1d3a6b";
const LEATHER = "#2b2a55";
const LEATHER2 = "#4b4a9a";

const RUNE = svg(
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#7ff6ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 3 L16 29"/><path d="M16 9 L7 16"/><path d="M16 9 L25 16"/>
    <path d="M16 18 L9 25"/><path d="M16 18 L23 25"/>
  </g></svg>`,
  { size: 128 },
);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "frostAxe" });

  // ---------- plinth ----------
  const plinthOutline: OutlinePoint[] = [
    [0, 0],
    [0.26, 0],
    [0.26, 0.04],
    [0.2, 0.06],
    [0.2, 0.1],
    [0.12, 0.12],
    [0, 0.12],
  ];
  b.lathe(plinthOutline, {
    at: [0, 0, 0],
    segments: 8,
    color: cel(scales("#4a76b0", "#1c3560", { size: 0.07, width: 0.1 })),
  });
  // ice shards around the plinth
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const x = Math.sin(a);
    const z = Math.cos(a);
    const big = i % 2 === 0;
    b.spike([x * 0.2, 0.05, z * 0.2], [x * 0.5, 1, z * 0.5], big ? 0.2 : 0.12, big ? 0.032 : 0.024, "#bff6ff", {
      section: { ngon: 5 },
    });
  }
  glow(b.part(new THREE.RingGeometry(0.2, 0.205, 8), "#5af2ff", { at: [0, 0.121, 0], rotation: [-90, 0, 0] }), 0.8);

  // ---------- pommel ----------
  const pommelOutline: OutlinePoint[] = [
    [0, 0],
    [0.04, 0],
    [0.055, 0.03],
    [0.055, 0.06],
    [0.035, 0.1],
    [0, 0.1],
  ];
  b.lathe(pommelOutline, { at: [0, 0.12, 0], segments: 8, color: cel(GOLD) });
  glow(b.part(new THREE.OctahedronGeometry(0.03), CYAN, { at: [0, 0.17, 0.045], scale: [0.8, 1.3, 0.8] }), 1.2);

  // ---------- haft ----------
  b.rod([0, 0.2, 0], [0, 1.2, 0], 0.026, {
    color: cel(grain("#5a4a8a", "#33295a", { size: 0.012 })),
    sides: 8,
    caps: "flat",
  });
  // grip wraps
  for (let i = 0; i < 14; i++) {
    const y = 0.32 + i * 0.03;
    b.part(new THREE.TorusGeometry(0.028, 0.006, 5, 10), i % 2 ? LEATHER : LEATHER2, {
      at: [0, y, 0],
      rotation: [90, 0, 0],
    });
  }
  // gold grip bands
  for (const y of [0.28, 0.76]) {
    b.part(new THREE.TorusGeometry(0.03, 0.01, 5, 10), GOLD, { at: [0, y, 0], rotation: [90, 0, 0] });
  }
  // frost-mid crystal ring
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    glow(b.spike([Math.sin(a) * 0.03, 0.8, Math.cos(a) * 0.03], [Math.sin(a), 0.7, Math.cos(a)], 0.07, 0.014, CYAN), 1);
  }

  // ---------- collar ----------
  const collarOutline: OutlinePoint[] = [
    [0, 0],
    [0.055, 0],
    [0.068, 0.03],
    [0.068, 0.14],
    [0.055, 0.17],
    [0, 0.17],
  ];
  b.lathe(collarOutline, { at: [0, 0.86, 0], segments: 8, color: cel(NAVY) });
  for (const y of [0.86, 1.03]) {
    b.part(new THREE.TorusGeometry(0.066, 0.008, 5, 12), GOLD, { at: [0, y + 0.002, 0], rotation: [90, 0, 0] });
  }
  for (const s of [1, -1]) {
    glow(b.part(new THREE.OctahedronGeometry(0.04), CYAN, { at: [0, 0.945, s * 0.072], scale: [0.7, 1.4, 0.5] }), 1.4);
    b.part(new THREE.OctahedronGeometry(0.052), GOLD, { at: [0, 0.945, s * 0.066], scale: [0.7, 1.4, 0.4] });
    glow(b.part(new THREE.OctahedronGeometry(0.036), CYAN, { at: [0, 0.945, s * 0.074], scale: [0.7, 1.4, 0.45] }), 1.4);
  }

  // ---------- top crystal spike ----------
  b.rod([0, 1.2, 0], [0, 1.22, 0], 0.03, cel(GOLD), { sides: 8 });
  glow(b.spike([0, 1.2, 0], [0, 1, 0], 0.22, 0.03, "#8ff8ff", { section: { ngon: 6 } }), 1.1);
  for (const s of [1, -1]) {
    glow(b.spike([s * 0.02, 1.2, 0], [s * 0.7, 1, 0], 0.1, 0.016, CYAN, { section: { ngon: 5 } }), 1);
  }

  // ---------- blades ----------
  const bladeOutline = (): OutlinePoint[] => [
    [0.03, 0.98],
    [0.12, 1.04],
    [0.3, 1.12],
    [0.43, 1.21, "sharp"],
    [0.36, 1.04],
    [0.33, 0.93],
    [0.41, 0.75, "sharp"],
    [0.2, 0.84],
    [0.03, 0.9],
  ];
  const bladePaint = cel(
    paint((p, _n) => {
      const a = Math.abs(p.x);
      const frost = smoothstep(0.18, 0.4, a);
      const vein = smoothstep(0.55, 0.9, Math.sin(a * 60 + p.y * 18) * 0.5 + 0.5) * 0.25 * (1 - frost);
      return mix(mix("#2c4f8a", "#6fb4e8", vein), "#e8fbff", frost);
    }),
  );
  for (const s of [1, -1]) {
    b.extrude(bladeOutline(), {
      at: [0, 0, 0],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.03,
      bevel: 0.008,
      smoothing: 1,
      color: bladePaint,
    });
    // gold rim strip along the inner root
    b.extrude(
      [
        [0.02, 0.9],
        [0.2, 0.84],
        [0.2, 0.855],
        [0.02, 0.915],
      ],
      { at: [0, 0, 0], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.036, color: GOLD },
    );
    b.extrude(
      [
        [0.02, 0.965],
        [0.12, 1.025],
        [0.12, 1.045],
        [0.02, 0.985],
      ],
      { at: [0, 0, 0], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.036, color: GOLD },
    );
    // tip crystals
    glow(b.spike([s * 0.4, 1.19, 0], [s * 0.6, 1, 0], 0.1, 0.02, CYAN, { section: { ngon: 5 } }), 1);
    glow(b.spike([s * 0.39, 0.77, 0], [s * 0.5, -1, 0], 0.09, 0.018, CYAN, { section: { ngon: 5 } }), 1);
    // icicles hanging off the cutting edge
    for (const [ex, ey, l] of [
      [0.35, 1.0, 0.07],
      [0.34, 0.9, 0.06],
    ] as const) {
      b.spike([s * ex, ey, 0], [s * 0.7, -0.3, 0], l, 0.012, "#d6faff", { section: { ngon: 4 } });
    }
    // runes both faces
    for (const z of [1, -1]) {
      glow(
        b.part(new THREE.PlaneGeometry(0.12, 0.12), "#ffffff", {
          at: [s * 0.2, 0.965, z * 0.0185],
          dir: [0, 0, z],
          axis: "z",
          texture: RUNE,
        }),
        1.2,
      );
    }
    // rivets on the root
    for (const [rx, ry] of [
      [0.08, 0.93],
      [0.08, 1.0],
      [0.15, 0.89],
    ] as const) {
      for (const z of [1, -1]) {
        b.part(new THREE.SphereGeometry(0.008, 6, 4), GOLD, { at: [s * rx, ry, z * 0.016] });
      }
    }
  }

  return b.root;
}
