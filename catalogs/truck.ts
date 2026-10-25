/**
 * catalogs/truck.ts: wheeled-vehicle sampler. A finished pickup base plus named constructions of each of its parts.
 * Pick the parts you like, copy their functions into your module and make them your own: exaggerate, and change at
 * least one construction per pick. Every variant of a slot has one signature and one mounting convention, so they
 * swap freely, in `assemble` and in your module. This file holds the base, the cab and bed slots and `assemble`;
 * catalogs/truckGear.ts holds wheel, suspension, bumper, headlight, grille, mirror, exhaust and rack.
 *
 * SIGNATURE   variant(b: Builder, m: Mount, c: Roles): void
 *   Mount = { bone, at, s, n, root, tag }
 *     bone  the joint the part rides: a wheel's spin joint, a suspension's travel joint, else the chassis
 *     at    the mount point [x, y, z] in model space, meters; a variant builds everything relative to it
 *     s     side sign: 1 = model left (+X), -1 = right; 1 on the centre line
 *     n     the mount's outward normal: [0,0,1] front face, [0,0,-1] rear, [±1,0,0] flanks, [0,1,0] top
 *     root  the chassis joint, for pieces that must stay still while `bone` moves (a spring's chassis end)
 *     tag   suffix for joints a variant creates ("" on the assembled truck, "_<variant>" on the board)
 *   Roles = colours by part role { body, trim, glass, light, tyre, rim, steel, dark, weapon }: colour strings or
 *   Paints (`Fill`). PLAIN is the grey set; materials2077.ts builds styled ones. Lamps glow in `light`.
 *   Needs `box(w, h, d)` and `cyl(r, h, sides)`, the two one-line geometry helpers below: copy them with a variant.
 *
 * BASE  truckBase(b, c, parent?) → Anchors. Pickup: 5.5 m long, 2.1 m wide, wheels r 0.42 at x ±0.86, z ±1.55.
 *   Skeleton: chassis (root) → suspFL/FR/RL/RR (travel, hinge X) → steerFL/FR (hinge Y, front only) → wheelFL.. (spin).
 *   Anchors (every one a Mount, with its normal): wheelFL FR RL RR (hub, bone = spin), suspFL.. (hub, bone = travel),
 *   cab (cab floor centre), bed (bed floor centre), roof (cab top centre), roofFront (light bar), roofRear (hatch),
 *   roofCorner and roofCornerFront (right-rear and right-front of the roof: antenna, dome), hood (top centre: ERA),
 *   hoodL R (hood sides: vents), fenderL R (front fender tops: smoke launchers), cabFront (windscreen centre, n
 *   front: vision blocks), grille, headlightL R, bumperFront, bumperRear, rear (tail face: thrusters), tailgate
 *   (rear face: panels, decals), cabRear (behind the cab above the bed, n back: headache rack, rifle rack, screen),
 *   mirrorL R, exhaustL R (tail corners under the bed), flankL R (rocker between the wheels: skirts, tracks),
 *   bedSideL R (outer bed walls: plates, rifle rack, decals).
 *
 * SLOTS  (mount → variants, one line each on the construction)
 *   cab (anchors.cab; cab z ±0.75, hood ahead to z+2.0, roof y+1.23, belt y+0.6, width 1.9; door hinge joints doorL/R)
 *     cabBoxy     slab cab, upright flat windscreen, flat hood with a centre ridge, square fenders
 *     cabWedge    raked windscreen and a nose that slopes to the bumper (frustumBox hood), flush fenders
 *     cabCabover  flat-nosed cab over the front axle, no hood: tall two-pane screen, step wells, lower apron
 *     cabCrew     four doors (two hinge joints a side), short hood, long glasshouse
 *     cabCage     open tube frame: roll cage rods, mesh floor, windscreen frame and a wire glass, stub fenders
 *     cabBubble   half-cylinder canopy roof, rounded nose, bulged round fenders
 *   bed (anchors.bed; bed z ±1.1, width 1.95, rails y+0.6; a tailgate hinge joint where there is one)
 *     bedOpen     open box with ribbed floor, rails, tie-down hooks and a hinged tailgate
 *     bedFlat     flatbed deck on crossbeams with stake pockets, a headboard and chain rings
 *     bedCanopy   hard shell on the box with a side window strip and a hinged rear hatch
 *     bedCage     low box under a tube roll cage with a spare wheel and jerry cans
 *     bedTank     cylindrical tank on two cradles with a filler dome, valve and hose reel
 *     bedDump     tipper box on a hinge at the rear with a hydraulic ram (joint tipper)
 *   wheel, suspension, bumper, headlight, grille, mirror, exhaust, rack: see catalogs/truckGear.ts.
 *
 * PICKS  assemble(picks) → THREE.Object3D (a complete truck, for the app's placeholder). Each pick is the variant name
 *   without its slot prefix ("offroad" for wheelOffroad), one per slot; a missing slot takes the default (DEFAULT_PICKS).
 *   picks.armour / weapons / hull / style reach into the other catalogs, each on its default anchor:
 *     armour:  { track?, skirt?, plate?, era?, hatch?, vision?, smoke? }   (catalogs/armour.ts)
 *     weapons: { roof?: { turret, barrel? | laser? | railgun?, pod? }, bed?: same, rifle?: { rifle, rack? } }
 *     hull:    { thruster?, vent?, antenna?, dome?, panel?, lightBar?, cable? } (catalogs/scifiHull.ts)
 *     style:   { palette?, body?, trim?, neon?, decal?, screen? }           (catalogs/materials2077.ts)
 *   A reply's pick list reads one pick a line: `wheel: offroad → double-wide, 8 lugs, mud flaps`; the text after the
 *   arrow is the deviation the module commits to.
 */
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Builder } from "../src/builder";
import type { Fill } from "../src/context";
import type { Joint } from "../src/skeleton";
import { wheels, suspensions, bumpers, headlights, grilles, mirrors, exhausts, racks } from "./truckGear";
import * as armour from "./armour";
import * as weapons from "./mountedWeapons";
import * as hull from "./scifiHull";
import * as style2077 from "./materials2077";
import { slot, title } from "./board";

