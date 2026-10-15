import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  bezier,
  svg,
  paint,
  grain,
  mottle,
  mix,
  noise,
} from "../../../../src/index";
import type { Fill, Joint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Thornwarden, the Elder Oak",
  description:
    "An ancient, battle-scarred tree guardian: massive layered bark, root hands and feet, a stern luminous face, an emerald heartwood seal, and a crown of wind-torn oak branches.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Thornwarden", paintSize: 2048 });
  const random = rng(73915);

  const C = {
    deepest: "#201f20",
    woodDark: "#382b24",
    wood: "#674431",
    woodLight: "#986541",
    woodEdge: "#bb8950",
    heartwood: "#cca36b",
    mossDark: "#243c30",
    moss: "#446743",
    mossLight: "#789452",
    leafDark: "#344b31",
    leaf: "#668044",
    leafGold: "#a1ac56",
    leafLight: "#c6b966",
    stone: "#586563",
    stoneDark: "#344242",
    earth: "#30352d",
    aqua: "#58ecd0",
    aquaLight: "#c4ffdb",
  };

  const woodGrain = grain("#493326", "#895a39", {
    size: 0.055,
    axis: "y",
    seed: 14,
  });
  const bark = paint((p, n) => {
    const light = n.x * 0.28 + n.y * 0.76 + n.z * 0.48;
    const broad = noise(p, 0.48, 21);
    const base = light > 0.34
      ? mix("#96683f", "#bd935b", broad * 0.64)
      : light > -0.28
        ? mix("#604634", "#896041", broad * 0.62)
        : mix("#333a32", "#514034", broad * 0.55);
    return mix(base, woodGrain.at(p, n), 0.12);
  });
  const oldBark = paint((p, n) => {
    const broad = noise(p, 0.37, 31);
    const light = Math.max(0, n.y * 0.7 + n.z * 0.3);
    return mix("#30382f", "#6e5037", 0.19 + broad * 0.45 + light * 0.2);
  });
  const cutWood = grain("#99734b", "#d4ad74", {
    size: 0.035,
    axis: "z",
    seed: 6,
  });
  const moss = paint((p, n) =>
    mix(
      "#294637",
      "#8a9951",
      Math.min(1, noise(p, 0.17, 43) * 0.8 + Math.max(0, n.y) * 0.25),
    ),
  );
  const stonePaint = mottle("#384b4a", "#708078", {
    size: 0.21,
    seed: 7,
  });
  const earthPaint = mottle("#272e27", "#4c5037", {
    size: 0.24,
    seed: 10,
  });
  const forestFloor = paint((p, _n) => {
    const patches = noise(p, 0.56, 91);
    const soil = mix("#393b2d", "#696044", noise(p, 0.19, 16));
    const green = mix("#354c35", "#657748", noise(p, 0.25, 17));
    return mix(soil, green, Math.max(0, Math.min(1, (patches - 0.35) * 3)))
  });

  // Drawings are deliberately bold enough to remain legible on the puppet.
  const eyeTexture = svg(
    `<svg viewBox="0 0 160 72">
      <path d="M5 39 Q42 6 79 16 Q121 18 155 35 Q117 62 74 58 Q34 57 5 39Z"
        fill="#173d35" stroke="#102822" stroke-width="6"/>
      <path d="M16 37 Q51 18 82 23 Q118 24 143 35 Q111 49 77 50 Q43 49 16 37Z"
        fill="#55e9c5"/>
      <path d="M43 36 Q82 24 121 35 Q82 44 43 36Z" fill="#caffdb"/>
      <path d="M78 24 L85 24 L83 48 L77 48Z" fill="#176c57"/>
      <path d="M27 31 Q52 21 69 23" fill="none" stroke="#f3ffe5" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const ringsTexture = svg(
    `<svg viewBox="0 0 200 200">
      <path d="M100 5 Q148 2 176 35 Q201 64 192 110 Q188 153 151 178
        Q105 204 60 184 Q15 167 7 116 Q0 68 31 34 Q57 4 100 5Z"
        fill="#b38b55" stroke="#3a3026" stroke-width="8"/>
      <g fill="none" stroke="#725231" stroke-width="4">
        <path d="M102 21 Q157 15 177 68 Q198 121 151 163 Q111 194 58 161
          Q19 139 25 89 Q28 34 102 21Z"/>
        <path d="M98 38 Q146 27 160 75 Q178 119 141 147 Q98 178 62 144
          Q37 122 43 83 Q49 45 98 38Z"/>
        <path d="M96 57 Q132 45 145 84 Q157 118 125 135 Q91 153 68 124
          Q52 91 74 70Z"/>
        <path d="M98 76 Q123 66 127 94 Q138 117 108 123 Q81 126 80 102Z"/>
      </g>
      <path d="M99 100 L104 126 L91 143 L99 170 L88 190 M167 44 L143 62 L148 79"
        fill="none" stroke="#4e3b28" stroke-width="6"/>
      <path d="M29 70 Q35 39 68 27 M120 153 Q148 145 160 122"
        fill="none" stroke="#ddbe7f" stroke-width="4"/>
    </svg>`,
    { size: 384 },
  );

  const sealTexture = svg(
    `<svg viewBox="0 0 200 200">
      <g fill="none" stroke="#63e4ba" stroke-linecap="square">
        <path d="M100 13 L157 43 L182 100 L154 156 L100 185 L43 155 L18 100 L45 44Z"
          stroke-width="5"/>
        <path d="M100 35 L100 151 M100 68 L72 49 M100 82 L132 59
          M100 105 L62 77 M100 120 L143 88 M100 151 L73 164 M100 151 L125 164"
          stroke-width="9"/>
        <path d="M100 33 L91 47 L100 58 L109 47Z" stroke-width="4"/>
        <path d="M43 93 L34 102 L42 112 M160 94 L167 102 L160 111
          M64 144 L57 134 M138 143 L146 133" stroke-width="5"/>
      </g>
      <g fill="#d7ffe2">
        <circle cx="100" cy="13" r="4"/><circle cx="182" cy="100" r="4"/>
        <circle cx="18" cy="100" r="4"/><circle cx="100" cy="185" r="4"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  const leafTexture = svg(
    `<svg viewBox="0 0 96 160">
      <path d="M46 153 L45 132 Q17 137 18 118 Q-1 115 12 94
        Q-3 76 18 68 Q6 49 28 45 Q19 28 39 24 L48 3
        L60 24 Q80 27 68 46 Q93 48 80 69 Q101 79 85 95
        Q100 118 77 119 Q79 139 52 133 L51 153Z"
        fill="#83934c" stroke="#344c30" stroke-width="4"/>
      <path d="M48 13 L48 147" fill="none" stroke="#dac985" stroke-width="4"/>
      <path d="M48 47 L32 34 M48 66 L20 57 M48 88 L19 79 M48 113 L25 104
        M48 47 L64 34 M48 66 L77 57 M48 88 L78 79 M48 113 L73 104"
        stroke="#c0b66c" stroke-width="3" fill="none"/>
      <path d="M51 19 L57 28 L51 123Z" fill="#b3b65c"/>
    </svg>`,
    { size: 256 },
  );

  const fernTexture = svg(
    `<svg viewBox="0 0 100 180">
      <path d="M50 173 Q49 90 55 8" fill="none" stroke="#9aa869" stroke-width="5"/>
      <g fill="#678751" stroke="#354e36" stroke-width="2">
        <path d="M50 155 Q12 150 6 119 Q29 119 50 145Z"/>
        <path d="M50 155 Q90 146 94 119 Q72 120 50 145Z"/>
        <path d="M50 128 Q10 117 12 92 Q36 96 51 120Z"/>
        <path d="M51 128 Q88 117 90 90 Q66 95 51 120Z"/>
        <path d="M51 101 Q19 91 20 67 Q40 72 52 94Z"/>
        <path d="M52 101 Q82 88 84 65 Q64 73 52 94Z"/>
        <path d="M53 76 Q27 66 30 46 Q46 49 53 69Z"/>
        <path d="M53 76 Q76 63 78 44 Q62 50 53 69Z"/>
        <path d="M54 51 Q35 38 40 25 Q51 29 54 44Z"/>
        <path d="M54 51 Q70 37 69 23 Q58 29 54 44Z"/>
        <path d="M55 32 Q45 15 55 4 Q66 18 55 32Z"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const stoneRuneTexture = svg(
    `<svg viewBox="0 0 100 160">
      <g stroke="#162e2c" stroke-width="12" fill="none" stroke-linejoin="miter">
        <path d="M50 12 L25 42 L50 68 L74 42Z M50 68 L50 140 M26 89 L50 110 L75 89"/>
      </g>
      <g stroke="#82bda0" stroke-width="5" fill="none">
        <path d="M50 12 L25 42 L50 68 L74 42Z M50 68 L50 140 M26 89 L50 110 L75 89"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  // Skeleton first. The scene root keeps the little woodland stage independent.
  const scene = b.joint("sceneRoot", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: scene,
    at: [0, 1.86, 0],
    dir: [0, 1, 0],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [[0, 1.82, 0], [0, 2.4, -0.025], [0, 3.12, 0]],
    { parent: hips, names: ["spineLower", "chest", "spineUpper"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [[0, 3.12, 0], [0, 3.45, 0.06]],
    { parent: spine.tip!, names: ["neck", "neckTop"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 3.54, 0.08],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 3.27, 0.13],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const sides = [1, -1].map((s) => {
    const suffix = s === 1 ? "L" : "R";
    const arm = b.chain(
      `arm${suffix}`,
      [
        [s * 0.67, 3.04, 0],
        [s * 1.29, 2.98, 0.01],
        [s * 1.91, 2.82, 0.06],
        [s * 2.17, 2.77, 0.1],
      ],
      {
        parent: spine.joints[1],
        names: [`shoulder${suffix}`, `elbow${suffix}`, `wrist${suffix}`, `hand${suffix}`],
        role: "arm",
      },
    );
    const leg = b.chain(
      `leg${suffix}`,
      [
        [s * 0.43, 1.99, 0],
        [s * 0.57, 1.15, 0.08],
        [s * 0.67, 0.39, 0.08],
      ],
      {
        parent: hips,
        names: [`hip${suffix}`, `knee${suffix}`, `ankle${suffix}`],
        role: "leg",
        contact: [s * 0.67, 0.16, 0.29],
      },
    );

    const fingers = [0, 1, 2, 3].map((i) => {
      const z = 0.36 - i * 0.205;
      const start = [s * (2.16 + (i === 0 ? -0.08 : 0.03)), 2.76, z];
      const middle = [
        s * (2.46 + (i === 0 ? -0.08 : 0.06)),
        2.55 - i * 0.025,
        z + (i === 0 ? 0.14 : 0),
      ];
      const end = [
        s * (2.65 + (i === 0 ? -0.13 : 0.04)),
        2.29 + Math.abs(i - 1.5) * 0.06,
        z + (i === 0 ? 0.25 : 0.02),
      ];
      return b.chain(`finger${suffix}${i}`, [start, middle, end], {
        parent: arm.tip!,
        names: [`digit${suffix}${i}Base`, `digit${suffix}${i}Mid`, `digit${suffix}${i}Tip`],
        role: "digit",
      });
    });

    const toes = [-1, 0, 1].map((i) =>
      b.chain(
        `rootToe${suffix}${i + 1}`,
        [
          [s * 0.66 + i * 0.14, 0.4, 0.12],
          [s * 0.68 + i * 0.27, 0.25, 0.49],
          [s * 0.7 + i * 0.36, 0.19, 0.92 - Math.abs(i) * 0.13],
        ],
        {
          parent: leg.tip!,
          names: [`toe${suffix}${i + 1}Base`, `toe${suffix}${i + 1}Tip`],
          role: "digit",
        },
      ),
    );
    return { s, suffix, arm, leg, fingers, toes };
  });

  const crownRoutes = [
    [[-0.35, 3.99, -0.04], [-0.65, 4.48, -0.08], [-1.04, 4.94, -0.13], [-1.16, 5.31, -0.08]],
    [[0.32, 4.0, -0.07], [0.63, 4.43, -0.1], [0.98, 4.7, -0.03], [1.35, 5.03, -0.09]],
    [[-0.15, 4.03, -0.17], [-0.21, 4.65, -0.25], [0.02, 5.16, -0.26], [-0.1, 5.48, -0.23]],
    [[0.28, 3.92, -0.24], [0.42, 4.37, -0.53], [0.69, 4.79, -0.71], [0.58, 5.15, -0.78]],
    [[-0.38, 3.91, -0.22], [-0.79, 4.24, -0.46], [-1.24, 4.54, -0.59], [-1.53, 4.69, -0.55]],
  ];
  const crown = crownRoutes.map((route, i) => {
    const main = b.chain(`crownBough${i}`, route, {
      parent: head,
      count: 3,
      role: "fan",
    });
    const side = i % 2 === 0 ? -1 : 1;
    const p = route[2];
    const q = route[1];
    const forks = [
      b.chain(
        `crownFork${i}A`,
        [p, [p[0] + side * 0.33, p[1] + 0.14, p[2] + 0.08],
          [p[0] + side * 0.53, p[1] + 0.47, p[2] + 0.11]],
        { parent: main.joints[2], count: 2, role: "fan" },
      ),
      b.chain(
        `crownFork${i}B`,
        [q, [q[0] - side * 0.19, q[1] + 0.29, q[2] + 0.12],
          [q[0] - side * 0.25, q[1] + 0.64, q[2] + 0.15]],
        { parent: main.joints[1], count: 2, role: "fan" },
      ),
    ];
    return { main, forks, route };
  });

  // Small reusable primitive assemblies.
  function ellipsoid(
    name: string,
    at: number[] | THREE.Vector3,
    scale: number[],
    color: Fill,
    bone: Joint,
    detail = 0,
  ) {
    return b.part(new THREE.IcosahedronGeometry(1, detail), color, {
      name, at, bone, scale, flat: true,
    });
  }

  function box(name: string, at: number[], size: number[], color: Fill, bone: Joint) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      name, at, bone,
    });
  }

  // A low-poly ridge shingle: its local Y is thickness, local Z is growth.
  function barkPlateGeometry(w: number, h: number, d: number, lean = 0) {
    const edge = [
      [-0.46 * w, -0.37 * h],
      [-0.24 * w, -0.54 * h],
      [0.06 * w, -0.41 * h],
      [0.35 * w, -0.48 * h],
      [0.49 * w, -0.10 * h],
      [0.34 * w + lean, 0.35 * h],
      [0.02 * w + lean, 0.56 * h],
      [-0.34 * w + lean, 0.36 * h],
      [-0.49 * w, 0.02 * h],
    ];
    const vertices: number[] = [];
    const add = (p: number[], q: number[], r: number[]) =>
      vertices.push(...p, ...q, ...r);
    const ridge = [lean * 0.25, d, h * 0.02];
    for (let i = 0; i < edge.length; i++) {
      const e = edge[i];
      const f = edge[(i + 1) % edge.length];
      const p = [e[0], 0, e[1]];
      const q = [f[0], 0, f[1]];
      const pb = [e[0], -0.025, e[1]];
      const qb = [f[0], -0.025, f[1]];
      add(ridge, q, p);
      add(p, q, qb);
      add(p, qb, pb);
      add([0, -0.025, 0], pb, qb);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    return geometry;
  }

  function plate(
    surface: ReturnType<typeof b.surface>,
    point: number[],
    w: number,
    h: number,
    depth: number,
    name: string,
    color: Fill = bark,
    flow: number[] = [0, 1, 0],
  ) {
    const hit = surface.nearest(point);
    return b.stick(barkPlateGeometry(w, h, depth), color, hit, {
      embed: 0.12, flow, name,
    });
  }

  function growthDisc(
    at: number[],
    radius: number,
    axis: number[],
    bone: Joint,
    name: string,
  ) {
    b.part(new THREE.CylinderGeometry(radius, radius * 1.08, 0.075, 9), oldBark, {
      at, dir: axis, bone, name: `${name}Rim`,
    });
    const n = new THREE.Vector3(...axis).normalize();
    b.part(new THREE.CircleGeometry(radius * 0.91, 12), "#ffffff", {
      at: new THREE.Vector3(...at).addScaledVector(n, 0.041),
      dir: axis, axis: "z", bone, texture: ringsTexture, name,
    });
  }

  // The guardian's blocky, heavy main masses.
  const trunk = b.sweep(
    spine,
    (t) => [0.61 + 0.21 * Math.sin(t * Math.PI) + 0.13 * t, 0.39 + 0.035 * Math.sin(t * Math.PI)],
    { color: oldBark, sides: 7, smooth: false, caps: "flat", name: "ancientTrunk" },
  );
  const trunkSkin = b.surface(trunk);
  b.sweep(neck, [0.34, 0.35], {
    color: oldBark, sides: 7, smooth: false, name: "neckHeartwood",
  });
  const skull = ellipsoid(
    "angularElderSkull", [0, 3.65, 0.09], [0.56, 0.64, 0.46], bark, head, 1,
  );
  const skullSkin = b.surface(skull);

  // Face first: very dark inset sockets and slanted, luminous eyes.
  for (const s of [1, -1]) {
    const x = s * 0.245;
    b.extrude(
      [[-0.205, -0.045], [-0.14, -0.11], [0.12, -0.075], [0.20, 0.035],
        [0.12, 0.095], [-0.13, 0.075]],
      {
        at: [x, 3.685, 0.47], x: [1, s * 0.24, 0], y: [0, 1, 0],
        thickness: 0.035, color: C.deepest, bone: head, name: `eyeSocket${s}`,
      },
    );
    glow(b.part(new THREE.PlaneGeometry(0.39, 0.175), "#ffffff", {
      at: [x, 3.69, 0.497], rotation: [0, 0, s * 15],
      texture: eyeTexture, bone: head, name: `livingEye${s}`,
    }), 1.25);

    b.extrude(
      [[0.065, -0.035], [0.46, 0.115], [0.52, 0.25], [0.29, 0.22],
        [0.11, 0.125], [0.015, 0.06]],
      {
        at: [0, 3.755, 0.45], x: [s, 0, 0], y: [0, 1, 0],
        thickness: 0.22, bevel: 0.025, color: bark, bone: head,
        name: `heavyFurrowedBrow${s}`,
      },
    );
    b.sweep(
      [[s * 0.12, 3.82, 0.57], [s * 0.29, 3.91, 0.56], [s * 0.48, 3.98, 0.47]],
      [0.027, 0.018],
      { color: C.woodEdge, bone: head, sides: 5, name: `browGrowthRidge${s}` },
    );
    plate(skullSkin, [s * 0.48, 3.48, 0.53], 0.26, 0.48, 0.10,
      `cheekBark${s}`, bark, [s * 0.25, 1, 0]);
    b.sweep(
      [[s * 0.4, 3.48, 0.46], [s * 0.36, 3.32, 0.54], [s * 0.24, 3.23, 0.58]],
      [0.055, 0.033],
      { color: oldBark, bone: head, sides: 5, name: `cheekFurrow${s}` },
    );
  }

  b.extrude(
    [[-0.095, 0.24], [-0.125, -0.02], [-0.19, -0.14], [-0.075, -0.19],
      [0, -0.135], [0.075, -0.19], [0.19, -0.14], [0.125, -0.02], [0.095, 0.24]],
    {
      at: [0, 3.51, 0.535], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.21, bevel: 0.025, color: bark, bone: head, name: "forkedTimberNose",
    },
  );
  b.sweep([[0, 3.76, 0.65], [-0.025, 3.55, 0.66], [0, 3.38, 0.66]],
    [0.022, 0.012], { color: C.woodEdge, bone: head, sides: 5, name: "noseRidge" });
  for (const s of [1, -1]) {
    ellipsoid(`nostril${s}`, [s * 0.111, 3.365, 0.651],
      [0.047, 0.025, 0.017], C.deepest, head);
  }

  box("mouthShadow", [0, 3.265, 0.46], [0.57, 0.145, 0.16], C.deepest, head);
  b.sweep(
    [[-0.32, 3.31, 0.49], [-0.16, 3.285, 0.59], [0, 3.30, 0.6],
      [0.16, 3.285, 0.59], [0.32, 3.31, 0.49]],
    0.037, { color: oldBark, bone: head, sides: 5, name: "upperJawLip" },
  );
  const lowerJaw = ellipsoid("lowerJaw", [0, 3.13, 0.32],
    [0.38, 0.20, 0.31], bark, jaw, 0);
  b.sweep(
    [[-0.28, 3.20, 0.49], [-0.13, 3.18, 0.59], [0.13, 3.18, 0.59], [0.28, 3.20, 0.49]],
    0.037, { color: bark, bone: jaw, sides: 5, name: "lowerJawLip" },
  );
  for (const s of [1, -1]) {
    b.spike([s * 0.21, 3.31, 0.565], [s * 0.20, 3.20, 0.59], null, 0.044,
      { color: cutWood, bone: head, sides: 5, name: `upperSplinterTooth${s}` });
    b.spike([s * 0.095, 3.18, 0.6], [s * 0.09, 3.265, 0.6], null, 0.032,
      { color: cutWood, bone: jaw, sides: 5, name: `lowerSplinterTooth${s}` });
  }

  // Forked root beard: a deliberate opening above the living chest seal.
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.095;
    const endY = 2.88 - Math.abs(i) * 0.065;
    b.sweep(
      catmull([
        [x, 3.17, 0.48 - Math.abs(i) * 0.015],
        [x * 1.18, 3.04, 0.62],
        [x * 1.35, endY + 0.12, 0.65],
        [x * 1.48, endY, 0.55],
      ]),
      [0.078, 0.072, 0.039, 0.006],
      { color: i % 2 === 0 ? bark : oldBark, bone: jaw, sides: 5,
        smooth: false, caps: "flat", name: `rootBeard${i + 3}` },
    );
  }
  plate(b.surface(lowerJaw), [0, 3.08, 0.9], 0.24, 0.27, 0.06, "chinHeartwood", cutWood);

  // A few tall forehead seams tie the face into its growing crown.
  for (const s of [-1, 1]) {
    b.sweep(
      [[s * 0.13, 3.93, 0.42], [s * 0.18, 4.12, 0.35], [s * 0.3, 4.25, 0.17]],
      [0.065, 0.015],
      { bone: head, color: oldBark, sides: 5, name: `foreheadRoot${s}` },
    );
    plate(skullSkin, [s * 0.37, 4.06, 0.35], 0.25, 0.37, 0.085,
      `templeCrest${s}`, bark);
  }

  // Massive chest bark, shingled in vertical staggered rows.
  for (let row = 0; row < 3; row++) {
    const y = 1.98 + row * 0.39;
    for (const s of [-1, 1]) {
      for (let col = 0; col < 2; col++) {
        const x = s * (0.28 + col * 0.27);
        plate(trunkSkin, [x, y + col * 0.07, 0.8],
          0.35, 0.65, 0.085 + 0.018 * col, `chestShingle${row}_${s}_${col}`);
      }
      plate(trunkSkin, [s * 0.9, y + 0.12, 0], 0.42, 0.68, 0.09,
        `flankShingle${row}_${s}`);
    }
    for (const x of [-0.4, 0, 0.4]) {
      plate(trunkSkin, [x, y + 0.1, -0.9], 0.42, 0.65, 0.1,
        `backShingle${row}_${x}`, bark);
    }
  }

  // The seal sits in a projecting heartwood knot, clear of both beard and shingles.
  growthDisc([0, 2.38, 0.545], 0.29, [0, 0, 1], spine.joints[1], "heartwoodGrowthRings");
  b.part(new THREE.CircleGeometry(0.235, 12), "#253b32", {
    at: [0, 2.38, 0.59], bone: spine.joints[1], name: "sealDarkInset",
  });
  glow(b.part(new THREE.PlaneGeometry(0.465, 0.465), "#ffffff", {
    at: [0, 2.38, 0.595], texture: sealTexture,
    bone: spine.joints[1], name: "emeraldHeartwoodWard",
  }), 1.1);
  for (const s of [-1, 1]) {
    b.sweep(
      [[s * 0.14, 2.04, 0.46], [s * 0.34, 2.23, 0.53],
        [s * 0.36, 2.58, 0.52], [s * 0.48, 2.9, 0.39]],
      [0.08, 0.075, 0.07, 0.045],
      { color: bark, bone: spine.joints[1], sides: 6, smooth: false,
        name: `heartwoodButtress${s}` },
    );
    b.sweep(
      [[s * 0.4, 2.7, 0.45], [s * 0.54, 2.88, 0.48],
        [s * 0.67, 3.03, 0.38]],
      [0.05, 0.075, 0.035],
      { color: cutWood, bone: spine.joints[1], sides: 5,
        name: `collarGrowthRidge${s}` },
    );
  }
  const fissure = [
    [0, 2.1, 0.49], [-0.055, 2.02, 0.48], [0.02, 1.94, 0.45],
    [-0.025, 1.83, 0.43],
  ];
  b.sweep(fissure, 0.034, {
    color: C.deepest, bone: hips, sides: 5, name: "splitHeartwood",
  });
  glow(b.sweep(fissure.map((p) => [p[0], p[1], p[2] + 0.022]), 0.012, {
    color: C.aqua, bone: hips, sides: 5, name: "sapLightFissure",
  }), 1.2);

  // Arms, legs, long fingers, and sprawling roots.
  for (const { s, suffix, arm, leg, fingers, toes } of sides) {
    const armTube = b.sweep(arm, [0.34, 0.3, 0.21, 0.19], {
      color: oldBark, sides: 7, smooth: false, name: `armHeartwood${suffix}`,
    });
    const armSkin = b.surface(armTube);
    for (let i = 0; i < 4; i++) {
      const t = 0.12 + i * 0.21;
      const p = arm.at(t).at;
      plate(armSkin, [p.x, p.y + 0.35, p.z], 0.45 - i * 0.035, 0.51, 0.11,
        `armTopPlate${suffix}${i}`, bark, [s, 0.18, 0]);
      plate(armSkin, [p.x, p.y, p.z + 0.5], 0.34, 0.48, 0.07,
        `armFrontPlate${suffix}${i}`, bark, [s, 0.15, 0]);
    }

    const shoulder = ellipsoid(`shoulderBurl${suffix}`, [s * 0.84, 3.11, -0.01],
      [0.53, 0.46, 0.48], bark, arm.joints[0], 1);
    const shoulderSkin = b.surface(shoulder);
    plate(shoulderSkin, [s * 0.9, 3.48, 0.2], 0.66, 0.72, 0.16,
      `shoulderShield${suffix}`, bark, [s * 0.65, 0.7, 0]);
    const shoulderMossHit = shoulderSkin.nearest([s * 0.8, 3.52, 0.31]);
    b.stick(new THREE.IcosahedronGeometry(1, 0), moss, shoulderMossHit, {
      scale: [0.34, 0.105, 0.27], embed: 0.15, name: `frontShoulderMoss${suffix}`,
    });
    plate(shoulderSkin, [s * 1.08, 3.3, 0.55], 0.31, 0.37, 0.07,
      `shoulderLichenPlate${suffix}`, moss, [s * 0.3, 1, 0]);
    for (let i = 0; i < 3; i++) {
      const start = [s * (0.7 + i * 0.23), 3.3 - i * 0.045, -0.08];
      b.sweep(
        [start, [start[0] + s * 0.13, start[1] + 0.28, -0.12],
          [start[0] + s * 0.23, start[1] + 0.52 - i * 0.055, -0.17]],
        [0.13 - i * 0.017, 0.075, 0],
        { color: bark, bone: arm.joints[0], sides: 5, smooth: false,
          caps: "flat", name: `shoulderBrokenBranch${suffix}${i}` },
      );
    }
    ellipsoid(`shoulderMoss${suffix}`, [s * 0.88, 3.43, -0.09],
      [0.4, 0.115, 0.34], moss, arm.joints[0], 1);
    growthDisc([s * 1.33, 3.0, 0.272], 0.13, [0, 0, 1],
      arm.joints[1], `elbowKnot${suffix}`);

    const palm = ellipsoid(`rootPalm${suffix}`, [s * 2.14, 2.79, 0.06],
      [0.31, 0.23, 0.39], bark, arm.tip!, 0);
    plate(b.surface(palm), [s * 2.15, 3.2, 0.1], 0.48, 0.43, 0.075,
      `handDorsalPlate${suffix}`, bark, [s, 0, 0]);
    for (let i = 0; i < fingers.length; i++) {
      const finger = fingers[i];
      const fingerTube = b.sweep(finger, [0.105, 0.078, 0.025], {
        color: bark, sides: 5, smooth: false, caps: "flat",
        name: `longRootFinger${suffix}${i}`,
      });
      const nail = finger.at(0.85);
      b.spike(nail, finger.at(1).at.clone().add(new THREE.Vector3(s * 0.065, -0.075, 0)),
        null, 0.043, { color: cutWood, bone: finger.joints[1],
          sides: 5, name: `fingerHeartwoodTip${suffix}${i}` });
      const hit = b.surface(fingerTube).nearest(finger.at(0.48).at.clone()
        .add(new THREE.Vector3(0, 0.2, 0.08)));
      b.stick(barkPlateGeometry(0.14, 0.2, 0.035), oldBark, hit, {
        flow: [s, -0.2, 0], name: `fingerKnuckle${suffix}${i}`,
      });
    }

    const legTube = b.sweep(leg, [0.36, 0.29, 0.29], {
      color: oldBark, sides: 7, smooth: false, name: `legCore${suffix}`,
    });
    const legSkin = b.surface(legTube);
    for (let row = 0; row < 3; row++) {
      const y = 0.65 + row * 0.43;
      const x = s * (0.65 - row * 0.06);
      for (const dx of [-0.15, 0.15]) {
        plate(legSkin, [x + dx, y, 0.65], 0.32, 0.67, 0.095,
          `shinPlate${suffix}${row}_${dx}`);
      }
      plate(legSkin, [x + s * 0.5, y + 0.08, 0.05], 0.39, 0.64, 0.09,
        `outerLegBark${suffix}${row}`);
      plate(legSkin, [x, y, -0.5], 0.43, 0.61, 0.08,
        `rearLegBark${suffix}${row}`);
    }
    growthDisc([s * 0.58, 1.17, 0.365], 0.15, [0, 0, 1],
      leg.joints[1], `kneeBurl${suffix}`);

    ellipsoid(`rootHeel${suffix}`, [s * 0.68, 0.29, 0.1],
      [0.37, 0.2, 0.4], oldBark, leg.tip!, 0);
    for (let i = 0; i < toes.length; i++) {
      const toe = toes[i];
      b.sweep(toe, [0.17, 0.13, 0.025], {
        color: bark, sides: 6, smooth: false, caps: "flat",
        name: `buttressToe${suffix}${i}`,
      });
      b.sweep(
        [toe.at(0.18).at.clone().add(new THREE.Vector3(0, 0.115, 0)),
          toe.at(0.6).at.clone().add(new THREE.Vector3(0, 0.075, 0)),
          toe.at(0.91).at.clone().add(new THREE.Vector3(0, 0.023, 0))],
        [0.025, 0.007], { color: C.woodEdge, bone: toe.joints[0], sides: 5,
          name: `toeRidge${suffix}${i}` },
      );
    }
    b.sweep(
      [[s * 0.73, 0.45, 0.01], [s * 1.02, 0.24, -0.23],
        [s * 1.27, 0.18, -0.36], [s * 1.43, 0.165, -0.3]],
      [0.16, 0.12, 0.065, 0.006],
      { color: bark, bone: leg.tip!, sides: 6, caps: "flat", name: `heelRoot${suffix}` },
    );

    // Hanging ferns stay outside the face and the hand silhouettes.
    b.cards(
      [
        frame([s * 1.04, 3.42, 0.17], [0, 1, 0]),
        frame([s * 0.76, 3.42, -0.3], [0, 1, 0]),
      ],
      fernTexture,
      {
        size: [0.32, 0.67], lean: 163, bend: 15, flow: [0, 0, 1],
        bone: arm.joints[0], name: `shoulderFerns${suffix}`,
      },
    );
  }

  // Forking oak crown, with real branch geometry inside modest leaf masses.
  for (let i = 0; i < crown.length; i++) {
    const { main, forks } = crown[i];
    b.sweep(main, [0.20, 0.145, 0.087, 0.018], {
      color: bark, sides: 6, smooth: false, caps: "flat", name: `crownTimber${i}`,
    });
    for (let j = 0; j < forks.length; j++) {
      b.sweep(forks[j], [0.095, 0.06, 0.006], {
        color: bark, sides: 5, smooth: false, caps: "flat", name: `crownTwig${i}_${j}`,
      });
    }
    b.sweep(
      [main.at(0.05).at.clone().add(new THREE.Vector3(0, 0, 0.13)),
        main.at(0.36).at.clone().add(new THREE.Vector3(0, 0, 0.1)),
        main.at(0.7).at.clone().add(new THREE.Vector3(0, 0, 0.055))],
      [0.026, 0.008],
      { color: C.woodEdge, bone: main.joints[0], sides: 5, name: `boughRidge${i}` },
    );

    // Keep the high central branch partly bare: a readable antler-like silhouette.
    const leafSites = i === 2
      ? [forks[0].at(0.87)]
      : [main.at(0.78), forks[0].at(0.72), forks[1].at(0.88)];
    for (let j = 0; j < leafSites.length; j++) {
      const site = leafSites[j];
      const p = site.at;
      const scale = (i === 4 ? 0.85 : 1) * (0.88 + random() * 0.28);
      const foliage = ellipsoid(
        `oakLeafMass${i}_${j}`,
        [p.x, p.y + 0.035, p.z],
        [0.47 * scale, (j === 1 ? 0.31 : 0.245) * scale, 0.39 * scale],
        (i + j) % 3 === 0 ? C.leafGold : C.leaf,
        site.bone!,
        0,
      );
      ellipsoid(
        `oakLeafMassShadow${i}_${j}`,
        [p.x + 0.15, p.y - 0.075, p.z - 0.09],
        [0.32 * scale, 0.22 * scale, 0.31 * scale],
        C.leafDark,
        site.bone!,
        0,
      );
      ellipsoid(
        `oakLeafMassHighlight${i}_${j}`,
        [p.x - 0.13, p.y + 0.15 * scale, p.z + 0.09],
        [0.29 * scale, 0.14 * scale, 0.25 * scale],
        (i + j) % 2 === 0 ? C.leafGold : C.mossLight,
        site.bone!,
        0,
      );
      const leafHits = b.surface(foliage).scatter(12, {
        rng: random, minDist: 0.11, filter: (h) => h.n.y > -0.35,
      });
      b.cards(leafHits, leafTexture, {
        size: [0.19, 0.32], lean: 67, bend: 15, vary: 0.3, spin: 40,
        rng: random, flow: [0.15, 0.1, 1], name: `crownOakLeaves${i}_${j}`,
      });
    }

    const end = main.at(1).at;
    b.sweep(
      [[end.x, end.y - 0.13, end.z], [end.x + 0.12, end.y + 0.06, end.z + 0.035]],
      [0.025, 0], { color: C.woodEdge, bone: main.joints[2], sides: 5,
        caps: "flat", name: `bareCrownTip${i}` },
    );
  }

  // Moss follows selected body surfaces, avoiding facial features and the seal.
  for (const h of trunkSkin.scatter(14, {
    rng: random,
    minDist: 0.2,
    filter: (hit) => hit.at.z < 0.16 && hit.at.y > 2.0,
  })) {
    b.stick(new THREE.IcosahedronGeometry(1, 0), moss, h, {
      scale: [0.17, 0.045, 0.23], embed: 0.35, name: "trunkLichen",
    });
  }
  const headMoss = skullSkin.nearest([0.36, 4.19, -0.04]);
  b.stick(new THREE.IcosahedronGeometry(1, 1), moss, headMoss, {
    scale: [0.22, 0.065, 0.23], embed: 0.35, name: "templeMoss",
  });

  // A handful of broad shelf fungi punctuate the wood with aged ivory and rust.
  const fungusSites = [
    { point: [-0.83, 2.18, 0.14], radius: 0.17 },
    { point: [-0.83, 2.0, 0.13], radius: 0.13 },
    { point: [-0.78, 1.85, 0.10], radius: 0.09 },
    { point: [0.79, 2.56, -0.22], radius: 0.13 },
    { point: [0.78, 2.39, -0.25], radius: 0.17 },
  ];
  for (let i = 0; i < fungusSites.length; i++) {
    const { point, radius } = fungusSites[i];
    const hit = trunkSkin.nearest(point);
    const center = hit.at.clone().addScaledVector(hit.n, radius * 0.37);
    const bone = hit.bone!;
    ellipsoid(`shelfFungusIvoryRim${i}`, center,
      [radius, 0.047, radius * 0.83], "#ccb783", bone, 1);
    ellipsoid(`shelfFungusRustCap${i}`,
      center.clone().add(new THREE.Vector3(0, 0.028, 0)),
      [radius * 0.87, 0.041, radius * 0.72], "#965832", bone, 1);
    ellipsoid(`shelfFungusOldCenter${i}`,
      center.clone().add(new THREE.Vector3(0, 0.055, 0)),
      [radius * 0.46, 0.021, radius * 0.40], "#684634", bone, 0);
  }

  // A broken branch on the back tells the story of a very old survivor.
  b.sweep(
    [[0.2, 2.84, -0.34], [0.48, 3.04, -0.65], [0.54, 3.35, -0.78]],
    [0.2, 0.15, 0.125],
    { color: bark, bone: spine.joints[1], sides: 6, caps: "flat", name: "brokenBackBough" },
  );
  growthDisc([0.54, 3.35, -0.78], 0.12, [0.15, 1, -0.2],
    spine.joints[1], "oldBrokenBoughEnd");
  b.spike([0.59, 3.3, -0.79], [0.68, 3.58, -0.82], null, 0.055, {
    color: cutWood, bone: spine.joints[1], sides: 5, name: "brokenBoughSplinter",
  });

  // Compact forest-floor stage, lowest face exactly on y = 0.
  b.part(new THREE.CylinderGeometry(1, 1.02, 0.14, 12), earthPaint, {
    at: [0, 0.07, 0.03], scale: [1.94, 1, 1.4],
    bone: scene, name: "forestFloorStage",
  });
  b.part(new THREE.CylinderGeometry(1, 1, 0.035, 12), forestFloor, {
    at: [0, 0.145, 0.03], scale: [1.91, 1, 1.37],
    bone: scene, name: "mossyStageTop",
  });

  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + 0.15;
    const x = Math.cos(a) * (1.48 + random() * 0.18);
    const z = Math.sin(a) * (0.98 + random() * 0.15);
    ellipsoid(`floorStone${i}`, [x, 0.2, z],
      [0.12 + random() * 0.11, 0.08 + random() * 0.09, 0.1 + random() * 0.12],
      stonePaint, scene, 0);
  }

  // A single half-buried wardstone, low enough to leave the guardian unobstructed.
  const wardStone = b.part(new THREE.DodecahedronGeometry(1, 0), stonePaint, {
    at: [-1.37, 0.47, -0.53], scale: [0.29, 0.48, 0.24],
    rotation: [0, -12, -12], bone: scene, name: "oldForestBoundaryStone",
  });
  b.decal(wardStone, stoneRuneTexture, {
    at: [-1.37, 0.51, -0.27], dir: [0, 0, 1], size: [0.23, 0.39],
    bone: scene, name: "boundaryStoneInscription",
  });
  ellipsoid("boundaryStoneMoss", [-1.42, 0.78, -0.56],
    [0.25, 0.085, 0.22], moss, scene, 0);

  // Deliberate little pools of undergrowth, rather than a busy ring of decoration.
  const fernSites = [
    [-1.52, 0.17, 0.24], [1.45, 0.17, -0.36],
    [-0.3, 0.17, -1.05], [0.92, 0.17, -0.95],
  ];
  for (let i = 0; i < fernSites.length; i++) {
    const p = fernSites[i];
    ellipsoid(`undergrowthMoss${i}`, [p[0], 0.18, p[2]],
      [0.25, 0.06, 0.23], moss, scene, 0);
    b.cards(
      [frame(p, [-0.3, 1, 0.1]), frame(p, [0.35, 1, -0.1])],
      fernTexture,
      {
        size: [0.27, 0.48], lean: 22, bend: 22, flow: [0, 0, 1],
        bone: scene, name: `forestFern${i}`,
      },
    );
  }

  function mushroom(x: number, z: number, h: number, radius: number) {
    b.sweep([[x, 0.17, z], [x + 0.015, h, z]], [0.018, 0.014], {
      color: "#94b9a2", bone: scene, sides: 5, caps: "flat", name: "littleMushroomStem",
    });
    glow(b.lathe(
      [[0, -0.035], [radius * 0.85, -0.035], [radius, -0.015],
        [radius * 0.85, 0.025], [radius * 0.45, 0.055], [0, 0.063]],
      {
        at: [x + 0.015, h, z], color: "#69cbb1", segments: 7,
        bone: scene, name: "littleLuminousMushroomCap",
      },
    ), 0.6);
  }
  mushroom(1.24, 0.56, 0.36, 0.1);
  mushroom(1.4, 0.48, 0.28, 0.075);
  mushroom(-1.1, -0.8, 0.3, 0.08);

  // Fallen oak leaves echo the canopy on the small staged base.
  const fallen = [
    [-1.17, 0.168, 0.77], [1.3, 0.168, 0.9], [0.19, 0.168, 1.13],
    [-0.3, 0.168, -0.91], [1.57, 0.168, 0.0], [-1.65, 0.168, -0.25],
  ];
  b.cards(fallen.map((p) => frame(p, [0, 1, 0])), leafTexture, {
    size: [0.15, 0.25], lean: 90, flow: [0.8, 0, 0.3], mirror: true,
    vary: 0.24, spin: 65, rng: random, bone: scene, name: "fallenOakLeaves",
  });

  return b.root;
}
