```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  lerp,
  catmull,
  bezier,
  rng,
  paint,
  noise,
  mix,
  svg,
} from "agentic-3js-builder";
import type {
  Fill,
  Joint,
  PointInput,
  DirectionInput,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

/*
  Art-direction changes:
  1. Rebuild the face with a continuous, separately rigged jaw, larger expressive
     eyes, a smaller nose and a swept haircut; remove the stacked-chin appearance.
  2. Replace boxy shoulder and limb transitions with chamfered, overlapping shells.
     Strengthen the heroic chest-to-waist taper and shorten the exposed neck.
  3. Make the cyborg construction unmistakable: exposed forearm mechanisms,
     reinforced spinal hardware and an asymmetric prosthetic lower leg.
  4. Rebuild the rescue vanes as tapered, articulated ivory blades with illuminated
     inset channels rather than dark rectangular paddles.
  5. Refine the staff crown, add a suspended induction crystal and sharpen the
     shared medical graphics. Darken the platform so the character remains the hero.
*/

export const meta = {
  name: "VITA-07 • Field Angel",
  description:
    "An expressive, heroic cyborg medic in ivory rescue armor, with articulated induction vanes, an asymmetric prosthetic leg, a diagnostic gauntlet and a luminous healing staff.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "VITA-07 Field Angel",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(70417);

  const C = {
    ivory: "#edf2e9",
    cream: "#fff7df",
    edge: "#b4d0cf",
    teal: "#167e8b",
    deepTeal: "#15505e",
    navy: "#192c40",
    dark: "#102330",
    joint: "#344e60",
    silver: "#a9c4c7",
    mint: "#6dffd1",
    mintPale: "#d1ffe7",
    amber: "#ffac48",
    orange: "#dd762c",
    skin: "#dba18a",
    hair: "#dfebe2",
  };

  const ceramic = paint((p, n) => {
    const t = Math.max(0, Math.min(1, 0.55 + n.y * 0.32 + n.z * 0.2));
    return mix(p.y < 0.29 ? "#93b3bb" : "#a6c2cb", "#fff8e7", t);
  });
  const teal = paint((p, n) =>
    mix(
      "#144b60",
      "#2699a1",
      Math.max(
        0,
        Math.min(1, 0.52 + n.y * 0.26 + n.z * 0.16 + (noise(p, 0.12, 4) - 0.5) * 0.1),
      ),
    ),
  );
  const undersuit = paint((_p, n) =>
    mix("#152438", "#365765", 0.35 + n.y * 0.19 + n.z * 0.17),
  );
  const skin = paint((_p, n) =>
    mix("#b87e73", "#f2c3a4", Math.max(0.12, Math.min(1, 0.64 + n.y * 0.16 + n.z * 0.17))),
  );
  const hair = paint((_p, n) => {
    const light = n.y * 0.75 + n.z * 0.16;
    return light > 0.43 ? "#f1f5e8" : light > -0.18 ? "#c2d8d6" : "#81a2ad";
  });
  const metal = paint((p, n) =>
    mix(
      "#587888",
      "#d1e0dc",
      Math.max(0, Math.min(1, 0.49 + n.y * 0.3 + n.z * 0.16 + (noise(p, 0.1, 2) - 0.5) * 0.06)),
    ),
  );
  const cloth = paint((p, n) => {
    const weave = Math.sin(p.y * 950) * Math.sin(p.x * 950) * 0.025;
    return mix("#164858", "#2c858d", 0.55 + n.y * 0.12 + n.z * 0.16 + weave);
  });

  // --------------------------------------------------------------------------
  // Shared graphic language.
  // --------------------------------------------------------------------------

  const eyeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 100">
      <path d="M17 19 Q61 4 119 18" fill="none" stroke="#59403e"
        stroke-width="8" stroke-linecap="round"/>
      <path d="M9 53 Q31 26 73 29 Q111 29 135 49
        Q109 77 70 75 Q31 75 9 53Z" fill="#26313d"/>
      <path d="M19 52 Q40 34 73 36 Q103 35 122 49
        Q103 68 70 67 Q40 67 19 52Z" fill="#fff9e9"/>
      <clipPath id="e"><path d="M19 52 Q40 34 73 36 Q103 35 122 49
        Q103 68 70 67 Q40 67 19 52Z"/></clipPath>
      <g clip-path="url(#e)">
        <ellipse cx="74" cy="51" rx="23" ry="27" fill="#16535e"/>
        <ellipse cx="74" cy="55" rx="18" ry="22" fill="#4dbdab"/>
        <path d="M60 63 Q74 77 91 58" fill="none" stroke="#b4ffdb" stroke-width="6"/>
        <ellipse cx="74" cy="51" rx="9" ry="20" fill="#15313e"/>
        <ellipse cx="65" cy="42" rx="7" ry="8" fill="#ffffff"/>
        <circle cx="84" cy="61" r="3.4" fill="#ffffff"/>
      </g>
      <path d="M11 51 L3 40 M126 44 L139 40" fill="none" stroke="#26313d"
        stroke-width="5" stroke-linecap="round"/>
      <path d="M31 82 Q70 91 111 78" fill="none"
        stroke="#bf7d75" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`,
    { size: 512 },
  );

  const mouthTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 48">
      <path d="M16 19 Q38 25 61 22 Q84 26 110 15"
        stroke="#87494d" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M29 24 Q63 35 95 23" fill="#bc7977"/>
      <path d="M39 28 Q64 33 84 27" stroke="#efb29a" stroke-width="4"
        fill="none" stroke-linecap="round"/>
      <path d="M106 13 L112 18" stroke="#a66b66" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const medicalTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <path d="M64 5 L110 23 L116 64 Q108 104 64 122
        Q20 104 12 64 L18 23Z" fill="#153e4d" stroke="#a8e3d6" stroke-width="4"/>
      <path d="M64 17 L100 31 L105 63 Q98 93 64 109
        Q30 93 23 63 L28 31Z" fill="#238b92"/>
      <path d="M52 34 H76 V52 H94 V76 H76 V94 H52 V76 H34 V52 H52Z"
        fill="#f2ffe9"/>
      <path d="M52 34 H76 V40 H58 V52 H52Z" fill="#9bffd7"/>
      <path d="M29 91 L39 99 M99 91 L89 99" stroke="#ffb24f" stroke-width="6"/>
    </svg>`,
    { size: 384 },
  );

  const unitTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 120">
      <rect width="180" height="120" rx="12" fill="#163e4e"/>
      <path d="M10 13 H170 M10 106 H170" stroke="#73ccbd" stroke-width="3"/>
      <text x="90" y="81" text-anchor="middle" font-family="sans-serif"
        font-size="81" font-weight="900" fill="#f3f5dd">07</text>
      <text x="90" y="100" text-anchor="middle" font-family="sans-serif"
        font-size="12" font-weight="700" letter-spacing="3" fill="#85e1c8">RESPONSE</text>
      <path d="M11 29 H24 M156 29 H169" stroke="#ffb04c" stroke-width="7"/>
    </svg>`,
    { size: 384 },
  );

  const monitorTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 128">
      <rect width="192" height="128" rx="8" fill="#0a3042"/>
      <path d="M10 34 H182 M10 64 H182 M10 94 H182 M32 12 V116
        M64 12 V116 M96 12 V116 M128 12 V116 M160 12 V116"
        stroke="#225b68" stroke-width="2" fill="none"/>
      <text x="12" y="23" font-family="sans-serif" font-size="14"
        font-weight="bold" fill="#c1ffdf">PATIENT LINK</text>
      <path d="M10 70 H37 L47 58 L58 80 L70 30 L82 96
        L94 64 H124 L136 51 L148 69 H182" fill="none" stroke="#84ffcc"
        stroke-width="5" stroke-linejoin="round"/>
      <text x="128" y="114" font-family="monospace" font-size="28"
        font-weight="bold" fill="#ffe5a8">98</text>
      <path d="M14 104 H38 M26 92 V116" stroke="#b5ffe1" stroke-width="5"/>
    </svg>`,
    { size: 384 },
  );

  const equipmentTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 288 96">
      <rect width="288" height="96" rx="8" fill="#e8ecd9"/>
      <rect x="7" y="7" width="274" height="82" rx="4"
        fill="none" stroke="#224955" stroke-width="4"/>
      <path d="M17 17 H51 V49 H17Z" fill="#f4ab43"/>
      <path d="M34 21 L47 44 H21Z" fill="#1a3948"/>
      <path d="M33 27 H36 V35 H33Z M33 38 H36 V41 H33Z" fill="#ffe7ae"/>
      <text x="62" y="38" font-family="sans-serif" font-size="25"
        font-weight="900" fill="#173c49">VITA SYSTEMS</text>
      <text x="18" y="66" font-family="monospace" font-size="16"
        fill="#345d67">BIO-INDUCTION / Mk.07</text>
      <path d="M18 77 H134 M153 77 H267" stroke="#237883" stroke-width="4"/>
    </svg>`,
    { size: 512 },
  );

  const inductionTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <circle cx="80" cy="80" r="72" fill="none" stroke="#65ffd1" stroke-width="4"/>
      <circle cx="80" cy="80" r="60" fill="none" stroke="#c0ffe2"
        stroke-width="4" stroke-dasharray="13 9"/>
      <path d="M69 46 H91 V69 H114 V91 H91 V114 H69 V91 H46 V69 H69Z"
        fill="#caffdf" stroke="#268b90" stroke-width="3"/>
      <path d="M80 5 V22 M80 138 V155 M5 80 H22 M138 80 H155"
        stroke="#fff2b2" stroke-width="5"/>
    </svg>`,
    { size: 384 },
  );

  const clothTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 256">
      <path d="M10 8 V232 L48 250 L86 232 V8" fill="none"
        stroke="#76b9b9" stroke-width="3" stroke-dasharray="6 5"/>
      <path d="M19 198 V224 L48 238 L77 224 V198"
        fill="none" stroke="#f3ad50" stroke-width="7"/>
      <path d="M38 143 H58 V159 H74 V179 H58 V195 H38 V179 H22 V159 H38Z"
        fill="#afdfd0"/>
      <path d="M23 37 H73 M23 49 H73 M23 61 H51" stroke="#5c9d9f" stroke-width="4"/>
    </svg>`,
    { size: 384 },
  );

  const baseTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 84">
      <rect width="420" height="84" rx="6" fill="#102d3d"/>
      <path d="M10 10 H410 M10 74 H410" stroke="#58baac" stroke-width="3"/>
      <path d="M24 24 H42 V33 H51 V51 H42 V60 H24 V51 H15 V33 H24Z"
        fill="#a1ffd8"/>
      <text x="70" y="40" font-family="sans-serif" font-weight="900"
        font-size="27" letter-spacing="4" fill="#f5f1da">VITA // 07</text>
      <text x="72" y="61" font-family="sans-serif" font-size="12"
        letter-spacing="4" fill="#91c9c3">FIELD RESPONSE DIVISION</text>
      <path d="M370 24 L393 42 L370 60" stroke="#ffb04c"
        stroke-width="7" fill="none"/>
    </svg>`,
    { size: 768 },
  );

  // --------------------------------------------------------------------------
  // Skeleton, including movable jaw, digits, vanes and held staff.
  // --------------------------------------------------------------------------

  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: root,
    at: [0, 1.065, 0],
    dir: [0, 1, 0],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [[0, 1.065, 0], [0, 1.27, 0], [0, 1.505, 0], [0, 1.66, 0]],
    {
      parent: hips,
      names: ["spineLower", "spineUpper", "chest", "neckBase"],
      role: "spine",
    },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neckChain",
    [[0, 1.66, 0], [0, 1.766, 0.015]],
    { parent: spine.tip!, names: ["neck", "headMount"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.925, 0.025],
    dir: [0, 0, 1],
    role: "head",
  });
  const H = 1.08;
  const face = b.region({ at: head, scale: H, bone: head });
  const jaw = face.joint("jaw", {
    parent: head,
    at: [0, -0.075, -0.032],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const sideData = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      [[s * 0.323, 1.625, 0], [s * 0.65, 1.475, 0.015], [s * 0.943, 1.395, 0.035]],
      {
        parent: chest,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        role: "arm",
      },
    );
    const hand = b.joint(`hand${side}`, {
      parent: arm.tip!,
      at: [s * 0.995, 1.385, 0.04],
      dir: [s, -0.15, 0],
      role: "arm",
    });
    const fingers = Array.from({ length: 4 }, (_, i) => {
      const y = 1.389 + (i - 1.5) * 0.029;
      const points = s > 0
        ? [
            [1.024, y, 0.047],
            [1.087 + (i === 1 ? 0.011 : 0), y - 0.004, 0.053],
            [1.132 + (i === 1 ? 0.013 : 0), y - 0.008, 0.061],
          ]
        : [
            [-1.018, y, 0.083],
            [-1.091, y - 0.003, 0.088],
            [-1.112, y - 0.006, 0.023],
          ];
      return b.chain(`digit${i + 1}${side}`, points, {
        parent: hand,
        names: [`finger${i + 1}${side}`, `finger${i + 1}Tip${side}`],
        role: "digit",
      });
    });
    const thumb = b.chain(
      `thumbChain${side}`,
      [
        [s * 0.981, 1.351, 0.075],
        [s * 1.015, 1.316, 0.109],
        [s * 1.061, 1.323, 0.111],
      ],
      { parent: hand, names: [`thumb${side}`, `thumbTip${side}`], role: "digit" },
    );
    const leg = b.chain(
      `leg${side}`,
      [[s * 0.145, 1.075, 0], [s * 0.19, 0.716, 0.045], [s * 0.195, 0.345, -0.008]],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [s * 0.195, 0.115, 0.12],
      },
    );
    const wing = b.joint(`rescueVanes${side}`, {
      parent: chest,
      at: [s * 0.205, 1.58, -0.23],
      dir: [s * 0.5, 0.7, -0.15],
      role: "wing",
    });
    const specs = [
      { a: [s * 0.25, 1.62, -0.285], z: [s * 0.45, 2.075, -0.315], w: 0.104 },
      { a: [s * 0.278, 1.554, -0.29], z: [s * 0.705, 1.939, -0.327], w: 0.117 },
      { a: [s * 0.288, 1.486, -0.29], z: [s * 0.825, 1.723, -0.32], w: 0.121 },
    ];
    const vanes = specs.map((spec, i) => {
      const joint = b.joint(`vane${i + 1}${side}`, {
        parent: wing,
        at: spec.a,
        aim: spec.z,
        role: "wing",
      });
      return { ...spec, joint };
    });
    return { s, side, arm, hand, fingers, thumb, leg, wing, vanes };
  });

  const staffX = -1.064;
  const staffZ = 0.039;
  const staff = b.joint("healingStaff", {
    parent: sideData[1].hand,
    at: [staffX, 1.39, staffZ],
    dir: [0, 1, 0],
    role: "hinge",
  });

  // --------------------------------------------------------------------------
  // Reusable primitive assemblies.
  // --------------------------------------------------------------------------

  function box(
    at: PointInput,
    size: [number, number, number],
    color: Fill,
    bone: Joint = root,
    rotation?: [number, number, number],
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, { at, bone, rotation });
  }

  function ell(
    at: PointInput,
    radii: [number, number, number],
    color: Fill,
    bone: Joint,
    segments = 12,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 8), color, {
      at, bone, scale: radii, flat: true,
    });
  }

  function cyl(
    at: PointInput,
    radius: number,
    height: number,
    color: Fill,
    bone: Joint,
    dir: DirectionInput = [0, 1, 0],
    segments = 10,
  ) {
    return b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at, bone, dir,
    });
  }

  function plate(
    at: PointInput,
    outline: number[][],
    thickness: number,
    color: Fill,
    bone: Joint,
    bevel = 0.008,
  ) {
    return b.extrude(outline, {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      bevel,
      color,
      bone,
    });
  }

  function image(
    at: PointInput,
    width: number,
    height: number,
    texture: THREE.Texture,
    bone: Joint,
    dir: DirectionInput = [0, 0, 1],
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at, bone, texture, dir, axis: "z",
    });
  }

  function bolt(at: PointInput, bone: Joint, radius = 0.01) {
    return cyl(at, radius, 0.009, metal, bone, [0, 0, 1], 6);
  }

  function light(
    a: PointInput,
    z: PointInput,
    radius: number,
    bone: Joint,
    color = C.mint,
  ) {
    return glow(b.rod(a, z, radius, {
      color, bone, sides: 6, caps: "flat",
    }), 1.05);
  }

  function panelBox(
    at: PointInput,
    w: number,
    h: number,
    depth: number,
    color: Fill,
    bone: Joint,
    cut = 0.018,
  ) {
    return plate(
      at,
      [
        [-w / 2 + cut, -h / 2],
        [w / 2 - cut, -h / 2],
        [w / 2, -h / 2 + cut],
        [w / 2, h / 2 - cut],
        [w / 2 - cut, h / 2],
        [-w / 2 + cut, h / 2],
        [-w / 2, h / 2 - cut],
        [-w / 2, -h / 2 + cut],
      ],
      depth, color, bone, Math.min(cut * 0.4, depth * 0.23),
    );
  }

  // --------------------------------------------------------------------------
  // Face: two matching spherical sections make one closed neutral silhouette.
  // The lower section can open without a second chin protruding through the face.
  // --------------------------------------------------------------------------

  const jawCut = 2.12;
  const skull = face.part(
    new THREE.SphereGeometry(1, 24, 14, 0, Math.PI * 2, 0, jawCut),
    skin,
    {
      at: [0, 0, 0],
      scale: [0.151, 0.18, 0.143],
      bone: head,
    },
  );
  const lowerFace = face.part(
    new THREE.SphereGeometry(1, 24, 8, 0, Math.PI * 2, jawCut, Math.PI - jawCut),
    skin,
    {
      at: [0, 0, 0],
      scale: [0.151, 0.18, 0.143],
      bone: jaw,
    },
  );

  for (const s of [1, -1]) {
    b.decal(skull, eyeTex, {
      at: face.p([s * 0.067, 0.028, 0.132]),
      dir: [s * 0.15, 0.025, 1],
      size: [face.s(0.112), face.s(0.078)],
      mirror: s > 0,
      bone: head,
      segments: 9,
      lift: 0.002,
    });

    cyl(face.p([s * 0.157, 0.003, -0.017]), 0.054, 0.038, C.navy, head, [s, 0, 0], 12);
    cyl(face.p([s * 0.177, 0.003, -0.017]), 0.043, 0.018, ceramic, head, [s, 0, 0], 12);
    glow(cyl(face.p([s * 0.189, 0.003, -0.017]), 0.025, 0.012, C.mint, head, [s, 0, 0]), 0.8);

    // Deliberate cheek hardware, confined outside the eye and mouth.
    b.sweep(
      [
        face.p([s * 0.14, 0.073, 0.05]),
        face.p([s * 0.14, -0.014, 0.065]),
        face.p([s * 0.119, -0.061, 0.072]),
      ],
      [0.018, 0.015, 0.011],
      { bone: head, color: ceramic, section: "box", caps: "flat" },
    );
    light(
      face.p([s * 0.142, 0.047, 0.069]),
      face.p([s * 0.14, -0.014, 0.081]),
      0.0045,
      head,
    );
    ell(face.p([s * 0.113, -0.051, 0.105]), [0.009, 0.0045, 0.004], C.edge, head, 8);
  }

  b.extrude(
    [
      [-0.003, 0.028],
      [0.011, 0.031],
      [0.031, -0.011],
      [0.017, -0.021],
      [-0.004, -0.018],
    ],
    {
      at: face.p([0, -0.022, 0.134]),
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: face.s(0.026),
      bevel: 0.004,
      color: skin,
      bone: head,
    },
  );
  // The mouth straddles the upper/lower boundary visually, but rides the jaw.
  b.decal([skull, lowerFace], mouthTex, {
    at: face.p([0, -0.091, 0.125]),
    dir: [0, 0, 1],
    size: [face.s(0.084), face.s(0.03)],
    bone: jaw,
    segments: 7,
    lift: 0.0018,
  });

  // Close-fitting posterior helmet leaves the cheeks human.
  face.part(
    new THREE.SphereGeometry(1, 16, 10, Math.PI * 0.03, Math.PI * 0.94),
    C.navy,
    {
      at: [0, 0.018, -0.044],
      scale: [0.158, 0.171, 0.109],
      rotation: [0, 180, 0],
      bone: head,
      flat: true,
    },
  );

  // Solid cap plus broad swept locks. No vertical stack of disconnected plates.
  face.part(
    new THREE.SphereGeometry(1, 18, 8, 0, Math.PI * 2, 0, Math.PI * 0.48),
    hair,
    {
      at: [0, 0.052, -0.013],
      scale: [0.162, 0.153, 0.144],
      bone: head,
      flat: true,
    },
  );
  const hairLocks = [
    { x: -0.124, y: 0.1, w: 0.051, h: 0.074, shift: 0.019, z: 0.076 },
    { x: -0.085, y: 0.12, w: 0.066, h: 0.091, shift: 0.04, z: 0.099 },
    { x: -0.034, y: 0.131, w: 0.076, h: 0.104, shift: 0.061, z: 0.11 },
    { x: 0.024, y: 0.132, w: 0.081, h: 0.107, shift: 0.071, z: 0.107 },
    { x: 0.079, y: 0.117, w: 0.065, h: 0.091, shift: 0.046, z: 0.084 },
  ];
  for (const lock of hairLocks) {
    const { w, h, shift } = lock;
    plate(
      face.p([lock.x, lock.y, lock.z]),
      [
        [-w * 0.5, -h * 0.09],
        [-w * 0.44, h * 0.47],
        [w * 0.08 + shift, h * 0.62],
        [w * 0.55 + shift, h * 0.25],
        [w * 0.37, -h * 0.52],
        [-w * 0.12, -h * 0.25],
      ],
      0.042,
      hair,
      head,
      0.006,
    );
  }
  for (const s of [1, -1]) {
    b.sweep(
      [
        face.p([s * 0.136, 0.11, -0.033]),
        face.p([s * 0.15, 0.061, -0.031]),
        face.p([s * 0.15, 0.016, -0.036]),
      ],
      [0.028, 0.025, 0.013],
      { bone: head, color: hair, section: "box", caps: "flat" },
    );
  }

  b.rod(face.p([-0.17, 0.035, -0.044]), face.p([-0.19, 0.173, -0.064]), 0.007, {
    color: C.navy, bone: head, sides: 6,
  });
  glow(ell(face.p([-0.19, 0.173, -0.064]), [0.01, 0.016, 0.01], C.amber, head), 0.8);
  b.sweep(
    bezier(
      face.p([-0.165, -0.014, 0]),
      face.p([-0.169, -0.09, 0.11]),
      face.p([-0.081, -0.085, 0.154]),
    ),
    0.005,
    { bone: head, color: C.navy, sides: 6 },
  );
  ell(face.p([-0.075, -0.085, 0.154]), [0.016, 0.008, 0.01], C.joint, head);

  // --------------------------------------------------------------------------
  // Torso: a readable hero silhouette with a fitted core under floating shells.
  // --------------------------------------------------------------------------

  b.loft(
    [
      { at: [0, 1.065, 0], w: 0.378, h: 0.253 },
      { at: [0, 1.24, 0], w: 0.345, h: 0.249 },
      { at: [0, 1.49, 0], w: 0.495, h: 0.298 },
      { at: [0, 1.625, 0], w: 0.391, h: 0.238 },
    ],
    { bone: [hips, spine], color: undersuit, sides: 10, caps: "flat" },
  );

  const chestShape = [
    [-0.224, 0.1],
    [-0.202, 0.237],
    [-0.13, 0.284],
    [-0.062, 0.277],
    [0, 0.25],
    [0.062, 0.277],
    [0.13, 0.284],
    [0.202, 0.237],
    [0.224, 0.1],
    [0.154, -0.026],
    [0.052, -0.075],
    [-0.052, -0.075],
    [-0.154, -0.026],
  ];
  plate([0, 1.355, 0.133], chestShape, 0.078, teal, chest, 0.013);
  const chestPlate = plate(
    [0, 1.369, 0.173],
    chestShape.map(([x, y]) => [x * 0.926, y * 0.906]),
    0.064,
    ceramic,
    chest,
    0.012,
  );
  b.decal(chestPlate, medicalTex, {
    at: [0, 1.515, 0.209],
    dir: [0, 0, 1],
    size: [0.137, 0.137],
    lift: 0.002,
    segments: 3,
    bone: chest,
  });

  for (const s of [1, -1]) {
    panelBox([s * 0.145, 1.467, 0.211], 0.082, 0.042, 0.014, C.navy, chest, 0.007);
    for (let i = 0; i < 3; i++) {
      box(
        [s * (0.122 + i * 0.019), 1.467, 0.223],
        [0.008, 0.025, 0.005],
        C.amber,
        chest,
        [0, 0, -s * 14],
      );
    }
    bolt([s * 0.164, 1.584, 0.215], chest, 0.009);
    bolt([s * 0.127, 1.388, 0.213], chest, 0.008);
    light([s * 0.067, 1.595, 0.212], [s * 0.13, 1.61, 0.212], 0.0055, chest);

    b.extrude(
      [
        [-0.1, 0],
        [0.093, 0],
        [0.12, 0.116],
        [0.1, 0.229],
        [-0.082, 0.218],
        [-0.116, 0.11],
      ],
      {
        at: [s * 0.174, 1.23, 0],
        x: [0, 0, 1], y: [0, 1, 0],
        thickness: 0.052, bevel: 0.007, color: teal, bone: spine.joints[1],
      },
    );
    b.rod([s * 0.205, 1.249, 0.073], [s * 0.229, 1.43, 0.088], 0.016, {
      bone: spine.joints[1], color: C.navy, sides: 6,
    });
    for (let i = 0; i < 3; i++) {
      box(
        [s * (0.17 + i * 0.013), 1.293 + i * 0.047, 0.018],
        [0.039, 0.026, 0.218],
        i === 1 ? teal : ceramic,
        spine.joints[1],
        [0, 0, -s * 13],
      );
    }
  }

  for (let i = 0; i < 3; i++) {
    plate(
      [0, 1.196 + i * 0.054, 0.132 + i * 0.011],
      [
        [-0.1 - i * 0.009, 0.018],
        [0.1 + i * 0.009, 0.018],
        [0.085 + i * 0.009, -0.02],
        [0, -0.035],
        [-0.085 - i * 0.009, -0.02],
      ],
      0.026,
      i === 2 ? ceramic : teal,
      spine.joints[0],
      0.005,
    );
  }

  b.sweep(neck, 0.071, { color: C.navy, sides: 10, caps: "flat" });
  for (const s of [1, -1]) {
    b.rod([s * 0.046, 1.693, 0.049], [s * 0.043, 1.764, 0.059], 0.012, {
      color: metal, bone: neck.joints[0], sides: 6,
    });
  }
  b.lathe(
    [[0.083, 0], [0.15, 0], [0.151, 0.03], [0.125, 0.055], [0.083, 0.049]],
    { at: [0, 1.644, 0], segments: 12, color: ceramic, bone: chest },
  );
  light([-0.077, 1.679, 0.124], [0.077, 1.679, 0.124], 0.007, chest);

  b.sweep(
    catmull(
      [
        [0, 1.11, 0.145], [0.181, 1.108, 0.093], [0.202, 1.107, -0.05],
        [0, 1.104, -0.149], [-0.202, 1.107, -0.05], [-0.181, 1.108, 0.093],
      ],
      { closed: true },
    ),
    0.032,
    { bone: hips, color: C.navy, section: "box" },
  );
  plate(
    [0, 1.099, 0.155],
    [[-0.074, 0.041], [0.074, 0.041], [0.08, -0.027], [0, -0.053], [-0.08, -0.027]],
    0.032,
    ceramic,
    hips,
  );
  cyl([0, 1.101, 0.177], 0.038, 0.016, C.deepTeal, hips, [0, 0, 1]);
  glow(cyl([0, 1.101, 0.188], 0.024, 0.01, C.mint, hips, [0, 0, 1]), 0.9);

  for (const s of [1, -1]) {
    plate(
      [s * 0.139, 1.027, 0.13],
      [
        [-0.073, 0.063], [0.064, 0.047], [0.077, -0.08],
        [0.022, -0.11], [-0.059, -0.071],
      ],
      0.047, ceramic, hips, 0.009,
    );
    panelBox([s * 0.23, 1.064, -0.008], 0.085, 0.143, 0.126, teal, hips, 0.012);
    box([s * 0.23, 1.113, -0.006], [0.095, 0.026, 0.137], ceramic, hips);
    box([s * 0.23, 1.058, 0.059], [0.039, 0.049, 0.015], C.navy, hips);
    box([s * 0.23, 1.058, 0.071], [0.013, 0.036, 0.007], C.amber, hips);
  }

  // Split rescue-coat panels introduce a restrained cloth note behind the legs.
  for (const s of [1, -1]) {
    const coat = plate(
      [s * 0.145, 1.062, -0.134],
      [
        [-0.085, 0.017], [0.072, 0.017], [0.09, -0.226],
        [0.042, -0.306], [-0.075, -0.275],
      ],
      0.018, cloth, hips, 0.002,
    );
    b.decal(coat, clothTex, {
      at: [s * 0.145, 0.914, -0.146],
      dir: [0, 0, -1],
      size: [0.133, 0.287],
      lift: 0.0015,
      segments: 3,
      bone: hips,
    });
  }

  // --------------------------------------------------------------------------
  // Shoulders, articulated arms and readable separated hands.
  // --------------------------------------------------------------------------

  for (const data of sideData) {
    const { s, arm, hand, fingers, thumb } = data;
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const wrist = arm.tip!;

    b.sweep(arm, [0.078, 0.061, 0.048], { color: undersuit, sides: 8 });
    ell(shoulder, [0.11, 0.105, 0.111], C.joint, shoulder);
    ell(elbow, [0.07, 0.07, 0.071], C.joint, elbow);

    const shoulderShape = [
      [-0.128, -0.061], [-0.132, 0.035], [-0.094, 0.086],
      [-0.03, 0.103], [0.083, 0.083], [0.139, 0.025],
      [0.124, -0.066], [0.063, -0.098], [-0.05, -0.097],
    ];
    plate([s * 0.336, 1.648, 0.005], shoulderShape, 0.237, ceramic, shoulder, 0.018);
    plate(
      [s * 0.336, 1.643, 0.132],
      [
        [-0.101, 0.027], [-0.07, 0.052], [0.067, 0.045],
        [0.1, -0.013], [0.073, -0.057], [-0.077, -0.058],
      ],
      0.019, teal, shoulder, 0.006,
    );
    image([s * 0.336, 1.645, 0.145], s > 0 ? 0.092 : 0.107, 0.084,
      s > 0 ? medicalTex : unitTex, shoulder);
    for (const dx of [-0.098, 0.098]) {
      bolt([s * 0.336 + dx, 1.659, 0.143], shoulder, 0.008);
    }
    box(
      [s * 0.394, 1.724, 0.044],
      [0.039, 0.016, 0.117],
      C.amber, shoulder, [0, 0, -s * 14],
    );

    // Tapered upper-arm shells are explicitly aligned to the arm's axis.
    b.sweep(arm, (t) => [0.082 - t * 0.019, 0.082 - t * 0.014], {
      from: 0.15,
      to: 0.425,
      bone: shoulder,
      color: ceramic,
      section: { ngon: 8 },
      caps: "flat",
    });
    b.rod(
      lerp(shoulder, elbow, 0.28).add(new THREE.Vector3(0, -0.038, -0.074)),
      lerp(shoulder, elbow, 0.87).add(new THREE.Vector3(0, -0.028, -0.061)),
      0.017,
      { color: metal, bone: shoulder, sides: 6 },
    );

    cyl([s * 0.65, 1.475, 0.092], 0.06, 0.029, C.navy, elbow, [0, 0, 1], 12);
    cyl([s * 0.65, 1.475, 0.112], 0.042, 0.014, ceramic, elbow, [0, 0, 1], 12);
    cyl([s * 0.65, 1.475, 0.122], 0.021, 0.009, metal, elbow, [0, 0, 1], 6);

    if (s > 0) {
      // Diagnostic forearm: broad white shell around the inset patient monitor.
      b.sweep(arm, (t) => [0.093 - (t - 0.5) * 0.075, 0.09 - (t - 0.5) * 0.065], {
        from: 0.575,
        to: 0.94,
        bone: elbow,
        color: ceramic,
        section: { ngon: 8 },
        caps: "flat",
      });
      panelBox([0.802, 1.452, 0.113], 0.172, 0.115, 0.03, C.navy, elbow, 0.016);
      glow(image([0.802, 1.452, 0.13], 0.15, 0.1, monitorTex, elbow), 0.72);
      bolt([0.728, 1.452, 0.137], elbow, 0.006);
      bolt([0.876, 1.452, 0.137], elbow, 0.006);
    } else {
      // Exposed cybernetic forearm: one central core, paired pistons and a top shield.
      b.rod(lerp(elbow, wrist, 0.12), lerp(elbow, wrist, 0.94), 0.044, {
        bone: elbow, color: C.navy, sides: 8,
      });
      for (const dz of [-0.051, 0.051]) {
        const a = lerp(elbow, wrist, 0.17).add(new THREE.Vector3(0, -0.035, dz));
        const z = lerp(elbow, wrist, 0.87).add(new THREE.Vector3(0, -0.027, dz));
        b.rod(a, z, 0.015, { bone: elbow, color: metal, sides: 6 });
        b.rod(a, lerp(a, z, 0.47), 0.022, { bone: elbow, color: teal, sides: 8 });
      }
      b.frustumBox(
        lerp(elbow, wrist, 0.22).add(new THREE.Vector3(0, 0.044, 0.007)),
        lerp(elbow, wrist, 0.88).add(new THREE.Vector3(0, 0.035, 0.007)),
        [0.117, 0.085], [0.09, 0.069],
        { bone: elbow, color: ceramic },
      );
      panelBox([-0.804, 1.449, 0.096], 0.168, 0.078, 0.025, teal, elbow, 0.012);
      for (let i = 0; i < 3; i++) {
        const x = -0.751 - i * 0.052;
        cyl([x, 1.446, 0.116], 0.018, 0.06, C.navy, elbow);
        glow(cyl([x, 1.446, 0.116], 0.012, 0.04, C.mint, elbow), 0.8);
        cyl([x, 1.48, 0.116], 0.02, 0.013, ceramic, elbow);
      }
    }

    cyl(wrist, 0.062, 0.041, C.navy, wrist, [s, -0.2, 0]);
    cyl(lerp(elbow, wrist, 0.91), 0.069, 0.022, teal, elbow, [s, -0.2, 0]);

    panelBox([s * 0.995, 1.386, 0.04], 0.095, 0.112, 0.082, C.navy, hand, 0.013);
    plate(
      [s * 0.995, 1.387, 0.087],
      [
        [-0.039, 0.036], [0.037, 0.039], [0.044, -0.025],
        [0.017, -0.043], [-0.037, -0.029],
      ],
      0.022, ceramic, hand, 0.005,
    );
    light([s * 0.982, 1.388, 0.102], [s * 1.013, 1.388, 0.102], 0.0045, hand);

    for (const digit of [...fingers, thumb]) {
      b.sweep(digit, [0.0125, 0.0105, 0.0085], {
        color: C.joint, sides: 6, skin: "rigid",
      });
      b.sweep(digit, 0.013, {
        from: 0.6, to: 0.91, color: ceramic, sides: 6, caps: "flat",
      });
      ell(digit.at(0.47), [0.014, 0.014, 0.013], C.navy, digit.joints[1], 8);
    }
  }

  // --------------------------------------------------------------------------
  // Legs. The left lower leg is an unmistakable functional prosthesis.
  // --------------------------------------------------------------------------

  for (const data of sideData) {
    const { s, leg } = data;
    const hip = leg.joints[0];
    const knee = leg.joints[1];
    const ankle = leg.tip!;

    b.sweep(leg, [0.108, 0.078, 0.057], { color: undersuit, sides: 8 });
    b.sweep(leg, (t) => [0.108 - t * 0.031, 0.103 - t * 0.022], {
      from: 0.08, to: 0.4, color: ceramic, bone: hip,
      section: { ngon: 8 }, caps: "flat",
    });
    plate(
      [s * 0.178, 0.892, 0.119],
      [
        [-0.063, 0.098], [0.061, 0.087], [0.067, -0.076],
        [0.006, -0.111], [-0.059, -0.077],
      ],
      0.027, teal, hip, 0.007,
    );
    light([s * 0.179, 0.855, 0.137], [s * 0.179, 0.941, 0.137], 0.006, hip);

    cyl([s * 0.19, 0.716, 0.044], 0.084, 0.163, C.navy, knee, [1, 0, 0], 12);
    plate(
      [s * 0.19, 0.716, 0.136],
      [
        [-0.074, 0.05], [-0.041, 0.081], [0.052, 0.072],
        [0.077, 0.018], [0.041, -0.066], [-0.047, -0.058],
      ],
      0.053, ceramic, knee, 0.009,
    );
    plate(
      [s * 0.19, 0.723, 0.169],
      [[-0.041, 0.024], [0.041, 0.024], [0.028, -0.017], [-0.028, -0.017]],
      0.012, C.amber, knee, 0.003,
    );

    if (s < 0) {
      b.frustumBox(
        lerp(knee, ankle, 0.16), lerp(knee, ankle, 0.94),
        [0.167, 0.165], [0.146, 0.159],
        { color: teal, bone: knee },
      );
      plate(
        [s * 0.194, 0.486, 0.112],
        [
          [-0.078, 0.151], [0.071, 0.151], [0.084, 0.083],
          [0.065, -0.127], [-0.055, -0.139], [-0.077, -0.037],
        ],
        0.058, ceramic, knee, 0.009,
      );
      plate(
        [s * 0.194, 0.501, 0.146],
        [[-0.023, 0.091], [0.023, 0.091], [0.025, -0.08], [0, -0.1], [-0.025, -0.08]],
        0.012, C.navy, knee, 0.003,
      );
      light([s * 0.194, 0.442, 0.157], [s * 0.194, 0.564, 0.157], 0.006, knee);
      for (const dx of [-0.055, 0.055]) bolt([s * 0.194 + dx, 0.597, 0.147], knee, 0.008);
    } else {
      // Two structural actuators around a central service spine.
      b.rod([0.193, 0.373, 0.005], [0.193, 0.65, 0.035], 0.043, {
        color: C.navy, bone: knee, sides: 8,
      });
      for (const dx of [-0.054, 0.054]) {
        b.rod([0.193 + dx, 0.373, 0.013], [0.193 + dx, 0.641, 0.039], 0.017, {
          color: metal, bone: knee, sides: 8,
        });
        b.rod([0.193 + dx, 0.488, 0.024], [0.193 + dx, 0.64, 0.039], 0.028, {
          color: teal, bone: knee, sides: 8,
        });
      }
      plate(
        [0.193, 0.496, 0.089],
        [
          [-0.046, 0.151], [0.046, 0.151], [0.058, 0.091],
          [0.039, -0.116], [0, -0.149], [-0.039, -0.116], [-0.058, 0.091],
        ],
        0.049, ceramic, knee, 0.007,
      );
      panelBox([0.193, 0.508, 0.119], 0.042, 0.175, 0.015, C.navy, knee, 0.008);
      light([0.193, 0.443, 0.132], [0.193, 0.57, 0.132], 0.006, knee);
      cyl([0.283, 0.708, 0.045], 0.055, 0.019, metal, knee, [1, 0, 0], 12);
      glow(cyl([0.296, 0.708, 0.045], 0.026, 0.009, C.mint, knee, [1, 0, 0]), 0.8);
    }

    // The broad grounded boots retain the rescue-hero silhouette.
    b.extrude(
      [
        [-0.105, 0.011], [0.26, 0.011], [0.31, 0.065],
        [0.282, 0.12], [0.118, 0.176], [0.052, 0.309],
        [-0.081, 0.294], [-0.117, 0.146],
      ],
      {
        at: [s * 0.195, 0.115, -0.025],
        x: [0, 0, 1], y: [0, 1, 0],
        thickness: 0.222, bevel: 0.013, color: ceramic, bone: ankle,
      },
    );
    panelBox([s * 0.195, 0.143, 0.072], 0.237, 0.056, 0.392, C.navy, ankle, 0.012);
    panelBox([s * 0.195, 0.181, 0.209], 0.237, 0.036, 0.109, teal, ankle, 0.01);
    panelBox([s * 0.195, 0.232, 0.267], 0.217, 0.049, 0.029, ceramic, ankle, 0.01);
    for (const dx of [-0.072, 0.072]) {
      box([s * 0.195 + dx, 0.199, 0.282], [0.025, 0.014, 0.009], C.amber, ankle);
    }
    for (let i = 0; i < 3; i++) {
      box([s * 0.195, 0.307 + i * 0.035, 0.055 - i * 0.012],
        [0.145, 0.016, 0.043], i === 1 ? C.navy : teal, ankle);
    }
    cyl([s * 0.311, 0.325, -0.029], 0.045, 0.017, C.navy, ankle, [s, 0, 0]);
    glow(cyl([s * 0.323, 0.325, -0.029], 0.023, 0.009, C.mint, ankle, [s, 0, 0], 8), 0.75);
  }

  const thighL = sideData[0].leg.joints[0];
  panelBox([0.282, 0.905, 0], 0.062, 0.19, 0.135, C.navy, thighL, 0.009);
  for (let i = 0; i < 2; i++) {
    const z = -0.035 + i * 0.072;
    cyl([0.318, 0.906, z], 0.023, 0.138, C.edge, thighL, [0, 1, 0], 8);
    cyl([0.318, 0.912, z], 0.018, 0.086, C.deepTeal, thighL, [0, 1, 0], 8);
    glow(cyl([0.318, 0.917, z], 0.018, 0.052, C.mint, thighL, [0, 1, 0], 8), 0.75);
    cyl([0.318, 0.978, z], 0.024, 0.021, C.amber, thighL, [0, 1, 0], 8);
  }
  const thighR = sideData[1].leg.joints[0];
  panelBox([-0.279, 0.918, 0.016], 0.091, 0.173, 0.157, teal, thighR, 0.012);
  box([-0.279, 0.986, 0.016], [0.101, 0.031, 0.169], ceramic, thighR);
  image([-0.279, 0.922, 0.097], 0.076, 0.094, medicalTex, thighR);

  // --------------------------------------------------------------------------
  // Backpack and individually articulated rescue vanes.
  // --------------------------------------------------------------------------

  panelBox([0, 1.48, -0.225], 0.3, 0.369, 0.163, C.navy, chest, 0.025);
  panelBox([0, 1.497, -0.305], 0.262, 0.317, 0.07, ceramic, chest, 0.022);
  box([0, 1.647, -0.247], [0.222, 0.035, 0.146], teal, chest);
  cyl([0, 1.493, -0.35], 0.098, 0.03, teal, chest, [0, 0, -1], 12);
  cyl([0, 1.493, -0.37], 0.073, 0.016, C.navy, chest, [0, 0, -1], 12);
  glow(image([0, 1.493, -0.38], 0.122, 0.122, inductionTex, chest, [0, 0, -1]), 0.8);
  image([0, 1.365, -0.345], 0.193, 0.064, equipmentTex, chest, [0, 0, -1]);

  // Visible spinal sockets tie the backpack mechanically into the fitted suit.
  for (let i = 0; i < 3; i++) {
    panelBox([0, 1.193 + i * 0.064, -0.132 - i * 0.011],
      0.083, 0.046, 0.034, metal, spine.joints[0], 0.008);
  }

  for (const data of sideData) {
    const { s, wing, vanes } = data;
    cyl([s * 0.192, 1.486, -0.225], 0.044, 0.297, C.edge, chest);
    cyl([s * 0.192, 1.486, -0.225], 0.046, 0.16, teal, chest);
    cyl([s * 0.192, 1.645, -0.225], 0.047, 0.024, C.amber, chest);
    cyl(wing, 0.07, 0.098, C.joint, wing, [0, 0, 1], 12);
    cyl([s * 0.205, 1.58, -0.174], 0.047, 0.024, ceramic, wing, [0, 0, 1], 12);
    bolt([s * 0.205, 1.58, -0.156], wing, 0.018);

    for (const [index, spec] of vanes.entries()) {
      const a = new THREE.Vector3(...(spec.a as [number, number, number]));
      const z = new THREE.Vector3(...(spec.z as [number, number, number]));
      const d = z.clone().sub(a).normalize();
      const x = new THREE.Vector3(-d.y, d.x, 0).normalize();
      const length = a.distanceTo(z);
      const joint = spec.joint;

      function vaneOutline(inset: number, lift: number) {
        const start = a.clone().addScaledVector(d, inset);
        const tip = z.clone().addScaledVector(d, -inset);
        const width = spec.w - inset * 0.8;
        return [
          start.clone().addScaledVector(x, -width * 0.35),
          start.clone().addScaledVector(d, length * 0.08).addScaledVector(x, width * 0.44),
          tip.clone().addScaledVector(d, -length * 0.14).addScaledVector(x, width * 0.48),
          tip.clone().addScaledVector(x, width * 0.1),
          tip.clone().addScaledVector(d, -length * 0.21).addScaledVector(x, -width * 0.45),
        ].map((p) => p.add(new THREE.Vector3(0, 0, lift)));
      }

      b.slab(vaneOutline(0, 0), { thickness: 0.054, bone: joint, color: C.navy });
      b.slab(vaneOutline(0.009, 0.028), {
        thickness: 0.035, bone: joint, color: ceramic,
      });

      const p0 = a.clone().addScaledVector(d, length * 0.18).add(new THREE.Vector3(0, 0, 0.051));
      const p1 = a.clone().addScaledVector(d, length * 0.75).add(new THREE.Vector3(0, 0, 0.051));
      b.rod(p0, p1, 0.024, { bone: joint, color: teal, section: "box" });
      for (let i = 0; i < 3; i++) {
        const t0 = i / 3 + 0.035;
        const t1 = (i + 1) / 3 - 0.035;
        light(lerp(p0, p1, t0), lerp(p0, p1, t1), 0.008, joint);
      }

      const tipAccent = z.clone().addScaledVector(d, -0.05).add(new THREE.Vector3(0, 0, 0.053));
      b.rod(
        tipAccent.clone().addScaledVector(x, -0.021),
        tipAccent.clone().addScaledVector(x, 0.021),
        0.009,
        { bone: joint, color: C.amber, section: "box" },
      );
      bolt(a.clone().addScaledVector(d, 0.054).add(new THREE.Vector3(0, 0, 0.054)), joint, 0.01);

      if (index === 1) {
        b.rod(
          [s * 0.205, 1.58, -0.257],
          a.clone().addScaledVector(d, 0.152),
          0.021,
          { bone: joint, color: metal, sides: 6 },
        );
      }
    }

    b.sweep(
      bezier(
        [s * 0.159, 1.376, -0.226],
        [s * 0.334, 1.327, -0.265],
        [s * 0.331, 1.519, -0.28],
      ),
      0.014,
      { bone: chest, color: C.navy, sides: 6 },
    );
  }

  // --------------------------------------------------------------------------
  // Healing staff: layered shaft, clean grip and a protected induction crystal.
  // --------------------------------------------------------------------------

  b.rod([staffX, 0.144, staffZ], [staffX, 2.1, staffZ], 0.03, {
    bone: staff, color: metal, sides: 10,
  });
  cyl([staffX, 0.164, staffZ], 0.051, 0.092, C.navy, staff);
  cyl([staffX, 0.124, staffZ], 0.054, 0.018, C.edge, staff);

  for (const [a, z] of [[0.25, 0.68], [0.79, 1.241], [1.531, 1.97]]) {
    cyl([staffX, (a + z) / 2, staffZ], 0.042, z - a, ceramic, staff);
    box([staffX, (a + z) / 2, staffZ + 0.043], [0.022, z - a - 0.064, 0.011], teal, staff);
    light([staffX, a + 0.044, staffZ + 0.052], [staffX, z - 0.044, staffZ + 0.052],
      0.005, staff);
  }
  cyl([staffX, 1.389, staffZ], 0.04, 0.234, C.navy, staff);
  for (let i = 0; i < 7; i++) {
    cyl([staffX, 1.292 + i * 0.032, staffZ], 0.043, 0.008, C.joint, staff);
  }
  for (const y of [0.23, 0.72, 1.272, 1.516, 2.008]) {
    cyl([staffX, y, staffZ], 0.049, 0.031, teal, staff);
    cyl([staffX, y + 0.012, staffZ], 0.052, 0.008, C.amber, staff);
  }

  b.lathe(
    [[0, 0], [0.044, 0], [0.067, 0.05], [0.075, 0.102], [0.051, 0.151], [0, 0.151]],
    { at: [staffX, 2.025, staffZ], segments: 10, color: ceramic, bone: staff },
  );
  image([staffX, 1.78, staffZ + 0.055], 0.063, 0.099, unitTex, staff);

  const coreY = 2.315;
  b.part(new THREE.TorusGeometry(0.158, 0.023, 6, 28), C.navy, {
    at: [staffX, coreY, staffZ], bone: staff,
  });
  b.part(new THREE.TorusGeometry(0.148, 0.011, 6, 28), ceramic, {
    at: [staffX, coreY, staffZ + 0.023], bone: staff,
  });
  glow(b.part(new THREE.TorusGeometry(0.125, 0.007, 6, 28), C.mint, {
    at: [staffX, coreY, staffZ + 0.015], bone: staff,
  }), 1.15);

  for (const s of [1, -1]) {
    plate(
      [staffX, 2.092, staffZ],
      [
        [s * 0.026, 0], [s * 0.085, 0.017], [s * 0.205, 0.189],
        [s * 0.211, 0.311], [s * 0.156, 0.417], [s * 0.134, 0.408],
        [s * 0.151, 0.282], [s * 0.148, 0.216], [s * 0.05, 0.061],
      ],
      0.071, ceramic, staff, 0.01,
    );
    plate(
      [staffX, 2.092, staffZ + 0.039],
      [
        [s * 0.053, 0.035], [s * 0.078, 0.048], [s * 0.183, 0.208],
        [s * 0.186, 0.304], [s * 0.166, 0.345], [s * 0.165, 0.224],
      ],
      0.014, teal, staff, 0.003,
    );
    light([staffX + s * 0.179, 2.33, staffZ + 0.052],
      [staffX + s * 0.177, 2.41, staffZ + 0.052], 0.007, staff);
    plate(
      [staffX + s * 0.16, 2.472, staffZ + 0.045],
      [[-0.021, -0.015], [0.021, -0.015], [0.01, 0.019], [-0.01, 0.019]],
      0.014, C.amber, staff, 0.003,
    );

    b.rod(
      [staffX + s * 0.127, coreY - 0.067, staffZ - 0.005],
      [staffX + s * 0.044, coreY - 0.026, staffZ],
      0.01,
      { bone: staff, color: metal, sides: 6 },
    );
  }

  // The core is a physical crystal, not a solid dark puck covering the aperture.
  glow(b.part(new THREE.OctahedronGeometry(1), C.mint, {
    at: [staffX, coreY, staffZ],
    scale: [0.055, 0.09, 0.039],
    bone: staff,
  }), 0.95);
  glow(b.part(new THREE.OctahedronGeometry(1), C.mintPale, {
    at: [staffX - 0.009, coreY + 0.011, staffZ + 0.012],
    scale: [0.024, 0.058, 0.021],
    bone: staff,
  }), 0.85);
  glow(image([staffX, coreY, staffZ + 0.049], 0.109, 0.109, inductionTex, staff), 0.85);

  b.ring(
    frame([staffX, coreY, staffZ + 0.027], [0, 0, 1]),
    { count: 8, radius: 0.158 },
    (item) => cyl(item, 0.01, 0.009, C.amber, staff, [0, 0, 1], 6),
  );
  b.sweep(
    bezier(
      [staffX + 0.024, 1.554, staffZ - 0.014],
      [staffX + 0.123, 1.735, staffZ - 0.044],
      [staffX + 0.102, 1.994, staffZ - 0.044],
      [staffX + 0.03, 2.064, staffZ - 0.012],
    ),
    0.01,
    { bone: staff, color: C.navy, sides: 6 },
  );

  // --------------------------------------------------------------------------
  // Rescue-bay platform: darker, thinner and quieter than the ivory character.
  // --------------------------------------------------------------------------

  b.part(new THREE.CylinderGeometry(1.145, 1.19, 0.084, 10), C.navy, {
    at: [0, 0.042, -0.012],
    scale: [1, 1, 0.65],
    bone: root,
  });
  b.part(new THREE.CylinderGeometry(1.125, 1.145, 0.031, 10), "#4e6c76", {
    at: [0, 0.0995, -0.012],
    scale: [1, 1, 0.65],
    bone: root,
  });
  b.part(new THREE.CylinderGeometry(0.621, 0.631, 0.006, 10), "#284754", {
    at: [0, 0.118, 0.004], scale: [1, 1, 0.8], bone: root,
  });

  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const x = Math.sin(a) * 1.065;
    const z = Math.cos(a) * 0.69 - 0.012;
    const angle = (a * 180) / Math.PI;
    box([x, 0.117, z], [0.094, 0.006, 0.023],
      i % 3 === 0 ? C.amber : C.edge, root, [0, angle, 0]);
    if (i % 2 === 0) {
      glow(box([x * 0.96, 0.122, z * 0.96], [0.062, 0.006, 0.011],
        C.mint, root, [0, angle, 0]), 0.6);
    }
  }
  image([0, 0.063, 0.733], 0.573, 0.114, baseTex, root);
  cyl([staffX, 0.12, staffZ], 0.076, 0.011, C.dark, root);
  cyl([staffX, 0.127, staffZ], 0.057, 0.008, teal, root);

  for (const s of [1, -1]) {
    box([s * 0.474, 0.123, 0.25], [0.023, 0.005, 0.192], C.edge, root);
    box([s * 0.424, 0.123, 0.337], [0.12, 0.005, 0.023], C.edge, root);
    for (let i = 0; i < 3; i++) {
      box([s * 0.773, 0.12, 0.2 + i * 0.052], [0.123, 0.004, 0.011],
        C.deepTeal, root, [0, -s * 35, 0]);
    }
  }

  // A compact trauma battery sits behind the boot, not in the front silhouette.
  panelBox([0.565, 0.232, -0.288], 0.232, 0.218, 0.181, teal, root, 0.017);
  panelBox([0.565, 0.342, -0.288], 0.249, 0.033, 0.195, ceramic, root, 0.012);
  box([0.565, 0.132, -0.288], [0.239, 0.022, 0.19], C.navy, root);
  image([0.565, 0.238, -0.194], 0.124, 0.132, medicalTex, root);
  for (const x of [0.478, 0.652]) {
    box([x, 0.291, -0.189], [0.025, 0.061, 0.016], C.navy, root);
    box([x, 0.299, -0.177], [0.019, 0.022, 0.008], C.amber, root);
  }
  b.rod([0.507, 0.358, -0.288], [0.507, 0.399, -0.288], 0.01, { color: C.navy, bone: root });
  b.rod([0.623, 0.358, -0.288], [0.623, 0.399, -0.288], 0.01, { color: C.navy, bone: root });
  b.rod([0.507, 0.399, -0.288], [0.623, 0.399, -0.288], 0.014, { color: C.navy, bone: root });

  for (let i = 0; i < 8; i++) {
    const a = random() * Math.PI * 2;
    const r = 0.79 + random() * 0.13;
    cyl([Math.sin(a) * r, 0.119, Math.cos(a) * r * 0.6], 0.012, 0.005,
      C.navy, root, [0, 1, 0], 6);
  }

  return b.root;
}
```