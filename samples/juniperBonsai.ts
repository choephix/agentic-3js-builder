import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { offset, rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import type { Path } from "../src/path";
import { cells, countershade, grain, mix, mottle, noise, paint, smoothstep } from "../src/paint";
import type { Paint } from "../src/paint";
import { svg } from "../src/texture";
import type { Joint } from "../src/skeleton";

export const meta = {
  name: "Juniper Bonsai",
  builtBy: "Claude Opus 5.5",
  description:
    "A 45 cm juniper bonsai with spiralling deadwood and cloud-pruned foliage pads in a cobalt nama-glazed pot, rigged through trunk and branches to sway.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette

const COBALT_DEEP = "#16264f";
const COBALT = "#24407a";
const RUN_BLUE = "#6f9fc0";
const RUN_PALE = "#d9e3dc";
const CLAY = "#8a5a3c";
const CLAY_DARK = "#6b4029";
const SOIL = "#3a2a1f";
const SOIL_LIGHT = "#5e4632";
const MOSS = "#56752b";
const MOSS_LIGHT = "#86a23c";
const BARK = "#7b4430";
const BARK_DARK = "#4a261a";
const BARK_LIGHT = "#a26a4b";
const DEAD = "#ece6d8";
const DEAD_GREY = "#aaa393";
const JUN_DARK = "#1f3d22";
const JUN_MID = "#2f5a2e";
const JUN_SHADOW = "#1c3822";
const COPPER = "#b86a36";

// ---------------------------------------------------------------------------------------------------------------
// Pot dimensions (meters)

const FOOT_H = 0.012;
const BODY_TOP = 0.078;
const BODY_BOTTOM_SIZE = [0.33, 0.225] as const;
const BODY_TOP_SIZE = [0.355, 0.245] as const;
const RIM_Y = 0.08;
const RIM_R = [0.009, 0.0065] as const;
const RIM_TOP = RIM_Y + RIM_R[1];
const SOIL_Y = 0.0815;

/** Half extents of the pot body at height y. */
function bodyHalf(y: number): [number, number] {
  const t = (y - FOOT_H) / (BODY_TOP - FOOT_H);
  return [
    (BODY_BOTTOM_SIZE[0] + (BODY_TOP_SIZE[0] - BODY_BOTTOM_SIZE[0]) * t) / 2,
    (BODY_BOTTOM_SIZE[1] + (BODY_TOP_SIZE[1] - BODY_BOTTOM_SIZE[1]) * t) / 2,
  ];
}

/** A closed rectangle with chamfered corners at height y. */
function rectLoop(hx: number, hz: number, y: number, c: number): Path {
  return polyline(
    [
      [hx - c, y, hz],
      [hx, y, hz - c],
      [hx, y, -hz + c],
      [hx - c, y, -hz],
      [-hx + c, y, -hz],
      [-hx, y, -hz + c],
      [-hx, y, hz - c],
      [-hx + c, y, hz],
    ],
    { closed: true },
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Paints

/** Nama glaze: deep cobalt with pale runs flowing from the rim, pooling dark at the base, unglazed clay foot. */
const glaze = paint((p) => {
  const footLine = FOOT_H + 0.005 + 0.003 * noise(p, 0.02, 41);
  if (p.y < footLine) return mix(CLAY, CLAY_DARK, noise(p, 0.01, 42));
  const streak = new THREE.Vector3(p.x, 0, p.z);
  const run = 0.012 + 0.05 * smoothstep(0.5, 0.8, noise(streak, 0.012, 3)) ** 1.5;
  const depth = RIM_TOP - p.y;
  const pale = 1 - smoothstep(run * 0.55, run, depth);
  const deep = mix(COBALT_DEEP, COBALT, noise(p, 0.035, 5));
  const runColor = mix(RUN_BLUE, RUN_PALE, smoothstep(run * 0.8, 0, depth) * noise(p, 0.02, 9) * 1.4);
  let c = mix(deep, runColor, pale);
  // Glaze pools thick and dark just above the foot.
  c = mix(c, COBALT_DEEP, (1 - smoothstep(0, 0.012, p.y - footLine)) * 0.7);
  // Fine crackle in the pale run.
  const crackle = cells(p, 0.009, 13);
  if (pale > 0.4 && crackle.d2 - crackle.d1 < 0.06) c = mix(c, "#4f6f83", 0.35);
  // Iron speckles.
  if (noise(p, 0.0025, 17) > 0.8) c = mix(c, "#0b1020", 0.7);
  return c;
});

const soil = paint((p) => {
  const ground = mix(SOIL, SOIL_LIGHT, noise(p, 0.006, 51));
  const moss = mix(MOSS, MOSS_LIGHT, noise(p, 0.012, 52));
  return mix(ground, moss, smoothstep(0.45, 0.55, noise(p, 0.05, 7)));
});

/** Trunk: stringy red-brown live veins that spiral up the trunk, and a silver shari (deadwood) band twisting with them. */
const SHARI_A0 = -0.6;
const SHARI_TWIST = 11; // radians per meter of height
const trunkBark = paint((p, n) => {
  const phi = Math.atan2(n.x, n.z);
  const fibre = Math.sin(phi * 9 + p.y * SHARI_TWIST * 9 + 4 * noise(p, 0.02, 21));
  const theta = SHARI_A0 + SHARI_TWIST * p.y;
  const facing = Math.cos(phi - theta);
  const rise = smoothstep(SOIL_Y, SOIL_Y + 0.04, p.y);
  const open = 1 - (0.25 + 0.3 * rise) + 0.35 * (noise(p, 0.025, 22) - 0.5);
  const edge = facing - open;
  if (edge > 0.03) return mix(DEAD, DEAD_GREY, smoothstep(0.2, 1, fibre) * 0.75 + 0.2 * noise(p, 0.01, 23));
  if (edge > -0.05) return BARK_DARK;
  const flake = noise(p, 0.012, 24);
  return mix(mix(BARK, BARK_LIGHT, smoothstep(0.55, 0.8, flake)), BARK_DARK, smoothstep(0.3, 1, fibre) * 0.8);
});

const branchBark = (dir: THREE.Vector3) =>
  grain(mix(BARK, BARK_LIGHT, 0.25), BARK_DARK, { size: 0.004, axis: [dir.x, dir.y, dir.z], seed: 31 });

const foliage = countershade(mottle(JUN_MID, JUN_DARK, { size: 0.025, seed: 61 }), JUN_SHADOW, { level: -0.45 });
const sprayTint: Paint = countershade(mottle("#ffffff", "#c2d494", { size: 0.035, seed: 62 }), "#83967a", {
  level: -0.25,
  soft: 0.5,
});

// ---------------------------------------------------------------------------------------------------------------
// Drawings

/** A juniper spray: fronds of overlapping scale-leaves fanning from one stem, lighter at the growing tips. */
function sprayTexture(seed: number) {
  const r = rng(seed);
  const W = 40;
  const H = 64;
  const shades = ["#27492a", "#33602f", "#3f7436", "#5a8f3f", "#8ab656"];
  let body = `<path d="M20 64 L20 50" stroke="#5a3624" stroke-width="2.4"/>`;
  const fronds = 5;
  for (let f = 0; f < fronds; f++) {
    const ang = -0.62 + (1.24 * f) / (fronds - 1) + (r() - 0.5) * 0.25;
    const len = 44 + 14 * r() - 12 * Math.abs(ang);
    const curl = (r() - 0.5) * 0.5;
    const steps = 13;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a = ang + curl * t;
      const x = 20 + Math.sin(a) * len * t;
      const y = 62 - Math.cos(a) * len * t;
      const rad = 5.2 * (1 - t) + 1.4;
      const shade = shades[Math.min(shades.length - 1, Math.floor(t * 3.2 + r() * 1.6))];
      const deg = (a * 180) / Math.PI;
      body += `<ellipse cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" rx="${rad.toFixed(2)}" ry="${(rad * 1.45).toFixed(2)}" transform="rotate(${deg.toFixed(1)} ${x.toFixed(2)} ${y.toFixed(2)})" fill="${shade}"/>`;
      // A small side scale on alternate steps gives the frond its feathery edge.
      if (i % 2 === 1 && t < 0.85) {
        const side = i % 4 === 1 ? 1 : -1;
        const sx = x + Math.cos(a) * side * rad * 1.1;
        const sy = y + Math.sin(a) * side * rad * 1.1;
        body += `<ellipse cx="${sx.toFixed(2)}" cy="${sy.toFixed(2)}" rx="${(rad * 0.6).toFixed(2)}" ry="${(rad * 0.9).toFixed(2)}" transform="rotate(${(deg + side * 35).toFixed(1)} ${sx.toFixed(2)} ${sy.toFixed(2)})" fill="${shades[Math.min(4, Math.floor(t * 3) + 1)]}"/>`;
      }
    }
  }
  return svg(`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`, { size: 256 });
}

/** A cushion of moss with a few fruiting stalks. */
function mossTexture() {
  const r = rng(71);
  let body = "";
  for (let i = 0; i < 26; i++) {
    const x = 3 + r() * 26;
    const y = 24 - r() * 9;
    const rad = 1.6 + r() * 2.2;
    const shade = ["#45652a", "#5b7e2f", "#789b3a", "#9ab84a"][Math.floor(r() * 4)];
    body += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${rad.toFixed(2)}" fill="${shade}"/>`;
  }
  for (let i = 0; i < 2; i++) {
    const x = 7 + r() * 18;
    const top = 3 + r() * 6;
    body += `<path d="M${x.toFixed(1)} 20 Q${(x + 1.5).toFixed(1)} 12 ${(x + 0.5).toFixed(1)} ${top.toFixed(1)}" stroke="#6b5a2e" stroke-width="0.6" fill="none"/>`;
    body += `<ellipse cx="${(x + 0.5).toFixed(1)}" cy="${top.toFixed(1)}" rx="0.7" ry="1.2" fill="#8f6a2c"/>`;
  }
  return svg(`<svg viewBox="0 0 32 24" xmlns="http://www.w3.org/2000/svg">${body}</svg>`, { size: 128 });
}

/** The potter's seal: a red square chop with a carved glyph. */
const SEAL = svg(
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="30" height="30" rx="3" fill="#a3281f"/>
    <rect x="4" y="4" width="24" height="24" rx="1.5" fill="none" stroke="#f3e6d0" stroke-width="1.6"/>
    <path d="M9 9 H23 M16 9 V23 M9 16 H23 M10 23 L14 18 M22 23 L18 18" stroke="#f3e6d0" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "juniperBonsai" });
  const root = b.joint("root", { at: [0, 0, 0] });

  // ---- Pot -----------------------------------------------------------------------------------------------------
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.frustumBox(
        [sx * 0.128, 0, sz * 0.078],
        [sx * 0.128, FOOT_H + 0.004, sz * 0.078],
        [0.05, 0.036],
        [0.056, 0.04],
        {
          bone: root,
          color: glaze,
          name: "potFoot",
        },
      );
  const potBody = b.frustumBox([0, FOOT_H, 0], [0, BODY_TOP, 0], [...BODY_BOTTOM_SIZE], [...BODY_TOP_SIZE], {
    bone: root,
    color: glaze,
    name: "potBody",
  });
  const [rimX, rimZ] = bodyHalf(BODY_TOP);
  b.sweep(rectLoop(rimX + 0.0015, rimZ + 0.0015, RIM_Y, 0.012), (): [number, number] => [RIM_R[0], RIM_R[1]], {
    section: "box",
    bone: root,
    color: glaze,
    name: "potRim",
  });
  // An incised line wrapping the body just under the lip.
  const [bandX, bandZ] = bodyHalf(0.062);
  b.sweep(rectLoop(bandX, bandZ, 0.062, 0.012), 0.0018, { bone: root, color: COBALT_DEEP, name: "potBand", sides: 6 });
  // The potter's seal on the back, near the right-hand corner.
  const sealHit = b.surface(potBody).ray([-0.12, 0.035, 0], [0, 0, -1]);
  if (sealHit)
    b.part(new THREE.PlaneGeometry(0.022, 0.022), "#ffffff", {
      bone: root,
      at: offset(sealHit, sealHit.n, 0.0006),
      dir: sealHit.n,
      axis: "z",
      up: [0, 1, 0],
      texture: SEAL,
      name: "potSeal",
    });

  // ---- Soil ----------------------------------------------------------------------------------------------------
  const soilTop = b.frustumBox(
    [0, 0.07, 0],
    [0, SOIL_Y, 0],
    [rimX * 2 - 0.02, rimZ * 2 - 0.02],
    [rimX * 2 - 0.02, rimZ * 2 - 0.02],
    {
      bone: root,
      color: soil,
      name: "soil",
    },
  );

  // ---- Trunk ---------------------------------------------------------------------------------------------------
  const trunkPath = catmull([
    [-0.045, 0.066, -0.005],
    [-0.035, 0.12, 0.012],
    [-0.068, 0.19, 0.0],
    [-0.03, 0.26, -0.012],
    [-0.05, 0.325, 0.006],
    [-0.028, 0.375, 0.0],
  ]);
  const trunk = b.chain("trunk", trunkPath, { parent: root, count: 5, role: "spine" });
  // Tapering from a flared base, with a lumpy, uneven section like old juniper wood.
  const trunkTube = b.sweep(
    trunk,
    (t) => {
      const r = 0.012 + 0.024 * (1 - t) ** 1.25 + 0.02 * Math.max(0, 1 - t / 0.14) ** 2;
      return [r * (1 + 0.13 * Math.sin(t * 19 + 1)), r * (1 + 0.13 * Math.cos(t * 15))];
    },
    { color: trunkBark, sides: 10, caps: { start: "flat", end: "round" } },
  );
  const trunkSurface = b.surface(trunkTube);

  // Nebari: surface roots spreading over the soil from the trunk's flare.
  const base = trunkPath.at(0.05);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    const out = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const len = 0.05 + 0.025 * ((i * 7) % 3);
    const start = offset(base, out, 0.02).setY(SOIL_Y + 0.008);
    const end = offset(base, out, 0.02 + len).setY(SOIL_Y - 0.002);
    b.sweep(catmull([start, offset(start, out, len * 0.5).setY(SOIL_Y + 0.003), end]), [0.011, 0.003], {
      bone: root,
      color: branchBark(out),
      name: "nebari",
    });
  }

  // ---- Deadwood ------------------------------------------------------------------------------------------------
  // The dead leader, bleached and twisting up out of the crown.
  const top = trunkPath.at(1);
  const jinPath = catmull([top, [-0.01, 0.41, -0.012], [0.004, 0.44, 0.004], [0.024, 0.462, -0.006]]);
  b.sweep(jinPath, [0.009, 0.0015], {
    bone: trunk.joints[4],
    color: grain(DEAD, DEAD_GREY, { size: 0.003, axis: [0.4, 1, 0], seed: 33 }),
    caps: { start: "flat", end: "point" },
    name: "jinTop",
  });
  // A broken lower branch left as a jin.
  const stubHit = trunkSurface.nearest(offset(trunkPath.at(0.22), [-1, -0.2, 0.3], 0.1));
  b.sweep(
    catmull([stubHit, offset(stubHit, [-1, 0.1, 0.2], 0.03), offset(stubHit, [-1, 0.5, 0.1], 0.055)]),
    [0.006, 0.0012],
    {
      color: grain(DEAD, DEAD_GREY, { size: 0.003, axis: [-1, 0.3, 0], seed: 33 }),
      caps: { start: "flat", end: "point" },
      name: "jinLow",
    },
  );

  // ---- Branches and foliage pads -------------------------------------------------------------------------------
  const sprays = [sprayTexture(101), sprayTexture(202), sprayTexture(303)];
  const padRng = rng(404);

  /** A cloud-pruned pad: a flattened dome with smaller domes around it, coated in spray cards flowing outward. */
  const pad = (
    bone: Joint,
    from: THREE.Vector3,
    center: [number, number, number],
    size: [number, number, number],
    outward: THREE.Vector3,
    seed: number,
  ) => {
    const r = rng(seed);
    const [rx, ry, rz] = size;
    const sphere = new THREE.SphereGeometry(1, 8, 6);
    const blobs = [b.part(sphere, foliage, { bone, at: center, scale: [rx, ry, rz], name: "pad" })];
    const side = new THREE.Vector3(-outward.z, 0, outward.x);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + r() * 1.2;
      const off = side
        .clone()
        .multiplyScalar(Math.cos(a) * rx * 0.62)
        .addScaledVector(outward, Math.sin(a) * rz * 0.62);
      const s = 0.5 + 0.18 * r();
      const blobAt: [number, number, number] = [
        center[0] + off.x,
        center[1] + ry * (0.05 + 0.15 * r()),
        center[2] + off.z,
      ];
      blobs.push(b.part(sphere, foliage, { bone, at: blobAt, scale: [rx * s, ry * (s + 0.15), rz * s], name: "pad" }));
      // A branchlet from the branch into each dome, seen from below.
      b.rod(from, [blobAt[0], blobAt[1] - ry * 0.35, blobAt[2]], [0.0032, 0.0015], {
        bone,
        color: branchBark(outward),
        name: "twig",
      });
    }
    const hits = b.surface(blobs).scatter(Math.round(rx * rz * 19000), {
      rng: padRng,
      minDist: 0.0105,
      filter: (h) => h.n.y > -0.55,
    });
    b.cards(hits, sprays, {
      size: [0.028, 0.04],
      lean: 55,
      bend: 25,
      flow: [outward.x, 0.35, outward.z],
      vary: 0.25,
      spin: 40,
      rng: padRng,
      color: sprayTint,
      name: "spray",
    });
  };

  type BranchSpec = {
    name: string;
    t: number;
    out: [number, number, number];
    path: [number, number, number][];
    r0: number;
    tipPad: [number, number, number];
    midPad?: [number, number, number];
    /** Wrapped in copper training wire. */
    wired?: boolean;
  };
  const branches: BranchSpec[] = [
    {
      name: "branchLowL",
      t: 0.3,
      out: [1, 0, 0.2],
      path: [
        [0.05, 0.155, 0.03],
        [0.13, 0.15, 0.045],
        [0.19, 0.172, 0.05],
      ],
      r0: 0.012,
      tipPad: [0.092, 0.03, 0.074],
      midPad: [0.05, 0.022, 0.045],
      wired: true,
    },
    {
      name: "branchMidR",
      t: 0.45,
      out: [-1, 0, 0.1],
      path: [
        [-0.12, 0.212, 0.02],
        [-0.175, 0.222, 0.035],
        [-0.225, 0.245, 0.03],
      ],
      r0: 0.011,
      tipPad: [0.085, 0.028, 0.07],
      midPad: [0.05, 0.022, 0.045],
    },
    {
      name: "branchBack",
      t: 0.55,
      out: [0.3, 0, -1],
      path: [
        [-0.01, 0.255, -0.07],
        [0.04, 0.275, -0.115],
      ],
      r0: 0.009,
      tipPad: [0.08, 0.03, 0.065],
    },
    {
      name: "branchFront",
      t: 0.64,
      out: [0.2, 0, 1],
      path: [
        [-0.02, 0.29, 0.07],
        [0.005, 0.3, 0.105],
      ],
      r0: 0.007,
      tipPad: [0.05, 0.022, 0.045],
    },
    {
      name: "branchHighL",
      t: 0.74,
      out: [1, 0, 0],
      path: [
        [0.03, 0.312, 0.025],
        [0.105, 0.33, 0.03],
      ],
      r0: 0.008,
      tipPad: [0.068, 0.026, 0.056],
    },
    {
      name: "branchHighR",
      t: 0.84,
      out: [-1, 0, 0.3],
      path: [
        [-0.1, 0.34, 0.03],
        [-0.145, 0.352, 0.05],
      ],
      r0: 0.007,
      tipPad: [0.058, 0.025, 0.05],
    },
  ];

  branches.forEach((spec, i) => {
    const hit = trunkSurface.nearest(offset(trunkPath.at(spec.t), spec.out, 0.1));
    const outward = new THREE.Vector3(spec.out[0], 0, spec.out[2]).normalize();
    const { chain, sweep } = b.sprout(spec.name, hit, catmull([hit, ...spec.path]), [spec.r0, spec.r0 * 0.35], {
      count: 3,
      role: "tentacle",
      color: branchBark(outward),
      caps: { end: "round" },
    });
    const joints = chain!.joints;
    const tip = new THREE.Vector3(...spec.path[spec.path.length - 1]);
    pad(joints[2], tip, [tip.x, tip.y + spec.tipPad[1] * 0.4, tip.z], spec.tipPad, outward, 500 + i);
    if (spec.midPad) {
      const at = sweep.at(0.5).at;
      pad(
        joints[1],
        at,
        [at.x - outward.z * 0.03, at.y + 0.022, at.z + outward.x * 0.03],
        spec.midPad,
        outward,
        600 + i,
      );
    }
    if (spec.wired) {
      // Six turns of wire coiled on the bark, one point every 45°, bending with the branch.
      const coil = Array.from({ length: 49 }, (_, k) => {
        const t = sweep.from + (sweep.to - sweep.from) * (0.06 + (0.6 * k) / 48);
        return sweep.at(t, (k * 45) % 360, 0.0015).at;
      });
      b.sweep(catmull(coil), 0.0015, { bone: chain!, color: COPPER, sides: 6, name: "trainingWire" });
    }
  });

  // The crown pad around the dead leader.
  pad(
    trunk.joints[4],
    top,
    [-0.05, 0.392, 0.018],
    [0.085, 0.036, 0.07],
    new THREE.Vector3(-0.5, 0, 0.8).normalize(),
    700,
  );

  // ---- Moss and pebbles on the soil ----------------------------------------------------------------------------
  const soilSurface = b.surface(soilTop);
  const trunkBase = new THREE.Vector3(base.x, SOIL_Y, base.z);
  const mossHits = soilSurface.scatter(260, {
    rng: rng(801),
    minDist: 0.009,
    filter: (h) => h.n.y > 0.9 && noise(h.at, 0.05, 7) > 0.52 && h.at.distanceTo(trunkBase) > 0.045,
  });
  b.cards(mossHits, mossTexture(), {
    size: [0.016, 0.012],
    cross: true,
    vary: 0.3,
    spin: 90,
    rng: rng(802),
    bone: root,
    name: "moss",
  });
  const pebbleRng = rng(901);
  const pebbles = soilSurface.scatter(26, {
    rng: rng(902),
    minDist: 0.02,
    filter: (h) => h.n.y > 0.9 && noise(h.at, 0.05, 7) < 0.45 && h.at.distanceTo(trunkBase) > 0.05,
  });
  const pebble = new THREE.SphereGeometry(1, 5, 4);
  for (const hit of pebbles) {
    const s = 0.004 + 0.004 * pebbleRng();
    b.stick(pebble, ["#8d8579", "#6f6a62", "#a89a86"][Math.floor(pebbleRng() * 3)], hit, {
      bone: root,
      scale: [s * 1.3, s * 0.7, s],
      spin: pebbleRng() * 180,
      embed: 0.35,
      name: "pebble",
    });
  }

  return b.root;
}
