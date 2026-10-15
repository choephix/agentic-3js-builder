import * as THREE from "three";
import { createBuilder, frame, limb, noise, rng } from "../../../../src/index";
import type { ColorInput, Frame, Joint } from "../../../../src/index";
import {
  bayer,
  cellPaint,
  pick,
  pixelArt,
  pixelTexture,
  skinBox,
  skinLayout,
  stepped,
  tileBox,
} from "../../../../kits/pixel";
import type { Cell } from "../../../../kits/pixel";

export const meta = {
  name: "Pixel Koala on Eucalyptus Stand",
  description:
    "A chunky pixel-art koala sitting astride a eucalyptus branch, gripping it with all four paws, mounted on a wooden display stand with a gum trunk, leafy twigs, blossoms and gumnuts.",
};

type P3 = [number, number, number];

// One texel size for the whole model.
const T = 0.016;

// Palettes (dark to light)
const FUR = ["#34364a", "#4f5368", "#72768b", "#9a9eb0", "#c3c7d4"];
const CREAM = ["#9d9078", "#c4b89c", "#e2d8be", "#f6f0dc"];
const HAND = ["#1b1c24", "#2a2c37", "#3c3f4d", "#515566"];
const PINK = ["#b8626f", "#d8808c", "#eea3ac", "#fbc9ce"];
const BARK = ["#4b4036", "#6b5b4b", "#8c7d68", "#aea08a", "#cfc4aa"];
const SAGE = ["#5d6a54", "#7d8c6c", "#9aa886"];
const WOOD = ["#4e3220", "#6e4730", "#8f6040", "#b08052"];
const LEAF_A = ["#173f34", "#255c4a", "#3b8168", "#7cb897"];
const LEAF_B = ["#27381c", "#415c2a", "#628a3e", "#a3c76a"];

const NOSE = "#15131a";
const CLAW = "#ddd3bc";
const PEEL = "#d8cfb6";
const SCAR = "#3d3128";
const BRASS = "#c9a24a";

function furColor(c: Cell, seed: number, bias = 0) {
  const nz = noise(c.at, 0.1, seed);
  let v = 0.46 + 0.3 * c.n.y + (nz - 0.5) * 0.7 + bias;
  const r = c.random(seed);
  if (r < 0.06) v += 0.22;
  else if (r > 0.95) v -= 0.2;
  return c.pick(FUR, v);
}

