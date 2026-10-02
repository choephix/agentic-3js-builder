import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull } from "../src/path";
import { rng } from "../src/math";
import { mottle } from "../src/paint";
import { svg } from "../src/texture";
import { animeEye, cel, furEdge, INK, inkLines } from "../kits/toon";

export const meta = {
  name: "Mossstep Red Panda",
  description: "A bright red panda balancing on a mossy stone, with a ringed tail and anime-styled eyes.",
  style: "Genshin Impact",
  commit: "34f986c",
};

const COAT_LIT = "#c95732";
const COAT_SHADOW = "#702d3b";
const RUSSET = "#e77a3f";
const CREAM_LIT = "#f6d7a0";
const CREAM_SHADOW = "#b97668";
const PAW_DARK = "#4b2938";
const EAR_INNER = "#df7d78";
const STONE_LIT = "#77706b";
const STONE_SHADOW = "#3e3d4b";
const MOSS_LIT = "#8bb85e";
const MOSS_SHADOW = "#3e704b";
const GOLD = "#f2b84b";


const COAT = cel(
  furEdge(COAT_LIT, RUSSET, {
    level: -0.12,
    teeth: 0.08,
    period: 0.055,
    ink: INK,
    inkWidth: 0.035,
  }),
  COAT_SHADOW,
);
const RUSSET_CEL = cel(RUSSET, "#924248");
const BELLY = cel(
  furEdge(CREAM_LIT, COAT_LIT, {
    axis: [0, 0, 1],
    level: 0.05,
    teeth: 0.09,
    period: 0.045,
    along: [1, 0, 0],
  }),
  CREAM_SHADOW,
);
const CREAM = cel(CREAM_LIT, CREAM_SHADOW);
const DARK = cel(PAW_DARK, "#24182d");
const STONE = cel(mottle(STONE_LIT, "#544f56", { size: 0.18, contrast: 0.8, seed: 13 }), STONE_SHADOW);
const MOSS = cel(mottle(MOSS_LIT, "#4f8a50", { size: 0.12, contrast: 0.7, seed: 9 }), MOSS_SHADOW);
const EDGE = inkLines(COAT, { levels: [0.18, 0.7], axis: [0, 1, 0], width: 0.055 });

