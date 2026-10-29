import * as THREE from "three";
import { createBuilder, type Builder, type Joint, catmull, frame, rng, bezier, b as _unused, polyline } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Ashen Hydra of the Nine Realms",
  "description": "A five-headed hydra coiled on the ground in the God of War style: ash-green serpent scales, a bone dorsal crest, ember-lit runes and gold-bound heads."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  scaleDark: "#22302a",
  scaleMid: "#3c5244",
  scaleLight: "#5f7a5e",
  belly: "#c9c2a0",
  bellyShade: "#9a9070",
  bone: "#d9cfb2",
  claw: "#4a4038",
  gold: "#c9a34a",
  goldBright: "#e8cf7a",
  ember: "#ff7a2a",
  emberCore: "#ffd24a",
  ink: "#141a15",
  moss: "#62843f",
  tongue: "#8a2f3a",
  membrane: "#5a4636",
};
const M = {
  neckRootC: [0, 1.35, 0.2] as [number, number, number],
  neckRootML: [0.7, 1.25, -0.1] as [number, number, number],
  neckRootMR: [-0.7, 1.25, -0.1] as [number, number, number],
  neckRootOL: [1.05, 1.15, -0.5] as [number, number, number],
  neckRootOR: [-1.05, 1.15, -0.5] as [number, number, number],
  shoulderSocketL: [1, 0.9, 0.9] as [number, number, number],
  shoulderSocketR: [-1, 0.9, 0.9] as [number, number, number],
  pawPadL: [1.5, 0, 1.5] as [number, number, number],
  pawPadR: [-1.5, 0, 1.5] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // trunk
  (() => {
function buildTrunk({ b, J, P, M }: Ctx) {
  const DARK = P.scaleDark;
  const MID = P.scaleMid;
  const LIGHT = P.scaleLight;
  const BELLY = P.belly;
  const BELLY_SHADE = P.bellyShade;
  const BONE = P.bone;
  const GOLD = P.gold;
  const GOLD_BRIGHT = P.goldBright;
  const EMBER = P.ember;
  const EMBER_CORE = P.emberCore;
  const INK = P.ink;
  const MOSS = P.moss;

  const core = J.core;
  const tail1 = J.tail1;
  const tail2 = J.tail2;
  const tail3 = J.tail3;
  const tail4 = J.tail4;
  const tail5 = J.tail5;

  const bodyPath = catmull([
    [0, 0.82, 1.55],
    [0, 0.92, 0.75],
    [0, 0.86, 0.2],
    [0, 0.79, -0.75],
    [0, 0.72, -1.3],
    [0.25, 0.59, -2.2],
    [-0.35, 0.43, -2.85],
    [-1.05, 0.31, -2.55],
    [-1.55, 0.27, -1.5],
  ]);

  const body = b.sweep(bodyPath, (t) => {
    if (t < 0.2) return 0.78 + t * 0.55;
    if (t < 0.43) return 0.89 - (t - 0.2) * 0.25;
    if (t < 0.58) return 0.83 - (t - 0.43) * 1.9;
    if (t < 0.78) return 0.545 - (t - 0.58) * 1.15;
    return 0.315 - (t - 0.78) * 1.15;
  }, {
    bone: [core, tail1, tail2, tail3, tail4, tail5],
    color: MID,
    sides: 10,
    caps: "round",
    sectors: [
      [112, 248, BELLY],
      [-58, 58, LIGHT],
    ],
    section: "circle",
    name: "trunkBody",
    group: "trunk",
  });

  const bodySurface = b.surface(body);

  // Broad shoulder armour plates, deliberately overlapping the root of the five necks.
  const shoulder = b.part(
    new THREE.SphereGeometry(1, 12, 8),
    DARK,
    {
      at: [0, 0.94, 0.34],
      scale: [0.94, 0.78, 0.92],
      bone: core,
      flat: true,
      name: "trunkShoulderHump",
      group: "trunk",
    },
  );

  for (const s of [1, -1]) {
    b.part(
      new THREE.BoxGeometry(0.34, 0.42, 0.58),
      MID,
      {
        at: [s * 0.55, 1.02, 0.56],
        bone: core,
        rotation: [0, s * 11, s * 8],
        flat: true,
        name: `shoulderScale${s > 0 ? "L" : "R"}`,
        group: "trunk",
      },
    );
  }

  // Moss-colored facets on the upper shoulder and rump.
  const mossPts = [
    [0.22, 1.69, 0.26],
    [-0.22, 1.68, 0.31],
    [0.48, 1.55, -0.16],
    [-0.48, 1.54, -0.16],
    [0.08, 1.46, -1.05],
    [-0.18, 1.39, -1.42],
    [0.28, 1.29, -1.92],
  ];
  for (let i = 0; i < mossPts.length; i++) {
    b.part(
      new THREE.ConeGeometry(0.09 + (i % 3) * 0.018, 0.035, 6),
      MOSS,
      {
        at: mossPts[i],
        dir: [0, 1, 0],
        axis: "y",
        bone: core,
        flat: true,
        name: `mossScale${i}`,
        group: "trunk",
      },
    );
  }

  // Dorsal crest: alternating broad plates, then smaller swept spikes toward the tail.
  const crestTs = [0.04, 0.115, 0.19, 0.265, 0.34, 0.415, 0.49, 0.565, 0.64, 0.715, 0.79, 0.865, 0.94];
  crestTs.forEach((t, i) => {
    const p = body.at(t);
    const tangent = bodyPath.tangentAt(t).normalize();
    const h = 0.31 * (1 - t) + 0.055;
    const w = 0.22 * (1 - t) + 0.055;
    const side = new THREE.Vector3(1, 0, 0);
    const fore = tangent.clone().normalize();
    const back = fore.clone().multiplyScalar(-1);
    const base = p.at.clone().add(new THREE.Vector3(0, body.radius ? 0 : 0, 0));
    const tip = base.clone().add(new THREE.Vector3(0, h, 0)).add(back.multiplyScalar(0.075 + t * 0.08));

    const left = base.clone().add(side.clone().multiplyScalar(w));
    const right = base.clone().add(side.clone().multiplyScalar(-w));

    b.slab([left, right, tip], {
      color: BONE,
      thickness: Math.max(0.012, 0.028 * (1 - t)),
      bone: p.bone ?? core,
      name: `dorsalPlate${i}`,
      group: "crest",
    });

    if (i % 3 === 0) {
      b.part(
        new THREE.SphereGeometry(0.035 * (1 - t * 0.45), 7, 5),
        GOLD_BRIGHT,
        {
          at: tip,
          bone: p.bone ?? core,
          flat: true,
          name: `crestStud${i}`,
          group: "goldTrim",
        },
      );
    }
  });

  // Belly scutes, following the centreline and facing downward/frontward.
  const scuteTs = [0.08, 0.18, 0.29, 0.4, 0.5, 0.59, 0.68, 0.77, 0.86];
  scuteTs.forEach((t, i) => {
    const p = body.at(t, 180, -0.012);
    const r = typeof p.radius === "number" ? p.radius : 0.5;
    const width = Math.max(0.16, r * 0.72);
    const length = Math.max(0.12, 0.2 - t * 0.08);

    b.part(
      new THREE.CylinderGeometry(width, width * 0.72, length, 6),
      BELLY,
      {
        at: p.at.clone().add(new THREE.Vector3(0, -0.035, 0.01)),
        dir: [0, 0, 1],
        axis: "y",
        rotation: [Math.PI / 2, 0, 0],
        scale: [1, 0.22, 0.72],
        bone: p.bone ?? core,
        flat: true,
        name: `bellyScute${i}`,
        group: "belly",
      },
    );

    b.part(
      new THREE.TorusGeometry(width * 0.7, 0.014, 5, 8, Math.PI),
      BELLY_SHADE,
      {
        at: p.at.clone().add(new THREE.Vector3(0, -0.055, -0.025)),
        dir: [0, 1, 0],
        axis: "y",
        rotation: [Math.PI / 2, 0, 0],
        bone: p.bone ?? core,
        flat: true,
        name: `scuteRim${i}`,
        group: "belly",
      },
    );
  });

  // Ember rune plates on both visible flanks.
  const runeTs = [0.19, 0.27, 0.35, 0.43, 0.51, 0.59, 0.67];
  runeTs.forEach((t, i) => {
    const side = i % 2 === 0 ? 1 : -1;
    const hit = body.at(t, side * 78, 0.012);
    const rune = b.part(
      new THREE.BoxGeometry(0.17, 0.26, 0.018),
      EMBER,
      {
        at: hit.at,
        dir: hit.n,
        axis: "z",
        rotation: [0, 0, (side * (i % 3 - 1) * 12 * Math.PI) / 180],
        bone: hit.bone ?? core,
        flat: true,
        name: `emberRune${i}`,
        group: "runes",
      },
    );
    glow(rune, 1.4);

    b.part(
      new THREE.SphereGeometry(0.026, 7, 5),
      EMBER_CORE,
      {
        at: hit.at.clone().addScaledVector(hit.n, 0.025),
        bone: hit.bone ?? core,
        flat: true,
        name: `runeCore${i}`,
        group: "runes",
      },
    );

    b.part(
      new THREE.BoxGeometry(0.018, 0.16, 0.021),
      EMBER_CORE,
      {
        at: hit.at.clone().addScaledVector(hit.n, 0.027),
        dir: hit.n,
        axis: "z",
        bone: hit.bone ?? core,
        flat: true,
        name: `runeStroke${i}`,
        group: "runes",
      },
    );
  });

  // Gold neck-root collar, shared visually with the other builder's necks.
  const collar = bodySurface.loop([0, 1.25, 0.35], { dir: [0, 1, 0], lift: 0.018 });
  b.sweep(collar, 0.026, {
    color: GOLD,
    bone: core,
    sides: 8,
    caps: "none",
    name: "humpGoldCollar",
    group: "goldTrim",
  });
  b.along(collar, 12, (at) =>
    b.part(new THREE.SphereGeometry(0.033, 6, 4), GOLD_BRIGHT, {
      at,
      bone: core,
      flat: true,
      name: "collarRivet",
      group: "goldTrim",
    }),
  );

  // Tail tip crown and paired barbs.
  const tailTip = body.at(0.99);
  for (const s of [1, -1]) {
    const base = tailTip.at.clone().add(new THREE.Vector3(s * 0.035, 0.015, 0));
    const tip = base.clone().add(new THREE.Vector3(s * 0.22, 0.02, -0.2));
    b.spike(base, tip, null, 0.045, {
      color: BONE,
      bone: tail5,
      caps: "point",
      name: `tailBarb${s > 0 ? "L" : "R"}`,
      group: "tail",
    });
    b.part(
      new THREE.TorusGeometry(0.052, 0.012, 5, 8),
      GOLD,
      {
        at: base,
        dir: tip.clone().sub(base),
        bone: tail5,
        flat: true,
        name: `tailBarbRing${s > 0 ? "L" : "R"}`,
        group: "goldTrim",
      },
    );
  }

  // Cracked-scale studs and dark seam marks around the rump.
  const seamPts = [
    [0.39, 1.18, -1.04],
    [-0.44, 1.12, -1.18],
    [0.52, 0.92, -1.34],
    [-0.51, 0.87, -1.48],
    [0.28, 1.02, -1.7],
    [-0.3, 0.96, -1.86],
  ];
  seamPts.forEach((p, i) => {
    const s = p[0] > 0 ? 1 : -1;
    const hit = bodySurface.nearest(p);
    b.part(
      new THREE.CylinderGeometry(0.012, 0.018, 0.09, 5),
      INK,
      {
        at: hit.at.clone().addScaledVector(hit.n, 0.018),
        dir: hit.n,
        axis: "y",
        rotation: [0, 0, s * 0.7],
        bone: hit.bone ?? tail1,
        flat: true,
        name: `rumpCrack${i}`,
        group: "wear",
      },
    );
    b.part(
      new THREE.SphereGeometry(0.025, 6, 4),
      LIGHT,
      {
        at: hit.at.clone().addScaledVector(hit.n, 0.028),
        bone: hit.bone ?? tail1,
        flat: true,
        name: `rumpScaleStud${i}`,
        group: "wear",
      },
    );
  });

  // A few raised scale ridges make the S-coil read clearly at a distance.
  const ridgeTs = [0.13, 0.22, 0.31, 0.72, 0.79, 0.86];
  ridgeTs.forEach((t, i) => {
    const at = body.at(t, 0, 0.035);
    b.spike(at, [0, 1, 0], 0.12 - t * 0.045, 0.035, {
      color: LIGHT,
      bone: at.bone ?? core,
      name: `backScaleRidge${i}`,
      group: "scales",
    });
  });

  return body;
}
    return buildTrunk;
  })(),
  // limbs
  (() => {
function buildLimbs({ b, J, P, M }: Ctx) {
  const hide = P.scaleMid ?? "#3c5244";
  const hideDark = P.scaleDark ?? "#22302a";
  const hideLight = P.scaleLight ?? "#5f7a5e";
  const belly = P.belly ?? "#c9c2a0";
  const bone = P.bone ?? "#d9cfb2";
  const claw = P.claw ?? "#4a4038";
  const gold = P.gold ?? "#c9a34a";
  const bright = P.goldBright ?? "#e8cf7a";
  const ember = P.ember ?? "#ff7a2a";
  const emberCore = P.emberCore ?? "#ffd24a";
  const ink = P.ink ?? "#141a15";

  const box = (
    size: [number, number, number],
    color: string,
    at: THREE.Vector3 | [number, number, number],
    boneRef: any,
    name: string,
    scale?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone: boneRef,
      name,
      scale,
      flat: true,
    });

  const sphere = (r: number, color: string, at: any, boneRef: any, name: string) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, {
      at,
      bone: boneRef,
      name,
      flat: true,
    });

  const rod = (a: any, c: any, radius: number, color: string, name: string) =>
    b.rod(a, c, radius, { color, name, section: { ngon: 8 }, caps: "round" });

  const side = (s: 1 | -1) => {
    const sideName = s > 0 ? "L" : "R";
    const shoulder = J[`shoulder${sideName}`];
    const elbow = J[`elbow${sideName}`];
    const foot = J[`foot${sideName}`];

    // Heavy upper arm, with a dark underside and a pale inner seam.
    const upper = b.sweep(
      bezier(
        shoulder.at,
        [s * 1.08, 0.73, 0.98],
        [s * 1.28, 0.57, 1.08],
        elbow.at,
      ),
      (t: number) => 0.30 - t * 0.055,
      {
        color: hide,
        bone: shoulder,
        section: { ngon: 8 },
        caps: "round",
        name: `limbsUpperArm${sideName}`,
        sectors: [
          [115, 245, belly],
          [-35, 35, hideLight],
        ],
      },
    );

    // A second, smaller muscle ridge makes the arm read as plated rather than a plain tube.
    rod(
      shoulder.local({ right: 0, down: 0.02, forward: 0.02 }),
      elbow.local({ right: 0, down: 0, forward: 0.02 }),
      0.115,
      hideDark,
      `limbsArmRidge${sideName}`,
    );

    // Hard forearm and a pale lower-facing plane.
    const fore = rod(elbow, foot, 0.205, hideDark, `limbsForearm${sideName}`);
    b.sweep(
      [elbow.at, foot.at],
      (t: number) => 0.18 - t * 0.025,
      {
        color: belly,
        bone: elbow,
        section: { ngon: 5 },
        caps: "flat",
        shift: [0, -0.12],
        name: `limbsForearmBelly${sideName}`,
      },
    );

    // Elbow boss and gold bracer made from a ring of chunky studs.
    sphere(0.285, hideLight, elbow.local({ down: 0.015 }), elbow, `limbsElbowBoss${sideName}`);
    const bracer = b.ring(elbow, {
      count: 10,
      radius: 0.235,
      fromDeg: 0,
      toDeg: 360,
      name: `limbsBracer${sideName}`,
      group: "limbBracers",
      role: "fan",
    });
    bracer.items.forEach((item: any, i: number) => {
      sphere(0.032, gold, item, elbow, `limbsBracerStud${sideName}${i}`);
    });
    rod(
      elbow.local({ down: 0.015 }),
      foot.local({ down: 0.015 }),
      0.018,
      gold,
      `limbsBracerBand${sideName}`,
    );

    // Leather strap and bright buckle on the upper arm.
    const strap = b.ring(
      frame(elbow.local({ back: 0.14, down: 0.02 }), elbow.dir([0, 1, 0])),
      {
        count: 12,
        radius: 0.225,
        fromDeg: 0,
        toDeg: 360,
        name: `limbsStrap${sideName}`,
        group: "limbStraps",
      },
    );
    strap.items.forEach((item: any, i: number) => {
      if (i % 2 === 0) sphere(0.018, ink, item, elbow, `limbsLeather${sideName}${i}`);
    });
    box(
      [0.105, 0.075, 0.025],
      bright,
      shoulder.local({ right: s * 0.25, down: 0.24, forward: 0.23 }),
      shoulder,
      `limbsBuckle${sideName}`,
    );

    // Broad paw block: its lower face is exactly at y = 0.03, with toes below it only by their small radius.
    box(
      [0.52, 0.30, 0.48],
      hide,
      foot.local({ down: 0.02, forward: 0.025 }),
      foot,
      `limbsPaw${sideName}`,
      [1, 1, 1],
    );
    box(
      [0.38, 0.055, 0.31],
      belly,
      foot.local({ down: 0.17, forward: 0.08 }),
      foot,
      `limbsPawPad${sideName}`,
    );
    sphere(0.075, hideLight, foot.local({ up: 0.12, forward: 0.12 }), foot, `limbsKnuckle${sideName}`);

    const toes = [
      [`toeF`, 1.30, 1.78],
      [`toeM`, 1.55, 1.87],
      [`toeR`, 1.78, 1.62],
    ] as const;

    for (const [label, x0, z0] of toes) {
      const toe = J[`${label === "toeF" ? "toeF" : label === "toeM" ? "toeM" : "toeR"}${sideName}`];
      const toeStart = foot.local({
        right: s * (x0 - 1.5),
        down: 0.11,
        forward: z0 - 1.45,
      });

      rod(toeStart, toe.at, 0.075, bone, `limbsToeBase${sideName}${label}`);
      rod(toe.at, [toe.at.x, 0.075, toe.at.z + 0.16], 0.065, hideDark, `limbsToe${sideName}${label}`);

      const clawPath = bezier(
        [toe.at.x, 0.075, toe.at.z + 0.08],
        [toe.at.x, 0.045, toe.at.z + 0.20],
        [toe.at.x, 0.025, toe.at.z + 0.30],
        [toe.at.x, 0.018, toe.at.z + 0.39],
      );
      b.sweep(clawPath, [0.045, 0.006], {
        color: claw,
        bone: toe,
        caps: { start: "round", end: "point" },
        section: { ngon: 6 },
        name: `limbsClaw${sideName}${label}`,
      });
      sphere(0.082, bone, toe.at, toe, `limbsToeRing${sideName}${label}`);
    }

    // Ember rune plate on each shoulder, backed by a dark mount.
    const shoulderAt = shoulder.local({ right: s * 0.12, up: 0.02, forward: 0.20 });
    box([0.22, 0.28, 0.035], ink, shoulderAt, shoulder, `limbsRuneBack${sideName}`);
    const rune = box(
      [0.135, 0.19, 0.012],
      ember,
      shoulder.local({ right: s * 0.12, up: 0.02, forward: 0.225 }),
      shoulder,
      `limbsRune${sideName}`,
    );
    glow(rune, 1.4);
    const runeDot = sphere(
      0.032,
      emberCore,
      shoulder.local({ right: s * 0.12, up: 0.06, forward: 0.244 }),
      shoulder,
      `limbsRuneCore${sideName}`,
    );
    glow(runeDot, 1.8);

    // Small mossy studs on the upward shoulder armour.
    for (let i = 0; i < 3; i++) {
      sphere(
        0.035,
        P.moss ?? "#62843f",
        shoulder.local({ right: s * (-0.18 + i * 0.18), up: 0.27, forward: 0.05 }),
        shoulder,
        `limbsMoss${sideName}${i}`,
      );
    }
  };

  side(1);
  side(-1);
}
    return buildLimbs;
  })(),
  // sideNecks
  (() => {
function buildSideNecks({ b, J, P, M }: Ctx) {
  const hide = P.scaleMid ?? "#3c5244";
  const hideDark = P.scaleDark ?? "#22302a";
  const hideLight = P.scaleLight ?? "#5f7a5e";
  const belly = P.belly ?? "#c9c2a0";
  const bone = P.bone ?? "#d9cfb2";
  const gold = P.gold ?? "#c9a34a";
  const goldBright = P.goldBright ?? "#e8cf7a";
  const ember = P.ember ?? "#ff7a2a";
  const emberCore = P.emberCore ?? "#ffd24a";
  const ink = P.ink ?? "#141a15";
  const tongue = P.tongue ?? "#8a2f3a";
  const membrane = P.membrane ?? "#5a4636";

  const low = (g: THREE.BufferGeometry) => {
    g.computeVertexNormals();
    return g;
  };

  const sphere = (at: THREE.Vector3 | [number, number, number], r: number, color: string, boneName: any, scale?: [number, number, number]) =>
    b.part(
      low(new THREE.SphereGeometry(r, 10, 7)),
      color,
      { at, bone: boneName, scale, flat: true },
    );

  const box = (
    at: THREE.Vector3 | [number, number, number],
    size: [number, number, number],
    color: string,
    boneName: any,
    dir: [number, number, number] = [0, 1, 0],
  ) =>
    b.part(
      low(new THREE.BoxGeometry(size[0], size[1], size[2])),
      color,
      { at, bone: boneName, dir, flat: true },
    );

  const rod = (a: any, c: any, r: number, color: string, boneName?: any) =>
    b.rod(a, c, r, { color, bone: boneName, section: { ngon: 7 }, caps: "round" });

  const ring = (center: any, radius: number, width: number, color: string, boneName: any) => {
    const p = [
      [center[0] + radius, center[1], center[2]],
      [center[0] + radius * 0.7, center[1], center[2] + radius * 0.7],
      [center[0], center[1], center[2] + radius],
      [center[0] - radius * 0.7, center[1], center[2] + radius * 0.7],
      [center[0] - radius, center[1], center[2]],
      [center[0] - radius * 0.7, center[1], center[2] - radius * 0.7],
      [center[0], center[1], center[2] - radius],
      [center[0] + radius * 0.7, center[1], center[2] - radius * 0.7],
    ];
    b.sweep(p, width, {
      color,
      bone: boneName,
      caps: "round",
      section: { ngon: 6 },
    });
  };

  const eye = (head: any, s: number, y: number, x: number, z: number) => {
    const socket = sphere(head.local([x, y, z]), 0.065, ink, head);
    const orb = sphere(head.local([x, y + 0.004, z + 0.018]), 0.043, ember, head);
    glow(orb, 1.6);
    sphere(head.local([x + s * 0.012, y + 0.02, z + 0.047]), 0.014, emberCore, head);
    return socket;
  };

  const neck = (
    key: string,
    names: string[],
    outer: boolean,
    side: number,
  ) => {
    const joints = names.map((n) => J[n]);
    const points = joints.map((j: any) => j.at);
    const path = catmull(points);
    const tube = b.sweep(path, (t: number) => 0.27 - t * 0.11, {
      color: hide,
      bone: joints,
      caps: "round",
      sides: 8,
      name: `${key}_neck`,
      group: "sideNecks",
    });

    // Pale throat scutes, concentrated near the buried root.
    for (let i = 0; i < 5; i++) {
      const t = 0.05 + i * 0.075;
      const at = tube.at(t, 180, 0.006);
      b.part(
        low(new THREE.ConeGeometry(0.085 - i * 0.009, 0.07, 6)),
        belly,
        {
          frame: at,
          bone: at.bone,
          scale: [1.0, 0.55, 0.75],
          flat: true,
          name: `${key}_throatScute${i}`,
          group: "sideNecks",
        },
      );
    }

    // Dark dorsal mane: broad, backward-leaning bone quills.
    for (let i = 0; i < 8; i++) {
      const t = 0.06 + i * 0.115;
      const at = tube.at(t, 0, 0.012);
      const length = 0.18 - t * 0.07;
      b.spike(
        at,
        at.dir([0, -0.32, -1]),
        length,
        0.035 - t * 0.012,
        {
          color: bone,
          bone: at.bone,
          caps: "point",
          name: `${key}_mane${i}`,
          group: "sideNecks",
        },
      );
      if (i === 1 || i === 5) {
        sphere(at.moved([0, 0.028, 0]), 0.027, goldBright, at.bone);
      }
    }

    const head = J[`head${key}`];
    const jaw = J[`jaw${key}`];

    // Long, wedge-like serpent skull and snout.
    sphere(head.at, 0.28, hideDark, head, [1.18, 0.82, 1.18]);
    box(
      head.local([0, 0.01, 0.23]),
      [0.30, 0.22, 0.40],
      hide,
      head,
      [0, 0.25, 1],
    );
    box(
      head.local([0, 0.10, 0.16]),
      [0.38, 0.09, 0.22],
      hideLight,
      head,
      [0, 0.35, 1],
    );

    // Heavy brow shelves.
    for (const s of [-1, 1]) {
      box(
        head.local([s * 0.145, 0.12, 0.13]),
        [0.19, 0.075, 0.19],
        bone,
        head,
        [0, 0.25, 1],
      );
      eye(head, s, 0.105, s * 0.145, 0.17);
    }

    // Gold brow binding and central diamond.
    rod(
      head.local([-0.23, 0.18, 0.08]),
      head.local([0.23, 0.18, 0.08]),
      0.018,
      gold,
      head,
    );
    b.part(
      low(new THREE.OctahedronGeometry(0.045, 0)),
      goldBright,
      { at: head.local([0, 0.20, 0.10]), bone: head, flat: true, name: `${key}_browGem` },
    );

    // Nostrils, inset as dark raised slits.
    for (const s of [-1, 1]) {
      sphere(head.local([s * 0.085, 0.075, 0.40]), 0.027, ink, head);
      sphere(head.local([s * 0.085, 0.082, 0.423]), 0.011, ember, head);
    }

    // Upper horns, swept backward, with gold root rings.
    for (const s of [-1, 1]) {
      const root = head.local([s * 0.19, 0.16, -0.02]);
      const mid = head.local([s * 0.34, 0.30, -0.20]);
      const tip = head.local([s * 0.48, 0.48, -0.38]);
      const horn = b.sweep([root, mid, tip], [0.065, 0.012], {
        color: bone,
        bone: head,
        caps: { start: "round", end: "point" },
        sides: 7,
        name: `${key}_horn${s}`,
        group: "sideNecks",
      });
      ring(root, 0.07, 0.018, gold, head);
      sphere(horn.at(0.65), 0.018, goldBright, head);
    }

    // Short lower hornlets.
    for (const s of [-1, 1]) {
      const root = head.local([s * 0.22, 0.02, 0.04]);
      const tip = head.local([s * 0.34, 0.15, -0.10]);
      b.spike(root, tip, null, 0.045, {
        color: bone,
        bone: head,
        caps: "point",
        name: `${key}_lowerHorn${s}`,
      });
    }

    // Open lower jaw, deliberately separate on the jaw bone.
    box(
      jaw.local([0, -0.01, 0.17]),
      [0.32, 0.12, 0.43],
      hideDark,
      jaw,
      [0, -0.22, 1],
    );
    box(
      jaw.local([0, 0.035, 0.19]),
      [0.25, 0.025, 0.30],
      ink,
      jaw,
      [0, 0.0, 1],
    );
    box(
      jaw.local([0, 0.065, 0.31]),
      [0.19, 0.018, 0.22],
      tongue,
      jaw,
      [0, 0.03, 1],
    );

    // Forked tongue.
    rod(jaw.local([0, 0.075, 0.28]), jaw.local([0, 0.08, 0.55]), 0.012, tongue, jaw);
    rod(jaw.local([0, 0.08, 0.53]), jaw.local([0.07, 0.09, 0.63]), 0.008, tongue, jaw);
    rod(jaw.local([0, 0.08, 0.53]), jaw.local([-0.07, 0.09, 0.63]), 0.008, tongue, jaw);

    // Three prominent fangs.
    for (const s of [-1, 1]) {
      b.spike(
        head.local([s * 0.13, -0.02, 0.30]),
        [0, -1, 0.05],
        0.17,
        0.035,
        { color: bone, bone: head, name: `${key}_upperFang${s}` },
      );
    }
    b.spike(
      jaw.local([0, 0.09, 0.32]),
      [0, 1, 0.05],
      0.12,
      0.026,
      { color: bone, bone: jaw, name: `${key}_lowerFang` },
    );

    // A few gold cheek studs.
    for (const s of [-1, 1]) {
      sphere(head.local([s * 0.22, -0.02, 0.17]), 0.025, gold, head);
      sphere(head.local([s * 0.25, -0.04, 0.11]), 0.016, goldBright, head);
    }

    // Outer heads carry a compact leather-coloured frill.
    if (outer) {
      const back = head.local([0, 0.05, -0.16]);
      const crest = head.local([0, 0.38, -0.35]);
      b.membrane(
        [head.local([-0.03, 0.05, -0.15]), head.local([-0.03, 0.36, -0.31])],
        [head.local([0.03, 0.05, -0.15]), head.local([0.03, 0.36, -0.31])],
        {
          color: membrane,
          thickness: 0.018,
          rows: 3,
          cols: 5,
          bone: head,
          name: `${key}_frill`,
          group: "sideNecks",
        },
      );
      rod(back, crest, 0.018, bone, head);
    }

    // A bright gold collar at the throat transition.
    const base = joints[0].at;
    ring(base, 0.245, 0.025, gold, joints[0]);
    ring(base, 0.215, 0.011, goldBright, joints[0]);
  };

  neck("ML", ["nML1", "nML2", "nML3", "nML4"], false, 1);
  neck("MR", ["nMR1", "nMR2", "nMR3", "nMR4"], false, -1);
  neck("OL", ["nOL1", "nOL2", "nOL3", "nOL4"], true, 1);
  neck("OR", ["nOR1", "nOR2", "nOR3", "nOR4"], true, -1);
}
    return buildSideNecks;
  })(),
  // neckMain
  (() => {
function buildNeckMain({ b, J, P, M }: Ctx) {
  const DARK = P.scaleDark;
  const MID = P.scaleMid;
  const LIGHT = P.scaleLight;
  const BONE = P.bone;
  const BELLY = P.belly;
  const GOLD = P.gold;
  const GOLD_BRIGHT = P.goldBright;
  const EMBER = P.ember;
  const CORE = P.emberCore;
  const INK = P.ink;
  const TONGUE = P.tongue;
  const MEMBRANE = P.membrane;
  const random = rng(9147);

  const n1 = J.nC1;
  const n2 = J.nC2;
  const n3 = J.nC3;
  const n4 = J.nC4;
  const head = J.headC;
  const jaw = J.jawC;

  const neckPath = catmull([
    n1.at,
    n2.at,
    n3.at,
    n4.at,
    head.at,
  ]);

  const neck = b.sweep(neckPath, (t: number) => {
    if (t < 0.18) return 0.31;
    if (t < 0.48) return 0.285;
    if (t < 0.76) return 0.235;
    return 0.17;
  }, {
    bone: [n1, n2, n3, n4, head],
    color: MID,
    section: { ngon: 8 },
    caps: "round",
    name: "neckMain.hide",
    group: "neckMain",
  });

  const throat = b.sweep(neckPath, (t: number) => {
    if (t < 0.28) return 0.305;
    return 0.18;
  }, {
    bone: [n1, n2, n3, n4, head],
    color: BELLY,
    sectors: [[112, 248, BELLY]],
    section: { ngon: 8 },
    caps: "none",
    name: "neckMain.throat",
    group: "neckMain",
  });

  // Angular throat scales and a dark scale transition under the mane.
  for (let i = 0; i < 11; i++) {
    const t = 0.04 + i * 0.085;
    const p = neck.at(t);
    const side = i % 2 === 0 ? -1 : 1;
    const scute = new THREE.ConeGeometry(
      Math.max(0.055, 0.105 - t * 0.035),
      Math.max(0.075, 0.16 - t * 0.04),
      5,
    );
    b.part(scute, i < 5 ? P.bellyShade : BELLY, {
      bone: p.bone,
      at: p.at.clone().add(new THREE.Vector3(0, -0.015, 0.018)),
      dir: p.normal,
      name: `neckMain.throatScute${i}`,
      group: "throatScutes",
    });
    if (i < 8) {
      b.part(new THREE.BoxGeometry(0.025, 0.05, 0.07), DARK, {
        bone: p.bone,
        at: p.at.clone().add(new THREE.Vector3(side * 0.16, 0.015, 0.025)),
        dir: p.normal,
        name: `neckMain.scaleSeam${i}`,
      });
    }
  }

  // Tall overlapping dorsal mane, widening heavily at the root.
  for (let i = 0; i < 13; i++) {
    const t = i / 14;
    const p = neck.at(Math.min(0.96, 0.06 + t * 0.88));
    const h = 0.34 - t * 0.19;
    const w = 0.20 - t * 0.075;
    const blade = b.extrude(
      [
        [0, 0],
        [w * 0.45, h * 0.18],
        [w, h * 0.78],
        [w * 0.34, h],
        [-w * 0.42, h * 0.56],
        [-w, h * 0.18],
      ],
      {
        at: p.at.clone().add(new THREE.Vector3(0, 0.015, 0.03)),
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: [0.045, 0.012],
        bevel: 0.008,
        smoothing: 0,
        bone: p.bone,
        color: i < 4 ? DARK : i < 9 ? MID : BONE,
        name: `neckMain.mane${i}`,
        group: "mane",
      },
    );
    if (i === 2 || i === 7 || i === 11) {
      b.part(new THREE.SphereGeometry(0.035, 8, 5), GOLD_BRIGHT, {
        bone: p.bone,
        at: blade.at.clone().add(new THREE.Vector3(0, h * 0.72, 0.03)),
        name: `neckMain.maneStud${i}`,
      });
    }
  }

  // Gold collar and ember studs at the neck root.
  const collar = b.part(
    new THREE.TorusGeometry(0.325, 0.026, 6, 18),
    GOLD,
    {
      bone: n1,
      at: n1.at,
      rotation: [Math.PI / 2, 0, 0],
      name: "neckMain.goldCollar",
      group: "goldTrim",
    },
  );
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const stud = b.part(new THREE.SphereGeometry(0.035, 7, 5), i % 2 ? CORE : EMBER, {
      bone: n1,
      at: new THREE.Vector3(Math.cos(a) * 0.345, n1.at.y, n1.at.z + Math.sin(a) * 0.345),
      name: `neckMain.collarStud${i}`,
      group: "emberTrim",
    });
    if (i % 2 === 0) glow(stud, 1.2);
  }

  // Skull: broad, predatory, with a long wedge-like snout.
  const skull = b.part(
    new THREE.SphereGeometry(1, 12, 8),
    MID,
    {
      bone: head,
      at: [0, 3.48, 2.34],
      scale: [0.40, 0. thirty, 0.49] as any,
      name: "neckMain.skull",
      group: "head",
    },
  );

  b.part(new THREE.BoxGeometry(0.62, 0.18, 0.42), DARK, {
    bone: head,
    at: [0, 3.57, 2.69],
    rotation: [0.08, 0, 0],
    name: "neckMain.browMass",
  });
  b.part(new THREE.BoxGeometry(0.72, 0.075, 0.20), LIGHT, {
    bone: head,
    at: [0, 3.48, 2.68],
    name: "neckMain.cheekPlate",
  });

  // Open lower jaw and mouth cavity.
  b.part(new THREE.BoxGeometry(0.48, 0.18, 0.46), INK, {
    bone: jaw,
    at: [0, 3.21, 2.61],
    rotation: [-0.18, 0, 0],
    name: "neckMain.mouthInterior",
  });
  b.part(new THREE.BoxGeometry(0.54, 0.13, 0.42), BELLY, {
    bone: jaw,
    at: [0, 3.16, 2.67],
    rotation: [-0.18, 0, 0],
    name: "neckMain.lowerJaw",
  });
  b.part(new THREE.BoxGeometry(0.42, 0.035, 0.22), TONGUE, {
    bone: jaw,
    at: [0, 3.22, 2.82],
    rotation: [-0.14, 0, 0],
    name: "neckMain.tongue",
  });

  // Eyes, sockets, brows, and hot central highlights.
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.105, 10, 7), INK, {
      bone: head,
      at: [s * 0.245, 3.57, 2.67],
      name: `neckMain.eyeSocket${s}`,
    });
    const eye = b.part(new THREE.SphereGeometry(0.072, 10, 7), EMBER, {
      bone: head,
      at: [s * 0.245, 3.57, 2.715],
      name: `neckMain.eye${s}`,
    });
    glow(eye, 1.8);
    const glint = b.part(new THREE.SphereGeometry(0.025, 7, 5), CORE, {
      bone: head,
      at: [s * 0.22, 3.60, 2.77],
      name: `neckMain.eyeGlint${s}`,
    });
    glow(glint, 2.2);
    b.part(new THREE.BoxGeometry(0.28, 0.07, 0.13), DARK, {
      bone: head,
      at: [s * 0.22, 3.68, 2.66],
      rotation: [0, s * 0.15, s * 0.08],
      name: `neckMain.brow${s}`,
    });
  }

  // Gold brow circlet with a raised diamond.
  b.part(new THREE.TorusGeometry(0.34, 0.022, 6, 18, Math.PI * 0.72), GOLD, {
    bone: head,
    at: [0, 3.67, 2.62],
    rotation: [Math.PI / 2, 0, Math.PI],
    name: "neckMain.browCirclet",
  });
  b.part(new THREE.OctahedronGeometry(0.06, 0), GOLD_BRIGHT, {
    bone: head,
    at: [0, 3.72, 2.70],
    rotation: [Math.PI / 4, 0, 0],
    name: "neckMain.circletDiamond",
  });

  // Nostril slits.
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.06, 0.018, 0.025), INK, {
      bone: head,
      at: [s * 0.115, 3.47, 2.82],
      rotation: [0, s * 0.25, 0],
      name: `neckMain.nostril${s}`,
    });
  }

  // Upper and lower fangs.
  for (const s of [-1, 1]) {
    b.spike([s * 0.18, 3.42, 2.76], [0, -1, 0.12], 0.19, 0.035, {
      bone: head,
      color: BONE,
      name: `neckMain.upperFang${s}`,
    });
    b.spike([s * 0.14, 3.24, 2.80], [0, 1, 0.08], 0.14, 0.027, {
      bone: jaw,
      color: BONE,
      name: `neckMain.lowerFang${s}`,
    });
  }

  // Four swept horns with gold root rings.
  for (const s of [-1, 1]) {
    const upper = bezier(
      [s * 0.27, 3.66, 2.43],
      [s * 0.52, 3.91, 2.28],
      [s * 0.72, 3.88, 1.96],
      [s * 0.86, 3.68, 1.72],
    );
    b.sweep(upper, [0.075, 0.012], {
      bone: head,
      color: BONE,
      caps: { start: "round", end: "point" },
      name: `neckMain.upperHorn${s}`,
    });
    const lower = bezier(
      [s * 0.31, 3.42, 2.48],
      [s * 0.48, 3.36, 2.30],
      [s * 0.54, 3.20, 2.10],
      [s * 0.60, 3.03, 1.96],
    );
    b.sweep(lower, [0.052, 0.008], {
      bone: head,
      color: BONE,
      caps: { start: "round", end: "point" },
      name: `neckMain.lowerHorn${s}`,
    });
    b.part(new THREE.TorusGeometry(0.082, 0.018, 5, 10), GOLD, {
      bone: head,
      at: [s * 0.30, 3.65, 2.43],
      rotation: [Math.PI / 2, 0, 0],
      name: `neckMain.hornRing${s}`,
    });
  }

  // Tall back crest, webbed between bone spars.
  const crestA = polyline([
    [0, 3.43, 2.05],
    [0, 3.86, 1.70],
    [0, 4.05, 1.30],
  ]);
  const crestB = polyline([
    [0, 3.32, 1.94],
    [0, 3.65, 1.60],
    [0, 3.75, 1.30],
  ]);
  b.membrane(crestA, crestB, {
    bone: head,
    color: MEMBRANE,
    thickness: 0.018,
    rows: 3,
    cols: 5,
    name: "neckMain.backCrest",
  });
  b.sweep(crestA, [0.035, 0.008], {
    bone: head,
    color: BONE,
    caps: { start: "round", end: "point" },
    name: "neckMain.crestSpar",
  });
  b.sweep(crestB, [0.025, 0.006], {
    bone: head,
    color: BONE,
    caps: { start: "round", end: "point" },
    name: "neckMain.crestSparInner",
  });

  // Ember rune plates on the neck flanks.
  for (let i = 0; i < 5; i++) {
    const t = 0.18 + i * 0.15;
    const p = neck.at(t, i % 2 ? 65 : -65, 0.012);
    const rune = b.extrude(
      [
        [-0.075, -0.10],
        [0.075, -0.10],
        [0.045, 0.10],
        [0, 0.14],
        [-0.045, 0.10],
      ],
      {
        at: p.at,
        x: p.tangent,
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.003,
        bone: p.bone,
        color: EMBER,
        name: `neckMain.rune${i}`,
        group: "runes",
      },
    );
    glow(rune, 1.4);
    const dot = b.part(new THREE.SphereGeometry(0.018, 6, 4), CORE, {
      bone: p.bone,
      at: p.at.clone().addScaledVector(p.n, 0.025),
      name: `neckMain.runeCore${i}`,
    });
    glow(dot, 1.7);
  }

  // Gold cheek rivets and a few scar-like scale studs.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.SphereGeometry(0.025, 7, 5), i === 1 ? GOLD_BRIGHT : GOLD, {
        bone: head,
        at: [s * (0.33 + i * 0.045), 3.38 - i * 0.035, 2.70],
        name: `neckMain.cheekRivet${s}_${i}`,
      });
    }
  }

  return b.root;
}
    return buildNeckMain;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "ashenHydra" });
  const J: Record<string, Joint> = {};
  J["core"] = b.joint("core", { at: [0,0.9,0.2], dir: [0,0.1,1], role: "spine" });
  J["tail1"] = b.joint("tail1", { parent: J["core"], at: [0,0.72,-1.3], dir: [0,-0.1,-1], role: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0.25,0.58,-2.2], dir: [0.4,-0.15,-0.9], role: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [-0.35,0.42,-2.85], dir: [-0.8,-0.2,-0.4], role: "tail" });
  J["tail4"] = b.joint("tail4", { parent: J["tail3"], at: [-1.15,0.3,-2.5], dir: [-0.9,0,0.4], role: "tail" });
  J["tail5"] = b.joint("tail5", { parent: J["tail4"], at: [-1.55,0.26,-1.5], dir: [-0.3,0,1], role: "tail" });
  J["shoulderL"] = b.joint("shoulderL", { parent: J["core"], at: [1,0.9,0.9], dir: [0.2,-1,0.2], role: "leg" });
  J["elbowL"] = b.joint("elbowL", { parent: J["shoulderL"], at: [1.45,0.5,1.15], dir: [0.1,-1,0.3], role: "leg" });
  J["footL"] = b.joint("footL", { parent: J["elbowL"], at: [1.5,0.18,1.45], dir: [0.1,-0.6,0.8], role: "leg" });
  J["toeLF"] = b.joint("toeLF", { parent: J["footL"], at: [1.3,0.06,1.8], dir: [0,0,1], role: "digit", group: "clawsL" });
  J["toeLM"] = b.joint("toeLM", { parent: J["footL"], at: [1.55,0.06,1.85], dir: [0,0,1], role: "digit", group: "clawsL" });
  J["toeLR"] = b.joint("toeLR", { parent: J["footL"], at: [1.75,0.06,1.6], dir: [0,0,1], role: "digit", group: "clawsL" });
  J["shoulderR"] = b.joint("shoulderR", { parent: J["core"], at: [-1,0.9,0.9], dir: [-0.2,-1,0.2], role: "leg" });
  J["elbowR"] = b.joint("elbowR", { parent: J["shoulderR"], at: [-1.45,0.5,1.15], dir: [-0.1,-1,0.3], role: "leg" });
  J["footR"] = b.joint("footR", { parent: J["elbowR"], at: [-1.5,0.18,1.45], dir: [-0.1,-0.6,0.8], role: "leg" });
  J["toeRF"] = b.joint("toeRF", { parent: J["footR"], at: [-1.3,0.06,1.8], dir: [0,0,1], role: "digit", group: "clawsR" });
  J["toeRM"] = b.joint("toeRM", { parent: J["footR"], at: [-1.55,0.06,1.85], dir: [0,0,1], role: "digit", group: "clawsR" });
  J["toeRR"] = b.joint("toeRR", { parent: J["footR"], at: [-1.75,0.06,1.6], dir: [0,0,1], role: "digit", group: "clawsR" });
  J["nC1"] = b.joint("nC1", { parent: J["core"], at: [0,1.35,0.2], dir: [0,1,0.55], role: "neck", group: "neckMain" });
  J["nC2"] = b.joint("nC2", { parent: J["nC1"], at: [0,2.05,0.8], dir: [0,1,0.4], role: "neck", group: "neckMain" });
  J["nC3"] = b.joint("nC3", { parent: J["nC2"], at: [0,2.7,1.25], dir: [0,0.75,0.7], role: "neck", group: "neckMain" });
  J["nC4"] = b.joint("nC4", { parent: J["nC3"], at: [0,3.25,1.75], dir: [0,0.5,0.9], role: "neck", group: "neckMain" });
  J["headC"] = b.joint("headC", { parent: J["nC4"], at: [0,3.5,2.25], dir: [0,0.35,1], role: "head", group: "neckMain" });
  J["jawC"] = b.joint("jawC", { parent: J["headC"], at: [0,3.38,2.5], dir: [0,0.2,1], role: "jaw", group: "neckMain" });
  J["nML1"] = b.joint("nML1", { parent: J["core"], at: [0.7,1.25,-0.1], dir: [0.35,1,0.55], role: "neck", group: "neckMid" });
  J["nML2"] = b.joint("nML2", { parent: J["nML1"], at: [1.15,2,0.45], dir: [0.4,0.9,0.5], role: "neck", group: "neckMid" });
  J["nML3"] = b.joint("nML3", { parent: J["nML2"], at: [1.5,2.6,0.95], dir: [0.35,0.6,0.75], role: "neck", group: "neckMid" });
  J["nML4"] = b.joint("nML4", { parent: J["nML3"], at: [1.7,2.9,1.45], dir: [0.25,0.4,0.9], role: "neck", group: "neckMid" });
  J["headML"] = b.joint("headML", { parent: J["nML4"], at: [1.8,3.05,1.9], dir: [0.2,0.3,1], role: "head", group: "neckMid" });
  J["jawML"] = b.joint("jawML", { parent: J["headML"], at: [1.8,2.95,2.15], dir: [0.2,0.15,1], role: "jaw", group: "neckMid" });
  J["nMR1"] = b.joint("nMR1", { parent: J["core"], at: [-0.7,1.25,-0.1], dir: [-0.35,1,0.55], role: "neck", group: "neckMid" });
  J["nMR2"] = b.joint("nMR2", { parent: J["nMR1"], at: [-1.15,2,0.45], dir: [-0.4,0.9,0.5], role: "neck", group: "neckMid" });
  J["nMR3"] = b.joint("nMR3", { parent: J["nMR2"], at: [-1.5,2.6,0.95], dir: [-0.35,0.6,0.75], role: "neck", group: "neckMid" });
  J["nMR4"] = b.joint("nMR4", { parent: J["nMR3"], at: [-1.7,2.9,1.45], dir: [-0.25,0.4,0.9], role: "neck", group: "neckMid" });
  J["headMR"] = b.joint("headMR", { parent: J["nMR4"], at: [-1.8,3.05,1.9], dir: [-0.2,0.3,1], role: "head", group: "neckMid" });
  J["jawMR"] = b.joint("jawMR", { parent: J["headMR"], at: [-1.8,2.95,2.15], dir: [-0.2,0.15,1], role: "jaw", group: "neckMid" });
  J["nOL1"] = b.joint("nOL1", { parent: J["core"], at: [1.05,1.15,-0.5], dir: [0.55,0.9,0.5], role: "neck", group: "neckOuter" });
  J["nOL2"] = b.joint("nOL2", { parent: J["nOL1"], at: [1.75,1.8,0.05], dir: [0.55,0.8,0.5], role: "neck", group: "neckOuter" });
  J["nOL3"] = b.joint("nOL3", { parent: J["nOL2"], at: [2.1,2.3,0.6], dir: [0.45,0.55,0.75], role: "neck", group: "neckOuter" });
  J["nOL4"] = b.joint("nOL4", { parent: J["nOL3"], at: [2.25,2.6,1.2], dir: [0.3,0.35,0.95], role: "neck", group: "neckOuter" });
  J["headOL"] = b.joint("headOL", { parent: J["nOL4"], at: [2.3,2.75,1.65], dir: [0.25,0.3,1], role: "head", group: "neckOuter" });
  J["jawOL"] = b.joint("jawOL", { parent: J["headOL"], at: [2.3,2.62,1.9], dir: [0.25,0.15,1], role: "jaw", group: "neckOuter" });
  J["nOR1"] = b.joint("nOR1", { parent: J["core"], at: [-1.05,1.15,-0.5], dir: [-0.55,0.9,0.5], role: "neck", group: "neckOuter" });
  J["nOR2"] = b.joint("nOR2", { parent: J["nOR1"], at: [-1.75,1.8,0.05], dir: [-0.55,0.8,0.5], role: "neck", group: "neckOuter" });
  J["nOR3"] = b.joint("nOR3", { parent: J["nOR2"], at: [-2.1,2.3,0.6], dir: [-0.45,0.55,0.75], role: "neck", group: "neckOuter" });
  J["nOR4"] = b.joint("nOR4", { parent: J["nOR3"], at: [-2.25,2.6,1.2], dir: [-0.3,0.35,0.95], role: "neck", group: "neckOuter" });
  J["headOR"] = b.joint("headOR", { parent: J["nOR4"], at: [-2.3,2.75,1.65], dir: [-0.25,0.3,1], role: "head", group: "neckOuter" });
  J["jawOR"] = b.joint("jawOR", { parent: J["headOR"], at: [-2.3,2.62,1.9], dir: [-0.25,0.15,1], role: "jaw", group: "neckOuter" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
