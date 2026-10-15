1. **Make the koala softer and more expressive:** larger sparkling eyes, rounder stepped ears, a fuller cream bib, and a small closed mouth instead of the tooth-like horizontal bars.
2. **Quiet the pixel textures:** replace the high-contrast, all-over speckling with restrained wool shading and occasional clustered pixels. Keep the strongest contrast around the face.
3. **Improve the silhouette:** give the head and belly more depth, soften the shoulder blocks, and make the eucalyptus leaves longer and more characteristic.
4. **Fix the setting:** move the obscured nameplate outside the base, seat the pebbles on the soil, and simplify the bark into longer peeling patches.

```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  type Joint,
  type Paint,
} from "agentic-3js-builder";
import {
  pixelArt,
  pixelTexture,
  tileBox,
  cellPaint,
  stepped,
  pick,
} from "agentic-3js-builder/kits/pixel";

export const meta = {
  name: "Eucalyptus Cuddler",
  description:
    "A soft grey pixel-art koala gripping a forked eucalyptus stand, with oversized woolly ears, bright eyes, articulated paws and long blue-green leaves.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Eucalyptus Cuddler",
    paintSize: 2048,
  });
  const random = rng(82174);
  const P = 0.012;

  const GREY = [
    "#737f87",
    "#89969d",
    "#9eabb0",
    "#b1bcbf",
    "#c4ccca",
  ];
  const CREAM = [
    "#b4bcb2",
    "#cbd1c2",
    "#e2e4d3",
    "#f0eedb",
  ];
  const BARK = [
    "#857765",
    "#a49177",
    "#bda98a",
    "#d4c1a0",
    "#e4d4b5",
  ];
  const GREEN = [
    "#31594f",
    "#47766a",
    "#649481",
    "#89b09a",
    "#b2c8a9",
  ];
  const INK = "#1c2c37";
  const CLAW = "#dedbc9";

  // Skeleton first: the perch is static; the koala is fully articulated.
  const stand = b.joint("stand", { at: [0, 0, 0] });
  const hips = b.joint("hips", {
    parent: stand,
    at: [0, 0.56, 0],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [
      [0, 0.56, 0],
      [0, 0.73, 0],
      [0, 0.875, 0.012],
    ],
    {
      parent: hips,
      names: ["belly", "chest", "neck"],
      role: "spine",
    },
  );
  const head = b.joint("head", {
    parent: spine.tip!,
    at: [0, 1.005, 0.025],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.912, 0.105],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const ears = [-1, 1].map((s) =>
    b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: [s * 0.253, 1.045, 0.012],
      dir: [s, 0.15, 0],
      role: "hinge",
    }),
  );

  const limbs = [-1, 1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      [
        [s * 0.151, 0.822, 0.012],
        [s * 0.242, 0.75, 0.089],
        [s * 0.298, 0.783, 0.255],
      ],
      {
        parent: spine.joints[1],
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        role: "arm",
      },
    );
    const leg = b.chain(
      `leg${side}`,
      [
        [s * 0.125, 0.582, -0.005],
        [s * 0.211, 0.477, 0.065],
        [s * 0.174, 0.45, 0.26],
      ],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [s * 0.174, 0.424, 0.26],
      },
    );
    const fingers = Array.from({ length: 3 }, (_, j) => {
      const x = s * (0.268 + j * 0.028);
      return b.chain(
        `finger${side}${j + 1}`,
        [
          [x, 0.796, 0.292],
          [x, 0.773, 0.334],
          [x, 0.727, 0.325],
        ],
        { parent: arm.tip!, role: "digit", count: 2 },
      );
    });
    const thumb = b.chain(
      `thumb${side}`,
      [
        [s * 0.25, 0.787, 0.257],
        [s * 0.228, 0.763, 0.292],
        [s * 0.24, 0.733, 0.307],
      ],
      { parent: arm.tip!, role: "digit", count: 2 },
    );
    const toes = Array.from({ length: 3 }, (_, j) => {
      const x = s * (0.146 + j * 0.027);
      return b.chain(
        `toe${side}${j + 1}`,
        [
          [x, 0.465, 0.291],
          [x, 0.449, 0.337],
          [x, 0.414, 0.322],
        ],
        { parent: leg.tip!, role: "digit", count: 2 },
      );
    });
    return { s, arm, leg, fingers, thumb, toes };
  });

  // Restrained pixel fields: large quiet areas, not television-static fur.
  const fur = cellPaint(P, (c) => {
    const base = 0.5 + c.n.y * 0.17 + c.n.z * 0.08;
    const fleck = c.random(19);
    return c.pick(
      GREY,
      base + (fleck < 0.045 ? 0.13 : fleck > 0.975 ? -0.12 : 0),
    );
  });
  const wool = cellPaint(P, (c) =>
    c.pick(
      CREAM,
      0.66 + c.n.y * 0.16 + (c.random(3) > 0.94 ? -0.16 : 0),
    ),
  );
  const bark = cellPaint(P, (c) => {
    const stripe = Math.sin(c.u * 1.7 + Math.floor(c.v / 12) * 0.6);
    return c.pick(
      BARK,
      0.58 + stripe * 0.12 + c.n.y * 0.12,
    );
  });
  const leafPaint = cellPaint(P, (c) =>
    c.pick(GREEN, 0.5 + c.n.y * 0.13),
  );
  const soil = cellPaint(P, (c) =>
    c.random(16) > 0.982
      ? "#a8ae86"
      : c.pick(["#53664f", "#6d805d", "#87956b"], 0.5 + c.n.y * 0.1),
  );
  const nosePaint = cellPaint(P, (c) =>
    c.pick(
      ["#1b2a35", "#293a46", "#3d505c", "#586a73"],
      0.24 + c.n.y * 0.24,
    ),
  );

  const furTile = pixelTexture(48, 48, (g) => {
    g.fill(() => "#a4b0b5");
    for (let i = 0; i < 26; i++) {
      const x = Math.floor(random() * 44);
      const y = Math.floor(random() * 44);
      const color = i % 3 === 0 ? "#939fa6" : "#b5bfc1";
      g.set(x, y, color);
      g.set(x + 1, y, color);
      if (i % 2 === 0) g.set(x + 1, y + 1, color);
    }
  });

  const eyeTex = pixelArt(
    [
      "................",
      ".....kkkkkk.....",
      "...kkkkkkkkkk...",
      "..kkkkkkkkkkkk..",
      "..kkwwwkkkkkkk..",
      "..kkwwwkkkkkkk..",
      "..kkwwkkkkkkkk..",
      "..kkkkkkkkkkkk..",
      "..kkkkkkkkkkkk..",
      "..kkkkkkkkggkk..",
      "...kkkkkkggkk...",
      "....kkkkkkkk....",
      ".....cccccc.....",
      "................",
      "................",
      "................",
    ],
    {
      k: INK,
      w: "#fff8df",
      g: "#66818a",
      c: "#c9d1cb",
    },
  );

  const earTex = pixelTexture(24, 28, (g) => {
    g.fill((x, y) => {
      const dx = Math.abs(x - 11.5);
      const dy = Math.abs(y - 13.5);
      if (dx > 10 - Math.max(0, dy - 6) * 0.7) return "";
      const edge = dx > 7.4 || dy > 10;
      if (edge) return (x + Math.floor(y / 2)) % 5 === 0 ? "#cbd2c4" : "#e5e6d5";
      return x < 8 ? "#bec8bc" : "#d5dccb";
    });
    g.stamp(
      9,
      9,
      [
        "..ss...",
        ".ssss..",
        ".ssss..",
        "sssss..",
        "sssss..",
        ".ssss..",
        "..sss..",
        "...ss..",
        "....s..",
      ],
      { s: "#9eafa7" },
    );
  });

  const noseTex = pixelArt(
    [
      "...hhhhhh...",
      "..hhllllhh..",
      ".hhlllllllh.",
      ".hlllllllll.",
      ".llllllllll.",
      ".llllllllll.",
      ".llllllllll.",
      ".llllllllll.",
      ".llllllllll.",
      "..kllllllk..",
      "...kkkkkk...",
      "....kkkk....",
    ],
    { h: "#546976", l: "#263946", k: "#192a35" },
  );

  const barkTile = pixelTexture(32, 48, (g) => {
    g.fill((x, y) =>
      pick(BARK, 0.6 + 0.1 * Math.sin(Math.floor(x / 5) * 2 + Math.floor(y / 19))),
    );
    for (let i = 0; i < 8; i++) {
      const x = Math.floor(random() * 28);
      const y = Math.floor(random() * 32);
      const length = 9 + Math.floor(random() * 10);
      for (let k = 0; k < length; k++) {
        g.set(x, y + k, "#a79478");
        g.set(x + 1, y + k, "#e2d0af");
        g.set(x + 2, y + k, "#e2d0af");
      }
    }
  });

  const endTex = pixelTexture(24, 24, (g) => {
    g.fill((x, y) => {
      const r = Math.max(Math.abs(x - 11.5), Math.abs(y - 11.5));
      return r > 10
        ? "#827462"
        : Math.floor(r / 2) % 2
          ? "#d8c19a"
          : "#b79c77";
    });
    g.stamp(10, 10, ["kkk", "kdk", "kkk"], {
      k: "#9a7d5b",
      d: "#cdb38a",
    });
  });

  const leafTex = pixelTexture(12, 40, (g) => {
    g.fill((x, y) => {
      const halfWidth = Math.min(
        4.8,
        1 + Math.floor(y / 3),
        Math.floor((40 - y) / 5),
      );
      if (Math.abs(x - 5.5) > halfWidth) return "";
      if (x === 5) return "#b8cda9";
      if ((y + x * 2) % 11 === 0 && x < 5) return "#91b39b";
      return x < 5 ? "#6a9c87" : "#467d70";
    });
  });

  const plaqueTex = pixelTexture(64, 20, (g) => {
    g.fill((x, y) =>
      x < 1 || x > 62 || y < 1 || y > 18 ? "#c1b38e" : "#294743",
    );
    const letters: Record<string, string[]> = {
      K: ["101", "110", "100", "110", "101"],
      O: ["111", "101", "101", "101", "111"],
      A: ["010", "101", "111", "101", "101"],
      L: ["100", "100", "100", "100", "111"],
    };
    [..."KOALA"].forEach((letter, i) => {
      letters[letter].forEach((row, y) => {
        [...row].forEach((ch, x) => {
          if (ch !== "1") return;
          for (let a = 0; a < 2; a++) {
            for (let c = 0; c < 2; c++) {
              g.set(13 + i * 8 + x * 2 + a, 5 + y * 2 + c, "#e7dfbf");
            }
          }
        });
      });
    });
  });

  function box(
    name: string,
    at: number[],
    size: [number, number, number],
    color: string | Paint,
    bone: Joint = stand,
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      name,
    });
  }

  function furBox(
    name: string,
    at: number[],
    size: [number, number, number],
    bone: Joint,
  ) {
    return b.part(
      tileBox(size, furTile, P, { rand: random }),
      "#ffffff",
      { at, bone, texture: furTile, name },
    );
  }

  function image(
    name: string,
    texture: THREE.Texture,
    at: number[],
    width: number,
    height: number,
    bone: Joint = stand,
    direction: number[] = [0, 0, 1],
  ) {
    return b.part(
      new THREE.PlaneGeometry(width, height),
      "#ffffff",
      {
        at,
        bone,
        texture,
        dir: direction,
        axis: "z",
        name,
      },
    );
  }

  function branch(name: string, points: number[][], radii: number[]) {
    return b.sweep(points, radii, {
      color: bark,
      section: "box",
      caps: "flat",
      bone: stand,
      name,
    });
  }

  // Small forest-floor plinth.
  b.part(
    new THREE.CylinderGeometry(0.49, 0.465, 0.07, 8),
    "#364d45",
    {
      at: [0, 0.035, 0.09],
      bone: stand,
      name: "octagonal_dark_soil_edge",
    },
  );
  b.part(
    new THREE.CylinderGeometry(0.47, 0.48, 0.024, 8),
    soil,
    {
      at: [0, 0.078, 0.09],
      bone: stand,
      name: "pixel_moss_top",
    },
  );

  // The front point of the octagon reaches z=.58; the plaque must clear it.
  box(
    "plaque_mount",
    [0, 0.046, 0.572],
    [0.264, 0.072, 0.032],
    "#29433c",
  );
  image(
    "KOALA_pixel_label",
    plaqueTex,
    [0, 0.046, 0.589],
    0.256,
    0.08,
  );
  for (const s of [-1, 1]) {
    box(
      "plaque_fastener",
      [s * 0.12, 0.046, 0.592],
      [0.006, 0.006, 0.004],
      "#d6c8a4",
    );
  }

  branch(
    "main_eucalyptus_trunk",
    [
      [0.025, 0.09, 0.25],
      [0.018, 0.38, 0.247],
      [0.045, 0.64, 0.235],
      [0.045, 0.825, 0.23],
    ],
    [0.068, 0.06, 0.049, 0.034],
  );
  branch(
    "left_hand_branch",
    [
      [0.035, 0.64, 0.235],
      [0.2, 0.737, 0.252],
      [0.38, 0.777, 0.25],
    ],
    [0.044, 0.038, 0.026],
  );
  branch(
    "right_hand_branch",
    [
      [0.04, 0.67, 0.235],
      [-0.19, 0.733, 0.25],
      [-0.37, 0.764, 0.25],
    ],
    [0.043, 0.034, 0.025],
  );
  branch(
    "foot_perch",
    [
      [-0.255, 0.423, 0.25],
      [0.015, 0.417, 0.254],
      [0.252, 0.427, 0.25],
    ],
    [0.03, 0.039, 0.028],
  );
  for (const s of [-1, 1]) {
    branch(
      `root_${s}`,
      [
        [0.025, 0.19, 0.25],
        [s * 0.12, 0.11, 0.22],
        [s * 0.21, 0.095, 0.15],
      ],
      [0.045, 0.028, 0.012],
    );
    image(
      "exposed_end_grain",
      endTex,
      [s * 0.257, 0.426, 0.25],
      0.053,
      0.053,
      stand,
      [s, 0, 0],
    );
  }
  image(
    "trunk_cut_surface",
    endTex,
    [0.045, 0.826, 0.23],
    0.061,
    0.061,
    stand,
    [0, 1, 0],
  );

  for (let i = 0; i < 5; i++) {
    b.part(
      tileBox([0.025, 0.082, 0.008], barkTile, P / 2, {
        rand: random,
      }),
      "#ffffff",
      {
        at: [
          0.025 + (i % 2 ? 0.021 : -0.012),
          0.19 + i * 0.112,
          0.309 - i * 0.005,
        ],
        texture: barkTile,
        bone: stand,
        name: "long_papery_bark_strip",
      },
    );
  }

  // Fuller belly and rear silhouette, still plainly assembled from blocks.
  b.sweep(
    spine,
    (t) => [
      0.15 + Math.sin(t * Math.PI) * 0.022,
      0.124 - t * 0.012,
    ],
    {
      section: "box",
      caps: "flat",
      color: fur,
      name: "blocky_koala_torso",
    },
  );
  furBox(
    "round_square_rump",
    [0, 0.575, -0.028],
    [0.29, 0.18, 0.255],
    hips,
  );
  furBox(
    "back_center",
    [0, 0.725, -0.105],
    [0.25, 0.23, 0.09],
    spine.joints[0],
  );

  b.extrude(
    stepped(
      [
        [-4, 4],
        [-6, 6],
        [-8, 8],
        [-9, 9],
        [-9, 9],
        [-9, 9],
        [-8, 8],
        [-7, 7],
        [-5, 5],
        [-3, 3],
      ],
      [P, P * 1.5],
      { rows: true },
    ),
    {
      at: [0, 0.666, 0.126],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.026,
      color: wool,
      bone: spine.joints[1],
      name: "large_cream_chest_bib",
    },
  );
  for (const s of [-1, 1]) {
    box(
      "bib_wool_pixel",
      [s * 0.064, 0.811, 0.143],
      [0.024, 0.024, 0.014],
      "#e2e4d3",
      spine.joints[1],
    );
  }

  // Layered stepped cranium: a broad face and a narrower rear block.
  const headOutline = stepped(
    [
      [-11, 11],
      [-14, 14],
      [-16, 16],
      [-18, 18],
      [-18, 18],
      [-18, 18],
      [-18, 18],
      [-18, 18],
      [-18, 18],
      [-17, 17],
      [-16, 16],
      [-14, 14],
      [-11, 11],
    ],
    [P, P * 2],
    { rows: true },
  );

  b.extrude(headOutline, {
    at: [0, 0.888, 0.025],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.256,
    color: fur,
    bone: head,
    name: "stepped_square_koala_head",
  });
  b.extrude(
    stepped(
      [
        [-10, 10],
        [-13, 13],
        [-15, 15],
        [-16, 16],
        [-16, 16],
        [-16, 16],
        [-16, 16],
        [-15, 15],
        [-13, 13],
        [-10, 10],
      ],
      [P, P * 2],
      { rows: true },
    ),
    {
      at: [0, 0.916, -0.105],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.073,
      color: fur,
      bone: head,
      name: "soft_stepped_back_of_head",
    },
  );

  for (const s of [-1, 1]) {
    b.extrude(
      stepped(
        [
          [-2, 2],
          [-3, 3],
          [-4, 4],
          [-4, 4],
          [-3, 3],
        ],
        P,
        { rows: true },
      ),
      {
        at: [s * 0.146, 0.931, 0.133],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.045,
        color: fur,
        bone: head,
        name: "soft_stepped_cheek",
      },
    );
    image(
      "bright_pixel_eye",
      eyeTex,
      [s * 0.114, 1.037, 0.155],
      0.112,
      0.112,
      head,
    );
    box(
      "soft_eyebrow",
      [s * 0.114, 1.094, 0.155],
      [0.047, 0.009, 0.006],
      "#bdc8c8",
      head,
    );
    box(
      "cheek_pixel_highlight",
      [s * 0.163, 0.973, 0.158],
      [0.024, 0.012, 0.007],
      "#c5cfcb",
      head,
    );
    box(
      "cheek_pixel_highlight_small",
      [s * 0.178, 0.961, 0.158],
      [0.012, 0.012, 0.007],
      "#bac8c4",
      head,
    );
  }

  // The charcoal nose remains the main koala identity cue.
  b.extrude(
    stepped(
      [
        [-2, 2],
        [-3, 3],
        [-4, 4],
        [-5, 5],
        [-5, 5],
        [-5, 5],
        [-5, 5],
        [-5, 5],
        [-4, 4],
        [-3, 3],
      ],
      P,
      { rows: true },
    ),
    {
      at: [0, 0.957, 0.181],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.065,
      color: nosePaint,
      bone: head,
      name: "iconic_large_koala_nose",
    },
  );
  image(
    "nose_pixel_leather",
    noseTex,
    [0, 1.017, 0.215],
    0.12,
    0.12,
    head,
  );

  // Small closed smile, with a genuine separate lower jaw.
  box(
    "upper_muzzle",
    [0, 0.948, 0.153],
    [0.096, 0.03, 0.054],
    wool,
    head,
  );
  box(
    "separate_lower_jaw",
    [0, 0.921, 0.15],
    [0.096, 0.025, 0.06],
    wool,
    jaw,
  );
  box(
    "short_nose_to_mouth_line",
    [0, 0.947, 0.183],
    [0.008, 0.018, 0.006],
    INK,
    head,
  );
  box(
    "closed_mouth_line",
    [0, 0.935, 0.183],
    [0.047, 0.006, 0.006],
    INK,
    head,
  );
  for (const s of [-1, 1]) {
    box(
      "smile_corner",
      [s * 0.026, 0.94, 0.183],
      [0.006, 0.01, 0.006],
      INK,
      head,
    );
  }

  // Broad, rounded pixel ears with quieter wool and clearly exposed interiors.
  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? -1 : 1;
    const bone = ears[i];
    const cx = s * 0.278;

    b.extrude(
      stepped(
        [
          [-3, 3],
          [-5, 5],
          [-7, 7],
          [-8, 8],
          [-9, 9],
          [-9, 9],
          [-9, 9],
          [-9, 9],
          [-8, 8],
          [-7, 7],
          [-5, 5],
          [-3, 3],
        ],
        [P, P * 1.8],
        { rows: true },
      ),
      {
        at: [cx, 0.936, -0.004],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.12,
        color: fur,
        bone,
        name: "round_stepped_outer_ear",
      },
    );

    image(
      "woolly_pixel_inner_ear",
      earTex,
      [cx, 1.066, 0.059],
      0.185,
      0.216,
      bone,
    );

    const tufts = [
      [-0.06, 0.097],
      [-0.035, 0.113],
      [0.012, 0.118],
      [0.054, 0.099],
      [0.088, 0.052],
      [0.091, -0.008],
      [0.071, -0.072],
      [-0.032, -0.106],
      [-0.079, -0.06],
    ];
    for (let j = 0; j < tufts.length; j++) {
      const [x, y] = tufts[j];
      box(
        "ear_wool_edge_cube",
        [cx + x, 1.065 + y, 0.045],
        [0.022, j % 2 ? 0.023 : 0.032, 0.027],
        j % 3 === 0 ? "#d8dfd2" : "#bdc9c2",
        bone,
      );
    }
  }

  // Wrapping paws. Digits remain individually rigged and visibly separated.
  for (const limb of limbs) {
    const { s, arm, leg, fingers, thumb, toes } = limb;

    b.sweep(arm, [0.065, 0.059, 0.047], {
      section: "box",
      caps: "flat",
      color: fur,
      name: "angular_forelimb",
    });
    b.sweep(leg, [0.077, 0.071, 0.043], {
      section: "box",
      caps: "flat",
      color: fur,
      name: "chunky_hindlimb",
    });

    furBox(
      "hand_back",
      [s * 0.296, 0.791, 0.281],
      [0.112, 0.061, 0.073],
      arm.tip!,
    );
    furBox(
      "hind_paw",
      [s * 0.174, 0.463, 0.276],
      [0.105, 0.058, 0.083],
      leg.tip!,
    );
    box(
      "wrist_light_pixel",
      [s * 0.297, 0.823, 0.282],
      [0.048, 0.008, 0.027],
      "#c0ccc6",
      arm.tip!,
    );

    for (const digit of [...fingers, thumb, ...toes]) {
      b.sweep(digit, [0.013, 0.012, 0.01], {
        color: fur,
        section: "box",
        caps: "flat",
        name: "separated_gripping_digit",
      });
      const tip = digit.at(1);
      const p = tip.at;
      b.frustumBox(
        tip,
        [p.x, p.y - 0.015, p.z - 0.008],
        [0.013, 0.011],
        [0.004, 0.004],
        {
          color: CLAW,
          bone: digit.joints[digit.joints.length - 1],
          name: "ivory_square_claw",
        },
      );
    }

    for (let j = 0; j < 3; j++) {
      furBox(
        "hip_fur_step",
        [s * (0.15 + j * 0.012), 0.565 - j * 0.025, 0.024],
        [0.046, 0.038, 0.078],
        leg.joints[0],
      );
    }
  }

  // Side foliage frames, rather than interrupts, the face.
  branch(
    "tall_left_fork",
    [
      [0.045, 0.74, 0.23],
      [0.285, 0.87, 0.075],
      [0.423, 1.01, -0.045],
      [0.456, 1.233, -0.09],
    ],
    [0.026, 0.021, 0.014, 0.005],
  );
  branch(
    "low_right_foliage_branch",
    [
      [-0.21, 0.737, 0.25],
      [-0.368, 0.846, 0.11],
      [-0.442, 0.962, 0.015],
    ],
    [0.018, 0.011, 0.004],
  );
  branch(
    "rear_leaf_branch",
    [
      [0.032, 0.62, 0.22],
      [0.19, 0.87, -0.15],
      [0.29, 1.055, -0.19],
    ],
    [0.022, 0.013, 0.005],
  );

  function eucalyptusLeaf(root: number[], tip: number[], index: number) {
    const r = new THREE.Vector3(...root);
    const t = new THREE.Vector3(...tip);
    const axis = t.clone().sub(r);
    const len = axis.length();
    axis.normalize();

    const across = new THREE.Vector3(1, 0, 0);
    if (Math.abs(axis.dot(across)) > 0.9) across.set(0, 0, 1);
    across.addScaledVector(axis, -across.dot(axis)).normalize();

    const width = index % 3 === 0 ? 0.038 : 0.031;
    b.extrude(
      [
        [0, 0],
        [-width * 0.38, len * 0.19],
        [-width * 0.52, len * 0.43],
        [-width * 0.32, len * 0.69],
        [-width * 0.1, len * 0.87],
        [0, len],
        [width * 0.26, len * 0.72],
        [width * 0.46, len * 0.32],
      ],
      {
        at: root,
        x: across,
        y: axis,
        thickness: 0.005,
        color: leafPaint,
        bone: stand,
        name: "long_lanceolate_eucalyptus_leaf",
      },
    );
    b.sweep([root, tip], 0.002, {
      color: "#afc7a3",
      bone: stand,
      caps: "flat",
      section: "box",
      name: "leaf_mid_rib",
    });
    b.cards([frame(root, axis)], leafTex, {
      size: [width * 1.18, len],
      flow: [0, 0, 1],
      sink: 0,
      bone: stand,
      name: "pixel_leaf_veins",
    });
  }

  const clusters = [
    {
      at: [0.453, 1.21, -0.086],
      ends: [
        [0.39, 1.337, -0.085],
        [0.541, 1.297, -0.07],
        [0.557, 1.067, -0.045],
      ],
    },
    {
      at: [0.441, 1.125, -0.065],
      ends: [
        [0.551, 0.982, 0],
        [0.427, 0.964, -0.09],
      ],
    },
    {
      at: [0.412, 0.998, -0.04],
      ends: [
        [0.527, 0.863, 0.005],
        [0.461, 0.81, 0.018],
      ],
    },
    {
      at: [-0.432, 0.943, 0.027],
      ends: [
        [-0.493, 1.081, 0.005],
        [-0.555, 0.827, 0.06],
        [-0.421, 0.769, 0.075],
      ],
    },
    {
      at: [-0.371, 0.85, 0.103],
      ends: [
        [-0.51, 0.739, 0.13],
        [-0.362, 0.666, 0.12],
      ],
    },
    {
      at: [0.285, 1.043, -0.186],
      ends: [
        [0.362, 1.155, -0.22],
        [0.376, 0.924, -0.18],
        [0.25, 0.885, -0.21],
      ],
    },
  ];

  let leafIndex = 0;
  for (const cluster of clusters) {
    for (const end of cluster.ends) {
      const root = new THREE.Vector3(...cluster.at);
      const destination = new THREE.Vector3(...end);
      const stalkEnd = root.clone().lerp(destination, 0.13);
      b.rod(root, stalkEnd, 0.0035, {
        color: "#819774",
        bone: stand,
        section: "box",
        name: "leaf_petiole",
      });
      eucalyptusLeaf(stalkEnd.toArray(), end, leafIndex++);
    }
  }

  // A few eucalyptus seed capsules add a specific botanical detail.
  for (const s of [-1, 1]) {
    const x = s > 0 ? 0.401 : -0.395;
    const y = s > 0 ? 0.976 : 0.896;
    const z = s > 0 ? -0.025 : 0.076;
    for (let j = 0; j < 2; j++) {
      const px = x + s * (0.021 + j * 0.017);
      const py = y - 0.022 - j * 0.017;
      b.rod(
        [x, y, z],
        [px, py, z + 0.009],
        0.003,
        { color: "#84977b", bone: stand, section: "box", name: "gumnut_stalk" },
      );
      box(
        "square_gumnut",
        [px, py - 0.008, z + 0.009],
        [0.019, 0.022, 0.019],
        "#a0ae8a",
      );
      box(
        "gumnut_cap",
        [px, py + 0.003, z + 0.009],
        [0.022, 0.006, 0.022],
        "#c4c4a0",
      );
    }
  }

  // Seat every pebble on y=.09, the actual soil surface.
  for (let i = 0; i < 15; i++) {
    const angle = random() * Math.PI * 2;
    const radius = 0.24 + random() * 0.17;
    const x = Math.cos(angle) * radius;
    const z = 0.09 + Math.sin(angle) * radius;
    if (z > 0.39 && Math.abs(x) < 0.18) continue;

    const size = 0.018 + random() * 0.024;
    box(
      "square_forest_pebble",
      [x, 0.089 + size * 0.3, z],
      [size * 1.4, size * 0.6, size],
      i % 3 === 0
        ? "#a3aa8b"
        : i % 3 === 1
          ? "#7b8c72"
          : "#b9b393",
    );

    if (i % 3 === 0) {
      for (let j = 0; j < 3; j++) {
        const height = 0.035 + j * 0.009;
        box(
          "pixel_moss_sprig",
          [x + (j - 1) * 0.014, 0.089 + height / 2, z - 0.018],
          [0.012, height, 0.012],
          j % 2 ? "#6b8c6d" : "#96ab7e",
        );
      }
    }
  }

  for (const [x, z, angle] of [
    [-0.24, 0.3, 0.5],
    [0.3, 0.12, -0.8],
    [-0.18, -0.18, 1.4],
    [0.16, 0.38, -0.4],
  ]) {
    b.cards(
      [frame([x, 0.091, z], [0, 1, 0])],
      leafTex,
      {
        size: [0.035, 0.13],
        lean: 90,
        sink: 0,
        flow: [Math.cos(angle), 0, Math.sin(angle)],
        mirror: true,
        bone: stand,
        name: "fallen_eucalyptus_leaf",
      },
    );
  }

  return b.root;
}
```