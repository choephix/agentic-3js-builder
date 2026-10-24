import * as THREE from "three";
import { createBuilder, rng, polyline, noise } from "../../../../src/index";
import type { Paint, Joint } from "../../../../src/index";
import { cellPaint, pixelArt, pixelTexture, tileBox, stepped, snapColor } from "../../../../kits/pixel";

export const meta = {
  name: "Humpback Whale",
  description:
    "A voxel humpback whale (about 15.7 m): stepped-block body with a pleated white throat and belly, tubercled head, long knuckled flippers, a humped dorsal fin and a notched fluke. Rigged with spine, jaw, flipper and tail chains.",
};

// ---------------------------------------------------------------------------------------------------------------
// Voxel grid: everything snaps to V = 0.28 m.
const V = 0.28;
const D = 2 * V; // slice depth
const CY = 6 * V; // spine height; belly bottoms out on y = 0
const snap = (x: number) => Math.round(x / V) * V;

// z, upper half-height, lower half-height, half-width
const PROFILE: number[][] = [
  [6.72, 0.7, 0.8, 0.6],
  [5.9, 1.0, 1.05, 0.95],
  [4.8, 1.2, 1.4, 1.3],
  [3.6, 1.4, 1.6, 1.5],
  [2.0, 1.5, 1.68, 1.6],
  [0, 1.5, 1.68, 1.58],
  [-2, 1.35, 1.4, 1.3],
  [-4, 1.1, 1.0, 0.95],
  [-6, 0.8, 0.6, 0.6],
  [-7.5, 0.55, 0.4, 0.38],
  [-8.96, 0.42, 0.3, 0.28],
];
function prof(z: number, col: number) {
  if (z >= PROFILE[0][0]) return PROFILE[0][col];
  for (let k = 0; k < PROFILE.length - 1; k++) {
    const a = PROFILE[k];
    const c = PROFILE[k + 1];
    if (z <= a[0] && z >= c[0]) {
      const t = (a[0] - z) / (a[0] - c[0]);
      return a[col] + (c[col] - a[col]) * t;
    }
  }
  return PROFILE[PROFILE.length - 1][col];
}
const RISE: number[][] = [
  [-1, 0],
  [-3, 0.15],
  [-5, 0.45],
  [-7, 0.85],
  [-8.96, 1.35],
];
function ycAt(z: number) {
  if (z >= RISE[0][0]) return CY;
  for (let k = 0; k < RISE.length - 1; k++) {
    const a = RISE[k];
    const c = RISE[k + 1];
    if (z <= a[0] && z >= c[0]) return CY + a[1] + (c[1] - a[1]) * ((a[0] - z) / (a[0] - c[0]));
  }
  return CY + RISE[RISE.length - 1][1];
}
// The mouth line: low at the front, stepping up toward the eye.
const mouthY = (z: number) => (z > 4.5 ? CY - V : z > 3.9 ? CY : CY + V);
const bellyHeight = (zc: number) => (zc < -4.3 ? 0 : zc < -1.5 ? 2 * V : 3 * V);

type Slice = {
  i: number;
  zc: number;
  yc: number;
  hw: number;
  yTop: number;
  yBot: number;
};

