import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { DEG, rng } from "../../../../src/math";
import { catmull, spiral } from "../../../../src/path";
import { grain, mottle, paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Alchemist's Workbench",
  description:
    "A carved walnut alchemy desk with a herb-drying rack, brass scales, a stack of gilt grimoires, a glowing distillation rig, potion bottles, crystals, a drawer cabinet and a cushioned stool, cel-shaded with gold filigree.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type Col = string | Paint;

/** Merge geometries (already placed in model space) into one indexed geometry. */
function merge(list: THREE.BufferGeometry[]) {
  const g = list.map((x) => (x.index ? x.toNonIndexed() : x));
  const out = new THREE.BufferGeometry();
  let count = 0;
  for (const k of ["position", "normal", "uv"] as const) {
    const total = g.reduce((s, x) => s + x.getAttribute(k).array.length, 0);
    const arr = new Float32Array(total);
    let o = 0;
    for (const x of g) {
      const a = x.getAttribute(k).array as Float32Array;
      arr.set(a, o);
      o += a.length;
    }
    if (k === "position") count = total / 3;
    out.setAttribute(k, new THREE.BufferAttribute(arr, k === "uv" ? 2 : 3));
  }
  out.setIndex(Array.from({ length: count }, (_, i) => i));
  return out;
}

export default function build() {
  const b = createBuilder({ name: "alchemistWorkbench" });
  const root = b.joint("root", { at: [0, 0, 0] });

  // ---------------------------------------------------------------- palette
  const W1 = cel(grain("#8b5130", "#6c3a22", { size: 0.01, axis: "x", seed: 1 }));
  const WV = cel(grain("#8b5130", "#6c3a22", { size: 0.01, axis: "y", seed: 2 }));
  const WD = cel(grain("#5b3020", "#43221a", { size: 0.01, axis: "x", seed: 3 }));
  const WDV = cel(grain("#5b3020", "#43221a", { size: 0.01, axis: "y", seed: 4 }));
  const BRASS = cel("#e0aa3c", "#a8661f");
  const BRASS_D = cel("#b97d26", "#7d4a18");
  const GREEN = cel(mottle("#1d6a5a", "#25806b", { size: 0.12 }));
  const CUSH = cel(mottle("#1f6b54", "#2b8366", { size: 0.06 }));
  const LEATHER = cel(mottle("#7b4a2d", "#5f3720", { size: 0.03 }));
  const MARBLE = cel(mottle("#f1ece4", "#d6cfc4", { size: 0.04 }));
  const SACK = cel(mottle("#b9a37c", "#9f8a64", { size: 0.03 }));
  const CREAM = cel("#f4e6c4", "#d8bf95");
  const PAGES = cel("#f1e4c0", "#cdb98c");
  const RUN = cel(
    paint((p) => {
      const d = Math.abs(p.x - 0.05);
      if (d > 0.145 && d < 0.172) return "#1f7a66";
      if (d > 0.18 && d < 0.195) return "#e0aa3c";
      return "#f1e2bd";
    }),
  );
  const GLASS = "#d8f4f2";
  const CORK = "#b98a55";

  // ---------------------------------------------------------------- textures
  const ORN = svg(
    `<svg viewBox="0 0 64 40"><g fill="none" stroke="#e9b94a" stroke-width="2.2" stroke-linecap="round"><path d="M32 4 C38 12 38 28 32 36 C26 28 26 12 32 4Z"/><path d="M32 20 C24 8 10 10 6 18 C14 14 22 18 26 24"/><path d="M32 20 C40 8 54 10 58 18 C50 14 42 18 38 24"/></g><circle cx="32" cy="20" r="3.2" fill="#e9b94a"/><circle cx="6" cy="18" r="2" fill="#e9b94a"/><circle cx="58" cy="18" r="2" fill="#e9b94a"/></svg>`,
    { size: 256 },
  );
  const DIAM = svg(
    `<svg viewBox="0 0 64 96"><path d="M32 4 L58 48 L32 92 L6 48Z" fill="#1f7a66" stroke="#e0aa3c" stroke-width="3"/><path d="M32 18 L48 48 L32 78 L16 48Z" fill="none" stroke="#f1e2bd" stroke-width="2.4"/><circle cx="32" cy="48" r="6" fill="#e0aa3c"/><circle cx="32" cy="48" r="2.4" fill="#1f7a66"/></svg>`,
    { size: 256 },
  );
  let petals = "";
  for (let i = 0; i < 8; i++)
    petals += `<ellipse cx="32" cy="15" rx="5" ry="11" transform="rotate(${i * 45} 32 32)" fill="none" stroke="#e9b94a" stroke-width="2.2"/>`;
  const FLOWER = svg(
    `<svg viewBox="0 0 64 64">${petals}<circle cx="32" cy="32" r="5" fill="#e9b94a"/><circle cx="32" cy="32" r="12" fill="none" stroke="#e9b94a" stroke-width="2"/></svg>`,
    { size: 256 },
  );
  const LABEL = svg(
    `<svg viewBox="0 0 32 40"><rect x="2" y="2" width="28" height="36" rx="4" fill="#f3e2b8" stroke="#8a5a2b" stroke-width="2"/><path d="M16 9 L22 20 L16 31 L10 20Z" fill="none" stroke="#b5762a" stroke-width="2"/><circle cx="16" cy="20" r="2.4" fill="#b5762a"/></svg>`,
    { size: 128 },
  );
  const SHINE = svg(
    `<svg viewBox="0 0 48 48"><path d="M8 40 Q8 12 32 8" stroke="#ffffff" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="40" cy="12" r="4" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  let lav = `<path d="M16 96 L16 14" stroke="#4f8a3a" stroke-width="2.6" stroke-linecap="round" fill="none"/><path d="M16 80 Q8 72 4 62 M16 70 Q24 62 28 52" stroke="#5a9a44" stroke-width="2.4" stroke-linecap="round" fill="none"/>`;
  for (let i = 0; i < 8; i++) {
    const y = 14 + i * 6.2;
    const c1 = i % 2 ? "#8a5be0" : "#a784f2";
    const c2 = i % 2 ? "#a784f2" : "#8a5be0";
    lav += `<ellipse cx="11.5" cy="${y}" rx="4" ry="5.2" fill="${c1}"/><ellipse cx="20.5" cy="${y + 2}" rx="4" ry="5.2" fill="${c2}"/>`;
  }
  lav += `<ellipse cx="16" cy="8" rx="3.4" ry="5.4" fill="#b690ff"/>`;
  const LAV = svg(`<svg viewBox="0 0 32 96">${lav}</svg>`, { size: 128 });
  let grn = `<path d="M16 96 L16 12" stroke="#3d7f35" stroke-width="2.6" stroke-linecap="round" fill="none"/>`;
  for (let i = 0; i < 6; i++) {
    const y = 86 - i * 13;
    const c = i % 2 ? "#3f9a4a" : "#56b45a";
    grn += `<ellipse cx="8" cy="${y}" rx="7.5" ry="3.8" transform="rotate(-30 8 ${y})" fill="${c}"/><ellipse cx="24" cy="${y - 5}" rx="7.5" ry="3.8" transform="rotate(30 24 ${y - 5})" fill="${c}"/>`;
  }
  grn += `<ellipse cx="16" cy="10" rx="3.8" ry="8" fill="#56b45a"/>`;
  const HERB = svg(`<svg viewBox="0 0 32 96">${grn}</svg>`, { size: 128 });
  let wht = `<path d="M16 96 L16 18 M16 60 L6 40 M16 50 L27 34" stroke="#5a8f45" stroke-width="2.4" stroke-linecap="round" fill="none"/>`;
  for (const [cx, cy] of [
    [16, 12],
    [6, 36],
    [27, 30],
    [11, 26],
    [22, 18],
    [16, 38],
  ])
    wht += `<circle cx="${cx}" cy="${cy}" r="4.4" fill="#fbf6ee"/><circle cx="${cx}" cy="${cy}" r="1.6" fill="#f2c14e"/>`;
  wht += `<ellipse cx="9" cy="72" rx="6" ry="3" transform="rotate(-35 9 72)" fill="#4f9a4a"/><ellipse cx="23" cy="80" rx="6" ry="3" transform="rotate(35 23 80)" fill="#4f9a4a"/>`;
  const WHITE = svg(`<svg viewBox="0 0 32 96">${wht}</svg>`, { size: 128 });

  // ---------------------------------------------------------------- helpers
  type O = {
    rot?: number[];
    scale?: number | number[];
    name?: string;
    flat?: boolean;
    dir?: number[];
    up?: number[];
    axis?: "x" | "y" | "z";
    tex?: THREE.Texture;
  };
  const put = (g: THREE.BufferGeometry, c: Col, x: number, y: number, z: number, o: O = {}) =>
    b.part(g, c, {
      at: [x, y, z],
      bone: root,
      rotation: o.rot,
      scale: o.scale,
      name: o.name,
      flat: o.flat,
      dir: o.dir,
      up: o.up,
      axis: o.axis,
      texture: o.tex,
    });
  const box = (w: number, h: number, d: number, c: Col, x: number, y: number, z: number, o: O = {}) =>
    put(new THREE.BoxGeometry(w, h, d), c, x, y, z, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, c: Col, x: number, y: number, z: number, o: O = {}) =>
    put(new THREE.CylinderGeometry(rt, rb, h, seg), c, x, y, z, o);
  const sph = (r: number, c: Col, x: number, y: number, z: number, o: O = {}) =>
    put(new THREE.SphereGeometry(r, 8, 6), c, x, y, z, o);
  const torus = (r: number, t: number, c: Col, x: number, y: number, z: number, o: O = {}) =>
    put(new THREE.TorusGeometry(r, t, 5, 12), c, x, y, z, o);
  const cone = (r: number, h: number, seg: number, c: Col, x: number, y: number, z: number, o: O = {}) =>
    put(new THREE.ConeGeometry(r, h, seg), c, x, y, z, o);
  const plane = (w: number, h: number, tex: THREE.Texture, x: number, y: number, z: number, dir: number[], up?: number[]) =>
    put(new THREE.PlaneGeometry(w, h), "#ffffff", x, y, z, { dir, up, axis: "z", tex });
  const lathe = (
    o: Array<[number, number]>,
    c: Col,
    x: number,
    y: number,
    z: number,
    seg = 12,
    sx = 1,
    sy = 1,
  ) =>
    b.lathe(
      o.map(([px, py]) => [px * sx, py * sy] as [number, number]),
      { at: [x, y, z], color: c, bone: root, segments: seg },
    );
  const rod = (a: number[], c2: number[], r: number, c: Col) => b.rod(a, c2, r, c, { bone: root, sides: 6 });
  const studs = (pts: number[][], r: number, c: Col) =>
    put(
      merge(pts.map((p) => new THREE.SphereGeometry(r, 5, 4).translate(p[0], p[1], p[2]))),
      c,
      0,
      0,
      0,
    );
  const G =
    (cx: number, cy: number, cz: number, yaw: number) =>
    (lx: number, ly: number, lz: number) => {
      const cs = Math.cos(yaw * DEG);
      const sn = Math.sin(yaw * DEG);
      return [cx + lx * cs + lz * sn, cy + ly, cz - lx * sn + lz * cs];
    };

  const crystal = (
    x: number,
    y: number,
    z: number,
    h: number,
    r: number,
    tx: number,
    tz: number,
    col: string,
    str = 0.9,
  ) => {
    const g = merge([
      new THREE.CylinderGeometry(r, r, h, 6).translate(0, h / 2, 0),
      new THREE.ConeGeometry(r, h * 0.45, 6).translate(0, h + h * 0.225, 0),
    ]);
    g.rotateX(tx * DEG);
    g.rotateZ(tz * DEG);
    return glow(put(g, col, x, y, z, { flat: true }), str);
  };

  const bottle = (x: number, y: number, z: number, col: string, shape: number, sx: number, sy: number, label: boolean) => {
    const bodies: Array<Array<[number, number]>> = [
      [[0, 0], [0.05, 0], [0.065, 0.02], [0.07, 0.05], [0.06, 0.09], [0.035, 0.115], [0, 0.115]],
      [[0, 0], [0.04, 0], [0.045, 0.01], [0.045, 0.11], [0.03, 0.14], [0, 0.14]],
      [[0, 0], [0.03, 0], [0.075, 0.04], [0.075, 0.07], [0.035, 0.12], [0, 0.12]],
    ];
    const necks: Array<Array<[number, number]>> = [
      [[0, 0.11], [0.024, 0.11], [0.02, 0.17], [0.028, 0.18], [0, 0.18]],
      [[0, 0.135], [0.02, 0.135], [0.02, 0.19], [0.026, 0.2], [0, 0.2]],
      [[0, 0.115], [0.024, 0.115], [0.02, 0.18], [0.03, 0.195], [0, 0.195]],
    ];
    const top = [0.18, 0.2, 0.195][shape];
    glow(lathe(bodies[shape], col, x, y, z, 10, sx, sy), 0.55);
    lathe(necks[shape], GLASS, x, y, z, 8, sx, sy);
    cyl(0.021 * sx, 0.017 * sx, 0.04 * sy, 7, CORK, x, y + top * sy + 0.012 * sy, z);
    torus(0.025 * sx, 0.004, BRASS, x, y + (top - 0.02) * sy, z, { rot: [90, 0, 0] });
    if (label && shape !== 1) plane(0.04 * sx, 0.05 * sy, LABEL, x, y + 0.05 * sy, z + 0.0725 * sx, [0, 0, 1]);
    plane(0.03, 0.03, SHINE, x - 0.025 * sx, y + 0.085 * sy, z + 0.05 * sx, [-0.3, 0.25, 0.9]);
  };

  // ---------------------------------------------------------------- the desk
  box(1.72, 0.06, 0.82, W1, 0, 0.87, 0);
  box(1.76, 0.07, 0.035, WD, 0, 0.865, 0.405);
  box(1.76, 0.07, 0.035, WD, 0, 0.865, -0.405);
  box(0.035, 0.07, 0.84, WD, 0.865, 0.865, 0);
  box(0.035, 0.07, 0.84, WD, -0.865, 0.865, 0);
  for (const z of [-0.27, -0.13, 0.01, 0.15, 0.29]) box(1.7, 0.002, 0.004, INK, 0, 0.9005, z);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.09, 0.076, 0.09, BRASS, sx * 0.845, 0.866, sz * 0.39);
  const nails: number[][] = [];
  for (let i = -8; i <= 8; i++) nails.push([i * 0.1, 0.866, 0.4235]);
  studs(nails, 0.009, BRASS_D);
  // legs (left side) and cabinet (right side)
  for (const z of [0.33, -0.33]) {
    const x = -0.78;
    box(0.1, 0.78, 0.1, WV, x, 0.45, z);
    box(0.16, 0.07, 0.16, WDV, x, 0.035, z);
    box(0.12, 0.025, 0.12, BRASS, x, 0.082, z);
    box(0.116, 0.05, 0.116, BRASS, x, 0.8, z);
    box(0.03, 0.2, 0.04, WD, -0.67, 0.72, z, { rot: [0, 0, -45] });
    box(0.03, 0.2, 0.04, WD, -0.78, 0.72, z > 0 ? 0.24 : -0.24, { rot: [-45 * (z > 0 ? 1 : -1) * -1, 0, 0] });
  }
  plane(0.07, 0.044, ORN, -0.78, 0.55, 0.385, [0, 0, 1]);
  box(1.15, 0.1, 0.04, WD, -0.155, 0.785, 0.335);
  box(1.15, 0.1, 0.04, WD, -0.155, 0.785, -0.335);
  plane(0.16, 0.1, ORN, -0.155, 0.785, 0.358, [0, 0, 1]);
  box(1.16, 0.46, 0.02, WD, -0.155, 0.53, -0.34);
  box(1.18, 0.04, 0.66, W1, -0.155, 0.3, 0);
  box(1.18, 0.05, 0.03, WD, -0.155, 0.275, 0.335);
  // cabinet
  box(0.46, 0.09, 0.76, WD, 0.62, 0.045, 0);
  box(0.4, 0.72, 0.7, W1, 0.62, 0.46, 0);
  box(0.04, 0.72, 0.03, WDV, 0.435, 0.46, 0.355);
  box(0.04, 0.72, 0.03, WDV, 0.805, 0.46, 0.355);
  for (const y of [0.585, 0.355, 0.125]) box(0.4, 0.02, 0.03, WD, 0.62, y, 0.355);
  for (const cy of [0.7, 0.47, 0.24]) {
    box(0.32, 0.2, 0.03, W1, 0.62, cy, 0.37);
    box(0.26, 0.14, 0.01, WD, 0.62, cy, 0.388);
    plane(0.1, 0.0625, ORN, 0.62, cy + 0.04, 0.3945, [0, 0, 1]);
    torus(0.022, 0.005, BRASS, 0.62, cy - 0.03, 0.397);
    cyl(0.008, 0.008, 0.02, 6, BRASS, 0.62, cy - 0.005, 0.395, { rot: [90, 0, 0] });
  }
  for (const y of [0.1, 0.8]) box(0.43, 0.025, 0.72, BRASS_D, 0.62, y + 0.005, 0);
  plane(0.3, 0.2, FLOWER, 0.8205, 0.46, 0, [1, 0, 0]);

  // ---------------------------------------------------------------- table linen
  box(0.4, 0.008, 0.82, RUN, 0.05, 0.904, 0);
  box(0.4, 0.5, 0.008, RUN, 0.05, 0.65, 0.432);
  b.extrude(
    [
      [-0.2, 0],
      [0.2, 0],
      [0, -0.09],
    ],
    { at: [0.05, 0.4, 0.432], x: [1, 0, 0], thickness: 0.008, color: RUN },
  );
  plane(0.2, 0.3, DIAM, 0.05, 0.66, 0.4375, [0, 0, 1]);
  cyl(0.007, 0.007, 0.024, 6, BRASS, 0.05, 0.296, 0.432);
  cone(0.012, 0.07, 6, CREAM, 0.05, 0.25, 0.432, { rot: [180, 0, 0] });
  box(0.4, 0.014, 0.012, BRASS, 0.05, 0.405, 0.436);
  box(0.22, 0.008, 0.82, GREEN, -0.72, 0.904, 0);
  box(0.2, 0.55, 0.008, GREEN, -0.72, 0.625, 0.432);
  box(0.2, 0.015, 0.012, BRASS, -0.72, 0.358, 0.436);
  for (const x of [-0.8, -0.72, -0.64]) cone(0.012, 0.05, 6, BRASS, x, 0.325, 0.432, { rot: [180, 0, 0] });
  box(0.012, 0.55, 0.012, BRASS, -0.82, 0.625, 0.436);
  box(0.012, 0.55, 0.012, BRASS, -0.62, 0.625, 0.436);

  // petals scattered on the runner
  {
    const r = rng(11);
    const pts: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 16; i++)
      pts.push(
        new THREE.SphereGeometry(0.008, 5, 4)
          .scale(1, 0.4, 1)
          .translate(-0.1 + r() * 0.3, 0.9095, -0.3 + r() * 0.65),
      );
    put(merge(pts), "#a784f2", 0, 0, 0);
  }

  // ---------------------------------------------------------------- riser with herb rack and shelf
  for (const x of [-0.8, -0.22]) {
    box(0.07, 0.75, 0.07, WV, x, 1.275, -0.33);
    box(0.09, 0.04, 0.09, BRASS, x, 0.92, -0.33);
    box(0.09, 0.03, 0.09, BRASS, x, 1.62, -0.33);
    cone(0.04, 0.09, 6, BRASS, x, 1.695, -0.33);
    sph(0.016, BRASS, x, 1.75, -0.33);
  }
  box(0.68, 0.05, 0.06, WD, -0.51, 1.56, -0.33);
  box(0.68, 0.02, 0.07, BRASS, -0.51, 1.59, -0.33);
  b.extrude(
    [
      [0, 0],
      [0.14, 0],
      [0.14, 0.025],
      [0.05, 0.15],
      [0.035, 0.4],
      [0, 0.4],
    ],
    { at: [-0.835, 0.9, -0.33], x: [-1, 0, 0], thickness: 0.03, color: WD },
  );
  b.extrude(
    [
      [0, 0],
      [0.14, 0],
      [0.14, 0.025],
      [0.05, 0.15],
      [0.035, 0.4],
      [0, 0.4],
    ],
    { at: [-0.185, 0.9, -0.33], x: [1, 0, 0], thickness: 0.03, color: WD },
  );
  cyl(0.012, 0.012, 0.72, 8, BRASS, -0.51, 1.5, -0.33, { rot: [0, 0, 90] });
  sph(0.022, BRASS, -0.87, 1.5, -0.33);
  sph(0.022, BRASS, -0.15, 1.5, -0.33);
  // shelf
  box(0.6, 0.04, 0.2, W1, -0.51, 1.1, -0.2);
  box(0.6, 0.03, 0.02, WD, -0.51, 1.095, -0.1);
  for (const x of [-0.78, -0.24]) b.extrude(
    [
      [0, 0],
      [0.12, 0],
      [0.12, 0.02],
      [0.02, 0.1],
      [0, 0.1],
    ],
    { at: [x, 1.0, -0.25], x: [0, 0, 1], thickness: 0.02, color: BRASS_D },
  );
  bottle(-0.7, 1.12, -0.2, "#4ddb7a", 0, 0.85, 0.9, true);
  bottle(-0.585, 1.12, -0.2, "#3a6cff", 1, 0.9, 1.2, false);
  bottle(-0.44, 1.12, -0.2, "#b04bff", 2, 1.1, 1.0, true);
  bottle(-0.3, 1.12, -0.22, "#ffb62e", 0, 0.7, 0.8, true);
  // hanging herb bundles
  const hang = (x: number, tex: THREE.Texture, seed: number, len: number) => {
    const r = rng(seed);
    const frames = [];
    for (let i = 0; i < 14; i++) frames.push(frame([x + (r() - 0.5) * 0.045, 1.47, -0.33 + (r() - 0.5) * 0.045], [0, 1, 0]));
    b.cards(frames, tex, {
      size: [0.05, len],
      lean: 168,
      flow: [0, 0, 1],
      spin: 180,
      vary: 0.25,
      rng: r,
      cross: true,
      bone: root,
    });
    torus(0.022, 0.005, BRASS, x, 1.46, -0.33, { rot: [90, 0, 0] });
    cyl(0.008, 0.012, 0.03, 6, "#8a6a3c", x, 1.485, -0.33);
  };
  hang(-0.68, LAV, 21, 0.24);
  hang(-0.51, HERB, 22, 0.22);
  hang(-0.34, WHITE, 23, 0.22);

  // ---------------------------------------------------------------- stack of books
  {
    const defs: Array<[string, number, number, number, number, number]> = [
      // colour, yaw, w, d, h, xoff
      ["#2d4f8a", 3, 0.31, 0.22, 0.05, 0],
      ["#a63a45", -4, 0.29, 0.21, 0.05, 0.01],
      ["#7a2a3a", 5, 0.3, 0.2, 0.045, -0.01],
      ["#2f6a4f", -3, 0.28, 0.2, 0.05, 0.012],
      ["#5b3a8c", 6, 0.24, 0.17, 0.04, 0],
    ];
    let base = 0.9;
    defs.forEach(([col, yaw, w, d, h, xo], i) => {
      const cx = 0.31 + xo;
      const cz = -0.2;
      const g = G(cx, base + h / 2, cz, yaw);
      const cover = cel(col);
      const c0 = g(0, 0, 0);
      box(w, h, d, cover, c0[0], c0[1], c0[2], { rot: [0, yaw, 0] });
      const pg = g(0, 0, -0.002);
      box(w + 0.008, h * 0.7, d - 0.012, PAGES, pg[0], pg[1], pg[2], { rot: [0, yaw, 0] });
      for (const lx of [-0.075, 0.075]) {
        const p = g(lx, 0, d / 2 + 0.001);
        box(0.012, h + 0.004, 0.006, BRASS, p[0], p[1], p[2], { rot: [0, yaw, 0] });
      }
      for (const lx of [-(w / 2 - 0.01), w / 2 - 0.01]) {
        const p = g(lx, 0, d / 2 + 0.001);
        box(0.02, h + 0.004, 0.007, BRASS, p[0], p[1], p[2], { rot: [0, yaw, 0] });
      }
      const e = g(0, 0, d / 2 + 0.0065);
      plane(0.06, 0.0375, ORN, e[0], e[1], e[2], [Math.sin(yaw * DEG), 0, Math.cos(yaw * DEG)]);
      base += h;
      if (i === defs.length - 1) {
        const t = g(0, h / 2 + 0.002, 0);
        plane(0.13, 0.08, ORN, t[0], t[1], t[2], [0, 1, 0], [-Math.sin(yaw * DEG), 0, -Math.cos(yaw * DEG)]);
        const tl = g(w / 2 - 0.02, h / 2 + 0.003, -d / 2 + 0.02);
        box(0.02, 0.003, 0.02, BRASS, tl[0], tl[1], tl[2], { rot: [0, yaw, 0] });
      }
    });
    // dangling bookmark ribbon
    box(0.012, 0.12, 0.002, "#a63a45", 0.43, 1.0, -0.085, { rot: [0, 0, 4] });
  }

  // ---------------------------------------------------------------- brass scales
  {
    const x0 = -0.02;
    const z0 = -0.2;
    lathe(
      [
        [0, 0],
        [0.07, 0],
        [0.07, 0.015],
        [0.04, 0.04],
        [0.014, 0.075],
        [0.012, 0.42],
        [0, 0.42],
      ],
      BRASS,
      x0,
      0.9,
      z0,
      10,
    );
    torus(0.022, 0.005, BRASS, x0, 1.0, z0, { rot: [90, 0, 0] });
    sph(0.022, BRASS, x0, 1.325, z0);
    cone(0.012, 0.05, 6, BRASS, x0, 1.37, z0);
    sph(0.01, BRASS, x0, 1.4, z0);
    rod([x0 - 0.12, 1.32, z0], [x0 + 0.12, 1.32, z0], 0.006, BRASS);
    for (const s of [-1, 1]) {
      sph(0.01, BRASS, x0 + s * 0.12, 1.32, z0);
      const cx = x0 + s * 0.12;
      const pan = lathe(
        [
          [0, 0],
          [0.035, 0],
          [0.062, 0.022],
          [0.056, 0.024],
          [0.03, 0.008],
          [0, 0.008],
        ],
        BRASS,
        cx,
        1.07,
        z0,
        10,
      );
      void pan;
      for (let k = 0; k < 3; k++) {
        const a = (k * 2 * Math.PI) / 3;
        rod([cx + 0.058 * Math.cos(a), 1.092, z0 + 0.058 * Math.sin(a)], [cx, 1.315, z0], 0.0018, BRASS);
      }
    }
    crystal(x0 - 0.12, 1.078, z0, 0.03, 0.009, 10, 8, "#7fb6ff", 0.9);
    crystal(x0 - 0.125, 1.078, z0 + 0.012, 0.02, 0.007, -12, 6, "#a98bff", 0.9);
    sph(0.026, "#3f9a4a", x0 + 0.12, 1.085, z0, { scale: [1, 0.55, 1] });
    cyl(0.012, 0.014, 0.016, 6, BRASS_D, x0 + 0.115, 1.085, z0 + 0.01);
  }

  // ---------------------------------------------------------------- distillation rig
  {
    const x = 0.7;
    const z = -0.2;
    cyl(0.05, 0.055, 0.03, 10, BRASS, x, 0.915, z);
    cyl(0.02, 0.02, 0.06, 8, CREAM, x, 0.96, z);
    glow(cone(0.014, 0.05, 6, "#ffcf5a", x, 1.015, z), 1.3);
    for (let k = 0; k < 3; k++) {
      const a = k * 2.094 + 0.4;
      rod([x + 0.075 * Math.cos(a), 0.9, z + 0.075 * Math.sin(a)], [x + 0.07 * Math.cos(a), 1.1, z + 0.07 * Math.sin(a)], 0.008, BRASS);
    }
    torus(0.07, 0.008, BRASS, x, 1.1, z, { rot: [90, 0, 0] });
    glow(sph(0.1, "#35d6c8", x, 1.21, z), 0.55);
    sph(0.1, "#35d6c8", x, 1.21, z);
    rod([x, 1.28, z], [x, 1.43, z], 0.026, GLASS);
    torus(0.028, 0.006, GLASS, x, 1.43, z, { rot: [90, 0, 0] });
    torus(0.03, 0.004, BRASS, x, 1.39, z, { rot: [90, 0, 0] });
    plane(0.045, 0.045, SHINE, x - 0.04, 1.26, z + 0.088, [-0.4, 0.5, 0.77]);
    for (const [bx, by, bz] of [
      [-0.03, 1.17, 0.095],
      [0.02, 1.24, 0.098],
      [0.05, 1.15, 0.09],
    ])
      sph(0.008, "#ffffff", x + bx, by, z + bz);
    // pole with hanging purple bulb
    rod([0.5, 0.9, z], [0.5, 1.52, z], 0.012, BRASS);
    cyl(0.03, 0.04, 0.04, 8, BRASS, 0.5, 0.92, z);
    sph(0.02, BRASS, 0.5, 1.54, z);
    rod([0.5, 1.5, z], [0.56, 1.5, z], 0.008, BRASS);
    rod([0.56, 1.5, z], [0.56, 1.45, z], 0.003, BRASS);
    glow(sph(0.04, "#b04bff", 0.56, 1.405, z), 0.7);
    cyl(0.012, 0.016, 0.014, 6, BRASS, 0.56, 1.45, z);
    // condenser
    b.sweep(
      catmull([
        [x, 1.43, z],
        [x, 1.51, z],
        [x + 0.06, 1.53, z],
        [0.8, 1.47, z],
        [0.8, 1.2, z],
        [0.8, 1.04, z],
      ]),
      0.012,
      { color: GLASS, bone: root, sides: 6 },
    );
    b.sweep(spiral([0.8, 1.2, z], [0.83, 1.2, z], [0, 1, 0], { turns: 3, pitch: 0.04 }), 0.005, {
      color: "#9fe9e4",
      bone: root,
      sides: 5,
    });
    // receiving flask
    glow(sph(0.055, "#4ddb7a", 0.8, 0.957, z), 0.55);
    rod([0.8, 0.99, z], [0.8, 1.06, z], 0.016, GLASS);
    torus(0.018, 0.004, BRASS, 0.8, 1.06, z, { rot: [90, 0, 0] });
    plane(0.025, 0.025, SHINE, 0.8 - 0.02, 0.975, z + 0.05, [-0.3, 0.3, 0.9]);
  }

  // test tube rack
  {
    const x = 0.62;
    const z = 0.08;
    box(0.28, 0.018, 0.08, WD, x, 0.909, z);
    for (const s of [-1, 1]) box(0.02, 0.14, 0.07, WD, x + s * 0.13, 0.97, z);
    box(0.28, 0.02, 0.07, WD, x, 1.03, z);
    box(0.29, 0.006, 0.075, BRASS, x, 1.043, z);
    const cols = ["#4a8cff", "#c04bff", "#ffb62e", "#4ddb7a", "#ff5fa2"];
    cols.forEach((c, i) => {
      const tx = x - 0.1 + i * 0.05;
      glow(cyl(0.012, 0.012, 0.1, 7, c, tx, 0.96, z), 0.55);
      cyl(0.012, 0.012, 0.07, 7, GLASS, tx, 1.045, z);
      cyl(0.011, 0.009, 0.016, 6, CORK, tx, 1.088, z);
    });
  }

  // crystals in brass bowl (right front) and left front
  const bowl: Array<[number, number]> = [
    [0, 0],
    [0.025, 0],
    [0.04, 0.02],
    [0.07, 0.06],
    [0.062, 0.062],
    [0.035, 0.03],
    [0, 0.026],
  ];
  lathe(bowl, BRASS, 0.74, 0.9, 0.3, 10);
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3;
    cone(0.01, 0.05, 5, BRASS, 0.74 + 0.065 * Math.cos(a), 0.945, 0.3 + 0.065 * Math.sin(a), { rot: [0, 0, 0] });
  }
  crystal(0.74, 0.93, 0.3, 0.07, 0.018, 5, 0, "#b27bff", 1);
  crystal(0.725, 0.93, 0.31, 0.045, 0.013, -18, 14, "#8f6bff", 1);
  crystal(0.76, 0.93, 0.29, 0.05, 0.013, 14, -20, "#c9a2ff", 1);
  lathe(bowl, BRASS, -0.76, 0.9, -0.02, 10, 1.25, 1.25);
  crystal(-0.76, 0.935, -0.02, 0.17, 0.028, 3, 6, "#6fb4ff", 1);
  crystal(-0.79, 0.935, -0.0, 0.11, 0.02, -14, 22, "#8ec9ff", 1);
  crystal(-0.73, 0.935, -0.04, 0.12, 0.022, 10, -20, "#5a8cff", 1);
  crystal(-0.76, 0.935, 0.02, 0.07, 0.015, -22, -4, "#a98bff", 1);
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3;
    cone(0.012, 0.07, 5, BRASS, -0.76 + 0.085 * Math.cos(a), 0.955, -0.02 + 0.085 * Math.sin(a));
  }

  // candle
  lathe(
    [
      [0, 0],
      [0.03, 0],
      [0.05, 0.015],
      [0.054, 0.02],
      [0.045, 0.02],
      [0.025, 0.008],
      [0, 0.008],
    ],
    BRASS,
    -0.74,
    0.9,
    0.27,
    10,
  );
  cyl(0.015, 0.015, 0.07, 8, CREAM, -0.74, 0.943, 0.27);
  glow(cone(0.011, 0.04, 6, "#ffcf5a", -0.74, 1.0, 0.27), 1.4);
  rod([-0.74, 0.978, 0.27], [-0.74, 0.985, 0.27], 0.002, INK);

  // mortar and pestle
  lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.06, 0.03],
      [0.078, 0.075],
      [0.064, 0.078],
      [0.05, 0.045],
      [0, 0.04],
    ],
    MARBLE,
    -0.5,
    0.9,
    0.05,
    10,
  );
  torus(0.07, 0.006, BRASS_D, -0.5, 0.968, 0.05, { rot: [90, 0, 0] });
  sph(0.05, "#3f9a4a", -0.5, 0.945, 0.05, { scale: [1, 0.55, 1] });
  {
    const r = rng(31);
    const fr = [];
    for (let i = 0; i < 12; i++) fr.push(frame([-0.5 + (r() - 0.5) * 0.07, 0.94, 0.05 + (r() - 0.5) * 0.07], [0, 1, 0]));
    b.cards(fr, HERB, {
      size: [0.04, 0.07],
      lean: 35,
      flow: (f) => [f.at.x + 0.5, 0, f.at.z - 0.05],
      vary: 0.3,
      rng: r,
      bone: root,
      spin: 20,
    });
  }
  b.rod([-0.52, 0.94, 0.04], [-0.6, 1.06, -0.02], [0.012, 0.016], MARBLE, { bone: root, sides: 7 });
  sph(0.02, MARBLE, -0.6, 1.065, -0.02);

  // scoops on the runner
  for (const [sx, sz, ang] of [
    [-0.02, 0.2, 0],
    [0.1, 0.33, -25],
  ]) {
    lathe(
      [
        [0, 0],
        [0.02, 0],
        [0.035, 0.016],
        [0.03, 0.018],
        [0.017, 0.007],
        [0, 0.007],
      ],
      BRASS,
      sx,
      0.908,
      sz,
      9,
    );
    const ca = Math.cos(ang * DEG);
    const sa = Math.sin(ang * DEG);
    rod([sx + 0.03 * ca, 0.92, sz - 0.03 * sa], [sx + 0.2 * ca, 0.925, sz - 0.2 * sa], 0.004, BRASS);
    sph(0.007, BRASS, sx + 0.2 * ca, 0.925, sz - 0.2 * sa);
    sph(0.014, "#a784f2", sx, 0.918, sz, { scale: [1, 0.5, 1] });
  }

  // lying herb bundles
  const lying = (x: number, z: number, ang: number, tex: THREE.Texture, seed: number, n: number) => {
    const r = rng(seed);
    const dx = Math.cos(ang * DEG);
    const dz = -Math.sin(ang * DEG);
    const fr = [];
    for (let i = 0; i < n; i++)
      fr.push(frame([x - dx * 0.08 + (r() - 0.5) * 0.04, 0.905 + r() * 0.012, z - dz * 0.08 + (r() - 0.5) * 0.04], [0, 1, 0]));
    b.cards(fr, tex, {
      size: [0.045, 0.2],
      lean: 82,
      flow: [dx, 0, dz],
      spin: 14,
      vary: 0.2,
      rng: r,
      bone: root,
      sink: 0,
    });
    b.rod([x - dx * 0.075, 0.912, z - dz * 0.075], [x - dx * 0.06, 0.912, z - dz * 0.06], 0.014, "#7a5a32", { bone: root, sides: 6 });
    rod([x - dx * 0.075, 0.912, z - dz * 0.075], [x - dx * 0.1, 0.912, z - dz * 0.1], 0.007, "#4f8a3a");
  };
  lying(0.34, 0.12, 20, LAV, 41, 12);
  lying(-0.3, 0.2, 160, HERB, 42, 12);
  lying(-0.28, 0.3, 200, WHITE, 43, 8);

  // ---------------------------------------------------------------- hanging lantern and satchel (left side)
  {
    rod([-0.865, 0.87, 0.2], [-0.95, 0.87, 0.2], 0.007, BRASS);
    box(0.02, 0.04, 0.05, BRASS, -0.875, 0.85, 0.2);
    rod([-0.95, 0.87, 0.2], [-0.95, 0.74, 0.2], 0.0025, BRASS);
    const lx = -0.95;
    const ly = 0.66;
    const lz = 0.2;
    glow(sph(0.045, "#7dffb0", lx, ly, lz), 1);
    for (const a of [0, 60, 120]) torus(0.056, 0.005, BRASS, lx, ly, lz, { rot: [0, a, 0] });
    torus(0.058, 0.005, BRASS, lx, ly, lz, { rot: [90, 0, 0] });
    cone(0.04, 0.045, 8, BRASS, lx, ly + 0.082, lz);
    torus(0.016, 0.004, BRASS, lx, ly + 0.108, lz);
    cyl(0.02, 0.012, 0.025, 8, BRASS, lx, ly - 0.07, lz);
    glow(
      put(new THREE.OctahedronGeometry(0.02), "#5ae6c8", lx, ly - 0.115, lz, { scale: [1, 1.7, 1], flat: true }),
      1,
    );
    // satchel
    box(0.1, 0.17, 0.22, LEATHER, -0.915, 0.62, -0.12);
    box(0.106, 0.07, 0.226, cel("#6a3e24"), -0.915, 0.675, -0.12);
    box(0.012, 0.03, 0.04, BRASS, -0.97, 0.665, -0.12);
    for (let i = 0; i < 3; i++) {
      cyl(0.02, 0.02, 0.2, 8, CREAM, -0.915 + (i - 1) * 0.02, 0.76, -0.14 + i * 0.05, { rot: [8 * (i - 1), 0, 6 * (i - 1)] });
      cyl(0.021, 0.021, 0.015, 8, "#c9482f", -0.915 + (i - 1) * 0.02, 0.775, -0.14 + i * 0.05, { rot: [8 * (i - 1), 0, 6 * (i - 1)] });
    }
    rod([-0.87, 0.83, -0.2], [-0.88, 0.7, -0.2], 0.008, LEATHER);
    rod([-0.87, 0.83, -0.04], [-0.88, 0.7, -0.04], 0.008, LEATHER);
  }

  // ---------------------------------------------------------------- lower shelf dressing
  glow(
    lathe(
      [
        [0, 0],
        [0.07, 0],
        [0.1, 0.04],
        [0.11, 0.1],
        [0.075, 0.17],
        [0.045, 0.2],
        [0, 0.2],
      ],
      "#37b86a",
      -0.62,
      0.32,
      0.0,
      10,
    ),
    0.5,
  );
  lathe(
    [
      [0, 0.19],
      [0.036, 0.19],
      [0.028, 0.27],
      [0.04, 0.29],
      [0, 0.29],
    ],
    GLASS,
    -0.62,
    0.32,
    0,
    8,
  );
  cyl(0.035, 0.028, 0.05, 7, CORK, -0.62, 0.635, 0);
  torus(0.034, 0.005, BRASS, -0.62, 0.595, 0, { rot: [90, 0, 0] });
  torus(0.026, 0.006, BRASS, -0.62, 0.62, 0, { rot: [0, 90, 0] });
  plane(0.08, 0.1, LABEL, -0.62, 0.42, 0.108, [0, 0, 1]);
  // crate with herbs
  box(0.3, 0.16, 0.2, WD, -0.25, 0.4, 0.02);
  for (const dx of [-0.1, 0.1]) box(0.016, 0.164, 0.204, BRASS_D, -0.25 + dx, 0.4, 0.02);
  box(0.304, 0.01, 0.204, WV, -0.25, 0.4, 0.02);
  box(0.28, 0.012, 0.18, "#3b2a1d", -0.25, 0.484, 0.02);
  plane(0.1, 0.06, ORN, -0.25, 0.4, 0.1225, [0, 0, 1]);
  {
    const r = rng(51);
    const fr = [];
    for (let i = 0; i < 18; i++)
      fr.push(frame([-0.25 + ((i % 6) - 2.5) * 0.045 + (r() - 0.5) * 0.02, 0.488, 0.02 + (Math.floor(i / 6) - 1) * 0.06], [0, 1, 0]));
    b.cards(fr, [HERB, HERB, LAV], {
      size: [0.06, 0.14],
      lean: 22,
      flow: (f) => [f.at.x + 0.25, 0, f.at.z - 0.02],
      vary: 0.3,
      rng: r,
      bone: root,
      cross: true,
    });
  }
  // sack
  sph(0.085, SACK, 0.18, 0.4, 0.04, { scale: [1, 0.95, 0.9] });
  cyl(0.04, 0.05, 0.03, 8, SACK, 0.18, 0.47, 0.04);
  cyl(0.035, 0.03, 0.05, 8, SACK, 0.18, 0.5, 0.04);
  torus(0.036, 0.006, "#7a5a32", 0.18, 0.478, 0.04, { rot: [90, 0, 0] });
  // small bottles
  bottle(-0.4, 0.32, 0.18, "#ff5fa2", 0, 0.7, 0.7, false);
  bottle(-0.34, 0.32, 0.2, "#2fd8cf", 1, 0.8, 0.8, false);
  bottle(0.0, 0.32, 0.17, "#ffb62e", 2, 0.6, 0.6, false);
  bottle(0.06, 0.32, 0.2, "#4a8cff", 0, 0.55, 0.55, false);

  // ---------------------------------------------------------------- stool
  {
    const g = G(0.32, 0, 0.84, 10);
    const yaw = 10;
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const p = g(sx * 0.15, 0.2, sz * 0.15);
        box(0.045, 0.4, 0.045, WV, p[0], p[1], p[2], { rot: [0, yaw, 0] });
        const f = g(sx * 0.15, 0.01, sz * 0.15);
        box(0.056, 0.02, 0.056, BRASS, f[0], f[1], f[2], { rot: [0, yaw, 0] });
        const c = g(sx * 0.19, 0.425, sz * 0.19);
        box(0.06, 0.052, 0.06, BRASS, c[0], c[1], c[2], { rot: [0, yaw, 0] });
      }
    for (const s of [-1, 1]) {
      const a = g(0, 0.37, s * 0.15);
      box(0.3, 0.06, 0.025, WD, a[0], a[1], a[2], { rot: [0, yaw, 0] });
      const a2 = g(s * 0.15, 0.37, 0);
      box(0.3, 0.06, 0.025, WD, a2[0], a2[1], a2[2], { rot: [0, yaw + 90, 0] });
      const r1 = g(0, 0.15, s * 0.15);
      box(0.3, 0.025, 0.025, WD, r1[0], r1[1], r1[2], { rot: [0, yaw, 0] });
      const r2 = g(s * 0.15, 0.15, 0);
      box(0.3, 0.025, 0.025, WD, r2[0], r2[1], r2[2], { rot: [0, yaw + 90, 0] });
    }
    const seat = g(0, 0.425, 0);
    box(0.4, 0.05, 0.4, W1, seat[0], seat[1], seat[2], { rot: [0, yaw, 0] });
    const cu = g(0, 0.4725 + 0.0, 0);
    box(0.36, 0.045, 0.36, CUSH, cu[0], cu[1], cu[2], { rot: [0, yaw, 0] });
    for (const s of [-1, 1]) {
      const e1 = g(0, 0.496, s * 0.18);
      box(0.372, 0.012, 0.012, BRASS, e1[0], e1[1], e1[2], { rot: [0, yaw, 0] });
      const e2 = g(s * 0.18, 0.496, 0);
      box(0.012, 0.012, 0.372, BRASS, e2[0], e2[1], e2[2], { rot: [0, yaw, 0] });
    }
    const t = g(0, 0.4975, 0);
    plane(0.22, 0.22, FLOWER, t[0], t[1], t[2], [0, 1, 0], [-Math.sin(yaw * DEG), 0, -Math.cos(yaw * DEG)]);
    for (const s of [-1, 1]) {
      const f = g(s * 0.12, 0.35, 0.2 + 0.0);
      plane(0.05, 0.03, ORN, f[0], f[1] + 0.0, f[2] + 0.0, [Math.sin(yaw * DEG), 0, Math.cos(yaw * DEG)]);
    }
  }

  return b.root;
}
