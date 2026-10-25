/**
 * catalogs/scifiHull.ts: spaceship-style hard-surface detail: thrusters, vents, antennas, sensor domes, panels,
 * light bars, cable runs. Same contract as catalogs/truck.ts (Mount = { bone, at, s, n, root, tag }, Roles by part
 * role; needs `box`, `cyl` from truck.ts). Every part builds in the mount frame `f = frame(m.at, m.n)`:
 * `f.local([u, v, w])` is u across the face, v out along n, w along the face the other way; a cylinder placed with
 * `{ at, dir: m.n }` stands out of the face, a torus with `{ at, dir: m.n, axis: "z" }` lies flat on it.
 *
 * SLOTS
 *   thruster (a face; default anchors.rear, n = -Z; the nozzle opens along n)
 *     thrusterBell     lathed bell shell, two rings, glowing throat disc, three struts
 *     thrusterBox      rectangular vectoring nozzle (frustumBox) with four flaps and a glowing slab inside
 *     thrusterRing     ring with eight radial vanes round a hub, glowing back ring
 *     thrusterCluster  four small bells on a plate
 *     thrusterIon      flat grid of 5 × 5 glowing emitters in a shroud
 *   vent (any face; field 0.5 × 0.3)
 *     ventLouvre  frame with five angled slats
 *     ventGrille  frame with a rod grid
 *     ventSlots   six recessed slots in a raised surround
 *     ventScoop   wedge scoop rising from the face with an open mouth
 *     ventFan     round housing, hub and six blades on a spin joint ventFan{tag}, guard ring
 *   antenna (a top face; default anchors.roofCorner)
 *     antennaWhip   base coil, tapering 1.2 m whip, tip ball
 *     antennaDish   post, yaw joint dish{tag}, shallow lathed dish, feed arm
 *     antennaBlade  flat fin (extrude) on a base plate
 *     antennaArray  crossbar on a post with four short rods
 *     antennaMast   three telescoping sections with collars, a cross at the top
 *   dome (a top face; default anchors.roofCornerFront)
 *     domeSensor   ring base, glass half sphere over a core cylinder
 *     domeCamera   half sphere with a lens cylinder poking out under a hood plate
 *     domeFaceted  six-sided lathed dome
 *     domeCluster  plate with three small domes
 *   panel (any face; field 0.8 × 0.5; default anchors.tailgate)
 *     panelRaised    bevelled plate (extrude) with four bolts
 *     panelRecessed  frame strips round a sunk inner plate with two latches
 *     panelGreeble   plate with a deterministic scatter of small boxes and drums
 *     panelStrips    six parallel ribs
 *     panelHex       five hex tiles with centre bolts
 *   lightBar (a top face; default anchors.roofFront; runs across, 1.2 m)
 *     lightBarRoof    housing with four pod lamps
 *     lightBarStrip   one long glowing strip in a housing
 *     lightBarDual    two stacked strips, the lower one short
 *     lightBarBeacon  dome lamp over a reflector on a spin joint beacon{tag}
 *   cable (signature cable*(b, m, c, to: [x, y, z]); runs from m.at to `to` with a sag; m.bone carries it)
 *     cableRun      one cable with three clips
 *     cableBundle   three cables side by side
 *     cableConduit  box-section conduit with two junction boxes
 *     cableHose     ribbed hose: a tube with rings along it
 *
 * PICKS (truck.ts assemble, `hull: { thruster?, vent?, antenna?, dome?, panel?, lightBar?, cable? }`): thrusters
 *   pair on the tail, vents on both hood sides, the cable runs from behind the cab to the left bed rail.
 */
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Builder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { glow } from "../kits/glow";
import { box, cyl } from "./truck";
import type { Anchors, Mount, Roles, V3 } from "./truck";
import { PLAIN } from "./truck";
import { row, slot } from "./board";

const TAU = Math.PI * 2;

// ---------------------------------------------------------------- thruster (opens along n)

