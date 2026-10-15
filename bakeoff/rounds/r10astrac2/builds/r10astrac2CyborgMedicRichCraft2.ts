import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  polyline,
  rng,
  svg,
  paint,
  mix,
  noise,
  type Fill,
  type Joint,
  type PointInput,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "LIFELINE — Rescue Division",
  description:
    "An original heroic cyborg medic. Revised with a stronger face, swept silver hair, asymmetrical rescue-orange armor, articulated prosthetics, a luminous healing staff, and a compact deployment deck.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Lifeline_Rescue_Division", paintSize: 2048 });
  const random = rng(7813);

  const C = {
    white: "#edf3ef",
    bright: "#ffffff",
    shadow: "#b8ccc9",
    teal: "#168e91",
    deepTeal: "#175560",
    navy: "#192c40",
    dark: "#101e30",
    steel: "#7895a3",
    paleSteel: "#c5d8de",
    orange: "#ff9751",
    orangeDark: "#b75c35",
    skin: "#bb8063",
    skinLight: "#dfa583",
    lip: "#8e514a",
    hair: "#e2e4d8",
    hairShade: "#9eafb1",
    cyan: "#66ffe0",
    ice: "#d9fff1",
    gold: "#ffd598",
    base: "#243c4e",
  };

  const armorPaint = paint((p, n) => {
    const t = Math.max(0, Math.min(1, n.y * 0.32 + n.z * 0.12 + 0.58));
    return mix(mix("#afc7c8", "#fffaf0", t), "#ffffff", noise(p, 0.045, 8) * 0.035);
  });
  const orangePaint = paint((_p, n) =>
    mix("#cf623b", "#ffb26a", 0.52 + Math.max(-0.4, n.y) * 0.35),
  );
  const suitPaint = paint((p, n) => {
    const weave = (Math.floor(p.y * 250) + Math.floor(p.x * 250)) % 2 === 0 ? 0.025 : 0;
    return mix("#14263a", "#365166", 0.19 + Math.max(0, n.y) * 0.25 + weave);
  });
  const skinPaint = paint((_p, n) =>
    mix("#b47760", "#e5b18d", Math.max(0, Math.min(1, 0.5 + n.y * 0.24 + n.z * 0.2))),
  );
  const metalPaint = paint((p, n) =>
    mix("#527484", "#c3d9df", Math.min(1, 0.36 + Math.max(0, n.y) * 0.4 + noise(p, 0.017, 3) * 0.15)),
  );

  const eyeTex = svg(
    `<svg viewBox="0 0 160 80">
      <defs><clipPath id="eye"><path d="M9 44 Q40 19 77 24 Q118 23 151 43 Q116 62 78 61 Q39 61 9 44Z"/></clipPath></defs>
      <path d="M9 44 Q40 19 77 24 Q118 23 151 43 Q116 62 78 61 Q39 61 9 44Z" fill="#f6eadd"/>
      <g clip-path="url(#eye)">
        <ellipse cx="83" cy="42" rx="23" ry="25" fill="#324e53"/>
        <ellipse cx="83" cy="46" rx="17" ry="21" fill="#bba26c"/>
        <ellipse cx="83" cy="37" rx="10" ry="19" fill="#202b34"/>
        <circle cx="75" cy="32" r="5.5" fill="#ffffff"/>
        <circle cx="91" cy="48" r="2.5" fill="#fff2cc"/>
      </g>
      <path d="M9 44 Q40 19 77 24 Q118 23 151 43" fill="none" stroke="#49353a" stroke-width="7" stroke-linecap="round"/>
      <path d="M12 46 Q42 63 78 61 Q115 62 148 45" fill="none" stroke="#8c5b50" stroke-width="3"/>
    </svg>`,
    { size: 384 },
  );

  const crossTex = svg(
    `<svg viewBox="0 0 128 128">
      <path d="M64 5 L112 31 L112 91 L64 122 L16 91 L16 31Z" fill="#173b4c" stroke="#d9f6ed" stroke-width="5"/>
      <path d="M64 15 L103 37 L103 86 L64 110 L25 86 L25 37Z" fill="#167f88"/>
      <path d="M51 31 H77 V51 H97 V77 H77 V97 H51 V77 H31 V51 H51Z" fill="#effff3"/>
      <path d="M30 91 L43 99 M85 99 L98 91" stroke="#76f5db" stroke-width="4" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  const serialTex = svg(
    `<svg viewBox="0 0 256 100">
      <rect width="256" height="100" rx="10" fill="#192f42"/>
      <rect x="9" y="9" width="5" height="82" fill="#64efce"/>
      <text x="27" y="42" fill="#f1f6eb" font-family="sans-serif" font-weight="bold" font-size="32" letter-spacing="3">LIFELINE</text>
      <text x="28" y="70" fill="#94bdc4" font-family="monospace" font-size="17" letter-spacing="2">MED / UNIT 07</text>
      <path d="M194 78 h5 m5 0 h2 m5 0 h7 m5 0 h3 m5 0 h5" stroke="#ffae68" stroke-width="8"/>
    </svg>`,
    { size: 512 },
  );

  const hazardTex = svg(
    `<svg viewBox="0 0 256 48">
      <rect width="256" height="48" fill="#eea05d"/>
      <path d="M-30 48 L18 0 H45 L-3 48Z M34 48 L82 0 H109 L61 48Z M98 48 L146 0 H173 L125 48Z M162 48 L210 0 H237 L253 48Z M226 48 L274 0 H301 L253 48Z" fill="#253e4b"/>
      <path d="M0 3 H256 M0 45 H256" stroke="#ffe3b7" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const monitorTex = svg(
    `<svg viewBox="0 0 192 256">
      <rect width="192" height="256" rx="12" fill="#102f42"/>
      <path d="M12 20 H180 M12 218 H180" stroke="#457b87" stroke-width="3"/>
      <text x="15" y="44" fill="#b9fae7" font-family="monospace" font-weight="bold" font-size="19">VITAL LINK</text>
      <text x="14" y="105" fill="#68ffda" font-family="sans-serif" font-size="52" font-weight="bold">98</text>
      <text x="113" y="104" fill="#a5d7d8" font-family="monospace" font-size="20">BPM</text>
      <path d="M12 153 H43 L53 133 L66 183 L85 115 L101 153 H135 L144 140 L152 153 H180" fill="none" stroke="#63ffda" stroke-width="5" stroke-linejoin="round"/>
      <rect x="15" y="198" width="112" height="8" fill="#52c9b9"/>
      <rect x="131" y="198" width="44" height="8" fill="#315468"/>
      <text x="15" y="242" fill="#ffbd7b" font-size="14" font-family="monospace">SYNC // 100%</text>
    </svg>`,
    { size: 384 },
  );

  const coreTex = svg(
    `<svg viewBox="0 0 160 160">
      <circle cx="80" cy="80" r="71" fill="#133f50" stroke="#93ffe4" stroke-width="5"/>
      <circle cx="80" cy="80" r="58" fill="#17636b" stroke="#49cebc" stroke-width="3"/>
      <path d="M67 39 H93 V67 H121 V93 H93 V121 H67 V93 H39 V67 H67Z" fill="#cffff0"/>
      <path d="M80 3 V18 M80 142 V157 M3 80 H18 M142 80 H157" stroke="#fff5ca" stroke-width="6"/>
    </svg>`,
    { size: 256 },
  );

  const clothTex = svg(
    `<svg viewBox="0 0 128 256">
      <rect width="128" height="256" fill="#174753"/>
      <path d="M8 0 V256 M120 0 V256" stroke="#71adae" stroke-width="3" stroke-dasharray="8 8"/>
      <path d="M29 30 L64 50 L99 30 M29 50 L64 70 L99 50 M29 177 L64 197 L99 177 M29 197 L64 217 L99 197" stroke="#23747a" stroke-width="8" fill="none"/>
      <rect x="44" y="100" width="40" height="7" fill="#e4e8d7"/>
      <rect x="44" y="114" width="40" height="7" fill="#e4e8d7"/>
      <rect x="44" y="128" width="23" height="7" fill="#ffad69"/>
    </svg>`,
    { size: 256 },
  );

  const divisionTex = svg(
    `<svg viewBox="0 0 160 180">
      <path d="M14 12 H146 V145 L80 174 L14 145Z" fill="#1b3747"/>
      <path d="M25 22 H135" stroke="#ffaf67" stroke-width="7"/>
      <text x="80" y="105" text-anchor="middle" font-family="sans-serif" font-size="79" font-weight="bold" fill="#f3f4e8">07</text>
      <text x="80" y="132" text-anchor="middle" font-family="sans-serif" font-size="16" letter-spacing="2" fill="#80e2d3">RESCUE</text>
      <path d="M39 147 H121" stroke="#6ee6d2" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  // Skeleton first. The stage has its own root, so it does not follow the hips.
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: root, at: [0, 1.035, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    [[0, 1.035, 0], [0, 1.23, 0], [0, 1.48, -0.015], [0, 1.61, -0.015]],
    { parent: hips, names: ["spineLower", "spineUpper", "chest", "neckBase"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [[0, 1.61, -0.015], [0, 1.735, 0]],
    { parent: spine.tip!, names: ["neck", "neckTop"], role: "neck" },
  );

  // One explicit head scale keeps face, hair, implants, and jaw together.
  const H = 1.12;
  const hp = (p: number[]) => [
    p[0] * H,
    1.84 + (p[1] - 1.865) * H,
    0.012 + (p[2] - 0.016) * H,
  ];
  const head = b.joint("head", {
    parent: neck.tip!, at: hp([0, 1.84, 0.005]), dir: [0, 0, 1], role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head, at: hp([0, 1.79, 0.018]), dir: [0, 0, 1], role: "jaw",
  });

  const sides = [1, -1] as const;
  const limbs = sides.map((s) => {
    const side = s === 1 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      [[s * 0.155, 1.035, 0], [s * 0.205, 0.705, 0.025], [s * 0.235, 0.34, 0]],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [s * 0.235, 0.12, 0.085],
      },
    );
    const arm = b.chain(
      `arm${side}`,
      [[s * 0.325, 1.515, -0.01], [s * 0.665, 1.515, -0.01], [s * 0.975, 1.515, -0.01]],
      {
        parent: spine.joints[2],
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        role: "arm",
      },
    );
    const hand = b.joint(`hand${side}`, {
      parent: arm.tip!, at: [s * 1.035, 1.515, -0.005], dir: [s, 0, 0], role: "arm",
    });
    const digits = [0, 1, 2, 3].map((i) => {
      const yy = 1.515 + (1.5 - i) * 0.032;
      const length = [0.091, 0.105, 0.098, 0.076][i];
      const spread = (1.5 - i) * 0.011;
      return b.chain(
        `finger${side}${i + 1}`,
        [
          [s * 1.077, yy, 0.006],
          [s * (1.077 + length * 0.55), yy + spread * 0.55, 0.006],
          [s * (1.077 + length), yy + spread, 0.004],
        ],
        { parent: hand, count: 2, role: "digit" },
      );
    });
    const thumb = b.chain(
      `thumb${side}`,
      [[s * 1.015, 1.468, 0.01], [s * 1.043, 1.421, 0.035], [s * 1.09, 1.407, 0.045]],
      { parent: hand, count: 2, role: "digit" },
    );
    return { s, side, leg, arm, hand, digits, thumb };
  });

  function box(
    name: string, at: PointInput, size: [number, number, number],
    color: Fill, bone: Joint = hips, rotation: [number, number, number] = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, { at, bone, rotation, name });
  }
  function ellipsoid(
    name: string, at: PointInput, scale: [number, number, number],
    color: Fill, bone: Joint = hips, segments = 10,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 8), color, {
      at, scale, bone, name, flat: true,
    });
  }
  function cylinder(
    name: string, at: PointInput, radius: number, depth: number,
    color: Fill, bone: Joint, dir: number[] = [0, 1, 0], segments = 10,
  ) {
    return b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      at, bone, dir, name,
    });
  }
  function panel(
    name: string, outline: number[][], at: number[], depth: number,
    color: Fill, bone: Joint,
  ) {
    return b.extrude(outline, {
      at, x: [1, 0, 0], y: [0, 1, 0], thickness: depth,
      bevel: Math.min(0.008, depth * 0.2), detail: 0.5, color, bone, name,
    });
  }
  function drawing(
    name: string, texture: THREE.Texture, at: PointInput,
    w: number, h: number, bone: Joint, dir: number[] = [0, 0, 1],
  ) {
    return b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      at, bone, dir, axis: "z", texture, name,
    });
  }
  function bolt(name: string, at: number[], bone: Joint, r = 0.012) {
    const p = cylinder(name, at, r, 0.008, C.paleSteel, bone, [0, 0, 1], 6);
    box(`${name}_slot`, [at[0], at[1], at[2] + 0.005], [r * 0.95, 0.0028, 0.002], C.deepTeal, bone);
    return p;
  }
  function luminousBar(
    name: string, at: number[], size: [number, number, number],
    bone: Joint, color = C.cyan,
  ) {
    return glow(box(name, at, size, color, bone), 1.15);
  }
  function hEllipsoid(
    name: string, at: number[], size: [number, number, number],
    color: Fill, bone: Joint = head, segments = 12,
  ) {
    return ellipsoid(name, hp(at), [size[0] * H, size[1] * H, size[2] * H], color, bone, segments);
  }
  function hSweep(name: string, points: number[][], radius: number, color: Fill, bone = head) {
    return b.sweep(points.map(hp), radius * H, {
      color, bone, sides: 6, name,
    });
  }

  // Face: slightly larger, lower on the collar, calmer eyes and finer eyebrows.
  const skull = hEllipsoid("faceted_face", [0, 1.865, 0.016], [0.137, 0.176, 0.118], skinPaint);
  hEllipsoid("occipital_shell", [0, 1.872, -0.057], [0.13, 0.151, 0.088], C.deepTeal);
  panel(
    "separate_lower_jaw",
    [[-0.085, 0.041], [-0.073, -0.025], [-0.042, -0.06], [0.042, -0.06], [0.073, -0.025], [0.085, 0.041]].map(([x, y]) => [x * H, y * H]),
    hp([0, 1.79, 0.061]), 0.079 * H, skinPaint, jaw,
  );
  hEllipsoid("upper_muzzle", [0, 1.795, 0.105], [0.047, 0.021, 0.019], skinPaint);
  hSweep(
    "neutral_mouth",
    [[-0.035, 1.786, 0.12], [-0.012, 1.781, 0.125], [0.012, 1.781, 0.125], [0.035, 1.786, 0.12]],
    0.0025, C.lip, jaw,
  );
  hSweep(
    "lower_lip_light",
    [[-0.02, 1.775, 0.119], [0, 1.772, 0.123], [0.02, 1.775, 0.119]],
    0.0018, C.skinLight, jaw,
  );
  b.loft(
    [
      { at: hp([0, 1.88, 0.119]), w: 0.017 * H, h: 0.016 * H },
      { at: hp([0, 1.85, 0.133]), w: 0.021 * H, h: 0.022 * H },
      { at: hp([0, 1.826, 0.143]), w: 0.031 * H, h: 0.022 * H },
      { at: hp([0, 1.817, 0.127]), w: 0.027 * H, h: 0.013 * H },
    ],
    { bone: head, color: skinPaint, section: { ngon: 6 }, caps: "flat", name: "nose_bridge" },
  );
  for (const s of sides) {
    hEllipsoid(`nostril_${s}`, [s * 0.011, 1.818, 0.137], [0.0035, 0.0023, 0.0025], C.lip, head, 6);
    const cheek = hEllipsoid(`cheek_${s}`, [s * 0.087, 1.821, 0.068], [0.034, 0.03, 0.023], skinPaint);
    b.decal(skull, eyeTex, {
      at: hp([s * 0.059, 1.878, 0.13]),
      dir: [s * 0.13, 0, 1],
      size: [0.091 * H, 0.048 * H],
      mirror: s > 0, lift: 0.0016, segments: 8, bone: head, name: `eye_${s}`,
    });
    hSweep(
      `eyebrow_${s}`,
      [[s * 0.026, 1.914, 0.12], [s * 0.06, 1.921, 0.117], [s * 0.097, 1.913, 0.1]],
      0.005, "#554348",
    );
    const mark = b.surface(cheek).nearest(hp([s * 0.097, 1.822, 0.105]));
    b.stick(new THREE.BoxGeometry(0.021, 0.002, 0.004), C.orange, mark, { name: `cheek_triage_mark_${s}` });
    cylinder(`ear_hub_${s}`, hp([s * 0.142, 1.856, -0.002]), 0.047 * H, 0.028 * H, C.navy, head, [s, 0, 0]);
    cylinder(`ear_disc_${s}`, hp([s * 0.159, 1.856, -0.002]), 0.036 * H, 0.013 * H, armorPaint, head, [s, 0, 0]);
    glow(cylinder(`ear_link_${s}`, hp([s * 0.167, 1.856, -0.002]), 0.017 * H, 0.004, C.cyan, head, [s, 0, 0], 8), 0.75);
    hSweep(
      `jaw_interface_${s}`,
      [[s * 0.134, 1.846, 0.018], [s * 0.12, 1.78, 0.063], [s * 0.082, 1.751, 0.083]],
      0.01, C.white,
    );
  }

  // One swept asymmetrical silhouette rather than a row of upright hair blocks.
  hEllipsoid("cropped_hair_cap", [0, 1.962, -0.021], [0.138, 0.099, 0.11], C.hairShade);
  const hairBlades = [
    { x: -0.089, w: 0.068, y: 2.036, end: -0.121, z: 0.043 },
    { x: -0.046, w: 0.081, y: 2.06, end: -0.092, z: 0.067 },
    { x: 0.008, w: 0.087, y: 2.071, end: -0.053, z: 0.075 },
    { x: 0.057, w: 0.076, y: 2.052, end: -0.005, z: 0.06 },
    { x: 0.096, w: 0.054, y: 2.02, end: 0.047, z: 0.027 },
  ];
  hairBlades.forEach((h, i) => {
    b.loft(
      [
        { at: hp([h.x, 1.965, h.z]), w: h.w * H, h: 0.044 * H },
        { at: hp([h.x - 0.027, h.y - 0.023, h.z - 0.017]), w: h.w * H, h: 0.048 * H },
        { at: hp([h.end, h.y - 0.022, -0.055]), w: h.w * 0.71 * H, h: 0.035 * H },
        { at: hp([h.end - 0.006, h.y - 0.063, -0.111]), w: 0.018 * H, h: 0.011 * H },
      ],
      { bone: head, color: i % 2 ? C.hair : armorPaint, section: { ngon: 5 }, caps: "flat", name: `swept_hair_${i}` },
    );
  });
  for (let i = 0; i < 3; i++) {
    hSweep(
      `undercut_line_${i}`,
      [[0.119, 1.92 + i * 0.018, 0.04], [0.137, 1.931 + i * 0.017, -0.015], [0.115, 1.944 + i * 0.017, -0.075]],
      0.003, C.hair,
    );
  }
  hSweep(
    "comms_microphone_boom",
    [[-0.16, 1.835, 0.012], [-0.177, 1.801, 0.05], [-0.122, 1.772, 0.12], [-0.075, 1.779, 0.145]],
    0.006, C.navy,
  );
  hEllipsoid("microphone", [-0.075, 1.779, 0.145], [0.014, 0.009, 0.009], C.dark);

  // Torso retains big uninterrupted armor planes and a narrow athletic waist.
  b.loft(
    [
      { at: [0, 1.025, 0], w: 0.345, h: 0.245 },
      { at: [0, 1.18, 0], w: 0.31, h: 0.225 },
      { at: [0, 1.39, -0.008], w: 0.46, h: 0.295 },
      { at: [0, 1.535, -0.015], w: 0.54, h: 0.26 },
      { at: [0, 1.6, -0.015], w: 0.34, h: 0.205 },
    ],
    { bone: spine, color: suitPaint, sides: 8, caps: "flat", name: "undersuit_torso" },
  );
  b.sweep(neck, 0.073, { color: C.navy, sides: 8, caps: "flat", name: "neck_seal" });
  for (const y of [1.642, 1.668, 1.694]) {
    cylinder(`neck_rib_${y}`, [0, y, -0.006], 0.076, 0.01, C.steel, neck.joints[0]);
  }
  const chestBone = spine.joints[2];
  for (const s of sides) {
    b.loft(
      [
        { at: [s * 0.108, 1.579, 0.012], w: 0.08, h: 0.145 },
        { at: [s * 0.108, 1.652, -0.002], w: 0.058, h: 0.125 },
        { at: [s * 0.096, 1.707, -0.027], w: 0.036, h: 0.083 },
      ],
      { bone: chestBone, color: armorPaint, section: { ngon: 6 }, caps: "flat", name: `raised_rescue_collar_${s}` },
    );
    b.sweep(
      [[s * 0.125, 1.613, 0.073], [s * 0.118, 1.662, 0.058], [s * 0.097, 1.7, 0.018]],
      0.008,
      { bone: chestBone, color: C.teal, sides: 6, name: `collar_soft_edge_${s}` },
    );
    luminousBar(`collar_link_${s}`, [s * 0.118, 1.648, 0.064], [0.012, 0.028, 0.006], chestBone);
  }
  panel(
    "chest_teal_carrier",
    [[-0.24, 0.12], [-0.27, 0.035], [-0.18, -0.14], [0, -0.2], [0.18, -0.14], [0.27, 0.035], [0.24, 0.12]],
    [0, 1.455, 0.126], 0.07, C.teal, chestBone,
  );
  for (const s of sides) {
    panel(
      `chest_porcelain_${s}`,
      [[s * 0.025, 0.115], [s * 0.208, 0.105], [s * 0.248, 0.03], [s * 0.175, -0.075], [s * 0.065, -0.106], [s * 0.025, -0.045]],
      [0, 1.455, 0.177], 0.047, armorPaint, chestBone,
    );
    b.rod([s * 0.07, 1.595, 0.105], [s * 0.225, 1.559, 0.095], 0.021, {
      color: C.shadow, bone: chestBone, sides: 5, name: `collar_rim_${s}`,
    });
    box(`clavicle_orange_${s}`, [s * 0.185, 1.55, 0.207], [0.067, 0.018, 0.01], C.orange, chestBone, [0, 0, -s * 12]);
    bolt(`pectoral_fastener_${s}`, [s * 0.19, 1.425, 0.206], chestBone, 0.009);
    b.sweep(
      [[s * 0.212, 1.4, 0.092], [s * 0.182, 1.3, 0.097], [s * 0.15, 1.22, 0.107]],
      0.022,
      { bone: spine.joints[1], color: C.deepTeal, section: "box", name: `flank_rail_${s}` },
    );
  }
  box("sternum_dark_socket", [0, 1.47, 0.197], [0.055, 0.169, 0.031], C.navy, chestBone);
  luminousBar("sternum_energy", [0, 1.476, 0.216], [0.016, 0.105, 0.008], chestBone);
  drawing("rescue_chest_badge", crossTex, [-0.119, 1.48, 0.207], 0.082, 0.082, chestBone);
  drawing("chest_callsign", serialTex, [0.115, 1.466, 0.208], 0.103, 0.04, chestBone);
  for (let i = 0; i < 3; i++) {
    panel(
      `abdominal_segment_${i}`,
      [[-0.122, 0.02], [0.122, 0.02], [0.111, -0.018], [0, -0.033], [-0.111, -0.018]],
      [0, 1.29 - i * 0.055, 0.125], 0.029, i === 1 ? C.shadow : armorPaint, spine.joints[0],
    );
  }

  box("utility_belt", [0, 1.071, 0], [0.385, 0.083, 0.281], C.navy, hips);
  box("belt_front", [0, 1.073, 0.153], [0.24, 0.062, 0.038], C.deepTeal, hips);
  box("belt_buckle", [0, 1.073, 0.182], [0.071, 0.054, 0.019], C.orange, hips);
  box("buckle_inset", [0, 1.073, 0.194], [0.041, 0.029, 0.007], C.navy, hips);
  luminousBar("buckle_status", [0, 1.073, 0.199], [0.024, 0.007, 0.003], hips);
  panel(
    "pelvis_front_armor",
    [[-0.15, 0.057], [0.15, 0.057], [0.12, -0.022], [0.06, -0.1], [-0.06, -0.1], [-0.12, -0.022]],
    [0, 0.99, 0.131], 0.048, armorPaint, hips,
  );
  panel(
    "pelvis_teal_insert",
    [[-0.058, 0.035], [0.058, 0.035], [0.039, -0.054], [-0.039, -0.054]],
    [0, 0.981, 0.159], 0.01, C.teal, hips,
  );

  // Chamfered pack, restrained side tanks, and directional rescue stabilizers.
  box("pack_gasket", [0, 1.398, -0.208], [0.35, 0.382, 0.14], C.dark, chestBone);
  panel(
    "pack_white_housing",
    [[-0.158, -0.127], [-0.129, -0.165], [0.129, -0.165], [0.158, -0.127], [0.158, 0.117], [0.11, 0.165], [-0.11, 0.165], [-0.158, 0.117]],
    [0, 1.418, -0.289], 0.13, armorPaint, chestBone,
  );
  box("pack_teal_spine", [0, 1.42, -0.366], [0.105, 0.28, 0.035], C.teal, chestBone);
  drawing("pack_identification", crossTex, [0, 1.45, -0.386], 0.085, 0.085, chestBone, [0, 0, -1]);
  for (const s of sides) {
    cylinder(`pack_tank_${s}`, [s * 0.195, 1.39, -0.274], 0.055, 0.286, C.deepTeal, chestBone);
    for (const y of [1.266, 1.515]) {
      cylinder(`tank_cap_${s}_${y}`, [s * 0.195, y, -0.274], 0.058, 0.038, armorPaint, chestBone);
    }
    glow(cylinder(`tank_solution_${s}`, [s * 0.195, 1.398, -0.274], 0.056, 0.095, C.cyan, chestBone), 0.65);
    box(`tank_guard_${s}`, [s * 0.195, 1.397, -0.333], [0.025, 0.21, 0.021], C.navy, chestBone);
    b.sweep(
      catmull([[s * 0.19, 1.532, -0.27], [s * 0.25, 1.603, -0.187], [s * 0.24, 1.575, -0.075]]),
      0.017,
      { color: C.orange, bone: chestBone, sides: 6, name: `pack_feed_hose_${s}` },
    );
    // Small vertical rescue fins sit behind the shoulders, clear of the face.
    panel(
      `rescue_pack_fin_${s}`,
      [[s * 0.17, 1.43], [s * 0.26, 1.49], [s * 0.325, 1.735], [s * 0.286, 1.774], [s * 0.222, 1.623]],
      [0, 0, -0.294], 0.043, armorPaint, chestBone,
    );
    b.sweep(
      [[s * 0.24, 1.559, -0.321], [s * 0.299, 1.726, -0.321]],
      0.009,
      { bone: chestBone, color: C.teal, sides: 5, name: `fin_inset_${s}` },
    );
    glow(b.rod([s * 0.255, 1.619, -0.326], [s * 0.284, 1.702, -0.326], 0.005, {
      bone: chestBone, color: C.cyan, sides: 5, name: `fin_status_${s}`,
    }), 0.8);
  }
  box("beacon_mount", [0, 1.604, -0.279], [0.12, 0.036, 0.105], C.navy, chestBone);
  glow(box("pack_beacon", [0, 1.631, -0.279], [0.078, 0.025, 0.07], C.cyan, chestBone), 0.8);
  for (let i = 0; i < 4; i++) {
    box(`pack_vent_${i}`, [0.1, 1.345 + i * 0.025, -0.358], [0.052, 0.009, 0.009], C.navy, chestBone);
  }

  for (const s of sides) {
    const coat = b.slab(
      [
        [s * 0.135, 1.07, -0.134], [s * 0.23, 1.055, -0.105],
        [s * 0.328, 0.672, -0.16], [s * 0.273, 0.579, -0.205], [s * 0.146, 0.625, -0.23],
      ],
      { color: C.deepTeal, thickness: 0.018, bone: hips, name: `rescue_coat_tail_${s}` },
    );
    b.sweep(
      [[s * 0.23, 1.055, -0.094], [s * 0.328, 0.672, -0.149], [s * 0.273, 0.579, -0.194]],
      0.009,
      { color: C.orange, bone: hips, sides: 5, name: `coat_trim_${s}` },
    );
    b.decal(coat, clothTex, {
      at: [s * 0.232, 0.79, -0.12], dir: [0, 0, 1],
      size: [0.078, 0.235], lift: 0.0015, segments: 5, bone: hips,
      name: `coat_technical_weave_${s}`,
    });
    box(`belt_pouch_${s}`, [s * 0.224, 1.035, -0.013], [0.095, 0.128, 0.137], C.deepTeal, hips);
    box(`pouch_flap_${s}`, [s * 0.224, 1.066, 0.062], [0.102, 0.057, 0.021], armorPaint, hips);
    box(`pouch_latch_${s}`, [s * 0.224, 1.055, 0.079], [0.025, 0.035, 0.014], C.orange, hips);
  }

  for (const rig of limbs) {
    const { s, side, leg, arm, hand, digits, thumb } = rig;
    const thigh = leg.joints[0];
    const shin = leg.joints[1];
    const foot = leg.tip!;
    const upper = arm.joints[0];
    const lower = arm.joints[1];

    b.sweep(leg, (t) => [0.087 - t * 0.021, 0.084 - t * 0.022], {
      color: suitPaint, sides: 8, caps: "flat", name: `leg_undersuit_${side}`,
    });
    b.sweep(leg, () => [0.108, 0.102], {
      from: 0.07, to: 0.38, color: armorPaint, section: { ngon: 6 },
      caps: "flat", bone: thigh, name: `thigh_shell_${side}`,
    });
    panel(
      `thigh_front_${side}`,
      [[-0.066, 0.115], [0.066, 0.115], [0.077, -0.06], [0.044, -0.105], [-0.046, -0.105], [-0.078, -0.06]],
      [s * 0.178, 0.885, 0.096], 0.044, armorPaint, thigh,
    );
    box(`thigh_teal_inlay_${side}`, [s * 0.178, 0.89, 0.122], [0.045, 0.123, 0.009], C.teal, thigh);
    luminousBar(`thigh_indicator_${side}`, [s * 0.178, 0.932, 0.129], [0.02, 0.027, 0.004], thigh);
    cylinder(`knee_axle_${side}`, [s * 0.205, 0.706, 0.024], 0.078, 0.185, C.navy, shin, [1, 0, 0]);
    cylinder(`knee_outer_bearing_${side}`, [s * 0.302, 0.706, 0.024], 0.045, 0.017, metalPaint, shin, [s, 0, 0], 8);
    cylinder(`knee_orange_cap_${side}`, [s * 0.313, 0.706, 0.024], 0.025, 0.007, C.orange, shin, [s, 0, 0], 8);
    panel(
      `kneecap_${side}`,
      [[-0.073, 0.052], [0, 0.078], [0.073, 0.052], [0.062, -0.046], [0, -0.07], [-0.062, -0.046]],
      [s * 0.205, 0.709, 0.109], 0.055, s === -1 ? orangePaint : C.teal, shin,
    );
    box(`kneecap_slash_${side}`, [s * 0.205, 0.72, 0.14], [0.075, 0.017, 0.01], C.white, shin);
    b.sweep(leg, (t) => [0.086 + (1 - t) * 0.015, 0.085], {
      from: 0.58, to: 0.94, color: armorPaint, section: { ngon: 6 },
      caps: "flat", bone: shin, name: `calf_shell_${side}`,
    });
    panel(
      `shin_shield_${side}`,
      [[-0.076, 0.127], [0.076, 0.127], [0.068, -0.126], [0.038, -0.153], [-0.038, -0.153], [-0.068, -0.126]],
      [s * 0.225, 0.492, 0.092], 0.055, armorPaint, shin,
    );
    panel(
      `shin_dark_inlay_${side}`,
      [[-0.029, 0.112], [0.029, 0.112], [0.024, -0.1], [0, -0.12], [-0.024, -0.1]],
      [s * 0.225, 0.492, 0.124], 0.012, C.deepTeal, shin,
    );
    luminousBar(`shin_light_${side}`, [s * 0.225, 0.52, 0.134], [0.012, 0.12, 0.006], shin);
    drawing(`shin_caution_${side}`, hazardTex, [s * 0.225, 0.397, 0.134], 0.085, 0.017, shin);
    for (const xx of [-0.054, 0.054]) {
      bolt(`shin_screw_${side}_${xx}`, [s * 0.225 + xx, 0.589, 0.125], shin, 0.008);
    }
    box(`boot_sole_${side}`, [s * 0.235, 0.153, 0.074], [0.218, 0.066, 0.353], C.dark, foot);
    box(`boot_midsole_${side}`, [s * 0.235, 0.189, 0.074], [0.223, 0.028, 0.355], C.shadow, foot);
    b.loft(
      [
        { at: [s * 0.235, 0.259, -0.068], w: 0.175, h: 0.136 },
        { at: [s * 0.235, 0.249, 0.06], w: 0.201, h: 0.12 },
        { at: [s * 0.235, 0.229, 0.207], w: 0.195, h: 0.083 },
        { at: [s * 0.235, 0.224, 0.242], w: 0.153, h: 0.06 },
      ],
      { bone: foot, color: armorPaint, section: { ngon: 6 }, caps: "flat", name: `rescue_boot_${side}` },
    );
    box(`boot_toe_bumper_${side}`, [s * 0.235, 0.217, 0.246], [0.164, 0.047, 0.027], C.deepTeal, foot);
    box(`boot_toe_stripe_${side}`, [s * 0.235, 0.249, 0.211], [0.084, 0.012, 0.07], C.orange, foot, [-8, 0, 0]);
    box(`boot_ankle_strap_${side}`, [s * 0.235, 0.301, 0.008], [0.199, 0.043, 0.155], C.deepTeal, foot);
    box(`ankle_clasp_${side}`, [s * 0.235, 0.302, 0.09], [0.058, 0.037, 0.017], C.paleSteel, foot);
    for (let i = 0; i < 4; i++) {
      box(`sole_tread_${side}_${i}`, [s * 0.235, 0.151, -0.05 + i * 0.076], [0.229, 0.022, 0.023], C.navy, foot);
    }

    ellipsoid(`shoulder_socket_${side}`, [s * 0.332, 1.515, -0.01], [0.104, 0.103, 0.103], C.navy, upper);
    const shoulderFill = s === -1 ? orangePaint : armorPaint;
    b.loft(
      [
        { at: [s * 0.286, 1.548, -0.012], w: 0.197, h: 0.2 },
        { at: [s * 0.348, 1.566, -0.012], w: 0.26, h: 0.267 },
        { at: [s * 0.431, 1.557, -0.012], w: 0.248, h: 0.247 },
        { at: [s * 0.477, 1.534, -0.012], w: 0.178, h: 0.173 },
      ],
      { color: shoulderFill, bone: upper, section: { ngon: 8 }, caps: "flat", name: `pauldron_${side}` },
    );
    panel(
      `shoulder_front_plate_${side}`,
      [[-0.079, 0.055], [0.066, 0.055], [0.093, 0.003], [0.066, -0.074], [-0.079, -0.052]],
      [s * 0.384, 1.55, 0.107], 0.022, s === -1 ? C.navy : C.teal, upper,
    );
    drawing(
      `shoulder_badge_${side}`, s === -1 ? divisionTex : crossTex,
      [s * 0.38, 1.545, 0.122], s === -1 ? 0.087 : 0.092, 0.099, upper,
    );
    box(`shoulder_top_stripe_${side}`, [s * 0.385, 1.695, -0.012], [0.072, 0.012, 0.071], s === -1 ? C.white : C.orange, upper);
    b.sweep(
      [[s * 0.466, 1.592, 0.074], [s * 0.484, 1.536, 0.081], [s * 0.458, 1.475, 0.072]],
      0.012,
      { color: C.deepTeal, bone: upper, sides: 6, name: `pauldron_outer_trim_${side}` },
    );
    for (const dx of [-0.055, 0.055]) {
      bolt(`shoulder_fixing_${side}_${dx}`, [s * 0.384 + dx, 1.584, 0.125], upper, 0.007);
    }
    b.sweep(arm, 0.06, { color: s === 1 ? suitPaint : C.dark, sides: 8, caps: "flat", name: `arm_core_${side}` });
    b.sweep(arm, (t) => {
      const k = (t - 0.18) / 0.25;
      return [0.079 - k * 0.014, 0.086 - k * 0.012];
    }, {
      from: 0.18, to: 0.43, bone: upper, color: s === 1 ? armorPaint : metalPaint,
      section: { ngon: 6 }, caps: "flat", name: `upper_arm_shell_${side}`,
    });
    // Narrow side inset makes the biceps read as tapered armor, not a cube.
    panel(
      `bicep_inset_${side}`,
      [[-0.064, 0.025], [0.057, 0.018], [0.057, -0.018], [-0.064, -0.025]],
      [s * 0.553, 1.515, 0.074], 0.01, C.deepTeal, upper,
    );
    cylinder(`elbow_hinge_${side}`, [s * 0.665, 1.515, 0.012], 0.073, 0.122, C.navy, lower, [0, 0, 1]);
    cylinder(`elbow_face_${side}`, [s * 0.665, 1.515, 0.078], 0.048, 0.016, metalPaint, lower, [0, 0, 1], 8);
    glow(cylinder(`elbow_light_${side}`, [s * 0.665, 1.515, 0.089], 0.022, 0.006, C.cyan, lower, [0, 0, 1], 8), 0.65);

    if (s === 1) {
      b.sweep(arm, (t) => [0.085 - (t - 0.6) * 0.035, 0.086 - (t - 0.6) * 0.035], {
        from: 0.6, to: 0.96, bone: lower, color: armorPaint,
        section: { ngon: 6 }, caps: "flat", name: "medic_gauntlet_L",
      });
      panel(
        "wrist_monitor_housing",
        [[-0.07, -0.048], [-0.052, -0.067], [0.052, -0.067], [0.07, -0.048], [0.07, 0.048], [0.052, 0.067], [-0.052, 0.067], [-0.07, 0.048]],
        [0.831, 1.517, 0.088], 0.037, C.navy, lower,
      );
      glow(drawing("wrist_vitals", monitorTex, [0.831, 1.517, 0.109], 0.086, 0.108, lower), 0.65);
      for (const dx of [-0.055, 0.055]) {
        box(`monitor_bezel_vertical_${dx}`, [0.831 + dx, 1.517, 0.112], [0.012, 0.111, 0.014], C.shadow, lower);
      }
      for (const dy of [-0.06, 0.06]) {
        box(`monitor_bezel_horizontal_${dy}`, [0.831, 1.517 + dy, 0.112], [0.098, 0.011, 0.014], C.shadow, lower);
      }
      for (let i = 0; i < 3; i++) {
        cylinder(`monitor_button_${i}`, [0.902, 1.545 - i * 0.027, 0.104], 0.007, 0.006, i === 0 ? C.orange : C.cyan, lower, [0, 0, 1], 6);
      }
    } else {
      for (const yy of [-0.05, 0.05]) {
        b.rod([-0.724, 1.515 + yy, -0.004], [-0.946, 1.515 + yy, -0.004], 0.02, {
          color: metalPaint, bone: lower, sides: 6, name: `prosthetic_rail_${yy}`,
        });
      }
      b.rod([-0.721, 1.515, 0.039], [-0.819, 1.515, 0.039], 0.03, {
        color: C.deepTeal, bone: lower, sides: 8, name: "prosthetic_actuator_barrel",
      });
      b.rod([-0.81, 1.515, 0.039], [-0.953, 1.515, 0.039], 0.015, {
        color: C.paleSteel, bone: lower, sides: 8, name: "prosthetic_actuator_rod",
      });
      b.sweep(bezier([-0.71, 1.472, 0.035], [-0.815, 1.414, 0.055], [-0.944, 1.478, 0.035]), 0.009, {
        color: C.orange, bone: lower, sides: 6, name: "prosthetic_signal_cable",
      });
      box("prosthetic_dorsal_plate", [-0.833, 1.573, -0.005], [0.154, 0.026, 0.118], armorPaint, lower);
      box("prosthetic_plate_stripe", [-0.834, 1.589, -0.005], [0.081, 0.007, 0.034], C.teal, lower);
      drawing("prosthetic_warning", hazardTex, [-0.835, 1.557, 0.061], 0.118, 0.022, lower);
      for (const x of [-0.755, -0.923]) {
        cylinder(`prosthetic_tie_${x}`, [x, 1.515, 0.044], 0.02, 0.011, C.orange, lower, [1, 0, 0], 8);
      }
    }
    cylinder(`wrist_ring_${side}`, [s * 0.971, 1.515, -0.01], 0.066, 0.038, C.deepTeal, arm.tip!, [s, 0, 0], 8);
    cylinder(`wrist_seal_${side}`, [s * 0.994, 1.515, -0.01], 0.052, 0.018, C.orange, hand, [s, 0, 0], 8);
    box(`palm_${side}`, [s * 1.041, 1.515, -0.005], [0.094, 0.119, 0.069], s === 1 ? suitPaint : C.navy, hand);
    panel(
      `back_of_hand_${side}`,
      [[-0.039, 0.047], [0.033, 0.047], [0.044, 0.024], [0.04, -0.046], [-0.036, -0.045]],
      [s * 1.041, 1.515, 0.035], 0.017, armorPaint, hand,
    );
    luminousBar(`hand_link_${side}`, [s * 1.041, 1.516, 0.047], [0.027, 0.01, 0.005], hand);
    digits.forEach((digit, i) => {
      b.sweep(digit, [0.0125, 0.009], {
        color: s === 1 ? C.navy : metalPaint, sides: 6, skin: "rigid", name: `finger_${side}_${i}`,
      });
      for (let k = 0; k < 2; k++) {
        const p = digit.at(k === 0 ? 0.22 : 0.78).at;
        box(
          `finger_plate_${side}_${i}_${k}`, [p.x, p.y, p.z + 0.012],
          [k === 0 ? 0.03 : 0.023, 0.018, 0.011],
          s === 1 ? armorPaint : C.paleSteel, digit.joints[k],
        );
      }
    });
    b.sweep(thumb, [0.016, 0.01], {
      color: s === 1 ? C.navy : metalPaint, sides: 6, skin: "rigid", name: `thumb_${side}`,
    });
    ellipsoid(`thumb_armor_${side}`, thumb.at(0.27), [0.019, 0.023, 0.018], armorPaint, thumb.joints[0], 8);
  }

  const rackBone = limbs[1].leg.joints[0];
  box("dose_rack_backplate", [-0.274, 0.913, 0.055], [0.13, 0.18, 0.037], C.navy, rackBone, [0, 0, -7]);
  for (let i = 0; i < 3; i++) {
    const x = -0.315 + i * 0.04;
    cylinder(`dose_ampoule_${i}`, [x, 0.913, 0.086], 0.014, 0.113, C.shadow, rackBone, [0, 1, 0], 8);
    glow(cylinder(`dose_solution_${i}`, [x, 0.914, 0.086], 0.0145, 0.047, C.cyan, rackBone, [0, 1, 0], 8), 0.6);
    cylinder(`dose_cap_${i}`, [x, 0.977, 0.086], 0.017, 0.02, C.orange, rackBone, [0, 1, 0], 8);
    cylinder(`dose_base_${i}`, [x, 0.851, 0.086], 0.016, 0.018, C.paleSteel, rackBone, [0, 1, 0], 8);
  }
  for (const y of [0.875, 0.948]) {
    box(`dose_retaining_bar_${y}`, [-0.275, y, 0.102], [0.126, 0.014, 0.012], C.deepTeal, rackBone);
  }

  // Open fingers remain rig-ready; an actual magnetic cradle supports the staff.
  const staffBone = limbs[0].hand;
  const sx = 1.245;
  const sz = 0.012;
  b.rod([sx, 0.16, sz], [sx, 1.985, sz], 0.027, {
    color: metalPaint, bone: staffBone, sides: 8, name: "staff_structural_shaft",
  });
  b.rod([sx, 0.61, sz], [sx, 1.32, sz], 0.034, {
    color: C.deepTeal, bone: staffBone, sides: 8, name: "staff_lower_sleeve",
  });
  b.rod([sx, 1.35, sz], [sx, 1.67, sz], 0.039, {
    color: C.navy, bone: staffBone, sides: 10, name: "staff_grip",
  });
  b.sweep(
    [[1.047, 1.515, -0.047], [1.137, 1.515, -0.074], [1.233, 1.515, -0.047]],
    0.016,
    { bone: staffBone, color: C.deepTeal, section: "box", caps: "flat", name: "magnetic_staff_cradle" },
  );
  cylinder("staff_docking_band", [sx, 1.515, sz], 0.047, 0.037, C.orange, staffBone);
  luminousBar("cradle_status", [1.141, 1.535, -0.072], [0.043, 0.006, 0.012], staffBone);
  for (let i = 0; i < 7; i++) {
    cylinder(`staff_grip_rib_${i}`, [sx, 1.373 + i * 0.044, sz], 0.043, 0.012, C.steel, staffBone);
  }
  for (const y of [0.24, 0.6, 1.31, 1.695, 1.87]) {
    cylinder(`staff_collar_${y}`, [sx, y, sz], 0.048, 0.035, armorPaint, staffBone, [0, 1, 0], 8);
    cylinder(`staff_collar_seam_${y}`, [sx, y + 0.022, sz], 0.041, 0.01, C.orange, staffBone, [0, 1, 0], 8);
  }
  luminousBar("staff_long_conduit", [sx, 0.961, sz + 0.035], [0.012, 0.58, 0.008], staffBone);
  b.part(new THREE.ConeGeometry(0.044, 0.105, 8), C.navy, {
    at: [sx, 0.169, sz], bone: staffBone, rotation: [180, 0, 0], name: "staff_ground_ferrule",
  });
  cylinder("staff_heel", [sx, 0.126, sz], 0.031, 0.016, C.orange, staffBone, [0, 1, 0], 8);
  b.loft(
    [
      { at: [sx, 1.774, sz], w: 0.067, h: 0.071 },
      { at: [sx, 1.9, sz], w: 0.118, h: 0.113 },
      { at: [sx, 1.983, sz], w: 0.176, h: 0.126 },
    ],
    { bone: staffBone, color: armorPaint, section: { ngon: 6 }, caps: "flat", name: "staff_emitter_housing" },
  );
  panel(
    "staff_emitter_front",
    [[-0.057, 0.05], [0.057, 0.05], [0.035, -0.09], [-0.035, -0.09]],
    [sx, 1.918, 0.084], 0.019, C.teal, staffBone,
  );
  drawing("staff_warning_band", hazardTex, [sx, 1.941, 0.096], 0.087, 0.019, staffBone);
  luminousBar("staff_emitter_indicator", [sx, 1.89, 0.099], [0.018, 0.047, 0.007], staffBone);
  for (const s of sides) {
    b.sweep(
      [[sx + s * 0.052, 1.976, sz], [sx + s * 0.172, 2.079, sz], [sx + s * 0.185, 2.258, sz], [sx + s * 0.129, 2.365, sz]],
      [0.044, 0.047, 0.04, 0.019],
      { color: armorPaint, bone: staffBone, section: { ngon: 5 }, caps: "flat", name: `staff_fork_${s}` },
    );
    b.sweep(
      [[sx + s * 0.092, 2.025, 0.049], [sx + s * 0.15, 2.091, 0.049], [sx + s * 0.163, 2.249, 0.049], [sx + s * 0.123, 2.328, 0.037]],
      [0.011, 0.008],
      { color: C.deepTeal, bone: staffBone, sides: 5, name: `fork_inlay_${s}` },
    );
    glow(b.sweep(
      [[sx + s * 0.125, 2.093, 0.017], [sx + s * 0.138, 2.239, 0.017], [sx + s * 0.105, 2.298, 0.017]],
      0.008,
      { color: C.cyan, bone: staffBone, sides: 6, name: `fork_energy_${s}` },
    ), 1.3);
    cylinder(`fork_pivot_${s}`, [sx + s * 0.163, 2.08, 0.057], 0.027, 0.014, C.navy, staffBone, [0, 0, 1], 8);
    cylinder(`fork_pivot_cap_${s}`, [sx + s * 0.163, 2.08, 0.068], 0.012, 0.009, C.orange, staffBone, [0, 0, 1], 6);
  }
  b.rod([sx, 1.991, -0.036], [sx, 2.173, -0.036], 0.018, {
    color: C.navy, bone: staffBone, sides: 6, name: "staff_core_rear_support",
  });
  cylinder("staff_core_rim", [sx, 2.179, 0.012], 0.103, 0.073, C.deepTeal, staffBone, [0, 0, 1], 12);
  cylinder("staff_core_bezel", [sx, 2.179, 0.055], 0.091, 0.019, C.orange, staffBone, [0, 0, 1], 12);
  glow(drawing("staff_core_face", coreTex, [sx, 2.179, 0.067], 0.175, 0.175, staffBone), 1.1);
  glow(drawing("staff_core_back", coreTex, [sx, 2.179, -0.027], 0.175, 0.175, staffBone, [0, 0, -1]), 0.8);
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    bolt(`core_bezel_screw_${i}`, [sx + Math.cos(a) * 0.075, 2.179 + Math.sin(a) * 0.075, 0.072], staffBone, 0.006);
  }

  // The deck is 23% shallower than the original, with a recessed underside.
  // The top still meets both boots and the staff ferrule at y = 0.12.
  const baseBone = root;
  b.part(new THREE.CylinderGeometry(1, 1, 0.032, 12), C.dark, {
    at: [0.12, 0.016, 0.01], scale: [1.36, 1, 0.46], bone: baseBone, name: "deck_recessed_foot",
  });
  b.part(new THREE.CylinderGeometry(1, 1, 0.07, 12), C.base, {
    at: [0.12, 0.067, 0.01], scale: [1.455, 1, 0.51], bone: baseBone, name: "deployment_plinth",
  });
  b.part(new THREE.CylinderGeometry(1, 1, 0.018, 12), C.navy, {
    at: [0.12, 0.111, 0.01], scale: [1.414, 1, 0.488], bone: baseBone, name: "deployment_deck",
  });
  const deckLoop: number[][] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    deckLoop.push([0.12 + Math.sin(a) * 1.392, 0.122, 0.01 + Math.cos(a) * 0.466]);
  }
  b.sweep(polyline(deckLoop, { closed: true }), 0.005, {
    color: C.steel, bone: baseBone, sides: 5, name: "deck_perimeter",
  });
  for (const x of [-0.98, -0.69, 0.84, 1.12]) {
    box(`deck_lamp_socket_${x}`, [x, 0.12, 0.195], [0.14, 0.012, 0.052], C.dark, baseBone);
    glow(box(`deck_lamp_${x}`, [x, 0.129, 0.195], [0.106, 0.006, 0.018], C.cyan, baseBone), 0.7);
  }
  box("front_plaque_back", [0.1, 0.069, 0.518], [0.422, 0.068, 0.018], C.dark, baseBone);
  drawing("front_plaque", serialTex, [0.1, 0.069, 0.529], 0.387, 0.062, baseBone);
  for (const s of sides) {
    glow(b.sweep(
      [[s * 0.38, 0.126, 0.335], [s * 0.49, 0.126, 0.26], [s * 0.49, 0.126, -0.13]],
      0.004,
      { bone: baseBone, color: C.cyan, sides: 5, name: `deployment_outline_${s}` },
    ), 0.6);
    for (let i = 0; i < 3; i++) {
      box(`deployment_caution_${s}_${i}`, [s * (0.54 + i * 0.033), 0.125, 0.17], [0.016, 0.003, 0.055], C.orange, baseBone, [0, 25, 0]);
    }
  }
  for (let i = 0; i < 7; i++) {
    box(`deck_service_line_${i}`, [-0.49 + i * 0.17, 0.123, -0.32], [0.065, 0.003, 0.009], C.steel, baseBone);
  }
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    cylinder(`deck_bolt_${i}`, [0.12 + Math.sin(a) * 1.26, 0.122, 0.01 + Math.cos(a) * 0.377], 0.012, 0.006, C.steel, baseBone, [0, 1, 0], 6);
  }
  box("supply_case_body", [-0.66, 0.207, -0.232], [0.26, 0.174, 0.2], C.deepTeal, baseBone);
  box("supply_case_lid", [-0.66, 0.305, -0.232], [0.274, 0.036, 0.213], armorPaint, baseBone);
  box("supply_case_gasket", [-0.66, 0.282, -0.232], [0.269, 0.012, 0.208], C.navy, baseBone);
  drawing("case_rescue_badge", crossTex, [-0.66, 0.217, -0.129], 0.091, 0.091, baseBone);
  for (const s of sides) {
    box(`case_latch_${s}`, [-0.66 + s * 0.091, 0.269, -0.12], [0.026, 0.052, 0.021], C.orange, baseBone);
    box(`case_handle_foot_${s}`, [-0.66 + s * 0.052, 0.334, -0.232], [0.023, 0.031, 0.027], C.navy, baseBone);
  }
  b.rod([-0.712, 0.35, -0.232], [-0.608, 0.35, -0.232], 0.013, {
    color: C.navy, bone: baseBone, sides: 6, name: "case_carry_handle",
  });
  for (let i = 0; i < 8; i++) {
    box(
      `deck_scuff_${i}`, [-0.85 + random() * 0.42, 0.123, -0.07 + random() * 0.2],
      [0.016 + random() * 0.04, 0.0015, 0.002], C.steel, baseBone, [0, 14, 0],
    );
  }

  return b.root;
}