export type V3 = [number, number, number];
export type Mount = { bone: Joint; at: V3; s: 1 | -1; n: V3; root: Joint; tag: string };
export type Roles = {
  body: Fill;
  trim: Fill;
  glass: Fill;
  light: string;
  tyre: Fill;
  rim: Fill;
  steel: Fill;
  dark: Fill;
  weapon: Fill;
};
export type Variant = (b: Builder, m: Mount, c: Roles) => void;
export const PLAIN: Roles = {
  body: "#9aa0a6",
  trim: "#6b7177",
  glass: "#b9d3dc",
  light: "#fff2b0",
  tyre: "#2b2d31",
  rim: "#8d9196",
  steel: "#767b81",
  dark: "#3a3d42",
  weapon: "#5a6066",
};
export const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
export const cyl = (r: number, h: number, sides = 8) => new THREE.CylinderGeometry(r, r, h, sides);

// ---------------------------------------------------------------- base

export type Anchors = Record<
  | "cab"
  | "bed"
  | "roof"
  | "roofFront"
  | "roofRear"
  | "roofCorner"
  | "roofCornerFront"
  | "hoodL"
  | "hoodR"
  | "fenderL"
  | "fenderR"
  | "cabFront"
  | "hood"
  | "grille"
  | "headlightL"
  | "headlightR"
  | "bumperFront"
  | "bumperRear"
  | "rear"
  | "tailgate"
  | "cabRear"
  | "mirrorL"
  | "mirrorR"
  | "exhaustL"
  | "exhaustR"
  | "flankL"
  | "flankR"
  | "bedSideL"
  | "bedSideR"
  | "wheelFL"
  | "wheelFR"
  | "wheelRL"
  | "wheelRR"
  | "suspFL"
  | "suspFR"
  | "suspRL"
  | "suspRR",
  Mount
> & { chassis: Joint };