export function thrusterBell(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.lathe(
    [
      [0, 0],
      [0.18, 0],
      [0.14, 0.1],
      [0.3, 0.5],
      [0.26, 0.5],
      [0.11, 0.12],
      [0, 0.14],
    ],
    { at: m.at, axis: m.n, segments: 10, bone: m.bone, color: c.steel },
  );
  for (const [h, r] of [
    [0.2, 0.19],
    [0.4, 0.26],
  ])
    b.part(new THREE.TorusGeometry(r, 0.02, 5, 10), c.dark, {
      at: f.local([0, h, 0]),
      dir: m.n,
      axis: "z",
      bone: m.bone,
    });
  glow(b.part(cyl(0.1, 0.03, 10), c.light, { at: f.local([0, 0.13, 0]), dir: m.n, bone: m.bone, flat: true }));
  for (const a of [90, 210, 330])
    b.rod(
      f.local([0.17 * Math.cos((a * Math.PI) / 180), 0.02, 0.17 * Math.sin((a * Math.PI) / 180)]),
      f.local([0.3 * Math.cos((a * Math.PI) / 180), 0.42, 0.3 * Math.sin((a * Math.PI) / 180)]),
      0.012,
      c.dark,
      { bone: m.bone, sides: 5 },
    ); // struts
}

export function thrusterBox(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.frustumBox(f.local([0, 0, 0]), f.local([0, 0.4, 0]), [0.44, 0.3], [0.56, 0.22], { bone: m.bone, color: c.steel });
  glow(b.part(box(0.4, 0.02, 0.14), c.light, { frame: f.moved([0, 0.12, 0]), bone: m.bone }));
  for (const [u, w, rot] of [
    [0.3, 0, 12],
    [-0.3, 0, -12],
  ])
    b.part(box(0.03, 0.3, 0.26), c.dark, {
      at: f.local([u, 0.42, w]),
      quat: f.quat
        .clone()
        .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), (rot * Math.PI) / 180)),
      bone: m.bone,
    }); // side flaps
  for (const [w, rot] of [
    [0.13, -12],
    [-0.13, 12],
  ])
    b.part(box(0.56, 0.3, 0.03), c.dark, {
      at: f.local([0, 0.42, w]),
      quat: f.quat
        .clone()
        .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), (rot * Math.PI) / 180)),
      bone: m.bone,
    }); // top and bottom flaps
}

export function thrusterRing(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(new THREE.TorusGeometry(0.3, 0.05, 6, 14), c.steel, {
    at: f.local([0, 0.1, 0]),
    dir: m.n,
    axis: "z",
    bone: m.bone,
  });
  b.part(cyl(0.08, 0.2, 8), c.dark, { at: f.local([0, 0.1, 0]), dir: m.n, bone: m.bone });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    b.part(box(0.2, 0.08, 0.02), c.dark, {
      at: f.local([0.18 * Math.cos(a), 0.1, 0.18 * Math.sin(a)]),
      quat: f.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -a)),
      bone: m.bone,
    }); // vanes
  }
  glow(
    b.part(new THREE.TorusGeometry(0.22, 0.02, 5, 14), c.light, {
      at: f.local([0, 0.02, 0]),
      dir: m.n,
      axis: "z",
      bone: m.bone,
    }),
  );
}

export function thrusterCluster(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.6, 0.04, 0.6), c.dark, { frame: f.moved([0, 0.02, 0]), bone: m.bone });
  for (const u of [-0.15, 0.15])
    for (const w of [-0.15, 0.15]) {
      b.lathe(
        [
          [0, 0],
          [0.08, 0],
          [0.06, 0.06],
          [0.13, 0.24],
          [0.1, 0.24],
          [0.045, 0.07],
          [0, 0.08],
        ],
        { at: f.local([u, 0.04, w]), axis: m.n, segments: 8, bone: m.bone, color: c.steel },
      );
      glow(b.part(cyl(0.04, 0.02, 8), c.light, { at: f.local([u, 0.11, w]), dir: m.n, bone: m.bone }));
    }
}

