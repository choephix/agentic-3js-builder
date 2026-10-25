/**
 * catalogs/armour.ts: tracked and armoured-vehicle parts. Same contract as catalogs/truck.ts: every variant is
 * `variant(b: Builder, m: Mount, c: Roles)`, Mount = { bone, at, s, n, root, tag }, Roles = colours by part role.
 * Parts that sit on a face build in the mount's frame `f = frame(m.at, m.n)`: `f.local([u, v, w])` is u across the
 * face, v out along n, w along the face the other way (up on a flank or a front; back on a top face), and parts
 * placed with `{ frame: f.moved([u, v, w]) }` take that orientation. Needs `box`, `cyl` from truck.ts.
 *
 * SLOTS
 *   track (one side at a time: m.at = [±0.78, 0.42, zCentre] on the hub line, n = ±X, bone = chassis; the unit
 *          reaches 1.7 m each way and stands on the floor; road wheels get spin joints road{L|R}{i}{tag})
 *     trackBelt      continuous box-section belt swept round a stadium loop, pads along it, 5 road wheels, sprocket
 *                    with teeth, idler, two return rollers
 *     trackSlat      two thin chains with angled grouser slats between them, 4 road wheels, toothed sprocket
 *     trackHalf      short rear unit (1 m each way) with a raised front idler, 3 road wheels, fender over the top
 *     trackTriangle  one triangular unit per wheel position (z ±1.55): high drive wheel, two bottom rollers, belt
 *   roadWheel (hub mount like a wheel, r 0.25, bone spins)
 *     roadWheelSolid   dished steel disc with a rubber rim and 6 bolts
 *     roadWheelSpoked  6 box spokes to a rim ring
 *     roadWheelTwin    two thin discs on one hub with a gap for the guide horns
 *   skirt (anchors.flankL / R; rocker between the wheels, n = ±X; hangs from y+0.15 to y-0.25 over z ±1.0)
 *     skirtPlate     four plates in a row with gaps, two bolts each, top rail
 *     skirtSlatted   bar armour: a frame with vertical rods
 *     skirtChain     a rail with hanging rods ending in balls (chain curtain)
 *     skirtAngled    three plates tilted 20° outward on stand-off tubes
 *   plate (any face; default anchors.bedSideL / R; field 0.8 × 0.5 round m.at, out along n)
 *     plateBoltOn    flat plate on four stand-offs, four corner bolts
 *     plateSpaced    inner plate and a smaller outer plate on tubes with a gap between
 *     plateWedge     two plates meeting at a ridge that points out of the face
 *     plateMesh      cage armour: a frame with a rod grid
 *     plateLamellar  five overlapping tilted strips with rivets
 *   era (reactive blocks; default anchors.hood; field 0.8 × 0.5)
 *     eraBricks     4 × 3 bricks with gaps
 *     eraHex        seven hex prisms in two staggered rows
 *     eraStaggered  two rows offset by half a brick, a bolt in each brick
 *     eraWedge      bricks that taper outward (frustumBox)
 *   hatch (default anchors.roofRear, n up; lid hinge joint hatch{tag} at the back edge)
 *     hatchRound    round lid with a rim ring, hinge arm and a grab handle
 *     hatchSquare   square lid with two hinge knuckles, a T handle and corner bolts
 *     hatchSplit    two half lids hinged at opposite edges (two joints)
 *     hatchCupola   raised ring of six vision slits under a round lid
 *     hatchSliding  flat lid on two rails with rollers (no joint)
 *   vision (vertical face; default anchors.cabFront)
 *     visionSlit       recessed slot with three bars and a brow
 *     visionBlock      three glass blocks in a frame, tilted back
 *     visionPeriscope  box rising from the face with a glass front and a cap
 *     visionDome       camera half-sphere in a lens ring
 *   smoke (default anchors.fenderL / R, n up; tubes fire forward and out)
 *     smokeBank     four tubes in a row in a bracket
 *     smokeCluster  2 × 3 tubes in a block
 *     smokeDrum     a drum with eight holes on a post
 *     smokeSingle   one fat launcher with a cap and a lever
 *
 * PICKS (truck.ts assemble, `armour: { track?, skirt?, plate?, era?, hatch?, vision?, smoke? }`): variant names
 *   without the slot prefix; `dress(b, anchors, c, picks)` mounts each on its default anchor; a track pick replaces
 *   the wheels (half keeps the front pair).
 */
