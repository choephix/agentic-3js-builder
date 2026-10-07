```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  polyline,
  catmull,
  gradient,
  mottle,
  spots,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Prickly Puffer",
  description:
    "An inflated honey-gold pufferfish with an ivory belly, little porcupine spines, jade eyes, a tiny beaked mouth, and delicately ribbed fan fins.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Prickly Puffer", paintSize: 2048 });

  const C = {
    cream: "#f6e9bf",
    ivory: "#fff1cb",
    spine: "#eed494",
    spineLight: "#fff0bd",
    socket: "#735832",
    lip: "#dbc087",
    mouth: "#382b25",
    tooth: "#fff5db",
    rib: "#b58a42",
    finEdge: "#f6dfa3",
    gill: "#967445",
  };

  // Skeleton: the inflated body is skinned over two branches of the spine.
  const core = b.joint("spine", {
    at: [0, 0.241, 0],
    dir: [0, 0, 1],
    role: "spine",
  });

  const front = b.chain(
    "front",
    [core, [0, 0.241, 0.13], [0, 0.241, 0.248]],
    {
      parent: core,
      names: ["spineFront", "neck", "head"],
      role: "spine",
    },
  );
  const head = front.tip!;

  const rear = b.chain(
    "rear",
    [core, [0, 0.241, -0.15], [0, 0.241, -0.248]],
    {
      parent: core,
      names: ["spineRear", "caudalRoot"],
      role: "spine",
    },
  );

  const tail = b.chain(
    "tail",
    [
      [0, 0.241, -0.213],
      [0, 0.241, -0.302],
      [0, 0.241, -0.35],
    ],
    {
      parent: rear.joints[1],
      names: ["tail1", "tail2", "tailFan"],
      role: "tail",
    },
  );

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.195, 0.225],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const pectorals = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const base = [s * 0.219, 0.25, 0.055];
    return {
      s,
      side,
      base,
      bone: b.joint(`pectoral${side}`, {
        parent: core,
        at: base,
        dir: [s, 0, -0.32],
        role: "fan",
      }),
    };
  });

  const dorsalBase = [0, 0.429, -0.132];
  const dorsal = b.joint("dorsalFin", {
    parent: rear.joints[0],
    at: dorsalBase,
    dir: [0, 1, -0.4],
    role: "fan",
  });

  const analBase = [0, 0.117, -0.184];
  const anal = b.joint("analFin", {
    parent: rear.joints[1],
    at: analBase,
    dir: [0, -0.4, -1],
    role: "fan",
  });

  // A simple, faceted balloon is the dominant shape.
  const goldenBack = spots(
    mottle("#c4a14e", "#dfbf70", {
      size: 0.055,
      contrast: 0.32,
      seed: 19,
    }),
    ["#705a36", "#97783e"],
    { size: 0.034, amount: 0.22, seed: 31 },
  );

  const coat = gradient(
    C.cream,
    goldenBack,
    [0, 0.115, 0],
    [0, 0.365, 0],
  );

  const body = b.sweep(
    polyline([rear.at(1), core, front.at(1)]),
    (t) => {
      const roundness = Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2));
      return [
        0.004 + 0.231 * roundness,
        0.004 + 0.237 * roundness,
      ];
    },
    {
      bone: [rear, core, front],
      color: coat,
      sides: 16,
      smooth: false,
      caps: "round",
      name: "inflatedBody",
    },
  );
  const skin = b.surface(body);

  b.sweep(
    tail,
    (t) => [
      0.043 * (1 - t) + 0.015 * t,
      0.044 * (1 - t) + 0.022 * t,
    ],
    {
      color: coat,
      sides: 8,
      smooth: false,
      caps: "round",
      name: "tailPeduncle",
    },
  );

  // Slightly scalloped, planar fans retain the primitive-puppet silhouette.
  function fan(
    name: string,
    base: number[],
    tips: number[][],
    bone: ReturnType<typeof b.joint>,
    thickness = 0.003,
    band = false,
  ) {
    const edge: number[][] = [];
    for (let i = 0; i < tips.length; i++) {
      edge.push(tips[i]);
      if (i < tips.length - 1) {
        const midpoint = tips[i].map((v, k) => (v + tips[i + 1][k]) / 2);
        edge.push(midpoint.map((v, k) => base[k] + (v - base[k]) * 0.955));
      }
    }

    const far = tips[Math.floor(tips.length / 2)];
    const finColor = gradient("#c99a48", "#f1dba0", base, far);

    b.slab([base, ...edge], {
      color: finColor,
      thickness,
      bone,
      name: `${name}Web`,
    });

    for (let i = 0; i < tips.length; i++) {
      b.rod(base, tips[i], [0.0026, 0.0011], {
        color: C.rib,
        bone,
        sides: 5,
        name: `${name}Ray${i + 1}`,
      });
    }

    b.sweep(polyline(edge), 0.0017, {
      color: C.finEdge,
      bone,
      sides: 5,
      caps: "round",
      name: `${name}ScallopedRim`,
    });

    if (band) {
      const stripe = tips.map((p) =>
        p.map((v, k) => base[k] + (v - base[k]) * 0.86),
      );
      b.sweep(polyline(stripe), 0.0032, {
        color: "#c6a362",
        bone,
        sides: 5,
        name: `${name}TrailingBand`,
      });
    }
  }

  for (const fin of pectorals) {
    const rays = [
      [0.091, 0.068],
      [0.133, 0.061],
      [0.164, 0.028],
      [0.161, -0.016],
      [0.133, -0.054],
      [0.091, -0.069],
    ];
    const tips = rays.map(([out, height]) => [
      fin.base[0] + fin.s * out,
      fin.base[1] + height,
      fin.base[2] - out * 0.32,
    ]);
    fan(`pectoral${fin.side}`, fin.base, tips, fin.bone);
  }

  fan(
    "caudal",
    [0, 0.241, -0.35],
    [
      [0, 0.346, -0.488],
      [0, 0.331, -0.517],
      [0, 0.290, -0.538],
      [0, 0.244, -0.543],
      [0, 0.198, -0.533],
      [0, 0.153, -0.509],
      [0, 0.139, -0.481],
    ],
    tail.tip!,
    0.005,
    true,
  );

  fan(
    "dorsal",
    dorsalBase,
    [
      [0, 0.503, -0.128],
      [0, 0.542, -0.162],
      [0, 0.533, -0.201],
      [0, 0.491, -0.235],
      [0, 0.406, -0.249],
    ],
    dorsal,
    0.004,
  );

  fan(
    "anal",
    analBase,
    [
      [0, 0.079, -0.234],
      [0, 0.057, -0.264],
      [0, 0.065, -0.289],
      [0, 0.103, -0.303],
    ],
    anal,
  );

  // Spines grow from queried skin triangles, leaving a clean facial mask.
  const spineHits = skin.scatter(124, {
    rng: rng(402),
    minDist: 0.031,
    filter: (h) => {
      if (h.at.y < 0.049) return false;
      if (h.at.z > 0.12 && h.at.y > 0.155 && Math.abs(h.at.x) < 0.202)
        return false;
      if (h.at.z < -0.222 && Math.abs(h.at.x) < 0.065) return false;
      return true;
    },
  });

  spineHits.forEach((hit, i) => {
    const length =
      0.023 + 0.014 * Math.max(0, hit.n.y) + 0.006 * ((i % 4) / 3);
    const radius = length * 0.18;

    if (i % 3 === 0) {
      b.stick(
        new THREE.CylinderGeometry(radius * 1.5, radius * 1.6, 0.0017, 7),
        hit.at.y > 0.23 ? "#a18346" : "#d8c394",
        hit,
        { embed: 0.6, name: `spineSocket${i}` },
      );
    }

    b.stick(
      new THREE.ConeGeometry(radius, length, 5),
      hit.at.y > 0.30 && i % 3 !== 0 ? C.spine : C.spineLight,
      hit,
      {
        embed: 0.10,
        name: `spine${i + 1}`,
      },
    );
  });

  // Small recessed gill slits sit just forward of the paddle fins.
  for (const s of [1, -1]) {
    for (let i = 0; i < 2; i++) {
      const z = 0.088 + i * 0.015;
      const slit = skin.drape(
        catmull([
          [s * 0.223, 0.291, z],
          [s * 0.243, 0.260, z + 0.005],
          [s * 0.232, 0.228, z + 0.011],
        ]),
        { lift: 0.0008 },
      );
      b.sweep(slit, 0.0021, {
        color: C.gill,
        sides: 5,
        name: `gill${s > 0 ? "L" : "R"}${i + 1}`,
      });
    }
  }

  // Jewel-like iris drawings follow the bulging, primitive eyeballs.
  let irisRays = "";
  for (let i = 0; i < 28; i++) {
    const a = (i * Math.PI * 2) / 28;
    const inner = i % 2 ? 18.5 : 20.5;
    irisRays += `<path d="M ${32 + Math.cos(a) * inner} ${
      32 + Math.sin(a) * inner
    } L ${32 + Math.cos(a) * 26} ${32 + Math.sin(a) * 26}"
      stroke="${i % 3 ? "#aec99c" : "#e8cd82"}"
      stroke-width="1.15" stroke-linecap="round"/>`;
  }

  const irisTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="31" fill="#334b40"/>
      <circle cx="32" cy="32" r="28" fill="#639985"/>
      <circle cx="32" cy="32" r="24" fill="#4d887a"/>
      ${irisRays}
      <circle cx="32" cy="32" r="17.1" fill="#bbbc79"/>
      <circle cx="32" cy="32" r="15.3" fill="#162925"/>
      <circle cx="31" cy="32" r="12.8" fill="#14201e"/>
      <ellipse cx="24" cy="22" rx="6" ry="7" fill="#fffdf1"/>
      <circle cx="40" cy="40" r="2.7" fill="#e0f5dc"/>
      <path d="M 43 48 Q 49 44 51 37" fill="none"
        stroke="#cee1b6" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  function outwardHit(part: ReturnType<typeof b.part>, direction: THREE.Vector3) {
    const surface = b.surface(part);
    const origin = part.at.clone().addScaledVector(direction, 0.2);
    return (
      surface.ray(origin, direction.clone().negate()) ??
      surface.nearest(origin)
    );
  }

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const seat = skin.around(core.at).at(s * 38, 18);

    const socket = b.stick(
      new THREE.SphereGeometry(0.052, 12, 8),
      C.socket,
      seat,
      {
        bone: head,
        scale: [1, 0.8, 1],
        embed: 0.60,
        name: `eyeSocket${side}`,
      },
    );

    const gaze = new THREE.Vector3(s * 0.4, 0.12, 1).normalize();
    const eyeball = b.stick(
      new THREE.SphereGeometry(0.045, 16, 10),
      "#f5e9c8",
      outwardHit(socket, gaze),
      {
        bone: head,
        scale: [1, 0.72, 1],
        embed: 0.74,
        name: `eyeball${side}`,
      },
    );

    b.decal(eyeball, irisTexture, {
      at: outwardHit(eyeball, gaze),
      dir: gaze,
      size: [0.062, 0.062],
      segments: 10,
      lift: 0.0008,
      bone: head,
      name: `jadeIris${side}`,
    });

    for (let i = 0; i < 3; i++) {
      const freckle = skin.around(core.at).at(s * (22 + i * 10), -7 - i * 2);
      b.stick(
        new THREE.CylinderGeometry(0.0027, 0.0027, 0.0012, 7),
        "#a38956",
        freckle,
        { embed: 0.65, name: `cheekFreckle${side}${i}` },
      );
    }
  }

  // The little pucker has independent upper and lower jaws.
  const face = b.region({ at: head, bone: head });
  const F = (x: number, y: number, z: number) => face.p([x, y, z]);

  b.part(new THREE.SphereGeometry(0.043, 12, 8), C.cream, {
    at: F(0, -0.026, -0.008),
    bone: head,
    scale: [1, 0.45, 0.40],
    name: "upperMuzzle",
  });

  b.part(new THREE.SphereGeometry(0.030, 12, 8), C.mouth, {
    at: F(0, -0.041, 0.004),
    bone: head,
    scale: [1, 0.69, 0.43],
    name: "mouthInterior",
  });

  b.part(new THREE.SphereGeometry(0.031, 12, 8), C.cream, {
    at: F(0, -0.059, -0.001),
    bone: jaw,
    scale: [1, 0.38, 0.47],
    name: "lowerJaw",
  });

  b.sweep(
    catmull([
      F(-0.032, -0.041, 0.004),
      F(-0.023, -0.025, 0.015),
      F(0, -0.017, 0.021),
      F(0.023, -0.025, 0.015),
      F(0.032, -0.041, 0.004),
    ]),
    0.008,
    {
      color: C.lip,
      bone: head,
      sides: 7,
      name: "upperLip",
    },
  );

  b.sweep(
    catmull([
      F(-0.030, -0.042, 0.006),
      F(-0.021, -0.056, 0.016),
      F(0, -0.061, 0.021),
      F(0.021, -0.056, 0.016),
      F(0.030, -0.042, 0.006),
    ]),
    0.007,
    {
      color: "#ead3a0",
      bone: jaw,
      sides: 7,
      name: "lowerLip",
    },
  );

  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.012, 0.010, 0.008), C.tooth, {
      at: F(s * 0.0065, -0.033, 0.025),
      bone: head,
      rotation: [0, 0, s * -4],
      name: `upperBeak${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.BoxGeometry(0.0105, 0.006, 0.007), C.tooth, {
      at: F(s * 0.0057, -0.049, 0.023),
      bone: jaw,
      name: `lowerBeak${s > 0 ? "L" : "R"}`,
    });
  }

  return b.root;
}
```