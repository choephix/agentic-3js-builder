import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { cel, animeEye, furEdge } from "../kits/toon";
import { grain, spots } from "../src/paint";
import { svg } from "../src/texture";

const SNOW = cel("#f4f6ff", "#aab9da");
const SNOW_BRIGHT = cel("#ffffff", "#c7d5f1");
const FACE = cel("#eaf0ff", "#a8b9df");
const FEATHER_SHADOW = cel("#cbd6ed", "#7282ad");
const BAR = cel("#66739a", "#313957");
const BEAK = cel("#dba348", "#9b552d");
const TALON = cel("#4a3d48", "#211d2b");
const EYE_GOLD = "#f3b628";
const BARK = grain(cel("#715041", "#3c2b31"), cel("#b27b50", "#593b38"), { size: 0.11, axis: "y", seed: 18 });
const BARK_DARK = cel("#49323a", "#271f2b");
const MOSS = cel("#668751", "#34533f");
const MOSS_LIGHT = cel("#9bb85c", "#526c43");

const COAT = furEdge(spots(SNOW, "#c5d0e8", { size: 0.15, amount: 0.24, seed: 22 }), FACE, {
  level: -0.18,
  teeth: 0.11,
  period: 0.06,
  ink: "#6b769b",
  inkWidth: 0.025,
});
const WING_PAINT = furEdge(spots(SNOW_BRIGHT, BAR, { size: 0.18, amount: 0.22, seed: 31 }), FEATHER_SHADOW, {
  level: -0.1,
  teeth: 0.1,
  period: 0.07,
  ink: "#68759a",
  inkWidth: 0.022,
});
const TAIL_PAINT = furEdge(SNOW_BRIGHT, FEATHER_SHADOW, {
  level: -0.2,
  teeth: 0.08,
  period: 0.055,
  ink: "#68759a",
  inkWidth: 0.018,
});

const FEATHER_TEX = svg(
  `<svg viewBox="0 0 48 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 2 C10 25 7 53 13 89 C15 105 19 117 24 126 C29 117 33 105 35 89 C41 53 38 25 24 2Z" fill="#f7f8ff"/>
    <path d="M24 8 L24 120" stroke="#a8b8dc" stroke-width="2"/>
    <path d="M14 72 L24 66 L34 72 M13 84 L24 78 L35 84" fill="none" stroke="#596789" stroke-width="4"/>
  </svg>`,
  { size: 128 },
);
const TUFT_TEX = svg(
  `<svg viewBox="0 0 48 96" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 2 C9 24 10 57 24 94 C38 57 39 24 24 2Z" fill="#ffffff"/>
    <path d="M24 7 L24 89" stroke="#bac9e7" stroke-width="2"/>
  </svg>`,
  { size: 96 },
);
const EYE_TEX = animeEye({ iris: EYE_GOLD, irisLight: "#ffe88a", irisDark: "#8e4f1c", blush: false, size: 512 });

export const meta = {
  name: "Snowy Owl",
  description: "A moon-white snowy owl perched on a rune-cut stump with its broad wings spread in a high-fantasy anime silhouette.",
  style: "high-fantasy anime",
  commit: "67d30d1",
};

export default function build() {
  const b = createBuilder({ name: "snowyOwl", detail: 1.15, paintSize: 2048 });

  // Root and full rest-pose skeleton: the owl remains readable as a rigged neutral spread-wing pose.
  const hips = b.joint("hips", { at: [0, 1.12, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.12, 0.02],
      [0, 1.33, 0.04],
      [0, 1.55, 0.08],
      [0, 1.72, 0.12],
    ]),
    { parent: hips, names: ["spineBase", "spineMid", "spineTop", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.63, 0.1],
      [0, 1.82, 0.14],
      [0, 1.96, 0.2],
    ]),
    { parent: spine.joints[1], names: ["neckBase", "neckTip", "headBase"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.tip!, at: [0, 2.08, 0.23], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.98, 0.38], dir: [0, -0.16, 0.99], role: "jaw" });

  const body = b.sweep(spine, (t) => 0.29 + 0.11 * Math.sin(Math.PI * t), {
    color: COAT,
    section: "circle",
    sides: 10,
    group: "body",
    name: "bodyFeatherMass",
  });
