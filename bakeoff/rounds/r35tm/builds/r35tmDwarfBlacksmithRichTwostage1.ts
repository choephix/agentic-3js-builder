import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  rng,
  type Builder,
} from "../../../../src/index";

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
