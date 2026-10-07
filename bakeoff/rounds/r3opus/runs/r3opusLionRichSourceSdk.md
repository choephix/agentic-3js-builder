```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  paint,
  mottle,
  countershade,
  mix,
  smoothstep,
  noise,
  catmull,
  polyline,
} from "agentic-3js-builder";

export const meta = {
  name: "Old Lion",
  description:
    "A proud old lion lying in a sphinx pose with his head held high: a huge shaggy faceted mane fading from golden blond to dark chocolate, tawny body with cream belly and muzzle, amber eyes, broad black nose, a scar across the right brow, padded paws and a tufted tail.",
};

export default function build() {
  const b = createBuilder({ name: "lion", paintSize: 1024 });
  const R = rng(7);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- palette ----------
  const CREAM = "#efdcb6";
  const FACE = "#d3a466";
  const FACE_DARK = "#b8864d";
  const DARK = "#3a2214";
  const BLACK = "#1a1210";

  const tawny = mottle("#c99a5c", "#b98a4e", { size: 0.35, seed: 3, contrast: 0.7 });
  const backShade = countershade("#b07c45", tawny, { level: 0.75, soft: 0.15 });
  const bodyPaint = countershade(backShade, CREAM, { level: -0.3, soft: 0.3 });

  const F = V(0, 1.0, 0.86);
  const manePaint = paint((p) => {
    const d = p.distanceTo(F) + (noise(p, 0.08, 5) - 0.5) * 0.14;
    const t = smoothstep(0.12, 0.62, d);
    const c = t < 0.5 ? mix("#f2c462", "#b8702c", t * 2) : mix("#b8702c", "#45271a", (t - 0.5) * 2);
    const k = 0.82 + 0.34 * noise(p, 0.025, 9);
    return [Math.min(c[0] * k, 1), Math.min(c[1] * k, 1), Math.min(c[2] * k, 1)] as [number, number, number];
  });

  const SPH = new THREE.SphereGeometry(1, 14, 10);
  const SPH_S = new THREE.SphereGeometry(1, 10, 7);

  // ---------- skeleton ----------
  b.joint("hips", { at: [0, 0.4, -0.55], dir: [0, 0, 1] });
  const spine = b.chain("spine", catmull([[0, 0.4, -0.55], [0, 0.4, -0.1], [0, 0.46, 0.4]]), {
    parent: "hips",
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 0.5, 0.42], [0, 0.74, 0.58], [0, 0.92, 0.66]]), {
    parent: "chest",
    names: ["neck1", "neck2"],
    role: "neck",
  });
  b.joint("head", { parent: "neck2", at: [0, 0.92, 0.66], dir: [0, 0.2, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.93, 0.8], dir: [0, -0.3, 1], role: "jaw" });

  // ---------- body ----------
  b.loft(
    [
      { at: [0, 0.3, -0.92], w: 0.34, h: 0.4 },
      { at: [0, 0.32, -0.74], w: 0.6, h: 0.62 },
      { at: [0, 0.31, -0.4], w: 0.58, h: 0.6 },
      { at: [0, 0.33, 0], w: 0.56, h: 0.63 },
      { at: [0, 0.38, 0.33], w: 0.52, h: 0.72 },
      { at: [0, 0.47, 0.56], w: 0.36, h: 0.5 },
    ],
    { color: bodyPaint, bone: spine, sides: 14, name: "body" },
  );

  // ---------- legs ----------
  const leg = (s: number, front: boolean) => {
    const L = s > 0 ? "L" : "R";
    const pts: number[][] = front
      ? [[0.2 * s, 0.42, 0.3], [0.23 * s, 0.11, 0.2], [0.23 * s, 0.075, 0.72], [0.23 * s, 0.07, 0.84]]
      : [[0.24 * s, 0.38, -0.55], [0.34 * s, 0.16, -0.22], [0.4 * s, 0.075, -0.72], [0.47 * s, 0.065, -0.46]];
    const names = front
      ? [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `paw${L}`]
      : [`hip${L}`, `knee${L}`, `hock${L}`, `foot${L}`];
    const chain = b.chain(front ? `foreleg${L}` : `hindleg${L}`, polyline(pts), {
      parent: front ? "chest" : "hips",
      names,
      role: "leg",
    });
    b.sweep(chain, front ? [0.12, 0.105, 0.09, 0.08, 0.075, 0.07] : [0.15, 0.12, 0.09, 0.07, 0.065, 0.06], {
      color: bodyPaint,
      sides: 10,
    });

    const hock = V(pts[2][0], pts[2][1], pts[2][2]);
    const toe = V(pts[3][0], pts[3][1], pts[3][2]);
    const fdir = front ? V(0, 0, 1) : toe.clone().sub(hock).setY(0).normalize();
    const pawBone = front ? `paw${L}` : `foot${L}`;
    const center = front ? V(0.23 * s, 0.06, 0.82) : hock.clone().lerp(toe, 0.75).setY(0.055);
    // big padded paw
    b.part(SPH, "#d9b07a", {
      at: center,
      scale: front ? [0.095, 0.06, 0.125] : [0.085, 0.055, 0.12],
      dir: fdir,
      axis: "z",
      bone: pawBone,
    });
    const side = fdir.clone().cross(V(0, 1, 0)).normalize();
    for (let k = 0; k < 4; k++) {
      const off = (k - 1.5) * 0.034;
      const tp = center.clone().addScaledVector(fdir, 0.1).addScaledVector(side, off).setY(0.05);
      b.part(SPH_S, "#e2bf8c", { at: tp, scale: [0.03, 0.03, 0.034], dir: fdir, axis: "z", bone: pawBone });
      if (k < 3) {
        const g = center.clone().addScaledVector(fdir, 0.11).addScaledVector(side, off + 0.017).setY(0.075);
        b.part(SPH_S, "#7a5232", { at: g, scale: [0.004, 0.006, 0.02], dir: fdir, axis: "z", bone: pawBone });
      }
    }
    // elbow / heel tufts
    if (front) {
      for (let k = 0; k < 3; k++) {
        b.spike(V(0.27 * s, 0.14 + k * 0.02, 0.16), V(0.35 * s, -0.1 + k * 0.1, -1), 0.11, 0.028, {
          color: "#5b3a22",
          bone: `elbow${L}`,
          section: { ngon: 4 },
        });
      }
    } else {
      // big haunch
      b.part(SPH, bodyPaint, { at: [0.25 * s, 0.3, -0.5], scale: [0.15, 0.22, 0.25], bone: `hip${L}` });
    }
  };
  leg(1, true);
  leg(-1, true);
  leg(1, false);
  leg(-1, false);

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([[0, 0.42, -0.82], [0, 0.3, -1.02], [0.05, 0.09, -1.28], [0.2, 0.055, -1.58], [0.38, 0.055, -1.8], [0.56, 0.065, -1.94]]),
    { parent: "hips", count: 5, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );
  b.sweep(tail, [0.065, 0.05, 0.045, 0.04, 0.036, 0.034], {
    bands: [
      [0.9, bodyPaint],
      [1, "#6b4428"],
    ],
    sides: 8,
  });
  const tip = tail.at(1);
  const tg = tip.tangent.normalize();
  const tuftC = tip.at.clone().addScaledVector(tg, 0.05);
  b.part(SPH, DARK, { at: tuftC, scale: [0.06, 0.058, 0.09], dir: tg, axis: "z", bone: "tail5" });
  for (let k = 0; k < 12; k++) {
    const d = tg.clone().add(V((R() - 0.5) * 1.6, (R() - 0.3) * 1.0, (R() - 0.5) * 1.6)).normalize();
    if (d.y < -0.1) d.y = -0.1;
    b.spike(tuftC, d, 0.11 + R() * 0.05, 0.035, {
      color: k % 2 ? DARK : "#24140b",
      bone: "tail5",
      section: { ngon: 4 },
    });
  }

  // ---------- neck & mane ----------
  const neckSweep = b.sweep(neck, [0.2, 0.17, 0.15], { color: manePaint, sides: 10 });
  b.part(SPH, manePaint, { at: [0, 0.93, 0.55], scale: [0.3, 0.36, 0.28], bone: "neck2" });

  const rings = [
    { c: [0, 1.035, 0.77], radius: 0.14, count: 16, tilt: -12, len: 0.15, r: 0.05 },
    { c: [0, 1.025, 0.69], radius: 0.17, count: 18, tilt: -30, len: 0.24, r: 0.068 },
    { c: [0, 1.0, 0.6], radius: 0.19, count: 20, tilt: -48, len: 0.32, r: 0.082 },
    { c: [0, 0.97, 0.5], radius: 0.18, count: 18, tilt: -68, len: 0.36, r: 0.09 },
  ];
  rings.forEach((ring, ri) => {
    b.ring(
      frame(ring.c, [0, 0.1, 1]),
      { count: ring.count, radius: ring.radius, tilt: ring.tilt, fromDeg: ri * 7 },
      (item) => {
        const out = item.outward.clone();
        const d = out
          .clone()
          .add(V((R() - 0.5) * 0.35, (R() - 0.5) * 0.3 - 0.12, (R() - 0.5) * 0.3))
          .normalize();
        const base = item.at.clone().addScaledVector(out, -0.02);
        b.spike(base, d, ring.len * (0.8 + R() * 0.45), ring.r * (0.85 + R() * 0.3), {
          color: manePaint,
          bone: "head",
          section: { ngon: 5 },
        });
      },
    );
  });
  for (const t of [0.25, 0.5, 0.75]) {
    for (let a = 0; a < 360; a += 30) {
      const hit = neckSweep.at(t, a + t * 20);
      const n = hit.n;
      const d = n.clone().add(V((R() - 0.5) * 0.3, -0.35, -0.25)).normalize();
      const base = hit.at.addScaledVector(n, -0.03);
      b.spike(base, d, 0.26 + R() * 0.12, 0.075 + R() * 0.02, {
        color: manePaint,
        section: { ngon: 5 },
      });
    }
  }

  // ---------- head ----------
  const faceParts: any[] = [];
  const cranium = b.part(SPH, FACE, { at: [0, 1.04, 0.7], scale: [0.176, 0.152, 0.168], bone: "head" });
  faceParts.push(cranium);
  for (const s of [1, -1]) {
    faceParts.push(b.part(SPH, FACE, { at: [0.1 * s, 0.98, 0.79], scale: [0.08, 0.08, 0.08], bone: "head" }));
  }
  // muzzle & nose bridge
  b.part(SPH, CREAM, { at: [0, 0.955, 0.88], scale: [0.1, 0.075, 0.11], bone: "head" });
  b.frustumBox([0, 1.08, 0.83], [0, 1.0, 0.965], [0.09, 0.06], [0.075, 0.05], { color: FACE_DARK, bone: "head" });
  b.extrude(
    [
      [-0.056, 0.022],
      [0.056, 0.022],
      [0.014, -0.03],
      [-0.014, -0.03],
    ],
    { color: BLACK, at: [0, 1.0, 0.975], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.045, bevel: 0.008, smoothing: 1, bone: "head" },
  );
  b.rod([0, 0.972, 0.992], [0, 0.94, 0.995], 0.004, { color: BLACK, bone: "head", sides: 4 });
  // whisker pads
  const pads: any[] = [];
  for (const s of [1, -1]) {
    pads.push(b.part(SPH, "#f3e6c8", { at: [0.042 * s, 0.945, 0.95], scale: [0.05, 0.04, 0.045], bone: "head" }));
  }
  // lip line
  b.sweep(
    catmull([
      [0.075, 0.915, 0.89],
      [0.04, 0.903, 0.955],
      [0, 0.9, 0.97],
      [-0.04, 0.903, 0.955],
      [-0.075, 0.915, 0.89],
    ]),
    0.005,
    { color: "#2a1810", bone: "head", sides: 4 },
  );
  // lower jaw
  b.part(SPH, "#efe0c0", { at: [0, 0.905, 0.87], scale: [0.075, 0.035, 0.1], bone: "jaw" });
  b.part(SPH_S, "#f7ecd4", { at: [0, 0.885, 0.9], scale: [0.05, 0.03, 0.06], bone: "jaw" });

  // eyes
  for (const s of [1, -1]) {
    const E = V(0.068 * s, 1.065, 0.858);
    const d = V(0.32 * s, 0.05, 1).normalize();
    faceParts.push(
      b.part(SPH_S, "#24150c", {
        at: E.clone().addScaledVector(d, -0.006),
        scale: [0.036, 0.027, 0.016],
        dir: d,
        axis: "z",
        bone: "head",
      }),
    );
    const front = E.clone().addScaledVector(d, 0.017);
    const irisPaint = paint((p) => mix("#f6c444", "#a85f12", smoothstep(0.004, 0.022, p.distanceTo(front))));
    faceParts.push(b.part(SPH, irisPaint, { at: E, scale: [0.025, 0.021, 0.017], dir: d, axis: "z", bone: "head" }));
    b.part(SPH_S, "#0b0705", {
      at: E.clone().addScaledVector(d, 0.013),
      scale: [0.008, 0.01, 0.006],
      dir: d,
      axis: "z",
      bone: "head",
    });
    b.part(SPH_S, "#ffffff", {
      at: E.clone().addScaledVector(d, 0.018).add(V(0.006, 0.007, 0)),
      scale: 0.0045,
      bone: "head",
    });
    faceParts.push(
      b.part(SPH_S, FACE_DARK, {
        at: E.clone().add(V(0, 0.03, -0.004)),
        scale: [0.048, 0.017, 0.03],
        dir: d,
        axis: "z",
        bone: "head",
      }),
    );
    b.part(SPH_S, CREAM, {
      at: E.clone().add(V(0, -0.026, -0.004)),
      scale: [0.034, 0.013, 0.024],
      dir: d,
      axis: "z",
      bone: "head",
    });
    // tear line toward muzzle
    b.part(SPH_S, "#8a5a32", {
      at: E.clone().add(V(-0.018 * s, -0.04, 0.03)),
      scale: [0.006, 0.022, 0.01],
      rotation: [0, 0, -25 * s],
      bone: "head",
    });
  }

  // ears
  for (const s of [1, -1]) {
    const base = [0.115 * s, 1.165, 0.72];
    const rot = [0, 0, -20 * s];
    b.part(SPH, FACE, { at: base, scale: [0.055, 0.06, 0.026], rotation: rot, bone: "head" });
    b.part(SPH_S, DARK, { at: [base[0], base[1], base[2] - 0.01], scale: [0.056, 0.061, 0.02], rotation: rot, bone: "head" });
    b.part(SPH_S, "#e8d2b0", { at: [base[0], base[1] - 0.005, base[2] + 0.014], scale: [0.033, 0.038, 0.012], rotation: rot, bone: "head" });
  }

  // scar across the right brow
  const faceSurf = b.surface(faceParts);
  const scar = (a: [number, number], c: [number, number], n: number, r: number) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= n; i++) {
      const x = a[0] + (c[0] - a[0]) * (i / n);
      const y = a[1] + (c[1] - a[1]) * (i / n);
      const hit = faceSurf.ray([x, y, 2], [0, 0, -1]);
      if (hit) pts.push(hit.at.clone().addScaledVector(hit.n, 0.004));
    }
    if (pts.length >= 2)
      b.sweep(catmull(pts), [r * 0.5, r, r * 0.5], { color: "#e7a7a0", bone: "head", sides: 5 });
  };
  scar([-0.035, 1.14], [-0.105, 1.02], 8, 0.007);
  scar([-0.062, 1.148], [-0.098, 1.092], 4, 0.005);

  // whisker spots and whiskers
  const padSurf = b.surface(pads);
  for (const s of [1, -1]) {
    for (let j = 0; j < 3; j++) {
      for (let i = 0; i < 3; i++) {
        const hit = padSurf.ray([s * (0.03 + 0.016 * i), 0.958 - 0.013 * j, 2], [0, 0, -1]);
        if (!hit) continue;
        const spot = hit.at.clone().addScaledVector(hit.n, 0.001);
        b.part(SPH_S, "#4a2e1c", { at: spot, scale: 0.004, bone: "head" });
        if (i === 2) {
          b.rod(spot, spot.clone().add(V(s * 0.21, 0.035 - 0.03 * j, -0.05)), [0.0022, 0.0008], {
            color: "#f8f4ea",
            bone: "head",
            sides: 3,
          });
        }
      }
    }
  }

  return b.root;
}
```