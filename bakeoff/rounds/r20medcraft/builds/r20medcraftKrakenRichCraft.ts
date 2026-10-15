import * as THREE from "three";
import type { OutlinePoint } from "../../../../src/builder";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { countershade, mix, mottle, paint, smoothstep, spots } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Kraken",
  description:
    "A kraken rising from the deep with eight tentacles spread: indigo hide, pale armour scutes, glowing cyan seams, suckers and a beak.",
  style: "Overwatch",
  commit: "88fc1f0",
};

// Palette: deep indigo hide, pale armour, one strong cyan accent.
const INDIGO = "#2a2a6a";
const INDIGO_LIGHT = "#3f41a0";
const LAV = "#8d86d8";
const TEAL = "#19f0e0";
const TEAL_DARK = "#0c8f9a";
const PLATE = "#e4e9f7";
const PLATE_SHADE = "#9aa4cf";
const DARK = "#14122f";
const BONE = "#efe7d2";
const SUCK_PALE = "#d8cdf5";
const SUCK_DARK = "#3a1f5c";
const BARNACLE = "#c9d3ea";
const EYEBALL = "#f4f8ff";

const SKIN = spots(
  countershade(mottle(INDIGO, INDIGO_LIGHT, { size: 0.6, contrast: 1.2 }), LAV, { level: -0.15, soft: 0.3 }),
  TEAL_DARK,
  { size: 0.3, amount: 0.18, seed: 3 },
);
const ARM_SKIN = paint((_p, n, s) => {
  const u = s[0] * 14;
  if (Math.abs(u - Math.round(u)) < 0.045 && n.y > -0.2) return DARK;
  return SKIN;
});
const PLATE_PAINT = countershade(PLATE, PLATE_SHADE, { level: -0.1 });
const FIN_PAINT = paint((_p, _n, s) => mix(INDIGO, TEAL_DARK, smoothstep(0.2, 1.7, s[0])));

const IRIS = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="49" fill="#0b0820"/>
  <circle cx="50" cy="50" r="44" fill="#0fb9c9"/>
  <circle cx="50" cy="55" r="34" fill="#19f0e0"/>
  <circle cx="50" cy="62" r="24" fill="#8ffff4"/>
  <ellipse cx="50" cy="50" rx="9" ry="31" fill="#05031a"/>
  <circle cx="35" cy="33" r="9" fill="#ffffff"/>
  <circle cx="63" cy="67" r="4" fill="#ffffff"/>
