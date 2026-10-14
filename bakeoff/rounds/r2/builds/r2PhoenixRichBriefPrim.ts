import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Phoenix Rising",
  description:
    "A phoenix with wings flung open. Feathers run from crimson at the body through orange to golden tips. It has a flame crest, ribbon tail feathers, amber eyes, a golden hooked beak and drifting embers.",
};

const STOPS: [number, string][] = [
  [0, "#8e0a14"],
  [0.3, "#d41e18"],
  [0.55, "#ff6a00"],
  [0.78, "#ffa800"],
  [1, "#ffe066"],
];

// Gradient colour, quantised to 16 steps so the model stays under the colour limit.
function grad(f: number): string {
  f = Math.max(0, Math.min(1, f));
  f = Math.round(f * 16) / 16;
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [a, ca] = STOPS[i];
    const [c, cc] = STOPS[i + 1];
    if (f <= c) {
      const t = (f - a) / (c - a);
      return "#" + new THREE.Color(ca).lerp(new THREE.Color(cc), t).getHexString();
    }
  }
  return STOPS[STOPS.length - 1][1];
}

type V = [number, number, number];
const sub = (a: V, c: V): V => [a[0] - c[0], a[1] - c[1], a[2] - c[2]];
const len3 = (a: V) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V): V => {
  const l = len3(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const cross = (a: V, c: V): V => [
  a[1] * c[2] - a[2] * c[1],
  a[2] * c[0] - a[0] * c[2],
  a[0] * c[1] - a[1] * c[0],
];
const lerpN = (a: number, c: number, t: number) => a + (c - a) * t;

export default function build() {
  const b = createBuilder({ name: "phoenix" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 1.6, -0.15] });
  const chest = b.joint("chest", { at: [0, 1.9, 0.2], parent: hips });
  const neck = b.joint("neck1", { at: [0, 2.15, 0.5], parent: chest });
  const head = b.joint("head", { at: [0, 2.4, 0.72], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 2.35, 0.86], parent: head });

  // ---------- helpers ----------
  const ellipsoid = (r: number, sx: number, sy: number, sz: number, seg = 10) => {
    const g = new THREE.SphereGeometry(r, seg, Math.max(6, seg - 3));
    g.scale(sx, sy, sz);
    return g;
  };

  // feather blade between profile fractions u0..u1, in the plane (x = dir, y = width dir)
  const widthAt = (u: number, w: number) =>
    w * (1 - Math.pow(u, 2.2)) * (0.45 + 0.55 * Math.min(1, u * 5));

  function feather(base: V, d: V, wdir: V, L: number, w: number, f0: number, f1: number, bone: any) {
    const cuts = [0, 0.4, 0.7, 1];
    for (let i = 0; i < 3; i++) {
      const u0 = cuts[i];
      const u1 = cuts[i + 1];
      const top: number[][] = [];
      const bot: number[][] = [];
      const steps = 2;
      for (let s = 0; s <= steps; s++) {
        const u = lerpN(u0, u1, s / steps);
        top.push([u * L, widthAt(u, w)]);
        bot.push([u * L, -widthAt(u, w)]);
      }
      const outline = top.concat(bot.reverse());
      const fc = lerpN(f0, f1, (u0 + u1) / 2);
      b.extrude(outline, { at: base, x: d, y: wdir, color: grad(fc), depth: 0.014, bone } as any);
    }
  }

  // ribbon of trapezoids along points (tail ribbons, crest plumes)
  function ribbon(
    pts: V[],
    widths: number[],
    colorAt: (u: number) => string,
    hint: V,
    boneAt: (i: number) => any
  ) {
    for (let i = 0; i < pts.length - 1; i++) {
      const d = sub(pts[i + 1], pts[i]);
      const L = len3(d);
      const x = norm(d);
      const y = norm(cross(x, hint));
      const w1 = widths[i];
      const w2 = widths[i + 1];
      b.extrude(
        [
          [0, -w1],
          [L * 1.12, -w2],
          [L * 1.12, w2],
          [0, w1],
        ],
        { at: pts[i], x, y, color: colorAt(i / (pts.length - 1)), depth: 0.014, bone: boneAt(i) } as any
      );
    }
  }

  // ---------- body ----------
  b.part(ellipsoid(0.27, 1, 1, 1.5), "#b3121b", { at: [0, 1.6, -0.15], bone: hips });
  b.part(ellipsoid(0.34, 1, 1.05, 1.5), "#c8161b", { at: [0, 1.9, 0.2], bone: chest });
  b.part(ellipsoid(0.26, 1, 1.1, 0.8), "#ff7a12", { at: [0, 1.85, 0.42], bone: chest });
  b.part(ellipsoid(0.17, 1, 1, 1.4), "#ffb020", { at: [0, 1.76, 0.5], bone: chest });
  b.part(ellipsoid(0.17, 1, 1.4, 1), "#d41e18", { at: [0, 2.17, 0.5], bone: neck });

  // breast feather tufts
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const base: V = [0, 2.0 - t * 0.45, 0.5 - t * 0.1];
    for (const sx of [-1, 1]) {
      feather(
        [base[0] + sx * 0.12, base[1], base[2]],
        norm([sx * 0.4, -0.5, -0.5]),
        norm([0.5, 0.2, sx * -0.1 + 0.5]),
        0.32,
        0.07,
        0.45 + t * 0.2,
        0.75,
        chest
      );
    }
  }

  // head
  b.part(ellipsoid(0.2, 1, 1, 1.1), "#e02a14", { at: [0, 2.42, 0.72], bone: head });
  // beak
  b.spike([0, 2.42, 0.86], [0, 2.34, 1.2], null, 0.09, { color: "#ffcc33", bone: head } as any);
  b.spike([0, 2.37, 1.14], [0, 2.2, 1.24], null, 0.045, { color: "#e6a817", bone: head } as any);
  b.spike([0, 2.34, 0.88], [0, 2.31, 1.12], null, 0.065, { color: "#ffcc33", bone: jaw } as any);
  // eyes
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.055, 8, 6), "#ffc21a", { at: [s * 0.14, 2.47, 0.82], bone: head });
    b.part(new THREE.SphereGeometry(0.026, 6, 5), "#2a0800", { at: [s * 0.165, 2.47, 0.855], bone: head });
    b.part(new THREE.SphereGeometry(0.02, 6, 5), "#ff3a00", { at: [s * 0.1, 2.52, 0.86], bone: head });
  }

  // flame crest
  const crestBase: V = [0, 2.58, 0.68];
  for (let k = -2; k <= 2; k++) {
    const L = 0.55 - Math.abs(k) * 0.08;
    const pts: V[] = [];
    const wd: number[] = [];
    for (let i = 0; i <= 5; i++) {
      const u = i / 5;
      pts.push([
        crestBase[0] + k * 0.05 + k * 0.16 * u * u + 0.05 * Math.sin(u * 6 + k),
        crestBase[1] + L * (0.9 * u - 0.1 * u * u),
        crestBase[2] - L * (0.15 + 0.9 * u * u) - Math.abs(k) * 0.03,
      ]);
      wd.push(0.05 * Math.sin(Math.PI * Math.min(1, u * 0.85 + 0.15)) * (1 - u * 0.6) + 0.004);
    }
    ribbon(pts, wd, (u) => grad(0.4 + u * 0.6), [0, 0, 1], () => head);
  }

  // ---------- wings ----------
  for (const s of [1, -1]) {
    const sfx = s === 1 ? "L" : "R";
    const sh: V = [s * 0.25, 1.95, 0.05];
    const el: V = [s * 1.1, 2.55, -0.05];
    const wr: V = [s * 2.0, 3.05, -0.15];
    const shJ = b.joint("shoulder" + sfx, { at: sh, parent: chest });
    const elJ = b.joint("elbow" + sfx, { at: el, parent: shJ });
    const wrJ = b.joint("wrist" + sfx, { at: wr, parent: elJ });

    b.spike(sh, el, null, 0.09, { color: "#a30f18", bone: shJ } as any);
    b.spike(el, wr, null, 0.07, { color: "#c8161b", bone: elJ } as any);
    b.spike(wr, [s * 2.25, 3.2, -0.15], null, 0.05, { color: "#e8341c", bone: wrJ } as any);

    const arm = (t: number): V => {
      const a = t < 0.5 ? sh : el;
      const c = t < 0.5 ? el : wr;
      const k = t < 0.5 ? t * 2 : (t - 0.5) * 2;
      return [lerpN(a[0], c[0], k), lerpN(a[1], c[1], k), lerpN(a[2], c[2], k)];
    };
    const boneFor = (t: number) => (t < 0.35 ? shJ : t < 0.75 ? elJ : wrJ);

    const layers = [
      { n: 13, base: 1.9, w: 0.17, dz: -0.03, shift: 0.0 },
      { n: 12, base: 1.15, w: 0.15, dz: 0.0, shift: 0.1 },
      { n: 11, base: 0.6, w: 0.12, dz: 0.03, shift: 0.0 },
    ];
    for (const ly of layers) {
      for (let i = 0; i < ly.n; i++) {
        const t = 0.04 + 0.96 * (i / (ly.n - 1));
        const phi = (lerpN(-82, 38, t) * Math.PI) / 180;
        const d: V = [s * Math.cos(phi), Math.sin(phi), 0];
        const wdir: V = [-d[1] * s, d[0] * s, 0];
        const base = arm(t);
        base[2] += ly.dz;
        const L = ly.base * (0.55 + 0.6 * t) * (1 + (i % 2) * 0.05);
        const tipX = Math.abs(base[0] + d[0] * L);
        const f1 = tipX / 3.7 + 0.2 + ly.shift;
        const f0 = Math.abs(base[0]) / 3.7 * 0.6 + ly.shift * 0.5;
        feather(base, d, wdir, L, ly.w, f0, Math.min(1, f1), boneFor(t));
      }
    }
  }

  // ---------- tail ribbons ----------
  const tailBase: V = [0, 1.52, -0.4];
  const xos = [-1.1, -0.55, 0, 0.55, 1.1];
  xos.forEach((xo, k) => {
    const ph = k * 1.7;
    const lenZ = 2.4 + (2 - Math.abs(k - 2)) * 0.4;
    const pts: V[] = [];
    const wd: number[] = [];
    for (let i = 0; i <= 9; i++) {
      const u = i / 9;
      const y = tailBase[1] * Math.pow(1 - u, 1.3) + 0.12 * Math.abs(Math.sin(u * 8 + ph)) * u * (1 - u);
      pts.push([
        xo * u * 0.9 + 0.22 * Math.sin(u * 7 + ph) * u,
        Math.max(0, y),
        tailBase[2] - lenZ * u,
      ]);
      wd.push((0.05 + 0.16 * Math.sin(Math.PI * Math.min(1, u * 1.05))) * (1 - u * 0.6) + 0.01);
    }
    const tj: any[] = [];
    let par: any = hips;
    for (let j = 0; j < 3; j++) {
      const p = pts[j * 3];
      par = b.joint(`tail${k}_${j}`, { at: p, parent: par });
      tj.push(par);
    }
    ribbon(pts, wd, (u) => grad(0.12 + u * 0.88), [0, 1, 0], (i) => tj[Math.min(2, Math.floor(i / 3))]);
  });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const sfx = s === 1 ? "L" : "R";
    const hp = b.joint("hip" + sfx, { at: [s * 0.16, 1.5, -0.1], parent: hips });
    const kn = b.joint("knee" + sfx, { at: [s * 0.2, 1.22, -0.4], parent: hp });
    const an = b.joint("ankle" + sfx, { at: [s * 0.2, 0.98, -0.2], parent: kn });
    b.spike([s * 0.16, 1.5, -0.1], [s * 0.2, 1.22, -0.4], null, 0.1, { color: "#c8161b", bone: hp } as any);
    b.spike([s * 0.2, 1.22, -0.4], [s * 0.2, 0.98, -0.2], null, 0.06, { color: "#e8a317", bone: kn } as any);
    const toes: V[] = [
      [s * 0.12, 0.84, 0.0],
      [s * 0.2, 0.82, 0.05],
      [s * 0.29, 0.84, 0.0],
      [s * 0.2, 0.86, -0.38],
    ];
    for (const t of toes) {
      b.spike([s * 0.2, 0.98, -0.2], t, null, 0.035, { color: "#ffcc33", bone: an } as any);
    }
  }

  // ---------- embers ----------
  const r = rng(7);
  const emberCols = ["#ffe066", "#ffb020", "#ff6a00", "#ff3a10", "#fff3b0"];
  for (let i = 0; i < 60; i++) {
    const s = r() < 0.5 ? -1 : 1;
    const size = 0.015 + r() * 0.035;
    const x = s * (0.6 + r() * 3.4);
    const y = 1.2 + r() * 3.2;
    const z = -0.8 + r() * 1.2;
    const geo = r() < 0.5 ? new THREE.OctahedronGeometry(size, 0) : new THREE.TetrahedronGeometry(size * 1.2, 0);
    b.part(geo, emberCols[Math.floor(r() * emberCols.length)], { at: [x, y, z], bone: hips });
  }
  // a few trailing sparks behind and below
  for (let i = 0; i < 20; i++) {
    const size = 0.015 + r() * 0.025;
    b.part(new THREE.OctahedronGeometry(size, 0), emberCols[Math.floor(r() * emberCols.length)], {
      at: [(r() - 0.5) * 2.4, 0.4 + r() * 1.6, -0.8 - r() * 2.2],
      bone: hips,
    });
  }

  return b.root;
}
