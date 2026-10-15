import * as THREE from "three";
import {
  aim,
  bezier,
  catmull,
  createBuilder,
  DEG,
  glow,
  grain,
  limb,
  mix,
  mottle,
  paint,
  rgb,
  rng,
  smoothstep,
  svg,
} from "../../../../src/index";
import type { Rgb } from "../../../../src/index";
import {
  coil,
  gaugeTexture,
  gearGeometry,
  gearTrain,
  metal,
  panelled,
} from "../../../../kits/clockwork";

export const meta = {
  name: "Gnome Tinkerer with Gadget Backpack",
  description:
    "A whimsical low-poly gnome inventor wearing a floppy felt cap, brass goggles, and a heavy leather apron, carrying an overflowing clockwork gadget backpack with a meshing gear train, pressure boiler, and arcane vacuum tube.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "gnome_tinkerer", detail: 1 });
  const rand = rng(42);

  // ---------------------------------------------------------------------------
  // Materials & Paints
  // ---------------------------------------------------------------------------
  const BRASS = metal("brass", { polish: 0.55, tarnish: 0.25, seed: 11 });
  const OLD_BRASS = metal("brass", { polish: 0.25, tarnish: 0.6, verdigris: 0.4, seed: 12 });
  const COPPER = metal("copper", { polish: 0.45, verdigris: 0.35, seed: 13 });
  const GILT = metal("gilt", { polish: 0.7, tarnish: 0.1, seed: 14 });
  const BLUED = metal("blued", { polish: 0.5, tarnish: 0.2, seed: 15 });
  const IRON = metal("iron", { polish: 0.25, tarnish: 0.45, seed: 16 });

  const LEATHER = mottle("#5a341a", "#784522", { size: 0.05, seed: 21 });
  const DARK_LEATHER = mottle("#341e10", "#482b17", { size: 0.04, seed: 22 });
  const TAN_LEATHER = mottle("#8e5d36", "#aa7446", { size: 0.05, seed: 23 });
  const TUNIC = grain("#1f4a56", "#296272", { size: 0.02, seed: 31 });
  const PANTS = grain("#483728", "#5a4533", { size: 0.025, seed: 32 });
  const HAT_FELT = mottle("#822234", "#5c1624", { size: 0.06, seed: 41 });
  const BEARD = grain("#e4e9ee", "#b8c3cc", { size: 0.015, seed: 51 });
  const WOOD = grain("#462612", "#5e3419", { size: 0.02, seed: 61 });

  const GNOME_SKIN = paint((p, n) => {
    const base: Rgb = [0.97, 0.79, 0.66];
    const blush: Rgb = [0.94, 0.56, 0.46];
    const ruddy: Rgb = [0.89, 0.38, 0.31];
    const dNose = Math.hypot(p.x, p.y - 0.75, p.z - 0.16);
    if (dNose < 0.055) return mix(base, ruddy, smoothstep(0.055, 0.015, dNose));
    const dCheek = Math.min(
      Math.hypot(p.x - 0.065, p.y - 0.73, p.z - 0.12),
      Math.hypot(p.x + 0.065, p.y - 0.73, p.z - 0.12),
    );
    if (dCheek < 0.05) return mix(base, blush, smoothstep(0.05, 0.01, dCheek) * 0.75);
    return mix(base, blush, 0.15 * smoothstep(-0.2, 0.8, n.y));
  });

  // ---------------------------------------------------------------------------
  // Textures (SVG)
  // ---------------------------------------------------------------------------
  const GNOME_EYE = svg(
    `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="iris" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#f0b642"/>
          <stop offset="60%" stop-color="#b86b16"/>
          <stop offset="100%" stop-color="#482404"/>
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="39" fill="#fcfbf7"/>
      <circle cx="40" cy="40" r="24" fill="url(#iris)"/>
      <circle cx="40" cy="40" r="24" fill="none" stroke="#361700" stroke-width="2"/>
      <circle cx="40" cy="40" r="13" fill="#120902"/>
      <circle cx="33" cy="33" r="6.5" fill="#ffffff"/>
      <circle cx="48" cy="46" r="3" fill="#ffffff" opacity="0.8"/>
      <ellipse cx="40" cy="18" rx="28" ry="12" fill="#2a1608" opacity="0.18"/>
    </svg>`,
    { size: 256 },
  );

  const BLUEPRINT = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" fill="#14345c"/>
      <path d="M0 16 H128 M0 32 H128 M0 48 H128 M0 64 H128 M0 80 H128 M0 96 H128 M0 112 H128" stroke="#1c487e" stroke-width="0.8"/>
      <path d="M16 0 V128 M32 0 V128 M48 0 V128 M64 0 V128 M80 0 V128 M96 0 V128 M112 0 V128" stroke="#1c487e" stroke-width="0.8"/>
      <circle cx="64" cy="64" r="32" fill="none" stroke="#7ecaff" stroke-width="1.8"/>
      <circle cx="64" cy="64" r="22" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-dasharray="3 3"/>
      <circle cx="64" cy="64" r="8" fill="#54b2f8" stroke="#ffffff" stroke-width="1.2"/>
      <path d="M64 24 L64 104 M24 64 L104 64" stroke="#ffffff" stroke-width="1" stroke-dasharray="2 4"/>
      <rect x="14" y="14" width="24" height="16" fill="none" stroke="#7ecaff" stroke-width="1.2"/>
      <path d="M18 20 H34 M18 24 H30" stroke="#ffffff" stroke-width="1"/>
      <path d="M96 96 L116 116 M100 116 L116 116 L116 100" fill="none" stroke="#7ecaff" stroke-width="1.4"/>
    </svg>`,
    { size: 256 },
  );

  const POCKET_STITCH = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="60" height="60" rx="6" fill="#693b1e" stroke="#3f1f0a" stroke-width="2"/>
      <rect x="6" y="6" width="52" height="52" rx="4" fill="none" stroke="#d5b583" stroke-width="1.8" stroke-dasharray="4 3"/>
      <circle cx="10" cy="10" r="2.2" fill="#e8c35a"/>
      <circle cx="54" cy="10" r="2.2" fill="#e8c35a"/>
    </svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------------------
  // Skeleton / Rigging
  // ---------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.4, -0.01], role: "spine" });
  const spine1 = b.joint("spine1", { parent: hips, at: [0, 0.49, -0.01], role: "spine" });
  const spine2 = b.joint("spine2", { parent: spine1, at: [0, 0.6, 0.01], role: "spine" });
  const neck = b.joint("neck", { parent: spine2, at: [0, 0.69, 0.02], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.75, 0.03], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.71, 0.07], dir: [0, -0.1, 1], role: "jaw" });

  // ---------------------------------------------------------------------------
  // Legs & Sturdy Gnome Boots
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipPos: [number, number, number] = [s * 0.11, 0.4, -0.01];
    const footTarget: [number, number, number] = [s * 0.13, 0.05, 0.02];
    const legPts = limb(hipPos, footTarget, [0.18, 0.18], [s * 0.02, 0.05, 0.8]);
    const legChain = b.chain(`leg${side}`, legPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.13, 0, 0.04],
    });

    // Puffy trousers
    b.sweep(legChain, (t) => 0.075 * (1 - 0.25 * t) + 0.01, {
      bone: legChain,
      color: PANTS,
      group: `leg${side}`,
    });

    // Knee patch
    const kneeBone = legChain.joints[1];
    b.part(new THREE.SphereGeometry(0.032, 8, 6), LEATHER, {
      bone: kneeBone,
      at: kneeBone.local([s * 0.01, 0.02, 0.05]),
      scale: [0.9, 1.2, 0.3],
      group: `leg${side}`,
    });

    // Boot: rests firmly on y = 0
    const footBone = legChain.joints[2];
    const footFrame = footBone;

    // Sole (bottom reaches y = 0.00)
    b.part(new THREE.BoxGeometry(0.09, 0.018, 0.18), DARK_LEATHER, {
      bone: footBone,
      at: [s * 0.13, 0.009, 0.03],
      group: `leg${side}`,
    });
    // Heel block
    b.part(new THREE.BoxGeometry(0.088, 0.014, 0.07), IRON, {
      bone: footBone,
      at: [s * 0.13, 0.012, -0.03],
      group: `leg${side}`,
    });

    // Boot upper
    b.part(new THREE.BoxGeometry(0.085, 0.065, 0.14), LEATHER, {
      bone: footBone,
      at: [s * 0.13, 0.05, 0.02],
      group: `leg${side}`,
    });

    // Curled whimsical gnome toe
    const curlPts = catmull([
      [s * 0.13, 0.02, 0.08],
      [s * 0.13, 0.03, 0.12],
      [s * 0.13, 0.055, 0.14],
      [s * 0.13, 0.07, 0.13],
    ]);
    b.sweep(curlPts, (t) => 0.035 * (1 - t) + 0.008, {
      bone: footBone,
      color: LEATHER,
      group: `leg${side}`,
    });

    // Riveted brass protective toe-cap
    b.part(new THREE.SphereGeometry(0.024, 8, 6), BRASS, {
      bone: footBone,
      at: [s * 0.13, 0.05, 0.13],
      scale: [0.8, 0.8, 0.8],
      group: `leg${side}`,
    });

    // Boot cuff at ankle
    b.part(new THREE.CylinderGeometry(0.058, 0.052, 0.04, 10), TAN_LEATHER, {
      bone: footBone,
      at: [s * 0.13, 0.09, 0.01],
      group: `leg${side}`,
    });
    // Tiny brass cuff buckle
    b.part(new THREE.BoxGeometry(0.014, 0.014, 0.008), BRASS, {
      bone: footBone,
      at: [s * 0.185, 0.09, 0.01],
      group: `leg${side}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Torso, Tunic & Heavy Craftsman Apron
  // ---------------------------------------------------------------------------
  // Plump gnome belly and sturdy chest
  const torsoLoft = b.loft(
    [
      { at: [0, 0.38, -0.01], w: 0.26, h: 0.22 },
      { at: [0, 0.48, 0.01], w: 0.3, h: 0.27 },
      { at: [0, 0.59, 0.01], w: 0.29, h: 0.25 },
      { at: [0, 0.67, 0.02], w: 0.21, h: 0.18 },
    ],
    { bone: [hips, spine1, spine2], color: TUNIC, group: "body" },
  );

  // Sturdy leather craftsman apron bib & skirt
  b.part(new THREE.BoxGeometry(0.2, 0.22, 0.02), LEATHER, {
    bone: spine1,
    at: [0, 0.44, 0.14],
    rotation: [-10, 0, 0],
    group: "body",
  });
  b.part(new THREE.BoxGeometry(0.18, 0.14, 0.018), LEATHER, {
    bone: spine2,
    at: [0, 0.58, 0.135],
    rotation: [-4, 0, 0],
    group: "body",
  });

  // Apron chest pocket with stitched patch texture
  b.part(new THREE.PlaneGeometry(0.08, 0.08), "#ffffff", {
    bone: spine2,
    at: [0, 0.57, 0.148],
    dir: [0, 0, 1],
    axis: "z",
    texture: POCKET_STITCH,
    group: "body",
  });

  // Tiny tools poking out of the apron pocket:
  // Brass calipers
  b.part(new THREE.BoxGeometry(0.006, 0.06, 0.004), BRASS, {
    bone: spine2,
    at: [-0.02, 0.62, 0.149],
    rotation: [0, 0, 12],
    group: "body",
  });
  b.part(new THREE.BoxGeometry(0.006, 0.05, 0.004), BRASS, {
    bone: spine2,
    at: [-0.012, 0.62, 0.149],
    rotation: [0, 0, -12],
    group: "body",
  });
  // Awl with wooden handle
  b.part(new THREE.CylinderGeometry(0.006, 0.004, 0.04, 6), WOOD, {
    bone: spine2,
    at: [0.02, 0.62, 0.149],
    group: "body",
  });
  b.part(new THREE.CylinderGeometry(0.002, 0.001, 0.025, 6), IRON, {
    bone: spine2,
    at: [0.02, 0.645, 0.149],
    group: "body",
  });

  // Main utility tool belt around waist
  const beltPath = catmull(
    [
      [0.16, 0.48, 0.04],
      [0, 0.47, 0.155],
      [-0.16, 0.48, 0.04],
      [0, 0.49, -0.135],
    ],
    { closed: true },
  );
  b.sweep(beltPath, 0.02, { bone: spine1, color: DARK_LEATHER, group: "body" });

  // Hero brass gear-buckle on belt!
  const beltGear = gearGeometry({ teeth: 12, module: 0.005, bore: 0.005 });
  b.part(beltGear, BRASS, {
    bone: spine1,
    at: [0, 0.47, 0.16],
    dir: [0, 0, 1],
    group: "body",
  });

  // Side pouches on the belt:
  // Right hip: structured box pouch
  b.part(new THREE.BoxGeometry(0.06, 0.07, 0.04), TAN_LEATHER, {
    bone: spine1,
    at: [-0.17, 0.47, 0.02],
    rotation: [0, -25, 0],
    group: "body",
  });
  b.part(new THREE.SphereGeometry(0.006, 6, 4), BRASS, {
    bone: spine1,
    at: [-0.19, 0.47, 0.04],
    group: "body",
  });
  // Left hip: cylindrical lubricant flask
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.06, 8), COPPER, {
    bone: spine1,
    at: [0.17, 0.46, 0.02],
    rotation: [0, 0, -15],
    group: "body",
  });
  b.part(new THREE.CylinderGeometry(0.01, 0.012, 0.016, 6), WOOD, {
    bone: spine1,
    at: [0.175, 0.495, 0.02],
    rotation: [0, 0, -15],
    group: "body",
  });

  // Cross-chest harness straps for the gadget backpack
  for (const s of [1, -1]) {
    const strapPts = catmull([
      [s * 0.11, 0.66, -0.11],
      [s * 0.12, 0.64, 0.05],
      [s * 0.08, 0.54, 0.14],
      [s * 0.12, 0.48, 0.1],
    ]);
    b.sweep(strapPts, 0.014, { bone: spine2, color: DARK_LEATHER, group: "body" });
    // Brass strap adjuster buckle
    b.part(new THREE.BoxGeometry(0.02, 0.024, 0.008), BRASS, {
      bone: spine2,
      at: [s * 0.09, 0.57, 0.138],
      dir: [0, 0, 1],
      group: "body",
    });
  }

  // ---------------------------------------------------------------------------
  // Arms & Articulated Work Gloves (Neutral Rest Pose)
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulder: [number, number, number] = [s * 0.16, 0.62, 0.01];
    const elbow: [number, number, number] = [s * 0.28, 0.5, -0.01];
    const wrist: [number, number, number] = [s * 0.38, 0.39, 0.04];

    const armChain = b.chain(`arm${side}`, [shoulder, elbow, wrist], {
      parent: spine2,
      names: [`shoulder${side}`, `elbow${side}`],
      role: "arm",
    });

    // Upper arm (rolled tunic sleeve)
    b.sweep(catmull([shoulder, elbow]), (t) => 0.065 * (1 - 0.2 * t), {
      bone: armChain.joints[0],
      color: TUNIC,
      group: `arm${side}`,
    });

    // Rolled sleeve fabric cuff
    b.part(new THREE.CylinderGeometry(0.056, 0.056, 0.03, 10), TUNIC, {
      bone: armChain.joints[0],
      at: elbow,
      dir: [s * 0.7, -0.6, 0.2],
      group: `arm${side}`,
    });

    // Forearm & Work Gauntlet
    b.sweep(catmull([elbow, wrist]), (t) => 0.045 + 0.01 * t, {
      bone: armChain.joints[1],
      color: TAN_LEATHER,
      group: `arm${side}`,
    });

    // Heavy leather wrist cuff
    b.part(new THREE.CylinderGeometry(0.046, 0.042, 0.032, 10), DARK_LEATHER, {
      bone: armChain.joints[1],
      at: wrist,
      dir: [s * 0.6, -0.6, 0.4],
      group: `arm${side}`,
    });

    // Wrist joint for hand
    const handJoint = b.joint(`wrist${side}`, {
      parent: armChain.joints[1],
      at: wrist,
      dir: [s * 0.4, -0.6, 0.6],
      role: "arm",
    });

    // Glove Palm
    const palmCenter = handJoint.local([s * 0.02, 0.03, 0.02]);
    b.part(new THREE.BoxGeometry(0.05, 0.06, 0.03), TAN_LEATHER, {
      bone: handJoint,
      at: palmCenter,
      group: `arm${side}`,
    });

    // Knuckle brass rivet strip
    for (let k = -1; k <= 1; k++) {
      b.part(new THREE.SphereGeometry(0.005, 6, 4), BRASS, {
        bone: handJoint,
        at: handJoint.local([s * 0.02 + k * 0.015, 0.045, 0.038]),
        group: `arm${side}`,
      });
    }

    // Thumb & 3 stout fingers (separated, natural relaxed rigging grip)
    // Thumb
    const thumb1 = b.joint(`thumb${side}1`, {
      parent: handJoint,
      at: handJoint.local([s * 0.035, 0.02, 0.01]),
      dir: [s * 0.6, 0.2, 0.7],
      role: "digit",
    });
    b.part(new THREE.CylinderGeometry(0.01, 0.009, 0.025, 6), TAN_LEATHER, {
      bone: thumb1,
      at: thumb1.local([0, 0.012, 0]),
      group: `arm${side}`,
    });
    const thumb2 = b.joint(`thumb${side}2`, {
      parent: thumb1,
      at: thumb1.local([0, 0.025, 0]),
      dir: [s * 0.2, 0.4, 0.8],
      role: "digit",
    });
    b.part(new THREE.CylinderGeometry(0.009, 0.007, 0.02, 6), TAN_LEATHER, {
      bone: thumb2,
      at: thumb2.local([0, 0.01, 0]),
      group: `arm${side}`,
    });

    // Fingers
    const fingerNames = ["index", "mid", "pinky"];
    fingerNames.forEach((fname, fidx) => {
      const fx = (fidx - 1) * 0.016;
      const f1 = b.joint(`${fname}${side}1`, {
        parent: handJoint,
        at: handJoint.local([s * 0.02 + fx, 0.055, 0.015]),
        dir: [s * 0.1, -0.6, 0.7],
        role: "digit",
      });
      b.part(new THREE.CylinderGeometry(0.009, 0.008, 0.028, 6), TAN_LEATHER, {
        bone: f1,
        at: f1.local([0, 0.014, 0]),
        group: `arm${side}`,
      });

      const f2 = b.joint(`${fname}${side}2`, {
        parent: f1,
        at: f1.local([0, 0.028, 0]),
        dir: [s * 0.05, -0.8, 0.4],
        role: "digit",
      });
      b.part(new THREE.CylinderGeometry(0.008, 0.006, 0.022, 6), TAN_LEATHER, {
        bone: f2,
        at: f2.local([0, 0.011, 0]),
        group: `arm${side}`,
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Gnome Head, Expressive Face & Jeweler's Loupe
  // ---------------------------------------------------------------------------
  // Pear-shaped head with chubby cheeks
  b.part(new THREE.SphereGeometry(0.12, 12, 10), GNOME_SKIN, {
    bone: head,
    at: [0, 0.76, 0.04],
    scale: [0.95, 0.95, 0.9],
    group: "head",
  });

  // Big signature bulbous gnome nose
  b.part(new THREE.SphereGeometry(0.038, 10, 8), GNOME_SKIN, {
    bone: head,
    at: [0, 0.75, 0.16],
    scale: [0.95, 0.88, 1.05],
    group: "head",
  });
  // Nostril wings
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.016, 6, 4), GNOME_SKIN, {
      bone: head,
      at: [s * 0.024, 0.74, 0.145],
      group: "head",
    });
  }

  // Rosy cheeks
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.038, 8, 6), GNOME_SKIN, {
      bone: head,
      at: [s * 0.065, 0.73, 0.11],
      scale: [0.9, 0.85, 0.7],
      group: "head",
    });
  }

  // Left Eye: Curious wide eye with SVG iris texture
  b.part(new THREE.SphereGeometry(0.02, 10, 8), "#ffffff", {
    bone: head,
    at: [0.044, 0.78, 0.125],
    group: "head",
  });
  b.part(new THREE.PlaneGeometry(0.034, 0.034), "#ffffff", {
    bone: head,
    at: [0.045, 0.78, 0.144],
    dir: [0.1, 0.05, 0.95],
    axis: "z",
    texture: GNOME_EYE,
    group: "head",
  });

  // Right Eye: Looking through the watchmaker's magnifying loupe!
  b.part(new THREE.SphereGeometry(0.02, 10, 8), "#ffffff", {
    bone: head,
    at: [-0.044, 0.78, 0.125],
    group: "head",
  });
  b.part(new THREE.PlaneGeometry(0.034, 0.034), "#ffffff", {
    bone: head,
    at: [-0.045, 0.78, 0.144],
    dir: [-0.1, 0.05, 0.95],
    axis: "z",
    texture: GNOME_EYE,
    group: "head",
  });

  // Jeweler's Loupe on Right Eye:
  // Brass wire arm
  const loupeWire = catmull([
    [-0.08, 0.8, 0.06],
    [-0.065, 0.79, 0.11],
    [-0.045, 0.78, 0.15],
  ]);
  b.sweep(loupeWire, 0.002, { bone: head, color: BRASS, group: "head" });

  // Brass lens cylinder
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.016, 12), BRASS, {
    bone: head,
    at: [-0.045, 0.78, 0.155],
    dir: [-0.1, 0.05, 1],
    group: "head",
  });
  // Luminous cyan magnifying lens
  glow(
    b.part(new THREE.CylinderGeometry(0.017, 0.017, 0.003, 10), "#55ffea", {
      bone: head,
      at: [-0.045, 0.78, 0.162],
      dir: [-0.1, 0.05, 1],
      group: "head",
    }),
    0.8,
  );
  // Secondary flip-up lens arm on top
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.006, 8), BRASS, {
    bone: head,
    at: [-0.045, 0.805, 0.155],
    dir: [-0.1, 0.8, 0.4],
    group: "head",
  });

  // Bushy white/silvery eyebrows
  for (const s of [1, -1]) {
    const browPts = catmull([
      [s * 0.015, 0.805, 0.145],
      [s * 0.05, 0.825, 0.135],
      [s * 0.08, 0.82, 0.1],
    ]);
    b.sweep(browPts, (t) => 0.016 * (1 - 0.5 * t) + 0.004, {
      bone: head,
      color: BEARD,
      group: "head",
    });
  }

  // Classic pointed gnome ears sticking out sideways
  for (const s of [1, -1]) {
    const earPath = catmull([
      [s * 0.09, 0.75, 0.03],
      [s * 0.13, 0.77, 0.01],
      [s * 0.17, 0.79, -0.02],
    ]);
    b.sweep(earPath, (t) => [0.025 * (1 - t) + 0.005, 0.015 * (1 - t) + 0.002], {
      bone: head,
      color: GNOME_SKIN,
      group: "head",
    });
  }

  // ---------------------------------------------------------------------------
  // Magnificent Beard, Walrus Moustache & Hinged Jaw
  // ---------------------------------------------------------------------------
  // Walrus Moustache: sweeping out under the nose
  for (const s of [1, -1]) {
    const stachePts = catmull([
      [s * 0.005, 0.725, 0.155],
      [s * 0.045, 0.71, 0.165],
      [s * 0.085, 0.67, 0.135],
      [s * 0.105, 0.63, 0.095],
    ]);
    b.sweep(stachePts, (t) => 0.024 * (1 - t) + 0.004, {
      bone: head,
      color: BEARD,
      group: "head",
    });
  }

  // Chin & Lower Mouth on Jaw Bone
  b.part(new THREE.BoxGeometry(0.04, 0.02, 0.02), GNOME_SKIN, {
    bone: jaw,
    at: [0, 0.71, 0.12],
    group: "jaw",
  });

  // Massive Beard flowing from jaw and cheeks down to chest
  const beardMain = catmull([
    [0, 0.72, 0.1],
    [0, 0.64, 0.14],
    [0, 0.55, 0.13],
  ]);
  b.sweep(beardMain, (t) => [0.08 * (1 - 0.2 * t), 0.06 * (1 - 0.1 * t)], {
    bone: jaw,
    color: BEARD,
    group: "jaw",
  });

  // Twin braided forks of the beard
  for (const s of [1, -1]) {
    const braidPts = catmull([
      [s * 0.035, 0.58, 0.13],
      [s * 0.045, 0.52, 0.125],
      [s * 0.05, 0.46, 0.11],
    ]);
    b.sweep(braidPts, (t) => 0.032 * (1 - 0.4 * t), {
      bone: jaw,
      color: BEARD,
      group: "jaw",
    });

    // Ornamental brass rings clipping each braid fork
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.016, 10), BRASS, {
      bone: jaw,
      at: [s * 0.048, 0.49, 0.118],
      dir: [s * 0.1, -0.9, 0.2],
      group: "jaw",
    });

    // Tuft emerging below the brass ring
    b.spike([s * 0.05, 0.48, 0.115], [s * 0.052, 0.43, 0.1], 0.055, 0.02, {
      bone: jaw,
      color: BEARD,
      group: "jaw",
    });
  }

  // ---------------------------------------------------------------------------
  // Floppy Felt Gnome Cap & Goggles
  // ---------------------------------------------------------------------------
  // Rolled hat brim
  const brimPath = catmull(
    [
      [0.12, 0.81, 0.03],
      [0, 0.82, 0.13],
      [-0.12, 0.81, 0.03],
      [0, 0.8, -0.07],
    ],
    { closed: true },
  );
  b.sweep(brimPath, 0.022, { bone: head, color: HAT_FELT, group: "hat" });

  // Floppy hat cone S-curving backward and drooping to the left
  const hatCone = catmull([
    [0, 0.82, 0.02],
    [-0.01, 0.88, 0.01],
    [-0.03, 0.95, -0.02],
    [-0.07, 1.0, -0.07],
    [-0.12, 1.01, -0.13],
    [-0.16, 0.97, -0.17],
    [-0.18, 0.91, -0.18],
  ]);
  b.sweep(hatCone, (t) => 0.115 * Math.pow(1 - t, 0.7) + 0.008, {
    bone: head,
    color: HAT_FELT,
    group: "hat",
  });

  // Brass bell / acorn finial at hat tip
  b.part(new THREE.SphereGeometry(0.016, 8, 6), BRASS, {
    bone: head,
    at: [-0.18, 0.89, -0.185],
    group: "hat",
  });

  // Leather hat band
  const bandPath = catmull(
    [
      [0.115, 0.83, 0.03],
      [0, 0.838, 0.12],
      [-0.115, 0.83, 0.03],
      [0, 0.82, -0.06],
    ],
    { closed: true },
  );
  b.sweep(bandPath, 0.012, { bone: head, color: DARK_LEATHER, group: "hat" });

  // Goggles pushed up on the hat brim:
  // Leather eyecup strap
  b.part(new THREE.BoxGeometry(0.05, 0.02, 0.01), DARK_LEATHER, {
    bone: head,
    at: [0, 0.84, 0.125],
    group: "hat",
  });

  for (const s of [1, -1]) {
    // Brass eyecup cylinder
    b.part(new THREE.CylinderGeometry(0.024, 0.022, 0.018, 12), BRASS, {
      bone: head,
      at: [s * 0.044, 0.84, 0.13],
      dir: [s * 0.1, 0.3, 0.95],
      group: "hat",
    });
    // Glowing emerald green lens
    glow(
      b.part(new THREE.CylinderGeometry(0.019, 0.019, 0.003, 10), "#28df80", {
        bone: head,
        at: [s * 0.046, 0.845, 0.138],
        dir: [s * 0.1, 0.3, 0.95],
        group: "hat",
      }),
      1.1,
    );
  }

  // ---------------------------------------------------------------------------
  // HERO PROP: The Gadget Backpack of Wonders
  // ---------------------------------------------------------------------------
  // Mounted rigidly to spine2 (chest bone)
  const packFrame = spine2;

  // 1. Wood Cabinet Body with Corner Brackets
  b.part(new THREE.BoxGeometry(0.24, 0.32, 0.15), WOOD, {
    bone: spine2,
    at: [0, 0.61, -0.19],
    group: "backpack",
  });

  // Corner brass reinforcement brackets (8 corners)
  for (const cx of [1, -1]) {
    for (const cy of [1, -1]) {
      for (const cz of [1, -1]) {
        b.part(new THREE.BoxGeometry(0.025, 0.025, 0.025), BRASS, {
          bone: spine2,
          at: [cx * 0.115, 0.61 + cy * 0.155, -0.19 + cz * 0.07],
          group: "backpack",
        });
      }
    }
  }

  // 2. Steam Pressure Boiler (Cylindrical Copper Tank at Base)
  b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.24, 12), COPPER, {
    bone: spine2,
    at: [0, 0.48, -0.21],
    dir: [1, 0, 0],
    group: "backpack",
  });
  // Domed copper boiler ends
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.054, 8, 6), COPPER, {
      bone: spine2,
      at: [s * 0.12, 0.48, -0.21],
      scale: [0.4, 1, 1],
      group: "backpack",
    });
  }
  // Brass boiler retention bands
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.016, 12), BRASS, {
      bone: spine2,
      at: [s * 0.07, 0.48, -0.21],
      dir: [1, 0, 0],
      group: "backpack",
    });
  }

  // 3. Pressure Gauge (Right side of boiler)
  b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.015, 12), BRASS, {
    bone: spine2,
    at: [-0.14, 0.58, -0.21],
    dir: [-1, 0, 0],
    group: "backpack",
  });
  b.part(new THREE.CircleGeometry(0.03, 16), "#ffffff", {
    bone: spine2,
    at: [-0.148, 0.58, -0.21],
    dir: [-1, 0, 0],
    axis: "z",
    texture: gaugeTexture({ red: [75, 135], label: "PSI", needle: 45 }),
    group: "backpack",
  });
  // Copper pipe connecting gauge to boiler
  const gaugePipe = catmull([
    [-0.14, 0.55, -0.21],
    [-0.13, 0.51, -0.21],
    [-0.11, 0.48, -0.21],
  ]);
  b.sweep(gaugePipe, 0.006, { bone: spine2, color: COPPER, group: "backpack" });

  // 4. Exposed Clockwork Gear Train on Backpack Rear
  // An active meshing 4-gear train from kits/clockwork!
  const packTrain = gearTrain(b, {
    at: [0.04, 0.65, -0.27],
    axis: [0, 0, -1],
    up: [0, 1, 0],
    module: 0.005,
    spin: "gear",
    bone: spine2,
    group: "backpack",
    gears: [
      { teeth: 18, spokes: 4, color: BRASS },
      { teeth: 10, angle: 55, color: COPPER },
      { teeth: 14, from: 0, angle: -125, spokes: 3, color: BLUED },
      { teeth: 16, on: 1, shift: -0.015, color: GILT, texture: true },
    ],
  });
  packTrain.spin(15);

  // Brass mounting cage / skeleton plate around the gear train
  b.part(new THREE.BoxGeometry(0.16, 0.18, 0.012), panelled(BRASS, { size: 0.08 }), {
    bone: spine2,
    at: [0.04, 0.65, -0.268],
    group: "backpack",
  });

  // 5. Arcane Vacuum Tube / Glowing Alchemical Plasma Flask
  // Upper-right corner of pack
  const flaskBase: [number, number, number] = [-0.09, 0.64, -0.2];
  // Stepped brass bottom socket
  b.part(new THREE.CylinderGeometry(0.028, 0.032, 0.02, 10), BRASS, {
    bone: spine2,
    at: flaskBase,
    group: "backpack",
  });
  // Outer glass cylinder
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.11, 10), "#d0f6ff", {
    bone: spine2,
    at: [-0.09, 0.705, -0.2],
    group: "backpack",
  });
  // Inner glowing cyan plasma core!
  glow(
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.08, 8), "#22ebd2", {
      bone: spine2,
      at: [-0.09, 0.705, -0.2],
      group: "backpack",
    }),
    1.9,
  );
  // Stepped brass top cap
  b.part(new THREE.CylinderGeometry(0.028, 0.025, 0.018, 10), BRASS, {
    bone: spine2,
    at: [-0.09, 0.765, -0.2],
    group: "backpack",
  });
  // 4 protective brass cage rods surrounding the glass tube
  for (let i = 0; i < 4; i++) {
    const ang = (i * Math.PI) / 2;
    const rx = -0.09 + 0.027 * Math.cos(ang);
    const rz = -0.2 + 0.027 * Math.sin(ang);
    b.rod([rx, 0.64, rz], [rx, 0.77, rz], 0.003, BRASS, {
      bone: spine2,
      group: "backpack",
    });
  }

  // 6. Telescoping Antenna with Copper Spark Coil
  // Upper-left corner of pack, extending high over shoulder
  const antennaBase: [number, number, number] = [0.09, 0.76, -0.19];
  // Brass mounting block
  b.part(new THREE.CylinderGeometry(0.018, 0.022, 0.02, 8), BRASS, {
    bone: spine2,
    at: antennaBase,
    group: "backpack",
  });
  // Ceramic insulator rod
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.09, 8), "#eae5d8", {
    bone: spine2,
    at: [0.09, 0.815, -0.19],
    group: "backpack",
  });
  // Copper spark coil wrapped around insulator!
  const sparkCoil = coil([0.09, 0.78, -0.19], [0.09, 0.85, -0.19], 0.015, 6);
  b.sweep(sparkCoil, 0.003, { bone: spine2, color: COPPER, group: "backpack" });

  // Telescoping brass mast extending upward
  b.rod([0.09, 0.86, -0.19], [0.09, 1.03, -0.19], 0.005, BRASS, {
    bone: spine2,
    group: "backpack",
  });
  // Spherical brass transmitter tip & ring
  b.part(new THREE.SphereGeometry(0.014, 8, 6), BRASS, {
    bone: spine2,
    at: [0.09, 1.03, -0.19],
    group: "backpack",
  });
  b.part(new THREE.TorusGeometry(0.024, 0.003, 6, 12), COPPER, {
    bone: spine2,
    at: [0.09, 1.03, -0.19],
    rotation: [90, 0, 0],
    group: "backpack",
  });

  // 7. Copper Steam Exhaust Chimney & Whistle
  const exhaustPts = catmull([
    [-0.05, 0.52, -0.24],
    [-0.07, 0.62, -0.26],
    [-0.07, 0.75, -0.24],
    [-0.06, 0.85, -0.22],
  ]);
  b.sweep(exhaustPts, 0.011, { bone: spine2, color: COPPER, group: "backpack" });
  // Trumpet whistle bell at top
  b.part(new THREE.ConeGeometry(0.022, 0.03, 10), BRASS, {
    bone: spine2,
    at: [-0.06, 0.87, -0.22],
    group: "backpack",
  });
  // Miniature red valve wheel on exhaust pipe
  b.part(new THREE.TorusGeometry(0.014, 0.0035, 6, 10), "#b3261e", {
    bone: spine2,
    at: [-0.075, 0.7, -0.25],
    rotation: [0, 90, 0],
    group: "backpack",
  });

  // 8. Rolled Blueprint Scroll Strapped to Pack Top
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.22, 10), "#ffffff", {
    bone: spine2,
    at: [0, 0.79, -0.18],
    dir: [1, 0, 0],
    texture: BLUEPRINT,
    group: "backpack",
  });
  // Leather tie straps holding the blueprint
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.014, 10), DARK_LEATHER, {
      bone: spine2,
      at: [s * 0.07, 0.79, -0.18],
      dir: [1, 0, 0],
      group: "backpack",
    });
  }

  // 9. Oversized Brass Monkey Wrench Hanging on Flank
  const wrenchBase: [number, number, number] = [0.14, 0.58, -0.17];
  // Handle
  b.rod(wrenchBase, [0.14, 0.44, -0.17], 0.006, BLUED, {
    bone: spine2,
    group: "backpack",
  });
  // Wrench head & knurled adjusting worm gear
  b.part(new THREE.BoxGeometry(0.024, 0.035, 0.016), IRON, {
    bone: spine2,
    at: [0.14, 0.58, -0.17],
    group: "backpack",
  });
  b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.016, 8), BRASS, {
    bone: spine2,
    at: [0.14, 0.565, -0.165],
    dir: [0, 1, 0],
    group: "backpack",
  });
  b.part(new THREE.BoxGeometry(0.022, 0.01, 0.03), IRON, {
    bone: spine2,
    at: [0.14, 0.6, -0.155],
    group: "backpack",
  });

  // 10. Lubricant Oil Can in Holster on Flank
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.04, 8), TAN_LEATHER, {
    bone: spine2,
    at: [-0.14, 0.5, -0.16],
    group: "backpack",
  });
  b.part(new THREE.ConeGeometry(0.018, 0.045, 8), COPPER, {
    bone: spine2,
    at: [-0.14, 0.53, -0.16],
    group: "backpack",
  });
  b.sweep(
    catmull([
      [-0.14, 0.55, -0.16],
      [-0.14, 0.6, -0.16],
      [-0.16, 0.64, -0.15],
    ]),
    0.003,
    { bone: spine2, color: BRASS, group: "backpack" },
  );

  // ---------------------------------------------------------------------------
  // Staged Setting: Discarded Workshop Props at Feet (Lies on y = 0)
  // ---------------------------------------------------------------------------
  // 1. Large discarded brass cog flat on the floor (thickness 0.014, bottom at y = 0)
  const floorGear1 = gearGeometry({ teeth: 16, module: 0.007, spokes: 4, bore: 0.008 });
  b.part(floorGear1, OLD_BRASS, {
    at: [0.28, 0.007, 0.08],
    dir: [0, 1, 0],
    group: "scenery",
  });

  // 2. Smaller copper cog propped against it
  const floorGear2 = gearGeometry({ teeth: 10, module: 0.006, bore: 0.006 });
  b.part(floorGear2, COPPER, {
    at: [0.33, 0.012, 0.12],
    dir: [0.2, 0.9, 0.2],
    group: "scenery",
  });

  // 3. Brass hex nut on the workshop floor
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.012, 6), BRASS, {
    at: [0.22, 0.006, -0.07],
    dir: [0, 1, 0],
    group: "scenery",
  });

  // 4. Blueprints schematic scrap lying flat on the floor (bottom at y = 0.001)
  b.part(new THREE.PlaneGeometry(0.18, 0.14), "#ffffff", {
    at: [-0.26, 0.001, 0.1],
    dir: [0, 1, 0],
    axis: "z",
    rotation: [0, 24, 0],
    texture: BLUEPRINT,
    group: "scenery",
  });

  return b.root;
}
