/**
 * catalogs/mountedWeapons.ts: turrets, barrels, missile pods, laser emitters, railguns and a handheld laser rifle
 * with a rack. Same contract as catalogs/truck.ts (Mount = { bone, at, s, n, root, tag }, Roles by part role; needs
 * `box`, `cyl` from truck.ts). Weapons build in model space: +Y up, the muzzle toward +Z from `m.at`.
 *
 * SLOTS
 *   turret (a top face: anchors.roof or a pedestal on anchors.bed; m.at = ring centre on the deck)
 *     turret*(b, m, c) → Mount: makes joints yaw{tag} (hinge about the deck normal) and pitch{tag} (hinge X) and
 *     returns the weapon mount: bone = pitch, at = trunnion, n = [0, 0, 1]. Barrels, pods, lasers and railguns
 *     all take that mount, so any weapon fits any turret.
 *     turretRing    bolted ring on the deck, low drum base, two cheek plates holding a trunnion rod
 *     turretPintle  post with a fork; the trunnion pin runs between the fork arms
 *     turretRemote  boxy remote station: yaw box with a sensor window, pitch cradle through it
 *     turretDome    hemisphere with a front slot; the pitch joint sits inside
 *     turretArm     a hinged arm (joint arm{tag}) raises the pitch cradle above the deck
 *     turretTwin    wide cradle with two trunnion plates and ammo boxes outboard
 *   barrel (on a turret's mount; breech behind the trunnion, tube forward)
 *     barrelCannon      long tube, fume extractor bulge, muzzle brake with side ports, breech block, recoil cylinder
 *     barrelMinigun     six tubes round a spin joint (spin{tag}), front clamp ring, rear housing, feed chute
 *     barrelAutocannon  boxy receiver, perforated shroud, thin tube, ammo box on the side
 *     barrelMortar      short fat tube with a breech sphere and a base ring
 *     barrelTwin        two tubes clamped by two plates, one breech box
 *     barrelFlamer      flared nozzle with a glowing pilot, fuel drum behind, feed hose
 *   pod (on a turret mount, or anywhere with n = forward)
 *     podBox    box with 2 × 2 recessed tubes and missile noses inside
 *     podTubes  seven round tubes in a hex pattern between two end plates
 *     podRail   a rail with two finned missiles hanging under it
 *     podRack   four rockets stacked between two side plates
 *   laser (on a turret mount)
 *     laserLens   housing with three focusing rings and a glowing lens disc
 *     laserCoil   glowing core rod inside eight rings, capacitor box behind
 *     laserPrism  glowing octahedron crystal in a four-rod cage
 *     laserArray  3 × 3 small emitters with glowing tips on a plate
 *   railgun (on a turret mount)
 *     railgunRails  two parallel rails with a glowing gap, sliding armature, three capacitor drums, breech
 *     railgunCoil   six coil rings shrinking toward the muzzle round a core tube, glowing ring faces, power cables
 *   rifle (handheld; m.at = the rifle's centre, muzzle toward +Z, about 0.9 m long)
 *     rifleCarbine  receiver, barrel, stock, grip, magazine, top rail, glowing muzzle lens
 *     rifleLong     long barrel with heat-sink fins, scope, bipod, stock
 *     rifleBullpup  magazine behind the grip, carry handle, short barrel, glowing side strip
 *   rack (a vertical face, default anchors.bedSideL; rack*(b, m, c) → Mount for a rifle lying along the face)
 *     rackClip    backplate with two C clips
 *     rackCradle  shelf with two half-ring cradles and a strap
 *
 * PICKS (truck.ts assemble, `weapons: { roof?: TurretPick, bed?: TurretPick, rifle?: { rifle, rack? } }`):
 *   TurretPick = { turret, barrel? | laser? | railgun?, pod? }: the first of barrel/laser/railgun goes on the mount,
 *   a pod rides outboard on the pitch joint. A bed turret stands on a pedestal above the bed walls.
 */
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Builder } from "../src/builder";
import type { Joint } from "../src/skeleton";
import { frame } from "../src/frame";
import { glow } from "../kits/glow";
import { box, cyl } from "./truck";
import type { Anchors, Mount, Roles, V3 } from "./truck";
import { PLAIN } from "./truck";
import { row, slot } from "./board";

const TAU = Math.PI * 2;
export type MountVariant = (b: Builder, m: Mount, c: Roles) => Mount;

// ---------------------------------------------------------------- turret

