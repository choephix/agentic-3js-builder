import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { noise } from "../../../../src/paint";
import { cellPaint, pixelArt, pixelTexture, snapColor } from "../../../../kits/pixel";

export const meta = {
  name: "Koala on Eucalyptus Stand",
  description:
    "A fluffy pixel-art koala hugging a eucalyptus branch mounted on a wooden display stand, with hanging leaf sprigs.",
  style: "pixel art",
  commit: "88fc1f0",
};

const snap = (list: string[]) => list.map((c) => snapColor(c, 64));
const FUR = snap(["#3d4147", "#5b5f66", "#7a7f87", "#9a9ea5", "#b8bbc0", "#d2d3d4"]);
const BELLY = snap(["#bfae92", "#d8cbb0", "#ece3cc", "#f6efdd"]);
const EAR = snap(["#9a9ea5", "#c9cbce", "#eeeeee", "#fafafa"]);
const PINK = snap(["#a97a74", "#c99a90", "#e2b8ac"]);
const BARK = snap(["#2e1d12", "#4a2f1c", "#6a4528", "#8a5c35", "#a97a4a"]);
const WOOD = snap(["#3b2616", "#5a3a20", "#7a522d", "#98703c"]);
const LEAFC = snap(["#1f3d22", "#2e5a2c", "#46803a", "#6fa44a"]);
const VEIN = "#c3c874";
const NOSE = "#26262c";
const GREY_HAND = "#6f737a";
const CLAW = "#1d1d22";

