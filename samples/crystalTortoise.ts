import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull } from "../src/path";
import { limb } from "../src/ik";
import { mottle, patches } from "../src/paint";
import { rng } from "../src/math";
import { animeEye, cel, furEdge, INK } from "../kits/toon";
import { glow } from "../kits/glow";

const SKIN = cel(
  mottle("#78985d", "#405744", { size: 0.16, contrast: 0.65, seed: 19 }),
  "#3b5149",
);
const SKIN_BELLY = cel("#cfb26a", "#8b634e", { threshold: 0.18 });
const SHELL = cel(
  patches("#4e8b79", "#2d5e63", { size: 0.28, gap: 0.018, seed: 8 }),
  "#254752",
  { threshold: 0.04 },
);
const SHELL_RIM = cel("#a2d087", "#5a7657", { threshold: 0.15 });
const SHELL_EDGE = cel("#d3c36f", "#956245", { threshold: 0.12 });
const INK_SHELL = "#1d2738";
const CLAW = cel("#efe0b1", "#aa8466");
const CAVITY = "#181b38";
const CRYSTAL_CYAN = "#67f2e8";
const CRYSTAL_BLUE = "#75a8ff";
const CRYSTAL_VIOLET = "#d094ff";
const CRYSTAL_MINT = "#b6ffe2";

export const meta = {
  name: "Crystal Tortoise",
  description: "A gentle storybook tortoise whose faceted shell opens into a glowing geode garden.",
  style: "Genshin Impact",
  commit: "9555ebf",
};

