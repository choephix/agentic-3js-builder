import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { catmull, bezier } from "../src/path";
import { limb } from "../src/ik";
import { scales, countershade } from "../src/paint";
import { cel, furEdge, animeEye, INK } from "../kits/toon";
import { glow } from "../kits/glow";
import { svg } from "../src/texture";
import { rng } from "../src/math";
const INK_SOFT = "#241536";

const VIOLET_SHADOW = "#4b2e70";
const VIOLET = "#6e3fb1";
const LILAC = "#d8b8ff";
const LILAC_SHADOW = "#8656b1";
const CREAM = "#ffe1ba";
const CREAM_SHADOW = "#bd7180";
const GOLD = "#f3bf55";
const GOLD_SHADOW = "#a55a39";
const HORN = "#f7e8c7";
const HORN_SHADOW = "#b486a4";
const AQUA = "#55e5dd";
const HOOF = "#33204f";
const AQUA_DARK = "#208ca8";
const TOOTH = "#fff7e6";

const SCALE_FIELD = scales(VIOLET, "#bb79d2", { size: 0.095, width: 0.22, seed: 17 });
const COAT = countershade(cel(SCALE_FIELD, VIOLET_SHADOW), CREAM, { level: -0.25 });
const NECK_COAT = cel(
  furEdge(SCALE_FIELD, CREAM, { level: -0.16, teeth: 0.16, period: 0.07, along: [1, 0, 0], ink: INK }),
  VIOLET_SHADOW,
);
const MUZZLE = cel(furEdge(CREAM, LILAC, { by: "position", axis: [0, 1, 0], level: 1.53, teeth: 0.035, period: 0.04 }), CREAM_SHADOW);
const MANE = cel(furEdge(LILAC, "#f4e4ff", { level: -0.12, teeth: 0.1, period: 0.06, along: [0, 0, 1] }), LILAC_SHADOW);
const BELLY = cel(CREAM, CREAM_SHADOW);
const GOLD_CEL = cel(GOLD, GOLD_SHADOW);
const HORN_CEL = cel(HORN, HORN_SHADOW);
const AQUA_CEL = cel(AQUA, AQUA_DARK);