/** The pickup's frame and running gear skeleton; every slot hangs on the anchors it returns. */
export function truckBase(b: Builder, c: Roles, parent?: Joint): Anchors {
  const chassis = b.joint("chassis", { at: [0, 0.6, 0], role: "spine", ...(parent ? { parent } : {}) });
  const mk = (at: V3, s: 1 | -1, n: V3, bone = chassis): Mount => ({ bone, at, s, n, root: chassis, tag: "" });
  for (const s of [1, -1] as const) {
    b.part(box(0.1, 0.16, 4.9), c.dark, { bone: chassis, at: [s * 0.5, 0.58, 0] }); // frame rail
    b.rod([s * 0.95, 0.5, -0.95], [s * 0.95, 0.5, 1.15], 0.04, c.steel, { bone: chassis, sides: 6 }); // step bar
    for (const z of [-0.7, 0.9]) b.rod([s * 0.95, 0.5, z], [s * 0.55, 0.52, z], 0.025, c.steel, { bone: chassis });
    b.part(box(0.05, 0.06, 2.0), c.dark, { bone: chassis, at: [s * 0.5, 0.68, 0.5] }); // cab mount strip
  }
  for (const z of [-2.3, -1.0, 0.3, 1.3, 2.25])
    b.part(box(1.1, 0.1, 0.08), c.dark, { bone: chassis, at: [0, 0.58, z] });
  b.rod([0, 0.5, 0.9], [0, 0.5, -1.5], 0.035, c.steel, { bone: chassis, sides: 8 }); // driveshaft
  b.part(cyl(0.08, 0.3, 8), c.steel, { bone: chassis, at: [0, 0.52, 0.95], rotation: [90, 0, 0] }); // transfer case
  b.part(cyl(0.16, 0.7, 10), c.steel, { bone: chassis, at: [0.3, 0.46, -1.0], rotation: [90, 0, 0], flat: true }); // tank
  b.part(box(0.9, 0.04, 1.4), c.dark, { bone: chassis, at: [0, 0.7, 0.5] }); // cab floor pan
  const wheels = {} as Record<"FL" | "FR" | "RL" | "RR", Mount>;
  const susp = {} as Record<"FL" | "FR" | "RL" | "RR", Mount>;
  for (const [k, s, z] of [
    ["FL", 1, 1.55],
    ["FR", -1, 1.55],
    ["RL", 1, -1.55],
    ["RR", -1, -1.55],
  ] as const) {
    const front = z > 0;
    const travel = b.joint(`susp${k}`, {
      parent: chassis,
      at: [s * 0.5, 0.58, z + (front ? -0.55 : 0.55)],
      dir: [0, 1, 0],
      role: "hinge",
    });
    const hub: V3 = [s * 0.86, 0.42, z];
    const steer = front
      ? b.joint(`steer${k}`, { parent: travel, at: hub, dir: [0, 0, 1], up: [1, 0, 0], role: "hinge" })
      : travel;
    const spin = b.joint(`wheel${k}`, { parent: steer, at: hub, dir: [0, 1, 0], role: "hinge" });
    wheels[k] = mk(hub, s, [s, 0, 0], spin);
    susp[k] = mk(hub, s, [0, -1, 0], travel);
  }
  return {
    chassis,
    cab: mk([0, 0.72, 0.5], 1, [0, 1, 0]),
    bed: mk([0, 0.8, -1.45], 1, [0, 1, 0]),
    roof: mk([0, 1.95, 0.5], 1, [0, 1, 0]),
    roofFront: mk([0, 1.95, 1.05], 1, [0, 1, 0]),
    roofRear: mk([0.45, 1.95, 0.05], 1, [0, 1, 0]),
    roofCorner: mk([-0.8, 1.95, 0.1], -1, [0, 1, 0]),
    roofCornerFront: mk([-0.8, 1.95, 0.95], -1, [0, 1, 0]),
    hoodL: mk([0.55, 1.36, 1.9], 1, [0, 1, 0]),
    hoodR: mk([-0.55, 1.36, 1.9], -1, [0, 1, 0]),
    fenderL: mk([0.9, 1.4, 1.55], 1, [0, 1, 0]),
    fenderR: mk([-0.9, 1.4, 1.55], -1, [0, 1, 0]),
    cabFront: mk([0, 1.62, 1.27], 1, [0, 0, 1]),
    hood: mk([0, 1.36, 1.9], 1, [0, 1, 0]),
    grille: mk([0, 1.0, 2.5], 1, [0, 0, 1]),
    headlightL: mk([0.65, 1.05, 2.5], 1, [0, 0, 1]),
    headlightR: mk([-0.65, 1.05, 2.5], -1, [0, 0, 1]),
    bumperFront: mk([0, 0.55, 2.62], 1, [0, 0, 1]),
    bumperRear: mk([0, 0.55, -2.65], 1, [0, 0, -1]),
    rear: mk([0, 0.95, -2.57], 1, [0, 0, -1]),
    tailgate: mk([0, 1.1, -2.55], 1, [0, 0, -1]),
    cabRear: mk([0, 1.6, -0.3], 1, [0, 0, -1]),
    mirrorL: mk([0.96, 1.45, 1.15], 1, [1, 0, 0]),
    mirrorR: mk([-0.96, 1.45, 1.15], -1, [-1, 0, 0]),
    exhaustL: mk([0.7, 0.45, -2.5], 1, [0, 0, -1]),
    exhaustR: mk([-0.7, 0.45, -2.5], -1, [0, 0, -1]),
    flankL: mk([0.97, 0.6, 0], 1, [1, 0, 0]),
    flankR: mk([-0.97, 0.6, 0], -1, [-1, 0, 0]),
    bedSideL: mk([0.98, 1.1, -1.45], 1, [1, 0, 0]),
    bedSideR: mk([-0.98, 1.1, -1.45], -1, [-1, 0, 0]),
    wheelFL: wheels.FL,
    wheelFR: wheels.FR,
    wheelRL: wheels.RL,
    wheelRR: wheels.RR,
    suspFL: susp.FL,
    suspFR: susp.FR,
    suspRL: susp.RL,
    suspRR: susp.RR,
  };
}

// ---------------------------------------------------------------- cab

/** A hinged door on side `s`: joint door{L|R}{tag} at the front edge, panel, window, handle, two hinge pins. */
export function door(
  b: Builder,
  m: Mount,
  c: Roles,
  s: 1 | -1,
  zFront: number,
  zBack: number,
  name = `door${s > 0 ? "L" : "R"}${m.tag}`,
) {
  const [, y] = m.at;
  const len = zFront - zBack;
  const zc = (zFront + zBack) / 2;
  const j = b.joint(name, {
    parent: m.bone,
    at: [s * 0.95, y + 0.6, zFront],
    dir: [0, 0, 1],
    up: [1, 0, 0],
    role: "hinge",
  });
  b.part(box(0.06, 0.56, len - 0.04), c.body, { bone: j, at: [s * 0.95, y + 0.33, zc] });
  b.part(box(0.04, 0.5, len - 0.12), c.glass, { bone: j, at: [s * 0.95, y + 0.88, zc] });
  for (const dz of [-1, 1])
    b.part(box(0.06, 0.58, 0.05), c.body, { bone: j, at: [s * 0.95, y + 0.9, zc + dz * (len / 2 - 0.04)] });
  b.part(box(0.06, 0.05, len - 0.04), c.body, { bone: j, at: [s * 0.95, y + 1.16, zc] });
  b.part(box(0.03, 0.04, 0.14), c.steel, { bone: j, at: [s * 0.99, y + 0.52, zBack + 0.2] }); // handle
  for (const dy of [0.25, 0.95])
    b.part(cyl(0.025, 0.1, 6), c.steel, { bone: j, at: [s * 0.95, y + dy, zFront + 0.02] });
  return j;
}

