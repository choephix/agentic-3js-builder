import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  svg,
} from "../../../../src/index";
import type {
  Joint,
  PointInput,
  DirectionInput,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { coil } from "../../../../kits/clockwork";

export const meta = {
  name: "M-2077 Armored Tactical Hauler",
  description:
    "An eight-wheel cyberpunk military truck with layered armor, a remote dual-cannon turret, missile pods, radar, hydraulic suspension and neon running lights.",
};

const ARMOR = "#4b554d";
const ARMOR_LIGHT = "#6c7868";
const ARMOR_DARK = "#303a35";
const PANEL = "#3d4842";
const GRAPHITE = "#252d33";
const DARK = "#12191e";
const BLACK = "#070c10";
const STEEL = "#7c898b";
const STEEL_DARK = "#465157";
const RUBBER = "#111519";
const TREAD = "#262d31";
const GLASS = "#123c48";
const GLASS_LIGHT = "#287384";
const CYAN = "#43eaff";
const CYAN_DARK = "#168ca1";
const MAGENTA = "#ff438f";
const AMBER = "#ffb52e";
const ORANGE = "#d8732e";
const YELLOW = "#e5bd45";
const RED = "#ff4949";
const STENCIL = "#d7ddc8";

type V3 = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "m2077-tactical-hauler", detail: 1 });

  // ---------------------------------------------------------------------------
  // Skeleton: wheel axles, door hinges, turret yaw, gun pitch and radar rotation.
  // ---------------------------------------------------------------------------
  const chassis = b.joint("chassis", { at: [0, 1.05, 0] });

  const wheels: { s: number; z: number; joint: Joint; tag: string }[] = [];
  const axleZ = [2.8, 1.3, -1.55, -3.05];
  const axleNames = ["front", "midFront", "midRear", "rear"];
  for (let a = 0; a < axleZ.length; a++) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const joint = b.joint(`wheel${side}${a + 1}`, {
        parent: chassis,
        at: [s * 1.37, 0.75, axleZ[a]],
        dir: [s, 0, 0],
        role: "hinge",
        group: "wheels",
      });
      wheels.push({ s, z: axleZ[a], joint, tag: `${side}-${axleNames[a]}` });
    }
  }

  const doors = new Map<number, Joint>();
  for (const s of [1, -1]) {
    doors.set(
      s,
      b.joint(s > 0 ? "doorL" : "doorR", {
        parent: chassis,
        at: [s * 1.24, 1.45, 2.82],
        dir: [0, 1, 0],
        role: "hinge",
        group: "cab",
      }),
    );
  }

  const turret = b.joint("turretYaw", {
    parent: chassis,
    at: [0, 3.43, -0.5],
    dir: [0, 1, 0],
    role: "hinge",
    group: "turret",
  });
  const gun = b.joint("gunPitch", {
    parent: turret,
    at: [0, 3.8, -0.12],
    dir: [0, 0, 1],
    role: "hinge",
    group: "turret",
  });
  const radar = b.joint("radarYaw", {
    parent: chassis,
    at: [0, 3.42, -2.85],
    dir: [0, 1, 0],
    role: "hinge",
    group: "sensors",
  });

  // ---------------------------------------------------------------------------
  // Reusable primitive assemblies.
  // ---------------------------------------------------------------------------
  function box(
    size: V3,
    at: PointInput,
    color: string,
    bone: Joint = chassis,
    rotation: V3 = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      rotation,
    });
  }

  function cyl(
    radius: number,
    depth: number,
    at: PointInput,
    color: string,
    dir: DirectionInput = [0, 1, 0],
    bone: Joint = chassis,
    segments = 12,
  ) {
    return b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      at,
      bone,
      dir,
    });
  }

  function rod(
    a: PointInput,
    c: PointInput,
    radius: number,
    color: string,
    bone: Joint = chassis,
  ) {
    return b.rod(a, c, radius, color, { bone, sides: 8 });
  }

  function rivet(at: PointInput, dir: DirectionInput, bone: Joint = chassis, r = 0.024) {
    return cyl(r, 0.018, at, STEEL, dir, bone, 6);
  }

  function neonBox(
    size: V3,
    at: PointInput,
    color = CYAN,
    bone: Joint = chassis,
    strength = 1.5,
  ) {
    return glow(box(size, at, color, bone), strength);
  }

  // ---------------------------------------------------------------------------
  // Chassis, drivetrain and armored underbody.
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    box([0.2, 0.28, 7.75], [s * 0.72, 1.0, -0.05], GRAPHITE);
    box([0.08, 0.08, 7.3], [s * 0.9, 0.82, -0.05], STEEL_DARK);
  }
  for (const z of [-3.45, -2.35, -1.15, 0.05, 1.25, 2.45, 3.4]) {
    box([2.15, 0.18, 0.16], [0, 1.0, z], STEEL_DARK);
    for (const s of [1, -1]) rivet([s * 0.73, 1.16, z], [0, 1, 0]);
  }
  box([1.7, 0.22, 5.9], [0, 0.83, -0.3], DARK);
  box([1.3, 0.16, 1.05], [0, 0.7, 1.85], GRAPHITE, chassis, [12, 0, 0]);
  box([1.25, 0.18, 1.3], [0, 0.7, -2.25], GRAPHITE);
  box([1.4, 0.24, 0.8], [0, 0.94, -0.25], ARMOR_DARK);

  for (let i = 0; i < axleZ.length; i++) {
    const z = axleZ[i];
    rod([-1.4, 0.75, z], [1.4, 0.75, z], 0.095, STEEL_DARK);
    cyl(0.22, 0.48, [0, 0.75, z], GRAPHITE, [1, 0, 0], chassis, 10);
    box([0.5, 0.16, 0.42], [0, 0.97, z], DARK);
  }

  for (const { s, z } of wheels) {
    rod([s * 1.0, 0.77, z - 0.25], [s * 0.82, 1.24, z + 0.26], 0.055, STEEL);
    rod([s * 1.09, 0.8, z + 0.24], [s * 1.02, 1.29, z - 0.16], 0.045, ORANGE);
    b.sweep(
      coil([s * 1.13, 0.86, z - 0.12], [s * 1.13, 1.36, z + 0.08], 0.07, 5),
      0.012,
      { color: STEEL, bone: chassis, sides: 6 },
    );
    rod([s * 0.72, 0.95, z], [s * 1.29, 0.75, z], 0.06, GRAPHITE);
  }

  // ---------------------------------------------------------------------------
  // Eight faceted tires, individual tread shoes, hubs and suspension guards.
  // ---------------------------------------------------------------------------
  for (const { s, z, joint } of wheels) {
    cyl(0.72, 0.48, [s * 1.37, 0.75, z], RUBBER, [s, 0, 0], joint, 16);
    cyl(0.585, 0.035, [s * 1.617, 0.75, z], TREAD, [s, 0, 0], joint, 16);
    cyl(0.3, 0.045, [s * 1.635, 0.75, z], DARK, [s, 0, 0], joint, 12);
    cyl(0.39, 0.05, [s * 1.655, 0.75, z], STEEL_DARK, [s, 0, 0], joint, 12);
    b.part(new THREE.TorusGeometry(0.315, 0.025, 6, 12), STEEL, {
      at: [s * 1.687, 0.75, z],
      bone: joint,
      dir: [s, 0, 0],
      axis: "z",
    });
    cyl(0.17, 0.09, [s * 1.69, 0.75, z], GRAPHITE, [s, 0, 0], joint, 10);
    cyl(0.075, 0.105, [s * 1.71, 0.75, z], ORANGE, [s, 0, 0], joint, 8);

    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI * 2) / 6;
      rivet(
        [s * 1.71, 0.75 + Math.cos(a) * 0.245, z + Math.sin(a) * 0.245],
        [s, 0, 0],
        joint,
        0.027,
      );
    }

    b.ring(joint, { count: 14, radius: 0.725 }, (item) => {
      b.stick(new THREE.BoxGeometry(0.19, 0.09, 0.5), TREAD, item, {
        embed: 0.25,
      });
    });

    box([0.58, 0.12, 1.34], [s * 1.36, 1.52, z], ARMOR_DARK);
    box([0.09, 0.38, 1.15], [s * 1.63, 1.32, z], PANEL);
    box([0.48, 0.08, 0.12], [s * 1.4, 1.58, z + 0.58], ARMOR_LIGHT);
    box([0.48, 0.08, 0.12], [s * 1.4, 1.58, z - 0.58], ARMOR_LIGHT);
  }

  for (const s of [1, -1]) {
    box([0.48, 0.78, 0.07], [s * 1.38, 0.55, -3.79], RUBBER);
    box([0.38, 0.09, 0.025], [s * 1.38, 0.28, -3.835], ORANGE);
    neonBox([0.06, 0.09, 0.22], [s * 1.69, 1.39, 2.8], AMBER, chassis, 1.1);
    neonBox([0.06, 0.08, 0.18], [s * 1.69, 1.38, -3.05], RED, chassis, 1.1);
  }

  // ---------------------------------------------------------------------------
  // Angular armored cab and lower hull.
  // ---------------------------------------------------------------------------
  b.loft(
    [
      { at: [0, 1.57, 3.53], w: 2.22, h: 0.68 },
      { at: [0, 1.72, 3.08], w: 2.48, h: 1.0 },
      { at: [0, 1.76, 1.0], w: 2.48, h: 1.08 },
      { at: [0, 1.72, 0.78], w: 2.35, h: 0.96 },
    ],
    { section: "box", caps: "flat", color: ARMOR, bone: chassis },
  );

  b.extrude(
    [
      [0.85, 1.82],
      [3.5, 1.82],
      [3.25, 2.35],
      [2.65, 3.18],
      [2.35, 3.35],
      [0.85, 3.35],
    ],
    {
      at: [0, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 2.42,
      bevel: 0.025,
      color: ARMOR,
      bone: chassis,
      name: "armoredCab",
    },
  );

  box([2.5, 0.12, 1.62], [0, 3.39, 1.58], ARMOR_DARK);
  box([0.9, 0.08, 0.72], [0, 3.48, 1.25], PANEL);
  box([0.72, 0.025, 0.55], [0, 3.53, 1.25], ARMOR_LIGHT);
  rod([-0.35, 3.56, 0.96], [0.35, 3.56, 0.96], 0.018, STEEL_DARK);

  // Split ballistic windshield, seated on the sloping cab face.
  function windshieldPoint(x: number, t: number, lift = 1) {
    return new THREE.Vector3(
      x,
      2.39 + t * 0.71 + 0.012 * lift,
      3.225 - t * 0.53 + 0.017 * lift,
    );
  }
  for (const s of [1, -1]) {
    const inner = s * 0.045;
    const outer = s * 1.07;
    b.slab(
      [
        windshieldPoint(inner, 0),
        windshieldPoint(outer, 0),
        windshieldPoint(outer, 1),
        windshieldPoint(inner, 1),
      ],
      { thickness: 0.025, color: GLASS, bone: chassis },
    );
    rod(
      windshieldPoint(s * 0.18, 0.17, 1.8),
      windshieldPoint(s * 0.67, 0.55, 1.8),
      0.014,
      BLACK,
    );
    rod(
      windshieldPoint(s * 0.18, 0.17, 1.8),
      windshieldPoint(s * 0.15, 0.07, 1.8),
      0.017,
      STEEL_DARK,
    );
    glow(
      rod(
        windshieldPoint(s * 0.35, 0.84, 1.8),
        windshieldPoint(s * 0.88, 0.84, 1.8),
        0.009,
        GLASS_LIGHT,
      ),
      0.7,
    );
  }
  rod(windshieldPoint(-1.13, 0, 1.4), windshieldPoint(1.13, 0, 1.4), 0.035, GRAPHITE);
  rod(windshieldPoint(-1.13, 1, 1.4), windshieldPoint(1.13, 1, 1.4), 0.035, GRAPHITE);
  rod(windshieldPoint(0, 0, 1.5), windshieldPoint(0, 1, 1.5), 0.035, GRAPHITE);
  for (const s of [1, -1]) {
    rod(windshieldPoint(s * 1.13, 0, 1.4), windshieldPoint(s * 1.13, 1, 1.4), 0.035, GRAPHITE);
  }

  // Side glazing, armored doors, handles, mirrors and steps.
  for (const s of [1, -1]) {
    const door = doors.get(s)!;
    const x = s * 1.235;
    b.slab(
      [
        [x, 2.42, 3.02],
        [x, 3.1, 2.72],
        [x, 3.1, 1.25],
        [x, 2.42, 1.25],
      ],
      { thickness: 0.025, color: GLASS, bone: door },
    );
    rod([x, 2.4, 3.05], [x, 3.13, 2.72], 0.032, GRAPHITE, door);
    rod([x, 3.13, 2.72], [x, 3.13, 1.2], 0.032, GRAPHITE, door);
    rod([x, 3.13, 1.2], [x, 2.4, 1.2], 0.032, GRAPHITE, door);
    rod([x, 2.4, 1.2], [x, 2.4, 3.05], 0.032, GRAPHITE, door);
    rod([x + s * 0.012, 2.43, 2.03], [x + s * 0.012, 3.1, 2.03], 0.024, ARMOR_DARK, door);
    rod([x + s * 0.015, 2.96, 2.72], [x + s * 0.015, 2.96, 1.42], 0.009, GLASS_LIGHT, door);

    b.extrude(
      [
        [1.16, 1.23],
        [2.93, 1.23],
        [3.02, 2.27],
        [1.16, 2.27],
      ],
      {
        at: [s * 1.255, 0, 0],
        x: [0, 0, 1],
        thickness: 0.065,
        bevel: 0.012,
        color: ARMOR_DARK,
        bone: door,
      },
    );
    box([0.055, 0.65, 1.25], [s * 1.303, 1.72, 2.02], PANEL, door);
    box([0.075, 0.09, 0.36], [s * 1.345, 2.14, 1.55], STEEL_DARK, door);
    box([0.09, 0.07, 0.22], [s * 1.36, 2.14, 1.55], BLACK, door);
    for (const y of [1.48, 2.05]) {
      cyl(0.045, 0.19, [s * 1.33, y, 2.84], STEEL, [0, 1, 0], door, 8);
    }
    for (const z of [1.35, 2.7]) {
      rivet([s * 1.345, 1.35, z], [s, 0, 0], door);
      rivet([s * 1.345, 2.18, z], [s, 0, 0], door);
    }

    rod([s * 1.24, 2.86, 2.82], [s * 1.62, 2.85, 3.0], 0.025, STEEL_DARK, door);
    rod([s * 1.62, 2.85, 3.0], [s * 1.68, 2.67, 3.02], 0.025, STEEL_DARK, door);
    box([0.14, 0.4, 0.28], [s * 1.68, 2.66, 3.03], GRAPHITE, door);
    box([0.145, 0.29, 0.2], [s * 1.69, 2.68, 2.88], GLASS_LIGHT, door);
    neonBox([0.04, 0.06, 0.12], [s * 1.72, 2.87, 3.12], MAGENTA, door, 1.1);

    for (const y of [0.63, 0.91]) {
      box([0.55, 0.08, 0.68], [s * 1.25, y, 2.03], STEEL_DARK);
      for (const dz of [-0.22, 0, 0.22]) {
        box([0.57, 0.025, 0.055], [s * 1.25, y + 0.05, 2.03 + dz], BLACK);
      }
    }
    rod([s * 1.5, 0.64, 1.7], [s * 1.5, 1.22, 1.7], 0.025, STEEL);
    rod([s * 1.5, 0.64, 2.36], [s * 1.5, 1.22, 2.36], 0.025, STEEL);
  }

  // ---------------------------------------------------------------------------
  // Front grille, armored lights, winch and striped ram bumper.
  // ---------------------------------------------------------------------------
  box([1.34, 0.62, 0.08], [0, 1.7, 3.57], BLACK);
  for (let i = -3; i <= 3; i++) {
    box([0.075, 0.53, 0.09], [i * 0.17, 1.7, 3.625], STEEL_DARK);
  }
  box([1.48, 0.08, 0.12], [0, 2.03, 3.59], GRAPHITE);
  box([1.48, 0.08, 0.12], [0, 1.37, 3.59], GRAPHITE);

  for (const s of [1, -1]) {
    box([0.52, 0.34, 0.18], [s * 0.91, 1.91, 3.51], GRAPHITE);
    box([0.43, 0.22, 0.05], [s * 0.91, 1.91, 3.625], DARK);
    neonBox([0.34, 0.105, 0.025], [s * 0.91, 1.94, 3.66], CYAN, chassis, 2);
    neonBox([0.12, 0.055, 0.025], [s * 1.08, 1.79, 3.65], AMBER, chassis, 1.5);
    box([0.56, 0.055, 0.12], [s * 0.91, 2.11, 3.54], ARMOR_LIGHT);
    for (const dx of [-0.19, 0.19]) {
      rivet([s * 0.91 + dx, 2.11, 3.62], [0, 0, 1]);
    }
  }

  cyl(0.16, 0.74, [0, 1.11, 3.79], STEEL_DARK, [1, 0, 0], chassis, 12);
  for (const x of [-0.31, -0.18, 0.18, 0.31]) {
    cyl(0.18, 0.045, [x, 1.11, 3.79], GRAPHITE, [1, 0, 0], chassis, 12);
  }
  b.sweep(
    catmull([
      [0, 1.1, 3.9],
      [0, 0.98, 4.0],
      [0.06, 0.83, 4.12],
    ]),
    0.022,
    { color: STEEL, bone: chassis, sides: 6 },
  );

  b.extrude(
    [
      [-1.52, 0],
      [-1.4, 0.31],
      [-0.88, 0.45],
      [0.88, 0.45],
      [1.4, 0.31],
      [1.52, 0],
    ],
    {
      at: [0, 0.61, 4.02],
      x: [1, 0, 0],
      thickness: 0.34,
      bevel: 0.025,
      color: GRAPHITE,
      bone: chassis,
    },
  );
  box([2.55, 0.25, 0.035], [0, 0.87, 4.205], BLACK);
  for (let i = -5; i <= 5; i++) {
    box([0.15, 0.28, 0.022], [i * 0.22, 0.87, 4.23], YELLOW, chassis, [0, 0, -24]);
  }
  box([3.0, 0.12, 0.22], [0, 0.59, 4.03], STEEL_DARK);
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.095, 0.025, 6, 12), ORANGE, {
      at: [s * 1.16, 0.67, 4.25],
      bone: chassis,
      dir: [0, 0, 1],
      axis: "z",
    });
    box([0.16, 0.22, 0.22], [s * 1.16, 0.8, 4.12], GRAPHITE);
  }

  // Roof-mounted light bar and armored marker lamps.
  for (const s of [1, -1]) {
    box([0.12, 0.18, 0.18], [s * 0.73, 3.52, 2.27], STEEL_DARK);
  }
  box([1.85, 0.17, 0.24], [0, 3.61, 2.27], BLACK);
  for (let i = -4; i <= 4; i++) {
    const color = Math.abs(i) >= 3 ? AMBER : CYAN;
    neonBox([0.16, 0.095, 0.035], [i * 0.19, 3.62, 2.405], color, chassis, 1.8);
  }
  box([2.08, 0.055, 0.28], [0, 3.72, 2.27], ARMOR_DARK);

  // ---------------------------------------------------------------------------
  // Rear mission module: chamfered shell, replaceable panels and dense fittings.
  // ---------------------------------------------------------------------------
  b.extrude(
    [
      [-3.75, 1.18],
      [0.62, 1.18],
      [0.62, 3.03],
      [0.3, 3.34],
      [-3.35, 3.34],
      [-3.75, 2.98],
    ],
    {
      at: [0, 0, 0],
      x: [0, 0, 1],
      thickness: 2.5,
      bevel: 0.025,
      color: ARMOR_DARK,
      bone: chassis,
      name: "missionModule",
    },
  );
  box([2.38, 0.12, 3.85], [0, 3.37, -1.55], PANEL);
  for (const z of [-3.25, -2.12, -1.28, 0.18]) {
    box([2.48, 0.09, 0.1], [0, 3.45, z], ARMOR_LIGHT);
  }
  box([1.0, 0.08, 0.82], [0, 3.46, -1.72], GRAPHITE);
  box([0.82, 0.035, 0.64], [0, 3.515, -1.72], ARMOR);
  rod([-0.31, 3.55, -1.4], [0.31, 3.55, -1.4], 0.018, STEEL);

  for (const s of [1, -1]) {
    box([0.055, 1.55, 3.82], [s * 1.27, 2.24, -1.55], PANEL);
    box([0.075, 0.12, 3.9], [s * 1.3, 1.48, -1.55], ARMOR_LIGHT);
    box([0.075, 0.12, 3.9], [s * 1.3, 3.0, -1.55], ARMOR_LIGHT);

    for (const z of [-3.32, -2.14, -0.96, 0.23]) {
      box([0.09, 1.55, 0.095], [s * 1.315, 2.24, z], ARMOR);
      for (const y of [1.58, 2.91]) rivet([s * 1.37, y, z], [s, 0, 0]);
    }

    // Two removable side armor cassettes.
    for (const z of [-1.52, -0.32]) {
      box([0.06, 0.83, 0.88], [s * 1.35, 2.15, z], ARMOR);
      box([0.075, 0.09, 0.36], [s * 1.39, 2.45, z], STEEL_DARK);
      for (const dz of [-0.34, 0.34]) {
        rivet([s * 1.4, 1.82, z + dz], [s, 0, 0]);
        rivet([s * 1.4, 2.48, z + dz], [s, 0, 0]);
      }
    }

    // Rear cooling bank with deep dark louvers.
    box([0.07, 0.86, 0.85], [s * 1.35, 2.26, -2.75], BLACK);
    for (let j = 0; j < 7; j++) {
      box([0.1, 0.055, 0.72], [s * 1.4, 1.94 + j * 0.105, -2.75], STEEL_DARK);
    }

    // Cyan data-bus conduits and status lights.
    neonBox([0.025, 0.045, 3.35], [s * 1.36, 1.38, -1.55], CYAN_DARK, chassis, 1.1);
    for (let j = 0; j < 4; j++) {
      neonBox([0.025, 0.07, 0.07], [s * 1.43, 2.66 - j * 0.13, 0.25], j === 3 ? MAGENTA : CYAN);
    }
    box([0.06, 0.68, 0.28], [s * 1.38, 2.45, 0.25], BLACK);

    // Longitudinal grab rail and standoffs.
    rod([s * 1.41, 3.12, -3.25], [s * 1.41, 3.12, 0.2], 0.025, STEEL);
    for (const z of [-3.15, -1.55, 0.1]) {
      rod([s * 1.29, 3.03, z], [s * 1.41, 3.12, z], 0.022, STEEL_DARK);
    }

    // Protected fuel / coolant tank between the middle axles.
    cyl(0.28, 1.5, [s * 1.05, 1.02, -0.1], GRAPHITE, [0, 0, 1], chassis, 12);
    for (const z of [-0.65, 0.45]) {
      cyl(0.305, 0.075, [s * 1.05, 1.02, z], STEEL_DARK, [0, 0, 1], chassis, 12);
    }
    cyl(0.075, 0.08, [s * 1.05, 1.32, -0.1], ORANGE, [0, 1, 0], chassis, 8);
    box([0.36, 0.42, 0.72], [s * 1.06, 1.0, -2.28], ARMOR);
    box([0.38, 0.06, 0.5], [s * 1.06, 1.23, -2.28], ARMOR_LIGHT);

    // Flexible external cable following the module's lower edge.
    b.sweep(
      catmull([
        [s * 1.34, 1.62, -3.3],
        [s * 1.44, 1.73, -2.55],
        [s * 1.43, 1.62, -1.5],
        [s * 1.36, 1.7, -0.45],
      ]),
      0.026,
      { color: ORANGE, bone: chassis, sides: 6 },
    );

    // Tie-down rings.
    for (const z of [-3.15, -1.6, 0.05]) {
      b.part(new THREE.TorusGeometry(0.07, 0.016, 5, 10), STEEL, {
        at: [s * 1.4, 1.62, z],
        bone: chassis,
        dir: [s, 0, 0],
        axis: "z",
      });
    }
  }

  // Rear split doors, hinges, lamps, bumper and access ladder.
  box([2.18, 1.78, 0.08], [0, 2.18, -3.77], BLACK);
  for (const s of [1, -1]) {
    box([1.02, 1.65, 0.08], [s * 0.55, 2.18, -3.825], ARMOR);
    box([0.84, 0.58, 0.055], [s * 0.55, 2.48, -3.88], PANEL);
    for (const y of [1.55, 2.78]) {
      cyl(0.045, 0.24, [s * 1.03, y, -3.89], STEEL, [0, 1, 0], chassis, 8);
    }
    box([0.08, 0.3, 0.07], [s * 0.14, 2.08, -3.9], STEEL_DARK);
    neonBox([0.26, 0.12, 0.035], [s * 0.94, 1.28, -3.9], RED, chassis, 1.7);
    neonBox([0.12, 0.08, 0.035], [s * 0.94, 1.43, -3.9], AMBER, chassis, 1.2);
  }
  box([2.65, 0.22, 0.3], [0, 0.91, -3.91], GRAPHITE);
  box([2.3, 0.08, 0.4], [0, 0.73, -4.0], STEEL_DARK);
  for (const x of [-0.46, 0.46]) {
    rod([x, 0.98, -4.03], [x, 2.7, -4.03], 0.025, STEEL);
  }
  for (let j = 0; j < 6; j++) {
    rod([-0.46, 1.1 + j * 0.29, -4.03], [0.46, 1.1 + j * 0.29, -4.03], 0.022, STEEL_DARK);
  }

  // ---------------------------------------------------------------------------
  // Twin exhaust stacks with armored heat shields and clamps.
  // ---------------------------------------------------------------------------
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 1.03, 1.45, 0.69],
        [s * 1.03, 2.7, 0.69],
        [s * 1.03, 3.58, 0.65],
        [s * 1.03, 3.82, 0.48],
      ]),
      [0.105, 0.09],
      { color: STEEL_DARK, bone: chassis, sides: 10, caps: "flat" },
    );
    cyl(0.145, 1.1, [s * 1.03, 2.45, 0.69], GRAPHITE, [0, 1, 0], chassis, 10);
    for (const y of [1.94, 2.96]) {
      cyl(0.16, 0.07, [s * 1.03, y, 0.69], STEEL, [0, 1, 0], chassis, 10);
    }
    for (let j = 0; j < 6; j++) {
      box([0.035, 0.065, 0.09], [s * 1.18, 2.05 + j * 0.16, 0.69], BLACK);
    }
    cyl(0.115, 0.035, [s * 1.03, 3.82, 0.48], BLACK, [0, 0.35, -1], chassis, 10);
    box([0.32, 0.055, 0.28], [s * 1.03, 3.87, 0.47], ARMOR_DARK, chassis, [18, 0, 0]);
  }

  // ---------------------------------------------------------------------------
  // Remote turret: traversing ring, faceted armor, paired cannon and missiles.
  // ---------------------------------------------------------------------------
  b.lathe(
    [
      [0, 0],
      [0.54, 0],
      [0.62, 0.07],
      [0.58, 0.16],
      [0.46, 0.21],
      [0, 0.21],
    ],
    { at: [0, 3.35, -0.5], segments: 16, color: GRAPHITE, bone: chassis },
  );
  cyl(0.46, 0.12, [0, 3.58, -0.5], STEEL_DARK, [0, 1, 0], turret, 16);
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI * 2) / 12;
    rivet([Math.sin(a) * 0.51, 3.57, -0.5 + Math.cos(a) * 0.51], [0, 1, 0], turret, 0.026);
  }

  box([1.04, 0.46, 0.92], [0, 3.79, -0.48], ARMOR_DARK, turret);
  box([0.88, 0.14, 0.75], [0, 4.05, -0.52], ARMOR, turret);
  box([0.72, 0.32, 0.24], [0, 3.79, 0.04], GRAPHITE, gun);
  box([0.58, 0.2, 0.14], [0, 3.8, 0.19], STEEL_DARK, gun);

  for (const s of [1, -1]) {
    cyl(0.09, 0.78, [s * 0.17, 3.82, 0.55], GRAPHITE, [0, 0, 1], gun, 10);
    cyl(0.057, 1.12, [s * 0.17, 3.82, 1.25], STEEL_DARK, [0, 0, 1], gun, 10);
    cyl(0.078, 0.26, [s * 0.17, 3.82, 1.79], GRAPHITE, [0, 0, 1], gun, 8);
    cyl(0.045, 0.025, [s * 0.17, 3.82, 1.935], BLACK, [0, 0, 1], gun, 8);
    for (const z of [0.37, 0.6, 0.82]) {
      cyl(0.105, 0.045, [s * 0.17, 3.82, z], STEEL, [0, 0, 1], gun, 10);
    }
  }

  // Three-cell missile pod on the left, sensor / ammunition unit on the right.
  box([0.42, 0.62, 0.88], [-0.72, 3.79, -0.25], ARMOR, turret);
  box([0.48, 0.68, 0.1], [-0.72, 3.79, 0.22], GRAPHITE, turret);
  for (let row = 0; row < 3; row++) {
    cyl(0.09, 0.65, [-0.72, 3.58 + row * 0.2, 0.19], STEEL_DARK, [0, 0, 1], turret, 10);
    cyl(0.072, 0.025, [-0.72, 3.58 + row * 0.2, 0.53], BLACK, [0, 0, 1], turret, 10);
    cyl(0.025, 0.03, [-0.72, 3.58 + row * 0.2, 0.55], RED, [0, 0, 1], turret, 8);
  }
  box([0.42, 0.58, 0.72], [0.72, 3.78, -0.34], PANEL, turret);
  box([0.46, 0.12, 0.76], [0.72, 4.08, -0.34], ARMOR_LIGHT, turret);
  for (const y of [3.62, 3.82]) {
    box([0.06, 0.09, 0.5], [0.96, y, -0.34], STEEL_DARK, turret);
  }

  // Turret optics and independent sensor mast.
  box([0.3, 0.26, 0.34], [0.37, 4.17, -0.15], GRAPHITE, turret);
  cyl(0.09, 0.06, [0.37, 4.18, 0.05], STEEL_DARK, [0, 0, 1], turret, 12);
  glow(cyl(0.06, 0.025, [0.37, 4.18, 0.09], CYAN, [0, 0, 1], turret, 12), 1.8);
  neonBox([0.06, 0.05, 0.04], [-0.35, 4.1, -0.02], MAGENTA, turret, 1.4);
  box([0.4, 0.06, 0.42], [-0.25, 4.16, -0.68], ARMOR_LIGHT, turret);

  // ---------------------------------------------------------------------------
  // Rear radar, antenna array and electronic-warfare details.
  // ---------------------------------------------------------------------------
  cyl(0.24, 0.12, [0, 3.48, -2.85], GRAPHITE, [0, 1, 0], radar, 12);
  rod([0, 3.52, -2.85], [0, 3.87, -2.85], 0.065, STEEL_DARK, radar);
  box([1.42, 0.54, 0.12], [0, 4.06, -2.85], ARMOR_DARK, radar);
  box([1.28, 0.4, 0.035], [0, 4.06, -2.775], BLACK, radar);
  for (let i = -3; i <= 3; i++) {
    box([0.055, 0.36, 0.025], [i * 0.17, 4.06, -2.75], STEEL_DARK, radar);
  }
  for (const y of [3.94, 4.06, 4.18]) {
    neonBox([1.12, 0.018, 0.018], [0, y, -2.73], CYAN_DARK, radar, 1.1);
  }
  box([0.3, 0.16, 0.25], [0, 3.76, -2.85], PANEL, radar);
  neonBox([0.11, 0.055, 0.03], [0, 3.77, -2.7], MAGENTA, radar, 1.3);

  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.95, 3.42, -3.18],
        [s * 0.98, 3.88, -3.18],
        [s * 1.02, 4.37, -3.22],
      ]),
      [0.018, 0.007],
      { color: STEEL_DARK, bone: chassis, sides: 6, caps: "point" },
    );
    cyl(0.05, 0.12, [s * 0.95, 3.47, -3.18], GRAPHITE, [0, 1, 0], chassis, 8);
    glow(
      b.part(new THREE.SphereGeometry(0.025, 6, 4), s > 0 ? CYAN : MAGENTA, {
        at: [s * 1.02, 4.37, -3.22],
        bone: chassis,
      }),
      1.4,
    );
  }

  b.sweep(
    catmull([
      [0.94, 3.46, 1.0],
      [0.98, 3.82, 0.98],
      [1.04, 4.19, 0.92],
    ]),
    [0.016, 0.006],
    { color: STEEL_DARK, bone: chassis, sides: 6, caps: "point" },
  );

  // Small armored roof junction boxes and visible wiring.
  for (const s of [1, -1]) {
    box([0.38, 0.2, 0.52], [s * 0.83, 3.51, -2.05], GRAPHITE);
    box([0.3, 0.04, 0.42], [s * 0.83, 3.63, -2.05], ARMOR_LIGHT);
    b.sweep(
      polyline([
        [s * 0.82, 3.51, -1.8],
        [s * 0.65, 3.5, -1.52],
        [s * 0.58, 3.48, -1.1],
      ]),
      0.022,
      { color: ORANGE, bone: chassis, sides: 6 },
    );
  }

  // ---------------------------------------------------------------------------
  // Stenciled unit graphics and small identification plates.
  // ---------------------------------------------------------------------------
  const unitTexture = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 120">
      <rect width="320" height="120" fill="#303a35"/>
      <path d="M12 12H308V108H12Z" fill="none" stroke="#d7ddc8" stroke-width="4"/>
      <path d="M24 84L58 28L92 84H72L58 60L44 84Z" fill="#d8732e"/>
      <text x="108" y="57" font-family="Arial,sans-serif" font-size="37" font-weight="900" fill="#d7ddc8">M-2077</text>
      <text x="109" y="88" font-family="Arial,sans-serif" font-size="18" font-weight="700" letter-spacing="4" fill="#d7ddc8">TACTICAL</text>
    </svg>`);

  const warningTexture = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 90">
      <rect width="220" height="90" fill="#e5bd45"/>
      <path d="M18 72L49 16L80 72Z" fill="#12191e"/>
      <path d="M49 31L44 53H54Z" fill="#e5bd45"/>
      <text x="91" y="42" font-family="Arial,sans-serif" font-size="22" font-weight="900" fill="#12191e">HIGH</text>
      <text x="91" y="68" font-family="Arial,sans-serif" font-size="22" font-weight="900" fill="#12191e">VOLTAGE</text>
    </svg>`);

  const plateTexture = svg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80">
      <rect width="300" height="80" rx="6" fill="#10191e" stroke="#43eaff" stroke-width="4"/>
      <text x="150" y="53" text-anchor="middle" font-family="monospace" font-size="39" font-weight="700" fill="#d7ddc8">NC-77-880</text>
    </svg>`);

  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.92, 0.345), "#ffffff", {
      at: [s * 1.345, 1.82, 2.0],
      bone: doors.get(s)!,
      dir: [s, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: unitTexture,
    });
    b.part(new THREE.PlaneGeometry(1.5, 0.56), "#ffffff", {
      at: [s * 1.405, 2.45, -1.55],
      bone: chassis,
      dir: [s, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: unitTexture,
    });
    b.part(new THREE.PlaneGeometry(0.58, 0.24), "#ffffff", {
      at: [s * 1.45, 1.75, -2.75],
      bone: chassis,
      dir: [s, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: warningTexture,
    });
  }
  b.part(new THREE.PlaneGeometry(0.76, 0.2), "#ffffff", {
    at: [0, 0.69, 4.205],
    bone: chassis,
    dir: [0, 0, 1],
    axis: "z",
    texture: plateTexture,
  });
  b.part(new THREE.PlaneGeometry(0.72, 0.19), "#ffffff", {
    at: [0, 1.0, -4.075],
    bone: chassis,
    dir: [0, 0, -1],
    axis: "z",
    texture: plateTexture,
  });

  // Final low, restrained cyan signature lighting.
  for (const s of [1, -1]) {
    neonBox([0.035, 0.04, 4.65], [s * 0.92, 0.72, -0.25], CYAN_DARK, chassis, 0.85);
  }

  return b.root;
}
