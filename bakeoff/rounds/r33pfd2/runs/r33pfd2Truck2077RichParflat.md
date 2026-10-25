<!-- call: plan -->

```json
{
  "name": "Nyx-77 Warhauler",
  "description": "A low-poly cyberpunk armored military truck from 2077: wedge cab with neon strips, six big wheels, a missile-and-gun turret and a cargo bed of modular containers.",
  "builderName": "warhauler2077",
  "size": [3.0, 3.3, 9.0],
  "layout": "Long 6x6 armored truck facing +Z. Front: angular wedge cab (sloped windshield, bull-bar, headlight slits) over a hood block. Middle: a flat chassis deck with three axles (front steering axle at z=2.8, two rear axles at z=-1.6 and z=-3.0). Rear: cargo bed with stacked armored containers, and a roof-mounted turret on a ring at the cab/cargo junction. Wheels are chunky octagonal tyres with hub discs and glowing rims. Hard chamfered shapes, dark gunmetal hull with hazard-yellow trim and cyan/magenta neon strips along skirts, windows, and vents. Everything is faceted blocky primitives with many small greebles: rivets, vents, antennas, panel lines, decals.",
  "palette": {
    "hull": "#2f3540",
    "hullDark": "#1b1f27",
    "hullLight": "#4a5362",
    "trim": "#e7b814",
    "trimDark": "#8a6a0a",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2fb8",
    "neonRed": "#ff3030",
    "glass": "#0d2a3a",
    "glassGlow": "#3fd0e8",
    "tyre": "#111214",
    "rim": "#7b8494",
    "steel": "#8d96a5",
    "barrel": "#20242b",
    "olive": "#4b5a3a",
    "rust": "#7a4a2a",
    "white": "#e8ecf2",
    "orange": "#ff7a1a"
  },
  "mounts": {
    "chassisTop": [0, 1.2, 0],
    "cabFloor": [0, 1.2, 2.6],
    "cargoFloor": [0, 1.2, -2.4],
    "turretRing": [0, 2.75, 0.4],
    "axleF": [0, 0.62, 2.8],
    "axleR1": [0, 0.62, -1.6],
    "axleR2": [0, 0.62, -3.0]
  },
  "joints": [
    { "name": "body", "at": [0, 1.2, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "wheelFL", "parent": "body", "at": [1.3, 0.62, 2.8], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.3, 0.62, 2.8], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelM1L", "parent": "body", "at": [1.3, 0.62, -1.6], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelM1R", "parent": "body", "at": [-1.3, 0.62, -1.6], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelM2L", "parent": "body", "at": [1.3, 0.62, -3.0], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelM2R", "parent": "body", "at": [-1.3, 0.62, -3.0], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "turretYaw", "parent": "body", "at": [0, 2.75, 0.4], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "gunPitch", "parent": "turretYaw", "at": [0, 3.05, 0.7], "dir": [0, 0, 1], "role": "hinge", "group": "turret" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Lower hull and frame: ladder frame rails, deck plate, side skirts with neon cyan strips, hazard-yellow chevron trim, fuel tanks, exhaust stacks, fenders over each wheel, wheel-well liners, underside greebles (pipes, drive shafts, differentials at each axle, suspension arms and shocks), front bumper and tow hooks, rear bumper with red tail light bars, mud flaps. Colours: hull, hullDark, trim, neonCyan, steel, neonRed.",
      "box": [[-1.5, 0.3, -4.5], [1.5, 1.4, 4.5]],
      "attaches": "Top face at chassisTop; cab sits on cabFloor, cargo on cargoFloor; wheels at axle mounts.",
      "joints": ["body"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "wheels",
      "builds": "Six large wheels (radius 0.62, width 0.55) on the joints wheelFL..wheelM2R: faceted tyre with tread blocks, rim disc, hub with lug nuts, neon magenta ring on the outer face, brake discs and calipers inside. Colours: tyre, rim, steel, neonMagenta, hullDark. Tyre bottoms touch y=0.",
      "box": [[-1.6, 0, -3.7], [1.6, 1.25, 3.5]],
      "attaches": "Each wheel centred on its wheel joint at the axle mounts, x=±1.3.",
      "joints": ["wheelFL", "wheelFR", "wheelM1L", "wheelM1R", "wheelM2L", "wheelM2R"],
      "floor": true,
      "budget": 170
    },
    {
      "id": "cab",
      "builds": "Armored wedge cab and hood: sloped angular armor plates, slit glowing windshield and side windows (glass with glassGlow edging), hood with vents and hazard stripes, bull-bar grille with headlight slits (white and orange), neon cyan light bar on the roof edge, side mirrors, antennas, door seams, handles, unit emblem decals, roof sensor pod, smoke launchers, steps. Interior hint: seats and dash glow seen through glass. Colours: hull, hullLight, trim, glass, glassGlow, neonCyan, white, orange.",
      "box": [[-1.4, 1.2, 1.0], [1.4, 2.7, 4.5]],
      "attaches": "Floor at cabFloor on the chassis; rear wall at z=1.0 meets the turret/cargo zone.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "cargo",
      "builds": "Rear cargo bed: raised side armor walls, three stacked modular containers with corner castings, ribbed panels, olive and rust painted sections, hazard markings, stencil number decals, rear ramp door with hinges and locks, roof rack, ammo crates, antenna masts, a rear-facing neon magenta strip and red warning lights, cable bundles and vents, tie-down rings. Colours: olive, hull, rust, trim, neonMagenta, neonRed, steel, white.",
      "box": [[-1.5, 1.2, -4.5], [1.5, 3.1, 0.9]],
      "attaches": "Floor at cargoFloor on the chassis; front wall abuts the cab rear; leaves the turret ring clear at turretRing.",
      "joints": ["body"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "turret",
      "builds": "Roof weapon station on turretRing: armored base ring with teeth, rotating turret box on joint turretYaw, twin autocannon barrels with muzzle brakes and heat sleeves on gunPitch, a side missile pod with 6 tubes and orange warhead tips, sensor dome with cyan lens, ammo belt feed, hazard trim, small radar dish, rivets, neon cyan targeting strip. Colours: hull, hullDark, barrel, steel, trim, orange, neonCyan, neonRed.",
      "box": [[-1.1, 2.6, -0.7], [1.1, 3.6, 1.9]],
      "attaches": "Base ring centred on turretRing at the roof between cab and cargo; barrels point to +Z.",
      "joints": ["turretYaw", "gunPitch"],
      "floor": false,
      "budget": 150
    }
  ]
}
```

