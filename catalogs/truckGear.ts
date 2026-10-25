/**
 * catalogs/truckGear.ts: the pickup's running gear and trim: wheels, suspension, bumpers, headlights, grilles,
 * mirrors, exhausts, racks. Same contract as catalogs/truck.ts, which holds the base, the cab and bed slots and
 * `assemble`: every variant is `variant(b: Builder, m: Mount, c: Roles)`, Mount = { bone, at, s, n, root, tag }
 * (bone the joint it rides, at the mount point in model space, s the side sign, n the outward normal, root the
 * chassis, tag a joint-name suffix), Roles = colours by part role, `box(w, h, d)` and `cyl(r, h, sides)` the two
 * geometry one-liners from truck.ts. Positions are model space relative to `m.at`; wheels build with their axle
 * along X and their outer face at x + s·0.16.
 *
 * SLOTS (mount → variants, one line each on the construction)
 *   wheel (anchors.wheelFL FR RL RR; tyre r 0.42, width 0.32; bone spins)
 *     wheelOffroad   staggered tread blocks round a carcass, 6 lugs, hub cap
 *     wheelSpoked    low tyre, 5 box spokes from a hub to a rim ring
 *     wheelSteelie   solid steel disc with 4 slots and 8 lugs, torus tyre with a sidewall ridge
 *     wheelBeadlock  outer beadlock ring with 16 bolts over a fat torus tyre
 *     wheelMesh      12 thin rod spokes to a torus rim, thin tyre
 *     wheelDually    twin tyres on one long hub, 8 lugs
 *     wheelHubless   open centre: three struts from the axle to an inner ring inside the tyre
 *     wheelArmoured  flat cover disc riveted over the face, 10-sided run-flat tyre, centre boss
 *   suspension (anchors.suspFL.., one wheel at a time; bone = travel joint at the rail, root = chassis)
 *     suspensionLeaf         half axle tube, three-leaf stack, U-bolts, shackle and one shock
 *     suspensionCoil         upper and lower A-arms, coil-over spring of stacked rings, knuckle
 *     suspensionLift         tall coil, drop bracket, track bar, twin shocks, bump stop
 *     suspensionIndependent  double wishbones, pushrod to a rocker with an inboard horizontal spring
 *     suspensionAirbag       bellows of alternating fat and thin drums on a trailing arm, air line
 *     suspensionPortal       portal gear box hanging under a raised axle tube, single spring plate, shock
 *   bumper (anchors.bumperFront / bumperRear; n gives the facing; 2.1 m wide at y 0.55)
 *     bumperBar     steel bar, end caps, two tow hooks, frame brackets
 *     bumperRam     two angled plough plates meeting at a centre boss, a row of teeth along the lower edge
 *     bumperTube    bull bar swept from a tube path with a top hoop and vertical mesh rods
 *     bumperWinch   plate bumper with a winch drum, roller fairlead, cable and hook
 *     bumperSpikes  bar with seven forward spikes and two rivet rows
 *     bumperBlade   dozer blade (extruded curved profile) on two hydraulic arms, cutting edge, teeth
 *   headlight (anchors.headlightL / R; n front; the lens glows in c.light)
 *     headlightRound    torus bezel with a glowing lens disc and three rivets
 *     headlightSlit     wide thin housing with a glowing strip and a brow lip
 *     headlightPod      two round pods on a stalk rising from the mount
 *     headlightSquare   framed square lens behind a rod guard grid
 *     headlightCluster  three stacked small lenses in one housing
 *     headlightCowl     lens recessed under a half-cylinder hood
 *   grille (anchors.grille; 1.0 × 0.4 opening)
 *     grilleBars    five horizontal rods in a frame
 *     grilleMesh    rod grid both ways over a dark backing
 *     grilleSlats   angled louvre slats in a frame
 *     grilleGuard   seven thick vertical bars and a hex emblem plate
 *     grilleSplit   two openings with three bars each around a centre beam
 *     grilleIntake  open scoop with a turbine fan inside (spin joint fan{tag})
 *   mirror (anchors.mirrorL / R)    mirrorStalk two rods to a square mirror · mirrorCamera stub, pod and lens
 *   exhaust (anchors.exhaustL / R)  exhaustTail twin tips out the back · exhaustStack pipe forward then up to a
 *                                   capped stack behind the cab · exhaustSide pipe along the flank, muffler, shield
 *   rack                            rackRoof (anchors.roof) rails, crossbars, lamp pods · rackHeadache
 *                                   (anchors.cabRear) mesh frame with lamps · rackLadder (anchors.bed) four
 *                                   uprights, two bars, crossbars
 *
 * Registries (wheels, suspensions, bumpers, headlights, grilles, mirrors, exhausts, racks) map the pick name
 * ("offroad") to the variant; truck.ts `assemble` reads them.
 */
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Builder } from "../src/builder";
import type { Joint } from "../src/skeleton";
import { polyline } from "../src/path";
import { glow } from "../kits/glow";
import { box, cyl } from "./truck";
import type { Mount, Roles, V3 } from "./truck";
import { PLAIN } from "./truck";
import { slot } from "./board";

const R90: V3 = [0, 0, 90]; // a cylinder's axis turned along X
const TAU = Math.PI * 2;

// ---------------------------------------------------------------- wheel

/** `count` small parts in a ring of radius `r` round the wheel axis, each turned to face outward. */
function lugs(b: Builder, m: Mount, c: Roles, count: number, r: number, dx: number, geo: THREE.BufferGeometry) {
  const [x, y, z] = m.at;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * TAU;
    b.part(geo, c.steel, {
      bone: m.bone,
      at: [x + m.s * dx, y + r * Math.cos(a), z + r * Math.sin(a)],
      rotation: R90,
      flat: true,
    });
  }
}

