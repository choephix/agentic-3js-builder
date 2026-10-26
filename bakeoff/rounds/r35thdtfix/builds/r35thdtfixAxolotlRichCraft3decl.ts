import * as THREE from "three";
import {
  catmull,
  countershade,
  createBuilder,
  line,
  limb,
  mottle,
  rng,
  svg,
} from "../../../../src/index";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "Chibi Axolotl",
  description: "A low-poly chibi axolotl with a soft pink body, huge glossy eyes, four little feet, and six frilly pink external gills.",
};

const COAT = cel(
  countershade(
    mottle("#e5a0b1", "#f5c6ca", { size: 0.085, contrast: 1.15, seed: 11 }),
    "#fff0e4",
    { level: -0.12, soft: 0.28 },
  ),
  "#a95479",
);

const FACE = cel("#f5c6c8", "#c36b88");
const BELLY = cel("#fff0dd", "#e6aab3");
const GILL = cel("#ff739c", "#c33e70");
const GILL_LIGHT = cel("#ffb0c2", "#e86691");
const GILL_DARK = "#a93663";
const MOUTH = "#4a203b";
const EYE_BACK = "#291d32";
const EYE_GLEAM = "#fffaf4";
const TOE = cel("#e8a1ad", "#a94f73");
const FRECKLE = "#b65b7b";
const PAW_PAD = "#bd607d";

const EYE_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 88">
    <ellipse cx="32" cy="44" rx="25" ry="35" fill="#241a2b" stroke="#160f1e" stroke-width="4"/>
    <ellipse cx="32" cy="49" rx="17" ry="27" fill="#4a2948"/>
    <ellipse cx="32" cy="58" rx="13" ry="19" fill="#1b1826"/>
    <ellipse cx="24" cy="27" rx="8" ry="12" fill="#fffdf7"/>
    <circle cx="43" cy="64" r="4" fill="#ffffff"/>
    <path d="M12 16 Q31 4 53 17" fill="none" stroke="#351a31" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const GILL_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 80">
    <path d="M16 78 C13 61 5 49 8 31 C10 19 17 9 16 2 C22 11 25 22 22 34 C19 49 26 60 16 78Z"
      fill="#ff8eaa" stroke="#c84470" stroke-width="2.3"/>
    <path d="M16 69 C14 50 14 27 17 9" fill="none" stroke="#ffd0d8" stroke-width="2"/>
    <path d="M11 47 C15 43 19 41 23 36 M10 57 C14 53 19 51 23 47"
      fill="none" stroke="#d9537d" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

type GillRecord = {
  side: number;
  index: number;
  chain: ReturnType<ReturnType<typeof createBuilder>["chain"]>;
  root: THREE.Vector3;
};

type LegRecord = {
  side: number;
  kind: "front" | "hind";
  chain: ReturnType<ReturnType<typeof createBuilder>["chain"]>;
  target: THREE.Vector3;
};