import * as THREE from "three";
import type { Builder } from "../src/builder";
import type { Joint } from "../src/skeleton";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import { catmull } from "../src/path";
import { createBuilder } from "../src/builder";
import { box, cyl } from "./truck";
import type { Anchors, Mount, Roles, V3, Variant } from "./truck";
import { PLAIN } from "./truck";
import { slot } from "./board";

const R90: V3 = [0, 0, 90];
const TAU = Math.PI * 2;

// ---------------------------------------------------------------- track

/** A stadium loop in the YZ plane at x: straight runs at yTop and yBottom between z0 and z1 with semicircular ends. */
function stadium(x: number, yTop: number, yBottom: number, z0: number, z1: number) {
  const r = (yTop - yBottom) / 2;
  const yc = (yTop + yBottom) / 2;
  const pts: V3[] = [];
  for (let i = 0; i <= 6; i++) {
    const a = -Math.PI / 2 + (i / 6) * Math.PI;
    pts.push([x, yc + r * Math.sin(a), z1 + r * Math.cos(a)]);
  }
  for (let i = 0; i <= 6; i++) {
    const a = Math.PI / 2 + (i / 6) * Math.PI;
    pts.push([x, yc + r * Math.sin(a), z0 + r * Math.cos(a)]);
  }
  return catmull(pts, { closed: true });
}

function sprocket(b: Builder, bone: Joint, c: Roles, at: V3, r: number, teeth: number) {
  b.part(cyl(r, 0.12, teeth), c.steel, { bone, at, rotation: R90, flat: true });
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * TAU;
    b.part(box(0.1, 0.05, 0.04), c.steel, {
      bone,
      at: [at[0], at[1] + (r + 0.02) * Math.cos(a), at[2] + (r + 0.02) * Math.sin(a)],
      rotation: [(a * 180) / Math.PI, 0, 0],
    });
  }
}

export function roadWheelSolid(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  b.part(cyl(0.25, 0.1, 12), c.tyre, { bone: m.bone, at: [x, y, z], rotation: R90, flat: true }); // rubber rim
  b.part(cyl(0.19, 0.14, 12), c.steel, { bone: m.bone, at: [x, y, z], rotation: R90, flat: true }); // dish
  b.part(cyl(0.07, 0.18, 8), c.dark, { bone: m.bone, at: [x, y, z], rotation: R90, flat: true });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    b.part(cyl(0.015, 0.02, 6), c.dark, {
      bone: m.bone,
      at: [x + m.s * 0.08, y + 0.12 * Math.cos(a), z + 0.12 * Math.sin(a)],
      rotation: R90,
    });
  }
}

export function roadWheelSpoked(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  b.part(new THREE.TorusGeometry(0.21, 0.04, 6, 12), c.tyre, {
    bone: m.bone,
    at: [x, y, z],
    rotation: [0, 90, 0],
    flat: true,
  });
  b.part(cyl(0.06, 0.16, 8), c.steel, { bone: m.bone, at: [x, y, z], rotation: R90, flat: true });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    b.part(box(0.05, 0.16, 0.04), c.steel, {
      bone: m.bone,
      at: [x, y + 0.12 * Math.cos(a), z + 0.12 * Math.sin(a)],
      rotation: [(a * 180) / Math.PI, 0, 0],
    });
  }
}

export function roadWheelTwin(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  for (const dx of [-0.08, 0.08]) {
    b.part(cyl(0.25, 0.05, 12), c.tyre, { bone: m.bone, at: [x + dx, y, z], rotation: R90, flat: true });
    b.part(cyl(0.2, 0.06, 12), c.steel, { bone: m.bone, at: [x + dx, y, z], rotation: R90, flat: true });
  }
  b.part(cyl(0.06, 0.24, 8), c.dark, { bone: m.bone, at: [x, y, z], rotation: R90, flat: true });
}

export const roadWheels = { solid: roadWheelSolid, spoked: roadWheelSpoked, twin: roadWheelTwin };

/** Road wheels with spin joints at the given z offsets, at height yHub. */
function roadWheels5(b: Builder, m: Mount, c: Roles, zs: number[], yHub: number, wheel: Variant = roadWheelSolid) {
  const side = m.s > 0 ? "L" : "R";
  zs.forEach((dz, i) => {
    const at: V3 = [m.at[0], yHub, m.at[2] + dz];
    const j = b.joint(`road${side}${i}${m.tag}`, { parent: m.bone, at, dir: [0, 1, 0], role: "hinge" });
    wheel(b, { ...m, bone: j, at }, c);
  });
}