/** yaw{tag} on the deck normal and pitch{tag} across, at `h` above the deck; returns the weapon mount. */
function turretJoints(b: Builder, m: Mount, h: number): [Joint, Joint, Mount] {
  const f = frame(m.at, m.n);
  const yaw = b.joint(`yaw${m.tag}`, {
    parent: m.bone,
    at: f.local([0, 0.02, 0]),
    dir: f.dir([1, 0, 0]),
    up: f.dir([0, 0, 1]),
    role: "hinge",
  });
  const at: V3 = [m.at[0], m.at[1] + h, m.at[2]];
  const pitch = b.joint(`pitch${m.tag}`, { parent: yaw, at, dir: [0, 0, 1], role: "hinge" });
  return [yaw, pitch, { bone: pitch, at, s: 1, n: [0, 0, 1], root: m.root, tag: m.tag }];
}

export function turretRing(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const [yaw, pitch, w] = turretJoints(b, m, 0.38);
  b.part(new THREE.TorusGeometry(0.42, 0.035, 6, 16), c.steel, {
    bone: m.bone,
    at: [x, y + 0.03, z],
    rotation: [90, 0, 0],
  });
  for (let i = 0; i < 8; i++)
    b.part(cyl(0.02, 0.02, 6), c.dark, {
      bone: m.bone,
      at: [x + 0.42 * Math.cos((i / 8) * TAU), y + 0.07, z + 0.42 * Math.sin((i / 8) * TAU)],
    });
  b.part(cyl(0.36, 0.14, 12), c.weapon, { bone: yaw, at: [x, y + 0.12, z], flat: true }); // base drum
  for (const s of [1, -1]) b.part(box(0.05, 0.3, 0.36), c.weapon, { bone: yaw, at: [x + s * 0.2, y + 0.3, z] }); // cheek plates
  b.rod([x - 0.24, y + 0.38, z], [x + 0.24, y + 0.38, z], 0.035, c.steel, { bone: pitch, sides: 8 }); // trunnion rod
  return w;
}

export function turretPintle(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const [yaw, pitch, w] = turretJoints(b, m, 0.62);
  b.part(cyl(0.16, 0.04, 10), c.steel, { bone: m.bone, at: [x, y + 0.02, z], flat: true });
  b.part(cyl(0.05, 0.4, 8), c.steel, { bone: m.bone, at: [x, y + 0.22, z] }); // post
  b.part(cyl(0.07, 0.1, 8), c.weapon, { bone: yaw, at: [x, y + 0.45, z] });
  for (const s of [1, -1])
    b.rod([x, y + 0.48, z], [x + s * 0.14, y + 0.62, z], 0.025, c.weapon, { bone: yaw, sides: 6 }); // fork arms
  b.rod([x - 0.16, y + 0.62, z], [x + 0.16, y + 0.62, z], 0.02, c.steel, { bone: pitch, sides: 6 }); // pin
  return w;
}

export function turretRemote(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const [yaw, pitch, w] = turretJoints(b, m, 0.3);
  b.part(box(0.6, 0.06, 0.6), c.steel, { bone: m.bone, at: [x, y + 0.03, z] });
  b.part(box(0.5, 0.3, 0.5), c.weapon, { bone: yaw, at: [x, y + 0.21, z] }); // yaw box
  b.part(box(0.16, 0.2, 0.2), c.dark, { bone: yaw, at: [x + 0.32, y + 0.3, z + 0.1] }); // sensor box
  b.part(box(0.12, 0.1, 0.02), c.glass, { bone: yaw, at: [x + 0.32, y + 0.32, z + 0.21] });
  b.part(box(0.24, 0.16, 0.3), c.weapon, { bone: pitch, at: [x, y + 0.3, z + 0.1] }); // pitch cradle
  return w;
}

export function turretDome(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const [yaw, , w] = turretJoints(b, m, 0.25);
  b.part(cyl(0.48, 0.06, 14), c.steel, { bone: m.bone, at: [x, y + 0.03, z], flat: true });
  b.part(new THREE.SphereGeometry(0.45, 14, 7, 0, TAU, 0, Math.PI / 2), c.weapon, {
    bone: yaw,
    at: [x, y + 0.06, z],
    flat: true,
  });
  b.part(box(0.3, 0.16, 0.1), c.dark, { bone: yaw, at: [x, y + 0.25, z + 0.4] }); // front slot
  return w;
}

