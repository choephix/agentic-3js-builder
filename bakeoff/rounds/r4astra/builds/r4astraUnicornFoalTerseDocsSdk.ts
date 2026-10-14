import * as THREE from "three";
import {
  createBuilder,
  bezier,
  catmull,
  countershade,
  frame,
  offset,
  rng,
} from "../../../../src/index";

export const meta = {
  name: "Little Daydream",
  description:
    "A pearl-coloured unicorn foal with oversized inquisitive eyes, lavender candy-floss mane, little silver-lilac hooves, and a honey-gold spiral horn.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Little Daydream", detail: 1 });

  const C = {
    ivory: "#F4ECE3",
    light: "#FFF6E7",
    shade: "#D7CCE1",
    muzzle: "#E6D3DB",
    lip: "#DBC4D0",
    rose: "#DDAFC6",
    ear: "#E8B6CA",
    earDeep: "#C990B1",
    lavender: "#A895CB",
    lilac: "#C2AFE4",
    paleLilac: "#DED0EF",
    pink: "#E4BAD8",
    aqua: "#A2D3D2",
    hoof: "#706680",
    hoofLight: "#B4A3C8",
    gold: "#BD9054",
    honey: "#F4DA98",
    star: "#DCBA78",
    ink: "#29273D",
    iris: "#438E9D",
    irisLight: "#89CED0",
    mouth: "#A6879B",
  };
  const coat = countershade(C.ivory, C.shade, {
    level: -0.45,
    soft: 0.65,
  });

  // Skeleton: a quiet, square four-footed stance, with an extended tail.
  const hips = b.joint("hips", {
    at: [0, 0.79, -0.39],
    dir: [0, 0, 1],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [hips, [0, 0.80, -0.075], [0, 0.855, 0.225]],
    {
      parent: hips,
      names: ["spine1", "withers"],
      role: "spine",
    },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.855, 0.205],
      [0, 1.035, 0.335],
      [0, 1.225, 0.475],
    ],
    {
      parent: spine.joints[1],
      names: ["neckBase", "neckMid", "neckTop"],
      role: "neck",
    },
  );
  const head = b.joint("head", {
    parent: neck.joints[2],
    at: [0, 1.245, 0.51],
    dir: [0, -0.32, 1],
    role: "head",
  });
  const H = b.region({ at: head, bone: head });
  const jaw = b.joint("jaw", {
    parent: head,
    at: H.p([0, -0.125, 0.045]),
    dir: [0, -0.15, 1],
    role: "jaw",
  });
  const J = b.region({ at: jaw, bone: jaw });

  const ears = [1, -1].map((s) => ({
    s,
    joint: b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: H.p([s * 0.108, 0.133, -0.045]),
      dir: [s * 0.24, 1, -0.09],
      role: "hinge",
    }),
  }));

  const legs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const front = b.chain(
      `foreleg${side}`,
      [
        [s * 0.18, 0.795, 0.205],
        [s * 0.224, 0.505, 0.237],
        [s * 0.245, 0.157, 0.297],
        [s * 0.245, 0.070, 0.320],
      ],
      {
        parent: spine.joints[1],
        names: [
          `shoulder${side}`,
          `elbow${side}`,
          `wrist${side}`,
          `hoofF${side}`,
        ],
        role: "leg",
        contact: [s * 0.245, 0, 0.320],
      },
    );
    const hind = b.chain(
      `hindleg${side}`,
      [
        [s * 0.175, 0.755, -0.382],
        [s * 0.229, 0.515, -0.267],
        [s * 0.249, 0.310, -0.482],
        [s * 0.258, 0.151, -0.475],
        [s * 0.258, 0.070, -0.450],
      ],
      {
        parent: hips,
        names: [
          `hip${side}`,
          `knee${side}`,
          `hock${side}`,
          `ankle${side}`,
          `hoofH${side}`,
        ],
        role: "leg",
        contact: [s * 0.258, 0, -0.450],
      },
    );
    return { s, front, hind };
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.865, -0.555],
      [0, 0.902, -0.760],
      [0.035, 0.798, -0.997],
      [0.070, 0.593, -1.225],
    ]),
    {
      parent: hips,
      count: 4,
      names: ["tail1", "tail2", "tail3", "tail4"],
      role: "tail",
    },
  );

  // A simple, softly faceted barrel and tapered neck.
  const body = b.loft(
    [
      { at: hips.local({ back: 0.145 }), w: 0.25, h: 0.30 },
      { at: hips.local({ forward: 0.035 }), w: 0.49, h: 0.475 },
      { at: spine.at(0.54), w: 0.445, h: 0.455 },
      { at: spine.at(1), w: 0.345, h: 0.405 },
    ],
    {
      bone: [hips, spine],
      color: coat,
      sides: 10,
      smooth: false,
      shift: [0, -0.023],
      caps: "round",
      name: "round_foal_barrel",
    },
  );

  const neckTube = b.sweep(
    neck,
    (t) => [
      0.151 - 0.041 * t,
      0.180 - 0.057 * t,
    ],
    {
      color: coat,
      sides: 10,
      smooth: false,
      caps: "round",
      name: "upright_foal_neck",
    },
  );

  function profile(t: number, keys: number[][]): number {
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const u = (t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]);
        return THREE.MathUtils.lerp(keys[i - 1][1], keys[i][1], u);
      }
    }
    return keys[keys.length - 1][1];
  }

  for (const { front, hind } of legs) {
    for (const [leg, isFront] of [
      [front, true],
      [hind, false],
    ] as const) {
      const keys = isFront
        ? [[0, 0.092], [0.24, 0.077], [0.47, 0.052], [0.76, 0.043], [0.9, 0.058], [1, 0.052]]
        : [[0, 0.126], [0.27, 0.093], [0.51, 0.064], [0.66, 0.053], [0.84, 0.044], [0.93, 0.057], [1, 0.051]];

      const legTube = b.sweep(leg, (t) => profile(t, keys), {
        color: coat,
        sides: 8,
        smooth: false,
        caps: "round",
        bands: [[0.82, coat], [1, C.shade]],
        name: `${leg.joints[0].name}_tapered_leg`,
      });

      const foot = leg.joints[leg.joints.length - 1];
      const hoof = b.part(
        new THREE.CylinderGeometry(0.065, 0.080, 0.110, 8, 1),
        C.hoof,
        {
          at: foot.local({ down: 0.015 }),
          bone: foot,
          scale: [1, 1, 1.22],
          flat: true,
          name: `${foot.name}_hoof`,
        },
      );
      b.part(
        new THREE.CylinderGeometry(0.063, 0.068, 0.022, 8, 1),
        C.hoofLight,
        {
          at: foot.local({ up: 0.045 }),
          bone: foot,
          scale: [1, 1, 1.16],
          flat: true,
          name: `${foot.name}_coronet`,
        },
      );

      const frontHit = b.surface(hoof).around(hoof.at).at(0, 3);
      b.stick(
        new THREE.BoxGeometry(0.026, 0.003, 0.038),
        C.hoofLight,
        frontHit,
        { embed: 0.3, name: `${foot.name}_hoof_glint` },
      );

      // A few little pointed fetlock hairs, kept above the sole.
      for (const angle of [-42, 0, 42]) {
        const root = legTube.at(0.845, angle);
        b.sweep(
          bezier(
            root,
            root.local({ down: 0.030, forward: 0.007 }),
            root.local({ down: 0.073, forward: 0.015 }),
          ),
          [0.020, 0.024, 0.002],
          {
            bone: root.bone!,
            color: C.ivory,
            sides: 5,
            smooth: false,
            caps: "point",
          },
        );
      }
    }
  }

  // The skull, upper face, and lower jaw are distinct pieces.
  const skull = b.part(new THREE.SphereGeometry(1, 12, 8), coat, {
    at: H.p([0, 0.018, 0.033]),
    bone: head,
    scale: [0.174, 0.193, 0.193],
    flat: true,
    name: "round_baby_skull",
  });
  const bridge = b.loft(
    [
      { at: H.p([0, -0.008, 0.107]), w: 0.253, h: 0.224 },
      { at: H.p([0, -0.070, 0.234]), w: 0.229, h: 0.175 },
      { at: H.p([0, -0.138, 0.338]), w: 0.224, h: 0.129 },
    ],
    {
      bone: head,
      color: coat,
      sides: 8,
      smooth: false,
      caps: "flat",
      name: "upper_jaw",
    },
  );
  const muzzle = b.part(new THREE.SphereGeometry(1, 12, 8), C.muzzle, {
    bone: head,
    at: H.p([0, -0.142, 0.373]),
    scale: [0.128, 0.066, 0.104],
    flat: true,
    name: "velvety_muzzle",
  });

  b.loft(
    [
      { at: J.p([0, 0.005, 0]), w: 0.196, h: 0.112 },
      { at: J.p([0, -0.058, 0.174]), w: 0.180, h: 0.081 },
      { at: J.p([0, -0.104, 0.302]), w: 0.205, h: 0.043 },
    ],
    {
      bone: jaw,
      color: coat,
      sides: 8,
      smooth: false,
      caps: "flat",
      name: "lower_jaw",
    },
  );
  const lowerLip = b.part(new THREE.SphereGeometry(1, 10, 6), C.lip, {
    bone: jaw,
    at: J.p([0, -0.106, 0.321]),
    scale: [0.120, 0.022, 0.099],
    flat: true,
    name: "soft_lower_lip",
  });
  const mouthPath = b.surface(lowerLip).drape(
    catmull([
      J.p([-0.098, -0.098, 0.348]),
      J.p([-0.063, -0.090, 0.397]),
      J.p([0, -0.089, 0.420]),
      J.p([0.063, -0.090, 0.397]),
      J.p([0.098, -0.098, 0.348]),
    ]),
    { lift: 0.001 },
  );
  b.sweep(mouthPath, 0.0026, {
    bone: jaw,
    color: C.mouth,
    sides: 5,
    name: "quiet_mouth_line",
  });

  // Layered eyes: dark, glassy horse eyes with a turquoise crescent.
  const skullSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const eyeHit = skullSurface.around(skull.at).at(s * 58, 5);
    const socket = b.stick(
      new THREE.SphereGeometry(0.076, 12, 8),
      C.shade,
      eyeHit,
      { scale: [1, 0.23, 1.15], embed: 0.42, name: `eyeSocket${side}` },
    );
    const socketFront = b.surface(socket).nearest(socket.local([0, 0.15, 0]));
    const sclera = b.stick(
      new THREE.SphereGeometry(0.068, 12, 8),
      C.light,
      socketFront,
      { scale: [1, 0.26, 1.15], embed: 0.38, name: `eyeRim${side}` },
    );
    const eye = b.stick(
      new THREE.SphereGeometry(0.062, 12, 8),
      C.ink,
      b.surface(sclera).nearest(sclera.local([0, 0.14, 0])),
      { scale: [1, 0.52, 1.14], embed: 0.32, name: `eye${side}` },
    );
    const iris = b.stick(
      new THREE.SphereGeometry(0.043, 12, 8),
      C.iris,
      b.surface(eye).nearest(eye.local([0, 0.14, -0.005])),
      { scale: [1, 0.23, 1.09], embed: 0.25, name: `iris${side}` },
    );
    const pupil = b.stick(
      new THREE.SphereGeometry(0.032, 10, 8),
      C.ink,
      b.surface(iris).nearest(iris.local([0, 0.10, 0.007])),
      { scale: [1, 0.23, 1.12], embed: 0.2, name: `pupil${side}` },
    );

    const eyeSurface = b.surface([eye, iris, pupil]);
    b.stick(
      new THREE.SphereGeometry(0.014, 8, 6),
      "#FFFFFF",
      eyeSurface.nearest(eye.local([-0.019, 0.12, 0.027])),
      { scale: [1, 0.26, 1.08], embed: 0.15, name: `catchlight${side}` },
    );
    b.stick(
      new THREE.SphereGeometry(0.006, 6, 4),
      C.light,
      eyeSurface.nearest(eye.local([0.021, 0.12, -0.019])),
      { scale: [1, 0.30, 1], embed: 0.1 },
    );
    b.stick(
      new THREE.SphereGeometry(0.006, 6, 4),
      C.irisLight,
      eyeSurface.nearest(eye.local([-0.005, 0.12, -0.034])),
      { scale: [1.5, 0.22, 0.65], embed: 0.2 },
    );

    b.ring(
      eye,
      { count: 3, radius: 0.063, fromDeg: -36, toDeg: 36, tilt: 18 },
      (lash) => {
        b.spike(lash, lash, 0.018, 0.0045, {
          color: C.ink,
          sides: 5,
          name: `eyelash${side}_${lash.i}`,
        });
      },
    );

    const blush = b.stick(
      new THREE.SphereGeometry(0.043, 10, 6),
      C.rose,
      skullSurface.around(skull.at).at(s * 83, -30),
      { scale: [1.12, 0.12, 0.69], embed: 0.45, name: `cheek${side}` },
    );
    for (let k = 0; k < 3; k++) {
      const hit = b.surface(blush).nearest(
        blush.local([(k - 1) * 0.016, 0.08, k === 1 ? 0.007 : 0]),
      );
      b.stick(new THREE.SphereGeometry(0.0038, 5, 4), C.light, hit, {
        scale: [1, 0.4, 1],
        embed: 0.3,
      });
    }

    const nostrilHit = b.surface(muzzle).around(muzzle.at).at(s * 39, 11);
    const nostrilRim = b.stick(
      new THREE.SphereGeometry(0.023, 8, 6),
      C.lip,
      nostrilHit,
      { scale: [0.86, 0.22, 1.15], embed: 0.4 },
    );
    b.stick(
      new THREE.SphereGeometry(0.017, 8, 6),
      C.mouth,
      b.surface(nostrilRim).nearest(nostrilRim.local([0, 0.08, 0])),
      { scale: [0.80, 0.22, 1.16], embed: 0.4, spin: -s * 22, name: `nostril${side}` },
    );
  }

  // Tall foal ears, with inset pink interiors.
  for (const { s, joint } of ears) {
    const E = b.region({ at: joint, bone: joint });
    b.extrude(
      [
        [-0.027, 0],
        [0.030, 0.002],
        [0.065, 0.104],
        [0.061, 0.190],
        [0.035, 0.252],
        [0.005, 0.215],
        [-0.025, 0.104],
      ],
      {
        at: E.p([0, 0, 0]),
        x: [s, 0, 0],
        y: [0, 1, -0.09],
        thickness: [0.058, 0.014],
        bevel: 0.006,
        color: coat,
        bone: joint,
        name: `${joint.name}_outer`,
      },
    );
    b.extrude(
      [
        [-0.012, 0.037],
        [0.026, 0.029],
        [0.049, 0.111],
        [0.045, 0.172],
        [0.033, 0.212],
        [0.012, 0.174],
        [-0.010, 0.095],
      ],
      {
        at: E.p([0, 0, 0.022]),
        x: [s, 0, 0],
        y: [0, 1, -0.09],
        thickness: 0.007,
        bevel: 0.002,
        color: C.ear,
        bone: joint,
        name: `${joint.name}_pink_inset`,
      },
    );
    b.sweep(
      bezier(
        E.p([s * 0.012, 0.055, 0.028]),
        E.p([s * 0.030, 0.107, 0.024]),
        E.p([s * 0.032, 0.165, 0.013]),
      ),
      [0.006, 0.002],
      { bone: joint, color: C.earDeep, sides: 5 },
    );
  }

  // The mane is made from chunky tapered locks, not a smooth hair shell.
  const maneBase = b.sweep(
    neckTube.line(0),
    (t) => [0.068 + 0.008 * t, 0.057],
    {
      bone: neck,
      color: C.lavender,
      sides: 8,
      smooth: false,
      caps: "round",
      name: "mane_crest",
    },
  );

  for (const s of [1, -1]) {
    const count = s > 0 ? 7 : 5;
    for (let i = 0; i < count; i++) {
      const t = 0.10 + (i / (count - 1)) * 0.88;
      const root = maneBase.at(t, s > 0 ? -38 : 38);
      const length = s > 0 ? 0.205 + 0.026 * Math.sin(i) : 0.143;
      const lock = b.sweep(
        bezier(
          root,
          root.local({ left: s * 0.125, down: 0.015, back: 0.020 }),
          root.local({ left: s * 0.180, down: length * 0.74, back: 0.030 }),
          root.local({ left: s * 0.148, down: length, forward: 0.008 }),
        ),
        [0.044, 0.064, 0.047, 0.002],
        {
          bone: neck.jointAt(t),
          color: [C.lilac, C.lavender, C.pink, C.lilac, C.aqua, C.lilac, C.paleLilac][i % 7],
          sides: 7,
          smooth: false,
          caps: "point",
          name: `mane_lock_${s > 0 ? "L" : "R"}_${i}`,
        },
      );
      if (s > 0 || i % 2 === 0) {
        b.sweep(lock.line(0, 0.001).slice(0.18, 0.82), [0.006, 0.002], {
          bone: neck.jointAt(t),
          color: i === 4 ? C.light : C.paleLilac,
          sides: 5,
          name: "carved_mane_highlight",
        });
      }
    }
  }

  b.sweep(
    bezier(
      H.p([0, 0.105, -0.125]),
      H.p([0, 0.222, -0.047]),
      H.p([0, 0.178, 0.084]),
    ),
    [0.077, 0.094, 0.055],
    {
      bone: head,
      color: C.lavender,
      sides: 8,
      smooth: false,
      name: "poll_fluff",
    },
  );

  for (const s of [1, -1]) {
    const lock = b.sweep(
      bezier(
        H.p([s * 0.045, 0.177, 0.023]),
        H.p([s * 0.115, 0.198, 0.111]),
        H.p([s * 0.125, 0.100, 0.177]),
        H.p([s * 0.073, 0.042, 0.193]),
      ),
      [0.052, 0.067, 0.042, 0.002],
      {
        bone: head,
        color: s > 0 ? C.lilac : C.pink,
        sides: 8,
        smooth: false,
        caps: "point",
        name: s > 0 ? "forelockL" : "forelockR",
      },
    );
    b.sweep(lock.line(0, 0.001).slice(0.12, 0.80), [0.0055, 0.002], {
      bone: head,
      color: C.paleLilac,
      sides: 5,
    });
  }

  // A short, tapered horn with a real raised helical ridge.
  const hornHit = skullSurface.around(skull.at).at(0, 51);
  const hornAxis = new THREE.Vector3(0, 1, 0.24).normalize();
  const hornBase = frame(offset(hornHit, hornAxis, -0.010), hornAxis);
  const horn = b.sweep(
    [hornBase, offset(hornBase, hornAxis, 0.305)],
    (t) => 0.049 * Math.pow(1 - t, 0.90),
    {
      bone: head,
      color: C.honey,
      sides: 10,
      smooth: false,
      caps: { start: "flat", end: "point" },
      name: "little_unicorn_horn",
    },
  );
  b.part(new THREE.TorusGeometry(0.047, 0.006, 5, 12), C.gold, {
    at: hornBase,
    dir: hornAxis,
    axis: "z",
    bone: head,
    name: "horn_root_ring",
  });

  const helix = Array.from({ length: 66 }, (_, i) => {
    const t = 0.045 + (i / 65) * 0.905;
    return horn.at(t, 360 * 2.7 * t, 0.0005);
  });
  b.sweep(helix, [0.006, 0.0018], {
    bone: head,
    color: C.gold,
    sides: 5,
    caps: "round",
    name: "golden_spiral",
  });

  // Flowing pony tail; the long surface ribbons share the tail chain.
  const tailTube = b.sweep(
    tail,
    (t) => profile(t, [[0, 0.049], [0.23, 0.075], [0.48, 0.112], [0.72, 0.101], [0.9, 0.059], [1, 0.002]]),
    {
      color: C.lavender,
      sides: 10,
      smooth: false,
      caps: { start: "round", end: "point" },
      name: "flowing_tail",
    },
  );
  for (let i = 0; i < 6; i++) {
    const angle = i * 60;
    b.sweep(
      tailTube.line(angle).slice(0.11 + (i % 2) * 0.045, 0.98),
      [0.023, 0.030, 0.024, 0.002],
      {
        bone: tail,
        color: [C.lilac, C.pink, C.lilac, C.aqua, C.lilac, C.paleLilac][i],
        sides: 6,
        smooth: false,
        caps: "point",
        name: `tail_ribbon_${i}`,
      },
    );
  }

  // Subtle foal dapples and a tiny constellation on each haunch.
  const bodySurface = b.surface(body);
  const dapples = bodySurface.scatter(20, {
    rng: rng(19),
    minDist: 0.055,
    filter: (hit) =>
      Math.abs(hit.n.x) > 0.64 &&
      hit.at.z < -0.10 &&
      hit.at.y > 0.755,
  });
  for (let i = 0; i < dapples.length; i++) {
    b.stick(
      new THREE.CylinderGeometry(0.009 + (i % 3) * 0.003, 0.009 + (i % 3) * 0.003, 0.002, 7),
      i % 3 === 0 ? C.paleLilac : C.light,
      dapples[i],
      { embed: 0.5, name: "soft_foal_dapple" },
    );
  }

  function starGeometry(radius: number): THREE.ExtrudeGeometry {
    const shape = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 === 0 ? radius : radius * 0.43;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.002,
      bevelEnabled: false,
      steps: 1,
      curveSegments: 1,
    });
    geo.rotateX(-Math.PI / 2);
    return geo;
  }

  for (const s of [1, -1]) {
    const placements = [
      [0.865, -0.326, 0.030],
      [0.922, -0.255, 0.014],
      [0.827, -0.232, 0.011],
    ];
    for (let i = 0; i < placements.length; i++) {
      const [y, z, r] = placements[i];
      const hit = bodySurface.nearest([s * 0.5, y, z]);
      b.stick(starGeometry(r), C.star, hit, {
        embed: 0.5,
        spin: s * (i * 13 - 9),
        name: `haunch_star_${s > 0 ? "L" : "R"}_${i}`,
      });
    }
  }

  // A tiny pale diamond below the horn finishes the forehead.
  const forehead = b.surface([skull, bridge]).nearest(H.p([0, 0.045, 0.24]));
  b.stick(starGeometry(0.022), C.light, forehead, {
    scale: [0.78, 1, 1.15],
    embed: 0.5,
    name: "forehead_star",
  });

  return b.root;
}
