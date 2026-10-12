import * as THREE from "three";
import { createBuilder, catmull } from "../../../../src/index";

export const meta = {
  name: "Flamingo",
  description:
    "A tall greater flamingo standing in shallow water: candy-pink body, coral wings tipped with black flight feathers, an S-curved neck, a pale bent beak with a black tip, pale yellow eyes, and rose legs with knobbly knees and webbed feet.",
};

// Flat palette
const BODY = "#ffb4d6"; // candy pink
const BODY_DEEP = "#ff98c4"; // tail
const COVERT = "#ff8c9c"; // pink-coral coverts
const CORAL = "#ff6a5a"; // coral secondaries
const CORAL_DEEP = "#f0503f"; // deeper coral toward the back of the wing
const BLACK = "#17151b";
const BEAK = "#ffd2e2";
const EYE = "#f7eb8c";
const LEG = "#e8607f";
const WATER = "#9fe7eb";
const RIPPLE = "#f2feff";
const LILY = "#8fd08f";
const REED = "#a2ad6e";
const REED_TIP = "#6f4c34";

// The wings are drawn in the side plane around this centre (model z, y).
const WING_CZ = -0.15;
const WING_CY = 0.91;

const wingPts = (pts: number[][]) =>
  pts.map(([z, y]) => new THREE.Vector2(z - WING_CZ, y - WING_CY));

const WING_OUTLINE = [
  [0.09, 0.96], [0.0, 1.01], [-0.14, 1.02], [-0.26, 0.99], [-0.34, 0.95],
  [-0.41, 0.9], [-0.36, 0.84], [-0.27, 0.8], [-0.16, 0.78], [-0.05, 0.79],
  [0.03, 0.82], [0.09, 0.89],
];
const COVERT_BAND = [
  [0.09, 0.96], [0.0, 1.01], [-0.14, 1.02], [-0.26, 0.99], [-0.31, 0.96],
  [-0.27, 0.935], [-0.18, 0.94], [-0.08, 0.93], [0.02, 0.93], [0.07, 0.94],
];
const REAR_PATCH = [
  [0.0, 0.84], [-0.1, 0.8], [-0.22, 0.79], [-0.33, 0.82], [-0.41, 0.9],
  [-0.34, 0.87], [-0.22, 0.86], [-0.1, 0.86], [0.0, 0.87],
];

// Beak: upper and lower mandibles, each a pink chain with a black tip.
const UPPER = [
  [0, 1.434, 0.25], [0, 1.425, 0.31], [0, 1.398, 0.345],
  [0, 1.358, 0.353], [0, 1.33, 0.33],
];
const LOWER = [
  [0, 1.414, 0.25], [0, 1.408, 0.31], [0, 1.384, 0.338],
  [0, 1.352, 0.343], [0, 1.33, 0.322],
];

// Extrudes a wing-plane shape (shape x = z, shape y = y) outward along -X.
function slab(shape: THREE.Shape, depth: number): THREE.ExtrudeGeometry {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    curveSegments: 8,
  });
  g.rotateY(-Math.PI / 2);
  return g;
}

// A rounded scale feather hanging down from its origin.
function scallop(w: number, h: number) {
  const s = new THREE.Shape();
  s.moveTo(-w, 0);
  s.lineTo(w, 0);
  s.quadraticCurveTo(w * 1.3, -h * 0.5, 0, -h);
  s.quadraticCurveTo(-w * 1.3, -h * 0.5, -w, 0);
  return s;
}

// A long flight feather pointing backward (-x in shape space) from its origin.
function plume(len: number, w: number) {
  const s = new THREE.Shape();
  s.moveTo(0, w);
  s.quadraticCurveTo(-len * 0.55, w * 1.6, -len, 0);
  s.quadraticCurveTo(-len * 0.55, -w * 0.5, 0, -w);
  s.closePath();
  return s;
}

// Flat, webbed three-toed foot lying on y = 0 with its heel at the origin.
function webbedFoot() {
  const s = new THREE.Shape();
  s.moveTo(0, 0.012);
  s.quadraticCurveTo(0.036, 0.004, 0.044, -0.076);
  s.lineTo(0.048, -0.118);
  s.quadraticCurveTo(0.024, -0.088, 0, -0.13);
  s.quadraticCurveTo(-0.024, -0.088, -0.048, -0.118);
  s.lineTo(-0.044, -0.076);
  s.quadraticCurveTo(-0.036, 0.004, 0, 0.012);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.006,
    bevelEnabled: false,
    curveSegments: 6,
  });
  g.rotateX(-Math.PI / 2);
  return g;
}