export function trackBelt(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  const loop = stadium(x, y + 0.26, y - 0.31, z - 1.4, z + 1.4);
  b.sweep(loop, () => [0.17, 0.05], { bone: B, section: "box", color: c.tyre });
  b.along(loop, 40, (at) => b.part(box(0.36, 0.08, 0.04), c.dark, { frame: at.moved([0, 0, -0.06]), bone: B })); // pads
  roadWheels5(b, m, c, [-1.0, -0.5, 0, 0.5, 1.0], y - 0.12);
  sprocket(b, B, c, [x, y - 0.05, z - 1.4], 0.24, 10);
  b.part(cyl(0.24, 0.14, 12), c.steel, { bone: B, at: [x, y - 0.05, z + 1.4], rotation: R90, flat: true }); // idler
  for (const dz of [-0.6, 0.6])
    b.part(cyl(0.08, 0.12, 8), c.dark, { bone: B, at: [x, y + 0.14, z + dz], rotation: R90, flat: true }); // return rollers
  b.part(box(0.1, 0.16, 2.6), c.dark, { bone: B, at: [x - m.s * 0.15, y + 0.02, z] }); // suspension beam
}

export function trackSlat(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  const loop = stadium(x, y + 0.26, y - 0.31, z - 1.3, z + 1.3);
  for (const dx of [-0.15, 0.15])
    b.sweep(stadium(x + dx, y + 0.26, y - 0.31, z - 1.3, z + 1.3), () => [0.025, 0.035], {
      bone: B,
      section: "box",
      color: c.steel,
    }); // two chains
  const tilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.7);
  b.along(loop, 36, (at) =>
    b.part(box(0.36, 0.1, 0.015), c.dark, {
      at: at.moved([0, 0, -0.04]),
      quat: at.quat.clone().multiply(tilt),
      bone: B,
    }),
  ); // grouser slats
  roadWheels5(b, m, c, [-0.9, -0.3, 0.3, 0.9], y - 0.12, roadWheelSpoked);
  sprocket(b, B, c, [x, y - 0.05, z - 1.3], 0.24, 8);
  b.part(cyl(0.24, 0.1, 10), c.steel, { bone: B, at: [x, y - 0.05, z + 1.3], rotation: R90, flat: true });
  b.part(box(0.1, 0.14, 2.4), c.dark, { bone: B, at: [x - m.s * 0.15, y + 0.02, z] });
}

export function trackHalf(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  const pts: V3[] = [];
  for (let i = 0; i <= 6; i++)
    pts.push([
      x,
      y - 0.01 + 0.3 * Math.sin(-Math.PI / 2 + (i / 6) * Math.PI),
      z + 0.95 + 0.3 * Math.cos(-Math.PI / 2 + (i / 6) * Math.PI),
    ]); // raised front idler
  for (let i = 0; i <= 6; i++)
    pts.push([
      x,
      y - 0.15 + 0.16 * Math.sin(Math.PI / 2 + (i / 6) * Math.PI),
      z - 1.0 + 0.16 * Math.cos(Math.PI / 2 + (i / 6) * Math.PI),
    ]); // low rear
  const loop = catmull(pts, { closed: true });
  b.sweep(loop, () => [0.17, 0.05], { bone: B, section: "box", color: c.tyre });
  b.along(loop, 26, (at) => b.part(box(0.36, 0.09, 0.04), c.dark, { frame: at.moved([0, 0, -0.06]), bone: B }));
  roadWheels5(b, m, c, [-0.6, -0.1, 0.4], y - 0.14, roadWheelTwin);
  sprocket(b, B, c, [x, y - 0.01, z + 0.95], 0.24, 9);
  b.part(cyl(0.12, 0.12, 8), c.steel, { bone: B, at: [x, y - 0.2, z - 1.0], rotation: R90, flat: true });
  b.part(box(0.44, 0.04, 1.6), c.trim, { bone: B, at: [x, y + 0.36, z + 0.1] }); // fender
  b.part(box(0.1, 0.12, 1.8), c.dark, { bone: B, at: [x - m.s * 0.15, y, z] });
}

