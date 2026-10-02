import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull, bezier } from "../src/path";
import { spots } from "../src/paint";
import { svg } from "../src/texture";
import { animeEye, cel, furEdge, INK, inkLines } from "../kits/toon";

const DEEP = "#1d3568";
const BLUE = "#3e78aa";
const SKY = "#80c5df";
const BELLY = "#e4f6ff";
const FIN_BLUE = "#244b82";
const CYAN = "#59e5e8";
const GOLD = "#f5c75c";
const GOLD_DARK = "#a96c2d";
const MOUTH = "#221b3d";

const COAT = cel(
  furEdge(
    spots(BLUE, SKY, { size: 0.42, amount: 0.3, seed: 28 }),
    BELLY,
    { level: -0.12, teeth: 0.14, period: 0.34, along: [0, 0, 1], ink: INK, inkWidth: 0.018 },
  ),
  DEEP,
);
const FIN = cel(FIN_BLUE, "#172c58");
const PALE = cel(BELLY, "#9acbe3");
const GOLD_PAINT = cel(GOLD, GOLD_DARK);
const RUNE_PAINT = cel(CYAN, "#207b9b");
const MOUTH_PAINT = inkLines(MOUTH, { levels: [0.18], axis: [0, 0, 1], width: 0.055 });

const EYE = animeEye({ iris: "#27d6e8", irisLight: "#d9ffff", irisDark: "#155587", blush: "#72d7ef", size: 512 });
const RUNE = svg(
  `<svg viewBox="0 0 128 128">
    <g fill="none" stroke="#f5c75c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M64 10 C38 28 34 49 64 64 C94 79 90 100 64 118"/>
      <path d="M20 64 H108 M36 35 L92 93 M92 35 L36 93"/>
      <circle cx="64" cy="64" r="12" fill="#59e5e8"/>
    </g>
    <g fill="#fff4c9"><circle cx="16" cy="20" r="4"/><circle cx="112" cy="20" r="4"/><circle cx="18" cy="109" r="4"/><circle cx="110" cy="108" r="4"/></g>
  </svg>`,
  { size: 192 },
);
const FIN_MARK = svg(
  `<svg viewBox="0 0 64 128"><path d="M8 116 Q32 88 24 54 Q20 34 32 8 Q44 38 40 62 Q36 90 56 116 Q33 104 8 116Z" fill="#59e5e8" opacity=".92"/><path d="M15 105 Q32 84 31 22" fill="none" stroke="#fff4c9" stroke-width="4"/></svg>`,
  { size: 128 },
);

