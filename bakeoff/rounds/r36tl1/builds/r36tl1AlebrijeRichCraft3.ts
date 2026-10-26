import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
  paint,
  spots,
  stripes,
  countershade,
} from "../../../../src/index";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";

export const meta = {
  name: "alebrije jaguar-eagle",
  description:
    "A brightly painted Oaxacan alebrije combining a powerful spotted jaguar body with an eagle head, hooked beak, spread feathered wings, talons, and a curled ornamental tail.",
};

export default function build() {
  const b = createBuilder({ name: "alebrije-jaguar-eagle", detail: 1 });

  const GOLD = cel("#f5a623", "#b83b22");
  const ORANGE = cel("#f26b2f", "#9e2638");
  const TURQUOISE = cel("#16c7b7", "#075d86");
  const MAGENTA = cel("#ed3b82", "#861d6b");
  const PURPLE = cel("#7138b8", "#321b72");
  const GREEN = cel("#66c94d", "#21663a");
  const CREAM = cel("#ffe7a0", "#d88955");
  const DARK = "#28152f";
  const BEAK = cel("#e7bf38", "#9b4b21");
  const CLAW = "#f8d26a";

  const coat = countershade(
    spots(
      furEdge(GOLD, CREAM, {
        level: -0.18,
        teeth: 0.16,
        period: 0.075,
        ink: "#54233c",
        inkWidth: 0.025,
      }),
      [DARK, MAGENTA, PURPLE],
      { size: 0.16, amount: 0.72, rosette: true, seed: 18 },
    ),
    CREAM,
    { level: -0.15, soft: 0.28 },
  );

  const wingPaint = stripes(TURQUOISE, [MAGENTA, ORANGE, PURPLE], {
    size: 0.14,
    width: 0.5,
    wobble: 0.18,
    seed: 8,
  });

  // Skeleton: one root spine, four grounded legs, expressive eagle neck/head, wing fans, and tail.
  const hips = b.joint("hips", {
    at: [0, 0.78, -0.12],
    dir: [0, 0.05, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.78, -0.35],
      [0, 0.86, -0.02],
      [0, 0.91, 0.32],
      [0, 1.0, 0.58],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.98, 0.54],
      [0, 1.1, 0.67],
      [0, 1.3, 0.73],
      [0, 1.48, 0.8],
    ]),
    { parent: spine.tip, names: ["neck1", "neck2", "neck3"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.54, 0.82],
    dir: [0, 0.04, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.48, 0.91],
    dir: [0, -0.1, 1],
    role: "jaw",
    group: "head",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.78, -0.38],
      [0, 0.68, -0.72],
      [0.02, 0.78, -1.05],
      [-0.02, 0.96, -1.34],
      [0.1, 1.08, -1.58],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
    },
  );

  const legData = [
    {
      side: 1,
      name: "foreL",
      root: [0.24, 0.91, 0.43] as [number, number, number],
      foot: [0.29, 0.13, 0.6] as [number, number, number],
      bend: [0, 0, 1] as [number, number, number],
    },
    {
      side: -1,
      name: "foreR",
      root: [-0.24, 0.91, 0.43] as [number, number, number],
      foot: [-0.29, 0.13, 0.6] as [number, number, number],
      bend: [0, 0, 1] as [number, number, number],
    },
    {
      side: 1,
      name: "hindL",
      root: [0.28, 0.8, -0.26] as [number, number, number],
      foot: [0.34, 0.13, -0.52] as [number, number, number],
      bend: [0, 0, -1] as [number, number, number],
    },
    {
      side: -1,
      name: "hindR",
      root: [-0.28, 0.8, -0.26] as [number, number, number],
      foot: [-0.34, 0.13, -0.52] as [number, number, number],
      bend: [0, 0, -1] as [number, number, number],
    },
  ];

  const legs: { chain: any; foot: [number, number, number] }[] = [];
  for (const d of legData) {
    const pts = limb(d.root, d.foot, [0.31, 0.29, 0.25], [d.bend, d.bend], {
      sole: [0, 0, 1],
    });
    const chain = b.chain(d.name, pts, {
      parent: hips,
      names: [`${d.name}Hip`, `${d.name}Knee`, `${d.name}Ankle`, `${d.name}Paw`],
      role: "leg",
      contact: d.foot,
    });
    legs.push({ chain, foot: d.foot });
  }

  // Main continuous body and neck.
  b.sweep(spine, (t) => 0.27 - 0.035 * t, {
    color: coat,
    section: { ngon: 8 },
    sides: 8,
    name: "painted-jaguar-torso",
  });
  b.sweep(neck, (t) => 0.19 - 0.025 * t, {
    color: coat,
    section: { ngon: 8 },
    name: "painted-neck",
  });
  b.sweep(tail, (t) => 0.13 - 0.105 * t, {
    color: stripes(coat, [TURQUOISE, MAGENTA], {
      size: 0.18,
      width: 0.3,
      wobble: 0.2,
      seed: 44,
    }),
    section: { ngon: 7 },
    name: "ornamental-tail",
  });

  for (const leg of legs) {
    b.sweep(leg.chain, (t) => 0.105 - 0.052 * t, {
      color: coat,
      section: { ngon: 7 },
      name: "chunky-painted-leg",
    });
  }

  // Paws and golden toe claws.
  for (const d of legData) {
    const p = d.foot;
    b.part(new THREE.SphereGeometry(0.115, 8, 5), MAGENTA, {
      at: p,
      bone: legs[legData.indexOf(d)].chain.tip,
      scale: [1.0, 0.58, 1.28],
      name: `${d.name}-paw`,
    });
    for (let i = -1; i <= 1; i++) {
      const x = p[0] + i * 0.045;
      b.spike([x, p[1] + 0.025, p[2] + 0.075], [0, -0.08, 1], 0.105, 0.018, {
        color: CLAW,
        name: `${d.name}-talon`,
      });
    }
  }

  // Jaguar head: broad skull, cheek ruffs, cream throat, and painted facial planes.
  const skull = b.part(new THREE.SphereGeometry(0.23, 12, 8), coat, {
    bone: head,
    at: [0, 1.53, 0.84],
    scale: [1.05, 1.0, 1.18],
    name: "eagle-jaguar-skull",
  });
  b.part(new THREE.SphereGeometry(0.145, 10, 6), CREAM, {
    bone: head,
    at: [0, 1.43, 0.99],
    scale: [1.1, 0.7, 0.8],
    name: "cream-face-mask",
  });
  b.part(new THREE.SphereGeometry(0.105, 8, 6), CREAM, {
    bone: jaw,
    at: [0, 1.39, 1.07],
    scale: [1.18, 0.5, 0.82],
    name: "lower-muzzle",
  });

  // Brow crests and rounded ears.
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.105, 8, 6), ORANGE, {
      bone: head,
      at: [s * 0.17, 1.68, 0.8],
      scale: [0.82, 1.22, 0.55],
      name: "round-painted-ear",
    });
    b.part(new THREE.SphereGeometry(0.062, 7, 5), PURPLE, {
      bone: head,
      at: [s * 0.17, 1.68, 0.85],
      scale: [0.8, 1.05, 0.35],
      name: "ear-inner",
    });
    b.part(new THREE.SphereGeometry(0.052, 8, 5), DARK, {
      bone: head,
      at: [s * 0.105, 1.6, 1.015],
      scale: [0.8, 0.72, 0.48],
      name: "painted-cheek-spot",
    });
  }

  const eyeTexture = animeEye({
    iris: "#13d9ca",
    irisLight: "#d5fff2",
    irisDark: "#075c78",
    ink: INK,
    blush: "#f04e88",
  });
  const faceSurface = b.surface(skull);
  for (const s of [-1, 1]) {
    const hit = faceSurface.around([0, 1.54, 0.84]).at(s * 35, 8);
    if (hit)
      b.decal(faceSurface, eyeTexture, {
        at: hit,
        size: [0.115, 0.15],
        mirror: s > 0,
        lift: 0.004,
        name: "huge-painted-eye",
      });
  }

  // Hooked eagle beak, upper and lower separated so the jaw reads as hinged.
  b.part(new THREE.ConeGeometry(0.12, 0.3, 6), BEAK, {
    bone: head,
    at: [0, 1.54, 1.12],
    dir: [0, 0.05, 1],
    scale: [1, 1, 0.72],
    name: "hooked-upper-beak",
  });
  b.part(new THREE.ConeGeometry(0.08, 0.19, 6), ORANGE, {
    bone: jaw,
    at: [0, 1.43, 1.14],
    dir: [0, -0.18, 1],
    scale: [1, 0.7, 0.65],
    name: "lower-beak",
  });
  b.part(new THREE.SphereGeometry(0.035, 7, 5), DARK, {
    bone: head,
    at: [0, 1.61, 1.07],
    scale: [1.5, 0.7, 0.6],
    name: "beak-nostril",
  });

  // Dramatic eagle wings, skeleton first then broad layered feather blades.
  const wingRoots: any[] = [];
  for (const s of [-1, 1]) {
    const root = [s * 0.2, 1.04, 0.34] as [number, number, number];
    const wrist = [s * 0.62, 1.35, 0.12] as [number, number, number];
    const tip = [s * 0.98, 1.47, -0.18] as [number, number, number];
    const wing = b.chain(
      `wing${s > 0 ? "L" : "R"}`,
      catmull([root, [s * 0.42, 1.22, 0.26], wrist, tip]),
      {
        parent: spine.tip,
        names: [`wing${s > 0 ? "L" : "R"}Root`, `wing${s > 0 ? "L" : "R"}Mid`, `wing${s > 0 ? "L" : "R"}Tip`],
        role: "wing",
      },
    );
    wingRoots.push(wing);
    b.sweep(wing, [0.13, 0.045], {
      color: wingPaint,
      section: { ngon: 6 },
      name: "painted-wing-arm",
    });

    const featherTexture = (() => {
      return undefined;
    })();

    // Broad extruded primaries make a strongly readable alebrije silhouette.
    for (let i = 0; i < 7; i++) {
      const u = i / 6;
      const base = wing.at(0.28 + u * 0.5).at;
      const end = [
        s * (0.65 + u * 0.48),
        1.38 + 0.15 * Math.sin(u * Math.PI),
        -0.02 - u * 0.45,
      ];
      b.rod(base, end, 0.042 - u * 0.018, {
        color: [TURQUOISE, MAGENTA, ORANGE, PURPLE][i % 4],
        section: { ngon: 6 },
        name: "layered-primary-feather",
      });
      b.part(new THREE.SphereGeometry(0.065 - u * 0.018, 7, 5), CREAM, {
        at: end,
        bone: wing.tip,
        scale: [1.2, 0.65, 1.7],
        name: "feather-tip",
      });
    }
  }

  // Crown crest: three painted blades behind the eyes.
  for (const s of [-1, 1]) {
    b.extrude(
      [
        [0, 0],
        [0.08, 0.03],
        [0.13, 0.2],
        [0.055, 0.36],
        [0, 0.46],
        [-0.055, 0.25],
      ],
      {
        at: [s * 0.07, 1.69, 0.69],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.025,
        bevel: 0.008,
        color: [MAGENTA, TURQUOISE, ORANGE][s > 0 ? 0 : 1],
        bone: head,
        name: "crown-feather",
      },
    );
  }

  // Decorative dorsal spikes and tail finlets.
  for (let i = 0; i < 6; i++) {
    const at = spine.at(0.08 + i * 0.12);
    b.spike(at, [0, 1, 0], 0.14 - i * 0.012, 0.045, {
      color: [MAGENTA, TURQUOISE, PURPLE][i % 3],
      name: "back-ornament",
    });
  }
  for (let i = 0; i < 4; i++) {
    const at = tail.at(0.55 + i * 0.1);
    b.spike(at, [0, 1, 0], 0.1 - i * 0.015, 0.032, {
      color: [ORANGE, GREEN, MAGENTA, TURQUOISE][i],
      name: "tail-finlet",
    });
  }

  // Bright ornamental collar and painted cheek whiskers.
  const collar = b.surface(neck).loop(neck.at(0.35), { lift: 0.012 });
  b.sweep(collar, 0.028, { color: MAGENTA, name: "painted-collar" });

  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const from = [s * (0.08 + i * 0.025), 1.47 - i * 0.035, 1.08];
      const to = [s * (0.25 + i * 0.045), 1.44 - i * 0.05, 1.13 + i * 0.025];
      b.rod(from, to, 0.008, {
        color: DARK,
        caps: "round",
        name: "painted-whisker",
      });
    }
  }

  // Small round pigment studs reinforce the hand-painted wood character.
  const bodySurface = b.surface(spine);
  const studHits = bodySurface.scatter(28, {
    rng: rng(404),
    minDist: 0.12,
    filter: (h: any) => h.n.y > -0.2,
  });
  for (let i = 0; i < studHits.length; i++) {
    b.stick(
      new THREE.SphereGeometry(0.018, 6, 4),
      [TURQUOISE, MAGENTA, PURPLE, CREAM][i % 4],
      studHits[i],
      { embed: 0.35, name: "hand-painted-stud" },
    );
  }

  return b.root;
}
