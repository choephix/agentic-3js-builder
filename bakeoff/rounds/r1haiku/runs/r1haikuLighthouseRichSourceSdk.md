```ts
import * as THREE from "three";
import { createBuilder, grain, mottle, rng, stripes, svg } from "agentic-3js-builder";

export const meta = {
  name: "Lighthouse Diorama",
  description:
    "A red-and-white striped lighthouse with a glowing lantern room, a keeper's cottage, a wooden jetty and rowboat, seagulls and wildflowers on a tiny rocky island in turquoise water, on a round display base.",
};

// Key positions (metres). The tower stands at (TX, TZ), the cottage centre at (CX, CZ).
const TX = 0;
const TZ = -0.1;
const CX = 0.14;
const CZ = 0.12;

const IRON = "#1d1f24";
const WHITE = "#f7f7f2";

export default function lighthouseDiorama() {
  const b = createBuilder({ name: "lighthouse", paintSize: 1024 });
  const random = rng(7);

  // The root joint: everything hangs off the display base.
  b.joint("base", { at: [0, 0, 0] });

  // ---- Display base, water, foam and island -------------------------------------------------------------
  b.lathe(
    [
      [0, 0],
      [0.6, 0],
      [0.64, 0.03],
      [0.64, 0.07],
      [0.6, 0.1],
      [0, 0.1],
    ],
    { color: grain("#7a5232", "#55391f", { size: 0.04, axis: "x", seed: 3 }), at: [0, 0, 0], segments: 24 },
  );

  b.lathe(
    [
      [0, 0.1],
      [0.58, 0.1],
      [0.58, 0.115],
      [0, 0.115],
    ],
    { color: mottle("#3fd0c9", "#22a9b9", { size: 0.18, seed: 4 }), at: [0, 0, 0], segments: 20 },
  );

  // White foam: a thin ring just round the rock, and a paler outer fringe.
  b.lathe(
    [
      [0.33, 0.106],
      [0.41, 0.106],
      [0.41, 0.12],
      [0.33, 0.12],
    ],
    { color: "#ffffff", at: [0, 0, 0], segments: 20 },
  );
  b.lathe(
    [
      [0.41, 0.104],
      [0.47, 0.104],
      [0.46, 0.114],
      [0.41, 0.114],
    ],
    { color: "#e4fbff", at: [0, 0, 0], segments: 20 },
  );

  const island = b.lathe(
    [
      [0, 0.1],
      [0.32, 0.1],
      [0.34, 0.15],
      [0.29, 0.2],
      [0.2, 0.24],
      [0.1, 0.26],
      [0, 0.27],
    ],
    {
      color: mottle("#a3a9b2", "#737a86", { size: 0.1, seed: 9 }),
      at: [0, 0, 0],
      segments: 10,
      smoothing: 1,
    },
  );

  // Boulders on the rock.
  const boulder = mottle("#9aa1ab", "#6c7380", { size: 0.05, seed: 12 });
  b.part(new THREE.DodecahedronGeometry(0.05, 0), boulder, { at: [-0.22, 0.21, 0.14] });
  b.part(new THREE.DodecahedronGeometry(0.035, 0), boulder, { at: [-0.27, 0.19, -0.08] });
  b.part(new THREE.DodecahedronGeometry(0.06, 0), boulder, { at: [-0.12, 0.2, -0.24] });
  b.part(new THREE.DodecahedronGeometry(0.03, 0), boulder, { at: [0.1, 0.2, 0.27] });

  // ---- Lighthouse --------------------------------------------------------------------------------------
  const striped = stripes("#f7f5ef", "#d7262e", { size: 0.14, axis: "y", width: 0.5, seed: 2 });
  b.lathe(
    [
      [0, 0.24],
      [0.08, 0.24],
      [0.07, 0.32],
      [0.06, 0.6],
      [0.055, 0.94],
      [0, 0.94],
    ],
    { color: striped, at: [TX, 0, TZ], segments: 12 },
  );

  // Balcony floor and lantern room.
  b.lathe(
    [
      [0, 0.92],
      [0.125, 0.92],
      [0.125, 0.94],
      [0, 0.94],
    ],
    { color: IRON, at: [TX, 0, TZ], segments: 12 },
  );
  b.lathe(
    [
      [0, 0.94],
      [0.085, 0.94],
      [0.085, 1.1],
      [0, 1.1],
    ],
    { color: "#fff0a8", at: [TX, 0, TZ], segments: 8 },
  );
  for (let k = 0; k < 6; k++) {
    const angle = (k * Math.PI) / 3;
    b.part(new THREE.BoxGeometry(0.008, 0.16, 0.008), IRON, {
      at: [TX + 0.088 * Math.sin(angle), 1.02, TZ + 0.088 * Math.cos(angle)],
    });
  }
  b.lathe(
    [
      [0, 1.1],
      [0.11, 1.1],
      [0.11, 1.12],
      [0.05, 1.19],
      [0, 1.21],
    ],
    { color: "#c22a2a", at: [TX, 0, TZ], segments: 10 },
  );
  b.part(new THREE.SphereGeometry(0.022, 8, 6), "#e8c15a", { at: [TX, 1.23, TZ] });

  // Iron railing: posts around the balcony and a top rail.
  for (let k = 0; k < 14; k++) {
    const angle = (k * Math.PI * 2) / 14;
    b.part(new THREE.BoxGeometry(0.006, 0.05, 0.006), IRON, {
      at: [TX + 0.12 * Math.sin(angle), 0.96, TZ + 0.12 * Math.cos(angle)],
    });
  }
  b.part(new THREE.TorusGeometry(0.12, 0.004, 4, 20), IRON, {
    at: [TX, 0.985, TZ],
    rotation: [90, 0, 0],
  });

  // ---- Keeper's cottage --------------------------------------------------------------------------------
  b.part(new THREE.BoxGeometry(0.18, 0.16, 0.18), "#f3e7cc", { at: [CX, 0.28, CZ] });
  // Gabled roof: a triangle in the z-y plane, pushed along x, so the ridge runs left to right.
  b.extrude(
    [
      [-0.15, 0],
      [0.15, 0],
      [0, 0.12],
    ],
    { color: "#b3402c", at: [CX, 0.36, CZ], thickness: 0.22 },
  );
  // Crooked chimney with a cap.
  b.part(new THREE.BoxGeometry(0.035, 0.14, 0.035), "#8a4a3a", { at: [0.2, 0.44, 0.07], rotation: [0, 0, -12] });
  b.part(new THREE.BoxGeometry(0.048, 0.014, 0.048), "#5c3327", { at: [0.2, 0.52, 0.07], rotation: [0, 0, -12] });

  // Blue door and two windows with window boxes on the front.
  b.part(new THREE.BoxGeometry(0.045, 0.085, 0.008), "#2e6fd1", { at: [CX, 0.2625, 0.218] });
  for (const x of [CX - 0.065, CX + 0.065]) {
    b.part(new THREE.BoxGeometry(0.052, 0.052, 0.006), "#fff8ea", { at: [x, 0.3, 0.2135] });
    b.part(new THREE.BoxGeometry(0.04, 0.04, 0.008), "#ffe27a", { at: [x, 0.3, 0.218] });
    b.part(new THREE.BoxGeometry(0.05, 0.012, 0.02), "#6b4226", { at: [x, 0.262, 0.227] });
    b.part(new THREE.BoxGeometry(0.05, 0.01, 0.018), "#3f7d2e", { at: [x, 0.27, 0.227] });
    b.part(new THREE.SphereGeometry(0.008, 5, 4), "#ff6fa3", { at: [x - 0.015, 0.277, 0.23] });
    b.part(new THREE.SphereGeometry(0.008, 5, 4), "#ffd23f", { at: [x + 0.012, 0.277, 0.23] });
  }

  // Chimney smoke: three soft puffs drifting up.
  b.part(new THREE.SphereGeometry(0.03, 7, 5), "#eef1f4", { at: [0.22, 0.6, 0.05] });
  b.part(new THREE.SphereGeometry(0.04, 7, 5), "#eef1f4", { at: [0.25, 0.69, 0.03] });
  b.part(new THREE.SphereGeometry(0.05, 7, 5), "#e4e8ec", { at: [0.29, 0.8, 0.0] });

  // ---- Jetty and rowboat --------------------------------------------------------------------------------
  b.part(new THREE.BoxGeometry(0.2, 0.02, 0.12), grain("#b9824e", "#8a5a30", { size: 0.03, axis: "x", seed: 5 }), {
    at: [0.3, 0.16, -0.3],
  });
  for (const [x, z] of [
    [0.22, -0.34],
    [0.38, -0.34],
    [0.22, -0.26],
    [0.38, -0.26],
  ]) {
    b.part(new THREE.CylinderGeometry(0.01, 0.012, 0.12, 5), "#4a3320", { at: [x, 0.09, z] });
  }

  const hullAt: [number, number, number] = [0.4, 0.13, -0.14];
  b.extrude(
    [
      [-0.09, -0.035],
      [0.07, -0.035],
      [0.1, 0],
      [0.07, 0.035],
      [-0.09, 0.035],
    ],
    { color: WHITE, at: hullAt, x: [1, 0, 0], y: [0, 0, 1], thickness: 0.05 },
  );
  b.extrude(
    [
      [-0.075, -0.022],
      [0.06, -0.022],
      [0.08, 0],
      [0.06, 0.022],
      [-0.075, 0.022],
    ],
    { color: "#b9854f", at: [0.4, 0.158, -0.14], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.01 },
  );
  b.part(new THREE.BoxGeometry(0.012, 0.02, 0.07), "#d7262e", { at: [0.4, 0.162, -0.14] });
  b.rod([0.33, 0.2, -0.2], [0.47, 0.17, -0.08], 0.005, { color: "#e0c28a" });
  // Mooring rope from the jetty post to the bow.
  b.rod([0.38, 0.16, -0.26], [0.49, 0.15, -0.14], 0.003, { color: "#c9b07a" });

  // ---- Seagulls (flying, so they keep their height) ----------------------------------------------------
  const gull = (name: string, x: number, y: number, z: number) => {
    b.joint(name, { at: [x, y, z] });
    b.capsule([x, y, z - 0.05], [x, y, z + 0.04], 0.02, { color: WHITE, bone: name });
    b.part(new THREE.SphereGeometry(0.022, 8, 6), WHITE, { at: [x, y + 0.012, z + 0.05], bone: name });
    b.part(new THREE.ConeGeometry(0.007, 0.035, 4), "#f2b233", {
      at: [x, y + 0.012, z + 0.082],
      rotation: [90, 0, 0],
      bone: name,
    });
    b.extrude(
      [
        [0, 0.02],
        [0.08, 0.028],
        [0.17, 0],
        [0.08, -0.018],
        [0, -0.02],
      ],
      { color: WHITE, at: [x, y, z], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.006, bone: name },
    );
    b.extrude(
      [
        [0, 0.02],
        [-0.08, 0.028],
        [-0.17, 0],
        [-0.08, -0.018],
        [0, -0.02],
      ],
      { color: WHITE, at: [x, y, z], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.006, bone: name },
    );
  };
  gull("gullA", -0.24, 0.84, 0.12);
  gull("gullB", -0.02, 1.02, -0.36);

  // ---- Grass and wildflowers on the rock --------------------------------------------------------------
  const grassA = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 60">
      <path d="M4 60 Q10 30 2 6 Q18 28 18 60Z" fill="#4f9a3a"/>
      <path d="M14 60 Q16 24 26 4 Q26 30 24 60Z" fill="#6cb84a"/>
      <path d="M24 60 Q30 34 38 14 Q34 36 33 60Z" fill="#3f8a33"/>
    </svg>`,
    { size: 128 },
  );
  const grassB = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 60">
      <path d="M8 60 Q6 36 14 12 Q18 34 20 60Z" fill="#5fae3f"/>
      <path d="M20 60 Q24 30 34 8 Q30 36 28 60Z" fill="#7dc654"/>
    </svg>`,
    { size: 128 },
  );
  const flowerA = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
      <path d="M20 40 L20 22" stroke="#3f8a33" stroke-width="3"/>
      <g fill="#ff7aa8"><circle cx="20" cy="10" r="7"/><circle cx="30" cy="18" r="7"/><circle cx="20" cy="26" r="7"/><circle cx="10" cy="18" r="7"/></g>
      <circle cx="20" cy="18" r="5" fill="#ffd23f"/>
    </svg>`,
    { size: 128 },
  );
  const flowerB = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
      <path d="M20 40 L20 22" stroke="#3f8a33" stroke-width="3"/>
      <g fill="#ffffff"><circle cx="20" cy="10" r="6"/><circle cx="29" cy="17" r="6"/><circle cx="20" cy="25" r="6"/><circle cx="11" cy="17" r="6"/></g>
      <circle cx="20" cy="17" r="4.5" fill="#f2b233"/>
    </svg>`,
    { size: 128 },
  );

  const surface = b.surface(island);
  // Keep plants off the tower, the cottage and the jetty.
  const clear = (p: THREE.Vector3) =>
    Math.hypot(p.x - TX, p.z - TZ) < 0.13 ||
    (Math.abs(p.x - CX) < 0.14 && Math.abs(p.z - CZ) < 0.14) ||
    (p.x > 0.12 && p.z < -0.2);

  const tufts = surface.scatter(170, {
    rng: random,
    minDist: 0.022,
    keepOut: clear,
    filter: (h) => h.n.y > 0.6,
  });
  b.cards(tufts, [grassA, grassB], {
    size: [0.07, 0.09],
    vary: 0.3,
    lean: 18,
    bend: 20,
    cross: true,
    spin: 40,
    rng: random,
  });

  const blooms = surface.scatter(45, {
    rng: rng(21),
    minDist: 0.035,
    keepOut: clear,
    filter: (h) => h.n.y > 0.6,
  });
  b.cards(blooms, [flowerA, flowerB], {
    size: 0.045,
    vary: 0.2,
    lean: 8,
    spin: 60,
    rng: rng(5),
  });

  return b.root;
}
```