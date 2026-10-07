import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Joint } from "../src/skeleton";
import type { OutlinePoint } from "../src/outline";

export const meta = {
  name: "Mid-Engine Wedge Supercar",
  description:
    "Low-poly mid-engine wedge supercar, 4.46 m long: tangerine hull on a carbon sill, black cabin with dark glass, white racing stripes, dihedral doors, steered front wheels and a hinged rear wing flap.",
  style: "low-poly",
  commit: "b816db2",
};

type V3 = [number, number, number];

const PAINT = "#ff6a13";
const CARBON = "#1d2026";
const CARBON_LIGHT = "#3a3f49";
const GLASS = "#13303a";
const TIRE = "#23252a";
const RIM = "#d9dee6";
const WHITE = "#f4f1ea";
const HEAD = "#e8fbff";
const TAIL = "#ff2b2b";
const TITAN = "#9aa2ad";

// Door outline in (z, y), relative to the hinge at the front-bottom corner.
const DOOR: OutlinePoint[] = [
  [0, 0],
  [-1.0, 0],
  [-1.02, 0.46],
  [-0.82, 0.52],
  [-0.1, 0.52],
  [0, 0.44],
];
const DOOR_SILL: OutlinePoint[] = [
  [0, 0],
  [-1.0, 0],
  [-1.0, 0.06],
  [0, 0.06],
];
// Side air intake behind the door, absolute (z, y) at the hull side.
const SIDE_VENT: OutlinePoint[] = [
  [-0.28, 0.45],
  [-0.7, 0.45],
  [-0.62, 0.62],
  [-0.34, 0.62],
];

// Five-point rim star in (z, y), centred on the wheel.
function star(outer: number, inner: number, points: number): OutlinePoint[] {
  const pts: OutlinePoint[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = (Math.PI * i) / points;
    const r = i % 2 === 0 ? outer : inner;
    pts.push([r * Math.cos(a), r * Math.sin(a), "sharp"]);
  }
  return pts;
}

// Half disc above the axle in (z, y) relative to the wheel centre: a fender flare.
function flare(R: number): OutlinePoint[] {
  const pts: OutlinePoint[] = [];
  for (let i = 0; i <= 8; i++) {
    const a = (Math.PI * i) / 8;
    pts.push([R * Math.cos(a), R * Math.sin(a)]);
  }
  return pts;
}