export function cabBoxy(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(1.9, 0.6, 1.5), c.body, { bone: B, at: [x, y + 0.3, z] }); // lower cab
  b.part(box(1.9, 0.1, 1.5), c.body, { bone: B, at: [x, y + 1.2, z] }); // roof
  b.part(box(1.78, 0.56, 0.06), c.glass, { bone: B, at: [x, y + 0.88, z + 0.72] }); // windscreen
  b.part(box(1.78, 0.56, 0.05), c.glass, { bone: B, at: [x, y + 0.88, z - 0.72] }); // rear glass
  for (const s of [1, -1] as const) {
    b.part(box(0.08, 0.6, 0.08), c.body, { bone: B, at: [x + s * 0.91, y + 0.9, z + 0.71] }); // A pillar
    b.part(box(0.08, 0.6, 0.08), c.body, { bone: B, at: [x + s * 0.91, y + 0.9, z - 0.71] }); // C pillar
    b.part(box(0.06, 0.6, 0.25), c.body, { bone: B, at: [x + s * 0.92, y + 0.9, z - 0.62] }); // rear quarter
    b.part(box(0.3, 0.32, 1.2), c.body, { bone: B, at: [x + s * 0.95, y + 0.3, z + 1.05] }); // square fender
    b.part(box(0.3, 0.06, 1.3), c.trim, { bone: B, at: [x + s * 0.95, y + 0.49, z + 1.05] }); // fender lip
    door(b, m, c, s, z + 0.62, z - 0.5);
  }
  b.part(box(1.6, 0.5, 1.3), c.body, { bone: B, at: [x, y + 0.38, z + 1.4] }); // hood block
  b.part(box(1.64, 0.08, 1.3), c.body, { bone: B, at: [x, y + 0.6, z + 1.4] }); // hood lid
  b.part(box(0.2, 0.05, 1.2), c.trim, { bone: B, at: [x, y + 0.66, z + 1.4] }); // centre ridge
  b.part(box(1.86, 0.25, 0.2), c.body, { bone: B, at: [x, y + 0.18, z + 1.95] }); // nose apron
}

export function cabWedge(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(1.9, 0.6, 1.5), c.body, { bone: B, at: [x, y + 0.3, z] });
  b.part(box(1.7, 0.1, 1.1), c.body, { bone: B, at: [x, y + 1.2, z - 0.2] }); // roof, set back
  b.part(box(1.72, 0.76, 0.04), c.glass, { bone: B, at: [x, y + 0.92, z + 0.52], rotation: [-37, 0, 0] }); // raked screen
  b.part(box(1.76, 0.03, 0.03), c.body, { bone: B, at: [x, y + 0.62, z + 0.76] });
  for (const s of [1, -1] as const) {
    b.rod([x + s * 0.9, y + 0.6, z + 0.75], [x + s * 0.86, y + 1.22, z + 0.3], 0.04, c.body, {
      bone: B,
      section: "box",
    });
    b.part(box(0.08, 0.6, 0.08), c.body, { bone: B, at: [x + s * 0.91, y + 0.9, z - 0.71] });
    b.part(box(0.06, 0.6, 0.25), c.body, { bone: B, at: [x + s * 0.92, y + 0.9, z - 0.62] });
    b.part(box(0.1, 0.5, 1.2), c.trim, { bone: B, at: [x + s * 0.97, y + 0.3, z + 1.1] }); // flush fender band
    door(b, m, c, s, z + 0.62, z - 0.5);
  }
  b.frustumBox([x, y + 0.3, z + 0.75], [x, y + 0.2, z + 2.0], [1.9, 0.6], [1.8, 0.36], { bone: B, color: c.body }); // nose
  b.part(box(1.5, 0.03, 1.2), c.trim, { bone: B, at: [x, y + 0.55, z + 1.3], rotation: [10, 0, 0] }); // hood seam
}

export function cabCabover(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(1.9, 0.6, 2.7), c.body, { bone: B, at: [x, y + 0.3, z + 0.6] }); // long lower cab over the axle
  b.part(box(1.9, 0.1, 2.7), c.body, { bone: B, at: [x, y + 1.2, z + 0.6] });
  b.part(box(1.72, 0.56, 0.06), c.glass, { bone: B, at: [x, y + 0.9, z + 1.96] }); // tall screen, upper
  b.part(box(1.72, 0.2, 0.06), c.glass, { bone: B, at: [x, y + 0.5, z + 1.96] }); // lower pane
  b.part(box(1.9, 0.08, 0.1), c.body, { bone: B, at: [x, y + 0.65, z + 1.96] }); // mullion
  b.part(box(1.9, 0.4, 0.08), c.trim, { bone: B, at: [x, y + 0.2, z + 1.98] }); // lower apron
  b.part(box(1.78, 0.56, 0.05), c.glass, { bone: B, at: [x, y + 0.88, z - 0.72] });
  for (const s of [1, -1] as const) {
    b.part(box(0.08, 0.6, 0.08), c.body, { bone: B, at: [x + s * 0.91, y + 0.9, z + 1.94] });
    b.part(box(0.08, 0.6, 0.08), c.body, { bone: B, at: [x + s * 0.91, y + 0.9, z - 0.71] });
    b.part(box(0.06, 0.6, 1.5), c.body, { bone: B, at: [x + s * 0.92, y + 0.9, z + 0.6 + 0.6] }); // side panel ahead
    b.part(box(0.06, 0.6, 0.25), c.body, { bone: B, at: [x + s * 0.92, y + 0.9, z - 0.62] });
    for (const dy of [0.06, 0.26])
      b.part(box(0.3, 0.04, 0.4), c.steel, { bone: B, at: [x + s * 0.85, y - dy, z - 0.3] }); // step well
    door(b, m, c, s, z + 0.4, z - 0.5);
  }
}