export function trackTriangle(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  for (const dz of [-1.55, 1.55]) {
    const zc = z + dz;
    const loop = catmull(
      [
        [x, y + 0.3, zc],
        [x, y + 0.1, zc + 0.5],
        [x, y - 0.275, zc + 0.5],
        [x, y - 0.275, zc - 0.5],
        [x, y + 0.1, zc - 0.5],
      ],
      { closed: true },
    );
    b.sweep(loop, () => [0.16, 0.05], { bone: B, section: "box", color: c.tyre });
    b.along(loop, 22, (at) => b.part(box(0.34, 0.07, 0.04), c.dark, { frame: at.moved([0, 0, -0.06]), bone: B }));
    const side = m.s > 0 ? "L" : "R";
    const drive = b.joint(`drive${side}${dz > 0 ? "F" : "R"}${m.tag}`, {
      parent: B,
      at: [x, y + 0.15, zc],
      dir: [0, 1, 0],
      role: "hinge",
    });
    sprocket(b, drive, c, [x, y + 0.15, zc], 0.14, 8);
    for (const d of [-0.35, 0.35])
      b.part(cyl(0.12, 0.14, 10), c.steel, { bone: B, at: [x, y - 0.25, zc + d], rotation: R90, flat: true }); // bottom rollers
    b.part(box(0.08, 0.5, 0.1), c.dark, { bone: B, at: [x, y - 0.1, zc], rotation: [0, 0, 0] }); // frame
    b.rod([x, y - 0.25, zc - 0.35], [x, y - 0.25, zc + 0.35], 0.03, c.dark, { bone: B, sides: 6 });
  }
}

export const tracks = { belt: trackBelt, slat: trackSlat, half: trackHalf, triangle: trackTriangle };

// ---------------------------------------------------------------- skirt (flank)

export function skirtPlate(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  const B = m.bone;
  b.part(box(0.06, 0.06, 2.1), c.dark, { bone: B, at: [x + s * 0.06, y + 0.15, z] }); // top rail
  for (let i = 0; i < 4; i++) {
    const zc = z - 0.78 + i * 0.52;
    b.part(box(0.04, 0.4, 0.48), c.trim, { bone: B, at: [x + s * 0.09, y - 0.07, zc] });
    for (const dz of [-0.16, 0.16])
      b.part(cyl(0.02, 0.02, 6), c.steel, { bone: B, at: [x + s * 0.12, y + 0.08, zc + dz], rotation: R90 });
  }
}

export function skirtSlatted(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  const B = m.bone;
  for (const dy of [0.15, -0.25]) b.part(box(0.05, 0.05, 2.1), c.dark, { bone: B, at: [x + s * 0.1, y + dy, z] });
  for (let i = 0; i < 15; i++)
    b.rod([x + s * 0.1, y + 0.15, z - 1.0 + i * 0.143], [x + s * 0.1, y - 0.25, z - 1.0 + i * 0.143], 0.012, c.steel, {
      bone: B,
      sides: 5,
    });
  for (const dz of [-1.0, 0, 1.0])
    b.part(box(0.1, 0.04, 0.04), c.dark, { bone: B, at: [x + s * 0.05, y + 0.15, z + dz] }); // stand-offs
}

export function skirtChain(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  const B = m.bone;
  b.part(box(0.08, 0.05, 2.1), c.dark, { bone: B, at: [x + s * 0.06, y + 0.15, z] });
  for (let i = 0; i < 17; i++) {
    const zc = z - 1.0 + i * 0.125;
    b.rod([x + s * 0.09, y + 0.12, zc], [x + s * 0.09, y - 0.2, zc], 0.008, c.steel, { bone: B, sides: 4 });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), c.steel, { bone: B, at: [x + s * 0.09, y - 0.22, zc], flat: true });
  }
}

export function skirtAngled(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const s = m.s;
  const B = m.bone;
  for (let i = 0; i < 3; i++) {
    const zc = z - 0.7 + i * 0.7;
    b.part(box(0.04, 0.42, 0.66), c.trim, { bone: B, at: [x + s * 0.14, y - 0.05, zc], rotation: [0, 0, s * 20] });
    for (const dz of [-0.25, 0.25])
      b.rod([x, y + 0.1, zc + dz], [x + s * 0.1, y + 0.12, zc + dz], 0.015, c.steel, { bone: B, sides: 6 }); // stand-off tubes
  }
}

export const skirts = { plate: skirtPlate, slatted: skirtSlatted, chain: skirtChain, angled: skirtAngled };

// ---------------------------------------------------------------- plate (any face, built in the mount frame)

export function plateBoltOn(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.8, 0.05, 0.5), c.trim, { frame: f.moved([0, 0.08, 0]), bone: m.bone });
  for (const u of [-0.34, 0.34])
    for (const w of [-0.19, 0.19]) {
      b.part(cyl(0.025, 0.06, 6), c.steel, { frame: f.moved([u, 0.03, w]), bone: m.bone }); // stand-off
      b.part(cyl(0.02, 0.02, 6), c.steel, { frame: f.moved([u, 0.11, w]), bone: m.bone }); // bolt
    }
}

