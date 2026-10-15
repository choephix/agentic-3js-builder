Here is the breakdown of the improvements:

1. **Gnome Proportions & Anatomy**: Lowered the hips and shortened the legs to authentic squat gnome proportions (~1:3 head-to-body ratio), turning the straight giant telephone-pole legs into short, sturdy, baggy trousers with curved cuffs.
2. **Boots & Ground Clearance**: Fixed the -22 mm underground penetration. Boot soles now sit squarely at $y = 0.00$, and the whimsical curling elf toe curves upward from the sole without dipping below the floor.
3. **Arms & Hands**: Replaced the club-like forearms with tapered leather work gauntlets, flared cuffs, and well-proportioned 4-finger glove hands in a natural, relaxed tinkering rest pose.
4. **Beard, Face & Expression**: Sculpted a rich, multi-tiered beard with sweeping faceted locks, curled walrus moustache, and twin braided tails bound with brass gear clasps. Cocked one bushy white eyebrow for a curious, inquisitive tinkerer expression.
5. **Gadget Backpack Silhouette**: Extended the backpack's silhouette so its most interesting gadgets are clearly visible from front and three-quarter angles:
   - Over the right shoulder: an articulated brass task lamp with a warm glowing golden lens.
   - Over the left shoulder: the glowing cyan vacuum tube in its brass cage, alongside the curved copper steam exhaust chimney and whistle.
   - Angled the pressure gauge diagonally forward so the dial texture reads clearly from 3/4 view.
6. **Setting & Floor Props**: Grounded all workshop floor props (schematic blueprint, gears, hex nuts) flat at $y = 0.00$ directly adjacent to his boots, eliminating loose disconnected parts warnings.

