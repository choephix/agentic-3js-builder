import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";
import { metal, gearTrain, TINT } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gunblade",
  description:
    "A towering Final Fantasy-inspired gunblade: a broad crystalline sword fused to a heavy revolver receiver, with a jeweled guard, exposed gears, muzzle vents, and an ornate grip.",
};

export default function build() {
  const b = createBuilder({ name: "gunblade", detail: 1 });

  const STEEL = metal("steel", { polish: 0.75, tarnish: 0.08 });
  const DARK_STEEL = metal("iron", { polish: 0.25, tarnish: 0.18 });
  const BLUED = metal("blued", { polish: 0.6 });
  const BRASS = metal("brass", { polish: 0.7, tarnish: 0.12 });
  const COPPER = metal("copper", { polish: 0.45 });
  const GILT = metal("gilt", { polish: 0.9 });
  const BLACK = "#121522";
  const INK = "#171321";
  const RED = "#b51f35";
  const CRYSTAL = "#43d9ff";
  const CRYSTAL_DARK = "#1261a1";
  const LEATHER = "#33212a";

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    extra: any = {},
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      flat: true,
      ...extra,
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    radial = 8,
    extra: any = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, radial), color, {
      at,
      flat: true,
      ...extra,
    });

  const ring = (
    outer: number,
    inner: number,
    depth: number,
    at: [number, number, number],
    color: any,
    extra: any = {},
  ) =>
    b.part(
      new THREE.RingGeometry(inner, outer, 10),
      color,
      {
        at: [at[0], at[1], at[2] + depth],
        dir: [0, 0, 1],
        axis: "z",
        flat: true,
        ...extra,
      },
    );

  // Low-poly blade: the outline is drawn in x/y, then extruded through z.
  const bladeOutline: ([number, number] | [number, number, "sharp"])[] = [
    [-0.105, 0.0, "sharp"],
    [-0.16, 0.20],
    [-0.145, 0.98],
    [-0.105, 1.34],
    [-0.035, 1.72, "sharp"],
    [0.0, 1.92, "sharp"],
    [0.035, 1.72, "sharp"],
    [0.105, 1.34],
    [0.145, 0.98],
    [0.16, 0.20],
    [0.105, 0.0, "sharp"],
    [0.0, -0.035, "sharp"],
  ];

  const blade = b.extrude(bladeOutline, {
    at: [0, 0.82, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.075,
    bevel: 0.012,
    smoothing: 0,
    color: STEEL,
    name: "heroBlade",
    group: "blade",
  });

  // Dark fuller inset, following the sword silhouette.
  b.extrude(
    [
      [-0.035, 0.12],
      [-0.065, 0.32],
      [-0.048, 1.06],
      [0.0, 1.54, "sharp"],
      [0.048, 1.06],
      [0.065, 0.32],
      [0.035, 0.12],
      [0.0, 0.06, "sharp"],
    ],
    {
      at: [0, 0.82, 0.041],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.006,
      color: BLUED,
      name: "bladeFuller",
    },
  );

  // Bright central cutting edge and red rune marks.
  b.extrude(
    [
      [-0.012, 0.16],
      [-0.022, 0.38],
      [0.0, 1.75, "sharp"],
      [0.022, 0.38],
      [0.012, 0.16],
      [0.0, 0.10, "sharp"],
    ],
    {
      at: [0, 0.82, 0.048],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.004,
      color: "#d8f4ff",
      name: "bladeEdge",
    },
  );

  const rune = svg(
    `<svg viewBox="0 0 64 128">
      <path d="M32 4 L43 28 L35 47 L52 72 L32 124 L12 72 L29 47 L21 28 Z"
        fill="#e8fbff" stroke="#1d8dcb" stroke-width="5"/>
      <path d="M32 21 L32 101 M22 63 L42 63" stroke="#ffffff" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  b.part(new THREE.PlaneGeometry(0.105, 0.31), "#ffffff", {
    at: [0, 1.51, 0.055],
    dir: [0, 0, 1],
    axis: "z",
    texture: rune,
    name: "bladeRune",
  });

  // Sword shoulder and gun receiver.
  box([0.38, 0.16, 0.22], [0, 0.72, 0.015], DARK_STEEL, { name: "shoulder" });
  box([0.30, 0.42, 0.30], [0, 0.43, 0.02], BLACK, { name: "receiver" });
  box([0.24, 0.30, 0.34], [0, 0.56, 0.045], BLUED, {
    name: "receiverPlate",
  });

  // Brass side rails and rivets.
  for (const s of [-1, 1]) {
    box([0.026, 0.34, 0.018], [s * 0.145, 0.52, 0.19], BRASS, {
      name: `receiverRail${s}`,
    });
    for (const y of [0.37, 0.52, 0.67]) {
      cyl(0.018, 0.014, [s * 0.16, y, 0.205], GILT, 8, {
        dir: [0, 0, 1],
        name: `rivet${s}_${y}`,
      });
    }
  }

  // A visible mechanical gear train on the forward side.
  gearTrain(b, {
    at: [0, 0.55, 0.205],
    axis: [0, 0, 1],
    up: [0, 1, 0],
    module: 0.018,
    style: "solid",
    arbor: COPPER,
    color: [BRASS, BLUED, GILT],
    gears: [
      { teeth: 18, spokes: 5, bore: 0.018, color: BRASS },
      { teeth: 10, angle: 90, bore: 0.014, color: BLUED },
      { teeth: 14, from: 0, angle: -110, holes: 5, color: GILT },
    ],
  });

  // Barrel running alongside the blade.
  cyl(0.075, 1.24, [0.13, 1.17, 0.035], DARK_STEEL, 8, {
    name: "barrel",
  });
  cyl(0.047, 1.27, [0.13, 1.17, 0.09], BLUED, 8, {
    name: "barrelUpper",
  });

  // Barrel collars.
  for (const y of [0.61, 0.82, 1.48, 1.72]) {
    cyl(0.094, 0.045, [0.13, y, 0.035], BRASS, 8, {
      name: `barrelCollar${y}`,
    });
  }

  // Muzzle crown and glowing bore.
  cyl(0.12, 0.14, [0.13, 1.86, 0.035], DARK_STEEL, 8, {
    name: "muzzleHousing",
  });
  cyl(0.088, 0.145, [0.13, 1.86, 0.035], BLUED, 8, {
    name: "muzzleInner",
  });
  const muzzleGlow = ring(0.068, 0.025, 0.012, [0.13, 1.86, 0.11], CRYSTAL);
  glow(muzzleGlow, 2.2);

  // Crossguard: swept fantasy wings around the hand.
  const guardOutline: ([number, number] | [number, number, "sharp"])[] = [
    [-0.62, 0.0],
    [-0.52, 0.06],
    [-0.30, 0.10],
    [-0.19, 0.035],
    [0.19, 0.035],
    [0.30, 0.10],
    [0.52, 0.06],
    [0.62, 0.0],
    [0.53, -0.08],
    [0.26, -0.13],
    [0.0, -0.075, "sharp"],
    [-0.26, -0.13],
    [-0.53, -0.08],
  ];

  b.extrude(guardOutline, {
    at: [0, 0.30, 0.025],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.12,
    bevel: 0.016,
    color: GILT,
    name: "ornateGuard",
  });

  // Guard inset and side gemstones.
  for (const s of [-1, 1]) {
    b.part(new THREE.OctahedronGeometry(0.058, 0), CRYSTAL, {
      at: [s * 0.39, 0.34, 0.105],
      name: `guardGem${s}`,
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.042, 0), CRYSTAL, {
        at: [s * 0.39, 0.34, 0.145],
        name: `guardGlow${s}`,
      }),
      1.8,
    );
  }

  // Trigger bow beneath the receiver.
  const trigger = b.extrude(
    [
      [-0.16, 0.0],
      [-0.12, -0.22],
      [-0.055, -0.27],
      [0.055, -0.27],
      [0.12, -0.22],
      [0.16, 0.0],
      [0.10, 0.03],
      [0.055, -0.14],
      [-0.055, -0.14],
      [-0.10, 0.03],
    ],
    {
      at: [0, 0.37, -0.06],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.008,
      color: BRASS,
      name: "triggerBow",
    },
  );

  cyl(0.018, 0.11, [0, 0.27, -0.105], RED, 7, {
    name: "trigger",
  });

  // Grip, pommel, and wrapping.
  box([0.19, 0.48, 0.17], [0, 0.02, 0.0], LEATHER, {
    name: "gripCore",
  });
  for (let i = 0; i < 7; i++) {
    const y = -0.17 + i * 0.065;
    const wrap = cyl(0.125, 0.025, [0, y, 0.0], COPPER, 8, {
      name: `gripWrap${i}`,
    });
    wrap.mesh.rotation.z = i % 2 ? 0.18 : -0.18;
  }

  // Pommel with a central glowing crystal.
  cyl(0.15, 0.12, [0, -0.27, 0], DARK_STEEL, 8, {
    name: "pommel",
  });
  b.part(new THREE.OctahedronGeometry(0.085, 0), CRYSTAL_DARK, {
    at: [0, -0.36, 0.04],
    name: "pommelCrystal",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.058, 0), CRYSTAL, {
      at: [0, -0.36, 0.10],
      name: "pommelLight",
    }),
    2.4,
  );

  // Tiny balancing fin behind the receiver.
  b.extrude(
    [
      [0, 0],
      [0.16, 0.08],
      [0.18, 0.18],
      [0.03, 0.13],
      [0, 0.24],
    ],
    {
      at: [-0.01, 0.51, -0.18],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.006,
      color: BLUED,
      name: "rearFin",
    },
  );

  // A pair of dark inset plates makes the silhouette feel manufactured.
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.22, 0.25, 0.012), BLACK, {
      at: [s * 0.121, 0.54, -0.152],
      name: `rearPlate${s}`,
    });
    cyl(0.025, 0.018, [s * 0.121, 0.54, -0.165], RED, 8, {
      name: `rearSensor${s}`,
    });
  }

  return b.root;
}
