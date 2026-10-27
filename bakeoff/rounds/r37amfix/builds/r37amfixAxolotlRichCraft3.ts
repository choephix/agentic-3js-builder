import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
  spots,
  countershade,
  paint,
  svg,
} from "../../../../src/index";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";

export const meta = {
  name: "Chibi Axolotl",
  description: "A cute low-poly axolotl with a plump spotted body, tiny feet, broad tail, huge eyes, and abundant frilly pink external gills.",
};

const BODY_BASE = "#7bcfc1";
const BODY_DARK = "#3e9e9d";
const BELLY = "#d7fff0";
const MINT = cel(BODY_BASE, BODY_DARK);
const BELLY_PAINT = cel(BELLY, "#9bd8c9");
const SPOTTED_COAT = spots(MINT, ["#3a858c", "#5aa9a4", "#245e70"], {
  size: 0.105,
  amount: 0.54,
  rosette: true,
  seed: 17,
});
const BELLY_EDGE = furEdge(SPOTTED_COAT, BELLY_PAINT, {
  level: -0.12,
  teeth: 0.16,
  period: 0.045,
  ink: undefined,
});
const GILL = cel("#ff8daf", "#bf4d79");
const GILL_LIGHT = cel("#ffc1d3", "#e16c98");
const GILL_DARK = cel("#d95f91", "#87395e");
const LIMB_PAINT = cel("#65bcb5", "#327d83");
const EYE = animeEye({
  iris: "#55d9d4",
  irisLight: "#c9ffff",
  irisDark: "#176a82",
  ink: INK,
  blush: "#ff91aa",
  size: 512,
});
const MOUTH = svg(
  `<svg viewBox="0 0 160 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 23 Q80 61 151 23 Q137 58 80 58 Q23 58 9 23Z" fill="#321c3e"/>
    <path d="M19 25 Q80 48 141 25 Q123 38 80 40 Q37 38 19 25Z" fill="#e66c8d"/>
    <path d="M35 28 Q80 42 125 28" fill="none" stroke="#ffb4c5" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);
const GILL_MARK = svg(
  `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M31 122 C26 93 28 65 35 35 C39 20 42 10 43 5" fill="none" stroke="#fff0f5" stroke-width="6" stroke-linecap="round"/>
    <path d="M33 82 C20 69 11 63 4 61 M31 67 C45 55 53 45 59 34 M30 97 C18 90 10 87 3 87 M32 51 C43 42 50 34 55 25" fill="none" stroke="#ff9fbd" stroke-width="5" stroke-linecap="round"/>
    <path d="M33 82 C21 71 13 67 7 66 M31 67 C44 57 51 49 56 40 M30 97 C19 91 12 89 7 89 M32 51 C42 43 48 36 52 29" fill="none" stroke="#d65688" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

function sphere(
  b: ReturnType<typeof createBuilder>,
  at: THREE.Vector3 | [number, number, number],
  scale: [number, number, number],
  color: any,
  bone: any,
  name: string,
  segments = 12,
) {
  return b.part(new THREE.SphereGeometry(1, segments, Math.max(8, segments - 2)), color, {
    at,
    bone,
    scale,
    flat: true,
    name,
  });
}

function box(
  b: ReturnType<typeof createBuilder>,
  at: THREE.Vector3 | [number, number, number],
  scale: [number, number, number],
  color: any,
  bone: any,
  name: string,
) {
  return b.part(new THREE.BoxGeometry(1, 1, 1), color, {
    at,
    bone,
    scale,
    flat: true,
    name,
  });
}

function gillBranch(
  b: ReturnType<typeof createBuilder>,
  base: THREE.Vector3,
  tip: THREE.Vector3,
  bone: any,
  index: string,
) {
  b.rod(base, tip, 0.011, {
    color: GILL_DARK,
    bone,
    caps: "round",
    name: `gillStem.${index}`,
  });

  const d = tip.clone().sub(base).normalize();
  const side = new THREE.Vector3(0, 1, 0).cross(d).normalize();
  const up = new THREE.Vector3(0, 1, 0);

  const branchA = tip.clone().addScaledVector(side, 0.045).addScaledVector(up, 0.035);
  const branchB = tip.clone().addScaledVector(side, -0.045).addScaledVector(up, 0.018);
  const branchC = tip.clone().addScaledVector(side, 0.04).addScaledVector(up, -0.035);

  b.spike(tip, branchA, null, 0.009, {
    color: GILL_LIGHT,
    bone,
    caps: { end: "point" },
    name: `gillFrond.${index}.a`,
  });
  b.spike(tip, branchB, null, 0.008, {
    color: GILL,
    bone,
    caps: { end: "point" },
    name: `gillFrond.${index}.b`,
  });
  b.spike(tip, branchC, null, 0.008, {
    color: GILL_LIGHT,
    bone,
    caps: { end: "point" },
    name: `gillFrond.${index}.c`,
  });
}

export default function build() {
  const b = createBuilder({
    name: "chibi-axolotl",
    detail: 1,
    paintSize: 2048,
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton: one root, a flexible body, a tapering tail, four legs, a hinged jaw, and two small gill joints.

  const hips = b.joint("hips", {
    at: [0, 0.39, -0.28],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.39, -0.28],
      [0, 0.43, -0.02],
      [0, 0.49, 0.22],
      [0, 0.55, 0.38],
      [0, 0.61, 0.46],
    ]),
    {
      parent: hips,
      names: ["spineBase", "spineMid", "spineShoulder", "spineChest", "spineTip"],
      role: "spine",
      count: 5,
    },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.37, -0.3],
      [0, 0.32, -0.58],
      [0, 0.28, -0.9],
      [0, 0.24, -1.2],
      [0, 0.18, -1.47],
      [0, 0.11, -1.7],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
      role: "tail",
      count: 6,
    },
  );

  const head = b.joint("head", {
    parent: spine.tip!,
    at: [0, 0.68, 0.46],
    dir: [0, 0.03, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.595, 0.57],
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "face",
  });

  const legs: {
    side: number;
    label: string;
    chain: ReturnType<typeof b.chain>;
    points: THREE.Vector3[];
  }[] = [];

  for (const side of [1, -1]) {
    const label = side > 0 ? "L" : "R";

    const frontRoot: [number, number, number] = [side * 0.185, 0.49, 0.27];
    const frontFoot: [number, number, number] = [side * 0.265, 0.105, 0.34];
    const frontPts = limb(
      frontRoot,
      frontFoot,
      [0.19, 0.17, 0.115],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
      { sole: [0, 0, 1] },
    );
    const frontChain = b.chain(`arm${label}`, frontPts, {
      parent: spine.joints[2],
      names: [`shoulder${label}`, `elbow${label}`, `wrist${label}`],
      role: "arm",
      count: 3,
      contact: frontFoot,
    });
    legs.push({ side, label: `front${label}`, chain: frontChain, points: frontPts });

    const rearRoot: [number, number, number] = [side * 0.21, 0.39, -0.17];
    const rearFoot: [number, number, number] = [side * 0.3, 0.105, -0.38];
    const rearPts = limb(
      rearRoot,
      rearFoot,
      [0.22, 0.19, 0.12],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
      { sole: [0, 0, 1] },
    );
    const rearChain = b.chain(`leg${label}`, rearPts, {
      parent: hips,
      names: [`hip${label}`, `knee${label}`, `ankle${label}`],
      role: "leg",
      count: 3,
      contact: rearFoot,
    });
    legs.push({ side, label: `rear${label}`, chain: rearChain, points: rearPts });
  }

  const gillL = b.joint("gillL", {
    parent: head,
    at: [0.145, 0.72, 0.31],
    dir: [1, 0.08, -0.15],
    role: "fan",
    group: "gills",
  });
  const gillR = b.joint("gillR", {
    parent: head,
    at: [-0.145, 0.72, 0.31],
    dir: [-1, 0.08, -0.15],
    role: "fan",
    group: "gills",
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Main body and tail, with a pale jagged belly and small low-poly sections.

  const bodyTube = b.sweep(spine, (t) => {
    const r = 0.22 + 0.045 * Math.sin(t * Math.PI);
    return [r * 1.17, r];
  }, {
    color: BELLY_EDGE,
    bone: spine,
    section: { ngon: 8 },
    caps: "round",
    name: "plumpBody",
    group: "body",
  });

  const tailTube = b.sweep(tail, (t) => [0.18 * (1 - t) + 0.018, 0.105 * (1 - t) + 0.012], {
    color: SPOTTED_COAT,
    bone: tail,
    section: { ngon: 7 },
    caps: { start: "round", end: "point" },
    name: "taperedTail",
    group: "tail",
  });

  // A soft ventral row makes the belly read even from a three-quarter view.
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const p = spine.at(t).at.clone().add(new THREE.Vector3(0, -0.19, 0));
    sphere(b, p, [0.085, 0.035, 0.075], BELLY_PAINT, spine.at(t).bone, `bellyPad${i}`, 8);
  }

  // Tail fin silhouette: broad, simple, and deliberately puppet-like.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.62, 0.045],
        [0.47, 0.11],
        [0.18, 0.15],
        [0, 0.07],
      ],
      {
        at: [0, 0.29, -0.86],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: [0.018, 0.006],
        bevel: 0.008,
        smoothing: 1,
        color: cel("#65b6b6", "#397d89"),
        bone: tail.joints[2],
        name: `tailFin${s > 0 ? "L" : "R"}`,
        group: "tail",
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Legs: chunky tapered tubes, broad palms, and three round toes per foot.

  for (const entry of legs) {
    const { side, label, chain } = entry;
    const isFront = label.startsWith("front");
    const legColor = isFront ? LIMB_PAINT : SPOTTED_COAT;

    b.sweep(chain, (t) => (isFront ? 0.058 - t * 0.012 : 0.073 - t * 0.018), {
      color: legColor,
      bone: chain,
      section: { ngon: 6 },
      caps: "round",
      name: `${label}.limb`,
      group: "limbs",
    });

    const foot = chain.tip!.at;
    sphere(b, foot, [0.082, 0.043, 0.095], LIMB_PAINT, chain.tip!, `${label}.palm`, 8);

    for (let i = -1; i <= 1; i++) {
      const toeBase = foot.clone().add(new THREE.Vector3(side * i * 0.036, -0.012, 0.035));
      const toeTip = toeBase.clone().add(new THREE.Vector3(side * i * 0.018, -0.015, 0.075));
      b.capsule(toeBase, toeTip, 0.018, BELLY_PAINT, {
        bone: chain.tip!,
        caps: "round",
        name: `${label}.toe${i + 2}`,
        group: "digits",
      });
      sphere(b, toeTip, [0.021, 0.014, 0.026], "#e9fff4", chain.tip, `${label}.toePad${i + 2}`, 7);
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Head, cheeks, muzzle, jaw, and face markings.

  const skull = sphere(
    b,
    [0, 0.72, 0.48],
    [0.285, 0.25, 0.255],
    SPOTTED_COAT,
    head,
    "largeRoundedHead",
    16,
  );

  sphere(b, [0.0, 0.65, 0.68], [0.19, 0.13, 0.105], BELLY_PAINT, head, "creamMuzzle", 12);
  sphere(b, [0.0, 0.64, 0.756], [0.055, 0.04, 0.025], "#55344c", head, "softNose", 8);

  // Separate lower jaw for a readable openable mouth.
  box(b, [0, 0.585, 0.665], [0.255, 0.055, 0.16], BELLY_PAINT, jaw, "lowerJaw");
  sphere(b, [0, 0.60, 0.715], [0.17, 0.035, 0.035], "#55243e", jaw, "lowerLip", 10);

  b.decal(skull, MOUTH, {
    at: [0, 0.615, 0.742],
    dir: [0, 0.08, 1],
    up: [0, 1, 0],
    size: [0.15, 0.06],
    lift: 0.004,
    segments: 8,
    bone: head,
    name: "smilingMouth",
    group: "face",
  });

  // Huge eyes are placed before the gills and accessories, keeping the face unobstructed.
  for (const side of [1, -1]) {
    const eyeAt = new THREE.Vector3(side * 0.115, 0.785, 0.665);
    b.decal(skull, EYE, {
      at: eyeAt,
      dir: [side * 0.23, 0.12, 1],
      up: [0, 1, 0],
      size: [0.105, 0.145],
      mirror: side > 0,
      lift: 0.006,
      segments: 10,
      bone: head,
      name: `shinyEye${side > 0 ? "L" : "R"}`,
      group: "face",
    });

    sphere(
      b,
      new THREE.Vector3(side * 0.043, 0.69, 0.765),
      [0.012, 0.009, 0.008],
      INK,
      head,
      `nostril${side > 0 ? "L" : "R"}`,
      6,
    );
  }

  // Cheek freckles and a few soft spots.
  for (const side of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      sphere(
        b,
        [side * (0.16 + (i % 2) * 0.018), 0.66 + Math.floor(i / 2) * 0.04, 0.68 + (i % 2) * 0.014],
        [0.012, 0.009, 0.006],
        "#3f7782",
        head,
        `cheekFreckle${side > 0 ? "L" : "R"}${i}`,
        6,
      );
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Signature frilly pink external gills: three stalks and several branching filaments on each side.

  for (const side of [1, -1]) {
    const bone = side > 0 ? gillL : gillR;
    const root = new THREE.Vector3(side * 0.165, 0.73, 0.30);

    // Three broad, translucent-looking fan blades.
    for (let i = 0; i < 3; i++) {
      const z = 0.27 - i * 0.055;
      const y = 0.77 + i * 0.015;
      b.extrude(
        [
          [0, 0],
          [0.12, 0.018],
          [0.105, 0.075],
          [0.065, 0.145],
          [0.015, 0.18],
          [0, 0.105],
        ],
        {
          at: [side * 0.17, y, z],
          x: [0, 0, -side],
          y: [0, 1, 0],
          thickness: [0.013, 0.004],
          bevel: 0.004,
          smoothing: 1,
          color: i === 1 ? GILL_LIGHT : GILL,
          bone,
          name: `frillyGillFan${side > 0 ? "L" : "R"}${i}`,
          group: "gills",
        },
      );
    }

    const bases = [
      root.clone().add(new THREE.Vector3(0, 0.075, 0.025)),
      root.clone().add(new THREE.Vector3(0, 0.02, -0.02)),
      root.clone().add(new THREE.Vector3(0, -0.035, -0.055)),
    ];

    for (let i = 0; i < bases.length; i++) {
      const base = bases[i];
      const tip = base.clone().add(new THREE.Vector3(side * (0.135 + i * 0.018), 0.085 - i * 0.035, -0.02));
      gillBranch(b, base, tip, bone, `${side > 0 ? "L" : "R"}${i}`);
    }

    b.decal(
      b.part(new THREE.SphereGeometry(0.045, 8, 6), GILL_DARK, {
        at: root,
        bone,
        scale: [1.0, 1.25, 0.7],
        name: `gillSocket${side > 0 ? "L" : "R"}`,
      }),
      GILL_MARK,
      {
        at: root.clone().add(new THREE.Vector3(side * 0.015, 0.025, 0.012)),
        dir: [side, 0.1, -0.2],
        size: [0.075, 0.12],
        mirror: side > 0,
        lift: 0.003,
        segments: 6,
        bone,
        name: `gillInkDetail${side > 0 ? "L" : "R"}`,
        group: "gills",
      },
    );
  }

  // Small rounded dorsal bumps and a rear speckled ridge add silhouette detail without clutter.
  for (let i = 0; i < 5; i++) {
    const t = 0.15 + i * 0.16;
    const p = spine.at(t).at.clone().add(new THREE.Vector3(0, 0.19, 0));
    b.spike(p, [0, 1, 0], 0.045 - i * 0.005, 0.025 - i * 0.002, {
      color: BODY_DARK,
      bone: spine.at(t).bone,
      name: `backBump${i}`,
      group: "body",
    });
  }

  // A few pale side spots, deliberately oversized for chibi readability.
  for (const side of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      const p = new THREE.Vector3(
        side * (0.205 + (i % 2) * 0.015),
        0.32 + i * 0.045,
        -0.12 + (i % 3) * 0.14,
      );
      sphere(b, p, [0.028, 0.022, 0.012], "#b9eee0", spine.joints[Math.min(3, i)], `sideSpot${side > 0 ? "L" : "R"}${i}`, 7);
    }
  }

  // A tiny tail-tip heart-shaped mark: the axolotl's friendly signature.
  b.extrude(
    [
      [0, 0],
      [0.035, 0.03],
      [0.07, 0],
      [0.035, -0.065],
    ],
    {
      at: [0, 0.12, -1.69],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.003,
      color: "#f3a1bd",
      bone: tail.tip!,
      name: "tailTipHeart",
      group: "tail",
    },
  );

  // Keep the jaw visibly a little open in the rest pose.
  b.pose(jaw, { axis: [1, 0, 0], deg: -8 });

  return b.root;
}