export function thrusterIon(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.7, 0.12, 0.7), c.steel, { frame: f.moved([0, 0.06, 0]), bone: m.bone });
  b.part(box(0.6, 0.04, 0.6), c.dark, { frame: f.moved([0, 0.12, 0]), bone: m.bone });
  for (let i = 0; i < 5; i++)
    for (let j = 0; j < 5; j++)
      glow(
        b.part(cyl(0.035, 0.03, 6), c.light, {
          at: f.local([-0.22 + i * 0.11, 0.15, -0.22 + j * 0.11]),
          dir: m.n,
          bone: m.bone,
          flat: true,
        }),
      );
  for (const u of [-0.36, 0.36]) b.part(box(0.04, 0.3, 0.76), c.dark, { frame: f.moved([u, 0.15, 0]), bone: m.bone }); // shroud walls
}

export const thrusters = {
  bell: thrusterBell,
  box: thrusterBox,
  ring: thrusterRing,
  cluster: thrusterCluster,
  ion: thrusterIon,
};

// ---------------------------------------------------------------- vent (any face, 0.5 × 0.3)

function surround(b: Builder, m: Mount, c: Roles, w = 0.5, h = 0.3) {
  const f = frame(m.at, m.n);
  b.part(box(w, 0.02, h), c.dark, { frame: f.moved([0, 0.01, 0]), bone: m.bone });
  for (const u of [-w / 2, w / 2])
    b.part(box(0.03, 0.04, h + 0.03), c.steel, { frame: f.moved([u, 0.02, 0]), bone: m.bone });
  for (const v of [-h / 2, h / 2])
    b.part(box(w + 0.03, 0.04, 0.03), c.steel, { frame: f.moved([0, 0.02, v]), bone: m.bone });
  return f;
}

export function ventLouvre(b: Builder, m: Mount, c: Roles) {
  const f = surround(b, m, c);
  const tilt = f.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.6));
  for (let i = 0; i < 5; i++)
    b.part(box(0.46, 0.015, 0.07), c.trim, { at: f.local([0, 0.03, -0.1 + i * 0.05]), quat: tilt, bone: m.bone });
}

export function ventGrille(b: Builder, m: Mount, c: Roles) {
  const f = surround(b, m, c);
  for (let i = 0; i < 9; i++)
    b.rod(f.local([-0.2 + i * 0.05, 0.03, -0.13]), f.local([-0.2 + i * 0.05, 0.03, 0.13]), 0.006, c.steel, {
      bone: m.bone,
      sides: 4,
    });
  for (let i = 0; i < 4; i++)
    b.rod(f.local([-0.23, 0.035, -0.09 + i * 0.06]), f.local([0.23, 0.035, -0.09 + i * 0.06]), 0.006, c.steel, {
      bone: m.bone,
      sides: 4,
    });
}

export function ventSlots(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.54, 0.05, 0.34), c.trim, { frame: f.moved([0, 0.025, 0]), bone: m.bone });
  for (let i = 0; i < 6; i++)
    b.part(box(0.44, 0.02, 0.025), c.dark, { frame: f.moved([0, 0.05, -0.125 + i * 0.05]), bone: m.bone });
}

export function ventScoop(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.frustumBox(f.local([0, 0.0, -0.2]), f.local([0, 0.0, 0.2]), [0.4, 0.02], [0.5, 0.22], {
    bone: m.bone,
    color: c.trim,
    up: m.n,
  }); // wedge, rising along w
  b.part(box(0.44, 0.16, 0.03), c.dark, { frame: f.moved([0, 0.1, 0.22]), bone: m.bone }); // open mouth
  for (const u of [-0.15, 0, 0.15])
    b.part(box(0.02, 0.14, 0.03), c.steel, { frame: f.moved([u, 0.1, 0.22]), bone: m.bone });
}

