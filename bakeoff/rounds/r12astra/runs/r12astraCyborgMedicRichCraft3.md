```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  catmull,
  bezier,
  arc,
  svg,
  paint,
  mix,
  noise,
  rng,
} from "agentic-3js-builder";
import type { Joint, Fill } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "AURA — Field Restoration Specialist",
  description:
    "An original heroic cyborg medic in ivory ceramic, deep teal and rescue orange. Articulated combat boots, a life-support backpack, expressive human face, exposed cybernetic arm and a luminous forked healing staff.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "AURA", paintSize: 2048 });
  const random = rng(7301);

  const C = {
    ivory: "#edf2e9",
    white: "#ffffff",
    teal: "#167d85",
    deepTeal: "#154e5c",
    dark: "#182b3c",
    rubber: "#263b4c",
    steel: "#879eac",
    lightSteel: "#c6d9df",
    orange: "#fa8845",
    gold: "#e9b865",
    skin: "#bd8066",
    skinLight: "#e3ad8c",
    lip: "#8f4e4b",
    hair: "#edf0dc",
    hairShadow: "#729694",
    cyan: "#72ffe0",
    mint: "#c4fff0",
  };

  const ceramic = paint((p, n) => {
    const base = mix("#c9dbd8", "#f3f3e8", 0.5 + n.y * 0.34);
    const fine = noise(p, 0.027, 17);
    return mix(base, "#ffffff", fine * 0.065);
  });
  const teal = paint((p, n) =>
    mix("#125664", "#24979b", 0.44 + 0.28 * n.y + 0.16 * noise(p, 0.09, 3)),
  );
  const undersuit = paint((p, n) => {
    const weave =
      (Math.floor(p.y * 330) + Math.floor(p.x * 330)) % 2 === 0 ? 0.035 : 0;
    return mix("#172737", "#365063", 0.2 + n.y * 0.1 + weave);
  });
  const skin = paint((_p, n) =>
    mix("#b67b67", "#e5ac8a", 0.58 + 0.22 * n.y + 0.1 * n.z),
  );
  const brushed = paint((p, n) =>
    mix("#607c8c", "#c6d7db", 0.4 + 0.3 * n.y + 0.15 * noise(p, 0.018, 8)),
  );

  // Drawings are deliberately broad enough to remain readable at game distance.
  const emblem = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="60" fill="#123d4f"/>
      <circle cx="64" cy="64" r="53" fill="#eaf4e9" stroke="#72d6ca" stroke-width="5"/>
      <path d="M51 26H77V51H102V77H77V102H51V77H26V51H51Z" fill="#17858b"/>
      <path d="M13 66H39L48 48L61 83L75 58L84 66H115" fill="none"
        stroke="#eaf4e9" stroke-width="5" stroke-linejoin="round"/>
      <path d="M42 113H86" stroke="#fa8845" stroke-width="5"/>
    </svg>`,
    { size: 256 },
  );
  const eyeTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 84">
      <path d="M8 45Q37 9 79 18Q123 17 151 43Q117 71 77 68Q38 69 8 45Z"
        fill="#263a42"/>
      <path d="M17 45Q44 23 80 26Q118 25 140 44Q115 62 79 61Q43 62 17 45Z"
        fill="#fff3dd"/>
      <ellipse cx="83" cy="44" rx="23" ry="24" fill="#16787d"/>
      <ellipse cx="83" cy="48" rx="17" ry="17" fill="#53c8ba"/>
      <ellipse cx="83" cy="43" rx="9" ry="18" fill="#142e39"/>
      <circle cx="74" cy="33" r="6" fill="#ffffff"/>
      <circle cx="92" cy="53" r="3" fill="#caffed"/>
      <path d="M9 44Q37 13 78 20Q122 17 151 43" stroke="#203441"
        stroke-width="7" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const mouthTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 60">
      <path d="M21 22Q49 30 77 26Q104 31 139 20Q117 44 81 45Q48 44 21 22"
        fill="#ad675f"/>
      <path d="M22 23Q80 39 138 21" fill="none" stroke="#703e42" stroke-width="5"
        stroke-linecap="round"/>
      <path d="M53 40Q82 47 106 39" fill="none" stroke="#efb5a0" stroke-width="4"/>
    </svg>`,
    { size: 192 },
  );
  const designation = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 128">
      <rect width="256" height="128" rx="12" fill="#153c4b"/>
      <path d="M12 12H244M12 116H244" stroke="#74cfc5" stroke-width="4"/>
      <text x="20" y="57" font-family="sans-serif" font-weight="bold"
        font-size="44" fill="#f1f3e8">AURA</text>
      <text x="21" y="91" font-family="sans-serif" font-weight="bold"
        font-size="18" letter-spacing="3" fill="#75e8cf">RESCUE / 07</text>
      <path d="M211 33H230V48H245V67H230V82H211V67H196V48H211Z" fill="#fa8845"/>
    </svg>`,
    { size: 384 },
  );
  const diagnostic = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 192">
      <rect width="128" height="192" rx="10" fill="#102d3b"/>
      <path d="M10 34H118M10 68H118M10 102H118M10 136H118M10 170H118
        M32 12V180M64 12V180M96 12V180" stroke="#205461" stroke-width="2"/>
      <text x="12" y="26" font-family="sans-serif" font-weight="bold"
        font-size="14" fill="#c1ffee">VITAL LINK</text>
      <path d="M9 98H29L39 74L53 127L70 55L83 98H119" fill="none"
        stroke="#80ffe0" stroke-width="5" stroke-linejoin="round"/>
      <text x="12" y="165" font-family="sans-serif" font-weight="bold"
        font-size="30" fill="#e1fff2">98</text>
      <text x="64" y="163" font-family="sans-serif" font-size="14" fill="#faac60">SYNC</text>
      <path d="M13 181H107" stroke="#75e9d5" stroke-width="5"/>
    </svg>`,
    { size: 256 },
  );
  const chevrons = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64">
      <rect width="128" height="64" fill="#e9efe4"/>
      <path d="M-28 64L9 0H31L-6 64M23 64L60 0H82L45 64M74 64L111 0H133L96 64"
        fill="#ef8547"/>
    </svg>`,
    { size: 192 },
  );

  // Skeleton. All geometry below is attached explicitly to this hierarchy.
  const hips = b.joint("hips", { at: [0, 0.92, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    [[0, 0.92, 0], [0, 1.09, -0.005], [0, 1.31, 0]],
    { parent: hips, names: ["spineLower", "chest", "chestTop"], role: "spine" },
  );
  const chest = spine.joints[1];
  const neck = b.joint("neck", {
    parent: spine.tip!,
    at: [0, 1.43, 0],
    dir: [0, 1, 0],
    role: "neck",
  });
  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.59, 0.008],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.59, 0.015],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const limbs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      [[s * 0.125, 0.91, 0], [s * 0.145, 0.53, 0.026], [s * 0.145, 0.17, 0]],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [s * 0.145, 0, 0.065],
      },
    );
    const arm = b.chain(
      `arm${side}`,
      [[s * 0.235, 1.345, 0], [s * 0.55, 1.335, 0], [s * 0.82, 1.325, 0]],
      {
        parent: chest,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        role: "arm",
      },
    );
    const hand = b.joint(`hand${side}`, {
      parent: arm.tip!,
      at: [s * 0.86, 1.325, 0],
      dir: [s, 0, 0],
      role: "arm",
    });
    const digits = Array.from({ length: 4 }, (_, i) => {
      const y = 1.365 - i * 0.026;
      const length = [0.088, 0.107, 0.101, 0.078][i];
      return b.chain(
        `finger${side}${i + 1}`,
        [
          [s * 0.923, y, 0.009],
          [s * (0.923 + length * 0.52), y - 0.003, 0.012],
          [s * (0.923 + length), y - 0.005, 0.015],
        ],
        { parent: hand, count: 2, role: "digit" },
      );
    });
    const thumb = b.chain(
      `thumb${side}`,
      [
        [s * 0.871, 1.295, 0.016],
        [s * 0.9, 1.261, 0.029],
        [s * 0.94, 1.25, 0.035],
      ],
      { parent: hand, count: 2, role: "digit" },
    );
    return { s, side, leg, arm, hand, digits, thumb };
  });
  const staffBone = b.joint("healingStaff", {
    parent: limbs[0].hand,
    at: [0.972, 1.325, -0.025],
    dir: [0, 1, 0],
    role: "hinge",
  });

  // Small placement helpers keep repeated armor assemblies on their own bones.
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
  ) {
    return b.part(new THREE.SphereGeometry(1, 12, 8), color, {
      name, at, bone, scale: size, flat: true,
    });
  }
  function cylinder(
    name: string,
    at: number[],
    radius: number,
    depth: number,
    color: Fill,
    bone: Joint,
    dir: number[] = [0, 1, 0],
    segments = 12,
  ) {
    return b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      name, at, bone, dir,
    });
  }
  function line(
    name: string,
    a: number[],
    end: number[],
    r: number,
    color: Fill,
    bone: Joint,
  ) {
    return b.rod(a, end, r, { color, bone, sides: 6, name });
  }
  function label(
    name: string,
    at: number[],
    size: number[],
    texture: THREE.Texture,
    bone: Joint,
    dir: number[] = [0, 0, 1],
  ) {
    return b.part(new THREE.PlaneGeometry(size[0], size[1]), C.white, {
      name, at, bone, texture, dir, axis: "z",
    });
  }
  function screw(at: number[], bone: Joint, dir: number[] = [0, 0, 1]) {
    return cylinder("recessed fastener", at, 0.007, 0.004, C.dark, bone, dir, 6);
  }

  // Face first: a warm, expressive human face framed by cybernetic temples.
  const skull = ellipsoid(
    "faceted human face",
    [0, 1.667, 0.014],
    [0.111, 0.137, 0.095],
    skin,
    head,
  );
  const chin = ellipsoid(
    "articulated lower jaw",
    [0, 1.571, 0.035],
    [0.075, 0.046, 0.068],
    skin,
    jaw,
  );
  for (const s of [1, -1]) {
    b.decal(skull, eyeTexture, {
      at: [s * 0.048, 1.676, 0.101],
      dir: [s * 0.12, 0, 1],
      size: [0.067, 0.035],
      mirror: s > 0,
      bone: head,
      lift: 0.0014,
      name: "expressive teal eye",
    });
    b.sweep(
      bezier(
        [s * 0.019, 1.71, 0.101],
        [s * 0.049, 1.723, 0.103],
        [s * 0.079, 1.708, 0.086],
      ),
      [0.005, 0.003],
      { color: C.dark, bone: head, sides: 5, name: "sculpted eyebrow" },
    );
    ellipsoid("cheek plane", [s * 0.067, 1.627, 0.066], [0.034, 0.025, 0.035], skin, head);
    cylinder("temple implant gasket", [s * 0.111, 1.654, 0.002], 0.047, 0.022, C.dark, head, [s, 0, 0]);
    cylinder("temple ceramic hub", [s * 0.125, 1.654, 0.002], 0.037, 0.018, ceramic, head, [s, 0, 0]);
    cylinder("temple orange disk", [s * 0.137, 1.654, 0.002], 0.023, 0.007, C.orange, head, [s, 0, 0]);
    glow(cylinder("temple status light", [s * 0.142, 1.654, 0.002], 0.012, 0.009, C.cyan, head, [s, 0, 0]), 0.65);
    b.sweep(
      [[s * 0.111, 1.643, 0.023], [s * 0.095, 1.598, 0.048], [s * 0.068, 1.577, 0.06]],
      [0.011, 0.008],
      { color: ceramic, bone: head, section: "box", name: "jawline implant rail" },
    );
    for (let i = 0; i < 3; i++) {
      line(
        "cheek circuit",
        [s * (0.073 + i * 0.008), 1.632 - i * 0.006, 0.087 - i * 0.008],
        [s * (0.079 + i * 0.008), 1.614 - i * 0.006, 0.083 - i * 0.008],
        0.0018,
        C.deepTeal,
        head,
      );
    }
  }
  b.extrude(
    [[-0.012, -0.018], [0.013, -0.018], [0.009, 0.025], [-0.006, 0.033]],
    {
      at: [0, 1.644, 0.111],
      x: [1, 0, 0],
      y: [0, 1, -0.28],
      thickness: 0.024,
      bevel: 0.003,
      color: skin,
      bone: head,
      name: "angular nose bridge",
    },
  );
  ellipsoid("nose tip", [0, 1.63, 0.125], [0.018, 0.012, 0.013], skin, head);
  b.decal(chin, mouthTexture, {
    at: [0, 1.592, 0.101],
    dir: [0, 0, 1],
    size: [0.056, 0.021],
    lift: 0.0016,
    bone: jaw,
    name: "quiet confident smile",
  });

  // Solid silver hair silhouette with broad swept blades, not a cloud of strands.
  ellipsoid("short hair undercut", [0, 1.718, -0.028], [0.114, 0.104, 0.092], C.hairShadow, head);
  for (let i = 0; i < 9; i++) {
    const x = -0.095 + i * 0.023;
    const h = 0.057 + 0.025 * Math.sin((i / 8) * Math.PI);
    b.extrude(
      [
        [-0.017, 0],
        [0.014, -0.008],
        [0.027, h * 0.68],
        [0.007, h + 0.012],
        [-0.014, h * 0.62],
      ],
      {
        at: [x, 1.743 + 0.013 * Math.sin(i * 0.4), 0.045 - i * 0.004],
        x: [1, 0, 0],
        y: [0.32, 0.8, -0.55],
        thickness: 0.065,
        bevel: 0.004,
        color: i % 3 === 0 ? C.ivory : C.hair,
        bone: head,
        name: "swept silver hair blade",
      },
    );
  }
  b.extrude(
    [[-0.048, 0.016], [0.027, 0.024], [0.066, -0.047], [0.025, -0.025], [-0.016, -0.006]],
    {
      at: [0.016, 1.759, 0.075],
      x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.03, bevel: 0.004,
      color: C.hair, bone: head, name: "signature side swept forelock",
    },
  );

  // Neck, core and breastplate: broad shoulders, narrow technical waist.
  cylinder("neck flexible seal", [0, 1.467, 0], 0.054, 0.115, undersuit, neck);
  for (const y of [1.445, 1.469, 1.493]) {
    cylinder("neck articulation ring", [0, y, 0], 0.057, 0.009, brushed, neck);
  }
  b.sweep(spine, (t) => [0.135 + 0.04 * t, 0.084 + 0.012 * t], {
    color: undersuit, sides: 8, name: "tailored technical undersuit",
  });
  b.loft(
    [
      { at: [0, 1.08, 0], w: 0.265, h: 0.17 },
      { at: [0, 1.23, 0.005], w: 0.405, h: 0.215 },
      { at: [0, 1.345, -0.005], w: 0.435, h: 0.19 },
      { at: [0, 1.395, -0.005], w: 0.27, h: 0.16 },
    ],
    { color: ceramic, bone: chest, section: { ngon: 8 }, name: "heroic ceramic breastplate" },
  );
  b.extrude(
    [[-0.154, 0.065], [-0.13, -0.04], [0, -0.09], [0.13, -0.04], [0.154, 0.065], [0, 0.025]],
    {
      at: [0, 1.267, 0.108],
      x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.023, bevel: 0.006,
      color: teal, bone: chest, name: "teal chevron chest inset",
    },
  );
  cylinder("sternum emblem mount", [0, 1.29, 0.132], 0.052, 0.012, C.dark, chest, [0, 0, 1]);
  label("medical crest", [0, 1.29, 0.14], [0.093, 0.093], emblem, chest);
  label("chest callsign", [-0.105, 1.355, 0.102], [0.096, 0.048], designation, chest);
  for (const s of [1, -1]) {
    b.sweep(
      [[s * 0.065, 1.406, 0.047], [s * 0.133, 1.39, 0.069], [s * 0.203, 1.346, 0.064]],
      0.014,
      { color: C.dark, bone: chest, section: "box", name: "collar black reveal" },
    );
    glow(b.sweep(
      [[s * 0.065, 1.408, 0.059], [s * 0.133, 1.392, 0.081], [s * 0.198, 1.349, 0.076]],
      0.004,
      { color: C.cyan, bone: chest, sides: 5, name: "collar luminous piping" },
    ), 0.7);
    box("breastplate orange tab", [s * 0.173, 1.289, 0.092], [0.025, 0.061, 0.02], C.orange, chest, [0, 0, s * 20]);
    screw([s * 0.182, 1.337, 0.09], chest);
    screw([s * 0.11, 1.162, 0.099], chest);
  }
  for (let i = 0; i < 3; i++) {
    const y = 1.065 + i * 0.037;
    box("overlapping abdominal plate", [0, y, 0.088], [0.19 + i * 0.018, 0.028, 0.028], i === 0 ? teal : ceramic, spine.joints[0]);
    box("abdominal center groove", [0, y, 0.104], [0.006, 0.022, 0.004], C.deepTeal, spine.joints[0]);
  }

  // Pelvis, belt, side armor and emergency supplies.
  ellipsoid("pelvic undersuit", [0, 0.932, 0], [0.173, 0.12, 0.104], undersuit, hips);
  cylinder("waist seal", [0, 1.005, 0], 0.136, 0.045, C.dark, hips);
  box("belt front", [0, 0.993, 0.095], [0.278, 0.054, 0.032], C.deepTeal, hips);
  box("orange belt clasp", [0, 0.995, 0.118], [0.068, 0.047, 0.023], C.orange, hips);
  box("clasp inset", [0, 0.995, 0.132], [0.041, 0.022, 0.007], C.ivory, hips);
  b.extrude(
    [[-0.078, 0.055], [0.078, 0.055], [0.064, -0.035], [0, -0.072], [-0.064, -0.035]],
    {
      at: [0, 0.922, 0.104], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.035, bevel: 0.006, color: ceramic, bone: hips,
      name: "floating pelvic guard",
    },
  );
  for (const s of [1, -1]) {
    box("belt attachment", [s * 0.141, 0.992, 0.06], [0.039, 0.063, 0.07], brushed, hips);
    b.extrude(
      [[-0.045, 0.06], [0.052, 0.045], [0.07, -0.08], [0.018, -0.115], [-0.04, -0.065]],
      {
        at: [s * 0.165, 0.922, 0.015],
        x: [s, 0, 0], y: [0, 1, 0],
        thickness: 0.145, bevel: 0.008, color: teal, bone: hips,
        name: "flared hip armor",
      },
    );
    box("hip orange rank stripe", [s * 0.191, 0.919, 0.091], [0.028, 0.085, 0.008], C.orange, hips, [0, 0, s * 10]);
  }
  box("emergency field pouch", [-0.204, 0.992, -0.021], [0.105, 0.145, 0.095], C.deepTeal, hips);
  box("pouch ceramic flap", [-0.204, 1.029, 0.03], [0.11, 0.057, 0.019], ceramic, hips);
  label("pouch first aid insignia", [-0.204, 0.973, 0.03], [0.053, 0.053], emblem, hips);
  for (let i = 0; i < 3; i++) {
    const z = -0.055 + i * 0.043;
    cylinder("injector cartridge", [0.222, 0.995, z], 0.015, 0.12, ceramic, hips);
    cylinder("injector collar", [0.222, 1.042, z], 0.018, 0.019, C.orange, hips);
    glow(cylinder("injector charge window", [0.222, 0.985, z], 0.0155, 0.034, C.cyan, hips), 0.55);
  }

  // Sturdy articulated legs, oversized traction boots, and repeated armor language.
  for (const L of limbs) {
    const { s, leg, side } = L;
    const thigh = leg.joints[0];
    const shin = leg.joints[1];
    const ankle = leg.tip!;
    b.sweep(leg, [0.079, 0.064, 0.047], {
      color: undersuit, sides: 8, name: `${side} leg flexible core`,
    });
    b.frustumBox(
      [s * 0.129, 0.851, 0.005],
      [s * 0.142, 0.605, 0.025],
      [0.151, 0.135],
      [0.117, 0.115],
      { color: ceramic, bone: thigh, name: "tapered thigh shell" },
    );
    box("thigh teal panel", [s * 0.145, 0.738, 0.087], [0.099, 0.192, 0.018], teal, thigh, [0, 0, s * 2]);
    box("thigh orange bar", [s * 0.177, 0.76, 0.099], [0.014, 0.137, 0.008], C.orange, thigh);
    box("thigh inset lower cap", [s * 0.145, 0.639, 0.09], [0.09, 0.023, 0.021], C.dark, thigh);
    screw([s * 0.114, 0.814, 0.101], thigh);
    screw([s * 0.174, 0.663, 0.103], thigh);

    cylinder("knee hinge", [s * 0.145, 0.526, 0.022], 0.067, 0.137, brushed, shin, [1, 0, 0]);
    cylinder("outer knee hub", [s * 0.222, 0.526, 0.022], 0.034, 0.015, C.deepTeal, shin, [s, 0, 0]);
    cylinder("knee pivot orange", [s * 0.232, 0.526, 0.022], 0.017, 0.008, C.orange, shin, [s, 0, 0]);
    b.extrude(
      [[-0.067, 0.041], [0, 0.068], [0.067, 0.041], [0.052, -0.049], [0, -0.065], [-0.052, -0.049]],
      {
        at: [s * 0.145, 0.531, 0.09],
        x: [1, 0, 0], y: [0, 1, 0],
        thickness: 0.043, bevel: 0.005, color: ceramic, bone: shin,
        name: "hexagonal knee shield",
      },
    );
    box("kneecap teal slot", [s * 0.145, 0.543, 0.115], [0.067, 0.018, 0.009], teal, shin);
    b.frustumBox(
      [s * 0.145, 0.458, 0.003],
      [s * 0.145, 0.207, -0.007],
      [0.141, 0.133],
      [0.112, 0.104],
      { color: ceramic, bone: shin, name: "greave ceramic shell" },
    );
    b.extrude(
      [[-0.043, 0.12], [0.043, 0.12], [0.031, -0.12], [-0.031, -0.12]],
      {
        at: [s * 0.145, 0.327, 0.075],
        x: [1, 0, 0], y: [0, 1, 0],
        thickness: 0.02, bevel: 0.004, color: teal, bone: shin,
        name: "long teal shin panel",
      },
    );
    glow(box("shin guidance light", [s * 0.145, 0.345, 0.089], [0.013, 0.126, 0.006], C.cyan, shin), 0.65);
    box("shin rescue orange band", [s * 0.145, 0.241, 0.087], [0.071, 0.029, 0.014], C.orange, shin);
    for (const y of [0.43, 0.218]) screw([s * 0.192, y, 0.069], shin);
    line("rear calf piston", [s * 0.145, 0.452, -0.077], [s * 0.145, 0.24, -0.067], 0.016, brushed, shin);
    cylinder("ankle seal", [s * 0.145, 0.174, 0], 0.057, 0.066, C.dark, ankle);

    box("traction sole", [s * 0.145, 0.025, 0.065], [0.169, 0.05, 0.296], C.dark, ankle);
    box("heel armor", [s * 0.145, 0.085, -0.047], [0.159, 0.108, 0.111], teal, ankle);
    box("boot toe box", [s * 0.145, 0.082, 0.116], [0.166, 0.105, 0.194], ceramic, ankle);
    box("boot instep", [s * 0.145, 0.134, 0.054], [0.135, 0.063, 0.139], ceramic, ankle, [-12, 0, 0]);
    box("toe bumper", [s * 0.145, 0.061, 0.214], [0.169, 0.051, 0.019], C.deepTeal, ankle);
    box("toe orange reflector", [s * 0.145, 0.103, 0.207], [0.09, 0.02, 0.008], C.orange, ankle);
    for (let i = 0; i < 4; i++) {
      box("boot tread edge", [s * 0.145, 0.027, -0.049 + i * 0.072], [0.18, 0.032, 0.025], C.rubber, ankle);
    }
    for (const z of [0.035, 0.082]) {
      box("boot fastening strap", [s * 0.145, 0.166 - (z - 0.035) * 0.25, z], [0.142, 0.016, 0.024], C.deepTeal, ankle);
      box("boot strap clasp", [s * 0.19, 0.176 - (z - 0.035) * 0.25, z], [0.023, 0.014, 0.027], brushed, ankle);
    }
  }

  // Arms: armored clinical sleeve on the left, exposed articulated prosthetic on the right.
  for (const L of limbs) {
    const { s, arm, hand, digits, thumb } = L;
    const upper = arm.joints[0];
    const fore = arm.joints[1];
    b.sweep(arm, [0.059, 0.045, 0.031], {
      color: undersuit, sides: 8, name: "arm undersuit and joint core",
    });
    cylinder("shoulder pivot", [s * 0.254, 1.345, 0], 0.081, 0.084, C.dark, upper, [s, 0, 0]);
    ellipsoid("large ceramic shoulder pauldron", [s * 0.294, 1.375, -0.002], [0.123, 0.095, 0.101], ceramic, upper);
    box("shoulder teal forehead", [s * 0.295, 1.403, 0.084], [0.15, 0.058, 0.023], teal, upper);
    box("shoulder orange underside", [s * 0.32, 1.327, 0.082], [0.115, 0.018, 0.018], C.orange, upper);
    label("shoulder medical cross", [s * 0.294, 1.393, 0.1], [0.06, 0.06], emblem, upper);
    screw([s * 0.359, 1.387, 0.08], upper);

    if (s > 0) {
      b.frustumBox(
        [s * 0.37, 1.342, 0], [s * 0.49, 1.337, 0],
        [0.107, 0.112], [0.089, 0.091],
        { color: ceramic, bone: upper, name: "upper arm medical sleeve armor" },
      );
      box("upper arm rescue stripe", [s * 0.429, 1.343, 0.059], [0.037, 0.08, 0.012], C.orange, upper);
    } else {
      line("exposed humerus spar", [-0.365, 1.342, 0], [-0.505, 1.337, 0], 0.035, brushed, upper);
      for (const dz of [-0.04, 0.04]) {
        line("upper arm paired actuator", [-0.367, 1.367, dz], [-0.498, 1.363, dz], 0.012, C.dark, upper);
        line("actuator polished end", [-0.438, 1.367, dz], [-0.509, 1.363, dz], 0.007, C.lightSteel, upper);
      }
      for (let i = 0; i < 3; i++) {
        cylinder("humerus ring", [-0.39 - i * 0.042, 1.34, 0], 0.04, 0.012, C.deepTeal, upper, [1, 0, 0]);
      }
    }
    cylinder("elbow front disk", [s * 0.55, 1.335, 0.035], 0.048, 0.035, brushed, fore, [0, 0, 1]);
    cylinder("elbow pivot insert", [s * 0.55, 1.335, 0.058], 0.029, 0.012, C.deepTeal, fore, [0, 0, 1]);
    cylinder("elbow bright cap", [s * 0.55, 1.335, 0.067], 0.013, 0.008, C.orange, fore, [0, 0, 1]);

    b.frustumBox(
      [s * 0.59, 1.332, 0], [s * 0.782, 1.327, 0],
      [0.104, 0.107], [0.066, 0.072],
      { color: s > 0 ? ceramic : teal, bone: fore, name: "tapered forearm gauntlet" },
    );
    box("gauntlet front technical panel", [s * 0.675, 1.333, 0.056], [0.139, 0.07, 0.017], C.dark, fore);
    if (s > 0) {
      glow(label("wrist vital signs display", [s * 0.675, 1.333, 0.067], [0.044, 0.066], diagnostic, fore), 0.65);
      for (let i = 0; i < 2; i++) {
        glow(box("gauntlet command button", [0.726, 1.35 - i * 0.034, 0.07], [0.017, 0.017, 0.008], i ? C.orange : C.cyan, fore), 0.4);
      }
    } else {
      for (let i = 0; i < 4; i++) {
        box("prosthetic cooling fin", [-0.621 - i * 0.033, 1.335, 0.069], [0.011, 0.049, 0.012], brushed, fore, [0, 0, -14]);
      }
      glow(line("prosthetic energy tendon", [-0.599, 1.377, 0.025], [-0.779, 1.358, 0.025], 0.006, C.cyan, fore), 0.7);
    }
    cylinder("wrist cuff dark gasket", [s * 0.812, 1.326, 0], 0.039, 0.043, C.dark, hand, [1, 0, 0]);
    cylinder("wrist orange clasp ring", [s * 0.827, 1.326, 0], 0.04, 0.015, C.orange, hand, [1, 0, 0]);
    box("palm flexible core", [s * 0.882, 1.325, 0.004], [0.087, 0.105, 0.046], C.dark, hand);
    box("palm ceramic backplate", [s * 0.88, 1.332, -0.025], [0.075, 0.085, 0.018], ceramic, hand);
    box("palm inset medical teal", [s * 0.881, 1.333, -0.036], [0.038, 0.052, 0.006], teal, hand);
    for (const digit of digits) {
      b.sweep(digit, [0.011, 0.008], {
        color: brushed, sides: 6, skin: "rigid", name: "separated articulated finger",
      });
      b.along(digit, 2, (at) => {
        b.part(new THREE.SphereGeometry(0.012, 6, 4), ceramic, {
          at, scale: [1, 0.85, 0.85], name: "finger armor segment",
        });
      });
    }
    b.sweep(thumb, [0.013, 0.008], {
      color: brushed, sides: 6, skin: "rigid", name: "separated articulated thumb",
    });
  }

  // Compact life-support backpack. All hoses have actual rooted endpoints.
  box("backpack dark chassis", [0, 1.24, -0.144], [0.29, 0.32, 0.115], C.dark, chest);
  box("backpack central ceramic housing", [0, 1.254, -0.207], [0.153, 0.278, 0.056], ceramic, chest);
  box("backpack orange service panel", [0, 1.168, -0.24], [0.104, 0.055, 0.015], C.orange, chest);
  label("rear medical identity", [0, 1.286, -0.241], [0.095, 0.095], emblem, chest, [0, 0, -1]);
  for (const s of [1, -1]) {
    cylinder("restorative reservoir body", [s * 0.115, 1.252, -0.214], 0.045, 0.262, teal, chest);
    cylinder("reservoir top cap", [s * 0.115, 1.386, -0.214], 0.048, 0.032, ceramic, chest);
    cylinder("reservoir bottom cap", [s * 0.115, 1.117, -0.214], 0.048, 0.032, ceramic, chest);
    glow(box("reservoir rear glowing gauge", [s * 0.115, 1.26, -0.26], [0.022, 0.168, 0.009], C.cyan, chest), 0.8);
    for (const y of [1.162, 1.337]) {
      cylinder("reservoir retention band", [s * 0.115, y, -0.214], 0.049, 0.022, C.dark, chest);
    }
    b.sweep(
      catmull([
        [s * 0.115, 1.391, -0.214],
        [s * 0.151, 1.448, -0.16],
        [s * 0.15, 1.437, -0.07],
        [s * 0.124, 1.391, -0.031],
      ]),
      0.014,
      { color: C.deepTeal, bone: chest, sides: 8, name: "shoulder life-support hose" },
    );
    cylinder("hose coupling", [s * 0.124, 1.394, -0.031], 0.022, 0.027, C.orange, chest);
    b.sweep(
      catmull([
        [s * 0.12, 1.108, -0.205],
        [s * 0.181, 1.057, -0.168],
        [s * 0.174, 1.016, -0.091],
        [s * 0.134, 1.021, -0.049],
      ]),
      0.012,
      { color: C.dark, bone: chest, sides: 6, name: "return coolant hose" },
    );
  }
  // An open telemetry crown, mounted behind the head rather than over the face.
  for (const s of [1, -1]) {
    line("telemetry crown support", [s * 0.065, 1.39, -0.179], [s * 0.105, 1.539, -0.163], 0.015, brushed, chest);
  }
  const haloCenter = [0, 1.66, -0.164];
  const haloPath = arc(haloCenter, [-0.178, 1.555, -0.164], [0, 0, -1], 240);
  b.sweep(haloPath, 0.018, { color: C.dark, bone: chest, sides: 6, name: "open telemetry halo frame" });
  const haloLight = arc([0, 1.66, -0.142], [-0.178, 1.555, -0.142], [0, 0, -1], 240);
  glow(b.sweep(haloLight, 0.006, { color: C.cyan, bone: chest, sides: 5, name: "telemetry halo light" }), 0.8);
  b.along(haloPath, 7, (at) => {
    b.part(new THREE.BoxGeometry(0.031, 0.045, 0.033), ceramic, {
      frame: at, bone: chest, name: "halo segmented ceramic fitting",
    });
  });

  // Healing staff: a functional hand-height grip and a forked emitter with an open silhouette.
  const SX = 0.972;
  const SZ = -0.025;
  const staffAt = (y: number, dx = 0, dz = 0) => [SX + dx, y, SZ + dz];
  cylinder("staff main shaft", staffAt(0.965), 0.022, 1.69, brushed, staffBone);
  cylinder("staff bottom ferrule", staffAt(0.117), 0.032, 0.105, C.dark, staffBone);
  cylinder("staff orange foot bumper", staffAt(0.065), 0.028, 0.018, C.orange, staffBone);
  cylinder("staff lower ceramic sleeve", staffAt(0.35), 0.029, 0.345, ceramic, staffBone);
  cylinder("staff middle teal sleeve", staffAt(0.755), 0.028, 0.33, teal, staffBone);
  cylinder("staff grip", staffAt(1.319), 0.027, 0.215, C.dark, staffBone);
  for (let i = 0; i < 7; i++) {
    cylinder("staff grip rib", staffAt(1.23 + i * 0.029), 0.03, 0.01, C.rubber, staffBone);
  }
  for (const y of [0.186, 0.523, 0.588, 0.922, 1.18, 1.444, 1.708]) {
    cylinder("staff machined collar", staffAt(y), 0.034, 0.025, ceramic, staffBone);
    cylinder("staff collar reveal", staffAt(y - 0.015), 0.031, 0.006, C.deepTeal, staffBone);
  }
  for (const y of [0.535, 0.946, 1.456, 1.724]) {
    glow(cylinder("staff luminous induction ring", staffAt(y), 0.031, 0.014, C.cyan, staffBone), 0.9);
  }
  box("staff lower orange inset", staffAt(0.348, 0, 0.029), [0.016, 0.22, 0.006], C.orange, staffBone);
  box("staff upper telemetry spine", staffAt(1.59, 0, 0.027), [0.025, 0.19, 0.014], C.deepTeal, staffBone);
  glow(box("staff upper light stripe", staffAt(1.592, 0, 0.036), [0.01, 0.143, 0.007], C.cyan, staffBone), 1);

  cylinder("emitter neck socket", staffAt(1.775), 0.057, 0.105, C.deepTeal, staffBone);
  cylinder("emitter orange latch", staffAt(1.795), 0.063, 0.032, C.orange, staffBone);
  cylinder("emitter ceramic shoulder", staffAt(1.831), 0.075, 0.055, ceramic, staffBone);
  label("staff hazard chevrons", staffAt(1.831, 0, 0.076), [0.093, 0.038], chevrons, staffBone);

  for (const s of [1, -1]) {
    const branch = [
      staffAt(1.836, s * 0.044),
      staffAt(1.887, s * 0.109),
      staffAt(2.006, s * 0.163),
      staffAt(2.132, s * 0.13),
      staffAt(2.198, s * 0.072),
    ];
    b.sweep(branch, [0.037, 0.038, 0.031, 0.025, 0.014], {
      color: ceramic,
      bone: staffBone,
      section: "box",
      caps: "flat",
      name: "forked ceramic healing emitter",
    });
    const inlay = [
      staffAt(1.864, s * 0.055, 0.039),
      staffAt(1.909, s * 0.101, 0.039),
      staffAt(2.006, s * 0.13, 0.034),
      staffAt(2.119, s * 0.105, 0.026),
      staffAt(2.17, s * 0.064, 0.018),
    ];
    glow(b.sweep(inlay, [0.01, 0.008], {
      color: C.cyan, bone: staffBone, sides: 6, name: "emitter inward light channel",
    }), 1.3);
    box("emitter side heat sink", staffAt(2.001, s * 0.167, -0.006), [0.025, 0.087, 0.081], C.deepTeal, staffBone, [0, 0, s * 7]);
    for (let j = 0; j < 3; j++) {
      box("emitter heat sink rib", staffAt(1.975 + j * 0.023, s * 0.179, 0.035), [0.03, 0.008, 0.014], brushed, staffBone);
    }
    cylinder("emitter pivot face", staffAt(1.885, s * 0.103, 0.045), 0.027, 0.012, C.deepTeal, staffBone, [0, 0, 1]);
    cylinder("emitter pivot orange core", staffAt(1.885, s * 0.103, 0.054), 0.014, 0.009, C.orange, staffBone, [0, 0, 1]);
    screw(staffAt(2.119, s * 0.127, 0.03), staffBone);
  }

  cylinder("core pedestal", staffAt(1.9), 0.036, 0.095, brushed, staffBone);
  glow(b.part(new THREE.OctahedronGeometry(0.068, 0), C.cyan, {
    bone: staffBone,
    at: staffAt(1.998),
    scale: [0.78, 1.55, 0.78],
    name: "suspended restorative crystal",
  }), 1.2);
  glow(b.part(new THREE.OctahedronGeometry(0.029, 0), C.mint, {
    bone: staffBone,
    at: staffAt(1.998, 0, 0.034),
    scale: [0.7, 1.7, 0.5],
    name: "crystal bright central facet",
  }), 1.4);
  const orbit = arc(staffAt(1.998), staffAt(1.998, 0.094), [0.15, 1, 0.2], 360);
  b.sweep(orbit, 0.007, {
    color: C.gold, bone: staffBone, sides: 6, name: "crystal stabilizing orbit",
  });
  for (const s of [1, -1]) {
    line("orbit structural bridge", staffAt(1.998, s * 0.09), staffAt(1.998, s * 0.143), 0.009, brushed, staffBone);
  }

  // A few restrained service marks; no extraneous stage or surrounding scenery.
  for (let i = 0; i < 4; i++) {
    const x = -0.047 + i * 0.031;
    box("backpack lower vent", [x, 1.205, -0.239], [0.016, 0.039, 0.008], C.dark, chest);
  }
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const y = 1.207 + i * 0.027;
      box("rib ventilation slot", [s * 0.186, y, 0.059], [0.018, 0.009, 0.026], C.dark, chest, [0, s * 30, 0]);
    }
  }
  // Deterministic, small service chips on the boot toe bumpers.
  for (const L of limbs) {
    for (let i = 0; i < 3; i++) {
      box(
        "toe bumper wear mark",
        [L.s * 0.145 + (random() - 0.5) * 0.105, 0.063 + random() * 0.014, 0.225],
        [0.007 + random() * 0.007, 0.003, 0.002],
        C.steel,
        L.leg.tip!,
      );
    }
  }

  return b.root;
}
```