export function turretArm(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const f = frame(m.at, m.n);
  const yaw = b.joint(`yaw${m.tag}`, {
    parent: m.bone,
    at: f.local([0, 0.02, 0]),
    dir: f.dir([1, 0, 0]),
    up: f.dir([0, 0, 1]),
    role: "hinge",
  });
  const arm = b.joint(`arm${m.tag}`, { parent: yaw, at: [x, y + 0.15, z - 0.2], dir: [0, 0, 1], role: "hinge" });
  const at: V3 = [x, y + 0.65, z + 0.1];
  const pitch = b.joint(`pitch${m.tag}`, { parent: arm, at, dir: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.3, 0.1, 10), c.weapon, { bone: yaw, at: [x, y + 0.08, z], flat: true });
  b.part(box(0.2, 0.14, 0.16), c.steel, { bone: yaw, at: [x, y + 0.15, z - 0.2] });
  b.rod([x, y + 0.15, z - 0.2], [x, y + 0.65, z + 0.1], 0.05, c.weapon, { bone: arm, section: "box", caps: "flat" }); // arm
  b.rod([x + 0.08, y + 0.2, z - 0.1], [x + 0.08, y + 0.55, z + 0.1], 0.02, c.steel, { bone: arm, sides: 6 }); // hydraulic
  b.part(box(0.2, 0.12, 0.16), c.steel, { bone: pitch, at: [x, y + 0.65, z + 0.1] });
  return { bone: pitch, at, s: 1, n: [0, 0, 1], root: m.root, tag: m.tag } as Mount;
}

export function turretTwin(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const [yaw, pitch, w] = turretJoints(b, m, 0.34);
  b.part(cyl(0.4, 0.04, 12), c.steel, { bone: m.bone, at: [x, y + 0.02, z], flat: true });
  b.part(box(0.9, 0.14, 0.5), c.weapon, { bone: yaw, at: [x, y + 0.11, z] });
  for (const s of [1, -1]) {
    b.part(box(0.05, 0.3, 0.3), c.weapon, { bone: yaw, at: [x + s * 0.3, y + 0.3, z] }); // trunnion plates
    b.part(box(0.2, 0.22, 0.34), c.dark, { bone: yaw, at: [x + s * 0.5, y + 0.3, z - 0.05] }); // ammo boxes
  }
  b.rod([x - 0.33, y + 0.34, z], [x + 0.33, y + 0.34, z], 0.03, c.steel, { bone: pitch, sides: 8 });
  return w;
}

export const turrets = {
  ring: turretRing,
  pintle: turretPintle,
  remote: turretRemote,
  dome: turretDome,
  arm: turretArm,
  twin: turretTwin,
};

// ---------------------------------------------------------------- barrel (muzzle toward +Z)

export function barrelCannon(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.2, 0.2, 0.34), c.weapon, { bone: B, at: [x, y, z - 0.17] }); // breech
  b.rod([x, y, z], [x, y, z + 1.5], 0.06, c.weapon, { bone: B, sides: 10 });
  b.part(cyl(0.085, 0.28, 10), c.weapon, { bone: B, at: [x, y, z + 0.8], rotation: [90, 0, 0], flat: true }); // fume extractor
  b.part(box(0.16, 0.16, 0.16), c.dark, { bone: B, at: [x, y, z + 1.52] }); // muzzle brake
  for (const s of [1, -1])
    b.part(cyl(0.04, 0.18, 8), c.steel, { bone: B, at: [x + s * 0.08, y, z + 1.52], rotation: [0, 0, 90] }); // side ports
  b.rod([x, y - 0.1, z - 0.2], [x, y - 0.1, z + 0.35], 0.035, c.steel, { bone: B, sides: 8 }); // recoil cylinder
}

export function barrelMinigun(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.22, 0.24, 0.4), c.weapon, { bone: B, at: [x, y, z - 0.15] }); // rear housing
  const spin = b.joint(`spin${m.tag}`, {
    parent: B,
    at: [x, y, z + 0.05],
    dir: [0, 1, 0],
    up: [1, 0, 0],
    role: "hinge",
  });
  for (let i = 0; i < 6; i++)
    b.rod(
      [x + 0.06 * Math.cos((i / 6) * TAU), y + 0.06 * Math.sin((i / 6) * TAU), z + 0.05],
      [x + 0.06 * Math.cos((i / 6) * TAU), y + 0.06 * Math.sin((i / 6) * TAU), z + 0.8],
      0.018,
      c.steel,
      { bone: spin, sides: 6 },
    );
  b.part(cyl(0.095, 0.05, 10), c.dark, { bone: spin, at: [x, y, z + 0.7], rotation: [90, 0, 0] }); // front clamp
  b.part(cyl(0.09, 0.05, 10), c.dark, { bone: spin, at: [x, y, z + 0.1], rotation: [90, 0, 0] });
  b.rod([x + 0.11, y - 0.12, z - 0.15], [x + 0.3, y - 0.3, z - 0.3], 0.03, c.dark, { bone: B, section: "box" }); // feed chute
}