<!-- call: wheels -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.62;
  const W = 0.55;
  const r = rng(77);
  const names = ["wheelFL", "wheelFR", "wheelM1L", "wheelM1R", "wheelM2L", "wheelM2R"];
  const zs = [2.8, 2.8, -1.6, -1.6, -3.0, -3.0];

  names.forEach((name, i) => {
    const bone = J[name];
    const s = i % 2 === 0 ? 1 : -1; // +1 = left (+X), outward direction
    const cx = 1.3 * s;
    const cy = 0.62;
    const cz = zs[i];
    const C = (x: number, y: number, z: number): [number, number, number] => [cx + s * x, cy + y, cz + z];
    // axle direction along X
    const axle: [number, number, number] = [1, 0, 0];

    const cyl = (rt: number, rb: number, h: number, seg: number, color: string, off: number, yz: [number, number] = [0, 0], spin = 0) => {
      b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, {
        bone,
        at: C(off, yz[0], yz[1]),
        dir: axle,
        axis: "y",
        flat: true,
        spin,
      } as any);
    };

    // tyre: octagonal, slightly rotated so a flat sits on the floor
    cyl(R, R, W, 8, P.tyre, 0);
    // sidewall bevel rings
    cyl(R * 0.9, R * 0.9, W + 0.04, 8, P.hullDark, 0);
    cyl(R * 0.97, R * 0.97, W * 0.6, 8, P.tyre, 0);

    // tread blocks around circumference
    const n = 16;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      const rr = R + 0.025;
      const y = Math.cos(a) * rr;
      const z = Math.sin(a) * rr;
      const blk = b.part(new THREE.BoxGeometry(W * 0.9, 0.06, 0.14), P.tyre, {
        bone,
        at: C(0, y, z),
        flat: true,
      } as any);
      blk.mesh.rotation.x = -a + Math.PI / 2 * 0 + 0;
      blk.mesh.rotation.x = a;
      // cross grooves
      if (k % 2 === 0) {
        const g = b.part(new THREE.BoxGeometry(W * 0.5, 0.03, 0.05), P.hullDark, {
          bone,
          at: C(0, Math.cos(a) * (rr + 0.03), Math.sin(a) * (rr + 0.03)),
        } as any);
        g.mesh.rotation.x = a;
      }
    }

    // outer face assembly
    const ox = W / 2;
    cyl(R * 0.68, R * 0.68, 0.06, 8, P.rim, ox + 0.0);
    cyl(R * 0.6, R * 0.6, 0.05, 8, P.hullDark, ox + 0.04);
    // neon magenta ring (torus-like)
    b.part(new THREE.TorusGeometry(R * 0.66, 0.025, 4, 8), P.neonMagenta, {
      bone,
      at: C(ox + 0.04, 0, 0),
      dir: axle,
      axis: "z",
    } as any);
    // rim spokes
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      const sp = b.part(new THREE.BoxGeometry(0.05, R * 0.5, 0.09), P.steel, {
        bone,
        at: C(ox + 0.07, Math.cos(a) * R * 0.32, Math.sin(a) * R * 0.32),
        flat: true,
      } as any);
      sp.mesh.rotation.x = -a;
    }
    // hub
    cyl(0.17, 0.2, 0.14, 8, P.steel, ox + 0.1);
    cyl(0.08, 0.08, 0.06, 6, P.hullDark, ox + 0.18);
    // lug nuts
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      cyl(0.022, 0.022, 0.05, 6, P.rim, ox + 0.15, [Math.cos(a) * 0.12, Math.sin(a) * 0.12]);
    }
    // rivets on rim
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2 + 0.1;
      cyl(0.015, 0.015, 0.04, 5, P.steel, ox + 0.05, [Math.cos(a) * R * 0.5, Math.sin(a) * R * 0.5]);
    }

    // inner side: brake disc and caliper
    const ix = -W / 2;
    cyl(R * 0.52, R * 0.52, 0.04, 8, P.steel, ix + 0.03);
    cyl(R * 0.4, R * 0.4, 0.05, 8, P.hullDark, ix + 0.0);
    cyl(0.14, 0.14, 0.12, 8, P.rim, ix - 0.02);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      cyl(0.02, 0.02, 0.05, 6, P.hullDark, ix + 0.04, [Math.cos(a) * 0.3, Math.sin(a) * 0.3]);
    }
    // caliper
    b.part(new THREE.BoxGeometry(0.12, 0.16, 0.2), P.neonMagenta, {
      bone,
      at: C(ix + 0.03, 0.34, 0.12),
      flat: true,
    } as any);
    b.part(new THREE.BoxGeometry(0.14, 0.05, 0.22), P.hullDark, {
      bone,
      at: C(ix + 0.03, 0.43, 0.12),
      flat: true,
    } as any);
    // hazard tick marks on the sidewall
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + 0.4;
      const t = b.part(new THREE.BoxGeometry(0.03, 0.1, 0.05), P.trim, {
        bone,
        at: C(ox - 0.02, Math.cos(a) * R * 0.82, Math.sin(a) * R * 0.82),
      } as any);
      t.mesh.rotation.x = -a;
    }
  });
}
```

<!-- call: turret -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildTurret({ b, J, P, M }: Ctx) {
  const yaw = J.turretYaw;
  const pitch = J.gunPitch;
  const r = rng(77);
  const [cx, cy, cz] = M.turretRing;

  const box = (w: number, h: number, d: number, col: string, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, ...(rot ? { rotation: rot } : {}) });
  const cyl = (rt: number, rb: number, h: number, seg: number, col: string, at: number[], bone: any, dir: number[] = [0, 1, 0]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), col, { bone, at, dir });

  // Base ring (static on body)
  cyl(0.95, 1.0, 0.12, 16, P.hullDark, [cx, cy + 0.06, cz], J.body);
  cyl(0.85, 0.85, 0.08, 16, P.steel, [cx, cy + 0.15, cz], J.body);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    box(0.1, 0.1, 0.14, P.trim, [cx + Math.sin(a) * 0.93, cy + 0.17, cz + Math.cos(a) * 0.93], J.body, [0, (a * 180) / Math.PI, 0]);
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.2;
    b.part(new THREE.SphereGeometry(0.03, 5, 4), P.steel, { bone: J.body, at: [cx + Math.sin(a) * 1.0, cy + 0.08, cz + Math.cos(a) * 1.0] });
  }

  // Turret body on yaw
  const ty = 2.98;
  box(1.5, 0.5, 1.4, P.hull, [0, ty, 0.35], yaw);
  box(1.3, 0.2, 1.2, P.hullLight, [0, ty + 0.34, 0.3], yaw);
  box(1.4, 0.3, 0.5, P.hull, [0, ty + 0.0, 0.95], yaw, [-20, 0, 0]);
  box(1.52, 0.08, 1.42, P.hullDark, [0, ty - 0.2, 0.35], yaw);
  // hazard trim
  for (let i = 0; i < 6; i++) {
    for (const s of [1, -1]) box(0.05, 0.1, 0.12, P.trim, [s * 0.76, ty + 0.05, -0.2 + i * 0.22], yaw, [0, 0, 0]);
  }
  for (let i = 0; i < 5; i++) box(0.14, 0.04, 0.1, i % 2 ? P.trimDark : P.trim, [-0.4 + i * 0.2, ty + 0.46, -0.3], yaw);
  // neon targeting strip
  box(1.2, 0.04, 0.03, P.neonCyan, [0, ty + 0.1, 1.06], yaw);
  box(0.03, 0.04, 1.0, P.neonCyan, [0.76, ty - 0.12, 0.35], yaw);
  box(0.03, 0.04, 1.0, P.neonCyan, [-0.76, ty - 0.12, 0.35], yaw);
  // rivets
  for (let i = 0; i < 14; i++) {
    b.part(new THREE.SphereGeometry(0.025, 5, 4), P.steel, { bone: yaw, at: [(r() - 0.5) * 1.2, ty + 0.45, -0.25 + r() * 1.1] });
  }
  // vents
  for (let i = 0; i < 4; i++) box(0.3, 0.03, 0.05, P.hullDark, [0, ty + 0.2 + 0.0, -0.33 + i * 0.001 - 0.0], yaw).position.z += 0 ;
  for (let i = 0; i < 4; i++) box(0.35, 0.03, 0.04, P.hullDark, [0.3, ty + 0.46, -0.1 + i * 0.1], yaw);

  // Mantlet and gun cradle on pitch
  box(0.9, 0.4, 0.2, P.hullDark, [0, 3.05, 1.08], pitch);
  for (const s of [1, -1]) {
    const x = s * 0.28;
    cyl(0.07, 0.07, 1.3, 8, P.barrel, [x, 3.05, 1.85 - 0.0], pitch, [0, 0, 1]);
    cyl(0.11, 0.11, 0.5, 8, P.steel, [x, 3.05, 1.4], pitch, [0, 0, 1]);
    cyl(0.1, 0.1, 0.18, 8, P.hullDark, [x, 3.05, 1.86], pitch, [0, 0, 1]);
    for (let k = 0; k < 3; k++) cyl(0.115, 0.115, 0.03, 8, P.orange, [x, 3.05, 1.2 + k * 0.1], pitch, [0, 0, 1]);
    box(0.2, 0.03, 0.05, P.barrel, [x, 3.05, 1.86], pitch);
    box(0.03, 0.2, 0.05, P.barrel, [x, 3.05, 1.86], pitch);
  }
  // ammo belt
  for (let i = 0; i < 8; i++) box(0.08, 0.06, 0.05, i % 2 ? P.trim : P.trimDark, [-0.6 - i * 0.0, ty + 0.1 - i * 0.03, 0.8 - i * 0.12], yaw);
  box(0.2, 0.3, 0.3, P.hullDark, [-0.62, ty + 0.0, 0.9], yaw);

  // Missile pod (left side, +X)
  box(0.5, 0.55, 0.8, P.hullDark, [0.95, ty + 0.2, 0.3], yaw);
  box(0.12, 0.3, 0.3, P.hull, [0.78, ty + 0.1, 0.3], yaw);
  for (let i = 0; i < 6; i++) {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.95 + (col - 1) * 0.14, y = ty + 0.08 + row * 0.2 + 0.1;
    cyl(0.055, 0.055, 0.2, 8, P.barrel, [x, y, 0.72], yaw, [0, 0, 1]);
    cyl(0.04, 0.0, 0.1, 6, P.orange, [x, y, 0.78], yaw, [0, 0, 1]);
  }
  box(0.52, 0.04, 0.82, P.trim, [0.95, ty + 0.5, 0.3], yaw);

  // Sensor dome (right side)
  cyl(0.2, 0.24, 0.12, 8, P.hullDark, [-0.5, ty + 0.5, 0.0], yaw);
  b.part(new THREE.SphereGeometry(0.17, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), P.steel, { bone: yaw, at: [-0.5, ty + 0.56, 0.0] });
  b.part(new THREE.SphereGeometry(0.07, 6, 4), P.neonCyan, { bone: yaw, at: [-0.5, ty + 0.66, 0.1] });
  box(0.08, 0.03, 0.03, P.neonRed, [-0.5, ty + 0.6, -0.2], yaw);

  // Radar dish + mast
  cyl(0.02, 0.02, 0.35, 5, P.steel, [0.3, ty + 0.65, -0.35], yaw);
  b.part(new THREE.SphereGeometry(0.17, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.white, { bone: yaw, at: [0.3, ty + 0.85, -0.35], rotation: [-100, 0, 0] });
  cyl(0.015, 0.015, 0.15, 4, P.steel, [0.3, ty + 0.9, -0.28], yaw, [0, 0, 1]);
  b.part(new THREE.SphereGeometry(0.025, 5, 4), P.neonRed, { bone: yaw, at: [0.3, ty + 1.0, -0.2] });
  // antenna
  cyl(0.008, 0.012, 0.5, 4, P.steel, [-0.7, ty + 0.7, -0.5], yaw);
}
```

