```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  polyline,
  catmull,
  arc,
  countershade,
  paint,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Oh! A Balloon Puffer",
  description:
    "A hovering, thoroughly startled pufferfish: a buttery leopard-spotted balloon, ivory spines, anxious saucer eyes, a tiny O-shaped pout, scalloped fins and a rising trail of bubbles.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "startledPuffer", paintSize: 1024 });
  const random = rng(3817);
  const Y = 0.35;
  const R = 0.25;

  const C = {
    yellow: "#ecd184",
    belly: "#fffbed",
    gold: "#cfaa62",
    socket: "#c29b55",
    brown: "#80542e",
    cream: "#fff1c7",
    white: "#fffdf3",
    iris: "#ae864a",
    pupil: "#28221f",
    mouth: "#684332",
    upperLip: "#c79856",
    lowerLip: "#ecc57b",
    fin: "#f8e2a7",
    finEdge: "#d9af61",
    finRay: "#c8a15a",
  };

  // Skeleton first. The inflated body swims above the floor.
  const core = b.joint("core", {
    at: [0, Y, 0],
    dir: [0, 0, 1],
    role: "spine",
  });

  const front = b.chain(
    "spine",
    [
      core,
      [0, Y, 0.14],
      [0, Y, R],
    ],
    { parent: core, names: ["spine1", "spine2"], role: "spine" },
  );
  const back = b.chain(
    "back",
    [
      core,
      [0, Y, -0.16],
      [0, Y, -R],
    ],
    { parent: core, names: ["spineBack1", "spineBack2"], role: "spine" },
  );

  const head = b.joint("head", {
    parent: front.joints[1],
    at: [0, Y, 0.175],
    dir: [0, 0, 1],
    role: "head",
  });
  const upperJaw = b.joint("upperJaw", {
    parent: head,
    at: [0, Y - 0.052, 0.24],
    dir: [0, 0, 1],
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, Y - 0.074, 0.239],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const fins = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const chain = b.chain(
      `pectoral${side}`,
      [
        [s * 0.235, Y - 0.005, 0],
        [s * 0.28, Y - 0.005, 0.008],
        [s * 0.385, Y - 0.005, 0.023],
      ],
      {
        parent: core,
        names: [`shoulder${side}`, `fin${side}`, `finTip${side}`],
        role: "wing",
      },
    );
    return { s, side, chain };
  });

  const tail = b.chain(
    "tail",
    [
      [0, Y, -0.222],
      [0, Y, -0.302],
      [0, Y, -0.422],
    ],
    {
      parent: back.joints[1],
      names: ["tailBase", "tail1", "tailTip"],
      role: "tail",
    },
  );

  // One inflated, softly skinned ball, with deliberately visible facets.
  const skinPaint = countershade(C.yellow, C.belly, {
    level: -0.12,
    soft: 0.62,
  });
  const body = b.sweep(
    polyline([
      [0, Y, -R],
      [0, Y, R],
    ]),
    (t) => R * Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2)),
    {
      bone: [back, core, front],
      color: skinPaint,
      sides: 24,
      smooth: false,
      caps: "flat",
      name: "inflatedBall",
    },
  );
  const skin = b.surface(body);

  // Broken, irregular rosettes rather than regular polka dots.
  const rosettes = [
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <path fill="#d8b369" d="M24 20L38 18L46 29L40 43L25 45L18 33Z"/>
        <g fill="#80542e">
          <path d="M10 20L18 10L30 8L35 14L29 19L21 17L17 27L10 28Z"/>
          <path d="M40 10L49 15L55 26L51 34L44 30L44 22L37 18Z"/>
          <path d="M47 40L54 39L53 49L44 56L34 55L31 48L42 47Z"/>
          <path d="M11 37L18 33L23 40L23 46L31 49L28 56L16 52L9 44Z"/>
        </g>
      </svg>`,
      { size: 192 },
    ),
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <path fill="#d6ad63" d="M20 24L31 17L44 23L47 36L37 46L24 43L17 34Z"/>
        <g fill="#865831">
          <path d="M9 29L13 16L23 10L31 13L27 20L20 22L18 31Z"/>
          <path d="M35 10L46 11L55 21L53 30L45 29L43 20L35 18Z"/>
          <path d="M48 35L56 38L52 49L44 54L37 50L41 43Z"/>
          <path d="M12 39L20 37L26 45L33 47L30 55L19 54L10 47Z"/>
          <path d="M4 18L8 15L11 18L9 23L5 23Z"/>
        </g>
      </svg>`,
      { size: 192 },
    ),
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <g fill="#82552e">
          <path d="M17 16L29 11L38 15L39 24L32 31L20 29L13 23Z"/>
          <path d="M39 32L50 29L56 35L53 46L45 51L36 45L34 38Z"/>
          <path d="M13 40L21 35L28 41L27 50L17 54L10 47Z"/>
        </g>
      </svg>`,
      { size: 192 },
    ),
  ];

  function clearFace(p: THREE.Vector3): boolean {
    if (p.z > 0.145) {
      for (const s of [1, -1]) {
        const dx = p.x - s * 0.112;
        const dy = p.y - (Y + 0.082);
        if (dx * dx + dy * dy < 0.094 * 0.094) return false;
      }
      if (
        Math.abs(p.x) < 0.046 &&
        Math.abs(p.y - (Y - 0.068)) < 0.047
      )
        return false;
    }
    if (
      Math.abs(p.x) > 0.22 &&
      Math.abs(p.y - Y) < 0.031 &&
      Math.abs(p.z) < 0.041
    )
      return false;
    if (
      p.z < -0.229 &&
      Math.abs(p.x) < 0.035 &&
      Math.abs(p.y - Y) < 0.038
    )
      return false;
    return true;
  }

  const spotHits = skin.scatter(43, {
    rng: rng(901),
    minDist: 0.049,
    filter: (h) => h.at.y > Y + 0.013 && clearFace(h.at),
  });
  spotHits.forEach((hit, i) => {
    const width = 0.037 + random() * 0.023;
    b.decal(body, rosettes[i % rosettes.length], {
      at: hit,
      size: [width, width * (0.87 + random() * 0.19)],
      roll: random() * 360,
      segments: 5,
      lift: 0.0007,
      name: `leopardRosette${i}`,
    });
  });

  // Short ivory prickles, including the sides, underside and back.
  const spikeHits = skin.scatter(205, {
    rng: rng(732),
    minDist: 0.031,
    filter: (h) => clearFace(h.at),
  });
  spikeHits.forEach((hit, i) => {
    const length = 0.016 + random() * 0.012;
    const radius = 0.0043 + random() * 0.0017;
    const upper = hit.at.y > Y + 0.015;
    const lower = hit.at.y < Y - 0.09;
    b.stick(
      new THREE.CylinderGeometry(radius * 1.25, radius * 1.45, 0.0028, 6),
      lower ? "#eee7ce" : upper ? "#d4b46c" : "#e9d197",
      hit,
      { embed: 0.55, name: `spineSocket${i}` },
    );
    b.stick(
      new THREE.ConeGeometry(radius, length, 6),
      lower ? C.white : C.cream,
      hit,
      { embed: 0.07, flat: true, name: `prickle${i}` },
    );
  });

  // Proudly bulging eyes: cream sclera, little warm irises and alarmed pupils.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const anchor = skin.around(core.at).at(s * 26, 17);

    const socket = b.stick(new THREE.SphereGeometry(1, 16, 10), C.socket, anchor, {
      scale: [0.074, 0.025, 0.079],
      embed: 0.3,
      bone: head,
      name: `eyeSocket${side}`,
    });
    const eye = b.stick(new THREE.SphereGeometry(1, 18, 12), C.white, anchor, {
      scale: [0.065, 0.051, 0.069],
      embed: 0.22,
      bone: head,
      name: `wideEye${side}`,
    });
    const eyeFront = b.surface(eye).around(eye.at).at(-s * 6, -2);
    const iris = b.stick(new THREE.SphereGeometry(1, 14, 8), C.iris, eyeFront, {
      scale: [0.031, 0.008, 0.031],
      embed: 0.22,
      bone: head,
      name: `iris${side}`,
    });
    const irisFront = b.surface(iris).around(iris.at).at(-s * 6, -2);
    const pupil = b.stick(
      new THREE.SphereGeometry(1, 14, 8),
      C.pupil,
      irisFront,
      {
        scale: [0.021, 0.006, 0.021],
        embed: 0.18,
        bone: head,
        name: `startledPupil${side}`,
      },
    );
    b.part(new THREE.SphereGeometry(0.0055, 8, 6), "#ffffff", {
      bone: head,
      at: pupil.local([-0.0065, 0.005, 0.0075]),
      name: `eyeCatchlight${side}`,
    });
    b.part(new THREE.SphereGeometry(0.0023, 6, 4), "#fff5d9", {
      bone: head,
      at: pupil.local([0.008, 0.0048, -0.006]),
      name: `eyeCatchlightSmall${side}`,
    });

    // The brows climb towards the middle: worried, rather than angry.
    const browSurface = b.surface([socket, eye]);
    const browRoute = catmull([
      eye.local([-0.056, 0.004, 0.056 - s * 0.014]),
      eye.local([-0.027, 0.006, 0.069 - s * 0.007]),
      eye.local([0.014, 0.005, 0.071 + s * 0.004]),
      eye.local([0.05, 0.003, 0.059 + s * 0.014]),
    ]);
    b.sweep(browSurface.drape(browRoute, { lift: 0.001 }), 0.008, {
      bone: head,
      color: "#e3bd71",
      sides: 6,
      name: `browCushion${side}`,
    });
    b.sweep(browSurface.drape(browRoute, { lift: 0.007 }), 0.0045, {
      bone: head,
      color: C.brown,
      sides: 6,
      name: `worriedBrow${side}`,
    });

    const cheekLine = skin.drape(
      catmull([
        [s * 0.064, Y - 0.004, 0.24],
        [s * 0.094, Y - 0.018, 0.235],
        [s * 0.12, Y - 0.013, 0.225],
      ]),
      { lift: 0.0015 },
    );
    b.sweep(cheekLine, 0.0022, {
      bone: head,
      color: "#c5a267",
      sides: 5,
      name: `anxiousCheekCrease${side}`,
    });
  }

  // Tiny projecting pout. Upper and lower mouth pieces have separate bones.
  const mouthAt: [number, number, number] = [0, Y - 0.069, 0.267];
  const upper = b.region({ at: mouthAt, bone: upperJaw });
  const lower = b.region({ at: mouthAt, bone: jaw });

  b.part(new THREE.SphereGeometry(1, 12, 8), "#edcd8b", {
    bone: upperJaw,
    at: upper.p([0, 0.01, -0.01]),
    scale: [0.029, 0.021, 0.018],
    name: "upperPout",
  });
  b.part(new THREE.SphereGeometry(1, 12, 8), "#f4dba1", {
    bone: jaw,
    at: lower.p([0, -0.014, -0.008]),
    scale: [0.028, 0.018, 0.018],
    name: "lowerPout",
  });

  b.extrude(
    [
      [-0.018, 0],
      [-0.015, 0.014],
      [-0.007, 0.019],
      [0.007, 0.019],
      [0.015, 0.014],
      [0.018, 0],
    ],
    {
      at: upper.p([0, 0, 0.007]),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.003,
      color: C.mouth,
      bone: upperJaw,
      name: "upperMouthInterior",
    },
  );
  b.extrude(
    [
      [-0.018, 0],
      [0.018, 0],
      [0.014, -0.014],
      [0.007, -0.019],
      [-0.007, -0.019],
      [-0.014, -0.014],
    ],
    {
      at: lower.p([0, 0, 0.007]),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.003,
      color: C.mouth,
      bone: jaw,
      name: "lowerMouthInterior",
    },
  );

  b.sweep(
    catmull([
      upper.p([-0.019, 0, 0.013]),
      upper.p([-0.015, 0.015, 0.015]),
      upper.p([0, 0.021, 0.016]),
      upper.p([0.015, 0.015, 0.015]),
      upper.p([0.019, 0, 0.013]),
    ]),
    0.0054,
    { color: C.upperLip, bone: upperJaw, sides: 8, name: "upperLip" },
  );
  b.sweep(
    catmull([
      lower.p([0.019, 0, 0.013]),
      lower.p([0.014, -0.014, 0.015]),
      lower.p([0, -0.02, 0.017]),
      lower.p([-0.014, -0.014, 0.015]),
      lower.p([-0.019, 0, 0.013]),
    ]),
    0.006,
    { color: C.lowerLip, bone: jaw, sides: 8, name: "lowerLip" },
  );
  b.sweep(
    catmull([
      lower.p([-0.008, -0.021, 0.021]),
      lower.p([0, -0.022, 0.022]),
      lower.p([0.007, -0.02, 0.021]),
    ]),
    0.0015,
    { color: "#fff0c3", bone: jaw, sides: 5, name: "lipHighlight" },
  );

  // Scalloped little pectoral fans, held apart in an animation-friendly pose.
  const finOutline: [number, number][] = [
    [0, -0.013],
    [0.03, -0.038],
    [0.082, -0.053],
    [0.091, -0.037],
    [0.106, -0.027],
    [0.098, -0.013],
    [0.113, 0],
    [0.099, 0.013],
    [0.105, 0.029],
    [0.088, 0.034],
    [0.087, 0.05],
    [0.067, 0.045],
    [0.06, 0.057],
    [0.029, 0.035],
    [0, 0.014],
  ];
  const finTips: [number, number][] = [
    [0.082, -0.053],
    [0.106, -0.027],
    [0.113, 0],
    [0.105, 0.029],
    [0.087, 0.05],
    [0.06, 0.057],
  ];
  const finPaint = paint((_p, _n, s) => {
    const r = Math.hypot(s[0], s[1]);
    return r > 0.098 ? C.finEdge : r > 0.085 ? "#efd18b" : C.fin;
  });

  for (const { s, side, chain } of fins) {
    b.sweep(chain, [0.019, 0.005], {
      from: 0,
      to: 0.34,
      color: C.yellow,
      sides: 8,
      name: `pectoralStem${side}`,
    });
    const fin = b.extrude(finOutline, {
      at: chain.joints[1],
      x: [s, 0, 0.15],
      y: [0, 1, 0],
      thickness: 0.006,
      bevel: 0.001,
      color: finPaint,
      bone: chain.joints[1],
      name: `scallopedFin${side}`,
    });
    b.sweep(
      polyline(
        finOutline.map(([u, v]) => fin.local([u, v, 0])),
        { closed: true },
      ),
      0.0018,
      {
        bone: chain.joints[1],
        color: C.finEdge,
        sides: 5,
        name: `finRim${side}`,
      },
    );
    for (const face of [-1, 1]) {
      finTips.forEach(([u, v], i) => {
        b.rod(
          fin.local([0.009, 0, face * 0.0035]),
          fin.local([u * 0.95, v * 0.95, face * 0.0035]),
          [0.002, 0.0009],
          {
            color: C.finRay,
            bone: chain.joints[1],
            sides: 5,
            name: `finRay${side}_${face > 0 ? "front" : "back"}_${i}`,
          },
        );
      });
    }
  }

  // Short caudal peduncle and a vertically flared, scalloped tail fan.
  b.sweep(tail, (t) => 0.036 - t * 0.029, {
    from: 0,
    to: 0.48,
    color: skinPaint,
    sides: 8,
    caps: "flat",
    name: "stubbyTailStem",
  });
  const tailOutline: [number, number][] = [
    [0, -0.017],
    [0.037, -0.037],
    [0.104, -0.07],
    [0.108, -0.05],
    [0.128, -0.041],
    [0.12, -0.021],
    [0.14, 0],
    [0.12, 0.021],
    [0.128, 0.041],
    [0.108, 0.05],
    [0.104, 0.07],
    [0.037, 0.037],
    [0, 0.017],
  ];
  const tailPaint = paint((_p, _n, s) => {
    const r = Math.hypot(s[0], s[1]);
    return r > 0.122 ? C.finEdge : r > 0.107 ? "#e6c27a" : C.fin;
  });
  const tailFan = b.extrude(tailOutline, {
    at: tail.joints[1],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.002,
    color: tailPaint,
    bone: tail.joints[1],
    name: "stubbyFanTail",
  });
  b.sweep(
    polyline(
      tailOutline.map(([u, v]) => tailFan.local([u, v, 0])),
      { closed: true },
    ),
    0.0021,
    {
      color: C.finEdge,
      bone: tail.joints[1],
      sides: 5,
      name: "tailScallopedRim",
    },
  );
  const tailTips: [number, number][] = [
    [0.104, -0.07],
    [0.128, -0.041],
    [0.14, 0],
    [0.128, 0.041],
    [0.104, 0.07],
  ];
  for (const face of [-1, 1]) {
    tailTips.forEach(([u, v], i) => {
      b.rod(
        tailFan.local([0.007, 0, face * 0.0065]),
        tailFan.local([u * 0.95, v * 0.95, face * 0.0065]),
        [0.0027, 0.0012],
        {
          color: C.finRay,
          bone: tail.joints[1],
          sides: 6,
          name: `tailRay_${face > 0 ? "L" : "R"}_${i}`,
        },
      );
    });
  }

  // Glassy, lightly outlined bubbles with bright crescent reflections.
  const bubbles = [
    { x: 0.002, y: Y - 0.027, z: 0.32, r: 0.009 },
    { x: -0.023, y: Y + 0.084, z: 0.347, r: 0.014 },
    { x: -0.034, y: Y + 0.223, z: 0.354, r: 0.021 },
    { x: -0.007, y: Y + 0.358, z: 0.345, r: 0.017 },
  ];
  bubbles.forEach(({ x, y, z, r }, i) => {
    const shell = b.part(new THREE.SphereGeometry(r, 14, 10), "#c5e7eb", {
      at: [x, y, z],
      bone: core,
      name: `bubble${i}`,
    });
    const material = shell.mesh.material as THREE.MeshStandardMaterial;
    material.transparent = true;
    material.opacity = 0.24;
    material.roughness = 0.16;
    material.metalness = 0;
    material.depthWrite = false;

    b.part(new THREE.TorusGeometry(r * 0.96, 0.00085, 4, 20), "#a9d5dc", {
      at: [x, y, z],
      bone: core,
      name: `bubbleRim${i}`,
    });
    b.sweep(
      arc(
        [x, y, z + r * 0.65],
        [x - r * 0.53, y + r * 0.53, z + r * 0.65],
        [0, 0, 1],
        -58,
      ),
      r * 0.067,
      {
        color: "#ffffff",
        bone: core,
        sides: 5,
        name: `bubbleCrescent${i}`,
      },
    );
    b.part(new THREE.SphereGeometry(r * 0.105, 6, 4), "#f4ffff", {
      at: [x + r * 0.32, y - r * 0.36, z + r * 0.84],
      bone: core,
      name: `bubbleGlint${i}`,
    });
  });

  return b.root;
}
```