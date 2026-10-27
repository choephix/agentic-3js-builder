import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Gunblade",
  description:
    "A Final Fantasy-inspired gunblade: an oversized crystal-edged greatsword fused to a brass-and-steel revolver mechanism, with an ornate guard, glowing runes, vents, rivets, and a heavy leather grip.",
};

export default function build() {
  const b = createBuilder({ name: "gunblade", detail: 1 });

  const root = b.joint("weaponRoot", {
    at: [0, 0.02, 0],
    dir: [0, 1, 0],
    role: "spine",
    group: "weapon",
  });

  const STEEL = "#273142";
  const DARK = "#111722";
  const EDGE = "#a9c9d6";
  const SILVER = "#dce9ec";
  const BRASS = "#b77931";
  const GOLD = "#edc367";
  const COPPER = "#9c4b2e";
  const LEATHER = "#34201d";
  const LEATHER_HI = "#65372a";
  const BLUE = "#36bde8";
  const CYAN = "#b8f8ff";
  const RED = "#d94043";
  const INK = "#17101c";

  const brushedSteel = metal("steel", {
    polish: 0.55,
    tarnish: 0.12,
    size: 0.12,
    seed: 11,
  });
  const oldBrass = metal("brass", {
    polish: 0.35,
    tarnish: 0.32,
    verdigris: 0.08,
    size: 0.1,
    seed: 21,
  });
  const darkIron = metal("iron", {
    polish: 0.18,
    tarnish: 0.2,
    size: 0.08,
    seed: 31,
  });
  const platedSteel = panelled(brushedSteel, {
    size: 0.14,
    aspect: 0.75,
    rivets: 0.045,
  });

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    extra: any = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone: root,
      at,
      ...extra,
    });

  const cyl = (
    radius: number,
    length: number,
    at: [number, number, number],
    color: any,
    dir: [number, number, number] = [0, 1, 0],
    segments = 10,
    extra: any = {},
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius, length, segments, 1, false),
      color,
      { bone: root, at, dir, ...extra },
    );

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: any,
    scale?: [number, number, number],
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 6), color, {
      bone: root,
      at,
      scale,
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: any,
  ) => b.rod(a, c, radius, color, { bone: root, sides: 8 });

  // ---------------------------------------------------------------------------
  // Blade: a broad asymmetric gunblade profile with a hooked tip and serrations.
  // ---------------------------------------------------------------------------

  const blade = b.extrude(
    [
      [-0.16, 0],
      [0.16, 0],
      [0.22, 0.12],
      [0.19, 0.62],
      [0.27, 0.78],
      [0.19, 0.88],
      [0.25, 1.02],
      [0.17, 1.12],
      [0.23, 1.3],
      [0.13, 1.48],
      [0.09, 1.7],
      [0.02, 2.02],
      [-0.06, 2.22],
      [-0.17, 2.05],
      [-0.23, 1.78],
      [-0.31, 1.56],
      [-0.25, 1.4],
      [-0.31, 1.24],
      [-0.23, 1.09],
      [-0.29, 0.94],
      [-0.21, 0.78],
      [-0.25, 0.55],
      [-0.2, 0.18],
    ],
    {
      at: [0, 0.78, 0.03],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: [0.075, 0.035],
      bevel: 0.018,
      smoothing: 1,
      color: platedSteel,
      bone: root,
      name: "bladeMain",
      group: "blade",
    },
  );

  const bladeInset = b.extrude(
    [
      [-0.085, 0],
      [0.085, 0],
      [0.13, 0.3],
      [0.1, 0.68],
      [0.16, 0.84],
      [0.1, 1.03],
      [0.13, 1.2],
      [0.065, 1.48],
      [0.02, 1.78],
      [-0.055, 1.48],
      [-0.11, 1.18],
      [-0.08, 0.92],
      [-0.13, 0.7],
      [-0.1, 0.34],
    ],
    {
      at: [0, 0.81, 0.078],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.006,
      smoothing: 1,
      color: DARK,
      bone: root,
      name: "bladeFuller",
      group: "blade",
    },
  );

  const bladeEdge = b.extrude(
    [
      [0, 0],
      [0.075, 0.14],
      [0.12, 0.55],
      [0.15, 0.82],
      [0.08, 1.15],
      [0.07, 1.48],
      [0.015, 1.9],
      [-0.025, 1.48],
      [-0.025, 1.05],
      [-0.07, 0.72],
      [-0.045, 0.3],
    ],
    {
      at: [0.055, 0.83, 0.092],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.009,
      bevel: 0.003,
      smoothing: 0,
      color: EDGE,
      bone: root,
      name: "bladeEdge",
      group: "blade",
    },
  );

  const runeTexture = svg(
    `<svg viewBox="0 0 120 420" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 8 L78 60 L55 104 L82 148 L44 205 L71 252 L50 305 L67 352 L42 412"
        fill="none" stroke="#b8f8ff" stroke-width="9" stroke-linecap="square"/>
      <path d="M43 112 L18 150 L43 187 M65 266 L101 298 L63 330"
        fill="none" stroke="#36bde8" stroke-width="6"/>
      <circle cx="60" cy="205" r="13" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  const rune = b.part(new THREE.PlaneGeometry(0.105, 0.72), CYAN, {
    bone: root,
    at: [0.012, 1.48, 0.103],
    dir: [0, 0, 1],
    axis: "z",
    texture: runeTexture,
    name: "bladeRune",
    group: "magic",
  });
  glow(rune, 2.2);

  // Decorative blade spine studs and small faceted gems.
  for (const y of [1.02, 1.22, 1.43, 1.64, 1.84]) {
    sphere(0.026, [-0.14, y, 0.09], GOLD, [1, 1, 0.35]);
    sphere(0.019, [0.14, y + 0.035, 0.095], BLUE, [1, 1, 0.3]);
  }

  // ---------------------------------------------------------------------------
  // Heavy receiver / firearm body around the base of the blade.
  // ---------------------------------------------------------------------------

  box([0.48, 0.34, 0.23], [0, 0.73, 0.01], platedSteel, {
    name: "receiver",
    group: "firearm",
  });
  box([0.36, 0.18, 0.27], [0, 0.93, 0.015], DARK, {
    name: "upperReceiver",
    group: "firearm",
  });
  box([0.26, 0.1, 0.3], [0, 1.09, 0.02], STEEL, {
    name: "bladeSocket",
    group: "firearm",
  });

  // Receiver side plates.
  for (const s of [-1, 1]) {
    box([0.035, 0.23, 0.27], [s * 0.255, 0.78, 0.02], oldBrass, {
      name: `receiverPlate${s}`,
      group: "ornament",
    });
    for (const y of [0.69, 0.81, 0.9]) {
      sphere(0.022, [s * 0.281, y, 0.02], GOLD, [0.5, 0.5, 0.7]);
    }
  }

  // Revolver cylinder oriented across the weapon, visibly seated in the receiver.
  cyl(0.18, 0.34, [0, 0.76, 0.16], darkIron, [1, 0, 0], 12, {
    name: "rotaryCylinder",
    group: "firearm",
  });
  cyl(0.14, 0.35, [0, 0.76, 0.16], oldBrass, [1, 0, 0], 12, {
    name: "cylinderBand",
    group: "ornament",
  });

  for (const a of [0, 60, 120, 180, 240, 300]) {
    const r = (a * Math.PI) / 180;
    const y = 0.76 + Math.cos(r) * 0.095;
    const z = 0.16 + Math.sin(r) * 0.095;
    cyl(0.019, 0.37, [0, y, z], STEEL, [1, 0, 0], 7, {
      name: `chamber${a}`,
      group: "firearm",
    });
  }

  sphere(0.078, [0, 0.76, 0.16], GOLD, [0.45, 1, 1]);
  cyl(0.052, 0.4, [0, 0.76, 0.16], SILVER, [1, 0, 0], 8, {
    name: "cylinderAxle",
    group: "firearm",
  });

  // Barrel under the blade, with a squared muzzle and vent slots.
  box([0.22, 0.38, 0.2], [0, 0.43, 0.1], darkIron, {
    name: "barrelHousing",
    group: "firearm",
  });
  box([0.14, 0.36, 0.16], [0, 0.28, 0.11], STEEL, {
    name: "barrel",
    group: "firearm",
  });
  box([0.2, 0.08, 0.22], [0, 0.095, 0.11], oldBrass, {
    name: "muzzleCollar",
    group: "ornament",
  });
  box([0.13, 0.07, 0.17], [0, 0.035, 0.11], DARK, {
    name: "muzzle",
    group: "firearm",
  });

  for (const x of [-0.07, 0.07]) {
    box([0.026, 0.15, 0.018], [x, 0.36, 0.214], COPPER, {
      name: `vent${x}`,
      group: "ornament",
    });
  }

  // A bright sight and a triangular front blade.
  box([0.035, 0.18, 0.035], [0, 1.12, 0.12], GOLD, {
    name: "rearSight",
    group: "ornament",
  });
  b.extrude(
    [
      [-0.04, 0],
      [0.04, 0],
      [0.035, 0.12],
      [0, 0.18],
      [-0.035, 0.12],
    ],
    {
      at: [0, 1.1, 0.13],
      x: [1, 0, 0],
      thickness: 0.025,
      bevel: 0.004,
      color: GOLD,
      bone: root,
      name: "frontSight",
      group: "ornament",
    },
  );

  // ---------------------------------------------------------------------------
  // Crossguard: swept wings and a central gem.
  // ---------------------------------------------------------------------------

  b.extrude(
    [
      [-0.06, 0],
      [-0.32, 0.03],
      [-0.53, 0.16],
      [-0.59, 0.28],
      [-0.52, 0.37],
      [-0.4, 0.31],
      [-0.25, 0.18],
      [0, 0.13],
      [0.25, 0.18],
      [0.4, 0.31],
      [0.52, 0.37],
      [0.59, 0.28],
      [0.53, 0.16],
      [0.32, 0.03],
      [0.06, 0],
    ],
    {
      at: [0, 0.29, 0.16],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.11,
      bevel: 0.016,
      smoothing: 1,
      color: oldBrass,
      bone: root,
      name: "crossguard",
      group: "guard",
    },
  );

  box([0.14, 0.18, 0.14], [0, 0.28, 0.17], GOLD, {
    name: "guardSocket",
    group: "guard",
  });
  sphere(0.095, [0, 0.3, 0.25], BLUE, [1, 1, 0.65]);
  glow(
    b.part(new THREE.SphereGeometry(0.058, 8, 6), CYAN, {
      bone: root,
      at: [0, 0.3, 0.31],
      name: "guardGem",
      group: "magic",
    }),
    1.8,
  );

  for (const s of [-1, 1]) {
    cyl(0.027, 0.34, [s * 0.38, 0.29, 0.2], GOLD, [1, 0, 0], 8, {
      name: `guardRivetBar${s}`,
      group: "guard",
    });
    sphere(0.045, [s * 0.52, 0.3, 0.2], RED, [1, 1, 0.65]);
  }

  // ---------------------------------------------------------------------------
  // Grip and pommel. The lowest pommel touches the floor.
  // ---------------------------------------------------------------------------

  box([0.25, 0.47, 0.23], [0, -0.02, 0.03], darkIron, {
    name: "gripCore",
    group: "grip",
  });
  box([0.22, 0.39, 0.245], [0, -0.02, 0.045], LEATHER, {
    name: "leatherGrip",
    group: "grip",
  });

  for (const y of [-0.19, -0.1, -0.01, 0.08, 0.17]) {
    cyl(0.026, 0.29, [0, y, 0.05], LEATHER_HI, [0, 0, 1], 8, {
      name: `gripWrap${y}`,
      group: "grip",
    });
  }

  // Trigger guard and trigger.
  b.sweep(
    [
      [-0.14, 0.2, 0.17],
      [-0.2, 0.08, 0.17],
      [-0.13, -0.05, 0.17],
      [0.13, -0.05, 0.17],
      [0.18, 0.08, 0.17],
      [0.14, 0.2, 0.17],
    ],
    0.022,
    {
      bone: root,
      color: oldBrass,
      caps: "round",
      name: "triggerGuard",
      group: "guard",
    },
  );
  rod([0, 0.13, 0.205], [0, 0.0, 0.235], 0.018, GOLD);
  sphere(0.032, [0, -0.025, 0.24], GOLD, [1, 0.7, 0.7]);

  // Pommel cap, hooked rear spur, and end crystal.
  cyl(0.16, 0.11, [0, -0.28, 0.04], oldBrass, [0, 1, 0], 10, {
    name: "pommelCollar",
    group: "grip",
  });
  b.extrude(
    [
      [-0.15, 0],
      [0.15, 0],
      [0.2, 0.12],
      [0.13, 0.22],
      [0, 0.27],
      [-0.13, 0.22],
      [-0.2, 0.12],
    ],
    {
      at: [0, -0.42, 0.04],
      x: [1, 0, 0],
      thickness: 0.16,
      bevel: 0.02,
      color: darkIron,
      bone: root,
      name: "pommel",
      group: "grip",
    },
  );
  sphere(0.09, [0, -0.5, 0.04], BLUE, [0.8, 1, 0.6]);

  // Small side-mounted ammunition / materia cells.
  for (const s of [-1, 1]) {
    for (const y of [0.47, 0.58, 0.69]) {
      cyl(0.032, 0.07, [s * 0.28, y, 0.08], COPPER, [1, 0, 0], 8, {
        name: `ammo${s}${y}`,
        group: "firearm",
      });
      sphere(0.022, [s * 0.32, y, 0.08], CYAN, [0.55, 1, 0.55]);
    }
  }

  // Floating-looking but seated metal trim along both blade shoulders.
  for (const s of [-1, 1]) {
    rod(
      [s * 0.2, 0.93, 0.11],
      [s * 0.16, 1.68, 0.11],
      0.012,
      GOLD,
    );
    sphere(0.032, [s * 0.17, 1.69, 0.115], RED, [0.8, 1, 0.5]);
  }

  // A dark central emblem plate on the receiver.
  const emblem = b.extrude(
    [
      [0, 0],
      [0.08, 0.07],
      [0.065, 0.16],
      [0, 0.22],
      [-0.065, 0.16],
      [-0.08, 0.07],
    ],
    {
      at: [0, 0.82, 0.145],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.005,
      color: GOLD,
      bone: root,
      name: "emblem",
      group: "ornament",
    },
  );
  sphere(0.035, [0, 0.93, 0.17], RED, [0.7, 1, 0.35]);

  // Ensure the visible blade and muzzle remain the hero materials.
  void blade;
  void bladeInset;
  void bladeEdge;
  void emblem;

  return b.root;
}
