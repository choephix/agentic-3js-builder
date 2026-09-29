// Red fox (Vulpes vulpes). A slender, agile canid with a vivid russet coat,
// deep chest and tucked loin, prominent white bib and underbelly, long digitigrade legs
// with black socks and four-toed paws, a grand bushy brush tail with a snow-white tag,
// and a sharp triangular head with large black-backed upright ears, amber eyes, and an open lower jaw.
import { BoxGeometry, CylinderGeometry, SphereGeometry, TorusGeometry } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { aim, offset, rng } from "../src/math";
import type { V3 } from "../src/math";
import { catmull } from "../src/path";
import type { Chain } from "../src/skeleton";

export const meta = {
  name: "Red Fox",
  description: "A vivid russet red fox with a white bib, black socks, amber eyes, and a bushy white-tipped brush tail.",
  builtBy: "Gemini 3.8 Flash",
};

// Color palette
const RED_FOX = "#d4531d"; // Vibrant russet orange primary coat
const RED_BACK = "#a8370e"; // Deeper warm auburn on spine and dorsal ridge
const WHITE = "#fbf9f4"; // Clean white for bib, cheeks, belly, and tail tag
const BLACK = "#1c1715"; // Deep black for socks, ear backs, nose leather, and lips
const DARK_EAR = "#231c19"; // Ear back shading
const EAR_PINK = "#e3aba0"; // Inner ear skin
const AMBER_EYE = "#e59b1a"; // Bright golden-amber iris
const PUPIL = "#110e0d"; // Slit pupil and eyeliner
const EYE_SHINE = "#ffffff"; // Specular eye highlight
const NOSE = "#181413"; // Rhinarium
const TONGUE = "#d96f78"; // Mouth interior and tongue
const TOOTH = "#f7f3e8"; // Sharp canines
const PAW_PAD = "#26201d"; // Foot pads
const CLAW = "#141110"; // Claws
const VIOLET_GLAND = "#3d2218"; // Dark spot at tail base

/** Overall scale factor for the head region. */
const HEAD_SCALE = 1.0;

