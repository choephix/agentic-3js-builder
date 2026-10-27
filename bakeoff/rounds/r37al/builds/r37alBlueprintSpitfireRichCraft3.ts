import * as THREE from "three";
import {
  createBuilder,
  catmull,
  svg,
  paint,
  stripes,
  countershade,
} from "../../../../src/index";

export const meta = {
  name: "Cyanotype Spitfire",
  description:
    "A stylized low-poly Spitfire fighter plane rendered as a cyanotype blueprint, with swept elliptical wings, clipped tail, canopy, propeller, panel marks, roundels, landing gear, and blueprint annotations.",
};

export default function build() {
  const b = createBuilder({ name: "cyanotype-spitfire", detail: 1 });

  const INK = "#062d4b";
  const DEEP = "#073b5c";
  const BLUE = "#0b5b82";
  const MID = "#147da4";
  const LIGHT = "#69c9d2";
  const PALE = "#b4edf0";
  const WHITE = "#e1ffff";
  const ORANGE = "#f0a65c";
  const GLASS = "#164e70";
  const SHADOW = "#041d35";

  const blueprint = paint((p, n) => {
    const grid = Math.sin(p.x * 28) * Math.sin(p.y * 28) * Math.sin(p.z * 8);
    const lit = 0.5 + 0.5 * n.y;
    return grid > 0.86
      ? LIGHT
      : lit > 0.62
        ? MID
        : lit < 0.12
          ? DEEP
          : BLUE;
  });

  const paleBlueprint = countershade(PALE, MID, { level: 0.05, soft: 0.2 });

  const lineTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <rect width="256" height="256" fill="none"/>
      <path d="M24 128h208M128 24v208" stroke="#b4edf0" stroke-width="3" opacity=".9"/>
      <circle cx="128" cy="128" r="78" fill="none" stroke="#b4edf0" stroke-width="3"/>
      <circle cx="128" cy="128" r="53" fill="none" stroke="#b4edf0" stroke-width="2"/>
      <path d="M128 42v172M42 128h172" stroke="#b4edf0" stroke-width="1" opacity=".65"/>
    </svg>`,
    { size: 256 },
  );

  const roundelTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="58" fill="#062d4b" stroke="#b4edf0" stroke-width="5"/>
      <circle cx="64" cy="64" r="41" fill="#b4edf0"/>
      <circle cx="64" cy="64" r="25" fill="#0b5b82"/>
      <path d="M64 12v104M12 64h104" stroke="#69c9d2" stroke-width="2" opacity=".8"/>
    </svg>`,
    { size: 256 },
  );

  const labelTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 90">
      <rect width="420" height="90" fill="#062d4b"/>
      <text x="210" y="59" text-anchor="middle" font-family="monospace" font-size="39" letter-spacing="5" fill="#b4edf0">SPITFIRE Mk IX</text>
    </svg>`,
    { size: 512 },
  );

  // Main structural points: nose at +Z, tail at -Z.
  const nose = [0, 1.05, 4.6] as const;
  const firewall = [0, 1.06, 3.55] as const;
  const cockpitRoot = [0, 1.25, 1.45] as const;
  const rearBody = [0, 1.18, -1.25] as const;
  const tailBody = [0, 1.3, -3.55] as const;

  // Fuselage, built as a continuous faceted tube with tapered tail.
  const fuselagePath = catmull(
    [nose, [0, 1.07, 4.0], firewall, cockpitRoot, rearBody, tailBody, [0, 1.35, -4.15]],
    { tension: 0.25 },
  );
  const fuselage = b.sweep(fuselagePath, (t) => {
    if (t < 0.14) return 0.48 + t * 1.7;
    if (t < 0.42) return 0.72;
    if (t < 0.68) return 0.61;
    return 0.58 * (1 - (t - 0.68) / 0.32) + 0.17;
  }, {
    color: blueprint,
    sides: 10,
    section: "circle",
    caps: "round",
    name: "fuselage",
    group: "airframe",
  });

  // A pale underside stripe makes the silhouette readable in blueprint colors.
  b.sweep(fuselagePath, (t) => {
    if (t < 0.14) return 0.485 + t * 1.7;
    if (t < 0.42) return 0.725;
    if (t < 0.68) return 0.615;
    return 0.58 * (1 - (t - 0.68) / 0.32) + 0.17;
  }, {
    color: paleBlueprint,
    sides: 10,
    sectors: [[112, 248, PALE]],
    caps: "none",
    name: "belly-highlight",
    group: "airframe",
  });

  // Wing roots and broad elliptical wings.
  const wingOutline = [
    [0.0, 0.0],
    [0.62, 0.02],
    [2.35, 0.00],
    [4.95, -0.08],
    [5.45, -0.02],
    [5.05, 0.18],
    [3.18, 0.38],
    [1.52, 0.50],
    [0.52, 0.47],
    [0.0, 0.35],
  ] as [number, number][];

  for (const s of [-1, 1]) {
    const wing = b.extrude(wingOutline, {
      at: [s * 0.04, 1.02, 0.55],
      x: [s, 0, 0],
      y: [0, 0.08, 1],
      thickness: [0.12, 0.075],
      bevel: 0.035,
      smoothing: 1,
      color: blueprint,
      name: s > 0 ? "left-main-wing" : "right-main-wing",
      group: "wings",
    });

    // A subtle leading-edge spar.
    b.rod(
      wing.local([0.6, 0.18, 0.06]),
      wing.local([4.7, 0.07, 0.06]),
      0.035,
      { color: LIGHT, caps: "flat", name: s > 0 ? "left-leading-spar" : "right-leading-spar" },
    );

    // Aileron strip.
    b.extrude(
      [
        [2.25, 0.03],
        [4.75, 0.0],
        [4.96, 0.1],
        [3.0, 0.3],
        [2.25, 0.28],
      ],
      {
        at: [s * 0.05, 1.12, 0.55],
        x: [s, 0, 0],
        y: [0, 0.08, 1],
        thickness: 0.035,
        bevel: 0.01,
        color: LIGHT,
        name: s > 0 ? "left-aileron" : "right-aileron",
        group: "control-surfaces",
      },
    );

    // Wing roundel decal.
    const wingSurface = b.surface(wing);
    const roundelHit = wingSurface.around([s * 3.05, 1.13, 0.48]).at(s * 90, 90);
    if (roundelHit) {
      b.stick(new THREE.CylinderGeometry(0.42, 0.42, 0.018, 24), DEEP, roundelHit, {
        embed: 0.1,
        name: s > 0 ? "left-wing-roundel-base" : "right-wing-roundel-base",
      });
      b.decal(wing, roundelTex, {
        at: roundelHit,
        size: [0.72, 0.72],
        dir: [0, 1, 0],
        lift: 0.012,
        name: s > 0 ? "left-wing-roundel" : "right-wing-roundel",
        group: "markings",
      });
    }
  }

  // Wing root fairings.
  for (const s of [-1, 1]) {
    b.sweep(
      catmull([
        [s * 0.35, 1.04, 1.72],
        [s * 0.9, 1.05, 1.1],
        [s * 1.5, 1.03, 0.63],
      ]),
      [0.25, 0.08],
      {
        color: DEEP,
        section: "box",
        caps: "round",
        name: s > 0 ? "left-wing-fairing" : "right-wing-fairing",
        group: "airframe",
      },
    );
  }

  // Tailplane and elevators.
  const tailplane = [
    [0.0, 0.0],
    [0.42, 0.0],
    [2.0, 0.02],
    [2.4, 0.06],
    [2.0, 0.24],
    [0.72, 0.35],
    [0.0, 0.32],
  ] as [number, number][];

  for (const s of [-1, 1]) {
    b.extrude(tailplane, {
      at: [s * 0.03, 1.34, -3.18],
      x: [s, 0, 0],
      y: [0, 0.05, 1],
      thickness: 0.06,
      bevel: 0.02,
      color: blueprint,
      name: s > 0 ? "left-tailplane" : "right-tailplane",
      group: "tail",
    });
    b.extrude(
      [
        [0.62, 0],
        [2.15, 0],
        [2.22, 0.12],
        [0.7, 0.26],
      ],
      {
        at: [s * 0.04, 1.39, -3.18],
        x: [s, 0, 0],
        y: [0, 0.05, 1],
        thickness: 0.025,
        color: LIGHT,
        name: s > 0 ? "left-elevator" : "right-elevator",
        group: "control-surfaces",
      },
    );
  }

  // Vertical fin and rudder.
  b.extrude(
    [
      [0, 0],
      [0.1, 0.18],
      [0.22, 1.18],
      [0.5, 2.28],
      [0.82, 2.62],
      [1.04, 2.56],
      [0.98, 0.42],
      [0.64, 0.08],
    ],
    {
      at: [0, 1.38, -3.35],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: [0.08, 0.045],
      bevel: 0.025,
      smoothing: 1,
      color: blueprint,
      name: "vertical-fin",
      group: "tail",
    },
  );
  b.extrude(
    [
      [0.22, 0.24],
      [0.5, 2.2],
      [0.82, 2.48],
      [0.98, 2.4],
      [0.93, 0.48],
      [0.64, 0.12],
    ],
    {
      at: [0, 1.39, -3.34],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.028,
      color: LIGHT,
      name: "rudder",
      group: "control-surfaces",
    },
  );

  // Engine cowling rings and spinner.
  b.sweep(
    catmull([
      [0, 1.06, 3.58],
      [0, 1.06, 4.0],
      [0, 1.06, 4.42],
      [0, 1.06, 4.64],
    ]),
    (t) => 0.67 - 0.18 * t,
    {
      color: DEEP,
      sides: 10,
      caps: "flat",
      name: "engine-cowling",
      group: "engine",
    },
  );
  b.part(new THREE.CylinderGeometry(0.56, 0.56, 0.055, 12), LIGHT, {
    at: [0, 1.06, 4.49],
    dir: [0, 0, 1],
    axis: "y",
    rotation: [90, 0, 0],
    name: "cowling-ring",
    group: "engine",
  });
  b.spike([0, 1.06, 4.47], [0, 0, 1], 0.54, 0.16, {
    color: PALE,
    name: "propeller-spinner",
    group: "propeller",
  });

  // Propeller hub, blades, and counterweights.
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.25, 10), INK, {
    at: [0, 1.06, 4.74],
    dir: [0, 0, 1],
    rotation: [90, 0, 0],
    name: "propeller-hub",
    group: "propeller",
  });

  const blade = [
    [0.0, 0.0],
    [0.12, 0.0],
    [0.34, 0.38],
    [0.22, 1.38],
    [0.06, 1.9],
    [-0.03, 1.36],
    [-0.12, 0.42],
  ] as [number, number][];

  for (const a of [0, 90, 180, 270]) {
    const rad = (a * Math.PI) / 180;
    const x = Math.cos(rad);
    const y = Math.sin(rad);
    b.extrude(blade, {
      at: [0, 1.06, 4.74],
      x: [x, y, 0],
      y: [-y, x, 0],
      thickness: 0.06,
      bevel: 0.025,
      smoothing: 1,
      color: a % 180 === 0 ? PALE : LIGHT,
      rotation: [0, 0, 0],
      name: `propeller-blade-${a}`,
      group: "propeller",
    });
  }

  // Cockpit canopy: faceted dark glass and raised windscreen.
  b.part(new THREE.SphereGeometry(0.76, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.58), GLASS, {
    at: [0, 1.64, 0.78],
    scale: [0.76, 0.55, 1.32],
    rotation: [-12, 0, 0],
    name: "cockpit-canopy",
    group: "cockpit",
  });
  b.sweep(
    catmull([
      [-0.58, 1.55, 1.12],
      [-0.45, 1.85, 1.05],
      [0, 2.02, 0.88],
      [0.45, 1.85, 1.05],
      [0.58, 1.55, 1.12],
    ]),
    0.035,
    {
      color: PALE,
      caps: "round",
      name: "canopy-frame",
      group: "cockpit",
    },
  );
  b.rod([-0.57, 1.56, 1.08], [0.57, 1.56, 1.08], 0.025, {
    color: LIGHT,
    name: "canopy-sill",
    group: "cockpit",
  });

  // Exhaust stacks along both sides of the nose.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const z = 2.75 + i * 0.16;
      b.part(new THREE.CylinderGeometry(0.045, 0.06, 0.18, 7), ORANGE, {
        at: [s * 0.67, 1.22, z],
        dir: [s * 0.35, 0, 1],
        name: `${s > 0 ? "left" : "right"}-exhaust-${i}`,
        group: "engine",
      });
    }
  }

  // Landing gear legs and wheels, keeping the lowest point just above the floor.
  for (const s of [-1, 1]) {
    const gearX = s * 1.18;
    b.rod([s * 0.52, 0.95, 1.05], [gearX, 0.32, 1.18], 0.075, {
      color: PALE,
      name: s > 0 ? "left-main-strut" : "right-main-strut",
      group: "landing-gear",
    });
    b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.13, 12), INK, {
      at: [gearX, 0.22, 1.22],
      dir: [1, 0, 0],
      rotation: [0, 0, 90],
      name: s > 0 ? "left-main-wheel" : "right-main-wheel",
      group: "landing-gear",
    });
    b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.145, 12), LIGHT, {
      at: [gearX + s * 0.008, 0.22, 1.22],
      dir: [1, 0, 0],
      rotation: [0, 0, 90],
      name: s > 0 ? "left-wheel-hub" : "right-wheel-hub",
      group: "landing-gear",
    });
  }

  b.rod([0, 0.9, 3.15], [0, 0.25, 3.65], 0.045, {
    color: PALE,
    name: "tail-wheel-strut",
    group: "landing-gear",
  });
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 10), INK, {
    at: [0, 0.13, 3.7],
    dir: [1, 0, 0],
    rotation: [0, 0, 90],
    name: "tail-wheel",
    group: "landing-gear",
  });

  // Small blueprint panel lines, gun ports, and access hatches.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const z = 1.95 + i * 0.32;
      b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.012, 8), INK, {
        at: [s * 0.66, 1.18, z],
        dir: [s, 0, 0],
        name: `${s > 0 ? "left" : "right"}-gun-port-${i}`,
        group: "detail",
      });
    }
    b.part(new THREE.BoxGeometry(0.018, 0.24, 0.72), LIGHT, {
      at: [s * 0.65, 1.3, 0.35],
      name: `${s > 0 ? "left" : "right"}-access-panel`,
      group: "detail",
    });
  }

  // Fuselage roundel and identification label.
  const bodySurface = b.surface(fuselage);
  const flank = bodySurface.around([0, 1.2, -0.55]).at(90, 4);
  if (flank) {
    b.decal(fuselage, roundelTex, {
      at: flank,
      size: [0.65, 0.65],
      dir: [1, 0, 0],
      up: [0, 1, 0],
      lift: 0.012,
      name: "fuselage-roundel",
      group: "markings",
    });
  }

  b.part(new THREE.PlaneGeometry(1.75, 0.38), WHITE, {
    at: [0, 1.63, -1.92],
    dir: [0, 0.12, -1],
    axis: "z",
    texture: labelTex,
    name: "aircraft-label",
    group: "markings",
  });

  // Blueprint registration crosshair and a small tail serial plate.
  b.part(new THREE.PlaneGeometry(0.72, 0.72), PALE, {
    at: [0, 2.06, 0.78],
    dir: [0, 1, 0],
    axis: "z",
    texture: lineTex,
    name: "cockpit-reference-grid",
    group: "blueprint-detail",
  });

  b.part(new THREE.BoxGeometry(0.38, 0.18, 0.025), DEEP, {
    at: [0, 1.52, -3.92],
    name: "tail-serial-plate",
    group: "markings",
  });
  b.part(new THREE.PlaneGeometry(0.3, 0.12), PALE, {
    at: [0, 1.62, -3.94],
    dir: [0, 0, -1],
    axis: "z",
    texture: labelTex,
    name: "tail-serial",
    group: "markings",
  });

  return b.root;
}
