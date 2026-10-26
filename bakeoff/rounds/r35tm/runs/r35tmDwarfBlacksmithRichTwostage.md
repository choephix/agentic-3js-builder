<!-- call: stage1 -->

```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  rng,
  type Builder,
} from "agentic-3js-builder";

export const meta = {
  name: "dwarf blacksmith at an anvil",
  description:
    "A stout Warcraft-inspired dwarf blacksmith with a braided beard, leather apron, heavy boots, hammer, and a broad forge anvil.",
};

export const REQUESTS = [
  {
    id: "helmetCrest",
    kind: "add",
    part: "helmet",
    what: "Add a bold bronze-and-steel helmet crest: a central riveted ridge, two short side fins, and a tiny glowing orange forge rune. Keep the face and beard unobstructed.",
    at: [0, 1.87, 0.02],
    normal: [0, 1, 0],
    bone: "head",
    room: [0.42, 0.16, 0.28],
  },
  {
    id: "shoulderRivets",
    kind: "add",
    part: "shoulderArmor",
    what: "Add eight oversized brass rivets and engraved angular trim along both shoulder guards. Use warm brass, dark iron seams, and a few turquoise patina marks.",
    at: [0, 1.27, 0],
    normal: [0, 1, 0],
    bone: "spine2",
    room: [1.1, 0.35, 0.45],
  },
  {
    id: "apronTools",
    kind: "add",
    part: "apron",
    what: "Add a broad leather tool belt over the apron with three pouches, a brass buckle, hanging tongs, and two short metal files. Keep the center of the apron clear.",
    at: [0, 0.92, 0.29],
    normal: [0, 0, 1],
    bone: "spine1",
    room: [0.8, 0.42, 0.16],
  },
  {
    id: "beardBraids",
    kind: "add",
    part: "beard",
    what: "Add three chunky ginger beard braids with dark leather ties and brass bead caps. The central braid should be longest and end just above the belt.",
    at: [0, 1.36, 0.25],
    normal: [0, 0, 1],
    bone: "head",
    room: [0.55, 0.55, 0.2],
  },
  {
    id: "forgeGlow",
    kind: "add",
    part: "anvilTop",
    what: "Add a handful of tiny orange-hot sparks and a thin ember glow around the anvil face, plus three small glowing runes on the front apron of the anvil.",
    at: [0, 0.55, 0.53],
    normal: [0, 1, 0],
    bone: null,
    room: [0.9, 0.25, 0.55],
  },
  {
    id: "hammerHead",
    kind: "add",
    part: "hammer",
    what: "Decorate the hammer with a dark iron head, a bright steel striking face, a brass collar, and two carved orange forge marks. Keep it chunky and readable.",
    at: [0.39, 0.96, 0.43],
    normal: [0, 0, 1],
    bone: "handR",
    room: [0.42, 0.28, 0.24],
  },
  {
    id: "bootBuckles",
    kind: "add",
    part: "boots",
    what: "Add large square brass buckles, iron toe caps, and two rows of tiny pale studs on each heavy boot.",
    at: [0, 0.13, 0.12],
    normal: [0, 0, 1],
    bone: null,
    room: [0.8, 0.22, 0.7],
  },
  {
    id: "anvilMark",
    kind: "add",
    part: "anvilTop",
    what: "Place a large angular blacksmith guild emblem on the anvil face: a crossed hammer and tongs inside a hexagonal brass outline.",
    at: [0, 0.565, 0.56],
    normal: [0, 1, 0],
    bone: null,
    room: [0.42, 0.03, 0.34],
  },
  {
    id: "skin",
    kind: "texture",
    part: "skin",
    what: "Paint the dwarf's exposed skin in warm ruddy umber with lighter knuckles, nose, ears, and cheek planes. Add subtle cool shadow tones under the brow and beard.",
  },
  {
    id: "tunic",
    kind: "texture",
    part: "tunic",
    what: "Paint the wool tunic deep charcoal blue with broad desaturated red-brown woven bands at the hem and sleeves.",
  },
  {
    id: "apronTexture",
    kind: "texture",
    part: "apron",
    what: "Texture the leather apron with dark chestnut hide, broad worn vertical strokes, pale edge stitching, and a few soot-black heat scars.",
  },
  {
    id: "anvilTexture",
    kind: "texture",
    part: "anvilTop",
    what: "Texture the anvil as battered blue-black iron: bright worn edges, shallow concentric hammer scars on the top plate, and warm orange reflected light near the front.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

const C = {
  skin: "#a96745",
  skinLight: "#d18b61",
  skinDark: "#6d3d35",
  hair: "#8b3d22",
  hairLight: "#c26432",
  beardDark: "#52251c",
  beardTie: "#38211c",
  iron: "#252934",
  ironLight: "#68707c",
  steel: "#b8c4c8",
  brass: "#c58a32",
  brassLight: "#edbd55",
  bronze: "#704322",
  leather: "#5b2d1e",
  leatherLight: "#8b4a2d",
  tunic: "#29344b",
  tunicLight: "#435878",
  clothRed: "#713b38",
  apron: "#6b3927",
  apronEdge: "#a8663d",
  boot: "#241b1b",
  sole: "#111217",
  eye: "#e8c55c",
  pupil: "#18151a",
  ember: "#ff762d",
  emberLight: "#ffd05a",
  anvil: "#30353e",
  anvilTop: "#49515b",
};

function box(
  b: Builder,
  size: [number, number, number],
  color: string,
  at: [number, number, number],
  bone: any,
  name: string,
  rotation?: [number, number, number],
) {
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    bone,
    name,
    rotation,
    flat: true,
  });
}

function sphere(
  b: Builder,
  radius: number,
  color: string,
  at: [number, number, number],
  bone: any,
  name: string,
  scale?: [number, number, number],
) {
  return b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
    at,
    bone,
    name,
    scale,
    flat: true,
  });
}

function cylinder(
  b: Builder,
  radius: number,
  height: number,
  color: string,
  at: [number, number, number],
  dir: [number, number, number],
  bone: any,
  name: string,
  segments = 8,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
    at,
    dir,
    bone,
    name,
    flat: true,
  });
}

function cone(
  b: Builder,
  r0: number,
  r1: number,
  height: number,
  color: string,
  at: [number, number, number],
  dir: [number, number, number],
  bone: any,
  name: string,
) {
  return b.part(new THREE.ConeGeometry(r0, height, 8), color, {
    at,
    dir,
    bone,
    name,
    flat: true,
    scale: [1, 1, r1 / Math.max(r0, 0.001)],
  });
}

function tuft(
  b: Builder,
  at: [number, number, number],
  dir: [number, number, number],
  length: number,
  radius: number,
  color: string,
  bone: any,
  name: string,
) {
  return b.spike(at, dir, length, radius, {
    color,
    bone,
    name,
    caps: { start: "round", end: "point" },
  });
}

export default function build() {
  const b = createBuilder({ name: "dwarf-blacksmith", detail: 1 });

  // ------------------------------------------------------------------------------------------
  // Skeleton first: compact, broad, neutral humanoid rest pose.

  const pelvis = b.joint("pelvis", {
    at: [0, 0.72, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.72, 0],
      [0, 0.98, 0],
      [0, 1.25, 0],
      [0, 1.43, 0],
    ]),
    {
      parent: pelvis,
      names: ["spine1", "spine2", "neck"],
      role: "spine",
    },
  );

  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 1.48, 0.015],
    dir: [0, 0.08, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.38, 0.13],
    dir: [0, -0.08, 1],
    role: "jaw",
    group: "face",
  });

  const hipL = [0.23, 0.68, 0] as [number, number, number];
  const hipR = [-0.23, 0.68, 0] as [number, number, number];

  const legL = b.chain(
    "legL",
    [
      hipL,
      [0.25, 0.42, 0.035],
      [0.22, 0.18, 0.08],
      [0.22, 0.14, 0.19],
    ],
    {
      parent: pelvis,
      names: ["hipL", "kneeL", "ankleL", "footL"],
      role: "leg",
      contact: [0.22, 0, 0.19],
    },
  );

  const legR = b.chain(
    "legR",
    [
      hipR,
      [-0.25, 0.42, 0.035],
      [-0.22, 0.18, 0.08],
      [-0.22, 0.14, 0.19],
    ],
    {
      parent: pelvis,
      names: ["hipR", "kneeR", "ankleR", "footR"],
      role: "leg",
      contact: [-0.22, 0, 0.19],
    },
  );

  const shoulderL = [0.38, 1.28, 0.01] as [number, number, number];
  const shoulderR = [-0.38, 1.28, 0.01] as [number, number, number];

  const armL = b.chain(
    "armL",
    [
      shoulderL,
      [0.53, 1.05, 0.18],
      [0.41, 0.86, 0.39],
      [0.38, 0.79, 0.45],
    ],
    {
      parent: spine.joints[1],
      names: ["shoulderL", "elbowL", "wristL", "handL"],
      role: "arm",
    },
  );

  const armR = b.chain(
    "armR",
    [
      shoulderR,
      [-0.5, 1.05, 0.2],
      [-0.39, 0.87, 0.39],
      [-0.38, 0.79, 0.45],
    ],
    {
      parent: spine.joints[1],
      names: ["shoulderR", "elbowR", "wristR", "handR"],
      role: "arm",
    },
  );

  // ------------------------------------------------------------------------------------------
  // Legs, boots, and body.

  b.sweep(legL, (t) => (t < 0.55 ? 0.115 : 0.09), {
    color: C.tunic,
    section: "box",
    sides: 6,
    name: "legL",
  });
  b.sweep(legR, (t) => (t < 0.55 ? 0.115 : 0.09), {
    color: C.tunic,
    section: "box",
    sides: 6,
    name: "legR",
  });

  box(b, [0.24, 0.18, 0.39], C.boot, [0.22, 0.12, 0.19], legL.tip, "boots");
  box(b, [0.24, 0.18, 0.39], C.boot, [-0.22, 0.12, 0.19], legR.tip, "boots");
  box(b, [0.25, 0.07, 0.27], C.sole, [0.22, 0.035, 0.2], legL.tip, "bootSoles");
  box(b, [0.25, 0.07, 0.27], C.sole, [-0.22, 0.035, 0.2], legR.tip, "bootSoles");

  const torso = b.loft(
    [
      { at: [0, 0.74, 0], w: 0.68, h: 0.46 },
      { at: [0, 1.02, 0.01], w: 0.73, h: 0.55 },
      { at: [0, 1.28, 0], w: 0.82, h: 0.4 },
    ],
    { color: C.tunic, bone: [pelvis, spine], section: "box", name: "tunic" },
  );

  // Broad belt and waist plates.
  b.sweep(
    catmull([
      [0, 0.78, -0.33],
      [0.34, 0.78, 0],
      [0, 0.78, 0.34],
      [-0.34, 0.78, 0],
      [0, 0.78, -0.33],
    ], { closed: true }),
    0.045,
    { color: C.leather, bone: pelvis, name: "belt" },
  );
  box(b, [0.16, 0.15, 0.06], C.brass, [0, 0.78, 0.36], pelvis, "beltBuckle");

  // ------------------------------------------------------------------------------------------
  // Arms and hands.

  b.sweep(armL, (t) => 0.105 - t * 0.025, {
    color: C.tunic,
    section: "box",
    sides: 6,
    name: "sleeveL",
  });
  b.sweep(armR, (t) => 0.105 - t * 0.025, {
    color: C.tunic,
    section: "box",
    sides: 6,
    name: "sleeveR",
  });

  cylinder(b, 0.105, 0.13, C.leather, [0.41, 0.82, 0.4], [0, 1, 0], armL.tip, "cuffL");
  cylinder(b, 0.105, 0.13, C.leather, [-0.41, 0.82, 0.4], [0, 1, 0], armR.tip, "cuffR");

  sphere(b, 0.105, C.skin, [0.38, 0.77, 0.46], armL.tip, "skin");
  sphere(b, 0.105, C.skin, [-0.38, 0.77, 0.46], armR.tip, "skin");

  for (const s of [1, -1]) {
    const hand = s > 0 ? armL.tip : armR.tip;
    const x = s * 0.38;
    for (let i = -1; i <= 1; i++) {
      tuft(
        b,
        [x + i * 0.035, 0.73, 0.53],
        [0, 0.1, 1],
        0.09,
        0.018,
        C.skinLight,
        hand,
        "finger",
      );
    }
  }

  // ------------------------------------------------------------------------------------------
  // Apron, shoulder guards, neck, and head.

  box(b, [0.57, 0.7, 0.07], C.apron, [0, 1.02, 0.34], spine.joints[1], "apron");
  box(b, [0.62, 0.11, 0.075], C.apronEdge, [0, 0.69, 0.35], pelvis, "apronHem");

  for (const s of [1, -1]) {
    const shoulder = s * 0.39;
    sphere(b, 0.19, C.iron, [shoulder, 1.3, 0.02], spine.joints[1], "shoulderArmor", [
      1.15,
      0.7,
      1.05,
    ]);
    box(
      b,
      [0.2, 0.08, 0.27],
      C.ironLight,
      [shoulder, 1.38, 0.07],
      spine.joints[1],
      "shoulderTrim",
      [s * 0.12, 0, s * 0.2],
    );
  }

  cylinder(b, 0.17, 0.19, C.skin, [0, 1.45, 0], [0, 1, 0], spine.tip, "skin");
  sphere(b, 0.285, C.skin, [0, 1.68, 0.035], head, "skin", [1.02, 1.05, 0.92]);

  // Ears.
  for (const s of [1, -1]) {
    sphere(b, 0.105, C.skin, [s * 0.275, 1.7, 0.02], head, "skin");
    sphere(b, 0.06, C.skinLight, [s * 0.285, 1.7, 0.09], head, "earInner");
  }

  // Helmet bowl, rim, and cheek plates.
  sphere(b, 0.31, C.iron, [0, 1.78, 0.015], head, "helmet", [1.03, 0.55, 0.96]);
  cylinder(b, 0.33, 0.08, C.brass, [0, 1.7, 0.015], [0, 1, 0], head, "helmetRim", 10);

  for (const s of [1, -1]) {
    box(b, [0.08, 0.23, 0.15], C.ironLight, [s * 0.25, 1.62, 0.1], head, "cheekPlate");
  }

  // Face: large brow, nose, eyes, and moustache.
  box(b, [0.38, 0.09, 0.1], C.skinDark, [0, 1.73, 0.265], head, "brow");
  sphere(b, 0.075, C.skinLight, [0, 1.62, 0.29], head, "nose");
  for (const s of [1, -1]) {
    sphere(b, 0.046, C.eye, [s * 0.105, 1.69, 0.272], head, "eye");
    sphere(b, 0.023, C.pupil, [s * 0.105, 1.69, 0.307], head, "eyePupil");
    tuft(b, [s * 0.11, 1.745, 0.275], [0, 0.3, 1], 0.09, 0.018, C.hair, head, "browHair");
  }

  // Beard mass and moustache.
  sphere(b, 0.24, C.beardDark, [0, 1.48, 0.2], jaw, "beard", [1.3, 1.18, 0.7]);
  for (const s of [1, -1]) {
    tuft(b, [s * 0.11, 1.57, 0.29], [s * 0.7, -0.18, 1], 0.18, 0.055, C.hair, jaw, "moustache");
    tuft(b, [s * 0.16, 1.43, 0.3], [s * 0.5, -0.8, 1], 0.29, 0.075, C.hair, jaw, "beard");
  }
  tuft(b, [0, 1.48, 0.3], [0, -1, 0.25], 0.37, 0.085, C.hairLight, jaw, "beard");

  // ------------------------------------------------------------------------------------------
  // Anvil and hammer: static prop is kept close enough to read as the blacksmith's station.

  box(b, [0.78, 0.18, 0.46], C.anvilTop, [0, 0.58, 0.53], pelvis, "anvilTop");
  box(b, [0.58, 0.28, 0.34], C.anvil, [0, 0.38, 0.53], pelvis, "anvilBody");
  box(b, [0.76, 0.16, 0.28], C.anvil, [0, 0.22, 0.53], pelvis, "anvilBase");
  box(b, [0.98, 0.08, 0.3], C.anvil, [0, 0.12, 0.53], pelvis, "anvilFoot");

  // Horn projecting toward the viewer.
  cone(b, 0.17, 0.015, 0.34, C.anvilTop, [0, 0.62, 0.88], [0, 0, 1], pelvis, "anvilHorn");

  // Anvil feet.
  for (const s of [1, -1]) {
    box(b, [0.18, 0.13, 0.33], C.anvil, [s * 0.29, 0.07, 0.53], pelvis, "anvilFoot");
  }

  // Hammer handle held above the anvil.
  cylinder(b, 0.035, 0.52, C.leatherLight, [0.38, 1.03, 0.46], [0, -1, 0], armL.tip, "hammer");
  cylinder(b, 0.055, 0.12, C.brass, [0.38, 1.27, 0.46], [0, 1, 0], armL.tip, "hammerCollar");
  box(b, [0.16, 0.18, 0.27], C.iron, [0.38, 1.32, 0.46], armL.tip, "hammer");
  box(b, [0.18, 0.15, 0.12], C.steel, [0.38, 1.32, 0.6], armL.tip, "hammerFace");
  box(b, [0.17, 0.13, 0.08], C.ironLight, [0.38, 1.32, 0.31], armL.tip, "hammerPoll");

  // A few intentionally simple forge coals under the anvil silhouette.
  for (const p of [
    [-0.27, 0.06, 0.42],
    [-0.1, 0.06, 0.38],
    [0.11, 0.06, 0.4],
    [0.27, 0.06, 0.43],
  ] as [number, number, number][]) {
    sphere(b, 0.055, C.ember, p, pelvis, "forgeCoal");
  }

  // Stage 2 extension point.
  for (const add of STAGE2) add(b);
  return b.root;
}
```