export function cabCrew(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(1.9, 0.6, 2.1), c.body, { bone: B, at: [x, y + 0.3, z - 0.1] }); // cab reaches back over the bed front
  b.part(box(1.9, 0.1, 2.1), c.body, { bone: B, at: [x, y + 1.2, z - 0.1] });
  b.part(box(1.78, 0.56, 0.06), c.glass, { bone: B, at: [x, y + 0.88, z + 0.92] });
  b.part(box(1.78, 0.56, 0.05), c.glass, { bone: B, at: [x, y + 0.88, z - 1.12] });
  for (const s of [1, -1] as const) {
    b.part(box(0.08, 0.6, 0.08), c.body, { bone: B, at: [x + s * 0.91, y + 0.9, z + 0.91] });
    b.part(box(0.08, 0.6, 0.08), c.body, { bone: B, at: [x + s * 0.91, y + 0.9, z - 1.11] });
    b.part(box(0.08, 0.6, 0.08), c.body, { bone: B, at: [x + s * 0.91, y + 0.9, z - 0.1] }); // B pillar
    b.part(box(0.3, 0.32, 1.0), c.body, { bone: B, at: [x + s * 0.95, y + 0.3, z + 1.1] });
    door(b, m, c, s, z + 0.85, z - 0.06, `doorF${s > 0 ? "L" : "R"}${m.tag}`);
    door(b, m, c, s, z - 0.14, z - 1.05, `doorB${s > 0 ? "L" : "R"}${m.tag}`);
  }
  b.part(box(1.6, 0.5, 1.0), c.body, { bone: B, at: [x, y + 0.38, z + 1.5] }); // short hood
  b.part(box(1.64, 0.08, 1.0), c.body, { bone: B, at: [x, y + 0.6, z + 1.5] });
  b.part(box(1.86, 0.25, 0.2), c.body, { bone: B, at: [x, y + 0.18, z + 1.95] });
}

export function cabCage(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  const r = 0.04;
  const tube = (a: V3, d: V3) => b.rod(a, d, r, c.steel, { bone: B, sides: 6 });
  b.part(box(1.8, 0.05, 1.4), c.dark, { bone: B, at: [x, y + 0.03, z] }); // mesh floor plate
  for (let i = -0.8; i <= 0.8; i += 0.2) b.part(box(0.02, 0.02, 1.4), c.steel, { bone: B, at: [x + i, y + 0.07, z] });
  for (const s of [1, -1] as const) {
    const px = x + s * 0.85;
    tube([px, y, z + 0.7], [px, y + 1.2, z + 0.4]); // A post
    tube([px, y, z - 0.7], [px, y + 1.22, z - 0.7]); // rear post
    tube([px, y + 1.2, z + 0.4], [px, y + 1.22, z - 0.7]); // roof rail
    tube([px, y + 0.5, z + 0.7], [px, y + 0.5, z - 0.7]); // side bar
    tube([px, y, z - 0.7], [px, y + 0.5, z + 0.1]); // diagonal
    b.part(box(0.25, 0.04, 0.9), c.trim, { bone: B, at: [x + s * 0.95, y + 0.45, z + 1.1] }); // stub fender
    b.rod([px, y + 0.3, z + 0.7], [px, y + 0.1, z + 2.0], 0.035, c.steel, { bone: B, sides: 6 }); // nose bar
  }
  tube([x - 0.85, y + 1.2, z + 0.4], [x + 0.85, y + 1.2, z + 0.4]);
  tube([x - 0.85, y + 1.22, z - 0.7], [x + 0.85, y + 1.22, z - 0.7]);
  tube([x - 0.85, y + 0.5, z + 0.7], [x + 0.85, y + 0.5, z + 0.7]); // dash bar
  b.part(box(1.6, 0.5, 0.03), c.glass, { bone: B, at: [x, y + 0.85, z + 0.55], rotation: [-15, 0, 0] }); // wire glass
  b.part(box(1.0, 0.3, 0.5), c.dark, { bone: B, at: [x, y + 0.18, z + 1.5] }); // engine block, exposed
  for (const dx of [-0.3, -0.1, 0.1, 0.3])
    b.part(cyl(0.05, 0.3, 6), c.steel, { bone: B, at: [x + dx, y + 0.45, z + 1.5] });
  b.part(box(1.5, 0.06, 1.0), c.body, { bone: B, at: [x, y + 0.6, z + 1.5] }); // hood skin
}

export function cabBubble(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(1.9, 0.6, 1.5), c.body, { bone: B, at: [x, y + 0.3, z] });
  b.part(new THREE.CylinderGeometry(0.75, 0.75, 1.9, 10, 1, false, 0, Math.PI), c.glass, {
    bone: B,
    at: [x, y + 0.6, z],
    rotation: [0, 0, 90],
    flat: true,
  }); // half-cylinder canopy, axis along X
  b.part(box(1.9, 0.05, 1.5), c.trim, { bone: B, at: [x, y + 0.6, z] }); // sill ring
  for (const a of [30, 90, 150])
    b.part(box(1.92, 0.04, 0.04), c.body, {
      bone: B,
      at: [x, y + 0.6 + 0.76 * Math.sin((a * Math.PI) / 180), z + 0.76 * Math.cos((a * Math.PI) / 180)],
      rotation: [-a + 90, 0, 0],
    }); // canopy ribs
  for (const s of [1, -1] as const) {
    b.part(new THREE.SphereGeometry(0.5, 10, 6), c.body, {
      bone: B,
      at: [x + s * 0.85, y + 0.1, z + 1.05],
      scale: [0.6, 0.8, 1.3],
      flat: true,
    }); // bulged fender
    door(b, m, c, s, z + 0.62, z - 0.5);
  }
  b.part(new THREE.SphereGeometry(0.9, 12, 8), c.body, {
    bone: B,
    at: [x, y + 0.1, z + 1.3],
    scale: [0.95, 0.5, 0.8],
    flat: true,
  }); // rounded nose
  b.part(box(1.4, 0.04, 0.9), c.trim, { bone: B, at: [x, y + 0.54, z + 1.35] });
}