export function wheelOffroad(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(cyl(0.36, 0.3, 12), c.tyre, { bone: B, at: [x, y, z], rotation: R90, flat: true }); // carcass
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU;
    b.part(box(0.15, 0.1, 0.13), c.tyre, {
      bone: B,
      at: [x + (i % 2 ? 0.075 : -0.075), y + 0.37 * Math.cos(a), z + 0.37 * Math.sin(a)],
      rotation: [(a * 180) / Math.PI, 0, 0],
      flat: true,
    });
  }
  b.part(cyl(0.22, 0.32, 8), c.rim, { bone: B, at: [x, y, z], rotation: R90, flat: true });
  b.part(cyl(0.09, 0.36, 6), c.steel, { bone: B, at: [x, y, z], rotation: R90, flat: true }); // hub cap
  lugs(b, m, c, 6, 0.14, 0.17, cyl(0.025, 0.04, 6));
}

export function wheelSpoked(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(cyl(0.42, 0.26, 16), c.tyre, { bone: B, at: [x, y, z], rotation: R90, flat: true }); // low tyre
  b.part(cyl(0.33, 0.28, 16), c.rim, { bone: B, at: [x, y, z], rotation: R90, flat: true }); // rim ring
  b.part(cyl(0.3, 0.3, 16), c.dark, { bone: B, at: [x, y, z], rotation: R90, flat: true }); // dish
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU;
    b.part(box(0.06, 0.28, 0.07), c.rim, {
      bone: B,
      at: [x + m.s * 0.1, y + 0.17 * Math.cos(a), z + 0.17 * Math.sin(a)],
      rotation: [(a * 180) / Math.PI, 0, 0],
      flat: true,
    });
  }
  b.part(cyl(0.08, 0.34, 8), c.rim, { bone: B, at: [x, y, z], rotation: R90, flat: true });
  lugs(b, m, c, 5, 0.05, 0.18, cyl(0.015, 0.02, 6));
}

export function wheelSteelie(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(new THREE.TorusGeometry(0.3, 0.12, 6, 16), c.tyre, {
    bone: B,
    at: [x, y, z],
    rotation: [0, 90, 0],
    flat: true,
  }); // torus tyre
  b.part(new THREE.TorusGeometry(0.28, 0.14, 4, 16), c.tyre, {
    bone: B,
    at: [x, y, z],
    rotation: [0, 90, 0],
    scale: [1, 1, 0.6],
    flat: true,
  }); // sidewall ridge
  b.part(cyl(0.3, 0.08, 12), c.rim, { bone: B, at: [x + m.s * 0.12, y, z], rotation: R90, flat: true }); // steel disc
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + 0.4;
    b.part(box(0.03, 0.06, 0.1), c.dark, {
      bone: B,
      at: [x + m.s * 0.16, y + 0.2 * Math.cos(a), z + 0.2 * Math.sin(a)],
      rotation: [(a * 180) / Math.PI, 0, 0],
    }); // slots
  }
  b.part(cyl(0.06, 0.08, 8), c.steel, { bone: B, at: [x + m.s * 0.17, y, z], rotation: R90, flat: true });
  lugs(b, m, c, 8, 0.1, 0.17, cyl(0.018, 0.03, 6));
}

export function wheelBeadlock(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(new THREE.TorusGeometry(0.27, 0.15, 8, 16), c.tyre, {
    bone: B,
    at: [x, y, z],
    rotation: [0, 90, 0],
    flat: true,
  });
  b.part(cyl(0.26, 0.3, 12), c.rim, { bone: B, at: [x, y, z], rotation: R90, flat: true }); // rim drum
  b.part(cyl(0.3, 0.05, 16), c.steel, { bone: B, at: [x + m.s * 0.16, y, z], rotation: R90, flat: true }); // beadlock ring
  lugs(b, m, c, 16, 0.27, 0.19, cyl(0.013, 0.02, 6)); // ring bolts
  b.part(cyl(0.12, 0.34, 8), c.dark, { bone: B, at: [x, y, z], rotation: R90, flat: true });
  lugs(b, m, c, 6, 0.08, 0.18, cyl(0.02, 0.03, 6));
}

export function wheelMesh(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(cyl(0.42, 0.22, 16), c.tyre, { bone: B, at: [x, y, z], rotation: R90, flat: true });
  b.part(new THREE.TorusGeometry(0.3, 0.03, 6, 16), c.rim, {
    bone: B,
    at: [x + m.s * 0.06, y, z],
    rotation: [0, 90, 0],
  }); // rim hoop
  b.part(cyl(0.07, 0.26, 8), c.rim, { bone: B, at: [x, y, z], rotation: R90, flat: true });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    b.rod([x + m.s * 0.1, y, z], [x + m.s * 0.05, y + 0.3 * Math.cos(a), z + 0.3 * Math.sin(a)], 0.012, c.rim, {
      bone: B,
      sides: 5,
    });
  }
  lugs(b, m, c, 5, 0.04, 0.14, cyl(0.012, 0.02, 6));
}

export function wheelDually(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  for (const dx of [0.1, -0.24]) {
    b.part(cyl(0.42, 0.28, 12), c.tyre, { bone: B, at: [x + m.s * dx, y, z], rotation: R90, flat: true });
    b.part(cyl(0.24, 0.3, 10), c.rim, { bone: B, at: [x + m.s * dx, y, z], rotation: R90, flat: true });
  }
  b.part(cyl(0.12, 0.7, 8), c.steel, { bone: B, at: [x + m.s * -0.07, y, z], rotation: R90, flat: true }); // long hub
  b.part(cyl(0.11, 0.1, 8), c.rim, { bone: B, at: [x + m.s * 0.26, y, z], rotation: R90, flat: true });
  lugs(b, m, c, 8, 0.15, 0.27, cyl(0.02, 0.04, 6));
}