export function plateSpaced(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.8, 0.04, 0.5), c.trim, { frame: f.moved([0, 0.03, 0]), bone: m.bone });
  b.part(box(0.7, 0.04, 0.42), c.trim, { frame: f.moved([0, 0.15, 0]), bone: m.bone });
  for (const u of [-0.28, 0.28])
    for (const w of [-0.15, 0.15]) b.part(cyl(0.02, 0.1, 6), c.dark, { frame: f.moved([u, 0.09, w]), bone: m.bone });
}

export function plateWedge(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  const tilt = (deg: number) =>
    f.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), (deg * Math.PI) / 180));
  for (const s of [1, -1])
    b.part(box(0.42, 0.04, 0.5), c.trim, { at: f.local([s * 0.2, 0.1, 0]), quat: tilt(s * -22), bone: m.bone });
  b.part(box(0.04, 0.12, 0.5), c.steel, { frame: f.moved([0, 0.15, 0]), bone: m.bone }); // ridge
  for (const w of [-0.18, 0.18]) b.part(box(0.76, 0.04, 0.04), c.dark, { frame: f.moved([0, 0.03, w]), bone: m.bone }); // mounting rails
}

export function plateMesh(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  for (const u of [-0.4, 0.4]) b.part(box(0.04, 0.04, 0.5), c.steel, { frame: f.moved([u, 0.1, 0]), bone: m.bone });
  for (const w of [-0.25, 0.25]) b.part(box(0.84, 0.04, 0.04), c.steel, { frame: f.moved([0, 0.1, w]), bone: m.bone });
  for (let i = 1; i < 8; i++)
    b.rod(f.local([-0.4 + i * 0.1, 0.1, -0.25]), f.local([-0.4 + i * 0.1, 0.1, 0.25]), 0.008, c.steel, {
      bone: m.bone,
      sides: 4,
    });
  for (let i = 1; i < 5; i++)
    b.rod(f.local([-0.4, 0.1, -0.25 + i * 0.1]), f.local([0.4, 0.1, -0.25 + i * 0.1]), 0.008, c.steel, {
      bone: m.bone,
      sides: 4,
    });
  for (const u of [-0.3, 0.3]) b.part(cyl(0.02, 0.1, 6), c.dark, { frame: f.moved([u, 0.05, 0]), bone: m.bone });
}

export function plateLamellar(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  const tilt = f.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.26));
  for (let i = 0; i < 5; i++) {
    b.part(box(0.8, 0.03, 0.16), c.trim, {
      at: f.local([0, 0.06 + i * 0.015, 0.22 - i * 0.11]),
      quat: tilt,
      bone: m.bone,
    });
    for (const u of [-0.3, 0, 0.3])
      b.part(cyl(0.012, 0.015, 6), c.steel, { frame: f.moved([u, 0.085 + i * 0.015, 0.2 - i * 0.11]), bone: m.bone });
  }
}

export const plates = {
  boltOn: plateBoltOn,
  spaced: plateSpaced,
  wedge: plateWedge,
  mesh: plateMesh,
  lamellar: plateLamellar,
};

// ---------------------------------------------------------------- era (reactive blocks)

export function eraBricks(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 3; j++)
      b.part(box(0.18, 0.1, 0.14), c.trim, { frame: f.moved([-0.3 + i * 0.2, 0.05, -0.16 + j * 0.16]), bone: m.bone });
}

export function eraHex(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  for (const [u, w] of [
    [-0.3, -0.09],
    [-0.1, -0.09],
    [0.1, -0.09],
    [0.3, -0.09],
    [-0.2, 0.09],
    [0, 0.09],
    [0.2, 0.09],
  ]) {
    b.part(cyl(0.1, 0.08, 6), c.trim, { frame: f.moved([u, 0.04, w]), bone: m.bone, flat: true });
    b.part(cyl(0.02, 0.02, 6), c.steel, { frame: f.moved([u, 0.09, w]), bone: m.bone });
  }
}

export function eraStaggered(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  for (let j = 0; j < 2; j++)
    for (let i = 0; i < 4; i++) {
      const u = -0.3 + i * 0.2 + (j ? 0.1 : 0);
      b.part(box(0.18, 0.12, 0.2), c.trim, { frame: f.moved([u, 0.06, -0.11 + j * 0.22]), bone: m.bone });
      b.part(cyl(0.025, 0.02, 6), c.steel, { frame: f.moved([u, 0.13, -0.11 + j * 0.22]), bone: m.bone });
    }
}