export default function build() {
  const b = createBuilder({ name: "pixel_koala_stand" });
  const R = rng(77);

  // ------------------------------------------------------------------ paints
  const BODY = cellPaint(
    T,
    (c) => {
      const x = Math.abs(c.at.x);
      const edge = 0.14 + (c.v & 1 ? 0.014 : 0) + (noise(c.at, 0.05, 9) - 0.5) * 0.04;
      const front = c.n.z > 0.6 && c.at.y > 0.58 && c.at.y < 1.08;
      if (front && x < edge) return c.pick(CREAM, 0.6 + (noise(c.at, 0.06, 4) - 0.5) * 0.5 + c.random(3) * 0.1);
      return furColor(c, 1);
    },
    { dither: true },
  );
  const LIMB = cellPaint(T, (c) => furColor(c, 3, -0.06), { dither: true });
  const FURC = cellPaint(T, (c) => furColor(c, 2, 0.14), { dither: true });
  const HANDP = cellPaint(T, (c) => c.pick(HAND, 0.4 + 0.4 * c.n.y + (c.random(6) - 0.5) * 0.3), { dither: true });
  const JAW = cellPaint(T, (c) => c.pick(CREAM, 0.55 + (c.random(4) - 0.5) * 0.4 + 0.2 * c.n.y), { dither: true });
  const FLUFF = cellPaint(T, (c) => c.pick(CREAM, 0.72 + (c.random(7) - 0.5) * 0.4 + 0.15 * c.n.y), {
    dither: true,
  });
  const EAR_OUT = cellPaint(T, (c) => c.pick(FUR, 0.35 + 0.3 * c.n.y + (c.random(8) - 0.5) * 0.35), { dither: true });
  const EAR_IN = cellPaint(
    T,
    (c) => (c.random(12) < 0.14 ? CREAM[3] : c.pick(PINK, 0.5 + 0.25 * c.n.z + (c.random(13) - 0.5) * 0.3)),
    { dither: true },
  );
  const BARKP = cellPaint(
    T,
    (c) => {
      const q = new THREE.Vector3(c.at.x * 3.2, c.at.y * 0.5, c.at.z * 3.2);
      let v = noise(q, 0.12, 3) * 0.95 + 0.08 * c.n.y;
      if (c.random(2) < 0.09) v += 0.25;
      if ((c.v + c.u * 7) % 19 === 0) v -= 0.3;
      if (noise(q, 0.2, 14) > 0.7) return c.pick(SAGE, v + 0.1);
      return c.pick(BARK, v);
    },
    { dither: true },
  );

  // ---------------------------------------------------------------- textures
  const HL = skinLayout({ head: [32, 22, 22] });
  const HEAD = pixelTexture(HL.size[0], HL.size[1], (g) => {
    const rs = rng(11);
    const F = HL.faces.head;
    g.fill((x, y) => pick(FUR, 0.38 + (rs() - 0.5) * 0.3, bayer(x, y)), F.py);
    g.fill((x, y) => pick(FUR, 0.42 + (rs() - 0.5) * 0.3, bayer(x, y)), F.nz);
    g.fill((x, y) => pick(CREAM, 0.5 + (rs() - 0.5) * 0.3, bayer(x, y)), F.ny);
    for (const rect of [F.px, F.nx])
      g.fill((x, y, _w, h) => {
        if (y >= h - 6 + (x % 2)) return pick(CREAM, 0.6 + (rs() - 0.5) * 0.3, bayer(x, y));
        return pick(FUR, 0.56 - 0.1 * (y / h) + (rs() - 0.5) * 0.3, bayer(x, y));
      }, rect);
    g.fill((x, y) => {
      const dx = (x - 15.5) / 8;
      const dy = (y - 14.5) / 7;
      const muzzle = dx * dx + dy * dy < 1;
      const cheek = (x < 5 || x > 26) && y >= 11 + (x % 2);
      if (muzzle || cheek || y >= 19)
        return pick(CREAM, 0.55 + (rs() - 0.5) * 0.35 + (muzzle ? 0.12 : 0), bayer(x, y));
      const v = 0.52 + (rs() - 0.5) * 0.3 - (y < 6 ? 0.18 : 0) + (Math.abs(x - 15.5) < 9 ? 0.06 : 0);
      return pick(FUR, v, bayer(x, y));
    }, F.pz);
    const EP = { d: "#2c2e40", k: "#07070c", w: "#ffffff" };
    g.stamp(F.pz[0] + 5, F.pz[1] + 7, [".ddd.", "dkkwd", "dkkkd", "dkkkd", ".ddd."], EP);
    g.stamp(F.pz[0] + 22, F.pz[1] + 7, [".ddd.", "dwkkd", "dkkkd", "dkkkd", ".ddd."], EP);
    for (let x = 9; x <= 22; x++) g.set(F.pz[0] + x, F.pz[1] + 21, "#3a2a30");
  });

  const WOODT = pixelTexture(64, 64, (g) => {
    const r = rng(21);
    g.fill((x, y) => {
      const plank = Math.floor(y / 8);
      if (y % 8 === 0) return WOOD[0];
      const grain = Math.sin((x + plank * 13) * 0.35 + r() * 0.8) * 0.5 + 0.5;
      return pick(WOOD, 0.4 + ((plank * 17) % 5) * 0.06 + grain * 0.25 + (r() - 0.5) * 0.2, bayer(x, y));
    });
    for (let p = 0; p < 8; p++) {
      const jx = (p * 23 + 9) % 64;
      for (let y = p * 8 + 1; y < p * 8 + 8; y++) g.set(jx, y, WOOD[0]);
      g.set((jx + 3) % 64, p * 8 + 3, "#2a1a10");
    }
  });

  const makeLeaf = (seed: number, pal: string[]) =>
    pixelTexture(8, 26, (g) => {
      const r = rng(seed);
      for (let y = 0; y < 26; y++) {
        const t = y / 25;
        let w = 3.5 * Math.sin(Math.PI * Math.pow(t, 0.8));
        if (y >= 23) w = Math.max(w, 0.6);
        const cx = 3.5 + 1.6 * (1 - t) * (1 - t);
        for (let x = 0; x < 8; x++) {
          const d = x + 0.5 - cx;
          if (Math.abs(d) > w) continue;
          let col: string;
          if (y >= 23) col = pal[0];
          else if (Math.abs(d) > w - 0.9) col = pal[0];
          else if (Math.abs(d) < 0.6) col = pal[3];
          else col = d < 0 ? pal[2] : pal[1];
          if (col === pal[1] && r() < 0.18) col = pal[2];
          g.set(x, y, col);
        }
      }
    });
  const LEAFA = makeLeaf(31, LEAF_A);
  const LEAFB = makeLeaf(32, LEAF_B);

  const BLOSS = pixelArt(
    ["..ppp..", ".pPPPp.", "pPPyPPp", "pPyyyPp", "pPPyPPp", ".pPPPp.", "..ppp.."],
    { p: "#c94a74", P: "#f27a9c", y: "#ffe28a" },
  );

  const PLAQUE = pixelTexture(40, 12, (g) => {
    g.fill((x, y) => (x === 0 || y === 0 || x === 39 || y === 11 ? "#e8d9a0" : "#2c4a3c"));
    g.fill((x, y) => (x === 1 || y === 1 || x === 38 || y === 10 ? "#1b3026" : ""));
    g.stamp(
      4,
      2,
      ["......ggg", "....ggGGg", "..ggGGGg.", ".gGGGGg..", "gGGGgg...", "gGgg.....", "g........"],
      { g: "#173f34", G: "#7cb897" },
    );
    for (let i = 0; i < 4; i++) {
      for (let x = 16; x < 36; x++) if ((x + i * 2) % 5 !== 0) g.set(x, 3 + i * 2 - (i > 1 ? 0 : 0), i % 2 ? "#b9a874" : "#e8d9a0");
    }
  });

  // ---------------------------------------------------------------- skeleton
  const root = b.joint("root", { at: [0, 0, 0] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.64, -0.03],
      [0, 0.84, -0.02],
      [0, 1.04, 0.0],
    ],
    { parent: root, names: ["hips", "chest", "neckBase"], role: "spine" },
  );
  const hips = spine.joints[0];
  const chest = spine.joints[1];
  const neckBase = spine.joints[2];
  const neck = b.joint("neck", { parent: neckBase, at: [0, 1.05, 0.0], dir: [0, 1, 0.15], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.11, 0.03], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.14, 0.05], dir: [0, 0, 1], role: "jaw" });
  const earL = b.joint("earL", { parent: head, at: [0.27, 1.42, 0.02], dir: [0, 1, 0], role: "hinge" });
  const earR = b.joint("earR", { parent: head, at: [-0.27, 1.42, 0.02], dir: [0, 1, 0], role: "hinge" });

  const box = (bone: Joint, size: P3, at: P3, color: ColorInput) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at });

  // -------------------------------------------------------------------- stand
  const baseLow = tileBox([0.96, 0.07, 0.96], WOODT, T, { rand: rng(5), step: [1, 8] });
  b.part(baseLow, "#ffffff", { texture: WOODT, bone: root, at: [0, 0.035, -0.02] });
  const baseUp = tileBox([0.66, 0.05, 0.66], WOODT, T, { rand: rng(6), step: [1, 8] });
  b.part(baseUp, "#ffffff", { texture: WOODT, bone: root, at: [0, 0.095, -0.02] });
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(root, [0.03, 0.01, 0.03], [sx * 0.3, 0.123, -0.02 + sz * 0.3], BRASS);
  b.part(new THREE.BoxGeometry(0.4, 0.015, 0.1), "#ffffff", { texture: PLAQUE, bone: root, at: [0, 0.0775, 0.38] });

  // trunk
  const TZ = -0.345;
  const trunkHalf = (y: number) => (0.26 - (0.09 * (y - 0.12)) / 1.73) / 2;
  box(root, [0.34, 0.06, 0.34], [0, 0.15, TZ], BARKP);
  b.frustumBox([0, 0.12, TZ], [0, 1.85, TZ], [0.26, 0.26], [0.17, 0.17], { color: BARKP, bone: root });
  for (let i = 0; i < 8; i++) {
    const y = 0.3 + R() * 1.4;
    const h = trunkHalf(y);
    const kind = i % 3;
    if (kind === 0) box(root, [0.07, 0.22, 0.012], [R() * 0.08 - 0.04, y, TZ + h], PEEL);
    else if (kind === 1) box(root, [0.012, 0.2, 0.07], [h, y, TZ + (R() - 0.5) * 0.08], PEEL);
    else box(root, [0.012, 0.18, 0.07], [-h, y, TZ + (R() - 0.5) * 0.08], PEEL);
  }
  for (const y of [0.55, 1.0, 1.45]) {
    box(root, [0.06, 0.07, 0.03], [(R() - 0.5) * 0.1, y, TZ + trunkHalf(y)], SCAR);
    box(root, [0.03, 0.03, 0.03], [(R() - 0.5) * 0.1 + 0.05, y - 0.05, TZ + trunkHalf(y)], SCAR);
  }

  // the branch the koala sits on, and a brace beneath it
  b.frustumBox([0, 0.455, -0.3], [0, 0.52, 0.62], [0.13, 0.13], [0.11, 0.11], { color: BARKP, bone: root });
  box(root, [0.1, 0.1, 0.01], [0, 0.524, 0.627], "#d9c9a0");
  box(root, [0.05, 0.05, 0.012], [0.01, 0.526, 0.633], "#b99f6e");
  b.frustumBox([0, 0.13, -0.3], [0, 0.44, 0.06], [0.09, 0.09], [0.08, 0.08], { color: BARKP, bone: root });
  box(root, [0.15, 0.15, 0.15], [0, 0.455, -0.3], BARKP);

  // leafy twigs
  const leafFrames: Frame[] = [];
  const blossFrames: Frame[] = [];
  const V = (p: P3) => new THREE.Vector3(p[0], p[1], p[2]);
  const seg = (a: P3, c: P3, w0: number, w1: number) => {
    b.frustumBox(a, c, [w0, w0], [w1, w1], { color: BARKP, bone: root });
    box(root, [w1 * 1.15, w1 * 1.15, w1 * 1.15], c, BARKP);
  };
  const leafy = (from: P3, to: P3, n: number, droop: number) => {
    const a = V(from);
    const c = V(to);
    const dir = c.clone().sub(a).normalize();
    for (let i = 0; i < n; i++) {
      const t = 0.3 + 0.7 * (i / Math.max(1, n - 1));
      const p = a.clone().lerp(c, t);
      const d = dir
        .clone()
        .multiplyScalar(0.6)
        .add(new THREE.Vector3((R() - 0.5) * 1.2, (R() - 0.5) * 0.8 - droop, (R() - 0.5) * 1.2))
        .normalize();
      leafFrames.push(frame(p, d));
    }
  };
  const blossom = (p: P3) => {
    for (let i = 0; i < 2; i++)
      blossFrames.push(frame(V([p[0] + (R() - 0.5) * 0.12, p[1] + (R() - 0.3) * 0.1, p[2] + (R() - 0.5) * 0.08]), new THREE.Vector3(0, 1, 0.15)));
  };
  const gumnut = (p: P3) => {
    box(root, [0.01, 0.04, 0.01], [p[0], p[1] - 0.02, p[2]], SCAR);
    box(root, [0.028, 0.03, 0.028], [p[0], p[1] - 0.055, p[2]], "#7a5a3a");
    box(root, [0.034, 0.012, 0.034], [p[0], p[1] - 0.034, p[2]], "#a58452");
  };

  // B1: to the model's left, level with the koala's shoulder
  const b1: P3[] = [
    [0.06, 1.05, TZ],
    [0.42, 1.16, -0.24],
    [0.72, 1.12, 0.02],
  ];
  seg(b1[0], b1[1], 0.1, 0.075);
  seg(b1[1], b1[2], 0.075, 0.05);
  leafy(b1[1], b1[2], 16, 0.5);
  leafy(b1[2], [0.9, 1.1, 0.12], 6, 0.4);
  blossom([0.74, 1.18, 0.0]);
  gumnut([0.56, 1.12, -0.1]);
  gumnut([0.6, 1.1, -0.08]);

  // B2: high, to the model's right
  const b2: P3[] = [
    [-0.06, 1.4, TZ],
    [-0.38, 1.52, -0.3],
    [-0.74, 1.66, -0.22],
  ];
  seg(b2[0], b2[1], 0.09, 0.07);
  seg(b2[1], b2[2], 0.07, 0.045);
  leafy(b2[1], b2[2], 16, 0.45);
  leafy(b2[2], [-0.92, 1.7, -0.15], 6, 0.3);
  blossom([-0.76, 1.72, -0.2]);
  blossom([-0.5, 1.6, -0.28]);
  gumnut([-0.58, 1.56, -0.26]);

  // B3: low, to the model's right
  const b3: P3[] = [
    [-0.06, 0.8, TZ],
    [-0.35, 0.88, -0.2],
    [-0.62, 0.84, 0.0],
  ];
  seg(b3[0], b3[1], 0.09, 0.07);
  seg(b3[1], b3[2], 0.07, 0.045);
  leafy(b3[1], b3[2], 14, 0.6);
  leafy(b3[2], [-0.78, 0.8, 0.08], 5, 0.5);
  gumnut([-0.5, 0.86, -0.08]);

  // B4: crown and a front-left twig
  const b4: P3[] = [
    [0.0, 1.85, TZ],
    [0.2, 2.0, -0.3],
    [0.36, 2.08, -0.22],
  ];
  seg(b4[0], b4[1], 0.1, 0.07);
  seg(b4[1], b4[2], 0.07, 0.045);
  leafy(b4[1], b4[2], 10, 0.2);
  const b5: P3[] = [
    [-0.02, 1.9, TZ],
    [-0.2, 2.02, -0.38],
    [-0.32, 2.1, -0.45],
  ];
  seg(b5[0], b5[1], 0.09, 0.06);
  seg(b5[1], b5[2], 0.06, 0.04);
  leafy(b5[1], b5[2], 9, 0.2);
  leafy([0, 1.9, TZ], [0, 2.18, -0.34], 8, -0.1);
  const b6: P3[] = [
    [0.06, 1.65, TZ],
    [0.3, 1.74, -0.28],
    [0.52, 1.84, -0.18],
  ];
  seg(b6[0], b6[1], 0.08, 0.06);
  seg(b6[1], b6[2], 0.06, 0.04);
  leafy(b6[1], b6[2], 10, 0.35);
  blossom([0.54, 1.9, -0.16]);
  blossom([0.38, 2.12, -0.2]);
  blossom([0, 2.2, -0.34]);

  b.cards(leafFrames, [LEAFA, LEAFB], {
    size: [0.075, 0.23],
    vary: 0.3,
    spin: 25,
    rng: rng(90),
    cross: true,
    flow: [0, -1, 0],
    bend: 25,
    bone: root,
  });
  b.cards(blossFrames, BLOSS, { size: [0.09, 0.09], vary: 0.2, cross: true, flow: [0, 0, 1], rng: rng(91), bone: root });

  // ------------------------------------------------------------------- koala
  // torso
  box(hips, [0.5, 0.22, 0.36], [0, 0.655, -0.03], BODY);
  box(hips, [0.36, 0.26, 0.1], [0, 0.78, 0.17], BODY);
  box(chest, [0.46, 0.34, 0.34], [0, 0.9, -0.02], BODY);
  box(chest, [0.5, 0.1, 0.3], [0, 1.0, -0.02], BODY);
  box(neck, [0.34, 0.1, 0.3], [0, 1.08, 0.0], BODY);
  // chest bib fringe
  for (const [x, y, w] of [
    [0, 1.0, 0.22],
    [0.07, 0.95, 0.1],
    [-0.07, 0.95, 0.1],
    [0, 0.9, 0.06],
  ] as P3[])
    box(chest, [w, 0.05, 0.03], [x, y, 0.155], FLUFF);
  box(hips, [0.3, 0.14, 0.06], [0, 0.64, -0.23], FLUFF);

  // head
  b.part(skinBox(HEAD, HL.faces.head, T), "#ffffff", { texture: HEAD, bone: head, at: [0, 1.3, 0.07] });
  box(head, [0.3, 0.07, 0.22], [0, 1.115, 0.17], JAW).mesh.name = "jawBox";
  b.pose(jaw, { axis: [1, 0, 0], deg: 0 });
  // nose
  box(head, [0.128, 0.1, 0.07], [0, 1.255, 0.27], NOSE);
  box(head, [0.1, 0.05, 0.06], [0, 1.325, 0.265], NOSE);
  box(head, [0.028, 0.02, 0.01], [-0.03, 1.29, 0.307], "#6a6d86");
  box(head, [0.014, 0.014, 0.01], [-0.012, 1.315, 0.3], "#6a6d86");
  box(head, [0.2, 0.016, 0.012], [0, 1.153, 0.282], "#2b1a20");
  // cheek ruffs
  for (const s of [1, -1])
    (
      [
        [1.27, 0.075, 0.2],
        [1.205, 0.06, 0.17],
        [1.145, 0.04, 0.12],
      ] as P3[]
    ).forEach(([y, w, d]) => box(head, [w, 0.06, d], [s * (0.256 + w / 2 - 0.012), y, 0.13], FLUFF));
  // forehead crest
  box(head, [0.16, 0.035, 0.12], [0, 1.485, 0.1], FURC);
  box(head, [0.1, 0.03, 0.1], [0.1, 1.48, 0.06], FURC);
  box(head, [0.1, 0.03, 0.1], [-0.1, 1.48, 0.06], FURC);

  // ears: big round pixel discs with pink centres and a fringe of fluff
  const EC = 0.03;
  const earOut = stepped(
    [2, 3, 4, 4, 4, 4, 3, 2].map((h) => [-h, h] as [number, number]),
    EC,
    { rows: true },
  );
  const earIn = stepped(
    [2, 3, 3, 3, 3, 2].map((h) => [-h, h] as [number, number]),
    EC,
    { rows: true },
  );
  for (const s of [1, -1]) {
    const earJ = s > 0 ? earL : earR;
    const cx = s * 0.27;
    b.extrude(earOut, { at: [cx, 1.38, 0.02], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.07, color: EAR_OUT, bone: earJ });
    b.extrude(earIn, { at: [cx, 1.41, 0.032], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.05, color: EAR_IN, bone: earJ });
    for (const a of [-35, -5, 25, 55, 85, 115, 145, 175]) {
      const r = (a * Math.PI) / 180;
      const px = Math.round((cx + s * Math.cos(r) * 0.125) / 0.015) * 0.015;
      const py = Math.round((1.5 + Math.sin(r) * 0.125) / 0.015) * 0.015;
      box(earJ, [0.055, 0.055, 0.095], [px, py, 0.02], FLUFF);
    }
  }

  // paws: palm, three digits that curl over the branch, claws
  const paw = (prefix: string, s: number, wrist: Joint, c: P3, size: P3, zs: number[], fw: number) => {
    box(wrist, size, c, HANDP);
    const ax = Math.abs(c[0]);
    zs.forEach((z, i) => {
      const y = c[1] + 0.07;
      const j = b.joint(`${prefix}${i + 1}`, { parent: wrist, at: [s * ax, y, z], dir: [-s, 0.3, 0], role: "digit" });
      box(j, [0.05, 0.075, fw], [s * ax, y, z], HANDP);
      box(j, [0.085, 0.032, fw], [s * (ax - 0.05), c[1] + 0.075, z], HANDP);
      box(j, [0.03, 0.022, fw * 0.75], [s * (ax - 0.1), c[1] + 0.075, z], CLAW);
    });
  };

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    // arm reaching down-forward to hug the branch
    const sh = V([s * 0.27, 0.96, 0.02]);
    const hand = V([s * 0.12, 0.52, 0.36]);
    const ap = limb(sh, hand, [0.33, 0.31], [[s, 0, -0.3]]);
    const arm = b.chain(`arm${L}`, ap, {
      parent: chest,
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
      role: "arm",
    });
    b.frustumBox(ap[0], ap[1], [0.15, 0.15], [0.12, 0.12], { color: LIMB, bone: arm.joints[0] });
    b.frustumBox(ap[1], ap[2], [0.12, 0.12], [0.1, 0.1], { color: LIMB, bone: arm.joints[1] });
    box(arm.joints[0], [0.17, 0.17, 0.17], [ap[0].x, ap[0].y, ap[0].z], LIMB);
    box(arm.joints[1], [0.13, 0.13, 0.13], [ap[1].x, ap[1].y, ap[1].z], LIMB);
    box(arm.joints[2], [0.105, 0.105, 0.105], [ap[2].x, ap[2].y, ap[2].z], HANDP);
    box(arm.joints[1], [0.06, 0.05, 0.05], [ap[1].x + s * 0.05, ap[1].y + 0.02, ap[1].z - 0.05], FLUFF);
    paw(`finger${L}`, s, arm.joints[2], [s * 0.12, 0.52, 0.36], [0.09, 0.09, 0.16], [0.305, 0.36, 0.415], 0.04);

    // leg folded up, foot gripping the branch
    const hip = V([s * 0.19, 0.67, -0.02]);
    const ank = V([s * 0.13, 0.51, 0.17]);
    const lp = limb(hip, ank, [0.25, 0.22], [[s, -0.2, -0.4]]);
    const leg = b.chain(`leg${L}`, lp, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
    });
    b.frustumBox(lp[0], lp[1], [0.15, 0.15], [0.12, 0.12], { color: LIMB, bone: leg.joints[0] });
    b.frustumBox(lp[1], lp[2], [0.12, 0.12], [0.09, 0.09], { color: LIMB, bone: leg.joints[1] });
    box(leg.joints[0], [0.17, 0.17, 0.17], [lp[0].x, lp[0].y, lp[0].z], LIMB);
    box(leg.joints[1], [0.135, 0.135, 0.135], [lp[1].x, lp[1].y, lp[1].z], LIMB);
    paw(`toe${L}`, s, leg.joints[2], [s * 0.13, 0.51, 0.17], [0.1, 0.07, 0.17], [0.12, 0.17, 0.22], 0.04);
  }

  return b.root;
}