const EYE = animeEye({ iris: "#e9a52f", irisLight: "#ffd76a", irisDark: "#914b2f", size: 512 });
const FUR_TUFT = svg(
  `<svg viewBox="0 0 32 64"><path d="M2 0L8 52L16 42L22 64L30 0Z" fill="#fff2ce"/><path d="M7 0L13 44L18 35L25 0Z" fill="#d7653c"/></svg>`,
  { size: 128 },
);
const MOSS_TUFT = svg(
  `<svg viewBox="0 0 32 64"><path d="M2 64L7 10L12 43L17 0L21 42L29 14L27 64Z" fill="#a8d56e"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "redPanda", detail: 1, paintSize: 1024 });

  // Skeleton first: the relaxed four-legged rig keeps every tuft, stripe and claw attached in flex tests.
  const hips = b.joint("hips", { at: [0, 1.02, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.02, 0],
      [0, 1.13, 0.08],
      [0, 1.28, 0.18],
      [0, 1.39, 0.26],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.39, 0.26],
      [0, 1.49, 0.31],
      [0, 1.58, 0.36],
    ]),
    { parent: spine.tip!, names: ["neck1", "neck2", "neckTip"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.tip!, at: [0, 1.59, 0.37], dir: [0, 0.12, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.52, 0.47], dir: [0, -0.18, 0.98], role: "jaw", group: "head" });

  const legPoints = [
    { side: 1, label: "L", hip: [0.19, 1.09, 0.17] as [number, number, number], knee: [0.28, 0.82, 0.23] as [number, number, number], ankle: [0.32, 0.59, 0.29] as [number, number, number], paw: [0.31, 0.52, 0.36] as [number, number, number] },
    { side: -1, label: "R", hip: [-0.19, 1.09, 0.17] as [number, number, number], knee: [-0.28, 0.82, 0.23] as [number, number, number], ankle: [-0.37, 0.61, 0.20] as [number, number, number], paw: [-0.38, 0.55, 0.28] as [number, number, number] },
    { side: 1, label: "L", hip: [0.2, 0.98, -0.14] as [number, number, number], knee: [0.3, 0.73, -0.24] as [number, number, number], ankle: [0.25, 0.53, -0.30] as [number, number, number], paw: [0.25, 0.49, -0.22] as [number, number, number] },
    { side: -1, label: "R", hip: [-0.2, 0.98, -0.14] as [number, number, number], knee: [-0.3, 0.72, -0.23] as [number, number, number], ankle: [-0.24, 0.52, -0.31] as [number, number, number], paw: [-0.24, 0.49, -0.23] as [number, number, number] },
  ];
  const legs = legPoints.map((leg, i) => {
    const front = i < 2;
    const chain = b.chain(
      `${front ? "fore" : "hind"}${leg.label}`,
      catmull([leg.hip, leg.knee, leg.ankle, leg.paw]),
      {
        parent: hips,
        names: front
          ? [`shoulder${leg.label}`, `elbow${leg.label}`, `wrist${leg.label}`, `paw${leg.label}`]
          : [`hip${leg.label}`, `hock${leg.label}`, `ankle${leg.label}`, `heel${leg.label}`],
        contact: leg.paw,
      },
    );
    return { chain, paw: leg.paw, side: leg.side, front };
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.02, -0.17],
      [0.02, 1.04, -0.43],
      [0.12, 1.13, -0.72],
      [0.2, 1.3, -1.0],
      [0.12, 1.46, -1.2],
    ]),
    { parent: hips, names: ["tailBase", "tail1", "tail2", "tail3", "tailTip"], role: "tail" },
  );

  // A low-poly stone is the perch. Its local translation keeps the prop rooted to the creature's single root joint.
  const stoneGeo = new THREE.DodecahedronGeometry(0.55, 1);
  stoneGeo.scale(1.28, 0.4, 1.05);
  stoneGeo.translate(0, 0.22, 0);
  const stone = b.part(stoneGeo, STONE, { bone: hips, at: [0, 0, 0], name: "mossyStone", group: "perch" });
  const stoneSurface = b.surface(stone);
  const stoneTop = stoneSurface.scatter(14, {
    rng: rng(77),
    minDist: 0.08,
    filter: (hit) => hit.n.y > 0.25,
  });
  for (const hit of stoneTop) {
    b.stick(new THREE.SphereGeometry(0.045, 6, 4), MOSS, hit, { embed: 0.5, name: "mossClump", group: "perch" });
  }
  b.cards(stoneSurface.scatter(22, { rng: rng(78), minDist: 0.055, filter: (hit) => hit.n.y > 0.15 }), MOSS_TUFT, {
    size: [0.035, 0.09],
    lean: 78,
    bend: 22,
    vary: 0.35,
    rng: rng(79),
    color: MOSS_LIT,
    group: "perch",
  });

  // Body and tail are faceted tubes with hand-painted cel bands and a pale belly sector.
  const body = b.sweep(spine, (t) => 0.255 - t * 0.06, {
    section: "circle",
    sides: 10,
    shift: [0, -0.035],
    color: EDGE,
    sectors: [[112, 248, BELLY]],
    name: "bodyCoat",
    group: "body",
  });
  const neckFur = b.sweep(neck, [0.17, 0.13], {
    sides: 9,
    color: COAT,
    sectors: [[105, 250, BELLY]],
    name: "neckFur",
    group: "body",
  });
  b.sweep(tail, (t) => 0.16 - t * 0.105, {
    sides: 9,
    color: COAT,
    bands: [
      [0.22, RUSSET_CEL],
      [0.38, CREAM],
      [0.52, COAT],
      [0.66, CREAM],
      [0.8, COAT],
      [0.92, CREAM],
      [1, CREAM],
    ],
    sectors: [[118, 240, BELLY]],
    name: "ringedTail",
    group: "tail",
  });

  // Legs are chunky, with dark cuffs and cream paws that visibly land on the moss.
  for (const leg of legs) {
    b.sweep(leg.chain, (t) => 0.075 - t * 0.025, {
      sides: 7,
      color: COAT,
      bands: [[0.55, RUSSET_CEL], [0.8, CREAM], [1, DARK]],
      name: `${leg.front ? "fore" : "hind"}Leg${leg.side > 0 ? "L" : "R"}`,
      group: "limbs",
    });
    const p = leg.paw;
    b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, {
      bone: leg.chain.tip!,
      at: [p[0], p[1] + 0.015, p[2] + 0.025],
      scale: [0.09, 0.055, 0.11],
      name: `${leg.front ? "fore" : "hind"}Paw${leg.side > 0 ? "L" : "R"}`,
      group: "limbs",
    });
    for (let toe = -1; toe <= 1; toe += 1) {
      b.part(new THREE.SphereGeometry(0.018, 6, 4), DARK, {
        bone: leg.chain.tip!,
        at: [p[0] + toe * 0.028, p[1] + 0.04, p[2] + 0.1],
        name: `${leg.front ? "fore" : "hind"}Toe${leg.side > 0 ? "L" : "R"}${toe}`,
        group: "limbs",
      });
    }
  }

  // Head, muzzle, ears and the separate lower jaw give the face a readable anime silhouette.
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), COAT, {
    bone: head,
    at: [0, 1.59, 0.38],
    scale: [0.205, 0.22, 0.2],
    name: "skull",
    group: "head",
  });
  const headSurface = b.surface(skull);
  b.part(new THREE.SphereGeometry(1, 10, 8), CREAM, {
    bone: head,
    at: [0, 1.54, 0.54],
    scale: [0.135, 0.1, 0.1],
    name: "creamMuzzle",
    group: "head",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), DARK, {
    bone: jaw,
    at: [0, 1.52, 0.64],
    scale: [0.045, 0.035, 0.035],
    name: "nose",
    group: "head",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, {
    bone: jaw,
    at: [0, 1.49, 0.57],
    scale: [0.11, 0.045, 0.045],
    name: "lowerMuzzle",
    group: "head",
  });
  b.part(new THREE.TorusGeometry(0.135, 0.009, 5, 12), GOLD, {
    bone: neck.tip!,
    at: [0, 1.53, 0.33],
    rotation: [90, 0, 0],
    name: "goldCollar",
    group: "ornament",
  });
  b.part(new THREE.SphereGeometry(0.018, 6, 4), GOLD, {
    bone: neck.tip!,
    at: [0, 1.43, 0.45],
    name: "collarPendant",
    group: "ornament",
  });

  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.095, 0.2, 7), COAT, {
      bone: head,
      at: [s * 0.145, 1.67, 0.34],
      rotation: [0, 0, s * -18],
      name: `ear${s > 0 ? "L" : "R"}`,
      group: "head",
    });
    b.part(new THREE.ConeGeometry(0.056, 0.13, 7), cel(EAR_INNER, "#93485c"), {
      bone: head,
      at: [s * 0.145, 1.675, 0.335],
      rotation: [0, 0, s * -18],
      name: `innerEar${s > 0 ? "L" : "R"}`,
      group: "head",
    });
    const hit = headSurface.around([0, 1.59, 0.38]).at(s * 38, 5);
    if (hit) {
      b.decal(headSurface, EYE, {
        at: hit,
        size: [0.075, 0.095],
        mirror: s > 0,
        lift: 0.002,
        name: `animeEye${s > 0 ? "L" : "R"}`,
        group: "head",
      });
    }
    // Three fine whiskers on each cheek are separate rods so they survive the flex tests.
    for (let w = 0; w < 3; w += 1) {
      const y = 1.53 + (w - 1) * 0.035;
      b.rod([s * 0.08, y, 0.61], [s * (0.22 + w * 0.025), y + (w - 1) * 0.012, 0.65 + w * 0.018], 0.004, {
        color: INK,
        bone: head,
        name: `whisker${s > 0 ? "L" : "R"}${w}`,
        group: "head",
      });
    }
  }

  // A pale bib and face blaze are decals/painted geometry rather than unbroken flat colour.
  b.part(new THREE.SphereGeometry(1, 10, 8), BELLY, {
    bone: neck.tip!,
    at: [0, 1.44, 0.37],
    scale: [0.115, 0.11, 0.06],
    name: "chestBib",
    group: "body",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), cel(CREAM_LIT, "#b56a63"), {
    bone: head,
    at: [0, 1.62, 0.545],
    scale: [0.08, 0.11, 0.035],
    name: "faceBlaze",
    group: "head",
  });

  // Fur cards make the coat read as groomed and feathery from the top-down camera.
  const coatSurface = b.surface([body, neckFur]);
  const furHits = coatSurface.scatter(68, {
    rng: rng(404),
    minDist: 0.045,
    filter: (hit) => hit.n.y > -0.1,
  });
  b.cards(furHits, FUR_TUFT, {
    size: [0.035, 0.09],
    lean: 58,
    bend: 25,
    vary: 0.3,
    rng: rng(405),
    color: RUSSET,
    group: "fur",
  });

  // Small gold ankle charms echo Genshin's ornate accent language without becoming a costume.
  for (const leg of legs.slice(0, 2)) {
    const p = leg.chain.at(0.82).at;
    b.part(new THREE.TorusGeometry(0.072, 0.008, 5, 10), GOLD, {
      bone: leg.chain.joints[Math.min(2, leg.chain.joints.length - 1)],
      at: [p.x, p.y, p.z],
      rotation: [90, 0, 0],
      name: `ankleCharm${leg.side > 0 ? "L" : "R"}`,
      group: "ornament",
    });
  }

  return b.root;
}
