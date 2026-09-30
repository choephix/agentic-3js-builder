import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { rng } from "../src/math";
import { gradient, grain, paint, patches } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Blacksmith's Forge · Kimi",
  builtBy: "Kimi K3",
  description:
    "A tabletop blacksmith's forge diorama on a timber plinth: a stone forge with glowing coals, flames and a smoking chimney, a leather bellows with a pumping top board, a steel anvil on a tree stump carrying a half-forged glowing sword, a quench barrel, a tool rack with hammers and tongs, a workbench, horseshoes, a firewood pile, a standing lantern and a swinging shop sign.",
};

// --- palette -------------------------------------------------------------
const PLINTH = "#33241a";
const WOOD = "#6b4a2f";
const WOOD_D = "#4e3421";
const WOOD_BENCH = "#7a5a38";
const SPLIT = "#b08a5c";
const BARK = "#3c2a1a";
const BARK_L = "#57402a";
const IRON = "#23252a";
const STEEL = "#8d97a5";
const STEEL_D = "#4c525b";
const BRASS = "#c39a4a";
const LEATHER = "#7a4326";
const LEATHER_D = "#4f2c15";
const COAL = "#201a15";
const RECESS = "#120e0b";
const EMBER_O = "#ff8c1a";
const EMBER_Y = "#ffd95e";
const LANTERN_GLOW = "#ffbe5a";
const WATER = "#223c44";
const SMOKE = "#c8c8c8";

const FLOOR = 0.1; // top of the flagstone slab