export default function build() {
  const b = createBuilder({ name: "humpback_whale", paintSize: 2048 });
  const r = rng(11);

  // ------------------------------------------------------------------------------------------------------------
  // Skeleton
  const hips = b.joint("hips", { at: [0, CY, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, CY, 0],
      [0, CY, 1.2],
      [0, CY, 2.4],
      [0, CY, 3.6],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const head = b.joint("head", {
    parent: spine.joints[2],
    at: [0, CY, 3.6],
    aim: [0, CY, 6.7],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, CY - 0.2, 3.45],
    aim: [0, CY - 0.2, 6.8],
    role: "jaw",
  });
  const tailZ = [0, -2.5, -5, -7, -8.96];
  const tail = b.chain("tail", polyline(tailZ.map((z) => [0, ycAt(z), z])), {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "fluke"],
    role: "tail",
  });
  const fluke = tail.tip!;

  const boneFor = (zc: number): Joint => {
    if (zc >= 3.6) return head;
    if (zc >= 2.4) return spine.joints[2];
    if (zc >= 1.2) return spine.joints[1];
    if (zc >= 0) return spine.joints[0];
    if (zc >= -2.5) return tail.joints[0];
    if (zc >= -5) return tail.joints[1];
    if (zc >= -7) return tail.joints[2];
    return tail.joints[3];
  };

  // ------------------------------------------------------------------------------------------------------------
  // Textures
  const EYE = pixelArt(["..sss..", ".sdddd.", "sddwdds", "sddddds", ".sdddd.", "..sss.."], {
    s: "#aab8c2",
    d: "#070a10",
    w: "#ffffff",
  });
  const BARN_A = pixelArt(
    ["...dd...", ".dwwwd..", ".dwgwwd.", "dwwwgwwd", "dwgwwwwd", ".dwwgwd.", "..dwwd.o", "...dd..."],
    { d: "#47443c", w: "#ebe8d6", g: "#b3b2a2", o: "#e8a04a" },
  );
  const BARN_B = pixelArt(
    ["..dd..dd..", ".dwwd.dwwd", "dwwgwddwgd", "dwgwwwwwwd", ".dwwgwwgd.", "..ddwwdd..", "...odd.o.."],
    { d: "#47443c", w: "#ebe8d6", g: "#b3b2a2", o: "#e8a04a" },
  );
  const RAKE = pixelTexture(16, 8, (g) => {
    for (let k = 0; k < 3; k++)
      for (let t = 0; t < 8; t++) g.set(1 + k * 3 + t, t, k === 1 ? "#d7e1e8" : "#aebdc9");
  });
  const FLIP = pixelTexture(24, 24, (g) => {
    g.fill(() => "#eef3f6");
    for (let n = 0; n < 60; n++) g.set(Math.floor(r() * 24), Math.floor(r() * 24), r() < 0.6 ? "#cfdce5" : "#9bb0c0");
    for (let x = 0; x < 24; x++) if (r() < 0.5) g.set(x, 0, "#7f95a7");
  });

  // ------------------------------------------------------------------------------------------------------------
  // Paints
  const RAMP = ["#0d131b", "#141d29", "#1e2b3b", "#2b3d50", "#3d546a"].map((c) => snapColor(c, 64));
  const BODY: Paint = cellPaint(
    V / 2,
    (c) => {
      if (c.axis === 0 && c.at.z > 3.3 && c.at.z < 6.8) {
        const ym = mouthY(c.at.z);
        if (c.at.y < ym && c.at.y > ym - 0.14) return "#04070b";
      }
      const q = c.random(2);
      if (q < 0.012) return "#a3b4c0";
      if (q < 0.03) return "#5b6f82";
      const v = 0.42 + 0.33 * c.n.y + 0.5 * (noise(c.at, 0.9, 3) - 0.5) + 0.06 * (c.at.y - 1.6);
      return c.pick(RAMP, v);
    },
    { dither: true },
  );
  const BELLY: Paint = cellPaint(V, (c) => {
    if (c.random(4) < 0.05) return "#7d90a1";
    if (c.at.z > 5.3 && noise(c.at, 0.9, 5) > 0.55) return "#3b4c5e";
    if (c.axis === 1) return c.u & 1 ? "#f3f7f9" : "#b2c3d1";
    if (c.axis === 0) return c.v & 1 ? "#f3f7f9" : "#b2c3d1";
    return "#dfe8ee";
  });
  const FLUKE_P: Paint = cellPaint(0.14, (c) => {
    if (c.n.y < -0.5) {
      if (c.random(8) < 0.05) return "#222d3a";
      const v = noise(c.at, 0.7, 11) + 0.12 * Math.sin(c.at.x * 3);
      return v > 0.5 ? "#e9eff3" : "#1c2735";
    }
    return BODY;
  });

  // ------------------------------------------------------------------------------------------------------------
  // Helpers
  const put = (
    size: [number, number, number],
    at: [number, number, number],
    color: string | Paint,
    bone: Joint,
    extra: Record<string, unknown> = {},
  ) => b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at, ...extra });
  const patch = (
    tex: THREE.Texture,
    size: number,
    at: [number, number, number],
    dir: [number, number, number],
    bone: Joint,
    up?: [number, number, number],
  ) =>
    b.part(new THREE.PlaneGeometry(size, size), "#ffffff", {
      bone,
      at,
      dir,
      axis: "z",
      texture: tex,
      ...(up ? { up } : {}),
    });

  // ------------------------------------------------------------------------------------------------------------
  // Body slices
  const slices: Slice[] = [];
  for (let i = 0; i < 28; i++) {
    const zc = 6.72 - D * i - D / 2;
    const yc = snap(ycAt(zc));
    const hw = Math.max(V, snap(prof(zc, 3)));
    const ht = Math.max(V, snap(prof(zc, 1)));
    const hb = Math.max(V, snap(prof(zc, 2)));
    slices.push({ i, zc, yc, hw, yTop: yc + ht, yBot: yc - hb });
  }
  const sl = (z: number) => slices[Math.min(27, Math.max(0, Math.floor((6.72 - z) / D)))];

  for (const s of slices) {
    const w = 2 * s.hw;
    const bh0 = bellyHeight(s.zc);
    if (s.zc > 3.6) {
      // head: upper skull on the head bone, lower jaw on the jaw bone
      const ym = mouthY(s.zc);
      put([w, s.yTop - ym, D], [0, (s.yTop + ym) / 2, s.zc], BODY, head);
      const jawH = ym - s.yBot;
      const bh = Math.max(V, Math.min(bh0, jawH - V));
      put([w - 0.14, jawH - bh, D], [0, s.yBot + bh + (jawH - bh) / 2, s.zc], BODY, jaw);
      put([w - 2 * V, bh, D], [0, s.yBot + bh / 2, s.zc], BELLY, jaw);
    } else if (bh0 > 0) {
      const bone = boneFor(s.zc);
      put([w, s.yTop - s.yBot - bh0, D], [0, (s.yTop + s.yBot + bh0) / 2, s.zc], BODY, bone);
      put([w - 2 * V, bh0, D], [0, s.yBot + bh0 / 2, s.zc], BELLY, bone);
    } else {
      put([w, s.yTop - s.yBot, D], [0, (s.yTop + s.yBot) / 2, s.zc], BODY, boneFor(s.zc));
    }
  }

  // ------------------------------------------------------------------------------------------------------------
  // Head: chin, knobs (tubercles), eyes, blowhole
  const s0 = slices[0];
  const ym0 = mouthY(s0.zc);
  put([s0.hw * 2 - 0.3, ym0 - s0.yBot - 0.08, 0.28], [0, (ym0 + s0.yBot) / 2 - 0.04, 6.72 + 0.14], BODY, jaw);
  put([0.44, 0.34, 0.4], [0, s0.yBot - 0.04, 6.6], "#6b8195", jaw); // chin knob
  put([0.2, 0.16, 0.2], [0.25, s0.yBot - 0.02, 6.35], "#8aa0b2", jaw);
  put([0.2, 0.16, 0.2], [-0.25, s0.yBot - 0.02, 6.3], "#8aa0b2", jaw);

  for (const s of slices.filter((q) => q.zc > 3.6)) {
    const n = s.i < 2 ? 2 : 3;
    for (let k = 0; k < n; k++) {
      const sz = 0.12 + 0.08 * r();
      const x = (r() * 2 - 1) * s.hw * 0.75;
      put([sz, sz, sz], [x, s.yTop + sz / 2 - 0.03, s.zc + (r() - 0.5) * 0.3], r() < 0.3 ? "#8aa0b2" : "#4a5f73", head);
    }
  }
  for (const s of slices.filter((q) => q.zc > 4.4 && q.i < 5)) {
    const ym = mouthY(s.zc);
    for (const sd of [1, -1]) {
      const sz = 0.12 + 0.05 * r();
      put([sz, sz, sz], [sd * (s.hw - 0.07 + sz / 2 - 0.03), ym - 0.3 - r() * 0.2, s.zc + (r() - 0.5) * 0.2], "#566b7e", jaw);
    }
  }

  // eyes and brows
  const es = sl(3.64);
  for (const sd of [1, -1]) {
    const ye = mouthY(es.zc) + 0.42;
    patch(EYE, 0.36, [sd * (es.hw + 0.012), ye, 3.64], [sd, 0, 0], head);
    put([0.1, 0.1, 0.46], [sd * (es.hw + 0.03), ye + 0.26, 3.64], "#243445", head);
  }

  // barnacle patches on the head and chin
  for (const sd of [1, -1]) {
    const a = slices[1];
    patch(BARN_A, 0.34, [sd * (a.hw - 0.07 + 0.012), mouthY(a.zc) - 0.2, a.zc], [sd, 0, 0], jaw);
    const c = slices[3];
    patch(BARN_B, 0.42, [sd * 0.4, c.yTop + 0.012, c.zc], [0, 1, 0], head, [0, 0, 1]);
    const d = slices[4];
    patch(BARN_A, 0.3, [sd * (d.hw - 0.07 + 0.012), mouthY(d.zc) - 0.5, d.zc], [sd, 0, 0], jaw);
  }
  patch(BARN_B, 0.4, [0, slices[1].yTop + 0.012, slices[1].zc], [0, 1, 0], head, [0, 0, 1]);

  // blowhole: two slits inside a raised splashguard
  const bz = sl(3.08);
  put([0.12, 0.12, 0.6], [0.36, bz.yTop + 0.06, bz.zc], "#2f4357", boneFor(bz.zc));
  put([0.12, 0.12, 0.6], [-0.36, bz.yTop + 0.06, bz.zc], "#2f4357", boneFor(bz.zc));
  put([0.84, 0.12, 0.12], [0, bz.yTop + 0.06, bz.zc - 0.3], "#2f4357", boneFor(bz.zc));
  for (const sd of [1, -1]) put([0.08, 0.03, 0.46], [sd * 0.13, bz.yTop + 0.13, bz.zc], "#03060a", boneFor(bz.zc));

  // ------------------------------------------------------------------------------------------------------------
  // Flank scars (orca rake marks)
  for (const sd of [1, -1]) {
    const f = sl(0.8);
    b.part(new THREE.PlaneGeometry(0.9, 0.45), "#ffffff", {
      bone: boneFor(0.8),
      at: [sd * (f.hw + 0.012), CY + 0.5, 0.8],
      dir: [sd, 0, 0],
      axis: "z",
      texture: RAKE,
    });
    const g = sl(-1.6);
    patch(BARN_B, 0.4, [sd * (g.hw + 0.012), g.yc - 0.5, -1.6], [sd, 0, 0], boneFor(-1.6));
  }

  // ------------------------------------------------------------------------------------------------------------
  // Dorsal hump and fin
  {
    const a = sl(-3.64);
    const c = sl(-4.2);
    const top = Math.max(a.yTop, c.yTop);
    const bone = boneFor(-3.9);
    put([0.84, 0.28, 1.12], [0, top + 0.14, -3.92], BODY, bone);
    const y0 = top + 0.28;
    put([0.2, 0.28, 0.98], [0, y0 + 0.14, -3.9], BODY, bone);
    put([0.2, 0.28, 0.7], [0, y0 + 0.42, -4.1], BODY, bone);
    put([0.2, 0.28, 0.42], [0, y0 + 0.7, -4.3], BODY, bone);
    put([0.2, 0.2, 0.2], [0, y0 + 0.94, -4.46], BODY, bone);
  }
  // knuckle ridge along the tail
  for (const s of slices.filter((q) => q.zc < -4.4 && q.zc > -8.5)) {
    put([0.18, 0.12, 0.4], [0, s.yTop + 0.06, s.zc], "#2a3a4c", boneFor(s.zc));
  }

  // ------------------------------------------------------------------------------------------------------------
  // Pectoral flippers
  const CH = [1.12, 1.4, 1.4, 1.12, 0.98, 0.84, 0.56, 0.28];
  const zLead = (i: number) => 2.66 - 0.12 * i;
  const yF = (i: number) => 1.12 - 0.09 * i;
  const zMid = (i: number) => zLead(i) - CH[Math.min(i, 7)] / 2;
  for (const s of [1, -1]) {
    const nm = s > 0 ? "L" : "R";
    const pts = [0, 2, 4, 6].map((u) => [s * (1.4 + 0.56 * u), yF(u), zMid(u)]);
    const fl = b.chain(`flipper${nm}`, polyline(pts), {
      parent: spine.joints[1],
      names: [`shoulder${nm}`, `elbow${nm}`, `wrist${nm}`, `hand${nm}`],
      role: "arm",
    });
    for (let i = 0; i < 8; i++) {
      const bone = fl.joints[Math.floor(i / 2)];
      const x = s * (1.4 + 0.56 * (i + 0.5));
      const tt = Math.max(0.1, 0.22 - 0.02 * i);
      const tu = Math.max(0.08, 0.14 - 0.01 * i);
      const zc = zMid(i);
      put([0.56, tt, CH[i]], [x, yF(i) + tt / 2, zc], BODY, bone);
      b.part(tileBox([0.56, tu, CH[i]], FLIP, 0.04, { rand: r, step: 1 }), "#ffffff", {
        bone,
        at: [x, yF(i) - tu / 2, zc],
        texture: FLIP,
      });
      if (i >= 1) {
        const k = 0.12 + 0.04 * (i % 2);
        put([k, k, k], [x, yF(i) + 0.02, zLead(i) + k / 2 - 0.03], i % 2 ? "#5d7286" : "#3a4e61", bone);
      }
      if (i === 2 || i === 4) patch(BARN_A, 0.3, [x, yF(i) + tt + 0.012, zLead(i) - 0.25], [0, 1, 0], bone, [0, 0, 1]);
    }
  }

  // ------------------------------------------------------------------------------------------------------------
  // Fluke: one stepped slab with a notched, serrated trailing edge
  {
    const spans: [number, number][] = [];
    for (let j = 0; j < 20; j++) {
      const a = Math.abs((j - 10 + 0.5) * V);
      const lead = 0.42 * a + 0.06 * a * a;
      let chord = 1.25 * (1 - a / 3.0) + 0.38;
      if (a < 0.5) chord -= 0.6;
      if (Math.floor(a / V) % 2) chord -= 0.14;
      const from = Math.round(lead / V);
      const to = Math.max(from + 2, Math.round((lead + chord) / V));
      spans.push([from, to]);
    }
    const outline = stepped(spans, [V, V], { start: -10 });
    b.extrude(outline, {
      at: [0, slices[27].yc, -8.7],
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: 0.2,
      color: FLUKE_P,
      bone: fluke,
    });
    // tubercles on the fluke's leading edge
    for (const s of [1, -1]) {
      for (let k = 1; k < 8; k++) {
        const a = k * 0.34;
        const lead = 0.42 * a + 0.06 * a * a;
        const sz = 0.1 + 0.03 * (k % 2);
        put([sz, sz, sz], [s * a, slices[27].yc + 0.1 + sz / 2 - 0.04, -8.7 - lead - 0.02], "#4a5f73", fluke);
      }
    }
  }

  return b.root;
}