export function wheelHubless(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(new THREE.TorusGeometry(0.32, 0.1, 6, 16), c.tyre, {
    bone: B,
    at: [x, y, z],
    rotation: [0, 90, 0],
    flat: true,
  });
  b.part(new THREE.TorusGeometry(0.24, 0.035, 6, 16), c.rim, { bone: B, at: [x, y, z], rotation: [0, 90, 0] }); // inner ring
  b.part(cyl(0.06, 0.2, 8), c.steel, { bone: B, at: [x, y, z], rotation: R90, flat: true }); // axle stub
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU;
    b.rod([x, y, z], [x, y + 0.22 * Math.cos(a), z + 0.22 * Math.sin(a)], 0.025, c.steel, { bone: B, sides: 6 });
  }
}

export function wheelArmoured(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(cyl(0.42, 0.3, 10), c.tyre, { bone: B, at: [x, y, z], rotation: R90, flat: true }); // run-flat
  b.part(cyl(0.4, 0.05, 10), c.rim, { bone: B, at: [x + m.s * 0.17, y, z], rotation: R90, flat: true }); // cover disc
  lugs(b, m, c, 12, 0.34, 0.2, cyl(0.015, 0.015, 6)); // rivets
  b.part(cyl(0.12, 0.08, 8), c.steel, { bone: B, at: [x + m.s * 0.22, y, z], rotation: R90, flat: true }); // boss
  b.part(cyl(0.05, 0.04, 6), c.dark, { bone: B, at: [x + m.s * 0.28, y, z], rotation: R90, flat: true });
}

export const wheels = {
  offroad: wheelOffroad,
  spoked: wheelSpoked,
  steelie: wheelSteelie,
  beadlock: wheelBeadlock,
  mesh: wheelMesh,
  dually: wheelDually,
  hubless: wheelHubless,
  armoured: wheelArmoured,
};

// ---------------------------------------------------------------- suspension (one wheel at a time)

/** A coil spring between two points: `n` stacked rings. */
function coil(b: Builder, bone: Joint, c: Roles, from: V3, to: V3, r: number, n: number) {
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    b.part(new THREE.TorusGeometry(r, r * 0.18, 5, 8), c.steel, {
      bone,
      at: [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t],
      dir: [to[0] - from[0], to[1] - from[1], to[2] - from[2]],
      axis: "z",
    });
  }
}

export function suspensionLeaf(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  const B = m.bone;
  b.rod([x, y, z], [x - s * 0.9, y, z], 0.06, c.dark, { bone: B, sides: 8 }); // half axle
  if (s === 1) b.part(new THREE.SphereGeometry(0.17, 8, 6), c.dark, { bone: B, at: [x - 0.75, y, z], flat: true }); // pumpkin
  for (const [h, len] of [
    [0.1, 1.2],
    [0.13, 0.95],
    [0.16, 0.7],
  ])
    b.part(box(0.08, 0.025, len), c.steel, { bone: B, at: [x - s * 0.36, y + h, z] }); // leaves
  b.part(box(0.12, 0.04, 0.16), c.dark, { bone: B, at: [x - s * 0.36, y + 0.19, z] }); // U-bolt plate
  for (const dz of [-0.06, 0.06])
    b.rod([x - s * 0.36, y - 0.05, z + dz], [x - s * 0.36, y + 0.22, z + dz], 0.012, c.steel, { bone: B, sides: 5 });
  b.part(box(0.04, 0.16, 0.05), c.steel, { bone: m.root, at: [x - s * 0.36, y + 0.16, z - 0.62] }); // shackle on the frame
  b.rod([x - s * 0.3, y + 0.02, z - 0.15], [x - s * 0.42, y + 0.45, z + 0.1], 0.035, c.rim, { bone: B, sides: 8 }); // shock
}

export function suspensionCoil(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  const B = m.bone;
  b.part(box(0.1, 0.3, 0.14), c.dark, { bone: B, at: [x - s * 0.17, y, z] }); // knuckle
  for (const dz of [-0.25, 0.25]) {
    b.rod([x - s * 0.2, y - 0.1, z], [x - s * 0.52, y - 0.08, z + dz], 0.025, c.steel, { bone: B, sides: 6 }); // lower A-arm
    b.rod([x - s * 0.2, y + 0.14, z], [x - s * 0.5, y + 0.16, z + dz], 0.022, c.steel, { bone: B, sides: 6 }); // upper A-arm
  }
  coil(b, B, c, [x - s * 0.32, y - 0.06, z], [x - s * 0.4, y + 0.3, z], 0.08, 5);
  b.rod([x - s * 0.3, y - 0.1, z], [x - s * 0.42, y + 0.34, z], 0.03, c.rim, { bone: B, sides: 8 }); // damper inside
  b.part(box(0.12, 0.04, 0.12), c.dark, { bone: m.root, at: [x - s * 0.42, y + 0.34, z] }); // top mount
}

export function suspensionLift(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  const B = m.bone;
  b.rod([x, y, z], [x - s * 0.9, y, z], 0.06, c.dark, { bone: B, sides: 8 });
  b.part(box(0.1, 0.25, 0.1), c.dark, { bone: m.root, at: [x - s * 0.36, y + 0.4, z + 0.5] }); // drop bracket
  coil(b, B, c, [x - s * 0.36, y + 0.04, z], [x - s * 0.36, y + 0.44, z], 0.09, 8);
  b.part(cyl(0.05, 0.08, 6), c.tyre, { bone: m.root, at: [x - s * 0.36, y + 0.48, z + 0.2] }); // bump stop
  b.rod([x - s * 0.1, y + 0.06, z + 0.1], [x - s * 1.0, y + 0.3, z + 0.1], 0.025, c.steel, { bone: B, sides: 6 }); // track bar
  for (const dz of [-0.18, 0.18])
    b.rod([x - s * 0.25, y, z + dz], [x - s * 0.5, y + 0.48, z + dz * 1.5], 0.03, c.rim, { bone: B, sides: 7 }); // twin shocks
}