<!-- call: texture -->

```ts
// Paints the dwarf's exposed skin with warm umber planes, lighter extremities, and cool beard/brow shadows.
// Paints the tunic with charcoal-blue wool and broad desaturated red-brown woven bands.
// Paints the apron with chestnut leather grain, pale worn edging, and soot-black heat scars.
// Paints the anvil with battered blue-black iron, bright worn top edges, hammer scars, and warm forge reflection.

<<<<<<< SEARCH
  rng,
  type Builder,
} from "agentic-3js-builder";
=======
  rng,
  paint,
  grain,
  noise,
  type Builder,
} from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
const C = {
=======
const C = {
>>>>>>> REPLACE

<<<<<<< SEARCH
  emberLight: "#ffd05a",
  anvil: "#30353e",
  anvilTop: "#49515b",
};

function box(
=======
  emberLight: "#ffd05a",
  anvil: "#30353e",
  anvilTop: "#49515b",
};

// Stage 2 surface paints. These are deliberately shared so the atlas keeps each material's
// pattern coherent across every matching part.
const SKIN_PAINT = paint((p, n) => {
  const cheek = p.z > 0.22 && p.y > 1.42;
  const extremity = p.y < 0.88 || Math.abs(p.x) > 0.25;
  const shadow = n.y < -0.15 || (p.z < 0.02 && p.y > 1.35);
  if (shadow) return "#633a38";
  if (extremity || cheek) return "#c47a55";
  return "#9b5940";
});

const TUNIC_PAINT = paint((p, n) => {
  const band =
    Math.abs(Math.sin((p.y - 0.73) * Math.PI * 8)) > 0.79 ||
    Math.abs(p.y - 0.7) < 0.045;
  const weave = noise(p, 0.055, 41);
  if (band) return weave > 0.52 ? "#864b45" : "#633b42";
  if (n.y < -0.25) return "#20283d";
  return weave > 0.63 ? "#3c4b68" : "#29344b";
});

const APRON_PAINT = paint((p, n) => {
  const verticalGrain = noise(new THREE.Vector3(p.x * 1.8, p.y, p.z), 0.075, 17);
  const scar =
    p.z > 0.31 &&
    verticalGrain > 0.77 &&
    Math.sin(p.x * 52 + p.y * 11) > 0.2;
  if (scar) return "#241a1b";
  if (Math.abs(p.x) > 0.27 || p.y < 0.72) return "#b2784e";
  return verticalGrain > 0.58 ? "#78432d" : "#5b2d1e";
});

const ANVIL_PAINT = paint((p, n) => {
  const top = n.y > 0.45;
  const radial = Math.hypot(p.x, p.z - 0.53);
  const hammerScar =
    top &&
    Math.abs(Math.sin(radial * 105 + Math.sin(p.x * 31) * 0.8)) < 0.08;
  const edge = top && n.y > 0.75 && (Math.abs(p.x) > 0.31 || p.z > 0.72);
  const forgeReflection = p.z > 0.72 && n.z > 0.15;
  if (hammerScar) return "#697681";
  if (edge) return "#a4adb0";
  if (forgeReflection) return "#795044";
  return top ? "#4f5963" : "#252a33";
});

function box(
>>>>>>> REPLACE

<<<<<<< SEARCH
  const torso = b.loft(
    [
      { at: [0, 0.74, 0], w: 0.68, h: 0.46 },
      { at: [0, 1.02, 0.01], w: 0.73, h: 0.55 },
      { at: [0, 1.28, 0], w: 0.82, h: 0.4 },
    ],
    { color: C.tunic, bone: [pelvis, spine], section: "box", name: "tunic" },
  );
=======
  const torso = b.loft(
    [
      { at: [0, 0.74, 0], w: 0.68, h: 0.46 },
      { at: [0, 1.02, 0.01], w: 0.73, h: 0.55 },
      { at: [0, 1.28, 0], w: 0.82, h: 0.4 },
    ],
    { color: TUNIC_PAINT, bone: [pelvis, spine], section: "box", name: "tunic" },
  );
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(b, [0.57, 0.7, 0.07], C.apron, [0, 1.02, 0.34], spine.joints[1], "apron");
=======
  box(b, [0.57, 0.7, 0.07], APRON_PAINT, [0, 1.02, 0.34], spine.joints[1], "apron");
>>>>>>> REPLACE

<<<<<<< SEARCH
  cylinder(b, 0.17, 0.19, C.skin, [0, 1.45, 0], [0, 1, 0], spine.tip, "skin");
  sphere(b, 0.285, C.skin, [0, 1.68, 0.035], head, "skin", [1.02, 1.05, 0.92]);
=======
  cylinder(b, 0.17, 0.19, SKIN_PAINT, [0, 1.45, 0], [0, 1, 0], spine.tip, "skin");
  sphere(b, 0.285, SKIN_PAINT, [0, 1.68, 0.035], head, "skin", [1.02, 1.05, 0.92]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    sphere(b, 0.105, C.skin, [s * 0.275, 1.7, 0.02], head, "skin");
=======
    sphere(b, 0.105, SKIN_PAINT, [s * 0.275, 1.7, 0.02], head, "skin");
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(b, [0.78, 0.18, 0.46], C.anvilTop, [0, 0.58, 0.53], pelvis, "anvilTop");
=======
  box(b, [0.78, 0.18, 0.46], ANVIL_PAINT, [0, 0.58, 0.53], pelvis, "anvilTop");
>>>>>>> REPLACE
```