```ts
import * as THREE from "three";
import {
  aim,
  bezier,
  catmull,
  createBuilder,
  DEG,
  grain,
  limb,
  mix,
  mottle,
  paint,
  rgb,
  rng,
  smoothstep,
  svg,
} from "agentic-3js-builder";
import type { Rgb } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import {
  coil,
  gaugeTexture,
  gearGeometry,
  gearTrain,
  metal,
  panelled,
  TINT,
} from "agentic-3js-builder/kits/clockwork";

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
  const BRASS = metal("brass", { polish: 0.6, tarnish: 0.25, seed: 11 });
  const OLD_BRASS = metal("brass", { polish: 0.25, tarnish: 0.6, verdigris: 0.4, seed: 12 });
  const COPPER = metal("copper", { polish: 0.5, verdigris: 0.35, seed: 13 });
  const GILT = metal("gilt", { polish: 0.75, tarnish: 0.1, seed: 14 });
  const BLUED = metal("blued", { polish: 0.5, tarnish: 0.2, seed: 15 });
  const IRON = metal("iron", { polish: 0.3, tarnish: 0.45, seed: 16 });

  const LEATHER = mottle("#5c3418", "#7a4622", { size: 0.04, seed: 21 });
  const DARK_LEATHER = mottle("#321c0e", "#442614", { size: 0.035, seed: 22 });
  const TAN_LEATHER = mottle("#8a5832", "#a66e42", { size: 0.04, seed: 23 });
  const TUNIC = grain("#1b4450", "#245868", { size: 0.02, seed: 31 });
  const PANTS = grain("#423224", "#523f2e", { size: 0.025, seed: 32 });
  const HAT_FELT = mottle("#861f32", "#5c1322", { size: 0.05, seed: 41 });
  const BEARD = grain("#edf2f7", "#c4d0db", { size: 0.012, seed: 51 });
  const WOOD = grain("#482512", "#5e3218", { size: 0.018, seed: 61 });

  const GNOME_SKIN = paint((p, n) => {
    const base: Rgb = [0.97, 0.79, 0.66];
    const blush: Rgb = [0.94, 0.55, 0.45];
    const ruddy: Rgb = [0.88, 0.36, 0.3];
    // Nose highlight & redness
    const dNose = Math.hypot(p.x, p.y - 0.57, p.z - 0.15);
    if (dNose < 0.045) return mix(base, ruddy, smoothstep(0.045, 0.01, dNose));
    // Rosy cheeks
    const dCheek = Math.min(
      Math.hypot(p.x - 0.06, p.y - 0.55, p.z - 0.1),
      Math.hypot(p.x + 0.06, p.y - 0.55, p.z - 0.1),
    );
    if (dCheek < 0.042) return mix(base, blush, smoothstep(0.042, 0.01, dCheek) * 0.7);
    return mix(base, blush, 0.15 * smoothstep(-0.2, 0.8, n.y));
  });

  // ---------------------------------------------------------------------------
  // Textures (SVG)
  // ---------------------------------------------------------------------------
  const GNOME_EYE = svg(
    `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="iris" cx="45%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#f8c352"/>
          <stop offset="60%" stop-color="#b86b16"/>
          <stop offset="100%" stop-color="#462202"/>
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="39" fill="#fcfbf7"/>
      <circle cx="40" cy="40" r="23" fill="url(#iris)"/>
      <circle cx="40" cy="40" r="23" fill="none" stroke="#361700" stroke-width="2"/>
      <circle cx="40" cy="40" r="12" fill="#120902"/>
      <circle cx="34" cy="34" r="6" fill="#ffffff"/>
      <circle cx="47" cy="45" r="2.8" fill="#ffffff" opacity="0.85"/>
      <ellipse cx="40" cy="18" rx="28" ry="12" fill="#2a1608" opacity="0.18"/>
    </svg>`,
    { size: 256 },
  );

  const BLUEPRINT = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" fill="#123054"/>
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
      <rect x="2" y="2" width="60" height="60" rx="6" fill="#64381c" stroke="#3c1e0a" stroke-width="2"/>
      <rect x="6" y="6" width="52" height="52" rx="4" fill="none" stroke="#d5b583" stroke-width="1.8" stroke-dasharray="4 3"/>
      <circle cx="10" cy="10" r="2.2" fill="#e8c35a"/>
      <circle cx="54" cy="10" r="2.2" fill="#e8c35a"/>
    </svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------------------
  // Skeleton / Rigging: True Whimsical Gnome Proportions (~0.76 m tall)
  // ---------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.25, -0.01], role: "spine" });
  const spine1 = b.joint("spine1", { parent: hips, at: [0, 0.33, -0.01], role: "spine" });
  const spine2 = b.joint("spine2", { parent: spine1, at: [0, 0.43, 0.0], role: "spine" });
  const neck = b.joint("neck", { parent: spine2, at: [0, 0.5, 0.01], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.56, 0.02], dir: [0, 0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.53, 0.06], dir: [0, -0.1, 1], role: "jaw" });

  // ---------------------------------------------------------------------------
  // Legs & Chunky Whimsical Boots (Strictly Grounded at y = 0.00)
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipPos: [number, number, number] = [s * 0.09, 0.25, -0.01];
    const footTarget: [number, number, number] = [s * 0.11, 0.05, 0.01];
    const legPts = limb(hipPos, footTarget, [0.11, 0.11], [s * 0.01, 0.04, 0.5]);

    const legChain = b.chain(`leg${side}`, legPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.11, 0, 0.03],
    });

    // Chubby, baggy trousers (diameter ~0.09m, cute and stout)
    b.sweep(legChain, (t) => 0.046 * (1 - 0.2 * t) + 0.008, {
      bone: legChain,
      color: PANTS,
      group: `leg${side}`,
    });

    // Knee patch
    const kneeBone = legChain.joints[1];
    b.part(new THREE.SphereGeometry(0.024, 8, 6), LEATHER, {
      bone: kneeBone,
      at: kneeBone.local([s * 0.005, 0.01, 0.035]),
      scale: [0.9, 1.2, 0.3],
      group: `leg${side}`,
    });

    // Boot Assembly (Sits exactly on y = 0.000)
    const footBone = legChain.joints[2];

    // Heavy leather sole (bottom reaches y = 0.000 exactly: height 0.016, center y = 0.008)
    b.part(new THREE.BoxGeometry(0.082, 0.016, 0.15), DARK_LEATHER, {
      bone: footBone,
      at: [s * 0.11, 0.008, 0.02],
      group: `leg${side}`,
    });
    // Iron heel rim
    b.part(new THREE.BoxGeometry(0.08, 0.012, 0.05), IRON, {
      bone: footBone,
      at: [s * 0.11, 0.01, -0.03],
      group: `leg${side}`,
    });

    // Boot upper body
    b.part(new THREE.BoxGeometry(0.076, 0.05, 0.12), LEATHER, {
      bone: footBone,
      at: [s * 0.11, 0.036, 0.015],
      group: `leg${side}`,
    });

    // Whimsical elf toe curling upward (stays well above y = 0)
    const curlPts = catmull([
      [s * 0.11, 0.02, 0.07],
      [s * 0.11, 0.025, 0.1],
      [s * 0.11, 0.042, 0.115],
      [s * 0.11, 0.056, 0.108],
    ]);
    b.sweep(curlPts, (t) => 0.024 * (1 - t) + 0.006, {
      bone: footBone,
      color: LEATHER,
      group: `leg${side}`,
    });

    // Decorative brass toe cap
    b.part(new THREE.SphereGeometry(0.018, 8, 6), BRASS, {
      bone: footBone,
      at: [s * 0.11, 0.042, 0.11],
      scale: [0.8, 0.8, 0.8],
      group: `leg${side}`,
    });

    // Flared ankle cuff
    b.part(new THREE.CylinderGeometry(0.048, 0.042, 0.03, 10), TAN_LEATHER, {
      bone: footBone,
      at: [s * 0.11, 0.07, 0.01],
      group: `leg${side}`,
    });
    // Tiny brass cuff buckle
    b.part(new THREE.BoxGeometry(0.012, 0.012, 0.006), BRASS, {
      bone: footBone,
      at: [s * 0.155, 0.07, 0.01],
      group: `leg${side}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Plump Torso, Woven Tunic & Heavy Craftsman Apron
  // ---------------------------------------------------------------------------
  // Plump pear-shaped gnome belly
  b.loft(
    [
      { at: [0, 0.24, -0.01], w: 0.22, h: 0.19 },
      { at: [0, 0.33, 0.01], w: 0.26, h: 0.23 },
      { at: [0, 0.42, 0.01], w: 0.25, h: 0.21 },
      { at: [0, 0.49, 0.01], w: 0.19, h: 0.16 },
    ],
    { bone: [hips, spine1, spine2], color: TUNIC, group: "body" },
  );

  // Craftsman Apron Bib & Skirt (shaped to hug the round belly)
  b.part(new THREE.BoxGeometry(0.17, 0.16, 0.016), LEATHER, {
    bone: spine1,
    at: [0, 0.29, 0.115],
    rotation: [-9, 0, 0],
    group: "body",
  });
  b.part(new THREE.BoxGeometry(0.15, 0.12, 0.015), LEATHER, {
    bone: spine2,
    at: [0, 0.41, 0.112],
    rotation: [-3, 0, 0],
    group: "body",
  });

  // Apron chest pocket with stitched patch texture
  b.part(new THREE.PlaneGeometry(0.07, 0.07), "#ffffff", {
    bone: spine2,
    at: [0, 0.4, 0.122],
    dir: [0, 0, 1],
    axis: "z",
    texture: POCKET_STITCH,
    group: "body",
  });

  // Tiny tools poking out of the apron pocket:
  // Brass measuring calipers
  b.part(new THREE.BoxGeometry(0.005, 0.05, 0.003), BRASS, {
    bone: spine2,
    at: [-0.018, 0.445, 0.124],
    rotation: [0, 0, 12],
    group: "body",
  });
  b.part(new THREE.BoxGeometry(0.005, 0.042, 0.003), BRASS, {
    bone: spine2,
    at: [-0.01, 0.445, 0.124],
    rotation: [0, 0, -12],
    group: "body",
  });
  // Awl with wooden handle
  b.part(new THREE.CylinderGeometry(0.005, 0.0035, 0.03, 6), WOOD, {
    bone: spine2,
    at: [0.018, 0.445, 0.124],
    group: "body",
  });
  b.part(new THREE.CylinderGeometry(0.0018, 0.001, 0.02, 6), IRON, {
    bone: spine2,
    at: [0.018, 0.465, 0.124],
    group: "body",
  });

  // Utility tool belt around waist
  const beltPath = catmull(
    [
      [0.135, 0.34, 0.03],
      [0, 0.33, 0.128],
      [-0.135, 0.34, 0.03],
      [0, 0.35, -0.11],
    ],
    { closed: true },
  );
  b.sweep(beltPath, 0.016, { bone: spine1, color: DARK_LEATHER, group: "body" });

  // Hero brass gear-buckle on belt!
  const beltGear = gearGeometry({ teeth: 12, module: 0.004, bore: 0.004 });
  b.part(beltGear, BRASS, {
    bone: spine1,
    at: [0, 0.33, 0.132],
    dir: [0, 0, 1],
    group: "body",
  });

  // Side pouches on the belt:
  // Right hip: structured box pouch
  b.part(new THREE.BoxGeometry(0.05, 0.06, 0.035), TAN_LEATHER, {
    bone: spine1,
    at: [-0.14, 0.33, 0.01],
    rotation: [0, -20, 0],
    group: "body",
  });
  b.part(new THREE.SphereGeometry(0.005, 6, 4), BRASS, {
    bone: spine1,
    at: [-0.155, 0.33, 0.025],
    group: "body",
  });
  // Left hip: lubricant oil flask
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.05, 8), COPPER, {
    bone: spine1,
    at: [0.14, 0.32, 0.01],
    rotation: [0, 0, -15],
    group: "body",
  });
  b.part(new THREE.CylinderGeometry(0.008, 0.01, 0.014, 6), WOOD, {
    bone: spine1,
    at: [0.145, 0.35, 0.01],
    rotation: [0, 0, -15],
    group: "body",
  });

  // Cross-chest harness straps for the gadget backpack
  for (const s of [1, -1]) {
    const strapPts = catmull([
      [s * 0.09, 0.49, -0.09],
      [s * 0.1, 0.47, 0.04],
      [s * 0.07, 0.4, 0.115],
      [s * 0.1, 0.35, 0.08],
    ]);
    b.sweep(strapPts, 0.012, { bone: spine2, color: DARK_LEATHER, group: "body" });
    // Brass strap adjuster buckle
    b.part(new THREE.BoxGeometry(0.016, 0.02, 0.006), BRASS, {
      bone: spine2,
      at: [s * 0.075, 0.42, 0.114],
      dir: [0, 0, 1],
      group: "body",
    });
  }

  // ---------------------------------------------------------------------------
  // Arms & Articulated Work Gauntlets (Tapered, Characterful Rest Pose)
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulder: [number, number, number] = [s * 0.13, 0.46, 0.01];
    const elbow: [number, number, number] = [s * 0.23, 0.37, 0.02];
    const wrist: [number, number, number] = [s * 0.3, 0.27, 0.07];

    const armChain = b.chain(`arm${side}`, [shoulder, elbow, wrist], {
      parent: spine2,
      names: [`shoulder${side}`, `elbow${side}`],
      role: "arm",
    });

    // Upper arm (tunic sleeve)
    b.sweep(catmull([shoulder, elbow]), (t) => 0.048 * (1 - 0.2 * t), {
      bone: armChain.joints[0],
      color: TUNIC,
      group: `arm${side}`,
    });

    // Rolled sleeve fabric cuff at elbow
    b.part(new THREE.CylinderGeometry(0.044, 0.044, 0.024, 10), TUNIC, {
      bone: armChain.joints[0],
      at: elbow,
      dir: [s * 0.7, -0.6, 0.2],
      group: `arm${side}`,
    });

    // Forearm Gauntlet: gracefully tapered to wrist (radius 0.034 to 0.026)
    b.sweep(catmull([elbow, wrist]), (t) => 0.034 * (1 - 0.25 * t) + 0.004, {
      bone: armChain.joints[1],
      color: TAN_LEATHER,
      group: `arm${side}`,
    });

    // Flared leather wrist cuff
    b.part(new THREE.CylinderGeometry(0.034, 0.03, 0.024, 10), DARK_LEATHER, {
      bone: armChain.joints[1],
      at: wrist,
      dir: [s * 0.5, -0.6, 0.5],
      group: `arm${side}`,
    });

    // Wrist joint for hand
    const handJoint = b.joint(`wrist${side}`, {
      parent: armChain.joints[1],
      at: wrist,
      dir: [s * 0.3, -0.5, 0.7],
      role: "arm",
    });

    // Glove Palm
    const palmCenter = handJoint.local([s * 0.015, 0.024, 0.015]);
    b.part(new THREE.BoxGeometry(0.038, 0.045, 0.022), TAN_LEATHER, {
      bone: handJoint,
      at: palmCenter,
      group: `arm${side}`,
    });

    // Knuckle brass rivet strip
    for (let k = -1; k <= 1; k++) {
      b.part(new THREE.SphereGeometry(0.0038, 6, 4), BRASS, {
        bone: handJoint,
        at: handJoint.local([s * 0.015 + k * 0.012, 0.035, 0.028]),
        group: `arm${side}`,
      });
    }

    // Thumb & 3 stout fingers (separated, natural relaxed rigging grip)
    // Thumb
    const thumb1 = b.joint(`thumb${side}1`, {
      parent: handJoint,
      at: handJoint.local([s * 0.026, 0.015, 0.008]),
      dir: [s * 0.6, 0.2, 0.7],
      role: "digit",
    });
    b.part(new THREE.CylinderGeometry(0.008, 0.007, 0.018, 6), TAN_LEATHER, {
      bone: thumb1,
      at: thumb1.local([0, 0.009, 0]),
      group: `arm${side}`,
    });
    const thumb2 = b.joint(`thumb${side}2`, {
      parent: thumb1,
      at: thumb1.local([0, 0.018, 0]),
      dir: [s * 0.2, 0.4, 0.8],
      role: "digit",
    });
    b.part(new THREE.CylinderGeometry(0.007, 0.005, 0.015, 6), TAN_LEATHER, {
      bone: thumb2,
      at: thumb2.local([0, 0.008, 0]),
      group: `arm${side}`,
    });

    // Fingers
    const fingerNames = ["index", "mid", "pinky"];
    fingerNames.forEach((fname, fidx) => {
      const fx = (fidx - 1) * 0.012;
      const f1 = b.joint(`${fname}${side}1`, {
        parent: handJoint,
        at: handJoint.local([s * 0.015 + fx, 0.042, 0.012]),
        dir: [s * 0.1, -0.6, 0.7],
        role: "digit",
      });
      b.part(new THREE.CylinderGeometry(0.0075, 0.0065, 0.02, 6), TAN_LEATHER, {
        bone: f1,
        at: f1.local([0, 0.01, 0]),
        group: `arm${side}`,
      });

      const f2 = b.joint(`${fname}${side}2`, {
        parent: f1,
        at: f1.local([0, 0.02, 0]),
        dir: [s * 0.05, -0.8, 0.4],
        role: "digit",
      });
      b.part(new THREE.CylinderGeometry(0.0065, 0.005, 0.016, 6), TAN_LEATHER, {
        bone: f2,
        at: f2.local([0, 0.008, 0]),
        group: `arm${side}`,
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Gnome Head, Expressive Face & Jeweler's Loupe
  // ---------------------------------------------------------------------------
  // Chubby, rounded head
  b.part(new THREE.SphereGeometry(0.095, 12, 10), GNOME_SKIN, {
    bone: head,
    at: [0, 0.58, 0.03],
    scale: [0.95, 0.95, 0.9],
    group: "head",
  });

  // Big signature bulbous gnome nose
  b.part(new THREE.SphereGeometry(0.032, 10, 8), GNOME_SKIN, {
    bone: head,
    at: [0, 0.57, 0.13],
    scale: [0.95, 0.88, 1.05],
    group: "head",
  });
  // Nostril wings
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.013, 6, 4), GNOME_SKIN, {
      bone: head,
      at: [s * 0.02, 0.56, 0.118],
      group: "head",
    });
  }

  // Rosy chubby cheeks
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 8, 6), GNOME_SKIN, {
      bone: head,
      at: [s * 0.055, 0.55, 0.09],
      scale: [0.9, 0.85, 0.7],
      group: "head",
    });
  }

  // Left Eye: Curious wide eye with SVG iris texture
  b.part(new THREE.SphereGeometry(0.017, 10, 8), "#ffffff", {
    bone: head,
    at: [0.036, 0.6, 0.1],
    group: "head",
  });
  b.part(new THREE.PlaneGeometry(0.028, 0.028), "#ffffff", {
    bone: head,
    at: [0.037, 0.6, 0.116],
    dir: [0.1, 0.05, 0.95],
    axis: "z",
    texture: GNOME_EYE,
    group: "head",
  });

  // Right Eye: Looking through the watchmaker's magnifying loupe!
  b.part(new THREE.SphereGeometry(0.017, 10, 8), "#ffffff", {
    bone: head,
    at: [-0.036, 0.6, 0.1],
    group: "head",
  });
  b.part(new THREE.PlaneGeometry(0.028, 0.028), "#ffffff", {
    bone: head,
    at: [-0.037, 0.6, 0.116],
    dir: [-0.1, 0.05, 0.95],
    axis: "z",
    texture: GNOME_EYE,
    group: "head",
  });

  // Jeweler's Loupe on Right Eye:
  const loupeWire = catmull([
    [-0.065, 0.61, 0.05],
    [-0.052, 0.605, 0.09],
    [-0.037, 0.6, 0.12],
  ]);
  b.sweep(loupeWire, 0.0018, { bone: head, color: BRASS, group: "head" });

  // Brass lens cylinder
  b.part(new THREE.CylinderGeometry(0.017, 0.017, 0.013, 12), BRASS, {
    bone: head,
    at: [-0.037, 0.6, 0.125],
    dir: [-0.1, 0.05, 1],
    group: "head",
  });
  // Luminous cyan magnifying lens
  glow(
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.0025, 10), "#55ffea", {
      bone: head,
      at: [-0.037, 0.6, 0.131],
      dir: [-0.1, 0.05, 1],
      group: "head",
    }),
    0.85,
  );
  // Secondary flip-up lens arm on top
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.005, 8), BRASS, {
    bone: head,
    at: [-0.037, 0.622, 0.125],
    dir: [-0.1, 0.8, 0.4],
    group: "head",
  });

  // Bushy white eyebrows (right brow raised in curious inquiry!)
  for (const s of [1, -1]) {
    const isRight = s < 0;
    const browPts = catmull([
      [s * 0.012, isRight ? 0.63 : 0.62, 0.115],
      [s * 0.04, isRight ? 0.645 : 0.635, 0.108],
      [s * 0.065, isRight ? 0.638 : 0.63, 0.08],
    ]);
    b.sweep(browPts, (t) => 0.013 * (1 - 0.4 * t) + 0.003, {
      bone: head,
      color: BEARD,
      group: "head",
    });
  }

  // Classic pointed gnome ears sticking out sideways
  for (const s of [1, -1]) {
    const earPath = catmull([
      [s * 0.075, 0.57, 0.02],
      [s * 0.105, 0.585, 0.005],
      [s * 0.135, 0.6, -0.015],
    ]);
    b.sweep(earPath, (t) => [0.02 * (1 - t) + 0.004, 0.012 * (1 - t) + 0.002], {
      bone: head,
      color: GNOME_SKIN,
      group: "head",
    });
  }

  // ---------------------------------------------------------------------------
  // Magnificent Sculpted Beard, Walrus Moustache & Jaw
  // ---------------------------------------------------------------------------
  // Curled Walrus Moustache sweeping out under the nose
  for (const s of [1, -1]) {
    const stachePts = catmull([
      [s * 0.004, 0.55, 0.125],
      [s * 0.035, 0.538, 0.133],
      [s * 0.068, 0.505, 0.11],
      [s * 0.084, 0.475, 0.08],
    ]);
    b.sweep(stachePts, (t) => 0.019 * (1 - t) + 0.003, {
      bone: head,
      color: BEARD,
      group: "head",
    });
  }

  // Chin & Lower Mouth on Jaw Bone
  b.part(new THREE.BoxGeometry(0.032, 0.016, 0.016), GNOME_SKIN, {
    bone: jaw,
    at: [0, 0.53, 0.095],
    group: "jaw",
  });

  // Main Beard: broad, layered faceted shape flowing down over the chest
  const beardMain = catmull([
    [0, 0.54, 0.08],
    [0, 0.48, 0.11],
    [0, 0.41, 0.105],
  ]);
  b.sweep(beardMain, (t) => [0.065 * (1 - 0.2 * t), 0.05 * (1 - 0.15 * t)], {
    bone: jaw,
    color: BEARD,
    group: "jaw",
  });

  // Twin braided forks of the beard with brass clasps
  for (const s of [1, -1]) {
    const braidPts = catmull([
      [s * 0.028, 0.43, 0.105],
      [s * 0.036, 0.38, 0.1],
      [s * 0.04, 0.33, 0.088],
    ]);
    b.sweep(braidPts, (t) => 0.025 * (1 - 0.4 * t), {
      bone: jaw,
      color: BEARD,
      group: "jaw",
    });

    // Ornamental brass rings clipping each braid fork
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 10), BRASS, {
      bone: jaw,
      at: [s * 0.038, 0.355, 0.094],
      dir: [s * 0.1, -0.9, 0.2],
      group: "jaw",
    });

    // Tuft emerging below the brass ring
    b.spike([s * 0.039, 0.35, 0.092], [s * 0.041, 0.31, 0.08], 0.042, 0.015, {
      bone: jaw,
      color: BEARD,
      group: "jaw",
    });
  }

  // ---------------------------------------------------------------------------
  // Floppy Felt Gnome Cap & Goggles
  // ---------------------------------------------------------------------------
  // Rolled hat brim sitting comfortably over the brow
  const brimPath = catmull(
    [
      [0.095, 0.62, 0.02],
      [0, 0.63, 0.1],
      [-0.095, 0.62, 0.02],
      [0, 0.61, -0.06],
    ],
    { closed: true },
  );
  b.sweep(brimPath, 0.018, { bone: head, color: HAT_FELT, group: "hat" });

  // Floppy conical crown curving gracefully back and drooping over
  const hatCone = catmull([
    [0, 0.63, 0.01],
    [-0.01, 0.68, 0.0],
    [-0.025, 0.73, -0.025],
    [-0.055, 0.77, -0.065],
    [-0.095, 0.78, -0.11],
    [-0.125, 0.75, -0.14],
    [-0.14, 0.7, -0.15],
  ]);
  b.sweep(hatCone, (t) => 0.092 * Math.pow(1 - t, 0.7) + 0.006, {
    bone: head,
    color: HAT_FELT,
    group: "hat",
  });

  // Brass bell / gear charm at hat tip
  b.part(new THREE.SphereGeometry(0.013, 8, 6), BRASS, {
    bone: head,
    at: [-0.14, 0.685, -0.155],
    group: "hat",
  });

  // Leather hat band
  const bandPath = catmull(
    [
      [0.092, 0.635, 0.02],
      [0, 0.642, 0.095],
      [-0.092, 0.635, 0.02],
      [0, 0.625, -0.05],
    ],
    { closed: true },
  );
  b.sweep(bandPath, 0.01, { bone: head, color: DARK_LEATHER, group: "hat" });

  // Goggles pushed up on the hat brim:
  b.part(new THREE.BoxGeometry(0.04, 0.016, 0.008), DARK_LEATHER, {
    bone: head,
    at: [0, 0.645, 0.1],
    group: "hat",
  });

  for (const s of [1, -1]) {
    // Brass eyecup cylinder
    b.part(new THREE.CylinderGeometry(0.019, 0.017, 0.014, 12), BRASS, {
      bone: head,
      at: [s * 0.035, 0.645, 0.105],
      dir: [s * 0.1, 0.3, 0.95],
      group: "hat",
    });
    // Glowing emerald green lens
    glow(
      b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.0025, 10), "#28df80", {
        bone: head,
        at: [s * 0.037, 0.65, 0.111],
        dir: [s * 0.1, 0.3, 0.95],
        group: "hat",
      }),
      1.15,
    );
  }

  // ---------------------------------------------------------------------------
  // HERO PROP: The Gadget Backpack of Wonders
  // ---------------------------------------------------------------------------
  // 1. Wood Cabinet Body with Corner Brackets
  b.part(new THREE.BoxGeometry(0.2, 0.26, 0.13), WOOD, {
    bone: spine2,
    at: [0, 0.47, -0.15],
    group: "backpack",
  });

  // Corner brass reinforcement brackets (8 corners)
  for (const cx of [1, -1]) {
    for (const cy of [1, -1]) {
      for (const cz of [1, -1]) {
        b.part(new THREE.BoxGeometry(0.02, 0.02, 0.02), BRASS, {
          bone: spine2,
          at: [cx * 0.095, 0.47 + cy * 0.125, -0.15 + cz * 0.06],
          group: "backpack",
        });
      }
    }
  }

  // 2. Steam Pressure Boiler (Cylindrical Copper Tank at Base)
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.2, 12), COPPER, {
    bone: spine2,
    at: [0, 0.365, -0.17],
    dir: [1, 0, 0],
    group: "backpack",
  });
  // Domed copper boiler ends
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.044, 8, 6), COPPER, {
      bone: spine2,
      at: [s * 0.1, 0.365, -0.17],
      scale: [0.4, 1, 1],
      group: "backpack",
    });
    // Brass boiler retention bands
    b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.013, 12), BRASS, {
      bone: spine2,
      at: [s * 0.06, 0.365, -0.17],
      dir: [1, 0, 0],
      group: "backpack",
    });
  }

  // 3. Pressure Gauge (Mounted on side, angled diagonally forward for 3/4 visibility)
  b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.012, 12), BRASS, {
    bone: spine2,
    at: [-0.125, 0.45, -0.14],
    dir: [-0.85, 0.1, 0.5],
    group: "backpack",
  });
  b.part(new THREE.CircleGeometry(0.025, 16), "#ffffff", {
    bone: spine2,
    at: [-0.131, 0.451, -0.136],
    dir: [-0.85, 0.1, 0.5],
    axis: "z",
    texture: gaugeTexture({ red: [75, 135], label: "PSI", needle: 50 }),
    group: "backpack",
  });
  // Copper pipe connecting gauge to boiler
  const gaugePipe = catmull([
    [-0.12, 0.42, -0.14],
    [-0.11, 0.38, -0.15],
    [-0.09, 0.365, -0.165],
  ]);
  b.sweep(gaugePipe, 0.005, { bone: spine2, color: COPPER, group: "backpack" });

  // 4. Exposed Clockwork Gear Train on Backpack Rear
  const packTrain = gearTrain(b, {
    at: [0.03, 0.5, -0.22],
    axis: [0, 0, -1],
    up: [0, 1, 0],
    module: 0.0042,
    spin: "gear",
    bone: spine2,
    group: "backpack",
    gears: [
      { teeth: 18, spokes: 4, color: BRASS },
      { teeth: 10, angle: 55, color: COPPER },
      { teeth: 14, from: 0, angle: -125, spokes: 3, color: BLUED },
      { teeth: 16, on: 1, shift: -0.012, color: TINT.gilt, texture: true },
    ],
  });
  packTrain.spin(18);

  // Brass mounting plate for gear train
  b.part(new THREE.BoxGeometry(0.13, 0.15, 0.01), panelled(BRASS, { size: 0.06 }), {
    bone: spine2,
    at: [0.03, 0.5, -0.218],
    group: "backpack",
  });

  // 5. Arcane Vacuum Tube (Left shoulder: high up, glowing cyan, prominent in front/3/4 views!)
  const flaskBase: [number, number, number] = [-0.075, 0.59, -0.12];
  b.part(new THREE.CylinderGeometry(0.022, 0.026, 0.016, 10), BRASS, {
    bone: spine2,
    at: flaskBase,
    group: "backpack",
  });
  // Outer glass cylinder
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.085, 10), "#d4f7ff", {
    bone: spine2,
    at: [-0.075, 0.64, -0.12],
    group: "backpack",
  });
  // Inner glowing cyan plasma filament!
  glow(
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.065, 8), "#22ebd2", {
      bone: spine2,
      at: [-0.075, 0.64, -0.12],
      group: "backpack",
    }),
    2.0,
  );
  // Stepped brass top cap
  b.part(new THREE.CylinderGeometry(0.022, 0.02, 0.014, 10), BRASS, {
    bone: spine2,
    at: [-0.075, 0.69, -0.12],
    group: "backpack",
  });
  // 4 protective brass cage rods
  for (let i = 0; i < 4; i++) {
    const ang = (i * Math.PI) / 2;
    const rx = -0.075 + 0.022 * Math.cos(ang);
    const rz = -0.12 + 0.022 * Math.sin(ang);
    b.rod([rx, 0.59, rz], [rx, 0.69, rz], 0.0025, BRASS, {
      bone: spine2,
      group: "backpack",
    });
  }

  // 6. Articulated Task Lamp (Right shoulder: reaching forward with glowing golden lens!)
  const lampArm = catmull([
    [0.08, 0.59, -0.12],
    [0.09, 0.64, -0.09],
    [0.085, 0.67, -0.04],
  ]);
  b.sweep(lampArm, 0.004, { bone: spine2, color: BRASS, group: "backpack" });
  // Brass lamp bell/hood facing forward-down
  b.part(new THREE.ConeGeometry(0.022, 0.028, 10), BRASS, {
    bone: spine2,
    at: [0.085, 0.67, -0.03],
    dir: [0.1, -0.4, 0.9],
    group: "backpack",
  });
  // Glowing golden task light lens!
  glow(
    b.part(new THREE.CircleGeometry(0.019, 10), "#ffdf55", {
      bone: spine2,
      at: [0.086, 0.665, -0.018],
      dir: [0.1, -0.4, 0.9],
      axis: "z",
      group: "backpack",
    }),
    1.6,
  );

  // 7. Telescoping Antenna with Copper Spark Coil (Rises high over pack)
  const antennaBase: [number, number, number] = [0.075, 0.6, -0.15];
  b.part(new THREE.CylinderGeometry(0.015, 0.018, 0.016, 8), BRASS, {
    bone: spine2,
    at: antennaBase,
    group: "backpack",
  });
  // Ceramic insulator rod
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.07, 8), "#eae5d8", {
    bone: spine2,
    at: [0.075, 0.645, -0.15],
    group: "backpack",
  });
  // Copper spark coil wrapped around insulator!
  const sparkCoil = coil([0.075, 0.615, -0.15], [0.075, 0.675, -0.15], 0.013, 6);
  b.sweep(sparkCoil, 0.0025, { bone: spine2, color: COPPER, group: "backpack" });

  // Telescoping brass mast extending upward to ~0.82m
  b.rod([0.075, 0.68, -0.15], [0.075, 0.82, -0.15], 0.004, BRASS, {
    bone: spine2,
    group: "backpack",
  });
  // Spherical brass transmitter tip & copper ring
  b.part(new THREE.SphereGeometry(0.011, 8, 6), BRASS, {
    bone: spine2,
    at: [0.075, 0.82, -0.15],
    group: "backpack",
  });
  b.part(new THREE.TorusGeometry(0.019, 0.0025, 6, 12), COPPER, {
    bone: spine2,
    at: [0.075, 0.82, -0.15],
    rotation: [90, 0, 0],
    group: "backpack",
  });

  // 8. Copper Steam Exhaust Chimney & Whistle
  const exhaustPts = catmull([
    [-0.04, 0.4, -0.19],
    [-0.055, 0.48, -0.2],
    [-0.055, 0.58, -0.18],
    [-0.045, 0.67, -0.16],
  ]);
  b.sweep(exhaustPts, 0.009, { bone: spine2, color: COPPER, group: "backpack" });
  // Trumpet whistle bell at top
  b.part(new THREE.ConeGeometry(0.018, 0.024, 10), BRASS, {
    bone: spine2,
    at: [-0.045, 0.685, -0.16],
    group: "backpack",
  });
  // Snug red valve wheel with brass hub on exhaust pipe
  b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.01, 6), BRASS, {
    bone: spine2,
    at: [-0.06, 0.54, -0.19],
    dir: [-1, 0, 0],
    group: "backpack",
  });
  b.part(new THREE.TorusGeometry(0.011, 0.0028, 6, 10), "#b3261e", {
    bone: spine2,
    at: [-0.066, 0.54, -0.19],
    rotation: [0, 90, 0],
    group: "backpack",
  });

  // 9. Rolled Blueprint Scroll Strapped to Pack Top
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.18, 10), "#ffffff", {
    bone: spine2,
    at: [0, 0.615, -0.14],
    dir: [1, 0, 0],
    texture: BLUEPRINT,
    group: "backpack",
  });
  // Leather tie straps holding the blueprint
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.011, 10), DARK_LEATHER, {
      bone: spine2,
      at: [s * 0.055, 0.615, -0.14],
      dir: [1, 0, 0],
      group: "backpack",
    });
  }

  // 10. Oversized Monkey Wrench Hanging in Leather Holster
  const wrenchBase: [number, number, number] = [0.115, 0.46, -0.13];
  b.rod(wrenchBase, [0.115, 0.35, -0.13], 0.005, BLUED, {
    bone: spine2,
    group: "backpack",
  });
  b.part(new THREE.BoxGeometry(0.02, 0.028, 0.013), IRON, {
    bone: spine2,
    at: [0.115, 0.46, -0.13],
    group: "backpack",
  });
  b.part(new THREE.CylinderGeometry(0.0055, 0.0055, 0.013, 8), BRASS, {
    bone: spine2,
    at: [0.115, 0.448, -0.125],
    dir: [0, 1, 0],
    group: "backpack",
  });
  b.part(new THREE.BoxGeometry(0.018, 0.008, 0.024), IRON, {
    bone: spine2,
    at: [0.115, 0.476, -0.118],
    group: "backpack",
  });

  // ---------------------------------------------------------------------------
  // Staged Setting: Workshop Props Strictly at Floor Level (y = 0.000)
  // ---------------------------------------------------------------------------
  // 1. Large discarded brass cog flat on the floor (thickness 0.012, center y = 0.006 -> bottom y = 0.000)
  const floorGear1 = gearGeometry({ teeth: 16, module: 0.0055, spokes: 4, bore: 0.006 });
  b.part(floorGear1, OLD_BRASS, {
    at: [0.22, 0.006, 0.06],
    dir: [0, 1, 0],
    group: "scenery",
  });

  // 2. Smaller copper cog flat beside it (thickness 0.009, center y = 0.0045 -> bottom y = 0.000)
  const floorGear2 = gearGeometry({ teeth: 10, module: 0.0045, bore: 0.004 });
  b.part(floorGear2, COPPER, {
    at: [0.26, 0.0045, 0.1],
    dir: [0, 1, 0],
    group: "scenery",
  });

  // 3. Brass hex nut on the workshop floor (height 0.01, center y = 0.005 -> bottom y = 0.000)
  b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.01, 6), BRASS, {
    at: [0.17, 0.005, -0.05],
    dir: [0, 1, 0],
    group: "scenery",
  });

  // 4. Blueprints schematic scrap lying flat on the floor (1 mm lift to prevent z-fighting)
  b.part(new THREE.PlaneGeometry(0.15, 0.12), "#ffffff", {
    at: [-0.2, 0.001, 0.08],
    dir: [0, 1, 0],
    axis: "z",
    rotation: [0, 20, 0],
    texture: BLUEPRINT,
    group: "scenery",
  });

  return b.root;
}
```