export default function build() {
  const b = createBuilder({ name: "crystalTortoise", detail: 1, paintSize: 1024 });
  const hips = b.joint("hips", { at: [0, 0.56, 0], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull(
      [
        [0, 0.56, -0.42],
        [0, 0.6, -0.12],
        [0, 0.64, 0.2],
        [0, 0.68, 0.43],
      ],
      { tension: 0.35 },
    ),
    { parent: hips, names: ["spineBase", "spineMid", "spineFront", "spineEnd"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull(
      [
        spine.tip!.at,
        [0, 0.72, 0.58],
        [0, 0.79, 0.77],
        [0, 0.83, 0.91],
      ],
      { tension: 0.4 },
    ),
    { parent: spine.tip!, names: ["neckBase", "neckMid", "neckTop", "neckEnd"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 0.84, 0.97],
    dir: [0, 0.02, 1],
    role: "head",
    group: "head",
  });
  const jawUpper = b.joint("jawUpper", {
    parent: head,
    at: [0, 0.84, 1.06],
    aim: [0, 0.84, 1.31],
    role: "jaw",
    group: "head",
  });
  const jawLower = b.joint("jawLower", {
    parent: head,
    at: [0, 0.77, 1.05],
    aim: [0, 0.72, 1.3],
    role: "jaw",
    group: "head",
  });

  const tail = b.chain(
    "tail",
    catmull(
      [
        hips.at,
        [0, 0.54, -0.56],
        [0, 0.49, -0.84],
        [0, 0.4, -1.04],
      ],
      { tension: 0.32 },
    ),
    { parent: hips, names: ["tailBase", "tailMid", "tailTip", "tailEnd"], role: "tail" },
  );
  b.sweep(tail, [0.13, 0.025], {
    color: SKIN,
    section: { ngon: 7 },
    caps: { start: "round", end: "point" },
    group: "tail",
    name: "tailSkin",
  });
  const shell = b.part(new THREE.SphereGeometry(1, 20, 12), SHELL, {
    bone: hips,
    at: [0, 0.69, -0.01],
    scale: [0.72, 0.44, 0.88],
    flat: true,
    group: "shell",
    name: "geodeShell",
  });
  b.part(new THREE.SphereGeometry(1, 16, 10), SKIN_BELLY, {
    bone: hips,
    at: [0, 0.5, -0.01],
    scale: [0.62, 0.2, 0.76],
    flat: true,
    group: "shell",
    name: "shellUnderside",
  });
  const shellSurface = b.surface(shell);
  const shellLoop = catmull(
    [
      [0, 0.48, -0.73],
      [0.52, 0.49, -0.48],
      [0.69, 0.51, 0.02],
      [0.53, 0.51, 0.53],
      [0, 0.5, 0.73],
      [-0.53, 0.51, 0.53],
      [-0.69, 0.51, 0.02],
      [-0.52, 0.49, -0.48],
    ],
    { closed: true, tension: 0.25 },
  );
  b.sweep(shellLoop, 0.035, { bone: hips, color: SHELL_EDGE, section: { ngon: 6 }, caps: "none", name: "shellRim" });

  const centralCavity = b.part(new THREE.SphereGeometry(1, 12, 8), CAVITY, {
    bone: hips,
    at: [0, 1.105, -0.03],
    scale: [0.28, 0.045, 0.34],
    flat: true,
    group: "crystals",
    name: "geodeCavity",
  });
  void centralCavity;

  const scuteAngles = [-62, -36, -12, 14, 38, 62, 90, -90];
  for (let i = 0; i < scuteAngles.length; i += 1) {
    const hit = shellSurface.around([0, 0.72, 0]).at(scuteAngles[i], 38);
    if (!hit) continue;
    b.stick(
      new THREE.CylinderGeometry(0.13, 0.15, 0.028, 6),
      SHELL_RIM,
      hit,
      { embed: 0.55, flow: [0, 0, 1], spin: i * 17, group: "shell", name: `shellScute${i}` },
    );
  }

  const crystalRng = rng(71);
  const crystalHits = shellSurface.scatter(26, {
    rng: crystalRng,
    minDist: 0.1,
    filter: (hit) => hit.n.y > 0.22 && hit.at.y > 0.84,
  });
  const crystalColors = [CRYSTAL_CYAN, CRYSTAL_BLUE, CRYSTAL_VIOLET, CRYSTAL_MINT];
  for (let i = 0; i < crystalHits.length; i += 1) {
    const hit = crystalHits[i];
    const size = 0.07 + crystalRng() * 0.075;
    const crystal = b.stick(
      new THREE.ConeGeometry(size * 0.48, size * 1.9, 5),
      crystalColors[i % crystalColors.length],
      hit,
      { embed: 0.42, spin: crystalRng() * 360, group: "crystals", name: `shellCrystal${i}` },
    );
    glow(crystal, 1.6);
  }

  const body = b.sweep(spine, (t) => 0.27 - 0.025 * t, {
    color: furEdge(SKIN, SKIN_BELLY, { level: -0.18, teeth: 0.06, period: 0.16, ink: INK }),
    section: { ngon: 8 },
    caps: "round",
    shift: [0, -0.06],
    group: "body",
    name: "necklessBody",
  });
  const throat = b.sweep(neck, [0.16, 0.105], {
    color: SKIN,
    section: { ngon: 7 },
    caps: "round",
    group: "body",
    name: "neckSkin",
  });
  void body;
  void throat;

  for (const side of [1, -1]) {
    for (const front of [1, -1]) {
      const prefix = `${front > 0 ? "front" : "rear"}${side > 0 ? "L" : "R"}`;
      const root: [number, number, number] = [side * 0.47, 0.54, front * 0.34];
      const target: [number, number, number] = [side * 0.71, 0.09, front * 0.53];
      const legPoints = limb(root, target, [0.22, 0.25, 0.17], [[0, 0, front], [0, 0, -front]]);
      const leg = b.chain("leg" + prefix, legPoints, {
        parent: hips,
        names: [`shoulder${prefix}`, `elbow${prefix}`, `ankle${prefix}`, `foot${prefix}`],
        role: "leg",
      });
      b.sweep(leg, [0.12, 0.095], {
        color: SKIN,
        section: { ngon: 6 },
        caps: "round",
        group: "legs",
        name: `legSkin${prefix}`,
      });
      b.part(new THREE.SphereGeometry(1, 10, 7), SKIN_BELLY, {
        bone: leg.tip!,
        at: target,
        scale: [0.12, 0.075, 0.14],
        flat: true,
        group: "legs",
        name: `footPad${prefix}`,
      });
      for (const toeSide of [-1, 0, 1]) {
        const toeTarget: [number, number, number] = [
          side * (0.71 + toeSide * 0.07),
          0.045,
          front * (0.62 + (toeSide === 0 ? 0.04 : -0.01)),
        ];
        const toe = b.chain(
          `toe${prefix}${toeSide + 2}`,
          [target, toeTarget],
          {
            parent: leg.tip!,
            names: [`toe${prefix}${toeSide + 2}`, `clawRoot${prefix}${toeSide + 2}`],
            role: "digit",
          },
        );
        b.sweep(toe, [0.032, 0.008], {
          color: CLAW,
          caps: "point",
          section: { ngon: 5 },
          group: "digits",
          name: `toeClaw${prefix}${toeSide + 2}`,
        });
      }
    }
  }

  b.sweep([jawUpper.at, [0, 0.84, 1.3]], 0.105, {
    bone: jawUpper,
    color: SKIN,
    section: { ngon: 7 },
    caps: "round",
    group: "head",
    name: "upperJaw",
  });
  b.sweep([jawLower.at, [0, 0.72, 1.29]], 0.095, {
    bone: jawLower,
    color: SKIN_BELLY,
    section: { ngon: 7 },
    caps: "round",
    group: "head",
    name: "lowerJaw",
  });
  b.part(new THREE.SphereGeometry(1, 16, 10), SKIN, {
    bone: head,
    at: [0, 0.85, 1.0],
    scale: [0.22, 0.2, 0.27],
    flat: true,
    group: "head",
    name: "tortoiseHead",
  });
  for (const side of [1, -1]) {
    const cheek = b.part(new THREE.SphereGeometry(1, 10, 7), SKIN_BELLY, {
      bone: head,
      at: [side * 0.14, 0.8, 1.09],
      scale: [0.1, 0.095, 0.08],
      flat: true,
      group: "head",
      name: `cheek${side > 0 ? "L" : "R"}`,
    });
    void cheek;
  }
  const eyeTexture = animeEye({ iris: "#67e9ff", irisLight: "#d8ffff", irisDark: "#185a9a", blush: "#ff93b9", size: 512 });
  const headPart = b.part(new THREE.SphereGeometry(1, 16, 10), SKIN, {
    bone: head,
    at: [0, 0.85, 1.0],
    scale: [0.22, 0.2, 0.27],
    flat: true,
    group: "head",
    name: "eyeSurface",
  });
  const eyeSurface = b.surface(headPart);
  for (const side of [1, -1]) {
    const hit = eyeSurface.around([0, 0.85, 1.0]).at(side * 34, 12);
    if (hit) {
      b.decal(eyeSurface, eyeTexture, {
        at: hit,
        size: [0.105, 0.135],
        mirror: side > 0,
        lift: 0.003,
        name: `eye${side > 0 ? "L" : "R"}`,
        group: "head",
      });
    }
  }

  const browPaint = cel("#263c42", "#162333");
  for (const side of [1, -1]) {
    b.sweep(
      [
        [side * 0.105, 0.95, 1.14],
        [side * 0.15, 0.98, 1.12],
      ],
      0.014,
      { bone: head, color: browPaint, caps: "round", group: "head", name: `brow${side > 0 ? "L" : "R"}` },
    );
  }
  b.part(new THREE.SphereGeometry(1, 8, 6), INK_SHELL, {
    bone: jawLower,
    at: [0, 0.75, 1.31],
    scale: [0.035, 0.035, 0.022],
    flat: true,
    group: "head",
    name: "nose",
  });

  const shellGlyph = b.extrude(
    [
      [0, 0, "sharp"],
      [0.16, 0.05],
      [0.06, 0.28, "sharp"],
      [-0.06, 0.28, "sharp"],
      [-0.16, 0.05],
    ],
    {
      at: [0, 1.03, -0.03],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.015,
      bevel: 0.008,
      smoothing: 0,
      bone: hips,
      color: SHELL_EDGE,
      group: "crystals",
      name: "geodeGlyph",
    },
  );
  void shellGlyph;

  return b.root;
}
