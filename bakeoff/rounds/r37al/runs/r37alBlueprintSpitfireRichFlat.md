```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Cyanotype Spitfire",
  description: "A stylized low-poly Spitfire fighter plane rendered as a cyanotype blueprint, with elliptical wings, cockpit canopy, propeller, roundels, guns, tailplane and landing gear.",
};

export default function build() {
  const b = createBuilder({ name: "cyanotype-spitfire", detail: 1 });

  const INK = "#061c38";
  const DEEP = "#0a3158";
  const BLUE = "#125b88";
  const CYAN = "#28a9c4";
  const PALE = "#a8f1ed";
  const WHITE = "#d7fff8";
  const SHADOW = "#082744";
  const RED = "#53d5d2";
  const GLASS = "#157ba0";

  const fuselagePath = [
    [0, 0.67, -1.62],
    [0, 0.68, -1.30],
    [0, 0.70, -0.72],
    [0, 0.71, 0.18],
    [0, 0.72, 0.92],
    [0, 0.76, 1.45],
    [0, 0.80, 1.79],
    [0, 0.82, 2.02],
  ] as number[][];

  const fuselage = b.sweep(fuselagePath, (t) => {
    if (t < 0.08) return 0.08 + t * 1.7;
    if (t < 0.35) return 0.21;
    if (t < 0.72) return 0.25;
    if (t < 0.91) return 0.20;
    return 0.10;
  }, {
    color: BLUE,
    sides: 8,
    caps: "round",
    section: "circle",
    name: "fuselage",
    group: "airframe",
  });

  const nose = b.sweep(
    [
      [0, 0.82, 1.75],
      [0, 0.84, 1.98],
      [0, 0.85, 2.12],
    ],
    [0.19, 0.035],
    {
      color: DEEP,
      sides: 8,
      caps: { start: "flat", end: "point" },
      name: "spinner-nose",
      group: "airframe",
    },
  );

  const panelBand = (z: number, r: number, color = CYAN) =>
    b.sweep(
      [
        [-r * 0.98, 0.71, z],
        [r * 0.98, 0.71, z],
      ],
      0.012,
      {
        color,
        sides: 6,
        caps: "round",
        name: `panel-band-${z.toFixed(2)}`,
        group: "panel-lines",
      },
    );

  panelBand(-1.24, 0.20, CYAN);
  panelBand(-0.72, 0.24, CYAN);
  panelBand(-0.12, 0.255, PALE);
  panelBand(0.50, 0.245, CYAN);
  panelBand(1.05, 0.215, CYAN);
  panelBand(1.46, 0.18, PALE);

  const topSpine = b.sweep(
    [
      [0, 0.91, -0.95],
      [0, 0.96, -0.32],
      [0, 1.00, 0.34],
      [0, 1.03, 0.84],
    ],
    [0.025, 0.012],
    {
      color: PALE,
      sides: 6,
      caps: "round",
      name: "cockpit-spine",
      group: "airframe",
    },
  );

  const wingOutline = [
    [0, 0.47, 0.38],
    [0.30, 0.47, 0.34],
    [0.93, 0.47, 0.20],
    [1.52, 0.47, -0.02],
    [2.12, 0.47, -0.32],
    [2.32, 0.47, -0.48],
    [2.08, 0.47, -0.58],
    [1.34, 0.47, -0.49],
    [0.62, 0.47, -0.25],
    [0, 0.47, -0.07],
  ] as number[][];

  const wingL = b.slab(wingOutline, {
    color: BLUE,
    thickness: 0.105,
    name: "left-elliptical-wing",
    group: "wings",
  });
  const wingR = b.slab(wingOutline.map(([x, y, z]) => [-x, y, z]), {
    color: BLUE,
    thickness: 0.105,
    name: "right-elliptical-wing",
    group: "wings",
  });

  const wingLeading = (s: number) =>
    b.rod(
      [s * 0.26, 0.54, 0.38],
      [s * 2.10, 0.54, -0.36],
      0.022,
      PALE,
      { name: `wing-leading-${s}`, group: "panel-lines" },
    );
  wingLeading(1);
  wingLeading(-1);

  const wingTrailing = (s: number) =>
    b.rod(
      [s * 0.44, 0.535, -0.19],
      [s * 1.98, 0.535, -0.51],
      0.014,
      CYAN,
      { name: `wing-trailing-${s}`, group: "panel-lines" },
    );
  wingTrailing(1);
  wingTrailing(-1);

  for (const s of [1, -1]) {
    for (const z of [0.18, -0.05, -0.28]) {
      b.rod(
        [s * 0.55, 0.545, z],
        [s * 1.72, 0.545, z - 0.25],
        0.008,
        CYAN,
        { name: `wing-rib-${s}-${z}`, group: "panel-lines" },
      );
    }
  }

  const tailplane = [
    [0, 0.77, -1.24],
    [0.26, 0.77, -1.25],
    [0.75, 0.77, -1.42],
    [1.03, 0.77, -1.60],
    [0.77, 0.77, -1.68],
    [0.30, 0.77, -1.52],
    [0, 0.77, -1.43],
  ] as number[][];
  b.slab(tailplane, {
    color: BLUE,
    thickness: 0.075,
    name: "left-tailplane",
    group: "tail",
  });
  b.slab(tailplane.map(([x, y, z]) => [-x, y, z]), {
    color: BLUE,
    thickness: 0.075,
    name: "right-tailplane",
    group: "tail",
  });

  b.rod([0, 0.79, -1.40], [0, 0.79, -1.64], 0.018, PALE, {
    name: "tailplane-center-seam",
    group: "panel-lines",
  });

  const fin = [
    [0, 0.84, -1.52],
    [0, 1.18, -1.39],
    [0, 1.72, -1.19],
    [0, 1.78, -0.94],
    [0, 1.01, -0.87],
    [0, 0.84, -0.98],
  ] as number[][];
  b.slab(fin, {
    color: DEEP,
    thickness: 0.075,
    name: "vertical-tail-fin",
    group: "tail",
  });
  b.rod([0, 1.15, -1.39], [0, 1.66, -1.08], 0.014, PALE, {
    name: "rudder-outline",
    group: "panel-lines",
  });

  const canopy = b.part(
    new THREE.SphereGeometry(1, 12, 8),
    GLASS,
    {
      at: [0, 0.98, 0.42],
      scale: [0.22, 0.23, 0.42],
      name: "bubble-canopy",
      group: "cockpit",
    },
  );
  b.rod([-0.225, 1.02, 0.14], [-0.225, 1.04, 0.70], 0.012, PALE, {
    name: "canopy-left-frame",
    group: "cockpit",
  });
  b.rod([0.225, 1.02, 0.14], [0.225, 1.04, 0.70], 0.012, PALE, {
    name: "canopy-right-frame",
    group: "cockpit",
  });
  b.rod([0, 1.18, 0.13], [0, 1.21, 0.72], 0.012, CYAN, {
    name: "canopy-center-frame",
    group: "cockpit",
  });

  const roundel = (s: number, z: number, scale: number) => {
    b.part(
      new THREE.CylinderGeometry(0.22 * scale, 0.22 * scale, 0.012, 24),
      PALE,
      {
        at: [s * 1.23, 0.545, z],
        dir: [0, 1, 0],
        name: `roundel-outer-${s}-${z}`,
        group: "insignia",
      },
    );
    b.part(
      new THREE.CylinderGeometry(0.135 * scale, 0.135 * scale, 0.016, 20),
      DEEP,
      {
        at: [s * 1.23, 0.555, z],
        dir: [0, 1, 0],
        name: `roundel-inner-${s}-${z}`,
        group: "insignia",
      },
    );
    b.part(
      new THREE.CylinderGeometry(0.062 * scale, 0.062 * scale, 0.020, 16),
      CYAN,
      {
        at: [s * 1.23, 0.565, z],
        dir: [0, 1, 0],
        name: `roundel-center-${s}-${z}`,
        group: "insignia",
      },
    );
  };
  roundel(1, 0.02, 1);
  roundel(-1, 0.02, 1);

  const gun = (s: number, x: number, z: number) => {
    b.rod([s * x, 0.49, z], [s * x, 0.49, z + 0.58], 0.018, INK, {
      name: `wing-gun-${s}-${x}`,
      group: "armament",
    });
    b.part(
      new THREE.CylinderGeometry(0.027, 0.027, 0.05, 8),
      PALE,
      {
        at: [s * x, 0.505, z + 0.58],
        dir: [0, 0, 1],
        name: `gun-muzzle-${s}-${x}`,
        group: "armament",
      },
    );
  };
  gun(1, 0.68, 0.20);
  gun(1, 0.91, 0.06);
  gun(-1, 0.68, 0.20);
  gun(-1, 0.91, 0.06);

  const spinner = b.part(
    new THREE.ConeGeometry(0.19, 0.29, 12),
    PALE,
    {
      at: [0, 0.85, 2.16],
      dir: [0, 0, 1],
      name: "propeller-spinner",
      group: "propeller",
    },
  );

  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    const x = Math.sin(a) * 0.42;
    const y = 0.85 + Math.cos(a) * 0.42;
    b.part(
      new THREE.BoxGeometry(0.105, 0.52, 0.035),
      PALE,
      {
        at: [x, y, 2.28],
        dir: [0, 0, 1],
        rotation: [0, 0, a],
        name: `propeller-blade-${i}`,
        group: "propeller",
      },
    );
    b.part(
      new THREE.BoxGeometry(0.14, 0.11, 0.045),
      CYAN,
      {
        at: [x * 0.55, 0.85 + (y - 0.85) * 0.55, 2.295],
        dir: [0, 0, 1],
        rotation: [0, 0, a],
        name: `propeller-root-${i}`,
        group: "propeller",
      },
    );
  }

  const wheel = (s: number, z: number) => {
    b.part(
      new THREE.CylinderGeometry(0.105, 0.105, 0.065, 12),
      INK,
      {
        at: [s * 0.42, 0.16, z],
        dir: [1, 0, 0],
        name: `landing-wheel-${s}-${z}`,
        group: "landing-gear",
      },
    );
    b.part(
      new THREE.CylinderGeometry(0.045, 0.045, 0.072, 10),
      CYAN,
      {
        at: [s * 0.42, 0.16, z],
        dir: [1, 0, 0],
        name: `wheel-hub-${s}-${z}`,
        group: "landing-gear",
      },
    );
    b.rod([s * 0.30, 0.48, z + 0.08], [s * 0.42, 0.22, z], 0.025, PALE, {
      name: `gear-strut-${s}-${z}`,
      group: "landing-gear",
    });
  };
  wheel(1, 0.20);
  wheel(-1, 0.20);

  b.part(
    new THREE.CylinderGeometry(0.09, 0.09, 0.055, 12),
    INK,
    {
      at: [0, 0.105, -1.10],
      dir: [1, 0, 0],
      name: "tail-wheel",
      group: "landing-gear",
    },
  );
  b.rod([0, 0.45, -1.08], [0, 0.15, -1.10], 0.018, PALE, {
    name: "tail-wheel-strut",
    group: "landing-gear",
  });

  for (const s of [1, -1]) {
    for (const z of [-1.05, -0.74, -0.40, 0.68, 1.03]) {
      b.part(
        new THREE.SphereGeometry(0.018, 6, 4),
        WHITE,
        {
          at: [s * 0.257, 0.90, z],
          name: `fuselage-rivet-${s}-${z}`,
          group: "rivets",
        },
      );
    }
  }

  b.rod([0, 0.91, -1.62], [0, 0.91, -0.82], 0.012, CYAN, {
    name: "rear-fuselage-seam",
    group: "panel-lines",
  });
  b.rod([0, 0.92, 1.10], [0, 0.95, 1.73], 0.012, PALE, {
    name: "nose-panel-seam",
    group: "panel-lines",
  });

  return b.root;
}
```