export default function build() {
  const b = createBuilder({ name: "chibi-axolotl", detail: 1 });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: one central spine, a flexible tail, four legs, six gill fans, and an independently hinged jaw.

  const hips = b.joint("hips", {
    at: [0, 0.18, -0.14],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.18, -0.33],
      [0, 0.18, -0.21],
      [0, 0.195, -0.03],
      [0, 0.215, 0.15],
      [0, 0.235, 0.25],
    ]),
    {
      parent: hips,
      count: 5,
      names: ["spine1", "spine2", "spine3", "spine4", "spine5"],
      role: "spine",
    },
  );

  const spineTip = spine.joints[spine.joints.length - 1];

  const neck = b.joint("neck", {
    parent: spineTip,
    at: spine.at(1).at,
    dir: [0, 0.04, 1],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck,
    at: neck.at,
    dir: [0, 0.02, 1],
    role: "head",
  });

  const upperJaw = b.joint("upperJaw", {
    parent: head,
    at: head.local({ forward: 0.105, down: 0.005 }),
    dir: [0, 0, 1],
    role: "hinge",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.105, down: 0.035 }),
    dir: [0, 0, 1],
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      spine.at(0).at,
      [0, 0.175, -0.43],
      [0, 0.17, -0.57],
      [0, 0.18, -0.69],
    ]),
    {
      parent: spine.joints[0],
      names: ["tailBase", "tailMid", "tailEnd", "tailTip"],
      role: "tail",
    },
  );

  const gills: GillRecord[] = [];
  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const root = new THREE.Vector3(
        side * (0.105 + i * 0.006),
        0.285 + i * 0.025,
        0.165 - i * 0.027,
      );
      const middle = new THREE.Vector3(
        side * (0.16 + i * 0.012),
        0.31 + i * 0.024,
        0.13 - i * 0.026,
      );
      const tip = new THREE.Vector3(
        side * (0.225 + i * 0.013),
        0.335 + i * 0.025,
        0.105 - i * 0.028,
      );
      const name = `gill${side > 0 ? "L" : "R"}${i + 1}`;
      const chain = b.chain(name, catmull([root, middle, tip]), {
        parent: head,
        names: [`${name}Base`, `${name}Mid`, `${name}Tip`],
        role: "fan",
      });
      gills.push({ side, index: i, chain, root });
    }
  }

  const legs: LegRecord[] = [];
  for (const side of [1, -1]) {
    for (const kind of ["front", "hind"] as const) {
      const front = kind === "front";
      const root = new THREE.Vector3(
        side * (front ? 0.085 : 0.09),
        0.145,
        front ? 0.105 : -0.145,
      );
      const target = new THREE.Vector3(
        side * (front ? 0.17 : 0.18),
        0.032,
        front ? 0.145 : -0.205,
      );
      const points = limb(
        root,
        target,
        front ? [0.082, 0.085] : [0.09, 0.09],
        [0, 0, 1],
      );
      const suffix = `${front ? "F" : "H"}${side > 0 ? "L" : "R"}`;
      const chain = b.chain(`leg${suffix}`, points, {
        parent: spine.jointAt(front ? 0.74 : 0.24),
        names: [`hip${suffix}`, `ankle${suffix}`, `foot${suffix}`],
        role: "leg",
        contact: target,
      });
      legs.push({ side, kind, chain, target });
    }
  }

  const toes: Array<{
    chain: ReturnType<ReturnType<typeof createBuilder>["chain"]>;
    end: THREE.Vector3;
    side: number;
    index: number;
  }> = [];

  for (const leg of legs) {
    const foot = leg.chain.tip ?? leg.chain.joints[leg.chain.joints.length - 1];
    for (let i = 0; i < 3; i++) {
      const fan = i - 1;
      const end = new THREE.Vector3(
        leg.side * (leg.target.x * leg.side + fan * 0.025),
        0.026,
        leg.target.z + 0.038 + Math.abs(fan) * 0.008,
      );
      const suffix = `${leg.kind === "front" ? "F" : "H"}${leg.side > 0 ? "L" : "R"}${i + 1}`;
      const toe = b.chain(
        `toe${suffix}`,
        [leg.target, end],
        {
          parent: foot,
          names: [`toe${suffix}`, `toe${suffix}Tip`],
          role: "digit",
        },
      );
      toes.push({ chain: toe, end, side: leg.side, index: i });
    }
  }

  // A small relaxed open-mouth pose makes the two jaw pieces read separately.
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });

  // ---------------------------------------------------------------------------------------------------------------
  // Main body and tail.

  const body = b.sweep(
    spine,
    (t) => 0.105 + 0.012 * Math.sin(t * Math.PI) - 0.018 * t,
    {
      color: COAT,
      sectors: [[122, 238, BELLY]],
      sides: 8,
      smooth: false,
      caps: "round",
      name: "soft-ribbed-body",
      group: "body",
    },
  );

  const tailTube = b.sweep(
    tail,
    (t) => 0.075 * (1 - t) + 0.018,
    {
      color: COAT,
      sectors: [[120, 240, BELLY]],
      sides: 7,
      smooth: false,
      caps: { start: "round", end: "point" },
      name: "tapered-tail",
      group: "tail",
    },
  );

  const tailTopEdge = catmull([
    [0, 0.205, -0.31],
    [0, 0.30, -0.44],
    [0, 0.275, -0.58],
    [0, 0.21, -0.70],
  ]);

  const tailBottomEdge = catmull([
    [0, 0.155, -0.31],
    [0, 0.075, -0.45],
    [0, 0.09, -0.59],
    [0, 0.16, -0.70],
  ]);

  b.membrane(tail, tailTopEdge, {
    color: FACE,
    thickness: 0.008,
    rows: 5,
    cols: 12,
    scallop: 0.1,
    name: "upper-tail-fin",
    group: "tail",
  });

  b.membrane(tail, tailBottomEdge, {
    color: FACE,
    thickness: 0.008,
    rows: 5,
    cols: 12,
    scallop: 0.1,
    name: "lower-tail-fin",
    group: "tail",
  });

  // A tiny dorsal ridge gives the silhouette a more amphibian, aquatic profile.
  const ridge = catmull([
    [0, 0.265, -0.22],
    [0, 0.29, -0.34],
    [0, 0.285, -0.47],
  ]);
  b.sweep(ridge, [0.016, 0.006], {
    color: FACE,
    caps: { start: "round", end: "point" },
    name: "dorsal-ridge",
    group: "body",
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Head, muzzle, and articulated mouth.

  const skull = b.part(
    new THREE.SphereGeometry(1, 14, 10),
    FACE,
    {
      bone: head,
      at: head.local({ forward: 0.035, up: 0.015 }),
      scale: [0.135, 0.135, 0.12],
      flat: true,
      name: "large-rounded-skull",
      group: "head",
    },
  );

  const upperMuzzle = b.part(
    new THREE.SphereGeometry(1, 12, 8),
    BELLY,
    {
      bone: upperJaw,
      at: upperJaw.local({ forward: 0.065, down: 0.012 }),
      scale: [0.092, 0.112, 0.06],
      flat: true,
      name: "upper-muzzle",
      group: "face",
    },
  );

  const lowerMuzzle = b.sweep(
    catmull([
      jaw.at,
      jaw.local({ forward: 0.055, down: 0.005 }),
      jaw.local({ forward: 0.11, down: 0.008 }),
    ]),
    [0.037, 0.018],
    {
      bone: jaw,
      color: FACE,
      caps: "round",
      sides: 7,
      name: "lower-jaw",
      group: "face",
    },
  );

  const mouthUpper = b.rod(
    head.local({ left: 0.062, down: 0.022, forward: 0.172 }),
    head.local({ right: 0.062, down: 0.022, forward: 0.172 }),
    0.006,
    MOUTH,
    {
      bone: upperJaw,
      section: { ngon: 6 },
      name: "upper-mouth-line",
      group: "face",
    },
  );

  b.rod(
    jaw.local({ left: 0.046, down: 0.002, forward: 0.103 }),
    jaw.local({ right: 0.046, down: 0.002, forward: 0.103 }),
    0.0045,
    MOUTH,
    {
      bone: jaw,
      section: { ngon: 6 },
      name: "lower-mouth-line",
      group: "face",
    },
  );

  b.part(
    new THREE.SphereGeometry(0.022, 8, 6),
    GILL_DARK,
    {
      bone: upperJaw,
      at: upperJaw.local({ forward: 0.16, down: 0.006 }),
      scale: [1.2, 0.8, 0.72],
      flat: true,
      name: "button-nose",
      group: "face",
    },
  );

  for (const side of [1, -1]) {
    b.part(
      new THREE.SphereGeometry(0.008, 7, 5),
      MOUTH,
      {
        bone: upperJaw,
        at: upperJaw.local({ left: side * 0.036, down: 0.006, forward: 0.171 }),
        flat: true,
        name: `nostril${side > 0 ? "L" : "R"}`,
        group: "face",
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Huge glossy eyes and cheek marks.

  const skullSurface = b.surface(skull);
  for (const side of [1, -1]) {
    const eyeHit = skullSurface.around(head.at).at(side * 38, 9);
    if (eyeHit) {
      b.stick(
        new THREE.SphereGeometry(0.031, 9, 6),
        EYE_BACK,
        eyeHit,
        {
          embed: 0.45,
          name: `eye-bulb-${side > 0 ? "L" : "R"}`,
          group: "face",
        },
      );

      b.decal(skull, EYE_TEXTURE, {
        at: eyeHit,
        size: [0.052, 0.068],
        lift: 0.003,
        segments: 8,
        mirror: side > 0,
        name: `glossy-eye-${side > 0 ? "L" : "R"}`,
        group: "face",
      });
    }
  }

  const cheekSurface = b.surface([skull, upperMuzzle]);
  const cheekHits = cheekSurface.scatter(12, {
    rng: rng(18),
    minDist: 0.026,
    filter: (hit) => hit.n.z > 0.35 && hit.at.y < 0.29,
  });
  for (let i = 0; i < cheekHits.length; i++) {
    b.stick(
      new THREE.SphereGeometry(0.006 + (i % 3) * 0.0015, 6, 4),
      i % 2 ? FRECKLE : GILL_LIGHT,
      cheekHits[i],
      {
        embed: 0.55,
        name: `cheek-speck-${i}`,
        group: "face",
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Four chunky legs, rounded feet, and three toes per foot.

  for (const leg of legs) {
    const legName = `${leg.kind}-${leg.side > 0 ? "L" : "R"}`;
    b.sweep(
      leg.chain,
      [0.028, 0.021],
      {
        color: COAT,
        sides: 7,
        smooth: false,
        caps: "round",
        name: `${legName}-leg`,
        group: "limbs",
      },
    );

    const foot = leg.chain.tip ?? leg.chain.joints[leg.chain.joints.length - 1];
    b.part(
      new THREE.SphereGeometry(0.024, 8, 5),
      TOE,
      {
        bone: foot,
        at: leg.target,
        scale: [1.15, 0.72, 1.3],
        flat: true,
        name: `${legName}-paw`,
        group: "limbs",
      },
    );

    b.part(
      new THREE.SphereGeometry(0.011, 7, 5),
      PAW_PAD,
      {
        bone: foot,
        at: new THREE.Vector3(leg.target.x, 0.022, leg.target.z + 0.014),
        scale: [1.2, 0.35, 1.35],
        flat: true,
        name: `${legName}-pad`,
        group: "limbs",
      },
    );
  }

  for (const toe of toes) {
    const tip = toe.chain.tip ?? toe.chain.joints[toe.chain.joints.length - 1];
    b.sweep(
      toe.chain,
      [0.008, 0.003],
      {
        color: TOE,
        sides: 6,
        smooth: false,
        caps: { start: "round", end: "point" },
        name: `toe-${toe.side > 0 ? "L" : "R"}-${toe.index}`,
        group: "digits",
      },
    );

    b.part(
      new THREE.SphereGeometry(0.0065, 6, 4),
      PAW_PAD,
      {
        bone: tip,
        at: toe.end,
        scale: [1.15, 0.65, 1.4],
        flat: true,
        name: `toe-pad-${toe.side > 0 ? "L" : "R"}-${toe.index}`,
        group: "digits",
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // The signature six external gills: stalks, comb-like branchlets, collars, and translucent-looking cards.

  for (let gi = 0; gi < gills.length; gi++) {
    const gill = gills[gi];
    const stemColor = gill.index === 1 ? GILL_LIGHT : GILL;

    b.sweep(
      gill.chain,
      [0.018, 0.009],
      {
        color: stemColor,
        sides: 7,
        smooth: false,
        caps: { start: "round", end: "point" },
        name: `gill-stalk-${gi}`,
        group: "gills",
      },
    );

    b.along(gill.chain, 6, (at) => {
      const root = at.at;
      const p = new THREE.SphereGeometry(0.010, 6, 4);
      b.stick(p, GILL_DARK, at, {
        embed: 0.52,
        scale: [1, 0.75, 1],
        name: `gill-node-${gi}`,
        group: "gills",
      });

      const localIndex = Math.round(at.t * 5);
      const vertical = (localIndex - 2.5) * 0.16;
      const branchDirection: [number, number, number] = [
        gill.side * 0.82,
        vertical,
        -0.13,
      ];

      b.spike(
        root,
        branchDirection,
        0.052 + (localIndex % 2) * 0.009,
        0.0052,
        {
          color: localIndex % 2 ? GILL_LIGHT : GILL,
          section: { ngon: 6 },
          caps: "point",
          name: `gill-frill-${gi}-${localIndex}`,
          group: "gills",
        },
      );

      if (localIndex === 1 || localIndex === 4) {
        b.spike(
          root,
          [
            gill.side * 0.68,
            vertical * -0.9,
            0.12,
          ],
          0.038,
          0.004,
          {
            color: GILL_LIGHT,
            section: { ngon: 6 },
            caps: "point",
            name: `gill-secondary-frill-${gi}-${localIndex}`,
            group: "gills",
          },
        );
      }
    });

    const collar = b.ring(
      line(gill.chain.at(0).at, gill.chain.at(0.22).at),
      {
        count: 5,
        radius: 0.020,
        fromDeg: 0,
        toDeg: 360,
        name: `gill-collar-${gi}`,
        role: "fan",
        group: "gills",
      },
      (item) => {
        b.part(
          new THREE.SphereGeometry(0.0045, 6, 4),
          GILL_DARK,
          {
            at: item,
            scale: [1, 0.7, 1],
            flat: true,
            name: `gill-collar-bead-${gi}-${item.i}`,
            group: "gills",
          },
        );
      },
    );
    void collar;

    const cards = b.along(gill.chain, 5, () => {});
    b.cards(cards, GILL_TEXTURE, {
      size: [0.038, 0.072],
      lean: 22,
      bend: 18,
      vary: 0.22,
      spin: 12,
      flow: (_frame, i) => [
        gill.side * (0.58 + i * 0.025),
        0.28 + (i % 2) * 0.2,
        -0.15,
      ],
      color: "#ffffff",
      rng: rng(70 + gi),
      sink: 0.16,
      name: `gill-frill-cards-${gi}`,
      group: "gills",
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Soft spots on the back and a few simple decorative skin details.

  const bodySurface = b.surface([body, tailTube]);
  const bodySpots = bodySurface.scatter(18, {
    rng: rng(52),
    minDist: 0.045,
    filter: (hit) => hit.n.y > -0.15 && hit.at.y > 0.16,
  });

  for (let i = 0; i < bodySpots.length; i++) {
    b.stick(
      new THREE.SphereGeometry(0.006 + (i % 4) * 0.0015, 6, 4),
      i % 3 === 0 ? GILL_DARK : FRECKLE,
      bodySpots[i],
      {
        embed: 0.6,
        scale: [1.25, 0.5, 1.05],
        flat: true,
        name: `body-speck-${i}`,
        group: "skin-detail",
      },
    );
  }

  // A small pale belly patch reinforces the chibi silhouette without making a separate floating object.
  const bellyPatch = catmull([
    [0, 0.105, -0.06],
    [0, 0.10, 0.07],
    [0, 0.125, 0.18],
  ]);
  b.sweep(bellyPatch, [0.055, 0.045], {
    color: BELLY,
    section: "box",
    caps: "round",
    name: "belly-patch",
    group: "body",
  });

  // A few short whisker-like sensory rods at the cheeks, rooted on the head bone.
  for (const side of [1, -1]) {
    for (let i = 0; i < 2; i++) {
      const start = head.local({
        left: side * (0.088 + i * 0.012),
        down: 0.01 + i * 0.017,
        forward: 0.105,
      });
      const end = new THREE.Vector3(
        start.x + side * (0.035 + i * 0.012),
        start.y - 0.008 + i * 0.004,
        start.z + 0.012,
      );
      b.spike(start, end, null, 0.003, {
        color: GILL_DARK,
        bone: head,
        caps: "point",
        name: `cheek-whisker-${side > 0 ? "L" : "R"}-${i}`,
        group: "face",
      });
    }
  }

  return b.root;
}
