import * as THREE from "three";
import { glow } from "../../../../kits/glow";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame, line } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { offset, rng } from "../../../../src/math";
import { grain, mix, mottle, noise, paint, smoothstep, stripes } from "../../../../src/paint";
import { arc, bezier, catmull, polyline, spiral } from "../../../../src/path";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Gnome Tinkerer",
  description:
    "Whimsical low-poly gnome inventor with brass-goggled pointed cap, bushy braided beard, tool-laden leather apron, and an overflowing clockwork gadget backpack with steam pipes, periscope, arcane lantern, and mechanical claw.",
  style: "whimsical low-poly mix",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "gnomeTinkerer", detail: 0.75, paintSize: 1024 });

  // ---------------------------------------------------------------------------
  // Palette & Paints (Storybook Whimsical + Crisp Low-Poly Facets)
  // ---------------------------------------------------------------------------
  const SKIN_BASE = "#f4be9b";
  const SKIN_FLUSH = "#e47b68";
  const SKIN_SHADE = "#d19370";

  const BEARD_CREAM = "#f7f1e3";
  const BEARD_WARM = "#dfd3be";
  const BEARD_TIP = "#c9b89c";

  const TUNIC_TEAL = "#247ba0";
  const TUNIC_DARK = "#17526e";
  const TUNIC_LIGHT = "#3a9bc2";

  const HAT_RED = "#c83e37";
  const HAT_DARK = "#8e2520";
  const HAT_PATCH = "#e06d53";

  const APRON_TAN = "#b87339";
  const APRON_DARK = "#7d491e";
  const LEATHER_DARK = "#4a2c18";
  const LEATHER_MID = "#6b4124";
  const BOOT_BROWN = "#3b2314";

  const PANTS_OLIVE = "#526342";
  const PANTS_DARK = "#39462d";

  const WOOD_WARM = "#8c532b";
  const WOOD_DARK = "#593116";
  const WOOD_PALE = "#c99b68";

  const BRASS = "#d9a036";
  const BRASS_DARK = "#9c6d1a";
  const BRASS_BRIGHT = "#f5c85c";
  const COPPER = "#c86d44";
  const COPPER_DARK = "#8c4426";
  const IRON = "#4f5861";
  const IRON_DARK = "#2f353b";
  const STEEL = "#9aa5b1";

  const GLOW_CYAN = "#4cf2ff";
  const GLOW_AMBER = "#ffaa2b";
  const GLOW_LIME = "#7dff59";
  const GLOW_MAGENTA = "#ff59b8";
  const GLASS_BLUE = "#78c8e6";

  // Rosy gnome skin paint: warm cheeks, rosy nose & ear tips
  const skinPaint = paint((p, n) => {
    const noseDist = Math.hypot(p.x, p.y - 0.67, p.z - 0.16);
    const cheekDist = Math.hypot(Math.abs(p.x) - 0.095, p.y - 0.65, p.z - 0.09);
    const earDist = Math.hypot(Math.abs(p.x) - 0.21, p.y - 0.68, p.z - 0.01);
    const blush = Math.max(
      smoothstep(0.065, 0.01, noseDist) * 0.85,
      smoothstep(0.065, 0.015, cheekDist) * 0.65,
      smoothstep(0.06, 0.01, earDist) * 0.55,
    );
    const base = mix(SKIN_SHADE, SKIN_BASE, smoothstep(-0.4, 0.5, n.y));
    return mix(base, SKIN_FLUSH, blush);
  });

  // Quilted teal tunic with subtle herringbone/weave mottle
  const tunicPaint = mottle(TUNIC_TEAL, TUNIC_DARK, { size: 0.055, contrast: 1.4, seed: 11 });
  const sleevePaint = stripes(TUNIC_TEAL, TUNIC_LIGHT, { size: 0.045, axis: "x", width: 0.28, wobble: 0.15, seed: 15 });

  // Felted red hat with warm weathered top gradient and subtle patches
  const hatPaint = paint((p, n) => {
    const m = noise(p, 0.07, 23);
    const base = mix(HAT_DARK, HAT_RED, smoothstep(0.25, 0.75, m));
    const tipFade = smoothstep(0.78, 1.08, p.y);
    const topLight = smoothstep(-0.3, 0.6, n.y) * 0.22;
    return mix(mix(base, HAT_DARK, tipFade * 0.45), HAT_PATCH, topLight);
  });

  // Oil-stained, singed tinkerer leather apron
  const apronPaint = paint((p) => {
    const stain = noise(p, 0.06, 31);
    consthem = smoothstep(0.32, 0.22, p.y);
    const base = mix(APRON_TAN, APRON_DARK, smoothstep(0.4, 0.75, stain));
    return mix(base, LEATHER_DARK, thehem * 0.55);
  });

  // Striped/herringbone olive trousers
  const pantsPaint = stripes(PANTS_OLIVE, PANTS_DARK, { size: 0.032, axis: "x", width: 0.4, wobble: 0.1, seed: 41 });

  // Rich timber grain for backpack frame & tool handles
  const woodPaint = grain(WOOD_WARM, WOOD_DARK, { size: 0.025, axis: "y", seed: 52 });
  const woodCrossPaint = grain(WOOD_WARM, WOOD_DARK, { size: 0.025, axis: "x", seed: 53 });

  // Lush cream beard with warm golden-tan tips
  const beardPaint = paint((p, n) => {
    const streak = grain(BEARD_CREAM, BEARD_WARM, { size: 0.018, axis: "y", seed: 64 }).at(p, n);
    const low = smoothstep(0.62, 0.34, p.y);
    return mix(streak, BEARD_TIP, low * 0.65);
  });

  // Burnished brass & copper with patina
  const brassPaint = mottle(BRASS, BRASS_DARK, { size: 0.04, contrast: 1.5, seed: 71 });
  const copperPaint = mottle(COPPER, COPPER_DARK, { size: 0.045, contrast: 1.5, seed: 77 });

  // ---------------------------------------------------------------------------
  // SVG Textures (Decals, Gauges, Blueprints, Eyes, Beard Strands)
  // ---------------------------------------------------------------------------
  const eyeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <ellipse cx="64" cy="66" rx="50" ry="46" fill="#23140d"/>
      <ellipse cx="64" cy="68" rx="43" ry="39" fill="#fdfaf5"/>
      <circle cx="66" cy="68" r="27" fill="#1b5e7a"/>
      <circle cx="66" cy="68" r="21" fill="#2ea8cc"/>
      <circle cx="66" cy="68" r="12" fill="#101820"/>
      <circle cx="53" cy="54" r="9" fill="#ffffff"/>
      <circle cx="77" cy="78" r="4.5" fill="#bdf4ff"/>
    </svg>`,
    { size: 256 },
  );

  const gaugeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="60" fill="#f7eed7" stroke="#5c3d1e" stroke-width="6"/>
      <path d="M 24 84 A 46 46 0 1 1 104 84" fill="none" stroke="#2c353d" stroke-width="5"/>
      <path d="M 86 26 A 46 46 0 0 1 108 76" fill="none" stroke="#d1382e" stroke-width="8"/>
      <line x1="64" y1="18" x2="64" y2="28" stroke="#231f20" stroke-width="4"/>
      <line x1="22" y1="54" x2="32" y2="57" stroke="#231f20" stroke-width="4"/>
      <line x1="106" y1="54" x2="96" y2="57" stroke="#231f20" stroke-width="4"/>
      <line x1="34" y1="28" x2="41" y2="36" stroke="#231f20" stroke-width="4"/>
      <line x1="94" y1="28" x2="87" y2="36" stroke="#d1382e" stroke-width="4"/>
      <polygon points="64,68 59,60 92,34" fill="#c92a22"/>
      <circle cx="64" cy="64" r="8" fill="#8c5a2b"/>
    </svg>`,
    { size: 256 },
  );

  const blueprintTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <rect width="128" height="128" fill="#1e5785"/>
      <rect x="6" y="6" width="116" height="116" fill="none" stroke="#8de4ff" stroke-width="3"/>
      <line x1="0" y1="32" x2="128" y2="32" stroke="#3c7fb3" stroke-width="2"/>
      <line x1="0" y1="64" x2="128" y2="64" stroke="#3c7fb3" stroke-width="2"/>
      <line x1="0" y1="96" x2="128" y2="96" stroke="#3c7fb3" stroke-width="2"/>
      <line x1="32" y1="0" x2="32" y2="128" stroke="#3c7fb3" stroke-width="2"/>
      <line x1="64" y1="0" x2="64" y2="128" stroke="#3c7fb3" stroke-width="2"/>
      <line x1="96" y1="0" x2="96" y2="128" stroke="#3c7fb3" stroke-width="2"/>
      <circle cx="64" cy="64" r="30" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-dasharray="8 5"/>
      <circle cx="64" cy="64" r="14" fill="none" stroke="#8de4ff" stroke-width="3"/>
      <line x1="20" y1="64" x2="108" y2="64" stroke="#ffffff" stroke-width="2.5"/>
      <line x1="64" y1="20" x2="64" y2="108" stroke="#ffffff" stroke-width="2.5"/>
    </svg>`,
    { size: 256 },
  );

  const patchStitchTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <rect x="14" y="14" width="100" height="100" rx="14" fill="#e07a47" stroke="#5c2d16" stroke-width="6"/>
      <line x1="6" y1="32" x2="24" y2="32" stroke="#f7eed7" stroke-width="5" stroke-linecap="round"/>
      <line x1="6" y1="64" x2="24" y2="64" stroke="#f7eed7" stroke-width="5" stroke-linecap="round"/>
      <line x1="6" y1="96" x2="24" y2="96" stroke="#f7eed7" stroke-width="5" stroke-linecap="round"/>
      <line x1="104" y1="32" x2="122" y2="32" stroke="#f7eed7" stroke-width="5" stroke-linecap="round"/>
      <line x1="104" y1="64" x2="122" y2="64" stroke="#f7eed7" stroke-width="5" stroke-linecap="round"/>
      <line x1="104" y1="96" x2="122" y2="96" stroke="#f7eed7" stroke-width="5" stroke-linecap="round"/>
      <line x1="32" y1="6" x2="32" y2="24" stroke="#f7eed7" stroke-width="5" stroke-linecap="round"/>
      <line x1="64" y1="6" x2="64" y2="24" stroke="#f7eed7" stroke-width="5" stroke-linecap="round"/>
      <line x1="96" y1="6" x2="96" y2="24" stroke="#f7eed7" stroke-width="5" stroke-linecap="round"/>
      <line x1="32" y1="104" x2="32" y2="122" stroke="#f7eed7" stroke-width="5" stroke-linecap="round"/>
      <line x1="64" y1="104" x2="64" y2="122" stroke="#f7eed7" stroke-width="5" stroke-linecap="round"/>
      <line x1="96" y1="104" x2="96" y2="122" stroke="#f7eed7" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const beardTuftTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128">
      <path d="M 8 0 L 56 0 L 60 58 L 48 112 L 32 128 L 16 112 L 4 58 Z" fill="#f5ede0"/>
      <path d="M 18 0 L 26 98 L 32 122 L 38 98 L 46 0 Z" fill="#dfd1ba"/>
      <path d="M 28 18 L 32 110 L 36 18 Z" fill="#c7b597"/>
    </svg>`,
    { size: 128 },
  );

  const featherLeafTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128">
      <path d="M 32 0 C 54 24 58 78 32 128 C 6 78 10 24 32 0 Z" fill="#529e3e"/>
      <path d="M 32 4 L 32 124" stroke="#2d5e20" stroke-width="5"/>
      <path d="M 32 34 L 48 22 M 32 58 L 50 44 M 32 82 L 46 70 M 32 34 L 16 22 M 32 58 L 14 44 M 32 82 L 18 70" stroke="#85d66b" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------------------
  // Reusable Low-Poly Mechanical Helpers
  // ---------------------------------------------------------------------------
  // Builds a crisp low-poly cogwheel outline in 2D for `b.extrude`
  function cogOutline(rInner: number, rOuter: number, teeth: number): OutlinePoint[] {
    const pts: OutlinePoint[] = [];
    const step = (2 * Math.PI) / teeth;
    for (let i = 0; i < teeth; i++) {
      const a0 = i * step;
      const a1 = a0 + step * 0.22;
      const a2 = a0 + step * 0.32;
      const a3 = a0 + step * 0.68;
      const a4 = a0 + step * 0.78;
      pts.push(
        [Math.cos(a0) * rInner, Math.sin(a0) * rInner, "sharp"],
        [Math.cos(a1) * rInner, Math.sin(a1) * rInner, "sharp"],
        [Math.cos(a2) * rOuter, Math.sin(a2) * rOuter, "sharp"],
        [Math.cos(a3) * rOuter, Math.sin(a3) * rOuter, "sharp"],
        [Math.cos(a4) * rInner, Math.sin(a4) * rInner, "sharp"],
      );
    }
    return pts;
  }

  // Places a complete cogwheel with hub and axle bolt
  function buildGear(
    at: [number, number, number],
    xDir: [number, number, number],
    yDir: [number, number, number],
    rInner: number,
    rOuter: number,
    teeth: number,
    thickness: number,
    color: string,
    hubColor: string,
    bone: ReturnType<typeof b.joint>,
    group: string,
    name: string,
  ) {
    const gear = b.extrude(cogOutline(rInner, rOuter, teeth), {
      at,
      x: xDir,
      y: yDir,
      thickness,
      color,
      bone,
      group,
      name,
    });
    const normal = new THREE.Vector3(...xDir).cross(new THREE.Vector3(...yDir)).normalize();
    const hubA = offset(at, normal, -thickness * 0.85);
    const hubB = offset(at, normal, thickness * 0.85);
    b.rod(hubA, hubB, rInner * 0.52, hubColor, {
      bone,
      sides: 6,
      smooth: false,
      group,
      name: `${name}Hub`,
    });
    const pinA = offset(at, normal, -thickness * 1.15);
    const pinB = offset(at, normal, thickness * 1.15);
    b.rod(pinA, pinB, rInner * 0.24, IRON_DARK, {
      bone,
      sides: 5,
      smooth: false,
      group,
      name: `${name}Pin`,
    });
    return gear;
  }

  // ---------------------------------------------------------------------------
  // 1. SKELETON (Full Humanoid + Jaw + Beard + Hat + Backpack Hinges)
  // ---------------------------------------------------------------------------
  // Gnome stands ~1.18 m tall to hat tip (~1.24 m to highest antenna tip), stout & grounded
  const hips = b.joint("hips", { at: [0, 0.34, 0], dir: [0, 1, 0], role: "spine", group: "torso" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.34, 0],
      [0, 0.45, 0.012],
      [0, 0.56, 0.005],
    ],
    {
      parent: hips,
      names: ["belly", "chest"],
      role: "spine",
      group: "torso",
    },
  );
  const belly = spine.joints[0];
  const chest = spine.joints[1];

  const neck = b.joint("neck", {
    parent: chest,
    at: [0, 0.58, 0.01],
    dir: [0, 1, 0.08],
    role: "neck",
    group: "head",
  });
  const head = b.joint("head", {
    parent: neck,
    at: [0, 0.62, 0.015],
    dir: [0, 0.1, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.6, 0.055],
    dir: [0, -0.22, 1],
    role: "jaw",
    group: "head",
  });

  // Expressive ears & bushy beard chain
  const earL = b.joint("earL", {
    parent: head,
    at: [0.145, 0.675, 0.01],
    dir: [1, 0.28, -0.12],
    role: "fan",
    group: "head",
  });
  const earR = b.joint("earR", {
    parent: head,
    at: [-0.145, 0.675, 0.01],
    dir: [-1, 0.28, -0.12],
    role: "fan",
    group: "head",
  });

  const beardChain = b.chain(
    "beard",
    catmull([
      [0, 0.575, 0.135],
      [0, 0.45, 0.175],
      [0, 0.31, 0.165],
    ]),
    {
      parent: jaw,
      names: ["beardRoot", "beardTip"],
      role: "tail",
      group: "beard",
    },
  );

  // Slouchy gnome cap chain
  const hatChain = b.chain(
    "hat",
    catmull([
      [0, 0.74, 0.005],
      [0, 0.91, -0.02],
      [0.03, 1.06, -0.11],
      [0.06, 1.15, -0.24],
    ]),
    {
      parent: head,
      names: ["hatBase", "hatMid", "hatTip"],
      role: "tail",
      group: "hat",
    },
  );

  // Legs with IK planted squarely on y = 0.042 (boot sole thickness lands at y = 0)
  const legChains: Record<string, ReturnType<typeof b.chain>> = {};
  const toeJoints: Record<string, ReturnType<typeof b.joint>> = {};
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const hipPt: [number, number, number] = [s * 0.105, 0.33, 0];
    const ankleTarget: [number, number, number] = [s * 0.125, 0.055, 0.01];
    const legPts = limb(hipPt, ankleTarget, [0.15, 0.145], [0, 0, 1]);
    const leg = b.chain(`leg${side}`, legPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.125, 0, 0.04],
      group: `leg${side}`,
    });
    legChains[side] = leg;
    toeJoints[side] = b.joint(`toe${side}`, {
      parent: leg.tip!,
      at: [s * 0.125, 0.038, 0.1],
      dir: [0, 0.18, 1],
      role: "digit",
      group: `leg${side}`,
    });
  }

  // Arms extended in clean rigging rest pose (slightly angled down & forward) with 3-digit tinkerer hands
  const armChains: Record<string, ReturnType<typeof b.chain>> = {};
  const fingerJoints: Record<string, ReturnType<typeof b.joint>[]> = { L: [], R: [] };
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const clavicle = b.joint(`clavicle${side}`, {
      parent: chest,
      at: [s * 0.085, 0.555, 0.01],
      dir: [s, 0.05, 0],
      role: "arm",
      group: `arm${side}`,
    });
    const shoulderPt: [number, number, number] = [s * 0.165, 0.545, 0.005];
    const elbowPt: [number, number, number] = [s * 0.285, 0.465, -0.01];
    const wristPt: [number, number, number] = [s * 0.39, 0.395, 0.04];
    const arm = b.chain(`arm${side}`, [shoulderPt, elbowPt, wristPt], {
      parent: clavicle,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
      group: `arm${side}`,
    });
    armChains[side] = arm;

    const thumb = b.joint(`thumb${side}`, {
      parent: arm.tip!,
      at: [s * 0.415, 0.39, 0.085],
      dir: [s * 0.55, -0.15, 0.85],
      role: "digit",
      group: `arm${side}`,
    });
    const index = b.joint(`index${side}`, {
      parent: arm.tip!,
      at: [s * 0.445, 0.37, 0.075],
      dir: [s * 0.85, -0.45, 0.35],
      role: "digit",
      group: `arm${side}`,
    });
    const mitten = b.joint(`mitten${side}`, {
      parent: arm.tip!,
      at: [s * 0.44, 0.365, 0.025],
      dir: [s * 0.85, -0.48, 0.05],
      role: "digit",
      group: `arm${side}`,
    });
    fingerJoints[side].push(thumb, index, mitten);
  }

  // Backpack & Gadget Skeleton (hinges and articulated mechanical crane arm)
  const packRoot = b.joint("packRoot", {
    parent: chest,
    at: [0, 0.52, -0.14],
    dir: [0, 1, -0.05],
    role: "hinge",
    group: "backpack",
  });
  const packTopLid = b.joint("packTopLid", {
    parent: packRoot,
    at: [0, 0.72, -0.13],
    dir: [0, 0.2, -1],
    role: "hinge",
    group: "backpack",
  });
  const winderKey = b.joint("winderKey", {
    parent: packRoot,
    at: [0, 0.48, -0.35],
    dir: [0, 0, -1],
    role: "hinge",
    group: "backpack",
  });
  const mainGearJoint = b.joint("mainGear", {
    parent: packRoot,
    at: [-0.14, 0.56, -0.35],
    dir: [0, 0, -1],
    role: "hinge",
    group: "backpack",
  });
  const periscopeJoint = b.joint("periscope", {
    parent: packRoot,
    at: [-0.14, 0.81, -0.22],
    dir: [0, 1, 0],
    role: "hinge",
    group: "gadgets",
  });
  const craneBoom = b.chain(
    "crane",
    [
      [0.14, 0.78, -0.21],
      [0.24, 0.96, -0.18],
      [0.27, 1.03, -0.01],
    ],
    {
      parent: packRoot,
      names: ["craneBase", "craneElbow", "craneTip"],
      role: "arm",
      group: "gadgets",
    },
  );
  const lanternSwing = b.joint("lanternSwing", {
    parent: craneBoom.tip!,
    at: [0.27, 1.01, 0.01],
    dir: [0, -1, 0],
    role: "hinge",
    group: "lantern",
  });
  const clawArm = b.chain(
    "clawArm",
    [
      [-0.22, 0.64, -0.21],
      [-0.35, 0.74, -0.14],
      [-0.37, 0.81, 0.02],
    ],
    {
      parent: packRoot,
      names: ["clawBase", "clawMid", "clawTip"],
      role: "arm",
      group: "gadgets",
    },
  );

  // ---------------------------------------------------------------------------
  // 2. TORSO, TUNIC, COLLAR, BELT & TINKERER'S APRON
  // ---------------------------------------------------------------------------
  // Stout pot-bellied gnome torso lofted over hips + spine
  const torsoLoft = b.loft(
    [
      { at: [0, 0.27, -0.005], w: 0.29, h: 0.24 },
      { at: [0, 0.36, 0.02], w: 0.36, h: 0.31 },
      { at: [0, 0.47, 0.03], w: 0.35, h: 0.29 },
      { at: [0, 0.58, 0.005], w: 0.28, h: 0.22 },
      { at: [0, 0.63, 0.005], w: 0.16, h: 0.15 },
    ],
    {
      bone: [hips, spine],
      sides: 8,
      smooth: false,
      color: tunicPaint,
      group: "torso",
      name: "tunicBody",
    },
  );

  // Flared tunic skirt hem around the hips
  const tunicSkirt = b.lathe(
    [
      [0.12, 0],
      [0.21, 0.01],
      [0.195, 0.065],
      [0.165, 0.12],
      [0.12, 0.12],
    ],
    {
      at: [0, 0.21, 0.005],
      segments: 10,
      color: tunicPaint,
      bone: hips,
      group: "torso",
      name: "tunicSkirt",
    },
  );

  // Decorative gold-trimmed tunic hem band
  b.lathe(
    [
      [0.195, 0],
      [0.216, 0.005],
      [0.212, 0.025],
      [0.192, 0.025],
    ],
    {
      at: [0, 0.21, 0.005],
      segments: 10,
      color: BRASS,
      bone: hips,
      group: "torso",
      name: "tunicHemTrim",
    },
  );

  // Chunky leather tinkerer's apron covering chest and belly
  b.extrude(
    [
      [-0.105, 0.56, "sharp"],
      [0.105, 0.56, "sharp"],
      [0.115, 0.45],
      [0.145, 0.35],
      [0.135, 0.19, "sharp"],
      [-0.135, 0.19, "sharp"],
      [-0.145, 0.35],
      [-0.115, 0.45],
    ],
    {
      at: [0, 0, 0.158],
      x: [1, 0, 0],
      y: [0, 1, -0.08],
      thickness: 0.024,
      bevel: 0.005,
      color: apronPaint,
      bone: belly,
      group: "apron",
      name: "leatherApron",
    },
  );

  // Apron chest pocket with brass rivets and tucked calipers + screwdriver
  b.part(new THREE.BoxGeometry(0.13, 0.075, 0.022), LEATHER_MID, {
    at: [0, 0.475, 0.174],
    rotation: [6, 0, 0],
    flat: true,
    bone: chest,
    group: "apron",
    name: "apronChestPocket",
  });
  for (const s of [1, -1] as const) {
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.012, 6), BRASS_BRIGHT, {
      at: [s * 0.052, 0.502, 0.184],
      dir: [0, 0, 1],
      flat: true,
      bone: chest,
      group: "apron",
      name: `apronPocketRivet${s > 0 ? "L" : "R"}`,
    });
  }

  // Mini brass calipers & red-handled screwdriver peeking from chest pocket
  b.rod([-0.032, 0.48, 0.18], [-0.048, 0.545, 0.19], 0.008, BRASS_BRIGHT, {
    bone: chest,
    sides: 5,
    smooth: false,
    group: "apron",
    name: "pocketCaliperA",
  });
  b.rod([-0.015, 0.48, 0.18], [-0.01, 0.545, 0.19], 0.008, BRASS_BRIGHT, {
    bone: chest,
    sides: 5,
    smooth: false,
    group: "apron",
    name: "pocketCaliperB",
  });
  b.capsule([0.03, 0.505, 0.182], [0.042, 0.555, 0.195], [0.012, 0.015], HAT_RED, {
    bone: chest,
    sides: 6,
    smooth: false,
    group: "apron",
    name: "pocketDriverHandle",
  });

  // Heavy utility belt looped around waist
  const torsoSurf = b.surface([torsoLoft, tunicSkirt]);
  const beltLoop = torsoSurf.loop(frame([0, 0.34, 0], [0, 1, 0]), { lift: 0.016 });
  b.sweep(beltLoop, () => [0.022, 0.034], {
    section: "box",
    color: LEATHER_DARK,
    bone: hips,
    group: "belt",
    name: "utilityBelt",
  });

  // Studs around the utility belt
  b.along(beltLoop, 10, (pt) => {
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.012, 6), BRASS, {
      frame: pt.moved([0, 0.012, 0]),
      flat: true,
      bone: hips,
      group: "belt",
    });
  });

  // Oversized hexagonal brass belt buckle with glowing arcane core crystal
  b.extrude(
    [
      [-0.055, -0.042, "sharp"],
      [0.055, -0.042, "sharp"],
      [0.068, 0, "sharp"],
      [0.055, 0.042, "sharp"],
      [-0.055, 0.042, "sharp"],
      [-0.068, 0, "sharp"],
    ],
    {
      at: [0, 0.345, 0.188],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.024,
      bevel: 0.005,
      color: BRASS_BRIGHT,
      bone: hips,
      group: "belt",
      name: "beltBuckleFrame",
    },
  );
  b.part(new THREE.BoxGeometry(0.068, 0.052, 0.026), IRON_DARK, {
    at: [0, 0.345, 0.19],
    flat: true,
    bone: hips,
    group: "belt",
    name: "beltBuckleCore",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.024, 0), GLOW_CYAN, {
      at: [0, 0.345, 0.202],
      scale: [1.1, 0.85, 0.65],
      flat: true,
      bone: hips,
      group: "belt",
      name: "buckleGem",
    }),
    1.3,
  );

  // Crossed leather backpack/apron harnesses over shoulders with brass buckles
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const strapRough = catmull([
      [s * 0.095, 0.36, 0.175],
      [s * 0.115, 0.49, 0.155],
      [s * 0.11, 0.605, 0.02],
      [s * 0.105, 0.51, -0.145],
      [s * 0.095, 0.36, -0.155],
    ]);
    const drapedStrap = torsoSurf.drape(strapRough, { lift: 0.015 });
    b.sweep(drapedStrap, () => [0.022, 0.009], {
      section: "box",
      color: LEATHER_MID,
      bone: chest,
      group: "torso",
      name: `shoulderStrap${side}`,
    });

    // Chest strap buckle
    b.part(new THREE.BoxGeometry(0.046, 0.036, 0.018), BRASS_BRIGHT, {
      at: [s * 0.108, 0.51, 0.145],
      rotation: [-18, s * 10, 0],
      flat: true,
      bone: chest,
      group: "torso",
      name: `strapBuckle${side}`,
    });

    // Epaulet brass shoulder plates with rivets
    b.extrude(
      [
        [-0.055, -0.038, "sharp"],
        [0.055, -0.038, "sharp"],
        [0.065, 0.01, "sharp"],
        [0, 0.045, "sharp"],
        [-0.065, 0.01, "sharp"],
      ],
      {
        at: [s * 0.165, 0.578, 0.005],
        x: [0, 0, 1],
        y: [s * 0.85, 0.52, 0],
        thickness: 0.014,
        bevel: 0.003,
        color: copperPaint,
        bone: chest,
        group: "torso",
        name: `epaulet${side}`,
      },
    );
  }

  // Horizontal sternum strap linking shoulder straps across the chest
  b.rod([-0.105, 0.51, 0.155], [0.105, 0.51, 0.155], [0.012, 0.012], LEATHER_DARK, {
    section: "box",
    bone: chest,
    group: "torso",
    name: "sternumStrap",
  });

  // Hip Belt Gadgets: Left side = Leather tool holster + Brass Spanner Wrench + Oil Can
  // Right side = Stitched Leather Pouch + Glowing Green Alchemical Vial + Coiled Copper Wire
  b.frustumBox([0.185, 0.35, 0.03], [0.198, 0.23, 0.02], [0.075, 0.095], [0.058, 0.075], {
    color: LEATHER_DARK,
    bone: hips,
    group: "beltProps",
    name: "holsterPocketL",
  });
  // Chunky oversized low-poly spanner wrench in left holster
  b.rod([0.205, 0.25, 0.025], [0.235, 0.41, 0.045], 0.015, STEEL, {
    bone: hips,
    sides: 6,
    smooth: false,
    group: "beltProps",
    name: "wrenchShaft",
  });
  b.extrude(
    [
      [-0.038, -0.025, "sharp"],
      [0.038, -0.025, "sharp"],
      [0.046, 0.028, "sharp"],
      [0.02, 0.045, "sharp"],
      [0.016, 0.008, "sharp"],
      [-0.016, 0.008, "sharp"],
      [-0.02, 0.045, "sharp"],
      [-0.046, 0.028, "sharp"],
    ],
    {
      at: [0.238, 0.425, 0.048],
      x: [0, 0, 1],
      y: [0.2, 0.98, 0.1],
      thickness: 0.02,
      color: STEEL,
      bone: hips,
      group: "beltProps",
      name: "wrenchHead",
    },
  );
  // Brass thumbwheel on spanner
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.016, 8), BRASS_BRIGHT, {
    at: [0.23, 0.39, 0.042],
    dir: [1, 0.2, 0],
    flat: true,
    bone: hips,
    group: "beltProps",
    name: "wrenchThumbwheel",
  });

  // Copper oil can clipped beside left holster
  b.lathe(
    [
      [0, 0],
      [0.038, 0],
      [0.04, 0.045],
      [0.018, 0.075],
      [0.006, 0.135],
      [0, 0.135],
    ],
    {
      at: [0.165, 0.24, 0.105],
      axis: [0.25, 0.92, 0.28],
      segments: 8,
      color: COPPER,
      bone: hips,
      group: "beltProps",
      name: "oilCanBody",
    },
  );

  // Right hip stitched leather pouch + glowing green potion vial + coiled wire
  const pouchR = b.frustumBox([-0.185, 0.35, 0.04], [-0.2, 0.24, 0.035], [0.08, 0.095], [0.095, 0.105], {
    color: APRON_DARK,
    bone: hips,
    group: "beltProps",
    name: "gadgetPouchR",
  });
  b.frustumBox([-0.182, 0.365, 0.04], [-0.21, 0.31, 0.04], [0.086, 0.03], [0.098, 0.025], {
    color: LEATHER_DARK,
    bone: hips,
    group: "beltProps",
    name: "gadgetPouchFlapR",
  });
  b.part(new THREE.SphereGeometry(0.013, 6, 4), BRASS_BRIGHT, {
    at: [-0.218, 0.31, 0.04],
    flat: true,
    bone: hips,
    group: "beltProps",
    name: "pouchButtonR",
  });
  b.decal(pouchR, patchStitchTex, {
    at: [-0.23, 0.29, 0.04],
    dir: [-1, 0, 0.1],
    size: [0.06, 0.06],
    bone: hips,
    group: "beltProps",
    name: "pouchPatchDecal",
  });

  // Glowing green alchemical vial strapped to right hip
  glow(
    b.capsule([-0.165, 0.26, 0.125], [-0.15, 0.33, 0.14], 0.024, GLOW_LIME, {
      bone: hips,
      sides: 7,
      smooth: false,
      group: "beltProps",
      name: "alchVialGlass",
    }),
    1.25,
  );
  b.rod([-0.153, 0.325, 0.138], [-0.145, 0.358, 0.145], [0.016, 0.02], WOOD_PALE, {
    bone: hips,
    sides: 6,
    smooth: false,
    group: "beltProps",
    name: "alchVialCork",
  });
  b.rod([-0.162, 0.285, 0.13], [-0.155, 0.305, 0.135], 0.027, BRASS, {
    bone: hips,
    sides: 7,
    smooth: false,
    group: "beltProps",
    name: "alchVialBand",
  });

  // ---------------------------------------------------------------------------
  // 3. LEGS & BUCKLED STEEL-TOED TINKER BOOTS
  // ---------------------------------------------------------------------------
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const leg = legChains[side];
    const ankle = leg.tip!;
    const toe = toeJoints[side];

    // Baggy gnome trousers
    b.sweep(leg, [0.088, 0.078, 0.064], {
      sides: 8,
      smooth: false,
      color: pantsPaint,
      group: `leg${side}`,
      name: `trouser${side}`,
    });

    // Rolled leather boot cuff below the knee
    b.lathe(
      [
        [0.056, 0],
        [0.084, 0.008],
        [0.088, 0.055],
        [0.068, 0.068],
      ],
      {
        at: [s * 0.122, 0.125, 0.012],
        segments: 8,
        color: LEATHER_MID,
        bone: leg.joints[1],
        group: `leg${side}`,
        name: `bootCuff${side}`,
      },
    );

    // Boot shaft
    b.rod([s * 0.125, 0.14, 0.01], [s * 0.125, 0.04, 0.015], [0.072, 0.068], BOOT_BROWN, {
      bone: ankle,
      sides: 8,
      smooth: false,
      group: `leg${side}`,
      name: `bootShaft${side}`,
    });

    // Chunky upturned storybook gnome boot vamp & toe
    const bootPath = catmull([
      [s * 0.125, 0.048, -0.045],
      [s * 0.125, 0.045, 0.035],
      [s * 0.128, 0.046, 0.115],
      [s * 0.132, 0.072, 0.165],
    ]);
    b.sweep(
      bootPath,
      (t) => [
        0.068 * (1 - 0.42 * t * t),
        0.046 * (1 - 0.35 * t),
      ],
      {
        bone: [ankle, toe],
        sides: 8,
        smooth: false,
        color: BOOT_BROWN,
        group: `leg${side}`,
        name: `bootFoot${side}`,
      },
    );

    // Thick lugged sole resting flat at y = 0
    b.frustumBox(
      [s * 0.125, 0.026, -0.052],
      [s * 0.125, 0.0, -0.052],
      [0.132, 0.11],
      [0.138, 0.115],
      {
        bone: ankle,
        color: IRON_DARK,
        group: `leg${side}`,
        name: `bootHeelSole${side}`,
      },
    );
    b.frustumBox(
      [s * 0.127, 0.024, 0.055],
      [s * 0.127, 0.0, 0.055],
      [0.136, 0.125],
      [0.142, 0.13],
      {
        bone: toe,
        color: IRON_DARK,
        group: `leg${side}`,
        name: `bootForeSole${side}`,
      },
    );

    // Riveted brass toe-cap protector & boot buckle
    b.part(new THREE.SphereGeometry(0.052, 7, 5), BRASS, {
      at: [s * 0.13, 0.055, 0.138],
      scale: [1.15, 0.78, 1.15],
      flat: true,
      bone: toe,
      group: `leg${side}`,
      name: `bootToeCap${side}`,
    });
    b.part(new THREE.BoxGeometry(0.036, 0.032, 0.018), BRASS_BRIGHT, {
      at: [s * 0.192, 0.095, 0.025],
      rotation: [0, s * 15, 0],
      flat: true,
      bone: ankle,
      group: `leg${side}`,
      name: `bootBuckle${side}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 4. ARMS, GAUNTLETS & WRIST GADGETS
  // ---------------------------------------------------------------------------
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const arm = armChains[side];
    const elbow = arm.joints[1];
    const wrist = arm.tip!;
    const [thumb, index, mitten] = fingerJoints[side];

    // Puffy tunic upper sleeve
    b.sweep(arm, [0.068, 0.058], {
      from: 0,
      to: 0.56,
      sides: 7,
      smooth: false,
      color: sleevePaint,
      group: `arm${side}`,
      name: `upperSleeve${side}`,
    });

    // Flared leather gauntlet cuff at forearm
    b.rod(
      [s * 0.265, 0.48, -0.005],
      [s * 0.385, 0.4, 0.038],
      [0.064, 0.052],
      LEATHER_MID,
      {
        bone: elbow,
        sides: 7,
        smooth: false,
        group: `arm${side}`,
        name: `gauntletCuff${side}`,
      },
    );
    b.rod(
      [s * 0.265, 0.48, -0.005],
      [s * 0.285, 0.465, 0.0],
      [0.07, 0.067],
      BRASS,
      {
        bone: elbow,
        sides: 7,
        smooth: false,
        group: `arm${side}`,
        name: `gauntletRim${side}`,
      },
    );

    // Chunky leather tinker glove palm
    b.part(new THREE.BoxGeometry(0.075, 0.052, 0.088), LEATHER_DARK, {
      at: [s * 0.415, 0.382, 0.048],
      dir: [s * 0.85, -0.45, 0.2],
      flat: true,
      bone: wrist,
      group: `arm${side}`,
      name: `glovePalm${side}`,
    });

    // Brass knuckle guard plate
    b.part(new THREE.BoxGeometry(0.065, 0.022, 0.082), BRASS, {
      at: [s * 0.422, 0.402, 0.048],
      dir: [s * 0.85, -0.45, 0.2],
      flat: true,
      bone: wrist,
      group: `arm${side}`,
      name: `knucklePlate${side}`,
    });

    // Thumb, index finger & mitten digits
    b.capsule(
      thumb.at,
      offset(thumb.at, [s * 0.55, -0.2, 0.85], 0.048),
      [0.019, 0.015],
      LEATHER_MID,
      {
        bone: thumb,
        sides: 6,
        smooth: false,
        group: `arm${side}`,
        name: `thumbMesh${side}`,
      },
    );
    b.capsule(
      index.at,
      offset(index.at, [s * 0.85, -0.48, 0.35], 0.055),
      [0.018, 0.014],
      LEATHER_MID,
      {
        bone: index,
        sides: 6,
        smooth: false,
        group: `arm${side}`,
        name: `indexMesh${side}`,
      },
    );
    b.capsule(
      mitten.at,
      offset(mitten.at, [s * 0.85, -0.5, 0.02], 0.056),
      [0.028, 0.022],
      LEATHER_DARK,
      {
        bone: mitten,
        sides: 6,
        smooth: false,
        group: `arm${side}`,
        name: `mittenMesh${side}`,
      },
    );
  }

  // Left forearm wrist-mounted clockwork pressure gauge & mini brass gear
  b.part(new THREE.CylinderGeometry(0.034, 0.036, 0.022, 8), BRASS_BRIGHT, {
    at: [0.34, 0.455, 0.035],
    dir: [0.45, 0.82, 0.35],
    flat: true,
    bone: armChains.L.joints[1],
    group: "armL",
    name: "wristCompassCasing",
  });
  b.part(new THREE.CircleGeometry(0.029, 8), "#ffffff", {
    at: [0.346, 0.466, 0.04],
    dir: [0.45, 0.82, 0.35],
    axis: "z",
    texture: gaugeTex,
    bone: armChains.L.joints[1],
    group: "armL",
    name: "wristCompassDial",
  });

  // Right forearm leather pincushion bracer with brass pins & mini tuning fork
  b.part(new THREE.SphereGeometry(0.03, 7, 5), HAT_RED, {
    at: [-0.34, 0.455, 0.032],
    scale: [1.1, 0.65, 1.1],
    flat: true,
    bone: armChains.R.joints[1],
    group: "armR",
    name: "wristPincushion",
  });
  for (const [dx, dz] of [
    [-0.01, 0.01],
    [0.01, 0.008],
    [0, -0.01],
  ] as const) {
    const base: [number, number, number] = [-0.34 + dx, 0.468, 0.032 + dz];
    const tip: [number, number, number] = [-0.355 + dx * 2, 0.505, 0.045 + dz * 2];
    b.rod(base, tip, 0.003, STEEL, {
      bone: armChains.R.joints[1],
      sides: 4,
      smooth: false,
      group: "armR",
    });
    b.part(new THREE.SphereGeometry(0.007, 5, 4), GLOW_CYAN, {
      at: tip,
      flat: true,
      bone: armChains.R.joints[1],
      group: "armR",
    });
  }

  // ---------------------------------------------------------------------------
  // 5. EXPRESSIVE GNOME HEAD, EARS, BEARD, MUSTACHE & GOGGLED POINTED HAT
  // ---------------------------------------------------------------------------
  // Rounded apple-cheeked gnome cranium & face
  const cranium = b.loft(
    [
      { at: [0, 0.59, 0.015], w: 0.21, h: 0.19 },
      { at: [0, 0.65, 0.025], w: 0.265, h: 0.245 },
      { at: [0, 0.72, 0.015], w: 0.24, h: 0.22 },
      { at: [0, 0.78, 0.0], w: 0.15, h: 0.15 },
    ],
    {
      bone: head,
      sides: 10,
      smooth: false,
      color: skinPaint,
      group: "head",
      name: "gnomeCranium",
    },
  );

  // Plump rosy cheeks &bulbous storybook gnome nose
  for (const s of [1, -1] as const) {
    b.part(new THREE.SphereGeometry(0.056, 7, 6), skinPaint, {
      at: [s * 0.092, 0.648, 0.092],
      scale: [1.15, 0.92, 1.05],
      flat: true,
      bone: head,
      group: "head",
      name: `cheek${s > 0 ? "L" : "R"}`,
    });
  }

  b.capsule([0, 0.672, 0.115], [0, 0.666, 0.178], [0.038, 0.048], skinPaint, {
    bone: head,
    sides: 8,
    smooth: false,
    group: "head",
    name: "bulbousNose",
  });

  // Lower jaw & cheerful open smile under mustache
  b.part(new THREE.SphereGeometry(0.068, 7, 5), SKIN_SHADE, {
    at: [0, 0.598, 0.075],
    scale: [1.25, 0.75, 1.1],
    flat: true,
    bone: jaw,
    group: "head",
    name: "lowerJaw",
  });
  b.part(new THREE.BoxGeometry(0.056, 0.018, 0.025), "#4a1b18", {
    at: [0, 0.612, 0.125],
    flat: true,
    bone: jaw,
    group: "head",
    name: "mouthCavity",
  });
  b.part(new THREE.BoxGeometry(0.044, 0.01, 0.022), "#fff9f0", {
    at: [0, 0.618, 0.13],
    flat: true,
    bone: head,
    group: "head",
    name: "upperTeeth",
  });

  // Expressive anime/storybook eyes on the cranium + thick bushy eyebrows
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.decal(cranium, eyeTex, {
      at: [s * 0.058, 0.692, 0.132],
      dir: [s * 0.18, 0.05, 1],
      size: [0.058, 0.058],
      mirror: s < 0,
      bone: head,
      group: "head",
      name: `eyeDecal${side}`,
    });

    // Bushy arched eyebrows jutting out with character
    const browPath = bezier(
      [s * 0.022, 0.722, 0.138],
      [s * 0.062, 0.742, 0.145],
      [s * 0.105, 0.728, 0.115],
    );
    b.sweep(browPath, [0.018, 0.024, 0.012], {
      bone: head,
      sides: 6,
      smooth: false,
      caps: { start: "round", end: "point" },
      color: BEARD_CREAM,
      group: "head",
      name: `eyebrow${side}`,
    });
  }

  // Long pointed whimsical gnome ears with earrings/notches
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const earJoint = s > 0 ? earL : earR;
    const earCurve = bezier(
      [s * 0.13, 0.67, 0.015],
      [s * 0.21, 0.695, -0.005],
      [s * 0.275, 0.725, -0.035],
    );
    b.sweep(
      earCurve,
      (t) => [0.036 * (1 - 0.82 * t), 0.024 * (1 - 0.75 * t)],
      {
        bone: earJoint,
        sides: 6,
        smooth: false,
        caps: { start: "round", end: "point" },
        color: skinPaint,
        group: "head",
        name: `ear${side}`,
      },
    );
    // Inner ear crease
    b.rod(
      [s * 0.145, 0.675, 0.022],
      [s * 0.225, 0.702, 0.0],
      [0.016, 0.006],
      SKIN_FLUSH,
      {
        bone: earJoint,
        sides: 5,
        smooth: false,
        group: "head",
        name: `earInner${side}`,
      },
    );
  }
  // Tiny brass gear-stud earring on left ear & pencil tucked behind right ear
  b.part(new THREE.TorusGeometry(0.016, 0.005, 5, 8), BRASS_BRIGHT, {
    at: [0.195, 0.662, 0.01],
    rotation: [20, 15, 0],
    flat: true,
    bone: earL,
    group: "head",
    name: "earringRingL",
  });
  // Carpenter's pencil tucked over right ear
  b.rod([-0.142, 0.695, -0.055], [-0.148, 0.72, 0.085], 0.007, "#f0b429", {
    bone: earR,
    sides: 6,
    smooth: false,
    group: "head",
    name: "earPencilShaft",
  });
  b.spike([-0.148, 0.72, 0.085], [-0.15, 0.725, 0.11], null, 0.007, WOOD_PALE, {
    bone: earR,
    sides: 6,
    smooth: false,
    group: "head",
    name: "earPencilTip",
  });

  // Magnificent sweeping handlebar mustache
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const stachePath = catmull([
      [s * 0.008, 0.638, 0.145],
      [s * 0.068, 0.632, 0.152],
      [s * 0.135, 0.62, 0.125],
      [s * 0.185, 0.642, 0.095],
      [s * 0.195, 0.668, 0.085],
    ]);
    b.sweep(stachePath, [0.032, 0.036, 0.026, 0.015, 0.005], {
      bone: head,
      sides: 7,
      smooth: false,
      caps: { start: "round", end: "point" },
      color: beardPaint,
      group: "beard",
      name: `mustache${side}`,
    });
  }

  // Full sculpted bushy beard volume + side braids + brass beard rings + beard tuft cards
  const mainBeard = b.loft(
    [
      { at: [0, 0.61, 0.095], w: 0.23, h: 0.13 },
      { at: [0, 0.52, 0.145], w: 0.27, h: 0.17 },
      { at: [0, 0.41, 0.165], w: 0.22, h: 0.14 },
      { at: [0, 0.32, 0.16], w: 0.12, h: 0.09 },
      { at: [0, 0.265, 0.15], w: 0.035, h: 0.035 },
    ],
    {
      bone: [jaw, beardChain],
      sides: 8,
      smooth: false,
      color: beardPaint,
      group: "beard",
      name: "beardMainVolume",
    },
  );

  // Brass beard ring clasping the lower main beard tip
  b.lathe(
    [
      [0.034, 0],
      [0.052, 0.005],
      [0.052, 0.026],
      [0.034, 0.03],
    ],
    {
      at: [0, 0.305, 0.155],
      axis: [0, 1, 0.15],
      segments: 8,
      color: BRASS_BRIGHT,
      bone: beardChain.joints[1],
      group: "beard",
      name: "centerBeardRing",
    },
  );

  // Twin side beard braids with brass cuffs
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const braidPath = catmull([
      [s * 0.095, 0.585, 0.105],
      [s * 0.125, 0.485, 0.148],
      [s * 0.11, 0.38, 0.158],
      [s * 0.095, 0.315, 0.15],
    ]);
    b.sweep(braidPath, [0.038, 0.042, 0.032, 0.012], {
      bone: [jaw, beardChain],
      sides: 6,
      smooth: false,
      twist: s * 180,
      caps: { start: "round", end: "point" },
      color: beardPaint,
      group: "beard",
      name: `beardBraid${side}`,
    });

    // Brass braid cuff
    b.rod(
      [s * 0.104, 0.365, 0.155],
      [s * 0.099, 0.34, 0.152],
      [0.03, 0.028],
      BRASS,
      {
        bone: beardChain.joints[1],
        sides: 6,
        smooth: false,
        group: "beard",
        name: `braidCuff${side}`,
      },
    );
  }

  // Layered beard tuft cards over the main beard for rich storybook silhouette
  const beardHits = b.surface(mainBeard).scatter(28, {
    rng: rng(108),
    minDist: 0.038,
    filter: (h) => h.n.z > 0.15 && h.at.y < 0.58,
  });
  b.cards(beardHits, beardTuftTex, {
    size: [0.048, 0.085],
    lean: 72,
    bend: 18,
    flow: [0, -1, 0.15],
    vary: 0.22,
    spin: 12,
    rng: rng(109),
    group: "beard",
    name: "beardTuftCards",
  });

  // Back hair curls peeking under hat brim
  for (let i = -2; i <= 2; i++) {
    const angle = i * 0.36;
    const x = Math.sin(angle) * 0.115;
    const z = -Math.cos(angle) * 0.105;
    b.capsule(
      [x, 0.69, z],
      [x * 1.15, 0.59, z * 1.15 - 0.015],
      [0.032, 0.022],
      BEARD_CREAM,
      {
        bone: head,
        sides: 6,
        smooth: false,
        group: "head",
        name: `napeHairCurl${i + 3}`,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // 6. POINTED GNOME CAP, PATCHES, MAGNIFYING LOUPE & BRASS GOGGLES
  // ---------------------------------------------------------------------------
  // Rolled felt hat brim
  const hatBrim = b.lathe(
    [
      [0.105, 0],
      [0.168, -0.008],
      [0.176, 0.024],
      [0.152, 0.055],
      [0.115, 0.048],
    ],
    {
      at: [0, 0.725, 0.005],
      axis: [0, 0.98, -0.18],
      segments: 10,
      color: HAT_DARK,
      bone: head,
      group: "hat",
      name: "hatBrim",
    },
  );

  // Tall curving conical gnome cap swept over hatChain
  const hatCone = b.sweep(
    hatChain,
    [0.148, 0.112, 0.068, 0.016],
    {
      sides: 9,
      smooth: false,
      caps: { start: "none", end: "round" },
      color: hatPaint,
      group: "hat",
      name: "hatCone",
    },
  );

  // Brass clockwork bell dangling from the curled hat tip
  const hatTipPt = hatChain.at(1).at;
  b.part(new THREE.TorusGeometry(0.016, 0.005, 5, 7), BRASS_BRIGHT, {
    at: [hatTipPt.x + 0.005, hatTipPt.y - 0.012, hatTipPt.z - 0.012],
    flat: true,
    bone: hatChain.tip!,
    group: "hat",
    name: "hatTipBellRing",
  });
  b.part(new THREE.SphereGeometry(0.024, 7, 6), BRASS_BRIGHT, {
    at: [hatTipPt.x + 0.008, hatTipPt.y - 0.032, hatTipPt.z - 0.018],
    flat: true,
    bone: hatChain.tip!,
    group: "hat",
    name: "hatTipBell",
  });

  // Stitched cloth patch decal on the side of the hat + tucked leaf feather card
  b.decal(hatCone, patchStitchTex, {
    at: [-0.095, 0.89, 0.02],
    dir: [-0.88, 0.2, 0.42],
    size: [0.075, 0.075],
    bone: hatChain.joints[0],
    group: "hat",
    name: "hatPatchDecal",
  });

  // Leather hatband above the brim
  const hatSurf = b.surface([hatCone, hatBrim]);
  const hatBandLoop = hatSurf.loop(frame([0, 0.775, 0.0], [0, 0.98, -0.18]), { lift: 0.008 });
  b.sweep(hatBandLoop, () => [0.014, 0.024], {
    section: "box",
    color: LEATHER_DARK,
    bone: head,
    group: "hat",
    name: "goggleStrapBand",
  });

  // Whimsical woodland leaf-feather tucked into the hatband on the left side
  b.cards([frame([0.152, 0.785, 0.01], [0.28, 0.92, -0.25])], featherLeafTex, {
    size: [0.065, 0.145],
    lean: 18,
    bend: 24,
    flow: [0.4, 0.2, -0.9],
    bone: head,
    group: "hat",
    name: "hatFeatherCard",
  });

  // Oversized asymmetric brass tinkerer goggles perched on the front of the hat
  // Left lens has an articulated flip-out jeweler's magnifying loupe!
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const rLens = s > 0 ? 0.056 : 0.048;
    const lensCenter: [number, number, number] = [s * 0.066, 0.795, 0.132];
    const lensDir: [number, number, number] = [s * 0.24, 0.18, 0.95];

    // Outer brass barrel
    b.lathe(
      [
        [rLens * 0.76, 0],
        [rLens, 0],
        [rLens * 1.04, 0.038],
        [rLens * 0.82, 0.046],
        [rLens * 0.74, 0.036],
      ],
      {
        at: lensCenter,
        axis: lensDir,
        segments: 9,
        color: brassPaint,
        bone: head,
        group: "goggles",
        name: `goggleBarrel${side}`,
      },
    );

    // Glowing cyan/blue convex glass lens
    glow(
      b.part(new THREE.SphereGeometry(rLens * 0.76, 8, 6), GLOW_CYAN, {
        at: offset(lensCenter, lensDir, 0.028),
        dir: lensDir,
        scale: [1, 0.42, 1],
        flat: true,
        bone: head,
        group: "goggles",
        name: `goggleGlass${side}`,
      }),
      0.85,
    );

    // Rivets around goggle bezel
    b.ring(
      { at: offset(lensCenter, lensDir, 0.036), axis: lensDir },
      { count: 6, radius: rLens * 0.91 },
      (stud) => {
        b.part(new THREE.SphereGeometry(0.006, 5, 4), STEEL, {
          at: stud.at,
          flat: true,
          bone: head,
          group: "goggles",
        });
      },
    );
  }

  // Nose bridge linking the two goggle barrels
  b.rod([-0.025, 0.798, 0.145], [0.025, 0.798, 0.145], 0.012, BRASS_BRIGHT, {
    bone: head,
    sides: 6,
    smooth: false,
    group: "goggles",
    name: "goggleNoseBridge",
  });

  // Swing-out secondary jeweler's loupe on the left goggle
  b.rod([0.118, 0.805, 0.135], [0.155, 0.828, 0.165], 0.008, BRASS_BRIGHT, {
    bone: head,
    sides: 5,
    smooth: false,
    group: "goggles",
    name: "loupeSwingArm",
  });
  b.lathe(
    [
      [0.022, 0],
      [0.034, 0],
      [0.034, 0.024],
      [0.022, 0.024],
    ],
    {
      at: [0.155, 0.828, 0.165],
      axis: [0.32, 0.2, 0.92],
      segments: 8,
      color: COPPER,
      bone: head,
      group: "goggles",
      name: "loupeBezel",
    },
  );
  glow(
    b.part(new THREE.SphereGeometry(0.023, 7, 5), GLOW_AMBER, {
      at: [0.159, 0.831, 0.176],
      scale: [1, 0.45, 1],
      dir: [0.32, 0.2, 0.92],
      flat: true,
      bone: head,
      group: "goggles",
      name: "loupeLens",
    }),
    1.1,
  );

  // ---------------------------------------------------------------------------
  // 7. OVERFLOWING GADGET BACKPACK (Timber Frame, Steam Boiler, Gears, Tools)
  // ---------------------------------------------------------------------------
  // Main timber & leather chest body on the gnome's back
  const packBody = b.frustumBox(
    [0, 0.34, -0.235],
    [0, 0.71, -0.225],
    [0.34, 0.21],
    [0.38, 0.23],
    {
      bone: packRoot,
      color: woodPaint,
      group: "backpack",
      name: "packMainChest",
    },
  );

  // Twin vertical wooden side posts & horizontal crossbeams
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.frustumBox(
      [s * 0.185, 0.31, -0.225],
      [s * 0.198, 0.76, -0.215],
      [0.044, 0.23],
      [0.048, 0.25],
      {
        bone: packRoot,
        color: WOOD_DARK,
        group: "backpack",
        name: `packSideTimber${side}`,
      },
    );

    // Brass corner reinforcement brackets
    for (const [yPos, zPos] of [
      [0.35, -0.335],
      [0.69, -0.33],
      [0.35, -0.125],
      [0.69, -0.115],
    ] as const) {
      b.part(new THREE.BoxGeometry(0.056, 0.048, 0.048), BRASS, {
        at: [s * 0.19, yPos, zPos],
        flat: true,
        bone: packRoot,
        group: "backpack",
      });
    }
  }

  // Horizontal iron reinforcement bands across the back of the pack
  for (const yBand of [0.39, 0.53, 0.67] as const) {
    b.part(new THREE.BoxGeometry(0.395, 0.028, 0.238), IRON, {
      at: [0, yBand, -0.23],
      flat: true,
      bone: packRoot,
      group: "backpack",
    });
  }

  // Domed leather top lid with stitched straps and brass clasps
  b.capsule([-0.185, 0.735, -0.22], [0.185, 0.735, -0.22], 0.115, LEATHER_MID, {
    bone: packTopLid,
    sides: 8,
    smooth: false,
    caps: "flat",
    group: "backpack",
    name: "packDomedLid",
  });
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const lidStrap = bezier(
      [s * 0.11, 0.72, -0.11],
      [s * 0.11, 0.865, -0.22],
      [s * 0.11, 0.65, -0.348],
    );
    b.sweep(lidStrap, () => [0.026, 0.012], {
      section: "box",
      color: LEATHER_DARK,
      bone: packTopLid,
      group: "backpack",
      name: `packLidStrap${side}`,
    });
    b.part(new THREE.BoxGeometry(0.038, 0.046, 0.02), BRASS_BRIGHT, {
      at: [s * 0.11, 0.65, -0.348],
      flat: true,
      bone: packRoot,
      group: "backpack",
      name: `packLidClasp${side}`,
    });
  }

  // Rolled teal/cream sleeping bedroll strapped underneath the backpack
  b.rod([-0.195, 0.285, -0.235], [0.195, 0.285, -0.235], 0.062, TUNIC_DARK, {
    bone: packRoot,
    sides: 8,
    smooth: false,
    group: "backpack",
    name: "bottomBedroll",
  });
  b.rod([-0.205, 0.285, -0.235], [0.205, 0.285, -0.235], 0.038, BEARD_CREAM, {
    bone: packRoot,
    sides: 7,
    smooth: false,
    group: "backpack",
    name: "bottomBedrollCore",
  });
  for (const s of [1, -1] as const) {
    b.part(new THREE.TorusGeometry(0.065, 0.012, 6, 8), LEATHER_DARK, {
      at: [s * 0.12, 0.285, -0.235],
      rotation: [0, 90, 0],
      flat: true,
      bone: packRoot,
      group: "backpack",
      name: `bedrollStrap${s > 0 ? "L" : "R"}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 8. BACKPACK GADGETS: CLOCKWORK GEARS, WINDER KEY, STEAM BOILER & PIPES
  // ---------------------------------------------------------------------------
  // Interlocking exposed clockwork gear train on the back face of the pack
  buildGear(
    [-0.11, 0.57, -0.352],
    [1, 0, 0],
    [0, 1, 0],
    0.068,
    0.092,
    10,
    0.022,
    BRASS_BRIGHT,
    COPPER,
    mainGearJoint,
    "clockwork",
    "packMainCog",
  );
  buildGear(
    [-0.01, 0.645, -0.358],
    [1, 0, 0],
    [0, 1, 0],
    0.042,
    0.058,
    8,
    0.02,
    COPPER,
    BRASS_BRIGHT,
    packRoot,
    "clockwork",
    "packUpperCog",
  );
  buildGear(
    [-0.155, 0.455, -0.356],
    [1, 0, 0],
    [0, 1, 0],
    0.038,
    0.052,
    7,
    0.02,
    STEEL,
    BRASS,
    packRoot,
    "clockwork",
    "packLowerCog",
  );

  // Giant ornate clockwork wind-up key jutting out the back center-right
  b.rod([0.035, 0.48, -0.34], [0.035, 0.48, -0.455], [0.024, 0.018], BRASS_BRIGHT, {
    bone: winderKey,
    sides: 6,
    smooth: false,
    group: "clockwork",
    name: "winderShaft",
  });
  b.extrude(
    [
      [-0.085, 0, "sharp"],
      [-0.092, 0.055],
      [-0.042, 0.088],
      [0, 0.045, "sharp"],
      [0.042, 0.088],
      [0.092, 0.055],
      [0.085, 0, "sharp"],
      [0.028, -0.045, "sharp"],
      [-0.028, -0.045, "sharp"],
    ],
    {
      at: [0.035, 0.48, -0.455],
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: 0.022,
      bevel: 0.004,
      color: BRASS_BRIGHT,
      bone: winderKey,
      group: "clockwork",
      name: "winderKeyBow",
    },
  );

  // Copper steam boiler tank mounted on the back-right of the backpack
  const boilerBase: [number, number, number] = [0.135, 0.41, -0.365];
  const boilerTop: [number, number, number] = [0.135, 0.68, -0.355];
  b.capsule(boilerBase, boilerTop, 0.072, copperPaint, {
    bone: packRoot,
    sides: 8,
    smooth: false,
    group: "boiler",
    name: "copperBoilerTank",
  });
  // Boiler brass bands
  for (const yRing of [0.46, 0.55, 0.63] as const) {
    b.part(new THREE.CylinderGeometry(0.077, 0.077, 0.02, 8), BRASS_BRIGHT, {
      at: [0.135, yRing, -0.36],
      flat: true,
      bone: packRoot,
      group: "boiler",
    });
  }
  // Glowing orange furnace firebox grate at bottom of boiler
  b.part(new THREE.BoxGeometry(0.068, 0.055, 0.032), IRON_DARK, {
    at: [0.135, 0.435, -0.43],
    flat: true,
    bone: packRoot,
    group: "boiler",
    name: "boilerGrateFrame",
  });
  glow(
    b.part(new THREE.BoxGeometry(0.048, 0.036, 0.028), GLOW_AMBER, {
      at: [0.135, 0.435, -0.436],
      flat: true,
      bone: packRoot,
      group: "boiler",
      name: "boilerFireCore",
    }),
    1.5,
  );

  // Oversized pressure gauge mounted on the boiler with dial texture
  b.part(new THREE.CylinderGeometry(0.054, 0.056, 0.028, 9), BRASS_BRIGHT, {
    at: [0.135, 0.59, -0.435],
    dir: [0, 0, -1],
    flat: true,
    bone: packRoot,
    group: "boiler",
    name: "boilerGaugeCase",
  });
  b.part(new THREE.CircleGeometry(0.046, 9), "#ffffff", {
    at: [0.135, 0.59, -0.451],
    dir: [0, 0, -1],
    axis: "z",
    texture: gaugeTex,
    bone: packRoot,
    group: "boiler",
    name: "boilerGaugeFace",
  });

  // Tall curved copper smokestack chimney with puff of low-poly steam clouds!
  const chimneyPath = catmull([
    [0.135, 0.72, -0.355],
    [0.165, 0.85, -0.365],
    [0.215, 0.96, -0.38],
    [0.245, 1.03, -0.405],
  ]);
  b.sweep(chimneyPath, [0.034, 0.028, 0.032, 0.048], {
    bone: packRoot,
    sides: 7,
    smooth: false,
    caps: "flat",
    color: COPPER,
    group: "boiler",
    name: "boilerChimney",
  });
  // Conical rain cap over the smokestack
  b.spike([0.255, 1.065, -0.415], [0.265, 1.105, -0.425], null, 0.062, BRASS, {
    bone: packRoot,
    sides: 7,
    smooth: false,
    group: "boiler",
    name: "chimneyRainCap",
  });
  // Whimsical low-poly steam puffs rising from chimney
  for (const [px, py, pz, rSteam] of [
    [0.275, 1.09, -0.45, 0.032],
    [0.31, 1.135, -0.48, 0.042],
    [0.34, 1.18, -0.51, 0.028],
  ] as const) {
    b.part(new THREE.IcosahedronGeometry(rSteam, 0), BEARD_CREAM, {
      at: [px, py, pz],
      flat: true,
      bone: packRoot,
      group: "boiler",
    });
  }

  // Red cast-iron valve wheel on the right side of the boiler
  b.part(new THREE.TorusGeometry(0.042, 0.009, 5, 8), HAT_RED, {
    at: [0.225, 0.54, -0.36],
    rotation: [0, 90, 0],
    flat: true,
    bone: packRoot,
    group: "boiler",
    name: "boilerValveWheel",
  });
  b.rod([0.195, 0.54, -0.36], [0.23, 0.54, -0.36], 0.01, BRASS, {
    bone: packRoot,
    sides: 5,
    smooth: false,
    group: "boiler",
    name: "boilerValveStem",
  });

  // ---------------------------------------------------------------------------
  // 9. TOP & SIDE GADGETS: CRANE BOOM, ARCANE LANTERN, PERISCOPE, CLAW, COIL
  // ---------------------------------------------------------------------------
  // Articulated wooden & brass crane arm rising over the left shoulder (`craneBoom`)
  b.sweep(craneBoom, [0.028, 0.024, 0.018], {
    section: "box",
    color: woodCrossPaint,
    group: "gadgets",
    name: "craneTimberArm",
  });
  // Brass pulley wheel at crane tip
  b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.018, 8), BRASS_BRIGHT, {
    at: [0.27, 1.03, -0.01],
    dir: [1, 0, 0],
    flat: true,
    bone: craneBoom.tip!,
    group: "gadgets",
    name: "cranePulleyWheel",
  });
  // Diagonal iron brace strut on crane
  b.rod([0.145, 0.84, -0.205], [0.22, 0.95, -0.14], 0.011, IRON, {
    bone: craneBoom.joints[0],
    sides: 5,
    smooth: false,
    group: "gadgets",
    name: "craneStrut",
  });

  // Glowing Arcane Aether Lantern dangling from crane tip (`lanternSwing`)
  const lantPos: [number, number, number] = [0.27, 0.91, 0.01];
  b.rod([0.27, 1.01, 0.01], [0.27, 0.965, 0.01], 0.006, IRON_DARK, {
    bone: lanternSwing,
    sides: 5,
    smooth: false,
    group: "lantern",
    name: "lanternChain",
  });
  // Top & bottom brass lantern caps
  b.spike([0.27, 0.945, 0.01], [0.27, 0.98, 0.01], null, 0.052, BRASS_BRIGHT, {
    bone: lanternSwing,
    sides: 6,
    smooth: false,
    group: "lantern",
    name: "lanternRoof",
  });
  b.rod([0.27, 0.875, 0.01], [0.27, 0.855, 0.01], [0.044, 0.032], BRASS_BRIGHT, {
    bone: lanternSwing,
    sides: 6,
    smooth: false,
    group: "lantern",
    name: "lanternBase",
  });
  // Glowing cyan crystal core inside the lantern
  glow(
    b.part(new THREE.OctahedronGeometry(0.036, 0), GLOW_CYAN, {
      at: lantPos,
      scale: [0.9, 1.25, 0.9],
      flat: true,
      bone: lanternSwing,
      group: "lantern",
      name: "lanternGlowingCore",
    }),
    1.6,
  );
  // 4 cage bars around the lantern crystal
  b.ring({ at: lantPos, axis: [0, 1, 0] }, { count: 4, radius: 0.04 }, (bar) => {
    b.rod(
      offset(bar.at, [0, -1, 0], 0.035),
      offset(bar.at, [0, 1, 0], 0.035),
      0.005,
      IRON_DARK,
      {
        bone: lanternSwing,
        sides: 4,
        smooth: false,
        group: "lantern",
      },
    );
  });

  // Brass Periscope & Whimsical Weathervane Whirligig rising from top-right of pack (`periscopeJoint`)
  const periPath = polyline([
    [-0.14, 0.78, -0.22],
    [-0.14, 0.99, -0.22],
    [-0.14, 1.03, -0.14],
  ]);
  b.sweep(periPath, [0.028, 0.024, 0.032], {
    bone: periscopeJoint,
    sides: 8,
    smooth: false,
    caps: "flat",
    color: brassPaint,
    group: "gadgets",
    name: "periscopeTube",
  });
  glow(
    b.part(new THREE.CircleGeometry(0.026, 8), GLOW_CYAN, {
      at: [-0.14, 1.03, -0.138],
      dir: [0, 0, 1],
      axis: "z",
      bone: periscopeJoint,
      group: "gadgets",
      name: "periscopeLens",
    }),
    1.1,
  );

  // Spiraling copper Tesla antenna + glowing magenta aether orb atop the pack center
  const coilSpiral = spiral([0, 0.78, -0.24], [0.032, 0.78, -0.24], [0, 1, 0], {
    turns: 3.5,
    r1: 0.012,
    pitch: 0.055,
  });
  b.sweep(coilSpiral, 0.007, {
    bone: packTopLid,
    sides: 5,
    smooth: false,
    color: COPPER,
    group: "gadgets",
    name: "teslaCopperCoil",
  });
  b.rod([0, 0.76, -0.24], [0, 0.99, -0.24], [0.014, 0.008], IRON, {
    bone: packTopLid,
    sides: 6,
    smooth: false,
    group: "gadgets",
    name: "teslaCoreRod",
  });
  glow(
    b.part(new THREE.IcosahedronGeometry(0.028, 0), GLOW_MAGENTA, {
      at: [0, 1.01, -0.24],
      flat: true,
      bone: packTopLid,
      group: "gadgets",
      name: "teslaSparkOrb",
    }),
    1.45,
  );

  // Articulated Mechanical Claw Arm on the right side of the pack holding a Blueprint Scroll (`clawArm`)
  b.sweep(clawArm, [0.024, 0.02, 0.016], {
    sides: 6,
    smooth: false,
    color: IRON,
    group: "gadgets",
    name: "mechClawArm",
  });
  // Brass joints at claw elbow & wrist
  for (const j of clawArm.joints) {
    b.part(new THREE.SphereGeometry(0.026, 6, 5), BRASS_BRIGHT, {
      at: j.at,
      flat: true,
      bone: j,
      group: "gadgets",
    });
  }
  // Pincer jaws at `clawArm.tip` gripping a rolled cyan blueprint tube
  const clawTipPos = clawArm.tip!.at;
  for (const s of [1, -1] as const) {
    const jawArc = arc(
      offset(clawTipPos, [0, 0.02, 0.03], 1),
      clawTipPos,
      [1, 0, 0],
      s * 65,
    );
    b.sweep(
      bezier(
        clawTipPos,
        offset(clawTipPos, [0, s * 0.045, 0.025], 1),
        offset(clawTipPos, [0, s * 0.022, 0.065], 1),
      ),
      [0.014, 0.006],
      {
        bone: clawArm.tip!,
        sides: 5,
        smooth: false,
        color: BRASS_BRIGHT,
        group: "gadgets",
        name: `clawPincer${s > 0 ? "U" : "D"}`,
      },
    );
    void jawArc;
  }

  // Rolled Blueprint Scroll with schematic texture gripped in the mechanical claw
  b.rod(
    [-0.45, 0.825, 0.055],
    [-0.29, 0.825, 0.055],
    0.024,
    "#23699e",
    {
      bone: clawArm.tip!,
      sides: 8,
      smooth: false,
      group: "gadgets",
      name: "blueprintRollTube",
    },
  );
  b.rod(
    [-0.46, 0.825, 0.055],
    [-0.28, 0.825, 0.055],
    0.014,
    BEARD_CREAM,
    {
      bone: clawArm.tip!,
      sides: 6,
      smooth: false,
      group: "gadgets",
      name: "blueprintRollInner",
    },
  );
  // Partially unrolled blueprint flap showing schematic grid texture
  b.part(new THREE.PlaneGeometry(0.11, 0.095), "#ffffff", {
    at: [-0.37, 0.77, 0.072],
    dir: [0, 0.25, 1],
    axis: "z",
    texture: blueprintTex,
    bone: clawArm.tip!,
    group: "gadgets",
    name: "blueprintFlap",
  });
  b.part(new THREE.PlaneGeometry(0.11, 0.095), "#1e5785", {
    at: [-0.37, 0.77, 0.069],
    dir: [0, -0.25, -1],
    axis: "z",
    bone: clawArm.tip!,
    group: "gadgets",
    name: "blueprintFlapBack",
  });

  // Left-side Backpack Props: Strapped Brass Spyglass, Mallet, & Accordion Bellows
  // Brass spyglass strapped vertically to left timber post
  b.rod([0.23, 0.4, -0.22], [0.245, 0.66, -0.2], [0.024, 0.036], BRASS_BRIGHT, {
    bone: packRoot,
    sides: 8,
    smooth: false,
    group: "gadgets",
    name: "sideSpyglass",
  });
  b.rod([0.234, 0.46, -0.215], [0.24, 0.56, -0.208], 0.032, LEATHER_DARK, {
    bone: packRoot,
    sides: 8,
    smooth: false,
    group: "gadgets",
    name: "spyglassGrip",
  });
  glow(
    b.part(new THREE.CircleGeometry(0.03, 8), GLASS_BLUE, {
      at: [0.245, 0.662, -0.2],
      dir: [0.06, 0.99, 0.08],
      axis: "z",
      bone: packRoot,
      group: "gadgets",
      name: "spyglassTopLens",
    }),
    0.7,
  );

  // Wooden tinkerer's mallet & steel saw blade sticking out of the top-left tool slot
  b.rod([0.07, 0.68, -0.28], [0.11, 0.91, -0.31], 0.014, woodPaint, {
    bone: packRoot,
    sides: 6,
    smooth: false,
    group: "gadgets",
    name: "packMalletHandle",
  });
  b.capsule([0.065, 0.9, -0.31], [0.155, 0.92, -0.31], 0.034, WOOD_DARK, {
    bone: packRoot,
    sides: 7,
    smooth: false,
    caps: "flat",
    group: "gadgets",
    name: "packMalletHead",
  });
  for (const s of [1, -1] as const) {
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.012, 7), BRASS, {
      at: [0.11 + s * 0.038, 0.91 + s * 0.008, -0.31],
      dir: [1, 0.22, 0],
      flat: true,
      bone: packRoot,
      group: "gadgets",
    });
  }

  // Right-side Backpack Props: Hanging Copper Kettle & Leather Bellows
  b.lathe(
    [
      [0, 0],
      [0.042, 0],
      [0.056, 0.035],
      [0.045, 0.072],
      [0.025, 0.082],
      [0, 0.082],
    ],
    {
      at: [-0.245, 0.37, -0.23],
      segments: 8,
      color: COPPER,
      bone: packRoot,
      group: "gadgets",
      name: "hangingKettle",
    },
  );
  b.part(new THREE.TorusGeometry(0.042, 0.006, 5, 8, Math.PI), IRON_DARK, {
    at: [-0.245, 0.445, -0.23],
    flat: true,
    bone: packRoot,
    group: "gadgets",
    name: "kettleBailHandle",
  });

  // ---------------------------------------------------------------------------
  // 10. FINAL REST-POSE ADJUSTMENTS (Natural Rigging Pose + Ground Check)
  // ---------------------------------------------------------------------------
  b.pose(jaw, { axis: [1, 0, 0], deg: 5 });
  b.pose(head, { axis: [1, 0, 0], deg: -3 });

  // Ensure exact ground contact on y = 0
  const root = b.root;
  const bounds = new THREE.Box3().setFromObject(root, true);
  if (Math.abs(bounds.min.y) > 1e-4) {
    hips.position.y -= bounds.min.y;
  }

  return b.root;
}
