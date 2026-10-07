```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  spots,
  mottle,
} from "agentic-3js-builder";

export const meta = {
  name: "Sunburst Pufferfish",
  description:
    "An inflated, golden pufferfish with a sea-green crown, ivory prickles, inquisitive eyes, a little beaked mouth, and beautifully ribbed fan fins.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "sunburstPufferfish", detail: 1 });

  const C = {
    teal: "#365C53",
    tealLight: "#50756A",
    olive: "#6B7950",
    gold: "#D8AD48",
    amber: "#B78332",
    spot: "#786039",
    cream: "#F2E2B5",
    ivory: "#FFF2CF",
    fin: "#E8C66D",
    finLight: "#F3DFA3",
    eyeWhite: "#FFF6E2",
    iris: "#D68D32",
    irisEdge: "#72552D",
    black: "#182824",
    mouth: "#392E29",
    tongue: "#BA7760",
  };

  // Skeleton: a short internal spine, independent jaws, and fully spread fins.
  const core = b.joint("core", {
    at: [0, 0.25, 0],
    dir: [0, 0, 1],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [core, [0, 0.254, 0.125]],
    {
      parent: core,
      names: ["spine1", "chest"],
      role: "spine",
    },
  );
  const head = b.joint("head", {
    parent: spine.tip!,
    at: [0, 0.255, 0.18],
    dir: [0, 0, 1],
    role: "head",
  });

  const face = b.region({ at: [0, 0.247, 0.259], bone: head });
  const upperJaw = b.joint("upperJaw", {
    parent: head,
    at: face.p([0, 0.013, -0.023]),
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: face.p([0, -0.014, -0.026]),
    dir: [0, 0, 1],
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    [
      [0, 0.25, -0.205],
      [0, 0.25, -0.282],
      [0, 0.252, -0.332],
    ],
    {
      parent: core,
      names: ["tail1", "tail2", "tailFan"],
      role: "tail",
    },
  );

  type Joint = ReturnType<typeof b.joint>;
  type Chain = ReturnType<typeof b.chain>;

  function makeRays(name: string, wrist: Joint, tips: number[][]): Chain[] {
    return tips.map((tip, i) =>
      b.chain(`${name}Ray${i + 1}`, [wrist, tip], {
        parent: wrist,
        count: 1,
        role: "fan",
      }),
    );
  }

  function makeFin(
    name: string,
    root: number[],
    wrist: number[],
    tips: number[][],
    role: "wing" | "fan",
  ) {
    const base = b.chain(name, [root, wrist], {
      parent: core,
      names: [name, `${name}Wrist`],
      role,
    });
    return { base, rays: makeRays(name, base.tip!, tips) };
  }

  const pectorals = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const tips = [-65, -40, -15, 15, 40, 65].map((deg) => {
      const a = (deg * Math.PI) / 180;
      return [
        s * (0.242 + 0.142 * Math.cos(a)),
        0.259 + 0.086 * Math.sin(a),
        0.056 - 0.075 * Math.cos(a),
      ];
    });
    return makeFin(
      `pectoral${side}`,
      [s * 0.191, 0.259, 0.074],
      [s * 0.242, 0.259, 0.056],
      tips,
      "wing",
    );
  });

  const dorsal = makeFin(
    "dorsal",
    [0, 0.407, -0.145],
    [0, 0.446, -0.174],
    [
      [0, 0.526, -0.119],
      [0, 0.55, -0.165],
      [0, 0.537, -0.209],
      [0, 0.503, -0.246],
      [0, 0.458, -0.255],
    ],
    "fan",
  );

  const anal = makeFin(
    "anal",
    [0, 0.102, -0.157],
    [0, 0.073, -0.179],
    [
      [0, 0.029, -0.153],
      [0, 0.016, -0.194],
      [0, 0.026, -0.23],
      [0, 0.049, -0.254],
    ],
    "fan",
  );

  const tailRays = makeRays("caudal", tail.tip!, [
    [0, 0.359, -0.448],
    [0, 0.343, -0.486],
    [0, 0.301, -0.481],
    [0, 0.252, -0.46],
    [0, 0.203, -0.481],
    [0, 0.161, -0.486],
    [0, 0.145, -0.448],
  ]);

  // One simple inflated volume; its fine markings are painted, not tessellated.
  const goldenSpots = spots(C.gold, C.spot, {
    size: 0.043,
    amount: 0.23,
    seed: 19,
  });
  const greenCrown = mottle(C.teal, C.tealLight, {
    size: 0.065,
    contrast: 0.3,
    seed: 8,
  });
  const coat = paint((p, _n) => {
    const crownEdge =
      0.363 + 0.013 * Math.cos(p.z * 21) + 0.007 * Math.cos(p.x * 47);
    const bellyEdge = 0.174 + 0.012 * Math.cos(p.z * 18);
    if (p.y > crownEdge) return greenCrown;
    if (p.y < bellyEdge) return C.cream;
    if (p.z > 0.153 && Math.abs(p.x) < 0.14) return C.gold;
    return goldenSpots;
  });

  const body = b.loft(
    [
      { at: [0, 0.25, -0.237], w: 0.045, h: 0.052 },
      { at: [0, 0.25, -0.195], w: 0.205, h: 0.224 },
      { at: [0, 0.249, -0.13], w: 0.36, h: 0.366 },
      { at: [0, 0.248, -0.045], w: 0.451, h: 0.43 },
      { at: [0, 0.251, 0.045], w: 0.449, h: 0.438 },
      { at: [0, 0.254, 0.125], w: 0.38, h: 0.37 },
      { at: [0, 0.253, 0.19], w: 0.255, h: 0.278 },
      { at: [0, 0.248, 0.232], w: 0.127, h: 0.154 },
      { at: [0, 0.246, 0.247], w: 0.055, h: 0.074 },
    ],
    {
      bone: [core, spine, head, tail],
      color: coat,
      sides: 14,
      smooth: false,
      caps: "flat",
      name: "inflatedBody",
    },
  );
  const skin = b.surface(body);

  b.sweep(tail, [0.045, 0.023, 0.013], {
    color: C.gold,
    sectors: [
      [-75, 75, C.teal],
      [135, 225, C.cream],
    ],
    sides: 8,
    smooth: false,
    caps: "flat",
    name: "tailPeduncle",
  });

  const finPaint = paint((_p, _n, s) => {
    if (s[0] > 0.94) return C.amber;
    if (s[0] > 0.79) return C.finLight;
    if (s[0] < 0.2) return C.amber;
    return C.fin;
  });
  const tailPaint = paint((_p, _n, s) => {
    if (s[0] > 0.9) return C.teal;
    if (s[0] > 0.79) return C.ivory;
    if (s[0] < 0.22) return C.amber;
    return C.fin;
  });

  function drawWeb(
    rays: Chain[],
    web: ReturnType<typeof paint>,
    ribColor: string,
    ribRadius: number,
  ) {
    for (let i = 0; i < rays.length - 1; i++) {
      b.membrane(rays[i], rays[i + 1], {
        color: web,
        thickness: 0.003,
        rows: 2,
        cols: 5,
        scallop: 0.045,
        name: `${rays[i].joints[0].name}Web`,
      });
    }
    for (const ray of rays) {
      b.sweep(ray, [ribRadius, ribRadius * 0.45], {
        color: ribColor,
        sides: 5,
        smooth: false,
        caps: "round",
        name: `${ray.joints[0].name}Rib`,
      });
    }
  }

  for (const fin of pectorals) {
    b.sweep(fin.base, [0.015, 0.008], {
      color: C.amber,
      sides: 7,
      smooth: false,
    });
    drawWeb(fin.rays, finPaint, C.ivory, 0.0026);
  }
  for (const fin of [dorsal, anal]) {
    b.sweep(fin.base, [0.01, 0.006], {
      color: C.amber,
      sides: 6,
      smooth: false,
    });
    drawWeb(fin.rays, finPaint, C.finLight, 0.0022);
  }
  drawWeb(tailRays, tailPaint, C.ivory, 0.0025);

  // Broad green sockets frame forward-looking, jewel-like eyes.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const seat = skin.around([0, 0.25, 0]).at(s * 40, 21);

    b.stick(
      new THREE.SphereGeometry(0.067, 12, 8).scale(1, 0.58, 1),
      C.teal,
      seat,
      { embed: 0.3, bone: head, name: `eyeSocket${side}` },
    );

    const eyeball = b.stick(
      new THREE.SphereGeometry(0.058, 12, 8).scale(1, 0.8, 1),
      C.eyeWhite,
      seat,
      { embed: 0.3, bone: head, name: `eyeball${side}` },
    );

    const gaze = b
      .surface(eyeball)
      .around(eyeball.at)
      .at(s * 16, 3);

    const irisRim = b.stick(
      new THREE.SphereGeometry(0.035, 12, 6).scale(1, 0.18, 1),
      C.irisEdge,
      gaze,
      { embed: 0.4, bone: head, name: `irisRim${side}` },
    );
    const irisSeat = b.surface(irisRim).around(irisRim.at).at(s * 16, 3);
    const iris = b.stick(
      new THREE.SphereGeometry(0.0315, 12, 6).scale(1, 0.15, 1),
      C.iris,
      irisSeat,
      { embed: 0.45, bone: head, name: `iris${side}` },
    );
    const pupilSeat = b.surface(iris).around(iris.at).at(s * 16, 3);
    const pupil = b.stick(
      new THREE.SphereGeometry(0.024, 12, 6).scale(1, 0.17, 1),
      C.black,
      pupilSeat,
      { embed: 0.38, bone: head, name: `pupil${side}` },
    );

    const pupilSurface = b.surface(pupil);
    const sparkle = pupilSurface.nearest(
      pupil.at.clone().add(new THREE.Vector3(-0.009, 0.011, 0.05)),
    );
    b.stick(new THREE.SphereGeometry(0.006, 7, 5), "#FFFFFF", sparkle, {
      embed: 0.35,
      bone: head,
      name: `eyeSparkle${side}`,
    });
    const sparkleSmall = pupilSurface.nearest(
      pupil.at.clone().add(new THREE.Vector3(0.009, -0.007, 0.05)),
    );
    b.stick(new THREE.SphereGeometry(0.0027, 6, 4), C.eyeWhite, sparkleSmall, {
      embed: 0.4,
      bone: head,
    });
  }

  // Puffy muzzle pads, an actual dark opening, and separate upper/lower lips.
  b.part(new THREE.SphereGeometry(1, 12, 8), C.cream, {
    bone: upperJaw,
    at: face.p([0, 0.019, -0.01]),
    scale: [0.054, 0.025, 0.031],
    name: "upperMuzzle",
  });
  b.part(new THREE.SphereGeometry(1, 10, 7), C.cream, {
    bone: jaw,
    at: face.p([0, -0.025, -0.008]),
    scale: [0.04, 0.02, 0.026],
    name: "lowerMuzzle",
  });
  b.part(new THREE.SphereGeometry(1, 12, 8), C.mouth, {
    bone: head,
    at: face.p([0, -0.002, 0.018]),
    scale: [0.033, 0.033, 0.007],
    name: "mouthInterior",
  });

  const lipCenter = face.p([0, -0.002, 0.024]);
  b.part(new THREE.TorusGeometry(0.032, 0.01, 6, 12, Math.PI), C.ivory, {
    bone: upperJaw,
    at: lipCenter,
    axis: "z",
    name: "upperLip",
  });
  b.part(new THREE.TorusGeometry(0.032, 0.01, 6, 12, Math.PI), C.fin, {
    bone: jaw,
    at: lipCenter,
    rotation: [0, 0, 180],
    axis: "z",
    name: "lowerLip",
  });

  b.part(new THREE.SphereGeometry(1, 8, 5), C.tongue, {
    bone: jaw,
    at: face.p([0, -0.014, 0.025]),
    scale: [0.015, 0.007, 0.003],
    name: "tongue",
  });

  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.006, 0],
        [0.006, 0],
        [0.006, -0.011],
        [0.003, -0.014],
        [-0.003, -0.014],
        [-0.006, -0.011],
      ],
      {
        bone: upperJaw,
        at: face.p([s * 0.0067, 0.022, 0.032]),
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.007,
        bevel: 0.001,
        color: C.eyeWhite,
        name: s > 0 ? "upperToothL" : "upperToothR",
      },
    );
    b.extrude(
      [
        [-0.005, 0],
        [0.005, 0],
        [0.005, 0.007],
        [0.003, 0.009],
        [-0.003, 0.009],
        [-0.005, 0.007],
      ],
      {
        bone: jaw,
        at: face.p([s * 0.0056, -0.022, 0.031]),
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.006,
        bevel: 0.001,
        color: C.ivory,
        name: s > 0 ? "lowerToothL" : "lowerToothR",
      },
    );

    const nostrilSeat = skin.nearest([s * 0.035, 0.289, 0.35]);
    b.stick(
      new THREE.SphereGeometry(0.0075, 8, 5).scale(1, 0.4, 1),
      C.amber,
      nostrilSeat,
      { embed: 0.4, bone: head, name: `nostrilRim${s > 0 ? "L" : "R"}` },
    );
    b.stick(
      new THREE.SphereGeometry(0.0035, 7, 4).scale(1, 0.35, 1),
      C.spot,
      nostrilSeat,
      { embed: -0.05, bone: head },
    );

    for (let i = 0; i < 3; i++) {
      const pore = skin.nearest([
        s * (0.063 + i * 0.014),
        0.235 - (i % 2) * 0.009,
        0.34,
      ]);
      b.stick(new THREE.CylinderGeometry(0.0024, 0.0024, 0.001, 6), C.spot, pore, {
        embed: 0.3,
        bone: head,
        name: `cheekPore${s > 0 ? "L" : "R"}${i + 1}`,
      });
    }
  }

  // Short, sturdy prickles keep the silhouette unmistakably pufferfish.
  const thornHits = skin.scatter(142, {
    rng: rng(741),
    minDist: 0.033,
    filter: (h) => {
      const p = h.at;
      if (p.z > 0.12 && Math.abs(p.x) < 0.18 && p.y > 0.19) return false;
      if (p.y < 0.065) return false;
      if (
        Math.abs(p.x) > 0.175 &&
        Math.abs(p.y - 0.259) < 0.039 &&
        Math.abs(p.z - 0.065) < 0.051
      ) return false;
      if (
        Math.abs(p.x) < 0.026 &&
        p.z < -0.115 &&
        (p.y > 0.39 || p.y < 0.115)
      ) return false;
      return p.z > -0.211;
    },
  });

  thornHits.forEach((hit, i) => {
    let length = 0.021 + (((i * 7) % 13) / 12) * 0.009;
    if (hit.at.y < 0.1) length *= 0.7;
    const radius = 0.0062 + (((i * 5) % 9) / 8) * 0.0021;
    const baseColor =
      hit.at.y > 0.369 ? C.olive : hit.at.y < 0.18 ? C.fin : C.amber;

    b.sweep(
      [hit.moved([0, -0.002, 0]), hit.moved([0, length, 0])],
      [radius, 0],
      {
        bands: [
          [0.24, baseColor],
          [1, C.ivory],
        ],
        sides: 5,
        smooth: false,
        caps: "flat",
        group: "prickles",
        name: `prickle${i + 1}`,
      },
    );
  });

  // The lowest ventral prickle meets the floor precisely.
  const ventral = skin.around([0, 0.25, 0]).at(0, -90);
  b.spike(
    ventral,
    ventral,
    ventral.at.y / Math.max(0.5, -ventral.n.y),
    0.0075,
    {
      color: C.ivory,
      sides: 5,
      smooth: false,
      name: "ventralPrickle",
    },
  );

  return b.root;
}
```