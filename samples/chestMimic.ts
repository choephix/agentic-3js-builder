import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { grain, mottle, spots } from "../src/paint";
import { catmull } from "../src/path";

export const meta = {
  name: "Chest Mimic",
  builtBy: "Gemini 3.8 Flash",
  description:
    "The classic dungeon-crawler chest mimic: an iron-banded wooden treasure chest (0.88 m wide) that is really an ambush predator. Its gaping lid is its upper jaw and the chest body its lower jaw, bristling with jagged needle fangs; a fleshy muscular tongue lolls forward spilling a hoard of glittering gold coins and cut gemstones; baleful monster eyes peer from the wooden planks; and six jointed crab-like limbs carry it across dungeon flagstones.",
};

export default function build() {
  const b = createBuilder({ name: "chestMimic" });

  // ---------------------------------------------------------------------------
  // Colour Palette & Procedural Paints
  // ---------------------------------------------------------------------------
  // Rich warm wood planks
  const WOOD_LIGHT = "#6b4226";
  const WOOD_DARK = "#452814";
  const woodPaint = grain(WOOD_LIGHT, WOOD_DARK, { size: 0.04, axis: [1, 0, 0], seed: 101 });

  // Forged iron: clean dark wrought iron with subtle surface texture
  const IRON_BASE = "#25282f";
  const IRON_RUST = "#32363e";
  const ironPaint = mottle(IRON_BASE, IRON_RUST, { size: 0.06, contrast: 0.5, seed: 202 });
  const IRON_STUD = "#68707c";

  // Deep fleshy throat cavity (dark reddish maroon)
  const GUM_DARK = "#480e18";
  const GUM_FLESH = "#701624";
  const gumPaint = mottle(GUM_DARK, GUM_FLESH, { size: 0.03, seed: 303 });

  // Wet textured monster tongue
  const TONGUE_BASE = "#c42a42";
  const TONGUE_SPOT = "#e84a64";
  const tonguePaint = spots(TONGUE_BASE, TONGUE_SPOT, { size: 0.02, amount: 0.45, seed: 404 });

  // Discoloured predatory fangs
  const TEETH_IVORY = "#f5f0dc";
  const TEETH_DIRT = "#baa882";
  const teethPaint = mottle(TEETH_IVORY, TEETH_DIRT, { size: 0.015, seed: 505 });

  // Chitinous monster claws/tentacles
  const CLAW_BASE = "#301322";
  const CLAW_TIP = "#701e40";
  const clawPaint = mottle(CLAW_BASE, CLAW_TIP, { size: 0.035, seed: 606 });

  // Baleful glowing eyes
  const EYE_SCLERA = "#ffffca";
  const EYE_IRIS = "#c21818";
  const EYE_PUPIL = "#0a0305";

  // Bright lustrous treasure lure
  const GOLD_1 = "#ffd700";
  const GOLD_2 = "#e6b800";
  const GEM_RUBY = "#e60033";
  const GEM_SAPPHIRE = "#0055d4";
  const GEM_EMERALD = "#00a844";
  const GEM_AMETHYST = "#9933cc";
  const GEM_DIAMOND = "#e0f7fa";

  // ---------------------------------------------------------------------------
  // Skeleton Root & Base Coordinates
  // ---------------------------------------------------------------------------
  const BODY_Y = 0.34;
  const body = b.joint("body", { at: [0, BODY_Y, 0], role: "spine" });

  // ---------------------------------------------------------------------------
  // 1. Legs / Tentacles (6 articulated jointed scuttling limbs: FL, ML, BL, FR, MR, BR)
  // ---------------------------------------------------------------------------
  const legConfigs = [
    { name: "legFL", side: 1, z: 0.18, x: 0.43, footZ: 0.26 },
    { name: "legML", side: 1, z: 0.00, x: 0.44, footZ: 0.00 },
    { name: "legBL", side: 1, z: -0.18, x: 0.43, footZ: -0.26 },
    { name: "legFR", side: -1, z: 0.18, x: -0.43, footZ: 0.26 },
    { name: "legMR", side: -1, z: 0.00, x: -0.44, footZ: 0.00 },
    { name: "legBR", side: -1, z: -0.18, x: -0.43, footZ: -0.26 },
  ];

  for (const cfg of legConfigs) {
    const hipPt: [number, number, number] = [cfg.x, 0.22, cfg.z];
    const footR = 0.012; // claw tip radius
    const footPt: [number, number, number] = [
      cfg.x + cfg.side * 0.18,
      footR, // exactly touches floor at foot radius
      cfg.footZ,
    ];
    const kneeBend: [number, number, number] = [cfg.side * 0.65, 0.7, cfg.z * 0.3];

    // 2-segment limb: upper segment 0.18m, lower segment 0.23m
    const pts = limb(hipPt, footPt, [0.18, 0.23], kneeBend);
    const legChain = b.chain(cfg.name, pts, {
      parent: body,
      role: "leg",
      names: [`${cfg.name}_hip`, `${cfg.name}_knee`],
      contact: [footPt[0], 0, footPt[2]],
    });

    b.sweep(legChain, (t) => [0.038 * (1 - 0.68 * t), 0.038 * (1 - 0.68 * t)], {
      color: clawPaint,
      sides: 6,
      caps: { start: "round", end: "point" },
    });
  }

  // ---------------------------------------------------------------------------
  // 2. Chest Lower Box (Lower Jaw)
  // ---------------------------------------------------------------------------
  const WALL_T = 0.045; // plank thickness
  const BOX_W = 0.88;
  const BOX_D = 0.54;
  const BOX_H = 0.28;
  const BOX_CY = 0.34; // Y: 0.20 to 0.48

  // Bottom floor plank
  b.part(new THREE.BoxGeometry(BOX_W, WALL_T, BOX_D), woodPaint, {
    bone: body,
    at: [0, 0.20 + WALL_T / 2, 0],
    group: "chest",
  });
  // Back wall
  b.part(new THREE.BoxGeometry(BOX_W, BOX_H - WALL_T, WALL_T), woodPaint, {
    bone: body,
    at: [0, BOX_CY + WALL_T / 2, -BOX_D / 2 + WALL_T / 2],
    group: "chest",
  });
  // Front wall
  b.part(new THREE.BoxGeometry(BOX_W, BOX_H - WALL_T, WALL_T), woodPaint, {
    bone: body,
    at: [0, BOX_CY + WALL_T / 2, BOX_D / 2 - WALL_T / 2],
    group: "chest",
  });
  // Left wall (+X)
  b.part(new THREE.BoxGeometry(WALL_T, BOX_H - WALL_T, BOX_D - 2 * WALL_T), woodPaint, {
    bone: body,
    at: [BOX_W / 2 - WALL_T / 2, BOX_CY + WALL_T / 2, 0],
    group: "chest",
  });
  // Right wall (-X)
  b.part(new THREE.BoxGeometry(WALL_T, BOX_H - WALL_T, BOX_D - 2 * WALL_T), woodPaint, {
    bone: body,
    at: [-BOX_W / 2 + WALL_T / 2, BOX_CY + WALL_T / 2, 0],
    group: "chest",
  });

  // Mouth fleshy gullet filling bottom cavity
  b.part(new THREE.BoxGeometry(BOX_W - 2 * WALL_T, 0.14, BOX_D - 2 * WALL_T), gumPaint, {
    bone: body,
    at: [0, 0.29, 0],
    group: "mouth",
  });

  // Iron vertical bands on base
  const bandW = 0.055;
  for (const bx of [-0.42, -0.21, 0.21, 0.42]) {
    // Front band
    b.part(new THREE.BoxGeometry(bandW, BOX_H + 0.005, 0.015), ironPaint, {
      bone: body,
      at: [bx, BOX_CY + WALL_T / 2, BOX_D / 2 + 0.005],
      group: "chest",
    });
    // Back band
    b.part(new THREE.BoxGeometry(bandW, BOX_H + 0.005, 0.015), ironPaint, {
      bone: body,
      at: [bx, BOX_CY + WALL_T / 2, -BOX_D / 2 - 0.005],
      group: "chest",
    });
  }
  // Bottom horizontal rim bands
  b.part(new THREE.BoxGeometry(BOX_W + 0.015, 0.045, BOX_D + 0.015), ironPaint, {
    bone: body,
    at: [0, 0.20 + 0.022, 0],
    group: "chest",
  });
  // Top rim horizontal iron bands (lower jaw lip)
  b.part(new THREE.BoxGeometry(BOX_W + 0.015, 0.035, BOX_D + 0.015), ironPaint, {
    bone: body,
    at: [0, 0.48 - 0.015, 0],
    group: "chest",
  });

  // Corner bracket iron angles on base
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      b.part(new THREE.BoxGeometry(0.06, BOX_H + 0.008, 0.06), ironPaint, {
        bone: body,
        at: [sx * (BOX_W / 2 - 0.02), BOX_CY + WALL_T / 2, sz * (BOX_D / 2 - 0.02)],
        group: "chest",
      });
    }
  }

  // Iron rivets / studs on base bands
  const rivetGeo = new THREE.SphereGeometry(0.012, 6, 4);
  for (const bx of [-0.42, -0.21, 0.21, 0.42]) {
    for (const ry of [0.24, 0.35, 0.46]) {
      b.part(rivetGeo, IRON_STUD, {
        bone: body,
        at: [bx, ry, BOX_D / 2 + 0.014],
        scale: [1, 1, 0.5],
        group: "chest",
      });
      b.part(rivetGeo, IRON_STUD, {
        bone: body,
        at: [bx, ry, -BOX_D / 2 - 0.014],
        scale: [1, 1, 0.5],
        group: "chest",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Chest Lid (Upper Jaw) & Monster Eyes
  // ---------------------------------------------------------------------------
  // Hinge joint at the top back of the base: y = 0.48, z = -0.27
  const lid = b.joint("lid", {
    parent: body,
    at: [0, 0.48, -0.27],
    role: "jaw",
  });

  // Lid barrel dimensions: 0.89m long (along X), radius 0.27m
  const LID_R = 0.27;
  const LID_LEN = 0.89;

  // Outer arched lid wooden barrel
  b.part(new THREE.CylinderGeometry(LID_R, LID_R, LID_LEN, 14, 1, false, 0, Math.PI), woodPaint, {
    bone: lid,
    at: [0, 0.48, 0],
    rotation: [0, 0, 90],
    group: "lid",
  });
  // Inner fleshy ceiling of upper jaw (inside lid)
  b.part(
    new THREE.CylinderGeometry(LID_R - 0.04, LID_R - 0.04, LID_LEN - 0.08, 12, 1, false, 0, Math.PI),
    gumPaint,
    {
      bone: lid,
      at: [0, 0.48, 0],
      rotation: [0, 0, 90],
      group: "mouth",
    },
  );

  // Lid arched end-caps (left and right wood semicircles)
  for (const s of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(LID_R, LID_R, 0.03, 14, 1, false, 0, Math.PI), woodPaint, {
      bone: lid,
      at: [s * (LID_LEN / 2 - 0.015), 0.48, 0],
      rotation: [0, 0, 90],
      group: "lid",
    });
  }

  // Lid arched iron bands
  const LID_BAND_W = 0.055;
  for (const bx of [-0.42, -0.21, 0.21, 0.42]) {
    b.part(
      new THREE.CylinderGeometry(LID_R + 0.008, LID_R + 0.008, LID_BAND_W, 14, 1, false, 0, Math.PI),
      ironPaint,
      {
        bone: lid,
        at: [bx, 0.48, 0],
        rotation: [0, 0, 90],
        group: "lid",
      },
    );
  }

  // Lid lower rim band
  b.part(new THREE.BoxGeometry(LID_LEN + 0.02, 0.035, BOX_D + 0.015), ironPaint, {
    bone: lid,
    at: [0, 0.485, 0],
    group: "lid",
  });

  // Central lock plate on lid front
  b.part(new THREE.BoxGeometry(0.12, 0.14, 0.025), ironPaint, {
    bone: lid,
    at: [0, 0.50, 0.28],
    group: "lid",
  });
  // Keyhole
  b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.035, 8), "#060606", {
    bone: lid,
    at: [0, 0.50, 0.285],
    rotation: [90, 0, 0],
    group: "lid",
  });
  // Lock hasp staple ring
  b.part(new THREE.TorusGeometry(0.025, 0.008, 4, 8), IRON_STUD, {
    bone: lid,
    at: [0, 0.46, 0.282],
    group: "lid",
  });

  // Baleful monster eyes peering from lid:
  // 1. Big dominant eye peering out from a knot hole in the wood above the lock plate
  const eyeCenter = b.joint("eyeCenter", {
    parent: lid,
    at: [0, 0.63, 0.23],
    role: "head",
  });
  // Eyeball (deep set inside the wood)
  b.part(new THREE.SphereGeometry(0.054, 8, 6), EYE_SCLERA, {
    bone: eyeCenter,
    at: [0, 0.63, 0.23],
    group: "eye",
  });
  // Iris
  b.part(new THREE.SphereGeometry(0.034, 8, 6), EYE_IRIS, {
    bone: eyeCenter,
    at: [0, 0.63, 0.262],
    scale: [1, 1, 0.3],
    group: "eye",
  });
  // Vertical slit predatory pupil
  b.part(new THREE.BoxGeometry(0.01, 0.044, 0.02), EYE_PUPIL, {
    bone: eyeCenter,
    at: [0, 0.63, 0.272],
    group: "eye",
  });
  // Wood knot surround / eyelid collar carved flush with the lid curvature
  b.part(new THREE.TorusGeometry(0.056, 0.016, 6, 14), WOOD_DARK, {
    bone: eyeCenter,
    at: [0, 0.63, 0.25],
    rotation: [32, 0, 0],
    group: "eye",
  });

  // 2. Secondary side eyes peering through planks
  for (const s of [-1, 1]) {
    const eyeSide = b.joint(`eye_${s > 0 ? "L" : "R"}`, {
      parent: lid,
      at: [s * 0.28, 0.58, 0.23],
      role: "head",
    });
    b.part(new THREE.SphereGeometry(0.034, 8, 6), EYE_SCLERA, {
      bone: eyeSide,
      at: [s * 0.28, 0.58, 0.22],
      group: "eye",
    });
    b.part(new THREE.SphereGeometry(0.020, 6, 4), EYE_IRIS, {
      bone: eyeSide,
      at: [s * 0.28, 0.58, 0.245],
      scale: [1, 1, 0.3],
      group: "eye",
    });
    b.part(new THREE.BoxGeometry(0.007, 0.026, 0.015), EYE_PUPIL, {
      bone: eyeSide,
      at: [s * 0.28, 0.58, 0.252],
      group: "eye",
    });
    // Wood knot bezel around side eyes
    b.part(new THREE.TorusGeometry(0.036, 0.012, 6, 12), WOOD_DARK, {
      bone: eyeSide,
      at: [s * 0.28, 0.58, 0.235],
      rotation: [32, 0, 0],
      group: "eye",
    });
  }

  // ---------------------------------------------------------------------------
  // 4. Jagged Fangs & Needle Teeth (Lower & Upper Jaws)
  // ---------------------------------------------------------------------------
  // Lower jaw teeth (facing up from body rim, height 0.48)
  const lowerToothX = [
    -0.38, -0.32, -0.26, -0.20, -0.14, -0.08, -0.02, 0.04, 0.10, 0.16, 0.22, 0.28, 0.34, 0.40,
  ];
  const tr = rng(777);
  for (const x of lowerToothX) {
    const h = 0.055 + 0.035 * tr();
    const rBase = 0.014 + 0.006 * tr();
    const leanZ = (tr() - 0.5) * 15;
    const leanX = (tr() - 0.5) * 10;
    b.part(new THREE.ConeGeometry(rBase, h, 5), teethPaint, {
      bone: body,
      at: [x, 0.48 + h / 2, 0.245],
      rotation: [leanZ, 0, leanX],
      group: "teeth",
    });
  }
  // Lower side teeth
  for (const z of [-0.18, -0.10, -0.02, 0.06, 0.14]) {
    for (const s of [-1, 1]) {
      const h = 0.048 + 0.03 * tr();
      const rBase = 0.013 + 0.005 * tr();
      b.part(new THREE.ConeGeometry(rBase, h, 5), teethPaint, {
        bone: body,
        at: [s * 0.41, 0.48 + h / 2, z],
        rotation: [(tr() - 0.5) * 10, 0, -s * (12 + 10 * tr())],
        group: "teeth",
      });
    }
  }

  // Upper jaw teeth (facing down from lid rim, height 0.48)
  for (const x of lowerToothX) {
    const h = 0.06 + 0.04 * tr();
    const rBase = 0.015 + 0.006 * tr();
    const leanZ = 180 + (tr() - 0.5) * 20;
    const leanX = (tr() - 0.5) * 12;
    b.part(new THREE.ConeGeometry(rBase, h, 5), teethPaint, {
      bone: lid,
      at: [x, 0.48 - h / 2, 0.245],
      rotation: [leanZ, 0, leanX],
      group: "teeth",
    });
  }
  // Upper side teeth
  for (const z of [-0.18, -0.10, -0.02, 0.06, 0.14]) {
    for (const s of [-1, 1]) {
      const h = 0.05 + 0.03 * tr();
      const rBase = 0.014 + 0.005 * tr();
      b.part(new THREE.ConeGeometry(rBase, h, 5), teethPaint, {
        bone: lid,
        at: [s * 0.41, 0.48 - h / 2, z],
        rotation: [(tr() - 0.5) * 10, 0, 180 + s * (12 + 10 * tr())],
        group: "teeth",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 5. Articulated Muscular Tongue (Tentacle Chain)
  // ---------------------------------------------------------------------------
  // Emerges from throat, crests over front rim, lolls down and curls
  const tonguePts: [number, number, number][] = [
    [-0.02, 0.35, -0.16],
    [0.00, 0.39, 0.04],
    [0.02, 0.485, 0.25], // crests over front lip at Y=0.485
    [0.06, 0.44, 0.37],
    [0.10, 0.32, 0.45],
    [0.15, 0.16, 0.48], // lolling downward toward the ground
  ];
  const tongueCurve = catmull(tonguePts);
  const tongueChain = b.chain("tongue", tongueCurve, {
    parent: body,
    count: 5,
    role: "tentacle",
    names: (i) => `tongue_${i + 1}`,
  });

  b.sweep(tongueChain, (t) => [0.075 * (1 - 0.55 * t), 0.022 * (1 - 0.5 * t)], {
    color: tonguePaint,
    sides: 8,
    caps: { start: "round", end: "point" },
  });

  // ---------------------------------------------------------------------------
  // 6. Treasure Lure: Layered Gold Coin Clusters & Sparking Cut Gems
  // ---------------------------------------------------------------------------
  // A dense bed of gleaming coins filling the interior mouth cavity and spilling onto the lip
  const coinR = rng(888);
  const coinGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.007, 8);

  for (let i = 0; i < 95; i++) {
    const cx = (coinR() - 0.5) * 0.68;
    const cz = -0.18 + coinR() * 0.42;
    // Raised surface height: from 0.40 at back to 0.47 near front lip
    const baseH = 0.40 + 0.07 * ((cz + 0.18) / 0.42);
    const cy = baseH + coinR() * 0.035;
    const rx = (coinR() - 0.5) * 35;
    const ry = coinR() * 360;
    const rz = (coinR() - 0.5) * 35;
    b.part(coinGeo, coinR() > 0.4 ? GOLD_1 : GOLD_2, {
      bone: body,
      at: [cx, cy, cz],
      rotation: [rx, ry, rz],
      group: "gold",
    });
  }

  // Sparkling cut gemstones resting atop coin piles
  const gemGeos = [
    new THREE.OctahedronGeometry(0.032),
    new THREE.IcosahedronGeometry(0.028),
    new THREE.OctahedronGeometry(0.038),
  ];
  const gemColours = [GEM_RUBY, GEM_SAPPHIRE, GEM_EMERALD, GEM_AMETHYST, GEM_DIAMOND];
  for (let i = 0; i < 16; i++) {
    const gx = (coinR() - 0.5) * 0.58;
    const gz = -0.14 + coinR() * 0.38;
    const gy = 0.43 + 0.06 * ((gz + 0.14) / 0.38) + coinR() * 0.04;
    b.part(gemGeos[i % gemGeos.length], gemColours[i % gemColours.length], {
      bone: body,
      at: [gx, gy, gz],
      rotation: [coinR() * 180, coinR() * 180, coinR() * 180],
      group: "gold",
    });
  }

  // ---------------------------------------------------------------------------
  // 7. Posing
  // ---------------------------------------------------------------------------
  // Rotate the lid jaw open about its back hinge axis (-X in model space lifts front)
  // 36 degrees opens the mouth wide enough to reveal teeth, tongue, eyes, and treasure!
  b.pose(lid, { axis: [-1, 0, 0], deg: 36 });

  return b.root;
}
