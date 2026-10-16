import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { bezier, catmull, polyline } from "../../../../src/path";

export const meta = {
  name: "African Bush Elephant",
  description:
    "Adult African bush elephant in faceted low-poly style with continent-shaped ears, ribbed prehensile trunk, curved ivory tusks, and savanna dust-dappled hide.",
  style: "low-poly",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "africanElephant", detail: 0.75 });

  // Palette: clean flat low-poly savanna greys, warm earth dust, aged ivory, and deep charcoal accents
  const HIDE_MAIN = "#6d6a66";
  const HIDE_DORSAL = "#585552";
  const HIDE_BELLY = "#807b75";
  const HIDE_CREASE = "#484542";
  const HIDE_HIGHLIGHT = "#8d8780";
  const DUST_OCHRE = "#9c7e63";
  const DUST_CLAY = "#886a50";
  const EAR_BACK = "#625e5a";
  const EAR_INNER = "#877570";
  const EAR_VEIN = "#715e59";
  const EAR_RIM = "#4d4946";
  const TUSK_BASE = "#cbb994";
  const TUSK_MID = "#e6dcc5";
  const TUSK_TIP = "#f5efe0";
  const TUSK_SHEATH = "#544e49";
  const NAIL_IVORY = "#cfc4ae";
  const SOLE_PAD = "#3f3c39";
  const EYE_DARK = "#1c1816";
  const EYE_AMBER = "#96612b";
  const EYE_GLINT = "#f0e8dc";
  const MOUTH_INNER = "#7d4e4a";
  const TAIL_HAIR = "#24201e";

  // ---------------------------------------------------------------------------
  // 1. SKELETON: Adult African Bush Elephant (~3.3m shoulder height, ~6m length)
  // ---------------------------------------------------------------------------
  // Core root in mid-back, splitting forward into chest/neck/head/trunk and back into pelvis/rump/tail
  const bodyCurve = catmull([
    [0, 2.24, -1.82], // 0: rump / tail root
    [0, 2.66, -1.35], // 1: croup / sacral peak
    [0, 2.58, -0.62], // 2: mid-back dip (characteristic African bush elephant concave saddle)
    [0, 2.62, -0.05], // 3: core root
    [0, 2.94, 0.72], // 4: high shoulder / withers peak
    [0, 2.76, 1.32], // 5: neck base
    [0, 2.68, 1.66], // 6: atlas / skull base
  ]);

  const core = b.joint("core", { at: [0, 2.62, -0.05], role: "spine", group: "body" });
  const rootT = bodyCurve.closestT(core.at);

  const spineFront = b.chain("spineF", bodyCurve.slice(rootT, 1), {
    parent: core,
    names: ["thorax", "shoulders", "neck"],
    role: "spine",
    group: "body",
  });

  const spineBack = b.chain("spineB", bodyCurve.slice(rootT, 0), {
    parent: core,
    names: ["lumbar", "pelvis", "rump"],
    role: "spine",
    group: "body",
  });

  const shoulders = spineFront.joints[1];
  const neck = spineFront.joints[2];
  const pelvis = spineBack.joints[1];
  const rump = spineBack.joints[2];

  // Head & Jaw
  const head = b.joint("head", {
    parent: neck,
    at: [0, 2.68, 1.68],
    dir: [0, -0.22, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 2.22, 1.88],
    dir: [0, -0.38, 0.92],
    role: "jaw",
    group: "head",
  });

  // Trunk chain (8 articulated segments in S-curve, ending with two prehensile fingers)
  const trunkPath = catmull([
    [0, 2.48, 2.24], // root on upper snout
    [0, 2.22, 2.54], // upper bridge
    [0, 1.84, 2.68], // upper-mid
    [0, 1.42, 2.72], // mid trunk
    [0, 1.02, 2.68], // lower-mid
    [0, 0.68, 2.62], // lower curve
    [0, 0.44, 2.68], // curl forward
    [0, 0.36, 2.86], // tip
  ]);

  const trunk = b.chain("trunk", trunkPath, {
    parent: head,
    count: 7,
    names: ["trunk1", "trunk2", "trunk3", "trunk4", "trunk5", "trunk6", "trunk7", "trunkTip"],
    role: "tentacle",
    group: "trunk",
  });
  const trunkTip = trunk.tip!;

  // Tail chain
  const tailPath = catmull([
    [0, 2.22, -1.82],
    [0, 1.82, -2.02],
    [0, 1.36, -2.08],
    [0, 0.92, -2.05],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: rump,
    names: ["tail1", "tail2", "tail3", "tailTip"],
    role: "tail",
    group: "tail",
  });

  // Ears (large hinged flaps on left and right)
  const earJoints: Record<number, ReturnType<typeof b.joint>> = {};
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    earJoints[s] = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.46, 2.66, 1.66],
      dir: [s * 0.92, 0.08, -0.38],
      up: [0, 1, 0],
      role: "hinge",
      group: `ear${side}`,
    });
  }

  // Pillar-like Front and Hind Legs via IK, landing flat at y = 0
  const frontLegChains: Record<number, ReturnType<typeof b.chain>> = {};
  const hindLegChains: Record<number, ReturnType<typeof b.chain>> = {};

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";

    // Front leg: shoulder -> elbow (back) -> wrist (slightly forward) -> foot
    const fRoot: [number, number, number] = [s * 0.56, 2.18, 0.86];
    const fFoot: [number, number, number] = [s * 0.58, 0.14, 0.88];
    const fPts = limb(
      fRoot,
      fFoot,
      [0.86, 0.76, 0.44],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    frontLegChains[s] = b.chain(`legF${side}`, fPts, {
      parent: shoulders,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `footF${side}`],
      role: "leg",
      contact: [s * 0.58, 0, 0.88],
      group: `legF${side}`,
    });

    // Hind leg: hip -> stifle/knee (forward) -> hock/ankle (back) -> foot
    const hRoot: [number, number, number] = [s * 0.52, 2.08, -1.24];
    const hFoot: [number, number, number] = [s * 0.54, 0.14, -1.28];
    const hPts = limb(
      hRoot,
      hFoot,
      [0.82, 0.74, 0.42],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    hindLegChains[s] = b.chain(`legH${side}`, hPts, {
      parent: pelvis,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `footH${side}`],
      role: "leg",
      contact: [s * 0.54, 0, -1.28],
      group: `legH${side}`,
    });
  }

  // ---------------------------------------------------------------------------
  // 2. TORSO & MASSIVE LOW-POLY BODY VOLUME
  // ---------------------------------------------------------------------------
  // Station widths and heights capturing the African bush elephant's high shoulders, dipped back, sloped croup, and barrel belly
  const torsoStations = [
    { at: [0, 2.08, -1.88], w: 0.78, h: 0.82 }, // tail root / rear rump
    { at: [0, 2.14, -1.42], w: 1.38, h: 1.36 }, // high sacral croup
    { at: [0, 1.98, -0.68], w: 1.66, h: 1.54 }, // wide flank / concave mid-back
    { at: [0, 1.96, 0.02], w: 1.78, h: 1.66 }, // deep barrel ribcage
    { at: [0, 2.16, 0.76], w: 1.64, h: 1.78 }, // towering shoulder hump
    { at: [0, 2.26, 1.32], w: 1.24, h: 1.38 }, // thick muscular neck
    { at: [0, 2.38, 1.68], w: 0.98, h: 1.08 }, // skull junction
  ];

  const bodySweep = b.loft(torsoStations, {
    bone: [spineBack, core, spineFront],
    section: { ngon: 8 },
    smooth: false,
    color: HIDE_MAIN,
    sectors: [
      [-55, 55, HIDE_DORSAL],
      [130, 230, HIDE_BELLY],
    ],
    group: "body",
    name: "torso",
  });

  // Prominent dorsal ridge / spinal processus plates along the back
  const spineRidgePath = catmull([
    [0, 2.48, -1.68],
    [0, 2.82, -1.32],
    [0, 2.72, -0.62],
    [0, 2.78, 0.05],
    [0, 3.06, 0.74],
    [0, 2.92, 1.22],
  ]);
  b.sweep(
    spineRidgePath,
    (t) => [0.22 * (1 - 0.3 * Math.abs(t - 0.5)), 0.1 * (1 + 0.4 * Math.sin(t * Math.PI))],
    {
      bone: [spineBack, core, spineFront],
      section: { ngon: 6 },
      smooth: false,
      color: HIDE_DORSAL,
      group: "body",
      name: "dorsalRidge",
    },
  );

  // Sculpted low-poly shoulder blades (scapula crests), pelvic iliac crests, and chest brisket
  const brisketPath = catmull([
    [0, 2.18, 1.52],
    [0, 1.68, 1.32],
    [0, 1.34, 0.92],
    [0, 1.24, 0.32],
  ]);
  b.sweep(
    brisketPath,
    (t) => [0.46 * (1 - 0.25 * t), 0.28 * (1 - 0.2 * t)],
    {
      bone: [spineFront, core],
      section: { ngon: 6 },
      smooth: false,
      color: HIDE_BELLY,
      group: "body",
      name: "brisket",
    },
  );

  // Hanging throat / dewlap skin folds under neck
  for (let i = 0; i < 3; i++) {
    const zOff = i * 0.13;
    const foldPath = catmull([
      [-0.24, 2.28 - i * 0.05, 1.54 - zOff],
      [0, 1.72 - i * 0.06, 1.44 - zOff],
      [0.24, 2.28 - i * 0.05, 1.54 - zOff],
    ]);
    b.sweep(foldPath, [0.055, 0.09, 0.055], {
      bone: neck,
      section: { ngon: 5 },
      smooth: false,
      color: i % 2 === 0 ? HIDE_CREASE : HIDE_MAIN,
      group: "body",
      name: `dewlapFold${i + 1}`,
    });
  }

  // Bilateral body masses: scapula humps, hip tuber coxae, flank folds, and dust patches
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";

    // Scapula / shoulder blade block
    b.frustumBox(
      [s * 0.54, 2.86, 0.68],
      [s * 0.68, 2.12, 0.88],
      [0.34, 0.38],
      [0.44, 0.48],
      {
        bone: shoulders,
        color: HIDE_DORSAL,
        group: "body",
        name: `scapula${side}`,
      },
    );

    // Iliac / pelvic crest protrusion
    b.part(new THREE.OctahedronGeometry(0.28, 1), HIDE_HIGHLIGHT, {
      bone: pelvis,
      at: [s * 0.58, 2.52, -1.16],
      scale: [0.85, 0.72, 1.35],
      rotation: [12, s * -10, s * -18],
      flat: true,
      group: "body",
      name: `pelvicCrest${side}`,
    });

    // Heavy rib / flank skin folds draped vertically along the sides
    for (let f = 0; f < 5; f++) {
      const zPos = 0.48 - f * 0.34;
      const xMid = 0.84 - Math.abs(f - 2) * 0.05;
      const ribFold = catmull([
        [s * (xMid - 0.14), 2.48 - Math.abs(f - 2) * 0.05, zPos + 0.06],
        [s * xMid, 1.96, zPos],
        [s * (xMid - 0.18), 1.46 + Math.abs(f - 2) * 0.04, zPos - 0.05],
      ]);
      b.sweep(ribFold, [0.025, 0.052, 0.025], {
        bone: f < 2 ? shoulders : f === 2 ? core : pelvis,
        section: { ngon: 5 },
        smooth: false,
        color: f % 2 === 0 ? HIDE_CREASE : HIDE_HIGHLIGHT,
        group: "body",
        name: `flankFold${side}${f + 1}`,
      });
    }

    // Neck vertical wrinkle creases behind the head
    for (let nw = 0; nw < 3; nw++) {
      const zNeck = 1.18 + nw * 0.16;
      const neckCrease = catmull([
        [s * 0.42, 2.74 - nw * 0.04, zNeck],
        [s * 0.62, 2.32, zNeck + 0.04],
        [s * 0.46, 1.92 + nw * 0.04, zNeck],
      ]);
      b.sweep(neckCrease, [0.022, 0.048, 0.022], {
        bone: neck,
        section: { ngon: 5 },
        smooth: false,
        color: HIDE_CREASE,
        group: "body",
        name: `neckCrease${side}${nw + 1}`,
      });
    }
  }

  // Low-poly savanna dust & red-earth mud plates stuck across back, shoulders, and flanks
  const bodySurface = b.surface(bodySweep);
  const dustHits = bodySurface.scatter(34, {
    rng: rng(42),
    minDist: 0.24,
    filter: (h) => h.at.y > 1.55 && h.at.z > -1.65 && h.at.z < 1.35,
  });
  const dustRand = rng(108);
  dustHits.forEach((hit, idx) => {
    const r = 0.09 + dustRand() * 0.09;
    const col =
      hit.n.y > 0.45
        ? idx % 2 === 0
          ? DUST_OCHRE
          : HIDE_HIGHLIGHT
        : idx % 3 === 0
          ? DUST_CLAY
          : HIDE_CREASE;
    b.stick(new THREE.CylinderGeometry(r * 0.85, r, 0.028, 6), col, hit, {
      embed: 0.55,
      spin: dustRand() * 360,
      flat: true,
      group: "body",
      name: `hidePlate${idx + 1}`,
    });
  });

  // ---------------------------------------------------------------------------
  // 3. HEAD, SKULL DOME, TEMPORAL GLANDS, JAW, EYES & TUSKS
  // ---------------------------------------------------------------------------
  // Main cranium / skull loft
  const skullLoft = [
    { at: [0, 2.66, 1.52], w: 0.94, h: 0.96 }, // back of cranium
    { at: [0, 2.78, 1.82], w: 1.06, h: 1.08 }, // wide temporal dome
    { at: [0, 2.58, 2.12], w: 0.86, h: 0.88 }, // brow / zygomatic arch
    { at: [0, 2.38, 2.34], w: 0.62, h: 0.62 }, // upper snout / nasal bridge
  ];
  b.loft(skullLoft, {
    bone: head,
    section: { ngon: 7 },
    smooth: false,
    color: HIDE_MAIN,
    sectors: [[-65, 65, HIDE_DORSAL]],
    group: "head",
    name: "cranium",
  });

  // Forehead boss & parietal domes (bilateral rounded-faceted lobes on top of skull)
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";

    // Parietal crown dome
    b.part(new THREE.DodecahedronGeometry(0.32, 0), HIDE_DORSAL, {
      bone: head,
      at: [s * 0.22, 3.04, 1.82],
      scale: [0.95, 0.76, 1.08],
      rotation: [-10, s * 12, s * -8],
      flat: true,
      group: "head",
      name: `parietalDome${side}`,
    });

    // Dust cap on forehead dome
    b.part(new THREE.CylinderGeometry(0.16, 0.22, 0.04, 6), DUST_OCHRE, {
      bone: head,
      at: [s * 0.2, 3.24, 1.82],
      rotation: [8, s * 15, s * -10],
      flat: true,
      group: "head",
      name: `crownDust${side}`,
    });

    // Zygomatic / cheekbone ridge
    b.frustumBox(
      [s * 0.42, 2.52, 1.78],
      [s * 0.36, 2.38, 2.16],
      [0.18, 0.22],
      [0.16, 0.18],
      {
        bone: head,
        color: HIDE_HIGHLIGHT,
        group: "head",
        name: `cheekbone${side}`,
      },
    );

    // Temporal depression (characteristic hollow above the brow)
    b.part(new THREE.CylinderGeometry(0.11, 0.09, 0.05, 6), HIDE_CREASE, {
      bone: head,
      at: [s * 0.43, 2.78, 1.94],
      dir: [s * 0.92, 0.22, 0.32],
      flat: true,
      group: "head",
      name: `templeHollow${side}`,
    });

    // Temporal gland patch between eye and ear (distinctive African bull feature)
    b.part(new THREE.CylinderGeometry(0.055, 0.07, 0.03, 6), DUST_CLAY, {
      bone: head,
      at: [s * 0.46, 2.58, 1.86],
      dir: [s * 0.95, 0.05, 0.15],
      flat: true,
      group: "head",
      name: `temporalGland${side}`,
    });
  }

  // Forehead wrinkle plates across the brow bridge
  for (let fw = 0; fw < 4; fw++) {
    const yW = 2.86 - fw * 0.08;
    const zW = 2.08 + fw * 0.06;
    const wSpan = 0.28 - fw * 0.03;
    const browRidge = catmull([
      [-wSpan, yW - 0.02, zW - 0.03],
      [0, yW, zW],
      [wSpan, yW - 0.02, zW - 0.03],
    ]);
    b.sweep(browRidge, [0.018, 0.032, 0.018], {
      bone: head,
      section: { ngon: 5 },
      smooth: false,
      color: fw % 2 === 0 ? HIDE_CREASE : HIDE_HIGHLIGHT,
      group: "head",
      name: `browWrinkle${fw + 1}`,
    });
  }

  // Articulated Lower Jaw, Chin, and Inner Mouth
  const jawPath = catmull([
    [0, 2.22, 1.84],
    [0, 2.04, 2.06],
    [0, 1.98, 2.26],
  ]);
  b.sweep(
    jawPath,
    (t) => [0.24 * (1 - 0.38 * t), 0.17 * (1 - 0.25 * t)],
    {
      bone: jaw,
      section: { ngon: 6 },
      smooth: false,
      caps: "round",
      color: HIDE_BELLY,
      group: "head",
      name: "lowerJaw",
    },
  );

  // Pointed spout-like lower lip of African elephant
  b.part(new THREE.ConeGeometry(0.11, 0.18, 5), HIDE_CREASE, {
    bone: jaw,
    at: [0, 2.02, 2.31],
    dir: [0, 0.15, 1],
    flat: true,
    group: "head",
    name: "lowerLipTip",
  });

  // Warm pink-terracotta inner mouth plate on upper surface of jaw
  b.part(new THREE.BoxGeometry(0.24, 0.05, 0.28), MOUTH_INNER, {
    bone: jaw,
    at: [0, 2.13, 2.08],
    rotation: [18, 0, 0],
    flat: true,
    group: "head",
    name: "mouthCavity",
  });

  // Eyes, Brow Ridges, Lower Lids, and Lashes
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";

    // Heavy protective supraorbital brow arch
    const browArch = catmull([
      [s * 0.34, 2.66, 2.16],
      [s * 0.43, 2.71, 2.04],
      [s * 0.44, 2.63, 1.92],
    ]);
    b.sweep(browArch, [0.036, 0.058, 0.038], {
      bone: head,
      section: { ngon: 5 },
      smooth: false,
      color: HIDE_DORSAL,
      group: "head",
      name: `browArch${side}`,
    });

    // Lower eyelid pouch
    const lowerLid = catmull([
      [s * 0.35, 2.53, 2.14],
      [s * 0.43, 2.51, 2.04],
      [s * 0.43, 2.54, 1.94],
    ]);
    b.sweep(lowerLid, [0.024, 0.038, 0.024], {
      bone: head,
      section: { ngon: 5 },
      smooth: false,
      color: HIDE_CREASE,
      group: "head",
      name: `lowerLid${side}`,
    });

    // Dark eye socket rim
    b.part(new THREE.CylinderGeometry(0.068, 0.074, 0.04, 7), HIDE_CREASE, {
      bone: head,
      at: [s * 0.4, 2.59, 2.04],
      dir: [s * 0.88, 0.08, 0.46],
      flat: true,
      group: "head",
      name: `eyeSocket${side}`,
    });

    // Amber iris sphere
    b.part(new THREE.IcosahedronGeometry(0.052, 1), EYE_AMBER, {
      bone: head,
      at: [s * 0.415, 2.59, 2.05],
      flat: true,
      group: "head",
      name: `iris${side}`,
    });

    // Dark pupil core
    const pupil = b.part(new THREE.IcosahedronGeometry(0.036, 1), EYE_DARK, {
      bone: head,
      at: [s * 0.432, 2.59, 2.062],
      dir: [s * 0.88, 0.08, 0.46],
      flat: true,
      group: "head",
      name: `pupil${side}`,
    });

    // Crisp white specular glint
    b.part(new THREE.OctahedronGeometry(0.015, 0), EYE_GLINT, {
      bone: head,
      at: [s * 0.448, 2.61, 2.075],
      flat: true,
      group: "head",
      name: `eyeGlint${side}`,
    });

    // Low-poly eyelash spikes fanning out from upper lid
    b.ring(
      pupil,
      { count: 5, radius: 0.042, fromDeg: -50, toDeg: 50, tilt: 48, group: "head" },
      (lash) => {
        b.spike(lash, lash, 0.048, 0.008, {
          bone: head,
          sides: 4,
          smooth: false,
          color: TAIL_HAIR,
          group: "head",
        });
      },
    );
  }

  // Tusks & Tusk Sheaths (massive sweeping ivory tusks with root bark rings)
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";

    // fleshy upper-lip tusk sheath (tusk socket cylinder)
    const sheathPath = catmull([
      [s * 0.24, 2.44, 2.12],
      [s * 0.27, 2.26, 2.26],
      [s * 0.29, 2.08, 2.38],
    ]);
    b.sweep(sheathPath, [0.15, 0.14, 0.125], {
      bone: head,
      section: { ngon: 6 },
      smooth: false,
      caps: "flat",
      color: HIDE_MAIN,
      group: "head",
      name: `tuskSheath${side}`,
    });

    // Sheath lip cuff
    b.part(new THREE.TorusGeometry(0.115, 0.028, 5, 7), TUSK_SHEATH, {
      bone: head,
      at: [s * 0.29, 2.08, 2.38],
      dir: [s * 0.22, -0.68, 0.7],
      axis: "z",
      flat: true,
      group: "head",
      name: `tuskCuff${side}`,
    });

    // Sweeping curved ivory tusk
    const tuskCurve = bezier(
      [s * 0.28, 2.12, 2.34],
      [s * 0.36, 1.66, 2.66],
      [s * 0.42, 1.48, 3.08],
      [s * 0.33, 1.84, 3.42],
    );
    b.sweep(
      tuskCurve,
      (t) => 0.102 * (1 - 0.88 * Math.pow(t, 1.15)),
      {
        bone: head,
        section: { ngon: 7 },
        smooth: false,
        caps: { start: "flat", end: "point" },
        bands: [
          [0.22, TUSK_BASE],
          [0.72, TUSK_MID],
          [1.0, TUSK_TIP],
        ],
        group: "head",
        name: `tusk${side}`,
      },
    );

    // Subtle growth bands near tusk root
    for (let tr = 0; tr < 2; tr++) {
      const tPos = 0.08 + tr * 0.09;
      const pt = tuskCurve.at(tPos);
      const tan = tuskCurve.tangentAt(tPos);
      b.part(new THREE.TorusGeometry(0.096 - tr * 0.008, 0.012, 5, 7), DUST_CLAY, {
        bone: head,
        at: pt,
        dir: tan,
        axis: "z",
        flat: true,
        group: "head",
        name: `tuskBand${side}${tr + 1}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 4. CONTINENT-SHAPED AFRICAN EARS
  // ---------------------------------------------------------------------------
  // Outline shaped like the map of Africa: broad rounded top lobe, wide outer margin, tapering ventral point
  const earOutline: OutlinePoint[] = [
    [0.0, 0.38], // upper root attachment
    [0.24, 0.56], // dorsal arch
    [0.64, 0.52], // broad upper-outer lobe
    [0.92, 0.28], // outer-top corner
    [0.98, -0.06], // widest lateral edge
    [0.82, -0.44], // mid-lower outer edge
    [0.54, -0.82], // lower taper
    [0.28, -1.06, "sharp"], // iconic bottom point of African bush elephant ear
    [0.08, -0.84], // inner-lower lobe
    [0.0, -0.42], // lower root attachment
  ];

  const innerEarOutline: OutlinePoint[] = [
    [0.05, 0.28],
    [0.24, 0.42],
    [0.56, 0.38],
    [0.78, 0.18],
    [0.82, -0.08],
    [0.68, -0.38],
    [0.45, -0.68],
    [0.26, -0.86, "sharp"],
    [0.1, -0.68],
    [0.04, -0.32],
  ];

  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const earJ = earJoints[s];
    const earGroup = `ear${side}`;

    // Main ear slab swept back ~28 deg from lateral
    const xDir: [number, number, number] = [s * 0.88, 0.04, -0.47];
    const yDir: [number, number, number] = [s * -0.06, 0.99, -0.08];

    const mainEar = b.extrude(earOutline, {
      bone: earJ,
      at: earJ.at,
      x: xDir,
      y: yDir,
      thickness: [0.032, 0.068],
      bevel: 0.012,
      smoothing: 0,
      color: EAR_BACK,
      group: earGroup,
      name: `earPinna${side}`,
    });

    // Anterior warm-pinkish inner ear recess plate
    const frontSign = s > 0 ? 1 : -1;
    b.extrude(innerEarOutline, {
      bone: earJ,
      at: mainEar.local([0, 0, frontSign * 0.022]),
      x: xDir,
      y: yDir,
      thickness: 0.02,
      smoothing: 0,
      color: EAR_INNER,
      group: earGroup,
      name: `earInner${side}`,
    });

    // Thickened dorsal folded rim of the ear
    const earRimPath = catmull([
      mainEar.local([0.02, 0.36, 0]),
      mainEar.local([0.26, 0.55, frontSign * 0.02]),
      mainEar.local([0.64, 0.51, frontSign * 0.015]),
      mainEar.local([0.92, 0.26, 0]),
      mainEar.local([0.97, -0.08, 0]),
    ]);
    b.sweep(earRimPath, [0.045, 0.04, 0.026], {
      bone: earJ,
      section: { ngon: 5 },
      smooth: false,
      color: EAR_RIM,
      group: earGroup,
      name: `earRim${side}`,
    });

    // Cartilage tragus bump at the ear canal root
    b.part(new THREE.DodecahedronGeometry(0.11, 0), HIDE_MAIN, {
      bone: earJ,
      at: mainEar.local([0.08, -0.12, frontSign * 0.045]),
      scale: [0.9, 1.3, 0.7],
      flat: true,
      group: earGroup,
      name: `earTragus${side}`,
    });

    // Radiating low-poly vascular / cartilage ridges on the inner and back ear faces
    const veinEnds: Array<[number, number]> = [
      [0.72, 0.32],
      [0.84, 0.02],
      [0.72, -0.34],
      [0.48, -0.66],
      [0.28, -0.88],
    ];
    veinEnds.forEach(([vx, vy], vIdx) => {
      // Front cartilage vein
      const vPathF = polyline([
        mainEar.local([0.1, -0.06, frontSign * 0.032]),
        mainEar.local([vx * 0.55, vy * 0.52, frontSign * 0.032]),
        mainEar.local([vx, vy, frontSign * 0.024]),
      ]);
      b.sweep(vPathF, [0.022, 0.014, 0.006], {
        bone: earJ,
        section: { ngon: 4 },
        smooth: false,
        color: EAR_VEIN,
        group: earGroup,
        name: `earVeinF${side}${vIdx + 1}`,
      });

      // Back prominent blood vessel ridge
      const vPathB = polyline([
        mainEar.local([0.1, -0.04, -frontSign * 0.028]),
        mainEar.local([vx * 0.58, vy * 0.55, -frontSign * 0.028]),
        mainEar.local([vx * 0.92, vy * 0.92, -frontSign * 0.02]),
      ]);
      b.sweep(vPathB, [0.024, 0.015, 0.006], {
        bone: earJ,
        section: { ngon: 4 },
        smooth: false,
        color: HIDE_CREASE,
        group: earGroup,
        name: `earVeinB${side}${vIdx + 1}`,
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 5. RIBBED PREHENSILE TRUNK & TWO-FINGERED TIP
  // ---------------------------------------------------------------------------
  // Main trunk tube skinned smoothly across the 7 trunk span joints
  const trunkSweep = b.sweep(
    trunk,
    (t) => [0.23 * (1 - 0.62 * t), 0.25 * (1 - 0.64 * t)],
    {
      section: { ngon: 7 },
      smooth: false,
      caps: "flat",
      color: HIDE_MAIN,
      sectors: [
        [-60, 60, HIDE_DORSAL],
        [135, 225, HIDE_BELLY],
      ],
      group: "trunk",
      name: "trunkTube",
    },
  );

  // Transverse annular muscle rings along the dorsal and lateral trunk (signature African elephant feature)
  const ringCount = 16;
  for (let r = 0; r < ringCount; r++) {
    const t = 0.05 + (r / (ringCount - 1)) * 0.88;
    const topPt = trunkSweep.at(t, 0, 0.006);
    const leftPt = trunkSweep.at(t, -82, 0.005);
    const rightPt = trunkSweep.at(t, 82, 0.005);
    const ringThick = 0.024 * (1 - 0.52 * t);

    const annPath = catmull([leftPt.at, topPt.at, rightPt.at]);
    b.sweep(annPath, [ringThick * 0.6, ringThick, ringThick * 0.6], {
      bone: topPt.bone!,
      section: { ngon: 5 },
      smooth: false,
      color: r % 2 === 0 ? HIDE_CREASE : HIDE_HIGHLIGHT,
      group: "trunk",
      name: `trunkRing${r + 1}`,
    });
  }

  // Dual nostrils & two prehensile fingers (dorsal + ventral) at the tip of the trunk
  // Flared nostril rim block
  b.part(new THREE.CylinderGeometry(0.095, 0.088, 0.06, 7), HIDE_MAIN, {
    bone: trunkTip,
    at: trunkTip.at,
    dir: trunkTip.axis,
    flat: true,
    group: "trunk",
    name: "trunkTipCuff",
  });

  // Left and right dark nostril cavities
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.CylinderGeometry(0.032, 0.026, 0.04, 6), EYE_DARK, {
      bone: trunkTip,
      at: trunkTip.local([s * 0.036, 0.025, 0.005]),
      dir: trunkTip.axis,
      flat: true,
      group: "trunk",
      name: `nostril${side}`,
    });
  }

  // Dorsal prehensile finger (African elephants have two opposing fingers on the trunk tip)
  b.spike(
    trunkTip.local([0, 0.02, 0.068]),
    trunkTip.dir([0, 0.85, 0.45]),
    0.095,
    0.032,
    {
      bone: trunkTip,
      sides: 5,
      smooth: false,
      color: HIDE_DORSAL,
      group: "trunk",
      name: "trunkFingerDorsal",
    },
  );

  // Ventral prehensile finger
  b.spike(
    trunkTip.local([0, 0.015, -0.065]),
    trunkTip.dir([0, 0.85, -0.42]),
    0.085,
    0.028,
    {
      bone: trunkTip,
      sides: 5,
      smooth: false,
      color: HIDE_BELLY,
      group: "trunk",
      name: "trunkFingerVentral",
    },
  );

  // ---------------------------------------------------------------------------
  // 6. PILLAR LEGS, JOINT WRINKLES, BROAD FEET & TOENAILS
  // ---------------------------------------------------------------------------
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";

    // --- FRONT LEG ---
    const fChain = frontLegChains[s];
    const fGroup = `legF${side}`;
    const shoulderJ = fChain.joints[0];
    const elbowJ = fChain.joints[1];
    const wristJ = fChain.joints[2];
    const footFJ = fChain.tip!;

    b.sweep(
      fChain,
      (t) => {
        if (t < 0.35) return [0.34 - t * 0.22, 0.38 - t * 0.24];
        if (t < 0.75) return [0.25 - (t - 0.35) * 0.08, 0.27 - (t - 0.35) * 0.08];
        return [0.22 + (t - 0.75) * 0.32, 0.23 + (t - 0.75) * 0.28];
      },
      {
        section: { ngon: 7 },
        smooth: false,
        caps: "round",
        color: HIDE_MAIN,
        bands: [
          [0.68, HIDE_MAIN],
          [1.0, DUST_CLAY],
        ],
        group: fGroup,
        name: `frontLegTube${side}`,
      },
    );

    // Upper brachium muscle bulk merging into shoulder
    b.frustumBox(
      [s * 0.54, 2.38, 0.88],
      elbowJ.at,
      [0.48, 0.54],
      [0.36, 0.38],
      {
        bone: shoulderJ,
        color: HIDE_MAIN,
        group: fGroup,
        name: `brachium${side}`,
      },
    );

    // Posterior olecranon / elbow bump
    b.part(new THREE.DodecahedronGeometry(0.18, 0), HIDE_CREASE, {
      bone: elbowJ,
      at: [elbowJ.at.x, elbowJ.at.y + 0.04, elbowJ.at.z - 0.14],
      scale: [0.95, 0.85, 1.15],
      flat: true,
      group: fGroup,
      name: `elbowPad${side}`,
    });

    // Concentric knee/wrist skin folds on front of carpal joint
    for (let kw = 0; kw < 3; kw++) {
      const yK = wristJ.at.y + 0.12 - kw * 0.08;
      const wFold = catmull([
        [s * 0.58 - 0.18, yK, wristJ.at.z + 0.12],
        [s * 0.58, yK - 0.02, wristJ.at.z + 0.24],
        [s * 0.58 + 0.18, yK, wristJ.at.z + 0.12],
      ]);
      b.sweep(wFold, [0.02, 0.036, 0.02], {
        bone: wristJ,
        section: { ngon: 5 },
        smooth: false,
        color: kw % 2 === 0 ? HIDE_CREASE : DUST_OCHRE,
        group: fGroup,
        name: `wristCrease${side}${kw + 1}`,
      });
    }

    // Broad columnar front foot cylinder resting flat on y = 0
    const fFootCenter: [number, number, number] = [s * 0.58, 0.14, 0.9];
    b.part(new THREE.CylinderGeometry(0.27, 0.32, 0.28, 8), DUST_CLAY, {
      bone: footFJ,
      at: fFootCenter,
      flat: true,
      group: fGroup,
      name: `footCushionF${side}`,
    });

    // Tough dark leathery sole pad touching y = 0
    b.part(new THREE.CylinderGeometry(0.325, 0.31, 0.06, 8), SOLE_PAD, {
      bone: footFJ,
      at: [s * 0.58, 0.03, 0.9],
      flat: true,
      group: fGroup,
      name: `solePadF${side}`,
    });

    // 5 wide arch-shaped toenails on front foot
    for (let n = 0; n < 5; n++) {
      const u = (n - 2) / 2; // -1 .. 1
      const ang = (u * 58 - s * 6) * (Math.PI / 180);
      const nx = s * 0.58 + Math.sin(ang) * 0.305;
      const nz = 0.9 + Math.cos(ang) * 0.305;
      const nailScale = 1 - Math.abs(u) * 0.18;

      b.part(new THREE.CylinderGeometry(0.052 * nailScale, 0.068 * nailScale, 0.14 * nailScale, 6), NAIL_IVORY, {
        bone: footFJ,
        at: [nx, 0.07 * nailScale, nz],
        rotation: [-14 * Math.cos(ang), (ang * 180) / Math.PI, 14 * Math.sin(ang)],
        scale: [1.15, 1.0, 0.62],
        flat: true,
        group: fGroup,
        name: `toenailF${side}${n + 1}`,
      });
    }

    // --- HIND LEG ---
    const hChain = hindLegChains[s];
    const hGroup = `legH${side}`;
    const hipJ = hChain.joints[0];
    const kneeJ = hChain.joints[1];
    const ankleJ = hChain.joints[2];
    const footHJ = hChain.tip!;

    b.sweep(
      hChain,
      (t) => {
        if (t < 0.38) return [0.36 - t * 0.24, 0.42 - t * 0.28];
        if (t < 0.76) return [0.24 - (t - 0.38) * 0.08, 0.26 - (t - 0.38) * 0.08];
        return [0.21 + (t - 0.76) * 0.28, 0.23 + (t - 0.76) * 0.28];
      },
      {
        section: { ngon: 7 },
        smooth: false,
        caps: "round",
        color: HIDE_MAIN,
        bands: [
          [0.68, HIDE_MAIN],
          [1.0, DUST_CLAY],
        ],
        group: hGroup,
        name: `hindLegTube${side}`,
      },
    );

    // Massive upper thigh / haunch slab connecting pelvis to stifle/knee
    b.frustumBox(
      [s * 0.5, 2.32, -1.22],
      kneeJ.at,
      [0.52, 0.62],
      [0.36, 0.42],
      {
        bone: hipJ,
        color: HIDE_MAIN,
        group: hGroup,
        name: `thighHaunch${side}`,
      },
    );

    // Anterior patella / knee cap boss
    b.part(new THREE.DodecahedronGeometry(0.17, 0), HIDE_HIGHLIGHT, {
      bone: kneeJ,
      at: [kneeJ.at.x, kneeJ.at.y + 0.02, kneeJ.at.z + 0.14],
      scale: [0.95, 0.9, 1.1],
      flat: true,
      group: hGroup,
      name: `kneeCap${side}`,
    });

    // Posterior hock / calcaneus crease folds
    for (let hw = 0; hw < 3; hw++) {
      const yH = ankleJ.at.y + 0.1 - hw * 0.075;
      const hFold = catmull([
        [s * 0.54 - 0.16, yH, ankleJ.at.z - 0.1],
        [s * 0.54, yH + 0.02, ankleJ.at.z - 0.22],
        [s * 0.54 + 0.16, yH, ankleJ.at.z - 0.1],
      ]);
      b.sweep(hFold, [0.02, 0.035, 0.02], {
        bone: ankleJ,
        section: { ngon: 5 },
        smooth: false,
        color: hw % 2 === 0 ? HIDE_CREASE : DUST_OCHRE,
        group: hGroup,
        name: `hockCrease${side}${hw + 1}`,
      });
    }

    // Slightly more oval hind foot cushion resting flat on y = 0
    b.part(new THREE.CylinderGeometry(0.25, 0.29, 0.28, 8), DUST_CLAY, {
      bone: footHJ,
      at: [s * 0.54, 0.14, -1.26],
      scale: [0.94, 1.0, 1.08],
      flat: true,
      group: hGroup,
      name: `footCushionH${side}`,
    });

    // Hind sole pad touching y = 0
    b.part(new THREE.CylinderGeometry(0.295, 0.285, 0.06, 8), SOLE_PAD, {
      bone: footHJ,
      at: [s * 0.54, 0.03, -1.26],
      scale: [0.94, 1.0, 1.08],
      flat: true,
      group: hGroup,
      name: `solePadH${side}`,
    });

    // 4 toenails on hind foot (African bush elephants characteristically have 5 front, 4 hind nails)
    for (let n = 0; n < 4; n++) {
      const u = (n - 1.5) / 1.5; // -1 .. 1
      const ang = (u * 48 - s * 5) * (Math.PI / 180);
      const nx = s * 0.54 + Math.sin(ang) * 0.275;
      const nz = -1.26 + Math.cos(ang) * 0.305;
      const nailScale = 1 - Math.abs(u) * 0.15;

      b.part(new THREE.CylinderGeometry(0.05 * nailScale, 0.065 * nailScale, 0.135 * nailScale, 6), NAIL_IVORY, {
        bone: footHJ,
        at: [nx, 0.068 * nailScale, nz],
        rotation: [-14 * Math.cos(ang), (ang * 180) / Math.PI, 14 * Math.sin(ang)],
        scale: [1.15, 1.0, 0.62],
        flat: true,
        group: hGroup,
        name: `toenailH${side}${n + 1}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 7. TAIL & COARSE WIRE-BRISTLE SWITCH
  // ---------------------------------------------------------------------------
  b.sweep(
    tail,
    (t) => 0.095 * (1 - 0.62 * t),
    {
      section: { ngon: 6 },
      smooth: false,
      caps: "round",
      color: HIDE_MAIN,
      bands: [
        [0.75, HIDE_MAIN],
        [1.0, HIDE_CREASE],
      ],
      group: "tail",
      name: "tailTube",
    },
  );

  // Tail root skin folds at croup junction
  for (let tf = 0; tf < 2; tf++) {
    const tFold = catmull([
      [-0.14, 2.18 - tf * 0.08, -1.82 - tf * 0.04],
      [0, 2.28 - tf * 0.08, -1.88 - tf * 0.04],
      [0.14, 2.18 - tf * 0.08, -1.82 - tf * 0.04],
    ]);
    b.sweep(tFold, [0.018, 0.032, 0.018], {
      bone: tail.joints[0],
      section: { ngon: 5 },
      smooth: false,
      color: HIDE_CREASE,
      group: "tail",
      name: `tailRootFold${tf + 1}`,
    });
  }

  // Coarse black wire-like tail tuft (flattened bi-lateral bristle fan at the tail tip)
  const tailTip = tail.tip!;
  b.part(new THREE.ConeGeometry(0.068, 0.34, 6), TAIL_HAIR, {
    bone: tailTip,
    at: tailTip.local([0, 0.14, 0]),
    dir: tailTip.axis,
    scale: [0.65, 1.0, 1.35],
    flat: true,
    group: "tail",
    name: "tailTuftCore",
  });

  b.ring(
    frame(tailTip.at, tailTip.axis),
    { count: 8, radius: 0.028, tilt: 18, group: "tail" },
    (bristle, idx) => {
      const len = 0.28 + (idx % 2) * 0.07;
      b.spike(bristle, bristle, len, 0.018, {
        bone: tailTip,
        sides: 4,
        smooth: false,
        color: idx % 3 === 0 ? HIDE_CREASE : TAIL_HAIR,
        group: "tail",
        name: `tailBristle${idx + 1}`,
      });
    },
  );

  return b.root;
}