export default function build() {
  const b = createBuilder({ name: "blacksmithForgeKimi", paintSize: 1024 });
  const R = rng(7);

  const root = b.joint("root", { at: [0, 0, 0] });

  // --- base: feet, plinth, flagstone slab --------------------------------
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.part(new THREE.BoxGeometry(0.14, 0.025, 0.14), PLINTH, {
        at: [sx * 0.62, 0.0125, sz * 0.38],
        name: "foot",
      });
  b.part(new THREE.BoxGeometry(1.5, 0.06, 1.0), grain(PLINTH, "#453122", { size: 0.09, axis: "x", seed: 2 }), {
    at: [0, 0.05, 0],
    name: "plinth",
  });
  const flags = patches("#4a463f", ["#6e6a60", "#77716a", "#625d54"], { size: 0.17, seed: 11 });
  b.part(new THREE.BoxGeometry(1.42, 0.02, 0.92), flags, { at: [0, 0.09, 0], name: "flagstones" });

  // --- stone forge ---------------------------------------------------------
  const stone = patches("#4c4842", ["#6b655c", "#746d63", "#5d574e"], { size: 0.1, seed: 4 });
  b.part(new THREE.BoxGeometry(0.5, 0.4, 0.4), stone, { at: [-0.44, FLOOR + 0.2, -0.26], name: "forgeBody" });
  b.part(new THREE.BoxGeometry(0.54, 0.04, 0.44), stone, { at: [-0.44, FLOOR + 0.42, -0.26], name: "forgeTop" });
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.09, 0.26, 0.12), stone, {
      at: [-0.44 + s * 0.18, FLOOR + 0.13, -0.05],
      name: "jamb",
    });
  b.part(new THREE.BoxGeometry(0.46, 0.09, 0.12), stone, { at: [-0.44, FLOOR + 0.275, -0.05], name: "lintel" });
  b.part(new THREE.BoxGeometry(0.3, 0.2, 0.06), RECESS, { at: [-0.44, FLOOR + 0.11, -0.075], name: "firebox" });
  glow(
    b.part(new THREE.PlaneGeometry(0.26, 0.15), "#d94f10", {
      at: [-0.44, FLOOR + 0.11, -0.0435],
      dir: [0, 0, 1],
      axis: "z",
      name: "fireboxGlow",
    }),
    0.9,
  );
  b.part(new THREE.BoxGeometry(0.44, 0.03, 0.18), stone, { at: [-0.44, FLOOR + 0.015, 0.02], name: "hearth" });
  b.frustumBox([-0.44, 0.52, -0.33], [-0.44, 1.02, -0.33], [0.3, 0.26], [0.2, 0.18], {
    color: stone,
    name: "chimney",
  });
  b.part(new THREE.BoxGeometry(0.26, 0.05, 0.24), stone, { at: [-0.44, 1.045, -0.33], name: "chimneyCap" });

  // smoke puffs, overlapping so the column stays connected
  const puffs: [number, number, number, number][] = [
    [0, 1.06, 0, 0.05],
    [0.03, 1.13, -0.01, 0.065],
    [-0.005, 1.21, 0.01, 0.078],
    [0.05, 1.3, -0.005, 0.09],
  ];
  for (const [dx, y, dz, r] of puffs)
    b.part(new THREE.SphereGeometry(r, 8, 6), SMOKE, {
      at: [-0.44 + dx, y, -0.33 + dz],
      scale: [1, 0.78, 1],
      flat: true,
      name: "smoke",
    });

  // --- coals and flames ----------------------------------------------------
  for (let i = 0; i < 12; i++) {
    const x = -0.44 + (R() - 0.5) * 0.2;
    const z = -0.01 + (R() - 0.5) * 0.1;
    const r = 0.018 + R() * 0.014;
    const y = FLOOR + 0.026 + R() * 0.024;
    if (i % 3 === 0)
      glow(b.part(new THREE.IcosahedronGeometry(r, 0), i === 0 ? EMBER_Y : EMBER_O, { at: [x, y, z], flat: true, name: "hotCoal" }), i === 0 ? 2.2 : 1.6);
    else b.part(new THREE.IcosahedronGeometry(r, 0), COAL, { at: [x, y, z], flat: true, name: "coal" });
  }
  const flames: [number, number, number, number, string, number][] = [
    [-0.48, 0.03, 0.12, 0.04, EMBER_O, 1.7],
    [-0.4, -0.02, 0.11, 0.036, EMBER_O, 1.7],
    [-0.44, 0.005, 0.16, 0.03, EMBER_Y, 2.2],
  ];
  for (const [x, z, h, r, c, s] of flames)
    glow(
      b.part(new THREE.ConeGeometry(r, h, 6), c, { at: [x, FLOOR + 0.06 + h / 2, z], flat: true, name: "flame" }),
      s,
    );

  // --- bellows (static parts now; the pumping top board comes later) -------
  const BD: [number, number, number] = [-0.66, 0, -0.7517]; // toward the firebox
  const BB: [number, number, number] = [-0.06, FLOOR, 0.37]; // bellows back end
  const wedge: OutlinePoint[] = [
    [0, 0.004],
    [0.24, 0.008],
    [0.24, 0.05],
    [0, 0.17],
  ];
  b.extrude(wedge, { at: BB, x: BD, thickness: [0.17, 0.14], bevel: 0.004, color: LEATHER, name: "bellowsBody" });
  b.part(new THREE.BoxGeometry(0.17, 0.24, 0.014), WOOD_D, {
    at: [-0.1392, FLOOR + 0.012, 0.2798],
    dir: BD,
    up: [0, 1, 0],
    name: "bellowsBase",
  });
  b.rod([-0.2184, FLOOR + 0.035, 0.1896], [-0.32, FLOOR + 0.04, -0.05], [0.022, 0.011], {
    color: IRON,
    name: "tuyere",
  });

  // --- anvil on a tree stump ----------------------------------------------
  const barkY = grain(BARK, BARK_L, { size: 0.05, axis: "y", seed: 3 });
  b.lathe(
    [
      [0, 0],
      [0.115, 0],
      [0.105, 0.12],
      [0.11, 0.24],
      [0, 0.24],
    ],
    { at: [0.02, FLOOR, 0.16], segments: 9, color: paint((_p, n) => (n.y > 0.7 ? SPLIT : barkY)), name: "stump" },
  );
  const anvilOutline: OutlinePoint[] = [
    [-0.15, 0],
    [0.1, 0],
    [0.1, 0.05],
    [0.06, 0.075],
    [0.06, 0.105],
    [0.1, 0.115],
    [0.22, 0.13],
    [0.26, 0.145, "sharp"],
    [0.12, 0.155],
    [-0.15, 0.155],
    [-0.15, 0.105],
    [-0.06, 0.105],
    [-0.06, 0.075],
    [-0.15, 0.05],
  ];
  b.extrude(anvilOutline, {
    at: [0.02, FLOOR + 0.24, 0.16],
    x: [1, 0, 0],
    thickness: [0.1, 0.055],
    bevel: 0.006,
    color: gradient(STEEL_D, STEEL, [0, FLOOR + 0.26, 0], [0, FLOOR + 0.39, 0]),
    name: "anvil",
  });

  // half-forged sword lying across the anvil, tip glowing
  const swordY = FLOOR + 0.397;
  const bladeCold: OutlinePoint[] = [
    [0, 0.003],
    [0.15, 0.003],
    [0.15, 0.034],
    [0, 0.034],
  ];
  b.extrude(bladeCold, {
    at: [-0.1, swordY, 0.177],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: [0.003, 0.008],
    color: STEEL,
    name: "bladeCold",
  });
  const bladeHot: OutlinePoint[] = [
    [0.148, 0.004],
    [0.26, 0.004],
    [0.26, 0.031],
    [0.148, 0.032],
  ];
  glow(
    b.extrude(bladeHot, {
      at: [-0.1, swordY, 0.177],
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: [0.003, 0.008],
      color: EMBER_O,
      name: "bladeHot",
    }),
    1.8,
  );
  const bladeTip: OutlinePoint[] = [
    [0.258, 0.006],
    [0.335, 0.011],
    [0.35, 0.017, "sharp"],
    [0.335, 0.023],
    [0.258, 0.029],
  ];
  glow(
    b.extrude(bladeTip, {
      at: [-0.1, swordY, 0.177],
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: [0.0025, 0.006],
      color: EMBER_Y,
      name: "bladeTip",
    }),
    2.2,
  );
  b.part(new THREE.BoxGeometry(0.014, 0.026, 0.08), IRON, { at: [-0.107, swordY + 0.005, 0.16], name: "guard" });
  b.rod([-0.114, swordY + 0.005, 0.16], [-0.185, swordY + 0.005, 0.16], 0.011, { color: LEATHER_D, name: "grip" });
  b.part(new THREE.SphereGeometry(0.017, 6, 5), BRASS, { at: [-0.192, swordY + 0.005, 0.16], name: "pommel" });

  // --- quench barrel -------------------------------------------------------
  b.lathe(
    [
      [0, 0],
      [0.12, 0],
      [0.135, 0.08],
      [0.14, 0.18],
      [0.135, 0.28],
      [0.12, 0.34],
      [0.095, 0.34],
      [0.105, 0.26],
    ],
    { at: [0.46, FLOOR, 0.26], segments: 10, color: grain(WOOD, WOOD_D, { size: 0.05, axis: "y", seed: 8 }), name: "barrel" },
  );
  for (const y of [0.08, 0.29])
    b.part(new THREE.TorusGeometry(0.136, 0.008, 5, 14), IRON, {
      at: [0.46, FLOOR + y, 0.26],
      rotation: [90, 0, 0],
      name: "barrelBand",
    });
  b.part(new THREE.CylinderGeometry(0.103, 0.103, 0.01, 12), WATER, { at: [0.46, FLOOR + 0.295, 0.26], name: "water" });

  // --- horseshoes ----------------------------------------------------------
  function shoePts(c: [number, number, number], yawDeg: number, leanDeg: number, flat = false, lift = 0) {
    const r = 0.052;
    const L = THREE.MathUtils.degToRad(leanDeg);
    const Y = THREE.MathUtils.degToRad(yawDeg);
    const pts: [number, number, number][] = [];
    let minY = Infinity;
    for (let i = 0; i <= 10; i++) {
      const a = THREE.MathUtils.degToRad(-125 + (250 * i) / 10);
      let x = Math.sin(a) * r;
      let y = flat ? 0 : -Math.cos(a) * r;
      let z = flat ? -Math.cos(a) * r : 0;
      const x1 = x * Math.cos(L) - y * Math.sin(L);
      const y1 = x * Math.sin(L) + y * Math.cos(L);
      const x2 = x1 * Math.cos(Y) + z * Math.sin(Y);
      const z2 = -x1 * Math.sin(Y) + z * Math.cos(Y);
      if (y1 < minY) minY = y1;
      pts.push([c[0] + x2, y1, c[2] + z2]);
    }
    for (const p of pts) p[1] += FLOOR + lift - minY;
    return pts;
  }
  function shoe(c: [number, number, number], yaw: number, lean: number, flat = false, lift = 0) {
    b.sweep(shoePts(c, yaw, lean, flat, lift), () => [0.012, 0.0055], {
      section: "box",
      caps: "flat",
      color: STEEL_D,
      name: "horseshoe",
    });
  }
  shoe([0.3, 0, 0.33], -15, 22);
  shoe([0.35, 0, 0.39], 25, 24);
  shoe([0.34, 0, -0.05], 30, 0, true, 0.305); // flat on the workbench

  // --- workbench -----------------------------------------------------------
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.part(new THREE.BoxGeometry(0.05, 0.26, 0.05), WOOD_D, {
        at: [0.42 + sx * 0.19, FLOOR + 0.13, -0.02 + sz * 0.085],
        name: "benchLeg",
      });
  b.part(new THREE.BoxGeometry(0.36, 0.03, 0.04), WOOD_D, { at: [0.42, FLOOR + 0.06, 0.065], name: "stretcher" });
  b.part(new THREE.BoxGeometry(0.48, 0.045, 0.26), grain(WOOD_BENCH, WOOD_D, { size: 0.06, axis: "x", seed: 9 }), {
    at: [0.42, FLOOR + 0.2825, -0.02],
    name: "benchTop",
  });
  // hammer lying on the bench
  b.rod([0.47, FLOOR + 0.312, 0.03], [0.585, FLOOR + 0.312, -0.015], 0.009, { color: WOOD, name: "benchHammer" });
  b.part(new THREE.BoxGeometry(0.032, 0.06, 0.032), IRON, {
    at: [0.472, FLOOR + 0.315, 0.028],
    dir: [0.923, 0, -0.362],
    name: "benchHammerHead",
  });
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.03), STEEL_D, { at: [0.52, FLOOR + 0.315, -0.07], name: "billet" });

  // --- tool rack -----------------------------------------------------------
  for (const x of [0.24, 0.66])
    b.part(new THREE.BoxGeometry(0.06, 0.58, 0.06), WOOD_D, { at: [x, FLOOR + 0.29, -0.32], name: "rackPost" });
  b.rod([0.22, FLOOR + 0.535, -0.32], [0.68, FLOOR + 0.535, -0.32], 0.016, { color: WOOD, name: "rackBar" });
  for (const x of [0.32, 0.42]) {
    b.rod([x, FLOOR + 0.52, -0.32], [x, FLOOR + 0.34, -0.32], 0.009, { color: WOOD, name: "hammerHandle" });
    b.part(new THREE.BoxGeometry(0.07, 0.032, 0.032), IRON, { at: [x, FLOOR + 0.36, -0.32], name: "hammerHead" });
  }
  for (const x of [0.53, 0.61]) {
    b.part(new THREE.TorusGeometry(0.014, 0.0045, 4, 8), IRON, {
      at: [x, FLOOR + 0.515, -0.32],
      rotation: [0, 90, 0],
      name: "tongRing",
    });
    for (const s of [1, -1]) {
      b.rod([x + s * 0.006, FLOOR + 0.51, -0.32], [x - s * 0.02, FLOOR + 0.35, -0.31], 0.005, { color: IRON, name: "tongArm" });
      b.part(new THREE.BoxGeometry(0.012, 0.03, 0.02), IRON, { at: [x - s * 0.022, FLOOR + 0.335, -0.308], name: "tongJaw" });
    }
  }

  // --- firewood pile --------------------------------------------------------
  const barkZ = grain(BARK, BARK_L, { size: 0.045, axis: "z", seed: 5 });
  const logPaint = paint((_p, n) => (Math.abs(n.z) > 0.6 ? SPLIT : barkZ));
  const logRows: [number, number, number][] = [
    [-0.075, 0.034, 0],
    [0, 0.034, 0],
    [0.075, 0.034, 0],
    [-0.0375, 0.093, 0.01],
    [0.0375, 0.093, 0.01],
    [0, 0.152, 0.02],
  ];
  for (const [dx, y, dz] of logRows)
    b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.3, 7), logPaint, {
      at: [-0.45 + dx, FLOOR + y, 0.37 + dz],
      dir: [0, 0, 1],
      flat: true,
      name: "log",
    });

  // --- standing lantern -----------------------------------------------------
  b.part(new THREE.CylinderGeometry(0.05, 0.055, 0.015, 10), IRON, { at: [0.64, FLOOR + 0.008, 0.4], name: "lanternBase" });
  glow(
    b.part(new THREE.BoxGeometry(0.07, 0.09, 0.07), LANTERN_GLOW, { at: [0.64, FLOOR + 0.06, 0.4], name: "lanternGlass" }),
    1.6,
  );
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.rod([0.64 + sx * 0.037, FLOOR + 0.015, 0.4 + sz * 0.037], [0.64 + sx * 0.037, FLOOR + 0.115, 0.4 + sz * 0.037], 0.0045, { color: IRON, name: "lanternPost" });
  b.part(new THREE.ConeGeometry(0.058, 0.05, 4), IRON, { at: [0.64, FLOOR + 0.14, 0.4], flat: true, name: "lanternTop" });
  b.part(new THREE.SphereGeometry(0.012, 5, 4), BRASS, { at: [0.64, FLOOR + 0.17, 0.4], name: "lanternKnob" });
  b.part(new THREE.TorusGeometry(0.034, 0.004, 4, 8, Math.PI), IRON, { at: [0.64, FLOOR + 0.152, 0.4], name: "lanternHandle" });

  // --- shop sign post --------------------------------------------------------
  b.part(new THREE.BoxGeometry(0.07, 0.78, 0.07), WOOD_D, { at: [-0.62, FLOOR + 0.39, 0.16], name: "signPost" });
  b.part(new THREE.SphereGeometry(0.045, 8, 6), BRASS, { at: [-0.62, FLOOR + 0.8, 0.16], name: "finial" });
  b.part(new THREE.BoxGeometry(0.36, 0.05, 0.05), WOOD_D, { at: [-0.44, FLOOR + 0.75, 0.16], name: "signArm" });
  b.rod([-0.62, FLOOR + 0.52, 0.16], [-0.34, FLOOR + 0.745, 0.16], 0.014, { color: WOOD_D, name: "signBrace" });

  // --- moving joints last, so nothing static snaps to them -------------------
  const bellowsTop = b.joint("bellowsTop", { parent: root, at: [-0.06, FLOOR + 0.015, 0.37], dir: BD, role: "hinge" });
  b.part(new THREE.BoxGeometry(0.19, 0.3, 0.014), WOOD, {
    bone: bellowsTop,
    at: [-0.1392, FLOOR + 0.11, 0.2798],
    dir: [-0.5904, -0.4472, -0.6723],
    up: [0, 1, 0],
    name: "bellowsBoard",
  });
  b.rod([-0.06, FLOOR + 0.17, 0.37], [-0.055, FLOOR + 0.255, 0.375], 0.012, { bone: bellowsTop, color: WOOD_D, name: "bellowsHandle" });
  b.rod([-0.0888, FLOOR + 0.255, 0.4047], [-0.0212, FLOOR + 0.255, 0.3453], 0.009, { bone: bellowsTop, color: WOOD_D, name: "bellowsGrip" });
  b.pose(bellowsTop, { axis: bellowsTop.dir([1, 0, 0]), deg: -22 }); // rest pose: bellows open

  const signSwing = b.joint("signSwing", { parent: root, at: [-0.29, FLOOR + 0.745, 0.16], dir: [0, -1, 0], role: "hinge" });
  for (const s of [1, -1])
    b.rod([-0.29, FLOOR + 0.74, 0.16], [-0.29 + s * 0.095, FLOOR + 0.695, 0.16], 0.006, {
      bone: signSwing,
      color: IRON,
      name: "signChain",
    });
  b.part(new THREE.BoxGeometry(0.26, 0.17, 0.02), WOOD_D, {
    bone: signSwing,
    at: [-0.29, FLOOR + 0.61, 0.16],
    name: "signBoard",
  });
  const emblem = svg(
    `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
      <g fill="#e8d9b0">
        <rect x="18" y="26" width="28" height="6"/>
        <polygon points="28,18 36,18 34,26 30,26"/>
        <rect x="8" y="11" width="38" height="7"/>
        <polygon points="46,11 63,14.5 46,18"/>
        <text x="31" y="39" font-size="7" font-family="sans-serif" text-anchor="middle">FORGE</text>
      </g>
    </svg>`,
    { size: 128 },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.22, 0.14), "#ffffff", {
      bone: signSwing,
      at: [-0.29, FLOOR + 0.61, 0.16 + s * 0.0112],
      dir: [0, 0, s],
      axis: "z",
      texture: emblem,
      name: "signFace",
    });

  return b.root;
}
