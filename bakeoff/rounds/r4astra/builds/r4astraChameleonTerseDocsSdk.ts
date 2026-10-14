import * as THREE from "three";
import {
  createBuilder,
  catmull,
  spiral,
  frame,
  paint,
  scales,
  rng,
} from "../../../../src/index";

export const meta = {
  name: "Sunleaf Chameleon",
  description:
    "A veiled chameleon with a tall leaf-shaped casque, independently rigged turret eyes, stippled emerald and citron skin, opposable toes, and a tightly scrolled prehensile tail.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Sunleaf Chameleon", paintSize: 2048 });

  const C = {
    green: "#74ae42",
    emerald: "#278675",
    darkGreen: "#326d49",
    citron: "#c7d55b",
    cream: "#dce09a",
    turquoise: "#75c6ae",
    gold: "#d3aa43",
    eye: "#a8c64e",
    black: "#142a25",
    claw: "#eadbb0",
  };

  // Skeleton ---------------------------------------------------------------
  const hips = b.joint("hips", {
    at: [0, 0.122, -0.082],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      hips,
      [0, 0.129, -0.018],
      [0, 0.137, 0.045],
      [0, 0.143, 0.085],
    ]),
    {
      parent: hips,
      count: 3,
      names: ["spine1", "spine2", "spine3", "chest"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    [spine.at(1), [0, 0.148, 0.102], [0, 0.15, 0.12]],
    {
      parent: spine.tip!,
      names: ["neck1", "neck2"],
      role: "neck",
    },
  );
  const head = b.joint("head", {
    parent: neck,
    at: neck.at(1),
    dir: [0, 0, 1],
    role: "head",
  });
  const H = b.region({ at: head, bone: head });
  const jaw = b.joint("jaw", {
    parent: head,
    at: H.p([0, -0.021, -0.003]),
    dir: [0, 0, 1],
    role: "jaw",
  });

  const eyes = [1, -1].map((s) => ({
    s,
    joint: b.joint(s === 1 ? "eyeL" : "eyeR", {
      parent: head,
      at: H.p([s * 0.026, 0.013, 0.03]),
      dir: [s * 0.92, 0.075, 0.39],
      role: "head",
    }),
  }));

  const coil = spiral(
    [0, 0.075, -0.2],
    [0, 0.146, -0.2],
    [1, 0, 0],
    { turns: -1.18, r1: 0.016 },
  );
  const tailPath = catmull([
    hips,
    [0, 0.138, -0.125],
    [0, 0.148, -0.165],
    ...Array.from({ length: 29 }, (_, i) => coil.at(i / 28)),
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    count: 14,
    role: "tail",
  });

  const legs = [true, false].flatMap((front) =>
    [1, -1].map((s) => {
      const side = s === 1 ? "L" : "R";
      const label = `${front ? "F" : "H"}${side}`;
      const ax = front ? 0.079 : 0.084;
      const z = front ? 0.091 : -0.083;
      const root = front
        ? [s * 0.023, 0.125, 0.065]
        : [s * 0.025, 0.107, -0.068];
      const elbow = front
        ? [s * 0.066, 0.08, 0.033]
        : [s * 0.07, 0.073, -0.025];

      const chain = b.chain(
        `leg${label}`,
        [root, elbow, [s * ax, 0.013, z]],
        {
          parent: front ? spine.joints[2] : hips,
          names: front
            ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`]
            : [`hip${side}`, `knee${side}`, `ankle${side}`],
          role: "leg",
          contact: [s * ax, 0, z],
        },
      );

      let digitIndex = 0;
      const digits = [-1, 1].flatMap((q) => {
        const count = q === -1 ? (front ? 3 : 2) : front ? 2 : 3;
        return Array.from({ length: count }, (_, i) => {
          const spread = i - (count - 1) / 2;
          const id = ++digitIndex;
          const digit = b.chain(
            `digit${label}${id}`,
            [
              [s * (ax + q * 0.0035), 0.01, z + spread * 0.0035],
              [
                s * (ax + q * 0.012),
                0.006,
                z + 0.006 + spread * 0.004,
              ],
              [
                s * (ax + q * 0.023),
                0.004,
                z + 0.012 + spread * 0.0045,
              ],
            ],
            {
              parent: chain.tip!,
              names: [
                `toe${label}${id}`,
                `toe${label}${id}Middle`,
                `toe${label}${id}Tip`,
              ],
              role: "digit",
            },
          );
          return { chain: digit, q };
        });
      });

      return { front, s, ax, z, chain, digits };
    }),
  );

  // Colour is carried mostly by broad, quiet forms; the small scales are paint.
  const bodyPattern = paint((p, n) => {
    let color =
      n.y < -0.38 ? C.cream : n.y > 0.48 ? C.emerald : C.green;
    if (Math.abs(n.x) > 0.32) {
      const centers = [-0.058, -0.008, 0.042];
      for (let i = 0; i < centers.length; i++) {
        const d =
          p.z -
          centers[i] +
          0.004 * Math.sin((p.y - 0.08) * 92 + i * 1.7);
        if (Math.abs(d) < 0.009) color = C.citron;
        else if (d > 0.009 && d < 0.012) color = "#488f54";
      }
    }
    return color;
  });
  const bodySkin = scales(bodyPattern, "#528e4d", {
    size: 0.0052,
    width: 0.065,
    seed: 19,
  });
  const greenSkin = scales("#78ad47", "#62954b", {
    size: 0.0038,
    width: 0.07,
    seed: 23,
  });
  const headSkin = scales("#93b94c", "#759e49", {
    size: 0.0035,
    width: 0.065,
    seed: 29,
  });

  // Tall, laterally compressed body.
  const body = b.loft(
    [
      { at: [0, 0.119, -0.104], w: 0.019, h: 0.025 },
      { at: [0, 0.123, -0.074], w: 0.052, h: 0.075 },
      { at: [0, 0.128, -0.026], w: 0.077, h: 0.112 },
      { at: [0, 0.132, 0.023], w: 0.079, h: 0.115 },
      { at: [0, 0.139, 0.062], w: 0.059, h: 0.081 },
      { at: [0, 0.144, 0.09], w: 0.034, h: 0.042 },
    ],
    {
      bone: [hips, spine],
      color: bodySkin,
      sides: 10,
      smooth: false,
      caps: "flat",
      name: "compressed_leaf_body",
    },
  );

  b.sweep(neck, (t) => [0.021 - t * 0.002, 0.025 - t * 0.004], {
    color: greenSkin,
    sectors: [[125, 235, C.cream]],
    sides: 8,
    smooth: false,
    name: "neck",
  });

  const tailSkin = paint((_p, n, uv) => {
    const band = uv[0] > 0.2 && Math.sin(uv[0] * Math.PI * 21) > 0.7;
    return band ? C.citron : n.y > 0.1 ? "#64a94b" : C.emerald;
  });
  const tailTube = b.sweep(
    tail,
    (t) => 0.0125 * Math.pow(1 - t, 1.08) + 0.0018,
    {
      color: tailSkin,
      sides: 8,
      smooth: false,
      caps: "round",
      name: "prehensile_scroll",
    },
  );

  // A small saw-toothed dorsal crest, seated directly on the back.
  const bodySurface = b.surface(body);
  const ridgeRoute = catmull([
    [0, 0.13, -0.09],
    [0, 0.14, 0],
    [0, 0.145, 0.081],
  ]);
  b.along(ridgeRoute, 19, (p) => {
    const hit = bodySurface.ray([0, 0.32, p.at.z], [0, -1, 0]);
    if (!hit) return;
    const height = 0.0065 + 0.004 * p.t;
    b.stick(
      new THREE.ConeGeometry(0.0033, height, 4),
      p.t > 0.65 ? C.citron : "#acd064",
      hit,
      { embed: 0.12, name: "dorsal_tooth" },
    );
  });
  b.along(
    tailTube,
    5,
    (p) =>
      b.stick(
        new THREE.ConeGeometry(0.0022, 0.004, 4),
        C.citron,
        p,
        { embed: 0.2 },
      ),
    { from: 0.025, to: 0.19 },
  );

  // Pebbly flank accents and the characteristic pale lateral dotted line.
  const freckles = bodySurface.scatter(82, {
    rng: rng(41),
    minDist: 0.0055,
    filter: (h) => Math.abs(h.n.x) > 0.66 && h.n.y > -0.45,
  });
  freckles.forEach((hit, i) => {
    const r = 0.0012 + (i % 4) * 0.00022;
    b.stick(
      new THREE.CylinderGeometry(r, r * 1.1, 0.0007, 6),
      i % 5 === 0 ? C.cream : C.turquoise,
      hit,
      { embed: 0.45, name: "flank_pebble" },
    );
  });
  for (const s of [1, -1]) {
    for (let i = 0; i < 17; i++) {
      const t = i / 16;
      const hit = bodySurface.nearest([
        s * 0.1,
        0.107 + 0.015 * t,
        -0.08 + 0.154 * t,
      ]);
      b.stick(
        new THREE.CylinderGeometry(0.00145, 0.0017, 0.00085, 6),
        i % 4 === 0 ? C.gold : C.cream,
        hit,
        { embed: 0.4, name: "lateral_bead" },
      );
    }
  }

  // Limbs, opposing bundles of toes, and little hooked claws.
  for (const leg of legs) {
    const limbTube = b.sweep(
      leg.chain,
      leg.front
        ? [0.0095, 0.0112, 0.0081, 0.006]
        : [0.013, 0.014, 0.0085, 0.0062],
      {
        color: greenSkin,
        sides: 8,
        smooth: false,
        bands: [
          [0.43, greenSkin],
          [0.5, C.citron],
          [0.83, greenSkin],
          [0.89, "#b4cd62"],
          [1, greenSkin],
        ],
        name: "angular_leg",
      },
    );

    for (const t of [0.26, 0.35, 0.66, 0.75]) {
      b.stick(
        new THREE.CylinderGeometry(0.0021, 0.0024, 0.0009, 6),
        C.citron,
        limbTube.at(t, leg.s * 45),
        { embed: 0.45 },
      );
    }

    b.part(new THREE.SphereGeometry(1, 8, 6), greenSkin, {
      at: [leg.s * leg.ax, 0.008, leg.z],
      scale: [0.009, 0.008, 0.011],
      bone: leg.chain.tip!,
      flat: true,
      name: "pincer_palm",
    });

    for (const q of [-1, 1]) {
      b.capsule(
        [leg.s * (leg.ax + q * 0.003), 0.01, leg.z],
        [leg.s * (leg.ax + q * 0.012), 0.007, leg.z + 0.006],
        [0.006, 0.0048],
        {
          color: greenSkin,
          bone: leg.chain.tip!,
          sides: 6,
          smooth: false,
          name: "opposable_pad",
        },
      );
    }

    for (const digit of leg.digits) {
      const toe = b.sweep(digit.chain, [0.0037, 0.0033, 0.0025], {
        color: "#b3c96a",
        sides: 6,
        smooth: false,
        caps: "round",
        name: "separated_toe",
      });
      b.stick(
        new THREE.CylinderGeometry(0.002, 0.0022, 0.0007, 5),
        C.green,
        toe.at(0.56, 0),
        { embed: 0.5 },
      );

      const tip = digit.chain.at(1);
      b.sweep(
        [
          tip,
          tip.moved({
            left: leg.s * digit.q * 0.0027,
            forward: 0.002,
            down: 0.0003,
          }),
          tip.moved({
            left: leg.s * digit.q * 0.0052,
            forward: 0.0033,
            down: 0.003,
          }),
        ],
        [0.00185, 0],
        {
          bone: digit.chain.tip!,
          color: C.claw,
          sides: 5,
          caps: "flat",
          name: "hooked_claw",
        },
      );
    }
  }

  // Head and the separate lower jaw.
  const skull = b.loft(
    [
      { at: H.p([0, -0.004, -0.031]), w: 0.038, h: 0.036 },
      { at: H.p([0, 0.01, 0.012]), w: 0.063, h: 0.059 },
      { at: H.p([0, 0.003, 0.043]), w: 0.051, h: 0.04 },
      { at: H.p([0, -0.007, 0.076]), w: 0.036, h: 0.023 },
      { at: H.p([0, -0.012, 0.099]), w: 0.021, h: 0.012 },
    ],
    {
      bone: head,
      color: headSkin,
      caps: "flat",
      sides: 8,
      smooth: false,
      name: "upper_jaw_and_skull",
    },
  );

  b.loft(
    [
      { at: H.p([0, -0.019, -0.006]), w: 0.035, h: 0.003 },
      { at: H.p([0, -0.0185, 0.034]), w: 0.046, h: 0.003 },
      { at: H.p([0, -0.0185, 0.077]), w: 0.032, h: 0.0025 },
      { at: H.p([0, -0.018, 0.098]), w: 0.017, h: 0.002 },
    ],
    {
      color: C.darkGreen,
      bone: jaw,
      sides: 6,
      caps: "flat",
      name: "mouth_shadow",
    },
  );

  b.loft(
    [
      { at: H.p([0, -0.025, -0.012]), w: 0.037, h: 0.014 },
      { at: H.p([0, -0.027, 0.034]), w: 0.048, h: 0.013 },
      { at: H.p([0, -0.025, 0.073]), w: 0.033, h: 0.009 },
      { at: H.p([0, -0.021, 0.098]), w: 0.019, h: 0.004 },
    ],
    {
      bone: jaw,
      color: "#b6cb6a",
      sides: 8,
      smooth: false,
      caps: "flat",
      name: "lower_jaw",
    },
  );

  const throat = b.extrude(
    [
      [-0.016, -0.023],
      [0.063, -0.026],
      [0.031, -0.041],
      [0.005, -0.053],
      [-0.014, -0.04],
    ],
    {
      at: H.p([0, 0, 0]),
      thickness: 0.024,
      color: C.cream,
      bone: jaw,
      name: "gular_pouch",
    },
  );
  const throatSurface = b.surface(throat);
  for (let i = 0; i < 7; i++) {
    const z = 0.121 + i * 0.006;
    const hit = throatSurface.ray([0, 0.07, z], [0, 1, 0]);
    if (hit)
      b.stick(
        new THREE.ConeGeometry(0.002, 0.0048, 4),
        "#bac977",
        hit,
        { embed: 0.18, bone: jaw },
      );
  }

  // The veiled chameleon's unmistakable tall, thin casque.
  const casqueSkin = scales(
    paint((p) => (p.y > 0.213 ? "#a6c453" : "#499650")),
    "#659d4c",
    { size: 0.0042, width: 0.055, seed: 37 },
  );
  const casque = b.extrude(
    [
      [-0.051, 0.008],
      [-0.038, 0.038],
      [-0.012, 0.088],
      [0.007, 0.071],
      [0.04, 0.011],
      [0.013, -0.007],
      [-0.024, -0.011],
    ],
    {
      at: H.p([0, 0, 0]),
      thickness: [0.032, 0.006],
      color: casqueSkin,
      bone: head,
      name: "leaf_casque",
    },
  );

  b.sweep(
    [
      H.p([0, 0.011, 0.04]),
      H.p([0, 0.071, 0.007]),
      H.p([0, 0.088, -0.012]),
      H.p([0, 0.038, -0.038]),
      H.p([0, 0.008, -0.051]),
    ],
    0.0021,
    {
      color: "#b7cc62",
      bone: head,
      sides: 5,
      caps: "round",
      name: "casque_rim",
    },
  );

  const casqueSurface = b.surface(casque);
  for (const s of [1, -1]) {
    for (let i = 0; i < 2; i++) {
      const route = casqueSurface.drape(
        catmull([
          H.p([s * 0.055, 0.012, -0.019 + i * 0.032]),
          H.p([s * 0.055, 0.041, -0.012 + i * 0.014]),
          H.p([s * 0.055, 0.07, -0.011]),
        ]),
        { lift: 0.0002 },
      );
      b.sweep(route, 0.00065, {
        color: "#b1c968",
        bone: head,
        sides: 5,
        name: "casque_vein",
      });
    }
  }

  const skullSurface = b.surface(skull);

  // Turret eyes: conical eyelids, tiny apertures, and a lively catchlight.
  const turretPaint = paint((_p, _n, uv) => {
    if (uv[0] > 0.021) return "#b4c955";
    const spokes = Math.sin((uv[1] * Math.PI) / 10 + uv[0] * 280);
    return spokes > 0.86 ? "#a2c052" : "#71a648";
  });

  for (const eye of eyes) {
    const socket = skullSurface.nearest(
      eye.joint.local({ left: eye.s * 0.07 }),
    );
    const direction = eye.joint.axis;

    b.lathe(
      [
        [0, -0.002],
        [0.021, -0.002],
        [0.024, 0.004],
        [0.022, 0.013],
        [0.016, 0.022],
        [0.009, 0.026],
        [0, 0.026],
      ],
      {
        at: socket,
        axis: direction,
        segments: 14,
        color: turretPaint,
        bone: eye.joint,
        name: `turret_${eye.joint.name}`,
      },
    );

    const apex = frame(
      socket.moved({
        left: direction.x * 0.026,
        up: direction.y * 0.026,
        forward: direction.z * 0.026,
      }),
      direction,
    );
    const iris = b.stick(
      new THREE.CylinderGeometry(0.0083, 0.0092, 0.0022, 12),
      C.gold,
      apex,
      { bone: eye.joint, embed: 0.35, name: "ochre_eye_ring" },
    );
    const irisHit = b.surface(iris).nearest(
      iris.at.clone().addScaledVector(direction, 0.02),
    );
    const pupil = b.stick(
      new THREE.SphereGeometry(0.0045, 10, 6),
      C.black,
      irisHit,
      {
        bone: eye.joint,
        scale: [1, 0.38, 1],
        embed: 0.32,
        name: "round_pupil",
      },
    );
    const glintHit = b.surface(pupil).nearest(
      pupil.at
        .clone()
        .addScaledVector(direction, 0.008)
        .add(new THREE.Vector3(0, 0.0018, 0.0012)),
    );
    b.stick(
      new THREE.SphereGeometry(0.00125, 6, 4),
      "#fff5cd",
      glintHit,
      { bone: eye.joint, embed: 0.4, name: "eye_catchlight" },
    );
  }

  // Small face details remain subordinate to the large eye and casque shapes.
  for (const s of [1, -1]) {
    const nostril = skullSurface.nearest(H.p([s * 0.04, -0.004, 0.082]));
    b.stick(
      new THREE.SphereGeometry(0.00165, 6, 4),
      C.darkGreen,
      nostril,
      { scale: [1, 0.4, 0.7], embed: 0.35, bone: head, name: "nostril" },
    );

    const lip = skullSurface.drape(
      catmull([
        H.p([s * 0.06, -0.015, 0.001]),
        H.p([s * 0.055, -0.02, 0.035]),
        H.p([s * 0.04, -0.019, 0.071]),
        H.p([s * 0.024, -0.018, 0.097]),
      ]),
      { lift: 0.00025 },
    );
    b.sweep(lip, 0.0009, {
      color: C.darkGreen,
      bone: head,
      sides: 5,
      name: "quiet_mouth_line",
    });

    for (let i = 0; i < 7; i++) {
      const hit = skullSurface.nearest(
        H.p([s * 0.07, -0.006 + (i % 2) * 0.005, -0.018 + i * 0.006]),
      );
      b.stick(
        new THREE.CylinderGeometry(0.0012, 0.0015, 0.0007, 6),
        i % 2 ? C.citron : C.turquoise,
        hit,
        { embed: 0.45, bone: head, name: "cheek_scale" },
      );
    }
  }

  return b.root;
}