<!-- call: add1 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addHelmetCrest(b: Builder) {
  const bone = "head";
  const bronze = "#8d5228";
  const bronzeLight = "#c4813b";
  const steel = "#8f9aa5";
  const steelDark = "#39434d";
  const runeOrange = "#ff7426";
  const rivet = "#d7a34a";

  // A low bronze spine follows the helmet crown from brow toward the back.
  b.part(new THREE.BoxGeometry(0.075, 0.12, 0.245), bronze, {
    bone,
    at: [0, 1.895, 0.015],
    name: "s21CrestSpine",
    flat: true,
  });

  // Dark steel inset makes the crest read as layered forged plate rather than a plain block.
  b.part(new THREE.BoxGeometry(0.038, 0.105, 0.218), steelDark, {
    bone,
    at: [0, 1.958, 0.015],
    name: "s21CrestInset",
    flat: true,
  });

  // Bright narrow ridge along the upper edge.
  b.part(new THREE.BoxGeometry(0.026, 0.034, 0.225), steel, {
    bone,
    at: [0, 2.012, 0.015],
    name: "s21CrestRidge",
    flat: true,
  });

  // Pair of swept side fins, mirrored across the helmet.
  const finOutline: [number, number, "sharp"][] = [
    [0, 0],
    [0.105, 0.018, "sharp"],
    [0.145, 0.085, "sharp"],
    [0.07, 0.068, "sharp"],
    [0.018, 0.025, "sharp"],
  ];

  for (const s of [1, -1]) {
    b.extrude(finOutline, {
      bone,
      at: [s * 0.035, 1.887, 0.015],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.026,
      bevel: 0.006,
      color: bronze,
      name: `s21SideFin${s > 0 ? "L" : "R"}`,
    });

    // Steel cap on each fin gives the silhouette a hard, Blizzard-style highlight.
    b.part(new THREE.BoxGeometry(0.075, 0.018, 0.035), steel, {
      bone,
      at: [s * 0.115, 1.962, 0.015],
      rotation: [0, s * 0.18, 0],
      name: `s21FinCap${s > 0 ? "L" : "R"}`,
      flat: true,
    });

    // Two oversized raised rivets on each fin.
    for (const z of [-0.045, 0.055]) {
      b.part(new THREE.SphereGeometry(0.017, 7, 5), rivet, {
        bone,
        at: [s * 0.097, 1.928, z + 0.015],
        name: `s21FinRivet${s > 0 ? "L" : "R"}`,
        flat: true,
      });
    }
  }

  // Three forged studs down the central ridge.
  for (const z of [-0.075, 0.015, 0.105]) {
    b.part(new THREE.SphereGeometry(0.018, 8, 5), rivet, {
      bone,
      at: [0, 2.021, z + 0.015],
      name: "s21CrestRivet",
      flat: true,
    });
  }

  // Small bronze collar at the crest root.
  b.part(new THREE.CylinderGeometry(0.065, 0.072, 0.025, 8), bronzeLight, {
    bone,
    at: [0, 1.855, 0.015],
    name: "s21CrestCollar",
    flat: true,
  });

  // A tiny front-facing glowing forge rune: angular hammer-mark glyph.
  const rune = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M7 7h18v5H19v13h-6V12H7z" fill="#ff8a35"/>
      <path d="M5 22h22v4H5z" fill="#ffd56a"/>
      <path d="M10 5h12v3H10z" fill="#fff0a0"/>
    </svg>`,
    { size: 96 },
  );

  const runePart = b.part(new THREE.PlaneGeometry(0.052, 0.052), runeOrange, {
    bone,
    at: [0, 1.923, 0.151],
    dir: [0, 0.15, 1],
    axis: "z",
    texture: rune,
    name: "s21ForgeRune",
  });
  glow(runePart, 2.2);

  // Tiny orange ember beads flank the rune without obscuring the face.
  for (const s of [1, -1]) {
    const ember = b.part(new THREE.SphereGeometry(0.009, 6, 4), runeOrange, {
      bone,
      at: [s * 0.037, 1.927, 0.151],
      name: `s21RuneEmber${s > 0 ? "L" : "R"}`,
      flat: true,
    });
    glow(ember, 1.6);
  }
}
```

<!-- call: add2 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addShoulderRivets(b: Builder) {
  const PATINA = "#2b9c8d";
  const SEAM = C.iron;
  const BRASS = C.brass;
  const HIGHLIGHT = C.brassLight;

  const shoulderBone = "spine2";

  const rivet = (
    x: number,
    y: number,
    z: number,
    scale = 1,
    name = "s22Rivet",
  ) => {
    b.part(new THREE.SphereGeometry(0.032 * scale, 8, 5), BRASS, {
      at: [x, y, z],
      bone: shoulderBone,
      name,
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.011 * scale, 6, 4), HIGHLIGHT, {
      at: [x - 0.008, y + 0.012, z + 0.019],
      bone: shoulderBone,
      name: `${name}Highlight`,
      flat: true,
    });
  };

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) => {
    b.rod(a, c, radius, {
      color,
      bone: shoulderBone,
      name,
      caps: "round",
      section: { ngon: 6 },
    });
  };

  for (const side of [1, -1]) {
    const sx = (x: number) => side * x;

    // Dark recessed angular engraving beneath the raised brass trim.
    rod(
      [sx(0.235), 1.205, 0.153],
      [sx(0.385), 1.395, 0.158],
      0.017,
      SEAM,
      `s22ShoulderSeam${side}`,
    );
    rod(
      [sx(0.385), 1.395, 0.158],
      [sx(0.555), 1.285, 0.148],
      0.017,
      SEAM,
      `s22ShoulderSeamTop${side}`,
    );
    rod(
      [sx(0.555), 1.285, 0.148],
      [sx(0.465), 1.185, 0.154],
      0.014,
      SEAM,
      `s22ShoulderSeamLower${side}`,
    );

    // Raised, deliberately chunky brass trim follows the same three-sided rune shape.
    rod(
      [sx(0.235), 1.212, 0.174],
      [sx(0.385), 1.382, 0.18],
      0.011,
      BRASS,
      `s22ShoulderTrimA${side}`,
    );
    rod(
      [sx(0.385), 1.382, 0.18],
      [sx(0.545), 1.278, 0.17],
      0.011,
      BRASS,
      `s22ShoulderTrimB${side}`,
    );
    rod(
      [sx(0.545), 1.278, 0.17],
      [sx(0.465), 1.198, 0.172],
      0.009,
      HIGHLIGHT,
      `s22ShoulderTrimC${side}`,
    );

    // Four oversized rivets per pauldron, placed at the corners and the lower return.
    rivet(sx(0.255), 1.225, 0.19, 1.05, `s22RivetOuter${side}`);
    rivet(sx(0.375), 1.365, 0.195, 1.12, `s22RivetUpper${side}`);
    rivet(sx(0.515), 1.285, 0.185, 1.02, `s22RivetTip${side}`);
    rivet(sx(0.445), 1.205, 0.19, 0.92, `s22RivetLower${side}`);

    // Small turquoise patina flecks sit just beside the warm brass, like old forge armor.
    b.part(new THREE.SphereGeometry(0.014, 6, 4), PATINA, {
      at: [sx(0.347), 1.333, 0.191],
      bone: shoulderBone,
      name: `s22PatinaUpper${side}`,
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.011, 6, 4), PATINA, {
      at: [sx(0.492), 1.245, 0.182],
      bone: shoulderBone,
      name: `s22PatinaLower${side}`,
      flat: true,
    });

    // Three tiny dark countersunk marks make the trim feel engraved rather than pasted on.
    for (const [x, y] of [
      [0.305, 1.282],
      [0.418, 1.326],
      [0.48, 1.245],
    ] as [number, number][]) {
      b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.006, 6), SEAM, {
        at: [sx(x), y, 0.198],
        dir: [0, 0, 1],
        bone: shoulderBone,
        name: `s22Engraving${side}`,
        flat: true,
      });
    }
  }
}
```

<!-- call: add3 -->

```ts
import * as THREE from "three";
import { catmull, type Builder } from "agentic-3js-builder";

