import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  bezier,
  polyline,
  paint,
  grain,
  mottle,
  mix,
  noise,
  svg,
} from "../../../../src/index";
import type { Joint, Fill, PointInput } from "../../../../src/index";
import {
  metal,
  gearGeometry,
  gaugeTexture,
  coil,
} from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Professor Pocketwhistle",
  description:
    "A rosy-nosed gnome inventor in an embroidered teal cap, with an ivory forked beard, open tinkering gloves, and a wonderfully over-equipped brass-and-leather gadget backpack. Staged on a little workshop floor.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Professor Pocketwhistle",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(7319);

  // ---------------------------------------------------------------------------
  // Skeleton: short, planted legs and fully separated, outstretched hands.
  // ---------------------------------------------------------------------------
  const hips = b.joint("hips", {
    at: [0, 0.52, 0],
    dir: [0, 1, 0],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [[0, 0.52, 0], [0, 0.68, 0], [0, 0.83, 0]],
    {
      parent: hips,
      names: ["waist", "chest", "shoulderCenter"],
      role: "spine",
    },
  );
  const neck = b.chain(
    "neck",
    [[0, 0.83, 0], [0, 0.96, 0.018]],
    {
      parent: spine.tip!,
      names: ["neckBase", "neckTop"],
      role: "neck",
    },
  );
  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.055, 0.035],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.967, 0.113],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const sides = [1, -1];
  const rigs = sides.map((s) => {
    const side = s === 1 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      [
        [s * 0.165, 0.51, 0],
        [s * 0.202, 0.325, 0.025],
        [s * 0.22, 0.185, 0.066],
      ],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [s * 0.22, 0.085, 0.12],
      },
    );
    const arm = b.chain(
      `arm${side}`,
      [
        [s * 0.247, 0.813, 0],
        [s * 0.46, 0.785, 0.018],
        [s * 0.66, 0.766, 0.035],
      ],
      {
        parent: spine.tip!,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        role: "arm",
      },
    );
    const hand = b.joint(`hand${side}`, {
      parent: arm.tip!,
      at: [s * 0.726, 0.768, 0.038],
      dir: [s, 0, 0],
      role: "arm",
    });
    const fingers = [];
    for (let i = 0; i < 4; i++) {
      const y = 0.814 - i * 0.031;
      const length = [0.075, 0.098, 0.09, 0.068][i];
      const finger = b.chain(
        `finger${side}${i + 1}`,
        [
          [s * 0.767, y, 0.043],
          [s * (0.797 + length * 0.32), y + (1.5 - i) * 0.009, 0.049],
          [s * (0.782 + length), y + (1.5 - i) * 0.019, 0.052],
        ],
        {
          parent: hand,
          names: [
            `finger${side}${i + 1}Base`,
            `finger${side}${i + 1}Middle`,
            `finger${side}${i + 1}Tip`,
          ],
          role: "digit",
        },
      );
      fingers.push(finger);
    }
    const thumb = b.chain(
      `thumb${side}`,
      [
        [s * 0.711, 0.728, 0.049],
        [s * 0.741, 0.687, 0.082],
        [s * 0.782, 0.673, 0.092],
      ],
      {
        parent: hand,
        names: [`thumb${side}Base`, `thumb${side}Middle`, `thumb${side}Tip`],
        role: "digit",
      },
    );
    return { s, side, leg, arm, hand, fingers, thumb };
  });

  const packBone = b.joint("backpack", {
    parent: spine.joints[1],
    at: [0, 0.715, -0.238],
    dir: [0, 1, 0],
  });
  const hatBone = b.joint("cap", {
    parent: head,
    at: [0, 1.23, 0.024],
    dir: [0, 1, 0],
  });
  const floorBone = b.joint("workshopFloor", {
    parent: hips,
    at: [0, 0, 0],
    dir: [0, 1, 0],
  });

  // ---------------------------------------------------------------------------
  // A restrained palette, with place-specific cloth, leather and metal wear.
  // ---------------------------------------------------------------------------
  const ink = "#292539";
  const cream = "#fff1cc";
  const brassFlat = "#d5a44f";
  const copperFlat = "#c37950";
  const mint = "#9becce";
  const plum = "#713b55";
  const rust = "#be6545";

  const brass = metal("brass", {
    polish: 0.5,
    tarnish: 0.22,
    verdigris: 0.12,
    seed: 7,
  });
  const copper = metal("copper", {
    polish: 0.3,
    verdigris: 0.13,
    tarnish: 0.3,
    seed: 8,
  });
  const steel = metal("steel", { polish: 0.3, tarnish: 0.25, seed: 2 });
  const wood = grain("#765344", "#956b52", {
    size: 0.045,
    axis: "x",
    seed: 5,
  });
  const leather = paint((p, n) => {
    const mottling = noise(p, 0.065, 12);
    return mix(
      "#492d3b",
      "#995a52",
      Math.min(1, 0.17 + mottling * 0.5 + Math.max(0, n.y) * 0.18),
    );
  });
  const bootLeather = paint((p, n) => {
    if (p.y < 0.125) return "#342b35";
    return mix("#49313b", "#80534c", 0.26 + noise(p, 0.045, 14) * 0.5 + n.y * 0.13);
  });
  const tealCloth = paint((p, n) => {
    const weave = Math.sin(p.x * 720) * Math.sin(p.y * 760) * 0.027;
    const wear = noise(p, 0.085, 3);
    return mix(
      "#18515d",
      "#378e85",
      Math.min(1, Math.max(0, 0.46 + n.y * 0.24 + wear * 0.25 + weave)),
    );
  });
  const waistcoat = paint((p, n) => {
    const weave = Math.sin(p.x * 560) * Math.sin(p.y * 600) * 0.012;
    return mix(
      "#bd873e",
      "#e9bd70",
      0.48 + n.y * 0.18 + noise(p, 0.12, 21) * 0.15 + weave,
    );
  });
  const trousers = mottle("#604056", "#82556a", { size: 0.11, seed: 32 });
  const skin = paint((p, n) =>
    mix("#d98773", "#ffcc9c", 0.55 + n.y * 0.15 + noise(p, 0.09, 6) * 0.18),
  );
  const hair = paint((p, n) => {
    const strands = Math.sin(p.x * 370 + Math.sin(p.y * 18)) * 0.025;
    return mix(
      "#d9c3a3",
      "#fff0d1",
      0.49 + n.y * 0.17 + n.z * 0.1 + strands,
    );
  });
  const paleHair = paint((p, n) => {
    const strands = Math.sin(p.x * 410 + Math.sin(p.y * 15)) * 0.019;
    return mix(
      "#ead7b8",
      "#fff6dc",
      0.57 + n.y * 0.17 + n.z * 0.08 + strands,
    );
  });

  // ---------------------------------------------------------------------------
  // Drawings: eyes, stitched cap badge, tailoring, labels and inventor's paper.
  // ---------------------------------------------------------------------------
  const drawing = (content: string, viewBox = "0 0 128 128", size = 256) =>
    svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${content}</svg>`, { size });

  const eyeTexture = drawing(`
    <ellipse cx="64" cy="65" rx="49" ry="53" fill="#382b38"/>
    <ellipse cx="64" cy="63" rx="43" ry="46" fill="#fff5d9"/>
    <ellipse cx="69" cy="66" rx="28" ry="35" fill="#316b62"/>
    <path d="M43 72 Q69 105 94 73 L94 94 Q68 115 43 94Z" fill="#8acbb0"/>
    <ellipse cx="69" cy="67" rx="15" ry="26" fill="#212936"/>
    <ellipse cx="56" cy="48" rx="10" ry="13" fill="#ffffff"/>
    <circle cx="81" cy="82" r="6" fill="#fff8de"/>
    <path d="M20 42 Q62 13 104 41" fill="none" stroke="#382b38"
      stroke-width="9" stroke-linecap="round"/>
  `);

  const capPatchTexture = drawing(`
    <path d="M64 5 L117 35 L114 97 L64 123 L12 96 L10 34Z"
      fill="#d6a24d" stroke="#342d3e" stroke-width="5"/>
    <path d="M64 13 L109 40 L107 91 L64 115 L20 91 L18 40Z"
      fill="#22636a" stroke="#fff0bf" stroke-width="3" stroke-dasharray="5 5"/>
    <circle cx="63" cy="64" r="25" fill="none" stroke="#f5d28a" stroke-width="8"/>
    <path d="M59 18 V35 M59 91 V108 M17 59 H35 M91 59 H109
      M31 29 L43 42 M85 86 L98 99 M31 98 L43 86 M85 42 L98 29"
      stroke="#f5d28a" stroke-width="7"/>
    <path d="M51 88 L77 42 L88 38 L90 51 L62 97Z"
      fill="#e9946c" stroke="#382d38" stroke-width="3"/>
    <circle cx="61" cy="64" r="6" fill="#fff2bf"/>
  `);

  const embroideryTexture = drawing(`
    <path d="M9 0 V160 M55 0 V160" stroke="#ffedbd" stroke-width="3"
      stroke-dasharray="5 6" fill="none"/>
    ${[23, 65, 107, 149].map((y) => `
      <path d="M32 ${y - 14} L45 ${y} L32 ${y + 14} L19 ${y}Z"
        fill="#3b746f" stroke="#ffe7a6" stroke-width="3"/>
      <circle cx="32" cy="${y}" r="5" fill="#df784f"/>
    `).join("")}
  `, "0 0 64 160");

  const labelTexture = drawing(`
    <rect x="4" y="4" width="184" height="92" rx="7"
      fill="#e9d9b0" stroke="#392d36" stroke-width="7"/>
    <rect x="13" y="13" width="166" height="74" rx="3"
      fill="none" stroke="#a57b4c" stroke-width="3"/>
    <text x="96" y="43" text-anchor="middle" font-family="serif"
      font-weight="bold" font-size="25" fill="#423238">GIZMO</text>
    <text x="96" y="70" text-anchor="middle" font-family="monospace"
      font-size="18" fill="#70533d">WORKS · 07</text>
    <circle cx="20" cy="20" r="3" fill="#44373a"/>
    <circle cx="172" cy="80" r="3" fill="#44373a"/>
  `, "0 0 192 100");

  const warningTexture = drawing(`
    <rect x="2" y="2" width="92" height="60" rx="4" fill="#f0c266"
      stroke="#342c36" stroke-width="4"/>
    <path d="M8 8 L18 8 L8 18 M8 32 L32 8 H43 L8 43 M8 55 L55 8 H65
      M77 8 L88 8 L38 56 H28 M52 56 L88 20 V31 L63 56
      M77 56 L88 45 V56Z" fill="#564037"/>
    <rect x="21" y="15" width="55" height="35" rx="3" fill="#f0c266"/>
    <path d="M52 19 L39 34 H49 L44 46 L60 29 H50Z" fill="#44333b"/>
  `, "0 0 96 64");

  const blueprintTexture = drawing(`
    <rect width="192" height="144" fill="#285769"/>
    ${Array.from({ length: 12 }, (_, i) =>
      `<path d="M${i * 16} 0 V144" stroke="#42778a" stroke-width="1.5"/>`,
    ).join("")}
    ${Array.from({ length: 9 }, (_, i) =>
      `<path d="M0 ${i * 16} H192" stroke="#42778a" stroke-width="1.5"/>`,
    ).join("")}
    <g fill="none" stroke="#d2eadb" stroke-width="3">
      <circle cx="71" cy="70" r="34"/><circle cx="71" cy="70" r="22"/>
      <path d="M37 70 H105 M71 36 V104 M107 51 H155 V89 H107
        M148 35 V108 M141 35 H155 M141 108 H155
        M33 119 H109 M33 113 V126 M109 113 V126"/>
      <path d="M46 45 L96 95 M46 95 L96 45"/>
    </g>
    <text x="121" y="130" font-family="monospace" font-size="12"
      fill="#e2eee0">MK. VII</text>
  `, "0 0 192 144", 384);

  const notebookTexture = drawing(`
    <rect width="128" height="160" fill="#e7d4a4"/>
    <rect x="7" y="8" width="114" height="144" fill="none"
      stroke="#9f7952" stroke-width="3"/>
    <g fill="none" stroke="#65503e" stroke-width="3">
      <circle cx="64" cy="59" r="28"/><circle cx="64" cy="59" r="12"/>
      <path d="M64 24 V94 M29 59 H99 M45 37 L83 81 M45 81 L83 37
        M23 110 H104 M23 121 H92 M23 132 H98"/>
    </g>
    <text x="64" y="17" text-anchor="middle" font-family="serif"
      font-size="10" fill="#624633">POCKET ENGINE</text>
  `, "0 0 128 160");

  const gauge = gaugeTexture({ needle: 48, label: "PUFF", size: 256 });
  const nameplateTexture = drawing(`
    <rect x="3" y="3" width="314" height="74" rx="9"
      fill="#264953" stroke="#edcb80" stroke-width="5"/>
    <path d="M17 20 H43 M17 60 H43 M277 20 H303 M277 60 H303"
      stroke="#b88f56" stroke-width="3"/>
    <text x="160" y="36" text-anchor="middle" font-family="serif"
      font-weight="bold" font-size="23" fill="#fff0c5">POCKETWHISTLE</text>
    <text x="160" y="59" text-anchor="middle" font-family="monospace"
      font-size="14" fill="#adcfbf">INVENTOR · FIELD KIT VII</text>
  `, "0 0 320 80", 512);

  // ---------------------------------------------------------------------------
  // Reusable low-poly placement helpers.
  // ---------------------------------------------------------------------------
  function ell(
    at: PointInput,
    size: number[],
    color: Fill,
    bone: Joint,
    name?: string,
  ) {
    return b.part(new THREE.SphereGeometry(1, 12, 8), color, {
      at,
      scale: size,
      bone,
      flat: true,
      name,
    });
  }

  function box(
    at: PointInput,
    size: number[],
    color: Fill,
    bone: Joint,
    name?: string,
    rotation?: number[],
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at, bone, name, rotation,
    });
  }

  function pin(at: PointInput, radius: number, bone: Joint, color: Fill = brass) {
    return b.part(new THREE.SphereGeometry(radius, 6, 4), color, {
      at, bone, flat: true,
    });
  }

  function tube(
    a: PointInput,
    c: PointInput,
    radius: number,
    color: Fill,
    bone: Joint,
  ) {
    return b.rod(a, c, radius, { color, bone, sides: 8, smooth: false });
  }

  function torus(
    at: PointInput,
    radius: number,
    thickness: number,
    color: Fill,
    bone: Joint,
    dir: number[] = [0, 0, 1],
  ) {
    return b.part(new THREE.TorusGeometry(radius, thickness, 4, 12), color, {
      at, bone, dir, axis: "z", flat: true,
    });
  }

  function imagePlane(
    at: PointInput,
    size: number[],
    texture: THREE.Texture,
    bone: Joint,
    dir: number[] = [0, 0, 1],
    rotation?: number[],
  ) {
    return b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
      at, bone, texture, dir, axis: "z", rotation,
    });
  }

  function beardLock(
    at: PointInput,
    width: number,
    length: number,
    lean: number,
    color: Fill,
    bone: Joint,
  ) {
    const lock = b.extrude(
      [
        [-width * 0.5, 0],
        [width * 0.38, -0.005],
        [width * 0.57, length * 0.31],
        [width * 0.28, length * 0.72],
        [0, length],
        [-width * 0.36, length * 0.68],
        [-width * 0.6, length * 0.23],
      ],
      {
        at,
        x: [1, 0, 0],
        y: [lean, -1, 0.13],
        thickness: [0.038, 0.012],
        bevel: 0.004,
        color,
        bone,
      },
    );
    return lock;
  }

  function seam(a: PointInput, c: PointInput, bone: Joint, color: Fill = cream) {
    return tube(a, c, 0.003, color, bone);
  }

  // ---------------------------------------------------------------------------
  // Workshop vignette: a small chamfered dais and individual floorboards.
  // ---------------------------------------------------------------------------
  b.part(new THREE.CylinderGeometry(0.9, 0.93, 0.055, 12), "#30313d", {
    at: [0, 0.0275, -0.045],
    scale: [1, 1, 0.68],
    bone: floorBone,
    flat: true,
    name: "workshop plinth",
  });
  b.part(new THREE.CylinderGeometry(0.887, 0.9, 0.025, 12), brass, {
    at: [0, 0.0625, -0.045],
    scale: [1, 1, 0.68],
    bone: floorBone,
    flat: true,
  });

  for (let i = 0; i < 7; i++) {
    const z = -0.475 + i * 0.145;
    const halfLength = Math.sqrt(Math.max(0.1, 0.83 ** 2 - (z / 0.69) ** 2));
    box(
      [0, 0.079, z],
      [halfLength * 2, 0.014, 0.138],
      wood,
      floorBone,
      `floorboard ${i + 1}`,
    );
    for (const s of sides) {
      pin([s * (halfLength - 0.044), 0.088, z + 0.036], 0.008, floorBone, ink);
    }
  }

  // A blueprint and a few small spare parts remain beside, not before, the feet.
  imagePlane([0.49, 0.091, 0.26], [0.24, 0.18], blueprintTexture, floorBone, [0, 1, 0]);
  b.part(gearGeometry({ teeth: 16, radius: 0.057, thickness: 0.014, spokes: 4 }), brass, {
    at: [-0.48, 0.096, 0.29],
    bone: floorBone,
  });
  pin([-0.48, 0.11, 0.29], 0.015, floorBone, steel);
  tube([-0.59, 0.096, 0.19], [-0.67, 0.096, 0.32], 0.01, steel, floorBone);
  box([-0.66, 0.099, 0.32], [0.065, 0.025, 0.032], copper, floorBone, "spare key bow");
  for (let i = 0; i < 3; i++) {
    pin([0.52 + i * 0.045, 0.096, -0.36], 0.013, floorBone, copper);
  }

  box([0, 0.04, 0.565], [0.354, 0.057, 0.031], brass, floorBone, "inventor nameplate frame");
  imagePlane([0, 0.041, 0.582], [0.326, 0.048], nameplateTexture, floorBone);
  for (const s of sides) {
    pin([s * 0.164, 0.04, 0.585], 0.005, floorBone, copper);
  }

  // ---------------------------------------------------------------------------
  // Torso: a gold waistcoat inside a teal, scalloped workshop jacket.
  // ---------------------------------------------------------------------------
  const torso = b.loft(
    [
      { at: [0, 0.46, 0], w: 0.46, h: 0.32 },
      { at: [0, 0.58, 0], w: 0.5, h: 0.35 },
      { at: [0, 0.72, 0], w: 0.47, h: 0.33 },
      { at: [0, 0.83, 0], w: 0.43, h: 0.29 },
    ],
    {
      bone: spine,
      color: tealCloth,
      sides: 10,
      smooth: false,
      caps: "flat",
      name: "tailored jacket",
    },
  );
  b.sweep(neck, 0.076, { color: skin, sides: 8 });

  for (const s of sides) {
    b.extrude(
      [
        [0, 0],
        [0.139, 0],
        [0.177, 0.226],
        [0.082, 0.322],
        [0.021, 0.285],
      ],
      {
        at: [s * 0.018, 0.485, 0.166],
        x: [s, 0, 0],
        y: [0, 1, -0.085],
        thickness: 0.038,
        bevel: 0.003,
        color: waistcoat,
        bone: spine.joints[0],
        name: `waistcoat panel ${s}`,
      },
    );
    b.extrude(
      [[0, 0], [0.075, 0.025], [0.102, 0.169], [0.03, 0.215]],
      {
        at: [s * 0.148, 0.637, 0.166],
        x: [s, 0, 0],
        y: [0, 1, -0.1],
        thickness: 0.041,
        bevel: 0.004,
        color: tealCloth,
        bone: spine.joints[1],
        name: "turned jacket lapel",
      },
    );
    imagePlane(
      [s * 0.113, 0.595, 0.179],
      [0.033, 0.145],
      embroideryTexture,
      spine.joints[0],
    );
    box([s * 0.169, 0.56, 0.176], [0.096, 0.05, 0.03], leather, spine.joints[0]);
    seam(
      [s * 0.125, 0.587, 0.195],
      [s * 0.208, 0.587, 0.19],
      spine.joints[0],
      brassFlat,
    );
    pin([s * 0.166, 0.564, 0.197], 0.009, spine.joints[0], brass);
  }

  for (let i = 0; i < 4; i++) {
    pin([0, 0.542 + i * 0.062, 0.193 - i * 0.004], 0.012, spine.joints[0], brass);
  }

  const torsoSurface = b.surface(torso);
  const beltPath = torsoSurface.loop([0, 0.511, 0], { lift: 0.009 });
  b.sweep(beltPath, 0.022, {
    color: leather,
    sides: 6,
    smooth: false,
    bone: hips,
    name: "jacket belt",
  });
  box([0, 0.511, 0.211], [0.084, 0.061, 0.021], brass, hips, "belt buckle");
  box([0, 0.511, 0.224], [0.058, 0.035, 0.008], ink, hips);
  tube([-0.025, 0.511, 0.23], [0.035, 0.511, 0.23], 0.005, brass, hips);
  b.along(beltPath, 12, (at) => b.stick(
    new THREE.SphereGeometry(0.008, 6, 4),
    brass,
    at,
    { embed: 0.5, bone: hips },
  ));

  // Belt pouch and a pocket watch add a small asymmetry below the beard.
  box([0.259, 0.473, 0.073], [0.1, 0.122, 0.084], leather, hips, "parts pouch");
  box([0.26, 0.523, 0.092], [0.108, 0.03, 0.089], plum, hips);
  pin([0.263, 0.506, 0.142], 0.011, hips, brass);
  b.part(new THREE.CylinderGeometry(0.033, 0.033, 0.041, 12), brass, {
    at: [-0.178, 0.588, 0.191],
    dir: [0, 0, 1],
    bone: spine.joints[0],
    flat: true,
    name: "pocket watch case",
  });
  torus([-0.178, 0.588, 0.21], 0.033, 0.007, brass, spine.joints[0]);
  b.part(new THREE.CircleGeometry(0.028, 12), cream, {
    at: [-0.178, 0.588, 0.212], bone: spine.joints[0],
  });
  tube([-0.178, 0.588, 0.216], [-0.183, 0.608, 0.216], 0.0025, ink, spine.joints[0]);
  tube([-0.178, 0.588, 0.216], [-0.165, 0.583, 0.216], 0.0025, ink, spine.joints[0]);
  b.sweep(
    bezier([-0.179, 0.629, 0.193], [-0.238, 0.63, 0.211], [-0.223, 0.535, 0.202]),
    0.004,
    { color: brass, bone: spine.joints[0], sides: 6 },
  );

  // ---------------------------------------------------------------------------
  // Legs, oversized cobbler's boots, rolled sleeves and fingerless gloves.
  // ---------------------------------------------------------------------------
  for (const rig of rigs) {
    const { s, side, leg, arm, hand, fingers, thumb } = rig;

    b.sweep(leg, [0.103, 0.087, 0.066], {
      color: trousers,
      sides: 8,
      smooth: false,
      skin: "rigid",
      name: `trousers ${side}`,
    });
    box(
      [s * 0.202, 0.322, 0.11],
      [0.111, 0.075, 0.018],
      leather,
      leg.joints[1],
      "knee reinforcement",
      [0, 0, s * -7],
    );
    for (const d of [-1, 1]) {
      seam(
        [s * 0.202 + d * 0.044, 0.295, 0.124],
        [s * 0.202 + d * 0.044, 0.348, 0.124],
        leg.joints[1],
        "#d3aa81",
      );
    }

    const foot = leg.tip!;
    box([s * 0.225, 0.115, 0.136], [0.205, 0.06, 0.313], ink, foot, `sole ${side}`);
    ell([s * 0.225, 0.164, 0.162], [0.11, 0.079, 0.163], bootLeather, foot, `boot ${side}`);
    b.lathe(
      [[0, 0], [0.073, 0], [0.084, 0.026], [0.083, 0.113], [0.075, 0.126], [0, 0.126]],
      { at: [s * 0.22, 0.172, 0.047], color: bootLeather, bone: foot, segments: 8 },
    );
    b.lathe(
      [[0.069, 0], [0.094, 0], [0.096, 0.042], [0.07, 0.039]],
      { at: [s * 0.22, 0.265, 0.047], color: leather, bone: foot, segments: 8 },
    );
    box([s * 0.22, 0.252, 0.129], [0.079, 0.022, 0.018], copper, foot);
    box([s * 0.22, 0.252, 0.142], [0.031, 0.034, 0.01], brass, foot);
    box([s * 0.22, 0.252, 0.149], [0.015, 0.018, 0.006], ink, foot);

    for (let j = 0; j < 3; j++) {
      const y = 0.194 + j * 0.02;
      const z = 0.218 - j * 0.035;
      seam([s * 0.22 - 0.034, y, z], [s * 0.22 + 0.034, y + 0.007, z], foot, cream);
    }
    for (const dx of [-0.083, 0.083]) {
      pin([s * 0.225 + dx, 0.131, 0.235], 0.006, foot, brass);
    }

    b.sweep(arm, [0.101, 0.078, 0.058], {
      from: 0,
      to: 0.79,
      color: tealCloth,
      sides: 8,
      skin: "rigid",
      smooth: false,
      name: `sleeve ${side}`,
    });
    b.sweep(arm, [0.066, 0.057], {
      from: 0.73,
      to: 1,
      color: skin,
      sides: 8,
      name: `forearm ${side}`,
    });

    const cuffCenter = [s * 0.571, 0.775, 0.03];
    b.part(new THREE.CylinderGeometry(0.082, 0.079, 0.071, 8), leather, {
      at: cuffCenter, dir: [s, -0.08, 0.06], bone: arm.joints[1], flat: true,
      name: "rolled sleeve cuff",
    });
    for (const dx of [-0.032, 0.032]) {
      b.part(new THREE.CylinderGeometry(0.083, 0.083, 0.008, 8), waistcoat, {
        at: [s * (0.571 + dx), 0.775, 0.03],
        dir: [s, -0.08, 0.06],
        bone: arm.joints[1],
        flat: true,
      });
    }
    pin([s * 0.581, 0.789, 0.111], 0.012, arm.joints[1], brass);
    ell([s * 0.71, 0.769, 0.037], [0.075, 0.062, 0.041], skin, hand, "open palm");
    ell([s * 0.714, 0.771, 0.015], [0.067, 0.065, 0.034], leather, hand, "fingerless glove");
    box([s * 0.711, 0.771, 0.065], [0.07, 0.061, 0.012], leather, hand);
    seam([s * 0.68, 0.802, 0.072], [s * 0.74, 0.802, 0.072], hand, "#d3aa81");
    pin([s * 0.69, 0.772, 0.077], 0.01, hand, copper);

    for (let i = 0; i < fingers.length; i++) {
      const finger = fingers[i];
      b.sweep(finger, [0.014, 0.013, 0.011], {
        color: skin,
        sides: 6,
        smooth: false,
        name: `exposed finger ${side}${i + 1}`,
      });
      b.sweep(finger, 0.016, {
        from: 0,
        to: 0.22,
        color: leather,
        sides: 6,
        caps: "flat",
      });
      const tip = finger.tip!;
      const nailAt = tip.at.clone().add(new THREE.Vector3(-s * 0.012, 0, 0.010));
      ell(nailAt, [0.013, 0.008, 0.004], "#ffe1b2", tip);
    }
    b.sweep(thumb, [0.018, 0.014, 0.012], {
      color: skin,
      sides: 6,
      smooth: false,
    });
    const thumbTip = thumb.tip!;
    ell(
      thumbTip.at.clone().add(new THREE.Vector3(-s * 0.008, 0, 0.009)),
      [0.012, 0.008, 0.004],
      "#ffe1b2",
      thumbTip,
    );
  }

  // ---------------------------------------------------------------------------
  // Face first: bright eyes, a spectacular nose, pointed ears and hinged jaw.
  // ---------------------------------------------------------------------------
  const H = 1.07;
  const face = b.region({ at: head.at, scale: H, bone: head });
  const hp = (x: number, y: number, z: number) => face.p([x, y, z]);

  const skull = ell(hp(0, 0.003, 0), [0.196 * H, 0.192 * H, 0.157 * H], skin, head, "rosy face");
  ell(hp(0, -0.013, -0.088), [0.194, 0.175, 0.12], hair, head, "back of hair");

  for (const s of sides) {
    b.extrude(
      [[0, -0.05], [0.079, -0.029], [0.111, 0.036], [0.023, 0.071], [-0.01, 0.028]],
      {
        at: hp(s * 0.178, 0.014, -0.004),
        x: [s, 0, -0.23],
        y: [0, 1, 0],
        thickness: 0.058,
        bevel: 0.007,
        color: skin,
        bone: head,
        name: "pointed gnome ear",
      },
    );
    b.extrude(
      [[0, -0.028], [0.052, -0.012], [0.072, 0.024], [0.012, 0.041]],
      {
        at: hp(s * 0.195, 0.017, 0.019),
        x: [s, 0, -0.23],
        y: [0, 1, 0],
        thickness: 0.007,
        color: "#d77975",
        bone: head,
      },
    );

    ell(hp(s * 0.125, -0.054, 0.092), [0.063, 0.049, 0.035], "#eda080", head, "cheek");
    const eye = ell(hp(s * 0.083, 0.039, 0.125), [0.057, 0.058, 0.028], cream, head, "eye white");
    b.decal(eye, eyeTexture, {
      at: hp(s * 0.083, 0.039, 0.155),
      dir: [0, 0, 1],
      size: [0.102, 0.11],
      segments: 8,
      mirror: s === 1,
      lift: 0.0015,
      bone: head,
      name: "hand-drawn bright eye",
    });

    b.sweep(
      bezier(
        hp(s * 0.037, 0.099, 0.132),
        hp(s * 0.087, 0.123, 0.15),
        hp(s * 0.14, 0.1, 0.116),
      ),
      [0.024, 0.03, 0.012],
      { color: paleHair, sides: 6, bone: head, smooth: false, name: "bushy eyebrow" },
    );
    beardLock(hp(s * 0.17, 0.015, 0.055), 0.054, 0.12, s * 0.13, hair, head);
    for (let i = 0; i < 3; i++) {
      pin(hp(s * (0.121 + i * 0.014), -0.045 - (i % 2) * 0.009, 0.13), 0.004, head, rust);
    }
  }

  // Upper muzzle stays with the skull; lips and the full beard belong to the jaw.
  ell(hp(0, -0.02, 0.184), [0.095, 0.074, 0.087], skin, head, "large tinkerer nose");
  ell(hp(0, -0.043, 0.211), [0.079, 0.06, 0.065], "#efa18a", head, "rosy nose tip");
  for (const s of sides) {
    ell(hp(s * 0.048, -0.065, 0.237), [0.019, 0.012, 0.009], "#ad6263", head, "nostril");
  }
  ell([0, 0.945, 0.19], [0.091, 0.018, 0.031], "#613b42", jaw, "mouth opening");
  ell([0, 0.929, 0.19], [0.078, 0.013, 0.026], "#da8b77", jaw, "lower lip");
  ell([0, 0.918, 0.141], [0.098, 0.055, 0.064], skin, jaw, "lower jaw");

  // Ivory beard: a simple volume dressed with broad, visibly primitive locks.
  ell([0, 0.852, 0.149], [0.158, 0.179, 0.091], hair, jaw, "beard silhouette");
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.039;
    const y = 0.977 - Math.abs(i) * 0.012;
    const z = 0.197 - Math.abs(i) * 0.004;
    beardLock(
      [x, y, z],
      0.073 - Math.abs(i) * 0.003,
      0.202 - Math.abs(i) * 0.019 + (i % 2 === 0 ? 0.008 : 0),
      i * 0.1,
      i % 2 === 0 ? paleHair : hair,
      jaw,
    );
  }
  const lowerLocks = [
    { x: -0.093, y: 0.866, width: 0.063, length: 0.132, lean: -0.2 },
    { x: -0.045, y: 0.889, width: 0.075, length: 0.185, lean: -0.11 },
    { x: 0.015, y: 0.864, width: 0.082, length: 0.196, lean: 0.03 },
    { x: 0.073, y: 0.883, width: 0.071, length: 0.161, lean: 0.15 },
    { x: 0.117, y: 0.855, width: 0.054, length: 0.119, lean: 0.22 },
  ];
  for (let i = 0; i < lowerLocks.length; i++) {
    const lock = lowerLocks[i];
    beardLock(
      [lock.x, lock.y, 0.226 + (i % 2) * 0.008],
      lock.width,
      lock.length,
      lock.lean,
      i % 2 === 0 ? paleHair : hair,
      jaw,
    );
  }
  for (const s of sides) {
    // Two braided side locks repeat the metal-band motif of the backpack.
    for (let j = 0; j < 4; j++) {
      ell(
        [s * (0.126 + (j % 2 ? 0.009 : -0.004)), 0.897 - j * 0.035, 0.186],
        [0.033, 0.031, 0.027],
        j % 2 === 0 ? hair : paleHair,
        jaw,
      );
    }
    b.part(new THREE.CylinderGeometry(0.028, 0.027, 0.023, 8), brass, {
      at: [s * 0.132, 0.769, 0.192],
      bone: jaw,
      flat: true,
    });
    beardLock([s * 0.132, 0.76, 0.187], 0.044, 0.066, s * 0.25, paleHair, jaw);

    b.sweep(
      bezier(
        hp(s * 0.018, -0.091, 0.192),
        hp(s * 0.105, -0.086, 0.225),
        hp(s * 0.156, -0.074, 0.173),
        hp(s * 0.171, -0.049, 0.156),
      ),
      [0.032, 0.039, 0.026, 0.006],
      {
        color: paleHair,
        bone: head,
        sides: 7,
        smooth: false,
        name: "swept moustache",
      },
    );
  }

  // A pencil tucked behind the left ear: a yellow hexagonal barrel,
  // real sharpened wood, graphite point, ferrule and worn pink eraser.
  const pencilBase = hp(0.193, -0.015, -0.019);
  const pencilShoulder = hp(0.212, 0.191, -0.027);
  const pencilWoodTip = hp(0.216, 0.226, -0.028);
  const pencilTip = hp(0.217, 0.239, -0.029);
  b.rod(pencilBase, pencilShoulder, 0.012, {
    color: "#e6b44c",
    bone: head,
    section: { ngon: 6 },
    smooth: false,
    name: "tucked carpenter pencil",
  });
  b.rod(
    hp(0.191, -0.038, -0.018),
    hp(0.194, -0.005, -0.019),
    0.014,
    { color: brass, bone: head, sides: 6, smooth: false },
  );
  b.rod(
    hp(0.189, -0.061, -0.017),
    hp(0.191, -0.039, -0.018),
    0.013,
    { color: "#dc8d85", bone: head, sides: 6, smooth: false },
  );
  b.rod(pencilShoulder, pencilWoodTip, [0.012, 0.004], {
    color: "#e9cea0", bone: head, sides: 6, smooth: false,
  });
  b.spike(pencilWoodTip, pencilTip, null, 0.004, {
    color: ink, bone: head, sides: 6,
  });

  // ---------------------------------------------------------------------------
  // Whimsical cap: broad brim, bent cone, stitched badge and forehead goggles.
  // ---------------------------------------------------------------------------
  b.lathe(
    [
      [0, 0],
      [0.222, 0],
      [0.248, 0.018],
      [0.249, 0.049],
      [0.216, 0.07],
      [0, 0.07],
    ],
    {
      at: [0, 1.214, 0.023],
      color: tealCloth,
      bone: hatBone,
      segments: 12,
      name: "rolled cap brim",
    },
  );
  b.lathe(
    [[0.219, 0], [0.25, 0], [0.25, 0.012], [0.219, 0.012]],
    { at: [0, 1.231, 0.023], color: waistcoat, bone: hatBone, segments: 12 },
  );
  const cap = b.sweep(
    catmull([
      [0, 1.259, 0.024],
      [-0.018, 1.355, 0.018],
      [-0.064, 1.452, 0.012],
      [-0.123, 1.528, 0.005],
      [-0.19, 1.553, 0.01],
      [-0.232, 1.523, 0.027],
    ]),
    [0.207, 0.165, 0.112, 0.061, 0.034, 0.009],
    {
      color: tealCloth,
      bone: hatBone,
      sides: 10,
      smooth: false,
      caps: "flat",
      name: "crooked pointed cap",
    },
  );
  b.decal(cap, capPatchTexture, {
    at: [-0.01, 1.355, 0.174],
    dir: [0, 0.13, 1],
    size: [0.105, 0.119],
    bone: hatBone,
    segments: 8,
    lift: 0.002,
    name: "stitched inventor guild badge",
  });
  const capSurface = b.surface(cap);
  const hatSeam = capSurface.drape(
    [[0.12, 1.29, 0.145], [0.102, 1.365, 0.103], [0.017, 1.454, 0.075], [-0.096, 1.52, 0.047]],
    { lift: 0.003 },
  );
  b.sweep(hatSeam, 0.003, { color: brassFlat, bone: hatBone, sides: 5 });
  b.along(hatSeam, 11, (at) =>
    b.stick(new THREE.BoxGeometry(0.009, 0.003, 0.015), cream, at, { bone: hatBone }),
  );

  torus([-0.235, 1.515, 0.027], 0.017, 0.005, brass, hatBone, [1, 0, 0]);
  b.lathe(
    [[0, 0], [0.029, 0], [0.025, 0.028], [0.015, 0.043], [0, 0.047]],
    { at: [-0.236, 1.46, 0.027], color: brass, bone: hatBone, segments: 8 },
  );
  pin([-0.236, 1.464, 0.027], 0.009, hatBone, ink);

  // Goggles perch on the brim, entirely above the readable face.
  const goggleBand = b.surface(b.root).drape(
    polyline([
      [-0.222, 1.25, 0.072],
      [-0.145, 1.267, 0.225],
      [0, 1.27, 0.266],
      [0.145, 1.267, 0.225],
      [0.222, 1.25, 0.072],
    ]),
    { lift: 0.006 },
  );
  b.sweep(goggleBand, 0.015, { color: leather, bone: hatBone, sides: 6 });

  for (const s of sides) {
    b.part(new THREE.CylinderGeometry(0.058, 0.056, 0.033, 12), copper, {
      at: [s * 0.074, 1.265, 0.238],
      dir: [s * 0.16, 0.09, 1],
      bone: hatBone,
      flat: true,
    });
    torus([s * 0.074, 1.266, 0.26], 0.046, 0.009, brass, hatBone, [s * 0.16, 0.09, 1]);
    ell([s * 0.074, 1.265, 0.266], [0.042, 0.043, 0.009], "#386b75", hatBone);
    b.part(new THREE.PlaneGeometry(0.014, 0.041), "#b1e5d5", {
      at: [s * 0.074 - 0.013, 1.27, 0.277],
      rotation: [0, 0, -26],
      bone: hatBone,
    });
    for (let j = 0; j < 4; j++) {
      const a = j * Math.PI / 2;
      pin(
        [s * 0.074 + Math.cos(a) * 0.055, 1.265 + Math.sin(a) * 0.055, 0.255],
        0.0055,
        hatBone,
        steel,
      );
    }
  }
  tube([-0.024, 1.268, 0.26], [0.024, 1.268, 0.26], 0.008, brass, hatBone);

  // ---------------------------------------------------------------------------
  // Backpack: curved shoulder harness, a wooden frame and burgundy satchel.
  // ---------------------------------------------------------------------------
  for (const s of sides) {
    const strap = torsoSurface.drape(
      catmull([
        [s * 0.198, 0.524, 0.147],
        [s * 0.195, 0.678, 0.17],
        [s * 0.173, 0.81, 0.105],
        [s * 0.178, 0.831, -0.09],
        [s * 0.209, 0.693, -0.164],
        [s * 0.21, 0.55, -0.147],
      ]),
      { lift: 0.014 },
    );
    b.sweep(strap, 0.024, {
      color: leather,
      bone: spine.joints[1],
      sides: 6,
      smooth: false,
      name: "backpack shoulder harness",
    });
    box([s * 0.205, 0.701, 0.196], [0.051, 0.072, 0.017], brass, spine.joints[1]);
    box([s * 0.205, 0.701, 0.208], [0.032, 0.045, 0.006], leather, spine.joints[1]);
    pin([s * 0.205, 0.676, 0.218], 0.007, spine.joints[1], copper);

    box([s * 0.22, 0.692, -0.272], [0.032, 0.532, 0.042], wood, packBone, "pack frame upright");
    box([s * 0.22, 0.93, -0.269], [0.045, 0.024, 0.058], brass, packBone);
    box([s * 0.22, 0.444, -0.269], [0.045, 0.024, 0.058], brass, packBone);
  }

  box([0, 0.695, -0.288], [0.436, 0.433, 0.229], leather, packBone, "leather gadget satchel");
  box([0, 0.692, -0.414], [0.392, 0.359, 0.032], plum, packBone, "burgundy rear pocket");
  box([0, 0.88, -0.3], [0.465, 0.074, 0.272], leather, packBone, "overhanging backpack flap");
  box([0, 0.917, -0.304], [0.422, 0.012, 0.214], plum, packBone);
  for (const y of [0.47, 0.913]) {
    box([0, y, -0.268], [0.485, 0.027, 0.041], wood, packBone, "frame crossbar");
  }
  for (const s of sides) {
    box([s * 0.138, 0.696, -0.437], [0.039, 0.382, 0.012], leather, packBone);
    box([s * 0.138, 0.774, -0.448], [0.063, 0.078, 0.012], brass, packBone);
    box([s * 0.138, 0.774, -0.457], [0.04, 0.052, 0.005], ink, packBone);
    tube([s * 0.162, 0.774, -0.464], [s * 0.115, 0.774, -0.464], 0.004, brass, packBone);
    for (let i = 0; i < 6; i++) {
      pin([s * 0.138, 0.536 + i * 0.025, -0.448], 0.004, packBone, brass);
    }
  }
  imagePlane([0, 0.672, -0.438], [0.19, 0.099], labelTexture, packBone, [0, 0, -1]);
  for (const x of [-0.184, 0.184]) {
    for (let i = 0; i < 10; i++) {
      seam([x, 0.529 + i * 0.032, -0.435], [x, 0.542 + i * 0.032, -0.435], packBone, "#d8ac80");
    }
  }

  // Side pocket and notebook: paper block, covers, binding and page drawing.
  box([-0.256, 0.651, -0.293], [0.075, 0.154, 0.182], leather, packBone, "notebook holster");
  box([-0.262, 0.766, -0.277], [0.037, 0.2, 0.146], "#ddcaa5", packBone, "notebook pages");
  for (const x of [-0.287, -0.237]) {
    box([x, 0.767, -0.277], [0.012, 0.214, 0.158], "#315567", packBone, "notebook cover");
  }
  box([-0.263, 0.767, -0.355], [0.063, 0.21, 0.016], leather, packBone, "notebook spine");
  imagePlane([-0.294, 0.785, -0.276], [0.122, 0.168], notebookTexture, packBone, [-1, 0, 0]);
  for (let j = 0; j < 3; j++) {
    tube([-0.299, 0.697 + j * 0.064, -0.344], [-0.231, 0.697 + j * 0.064, -0.344], 0.007, brass, packBone);
  }

  // ---------------------------------------------------------------------------
  // Gadget one: side-mounted copper boiler, pressure dial and emerald lamp.
  // ---------------------------------------------------------------------------
  b.lathe(
    [
      [0, 0], [0.072, 0], [0.087, 0.025], [0.087, 0.249],
      [0.074, 0.283], [0.041, 0.302], [0, 0.302],
    ],
    {
      at: [0.305, 0.654, -0.235],
      color: copper,
      bone: packBone,
      segments: 10,
      name: "pocket steam boiler",
    },
  );
  for (const y of [0.696, 0.892]) {
    b.part(new THREE.CylinderGeometry(0.094, 0.094, 0.023, 10), brass, {
      at: [0.305, y, -0.235], bone: packBone, flat: true,
    });
    tube([0.246, y, -0.28], [0.174, y, -0.3], 0.017, leather, packBone);
  }

  b.part(new THREE.CylinderGeometry(0.061, 0.055, 0.034, 12), brass, {
    at: [0.308, 0.824, -0.133], dir: [0, 0, 1], bone: packBone, flat: true,
  });
  imagePlane([0.308, 0.824, -0.113], [0.102, 0.102], gauge, packBone);
  torus([0.308, 0.824, -0.111], 0.054, 0.007, copper, packBone);
  imagePlane([0.31, 0.742, -0.142], [0.073, 0.049], warningTexture, packBone);

  tube([0.305, 0.953, -0.235], [0.305, 1.038, -0.235], 0.033, brass, packBone);
  torus([0.305, 1.017, -0.235], 0.031, 0.01, copper, packBone, [0, 1, 0]);

  // Lantern built as a real assembly: sockets, luminous glass, cage and crown.
  b.lathe(
    [[0, 0], [0.067, 0], [0.067, 0.025], [0.041, 0.036], [0, 0.036]],
    { at: [0.305, 1.025, -0.235], color: brass, bone: packBone, segments: 8 },
  );
  glow(
    b.part(new THREE.CylinderGeometry(0.043, 0.043, 0.114, 8), mint, {
      at: [0.305, 1.116, -0.235], bone: packBone, flat: true, name: "mint power lantern",
    }),
    1.25,
  );
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + Math.PI / 4;
    const x = 0.305 + Math.cos(a) * 0.053;
    const z = -0.235 + Math.sin(a) * 0.053;
    tube([x, 1.064, z], [x, 1.173, z], 0.006, brass, packBone);
  }
  b.lathe(
    [[0, 0], [0.067, 0], [0.064, 0.019], [0.034, 0.043], [0, 0.051]],
    { at: [0.305, 1.174, -0.235], color: copper, bone: packBone, segments: 8 },
  );
  pin([0.305, 1.229, -0.235], 0.012, packBone, brass);
  torus([0.305, 1.249, -0.235], 0.022, 0.005, brass, packBone);

  // A copper hose is anchored at both ends.
  b.sweep(
    catmull([
      [0.35, 0.713, -0.244],
      [0.415, 0.674, -0.269],
      [0.408, 0.572, -0.336],
      [0.279, 0.547, -0.394],
      [0.152, 0.583, -0.421],
    ]),
    0.013,
    { color: copper, bone: packBone, sides: 6, smooth: false, name: "boiler return hose" },
  );
  pin([0.152, 0.583, -0.421], 0.023, packBone, brass);

  // ---------------------------------------------------------------------------
  // Gadget two: telescopic instrument and folded survey map.
  // ---------------------------------------------------------------------------
  const scopeBase = [-0.316, 0.814, -0.196];
  const scopeTip = [-0.366, 1.157, -0.227];
  b.sweep([scopeBase, scopeTip], [0.048, 0.036], {
    color: brass,
    bone: packBone,
    sides: 10,
    caps: "flat",
    smooth: false,
    name: "backpack survey telescope",
  });
  b.part(new THREE.CylinderGeometry(0.059, 0.051, 0.056, 10), copper, {
    at: [-0.367, 1.152, -0.227],
    dir: [-0.05, 0.343, -0.031],
    bone: packBone,
    flat: true,
  });
  b.part(new THREE.CircleGeometry(0.045, 12), "#36526d", {
    at: [-0.373, 1.182, -0.23],
    dir: [-0.05, 0.343, -0.031],
    axis: "z",
    bone: packBone,
  });
  for (const y of [0.879, 1.047]) {
    b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.021, 10), leather, {
      at: [-0.316 - (y - 0.814) * 0.146, y, -0.196 - (y - 0.814) * 0.09],
      dir: [-0.05, 0.343, -0.031],
      bone: packBone,
      flat: true,
    });
  }
  tube([-0.303, 0.903, -0.193], [-0.195, 0.84, -0.274], 0.017, steel, packBone);

  b.part(new THREE.CylinderGeometry(0.044, 0.044, 0.315, 10), "#e4d6b3", {
    at: [0.142, 1.002, -0.332], bone: packBone, flat: true, name: "rolled survey chart",
  });
  for (const y of [0.912, 1.09]) {
    b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.017, 10), leather, {
      at: [0.142, y, -0.332], bone: packBone, flat: true,
    });
  }
  torus([0.142, 1.161, -0.332], 0.028, 0.006, "#9b8669", packBone, [0, 1, 0]);
  b.part(new THREE.CircleGeometry(0.02, 10), "#645349", {
    at: [0.142, 1.162, -0.332], dir: [0, 1, 0], axis: "z", bone: packBone,
  });
  imagePlane([0.142, 1.028, -0.285], [0.05, 0.17], blueprintTexture, packBone);

  // ---------------------------------------------------------------------------
  // Rear gadget rack: exposed gears, sprung accumulator and hanging tools.
  // ---------------------------------------------------------------------------
  box([0.005, 0.898, -0.431], [0.292, 0.162, 0.032], "#354c59", packBone, "gearbox plate");
  for (const x of [-0.122, 0.132]) {
    for (const y of [0.839, 0.955]) {
      pin([x, y, -0.452], 0.009, packBone, brass);
    }
  }

  const gearLocations = [
    { x: -0.052, y: 0.89, teeth: 20, radius: 0.065, color: brass },
    { x: 0.055, y: 0.929, teeth: 12, radius: 0.039, color: copper },
    { x: 0.077, y: 0.842, teeth: 16, radius: 0.05, color: steel },
  ];
  for (const g of gearLocations) {
    b.part(gearGeometry({
      teeth: g.teeth, radius: g.radius, thickness: 0.018, spokes: 4, bore: 0.008,
    }), g.color, {
      at: [g.x, g.y, -0.466],
      dir: [0, 0, -1],
      bone: packBone,
      name: "exposed gearbox cog",
    });
    pin([g.x, g.y, -0.485], 0.015, packBone, brass);
  }

  box([-0.065, 0.525, -0.473], [0.164, 0.056, 0.055], copper, packBone, "spring accumulator foot");
  tube([-0.119, 0.55, -0.474], [-0.119, 0.72, -0.474], 0.007, steel, packBone);
  tube([-0.011, 0.55, -0.474], [-0.011, 0.72, -0.474], 0.007, steel, packBone);
  b.sweep(
    coil([-0.065, 0.553, -0.474], [-0.065, 0.711, -0.474], 0.039, 5),
    0.007,
    { color: steel, bone: packBone, sides: 6, name: "visible accumulator spring" },
  );
  box([-0.065, 0.72, -0.474], [0.154, 0.031, 0.066], brass, packBone);

  // A miniature winding handle.
  tube([0.184, 0.91, -0.347], [0.258, 0.91, -0.347], 0.012, steel, packBone);
  tube([0.255, 0.91, -0.347], [0.255, 0.969, -0.347], 0.011, brass, packBone);
  ell([0.255, 0.975, -0.347], [0.019, 0.021, 0.034], leather, packBone, "crank grip");

  // Small tool loops hold both tools firmly to the rear of the frame.
  for (const x of [-0.196, 0.201]) {
    torus([x, 0.677, -0.444], 0.026, 0.008, leather, packBone);
  }
  tube([-0.196, 0.592, -0.463], [-0.196, 0.821, -0.463], 0.018, wood, packBone);
  box([-0.196, 0.827, -0.463], [0.116, 0.055, 0.06], steel, packBone, "little engineer hammer");
  box([-0.245, 0.827, -0.463], [0.025, 0.062, 0.069], copper, packBone);
  box([-0.147, 0.827, -0.463], [0.023, 0.042, 0.05], steel, packBone);

  b.extrude(
    [
      [-0.014, 0], [0.014, 0], [0.018, 0.168],
      [0.044, 0.195], [0.045, 0.225], [0.028, 0.245],
      [0.023, 0.215], [-0.005, 0.206], [-0.024, 0.226],
      [-0.017, 0.251], [-0.041, 0.234], [-0.045, 0.203],
      [-0.018, 0.174],
    ],
    {
      at: [0.2, 0.544, -0.467],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.023,
      bevel: 0.003,
      color: steel,
      bone: packBone,
      name: "open ended spanner",
    },
  );
  torus([0.2, 0.562, -0.483], 0.007, 0.003, ink, packBone);

  // A tiny socketed crystal battery at the bag's outer side.
  box([0.233, 0.584, -0.3], [0.045, 0.094, 0.106], brass, packBone);
  glow(
    b.part(new THREE.OctahedronGeometry(0.049), "#8edbc5", {
      at: [0.275, 0.595, -0.297],
      scale: [0.72, 1.15, 0.72],
      bone: packBone,
      flat: true,
      name: "spare power crystal",
    }),
    0.85,
  );
  for (const z of [-0.331, -0.263]) {
    tube([0.242, 0.562, z], [0.283, 0.571, z], 0.006, copper, packBone);
  }

  // Aerial stays behind the hat rather than crossing the face.
  tube([0.021, 0.933, -0.388], [0.038, 1.235, -0.391], 0.006, steel, packBone);
  b.sweep(
    coil([0.038, 1.12, -0.391], [0.043, 1.226, -0.391], 0.018, 3),
    0.004,
    { color: copper, bone: packBone, sides: 5 },
  );
  pin([0.043, 1.25, -0.391], 0.018, packBone, brass);

  // Modest scattered scuffs and repairs on the pack's broad leather surfaces.
  for (let i = 0; i < 8; i++) {
    const x = -0.09 + random() * 0.18;
    const y = 0.54 + random() * 0.07;
    tube([x, y, -0.433], [x + 0.022, y + 0.006, -0.433], 0.0025, "#bb8270", packBone);
  }

  // Lower apron edge carries a few practical little copper fittings.
  for (const s of sides) {
    const hit = torsoSurface.around([0, 0.59, 0]).at(s * 70, -25);
    if (hit) {
      b.stick(new THREE.CylinderGeometry(0.017, 0.017, 0.008, 8), copper, hit, {
        bone: hips,
        embed: 0.4,
        name: "jacket side rivet",
      });
    }
  }

  return b.root;
}