function build() {
  const b = createBuilder({ name: "humpbackWhale", detail: 1.15, paintSize: 1024 });

  // Skeleton first: one central spine, a tail chain, a head and opening jaws.
  const torso = b.joint("torso", { at: [0, 2.08, -0.8], dir: [0, 0.04, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      torso.at,
      [0, 2.16, 0.35],
      [0, 2.3, 1.45],
      [0, 2.47, 2.45],
      [0, 2.58, 3.35],
    ]),
    { parent: torso, count: 4, names: ["spineFront", "neck", "headBase", "neckHead", "head"], role: "spine" },
  );
  const tail = b.chain(
    "tail",
    catmull([
      torso.at,
      [0, 2.02, -2.0],
      [0, 1.98, -3.45],
      [0, 2.12, -4.85],
      [0, 2.34, -6.15],
      [0, 2.5, -7.05],
    ]),
    { parent: torso, count: 5, names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"], role: "tail" },
  );
  const head = spine.tip!;
  const upperJaw = b.joint("upperJaw", { parent: head, at: [0, 2.6, 3.35], dir: [0, 0.02, 1], role: "jaw" });
  const lowerJaw = b.joint("lowerJaw", { parent: head, at: [0, 2.3, 3.38], dir: [0, -0.16, 1], role: "jaw" });

  const bodyPath = catmull([
    [0, 2.5, -7.05],
    [0, 2.22, -6.15],
    [0, 2.0, -4.85],
    [0, 1.98, -3.45],
    [0, 2.02, -2.0],
    [0, 2.08, -0.8],
    [0, 2.16, 0.35],
    [0, 2.3, 1.45],
    [0, 2.47, 2.45],
    [0, 2.58, 3.35],
  ]);
  const body = b.sweep(bodyPath, (t) => {
    const swell = Math.sin(Math.PI * Math.min(1, Math.max(0, (t + 0.03) / 1.2)));
    const taper = t > 0.82 ? 1 - 0.1 * ((t - 0.82) / 0.18) : 1;
    return [0.07 + 1.48 * swell * taper, 0.06 + 1.54 * swell * taper];
  }, {
    bone: [tail, torso, spine],
    color: COAT,
    section: "circle",
    sides: 12,
    caps: "round",
    name: "whaleBody",
    group: "body",
  });

  const headCenter: [number, number, number] = [0, 2.58, 3.3];
  const skull = b.part(new THREE.SphereGeometry(1, 18, 14), COAT, {
    bone: head,
    at: headCenter,
    scale: [1.48, 1.24, 1.36],
    name: "skull",
    group: "head",
  });

  // A distinct upper and lower jaw makes the resting pose readable and riggable.
  b.sweep(
    bezier([0, 2.6, 3.3], [0, 2.72, 3.7], [0, 2.65, 4.1], [0, 2.62, 4.36]),
    [0.42, 0.2],
    { bone: upperJaw, color: PALE, section: "circle", sides: 8, caps: "round", name: "upperJawMass", group: "jaw" },
  );
  const lowerMuzzle = b.sweep(
    bezier([0, 2.3, 3.34], [0, 2.18, 3.66], [0, 2.08, 4.02], [0, 2.1, 4.26]),
    [0.3, 0.11],
    { bone: lowerJaw, color: MOUTH_PAINT, section: "circle", sides: 8, caps: "round", name: "lowerJawMass", group: "jaw" },
  );
  b.sweep(
    catmull([[0, 2.48, 3.7], [0, 2.43, 3.96], [0, 2.38, 4.26]]),
    [0.022, 0.012],
    { bone: lowerJaw, color: INK, section: "circle", sides: 6, caps: "round", name: "mouthLine", group: "jaw" },
  );
  b.along(lowerMuzzle, 11, (at) => {
    b.spike(at, [0, -1, 0], 0.12, 0.012, { color: GOLD_PAINT, caps: "point", name: "baleenTooth", group: "jaw" });
  });

  const bodySurface = b.surface(body);
  const skullSurface = b.surface(skull);

  // Large expressive eyes and paired flank runes give the whale an anime focal point.
  for (const s of [1, -1]) {
    const eyeHit = skullSurface.around(headCenter).at(s * 48, 7);
    if (eyeHit) {
      b.decal(skull, EYE, {
        at: eyeHit,
        size: [0.25, 0.33],
        mirror: s > 0,
        lift: 0.012,
        name: s > 0 ? "eyeL" : "eyeR",
        group: "face",
      });
    }
    const runeHit = bodySurface.around([0, 2.2, -0.2]).at(s * 68, 2);
    if (runeHit) {
      b.decal(body, RUNE, {
        at: runeHit,
        size: [0.95, 1.12],
        mirror: s > 0,
        lift: 0.014,
        name: s > 0 ? "flankRuneL" : "flankRuneR",
        group: "ornament",
      });
    }
  }

  // Pectoral fins: a jointed tapered beam plus a broad, faceted fin silhouette.
  for (const s of [1, -1]) {
    const rootHit = bodySurface.around([0, 2.1, 0.25]).at(s * 90, -4)!;
    const finPath = catmull([
      rootHit.at,
      [s * 1.65, 1.72, 1.0],
      [s * 2.75, 1.35, 1.85],
      [s * 3.65, 1.08, 2.6],
    ]);
    const fin = b.sprout(s > 0 ? "pectoralL" : "pectoralR", rootHit, finPath, [0.28, 0.045], {
      count: 2,
      names: s > 0 ? ["pectoralL", "flipperL", "flipperTipL"] : ["pectoralR", "flipperR", "flipperTipR"],
      role: "wing",
      color: FIN,
      section: "circle",
      sides: 8,
      caps: "point",
      group: "fins",
    });
    const a = fin.chain!.at(0.12);
    const m = fin.sweep.at(0.58);
    const tip = fin.chain!.at(1);
    b.slab([a, [s * 1.6, 1.82, 1.12], [s * 2.85, 1.25, 2.12], tip, [s * 2.2, 1.42, 1.58]], {
      color: FIN,
      thickness: 0.075,
      bone: fin.chain!.joints[0],
      name: s > 0 ? "pectoralBladeL" : "pectoralBladeR",
      group: "fins",
    });
    b.decal(fin.sweep, FIN_MARK, {
      at: m,
      dir: m.n,
      size: [0.26, 0.8],
      lift: 0.012,
      mirror: s < 0,
      name: s > 0 ? "finMarkL" : "finMarkR",
      group: "ornament",
    });
    b.along(fin.sweep, 5, (at) => {
      b.stick(new THREE.SphereGeometry(0.045, 7, 5), GOLD_PAINT, at, { embed: 0.35, name: "finGem", group: "ornament" });
    });
  }

  // Broad horizontal tail flukes and their gold vein ridges.
  for (const s of [1, -1]) {
    const flukePath = catmull([
      tail.tip!.at,
      [s * 1.1, 2.58, -7.1],
      [s * 2.35, 2.68, -6.75],
      [s * 3.0, 2.78, -6.25],
    ]);
    const fluke = b.sprout(s > 0 ? "flukeL" : "flukeR", tail.tip!, flukePath, [0.2, 0.035], {
      count: 1,
      names: s > 0 ? ["flukeBaseL", "flukeTipL"] : ["flukeBaseR", "flukeTipR"],
      role: "fan",
      color: FIN,
      section: "circle",
      sides: 8,
      caps: "point",
      group: "tail",
    });
    b.extrude(
      [[0, 0], [0.8, 0.06], [2.9, 0.34], [2.55, 0.72], [1.35, 0.78], [0.35, 0.38, "sharp"]],
      {
        at: tail.tip!.at,
        x: [s, 0, 0],
        y: [0, 0, -1],
        thickness: [0.13, 0.045],
        bevel: 0.06,
        smoothing: 1,
        color: FIN,
        bone: fluke.chain!.joints[0],
        name: s > 0 ? "tailFlukeL" : "tailFlukeR",
        group: "tail",
      },
    );
    b.along(fluke.sweep, 5, (at) => {
      b.sweep(bezier(at.at, at.local({ left: s * 0.13, up: 0.03, forward: -0.35 }), at.local({ left: s * 0.24, up: 0.05, forward: -0.68 })), [0.025, 0.008], {
        bone: at.bone ?? tail.tip!,
        color: GOLD_PAINT,
        section: "circle",
        sides: 6,
        caps: "round",
        name: "flukeVein",
        group: "ornament",
      });
    });
  }

  // A small dorsal fan and an understated tail-root crest make the silhouette heroic.
  const dorsalHit = bodySurface.around([0, 2.1, -1.1]).at(0, 78)!;
  const dorsal = b.sprout(
    "dorsalFin",
    dorsalHit,
    catmull([dorsalHit.at, [0, 3.75, -1.28], [0, 4.25, -0.55]]),
    [0.19, 0.025],
    { count: 1, names: ["dorsalRoot", "dorsalTip"], role: "fan", color: FIN, section: "circle", sides: 7, caps: "point", group: "fins" },
  );
  b.extrude(
    [[0, 0], [0.38, 0.08], [0.9, 0.9], [0.6, 1.62], [0.17, 0.82, "sharp"]],
    {
      at: dorsalHit.at,
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: [0.12, 0.025],
      bevel: 0.04,
      smoothing: 1,
      color: FIN,
      bone: dorsal.chain!.joints[0],
      name: "dorsalBlade",
      group: "fins",
    },
  );
  b.along(dorsal.sweep, 4, (at) => {
    b.spike(at, at, 0.14, 0.022, { color: GOLD_PAINT, caps: "point", name: "dorsalGild", group: "ornament" });
  });

  // Constellation-like pearls follow the whale's crown and back.
  b.along(body, 15, (at) => {
    if (at.t > 0.2 && at.t < 0.82) {
      b.stick(new THREE.SphereGeometry(0.07, 8, 6), GOLD_PAINT, at, { embed: 0.42, name: "crownPearl", group: "ornament" });
    }
  });
  b.along(body, 10, (at) => {
    if (at.t > 0.28 && at.t < 0.73) {
      const star = at.moved([0, 0.09, 0]);
      b.spike(star, star, 0.08, 0.012, { color: RUNE_PAINT, caps: "point", name: "backStar", group: "ornament" });
    }
  });

  // A few tiny pearl bubbles are attached to the head bone, implying a calm glide.
  const bubbleMat = RUNE_PAINT;
  for (const [x, y, z, r] of [
    [-1.38, 3.36, 3.9, 0.09],
    [-1.62, 3.63, 4.05, 0.055],
    [1.4, 3.42, 4.0, 0.07],
  ] as const) {
    b.part(new THREE.SphereGeometry(r, 8, 6), bubbleMat, { bone: head, at: [x, y, z], name: "airPearl", group: "detail" });
  }

  b.root.position.y += 0.1;
  return b.root;
}

export const meta = {
  name: "Astral Humpback Whale",
  description: "A full-skeleton humpback whale gliding above the floor, painted in cel-shaded ocean blues with gold constellation fins and anime eyes.",
  style: "high-fantasy anime",
  commit: "67d30d1",
};

export default build;