export function barrelAutocannon(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.2, 0.24, 0.6), c.weapon, { bone: B, at: [x, y, z - 0.1] }); // receiver
  b.part(cyl(0.065, 0.5, 8), c.weapon, { bone: B, at: [x, y, z + 0.45], rotation: [90, 0, 0], flat: true }); // shroud
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    for (const dz of [0.3, 0.45, 0.6])
      b.part(cyl(0.012, 0.02, 6), c.dark, {
        bone: B,
        at: [x + 0.065 * Math.cos(a), y + 0.065 * Math.sin(a), z + dz],
        rotation: [0, 0, (a * 180) / Math.PI + 90],
      }); // perforations
  }
  b.rod([x, y, z + 0.7], [x, y, z + 1.2], 0.035, c.weapon, { bone: B, sides: 8 });
  b.part(box(0.2, 0.2, 0.3), c.dark, { bone: B, at: [x + 0.2, y - 0.04, z - 0.15] }); // ammo box
}

export function barrelMortar(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(new THREE.SphereGeometry(0.14, 10, 6), c.weapon, { bone: B, at: [x, y, z - 0.1], flat: true }); // breech
  b.rod([x, y, z], [x, y, z + 0.7], 0.11, c.weapon, { bone: B, sides: 10 });
  b.part(cyl(0.13, 0.06, 10), c.dark, { bone: B, at: [x, y, z + 0.68], rotation: [90, 0, 0], flat: true }); // muzzle ring
  b.part(new THREE.TorusGeometry(0.13, 0.02, 6, 10), c.steel, { bone: B, at: [x, y, z + 0.2] });
}

export function barrelTwin(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.34, 0.18, 0.3), c.weapon, { bone: B, at: [x, y, z - 0.15] });
  for (const s of [1, -1])
    b.rod([x + s * 0.1, y, z], [x + s * 0.1, y, z + 1.1], 0.045, c.weapon, { bone: B, sides: 8 });
  for (const dz of [0.4, 0.9]) b.part(box(0.3, 0.12, 0.05), c.dark, { bone: B, at: [x, y, z + dz] }); // clamp plates
}

export function barrelFlamer(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(cyl(0.12, 0.4, 10), c.dark, { bone: B, at: [x, y, z - 0.25], rotation: [90, 0, 0], flat: true }); // fuel drum
  b.rod([x, y, z], [x, y, z + 0.5], 0.04, c.weapon, { bone: B, sides: 8 });
  b.part(new THREE.CylinderGeometry(0.08, 0.04, 0.12, 10), c.weapon, {
    bone: B,
    at: [x, y, z + 0.56],
    rotation: [90, 0, 0],
    flat: true,
  }); // flared nozzle
  glow(b.part(cyl(0.02, 0.03, 6), c.light, { bone: B, at: [x, y + 0.07, z + 0.5], rotation: [90, 0, 0] })); // pilot
  b.rod([x + 0.08, y - 0.08, z - 0.1], [x + 0.06, y - 0.05, z + 0.4], 0.015, c.steel, { bone: B, sides: 6 }); // hose
}

export const barrels = {
  cannon: barrelCannon,
  minigun: barrelMinigun,
  autocannon: barrelAutocannon,
  mortar: barrelMortar,
  twin: barrelTwin,
  flamer: barrelFlamer,
};

// ---------------------------------------------------------------- pods

export function podBox(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.5, 0.5, 0.6), c.weapon, { bone: B, at: [x, y, z + 0.2] });
  for (const dx of [-0.12, 0.12])
    for (const dy of [-0.12, 0.12]) {
      b.part(cyl(0.1, 0.06, 10), c.dark, { bone: B, at: [x + dx, y + dy, z + 0.5], rotation: [90, 0, 0] });
      b.spike([x + dx, y + dy, z + 0.46], [0, 0, 1], 0.12, 0.06, c.steel, { bone: B, sides: 8 }); // missile nose
    }
}

