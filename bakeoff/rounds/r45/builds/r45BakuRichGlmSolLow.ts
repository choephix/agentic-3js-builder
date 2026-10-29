import * as THREE from "three";
import { createBuilder, type Builder, type Joint, catmull, frame, rng, b as _unused, polyline } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Baku, the Dream-Eater",
  "description": "A great tapir spirit stands swallowing a glowing spiral of dream-mist that curls into its trunk, every surface a flat ukiyo-e colour field edged in ink with gold cloud trim."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  ink: "#1d1a26",
  indigo: "#3b4a6b",
  indigoDeep: "#27314a",
  slate: "#5a6b8c",
  cream: "#f3ead4",
  gold: "#e7b814",
  goldDeep: "#a8801a",
  vermilion: "#c93a2e",
  blush: "#e8a8a0",
  teal: "#3f7d7a",
  mist: "#eaf6f4",
  mistBlue: "#8fd0e0",
  white: "#fbf7ee",
  horn: "#e8dfc8",
};
const M = {
  neckBase: [0, 1.42, 0.95] as [number, number, number],
  skullCentre: [0, 1.62, 1.25] as [number, number, number],
  trunkTip: [0, 1.08, 1.98] as [number, number, number],
  shoulderLine: [0, 1.05, 0.8] as [number, number, number],
  hipLine: [0, 1.05, -0.8] as [number, number, number],
  spineCrest: [0, 1.52, 0] as [number, number, number],
  rump: [0, 1.42, -1.05] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // torso
  (() => {
function buildTorso({ b, J, P, M }: Ctx) {
  const INK = P.ink;
  const INDIGO = P.indigo;
  const DEEP = P.indigoDeep;
  const SLATE = P.slate;
  const CREAM = P.cream;
  const GOLD = P.gold;
  const GOLD_DEEP = P.goldDeep;
  const TEAL = P.teal;
  const VERMILION = P.vermilion;

  /*
   * The spine is deliberately slightly arched rather than a straight capsule.
   * This gives the tapir a heavy, old woodblock silhouette: deep belly, broad
   * shoulder, and a high rump ready to meet the mane and tail.
   */
  const spine = catmull(
    [
      [0, 1.08, -1.12],
      [0, 1.06, -0.78],
      [0, 1.02, -0.25],
      [0, 1.08, 0.35],
      [0, 1.16, 0.78],
      [0, 1.25, 1.04],
    ],
    { tension: 0.35 },
  );

  const torso = b.loft(
    [
      { at: [0, 1.16, -1.12], w: 0.72, h: 0.62 },
      { at: [0, 1.08, -0.82], w: 0.86, h: 0.82 },
      { at: [0, 1.02, -0.35], w: 0.93, h: 0.91 },
      { at: [0, 1.03, 0.18], w: 0.95, h: 0.94 },
      { at: [0, 1.12, 0.63], w: 0.88, h: 0.84 },
      { at: [0, 1.25, 1.04], w: 0.70, h: 0.67 },
    ],
    {
      bone: [J.body, J.neck],
      color: INDIGO,
      section: "circle",
      sides: 8,
      caps: "round",
      name: "torsoBarrel",
      group: "torso",
    },
  );

  /*
   * A broad cream belly field is kept as separate geometry instead of paint.
   * It is slightly inset into the lower half of the barrel and follows the
   * torso's long axis, leaving a clean indigo rim like a printed registration
   * border.
   */
  const bellyPanel = new THREE.BoxGeometry(0.58, 0.035, 1.72, 1, 1, 5);
  b.part(bellyPanel, CREAM, {
    bone: J.body,
    at: [0, 0.615, -0.03],
    scale: [1, 1, 1],
    name: "torsoCreamBelly",
    group: "torso",
  });

  const bellyInk = new THREE.BoxGeometry(0.65, 0.018, 1.78, 1, 1, 5);
  b.part(bellyInk, INK, {
    bone: J.body,
    at: [0, 0.594, -0.03],
    name: "torsoBellyInkEdge",
    group: "ink",
  });

  /*
   * Chest collar: a closed tube around the forward barrel. The loop is cut
   * from the built surface so it remains seated if the neck is posed.
   */
  const torsoSurface = b.surface(torso);
  const chestLoop = torsoSurface.loop([0, 1.12, 0.78], {
    dir: [0, 0, 1],
    lift: 0.012,
  });
  b.sweep(chestLoop, 0.027, {
    color: GOLD,
    bone: J.body,
    section: { ngon: 6 },
    caps: "none",
    name: "torsoGoldChestBand",
    group: "goldTrim",
  });

  const chestInkLoop = torsoSurface.loop([0, 1.12, 0.78], {
    dir: [0, 0, 1],
    lift: 0.017,
  });
  b.sweep(chestInkLoop, 0.009, {
    color: INK,
    bone: J.body,
    section: { ngon: 5 },
    caps: "none",
    name: "torsoChestBandInk",
    group: "ink",
  });

  /*
   * Ukiyo-e cloud medallions. Each is a shallow teal slab seated on the hide,
   * with a dark registration rim and a cream spiral laid over its face.
   * The positions intentionally use surface hits rather than guessed offsets.
   */
  const cloud = (
    x: number,
    z: number,
    azimuth: number,
    elevation: number,
    scale: number,
    side: number,
    name: string,
  ) => {
    const hit = torsoSurface.around([0, 1.05, z]).at(azimuth, elevation);
    if (!hit) return;

    const n = hit.axis.clone().normalize();
    const tangent = new THREE.Vector3(0, 1, 0);
    if (Math.abs(n.dot(tangent)) > 0.92) tangent.set(0, 0, 1);

    const across = new THREE.Vector3().crossVectors(tangent, n).normalize();
    const up = new THREE.Vector3().crossVectors(n, across).normalize();
    const c = hit.at.clone().addScaledVector(n, 0.006);

    const rim = [
      c.clone().addScaledVector(across, -0.16 * scale).addScaledVector(up, -0.11 * scale),
      c.clone().addScaledVector(across, 0.18 * scale).addScaledVector(up, -0.08 * scale),
      c.clone().addScaledVector(across, 0.16 * scale).addScaledVector(up, 0.11 * scale),
      c.clone().addScaledVector(across, -0.16 * scale).addScaledVector(up, 0.13 * scale),
    ];
    b.slab(rim, {
      color: INK,
      thickness: 0.018,
      bone: J.body,
      name: `${name}InkRim`,
      group: "cloudInk",
    });

    const face = rim.map((p) => p.clone().addScaledVector(n, 0.014));
    b.slab(face, {
      color: TEAL,
      thickness: 0.014,
      bone: J.body,
      name: `${name}TealField`,
      group: "clouds",
    });

    const spiralPts: THREE.Vector3[] = [];
    const turns = 1.7;
    const count = 13;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const a = t * Math.PI * 2 * turns;
      const r = (1 - t) * 0.105 * scale + 0.008;
      spiralPts.push(
        c
          .clone()
          .addScaledVector(across, Math.cos(a) * r)
          .addScaledVector(up, Math.sin(a) * r)
          .addScaledVector(n, 0.031),
      );
    }

    for (let i = 0; i < spiralPts.length - 1; i++) {
      b.rod(spiralPts[i], spiralPts[i + 1], 0.014 * scale, {
        color: CREAM,
        bone: J.body,
        section: { ngon: 5 },
        name: `${name}CreamSpiral${i}`,
        group: "cloudDetail",
      });
    }

    const crestDot = new THREE.SphereGeometry(0.021 * scale, 7, 5);
    b.stick(crestDot, GOLD, hit.moved(n.clone().multiplyScalar(0.035)), {
      embed: 0.25,
      bone: J.body,
      name: `${name}GoldStud`,
      group: "goldTrim",
    });
  };

  cloud(0.42, 0.22, 90, 8, 1.0, 1, "torsoCloudShoulder");
  cloud(-0.43, -0.18, -90, 7, 0.92, -1, "torsoCloudFlankR");
  cloud(0.42, -0.72, 90, 4, 0.78, 1, "torsoCloudRump");

  /*
   * Paired vermilion seal marks on the rump. The dark backing makes them read
   * like carved red stamps even at a distance.
   */
  for (const s of [-1, 1]) {
    const hit = torsoSurface.around([0, 1.05, -0.78]).at(s * 76, 2);
    if (!hit) continue;

    const backing = new THREE.CylinderGeometry(0.105, 0.105, 0.018, 10);
    b.stick(backing, INK, hit.moved([0, 0.008, 0]), {
      embed: 0.45,
      spin: s * 12,
      name: `torsoSealInk${s}`,
      group: "seal",
    });

    const seal = new THREE.CylinderGeometry(0.082, 0.082, 0.021, 8);
    b.stick(seal, VERMILION, hit.moved([0, 0.018, 0]), {
      embed: 0.38,
      spin: s * 12,
      name: `torsoSealRed${s}`,
      group: "seal",
    });

    const sealMark = new THREE.BoxGeometry(0.012, 0.004, 0.088);
    b.stick(sealMark, CREAM, hit.moved([0, 0.032, 0]), {
      embed: 0.2,
      spin: s * 12 + 45,
      scale: [1, 1, 0.72],
      name: `torsoSealMark${s}`,
      group: "sealDetail",
    });
  }

  /*
   * Shoulder socket accents and small printed contour blocks visually tie the
   * barrel into the neck and foreleg mounts.
   */
  for (const s of [-1, 1]) {
    const shoulder = torsoSurface.around([0, 1.1, 0.77]).at(s * 72, 20);
    if (!shoulder) continue;

    b.stick(
      new THREE.CylinderGeometry(0.105, 0.105, 0.022, 8),
      DEEP,
      shoulder.moved([0, 0.008, 0]),
      {
        embed: 0.35,
        name: `torsoShoulderSocket${s}`,
        group: "torsoInk",
      },
    );

    b.stick(
      new THREE.CylinderGeometry(0.075, 0.075, 0.026, 8),
      SLATE,
      shoulder.moved([0, 0.022, 0]),
      {
        embed: 0.3,
        name: `torsoShoulderHighlight${s}`,
        group: "torsoHighlights",
      },
    );
  }

  /*
   * A handful of dark contour strokes at the belly-to-flank transition give
   * the barrel the crisp cut-paper edge characteristic of a woodblock print.
   */
  const contourPath = catmull([
    [-0.43, 0.74, -0.82],
    [-0.47, 0.69, -0.25],
    [-0.48, 0.68, 0.35],
    [-0.39, 0.78, 0.82],
  ]);
  b.sweep(contourPath, 0.008, {
    color: INK,
    bone: J.body,
    section: { ngon: 5 },
    caps: "round",
    name: "torsoLeftBellyContour",
    group: "ink",
  });

  const contourPathR = catmull([
    [0.43, 0.74, -0.82],
    [0.47, 0.69, -0.25],
    [0.48, 0.68, 0.35],
    [0.39, 0.78, 0.82],
  ]);
  b.sweep(contourPathR, 0.008, {
    color: INK,
    bone: J.body,
    section: { ngon: 5 },
    caps: "round",
    name: "torsoRightBellyContour",
    group: "ink",
  });

  return torso;
}
    return buildTorso;
  })(),
  // head
  (() => {
function buildHead({ b, J, P, M }: Ctx) {
  const INK = P.ink;
  const INDIGO = P.indigo;
  const DEEP = P.indigoDeep;
  const SLATE = P.slate;
  const CREAM = P.cream;
  const GOLD = P.gold;
  const GOLD_DEEP = P.goldDeep;
  const VERMILION = P.vermilion;
  const BLUSH = P.blush;
  const TEAL = P.teal;
  const HORN = P.horn;
  const WHITE = P.white;

  const skullAt = M.skullCentre as [number, number, number];
  const trunkTip = M.trunkTip as [number, number, number];

  const sphere = (
    at: [number, number, number],
    scale: [number, number, number],
    color: string,
    bone: any = J.head,
    segments = 12,
  ) =>
    b.part(new THREE.SphereGeometry(1, segments, Math.max(8, segments - 2)), color, {
      at,
      bone,
      scale,
      flat: true,
    });

  const box = (
    at: [number, number, number],
    size: [number, number, number],
    color: string,
    bone: any = J.head,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      flat: true,
    });

  const rod = (a: any, c: any, radius: number, color: string, bone?: any) =>
    b.rod(a, c, radius, { color, bone: bone ?? undefined, section: { ngon: 8 } });

  // Rounded skull and heavy upper muzzle. The dark rear wedge gives the head a
  // strong woodblock silhouette beneath the softer face.
  sphere(skullAt, [0.36, 0.34, 0.43], INDIGO, J.head, 14);
  sphere([0, 1.58, 1.50], [0.30, 0.22, 0.30], SLATE, J.head, 10);
  box([0, 1.49, 1.38], [0.48, 0.16, 0.29], DEEP, J.head);

  // Ink cheek and jaw silhouette.
  sphere([0, 1.47, 1.48], [0.255, 0.105, 0.245], INK, J.jaw, 10);
  sphere([0, 1.50, 1.50], [0.225, 0.075, 0.22], DEEP, J.jaw, 10);

  // Cream gum and vermilion tongue inside the open lower mouth.
  box([0, 1.535, 1.565], [0.31, 0.026, 0.115], CREAM, J.jaw);
  sphere([0, 1.485, 1.585], [0.13, 0.018, 0.075], VERMILION, J.jaw, 8);
  rod([-0.12, 1.535, 1.61], [0.12, 1.535, 1.61], 0.009, INK, J.jaw);

  // Broad almond-like eye masks, whites, teal irises, and tiny highlights.
  for (const s of [-1, 1]) {
    const x = s * 0.155;
    sphere([x, 1.685, 1.535], [0.105, 0.072, 0.026], INK, J.head, 10);
    sphere([x, 1.687, 1.545], [0.087, 0.055, 0.018], WHITE, J.head, 10);
    sphere([x, 1.687, 1.562], [0.047, 0.040, 0.014], TEAL, J.head, 8);
    sphere([x, 1.687, 1.575], [0.017, 0.032, 0.009], INK, J.head, 7);
    sphere([x - s * 0.017, 1.705, 1.586], [0.012, 0.012, 0.006], WHITE, J.head, 6);

    // Heavy graphic upper lid and gold brow.
    rod([x - s * 0.09, 1.746, 1.565], [x + s * 0.08, 1.735, 1.568], 0.012, INK, J.head);
    rod([x - s * 0.085, 1.805, 1.515], [x + s * 0.075, 1.815, 1.535], 0.014, GOLD, J.head);
  }

  // Trunk, with a cream underside sector suggested by a slim seated stripe.
  const trunkPath: [number, number, number][] = [
    [0, 1.53, 1.62],
    [0, 1.43, 1.72],
    [0, 1.28, 1.83],
    [0, 1.14, 1.92],
    trunkTip,
  ];
  b.sweep(trunkPath, (t: number) => 0.14 - 0.07 * t, {
    bone: [J.trunk1, J.trunk2, J.trunk3],
    color: INDIGO,
    sides: 8,
    caps: "round",
  });
  b.sweep(
    [
      [0, 1.485, 1.63],
      [0, 1.38, 1.75],
      [0, 1.22, 1.86],
      [0, 1.10, 1.95],
    ],
    (t: number) => 0.035 - 0.018 * t,
    {
      bone: [J.trunk1, J.trunk2, J.trunk3],
      color: CREAM,
      sides: 6,
      caps: "flat",
    },
  );

  // Flared nostril rim and two nostril marks at the exact dream-entry mount.
  sphere(trunkTip, [0.082, 0.055, 0.045], INK, J.trunk3, 9);
  sphere([0, 1.08, 1.985], [0.063, 0.040, 0.027], DEEP, J.trunk3, 8);
  sphere([-0.027, 1.10, 2.008], [0.012, 0.010, 0.008], INK, J.trunk3, 6);
  sphere([0.027, 1.10, 2.008], [0.012, 0.010, 0.008], INK, J.trunk3, 6);
  rod([-0.064, 1.085, 2.008], [0.064, 1.085, 2.008], 0.006, CREAM, J.trunk3);

  // Curved ivory tusks rising from either side of the open jaw.
  for (const s of [-1, 1]) {
    const tusk: [number, number, number][] = [
      [s * 0.145, 1.485, 1.53],
      [s * 0.17, 1.54, 1.56],
      [s * 0.18, 1.61, 1.57],
    ];
    b.sweep(tusk, [0.035, 0.004], {
      bone: J.jaw,
      color: HORN,
      sides: 7,
      caps: "point",
    });
    rod([s * 0.11, 1.56, 1.52], [s * 0.20, 1.56, 1.52], 0.006, GOLD_DEEP, J.jaw);
  }

  // Large splayed ears: ink silhouette, indigo outer slab, blush inset,
  // and a gold stud at each root.
  const earOutline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [0.16, 0.03, "sharp"],
    [0.22, 0.22, "sharp"],
    [0.08, 0.43, "sharp"],
    [-0.025, 0.29, "sharp"],
  ];
  for (const s of [-1, 1]) {
    const at: [number, number, number] = [s * 0.25, 1.76, 1.22];
    b.extrude(earOutline, {
      at,
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      color: INK,
      bone: J.head,
      name: `earInk${s}`,
    });
    b.extrude(
      [
        [0.018, 0.035, "sharp"],
        [0.135, 0.055, "sharp"],
        [0.17, 0.20, "sharp"],
        [0.08, 0.34, "sharp"],
        [0.025, 0.25, "sharp"],
      ],
      {
        at: [s * 0.252, 1.765, 1.225],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.052,
        color: BLUSH,
        bone: J.head,
        name: `earInner${s}`,
      },
    );
    sphere([s * 0.275, 1.78, 1.235], [0.035, 0.035, 0.025], GOLD, J.head, 7);
    rod([s * 0.275, 1.79, 1.235], [s * 0.275, 2.00, 1.235], 0.008, GOLD_DEEP, J.head);
  }

  // Three unmistakable gold flame blades between the ears.
  const crest = [
    [
      [0, 1.82],
      [0.075, 1.88],
      [0.035, 2.14],
      [-0.012, 1.98],
      [-0.07, 1.88],
    ],
    [
      [0, 1.82],
      [0.065, 1.87],
      [0.115, 2.04],
      [0.02, 1.96],
      [-0.06, 1.87],
    ],
    [
      [0, 1.82],
      [0.05, 1.88],
      [0.01, 2.22],
      [-0.05, 1.98],
      [-0.08, 1.87],
    ],
  ];
  crest.forEach((outline, i) => {
    b.extrude(outline as any, {
      at: [0, 0, 1.26],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: i === 1 ? 0.035 : 0.045,
      color: i === 1 ? GOLD : GOLD_DEEP,
      bone: J.head,
      name: `flameCrest${i}`,
    });
  });

  // Graphic cheek seals complete the ukiyo-e face framing.
  for (const s of [-1, 1]) {
    sphere([s * 0.245, 1.55, 1.545], [0.026, 0.026, 0.012], VERMILION, J.head, 7);
    rod([s * 0.245, 1.515, 1.565], [s * 0.245, 1.585, 1.565], 0.004, GOLD, J.head);
  }
}
    return buildHead;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P, M }: Ctx) {
  const INK = P.ink ?? "#1d1a26";
  const INDIGO = P.indigo ?? "#3b4a6b";
  const DEEP = P.indigoDeep ?? "#27314a";
  const CREAM = P.cream ?? "#f3ead4";
  const GOLD = P.gold ?? "#e7b814";
  const HORN = P.horn ?? "#e8dfc8";

  const V = (p: any) => (p instanceof THREE.Vector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2]));
  const add = (p: any, x: number, y: number, z: number) =>
    V(p).add(new THREE.Vector3(x, y, z));

  const legData = [
    { side: 1, hip: J.hipFL, knee: J.kneeFL, ankle: J.ankleFL, toe: J.toeFL, name: "frontL" },
    { side: -1, hip: J.hipFR, knee: J.kneeFR, ankle: J.ankleFR, toe: J.toeFR, name: "frontR" },
    { side: 1, hip: J.hipBL, knee: J.kneeBL, ankle: J.ankleBL, toe: J.toeBL, name: "backL" },
    { side: -1, hip: J.hipBR, knee: J.kneeBR, ankle: J.ankleBR, toe: J.toeBR, name: "backR" },
  ];

  for (const leg of legData) {
    const hip = V(leg.hip.at);
    const knee = V(leg.knee.at);
    const ankle = V(leg.ankle.at);
    const toe = V(leg.toe.at);

    const path = polyline([hip, knee, ankle, toe]);
    b.sweep(path, (t: number) => 0.13 - 0.04 * t, {
      bone: [leg.hip, leg.knee, leg.ankle, leg.toe],
      color: INDIGO,
      section: { ngon: 8 },
      caps: "round",
      name: `${leg.name}_pillar`,
      group: "legs",
    });

    // A broad cream front-facing stripe, following the same bent silhouette.
    const stripePath = polyline([
      add(hip, 0, 0, 0.112),
      add(knee, 0, 0, 0.103),
      add(ankle, 0, 0, 0.082),
      add(toe, 0, 0, 0.075),
    ]);
    b.sweep(stripePath, 0.018, {
      bone: [leg.hip, leg.knee, leg.ankle, leg.toe],
      color: CREAM,
      section: { ngon: 5 },
      caps: "flat",
      name: `${leg.name}_creamStripe`,
      group: "legs",
    });

    // Dark angular knee guard.
    b.part(new THREE.SphereGeometry(0.145, 8, 5), INK, {
      bone: leg.knee,
      at: knee,
      scale: [0.88, 0.62, 0.42],
      name: `${leg.name}_kneeInk`,
      group: "legs",
    });
    b.part(new THREE.SphereGeometry(0.112, 8, 5), DEEP, {
      bone: leg.knee,
      at: add(knee, 0, 0, 0.018),
      scale: [0.9, 0.6, 0.34],
      name: `${leg.name}_kneePlate`,
      group: "legs",
    });

    // Gold pastern ring, visibly separating leg from hoof.
    b.part(new THREE.CylinderGeometry(0.105, 0.11, 0.045, 8), GOLD, {
      bone: leg.ankle,
      at: add(ankle, 0, -0.015, 0),
      name: `${leg.name}_goldPastern`,
      group: "legs",
    });

    // Two chunky cloven hoof halves. Their bottoms are exactly at y = 0.
    const hoofY = 0.075;
    const hoofZ = toe.z + (leg.name.startsWith("front") ? 0.035 : -0.015);
    for (const cleft of [-1, 1]) {
      b.part(new THREE.BoxGeometry(0.075, 0.15, 0.22), HORN, {
        bone: leg.toe,
        at: [toe.x + cleft * 0.046, hoofY, hoofZ],
        scale: [1, 1, 1],
        name: `${leg.name}_hoof${cleft < 0 ? "A" : "B"}`,
        group: "legs",
      });
      // Dark painted-looking edge on each outer hoof face.
      b.part(new THREE.BoxGeometry(0.012, 0.115, 0.19), INK, {
        bone: leg.toe,
        at: [toe.x + cleft * 0.085, hoofY + 0.006, hoofZ],
        name: `${leg.name}_hoofEdge${cleft < 0 ? "A" : "B"}`,
        group: "legs",
      });
    }

    // Deep cleft between the two ivory halves, plus a short toe seam.
    b.part(new THREE.BoxGeometry(0.014, 0.12, 0.225), INK, {
      bone: leg.toe,
      at: [toe.x, hoofY + 0.006, hoofZ],
      name: `${leg.name}_hoofCleft`,
      group: "legs",
    });
    b.rod(
      [toe.x - 0.07, 0.102, hoofZ + 0.112],
      [toe.x + 0.07, 0.102, hoofZ + 0.112],
      0.008,
      { bone: leg.toe, color: INK, name: `${leg.name}_toeSeam`, group: "legs" },
    );

    // Small ivory socket button at the hoof root, making each joint read clearly.
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.028, 8), HORN, {
      bone: leg.toe,
      at: [toe.x, 0.16, toe.z],
      name: `${leg.name}_hoofCrown`,
      group: "legs",
    });
  }
}
    return buildLegs;
  })(),
  // maneTail
  (() => {
function buildManeTail({ b, J, P, M }: Ctx) {
  const INK = P.ink;
  const DEEP = P.indigoDeep;
  const INDIGO = P.indigo;
  const SLATE = P.slate;
  const GOLD = P.gold;
  const GOLD_DEEP = P.goldDeep;
  const TEAL = P.teal;
  const CREAM = P.cream;
  const WHITE = P.white;

  const blade = (
    z: number,
    h: number,
    w: number,
    color: string,
    lean: number,
    i: number,
  ) => {
    const rootY = 1.46 + (z > 0.6 ? 0.035 : 0);
    const outline: [number, number, "sharp"?][] = [
      [-w * 0.42, 0, "sharp"],
      [w * 0.42, 0, "sharp"],
      [w * 0.34 + lean * 0.35, h * 0.42, "sharp"],
      [lean, h, "sharp"],
      [-w * 0.18 + lean * 0.2, h * 0.72, "sharp"],
      [-w * 0.5, h * 0.22, "sharp"],
    ];
    const p = b.extrude(outline, {
      at: [0, rootY, z],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.026,
      bevel: 0.004,
      color,
      bone: J.body,
      name: `maneBlade${i}`,
      group: "mane",
    });
    // A narrow ink edge behind every blade makes the silhouette read like a woodblock cut.
    b.extrude(
      [
        [-w * 0.44, -0.008, "sharp"],
        [w * 0.44, -0.008, "sharp"],
        [w * 0.38 + lean * 0.35, h * 0.43, "sharp"],
        [lean + 0.008, h + 0.012, "sharp"],
        [-w * 0.2 + lean * 0.2, h * 0.72, "sharp"],
        [-w * 0.52, h * 0.2, "sharp"],
      ],
      {
        at: [0, rootY - 0.003, z],
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0,
        color: INK,
        bone: J.body,
        name: `maneInk${i}`,
        group: "maneInk",
      },
    );
    return p;
  };

  const maneZ = [0.98, 0.76, 0.53, 0.28, 0.02, -0.24, -0.48, -0.72, -0.94, -1.12];
  const heights = [0.38, 0.48, 0.58, 0.68, 0.72, 0.65, 0.57, 0.49, 0.4, 0.3];
  const widths = [0.16, 0.18, 0.2, 0.22, 0.23, 0.22, 0.2, 0.18, 0.16, 0.13];
  const colors = [INDIGO, INDIGO, DEEP, DEEP, DEEP, SLATE, GOLD_DEEP, GOLD_DEEP, GOLD, GOLD];

  for (let i = 0; i < maneZ.length; i++) {
    blade(maneZ[i], heights[i], widths[i], colors[i], -0.045 - i * 0.004, i);
  }

  // Gold collar-like roots tie the separate mane blades into one carved crest.
  for (let i = 0; i < 5; i++) {
    const z = 0.84 - i * 0.42;
    b.rod(
      [0, 1.475, z - 0.075],
      [0, 1.475, z + 0.075],
      0.012,
      {
        color: GOLD,
        bone: J.body,
        name: `maneGoldRoot${i}`,
        group: "maneTrim",
      },
    );
  }

  const tailPath = catmull([
    [0, 1.41, -1.04],
    [0, 1.25, -1.2],
    [0, 1.08, -1.39],
    [0, 0.9, -1.56],
  ]);

  const tail = b.sweep(tailPath, (t: number) => 0.082 * (1 - t) + 0.027, {
    color: DEEP,
    bone: [J.body, J.tail1, J.tail2, J.tail3],
    sides: 7,
    caps: "round",
    name: "oxTail",
    group: "tail",
  });

  // Ink underside and a warm dorsal stripe, kept as narrow companion tubes.
  b.sweep(tailPath, (t: number) => 0.086 * (1 - t) + 0.018, {
    color: INK,
    bone: [J.body, J.tail1, J.tail2, J.tail3],
    sides: 6,
    sectors: [[135, 225, INK]],
    name: "tailInkUnderside",
    group: "tailInk",
  });
  b.sweep(tailPath, [0.018, 0.006], {
    color: GOLD_DEEP,
    bone: [J.body, J.tail1, J.tail2, J.tail3],
    sides: 6,
    shift: [0, -0.055],
    name: "tailGoldStripe",
    group: "tailTrim",
  });

  // Hanging ox-tail tuft: broad gold spikes with cream tips.
  const tuftBase: [number, number, number] = [0, 0.88, -1.57];
  const tuftAngles = [-38, -22, -7, 9, 24, 40];
  for (let i = 0; i < tuftAngles.length; i++) {
    const a = (tuftAngles[i] * Math.PI) / 180;
    const x = Math.sin(a) * 0.095;
    const z = tuftBase[2] - 0.012 * Math.cos(a);
    const base: [number, number, number] = [x * 0.35, tuftBase[1], z];
    const tip: [number, number, number] = [x, 0.62 - Math.abs(x) * 0.18, z - 0.035];
    b.spike(base, tip, null, 0.027, {
      color: GOLD,
      bone: J.tail3,
      sides: 6,
      caps: "point",
      name: `tailTassel${i}`,
      group: "tailTuft",
    });
    const mid: [number, number, number] = [
      base[0] * 0.35 + tip[0] * 0.65,
      base[1] * 0.35 + tip[1] * 0.65,
      z,
    ];
    b.spike(mid, [0, -1, -0.05], 0.12, 0.015, {
      color: CREAM,
      bone: J.tail3,
      sides: 5,
      caps: "point",
      name: `tailTasselTip${i}`,
      group: "tailTuft",
    });
  }

  const cloudOutline: [number, number, "sharp"?][] = [
    [-0.19, -0.05, "sharp"],
    [-0.08, -0.12, "sharp"],
    [0.05, -0.1, "sharp"],
    [0.17, -0.02, "sharp"],
    [0.19, 0.08, "sharp"],
    [0.1, 0.16, "sharp"],
    [-0.04, 0.15, "sharp"],
    [-0.16, 0.1, "sharp"],
  ];

  const cloud = (x: number, y: number, z: number, s: number, side: number, n: number) => {
    b.extrude(
      cloudOutline.map(([u, v]) => [u * s, v * s, "sharp"]),
      {
        at: [x, y, z],
        x: [side, 0, 0],
        y: [0, 0.985, 0.16],
        thickness: 0.018,
        bevel: 0.004,
        color: TEAL,
        bone: J.body,
        name: `tailCloud${n}`,
        group: "cloudMotif",
      },
    );
    const spiralPts: [number, number, number][] = [];
    for (let i = 0; i <= 9; i++) {
      const t = i / 9;
      const ang = t * Math.PI * 1.65;
      const r = s * (0.105 * (1 - t) + 0.012);
      spiralPts.push([
        x + side * Math.cos(ang) * r,
        y + Math.sin(ang) * r * 0.72,
        z + Math.sin(ang) * r * 0.35,
      ]);
    }
    b.sweep(polyline(spiralPts), 0.012 * s / 0.9, {
      color: CREAM,
      bone: J.body,
      sides: 5,
      caps: "round",
      name: `tailCloudSpiral${n}`,
      group: "cloudMotif",
    });
    b.rod(
      [x - side * 0.16 * s, y + 0.17 * s, z],
      [x + side * 0.16 * s, y + 0.17 * s, z],
      0.006,
      {
        color: INK,
        bone: J.body,
        name: `tailCloudInk${n}`,
        group: "cloudMotifInk",
      },
    );
  };

  cloud(0.46, 1.28, -1.04, 0.72, 1, 0);
  cloud(-0.46, 1.2, -1.12, 0.62, -1, 1);
  cloud(0.42, 1.03, -1.3, 0.42, 1, 2);

  // A few carved gold flecks along the descending mane.
  for (let i = 0; i < 6; i++) {
    const z = 0.68 - i * 0.29;
    b.part(
      new THREE.OctahedronGeometry(0.022 + (i % 2) * 0.006, 0),
      i < 2 ? GOLD : GOLD_DEEP,
      {
        at: [0.13, 1.63 - i * 0.025, z],
        dir: [0, 0, 1],
        bone: J.body,
        name: `maneFleck${i}`,
        group: "maneOrnament",
      },
    );
  }
}
    return buildManeTail;
  })(),
  // dreamswirl
  (() => {
function buildDreamswirl({ b, J, P, M }: Ctx) {
  const mist = P.mist ?? "#eaf6f4";
  const mistBlue = P.mistBlue ?? "#8fd0e0";
  const white = P.white ?? "#fbf7ee";
  const gold = P.gold ?? "#e7b814";
  const ink = P.ink ?? "#1d1a26";

  const inner = new THREE.Vector3(...M.trunkTip);
  const random = rng(417);

  // A broad, rising woodblock-like spiral.  It starts buried in the trunk opening
  // and opens toward the viewer, with a soft change of height as it turns.
  function spiralPoints(
    phase: number,
    radiusScale: number,
    zEnd: number,
    yOffset: number,
    turns: number,
    count: number,
  ): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const angle = phase + t * Math.PI * 2 * turns;
      const radius = 0.018 + radiusScale * Math.pow(t, 0.78);
      const z = inner.z + (zEnd - inner.z) * t;
      const y =
        inner.y +
        yOffset +
        0.24 * Math.sin(t * Math.PI * 1.12) +
        0.14 * t;
      points.push([
        inner.x + Math.cos(angle) * radius,
        y + Math.sin(angle) * radius * 0.72,
        z,
      ]);
    }
    return points;
  }

  const mainPath = catmull(
    spiralPoints(-Math.PI * 0.18, 0.43, 2.78, 0.02, 1.42, 26),
  );
  const innerPath = catmull(
    spiralPoints(Math.PI * 0.76, 0.27, 2.63, -0.035, 1.58, 24),
  );
  const ghostPath = catmull(
    spiralPoints(Math.PI * 1.5, 0.19, 2.47, 0.06, 1.42, 20),
  );

  const mainRibbon = b.sweep(mainPath, (t: number) => 0.052 * (1 - 0.78 * t), {
    bone: J.trunk3,
    color: mistBlue,
    sides: 7,
    caps: { start: "round", end: "point" },
    name: "dreamswirlRibbonOuter",
    group: "dreamswirl",
  });
  const paleRibbon = b.sweep(innerPath, (t: number) => 0.035 * (1 - 0.82 * t), {
    bone: J.trunk3,
    color: mist,
    sides: 7,
    caps: { start: "round", end: "point" },
    name: "dreamswirlRibbonInner",
    group: "dreamswirl",
  });
  const ghostRibbon = b.sweep(ghostPath, (t: number) => 0.018 * (1 - 0.9 * t), {
    bone: J.trunk3,
    color: white,
    sides: 6,
    caps: { start: "round", end: "point" },
    name: "dreamswirlRibbonGhost",
    group: "dreamswirl",
  });

  glow(mainRibbon, 1.35);
  glow(paleRibbon, 1.5);
  glow(ghostRibbon, 1.25);

  // A dark-blue/ink underside accent gives the mist the crisp, printed edge
  // characteristic of a woodblock illustration.
  const edgePath = catmull(
    spiralPoints(-Math.PI * 0.18, 0.43, 2.78, -0.052, 1.42, 22),
  );
  const edge = b.sweep(edgePath, (t: number) => 0.009 * (1 - 0.7 * t), {
    bone: J.trunk3,
    color: ink,
    sides: 5,
    caps: { start: "flat", end: "point" },
    name: "dreamswirlInkEdge",
    group: "dreamswirl",
  });

  // Spark diamonds are deliberately sparse and asymmetrical, like metallic
  // flecks in a printed supernatural cloud.
  const sparkPlaces: THREE.Vector3[] = [];
  for (let i = 0; i < 12; i++) {
    const t = 0.08 + random() * 0.84;
    const angle = t * Math.PI * 2 * 1.42 - Math.PI * 0.18;
    const ring = 0.12 + 0.43 * Math.pow(t, 0.78);
    const p = new THREE.Vector3(
      inner.x + Math.cos(angle) * ring + (random() - 0.5) * 0.1,
      inner.y +
        0.02 +
        0.24 * Math.sin(t * Math.PI * 1.12) +
        0.14 * t +
        Math.sin(angle) * ring * 0.72 +
        (random() - 0.5) * 0.13,
      inner.z + (2.78 - inner.z) * t,
    );
    sparkPlaces.push(p);

    const size = 0.025 + random() * 0.022;
    const spark = b.part(
      new THREE.OctahedronGeometry(size, 0),
      i % 3 === 0 ? gold : white,
      {
        at: p,
        bone: J.trunk3,
        scale: [1, 1.55, 0.32],
        name: `dreamswirlSpark${i}`,
        group: "dreamswirl",
      },
    );
    glow(spark, i % 3 === 0 ? 1.35 : 1.55);

    // Tiny ink cores make the stars remain legible against the pale ribbon.
    if (i % 3 === 0) {
      b.part(
        new THREE.OctahedronGeometry(size * 0.26, 0),
        ink,
        {
          at: p,
          bone: J.trunk3,
          scale: [1, 1.45, 0.4],
          name: `dreamswirlSparkCore${i}`,
          group: "dreamswirl",
        },
      );
    }
  }

  // A large crescent wisp hangs at the outer end of the spiral.
  const crescentCenter = new THREE.Vector3(0.22, 1.67, 2.76);
  const crescent = b.extrude(
    [
      [-0.13, -0.22],
      [-0.045, -0.12],
      [0.02, 0.02],
      [0.035, 0.17],
      [0.0, 0.28],
      [0.1, 0.18],
      [0.145, 0.01],
      [0.11, -0.17],
      [0.04, -0.28],
      [0.065, -0.08],
      [0.075, 0.08],
      [0.035, 0.18],
      [-0.025, 0.08],
      [-0.07, -0.08],
    ],
    {
      at: crescentCenter,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      smoothing: 1,
      color: mist,
      bone: J.trunk3,
      name: "dreamswirlCrescent",
      group: "dreamswirl",
    },
  );
  glow(crescent, 1.45);

  // Gold registration flecks around the crescent reinforce the magical seal
  // without adding scenery outside the specified dream box.
  for (let i = 0; i < 5; i++) {
    const a = -1.05 + i * 0.52;
    const p = new THREE.Vector3(
      crescentCenter.x + Math.cos(a) * 0.18,
      crescentCenter.y + Math.sin(a) * 0.22,
      crescentCenter.z + 0.018,
    );
    const fleck = b.part(
      new THREE.TetrahedronGeometry(0.018, 0),
      gold,
      {
        at: p,
        bone: J.trunk3,
        name: `dreamswirlCrescentFleck${i}`,
        group: "dreamswirl",
      },
    );
    glow(fleck, 1.3);
  }
}
    return buildDreamswirl;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "bakuSpirit" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1.05,-0.1], dir: [0,0,1], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["body"], at: [0,1.3,0.9], dir: [0,0.5,0.85], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,1.6,1.2], dir: [0,0.15,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.48,1.38], dir: [0,-0.45,1], role: "jaw" });
  J["trunk1"] = b.joint("trunk1", { parent: J["head"], at: [0,1.5,1.62], dir: [0,0.1,1], role: "tentacle" });
  J["trunk2"] = b.joint("trunk2", { parent: J["trunk1"], at: [0,1.25,1.82], dir: [0,-0.5,0.8], role: "tentacle" });
  J["trunk3"] = b.joint("trunk3", { parent: J["trunk2"], at: [0,1.1,1.95], dir: [0,-0.8,0.4], role: "tentacle" });
  J["tail1"] = b.joint("tail1", { parent: J["body"], at: [0,1.42,-1.05], dir: [0,-0.4,-0.8], role: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,1.18,-1.32], dir: [0,-0.8,-0.3], role: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,0.95,-1.52], dir: [0,-1,0], role: "tail" });
  J["hipFL"] = b.joint("hipFL", { parent: J["body"], at: [0.42,1.05,0.8], dir: [0,-0.3,0.05], role: "leg", group: "legs" });
  J["kneeFL"] = b.joint("kneeFL", { parent: J["hipFL"], at: [0.46,0.6,0.82], dir: [0,-1,0.05], role: "leg", group: "legs" });
  J["ankleFL"] = b.joint("ankleFL", { parent: J["kneeFL"], at: [0.44,0.26,0.68], dir: [0,-1,0.1], role: "leg", group: "legs" });
  J["toeFL"] = b.joint("toeFL", { parent: J["ankleFL"], at: [0.44,0.04,0.76], dir: [0,-0.3,0.8], role: "leg", group: "legs" });
  J["hipFR"] = b.joint("hipFR", { parent: J["body"], at: [-0.42,1.05,0.8], dir: [0,-0.3,0.05], role: "leg", group: "legs" });
  J["kneeFR"] = b.joint("kneeFR", { parent: J["hipFR"], at: [-0.46,0.6,0.82], dir: [0,-1,0.05], role: "leg", group: "legs" });
  J["ankleFR"] = b.joint("ankleFR", { parent: J["kneeFR"], at: [-0.44,0.26,0.68], dir: [0,-1,0.1], role: "leg", group: "legs" });
  J["toeFR"] = b.joint("toeFR", { parent: J["ankleFR"], at: [-0.44,0.04,0.76], dir: [0,-0.3,0.8], role: "leg", group: "legs" });
  J["hipBL"] = b.joint("hipBL", { parent: J["body"], at: [0.44,1.05,-0.8], dir: [0,-0.3,0.05], role: "leg", group: "legs" });
  J["kneeBL"] = b.joint("kneeBL", { parent: J["hipBL"], at: [0.48,0.58,-0.75], dir: [0,-1,0.05], role: "leg", group: "legs" });
  J["ankleBL"] = b.joint("ankleBL", { parent: J["kneeBL"], at: [0.46,0.24,-0.62], dir: [0,-1,0.1], role: "leg", group: "legs" });
  J["toeBL"] = b.joint("toeBL", { parent: J["ankleBL"], at: [0.46,0.04,-0.7], dir: [0,-0.3,0.8], role: "leg", group: "legs" });
  J["hipBR"] = b.joint("hipBR", { parent: J["body"], at: [-0.44,1.05,-0.8], dir: [0,-0.3,0.05], role: "leg", group: "legs" });
  J["kneeBR"] = b.joint("kneeBR", { parent: J["hipBR"], at: [-0.48,0.58,-0.75], dir: [0,-1,0.05], role: "leg", group: "legs" });
  J["ankleBR"] = b.joint("ankleBR", { parent: J["kneeBR"], at: [-0.46,0.24,-0.62], dir: [0,-1,0.1], role: "leg", group: "legs" });
  J["toeBR"] = b.joint("toeBR", { parent: J["ankleBR"], at: [-0.46,0.04,-0.7], dir: [0,-0.3,0.8], role: "leg", group: "legs" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
