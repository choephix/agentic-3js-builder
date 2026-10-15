```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  svg,
  type Fill,
  type Joint,
} from "agentic-3js-builder";
import {
  pixelTexture,
  tileBox,
  cellPaint,
  type PixelGrid,
} from "agentic-3js-builder/kits/pixel";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "BYTE CRUSHER",
  description:
    "An orange and cyan pixel-art monster truck with enormous block-tread tyres, deep racing wheels, exposed suspension, checkerboard livery and a toothy illuminated grille.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "BYTE_CRUSHER", paintSize: 2048 });
  const random = rng(808);

  const C = {
    ink: "#141928",
    rubber: "#242936",
    rubberLight: "#454b59",
    steel: "#6d8192",
    steelLight: "#c2d9df",
    cyan: "#28cbd1",
    cyanLight: "#a6fff0",
    cyanDark: "#126477",
    orange: "#f87529",
    orangeLight: "#ffb84e",
    orangeDark: "#a53626",
    cream: "#fff0bc",
    red: "#ff414e",
    glass: "#172c4c",
  };

  // Deliberately small bitmap alphabet: the labels are drawings, not
  // antialiased typography.
  const alphabet: Record<string, string[]> = {
    A: ["01110", "11011", "11011", "11111", "11011", "11011", "11011"],
    B: ["11110", "11011", "11011", "11110", "11011", "11011", "11110"],
    C: ["01111", "11000", "11000", "11000", "11000", "11000", "01111"],
    D: ["11110", "11011", "11011", "11011", "11011", "11011", "11110"],
    E: ["11111", "11000", "11000", "11110", "11000", "11000", "11111"],
    G: ["01111", "11000", "11000", "11011", "11011", "11011", "01111"],
    H: ["11011", "11011", "11011", "11111", "11011", "11011", "11011"],
    I: ["111", "010", "010", "010", "010", "010", "111"],
    M: ["10001", "11011", "11111", "10101", "10001", "10001", "10001"],
    N: ["11001", "11101", "11101", "11011", "11011", "11011", "11001"],
    O: ["01110", "11011", "11011", "11011", "11011", "11011", "01110"],
    R: ["11110", "11011", "11011", "11110", "11100", "11010", "11011"],
    S: ["01111", "11000", "11000", "01110", "00011", "00011", "11110"],
    T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    U: ["11011", "11011", "11011", "11011", "11011", "11011", "01110"],
    X: ["11011", "11011", "01110", "00100", "01110", "11011", "11011"],
    Y: ["11011", "11011", "01110", "00100", "00100", "00100", "00100"],
    "0": ["01110", "11011", "11011", "11011", "11011", "11011", "01110"],
    "8": ["01110", "11011", "11011", "01110", "11011", "11011", "01110"],
    "4": ["10010", "10010", "10010", "11111", "00010", "00010", "00010"],
    " ": ["000", "000", "000", "000", "000", "000", "000"],
    "-": ["000", "000", "000", "111", "000", "000", "000"],
  };

  function text(
    g: PixelGrid,
    label: string,
    x: number,
    y: number,
    color: string,
    scale = 1,
  ) {
    let cursor = x;
    for (const ch of label) {
      const glyph = alphabet[ch] ?? alphabet[" "];
      glyph.forEach((row, j) => {
        [...row].forEach((bit, i) => {
          if (bit === "1") {
            for (let u = 0; u < scale; u++) {
              for (let v = 0; v < scale; v++) {
                g.set(cursor + i * scale + u, y + j * scale + v, color);
              }
            }
          }
        });
      });
      cursor += (glyph[0].length + 1) * scale;
    }
  }

  const orangeTexture = pixelTexture(128, 64, (g) => {
    g.fill((_x, y) => (y < 8 ? C.orangeLight : y > 57 ? C.orangeDark : C.orange));
    for (let i = 0; i < 150; i++) {
      const x = Math.floor(random() * 124);
      const y = Math.floor(random() * 62);
      const w = 1 + Math.floor(random() * 4);
      for (let k = 0; k < w; k++) {
        g.set(x + k, y, i % 4 === 0 ? "#d85527" : "#ff9236");
      }
    }
    for (let x = 3; x < 128; x += 24) {
      g.set(x, 3, C.cream);
      g.set(x, 60, C.orangeDark);
    }
  });

  const metalTexture = pixelTexture(64, 64, (g) => {
    g.fill((x, y) => {
      if (y % 16 === 0) return "#101823";
      if (y % 16 === 1) return "#4c6272";
      return (x + 3 * y) % 23 === 0 ? "#536b79" : "#2d3d4c";
    });
    for (let y = 4; y < 64; y += 16) {
      for (let x = 4; x < 64; x += 16) {
        g.set(x, y, C.steelLight);
        g.set(x + 1, y + 1, C.ink);
      }
    }
  });

  const glassTexture = pixelTexture(64, 32, (g) => {
    g.fill((x, y) => {
      const diagonal = x + y;
      if (x < 2 || x > 61 || y < 2 || y > 29) return C.ink;
      if (y === 2 || x === 2) return "#537e9a";
      if (diagonal > 18 && diagonal < 25) return "#73d1dc";
      if (diagonal >= 25 && diagonal < 29) return "#3e869f";
      if (diagonal > 49 && diagonal < 52) return "#467f9c";
      return y > 23 ? "#10233e" : y < 9 ? "#315572" : C.glass;
    });
  });

  const liveryTexture = pixelTexture(128, 16, (g) => {
    g.fill((_x, y) => (y < 2 ? C.orangeLight : y > 13 ? C.orangeDark : C.orange));
    for (let x = 0; x < 128; x++) {
      for (let y = 3; y < 13; y++) {
        if (x > 17 && x < 104) g.set(x, y, C.ink);
      }
    }
    for (let x = 0; x < 16; x++) {
      for (let y = 2; y < 14; y++) {
        g.set(x, y, ((x >> 2) + (y >> 2)) % 2 ? C.cream : C.ink);
      }
    }
    text(g, "BYTE CRUSHER", 21, 5, C.cyanLight);
    text(g, "08", 110, 4, C.cream);
    for (let x = 18; x < 104; x++) {
      g.set(x, 3, C.cyan);
      g.set(x, 12, C.cyanDark);
    }
  });

  const hoodTexture = pixelTexture(40, 40, (g) => {
    // A chunky arcade-monster emblem.
    g.fill(() => C.ink);
    for (let y = 2; y < 38; y++) {
      for (let x = 2; x < 38; x++) {
        if (x === 2 || x === 37 || y === 2 || y === 37) {
          g.set(x, y, C.orangeLight);
        }
      }
    }
    const monster = [
      "...##......##...",
      "...###....###...",
      "....########....",
      "..############..",
      ".##############.",
      ".##..######..##.",
      ".##...####...##.",
      ".####..##..####.",
      ".##############.",
      "...##########...",
      "...##.#..#.##...",
      "....#.#..#.#....",
    ];
    g.stamp(4, 7, monster.map((r) => r.replaceAll("#", "c")), { c: C.cyan });
    // Mirror-size expansion preserves exact square texels.
    monster.forEach((row, y) => {
      [...row].forEach((v, x) => {
        if (v === "#") {
          g.set(4 + x * 2, 7 + y * 2, C.cyan);
          g.set(5 + x * 2, 7 + y * 2, C.cyan);
          g.set(4 + x * 2, 8 + y * 2, C.cyan);
          g.set(5 + x * 2, 8 + y * 2, C.cyan);
        }
      });
    });
    for (const x of [11, 25]) {
      for (let u = 0; u < 4; u++) {
        for (let v = 0; v < 3; v++) g.set(x + u, 18 + v, C.cream);
      }
    }
    for (let x = 7; x < 34; x++) g.set(x, 34, C.orange);
  });

  const hazardTexture = pixelTexture(64, 8, (g) => {
    g.fill((x, y) => (((x + y) >> 2) % 2 ? C.ink : C.orangeLight));
    for (let x = 0; x < 64; x++) {
      g.set(x, 0, C.steelLight);
      g.set(x, 7, C.ink);
    }
  });

  const sidewallTexture = pixelTexture(64, 64, (g) => {
    g.fill((x, y) => {
      const r = Math.hypot(x - 31.5, y - 31.5);
      if (r < 18.4 || r > 30.5) return "";
      if (r > 29.2 || r < 19.4) return "#565c66";
      if (r > 27.7 && r < 28.8) return "#101521";
      if ((Math.floor(Math.atan2(y - 31.5, x - 31.5) * 11) & 1) && r > 25.5) {
        return "#414754";
      }
      return "#282e3a";
    });
    text(g, "MEGA", 20, 7, "#a4a9ac");
    text(g, "X", 8, 28, "#a4a9ac");
    text(g, "X", 51, 28, "#a4a9ac");
    text(g, "08", 27, 49, "#a4a9ac");
  });

  const plateTexture = pixelTexture(48, 12, (g) => {
    g.fill((x, y) => (x === 0 || x === 47 || y === 0 || y === 11 ? C.cyan : C.ink));
    text(g, "BYTE-08", 4, 3, C.cream);
  });

  const lensTexture = pixelTexture(16, 12, (g) => {
    g.fill((x, y) => {
      if (x === 0 || x === 15 || y === 0 || y === 11) return "#966d3a";
      if (x < 3 || y < 3) return "#ffffff";
      if (x % 4 === 0) return "#ffe6a0";
      return "#fff8d4";
    });
  });

  const rubber = cellPaint(0.042, (c) => {
    const a = c.random(8);
    if (a < 0.055) return "#414856";
    return c.pick(["#171d29", "#252c39", "#353d49"], 0.38 + c.n.y * 0.20 + a * 0.22);
  });

  const treadPaint = cellPaint(0.043, (c) =>
    c.pick(["#181e2a", "#2c3441", "#434b57"], 0.35 + c.n.y * 0.24 + c.random(15) * 0.2),
  );

  const metalPaint = cellPaint(0.035, (c) =>
    c.pick(["#334554", "#6d8393", "#b5d1d8"], 0.48 + c.n.y * 0.28 + c.random(4) * 0.14),
  );

  const root = b.joint("chassis", { at: [0, 1.58, 0] });

  const wheelSpecs = [
    { name: "wheelFL", s: 1, z: 1.65 },
    { name: "wheelFR", s: -1, z: 1.65 },
    { name: "wheelRL", s: 1, z: -1.65 },
    { name: "wheelRR", s: -1, z: -1.65 },
  ];
  const wheels = wheelSpecs.map((w) => ({
    ...w,
    bone: b.joint(w.name, {
      parent: root,
      at: [w.s * 1.65, 1.04, w.z],
      dir: [w.s, 0, 0],
      role: "hinge",
    }),
  }));

  function box(
    at: number[],
    size: number[],
    color: Fill,
    bone: Joint = root,
    rotation: number[] = [0, 0, 0],
    name = "block",
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at, bone, rotation, name,
    });
  }

  function tiledBox(
    at: number[],
    size: number[],
    texture: THREE.Texture,
    texel = 0.035,
    name = "paintedPanel",
  ) {
    return b.part(tileBox(size, texture, texel, { rand: random }), "#ffffff", {
      at, bone: root, texture, name,
    });
  }

  function plate(
    at: number[],
    width: number,
    height: number,
    texture: THREE.Texture,
    normal: number[],
    bone: Joint = root,
    name = "pixelDecal",
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at, bone, texture, dir: normal, axis: "z", name,
    });
  }

  function cylinder(
    at: number[],
    radius: number,
    length: number,
    color: Fill,
    normal: number[],
    bone: Joint = root,
    sides = 12,
    name = "fitting",
  ) {
    return b.part(new THREE.CylinderGeometry(radius, radius, length, sides), color, {
      at, dir: normal, bone, name,
    });
  }

  function rod(a: number[], c: number[], r: number, color: Fill, name: string) {
    return b.rod(a, c, r, { bone: root, color, sides: 6, name });
  }

  function texturedQuad(
    points: number[][],
    texture: THREE.Texture,
    reverse = false,
    name = "window",
  ) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(points.flat(), 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
    geo.setIndex(reverse ? [0, 2, 1, 0, 3, 2] : [0, 1, 2, 0, 2, 3]);
    geo.computeVertexNormals();
    return b.part(geo, "#ffffff", {
      at: [0, 0, 0], bone: root, texture, name,
    });
  }

  // The enormous wheels establish the silhouette. Sixteen broad facets,
  // staggered tread bricks and deliberately flat tyre shoulders.
  for (const w of wheels) {
    const { s, z, bone } = w;
    const x = s * 1.65;

    b.lathe(
      [
        [0.475, -0.40],
        [0.80, -0.40],
        [0.94, -0.27],
        [0.96, -0.14],
        [0.96, 0.14],
        [0.94, 0.27],
        [0.80, 0.40],
        [0.475, 0.40],
      ],
      {
        at: [x, 1.04, z],
        axis: [s, 0, 0],
        segments: 16,
        color: rubber,
        bone,
        name: `${w.name}_rubberCarcass`,
      },
    );

    for (let i = 0; i < 16; i++) {
      for (const lane of [-1, 1]) {
        const a = (i + (lane > 0 ? 0.22 : -0.22)) * Math.PI / 8;
        box(
          [x + lane * 0.225, 1.04 + Math.cos(a) * 0.985, z + Math.sin(a) * 0.985],
          [0.39, 0.11, 0.29],
          treadPaint,
          bone,
          [a * 180 / Math.PI, 0, 0],
          `${w.name}_tread${i}_${lane > 0 ? "A" : "B"}`,
        );
      }
    }

    // Inboard wheel disc and the axle sleeve remain visible from beneath.
    cylinder([x - s * 0.36, 1.04, z], 0.48, 0.10, C.ink, [s, 0, 0], bone);
    cylinder([x - s * 0.41, 1.04, z], 0.21, 0.18, metalPaint, [s, 0, 0], bone);

    plate(
      [x + s * 0.407, 1.04, z],
      1.68, 1.68, sidewallTexture, [s, 0, 0], bone,
      `${w.name}_raisedPixelLettering`,
    );

    cylinder([x + s * 0.385, 1.04, z], 0.49, 0.13, C.cyan, [s, 0, 0], bone, 12);
    cylinder([x + s * 0.456, 1.04, z], 0.415, 0.025, C.ink, [s, 0, 0], bone, 12);
    cylinder([x + s * 0.477, 1.04, z], 0.35, 0.036, C.cyanDark, [s, 0, 0], bone, 12);

    for (let k = 0; k < 6; k++) {
      const a = k * Math.PI / 3;
      box(
        [x + s * 0.505, 1.04 + Math.cos(a) * 0.25, z + Math.sin(a) * 0.25],
        [0.055, 0.29, 0.105],
        C.cyan,
        bone,
        [a * 180 / Math.PI, 0, 0],
        `${w.name}_spoke${k}`,
      );
      cylinder(
        [x + s * 0.538, 1.04 + Math.cos(a) * 0.145, z + Math.sin(a) * 0.145],
        0.028, 0.032, C.cream, [s, 0, 0], bone, 6,
        `${w.name}_lug${k}`,
      );
    }

    cylinder([x + s * 0.52, 1.04, z], 0.105, 0.12, metalPaint, [s, 0, 0], bone, 8);
    cylinder([x + s * 0.586, 1.04, z], 0.071, 0.018, C.ink, [s, 0, 0], bone, 8);
    box([x + s * 0.60, 1.04, z], [0.018, 0.057, 0.057], C.orangeLight, bone);
  }

  // Ladder chassis, differential pumpkins, links, shocks and pixel springs.
  for (const s of [-1, 1]) {
    tiledBox([s * 0.69, 1.61, 0], [0.19, 0.24, 4.15], metalTexture, 0.035, "ladderRail");
    box([s * 0.73, 1.76, 0], [0.10, 0.065, 4.21], C.cyanDark);
  }

  for (const z of [-1.65, 1.65]) {
    rod([-1.5, 1.04, z], [1.5, 1.04, z], 0.115, metalPaint, "solidAxle");
    b.part(new THREE.IcosahedronGeometry(0.29, 0), C.ink, {
      at: [0, 1.04, z], scale: [1.2, 0.95, 0.9], bone: root, name: "differential",
    });
    cylinder([0, 1.04, z + 0.24], 0.18, 0.055, metalPaint, [0, 0, 1], root, 8);

    rod([0, 1.10, z], [0, 1.48, 0], 0.072, metalPaint, "driveshaft");
    box([0, 1.62, z * 0.77], [1.55, 0.17, 0.16], C.ink);

    for (const s of [-1, 1]) {
      rod([s * 0.34, 1.57, z * 0.35], [s * 1.20, 1.08, z], 0.055, C.cyan, "trailingLink");
      rod([s * 0.75, 1.66, z * 0.57], [s * 1.23, 1.14, z], 0.047, C.cyanDark, "upperLink");

      const lo = new THREE.Vector3(s * 1.08, 1.19, z);
      const hi = new THREE.Vector3(s * 0.93, 2.02, z * 0.79);
      const axis = hi.clone().sub(lo);
      b.rod(lo, hi, 0.035, { color: C.steelLight, bone: root, sides: 8, name: "shockRod" });
      b.rod(lo.clone().lerp(hi, 0.48), hi, 0.071, {
        color: C.orange, bone: root, sides: 8, name: "shockBody",
      });

      for (let k = 0; k < 6; k++) {
        const at = lo.clone().lerp(hi, 0.13 + k * 0.135);
        b.part(new THREE.TorusGeometry(0.104, 0.024, 4, 8), C.cyan, {
          at, bone: root, dir: axis, axis: "z", name: "squareSectionSpring",
        });
      }
      cylinder(lo.toArray(), 0.10, 0.16, C.ink, [1, 0, 0], root, 8);
      cylinder(hi.toArray(), 0.10, 0.16, C.ink, [1, 0, 0], root, 8);
    }
  }

  tiledBox([0, 1.70, 0.18], [1.03, 0.43, 1.08], metalTexture, 0.035, "engineSump");
  box([0, 1.40, 0.27], [0.81, 0.10, 1.0], C.steel);
  for (const z of [-0.10, 0.18, 0.46]) {
    box([0, 1.345, z], [0.86, 0.03, 0.055], C.ink);
  }

  // Long, simple truck body; the contrasting underside gives the shell
  // a strong separation from its high, open suspension.
  box([0, 1.96, 0.03], [2.23, 0.13, 4.50], C.ink);
  tiledBox([0, 2.245, 0.03], [2.20, 0.49, 4.48], orangeTexture);
  box([0, 2.022, 0.03], [2.25, 0.055, 4.52], C.cyan);

  for (const s of [-1, 1]) {
    plate([s * 1.106, 2.252, 0.03], 4.35, 0.544, liveryTexture, [s, 0, 0], root, "sideRaceLivery");
    box([s * 1.16, 1.86, 0.05], [0.24, 0.10, 1.07], C.ink);
    box([s * 1.20, 1.92, 0.05], [0.23, 0.035, 0.96], C.steel);
    for (const z of [-0.29, -0.07, 0.15, 0.37]) {
      box([s * 1.21, 1.943, z], [0.22, 0.014, 0.054], C.ink);
    }

    // Short angular fenders do not hide the huge tyres.
    for (const z of [-1.65, 1.65]) {
      for (const aDeg of [-43, 0, 43]) {
        const a = aDeg * Math.PI / 180;
        const at = [s * 1.45, 1.04 + 1.16 * Math.cos(a), z + 1.16 * Math.sin(a)];
        box(at, [0.66, 0.10, 0.75], C.ink, root, [aDeg, 0, 0], "angularFender");
        box(
          [at[0], at[1] + Math.cos(a) * 0.059, at[2] + Math.sin(a) * 0.059],
          [0.65, 0.035, 0.68],
          C.orange,
          root,
          [aDeg, 0, 0],
          "fenderPaint",
        );
      }
    }
  }

  // Cab: an extruded trapezoid remains intentionally block-built.
  b.extrude(
    [
      [-0.89, 0],
      [1.01, 0],
      [0.67, 0.84],
      [-0.73, 0.84],
    ],
    {
      at: [0, 2.49, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 2.12,
      color: C.orange,
      bone: root,
      name: "cabShell",
    },
  );

  // Oversized windscreen, bordered by thick orange pillars.
  texturedQuad(
    [
      [-0.94, 2.66, 0.944],
      [0.94, 2.66, 0.944],
      [0.94, 3.245, 0.707],
      [-0.94, 3.245, 0.707],
    ],
    glassTexture,
    false,
    "frontWindscreen",
  );
  rod([0, 2.65, 0.958], [0, 3.25, 0.715], 0.025, C.ink, "windscreenDivider");

  for (const s of [-1, 1]) {
    texturedQuad(
      [
        [s * 1.067, 2.65, 0.80],
        [s * 1.067, 2.65, -0.70],
        [s * 1.067, 3.235, -0.60],
        [s * 1.067, 3.235, 0.56],
      ],
      glassTexture,
      s < 0,
      "sideWindow",
    );
    box([s * 1.075, 2.94, -0.22], [0.036, 0.61, 0.085], C.ink, root, [0, 0, 0], "windowPillar");
    box([s * 1.084, 2.61, -0.39], [0.055, 0.055, 0.24], C.ink, root, [0, 0, 0], "doorHandle");
    box([s * 1.117, 2.62, -0.40], [0.015, 0.018, 0.13], C.steelLight);

    rod([s * 1.03, 2.77, 0.68], [s * 1.35, 2.80, 0.77], 0.035, C.ink, "mirrorArm");
    box([s * 1.38, 2.85, 0.76], [0.17, 0.26, 0.22], C.ink, root, [0, 0, 0], "mirrorHousing");
    box([s * 1.38, 2.85, 0.643], [0.13, 0.20, 0.015], C.steelLight);
    box([s * 1.38, 2.84, 0.881], [0.13, 0.16, 0.025], C.orange);
  }

  // Windscreen wipers, seated on the lower glass rather than floating.
  for (const s of [-1, 1]) {
    rod([s * 0.55, 2.675, 0.954], [s * 0.19, 2.74, 0.927], 0.016, C.ink, "wiperArm");
    rod([s * 0.19, 2.74, 0.927], [s * 0.69, 2.81, 0.899], 0.020, C.ink, "wiperBlade");
  }

  tiledBox([0, 3.36, -0.03], [2.22, 0.12, 1.55], orangeTexture, 0.035, "cabRoof");
  box([0, 3.285, 0.745], [2.24, 0.055, 0.18], C.ink, root, [0, 0, 0], "sunVisor");
  box([0, 3.33, 0.78], [2.18, 0.035, 0.13], C.cyan);
  box([0, 3.425, -0.05], [0.28, 0.012, 1.42], C.ink);
  for (const s of [-1, 1]) {
    box([s * 0.21, 3.425, -0.05], [0.065, 0.012, 1.42], C.cream);
  }

  // Roof-mounted square rally lights.
  box([0, 3.47, 0.38], [1.63, 0.09, 0.13], C.ink);
  for (const x of [-0.62, -0.21, 0.21, 0.62]) {
    box([x, 3.58, 0.40], [0.28, 0.24, 0.18], C.ink);
    box([x, 3.58, 0.498], [0.24, 0.20, 0.025], C.steel);
    glow(plate([x, 3.58, 0.514], 0.205, 0.154, lensTexture, [0, 0, 1], root, "roofLamp"), 0.8);
  }

  // Short hood with two bold stripes and an arcade-monster badge.
  tiledBox([0, 2.565, 1.70], [2.18, 0.18, 1.39], orangeTexture, 0.035, "hood");
  box([0, 2.663, 1.70], [0.85, 0.015, 1.32], C.ink);
  for (const s of [-1, 1]) {
    box([s * 0.49, 2.666, 1.70], [0.10, 0.014, 1.32], C.cream);
    for (let k = 0; k < 4; k++) {
      box([s * 0.83, 2.667, 1.30 + k * 0.16], [0.27, 0.021, 0.055], C.ink);
    }
    box([s * 0.79, 2.682, 2.22], [0.09, 0.025, 0.09], C.steelLight);
  }
  plate([0, 2.677, 1.70], 0.80, 0.80, hoodTexture, [0, 1, 0], root, "hoodMonster");

  // Front face: rectangular lamps, a deep radiator and square teeth.
  box([0, 2.34, 2.31], [2.22, 0.55, 0.16], C.orangeDark, root, [0, 0, 0], "frontFascia");
  box([0, 2.34, 2.407], [1.17, 0.40, 0.055], C.steel);
  box([0, 2.34, 2.442], [1.06, 0.32, 0.025], C.ink);

  for (let k = 0; k < 7; k++) {
    box([-0.45 + k * 0.15, 2.34, 2.461], [0.025, 0.27, 0.020], C.cyanDark);
  }
  for (let k = 0; k < 5; k++) {
    const x = -0.40 + k * 0.20;
    box([x, 2.425, 2.478], [0.11, 0.105, 0.030], C.cream, root, [0, 0, 0], "upperGrilleTooth");
    box([x, 2.245, 2.478], [0.11, 0.070, 0.030], C.cream, root, [0, 0, 0], "lowerGrilleTooth");
  }

  for (const s of [-1, 1]) {
    box([s * 0.86, 2.37, 2.41], [0.43, 0.34, 0.10], C.ink);
    box([s * 0.86, 2.37, 2.468], [0.37, 0.28, 0.025], C.steelLight);
    glow(plate([s * 0.86, 2.37, 2.485], 0.32, 0.24, lensTexture, [0, 0, 1], root, "headlight"), 0.8);
    glow(box([s * 0.92, 2.13, 2.435], [0.23, 0.075, 0.035], "#ffad39"), 0.6);
  }

  box([0, 1.97, 2.49], [2.48, 0.22, 0.27], C.ink, root, [0, 0, 0], "frontBumper");
  plate([0, 1.98, 2.632], 2.25, 0.281, hazardTexture, [0, 0, 1], root, "frontHazardStripe");
  box([0, 1.88, 2.658], [0.72, 0.22, 0.09], C.ink, root, [0, 0, 0], "frontPlateBracket");
  plate([0, 1.88, 2.708], 0.66, 0.165, plateTexture, [0, 0, 1], root, "frontRegistration");

  for (const s of [-1, 1]) {
    box([s * 0.77, 1.82, 2.49], [0.17, 0.19, 0.13], C.cyan);
    box([s * 0.77, 1.79, 2.565], [0.075, 0.09, 0.04], C.ink);
  }

  // Open pickup bed, corrugated floor and chunky protective rails.
  tiledBox([0, 2.51, -1.58], [1.91, 0.08, 1.16], metalTexture, 0.035, "bedFloor");
  for (const x of [-0.72, -0.48, -0.24, 0, 0.24, 0.48, 0.72]) {
    box([x, 2.567, -1.59], [0.055, 0.035, 1.08], C.ink);
  }
  for (const s of [-1, 1]) {
    tiledBox([s * 1.015, 2.66, -1.58], [0.16, 0.30, 1.26], orangeTexture);
    box([s * 1.02, 2.825, -1.58], [0.22, 0.055, 1.34], C.ink);
    box([s * 1.02, 2.858, -1.58], [0.14, 0.015, 1.28], C.cyan);
  }
  tiledBox([0, 2.66, -2.185], [2.18, 0.30, 0.15], orangeTexture);
  box([0, 2.825, -2.19], [2.22, 0.055, 0.21], C.ink);

  // Rear cab window and squared-off roll hoop.
  texturedQuad(
    [
      [0.86, 2.70, -0.857],
      [-0.86, 2.70, -0.857],
      [-0.86, 3.17, -0.768],
      [0.86, 3.17, -0.768],
    ],
    glassTexture,
    false,
    "rearCabWindow",
  );
  for (const s of [-1, 1]) {
    box([s * 0.85, 2.91, -1.035], [0.13, 0.83, 0.13], C.ink);
    box([s * 0.855, 3.07, -1.04], [0.145, 0.13, 0.145], C.cyan);
    rod([s * 0.85, 3.21, -1.04], [s * 0.86, 2.68, -1.95], 0.061, C.ink, "rollCageBrace");
  }
  box([0, 3.32, -1.035], [1.83, 0.13, 0.13], C.ink);
  box([0, 3.395, -1.035], [1.66, 0.025, 0.13], C.cyan);

  // Twin square exhaust stacks behind the cab, with hollow-looking mouths.
  for (const s of [-1, 1]) {
    box([s * 0.67, 2.85, -1.22], [0.17, 0.64, 0.18], C.steel);
    box([s * 0.67, 3.19, -1.22], [0.23, 0.08, 0.24], C.ink);
    box([s * 0.67, 3.235, -1.22], [0.17, 0.012, 0.18], C.rubber);
    for (const y of [2.63, 2.91]) {
      box([s * 0.67, y, -1.22], [0.20, 0.055, 0.21], C.ink);
    }
    for (let i = 0; i < 4; i++) {
      box([s * 0.764, 2.69 + i * 0.10, -1.22], [0.012, 0.035, 0.09], C.ink);
    }
  }

  // Rear details are finished, too: tail lamps, tailgate seams and a plate.
  box([0, 2.28, -2.272], [1.47, 0.35, 0.025], C.orangeDark);
  plate([0, 2.29, -2.29], 1.25, 0.3125, plateTexture, [0, 0, -1], root, "tailgateMark");
  box([0, 2.70, -2.273], [0.31, 0.067, 0.035], C.ink);

  for (const s of [-1, 1]) {
    box([s * 0.95, 2.32, -2.286], [0.22, 0.38, 0.08], C.ink);
    glow(box([s * 0.95, 2.40, -2.333], [0.16, 0.16, 0.025], C.red), 0.65);
    box([s * 0.95, 2.245, -2.333], [0.16, 0.10, 0.025], C.cream);
    box([s * 0.63, 2.06, -2.286], [0.27, 0.065, 0.045], C.steel);
  }

  box([0, 1.95, -2.38], [2.42, 0.20, 0.25], C.ink, root, [0, 0, 0], "rearBumper");
  plate([0, 1.95, -2.512], 2.14, 0.2675, hazardTexture, [0, 0, -1], root, "rearHazardStripe");
  box([0, 1.72, -2.38], [0.20, 0.28, 0.22], C.steel);
  box([0, 1.62, -2.51], [0.30, 0.12, 0.30], C.ink);

  return b.root;
}
```