export default function build() {
  const b = createBuilder({ name: "wedgeSupercar" });
  const body = b.joint("body", { at: [0, 0, 0], role: "spine" });

  const blk = (color: string, size: V3, at: V3, bone: Joint = body, rotation: V3 = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at, rotation, flat: true });

  const wheel = (joint: Joint, c: V3, r: number, w: number) => {
    b.part(new THREE.CylinderGeometry(r, r, w, 10), TIRE, { bone: joint, at: c, dir: [1, 0, 0], flat: true });
    b.extrude(star(r * 0.64, r * 0.36, 5), { at: c, x: [0, 0, 1], y: [0, 1, 0], thickness: w + 0.02, bone: joint, color: RIM });
    b.part(new THREE.CylinderGeometry(r * 0.2, r * 0.2, w + 0.03, 8), CARBON_LIGHT, {
      bone: joint,
      at: c,
      dir: [1, 0, 0],
      flat: true,
    });
  };

  // ---- Hull: tangerine wedge in box sections, so each face is one plane.
  b.loft(
    [
      { at: [0, 0.26, 2.1], w: 0.9, h: 0.14 },
      { at: [0, 0.3, 1.72], w: 1.46, h: 0.2 },
      { at: [0, 0.42, 1.2], w: 1.82, h: 0.36 },
      { at: [0, 0.55, 0.5], w: 1.92, h: 0.44 },
      { at: [0, 0.6, -0.2], w: 1.92, h: 0.44 },
      { at: [0, 0.64, -0.9], w: 1.92, h: 0.44 },
      { at: [0, 0.66, -1.6], w: 1.86, h: 0.4 },
      { at: [0, 0.6, -2.12], w: 1.7, h: 0.36 },
    ],
    { bone: body, color: PAINT, section: "box", caps: "flat" },
  );

  // Carbon undertray and sills, flush with the hull's lower edge.
  b.loft(
    [
      { at: [0, 0.17, 2.0], w: 1.1, h: 0.1 },
      { at: [0, 0.17, 1.2], w: 1.7, h: 0.1 },
      { at: [0, 0.17, 0], w: 1.8, h: 0.1 },
      { at: [0, 0.17, -1.2], w: 1.76, h: 0.1 },
      { at: [0, 0.17, -2.02], w: 1.5, h: 0.1 },
    ],
    { bone: body, color: CARBON, section: "box", caps: "flat" },
  );

  // Racing stripes: nose to windscreen, and roof.
  b.loft(
    [
      { at: [0, 0.345, 2.12], w: 0.2, h: 0.02 },
      { at: [0, 0.42, 1.72], w: 0.2, h: 0.02 },
      { at: [0, 0.61, 1.2], w: 0.2, h: 0.02 },
    ],
    { bone: body, color: WHITE, section: "box", caps: "flat" },
  );
  b.loft(
    [
      { at: [0, 1.075, 0.4], w: 0.2, h: 0.02 },
      { at: [0, 1.125, -0.15], w: 0.2, h: 0.02 },
      { at: [0, 1.075, -0.7], w: 0.2, h: 0.02 },
      { at: [0, 0.925, -1.1], w: 0.2, h: 0.02 },
    ],
    { bone: body, color: WHITE, section: "box", caps: "flat" },
  );

  // ---- Cabin: carbon shell with dark glass on the sides, windscreen and rear glass.
  b.loft(
    [
      { at: [0, 0.66, 0.95], w: 1.5, h: 0.16 },
      { at: [0, 0.9, 0.4], w: 1.44, h: 0.32 },
      { at: [0, 0.98, -0.15], w: 1.36, h: 0.26 },
      { at: [0, 0.95, -0.7], w: 1.46, h: 0.22 },
      { at: [0, 0.84, -1.1], w: 1.7, h: 0.14 },
    ],
    { bone: body, color: CARBON, section: "box", caps: "flat" },
  );
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0.86, 0.8],
        [0.55, 0.96],
        [0.1, 1.03],
        [-0.45, 1.03],
        [-0.85, 0.97],
        [-1.0, 0.88],
        [-0.9, 0.8],
        [-0.4, 0.82],
        [0.3, 0.8],
      ],
      { at: [s * 0.725, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.03, bone: body, color: GLASS },
    );
  }
  // Windscreen, sloped from the cowl (z 0.95, y 0.74) up to the roof edge (z 0.4, y 1.06).
  b.extrude(
    [
      [-0.6, -0.04],
      [0.6, -0.04],
      [0.5, 0.66],
      [-0.5, 0.66],
    ],
    { at: [0, 0.74, 0.95], x: [1, 0, 0], y: [0, 0.5029, -0.8643], thickness: 0.03, bone: body, color: GLASS },
  );
  // Rear glass, from the roof (z -0.7, y 1.06) down to the deck.
  b.extrude(
    [
      [-0.66, -0.03],
      [0.66, -0.03],
      [0.56, 0.46],
      [-0.56, 0.46],
    ],
    { at: [0, 1.06, -0.7], x: [1, 0, 0], y: [0, -0.351, -0.937], thickness: 0.03, bone: body, color: GLASS },
  );

  // ---- Hood louvres, rear deck intake and its slats.
  for (const s of [1, -1]) {
    for (const z of [1.5, 1.43, 1.36]) {
      blk(CARBON, [0.2, 0.012, 0.04], [s * 0.45, 0.49 + (1.5 - z) * 0.38, z], body, [21, 0, 0]);
    }
  }
  b.extrude(
    [
      [-0.38, -0.2],
      [0.38, -0.2],
      [0.3, 0.2],
      [-0.3, 0.2],
    ],
    { at: [0, 0.87, -1.45], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.04, bone: body, color: CARBON },
  );
  for (const z of [-1.33, -1.45, -1.57]) blk(CARBON_LIGHT, [0.62, 0.02, 0.03], [0, 0.9, z]);

  // ---- Front: splitter with end plates, nose intake with slats, headlights.
  blk(CARBON, [1.0, 0.03, 0.2], [0, 0.15, 2.1]);
  for (const s of [1, -1]) blk(CARBON, [0.02, 0.1, 0.22], [s * 0.5, 0.15, 2.1]);
  b.extrude(
    [
      [-0.2, 0],
      [0.2, 0],
      [0.16, 0.1],
      [-0.16, 0.1],
    ],
    { at: [0, 0.2, 2.1], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, bone: body, color: CARBON },
  );
  for (const y of [0.225, 0.255, 0.285]) blk(CARBON_LIGHT, [0.3, 0.012, 0.02], [0, y, 2.12]);

  // Racing livery band along both flanks, under the door line.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [1.05, 0.5],
        [-1.9, 0.56],
        [-1.9, 0.6],
        [1.05, 0.54],
      ],
      { at: [s * 0.965, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.02, bone: body, color: WHITE },
    );
  }

  // Brake ducts: three slats on each front flare.
  for (const s of [1, -1]) {
    for (const z of [1.66, 1.72, 1.78]) blk(CARBON_LIGHT, [0.02, 0.014, 0.1], [s * 1.0, 0.56, z]);
  }

  // ---- Rear: diffuser with fins, rear bumper lip, light bar and the exhaust side pods.
  blk(CARBON, [1.4, 0.08, 0.22], [0, 0.16, -2.1]);
  for (let i = -2; i <= 2; i++) blk(CARBON_LIGHT, [0.02, 0.1, 0.2], [i * 0.28, 0.16, -2.1]);
  blk(CARBON, [1.5, 0.05, 0.06], [0, 0.42, -2.13]);
  blk(CARBON, [0.2, 0.1, 0.03], [0, 0.64, -2.135]);

  for (const s of [1, -1]) {
    // Fender flares: half discs standing on the hull side over each wheel.
    b.extrude(flare(0.41), {
      at: [s * 0.975, 0.34, 1.5],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.05,
      bone: body,
      color: CARBON,
    });
    b.extrude(flare(0.43), {
      at: [s * 0.975, 0.36, -1.15],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.05,
      bone: body,
      color: CARBON,
    });

    // Steered front axle with hinged wheels.
    const steer = b.joint(s > 0 ? "steerL" : "steerR", { parent: body, at: [s * 0.84, 0.34, 1.5], role: "hinge" });
    const wFront = b.joint(s > 0 ? "wheelFL" : "wheelFR", {
      parent: steer,
      at: [s * 0.84, 0.34, 1.5],
      dir: [1, 0, 0],
      role: "hinge",
    });
    wheel(wFront, [s * 0.84, 0.34, 1.5], 0.34, 0.25);

    const wRear = b.joint(s > 0 ? "wheelRL" : "wheelRR", {
      parent: body,
      at: [s * 0.84, 0.36, -1.15],
      dir: [1, 0, 0],
      role: "hinge",
    });
    wheel(wRear, [s * 0.84, 0.36, -1.15], 0.36, 0.33);
  }

  // ---- Dihedral doors: hinge at the front-bottom corner, rotates up and forward.
  for (const s of [1, -1]) {
    const hinge: V3 = [s * 0.965, 0.3, 0.85];
    const door = b.joint(s > 0 ? "doorL" : "doorR", {
      parent: body,
      at: hinge,
      dir: [s * 0.25, 1, 0.12],
      role: "hinge",
    });
    b.extrude(DOOR, { at: hinge, x: [0, 0, 1], y: [0, 1, 0], thickness: 0.03, bone: door, color: PAINT });
    b.extrude(DOOR_SILL, { at: hinge, x: [0, 0, 1], y: [0, 1, 0], thickness: 0.036, bone: door, color: CARBON });
    b.part(new THREE.BoxGeometry(0.12, 0.02, 0.03), CARBON, { bone: door, at: [s * 0.98, 0.62, -0.05], flat: true });

    // Side intake, headlight, light bar and mirror on the body.
    b.extrude(SIDE_VENT, { at: [s * 0.965, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.03, bone: body, color: CARBON });
    blk(CARBON, [0.36, 0.04, 0.14], [s * 0.3, 0.36, 1.9], body, [10, 0, 0]);
    blk(HEAD, [0.34, 0.03, 0.12], [s * 0.3, 0.375, 1.9], body, [10, 0, 0]);
    blk(CARBON, [0.12, 0.08, 0.14], [s * 1.0, 0.7, 0.72]);
    blk(TAIL, [0.5, 0.05, 0.03], [s * 0.56, 0.64, -2.135]);
  }

  // ---- Exhaust tips on each side of the diffuser.
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.08, 8), TITAN, {
      bone: body,
      at: [s * 0.46, 0.25, -2.17],
      dir: [0, 0, 1],
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.09, 8), CARBON, {
      bone: body,
      at: [s * 0.46, 0.25, -2.19],
      dir: [0, 0, 1],
      flat: true,
    });
  }

  // Rear wing: two carbon uprights, a main plane, endplates and a hinged flap.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-1.8, 0.78],
        [-1.66, 0.78],
        [-1.9, 1.12],
        [-2.04, 1.12],
      ],
      { at: [s * 0.55, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.05, bone: body, color: CARBON },
    );
    blk(CARBON, [0.02, 0.16, 0.3], [s * 0.8, 1.12, -2.0]);
  }
  blk(PAINT, [1.6, 0.03, 0.26], [0, 1.14, -2.0]);
  const flap = b.joint("flapRear", { parent: body, at: [0, 1.14, -2.13], dir: [1, 0, 0], role: "hinge" });
  b.part(new THREE.BoxGeometry(1.6, 0.025, 0.12), CARBON, {
    bone: flap,
    at: [0, 1.155, -2.2],
    rotation: [12, 0, 0],
    flat: true,
  });

  return b.root;
}