export function suspensionIndependent(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  const B = m.bone;
  b.part(box(0.08, 0.36, 0.12), c.dark, { bone: B, at: [x - s * 0.16, y, z] }); // upright
  for (const dz of [-0.28, 0.28]) {
    b.rod([x - s * 0.18, y - 0.14, z], [x - s * 0.6, y - 0.1, z + dz], 0.022, c.steel, { bone: B, sides: 6 });
    b.rod([x - s * 0.18, y + 0.16, z], [x - s * 0.55, y + 0.2, z + dz], 0.02, c.steel, { bone: B, sides: 6 });
  }
  b.rod([x - s * 0.22, y - 0.12, z], [x - s * 0.5, y + 0.42, z], 0.018, c.rim, { bone: B, sides: 6 }); // pushrod
  b.part(box(0.04, 0.16, 0.08), c.dark, { bone: m.root, at: [x - s * 0.5, y + 0.42, z] }); // rocker
  coil(b, m.root, c, [x - s * 0.52, y + 0.46, z], [x - s * 0.86, y + 0.46, z], 0.045, 7); // inboard spring, horizontal
  b.part(cyl(0.025, 0.36, 6), c.rim, { bone: m.root, at: [x - s * 0.69, y + 0.46, z], rotation: R90 });
}

export function suspensionAirbag(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  const B = m.bone;
  b.part(box(0.08, 0.08, 0.7), c.dark, { bone: B, at: [x - s * 0.36, y, z + 0.3] }); // trailing arm
  b.rod([x, y, z], [x - s * 0.9, y, z], 0.06, c.dark, { bone: B, sides: 8 });
  for (let i = 0; i < 4; i++)
    b.part(cyl(i % 2 ? 0.08 : 0.12, 0.09, 10), i % 2 ? c.dark : c.tyre, {
      bone: B,
      at: [x - s * 0.36, y + 0.09 + i * 0.09, z],
      flat: true,
    }); // bellows
  b.part(cyl(0.11, 0.03, 10), c.steel, { bone: m.root, at: [x - s * 0.36, y + 0.46, z] }); // top plate
  b.rod([x - s * 0.36, y + 0.46, z], [x - s * 0.7, y + 0.5, z + 0.3], 0.01, c.rim, { bone: m.root, sides: 5 }); // air line
}

export function suspensionPortal(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  const B = m.bone;
  b.part(box(0.2, 0.34, 0.26), c.dark, { bone: B, at: [x - s * 0.1, y + 0.12, z] }); // portal gear box
  for (const dz of [-0.09, 0.09])
    b.part(cyl(0.02, 0.02, 6), c.steel, { bone: B, at: [x, y + 0.2, z + dz], rotation: R90 }); // cover bolts
  b.rod([x - s * 0.15, y + 0.24, z], [x - s * 0.9, y + 0.24, z], 0.05, c.dark, { bone: B, sides: 8 }); // raised axle
  b.part(box(0.08, 0.03, 0.8), c.steel, { bone: B, at: [x - s * 0.38, y + 0.3, z] }); // single spring plate
  b.rod([x - s * 0.3, y + 0.26, z - 0.1], [x - s * 0.42, y + 0.5, z + 0.1], 0.03, c.rim, { bone: B, sides: 8 });
  b.part(box(0.06, 0.06, 0.06), c.steel, { bone: m.root, at: [x - s * 0.42, y + 0.5, z + 0.1] });
}

export const suspensions = {
  leaf: suspensionLeaf,
  coil: suspensionCoil,
  lift: suspensionLift,
  independent: suspensionIndependent,
  airbag: suspensionAirbag,
  portal: suspensionPortal,
};

// ---------------------------------------------------------------- bumper (n gives the facing)

export function bumperBar(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const f = m.n[2];
  const B = m.bone;
  b.part(box(2.1, 0.22, 0.16), c.trim, { bone: B, at: [x, y, z] });
  for (const s of [1, -1] as const) {
    b.part(box(0.16, 0.26, 0.2), c.trim, { bone: B, at: [x + s * 1.05, y, z] }); // end cap
    b.part(new THREE.TorusGeometry(0.06, 0.02, 5, 8, Math.PI), c.steel, {
      bone: B,
      at: [x + s * 0.6, y - 0.11, z + f * 0.06],
      rotation: [0, 0, 180],
    }); // tow hook
    b.part(box(0.08, 0.1, 0.3), c.dark, { bone: B, at: [x + s * 0.5, y, z - f * 0.2] }); // frame bracket
  }
}

export function bumperRam(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const f = m.n[2];
  const B = m.bone;
  for (const s of [1, -1] as const) {
    b.part(box(1.1, 0.4, 0.06), c.trim, { bone: B, at: [x + s * 0.5, y, z - f * 0.14], rotation: [0, s * f * 25, 0] }); // angled plate
    for (let i = 0; i < 4; i++) {
      const u = 0.12 + i * 0.26;
      b.spike([x + s * u, y - 0.17, z + f * (0.08 - u * 0.45)], [0, 0, f], 0.14, 0.03, c.steel, { bone: B, sides: 5 }); // teeth
    }
  }
  b.part(cyl(0.12, 0.12, 8), c.steel, { bone: B, at: [x, y, z + f * 0.08], rotation: [90, 0, 0], flat: true }); // centre boss
  b.part(box(1.0, 0.08, 0.3), c.dark, { bone: B, at: [x, y + 0.05, z - f * 0.25] });
}