export const cabs = {
  boxy: cabBoxy,
  wedge: cabWedge,
  cabover: cabCabover,
  crew: cabCrew,
  cage: cabCage,
  bubble: cabBubble,
};

// ---------------------------------------------------------------- bed

export function bedOpen(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(1.95, 0.06, 2.2), c.body, { bone: B, at: [x, y, z] }); // floor
  for (let i = -0.9; i <= 0.9; i += 0.3) b.part(box(0.08, 0.03, 2.1), c.dark, { bone: B, at: [x + i, y + 0.04, z] }); // floor ribs
  b.part(box(1.95, 0.6, 0.06), c.body, { bone: B, at: [x, y + 0.3, z + 1.07] }); // headboard
  for (const s of [1, -1] as const) {
    b.part(box(0.06, 0.6, 2.2), c.body, { bone: B, at: [x + s * 0.95, y + 0.3, z] }); // wall
    b.part(box(0.1, 0.05, 2.2), c.trim, { bone: B, at: [x + s * 0.95, y + 0.62, z] }); // rail cap
    b.part(box(0.3, 0.32, 1.1), c.body, { bone: B, at: [x + s * 0.98, y - 0.2, z - 0.1] }); // rear fender
    for (const dz of [-0.8, 0, 0.8])
      b.part(new THREE.TorusGeometry(0.04, 0.012, 5, 8), c.steel, {
        bone: B,
        at: [x + s * 0.9, y + 0.1, z + dz],
        rotation: [0, 90, 0],
      }); // tie-downs
  }
  const gate = b.joint(`tailgate${m.tag}`, { parent: B, at: [x, y + 0.03, z - 1.1], dir: [0, 1, 0], role: "hinge" });
  b.part(box(1.84, 0.56, 0.06), c.body, { bone: gate, at: [x, y + 0.31, z - 1.1] });
  b.part(box(0.4, 0.05, 0.03), c.steel, { bone: gate, at: [x, y + 0.5, z - 1.14] }); // gate handle
  for (const s of [1, -1] as const)
    b.rod([x + s * 0.92, y + 0.55, z - 1.0], [x + s * 0.92, y + 0.1, z - 1.12], 0.012, c.steel, { bone: gate }); // cables
}

export function bedFlat(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(2.1, 0.06, 2.2), c.body, { bone: B, at: [x, y + 0.05, z] }); // deck
  for (const dz of [-0.9, -0.3, 0.3, 0.9]) b.part(box(2.1, 0.08, 0.08), c.dark, { bone: B, at: [x, y - 0.02, z + dz] }); // crossbeams
  b.part(box(2.1, 0.7, 0.05), c.body, { bone: B, at: [x, y + 0.42, z + 1.08] }); // headboard
  for (const dx of [-0.8, -0.4, 0, 0.4, 0.8])
    b.part(box(0.04, 0.6, 0.04), c.steel, { bone: B, at: [x + dx, y + 0.4, z + 1.05] }); // headboard bars
  for (const s of [1, -1] as const) {
    for (const dz of [-0.9, -0.3, 0.3, 0.9]) {
      b.part(box(0.1, 0.12, 0.1), c.dark, { bone: B, at: [x + s * 1.0, y + 0.02, z + dz] }); // stake pocket
      b.part(new THREE.TorusGeometry(0.035, 0.01, 5, 8), c.steel, {
        bone: B,
        at: [x + s * 1.06, y + 0.06, z + dz + 0.15],
        rotation: [0, 90, 0],
      }); // chain ring
    }
    b.part(box(0.3, 0.3, 1.1), c.body, { bone: B, at: [x + s * 0.98, y - 0.2, z - 0.1] });
    b.part(box(0.05, 0.04, 2.2), c.trim, { bone: B, at: [x + s * 1.03, y + 0.1, z] }); // rub rail
  }
}

export function bedCanopy(b: Builder, m: Mount, c: Roles) {
  bedOpen(b, m, c);
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(1.95, 0.08, 2.2), c.body, { bone: B, at: [x, y + 1.14, z] }); // shell roof
  b.part(box(1.95, 0.5, 0.06), c.body, { bone: B, at: [x, y + 0.88, z + 1.07] });
  for (const s of [1, -1] as const) {
    b.part(box(0.06, 0.12, 2.2), c.body, { bone: B, at: [x + s * 0.95, y + 0.7, z] }); // sill band
    b.part(box(0.05, 0.3, 2.0), c.glass, { bone: B, at: [x + s * 0.95, y + 0.92, z] }); // window strip
    b.part(box(0.06, 0.5, 0.1), c.body, { bone: B, at: [x + s * 0.95, y + 0.88, z + 1.03] });
    b.part(box(0.06, 0.5, 0.1), c.body, { bone: B, at: [x + s * 0.95, y + 0.88, z - 1.03] });
  }
  const hatch = b.joint(`canopyHatch${m.tag}`, {
    parent: B,
    at: [x, y + 1.12, z - 1.08],
    dir: [0, 1, 0],
    role: "hinge",
  });
  b.part(box(1.8, 0.46, 0.04), c.glass, { bone: hatch, at: [x, y + 0.88, z - 1.1] });
  b.part(box(1.84, 0.05, 0.06), c.body, { bone: hatch, at: [x, y + 1.12, z - 1.1] });
  b.part(box(0.3, 0.04, 0.04), c.steel, { bone: hatch, at: [x, y + 0.7, z - 1.13] });
}