const h1 = (n: number) => {
  let h = Math.imul(n | 0, 374761393);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

const barkPaint = cellPaint(
  0.014,
  (c) => {
    const col = h1(c.u * 31 + c.depth * 17 + (c.axis === 2 ? 0 : 5));
    let v = 0.2 + 0.55 * col + 0.15 * (c.random(3) - 0.5);
    if (noise(c.at, 0.12, 9) > 0.68) v += 0.22;
    return c.pick(BARK, v);
  },
  { dither: true },
);

const woodPaint = (shift: number) =>
  cellPaint(
    0.012,
    (c) => c.pick(WOOD, 0.3 + shift + 0.3 * h1(c.v * 5 + c.depth + c.axis * 3) + 0.15 * (c.random(2) - 0.5)),
    { dither: true },
  );

const leafPaint = cellPaint(
  0.01,
  (c) => {
    if (Math.abs(c.s[1]) < 0.0045 && c.s[0] > 0.02) return VEIN;
    const v = 0.45 + 0.35 * (noise(c.at, 0.05, 2) - 0.5) + (c.s[1] > 0 ? 0.12 : -0.04);
    return c.pick(LEAFC, v);
  },
  { dither: true },
);

const bodyFur = cellPaint(
  0.016,
  (c) => {
    const nz = noise(c.at, 0.08, 3) - 0.5;
    const sp = c.random(1) - 0.5;
    const chest = c.at.y > 0.42 && c.at.y < 0.76 && c.n.z > 0.3 && Math.abs(c.at.x + 0.02) < 0.13;
    const belly = c.at.y <= 0.42 && c.n.z > 0.3 && Math.abs(c.at.x + 0.02) < 0.14;
    if (chest || belly) return c.pick(BELLY, 0.5 + nz + 0.25 * c.n.z + sp * 0.2);
    return c.pick(FUR, 0.5 + 0.28 * c.n.y + 0.5 * nz + sp * 0.15);
  },
  { dither: true },
);

const headFur = cellPaint(
  0.014,
  (c) => {
    const nz = noise(c.at, 0.07, 5) - 0.5;
    const sp = c.random(2) - 0.5;
    if (c.n.y < -0.35) return c.pick(BELLY, 0.45 + nz + sp * 0.2);
    return c.pick(FUR, 0.58 + 0.25 * c.n.y + 0.5 * nz + sp * 0.15);
  },
  { dither: true },
);

const limbFur = cellPaint(
  0.015,
  (c) => c.pick(FUR, 0.45 + 0.25 * c.n.y + 0.5 * (noise(c.at, 0.07, 7) - 0.5) + 0.15 * (c.random(4) - 0.5)),
  { dither: true },
);

const earFur = cellPaint(
  0.012,
  (c) => c.pick(EAR, 0.55 + 0.4 * (noise(c.at, 0.04, 4) - 0.5) + 0.2 * (c.random(5) - 0.5)),
  { dither: true },
);
const earPink = cellPaint(0.01, (c) => c.pick(PINK, 0.5 + 0.8 * (noise(c.at, 0.03, 6) - 0.5)), { dither: true });

const TUFT = pixelArt(["..w..", ".www.", "wwwww", "wwgww", "wggww", ".ggg."], { w: "#f2f2ee", g: "#b8babd" });
const TUFT2 = pixelArt(["..a..", ".aaa.", "aabaa", "abbba", ".bbb."], { a: "#a9adb4", b: "#767a82" });

const GLYPHS: Record<string, string[]> = {
  K: ["x.x", "x.x", "xx.", "x.x", "x.x"],
  O: ["xxx", "x.x", "x.x", "x.x", "xxx"],
  A: [".x.", "x.x", "xxx", "x.x", "x.x"],
  L: ["x..", "x..", "x..", "x..", "xxx"],
};
const PLAQUE = pixelTexture(23, 8, (g) => {
  g.fill(() => "#1f3a24");
  "KOALA".split("").forEach((ch, i) => g.stamp(2 + i * 4, 1, GLYPHS[ch], { x: "#e8c15a" }));
  g.fill(() => "#a8883a", [1, 7, 21, 1]);
});

export default function build() {
  const b = createBuilder({ name: "koala" });
  const rand = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---- skeleton
  const hips = b.joint("hips", { at: [-0.02, 0.34, -0.03], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [-0.02, 0.34, -0.03],
      [-0.02, 0.52, 0.0],
      [-0.02, 0.7, 0.06],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];
  const head = b.joint("head", { parent: chest, at: [-0.02, 0.76, 0.08], dir: [0, 0.25, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [-0.02, 0.79, 0.17],
    aim: [-0.02, 0.77, 0.27],
    role: "jaw",
  });

  // ---- stand and branch (static, on the root)
  b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.07, 8), woodPaint(0), {
    bone: hips,
    at: [0, 0.035, 0],
    rotation: [0, 22.5, 0],
  });
  b.part(new THREE.CylinderGeometry(0.24, 0.26, 0.03, 8), woodPaint(0.15), {
    bone: hips,
    at: [0, 0.085, 0],
    rotation: [0, 22.5, 0],
  });
  b.part(new THREE.PlaneGeometry(0.173, 0.06), "#ffffff", {
    bone: hips,
    at: [0, 0.035, 0.279],
    dir: [0, 0, 1],
    axis: "z",
    texture: PLAQUE,
  });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.008, 6), "#c2a24c", {
      bone: hips,
      at: [0.21 * Math.sin(a), 0.1, 0.21 * Math.cos(a)],
    });
  }

  const polePath = catmull([
    [0.17, 0.09, -0.02],
    [0.18, 0.7, -0.02],
    [0.22, 1.3, -0.03],
  ]);
  b.sweep(polePath, [0.052, 0.042], barkPaint, { bone: hips, sides: 8, caps: { start: "flat", end: "flat" } });
  const top = polePath.at(1);
  const topDir = polePath.tangentAt(1);
  b.part(new THREE.CylinderGeometry(0.041, 0.041, 0.008, 8), "#d9b27a", {
    bone: hips,
    at: top.clone().addScaledVector(topDir, 0.002),
    dir: topDir,
  });
  b.part(new THREE.CylinderGeometry(0.068, 0.075, 0.07, 8), "#8a6a3a", { bone: hips, at: [0.17, 0.125, -0.02] });
  b.part(new THREE.CylinderGeometry(0.072, 0.072, 0.012, 8), "#5e4626", { bone: hips, at: [0.17, 0.165, -0.02] });
  // knots on the bark
  for (const [y, a] of [
    [0.45, 2.2],
    [0.95, 4.0],
    [1.12, 1.4],
  ] as const) {
    const p = polePath.at(polePath.closestT([0.18, y, -0.02]));
    b.part(new THREE.SphereGeometry(0.014, 6, 4), "#2a1a10", {
      bone: hips,
      at: [p.x + 0.05 * Math.sin(a), p.y, p.z + 0.05 * Math.cos(a)],
      scale: [1, 1.3, 1],
    });
  }

  // ---- leaves
  const leafOutline = (L: number): OutlinePoint[] => {
    const top: [number, number][] = [
      [0.12, 0.1],
      [0.35, 0.15],
      [0.65, 0.12],
      [0.88, 0.06],
    ];
    return [
      [0, 0, "sharp"],
      ...top.map(([x, y]) => [x * L, y * L] as OutlinePoint),
      [L, 0, "sharp"],
      ...[...top].reverse().map(([x, y]) => [x * L, -y * L] as OutlinePoint),
    ];
  };
  const placeLeaf = (at: THREE.Vector3, d: THREE.Vector3, yv: THREE.Vector3, len: number, thick = 0.006) =>
    b.extrude(leafOutline(len), {
      at,
      x: d.toArray(),
      y: yv.toArray(),
      thickness: thick,
      smoothing: 1,
      color: leafPaint,
      bone: hips,
    });
  const hangLeaf = (at: THREE.Vector3, dir: THREE.Vector3, len: number, roll: number) => {
    const d = dir.clone().normalize();
    const up = V(0, 1, 0);
    const y = up.addScaledVector(d, -up.dot(d)).normalize().applyAxisAngle(d, roll);
    placeLeaf(at, d, y, len);
  };
  const sprig = (y: number, angDeg: number, rise: number) => {
    const p = polePath.at(polePath.closestT([0.18, y, -0.02]));
    const a = (angDeg * Math.PI) / 180;
    const out = V(Math.cos(a), 0, Math.sin(a));
    const perp = V(-Math.sin(a), 0, Math.cos(a));
    const stem = catmull([
      p.toArray(),
      [p.x + out.x * 0.1, p.y + rise * 0.12, p.z + out.z * 0.1],
      [p.x + out.x * 0.2, p.y + rise * 0.1 - 0.02, p.z + out.z * 0.2],
    ]);
    b.sweep(stem, [0.008, 0.004], "#6b5a2a", { bone: hips, sides: 6 });
    const stops = [0.45, 0.65, 0.85, 1, 1];
    stops.forEach((t, i) => {
      const q = stem.at(t);
      const sgn = i % 2 === 0 ? 1 : -1;
      const dir = out
        .clone()
        .multiplyScalar(0.5)
        .addScaledVector(perp, sgn * (i >= 3 ? 0.2 : 0.4))
        .add(V(0, -0.75, 0));
      hangLeaf(q, dir, 0.17 + 0.07 * rand(), (rand() - 0.5) * 1.2);
    });
  };
  sprig(1.14, 8, 0.25);
  sprig(1.0, -28, 0.1);
  sprig(0.88, 38, 0.2);
  sprig(1.24, 70, 0.3);
  sprig(0.55, -35, 0.15);
  for (const [x, z, a] of [
    [-0.12, 0.17, 0.5],
    [0.05, 0.2, 2.0],
    [-0.2, -0.05, 3.7],
  ] as const) {
    const d = V(Math.cos(a), 0, Math.sin(a));
    placeLeaf(V(x, 0.1015, z), d, V(-Math.sin(a), 0, Math.cos(a)), 0.12, 0.005);
  }

  // ---- body
  const body = b.sweep(spine, [0.16, 0.175, 0.135], bodyFur);
  const bodySkin = b.surface(body);
  b.cards(bodySkin.scatter(60, { rng: rng(5), minDist: 0.06, filter: (h) => h.n.y > -0.2 }), TUFT2, {
    size: [0.04, 0.05],
    lean: 55,
    vary: 0.25,
    rng: rng(6),
  });

  // ---- head
  const H: [number, number, number] = [-0.02, 0.85, 0.13];
  const skull = b.part(new THREE.SphereGeometry(0.135, 12, 8), headFur, {
    bone: head,
    at: H,
    scale: [1, 0.86, 0.92],
  });
  b.cards(
    b.surface(skull).scatter(40, {
      rng: rng(8),
      minDist: 0.04,
      filter: (h) => h.n.z > -0.1 && h.n.y < 0.3 && Math.abs(h.n.x) > 0.5,
    }),
    TUFT,
    { size: [0.03, 0.035], lean: 60, vary: 0.2, rng: rng(9) },
  );
  b.part(new THREE.SphereGeometry(0.055, 8, 6), "#ddd0b4", {
    bone: head,
    at: [-0.02, 0.79, 0.235],
    scale: [1, 0.7, 0.8],
  });
  b.part(new THREE.SphereGeometry(0.036, 8, 6), NOSE, {
    bone: head,
    at: [-0.02, 0.822, 0.268],
    scale: [1.05, 0.85, 0.85],
  });
  b.part(new THREE.SphereGeometry(0.009, 5, 4), "#55555e", { bone: head, at: [-0.035, 0.834, 0.296] });
  b.part(new THREE.SphereGeometry(0.05, 8, 6), "#d6c9ad", {
    bone: jaw,
    at: [-0.02, 0.768, 0.215],
    scale: [1, 0.5, 0.85],
  });
  b.rod([-0.02, 0.795, 0.272], [-0.02, 0.775, 0.278], 0.003, "#3a2c28", { bone: head, sides: 4 });
  for (const s of [1, -1]) {
    b.rod([-0.02, 0.775, 0.278], [-0.02 + s * 0.03, 0.772, 0.262], 0.003, "#3a2c28", { bone: head, sides: 4 });
    const ex = -0.02 + s * 0.065;
    b.part(new THREE.SphereGeometry(0.026, 8, 6), "#3a3d43", {
      bone: head,
      at: [ex, 0.865, 0.226],
      scale: [1, 1, 0.5],
    });
    b.part(new THREE.SphereGeometry(0.02, 8, 6), "#4a2c18", { bone: head, at: [ex, 0.865, 0.232] });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), "#0a0a0e", { bone: head, at: [ex, 0.865, 0.246] });
    b.part(new THREE.SphereGeometry(0.005, 4, 3), "#ffffff", {
      bone: head,
      at: [ex + s * 0.006, 0.872, 0.251],
    });
  }

  // ---- ears
  const ang = (25 * Math.PI) / 180;
  for (const s of [1, -1]) {
    const E = V(-0.02 + s * 0.15, 0.95, 0.1);
    const n = V(s * Math.cos(ang), 0, Math.sin(ang));
    const earJ = b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: [-0.02 + s * 0.11, 0.93, 0.1],
      dir: [s, 0.3, 0],
      role: "hinge",
    });
    b.part(new THREE.SphereGeometry(0.085, 10, 8), earFur, {
      bone: earJ,
      at: E,
      scale: [0.4, 1, 0.92],
      rotation: [0, -s * 25, 0],
    });
    b.part(new THREE.SphereGeometry(0.062, 8, 6), earPink, {
      bone: earJ,
      at: E.clone().addScaledVector(n, 0.026),
      scale: [0.25, 0.85, 0.75],
      rotation: [0, -s * 25, 0],
    });
    const U = V(0, 1, 0);
    const Vv = n.clone().cross(U);
    const ring: ReturnType<typeof frame>[] = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const dir = U.clone().multiplyScalar(Math.cos(a)).addScaledVector(Vv, Math.sin(a) * 0.9).normalize();
      ring.push(frame(E.clone().addScaledVector(dir, 0.08), dir.toArray()));
    }
    b.cards(ring, TUFT, {
      size: [0.035, 0.045],
      lean: 25,
      flow: n.toArray(),
      vary: 0.2,
      rng: rng(20 + (s > 0 ? 1 : 0)),
      bone: earJ,
    });
  }

  // ---- limbs
  const R = 0.056;
  const grip = (bone: (typeof chest), y: number, count: number, gap: number, rad: number, wristPos: THREE.Vector3) => {
    const p = polePath.at(polePath.closestT([0.18, y, -0.02]));
    const cx = p.x;
    const cz = p.z;
    for (let k = 0; k < count; k++) {
      const yy = y + (k - (count - 1) / 2) * gap;
      const pts = [-35, 5, 45, 85].map((a, i) => {
        const r = (a * Math.PI) / 180;
        return [cx + R * Math.sin(r), yy - 0.003 * i, cz + R * Math.cos(r)];
      });
      b.sweep(catmull(pts), [rad, rad * 0.8], GREY_HAND, {
        bone,
        sides: 6,
        bands: [
          [0.78, GREY_HAND],
          [1, CLAW],
        ],
      });
    }
    b.part(new THREE.SphereGeometry(0.036, 8, 6), GREY_HAND, {
      bone,
      at: wristPos.clone().add(V(0.012, 0, 0.004)),
      scale: [1.1, 1.15, 0.9],
    });
  };
  const wristAt = (y: number) => {
    const p = polePath.at(polePath.closestT([0.18, y, -0.02]));
    const r = (-35 * Math.PI) / 180;
    return V(p.x + R * Math.sin(r), y, p.z + R * Math.cos(r));
  };
  const arm = (side: string, shoulder: number[], elbow: number[], y: number) => {
    const w = wristAt(y);
    const chain = b.chain(`arm${side}`, catmull([shoulder, elbow, w.toArray()]), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `hand${side}`],
      role: "arm",
    });
    b.sweep(chain, [0.05, 0.04, 0.032], limbFur);
    grip(chain.joints[chain.joints.length - 1], y, 4, 0.019, 0.01, w);
  };
  arm("L", [0.1, 0.68, 0.05], [0.15, 0.76, 0.17], 0.88);
  arm("R", [-0.14, 0.67, 0.05], [-0.03, 0.6, 0.19], 0.62);
  const leg = (side: string, hip: number[], knee: number[], y: number) => {
    const w = wristAt(y);
    const chain = b.chain(`leg${side}`, catmull([hip, knee, w.toArray()]), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `foot${side}`],
      role: "leg",
    });
    b.sweep(chain, [0.075, 0.055, 0.042], limbFur);
    grip(chain.joints[chain.joints.length - 1], y, 4, 0.022, 0.012, w);
  };
  leg("L", [0.09, 0.33, 0.0], [0.14, 0.44, 0.17], 0.33);
  leg("R", [-0.12, 0.31, 0.0], [-0.07, 0.36, 0.2], 0.2);

  return b.root;
}
