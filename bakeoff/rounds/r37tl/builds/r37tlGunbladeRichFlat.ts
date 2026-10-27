import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "gunblade",
  description:
    "A stylized Final Fantasy-inspired gunblade: a broad faceted sword with a red fuller, mechanical receiver, forward gun barrel, ornate guard, wrapped grip, rivets, and a jewel pommel.",
};

export default function build() {
  const b = createBuilder({ name: "gunblade", detail: 1 });

  const STEEL = "#b9c7d8";
  const STEEL_LIGHT = "#e7f0fa";
  const STEEL_DARK = "#46566b";
  const EDGE = "#202938";
  const BLACK = "#111722";
  const GUNMETAL = "#303b4d";
  const GUNMETAL_LIGHT = "#596a80";
  const RED = "#b52b3c";
  const RED_DARK = "#571522";
  const GOLD = "#e1a846";
  const GOLD_LIGHT = "#ffe18a";
  const LEATHER = "#3a1d20";
  const LEATHER_LIGHT = "#704038";
  const GEM = "#36d9e8";
  const GEM_DARK = "#0e596f";

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      ...options,
    });

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    dir: [number, number, number] = [0, 1, 0],
    segments = 10,
    options: Record<string, unknown> = {},
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius, height, segments, 1, false),
      color,
      {
        at,
        dir,
        ...options,
      },
    );

  const cone = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    dir: [number, number, number] = [0, 1, 0],
    segments = 8,
    options: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.ConeGeometry(radius, height, segments), color, {
      at,
      dir,
      ...options,
    });

  const orb = (
    radius: number,
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 6), color, {
      at,
      ...options,
    });

  // A dark structural silhouette behind the bright blade.
  b.extrude(
    [
      [-0.105, 0.5],
      [-0.185, 0.72],
      [-0.27, 1.22],
      [-0.22, 1.82],
      [-0.13, 2.32],
      [0, 2.72],
      [0.13, 2.32],
      [0.22, 1.82],
      [0.27, 1.22],
      [0.185, 0.72],
      [0.105, 0.5],
    ],
    {
      at: [0, 0, -0.045],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.09,
      bevel: 0.012,
      color: EDGE,
      name: "bladeCore",
      group: "blade",
    },
  );

  // Main silver blade face, deliberately angular and oversized.
  b.extrude(
    [
      [-0.075, 0.55],
      [-0.14, 0.78],
      [-0.215, 1.26],
      [-0.17, 1.8],
      [-0.085, 2.28],
      [0, 2.58],
      [0.085, 2.28],
      [0.17, 1.8],
      [0.215, 1.26],
      [0.14, 0.78],
      [0.075, 0.55],
    ],
    {
      at: [0, 0, 0.015],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.006,
      color: STEEL,
      name: "bladeFace",
      group: "blade",
    },
  );

  // Bright bevel strip along the front edge.
  b.extrude(
    [
      [-0.018, 0.62],
      [-0.055, 1.18],
      [-0.042, 1.78],
      [-0.018, 2.36],
      [0, 2.58],
      [0.018, 2.36],
      [0.042, 1.78],
      [0.055, 1.18],
      [0.018, 0.62],
    ],
    {
      at: [0, 0, 0.044],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      color: STEEL_LIGHT,
      name: "bladeHighlight",
      group: "blade",
    },
  );

  // Deep red magical fuller, split into a long angular inlay and a sharp tip.
  b.extrude(
    [
      [-0.027, 0.72],
      [-0.065, 1.18],
      [-0.052, 1.72],
      [-0.022, 2.16],
      [0, 2.38],
      [0.022, 2.16],
      [0.052, 1.72],
      [0.065, 1.18],
      [0.027, 0.72],
    ],
    {
      at: [0, 0, 0.052],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.009,
      bevel: 0.002,
      color: RED_DARK,
      name: "fullerShadow",
      group: "blade",
    },
  );

  b.extrude(
    [
      [-0.016, 0.78],
      [-0.038, 1.22],
      [-0.028, 1.68],
      [0, 2.14],
      [0.028, 1.68],
      [0.038, 1.22],
      [0.016, 0.78],
    ],
    {
      at: [0, 0, 0.06],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      color: RED,
      name: "fuller",
      group: "blade",
    },
  );

  // Small gold blade studs, making the inlay read as a crafted weapon rather than a plain sword.
  for (const y of [0.82, 1.16, 1.5, 1.84, 2.15]) {
    cylinder(0.018, 0.012, GOLD_LIGHT, [0, y, 0.069], [0, 0, 1], 8, {
      name: `fullerStud${y}`,
      group: "blade",
    });
  }

  // Blade root collar.
  box([0.23, 0.12, 0.14], GUNMETAL, [0, 0.56, 0], {
    name: "bladeRootCollar",
    group: "receiver",
  });
  box([0.15, 0.045, 0.16], GOLD, [0, 0.625, 0.018], {
    name: "bladeRootTrim",
    group: "receiver",
  });

  // Mechanical receiver block around the guard.
  box([0.34, 0.30, 0.28], GUNMETAL, [0, 0.78, 0], {
    name: "receiver",
    group: "receiver",
  });
  box([0.25, 0.19, 0.31], GUNMETAL_LIGHT, [0, 0.82, 0.02], {
    name: "receiverFace",
    group: "receiver",
  });
  box([0.12, 0.08, 0.34], EDGE, [0, 0.92, 0.03], {
    name: "receiverTop",
    group: "receiver",
  });

  // Large oval-ish side plates, made from beveled slabs.
  for (const s of [-1, 1]) {
    b.extrude(
      [
        [-0.11, -0.095],
        [0.11, -0.095],
        [0.14, -0.035],
        [0.12, 0.085],
        [0.04, 0.12],
        [-0.08, 0.09],
        [-0.14, 0.025],
      ],
      {
        at: [s * 0.185, 0.78, 0],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.035,
        bevel: 0.008,
        color: s > 0 ? GOLD : GOLD,
        name: `receiverPlate${s}`,
        group: "ornament",
      },
    );

    orb(0.034, BLACK, [s * 0.205, 0.78, 0], {
      name: `receiverRivet${s}`,
      group: "ornament",
    });
    orb(0.017, GOLD_LIGHT, [s * 0.224, 0.78, 0.012], {
      name: `receiverRivetHighlight${s}`,
      group: "ornament",
    });
  }

  // Crossguard: broad gold wings, dark underframe, and end caps.
  box([0.92, 0.09, 0.14], EDGE, [0, 0.61, 0], {
    name: "guardUnderframe",
    group: "guard",
  });
  box([0.82, 0.065, 0.17], GOLD, [0, 0.65, 0.015], {
    name: "guardGoldBar",
    group: "guard",
  });

  for (const s of [-1, 1]) {
    b.extrude(
      [
        [0, 0],
        [0.22, 0.015],
        [0.42, 0.09],
        [0.47, 0.17],
        [0.34, 0.15],
        [0.16, 0.075],
      ],
      {
        at: [s * 0.03, 0.59, 0],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.13,
        bevel: 0.01,
        color: GOLD_LIGHT,
        name: `guardWing${s}`,
        group: "guard",
      },
    );

    cylinder(0.062, 0.2, GOLD, [s * 0.445, 0.69, 0], [0, 1, 0], 8, {
      name: `guardEnd${s}`,
      group: "guard",
    });
    orb(0.044, RED, [s * 0.445, 0.79, 0], {
      name: `guardGem${s}`,
      group: "guard",
    });
  }

  // Forward gun barrel projecting from the receiver toward the viewer.
  cylinder(0.09, 0.38, BLACK, [0, 0.86, 0.29], [0, 0, 1], 10, {
    name: "barrel",
    group: "gun",
  });
  cylinder(0.115, 0.07, GUNMETAL_LIGHT, [0, 0.86, 0.48], [0, 0, 1], 10, {
    name: "muzzleCollar",
    group: "gun",
  });
  cylinder(0.082, 0.09, EDGE, [0, 0.86, 0.555], [0, 0, 1], 10, {
    name: "muzzle",
    group: "gun",
  });
  cylinder(0.045, 0.094, RED_DARK, [0, 0.86, 0.61], [0, 0, 1], 10, {
    name: "muzzleBore",
    group: "gun",
  });

  // Secondary top-mounted sight / hammer.
  box([0.11, 0.13, 0.12], GUNMETAL_LIGHT, [0, 1.03, 0.08], {
    name: "sightBlock",
    group: "gun",
  });
  box([0.045, 0.14, 0.1], GOLD, [0, 1.13, 0.08], {
    name: "sightFin",
    group: "gun",
  });
  cone(0.045, 0.1, RED, [0, 1.21, 0.08], [0, 1, 0], 6, {
    name: "sightTip",
    group: "gun",
  });

  // Trigger guard and visible trigger.
  b.sweep(
    [
      [-0.105, 0.67, 0.18],
      [-0.13, 0.52, 0.18],
      [0.13, 0.52, 0.18],
      [0.105, 0.67, 0.18],
    ],
    0.018,
    {
      color: EDGE,
      caps: "round",
      section: { ngon: 6 },
      name: "triggerGuard",
      group: "gun",
    },
  );
  cylinder(0.018, 0.12, GOLD, [0, 0.58, 0.19], [0, 0, 1], 7, {
    name: "trigger",
    group: "gun",
  });

  // Chunky wrapped handle below the guard.
  cylinder(0.115, 0.37, BLACK, [0, 0.32, 0], [0, 1, 0], 10, {
    name: "gripCore",
    group: "grip",
  });
  cylinder(0.13, 0.045, GUNMETAL, [0, 0.49, 0], [0, 1, 0], 10, {
    name: "gripTopCollar",
    group: "grip",
  });
  cylinder(0.13, 0.045, GUNMETAL, [0, 0.15, 0], [0, 1, 0], 10, {
    name: "gripBottomCollar",
    group: "grip",
  });

  // Leather wrap bands, alternating angle to create a readable spiral-like grip.
  for (let i = 0; i < 6; i++) {
    const y = 0.19 + i * 0.052;
    cylinder(0.125, 0.019, i % 2 ? LEATHER_LIGHT : LEATHER, [0, y, 0], [0, 1, 0], 10, {
      rotation: [0, 0, (i % 2 ? 1 : -1) * 8],
      name: `gripWrap${i}`,
      group: "grip",
    });
  }

  // Pommel, with a turquoise magical stone.
  cylinder(0.15, 0.07, GOLD, [0, 0.08, 0], [0, 1, 0], 10, {
    name: "pommelCollar",
    group: "pommel",
  });
  b.lathe(
    [
      [0, -0.12],
      [0.105, -0.12],
      [0.145, -0.075],
      [0.13, 0.02],
      [0.08, 0.1],
      [0, 0.12],
    ],
    {
      at: [0, -0.02, 0],
      axis: [0, 1, 0],
      segments: 10,
      color: GUNMETAL,
      name: "pommel",
      group: "pommel",
    },
  );
  orb(0.075, GEM_DARK, [0, -0.035, 0.115], {
    name: "pommelGemShadow",
    group: "pommel",
  });
  orb(0.052, GEM, [0, -0.035, 0.157], {
    name: "pommelGem",
    group: "pommel",
  });

  // Decorative gold spine studs on the receiver and guard.
  for (const x of [-0.24, 0.24]) {
    orb(0.025, GOLD_LIGHT, [x, 0.65, 0.095], {
      name: `guardStud${x}`,
      group: "ornament",
    });
  }

  // A small side ejection port gives the weapon a distinctly gun-like identity.
  box([0.06, 0.09, 0.012], RED_DARK, [0.19, 0.88, 0.148], {
    name: "ejectionPort",
    group: "gun",
  });
  box([0.025, 0.045, 0.018], GOLD, [0.22, 0.88, 0.157], {
    name: "ejectionPortTrim",
    group: "gun",
  });

  return b.root;
}