export function eraWedge(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 2; j++)
      b.frustumBox(
        f.local([-0.3 + i * 0.2, 0.0, -0.12 + j * 0.24]),
        f.local([-0.3 + i * 0.2, 0.14, -0.12 + j * 0.24]),
        [0.18, 0.22],
        [0.12, 0.14],
        { bone: m.bone, color: c.trim },
      );
}

export const eras = { bricks: eraBricks, hex: eraHex, staggered: eraStaggered, wedge: eraWedge };

// ---------------------------------------------------------------- hatch (top face; hinge at the back edge)

/** A lid hinge joint whose axis runs across the mount frame (its local X), at w along the face. */
function lidJoint(b: Builder, m: Mount, w: number, name: string) {
  const f = frame(m.at, m.n);
  return b.joint(name, {
    parent: m.bone,
    at: f.local([0, 0.02, w]),
    dir: f.dir([0, 0, 1]),
    up: f.dir([0, 1, 0]),
    role: "hinge",
  });
}

export function hatchRound(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  const lid = lidJoint(b, m, 0.32, `hatch${m.tag}`);
  b.part(new THREE.TorusGeometry(0.3, 0.03, 6, 14), c.trim, {
    at: f.local([0, 0.03, 0]),
    dir: m.n,
    axis: "z",
    bone: m.bone,
  });
  b.part(cyl(0.3, 0.04, 14), c.trim, { frame: f.moved([0, 0.07, 0]), bone: lid, flat: true });
  b.part(box(0.08, 0.04, 0.14), c.steel, { frame: f.moved([0, 0.1, 0.27]), bone: lid }); // hinge arm
  b.part(box(0.04, 0.06, 0.12), c.steel, { frame: f.moved([0, 0.04, 0.34]), bone: m.bone }); // hinge post
  b.rod(f.local([-0.1, 0.12, -0.1]), f.local([0.1, 0.12, -0.1]), 0.012, c.steel, { bone: lid, sides: 5 }); // grab handle
}

export function hatchSquare(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  const lid = lidJoint(b, m, 0.31, `hatch${m.tag}`);
  b.part(box(0.6, 0.04, 0.6), c.trim, { frame: f.moved([0, 0.05, 0]), bone: lid });
  for (const u of [-0.2, 0.2])
    b.part(cyl(0.03, 0.1, 6), c.steel, {
      frame: f.moved([u, 0.04, 0.31]),
      bone: m.bone,
      quat: f.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2)),
    }); // knuckles
  for (const u of [-0.25, 0.25])
    for (const w of [-0.25, 0.25]) b.part(cyl(0.02, 0.02, 6), c.steel, { frame: f.moved([u, 0.08, w]), bone: lid });
  b.rod(f.local([0, 0.1, -0.05]), f.local([0, 0.16, -0.05]), 0.012, c.steel, { bone: lid, sides: 5 });
  b.rod(f.local([-0.08, 0.16, -0.05]), f.local([0.08, 0.16, -0.05]), 0.012, c.steel, { bone: lid, sides: 5 }); // T handle
}

export function hatchSplit(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.64, 0.03, 0.64), c.dark, { frame: f.moved([0, 0.015, 0]), bone: m.bone }); // coaming
  for (const s of [1, -1]) {
    const lid = lidJoint(b, m, s * 0.31, `hatch${s > 0 ? "A" : "B"}${m.tag}`);
    b.part(box(0.6, 0.04, 0.28), c.trim, { frame: f.moved([0, 0.05, s * 0.155]), bone: lid });
    b.part(box(0.1, 0.03, 0.04), c.steel, { frame: f.moved([0, 0.085, s * 0.08]), bone: lid });
  }
}

export function hatchCupola(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(cyl(0.32, 0.22, 12), c.trim, { frame: f.moved([0, 0.11, 0]), bone: m.bone, flat: true });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    b.part(box(0.14, 0.05, 0.03), c.glass, {
      frame: f.moved([0.31 * Math.sin(a), 0.15, 0.31 * Math.cos(a)]),
      bone: m.bone,
      quat: f.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), a)),
    }); // vision slits
  }
  const lid = lidJoint(b, m, 0.28, `hatch${m.tag}`);
  b.part(cyl(0.3, 0.04, 12), c.trim, { frame: f.moved([0, 0.24, 0]), bone: lid, flat: true });
  b.part(box(0.06, 0.04, 0.1), c.steel, { frame: f.moved([0, 0.27, 0.26]), bone: lid });
}