export function ventFan(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(cyl(0.2, 0.08, 12), c.dark, { at: f.local([0, 0.04, 0]), dir: m.n, bone: m.bone, flat: true });
  const fan = b.joint(`ventFan${m.tag}`, {
    parent: m.bone,
    at: f.local([0, 0.06, 0]),
    dir: f.dir([1, 0, 0]),
    up: f.dir([0, 0, 1]),
    role: "hinge",
  });
  b.part(cyl(0.04, 0.06, 8), c.steel, { at: f.local([0, 0.07, 0]), dir: m.n, bone: fan });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    b.part(box(0.04, 0.012, 0.13), c.trim, {
      at: f.local([0.1 * Math.sin(a), 0.07, 0.1 * Math.cos(a)]),
      quat: f.quat
        .clone()
        .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), a))
        .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0.6)),
      bone: fan,
    });
  }
  b.part(new THREE.TorusGeometry(0.18, 0.012, 5, 14), c.steel, {
    at: f.local([0, 0.1, 0]),
    dir: m.n,
    axis: "z",
    bone: m.bone,
  });
  for (const a of [0, 60, 120])
    b.rod(
      f.local([0.18 * Math.cos((a * Math.PI) / 180), 0.1, 0.18 * Math.sin((a * Math.PI) / 180)]),
      f.local([-0.18 * Math.cos((a * Math.PI) / 180), 0.1, -0.18 * Math.sin((a * Math.PI) / 180)]),
      0.006,
      c.steel,
      { bone: m.bone, sides: 4 },
    ); // guard
}

export const vents = { louvre: ventLouvre, grille: ventGrille, slots: ventSlots, scoop: ventScoop, fan: ventFan };

// ---------------------------------------------------------------- antenna (top face)

export function antennaWhip(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(cyl(0.05, 0.04, 8), c.dark, { at: f.local([0, 0.02, 0]), dir: m.n, bone: m.bone });
  for (let i = 0; i < 4; i++)
    b.part(new THREE.TorusGeometry(0.03, 0.01, 5, 8), c.steel, {
      at: f.local([0, 0.06 + i * 0.03, 0]),
      dir: m.n,
      axis: "z",
      bone: m.bone,
    }); // base coil
  b.spike(f.local([0, 0.16, 0]), m.n, 1.2, 0.015, c.steel, { bone: m.bone, sides: 5 });
  b.part(new THREE.SphereGeometry(0.025, 6, 4), c.dark, { at: f.local([0, 1.36, 0]), bone: m.bone, flat: true });
}

export function antennaDish(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(cyl(0.04, 0.3, 8), c.steel, { at: f.local([0, 0.15, 0]), dir: m.n, bone: m.bone });
  const yaw = b.joint(`dish${m.tag}`, {
    parent: m.bone,
    at: f.local([0, 0.3, 0]),
    dir: f.dir([1, 0, 0]),
    up: f.dir([0, 0, 1]),
    role: "hinge",
  });
  const aim = f.dir([0, 0.8, -0.6]);
  b.lathe(
    [
      [0, 0],
      [0.3, 0.12],
      [0.3, 0.14],
      [0, 0.03],
    ],
    { at: f.local([0, 0.34, -0.02]), axis: aim, segments: 12, bone: yaw, color: c.trim },
  );
  b.part(cyl(0.05, 0.08, 8), c.dark, { at: f.local([0, 0.33, 0]), dir: aim, bone: yaw });
  b.rod(f.local([0, 0.36, -0.02]), f.local([0, 0.62, -0.23]), 0.012, c.steel, { bone: yaw, sides: 5 }); // feed arm
  b.part(new THREE.SphereGeometry(0.03, 6, 4), c.dark, { at: f.local([0, 0.62, -0.23]), bone: yaw, flat: true });
}

export function antennaBlade(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.2, 0.02, 0.4), c.dark, { frame: f.moved([0, 0.01, 0]), bone: m.bone });
  b.extrude(
    [
      [-0.16, 0],
      [0.16, 0],
      [0.06, 0.42, "sharp"],
      [-0.02, 0.42, "sharp"],
    ],
    { at: f.local([0, 0.02, 0]), x: f.dir([0, 0, 1]), y: m.n, thickness: 0.025, bone: m.bone, color: c.trim },
  );
}

