```ts
import * as THREE from "three";
import { createBuilder, mix, mottle, noise, paint, rng, smoothstep, stripes } from "agentic-3js-builder";

export const meta = {
  name: "Lighthouse island",
  description: "A striped lighthouse, keeper's cottage and jetty on a tiny rocky island, on a round display base.",
};

// Key positions (meters). The island rock sits on a base disc, water around it, the lighthouse on the back-left.
const CX = -0.12; // lighthouse centre
const CZ = -0.12;
const HX = 0.22; // cottage centre
const HZ = 0.1;

export default function lighthouseDiorama() {
  const b = createBuilder({ name: "lighthouse-island", detail: 1, paintSize: 1024 });

  // Skeleton: a root for the display, and one joint per moving or separable piece.
  b.joint("root", { at: [0, 0, 0] });
  b.joint("island", { parent: "root", at: [0, 0.1, 0] });
  b.joint("lighthouse", { parent: "root", at: [CX, 0.39, CZ] });
  b.joint("cottage", { parent: "root", at: [HX, 0.35, HZ] });
  b.joint("boat", { parent: "root", at: [0.52, 0.17, -0.45] });
  b.joint("gullA", { parent: "root", at: [0.45, 0.95, 0.45] });
  b.joint("gullB", { parent: "root", at: [-0.5, 1.1, 0.35] });

  // ---- Display base, brass band, water and foam -------------------------------------------------
  b.part(new THREE.CylinderGeometry(0.92, 0.92, 0.12, b.segments(32)), "#7a4b2a", {
    at: [0, 0.06, 0],
    bone: "root",
    name: "base",
  });
  b.part(new THREE.CylinderGeometry(0.93, 0.93, 0.025, b.segments(32)), "#d4a53a", {
    at: [0, 0.1, 0],
    bone: "root",
    name: "brass",
  });
  const water = mottle("#3ed6c4", "#27b8c9", { size: 0.25, seed: 2 });
  b.part(new THREE.CylinderGeometry(0.88, 0.88, 0.04, b.segments(40)), water, {
    at: [0, 0.14, 0],
    bone: "root",
    name: "water",
  });
  b.part(new THREE.TorusGeometry(0.63, 0.035, 6, b.segments(36)), "#ffffff", {
    at: [0, 0.165, 0],
    rotation: [90, 0, 0],
    bone: "root",
    name: "foam",
  });
  b.part(new THREE.TorusGeometry(0.76, 0.018, 5, b.segments(36)), "#e8fbff", {
    at: [0, 0.158, 0],
    rotation: [90, 0, 0],
    bone: "root",
    name: "foamOuter",
  });

  // ---- Island rock: a lathe with a grassy top --------------------------------------------------
  const rockPaint = mottle("#8d8a84", "#6f7a6e", { size: 0.3, seed: 4 });
  const island = paint((p, n) => {
    const grass = smoothstep(0.5, 0.85, n.y + (noise(p, 0.12, 2) - 0.5) * 0.5);
    return mix(rockPaint.at(p, n), "#7cb85a", grass);
  });
  const rock = b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.5, 0.02],
      [0.6, 0.07],
      [0.63, 0.15],
      [0.56, 0.22],
      [0.42, 0.27],
      [0.25, 0.3],
      [0.1, 0.31],
      [0, 0.31],
    ],
    { color: island, at: [0, 0.1, 0], bone: "island", segments: 14, name: "rock" },
  );

  // ---- Lighthouse --------------------------------------------------------------------------------
  const tower = stripes("#f7f4ea", "#d62828", { size: 0.12, axis: "y", width: 0.5, seed: 3 });
  b.lathe(
    [
      [0, 0],
      [0.09, 0],
      [0.08, 0.5],
      [0.07, 0.55],
      [0, 0.55],
    ],
    { color: tower, at: [CX, 0.39, CZ], bone: "lighthouse", segments: 16, name: "tower" },
  );
  // Door and a window on the front (+Z) of the tower.
  b.part(new THREE.BoxGeometry(0.035, 0.09, 0.02), "#2b2d42", {
    at: [CX, 0.435, CZ + 0.085],
    bone: "lighthouse",
    name: "towerDoor",
  });
  b.part(new THREE.BoxGeometry(0.025, 0.04, 0.02), "#ffe58a", {
    at: [CX, 0.69, CZ + 0.078],
    bone: "lighthouse",
    name: "towerWindow",
  });
  // Balcony: a black iron disc, posts and a top rail.
  b.lathe(
    [
      [0, 0],
      [0.11, 0],
      [0.11, 0.02],
      [0, 0.02],
    ],
    { color: "#1d1d1f", at: [CX, 0.92, CZ], bone: "lighthouse", segments: 16, name: "balcony" },
  );
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.08, 4), "#1d1d1f", {
      at: [CX + Math.cos(a) * 0.1, 0.98, CZ + Math.sin(a) * 0.1],
      bone: "lighthouse",
      name: "railPost",
    });
  }
  b.part(new THREE.TorusGeometry(0.1, 0.004, 4, 16), "#1d1d1f", {
    at: [CX, 1.02, CZ],
    rotation: [90, 0, 0],
    bone: "lighthouse",
    name: "railTop",
  });
  // Lantern room: warm glass, iron frame, a glowing lamp and a red cap.
  b.lathe(
    [
      [0, 0],
      [0.065, 0],
      [0.065, 0.14],
      [0, 0.14],
    ],
    { color: "#ffe58a", at: [CX, 0.94, CZ], bone: "lighthouse", segments: 10, name: "lantern" },
  );
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.14, 4), "#1d1d1f", {
      at: [CX + Math.cos(a) * 0.068, 1.01, CZ + Math.sin(a) * 0.068],
      bone: "lighthouse",
      name: "lanternBar",
    });
  }
  b.part(new THREE.SphereGeometry(0.045, 10, 8), "#fff6c9", {
    at: [CX, 1.01, CZ],
    bone: "lighthouse",
    name: "lamp",
  });
  b.lathe(
    [
      [0, 0],
      [0.09, 0],
      [0.02, 0.1],
      [0, 0.12],
    ],
    { color: "#c22b2b", at: [CX, 1.08, CZ], bone: "lighthouse", segments: 12, name: "lanternCap" },
  );
  b.part(new THREE.SphereGeometry(0.015, 6, 5), "#1d1d1f", {
    at: [CX, 1.21, CZ],
    bone: "lighthouse",
    name: "finial",
  });

  // ---- Keeper's cottage ----------------------------------------------------------------------------
  b.part(new THREE.BoxGeometry(0.26, 0.2, 0.22), "#f3e6c8", {
    at: [HX, 0.45, HZ],
    bone: "cottage",
    name: "walls",
  });
  b.extrude(
    [
      [-0.18, 0],
      [0.18, 0],
      [0, 0.16],
    ],
    {
      color: "#b5402a",
      at: [HX, 0.55, HZ],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.28,
      bone: "cottage",
      name: "roof",
    },
  );
  b.part(new THREE.BoxGeometry(0.04, 0.16, 0.04), "#8a3b2a", {
    at: [0.3, 0.65, HZ + 0.02],
    rotation: [0, 0, -8],
    bone: "cottage",
    name: "chimney",
  });
  b.part(new THREE.BoxGeometry(0.05, 0.015, 0.05), "#4a2a22", {
    at: [0.3, 0.73, HZ + 0.02],
    rotation: [0, 0, -8],
    bone: "cottage",
    name: "chimneyCap",
  });
  b.part(new THREE.BoxGeometry(0.05, 0.11, 0.012), "#2a5db0", {
    at: [HX + 0.03, 0.405, HZ + 0.115],
    bone: "cottage",
    name: "door",
  });
  b.part(new THREE.BoxGeometry(0.05, 0.05, 0.012), "#ffe58a", {
    at: [HX - 0.08, 0.47, HZ + 0.115],
    bone: "cottage",
    name: "window",
  });
  b.part(new THREE.BoxGeometry(0.06, 0.012, 0.03), "#8a8a84", {
    at: [HX + 0.03, 0.355, HZ + 0.13],
    bone: "cottage",
    name: "step",
  });

  // ---- Jetty and rowboat -----------------------------------------------------------------------------
  const plank = "#8a5a33";
  b.part(new THREE.BoxGeometry(0.24, 0.025, 0.13), "#a46b3e", {
    at: [0.68, 0.2, -0.3],
    bone: "root",
    name: "jettyDeck",
  });
  for (let k = -2; k <= 2; k++)
    b.part(new THREE.BoxGeometry(0.24, 0.006, 0.012), plank, {
      at: [0.68, 0.217, -0.3 + k * 0.026],
      bone: "root",
      name: "plank",
    });
  for (const [x, z] of [
    [0.6, -0.24],
    [0.6, -0.36],
    [0.78, -0.24],
    [0.78, -0.36],
  ])
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 5), "#5b3a22", {
      at: [x, 0.13, z],
      bone: "root",
      name: "post",
    });

  b.extrude(
    [
      [-0.11, 0.05],
      [0.11, 0.05],
      [0.08, -0.01],
      [-0.08, -0.01],
    ],
    {
      color: "#e9663b",
      at: [0.52, 0.165, -0.45],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: [0.06, 0.1],
      bone: "boat",
      name: "hull",
    },
  );
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.08), "#f4efe2", {
    at: [0.52, 0.2, -0.45],
    bone: "boat",
    name: "seat",
  });
  b.rod([0.61, 0.2, -0.45], [0.6, 0.2, -0.36], 0.004, { color: "#8b6b3d", name: "mooring" });

  // ---- Seagulls (in flight, so they keep their height) ---------------------------------------------
  const gull = (joint: string, x: number, y: number, z: number) => {
    b.part(new THREE.SphereGeometry(0.03, 10, 8), "#f7f7f2", {
      at: [x, y, z],
      scale: [1, 0.8, 1.7],
      bone: joint,
      name: "gullBody",
    });
    b.part(new THREE.SphereGeometry(0.018, 8, 6), "#f7f7f2", {
      at: [x, y + 0.015, z + 0.035],
      bone: joint,
      name: "gullHead",
    });
    b.part(new THREE.ConeGeometry(0.008, 0.035, 5), "#f4a300", {
      at: [x, y + 0.012, z + 0.06],
      rotation: [90, 0, 0],
      bone: joint,
      name: "beak",
    });
    for (const s of [1, -1]) {
      b.slab(
        [
          [x + s * 0.015, y + 0.005, z + 0.02],
          [x + s * 0.13, y + 0.035, z],
          [x + s * 0.14, y + 0.04, z - 0.05],
          [x + s * 0.02, y + 0.005, z - 0.05],
        ],
        { color: "#ffffff", thickness: 0.006, bone: joint, name: "wing" },
      );
      b.slab(
        [
          [x + s * 0.13, y + 0.035, z],
          [x + s * 0.14, y + 0.04, z - 0.05],
          [x + s * 0.11, y + 0.038, z - 0.04],
        ],
        { color: "#2b2d42", thickness: 0.007, bone: joint, name: "wingtip" },
      );
    }
  };
  gull("gullA", 0.45, 0.95, 0.45);
  gull("gullB", -0.5, 1.1, 0.35);

  // ---- Grass and wildflowers scattered over the rock top -----------------------------------------------
  const surf = b.surface(rock);
  const keepOut = (p: THREE.Vector3) =>
    Math.hypot(p.x, p.z) > 0.5 ||
    Math.hypot(p.x - CX, p.z - CZ) < 0.16 ||
    (p.x > HX - 0.2 && p.x < HX + 0.22 && p.z > -0.05 && p.z < 0.26) ||
    (p.x > 0.5 && p.z < -0.18 && p.z > -0.42);

  const grassRand = rng(7);
  const GRASS = ["#6aa84f", "#8fc957", "#55923f"];
  const blades = surf.scatter(110, {
    rng: grassRand,
    minDist: 0.035,
    keepOut,
    filter: (h) => h.n.y > 0.55,
  });
  blades.forEach((h, i) => {
    b.spike(h, h, 0.025 + 0.04 * grassRand(), 0.007, { color: GRASS[i % GRASS.length], sides: 4 });
  });

  const heads = ["#ff6b8b", "#fff1a8", "#c77dff", "#ffffff"];
  const flowers = surf.scatter(14, {
    rng: rng(9),
    minDist: 0.08,
    keepOut,
    filter: (h) => h.n.y > 0.8,
  });
  flowers.forEach((h, i) => {
    const top = h.moved([0, 0.05, 0]);
    b.rod(h, top, 0.003, { color: "#2f6b2a", name: "stem" });
    b.part(new THREE.SphereGeometry(0.016, 6, 5), heads[i % heads.length], {
      at: top,
      bone: "island",
      name: "flower",
    });
  });

  return b.root;
}
```