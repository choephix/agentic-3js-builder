import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { patches, spots } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Chunky Cartoon Tank",
  description:
    "A stubby, chunky cartoon main battle tank at real size (about 6.9 m long, 3.1 m wide, 3.1 m tall): a mint camo hull with a smiling grille face and eye-lamps, a marigold polka-dot turret with a pink flower, coral fenders and wheels on charcoal tracks, a cream-banded gun, a pennant on the antenna, and a potted sunflower and star-marked crate on the rear deck. Wheels, sprockets, turret, gun and hatch are hinge joints.",
  style: "low-poly whimsical mix",
  commit: "b816db2",
};

type V = [number, number, number];

const HULL_A = "#8ad6ab";
const HULL_B = "#62bf8f";
const TURRET = "#ffc43d";
const DOT = "#ff7a2e";
const CORAL = "#ff6f59";
const CREAM = "#fff4dc";
const CHAR = "#3b4358";
const TREAD = "#56617a";
const DARK = "#252b3b";
const GLASS = "#7fe0ff";
const LAMP = "#fff7a8";
const CRATE = "#d49a5c";
const CRATE_D = "#8e5d34";
const POT = "#e88b5a";
const SUN = "#ffd23f";
const SEED = "#6b4226";
const LEAF = "#4caf6b";
const PINK = "#ff8fb1";

