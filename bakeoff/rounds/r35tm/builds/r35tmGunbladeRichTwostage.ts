import * as THREE from "three";
import { type Builder, createBuilder, paint, mix, noise } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gunblade",
  description:
    "A dramatic Final Fantasy-inspired gunblade: an oversized silver greatsword fused to a compact brass firearm receiver, with a heavy crossguard, revolver cylinder, trigger frame, grip, pommel, and clear surfaces reserved for later embellishment.",
};

export const REQUESTS = [
  {
    id: "bladeFuller",
    kind: "add",
    part: "bladeMain",
    what: "Add a long dark gunmetal fuller inset down the front face of the blade, edged with a narrow electric-blue glow line. Keep the blade silhouette unchanged and leave the central upper face readable.",
    at: [0, 1.95, 0.061],
    normal: [0, 0, 1],
    bone: null,
    room: [0.22, 1.45, 0.025],
  },
  {
    id: "bladeRunes",
    kind: "add",
    part: "bladeMain",
    what: "Add three small angular Final Fantasy-style rune marks in cyan on the clear front blade face, aligned vertically toward the tip, with tiny dark outlines.",
    at: [0.025, 2.22, 0.064],
    normal: [0, 0, 1],
    bone: null,
    room: [0.16, 0.5, 0.02],
  },
  {
    id: "guardEmblem",
    kind: "add",
    part: "crossguard",
    what: "Add a large faceted crimson crystal emblem at the center of the crossguard, mounted in a gold-black socket, plus two tiny brass rivets.",
    at: [0, 1.02, 0.14],
    normal: [0, 0, 1],
    bone: null,
    room: [0.24, 0.22, 0.12],
  },
  {
    id: "receiverVents",
    kind: "add",
    part: "receiver",
    what: "Add six short brass ventilation slots and two black recessed panels on the gun receiver. The slots should run horizontally across its visible front side and feel machined, not soft.",
    at: [0, 1.14, 0.2],
    normal: [0, 0, 1],
    bone: null,
    room: [0.48, 0.25, 0.04],
  },
  {
    id: "cylinder",
    kind: "add",
    part: "receiver",
    what: "Add a visible six-chamber revolver cylinder on the right side of the receiver, with a dark steel drum, six brass chamber rims, and a central axle cap.",
    at: [-0.28, 1.17, 0.12],
    normal: [-1, 0, 0],
    bone: null,
    room: [0.18, 0.34, 0.34],
  },
  {
    id: "trigger",
    kind: "add",
    part: "triggerGuard",
    what: "Add a curved black trigger inside the existing trigger guard and a small polished brass trigger pivot. Keep the opening unobstructed enough to read from the front.",
    at: [0, 0.82, 0.16],
    normal: [0, 0, 1],
    bone: null,
    room: [0.18, 0.24, 0.08],
  },
  {
    id: "gripWrap",
    kind: "add",
    part: "grip",
    what: "Add alternating cobalt-blue and charcoal grip bands around the leather handle, with a small dangling red tassel below the pommel.",
    at: [0, 0.42, 0],
    normal: [0, 1, 0],
    bone: null,
    room: [0.24, 0.62, 0.24],
  },
  {
    id: "pommelCrystal",
    kind: "add",
    part: "pommel",
    what: "Add a pointed violet materia crystal in the pommel, held by four tiny brass claws, with a faint cyan inner glow.",
    at: [0, 0.08, 0.08],
    normal: [0, 1, 0],
    bone: null,
    room: [0.24, 0.2, 0.2],
  },
  {
    id: "muzzleLight",
    kind: "add",
    part: "barrel",
    what: "Add a cyan circular muzzle light and a thin gold ring around the mouth of the upper barrel. Make it a clear glowing focal point without enlarging the barrel.",
    at: [0, 1.72, 0.1],
    normal: [0, 1, 0],
    bone: null,
    room: [0.18, 0.16, 0.18],
  },
  {
    id: "bladeTexture",
    kind: "texture",
    part: "bladeMain",
    what: "Paint the main blade with a clean Final Fantasy gunmetal gradient: bright cool silver along the cutting edge, pale steel across the face, and a subtle blue-gray shadow toward the spine. Keep the silhouette crisp and leave the rune area high contrast.",
  },
  {
    id: "gripTexture",
    kind: "texture",
    part: "grip",
    what: "Texture the grip as worn dark leather with cobalt-blue wrap bands, tiny stitch marks, and slightly brighter wear on the forward-facing ridges.",
  },
  {
    id: "receiverTexture",
    kind: "texture",
    part: "receiver",
    what: "Texture the receiver with rich aged brass plates over charcoal gunmetal, subtle engraved chevrons, and dark seams around every major panel.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

const SILVER = "#c9d7e6";
const SILVER_HIGHLIGHT = "#eef6ff";
const STEEL = "#526477";
const GUNMETAL = "#202936";
const DARK = "#111722";
const BLACK = "#090b12";
const BRASS = "#c18a35";
const GOLD = "#f0c45b";
const LEATHER = "#321e25";
const BLUE = "#274f9b";
const CYAN = "#33d9e8";
const MAGENTA = "#d43b9f";
const CRIMSON = "#a9283d";
const VIOLET = "#7c4bd1";

const BLADE_TEXTURE = paint((p, n, s) => {
  const edge = Math.max(0, Math.min(1, (s[0] + 0.2) / 0.42));
  const height = Math.max(0, Math.min(1, s[1] / 1.72));
  const grain = noise(p, 0.16, 41);
  const coolSteel = mix("#71869d", "#cbd9e8", 0.42 + 0.3 * height + 0.12 * grain);
  const brightEdge = mix(coolSteel, "#f3f8ff", edge * 0.82);
  const shadow = mix(brightEdge, "#34495e", Math.max(0, 0.32 - height) * 0.48);
  return n.z > 0.45 ? shadow : brightEdge;
});

const GRIP_TEXTURE = paint((p, n, s) => {
  const band = Math.floor((s[1] + 0.03) / 0.095);
  const wrapped = band % 2 === 0;
  const wear = noise(p, 0.035, 77);
  if (wrapped) return wear > 0.62 ? "#3568bd" : "#24498e";
  const leather = mix("#21151d", "#59333b", 0.28 + wear * 0.34);
  return n.z > 0.35 ? mix(leather, "#8a5151", 0.16) : leather;
});

const RECEIVER_TEXTURE = paint((p, n, s) => {
  const panelU = Math.abs(s[0] - 0.5);
  const panelV = Math.abs(s[1] - 0.5);
  const seam = panelU > 0.46 || panelV > 0.43;
  if (seam) return "#211a1b";
  const chevron = Math.abs(((s[0] * 7 + s[1] * 3) % 1) - 0.5);
  const brass = mix("#6d421f", "#d29a43", 0.48 + 0.22 * noise(p, 0.055, 93));
  return chevron < 0.055 ? mix(brass, "#f0c568", 0.45) : brass;
});

function box(
  b: Builder,
  size: [number, number, number],
  color: string,
  at: [number, number, number],
  name: string,
  rotation?: [number, number, number],
) {
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    rotation,
    name,
  });
}