export function podTubes(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  for (const dz of [0, 0.7])
    b.part(cyl(0.22, 0.04, 6), c.weapon, { bone: B, at: [x, y, z + dz], rotation: [90, 0, 0], flat: true }); // end plates
  b.rod([x, y, z], [x, y, z + 0.72], 0.06, c.dark, { bone: B, sides: 8 });
  for (let i = 0; i < 6; i++)
    b.rod(
      [x + 0.13 * Math.cos((i / 6) * TAU), y + 0.13 * Math.sin((i / 6) * TAU), z],
      [x + 0.13 * Math.cos((i / 6) * TAU), y + 0.13 * Math.sin((i / 6) * TAU), z + 0.72],
      0.06,
      c.dark,
      { bone: B, sides: 8 },
    );
}

export function podRail(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.08, 0.08, 1.0), c.weapon, { bone: B, at: [x, y, z + 0.2] });
  for (const dx of [-0.12, 0.12]) {
    b.rod([x + dx, y - 0.1, z - 0.2], [x + dx, y - 0.1, z + 0.6], 0.05, c.steel, { bone: B, sides: 8 });
    b.spike([x + dx, y - 0.1, z + 0.6], [0, 0, 1], 0.2, 0.05, c.dark, { bone: B, sides: 8 });
    for (const a of [0, 90, 180, 270])
      b.part(box(0.1, 0.02, 0.14), c.dark, {
        bone: B,
        at: [x + dx + 0.07 * Math.cos((a * Math.PI) / 180), y - 0.1 + 0.07 * Math.sin((a * Math.PI) / 180), z - 0.1],
        rotation: [0, 0, a],
      }); // fins
    b.part(box(0.04, 0.1, 0.1), c.weapon, { bone: B, at: [x + dx, y - 0.04, z + 0.2] }); // hanger
  }
}

export function podRack(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  for (const s of [1, -1]) b.part(box(0.04, 0.5, 0.7), c.weapon, { bone: B, at: [x + s * 0.1, y, z + 0.15] });
  for (let i = 0; i < 4; i++) {
    const yy = y - 0.18 + i * 0.12;
    b.rod([x, yy, z - 0.1], [x, yy, z + 0.4], 0.04, c.steel, { bone: B, sides: 7 });
    b.spike([x, yy, z + 0.4], [0, 0, 1], 0.14, 0.04, c.dark, { bone: B, sides: 7 });
  }
}

export const pods = { box: podBox, tubes: podTubes, rail: podRail, rack: podRack };

// ---------------------------------------------------------------- lasers

export function laserLens(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(cyl(0.09, 0.7, 10), c.weapon, { bone: B, at: [x, y, z + 0.2], rotation: [90, 0, 0], flat: true });
  for (const [dz, r] of [
    [0.3, 0.12],
    [0.45, 0.11],
    [0.58, 0.1],
  ])
    b.part(new THREE.TorusGeometry(r, 0.02, 6, 12), c.steel, { bone: B, at: [x, y, z + dz] });
  glow(b.part(cyl(0.07, 0.03, 12), c.light, { bone: B, at: [x, y, z + 0.56], rotation: [90, 0, 0], flat: true }));
}

export function laserCoil(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.24, 0.2, 0.3), c.weapon, { bone: B, at: [x, y, z - 0.12] }); // capacitor box
  glow(b.rod([x, y, z], [x, y, z + 0.85], 0.03, c.light, { bone: B, sides: 8 }));
  for (let i = 0; i < 8; i++)
    b.part(new THREE.TorusGeometry(0.08, 0.018, 6, 10), c.steel, { bone: B, at: [x, y, z + 0.08 + i * 0.1] });
  for (const s of [1, -1])
    b.rod([x + s * 0.09, y, z + 0.03], [x + s * 0.09, y, z + 0.8], 0.012, c.dark, { bone: B, sides: 5 }); // rails
}

export function laserPrism(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(cyl(0.1, 0.3, 8), c.weapon, { bone: B, at: [x, y, z + 0.05], rotation: [90, 0, 0], flat: true });
  glow(
    b.part(new THREE.OctahedronGeometry(0.13), c.light, {
      bone: B,
      at: [x, y, z + 0.42],
      scale: [1, 1, 1.6],
      flat: true,
    }),
  );
  for (const a of [45, 135, 225, 315])
    b.rod(
      [x + 0.1 * Math.cos((a * Math.PI) / 180), y + 0.1 * Math.sin((a * Math.PI) / 180), z + 0.2],
      [x + 0.1 * Math.cos((a * Math.PI) / 180), y + 0.1 * Math.sin((a * Math.PI) / 180), z + 0.66],
      0.012,
      c.steel,
      { bone: B, sides: 5 },
    ); // cage
  b.part(new THREE.TorusGeometry(0.11, 0.015, 5, 8), c.steel, { bone: B, at: [x, y, z + 0.66] });
}

