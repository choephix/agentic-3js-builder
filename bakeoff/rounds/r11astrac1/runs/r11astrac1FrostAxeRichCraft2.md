```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  paint,
  mix,
  noise,
  svg,
  polyline,
  spiral,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Rime Sovereign",
  description:
    "A frost-forged legendary battle axe with genuinely tapered glacial cutting edges, dark engraved steel, a luminous captive heart, indigo leather bindings and a fractured ice dais.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Rime Sovereign", paintSize: 2048 });
  const root = b.joint("weaponRoot", { at: [0, 0, 0] });
  const random = rng(71429);

  // Art-direction revisions:
  // 1. Replace overlapping blade extrusions with actual wedge-shaped cutting
  //    edges: no coincident outer walls, and a sharp silhouette from the side.
  // 2. Seat each blade fastener on its actual supporting surface.
  // 3. Simplify the leather shading and add broad, readable binding edges.
  // 4. Give the blade runes more presence and add restrained branching frost.
  // 5. Bring the title plate outside the dais so its lettering is unobstructed.

  const C = {
    abyss: "#101b31",
    dark: "#1c2d49",
    silver: "#bcd9e4",
    ice: "#8cdded",
    cyan: "#38d6ed",
    light: "#b5faff",
    goldDark: "#695a48",
    seam: "#121b30",
  };

  const forged = paint((p, n) =>
    mix(
      "#22394f",
      "#789fb9",
      0.2 + noise(p, 0.17, 4) * 0.34 + Math.max(0, n.y) * 0.3,
    ),
  );
  const blackSteel = paint((p, n) =>
    mix(
      "#101c31",
      "#35546f",
      0.17 + noise(p, 0.14, 31) * 0.32 + Math.max(n.y, 0) * 0.25,
    ),
  );
  const silver = paint((p, n) =>
    mix(
      "#6389a3",
      "#daeff6",
      0.29 + noise(p, 0.09, 81) * 0.19 + Math.max(n.y, 0) * 0.4,
    ),
  );
  const ice = paint((p, n) =>
    mix(
      "#399cbd",
      "#d2f9ff",
      0.24 + Math.max(0, n.y) * 0.35 + noise(p, 0.13, 7) * 0.32,
    ),
  );
  const leather = paint((p, n) =>
    mix(
      "#25273e",
      "#52536d",
      0.18 + noise(p, 0.075, 71) * 0.24 + Math.max(n.z, 0) * 0.14,
    ),
  );
  const brass = paint((p, n) =>
    mix(
      "#655746",
      "#dcc596",
      0.25 + noise(p, 0.065, 6) * 0.3 + Math.max(n.y, 0) * 0.35,
    ),
  );
  const groundIce = paint((p, n) =>
    mix(
      "#223a56",
      "#79b4ca",
      0.12 + Math.max(n.y, 0) * 0.36 + noise(p, 0.19, 49) * 0.28,
    ),
  );
  const edgeIce = paint((p, n) =>
    mix(
      "#81cddd",
      "#edfdff",
      0.4 + Math.max(n.y, 0) * 0.2 + noise(p, 0.13, 17) * 0.22,
    ),
  );

  type Fill = string | ReturnType<typeof paint>;

  function box(
    name: string,
    at: number[],
    size: number[],
    color: Fill,
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at, rotation, bone: root, name,
    });
  }

  function cylinder(
    name: string,
    at: number[],
    r: number,
    height: number,
    color: Fill,
    sides = 8,
    dir: number[] = [0, 1, 0],
  ) {
    return b.part(new THREE.CylinderGeometry(r, r, height, sides), color, {
      at, dir, bone: root, name,
    });
  }

  function plate(
    name: string,
    outline: number[][],
    z: number,
    thickness: number,
    color: Fill,
    bevel = 0,
  ) {
    return b.extrude(outline, {
      at: [0, 0, z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      bevel,
      color,
      bone: root,
      name,
    });
  }

  function linework(
    name: string,
    points: number[][],
    radius: number,
    color: Fill,
    luminous = false,
  ) {
    const part = b.sweep(polyline(points), radius, {
      color, sides: 5, caps: "flat", bone: root, name,
    });
    if (luminous) glow(part, 0.8);
    return part;
  }

  function rivet(x: number, y: number, z: number, r = 0.014) {
    const face = Math.sign(z);
    cylinder("recessed rivet washer", [x, y, z], r * 1.5, 0.006, C.abyss, 8, [0, 0, face]);
    cylinder("hammered silver rivet", [x, y, z + face * 0.005], r, 0.012, silver, 6, [0, 0, face]);
  }

  function crystal(
    name: string,
    at: number[],
    tip: number[],
    radius: number,
    color: Fill = ice,
  ) {
    const axis = new THREE.Vector3(
      tip[0] - at[0], tip[1] - at[1], tip[2] - at[2],
    );
    const length = axis.length();
    return b.lathe(
      [
        [0, 0],
        [radius * 0.74, 0],
        [radius, length * 0.13],
        [radius * 0.83, length * 0.68],
        [0, length],
      ],
      {
        at, axis, segments: 5, spin: 18,
        color, bone: root, name,
      },
    );
  }

  function drawing(
    name: string,
    texture: THREE.Texture,
    at: number[],
    width: number,
    height: number,
    face = 1,
    luminous = false,
  ) {
    const p = b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at,
      dir: [0, 0, face],
      axis: "z",
      texture,
      bone: root,
      name,
    });
    if (luminous) glow(p, 0.85);
    return p;
  }

  const heartSeal = svg(
    `<svg viewBox="0 0 160 160">
      <g fill="none" stroke="#71e9f5" stroke-linejoin="miter">
        <path d="M80 5 145 80 80 155 15 80Z" stroke-width="5"/>
        <path d="M80 20 132 80 80 140 28 80Z" stroke-width="2.5"/>
        <path d="M80 35V125 M45 60L115 100 M45 100L115 60" stroke-width="5"/>
        <path d="M65 48 80 61 95 48 M65 112 80 99 95 112
          M48 72 61 80 48 88 M112 72 99 80 112 88" stroke-width="4"/>
      </g>
      <path d="M80 65 92 80 80 95 68 80Z" fill="#dcfdff"/>
      <g fill="#dcfdff">
        <path d="M80 8 85 16 80 24 75 16Z"/>
        <path d="M80 136 85 144 80 152 75 144Z"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  const bladeRune = svg(
    `<svg viewBox="0 0 160 230">
      <g fill="none" stroke="#112438" stroke-width="12" stroke-linejoin="miter">
        <path d="M80 20V204 M80 27 36 68 57 89 80 67 104 90 124 68Z"/>
        <path d="M44 115 80 147 116 115 M47 166 80 197 113 166"/>
      </g>
      <g fill="none" stroke="#79deed" stroke-width="6" stroke-linejoin="miter">
        <path d="M80 20V204 M80 27 36 68 57 89 80 67 104 90 124 68Z"/>
        <path d="M44 115 80 147 116 115 M47 166 80 197 113 166"/>
      </g>
      <path d="M80 20V61 M80 154V190" stroke="#e2fdff" stroke-width="2.5"/>
      <path d="M80 99 89 111 80 123 71 111Z" fill="#e0fdff"/>
      <path d="M19 94 27 104 19 114 11 104Z
        M141 94 149 104 141 114 133 104Z" fill="#60bfd5"/>
    </svg>`,
    { size: 384 },
  );

  const smallRunes = svg(
    `<svg viewBox="0 0 64 256">
      <g fill="none" stroke="#9feef6" stroke-width="4">
        <path d="M32 10V49 M17 20 32 10 47 20 M18 38 32 48 46 38"/>
        <path d="M17 73 32 61 47 73 32 85Z M32 85V104"/>
        <path d="M17 127 32 115 47 127 M32 115V155 M17 143 32 155 47 143"/>
        <path d="M17 184 32 172 47 184 32 196Z M32 196V211"/>
        <path d="M17 232 32 220 47 232 M32 220V248"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  const frostEtching = svg(
    `<svg viewBox="0 0 120 240">
      <g fill="none" stroke="#52879f" stroke-width="3">
        <path d="M60 224V16 M60 50 29 23 M60 50 91 23
          M60 86 19 49 M60 86 101 49
          M60 123 12 80 M60 123 108 80
          M60 160 21 122 M60 160 99 122
          M60 194 31 165 M60 194 89 165"/>
      </g>
      <path d="M60 209V23 M60 87 26 56 M60 123 103 86"
        fill="none" stroke="#9fd2df" stroke-width="2"/>
    </svg>`,
    { size: 384 },
  );

  const makerMark = svg(
    `<svg viewBox="0 0 220 100">
      <path d="M4 4H216V96H4Z" fill="#17283b" stroke="#9eb2ba" stroke-width="3"/>
      <path d="M12 12H208V88H12Z" fill="none" stroke="#677c8b" stroke-width="2"/>
      <text x="110" y="43" text-anchor="middle" font-family="serif"
        font-size="23" letter-spacing="3" fill="#dce9eb">RIME</text>
      <text x="110" y="68" text-anchor="middle" font-family="serif"
        font-size="15" letter-spacing="3" fill="#a9c8d4">SOVEREIGN</text>
      <path d="M38 79H88 M132 79H182 M105 75 110 81 115 75"
        fill="none" stroke="#bdab7e" stroke-width="2.5"/>
    </svg>`,
    { size: 512 },
  );

  const frozenSeal = svg(
    `<svg viewBox="0 0 256 256">
      <g fill="none" stroke="#6bbed3" stroke-width="3">
        <path d="M128 12 228 70V186L128 244 28 186V70Z"/>
        <path d="M128 28 214 78V178L128 228 42 178V78Z"/>
        <path d="M128 45V211 M56 86 200 170 M56 170 200 86"/>
        <path d="M112 60 128 76 144 60 M112 196 128 180 144 196
          M69 88 73 111 51 116 M187 168 183 145 205 140
          M69 168 73 145 51 140 M187 88 183 111 205 116"/>
      </g>
      <path d="M128 99 152 128 128 157 104 128Z"
        fill="#89d9e7" stroke="#d2f8ff" stroke-width="3"/>
    </svg>`,
    { size: 384 },
  );

  // Compact frozen presentation dais.
  cylinder("dais dark foundation", [0, 0.04, 0], 0.47, 0.08, C.abyss, 10);
  cylinder("dais bevel", [0, 0.085, 0], 0.445, 0.055, groundIce, 10);
  cylinder("frozen top slab", [0, 0.12, 0], 0.425, 0.035, groundIce, 10);
  glow(
    b.part(new THREE.PlaneGeometry(0.69, 0.69), "#ffffff", {
      at: [0, 0.139, 0],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: frozenSeal,
      bone: root,
      name: "buried snowflake seal",
    }),
    0.35,
  );

  for (let i = 0; i < 10; i++) {
    const a = i * Math.PI * 0.2;
    const x = Math.sin(a);
    const z = Math.cos(a);
    const r = 0.38 + random() * 0.035;
    box(
      "broken ice rim",
      [x * r, 0.14, z * r],
      [0.14 + random() * 0.05, 0.035 + random() * 0.035, 0.075],
      i % 3 === 0 ? edgeIce : groundIce,
      [0, a * 180 / Math.PI, 0],
    );
    linework(
      "radial glacial crack",
      [
        [x * 0.075, 0.142, z * 0.075],
        [x * 0.19 + z * 0.03, 0.142, z * 0.19 - x * 0.03],
        [x * 0.35, 0.143, z * 0.35],
      ],
      0.0028, C.ice, true,
    );
  }

  for (const [x, z, s] of [
    [-0.28, -0.16, 1],
    [0.27, -0.12, -1],
    [-0.23, 0.22, 1],
  ]) {
    crystal("ground ice splinter", [x, 0.14, z], [x + s * 0.055, 0.3, z - 0.02], 0.035);
    crystal("ground ice splinter", [x + 0.04, 0.14, z + 0.025], [x + 0.065, 0.235, z + 0.05], 0.022);
    crystal("ground ice splinter", [x - 0.025, 0.14, z], [x - 0.07, 0.215, z - 0.02], 0.025);
  }

  box("nameplate backing", [0, 0.078, 0.472], [0.255, 0.106, 0.029], C.dark);
  drawing("forgemaster title", makerMark, [0, 0.079, 0.488], 0.245, 0.1);
  for (const x of [-0.115, 0.115]) {
    cylinder("plaque pin", [x, 0.079, 0.491], 0.006, 0.006, brass, 6, [0, 0, 1]);
  }

  // Tang, pommel, grip.
  cylinder("continuous octagonal tang", [0, 1.031, 0], 0.044, 1.75, blackSteel);
  crystal("pommel ice fang", [0, 0.31, 0], [0, 0.135, 0], 0.075, edgeIce);
  b.lathe(
    [[0, 0], [0.068, 0], [0.088, 0.025], [0.083, 0.075], [0.058, 0.115], [0, 0.115]],
    {
      at: [0, 0.235, 0], segments: 8,
      color: blackSteel, bone: root, name: "crowned pommel",
    },
  );
  cylinder("pommel silver lip", [0, 0.269, 0], 0.09, 0.023, silver);
  cylinder("pommel gilt wire", [0, 0.305, 0], 0.074, 0.012, brass);
  for (const face of [-1, 1]) {
    plate(
      "pommel inset",
      [[-0.04, 0.267], [0, 0.245], [0.04, 0.267], [0, 0.309]],
      face * 0.081, 0.009, C.cyan, 0.003,
    );
  }

  cylinder("grip underwrap", [0, 0.737, 0], 0.058, 0.82, C.seam);
  for (let i = 0; i < 14; i++) {
    const y = 0.361 + i * 0.054;
    b.part(new THREE.CylinderGeometry(0.066, 0.064, 0.052, 8), leather, {
      at: [0, y, 0],
      rotation: [0, 22.5, 4],
      bone: root,
      name: "overlapping leather grip turn",
    });
    linework(
      "worn leather binding edge",
      [
        [-0.047, y + 0.015, 0.046],
        [0, y + 0.019, 0.062],
        [0.046, y + 0.022, 0.046],
      ],
      0.0035, "#66647d",
    );
    if (i % 3 === 1) {
      cylinder("grip fastening pin", [0, y, 0.065], 0.006, 0.006, brass, 6, [0, 0, 1]);
    }
  }

  for (let i = 0; i < 10; i++) {
    const y = 0.39 + i * 0.066;
    linework("crossed grip lacing", [[-0.025, y, -0.06], [0.025, y + 0.052, -0.06]], 0.003, C.goldDark);
    linework("crossed grip lacing", [[0.025, y, -0.061], [-0.025, y + 0.052, -0.061]], 0.003, C.goldDark);
  }

  function collar(y: number, radius: number, height: number) {
    cylinder("steel collar", [0, y, 0], radius, height, blackSteel);
    cylinder("collar upper silver rim", [0, y + height * 0.43, 0], radius * 1.035, 0.013, silver);
    cylinder("collar lower silver rim", [0, y - height * 0.43, 0], radius * 1.035, 0.013, silver);
    b.ring(frame([0, y, 0], [0, 1, 0]), { radius, count: 8 }, (at) => {
      b.stick(new THREE.CylinderGeometry(0.007, 0.007, 0.007, 6), brass, at, {
        embed: 0.25, bone: root, name: "collar stud",
      });
    });
  }

  collar(0.34, 0.074, 0.054);
  collar(1.12, 0.079, 0.075);

  b.frustumBox([0, 1.15, 0], [0, 1.55, 0], [0.105, 0.105], [0.135, 0.125], {
    color: forged, bone: root, name: "tapered upper haft armor",
  });
  for (const face of [-1, 1]) {
    box("engraved haft recess", [0, 1.325, face * 0.064], [0.052, 0.29, 0.012], C.abyss);
    drawing("haft frost alphabet", smallRunes, [0, 1.325, face * 0.071], 0.039, 0.253, face, true);
    for (const x of [-0.044, 0.044]) {
      linework(
        "haft silver rails",
        [[x, 1.17, face * 0.059], [x * 1.27, 1.49, face * 0.067]],
        0.008, silver,
      );
    }
  }
  collar(1.505, 0.095, 0.09);

  // An asymmetric double crescent: a broad execution blade and smaller counterblade.
  const outerEdge = [
    [0.715, 2.125],
    [0.68, 1.925],
    [0.855, 1.705],
    [0.83, 1.465],
    [0.63, 1.205],
    [0.39, 1.085],
  ];
  const innerEdge = [
    [0.715, 2.125],
    [0.59, 1.915],
    [0.745, 1.7],
    [0.715, 1.52],
    [0.53, 1.29],
    [0.39, 1.085],
  ];
  const bladeCore = [
    [0.095, 1.86],
    [0.33, 1.915],
    ...innerEdge,
    [0.465, 1.36],
    [0.275, 1.48],
    [0.095, 1.485],
  ];
  const bladePanel = [
    [0.155, 1.815],
    [0.355, 1.865],
    [0.59, 1.98],
    [0.56, 1.9],
    [0.724, 1.69],
    [0.693, 1.535],
    [0.515, 1.325],
    [0.53, 1.415],
    [0.29, 1.55],
    [0.155, 1.55],
  ];
  const innerPanel = [
    [0.205, 1.787],
    [0.368, 1.825],
    [0.538, 1.899],
    [0.526, 1.867],
    [0.665, 1.68],
    [0.641, 1.56],
    [0.545, 1.446],
    [0.31, 1.598],
    [0.205, 1.598],
  ];

  function bladePoint(x: number, y: number, side: number): number[] {
    return side === 1
      ? [x, y]
      : [-x * 0.77, 1.715 + (y - 1.715) * 0.79];
  }

  // A six-station wedge built from flat facets. The outer edge is 8 mm thick,
  // while the inner shoulder joins the 145 mm thick forged core exactly.
  function cuttingWedge(side: number) {
    const vertices: number[] = [];
    const uvs: number[] = [];

    function triangle(a: number[], c: number[], d: number[]) {
      const ab = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
      const ac = new THREE.Vector3(d[0] - a[0], d[1] - a[1], d[2] - a[2]);
      if (ab.cross(ac).lengthSq() < 1e-14) return;
      for (const p of [a, c, d]) {
        vertices.push(...p);
        uvs.push(p[0], p[1]);
      }
    }

    function quad(a: number[], c: number[], d: number[], e: number[], reverse: boolean) {
      if (reverse) {
        triangle(a, d, c);
        triangle(a, e, d);
      } else {
        triangle(a, c, d);
        triangle(a, d, e);
      }
    }

    const inn = innerEdge.map(([x, y]) => bladePoint(x, y, side));
    const out = outerEdge.map(([x, y]) => bladePoint(x, y, side));
    for (let i = 0; i < inn.length - 1; i++) {
      const j = i + 1;
      for (const face of [-1, 1]) {
        quad(
          [...inn[i], face * 0.0725],
          [...out[i], face * 0.004],
          [...out[j], face * 0.004],
          [...inn[j], face * 0.0725],
          face * side > 0,
        );
      }
      quad(
        [...out[i], 0.004],
        [...out[i], -0.004],
        [...out[j], -0.004],
        [...out[j], 0.004],
        side > 0,
      );
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.computeVertexNormals();
    return b.part(geometry, edgeIce, {
      at: [0, 0, 0], bone: root, name: "true glacial cutting wedge",
    });
  }

  for (const side of [1, -1]) {
    const transform = (outline: number[][]) =>
      outline.map(([x, y]) => bladePoint(x, y, side));

    const core = plate("forged crescent core", transform(bladeCore), 0, 0.145, forged);
    cuttingWedge(side);

    for (const face of [1, -1]) {
      const rim = plate("raised blade perimeter", transform(bladePanel), face * 0.077, 0.024, silver, 0.006);
      const panel = plate("recessed dark blade field", transform(innerPanel), face * 0.092, 0.013, blackSteel, 0.004);
      const runeCenter = bladePoint(0.445, 1.71, side);

      drawing(
        "luminous elder frost rune",
        bladeRune,
        [runeCenter[0], runeCenter[1], face * 0.1015],
        side === 1 ? 0.205 : 0.158,
        side === 1 ? 0.285 : 0.225,
        face,
        true,
      );

      const etchingCenter = bladePoint(0.282, 1.714, side);
      drawing(
        "fine frost fern engraving",
        frostEtching,
        [etchingCenter[0], etchingCenter[1], face * 0.101],
        side === 1 ? 0.068 : 0.052,
        side === 1 ? 0.153 : 0.12,
        face,
      );

      const onFace = (points: number[][], z: number) =>
        points.map(([x, y]) => [...bladePoint(x, y, side), face * z]);

      linework(
        "old gold blade spine inlay",
        onFace([[0.285, 1.855], [0.366, 1.87], [0.56, 1.968]], 0.094),
        0.0055, brass,
      );

      // Light follows the actual sloping wedge at 32% of its width.
      const seamRoute: number[][] = [];
      for (let i = 1; i < innerEdge.length - 1; i++) {
        const x = innerEdge[i][0] * 0.68 + outerEdge[i][0] * 0.32;
        const y = innerEdge[i][1] * 0.68 + outerEdge[i][1] * 0.32;
        seamRoute.push([...bladePoint(x, y, side), face * 0.0525]);
      }
      linework("glacial edge light seam", seamRoute, 0.004, C.light, true);

      // Sparse angular frost fissures frame the rune rather than covering it.
      const fissures = [
        [[0.611, 1.79], [0.581, 1.762], [0.595, 1.72], [0.564, 1.679]],
        [[0.581, 1.762], [0.55, 1.773], [0.539, 1.795]],
        [[0.595, 1.72], [0.622, 1.701]],
        [[0.59, 1.534], [0.571, 1.566], [0.537, 1.589]],
      ];
      for (const route of fissures) {
        linework("frost fissure", onFace(route, 0.1015), 0.0022, "#77c7dc");
      }

      // Surface-seated fasteners replace the formerly floating rivets.
      const support = b.surface([core, rim, panel]);
      for (const [x, y] of [
        [0.202, 1.817],
        [0.328, 1.842],
        [0.27, 1.571],
        [0.554, 1.469],
        [0.678, 1.67],
      ]) {
        const p = bladePoint(x, y, side);
        const hit = support.ray([p[0], p[1], face * 0.4], [0, 0, -face]);
        if (!hit) continue;
        const radius = side === 1 ? 0.012 : 0.01;
        b.stick(
          new THREE.CylinderGeometry(radius * 1.45, radius * 1.45, 0.007, 8),
          C.abyss,
          hit,
          { embed: 0.18, bone: root, name: "seated blade rivet washer" },
        );
        b.stick(
          new THREE.CylinderGeometry(radius, radius, 0.012, 6),
          silver,
          hit.moved([0, 0.004, 0]),
          { embed: 0.12, bone: root, name: "seated hammered blade rivet" },
        );
      }
    }

    for (let j = 0; j < 3; j++) {
      const a = bladePoint(0.29 + j * 0.065, 1.48 - j * 0.039, side);
      crystal(
        "frozen blade heel",
        [a[0], a[1], -0.005],
        [a[0] + side * 0.018, a[1] - 0.075 - j * 0.02, 0.005],
        0.018 + j * 0.004,
        edgeIce,
      );
    }
  }

  // Armored socket and captive glacial heart.
  plate(
    "central black iron socket",
    [
      [-0.09, 1.995], [0.09, 1.995], [0.151, 1.864], [0.137, 1.566],
      [0.074, 1.466], [-0.074, 1.466], [-0.137, 1.566], [-0.151, 1.864],
    ],
    0, 0.226, blackSteel, 0.018,
  );

  for (const face of [1, -1]) {
    const z = face * 0.128;
    plate(
      "socket silver escutcheon",
      [
        [-0.075, 1.946], [0.075, 1.946], [0.109, 1.84], [0.094, 1.598],
        [0, 1.493], [-0.094, 1.598], [-0.109, 1.84],
      ],
      z, 0.022, silver, 0.007,
    );
    plate(
      "heart setting dark enamel",
      [[0, 1.935], [0.091, 1.815], [0.075, 1.615], [0, 1.533], [-0.075, 1.615], [-0.091, 1.815]],
      z + face * 0.018, 0.018, C.abyss, 0.004,
    );
    drawing(
      "snowflake binding seal", heartSeal,
      [0, 1.756, z + face * 0.031], 0.16, 0.247, face, true,
    );
    plate(
      "heart gold bezel",
      [[0, 1.844], [0.062, 1.743], [0, 1.634], [-0.062, 1.743]],
      z + face * 0.042, 0.025, brass, 0.005,
    );

    glow(
      b.part(new THREE.OctahedronGeometry(1, 0), C.cyan, {
        at: [0, 1.742, z + face * 0.064],
        scale: [0.052, 0.094, 0.045],
        bone: root,
        name: "captive glacial heart",
        flat: true,
      }),
      0.75,
    );

    // Fine geometry follows one gemstone facet, not a flat floating overlay.
    linework(
      "heart facet glint",
      [
        [0, 1.827, z + face * 0.069],
        [-0.025, 1.753, z + face * 0.088],
        [0, 1.658, z + face * 0.069],
      ],
      0.0025, C.light, true,
    );

    for (const side of [-1, 1]) {
      const sx = (x: number) => x * side;
      plate(
        "angular socket wing",
        [
          [sx(0.06), 1.836], [sx(0.188), 1.864], [sx(0.23), 1.802],
          [sx(0.113), 1.714], [sx(0.097), 1.609], [sx(0.055), 1.666],
        ],
        z + face * 0.019, 0.04, forged, 0.008,
      );
      linework(
        "socket wing silver crest",
        [
          [sx(0.08), 1.843, z + face * 0.044],
          [sx(0.182), 1.856, z + face * 0.044],
          [sx(0.215), 1.807, z + face * 0.044],
        ],
        0.008, silver,
      );
      rivet(sx(0.164), 1.811, z + face * 0.041, 0.012);
    }
    rivet(0, 1.912, z + face * 0.029, 0.014);
    rivet(0, 1.565, z + face * 0.029, 0.011);
  }

  collar(1.985, 0.105, 0.067);
  crystal("steel crown spike", [0, 1.997, 0], [0, 2.25, 0], 0.075, silver);
  crystal("ice crown front facet", [0, 2.023, 0.055], [0, 2.219, 0.015], 0.033, ice);
  linework(
    "crown slit of light",
    [[0, 2.036, 0.087], [0, 2.105, 0.065], [0, 2.2, 0.026]],
    0.005, C.light, true,
  );

  for (const side of [-1, 1]) {
    crystal(
      "shoulder crystal primary",
      [side * 0.12, 1.877, -0.015],
      [side * 0.25, 2.08, -0.035],
      0.049,
    );
    crystal(
      "shoulder crystal secondary",
      [side * 0.19, 1.893, 0.006],
      [side * 0.35, 2.035, 0.01],
      0.034, edgeIce,
    );
    crystal(
      "shoulder crystal small",
      [side * 0.105, 1.935, 0.012],
      [side * 0.16, 2.09, 0.04],
      0.025,
    );
    crystal(
      "socket frost shard",
      [side * 0.08, 1.558, -0.073],
      [side * 0.137, 1.385, -0.09],
      0.024, edgeIce,
    );
  }

  // Small warm-metal details and the oath token give the weapon a human history.
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    b.part(new THREE.TorusGeometry(0.015, 0.0035, 4, 8), silver, {
      at: [0.077 + 0.077 * Math.sin(t * Math.PI / 2), 1.142 - t * 0.15, 0.026],
      rotation: [0, i % 2 === 0 ? 0 : 70, -24],
      bone: root,
      name: "trophy chain link",
    });
  }
  linework(
    "trophy chain core",
    [[0.072, 1.145, 0.015], [0.117, 1.105, 0.018], [0.144, 1.05, 0.025], [0.154, 0.989, 0.029]],
    0.002, C.dark,
  );
  plate(
    "small oath token",
    [[0.154, 1.0], [0.184, 0.965], [0.154, 0.901], [0.124, 0.965]],
    0.027, 0.026, silver, 0.004,
  );
  glow(
    plate(
      "oath token cyan inset",
      [[0.154, 0.985], [0.172, 0.961], [0.154, 0.92], [0.136, 0.961]],
      0.044, 0.006, C.cyan,
    ),
    0.65,
  );

  b.sweep(
    spiral([0, 1.091, 0], [0.068, 1.091, 0], [0, 1, 0], {
      turns: 1.7, pitch: 0.018,
    }),
    0.0035,
    {
      color: brass, sides: 5, bone: root,
      name: "forgemaster binding wire",
    },
  );

  return b.root;
}
```