// Deterministic radial lumps, so a sphere reads as a knobbly joint.
function lumpy(geo: THREE.BufferGeometry, amp: number, phase: number) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const L = Math.hypot(x, y, z) || 1;
    const k =
      1 + amp * Math.sin((x / L) * 7.3 + (y / L) * 5.1 + (z / L) * 6.2 + phase);
    p.setXYZ(i, x * k, y * k, z * k);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

export default function build() {
  const b = createBuilder({ name: "flamingo" });

  // ---- Skeleton ------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.9, 0] });

  const legs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const hip = b.joint(`hip${side}`, {
      at: [0.055 * s, 0.84, -0.01],
      parent: hips,
    });
    const knee = b.joint(`knee${side}`, {
      at: [0.058 * s, 0.52, -0.03],
      parent: hip,
    });
    const ankle = b.joint(`ankle${side}`, {
      at: [0.058 * s, 0.016, 0.01],
      parent: knee,
    });
    return { s, knee, ankle };
  });

  const wings = [1, -1].map((s) =>
    b.joint(s > 0 ? "wingL" : "wingR", {
      at: [0.1 * s, 0.94, -0.15],
      parent: hips,
    }),
  );

  // S-curved neck: forward, back, then forward into the head.
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.96, 0.08],
      [0, 1.06, 0.2],
      [0, 1.16, 0.26],
      [0, 1.25, 0.19],
      [0, 1.33, 0.1],
      [0, 1.39, 0.16],
      [0, 1.43, 0.24],
    ]),
    { role: "neck" },
  );
  b.sweep(neck, 0.034, { color: BODY });

  // Upper and lower mandibles as separate chains, so the mouth can open.
  const upperBeak = b.chain("upperBeak", catmull(UPPER.slice(0, 3)), {
    role: "head",
  });
  b.sweep(upperBeak, 0.017, { color: BEAK });
  b.sweep(catmull(UPPER.slice(2)), 0.0175, { color: BLACK });

  const jaw = b.chain("jaw", catmull(LOWER.slice(0, 3)), { role: "jaw" });
  b.sweep(jaw, 0.011, { color: BEAK });
  b.sweep(catmull(LOWER.slice(2)), 0.0115, { color: BLACK });

  // ---- Body, head and tail --------------------------------------------------
  const bodyGeo = new THREE.SphereGeometry(1, 14, 10);
  bodyGeo.scale(0.125, 0.15, 0.25);
  bodyGeo.rotateX(-0.2); // front lifted slightly
  b.part(bodyGeo, BODY, { at: [0, 0.9, -0.02], bone: hips });

  const breast = new THREE.SphereGeometry(1, 12, 9);
  breast.scale(0.105, 0.115, 0.12);
  b.part(breast, BODY, { at: [0, 0.94, 0.12], bone: hips });

  const tail = new THREE.SphereGeometry(1, 10, 7);
  tail.scale(0.075, 0.042, 0.11);
  tail.rotateX(0.32);
  b.part(tail, BODY_DEEP, { at: [0, 0.93, -0.33], bone: hips });

  b.sweep(
    catmull([
      [0, 1.4, 0.17],
      [0, 1.43, 0.23],
      [0, 1.425, 0.28],
    ]),
    0.05,
    { color: BODY },
  );

  // Pale yellow eyes, each with a dark pupil.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0145, 10, 8), EYE, {
      at: [0.047 * s, 1.43, 0.235],
    });
    b.part(new THREE.SphereGeometry(0.0062, 8, 6), BLACK, {
      at: [0.0595 * s, 1.432, 0.238],
    });
  }

  // ---- Legs and feet -------------------------------------------------------
  for (const { s, knee, ankle } of legs) {
    // Feathered thigh, from inside the body down to the knee.
    b.sweep(
      [
        [0.055 * s, 0.84, -0.01],
        [0.058 * s, 0.52, -0.03],
      ],
      0.024,
      { color: BODY },
    );
    // Knobbly knee.
    b.part(
      lumpy(new THREE.SphereGeometry(0.025, 10, 8), 0.16, s),
      LEG,
      { at: [0.058 * s, 0.52, -0.03], bone: knee },
    );
    // Long bare rose tarsus.
    b.sweep(
      [
        [0.058 * s, 0.52, -0.03],
        [0.058 * s, 0.016, 0.01],
      ],
      0.0105,
      { color: LEG },
    );
    b.part(new THREE.SphereGeometry(0.0125, 8, 6), LEG, {
      at: [0.058 * s, 0.016, 0.01],
      bone: ankle,
    });
    // Webbed foot resting on the water.
    b.part(webbedFoot(), LEG, { at: [0.058 * s, 0, 0.02], bone: ankle });
    // Ripples where the foot meets the water.
    for (const r of [0.055, 0.095]) {
      const ring = new THREE.TorusGeometry(r, 0.0022, 5, 28);
      ring.rotateX(Math.PI / 2);
      b.part(ring, RIPPLE, { at: [0.058 * s, 0.001, 0.03], bone: ankle });
    }
  }

  // ---- Wings ---------------------------------------------------------------
  wings.forEach((bone, i) => {
    const s = i === 0 ? 1 : -1;
    // X position for a layer that is `depth` thick and whose outer face is
    // at `outer`, so each slab sits outside the body on its own side.
    const at = (outer: number, depth: number) =>
      s > 0 ? outer : -(outer - depth);

    // Coral base wing.
    b.part(slab(new THREE.Shape(wingPts(WING_OUTLINE)), 0.018), CORAL, {
      at: [at(0.14, 0.018), WING_CY, WING_CZ],
      bone,
    });
    // Deeper coral toward the back.
    b.part(slab(new THREE.Shape(wingPts(REAR_PATCH)), 0.01), CORAL_DEEP, {
      at: [at(0.1435, 0.01), WING_CY, WING_CZ],
      bone,
    });
    // Pink-coral coverts band.
    b.part(slab(new THREE.Shape(wingPts(COVERT_BAND)), 0.016), COVERT, {
      at: [at(0.144, 0.016), WING_CY, WING_CZ],
      bone,
    });

    // Row of covert scales hanging over the secondaries.
    const row1: number[][] = [
      [0.04, 0.935], [-0.02, 0.922], [-0.08, 0.935],
      [-0.14, 0.922], [-0.2, 0.935], [-0.26, 0.922],
    ];
    for (const [z, y] of row1) {
      b.part(slab(scallop(0.026, 0.05), 0.01), COVERT, {
        at: [at(0.149, 0.01), y, z],
        bone,
      });
    }
    // Second, lower row of coral scales.
    const row2: number[][] = [
      [0.0, 0.872], [-0.06, 0.862], [-0.12, 0.872],
      [-0.18, 0.862], [-0.24, 0.872],
    ];
    for (const [z, y] of row2) {
      b.part(slab(scallop(0.024, 0.05), 0.01), CORAL, {
        at: [at(0.146, 0.01), y, z],
        bone,
      });
    }

    // Black primary flight feathers at the wing tip.
    const primaries: number[][] = [
      [-0.22, 0.955, 0.06],
      [-0.25, 0.93, 0.14],
      [-0.27, 0.905, 0.22],
      [-0.27, 0.88, 0.3],
      [-0.25, 0.855, 0.38],
    ];
    for (const [z, y, tilt] of primaries) {
      const g = new THREE.ExtrudeGeometry(plume(0.16, 0.016), {
        depth: 0.007,
        bevelEnabled: false,
        curveSegments: 6,
      });
      g.rotateZ(tilt); // droop each feather a little more
      g.rotateY(-Math.PI / 2);
      b.part(g, BLACK, { at: [at(0.153, 0.007), y, z], bone });
    }
  });

  // ---- Shallow pond and scenery -------------------------------------------
  // Water surface sits at y = 0; the feet touch it.
  b.part(new THREE.CylinderGeometry(0.9, 0.9, 0.02, 32), WATER, {
    at: [0, -0.01, 0],
    bone: hips,
  });

  const pads: number[][] = [
    [0.42, 0.28, 0.085],
    [-0.5, 0.24, 0.065],
    [0.1, -0.62, 0.07],
  ];
  for (const [x, z, r] of pads) {
    const pad = new THREE.CircleGeometry(r, 16);
    pad.rotateX(-Math.PI / 2);
    b.part(pad, LILY, { at: [x, 0.002, z], bone: hips });
  }

  const reeds: number[][] = [
    [-0.55, -0.4],
    [0.62, -0.3],
    [-0.3, -0.68],
  ];
  for (const [x, z] of reeds) {
    b.sweep(
      catmull([
        [x, -0.02, z],
        [x + 0.008, 0.3, z - 0.004],
        [x + 0.02, 0.6, z - 0.008],
      ]),
      0.0065,
      { color: REED },
    );
    const cattail = new THREE.SphereGeometry(1, 8, 6);
    cattail.scale(0.016, 0.042, 0.016);
    b.part(cattail, REED_TIP, { at: [x + 0.02, 0.62, z - 0.008], bone: hips });
  }

  return b.root;
}