export function hatchSliding(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  for (const u of [-0.32, 0.32])
    b.part(box(0.04, 0.05, 1.0), c.steel, { frame: f.moved([u, 0.025, 0.1]), bone: m.bone }); // rails
  b.part(box(0.6, 0.04, 0.5), c.trim, { frame: f.moved([0, 0.07, -0.1]), bone: m.bone });
  for (const u of [-0.3, 0.3])
    for (const w of [-0.3, 0.1])
      b.part(cyl(0.03, 0.03, 8), c.dark, {
        frame: f.moved([u, 0.05, w]),
        bone: m.bone,
        quat: f.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2)),
      }); // rollers
  b.part(box(0.2, 0.03, 0.04), c.steel, { frame: f.moved([0, 0.1, -0.3]), bone: m.bone });
}

export const hatches = {
  round: hatchRound,
  square: hatchSquare,
  split: hatchSplit,
  cupola: hatchCupola,
  sliding: hatchSliding,
};

// ---------------------------------------------------------------- vision (vertical face)

export function visionSlit(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.56, 0.06, 0.14), c.dark, { frame: f.moved([0, 0.02, 0]), bone: m.bone });
  b.part(box(0.5, 0.02, 0.06), c.glass, { frame: f.moved([0, 0.06, 0]), bone: m.bone });
  for (const u of [-0.17, 0, 0.17])
    b.part(box(0.02, 0.04, 0.1), c.steel, { frame: f.moved([u, 0.07, 0]), bone: m.bone });
  b.part(box(0.6, 0.12, 0.03), c.trim, { frame: f.moved([0, 0.08, 0.09]), bone: m.bone }); // brow
}

export function visionBlock(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  const tilt = f.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.35));
  b.part(box(0.6, 0.06, 0.2), c.dark, { frame: f.moved([0, 0.03, 0]), bone: m.bone });
  for (const u of [-0.19, 0, 0.19]) {
    b.part(box(0.16, 0.08, 0.14), c.glass, { at: f.local([u, 0.09, 0]), quat: tilt, bone: m.bone });
    b.part(box(0.18, 0.02, 0.16), c.steel, { at: f.local([u, 0.14, 0]), quat: tilt, bone: m.bone });
  }
}

export function visionPeriscope(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.2, 0.14, 0.3), c.trim, { frame: f.moved([0, 0.07, 0.1]), bone: m.bone });
  b.part(box(0.16, 0.02, 0.1), c.glass, { frame: f.moved([0, 0.15, 0.08]), bone: m.bone });
  b.part(box(0.24, 0.04, 0.06), c.dark, { frame: f.moved([0, 0.14, 0.17]), bone: m.bone }); // cap
  b.part(box(0.22, 0.04, 0.32), c.dark, { frame: f.moved([0, 0.02, 0.1]), bone: m.bone });
}

export function visionDome(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(new THREE.TorusGeometry(0.12, 0.025, 6, 12), c.steel, {
    frame: f.moved([0, 0.02, 0]),
    bone: m.bone,
    quat: f.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2)),
  });
  b.part(new THREE.SphereGeometry(0.11, 10, 6, 0, TAU, 0, Math.PI / 2), c.glass, {
    frame: f.moved([0, 0.02, 0]),
    bone: m.bone,
    flat: true,
  });
  b.part(cyl(0.04, 0.03, 8), c.dark, { frame: f.moved([0, 0.12, 0]), bone: m.bone });
}

export const visions = { slit: visionSlit, block: visionBlock, periscope: visionPeriscope, dome: visionDome };

// ---------------------------------------------------------------- smoke launchers (top face; fire forward = -w)

function tube(b: Builder, m: Mount, c: Roles, f: Frame, u: number, w: number, r = 0.03) {
  b.rod(f.local([u, 0.04, w]), f.local([u, 0.24, w - 0.16]), r, c.weapon, { bone: m.bone, sides: 7 });
  b.part(cyl(r * 1.2, 0.03, 7), c.dark, {
    at: f.local([u, 0.25, w - 0.17]),
    dir: f.dir([0, 0.78, -0.62]),
    bone: m.bone,
  });
}

export function smokeBank(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.36, 0.06, 0.12), c.dark, { frame: f.moved([0, 0.03, 0.02]), bone: m.bone });
  for (let i = 0; i < 4; i++) tube(b, m, c, f, -0.12 + i * 0.08, 0);
}