b.part(new THREE.SphereGeometry(1, 14, 10), COAT, {
    bone: spine.joints[2],
    at: [0, 1.5, 0.2],
    scale: [0.31, 0.42, 0.31],
    name: "roundedBreast",
    group: "body",
  });
b.part(new THREE.SphereGeometry(1, 12, 8), FACE, {
    bone: neck.tip!,
    at: [0, 1.86, 0.26],
    scale: [0.22, 0.27, 0.18],
    name: "throatBib",
    group: "body",
  });

  // The massive anime head and face discs make the species read from the front.
  const skull = b.part(new THREE.SphereGeometry(1, 18, 14), FACE, {
    bone: head,
    at: [0, 2.08, 0.23],
    scale: [0.3, 0.3, 0.27],
    name: "skull",
    group: "head",
  });
  const faceDiscL = b.part(new THREE.SphereGeometry(1, 14, 10), SNOW_BRIGHT, {
    bone: head,
    at: [0.135, 2.04, 0.43],
    scale: [0.19, 0.19, 0.06],
    name: "faceDiskL",
    group: "head",
  });
  const faceDiscR = b.part(new THREE.SphereGeometry(1, 14, 10), SNOW_BRIGHT, {
    bone: head,
    at: [-0.135, 2.04, 0.43],
    scale: [0.19, 0.19, 0.06],
    name: "faceDiskR",
    group: "head",
  });
  const skullSurface = b.surface(skull);
  const faceSurfaceL = b.surface(faceDiscL);
  const faceSurfaceR = b.surface(faceDiscR);
  for (const s of [1, -1]) {
    const discSurface = s > 0 ? faceSurfaceL : faceSurfaceR;
    b.decal(discSurface, EYE_TEX, {
      at: [s * 0.135, 2.04, 0.492],
      dir: [0, 0, 1],
      size: [0.105, 0.14],
      mirror: s > 0,
      lift: 0.004,
      name: s > 0 ? "eyeL" : "eyeR",
      group: "face",
    });
  }
  b.part(new THREE.ConeGeometry(0.075, 0.17, 6), BEAK, {
    bone: jaw,
    at: [0, 2.01, 0.52],
    dir: [0, 0, 1],
    axis: "y",
    name: "beak",
    group: "face",
  });
  b.part(new THREE.ConeGeometry(0.055, 0.1, 6), BEAK, {
    bone: jaw,
    at: [0, 1.965, 0.51],
    dir: [0, 0.4, 1],
    axis: "y",
    name: "beakLower",
    group: "face",
  });
  const brow = cel("#e0e8fa", "#8999c1");
  for (const s of [1, -1]) {
    b.sweep(
      bezier([s * 0.06, 2.18, 0.43], [s * 0.13, 2.24, 0.46], [s * 0.22, 2.18, 0.44]),
      [0.024, 0.008],
      { color: brow, bone: head, caps: { end: "point" }, name: s > 0 ? "browL" : "browR", group: "face" },
    );
  }
  // Crown tufts and facial feather cards.
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.16, 2.27, 0.22],
        [s * 0.22, 2.38, 0.2],
        [s * 0.27, 2.45, 0.19],
      ]),
      [0.045, 0.005],
      { color: FACE, bone: head, caps: { end: "point" }, name: s > 0 ? "crownTuftL" : "crownTuftR", group: "head" },
    );
  }
  const crownFrames = [
    frame([0, 2.31, 0.24], [0, 1, 0]),
    frame([0.11, 2.27, 0.25], [0.3, 0.94, 0.1]),
    frame([-0.11, 2.27, 0.25], [-0.3, 0.94, 0.1]),
  ];
  b.cards(crownFrames, TUFT_TEX, { size: [0.08, 0.2], lean: -10, bend: 12, color: SNOW_BRIGHT, sink: 0.12 });

  // Layered white chest and head cards carry the feather language beyond plain solids.
  const bodySurface = b.surface(body);
  b.cards(
    bodySurface.scatter(44, {
      rng: rng(101),
      minDist: 0.065,
      filter: (h) => h.n.y > -0.35,
    }),
    FEATHER_TEX,
    { size: [0.055, 0.13], lean: 34, bend: 16, vary: 0.3, rng: rng(102), color: SNOW_BRIGHT, sink: 0.18 },
  );
  b.cards(
    skullSurface.scatter(18, {
      rng: rng(103),
      minDist: 0.07,
      filter: (h) => h.n.y > -0.15 && h.n.z > 0,
    }),
    TUFT_TEX,
    { size: [0.045, 0.1], lean: 26, bend: 14, vary: 0.25, rng: rng(104), color: FACE, sink: 0.16 },
  );

  // Tail is a separate chain so it can be posed, with painted pale tips and hanging feather cards.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.55, -0.15],
      [0, 1.3, -0.27],
      [0, 1.04, -0.38],
      [0, 0.91, -0.45],
    ]),
    { parent: spine.joints[1], names: ["tailBase", "tailMid", "tailLower", "tailTip"], role: "tail" },
  );
  const tailTube = b.sweep(tail, [0.2, 0.035], {
    color: TAIL_PAINT,
    section: "box",
    name: "tailCore",
    group: "tail",
  });
  b.cards(
    b.along(tail, 9, (at) => at),
    FEATHER_TEX,
    {
      size: [0.13, 0.34],
      lean: 12,
      bend: 10,
      flow: [0, -0.8, -0.35],
      vary: 0.22,
      rng: rng(106),
      color: SNOW_BRIGHT,
      sink: 0.2,
    },
  );
  void tailTube;

  // Spread wings: each is a full bone chain, a double-sided membrane, and ten individually readable primaries.
  for (const s of [1, -1]) {
    const wing = b.chain(
      s > 0 ? "wingL" : "wingR",
      catmull([
        [s * 0.23, 1.68, 0.07],
        [s * 0.48, 1.78, 0.06],
        [s * 0.77, 1.86, 0.02],
        [s * 1.08, 1.82, -0.02],
      ]),
      {
        parent: spine.joints[2],
        names: s > 0 ? ["shoulderL", "elbowL", "wristL", "wingTipL"] : ["shoulderR", "elbowR", "wristR", "wingTipR"],
        role: "wing",
      },
    );
    const underEdge = catmull([
      [s * 0.24, 1.66, 0.05],
      [s * 0.5, 1.51, -0.02],
      [s * 0.76, 1.38, -0.06],
      [s * 1.02, 1.32, -0.08],
    ]);
    b.membrane(wing, underEdge, {
      color: WING_PAINT,
      thickness: 0.018,
      rows: 9,
      cols: 16,
      scallop: 0.16,
      name: s > 0 ? "wingMembraneL" : "wingMembraneR",
      group: "wings",
    });
    const featherCount = 9;
    for (let i = 0; i < featherCount; i++) {
      const t = 0.22 + i * 0.085;
      const root = wing.at(t).at;
      const tip = [s * (0.55 + i * 0.075), 1.41 + i * 0.055, -0.08 - i * 0.035] as [number, number, number];
      const ctrl = [s * (0.42 + i * 0.075), 1.55 + i * 0.06, -0.01 - i * 0.02] as [number, number, number];
      b.sweep(bezier(root, ctrl, tip), [0.043, 0], {
        color: WING_PAINT,
        bands: [[0.61, BAR], [0.84, FEATHER_SHADOW]],
        caps: { end: "point" },
        name: `${s > 0 ? "primaryL" : "primaryR"}${i + 1}`,
        group: "wingFeathers",
      });
    }
    // Three small flight quills angle backward above each wing arm.
    for (let i = 0; i < 3; i++) {
      const base = wing.at(0.25 + i * 0.2).at;
      b.sweep(
        bezier(base, [base.x + s * 0.08, base.y + 0.14, base.z - 0.08], [base.x + s * 0.34, base.y + 0.28, base.z - 0.14]),
        [0.035, 0],
        { color: SNOW_BRIGHT, caps: { end: "point" }, name: `${s > 0 ? "upperQuillL" : "upperQuillR"}${i + 1}`, group: "wingFeathers" },
      );
    }
  }

  // Feathered legs terminate on the stump, then branch into dark hooked digits around the perch.
  for (const s of [1, -1]) {
    const legPath = catmull([
      [s * 0.14, 1.34, 0.02],
      [s * 0.15, 1.2, 0.08],
      [s * 0.15, 1.08, 0.1],
    ]);
    const leg = b.chain(s > 0 ? "legL" : "legR", legPath, {
      parent: hips,
      names: s > 0 ? ["hipL", "ankleL", "footL"] : ["hipR", "ankleR", "footR"],
      role: "leg",
      contact: [s * 0.15, 1.02, 0.1],
    });
    b.sweep(leg, [0.075, 0.035], { color: COAT, section: "box", name: s > 0 ? "featheredLegL" : "featheredLegR", group: "legs" });
    const foot = leg.tip!;
    const toes: Array<[number, number, number]> = [
      [s * 0.18, 1.01, 0.32],
      [s * 0.08, 1.005, 0.36],
      [s * 0.12, 1.0, -0.15],
    ];
    for (let i = 0; i < toes.length; i++) {
      const target = toes[i];
      const mid = [s * (0.15 + (target[0] - s * 0.15) * 0.65), 1.015, target[2] * 0.55] as [number, number, number];
      const digit = b.chain(
        `${s > 0 ? "toeL" : "toeR"}${i + 1}`,
        catmull([foot.at, mid, target]),
        { parent: foot, names: [`${s > 0 ? "toeBaseL" : "toeBaseR"}${i + 1}`, `${s > 0 ? "digitL" : "digitR"}${i + 1}`], role: "digit" },
      );
      b.sweep(digit, [0.019, 0.006], { color: TALON, caps: { end: "point" }, name: `${s > 0 ? "clawL" : "clawR"}${i + 1}`, group: "talons" });
      const hooked = [target[0], 0.95, target[2] + (target[2] > 0 ? 0.035 : -0.035)] as [number, number, number];
      b.sweep(bezier(target, [target[0], 0.98, target[2]], hooked), [0.012, 0], { color: TALON, caps: { end: "point" }, name: `${s > 0 ? "hookL" : "hookR"}${i + 1}`, group: "talons" });
    }
  }

  // Static perch: faceted trunk, growth rings, moss and small fantasy runes.
  b.part(new THREE.CylinderGeometry(0.43, 0.5, 1.05, 10), BARK, {
    bone: hips,
    at: [0, 0.525, 0],
    name: "stump",
    group: "perch",
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.41, 0.41, 0.035, 10), cel("#d2a477", "#79564d"), {
    bone: hips,
    at: [0, 1.06, 0],
    name: "stumpTop",
    group: "perch",
    flat: true,
  });
  for (let i = 0; i < 3; i++) {
    const ang = (i / 3) * Math.PI * 2 + 0.4;
    const x = Math.cos(ang) * 0.28;
    const z = Math.sin(ang) * 0.28;
    b.part(new THREE.TorusGeometry(0.09 + i * 0.035, 0.012, 5, 10), BARK_DARK, {
      bone: hips,
      at: [x, 1.084, z],
      rotation: [0, i * 35, 0],
      name: `growthRing${i + 1}`,
      group: "perch",
    });
  }
  for (const s of [1, -1]) {
    const mossBlob = b.part(new THREE.SphereGeometry(1, 8, 6), MOSS, {
      bone: hips,
      at: [s * 0.34, 1.09, -0.08],
      scale: [0.13, 0.035, 0.16],
      name: s > 0 ? "mossL" : "mossR",
      group: "perch",
    });
    b.part(new THREE.ConeGeometry(0.045, 0.14, 6), MOSS_LIGHT, {
      bone: hips,
      at: [s * 0.32, 1.14, 0.02],
      dir: [s * 0.4, 0.7, 0.3],
      name: s > 0 ? "mossSprigL" : "mossSprigR",
      group: "perch",
    });
    void mossBlob;
  }
  // Three inset-looking rune strokes on the front bark face.
  for (let i = 0; i < 3; i++) {
    const yy = 0.35 + i * 0.22;
    b.sweep(
      catmull([
        [-0.18 + i * 0.04, yy, 0.445],
        [0.02, yy + 0.07, 0.45],
        [0.19 - i * 0.03, yy - 0.02, 0.445],
      ]),
      [0.012, 0.006],
      { color: MOSS_LIGHT, bone: hips, caps: { end: "point" }, name: `rune${i + 1}`, group: "perch" },
    );
  }

  return b.root;
}
