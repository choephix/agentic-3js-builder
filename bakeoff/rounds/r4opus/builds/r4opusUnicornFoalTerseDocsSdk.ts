import * as THREE from "three";
import {
  createBuilder,
  bezier,
  catmull,
  spiral,
  lerp,
  offset,
  limb,
  countershade,
  spots,
  paint,
  gradient,
  noise,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Unicorn Foal",
  description:
    "A wobbly-legged pastel unicorn foal: big glossy eyes, a pearl horn wound with gold, a rainbow mane and tail of chunky faceted locks, a flower crown, lilac rump dapples and a star mark on each hip.",
};

type V = [number, number, number];
type Loc = { local(p: any): THREE.Vector3 };

export default function build() {
  const b = createBuilder({ name: "unicornFoal" });

  // ---------- palette ----------
  const COAT = "#fbf6ff";
  const BELLY = "#e9ddf6";
  const SPOT = "#d6c3f0";
  const MUZZLE = "#f7d6e6";
  const INNER = "#f6a9cb";
  const HOOF = "#b49ae0";
  const GOLD = "#f2c45a";
  const PEARL = "#fff8ee";
  const NOSE = "#b5729a";
  const SOCK = "#f2d9f0";
  const FLUFF = "#ffffff";
  const TONGUE = "#ff8fb1";
  const RAINBOW = ["#ff9ec7", "#ffb89e", "#ffe69e", "#a9ecc4", "#9fd6ff", "#c4a8ff"];

  // model-direction offset from any frame (x = left, y = up, z = forward)
  const off = (f: Loc, x: number, y: number, z: number) =>
    f.local({
      [x >= 0 ? "left" : "right"]: Math.abs(x),
      [y >= 0 ? "up" : "down"]: Math.abs(y),
      [z >= 0 ? "forward" : "back"]: Math.abs(z),
    });

  // ---------- paints ----------
  const base = countershade(COAT, BELLY, { level: -0.25 });
  const rump = spots(base, SPOT, { size: 0.07, amount: 0.4, seed: 5 });
  const coat = paint((p) => (p.z + (noise(p, 0.12, 2) - 0.5) * 0.14 < -0.2 ? rump : base));
  const legPaint = gradient(coat, SOCK, [0, 0.3, 0], [0, 0.18, 0]);

  // ---------- textures ----------
  const eyeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110">
      <path d="M64 26 Q82 14 96 3 Q90 20 77 33 Z" fill="#2a1d4a"/>
      <path d="M75 40 Q89 33 100 29 Q94 44 81 51 Z" fill="#2a1d4a"/>
      <ellipse cx="46" cy="62" rx="36" ry="44" fill="#2a1d4a"/>
      <ellipse cx="46" cy="68" rx="28" ry="34" fill="#6b45c2"/>
      <ellipse cx="46" cy="80" rx="22" ry="20" fill="#a98cf2"/>
      <ellipse cx="46" cy="64" rx="15" ry="21" fill="#1b1033"/>
      <ellipse cx="34" cy="44" rx="11" ry="13" fill="#ffffff"/>
      <circle cx="60" cy="84" r="5" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );
  const markTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M50 8 L61 37 L93 37 L67 57 L77 89 L50 70 L23 89 L33 57 L7 37 L39 37 Z" fill="#ffd56b" stroke="#ff9ec7" stroke-width="5" stroke-linejoin="round"/>
      <path d="M84 4 L87 13 L96 16 L87 19 L84 28 L81 19 L72 16 L81 13 Z" fill="#9fd6ff"/>
      <path d="M14 66 L16 72 L22 74 L16 76 L14 82 L12 76 L6 74 L12 72 Z" fill="#c4a8ff"/>
    </svg>`,
    { size: 256 },
  );
  const blushTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><ellipse cx="50" cy="30" rx="46" ry="26" fill="#ff9ec7"/></svg>`,
    { size: 128 },
  );
  const flower = (petal: string, center: string) => {
    let petals = "";
    for (let k = 0; k < 5; k++)
      petals += `<ellipse cx="0" cy="-15" rx="10" ry="15" fill="${petal}" transform="rotate(${k * 72})"/>`;
    return svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g transform="translate(32 32)">${petals}<circle r="8" fill="${center}"/><circle cx="-2" cy="-2" r="3" fill="#ffffff"/></g></svg>`,
      { size: 128 },
    );
  };
  const FLOWERS = [flower("#ff9ec7", "#ffe066"), flower("#9fd6ff", "#fff3a0"), flower("#ffc59e", "#ff7fae")];

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.85, -0.36] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.85, -0.36],
      [0, 0.855, -0.04],
      [0, 0.88, 0.28],
    ],
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    [
      [0, 0.93, 0.27],
      [0, 1.1, 0.38],
      [0, 1.24, 0.45],
    ],
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.27, 0.47], dir: [0, -0.25, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: off(head, 0, -0.07, 0.06),
    aim: off(head, 0, -0.115, 0.28),
    role: "jaw",
  });
  const tailPts: V[] = [
    [0, 0.93, -0.43],
    [0, 0.9, -0.55],
    [0, 0.8, -0.64],
    [0, 0.65, -0.69],
    [0, 0.5, -0.68],
  ];
  const tail = b.chain("tail", catmull(tailPts), { parent: hips, count: 4, role: "tail" });

  // ---------- body ----------
  const body = b.loft(
    [
      { at: [0, 0.88, -0.47], w: 0.12, h: 0.14 },
      { at: [0, 0.87, -0.38], w: 0.27, h: 0.3 },
      { at: [0, 0.85, -0.18], w: 0.29, h: 0.3 },
      { at: [0, 0.85, 0.06], w: 0.28, h: 0.3 },
      { at: [0, 0.88, 0.26], w: 0.27, h: 0.32 },
      { at: [0, 0.93, 0.38], w: 0.16, h: 0.2 },
    ],
    { bone: spine, color: coat, detail: 1.25 },
  );

  const neckS = b.sweep(neck, (t: number): [number, number] => [0.072 - 0.012 * t, 0.09 - 0.015 * t], {
    color: coat,
  });

  // ---------- head ----------
  const headPaint = gradient(coat, MUZZLE, off(head, 0, 0, 0.16), off(head, 0, 0, 0.26));
  const headLoft = b.loft(
    [
      { at: off(head, 0, 0.02, -0.07), w: 0.15, h: 0.16 },
      { at: off(head, 0, 0.025, 0.04), w: 0.2, h: 0.21 },
      { at: off(head, 0, -0.02, 0.14), w: 0.15, h: 0.15 },
      { at: off(head, 0, -0.05, 0.24), w: 0.12, h: 0.11 },
      { at: off(head, 0, -0.06, 0.3), w: 0.1, h: 0.085 },
    ],
    { bone: head, color: headPaint, detail: 1.25 },
  );
  const headSurf = b.surface(headLoft);

  // lower jaw + tongue
  b.loft(
    [
      { at: off(head, 0, -0.08, 0.07), w: 0.11, h: 0.06 },
      { at: off(head, 0, -0.105, 0.19), w: 0.09, h: 0.05 },
      { at: off(head, 0, -0.112, 0.26), w: 0.075, h: 0.04 },
    ],
    { bone: jaw, color: MUZZLE },
  );
  b.part(new THREE.SphereGeometry(0.03, 8, 6).scale(1, 0.35, 1.6), TONGUE, {
    bone: jaw,
    at: off(head, 0, -0.088, 0.17),
  });

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // eyes
    b.decal(headLoft, eyeTex, {
      at: off(head, s * 0.085, 0.03, 0.07),
      dir: [s * 0.85, 0.1, 0.5],
      size: [0.07, 0.077],
      mirror: s < 0,
      bone: head,
    });
    // blush
    b.decal(headLoft, blushTex, {
      at: off(head, s * 0.07, -0.035, 0.13),
      dir: [s, -0.1, 0.4],
      size: [0.045, 0.027],
      bone: head,
    });
    // nostrils
    const nh = headSurf.ray(off(head, s * 0.026, -0.045, 0.6), [0, 0, -1]);
    if (nh) b.stick(new THREE.SphereGeometry(0.011, 6, 4).scale(1, 0.5, 1.3), NOSE, nh, { bone: head });

    // ears
    const a = (22 * Math.PI) / 180;
    const ey: V = [s * Math.sin(a), Math.cos(a), 0];
    const ex: V = [Math.cos(a), -s * Math.sin(a), 0];
    const earBase = off(head, s * 0.06, 0.088, -0.015);
    const earJ = b.joint(`ear${S}`, { parent: head, at: earBase, dir: ey });
    const ear = b.extrude(
      [
        [-0.032, 0],
        [0.032, 0],
        [0.03, 0.05],
        [0, 0.11, "sharp"],
        [-0.03, 0.05],
      ],
      { at: earBase, x: ex, y: ey, thickness: 0.022, bevel: 0.006, smoothing: 2, color: COAT, bone: earJ },
    );
    b.extrude(
      [
        [-0.018, 0.015],
        [0.018, 0.015],
        [0.016, 0.05],
        [0, 0.09, "sharp"],
        [-0.016, 0.05],
      ],
      { at: ear.local([0, 0, 0.011]), x: ex, y: ey, thickness: 0.006, smoothing: 2, color: INNER, bone: earJ },
    );

    // cutie mark on each hip
    b.decal(body, markTex, {
      at: [s * 0.13, 0.94, -0.28],
      dir: [s, 0.35, 0],
      size: [0.1, 0.1],
      mirror: s < 0,
    });
  }

  // ---------- horn ----------
  const hornHit = headSurf.around(head.at).at(0, 62);
  const hornBase = hornHit ? hornHit.moved([0, -0.012, 0]) : head;
  const hornDir: V = [0, 1, 0.42];
  const hb = lerp(hornBase, hornBase, 0);
  const hornTip = offset(hb, hornDir, 0.18);
  b.spike(hb, hornDir, 0.18, 0.024, {
    bone: head,
    color: gradient(PEARL, "#ffe3a3", hb, hornTip),
    sides: 8,
  });
  b.sweep(
    spiral(hb, hb.clone().add(new THREE.Vector3(0.026, 0, 0)), hornDir, { turns: 2.5, r1: 0.006, pitch: 0.06 }),
    0.0055,
    { bone: head, color: GOLD, sides: 5 },
  );
  b.part(new THREE.TorusGeometry(0.027, 0.007, 5, 12), GOLD, {
    bone: head,
    at: offset(hb, hornDir, 0.012),
    dir: hornDir,
    axis: "z",
    flat: true,
  });

  // ---------- flower crown ----------
  const crown: [number, number][] = [
    [45, 70],
    [-45, 70],
    [66, 50],
    [-66, 50],
  ];
  crown.forEach(([az, el], i) => {
    const h = headSurf.around(head.at).at(az, el);
    if (!h) return;
    b.stick(new THREE.CircleGeometry(0.021, 10).rotateX(-Math.PI / 2), "#ffffff", h.moved([0, 0.007, 0]), {
      texture: FLOWERS[i % 3],
      embed: 0,
      bone: head,
      spin: i * 37,
    });
  });

  // ---------- rainbow mane ----------
  const lock = (start: any, p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, r: number, color: string) =>
    b.sweep(bezier(start, p1, p2, p3), [r, r * 1.1, r * 0.75, 0], { color, sides: 6, smooth: false });

  let i = 0;
  b.along(
    neckS,
    7,
    (at) => {
      for (const s of [1, -1]) {
        const k = (i + (s > 0 ? 0 : 3)) % 6;
        lock(at, off(at, s * 0.025, 0.05, -0.03), off(at, s * 0.065, 0.035, -0.09), off(at, s * 0.08, -0.05, -0.085), 0.032, RAINBOW[k]);
      }
      i++;
    },
    { from: 0.05, to: 1 },
  );
  [75, 50, 28].forEach((el, j) => {
    const h = headSurf.around(head.at).at(180, el);
    if (!h) return;
    for (const s of [1, -1]) {
      const k = (j * 2 + (s > 0 ? 1 : 4)) % 6;
      lock(h, off(h, s * 0.03, 0.04, -0.04), off(h, s * 0.07, 0.01, -0.08), off(h, s * 0.08, -0.06, -0.07), 0.03, RAINBOW[k]);
    }
  });

  // ---------- rainbow tail ----------
  b.sweep(tail, 0.042, { to: 0.3, color: coat });
  for (let k = 0; k < 6; k++) {
    const ph = (k / 6) * Math.PI * 2 + 0.3;
    const sp = new THREE.Vector3(Math.cos(ph) * 0.06, Math.sin(ph) * 0.035, -Math.sin(ph) * 0.035);
    const pts = tailPts.map((p, j) => new THREE.Vector3(p[0], p[1], p[2]).addScaledVector(sp, j / 3));
    const tip = pts[pts.length - 1];
    pts.push(tip.clone().add(new THREE.Vector3(sp.x * 0.5, 0.05, -0.04 + sp.z * 0.3)));
    b.sweep(catmull(pts), [0.026, 0.045, 0.048, 0.038, 0.022, 0], {
      bone: tail,
      color: RAINBOW[k],
      sides: 6,
      smooth: false,
    });
  }
  const tp = tail.at(0.25);
  b.part(new THREE.TorusGeometry(0.06, 0.012, 6, 14), GOLD, { at: tp, dir: tp.tangent, axis: "z", flat: true });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const defs = [
      {
        chain: `front${S}`,
        root: [s * 0.085, 0.82, 0.2] as V,
        foot: [s * 0.1, 0.08, 0.21] as V,
        lengths: [0.27, 0.26, 0.26],
        bends: [
          [0, 0, -1],
          [0, 0, 1],
        ],
        names: [`shoulder${S}`, `elbow${S}`, `knee${S}`, `frontHoof${S}`],
        parent: chest,
        radii: [0.062, 0.048, 0.036, 0.033, 0.038, 0.027, 0.03],
      },
      {
        chain: `hind${S}`,
        root: [s * 0.085, 0.84, -0.3] as V,
        foot: [s * 0.1, 0.08, -0.33] as V,
        lengths: [0.28, 0.28, 0.26],
        bends: [
          [0, 0, 1],
          [0, 0, -1],
        ],
        names: [`hip${S}`, `stifle${S}`, `hock${S}`, `hindHoof${S}`],
        parent: hips,
        radii: [0.078, 0.06, 0.042, 0.034, 0.04, 0.027, 0.03],
      },
    ];
    for (const d of defs) {
      const pts = limb(d.root, d.foot, d.lengths, d.bends);
      const leg = b.chain(d.chain, pts, {
        parent: d.parent,
        names: d.names,
        role: "leg",
        contact: [d.foot[0], 0, d.foot[2]],
      });
      const tipJ = leg.joints[3];
      b.sweep(leg, d.radii, { color: legPaint });

      // fetlock feathering
      b.ring(leg.at(0.92), { count: 8, radius: 0.022, tilt: 60 }, (it) =>
        b.spike(it, it, 0.05, 0.015, { color: FLUFF, sides: 5 }),
      );

      // hoof + gold rim
      b.lathe(
        [
          [0, 0],
          [0.042, 0],
          [0.044, 0.012],
          [0.036, 0.075],
          [0, 0.08],
        ],
        { at: [d.foot[0], 0, d.foot[2]], bone: tipJ, segments: 10, color: HOOF },
      );
      b.part(new THREE.TorusGeometry(0.036, 0.007, 5, 12), GOLD, {
        bone: tipJ,
        at: [d.foot[0], 0.072, d.foot[2]],
        dir: [0, 1, 0],
        axis: "z",
        flat: true,
      });
    }
  }

  return b.root;
}
