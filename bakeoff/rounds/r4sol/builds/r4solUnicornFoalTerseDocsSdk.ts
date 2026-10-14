import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  rng,
  countershade,
  gradient,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Moonmilk — Unicorn Foal",
  description:
    "A leggy ivory unicorn foal with an apricot muzzle, bright violet eyes, a little spiral-gold horn, and flowing opalescent locks.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Moonmilk", detail: 1, paintSize: 1024 });

  const C = {
    ivory: "#fff2de",
    cream: "#fff9ea",
    peach: "#edc2b9",
    blush: "#e8b0b9",
    lavender: "#b7a3df",
    lilac: "#d5bce9",
    violet: "#9480be",
    plum: "#655175",
    aqua: "#9dded9",
    ice: "#e5f5ef",
    pink: "#f0bbc9",
    gold: "#d4a45b",
    paleGold: "#f5d69b",
    ink: "#302b43",
    lip: "#93717c",
    hoof: "#907aa7",
    sole: "#695773",
  };

  const coat = countershade(C.ivory, "#e5cbbb", {
    level: -0.35,
    soft: 0.65,
  });

  // Skeleton: a small, comfortably standing foal, with all four feet separated.
  const hips = b.joint("hips", {
    at: [0, 0.84, -0.315],
    dir: [0, 0.04, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    [hips, [0, 0.875, -0.025], [0, 0.89, 0.315]],
    {
      parent: hips,
      names: ["spine1", "chest", "withers"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    [
      [0, 0.915, 0.315],
      [0, 1.105, 0.425],
      [0, 1.295, 0.57],
      [0, 1.36, 0.65],
    ],
    {
      parent: spine.tip!,
      names: ["neck1", "neck2", "poll", "neckTip"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 1.354, 0.674],
    dir: [0, -0.26, 1],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.236, 0.725],
    dir: [0, -0.27, 1],
    role: "jaw",
  });

  const ears = [1, -1].map((s) => ({
    s,
    bone: b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: [s * 0.111, 1.474, 0.611],
      dir: [s * 0.16, 1, -0.25],
      role: "hinge",
    }),
  }));

  const legs = [1, -1].flatMap((s) => {
    const side = s > 0 ? "L" : "R";
    const frontFoot = [s * 0.2, 0.068, 0.405];
    const hindFoot = [s * 0.198, 0.063, -0.321];

    const fore = b.chain(
      `foreleg${side}`,
      [
        [s * 0.157, 0.875, 0.30],
        [s * 0.175, 0.645, 0.24],
        [s * 0.186, 0.38, 0.336],
        [s * 0.2, 0.132, 0.371],
        frontFoot,
      ],
      {
        parent: spine.tip!,
        names: [
          `shoulder${side}`,
          `elbow${side}`,
          `kneeF${side}`,
          `ankleF${side}`,
          `hoofF${side}`,
        ],
        role: "leg",
        contact: [s * 0.2, 0, 0.405],
      },
    );

    const hind = b.chain(
      `hindleg${side}`,
      [
        [s * 0.156, 0.83, -0.337],
        [s * 0.183, 0.552, -0.214],
        [s * 0.184, 0.305, -0.398],
        [s * 0.198, 0.125, -0.367],
        hindFoot,
      ],
      {
        parent: hips,
        names: [
          `hip${side}`,
          `knee${side}`,
          `hock${side}`,
          `ankleH${side}`,
          `hoofH${side}`,
        ],
        role: "leg",
        contact: [s * 0.198, 0, -0.321],
      },
    );

    return [
      { s, front: true, side, chain: fore, foot: frontFoot },
      { s, front: false, side, chain: hind, foot: hindFoot },
    ];
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.905, -0.464],
      [0, 0.90, -0.67],
      [0, 0.80, -0.915],
      [0, 0.785, -1.13],
    ]),
    {
      parent: hips,
      count: 4,
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
    },
  );

  // The body is deliberately a simple little barrel.
  const body = b.loft(
    [
      { at: [0, 0.841, -0.445], w: 0.26, h: 0.30 },
      { at: [0, 0.863, -0.295], w: 0.42, h: 0.42 },
      { at: [0, 0.861, 0.015], w: 0.405, h: 0.405 },
      { at: [0, 0.876, 0.275], w: 0.345, h: 0.43 },
      { at: [0, 0.895, 0.405], w: 0.18, h: 0.235 },
    ],
    {
      bone: [hips, spine],
      color: coat,
      sides: 10,
      smooth: false,
      name: "ivoryBarrel",
    },
  );

  const neckVolume = b.loft(
    [
      { at: neck.at(0), w: 0.265, h: 0.305 },
      { at: neck.at(0.43), w: 0.224, h: 0.295 },
      { at: neck.at(0.78), w: 0.176, h: 0.235 },
      { at: neck.at(1), w: 0.15, h: 0.195 },
    ],
    {
      bone: neck,
      color: coat,
      sides: 8,
      smooth: false,
      name: "uprightFoalNeck",
    },
  );

  function limbRadius(
    t: number,
    values: number[][],
  ): [number, number] {
    const keys = [0, 0.28, 0.60, 0.89, 1];
    let i = 0;
    while (i < keys.length - 2 && t > keys[i + 1]) i++;
    const u = THREE.MathUtils.clamp(
      (t - keys[i]) / (keys[i + 1] - keys[i]),
      0,
      1,
    );
    return [
      THREE.MathUtils.lerp(values[i][0], values[i + 1][0], u),
      THREE.MathUtils.lerp(values[i][1], values[i + 1][1], u),
    ];
  }

  for (const leg of legs) {
    const profile = leg.front
      ? [
          [0.078, 0.073],
          [0.052, 0.048],
          [0.035, 0.033],
          [0.043, 0.038],
          [0.030, 0.029],
        ]
      : [
          [0.088, 0.080],
          [0.061, 0.057],
          [0.032, 0.032],
          [0.041, 0.037],
          [0.029, 0.029],
        ];

    b.sweep(leg.chain, (t) => limbRadius(t, profile), {
      color: gradient(
        coat,
        "#f4e4d9",
        [0, 0.32, 0],
        [0, 0.10, 0],
      ),
      sides: 8,
      smooth: false,
      name: `${leg.front ? "front" : "hind"}Leg${leg.side}`,
    });

    const x = leg.foot[0];
    const z = leg.foot[2];
    const hoofBone = leg.chain.tip!;

    const hoof = b.part(
      new THREE.CylinderGeometry(0.046, 0.062, 0.09, 8, 1),
      C.hoof,
      {
        bone: hoofBone,
        at: [x, 0.045, z],
        scale: [1, 1, 1.16],
        rotation: [0, 22.5, 0],
        flat: true,
        name: `hoofShell${leg.front ? "F" : "H"}${leg.side}`,
      },
    );

    b.part(
      new THREE.CylinderGeometry(0.061, 0.062, 0.009, 8, 1),
      C.sole,
      {
        bone: hoofBone,
        at: [x, 0.0045, z],
        scale: [1, 1, 1.16],
        rotation: [0, 22.5, 0],
        flat: true,
        name: "flatHoofSole",
      },
    );

    b.part(
      new THREE.CylinderGeometry(0.047, 0.050, 0.011, 8, 1),
      C.paleGold,
      {
        bone: hoofBone,
        at: [x, 0.089, z],
        scale: [1, 1, 1.16],
        rotation: [0, 22.5, 0],
        flat: true,
        name: "goldenCoronet",
      },
    );

    const hoofSurface = b.surface(hoof);
    for (const dx of [-0.02, 0, 0.02]) {
      const engraving = hoofSurface.drape([
        [x + dx, 0.024, z + 0.085],
        [x + dx * 0.85, 0.043, z + 0.080],
        [x + dx * 0.72, 0.067, z + 0.074],
      ]);
      b.sweep(engraving, [0.0017, 0.0009], {
        color: "#cbb5d8",
        sides: 4,
        caps: "round",
        name: "hoofGrowthLine",
      });
    }
  }

  // Large cranium and short tapering face: unmistakably a young horse.
  const skull = b.part(
    new THREE.SphereGeometry(1, 12, 8),
    coat,
    {
      bone: head,
      at: head,
      scale: [0.166, 0.179, 0.183],
      flat: true,
      name: "foalCranium",
    },
  );

  const face = b.loft(
    [
      { at: [0, 1.355, 0.733], w: 0.24, h: 0.226 },
      { at: [0, 1.279, 0.895], w: 0.178, h: 0.157 },
      { at: [0, 1.233, 1.043], w: 0.183, h: 0.125 },
    ],
    {
      bone: head,
      color: coat,
      sides: 8,
      smooth: false,
      caps: "flat",
      name: "upperJawBridge",
    },
  );

  const muzzle = b.part(
    new THREE.SphereGeometry(1, 12, 8),
    gradient(C.ivory, C.peach, [0, 1.29, 1.015], [0, 1.22, 1.15]),
    {
      bone: head,
      at: [0, 1.225, 1.065],
      scale: [0.113, 0.073, 0.100],
      flat: true,
      name: "apricotUpperMuzzle",
    },
  );

  b.loft(
    [
      { at: jaw, w: 0.15, h: 0.122 },
      { at: [0, 1.169, 0.920], w: 0.155, h: 0.089 },
      { at: [0, 1.146, 1.065], w: 0.19, h: 0.070 },
    ],
    {
      bone: jaw,
      color: coat,
      sides: 8,
      smooth: false,
      caps: "flat",
      name: "independentLowerJaw",
    },
  );

  b.part(
    new THREE.SphereGeometry(1, 10, 6),
    "#f3d7c9",
    {
      bone: jaw,
      at: [0, 1.140, 1.069],
      scale: [0.105, 0.045, 0.089],
      flat: true,
      name: "lowerLip",
    },
  );

  const muzzleSurface = b.surface(muzzle);
  const smile = muzzleSurface.drape([
    [-0.103, 1.204, 1.098],
    [-0.079, 1.190, 1.137],
    [0, 1.181, 1.169],
    [0.079, 1.190, 1.137],
    [0.103, 1.204, 1.098],
  ]);
  b.sweep(smile, 0.0024, {
    color: C.lip,
    sides: 5,
    name: "quietMouthLine",
  });

  for (const s of [1, -1]) {
    const nostrilHit = muzzleSurface.nearest([
      s * 0.089,
      1.255,
      1.119,
    ]);
    const rim = b.stick(
      new THREE.SphereGeometry(1, 8, 5),
      "#d49da3",
      nostrilHit,
      {
        scale: [0.025, 0.004, 0.017],
        embed: 0.35,
        flow: [0, 1, 0],
        spin: s * 24,
        name: "softNostrilRim",
      },
    );
    const inner = b.surface(rim).nearest(rim.local([0, 0.02, 0]));
    b.stick(new THREE.SphereGeometry(1, 8, 5), C.lip, inner, {
      scale: [0.0175, 0.003, 0.010],
      embed: 0.3,
      flow: [0, 1, 0],
      spin: s * 24,
      name: "nostril",
    });
  }

  // Tall velvet-lined ears, with pointed, primitive silhouettes.
  for (const { s, bone } of ears) {
    const ear = b.extrude(
      [
        [-0.037, 0],
        [0.036, 0.008],
        [0.059, 0.107],
        [0.041, 0.209],
        [0.025, 0.255, "sharp"],
        [-0.025, 0.172],
        [-0.043, 0.074],
      ],
      {
        at: bone,
        x: [s, 0, 0],
        y: [0, 1, -0.25],
        thickness: [0.058, 0.018],
        bevel: 0.006,
        smoothing: 1,
        color: C.ivory,
        bone,
        name: s > 0 ? "earShellL" : "earShellR",
      },
    );

    b.extrude(
      [
        [-0.018, 0],
        [0.016, 0],
        [0.034, 0.075],
        [0.024, 0.168],
        [0.017, 0.187, "sharp"],
        [-0.015, 0.107],
      ],
      {
        at: ear.local([0.006, 0.035, s * 0.025]),
        x: [s, 0, 0],
        y: [0, 1, -0.25],
        thickness: 0.006,
        smoothing: 1,
        color: C.blush,
        bone,
        name: "velvetInnerEar",
      },
    );
  }

  // Convex little eyes; every layer is seated on the preceding surface.
  const headSurface = b.surface([skull, face]);
  for (const s of [1, -1]) {
    const eyeHit = headSurface.nearest([s * 0.19, 1.366, 0.780]);
    const socket = b.stick(
      new THREE.SphereGeometry(1, 10, 6),
      "#d8b9b0",
      eyeHit,
      {
        scale: [0.064, 0.014, 0.055],
        embed: 0.4,
        flow: [0, 1, 0],
        name: "warmEyeSocket",
      },
    );
    const eyeSeat = b.surface(socket).nearest(socket.local([0, 0.06, 0]));
    const eye = b.stick(
      new THREE.SphereGeometry(1, 12, 8),
      C.ink,
      eyeSeat,
      {
        scale: [0.058, 0.020, 0.049],
        embed: 0.4,
        flow: [0, 1, 0],
        name: s > 0 ? "eyeL" : "eyeR",
      },
    );

    const irisSeat = b.surface(eye).nearest(eye.local([0, 0.08, -0.002]));
    const iris = b.stick(
      new THREE.SphereGeometry(1, 10, 6),
      C.violet,
      irisSeat,
      {
        scale: [0.030, 0.0045, 0.034],
        embed: 0.3,
        flow: [0, 1, 0],
        name: "violetIris",
      },
    );

    const irisSurface = b.surface(iris);
    const lowSeat = irisSurface.nearest(iris.local([0, 0.015, -0.019]));
    b.stick(new THREE.SphereGeometry(1, 8, 5), C.aqua, lowSeat, {
      scale: [0.022, 0.002, 0.010],
      embed: 0.5,
      flow: [0, 1, 0],
      name: "opalIrisLight",
    });

    const pupilSeat = irisSurface.nearest(iris.local([0, 0.04, 0.004]));
    const pupil = b.stick(
      new THREE.SphereGeometry(1, 10, 6),
      C.ink,
      pupilSeat,
      {
        scale: [0.0145, 0.003, 0.026],
        embed: 0.3,
        flow: [0, 1, 0],
        name: "pupil",
      },
    );

    const pupilSurface = b.surface(pupil);
    b.stick(
      new THREE.SphereGeometry(1, 8, 5),
      "#ffffff",
      pupilSurface.nearest(pupil.local([-0.007, 0.025, 0.013])),
      {
        scale: [0.0085, 0.002, 0.010],
        embed: 0.2,
        flow: [0, 1, 0],
        name: "largeEyeCatchlight",
      },
    );
    b.stick(
      new THREE.SphereGeometry(1, 6, 4),
      C.cream,
      irisSurface.nearest(iris.local([0.016, 0.025, -0.016])),
      {
        scale: [0.004, 0.0016, 0.004],
        embed: 0.3,
        name: "smallEyeCatchlight",
      },
    );

    const eyeSurface = b.surface(eye);
    b.sweep(
      eyeSurface.drape([
        eye.local([-0.051, 0.05, 0.019]),
        eye.local([-0.027, 0.05, 0.043]),
        eye.local([0.015, 0.05, 0.047]),
        eye.local([0.050, 0.05, 0.022]),
      ]),
      0.0035,
      { color: C.ink, sides: 5, name: "upperEyelid" },
    );

    for (let i = 0; i < 3; i++) {
      const lashRoot = eyeSurface.nearest(
        eye.local([0.036 + i * 0.005, 0.026, 0.033 - i * 0.009]),
      );
      b.spike(
        lashRoot,
        eye.dir([0.42 + i * 0.17, 0.7, 0.65 - i * 0.15]),
        0.021 + i * 0.003,
        0.003,
        { color: C.ink, sides: 5, name: "eyelash" },
      );
    }
  }

  const cheekTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 96">
      <defs><radialGradient id="b">
        <stop offset="0" stop-color="#e8a6b2" stop-opacity=".68"/>
        <stop offset=".65" stop-color="#efbec1" stop-opacity=".4"/>
        <stop offset="1" stop-color="#efbec1" stop-opacity="0"/>
      </radialGradient></defs>
      <ellipse cx="64" cy="49" rx="59" ry="42" fill="url(#b)"/>
      <g fill="#c38d91">
        <circle cx="47" cy="40" r="3.4"/>
        <circle cx="65" cy="48" r="3"/>
        <circle cx="81" cy="36" r="3.1"/>
      </g>
    </svg>`,
    { size: 256 },
  );
  for (const s of [1, -1]) {
    const cheek = headSurface.nearest([s * 0.135, 1.286, 0.861]);
    b.decal([skull, face], cheekTexture, {
      at: cheek,
      size: [0.105, 0.074],
      up: [0, 1, 0],
      mirror: s < 0,
      bone: head,
      name: "blushingFreckledCheek",
    });
  }

  // A short, real spiral horn, not just a painted cone.
  const hornHit = headSurface.nearest([0, 1.51, 0.800]);
  const hornAxis = new THREE.Vector3(0, 1, 0.23).normalize();
  const hornLength = 0.275;
  const hornTip = hornHit.at.clone().addScaledVector(hornAxis, hornLength);
  const hornFrame = frame(hornHit, hornAxis);
  b.stick(
    new THREE.CylinderGeometry(0.043, 0.047, 0.014, 10),
    C.gold,
    hornFrame,
    { embed: 0.45, name: "hornRootCollar" },
  );
  b.sprout("horn", hornHit, hornTip, [0.034, 0], {
    count: 0,
    color: C.paleGold,
    sides: 10,
    smooth: false,
    caps: { start: "flat", end: "point" },
    name: "littleUnicornHorn",
  });

  const hornX = new THREE.Vector3(1, 0, 0);
  const hornZ = hornAxis.clone().cross(hornX).normalize();
  const spiralPoints: THREE.Vector3[] = [];
  for (let i = 0; i <= 72; i++) {
    const t = 0.035 + (i / 72) * 0.925;
    const angle = t * Math.PI * 2 * 3.45;
    const r = 0.034 * (1 - t);
    spiralPoints.push(
      hornHit.at
        .clone()
        .addScaledVector(hornAxis, hornLength * t)
        .addScaledVector(hornX, Math.cos(angle) * r)
        .addScaledVector(hornZ, Math.sin(angle) * r),
    );
  }
  b.sweep(catmull(spiralPoints), [0.004, 0.001], {
    bone: head,
    color: C.gold,
    sides: 5,
    smooth: false,
    name: "raisedHornSpiral",
  });

  // The mane is composed of a few broad, faceted flowing locks.
  const maneRoots = b.surface(skull);
  const maneColors = [C.violet, C.lavender, C.lilac, C.aqua, C.pink];
  for (let i = 0; i < 5; i++) {
    const x = -0.066 + i * 0.033;
    const root = maneRoots.nearest([x, 1.474, 0.565]);
    const lockPath = catmull([
      root,
      [x + 0.020, 1.378, 0.421],
      [x + 0.040, 1.238, 0.268],
      [x + 0.058, 1.108, 0.169],
      [x + 0.067, 1.032 + i * 0.010, 0.150],
      [x + 0.075, 1.050 + i * 0.010, 0.210],
    ]);
    const lock = b.sweep(
      lockPath,
      (t) => [
        0.032 * (1 - t) + 0.010,
        0.034 * (1 - t) + 0.008,
      ],
      {
        bone: [neck, head],
        color: maneColors[i],
        sides: 6,
        smooth: false,
        caps: "round",
        name: `maneLock${i + 1}`,
      },
    );
    b.sweep(lock.line(0).slice(0.12, 0.88), [0.004, 0.0015], {
      bone: [neck, head],
      color: i === 3 ? C.ice : "#eee0f5",
      sides: 4,
      name: "maneSilkHighlight",
    });
  }

  // Short side locks make the mane's roots sit naturally against the neck.
  const neckSurface = b.surface(neckVolume);
  for (let i = 0; i < 3; i++) {
    const root = neckSurface.nearest([
      -0.11,
      1.12 + i * 0.10,
      0.30 + i * 0.07,
    ]);
    b.sweep(
      catmull([
        root,
        root.local({ right: 0.025, down: 0.032, back: 0.045 }),
        root.local({ right: 0.035, down: 0.092, back: 0.065 }),
        root.local({ right: 0.018, down: 0.107, back: 0.010 }),
      ]),
      [0.030, 0.006],
      {
        bone: root.bone!,
        color: i === 1 ? C.lilac : C.lavender,
        sides: 6,
        smooth: false,
        name: "shortManeCurl",
      },
    );
  }

  // Side-swept forelock leaves both eyes and the horn readable.
  for (let i = 0; i < 4; i++) {
    const root = maneRoots.nearest([
      -0.081 + i * 0.035,
      1.506,
      0.671,
    ]);
    const forelock = b.sweep(
      catmull([
        root,
        [0.006 + i * 0.025, 1.519, 0.739],
        [0.086 + i * 0.019, 1.462, 0.808],
        [0.119 + i * 0.012, 1.399 + i * 0.009, 0.836],
        [0.095 + i * 0.013, 1.403 + i * 0.010, 0.883],
      ]),
      (t) => [0.035 * (1 - t) + 0.009, 0.029 * (1 - t) + 0.006],
      {
        bone: head,
        color: [C.lavender, C.lilac, C.aqua, C.lavender][i],
        sides: 6,
        smooth: false,
        name: `forelock${i + 1}`,
      },
    );
    if (i === 1 || i === 2) {
      b.sweep(forelock.line(0).slice(0.14, 0.87), [0.0036, 0.001], {
        bone: head,
        color: i === 2 ? C.ice : "#f1e5fa",
        sides: 4,
        name: "forelockPearlStreak",
      });
    }
  }

  // An extended, softly curling tail, with individually readable ends.
  b.sweep(tail, [0.037, 0.088, 0.080, 0.053, 0.009], {
    color: C.lavender,
    sides: 8,
    smooth: false,
    name: "tailHairCore",
  });

  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const dx = Math.cos(angle) * 0.055;
    const dy = Math.sin(angle) * 0.045;
    const tailPath = catmull([
      tail.at(0),
      tail.at(0.25).local({ left: dx * 0.7, up: dy * 0.7 }),
      tail.at(0.55).local({ left: dx, up: dy }),
      tail.at(0.83).local({ left: dx * 0.8, up: dy * 0.8 }),
      tail.at(1).local({ left: dx * 0.75, up: dy + 0.018 }),
      tail.at(1).local({
        left: dx * 0.5,
        up: dy + 0.060,
        back: 0.043,
      }),
    ]);
    const strand = b.sweep(tailPath, [0.025, 0.035, 0.030, 0.018, 0.004], {
      bone: tail,
      color: [C.lilac, C.aqua, C.pink, C.violet, C.lavender][i],
      sides: 6,
      smooth: false,
      name: `tailRibbon${i + 1}`,
    });
    if (i === 0 || i === 1) {
      b.sweep(strand.line(0).slice(0.16, 0.87), [0.0035, 0.001], {
        bone: tail,
        color: i === 1 ? C.ice : "#efe2f6",
        sides: 4,
        name: "tailRibbonHighlight",
      });
    }
  }

  // Small natural-looking celestial markings, rather than clothing or tack.
  const starTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <path d="M79 24 L90  sixty" fill="none"/>
      <path d="M79 22 L91  sixty" fill="none"/>
      <path d="M79 26 L91 66 L130 79 L91 91 L79 133 L67 91 L27 79 L67 66 Z"
        fill="#edce92" stroke="#c99b54" stroke-width="3"
        stroke-linejoin="round"/>
      <path d="M79 43 L86 72 L112 79 L86 86 L79 114 L72 86 L46 79 L72 72 Z"
        fill="#fff1ce"/>
      <path d="M130 22 L134 34 L146 38 L134 42 L130 55 L126 42 L113 38 L126 34 Z"
        fill="#d4a45b"/>
      <path d="M29 111 L33 123 L45 127 L33 131 L29 143 L25 131 L13 127 L25 123 Z"
        fill="#dfbb7f"/>
      <circle cx="128" cy="116" r="4" fill="#d4a45b"/>
      <circle cx="36" cy="40" r="3.5" fill="#d4a45b"/>
    </svg>`,
    { size: 256 },
  );

  const bodySurface = b.surface(body);
  for (const s of [1, -1]) {
    const marking = bodySurface.nearest([s * 0.24, 0.891, -0.20]);
    b.decal(body, starTexture, {
      at: marking,
      up: [0, 1, 0],
      size: [0.145, 0.145],
      mirror: s < 0,
      segments: 8,
      name: "goldenSparkleBirthmark",
    });
  }

  const freckles = bodySurface.scatter(10, {
    rng: rng(418),
    minDist: 0.032,
    filter: (h) =>
      Math.abs(h.n.x) > 0.65 &&
      h.at.y > 0.85 &&
      h.at.z > 0.02 &&
      h.at.z < 0.28,
  });
  freckles.forEach((hit, i) => {
    const r = 0.0055 + (i % 3) * 0.0014;
    b.stick(
      new THREE.CylinderGeometry(r, r, 0.002, 7),
      i % 3 === 0 ? C.paleGold : "#ebcbbb",
      hit,
      { embed: 0.5, name: "shoulderFreckle" },
    );
  });

  return b.root;
}
