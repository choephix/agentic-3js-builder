import * as THREE from "three";
import { type Builder, createBuilder, catmull, bezier, rng, paint, noise, svg } from "../../../../src/index";

export const meta = {
  name: "Bauhaus Songbird",
  description: "A songbird perched on a branch, built from Bauhaus primary-colour geometry.",
};

export const REQUESTS = [
  { id: "eyeL", kind: "add", part: "head", what: "Left eye: concentric black ring, white disc and a small black pupil as a Bauhaus circle, seated on the head surface.", at: [0.06, 0.255, 0.1], normal: [1, 0.2, 0.4], bone: "head", room: [0.05, 0.05, 0.05] },
  { id: "eyeR", kind: "add", part: "head", what: "Right eye mirroring the left: black ring, white disc, pupil.", at: [-0.06, 0.255, 0.1], normal: [-1, 0.2, 0.4], bone: "head", room: [0.05, 0.05, 0.05] },
  { id: "wingStripes", kind: "add", part: "wingL", what: "Three flat bars across each wing in RED, YELLOW and BLACK, like a geometric feather pattern.", at: [0.1, 0.17, -0.02], normal: [1, 0, 0], bone: "chest", room: [0.04, 0.12, 0.2] },
  { id: "breastCircle", kind: "add", part: "body", what: "A large yellow circle emblem with a thin black ring on the breast.", at: [0, 0.14, 0.14], normal: [0, 0, 1], bone: "chest", room: [0.1, 0.1, 0.04] },
  { id: "tailBars", kind: "add", part: "tail", what: "Row of three square tail-end blocks in RED, YELLOW and BLUE.", at: [0, 0.14, -0.28], normal: [0, 1, 0], bone: "tail1", room: [0.1, 0.04, 0.12] },
  { id: "toes", kind: "add", part: "legs", what: "Three forward toes and one back toe per foot as thin yellow rods gripping the branch.", at: [0.035, 0.0, 0.0], normal: [0, -1, 0], bone: "chest", room: [0.08, 0.04, 0.1] },
  { id: "branchKnots", kind: "add", part: "branch", what: "Geometric twigs: two short black rods with a small red disc leaf at each end.", at: [-0.3, 0.02, 0], normal: [0, 1, 0], bone: null, room: [0.2, 0.15, 0.1] },
  { id: "crestBlocks", kind: "add", part: "head", what: "Small stepped crest of 3 stacked blocks in RED, BLACK, YELLOW.", at: [0, 0.32, 0.0], normal: [0, 1, 0], bone: "head", room: [0.06, 0.08, 0.08] },
  { id: "bodyPaint", kind: "texture", part: "body", what: "Bauhaus split: lower belly cream, upper back BLUE with a hard diagonal edge, and a thin black line separating them." },
  { id: "branchPaint", kind: "texture", part: "branch", what: "Dark wood grain with alternating black and brown stripes in bands." },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export const RED = "#d62828";
export const BLUE = "#1d4ea8";
export const YELLOW = "#f5c518";
export const BLACK = "#16161a";
export const CREAM = "#f3ead3";
export const WOOD = "#6b4a2b";

const BODY_PAINT = paint((p, n) => {
  // hard diagonal: height measured against z, so the edge slants front-low to back-high
  const d = p.y - 0.2 - p.z * 0.35 + 0.015;
  if (Math.abs(d) < 0.006) return BLACK;
  if (d < 0) return CREAM;
  const speck = noise(p, 0.02, 3) > 0.8 && n.y > 0.3;
  return speck ? "#3a6ad0" : BLUE;
});

const BRANCH_PAINT = paint((p, _n) => {
  const band = Math.floor((p.x + 2) / 0.07) % 2;
  const streak = noise(new THREE.Vector3(p.x * 0.15, p.y * 6, p.z * 6), 0.03, 7);
  const base = band ? "#2a1c12" : WOOD;
  if (streak > 0.68) return band ? "#16161a" : "#8a6238";
  return base;
});

export default function build() {
  const b = createBuilder({ name: "songbird" });

  // skeleton: perched on branch at y = 0.12 height
  const BY = 0.1; // branch centre height
  const chest = b.joint("chest", { at: [0, 0.2, 0], role: "spine" });
  const tail = b.chain("tail", catmull([[0, 0.2, -0.08], [0, 0.19, -0.2], [0, 0.17, -0.32]]), {
    parent: chest, names: ["tail1", "tail2", "tailTip"], role: "tail",
  });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.27, 0.08], dir: [0, 0.6, 0.5], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.31, 0.12], dir: [0, 0.2, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.285, 0.14], aim: [0, 0.28, 0.22], role: "jaw" });

  // branch
  b.sweep(catmull([[-0.6, 0.06, 0], [-0.2, 0.09, 0], [0.2, 0.1, 0], [0.6, 0.13, 0]]), [0.028, 0.02], {
    color: BRANCH_PAINT, bone: chest, name: "branch", sides: 6,
  });
  b.part(new THREE.CylinderGeometry(0.012, 0.016, 0.16, 5), BRANCH_PAINT, { at: [0.35, 0.2, 0], dir: [0.4, 1, 0], bone: chest, name: "branch" });

  // body: stacked geometric forms
  b.part(new THREE.SphereGeometry(1, 10, 8), BODY_PAINT, { at: [0, 0.2, 0], scale: [0.095, 0.09, 0.15], bone: chest, name: "body" });
  b.part(new THREE.SphereGeometry(1, 10, 8), CREAM, { at: [0, 0.17, 0.05], scale: [0.08, 0.07, 0.11], bone: chest, name: "belly" });
  b.part(new THREE.BoxGeometry(0.1, 0.03, 0.14), BLACK, { at: [0, 0.285, -0.02], bone: chest, name: "saddle" });

  // head
  b.part(new THREE.SphereGeometry(1, 12, 9), YELLOW, { at: [0, 0.31, 0.12], scale: [0.07, 0.07, 0.07], bone: head, name: "head" });
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.02), BLACK, { at: [0, 0.345, 0.17], bone: head, name: "brow" });
  // beak: upper and lower
  b.part(new THREE.ConeGeometry(0.03, 0.09, 4), RED, { at: [0, 0.305, 0.215], dir: [0, 0, 1], bone: head, name: "beakUp" });
  b.part(new THREE.ConeGeometry(0.022, 0.06, 4), RED, { at: [0, 0.285, 0.2], dir: [0, 0, 1], bone: jaw, name: "beakLow" });

  // wings
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.extrude([[0, 0], [0.05, 0.05], [0.2, 0.04], [0.26, -0.02], [0.1, -0.06]], {
      at: [s * 0.088, 0.22, 0.04], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.018, color: RED, bone: chest, name: `wing${side}`,
    });
    b.extrude([[0, 0], [0.12, 0.02], [0.15, -0.04], [0.03, -0.04]], {
      at: [s * 0.098, 0.2, -0.1], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.012, color: BLACK, bone: chest, name: `wingTip${side}`,
    });
  }

  // tail: flat tapering fan
  b.extrude([[-0.03, 0], [0.03, 0], [0.05, -0.16], [-0.05, -0.16]], {
    at: [0, 0.18, -0.13], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.012, color: BLUE, bone: tail.joints[0], name: "tail",
  });
  b.part(new THREE.BoxGeometry(0.1, 0.014, 0.04), YELLOW, { at: [0, 0.172, -0.3], bone: tail.joints[1], name: "tailEnd" });

  // legs
  for (const s of [1, -1]) {
    b.rod([s * 0.035, 0.14, 0.0], [s * 0.035, 0.11, 0.0], 0.006, BLACK, { bone: chest, name: "legs" });
  }

  for (const add of STAGE2) add(b);
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addEyeL(b: Builder) {
  const eyeTex = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#16161a"/>
      <circle cx="50" cy="50" r="36" fill="#f3ead3"/>
      <circle cx="50" cy="50" r="36" fill="none" stroke="#d62828" stroke-width="4"/>
      <circle cx="54" cy="50" r="19" fill="#16161a"/>
      <circle cx="61" cy="43" r="6" fill="#ffffff"/>
      <rect x="2" y="47" width="14" height="6" fill="#16161a"/>
    </svg>`,
    { size: 128 },
  );

  const at = new THREE.Vector3(0.06, 0.255, 0.1);
  const n = new THREE.Vector3(1, 0.2, 0.4).normalize();

  // seat: low black socket disc sunk into the head
  b.part(new THREE.CylinderGeometry(0.03, 0.033, 0.012, 10), BLACK, {
    at: at.clone().addScaledVector(n, -0.004),
    dir: n.toArray() as [number, number, number],
    bone: "head",
    name: "eyeSocketL",
  });

  // the drawn eye, facing outward
  b.part(new THREE.CircleGeometry(0.027, 20), "#ffffff", {
    at: at.clone().addScaledVector(n, 0.004),
    dir: n.toArray() as [number, number, number],
    axis: "z",
    up: [0, 1, 0],
    bone: "head",
    texture: eyeTex,
    name: "eyeFaceL",
  });

  // small raised yellow bezel ring of boxes (Bauhaus squared accent)
  b.part(new THREE.BoxGeometry(0.058, 0.006, 0.006), BLACK, {
    at: at.clone().addScaledVector(n, 0.002).add(new THREE.Vector3(0, 0.036, 0)),
    dir: n.toArray() as [number, number, number],
    bone: "head",
    name: "eyeLidL",
  });

  // eyebrow wedge above the eye
  b.part(new THREE.BoxGeometry(0.012, 0.012, 0.05), RED, {
    at: at.clone().add(new THREE.Vector3(0.008, 0.048, 0.0)),
    rotation: [20, 0, 0],
    bone: "head",
    name: "eyeBrowL",
  });
}
    return addEyeL;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addEyeR(b: Builder) {
  const EYE = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="#16161a"/>
      <circle cx="50" cy="50" r="38" fill="#f3ead3"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke="#f5c518" stroke-width="5"/>
      <circle cx="54" cy="50" r="20" fill="#16161a"/>
      <circle cx="46" cy="42" r="7" fill="#ffffff"/>
      <rect x="10" y="48" width="80" height="4" fill="#d62828" opacity="0"/>
    </svg>`,
    { size: 128 },
  );

  const head = b.surface(b.root);
  const hit = head.nearest([-0.06, 0.255, 0.1]);
  const n = hit.n.clone().normalize();
  const c = hit.at.clone();
  const dir: [number, number, number] = [n.x, n.y, n.z];

  // black socket ring seated on the surface
  b.part(new THREE.CylinderGeometry(0.03, 0.032, 0.008, 12), BLACK, {
    bone: "head",
    at: c.clone().addScaledVector(n, 0.001),
    dir,
    name: "s22eyeRSocket",
  });

  // drawn eye disc facing outward
  b.part(new THREE.CircleGeometry(0.026, 20), "#ffffff", {
    bone: "head",
    at: c.clone().addScaledVector(n, 0.007),
    dir,
    axis: "z",
    up: [0, 1, 0],
    texture: EYE,
    name: "s22eyeRDisc",
  });

  // geometric brow bar above the eye, red accent
  const up = new THREE.Vector3(0, 1, 0);
  b.part(new THREE.BoxGeometry(0.004, 0.008, 0.045), RED, {
    bone: "head",
    at: c.clone().addScaledVector(n, 0.006).addScaledVector(up, 0.036),
    dir: [0, 0, 1],
    name: "s22eyeRBrow",
  });

  // small yellow stud below the eye
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.006, 8), YELLOW, {
    bone: "head",
    at: c.clone().addScaledVector(n, 0.004).addScaledVector(up, -0.036),
    dir,
    name: "s22eyeRStud",
  });
}
    return addEyeR;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addWingStripes(b: Builder) {
  const GREY = "#8a8a90";
  // Wing stripes: three flat bars across each wing, plus feather-edge ticks
  const bars = [RED, YELLOW, BLACK];
  for (const s of [1, -1]) {
    const x = s * 0.1;
    bars.forEach((c, i) => {
      const z = 0.0 - i * 0.07;
      b.part(new THREE.BoxGeometry(0.01, 0.07, 0.035), c, {
        at: [x + s * 0.002, 0.225 - i * 0.002, z],
        bone: "chest",
        name: `wingBar${i}${s > 0 ? "L" : "R"}`,
      });
      // small contrasting dot on each bar
      b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.006, 8), i === 1 ? BLACK : CREAM, {
        at: [x + s * 0.0085, 0.225 - i * 0.002, z],
        dir: [s, 0, 0],
        bone: "chest",
        name: `wingDot${i}${s > 0 ? "L" : "R"}`,
      });
    });
    // shoulder block
    b.part(new THREE.BoxGeometry(0.012, 0.03, 0.03), BLUE, {
      at: [x + s * 0.002, 0.245, 0.03],
      bone: "chest",
      name: `wingShoulder${s > 0 ? "L" : "R"}`,
    });
  }

  // Breast emblem: yellow disc in a black ring, with a red centre and blue ticks
  const at = [0, 0.14, 0.139];
  const face = (r: number, c: string, dz: number, seg = 20) =>
    b.part(new THREE.CylinderGeometry(r, r, 0.006, seg), c, {
      at: [at[0], at[1], at[2] + dz],
      dir: [0, 0, 1],
      bone: "chest",
      name: "breastEmblem",
    });
  face(0.052, BLACK, 0);
  face(0.044, CREAM, 0.002);
  face(0.038, YELLOW, 0.004);
  face(0.016, RED, 0.007, 14);
  // four blue square ticks around the disc
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    b.part(new THREE.BoxGeometry(0.01, 0.01, 0.006), BLUE, {
      at: [Math.cos(a) * 0.027, at[1] + Math.sin(a) * 0.027, at[2] + 0.009],
      bone: "chest",
      name: "breastTick",
    });
  }
}
    return addWingStripes;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addTailBars(b: Builder) {
  const bone = "tail1";
  const colors = [RED, YELLOW, BLUE];
  // Three square blocks in a row across the tail end, resting on the tail fan
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 0.034;
    b.part(new THREE.BoxGeometry(0.03, 0.012, 0.03), colors[i], {
      at: [x, 0.188, -0.265],
      bone,
      name: `tailBlock${i}`,
    });
    // thin black frame beneath each block for the Bauhaus outline
    b.part(new THREE.BoxGeometry(0.034, 0.006, 0.034), BLACK, {
      at: [x, 0.183, -0.265],
      bone,
      name: `tailBlockFrame${i}`,
    });
    // small contrasting disc / dot on each block
    b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.004, 8), colors[(i + 1) % 3], {
      at: [x, 0.196, -0.265],
      bone,
      name: `tailDot${i}`,
    });
  }
  // black rod binding the blocks together
  b.part(new THREE.BoxGeometry(0.11, 0.004, 0.006), BLACK, {
    at: [0, 0.185, -0.29],
    bone,
    name: "tailBinder",
  });
  // two triangular end pennants in primary colours
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.012, 0.03, 3), s > 0 ? RED : BLUE, {
      at: [s * 0.045, 0.186, -0.3],
      dir: [0, 0, -1],
      bone,
      name: `tailPennant${s}`,
    });
  }
}
    return addTailBars;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addToes(b: Builder) {
  const TOE = YELLOW;
  const CLAW = BLACK;
  const SCALE = "#c9a21a";
  // Feet sit at the leg bottoms (y 0.11), gripping the branch (top about y 0.12).
  for (const s of [1, -1]) {
    const x = s * 0.035;
    const fy = 0.112;
    // ankle joint disc
    b.part(new THREE.SphereGeometry(0.01, 6, 4), SCALE, { at: [x, fy + 0.004, 0], bone: "chest", name: "ankle" });
    // foot pad
    b.part(new THREE.BoxGeometry(0.02, 0.008, 0.024), SCALE, { at: [x, fy, 0.004], bone: "chest", name: "pad" });
    // three forward toes fanned slightly, curling down over the branch
    for (let i = -1; i <= 1; i++) {
      const sx = x + i * 0.012;
      const a: [number, number, number] = [x + i * 0.004, fy, 0.012];
      const m: [number, number, number] = [sx, fy - 0.001, 0.04];
      const e: [number, number, number] = [sx + i * 0.003, fy - 0.014, 0.058];
      b.rod(a, m, 0.0045, TOE, { bone: "chest", name: "toe", sides: 5 });
      b.rod(m, e, 0.004, TOE, { bone: "chest", name: "toe", sides: 5 });
      b.part(new THREE.SphereGeometry(0.0048, 5, 4), TOE, { at: m, bone: "chest", name: "knuckle" });
      b.spike(e, [i * 0.1, -0.7, 0.5], 0.014, 0.004, { color: CLAW, bone: "chest", name: "claw" });
    }
    // one back toe (hallux)
    const h1: [number, number, number] = [x, fy, -0.008];
    const h2: [number, number, number] = [x, fy - 0.002, -0.032];
    const h3: [number, number, number] = [x, fy - 0.014, -0.046];
    b.rod(h1, h2, 0.0048, TOE, { bone: "chest", name: "toeBack", sides: 5 });
    b.rod(h2, h3, 0.0042, TOE, { bone: "chest", name: "toeBack", sides: 5 });
    b.part(new THREE.SphereGeometry(0.005, 5, 4), TOE, { at: h2, bone: "chest", name: "knuckle" });
    b.spike(h3, [0, -0.7, -0.6], 0.015, 0.004, { color: CLAW, bone: "chest", name: "claw" });
    // Bauhaus scale bands on the leg
    for (let k = 0; k < 2; k++) {
      b.part(new THREE.CylinderGeometry(0.0075, 0.0075, 0.004, 6), BLACK, {
        at: [x, 0.125 + k * 0.01, 0],
        bone: "chest",
        name: "legBand",
      });
    }
  }
}
    return addToes;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addBranchKnots(b: Builder) {
  const r = rng(26);
  const LEAF = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#d62828" stroke="#16161a" stroke-width="4"/><circle cx="32" cy="32" r="14" fill="#f5c518" stroke="#16161a" stroke-width="3"/><path d="M32 2V62" stroke="#16161a" stroke-width="3"/></svg>`,
    { size: 128 },
  );

  // Geometric twigs on the branch (chest bone, rigid)
  const twigs: { base: [number, number, number]; dir: [number, number, number]; len: number }[] = [
    { base: [-0.3, 0.075, 0], dir: [-0.3, 1, 0.5], len: 0.14 },
    { base: [-0.4, 0.07, 0], dir: [-0.5, 0.8, -0.6], len: 0.12 },
  ];
  for (const t of twigs) {
    const d = new THREE.Vector3(...t.dir).normalize();
    const base = new THREE.Vector3(...t.base);
    const tip = base.clone().addScaledVector(d, t.len);
    b.rod(base, tip, [0.011, 0.007], BLACK, { bone: "chest", name: "s26twig", sides: 5 });
    // small side fork
    const mid = base.clone().addScaledVector(d, t.len * 0.55);
    const side = new THREE.Vector3(d.z, 0.2, -d.x).normalize();
    const fork = mid.clone().addScaledVector(side, 0.06).add(new THREE.Vector3(0, 0.04, 0));
    b.rod(mid, fork, [0.007, 0.005], BLACK, { bone: "chest", name: "s26fork", sides: 5 });
    // leaf discs at each end
    for (const [p, q, sz] of [[tip, d, 0.05], [fork, fork.clone().sub(mid).normalize(), 0.04]] as const) {
      const c = (p as THREE.Vector3).clone().addScaledVector(q as THREE.Vector3, sz * 0.4);
      b.part(new THREE.CircleGeometry(sz / 2, 14), "#ffffff", {
        at: c, dir: [0, 0, 1], axis: "z", bone: "chest", texture: LEAF, name: "s26leaf",
      });
      b.part(new THREE.CircleGeometry(sz / 2, 14), "#ffffff", {
        at: c.clone().add(new THREE.Vector3(0, 0, -0.002)), dir: [0, 0, -1], axis: "z", bone: "chest", texture: LEAF, name: "s26leafB",
      });
      b.part(new THREE.CylinderGeometry(sz / 2, sz / 2, 0.006, 14), RED, {
        at: c.clone().add(new THREE.Vector3(0, 0, -0.001)), dir: [0, 0, 1], bone: "chest", name: "s26leafcore",
      });
    }
    // bud knot at base
    b.part(new THREE.SphereGeometry(0.016, 6, 4), WOOD, { at: base, bone: "chest", name: "s26knot" });
  }
  // knot discs on the branch itself
  for (const x of [-0.12, 0.1, 0.45]) {
    b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.012, 8), BLACK, {
      at: [x, 0.09 + (x + 0.6) * 0.0, 0.0], dir: [1, 0, 0], bone: "chest", name: "s26ring",
    });
  }

  // Stepped crest: three stacked blocks on the head
  const stack: [string, number, number][] = [[RED, 0.05, 0.03], [BLACK, 0.04, 0.026], [YELLOW, 0.03, 0.022]];
  let y = 0.372;
  for (const [col, w, h] of stack) {
    b.part(new THREE.BoxGeometry(w, h, w * 1.5), col, { at: [0, y + h / 2 - 0.004, 0.115], bone: "head", name: "s26crest" });
    y += h - 0.002;
  }
  // tiny red triangle flag on top
  b.part(new THREE.ConeGeometry(0.014, 0.03, 3), RED, { at: [0, y + 0.012, 0.115], bone: "head", name: "s26crestTip" });
  // side cheek discs echoing the crest
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.006, 8), BLUE, {
      at: [s * 0.067, 0.34, 0.09 + r() * 0.0], dir: [s, 0.1, 0.2], bone: "head", name: "s26cheek",
    });
  }
}
    return addBranchKnots;
  })(),
);
