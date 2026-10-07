import * as THREE from "three";
import { glow } from "../kits/glow";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { rng } from "../src/math";
import { arc } from "../src/path";

type V = [number, number, number];

export const meta = {
  name: "Campsite Set",
  description:
    "A low-poly camping prop group on a grassy patch: a two-tone ridge tent with a window and a hinged awning flap, a stone-ringed campfire with a tripod and a blue enamel pot on a hook, a rolled sleeping bag on a pad, a rucksack, a tin bucket, a lantern, log seats, a woodpile and a chopping stump with an axe.",
  style: "low-poly",
  commit: "b816db2",
};

const C = {
  grass: "#86b35a",
  grassDark: "#5e8f40",
  grassLight: "#a8cc6e",
  dirt: "#9a7447",
  ash: "#2e2823",
  tent: "#ee8143",
  tentDark: "#c95a2c",
  tentTrim: "#f4e4bf",
  tentRidge: "#6a3420",
  window: "#3d5560",
  door: "#2b1e16",
  rope: "#e0d3ad",
  peg: "#d8b377",
  stoneA: "#8f959c",
  stoneB: "#737982",
  stoneC: "#a9aeb4",
  moss: "#6f9148",
  bark: "#7a5233",
  barkDark: "#4b3322",
  endGrain: "#e0bb85",
  wood: "#a97c4b",
  woodDark: "#6e4a2c",
  pot: "#2f6fb0",
  potRed: "#c93d2e",
  lid: "#f0e7d0",
  steel: "#4b5058",
  tin: "#a7b1ba",
  water: "#4f86b0",
  flameOut: "#ff7d1e",
  flameMid: "#ffc93f",
  flameCore: "#fff5bd",
  ember: "#ffa43a",
  bag: "#4f8a57",
  lining: "#dcc68f",
  strap: "#5a3c26",
  buckle: "#d6aa4c",
  pad: "#3e6fa3",
  sack: "#c9a25c",
  pack: "#5d6b3c",
  packFlap: "#3f4a28",
  foam: "#d9a441",
  glass: "#ffd27a",
  stumpTop: "#e0b17a",
  stump: "#7d5331",
  axeSteel: "#c3cbd2",
  handle: "#b58152",
  flowerY: "#f6d44e",
  flowerW: "#f7f2e8",
  flowerP: "#c98ee0",
};