export function bumperTube(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const f = m.n[2];
  const B = m.bone;
  const bar = polyline([
    [x + 0.9, y - 0.12, z - f * 0.3],
    [x + 0.9, y - 0.12, z + f * 0.1],
    [x + 0.5, y - 0.12, z + f * 0.2],
    [x - 0.5, y - 0.12, z + f * 0.2],
    [x - 0.9, y - 0.12, z + f * 0.1],
    [x - 0.9, y - 0.12, z - f * 0.3],
  ]);
  b.sweep(bar, 0.05, c.steel, { bone: B, sides: 8, caps: "flat" });
  const hoop = polyline([
    [x + 0.6, y - 0.1, z + f * 0.15],
    [x + 0.6, y + 0.5, z + f * 0.1],
    [x + 0.35, y + 0.6, z + f * 0.08],
    [x - 0.35, y + 0.6, z + f * 0.08],
    [x - 0.6, y + 0.5, z + f * 0.1],
    [x - 0.6, y - 0.1, z + f * 0.15],
  ]);
  b.sweep(hoop, 0.04, c.steel, { bone: B, sides: 8, caps: "flat" });
  for (const dx of [-0.4, -0.2, 0, 0.2, 0.4])
    b.rod([x + dx, y - 0.1, z + f * 0.15], [x + dx, y + 0.56, z + f * 0.1], 0.012, c.steel, { bone: B, sides: 5 });
  b.rod([x - 0.6, y + 0.25, z + f * 0.12], [x + 0.6, y + 0.25, z + f * 0.12], 0.02, c.steel, { bone: B, sides: 6 });
}

export function bumperWinch(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const f = m.n[2];
  const B = m.bone;
  b.part(box(2.0, 0.3, 0.14), c.trim, { bone: B, at: [x, y, z] });
  b.part(box(0.9, 0.3, 0.3), c.dark, { bone: B, at: [x, y + 0.02, z - f * 0.12] }); // winch housing
  b.part(cyl(0.09, 0.5, 10), c.steel, { bone: B, at: [x, y + 0.08, z + f * 0.02], rotation: R90 }); // drum
  b.part(cyl(0.07, 0.56, 8), c.rim, { bone: B, at: [x, y + 0.08, z + f * 0.02], rotation: R90 }); // cable layer
  b.part(box(0.5, 0.18, 0.06), c.steel, { bone: B, at: [x, y + 0.08, z + f * 0.1] }); // fairlead
  for (const dy of [-0.06, 0.06])
    b.part(cyl(0.02, 0.44, 6), c.rim, { bone: B, at: [x, y + 0.08 + dy, z + f * 0.14], rotation: R90 }); // rollers
  b.rod([x, y + 0.08, z + f * 0.14], [x, y - 0.05, z + f * 0.28], 0.012, c.rim, { bone: B, sides: 5 });
  b.part(new THREE.TorusGeometry(0.05, 0.015, 5, 8, Math.PI * 1.5), c.steel, {
    bone: B,
    at: [x, y - 0.1, z + f * 0.3],
    rotation: [0, 90, 0],
  }); // hook
  for (const s of [1, -1] as const) b.part(box(0.1, 0.12, 0.3), c.dark, { bone: B, at: [x + s * 0.5, y, z - f * 0.2] });
}

export function bumperSpikes(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const f = m.n[2];
  const B = m.bone;
  b.part(box(2.1, 0.26, 0.2), c.trim, { bone: B, at: [x, y, z] });
  for (let i = 0; i < 7; i++)
    b.spike([x - 0.9 + i * 0.3, y, z + f * 0.1], [0, 0, f], 0.3, 0.045, c.steel, { bone: B, sides: 6 });
  for (const dy of [-0.09, 0.09])
    for (let i = 0; i < 8; i++)
      b.part(cyl(0.015, 0.02, 6), c.steel, {
        bone: B,
        at: [x - 1.0 + i * 0.3 + 0.07, y + dy, z + f * 0.1],
        rotation: [90, 0, 0],
      });
  for (const s of [1, -1] as const) b.part(box(0.1, 0.12, 0.3), c.dark, { bone: B, at: [x + s * 0.5, y, z - f * 0.2] });
}

export function bumperBlade(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const f = m.n[2];
  const B = m.bone;
  const blade = b.extrude(
    [
      [0, -0.25],
      [0.12, -0.25, "sharp"],
      [0.02, 0.0],
      [0.1, 0.3],
      [0.28, 0.45, "sharp"],
      [0.2, 0.45, "sharp"],
      [0.0, 0.3],
      [-0.06, 0.0],
    ],
    { at: [x, y, z + f * 0.2], x: [0, 0, f], y: [0, 1, 0], thickness: 2.2, smoothing: 1, bone: B, color: c.trim },
  );
  void blade;
  b.part(box(2.2, 0.06, 0.1), c.steel, { bone: B, at: [x, y - 0.26, z + f * 0.28] }); // cutting edge
  for (let i = 0; i < 6; i++)
    b.spike([x - 1.0 + i * 0.4, y - 0.26, z + f * 0.3], [0, -0.5, f], 0.12, 0.03, c.steel, { bone: B, sides: 5 });
  for (const s of [1, -1] as const) {
    b.rod([x + s * 0.5, y + 0.3, z - f * 0.3], [x + s * 0.5, y + 0.1, z + f * 0.1], 0.04, c.steel, {
      bone: B,
      sides: 8,
    }); // arm
    b.rod([x + s * 0.7, y + 0.1, z - f * 0.3], [x + s * 0.7, y + 0.35, z + f * 0.1], 0.03, c.rim, {
      bone: B,
      sides: 7,
    }); // hydraulic
    b.rod([x + s * 0.7, y + 0.1, z - f * 0.3], [x + s * 0.7, y + 0.2, z - f * 0.14], 0.045, c.steel, {
      bone: B,
      sides: 7,
    });
  }
}

export const bumpers = {
  bar: bumperBar,
  ram: bumperRam,
  tube: bumperTube,
  winch: bumperWinch,
  spikes: bumperSpikes,
  blade: bumperBlade,
};

// ---------------------------------------------------------------- headlight (per side; lens glows)