export function bedCage(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(1.95, 0.06, 2.2), c.body, { bone: B, at: [x, y, z] });
  for (const s of [1, -1] as const) {
    b.part(box(0.06, 0.3, 2.2), c.body, { bone: B, at: [x + s * 0.95, y + 0.15, z] }); // low wall
    b.part(box(0.3, 0.32, 1.1), c.body, { bone: B, at: [x + s * 0.98, y - 0.2, z - 0.1] });
    const px = x + s * 0.88;
    b.rod([px, y + 0.3, z + 1.0], [px, y + 1.1, z + 0.9], 0.04, c.steel, { bone: B, sides: 6 });
    b.rod([px, y + 0.3, z - 1.0], [px, y + 1.05, z - 0.8], 0.04, c.steel, { bone: B, sides: 6 });
    b.rod([px, y + 1.1, z + 0.9], [px, y + 1.05, z - 0.8], 0.04, c.steel, { bone: B, sides: 6 });
    b.rod([px, y + 0.3, z - 1.0], [px, y + 1.1, z + 0.9], 0.03, c.steel, { bone: B, sides: 6 }); // X brace
    b.part(box(0.18, 0.3, 0.4), c.trim, { bone: B, at: [x + s * 0.8, y + 0.18, z + 0.5] }); // jerry can
    b.part(box(0.06, 0.04, 0.12), c.steel, { bone: B, at: [x + s * 0.8, y + 0.35, z + 0.5] });
  }
  b.rod([x - 0.88, y + 1.1, z + 0.9], [x + 0.88, y + 1.1, z + 0.9], 0.04, c.steel, { bone: B, sides: 6 });
  b.rod([x - 0.88, y + 1.05, z - 0.8], [x + 0.88, y + 1.05, z - 0.8], 0.04, c.steel, { bone: B, sides: 6 });
  b.part(cyl(0.42, 0.3, 12), c.tyre, { bone: B, at: [x, y + 0.45, z - 0.3], rotation: [0, 0, 20], flat: true }); // spare
  b.part(cyl(0.22, 0.32, 8), c.rim, { bone: B, at: [x, y + 0.45, z - 0.3], rotation: [0, 0, 20], flat: true });
  b.part(box(1.95, 0.5, 0.06), c.body, { bone: B, at: [x, y + 0.25, z + 1.07] });
}

export function bedTank(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(1.95, 0.06, 2.2), c.body, { bone: B, at: [x, y, z] });
  for (const s of [1, -1] as const)
    b.part(box(0.3, 0.32, 1.1), c.body, { bone: B, at: [x + s * 0.98, y - 0.2, z - 0.1] });
  for (const dz of [-0.7, 0.7]) {
    b.part(box(1.7, 0.25, 0.12), c.dark, { bone: B, at: [x, y + 0.15, z + dz] }); // cradle
    b.part(new THREE.TorusGeometry(0.72, 0.03, 5, 12), c.steel, { bone: B, at: [x, y + 0.85, z + dz] }); // strap
  }
  b.part(cyl(0.7, 2.0, 12), c.trim, { bone: B, at: [x, y + 0.85, z], rotation: [90, 0, 0], flat: true }); // tank
  for (const dz of [-1.02, 1.02])
    b.part(cyl(0.6, 0.06, 12), c.trim, { bone: B, at: [x, y + 0.85, z + dz], rotation: [90, 0, 0], flat: true }); // dished ends
  b.part(cyl(0.18, 0.16, 10), c.steel, { bone: B, at: [x, y + 1.6, z + 0.4] }); // filler dome
  b.part(cyl(0.05, 0.3, 6), c.steel, { bone: B, at: [x - 0.3, y + 1.6, z - 0.5] }); // vent pipe
  b.part(cyl(0.06, 0.25, 6), c.steel, { bone: B, at: [x + 0.4, y + 0.3, z - 1.06], rotation: [90, 0, 0] }); // valve stub
  b.part(new THREE.TorusGeometry(0.1, 0.02, 5, 8), c.steel, { bone: B, at: [x + 0.4, y + 0.3, z - 1.2] }); // valve wheel
  b.part(cyl(0.2, 0.2, 10), c.dark, { bone: B, at: [x - 0.6, y + 0.3, z - 1.0], rotation: [0, 0, 90] }); // hose reel
  b.part(new THREE.TorusGeometry(0.14, 0.035, 6, 10), c.tyre, {
    bone: B,
    at: [x - 0.6, y + 0.3, z - 1.0],
    rotation: [0, 90, 0],
  });
}

export function bedDump(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(1.0, 0.1, 2.1), c.dark, { bone: B, at: [x, y - 0.02, z] }); // subframe
  for (const s of [1, -1] as const)
    b.part(box(0.3, 0.32, 1.1), c.body, { bone: B, at: [x + s * 0.98, y - 0.2, z - 0.1] });
  const tip = b.joint(`tipper${m.tag}`, { parent: B, at: [x, y + 0.05, z - 1.05], dir: [0, 1, 0], role: "hinge" });
  b.part(box(1.95, 0.08, 2.2), c.body, { bone: tip, at: [x, y + 0.1, z] });
  b.part(box(1.95, 0.7, 0.06), c.body, { bone: tip, at: [x, y + 0.45, z + 1.07] });
  for (const s of [1, -1] as const) {
    b.part(box(0.06, 0.6, 2.2), c.body, { bone: tip, at: [x + s * 0.95, y + 0.4, z] });
    for (const dz of [-0.7, 0, 0.7])
      b.part(box(0.06, 0.6, 0.08), c.trim, { bone: tip, at: [x + s * 0.99, y + 0.4, z + dz] }); // wall ribs
  }
  b.part(box(1.84, 0.56, 0.05), c.body, { bone: tip, at: [x, y + 0.42, z - 1.1] });
  b.rod([x, y + 0.05, z + 0.9], [x, y + 0.6, z + 0.5], 0.08, c.steel, { bone: B, sides: 8 }); // ram cylinder
  b.rod([x, y + 0.6, z + 0.5], [x, y + 0.9, z + 0.3], 0.045, c.rim, { bone: tip, sides: 8 }); // ram piston
}

