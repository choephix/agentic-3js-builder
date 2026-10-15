// Red panda balancing on a mossy stone: Genshin Impact style (cel shading, gold trim, glowing elemental charm).
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { gradient, mottle, noise, paint, mix, smoothstep, spots, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda on Mossy Stone",
  description:
    "A cel-shaded red panda standing on a moss-covered boulder, ringed tail curled up for balance, gold collar with a glowing dendro charm, mushrooms, flowers and floating seeds.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const ORANGE = "#ee6a2a";
const RUSTDARK = "#a73a1c";
const CREAM = "#fff1d6";
const PLUM = "#3a2236";
const GOLD = "#f2c14e";
const GOLD_LIGHT = "#ffe08a";
const TEAL = "#5ef2e0";

const stoneY = (x: number, z: number) =>
  0.17 + 0.17 * Math.sqrt(Math.max(0, 1 - (x / 0.42) ** 2 - (z / 0.4) ** 2));

export default function build() {
  const b = createBuilder({ name: "redPanda" });

  // ---- palette -------------------------------------------------------------------------------------------
  const COAT = cel(mottle("#f07a32", "#e25a22", { size: 0.09, seed: 4, contrast: 0.8 }));
  const DARK = cel(PLUM, "#24142b");
  const BODY = furEdge(COAT, DARK, { level: -0.2, teeth: 0.2, period: 0.03 });
  const TAIL = gradient(
    cel(stripes("#ee6a2a", RUSTDARK, { size: 0.075, width: 0.5, wobble: 0.12, seed: 2 })),
    DARK,
    [0, 0.66, -0.78],
    [0, 0.8, -0.84],
  );
  const CREAMC = cel(CREAM);
  const PAWC = cel("#4a2a40");
  const FACE = cel(
    paint((p) => {
      const ax = Math.abs(p.x);
      if (ax > 0.045 && ax < 0.058 && p.y < 0.585 && p.y > 0.535 && p.z > 0.4) return RUSTDARK;
      if (p.z > 0.43 + 0.012 * zigzag(p.x / 0.03)) return CREAM;
      if (ax > 0.07 + 0.008 * zigzag(p.z / 0.025) && p.y < 0.61 && p.z > 0.31) return CREAM;
      if (ax > 0.03 && ax < 0.06 && p.y > 0.635 && p.y < 0.66 && p.z > 0.4) return CREAM;
      return ORANGE;
    }),
  );
  const STONE = cel(
    paint((p, n) => {
      const rock = noise(p, 0.1, 2) > 0.5 ? "#7c8798" : "#6a7488";
      const t = smoothstep(0.35, 0.6, n.y * 0.5 + noise(p, 0.14, 5) * 0.8);
      const moss = noise(p, 0.05, 9) > 0.55 ? "#9fe05a" : "#5fb84a";
      return mix(rock, moss, t);
    }),
  );

  // ---- skeleton ------------------------------------------------------------------------------------------
  const stone = b.joint("stone", { at: [0, 0.17, 0] });
  const hips = b.joint("hips", { parent: stone, at: [0, 0.54, -0.23], aim: [0, 0.55, -0.08], role: "spine" });
  const spinePath = catmull([
    [0, 0.54, -0.23],
    [0, 0.55, -0.08],
    [0, 0.555, 0.08],
    [0, 0.57, 0.2],
    [0, 0.59, 0.29],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "spine4"],
    role: "spine",
  });
  const neckJ = spine.joints[3];
  const head = b.joint("head", { parent: neckJ, at: [0, 0.585, 0.3], aim: [0, 0.58, 0.4], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.565, 0.42], aim: [0, 0.55, 0.5], role: "jaw" });
  const ears: Record<string, ReturnType<typeof b.joint>> = {};
  for (const s of [1, -1])
    ears[s > 0 ? "L" : "R"] = b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: [s * 0.07, 0.655, 0.35],
      dir: [s * 0.5, 1, -0.1],
      role: "hinge",
    });

  const tailPath = catmull([
    [0, 0.54, -0.23],
    [0, 0.56, -0.38],
    [0, 0.6, -0.55],
    [0, 0.66, -0.7],
    [0, 0.74, -0.8],
    [0, 0.86, -0.84],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, role: "tail" });

  // ---- stone ---------------------------------------------------------------------------------------------
  const stonePart = b.part(new THREE.SphereGeometry(1, 12, 8), STONE, {
    at: [0, 0.17, 0],
    scale: [0.42, 0.17, 0.4],
    bone: stone,
    flat: true,
  });
  const pebbles: Array<[number, number, number, number, number]> = [
    [0.4, 0.05, 0.22, 0.1, 0.06],
    [-0.38, 0.045, 0.16, 0.09, 0.055],
    [-0.15, 0.04, -0.42, 0.11, 0.05],
    [0.3, 0.04, -0.34, 0.07, 0.045],
  ];
  pebbles.forEach(([x, y, z, r, h], i) =>
    b.part(new THREE.IcosahedronGeometry(1, 0), STONE, {
      at: [x, y, z],
      scale: [r, h, r * 0.9],
      rotation: [0, i * 40, 0],
      bone: stone,
      flat: true,
    }),
  );

  // moss tufts on the stone
  const MOSS_T = svg(
    `<svg viewBox="0 0 40 40">
      <path d="M4 40 Q6 18 2 6 Q12 16 12 40Z" fill="#4ca83e"/>
      <path d="M10 40 Q12 14 14 0 Q22 14 22 40Z" fill="#74c94c"/>
      <path d="M18 40 Q24 20 34 8 Q32 26 28 40Z" fill="#5fb84a"/>
      <path d="M26 40 Q32 26 38 20 Q38 32 36 40Z" fill="#9fe05a"/>
      <path d="M13 40 Q14 22 14 8" stroke="#b6f07a" stroke-width="2" fill="none"/>
    </svg>`,
    { size: 128 },
  );
  const nearPaw = (x: number, z: number) =>
    [
      [0.09, 0.2],
      [-0.09, 0.2],
      [0.09, -0.2],
      [-0.09, -0.2],
    ].some(([px, pz]) => Math.hypot(x - px, z - pz) < 0.07);
  const mossHits = b
    .surface(stonePart)
    .scatter(90, { rng: rng(11), minDist: 0.05, filter: (h) => h.n.y > 0.25 && !nearPaw(h.at.x, h.at.z) });
  b.cards(mossHits, MOSS_T, { size: [0.055, 0.05], lean: 15, vary: 0.4, spin: 180, rng: rng(5), cross: true });

  // mushrooms
  for (const [x, z] of [
    [-0.3, 0.1],
    [0.26, -0.2],
    [-0.18, -0.3],
    [0.1, 0.34],
  ]) {
    const y0 = stoneY(x, z) - 0.012;
    b.part(new THREE.CylinderGeometry(0.008, 0.011, 0.05, 6), CREAMC, { at: [x, y0 + 0.022, z], bone: stone });
    b.part(new THREE.SphereGeometry(0.03, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), cel(spots("#ff5c7a", CREAM, { size: 0.02, amount: 0.6, seed: 3 })), {
      at: [x, y0 + 0.044, z],
      scale: [1, 0.7, 1],
      bone: stone,
    });
  }
  // flowers
  for (const [x, z, h] of [
    [0.22, 0.22, 0.05],
    [-0.25, -0.14, 0.06],
    [0.3, 0.05, 0.045],
  ]) {
    const y0 = stoneY(x, z) - 0.01;
    b.rod([x, y0, z], [x, y0 + h, z], 0.0035, { color: "#4ca83e", bone: stone, sides: 4 });
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.011, 6, 4), "#ffffff", {
        at: [x + Math.cos(a) * 0.012, y0 + h, z + Math.sin(a) * 0.012],
        scale: [1, 0.5, 1],
        bone: stone,
      });
    }
    b.part(new THREE.SphereGeometry(0.008, 6, 4), GOLD, { at: [x, y0 + h + 0.004, z], bone: stone });
  }
  // floating seeds
  [
    [0.3, 0.62, 0.25],
    [-0.35, 0.7, 0.1],
    [0.38, 0.5, -0.2],
    [-0.3, 0.45, -0.3],
    [0.2, 0.8, 0.3],
    [-0.2, 0.62, 0.35],
  ].forEach((at) => glow(b.part(new THREE.OctahedronGeometry(0.014), "#7ff7d8", { at, bone: stone }), 1.4));

  // ---- body ----------------------------------------------------------------------------------------------
  const bodySweep = b.sweep(spine, [0.075, 0.1, 0.108, 0.095, 0.07], { color: BODY });

  // ---- head ----------------------------------------------------------------------------------------------
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), FACE, {
    at: [0, 0.6, 0.37],
    scale: [0.1, 0.085, 0.09],
    bone: head,
  });
  b.part(new THREE.SphereGeometry(1, 10, 7), CREAMC, { at: [0, 0.575, 0.465], scale: [0.045, 0.036, 0.055], bone: head });
  b.part(new THREE.SphereGeometry(0.018, 6, 4), cel("#2a1630"), { at: [0, 0.58, 0.515], scale: [1, 0.8, 0.8], bone: head });
  b.part(new THREE.SphereGeometry(1, 8, 5), CREAMC, { at: [0, 0.552, 0.465], scale: [0.034, 0.015, 0.05], bone: jaw });

  const EYE = animeEye({ iris: "#e8861c", blush: "#ff9db5" });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around([0, 0.6, 0.37]).at(s * 28, 5)!;
    b.decal(skin, EYE, { at: hit, size: [0.05, 0.068], mirror: s > 0 });
  }

  // ears
  for (const s of [1, -1]) {
    const ej = ears[s > 0 ? "L" : "R"];
    const a = -s * 0.45;
    const x = [Math.cos(a), Math.sin(a), 0];
    const y = [-Math.sin(a), Math.cos(a), 0];
    const base: [number, number, number] = [s * 0.07, 0.655, 0.35];
    b.extrude(
      [
        [-0.042, 0],
        [0.042, 0],
        [0.038, 0.045],
        [0, 0.085, "sharp"],
        [-0.038, 0.045],
      ],
      { at: base, x, y, thickness: 0.016, smoothing: 1, color: COAT, bone: ej },
    );
    b.extrude(
      [
        [-0.026, 0.008],
        [0.026, 0.008],
        [0.022, 0.04],
        [0, 0.062, "sharp"],
        [-0.022, 0.04],
      ],
      { at: [base[0], base[1], base[2] + 0.006], x, y, thickness: 0.018, color: CREAMC, bone: ej },
    );
  }

  // cheek ruff and whiskers
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      b.spike([s * 0.085, 0.585 - 0.025 * k, 0.4], [s * 0.8, -0.2 - 0.1 * k, -0.45], 0.06, 0.02, {
        color: CREAMC,
        bone: head,
      });
      b.rod([s * 0.03, 0.572, 0.495], [s * 0.13, 0.59 - 0.025 * k, 0.525 - 0.015 * k], 0.0025, {
        color: "#fff8e8",
        bone: head,
        sides: 4,
      });
    }
  }
  const FUR_T = svg(
    `<svg viewBox="0 0 24 48">
      <path d="M12 0 Q22 20 20 48 L4 48 Q2 20 12 0Z" fill="#ffffff"/>
      <path d="M12 6 Q13 28 12 48" stroke="#c9c9c9" stroke-width="2" fill="none"/>
    </svg>`,
    { size: 96 },
  );
  const cheekHits = skin.scatter(60, {
    rng: rng(8),
    minDist: 0.022,
    filter: (h) => Math.abs(h.at.x) > 0.06 && h.at.z < 0.42 && h.at.y < 0.62,
  });
  b.cards(cheekHits, FUR_T, { size: [0.03, 0.045], lean: 70, bend: 20, vary: 0.25, spin: 15, rng: rng(9), color: CREAM });

  // ---- legs ----------------------------------------------------------------------------------------------
  const legNames: Array<[string, string, string]> = [
    ["shoulder", "elbow", "wrist"],
    ["hip", "knee", "ankle"],
  ];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (const front of [true, false]) {
      const z = front ? 0.16 : -0.16;
      const fz = front ? 0.2 : -0.2;
      const pts = limb([s * 0.075, 0.5, z], [s * 0.09, 0.322, fz], [0.11, 0.1], [[0, 0, front ? -1 : 1]]);
      const names = legNames[front ? 0 : 1].map((n) => n + S);
      const leg = b.chain(`leg${front ? "F" : "H"}${S}`, pts, {
        parent: front ? spine.joints[2] : spine.joints[0],
        names,
        role: "leg",
      });
      b.sweep(leg, [0.047, 0.03], { color: DARK });
      const tip = leg.tip!;
      b.part(new THREE.SphereGeometry(1, 8, 5), PAWC, { at: [s * 0.09, 0.322, fz + 0.012], scale: [0.03, 0.02, 0.042], bone: tip });
      for (const k of [-1, 0, 1]) {
        b.part(new THREE.SphereGeometry(0.011, 6, 4), PAWC, { at: [s * 0.09 + k * 0.014, 0.322, fz + 0.04], bone: tip });
        b.spike([s * 0.09 + k * 0.014, 0.318, fz + 0.047], [0, -0.2, 1], 0.02, 0.005, { color: CREAM, bone: tip });
      }
    }
  }

  // ---- tail ----------------------------------------------------------------------------------------------
  const tailSweep = b.sweep(tail, [0.05, 0.075, 0.085, 0.08, 0.06, 0.025], { color: TAIL });
  const tailHits = b.surface(tailSweep).scatter(150, { rng: rng(21), minDist: 0.03, filter: (h) => h.n.y > -0.5 });
  b.cards(tailHits, FUR_T, { size: [0.04, 0.07], lean: 50, bend: 25, vary: 0.3, spin: 20, rng: rng(22), color: TAIL });
  const bodyHits = b.surface(bodySweep).scatter(220, { rng: rng(3), minDist: 0.03, filter: (h) => h.n.y > -0.2 });
  b.cards(bodyHits, FUR_T, { size: [0.035, 0.055], lean: 60, bend: 25, vary: 0.3, spin: 20, rng: rng(4), color: COAT });

  // ---- gold collar and charm ------------------------------------------------------------------------------
  b.part(new THREE.TorusGeometry(0.088, 0.009, 6, 16), GOLD, {
    at: [0, 0.585, 0.265],
    dir: [0, 0.12, 1],
    axis: "z",
    bone: neckJ,
  });
  b.ring(frame([0, 0.585, 0.265], [0, 0.12, 1]), { count: 8, radius: 0.092 }, (item) =>
    b.part(new THREE.SphereGeometry(0.0085, 6, 4), GOLD_LIGHT, { at: item, bone: neckJ }),
  );
  b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.03, 4), GOLD, { at: [0, 0.482, 0.285], bone: neckJ });
  glow(b.part(new THREE.OctahedronGeometry(0.02), TEAL, { at: [0, 0.455, 0.288], scale: [0.8, 1.2, 0.8], bone: neckJ }), 1.6);
  for (const k of [-1, 0, 1])
    b.rod([k * 0.01, 0.435, 0.29], [k * 0.016, 0.385, 0.295], 0.004, { color: "#d6334a", bone: neckJ, sides: 4 });
  b.part(new THREE.SphereGeometry(0.008, 6, 4), GOLD, { at: [0, 0.432, 0.29], bone: neckJ });

  return b.root;
}
