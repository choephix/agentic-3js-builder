```ts
import * as THREE from "three";
import { createBuilder, catmull, paint, cells, countershade, mottle, rng } from "agentic-3js-builder";

export const meta = {
  name: "Emperor Dragonfly",
  description:
    "An emperor dragonfly hovering over a pond: electric-blue abdomen with black dorsal markings, apple-green thorax, huge turquoise eyes, four veined golden-sheen wings held flat, six legs tucked under.",
};

const BLUE = "#1f6cff";
const BLUE_BELLY = "#6bb6ff";
const BLACK = "#0c0e14";
const GREEN = "#8fd63a";
const GREEN_DARK = "#2d5a12";
const LEG = "#23180e";
const HEAD_FACE = "#c9ea55";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "emperorDragonfly" });
  const Y = 0.14;
  const thorax = b.joint("thorax", { at: [0, Y, 0], dir: [0, 0, 1], role: "spine" });

  // ---------- thorax ----------
  const thoraxPaint = paint((p, n) => {
    if (n.y < -0.45) return "#d4e47a";
    const x = Math.abs(p.x);
    if (n.y > 0.5 && x < 0.0013) return GREEN_DARK;
    if (x > 0.002) {
      const k = (p.z - 0.9 * x) / 0.009;
      if (k - Math.floor(k) < 0.2) return GREEN_DARK;
    }
    return GREEN;
  });
  b.part(new THREE.SphereGeometry(1, 12, 9), thoraxPaint, {
    bone: thorax,
    at: [0, Y, 0],
    scale: [0.0105, 0.0097, 0.0148],
    name: "thoraxBody",
  });

  // ---------- abdomen ----------
  const abdPath = catmull([
    [0, Y, -0.008],
    [0, Y, -0.028],
    [0, Y - 0.001, -0.048],
    [0, Y - 0.003, -0.068],
    [0, Y - 0.004, -0.088],
    [0, Y - 0.003, -0.104],
  ]);
  const abd = b.chain("abd", abdPath, { parent: thorax, count: 8, role: "tail" });
  const abdPaint = paint((_p, _n, s) => {
    const t = s[0];
    const a = ((s[1] % 360) + 360) % 360;
    const d = Math.min(a, 360 - a);
    if (t > 0.94) return BLACK;
    if (t < 0.14) return d < 18 ? "#14305a" : "#25b8d0";
    const fr = (t * 8) % 1;
    if (fr > 0.9) return "#101a40";
    const w = 14 + 34 * (1 - fr);
    if (d < w) return BLACK;
    return d > 140 ? BLUE_BELLY : BLUE;
  });
  const abdomen = b.sweep(abd, [0.0078, 0.0066, 0.0043, 0.0047, 0.005, 0.0048, 0.0045, 0.004, 0.0033], {
    color: abdPaint,
    sides: 8,
  });
  for (const s of [1, -1]) {
    b.spike(abdomen.at(1), [s * 0.35, 0.05, -1], 0.009, 0.0013, { color: BLACK });
  }

  // ---------- head ----------
  const head = b.joint("head", { parent: thorax, at: [0, Y + 0.006, 0.017], dir: [0, -0.05, 1], role: "head" });
  const H = head.at;
  b.part(new THREE.SphereGeometry(1, 10, 8), HEAD_FACE, {
    bone: head,
    at: [H.x, H.y - 0.001, H.z + 0.004],
    scale: [0.0072, 0.0068, 0.0062],
    name: "face",
  });
  const eyePaint = countershade("#19e3d0", "#2a8fd0", { level: 0.1, soft: 0.5 });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 11, 8), eyePaint, {
      bone: head,
      at: [H.x + s * 0.0058, H.y + 0.002, H.z + 0.0015],
      scale: [0.0068, 0.0072, 0.0075],
      name: s > 0 ? "eyeL" : "eyeR",
    });
    b.part(new THREE.SphereGeometry(1, 6, 4), BLACK, {
      bone: head,
      at: [H.x + s * 0.0035, H.y + 0.0102, H.z + 0.0025],
      scale: 0.0011,
      name: "ocellus",
    });
  }
  b.part(new THREE.SphereGeometry(1, 6, 4), BLACK, {
    bone: head,
    at: [H.x, H.y + 0.0112, H.z + 0.0035],
    scale: 0.0011,
    name: "ocellusC",
  });
  // blue "bullseye" on the frons
  b.part(new THREE.SphereGeometry(1, 8, 5), "#2a7cff", {
    bone: head,
    at: [H.x, H.y + 0.0062, H.z + 0.0072],
    scale: [0.0042, 0.0022, 0.0028],
    name: "bullseye",
  });
  b.part(new THREE.BoxGeometry(0.0075, 0.0028, 0.002), "#f4f0a0", {
    bone: head,
    at: [H.x, H.y - 0.0052, H.z + 0.0092],
    name: "labrum",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [H.x, H.y - 0.0055, H.z + 0.0045],
    dir: [0, 0, 1],
    role: "jaw",
  });
  b.part(new THREE.BoxGeometry(0.0065, 0.0016, 0.0045), "#c9a24a", {
    bone: jaw,
    at: [H.x, H.y - 0.0072, H.z + 0.0085],
    name: "lowerLip",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.0014, 0.0022, 0.004), "#3a2412", {
      bone: jaw,
      at: [H.x + s * 0.0038, H.y - 0.0055, H.z + 0.0075],
      name: "mandible",
    });
  }

  // ---------- legs (tucked under) ----------
  const legZ = [0.009, 0.0, -0.009];
  const legName = ["F", "M", "H"];
  for (const s of [1, -1]) {
    legZ.forEach((z, i) => {
      const side = s > 0 ? "L" : "R";
      const n = `${legName[i]}${side}`;
      const hip: [number, number, number] = [s * 0.0045, Y - 0.0075, z];
      const knee: [number, number, number] = [s * 0.0108, Y - 0.0165, z + 0.007];
      const foot: [number, number, number] = [s * 0.0058, Y - 0.0215, z + 0.0155];
      const ch = b.chain(`leg${n}`, catmull([hip, knee, foot]), {
        parent: thorax,
        names: [`hip${n}`, `knee${n}`, `foot${n}`],
        role: "leg",
      });
      b.sweep(ch, [0.0013, 0.0006], { color: LEG, sides: 6 });
    });
  }

  // ---------- wings ----------
  const foreOutline: [number, number][] = [
    [0, -0.002], [0.01, -0.007], [0.03, -0.0085], [0.047, -0.004], [0.0505, 0.0],
    [0.045, 0.0042], [0.025, 0.0055], [0.008, 0.004], [0, 0.002],
  ];
  const hindOutline: [number, number][] = [
    [0, -0.004], [0.01, -0.013], [0.028, -0.0145], [0.046, -0.006], [0.0505, 0.0],
    [0.045, 0.0052], [0.025, 0.0068], [0.008, 0.005], [0, 0.002],
  ];
  const wingPaint = paint((p, _n, s) => {
    const c = cells(p, 0.0065, 5);
    if (c.d2 - c.d1 < 0.0011) return "#40301a";
    if (s[0] < 0.006) return "#4a3a20";
    return s[0] > 0.03 ? "#f0dd98" : "#f4ecc8";
  });
  const wingDefs = [
    { k: "F", z: 0.006, c: 0.12, y: Y + 0.0085, out: foreOutline },
    { k: "H", z: -0.008, c: -0.1, y: Y + 0.0072, out: hindOutline },
  ];
  for (const s of [1, -1]) {
    for (const w of wingDefs) {
      const side = s > 0 ? "L" : "R";
      const k = w.k + side;
      const len = Math.hypot(1, w.c);
      const X: [number, number, number] = [s / len, 0, w.c / len];
      const Yd: [number, number, number] = [(-s * w.c) / len, 0, 1 / len];
      const P: [number, number, number] = [s * 0.0075, w.y, w.z];
      const pt = (u: number, v: number, h = 0): [number, number, number] => [
        P[0] + X[0] * u + Yd[0] * v,
        P[1] + h,
        P[2] + X[2] * u + Yd[2] * v,
      ];
      const ch = b.chain(`wing${k}`, [P, pt(0.025, 0), pt(0.05, 0)], {
        parent: thorax,
        names: [`wing${k}1`, `wing${k}2`, `wing${k}Tip`],
        role: "wing",
      });
      const root = ch.joints[0];
      const x3 = new THREE.Vector3(...X);
      const y3 = new THREE.Vector3(...Yd);
      const wing = b.extrude(w.out, {
        at: P,
        x: X,
        y: Yd,
        thickness: 0.0007,
        smoothing: 1,
        color: wingPaint,
        bone: root,
        name: `wingMembrane${k}`,
      });
      void x3; void y3; void wing;
      // leading-edge vein and pterostigma
      b.rod(pt(0.001, 0.0028, 0.0004), pt(0.049, 0.0026, 0.0004), 0.00042, { color: "#2e2012", sides: 5, bone: root });
      b.part(new THREE.BoxGeometry(0.006, 0.0016, 0.0013), "#5a3a14", {
        at: pt(0.041, 0.003, 0.0004),
        dir: X,
        axis: "x",
        bone: root,
        name: `pterostigma${k}`,
      });
    }
  }

  // ---------- pond ----------
  const water = mottle("#1b5b6b", "#2a8a8a", { size: 0.05, contrast: 0.6, seed: 4 });
  b.lathe(
    [[0, 0], [0.19, 0], [0.19, 0.0065], [0, 0.0065]],
    { at: [0, 0, 0], bone: thorax, segments: 20, color: water, name: "pond" },
  );
  for (const r of [0.045, 0.085]) {
    b.lathe(
      [[r, 0.0065], [r + 0.003, 0.0065], [r + 0.003, 0.0078], [r, 0.0078]],
      { at: [0, 0, 0], bone: thorax, segments: 20, color: "#7cc7c2", name: "ripple" },
    );
  }
  const pad: [number, number][] = [[0, 0]];
  for (let a = 25; a <= 335; a += 30) {
    const r = (a * Math.PI) / 180;
    pad.push([Math.cos(r) * 0.034, Math.sin(r) * 0.034]);
  }
  b.extrude(pad, {
    at: [0.1, 0.0078, 0.07],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.0018,
    color: "#3f8f35",
    bone: thorax,
    name: "lilyPad",
  });
  // small bloom on the pad
  const r2 = rng(3);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + r2() * 0.2;
    b.part(new THREE.ConeGeometry(0.004, 0.012, 5), "#f7a8c8", {
      at: [0.1 + Math.cos(a) * 0.004, 0.0078 + 0.0075, 0.07 + Math.sin(a) * 0.004],
      dir: [Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5],
      bone: thorax,
      name: "petal",
    });
  }

  return b.root;
}
```