export function addApronTools(b: Builder) {
  const beltBone = "spine1";

  const beltPath = catmull(
    [
      [0, 0.91, 0.335],
      [0.31, 0.91, 0.18],
      [0.39, 0.91, -0.04],
      [0.27, 0.91, -0.22],
      [0, 0.91, -0.28],
      [-0.27, 0.91, -0.22],
      [-0.39, 0.91, -0.04],
      [-0.31, 0.91, 0.18],
    ],
    { closed: true },
  );

  b.sweep(beltPath, 0.043, {
    color: C.leather,
    bone: beltBone,
    section: { ngon: 6 },
    name: "s23ToolBelt",
  });

  b.sweep(
    catmull([
      [-0.37, 0.95, 0.18],
      [0, 0.95, 0.35],
      [0.37, 0.95, 0.18],
    ]),
    0.012,
    {
      color: C.leatherLight,
      bone: beltBone,
      name: "s23BeltTopStitch",
    },
  );

  b.sweep(
    catmull([
      [-0.35, 0.875, 0.18],
      [0, 0.875, 0.345],
      [0.35, 0.875, 0.18],
    ]),
    0.009,
    {
      color: C.apronEdge,
      bone: beltBone,
      name: "s23BeltBottomStitch",
    },
  );

  // A broad, angular buckle stays over the apron center while the pouches flank it.
  b.part(new THREE.BoxGeometry(0.145, 0.13, 0.026), C.brass, {
    at: [0, 0.91, 0.39],
    bone: beltBone,
    name: "s23BeltBuckle",
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.092, 0.076, 0.032), C.leatherDark ?? C.leather, {
    at: [0, 0.91, 0.408],
    bone: beltBone,
    name: "s23BuckleInset",
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.028, 0.105, 0.039), C.brassLight, {
    at: [0, 0.91, 0.425],
    bone: beltBone,
    name: "s23BuckleTongue",
    flat: true,
  });

  function pouch(x: number, name: string) {
    b.part(new THREE.BoxGeometry(0.18, 0.18, 0.105), C.leather, {
      at: [x, 0.91, 0.355],
      bone: beltBone,
      name,
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.195, 0.028, 0.115), C.leatherLight, {
      at: [x, 1.015, 0.36],
      bone: beltBone,
      name: `${name}Flap`,
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.034, 0.034, 0.022), C.brass, {
      at: [x, 1.0, 0.424],
      bone: beltBone,
      name: `${name}Clasp`,
      flat: true,
    });
    for (const dx of [-0.065, 0.065]) {
      b.part(new THREE.SphereGeometry(0.009, 6, 4), C.brassLight, {
        at: [x + dx, 0.835, 0.411],
        bone: beltBone,
        name: `${name}LowerRivet`,
      });
    }
  }

  pouch(-0.235, "s23PouchL");
  pouch(0.235, "s23PouchR");

  // A narrow rear-side pouch gives the belt a practical, asymmetric silhouette.
  b.part(new THREE.BoxGeometry(0.13, 0.16, 0.09), C.leather, {
    at: [0.34, 0.91, 0.06],
    bone: beltBone,
    name: "s23SidePouch",
    flat: true,
  });
  b.part(new THREE.BoxGeometry(0.145, 0.025, 0.1), C.leatherLight, {
    at: [0.34, 1.008, 0.07],
    bone: beltBone,
    name: "s23SidePouchFlap",
    flat: true,
  });
  b.part(new THREE.SphereGeometry(0.018, 7, 5), C.brass, {
    at: [0.34, 0.998, 0.125],
    bone: beltBone,
    name: "s23SidePouchStud",
  });

  // Tongs hang from the dwarf's left side. Two jaws are deliberately separated.
  const tongA: [number, number, number] = [-0.31, 0.86, 0.35];
  const tongB: [number, number, number] = [-0.38, 0.55, 0.39];
  b.rod(tongA, tongB, 0.014, {
    color: C.ironLight,
    bone: beltBone,
    name: "s23TongsHandleA",
  });
  b.rod([-0.275, 0.86, 0.35], [-0.315, 0.55, 0.4], 0.014, {
    color: C.ironLight,
    bone: beltBone,
    name: "s23TongsHandleB",
  });
  b.rod(tongB, [-0.43, 0.43, 0.43], 0.018, {
    color: C.iron,
    bone: beltBone,
    name: "s23TongsJawA",
  });
  b.rod([-0.315, 0.55, 0.4], [-0.285, 0.43, 0.44], 0.018, {
    color: C.iron,
    bone: beltBone,
    name: "s23TongsJawB",
  });
  b.part(new THREE.SphereGeometry(0.027, 8, 5), C.brass, {
    at: [-0.347, 0.555, 0.395],
    bone: beltBone,
    name: "s23TongsPivot",
  });
  b.part(new THREE.TorusGeometry(0.032, 0.009, 6, 10), C.brassLight, {
    at: [-0.305, 0.86, 0.35],
    bone: beltBone,
    rotation: [Math.PI / 2, 0, 0],
    name: "s23TongsHanger",
  });

  // Two short files hang on the opposite side, each with a visible handle and metal blade.
  function file(x: number, z: number, lean: number, name: string) {
    const top: [number, number, number] = [x, 0.86, z];
    const bottom: [number, number, number] = [
      x + lean * 0.045,
      0.57,
      z + 0.015,
    ];
    b.rod(top, bottom, 0.013, {
      color: C.ironLight,
      bone: beltBone,
      name: `${name}Blade`,
    });
    b.part(new THREE.CylinderGeometry(0.026, 0.022, 0.09, 7), C.leatherLight, {
      at: [x, 0.895, z],
      bone: beltBone,
      dir: [0, 1, 0],
      name: `${name}Handle`,
      flat: true,
    });
    b.part(new THREE.TorusGeometry(0.028, 0.007, 5, 8), C.brass, {
      at: [x, 0.845, z],
      bone: beltBone,
      rotation: [Math.PI / 2, 0, 0],
      name: `${name}Ring`,
    });
  }

  file(0.29, 0.36, 1, "s23FileA");
  file(0.35, 0.32, -1, "s23FileB");

  // ------------------------------------------------------------------------------------------
  // Three beard braids. Each is its own short articulated chain so the additions remain riggable.

  function makeBraid(
    side: number,
    yEnd: number,
    name: string,
    length: number,
  ) {
    const x = side;
    const path = catmull([
      [x, 1.55, 0.315],
      [x * 1.03, 1.45, 0.345],
      [x * 0.95, 1.31, 0.36],
      [x * 0.9, yEnd, 0.365],
    ]);

    const chain = b.chain(name, path, {
      parent: "head",
      names: [`${name}1`, `${name}2`, `${name}3`, `${name}Tip`],
      role: "digit",
      group: "beardBraids",
    });

    b.sweep(chain, [0.048, 0.039], {
      color: C.hair,
      section: { ngon: 7 },
      bone: chain,
      name: `${name}Mass`,
    });

    // Overlapping lobes create a chunky three-strand rope instead of a smooth hose.
    const knots = b.along(chain, 6, (p: any) => {
      b.part(new THREE.SphereGeometry(0.052, 7, 5), C.hairLight, {
        at: p,
        bone: p.bone,
        scale: [1, 0.72, 0.82],
        name: `${name}BraidLobe`,
        flat: true,
      });
    });

    const endX = x * 0.9;
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.045, 7), C.beardTie, {
      at: [endX, yEnd + 0.025, 0.365],
      bone: chain.tip,
      dir: [0, 1, 0],
      name: `${name}LeatherTie`,
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.034, 7, 5), C.brassLight, {
      at: [endX, yEnd - 0.012, 0.365],
      bone: chain.tip,
      name: `${name}BrassBead`,
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.017, 6, 4), C.brass, {
      at: [endX, yEnd - 0.045, 0.365],
      bone: chain.tip,
      name: `${name}BeadRivet`,
      flat: true,
    });

    return { chain, knots, length };
  }

  makeBraid(0.125, 1.18, "s23BeardBraidL", 0.37);
  makeBraid(-0.125, 1.18, "s23BeardBraidR", 0.37);
  makeBraid(0, 1.04, "s23BeardBraidC", 0.51);

  // Small warm-metal bands near the roots visually separate the braids from the beard mass.
  for (const x of [-0.125, 0, 0.125]) {
    b.part(new THREE.TorusGeometry(0.043, 0.009, 6, 9), C.brass, {
      at: [x, x === 0 ? 1.515 : 1.535, 0.335],
      bone: "head",
      rotation: [Math.PI / 2, 0, 0],
      name: "s23BeardRootRing",
    });
  }
}
```

<!-- call: add4 -->

```ts
import * as THREE from "three";
import {
  catmull,
  rng,
  svg,
  type Builder,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addForgeGlow(b: Builder) {
  const EMBER = "#ff6a24";
  const HOT = "#ffd45a";
  const DEEP = "#7d241b";
  const SPARK = "#fff0a3";

  const bone = "pelvis";
  const random = rng(2407);

  const emberRune = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 88">
      <path d="M32 6 L49 25 L38 42 L52 60 L32 82 L12 60 L26 42 L15 25 Z"
        fill="none" stroke="#ff8b2b" stroke-width="6" stroke-linejoin="round"/>
      <path d="M32 17 L32 70 M21 29 L43 29 M22 57 L42 57"
        fill="none" stroke="#ffd45a" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );

  const emberRuneAlt = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 88">
      <path d="M12 70 Q32 54 32 8 Q32 54 52 70"
        fill="none" stroke="#ff7628" stroke-width="7" stroke-linecap="round"/>
      <path d="M18 45 L46 45 M23 62 L41 62"
        fill="none" stroke="#ffd45a" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );

  const runePositions: [number, number, number][] = [
    [-0.22, 0.51, 0.715],
    [0, 0.51, 0.716],
    [0.22, 0.51, 0.715],
  ];

  for (let i = 0; i < runePositions.length; i++) {
    const [x, y, z] = runePositions[i];
    const rune = b.part(
      new THREE.PlaneGeometry(0.105, 0.14),
      "#ffffff",
      {
        at: [x, y, z],
        bone,
        dir: [0, 0, 1],
        axis: "z",
        texture: i === 1 ? emberRuneAlt : emberRune,
        name: `s24_anvilRune${i + 1}`,
        flat: true,
      },
    );
    glow(rune, 2.4);

    const rivet = b.part(
      new THREE.SphereGeometry(0.014, 6, 4),
      HOT,
      {
        at: [x - 0.057, 0.445, z + 0.006],
        bone,
        name: `s24_runeRivetL${i}`,
        flat: true,
      },
    );
    glow(rivet, 1.7);
    const rivet2 = b.part(
      new THREE.SphereGeometry(0.014, 6, 4),
      HOT,
      {
        at: [x + 0.057, 0.445, z + 0.006],
        bone,
        name: `s24_runeRivetR${i}`,
        flat: true,
      },
    );
    glow(rivet2, 1.7);
  }

  // A thin, angular ember outline hugs the upper anvil plate.
  const rimPath = catmull(
    [
      [-0.37, 0.678, 0.32],
      [0.37, 0.678, 0.32],
      [0.37, 0.678, 0.73],
      [0.2, 0.678, 0.82],
      [-0.2, 0.678, 0.82],
      [-0.37, 0.678, 0.73],
    ],
    { closed: true },
  );
  const rim = b.sweep(rimPath, 0.009, {
    color: EMBER,
    bone,
    sides: 6,
    caps: "round",
    name: "s24_emberRim",
  });
  glow(rim, 2.1);

  // A second broken-hot line gives the top plate a forge-heated edge without obscuring it.
  const hotEdge = b.sweep(
    [
      [-0.31, 0.693, 0.34],
      [-0.1, 0.696, 0.335],
      [0.11, 0.694, 0.34],
      [0.31, 0.693, 0.35],
    ],
    0.006,
    {
      color: HOT,
      bone,
      sides: 6,
      caps: "round",
      name: "s24_hotEdge",
    },
  );
  glow(hotEdge, 2.8);

  // Small stylized sparks rise in a readable fan above the striking face.
  const sparkSeeds = [
    [-0.28, 0.76, 0.54, 0.09, 0.035],
    [-0.17, 0.78, 0.58, 0.13, 0.025],
    [-0.06, 0.77, 0.56, 0.18, 0.031],
    [0.08, 0.76, 0.59, 0.11, 0.022],
    [0.18, 0.78, 0.55, 0.16, 0.028],
    [0.29, 0.76, 0.57, 0.085, 0.02],
    [-0.11, 0.74, 0.67, 0.095, 0.018],
    [0.13, 0.75, 0.67, 0.12, 0.019],
  ] as const;

  for (let i = 0; i < sparkSeeds.length; i++) {
    const [sx, sy, sz, nominalLength, radius] = sparkSeeds;
    const jitterX = (random() - 0.5) * 0.025;
    const jitterZ = (random() - 0.5) * 0.025;
    const length = nominalLength * (0.82 + random() * 0.34);
    const direction: [number, number, number] = [
      (random() - 0.5) * 0.45,
      0.84 + random() * 0.3,
      (random() - 0.5) * 0.28,
    ];

    const spark = b.spike(
      [sx + jitterX, sy, sz + jitterZ],
      direction,
      length,
      radius,
      {
        color: i % 3 === 0 ? SPARK : EMBER,
        bone,
        caps: { start: "round", end: "point" },
        name: `s24_spark${i + 1}`,
        sides: 6,
      },
    );
    glow(spark, i % 3 === 0 ? 3.2 : 2.4);

    if (i < 5) {
      const bead = b.part(
        new THREE.SphereGeometry(radius * 1.35, 6, 4),
        i % 2 === 0 ? HOT : EMBER,
        {
          at: [sx + jitterX, sy, sz + jitterZ],
          bone,
          name: `s24_sparkCore${i + 1}`,
          flat: true,
        },
      );
      glow(bead, 2.7);
    }
  }

  // A few suspended ember motes make the heat read even when the hammer is still.
  const motePositions: [number, number, number][] = [
    [-0.34, 0.91, 0.61],
    [-0.22, 1.02, 0.66],
    [0.03, 0.96, 0.7],
    [0.25, 0.88, 0.64],
    [0.34, 1.08, 0.58],
  ];

  for (let i = 0; i < motePositions.length; i++) {
    const p = motePositions[i];
    const mote = b.part(
      new THREE.OctahedronGeometry(i % 2 ? 0.014 : 0.019, 0),
      i % 2 ? HOT : EMBER,
      {
        at: p,
        bone,
        name: `s24_mote${i + 1}`,
        rotation: [random() * 2, random() * 2, random() * 2],
        flat: true,
      },
    );
    glow(mote, 2.5);
  }

  // Tiny orange reflection blocks along the front lower anvil edge.
  for (let i = 0; i < 7; i++) {
    const x = -0.28 + i * 0.093;
    const reflection = b.part(
      new THREE.BoxGeometry(0.045, 0.012, 0.008),
      i % 2 ? EMBER : HOT,
      {
        at: [x, 0.31 + (i % 3) * 0.006, 0.711],
        bone,
        name: `s24_reflection${i + 1}`,
        flat: true,
      },
    );
    glow(reflection, 1.5);
  }
}
```

<!-- call: add5 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addHammerHead(b: Builder) {
  const bone = "handR";
  const iron = C.iron;
  const ironLight = C.ironLight;
  const steel = C.steel;
  const brass = C.brass;
  const brassLight = C.brassLight;
  const ember = C.ember;
  const emberLight = C.emberLight;

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    name: string,
    rotation?: [number, number, number],
  ) =>
    b.part(geometry, color, {
      bone,
      at,
      name: `s25_${name}`,
      rotation,
      flat: true,
    });

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    name: string,
    rotation?: [number, number, number],
  ) => part(new THREE.BoxGeometry(...size), color, at, name, rotation);

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    name: string,
    dir: [number, number, number] = [0, 1, 0],
    segments = 8,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      bone,
      at,
      dir,
      name: `s25_${name}`,
      flat: true,
    });

  // The supplied room is centred on the lower hammer shaft. Build the decorated
  // head inside that reserved volume, making it read as a second, stylised forge mallet.
  const cx = 0.39;
  const cy = 0.985;
  const cz = 0.43;

  // Dark iron hammer body, with a slightly wider central cheek.
  box([0.27, 0.19, 0.22], iron, [cx, cy, cz], "hammerHead");
  box([0.31, 0.13, 0.18], ironLight, [cx, cy + 0.005, cz], "hammerCheek");
  box([0.25, 0.16, 0.235], iron, [cx, cy, cz + 0.006], "hammerFaceHousing");

  // Bright steel striking face projects toward the viewer (+Z).
  box([0.17, 0.115, 0.055], steel, [cx, cy, cz + 0.142], "strikingFace");
  box([0.19, 0.035, 0.07], ironLight, [cx, cy + 0.073, cz + 0.135], "faceTopRim");
  box([0.19, 0.035, 0.07], ironLight, [cx, cy - 0.073, cz + 0.135], "faceBottomRim");

  // A faceted steel cap and a dark rear poll make the silhouette unmistakably hammer-like.
  cylinder(0.095, 0.06, steel, [cx, cy, cz + 0.178], "steelCap", [0, 0, 1], 8);
  box([0.18, 0.12, 0.045], ironLight, [cx, cy, cz - 0.13], "rearPoll");
  box([0.12, 0.08, 0.04], steel, [cx, cy, cz - 0.158], "rearPollCap");

  // Brass collar around the wooden handle where it enters the head.
  cylinder(0.062, 0.075, brass, [cx, cy - 0.145, cz], "brassCollar");
  cylinder(0.07, 0.025, brassLight, [cx, cy - 0.185, cz], "brassCollarLower");
  for (const x of [cx - 0.052, cx + 0.052]) {
    cylinder(
      0.012,
      0.035,
      brassLight,
      [x, cy - 0.145, cz + 0.055],
      "collarRivet",
      [0, 0, 1],
      6,
    );
  }

  // Riveted side cheeks: small, chunky highlights that catch the forge light.
  for (const side of [-1, 1]) {
    const sx = cx + side * 0.145;
    box([0.026, 0.115, 0.145], brass, [sx, cy, cz], "sideBand");
    cylinder(0.018, 0.018, brassLight, [sx + side * 0.016, cy + 0.057, cz], "sideRivet", [1, 0, 0], 6);
    cylinder(0.018, 0.018, brassLight, [sx + side * 0.016, cy - 0.057, cz], "sideRivet", [1, 0, 0], 6);
  }

  // Two carved orange forge marks on the front plate: each is a recessed dark
  // diamond with a raised ember-coloured angular slash.
  for (const side of [-1, 1]) {
    const mx = cx + side * 0.052;
    box(
      [0.052, 0.082, 0.008],
      C.beardDark,
      [mx, cy + 0.006, cz + 0.174],
      "forgeMarkRecess",
      [0, 0, side * 0.18],
    );
    const slash = box(
      [0.014, 0.072, 0.012],
      ember,
      [mx + side * 0.006, cy + 0.006, cz + 0.183],
      "forgeMark",
      [0, 0, side * 0.38],
    );
    glow(slash, 1.4);
    const glint = box(
      [0.006, 0.026, 0.014],
      emberLight,
      [mx - side * 0.004, cy + 0.022, cz + 0.19],
      "forgeMarkGlint",
      [0, 0, side * 0.38],
    );
    glow(glint, 1.8);
  }

  // A tiny row of steel wear dents along the striking face.
  for (const dx of [-0.052, 0, 0.052]) {
    cylinder(
      0.009,
      0.012,
      iron,
      [cx + dx, cy + 0.028, cz + 0.174],
      "faceWear",
      [0, 0, 1],
      6,
    );
  }

  // Small hanging sparks at the lower edge of the decorated hammer head.
  b.spike([cx - 0.12, cy - 0.105, cz + 0.13], [0, 0.2, 1], 0.045, 0.008, {
    bone,
    color: ember,
    name: "s25_hammerSparkL",
  });
  b.spike([cx + 0.12, cy - 0.09, cz + 0.14], [0, 0.35, 1], 0.035, 0.007, {
    bone,
    color: emberLight,
    name: "s25_hammerSparkR",
  });
}
```