export default function build() {
  const b = createBuilder({ name: "campsiteSet" });
  const root = b.joint("base", { at: [0, 0, 0], group: "set" });
  const rnd = rng(7);

  const G = 0.05; // top of the grass patch: everything stands on it
  const F: V = [0.4, G, 0.3]; // campfire centre
  const [F0, F2] = [F[0], F[2]];
  const TX = -1.0; // tent centre x
  const ZF = 0.0; // tent front gable (the door) z
  const ZB = -2.2; // tent back gable z
  const EY = G + 0.01; // eave height
  const RY = G + 1.0; // ridge height
  const MY = (EY + RY) / 2; // mid-roof height

  const part = (geo: THREE.BufferGeometry, color: string, at: V, dir?: V) =>
    dir
      ? b.part(geo, color, { bone: root, at, dir, flat: true })
      : b.part(geo, color, { bone: root, at, flat: true });
  const rod = (p: V, q: V, r: number, color: string) =>
    b.rod(p, q, r, { color, bone: root, sides: 6, smooth: false });

  // A log lying on the ground: a faceted body with a lighter cut face at each end.
  const log = (c: V, axis: V, len: number, r: number, bark: string = C.bark) => {
    part(new THREE.CylinderGeometry(r, r, len, 7), bark, c, axis);
    for (const s of [-1, 1]) {
      const k = len / 2 + 0.002;
      const e: V = [c[0] + axis[0] * s * k, c[1] + axis[1] * s * k, c[2] + axis[2] * s * k];
      part(new THREE.CylinderGeometry(r * 0.9, r * 0.9, 0.008, 7), C.endGrain, e, axis);
    }
  };

  // ---- ground -----------------------------------------------------------
  part(new THREE.CylinderGeometry(1, 1, 0.05, 16).scale(2.4, 1, 2.4), C.grass, [-0.2, 0.025, -0.7]);
  part(new THREE.CylinderGeometry(1, 1, 0.012, 12).scale(0.85, 1, 1.1), C.dirt, [TX, G, -1.1]);
  part(new THREE.CylinderGeometry(0.42, 0.44, 0.01, 10), C.ash, [F0, G + 0.002, F2]);

  // ---- ridge tent -------------------------------------------------------
  for (const s of [1, -1]) {
    b.slab(
      [
        [TX, RY, ZF],
        [TX, RY, ZB],
        [TX + s * 0.375, MY, ZB],
        [TX + s * 0.375, MY, ZF],
      ],
      { color: C.tent, thickness: 0.03, bone: root },
    );
    b.slab(
      [
        [TX + s * 0.375, MY, ZF],
        [TX + s * 0.375, MY, ZB],
        [TX + s * 0.75, EY, ZB],
        [TX + s * 0.75, EY, ZF],
      ],
      { color: C.tentDark, thickness: 0.03, bone: root },
    );
    rod([TX + s * 0.75, EY + 0.012, ZF], [TX + s * 0.75, EY + 0.012, ZB], 0.02, C.tentRidge);
  }
  b.slab(
    [
      [TX - 0.75, EY, ZB],
      [TX + 0.75, EY, ZB],
      [TX, RY, ZB],
    ],
    { color: C.tentDark, thickness: 0.03, bone: root },
  );
  b.slab(
    [
      [TX - 0.75, EY, ZF],
      [TX + 0.75, EY, ZF],
      [TX, RY, ZF],
    ],
    { color: C.tentDark, thickness: 0.03, bone: root },
  );
  rod([TX, RY + 0.01, ZF], [TX, RY + 0.01, ZB], 0.02, C.tentRidge); // ridge seam
  // a small mesh window high on the back gable
  b.slab(
    [
      [TX - 0.13, G + 0.45, ZB - 0.02],
      [TX + 0.13, G + 0.45, ZB - 0.02],
      [TX + 0.1, G + 0.7, ZB - 0.02],
      [TX - 0.1, G + 0.7, ZB - 0.02],
    ],
    { color: C.window, thickness: 0.01, bone: root },
  );

  // a mesh window on the left upper roof, a little proud of the panel
  // panel point at ridge fraction u and depth z: (TX - 0.375u, RY + (MY - RY)u, z)
  const winPt = (u: number, z: number): V => [TX - 0.375 * u - 0.01, RY + (MY - RY) * u + 0.017, z];
  b.slab(
    [winPt(0.25, -1.45), winPt(0.25, -1.05), winPt(0.65, -1.05), winPt(0.65, -1.45)],
    { color: C.window, thickness: 0.01, bone: root },
  );

  // door: cream trim, then the dark opening behind the awning flap
  const zT = ZF + 0.02;
  const zD = ZF + 0.03;
  b.slab(
    [
      [TX - 0.23, EY, zT],
      [TX + 0.23, EY, zT],
      [TX + 0.23, G + 0.5, zT],
      [TX, G + 0.68, zT],
      [TX - 0.23, G + 0.5, zT],
    ],
    { color: C.tentTrim, thickness: 0.01, bone: root },
  );
  b.slab(
    [
      [TX - 0.2, EY, zD],
      [TX + 0.2, EY, zD],
      [TX + 0.2, G + 0.5, zD],
      [TX, G + 0.62, zD],
      [TX - 0.2, G + 0.5, zD],
    ],
    { color: C.door, thickness: 0.01, bone: root },
  );

  // awning flap hinged at the top of the door, pinned open 40 degrees outward
  const yH = G + 0.6;
  const zH = ZF + 0.05;
  const flap = b.joint("tentFlap", { parent: root, at: [TX, yH, zH], role: "hinge", group: "tent" });
  const fy = yH - 0.337; // 0.44 m drop, turned 40 degrees out
  const fz = zH + 0.283;
  b.slab(
    [
      [TX - 0.2, yH, zH],
      [TX + 0.2, yH, zH],
      [TX + 0.22, fy, fz],
      [TX - 0.22, fy, fz],
    ],
    { color: C.tent, thickness: 0.012, bone: flap },
  );
  b.rod([TX - 0.22, fy, fz], [TX + 0.22, fy, fz], 0.012, { color: C.tentTrim, bone: flap, sides: 6, smooth: false });

  // guy ropes and stake pegs
  for (const s of [1, -1]) {
    for (const [z, zPeg, xPeg] of [
      [ZF + 0.03, ZF + 0.6, TX + s * 0.95],
      [ZB - 0.03, ZB - 0.35, TX + s * 0.7],
    ]) {
      const p: V = [TX + s * 0.37, G + 0.5, z];
      const q: V = [xPeg, G + 0.02, zPeg];
      rod(p, q, 0.006, C.rope);
      part(new THREE.ConeGeometry(0.016, 0.08, 4), C.peg, [q[0], G + 0.04, q[2]]);
    }
  }

  // ---- bedroll on a pad, in front of the door -----------------------------
  const BX = -1.0;
  const BZ = 0.5;
  const bagY = G + 0.03 + 0.12;
  part(new THREE.BoxGeometry(0.76, 0.03, 0.5), C.pad, [BX, G + 0.015, BZ]);
  part(new THREE.CylinderGeometry(0.12, 0.12, 0.72, 8), C.bag, [BX, bagY, BZ], [1, 0, 0]);
  for (const s of [1, -1]) {
    part(new THREE.CylinderGeometry(0.105, 0.105, 0.012, 8), C.lining, [BX + s * 0.36, bagY, BZ], [1, 0, 0]);
  }
  for (const k of [-0.22, 0, 0.22]) {
    part(new THREE.CylinderGeometry(0.127, 0.127, 0.02, 8), C.strap, [BX + k, bagY, BZ], [1, 0, 0]);
    part(new THREE.BoxGeometry(0.03, 0.02, 0.03), C.buckle, [BX + k, bagY + 0.128, BZ]);
  }
  part(new THREE.CylinderGeometry(0.07, 0.07, 0.22, 7), C.sack, [BX, G + 0.07, BZ + 0.33], [1, 0, 0]);

  // ---- rucksack leaning out by the tent wall --------------------------------
  const PX = -2.05;
  const PZ = -1.0;
  const bagOutline: OutlinePoint[] = [
    [-0.14, 0],
    [0.14, 0],
    [0.15, 0.3],
    [0.12, 0.46, "sharp"],
    [-0.12, 0.46, "sharp"],
    [-0.15, 0.3],
  ];
  b.extrude(bagOutline, {
    at: [PX, G, PZ],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.18,
    bevel: 0.03,
    color: C.pack,
    bone: root,
  });
  b.slab(
    [
      [PX - 0.13, G + 0.3, PZ + 0.1],
      [PX + 0.13, G + 0.3, PZ + 0.1],
      [PX + 0.13, G + 0.42, PZ + 0.1],
      [PX, G + 0.45, PZ + 0.1],
      [PX - 0.13, G + 0.42, PZ + 0.1],
    ],
    { color: C.packFlap, thickness: 0.02, bone: root },
  );
  part(new THREE.BoxGeometry(0.2, 0.12, 0.04), C.packFlap, [PX, G + 0.14, PZ + 0.1]);
  part(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 7), C.foam, [PX, G + 0.49, PZ - 0.02], [1, 0, 0]);

  // ---- tin bucket of water by the tripod ----------------------------------
  const BKX = -0.25;
  const BKZ = 0.95;
  part(new THREE.CylinderGeometry(0.1, 0.08, 0.18, 8), C.tin, [BKX, G + 0.09, BKZ]);
  part(new THREE.CylinderGeometry(0.095, 0.095, 0.01, 8), C.water, [BKX, G + 0.15, BKZ]);
  b.sweep(arc([BKX, G + 0.18, BKZ], [BKX - 0.1, G + 0.18, BKZ], [0, 0, -1], 180), 0.005, {
    color: C.steel,
    bone: root,
    sides: 6,
    smooth: false,
    detail: 0.5,
  });

  // ---- campfire ring -----------------------------------------------------
  const stoneCols = [C.stoneA, C.stoneB, C.stoneC, C.moss, C.stoneA, C.stoneB, C.stoneC, C.stoneB, C.stoneA, C.stoneC];
  const stoneDeg = [75, 100, 125, 190, 215, 240, 310, 335, 0, 22];
  stoneDeg.forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const r = 0.085 + 0.04 * rnd();
    part(
      new THREE.IcosahedronGeometry(r, 0).scale(1, 0.7, 1.15).rotateY(rnd() * Math.PI),
      stoneCols[i],
      [F0 + 0.44 * Math.cos(a), G + 0.5 * r, F2 + 0.44 * Math.sin(a)],
    );
  });

  // crossed base logs and a teepee of kindling
  log([F0, G + 0.05, F2], [1, 0, 0], 0.46, 0.045, C.barkDark);
  log([F0, G + 0.095, F2], [0, 0, 1], 0.42, 0.04, C.barkDark);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.25;
    rod([F0 + 0.17 * Math.cos(a), G + 0.03, F2 + 0.17 * Math.sin(a)], [F0, G + 0.36, F2], 0.014, i % 2 ? C.wood : C.woodDark);
  }

  // flames: a stack of faceted cones, lean-out tongues and drifting embers, all self-lit
  const fireY = G + 0.1;
  glow(part(new THREE.ConeGeometry(0.15, 0.36, 5), C.flameOut, [F0, fireY + 0.18, F2]), 1.1);
  glow(part(new THREE.ConeGeometry(0.1, 0.28, 5), C.flameMid, [F0 + 0.01, fireY + 0.14, F2 - 0.01]), 1.3);
  glow(part(new THREE.ConeGeometry(0.05, 0.2, 4), C.flameCore, [F0, fireY + 0.1, F2]), 1.5);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.6;
    const lean: V = [Math.cos(a) * 0.35, 1, Math.sin(a) * 0.35];
    glow(part(new THREE.ConeGeometry(0.05, 0.2, 4), C.flameOut, [F0 + 0.1 * Math.cos(a), fireY + 0.11, F2 + 0.1 * Math.sin(a)], lean), 1.1);
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const r = 0.14 + 0.03 * rnd();
    glow(part(new THREE.IcosahedronGeometry(0.014, 0), C.ember, [F0 + r * Math.cos(a), G + 0.12 + 0.18 * rnd(), F2 + r * Math.sin(a)]), 1.6);
  }

  // ---- tripod, hook, pot ---------------------------------------------------
  const apex: V = [F0, 1.0, F2];
  const feet: V[] = [45, 165, 285].map((deg) => {
    const a = (deg * Math.PI) / 180;
    return [F0 + 0.62 * Math.cos(a), G, F2 + 0.62 * Math.sin(a)];
  });
  for (const f of feet) rod(f, apex, 0.018, C.woodDark);
  const knots: V[] = [];
  for (const f of feet) {
    knots.push([f[0] + (apex[0] - f[0]) * 0.4, f[1] + (apex[1] - f[1]) * 0.4, f[2] + (apex[2] - f[2]) * 0.4]);
  }
  for (let i = 0; i < 3; i++) rod(knots[i], knots[(i + 1) % 3], 0.008, C.woodDark);
  part(new THREE.TorusGeometry(0.03, 0.008, 4, 8), C.steel, [F0, 0.985, F2]);

  const yP = G + 0.39; // pot bottom, just above the flames
  const potProfile: OutlinePoint[] = [
    [0, 0],
    [0.105, 0],
    [0.125, 0.025],
    [0.136, 0.12],
    [0.14, 0.18, "sharp"],
    [0.128, 0.18, "sharp"],
    [0.122, 0.12],
    [0.113, 0.03],
    [0, 0.03],
  ];
  b.lathe(potProfile, { at: [F0, yP, F2], axis: [0, 1, 0], segments: 10, color: C.pot, bone: root });
  part(new THREE.CylinderGeometry(0.1425, 0.1425, 0.022, 10), C.potRed, [F0, yP + 0.165, F2]);

  // lid on a back hinge at the rim
  const lid = b.joint("potLid", { parent: root, at: [F0, yP + 0.18, F2 - 0.14], role: "hinge", group: "pot" });
  const lidProfile: OutlinePoint[] = [
    [0, 0],
    [0.14, 0],
    [0.14, 0.01],
    [0.12, 0.025],
    [0.06, 0.04],
    [0, 0.046],
  ];
  b.lathe(lidProfile, { at: [F0, yP + 0.18, F2], axis: [0, 1, 0], segments: 10, color: C.lid, bone: lid });
  b.part(new THREE.IcosahedronGeometry(0.022, 0), C.potRed, { bone: lid, at: [F0, yP + 0.23, F2], flat: true });

  // wire bail with lugs, hooked to the tripod apex
  const yLug = yP + 0.13;
  for (const s of [1, -1]) part(new THREE.BoxGeometry(0.03, 0.04, 0.03), C.steel, [F0 + s * 0.15, yLug, F2]);
  b.sweep(arc([F0, yLug, F2], [F0 - 0.17, yLug, F2], [0, 0, -1], 180), 0.007, {
    color: C.steel,
    bone: root,
    sides: 6,
    smooth: false,
    detail: 0.5,
  });
  rod([F0, 0.96, F2], [F0, yLug + 0.17, F2], 0.008, C.steel);
  // wooden spoon standing in the pot
  rod([F0 - 0.03, yP + 0.05, F2 + 0.03], [F0 - 0.1, 0.84, F2 - 0.08], 0.01, C.wood);

  // ---- log seats and woodpile ----------------------------------------------
  log([F0, G + 0.13, F2 + 0.9], [1, 0, 0], 0.6, 0.13);
  log([F0 + 0.9, G + 0.13, F2], [0, 0, 1], 0.6, 0.13);
  part(new THREE.IcosahedronGeometry(0.02, 0).scale(1, 0.5, 1), C.barkDark, [F0 + 0.15, G + 0.25, F2 + 0.9]);
  part(new THREE.IcosahedronGeometry(0.02, 0).scale(1, 0.5, 1), C.barkDark, [F0 + 0.9, G + 0.25, F2 - 0.15]);

  const SX = 1.5;
  const SZ = -0.6;
  for (const x of [-0.21, -0.07, 0.07, 0.21]) log([SX + x, G + 0.07, SZ], [0, 0, 1], 0.6, 0.07);
  for (const x of [-0.14, 0, 0.14]) log([SX + x, G + 0.19, SZ], [0, 0, 1], 0.6, 0.07);
  for (const x of [-0.07, 0.07]) log([SX + x, G + 0.31, SZ], [0, 0, 1], 0.6, 0.07);
  log([SX, G + 0.07, SZ + 0.45], [1, 0, 0], 0.5, 0.07);

  // lantern standing on the loose log
  const LX = SX - 0.1;
  const LZ = SZ + 0.45;
  const LY = G + 0.14;
  part(new THREE.BoxGeometry(0.09, 0.012, 0.09), C.steel, [LX, LY + 0.006, LZ]);
  for (const sx of [1, -1]) {
    for (const sz of [1, -1]) {
      part(new THREE.BoxGeometry(0.012, 0.1, 0.012), C.steel, [LX + sx * 0.035, LY + 0.06, LZ + sz * 0.035]);
    }
  }
  glow(part(new THREE.BoxGeometry(0.05, 0.085, 0.05), C.glass, [LX, LY + 0.06, LZ]), 1.4);
  part(new THREE.ConeGeometry(0.062, 0.04, 4).rotateY(Math.PI / 4), C.steel, [LX, LY + 0.12, LZ]);

  // ---- chopping stump and axe ----------------------------------------------
  const UX = 1.15;
  const UZ = 0.95;
  part(new THREE.CylinderGeometry(0.17, 0.19, 0.4, 8), C.stump, [UX, G + 0.2, UZ]);
  part(new THREE.CylinderGeometry(0.165, 0.165, 0.01, 8), C.stumpTop, [UX, G + 0.405, UZ]);
  rod([UX - 0.02, G + 0.3, UZ], [UX - 0.1, G + 0.95, UZ - 0.2], 0.018, C.handle);
  const axeHead: OutlinePoint[] = [
    [-0.04, 0.02],
    [0.02, 0.1],
    [0.1, 0.1],
    [0.14, 0.06, "sharp"],
    [0.13, -0.05, "sharp"],
    [0.02, -0.06],
    [-0.04, -0.03],
  ];
  b.extrude(axeHead, {
    at: [UX - 0.04, G + 0.44, UZ],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.03,
    color: C.axeSteel,
    bone: root,
  });

  // ---- stones, grass, rocks ----------------------------------------------------
  const rock = (x: number, z: number, r: number) =>
    part(new THREE.IcosahedronGeometry(r, 0).scale(1, 0.7, 1.1), C.stoneB, [x, G + 0.35 * r, z]);
  rock(1.6, 0.4, 0.15);
  rock(-2.0, 0.1, 0.12);
  rock(1.85, -1.6, 0.16);
  rock(0.3, -2.3, 0.13);

  const tuft = (x: number, z: number) => {
    for (let i = 0; i < 3; i++) {
      const a = rnd() * Math.PI * 2;
      const lean = 0.35 + rnd() * 0.3;
      const h = 0.12 + rnd() * 0.06;
      part(
        new THREE.ConeGeometry(0.03, h, 4),
        i === 1 ? C.grassLight : C.grassDark,
        [x + 0.03 * Math.cos(a), G + h / 2 - 0.005, z + 0.03 * Math.sin(a)],
        [Math.cos(a) * lean, 1, Math.sin(a) * lean],
      );
    }
    if (rnd() < 0.5) {
      const flowers = [C.flowerY, C.flowerW, C.flowerP];
      part(new THREE.IcosahedronGeometry(0.022, 0), flowers[Math.floor(rnd() * 3)], [x, G + 0.012, z]);
    }
  };
  for (let i = 0; i < 30; i++) {
    const a = rnd() * Math.PI * 2;
    const k = Math.sqrt(rnd()) * 0.92;
    const x = -0.2 + 2.4 * k * Math.cos(a);
    const z = -0.7 + 2.4 * k * Math.sin(a);
    if (Math.abs(x - TX) < 1.0 && z > ZB - 0.6 && z < ZF + 0.7) continue; // tent
    if (Math.hypot(x - F0, z - F2) < 0.8) continue; // fire
    if (x > 1.0 && z < 1.4 && z > -1.0) continue; // woodpile, seat and stump
    if (x < -0.5 && x > -1.5 && z > 0.1 && z < 0.9) continue; // bedroll
    if (x < -1.7 && z > -1.3 && z < -0.7) continue; // rucksack
    tuft(x, z);
  }

  return b.root;
}
