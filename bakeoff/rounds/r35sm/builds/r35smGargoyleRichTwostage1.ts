import * as THREE from "three";
import { createBuilder, bezier, catmull, polyline } from "../../../../src/index";
import type { Builder } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cathedral Gargoyle",
  description: "A winged stone gargoyle crouched on a cathedral ledge, gothic stone carving style.",
};

export const REQUESTS = [
  {
    id: "browCarving",
    kind: "add",
    part: "head",
    what: "Heavy carved brow ridges with chiselled furrow lines and cheek-bone ridges, in STONE_LIGHT with STONE_DARK grooves.",
    at: [0, 1.12, 0.5],
    normal: [0, 0.4, 1],
    bone: "head",
    room: [0.34, 0.12, 0.12],
  },
  {
    id: "wingRibs",
    kind: "add",
    part: "wingL",
    what: "Bat-wing finger bones: four raised ribs fanning from the shoulder to the wing's scalloped edge, with claws at the tips, on both wings.",
    at: [0.22, 1.1, -0.35],
    normal: [1, 0.2, 0],
    bone: "wingL",
    room: [0.1, 0.8, 0.7],
  },
  {
    id: "chestRelief",
    kind: "add",
    part: "torso",
    what: "A carved quatrefoil emblem on the chest with a ring of studs, in STONE_LIGHT, protruding a few cm.",
    at: [0, 0.72, 0.3],
    normal: [0, 0, 1],
    bone: "chest",
    room: [0.3, 0.3, 0.1],
  },
  {
    id: "clawsFront",
    kind: "add",
    part: "armL",
    what: "Chunky knuckles and long curved claws gripping the ledge edge, on both front hands.",
    at: [0.28, 0.29, 0.45],
    normal: [0, 0, 1],
    bone: "handL",
    room: [0.2, 0.1, 0.2],
  },
  {
    id: "ledgeCornice",
    kind: "add",
    part: "ledge",
    what: "Gothic cornice moulding along the ledge front: a row of small trefoil arches and dentils beneath the lip, plus a weathered corbel at each end.",
    at: [0, 0.12, 0.6],
    normal: [0, 0, 1],
    bone: null,
    room: [1.4, 0.2, 0.1],
  },
  {
    id: "mossAndCracks",
    kind: "add",
    part: "ledge",
    what: "Moss tufts in MOSS on the ledge top and in the gargoyle's creases, plus a few chipped corners and hairline cracks.",
    at: [0.4, 0.26, 0.3],
    normal: [0, 1, 0],
    bone: null,
    room: [1.2, 0.08, 0.9],
  },
  {
    id: "tailTip",
    kind: "add",
    part: "tail",
    what: "A spade-shaped carved tail tip with a central ridge, and small spined vertebra bumps along the tail.",
    at: [0.4, 0.3, -0.85],
    normal: [0, 1, 0],
    bone: "tail3",
    room: [0.25, 0.15, 0.25],
  },
  {
    id: "eyeSockets",
    kind: "add",
    part: "head",
    what: "Deep-set eye sockets rimmed with STONE_DARK, with a rune ring around each glowing eye.",
    at: [0, 1.07, 0.52],
    normal: [0, 0, 1],
    bone: "head",
    room: [0.28, 0.1, 0.06],
  },
  {
    id: "stoneWeathering",
    kind: "texture",
    part: "torso",
    what: "Weathered limestone: mottled grey in STONE with STONE_DARK soot streaks running down, and pale chisel marks on top faces.",
  },
  {
    id: "wingTexture",
    kind: "texture",
    part: "wingL",
    what: "Carved membrane folds radiating from the shoulder in STONE_DARK grooves with STONE_LIGHT edges, on both wings.",
  },
  {
    id: "ledgeStone",
    kind: "texture",
    part: "ledge",
    what: "Ashlar block courses with mortar lines in STONE_DARK, green MOSS stains near the top, and rain-streaked grime.",
  },
];