export function antennaArray(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(cyl(0.03, 0.6, 6), c.steel, { at: f.local([0, 0.3, 0]), dir: m.n, bone: m.bone });
  b.rod(f.local([-0.4, 0.6, 0]), f.local([0.4, 0.6, 0]), 0.015, c.steel, { bone: m.bone, sides: 6 });
  for (const u of [-0.4, -0.13, 0.13, 0.4])
    b.spike(f.local([u, 0.6, 0]), m.n, 0.35, 0.008, c.dark, { bone: m.bone, sides: 4 });
}

export function antennaMast(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  for (let i = 0; i < 3; i++) {
    b.part(cyl(0.05 - i * 0.013, 0.5, 8), c.steel, { at: f.local([0, 0.25 + i * 0.45, 0]), dir: m.n, bone: m.bone });
    b.part(cyl(0.065 - i * 0.013, 0.05, 8), c.dark, { at: f.local([0, 0.5 + i * 0.45, 0]), dir: m.n, bone: m.bone }); // collar
  }
  b.rod(f.local([-0.12, 1.5, 0]), f.local([0.12, 1.5, 0]), 0.008, c.dark, { bone: m.bone, sides: 4 });
  b.rod(f.local([0, 1.5, -0.12]), f.local([0, 1.5, 0.12]), 0.008, c.dark, { bone: m.bone, sides: 4 });
}

export const antennas = {
  whip: antennaWhip,
  dish: antennaDish,
  blade: antennaBlade,
  array: antennaArray,
  mast: antennaMast,
};

// ---------------------------------------------------------------- dome (top face)

export function domeSensor(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(cyl(0.24, 0.05, 12), c.steel, { at: f.local([0, 0.025, 0]), dir: m.n, bone: m.bone, flat: true });
  b.part(cyl(0.08, 0.2, 8), c.dark, { at: f.local([0, 0.12, 0]), dir: m.n, bone: m.bone });
  b.part(new THREE.SphereGeometry(0.2, 12, 6, 0, TAU, 0, Math.PI / 2), c.glass, {
    at: f.local([0, 0.05, 0]),
    dir: m.n,
    bone: m.bone,
    flat: true,
  });
}

export function domeCamera(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(new THREE.SphereGeometry(0.18, 12, 6, 0, TAU, 0, Math.PI / 2), c.trim, {
    at: f.local([0, 0.02, 0]),
    dir: m.n,
    bone: m.bone,
    flat: true,
  });
  b.part(cyl(0.05, 0.14, 8), c.dark, { at: f.local([0, 0.1, -0.12]), dir: f.dir([0, 0.5, -1]), bone: m.bone });
  b.part(cyl(0.035, 0.02, 8), c.glass, { at: f.local([0, 0.13, -0.19]), dir: f.dir([0, 0.5, -1]), bone: m.bone });
  b.part(box(0.2, 0.02, 0.16), c.steel, { frame: f.moved([0, 0.2, -0.1]), bone: m.bone }); // hood plate
}

export function domeFaceted(b: Builder, m: Mount, c: Roles) {
  b.lathe(
    [
      [0, 0],
      [0.24, 0],
      [0.22, 0.1],
      [0.14, 0.2],
      [0, 0.24],
    ],
    { at: m.at, axis: m.n, segments: 6, bone: m.bone, color: c.trim },
  );
}

export function domeCluster(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(cyl(0.26, 0.03, 8), c.dark, { at: f.local([0, 0.015, 0]), dir: m.n, bone: m.bone, flat: true });
  for (const a of [90, 210, 330])
    b.part(new THREE.SphereGeometry(0.08, 8, 4, 0, TAU, 0, Math.PI / 2), c.glass, {
      at: f.local([0.13 * Math.cos((a * Math.PI) / 180), 0.03, 0.13 * Math.sin((a * Math.PI) / 180)]),
      dir: m.n,
      bone: m.bone,
      flat: true,
    });
}

export const domes = { sensor: domeSensor, camera: domeCamera, faceted: domeFaceted, cluster: domeCluster };

// ---------------------------------------------------------------- panel (any face, 0.8 × 0.5)

