```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  grain,
  mix,
  noise,
  paint,
  polyline,
  rng,
  svg,
} from "agentic-3js-builder";
import type { Joint, Paint } from "agentic-3js-builder";

export const meta = {
  name: "The Sun King's Ransom",
  description:
    "A stylized fantasy treasure hoard: an open, heavily gilded blue chest, spilled sun-minted coins, cut gemstones, a ruby crown, and two ceremonial goblets.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "The Sun King's Ransom",
    paintSize: 2048,
  });
  const random = rng(73149);

  const C = {
    ink: "#101e2c",
    blue: "#153950",
    blueLight: "#246477",
    blueDark: "#102635",
    gold: "#db9b32",
    goldLight: "#ffe4a0",
    goldDark: "#825021",
    goldShadow: "#58321c",
    cream: "#fff2bd",
    emerald: "#13bd91",
    ruby: "#d92d63",
    sapphire: "#429cf3",
    purple: "#a35ee4",
  };

  const GOLD = paint((p, n) => {
    const variation = noise(p, 0.12, 17);
    const lit = Math.max(0, n.y * 0.65 + n.z * 0.35 + n.x * 0.23);
    const base = mix("#ac6624", "#f4c15b", 0.35 + variation * 0.35);
    return mix(base, "#fff1b7", Math.pow(lit, 3) * 0.69);
  });
  const OLD_GOLD = paint((p, n) =>
    mix(
      "#684025",
      "#bc8430",
      0.3 + Math.max(0, n.y) * 0.33 + noise(p, 0.09, 18) * 0.25,
    ),
  );
  const WOOD = grain("#102d3e", "#205268", {
    size: 0.028,
    axis: "x",
    seed: 9,
  });
  const INNER_WOOD = grain("#152d35", "#31505a", {
    size: 0.025,
    axis: "x",
    seed: 12,
  });

  function jewelPaint(dark: string, middle: string, light: string): Paint {
    return paint((_p, n) => {
      const lightness = n.x * 0.3 + n.y * 0.72 + n.z * 0.51;
      if (lightness > 0.71) return light;
      if (lightness > 0.2) return middle;
      if (lightness > -0.33) return mix(dark, middle, 0.46);
      return dark;
    });
  }
  const EMERALD = jewelPaint("#044d52", "#13bb95", "#a0ffe0");
  const RUBY = jewelPaint("#5f163b", "#df3165", "#ffb3b5");
  const SAPPHIRE = jewelPaint("#123568", "#3a9df1", "#b8f5ff");
  const AMETHYST = jewelPaint("#372755", "#a469df", "#e8c9ff");
  const JEWELS = [EMERALD, RUBY, SAPPHIRE, AMETHYST];

  // Drawings are shared across all the corresponding small assemblies.
  const COIN = svg(
    `<svg viewBox="0 0 128 128">
      <rect width="128" height="128" fill="#b47a29"/>
      <circle cx="64" cy="64" r="61" fill="#e7ad43" stroke="#74451e" stroke-width="3"/>
      <circle cx="64" cy="64" r="55" fill="#f7ca67" stroke="#fff0a8" stroke-width="3"/>
      <circle cx="64" cy="64" r="47" fill="#e2a13b" stroke="#9d6021" stroke-width="2"/>
      <g fill="#fff0a0" stroke="#aa6c25" stroke-width="2">
        <path d="M64 21 L72 45 L91 37 L83 56 L107 64 L83 72 L91 91 L72 83 L64 107 L56 83 L37 91 L45 72 L21 64 L45 56 L37 37 L56 45 Z"/>
        <path d="M64 41 L79 64 L64 87 L49 64 Z" fill="#ffdf80"/>
      </g>
      <path d="M64 48 L73 64 L64 78 L56 64Z" fill="#b87527"/>
      <path d="M36 21 Q64 8 91 22" fill="none" stroke="#fff4bb" stroke-width="4"/>
      <g fill="#885020">
        <circle cx="64" cy="12" r="2"/><circle cx="116" cy="64" r="2"/>
        <circle cx="64" cy="116" r="2"/><circle cx="12" cy="64" r="2"/>
      </g>
    </svg>`,
    { size: 192 },
  );

  const PANEL = svg(
    `<svg viewBox="0 0 300 180">
      <rect width="300" height="180" fill="#153b50"/>
      <path d="M12 25 L25 12 H275 L288 25 V155 L275 168 H25 L12 155Z"
        fill="#18485d" stroke="#d4a04b" stroke-width="5"/>
      <path d="M23 34 L34 23 H266 L277 34 V146 L266 157 H34 L23 146Z"
        fill="none" stroke="#427182" stroke-width="3"/>
      <g fill="none" stroke="#d7a34b" stroke-width="5" stroke-linejoin="round">
        <path d="M45 128 Q52 75 116 88 Q92 45 53 59 Q62 32 91 44 Q126 58 150 97"/>
        <path d="M255 128 Q248 75 184 88 Q208 45 247 59 Q238 32 209 44 Q174 58 150 97"/>
        <path d="M48 127 Q99 145 133 116 M252 127 Q201 145 167 116"/>
      </g>
      <path d="M150 43 L170 91 L150 139 L130 91Z" fill="#f4cf78" stroke="#795026" stroke-width="4"/>
      <path d="M150 63 L158 91 L150 119 L142 91Z" fill="#3999a1"/>
      <g fill="#f5d47e">
        <path d="M45 99 l8 10 -8 10 -8 -10Z"/>
        <path d="M255 99 l8 10 -8 10 -8 -10Z"/>
      </g>
      <path d="M28 31 H87 M213 31 H272" stroke="#ffe5a0" stroke-width="3"/>
    </svg>`,
    { size: 512 },
  );

  const COMPASS = svg(
    `<svg viewBox="0 0 480 280">
      <g fill="none" stroke="#c18b39" stroke-width="5">
        <path d="M22 62 L62 22 H418 L458 62 V218 L418 258 H62 L22 218Z"/>
        <path d="M36 69 L69 36 H411 L444 69 V211 L411 244 H69 L36 211Z"/>
        <path d="M62 70 Q104 34 146 79 Q112 78 105 105 Q136 103 157 125"/>
        <path d="M418 70 Q376 34 334 79 Q368 78 375 105 Q344 103 323 125"/>
        <path d="M62 210 Q104 246 146 201 Q112 202 105 175 Q136 177 157 155"/>
        <path d="M418 210 Q376 246 334 201 Q368 202 375 175 Q344 177 323 155"/>
        <circle cx="240" cy="140" r="85"/>
        <circle cx="240" cy="140" r="72" stroke-dasharray="7 7"/>
      </g>
      <path d="M240 34 L259 112 L318 62 L268 121 L374 140 L268 159 L318 218 L259 168 L240 246 L221 168 L162 218 L212 159 L106 140 L212 121 L162 62 L221 112Z"
        fill="#c18c3a" stroke="#704c29" stroke-width="3"/>
      <path d="M240 34 L240 140 L259 112Z M374 140 L240 140 L268 159Z M240 246 L240 140 L221 168Z M106 140 L240 140 L212 121Z"
        fill="#ffe4a0"/>
      <path d="M240 103 L264 140 L240 177 L216 140Z" fill="#1e6477" stroke="#ffe3a0" stroke-width="5"/>
      <path d="M240 115 L251 140 L240 165 L229 140Z" fill="#51b6bb"/>
      <g fill="#ffe6a0">
        <circle cx="62" cy="140" r="5"/><circle cx="418" cy="140" r="5"/>
        <circle cx="240" cy="20" r="4"/><circle cx="240" cy="260" r="4"/>
      </g>
    </svg>`,
    { size: 768 },
  );

  const KEYHOLE = svg(
    `<svg viewBox="0 0 100 120">
      <path d="M50 5 L90 25 V76 L50 114 L10 76 V25Z"
        fill="#e9b64e" stroke="#fff0ac" stroke-width="5"/>
      <path d="M50 15 L80 30 V72 L50 101 L20 72 V30Z"
        fill="none" stroke="#9a6227" stroke-width="4"/>
      <circle cx="50" cy="45" r="15" fill="#142b36"/>
      <path d="M44 53 L37 82 H63 L56 53Z" fill="#142b36"/>
      <path d="M39 36 Q49 27 59 36" fill="none" stroke="#6b4527" stroke-width="3"/>
      <circle cx="29" cy="33" r="3" fill="#fff1b2"/>
      <circle cx="71" cy="33" r="3" fill="#fff1b2"/>
    </svg>`,
    { size: 192 },
  );

  const CROWN_BAND = svg(
    `<svg viewBox="0 0 512 96">
      <rect width="512" height="96" fill="#c88d32"/>
      <path d="M0 6 H512 M0 90 H512" stroke="#fff0ad" stroke-width="6"/>
      <path d="M0 17 H512 M0 79 H512" stroke="#835126" stroke-width="3"/>
      ${Array.from({ length: 8 }, (_, i) => {
        const x = i * 64 + 32;
        return `
          <path d="M${x} 24 L${x + 13} 48 L${x} 72 L${x - 13} 48Z"
            fill="#eec66b" stroke="#875126" stroke-width="3"/>
          <path d="M${x - 16} 48 Q${x - 32} 23 ${x - 30} 48 Q${x - 32} 73 ${x - 16} 48
                   M${x + 16} 48 Q${x + 32} 23 ${x + 30} 48 Q${x + 32} 73 ${x + 16} 48"
            fill="none" stroke="#ffe69a" stroke-width="3"/>`;
      }).join("")}
    </svg>`,
    { size: 512 },
  );

  const CUP_ETCH = svg(
    `<svg viewBox="0 0 100 130">
      <path d="M50 12 L60 40 L84 31 L68 53 L91 65 L67 77 L79 100 L59 90 L50 118 L41 90 L21 100 L33 77 L9 65 L32 53 L16 31 L40 40Z"
        fill="none" stroke="#875026" stroke-width="5"/>
      <path d="M50 24 L50 106 M20 65 H80" stroke="#ffe9a2" stroke-width="4"/>
      <path d="M50 43 L64 65 L50 87 L36 65Z" fill="#ffdf86" stroke="#a46927" stroke-width="3"/>
    </svg>`,
    { size: 192 },
  );

  const root = b.joint("hoard", { at: [0, 0, 0] });
  const hingeAt = [0, 0.65, -0.51];
  const OPEN = (105 * Math.PI) / 180;
  const cs = Math.cos(OPEN);
  const sn = Math.sin(OPEN);
  const lid = b.joint("lid", {
    parent: root,
    at: hingeAt,
    dir: [0, sn, cs],
    role: "hinge",
  });

  type Fill = string | Paint;

  function box(
    at: number[],
    size: number[],
    color: Fill,
    name: string,
    bone: Joint = root,
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      name,
    });
  }

  function bevelBox(
    at: number[],
    size: number[],
    color: Fill,
    name: string,
    bone: Joint = root,
  ) {
    const [w, h, d] = size;
    return b.extrude(
      [
        [-w / 2, -h / 2],
        [w / 2, -h / 2],
        [w / 2, h / 2],
        [-w / 2, h / 2],
      ],
      {
        at,
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: d,
        bevel: Math.min(0.014, d * 0.22),
        detail: 0.5,
        color,
        bone,
        name,
      },
    );
  }

  function sphere(
    at: number[],
    radius: number,
    color: Fill,
    name: string,
    bone: Joint = root,
  ) {
    return b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      bone,
      name,
      flat: true,
    });
  }

  function torus(
    at: number[],
    radius: number,
    tube: number,
    color: Fill,
    normal: number[] = [0, 1, 0],
    bone: Joint = root,
    name = "rolled gold rim",
  ) {
    return b.part(new THREE.TorusGeometry(radius, tube, 4, 16), color, {
      at,
      dir: normal,
      axis: "z",
      bone,
      name,
    });
  }

  function drawing(
    texture: THREE.Texture,
    at: number[],
    width: number,
    height: number,
    normal: number[] = [0, 0, 1],
    bone: Joint = root,
    name = "engraving",
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at,
      dir: normal,
      axis: "z",
      texture,
      bone,
      name,
    });
  }

  function rivet(
    at: number[],
    normal: number[],
    radius = 0.013,
    bone: Joint = root,
  ) {
    return b.part(
      new THREE.CylinderGeometry(radius, radius * 1.1, radius * 0.56, 6),
      GOLD,
      { at, dir: normal, bone, name: "hexagonal gilded rivet" },
    );
  }

  // A gemstone is a table, bevel, girdle, and pavilion, not a smooth sphere.
  function cutGemGeometry(radius: number, height: number, sides = 6) {
    const vertices: number[] = [];
    const indices: number[] = [];
    const levels = [
      [0.05, 0],
      [1, 0.39],
      [1, 0.48],
      [0.57, 1],
    ];
    for (const [r, y] of levels) {
      for (let i = 0; i < sides; i++) {
        const a = ((i + 0.5) * Math.PI * 2) / sides;
        vertices.push(Math.cos(a) * radius * r, y * height, Math.sin(a) * radius * r);
      }
    }
    for (let row = 0; row < levels.length - 1; row++) {
      for (let i = 0; i < sides; i++) {
        const j = (i + 1) % sides;
        const a = row * sides + i;
        const d = row * sides + j;
        const c = (row + 1) * sides + j;
        const e = (row + 1) * sides + i;
        indices.push(a, e, d, d, e, c);
      }
    }
    for (let i = 1; i < sides - 1; i++) {
      indices.push(3 * sides, 3 * sides + i + 1, 3 * sides + i);
      indices.push(0, i, i + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    g.setIndex(indices);
    const out = g.toNonIndexed();
    out.computeVertexNormals();
    return out;
  }

  function gem(
    at: number[],
    radius: number,
    height: number,
    color: Fill,
    normal: number[] = [0, 1, 0],
    sides = 6,
    bone: Joint = root,
    name = "cut gemstone",
  ) {
    return b.part(cutGemGeometry(radius, height, sides), color, {
      at,
      dir: normal,
      bone,
      name,
      flat: true,
    });
  }

  // The timber carcass remains genuinely hollow above the treasure filling.
  bevelBox([0, 0.115, -0.18], [1.1, 0.12, 0.7], OLD_GOLD, "heavy bottom moulding");
  box([0, 0.18, -0.18], [1.0, 0.09, 0.61], INNER_WOOD, "interior floor");
  box([0, 0.4, 0.135], [1.04, 0.46, 0.075], WOOD, "front timber wall");
  box([0, 0.4, -0.495], [1.04, 0.46, 0.075], WOOD, "back timber wall");
  for (const s of [-1, 1]) {
    box([s * 0.515, 0.4, -0.18], [0.075, 0.46, 0.63], WOOD, "side timber wall");
    box([s * 0.473, 0.4, -0.18], [0.012, 0.4, 0.54], INNER_WOOD, "inner lining");
  }

  // Corner feet and armor give the chest a characteristic oversized silhouette.
  for (const x of [-0.485, 0.485]) {
    for (const z of [-0.45, 0.09]) {
      bevelBox([x, 0.052, z], [0.15, 0.104, 0.16], OLD_GOLD, "cast claw foot");
      bevelBox([x, 0.094, z], [0.14, 0.05, 0.15], GOLD, "foot collar");
    }
  }
  for (const s of [-1, 1]) {
    bevelBox([s * 0.52, 0.39, 0.176], [0.102, 0.48, 0.105], GOLD, "front corner armor");
    bevelBox([s * 0.52, 0.39, -0.505], [0.102, 0.48, 0.105], GOLD, "back corner armor");
    for (const y of [0.21, 0.39, 0.565]) {
      rivet([s * 0.52, y, 0.233], [0, 0, 1]);
      rivet([s * 0.576, y, -0.465], [s, 0, 0]);
    }
    bevelBox([s * 0.284, 0.393, 0.18], [0.416, 0.31, 0.022], C.blueDark, "recessed front panel");
    drawing(PANEL, [s * 0.284, 0.393, 0.193], 0.398, 0.273, [0, 0, 1], root, "gilded front scrollwork");
    drawing(PANEL, [s * 0.556, 0.393, -0.18], 0.46, 0.28, [s, 0, 0], root, "gilded side scrollwork");
  }
  bevelBox([0, 0.193, 0.179], [1.12, 0.075, 0.105], GOLD, "lower front rail");
  bevelBox([0, 0.624, 0.155], [1.14, 0.075, 0.12], GOLD, "front rolled rim");
  bevelBox([0, 0.624, -0.51], [1.14, 0.075, 0.10], GOLD, "back rolled rim");
  for (const s of [-1, 1]) {
    bevelBox([s * 0.534, 0.624, -0.18], [0.1, 0.075, 0.66], GOLD, "side rolled rim");
    bevelBox([s * 0.536, 0.193, -0.18], [0.09, 0.075, 0.66], GOLD, "side lower rail");
    box([s * 0.478, 0.627, -0.18], [0.015, 0.045, 0.56], C.goldShadow, "inner rim shadow");
  }
  box([0, 0.651, 0.099], [0.94, 0.018, 0.018], C.goldLight, "inner front rim glint");

  // A broad lock shield, kept clear of the lid decoration.
  b.extrude(
    [
      [-0.095, 0.105],
      [0.095, 0.105],
      [0.095, -0.045],
      [0, -0.135],
      [-0.095, -0.045],
    ],
    {
      at: [0, 0.425, 0.235],
      x: [1, 0, 0],
      thickness: 0.055,
      bevel: 0.009,
      color: OLD_GOLD,
      bone: root,
      name: "massive shield lock",
    },
  );
  drawing(KEYHOLE, [0, 0.423, 0.265], 0.158, 0.207, [0, 0, 1], root, "sun king keyhole");
  bevelBox([0, 0.585, 0.23], [0.11, 0.115, 0.055], GOLD, "lock hasp");
  rivet([0, 0.6, 0.263], [0, 0, 1], 0.018);

  // Side carrying rings on escutcheons.
  for (const s of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.065, 0.073, 0.025, 8), OLD_GOLD, {
      at: [s * 0.57, 0.43, -0.18],
      dir: [s, 0, 0],
      bone: root,
      name: "handle escutcheon",
    });
    torus([s * 0.609, 0.36, -0.18], 0.078, 0.014, GOLD, [s, 0, 0], root, "chest carrying ring");
    sphere([s * 0.615, 0.435, -0.18], 0.026, GOLD, "handle pivot");
  }

  // Lid coordinates: x is chest width, y is the closed vault height, z runs
  // forward from the hinge. The entire assembly opens as one rigid hinge.
  function lp(x: number, y: number, z: number): number[] {
    return [x, hingeAt[1] + y * cs + z * sn, hingeAt[2] - y * sn + z * cs];
  }
  const lidDepth = 0.68;
  function vault(t: number) {
    return Math.sin(t * Math.PI) * 0.155;
  }
  const lidPlanks = [];
  for (let i = 0; i < 8; i++) {
    const t0 = i / 8;
    const t1 = (i + 1) / 8;
    lidPlanks.push(
      b.slab(
        [
          lp(-0.545, vault(t0), lidDepth * t0),
          lp(0.545, vault(t0), lidDepth * t0),
          lp(0.545, vault(t1), lidDepth * t1),
          lp(-0.545, vault(t1), lidDepth * t1),
        ],
        {
          thickness: 0.044,
          color: i % 2 === 0 ? INNER_WOOD : WOOD,
          bone: lid,
          name: `vault plank ${i + 1}`,
        },
      ),
    );
  }

  const endOutline: number[][] = [
    [0, -0.035],
    [lidDepth, -0.035],
    [lidDepth, 0],
  ];
  for (let i = 7; i >= 0; i--) {
    endOutline.push([(i / 8) * lidDepth, vault(i / 8)]);
  }
  for (const s of [-1, 1]) {
    b.extrude(endOutline, {
      at: lp(s * 0.547, 0, 0),
      x: [0, sn, cs],
      y: [0, cs, -sn],
      thickness: 0.046,
      color: WOOD,
      bone: lid,
      name: "arched lid end cap",
    });
    const arcPoints = [];
    for (let i = 0; i <= 8; i++) {
      arcPoints.push(lp(s * 0.566, vault(i / 8) + 0.007, (i / 8) * lidDepth));
    }
    b.sweep(polyline(arcPoints), 0.026, {
      color: GOLD,
      bone: lid,
      sides: 6,
      caps: "flat",
      name: "gilded vault end rib",
    });
    b.rod(lp(s * 0.566, -0.025, 0), lp(s * 0.566, -0.025, lidDepth), 0.023, {
      color: GOLD,
      bone: lid,
      sides: 6,
      name: "lid end chord",
    });
  }

  for (const x of [-0.48, 0.48]) {
    const band = [];
    for (let i = 0; i <= 8; i++) {
      band.push(lp(x, vault(i / 8) + 0.029, (i / 8) * lidDepth));
    }
    b.sweep(polyline(band), () => [0.038, 0.016], {
      color: GOLD,
      bone: lid,
      section: "box",
      up: [1, 0, 0],
      caps: "flat",
      name: "broad vault strap",
    });
    for (const t of [0.12, 0.36, 0.64, 0.88]) {
      sphere(lp(x, vault(t) - 0.034, t * lidDepth), 0.014, GOLD, "lid strap rivet", lid);
    }
  }
  for (const z of [0, lidDepth]) {
    b.rod(lp(-0.57, -0.012, z), lp(0.57, -0.012, z), 0.035, {
      color: GOLD,
      bone: lid,
      sides: 8,
      name: "heavy lid edge",
    });
    b.rod(lp(-0.53, -0.043, z), lp(0.53, -0.043, z), 0.009, {
      color: C.goldLight,
      bone: lid,
      sides: 6,
      name: "lid edge highlight",
    });
  }

  b.decal(lidPlanks, COMPASS, {
    at: lp(0, vault(0.5) - 0.028, lidDepth * 0.5),
    dir: [0, -cs, sn],
    up: [0, sn, cs],
    size: [0.85, 0.49],
    segments: 12,
    lift: 0.002,
    bone: lid,
    name: "inlaid celestial compass",
  });
  for (const x of [-0.39, 0.39]) {
    b.part(new THREE.CylinderGeometry(0.043, 0.043, 0.15, 10), OLD_GOLD, {
      at: [x, 0.651, -0.513],
      dir: [1, 0, 0],
      bone: root,
      name: "barrel hinge",
    });
    for (const dx of [-0.052, 0.052]) {
      torus([x + dx, 0.651, -0.513], 0.043, 0.006, GOLD, [1, 0, 0]);
    }
  }
  b.part(new THREE.BoxGeometry(0.115, 0.025, 0.12), GOLD, {
    at: lp(0, -0.026, lidDepth - 0.025),
    rotation: [-105, 0, 0],
    bone: lid,
    name: "upper latch plate",
  });

  // Coin cylinders use one engraved face texture. Side UVs sample a plain
  // bronze corner of that texture, rather than stretching the face drawing.
  const coinGeo = new THREE.CylinderGeometry(1, 1, 1, 12, 1);
  const coinUV = coinGeo.getAttribute("uv");
  for (let i = 0; i < 26; i++) coinUV.setXY(i, 0.015, 0.015);

  function coin(
    at: number[],
    radius: number,
    thickness: number,
    tiltX = 0,
    tiltZ = 0,
    name = "sun-minted gold coin",
  ) {
    return b.part(coinGeo, "#ffffff", {
      at,
      scale: [radius, thickness, radius],
      rotation: [tiltX, random() * 360, tiltZ],
      texture: COIN,
      bone: root,
      name,
    });
  }

  // Dark, packed gold under the visible loose contents avoids a hollow chest.
  bevelBox([0, 0.365, -0.18], [0.94, 0.34, 0.54], OLD_GOLD, "packed treasure below the surface");
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 8; col++) {
      const x = -0.416 + col * 0.116 + (row % 2) * 0.013;
      const z = -0.406 + row * 0.108;
      const y = 0.544 + random() * 0.018;
      coin([x, y, z], 0.052 + random() * 0.01, 0.022, random() * 12 - 6, random() * 10 - 5);
      if ((col + row * 2) % 5 === 0) {
        coin([x + 0.007, y + 0.022, z - 0.004], 0.051, 0.021, 3, -3);
      }
    }
  }
  for (const s of [-1, 1]) {
    for (let k = 0; k < 5; k++) {
      coin([s * 0.355, 0.556 + k * 0.023, -0.315], 0.057, 0.022, 0, 0, "stack inside chest");
    }
  }

  // The spill is built in overlapping terraces of actual coins.
  const pile = [
    { rx: 0.72, rz: 0.38, y: 0.014 },
    { rx: 0.51, rz: 0.295, y: 0.037 },
    { rx: 0.34, rz: 0.22, y: 0.060 },
    { rx: 0.18, rz: 0.12, y: 0.083 },
  ];
  pile.forEach((layer, tier) => {
    const stepX = 0.101;
    const stepZ = 0.087;
    for (let row = -5; row <= 5; row++) {
      for (let col = -8; col <= 8; col++) {
        const x = col * stepX + (Math.abs(row) % 2) * stepX * 0.5;
        const dz = row * stepZ;
        if ((x / layer.rx) ** 2 + (dz / layer.rz) ** 2 > 1) continue;
        const z = 0.5 + dz;
        if (z < 0.2 && Math.abs(x) < 0.58) continue;
        coin(
          [
            x + (random() - 0.5) * 0.021,
            layer.y + (random() - 0.5) * 0.004,
            z + (random() - 0.5) * 0.018,
          ],
          0.051 + random() * 0.009,
          0.023,
          (random() - 0.5) * 10,
          (random() - 0.5) * 10,
          `spilled coin terrace ${tier + 1}`,
        );
      }
    }
  });

  const looseCoins = [
    [-0.84, 0.28], [-0.77, 0.51], [-0.78, 0.73], [-0.64, 0.91],
    [-0.36, 0.96], [-0.13, 1.02], [0.11, 0.97], [0.35, 0.93],
    [0.62, 0.83], [0.78, 0.69], [0.88, 0.39], [0.79, 0.17],
    [-0.68, -0.02], [0.68, -0.1], [-0.8, 0.12], [0.49, 1.02],
  ];
  for (const [x, z] of looseCoins) {
    coin([x, 0.012, z], 0.044 + random() * 0.011, 0.02, 0, 0, "loose floor coin");
  }
  for (let i = 0; i < 6; i++) {
    coin([0.54, 0.013 + i * 0.021, 0.59], 0.057, 0.02, 0, 0, "neat six coin stack");
  }

  // Richly set crown, its open center and separate points clearly readable.
  const crown = { x: -0.48, y: 0.032, z: 0.67 };
  const cp = (x: number, y: number, z: number) =>
    [crown.x + x, crown.y + y, crown.z + z];

  b.lathe(
    [
      [0.145, 0],
      [0.181, 0],
      [0.187, 0.019],
      [0.177, 0.035],
      [0.177, 0.092],
      [0.154, 0.092],
      [0.154, 0.026],
      [0.145, 0.018],
    ],
    {
      at: cp(0, 0, 0),
      color: GOLD,
      segments: 16,
      bone: root,
      name: "open royal circlet",
    },
  );
  b.part(new THREE.CylinderGeometry(0.178, 0.178, 0.059, 16, 1, true), "#ffffff", {
    at: cp(0, 0.059, 0),
    texture: CROWN_BAND,
    bone: root,
    name: "engraved crown band",
  });
  torus(cp(0, 0.02, 0), 0.18, 0.009, GOLD);
  torus(cp(0, 0.092, 0), 0.167, 0.01, GOLD);

  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8;
    const normal = [Math.sin(a), 0, Math.cos(a)];
    const tangent = [Math.cos(a), 0, -Math.sin(a)];
    const tall = i % 2 === 0;
    const h = tall ? 0.215 : 0.155;
    const r = 0.165;
    const origin = cp(normal[0] * r, 0.074, normal[2] * r);

    const point = b.extrude(
      [
        [-0.065, 0],
        [0.065, 0],
        [0.048, 0.055],
        [0.027, 0.071],
        [0, h],
        [-0.027, 0.071],
        [-0.048, 0.055],
      ],
      {
        at: origin,
        x: tangent,
        y: [0, 1, 0],
        thickness: 0.024,
        bevel: 0.005,
        detail: 0.5,
        color: GOLD,
        bone: root,
        name: tall ? "tall crown fleur" : "short crown fleur",
      },
    );
    const normalVec = new THREE.Vector3(...normal);
    const faceSign = point.axis.dot(normalVec) >= 0 ? 1 : -1;
    b.rod(
      point.local([0, 0.075, faceSign * 0.015]),
      point.local([0, h - 0.017, faceSign * 0.015]),
      0.004,
      { color: C.goldLight, bone: root, sides: 5, name: "raised crown spine" },
    );
    sphere(cp(normal[0] * r, 0.074 + h, normal[2] * r), 0.015, C.goldLight, "crown pearl finial");

    const jewelAt = cp(normal[0] * 0.183, 0.129, normal[2] * 0.183);
    b.part(new THREE.CylinderGeometry(0.035, 0.039, 0.016, 6), OLD_GOLD, {
      at: jewelAt,
      dir: normal,
      bone: root,
      name: "crown jewel bezel",
    });
    gem(
      cp(normal[0] * 0.183, 0.129, normal[2] * 0.183),
      tall ? 0.029 : 0.023,
      0.027,
      i % 2 === 0 ? RUBY : SAPPHIRE,
      normal,
      6,
      root,
      "crown inset jewel",
    );
  }

  // Ceremonial goblets: broad weighted feet, narrow stems, and open bowls.
  function goblet(cx: number, baseY: number, cz: number, scale: number, index: number) {
    const p = (x: number, y: number, z: number) =>
      [cx + x * scale, baseY + y * scale, cz + z * scale];
    const profile = [
      [0, 0],
      [0.105, 0],
      [0.126, 0.016],
      [0.115, 0.033],
      [0.065, 0.048],
      [0.031, 0.065],
      [0.025, 0.16],
      [0.046, 0.187],
      [0.078, 0.218],
      [0.123, 0.286],
      [0.147, 0.37],
      [0.147, 0.421],
      [0.128, 0.421],
      [0.127, 0.365],
      [0.104, 0.29],
      [0.071, 0.245],
      [0.032, 0.229],
      [0, 0.229],
    ].map(([r, y]) => [r * scale, y * scale]);

    const cup = b.lathe(profile, {
      at: p(0, 0, 0),
      segments: 12,
      color: GOLD,
      bone: root,
      name: `ceremonial goblet ${index}`,
    });
    torus(p(0, 0.02, 0), 0.117 * scale, 0.009 * scale, C.goldLight);
    torus(p(0, 0.418, 0), 0.139 * scale, 0.012 * scale, GOLD);
    torus(p(0, 0.36, 0), 0.142 * scale, 0.005 * scale, OLD_GOLD);
    sphere(p(0, 0.131, 0), 0.039 * scale, GOLD, "goblet stem knop");
    torus(p(0, 0.132, 0), 0.035 * scale, 0.006 * scale, C.goldLight);

    const surface = b.surface(cup);
    for (let k = 0; k < 4; k++) {
      const angle = k * 90 + 45;
      const a = (angle * Math.PI) / 180;
      const hit = surface.nearest(p(Math.sin(a) * 0.135, 0.327, Math.cos(a) * 0.135));
      b.stick(
        new THREE.CylinderGeometry(0.027 * scale, 0.032 * scale, 0.012 * scale, 6),
        OLD_GOLD,
        hit,
        { name: "goblet jewel setting" },
      );
      b.stick(
        cutGemGeometry(0.021 * scale, 0.023 * scale, 6),
        index === 1 ? EMERALD : RUBY,
        hit,
        { embed: 0.12, name: "goblet inset stone" },
      );
    }
    b.decal(cup, CUP_ETCH, {
      at: p(0, 0.295, 0.125),
      dir: [0, 0, 1],
      size: [0.095 * scale, 0.12 * scale],
      segments: 6,
      lift: 0.001,
      bone: root,
      name: "goblet sun engraving",
    });
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI * 2) / 8;
      sphere(
        p(Math.sin(a) * 0.088, 0.036, Math.cos(a) * 0.088),
        0.008 * scale,
        C.goldLight,
        "goblet foot bead",
      );
    }
  }
  goblet(0.72, 0, 0.30, 1, 1);
  goblet(0.39, 0.02, 0.81, 0.72, 2);

  // A few hero stones punctuate the gold with broad saturated facets.
  gem([0.02, 0.08, 0.77], 0.114, 0.17, EMERALD, [0.18, 1, 0.22], 6, root, "hero emerald");
  gem([-0.76, 0.018, 0.34], 0.093, 0.12, RUBY, [-0.2, 1, 0.25], 8, root, "spilled ruby");
  gem([0.29, 0.081, 0.43], 0.09, 0.134, SAPPHIRE, [0.35, 1, -0.2], 6, root, "large sapphire");
  gem([-0.24, 0.058, 0.34], 0.078, 0.105, AMETHYST, [-0.15, 1, 0.3], 6, root, "violet treasure stone");
  gem([0.12, 0.568, -0.14], 0.105, 0.16, RUBY, [0.15, 1, 0.2], 8, root, "ruby in chest");
  gem([-0.22, 0.568, -0.06], 0.095, 0.145, EMERALD, [-0.35, 1, 0.15], 6, root, "emerald in chest");
  gem([0.32, 0.563, -0.035], 0.07, 0.11, SAPPHIRE, [0.15, 1, 0.2], 6, root, "sapphire in chest");

  const smallStones = [
    [-0.28, 0.026, 0.9],
    [0.18, 0.024, 1.0],
    [-0.67, 0.026, 0.82],
    [0.64, 0.027, 0.73],
    [-0.12, 0.091, 0.58],
    [0.51, 0.028, 0.29],
    [-0.65, 0.026, 0.13],
    [0.8, 0.015, 0.58],
    [0.06, 0.58, -0.36],
    [-0.36, 0.576, -0.18],
  ];
  smallStones.forEach((p, i) => {
    gem(
      p,
      0.033 + random() * 0.015,
      0.048 + random() * 0.025,
      JEWELS[i % JEWELS.length],
      [(random() - 0.5) * 0.3, 1, (random() - 0.5) * 0.3],
      i % 2 ? 6 : 8,
      root,
      "small loose cut jewel",
    );
  });

  // Two abandoned rings nestle among the coins, rather than unrelated scenery.
  torus([-0.13, 0.117, 0.43], 0.041, 0.009, GOLD, [0.15, 1, 0.1], root, "treasure ring");
  gem([-0.13, 0.12, 0.468], 0.023, 0.033, RUBY, [0, 1, 0.5], 6, root, "ring ruby");
  torus([0.19, 0.029, 0.91], 0.032, 0.007, GOLD, [0, 1, 0], root, "plain gold ring");

  // Small protective corner diamonds finish the front rail.
  for (const s of [-1, 1]) {
    const mount = frame([s * 0.5, 0.624, 0.22], [0, 0, 1]);
    b.stick(
      new THREE.CylinderGeometry(0.038, 0.041, 0.016, 4),
      OLD_GOLD,
      mount,
      { spin: 45, name: "rim diamond socket" },
    );
    gem(
      [s * 0.5, 0.624, 0.223],
      0.027,
      0.028,
      SAPPHIRE,
      [0, 0, 1],
      4,
      root,
      "rim sapphire",
    );
  }

  return b.root;
}
```