export function headlightRound(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(new THREE.TorusGeometry(0.13, 0.03, 6, 12), c.steel, { bone: B, at: [x, y, z + 0.02] }); // bezel
  glow(b.part(cyl(0.12, 0.04, 12), c.light, { bone: B, at: [x, y, z + 0.01], rotation: [90, 0, 0], flat: true }));
  for (const a of [90, 210, 330])
    b.part(cyl(0.012, 0.02, 6), c.steel, {
      bone: B,
      at: [x + 0.14 * Math.cos((a * Math.PI) / 180), y + 0.14 * Math.sin((a * Math.PI) / 180), z + 0.04],
      rotation: [90, 0, 0],
    });
}

export function headlightSlit(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.5, 0.12, 0.08), c.dark, { bone: B, at: [x, y, z] }); // housing
  glow(b.part(box(0.44, 0.04, 0.02), c.light, { bone: B, at: [x, y, z + 0.04] }));
  b.part(box(0.54, 0.03, 0.14), c.trim, { bone: B, at: [x, y + 0.08, z + 0.02] }); // brow
}

export function headlightPod(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.rod([x, y + 0.1, z - 0.1], [x, y + 0.4, z - 0.1], 0.03, c.steel, { bone: B, sides: 6 }); // stalk
  for (const dx of [-0.13, 0.13]) {
    b.part(cyl(0.1, 0.16, 10), c.dark, { bone: B, at: [x + dx, y + 0.42, z - 0.1], rotation: [90, 0, 0], flat: true }); // pod
    glow(
      b.part(cyl(0.08, 0.02, 10), c.light, {
        bone: B,
        at: [x + dx, y + 0.42, z - 0.01],
        rotation: [90, 0, 0],
        flat: true,
      }),
    );
  }
  b.part(box(0.36, 0.04, 0.04), c.steel, { bone: B, at: [x, y + 0.42, z - 0.18] }); // pod bar
}

export function headlightSquare(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.34, 0.26, 0.06), c.trim, { bone: B, at: [x, y, z] }); // frame
  glow(b.part(box(0.28, 0.2, 0.02), c.light, { bone: B, at: [x, y, z + 0.03] }));
  for (const dy of [-0.08, 0, 0.08])
    b.rod([x - 0.17, y + dy, z + 0.06], [x + 0.17, y + dy, z + 0.06], 0.008, c.steel, { bone: B, sides: 5 });
  for (const dx of [-0.07, 0.07])
    b.rod([x + dx, y - 0.13, z + 0.06], [x + dx, y + 0.13, z + 0.06], 0.008, c.steel, { bone: B, sides: 5 });
}

export function headlightCluster(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.18, 0.4, 0.08), c.dark, { bone: B, at: [x, y, z] });
  for (const dy of [-0.13, 0, 0.13]) {
    b.part(new THREE.TorusGeometry(0.05, 0.012, 5, 10), c.steel, { bone: B, at: [x, y + dy, z + 0.04] });
    glow(
      b.part(cyl(0.045, 0.02, 10), c.light, { bone: B, at: [x, y + dy, z + 0.04], rotation: [90, 0, 0], flat: true }),
    );
  }
}

export function headlightCowl(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.26, 8, 1, false, -Math.PI / 2, Math.PI), c.trim, {
    bone: B,
    at: [x, y, z - 0.1],
    rotation: [-90, 0, 0],
    flat: true,
  }); // half-cylinder hood, open underneath, axis along Z
  b.part(cyl(0.14, 0.2, 10), c.dark, { bone: B, at: [x, y - 0.02, z - 0.14], rotation: [90, 0, 0], flat: true });
  glow(
    b.part(cyl(0.11, 0.02, 10), c.light, { bone: B, at: [x, y - 0.02, z - 0.03], rotation: [90, 0, 0], flat: true }),
  );
}

export const headlights = {
  round: headlightRound,
  slit: headlightSlit,
  pod: headlightPod,
  square: headlightSquare,
  cluster: headlightCluster,
  cowl: headlightCowl,
};

// ---------------------------------------------------------------- grille (1.0 × 0.4 at the front face)

function grilleFrame(b: Builder, m: Mount, c: Roles, w = 1.0, h = 0.4) {
  const [x, y, z] = m.at;
  b.part(box(w, h, 0.04), c.dark, { bone: m.bone, at: [x, y, z - 0.02] }); // dark backing
  for (const s of [1, -1] as const)
    b.part(box(0.04, h + 0.04, 0.06), c.trim, { bone: m.bone, at: [x + (s * w) / 2, y, z] });
  for (const s of [1, -1] as const)
    b.part(box(w + 0.04, 0.04, 0.06), c.trim, { bone: m.bone, at: [x, y + (s * h) / 2, z] });
}

export function grilleBars(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  grilleFrame(b, m, c);
  for (let i = 0; i < 5; i++)
    b.rod([x - 0.48, y - 0.15 + i * 0.075, z + 0.02], [x + 0.48, y - 0.15 + i * 0.075, z + 0.02], 0.016, c.steel, {
      bone: m.bone,
      sides: 6,
    });
}

export function grilleMesh(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  grilleFrame(b, m, c);
  for (let i = 0; i < 9; i++)
    b.rod([x - 0.4 + i * 0.1, y - 0.19, z + 0.01], [x - 0.4 + i * 0.1, y + 0.19, z + 0.01], 0.008, c.steel, {
      bone: m.bone,
      sides: 4,
    });
  for (let i = 0; i < 4; i++)
    b.rod([x - 0.48, y - 0.15 + i * 0.1, z + 0.025], [x + 0.48, y - 0.15 + i * 0.1, z + 0.025], 0.008, c.steel, {
      bone: m.bone,
      sides: 4,
    });
}

