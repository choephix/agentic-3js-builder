```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  spiral,
  paint,
  spots,
  mix,
  smoothstep,
  interpolate,
} from "agentic-3js-builder";

export const meta = {
  name: "Lined Seahorse",
  description:
    "A yellow lined seahorse with a ridged body, white freckles, a crown of spikes, a tube snout, a fluttering dorsal fin and big eyes, curled tail gripping a strand of seagrass.",
};

const YEL = "#ffc72c";
const CREAM = "#fff0a8";
const DARK = "#7a3b0c";
const ORANGE = "#f28c1a";
const RIDGE = "#f8a81c";

export default function build() {
  const b = createBuilder({ name: "seahorse" });

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0, 0] });
  b.joint("hips", { parent: "root", at: [0, 0.15, -0.02], dir: [0, -1, 0] });

  const spinePath = catmull([
    [0, 0.15, -0.02],
    [0, 0.19, 0.0],
    [0, 0.23, 0.004],
    [0, 0.265, -0.002],
    [0, 0.288, 0.008],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: "hips",
    names: ["spineLow", "spineMid", "spineHigh", "neck", "head"],
    role: "spine",
  });

  const wrapCenter: [number, number, number] = [0, 0.12, -0.045];
  const coil = spiral(wrapCenter, [0, 0.12, -0.027], [0, -1, 0], { turns: 2.5, r1: 0.011, pitch: 0.022 });
  const tailPath = polyline([
    [0, 0.15, -0.02],
    [0, 0.12, -0.027],
  ]).concat(coil);
  const tail = b.chain("tail", tailPath, { parent: "hips", count: 10, role: "tail" });

  const jaw = b.joint("jaw", {
    parent: "head",
    at: [0, 0.2835, 0.034],
    aim: [0, 0.2745, 0.0765],
    role: "jaw",
  });
  b.joint("pectoralL", { parent: "spineHigh", at: [0.02, 0.25, -0.004], dir: [1, 0, -0.3], role: "fan" });
  b.joint("pectoralR", { parent: "spineHigh", at: [-0.02, 0.25, -0.004], dir: [-1, 0, -0.3], role: "fan" });
  b.joint("dorsalFin", { parent: "spineMid", at: [0, 0.205, -0.03], dir: [0, 0, -1], role: "fan" });

  // ---------- paints ----------
  const shaded = paint((p, n) => mix(YEL, CREAM, smoothstep(0.0, 0.9, n.z)));
  const freckled = spots(shaded, "#fffdf0", { size: 0.011, amount: 0.12, seed: 3 });
  const lined = (count: number) =>
    paint((p, n, s) => ((s[0] * count) % 1 < 0.09 ? DARK : freckled));

  // ---------- body and tail ----------
  const bodyXs = [0, 0.25, 0.5, 0.75, 1];
  const bodyYs = [0.015, 0.026, 0.029, 0.02, 0.016];
  const bodyR = (t: number) => interpolate(bodyXs, bodyYs, t);
  b.sweep(spine, bodyR, { color: lined(14), sides: 10, name: "body" });

  const tailXs = [0, 0.2, 0.4, 0.6, 0.8, 1];
  const tailYs = [0.015, 0.012, 0.0095, 0.007, 0.005, 0.0032];
  const tailR = (t: number) => interpolate(tailXs, tailYs, t);
  b.sweep(tail, tailR, { color: lined(26), sides: 8, name: "tailTube" });

  // ridges across the body and tail
  const ridge = (chain: typeof spine, rf: (t: number) => number, t: number) => {
    const p = chain.at(t);
    b.part(new THREE.TorusGeometry(rf(t) * 1.03, 0.0022, 4, 10), RIDGE, {
      at: p.at,
      dir: p.tangent,
      axis: "z",
      bone: chain.jointAt(t),
    });
  };
  [0.1, 0.22, 0.34, 0.46, 0.58, 0.7, 0.82].forEach((t) => ridge(spine, bodyR, t));
  [0.14, 0.24, 0.34, 0.44, 0.54, 0.64, 0.74, 0.84].forEach((t) => ridge(tail, tailR, t));

  // dorsal spikes along the back
  [0.2, 0.34, 0.48, 0.62, 0.76, 0.9].forEach((t, i) => {
    const p = spine.at(t).at;
    const r = bodyR(t);
    b.spike([p.x, p.y, p.z - r * 0.9], [0, 0.35, -1], 0.01 - i * 0.0003, 0.0035, {
      color: ORANGE,
      bone: spine.jointAt(t),
      sides: 5,
    });
  });

  // ---------- head ----------
  const hc: [number, number, number] = [0, 0.296, 0.016];
  b.part(new THREE.SphereGeometry(0.018, 10, 8), freckled, { at: hc, scale: [0.9, 1, 1.1], bone: "head", name: "skull" });

  // snout
  b.capsule([0, 0.293, 0.026], [0, 0.281, 0.078], [0.0085, 0.0045], {
    color: "#f7b92a",
    bone: "head",
    sides: 8,
    name: "snout",
  });
  b.capsule([0, 0.2835, 0.036], [0, 0.2745, 0.0765], [0.0045, 0.0028], {
    color: "#e8a21c",
    bone: jaw,
    sides: 6,
    name: "lowerJaw",
  });
  b.part(new THREE.TorusGeometry(0.0065, 0.0012, 4, 8), DARK, {
    at: [0, 0.2845, 0.058],
    dir: [0, -0.2, 1],
    axis: "z",
    bone: "head",
  });

  // crown
  for (let i = 0; i < 7; i++) {
    const a = ((-60 + 20 * i) * Math.PI) / 180;
    const d = new THREE.Vector3(Math.sin(a), Math.cos(a), -0.25).normalize();
    const base = new THREE.Vector3(...hc).addScaledVector(d, 0.015);
    const len = 0.02 - Math.abs(i - 3) * 0.0035;
    b.spike(base, d, len, 0.0035, { color: i % 2 ? ORANGE : "#ff9d1f", bone: "head", sides: 5 });
  }

  // eyes
  for (const s of [1, -1]) {
    const c = new THREE.Vector3(s * 0.0125, 0.3, 0.021);
    const d = new THREE.Vector3(s * 0.75, 0.1, 0.65).normalize();
    const place = (r: number, off: number, color: string, extra?: THREE.Vector3) => {
      const pos = c.clone().addScaledVector(d, off);
      if (extra) pos.add(extra);
      b.part(new THREE.SphereGeometry(r, 10, 8), color, { at: pos, bone: "head" });
    };
    place(0.01, 0, DARK);
    place(0.0085, 0.0022, "#f6a722");
    place(0.005, 0.0065, "#120a05");
    place(0.0016, 0.0105, "#ffffff", new THREE.Vector3(-s * 0.0008, 0.003, 0.0008));
    // brow ridge
    b.part(new THREE.SphereGeometry(0.004, 6, 5), ORANGE, {
      at: [s * 0.011, 0.31, 0.022],
      bone: "head",
      scale: [1.2, 0.6, 1.4],
    });
  }

  // ---------- fins ----------
  const finColor = "#ffe9a0";
  const finLine = "#e9962a";
  const dorsal: Array<[number, number]> = [
    [-0.026, 0.232],
    [-0.05, 0.234],
    [-0.046, 0.226],
    [-0.062, 0.222],
    [-0.056, 0.212],
    [-0.07, 0.205],
    [-0.06, 0.195],
    [-0.068, 0.186],
    [-0.055, 0.18],
    [-0.04, 0.172],
    [-0.026, 0.172],
  ];
  b.slab(dorsal.map(([z, y]) => [0, y, z]), { color: finColor, thickness: 0.0015, bone: "dorsalFin", name: "dorsalFin" });
  const tips: Array<[number, number]> = [
    [-0.05, 0.234],
    [-0.062, 0.222],
    [-0.07, 0.205],
    [-0.068, 0.186],
    [-0.055, 0.18],
  ];
  tips.forEach(([z, y], i) => {
    const y0 = 0.23 - i * 0.012;
    b.rod([0, y0, -0.028], [0, y, z], 0.0007, { color: finLine, bone: "dorsalFin", sides: 4 });
  });

  for (const s of [1, -1]) {
    const pts = [
      [s * 0.02, 0.262],
      [s * 0.045, 0.268],
      [s * 0.052, 0.255],
      [s * 0.046, 0.243],
      [s * 0.02, 0.248],
    ];
    b.slab(pts.map(([x, y]) => [x, y, -0.005]), {
      color: finColor,
      thickness: 0.0013,
      bone: s > 0 ? "pectoralL" : "pectoralR",
    });
    b.rod([s * 0.022, 0.255, -0.005], [s * 0.05, 0.255, -0.005], 0.0006, {
      color: finLine,
      bone: s > 0 ? "pectoralL" : "pectoralR",
      sides: 4,
    });
  }

  // ---------- seagrass and ground ----------
  const grass = (pts: number[][], r: number[], color: string, sides = 5) =>
    b.sweep(catmull(pts), r, { color, bone: "root", sides });
  grass(
    [
      [0, 0, -0.045],
      [0, 0.1, -0.045],
      [0, 0.2, -0.045],
      [0, 0.3, -0.045],
      [0.015, 0.42, -0.05],
      [0.04, 0.52, -0.06],
    ],
    [0.0055, 0.0055, 0.0045, 0.0015],
    "#3f9b4a",
    6,
  );
  grass(
    [
      [0.012, 0, -0.05],
      [0.035, 0.12, -0.065],
      [0.06, 0.25, -0.075],
      [0.07, 0.36, -0.065],
    ],
    [0.0045, 0.004, 0.0015],
    "#2f8040",
  );
  grass(
    [
      [-0.012, 0, -0.04],
      [-0.04, 0.1, -0.03],
      [-0.06, 0.22, -0.045],
      [-0.065, 0.32, -0.06],
    ],
    [0.0045, 0.004, 0.0015],
    "#56b35a",
  );
  grass(
    [
      [0.005, 0, -0.06],
      [0.0, 0.1, -0.09],
      [-0.015, 0.2, -0.105],
    ],
    [0.004, 0.0035, 0.0012],
    "#3a8f4d",
  );

  b.part(new THREE.CylinderGeometry(0.09, 0.11, 0.02, 10), "#e6cf94", { at: [0, 0.009, -0.045], bone: "root", name: "sand" });
  const pebbles: Array<[number, number, number, number, string]> = [
    [0.06, 0.02, 0.0, 0.015, "#9aa0a6"],
    [-0.055, 0.02, 0.01, 0.012, "#b7a58a"],
    [0.03, 0.02, 0.04, 0.009, "#c9c0b0"],
    [-0.02, 0.019, -0.095, 0.011, "#8d949a"],
  ];
  pebbles.forEach(([x, y, z, r, c]) =>
    b.part(new THREE.SphereGeometry(r, 6, 5), c, { at: [x, y, z - 0.03], bone: "root", scale: [1, 0.6, 1] }),
  );

  return b.root;
}
```