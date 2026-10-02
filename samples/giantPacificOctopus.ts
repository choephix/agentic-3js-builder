import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import { countershade, mottle, paint, spots } from "../src/paint";
import { animeEye, cel, INK } from "../kits/toon";
import { glow } from "../kits/glow";

const PLUM = "#7b2cbf";
const PLUM_SHADOW = "#43145f";
const PINK = "#e887c8";
const PINK_SHADOW = "#8e2d83";
const BELLY = "#f7b8dc";
const GOLD = "#f6c453";
const GOLD_SHADOW = "#9b5c22";
const ROCK_DARK = "#282c43";
const ROCK = "#505675";
const ROCK_LIGHT = "#888ca8";
const SUCKER = "#ffe8c4";
const CYAN = "#6bf6ff";
const WEB = "#a84ed0";

const COAT = cel(mottle(PLUM, PINK, { size: 0.24, contrast: 0.7, seed: 19 }), PLUM_SHADOW, {
  threshold: 0.05,
});
const SPOTTED_COAT = cel(spots(COAT, PINK, { size: 0.17, amount: 0.34, rosette: true, seed: 7 }), PINK_SHADOW);
const UNDERCOAT = cel(BELLY, "#a9478a");
const ARM_PAINT = countershade(SPOTTED_COAT, UNDERCOAT, { level: -0.2 });
const ROCK_PAINT = cel(spots(ROCK, ROCK_LIGHT, { size: 0.3, amount: 0.5, seed: 11 }), ROCK_DARK);
const GOLD_PAINT = cel(GOLD, GOLD_SHADOW);
const EYE = animeEye({ iris: "#52efff", irisLight: "#d8ffff", irisDark: "#116aa8", blush: "#ff7aa6", size: 512 });

export const meta = {
  name: "Giant Pacific Octopus",
  description: "A jewel-toned giant Pacific octopus sprawled across a faceted tidepool rock, with eight expressive arms, luminous suckers, and anime eyes.",
  style: "Genshin/anime mix",
  commit: "07503e3",
};