export function grilleSlats(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  grilleFrame(b, m, c);
  for (let i = 0; i < 6; i++)
    b.part(box(0.96, 0.07, 0.015), c.trim, {
      bone: m.bone,
      at: [x, y - 0.17 + i * 0.068, z + 0.01],
      rotation: [35, 0, 0],
    });
}

export function grilleGuard(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  grilleFrame(b, m, c);
  for (let i = 0; i < 7; i++)
    b.part(box(0.05, 0.42, 0.06), c.steel, { bone: m.bone, at: [x - 0.42 + i * 0.14, y, z + 0.03] });
  b.part(cyl(0.11, 0.03, 6), c.trim, { bone: m.bone, at: [x, y, z + 0.07], rotation: [90, 0, 0], flat: true }); // hex emblem
}

export function grilleSplit(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  grilleFrame(b, m, c);
  b.part(box(0.1, 0.44, 0.08), c.trim, { bone: m.bone, at: [x, y, z + 0.01] }); // centre beam
  for (const s of [1, -1] as const)
    for (let i = 0; i < 3; i++)
      b.rod(
        [x + s * 0.07, y - 0.12 + i * 0.12, z + 0.02],
        [x + s * 0.48, y - 0.12 + i * 0.12, z + 0.02],
        0.014,
        c.steel,
        { bone: m.bone, sides: 6 },
      );
}

export function grilleIntake(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  grilleFrame(b, m, c, 0.9, 0.44);
  b.part(box(0.9, 0.44, 0.3), c.dark, { bone: m.bone, at: [x, y, z - 0.17] }); // scoop throat
  const fan = b.joint(`fan${m.tag}`, {
    parent: m.bone,
    at: [x, y, z - 0.1],
    dir: [0, 1, 0],
    up: [1, 0, 0],
    role: "hinge",
  });
  b.part(cyl(0.05, 0.1, 8), c.steel, { bone: fan, at: [x, y, z - 0.1], rotation: [90, 0, 0] });
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * 360;
    b.part(box(0.04, 0.15, 0.015), c.rim, {
      bone: fan,
      at: [x + 0.11 * Math.sin((a * Math.PI) / 180), y + 0.11 * Math.cos((a * Math.PI) / 180), z - 0.1],
      rotation: [0, 30, -a],
    }); // blades
  }
}

export const grilles = {
  bars: grilleBars,
  mesh: grilleMesh,
  slats: grilleSlats,
  guard: grilleGuard,
  split: grilleSplit,
  intake: grilleIntake,
};

// ---------------------------------------------------------------- extras: mirror, exhaust, rack

export function mirrorStalk(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  for (const dy of [0, -0.12])
    b.rod([x, y + dy, z], [x + s * 0.3, y + 0.05 + dy, z + 0.05], 0.015, c.steel, { bone: m.bone, sides: 6 });
  b.part(box(0.2, 0.26, 0.04), c.dark, { bone: m.bone, at: [x + s * 0.32, y, z + 0.05] });
  b.part(box(0.16, 0.22, 0.01), c.glass, { bone: m.bone, at: [x + s * 0.32, y, z + 0.025] });
}

export function mirrorCamera(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  b.part(box(0.14, 0.05, 0.08), c.dark, { bone: m.bone, at: [x + s * 0.06, y, z] });
  b.part(new THREE.SphereGeometry(0.06, 8, 6), c.trim, { bone: m.bone, at: [x + s * 0.16, y, z], flat: true });
  b.part(cyl(0.025, 0.05, 8), c.dark, { bone: m.bone, at: [x + s * 0.16, y, z - 0.06], rotation: [90, 0, 0] }); // rear-view lens
}

export const mirrors = { stalk: mirrorStalk, camera: mirrorCamera };

export function exhaustTail(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  for (const dx of [-0.06, 0.06]) {
    b.rod([x + dx, y, z + 0.6], [x + dx, y, z - 0.12], 0.035, c.steel, { bone: m.bone, sides: 8 });
    b.rod([x + dx, y, z - 0.12], [x + dx, y, z - 0.18], 0.045, c.dark, { bone: m.bone, sides: 8 }); // tip
  }
  b.part(box(0.2, 0.14, 0.4), c.steel, { bone: m.bone, at: [x, y, z + 0.5] }); // muffler
}

export function exhaustStack(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  const top = y + 2.1;
  const px = x + s * 0.3; // beside the bed wall
  b.rod([x, y, z], [x, y + 0.25, z + 0.3], 0.035, c.steel, { bone: m.bone, sides: 8 }); // up to the bed floor
  b.rod([x, y + 0.25, z + 0.3], [px, y + 0.25, z + 2.0], 0.035, c.steel, { bone: m.bone, sides: 8 }); // along it
  b.rod([px, y + 0.25, z + 2.0], [px, top, z + 2.0], 0.05, c.steel, { bone: m.bone, sides: 8 }); // stack
  b.part(cyl(0.065, 0.5, 8), c.rim, { bone: m.bone, at: [px, y + 0.9, z + 2.0] }); // heat shield
  b.part(box(0.14, 0.03, 0.16), c.dark, {
    bone: m.bone,
    at: [px, top + 0.04, z + 2.0],
    rotation: [-20, 0, 0],
  }); // rain cap
  b.part(cyl(0.01, 0.08, 4), c.dark, { bone: m.bone, at: [px, top + 0.03, z + 2.06] });
}

export function exhaustSide(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  const px = x + s * 0.3;
  b.rod([x, y, z + 1.0], [px, y, z + 0.9], 0.03, c.steel, { bone: m.bone, sides: 8 });
  b.part(cyl(0.09, 0.6, 10), c.steel, { bone: m.bone, at: [px, y, z + 0.6], rotation: [90, 0, 0], flat: true }); // muffler can
  b.rod([px, y, z + 0.3], [px, y, z - 0.2], 0.03, c.steel, { bone: m.bone, sides: 8 });
  b.part(cyl(0.045, 0.14, 8), c.dark, { bone: m.bone, at: [px, y, z - 0.2], rotation: [90, 0, 0] });
  b.part(box(0.04, 0.12, 0.7), c.rim, { bone: m.bone, at: [px + s * 0.1, y + 0.08, z + 0.6] }); // heat shield
  for (const dz of [0.35, 0.85])
    b.part(box(0.02, 0.1, 0.04), c.dark, { bone: m.bone, at: [px - s * 0.1, y + 0.1, z + dz] }); // hangers
}