const CLOUD_TEXTURE = svg(
  `<svg viewBox="0 0 128 128">
    <path d="M18 100 Q18 75 38 74 Q39 47 61 51 Q72 26 93 45 Q112 44 112 68 Q126 75 112 93 Q102 106 82 103 L35 105 Z" fill="#f6e8ff"/>
    <path d="M28 93 Q31 78 46 80 Q54 59 70 66 Q80 49 96 62 Q108 64 108 78 Q116 86 104 96 Z" fill="#c99eea" opacity=".72"/>
    <path d="M23 105 Q55 97 113 102" fill="none" stroke="#6f4a93" stroke-width="5" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);
const RUNE_TEXTURE = svg(
  `<svg viewBox="0 0 128 128">
    <circle cx="64" cy="64" r="49" fill="#55e5dd" fill-opacity=".13" stroke="#55e5dd" stroke-width="6"/>
    <path d="M64 21 L74 52 L106 58 L80 76 L84 108 L64 89 L44 108 L48 76 L22 58 L54 52 Z" fill="none" stroke="#fff5d5" stroke-width="5" stroke-linejoin="round"/>
  </svg>`,
  { size: 192 },
);

export const meta = {
  name: "Qilin",
  description: "A scaled hooved qilin with luminous eyes, branching antlers, and a cloudlike mane.",
  style: "high-fantasy anime",
  commit: "e503085",
};

export default function build() {
  const b = createBuilder({ name: "qilin", detail: 1.05, paintSize: 1024 });

  // Skeleton first: a calm quadruped rest pose with separated legs, jaw, tail, and head.
  const hips = b.joint("hips", { at: [0, 1.13, -0.2], dir: [0, 0, 1], role: "spine" });
  const spinePath = catmull([
    [0, 1.13, -0.72],
    [0, 1.2, -0.35],
    [0, 1.3, 0.08],
    [0, 1.39, 0.46],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spineRear", "spineMid", "spineFront"],
    role: "spine",
  });
  const neckPath = catmull([
    [0, 1.39, 0.46],
    [0, 1.5, 0.62],
    [0, 1.65, 0.78],
    [0, 1.77, 0.92],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: spine.joints[2],
    names: ["neckBase", "neckMid", "neckTop"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[2], at: [0, 1.8, 0.94], dir: [0, 0.04, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.16, down: 0.08 }),
    aim: head.local({ forward: 0.46, down: 0.13 }),
    role: "jaw",
  });

  const legSpecs = [
    { side: 1, front: false, root: [0.27, 1.16, -0.43] as [number, number, number], foot: [0.33, 0.085, -0.62] as [number, number, number], parent: spine.joints[0], names: ["hipHL", "kneeHL", "hockHL", "hoofHL"] },
    { side: -1, front: false, root: [-0.27, 1.16, -0.43] as [number, number, number], foot: [-0.33, 0.085, -0.62] as [number, number, number], parent: spine.joints[0], names: ["hipHR", "kneeHR", "hockHR", "hoofHR"] },
    { side: 1, front: true, root: [0.25, 1.3, 0.33] as [number, number, number], foot: [0.3, 0.085, 0.47] as [number, number, number], parent: spine.joints[2], names: ["shoulderFL", "elbowFL", "wristFL", "hoofFL"] },
    { side: -1, front: true, root: [-0.25, 1.3, 0.33] as [number, number, number], foot: [-0.3, 0.085, 0.47] as [number, number, number], parent: spine.joints[2], names: ["shoulderFR", "elbowFR", "wristFR", "hoofFR"] },
  ];
  const legs = legSpecs.map((spec) => {
    const points = limb(spec.root, spec.foot, [0.38, 0.4, 0.34], spec.front ? [[0, 0, 1], [0, 0, -1]] : [[0, 0, 1], [0, 0, -1]]);
    return {
      spec,
      chain: b.chain(spec.front ? `foreLeg${spec.side > 0 ? "L" : "R"}` : `hindLeg${spec.side > 0 ? "L" : "R"}`, points, {
        parent: spec.parent,
        names: spec.names,
        role: "leg",
        contact: spec.foot,
      }),
    };
  });

  const tailPath = catmull([
    [0, 1.14, -0.67],
    [0, 1.15, -1.02],
    [0.02, 1.25, -1.38],
    [0.05, 1.43, -1.72],
    [0.02, 1.6, -1.98],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4"],
    role: "tail",
  });

  // Main skin: flattened torso, long scaled neck, and tapering tail.
  const body = b.sweep(spine, (t) => 0.3 + 0.055 * Math.sin(t * Math.PI), {
    color: COAT,
    section: { ngon: 8 },
    shift: (t) => [0, -0.035 - 0.02 * Math.sin(t * Math.PI)],
    name: "scaledBody",
  });
  const neckTube = b.sweep(neck, (t) => 0.235 - t * 0.04, {
    color: NECK_COAT,
    section: { ngon: 8 },
    shift: [0, -0.01],
    name: "scaledNeck",
  });
  const tailTube = b.sweep(tail, (t) => 0.13 * (1 - t) + 0.014, {
    color: COAT,
    bands: [[0.72, LILAC], [0.9, CREAM]],
    section: { ngon: 8 },
    name: "scaledTail",
  });
  const legTubes = legs.map(({ chain, spec }) =>
    b.sweep(chain, [0.105, 0.09, 0.058], {
      color: COAT,
      section: { ngon: 7 },
      name: `${spec.front ? "fore" : "hind"}Leg${spec.side > 0 ? "L" : "R"}`,
    }),
  );

  // Skull, muzzle, lower jaw, and the distinctive split mouth.
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), COAT, {
    bone: head,
    at: head.at,
    scale: [0.29, 0.33, 0.26],
    name: "skull",
  });
  b.frustumBox(
    head.local({ forward: 0.04, down: 0.02 }),
    head.local({ forward: 0.48, down: 0.04 }),
    [0.23, 0.2],
    [0.14, 0.13],
    { bone: head, color: MUZZLE, name: "upperMuzzle" },
  );
  const lowerMuzzle = b.sweep(catmull([jaw.at, jaw.local({ forward: 0.34, down: 0.1 })]), [0.14, 0.1], {
    bone: jaw,
    color: MUZZLE,
    section: { ngon: 7 },
    name: "lowerJaw",
  });
  const nose = b.part(new THREE.SphereGeometry(1, 9, 7), INK_SOFT, {
    bone: head,
    at: head.local({ forward: 0.49, down: 0.03 }),
    scale: [0.15, 0.075, 0.11],
    name: "velvetNose",
  });
  const mouthLine = b.rod(
    head.local({ forward: 0.48, down: 0.09 }),
    head.local({ forward: 0.17, down: 0.1 }),
    0.009,
    { bone: head, color: INK, name: "mouthLine" },
  );
  b.part(new THREE.SphereGeometry(0.04, 7, 5), BELLY, {
    bone: jaw,
    at: jaw.local({ forward: 0.27, up: 0.01 }),
    scale: [1.5, 0.8, 0.45],
    name: "tongue",
  });
  for (const s of [1, -1]) {
    b.spike(head.local({ right: -s * 0.09, forward: 0.29, down: 0.03 }), [0, -1, 0], 0.075, 0.014, {
      bone: head,
      color: TOOTH,
      name: `fang${s > 0 ? "L" : "R"}`,
    });
  }
  void lowerMuzzle;
  void nose;
  void mouthLine;

  // Eyes are large anime decals, backed by small luminous iris gems.
  const eyeTexture = animeEye({ iris: AQUA, irisLight: "#d6ffff", irisDark: AQUA_DARK, ink: INK, blush: "#ed88b8", size: 512 });
  const skullSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSurface.around(skull.at).at(s * 48, 14);
    if (hit) {
      const eye = b.decal(skull, eyeTexture, {
        at: hit,
        size: [0.12, 0.16],
        dir: [0, 0.1, 1],
        mirror: s > 0,
        name: `animeEye${s > 0 ? "L" : "R"}`,
      });
      glow(eye, 1.15);
    }
  }
  for (const s of [1, -1]) {
    glow(
      b.part(new THREE.SphereGeometry(0.035, 8, 6), AQUA, {
        bone: head,
        at: head.local({ right: -s * 0.17, forward: 0.205, up: 0.08 }),
        name: `eyeGem${s > 0 ? "L" : "R"}`,
      }),
      1.4,
    );
  }

  // Four jewel hooves, with a gold fetlock ring and a small toe split.
  legs.forEach(({ chain, spec }) => {
    const tip = chain.tip!;
    b.part(new THREE.SphereGeometry(1, 8, 6), HOOF, {
      bone: tip,
      at: tip.at,
      scale: [0.115, 0.085, 0.15],
      name: `${spec.front ? "fore" : "hind"}Hoof${spec.side > 0 ? "L" : "R"}`,
    });
    b.rod(
      tip.local({ forward: -0.035, up: 0.07 }),
      tip.local({ forward: 0.045, up: 0.07 }),
      0.014,
      { bone: tip, color: GOLD_CEL, name: `${spec.front ? "fore" : "hind"}Fetlock${spec.side > 0 ? "L" : "R"}` },
    );
    for (const toe of [-1, 1]) {
      b.spike(
        tip.local({ right: toe * 0.045, forward: 0.08, up: 0.02 }),
        [0, 0, 1],
        0.075,
        0.024,
        { bone: tip, color: HOOF, name: `${spec.front ? "fore" : "hind"}Toe${toe > 0 ? "L" : "R"}` },
      );
    }
  });

  // Mane clouds: rounded puffs plus a repeating illustrated cloud-card fringe.
  const manePuffs = [
    [0, 1.46, 0.45, 0.27], [0, 1.63, 0.6, 0.25], [0, 1.79, 0.77, 0.22],
    [0.16, 1.53, 0.57, 0.2], [-0.16, 1.53, 0.57, 0.2], [0.17, 1.7, 0.7, 0.18], [-0.17, 1.7, 0.7, 0.18],
    [0, 1.46, 0.05, 0.26], [0, 1.37, -0.2, 0.23], [0, 1.33, -0.43, 0.2],
  ];
  manePuffs.forEach(([x, y, z, r], i) => {
    b.part(new THREE.SphereGeometry(1, 9, 7), MANE, {
      bone: i < 7 ? neck.joints[Math.min(2, Math.floor(i / 3))] : spine.joints[Math.min(2, Math.floor((i - 7) / 2))],
      at: [x, y, z],
      scale: [r * 0.9, r * 1.15, r],
      name: `maneCloud${i}`,
    });
  });
  b.along(neckTube, 5, (at) => b.spike(at, at, 0.055, 0.02, { color: LILAC, name: "neckManeSpine" }));
  legTubes.forEach((tube, i) => {
    b.along(tube, 3, (at) => b.spike(at, at, 0.042, 0.017, { color: GOLD_CEL, name: `legTrim${i}` }));
  });
  const maneFrames = [
    frame([0.18, 1.52, 0.53], [0, 0.25, 0.97]), frame([-0.18, 1.52, 0.53], [0, 0.25, 0.97]),
    frame([0.18, 1.68, 0.71], [0, 0.2, 0.98]), frame([-0.18, 1.68, 0.71], [0, 0.2, 0.98]),
    frame([0, 1.36, -0.05], [0, 0.25, 0.97]), frame([0, 1.31, -0.35], [0, 0.2, 0.98]),
  ];
  b.cards(maneFrames, CLOUD_TEXTURE, { size: [0.2, 0.3], lean: 18, bend: 18, cross: true, vary: 0.18, rng: rng(44), color: MANE, name: "cloudManeCards" });

  // Antler crown and side ears, with cyan rune cards at their roots.
  const crownHit = skullSurface.around(skull.at).at(0, 73);
  if (crownHit) {
    for (const s of [1, -1]) {
      const base = crownHit.moved([s * 0.12, 0.01, 0]);
      const antlerPath = catmull([
        base.at,
        [s * 0.2, 2.04, 1.0],
        [s * 0.26, 2.21, 1.05],
        [s * 0.21, 2.39, 1.1],
      ]);
      b.sprout(`antler${s > 0 ? "L" : "R"}`, base, antlerPath, [0.055, 0.012], {
        count: 0,
        color: HORN_CEL,
        caps: { end: "point" },
        name: `antlerMain${s > 0 ? "L" : "R"}`,
      });
      const tineRoots = [
        [s * 0.2, 2.03, 1.0] as [number, number, number],
        [s * 0.24, 2.15, 1.03] as [number, number, number],
        [s * 0.25, 2.27, 1.07] as [number, number, number],
      ];
      const tineTips = [
        [s * 0.38, 2.12, 1.04] as [number, number, number],
        [s * 0.42, 2.25, 1.08] as [number, number, number],
        [s * 0.36, 2.36, 1.12] as [number, number, number],
      ];
      tineRoots.forEach((root, i) => {
        b.sweep(bezier(root, [s * (0.31 + i * 0.01), root[1] + 0.04, root[2]], tineTips[i]), [0.032, 0], {
          bone: head,
          color: HORN_CEL,
          caps: { end: "point" },
          name: `antlerTine${s > 0 ? "L" : "R"}${i}`,
        });
      });
      glow(
        b.cards([frame(base.moved([0, 0.025, 0]), crownHit.n)], RUNE_TEXTURE, {
          size: [0.09, 0.09],
          color: AQUA,
          lean: 0,
          mirror: s > 0,
          name: `antlerRune${s > 0 ? "L" : "R"}`,
        }),
        1.4,
      );
    }
  }

  // Deer-like swept ears and a row of dorsal mane spikes.
  for (const s of [1, -1]) {
    const earBase = head.local({ right: -s * 0.19, back: 0.03, up: 0.15 });
    const earTip = head.local({ right: -s * 0.34, back: 0.08, up: 0.38 });
    b.sweep(bezier(earBase, head.local({ right: -s * 0.28, up: 0.28, back: 0.01 }), earTip), [0.07, 0.012], {
      bone: head,
      color: MANE,
      caps: { end: "point" },
      name: `ear${s > 0 ? "L" : "R"}`,
    });
  }
  b.along(body, 8, (at) => b.spike(at, at, 0.1, 0.032, { color: GOLD_CEL, name: "dorsalGoldSpine" }));
  b.along(tailTube, 7, (at) => b.spike(at, at, 0.07, 0.022, { color: LILAC, name: "tailCloudSpine" }));

  // Ornate celestial collar and shoulder medallions.
  const collarItems = b.ring(neck.joints[1], { count: 14, radius: 0.225, name: "celestialCollar", role: "hinge" });
  b.sweep(catmull(collarItems.items, { closed: true }), 0.018, { color: GOLD_CEL, name: "goldCollar" });
  collarItems.items.forEach((item, i) => {
    if (i % 2 === 0) {
      glow(b.part(new THREE.SphereGeometry(0.026, 7, 5), AQUA, { at: item.at, bone: item.bone, name: `collarGem${i}` }), 1.1);
    }
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.075, 8, 6), GOLD_CEL, {
      bone: spine.joints[2],
      at: [s * 0.285, 1.31, 0.38],
      scale: [1, 0.6, 0.35],
      name: `shoulderMedallion${s > 0 ? "L" : "R"}`,
    });
    glow(
      b.part(new THREE.SphereGeometry(0.025, 7, 5), AQUA, {
        bone: spine.joints[2],
        at: [s * 0.285, 1.34, 0.42],
        name: `shoulderGem${s > 0 ? "L" : "R"}`,
      }),
      1.25,
    );
  }

  // Small golden scale studs emphasize the shoulder line and flank without losing the blocky silhouette.
  const bodySurface = b.surface(body);
  const studPoints = [
    [0.25, 1.37, 0.18], [-0.25, 1.37, 0.18], [0.27, 1.3, -0.02], [-0.27, 1.3, -0.02],
    [0.25, 1.23, -0.25], [-0.25, 1.23, -0.25],
  ];
  studPoints.forEach((point, i) => {
    const hit = bodySurface.nearest(point);
    b.stick(new THREE.ConeGeometry(0.035, 0.025, 6), i % 2 === 0 ? GOLD_CEL : AQUA_CEL, hit, { embed: 0.3, name: `scaleStud${i}` });
  });

  return b.root;
}