function cylinder(
  b: Builder,
  radius: number,
  depth: number,
  color: string,
  at: [number, number, number],
  name: string,
  radial = 10,
  dir: [number, number, number] = [0, 1, 0],
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, depth, radial), color, {
    at,
    dir,
    name,
  });
}

function build() {
  const b = createBuilder({ name: "gunblade", detail: 1 });

  // The long blade is deliberately broad and slightly asymmetrical, like a stylized
  // executioner's sword fused to a firearm.
  b.extrude(
    [
      [-0.13, 0],
      [0.16, 0],
      [0.21, 0.22],
      [0.18, 0.88],
      [0.105, 1.34],
      [0.015, 1.72],
      [-0.075, 1.48],
      [-0.18, 0.98],
      [-0.2, 0.28],
    ],
    {
      at: [0, 1.17, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.09,
      bevel: 0.012,
      smoothing: 1,
      color: BLADE_TEXTURE,
      name: "bladeMain",
    },
  );

  // A raised rear spine and bright cutting-edge strip establish the blade planes.
  b.extrude(
    [
      [-0.17, 0],
      [-0.11, 0.2],
      [-0.105, 0.83],
      [-0.055, 1.38],
      [0, 1.65],
      [0.025, 1.36],
      [0.07, 0.82],
      [0.09, 0.2],
      [0.08, 0],
    ],
    {
      at: [0, 1.18, 0.052],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      color: STEEL,
      name: "bladeSpine",
    },
  );

  b.extrude(
    [
      [0.105, 0],
      [0.16, 0.22],
      [0.18, 0.88],
      [0.105, 1.34],
      [0.015, 1.72],
      [0.09, 1.28],
      [0.205, 0.87],
      [0.22, 0.22],
      [0.17, 0],
    ],
    {
      at: [0, 1.17, 0.057],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      color: SILVER_HIGHLIGHT,
      name: "bladeEdge",
    },
  );

  // Heavy crossguard: a central block with swept, horn-like ends.
  box(b, [0.56, 0.12, 0.16], GUNMETAL, [0, 1.02, 0], "crossguard");
  b.extrude(
    [
      [-0.27, 0],
      [-0.48, 0.02],
      [-0.58, 0.11],
      [-0.52, 0.18],
      [-0.3, 0.13],
      [-0.17, 0.06],
    ],
    {
      at: [0, 0.96, 0.01],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.12,
      bevel: 0.01,
      smoothing: 1,
      color: BRASS,
      name: "guardLeft",
    },
  );
  b.extrude(
    [
      [0.27, 0],
      [0.48, 0.02],
      [0.58, 0.11],
      [0.52, 0.18],
      [0.3, 0.13],
      [0.17, 0.06],
    ],
    {
      at: [0, 0.96, 0.01],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.12,
      bevel: 0.01,
      smoothing: 1,
      color: BRASS,
      name: "guardRight",
    },
  );

  // Firearm receiver sitting immediately below the blade root.
  box(b, [0.42, 0.29, 0.3], RECEIVER_TEXTURE, [0, 1.14, 0.055], "receiver");
  box(b, [0.33, 0.18, 0.315], GUNMETAL, [0, 1.15, 0.215], "receiverFace");
  box(b, [0.2, 0.07, 0.034], DARK, [0, 1.24, 0.378], "receiverTopPanel");

  // Upper barrel, visually aligned with the blade's lower spine.
  cylinder(b, 0.075, 0.66, DARK, [0, 1.48, 0.07], "barrel", 10);
  cylinder(b, 0.09, 0.045, BRASS, [0, 1.79, 0.07], "barrelBand", 10);
  cylinder(b, 0.075, 0.055, GUNMETAL, [0, 1.84, 0.07], "barrelMuzzle", 10);

  // Side-mounted cylinder silhouette.
  cylinder(b, 0.14, 0.075, STEEL, [-0.245, 1.15, 0.1], "cylinderDrum", 12, [1, 0, 0]);
  cylinder(b, 0.055, 0.09, BRASS, [-0.295, 1.15, 0.1], "cylinderHub", 10, [1, 0, 0]);

  // Trigger guard and trigger.
  b.sweep(
    [
      [-0.11, 0.99, 0.16],
      [-0.13, 0.87, 0.17],
      [-0.06, 0.77, 0.17],
      [0.07, 0.78, 0.17],
      [0.11, 0.9, 0.16],
    ],
    0.018,
    { color: GUNMETAL, name: "triggerGuard", caps: "round" },
  );
  b.sweep(
    [
      [0.01, 0.91, 0.19],
      [-0.01, 0.84, 0.2],
      [-0.045, 0.81, 0.2],
    ],
    [0.018, 0.006],
    { color: BRASS, name: "trigger", caps: "round" },
  );

  // Chunky angled grip, safely above the floor.
  b.sweep(
    [
      [0, 0.82, 0],
      [0.015, 0.63, 0],
      [0.035, 0.37, 0],
      [0.02, 0.18, 0],
    ],
    [0.115, 0.09],
    { color: GRIP_TEXTURE, name: "grip", section: { ngon: 8 }, caps: "round" },
  );

  // Pommel and its metal collar.
  cylinder(b, 0.125, 0.075, BRASS, [0.02, 0.12, 0], "pommel", 10);
  b.spike([0.02, 0.055, 0], [0, -1, 0], 0.16, 0.09, {
    color: GUNMETAL,
    name: "pommelCap",
  });

  // Small visible fasteners establish the mechanical construction.
  for (const x of [-0.16, 0.16]) {
    cylinder(b, 0.018, 0.02, GOLD, [x, 1.04, 0.18], `guardRivet${x}`, 8, [0, 0, 1]);
  }
  for (const y of [1.06, 1.2]) {
    cylinder(b, 0.014, 0.018, GOLD, [-0.22, y, 0.22], `receiverRivet${y}`, 8, [0, 0, 1]);
  }

  for (const add of STAGE2) add(b);
  return b.root;
}

export default build;

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addBladeFuller(b: Builder) {
  const darkFuller = "#151d2a";
  const fullerEdge = "#293b55";
  const electricBlue = "#35e6ff";

  const center: [number, number, number] = [0, 1.95, 0.066];

  // Long, tapered inset plate. Its faceted shoulders echo the angular blade silhouette,
  // while stopping short of the tip so the silver upper face remains the visual hero.
  b.extrude(
    [
      [-0.092, -0.57],
      [0.092, -0.57],
      [0.074, -0.42],
      [0.063, 0.37],
      [0.036, 0.59],
      [0, 0.69],
      [-0.036, 0.59],
      [-0.063, 0.37],
      [-0.074, -0.42],
    ],
    {
      at: center,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      smoothing: 0,
      color: darkFuller,
      name: "bladeFullerInset",
    },
  );

  // A narrow raised lower bevel gives the fuller a machined lip instead of reading
  // as a flat sticker on the blade.
  b.extrude(
    [
      [-0.094, -0.575],
      [0.094, -0.575],
      [0.078, -0.51],
      [-0.078, -0.51],
    ],
    {
      at: center,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.002,
      color: fullerEdge,
      name: "fullerLowerShoulder",
    },
  );

  // Electric-blue rails follow the fuller edges as two broken, tapered strips.
  // The small central gap keeps the inset dark and gives the blade a strong graphic read.
  const leftRail = b.extrude(
    [
      [-0.098, -0.48],
      [-0.084, -0.48],
      [-0.055, 0.38],
      [-0.029, 0.605],
      [-0.038, 0.62],
      [-0.067, 0.4],
    ],
    {
      at: [center[0], center[1], center[2] + 0.009],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.0015,
      smoothing: 0,
      color: electricBlue,
      name: "fullerGlowRailL",
    },
  );
  const rightRail = b.extrude(
    [
      [0.084, -0.48],
      [0.098, -0.48],
      [0.067, 0.4],
      [0.038, 0.62],
      [0.029, 0.605],
      [0.055, 0.38],
    ],
    {
      at: [center[0], center[1], center[2] + 0.009],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.0015,
      smoothing: 0,
      color: electricBlue,
      name: "fullerGlowRailR",
    },
  );

  glow(leftRail, 2.2);
  glow(rightRail, 2.2);

  // Three tiny blue inspection studs make the fuller feel like a powered weapon
  // component rather than a purely decorative stripe.
  for (const [i, y] of [0.02, 0.24, 0.46].entries()) {
    const stud = b.part(
      new THREE.CylinderGeometry(0.012 - i * 0.0015, 0.012 - i * 0.0015, 0.006, 8),
      electricBlue,
      {
        at: [0, 1.95 + y, 0.079],
        dir: [0, 0, 1],
        name: `fullerPowerStud${i}`,
      },
    );
    glow(stud, 1.8);
  }
}
    return addBladeFuller;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addBladeRunes(b: Builder) {
  const RUNE_INK = "#101b2a";
  const RUNE_CYAN = "#38e6ef";
  const SOCKET_BLACK = "#090b12";
  const EMBLEM_RED = "#a9283d";
  const EMBLEM_HIGHLIGHT = "#e45b63";

  const rune = (
    center: [number, number, number],
    outline: [number, number][],
    inner: [number, number][],
    name: string,
  ) => {
    b.extrude(outline, {
      at: center,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.009,
      bevel: 0.002,
      smoothing: 0,
      color: RUNE_INK,
      name: `${name}Outline`,
    });

    b.extrude(inner, {
      at: [center[0], center[1], center[2] + 0.006],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.004,
      bevel: 0.001,
      smoothing: 0,
      color: RUNE_CYAN,
      name: name,
    });
  };

  // Three angular, deliberately oversized glyphs on the exposed blade face.
  rune(
    [0.025, 2.055, 0.064],
    [
      [-0.052, -0.048],
      [0.014, -0.048],
      [0.052, 0.0],
      [0.014, 0.048],
      [-0.052, 0.048],
      [-0.018, 0.0],
    ],
    [
      [-0.032, -0.032],
      [0.006, -0.032],
      [0.027, 0.0],
      [0.006, 0.032],
      [-0.032, 0.032],
      [-0.009, 0.0],
    ],
    "bladeRuneLower",
  );

  rune(
    [0.025, 2.215, 0.064],
    [
      [-0.045, -0.052],
      [0.045, -0.052],
      [0.012, -0.014],
      [0.012, 0.052],
      [-0.012, 0.052],
      [-0.012, -0.014],
    ],
    [
      [-0.028, -0.034],
      [0.028, -0.034],
      [0.004, -0.006],
      [0.004, 0.034],
      [-0.004, 0.034],
      [-0.004, -0.006],
    ],
    "bladeRuneMiddle",
  );

  rune(
    [0.025, 2.375, 0.064],
    [
      [-0.05, 0.048],
      [0.016, 0.048],
      [0.05, 0.0],
      [0.016, -0.048],
      [-0.05, -0.048],
      [-0.018, 0.0],
    ],
    [
      [-0.031, 0.032],
      [0.008, 0.032],
      [0.028, 0.0],
      [0.008, -0.032],
      [-0.031, -0.032],
      [-0.008, 0.0],
    ],
    "bladeRuneUpper",
  );

  // Dark raised socket under the guard emblem.
  b.part(new THREE.CylinderGeometry(0.083, 0.083, 0.026, 10), SOCKET_BLACK, {
    at: [0, 1.02, 0.118],
    dir: [0, 0, 1],
    name: "guardEmblemSocket",
  });

  // Brass retaining rim, intentionally faceted rather than perfectly smooth.
  b.part(new THREE.CylinderGeometry(0.071, 0.071, 0.016, 10), BRASS, {
    at: [0, 1.02, 0.137],
    dir: [0, 0, 1],
    name: "guardEmblemRim",
  });

  // Large dark silhouette gives the crystal a crisp graphic outline.
  b.extrude(
    [
      [-0.067, 0],
      [-0.035, 0.078],
      [0, 0.112],
      [0.035, 0.078],
      [0.067, 0],
      [0.035, -0.078],
      [0, -0.112],
      [-0.035, -0.078],
    ],
    {
      at: [0, 1.02, 0.143],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.003,
      smoothing: 0,
      color: SOCKET_BLACK,
      name: "guardCrystalOutline",
    },
  );

  // Main crimson crystal, with a sharp octagonal silhouette.
  b.extrude(
    [
      [-0.052, 0],
      [-0.026, 0.063],
      [0, 0.091],
      [0.026, 0.063],
      [0.052, 0],
      [0.026, -0.063],
      [0, -0.091],
      [-0.026, -0.063],
    ],
    {
      at: [0, 1.02, 0.157],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.013,
      bevel: 0.002,
      smoothing: 0,
      color: EMBLEM_RED,
      name: "guardCrystal",
    },
  );

  // Two offset facets make the emblem read as cut crystal instead of a flat badge.
  b.extrude(
    [
      [0, 0.005],
      [0.02, 0.058],
      [0.035, 0],
      [0.018, -0.049],
    ],
    {
      at: [0.004, 1.02, 0.166],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.004,
      bevel: 0.001,
      smoothing: 0,
      color: EMBLEM_HIGHLIGHT,
      name: "guardCrystalFacet",
    },
  );

  b.extrude(
    [
      [-0.002, 0.003],
      [-0.02, 0.046],
      [-0.033, 0],
      [-0.016, -0.041],
    ],
    {
      at: [-0.003, 1.02, 0.168],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.003,
      bevel: 0.001,
      smoothing: 0,
      color: BRASS,
      name: "guardCrystalGleam",
    },
  );

  // Twin mechanical rivets flank the crystal on the existing crossguard.
  for (const side of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.022, 8), BRASS, {
      at: [side * 0.087, 1.02, 0.165],
      dir: [0, 0, 1],
      name: `guardEmblemRivet${side > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.025, 6), EMBLEM_HIGHLIGHT, {
      at: [side * 0.087, 1.02, 0.178],
      dir: [0, 0, 1],
      name: `guardEmblemRivetCap${side > 0 ? "L" : "R"}`,
    });
  }
}
    return addBladeRunes;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addReceiverVents(b: Builder) {
  const BRASS = "#c18a35";
  const BRASS_HIGHLIGHT = "#f0c45b";
  const RECESS = "#090b12";
  const STEEL = "#526477";
  const INK = "#211923";

  const frontZ = 0.221;
  const y0 = 1.14;

  const addBox = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    name: string,
    bevel = 0,
  ) => {
    const geometry = new THREE.BoxGeometry(...size);
    if (bevel > 0) {
      const edge = new THREE.EdgesGeometry(geometry, 25);
      // The bevel-like edge is supplied as a separate, very thin machined rim.
      b.part(geometry, color, { at, name });
      b.part(edge, color, { at, name: `${name}Edge` });
    } else {
      b.part(geometry, color, { at, name });
    }
  };

  // Two deep, black machined recesses sit behind the ventilation bars. They are
  // deliberately split so the brass slots read as separate manufactured pieces.
  for (const side of [-1, 1]) {
    addBox(
      [0.145, 0.105, 0.008],
      RECESS,
      [side * 0.132, y0 + 0.008, frontZ - 0.004],
      `receiverRecess${side < 0 ? "L" : "R"}`,
    );

    // A slim steel boundary on each panel gives the receiver a layered,
    // industrial silhouette without making the vents look like loose decals.
    addBox(
      [0.155, 0.012, 0.009],
      STEEL,
      [side * 0.132, y0 + 0.067, frontZ + 0.001],
      `receiverPanelTop${side < 0 ? "L" : "R"}`,
    );
    addBox(
      [0.155, 0.012, 0.009],
      STEEL,
      [side * 0.132, y0 - 0.051, frontZ + 0.001],
      `receiverPanelBottom${side < 0 ? "L" : "R"}`,
    );
  }

  // Six short horizontal brass vent slats. Each has a dark undercut and a
  // brighter upper lip, making the slots read as inset machined louvers.
  const slotYs = [y0 - 0.046, y0 - 0.016, y0 + 0.014, y0 + 0.044];
  const slotSides = [-1, 1, -1, 1];
  for (let i = 0; i < 6; i++) {
    const side = slotSides[i % slotSides.length];
    const row = i < 4 ? slotYs[i] : i === 4 ? y0 - 0.076 : y0 + 0.074;
    const width = i >= 4 ? 0.13 : 0.115;
    const x = side * (i >= 4 ? 0.108 : 0.115);

    addBox(
      [width + 0.012, 0.018, 0.006],
      INK,
      [x, row, frontZ + 0.002],
      `ventRecess${i + 1}`,
    );
    addBox(
      [width, 0.009, 0.009],
      BRASS,
      [x, row + 0.003, frontZ + 0.008],
      `ventBrass${i + 1}`,
    );
    addBox(
      [width * 0.78, 0.003, 0.003],
      BRASS_HIGHLIGHT,
      [x - side * 0.008, row + 0.0085, frontZ + 0.014],
      `ventHighlight${i + 1}`,
    );
  }

  // Small corner fasteners and a central maker's bridge tie the two panel
  // assemblies into the receiver rather than leaving them visually floating.
  for (const x of [-0.205, 0.205]) {
    b.part(
      new THREE.CylinderGeometry(0.012, 0.012, 0.009, 8),
      BRASS_HIGHLIGHT,
      {
        at: [x, y0 + 0.098, frontZ + 0.006],
        dir: [0, 0, 1],
        name: `receiverVentRivet${x < 0 ? "L" : "R"}`,
      },
    );
  }

  addBox(
    [0.026, 0.145, 0.008],
    STEEL,
    [0, y0, frontZ + 0.002],
    "receiverCenterBridge",
  );
  addBox(
    [0.012, 0.108, 0.006],
    BRASS,
    [0, y0, frontZ + 0.009],
    "receiverCenterRail",
  );
}
    return addReceiverVents;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addCylinder(b: Builder) {
  const CHAMBER = "#141b27";
  const BRASS_BRIGHT = "#e6b84d";
  const TRIGGER_BLACK = "#080b12";

  const drumCenter: [number, number, number] = [-0.305, 1.15, 0.1];
  const faceX = -0.35;
  const axis: [number, number, number] = [-1, 0, 0];

  // A recessed dark face makes the six separate chambers read clearly through
  // the brass rims, rather than looking like six floating rings.
  b.part(
    new THREE.CylinderGeometry(0.112, 0.112, 0.012, 12),
    CHAMBER,
    {
      at: [faceX, drumCenter[1], drumCenter[2]],
      dir: axis,
      name: "cylinderFace",
    },
  );

  const chamberRadius = 0.056;
  const ringRadius = 0.027;
  const ringTube = 0.006;
  const chamberDepth = 0.009;

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const y = drumCenter[1] + Math.cos(a) * chamberRadius;
    const z = drumCenter[2] + Math.sin(a) * chamberRadius;

    // Deep chamber mouth.
    b.part(
      new THREE.CylinderGeometry(0.021, 0.021, chamberDepth, 8),
      DARK,
      {
        at: [faceX - 0.006, y, z],
        dir: axis,
        name: `chamber${i + 1}`,
      },
    );

    // Raised machined brass chamber rim.
    b.part(
      new THREE.TorusGeometry(ringRadius, ringTube, 6, 10),
      BRASS_BRIGHT,
      {
        at: [faceX - 0.014, y, z],
        dir: axis,
        name: `chamberRim${i + 1}`,
      },
    );

    // Tiny outer indexing stud gives the drum a deliberately over-built
    // mechanical silhouette.
    b.part(
      new THREE.SphereGeometry(0.0065, 6, 4),
      GOLD,
      {
        at: [faceX - 0.021, y + Math.cos(a) * 0.034, z + Math.sin(a) * 0.034],
        name: `chamberStud${i + 1}`,
      },
    );
  }

  // Central axle cap with a smaller inset face.
  b.part(
    new THREE.CylinderGeometry(0.052, 0.052, 0.025, 10),
    BRASS,
    {
      at: [faceX - 0.018, drumCenter[1], drumCenter[2]],
      dir: axis,
      name: "cylinderAxleCap",
    },
  );
  b.part(
    new THREE.CylinderGeometry(0.026, 0.026, 0.029, 8),
    DARK,
    {
      at: [faceX - 0.034, drumCenter[1], drumCenter[2]],
      dir: axis,
      name: "cylinderAxleInset",
    },
  );
  b.part(
    new THREE.CylinderGeometry(0.009, 0.009, 0.034, 8),
    BRASS_BRIGHT,
    {
      at: [faceX - 0.04, drumCenter[1], drumCenter[2]],
      dir: axis,
      name: "cylinderAxlePin",
    },
  );

  // A small rear ejector bar beneath the drum reinforces the revolver read.
  b.sweep(
    [
      [-0.32, 1.035, 0.1],
      [-0.355, 1.03, 0.1],
      [-0.375, 1.08, 0.1],
    ],
    0.008,
    {
      color: BRASS,
      caps: "round",
      name: "ejectorBar",
    },
  );

  // Curved trigger kept narrow and toward the rear of the existing guard,
  // leaving the guard opening visibly open.
  b.sweep(
    [
      [0.018, 0.925, 0.205],
      [0.012, 0.89, 0.215],
      [-0.006, 0.85, 0.218],
      [-0.035, 0.825, 0.216],
    ],
    [0.013, 0.007],
    {
      color: TRIGGER_BLACK,
      caps: "round",
      name: "triggerBlade",
    },
  );

  // Brass pivot washer and a smaller dark pin on the visible front.
  b.part(
    new THREE.CylinderGeometry(0.025, 0.025, 0.012, 10),
    BRASS_BRIGHT,
    {
      at: [0.018, 0.925, 0.225],
      dir: [0, 0, 1],
      name: "triggerPivotWasher",
    },
  );
  b.part(
    new THREE.CylinderGeometry(0.009, 0.009, 0.018, 8),
    DARK,
    {
      at: [0.018, 0.925, 0.234],
      dir: [0, 0, 1],
      name: "triggerPivotPin",
    },
  );

  // Two small receiver-side screws tie the trigger assembly into the housing.
  for (const y of [0.855, 0.965]) {
    b.part(
      new THREE.CylinderGeometry(0.008, 0.008, 0.014, 8),
      GOLD,
      {
        at: [0.12, y, 0.218],
        dir: [0, 0, 1],
        name: `triggerHousingScrew${y}`,
      },
    );
  }
}
    return addCylinder;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addGripWrap(b: Builder) {
  const BLUE = "#274f9b";
  const CHARCOAL = "#171b26";
  const BRASS = "#c18a35";
  const GOLD = "#f0c45b";
  const CRIMSON = "#a9283d";

  const wrapBand = (
    y: number,
    x: number,
    color: string,
    radius = 0.094,
    tube = 0.014,
    name = "s25GripBand",
  ) => {
    // TorusGeometry's local Z axis is turned into the handle's Y axis.
    return b.part(
      new THREE.TorusGeometry(radius, tube, 6, 14),
      color,
      {
        at: [x, y, 0],
        rotation: [Math.PI / 2, 0, 0],
        name,
      },
    );
  };

  const gripBands = [
    [0.72, 0.008, BLUE],
    [0.65, 0.012, CHARCOAL],
    [0.575, 0.02, BLUE],
    [0.50, 0.025, CHARCOAL],
    [0.425, 0.03, BLUE],
    [0.35, 0.032, CHARCOAL],
    [0.275, 0.03, BLUE],
    [0.205, 0.025, CHARCOAL],
  ] as const;

  for (let i = 0; i < gripBands.length; i++) {
    const [y, x, color] = gripBands[i];
    wrapBand(y, x, color, 0.094, i % 2 === 0 ? 0.015 : 0.013, `s25GripBand${i}`);
  }

  // Fine brass ferrules make the alternating wrap read as a deliberate weapon
  // assembly rather than loose rings.
  for (const [i, y] of [0.755, 0.17].entries()) {
    wrapBand(y, y < 0.2 ? 0.022 : 0.005, GOLD, 0.101, 0.006, `s25GripFerrule${i}`);
  }

  // Small diamond-shaped grip studs, repeated down the forward-facing side.
  for (let i = 0; i < 5; i++) {
    const y = 0.68 - i * 0.105;
    const x = 0.012 + i * 0.004;
    b.part(
      new THREE.OctahedronGeometry(0.014, 0),
      BRASS,
      {
        at: [x, y, 0.099],
        rotation: [0, 0, Math.PI / 4],
        name: `s25GripStud${i}`,
      },
    );
  }

  // A braided-looking two-tone cord drops from the pommel.
  const cordA = b.sweep(
    [
      [0.02, 0.08, 0.015],
      [0.035, 0.025, 0.018],
      [0.018, -0.025, 0.022],
    ],
    [0.009, 0.006],
    {
      color: CHARCOAL,
      caps: "round",
      name: "s25TasselCord",
    },
  );

  b.sweep(
    [
      [0.025, 0.075, 0.017],
      [0.018, 0.028, 0.026],
      [0.035, -0.018, 0.02],
    ],
    [0.004, 0.0025],
    {
      color: GOLD,
      caps: "round",
      name: "s25TasselCordGold",
    },
  );

  // Collar bead at the end of the cord.
  b.part(
    new THREE.SphereGeometry(0.026, 8, 6),
    BRASS,
    {
      at: [0.028, -0.035, 0.021],
      name: "s25TasselBead",
    },
  );

  // A compact fan of tapered crimson tassel strands. They remain separated
  // enough to silhouette clearly while sharing the same attachment point.
  const tasselRoot: [number, number, number] = [0.028, -0.052, 0.021];
  const tasselTips: [number, number, number][] = [
    [0.028, -0.145, -0.005],
    [0.004, -0.135, 0.006],
    [0.05, -0.14, 0.01],
    [0.012, -0.125, 0.028],
    [0.044, -0.13, 0.033],
  ];

  for (let i = 0; i < tasselTips.length; i++) {
    b.sweep(
      [
        tasselRoot,
        [
          tasselRoot[0] + (tasselTips[i][0] - tasselRoot[0]) * 0.45,
          tasselRoot[1] + (tasselTips[i][1] - tasselRoot[1]) * 0.45,
          tasselRoot[2] + (tasselTips[i][2] - tasselRoot[2]) * 0.45,
        ],
        tasselTips[i],
      ],
      [0.009, 0.002],
      {
        color: CRIMSON,
        caps: "round",
        name: `s25TasselStrand${i}`,
      },
    );
  }

  // A tiny dark knot hides the strand roots and visually locks the tassel to
  // the gold bead.
  b.part(
    new THREE.CylinderGeometry(0.032, 0.027, 0.035, 8),
    CHARCOAL,
    {
      at: [0.028, -0.06, 0.021],
      name: "s25TasselKnot",
    },
  );

  void cordA;
}
    return addGripWrap;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addPommelCrystal(b: Builder) {
  const crystal = b.part(
    new THREE.ConeGeometry(0.064, 0.17, 6, 1, false),
    VIOLET,
    {
      at: [0, 0.105, 0.08],
      name: "s26PommelMateria",
    },
  );

  const crystalBase = b.part(
    new THREE.TorusGeometry(0.062, 0.009, 6, 12),
    BRASS,
    {
      at: [0, 0.028, 0.08],
      dir: [0, 1, 0],
      axis: "z",
      name: "s26MateriaBaseRing",
    },
  );

  // A smaller cyan faceted core is pushed toward the visible front face,
  // reading as a glowing heart inside the violet materia.
  const core = b.part(
    new THREE.ConeGeometry(0.027, 0.105, 6, 1, false),
    CYAN,
    {
      at: [0, 0.105, 0.126],
      name: "s26MateriaInnerGlow",
    },
  );
  glow(core, 2.4);

  const coreSpark = b.part(
    new THREE.OctahedronGeometry(0.014, 0),
    "#d9ffff",
    {
      at: [0, 0.135, 0.151],
      name: "s26MateriaSpark",
    },
  );
  glow(coreSpark, 3);

  // Four angular retaining claws converge around the crystal's lower facets.
  const claws: Array<[[number, number, number], [number, number, number]]> = [
    [
      [0.058, 0.038, 0.082],
      [0.034, 0.084, 0.086],
    ],
    [
      [-0.058, 0.038, 0.082],
      [-0.034, 0.084, 0.086],
    ],
    [
      [0.002, 0.038, 0.138],
      [0.002, 0.084, 0.112],
    ],
    [
      [0.002, 0.038, 0.022],
      [0.002, 0.084, 0.052],
    ],
  ];

  claws.forEach(([start, end], i) => {
    b.rod(start, end, 0.009, {
      color: BRASS,
      caps: "round",
      name: `s26MateriaClaw${i}`,
    });
    b.spike(end, end, 0.027, 0.011, {
      color: GOLD,
      name: `s26MateriaClawTip${i}`,
    });
  });

  // A dark socket behind the pommel stone gives the bright crystal a clean silhouette.
  b.part(
    new THREE.CylinderGeometry(0.074, 0.082, 0.025, 8),
    DARK,
    {
      at: [0, 0.035, 0.08],
      name: "s26MateriaSocket",
    },
  );

  // The upper barrel receives a thin machined gold muzzle rim.
  const muzzleRing = b.part(
    new THREE.TorusGeometry(0.073, 0.007, 6, 14),
    GOLD,
    {
      at: [0, 1.869, 0.07],
      dir: [0, 1, 0],
      axis: "z",
      name: "s26MuzzleGoldRing",
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.063, 0.063, 0.008, 12),
    DARK,
    {
      at: [0, 1.871, 0.07],
      name: "s26MuzzleRecess",
    },
  );

  const muzzleLight = b.part(
    new THREE.CircleGeometry(0.052, 16),
    CYAN,
    {
      at: [0, 1.876, 0.07],
      dir: [0, 1, 0],
      axis: "z",
      name: "s26MuzzleCyanLight",
    },
  );
  glow(muzzleLight, 2.8);

  const muzzleCore = b.part(
    new THREE.CircleGeometry(0.026, 12),
    "#d8ffff",
    {
      at: [0, 1.881, 0.07],
      dir: [0, 1, 0],
      axis: "z",
      name: "s26MuzzleLightCore",
    },
  );
  glow(muzzleCore, 4);

  // Six tiny gold bolts reinforce the muzzle collar without changing its silhouette.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(
      new THREE.SphereGeometry(0.0065, 6, 4),
      GOLD,
      {
        at: [
          Math.cos(a) * 0.061,
          1.878,
          0.07 + Math.sin(a) * 0.061,
        ],
        name: `s26MuzzleBolt${i}`,
      },
    );
  }

  void crystal;
  void crystalBase;
  void muzzleRing;
}
    return addPommelCrystal;
  })(),
);
