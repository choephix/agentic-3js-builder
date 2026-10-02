import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull, bezier } from "../src/path";
import { countershade, scales, stripes } from "../src/paint";
import { rng } from "../src/math";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

const DEEP = "#102d26";
const GREEN = "#1f6b4f";
const TEAL = "#37a879";
const BELLY = "#d8b86a";
const GOLD = "#f0c64d";
const GOLD_DARK = "#8b5b27";
const HOOD_DARK = "#183f35";
const EYE = "#ffcf4a";
const PUPIL = "#24130d";
const TONGUE = "#d64b63";
const MOUTH = "#5a1f2c";
const FANG = "#f5e7be";
const MAGIC = "#9bf5bd";

const scaleMark = svg(
  `<svg viewBox="0 0 32 32"><path d="M16 2 L29 15 L16 30 L3 15 Z" fill="#e9c34e" stroke="#fff0a3" stroke-width="2"/><path d="M16 7 L23 15 L16 24 L9 15 Z" fill="#245a43"/></svg>`,
  { size: 128 },
);

export const meta = {
  name: "King Cobra",
  description: "A rearing king cobra with a broad flared hood, jeweled eyes, banded scales, and a forked tongue.",
  style: "League of Legends",
  commit: "07503e3",
};

export default function build() {
  const b = createBuilder({ name: "kingCobra", detail: 1.15, paintSize: 2048 });

  // Skeleton first: one root, a low resting coil, then the rising neck and head.
  const core = b.joint("spineRoot", { at: [0, 0.3, -0.18], role: "spine" });
  const bodyPath = catmull([
    [0, 0.16, -1.18],
    [0.46, 0.13, -0.92],
    [0.56, 0.16, -0.50],
    [0.22, 0.24, -0.22],
    core.at,
    [-0.12, 0.56, -0.02],
    [0.03, 1.02, 0.03],
    [-0.02, 1.48, 0.08],
    [0.02, 1.88, 0.16],
    [0, 2.17, 0.31],
    [0, 2.29, 0.47],
  ]);
  const rootT = bodyPath.closestT(core.at);
  const tail = b.chain("tail", bodyPath.slice(rootT, 0), {
    parent: core,
    count: 7,
    names: ["tailBase", "tail2", "tail3", "tail4", "tail5", "tail6", "tailTip"],
    role: "tail",
  });
  const neck = b.chain("neck", bodyPath.slice(rootT, 1), {
    parent: core,
    count: 9,
    names: ["neckBase", "neck2", "neck3", "neck4", "neck5", "neck6", "neck7", "neck8", "neckTip"],
    role: "neck",
  });
  const skinPath = bodyPath;

  const bodyPaint = scales(
    countershade(stripes(DEEP, GREEN, { size: 0.24, axis: "z", width: 0.44, wobble: 0.12, seed: 17 }), BELLY, { level: -0.18 }),
    GOLD_DARK,
    { size: 0.105, width: 0.32, seed: 33 },
  );
  const body = b.sweep(skinPath, (t) => 0.19 - 0.075 * t, {
    bone: [tail, core, neck],
    color: bodyPaint,
    section: { ngon: 8 },
    caps: { start: "round", end: "round" },
    name: "bandedBody",
    group: "body",
  });

  // Neck and tail plates make the silhouette readable even in a dark render.
  let plateIndex = 0;
  b.along(body, 23, (at) => {
    const t = plateIndex / 22;
    const len = 0.032 + 0.055 * Math.sin(Math.PI * t);
    const i = plateIndex++;
    return b.spike(at, at, len, 0.026 + 0.006 * (1 - t), {
      color: i % 3 === 0 ? GOLD : GOLD_DARK,
      caps: "point",
      name: `dorsalPlate${i}`,
      group: "scales",
    });
  });

  // Broad cobra hood, deliberately planar and fan-shaped behind the skull.
  const hoodLeft = catmull([
    [-0.15, 0.90, 0.02],
    [-0.34, 1.22, 0.09],
    [-0.58, 1.58, 0.16],
    [-0.49, 1.88, 0.24],
    [-0.25, 2.13, 0.38],
  ]);
  const hoodRight = catmull([
    [0.15, 0.90, 0.02],
    [0.34, 1.22, 0.09],
    [0.58, 1.58, 0.16],
    [0.49, 1.88, 0.24],
    [0.25, 2.13, 0.38],
  ]);
  const hood = b.membrane(hoodLeft, hoodRight, {
    bone: neck.joints[4],
    color: countershade(HOOD_DARK, "#5d9c62", { level: -0.1 }),
    thickness: 0.025,
    rows: 7,
    cols: 12,
    name: "flaredHood",
    group: "hood",
  });
  // Ornate hood ribs and gold eye-spots are separate readable shapes.
  for (const s of [-1, 1]) {
    const rib = catmull([
      [s * 0.16, 0.97, 0.09],
      [s * 0.32, 1.27, 0.17],
      [s * 0.48, 1.62, 0.24],
      [s * 0.37, 1.93, 0.32],
      [s * 0.20, 2.12, 0.43],
    ]);
    b.sweep(rib, [0.012, 0.006], { bone: neck.joints[4], color: GOLD_DARK, caps: "point", name: `hoodRib${s}` });
  }
  // Scale diamonds down each side of the hood's golden ribs.
  const hoodSurf = b.surface(hood);
  for (const s of [-1, 1]) {
    for (let i = 0; i < 7; i++) {
      const y = 1.10 + i * 0.14;
      const x = s * (0.25 + 0.30 * Math.sin((i / 7) * Math.PI));
      const hit = hoodSurf.nearest([x, y, 0.22]);
      b.stick(new THREE.ConeGeometry(0.055, 0.018, 4), i % 2 ? GOLD : TEAL, hit, { embed: 0.28, name: `hoodScale${s}_${i}` });
    }
  }

  // Head and the two separate jaw bones (the lower jaw is posed slightly open).
  const head = b.joint("head", { parent: neck.joints[neck.joints.length - 1], at: [0, 2.29, 0.47], dir: [0, 0.18, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: head.local({ forward: 0.10, down: 0.055 }), dir: [0, -0.20, 1], role: "jaw", group: "head" });
  b.part(new THREE.SphereGeometry(1, 12, 8), bodyPaint, {
    bone: head,
    at: head.local({ forward: 0.08, up: 0.08 }),
    scale: [0.20, 0.25, 0.21],
    name: "skull",
    group: "head",
  });
  b.frustumBox(
    head.local({ forward: 0.14, up: 0.03 }),
    head.local({ forward: 0.44, up: 0.005 }),
    [0.17, 0.16],
    [0.11, 0.10],
    { bone: head, color: bodyPaint, name: "upperSnout", group: "head" },
  );
  b.frustumBox(
    jaw.at,
    [0, 2.26, 0.77],
    [0.14, 0.075],
    [0.09, 0.055],
    { bone: jaw, color: MOUTH, name: "lowerJaw", group: "jaw" },
  );
  b.part(new THREE.BoxGeometry(0.18, 0.018, 0.20), MOUTH, {
    bone: head,
    at: head.local({ forward: 0.29, down: 0.105 }),
    name: "mouthInterior",
    group: "jaw",
  });

  // Eyes: glowing amber gems with vertical dark pupils.
  for (const s of [-1, 1]) {
    const eyeAt = head.local({ left: s * 0.145, forward: 0.18, up: 0.10 });
    glow(b.part(new THREE.SphereGeometry(0.037, 10, 7), EYE, {
      bone: head,
      at: eyeAt,
      scale: [1.0, 0.85, 0.7],
      name: `eyeGem${s}`,
      group: "face",
    }), 1.8);
    b.part(new THREE.SphereGeometry(0.012, 7, 5), PUPIL, {
      bone: head,
      at: head.local({ left: s * 0.146, forward: 0.211, up: 0.10 }),
      scale: [0.60, 1.7, 0.35],
      name: `eyeSlit${s}`,
      group: "face",
    });
  }
  // Nostrils, crown gems, and cheek plates.
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.014, 7, 5), PUPIL, {
      bone: head,
      at: head.local({ left: s * 0.055, forward: 0.43, up: 0.05 }),
      name: `nostril${s}`,
      group: "face",
    });
    b.stick(new THREE.ConeGeometry(0.035, 0.045, 5), GOLD, head.moved([s * 0.10, 0.02, 0.22]), {
      embed: 0.2,
      bone: head,
      name: `crownScale${s}`,
      group: "face",
    });
  }

  // Paired fangs descend from the upper jaw; the forked tongue reaches past them.
  for (const s of [-1, 1]) {
    b.spike(head.local({ left: s * 0.07, forward: 0.36, down: 0.07 }), [0, -1, 0], 0.105, 0.014, {
      bone: head,
      color: FANG,
      name: `fang${s}`,
      group: "mouth",
    });
  }
  const tongueRoot = jaw.at;
  b.sweep(bezier(tongueRoot, [0, 2.20, 0.82], [0, 2.22, 0.92], [0, 2.22, 1.02]), [0.014, 0.003], {
    bone: jaw,
    color: TONGUE,
    caps: { start: "round", end: "point" },
    name: "tongueStem",
    group: "mouth",
  });
  for (const s of [-1, 1]) {
    b.sweep(bezier([0, 2.22, 0.96], [s * 0.022, 2.22, 1.01], [s * 0.038, 2.23, 1.08], [s * 0.045, 2.23, 1.14]), [0.007, 0.001], {
      bone: jaw,
      color: TONGUE,
      caps: "point",
      name: `tongueFork${s}`,
      group: "mouth",
    });
  }
  // Twin hood ocelli are the cobra's signature warning pattern, backed by jewel-like rims.
  for (const s of [-1, 1]) {
    const ocelli = b.part(new THREE.CircleGeometry(0.13, 10), GOLD, {
      bone: neck.joints[4],
      at: [s * 0.34, 1.54, 0.225],
      dir: [0, 0, 1],
      axis: "z",
      name: `hoodOcellus${s}`,
      group: "hood",
    });
    b.part(new THREE.CircleGeometry(0.082, 10), DEEP, {
      bone: neck.joints[4],
      at: [s * 0.34, 1.54, 0.231],
      dir: [0, 0, 1],
      axis: "z",
      name: `hoodOcellusInner${s}`,
      group: "hood",
    });
    glow(ocelli, 1.15);
  }


  // Small luminous runes and a painted scale-card crest add LoL magic without logos.
  const rune = svg(`<svg viewBox="0 0 32 32"><path d="M16 3 L21 13 L29 16 L21 19 L16 29 L11 19 L3 16 L11 13 Z" fill="#b9ffd0"/><circle cx="16" cy="16" r="4" fill="#fff5a0"/></svg>`, { size: 96 });
  glow(b.part(new THREE.PlaneGeometry(0.12, 0.12), MAGIC, {
    bone: head,
    at: head.local({ forward: 0.22, up: 0.19 }),
    dir: [0, 0, 1],
    axis: "z",
    texture: rune,
    name: "browRune",
    group: "magic",
  }), 1.3);
  const cardHits = b.surface(body).scatter(26, { rng: rng(81), minDist: 0.10, filter: (h) => h.n.y > -0.1 && h.at.y > 0.35 });
  b.cards(cardHits, scaleMark, { size: [0.045, 0.06], lean: 24, bend: 12, vary: 0.25, rng: rng(82), color: GOLD, group: "scaleCards" });

  return b.root;
}