export function laserArray(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.34, 0.34, 0.2), c.weapon, { bone: B, at: [x, y, z + 0.1] });
  for (const dx of [-0.1, 0, 0.1])
    for (const dy of [-0.1, 0, 0.1]) {
      b.part(cyl(0.03, 0.14, 8), c.dark, { bone: B, at: [x + dx, y + dy, z + 0.26], rotation: [90, 0, 0] });
      glow(b.part(cyl(0.022, 0.02, 8), c.light, { bone: B, at: [x + dx, y + dy, z + 0.34], rotation: [90, 0, 0] }));
    }
}

export const lasers = { lens: laserLens, coil: laserCoil, prism: laserPrism, array: laserArray };

// ---------------------------------------------------------------- railguns

export function railgunRails(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.3, 0.26, 0.4), c.weapon, { bone: B, at: [x, y, z - 0.2] }); // breech
  for (const s of [1, -1]) b.part(box(0.04, 0.1, 1.5), c.steel, { bone: B, at: [x + s * 0.07, y, z + 0.75] }); // rails
  glow(b.part(box(0.1, 0.03, 1.4), c.light, { bone: B, at: [x, y, z + 0.75] }));
  b.part(box(0.1, 0.09, 0.12), c.dark, { bone: B, at: [x, y, z + 0.3] }); // armature
  for (const dz of [0.2, 0.6, 1.0])
    for (const s of [1, -1])
      b.part(cyl(0.07, 0.3, 8), c.dark, {
        bone: B,
        at: [x + s * 0.17, y - 0.02, z + dz],
        rotation: [90, 0, 0],
        flat: true,
      }); // capacitor drums
  for (const dz of [0.5, 1.45]) b.part(box(0.22, 0.16, 0.05), c.steel, { bone: B, at: [x, y, z + dz] }); // clamps
}

export function railgunCoil(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.28, 0.24, 0.36), c.weapon, { bone: B, at: [x, y, z - 0.18] });
  b.rod([x, y, z], [x, y, z + 1.4], 0.04, c.dark, { bone: B, sides: 8 });
  for (let i = 0; i < 6; i++) {
    const r = 0.16 - i * 0.018;
    b.part(cyl(r, 0.1, 10), c.weapon, { bone: B, at: [x, y, z + 0.15 + i * 0.22], rotation: [90, 0, 0], flat: true });
    glow(
      b.part(new THREE.TorusGeometry(r - 0.03, 0.012, 5, 10), c.light, { bone: B, at: [x, y, z + 0.21 + i * 0.22] }),
    );
  }
  for (const s of [1, -1])
    b.rod([x + s * 0.1, y + 0.1, z], [x + s * 0.12, y + 0.14, z + 1.2], 0.012, c.dark, { bone: B, sides: 5 }); // power cables
}

export const railguns = { rails: railgunRails, coil: railgunCoil };

// ---------------------------------------------------------------- handheld laser rifle (centre at m.at, muzzle +Z)

export function rifleCarbine(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.06, 0.08, 0.4), c.weapon, { bone: B, at: [x, y, z] }); // receiver
  b.part(box(0.07, 0.025, 0.3), c.dark, { bone: B, at: [x, y + 0.05, z + 0.02] }); // top rail
  b.rod([x, y + 0.01, z + 0.2], [x, y + 0.01, z + 0.48], 0.02, c.dark, { bone: B, sides: 8 });
  glow(b.part(cyl(0.025, 0.02, 8), c.light, { bone: B, at: [x, y + 0.01, z + 0.48], rotation: [90, 0, 0] }));
  b.part(box(0.05, 0.1, 0.22), c.dark, { bone: B, at: [x, y - 0.02, z - 0.3] }); // stock
  b.part(box(0.04, 0.12, 0.05), c.dark, { bone: B, at: [x, y - 0.1, z - 0.06], rotation: [-15, 0, 0] }); // grip
  b.part(box(0.04, 0.14, 0.06), c.steel, { bone: B, at: [x, y - 0.1, z + 0.08], rotation: [10, 0, 0] }); // magazine
  b.part(box(0.05, 0.04, 0.16), c.steel, { bone: B, at: [x, y - 0.05, z + 0.3] }); // foregrip rail
}