export function smokeCluster(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.3, 0.08, 0.2), c.dark, { frame: f.moved([0, 0.04, 0.04]), bone: m.bone });
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) tube(b, m, c, f, -0.09 + i * 0.09, j * 0.08, 0.028);
}

export function smokeDrum(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(cyl(0.04, 0.14, 6), c.steel, { frame: f.moved([0, 0.07, 0]), bone: m.bone });
  b.part(cyl(0.16, 0.1, 12), c.weapon, { frame: f.moved([0, 0.19, 0]), bone: m.bone, flat: true });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    b.part(cyl(0.022, 0.03, 6), c.dark, {
      frame: f.moved([0.11 * Math.sin(a), 0.245, 0.11 * Math.cos(a)]),
      bone: m.bone,
    });
  }
}

export function smokeSingle(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.14, 0.06, 0.14), c.dark, { frame: f.moved([0, 0.03, 0.03]), bone: m.bone });
  tube(b, m, c, f, 0, 0, 0.05);
  b.rod(f.local([0.06, 0.1, 0.02]), f.local([0.14, 0.18, 0.06]), 0.01, c.steel, { bone: m.bone, sides: 5 }); // lever
}

export const smokes = { bank: smokeBank, cluster: smokeCluster, drum: smokeDrum, single: smokeSingle };

// ---------------------------------------------------------------- picks and dress

export type Picks = {
  track?: keyof typeof tracks;
  skirt?: keyof typeof skirts;
  plate?: keyof typeof plates;
  era?: keyof typeof eras;
  hatch?: keyof typeof hatches;
  vision?: keyof typeof visions;
  smoke?: keyof typeof smokes;
};

/** Mounts each picked armour part on its default truck anchor (tracks are placed by truck.ts, with the wheels). */
export function dress(b: Builder, a: Anchors, c: Roles, p: Picks) {
  if (p.skirt) for (const side of ["L", "R"] as const) skirts[p.skirt](b, a[`flank${side}`], c);
  if (p.plate) for (const side of ["L", "R"] as const) plates[p.plate](b, a[`bedSide${side}`], c);
  if (p.era) eras[p.era](b, a.hood, c);
  if (p.hatch) hatches[p.hatch](b, a.roofRear, c);
  if (p.vision) visions[p.vision](b, a.cabFront, c);
  if (p.smoke) for (const side of ["L", "R"] as const) smokes[p.smoke](b, a[`fender${side}`], c);
}

// ---------------------------------------------------------------- board

export const meta = {
  name: "Armour catalog",
  description: "Tracked and armoured-vehicle parts, every variant on a board.",
};

export default function build() {
  const b = createBuilder({ name: "armourBoard" });
  const root = b.joint("board", { at: [0, 0, 0] });
  slot(b, root, 0, roadWheels, "roadWheel", PLAIN, { y: 0.25, pitch: 1.7, front: 0.5, n: [1, 0, 0], turn: -90 });
  slot(b, root, -4.5, tracks, "track", PLAIN, { y: 0.42, pitch: 2.1, front: 2.3, n: [1, 0, 0] });
  slot(b, root, -9, skirts, "skirt", PLAIN, { y: 0.6, pitch: 2.6, front: 0.5, n: [1, 0, 0], turn: -90 });
  return b.root;
}

export function boardPlates() {
  const b = createBuilder({ name: "armourPlates" });
  const root = b.joint("board", { at: [0, 0, 0] });
  slot(b, root, 0, plates, "plate", PLAIN, { y: 0.5, pitch: 1.6, front: 0.5, n: [0, 0, 1] });
  slot(b, root, -3.2, eras, "era", PLAIN, { y: 0.5, pitch: 1.6, front: 0.5, n: [0, 0, 1] });
  slot(b, root, -6.4, hatches, "hatch", PLAIN, { y: 0.05, pitch: 1.6, front: 0.7, n: [0, 1, 0] });
  return b.root;
}

export function boardSmall() {
  const b = createBuilder({ name: "armourSmall" });
  const root = b.joint("board", { at: [0, 0, 0] });
  slot(b, root, 0, visions, "vision", PLAIN, { y: 0.4, pitch: 1.6, front: 0.5, n: [0, 0, 1] });
  slot(b, root, -3.2, smokes, "smoke", PLAIN, { y: 0.05, pitch: 1.6, front: 0.5, n: [0, 1, 0] });
  return b.root;
}