export default function build() {
  const b = createBuilder({ name: "giantPacificOctopus", detail: 1, paintSize: 1024 });
  const root = b.joint("mantleRoot", { at: [0, 0.76, 0], role: "spine" });

  const rock = b.part(new THREE.DodecahedronGeometry(1.92, 1), ROCK_PAINT, {
    bone: root,
    at: [0, 0.17, 0],
    scale: [1.08, 0.09, 0.95],
    flat: true,
    name: "tidepoolRock",
    group: "environment",
  });
  const rockSurface = b.surface(rock);
  for (const [x, z, s] of [
    [-1.15, -0.25, 0.32],
    [1.13, 0.28, 0.27],
    [-0.68, 0.6, 0.23],
    [0.72, -0.68, 0.26],
    [0.18, 0.86, 0.2],
  ] as const) {
    b.part(new THREE.DodecahedronGeometry(1, 0), ROCK_PAINT, {
      bone: root,
      at: [x, 0.23, z],
      scale: [s * 1.3, s * 0.7, s],
      flat: true,
      group: "rockClutter",
    });
  }

  const mantle = b.lathe(
    [
      [0, 0],
      [0.34, 0],
      [0.58, 0.08],
      [0.7, 0.22],
      [0.68, 0.46],
      [0.54, 0.72],
      [0.32, 0.94],
      [0, 1.04],
    ],
    {
      at: [0, 0.36, 0.02],
      bone: root,
      segments: 14,
      smoothing: 1,
      color: SPOTTED_COAT,
      name: "mantle",
      group: "body",
    },
  );
  const mantleSurface = b.surface(mantle);

  const head = b.joint("head", {
    parent: root,
    at: [0, 0.92, 0.39],
    dir: [0, -0.05, 1],
    role: "head",
    group: "face",
  });
  const upperJaw = b.joint("upperJaw", {
    parent: head,
    at: [0, 0.86, 0.62],
    dir: [0, 0, 1],
    role: "jaw",
    group: "face",
  });
  const lowerJaw = b.joint("lowerJaw", {
    parent: head,
    at: [0, 0.79, 0.62],
    dir: [0, 0, 1],
    role: "jaw",
    group: "face",
  });

b.extrude(
    [
      [-0.13, -0.03],
      [0.13, -0.03],
      [0.1, 0.08],
      [0.025, 0.14],
      [-0.025, 0.14],
      [-0.1, 0.08],
    ],
    {
      at: [0, 0.855, 0.6],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.075,
      bevel: 0.012,
      smoothing: 1,
      color: GOLD_PAINT,
      bone: upperJaw,
      name: "upperBeak",
      group: "face",
    },
  );
b.extrude(
    [
      [-0.115, 0.02],
      [0.115, 0.02],
      [0.06, -0.07],
      [0, -0.11, "sharp"],
      [-0.06, -0.07],
    ],
    {
      at: [0, 0.79, 0.6],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.06,
      bevel: 0.01,
      smoothing: 1,
      color: GOLD_PAINT,
      bone: lowerJaw,
      name: "lowerBeak",
      group: "face",
    },
  );
  b.rod([-0.12, 0.832, 0.645], [0.12, 0.832, 0.645], 0.012, {
    color: INK,
    bone: lowerJaw,
    name: "beakMouthLine",
    group: "face",
  });

  for (const s of [1, -1]) {
    const eyeHit = mantleSurface.nearest([s * 0.34, 1.02, 0.43]);
    b.decal(mantle, EYE, {
      at: eyeHit,
      size: [0.2, 0.265],
      mirror: s > 0,
      lift: 0.006,
      name: s > 0 ? "eyeL" : "eyeR",
      group: "face",
    });
  }

  const browPaint = cel(PINK, PINK_SHADOW);
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.24, 1.11, 0.46],
        [s * 0.34, 1.15, 0.5],
        [s * 0.43, 1.11, 0.43],
      ]),
      [0.025, 0.012],
      { bone: head, color: browPaint, caps: "round", name: s > 0 ? "browL" : "browR", group: "face" },
    );
  }

  const tentacleData = [
    [[0.28, 0.47, 0.25], [0.68, 0.3, 0.44], [1.22, 0.22, 0.63], [1.72, 0.18, 0.55], [2.02, 0.17, 0.25]],
    [[0.38, 0.44, 0.1], [0.83, 0.27, 0.08], [1.35, 0.2, -0.02], [1.78, 0.16, -0.3], [2.0, 0.15, -0.65]],
    [[0.4, 0.43, -0.12], [0.72, 0.28, -0.42], [1.02, 0.2, -0.82], [1.2, 0.16, -1.25], [1.12, 0.14, -1.65]],
    [[0.28, 0.44, -0.3], [0.35, 0.27, -0.72], [0.18, 0.2, -1.12], [-0.08, 0.16, -1.5], [-0.42, 0.14, -1.8]],
    [[-0.28, 0.44, -0.3], [-0.35, 0.27, -0.72], [-0.18, 0.2, -1.12], [0.08, 0.16, -1.5], [0.42, 0.14, -1.8]],
    [[-0.4, 0.43, -0.12], [-0.72, 0.28, -0.42], [-1.02, 0.2, -0.82], [-1.2, 0.16, -1.25], [-1.12, 0.14, -1.65]],
    [[-0.38, 0.44, 0.1], [-0.83, 0.27, 0.08], [-1.35, 0.2, -0.02], [-1.78, 0.16, -0.3], [-2.0, 0.15, -0.65]],
    [[-0.28, 0.47, 0.25], [-0.68, 0.3, 0.44], [-1.22, 0.22, 0.63], [-1.72, 0.18, 0.55], [-2.02, 0.17, 0.25]],
  ] as const;
  for (let i = 0; i < tentacleData.length; i++) {
    const path = catmull(tentacleData[i]);
    const chain = b.chain(`arm${i + 1}`, path, {
      parent: root,
      names: [`arm${i + 1}Base`, `arm${i + 1}Mid`, `arm${i + 1}Reach`, `arm${i + 1}Tip`],
      role: "tentacle",
      group: "tentacles",
    });
    const sweep = b.sweep(chain, (t) => 0.15 * (1 - t) + 0.026, {
      color: ARM_PAINT,
      section: "circle",
      sides: 8,
      caps: "round",
      group: "tentacles",
      name: `arm${i + 1}Skin`,
    });
    for (let j = 1; j < 10; j++) {
      const t = j / 10;
      for (const side of [-1, 1]) {
        const hit = sweep.at(t, side * 118, 0.004);
        const sucker = b.stick(new THREE.TorusGeometry(0.043 * (1 - t * 0.45), 0.012, 5, 8), SUCKER, hit, {
          embed: 0.55,
          spin: side * 9,
          group: "suckers",
        });
        if (j === 3 || j === 7) glow(sucker, 1.35);
      }
      if (j === 5 || j === 8) {
        const glowHit = sweep.at(t, 0, 0.008);
        glow(b.stick(new THREE.SphereGeometry(0.027, 7, 5), CYAN, glowHit, { embed: 0.5, group: "bioluminescence" }), 1.8);
      }
    }
  }

  for (let i = 0; i < tentacleData.length; i++) {
    const a = tentacleData[i];
    const next = tentacleData[(i + 1) % tentacleData.length];
    const edgeA = catmull(a.slice(0, 3));
    const edgeB = catmull(next.slice(0, 3));
    b.membrane(edgeA, edgeB, {
      bone: root,
      color: WEB,
      thickness: 0.012,
      rows: 3,
      cols: 5,
      scallop: 0.2,
      group: "armWebbing",
    });
  }

  const mantleBand = b.sweep(
    polyline([
      [0.58, 0.62, 0],
      [0.41, 0.62, 0.41],
      [0, 0.62, 0.58],
      [-0.41, 0.62, 0.41],
      [-0.58, 0.62, 0],
      [-0.41, 0.62, -0.41],
      [0, 0.62, -0.58],
      [0.41, 0.62, -0.41],
      [0.58, 0.62, 0],
    ]),
    0.022,
    { bone: root, color: GOLD_PAINT, caps: "round", group: "ornament", name: "mantleGoldBand" },
  );
  for (const at of [0.12, 0.27, 0.42, 0.57, 0.72, 0.87]) {
    const p = mantleBand.at(at, 0);
    glow(b.stick(new THREE.SphereGeometry(0.035, 7, 5), CYAN, p, { embed: 0.6, group: "ornament" }), 1.5);
  }

  const goldFiligree = paint((_p, n, s) => (n.y > 0.2 && s[0] < 0.6 ? GOLD : GOLD_SHADOW));
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.18, 1.23, 0.18],
        [s * 0.38, 1.28, 0.24],
        [s * 0.47, 1.16, 0.28],
      ]),
      [0.012, 0.004],
      { bone: root, color: goldFiligree, caps: "round", group: "ornament", name: s > 0 ? "filigreeL" : "filigreeR" },
    );
  }

  const rockHits = rockSurface.scatter(15, { rng: rng(31), minDist: 0.18, filter: (h) => h.n.y > 0.45 });
  for (const hit of rockHits) {
    b.stick(new THREE.ConeGeometry(0.035, 0.11, 5), GOLD_PAINT, hit, {
      embed: 0.15,
      group: "rockCrystals",
    });
  }

  // Small luminous freckles keep the broad mantle readable from the top-down camera.
  for (const hit of mantleSurface.scatter(18, {
    rng: rng(44),
    minDist: 0.18,
    filter: (h) => h.n.y > 0.35 && h.at.z < 0.25,
  })) {
    glow(b.stick(new THREE.SphereGeometry(0.022, 7, 5), CYAN, hit, { embed: 0.55, group: "mantleFreckles" }), 1.4);
  }

  return b.root;
}
