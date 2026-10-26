import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { cel, furEdge, INK, animeEye } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";
import { svg } from "../../../../src/index";

export const meta = {
  name: "Gunblade",
  description:
    "A stylized Final Fantasy-inspired gunblade: a broad engraved greatsword fused to a revolver mechanism, with a dramatic guard, glowing runes, and a heavy mechanical grip.",
};

export default function build() {
  const b = createBuilder({ name: "gunblade", detail: 1 });

  const INK_METAL = metal("iron", { tarnish: 0.35, polish: 0.18, size: 0.08, seed: 7 });
  const DARK_STEEL = metal("blued", { tarnish: 0.2, polish: 0.32, size: 0.06, seed: 9 });
  const SILVER = metal("steel", { polish: 0.8, tarnish: 0.08, size: 0.045, seed: 11 });
  const BRASS = metal("brass", { polish: 0.7, tarnish: 0.15, size: 0.05, seed: 13 });
  const OLD_BRASS = metal("bronze", { tarnish: 0.65, verdigris: 0.28, polish: 0.15, size: 0.06, seed: 15 });

  const STEEL = cel("#66748b", "#242c42");
  const EDGE = cel("#dbeaff", "#687a9d");
  const BLACK = cel("#191725", "#080912");
  const LEATHER = cel("#4e2029", "#20101c");
  const RUBY = cel("#e74358", "#64152d");
  const RUNE = "#59d9ff";

  // Skeleton first: one root weapon bone, with a recognizable hinged trigger assembly.
  const gripBone = b.joint("grip", {
    at: [0, 0.48, -0.06],
    dir: [0, 1, 0],
    role: "spine",
    group: "weapon",
  });

  const receiverBone = b.joint("receiver", {
    parent: gripBone,
    at: [0, 0.92, 0.02],
    dir: [0, 0.08, 1],
    role: "hinge",
    group: "weapon",
  });

  const triggerBone = b.joint("trigger", {
    parent: receiverBone,
    at: [0, 0.79, 0.12],
    dir: [0, -1, 0],
    role: "hinge",
    group: "weapon",
  });

  // Main blade: broad, angular, oversized, and unmistakably sword-like.
  const blade = b.extrude(
    [
      [0.00, -0.14],
      [0.10, -0.14],
      [0.16, -0.05],
      [0.42, -0.01],
      [1.23, 0.06],
      [1.52, 0.17],
      [1.68, 0.30, "sharp"],
      [1.48, 0.34],
      [1.10, 0.28],
      [0.42, 0.22],
      [0.15, 0.16],
      [0.00, 0.08],
    ],
    {
      at: [0, 1.02, 0.12],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.11, 0.045],
      bevel: 0.018,
      smoothing: 0,
      color: panelled(DARK_STEEL, { size: 0.22, aspect: 0.55, rivets: 0.08 }),
      bone: receiverBone,
      name: "heroBlade",
      group: "blade",
    },
  );

  // Bright cutting edge and a raised central fuller.
  b.extrude(
    [
      [0.04, 0.035],
      [0.38, 0.075],
      [1.44, 0.19],
      [1.60, 0.28],
      [1.44, 0.30],
      [0.38, 0.17],
      [0.04, 0.13],
    ],
    {
      at: [0.066, 1.02, 0.12],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.004,
      color: EDGE,
      bone: receiverBone,
      name: "bladeEdge",
      group: "blade",
    },
  );

  b.extrude(
    [
      [0.18, -0.025],
      [0.43, 0.015],
      [1.35, 0.13],
      [1.50, 0.21],
      [1.34, 0.22],
      [0.42, 0.11],
      [0.18, 0.075],
    ],
    {
      at: [0.072, 1.02, 0.12],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.01,
      bevel: 0.002,
      color: INK_METAL,
      bone: receiverBone,
      name: "bladeFuller",
      group: "blade",
    },
  );

  // Angular ricasso and gun receiver.
  b.part(
    new THREE.BoxGeometry(0.24, 0.24, 0.42),
    panelled(INK_METAL, { size: 0.12, rivets: 0.045 }),
    {
      bone: receiverBone,
      at: [0, 0.92, 0.02],
      name: "receiverBlock",
      group: "receiver",
    },
  );

  b.part(new THREE.BoxGeometry(0.30, 0.08, 0.31), BRASS, {
    bone: receiverBone,
    at: [0, 1.085, 0.02],
    name: "receiverTopRail",
    group: "receiver",
  });

  b.part(new THREE.BoxGeometry(0.34, 0.055, 0.46), SILVER, {
    bone: receiverBone,
    at: [0, 0.80, 0.04],
    name: "receiverLowerPlate",
    group: "receiver",
  });

  // Revolver cylinder, oriented across the weapon so its chambers read from the side.
  b.part(
    new THREE.CylinderGeometry(0.145, 0.145, 0.25, 12, 1),
    DARK_STEEL,
    {
      bone: receiverBone,
      at: [0, 0.91, 0.16],
      dir: [1, 0, 0],
      name: "revolverCylinder",
      group: "mechanism",
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.105, 0.105, 0.27, 12, 1),
    BRASS,
    {
      bone: receiverBone,
      at: [0, 0.91, 0.165],
      dir: [1, 0, 0],
      name: "cylinderCore",
      group: "mechanism",
    },
  );

  // Six chamber mouths on the visible left side.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const y = 0.91 + Math.cos(a) * 0.085;
    const z = 0.16 + Math.sin(a) * 0.085;
    b.part(
      new THREE.CylinderGeometry(0.026, 0.026, 0.014, 8),
      BLACK,
      {
        bone: receiverBone,
        at: [0.137, y, z],
        dir: [1, 0, 0],
        name: `chamber${i}`,
        group: "mechanism",
      },
    );
    b.part(new THREE.SphereGeometry(0.011, 6, 4), BRASS, {
      bone: receiverBone,
      at: [0.147, y, z],
      name: `chamberRivet${i}`,
      group: "mechanism",
    });
  }

  // Blade-mounted gun barrel, terminating in a muzzle crown.
  b.rod([0, 0.99, 0.23], [0, 1.02, 0.77], 0.042, DARK_STEEL, {
    bone: receiverBone,
    section: { ngon: 6 },
    name: "barrel",
    group: "mechanism",
  });

  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.11, 8), BRASS, {
    bone: receiverBone,
    at: [0, 1.02, 0.77],
    dir: [0, 0, 1],
    name: "muzzleCollar",
    group: "mechanism",
  });

  b.part(new THREE.CylinderGeometry(0.057, 0.057, 0.13, 8), BLACK, {
    bone: receiverBone,
    at: [0, 1.02, 0.85],
    dir: [0, 0, 1],
    name: "muzzleBore",
    group: "mechanism",
  });

  // Dramatic crossguard, with downward quillons and brass end caps.
  b.rod([-0.42, 0.78, 0.09], [0.42, 0.78, 0.09], 0.052, BRASS, {
    bone: receiverBone,
    section: { ngon: 6 },
    name: "crossguard",
    group: "guard",
  });

  for (const s of [-1, 1]) {
    b.rod([s * 0.34, 0.78, 0.09], [s * 0.43, 0.57, 0.04], 0.065, DARK_STEEL, {
      bone: receiverBone,
      section: { ngon: 6 },
      name: s > 0 ? "guardL" : "guardR",
      group: "guard",
    });
    b.part(new THREE.SphereGeometry(0.075, 8, 6), BRASS, {
      bone: receiverBone,
      at: [s * 0.43, 0.57, 0.04],
      name: s > 0 ? "guardCapL" : "guardCapR",
      group: "guard",
    });
  }

  // Trigger loop and trigger.
  b.part(new THREE.TorusGeometry(0.105, 0.018, 6, 12, Math.PI * 1.7), BRASS, {
    bone: receiverBone,
    at: [0, 0.72, 0.10],
    rotation: [90, 0, 0],
    name: "triggerGuard",
    group: "trigger",
  });

  b.rod([0, 0.78, 0.12], [0, 0.67, 0.14], 0.022, RUBY, {
    bone: triggerBone,
    section: { ngon: 6 },
    name: "trigger",
    group: "trigger",
  });

  // Heavy pistol grip, angled slightly backward, with faceted leather wrap.
  b.frustumBox(
    [0, 0.72, -0.02],
    [0, 0.30, -0.16],
    [0.17, 0.17],
    [0.13, 0.14],
    { bone: gripBone, color: LEATHER, name: "gripCore", group: "grip" },
  );

  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    b.rod(
      [-0.145 + t * 0.02, 0.64 - t * 0.075, -0.035 - t * 0.025],
      [0.145 - t * 0.02, 0.64 - t * 0.075, -0.035 - t * 0.025],
      0.012,
      BRASS,
      { bone: gripBone, section: { ngon: 6 }, name: `gripBand${i}`, group: "grip" },
    );
  }

  b.part(new THREE.BoxGeometry(0.24, 0.08, 0.18), DARK_STEEL, {
    bone: gripBone,
    at: [0, 0.27, -0.18],
    name: "pommel",
    group: "grip",
  });

  b.part(new THREE.SphereGeometry(0.09, 8, 6), RUBY, {
    bone: gripBone,
    at: [0, 0.27, -0.285],
    name: "pommelGem",
    group: "grip",
  });

  // Spine studs give the blade a mechanical Final Fantasy silhouette.
  for (let i = 0; i < 7; i++) {
    const z = 0.36 + i * 0.17;
    b.part(new THREE.ConeGeometry(0.025, 0.075, 6), BRASS, {
      bone: receiverBone,
      at: [0, 1.19 + i * 0.012, z],
      dir: [0, 1, 0],
      name: `spineStud${i}`,
      group: "blade",
    });
  }

  // Glowing runic blade-side engraving.
  const rune = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 64">
      <path d="M8 48 L32 16 L50 48 L70 16 L88 48 M112 12 L112 52 M128 32 L164 32 M180 12 L180 52 L208 12 L208 52 M226 48 L246 16"
        fill="none" stroke="#59d9ff" stroke-width="7" stroke-linecap="square" stroke-linejoin="miter"/>
      <path d="M10 54 H246" stroke="#163f6c" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const runePart = b.part(new THREE.PlaneGeometry(0.62, 0.155), "#ffffff", {
    bone: receiverBone,
    at: [0.081, 1.09, 0.78],
    dir: [1, 0, 0],
    axis: "z",
    texture: rune,
    name: "bladeRunes",
    group: "magic",
  });
  glow(runePart, 2.2);

  // Small glowing cartridge indicator.
  const indicator = b.part(new THREE.SphereGeometry(0.027, 8, 5), RUNE, {
    bone: receiverBone,
    at: [0.16, 0.98, 0.06],
    name: "energyIndicator",
    group: "magic",
  });
  glow(indicator, 2.8);

  // Decorative rivets and a signature red crest on the receiver.
  for (const x of [-0.105, 0.105]) {
    b.part(new THREE.SphereGeometry(0.022, 8, 5), BRASS, {
      bone: receiverBone,
      at: [x, 1.04, 0.205],
      name: x > 0 ? "receiverRivetL" : "receiverRivetR",
      group: "receiver",
    });
  }

  b.extrude(
    [
      [0, 0],
      [0.13, 0.04],
      [0.19, 0.15],
      [0.10, 0.13],
      [0.04, 0.25],
      [-0.03, 0.13],
      [-0.12, 0.15],
      [-0.06, 0.04],
    ],
    {
      at: [0.131, 0.89, 0.285],
      x: [0, 1, 0],
      y: [0, 0, 1],
      thickness: 0.012,
      bevel: 0.003,
      color: RUBY,
      bone: receiverBone,
      name: "crimsonCrest",
      group: "ornament",
    },
  );

  // A tiny sight on top of the receiver.
  b.part(new THREE.BoxGeometry(0.045, 0.085, 0.12), BLACK, {
    bone: receiverBone,
    at: [0, 1.16, 0.18],
    name: "rearSight",
    group: "mechanism",
  });

  return b.root;
}
