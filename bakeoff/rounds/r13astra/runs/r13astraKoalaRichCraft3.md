```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  rng,
  paint,
  noise,
  mix,
} from "agentic-3js-builder";
import {
  pixelTexture,
  pixelArt,
  tileBox,
  skinLayout,
  skinBox,
  cellPaint,
  stepped,
} from "agentic-3js-builder/kits/pixel";

export const meta = {
  name: "Eucalyptus Hug",
  description:
    "A silver-grey pixel-art koala clasping a wooden eucalyptus branch stand, with enormous fuzzy ears, a charcoal nose, individual gripping digits and stepped blue-green leaves.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "eucalyptus-hug", paintSize: 1024 });
  const random = rng(614);

  const C = {
    furDark: "#626c77",
    furShadow: "#78828c",
    fur: "#929ca5",
    furLight: "#b3bdc3",
    furHigh: "#d0d7d8",
    cream: "#e2e2d5",
    ink: "#28313b",
    nose: "#343c45",
    noseLight: "#505964",
    claw: "#e8dfbd",
    inner: "#9c9298",
    innerLight: "#c0b2b4",
    bark: "#796348",
    barkDark: "#514d3d",
    barkLight: "#a28b61",
    cut: "#d5bd83",
    leafDark: "#315e57",
    leaf: "#568879",
    leafLight: "#83ac92",
    vein: "#c0cba0",
  };

  // One world-space pixel grid across all articulated fur pieces.
  const furPaint = cellPaint(0.0125, (cell) => {
    const v = noise(cell.at, 0.11, 14);
    const ramp = [
      C.furDark,
      C.furShadow,
      C.fur,
      C.furLight,
      C.furHigh,
    ];
    return cell.pick(ramp, 0.39 + cell.n.y * 0.14 + (v - 0.5) * 0.55);
  });
  const barkPaint = cellPaint(0.016, (cell) => {
    const longGrain = noise(
      new THREE.Vector3(cell.at.x * 3, cell.at.y * 0.23, cell.at.z * 3),
      0.12,
      42,
    );
    return cell.pick(
      [C.barkDark, "#685b44", C.bark, "#8c7551", C.barkLight],
      0.28 + longGrain * 0.52 + cell.n.y * 0.09,
    );
  });
  const palePaint = cellPaint(0.0125, (cell) =>
    cell.pick(
      ["#aeb7b8", "#c8ceca", C.cream, "#efecdb"],
      0.51 + cell.n.y * 0.16 + cell.random(11) * 0.12,
    ),
  );
  const leafPaint = cellPaint(0.009, (cell) =>
    cell.pick(
      [C.leafDark, C.leaf, C.leafLight],
      0.43 + cell.n.y * 0.25 + cell.random(6) * 0.13,
    ),
  );

  // Small, deliberately authored texture sheets; no filtered photographic detail.
  const furTile = pixelTexture(32, 32, (g) => {
    g.fill((x, y) => {
      const h = (x * 13 + y * 7 + Math.floor(y / 3) * 11) % 43;
      if (h === 0 || h === 1) return C.furLight;
      if (h === 19) return C.furShadow;
      return C.fur;
    });
    for (let y = 4; y < 30; y += 7) {
      const x = (y * 3) % 25;
      g.stamp(x, y, ["ll..", ".ll.", "..l."], { l: C.furLight });
    }
  });

  const headLayout = skinLayout({ head: [36, 28, 24] }, 128);
  const headTexture = pixelTexture(
    headLayout.size[0],
    headLayout.size[1],
    (g) => {
      const faces = headLayout.faces.head;
      for (const [name, rect] of Object.entries(faces)) {
        g.fill((x, y) => {
          const base =
            name === "py"
              ? C.furLight
              : name === "ny" || name === "nz"
                ? C.furShadow
                : C.fur;
          return (x * 17 + y * 11) % 79 === 0 ? C.furLight : base;
        }, rect);
      }
      const f = faces.pz;
      const stamp = (x: number, y: number, rows: string[], pal: Record<string, string>) =>
        g.stamp(f[0] + x, f[1] + y, rows, pal);

      // Soft, stepped cheek markings keep this a koala rather than a masked bear.
      const cheek = [
        "..hhh",
        ".hhhh",
        "hhhhh",
        "hhhhh",
        ".hhhh",
        "..hhh",
      ];
      stamp(2, 18, cheek, { h: C.furLight });
      stamp(29, 18, cheek.map((r) => r.split("").reverse().join("")), {
        h: C.furLight,
      });
      stamp(4, 7, [".sssss", "ss...."], { s: C.furShadow });
      stamp(26, 7, ["sssss.", "....ss"], { s: C.furShadow });

      const eye = [
        ".kkkk.",
        "kkwkkk",
        "kwwkkk",
        "kkkkkk",
        ".kggk.",
        "..kk..",
      ];
      stamp(6, 10, eye, {
        k: C.ink,
        w: "#f6f3df",
        g: "#4a535c",
      });
      stamp(24, 10, eye, {
        k: C.ink,
        w: "#f6f3df",
        g: "#4a535c",
      });
      stamp(14, 2, [".hh..hh.", "hh.hhh.h", "...hh..."], { h: C.furHigh });
      stamp(15, 24, ["s....s", ".ssss."], { s: C.furDark });
    },
  );

  const bodyLayout = skinLayout({ body: [29, 32, 23] }, 128);
  const bodyTexture = pixelTexture(
    bodyLayout.size[0],
    bodyLayout.size[1],
    (g) => {
      const faces = bodyLayout.faces.body;
      for (const [name, rect] of Object.entries(faces)) {
        g.fill((x, y) => {
          const h = (x * 19 + y * 29) % 71;
          if (h < 2) return C.furLight;
          return name === "nz" || name === "ny" ? C.furShadow : C.fur;
        }, rect);
      }
      const f = faces.pz;
      g.fill((x, y) => {
        const half = y < 6 ? 8 : y < 20 ? 10 : y < 27 ? 8 : 5;
        if (Math.abs(x - 14) > half) return undefined;
        if ((x + y * 7) % 41 === 0) return "#f0ecdc";
        return y > 25 ? "#ccd2cc" : C.cream;
      }, f);
    },
  );

  const earTexture = pixelArt(
    [
      "......ssssss......",
      "....sshhhhhhss....",
      "...shhhhhhhhhh s..".replace(/ /g, ""),
      "..shhhpppppphhhs..",
      ".shhpppppppppphhs.",
      ".shhppmmmmmmpphhs.",
      "shhppmmmmmmm mpphhs".replace(/ /g, ""),
      "shhppmmmmmmmmpphhs",
      "shhppmmmmmmmmpphhs",
      "shhppmmmmmmmmpphhs",
      "shhppmmmmmmmmpphhs",
      "shhppmmmmmmmmpphhs",
      ".shhppmmmmmmpphhs.",
      ".shhhpppppppphhhs.",
      "..shhhpppppphhhs..",
      "...shhhhhhhhhh s..".replace(/ /g, ""),
      "....sshhhhhhss....",
      "......ssssss......",
    ].map((row) => row.padEnd(18, ".").slice(0, 18)),
    {
      s: C.furShadow,
      h: C.furHigh,
      p: C.innerLight,
      m: C.inner,
    },
  );

  const noseTexture = pixelArt(
    [
      "..dddddddd..",
      ".dllllllll d".replace(/ /g, ""),
      "dllhhhhlllld",
      "dllhhlllllld",
      "dlllllllllld",
      "dlllllllllld",
      "dllnnnnnnlld",
      "dlnnnnnnnnld",
      "dlnnnnnnnnld",
      "dlnnnnnnnnld",
      "dnnnnnnnnnnd",
      ".dnnnnnnnnd.",
      "..dddddddd..",
      "...dddddd...",
    ].map((r) => r.padEnd(12, ".").slice(0, 12)),
    {
      d: "#29323c",
      l: C.noseLight,
      h: "#707a81",
      n: C.nose,
    },
  );

  const cutTexture = pixelTexture(24, 24, (g) => {
    g.fill((x, y) => {
      const r = Math.max(Math.abs(x - 11.5), Math.abs(y - 11.5));
      if (r > 10) return C.barkDark;
      if (r > 8.5) return C.bark;
      return Math.floor(r) % 3 === 0 ? "#b29a67" : C.cut;
    });
    g.stamp(7, 7, ["kkkk", "...k", "..kk", "..k."], { k: "#9f8356" });
  });

  // Skeleton first. The perch is a prop; all animal geometry is assigned explicitly.
  const hips = b.joint("hips", {
    at: [0, 0.66, 0.055],
    role: "spine",
  });
  const spine = b.chain(
    "spine",
    [[0, 0.66, 0.055], [0, 0.82, 0.065], [0, 0.94, 0.095]],
    { parent: hips, names: ["spineLower", "chest", "neck"], role: "spine" },
  );
  const head = b.joint("head", {
    parent: spine.tip!,
    at: [0, 1.035, 0.12],
    dir: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.925, 0.18],
    dir: [0, 0, 1],
    role: "jaw",
  });
  const stand = b.joint("branchStand", {
    parent: hips,
    at: [0.34, 0, 0.37],
    dir: [0, 1, 0],
  });

  const sides = [1, -1].map((s) => {
    const side = s === 1 ? "L" : "R";
    const arm = b.chain(
      `arm${side}`,
      [
        [s * 0.17, 0.885, 0.12],
        [s * 0.29, 0.815, 0.245],
        [s * 0.355, 0.913, 0.365],
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
        [s * 0.115, 0.655, 0.065],
        [s * 0.23, 0.535, 0.15],
        [s * 0.20, 0.487, 0.29],
      ],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [s * 0.20, 0.426, 0.30],
      },
    );

    const fingers = Array.from({ length: 3 }, (_, i) =>
      b.chain(
        `finger${side}${i}`,
        [
          [s * (0.318 + i * 0.034), 0.928, 0.404],
          [s * (0.318 + i * 0.034), 0.893, 0.455],
          [s * (0.318 + i * 0.034), 0.851, 0.435],
        ],
        {
          parent: arm.tip!,
          names: [`finger${side}${i}Base`, `finger${side}${i}Tip`],
          role: "digit",
        },
      ),
    );
    const thumb = b.chain(
      `thumb${side}`,
      [
        [s * 0.322, 0.907, 0.355],
        [s * 0.285, 0.872, 0.387],
        [s * 0.293, 0.851, 0.411],
      ],
      {
        parent: arm.tip!,
        names: [`thumb${side}Base`, `thumb${side}Tip`],
        role: "digit",
      },
    );
    const toes = Array.from({ length: 3 }, (_, i) =>
      b.chain(
        `toe${side}${i}`,
        [
          [s * (0.158 + i * 0.038), 0.49, 0.329],
          [s * (0.158 + i * 0.038), 0.463, 0.383],
          [s * (0.158 + i * 0.038), 0.423, 0.366],
        ],
        { parent: leg.tip!, count: 2, role: "digit" },
      ),
    );
    return { s, side, arm, leg, fingers, thumb, toes };
  });

  type Bone = typeof hips;
  const box = (
    name: string,
    at: number[],
    size: number[],
    color: Parameters<typeof b.part>[1],
    bone: Bone,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      name,
    });

  // The face is settled before the foliage or the supporting branch.
  b.part(skinBox(headTexture, headLayout.faces.head, 0.0125), "#ffffff", {
    at: [0, 1.035, 0.12],
    bone: head,
    texture: headTexture,
    name: "head.pixelFace",
  });
  box("crown.step", [0, 1.216, 0.105], [0.325, 0.025, 0.25], furPaint, head);
  box("chin.step", [0, 0.854, 0.10], [0.325, 0.025, 0.225], furPaint, head);

  // The separate lower jaw sits below the short upper muzzle.
  box("upperMuzzle", [0, 0.935, 0.282], [0.19, 0.058, 0.037], palePaint, head);
  box("mouth.seam", [0, 0.902, 0.286], [0.105, 0.009, 0.028], C.ink, head);
  box("lowerJaw", [0, 0.883, 0.254], [0.172, 0.032, 0.078], palePaint, jaw);
  box("nose.block", [0, 1.013, 0.298], [0.125, 0.153, 0.074], C.nose, head);
  box("nose.topStep", [0, 1.095, 0.295], [0.10, 0.018, 0.061], C.noseLight, head);
  box("nose.bottomStep", [0, 0.93, 0.30], [0.085, 0.018, 0.06], C.nose, head);
  b.part(new THREE.PlaneGeometry(0.137, 0.172), "#ffffff", {
    at: [0, 1.013, 0.336],
    bone: head,
    texture: noseTexture,
    name: "nose.pixelHighlight",
  });

  const earOutline = stepped(
    [
      [-3, 3], [-5, 5], [-6, 6], [-7, 7],
      [-7, 7], [-8, 8], [-8, 8], [-8, 8],
      [-8, 8], [-8, 8], [-8, 8], [-7, 7],
      [-7, 7], [-6, 6], [-5, 5], [-3, 3],
    ],
    0.015,
    { rows: true, start: -8 },
  );

  for (const { s } of sides) {
    const x = s * 0.267;
    b.extrude(earOutline, {
      at: [x, 1.157, 0.105],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.095,
      color: furPaint,
      bone: head,
      name: `ear${s}.steppedRim`,
    });
    b.part(new THREE.PlaneGeometry(0.239, 0.239), "#ffffff", {
      at: [x, 1.157, 0.154],
      texture: earTexture,
      bone: head,
      name: `ear${s}.innerPixels`,
    });
    // Little squared tufts break the silhouette without becoming a smooth fur ball.
    for (let i = 0; i < 4; i++) {
      box(
        `ear${s}.tuft${i}`,
        [x + s * (0.085 + (i % 2) * 0.015), 1.20 - i * 0.033, 0.10],
        [0.044, 0.024, 0.08],
        i % 2 ? C.furLight : C.furHigh,
        head,
      );
    }
    for (let i = 0; i < 3; i++) {
      box(
        `cheek${s}.edge${i}`,
        [s * (0.219 + (i === 1 ? 0.012 : 0)), 0.971 - i * 0.036, 0.124],
        [0.036, 0.033, 0.22 - i * 0.025],
        furPaint,
        head,
      );
    }
  }

  // Broad simple torso and a stepped, pale breast.
  b.part(skinBox(bodyTexture, bodyLayout.faces.body, 0.0125), "#ffffff", {
    at: [0, 0.716, 0.055],
    bone: hips,
    texture: bodyTexture,
    name: "torso.pixelBib",
  });
  box("shoulder.step", [0, 0.918, 0.068], [0.287, 0.037, 0.25], furPaint, spine.joints[1]);
  box("rump.step", [0, 0.508, 0.025], [0.287, 0.04, 0.25], furPaint, hips);
  box("bib.top", [0, 0.892, 0.204], [0.20, 0.06, 0.025], palePaint, spine.joints[1]);
  box("bib.center", [0, 0.81, 0.207], [0.225, 0.10, 0.025], palePaint, hips);
  box("bib.lower", [0, 0.726, 0.207], [0.175, 0.075, 0.025], palePaint, hips);

  // Square-section limbs give the little puppet visible articulation.
  for (const limb of sides) {
    const { s, side, arm, leg, fingers, thumb, toes } = limb;
    b.sweep(arm, [0.073, 0.061, 0.047], {
      color: furPaint,
      section: "box",
      caps: "flat",
      skin: "rigid",
      name: `arm${side}.fur`,
    });
    b.sweep(leg, [0.095, 0.081, 0.052], {
      color: furPaint,
      section: "box",
      caps: "flat",
      skin: "rigid",
      name: `leg${side}.fur`,
    });

    b.part(tileBox([0.13, 0.115, 0.12], furTile, 0.0125), "#ffffff", {
      at: [s * 0.211, 0.565, 0.133],
      bone: leg.joints[0],
      texture: furTile,
      name: `haunch${side}.pixels`,
    });
    box(`hand${side}.palm`, [s * 0.355, 0.926, 0.377], [0.125, 0.061, 0.087], furPaint, arm.tip!);
    box(`foot${side}.palm`, [s * 0.20, 0.495, 0.30], [0.14, 0.067, 0.10], furPaint, leg.tip!);

    for (const [i, finger] of [...fingers, thumb].entries()) {
      b.sweep(finger, [0.014, 0.012], {
        section: "box",
        caps: "flat",
        color: furPaint,
        name: `grip${side}.${i}`,
      });
      const p = finger.at(1).at;
      box(
        `claw${side}.${i}`,
        [p.x, p.y - 0.009, p.z + 0.005],
        [0.014, 0.025, 0.015],
        C.claw,
        finger.joints[finger.joints.length - 1],
      );
    }
    for (const [i, toe] of toes.entries()) {
      b.sweep(toe, [0.017, 0.013], {
        section: "box",
        caps: "flat",
        color: furPaint,
        name: `toe${side}.${i}.fur`,
      });
      const p = toe.at(1).at;
      box(
        `toe${side}.${i}.claw`,
        [p.x, p.y - 0.009, p.z + 0.004],
        [0.016, 0.022, 0.014],
        C.claw,
        toe.joints[toe.joints.length - 1],
      );
    }
    // Opposable hind toe, separated from the three forward digits.
    b.rod(
      [s * 0.142, 0.488, 0.293],
      [s * 0.108, 0.451, 0.305],
      0.018,
      { section: "box", color: furPaint, bone: leg.tip!, name: `heelThumb${side}` },
    );
    box(`heelClaw${side}`, [s * 0.105, 0.436, 0.31], [0.017, 0.024, 0.016], C.claw, leg.tip!);

    for (let i = 0; i < 3; i++) {
      box(
        `forearm${side}.furPixel${i}`,
        [s * (0.291 + i * 0.018), 0.854 + i * 0.025, 0.323 + i * 0.017],
        [0.023, 0.024, 0.013],
        C.furLight,
        arm.joints[1],
      );
    }
  }

  // Rooted wooden branch stand, kept subordinate to the animal.
  b.part(new THREE.CylinderGeometry(0.17, 0.225, 0.13, 8), barkPaint, {
    at: [0.31, 0.065, 0.345],
    bone: stand,
    flat: true,
    name: "stand.rootStump",
  });
  b.part(new THREE.PlaneGeometry(0.22, 0.22), "#ffffff", {
    at: [0.31, 0.131, 0.345],
    rotation: [-90, 0, 0],
    bone: stand,
    texture: cutTexture,
    name: "stand.cutTop",
  });

  for (const [i, q] of [
    [-0.02, 0.028, 0.23],
    [0.62, 0.028, 0.25],
    [0.34, 0.028, 0.65],
  ].entries()) {
    b.sweep(
      [[0.31, 0.075, 0.345], q],
      [0.065, 0.028],
      {
        bone: stand,
        section: "box",
        caps: "flat",
        color: barkPaint,
        name: `stand.root${i}`,
      },
    );
  }

  const trunkPath = [
    [0.31, 0.10, 0.345],
    [0.33, 0.43, 0.33],
    [0.41, 0.90, 0.395],
    [0.43, 1.22, 0.34],
    [0.49, 1.48, 0.27],
  ];
  b.sweep(trunkPath, [0.063, 0.055, 0.047, 0.035, 0.019], {
    bone: stand,
    section: { ngon: 6 },
    caps: "flat",
    color: barkPaint,
    smooth: false,
    name: "stand.mainBough",
  });

  const perch = (name: string, points: number[][], radii: number[]) =>
    b.sweep(points, radii, {
      bone: stand,
      color: barkPaint,
      section: { ngon: 6 },
      caps: "flat",
      smooth: false,
      name,
    });

  perch("stand.handPerch", [
    [0.43, 0.895, 0.395],
    [0.06, 0.891, 0.398],
    [-0.40, 0.89, 0.402],
    [-0.53, 0.99, 0.36],
  ], [0.044, 0.039, 0.032, 0.017]);
  perch("stand.footPerch", [
    [0.34, 0.418, 0.33],
    [0.04, 0.428, 0.305],
    [-0.285, 0.43, 0.305],
  ], [0.043, 0.037, 0.028]);
  perch("stand.lowerBrace", [
    [0.32, 0.22, 0.34],
    [-0.04, 0.35, 0.32],
    [-0.23, 0.43, 0.305],
  ], [0.029, 0.023, 0.018]);

  // A fork behind the head gives the eucalyptus a clear botanical silhouette.
  perch("eucalyptus.leftSpray", [
    [0.43, 1.20, 0.34],
    [0.20, 1.40, 0.08],
    [-0.20, 1.43, -0.005],
    [-0.50, 1.39, 0.04],
    [-0.66, 1.30, 0.10],
  ], [0.029, 0.025, 0.019, 0.012, 0.005]);
  perch("eucalyptus.rightSpray", [
    [0.44, 1.25, 0.32],
    [0.64, 1.35, 0.27],
    [0.74, 1.45, 0.19],
  ], [0.022, 0.014, 0.005]);
  perch("eucalyptus.crownTwig", [
    [0.46, 1.39, 0.29],
    [0.39, 1.55, 0.20],
    [0.26, 1.61, 0.14],
  ], [0.016, 0.009, 0.004]);
  perch("eucalyptus.lowTwig", [
    [-0.49, 0.96, 0.37],
    [-0.63, 1.07, 0.32],
    [-0.70, 1.16, 0.27],
  ], [0.013, 0.009, 0.004]);

  // A long lanceolate leaf, drawn as a staircase and reused at explicit frames.
  const leafOutline = stepped(
    [[-1, 1], [-2, 2], [-3, 3], [-3, 3], [-3, 3], [-2, 2], [-2, 2], [-1, 1]],
    [0.010, 0.022],
    { rows: true },
  );
  const leafSmallOutline = stepped(
    [[-1, 1], [-2, 2], [-2, 2], [-2, 2], [-1, 1], [-1, 1]],
    [0.009, 0.018],
    { rows: true },
  );

  function leaf(
    name: string,
    origin: number[],
    direction: number[],
    small = false,
    roll = 0,
  ) {
    const y = new THREE.Vector3(...direction).normalize();
    let x = new THREE.Vector3(1, 0, 0);
    if (Math.abs(x.dot(y)) > 0.88) x.set(0, 0, 1);
    x.addScaledVector(y, -x.dot(y)).normalize();
    x.applyAxisAngle(y, roll);
    const n = x.clone().cross(y).normalize();
    const originV = new THREE.Vector3(...origin);
    const length = small ? 0.108 : 0.176;
    const start = originV.clone().addScaledVector(y, 0.019);

    b.rod(originV, start, 0.004, {
      color: C.barkLight,
      section: "box",
      bone: stand,
      name: `${name}.petiole`,
    });
    b.extrude(small ? leafSmallOutline : leafOutline, {
      at: start,
      x,
      y,
      thickness: 0.005,
      color: leafPaint,
      bone: stand,
      name: `${name}.blade`,
    });

    // One broad pale pixel midrib and two offset highlight pixels.
    const a = start.clone().addScaledVector(n, 0.003);
    const z = a.clone().addScaledVector(y, length * 0.88);
    b.rod(a, z, 0.003, {
      color: C.vein,
      section: "box",
      bone: stand,
      name: `${name}.midrib`,
    });
    for (let i = 0; i < 2; i++) {
      const p = a.clone()
        .addScaledVector(y, length * (0.32 + i * 0.23))
        .addScaledVector(x, (i ? -1 : 1) * 0.013);
      b.part(new THREE.BoxGeometry(0.010, 0.022, 0.004), C.leafLight, {
        at: p,
        dir: y,
        up: n,
        bone: stand,
        name: `${name}.lightPixel${i}`,
      });
    }
  }

  const leafSites: Array<[number[], number[], boolean?]> = [
    [[-0.17, 1.43, 0.00], [-0.35, 0.82, 0.12]],
    [[-0.24, 1.425, 0.01], [-0.20, -0.78, -0.16]],
    [[-0.32, 1.415, 0.02], [-0.48, 0.69, 0.16]],
    [[-0.40, 1.405, 0.025], [-0.15, -0.80, 0.22]],
    [[-0.49, 1.39, 0.04], [-0.65, 0.52, 0.10]],
    [[-0.55, 1.365, 0.06], [-0.20, -0.80, 0.24]],
    [[-0.61, 1.33, 0.08], [-0.76, 0.10, 0.04]],
    [[-0.65, 1.30, 0.10], [-0.22, -0.86, 0.18]],
    [[0.12, 1.407, 0.06], [0.12, 0.86, -0.10], true],
    [[0.02, 1.42, 0.035], [-0.18, 0.96, 0.06], true],
    [[0.59, 1.325, 0.285], [0.45, -0.73, 0.12]],
    [[0.64, 1.35, 0.27], [0.70, 0.25, 0.13]],
    [[0.68, 1.39, 0.24], [0.28, -0.70, 0.40]],
    [[0.715, 1.425, 0.21], [0.54, 0.55, 0.08]],
    [[0.74, 1.45, 0.19], [0.12, 0.84, -0.12], true],
    [[0.46, 1.43, 0.28], [0.24, 0.63, 0.50], true],
    [[0.415, 1.51, 0.22], [-0.70, 0.39, 0.04], true],
    [[0.385, 1.555, 0.195], [0.45, 0.60, 0.15], true],
    [[0.325, 1.58, 0.17], [-0.24, 0.77, 0.03], true],
    [[0.27, 1.607, 0.14], [-0.74, 0.28, 0.08], true],
    [[-0.57, 1.025, 0.34], [-0.56, -0.59, 0.08]],
    [[-0.62, 1.065, 0.32], [-0.79, 0.18, 0.10], true],
    [[-0.66, 1.105, 0.295], [0.01, -0.76, 0.50], true],
    [[-0.70, 1.16, 0.27], [-0.38, 0.73, 0.03], true],
  ];
  leafSites.forEach(([p, d, small], i) =>
    leaf(`leaf${i}`, p, d, small, (random() - 0.5) * 0.45),
  );

  // Small square eucalyptus seed capsules, clustered on the upper fork.
  for (let i = 0; i < 5; i++) {
    const x = 0.48 + (i % 3) * 0.028;
    const y = 1.40 + Math.floor(i / 3) * 0.04;
    const z = 0.305 + (i % 2) * 0.02;
    b.rod([0.47, 1.39, 0.29], [x, y, z], 0.004, {
      bone: stand,
      section: "box",
      color: C.barkLight,
      name: `gumNut${i}.stem`,
    });
    box(`gumNut${i}`, [x, y + 0.014, z], [0.023, 0.028, 0.023], "#91a386", stand);
    box(`gumNut${i}.cap`, [x, y + 0.03, z], [0.028, 0.006, 0.028], "#627e69", stand);
  }

  return b.root;
}
```