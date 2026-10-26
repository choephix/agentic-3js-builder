import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import type { Builder } from "../../../../src/index";

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
      color: SILVER,
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
      [0.035, 1.28],
      [0.125, 0.87],
      [0.125, 0.22],
      [0.15, 0],
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
  box(b, [0.42, 0.29, 0.3], BRASS, [0, 1.14, 0.055], "receiver");
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
    { color: LEATHER, name: "grip", section: { ngon: 8 }, caps: "round" },
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