export function panelRaised(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.extrude(
    [
      [-0.4, -0.25],
      [0.4, -0.25],
      [0.4, 0.25],
      [-0.4, 0.25],
    ],
    {
      at: f.local([0, 0.025, 0]),
      x: f.dir([1, 0, 0]),
      y: f.dir([0, 0, 1]),
      thickness: 0.05,
      bevel: 0.02,
      bone: m.bone,
      color: c.trim,
    },
  );
  for (const u of [-0.33, 0.33])
    for (const w of [-0.18, 0.18])
      b.part(cyl(0.02, 0.015, 6), c.steel, { at: f.local([u, 0.055, w]), dir: m.n, bone: m.bone });
}

export function panelRecessed(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.7, 0.01, 0.4), c.dark, { frame: f.moved([0, 0.005, 0]), bone: m.bone });
  for (const u of [-0.37, 0.37]) b.part(box(0.06, 0.04, 0.5), c.trim, { frame: f.moved([u, 0.02, 0]), bone: m.bone });
  for (const w of [-0.22, 0.22]) b.part(box(0.8, 0.04, 0.06), c.trim, { frame: f.moved([0, 0.02, w]), bone: m.bone });
  for (const u of [-0.2, 0.2])
    b.part(box(0.08, 0.02, 0.04), c.steel, { frame: f.moved([u, 0.02, 0.19]), bone: m.bone }); // latches
}

export function panelGreeble(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  const r = rng(11);
  b.part(box(0.8, 0.03, 0.5), c.trim, { frame: f.moved([0, 0.015, 0]), bone: m.bone });
  for (let i = 0; i < 14; i++) {
    const u = (r() - 0.5) * 0.7;
    const w = (r() - 0.5) * 0.4;
    if (i % 3)
      b.part(box(0.04 + r() * 0.1, 0.02 + r() * 0.04, 0.04 + r() * 0.08), i % 2 ? c.dark : c.steel, {
        frame: f.moved([u, 0.04, w]),
        bone: m.bone,
      });
    else
      b.part(cyl(0.02 + r() * 0.03, 0.03 + r() * 0.04, 8), c.dark, {
        at: f.local([u, 0.04, w]),
        dir: m.n,
        bone: m.bone,
      });
  }
}

export function panelStrips(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.8, 0.02, 0.5), c.trim, { frame: f.moved([0, 0.01, 0]), bone: m.bone });
  for (let i = 0; i < 6; i++)
    b.part(box(0.76, 0.03, 0.04), c.steel, { frame: f.moved([0, 0.035, -0.2 + i * 0.08]), bone: m.bone });
}

export function panelHex(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  for (const [u, w] of [
    [-0.3, 0],
    [-0.15, 0.2],
    [0, 0],
    [0.15, 0.2],
    [0.3, 0],
  ]) {
    b.part(cyl(0.12, 0.04, 6), c.trim, { at: f.local([u, 0.02, w]), dir: m.n, bone: m.bone, flat: true });
    b.part(cyl(0.025, 0.02, 6), c.steel, { at: f.local([u, 0.05, w]), dir: m.n, bone: m.bone });
  }
}

export const panels = {
  raised: panelRaised,
  recessed: panelRecessed,
  greeble: panelGreeble,
  strips: panelStrips,
  hex: panelHex,
};

// ---------------------------------------------------------------- light bar (top face, across)

export function lightBarRoof(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(1.2, 0.08, 0.12), c.dark, { frame: f.moved([0, 0.1, 0]), bone: m.bone });
  for (const u of [-0.45, 0.45]) b.part(box(0.04, 0.08, 0.06), c.steel, { frame: f.moved([u, 0.04, 0]), bone: m.bone }); // feet
  for (const u of [-0.45, -0.15, 0.15, 0.45]) {
    b.part(cyl(0.06, 0.08, 8), c.steel, {
      at: f.local([u, 0.17, 0]),
      dir: f.dir([0, 0, -1]),
      bone: m.bone,
      flat: true,
    });
    glow(
      b.part(cyl(0.05, 0.02, 8), c.light, {
        at: f.local([u, 0.17, -0.05]),
        dir: f.dir([0, 0, -1]),
        bone: m.bone,
        flat: true,
      }),
    );
  }
}