<!-- call: add6 -->

```ts
import * as THREE from "three";
import { type Builder, polyline } from "agentic-3js-builder";

export function addBootBuckles(b: Builder) {
  // ------------------------------------------------------------------------------------------
  // Heavy boot hardware: large readable square buckles, steel toe caps, and little pale rivets.

  const buckleFrame = (x: number, side: string) => {
    const y = 0.145;
    const z = 0.405;
    const w = 0.145;
    const h = 0.105;
    const bar = 0.018;

    // Four broad brass bars leave a dark leather window in the centre.
    b.part(new THREE.BoxGeometry(w, bar, 0.028), C.brass, {
      at: [x, y + h * 0.5, z],
      name: `bootBuckle${side}Top`,
      flat: true,
    });
    b.part(new THREE.BoxGeometry(w, bar, 0.028), C.brass, {
      at: [x, y - h * 0.5, z],
      name: `bootBuckle${side}Bottom`,
      flat: true,
    });
    b.part(new THREE.BoxGeometry(bar, h, 0.028), C.brass, {
      at: [x - w * 0.5, y, z],
      name: `bootBuckle${side}Left`,
      flat: true,
    });
    b.part(new THREE.BoxGeometry(bar, h, 0.028), C.brass, {
      at: [x + w * 0.5, y, z],
      name: `bootBuckle${side}Right`,
      flat: true,
    });

    // A raised tongue and a dark inset make the buckle read as functional rather than painted on.
    b.part(new THREE.BoxGeometry(0.018, 0.075, 0.04), C.brassLight, {
      at: [x, y, z + 0.012],
      name: `bootBuckle${side}Tongue`,
      rotation: [0, 0, side === "L" ? -0.08 : 0.08],
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.085, 0.05, 0.012), C.sole, {
      at: [x, y, z + 0.006],
      name: `bootBuckle${side}Inset`,
      flat: true,
    });
  };

  buckleFrame(0.22, "L");
  buckleFrame(-0.22, "R");

  // Broad iron toe guards follow the front faces of the boots.
  for (const x of [0.22, -0.22]) {
    b.part(new THREE.BoxGeometry(0.205, 0.105, 0.035), C.ironLight, {
      at: [x, 0.105, 0.39],
      name: "ironToeCap",
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.16, 0.024, 0.018), C.steel, {
      at: [x, 0.15, 0.412],
      name: "toeCapHighlight",
      flat: true,
    });

    // Two staggered rows of pale studs along the upper boot leather.
    for (const row of [0.185, 0.225]) {
      for (const dx of [-0.07, 0, 0.07]) {
        b.part(new THREE.SphereGeometry(0.012, 6, 4), C.brassLight, {
          at: [x + dx, row, 0.404],
          name: "bootStud",
          flat: true,
        });
      }
    }
  }

  // ------------------------------------------------------------------------------------------
  // Guild emblem on the anvil face: a brass hexagonal outline around crossed hammer and tongs.
  // The real top of the stage-one anvil is y = 0.67; the supplied request point is its attachment
  // marker, so the emblem is lifted onto the battered top plate without floating.

  const emblemY = 0.676;
  const hex: [number, number, number][] = [
    [-0.16, emblemY, 0.48],
    [-0.08, emblemY, 0.405],
    [0.08, emblemY, 0.405],
    [0.16, emblemY, 0.48],
    [0.08, emblemY, 0.60],
    [-0.08, emblemY, 0.60],
  ];
  b.sweep(polyline([...hex, hex[0]]), 0.012, {
    color: C.brass,
    caps: "round",
    name: "guildHexagon",
  });

  // Crossed blacksmith hammer: short handle and a chunky head.
  b.sweep(
    [
      [-0.105, emblemY + 0.006, 0.425],
      [0.09, emblemY + 0.006, 0.585],
    ],
    0.014,
    { color: C.iron, caps: "round", name: "guildHammerHandle" },
  );
  b.part(new THREE.BoxGeometry(0.105, 0.025, 0.045), C.ironLight, {
    at: [0.095, emblemY + 0.008, 0.59],
    rotation: [0, 0.58, 0],
    name: "guildHammerHead",
    flat: true,
  });

  // Tongs crossing the hammer: two slim arms with an open, angular jaw.
  b.sweep(
    [
      [0.105, emblemY + 0.008, 0.43],
      [-0.015, emblemY + 0.008, 0.50],
      [-0.105, emblemY + 0.008, 0.57],
    ],
    0.009,
    { color: C.brassLight, caps: "round", name: "guildTongsLeft" },
  );
  b.sweep(
    [
      [0.105, emblemY + 0.009, 0.43],
      [-0.005, emblemY + 0.009, 0.515],
      [-0.095, emblemY + 0.009, 0.60],
    ],
    0.009,
    { color: C.brassLight, caps: "round", name: "guildTongsRight" },
  );

  // Tiny central rivet and four worn corner studs reinforce the emblem silhouette.
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 8), C.brassLight, {
    at: [0, emblemY + 0.012, 0.51],
    dir: [0, 1, 0],
    name: "guildRivet",
    flat: true,
  });
  for (const [x, z] of [
    [-0.125, 0.49],
    [0.125, 0.49],
    [-0.06, 0.425],
    [0.06, 0.58],
  ] as [number, number][]) {
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.014, 6), C.brassLight, {
      at: [x, emblemY + 0.012, z],
      dir: [0, 1, 0],
      name: "guildCornerRivet",
      flat: true,
    });
  }
}
```