export default function build() {
  const b = createBuilder({ name: "redFox" });
  const random = rng(42);

  // ---------------------------------------------------------------------------
  // One continuous profile runs from the tail tip through the rump, hips, spine, and neck to the base of the skull.
  // The tail and body share this curve, so the transition is one smooth skinned surface rather than overlapping caps.
  const stations = [
    { at: [0, 0.25, -0.9], w: 0.05, h: 0.06 }, // Tail tip
    { at: [0, 0.24, -0.8], w: 0.07, h: 0.08 },
    { at: [0, 0.27, -0.7], w: 0.09, h: 0.1 },
    { at: [0, 0.32, -0.58], w: 0.11, h: 0.12 },
    { at: [0, 0.37, -0.46], w: 0.12, h: 0.14 },
    { at: [0, 0.39, -0.34], w: 0.13, h: 0.15 }, // Rump / tail root
    { at: [0, 0.41, -0.24], w: 0.18, h: 0.19 }, // Hips / Pelvis
    { at: [0, 0.41, -0.06], w: 0.16, h: 0.17 }, // Tucked loin / waist
    { at: [0, 0.42, 0.11], w: 0.19, h: 0.23 }, // Deep ribcage / chest
    { at: [0, 0.44, 0.23], w: 0.17, h: 0.22 }, // Withers / shoulder base
    { at: [0, 0.51, 0.34], w: 0.13, h: 0.16 }, // Mid-neck rising forward
    { at: [0, 0.58, 0.43], w: 0.11, h: 0.13 }, // Throat / base of skull
  ] as const;

  const curve = catmull(stations.map((s) => s.at));
  const tailBaseIndex = 5;
  const tailBaseT = curve.knots[tailBaseIndex];
  const root = b.joint("hips", { at: stations[tailBaseIndex + 1].at });
  const hipsT = curve.knots[tailBaseIndex + 1];

  const spine = b.chain("spine", curve.slice(hipsT, 1), {
    parent: root,
    names: ["spine1", "spine2", "chest", "neck1", "neck2"],
    role: "spine",
    group: "body",
  });
  const tail = b.chain("tail", curve.slice(hipsT, 0), {
    parent: root,
    count: 6,
    role: "tail",
    group: "tail",
  });

  // Chest hangs slightly below the spine, loin tucked up
  const bellySag = (t: number) => {
    // Dip down around chest (t ~ 0.5 - 0.7), tucked at waist (t ~ 0.2 - 0.4)
    const chestDip = Math.exp(-(((t - 0.55) / 0.18) ** 2)) * 0.035;
    const loinTuck = Math.exp(-(((t - 0.3) / 0.12) ** 2)) * -0.015;
    return -chestDip + loinTuck;
  };

  const body = b.loft(stations, {
    from: tailBaseT,
    to: 1,
    bone: [tail, root, spine],
    color: RED_FOX,
    sectors: [
      [-65, 65, RED_BACK],
      [125, 235, WHITE],
    ],
    shift: (t) => [0, bellySag(t)],
    sides: 16,
    caps: { start: "none", end: "round" },
    group: "body",
  });

  // Dark guard hair flecks along the spine
  const bodySkin = b.surface(body);
  for (const hit of bodySkin.scatter(18, {
    rng: random,
    minDist: 0.05,
    filter: (h) => h.n.y > 0.4 && h.at.z < 0.25 && h.at.z > -0.28,
  })) {
    b.stick(new CylinderGeometry(0.003, 0.003, 0.004, 6), RED_BACK, hit, {
      embed: 0.5,
      scale: [1, 1, 2.2],
      flow: [0, 0, -1],
      group: "body",
    });
  }

  // White bib on the chest: layered fluffy fur tufts hanging down the throat and breast
  const chestJoint = spine.joints[2];

  // Chest / throat bib plates
  for (const [yOff, zOff, width, len, thick, jointIndex] of [
    [0.4, 0.24, 0.13, 0.13, 0.018, 2], // chest
    [0.46, 0.3, 0.11, 0.12, 0.016, 3], // neck1
    [0.52, 0.36, 0.09, 0.1, 0.014, 4], // neck2
  ]) {
    b.part(
      new CylinderGeometry((width as number) * 0.4, (width as number) * 0.5, len as number, b.segments(12)),
      WHITE,
      {
        bone: spine.joints[jointIndex as number],
        at: [0, yOff as number, zOff as number],
        dir: [0, -0.4, 0.9],
        scale: [1, 1, (thick as number) / ((width as number) * 0.5)],
        group: "body",
      },
    );
  }

  // Fur spikes along the chest bib giving pointed winter coat fluff
  for (let i = 0; i < 7; i++) {
    const angle = (i - 3) * 0.22;
    const bx = Math.sin(angle) * 0.055;
    const by = 0.35 + Math.cos(angle) * 0.05;
    const bz = 0.22;
    b.spike([bx, by, bz], [bx * 0.8, -0.08, 0.06], 0.065, 0.012, {
      bone: chestJoint,
      color: WHITE,
      sides: 4,
      group: "body",
    });
  }

  // ---------------------------------------------------------------------------
  // Digitigrade Legs with Black Socks and Paws resting on y = 0
  // ---------------------------------------------------------------------------
  const toeR = 0.018;
  const legs: { chain: Chain; front: boolean; s: number }[] = [];

  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    // Front leg: shoulder -> elbow -> wrist -> paw ball -> paw tip
    // Shoulder high at chest, elbow tucked back, slim wrist, paw flat on floor
    const frontChain = b.chain(
      `legF${side}`,
      [
        [s * 0.085, 0.39, 0.19], // Shoulder
        [s * 0.088, 0.24, 0.14], // Elbow
        [s * 0.088, 0.085, 0.165], // Wrist (carpus)
        [s * 0.088, toeR, 0.2], // Metacarpal ball
        [s * 0.088, toeR, 0.26], // Paw tip
      ],
      {
        parent: chestJoint,
        names: ["shoulder", "elbow", "wrist", "paw"].map((n) => n + side),
        role: "leg",
        contact: [s * 0.088, 0, 0.23],
        group: `legF${side}`,
      },
    );

    // Hind leg: hip -> knee -> hock -> foot ball -> toe tip
    // Femur angles forward to knee, shank back to high hock, metatarsal down
    const hindChain = b.chain(
      `legH${side}`,
      [
        [s * 0.09, 0.4, -0.23], // Hip
        [s * 0.1, 0.25, -0.13], // Knee
        [s * 0.095, 0.13, -0.24], // Hock (calcaneus)
        [s * 0.095, toeR, -0.19], // Metatarsal ball
        [s * 0.095, toeR, -0.13], // Paw tip
      ],
      {
        parent: root,
        names: ["hip", "knee", "hock", "foot"].map((n) => n + side),
        role: "leg",
        contact: [s * 0.095, 0, -0.16],
        group: `legH${side}`,
      },
    );

    legs.push({ chain: frontChain, front: true, s });
    legs.push({ chain: hindChain, front: false, s });
  }

  // Sweep leg limbs with black socks
  for (const { chain, front, s } of legs) {
    const [, t1, t2, t3] = chain.ts;

    // Muscular thigh/shoulder tapering to slender cannon
    const keys: [number, number, number][] = front
      ? [
          [0, 0.038, 0.048],
          [t1, 0.026, 0.032],
          [t2, 0.019, 0.022],
          [t3, toeR, toeR],
        ]
      : [
          [0, 0.052, 0.068], // Broad upper thigh
          [t1, 0.032, 0.042], // Knee
          [t2, 0.02, 0.024], // Hock
          [t3, toeR, toeR],
        ];

    const legRadius = (t: number): [number, number] => {
      const i = Math.min(keys.findIndex((k) => k[0] > t) - 1, 2);
      const [ta, xa, ya] = keys[i < 0 ? 2 : i];
      const [tb, xb, yb] = keys[i < 0 ? 3 : i + 1];
      const k = Math.min(Math.max((t - ta) / (tb - ta), 0), 1);
      const e = k * k * (3 - 2 * k);
      return [xa + (xb - xa) * e, ya + (yb - ya) * e];
    };

    // Upper leg in red fur, transitioning to black socks from mid-limb down
    // Front: black starts around elbow (t1); Hind: black starts near hock (t2)
    const sockT = front ? t1 * 0.85 : t1 + (t2 - t1) * 0.6;

    // Red upper portion
    b.sweep(chain, legRadius, {
      to: sockT,
      color: RED_FOX,
      sides: 14,
      caps: { start: "round", end: "none" },
      group: chain.name,
    });

    // Black sock lower portion
    b.sweep(chain, legRadius, {
      from: sockT,
      to: t3,
      color: BLACK,
      sides: 14,
      caps: { start: "none", end: "flat" },
      group: chain.name,
    });

    // Paw pad and toes on the foot joint, resting flat on y = 0
    const pawJoint = chain.joints[3];
    const heelPt = chain.at(t3).at;
    const tipPt = chain.at(1).at;
    const pawH = toeR;

    // Central main paw cushion
    b.sweep(
      [
        [heelPt.x, pawH, heelPt.z],
        [tipPt.x, pawH, tipPt.z],
      ],
      () => [0.024, pawH],
      {
        bone: pawJoint,
        color: BLACK,
        sides: 12,
        group: chain.name,
      },
    );

    // 4 round toe beads in front with tiny dark claws
    const toeDz = front ? 0.016 : 0.016;
    const toeXs = [-0.016, -0.006, 0.006, 0.016];
    for (const dx of toeXs) {
      const toeCenter: V3 = [tipPt.x + dx * s, pawH * 0.85, tipPt.z + (Math.abs(dx) > 0.01 ? -0.006 : toeDz)];
      b.part(new SphereGeometry(0.011, b.segments(10), b.segments(8)), BLACK, {
        bone: pawJoint,
        at: toeCenter,
        scale: [0.95, 0.8, 1.1],
        group: chain.name,
      });

      // Claw
      b.spike([toeCenter[0], pawH * 0.45, toeCenter[2] + 0.008], [0, -0.003, 0.012], 0.01, 0.0022, {
        bone: pawJoint,
        color: CLAW,
        sides: 4,
        group: chain.name,
      });
    }

    // Plantar / palmar pad underneath
    b.part(new BoxGeometry(0.022, 0.004, 0.024), PAW_PAD, {
      bone: pawJoint,
      at: [heelPt.x, 0.002, (heelPt.z + tipPt.z) * 0.5],
      group: chain.name,
    });
  }

  // ---------------------------------------------------------------------------
  // Bushy Brush Tail with Pure White Tag and Scent Gland Spot
  // ---------------------------------------------------------------------------
  // Very thick spindle profile: narrow base, massive fluffy middle, tapered end. The red brush and the white tag
  // each carry the whole profile over their own stretch, so the tag reads as a round white bulb; the tag's profile
  // runs from the tip back to the brush, where both are at their narrowest and meet ring for ring.
  const tailRadius = (t: number): [number, number] => {
    // Bulges up to radius 0.065 (13cm thick!), slightly taller than wide
    const bulge = Math.sin(Math.PI * Math.min(t / 0.85, 1));
    const r = 0.026 + 0.04 * bulge - 0.016 * Math.max(0, (t - 0.75) / 0.25);
    return [r * 0.95, r * 1.08];
  };
  // Behind the rump station the body rounds off like a cap while the narrow tail base grows out of it: near the
  // rump the tube's radius is the smooth maximum of that rounded rump and the brush, so both are one surface that
  // meets the body loft ring for ring.
  const rump: [number, number] = [stations[tailBaseIndex].w / 2, stations[tailBaseIndex].h / 2];
  const rumpDepth = Math.max(...rump);
  const smoothMax = (a: number, b: number, k = 0.015) => {
    const h = Math.max(k - Math.abs(a - b), 0) / k;
    return Math.max(a, b) + (h * h * k) / 4;
  };

  const tagSplit = 0.78; // White tag on the last 22% of the tail
  const tagT = tailBaseT * (1 - tagSplit);
  const tailBones = [tail, root, spine] as const;

  // Red brush, from the white-tag boundary (u = 0) to the rump (u = 1).
  b.sweep(
    curve,
    (u) => {
      const d = (1 - u) * (tailBaseT - tagT) * curve.length;
      const dome = Math.sqrt(Math.max(0, 1 - (d / rumpDepth) ** 2));
      const [tx, ty] = tailRadius(1 - u);
      // Past the dome the brush alone sets the radius, so it meets the white tag exactly.
      return dome > 0 ? [smoothMax(rump[0] * dome, tx), smoothMax(rump[1] * dome, ty)] : [tx, ty];
    },
    {
      from: tagT,
      to: tailBaseT,
      bone: tailBones,
      color: RED_FOX,
      sectors: [
        [-60, 60, RED_BACK], // Darker dorsal ridge on tail
      ],
      sides: 16,
      caps: { start: "none", end: "none" },
      group: "tail",
    },
  );

  // White tag, from the tip (u = 0) to the brush (u = 1).
  b.sweep(curve, (u) => tailRadius(u), {
    from: 0,
    to: tagT,
    bone: tailBones,
    color: WHITE,
    sides: 16,
    caps: { start: "round", end: "none" },
    group: "tail",
  });

  // Tail details use the original base -> tip parameter, mapped onto the shared chain.
  const tailAt = (t: number) => tail.at((hipsT - tailBaseT * (1 - t)) / hipsT);

  // Dark supracaudal scent gland mark (violet gland) near tail base
  const glandPt = tailAt(0.12);
  const glandR = tailRadius(0.12)[1];
  b.part(new CylinderGeometry(0.012, 0.012, 0.004, 12), VIOLET_GLAND, {
    bone: glandPt.bone ?? tail.joints[0],
    at: [0, glandPt.at.y + glandR - 0.001, glandPt.at.z],
    dir: [0, 1, 0],
    scale: [0.8, 1, 1.6],
    group: "tail",
  });

  // Fluffy fur tufts along the sides of the tail
  for (let i = 0; i < 8; i++) {
    const t = 0.22 + i * 0.07;
    for (const s of [1, -1]) {
      const pt = tailAt(t);
      const rad = tailRadius(t)[0];
      const tuftPos: V3 = [s * (rad + 0.004), pt.at.y + (i % 2 === 0 ? 0.008 : -0.008), pt.at.z];
      b.spike(tuftPos, [s * 0.03, -0.01, -0.05], 0.05, 0.014, {
        bone: pt.bone ?? undefined,
        color: t > tagSplit ? WHITE : RED_FOX,
        sides: 4,
        group: "tail",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Head, Muzzle, Ears, Eyes, and Jaws
  // ---------------------------------------------------------------------------
  const headDir: V3 = [0, -0.08, 1];
  const skull = b.joint("head", {
    parent: spine.joints[4],
    at: curve.at(1),
    dir: headDir,
    role: "head",
    group: "head",
  });

  const head = b.region({ at: skull, scale: HEAD_SCALE, quat: aim(headDir, [0, 1, 0], "z") });

  // Fox head: broad cranium tapering smoothly into a fine, pointed muzzle
  const cranium = b.loft(
    [
      { at: head.p([0, 0.02, -0.06]), w: head.s(0.12), h: head.s(0.11) }, // Back of cranium
      { at: head.p([0, 0.035, 0.02]), w: head.s(0.14), h: head.s(0.12) }, // Forehead / temples
      { at: head.p([0, 0.02, 0.08]), w: head.s(0.1), h: head.s(0.09) }, // Stop / snout root
      { at: head.p([0, 0.005, 0.14]), w: head.s(0.065), h: head.s(0.062) }, // Mid muzzle
      { at: head.p([0, -0.005, 0.19]), w: head.s(0.038), h: head.s(0.038) }, // Snout tip
    ],
    {
      bone: skull,
      color: RED_FOX,
      sectors: [
        [-60, 60, RED_BACK], // Deep red forehead
        [120, 240, WHITE], // White throat and underside of muzzle
      ],
      sides: 16,
      group: "head",
    },
  );

  const faceSurface = b.surface(cranium);
  const frontRay = (x: number, y: number) => faceSurface.ray(head.p([x, y, 0.35]), head.d([0, 0, -1]));

  // Symmetric facial features (ears, eyes, whisker pads, cheeks)
  for (const s of [1, -1]) {
    // 1. Prominent white cheek ruffs extending flared out from jawline
    head.part(new SphereGeometry(0.035, b.segments(12), b.segments(8)), WHITE, {
      at: [s * 0.052, -0.015, 0.04],
      scale: [1.2, 0.8, 1.4],
      group: "head",
    });

    // Pointed fur spikes flaring back from the cheeks
    for (let j = 0; j < 3; j++) {
      b.spike(
        head.p([s * 0.065, -0.01 - j * 0.012, 0.02 - j * 0.015]),
        head.d([s * 0.04, -0.01, -0.03]),
        head.s(0.045),
        head.s(0.011),
        {
          bone: skull,
          color: WHITE,
          sides: 4,
          group: "head",
        },
      );
    }

    // 2. White whisker pad beside the muzzle
    const pad = head.part(new SphereGeometry(0.02, b.segments(12), b.segments(8)), WHITE, {
      at: [s * 0.024, -0.012, 0.145],
      scale: [0.9, 0.8, 1.2],
      group: "head",
    });

    // Whisker follicle dots on pad
    const padSkin = b.surface(pad);
    for (const [az, el] of [
      [35, 12],
      [55, 6],
      [40, -8],
      [60, -2],
    ]) {
      const dot = padSkin.around(pad.at).at(s * az, el);
      if (dot) b.stick(new SphereGeometry(0.0018, 6, 4), BLACK, dot, { embed: 0.35, bone: skull });
    }

    // 3. Delicate whiskers
    for (let i = 0; i < 4; i++) {
      const rootPos = head.p([s * 0.028, -0.014 - i * 0.005, 0.155 - i * 0.006]);
      const dir = head.d([s * 1.0, 0.08 - i * 0.09, -0.15]);
      b.spike(rootPos, dir, head.s(0.11 - i * 0.01), head.s(0.0016), {
        bone: skull,
        color: i % 2 === 0 ? WHITE : BLACK,
        sides: 3,
        group: "head",
      });
    }

    // Superciliary whisker above the eye
    b.spike(head.p([s * 0.036, 0.052, 0.06]), head.d([s * 0.4, 0.8, 0.2]), head.s(0.055), head.s(0.0014), {
      bone: skull,
      color: BLACK,
      sides: 3,
      group: "head",
    });

    // 4. Large upright triangular fox ears with black backs
    // Ears are prominent, ~10cm tall, angled slightly outward and forward
    const earBase: V3 = [s * 0.048, 0.068, 0.0];
    const earTip: V3 = [s * 0.075, 0.165, -0.015];
    const earOuter: V3 = [s * 0.088, 0.075, -0.01];
    const earInner: V3 = [s * 0.016, 0.072, 0.01];

    // Ear back (black)
    b.slab(
      [earInner, earBase, earOuter, earTip].map((p) => head.p(p)),
      {
        thickness: head.s(0.008),
        color: DARK_EAR,
        bone: skull,
        group: "head",
      },
    );

    // Inner ear front (pinkish cavity)
    b.slab(
      (
        [
          [s * 0.025, 0.075, 0.014],
          [s * 0.046, 0.072, 0.008],
          [s * 0.078, 0.078, 0.005],
          [s * 0.07, 0.152, -0.005],
        ] as const
      ).map((p) => head.p(p)),
      {
        thickness: head.s(0.004),
        color: EAR_PINK,
        bone: skull,
        group: "head",
      },
    );

    // White ear fluff lining inside the ear base
    for (let k = 0; k < 3; k++) {
      b.spike(
        head.p([s * (0.032 + k * 0.012), 0.075, 0.018]),
        head.d([s * 0.2, 0.8, 0.2]),
        head.s(0.038 - k * 0.005),
        head.s(0.006),
        {
          bone: skull,
          color: WHITE,
          sides: 4,
          group: "head",
        },
      );
    }

    // 5. Bright amber almond eyes with dark eyeliner and tear stripe
    const gaze = head.d([s * 0.35, 0.05, 0.93]);
    const eyeR = 0.016 * HEAD_SCALE;
    const socket = frontRay(s * 0.038, 0.032);
    const eyePos = socket ? offset(socket, gaze, -eyeR * 0.2) : head.p([s * 0.038, 0.032, 0.075]);

    // Iris
    const iris = b.part(new SphereGeometry(eyeR, b.segments(14), b.segments(10)), AMBER_EYE, {
      bone: skull,
      at: eyePos,
      dir: gaze,
      axis: "z",
      scale: [1, 0.95, 0.7],
      group: "head",
    });

    // Vertical slit pupil
    b.part(new SphereGeometry(eyeR * 0.52, b.segments(10), b.segments(8)), PUPIL, {
      frame: iris.moved([0, 0, eyeR * 0.62]),
      bone: skull,
      scale: [0.35, 1.05, 0.4],
      group: "head",
    });

    // Specular highlight
    b.part(new SphereGeometry(eyeR * 0.16, 6, 6), EYE_SHINE, {
      at: iris.local([-s * eyeR * 0.22, eyeR * 0.32, eyeR * 0.7]),
      bone: skull,
      group: "head",
    });

    // Black eyeliner rim around the eye
    b.part(new TorusGeometry(eyeR * 1.02, 0.0024, 6, b.segments(16)), PUPIL, {
      frame: iris,
      bone: skull,
      group: "head",
    });

    // Dark tear line extending from medial corner down along muzzle
    b.capsule(
      iris.local([-s * eyeR * 0.55, -eyeR * 0.5, eyeR * 0.25]),
      head.p([s * 0.024, 0.005, 0.125]),
      head.s(0.0028),
      {
        bone: skull,
        color: PUPIL,
        group: "head",
      },
    );
  }

  // Black nose leather (rhinarium) at the tip of the muzzle
  const noseHit = frontRay(0, -0.002);
  const nosePos = noseHit ?? frame(head.p([0, -0.002, 0.198]), head.d([0, 0, 1]));

  b.stick(new CylinderGeometry(0.01 * HEAD_SCALE, 0.014 * HEAD_SCALE, 0.01, 3), NOSE, nosePos, {
    embed: 0.35,
    flow: head.d([0, -1, 0]),
    scale: [1.2, 1, 0.85],
    bone: skull,
    group: "head",
  });

  // Black philtrum line under nose
  b.capsule(head.p([0, -0.007, 0.202]), head.p([0, -0.018, 0.195]), head.s(0.0025), {
    bone: skull,
    color: BLACK,
    group: "head",
  });

  // Upper canines
  for (const s of [1, -1]) {
    b.spike(head.p([s * 0.018, -0.022, 0.175]), head.d([0, -1, 0.05]), head.s(0.016), head.s(0.004), {
      bone: skull,
      color: TOOTH,
      sides: 4,
      group: "head",
    });
  }

  // ---------------------------------------------------------------------------
  // Lower Jaw: Separate bone with chin, teeth, tongue, posed open
  // ---------------------------------------------------------------------------
  const jaw = head.joint("jaw", {
    parent: skull,
    at: [0, -0.025, 0.035],
    aim: [0, -0.04, 0.175],
    role: "jaw",
    group: "jaw",
  });

  // White chin and lower muzzle sweep
  b.sweep([jaw.at, head.p([0, -0.042, 0.175])], (t) => [head.s(0.038 - 0.016 * t), head.s(0.016 - 0.004 * t)], {
    bone: jaw,
    color: WHITE,
    sides: 12,
    caps: { start: "round", end: "point" },
    group: "jaw",
  });

  // Pink tongue nestled inside the lower jaw
  b.sweep([head.p([0, -0.032, 0.06]), head.p([0, -0.034, 0.15])], (t) => [head.s(0.018 - 0.005 * t), head.s(0.006)], {
    bone: jaw,
    color: TONGUE,
    sides: 8,
    group: "jaw",
  });

  // Lower canines
  for (const s of [1, -1]) {
    b.spike(head.p([s * 0.014, -0.034, 0.165]), head.d([0, 1, 0.05]), head.s(0.013), head.s(0.0035), {
      bone: jaw,
      color: TOOTH,
      sides: 4,
      group: "jaw",
    });
  }

  // Pose jaw open by 10 degrees so mouth reads clearly
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });

  return b.root;
}