export function rifleLong(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.06, 0.08, 0.36), c.weapon, { bone: B, at: [x, y, z - 0.1] });
  b.rod([x, y + 0.01, z + 0.05], [x, y + 0.01, z + 0.6], 0.022, c.dark, { bone: B, sides: 8 });
  for (let i = 0; i < 4; i++)
    b.part(box(0.08, 0.06, 0.02), c.steel, { bone: B, at: [x, y + 0.01, z + 0.12 + i * 0.06] }); // heat-sink fins
  glow(b.part(cyl(0.028, 0.02, 8), c.light, { bone: B, at: [x, y + 0.01, z + 0.6], rotation: [90, 0, 0] }));
  b.part(cyl(0.025, 0.22, 8), c.dark, { bone: B, at: [x, y + 0.08, z - 0.05], rotation: [90, 0, 0] }); // scope
  for (const s of [1, -1])
    b.rod([x, y - 0.02, z + 0.35], [x + s * 0.08, y - 0.2, z + 0.38], 0.008, c.steel, { bone: B, sides: 5 }); // bipod
  b.part(box(0.05, 0.1, 0.24), c.dark, { bone: B, at: [x, y - 0.02, z - 0.4] });
  b.part(box(0.04, 0.12, 0.05), c.dark, { bone: B, at: [x, y - 0.1, z - 0.18], rotation: [-15, 0, 0] });
}

export function rifleBullpup(b: Builder, m: Mount, c: Roles) {
  const [x, y, z] = m.at;
  const B = m.bone;
  b.part(box(0.07, 0.1, 0.5), c.weapon, { bone: B, at: [x, y, z - 0.1] }); // long receiver reaching the shoulder
  b.part(box(0.04, 0.16, 0.05), c.steel, { bone: B, at: [x, y - 0.12, z - 0.2], rotation: [10, 0, 0] }); // magazine behind the grip
  b.part(box(0.04, 0.12, 0.05), c.dark, { bone: B, at: [x, y - 0.1, z + 0.02], rotation: [-15, 0, 0] }); // grip
  b.rod([x, y + 0.06, z - 0.3], [x, y + 0.06, z + 0.05], 0.015, c.dark, { bone: B, sides: 6 }); // carry handle
  for (const dz of [-0.3, 0.05]) b.part(box(0.03, 0.05, 0.03), c.dark, { bone: B, at: [x, y + 0.045, z + dz] });
  b.rod([x, y + 0.01, z + 0.15], [x, y + 0.01, z + 0.4], 0.022, c.dark, { bone: B, sides: 8 });
  glow(b.part(cyl(0.028, 0.02, 8), c.light, { bone: B, at: [x, y + 0.01, z + 0.4], rotation: [90, 0, 0] }));
  glow(b.part(box(0.01, 0.02, 0.3), c.light, { bone: B, at: [x + 0.04, y, z - 0.1] })); // side strip
}

export const rifles = { carbine: rifleCarbine, long: rifleLong, bullpup: rifleBullpup };

/** A rack on a vertical face; the rifle lies along the face 0.12 m out from it. */
export function rackClip(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.6, 0.02, 0.2), c.dark, { frame: f.moved([0, 0.01, 0]), bone: m.bone });
  for (const u of [-0.2, 0.2])
    b.part(new THREE.TorusGeometry(0.06, 0.012, 5, 10, Math.PI * 1.4), c.steel, {
      at: f.local([u, 0.12, 0]),
      quat: f.quat
        .clone()
        .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2 + 0.95)),
      bone: m.bone,
    });
  return {
    bone: m.bone,
    at: f.local([0, 0.12, 0]).toArray() as V3,
    s: m.s,
    n: [0, 0, 1],
    root: m.root,
    tag: m.tag,
  } as Mount;
}

export function rackCradle(b: Builder, m: Mount, c: Roles) {
  const f = frame(m.at, m.n);
  b.part(box(0.7, 0.16, 0.03), c.steel, { frame: f.moved([0, 0.08, -0.08]), bone: m.bone }); // shelf
  for (const u of [-0.22, 0.22])
    b.part(new THREE.TorusGeometry(0.06, 0.012, 5, 10, Math.PI), c.steel, {
      at: f.local([u, 0.12, -0.06]),
      quat: f.quat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)),
      bone: m.bone,
    });
  b.part(box(0.04, 0.14, 0.02), c.tyre, { frame: f.moved([0, 0.12, 0.02]), bone: m.bone }); // strap
  return {
    bone: m.bone,
    at: f.local([0, 0.12, 0]).toArray() as V3,
    s: m.s,
    n: [0, 0, 1],
    root: m.root,
    tag: m.tag,
  } as Mount;
}

