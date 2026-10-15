```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  polyline,
  paint,
  mottle,
  noise,
  mix,
  svg,
} from "agentic-3js-builder";
import type { Joint, Paint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

/*
1. Move the plaque outside the sand rim: the ground was cutting through its lettering.
2. Cut a real recess for the pool, with sloping banks and deeper water colours.
3. Give the palms folded, serrated fronds and hanging date bunches, rather than smooth banana leaves.
4. Turn the camels slightly toward the viewer and broaden their embedded humps.
5. Add a few intimate oasis details: lilies, fuller reeds, a tea hearth, date crates, and tent pennants.
*/

export const meta = {
  name: "Mirage — Caravan Rest",
  description:
    "A faceted caravan oasis: embroidered tents, expressive rigged dromedaries, serrated date palms, a recessed turquoise spring, and a little brass tea kettle warming beside the camp.",
};

type P = [number, number, number];
type Fill = string | Paint;

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "MirageCaravanRest",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(4817);

  const C = {
    ink: "#34313c",
    sand: "#e6b878",
    pale: "#ffe0a1",
    rim: "#a96145",
    cream: "#fff0cd",
    red: "#b83f43",
    coral: "#e66c52",
    teal: "#227b7b",
    navy: "#233e52",
    gold: "#efbb57",
    wood: "#85543a",
    green: "#4b8e54",
    darkGreen: "#276449",
    lime: "#9abd67",
    cyan: "#8fe2d0",
  };

  const sandPaint = paint((p, n) => {
    const drift = noise(p, 1.1, 4);
    const wave = Math.sin(p.x * 9 + p.z * 5 + drift * 4);
    return mix(
      "#ca9462",
      "#f5cf8d",
      Math.max(0, Math.min(1, 0.5 + n.y * 0.3 + drift * 0.15 + wave * 0.025)),
    );
  });
  const trunkPaint = paint((p, n) => {
    const band = ((p.y / 0.32) % 1 + 1) % 1;
    const base = mix(
      "#855c40",
      "#bd8d59",
      0.42 + n.y * 0.2 + noise(p, 0.7, 17) * 0.18,
    );
    return band < 0.095 ? "#694733" : band < 0.18 ? "#d0a46b" : base;
  });
  const leafPaint = paint((p, n) =>
    mix("#276648", "#a6c76c", 0.35 + n.y * 0.24 + noise(p, 0.8, 9) * 0.18),
  );
  const camelPaint = paint((p, n) =>
    mix("#b47b51", "#edbf83", 0.39 + n.y * 0.22 + noise(p, 0.4, 11) * 0.23),
  );
  const muzzlePaint = mottle("#d8aa77", "#f5d5a0", {
    size: 0.24,
    contrast: 0.45,
    seed: 13,
  });
  const clothPaint = paint((p, n) => {
    const stripe = ((p.z * 2.4) % 1 + 1) % 1;
    let col: string = stripe < 0.5 ? C.cream : C.red;
    if (stripe > 0.45 && stripe < 0.53) col = C.gold;
    if (stripe > 0.93) col = C.navy;
    return mix(col, "#604b52", n.y < -0.2 ? 0.23 : 0.03);
  });

  const eyeTexture = svg(
    `<svg viewBox="0 0 100 100">
      <ellipse cx="50" cy="53" rx="41" ry="33" fill="#422b2d"/>
      <ellipse cx="51" cy="55" rx="33" ry="25" fill="#fff0d3"/>
      <ellipse cx="54" cy="54" rx="18" ry="24" fill="#73523c"/>
      <ellipse cx="57" cy="56" rx="11" ry="19" fill="#242b32"/>
      <circle cx="51" cy="45" r="7" fill="#ffffff"/>
      <circle cx="63" cy="65" r="3" fill="#ffe9ae"/>
      <path d="M14 40 Q46 10 84 35 M18 36 L9 23 M27 29 L23 15"
        fill="none" stroke="#422b2d" stroke-width="7" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const earTexture = svg(
    `<svg viewBox="0 0 60 100">
      <path d="M18 95 Q4 52 35 9 Q59 42 39 89Z" fill="#a76f58"/>
      <path d="M25 78 Q19 49 35 25" stroke="#e6b185" stroke-width="5" fill="none"/>
    </svg>`,
    { size: 128 },
  );
  const saddleTexture = svg(
    `<svg viewBox="0 0 180 150">
      <rect width="180" height="150" fill="#254757"/>
      <rect x="7" y="7" width="166" height="136" fill="#ba4748" stroke="#f7d58d" stroke-width="5"/>
      <path d="M14 22 H166 M14 128 H166" stroke="#f7d58d" stroke-width="5"/>
      <path d="M18 34 H162 M18 116 H162" stroke="#243e50" stroke-width="8"/>
      <path d="M90 39 L127 75 L90 111 L53 75Z" fill="#f7d58d"/>
      <path d="M90 50 L115 75 L90 100 L65 75Z" fill="#227b7b"/>
      <path d="M90 62 L103 75 L90 88 L77 75Z" fill="#fff0cd"/>
      <path d="M29 53 L45 75 L29 97 L15 75Z M151 53 L165 75 L151 97 L135 75Z" fill="#f7d58d"/>
      <path d="M13 12 H167 V138 H13Z" fill="none" stroke="#fff0cd" stroke-width="2" stroke-dasharray="4 5"/>
    </svg>`,
    { size: 384 },
  );
  const rugTexture = svg(
    `<svg viewBox="0 0 220 160">
      <rect width="220" height="160" fill="#ddaa62"/>
      <rect x="8" y="8" width="204" height="144" fill="#1f666e"/>
      <rect x="18" y="18" width="184" height="124" fill="#c95348" stroke="#f9d895" stroke-width="4"/>
      <path d="M110 30 L177 80 L110 130 L43 80Z" fill="#efcd88"/>
      <path d="M110 43 L159 80 L110 117 L61 80Z" fill="#233e52"/>
      <path d="M110 58 L139 80 L110 102 L81 80Z" fill="#2d9891"/>
      <path d="M110 68 L124 80 L110 92 L96 80Z" fill="#ffedbe"/>
      <g fill="#f9d895">
        <path d="M32 35 L43 46 L32 57 L21 46Z M188 35 L199 46 L188 57 L177 46Z"/>
        <path d="M32 103 L43 114 L32 125 L21 114Z M188 103 L199 114 L188 125 L177 114Z"/>
      </g>
      <rect x="12" y="12" width="196" height="136" fill="none" stroke="#fff0cd" stroke-width="2" stroke-dasharray="4 5"/>
    </svg>`,
    { size: 512 },
  );
  const waterTexture = svg(
    `<svg viewBox="0 0 600 400">
      <rect width="600" height="400" fill="#249caa"/>
      <path d="M0 20 L140 0 L230 90 L110 180 L0 140Z" fill="#4dbfb1"/>
      <path d="M600 40 L440 0 L340 110 L420 220 L600 175Z" fill="#197e95"/>
      <path d="M0 400 L0 240 L160 205 L280 290 L225 400Z" fill="#59c6b1"/>
      <path d="M600 400 L400 400 L290 285 L415 245 L600 290Z" fill="#238d9b"/>
      <path d="M140 175 L270 90 L394 123 L415 245 L280 290Z" fill="#228c9d"/>
      <g fill="none" stroke="#a4e7d4" stroke-width="4" stroke-linecap="round">
        <path d="M60 115 Q100 106 141 114 M75 129 Q106 123 126 129"/>
        <path d="M290 65 Q329 54 371 65 M308 79 H354"/>
        <path d="M392 206 Q440 195 483 205 M415 221 H462"/>
        <path d="M160 287 Q206 276 250 287 M185 302 H227"/>
        <path d="M88 351 H130 M472 338 Q510 330 546 338"/>
      </g>
      <g fill="#e2ffe4">
        <path d="M313 171 L317 185 L331 189 L317 193 L313 207 L309 193 L295 189 L309 185Z"/>
        <path d="M193 125 L196 134 L205 137 L196 140 L193 149 L190 140 L181 137 L190 134Z"/>
      </g>
    </svg>`,
    { size: 768 },
  );
  const emblemTexture = svg(
    `<svg viewBox="0 0 120 140">
      <path d="M5 5 H115 V100 L60 135 L5 100Z" fill="#254757" stroke="#edc47b" stroke-width="7"/>
      <circle cx="60" cy="54" r="24" fill="#f3cb79"/>
      <circle cx="70" cy="46" r="21" fill="#254757"/>
      <path d="M58 23 L62 33 L73 34 L64 41 L67 52 L58 45 L49 52 L52 41 L43 34 L54 33Z" fill="#fff0cd"/>
      <path d="M25 91 Q60 65 95 91 M31 103 Q60 81 89 103" stroke="#58b5ab" stroke-width="5" fill="none"/>
    </svg>`,
    { size: 256 },
  );
  const potteryTexture = svg(
    `<svg viewBox="0 0 240 80">
      <rect width="240" height="80" fill="#dc855b"/>
      <path d="M0 10 H240 M0 70 H240" stroke="#ffdc9a" stroke-width="8"/>
      <path d="M0 22 H240 M0 58 H240" stroke="#913f3c" stroke-width="5"/>
      <path d="M0 40 L20 24 L40 40 L60 24 L80 40 L100 24 L120 40 L140 24 L160 40 L180 24 L200 40 L220 24 L240 40
        M0 40 L20 56 L40 40 L60 56 L80 40 L100 56 L120 40 L140 56 L160 40 L180 56 L200 40 L220 56 L240 40"
        stroke="#ffedbf" stroke-width="5" fill="none"/>
    </svg>`,
    { size: 384 },
  );
  const plaqueTexture = svg(
    `<svg viewBox="0 0 420 125">
      <rect x="4" y="4" width="412" height="117" rx="13" fill="#233e52" stroke="#efc67b" stroke-width="7"/>
      <path d="M24 62 L35 48 L46 62 L35 76Z M374 62 L385 48 L396 62 L385 76Z" fill="#e6b578"/>
      <text x="210" y="61" text-anchor="middle" font-family="Georgia,serif"
        font-weight="bold" font-size="43" letter-spacing="4" fill="#ffedbe">MIRAGE</text>
      <text x="210" y="92" text-anchor="middle" font-family="sans-serif"
        font-size="17" letter-spacing="3" fill="#72c6ba">CARAVAN REST</text>
    </svg>`,
    { size: 512 },
  );

  const stage = b.joint("stage", { at: [0, 0, 0] });

  // Creature skeletons are laid out before the volumes and accessories.
  function camelRig(prefix: string, origin: P, scale: number, yaw: number) {
    const q = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      yaw * Math.PI / 180,
    );
    const location = b.region({ at: origin, scale, quat: q, bone: stage });
    const hips = b.joint(`${prefix}hips`, {
      parent: stage,
      at: location.p([0, 1.42, -0.52]),
      dir: location.d([0, 0, 1]),
      role: "spine",
    });
    const r = b.region({ at: origin, scale, quat: q, bone: hips });
    const spine = b.chain(
      `${prefix}spine`,
      [r.p([0, 1.42, -0.52]), r.p([0, 1.48, 0]), r.p([0, 1.51, 0.57])],
      { parent: hips, names: [`${prefix}spine1`, `${prefix}chest`], role: "spine" },
    );
    const neck = b.chain(
      `${prefix}neck`,
      [
        r.p([0, 1.48, 0.48]),
        r.p([0, 1.83, 0.77]),
        r.p([0, 2.28, 0.8]),
        r.p([0, 2.55, 1]),
      ],
      { parent: spine.joints[1], count: 3, role: "neck" },
    );
    const head = b.joint(`${prefix}head`, {
      parent: neck.joints[2],
      at: r.p([0, 2.55, 1]),
      dir: r.d([0, 0, 1]),
      role: "head",
    });
    const jaw = b.joint(`${prefix}jaw`, {
      parent: head,
      at: r.p([0, 2.40, 1.02]),
      dir: r.d([0, 0, 1]),
      role: "jaw",
    });
    const legs = [];
    for (const fore of [true, false]) {
      for (const side of [1, -1]) {
        const tag = `${prefix}${fore ? "F" : "H"}${side > 0 ? "L" : "R"}`;
        const z = fore ? 0.47 : -0.58;
        const toeZ = z + (fore ? 0.08 : -0.05);
        const chain = b.chain(
          `${tag}leg`,
          [
            r.p([side * 0.34, 1.46, z]),
            r.p([side * 0.40, 0.88, z + (fore ? 0.03 : 0.13)]),
            r.p([side * 0.44, 0.18, toeZ]),
          ],
          {
            parent: fore ? spine.joints[1] : hips,
            names: [`${tag}hip`, `${tag}knee`, `${tag}ankle`],
            role: "leg",
            contact: r.p([side * 0.44, 0, toeZ]),
          },
        );
        const toes = [-1, 1].map((digitSide, i) =>
          b.chain(
            `${tag}toe${i + 1}`,
            [
              r.p([side * 0.44 + digitSide * 0.075, 0.12, toeZ]),
              r.p([side * 0.44 + digitSide * 0.095, 0.105, toeZ + 0.20]),
            ],
            { parent: chain.tip!, role: "digit" },
          ),
        );
        legs.push({ chain, toes });
      }
    }
    const tail = b.chain(
      `${prefix}tail`,
      [
        r.p([0, 1.52, -0.74]),
        r.p([0.10, 1.19, -0.94]),
        r.p([0.17, 0.93, -1.08]),
        r.p([0.22, 0.77, -1.2]),
      ],
      { parent: hips, count: 3, role: "tail" },
    );
    return { r, scale, hips, spine, neck, head, jaw, legs, tail };
  }

  const camelA = camelRig("saffron", [1.35, 0.34, 2.55], 1.04, -15);
  const camelB = camelRig("date", [4.45, 0.34, 1.04], 0.86, -25);

  function ball(at: P | THREE.Vector3, size: P, color: Fill, bone: Joint = stage) {
    return b.part(new THREE.SphereGeometry(1, 8, 5), color, {
      at, scale: size, bone, flat: true,
    });
  }
  function box(at: P | THREE.Vector3, size: P, color: Fill, bone: Joint = stage) {
    return b.part(new THREE.BoxGeometry(...size), color, { at, bone });
  }
  function rod(
    a: P | THREE.Vector3,
    end: P | THREE.Vector3,
    radius: number,
    color: Fill,
    bone: Joint = stage,
  ) {
    return b.rod(a, end, radius, { color, bone, sides: 6 });
  }
  function floorDrawing(at: P, width: number, depth: number, texture: THREE.Texture) {
    return b.part(new THREE.PlaneGeometry(width, depth), "#ffffff", {
      at, dir: [0, 1, 0], up: [0, 0, -1], axis: "z", texture, bone: stage,
    });
  }
  function tassel(
    at: P | THREE.Vector3,
    length: number,
    bone: Joint = stage,
    color: string = C.gold,
  ) {
    const p = at instanceof THREE.Vector3 ? at : new THREE.Vector3(...at);
    ball(p, [0.034, 0.045, 0.034], color, bone);
    b.part(new THREE.ConeGeometry(0.055, length, 5), color, {
      at: p.clone().add(new THREE.Vector3(0, -length * 0.5 - 0.025, 0)),
      dir: [0, -1, 0], bone,
    });
  }

  const poolCenter: P = [-2.2, 0, 1.2];
  const shore: [number, number][] = [
    [-2.30, -0.10], [-2.02, -1.04], [-1.22, -1.50],
    [-0.34, -1.58], [0.36, -1.29], [1.07, -1.34],
    [1.91, -0.90], [2.20, -0.22], [2.08, 0.56],
    [1.43, 1.16], [0.55, 1.47], [-0.13, 1.28],
    [-0.72, 1.54], [-1.55, 1.22], [-2.12, 0.67],
  ];

  b.part(new THREE.CylinderGeometry(6.75, 6.45, 0.19, 16), C.rim, {
    at: [0, 0.095, 0], scale: [1.06, 1, 0.84], bone: stage, flat: true,
  });

  // A real opening in the sand plate prevents the pool from reading as a sticker.
  const islandShape = new THREE.Shape();
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2;
    const x = Math.sin(a) * 6.70 * 1.06;
    const v = -Math.cos(a) * 6.70 * 0.84;
    if (i === 0) islandShape.moveTo(x, v);
    else islandShape.lineTo(x, v);
  }
  islandShape.closePath();
  const poolHole = new THREE.Path();
  shore.forEach(([x, z], i) => {
    const px = poolCenter[0] + x * 1.10;
    const py = -(poolCenter[2] + z * 1.10);
    if (i === 0) poolHole.moveTo(px, py);
    else poolHole.lineTo(px, py);
  });
  poolHole.closePath();
  islandShape.holes.push(poolHole);
  const islandGeometry = new THREE.ExtrudeGeometry(islandShape, {
    depth: 0.15,
    bevelEnabled: false,
    steps: 1,
    curveSegments: 1,
  });
  islandGeometry.rotateX(-Math.PI / 2);
  b.part(islandGeometry, sandPaint, {
    at: [0, 0.19, 0], bone: stage, flat: true, name: "sandWithSpringRecess",
  });

  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2;
    const da = 0.10;
    rod(
      [Math.sin(a - da) * 7.04, 0.135, Math.cos(a - da) * 5.56],
      [Math.sin(a + da) * 7.04, 0.135, Math.cos(a + da) * 5.56],
      0.012, "#d98c60",
    );
  }
  for (const [x, z, w, h, d] of [
    [-4.6, -3.0, 1.95, 0.38, 1.35],
    [0.2, -4.2, 2.3, 0.32, 1.04],
    [4.8, -3.1, 1.55, 0.33, 1.25],
    [-5.2, 0.65, 1.05, 0.17, 1.40],
  ]) {
    b.part(new THREE.SphereGeometry(1, 10, 6), sandPaint, {
      at: [x, 0.29, z], scale: [w, h, d], bone: stage, flat: true,
    });
  }

  function poolPolygon(factor: number, y: number, color: Fill, texture?: THREE.Texture) {
    const shape = new THREE.Shape();
    shore.forEach(([x, z], i) => {
      if (i === 0) shape.moveTo(x * factor, -z * factor);
      else shape.lineTo(x * factor, -z * factor);
    });
    shape.closePath();
    const geometry = new THREE.ShapeGeometry(shape, 1);
    const pos = geometry.getAttribute("position");
    const uv = geometry.getAttribute("uv");
    for (let i = 0; i < pos.count; i++) {
      uv.setXY(i, (pos.getX(i) / factor + 2.3) / 4.5, (pos.getY(i) / factor + 1.58) / 3.16);
    }
    geometry.rotateX(-Math.PI / 2);
    return b.part(geometry, color, {
      bone: stage, at: [poolCenter[0], y, poolCenter[2]], texture,
    });
  }

  function bankRing(
    outer: number,
    inner: number,
    outerY: number,
    innerY: number,
    color: Fill,
  ) {
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    shore.forEach(([x, z], i) => {
      vertices.push(
        poolCenter[0] + x * outer, outerY, poolCenter[2] + z * outer,
        poolCenter[0] + x * inner, innerY, poolCenter[2] + z * inner,
      );
      uvs.push(i / shore.length, 1, i / shore.length, 0);
    });
    for (let i = 0; i < shore.length; i++) {
      const a = i * 2;
      const next = ((i + 1) % shore.length) * 2;
      indices.push(a, a + 1, next, next, a + 1, next + 1);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    b.part(geometry, color, {
      at: [0, 0, 0], bone: stage, flat: true, name: "slopingSpringBank",
    });
  }

  bankRing(1.15, 1.07, 0.343, 0.349, "#f9dda0");
  bankRing(1.07, 1.005, 0.349, 0.301, "#bba16e");
  poolPolygon(1.022, 0.303, "#196e83");
  poolPolygon(1, 0.309, "#ffffff", waterTexture);

  for (const i of [0, 2, 6, 8, 11, 13]) {
    const a = shore[i];
    const next = shore[(i + 1) % shore.length];
    rod(
      [poolCenter[0] + a[0] * 0.955, 0.317, poolCenter[2] + a[1] * 0.955],
      [poolCenter[0] + next[0] * 0.955, 0.317, poolCenter[2] + next[1] * 0.955],
      0.011, C.cyan,
    );
  }
  for (let i = 0; i < 20; i++) {
    const [x, z] = shore[i % shore.length];
    const f = 1.12 + random() * 0.075;
    const r = 0.10 + random() * 0.16;
    ball(
      [poolCenter[0] + x * f, 0.36 + r * 0.35, poolCenter[2] + z * f],
      [r * 1.3, r * 0.62, r],
      i % 3 === 0 ? "#ba9874" : "#f1cf95",
    );
  }

  function lily(x: number, z: number, flowering: boolean) {
    b.extrude(
      [
        [0, 0], [-0.10, 0.19], [-0.24, 0.10], [-0.25, -0.10],
        [-0.12, -0.22], [0.12, -0.20], [0.24, -0.04],
        [0.21, 0.14], [0.09, 0.21],
      ],
      {
        at: [x, 0.322, z],
        x: [1, 0, 0], y: [0, 0, -1],
        thickness: 0.016, color: "#609d61", bone: stage,
      },
    );
    rod([x, 0.333, z], [x - 0.13, 0.333, z + 0.14], 0.007, C.lime);
    if (!flowering) return;
    for (let j = 0; j < 5; j++) {
      const a = j / 5 * Math.PI * 2;
      b.extrude(
        [[-0.055, 0], [0.055, 0], [0.065, 0.10], [0, 0.21], [-0.065, 0.10]],
        {
          at: [x, 0.337, z + 0.03],
          x: [Math.cos(a), 0, -Math.sin(a)],
          y: [Math.sin(a) * 0.68, 0.75, Math.cos(a) * 0.68],
          thickness: 0.018, color: j % 2 ? "#f6dcbd" : C.cream, bone: stage,
        },
      );
    }
    ball([x, 0.395, z + 0.03], [0.065, 0.043, 0.065], C.gold);
  }
  lily(-3.33, 0.51, true);
  lily(-3.04, 0.31, false);
  lily(-1.41, 2.00, true);

  function reedClump(x: number, z: number, count: number) {
    for (let j = 0; j < count; j++) {
      const dx = (random() - 0.5) * 0.27;
      const dz = (random() - 0.5) * 0.23;
      const h = 0.32 + random() * 0.47;
      const tip: P = [x + dx * 2, 0.36 + h, z + dz * 2];
      b.extrude(
        [[-0.035, 0], [0.045, h * 0.45], [0.012, h], [-0.012, h * 0.60]],
        {
          at: [x + dx, 0.34, z + dz],
          x: [1, 0, 0], y: [dx * 0.5, 1, dz * 0.5],
          thickness: 0.016, color: j % 2 ? C.lime : C.green, bone: stage,
        },
      );
      if (j === 0 || j === 3) {
        rod([x + dx, 0.35, z + dz], tip, 0.016, C.darkGreen);
        ball(tip, [0.033, 0.095, 0.033], "#a77042");
      }
    }
    for (let j = 0; j < 2; j++) {
      const a = j * 2.9;
      b.extrude(
        [[-0.035, 0], [0.04, 0.14], [0.01, 0.32], [-0.04, 0.12]],
        {
          at: [x, 0.34, z],
          x: [Math.cos(a), 0, Math.sin(a)],
          y: [Math.sin(a) * 1.3, 0.8, Math.cos(a) * 1.3],
          thickness: 0.019, color: C.green, bone: stage,
        },
      );
    }
  }
  reedClump(-4.37, 0.25, 7);
  reedClump(-1.03, -0.25, 7);
  reedClump(-3.13, 2.90, 6);
  reedClump(-0.29, 1.95, 6);

  // A frond is a folded ribbon, not a smooth sphere or a field of fine cards.
  // Explicit stations keep the large leaf-edge notches intact.
  function frondHalf(
    center: THREE.Vector3[],
    edge: THREE.Vector3[],
    reverse: boolean,
    color: Fill,
  ) {
    const positions: number[] = [];
    const uv: number[] = [];
    const idx: number[] = [];
    center.forEach((p, i) => {
      const e = edge[i];
      positions.push(p.x, p.y, p.z, e.x, e.y, e.z);
      uv.push(i / (center.length - 1), 0, i / (center.length - 1), 1);
    });
    for (let i = 0; i < center.length - 1; i++) {
      const a = i * 2;
      const n = a + 2;
      if (reverse) idx.push(a, n, a + 1, n, n + 1, a + 1);
      else idx.push(a, a + 1, n, n, a + 1, n + 1);
    }
    // Back faces make the folded leaves readable from the low camera too.
    const faceCount = idx.length;
    for (let i = 0; i < faceCount; i += 3) {
      idx.push(idx[i + 2], idx[i + 1], idx[i]);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geometry.setIndex(idx);
    geometry.computeVertexNormals();
    b.part(geometry, color, {
      at: [0, 0, 0], bone: stage, flat: true, name: "foldedSerratedPalmFrond",
    });
  }

  function palm(x: number, z: number, h: number, lean: number, phase: number) {
    const path = catmull([
      [x, 0.33, z],
      [x + lean * 0.15, h * 0.35, z - 0.08],
      [x + lean * 0.65, h * 0.72, z - 0.14],
      [x + lean, h, z - 0.05],
    ]);
    const trunk = b.sweep(path, [0.25, 0.21, 0.17, 0.15], {
      color: trunkPaint, bone: stage, section: { ngon: 7 }, caps: "flat",
    });
    b.along(path, 10, (at) => {
      b.part(new THREE.CylinderGeometry(0.225, 0.24, 0.055, 7), "#b18452", {
        at, dir: at.axis, bone: stage,
        scale: [1 - at.t * 0.32, 1, 1 - at.t * 0.32],
      });
    });
    const crown = path.at(1);
    ball(crown, [0.30, 0.23, 0.30], C.darkGreen);

    for (let i = 0; i < 14; i++) {
      const upper = i >= 10;
      const a = phase + (upper
        ? (i - 10) / 4 * Math.PI * 2 + 0.32
        : i / 10 * Math.PI * 2);
      const dx = Math.sin(a);
      const dz = Math.cos(a);
      const side = new THREE.Vector3(dz, 0, -dx);
      const length = upper ? 1.52 : 2.10 + (i % 3) * 0.13;
      const root = crown.clone().add(new THREE.Vector3(0, upper ? 0.12 : -0.025, 0));
      const center: THREE.Vector3[] = [];
      const left: THREE.Vector3[] = [];
      const right: THREE.Vector3[] = [];
      for (let j = 0; j <= 16; j++) {
        const t = j / 16;
        const rise = Math.sin(t * Math.PI) * (upper ? 0.77 : 0.48);
        const drop = t * t * (upper ? 0.20 : 0.70);
        const c = root.clone().add(new THREE.Vector3(dx * length * t, rise - drop, dz * length * t));
        const envelope = Math.pow(Math.sin(t * Math.PI), 0.75);
        const tooth = j % 2 ? 1 : 0.52;
        const width = j === 0 ? 0.025 : envelope * tooth * (upper ? 0.28 : 0.36);
        center.push(c.clone().add(new THREE.Vector3(0, Math.sin(t * Math.PI) * 0.105, 0)));
        left.push(c.clone().addScaledVector(side, width));
        right.push(c.clone().addScaledVector(side, -width));
      }
      frondHalf(center, left, false, leafPaint);
      frondHalf(center, right, true, upper ? C.lime : i % 3 === 0 ? "#76a458" : C.green);
      b.sweep(polyline(center), [0.025, 0.005], {
        color: "#b5c77b", bone: stage, sides: 5, caps: "flat",
      });
    }
    for (let i = 0; i < 5; i++) {
      const a = phase + i / 5 * Math.PI * 2;
      b.spike(trunk.at(0.95, a * 180 / Math.PI), [Math.sin(a), 0.5, Math.cos(a)], 0.27, 0.10, {
        color: "#b79458", bone: stage, sides: 5,
      });
    }
    for (let bunch = 0; bunch < 3; bunch++) {
      const a = phase + bunch / 3 * Math.PI * 2 + 0.4;
      const stemEnd = crown.clone().add(new THREE.Vector3(
        Math.sin(a) * 0.40, -0.38, Math.cos(a) * 0.40,
      ));
      b.sweep(
        [crown, crown.clone().add(new THREE.Vector3(Math.sin(a) * 0.30, -0.14, Math.cos(a) * 0.30)), stemEnd],
        [0.025, 0.015], { color: "#a18e43", bone: stage, sides: 5 },
      );
      for (let j = 0; j < 6; j++) {
        const f = j * 2.4;
        const tier = j < 3 ? 0 : 1;
        const at = stemEnd.clone().add(new THREE.Vector3(
          Math.sin(f) * (tier ? 0.075 : 0.105),
          -0.065 - tier * 0.14,
          Math.cos(f) * (tier ? 0.075 : 0.105),
        ));
        ball(at, [0.065, 0.102, 0.065], j % 2 ? "#a75b36" : "#d9a249");
      }
    }
    ball([x, 0.35, z], [0.34, 0.13, 0.32], sandPaint);
  }
  palm(-4.55, -2.48, 5.22, 0.48, 0.25);
  palm(-0.35, -4.24, 5.72, -0.32, 0.63);
  palm(4.82, -3.35, 5.08, -0.38, 0.04);

  function tent(cx: number, cz: number, scale: number, small: boolean) {
    const s = scale;
    const p = (x: number, y: number, z: number): P =>
      [cx + x * s, 0.34 + y * s, cz + z * s];
    const half = 1.7;
    const depth = 1.3;
    const eave = 1.35;
    const peak = 2.54;

    floorDrawing(p(0, 0.024, 0.1), 3.05 * s, 2.1 * s, rugTexture);
    b.slab(
      [
        p(-half, 0, -depth), p(half, 0, -depth), p(half, eave, -depth),
        p(0, peak, -depth), p(-half, eave, -depth),
      ],
      { color: C.navy, thickness: 0.05 * s, bone: stage },
    );
    for (const side of [1, -1]) {
      b.membrane(
        [p(0, peak, -depth - 0.14), p(0, peak, depth + 0.20)],
        [p(side * (half + 0.18), eave, -depth - 0.14), p(side * (half + 0.18), eave, depth + 0.20)],
        { color: clothPaint, thickness: 0.055 * s, bone: stage, rows: 2, cols: 4 },
      );
      b.membrane(
        [p(side * half, eave, -depth), p(side * half, eave, depth * 0.8)],
        [p(side * half, 0.04, -depth), p(side * half, 0.04, depth * 0.8)],
        { color: clothPaint, thickness: 0.035 * s, bone: stage, rows: 2, cols: 4 },
      );
      for (const zz of [-depth, depth]) {
        rod(p(side * half, 0, zz), p(side * half, eave + 0.03, zz), 0.047 * s, C.wood);
      }
      for (const zz of [-depth - 0.17, depth + 0.22]) {
        rod(p(0, peak + 0.02, zz), p(side * (half + 0.18), eave + 0.02, zz), 0.032 * s, C.gold);
      }
      b.slab(
        [
          p(side * 0.04, peak - 0.07, depth + 0.03),
          p(side * half, eave + 0.02, depth + 0.03),
          p(side * (half - 0.12), 0.08, depth + 0.03),
          p(side * (half - 0.55), 0.76, depth + 0.12),
        ],
        { color: small ? C.teal : C.red, thickness: 0.055 * s, bone: stage },
      );
      rod(
        p(side * (half - 0.39), 0.76, depth + 0.13),
        p(side * (half + 0.02), 0.76, depth + 0.13),
        0.044 * s, C.gold,
      );
      tassel(p(side * (half - 0.13), 0.74, depth + 0.15), 0.17 * s);

      for (let j = 0; j < 6; j++) {
        const zz = -depth - 0.14 + (j + 0.5) * (2 * depth + 0.34) / 6;
        const dw = (2 * depth + 0.34) / 6;
        b.slab(
          [
            p(side * (half + 0.185), eave + 0.015, zz - dw * 0.47),
            p(side * (half + 0.185), eave + 0.015, zz + dw * 0.47),
            p(side * (half + 0.185), eave - 0.19, zz + dw * 0.25),
            p(side * (half + 0.185), eave - 0.25, zz),
            p(side * (half + 0.185), eave - 0.19, zz - dw * 0.25),
          ],
          { color: j % 2 ? C.red : C.cream, thickness: 0.028 * s, bone: stage },
        );
      }
      for (const back of [true, false]) {
        const zz = back ? -depth : depth * 0.62;
        const anchor = p(side * (half + 0.79), 0.04, zz + (back ? -0.45 : 0.15));
        rod(p(side * (half + 0.10), eave, zz), anchor, 0.013 * s, "#e9cf97");
        rod(
          [anchor[0], anchor[1] - 0.01, anchor[2]],
          [anchor[0] + side * 0.065 * s, anchor[1] + 0.23 * s, anchor[2]],
          0.035 * s, C.wood,
        );
      }
    }
    rod(p(0, 0.05, -depth + 0.07), p(0, peak + 0.70, -depth + 0.07), 0.050 * s, C.wood);
    rod(p(0, peak + 0.02, -depth - 0.25), p(0, peak + 0.02, depth + 0.30), 0.045 * s, C.wood);
    ball(p(0, peak + 0.73, -depth + 0.07), [0.07 * s, 0.085 * s, 0.07 * s], C.gold);
    b.slab(
      [
        p(0.01, peak + 0.64, -depth + 0.07),
        p(0.62, peak + 0.54, -depth + 0.10),
        p(0.38, peak + 0.37, -depth + 0.12),
        p(0.01, peak + 0.38, -depth + 0.07),
      ],
      { color: small ? C.red : C.teal, thickness: 0.025 * s, bone: stage },
    );
    rod(
      p(0.01, peak + 0.64, -depth + 0.082),
      p(0.62, peak + 0.54, -depth + 0.115),
      0.012 * s, C.gold,
    );
    b.part(new THREE.PlaneGeometry(0.37 * s, 0.45 * s), "#ffffff", {
      at: p(0, peak - 0.32, depth + 0.245),
      dir: [0, 0, 1], axis: "z", texture: emblemTexture, bone: stage,
    });
    box(p(0.35, 0.19, -0.42), [0.79 * s, 0.13 * s, 0.53 * s], C.wood);
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        box(p(0.35 + sx * 0.30, 0.10, -0.42 + sz * 0.18), [0.065 * s, 0.16 * s, 0.065 * s], C.wood);
      }
    }
    for (const [x, z, col] of [
      [-0.80, -0.48, C.teal], [0.91, -0.91, C.red], [-0.94, 0.35, C.gold],
    ] as [number, number, string][]) {
      const cushion = box(p(x, 0.15, z), [0.52 * s, 0.20 * s, 0.43 * s], col);
      b.decal(cushion, emblemTexture, {
        at: p(x, 0.25, z), dir: [0, 1, 0], up: [0, 0, -1],
        size: [0.18 * s, 0.20 * s], bone: stage,
      });
    }
    b.part(new THREE.CylinderGeometry(0.19 * s, 0.19 * s, 0.025 * s, 10), C.gold, {
      at: p(0.35, 0.277, -0.42), bone: stage,
    });
    for (const xx of [0.24, 0.45]) {
      b.lathe(
        [[0, 0], [0.045 * s, 0], [0.05 * s, 0.09 * s], [0.039 * s, 0.09 * s], [0.033 * s, 0.02 * s], [0, 0.02 * s]],
        { at: p(xx, 0.29, -0.42), color: C.cream, bone: stage, segments: 7 },
      );
    }
    for (let j = 0; j < 10; j++) {
      const xx = -1.42 + j * 0.315;
      rod(p(xx, 0.025, 1.14), p(xx, 0.025, 1.27), 0.013 * s, C.cream);
    }
  }
  tent(1.32, -2.05, 1, false);
  tent(-2.12, -3.40, 0.65, true);

  function buildCamel(c: ReturnType<typeof camelRig>, accent: string) {
    const { r, scale: s, hips, spine, neck, head, jaw, legs, tail } = c;
    const H = 1.12;
    const p = (v: P) => r.p(v);
    const d = (v: P) => r.d(v);
    const hp = (v: P) => p([
      v[0] * H,
      2.55 + (v[1] - 2.55) * H,
      1.04 + (v[2] - 1.04) * H,
    ]);

    const body = b.sweep(spine, () => [0.46 * s, 0.43 * s], {
      color: camelPaint, shift: [0, -0.05 * s], sides: 8,
      smooth: false, caps: "round",
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), camelPaint, {
      at: p([0, 1.85, -0.15]),
      scale: [0.39 * s, 0.60 * s, 0.49 * s],
      quat: r.q(), bone: hips, flat: true, name: "solidDromedaryHump",
    });
    const neckTube = b.sweep(neck, [0.29 * s, 0.22 * s, 0.18 * s, 0.18 * s], {
      color: camelPaint, sides: 7, smooth: false, caps: "round",
    });
    const skull = b.part(new THREE.SphereGeometry(1, 10, 7), camelPaint, {
      at: hp([0, 2.55, 1.11]),
      scale: [0.25 * s * H, 0.24 * s * H, 0.36 * s * H],
      quat: r.q(), bone: head, flat: true,
    });
    b.loft(
      [
        { at: hp([0, 2.50, 1.20]), w: 0.39 * s * H, h: 0.30 * s * H },
        { at: hp([0, 2.46, 1.49]), w: 0.35 * s * H, h: 0.23 * s * H },
        { at: hp([0, 2.44, 1.62]), w: 0.32 * s * H, h: 0.21 * s * H },
      ],
      { color: muzzlePaint, bone: head, sides: 6, smooth: false, caps: "round" },
    );
    b.loft(
      [
        { at: hp([0, 2.37, 1.14]), w: 0.31 * s * H, h: 0.12 * s * H },
        { at: hp([0, 2.31, 1.43]), w: 0.32 * s * H, h: 0.105 * s * H },
        { at: hp([0, 2.33, 1.61]), w: 0.28 * s * H, h: 0.095 * s * H },
      ],
      { color: "#c59a70", bone: jaw, sides: 6, caps: "round" },
    );
    b.part(new THREE.SphereGeometry(1, 6, 4), "#725142", {
      at: hp([0, 2.365, 1.47]),
      scale: [0.13 * s * H, 0.023 * s * H, 0.14 * s * H],
      quat: r.q(), bone: jaw,
    });
    for (const side of [1, -1]) {
      b.decal(skull, eyeTexture, {
        at: hp([side * 0.188, 2.60, 1.28]),
        dir: d([side * 0.62, 0.1, 1]), up: d([0, 1, 0]),
        size: [0.20 * s * H, 0.19 * s * H],
        mirror: side > 0, bone: head, segments: 6,
      });
      const ear = b.extrude(
        [[-0.055, 0], [0.08, 0.02], [0.15, 0.22], [0.085, 0.32], [-0.015, 0.24]]
          .map(([x, y]) => [x * s * H, y * s * H]),
        {
          at: hp([side * 0.17, 2.69, 0.99]),
          x: d([side, 0, 0]), y: d([side * 0.13, 1, -0.15]),
          thickness: 0.08 * s * H, color: camelPaint, bone: head,
        },
      );
      b.decal(ear, earTexture, {
        at: hp([side * 0.23, 2.84, 1.02]), dir: d([0, 0, 1]),
        size: [0.10 * s * H, 0.19 * s * H], bone: head, segments: 3,
      });
      b.part(new THREE.SphereGeometry(1, 6, 4), "#65483e", {
        at: hp([side * 0.105, 2.50, 1.70]),
        scale: [0.043 * s * H, 0.027 * s * H, 0.016 * s * H],
        quat: r.q(), bone: head,
      });
      b.capsule(hp([side * 0.18, 2.70, 1.12]), hp([side * 0.22, 2.70, 1.30]), 0.041 * s * H, {
        color: camelPaint, bone: head, sides: 6,
      });
      b.spike(hp([side * 0.21, 2.43, 1.02]), d([side * 0.6, -0.5, -0.3]), 0.18 * s * H, 0.07 * s * H, {
        color: camelPaint, bone: head, sides: 5,
      });
    }

    for (const leg of legs) {
      b.sweep(leg.chain, [0.155 * s, 0.095 * s, 0.066 * s], {
        color: camelPaint, sides: 6, smooth: false, caps: "round",
      });
      const knee = leg.chain.joints[1];
      b.part(new THREE.SphereGeometry(0.112 * s, 6, 4), "#bd895c", {
        at: knee, bone: knee, flat: true,
      });
      for (const toe of leg.toes) {
        b.sweep(toe, () => [0.088 * s, 0.105 * s], {
          color: "#a87352", caps: "round", sides: 6, smooth: false,
        });
      }
    }
    b.sweep(tail, [0.067 * s, 0.035 * s], { color: camelPaint, sides: 6 });
    b.part(new THREE.SphereGeometry(1, 6, 4), "#77503f", {
      at: tail.at(1), scale: [0.095 * s, 0.15 * s, 0.08 * s],
      bone: tail.joints[2], flat: true,
    });

    for (const side of [1, -1]) {
      const cloth = b.part(new THREE.BoxGeometry(0.045 * s, 0.66 * s, 0.93 * s), C.navy, {
        at: p([side * 0.468, 1.48, -0.12]), quat: r.q(), bone: hips,
      });
      b.decal(cloth, saddleTexture, {
        at: p([side * 0.494, 1.48, -0.12]),
        dir: d([side, 0, 0]), up: d([0, 1, 0]),
        size: [0.90 * s, 0.64 * s], bone: hips, segments: 3,
      });
      for (let j = 0; j < 5; j++) {
        tassel(p([side * 0.49, 1.13, -0.48 + j * 0.18]), 0.12 * s, hips, j % 2 ? accent : C.gold);
      }
      b.part(new THREE.BoxGeometry(0.11 * s, 0.11 * s, 0.70 * s), C.wood, {
        at: p([side * 0.405, 1.81, -0.16]), quat: r.q(), bone: hips,
      });
    }
    const girth = b.surface(body).loop(p([0, 1.44, 0.20]), {
      dir: d([0, 0, 1]), lift: 0.016 * s,
    });
    b.sweep(girth, 0.045 * s, { color: accent, bone: spine.joints[1], sides: 6 });
    const collar = b.surface(neckTube).loop(p([0, 1.83, 0.77]), {
      dir: d([0, 1, 0]), lift: 0.018 * s,
    });
    b.sweep(collar, 0.031 * s, { color: accent, sides: 6 });
    tassel(p([0, 1.78, 1.02]), 0.20 * s, neck.joints[1]);

    b.sweep(
      polyline([
        hp([-0.18, 2.47, 1.56]), hp([-0.19, 2.40, 1.62]),
        hp([0, 2.39, 1.72]), hp([0.19, 2.40, 1.62]),
        hp([0.18, 2.47, 1.56]), hp([0, 2.57, 1.59]),
      ], { closed: true }),
      0.022 * s * H,
      { color: accent, bone: head, sides: 5 },
    );
    for (const side of [1, -1]) {
      b.sweep(
        [
          hp([side * 0.19, 2.43, 1.59]),
          hp([side * 0.25, 2.47, 1.08]),
          hp([side * 0.17, 2.68, 0.91]),
        ],
        0.019 * s * H,
        { color: accent, bone: head, sides: 5 },
      );
      ball(hp([side * 0.196, 2.44, 1.59]), [0.035 * s, 0.035 * s, 0.035 * s], C.gold, head);
    }
    b.part(new THREE.BoxGeometry(0.54 * s, 0.22 * s, 0.29 * s), accent, {
      at: p([0, 1.89, -0.62]), quat: r.q(), bone: hips,
    });
    b.sweep(
      [p([-0.28, 1.89, -0.62]), p([0, 2.02, -0.62]), p([0.28, 1.89, -0.62])],
      0.017 * s, { color: C.gold, bone: hips, sides: 5 },
    );
  }
  buildCamel(camelA, C.teal);
  buildCamel(camelB, C.red);

  function jar(x: number, z: number, scale: number, color: string) {
    b.lathe(
      [
        [0, 0], [0.19, 0], [0.29, 0.15], [0.31, 0.35],
        [0.24, 0.52], [0.13, 0.61], [0.14, 0.67],
        [0.10, 0.67], [0.09, 0.59], [0.17, 0.45], [0, 0.43],
      ].map(([r, h]) => [r * scale, h * scale]),
      { at: [x, 0.35, z], color, bone: stage, segments: 9 },
    );
    b.part(new THREE.CylinderGeometry(0.31 * scale, 0.29 * scale, 0.18 * scale, 9, 1, true), "#ffffff", {
      at: [x, 0.35 + 0.31 * scale, z], texture: potteryTexture, bone: stage,
    });
    b.part(new THREE.CylinderGeometry(0.103 * scale, 0.103 * scale, 0.015 * scale, 9), "#473938", {
      at: [x, 0.35 + 0.615 * scale, z], bone: stage,
    });
  }
  jar(-0.28, -0.16, 0.95, "#ce7955");
  jar(0.13, -0.46, 0.66, "#dd9765");
  jar(3.74, -1.23, 0.78, "#bd684d");

  b.lathe(
    [[0, 0], [0.24, 0], [0.34, 0.37], [0.32, 0.43], [0.28, 0.43], [0.25, 0.07], [0, 0.07]],
    { at: [-0.69, 0.35, -0.50], color: "#ba8b51", bone: stage, segments: 10 },
  );
  for (let j = 0; j < 4; j++) {
    b.part(new THREE.TorusGeometry(0.25 + j * 0.023, 0.017, 4, 10), "#e1b971", {
      at: [-0.69, 0.40 + j * 0.092, -0.50], dir: [0, 1, 0], axis: "z", bone: stage,
    });
  }
  for (let j = 0; j < 6; j++) {
    ball(
      [-0.69 + (random() - 0.5) * 0.33, 0.73 + random() * 0.065, -0.5 + (random() - 0.5) * 0.30],
      [0.066, 0.078, 0.06], j % 2 ? "#985333" : "#c47a3e",
    );
  }

  function dateCrate(x: number, z: number) {
    box([x, 0.38, z], [0.70, 0.07, 0.46], C.wood);
    for (const side of [-1, 1]) {
      for (let j = 0; j < 2; j++) {
        box([x, 0.47 + j * 0.105, z + side * 0.22], [0.74, 0.075, 0.045], "#b58a58");
        box([x + side * 0.35, 0.47 + j * 0.105, z], [0.045, 0.075, 0.44], "#b58a58");
      }
      for (const end of [-1, 1]) {
        box([x + side * 0.32, 0.51, z + end * 0.19], [0.07, 0.27, 0.06], C.wood);
      }
    }
    box([x, 0.46, z], [0.61, 0.07, 0.35], "#694733");
    for (let j = 0; j < 7; j++) {
      ball(
        [x - 0.24 + j % 4 * 0.15, 0.53 + (j % 3) * 0.018, z - 0.095 + Math.floor(j / 4) * 0.17],
        [0.058, 0.047, 0.087], j % 2 ? "#985333" : "#c47a3e",
      );
    }
  }
  dateCrate(3.95, -2.12);

  const lanternX = 3.10;
  const lanternZ = -0.22;
  box([lanternX, 0.415, lanternZ], [0.29, 0.10, 0.29], C.navy);
  glow(box([lanternX, 0.63, lanternZ], [0.20, 0.35, 0.20], "#ffc36c"), 1.2);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      rod(
        [lanternX + sx * 0.115, 0.44, lanternZ + sz * 0.115],
        [lanternX + sx * 0.115, 0.83, lanternZ + sz * 0.115],
        0.019, C.navy,
      );
    }
  }
  b.part(new THREE.ConeGeometry(0.22, 0.17, 4), C.navy, {
    at: [lanternX, 0.885, lanternZ], rotation: [0, 45, 0], bone: stage,
  });
  b.part(new THREE.TorusGeometry(0.09, 0.015, 5, 10), C.gold, {
    at: [lanternX, 1.0, lanternZ], bone: stage,
  });

  // A tiny tea hearth; no smoke cloud or oversized flame competes with the camels.
  const teaX = 1.78;
  const teaZ = -0.05;
  b.part(new THREE.CylinderGeometry(0.30, 0.31, 0.018, 10), "#694733", {
    at: [teaX, 0.349, teaZ], bone: stage,
  });
  for (let j = 0; j < 7; j++) {
    const a = j / 7 * Math.PI * 2;
    ball(
      [teaX + Math.sin(a) * 0.29, 0.40, teaZ + Math.cos(a) * 0.29],
      [0.12, 0.072, 0.10], j % 2 ? "#ba9874" : "#a68b70",
    );
  }
  rod([teaX - 0.18, 0.395, teaZ - 0.09], [teaX + 0.17, 0.395, teaZ + 0.08], 0.046, "#694733");
  rod([teaX - 0.10, 0.425, teaZ + 0.15], [teaX + 0.10, 0.425, teaZ - 0.16], 0.043, "#694733");
  for (let j = 0; j < 3; j++) {
    glow(b.part(new THREE.ConeGeometry(0.05, 0.16 + j * 0.025, 5), "#ef9953", {
      at: [teaX - 0.09 + j * 0.085, 0.48, teaZ], bone: stage,
    }), 1.1);
  }
  for (const side of [-1, 1]) {
    rod([teaX + side * 0.20, 0.41, teaZ - 0.16], [teaX + side * 0.20, 0.62, teaZ - 0.16], 0.021, C.navy);
    rod([teaX + side * 0.20, 0.41, teaZ + 0.16], [teaX + side * 0.20, 0.62, teaZ + 0.16], 0.021, C.navy);
    rod([teaX + side * 0.20, 0.62, teaZ - 0.16], [teaX + side * 0.20, 0.62, teaZ + 0.16], 0.021, C.navy);
  }
  rod([teaX - 0.20, 0.62, teaZ], [teaX + 0.20, 0.62, teaZ], 0.021, C.navy);
  b.lathe(
    [[0, 0], [0.115, 0], [0.175, 0.11], [0.155, 0.23], [0.105, 0.26], [0, 0.26]],
    { at: [teaX, 0.641, teaZ], color: C.gold, bone: stage, segments: 9 },
  );
  b.lathe(
    [[0, 0], [0.12, 0], [0.10, 0.04], [0.035, 0.065], [0, 0.065]],
    { at: [teaX, 0.91, teaZ], color: "#e1b971", bone: stage, segments: 9 },
  );
  ball([teaX, 0.989, teaZ], [0.035, 0.032, 0.035], C.wood);
  b.sweep(
    [
      [teaX + 0.13, 0.76, teaZ],
      [teaX + 0.26, 0.80, teaZ],
      [teaX + 0.32, 0.91, teaZ],
    ],
    [0.048, 0.029], { color: C.gold, bone: stage, sides: 6, caps: "flat" },
  );
  b.sweep(
    [
      [teaX - 0.13, 0.72, teaZ],
      [teaX - 0.28, 0.77, teaZ],
      [teaX - 0.28, 0.90, teaZ],
      [teaX - 0.13, 0.92, teaZ],
    ],
    0.027, { color: C.wood, bone: stage, sides: 6, caps: "flat" },
  );

  floorDrawing([-3.22, 0.352, -0.85], 1.13, 0.77, rugTexture);
  for (let j = 0; j < 7; j++) {
    const x = -3.72 + j * 0.165;
    rod([x, 0.356, -0.44], [x, 0.356, -0.34], 0.012, C.cream);
  }
  box([-3.48, 0.43, -0.93], [0.36, 0.16, 0.29], C.teal);
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.025, 10), C.gold, {
    at: [-2.95, 0.374, -0.90], bone: stage,
  });
  b.lathe(
    [[0, 0], [0.044, 0], [0.050, 0.08], [0.038, 0.08], [0.031, 0.02], [0, 0.02]],
    { at: [-2.95, 0.393, -0.90], color: C.cream, bone: stage, segments: 7 },
  );

  for (const [x, z] of [[-4.68, -1.92], [-4.10, -2.85], [4.45, -3.0]]) {
    for (let j = 0; j < 3; j++) {
      const a = j * 2.2;
      b.extrude(
        [[-0.05, 0], [0.12, 0.16], [0.02, 0.45], [-0.08, 0.18]],
        {
          at: [x, 0.35, z],
          x: [Math.cos(a), 0, Math.sin(a)],
          y: [Math.sin(a) * 0.45, 1, Math.cos(a) * 0.45],
          thickness: 0.025, color: j % 2 ? C.lime : C.green, bone: stage,
        },
      );
    }
  }

  for (let j = 0; j < 8; j++) {
    const t = j / 7;
    const x = 0.62 - t * 0.91;
    const z = 3.45 - t * 1.22;
    for (const side of [-1, 1]) {
      ball(
        [x + side * 0.047, 0.342, z + (j % 2 ? 0.04 : -0.04)],
        [0.032, 0.008, 0.072], "#c79c68",
      );
    }
  }
  for (const row of [
    [[-4.9, 0.349, 3.65], [-4.2, 0.349, 3.92], [-3.1, 0.349, 4.04]],
    [[-4.5, 0.349, 4.02], [-3.9, 0.349, 4.21], [-2.9, 0.349, 4.29]],
    [[0.0, 0.349, 4.62], [0.9, 0.349, 4.74], [1.7, 0.349, 4.63]],
  ]) {
    b.sweep(catmull(row), 0.014, { color: "#d7aa73", bone: stage, sides: 5 });
  }

  // Outside the maximum sand radius, so no plane slices through the inscription.
  for (const side of [-1, 1]) {
    box([side * 0.70, 0.23, 5.655], [0.055, 0.16, 0.29], C.navy);
  }
  box([0, 0.27, 5.82], [1.82, 0.43, 0.09], C.navy);
  b.part(new THREE.PlaneGeometry(1.78, 0.405), "#ffffff", {
    at: [0, 0.27, 5.871], texture: plaqueTexture,
    dir: [0, 0, 1], axis: "z", bone: stage,
  });
  for (const side of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.022, 6, 4), C.gold, {
      at: [side * 0.843, 0.27, 5.876], bone: stage,
    });
  }

  return b.root;
}
```