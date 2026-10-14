import * as THREE from "three";
import {
  createBuilder, frame, catmull, bezier, spiral,
  paint, mix, smoothstep, cells, grain, rng
} from "../../../../src/index";

export const meta = {
  name: "Sunset Panther Chameleon",
  description:
    "A jewel-coloured panther chameleon creeping along a knobbly twig, with independent turret eyes, a serrated casque, opposing mitten feet and a tightly wound sunset tail."
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "pantherChameleon", paintSize: 2048 });

  const TURQUOISE = "#19bbc0";
  const DEEP_TEAL = "#128b91";
  const LIME = "#a5d944";
  const ORANGE = "#f78838";
  const RED = "#d63740";
  const IVORY = "#f5f2d3";
  const DARK = "#202e27";
  const BARK = "#76503a";

  function colourAt(z: number) {
    return z < -0.018
      ? mix(ORANGE, LIME, smoothstep(-0.126, -0.018, z))
      : mix(LIME, TURQUOISE, smoothstep(0.006, 0.106, z));
  }

  const skin = paint((p) => {
    const cell = cells(p, 0.0033, 19);
    return mix(colourAt(p.z), "#e8f5b2", (Math.abs(cell.id) % 7) * 0.010);
  });

  const flankPaint = paint((p, n) => {
    const cell = cells(p, 0.0035, 19);
    let c = mix(colourAt(p.z), "#ecf8bc", (Math.abs(cell.id) % 7) * 0.009);
    const side = Math.abs(n.x) > 0.38;
    const phase = (p.z + 0.111 + 0.0028 * Math.sin(p.y * 105)) / 0.034;
    const bar = Math.abs(phase - Math.round(phase));

    if (side && p.z > -0.104 && p.z < 0.097 && p.y > 0.121) {
      if (bar < 0.142) c = mix(c, RED, 0.94);
      else if (Math.abs(cell.id) % 39 === 0) c = mix(c, RED, 0.68);
    }

    const stripeY =
      0.155 + 0.003 * Math.sin((p.z + 0.075) * 43) +
      0.045 * Math.max(0, p.z - 0.045);
    if (side && Math.abs(p.y - stripeY) < 0.0037) {
      c = mix(c, bar < 0.032 && p.z < 0.09 ? "#e85b52" : IVORY, 0.98);
    }
    if (n.y < -0.62) c = mix(c, "#d7e89a", 0.18);
    return c;
  });

  const tailPaint = paint((p, _n, s) => {
    const cell = cells(p, 0.003, 31);
    let c = mix(ORANGE, "#ef5943", smoothstep(0.40, 1, s[0]) * 0.65);
    if (s[0] > 0.09 && Math.sin(s[0] * Math.PI * 21) > 0.84)
      c = mix(c, "#bc3f34", 0.73);
    return mix(c, "#ffd189", (Math.abs(cell.id) % 5) * 0.012);
  });

  const barkPaint = grain("#68503c", "#976e48", {
    size: 0.0036, axis: "z", seed: 13
  });

  // The twig's centreline also defines all four grasping contacts.
  const twigPath = catmull([
    [0.006, 0.018, -0.315],
    [-0.005, 0.020, -0.192],
    [0.002, 0.025, -0.055],
    [0, 0.030, 0.104],
    [0.006, 0.042, 0.270]
  ]);
  const twigRadius = (t: number) =>
    0.018 - 0.0075 * t + 0.0008 * Math.sin(t * Math.PI);

  function twigContact(z: number) {
    const t = twigPath.closestT([0, 0.027, z]);
    return { t, center: twigPath.at(t), radius: twigRadius(t) };
  }

  const stations = [
    { at: [0, 0.151, -0.110], w: 0.027, h: 0.044 },
    { at: [0, 0.165, -0.079], w: 0.049, h: 0.082 },
    { at: [0, 0.171, -0.032], w: 0.063, h: 0.110 },
    { at: [0, 0.173, 0.025], w: 0.059, h: 0.103 },
    { at: [0, 0.177, 0.073], w: 0.038, h: 0.067 },
    { at: [0, 0.180, 0.101], w: 0.029, h: 0.043 }
  ];

  // Skeleton first.
  const hips = b.joint("hips", {
    at: stations[1].at, dir: [0, 0, 1], role: "spine"
  });
  const spine = b.chain("spine", [
    hips,
    [0, 0.172, -0.016],
    [0, 0.177, 0.047],
    [0, 0.180, 0.090]
  ], {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "chest"],
    role: "spine"
  });

  const neck = b.chain("neck", [
    spine.at(1),
    [0, 0.182, 0.105],
    [0, 0.184, 0.122]
  ], {
    parent: spine.tip!,
    names: ["neck1", "neck2"],
    role: "neck"
  });
  const head = b.joint("head", {
    parent: neck.joints[1], at: neck.at(1), dir: [0, 0, 1], role: "head"
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ down: 0.030, back: 0.010 }),
    dir: [0, 0, 1],
    role: "jaw"
  });

  const eyes = [1, -1].map(s => {
    const gaze = s === 1 ? [0.79, 0.16, 0.59] : [-0.89, 0.18, -0.42];
    const joint = b.joint(s === 1 ? "eyeL" : "eyeR", {
      parent: head,
      at: head.local({ left: s * 0.022, up: 0.011, forward: 0.006 }),
      dir: gaze,
      role: "hinge"
    });
    return { s, gaze, joint };
  });

  const coilCenter = [0, 0.119, -0.177];
  const coilStart = [0, 0.170, -0.177];
  const tailPath = bezier(
    stations[0].at,
    [0, 0.159, -0.132],
    [0, 0.170, -0.153],
    coilStart
  ).concat(spiral(coilCenter, coilStart, [-1, 0, 0], {
    turns: 1.65, r1: 0.006, pitch: 0
  }));
  const tail = b.chain("tail", tailPath, {
    parent: hips, count: 13, role: "tail"
  });

  const legs = [1, -1].flatMap(s =>
    ["F", "H"].map(which => {
      const front = which === "F";
      const side = s === 1 ? "L" : "R";
      const key = which + side;
      const footZ = front
        ? (s === 1 ? 0.112 : 0.088)
        : (s === 1 ? -0.064 : -0.104);
      const contact = twigContact(footZ);
      const attachment = front ? spine.at(0.83) : hips;
      const root = attachment.local({
        left: s * (front ? 0.019 : 0.023),
        down: front ? 0.007 : 0.006
      });
      const elbow = root.clone().add(new THREE.Vector3(
        s * 0.043, front ? -0.047 : -0.052, front ? -0.030 : -0.033
      ));
      const wrist = [
        contact.center.x + s * 0.027,
        contact.center.y + 0.029,
        contact.center.z
      ];
      const chain = b.chain("leg" + key, [root, elbow, wrist], {
        parent: front ? spine.jointAt(0.83) : hips,
        names: front
          ? ["shoulder" + key, "elbow" + key, "wrist" + key]
          : ["hip" + key, "knee" + key, "ankle" + key],
        role: "leg",
        contact: [
          contact.center.x,
          contact.center.y + contact.radius,
          contact.center.z
        ]
      });

      const radialPoint = (angle: number, zOffset: number) => {
        const a = angle * Math.PI / 180;
        const r = contact.radius + 0.0019;
        return [
          contact.center.x + s * r * Math.sin(a),
          contact.center.y + r * Math.cos(a),
          contact.center.z + zOffset
        ];
      };

      const digits = Array.from({ length: 5 }, (_, i) => {
        const outer = i < 3;
        const zOffset = outer ? (i - 1) * 0.0047 : (i - 3.5) * 0.0048;
        const angles = outer ? [43, 96, 146] : [-40, -93, -143];
        const points = angles.map(a => radialPoint(a, zOffset));
        const digit = b.chain("digit" + key + (i + 1), catmull(points), {
          parent: chain.tip!,
          count: 2,
          names: ["toe" + key + (i + 1), "toe" + key + (i + 1) + "Curl"],
          role: "digit"
        });
        return { digit, outer };
      });
      return { s, key, front, chain, digits, contact, radialPoint };
    })
  );

  // A bare, crooked twig, with an exposed end and small broken forks.
  const twig = b.sweep(twigPath, twigRadius, {
    bone: hips, color: barkPaint, sides: 8, smooth: false,
    caps: "flat", name: "mainTwig"
  });

  for (const end of [0, 1]) {
    const p = twigPath.at(end);
    const tangent = twigPath.tangentAt(end).multiplyScalar(end === 0 ? -1 : 1);
    const f = frame(p, tangent);
    b.part(new THREE.CylinderGeometry(
      twigRadius(end) * 0.98, twigRadius(end) * 0.98, 0.0012, 8
    ), "#c69a64", { frame: f, bone: hips, name: "exposedWood" + end });
    for (const radius of [twigRadius(end) * 0.40, twigRadius(end) * 0.73]) {
      const ring = b.ring(f.moved([0, 0.0007, 0]), { count: 12, radius });
      b.sweep(catmull(ring.items, { closed: true }), 0.00035, {
        bone: hips, color: "#926e46", sides: 5, name: "woodGrowthRing"
      });
    }
  }

  const forkA = twig.at(0.19, -85);
  b.sprout("rearTwigFork", forkA, catmull([
    forkA,
    [0.045, 0.016, -0.236],
    [0.095, 0.013, -0.277],
    [0.123, 0.012, -0.269]
  ]), [0.008, 0.0024], {
    count: 0, color: barkPaint, sides: 7, smooth: false,
    caps: "flat", name: "lowBrokenFork"
  });

  const forkB = twig.at(0.84, 90);
  const fineFork = b.sprout("fineTwigFork", forkB, bezier(
    forkB,
    [-0.023, 0.047, 0.214],
    [-0.058, 0.065, 0.247],
    [-0.082, 0.062, 0.269]
  ), [0.0045, 0.0011], {
    count: 0, color: barkPaint, sides: 6, caps: "flat", name: "fineTwigFork"
  });
  b.stick(new THREE.SphereGeometry(0.0035, 6, 4), "#8b4835",
    fineFork.sweep.at(0.94, 0), {
      scale: [0.8, 1.5, 0.8], name: "dormantBud"
    });

  b.along(twig, 11, at => {
    const h = twig.at(at.t, at.t < 0.5 ? -65 : 70);
    b.stick(new THREE.SphereGeometry(0.0035, 6, 4), BARK, h, {
      scale: [1.5, 0.62, 1.1], embed: 0.45, name: "barkKnot"
    });
  });

  for (const angle of [-38, 47, 118]) {
    b.sweep(twig.line(angle, 0.00015).slice(0.04, 0.95), 0.00038, {
      bone: hips, color: "#49382b", sides: 5, name: "longBarkFissure"
    });
  }

  // Tall, laterally compressed body: broad facets, not a smooth sausage.
  const body = b.loft(stations, {
    bone: [hips, spine, neck], color: flankPaint,
    sides: 10, smooth: false, caps: "round", name: "leafShapedBody"
  });
  const neckVolume = b.sweep(neck, t => [0.016 - 0.002 * t, 0.023 - 0.003 * t], {
    color: flankPaint, sides: 8, smooth: false, name: "shortNeck"
  });
  b.sweep(tail, t => 0.0125 * (1 - t) + 0.0018, {
    color: tailPaint, sides: 8, smooth: false, caps: "round",
    name: "tightlyCoiledTail"
  });

  const bodySurface = b.surface(body);
  b.along(spine, 23, at => {
    const h = bodySurface.nearest(at.local({ up: 0.090 }));
    const size = 0.0033 + 0.0022 * Math.sin(Math.PI * at.t);
    b.spike(h, h, size, 0.00165, {
      color: mix(colourAt(h.at.z), "#e7ed8b", 0.38),
      sides: 4, smooth: false, name: "dorsalSawtooth"
    });
  });

  const granules = bodySurface.scatter(125, {
    rng: rng(47), minDist: 0.0065,
    filter: h => Math.abs(h.n.x) > 0.58 &&
      h.at.y > 0.126 &&
      Math.abs(h.at.y - (0.155 + 0.003 * Math.sin((h.at.z + 0.075) * 43))) > 0.008
  });
  for (const h of granules) {
    b.stick(new THREE.CylinderGeometry(0.0011, 0.0014, 0.0008, 5),
      mix(colourAt(h.at.z), "#e1efa4", 0.19), h, {
        embed: 0.5, name: "raisedFlankScale"
      });
  }

  // Upper skull and the independently hinged lower jaw.
  const skull = b.loft([
    { at: head.local({ back: 0.026, down: 0.001 }), w: 0.038, h: 0.047 },
    { at: head.local({ forward: 0.010 }), w: 0.052, h: 0.045 },
    { at: head.local({ forward: 0.037, down: 0.004 }), w: 0.036, h: 0.026 },
    { at: head.local({ forward: 0.051, down: 0.008 }), w: 0.025, h: 0.015 }
  ], {
    bone: head, color: skin, sides: 8, smooth: false,
    caps: "flat", name: "angularUpperSkull"
  });

  const jawPaint = paint(p => mix(colourAt(p.z), "#ccf1bd", 0.29));
  const lowerJaw = b.loft([
    { at: jaw.local({ back: 0.007 }), w: 0.031, h: 0.012 },
    { at: jaw.local({ forward: 0.034, up: 0.005 }), w: 0.032, h: 0.013 },
    { at: jaw.local({ forward: 0.061, up: 0.010 }), w: 0.024, h: 0.008 }
  ], {
    bone: jaw, color: jawPaint, sides: 6, smooth: false,
    caps: "flat", name: "separateLowerJaw"
  });

  const skullSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const mouth = [
      head.local({ left: s * 0.018, back: 0.021, down: 0.022 }),
      head.local({ left: s * 0.022, forward: 0.007, down: 0.020 }),
      head.local({ left: s * 0.017, forward: 0.033, down: 0.016 }),
      head.local({ left: s * 0.011, forward: 0.051, down: 0.014 })
    ];
    b.sweep(skullSurface.drape(catmull(mouth), { lift: 0.00035 }), 0.00075, {
      bone: head, color: "#315852", sides: 5, name: "quietMouthLine"
    });

    const cheek = [
      head.local({ left: s * 0.017, back: 0.022, down: 0.015 }),
      head.local({ left: s * 0.024, forward: 0.003, down: 0.014 }),
      head.local({ left: s * 0.019, forward: 0.028, down: 0.011 })
    ];
    b.sweep(skullSurface.drape(catmull(cheek), { lift: 0.00045 }), 0.00165, {
      bone: head, color: IVORY, sides: 6, name: "ivoryCheekStripe"
    });

    const nostril = skullSurface.nearest(
      head.local({ left: s * 0.015, forward: 0.039, down: 0.0005 })
    );
    b.stick(new THREE.CylinderGeometry(0.0012, 0.00135, 0.0005, 7),
      DEEP_TEAL, nostril, { embed: 0.5, name: "nostril" });
  }

  // Flattened angular casque with a prominent ridged upper edge.
  const casque = b.extrude([
    [-0.015, -0.014],
    [-0.014, 0.022],
    [0.002, 0.035],
    [0.018, 0.025],
    [0.043, 0.007],
    [0.058, -0.010],
    [0.030, -0.017]
  ], {
    at: head.local({ back: 0.026, up: 0.021 }),
    x: [0, 0, 1], y: [0, 1, 0],
    thickness: 0.011, bevel: 0.0012,
    color: skin, bone: head, name: "ridgedCasque"
  });
  const casqueRim = catmull([
    casque.local([-0.014, 0.022, 0]),
    casque.local([0.002, 0.035, 0]),
    casque.local([0.018, 0.025, 0]),
    casque.local([0.043, 0.007, 0]),
    casque.local([0.058, -0.010, 0])
  ]);
  b.sweep(casqueRim, 0.0021, {
    bone: head, color: "#63d4ae", sides: 6, name: "casqueRaisedRim"
  });
  b.along(casqueRim, 13, at => {
    b.spike(at, [0, 1, 0], 0.0025, 0.0013, {
      bone: head, color: "#b9e783", sides: 4, name: "casqueRidgeScale"
    });
  });

  const throatSurface = b.surface([neckVolume, lowerJaw]);
  b.along(neck, 6, at => {
    const h = throatSurface.nearest(at.local({ down: 0.043 }));
    b.spike(h, h, 0.0028, 0.00125, {
      color: "#cbe69c", sides: 4, name: "gularSerration"
    });
  });

  // Conical eyes: the tiny aperture is at the end of each movable turret.
  const turretPaint = paint((p, _n, s) => {
    const cell = cells(p, 0.0025, 63);
    let c = mix(TURQUOISE, "#77d69b", (Math.abs(cell.id) % 5) * 0.07);
    if (s[0] > 0.013 && Math.sin(s[1] * Math.PI / 36) > 0.81)
      c = mix(c, "#d85647", 0.56);
    return c;
  });

  for (const e of eyes) {
    b.lathe([
      [0, -0.003],
      [0.011, -0.003],
      [0.017, 0.003],
      [0.0165, 0.009],
      [0.0125, 0.017],
      [0.0060, 0.024],
      [0, 0.024]
    ], {
      at: e.joint, axis: e.gaze, segments: 12,
      color: turretPaint, bone: e.joint,
      name: e.s === 1 ? "leftEyeTurret" : "rightEyeTurret"
    });

    for (const row of [
      { height: 0.009, radius: 0.0155, count: 13 },
      { height: 0.017, radius: 0.0116, count: 11 }
    ]) {
      b.ring(e.joint.moved([0, row.height, 0]), {
        count: row.count, radius: row.radius
      }, item => {
        b.stick(new THREE.SphereGeometry(0.00125, 5, 3),
          row.height < 0.010 ? "#32b6a4" : "#82d99c", item, {
            embed: 0.48, scale: [1, 0.48, 1], name: "turretScale"
          });
      });
    }

    b.part(new THREE.SphereGeometry(0.0054, 12, 6), "#d6cf6d", {
      at: e.joint.local([0, 0.0244, 0]),
      bone: e.joint, dir: e.gaze, axis: "z",
      scale: [1, 1, 0.27], name: "tinyGoldenEyeAperture"
    });
    b.part(new THREE.SphereGeometry(0.0031, 10, 6), DARK, {
      at: e.joint.local([0, 0.0258, 0]),
      bone: e.joint, dir: e.gaze, axis: "z",
      scale: [1, 1, 0.30], name: "watchfulPupil"
    });
    b.part(new THREE.SphereGeometry(0.00075, 6, 4), "#fcfff0", {
      at: e.joint.local([-0.0008, 0.0267, 0.001]),
      bone: e.joint, name: "eyeCatchlight"
    });
  }

  // Four separated limbs and the two opposing bundles of each mitten.
  for (const leg of legs) {
    b.sweep(leg.chain, [0.0093, 0.0070, 0.0052], {
      color: skin, sides: 8, smooth: false, name: "bentLeg" + leg.key
    });

    const wrist = leg.chain.tip!;
    const outerPalm = leg.radialPoint(43, 0);
    const innerPalm = leg.radialPoint(-40, 0);
    const middle = wrist.local({
      right: leg.s * 0.008, down: 0.007
    });

    b.sweep(bezier(wrist, middle, outerPalm), [0.0056, 0.0041], {
      bone: wrist, color: skin, sides: 7, name: "threeFingerMitten" + leg.key
    });
    b.sweep(bezier(wrist, middle, innerPalm), [0.0048, 0.0037], {
      bone: wrist, color: skin, sides: 7, name: "opposingMitten" + leg.key
    });

    for (const d of leg.digits) {
      b.capsule(d.outer ? outerPalm : innerPalm, d.digit.at(0),
        [0.0029, 0.0023], {
          bone: wrist, color: skin, sides: 6, name: "mittenKnuckle"
        });
      b.sweep(d.digit, [0.00235, 0.00165], {
        color: skin, sides: 6, smooth: false, caps: "round",
        name: "graspingToe"
      });
      const end = d.digit.at(1);
      b.spike(end, end, 0.0027, 0.0008, {
        color: "#eee3b6", sides: 5, name: "minuteToeClaw"
      });
    }
  }

  return b.root;
}