export const exhausts = { tail: exhaustTail, stack: exhaustStack, side: exhaustSide };

export function rackRoof(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  for (const s of [1, -1] as const) {
    b.rod([x + s * 0.8, y + 0.12, z - 0.6], [x + s * 0.8, y + 0.12, z + 0.6], 0.025, c.steel, { bone: B, sides: 6 });
    for (const dz of [-0.5, 0.5])
      b.rod([x + s * 0.8, y, z + dz], [x + s * 0.8, y + 0.12, z + dz], 0.02, c.dark, { bone: B, sides: 6 }); // feet
  }
  for (const dz of [-0.5, 0, 0.5])
    b.rod([x - 0.8, y + 0.12, z + dz], [x + 0.8, y + 0.12, z + dz], 0.02, c.steel, { bone: B, sides: 6 });
  for (const dx of [-0.45, -0.15, 0.15, 0.45]) {
    b.part(cyl(0.07, 0.1, 8), c.dark, { bone: B, at: [x + dx, y + 0.2, z + 0.55], rotation: [90, 0, 0], flat: true }); // lamp pod
    glow(
      b.part(cyl(0.055, 0.02, 8), c.light, {
        bone: B,
        at: [x + dx, y + 0.2, z + 0.61],
        rotation: [90, 0, 0],
        flat: true,
      }),
    );
  }
}

export function rackHeadache(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  for (const s of [1, -1] as const)
    b.rod([x + s * 0.9, y - 0.75, z], [x + s * 0.9, y + 0.45, z], 0.03, c.steel, { bone: B, sides: 6 });
  b.rod([x - 0.9, y + 0.45, z], [x + 0.9, y + 0.45, z], 0.03, c.steel, { bone: B, sides: 6 });
  b.rod([x - 0.9, y - 0.2, z], [x + 0.9, y - 0.2, z], 0.025, c.steel, { bone: B, sides: 6 });
  for (let i = -0.75; i <= 0.75; i += 0.15)
    b.rod([x + i, y - 0.2, z], [x + i, y + 0.45, z], 0.008, c.steel, { bone: B, sides: 4 }); // mesh
  for (const dx of [-0.6, 0.6]) {
    b.part(box(0.14, 0.1, 0.1), c.dark, { bone: B, at: [x + dx, y + 0.52, z] });
    glow(b.part(box(0.1, 0.06, 0.02), c.light, { bone: B, at: [x + dx, y + 0.52, z - 0.06] }));
  }
}

export function rackLadder(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  for (const s of [1, -1] as const)
    for (const dz of [-0.9, 0.9])
      b.rod([x + s * 0.95, y + 0.6, z + dz], [x + s * 0.95, y + 1.5, z + dz], 0.03, c.steel, { bone: B, sides: 6 });
  for (const s of [1, -1] as const)
    b.rod([x + s * 0.95, y + 1.5, z - 1.0], [x + s * 0.95, y + 1.5, z + 1.0], 0.03, c.steel, { bone: B, sides: 6 });
  for (const dz of [-0.9, 0, 0.9])
    b.rod([x - 0.95, y + 1.52, z + dz], [x + 0.95, y + 1.52, z + dz], 0.025, c.steel, { bone: B, sides: 6 });
  for (const dz of [-0.9, 0.9])
    b.rod([x - 0.95, y + 1.0, z + dz], [x + 0.95, y + 1.0, z + dz], 0.02, c.steel, { bone: B, sides: 6 });
}

export const racks = { roof: rackRoof, headache: rackHeadache, ladder: rackLadder };

// ---------------------------------------------------------------- boards

/** A board builder with its root joint. */
function boardStart(name: string) {
  const b = createBuilder({ name });
  return { b, root: b.joint("board", { at: [0, 0, 0] }) };
}

export const meta = {
  name: "Truck gear catalog",
  description: "Wheels, suspension, bumpers, lights, grilles and extras on boards.",
};

export default function build() {
  const { b, root } = boardStart("truckWheels");
  slot(b, root, 0, wheels, "wheel", PLAIN, { y: 0.42, pitch: 1.7, front: 0.7, n: [1, 0, 0], turn: -90 });
  slot(b, root, -3.5, suspensions, "suspension", PLAIN, { y: 0.42, pitch: 2.3, front: 0.9, n: [0, -1, 0], turn: -60 });
  return b.root;
}

export function boardFront() {
  const { b, root } = boardStart("truckFront");
  slot(b, root, 0, headlights, "headlight", PLAIN, { y: 1.0, pitch: 2.0, front: 0.5 });
  slot(b, root, -3, grilles, "grille", PLAIN, { y: 1.0, pitch: 2.0, front: 0.6 });
  slot(b, root, -6.5, bumpers, "bumper", PLAIN, { y: 0.8, pitch: 2.6, front: 0.9 });
  return b.root;
}

export function boardExtras() {
  const { b, root } = boardStart("truckExtras");
  slot(b, root, 0, mirrors, "mirror", PLAIN, { y: 0.6, pitch: 2.0, front: 0.5, x0: -4 });
  slot(b, root, 0, exhausts, "exhaust", PLAIN, { y: 0.5, pitch: 2.6, front: 1.1, x0: 2.6 });
  slot(b, root, -5, racks, "rack", PLAIN, { y: 0.8, pitch: 3.2, front: 1.8 });
  return b.root;
}