export const racks = { clip: rackClip, cradle: rackCradle };

// ---------------------------------------------------------------- picks and dress

export type TurretPick = {
  turret: keyof typeof turrets;
  barrel?: keyof typeof barrels;
  laser?: keyof typeof lasers;
  railgun?: keyof typeof railguns;
  pod?: keyof typeof pods;
};
export type Picks = {
  roof?: TurretPick;
  bed?: TurretPick;
  rifle?: { rifle: keyof typeof rifles; rack?: keyof typeof racks };
};

function mountTurret(b: Builder, m: Mount, c: Roles, p: TurretPick) {
  const w = turrets[p.turret](b, m, c);
  if (p.barrel) barrels[p.barrel](b, w, c);
  else if (p.laser) lasers[p.laser](b, w, c);
  else if (p.railgun) railguns[p.railgun](b, w, c);
  else if (p.pod) pods[p.pod](b, w, c);
  if (p.pod && (p.barrel || p.laser || p.railgun)) pods[p.pod](b, { ...w, at: [w.at[0] + 0.4, w.at[1], w.at[2]] }, c);
}

export function dress(b: Builder, a: Anchors, c: Roles, p: Picks) {
  if (p.roof) mountTurret(b, { ...a.roof, tag: "Roof" }, c, p.roof);
  if (p.bed) {
    const [x, y, z] = a.bed.at;
    b.part(cyl(0.3, 0.5, 10), c.steel, { bone: a.bed.bone, at: [x, y + 0.25, z], flat: true }); // pedestal
    mountTurret(b, { ...a.bed, at: [x, y + 0.5, z], tag: "Bed" }, c, p.bed);
  }
  if (p.rifle) rifles[p.rifle.rifle](b, racks[p.rifle.rack ?? "clip"](b, a.bedSideL, c), c);
}

// ---------------------------------------------------------------- board

export const meta = {
  name: "Mounted weapons catalog",
  description: "Turrets, barrels, pods, lasers, railguns and rifles on a board.",
};

export default function build() {
  const b = createBuilder({ name: "weaponsBoard" });
  const root = b.joint("board", { at: [0, 0, 0] });
  const c = PLAIN;
  row(b, root, 0, Object.keys(turrets), {
    y: 0,
    pitch: 2.2,
    front: 1.2,
    n: [0, 1, 0],
    prefix: "turret",
    labelWidth: 2.0,
  }).forEach((m, i) => barrelTwin(b, Object.values(turrets)[i](b, m, c), c));
  slot(b, root, -4, barrels, "barrel", c, { y: 0.5, pitch: 2.2, front: 1.0, n: [0, 0, 1] });
  return b.root;
}

export function boardEnergy() {
  const b = createBuilder({ name: "weaponsEnergy" });
  const root = b.joint("board", { at: [0, 0, 0] });
  slot(b, root, 0, pods, "pod", PLAIN, { y: 0.5, pitch: 1.8, front: 1.0, n: [0, 0, 1] });
  slot(b, root, -3.4, lasers, "laser", PLAIN, { y: 0.4, pitch: 1.8, front: 1.0, n: [0, 0, 1] });
  slot(b, root, -6.8, railguns, "railgun", PLAIN, { y: 0.4, pitch: 2.4, front: 1.0, n: [0, 0, 1] });
  return b.root;
}

export function boardRifles() {
  const b = createBuilder({ name: "weaponsRifles" });
  const root = b.joint("board", { at: [0, 0, 0] });
  const c = PLAIN;
  slot(b, root, 0, rifles, "rifle", c, { y: 0.35, pitch: 1.6, front: 0.8, n: [0, 0, 1] });
  row(b, root, -3.2, Object.keys(racks), { y: 0.5, pitch: 1.6, front: 0.8, n: [1, 0, 0], prefix: "rack" }).forEach(
    (m, i) => {
      b.part(box(0.04, 0.8, 0.9), c.body, { bone: m.bone, at: [m.at[0] - 0.02, m.at[1], m.at[2]] }); // a wall to hang it on
      rifleCarbine(b, Object.values(racks)[i](b, m, c), c);
    },
  );
  return b.root;
}