export const STONE = "#8d8a84";
export const STONE_DARK = "#5f5c59";
export const STONE_LIGHT = "#b5b1a8";
export const LEDGE = "#77746f";
export const MOSS = "#5f7a3a";
export const HORN = "#4a4743";
export const EYE = "#ffb02e";
export const TOOTH = "#d8d3c4";

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "gargoyle" });

  // Ledge
  b.part(new THREE.BoxGeometry(1.4, 0.2, 1.5), LEDGE, { at: [0, 0.1, -0.15], name: "ledge", bone: undefined });
  b.part(new THREE.BoxGeometry(1.5, 0.06, 1.6), STONE_DARK, { at: [0, 0.22, -0.15], name: "ledgeLip" });
  b.part(new THREE.BoxGeometry(0.5, 0.01, 0.4), MOSS, { at: [-0.5, 0.255, 0.2], name: "mossPatch" });

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.55, -0.2], aim: [0, 0.7, 0.0], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.68, 0.0], aim: [0, 0.85, 0.15], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.82, 0.14], aim: [0, 0.98, 0.3], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.98, 0.3], aim: [0, 1.0, 0.5], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.92, 0.42], aim: [0, 0.9, 0.6], role: "jaw" });

  // Torso, neck
  const torso = b.sweep(polyline([[0, 0.5, -0.3], [0, 0.6, -0.1], [0, 0.78, 0.12]]), [0.2, 0.25], {
    bone: [hips, chest], color: STONE, name: "torso", sides: 8,
  });
  b.along(torso, 5, (at) => b.spike(at, at, 0.08, 0.035, { color: STONE_DARK }));
  b.rod([0, 0.8, 0.1], [0, 0.98, 0.32], [0.15, 0.13], STONE, { bone: neck, name: "neckTube" });
  b.part(new THREE.BoxGeometry(0.36, 0.14, 0.3), STONE_DARK, { at: [0, 0.82, 0.05], bone: chest, name: "shoulderYoke" });

  // Head
  b.part(new THREE.BoxGeometry(0.32, 0.26, 0.3), STONE, { at: [0, 1.03, 0.4], bone: head, name: "head" });
  b.part(new THREE.BoxGeometry(0.21, 0.11, 0.2), STONE, { at: [0, 0.975, 0.57], bone: head, name: "muzzle" });
  b.part(new THREE.BoxGeometry(0.36, 0.05, 0.1), STONE_LIGHT, { at: [0, 1.14, 0.5], bone: head, name: "brow" });
  b.part(new THREE.BoxGeometry(0.17, 0.04, 0.2), STONE_DARK, { at: [0, 0.885, 0.55], bone: jaw, name: "jawLower" });
  b.part(new THREE.BoxGeometry(0.06, 0.04, 0.05), STONE, { at: [0, 0.97, 0.69], bone: head, name: "nose" });
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.ConeGeometry(0.014, 0.05, 5), TOOTH, {
      at: [-0.07 + i * 0.047, 0.915, 0.65], rotation: [180, 0, 0], bone: head,
    });
  }
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.016, 0.05, 5), TOOTH, { at: [s * 0.06, 0.92, 0.62], bone: jaw });
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), EYE, { at: [s * 0.09, 1.07, 0.55], bone: head, name: "eye" }), 1.4);
    b.part(new THREE.BoxGeometry(0.1, 0.03, 0.04), STONE_DARK, { at: [s * 0.09, 1.1, 0.56], bone: head });
    // horns
    b.sweep(bezier([s * 0.11, 1.12, 0.38], [s * 0.2, 1.3, 0.35], [s * 0.15, 1.4, 0.15]), [0.055, 0], {
      bone: head, color: HORN, caps: { start: "flat", end: "point" }, sides: 6,
    });
    // ears
    b.part(new THREE.ConeGeometry(0.05, 0.16, 4), STONE_DARK, {
      at: [s * 0.18, 1.1, 0.3], rotation: [0, 0, -s * 40], bone: head,
    });
    // cheek ridge
    b.part(new THREE.BoxGeometry(0.04, 0.05, 0.14), STONE_LIGHT, { at: [s * 0.17, 0.98, 0.5], bone: head });
  }

  // Limbs
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${n}`,
      polyline([[s * 0.27, 0.75, 0.1], [s * 0.33, 0.5, 0.28], [s * 0.28, 0.3, 0.45]]),
      { parent: chest, names: [`shoulder${n}`, `elbow${n}`, `hand${n}`], role: "arm" },
    );
    b.sweep(arm, [0.09, 0.06], { color: STONE, name: `arm${n}` });
    b.part(new THREE.SphereGeometry(0.12, 7, 5), STONE_DARK, { at: [s * 0.27, 0.75, 0.08], bone: chest, name: `shoulderBall${n}` });
    b.part(new THREE.BoxGeometry(0.16, 0.06, 0.2), STONE, { at: [s * 0.28, 0.285, 0.5], bone: arm.joints[2], name: `palm${n}` });
    for (let i = -1; i <= 1; i++) {
      b.spike([s * 0.28 + i * 0.05, 0.29, 0.6], [i * 0.15, -0.35, 1], 0.1, 0.022, { color: HORN, bone: arm.joints[2] });
    }

    const leg = b.chain(
      `leg${n}`,
      polyline([[s * 0.26, 0.5, -0.25], [s * 0.4, 0.4, 0.0], [s * 0.3, 0.28, -0.05]]),
      { parent: hips, names: [`hip${n}`, `knee${n}`, `ankle${n}`], role: "leg" },
    );
    b.sweep(leg, [0.12, 0.07], { color: STONE, name: `leg${n}` });
    b.part(new THREE.SphereGeometry(0.16, 7, 5), STONE, { at: [s * 0.3, 0.5, -0.27], bone: hips, name: `haunch${n}` });
    b.part(new THREE.BoxGeometry(0.15, 0.05, 0.28), STONE_DARK, { at: [s * 0.3, 0.285, 0.05], bone: leg.joints[2], name: `foot${n}` });
    for (let i = -1; i <= 1; i++) {
      b.spike([s * 0.3 + i * 0.045, 0.29, 0.17], [i * 0.12, -0.3, 1], 0.09, 0.02, { color: HORN, bone: leg.joints[2] });
    }

    // Wing
    const wing = b.joint(`wing${n}`, { parent: chest, at: [s * 0.2, 0.82, -0.02], aim: [s * 0.2, 1.3, -0.1], role: "wing" });
    const wp = b.extrude(
      [[0, 0], [0.55, -0.05], [0.6, 0.35], [0.42, 0.28], [0.34, 0.62], [0.2, 0.5], [0.1, 0.8], [0, 0.55]],
      { at: [s * 0.22, 0.84, -0.05], x: [0, 0, -1], y: [s * 0.35, 1, 0], thickness: 0.04, bevel: 0.008, color: STONE_DARK, bone: wing, name: `wing${n}` },
    );
    void wp;
    b.rod([s * 0.22, 0.84, -0.05], [s * 0.4, 1.5, -0.2], [0.035, 0.02], STONE, { bone: wing, name: `wingBone${n}` });
  }

  // Tail
  const tail = b.chain("tail", catmull([[0, 0.5, -0.38], [0, 0.4, -0.7], [0.2, 0.32, -0.95], [0.42, 0.3, -0.85]]), {
    parent: hips, role: "tail", names: ["tail1", "tail2", "tail3"],
  });
  b.sweep(tail, [0.1, 0.03], { color: STONE, name: "tail", caps: { end: "point" } });

  for (const add of STAGE2) add(b);
  return b.root;
}
