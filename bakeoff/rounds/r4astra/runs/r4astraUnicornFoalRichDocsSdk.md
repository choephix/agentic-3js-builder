```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  frame,
  countershade,
  mottle,
  gradient,
  paint,
  rng,
} from "agentic-3js-builder";

export const meta = {
  name: "Dewdrop, the newborn unicorn",
  description:
    "A pearly, long-legged unicorn foal with cotton-candy curls, a little twisted gold horn, silver hooves, enormous dark eyes, and a necklace of freshly threaded daisies.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Dewdrop", detail: 1, paintSize: 2048 });

  const C = {
    ivory: "#fffaf2",
    pearl: "#eee5f4",
    lilac: "#d6c8e6",
    pink: "#efb9cf",
    pinkLight: "#ffe0e9",
    mint: "#bde5d6",
    mintLight: "#e0f6e7",
    lavender: "#c2afe3",
    lavenderLight: "#e5d9fa",
    socket: "#c2accb",
    eye: "#231e32",
    lash: "#35283f",
    blush: "#efd1df",
    mouth: "#9c809e",
    nostril: "#78677f",
    gold: "#d9a63f",
    goldLight: "#ffe7a3",
    goldDark: "#b98235",
    silver: "#bcc4d6",
    silverLight: "#edf0f7",
    sole: "#81859e",
    stem: "#6e9e83",
    leaf: "#94bca0",
    leafLight: "#bad8b1",
    petal: "#fff9e8",
    petalShade: "#f1e7e9",
    pollen: "#edbb4c",
    pollenDark: "#b88637",
  };

  const coat = countershade(
    mottle(C.ivory, C.pearl, { size: 0.15, contrast: 0.32, seed: 18 }),
    C.lilac,
    { level: -0.48, soft: 0.8 },
  );

  // Skeleton: a broad, slightly uncertain stance, with all four feet planted.
  const hips = b.joint("hips", {
    at: [0, 0.86, -0.34],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    [hips, [0, 0.838, -0.055], [0, 0.87, 0.25]],
    {
      parent: hips,
      names: ["lumbar", "spine", "chest"],
      role: "spine",
    },
  );
  const chest = spine.joints[spine.joints.length - 1];

  const neck = b.chain(
    "neck",
    catmull([
      chest.local({ forward: 0.045 }),
      [0, 1.045, 0.36],
      [0, 1.245, 0.46],
    ]),
    {
      parent: chest,
      names: ["neck1", "neck2", "poll"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck,
    at: neck.at(1).local({ up: 0.04, forward: 0.07 }),
    dir: [0, -0.19, 1],
    role: "head",
  });
  const face = b.region({ at: head, bone: head });
  const P = (x: number, y: number, z: number) => face.p([x, y, z]);

  const jaw = b.joint("jaw", {
    parent: head,
    at: P(0, -0.12, -0.025),
    dir: [0, -0.27, 1],
    role: "jaw",
  });

  const ears = [1, -1].map((s) => ({
    s,
    joint: b.joint(`ear${s > 0 ? "L" : "R"}`, {
      parent: head,
      at: P(s * 0.112, 0.17, -0.04),
      dir: [s * 0.18, 1, -0.17],
      role: "hinge",
    }),
  }));

  const legs = [1, -1].flatMap((s) => {
    const side = s > 0 ? "L" : "R";
    const fx = s * (s > 0 ? 0.247 : 0.259);
    const fz = s > 0 ? 0.414 : 0.376;
    const hx = s * (s > 0 ? 0.269 : 0.278);
    const hz = s > 0 ? -0.434 : -0.405;

    const front = b.chain(
      `foreleg${side}`,
      [
        chest.local({ left: s * 0.155, down: 0.008, forward: 0.04 }),
        [s * 0.176, 0.642, 0.245],
        [s * (s > 0 ? 0.186 : 0.219), 0.362, 0.326],
        [fx * 0.97, 0.147, fz - 0.036],
        [fx, 0.09, fz],
      ],
      {
        parent: chest,
        names: [
          `shoulder${side}`,
          `elbow${side}`,
          `kneeF${side}`,
          `fetlockF${side}`,
          `hoofF${side}`,
        ],
        role: "leg",
        contact: [fx, 0, fz],
      },
    );

    const hind = b.chain(
      `hindleg${side}`,
      [
        hips.local({ left: s * 0.152, back: 0.012 }),
        [s * 0.193, 0.572, -0.225],
        [s * 0.219, 0.289, -0.447],
        [hx * 0.97, 0.148, hz - 0.025],
        [hx, 0.09, hz],
      ],
      {
        parent: hips,
        names: [
          `hip${side}`,
          `kneeH${side}`,
          `hock${side}`,
          `fetlockH${side}`,
          `hoofH${side}`,
        ],
        role: "leg",
        contact: [hx, 0, hz],
      },
    );

    return [
      { chain: front, front: true, side },
      { chain: hind, front: false, side },
    ];
  });

  const tail = b.chain(
    "tail",
    catmull([
      hips.local({ up: 0.035, back: 0.15 }),
      [0.014, 0.931, -0.64],
      [0.027, 0.839, -0.79],
      [0.02, 0.725, -0.875],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tailTip"],
      role: "tail",
    },
  );

  // Simple faceted volumes carry the silhouette.
  const body = b.loft(
    [
      { at: hips.local({ back: 0.18 }), w: 0.085, h: 0.15 },
      { at: hips.local({ back: 0.025 }), w: 0.378, h: 0.43 },
      { at: hips.local({ forward: 0.275, down: 0.025 }), w: 0.432, h: 0.438 },
      { at: chest, w: 0.389, h: 0.452 },
      { at: chest.local({ forward: 0.142 }), w: 0.174, h: 0.255 },
      { at: chest.local({ forward: 0.18 }), w: 0.07, h: 0.125 },
    ],
    {
      bone: [hips, spine],
      color: coat,
      sides: 10,
      smooth: false,
      caps: "round",
      name: "soft pearly barrel",
    },
  );

  const neckTube = b.sweep(
    neck,
    (t) => [
      0.143 - 0.062 * t,
      0.169 - 0.052 * t,
    ],
    {
      color: coat,
      sides: 10,
      smooth: false,
      caps: "flat",
      name: "upright baby neck",
    },
  );

  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), coat, {
    bone: head,
    at: head,
    scale: [0.184, 0.225, 0.193],
    flat: true,
    name: "oversized foal forehead",
  });

  const muzzle = b.loft(
    [
      { at: P(0, -0.045, 0.035), w: 0.284, h: 0.264 },
      { at: P(0, -0.101, 0.183), w: 0.245, h: 0.202 },
      { at: P(0, -0.171, 0.319), w: 0.218, h: 0.147 },
      { at: P(0, -0.17, 0.374), w: 0.224, h: 0.14 },
    ],
    {
      bone: head,
      color: gradient(coat, "#eee0e7", P(0, 0, 0.235), P(0, 0, 0.44)),
      sides: 10,
      smooth: false,
      caps: "round",
      name: "short velvet upper muzzle",
    },
  );

  b.loft(
    [
      { at: P(0, -0.13, 0), w: 0.209, h: 0.145 },
      { at: P(0, -0.19, 0.15), w: 0.196, h: 0.125 },
      { at: P(0, -0.277, 0.324), w: 0.198, h: 0.061 },
      { at: P(0, -0.28, 0.365), w: 0.18, h: 0.063 },
    ],
    {
      bone: jaw,
      color: coat,
      sides: 8,
      smooth: false,
      caps: "round",
      name: "separate little lower jaw",
    },
  );

  b.part(new THREE.SphereGeometry(1, 8, 4), C.mouth, {
    bone: jaw,
    at: P(0, -0.244, 0.325),
    scale: [0.079, 0.007, 0.065],
    name: "mouth interior",
  });

  // Radius keys put small joints in the long, delicate cannon bones.
  const keyed = (t: number, keys: number[][]) => {
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const u = (t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]);
        return THREE.MathUtils.lerp(keys[i - 1][1], keys[i][1], u);
      }
    }
    return keys[keys.length - 1][1];
  };

  for (const leg of legs) {
    const ts = leg.chain.ts;
    const radii = [
      [0, leg.front ? 0.078 : 0.1],
      [ts[1] * 0.58, leg.front ? 0.065 : 0.087],
      [ts[1], leg.front ? 0.052 : 0.064],
      [(ts[1] + ts[2]) * 0.5, 0.035],
      [ts[2], 0.044],
      [(ts[2] + ts[3]) * 0.5, 0.029],
      [ts[3], 0.037],
      [1, 0.035],
    ];

    b.sweep(
      leg.chain,
      (t) => {
        const r = keyed(t, radii);
        return [r, r * (leg.front ? 0.94 : 1.04)];
      },
      {
        color: coat,
        sides: 8,
        smooth: false,
        caps: "round",
        name: `${leg.front ? "front" : "hind"} slender leg ${leg.side}`,
      },
    );

    const hoofBone = leg.chain.joints[leg.chain.joints.length - 1];

    b.part(new THREE.CylinderGeometry(0.055, 0.054, 0.01, 8), C.sole, {
      bone: hoofBone,
      at: hoofBone.local({ down: 0.085 }),
      scale: [1, 1, 1.18],
      name: "flat hoof sole",
    });

    const hoof = b.part(
      new THREE.CylinderGeometry(0.039, 0.0555, 0.078, 8),
      C.silver,
      {
        bone: hoofBone,
        at: hoofBone.local({ down: 0.042 }),
        scale: [1, 1, 1.18],
        flat: true,
        name: "little silver hoof",
      },
    );

    b.part(new THREE.CylinderGeometry(0.035, 0.044, 0.027, 8), coat, {
      bone: hoofBone,
      at: hoofBone.local({ up: 0.003 }),
      scale: [1, 1, 1.12],
      name: "soft coronet",
    });

    const shine = b.surface(hoof).around(hoof.at).at(18, 0);
    b.stick(new THREE.BoxGeometry(0.012, 0.0025, 0.032), C.silverLight, shine, {
      embed: 0.45,
      spin: -12,
      name: "silver hoof glint",
    });
  }

  // Upright, slightly oversized ears, with painted pink inner leaves.
  const earCoat = paint((_p, n, uv) => {
    const v = (uv[1] - 0.031) / 0.19;
    if (n.z > 0.3 && v > 0 && v < 1) {
      const width = 0.026 * Math.pow(Math.sin(Math.PI * v), 0.7);
      const distance = Math.abs(uv[0] - 0.034 * v);
      if (distance < width) {
        return distance < width * 0.27 ? "#e9b6ce" : "#f4d0dc";
      }
    }
    return coat;
  });

  for (const { s, joint } of ears) {
    const k = s > 0 ? 1 : 0.965;
    b.extrude(
      [
        [-0.04, 0],
        [0.033, 0.004],
        [0.062, 0.121 * k],
        [0.045, 0.244 * k, "sharp"],
        [0.007, 0.216 * k],
        [-0.039, 0.106],
      ],
      {
        at: joint,
        bone: joint,
        x: [s, 0, 0],
        y: [0, 1, -0.17],
        thickness: [0.034, 0.012],
        bevel: 0.004,
        smoothing: 1,
        detail: 0.6,
        color: earCoat,
        name: "soft pointed ear",
      },
    );
  }

  // Dark glassy eyes, rosy cheek patches, and individually swept eyelashes.
  const skullSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeHit = skullSurface.around(head.at).at(s * 54, 5);
    const socket = b.stick(
      new THREE.SphereGeometry(1, 12, 8),
      C.socket,
      eyeHit,
      {
        scale: [0.077, 0.014, 0.084],
        embed: 0.45,
        name: "lilac eye socket",
      },
    );

    const eyeSeat = b.surface(socket).around(socket.at).at(s * 54, 5);
    const eye = b.stick(
      new THREE.SphereGeometry(1, 12, 8),
      C.eye,
      eyeSeat,
      {
        scale: [0.067, 0.028, 0.073],
        embed: 0.4,
        name: "big dark foal eye",
      },
    );
    const eyeSurface = b.surface(eye);

    const largeGlint = eyeSurface.nearest(eye.local([-0.021, 0.07, 0.029]));
    b.stick(new THREE.SphereGeometry(1, 8, 6), C.ivory, largeGlint, {
      scale: [0.015, 0.0045, 0.019],
      embed: 0.4,
      name: "large eye reflection",
    });
    const smallGlint = eyeSurface.nearest(eye.local([0.027, 0.065, -0.022]));
    b.stick(new THREE.SphereGeometry(1, 6, 4), C.mintLight, smallGlint, {
      scale: [0.006, 0.003, 0.007],
      embed: 0.45,
      name: "small eye reflection",
    });

    b.ring(
      eye,
      { count: 4, radius: 0.065, fromDeg: -62, toDeg: 62 },
      (lash) => {
        const base = eyeSurface.nearest(
          lash.at.clone().addScaledVector(eye.axis, 0.045),
        );
        const length = 0.038 + (1 - Math.abs(lash.t - 0.5) * 2) * 0.012;
        const middle = base.at
          .clone()
          .addScaledVector(lash.outward, length * 0.52)
          .addScaledVector(eye.axis, 0.016);
        const tip = base.at
          .clone()
          .addScaledVector(lash.outward, length)
          .addScaledVector(eye.axis, 0.021);
        b.sweep(bezier(base, middle, tip), [0.0052, 0], {
          bone: head,
          color: C.lash,
          sides: 5,
          caps: { start: "round", end: "point" },
          name: "long curled eyelash",
        });
      },
    );

    const cheekHit = skullSurface.around(head.at).at(s * 67, -24);
    const cheek = b.stick(
      new THREE.SphereGeometry(1, 10, 6),
      C.blush,
      cheekHit,
      {
        scale: [0.032, 0.0028, 0.021],
        embed: 0.6,
        name: "soft rosy cheek",
      },
    );
    const cheekSurface = b.surface(cheek);
    for (const dx of [-0.012, 0.003, 0.016]) {
      const freckle = cheekSurface.nearest(cheek.local([dx, 0.02, 0.002]));
      b.stick(new THREE.SphereGeometry(0.0032, 6, 4), C.ivory, freckle, {
        embed: 0.55,
        name: "pearl cheek freckle",
      });
    }
  }

  const muzzleSurface = b.surface(muzzle);
  for (const s of [1, -1]) {
    const hit = muzzleSurface.around(P(0, -0.15, 0.30)).at(s * 48, 8);
    const rim = b.stick(new THREE.SphereGeometry(1, 8, 6), "#d0b9cc", hit, {
      scale: [0.027, 0.005, 0.019],
      spin: s * 24,
      embed: 0.6,
      name: "nostril rim",
    });
    const inner = b.surface(rim).nearest(
      rim.at.clone().addScaledVector(rim.axis, 0.04),
    );
    b.stick(new THREE.SphereGeometry(1, 8, 6), C.nostril, inner, {
      scale: [0.019, 0.003, 0.011],
      spin: s * 24,
      embed: 0.55,
      name: "tiny velvet nostril",
    });

    const mouthLine = muzzleSurface.drape(
      catmull([
        P(s * 0.103, -0.212, 0.249),
        P(s * 0.108, -0.227, 0.345),
        P(s * 0.066, -0.231, 0.424),
      ]),
      { lift: 0.0015 },
    );
    b.sweep(mouthLine, 0.0025, {
      bone: head,
      color: C.mouth,
      sides: 5,
      name: "delicate mouth corner",
    });
  }

  // Short, scalloped cotton-candy mane, not an adult horse's long curtain.
  const maneColors = [
    C.mint, C.mint, C.lavender, C.lavender,
    C.lavender, C.pink, C.pink, C.pink,
  ];
  const maneLights = [
    C.mintLight, C.mintLight, C.lavenderLight, C.lavenderLight,
    C.lavenderLight, C.pinkLight, C.pinkLight, C.pinkLight,
  ];

  let maneIndex = 0;
  b.along(
    neckTube,
    8,
    (root) => {
      const i = maneIndex++;
      const curl = b.sweep(
        bezier(
          root.moved([0, -0.012, 0]),
          root.moved([0, 0.094, 0.025]),
          root.moved([0.01, 0.099, -0.045]),
        ),
        [0.034, 0.054, 0.04, 0],
        {
          color: maneColors[i],
          sides: 8,
          smooth: false,
          caps: { start: "round", end: "point" },
          name: "fluffy mane curl",
        },
      );
      b.sweep(curl.line(0).slice(0.23, 0.78), [0.004, 0.002], {
        color: maneLights[i],
        sides: 5,
        name: "mane curl highlight",
      });
    },
    { from: 0.08, to: 0.98 },
  );

  const forelocks = [
    { x: -0.055, endX: -0.064, color: C.lavender, light: C.lavenderLight, drop: 0.079 },
    { x: 0.025, endX: 0.079, color: C.pink, light: C.pinkLight, drop: 0.103 },
    { x: 0.09, endX: 0.125, color: C.mint, light: C.mintLight, drop: 0.075 },
  ];
  for (const lock of forelocks) {
    const curl = b.sweep(
      catmull([
        P(lock.x, 0.169, -0.051),
        P(lock.x, 0.24, 0.016),
        P(lock.endX, 0.197, 0.117),
        P(lock.endX, lock.drop, 0.181),
      ]),
      [0.027, 0.048, 0.035, 0],
      {
        bone: head,
        color: lock.color,
        sides: 8,
        smooth: false,
        caps: { start: "round", end: "point" },
        name: "tousled baby forelock",
      },
    );
    b.sweep(curl.line(0).slice(0.2, 0.79), [0.0035, 0.0015], {
      bone: head,
      color: lock.light,
      sides: 5,
      name: "forelock highlight",
    });
  }

  // A tiny gold cone with a genuine raised, tapering spiral.
  const hornSeat = skullSurface.around(head.at).at(0, 56);
  const horn = b.sprout(
    "goldenHorn",
    hornSeat,
    hornSeat.local([0, 0.184, 0]),
    [0.0325, 0],
    {
      count: 0,
      color: C.gold,
      sides: 9,
      smooth: false,
      caps: { start: "flat", end: "point" },
      name: "small gold horn",
    },
  ).sweep;

  const spiralPoints = Array.from({ length: 51 }, (_, i) => {
    const t = 0.035 + (i / 50) * 0.925;
    return horn.at(t, 1035 * t);
  });
  b.sweep(catmull(spiralPoints), [0.0045, 0.0018], {
    bone: head,
    color: C.goldLight,
    sides: 5,
    caps: "round",
    name: "raised golden spiral",
  });

  const hornRing = b.ring(frame(hornSeat, hornSeat.n), {
    count: 12,
    radius: 0.0315,
  });
  b.sweep(catmull(hornRing.items, { closed: true }), 0.0048, {
    bone: head,
    color: C.goldDark,
    sides: 6,
    name: "horn root rim",
  });

  // A short, freely extended fluffy tail, divided into three pastel locks.
  const tailCore = b.sweep(tail, [0.044, 0.072, 0.077, 0.054, 0], {
    color: C.lavender,
    bands: [[0.16, C.pearl], [1, C.lavender]],
    sides: 8,
    smooth: false,
    name: "fluffy tail core",
  });

  for (const strand of [
    { s: -1, color: C.pink, light: C.pinkLight, dy: 0.018 },
    { s: 0, color: C.lavender, light: C.lavenderLight, dy: 0.055 },
    { s: 1, color: C.mint, light: C.mintLight, dy: -0.01 },
  ]) {
    const curl = b.sweep(
      catmull([
        tail.at(0.09).moved({ left: strand.s * 0.012, up: strand.dy * 0.4 }),
        tail.at(0.4).moved({ left: strand.s * 0.043, up: strand.dy }),
        tail.at(0.72).moved({ left: strand.s * 0.052, up: strand.dy }),
        tail.at(1).moved({ left: strand.s * 0.041, down: 0.024 - strand.dy }),
      ]),
      [0.025, 0.046, 0.041, 0],
      {
        bone: tail,
        color: strand.color,
        sides: 8,
        smooth: false,
        name: "pastel tail lock",
      },
    );
    b.sweep(curl.line(0).slice(0.24, 0.83), [0.004, 0.0018], {
      bone: tail,
      color: strand.light,
      sides: 5,
      name: "tail lock highlight",
    });
  }
  b.sweep(tailCore.line(150).slice(0.22, 0.78), 0.003, {
    color: C.lavenderLight,
    sides: 5,
    name: "underside tail curl",
  });

  // A low, tilted loop hangs from the nape down onto the chest.
  const neckSurface = b.surface([body, neckTube]);
  const roughNecklace = catmull(
    Array.from({ length: 20 }, (_, i) => {
      const a = (i / 20) * Math.PI * 2;
      return [
        0.19 * Math.sin(a),
        0.984 - 0.149 * Math.cos(a),
        0.339 + 0.183 * Math.cos(a),
      ];
    }),
    { closed: true },
  );
  const necklace = neckSurface.drape(roughNecklace, { lift: 0.006 });
  b.sweep(necklace, 0.006, {
    color: C.stem,
    sides: 6,
    name: "threaded daisy stems",
  });

  let flowerIndex = 0;
  b.along(necklace, 12, (at) => {
    const i = flowerIndex++;
    const skin = neckSurface.nearest(at);
    const flower = skin.moved([0, 0.011, 0]);

    b.ring(
      flower,
      { count: 8, radius: 0.021, fromDeg: i * 13, toDeg: 360 + i * 13 },
      (petal) => {
        b.part(
          new THREE.SphereGeometry(1, 6, 4),
          petal.i % 3 === 0 ? C.petalShade : C.petal,
          {
            frame: petal,
            scale: [0.0095, 0.0185, 0.0048],
            flat: true,
            name: "individual daisy petal",
          },
        );
      },
    );

    const center = b.stick(
      new THREE.SphereGeometry(1, 8, 5),
      C.pollen,
      flower,
      {
        scale: [0.014, 0.009, 0.014],
        embed: 0.2,
        name: "golden daisy heart",
      },
    );
    const seeds = b.surface(center).scatter(4, {
      rng: rng(810 + i),
      minDist: 0.006,
      filter: (h) => h.n.dot(flower.axis) > 0.3,
    });
    for (const seed of seeds) {
      b.stick(new THREE.SphereGeometry(0.0019, 5, 3), C.pollenDark, seed, {
        embed: 0.6,
        name: "daisy pollen stipple",
      });
    }

    if (i % 2 === 0) {
      const side = i % 4 === 0 ? 1 : -1;
      b.slab(
        [
          flower.moved([side * 0.019, -0.004, -0.009]),
          flower.moved([side * 0.035, -0.003, -0.003]),
          flower.moved([side * 0.059, -0.004, -0.017]),
          flower.moved([side * 0.038, -0.003, -0.023]),
        ],
        {
          thickness: 0.003,
          color: i % 4 === 0 ? C.leaf : C.leafLight,
          name: "tiny daisy-chain leaf",
        },
      );
    }
  });

  // Shared materials keep the primitive palette coherent, with only the
  // eyes, hooves and horn polished against the soft coat and cottony hair.
  const root = b.root;
  const treated = new Set<THREE.Material>();
  const golds = new Set([C.gold, C.goldLight, C.goldDark].map((c) => c.slice(1)));
  const silvers = new Set([C.silver, C.silverLight, C.sole].map((c) => c.slice(1)));

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!(material instanceof THREE.MeshStandardMaterial) || treated.has(material)) continue;
      treated.add(material);
      const hex = material.color.getHexString();

      if (golds.has(hex)) {
        material.metalness = 0.57;
        material.roughness = 0.31;
      } else if (silvers.has(hex)) {
        material.metalness = 0.58;
        material.roughness = 0.3;
      } else if (hex === C.eye.slice(1)) {
        material.metalness = 0.06;
        material.roughness = 0.16;
      } else if (material.map) {
        material.metalness = 0.08;
        material.roughness = 0.49;
      }
    }
  });

  return root;
}
```