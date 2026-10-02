import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull, bezier } from "../src/path";
import { rng } from "../src/math";
import { countershade, mottle } from "../src/paint";
import { glow } from "../kits/glow";

const INK = "#17152c";
const PLUM = "#322b58";
const PLUM_LIGHT = "#59417a";
const BELLY = "#9b5b4a";
const CHEST = "#d0a06e";
const GOLD = "#e7aa43";
const GOLD_DARK = "#7a3e30";
const CREST = "#743c8d";
const WING = "#292746";
const WING_EDGE = "#55346e";
const MEMBRANE = "#40315f";
const CYAN = "#39e7ed";
const CYAN_DARK = "#155a78";
const TALON = "#d6c47b";
const MOUTH = "#491d3f";

export const meta = {
  name: "Harpy Eagle",
  description: "A crest-raised harpy eagle with broad spread wings, ornate plumage, and glowing League magic in its eyes.",
  style: "League of Legends",
  commit: "9555ebf",
};

export default function build() {
  const b = createBuilder({ name: "harpyEagle", detail: 1 });
  const featherRng = rng(27);

  const plumage = countershade(
    mottle(PLUM, PLUM_LIGHT, { size: 0.22, contrast: 0.65, seed: 11 }),
    BELLY,
    { level: -0.22, soft: 0.35 },
  );
  const darkFeather = mottle(WING, WING_EDGE, { size: 0.14, contrast: 0.55, seed: 19 });

  // Skeleton first: the bird is airborne, with the feet hanging below the spread body.
  const hips = b.joint("hips", { at: [0, 1.55, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.55, 0],
      [0, 1.61, 0.2],
      [0, 1.73, 0.43],
      [0, 1.84, 0.62],
    ]),
    { parent: hips, names: ["back", "chest", "shoulder", "spineTip"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.84, 0.62],
      [0, 2.02, 0.79],
      [0, 2.17, 0.95],
      [0, 2.26, 1.04],
    ]),
    { parent: spine.joints[3], names: ["neck1", "neck2", "neck3", "neckTip"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[3], at: [0, 2.29, 1.08], dir: [0, 0.08, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: head.local([0, 0.045, -0.08]), dir: [0, -0.2, 1], role: "jaw" });

  const wingPoints = (s: number) => [
    [s * 0.28, 1.79, 0.43],
    [s * 0.57, 1.98, 0.28],
    [s * 0.82, 1.95, 0.09],
    [s * 1.08, 1.79, -0.06],
    [s * 1.23, 1.62, -0.16],
  ] as number[][];
  const wingL = b.chain("wingL", wingPoints(1), {
    parent: spine.joints[2],
    names: ["shoulderL", "elbowL", "wristL", "wingTipL", "primaryL"],
    role: "wing",
  });
  const wingR = b.chain("wingR", wingPoints(-1), {
    parent: spine.joints[2],
    names: ["shoulderR", "elbowR", "wristR", "wingTipR", "primaryR"],
    role: "wing",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.55, -0.35],
      [0, 1.43, -0.62],
      [0, 1.34, -0.91],
      [0, 1.3, -1.2],
      [0, 1.27, -1.38],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tailTip"], role: "tail" },
  );

  const legPoints = (s: number) => [
    [s * 0.18, 1.49, 0.03],
    [s * 0.24, 1.28, 0.16],
    [s * 0.23, 1.09, 0.11],
    [s * 0.23, 0.91, 0.2],
  ] as number[][];
  const legL = b.chain("legL", legPoints(1), {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
    contact: [0.23, 0.91, 0.2],
  });
  const legR = b.chain("legR", legPoints(-1), {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    contact: [-0.23, 0.91, 0.2],
  });

  const toeChains: Array<{ side: number; leg: typeof legL; index: number; chain: ReturnType<typeof b.chain> }> = [];
  for (const side of [1, -1]) {
    const leg = side === 1 ? legL : legR;
    for (let i = 0; i < 3; i++) {
      const spread = (i - 1) * 0.075;
      const root = [side * 0.23 + spread, 0.91, 0.23];
      const tip = [side * 0.23 + spread * 1.7, 0.82 - Math.abs(i - 1) * 0.015, 0.47 + (i === 1 ? 0.05 : 0)];
      const toe = b.chain(`toe${side > 0 ? "L" : "R"}${i + 1}`, [root, tip], {
        parent: leg.joints[3],
        names: [`toe${side > 0 ? "L" : "R"}${i + 1}`, `claw${side > 0 ? "L" : "R"}${i + 1}`],
        role: "digit",
      });
      toeChains.push({ side, leg, index: i, chain: toe });
    }
  }

  // Main organic volumes.
  b.sweep(spine, (t) => 0.23 - t * 0.045, {
    color: plumage,
    section: { ngon: 8 },
    caps: "round",
    name: "bodyPlumage",
    group: "body",
  });
  b.sweep(neck, [0.19, 0.14], {
    color: plumage,
    section: { ngon: 8 },
    name: "neckPlumage",
    group: "body",
  });
  b.sweep(tail, [0.18, 0.035], {
    color: darkFeather,
    section: { ngon: 7 },
    caps: "round",
    name: "tailBase",
    group: "tail",
  });

  // Warm breast shield and shoulder mantle make the silhouette read from the back and side.
  b.part(new THREE.SphereGeometry(0.25, 10, 7), CHEST, {
    bone: spine.joints[1],
    at: [0, 1.74, 0.52],
    scale: [1, 1.06, 0.75],
    name: "breastShield",
    group: "body",
  });
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.18, 1.7, 0.32],
        [s * 0.4, 1.87, 0.39],
        [s * 0.66, 1.94, 0.25],
      ]),
      [0.13, 0.06],
      { color: GOLD_DARK, bone: spine.joints[2], section: { ngon: 6 }, name: `mantle${s > 0 ? "L" : "R"}`, group: "trim" },
    );
  }

  // Two-layer wings: a heavy leading-arm tube and translucent-looking, saturated membrane geometry.
  for (const [s, wing] of [[1, wingL], [-1, wingR]] as const) {
    b.sweep(wing, (t) => 0.105 - t * 0.065, {
      color: darkFeather,
      section: { ngon: 6 },
      name: `wingArm${s > 0 ? "L" : "R"}`,
      group: "wing",
    });
    const points = wingPoints(s);
    const trailing = [
      [points[0][0], points[0][1] - 0.07, points[0][2] - 0.06],
      [points[1][0], points[1][1] - 0.25, points[1][2] - 0.22],
      [points[2][0], points[2][1] - 0.34, points[2][2] - 0.3],
      [points[3][0], points[3][1] - 0.38, points[3][2] - 0.3],
      [points[4][0], points[4][1] - 0.3, points[4][2] - 0.25],
    ];
    b.membrane(wing, trailing, {
      color: MEMBRANE,
      thickness: 0.018,
      rows: 3,
      cols: 5,
      scallop: 0.08,
      name: `wingWeb${s > 0 ? "L" : "R"}`,
      group: "wing",
    });

    // Six individually readable primary feathers, fanned from the outer wing.
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const x = s * (0.78 + t * 0.42);
      const y = 1.66 - t * 0.19;
      const z = -0.08 - t * 0.16;
      const length = 0.52 + t * 0.18;
      b.extrude(
        [
          [0, 0],
          [length * 0.72, -0.015],
          [length, 0.08],
          [length * 0.68, 0.19],
          [length * 0.16, 0.16],
          [-0.04, 0.06],
        ],
        {
          at: [x, y, z],
          x: [0, 0, -1],
          y: [0, 1, 0],
          thickness: [0.028, 0.008],
          bevel: 0.012,
          smoothing: 1,
          color: i % 2 === 0 ? PLUM : WING_EDGE,
          bone: wing.joints[3],
          name: `primaryFeather${s > 0 ? "L" : "R"}${i + 1}`,
          group: "feathers",
        },
      );
      // A gold quill line gives the League-style graphic accent without flattening the feather silhouette.
      b.sweep(
        bezier([x, y + 0.02, z], [x, y + 0.03, z - length * 0.28], [x, y + 0.04, z - length * 0.64], [x, y + 0.065, z - length * 0.88]),
        [0.012, 0.004],
        { color: GOLD_DARK, caps: "point", bone: wing.joints[3], name: `quill${s > 0 ? "L" : "R"}${i + 1}`, group: "trim" },
      );
      // The quill itself is the graphic accent; keeping it separate avoids a floating stud at this scale.
    }
  }

  // Broad layered tail fans.
  for (let i = -2; i <= 2; i++) {
    const spread = i * 0.18;
    const fanRoot = [spread, 1.27 + Math.abs(i) * 0.015, -1.2 - Math.abs(i) * 0.05];
    b.rod(tail.joints[4], fanRoot, 0.018, { color: WING_EDGE, name: `tailShaft${i + 3}`, group: "tail" });
    b.extrude(
      [
        [0, 0],
        [0.52, -0.03],
        [0.74, 0.07],
        [0.48, 0.18],
        [0.05, 0.16],
        [-0.04, 0.05],
      ],
      {
        at: fanRoot,
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: [0.025, 0.006],
        bevel: 0.01,
        smoothing: 1,
        color: i === 0 ? PLUM_LIGHT : WING,
        bone: tail.joints[4],
        name: `tailFan${i + 3}`,
        group: "tail",
      },
    );
  }

  // Legs, scaled golden ankle guards, and expressive hooked toes.
  for (const [s, leg] of [[1, legL], [-1, legR]] as const) {
    b.sweep(leg, [0.065, 0.035], {
      color: GOLD_DARK,
      section: { ngon: 6 },
      name: `leg${s > 0 ? "L" : "R"}`,
      group: "legs",
    });
    b.part(new THREE.SphereGeometry(0.075, 8, 5), GOLD, {
      bone: leg.joints[1],
      at: leg.joints[1].at,
      scale: [1.1, 0.7, 0.9],
      name: `kneeGuard${s > 0 ? "L" : "R"}`,
      group: "trim",
    });
  }
  for (const item of toeChains) {
    const sideName = item.side > 0 ? "L" : "R";
    b.sweep(item.chain, [0.023, 0.01], {
      color: TALON,
      section: { ngon: 6 },
      caps: "round",
      name: `toe${sideName}${item.index + 1}`,
      group: "talons",
    });
    b.spike(item.chain.joints[1], item.chain.joints[1].dir([0, -0.25, 1]), 0.14, 0.022, {
      color: INK,
      caps: "point",
      name: `hook${sideName}${item.index + 1}`,
      group: "talons",
    });
  }

  // Head mass, hooked beak, separate opening jaw, throat ruff, and raised crest.
  b.part(new THREE.SphereGeometry(0.245, 10, 8), plumage, {
    bone: head,
    at: head.at,
    scale: [0.96, 1.02, 1.16],
    name: "headPlumage",
    group: "head",
  });
  b.part(new THREE.SphereGeometry(0.2, 9, 7), CHEST, {
    bone: head,
    at: head.local([0, 0.01, -0.13]),
    scale: [0.93, 0.8, 0.72],
    name: "faceDisk",
    group: "head",
  });
  b.part(new THREE.ConeGeometry(0.105, 0.27, 7), GOLD, {
    bone: head,
    at: head.local([0, 0.17, 0.0]),
    dir: [0, 0, 1],
    axis: "y",
    rotation: [0, 0, 0],
    scale: [1, 1, 0.72],
    name: "upperBeak",
    group: "beak",
  });
  b.part(new THREE.ConeGeometry(0.072, 0.18, 7), GOLD_DARK, {
    bone: jaw,
    at: jaw.local([0, 0.11, -0.015]),
    dir: [0, 0, 1],
    axis: "y",
    scale: [1, 1, 0.66],
    name: "lowerBeak",
    group: "beak",
  });
  b.rod(head.local([0, 0.09, -0.06]), jaw.local([0, 0.08, -0.035]), 0.013, {
    color: MOUTH,
    name: "mouthLine",
    group: "beak",
  });

  const eyeSocket = new THREE.SphereGeometry(0.066, 8, 6);
  const eyeOrb = new THREE.SphereGeometry(0.045, 8, 6);
  for (const s of [1, -1]) {
    b.part(eyeSocket, INK, {
      bone: head,
      at: head.local([s * 0.145, 0.1, 0.055]),
      scale: [1.15, 0.72, 0.85],
      name: `eyeSocket${s > 0 ? "L" : "R"}`,
      group: "face",
    });
    const eye = b.part(eyeOrb, CYAN, {
      bone: head,
      at: head.local([s * 0.148, 0.145, 0.06]),
      name: `arcEye${s > 0 ? "L" : "R"}`,
      group: "magic",
    });
    glow(eye, 2.2);
    b.part(new THREE.SphereGeometry(0.012, 6, 4), GOLD, {
      bone: head,
      at: head.local([s * 0.151, 0.174, 0.063]),
      name: `eyeSpark${s > 0 ? "L" : "R"}`,
      group: "magic",
    });
  }

  // A raised crown of six angular feathers; each is a separate readable silhouette.
  const crestShape: [number, number][] = [[-0.04, 0], [0.1, 0.02], [0.19, 0.22], [0.11, 0.43], [-0.02, 0.25]];
  for (let i = 0; i < 6; i++) {
    const lateral = (i - 2.5) * 0.055;
    const scale = 0.83 + (i % 2) * 0.1;
    b.extrude(crestShape.map(([x, y]) => [x * scale, y * scale] as [number, number]), {
      at: [lateral, 2.38 + Math.abs(i - 2.5) * 0.012, 1.0 - Math.abs(i - 2.5) * 0.025],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: [0.035, 0.008],
      bevel: 0.009,
      smoothing: 1,
      color: i % 2 ? CREST : PLUM_LIGHT,
      bone: head,
      name: `crest${i + 1}`,
      group: "crest",
    });
    b.spike([lateral, 2.53, 0.94], [0, 0.42, -0.13], 0.16 + (i % 2) * 0.03, 0.03, {
      color: GOLD_DARK,
      caps: "point",
      bone: head,
      name: `crestRidge${i + 1}`,
      group: "crest",
    });
  }

  // Small neck ruff wedges create the iconic harpy silhouette.
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const y = 1.94 - i * 0.07;
      const hit = [s * (0.13 + i * 0.012), y, 0.72 - i * 0.015];
      b.spike(hit, [s * 0.35, -0.12, -0.08], 0.18, 0.055, {
        color: i % 2 ? PLUM_LIGHT : CREST,
        caps: "point",
        bone: neck.joints[Math.min(i, neck.joints.length - 1)],
        name: `ruff${s > 0 ? "L" : "R"}${i + 1}`,
        group: "head",
      });
    }
  }

  // Arcane chest sigil, a few gold discs and cyan points: saturated graphic accents in the LoL style.
  const sigil = b.part(new THREE.TorusGeometry(0.11, 0.012, 5, 10), CYAN_DARK, {
    bone: spine.joints[1],
    at: [0, 1.79, 0.725],
    dir: [0, 0, 1],
    axis: "z",
    rotation: [0, 0, 0],
    name: "chestSigil",
    group: "magic",
  });
  glow(sigil, 0.8);
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.028, 7, 5), GOLD, {
      bone: spine.joints[2],
      at: [s * 0.34, 1.84, 0.46],
      name: `mantleGem${s > 0 ? "L" : "R"}`,
      group: "trim",
    });
  }

  // A tiny deterministic variation keeps feather studs from feeling stamped while preserving reproducibility.
  for (let i = 0; i < 5; i++) {
    const s = i % 2 ? 1 : -1;
    const x = s * (0.14 + featherRng() * 0.15);
    const z = 0.36 + featherRng() * 0.25;
    b.part(new THREE.SphereGeometry(0.018 + featherRng() * 0.008, 6, 4), GOLD_DARK, {
      bone: spine.joints[1],
      at: [x, 1.72 + featherRng() * 0.13, z],
      name: `breastStud${i + 1}`,
      group: "trim",
    });
  }

  return b.root;
}