</svg>`,
  { size: 128 },
);

const MANTLE_KEYS = [0.95, 1.15, 0.9, 0.5];
const mantleR = (t: number) => {
  const x = Math.min(Math.max(t, 0), 1) * 3;
  const i = Math.min(Math.floor(x), 2);
  return MANTLE_KEYS[i] + (MANTLE_KEYS[i + 1] - MANTLE_KEYS[i]) * (x - i);
};
const armR = (t: number) => 0.36 * Math.pow(1 - t, 1.1) + 0.03;

export default function build() {
  const b = createBuilder({ name: "kraken" });
  const body = b.joint("body", { at: [0, 0.95, 0.3] });

  // ---- Mantle (hood) ----
  const mantle = b.chain(
    "mantle",
    catmull([
      [0, 0.95, 0.3],
      [0, 1.6, 0.0],
      [0, 2.5, -0.4],
      [0, 3.3, -0.95],
    ]),
    { parent: body, names: ["mantleBase", "mantleMid", "mantleTop"], role: "spine" },
  );
  const hood = b.sweep(mantle, MANTLE_KEYS, { color: SKIN, sides: 10 });

  // Head, jaw
  const head = b.joint("head", { parent: body, at: [0, 1.2, 0.8], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.72, 1.15], aim: [0, 0.55, 1.5], role: "jaw" });

  // Beak
  b.part(new THREE.ConeGeometry(0.19, 0.5, 6), BONE, { bone: head, at: [0, 0.78, 1.28], dir: [0, -0.7, 0.7], name: "beakUpper" });
  b.part(new THREE.ConeGeometry(0.15, 0.38, 6), BONE, { bone: jaw, at: [0, 0.55, 1.3], dir: [0, 0.45, 0.9], name: "beakLower" });
  b.part(new THREE.BoxGeometry(0.34, 0.06, 0.22), DARK, { bone: head, at: [0, 0.97, 1.18], name: "beakCollar" });
  glow(b.part(new THREE.SphereGeometry(0.12, 6, 4), TEAL, { bone: jaw, at: [0, 0.6, 1.22], name: "maw" }), 1.3);

  // Eyes
  for (const s of [1, -1]) {
    const c = new THREE.Vector3(s * 0.66, 1.35, 0.92);
    const g = new THREE.Vector3(s * 0.55, 0.12, 0.82).normalize();
    b.part(new THREE.SphereGeometry(0.3, 10, 8), EYEBALL, { bone: head, at: c, name: "eyeball" });
    glow(
      b.part(new THREE.CircleGeometry(0.17, 14), "#ffffff", {
        bone: head,
        at: c.clone().addScaledVector(g, 0.27),
        dir: g,
        axis: "z",
        up: [0, 1, 0],
        texture: IRIS,
        name: "iris",
      }),
      1.1,
    );
    b.part(new THREE.TorusGeometry(0.19, 0.03, 5, 14), DARK, {
      bone: head,
      at: c.clone().addScaledVector(g, 0.265),
      dir: g,
      axis: "z",
      name: "eyeRim",
    });
    b.part(new THREE.BoxGeometry(0.64, 0.11, 0.36), PLATE_PAINT, {
      bone: head,
      at: c.clone().add(new THREE.Vector3(0, 0.3, 0.05)).addScaledVector(g, 0.08),
      dir: g,
      axis: "z",
      up: [-s * 0.4, 1, 0],
      name: "brow",
    });
    b.part(new THREE.BoxGeometry(0.5, 0.04, 0.26), DARK, {
      bone: head,
      at: c.clone().add(new THREE.Vector3(0, 0.26, 0.03)).addScaledVector(g, 0.06),
      dir: g,
      axis: "z",
      up: [-s * 0.4, 1, 0],
      name: "browUnder",
    });
  }

  // Armour scutes and spikes along the back of the hood
  for (let k = 0; k < 5; k++) {
    const t = 0.55 + (0.42 * (k + 0.5)) / 5;
    const at = hood.at(t, 0);
    const w = mantleR(t) * 0.8;
    b.stick(new THREE.BoxGeometry(w, 0.08, 0.32), PLATE_PAINT, at, { embed: 0.5, name: "scute" });
    glow(b.stick(new THREE.BoxGeometry(w * 0.7, 0.025, 0.05), TEAL, at.moved([0, 0.05, 0.14]), { embed: 0, name: "scuteTrim" }), 1.2);
    b.spike(at.moved([0, 0.05, -0.02]), at, 0.34 - 0.04 * k, 0.09 - 0.008 * k, PLATE_PAINT);
  }

  // Seam rings around the hood
  const hoodSurf = b.surface(hood);
  glow(b.sweep(hoodSurf.loop(mantle.at(0.33), { lift: 0.03 }), 0.03, { color: TEAL, name: "seamA" }), 1.2);
  b.sweep(hoodSurf.loop(mantle.at(0.4), { lift: 0.03 }), 0.05, { color: PLATE_PAINT, name: "ringPlate" });
  glow(b.sweep(hoodSurf.loop(mantle.at(0.47), { lift: 0.03 }), 0.03, { color: TEAL, name: "seamB" }), 1.2);

  // Barnacles
  const barn = hoodSurf.scatter(22, {
    rng: rng(5),
    minDist: 0.2,
    filter: (h) => h.n.y > -0.1 && h.n.z > -0.3 && h.at.y > 1.5,
  });
  for (const h of barn) b.stick(new THREE.ConeGeometry(0.07, 0.13, 6), BARNACLE, h, { embed: 0.3, name: "barnacle" });

  // Side fins
  const finOutline: OutlinePoint[] = [
    [0, -0.5],
    [0.45, 0.15],
    [1.2, 0.5],
    [1.7, 0.1, "sharp"],
    [1.25, -0.7],
    [0.6, -0.9],
    [0, -0.7],
  ];
  for (const s of [1, -1]) {
    const finJ = b.joint(`fin${s > 0 ? "L" : "R"}`, {
      parent: mantle.joints[1],
      at: [s * 0.7, 2.55, -0.45],
      dir: [s, 0.3, -0.3],
      role: "fan",
    });
    const fin = b.extrude(finOutline, {
      at: [s * 0.7, 2.55, -0.45],
      x: [s, 0, 0],
      y: [0, 0.45, -1],
      thickness: 0.07,
      bevel: 0.02,
      smoothing: 1,
      color: FIN_PAINT,
      bone: finJ,
    });
    const zf = fin.axis.y > 0 ? 0.04 : -0.04;
    const ribs: Array<[number[], number[]]> = [
      [[0.2, -0.45], [1.45, 0.12]],
      [[0.3, -0.65], [1.2, -0.55]],
      [[0.25, 0.05], [1.2, 0.35]],
    ];
    for (const [a, c] of ribs)
      glow(b.rod(fin.local([a[0], a[1], zf]), fin.local([c[0], c[1], zf]), 0.018, { color: TEAL, bone: finJ, name: "finRib" }), 1.2);
  }

  // ---- Tentacles ----
  const A = [32, -32, 72, -72, 112, -112, 152, -152];
  const LEN = [4.2, 4.2, 4.6, 4.6, 4.4, 4.4, 4.0, 4.0];
  const RISE = [0.6, 1.8, 2.6, 0.5, 0.7, 2.2, 0.8, 0.5];
  const WIG = [0.25, 0.3, 0.2, 0.3, 0.3, 0.22, 0.3, 0.25];
  const LETTERS = "ABCDEFGH";
  for (let i = 0; i < 8; i++) {
    const pts: number[][] = [];
    for (let k = 0; k <= 8; k++) {
      const t = k / 8;
      const r = armR(t);
      const dist = 0.45 + LEN[i] * t;
      const ang = (A[i] * Math.PI) / 180 + WIG[i] * Math.sin(t * 4.2 + i * 1.3) * t;
      const floorY = r * 0.95;
      const y = floorY + (0.95 - floorY) * (1 - smoothstep(0, 0.28, t)) + RISE[i] * Math.pow(smoothstep(0.3, 1, t), 1.3);
      pts.push([dist * Math.sin(ang), y, dist * Math.cos(ang)]);
    }
    const chain = b.chain(`tent${LETTERS[i]}`, catmull(pts), { parent: body, count: 6, role: "tentacle" });
    const sw = b.sweep(chain, armR, { color: ARM_SKIN, sides: 8 });
    const surf = b.surface(sw);
    glow(b.sweep(surf.loop(chain.at(0.2), { lift: 0.02 }), 0.025, { color: TEAL, name: "cuffGlow" }), 1.2);
    b.sweep(surf.loop(chain.at(0.3), { lift: 0.02 }), 0.05, { color: PLATE_PAINT, name: "cuffPlate" });
    for (let k = 0; k < 8; k++) {
      const t = 0.22 + (0.72 * k) / 8;
      const hit = sw.at(t, (k % 2 ? 1 : -1) * 115);
      const rs = armR(t) * 0.5;
      b.stick(new THREE.CylinderGeometry(rs, rs * 1.15, 0.04, 8), SUCK_PALE, hit, { embed: 0.3, name: "sucker" });
      b.stick(new THREE.CylinderGeometry(rs * 0.62, rs * 0.62, 0.045, 8), SUCK_DARK, hit, { embed: 0.2, name: "suckerCup" });
    }
    for (let k = 0; k < 6; k++) {
      const t = 0.28 + (0.62 * k) / 6;
      const rs = armR(t) * 0.28;
      glow(b.stick(new THREE.SphereGeometry(rs, 6, 4), TEAL, sw.at(t, 0), { embed: 0.4, name: "glowDot" }), 1.3);
    }
    glow(
      b.part(new THREE.SphereGeometry(0.06, 6, 4), TEAL, {
        at: pts[8],
        bone: chain.joints[chain.joints.length - 1],
        name: "tentTip",
      }),
      1.4,
    );
  }

  return b.root;
}
