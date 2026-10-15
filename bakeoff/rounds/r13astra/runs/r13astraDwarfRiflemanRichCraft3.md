```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  paint,
  grain,
  mix,
  noise,
  svg,
  rng,
} from "agentic-3js-builder";
import type { Fill, Joint } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Bram Copperbraid, Ironpeak Rifleman",
  description:
    "A stout, hand-painted fantasy dwarf rifleman with monumental blue-and-gold armor, a copper-red braided beard, and an ornate, wide-mouthed blunderbuss. Built as a rigged primitive puppet in an open rest pose.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "BramCopperbraid", paintSize: 2048 });
  const random = rng(319);

  // A compact silhouette: heavy shoulders, a broad face, short legs, enormous boots.
  const C = {
    ink: "#24212d",
    recess: "#30252b",
    blue: "#285b89",
    blueLight: "#4a84ad",
    blueDark: "#19354e",
    gold: "#d8aa54",
    goldLight: "#f5d58b",
    leather: "#503330",
    leatherLight: "#896044",
    sole: "#292b35",
    skin: "#dc9c73",
    skinLight: "#f4bd8b",
    skinShadow: "#aa6252",
    nose: "#e8a07e",
    beard: "#ac4725",
    beardLight: "#df7837",
    beardDark: "#713322",
    ivory: "#eee0bd",
    iron: "#475564",
    silver: "#a9b9bf",
    wood: "#85432b",
  };

  const brass = metal("brass", {
    polish: 0.35,
    tarnish: 0.16,
    size: 0.09,
    seed: 4,
  });
  const brightBrass = metal("gilt", { polish: 0.35, tarnish: 0.06, seed: 7 });
  const steel = metal("steel", { polish: 0.22, tarnish: 0.22, size: 0.06 });
  const iron = metal("iron", { polish: 0.2, tarnish: 0.2 });
  const wood = grain("#593024", "#ad6137", {
    axis: "z",
    size: 0.018,
    seed: 3,
  });
  const leather = grain("#49302b", "#714b34", {
    axis: "y",
    size: 0.032,
    seed: 9,
  });
  const armor = paint((p, n) => {
    const v = 0.42 + 0.3 * n.y + 0.15 * n.z + 0.12 * noise(p, 0.045, 2);
    return mix("#1c3856", "#4685ad", v);
  });
  const cloth = paint((p, n) => {
    const weave = Math.sin(p.x * 720) * Math.sin(p.y * 720);
    return mix("#183b5c", "#346e94", 0.43 + n.y * 0.13 + weave * 0.035);
  });
  const skin = paint((_p, n) =>
    mix("#bd785e", "#efb489", 0.52 + n.y * 0.2 + n.z * 0.22),
  );
  const hair = grain("#943c22", "#c8672d", { size: 0.023, axis: "y", seed: 5 });
  const hairLight = grain("#ba5428", "#e18a42", {
    size: 0.018,
    axis: "y",
    seed: 8,
  });

  // Drawings: bold enough to read on the small, faceted pieces.
  const eyeTexture = svg(
    `<svg viewBox="0 0 128 64">
      <path d="M5 19 L115 9 L124 39 Q67 62 10 43Z" fill="#633e35"/>
      <path d="M10 23 L116 17 L114 38 Q66 51 15 38Z" fill="#fff0d3"/>
      <ellipse cx="70" cy="31" rx="16" ry="18" fill="#285978"/>
      <ellipse cx="70" cy="34" rx="11" ry="14" fill="#73c3cf"/>
      <ellipse cx="70" cy="30" rx="6" ry="15" fill="#1e2832"/>
      <path d="M9 20 L117 13" stroke="#3c2524" stroke-width="9"/>
      <circle cx="65" cy="25" r="4.2" fill="#ffffff"/>
      <path d="M20 48 Q67 58 106 45" fill="none" stroke="#a56250" stroke-width="5"/>
    </svg>`,
    { size: 256 },
  );

  const tabardTexture = svg(
    `<svg viewBox="0 0 160 220">
      <path d="M8 7 H152 V175 L80 212 L8 175Z" fill="#244e70"
        stroke="#e4ba66" stroke-width="7"/>
      <path d="M20 19 H140 V167 L80 197 L20 167Z" fill="none"
        stroke="#5487a4" stroke-width="3"/>
      <path d="M34 130 L55 91 L75 111 L96 72 L130 130Z" fill="#112f49"/>
      <path d="M30 128 L54 91 L76 111 L97 73 L132 128"
        fill="none" stroke="#e1c58c" stroke-width="6"/>
      <path d="M72 138 V70 H88 V138Z" fill="#c79345" stroke="#192c3c" stroke-width="4"/>
      <path d="M43 55 L111 55 L121 68 L111 82 H43 L34 68Z"
        fill="#f0d28a" stroke="#172e44" stroke-width="5"/>
      <path d="M46 61 H106" stroke="#fff0b5" stroke-width="4"/>
      <path d="M55 153 L80 168 L105 153" fill="none" stroke="#d3a14c" stroke-width="5"/>
      <circle cx="80" cy="184" r="4" fill="#f5d895"/>
    </svg>`,
    { size: 384 },
  );

  const engravingTexture = svg(
    `<svg viewBox="0 0 160 100">
      <path d="M7 8 H153 V92 H7Z" fill="none" stroke="#714b29" stroke-width="5"/>
      <path d="M14 16 H146 V84 H14Z" fill="none" stroke="#fff0ba" stroke-width="3"/>
      <path d="M24 50 L40 28 L62 50 L80 25 L98 50 L120 28 L138 50
        L120 72 L98 50 L80 75 L62 50 L40 72Z"
        fill="none" stroke="#825a30" stroke-width="5"/>
      <path d="M39 50 H122" stroke="#fbe4a2" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const buckleTexture = svg(
    `<svg viewBox="0 0 100 100">
      <path d="M8 8 H92 V92 H8Z" fill="#d6ac5b" stroke="#49392b" stroke-width="7"/>
      <path d="M19 19 H81 V81 H19Z" fill="#2b4456" stroke="#ffe4a0" stroke-width="4"/>
      <path d="M30 33 H70 V45 H56 V73 H44 V45 H30Z" fill="#edcf85"/>
      <path d="M25 25 L33 25 M67 25 L75 25 M25 75 L33 75 M67 75 L75 75"
        stroke="#a57c3c" stroke-width="4"/>
    </svg>`,
    { size: 192 },
  );

  const stitchTexture = svg(
    `<svg viewBox="0 0 64 160">
      <path d="M9 5 V155 M55 5 V155" stroke="#251d22" stroke-width="5"/>
      <path d="M13 6 V155 M51 6 V155" stroke="#d0a774" stroke-width="3"
        stroke-dasharray="7 7"/>
      <path d="M25 19 L40 13 M25 43 L40 37 M25 67 L40 61
        M25 91 L40 85 M25 115 L40 109 M25 139 L40 133"
        stroke="#a5794e" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const makerTexture = svg(
    `<svg viewBox="0 0 200 92">
      <path d="M4 15 L20 4 H180 L196 15 V77 L180 88 H20 L4 77Z"
        fill="#d2ac65" stroke="#593d2a" stroke-width="6"/>
      <path d="M15 19 H185 M15 73 H185" stroke="#f9e0a0" stroke-width="3"/>
      <text x="100" y="41" font-family="serif" font-size="21" font-weight="bold"
        text-anchor="middle" fill="#4d3325">IRONPEAK</text>
      <text x="100" y="64" font-family="serif" font-size="15"
        text-anchor="middle" fill="#5b3a27">No. 08 • FORGED</text>
    </svg>`,
    { size: 384 },
  );

  const runeTexture = svg(
    `<svg viewBox="0 0 80 160">
      <path d="M10 8 H70 V152 H10Z" fill="none" stroke="#75522d" stroke-width="5"/>
      <path d="M20 20 H60 M20 140 H60" stroke="#ffedb6" stroke-width="4"/>
      <path d="M40 31 V128 M40 35 L59 52 L40 72 L21 52Z
        M22 89 L40 105 L58 89 M25 122 L40 110 L55 122"
        fill="none" stroke="#533e2d" stroke-width="6"/>
      <path d="M44 35 V126" stroke="#f3d48c" stroke-width="2"/>
    </svg>`,
    { size: 256 },
  );

  // Skeleton first. All locations below are model-space meters.
  const hips = b.joint("hips", {
    at: [0, 0.58, 0],
    dir: [0, 1, 0],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [[0, 0.58, 0], [0, 0.78, -0.015], [0, 1.025, -0.025]],
    { parent: hips, names: ["spineLower", "chest", "chestTop"], role: "spine" },
  );
  const chest = spine.joints[1];
  const neck = b.joint("neck", {
    parent: spine.tip!,
    at: [0, 1.075, -0.005],
    dir: [0, 1, 0],
    role: "neck",
  });
  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.245, 0.015],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.16, 0.025],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const sides = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      [
        [s * 0.195, 0.575, 0],
        [s * 0.225, 0.345, 0.015],
        [s * 0.23, 0.155, 0.015],
      ],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [s * 0.23, 0, 0.085],
      },
    );
    const arm = b.chain(
      `arm${side}`,
      [
        [s * 0.335, 1.02, -0.015],
        [s * 0.655, 1.01, -0.005],
        [s * 0.895, 0.99, 0.015],
        [s * 1.005, 0.99, 0.025],
      ],
      {
        parent: chest,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
        role: "arm",
      },
    );
    const hand = arm.tip!;
    const digits = [0, 1, 2, 3].map((i) => {
      const z = -0.045 + i * 0.045;
      return b.chain(
        `finger${side}${i + 1}`,
        [
          [s * 1.025, 0.985, z],
          [s * (1.105 + (i === 1 ? 0.015 : 0)), 0.98, z],
          [s * (1.145 + (i === 1 ? 0.015 : 0)), 0.958, z],
        ],
        {
          parent: hand,
          names: [`finger${side}${i + 1}Base`, `finger${side}${i + 1}Tip`],
          role: "digit",
        },
      );
    });
    const thumb = b.chain(
      `thumb${side}`,
      [
        [s * 0.975, 0.985, 0.085],
        [s * 1.005, 0.945, 0.14],
        [s * 1.06, 0.93, 0.15],
      ],
      { parent: hand, role: "digit", count: 2 },
    );
    return { s, side, leg, arm, hand, digits, thumb };
  });

  const beardChains = [-1, 0, 1].map((s, i) =>
    b.chain(
      `beard${i + 1}`,
      [
        [s * 0.13, 1.115, 0.205],
        [s * 0.145, 0.965, 0.275],
        [s * 0.132, s === 0 ? 0.755 : 0.815, 0.245],
      ],
      {
        parent: jaw,
        names: [`beard${i + 1}Root`, `beard${i + 1}Tip`],
        role: "fan",
      },
    ),
  );

  const gunBone = b.joint("rifle", {
    parent: sides[1].hand,
    at: [-1.015, 0.97, 0.075],
    dir: [0, 0, 1],
    role: "hinge",
  });

  // Small authoring helpers: all geometry still enters through the builder.
  function box(
    name: string,
    at: number[],
    size: number[],
    color: Fill,
    bone: Joint,
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      name, at, bone, rotation,
    });
  }

  function ellipsoid(
    name: string,
    at: number[],
    size: number[],
    color: Fill,
    bone: Joint,
    segments = 10,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 6), color, {
      name, at, bone, scale: size, flat: true,
    });
  }

  function cylinder(
    name: string,
    at: number[],
    radius: number,
    length: number,
    color: Fill,
    bone: Joint,
    dir: number[] = [0, 0, 1],
    sides = 10,
  ) {
    return b.part(new THREE.CylinderGeometry(radius, radius, length, sides), color, {
      name, at, bone, dir,
    });
  }

  function drawing(
    name: string,
    at: number[],
    size: number[],
    texture: THREE.Texture,
    bone: Joint,
    dir: number[] = [0, 0, 1],
  ) {
    return b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
      name, at, bone, texture, dir, axis: "z",
    });
  }

  function stud(at: number[], bone: Joint, radius = 0.012, color: Fill = brightBrass) {
    return ellipsoid("hammeredRivet", at, [radius, radius, radius * 0.65], color, bone, 6);
  }

  function frontPlate(
    name: string,
    at: number[],
    outline: number[][],
    thickness: number,
    color: Fill,
    bone: Joint,
  ) {
    return b.extrude(outline, {
      name, at, x: [1, 0, 0], y: [0, 1, 0],
      thickness, bevel: Math.min(0.008, thickness * 0.2),
      color, bone,
    });
  }

  function bandBetween(
    name: string,
    a: number[],
    c: number[],
    radius: number,
    color: Fill,
    bone: Joint,
  ) {
    return b.rod(a, c, radius, { name, bone, color, sides: 8 });
  }

  // Torso: broad at the chest, short and thick at the waist.
  b.loft(
    [
      { at: [0, 0.535, 0], w: 0.5, h: 0.35 },
      { at: [0, 0.66, -0.005], w: 0.55, h: 0.4 },
      { at: [0, 0.88, -0.018], w: 0.66, h: 0.43 },
      { at: [0, 1.035, -0.025], w: 0.57, h: 0.35 },
    ],
    { name: "paddedBlueCoat", bone: spine, color: cloth, section: { ngon: 8 }, caps: "flat" },
  );

  box("backBreastplate", [0, 0.875, -0.2], [0.51, 0.265, 0.07], armor, chest);
  box("backPlateGoldSpine", [0, 0.88, -0.244], [0.058, 0.26, 0.026], brass, chest);
  for (const s of [1, -1]) {
    box("backShoulderStrap", [s * 0.2, 0.94, -0.214], [0.066, 0.2, 0.04], leather, chest);
    cylinder("collarRivet", [s * 0.2, 1.005, -0.24], 0.018, 0.014, brass, chest);
  }

  b.sweep(
    catmull([
      [-0.265, 0.995, 0.105],
      [-0.18, 1.075, 0.07],
      [0, 1.095, -0.04],
      [0.18, 1.075, 0.07],
      [0.265, 0.995, 0.105],
    ]),
    0.048,
    { name: "raisedCollar", color: C.blueDark, bone: chest, sides: 8 },
  );

  // A visible skirt and heraldic apron beneath the hanging beard.
  for (const s of [1, -1]) {
    frontPlate(
      "coatSkirt",
      [s * 0.19, 0.585, 0.015],
      [[-0.125, 0.055], [0.125, 0.055], [0.145, -0.16], [0.03, -0.21], [-0.13, -0.16]],
      0.29, cloth, hips,
    );
    box("skirtFrontBinding", [s * 0.29, 0.505, 0.172], [0.025, 0.19, 0.025], brass, hips, [0, 0, s * 6]);
  }
  frontPlate(
    "tabardGoldBorder",
    [0, 0.66, 0.218],
    [[-0.145, 0.07], [0.145, 0.07], [0.135, -0.18], [0, -0.235], [-0.135, -0.18]],
    0.027, brass, hips,
  );
  drawing("IronpeakHeraldry", [0, 0.548, 0.235], [0.262, 0.303], tabardTexture, hips);

  // Continuous belt around the waist, rectangular face and layered buckle.
  b.sweep(
    catmull(
      [
        [-0.275, 0.68, 0.12], [0, 0.68, 0.222], [0.275, 0.68, 0.12],
        [0.275, 0.68, -0.115], [0, 0.68, -0.205], [-0.275, 0.68, -0.115],
      ],
      { closed: true },
    ),
    () => [0.045, 0.025],
    { name: "waistBelt", bone: hips, color: leather, sides: 6 },
  );
  box("beltFront", [0, 0.682, 0.218], [0.5, 0.087, 0.038], leather, hips);
  box("massiveBuckle", [0, 0.684, 0.249], [0.145, 0.117, 0.034], brass, hips);
  drawing("buckleHammer", [0, 0.684, 0.268], [0.139, 0.111], buckleTexture, hips);
  for (const s of [1, -1]) {
    box("beltKeeper", [s * 0.19, 0.68, 0.245], [0.032, 0.096, 0.024], brass, hips);
    for (let k = 0; k < 2; k++) stud([s * (0.112 + k * 0.036), 0.684, 0.243], hips, 0.007);
  }

  // A little ammunition pouch belongs to the silhouette, not to the scenery.
  box("ammunitionPouch", [0.31, 0.64, 0.09], [0.145, 0.145, 0.13], leather, hips, [0, 0, -8]);
  box("pouchFlap", [0.31, 0.688, 0.165], [0.157, 0.074, 0.025], C.leatherLight, hips, [0, 0, -8]);
  drawing("pouchStitching", [0.31, 0.638, 0.18], [0.11, 0.11], stitchTexture, hips);
  box("pouchClasp", [0.31, 0.665, 0.186], [0.033, 0.05, 0.013], brass, hips);

  // Legs, plated kneecaps and very broad, flat-soled boots.
  for (const { s, side, leg } of sides) {
    b.sweep(leg, [0.125, 0.112, 0.09], {
      name: `trouser${side}`, color: C.blueDark, sides: 8,
    });
    const knee = leg.joints[1];
    const ankle = leg.tip!;
    const x = s * 0.23;

    ellipsoid("kneeLeather", [x, 0.345, 0.082], [0.13, 0.12, 0.1], leather, knee);
    frontPlate(
      "kneeGoldBorder", [x, 0.34, 0.17],
      [[-0.105, 0.065], [0, 0.105], [0.105, 0.065], [0.09, -0.065], [0, -0.105], [-0.09, -0.065]],
      0.034, brass, knee,
    );
    frontPlate(
      "kneeBlueEnamel", [x, 0.34, 0.192],
      [[-0.077, 0.048], [0, 0.077], [0.077, 0.048], [0.066, -0.045], [0, -0.077], [-0.066, -0.045]],
      0.023, armor, knee,
    );
    stud([x, 0.35, 0.211], knee, 0.022);

    box("bootSole", [x, 0.028, 0.086], [0.285, 0.056, 0.405], C.sole, ankle);
    box("bootWelt", [x, 0.063, 0.086], [0.281, 0.035, 0.397], C.leatherLight, ankle);
    box("bootFoot", [x, 0.133, 0.071], [0.256, 0.126, 0.35], leather, ankle);
    box("bootToeArmor", [x, 0.145, 0.21], [0.26, 0.133, 0.16], armor, ankle);
    box("toeGoldenEdge", [x, 0.109, 0.292], [0.268, 0.041, 0.025], brass, ankle);
    box("toeTopRidge", [x, 0.217, 0.213], [0.043, 0.018, 0.145], brass, ankle);
    box("bootAnkle", [x, 0.226, -0.016], [0.217, 0.182, 0.21], leather, ankle);
    box("bootCuff", [x, 0.294, -0.012], [0.246, 0.063, 0.248], C.leatherLight, ankle);
    box("shinPlate", [x, 0.244, 0.11], [0.155, 0.112, 0.036], armor, ankle);
    box("shinPlateEdge", [x, 0.297, 0.121], [0.17, 0.023, 0.034], brass, ankle);
    for (const dx of [-0.083, 0.083]) {
      stud([x + dx, 0.157, 0.296], ankle, 0.011);
      stud([x + dx, 0.29, 0.126], ankle, 0.01);
    }
    // Raised welt stitches, coarse rather than hairline detail.
    for (let i = 0; i < 5; i++) {
      box("bootWeltStitch", [x - 0.103 + i * 0.052, 0.064, 0.288],
        [0.014, 0.009, 0.008], C.ivory, ankle);
    }
  }

  // Arms are kept open for animation; the left palm and fingers remain separated.
  for (const { s, side, arm, hand, digits, thumb } of sides) {
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const wrist = arm.joints[2];
    b.sweep(arm, [0.132, 0.105, 0.082, 0.067], {
      name: `sleeve${side}`, color: cloth, sides: 8,
    });

    // Oversized shoulder domes, with front-facing framed heraldic panels.
    ellipsoid("pauldronShadow", [s * 0.425, 1.047, -0.005],
      [0.247, 0.183, 0.244], C.blueDark, shoulder);
    ellipsoid("pauldronBlueDome", [s * 0.425, 1.087, -0.005],
      [0.234, 0.165, 0.231], armor, shoulder);
    frontPlate(
      "pauldronGoldFrame", [s * 0.437, 1.058, 0.192],
      [[-0.18, 0.075], [-0.11, 0.135], [0.11, 0.135], [0.18, 0.075],
        [0.165, -0.055], [0, -0.105], [-0.165, -0.055]],
      0.045, brass, shoulder,
    );
    frontPlate(
      "pauldronInset", [s * 0.437, 1.058, 0.219],
      [[-0.147, 0.061], [-0.093, 0.108], [0.093, 0.108], [0.147, 0.061],
        [0.135, -0.038], [0, -0.078], [-0.135, -0.038]],
      0.026, armor, shoulder,
    );
    box("pauldronCenterBar", [s * 0.437, 1.077, 0.239], [0.047, 0.155, 0.022], brass, shoulder);
    drawing("pauldronRune", [s * 0.437, 1.079, 0.252], [0.042, 0.138], runeTexture, shoulder);
    for (const dx of [-0.12, 0.12]) {
      stud([s * 0.437 + dx, 1.111, 0.241], shoulder, 0.016);
      stud([s * 0.437 + dx, 1.031, 0.241], shoulder, 0.013);
    }

    // Two layered lames at the outer edge produce the familiar massive silhouette.
    for (let i = 0; i < 2; i++) {
      const x = s * (0.54 + i * 0.065);
      box("overlappingShoulderLame", [x, 1.03 - i * 0.038, 0],
        [0.12, 0.086, 0.37 - i * 0.035], armor, shoulder, [0, 0, -s * 12]);
      box("shoulderLameTrim", [x + s * 0.049, 1.025 - i * 0.038, 0],
        [0.025, 0.09, 0.375 - i * 0.035], brass, shoulder, [0, 0, -s * 12]);
    }
    b.sweep(
      catmull([
        [s * 0.31, 1.18, -0.15], [s * 0.36, 1.242, 0],
        [s * 0.39, 1.19, 0.16],
      ]),
      0.021, { name: "pauldronCrownRidge", bone: shoulder, color: brass, sides: 6 },
    );

    cylinder("elbowPivot", [s * 0.674, 1.016, 0.106], 0.071, 0.035, iron, elbow);
    cylinder("elbowHub", [s * 0.674, 1.016, 0.131], 0.042, 0.025, brass, elbow);
    cylinder("elbowPin", [s * 0.674, 1.016, 0.148], 0.016, 0.012, steel, elbow, [0, 0, 1], 6);

    bandBetween("bracerLeather", [s * 0.724, 1.004, 0.006],
      [s * 0.88, 0.992, 0.014], 0.102, leather, elbow);
    bandBetween("bracerRearRing", [s * 0.726, 1.004, 0.006],
      [s * 0.752, 1.002, 0.008], 0.111, brass, elbow);
    bandBetween("bracerWristRing", [s * 0.853, 0.995, 0.012],
      [s * 0.883, 0.992, 0.014], 0.102, brass, wrist);

    box("bracerEnamelPlate", [s * 0.802, 1.0, 0.103],
      [0.137, 0.141, 0.034], armor, elbow);
    box("bracerEngravedPanel", [s * 0.802, 1.0, 0.125],
      [0.107, 0.105, 0.014], brass, elbow);
    drawing("bracerKnotwork", [s * 0.802, 1.0, 0.134],
      [0.101, 0.099], engravingTexture, elbow);
    for (const yy of [0.95, 1.05]) stud([s * 0.802, yy, 0.142], elbow, 0.009);

    box("glovePalm", [s * 0.981, 0.985, 0.025],
      [0.157, 0.091, 0.197], leather, hand);
    box("gloveBackPlate", [s * 0.978, 1.04, 0.025],
      [0.129, 0.035, 0.16], armor, hand);
    box("gloveBackStripe", [s * 0.977, 1.062, 0.025],
      [0.031, 0.013, 0.158], brass, hand);

    digits.forEach((finger, i) => {
      b.sweep(finger, [0.024, 0.021, 0.018], {
        name: `gloveFinger${side}${i}`, color: leather, sides: 6,
      });
      ellipsoid("fingerKnuckle", [s * 1.083, 1.002, -0.045 + i * 0.045],
        [0.024, 0.018, 0.021], C.leatherLight, finger.joints[0], 6);
    });
    b.sweep(thumb, [0.031, 0.027, 0.02], {
      name: `gloveThumb${side}`, color: leather, sides: 6,
    });
  }

  // Face first: broad cheeks, deeply set eyes, a proud red nose and heavy brows.
  ellipsoid("neck", [0, 1.088, 0], [0.145, 0.13, 0.13], skin, neck);
  const skull = ellipsoid("broadDwarfSkull", [0, 1.275, 0.015],
    [0.235, 0.228, 0.198], skin, head, 12);
  ellipsoid("lowerJaw", [0, 1.153, 0.085], [0.183, 0.102, 0.144], skin, jaw);
  box("mouthShadow", [0, 1.145, 0.223], [0.15, 0.022, 0.016], C.recess, jaw);
  ellipsoid("lowerLip", [0, 1.126, 0.222], [0.071, 0.019, 0.023], C.skinShadow, jaw);

  for (const s of [1, -1]) {
    ellipsoid("ear", [s * 0.235, 1.28, 0.006], [0.065, 0.092, 0.044], skin, head, 8);
    ellipsoid("earHollow", [s * 0.259, 1.284, 0.037],
      [0.026, 0.052, 0.009], C.skinShadow, head, 8);
    ellipsoid("cheekPlane", [s * 0.14, 1.222, 0.137],
      [0.095, 0.075, 0.078], skin, head, 8);
    ellipsoid("eyeSocket", [s * 0.106, 1.304, 0.169],
      [0.086, 0.05, 0.042], C.skinShadow, head, 8);
    drawing("sternIceBlueEye", [s * 0.105, 1.303, 0.207],
      [0.126, 0.062], eyeTexture, head);

    // Small faceted lower lids frame rather than cover the drawn eyes.
    b.sweep(
      [[s * 0.052, 1.272, 0.201], [s * 0.112, 1.265, 0.209], [s * 0.165, 1.279, 0.189]],
      0.009, { name: "lowerEyeLid", color: C.skinLight, bone: head, sides: 5 },
    );
    b.sweep(
      [[s * 0.035, 1.338, 0.211], [s * 0.109, 1.355, 0.211], [s * 0.182, 1.35, 0.176]],
      [0.022, 0.032, 0.015],
      { name: "fierceCopperBrow", color: hairLight, bone: head, sides: 6 },
    );
    ellipsoid("templeSideburn", [s * 0.195, 1.217, 0.09],
      [0.06, 0.125, 0.08], hair, head, 8);
  }

  ellipsoid("noseBridge", [0, 1.281, 0.205], [0.052, 0.085, 0.062], skin, head, 8);
  ellipsoid("heroicBulbousNose", [0, 1.235, 0.264],
    [0.084, 0.064, 0.08], C.nose, head, 10);
  for (const s of [1, -1]) {
    ellipsoid("noseWing", [s * 0.061, 1.218, 0.246],
      [0.035, 0.03, 0.038], C.nose, head, 8);
    ellipsoid("nostril", [s * 0.045, 1.203, 0.283],
      [0.019, 0.011, 0.009], C.skinShadow, head, 6);
  }
  ellipsoid("noseHighlight", [-0.012, 1.257, 0.329],
    [0.035, 0.018, 0.008], C.skinLight, head, 8);

  // Helmet sits above the eyes: a blue octagonal bowl and solid gold bindings.
  b.lathe(
    [[0, 0], [0.233, 0], [0.246, 0.035], [0.229, 0.115],
      [0.17, 0.183], [0.08, 0.221], [0, 0.23]],
    {
      name: "blueSteelHelmet", at: [0, 1.366, 0.003],
      axis: [0, 1, 0], segments: 10, color: armor, bone: head,
    },
  );
  b.lathe(
    [[0.221, 0], [0.247, 0], [0.251, 0.038], [0.225, 0.038]],
    {
      name: "helmetGoldRim", at: [0, 1.365, 0.003],
      segments: 10, color: brass, bone: head,
    },
  );
  b.sweep(
    catmull([[0, 1.392, 0.24], [0, 1.53, 0.175], [0, 1.6, 0.015], [0, 1.53, -0.17], [0, 1.388, -0.234]]),
    () => [0.033, 0.017],
    { name: "helmetCentralBinding", bone: head, color: brass, section: "box" },
  );
  frontPlate(
    "helmetForeheadShield", [0, 1.435, 0.234],
    [[-0.068, 0.04], [0, 0.073], [0.068, 0.04], [0.056, -0.043], [0, -0.067], [-0.056, -0.043]],
    0.028, brightBrass, head,
  );
  drawing("helmetMakerRune", [0, 1.437, 0.251], [0.06, 0.104], runeTexture, head);
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const a = s * (0.35 + i * 0.34);
      stud([Math.sin(a) * 0.248, 1.386, Math.cos(a) * 0.248 + 0.003], head, 0.011);
    }
    frontPlate(
      "helmetTempleGuard", [s * 0.222, 1.33, 0.072],
      [[-0.035, 0.08], [0.035, 0.08], [0.041, -0.065], [0, -0.093], [-0.037, -0.056]],
      0.074, brass, head,
    );
    box("templeBlueInset", [s * 0.222, 1.332, 0.114],
      [0.042, 0.105, 0.019], armor, head);
    stud([s * 0.222, 1.366, 0.131], head, 0.012);
  }

  // Beard: a strong cut-paper silhouette under a modest number of broad locks.
  // The jaw carries the lower beard; the moustache remains on the upper face.
  frontPlate(
    "beardSilhouette", [0, 1.112, 0.155],
    [[-0.205, 0.105], [-0.246, 0.005], [-0.222, -0.13],
      [-0.15, -0.285], [-0.065, -0.34], [0, -0.365],
      [0.065, -0.34], [0.15, -0.285], [0.222, -0.13],
      [0.246, 0.005], [0.205, 0.105], [0.11, 0.045],
      [0, 0.015], [-0.11, 0.045]],
    0.145, hair, jaw,
  );

  for (const s of [1, -1]) {
    // Chunky swept cheek locks give the beard a wind-carved, heroic shape.
    for (let k = 0; k < 4; k++) {
      const x = s * (0.17 + k * 0.013);
      const y = 1.205 - k * 0.052;
      b.sweep(
        bezier(
          [x, y, 0.17],
          [s * (0.24 + k * 0.006), y - 0.04, 0.23],
          [s * (0.185 - k * 0.015), y - 0.145, 0.246],
        ),
        [0.05, 0.046, 0],
        {
          name: "broadCheekLock", bone: jaw,
          color: k % 2 ? hair : hairLight,
          sides: 5, caps: { start: "flat", end: "point" },
        },
      );
    }

    b.sweep(
      catmull([
        [s * 0.015, 1.179, 0.285],
        [s * 0.094, 1.167, 0.295],
        [s * 0.163, 1.125, 0.28],
        [s * 0.205, 1.143, 0.233],
      ]),
      [0.036, 0.051, 0.035, 0],
      { name: "sweepingMoustache", bone: head, color: hairLight, sides: 6 },
    );
    b.sweep(
      [[s * 0.032, 1.192, 0.313], [s * 0.097, 1.184, 0.33], [s * 0.159, 1.143, 0.31]],
      [0.008, 0.01, 0],
      { name: "moustacheCarvedRidge", bone: head, color: C.beardLight, sides: 5 },
    );
  }

  // Three individually riggable plaits. Interleaved wedges read as braids,
  // unlike a string of beads; each wedge has a broad face and a pointed end.
  beardChains.forEach((chain, i) => {
    const s = i - 1;
    const endY = s === 0 ? 0.755 : 0.815;
    const startY = 1.092;
    const steps = s === 0 ? 7 : 6;
    b.sweep(chain, [0.061, 0.058, 0.032], {
      name: "braidCore", color: C.beardDark, sides: 6,
    });

    for (let j = 0; j < steps; j++) {
      const t = j / (steps - 1);
      const yy = startY + (endY + 0.045 - startY) * t;
      const xx = s * (0.137 + 0.008 * Math.sin(t * Math.PI));
      const zz = 0.267 + Math.sin(t * Math.PI) * 0.035;
      const width = 0.046 * (1 - 0.25 * t);
      for (const q of [-1, 1]) {
        b.sweep(
          [
            [xx + q * width * 0.62, yy + 0.022, zz - 0.008],
            [xx + q * width * 0.29, yy, zz + 0.018],
            [xx - q * width * 0.48, yy - 0.028, zz + 0.014],
          ],
          [width * 0.64, width * 0.74, width * 0.28],
          {
            name: "interwovenBeardLock",
            bone: chain.jointAt(t),
            color: (j + (q > 0 ? 1 : 0)) % 2 ? hairLight : hair,
            sides: 5,
          },
        );
      }
    }

    const xx = s * 0.132;
    const cuffY = endY + 0.026;
    cylinder("braidGoldenCuff", [xx, cuffY, 0.257], 0.047, 0.058,
      brass, chain.joints[1], [0, 1, 0], 8);
    cylinder("braidCuffUpperLip", [xx, cuffY + 0.029, 0.257], 0.051, 0.013,
      brightBrass, chain.joints[1], [0, 1, 0], 8);
    cylinder("braidCuffLowerLip", [xx, cuffY - 0.029, 0.257], 0.049, 0.013,
      brightBrass, chain.joints[1], [0, 1, 0], 8);
    drawing("braidCuffRune", [xx, cuffY, 0.307], [0.032, 0.05],
      runeTexture, chain.joints[1]);
    b.sweep(
      [[xx, cuffY - 0.025, 0.257], [xx, cuffY - 0.072, 0.254], [xx + s * 0.009, cuffY - 0.096, 0.248]],
      [0.034, 0.027, 0],
      { name: "braidTassel", bone: chain.joints[1], color: hairLight, sides: 5 },
    );
  });

  // Blunderbuss: old walnut, thick steel, and a genuinely hollow flared muzzle.
  // It is out beside the face, supported by the right hand, pointing forward.
  const gx = -1.015;
  const gy = 1.075;

  b.extrude(
    [
      [-0.39, -0.085], [-0.39, 0.045], [-0.31, 0.07],
      [-0.115, 0.027], [0.04, 0.047], [0.34, 0.037],
      [0.35, -0.06], [0.075, -0.083], [-0.018, -0.147],
      [-0.095, -0.132], [-0.13, -0.067], [-0.29, -0.113],
    ],
    {
      name: "walnutRifleStock", at: [gx, gy - 0.05, 0.085],
      x: [0, 0, 1], y: [0, 1, 0],
      thickness: 0.125, bevel: 0.015, color: wood, bone: gunBone,
    },
  );
  box("stockButtPlate", [gx, gy - 0.075, -0.303],
    [0.147, 0.164, 0.029], brass, gunBone, [-7, 0, 0]);
  box("stockButtInset", [gx, gy - 0.072, -0.321],
    [0.106, 0.119, 0.014], iron, gunBone, [-7, 0, 0]);

  b.sweep(
    [[gx, gy, 0.035], [gx, gy, 0.53]],
    0.074,
    { name: "octagonalGunBarrel", color: iron, bone: gunBone, section: { ngon: 8 }, caps: "flat" },
  );
  b.sweep(
    [[gx, gy + 0.008, 0.34], [gx, gy + 0.008, 0.66]],
    [0.077, 0.104],
    { name: "bronzeBarrelSleeve", color: brass, bone: gunBone, sides: 8, caps: "flat" },
  );

  // A lathed shell, not a capped cone: the opening is visible from all angles.
  b.lathe(
    [
      [0.098, 0], [0.111, 0.06], [0.148, 0.18],
      [0.191, 0.285], [0.197, 0.317], [0.163, 0.317],
      [0.155, 0.278], [0.12, 0.177], [0.087, 0.062], [0.079, 0],
    ],
    {
      name: "flaredBlunderbussBell", at: [gx, gy + 0.008, 0.615],
      axis: [0, 0, 1], segments: 10, color: brass, bone: gunBone,
    },
  );
  b.lathe(
    [[0.164, 0], [0.201, 0], [0.201, 0.035], [0.164, 0.035]],
    {
      name: "thickMuzzleLip", at: [gx, gy + 0.008, 0.915],
      axis: [0, 0, 1], segments: 10, color: brightBrass, bone: gunBone,
    },
  );
  b.lathe(
    [[0.075, 0], [0.081, 0], [0.158, 0.27], [0.153, 0.27]],
    {
      name: "sootyInnerBarrel", at: [gx, gy + 0.008, 0.635],
      axis: [0, 0, 1], segments: 10, color: C.recess, bone: gunBone,
    },
  );
  cylinder("deepBoreShadow", [gx, gy + 0.008, 0.638],
    0.077, 0.006, "#171a20", gunBone);

  for (const z of [0.095, 0.315, 0.55]) {
    cylinder("barrelBand", [gx, gy, z], z > 0.5 ? 0.102 : 0.086,
      0.04, brass, gunBone);
    box("barrelBandLug", [gx, gy - 0.078, z], [0.108, 0.046, 0.044], brass, gunBone);
    for (const s of [-1, 1]) {
      cylinder("bandCrossPin", [gx + s * 0.091, gy - 0.015, z],
        0.012, 0.018, steel, gunBone, [1, 0, 0], 6);
    }
  }

  // Barrel crown ribs visually lead the eye toward the broad muzzle.
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const dx = Math.sin(a);
    const dy = Math.cos(a);
    b.sweep(
      [
        [gx + dx * 0.106, gy + 0.008 + dy * 0.106, 0.68],
        [gx + dx * 0.148, gy + 0.008 + dy * 0.148, 0.816],
        [gx + dx * 0.187, gy + 0.008 + dy * 0.187, 0.916],
      ],
      0.008,
      { name: "muzzleRaisedRib", bone: gunBone, color: C.goldLight, sides: 5 },
    );
  }

  // Lock, cock, pan, trigger and iron trigger guard.
  box("flintlockSidePlate", [gx - 0.075, gy - 0.023, 0.057],
    [0.028, 0.087, 0.21], brass, gunBone);
  cylinder("lockWheel", [gx - 0.098, gy + 0.01, 0.039],
    0.041, 0.016, iron, gunBone, [-1, 0, 0], 8);
  cylinder("lockWheelPin", [gx - 0.11, gy + 0.01, 0.039],
    0.013, 0.015, steel, gunBone, [-1, 0, 0], 6);

  b.sweep(
    [[gx - 0.092, gy + 0.015, 0.031], [gx - 0.097, gy + 0.099, 0.001],
      [gx - 0.098, gy + 0.142, 0.052]],
    [0.021, 0.018, 0.025],
    { name: "flintlockCock", color: iron, bone: gunBone, sides: 6 },
  );
  box("flintClamp", [gx - 0.098, gy + 0.14, 0.072],
    [0.054, 0.032, 0.066], steel, gunBone, [16, 0, 0]);
  box("flintStone", [gx - 0.098, gy + 0.119, 0.096],
    [0.043, 0.021, 0.037], C.recess, gunBone, [16, 0, 0]);
  box("powderPan", [gx - 0.093, gy + 0.019, 0.16],
    [0.065, 0.027, 0.068], brass, gunBone);
  box("frizzen", [gx - 0.093, gy + 0.075, 0.185],
    [0.048, 0.092, 0.024], iron, gunBone, [-15, 0, 0]);

  b.sweep(
    catmull([
      [gx, gy - 0.092, 0.035], [gx, gy - 0.177, 0.059],
      [gx, gy - 0.185, 0.165], [gx, gy - 0.108, 0.201],
    ]),
    0.013, { name: "triggerGuard", bone: gunBone, color: brass, sides: 6 },
  );
  b.sweep(
    bezier([gx, gy - 0.082, 0.112], [gx, gy - 0.158, 0.14], [gx, gy - 0.151, 0.1]),
    0.008, { name: "curvedTrigger", bone: gunBone, color: steel, sides: 6 },
  );

  box("rearSightBase", [gx, gy + 0.083, 0.155], [0.068, 0.023, 0.05], brass, gunBone);
  for (const s of [-1, 1]) {
    box("rearSightEar", [gx + s * 0.021, gy + 0.111, 0.155],
      [0.016, 0.039, 0.027], iron, gunBone);
  }
  box("frontSight", [gx, gy + 0.164, 0.825],
    [0.021, 0.048, 0.035], iron, gunBone);
  ellipsoid("frontSightBead", [gx, gy + 0.189, 0.825],
    [0.013, 0.013, 0.014], C.ivory, gunBone, 6);

  b.rod([gx, gy - 0.099, 0.215], [gx, gy - 0.099, 0.57], 0.013,
    { name: "ramrod", bone: gunBone, color: wood, sides: 6 });
  cylinder("ramrodCap", [gx, gy - 0.099, 0.576], 0.021, 0.035, brass, gunBone);

  drawing("rifleMakersPlate", [gx - 0.066, gy - 0.068, -0.175],
    [0.174, 0.077], makerTexture, gunBone, [-1, 0, 0]);
  drawing("rifleInnerMakersPlate", [gx + 0.066, gy - 0.068, -0.175],
    [0.174, 0.077], makerTexture, gunBone, [1, 0, 0]);
  for (const s of [-1, 1]) {
    for (const z of [-0.251, -0.099]) {
      cylinder("stockPlateScrew", [gx + s * 0.071, gy - 0.067, z],
        0.009, 0.009, steel, gunBone, [s, 0, 0], 6);
    }
  }

  // Broad sling, hanging below the gun and safely away from the character's face.
  b.sweep(
    catmull([
      [gx, gy - 0.116, -0.245],
      [gx, gy - 0.32, -0.1],
      [gx, gy - 0.35, 0.2],
      [gx, gy - 0.13, 0.44],
    ]),
    () => [0.025, 0.009],
    { name: "leatherGunSling", bone: gunBone, color: leather, section: "box" },
  );
  for (const z of [-0.245, 0.44]) {
    cylinder("slingMount", [gx, gy - 0.112, z], 0.026, 0.045,
      brass, gunBone, [1, 0, 0], 8);
  }
  box("slingBuckle", [gx, gy - 0.345, 0.17], [0.065, 0.027, 0.059], brass, gunBone);

  // Restrained, broad edge chips on large plates: visible wear, not visual noise.
  for (const { s, arm } of sides) {
    for (let i = 0; i < 4; i++) {
      const x = s * 0.437 + (random() - 0.5) * 0.22;
      const y = 1.035 + random() * 0.071;
      box("pauldronPaintChip", [x, y, 0.235],
        [0.012 + random() * 0.012, 0.004, 0.003],
        C.silver, arm.joints[0], [0, 0, -20 + random() * 40]);
    }
  }

  // Surface-seated helmet studs, kept on the actual dome rather than floating.
  const helmetSurface = b.surface(skull);
  for (const s of [-1, 1]) {
    const hit = helmetSurface.around([0, 1.275, 0.015]).at(s * 103, 3);
    if (hit) {
      b.stick(new THREE.CylinderGeometry(0.017, 0.017, 0.014, 8), brass, hit, {
        name: "templeStrapFastener", bone: head,
      });
    }
  }

  return b.root;
}
```