export default function build() {
  const b = createBuilder({ name: "chunkyCartoonTank" });

  // Drawings and paints
  const smileTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 80">` +
      `<circle cx="22" cy="46" r="12" fill="${PINK}"/>` +
      `<circle cx="138" cy="46" r="12" fill="${PINK}"/>` +
      `<path d="M40 20 Q80 70 120 20" fill="none" stroke="${DARK}" stroke-width="10" stroke-linecap="round"/>` +
      `</svg>`,
    { size: 512 },
  );
  const flowerTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
      [0, 1, 2, 3, 4, 5]
        .map((k) => `<ellipse cx="50" cy="26" rx="14" ry="22" fill="${PINK}" transform="rotate(${k * 60} 50 50)"/>`)
        .join("") +
      `<circle cx="50" cy="50" r="13" fill="${SUN}" stroke="${DARK}" stroke-width="3"/>` +
      `</svg>`,
    { size: 256 },
  );
  const starTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
      `<polygon points="50,4 61.2,34.6 93.8,35.8 68.1,55.9 77,87.2 50,69 23,87.2 31.9,55.9 6.3,35.8 38.8,34.6" ` +
      `fill="${CREAM}" stroke="${DARK}" stroke-width="4" stroke-linejoin="round"/>` +
      `</svg>`,
    { size: 256 },
  );
  const camo = patches(HULL_A, HULL_B, { size: 0.9, seed: 4 });
  const polka = spots(TURRET, DOT, { size: 0.4, amount: 0.3, seed: 2 });

  // Geometry helpers (model space, merged per colour and bone)
  const merged = (geos: THREE.BufferGeometry[]) => {
    const g = mergeGeometries(geos);
    if (!g) throw new Error("merge failed: mismatched geometry attributes");
    return g;
  };
  const sphere = (r: number, p: V) => new THREE.SphereGeometry(r, 5, 4).translate(p[0], p[1], p[2]);
  const box = (w: number, h: number, d: number, p: V, rx = 0, ry = 0) => {
    const g = new THREE.BoxGeometry(w, h, d);
    if (rx) g.rotateX(rx);
    if (ry) g.rotateY(ry);
    return g.translate(p[0], p[1], p[2]);
  };

  // Skeleton: hull is the root, turret and gun are hinges above it
  const hull = b.joint("hull", { at: [0, 0.7, 0], role: "spine" });
  type J = typeof hull;
  const rod = (a: V, c: V, r: number | [number, number], color: string, bone: J) =>
    b.rod(a, c, r, { color, bone });
  const part = (geo: THREE.BufferGeometry, color: string, bone: J) =>
    b.part(geo, color, { bone, at: [0, 0, 0], flat: true });

  // Hull: side profile extruded across the width, rounded rims
  const hullOutline: OutlinePoint[] = [
    [-2.85, 0.42],
    [2.85, 0.42],
    [2.95, 0.6],
    [2.95, 0.95, "sharp"],
    [2.3, 1.42, "sharp"],
    [-2.55, 1.42, "sharp"],
    [-2.95, 1.1, "sharp"],
    [-2.95, 0.6],
  ];
  const hullPart = b.extrude(hullOutline, {
    at: [0, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 1.9,
    bevel: 0.14,
    smoothing: 1,
    color: camo,
    bone: hull,
  });

  // Tracks: stadium side profile, 14 flat facets, one band per side
  const trackPts: [number, number][] = [];
  for (let i = 0; i <= 6; i++) {
    const a = ((-90 + 30 * i) * Math.PI) / 180;
    trackPts.push([2.55 + 0.42 * Math.cos(a), 0.42 + 0.42 * Math.sin(a)]);
  }
  for (let i = 0; i <= 6; i++) {
    const a = ((90 + 30 * i) * Math.PI) / 180;
    trackPts.push([-2.55 + 0.42 * Math.cos(a), 0.42 + 0.42 * Math.sin(a)]);
  }
  const trackOutline: OutlinePoint[] = trackPts.map(([z, y]): OutlinePoint => [z, y]);
  for (const s of [1, -1]) {
    b.extrude(trackOutline, {
      at: [s * 1.22, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.5,
      bevel: 0.08,
      color: CHAR,
      bone: hull,
    });
  }

  // Tread cleats on the outer track faces, spaced along every edge of the loop
  const cleats: THREE.BufferGeometry[] = [];
  trackPts.forEach((p, i) => {
    const q = trackPts[(i + 1) % trackPts.length];
    const dz = q[0] - p[0];
    const dy = q[1] - p[1];
    const len = Math.hypot(dz, dy);
    const n = Math.max(1, Math.round(len / 0.26));
    const rx = Math.atan2(-dy / len, dz / len);
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n;
      for (const s of [1, -1]) cleats.push(box(0.06, 0.09, 0.2, [s * 1.5, p[1] + dy * t, p[0] + dz * t], rx));
    }
  });
  part(merged(cleats), TREAD, hull);

  // Fenders over the tracks, with a rivet row on each
  const fenderOutline: OutlinePoint[] = [
    [-2.78, 0.84],
    [2.78, 0.84],
    [2.78, 0.98],
    [-2.78, 0.98],
  ];
  const fenderRivets: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    b.extrude(fenderOutline, {
      at: [s * 1.22, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.68,
      bevel: 0.05,
      smoothing: 2,
      color: CORAL,
      bone: hull,
    });
    for (let z = -2.5; z <= 2.51; z += 0.5) fenderRivets.push(sphere(0.03, [s * 1.22, 1.0, z]));
  }
  part(merged(fenderRivets), CREAM, hull);

  // Cream side trim above the fenders, with rivets along it
  const trims: THREE.BufferGeometry[] = [];
  const trimRivets: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    trims.push(box(0.06, 0.07, 5.5, [s * 0.975, 1.05, 0]));
    for (let z = -2.6; z <= 2.61; z += 0.4) trimRivets.push(sphere(0.022, [s * 0.99, 1.09, z]));
  }
  part(merged(trims), CREAM, hull);
  part(merged(trimRivets), CREAM, hull);
  const sideVents: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    for (const y of [1.13, 1.19, 1.25]) sideVents.push(box(0.03, 0.035, 0.4, [s * 0.972, y, -2.2]));
  }
  part(merged(sideVents), DARK, hull);
  part(box(1.7, 0.012, 0.03, [0, 1.425, 2.15]), DARK, hull);

  // Smiling face: two eye-lamps on the glacis, a smile decal on the front plate
  for (const s of [1, -1]) {
    const p: V = [s * 0.46, 1.1615, 2.7575];
    const n: V = [0, 0.828, 0.561];
    const along = (k: number): V => [p[0] + n[0] * k, p[1] + n[1] * k, p[2] + n[2] * k];
    rod(along(-0.02), along(0.04), 0.15, CHAR, hull);
    rod(along(0.04), along(0.085), 0.115, LAMP, hull);
  }
  part(box(1.7, 0.12, 0.16, [0, 0.5, 2.98]), DARK, hull);
  b.decal(hullPart, smileTex, { at: [0, 0.68, 2.95], dir: [0, 0, 1], size: [1.1, 0.55] });

  // Star decals on both hull flanks
  for (const s of [1, -1]) b.decal(hullPart, starTex, { at: [s * 0.96, 1.23, -1.0], dir: [s, 0, 0], size: [0.3, 0.3] });

  // Driver's dome hatch on the front deck
  b.lathe(
    [
      [0, 0],
      [0.26, 0],
      [0.26, 0.04],
      [0.2, 0.13],
      [0.1, 0.18],
      [0, 0.19],
    ],
    { at: [0, 1.42, 1.85], segments: 8, color: CREAM, bone: hull },
  );
  part(box(0.26, 0.05, 0.05, [0, 1.5, 2.03]), GLASS, hull);

  // Rear: grille slats, tail lamps, exhaust pipes
  const slats: THREE.BufferGeometry[] = [];
  for (const y of [0.72, 0.8, 0.88, 0.96]) slats.push(box(1.2, 0.035, 0.06, [0, y, -2.97]));
  part(merged(slats), DARK, hull);
  for (const s of [1, -1]) {
    rod([s * 0.62, 1.02, -2.94], [s * 0.62, 1.02, -3.0], 0.07, CORAL, hull);
    rod([s * 0.5, 1.42, -2.5], [s * 0.5, 1.82, -2.8], [0.1, 0.09], CHAR, hull);
  }

  // Rear deck: crate with two bands and a star, potted sunflower
  const crateP = part(box(0.75, 0.5, 0.6, [0, 1.67, -2.05]), CRATE, hull);
  part(merged([box(0.79, 0.06, 0.64, [0, 1.52, -2.05]), box(0.79, 0.06, 0.64, [0, 1.84, -2.05])]), CRATE_D, hull);
  b.decal(crateP, starTex, { at: [0, 1.67, -1.75], dir: [0, 0, 1], size: [0.26, 0.26] });

  b.lathe(
    [
      [0, 0],
      [0.15, 0],
      [0.22, 0.2],
      [0.25, 0.3],
      [0.27, 0.34],
      [0.23, 0.36],
      [0, 0.36],
    ],
    { at: [0.62, 1.42, -2.2], segments: 8, color: POT, bone: hull },
  );
  rod([0.62, 1.72, -2.2], [0.62, 1.76, -2.2], 0.23, SEED, hull);
  rod([0.62, 1.74, -2.2], [0.62, 2.14, -2.2], [0.03, 0.025], LEAF, hull);
  const head: V = [0.62, 2.14, -2.2];
  rod([head[0], head[1], head[2] - 0.03], [head[0], head[1], head[2] + 0.01], 0.1, SEED, hull);
  const petals: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    petals.push(
      new THREE.SphereGeometry(0.07, 5, 4)
        .scale(1.8, 0.55, 0.3)
        .rotateZ(a)
        .translate(head[0] + 0.19 * Math.cos(a), head[1] + 0.19 * Math.sin(a), head[2]),
    );
  }
  part(merged(petals), SUN, hull);
  const leaves = [
    new THREE.SphereGeometry(0.1, 5, 4).scale(1.7, 0.45, 0.22).rotateZ(0.4).translate(0.74, 1.9, -2.2),
    new THREE.SphereGeometry(0.1, 5, 4)
      .scale(1.7, 0.45, 0.22)
      .rotateZ(Math.PI - 0.4)
      .translate(0.5, 1.9, -2.2),
  ];
  part(merged(leaves), LEAF, hull);

  // Wheels, sprockets and idlers: hinge joints at the track centres
  const wheel = (name: string, c: V, s: number, teeth: boolean) => {
    const j = b.joint(name, { parent: hull, at: c, role: "hinge" });
    const y = c[1];
    const z = c[2];
    rod([s * 1.44, y, z], [s * 1.6, y, z], 0.3, CORAL, j);
    rod([s * 1.6, y, z], [s * 1.66, y, z], 0.1, CREAM, j);
    const bolts: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      bolts.push(sphere(0.026, [s * 1.66, y + 0.2 * Math.cos(a), z + 0.2 * Math.sin(a)]));
    }
    part(merged(bolts), CREAM, j);
    if (teeth) {
      const t: THREE.BufferGeometry[] = [];
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        t.push(box(0.2, 0.14, 0.1, [s * 1.52, y + 0.36 * Math.cos(a), z + 0.36 * Math.sin(a)], a));
      }
      part(merged(t), CORAL, j);
    }
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    [-1.75, -0.875, 0, 0.875, 1.75].forEach((z, i) => wheel(`wheel${side}${i + 1}`, [s * 1.52, 0.42, z], s, false));
    wheel(`sprocket${side}`, [s * 1.52, 0.42, 2.55], s, true);
    wheel(`idler${side}`, [s * 1.52, 0.42, -2.55], s, false);
  }

  // Turret: marigold polka-dot lathe on a hinge over the hull
  const turret = b.joint("turret", { parent: hull, at: [0, 1.42, 0], role: "hinge" });
  const turretPart = b.lathe(
    [
      [0, 0],
      [1.06, 0],
      [1.06, 0.1],
      [1.14, 0.2],
      [1.14, 0.62],
      [1.02, 0.82],
      [0.72, 0.95],
      [0, 0.98],
    ],
    { at: [0, 1.42, 0], segments: 10, color: polka, bone: turret },
  );
  b.lathe(
    [
      [0, 0],
      [1.1, 0],
      [1.17, 0.12],
      [1.17, 0.2],
      [0, 0.2],
    ],
    { at: [0, 1.42, 0], segments: 10, color: CHAR, bone: turret },
  );
  for (const s of [1, -1]) b.decal(turretPart, flowerTex, { at: [s * 1.14, 1.9, 0], dir: [s, 0, 0], size: [0.6, 0.6] });

  const turretRivets: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    turretRivets.push(sphere(0.03, [1.15 * Math.sin(a), 1.66, 1.15 * Math.cos(a)]));
  }
  part(merged(turretRivets), CREAM, turret);
  part(
    merged([box(0.34, 0.03, 0.03, [0.1, 2.415, -0.6]), box(0.34, 0.03, 0.03, [0.1, 2.415, -0.52]), box(0.34, 0.03, 0.03, [0.1, 2.415, -0.44])]),
    DARK,
    turret,
  );

  // Stowage bin on the turret rear with two straps
  part(box(1.2, 0.28, 0.42, [0, 1.92, -1.32]), CRATE, turret);
  part(merged([box(0.07, 0.3, 0.46, [-0.32, 1.92, -1.32]), box(0.07, 0.3, 0.46, [0.32, 1.92, -1.32])]), CRATE_D, turret);

  // Smoke-grenade launchers: three coral tubes on each front shoulder
  for (const s of [1, -1]) {
    const az = (s * 55 * Math.PI) / 180;
    const dx = Math.sin(az);
    const dz = Math.cos(az);
    for (const y of [1.74, 1.88, 2.02]) {
      rod([1.06 * dx, y, 1.06 * dz], [1.36 * dx, y + 0.02, 1.36 * dz], 0.065, CORAL, turret);
    }
  }

  // Periscope blocks on the front shoulders
  for (const s of [1, -1]) {
    part(box(0.22, 0.16, 0.22, [s * 0.56, 2.25, 0.8]), CREAM, turret);
    part(box(0.16, 0.05, 0.16, [s * 0.56, 2.34, 0.8]), GLASS, turret);
  }

  // Commander's cupola with glass windows and a hinged hatch
  const cupola: V = [-0.3, 2.4, 0.25];
  b.lathe(
    [
      [0, 0],
      [0.36, 0],
      [0.36, 0.08],
      [0.3, 0.18],
      [0.22, 0.3],
      [0, 0.34],
    ],
    { at: cupola, segments: 8, color: CORAL, bone: turret },
  );
  const cupolaWindows: THREE.BufferGeometry[] = [];
  for (const a of [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3]) {
    cupolaWindows.push(box(0.1, 0.07, 0.04, [cupola[0] + 0.335 * Math.sin(a), 2.5, cupola[2] + 0.335 * Math.cos(a)], 0, a));
  }
  part(merged(cupolaWindows), GLASS, turret);
  const hatch = b.joint("hatch", { parent: turret, at: [-0.3, 2.74, -0.05], role: "hinge" });
  rod([cupola[0], 2.74, cupola[2]], [cupola[0], 2.8, cupola[2]], 0.3, CREAM, hatch);
  rod([cupola[0], 2.8, cupola[2]], [cupola[0], 2.86, cupola[2]], 0.05, DARK, hatch);

  // Antenna with a swallowtail pennant
  rod([0.45, 2.4, -0.35], [0.45, 2.94, -0.35], 0.018, DARK, turret);
  part(sphere(0.045, [0.45, 2.96, -0.35]), CORAL, turret);
  b.extrude(
    [
      [0, 0],
      [0.6, 0.07],
      [0.44, 0.15],
      [0.6, 0.23],
      [0, 0.23],
    ],
    { at: [0.45, 2.72, -0.35], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.012, color: PINK, bone: turret },
  );

  // Gun: a hinge at the mantlet, with a cream mantlet, banded barrel and coral muzzle brake
  const gun = b.joint("gun", { parent: turret, at: [0, 2.02, 1.12], dir: [0, 0.05, 1], role: "hinge" });
  const bar = (t: number): V => [0, 2.02 + 0.05 * t, 1.12 + t];
  part(new THREE.SphereGeometry(0.42, 8, 6).scale(1.1, 0.95, 0.6).translate(0, 2.02, 1.12), CREAM, gun);
  rod(bar(0.2), bar(2.5), [0.12, 0.09], TREAD, gun);
  rod(bar(0.9), bar(0.98), 0.125, CREAM, gun);
  rod(bar(1.8), bar(1.86), 0.105, CORAL, gun);
  rod(bar(2.3), bar(2.72), 0.13, CORAL, gun);
  part(box(0.12, 0.1, 0.14, [0.16, 2.36, 1.2]), DARK, gun);
  part(box(0.08, 0.04, 0.06, [0.16, 2.42, 1.22]), GLASS, gun);
  return b.root;
}
