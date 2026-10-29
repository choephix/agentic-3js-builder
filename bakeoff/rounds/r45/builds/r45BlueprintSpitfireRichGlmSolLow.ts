import * as THREE from "three";
import { createBuilder, type Builder, type Joint, catmull, frame, line, polyline, rng } from "../../../../src/index";

export const meta = {
  "name": "Cyanotype Spitfire Mk I",
  "description": "A low-poly Supermarine Spitfire rendered as a living cyanotype blueprint: deep Prussian-blue panels traced with glowing cyan seam lines, paper-white roundels, rivets and hand-inked annotations, standing nose-up on its taildragger undercarriage."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hullBlue: "#0c2f52",
  panelBlue: "#14406e",
  cowlBlue: "#1b518a",
  lineCyan: "#4fd8ff",
  inkWhite: "#dceeff",
  inkDim: "#9fc9e8",
  deepInk: "#0a1830",
  steelPale: "#8fb7d9",
  steelHub: "#c9e6ff",
  glazing: "#8fe3ff",
  tyre: "#13202e",
  radiDark: "#0e2240",
  beacon: "#ff8a4d",
  oilStain: "#1d3a5c",
  roundelBlue: "#2a6fa8",
  roddGreen: "#3fa66b",
};
const M = {
  wingRoot: [0, 1.5, 0.6] as [number, number, number],
  tailRoot: [0, 1.85, -3.6] as [number, number, number],
  spinnerBase: [0, 1.9, 4.3] as [number, number, number],
  canopyBase: [0, 2.42, 0.35] as [number, number, number],
  gearAnchorL: [0.62, 1.3, 0.75] as [number, number, number],
  gearAnchorR: [-0.62, 1.3, 0.75] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // fuselage
  (() => {
function buildFuselage({ b, J, P, M }: Ctx) {
  const body = J.body;
  const hull = P.hull ?? P.hullBlue;
  const panel = P.panel ?? P.panelBlue;
  const cowl = P.cowl ?? P.cowlBlue;
  const cyan = P.cyan ?? P.lineCyan;
  const white = P.white ?? P.inkWhite;
  const dim = P.dim ?? P.inkDim;
  const deep = P.deep ?? P.deepInk;
  const steel = P.steel ?? P.steelPale;
  const oil = P.oil ?? P.oilStain;

  const V = (p: number[] | THREE.Vector3) =>
    p instanceof THREE.Vector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2]);

  const part = (
    geo: THREE.BufferGeometry,
    color: string,
    at: THREE.Vector3 | number[],
    opts: Record<string, unknown> = {},
  ) =>
    b.part(geo, color, {
      bone: body,
      at: V(at),
      ...opts,
    });

  const rod = (
    a: THREE.Vector3 | number[],
    c: THREE.Vector3 | number[],
    radius: number,
    color: string,
    opts: Record<string, unknown> = {},
  ) => b.rod(V(a), V(c), radius, color, { bone: body, ...opts });

  const box = (
    size: [number, number, number],
    at: THREE.Vector3 | number[],
    color: string,
    opts: Record<string, unknown> = {},
  ) => part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, at, opts);

  const cyl = (
    radius: number,
    height: number,
    at: THREE.Vector3 | number[],
    color: string,
    opts: Record<string, unknown> = {},
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, height, opts.segments as number ?? 10, 1),
      color,
      at,
      opts,
    );

  // Main monocoque centreline.  The front is deliberately broad and bluff;
  // the aft stations collapse into the characteristic Spitfire tail cone.
  const centre = catmull(
    [
      [0, 1.91, 4.30],
      [0, 1.91, 4.02],
      [0, 1.84, 3.30],
      [0, 1.78, 2.15],
      [0, 1.78, 0.55],
      [0, 1.83, -1.15],
      [0, 1.86, -2.55],
      [0, 1.85, -3.60],
    ],
    { tension: 0.35 },
  );

  const hullTube = b.sweep(centre, (t: number) => {
    if (t < 0.16) return [1.04 - t * 0.8, 0.46];
    if (t < 0.52) return [1.04 + 0.05 * Math.sin(t * 8), 0.66];
    if (t < 0.78) return [0.86 - (t - 0.52) * 1.6, 0.58 - (t - 0.52) * 0.45];
    return [0.40 - (t - 0.78) * 0.55, 0.24 - (t - 0.78) * 0.18];
  }, {
    bone: body,
    color: hull,
    sides: 10,
    caps: "round",
    section: "circle",
    sectors: [
      [-58, 58, panel, 0.02, 0.70],
      [-58, 58, cowl, 0.70, 1.0],
    ],
    name: "fuselageHull",
    group: "fuselage",
  });

  // Lower keel and wing-root fairing, giving the belly a deliberate faceted
  // transition rather than leaving the wing to intersect a round tube.
  b.loft(
    [
      { at: [0, 1.40, 1.55], w: 0.70, h: 0.28 },
      { at: [0, 1.28, 0.65], w: 0.82, h: 0.25 },
      { at: [0, 1.24, -0.15], w: 0.78, h: 0.22 },
      { at: [0, 1.34, -0.90], w: 0.54, h: 0.18 },
    ],
    {
      bone: body,
      color: panel,
      section: "box",
      caps: "round",
      sides: 8,
      name: "wingRootFairing",
      group: "fuselage",
    },
  );

  const bellyStrip = polyline([
    [-0.34, 1.22, 2.55],
    [-0.48, 1.18, 1.70],
    [-0.42, 1.17, 0.72],
    [-0.25, 1.24, -0.10],
  ]);
  b.sweep(bellyStrip, 0.035, {
    bone: body,
    color: deep,
    section: { ngon: 5 },
    caps: "round",
    name: "bellyFairingStrip",
    group: "fuselage",
  });

  // Three bright cowl panel hoops, each an actual low-poly elliptical tube.
  const hoops = [
    { z: 3.98, rx: 1.01, cy: 1.91, ry: 0.44 },
    { z: 3.72, rx: 1.04, cy: 1.89, ry: 0.47 },
    { z: 3.46, rx: 1.03, cy: 1.86, ry: 0.49 },
  ];
  for (let h = 0; h < hoops.length; h++) {
    const q = hoops[h];
    const pts: number[][] = [];
    for (let i = 0; i < 17; i++) {
      const a = (i / 16) * Math.PI * 2;
      pts.push([q.rx * Math.cos(a), q.cy + q.ry * Math.sin(a), q.z]);
    }
    b.sweep(polyline(pts, { closed: true }), 0.014, {
      bone: body,
      color: cyan,
      sides: 5,
      caps: "none",
      name: `cowlSeam${h + 1}`,
      group: "seams",
    });

    // Paper-white fasteners on the upper half of every hoop.
    for (let i = 1; i < 9; i++) {
      const a = Math.PI * (0.08 + (0.84 * i) / 8);
      const p = [q.rx * Math.cos(a), q.cy + q.ry * Math.sin(a) + 0.012, q.z];
      part(new THREE.SphereGeometry(0.026, 6, 4), white, p, {
        name: `cowlRivet${h}_${i}`,
        group: "rivets",
      });
    }
  }

  // Longitudinal panel seams over the spine.
  for (const sx of [-0.62, 0.62]) {
    const seam = catmull([
      [sx * 0.72, 2.27, 3.85],
      [sx, 2.43, 2.50],
      [sx, 2.48, 1.10],
      [sx * 0.88, 2.33, -0.55],
      [sx * 0.55, 2.08, -2.20],
    ]);
    b.sweep(seam, 0.012, {
      bone: body,
      color: cyan,
      sides: 5,
      caps: "round",
      name: sx > 0 ? "spineSeamL" : "spineSeamR",
      group: "seams",
    });
    for (let i = 0; i < 12; i++) {
      const t = i / 11;
      const p = seam.at(t);
      part(new THREE.SphereGeometry(0.025, 6, 4), white, p, {
        name: `spineRivet${sx > 0 ? "L" : "R"}${i}`,
        group: "rivets",
      });
    }
  }

  // Six exhaust stacks, angled slightly aft and down, with bright rim collars.
  for (const sx of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const z = 3.28 - i * 0.31;
      const base = new THREE.Vector3(sx * (0.91 + i * 0.015), 1.70 - i * 0.035, z);
      const tip = new THREE.Vector3(sx * 1.10, 1.62 - i * 0.035, z - 0.12);
      rod(base, tip, 0.072, deep, {
        section: { ngon: 6 },
        caps: "flat",
        name: `exhaust${sx > 0 ? "L" : "R"}${i}`,
        group: "engine",
      });
      rod(
        base.clone().add(new THREE.Vector3(sx * 0.012, 0.004, 0)),
        base.clone().add(new THREE.Vector3(sx * 0.035, 0.008, -0.018)),
        0.082,
        steel,
        { section: { ngon: 6 }, caps: "flat", name: `exhaustRim${sx}_${i}`, group: "engine" },
      );
    }
  }

  // Rear-flank serial: chunky blueprint lettering made from cyanotype strokes.
  const glyphs: Record<string, string[]> = {
    P: ["1110", "1001", "1110", "1000", "1000"],
    "7": ["1111", "0001", "0010", "0100", "0100"],
    "3": ["1110", "0001", "0110", "0001", "1110"],
    "5": ["1111", "1000", "1110", "0001", "1110"],
    "0": ["0110", "1001", "1001", "1001", "0110"],
    A: ["0110", "1001", "1111", "1001", "1001"],
    R: ["1110", "1001", "1110", "1010", "1001"],
    F: ["1111", "1000", "1110", "1000", "1000"],
  };
  const serial = "P7350ARF";
  const startZ = -2.56;
  const y0 = 1.83;
  const xFlank = -0.98;
  let cursor = 0;
  for (const ch of serial) {
    const grid = glyphs[ch];
    for (let gy = 0; gy < 5; gy++) {
      for (let gx = 0; gx < 4; gx++) {
        if (grid[gy][gx] !== "1") continue;
        box(
          [0.012, 0.026, 0.050],
          [xFlank - 0.008, y0 + (4 - gy) * 0.038, startZ + cursor + gx * 0.032],
          white,
          { name: `serial_${cursor}_${gx}_${gy}`, group: "markings" },
        );
      }
    }
    cursor += 0.18;
  }

  // Fuel hatch on the starboard flank, outlined in cyan and called out with
  // a hand-inked arrow.
  const hatch = box([0.018, 0.19, 0.30], [-1.015, 1.95, 0.72], oil, {
    name: "fuelHatch",
    group: "markings",
  });
  rod([-1.032, 2.10, 0.52], [-1.032, 2.10, 0.92], 0.010, cyan, {
    name: "fuelHatchTop",
    group: "annotations",
  });
  rod([-1.032, 1.80, 0.52], [-1.032, 1.80, 0.92], 0.010, cyan, {
    name: "fuelHatchBottom",
    group: "annotations",
  });
  rod([-1.06, 2.28, 1.28], [-1.06, 2.05, 0.92], 0.012, cyan, {
    name: "fuelCallout",
    group: "annotations",
  });
  rod([-1.06, 2.05, 0.92], [-1.06, 2.10, 1.08], 0.012, cyan, {
    name: "fuelArrowA",
    group: "annotations",
  });
  rod([-1.06, 2.05, 0.92], [-1.06, 1.96, 1.05], 0.012, cyan, {
    name: "fuelArrowB",
    group: "annotations",
  });

  // Belly oil stain, deliberately planar and darker than the surrounding blue.
  box([0.56, 0.012, 0.72], [0, 1.205, 2.72], oil, {
    name: "oilStain",
    group: "weathering",
  });
  for (let i = 0; i < 5; i++) {
    const x = -0.22 + i * 0.11;
    const z = 2.42 + (i % 2) * 0.22;
    part(new THREE.SphereGeometry(0.045 + (i % 3) * 0.012, 6, 4), oil, [x, 1.195, z], {
      name: `oilDrop${i}`,
      group: "weathering",
    });
  }

  // Small repeated pale inspection tabs along the aft fairing.
  for (let i = 0; i < 5; i++) {
    const z = -0.45 - i * 0.38;
    box([0.025, 0.025, 0.16], [-0.76, 2.18 - i * 0.025, z], dim, {
      name: `inspectionTab${i}`,
      group: "markings",
    });
  }

  // Blueprint hatch cross-lines and a tiny rear access plate.
  box([0.020, 0.22, 0.42], [1.005, 1.88, -1.72], panel, {
    name: "rearAccessPlate",
    group: "panels",
  });
  for (let i = 0; i < 3; i++) {
    rod(
      [1.018, 1.78 + i * 0.10, -1.93],
      [1.018, 1.78 + i * 0.10, -1.51],
      0.009,
      cyan,
      { name: `rearPlateLine${i}`, group: "seams" },
    );
  }

  // A few bright rivets along the lower cowl edge and fairing shoulder.
  const random = rng(7315);
  for (let i = 0; i < 24; i++) {
    const side = i % 2 ? -1 : 1;
    const z = 3.95 - (i % 12) * 0.13;
    const x = side * (0.70 + random() * 0.25);
    const y = 1.50 + random() * 0.10;
    part(new THREE.SphereGeometry(0.018, 5, 4), white, [x, y, z], {
      name: `lowerRivet${i}`,
      group: "rivets",
    });
  }
}
    return buildFuselage;
  })(),
  // wings
  (() => {
function buildWings({ b, J, P, M }: Ctx) {
  const hull = P.hullBlue ?? P.hull;
  const panel = P.panelBlue ?? P.panel;
  const cyan = P.lineCyan ?? P.cyan;
  const white = P.inkWhite ?? P.white;
  const steel = P.steelPale ?? P.steel;
  const hub = P.steelHub ?? P.steel;
  const dark = P.radiDark ?? P.deepInk ?? "#0e2240";
  const tyre = P.tyre ?? "#13202e";

  const airframe = J.airframe ?? J.body;
  const leftAileron = J.aileronL;
  const rightAileron = J.aileronR;

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    bone = airframe,
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      name,
      flat: true,
    });

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
    bone = airframe,
    name?: string,
  ) => b.rod(a, z, radius, { color, bone, name, section: { ngon: 6 } });

  const cylinder = (
    radius: number,
    depth: number,
    at: [number, number, number],
    color: string,
    bone = airframe,
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, 16), color, {
      at,
      bone,
      name,
      flat: true,
    });

  // Main wing: two faceted elliptical half-planes, with a rounded nose and a sharp trailing edge.
  const wingHalf = [
    [0, -0.58],
    [1.15, -0.58],
    [2.35, -0.52],
    [3.65, -0.38],
    [4.75, -0.12],
    [5.38, 0.36],
    [5.6, 0.92],
    [5.48, 1.48],
    [4.92, 1.86],
    [3.8, 2.0],
    [2.35, 2.0],
    [1.05, 1.94],
    [0, 1.88],
  ] as [number, number][];

  for (const side of [-1, 1]) {
    const outline = wingHalf.map(([x, z]) => [side * x, z] as [number, number]);
    b.extrude(outline, {
      at: [0, 1.67, 0],
      x: [side, 0, 0],
      y: [0, 0, 1],
      thickness: [0.34, 0.08],
      bevel: 0.025,
      smoothing: 1,
      color: hull,
      bone: airframe,
      name: side > 0 ? "wingL_main" : "wingR_main",
    });

    // Dark lower surface visible around the trailing edge.
    const lower = outline.map(([x, z]) => [x, z - 0.01] as [number, number]);
    b.extrude(lower, {
      at: [0, 1.485, 0],
      x: [side, 0, 0],
      y: [0, 0, 1],
      thickness: 0.025,
      color: dark,
      bone: airframe,
      name: side > 0 ? "wingL_underside" : "wingR_underside",
    });

    // Outer panel overlay, deliberately segmented like a blueprint plate.
    b.extrude(
      [
        [side * 1.15, -0.38],
        [side * 2.45, -0.43],
        [side * 4.05, -0.28],
        [side * 4.95, 0.22],
        [side * 5.38, 0.72],
        [side * 5.22, 1.56],
        [side * 4.4, 1.86],
        [side * 2.4, 1.91],
        [side * 1.15, 1.84],
      ] as [number, number][],
      {
        at: [0, 1.855, 0],
        x: [side, 0, 0],
        y: [0, 0, 1],
        thickness: 0.012,
        bevel: 0.008,
        color: panel,
        bone: airframe,
        name: side > 0 ? "wingL_outerPanel" : "wingR_outerPanel",
      },
    );

    // Chordwise panel seams.
    for (const z of [1.62, 0.62, -0.18]) {
      const span = z > 1 ? 4.8 : z > 0 ? 5.15 : 4.72;
      rod(
        [side * 1.0, 1.885, z],
        [side * span, 1.885, z],
        0.009,
        cyan,
        airframe,
        side > 0 ? "wingL_seam" : "wingR_seam",
      );
    }

    // Wing root fillet and a pair of small root ribs.
    rod([side * 0.15, 1.82, 1.95], [side * 0.95, 1.83, 1.9], 0.018, cyan);
    rod([side * 0.22, 1.82, 0.02], [side * 1.05, 1.82, 0.02], 0.012, cyan);

    // National roundel: cyan outer field, white middle, blue centre.
    const rx = side * 3.62;
    cylinder(0.57, 0.018, [rx, 1.895, 1.0], cyan, airframe, "roundel_outer");
    cylinder(0.39, 0.022, [rx, 1.91, 1.0], white, airframe, "roundel_white");
    cylinder(0.22, 0.026, [rx, 1.925, 1.0], hub, airframe, "roundel_core");

    // Gun fairings ahead of the roundel.
    for (const x of [side * 2.18, side * 2.9]) {
      b.part(new THREE.CapsuleGeometry(0.075, 0.48, 4, 8), hull, {
        at: [x, 1.93, 1.58],
        bone: airframe,
        rotation: [0, Math.PI / 2, 0],
        name: "gunFairing",
        flat: true,
      });
      for (let i = 0; i < 4; i++) {
        cylinder(0.018, 0.012, [x + side * (i - 1.5) * 0.09, 2.01, 1.58], white);
      }
    }

    // Aileron, a thin separate trailing-edge control surface.
    const aileron = [
      [side * 2.78, -0.58],
      [side * 5.18, -0.58],
      [side * 5.32, -0.12],
      [side * 4.95, 0.18],
      [side * 2.78, 0.12],
    ] as [number, number][];
    b.extrude(aileron, {
      at: [0, 1.52, 0],
      x: [side, 0, 0],
      y: [0, 0, 1],
      thickness: 0.105,
      bevel: 0.012,
      color: hull,
      bone: side > 0 ? leftAileron : rightAileron,
      name: side > 0 ? "aileronL_surface" : "aileronR_surface",
    });
    rod(
      [side * 2.82, 1.605, -0.5],
      [side * 5.1, 1.605, -0.5],
      0.012,
      cyan,
      side > 0 ? leftAileron : rightAileron,
      "aileron_hinge",
    );
    box([0.18, 0.018, 0.06], [side * 4.62, 1.59, -0.18], white, side > 0 ? leftAileron : rightAileron, "trimTab");
    box([0.13, 0.018, 0.045], [side * 4.82, 1.59, -0.18], white, side > 0 ? leftAileron : rightAileron, "trimTab");

    // Rivet rows along the wing's leading panel.
    for (let i = 0; i < 9; i++) {
      const x = side * (1.25 + i * 0.46);
      cylinder(0.025, 0.012, [x, 1.91, 1.78], white, airframe, "wing_rivet");
    }

    // Pale wingtip identification/light plate.
    box([0.12, 0.025, 0.34], [side * 5.48, 1.91, 0.82], white, airframe, "wingtip_light");
  }

  // Radiator bath under the port wing, a dark inset box with a bright blueprint grille.
  box([1.15, 0.18, 0.72], [0.95, 1.36, 0.82], dark, airframe, "radiator_bath");
  for (let i = 0; i < 7; i++) {
    rod(
      [0.48 + i * 0.16, 1.27, 0.52],
      [0.48 + i * 0.16, 1.27, 1.12],
      0.014,
      steel,
      airframe,
      "radiator_slats",
    );
  }
  rod([0.42, 1.285, 0.5], [1.54, 1.285, 0.5], 0.014, cyan);
  rod([0.42, 1.285, 1.14], [1.54, 1.285, 1.14], 0.014, cyan);

  // Starboard pitot tube under the outer leading edge.
  rod([5.08, 1.43, 1.82], [5.62, 1.39, 1.82], 0.018, steel, airframe, "pitot");
  cylinder(0.034, 0.025, [5.58, 1.39, 1.82], hub, airframe, "pitot_tip");

  // Cyanotype callout arrow near the port aileron.
  rod([-4.15, 1.93, -0.72], [-3.45, 1.94, -0.42], 0.009, cyan, airframe, "aileron_callout");
  rod([-3.45, 1.94, -0.42], [-3.66, 1.94, -0.43], 0.009, cyan, airframe, "callout_head");
  rod([-3.45, 1.94, -0.42], [-3.56, 1.94, -0.61], 0.009, cyan, airframe, "callout_head");

  // Small under-wing inspection hatches, with white blueprint corners.
  for (const side of [-1, 1]) {
    const hatch = box([0.34, 0.018, 0.22], [side * 1.46, 1.285, 0.02], dark, airframe, "wing_hatch");
    rod([side * 1.28, 1.3, -0.08], [side * 1.64, 1.3, -0.08], 0.007, cyan);
    rod([side * 1.28, 1.3, 0.1], [side * 1.64, 1.3, 0.1], 0.007, cyan);
  }
}
    return buildWings;
  })(),
  // empennage
  (() => {
function buildEmpennage({ b, J, P, M }: Ctx) {
  const airframe = J.airframe ?? J.body;
  const rudder = J.rudder;
  const elevatorL = J.elevatorL;
  const elevatorR = J.elevatorR;

  const hull = P.hull ?? P.hullBlue ?? "#0c2f52";
  const panel = P.panel ?? P.panelBlue ?? "#14406e";
  const cyan = P.cyan ?? P.lineCyan ?? "#4fd8ff";
  const white = P.white ?? P.inkWhite ?? "#dceeff";
  const dim = P.dim ?? P.inkDim ?? "#9fc9e8";
  const deep = P.deep ?? P.deepInk ?? "#0a1830";
  const steel = P.steel ?? P.steelPale ?? "#8fb7d9";
  const hub = P.hub ?? P.steelHub ?? "#c9e6ff";
  const green = P.green ?? P.roddGreen ?? "#3fa66b";
  const amber = P.beacon ?? "#ff8a4d";

  const part = (
    geo: THREE.BufferGeometry,
    color: string,
    at: THREE.Vector3 | [number, number, number],
    bone: any = airframe,
    extra: any = {},
  ) => b.part(geo, color, { at, bone, ...extra });

  const rod = (
    a: THREE.Vector3 | [number, number, number],
    z: THREE.Vector3 | [number, number, number],
    radius: number,
    color: string,
    bone: any = airframe,
  ) => b.rod(a, z, radius, { color, bone, caps: "round", sides: 6 });

  const box = (
    at: [number, number, number],
    size: [number, number, number],
    color: string,
    bone: any = airframe,
  ) =>
    part(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      color,
      at,
      bone,
    );

  const tailRoot: [number, number, number] = M.tailRoot ?? [0, 1.85, -3.6];

  // Short continuation of the fuselage into the tailplane root.
  b.sweep(
    [
      [0, 1.85, -3.58],
      [0, 1.84, -3.82],
      [0, 1.86, -4.02],
    ],
    [0.32, 0.22, 0.12],
    {
      color: hull,
      bone: airframe,
      sides: 8,
      caps: "round",
      name: "empennage.tailCone",
    },
  );

  // Tailplane: a broad, slightly pointed elliptical slab.
  const tailplane = b.extrude(
    [
      [-2.1, -0.63, "sharp"],
      [-1.78, -0.82],
      [-0.72, -0.72],
      [0, -0.56],
      [0.72, -0.72],
      [1.78, -0.82],
      [2.1, -0.63, "sharp"],
      [2.0, 0.35],
      [1.52, 0.67],
      [0.62, 0.73],
      [0, 0.64],
      [-0.62, 0.73],
      [-1.52, 0.67],
      [-2.0, 0.35],
    ],
    {
      at: [0, 1.9, -4.25],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: [0.11, 0.075],
      bevel: 0.025,
      smoothing: 1,
      color: hull,
      bone: airframe,
      name: "empennage.tailplane",
    },
  );

  // Pale structural panel patches on the top surface.
  for (const s of [-1, 1]) {
    part(
      new THREE.BoxGeometry(0.72, 0.018, 0.64),
      panel,
      [s * 1.18, 1.972, -4.3],
      airframe,
    );
    part(
      new THREE.BoxGeometry(0.18, 0.012, 0.48),
      dim,
      [s * 1.77, 1.983, -4.18],
      airframe,
    );

    // Chordwise cyan seam and short rib marks.
    rod(
      [s * 0.18, 1.988, -4.2],
      [s * 1.96, 1.988, -4.2],
      0.012,
      cyan,
    );
    rod(
      [s * 0.48, 1.99, -4.72],
      [s * 0.48, 1.99, -3.78],
      0.008,
      cyan,
    );
    rod(
      [s * 1.28, 1.99, -4.67],
      [s * 1.28, 1.99, -3.86],
      0.008,
      cyan,
    );
  }

  // Elevators, separated from the fixed tailplane by a glowing hinge line.
  const elevatorOutline = [
    [-0.04, -0.02, "sharp"] as [number, number, "sharp"],
    [-0.04, -0.69],
    [0.96, -0.72],
    [1.04, -0.59],
    [1.04, -0.02],
  ];

  for (const s of [-1, 1]) {
    const elevator = b.extrude(elevatorOutline, {
      at: [s * 1.02, 1.91, -4.23],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.075,
      bevel: 0.018,
      smoothing: 1,
      color: hull,
      bone: s > 0 ? elevatorL : elevatorR,
      name: s > 0 ? "empennage.elevatorL" : "empennage.elevatorR",
    });

    rod(
      [s * 0.04, 1.965, -4.28],
      [s * 0.98, 1.965, -4.28],
      0.014,
      cyan,
      s > 0 ? elevatorL : elevatorR,
    );

    // Elevator hinge bolt caps.
    for (let i = 0; i < 4; i++) {
      part(
        new THREE.SphereGeometry(0.026, 6, 4),
        white,
        [s * (0.16 + i * 0.24), 1.985, -4.3],
        s > 0 ? elevatorL : elevatorR,
      );
    }

    // Trim-tab mark on the port elevator.
    if (s > 0) {
      part(
        new THREE.BoxGeometry(0.24, 0.018, 0.08),
        white,
        [0.63, 1.985, -4.73],
        elevatorL,
      );
      rod([0.52, 1.998, -4.73], [0.76, 1.998, -4.73], 0.006, cyan, elevatorL);
    }
  }

  // Fin, a swept rounded vertical blade.
  const fin = b.extrude(
    [
      [-0.05, 0, "sharp"],
      [0.05, 0, "sharp"],
      [0.18, 0.18],
      [0.43, 0.68],
      [0.48, 1.16],
      [0.38, 1.42],
      [0.12, 1.56],
      [-0.3, 1.42],
      [-0.62, 1.1],
      [-0.76, 0.55],
      [-0.72, 0.1],
      [-0.55, -0.04],
    ],
    {
      at: [0, 2.03, -3.65],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.16, 0.12],
      bevel: 0.025,
      smoothing: 1,
      color: hull,
      bone: airframe,
      name: "empennage.fin",
    },
  );

  // Panel-blue leading edge strip, built as a separate bold silhouette.
  b.extrude(
    [
      [0.02, 0, "sharp"],
      [0.18, 0.18],
      [0.43, 0.68],
      [0.48, 1.16],
      [0.38, 1.42],
      [0.24, 1.48],
      [0.23, 1.12],
      [0.16, 0.65],
      [0.02, 0.18],
    ],
    {
      at: [0.084, 2.04, -3.65],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.018,
      color: panel,
      bone: airframe,
      name: "empennage.finLeadingEdge",
    },
  );

  // Fin flash: three vertical plates near the leading edge.
  for (const [i, color] of [
    [0, hub],
    [1, green],
    [2, hub],
  ] as [number, string][]) {
    part(
      new THREE.BoxGeometry(0.018, 0.34, 0.12),
      color,
      [0.104, 2.76, -3.49 - i * 0.14],
      airframe,
    );
  }

  // Fin panel seams and rivet line.
  rod([0.11, 2.17, -3.74], [0.11, 3.24, -4.07], 0.009, cyan);
  rod([0.11, 2.22, -4.02], [0.11, 2.22, -4.48], 0.008, cyan);
  for (let i = 0; i < 7; i++) {
    part(
      new THREE.SphereGeometry(0.022, 6, 4),
      white,
      [0.115, 2.25 + i * 0.14, -3.98 - i * 0.055],
      airframe,
    );
  }

  // Rudder, trailing behind the fin and riding its hinge joint.
  const rudderPlate = b.extrude(
    [
      [-0.04, 0.02, "sharp"],
      [-0.1, -0.28],
      [-0.08, -0.82],
      [0.02, -1.15],
      [0.19, -1.24],
      [0.31, -1.08],
      [0.34, -0.48],
      [0.28, -0.04],
    ],
    {
      at: [0, 2.39, -4.18],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.11,
      bevel: 0.02,
      smoothing: 1,
      color: hull,
      bone: rudder,
      name: "empennage.rudder",
    },
  );

  // Rudder trailing edge and three hinge lines.
  rod([0.072, 2.45, -4.2], [0.072, 2.45, -5.23], 0.012, cyan, rudder);
  for (const y of [2.52, 2.78, 3.04]) {
    rod(
      [-0.065, y, -4.2],
      [0.27, y, -4.2],
      0.009,
      cyan,
      rudder,
    );
  }

  // White rudder trim tab and small rivet row.
  part(new THREE.BoxGeometry(0.16, 0.22, 0.025), white, [0.23, 2.58, -4.2], rudder);
  for (let i = 0; i < 5; i++) {
    part(
      new THREE.SphereGeometry(0.021, 6, 4),
      white,
      [0.09, 2.5 + i * 0.16, -4.19],
      rudder,
    );
  }

  // Tailskid/fork, deliberately above the small wheel supplied by the undercarriage builder.
  rod([0, 0.56, -4.1], [0.06, 0.42, -4.34], 0.035, steel);
  rod([0, 0.56, -4.1], [-0.06, 0.42, -4.34], 0.035, steel);
  rod([0, 0.56, -4.1], [0, 0.46, -4.28], 0.026, cyan);
  part(
    new THREE.BoxGeometry(0.2, 0.05, 0.12),
    deep,
    [0, 0.54, -4.1],
    airframe,
  );

  // Amber fin-tip beacon with cyan collar.
  const beacon = b.lathe(
    [
      [0, 0],
      [0.065, 0],
      [0.075, 0.035],
      [0.06, 0.09],
      [0.025, 0.13],
      [0, 0.14],
    ],
    {
      at: [0, 3.56, -4.02],
      axis: [0, 1, 0],
      segments: 8,
      color: amber,
      bone: airframe,
      name: "empennage.beacon",
    },
  );
  rod([0, 3.555, -4.02], [0.01, 3.555, -4.02], 0.006, cyan);

  // Underside tailplane adjuster: cyan arrow with chevron head.
  rod([0, 1.79, -4.18], [0, 1.57, -4.18], 0.009, cyan);
  rod([0, 1.58, -4.18], [0.07, 1.68, -4.18], 0.009, cyan);
  rod([0, 1.58, -4.18], [-0.07, 1.68, -4.18], 0.009, cyan);
  part(
    new THREE.SphereGeometry(0.035, 6, 4),
    white,
    [0, 1.55, -4.18],
    airframe,
  );

  // Small pale inspection panels on the tailplane underside.
  for (const s of [-1, 1]) {
    part(
      new THREE.BoxGeometry(0.28, 0.018, 0.16),
      white,
      [s * 0.7, 1.84, -4.72],
      airframe,
    );
    for (let j = 0; j < 3; j++) {
      part(
        new THREE.SphereGeometry(0.018, 6, 4),
        cyan,
        [s * (0.61 + j * 0.09), 1.86, -4.72],
        airframe,
      );
    }
  }
}
    return buildEmpennage;
  })(),
  // undercarriage
  (() => {
function buildUndercarriage({ b, J, P, M }: Ctx) {
  const steel = P.steelPale;
  const hub = P.steelHub;
  const cyan = P.lineCyan;
  const white = P.inkWhite;
  const hull = P.hullBlue;
  const tyre = P.tyre;
  const deep = P.deepInk;
  const dust = P.oilStain;

  const V = (p: readonly number[]) => new THREE.Vector3(p[0], p[1], p[2]);

  const cylinder = (
    radius: number,
    depth: number,
    color: string,
    at: readonly number[],
    dir: readonly number[],
    bone: any,
    sides = 12,
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, sides, 1, false), color, {
      at,
      dir,
      bone,
      flat: true,
      name,
      group: "undercarriage",
    });

  const sphere = (
    radius: number,
    color: string,
    at: readonly number[],
    bone: any,
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
      at,
      bone,
      flat: true,
      name,
      group: "undercarriage",
    });

  const rod = (
    a: readonly number[],
    c: readonly number[],
    radius: number,
    color: string,
    bone: any,
    name?: string,
  ) => b.rod(a, c, radius, { color, bone, caps: "flat", section: { ngon: 6 }, name, group: "undercarriage" });

  const addWheel = (
    side: 1 | -1,
    center: readonly number[],
    wheelBone: any,
    scale: number,
    name: string,
  ) => {
    const xDir: [number, number, number] = [side, 0, 0];
    const faceX = center[0] + side * (0.091 * scale);

    cylinder(0.35 * scale, 0.16 * scale, tyre, center, xDir, wheelBone, 12, `${name}_tyre`);
    cylinder(0.285 * scale, 0.166 * scale, deep, center, xDir, wheelBone, 12, `${name}_tread`);
    cylinder(0.145 * scale, 0.19 * scale, hub, center, xDir, wheelBone, 10, `${name}_hub`);
    cylinder(0.055 * scale, 0.198 * scale, steel, center, xDir, wheelBone, 8, `${name}_axle`);

    // Five bright spoke studs and the small central axle cap.
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 + Math.PI / 10;
      const p: [number, number, number] = [
        faceX,
        center[1] + Math.cos(a) * 0.20 * scale,
        center[2] + Math.sin(a) * 0.20 * scale,
      ];
      cylinder(0.018 * scale, 0.014 * scale, cyan, p, xDir, wheelBone, 6, `${name}_spoke_${i}`);
    }
    cylinder(0.034 * scale, 0.215 * scale, white, center, xDir, wheelBone, 8, `${name}_serial`);
    sphere(0.018 * scale, white, [faceX + side * 0.012, center[1] + 0.22 * scale, center[2]], wheelBone, `${name}_serialDot`);
  };

  const leftHub: [number, number, number] = [2.05, 0.35, 0.75];
  const rightHub: [number, number, number] = [-2.05, 0.35, 0.75];

  // Main undercarriage legs, deliberately chunky and visibly raked forward.
  rod(M.gearAnchorL, leftHub, 0.075, steel, J.airframe, "legL");
  rod(M.gearAnchorR, rightHub, 0.075, steel, J.airframe, "legR");

  // Reinforcing V-braces return to hardpoints beneath the wing.
  rod([2.05, 0.35, 0.75], [1.12, 1.28, 0.40], 0.032, steel, J.airframe, "braceL_outer");
  rod([2.05, 0.35, 0.75], [0.88, 1.27, 0.52], 0.028, steel, J.airframe, "braceL_inner");
  rod([-2.05, 0.35, 0.75], [-1.12, 1.28, 0.40], 0.032, steel, J.airframe, "braceR_outer");
  rod([-2.05, 0.35, 0.75], [-0.88, 1.27, 0.52], 0.028, steel, J.airframe, "braceR_inner");

  // Jointed retract-cover plates, mirrored as two angular blue doors.
  const coverL = b.slab(
    [
      [1.02, 1.27, 0.46],
      [1.72, 1.27, 0.55],
      [1.96, 0.92, 0.72],
      [1.30, 0.88, 0.62],
    ],
    { color: hull, thickness: 0.028, bone: J.airframe, name: "retractCoverL", group: "undercarriage" },
  );
  const coverR = b.slab(
    [
      [-1.02, 1.27, 0.46],
      [-1.72, 1.27, 0.55],
      [-1.96, 0.92, 0.72],
      [-1.30, 0.88, 0.62],
    ],
    { color: hull, thickness: 0.028, bone: J.airframe, name: "retractCoverR", group: "undercarriage" },
  );

  // Cyan edge rails make the doors legible as blueprint plates.
  rod([1.04, 1.292, 0.46], [1.72, 1.292, 0.55], 0.009, cyan, J.airframe, "coverEdgeL");
  rod([-1.04, 1.292, 0.46], [-1.72, 1.292, 0.55], 0.009, cyan, J.airframe, "coverEdgeR");
  rod([1.72, 1.292, 0.55], [1.95, 0.94, 0.72], 0.008, cyan, J.airframe, "coverEdgeL2");
  rod([-1.72, 1.292, 0.55], [-1.95, 0.94, 0.72], 0.008, cyan, J.airframe, "coverEdgeR2");

  addWheel(1, leftHub, J.wheelFL, 1, "wheelFL");
  addWheel(-1, rightHub, J.wheelFR, 1, "wheelFR");

  // Mud/dust plates at the upper leg sockets.
  for (const s of [1, -1] as const) {
    b.part(
      new THREE.CircleGeometry(0.105, 8),
      dust,
      {
        at: [s * 0.72, 1.285, 0.57],
        dir: [0, 1, 0],
        axis: "z",
        bone: J.airframe,
        flat: true,
        name: `mud_${s > 0 ? "L" : "R"}`,
        group: "undercarriage",
      },
    );
  }

  // Tailwheel fork and axle.
  const tailCenter: [number, number, number] = [0, 0.32, -4.2];
  rod([0, 0.55, -4.10], [0.10, 0.37, -4.18], 0.034, steel, J.airframe, "tailForkL");
  rod([0, 0.55, -4.10], [-0.10, 0.37, -4.18], 0.034, steel, J.airframe, "tailForkR");
  cylinder(0.14, 0.13, tyre, tailCenter, [1, 0, 0], J.tailwheel, 10, "tailwheel_tyre");
  cylinder(0.105, 0.145, deep, tailCenter, [1, 0, 0], J.tailwheel, 10, "tailwheel_tread");
  cylinder(0.062, 0.16, hub, tailCenter, [1, 0, 0], J.tailwheel, 8, "tailwheel_hub");
  cylinder(0.021, 0.175, cyan, tailCenter, [1, 0, 0], J.tailwheel, 6, "tailwheel_pin");

  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    sphere(
      0.011,
      white,
      [0.073, tailCenter[1] + Math.cos(a) * 0.068, tailCenter[2] + Math.sin(a) * 0.068],
      J.tailwheel,
      `tailwheel_dot_${i}`,
    );
  }

  // Blueprint callout arrow beside the starboard leg.
  const arrowA: [number, number, number] = [-1.48, 0.86, 0.96];
  const arrowB: [number, number, number] = [-1.98, 0.56, 0.82];
  rod(arrowA, arrowB, 0.008, cyan, J.airframe, "gearCallout");
  rod(arrowB, [-1.82, 0.58, 0.84], 0.008, cyan, J.airframe, "gearCalloutHeadA");
  rod(arrowB, [-1.91, 0.70, 0.80], 0.008, cyan, J.airframe, "gearCalloutHeadB");
}
    return buildUndercarriage;
  })(),
  // noseAndCanopy
  (() => {
function buildNoseAndCanopy({ b, J, P, M }: Ctx) {
  const steel = P.steelPale ?? "#8fb7d9";
  const hubSteel = P.steelHub ?? "#c9e6ff";
  const blue = P.hullBlue ?? P.hull ?? "#0c2f52";
  const panel = P.panelBlue ?? "#14406e";
  const cyan = P.lineCyan ?? "#4fd8ff";
  const white = P.inkWhite ?? "#dceeff";
  const deep = P.deepInk ?? "#0a1830";
  const glass = P.glazing ?? "#8fe3ff";
  const green = P.roddGreen ?? "#3fa66b";

  const air = J.airframe ?? J.body;
  const prop = J.propHub ?? air;
  const spinnerBase = M.spinnerBase ?? [0, 1.9, 4.3];
  const canopyBase = M.canopyBase ?? [0, 2.42, 0.35];

  const v = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);
  const add = (p: number[], q: THREE.Vector3) => v(p).add(q).toArray() as [number, number, number];
  const cyl = (r: number, h: number, sides = 10) =>
    new THREE.CylinderGeometry(r, r, h, sides, 1, false);
  const sphere = (r: number, ws = 10, hs = 6) =>
    new THREE.SphereGeometry(r, ws, hs);

  // ------------------------------------------------------------------------------------------------
  // Spinner: a deliberately faceted, pale blueprint-metal cone, seated into the cowl.
  // The lathe profile is radius against local Y; orient its axis toward +Z.
  const spinner = b.lathe(
    [
      [0, 0],
      [0.42, 0],
      [0.40, 0.08],
      [0.30, 0.25],
      [0.17, 0.43],
      [0.055, 0.55],
      [0, 0.61],
    ],
    {
      at: spinnerBase,
      axis: [0, 0, 1],
      segments: 12,
      color: steel,
      bone: air,
      name: "spinnerCone",
      group: "noseAndCanopy",
    },
  );

  // Cyanotype contour rings around the spinner.
  for (const [z, r] of [
    [4.37, 0.415],
    [4.49, 0.31],
    [4.64, 0.17],
  ] as const) {
    b.part(
      new THREE.TorusGeometry(r, 0.009, 5, 16),
      cyan,
      {
        at: [0, 1.9, z],
        dir: [0, 0, 1],
        axis: "y",
        bone: air,
        name: "spinnerContour",
        group: "noseAndCanopy",
      },
    );
  }

  b.part(new THREE.SphereGeometry(0.035, 8, 5), white, {
    at: [0, 1.9, 4.91],
    bone: air,
    name: "spinnerCrestDot",
    group: "noseAndCanopy",
  });

  // A small blue seam at the spinner/cowl hand-off.
  b.part(new THREE.TorusGeometry(0.425, 0.012, 5, 18), white, {
    at: [0, 1.9, 4.305],
    dir: [0, 0, 1],
    axis: "y",
    bone: air,
    name: "spinnerBaseSeam",
    group: "noseAndCanopy",
  });

  // ------------------------------------------------------------------------------------------------
  // Propeller. Five broad, low-poly blades fan in the plane facing the nose.
  // Each blade is a tapered extruded plank with a separate pale tip band.
  const center = v([0, 1.9, 4.56]);
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5 + 0.12;
    const radial = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
    const tangent = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0);
    const root = center.clone().addScaledVector(radial, 0.13);
    const tip = center.clone().addScaledVector(radial, 1.50);

    // A swept blade silhouette, thickness along Z.
    const outline: [number, number, "sharp"?][] = [
      [0.00, -0.075, "sharp"],
      [0.35, -0.105, "sharp"],
      [1.20, -0.065, "sharp"],
      [1.50, -0.025, "sharp"],
      [1.50, 0.025, "sharp"],
      [1.18, 0.075, "sharp"],
      [0.34, 0.13, "sharp"],
      [0.00, 0.075, "sharp"],
    ];
    const blade = b.extrude(outline, {
      at: root,
      x: radial.toArray() as [number, number, number],
      y: tangent.toArray() as [number, number, number],
      thickness: 0.045,
      bevel: 0.006,
      bone: prop,
      color: green,
      name: `propBlade${i + 1}`,
      group: "propeller",
    });

    // Tip band, kept separate so the white registration mark reads at a distance.
    const bandRoot = center.clone().addScaledVector(radial, 1.28);
    b.part(
      new THREE.BoxGeometry(0.22, 0.19, 0.052),
      white,
      {
        at: bandRoot,
        dir: radial.toArray() as [number, number, number],
        axis: "x",
        bone: prop,
        name: `propTipBand${i + 1}`,
        group: "propeller",
      },
    );

    // A short bright rivet line along each blade's centre.
    for (const d of [0.42, 0.72, 1.02]) {
      const p = center.clone().addScaledVector(radial, d);
      b.part(new THREE.SphereGeometry(0.018, 6, 4), white, {
        at: p,
        bone: prop,
        name: `propRivet${i + 1}`,
        group: "propeller",
      });
    }
  }

  b.part(cyl(0.16, 0.16, 12), steel, {
    at: center.toArray() as [number, number, number],
    dir: [0, 0, 1],
    bone: prop,
    name: "propRootCuff",
    group: "propeller",
  });
  b.part(cyl(0.105, 0.19, 10), hubSteel, {
    at: add(center.toArray() as [number, number, number], new THREE.Vector3(0, 0, 0.02)),
    dir: [0, 0, 1],
    bone: prop,
    name: "propHubCap",
    group: "propeller",
  });
  b.part(new THREE.SphereGeometry(0.035, 8, 5), white, {
    at: add(center.toArray() as [number, number, number], new THREE.Vector3(0, 0, 0.13)),
    bone: prop,
    name: "propHubRivet",
    group: "propeller",
  });

  // ------------------------------------------------------------------------------------------------
  // Cockpit bubble: two overlapping faceted shells make a readable low-poly canopy.
  const dome = b.part(
    new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.56),
    glass,
    {
      at: [0, 2.42, -0.16],
      scale: [0.91, 0.55, 1.34],
      bone: air,
      name: "bubbleCanopy",
      group: "cockpit",
    },
  );

  // Dark inset behind the transparent shell, giving the canopy visual depth.
  b.part(new THREE.BoxGeometry(1.22, 0.30, 1.05), deep, {
    at: [0, 2.36, -0.23],
    scale: [1, 1, 1],
    bone: air,
    name: "cockpitInterior",
    group: "cockpit",
  });

  // Canopy sill rails and longitudinal framing.
  b.rod([-0.82, 2.42, 0.47], [0.82, 2.42, 0.47], 0.025, steel, {
    bone: air,
    name: "canopyFrontSill",
    group: "cockpit",
  });
  b.rod([-0.78, 2.41, -0.76], [0.78, 2.41, -0.76], 0.022, steel, {
    bone: air,
    name: "canopyRearSill",
    group: "cockpit",
  });
  for (const s of [-1, 1]) {
    b.rod(
      [s * 0.82, 2.42, 0.43],
      [s * 0.70, 2.82, -0.18],
      0.022,
      steel,
      { bone: air, name: "canopyFrontPost", group: "cockpit" },
    );
    b.rod(
      [s * 0.70, 2.82, -0.18],
      [s * 0.57, 2.66, -0.74],
      0.022,
      steel,
      { bone: air, name: "canopyRearPost", group: "cockpit" },
    );
    b.rod(
      [s * 0.70, 2.81, -0.18],
      [s * 0.70, 2.81, -0.48],
      0.014,
      cyan,
      { bone: air, name: "canopyRailGlow", group: "cockpit" },
    );
  }

  // A segmented canopy crown hoop.
  b.sweep(
    [
      [-0.69, 2.78, -0.27],
      [-0.42, 2.91, -0.29],
      [0, 2.96, -0.30],
      [0.42, 2.91, -0.29],
      [0.69, 2.78, -0.27],
    ],
    0.018,
    {
      color: steel,
      bone: air,
      caps: "round",
      section: { ngon: 6 },
      name: "canopyCrownHoop",
      group: "cockpit",
    },
  );

  // White blueprint rivets along both canopy rails.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const p = new THREE.Vector3(
        s * (0.80 - 0.11 * t),
        2.43 + 0.37 * t,
        0.43 - 0.62 * t,
      );
      b.part(new THREE.SphereGeometry(0.018, 6, 4), white, {
        at: p,
        bone: air,
        name: "canopyRivet",
        group: "cockpit",
      });
    }
  }

  // Three-panel windscreen ahead of the sliding hood.
  for (const s of [-1, 0, 1]) {
    const x = s * 0.28;
    const panelGeo = new THREE.BoxGeometry(s === 0 ? 0.25 : 0.29, 0.34, 0.018);
    b.part(panelGeo, glass, {
      at: [x, 2.57, 0.55],
      rotation: [THREE.MathUtils.degToRad(-18), 0, 0],
      bone: air,
      name: "windscreenPanel",
      group: "cockpit",
    });
    b.part(new THREE.BoxGeometry(0.018, 0.37, 0.026), steel, {
      at: [x + (s === 0 ? 0.14 : 0.13) * (s === 0 ? 1 : s), 2.57, 0.55],
      rotation: [THREE.MathUtils.degToRad(-18), 0, 0],
      bone: air,
      name: "windscreenMullion",
      group: "cockpit",
    });
  }
  b.rod([-0.72, 2.39, 0.50], [0.72, 2.39, 0.50], 0.018, cyan, {
    bone: air,
    name: "windscreenLowerGlow",
    group: "cockpit",
  });

  // Seat, headrest, and cockpit coaming.
  b.part(new THREE.BoxGeometry(0.52, 0.62, 0.11), steel, {
    at: [0, 2.05, -0.54],
    bone: air,
    name: "pilotSeatBack",
    group: "cockpit",
  });
  b.part(new THREE.BoxGeometry(0.39, 0.34, 0.18), deep, {
    at: [0, 2.37, -0.67],
    bone: air,
    name: "pilotHeadrest",
    group: "cockpit",
  });
  b.part(new THREE.BoxGeometry(1.48, 0.11, 0.30), panel, {
    at: [0, 2.40, 0.38],
    bone: air,
    name: "cockpitCoaming",
    group: "cockpit",
  });
  b.rod([-0.72, 2.47, 0.24], [0.72, 2.47, 0.24], 0.016, steel, {
    bone: air,
    name: "coamingFrontFrame",
    group: "cockpit",
  });

  // Gunsight post and circular sight ring.
  b.rod([0, 2.48, 0.19], [0, 2.72, 0.14], 0.014, steel, {
    bone: air,
    name: "gunsightPost",
    group: "cockpit",
  });
  b.part(new THREE.TorusGeometry(0.055, 0.009, 5, 12), white, {
    at: [0, 2.72, 0.14],
    dir: [0, 1, 0],
    axis: "y",
    bone: air,
    name: "gunsightRing",
    group: "cockpit",
  });

  // Small glowing instrument panel facing the pilot.
  const instrument = b.part(new THREE.BoxGeometry(0.48, 0.16, 0.012), cyan, {
    at: [0, 2.43, 0.24],
    rotation: [THREE.MathUtils.degToRad(-12), 0, 0],
    bone: air,
    name: "instrumentGlow",
    group: "cockpit",
  });
  for (const x of [-0.17, -0.055, 0.055, 0.17]) {
    b.part(new THREE.SphereGeometry(0.018, 6, 4), white, {
      at: [x, 2.47, 0.225],
      bone: air,
      name: "instrumentMark",
      group: "cockpit",
    });
  }

  // Two tiny annotation/wiper ticks beside the canopy, like hand-inked blueprint marks.
  for (const s of [-1, 1]) {
    b.rod(
      [s * 0.88, 2.47, 0.38],
      [s * 0.98, 2.53, 0.30],
      0.012,
      white,
      { bone: air, name: "canopyAnnotationTick", group: "cockpit" },
    );
    b.rod(
      [s * 0.98, 2.53, 0.30],
      [s * 1.04, 2.53, 0.23],
      0.009,
      cyan,
      { bone: air, name: "canopyAnnotationTick", group: "cockpit" },
    );
  }

  // A thin cyan centerline over the spinner and canopy, tying the component into the blueprint language.
  b.rod([0, 2.96, -0.28], [0, 2.96, -0.05], 0.008, cyan, {
    bone: air,
    name: "canopyCenterMark",
    group: "cockpit",
  });
}
    return buildNoseAndCanopy;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "cyanSpitfire" });
  const J: Record<string, Joint> = {};
  J["airframe"] = b.joint("airframe", { at: [0,1.8,0], dir: [0,1,0], role: "spine" });
  J["propHub"] = b.joint("propHub", { parent: J["airframe"], at: [0,1.9,4.55], dir: [0,0,1], role: "hinge", group: "propeller" });
  J["rudder"] = b.joint("rudder", { parent: J["airframe"], at: [0,2.4,-4.35], dir: [0,0,-1], role: "hinge", group: "tail" });
  J["elevatorL"] = b.joint("elevatorL", { parent: J["airframe"], at: [1.3,2,-4.6], dir: [1,0,0], role: "hinge", group: "tail" });
  J["elevatorR"] = b.joint("elevatorR", { parent: J["airframe"], at: [-1.3,2,-4.6], dir: [-1,0,0], role: "hinge", group: "tail" });
  J["aileronL"] = b.joint("aileronL", { parent: J["airframe"], at: [4,1.5,-0.55], dir: [1,0,0], role: "hinge", group: "wings" });
  J["aileronR"] = b.joint("aileronR", { parent: J["airframe"], at: [-4,1.5,-0.55], dir: [-1,0,0], role: "hinge", group: "wings" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["airframe"], at: [2.05,0.35,0.75], dir: [1,0,0], role: "hinge", group: "undercarriage" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["airframe"], at: [-2.05,0.35,0.75], dir: [-1,0,0], role: "hinge", group: "undercarriage" });
  J["tailwheel"] = b.joint("tailwheel", { parent: J["airframe"], at: [0,0.32,-4.2], dir: [1,0,0], role: "hinge", group: "undercarriage" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
