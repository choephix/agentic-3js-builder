import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  rng,
  paint,
  mix,
  noise,
  type Chain,
  type Joint,
  type Fill,
} from "../../../../src/index";

export const meta = {
  name: "Jade — Veiled Chameleon",
  description:
    "A jewel-coloured, faceted chameleon with a high casque, independently rigged turret eyes, articulated split-toed feet, a sawtooth dorsal crest, and a long spiral tail.",
};

export default function (): THREE.Object3D {
  const b = createBuilder({
    name: "JadeChameleon",
    detail: 0.8,
    paintSize: 2048,
  });
  const random = rng(2718);

  type P = [number, number, number];

  const C = {
    leaf: "#689f43",
    lime: "#a3bd54",
    jade: "#368f69",
    turquoise: "#50b9a3",
    deep: "#24594a",
    belly: "#c2d490",
    gold: "#ddc66d",
    goldLight: "#eee0a0",
    ochre: "#bc963f",
    orange: "#cf7942",
    mint: "#80c8a5",
    mouth: "#233c32",
    pupil: "#102923",
    iris: "#dca34d",
    glint: "#fff5d7",
    claw: "#eadfb2",
  };

  // ---------------------------------------------------------------------------
  // Skeleton: all appendages are authored before their geometry.
  // ---------------------------------------------------------------------------

  const pelvis = b.joint("pelvis", {
    at: [0, 0.175, -0.087],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    [
      [0, 0.175, -0.108],
      [0, 0.19, -0.022],
      [0, 0.201, 0.085],
    ],
    {
      parent: pelvis,
      names: ["spine1", "spine2", "chest"],
      role: "spine",
      up: [0, 1, 0],
    },
  );

  const neck = b.chain(
    "neck",
    [
      [0, 0.201, 0.083],
      [0, 0.214, 0.112],
      [0, 0.235, 0.145],
    ],
    {
      parent: "chest",
      names: ["neck1", "neck2"],
      role: "neck",
      up: [0, 1, 0],
    },
  );

  const head = b.joint("head", {
    at: [0, 0.235, 0.145],
    parent: neck,
    dir: [0, 0, 1],
    up: [0, 1, 0],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    at: [0, 0.214, 0.105],
    parent: head,
    dir: [0, 0, 1],
    up: [0, 1, 0],
    role: "jaw",
  });

  const eyes = [1, -1].map((sign) => {
    const side = sign === 1 ? "L" : "R";
    const gaze: P = [sign * 0.91, 0.055, 0.41];
    return {
      sign,
      side,
      gaze,
      joint: b.joint(`eye${side}`, {
        at: [sign * 0.025, 0.251, 0.174],
        parent: head,
        dir: gaze,
        up: [0, 1, 0],
        role: "head",
      }),
    };
  });

  const tailPath = catmull([
    [0, 0.167, -0.117],
    [0, 0.153, -0.167],
    [0, 0.117, -0.218],
    [0, 0.104, -0.283],
    [0, 0.124, -0.35],
    [0, 0.179, -0.379],
    [0, 0.228, -0.352],
    [0, 0.239, -0.307],
    [0, 0.213, -0.279],
    [0, 0.179, -0.288],
    [0, 0.171, -0.314],
    [0, 0.188, -0.327],
    [0, 0.201, -0.316],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: pelvis,
    count: 15,
    role: "tail",
    up: [0, 1, 0],
  });

  type Digit = { chain: Chain; points: P[]; name: string };
  type Leg = {
    front: boolean;
    sign: number;
    side: string;
    chain: Chain;
    points: P[];
    palm: P;
    digits: Digit[];
  };

  const legs: Leg[] = [];
  for (const front of [true, false]) {
    for (const sign of [1, -1]) {
      const side = sign === 1 ? "L" : "R";
      const points: P[] = front
        ? [
            [sign * 0.029, 0.187, 0.071],
            [sign * 0.084, 0.111, 0.099],
            [sign * 0.109, 0.026, 0.11],
            [sign * 0.116, 0.01, 0.121],
          ]
        : [
            [sign * 0.029, 0.173, -0.087],
            [sign * 0.083, 0.104, -0.13],
            [sign * 0.109, 0.025, -0.109],
            [sign * 0.116, 0.01, -0.102],
          ];

      const names = front
        ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`]
        : [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`];

      const chain = b.chain(front ? `foreleg${side}` : `hindleg${side}`, points, {
        parent: front ? "chest" : pelvis,
        names,
        role: "leg",
        up: [0, 0, 1],
        contact: [points[3][0], 0, points[3][2]],
      });

      const palm = points[3];
      const digits: Digit[] = [];

      // Opposed, separated groups of three and two toes; hind feet reverse them.
      for (let i = 0; i < 5; i++) {
        const triple = i < 3;
        const fanSign = sign * (triple ? -1 : 1) * (front ? 1 : -1);
        const dz = triple ? [-0.013, 0.002, 0.017][i] : [-0.008, 0.01][i - 3];
        const reach = triple ? [0.024, 0.029, 0.026][i] : [0.025, 0.027][i - 3];
        const digitPoints: P[] = [
          [palm[0] + fanSign * 0.003, 0.01, palm[2] + dz * 0.2],
          [palm[0] + fanSign * reach * 0.57, 0.006, palm[2] + dz * 0.68],
          [palm[0] + fanSign * reach, 0.003, palm[2] + dz],
        ];
        const name = `${front ? "finger" : "toe"}${i + 1}${side}`;
        const digitChain = b.chain(name, digitPoints, {
          parent: chain.tip!,
          names: [`${name}_base`, `${name}_tip`],
          role: "digit",
          up: [0, 1, 0],
        });
        digits.push({ chain: digitChain, points: digitPoints, name });
      }
      legs.push({ front, sign, side, chain, points, palm, digits });
    }
  }

  // ---------------------------------------------------------------------------
  // Restrained painted skin: large graphic bars and a fine stippled scale grain.
  // ---------------------------------------------------------------------------

  function bodyTone(p: THREE.Vector3): string {
    if (p.y < 0.141) return C.belly;
    if (p.y > 0.242) return C.lime;
    const z = p.z + (p.y - 0.19) * 0.29 + 0.003 * Math.sin(p.y * 173);
    const stripeDistance = Math.min(Math.abs(z + 0.063), Math.abs(z - 0.029));
    if (stripeDistance < 0.013) return C.turquoise;
    if (stripeDistance < 0.019) return C.gold;
    return p.y < 0.178 ? C.jade : C.leaf;
  }

  const bodyPaint = paint((p) => {
    const base = bodyTone(p);
    const speckle = noise(p, 0.0042, 19);
    return mix(
      base,
      speckle > 0.55 ? C.goldLight : C.deep,
      speckle > 0.55 ? (speckle - 0.55) * 0.29 : (0.55 - speckle) * 0.33,
    );
  });

  const headPaint = paint((p) => {
    const base = p.y > 0.275 ? C.lime : p.y < 0.235 ? C.jade : C.leaf;
    return mix(base, C.deep, noise(p, 0.004, 31) * 0.14);
  });

  const limbPaint = paint((p) => {
    let base = p.y > 0.112 ? C.leaf : C.turquoise;
    if (Math.abs(p.y - 0.076) < 0.005 || Math.abs(p.y - 0.139) < 0.005) {
      base = C.jade;
    }
    return mix(base, C.deep, noise(p, 0.005, 7) * 0.16);
  });

  const tailPaint = paint((p, _n, s) => {
    const t = s[0];
    const phase = (t * 11.5 + 0.08) % 1;
    const base = mix(C.leaf, C.jade, Math.min(1, t * 2));
    const ring = phase > 0.4 && phase < 0.62;
    return mix(ring ? C.lime : base, C.deep, noise(p, 0.0045, 44) * 0.15);
  });

  const eyePaint = paint((p) =>
    mix(C.lime, C.jade, 0.15 + noise(p, 0.0034, 28) * 0.4),
  );

  const sphere = new THREE.SphereGeometry(1, 10, 6);
  const pebble = new THREE.IcosahedronGeometry(1, 0);

  function ellipsoid(
    name: string,
    at: P,
    scale: P,
    color: Fill,
    bone: Joint | string,
  ) {
    return b.part(sphere, color, { name, at, scale, bone, flat: true });
  }

  // ---------------------------------------------------------------------------
  // Torso, neck, and the open, readable spiral tail.
  // ---------------------------------------------------------------------------

  const torso = b.loft(
    [
      { at: [0, 0.164, -0.127], w: 0.022, h: 0.036 },
      { at: [0, 0.176, -0.101], w: 0.054, h: 0.085 },
      { at: [0, 0.19, -0.061], w: 0.083, h: 0.125 },
      { at: [0, 0.193, 0.01], w: 0.089, h: 0.135 },
      { at: [0, 0.202, 0.063], w: 0.08, h: 0.12 },
      { at: [0, 0.21, 0.102], w: 0.042, h: 0.073 },
    ],
    {
      name: "deepLeafTorso",
      color: bodyPaint,
      bone: spine,
      sides: 10,
      smooth: false,
      caps: "round",
      up: [0, 1, 0],
    },
  );

  b.sweep(neck, [0.027, 0.03, 0.024], {
    name: "throatAndNeck",
    color: headPaint,
    sides: 8,
    smooth: false,
    sectors: [[125, 235, C.belly]],
  });

  const tailSkin = b.sweep(tail, (t) => 0.017 * Math.pow(1 - t, 1.15) + 0.0013, {
    name: "prehensileSpiral",
    color: tailPaint,
    sides: 9,
    smooth: false,
    caps: "round",
  });

  // A fine dorsal comb continues onto the first section of the tail.
  for (let i = 0; i < 12; i++) {
    const t = 0.025 + i * 0.023;
    const h = 0.0054 * (1 - t * 2);
    b.stick(new THREE.ConeGeometry(0.0022, h, 4), C.lime, tailSkin.at(t, 0), {
      name: `tailComb${i + 1}`,
      embed: 0.3,
      flat: true,
    });
  }

  // ---------------------------------------------------------------------------
  // Long angular legs, broad grounded palms, opposable articulated digits.
  // ---------------------------------------------------------------------------

  for (const leg of legs) {
    b.sweep(
      leg.chain,
      leg.front ? [0.0125, 0.012, 0.0077, 0.0068] : [0.016, 0.013, 0.008, 0.007],
      {
        name: `${leg.front ? "fore" : "hind"}LegSkin${leg.side}`,
        color: limbPaint,
        sides: 8,
        smooth: false,
        caps: "round",
      },
    );

    const knee = leg.points[1];
    ellipsoid(
      `jointPad${leg.front ? "F" : "H"}${leg.side}`,
      knee,
      [0.012, 0.013, 0.012],
      C.leaf,
      leg.chain.joints[1],
    );

    ellipsoid(
      `splitPalm${leg.front ? "F" : "H"}${leg.side}`,
      leg.palm,
      [0.009, 0.01, 0.012],
      C.leaf,
      leg.chain.tip!,
    );

    for (const digit of leg.digits) {
      b.sweep(digit.chain, (t) => [0.0039 - t * 0.0013, 0.0031 - t * 0.0006], {
        name: `${digit.name}_skin`,
        color: C.mint,
        sides: 6,
        smooth: false,
        caps: "round",
      });

      const a = new THREE.Vector3(...digit.points[1]);
      const tip = new THREE.Vector3(...digit.points[2]);
      const forward = tip.clone().sub(a).setY(0).normalize();
      const clawMiddle = tip.clone().addScaledVector(forward, 0.003);
      clawMiddle.y = 0.0034;
      const clawTip = tip.clone().addScaledVector(forward, 0.0064);
      clawTip.y = 0.0005;
      b.sweep(catmull([tip, clawMiddle, clawTip]), [0.0019, 0.0015, 0], {
        name: `${digit.name}_claw`,
        color: C.claw,
        bone: digit.chain.joints[1],
        sides: 5,
        smooth: false,
        caps: { start: "flat", end: "point" },
      });

      const knuckleFrame = digit.chain.at(0.53);
      b.part(pebble, C.gold, {
        name: `${digit.name}_knuckleScale`,
        at: knuckleFrame.moved({ up: 0.0027 }),
        scale: [0.0024, 0.0011, 0.0024],
        bone: digit.chain.joints[1],
        flat: true,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Wedge-shaped head and tall veiled casque, with a genuinely separate jaw.
  // Outlines are side elevations: local x is model +Z.
  // ---------------------------------------------------------------------------

  const upperHead = b.extrude(
    [
      [0.095, 0.219],
      [0.238, 0.224],
      [0.24, 0.235],
      [0.2, 0.259],
      [0.159, 0.269],
      [0.116, 0.324],
      [0.1, 0.275],
      [0.085, 0.241],
    ],
    {
      name: "casqueAndUpperJaw",
      at: [0, 0, 0],
      thickness: [0.064, 0.018],
      bevel: 0.0028,
      detail: 0.5,
      color: headPaint,
      bone: head,
    },
  );

  // Recessed dark mouth cavity, rather than a painted line joining both jaws.
  b.extrude(
    [
      [0.101, 0.215],
      [0.171, 0.2167],
      [0.228, 0.221],
      [0.238, 0.2224],
      [0.238, 0.224],
      [0.101, 0.22],
    ],
    {
      name: "mouthInterior",
      at: [0, 0, 0],
      thickness: 0.057,
      color: C.mouth,
      bone: head,
    },
  );

  const lowerJaw = b.extrude(
    [
      [0.099, 0.208],
      [0.165, 0.2],
      [0.214, 0.207],
      [0.238, 0.2205],
      [0.224, 0.222],
      [0.106, 0.215],
    ],
    {
      name: "lowerJaw",
      at: [0, 0, 0],
      thickness: [0.06, 0.053],
      bevel: 0.0015,
      detail: 0.5,
      color: C.belly,
      bone: jaw,
    },
  );

  // The casque's bright sagittal edge makes the silhouette unmistakable.
  b.sweep(
    [
      [0, 0.269, 0.099],
      [0, 0.322, 0.116],
      [0, 0.2685, 0.16],
      [0, 0.258, 0.199],
    ],
    0.0025,
    {
      name: "goldenCasqueKeel",
      color: C.gold,
      bone: head,
      sides: 5,
      smooth: false,
      caps: "round",
    },
  );

  const headSurface = b.surface(upperHead);
  const jawSurface = b.surface(lowerJaw);

  for (const sign of [1, -1]) {
    const side = sign === 1 ? "L" : "R";

    // Small raised lip and casque seams follow the actual polygonal surface.
    const lipPoints = [
      [0.112, 0.222],
      [0.159, 0.224],
      [0.205, 0.226],
      [0.232, 0.23],
    ].map(([z, y]) => {
      const hit = headSurface.ray([sign * 0.2, y, z], [-sign, 0, 0])!;
      return hit.moved([0, 0.00065, 0]);
    });
    b.sweep(lipPoints, 0.00115, {
      name: `upperLip${side}`,
      color: C.gold,
      bone: head,
      sides: 5,
      smooth: false,
      caps: "round",
    });

    const casqueSeam = [
      [0.111, 0.267],
      [0.119, 0.309],
      [0.151, 0.268],
    ].map(([z, y]) => {
      const hit = headSurface.ray([sign * 0.2, y, z], [-sign, 0, 0])!;
      return hit.moved([0, 0.0005, 0]);
    });
    b.sweep(casqueSeam, 0.0014, {
      name: `casqueSideRidge${side}`,
      color: C.lime,
      bone: head,
      sides: 5,
      smooth: false,
      caps: "round",
    });

    const nostril = headSurface.ray([sign * 0.2, 0.241, 0.22], [-sign, 0, 0])!;
    b.stick(sphere, C.lime, nostril, {
      name: `nostrilRim${side}`,
      scale: [0.0031, 0.001, 0.0025],
      embed: 0.55,
      flat: true,
    });
    b.stick(sphere, C.deep, nostril.moved([0, 0.0007, 0]), {
      name: `nostril${side}`,
      scale: [0.0017, 0.0006, 0.0011],
      embed: 0.35,
      flat: true,
    });

    // A few warm cheek scales contrast with the cool flank bars.
    for (let i = 0; i < 4; i++) {
      const z = 0.123 + i * 0.009;
      const y = 0.234 + i * 0.0017;
      const hit = headSurface.ray([sign * 0.2, y, z], [-sign, 0, 0])!;
      b.stick(pebble, i % 2 ? C.gold : C.orange, hit, {
        name: `cheekScale${side}${i}`,
        scale: [0.0026, 0.001, 0.0035],
        embed: 0.45,
        flat: true,
      });
    }
  }

  // Tiny gular teeth along the underside of the lower jaw.
  for (let i = 0; i < 8; i++) {
    const z = 0.11 + i * 0.012;
    const hit = jawSurface.ray([0, 0.12, z], [0, 1, 0])!;
    const h = 0.004 + 0.002 * Math.sin((i / 7) * Math.PI);
    b.extrude(
      [
        [-0.0055, 0.0005],
        [0.0055, 0.0005],
        [-0.001, -h],
      ],
      {
        name: `throatCrest${i + 1}`,
        at: hit.at,
        thickness: 0.0028,
        color: i % 2 ? C.gold : C.belly,
        bone: jaw,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Turret eyes: skin-covered bulbs, small golden openings, dark mobile pupils.
  // ---------------------------------------------------------------------------

  for (const eye of eyes) {
    const hit = headSurface.ray(
      [eye.sign * 0.2, 0.251, 0.174],
      [-eye.sign, 0, 0],
    )!;
    const eyeFrame = frame(hit, eye.gaze, [0, 1, 0]);

    b.lathe(
      [
        [0, -0.01],
        [0.018, -0.01],
        [0.024, -0.001],
        [0.026, 0.009],
        [0.023, 0.019],
        [0.017, 0.027],
        [0.01, 0.03],
        [0, 0.029],
      ],
      {
        name: `eyeTurret${eye.side}`,
        at: hit.at,
        axis: eye.gaze,
        segments: 10,
        color: eyePaint,
        bone: eye.joint,
      },
    );

    const torus = new THREE.TorusGeometry(0.0086, 0.0017, 5, 14);
    torus.rotateX(Math.PI / 2);
    b.part(torus, C.gold, {
      name: `eyelidRim${eye.side}`,
      frame: eyeFrame.moved([0, 0.0298, 0]),
      bone: eye.joint,
      flat: true,
    });

    b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.0018, 14), C.iris, {
      name: `iris${eye.side}`,
      frame: eyeFrame.moved([0, 0.03, 0]),
      bone: eye.joint,
    });

    b.part(new THREE.CylinderGeometry(0.0062, 0.0062, 0.0013, 14), C.pupil, {
      name: `pupil${eye.side}`,
      frame: eyeFrame.moved([0, 0.0314, 0]),
      bone: eye.joint,
    });

    b.part(sphere, C.glint, {
      name: `eyeCatchlight${eye.side}`,
      frame: eyeFrame.moved([-0.0021, 0.03225, 0.0025]),
      scale: [0.0014, 0.0006, 0.0014],
      bone: eye.joint,
    });

    // Larger eyelid scales arranged around the turret, not white eyeballs.
    b.ring(eyeFrame.moved([0, 0.014, 0]), { count: 11, radius: 0.0243 }, (item) => {
      b.stick(pebble, item.i % 3 === 0 ? C.gold : C.lime, item, {
        name: `orbitalScale${eye.side}${item.i}`,
        scale: [0.002, 0.00085, 0.0025],
        embed: 0.6,
        bone: eye.joint,
        flat: true,
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Surface-seated details: sawtooth back, flank beadwork, scattered scales.
  // ---------------------------------------------------------------------------

  const bodySurface = b.surface(torso);

  for (let i = 0; i < 20; i++) {
    const z = -0.116 + i * 0.0112;
    const hit = bodySurface.ray([0, 0.5, z], [0, -1, 0])!;
    const height = 0.0065 + 0.006 * Math.sin(((i + 1) / 22) * Math.PI);
    b.extrude(
      [
        [-0.0057, -0.001],
        [0.0062, -0.001],
        [0.0018, height],
      ],
      {
        name: `dorsalCrest${i + 1}`,
        at: hit.at,
        thickness: 0.0037,
        color: i % 4 === 0 ? C.goldLight : C.gold,
        bone: hit.bone!,
      },
    );
  }

  for (const sign of [1, -1]) {
    const side = sign === 1 ? "L" : "R";
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 12; i++) {
        const z = -0.091 + i * 0.0152;
        const y = (row === 0 ? 0.168 : 0.212) + 0.004 * Math.sin(i * 0.51);
        const hit = bodySurface.ray([sign * 0.2, y, z], [-sign, 0, 0]);
        if (!hit) continue;
        const size = row === 0 ? 0.0021 : 0.0017;
        b.stick(pebble, i % 4 === 0 ? C.orange : row === 0 ? C.goldLight : C.mint, hit, {
          name: `flankBead${side}_${row}_${i}`,
          scale: [size, size * 0.36, size * 1.15],
          embed: 0.45,
          flat: true,
        });
      }
    }
  }

  const scaleHits = bodySurface.scatter(110, {
    rng: random,
    minDist: 0.008,
    filter: (hit) =>
      Math.abs(hit.n.x) > 0.58 &&
      hit.at.y > 0.147 &&
      hit.at.y < 0.237,
  });

  scaleHits.forEach((hit, i) => {
    const size = 0.0014 + random() * 0.00075;
    b.stick(pebble, bodyTone(hit.at), hit, {
      name: `skinScale${i + 1}`,
      scale: [size, size * 0.32, size * 1.25],
      embed: 0.45,
      flat: true,
    });
  });

  // Small, flat joint scales on the exposed outsides of the limbs.
  for (const leg of legs) {
    const a = new THREE.Vector3(...leg.points[1]);
    const c = new THREE.Vector3(...leg.points[2]);
    for (let i = 0; i < 4; i++) {
      const t = (i + 1) / 5;
      const p = a.clone().lerp(c, t);
      p.x += leg.sign * (0.011 - t * 0.003);
      b.part(pebble, i % 2 ? C.lime : C.gold, {
        name: `legScale${leg.front ? "F" : "H"}${leg.side}${i}`,
        at: p,
        scale: [0.0011, 0.0022, 0.0028],
        bone: leg.chain.joints[1],
        flat: true,
      });
    }
  }

  b.material(C.pupil).roughness = 0.22;
  b.material(C.iris).roughness = 0.38;
  b.material(C.glint).roughness = 0.2;
  b.material(C.claw).roughness = 0.53;

  return b.root;
}
