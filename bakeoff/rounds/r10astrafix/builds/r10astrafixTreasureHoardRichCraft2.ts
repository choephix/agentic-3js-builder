import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  svg,
  paint,
  mix,
  noise,
  grain,
  catmull,
} from "../../../../src/index";
import type { Fill } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "The Sovereign's Ransom",
  description:
    "A heroic fantasy treasure hoard: an open, gold-bound midnight-teal chest, overflowing stamped coins, a jeweled crown, ceremonial goblets and enormous cut gems, staged on an octagonal vault stone.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "The Sovereign's Ransom",
    paintSize: 2048,
  });
  b.joint("hoardRoot", { at: [0, 0, 0] });
  const random = rng(83147);

  const C = {
    ink: "#14202c",
    darkGold: "#79502b",
    gold: "#dba342",
    goldLight: "#ffe1a0",
    goldShade: "#ac7130",
    teal: "#185967",
    tealLight: "#33878a",
    tealDark: "#102f40",
    wood: "#133e4b",
    lining: "#261d35",
    stone: "#293846",
    stoneEdge: "#172531",
    ruby: "#d93360",
    rubyLight: "#ff7991",
    blue: "#288edb",
    blueLight: "#86e7ff",
    green: "#19ae8c",
    greenLight: "#8df9cc",
    wine: "#691e3b",
    ivory: "#fff1c0",
  };

  const gold = paint((p, n) => {
    const t = Math.max(0, Math.min(1, n.y * 0.35 + n.z * 0.15 + 0.46));
    return mix("#94602c", "#ffe096", t + (noise(p, 0.11, 3) - 0.5) * 0.13);
  });
  const brightGold = paint((_p, n) =>
    n.y > 0.25 ? "#ffe7ad" : n.z > -0.3 ? "#eab855" : "#a96e31",
  );
  const chestWood = grain("#123a49", "#23606a", {
    size: 0.045,
    axis: "x",
    seed: 9,
  });
  const stonePaint = paint((p, n) =>
    mix(
      n.y > 0.5 ? "#344956" : "#1a2b39",
      "#52606b",
      noise(p, 0.27, 5) * 0.24,
    ),
  );

  // Drawings are deliberately broad enough to survive at miniature scale.
  const coinTexture = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="62" fill="#b7772f"/>
      <circle cx="64" cy="64" r="57" fill="#edbc58" stroke="#ffe4a0" stroke-width="4"/>
      <circle cx="64" cy="64" r="48" fill="none" stroke="#996127" stroke-width="3"/>
      <circle cx="64" cy="64" r="52" fill="none" stroke="#fff0b5" stroke-width="3" stroke-dasharray="3 9"/>
      <path d="M64 24 L77 47 L99 59 L77 72 L64 99 L51 72 L29 59 L51 47Z"
        fill="#965b27" stroke="#ffe9a3" stroke-width="3"/>
      <path d="M64 34 L73 58 L64 83 L55 58Z" fill="#ffe39a"/>
      <path d="M43 93 Q64 110 85 93" fill="none" stroke="#fff0b5" stroke-width="3"/>
    </svg>`,
    { size: 192 },
  );

  const crestTexture = svg(
    `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <path d="M128 13 L139 51 L163 32 L159 66 L197 59 L178 88
        L224 104 L183 119 L224 143 L177 151 L191 186 L155 177
        L149 220 L128 190 L107 220 L101 177 L65 186 L79 151
        L32 143 L73 119 L32 104 L78 88 L59 59 L97 66 L93 32 L117 51Z"
        fill="#b47c38" stroke="#fce0a0" stroke-width="5"/>
      <path d="M128 48 L172 107 L161 163 L128 196 L95 163 L84 107Z"
        fill="#102f40" stroke="#ffe1a0" stroke-width="7"/>
      <path d="M128 70 L150 119 L128 168 L106 119Z"
        fill="#36bfb2" stroke="#fff0b5" stroke-width="5"/>
      <path d="M128 79 L128 155 L113 119Z" fill="#b0f5d9"/>
      <path d="M82 202 Q128 233 174 202" fill="none" stroke="#e9b85c" stroke-width="5"/>
    </svg>`,
    { size: 384 },
  );

  const panelTexture = svg(
    `<svg viewBox="0 0 320 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 47 V16 H70 M250 16 H308 V47 M12 81 V112 H70 M250 112 H308 V81"
        fill="none" stroke="#b78b49" stroke-width="4"/>
      <path d="M22 33 L38 22 L60 33 L38 44Z M298 33 L282 22 L260 33 L282 44Z
        M22 95 L38 84 L60 95 L38 106Z M298 95 L282 84 L260 95 L282 106Z"
        fill="#b78b49"/>
      <path d="M63 64 H115 L132 47 L160 64 L188 47 L205 64 H257
        M115 64 L132 81 L160 64 L188 81 L205 64"
        fill="none" stroke="#43838b" stroke-width="4"/>
      <path d="M160 43 L174 64 L160 85 L146 64Z" fill="#d6a453"/>
    </svg>`,
    { size: 384 },
  );

  const filigreeTexture = svg(
    `<svg viewBox="0 0 192 96" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 83 Q22 34 49 63 Q64 85 40 84 Q23 79 41 64
        M185 83 Q170 34 143 63 Q128 85 152 84 Q169 79 151 64"
        fill="none" stroke="#ffdfa0" stroke-width="5"/>
      <path d="M96 9 L116 47 L96 83 L76 47Z" fill="#163f4a"
        stroke="#ffe5a2" stroke-width="5"/>
      <path d="M96 23 L104 47 L96 68 L88 47Z" fill="#53cfbd"/>
      <path d="M57 45 Q67 20 81 29 M135 45 Q125 20 111 29"
        fill="none" stroke="#ffdfa0" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const plaqueTexture = svg(
    `<svg viewBox="0 0 512 112" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="504" height="104" rx="8" fill="#152d39"
        stroke="#e2b460" stroke-width="6"/>
      <path d="M24 56 L38 40 L52 56 L38 72Z M460 56 L474 40 L488 56 L474 72Z"
        fill="#dfad51"/>
      <text x="256" y="49" text-anchor="middle" font-family="Georgia,serif"
        font-size="27" font-weight="bold" letter-spacing="4" fill="#ffe5ab">THE SOVEREIGN'S</text>
      <text x="256" y="84" text-anchor="middle" font-family="Georgia,serif"
        font-size="29" font-weight="bold" letter-spacing="8" fill="#e8ba65">RANSOM</text>
    </svg>`,
    { size: 512 },
  );

  function box(
    at: number[],
    size: number[],
    color: Fill,
    name: string,
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      rotation,
      name,
    });
  }

  function ball(at: number[], radius: number, color: Fill, name: string) {
    return b.part(new THREE.IcosahedronGeometry(radius, 0), color, {
      at,
      name,
      flat: true,
    });
  }

  function cylinder(
    at: number[],
    rt: number,
    rb: number,
    h: number,
    color: Fill,
    name: string,
    dir: number[] = [0, 1, 0],
    sides = 12,
  ) {
    return b.part(new THREE.CylinderGeometry(rt, rb, h, sides, 1), color, {
      at,
      dir,
      name,
      flat: true,
    });
  }

  function line(
    a: number[],
    c: number[],
    radius: number,
    color: Fill,
    name: string,
  ) {
    return b.rod(a, c, radius, {
      color,
      sides: 6,
      smooth: false,
      name,
    });
  }

  function drawing(
    texture: THREE.Texture,
    at: number[],
    size: number[],
    name: string,
    dir: number[] = [0, 0, 1],
    up: number[] = [0, 1, 0],
  ) {
    return b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
      at,
      dir,
      up,
      axis: "z",
      texture,
      name,
    });
  }

  // A cut jewel with a flat table, broad crown facets and pointed pavilion.
  // Radius and height are modeled, not smoothed sphere approximations.
  function gemGeometry(radius: number, height: number, sides = 6) {
    const positions: number[] = [];
    const rings = [
      { r: radius * 0.12, y: -height * 0.45 },
      { r: radius, y: -height * 0.03 },
      { r: radius, y: height * 0.09 },
      { r: radius * 0.52, y: height * 0.51 },
    ];
    const point = (ring: number, i: number) => {
      const a = (i * Math.PI * 2) / sides + Math.PI / sides;
      return [
        Math.cos(a) * rings[ring].r,
        rings[ring].y,
        Math.sin(a) * rings[ring].r,
      ];
    };
    function tri(a: number[], c: number[], d: number[]) {
      positions.push(...a, ...c, ...d);
    }
    for (let j = 0; j < rings.length - 1; j++) {
      for (let i = 0; i < sides; i++) {
        const k = (i + 1) % sides;
        tri(point(j, i), point(j + 1, i), point(j + 1, k));
        tri(point(j, i), point(j + 1, k), point(j, k));
      }
    }
    for (let i = 0; i < sides; i++) {
      const k = (i + 1) % sides;
      tri([0, rings[3].y, 0], point(3, k), point(3, i));
      tri([0, rings[0].y, 0], point(0, i), point(0, k));
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.computeVertexNormals();
    return geometry;
  }

  const jewelPaints = [
    paint((_p, n) =>
      n.y > 0.65 ? "#ff86a2" : n.x > 0.3 ? "#ff4775" : n.z > 0 ? "#b91650" : "#620c35",
    ),
    paint((_p, n) =>
      n.y > 0.65 ? "#95edff" : n.x > 0.3 ? "#39b7ff" : n.z > 0 ? "#245fd0" : "#17367a",
    ),
    paint((_p, n) =>
      n.y > 0.65 ? "#a0ffcf" : n.x > 0.3 ? "#39e4b7" : n.z > 0 ? "#159979" : "#0b514e",
    ),
  ];

  function jewel(
    at: number[],
    r: number,
    h: number,
    kind: number,
    rotation: number[] = [0, 0, 0],
    name = "cut gemstone",
  ) {
    return b.part(gemGeometry(r, h), jewelPaints[kind], {
      at,
      rotation,
      name,
      flat: true,
    });
  }

  function coin(
    at: number[],
    radius: number,
    rotation: number[] = [0, 0, 0],
    stamped = false,
  ) {
    const q = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        THREE.MathUtils.degToRad(rotation[0]),
        THREE.MathUtils.degToRad(rotation[1]),
        THREE.MathUtils.degToRad(rotation[2]),
      ),
    );
    const body = b.part(
      new THREE.CylinderGeometry(radius, radius, 0.014, 10),
      random() > 0.28 ? gold : brightGold,
      { at, quat: q, name: "gold sovereign" },
    );
    if (stamped) {
      const pos = new THREE.Vector3(0, 0.0075, 0)
        .applyQuaternion(q)
        .add(new THREE.Vector3(at[0], at[1], at[2]));
      const faceQ = q.clone().multiply(
        new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(1, 0, 0),
          -Math.PI / 2,
        ),
      );
      b.part(new THREE.CircleGeometry(radius * 0.94, 12), "#ffffff", {
        at: pos,
        quat: faceQ,
        texture: coinTexture,
        name: "minted sovereign face",
      });
    }
    return body;
  }

  // ---------------------------------------------------------------------------
  // A quiet, bevelled vault-stone stage. Everything else is supported by its top.
  // ---------------------------------------------------------------------------

  b.lathe(
    [
      [0, 0],
      [1.24, 0],
      [1.33, 0.055],
      [1.33, 0.115],
      [1.25, 0.175],
      [0, 0.175],
    ],
    {
      at: [0, 0, 0.05],
      segments: 8,
      spin: 22.5,
      color: stonePaint,
      name: "octagonal vault stone",
    },
  );
  b.lathe(
    [
      [1.315, 0.063],
      [1.337, 0.063],
      [1.337, 0.084],
      [1.315, 0.084],
    ],
    {
      at: [0, 0, 0.05],
      segments: 8,
      spin: 22.5,
      color: C.goldShade,
      name: "inlaid stage edge",
    },
  );

  const floorY = 0.176;
  const floorCracks = [
    [[-1.08, floorY, 0.14], [-0.89, floorY, 0.26], [-0.91, floorY, 0.44]],
    [[0.97, floorY, -0.38], [0.78, floorY, -0.29], [0.81, floorY, -0.12]],
    [[-0.2, floorY, 1.12], [-0.12, floorY, 0.97], [-0.26, floorY, 0.88]],
    [[0.83, floorY, 0.65], [0.98, floorY, 0.71], [1.06, floorY, 0.69]],
  ];
  floorCracks.forEach((path, i) =>
    b.sweep(path, 0.004, {
      color: C.stoneEdge,
      sides: 4,
      caps: "flat",
      name: `stone fissure ${i}`,
    }),
  );

  // ---------------------------------------------------------------------------
  // Chest: chunky carved panels, open dark interior, great golden corner posts.
  // ---------------------------------------------------------------------------

  const chestZ = -0.23;
  const frontZ = 0.31;
  const rearZ = -0.77;
  const bottomY = 0.27;
  const topY = 0.99;

  for (const x of [-0.61, 0.61]) {
    for (const z of [-0.64, 0.18]) {
      box([x, 0.226, z], [0.23, 0.1, 0.22], C.darkGold, "chest foot shadow");
      box([x, 0.261, z], [0.25, 0.1, 0.24], gold, "bevel foot cap");
    }
  }

  box([0, bottomY + 0.055, chestZ], [1.43, 0.12, 1.06], chestWood, "chest floor");
  box([0, 0.65, frontZ], [1.43, 0.67, 0.105], chestWood, "front carved wall");
  box([0, 0.65, rearZ], [1.43, 0.67, 0.105], chestWood, "rear wall");

  for (const s of [-1, 1]) {
    box([s * 0.695, 0.65, chestZ], [0.105, 0.67, 1.08], chestWood, "side wall");
    box([s * 0.637, 0.66, chestZ], [0.018, 0.57, 0.94], C.lining, "velvet side liner");
  }
  box([0, 0.66, rearZ + 0.057], [1.25, 0.58, 0.018], C.lining, "velvet rear liner");
  box([0, 0.66, frontZ - 0.057], [1.25, 0.58, 0.018], C.lining, "velvet front liner");

  for (const y of [0.365, 0.962]) {
    box([0, y, frontZ + 0.027], [1.51, 0.075, 0.14], gold, "front rim binding");
    box([0, y, rearZ - 0.027], [1.51, 0.075, 0.14], gold, "rear rim binding");
    for (const s of [-1, 1]) {
      box([s * 0.718, y, chestZ], [0.085, 0.075, 1.12], gold, "side rim binding");
    }
  }

  // Real seams retain the primitive-built, broad planked character.
  for (const y of [0.53, 0.72]) {
    box([0, y, frontZ + 0.056], [1.27, 0.012, 0.008], C.tealDark, "front plank seam");
    for (const s of [-1, 1]) {
      box([s * 0.752, y, chestZ], [0.008, 0.012, 0.91], C.tealDark, "side plank seam");
    }
  }

  for (const s of [-1, 1]) {
    for (const z of [frontZ + 0.025, rearZ - 0.025]) {
      box([s * 0.656, 0.66, z], [0.145, 0.64, 0.153], gold, "armored corner upright");
      box([s * 0.656, 0.67, z + (z > 0 ? 0.081 : -0.081)],
        [0.065, 0.43, 0.017], C.goldLight, "corner gold highlight");
      for (const y of [0.43, 0.86]) {
        ball([s * 0.657, y, z + (z > 0 ? 0.09 : -0.09)],
          0.028, C.goldShade, "square forged rivet");
      }
    }
  }

  drawing(panelTexture, [-0.335, 0.669, frontZ + 0.058],
    [0.48, 0.26], "left carved inlay");
  drawing(panelTexture, [0.335, 0.669, frontZ + 0.058],
    [0.48, 0.26], "right carved inlay");

  // Central clasp is a separate layered shield, with a proper keyhole.
  const shield = [
    [-0.115, 0.14],
    [0.115, 0.14],
    [0.135, -0.055],
    [0, -0.17],
    [-0.135, -0.055],
  ];
  b.extrude(shield, {
    at: [0, 0.705, 0.404],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.055,
    bevel: 0.012,
    color: gold,
    name: "great shield lock",
  });
  b.extrude(shield.map(([x, y]) => [x * 0.73, y * 0.73]), {
    at: [0, 0.705, 0.438],
    x: [1, 0, 0],
    thickness: 0.013,
    color: C.tealDark,
    name: "lock enamel inset",
  });
  cylinder([0, 0.735, 0.451], 0.029, 0.029, 0.008,
    C.ink, "keyhole round", [0, 0, 1], 12);
  b.extrude([[-0.011, 0.02], [0.011, 0.02], [0.022, -0.043], [-0.022, -0.043]], {
    at: [0, 0.715, 0.456],
    x: [1, 0, 0],
    thickness: 0.008,
    color: C.ink,
    name: "keyhole stem",
  });
  box([0, 0.918, 0.414], [0.115, 0.18, 0.064], gold, "latch tongue");
  ball([0, 0.94, 0.452], 0.027, brightGold, "latch pin");

  // Carrying rings sit against each side and remain readable in three-quarter view.
  for (const s of [-1, 1]) {
    cylinder([s * 0.777, 0.73, chestZ], 0.085, 0.085, 0.035,
      gold, "handle boss", [s, 0, 0], 8);
    const ringPath: number[][] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ringPath.push([
        s * 0.804,
        0.625 + Math.cos(a) * 0.105,
        chestZ + Math.sin(a) * 0.118,
      ]);
    }
    b.sweep(catmull(ringPath, { closed: true }), 0.023, {
      color: gold,
      sides: 6,
      name: "hanging side ring",
    });
  }

  // ---------------------------------------------------------------------------
  // Open barrel lid. All pieces share one explicit hinge-space transform.
  // ---------------------------------------------------------------------------

  const lidPivot = new THREE.Vector3(0, 1.022, rearZ);
  const lidQ = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(1, 0, 0),
    THREE.MathUtils.degToRad(-68),
  );
  const lidLength = 1.08;
  const lidArch = (t: number) => Math.sin(Math.PI * t) * 0.245;
  function lp(x: number, y: number, z: number) {
    return new THREE.Vector3(x, y, z).applyQuaternion(lidQ).add(lidPivot);
  }
  function lidBox(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: Fill,
    angle = 0,
    name = "lid piece",
  ) {
    const localQ = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      angle,
    );
    return b.part(new THREE.BoxGeometry(w, h, d), color, {
      at: lp(x, y, z),
      quat: lidQ.clone().multiply(localQ),
      name,
    });
  }

  const slatCount = 8;
  for (let i = 0; i < slatCount; i++) {
    const t0 = i / slatCount;
    const t1 = (i + 1) / slatCount;
    const z0 = t0 * lidLength;
    const z1 = t1 * lidLength;
    const y0 = lidArch(t0);
    const y1 = lidArch(t1);
    const angle = -Math.atan2(y1 - y0, z1 - z0);
    const depth = Math.hypot(y1 - y0, z1 - z0) + 0.008;
    lidBox(0, (y0 + y1) / 2, (z0 + z1) / 2,
      1.47, 0.085, depth, chestWood, angle, "arched lid plank");
    lidBox(0, (y0 + y1) / 2 - 0.046, (z0 + z1) / 2,
      1.22, 0.012, depth - 0.008, C.tealDark, angle, "inner lid plank");
  }

  for (const x of [-0.685, 0.685, -0.43, 0.43]) {
    const path: THREE.Vector3[] = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      path.push(lp(x, lidArch(t) + 0.038, t * lidLength));
    }
    b.sweep(path, () => [x === -0.685 || x === 0.685 ? 0.044 : 0.027, 0.026], {
      color: gold,
      section: "box",
      caps: "flat",
      name: "arched lid golden binding",
    });
  }

  // Thin raised front-and-back rails show the thickness of the open lid.
  for (const z of [0, lidLength]) {
    lidBox(0, 0.004, z, 1.55, 0.115, 0.09,
      gold, 0, "lid edge rail");
    lidBox(0, -0.057, z, 1.39, 0.016, 0.026,
      C.goldLight, 0, "inner rail glint");
  }
  for (const x of [-0.695, 0.695]) {
    for (const t of [0.08, 0.3, 0.54, 0.77, 0.93]) {
      b.part(new THREE.IcosahedronGeometry(0.026, 0), brightGold, {
        at: lp(x, lidArch(t) - 0.065, t * lidLength),
        name: "lid binding rivet",
      });
    }
  }
  for (const x of [-0.47, 0.47]) {
    cylinder([x, 1.015, rearZ], 0.065, 0.065, 0.26,
      gold, "barrel hinge", [1, 0, 0], 10);
    for (const dx of [-0.08, 0.08]) {
      cylinder([x + dx, 1.015, rearZ], 0.069, 0.069, 0.025,
        C.darkGold, "hinge seam ring", [1, 0, 0], 10);
    }
  }

  // The large heraldic medallion faces forward from the inside of the lid.
  const crestAt = lp(0, 0.135, 0.56);
  const crestDir = new THREE.Vector3(0, -1, 0).applyQuaternion(lidQ);
  const crestUp = new THREE.Vector3(0, 0, 1).applyQuaternion(lidQ);
  b.part(new THREE.CylinderGeometry(0.285, 0.285, 0.027, 10), gold, {
    at: crestAt,
    dir: crestDir,
    name: "inner lid heraldic medallion",
  });
  b.part(new THREE.CylinderGeometry(0.252, 0.252, 0.031, 10), C.tealDark, {
    at: crestAt.clone().addScaledVector(crestDir, 0.008),
    dir: crestDir,
    name: "medallion enamel",
  });
  b.part(new THREE.PlaneGeometry(0.47, 0.47), "#ffffff", {
    at: crestAt.clone().addScaledVector(crestDir, 0.026),
    dir: crestDir,
    up: crestUp,
    axis: "z",
    texture: crestTexture,
    name: "sovereign sun and emerald crest",
  });

  // Lid stays: angular bronze straps, attached at both ends.
  for (const s of [-1, 1]) {
    const tip = lp(s * 0.62, -0.045, 0.64);
    const a = [s * 0.63, 0.93, -0.05];
    const elbow = [s * 0.63, 1.12, -0.2];
    line(a, elbow, 0.018, C.darkGold, "lid stay lower");
    line(elbow, tip.toArray(), 0.018, gold, "lid stay upper");
    ball(elbow, 0.031, brightGold, "lid stay pivot");
  }

  // ---------------------------------------------------------------------------
  // Coins inside the chest and spilling across the stone.
  // Surface hits seat the scattered discs on real treasure mounds.
  // ---------------------------------------------------------------------------

  function mound(
    at: number[],
    scale: number[],
    count: number,
    name: string,
    minRadius: number,
  ) {
    const mass = b.part(new THREE.SphereGeometry(1, 12, 6), C.goldShade, {
      at,
      scale,
      flat: true,
      name,
    });
    const hits = b.surface(mass).scatter(count, {
      rng: random,
      minDist: minRadius * 1.3,
      filter: (h) => h.n.y > 0.48 && h.at.y > floorY + 0.012,
    });
    hits.forEach((hit, i) => {
      const r = minRadius * (0.85 + random() * 0.5);
      b.stick(new THREE.CylinderGeometry(r, r, 0.015, 10),
        i % 4 === 0 ? brightGold : gold,
        hit,
        { embed: 0.15, spin: random() * 360, name: "loose sovereign on pile" },
      );
      if (i % 6 === 0) {
        const pos = hit.at.clone().addScaledVector(hit.n, 0.013);
        b.part(new THREE.CircleGeometry(r * 0.94, 12), "#ffffff", {
          at: pos,
          dir: hit.n,
          axis: "z",
          texture: coinTexture,
          name: "stamped pile coin",
        });
      }
    });
    return mass;
  }

  mound([0, 0.845, -0.2], [0.615, 0.2, 0.425],
    55, "gold-filled chest", 0.053);
  mound([0.05, 0.205, 0.63], [0.49, 0.105, 0.35],
    36, "spilled coin mound", 0.05);
  mound([-0.86, 0.203, -0.09], [0.255, 0.075, 0.31],
    19, "side coin spill", 0.046);

  const stacks = [
    [-0.35, 0.85, 5, 0.066],
    [0.33, 0.82, 7, 0.064],
    [0.18, 1.0, 4, 0.06],
    [-0.95, 0.36, 6, 0.061],
    [0.92, 0.02, 5, 0.06],
    [0.5, 0.44, 4, 0.058],
  ];
  stacks.forEach(([x, z, count, radius]) => {
    for (let i = 0; i < count; i++) {
      coin([
        x + (random() - 0.5) * 0.009,
        floorY + 0.009 + i * 0.015,
        z + (random() - 0.5) * 0.008,
      ], radius, [0, random() * 360, 0], i === count - 1);
    }
  });

  // A few isolated coins make the spill feel accidental rather than tiled.
  const looseCoins = [
    [-0.14, 1.07], [0.49, 0.98], [-0.48, 0.99], [0.72, 0.91],
    [-1.04, 0.13], [1.02, 0.32], [0.81, -0.34], [-0.88, -0.49],
    [0.04, 0.91], [-0.64, 0.39], [0.38, 0.42], [-0.23, 0.45],
  ];
  looseCoins.forEach(([x, z], i) => {
    coin([x, floorY + 0.009, z], 0.046 + random() * 0.015,
      [0, random() * 360, 0], i % 2 === 0);
  });

  // ---------------------------------------------------------------------------
  // Crown, foreground left: a hollow circlet, six spear leaves and rich settings.
  // ---------------------------------------------------------------------------

  const crownX = -0.65;
  const crownZ = 0.66;
  const crownBase = floorY + 0.005;

  b.lathe(
    [
      [0.205, 0],
      [0.254, 0],
      [0.267, 0.038],
      [0.256, 0.12],
      [0.249, 0.155],
      [0.218, 0.155],
      [0.218, 0.038],
      [0.205, 0.025],
    ],
    {
      at: [crownX, crownBase, crownZ],
      segments: 12,
      color: gold,
      name: "hollow sovereign crown",
    },
  );

  b.lathe(
    [[0.256, 0.047], [0.271, 0.047], [0.267, 0.111], [0.253, 0.111]],
    {
      at: [crownX, crownBase, crownZ],
      segments: 12,
      color: C.tealDark,
      name: "crown enamel band",
    },
  );
  for (const y of [0.037, 0.125]) {
    b.lathe(
      [[0.248, y - 0.012], [0.27, y - 0.012], [0.27, y + 0.012], [0.248, y + 0.012]],
      {
        at: [crownX, crownBase, crownZ],
        segments: 12,
        color: brightGold,
        name: "crown rolled gold rim",
      },
    );
  }

  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI * 2) / 6;
    const n = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const tangent = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
    const height = i % 3 === 0 ? 0.32 : 0.255;
    const base = new THREE.Vector3(crownX, crownBase + 0.12, crownZ)
      .addScaledVector(n, 0.238);

    const leaf = b.extrude(
      [
        [-0.092, 0],
        [-0.062, 0.095],
        [-0.063, height * 0.62],
        [0, height],
        [0.063, height * 0.62],
        [0.062, 0.095],
        [0.092, 0],
      ],
      {
        at: base,
        x: tangent,
        y: [0, 1, 0],
        thickness: 0.038,
        bevel: 0.006,
        color: gold,
        name: "crown spear leaf",
      },
    );
    const ridgeA = base.clone().addScaledVector(n, 0.024);
    const ridgeB = ridgeA.clone().add(new THREE.Vector3(0, height * 0.89, 0));
    b.rod(ridgeA, ridgeB, [0.012, 0.004], {
      color: C.goldLight,
      sides: 4,
      name: "crown leaf ridge",
    });

    const setting = base.clone().addScaledVector(n, 0.035);
    setting.y += height * 0.52;
    b.part(new THREE.CylinderGeometry(0.048, 0.055, 0.021, 6), C.darkGold, {
      at: setting,
      dir: n,
      name: "crown jewel bezel",
    });
    b.part(gemGeometry(0.039, 0.045), jewelPaints[i % 2 === 0 ? 0 : 1], {
      at: setting.clone().addScaledVector(n, 0.018),
      dir: n,
      name: "crown inset jewel",
      flat: true,
    });
    const finial = base.clone().add(new THREE.Vector3(0, height, 0));
    b.part(new THREE.IcosahedronGeometry(0.025, 0), brightGold, {
      at: finial,
      name: "crown finial",
    });

    // Small pearl separators on the circlet rather than clutter on the tips.
    const next = a + Math.PI / 6;
    ball([
      crownX + Math.sin(next) * 0.269,
      crownBase + 0.082,
      crownZ + Math.cos(next) * 0.269,
    ], 0.024, C.ivory, "crown pearl");
    void leaf;
  }

  // ---------------------------------------------------------------------------
  // Ceremonial goblets. Open bowls, wine, stepped feet and enamel ornament.
  // ---------------------------------------------------------------------------

  function goblet(x: number, z: number, scale: number, filled: boolean) {
    const y = floorY;
    const outline = [
      [0, 0],
      [0.14, 0],
      [0.157, 0.023],
      [0.145, 0.047],
      [0.078, 0.065],
      [0.039, 0.092],
      [0.031, 0.25],
      [0.065, 0.285],
      [0.12, 0.313],
      [0.163, 0.38],
      [0.174, 0.48],
      [0.16, 0.497],
      [0.143, 0.48],
      [0.137, 0.398],
      [0.103, 0.341],
      [0.048, 0.312],
      [0, 0.312],
    ].map(([r, h]) => [r * scale, h * scale]);
    const cup = b.lathe(outline, {
      at: [x, y, z],
      segments: 10,
      color: gold,
      name: "ceremonial goblet",
    });
    b.lathe(
      [[0.151, 0.458], [0.18, 0.458], [0.18, 0.48], [0.16, 0.498], [0.151, 0.48]]
        .map(([r, h]) => [r * scale, h * scale]),
      {
        at: [x, y, z],
        segments: 10,
        color: brightGold,
        name: "goblet heavy lip",
      },
    );
    b.lathe(
      [[0.137, 0.384], [0.166, 0.384], [0.172, 0.435], [0.145, 0.435]]
        .map(([r, h]) => [r * scale, h * scale]),
      {
        at: [x, y, z],
        segments: 10,
        color: C.teal,
        name: "goblet enamel sleeve",
      },
    );
    for (const h of [0.105, 0.232]) {
      cylinder([x, y + h * scale, z], 0.049 * scale, 0.049 * scale,
        0.025 * scale, brightGold, "goblet stem collar", [0, 1, 0], 8);
    }
    ball([x, y + 0.173 * scale, z], 0.055 * scale, C.teal, "stem enamel knop");
    if (filled) {
      cylinder([x, y + 0.451 * scale, z], 0.144 * scale, 0.14 * scale,
        0.008 * scale, C.wine, "dark ruby wine", [0, 1, 0], 10);
      b.part(new THREE.CircleGeometry(0.026 * scale, 8), "#e6868c", {
        at: [x - 0.049 * scale, y + 0.456 * scale, z + 0.036 * scale],
        rotation: [-90, 0, 0],
        scale: [1.7, 0.55, 1],
        name: "wine reflection",
      });
    }
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const n = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
      const pos = new THREE.Vector3(x, y + 0.347 * scale, z)
        .addScaledVector(n, 0.137 * scale);
      b.part(new THREE.IcosahedronGeometry(0.019 * scale, 0), C.goldLight, {
        at: pos,
        name: "goblet bowl stud",
      });
    }
    b.decal(cup, filigreeTexture, {
      at: [x, y + 0.372 * scale, z + 0.175 * scale],
      dir: [0, 0, 1],
      size: [0.21 * scale, 0.105 * scale],
      lift: 0.003,
      segments: 8,
      name: "goblet scroll engraving",
    });
  }

  goblet(0.71, 0.59, 1.12, true);
  goblet(0.99, 0.12, 0.79, false);

  // ---------------------------------------------------------------------------
  // Large cut stones: the bright secondary shapes against the mass of gold.
  // ---------------------------------------------------------------------------

  jewel([0.055, 1.065, -0.11], 0.143, 0.21, 2,
    [10, 25, -12], "great emerald in chest");
  jewel([-0.37, 1.01, -0.27], 0.105, 0.15, 0,
    [-14, 20, 16], "ruby in treasure");
  jewel([0.38, 0.99, -0.32], 0.105, 0.16, 1,
    [8, -15, -8], "sapphire in treasure");
  jewel([0.09, 0.344, 0.64], 0.145, 0.19, 0,
    [0, 28, 0], "great foreground ruby");
  jewel([0.4, 0.241, 0.99], 0.102, 0.14, 1,
    [0, -10, 0], "fallen sapphire");
  jewel([-0.32, 0.235, 0.98], 0.075, 0.12, 2,
    [0, 32, 0], "fallen emerald");
  jewel([-1.025, 0.245, -0.13], 0.09, 0.14, 1,
    [0, 17, 0], "side sapphire");

  // A necklace drapes over the front rim, then curls across the coin spill.
  const necklacePath = catmull([
    [0.39, 1.028, -0.01],
    [0.45, 1.01, 0.25],
    [0.47, 0.77, 0.405],
    [0.44, 0.48, 0.422],
    [0.35, 0.25, 0.51],
    [0.22, 0.29, 0.63],
  ]);
  b.sweep(necklacePath, 0.01, {
    color: C.darkGold,
    sides: 5,
    name: "necklace golden thread",
  });
  b.along(necklacePath, 24, (at) => {
    b.part(new THREE.IcosahedronGeometry(0.019, 0), brightGold, {
      at,
      name: "necklace bead",
    });
  });
  cylinder([0.22, 0.3, 0.65], 0.065, 0.065, 0.019,
    gold, "pendant bezel", [0, 1, 0], 8);
  jewel([0.22, 0.322, 0.65], 0.046, 0.044, 1,
    [0, 0, 0], "pendant sapphire");

  // Restrained pinpricks of magical light, on the gem tables rather than in space.
  const glints = [
    [0.047, 1.165, -0.105, 0.019],
    [0.09, 0.441, 0.64, 0.016],
    [0.4, 0.313, 0.99, 0.012],
  ];
  for (const [x, y, z, r] of glints) {
    glow(
      b.part(new THREE.OctahedronGeometry(r, 0), "#e3ffef", {
        at: [x, y, z],
        scale: [0.75, 0.2, 1.4],
        name: "jewel table glint",
      }),
      0.65,
    );
  }

  // Low museum-like nameplate, clear of the actual treasure silhouette.
  box([0, 0.105, 1.255], [0.86, 0.135, 0.035],
    C.darkGold, "vault nameplate backing");
  drawing(plaqueTexture, [0, 0.107, 1.275],
    [0.81, 0.116], "sovereign ransom nameplate");

  return b.root;
}
