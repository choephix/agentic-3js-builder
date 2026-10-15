```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  polyline,
  paint,
  grain,
  mottle,
  noise,
  mix,
  svg,
} from "agentic-3js-builder";
import type { Joint, Paint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Mirage — Caravan Rest",
  description:
    "A whimsical, faceted desert oasis: turquoise water, three sweeping palms, striped caravan tents, and two rigged dromedaries wearing embroidered saddlecloths.",
};

type Fill = string | Paint;
type P = [number, number, number];

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
    water: "#37b7b5",
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

  const trunkPaint = grain("#76503a", "#bc8150", {
    axis: "y",
    size: 0.055,
    seed: 17,
  });
  const leafPaint = paint((p, n) =>
    mix("#276648", "#94b963", 0.3 + n.y * 0.24 + noise(p, 0.65, 9) * 0.3),
  );
  const camelPaint = paint((p, n) =>
    mix(
      "#b47b51",
      "#edbf83",
      0.37 + n.y * 0.22 + noise(p, 0.3, 11) * 0.3,
    ),
  );
  const muzzlePaint = mottle("#d8aa77", "#f5d5a0", {
    size: 0.18,
    contrast: 0.55,
    seed: 13,
  });

  const clothPaint = paint((p, n) => {
    const stripe = ((p.z * 2.4) % 1 + 1) % 1;
    let col: string = stripe < 0.5 ? C.cream : C.red;
    if (stripe > 0.45 && stripe < 0.53) col = C.gold;
    if (stripe > 0.93) col = C.navy;
    return mix(col, "#604b52", n.y < -0.2 ? 0.23 : 0.03);
  });

  // Drawings are shared between repeated pieces.
  const eyeTexture = svg(
    `<svg viewBox="0 0 100 100">
      <ellipse cx="50" cy="53" rx="41" ry="33" fill="#422b2d"/>
      <ellipse cx="51" cy="55" rx="33" ry="25" fill="#fff0d3"/>
      <ellipse cx="54" cy="54" rx="17" ry="24" fill="#5b493d"/>
      <ellipse cx="57" cy="56" rx="10" ry="19" fill="#242b32"/>
      <circle cx="51" cy="46" r="6" fill="#ffffff"/>
      <circle cx="62" cy="65" r="3" fill="#ffe9ae"/>
      <path d="M14 40 Q46 10 84 35 M18 36 L9 23 M27 29 L23 15"
        fill="none" stroke="#422b2d" stroke-width="7" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const saddleTexture = svg(
    `<svg viewBox="0 0 180 150">
      <rect width="180" height="150" fill="#254757"/>
      <rect x="7" y="7" width="166" height="136" fill="#ba4748"
        stroke="#f7d58d" stroke-width="5"/>
      <path d="M14 22 H166 M14 128 H166" stroke="#f7d58d" stroke-width="5"/>
      <path d="M18 34 H162 M18 116 H162" stroke="#243e50" stroke-width="8"/>
      <path d="M90 39 L127 75 L90 111 L53 75Z" fill="#f7d58d"/>
      <path d="M90 50 L115 75 L90 100 L65 75Z" fill="#227b7b"/>
      <path d="M90 62 L103 75 L90 88 L77 75Z" fill="#fff0cd"/>
      <g fill="#f7d58d">
        <path d="M29 53 L45 75 L29 97 L15 75Z"/>
        <path d="M151 53 L165 75 L151 97 L135 75Z"/>
      </g>
      <path d="M13 12 H167 V138 H13Z" fill="none"
        stroke="#fff0cd" stroke-width="2" stroke-dasharray="4 5"/>
    </svg>`,
    { size: 384 },
  );

  const rugTexture = svg(
    `<svg viewBox="0 0 220 160">
      <rect width="220" height="160" fill="#ddaa62"/>
      <rect x="8" y="8" width="204" height="144" fill="#1f666e"/>
      <rect x="18" y="18" width="184" height="124" fill="#c95348"
        stroke="#f9d895" stroke-width="4"/>
      <path d="M110 30 L177 80 L110 130 L43 80Z" fill="#efcd88"/>
      <path d="M110 43 L159 80 L110 117 L61 80Z" fill="#233e52"/>
      <path d="M110 58 L139 80 L110 102 L81 80Z" fill="#2d9891"/>
      <path d="M110 68 L124 80 L110 92 L96 80Z" fill="#ffedbe"/>
      <g fill="#f9d895">
        <path d="M32 35 L43 46 L32 57 L21 46Z"/>
        <path d="M188 35 L199 46 L188 57 L177 46Z"/>
        <path d="M32 103 L43 114 L32 125 L21 114Z"/>
        <path d="M188 103 L199 114 L188 125 L177 114Z"/>
      </g>
      <rect x="12" y="12" width="196" height="136" fill="none"
        stroke="#fff0cd" stroke-width="2" stroke-dasharray="4 5"/>
    </svg>`,
    { size: 512 },
  );

  const waterTexture = svg(
    `<svg viewBox="0 0 600 400">
      <rect width="600" height="400" fill="#35b9b6"/>
      <path d="M0 20 L140 0 L230 90 L110 180 L0 140Z" fill="#58cec0"/>
      <path d="M600 40 L440 0 L340 110 L420 220 L600 175Z" fill="#209fa9"/>
      <path d="M0 400 L0 240 L160 205 L280 290 L225 400Z" fill="#66d3bf"/>
      <path d="M600 400 L400 400 L290 285 L415 245 L600 290Z" fill="#2caaa8"/>
      <g fill="none" stroke="#b8f2d8" stroke-width="4" stroke-linecap="round">
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
      <path d="M5 5 H115 V100 L60 135 L5 100Z"
        fill="#254757" stroke="#edc47b" stroke-width="7"/>
      <circle cx="60" cy="54" r="24" fill="#f3cb79"/>
      <circle cx="70" cy="46" r="21" fill="#254757"/>
      <path d="M58 23 L62 33 L73 34 L64 41 L67 52 L58 45 L49 52 L52 41 L43 34 L54 33Z"
        fill="#fff0cd"/>
      <path d="M25 91 Q60 65 95 91 M31 103 Q60 81 89 103"
        stroke="#58b5ab" stroke-width="5" fill="none"/>
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
      <rect x="4" y="4" width="412" height="117" rx="13"
        fill="#233e52" stroke="#efc67b" stroke-width="7"/>
      <path d="M35 62 L49 43 L63 62 L49 81Z M357 62 L371 43 L385 62 L371 81Z"
        fill="#e6b578"/>
      <text x="210" y="57" text-anchor="middle" font-family="serif"
        font-size="38" letter-spacing="7" fill="#ffedbe">MIRAGE</text>
      <text x="210" y="89" text-anchor="middle" font-family="sans-serif"
        font-size="16" letter-spacing="4" fill="#72c6ba">CARAVAN REST</text>
    </svg>`,
    { size: 512 },
  );

  // Skeletons come first. All setting geometry rides the stage, not an animal.
  const stage = b.joint("stage", { at: [0, 0, 0] });

  function camelRig(prefix: string, origin: P, scale: number, yaw: number) {
    const q = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      (yaw * Math.PI) / 180,
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
        r.p([0, 2.55, 1.0]),
      ],
      { parent: spine.joints[1], count: 3, role: "neck" },
    );
    const head = b.joint(`${prefix}head`, {
      parent: neck.joints[2],
      at: r.p([0, 2.55, 1.0]),
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
      for (const s of [1, -1]) {
        const tag = `${prefix}${fore ? "F" : "H"}${s > 0 ? "L" : "R"}`;
        const z = fore ? 0.47 : -0.58;
        const chain = b.chain(
          `${tag}leg`,
          [
            r.p([s * 0.34, 1.46, z]),
            r.p([s * 0.40, 0.88, z + (fore ? 0.03 : 0.13)]),
            r.p([s * 0.44, 0.18, z + (fore ? 0.08 : -0.05)]),
          ],
          {
            parent: fore ? spine.joints[1] : hips,
            names: [`${tag}hip`, `${tag}knee`, `${tag}ankle`],
            role: "leg",
            contact: r.p([s * 0.44, 0, z + (fore ? 0.08 : -0.05)]),
          },
        );
        const toeZ = z + (fore ? 0.08 : -0.05);
        const toes = [-1, 1].map((side, i) =>
          b.chain(
            `${tag}toe${i + 1}`,
            [
              r.p([s * 0.44 + side * 0.075, 0.12, toeZ]),
              r.p([s * 0.44 + side * 0.095, 0.105, toeZ + 0.20]),
            ],
            { parent: chain.tip!, role: "digit" },
          ),
        );
        legs.push({ chain, toes, tag });
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
    return { prefix, r, scale, hips, spine, neck, head, jaw, legs, tail };
  }

  const camelA = camelRig("saffron", [2.0, 0.34, 2.45], 1, -12);
  const camelB = camelRig("date", [4.65, 0.34, 0.72], 0.84, -24);

  function ball(at: P | THREE.Vector3, size: P, color: Fill, bone: Joint = stage) {
    return b.part(new THREE.SphereGeometry(1, 8, 5), color, {
      at,
      scale: size,
      bone,
      flat: true,
    });
  }

  function box(at: P | THREE.Vector3, size: P, color: Fill, bone: Joint = stage) {
    return b.part(new THREE.BoxGeometry(...size), color, { at, bone });
  }

  function rod(a: P, end: P, radius: number, color: Fill, bone: Joint = stage) {
    return b.rod(a, end, radius, { color, bone, sides: 6 });
  }

  function floorDrawing(
    at: P,
    width: number,
    depth: number,
    texture: THREE.Texture,
    bone: Joint = stage,
  ) {
    return b.part(new THREE.PlaneGeometry(width, depth), "#ffffff", {
      at,
      dir: [0, 1, 0],
      up: [0, 0, -1],
      axis: "z",
      texture,
      bone,
    });
  }

  // A little cutaway island, with a warm, terracotta-coloured lower edge.
  b.part(new THREE.CylinderGeometry(6.75, 6.45, 0.19, 16), C.rim, {
    at: [0, 0.095, 0],
    scale: [1.06, 1, 0.91],
    bone: stage,
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(6.68, 6.76, 0.15, 16), sandPaint, {
    at: [0, 0.265, 0],
    scale: [1.06, 1, 0.91],
    bone: stage,
    flat: true,
  });

  // Fine exposed strata are physical lines, rather than noisy surface clutter.
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const da = 0.12;
    rod(
      [Math.sin(a - da) * 7.04, 0.135, Math.cos(a - da) * 6.04],
      [Math.sin(a + da) * 7.04, 0.135, Math.cos(a + da) * 6.04],
      0.013,
      "#d98c60",
    );
  }

  for (const [x, z, w, h, d] of [
    [-4.6, -3.2, 2.1, 0.42, 1.65],
    [0.2, -4.3, 2.5, 0.32, 1.25],
    [4.8, -3.1, 1.7, 0.35, 1.5],
    [-5.2, 1.1, 1.25, 0.20, 1.75],
  ]) {
    ball([x, 0.33, z], [w, h, d], sandPaint);
  }

  const poolCenter: P = [-2.2, 0, 1.2];
  const shore: [number, number][] = [
    [-2.30, -0.10], [-2.02, -1.04], [-1.22, -1.50],
    [-0.34, -1.58], [0.36, -1.29], [1.07, -1.34],
    [1.91, -0.90], [2.20, -0.22], [2.08, 0.56],
    [1.43, 1.16], [0.55, 1.47], [-0.13, 1.28],
    [-0.72, 1.54], [-1.55, 1.22], [-2.12, 0.67],
  ];

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
      bone: stage,
      at: [poolCenter[0], y, poolCenter[2]],
      texture,
    });
  }

  poolPolygon(1.13, 0.347, "#f9dda0");
  poolPolygon(1.065, 0.356, "#bc986b");
  poolPolygon(1.025, 0.365, "#1f8392");
  const water = poolPolygon(1, 0.375, "#ffffff", waterTexture);
  glow(water, 0.22);

  // A discontinuous pale waterline keeps the pool angular and hand-made.
  for (const i of [0, 2, 3, 6, 8, 11, 13]) {
    const a = shore[i];
    const next = shore[(i + 1) % shore.length];
    rod(
      [poolCenter[0] + a[0] * 0.96, 0.382, poolCenter[2] + a[1] * 0.96],
      [poolCenter[0] + next[0] * 0.96, 0.382, poolCenter[2] + next[1] * 0.96],
      0.016,
      C.cyan,
    );
  }

  for (let i = 0; i < 20; i++) {
    const index = i % shore.length;
    const [x, z] = shore[index];
    const f = 1.12 + random() * 0.075;
    const r = 0.10 + random() * 0.16;
    ball(
      [poolCenter[0] + x * f, 0.36 + r * 0.35, poolCenter[2] + z * f],
      [r * 1.3, r * 0.62, r],
      i % 3 === 0 ? "#ba9874" : "#f1cf95",
    );
  }

  function reedClump(x: number, z: number, count: number) {
    for (let j = 0; j < count; j++) {
      const dx = (random() - 0.5) * 0.22;
      const dz = (random() - 0.5) * 0.18;
      const h = 0.32 + random() * 0.43;
      const tip: P = [x + dx * 2, 0.36 + h, z + dz * 2];
      b.extrude(
        [[-0.035, 0], [0.045, h * 0.45], [0.012, h], [-0.012, h * 0.60]],
        {
          at: [x + dx, 0.35, z + dz],
          x: [1, 0, 0],
          y: [dx * 0.5, 1, dz * 0.5],
          thickness: 0.016,
          color: j % 2 === 0 ? C.green : C.lime,
          bone: stage,
        },
      );
      if (j === 0) {
        rod([x + dx, 0.37, z + dz], tip, 0.018, C.darkGreen);
        ball(tip, [0.04, 0.09, 0.04], "#a77042");
      }
    }
  }
  reedClump(-4.37, 0.25, 4);
  reedClump(-1.03, -0.25, 4);
  reedClump(-3.13, 2.90, 3);
  reedClump(-0.29, 1.95, 4);

  // Folded fronds: two broad polygonal faces meeting at a raised midrib.
  function palm(x: number, z: number, h: number, lean: number, phase: number) {
    const path = catmull([
      [x, 0.33, z],
      [x + lean * 0.15, h * 0.35, z - 0.08],
      [x + lean * 0.65, h * 0.72, z - 0.14],
      [x + lean, h, z - 0.05],
    ]);
    const trunk = b.sweep(path, [0.27, 0.21, 0.17, 0.15], {
      color: trunkPaint,
      bone: stage,
      section: { ngon: 7 },
      caps: "flat",
    });

    b.along(path, 11, (at) => {
      b.part(new THREE.CylinderGeometry(0.225, 0.25, 0.095, 7), "#b18452", {
        at,
        dir: at.axis,
        bone: stage,
        scale: [1 - at.t * 0.32, 1, 1 - at.t * 0.32],
      });
    });

    const crown = path.at(1);
    ball(crown, [0.36, 0.30, 0.36], C.darkGreen);
    for (let i = 0; i < 8; i++) {
      const a = phase + (i / 8) * Math.PI * 2;
      const dx = Math.sin(a);
      const dz = Math.cos(a);
      const side = new THREE.Vector3(dz, 0, -dx);
      const length = 1.68 + (i % 3) * 0.14;
      const pts = [
        crown.clone(),
        crown.clone().add(new THREE.Vector3(dx * 0.53, 0.40, dz * 0.53)),
        crown.clone().add(new THREE.Vector3(dx * length * 0.66, 0.17, dz * length * 0.66)),
        crown.clone().add(new THREE.Vector3(dx * length, -0.48 - (i % 2) * 0.16, dz * length)),
      ];
      const left = pts.map((p, j) => p.clone().addScaledVector(side, [0.02, 0.23, 0.27, 0][j]));
      const right = pts.map((p, j) => p.clone().addScaledVector(side, -[0.02, 0.23, 0.27, 0][j]));
      const ridge = pts.map((p, j) => p.clone().add(new THREE.Vector3(0, [0.02, 0.085, 0.075, 0][j], 0)));
      b.membrane(ridge, left, {
        color: leafPaint,
        bone: stage,
        thickness: 0.018,
        rows: 1,
        cols: 3,
      });
      b.membrane(ridge, right, {
        color: i % 3 === 0 ? C.lime : C.green,
        bone: stage,
        thickness: 0.018,
        rows: 1,
        cols: 3,
      });
      b.sweep(polyline(ridge), [0.022, 0.010], {
        color: "#b7bd70",
        bone: stage,
        sides: 5,
        caps: "flat",
      });
    }

    // Ochre leaf boots and a modest cluster of dates under the canopy.
    for (let i = 0; i < 5; i++) {
      const a = phase + (i / 5) * Math.PI * 2;
      const root = trunk.at(0.92, (a * 180) / Math.PI);
      b.spike(root, [Math.sin(a), 0.5, Math.cos(a)], 0.32, 0.12, {
        color: "#b79458",
        bone: stage,
        sides: 5,
      });
    }
    for (let i = 0; i < 4; i++) {
      const a = phase + i * 1.8;
      ball(
        [crown.x + Math.sin(a) * 0.25, crown.y - 0.34 - (i % 2) * 0.1, crown.z + Math.cos(a) * 0.25],
        [0.115, 0.17, 0.12],
        i % 2 ? "#a75b36" : "#c28239",
      );
    }
    ball([x, 0.36, z], [0.42, 0.16, 0.38], sandPaint);
  }

  palm(-4.55, -2.48, 5.48, 0.48, 0.25);
  palm(-0.35, -4.24, 5.96, -0.32, 0.63);
  palm(4.82, -3.35, 5.38, -0.38, 0.04);

  function tassel(at: P | THREE.Vector3, length: number, bone: Joint = stage, color = C.gold) {
    const p = at instanceof THREE.Vector3 ? at : new THREE.Vector3(...at);
    ball(p, [0.034, 0.045, 0.034], color, bone);
    b.part(new THREE.ConeGeometry(0.055, length, 5), color, {
      at: p.clone().add(new THREE.Vector3(0, -length * 0.5 - 0.035, 0)),
      dir: [0, -1, 0],
      bone,
    });
  }

  // Open-front striped pavilions, with readable, furnished interiors.
  function tent(cx: number, cz: number, scale: number, small: boolean) {
    const s = scale;
    const y0 = 0.34;
    const p = (x: number, y: number, z: number): P =>
      [cx + x * s, y0 + y * s, cz + z * s];
    const half = 1.7;
    const depth = 1.3;
    const eave = 1.35;
    const peak = 2.54;

    floorDrawing(p(0, 0.024, 0.1), 3.05 * s, 2.1 * s, rugTexture);
    // Rear lining is deliberately dark to give the doorway depth.
    b.slab(
      [p(-half, 0, -depth), p(half, 0, -depth), p(half, eave, -depth),
       p(0, peak, -depth), p(-half, eave, -depth)],
      { color: C.navy, thickness: 0.05 * s, bone: stage },
    );

    for (const side of [1, -1]) {
      const roof = [
        p(0, peak, -depth - 0.14),
        p(0, peak, depth + 0.20),
      ];
      const edge = [
        p(side * (half + 0.18), eave, -depth - 0.14),
        p(side * (half + 0.18), eave, depth + 0.20),
      ];
      b.membrane(roof, edge, {
        color: clothPaint,
        thickness: 0.055 * s,
        bone: stage,
        rows: 2,
        cols: 4,
      });
      b.membrane(
        [p(side * half, eave, -depth), p(side * half, eave, depth * 0.8)],
        [p(side * half, 0.04, -depth), p(side * half, 0.04, depth * 0.8)],
        {
          color: clothPaint,
          thickness: 0.035 * s,
          bone: stage,
          rows: 2,
          cols: 4,
        },
      );
      rod(p(side * half, 0, depth), p(side * half, eave + 0.03, depth), 0.047 * s, C.wood);
      rod(p(side * half, 0, -depth), p(side * half, eave + 0.03, -depth), 0.047 * s, C.wood);
      rod(p(0, peak + 0.02, -depth - 0.17), p(side * (half + 0.18), eave + 0.02, -depth - 0.17), 0.032 * s, C.gold);
      rod(p(0, peak + 0.02, depth + 0.22), p(side * (half + 0.18), eave + 0.02, depth + 0.22), 0.033 * s, C.gold);

      // Tied-back door leaves frame, rather than cover, the opening.
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
        0.044 * s,
        C.gold,
      );
      tassel(p(side * (half - 0.13), 0.74, depth + 0.15), 0.17 * s);

      // Scalloped eave valance, six broad cream/red flags.
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

      // The ropes run out to pegs beside the pavilion, away from its entrance.
      for (const back of [true, false]) {
        const zz = back ? -depth : depth * 0.62;
        const anchor = p(side * (half + 0.79), 0.04, zz + (back ? -0.45 : 0.15));
        rod(p(side * (half + 0.10), eave, zz), anchor, 0.013 * s, "#e9cf97");
        rod(
          [anchor[0], anchor[1] - 0.01, anchor[2]],
          [anchor[0] + side * 0.065 * s, anchor[1] + 0.23 * s, anchor[2]],
          0.035 * s,
          C.wood,
        );
      }
    }

    rod(p(0, 0.05, -depth + 0.07), p(0, peak + 0.24, -depth + 0.07), 0.065 * s, C.wood);
    rod(p(0, peak + 0.02, -depth - 0.25), p(0, peak + 0.02, depth + 0.30), 0.045 * s, C.wood);
    ball(p(0, peak + 0.28, -depth + 0.07), [0.095 * s, 0.13 * s, 0.095 * s], C.gold);
    b.part(new THREE.PlaneGeometry(0.37 * s, 0.45 * s), "#ffffff", {
      at: p(0, peak - 0.32, depth + 0.245),
      dir: [0, 0, 1],
      axis: "z",
      texture: emblemTexture,
      bone: stage,
    });

    // Cushions and a low tea table sit well behind the front edge.
    box(p(0.35, 0.19, -0.42), [0.79 * s, 0.13 * s, 0.53 * s], C.wood);
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        box(p(0.35 + sx * 0.30, 0.10, -0.42 + sz * 0.18), [0.065 * s, 0.16 * s, 0.065 * s], C.wood);
      }
    }
    for (const [x, z, col] of [
      [-0.80, -0.48, C.teal],
      [0.91, -0.91, C.red],
      [-0.94, 0.35, C.gold],
    ] as [number, number, string][]) {
      const cushion = box(p(x, 0.15, z), [0.52 * s, 0.20 * s, 0.43 * s], col);
      b.decal(cushion, emblemTexture, {
        at: p(x, 0.25, z),
        dir: [0, 1, 0],
        up: [0, 0, -1],
        size: [0.18 * s, 0.20 * s],
        bone: stage,
      });
    }
    b.part(new THREE.CylinderGeometry(0.19 * s, 0.19 * s, 0.025 * s, 10), C.gold, {
      at: p(0.35, 0.277, -0.42),
      bone: stage,
    });
    for (const xx of [0.24, 0.45]) {
      b.lathe(
        [[0, 0], [0.045 * s, 0], [0.05 * s, 0.09 * s], [0.039 * s, 0.09 * s], [0.033 * s, 0.02 * s], [0, 0.02 * s]],
        { at: p(xx, 0.29, -0.42), color: C.cream, bone: stage, segments: 7 },
      );
    }

    // Fringe follows the rug's front edge.
    for (let j = 0; j < 10; j++) {
      const xx = -1.42 + j * 0.315;
      rod(p(xx, 0.025, 1.14), p(xx, 0.025, 1.27), 0.013 * s, C.cream);
    }
  }

  tent(1.32, -2.05, 1, false);
  tent(-2.12, -3.40, 0.65, true);

  // Dromedaries: long legs, single exaggerated hump, quiet open mouths.
  function buildCamel(c: ReturnType<typeof camelRig>, accent: string) {
    const { r, scale: s, hips, spine, neck, head, jaw, legs, tail } = c;
    const p = (v: P) => r.p(v);
    const d = (v: P) => r.d(v);

    const body = b.sweep(spine, () => [0.46 * s, 0.43 * s], {
      color: camelPaint,
      shift: [0, -0.05 * s],
      sides: 8,
      smooth: false,
      caps: "round",
    });

    b.loft(
      [
        { at: p([0, 1.69, -0.38]), w: 0.62 * s, h: 0.43 * s },
        { at: p([0, 2.05, -0.20]), w: 0.58 * s, h: 0.55 * s },
        { at: p([0, 2.28, -0.06]), w: 0.24 * s, h: 0.26 * s },
        { at: p([0, 2.26, 0.07]), w: 0.07 * s, h: 0.09 * s },
      ],
      { color: camelPaint, bone: hips, sides: 7, smooth: false, caps: "round" },
    );

    b.sweep(neck, [0.29 * s, 0.22 * s, 0.18 * s, 0.18 * s], {
      color: camelPaint,
      sides: 7,
      smooth: false,
      caps: "round",
    });

    const skull = b.part(new THREE.SphereGeometry(1, 10, 7), camelPaint, {
      at: p([0, 2.55, 1.11]),
      scale: [0.25 * s, 0.24 * s, 0.36 * s],
      quat: r.q(),
      bone: head,
      flat: true,
    });

    b.loft(
      [
        { at: p([0, 2.50, 1.20]), w: 0.39 * s, h: 0.30 * s },
        { at: p([0, 2.46, 1.49]), w: 0.35 * s, h: 0.23 * s },
        { at: p([0, 2.44, 1.62]), w: 0.32 * s, h: 0.21 * s },
      ],
      { color: muzzlePaint, bone: head, sides: 6, smooth: false, caps: "round" },
    );

    b.loft(
      [
        { at: p([0, 2.37, 1.14]), w: 0.31 * s, h: 0.12 * s },
        { at: p([0, 2.31, 1.43]), w: 0.32 * s, h: 0.105 * s },
        { at: p([0, 2.33, 1.61]), w: 0.28 * s, h: 0.095 * s },
      ],
      { color: "#c59a70", bone: jaw, sides: 6, caps: "round" },
    );
    b.part(new THREE.SphereGeometry(1, 6, 4), "#725142", {
      at: p([0, 2.365, 1.47]),
      scale: [0.13 * s, 0.023 * s, 0.14 * s],
      quat: r.q(),
      bone: jaw,
    });

    for (const side of [1, -1]) {
      const eyeAt = p([side * 0.188, 2.60, 1.28]);
      b.decal(skull, eyeTexture, {
        at: eyeAt,
        dir: d([side * 0.62, 0.1, 1]),
        up: d([0, 1, 0]),
        size: [0.19 * s, 0.18 * s],
        mirror: side > 0,
        bone: head,
        segments: 6,
      });
      const ear = b.extrude(
        [[-0.055, 0], [0.08, 0.02], [0.15, 0.22], [0.085, 0.32], [-0.015, 0.24]],
        {
          at: p([side * 0.17, 2.69, 0.99]),
          x: d([side, 0, 0]),
          y: d([side * 0.13, 1, -0.15]),
          thickness: 0.08 * s,
          color: camelPaint,
          bone: head,
        },
      );
      b.decal(ear, svg(
        `<svg viewBox="0 0 60 100"><path d="M18 95 Q4 52 35 9 Q59 42 39 89Z" fill="#a76f58"/><path d="M25 78 Q19 49 35 25" stroke="#e6b185" stroke-width="5" fill="none"/></svg>`,
        { size: 128 },
      ), {
        at: p([side * 0.23, 2.84, 1.02]),
        dir: d([0, 0, 1]),
        size: [0.10 * s, 0.19 * s],
        bone: head,
        segments: 3,
      });

      b.part(new THREE.SphereGeometry(1, 6, 4), "#65483e", {
        at: p([side * 0.105, 2.50, 1.70]),
        scale: [0.043 * s, 0.027 * s, 0.016 * s],
        quat: r.q(),
        bone: head,
      });
      // Brow bumps and cheek tufts emphasize the puppet-like face.
      b.capsule(p([side * 0.18, 2.70, 1.12]), p([side * 0.22, 2.70, 1.30]), 0.041 * s, {
        color: camelPaint,
        bone: head,
        sides: 6,
      });
      b.spike(p([side * 0.21, 2.43, 1.02]), d([side * 0.6, -0.5, -0.3]), 0.18 * s, 0.07 * s, {
        color: camelPaint,
        bone: head,
        sides: 5,
      });
    }

    for (const leg of legs) {
      b.sweep(leg.chain, [0.155 * s, 0.095 * s, 0.066 * s], {
        color: camelPaint,
        sides: 6,
        smooth: false,
        caps: "round",
      });
      const knee = leg.chain.joints[1];
      b.part(new THREE.SphereGeometry(0.112 * s, 6, 4), "#bd895c", {
        at: knee,
        bone: knee,
        flat: true,
      });
      for (const toe of leg.toes) {
        b.sweep(toe, () => [0.088 * s, 0.105 * s], {
          color: "#a87352",
          caps: "round",
          sides: 6,
          smooth: false,
        });
      }
    }

    b.sweep(tail, [0.067 * s, 0.035 * s], {
      color: camelPaint,
      sides: 6,
    });
    b.part(new THREE.SphereGeometry(1, 6, 4), "#77503f", {
      at: tail.at(1),
      scale: [0.095 * s, 0.15 * s, 0.08 * s],
      bone: tail.joints[2],
      flat: true,
    });

    // Embroidered pannier flaps hang on either side, below the visible hump.
    for (const side of [1, -1]) {
      const cloth = b.part(new THREE.BoxGeometry(0.045 * s, 0.66 * s, 0.93 * s), C.navy, {
        at: p([side * 0.468, 1.48, -0.12]),
        quat: r.q(),
        bone: hips,
      });
      b.decal(cloth, saddleTexture, {
        at: p([side * 0.494, 1.48, -0.12]),
        dir: d([side, 0, 0]),
        up: d([0, 1, 0]),
        size: [0.90 * s, 0.64 * s],
        bone: hips,
        segments: 3,
      });
      for (let j = 0; j < 5; j++) {
        tassel(p([side * 0.49, 1.13, -0.48 + j * 0.18]), 0.12 * s, hips, j % 2 ? accent : C.gold);
      }
      b.part(new THREE.BoxGeometry(0.11 * s, 0.14 * s, 0.64 * s), C.wood, {
        at: p([side * 0.27, 1.99, -0.16]),
        quat: r.q(),
        bone: hips,
      });
    }

    // Surface-seated girth and collar follow the underlying volumes.
    const girth = b.surface(body).loop(p([0, 1.44, 0.20]), {
      dir: d([0, 0, 1]),
      lift: 0.016 * s,
    });
    b.sweep(girth, 0.045 * s, { color: accent, bone: spine.joints[1], sides: 6 });
    const collar = b.surface(neck).loop(p([0, 1.83, 0.77]), {
      dir: d([0, 1, 0]),
      lift: 0.018 * s,
    });
    b.sweep(collar, 0.031 * s, { color: accent, sides: 6 });
    tassel(p([0, 1.78, 1.02]), 0.20 * s, neck.joints[1]);

    const halterPath = polyline([
      p([-0.18, 2.47, 1.56]),
      p([-0.19, 2.40, 1.62]),
      p([0, 2.39, 1.72]),
      p([0.19, 2.40, 1.62]),
      p([0.18, 2.47, 1.56]),
      p([0, 2.57, 1.59]),
    ], { closed: true });
    b.sweep(halterPath, 0.022 * s, { color: accent, bone: head, sides: 5 });
    for (const side of [1, -1]) {
      b.sweep(
        [
          p([side * 0.19, 2.43, 1.59]),
          p([side * 0.25, 2.47, 1.08]),
          p([side * 0.17, 2.68, 0.91]),
        ],
        0.019 * s,
        { color: accent, bone: head, sides: 5 },
      );
      ball(p([side * 0.196, 2.44, 1.59]), [0.035 * s, 0.035 * s, 0.035 * s], C.gold, head);
    }
    // Small paired saddle bundles behind the hump.
    b.part(new THREE.BoxGeometry(0.54 * s, 0.22 * s, 0.29 * s), C.teal, {
      at: p([0, 1.97, -0.58]),
      quat: r.q(),
      bone: hips,
    });
    b.sweep([p([-0.28, 1.98, -0.58]), p([0, 2.10, -0.58]), p([0.28, 1.98, -0.58])], 0.017 * s, {
      color: C.gold,
      bone: hips,
      sides: 5,
    });
  }

  buildCamel(camelA, C.teal);
  buildCamel(camelB, C.red);

  // Caravan provisions: turned jars, a woven basket and a glowing lantern.
  function jar(x: number, z: number, scale: number, color: string) {
    const y = 0.35;
    b.lathe(
      [
        [0, 0], [0.19, 0], [0.29, 0.15], [0.31, 0.35],
        [0.24, 0.52], [0.13, 0.61], [0.14, 0.67],
        [0.10, 0.67], [0.09, 0.59], [0.17, 0.45], [0, 0.43],
      ].map(([r, h]) => [r * scale, h * scale]),
      { at: [x, y, z], color, bone: stage, segments: 9 },
    );
    b.part(new THREE.CylinderGeometry(0.31 * scale, 0.29 * scale, 0.18 * scale, 9, 1, true), "#ffffff", {
      at: [x, y + 0.31 * scale, z],
      texture: potteryTexture,
      bone: stage,
    });
    b.part(new THREE.CylinderGeometry(0.103 * scale, 0.103 * scale, 0.015 * scale, 9), "#473938", {
      at: [x, y + 0.615 * scale, z],
      bone: stage,
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
      at: [-0.69, 0.40 + j * 0.092, -0.50],
      dir: [0, 1, 0],
      axis: "z",
      bone: stage,
    });
  }
  for (let j = 0; j < 6; j++) {
    ball(
      [-0.69 + (random() - 0.5) * 0.33, 0.73 + random() * 0.065, -0.5 + (random() - 0.5) * 0.30],
      [0.066, 0.078, 0.06],
      j % 2 ? "#985333" : "#c47a3e",
    );
  }

  const lanternX = 3.10;
  const lanternZ = -0.22;
  box([lanternX, 0.415, lanternZ], [0.29, 0.10, 0.29], C.navy);
  glow(box([lanternX, 0.63, lanternZ], [0.20, 0.35, 0.20], "#ffc36c"), 1.2);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      rod(
        [lanternX + sx * 0.115, 0.44, lanternZ + sz * 0.115],
        [lanternX + sx * 0.115, 0.83, lanternZ + sz * 0.115],
        0.019,
        C.navy,
      );
    }
  }
  b.part(new THREE.ConeGeometry(0.22, 0.17, 4), C.navy, {
    at: [lanternX, 0.885, lanternZ],
    rotation: [0, 45, 0],
    bone: stage,
  });
  b.part(new THREE.TorusGeometry(0.09, 0.015, 5, 10), C.gold, {
    at: [lanternX, 1.0, lanternZ],
    bone: stage,
  });

  // Three discreet trails of prints lead toward the cool water.
  for (let j = 0; j < 8; j++) {
    const t = j / 7;
    const x = 0.62 - t * 0.91;
    const z = 3.45 - t * 1.22;
    for (const side of [-1, 1]) {
      ball([x + side * 0.047, 0.342, z + (j % 2 ? 0.04 : -0.04)], [0.032, 0.008, 0.072], "#c79c68");
    }
  }

  // A few large, wind-drawn dune lines on the uncluttered foreground.
  for (const row of [
    [[-4.9, 0.349, 3.75], [-4.2, 0.349, 4.02], [-3.1, 0.349, 4.14]],
    [[-4.7, 0.349, 4.13], [-4.0, 0.349, 4.38], [-2.9, 0.349, 4.47]],
    [[0.0, 0.349, 4.92], [0.9, 0.349, 5.04], [1.7, 0.349, 4.93]],
  ]) {
    b.sweep(catmull(row), 0.014, { color: "#d7aa73", bone: stage, sides: 5 });
  }

  // Museum-like title plate on the front cutaway edge.
  const plaque = box([0, 0.175, 6.01], [1.72, 0.43, 0.09], C.navy);
  b.part(new THREE.PlaneGeometry(1.68, 0.40), "#ffffff", {
    at: [0, 0.175, 6.061],
    texture: plaqueTexture,
    dir: [0, 0, 1],
    axis: "z",
    bone: stage,
  });
  for (const side of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.026, 6, 4), C.gold, {
      at: [side * 0.78, 0.18, 6.068],
      bone: stage,
    });
  }

  // Keep the plate above the floor without moving the setting's contact surface.
  // Its lower edge is at -0.04 m, within the permitted shallow floor inset.
  plaque.mesh.name = "MirageTitlePlate";
  return b.root;
}
```