export function lightBarStrip(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(1.2, 0.06, 0.1), c.dark, { frame: f.moved([0, 0.07, 0]), bone: m.bone });
  glow(b.part(box(1.1, 0.03, 0.02), c.light, { frame: f.moved([0, 0.08, -0.05]), bone: m.bone }));
  for (const u of [-0.5, 0.5]) b.part(box(0.04, 0.06, 0.06), c.steel, { frame: f.moved([u, 0.02, 0]), bone: m.bone });
}

export function lightBarDual(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(1.2, 0.14, 0.1), c.dark, { frame: f.moved([0, 0.09, 0]), bone: m.bone });
  glow(b.part(box(1.1, 0.03, 0.02), c.light, { frame: f.moved([0, 0.13, -0.05]), bone: m.bone }));
  glow(b.part(box(0.6, 0.03, 0.02), c.light, { frame: f.moved([0, 0.06, -0.05]), bone: m.bone }));
  for (const u of [-0.5, 0.5]) b.part(box(0.04, 0.04, 0.06), c.steel, { frame: f.moved([u, 0.01, 0]), bone: m.bone });
}

export function lightBarBeacon(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(cyl(0.12, 0.05, 10), c.dark, { at: f.local([0, 0.025, 0]), dir: m.n, bone: m.bone, flat: true });
  const spin = b.joint(`beacon${m.tag}`, {
    parent: m.bone,
    at: f.local([0, 0.05, 0]),
    dir: f.dir([1, 0, 0]),
    up: f.dir([0, 0, 1]),
    role: "hinge",
  });
  b.part(box(0.1, 0.1, 0.02), c.steel, { frame: f.moved([0, 0.11, 0.03]), bone: spin }); // reflector
  glow(
    b.part(new THREE.SphereGeometry(0.1, 10, 5, 0, TAU, 0, Math.PI / 2), c.light, {
      at: f.local([0, 0.05, 0]),
      dir: m.n,
      bone: m.bone,
      flat: true,
    }),
  );
}

export const lightBars = { roof: lightBarRoof, strip: lightBarStrip, dual: lightBarDual, beacon: lightBarBeacon };

// ---------------------------------------------------------------- cable (m.at → to, with a sag)

export type CableVariant = (b: Builder, m: Mount, c: Roles, to: V3) => void;

function route(m: Mount, to: V3, sag = 0.15) {
  const [x, y, z] = m.at;
  return catmull([[x, y, z], [(x + to[0]) / 2, (y + to[1]) / 2 - sag, (z + to[2]) / 2], to]);
}

export function cableRun(b: Builder, m: Mount, c: Roles, to: V3) {
  const path = route(m, to);
  b.sweep(path, 0.015, c.dark, { bone: m.bone, sides: 6 });
  b.along(path, 3, (at) => b.part(box(0.05, 0.03, 0.03), c.steel, { frame: at, bone: m.bone }));
}

export function cableBundle(b: Builder, m: Mount, c: Roles, to: V3) {
  for (const [du, sag] of [
    [-0.03, 0.14],
    [0, 0.17],
    [0.03, 0.15],
  ])
    b.sweep(route({ ...m, at: [m.at[0] + du, m.at[1], m.at[2]] }, [to[0] + du, to[1], to[2]], sag), 0.012, c.dark, {
      bone: m.bone,
      sides: 5,
    });
  b.part(box(0.1, 0.05, 0.05), c.steel, { at: route(m, to).at(0.5), bone: m.bone }); // tie
}

export function cableConduit(b: Builder, m: Mount, c: Roles, to: V3) {
  const path = route(m, to, 0.05);
  b.sweep(path, () => [0.03, 0.02], { bone: m.bone, section: "box", color: c.steel });
  b.along(path, 2, (at) => b.part(box(0.1, 0.08, 0.08), c.dark, { frame: at, bone: m.bone }));
}

