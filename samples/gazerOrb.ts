import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { pixelArt, cellPaint, snapColor } from "../kits/pixel";
import { glow } from "../kits/glow";

const TEXEL = 0.02;
const BODY_RAMP = ["#241348", "#382064", "#50307e", "#70479a", "#9562b4"].map((c) => snapColor(c, 32));
const BODY_DARK = snapColor("#1b1035", 32);
const STALK = snapColor("#432268", 32);
const STALK_HI = snapColor("#8b4ca4", 32);
const SUCKER = snapColor("#cf5eae", 32);
const EYE_WHITE = snapColor("#f7e5a6", 32);
const EYE_SHADOW = snapColor("#c79b68", 32);
const IRIS = snapColor("#55e6c1", 32);
const IRIS_HI = snapColor("#b5ffe4", 32);
const PUPIL = snapColor("#101225", 32);
const TOOTH = snapColor("#ffd98a", 32);
const MOUTH = snapColor("#090713", 32);
const CYAN = snapColor("#51d7d3", 32);

const ORB_SKIN = cellPaint(TEXEL, (c) => {
  const light = 0.36 + c.n.y * 0.30 + c.n.z * 0.10;
  return c.pick(BODY_RAMP, light + (c.random(9) - 0.5) * 0.16);
}, { dither: true });

const BIG_IRIS = pixelArt([
  ".....kk.....",
  "...kciick...",
  "..kciiiick..",
  ".kciihiiick.",
  ".ciihhhiiic.",
  "kiihhhhiiick",
  "ciihhphhiiic",
  "ciihhphhiiic",
  "ciihhhhiiic.",
  ".ciihhhiiic.",
  ".kciiiick...",
  "...kciick...",
], { k: PUPIL, c: IRIS, i: IRIS_HI, h: "#8ff6d4", p: PUPIL });

const STALK_IRIS = pixelArt([
  "..k..",
  ".cii.",
  "cihic",
  ".cip.",
  "..k..",
], { k: PUPIL, c: IRIS, i: IRIS_HI, h: "#e8fff1", p: PUPIL });


export const meta = {
  name: "Gazer Orb",
  description: "A hovering pixel-art eye orb with a many-eyed stalk crown and a toothy grin.",
  style: "pixel art",
  commit: "34f986c",
};