<!-- call: cargo -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildCargo({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const r = rng(77);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z] });
  const cyl = (rad: number, len: number, c: string, x: number, y: number, z: number, axis: "x" | "y" | "z" = "y", seg = 8) =>
    b.part(new THREE.CylinderGeometry(rad, rad, len, seg), c, {
      bone,
      at: [x, y, z],
      dir: axis === "x" ? [1, 0, 0] : axis === "z" ? [0, 0, 1] : [0, 1, 0],
    });

  const Z0 = -4.4, Z1 = 0.8;
  const zc = (Z0 + Z1) / 2, len = Z1 - Z0;

  // floor plate
  box(2.9, 0.1, len, P.hullDark, 0, 1.25, zc);

  // side armor walls with trim and rivets
  for (const s of [1, -1]) {
    box(0.1, 0.5, len, P.hull, s * 1.4, 1.5, zc);
    box(0.12, 0.06, len, P.trim, s * 1.4, 1.78, zc);
    for (let i = 0; i < 12; i++) {
      const z = Z0 + 0.3 + i * 0.4;
      box(0.14, 0.04, 0.2, i % 2 ? P.trimDark : P.trim, s * 1.4, 1.78, z);
      cyl(0.025, 0.04, P.steel, s * 1.47, 1.5, z, "x", 6);
    }
    // tie-down rings
    for (let i = 0; i < 4; i++) {
      const z = Z0 + 0.6 + i * 1.2;
      b.part(new THREE.TorusGeometry(0.06, 0.012, 5, 8), P.steel, { bone, at: [s * 1.47, 1.6, z], dir: [1, 0, 0], axis: "z" });
    }
  }

  // containers: three stacked/placed modules
  const cols = [P.olive, P.rust, P.olive];
  const specs = [
    { z: -3.4, y: 2.0, w: 2.5, d: 1.9, h: 0.75 },
    { z: -1.35, y: 2.0, w: 2.5, d: 1.9, h: 0.75 },
    { z: -2.4, y: 2.75, w: 2.4, d: 3.8, h: 0.6 },
  ];
  specs.forEach((c, k) => {
    const hw = c.w / 2, hd = c.d / 2, hh = c.h / 2;
    box(c.w, c.h, c.d, cols[k], 0, c.y, c.z);
    // ribs on sides
    for (const s of [1, -1]) {
      const n = Math.floor(c.d / 0.22);
      for (let i = 0; i < n; i++) box(0.04, c.h * 0.8, 0.07, k === 1 ? "#5e3a20" : "#3a472d", s * (hw + 0.015), c.y, c.z - hd + 0.15 + i * 0.22);
    }
    // corner castings
    for (const sx of [1, -1]) for (const sy of [1, -1]) for (const sz of [1, -1])
      box(0.12, 0.12, 0.12, P.steel, sx * hw, c.y + sy * hh, c.z + sz * hd);
    // hazard band
    box(c.w + 0.02, 0.06, 0.1, P.trim, 0, c.y + hh - 0.1, c.z + hd);
    // stencil number decals
    for (const s of [1, -1]) {
      const n = 3 + k;
      for (let i = 0; i < n; i++) box(0.02, 0.14, 0.05, P.white, s * (hw + 0.03), c.y + 0.1, c.z - 0.2 + i * 0.09);
      box(0.02, 0.03, 0.4, P.white, s * (hw + 0.03), c.y - 0.12, c.z);
    }
    // vents
    for (let i = 0; i < 4; i++) box(0.3, 0.025, 0.02, P.hullDark, -0.5 + i * 0.01 + (i % 2) * 0.0, c.y + hh * 0.3 - i * 0.07 + 0.1, c.z + hd + 0.01);
  });

  // top container roof rack
  const topY = 3.05;
  for (const s of [1, -1]) box(0.05, 0.05, 3.6, P.steel, s * 1.0, topY + 0.1, -2.4);
  for (let i = 0; i < 6; i++) box(2.0, 0.04, 0.05, P.steel, 0, topY + 0.1, -4.1 + i * 0.7);
  for (const s of [1, -1]) for (let i = 0; i < 3; i++) cyl(0.03, 0.12, P.steel, s * 1.0, topY + 0.04, -3.9 + i * 1.5, "y", 6);

  // ammo crates on the front deck
  for (let i = 0; i < 3; i++) {
    const x = -0.9 + i * 0.9;
    box(0.55, 0.35, 0.5, i === 1 ? P.rust : P.olive, x, 1.48, 0.45);
    box(0.57, 0.05, 0.1, P.trim, x, 1.58, 0.45);
    box(0.2, 0.06, 0.02, P.white, x, 1.5, 0.71);
    cyl(0.03, 0.08, P.steel, x, 1.68, 0.45, "x", 6);
  }

  // rear ramp door
  const rz = Z0 - 0.02;
  box(2.5, 1.5, 0.1, P.hull, 0, 2.0, rz - 0.05);
  box(2.3, 1.3, 0.04, P.hullLight, 0, 2.0, rz - 0.11);
  for (let i = 0; i < 5; i++) box(2.2, 0.04, 0.03, P.hullDark, 0, 1.55 + i * 0.22, rz - 0.14);
  for (const s of [1, -1]) {
    for (const y of [1.45, 2.55]) cyl(0.05, 0.2, P.steel, s * 1.1, y, rz - 0.1, "z", 6);
    cyl(0.04, 0.5, P.steel, s * 0.5, 2.0, rz - 0.15, "y", 6);
    box(0.14, 0.14, 0.05, P.trim, s * 0.5, 2.0, rz - 0.16);
  }
  box(2.4, 0.14, 0.02, P.trim, 0, 1.38, rz - 0.15);
  for (let i = 0; i < 12; i++) box(0.2, 0.14, 0.015, i % 2 ? P.hullDark : P.trim, -1.1 + i * 0.2, 1.38, rz - 0.165);

  // neon magenta strip + red lights at rear
  box(2.3, 0.05, 0.03, P.neonMagenta, 0, 2.62, rz - 0.15);
  box(2.3, 0.05, 0.03, P.neonMagenta, 0, 1.42 + 0.0, rz - 0.19);
  for (const s of [1, -1]) {
    box(0.1, 0.25, 0.06, P.neonRed, s * 1.25, 2.2, rz - 0.1);
    cyl(0.05, 0.08, P.neonRed, s * 0.9, 3.4, -4.0, "y", 6);
  }

  // antenna masts
  for (const [x, z, h] of [[1.3, -0.3, 1.0], [-1.3, -4.2, 0.8]] as number[][]) {
    cyl(0.015, h, P.steel, x, 3.05 + h / 2 - 0.2, z, "y", 5);
    cyl(0.04, 0.06, P.neonRed, x, 3.05 + h - 0.15, z, "y", 6);
    cyl(0.05, 0.05, P.hullDark, x, 2.9, z, "y", 6);
  }

  // cable bundles and vents along front wall
  for (let i = 0; i < 4; i++) {
    const c = [P.hullDark, P.neonCyan, P.neonRed, P.trimDark][i];
    b.part(new THREE.TorusGeometry(0.2 + i * 0.03, 0.02, 5, 10, Math.PI), c, { bone, at: [0.9 - i * 0.05, 2.45, Z1 + 0.0], dir: [0, 0, 1], axis: "z" });
  }
  box(2.6, 1.4, 0.08, P.hull, 0, 2.0, Z1 - 0.02 - 0.02);
  for (let i = 0; i < 6; i++) box(0.5 - r() * 0.0, 0.03, 0.02, P.hullDark, -0.6, 1.6 + i * 0.12, Z1 - 0.07);
  box(0.12, 0.4, 0.03, P.trim, 1.0, 2.2, Z1 - 0.07);
  box(0.12, 0.4, 0.03, P.trim, -1.0, 2.2, Z1 - 0.07);
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCab({ b, J, P }: any) {
  const bone = J.body;
  const R = rng(77);
  // box helper: center, size, color, optional rotation about X (deg)
  const box = (c: number[], s: number[], col: string, rx = 0, ry = 0, rz = 0) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), col, {
      bone, at: c,
      rotation: [rx, ry, rz],
    });
  const lit = (c: number[], s: number[], col: string, k = 1.2, rx = 0) =>
    glow(box(c, s, col, rx), k);

  // cab shell: lower body, upper wedge
  box([0, 1.55, 3.3], [2.7, 0.7, 2.4], P.hull);
  box([0, 1.5, 3.3], [2.76, 0.12, 2.3], P.hullDark);
  // hood block, sloped
  box([0, 1.95, 4.0], [2.5, 0.5, 1.0], P.hull, 0);
  box([0, 2.22, 3.95], [2.3, 0.1, 0.9], P.hullLight, -8);
  // cabin upper
  box([0, 2.3, 2.3], [2.6, 0.8, 2.0], P.hull);
  // roof plate and sloped windshield armor
  box([0, 2.68, 2.1], [2.7, 0.1, 1.7], P.hullLight);
  box([0, 2.45, 3.25], [2.5, 0.12, 0.9], P.hull, 35);
  // windshield slit
  lit([0, 2.43, 3.3], [2.1, 0.07, 0.62], P.glass, 0.5, 35);
  lit([0, 2.43, 3.3], [2.24, 0.04, 0.72], P.glassGlow, 0.9, 35);
  box([0, 2.45, 3.3], [2.0, 0.09, 0.55], P.glass, 35);
  // side windows + glow edging
  for (const s of [1, -1]) {
    box([s * 1.31, 2.35, 2.5], [0.06, 0.34, 1.1], P.glass);
    lit([s * 1.335, 2.35, 2.5], [0.02, 0.4, 1.18], P.glassGlow, 0.8);
    box([s * 1.33, 2.35, 2.5], [0.05, 0.3, 1.04], P.glass);
    // door seams + handle
    box([s * 1.4, 1.95, 2.0], [0.02, 0.9, 0.03], P.hullDark);
    box([s * 1.4, 1.95, 3.0], [0.02, 0.9, 0.03], P.hullDark);
    box([s * 1.41, 1.95, 2.85], [0.04, 0.05, 0.22], P.steel);
    // emblem decal: yellow chevrons
    box([s * 1.41, 1.8, 2.4], [0.02, 0.2, 0.3], P.trim);
    box([s * 1.42, 1.8, 2.4], [0.02, 0.08, 0.18], P.hullDark);
    // steps
    box([s * 1.45, 1.1, 2.6], [0.2, 0.06, 0.6], P.steel);
    box([s * 1.45, 1.3, 2.6], [0.2, 0.06, 0.6], P.steel);
    // mirrors
    box([s * 1.6, 2.2, 3.15], [0.08, 0.3, 0.2], P.hullDark);
    box([s * 1.5, 2.2, 3.15], [0.2, 0.04, 0.04], P.hullDark);
    // headlights
    lit([s * 0.85, 1.85, 4.52], [0.5, 0.1, 0.04], P.white, 1.8);
    lit([s * 1.15, 1.6, 4.52], [0.18, 0.1, 0.04], P.orange, 1.5);
    // smoke launchers
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 6), P.hullDark, {
        bone, at: [s * (1.0 + i * 0.12), 2.82, 1.7], rotation: [-40, 0, s * 10 * i],
      });
    }
    // antennas
    b.rod([s * 1.1, 2.7, 1.2], [s * 1.2 + s * 0.1, 3.5 - (s > 0 ? 0 : 0.5), 1.15], 0.012, P.steel, { bone });
    box([s * 1.1, 2.74, 1.2], [0.14, 0.06, 0.14], P.hullDark);
    // fender armor bevels
    box([s * 1.3, 2.0, 4.35], [0.2, 0.6, 0.3], P.hullLight, 0, s * 20);
  }
  // hood vents and hazard stripes
  for (let i = 0; i < 5; i++) {
    box([-0.6 + i * 0.3, 2.24, 3.75], [0.08, 0.02, 0.45], P.hullDark, -8);
  }
  for (let i = 0; i < 6; i++) {
    box([-0.85 + i * 0.34, 2.23, 4.35], [0.16, 0.02, 0.18], i % 2 ? P.hullDark : P.trim, -8, 20);
  }
  // bull-bar grille
  box([0, 1.7, 4.55], [2.5, 0.1, 0.1], P.steel);
  box([0, 1.4, 4.55], [2.5, 0.1, 0.1], P.steel);
  for (let i = -4; i <= 4; i++) box([i * 0.28, 1.55, 4.53], [0.05, 0.5, 0.06], P.hullDark);
  box([0, 1.55, 4.5], [2.4, 0.5, 0.03], P.hullLight);
  for (const s of [1, -1]) {
    box([s * 1.3, 1.55, 4.55], [0.1, 0.6, 0.12], P.steel);
  }
  // roof light bar (cyan)
  lit([0, 2.76, 3.0], [2.4, 0.06, 0.08], P.neonCyan, 2);
  lit([0, 2.76, 1.1], [2.4, 0.05, 0.05], P.neonCyan, 1.5);
  // roof sensor pod
  b.part(new THREE.CylinderGeometry(0.22, 0.28, 0.16, 8), P.hullDark, { bone, at: [0, 2.82, 2.2] });
  glow(b.part(new THREE.SphereGeometry(0.12, 6, 4), P.glassGlow, { bone, at: [0, 2.94, 2.3] }), 1.5);
  // hazard stripe on cab lower side
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++)
      box([s * 1.39, 1.38, 1.6 + i * 0.3], [0.02, 0.1, 0.14], i % 2 ? P.trimDark : P.trim, 0, 0, 0);
  // interior: seats and dash glow
  for (const s of [1, -1]) {
    box([s * 0.5, 2.0, 2.0], [0.5, 0.5, 0.5], P.hullDark);
    box([s * 0.5, 2.4, 1.8], [0.5, 0.5, 0.1], P.hullDark);
  }
  lit([0, 2.2, 3.0], [1.8, 0.1, 0.25], P.neonCyan, 1.2);
  lit([-0.4, 2.28, 2.95], [0.3, 0.02, 0.1], P.orange, 1.2);
  // rivets along rear wall and hood edge
  for (let i = 0; i < 14; i++) {
    b.part(new THREE.SphereGeometry(0.025, 5, 3), P.steel, {
      bone, at: [-1.2 + i * 0.185, 1.9 + R() * 0.02, 1.02],
    });
  }
  box([0, 2.0, 1.0], [2.7, 1.5, 0.08], P.hullDark);
  glow(box([0, 2.55, 0.98], [1.4, 0.06, 0.03], P.neonCyan), 1.3);
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildChassis({ b, J, P, M }: any) {
  const bone = J.body;
  const R = rng(77);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z], rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at: [x, y, z], rotation: rot, flat: true });

  // deck plate and frame rails
  box(3.0, 0.12, 9.0, P.hull, 0, 1.34, 0);
  box(2.9, 0.04, 8.8, P.hullDark, 0, 1.41, 0);
  for (const s of [1, -1]) {
    box(0.18, 0.28, 8.8, P.hullDark, s * 0.55, 1.1, 0);
    box(0.22, 0.06, 8.8, P.steel, s * 0.55, 1.26, 0);
    // side skirts + neon
    box(0.1, 0.5, 6.2, P.hull, s * 1.45, 0.95, -0.2);
    box(0.04, 0.06, 6.0, P.neonCyan, s * 1.51, 0.86, -0.2);
    box(0.04, 0.03, 6.0, P.hullDark, s * 1.51, 1.1, -0.2);
    // hazard chevrons
    for (let i = 0; i < 14; i++) {
      const z = -2.9 + i * 0.44;
      box(0.04, 0.12, 0.18, i % 2 ? P.trim : P.trimDark, s * 1.51, 1.25, z, [0, 0, 0]).mesh.rotation.x = 0.5;
    }
    box(0.04, 0.04, 6.0, P.trim, s * 1.51, 1.34, -0.2);
    // fuel tanks
    cyl(0.28, 0.28, 1.5, 8, P.hullLight, s * 1.0, 0.82, -0.3, [90, 0, 0]);
    for (const z of [-0.8, 0.2]) cyl(0.295, 0.295, 0.06, 8, P.steel, s * 1.0, 0.82, z, [90, 0, 0]);
    box(0.1, 0.12, 0.1, P.trim, s * 1.0, 1.1, -0.3);
    // exhaust stacks
    cyl(0.07, 0.08, 1.3, 8, P.steel, s * 1.28, 1.95, -0.05);
    cyl(0.09, 0.09, 0.1, 8, P.hullDark, s * 1.28, 2.62, -0.05);
    box(0.14, 0.08, 0.14, P.trim, s * 1.28, 1.45, -0.05);
    // fenders + liners over each wheel
    for (const z of [2.8, -1.6, -3.0]) {
      box(0.75, 0.08, 1.4, P.hull, s * 1.3, 1.3, z);
      box(0.75, 0.2, 0.08, P.hullLight, s * 1.3, 1.22, z + 0.72, [25 * s, 0, 0]);
      box(0.75, 0.2, 0.08, P.hullLight, s * 1.3, 1.22, z - 0.72, [-25 * s, 0, 0]);
      box(0.04, 0.08, 1.2, P.trim, s * 1.62 > 0 ? s * 1.63 : s * 1.63, 1.3, z);
      box(0.06, 0.3, 1.2, P.hullDark, s * 0.97, 0.95, z);
      // mud flap
      if (z < 0) {
        box(0.04, 0.4, 0.5, P.hullDark, s * 1.5, 0.62, z - 0.85);
        box(0.05, 0.05, 0.3, P.trim, s * 1.5, 0.45, z - 0.85);
      }
      // suspension arm + shock
      box(0.8, 0.07, 0.12, P.steel, s * 0.9, 0.72, z, [0, 0, 8 * s]);
      cyl(0.045, 0.045, 0.45, 6, P.neonCyan, s * 0.75, 0.98, z + 0.2, [0, 0, -15 * s]);
      cyl(0.06, 0.06, 0.25, 6, P.hullDark, s * 0.8, 0.88, z + 0.2, [0, 0, -15 * s]);
    }
    // tow hooks + front bumper lights
    box(0.12, 0.12, 0.3, P.trim, s * 0.8, 0.55, 4.7);
    box(0.08, 0.08, 0.1, P.steel, s * 0.8, 0.55, 4.9);
    box(0.2, 0.05, 0.05, P.neonRed, s * 1.2, 0.85, -4.63);
    box(0.5, 0.08, 0.06, P.neonRed, s * 0.9, 0.78, -4.62);
    // rivets along deck edge
    for (let i = 0; i < 20; i++) box(0.05, 0.03, 0.05, P.steel, s * 1.4, 1.42, -4.2 + i * 0.44);
  }
  // cross members
  for (let i = 0; i < 9; i++) box(1.2, 0.12, 0.14, P.hullDark, 0, 1.1, -4 + i * 1.0);
  // axles, differentials, driveshafts
  for (const z of [2.8, -1.6, -3.0]) {
    cyl(0.07, 0.07, 2.2, 8, P.steel, 0, 0.62, z, [0, 0, 90]);
    const d = b.part(new THREE.SphereGeometry(0.24, 8, 6), P.hullLight, { bone, at: [0, 0.62, z], flat: true });
    box(0.3, 0.06, 0.3, P.trim, 0, 0.84, z);
  }
  for (const [z0, len] of [[2.8, 4.4], [-1.6, 1.4]] as number[][]) {
    cyl(0.06, 0.06, len, 8, P.steel, 0, 0.78, z0 - len / 2, [90, 0, 0]);
    for (let k = 0; k < 4; k++) cyl(0.085, 0.085, 0.06, 8, P.hullDark, 0, 0.78, z0 - 0.2 - k * (len / 4), [90, 0, 0]);
  }
  // pipes under floor
  for (const s of [1, -1]) {
    cyl(0.04, 0.04, 6.5, 6, P.steel, s * 0.3, 0.95, -0.5, [90, 0, 0]);
    cyl(0.03, 0.03, 5.5, 6, P.neonCyan, s * 0.38, 1.0, -0.5, [90, 0, 0]);
  }
  // front bumper
  box(2.9, 0.4, 0.45, P.hull, 0, 0.7, 4.55);
  box(2.9, 0.1, 0.5, P.trim, 0, 0.93, 4.56);
  for (let i = 0; i < 10; i++)
    box(0.18, 0.1, 0.52, i % 2 ? P.hullDark : P.trim, -1.3 + i * 0.29, 0.52, 4.56);
  box(1.2, 0.05, 0.05, P.neonCyan, 0, 0.7, 4.8);
  box(2.6, 0.2, 0.3, P.hullLight, 0, 0.95, 4.35, [-20, 0, 0]);
  // rear bumper
  box(3.0, 0.4, 0.35, P.hull, 0, 0.75, -4.55);
  box(3.0, 0.08, 0.38, P.trim, 0, 0.97, -4.56);
  for (let i = 0; i < 8; i++) box(0.22, 0.08, 0.4, i % 2 ? P.hullDark : P.trim, -1.3 + i * 0.37, 0.55, -4.56);
  box(2.2, 0.1, 0.05, P.neonRed, 0, 0.78, -4.75);
  for (const x of [-0.5, 0, 0.5]) box(0.12, 0.2, 0.05, R() > 0.5 ? P.neonRed : P.neonRed, x, 0.6, -4.74);
  // vents on hull sides
  for (const s of [1, -1])
    for (let i = 0; i < 5; i++) box(0.03, 0.08, 0.35, P.hullDark, s * 1.51, 0.98, 3.7 + i * 0.1 * 0 - 0.0 + (i - 2) * 0.18 * 0 + (i * 0.1 - 0.2) * 0 + 0.0 + (i - 2) * 0.0 - 0.0 + 0.0 + (i * 0.0), [0, 0, 0]).mesh.position.y += i * 0.0;
}
```