export function cableHose(b: Builder, m: Mount, c: Roles, to: V3) {
  const path = route(m, to, 0.2);
  b.sweep(path, 0.02, c.tyre, { bone: m.bone, sides: 7 });
  b.along(path, 14, (at) =>
    b.part(new THREE.TorusGeometry(0.024, 0.008, 4, 8), c.dark, {
      at,
      quat: at.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2)),
      bone: m.bone,
    }),
  );
}

export const cables = { run: cableRun, bundle: cableBundle, conduit: cableConduit, hose: cableHose };

// ---------------------------------------------------------------- picks and dress

export type Picks = {
  thruster?: keyof typeof thrusters;
  vent?: keyof typeof vents;
  antenna?: keyof typeof antennas;
  dome?: keyof typeof domes;
  panel?: keyof typeof panels;
  lightBar?: keyof typeof lightBars;
  cable?: keyof typeof cables;
};

export function dress(b: Builder, a: Anchors, c: Roles, p: Picks) {
  if (p.thruster)
    for (const s of [1, -1]) thrusters[p.thruster](b, { ...a.rear, at: [s * 0.55, a.rear.at[1], a.rear.at[2]] }, c);
  if (p.vent) for (const side of ["L", "R"] as const) vents[p.vent](b, { ...a[`hood${side}`], tag: side }, c);
  if (p.antenna) antennas[p.antenna](b, a.roofCorner, c);
  if (p.dome) domes[p.dome](b, a.roofCornerFront, c);
  if (p.panel) panels[p.panel](b, a.tailgate, c);
  if (p.lightBar) lightBars[p.lightBar](b, a.roofFront, c);
  if (p.cable)
    cables[p.cable](b, { ...a.cabRear, at: [0.7, a.cabRear.at[1] - 0.1, a.cabRear.at[2]] }, c, [
      a.bedSideL.at[0],
      a.bedSideL.at[1] + 0.3,
      a.bedSideL.at[2] - 0.3,
    ]);
}

// ---------------------------------------------------------------- board

export const meta = {
  name: "Sci-fi hull catalog",
  description: "Thrusters, vents, antennas, domes, panels, light bars and cables on a board.",
};

export default function build() {
  const b = createBuilder({ name: "hullBoard" });
  const root = b.joint("board", { at: [0, 0, 0] });
  slot(b, root, 0, thrusters, "thruster", PLAIN, { y: 0.5, pitch: 1.7, front: 0.6, n: [0, 0, 1] });
  slot(b, root, -3.2, vents, "vent", PLAIN, { y: 0.4, pitch: 1.7, front: 0.5, n: [0, 0, 1] });
  slot(b, root, -6.4, panels, "panel", PLAIN, { y: 0.4, pitch: 1.7, front: 0.5, n: [0, 0, 1] });
  return b.root;
}

export function boardTop() {
  const b = createBuilder({ name: "hullTop" });
  const root = b.joint("board", { at: [0, 0, 0] });
  const c = PLAIN;
  slot(b, root, -6.4, antennas, "antenna", c, { y: 0.02, pitch: 1.7, front: 0.5, n: [0, 1, 0] });
  slot(b, root, 0, domes, "dome", c, { y: 0.02, pitch: 1.7, front: 0.5, n: [0, 1, 0] });
  slot(b, root, -3.2, lightBars, "lightBar", c, { y: 0.02, pitch: 1.8, front: 0.5, n: [0, 1, 0] });
  row(b, root, -9.6, Object.keys(cables), { y: 0.6, pitch: 2.0, front: 0.6, n: [0, 0, 1], prefix: "cable" }).forEach(
    (m, i) => {
      const [x, y, z] = m.at;
      for (const dx of [-0.6, 0.6]) b.part(box(0.1, 1.0, 0.1), c.body, { bone: m.bone, at: [x + dx, y - 0.1, z] }); // two posts
      Object.values(cables)[i](b, { ...m, at: [x - 0.55, y + 0.3, z] }, c, [x + 0.55, y + 0.3, z]);
    },
  );
  return b.root;
}