export default function build() {
  const b = createBuilder({ name: "gazerOrb", detail: 1, paintSize: 1024 });
  const random = rng(3407);
  const core = b.joint("core", { at: [0, 0.62, 0], role: "spine" });
  const eye = b.joint("eye", {
    parent: core,
    at: [0, 0.65, 0.16],
    aim: [0, 0.65, 0.5],
    role: "head",
    group: "mainEye",
  });
  b.part(new THREE.SphereGeometry(0.22, 10, 7), ORB_SKIN, {
    bone: core,
    at: [0, 0.62, 0],
    name: "orbBody",
    flat: true,
  });
  b.part(new THREE.SphereGeometry(0.115, 8, 6), EYE_WHITE, {
    bone: eye,
    at: [0, 0.65, 0.17],
    name: "mainEyeShell",
    flat: true,
  });


  b.part(new THREE.SphereGeometry(0.12, 8, 6), EYE_SHADOW, {
    bone: eye,
    at: [0, 0.65, 0.165],
    name: "mainEyeRim",
    flat: true,
    scale: [1.02, 1.02, 0.48],
  });
  const iris = b.part(new THREE.PlaneGeometry(0.145, 0.145), EYE_WHITE, {
    bone: eye,
    at: [0, 0.65, 0.284],
    dir: [0, 0, 1],
    axis: "z",
    texture: BIG_IRIS,
    name: "mainIris",
  });
  glow(iris, 1.15);

  // A dark, square pixel mouth is framed by independently rigged upper and lower jaws.
  const jawUpper = b.joint("jawUpper", {
    parent: core,
    at: [0, 0.515, 0.17],
    aim: [0, 0.515, 0.33],
    role: "jaw",
    group: "mouth",
  });
  const jawLower = b.joint("jawLower", {
    parent: core,
    at: [0, 0.445, 0.17],
    aim: [0, 0.415, 0.31],
    role: "jaw",
    group: "mouth",
  });
  b.part(new THREE.BoxGeometry(0.15, 0.075, 0.025), MOUTH, {
    bone: core,
    at: [0, 0.485, 0.216],
    name: "mouthInterior",
    flat: true,
  });
  b.rod([-0.09, 0.525, 0.22], [0.09, 0.525, 0.22], 0.014, {
    color: BODY_DARK,
    bone: jawUpper,
    name: "upperLip",
    section: { ngon: 4 },
  });
  b.rod([-0.09, 0.445, 0.22], [0.09, 0.445, 0.22], 0.014, {
    color: BODY_DARK,
    bone: jawLower,
    name: "lowerLip",
    section: { ngon: 4 },
  });
  for (const x of [-0.058, 0, 0.058]) {
    b.spike([x, 0.525, 0.227], [0, -1, 0], 0.038, 0.010, {
      color: TOOTH,
      bone: jawUpper,
      name: `upperFang${x < 0 ? "L" : x > 0 ? "R" : "C"}`,
      section: { ngon: 4 },
    });
    b.spike([x, 0.445, 0.227], [0, 1, 0], 0.032, 0.009, {
      color: TOOTH,
      bone: jawLower,
      name: `lowerFang${x < 0 ? "L" : x > 0 ? "R" : "C"}`,
      section: { ngon: 4 },
    });
  }

  // Six bent stalks make a readable neutral “tentacle T-pose” around the orb.
  const stalkDirs = [
    [0.86, 0.30, 0.42], [-0.86, 0.30, 0.42],
    [0.90, 0.48, -0.18], [-0.90, 0.48, -0.18],
    [0.18, 0.96, -0.20], [-0.18, 0.96, -0.20],
  ];
  stalkDirs.forEach(([dx, dy, dz], index) => {
    const d = new THREE.Vector3(dx, dy, dz).normalize();
    const bend = new THREE.Vector3(d.x * 0.215 + (index % 2 ? -0.018 : 0.018), 0.62 + d.y * 0.215 + 0.018, d.z * 0.215);
    const root = new THREE.Vector3(d.x * 0.185, 0.62 + d.y * 0.185, d.z * 0.185);
    const tip = new THREE.Vector3(d.x * 0.335, 0.62 + d.y * 0.335, d.z * 0.335);
    const side = index % 2 === 0 ? "R" : "L";
    const names = [`stalk${index + 1}Base`, `stalk${index + 1}Mid`, `stalk${index + 1}Tip`];
    const stalk = b.chain(`stalk${index + 1}`, [root, bend, tip], {
      parent: core,
      names,
      role: "tentacle",
      up: [0, 1, 0],
      group: `stalk${index + 1}`,
    });
    if (stalk.tip === null) {
      throw new Error(`stalk${index + 1} did not produce a tip joint`);
    }
    const stalkTip = stalk.tip;
    b.sweep(stalk, [0.027, 0.013], {
      section: { ngon: 5 },
      color: (t) => t < 0.52 ? STALK : STALK_HI,
      bands: [[0.52, STALK_HI]],
      caps: "round",
      detail: 1,
      name: `stalkTube${index + 1}`,
    });
    b.part(new THREE.SphereGeometry(0.041, 6, 4), EYE_WHITE, {
      bone: stalkTip,
      at: stalkTip.at,
      name: `stalkEye${index + 1}`,
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.043, 6, 4), EYE_SHADOW, {
      bone: stalkTip,
      at: stalkTip.at,
      name: `stalkEyeRim${index + 1}`,
      scale: [1.02, 1.02, 0.5],
      flat: true,
    });
    const pupil = b.part(new THREE.PlaneGeometry(0.052, 0.052), EYE_WHITE, {
      bone: stalkTip,
      at: stalkTip.local([0, 0.041, 0]),
      dir: stalkTip.axis,
      axis: "z",
      texture: STALK_IRIS,
      name: `stalkPupil${index + 1}`,
    });
    glow(pupil, 1.05);
    // A four-pixel suction ring at the base gives each stalk a tactile socket.
    for (const q of [0, 1, 2, 3]) {
      const angle = (Math.PI * 2 * q) / 4 + (index % 2) * 0.3;
      const tangent = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
      const socket = root.clone().add(tangent.multiplyScalar(0.026));
      b.part(new THREE.BoxGeometry(0.018, 0.018, 0.012), SUCKER, {
        bone: core,
        at: socket,
        name: `socket${index + 1}_${q}`,
        flat: true,
      });
    }
    // A tiny highlight block per stalk keeps the pixel palette legible in profile.
    const highlight = bend.clone().add(new THREE.Vector3(0, 0.014, 0));
    b.part(new THREE.BoxGeometry(0.025, 0.012, 0.012), CYAN, {
      bone: stalk.joints[1],
      at: highlight,
      name: `stalkHighlight${side}${index + 1}`,
      flat: true,
    });
  });

  // Eight square shell pixels act as chipped plates and break up the broad orb surface.
  const shellBits = [
    [0.16, 0.74, 0.11], [-0.16, 0.74, 0.11], [0.18, 0.58, -0.09], [-0.18, 0.58, -0.09],
    [0.08, 0.79, -0.11], [-0.08, 0.79, -0.11], [0.19, 0.64, 0.02], [-0.19, 0.64, 0.02],
  ];
  shellBits.forEach(([x, y, z], i) => {
    b.part(new THREE.BoxGeometry(0.026, 0.026, 0.012), i % 2 ? STALK_HI : BODY_DARK, {
      bone: core,
      at: [x, y, z],
      name: `shellPixel${i + 1}`,
      flat: true,
    });
  });

  // Small cyan underside pixels sell the suspension and reinforce that the monster is airborne.
  for (const x of [-0.08, 0, 0.08]) {
    b.part(new THREE.BoxGeometry(0.025, 0.035, 0.025), CYAN, {
      bone: core,
      at: [x, 0.418, -0.015],
      name: `hoverPixel${x < 0 ? "L" : x > 0 ? "R" : "C"}`,
      flat: true,
    });
  }

  // Keep the deterministic generator in the build path for future palette-safe variation.
  random();
  return b.root;
}