export const beds = { open: bedOpen, flat: bedFlat, canopy: bedCanopy, cage: bedCage, tank: bedTank, dump: bedDump };

// ---------------------------------------------------------------- assemble

export type Picks = {
  cab?: keyof typeof cabs;
  bed?: keyof typeof beds;
  wheel?: keyof typeof wheels;
  suspension?: keyof typeof suspensions;
  bumperFront?: keyof typeof bumpers;
  bumperRear?: keyof typeof bumpers;
  headlight?: keyof typeof headlights;
  grille?: keyof typeof grilles;
  mirror?: keyof typeof mirrors;
  exhaust?: keyof typeof exhausts;
  rack?: keyof typeof racks;
  armour?: armour.Picks;
  weapons?: weapons.Picks;
  hull?: hull.Picks;
  style?: style2077.Picks;
};

export const DEFAULT_PICKS: Required<
  Pick<
    Picks,
    | "cab"
    | "bed"
    | "wheel"
    | "suspension"
    | "bumperFront"
    | "bumperRear"
    | "headlight"
    | "grille"
    | "mirror"
    | "exhaust"
  >
> = {
  cab: "boxy",
  bed: "open",
  wheel: "offroad",
  suspension: "leaf",
  bumperFront: "bar",
  bumperRear: "bar",
  headlight: "round",
  grille: "bars",
  mirror: "stalk",
  exhaust: "tail",
};

/** The truck with these picks built into `b` (under `parent` on a board); returns the base's anchors. */
export function assembleInto(b: Builder, picks: Picks, parent?: Joint) {
  const p = { ...DEFAULT_PICKS, ...picks };
  const c = picks.style ? style2077.roles(picks.style) : PLAIN;
  const a = truckBase(b, c, parent);
  if (p.cab === "cabover") a.cabFront = { ...a.cabFront, at: [0, 1.62, 2.52] }; // its screen is at the nose
  cabs[p.cab](b, a.cab, c);
  beds[p.bed](b, a.bed, c);
  const track = picks.armour?.track;
  for (const k of ["FL", "FR", "RL", "RR"] as const) {
    suspensions[p.suspension](b, a[`susp${k}`], c);
    if (!track || (track === "half" && k[0] === "F")) wheels[p.wheel](b, a[`wheel${k}`], c);
  }
  if (track)
    for (const side of ["L", "R"] as const) {
      const flank = a[`flank${side}`];
      armour.tracks[track](b, { ...flank, at: [flank.s * 0.86, 0.42, track === "half" ? -1.0 : 0] }, c);
    }
  bumpers[p.bumperFront](b, a.bumperFront, c);
  bumpers[p.bumperRear](b, a.bumperRear, c);
  headlights[p.headlight](b, a.headlightL, c);
  headlights[p.headlight](b, a.headlightR, c);
  grilles[p.grille](b, a.grille, c);
  mirrors[p.mirror](b, a.mirrorL, c);
  mirrors[p.mirror](b, a.mirrorR, c);
  exhausts[p.exhaust](b, a.exhaustL, c);
  exhausts[p.exhaust](b, a.exhaustR, c);
  if (p.rack) racks[p.rack](b, p.rack === "headache" ? a.cabRear : p.rack === "ladder" ? a.bed : a.roof, c);
  if (picks.armour) armour.dress(b, a, c, picks.armour);
  if (picks.weapons) weapons.dress(b, a, c, picks.weapons);
  if (picks.hull) hull.dress(b, a, c, picks.hull);
  if (picks.style) style2077.dress(b, a, c, picks.style);
  return a;
}

/** A complete truck from a pick list: the app's placeholder while the builder's own module streams in. */
export function assemble(picks: Picks) {
  const b = createBuilder({ name: "truck" });
  assembleInto(b, picks);
  return b.root;
}

// ---------------------------------------------------------------- board

export const meta = {
  name: "Truck catalog",
  description: "Wheeled-vehicle sampler: the base pickup and every slot's variants.",
};

/** A board builder with its root joint. */
function boardStart(name: string) {
  const b = createBuilder({ name });
  return { b, root: b.joint("board", { at: [0, 0, 0] }) };
}

/** The cull sheet, split so the signs stay readable: the default truck with the cabs; more boards below. */
export default function build() {
  const { b, root } = boardStart("truckBoard");
  assembleInto(b, { rack: "roof" }, root);
  title(b, "base truck", [0, 0.01, -3.6], root);
  slot(b, root, 5.5, cabs, "cab", PLAIN, { y: 0.72, pitch: 2.7, front: 2.5, labelWidth: 2.2 });
  return b.root;
}

export function boardBeds() {
  const { b, root } = boardStart("truckBeds");
  slot(b, root, 0, beds, "bed", PLAIN, { y: 0.8, pitch: 2.7, front: 1.7, labelWidth: 2.2 });
  return b.root;
}
