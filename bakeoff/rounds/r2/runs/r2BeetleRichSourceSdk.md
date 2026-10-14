```ts
import * as THREE from "three";
import { createBuilder, rng, paint, grain, mottle } from "agentic-3js-builder";

export const meta = {
  name: "Stag Beetle on Mossy Log",
  description:
    "A proud stag beetle with a mirror-glossy chestnut wing case, branched antler jaws, elbowed feathery antennae and six spiny legs gripping a mossy log. A dewdrop hangs from one antler.",
};

export default function build() {
  const b = createBuilder({ name: "stagBeetle" });
  const R = 0.09;
  const random = rng(11);

  // ---------- joints ----------
  const root = b.joint("root", { at: [0, 0.19, 0], role: "spine" });
  const thorax = b.joint("thorax", { parent: root, at: [0, 0.2, 0.015], dir: [0, 0, 1], role: "spine" });
  const head = b.joint("head", { parent: thorax, at: [0, 0.2, 0.043], dir: [0, 0, 1], role: "head" });
  const elytraL = b.joint("elytraL", { parent: root, at: [0.003, 0.215, 0.0], dir: [0, 0, -1], role: "hinge" });
  const elytraR = b.joint("elytraR", { parent: root, at: [-0.003, 0.215, 0.0], dir: [0, 0, -1], role: "hinge" });

  const sphere = (seg = 10, h = 7) => new THREE.SphereGeometry(1, seg, h);
  const ell = (
    r: [number, number, number],
    color: string,
    at: [number, number, number],
    bone: any,
    opts: any = {},
  ) => b.part(sphere(), color, { at, scale: r, bone, ...opts });

  // ---------- log ----------
  const bark = paint((p, n) => {
    const g = grain("#5a4030", "#2e2018", { size: 0.008, axis: "z", seed: 3 });
    const m = mottle(g, "#3b2a1d", { size: 0.03, seed: 5 });
    return m.at(p, n);
  });
  b.part(new THREE.CylinderGeometry(R, R, 0.36, 12), bark, { at: [0, R, 0], rotation: [90, 0, 0], bone: root, name: "log" });
  const rings = paint((p) => {
    const d = Math.hypot(p.x, p.y - R);
    return Math.sin(d * 420) > 0.2 ? "#c9a06a" : "#a8794a";
  });
  for (const z of [0.1815, -0.1815])
    b.part(new THREE.CylinderGeometry(R * 0.96, R * 0.96, 0.004, 12), rings, {
      at: [0, R, z],
      rotation: [90, 0, 0],
      bone: root,
    });

  // moss
  const greens = ["#4f7a2a", "#3d6422", "#6a9333", "#2f5220"];
  for (let i = 0; i < 46; i++) {
    const th = (random() * 2 - 1) * 105 * (Math.PI / 180);
    const z = (random() * 2 - 1) * 0.17;
    if (Math.abs(z) < 0.09 && Math.abs(th) < 0.95) continue;
    const s = 0.007 + random() * 0.012;
    const rr = R * 0.97;
    ell(
      [s, s * 0.55, s * 1.2],
      greens[Math.floor(random() * greens.length)],
      [rr * Math.sin(th), R + rr * Math.cos(th), z],
      root,
      { flat: true, rotation: [0, 0, -th * 57.3] },
    );
  }
  // little toadstool
  b.part(new THREE.CylinderGeometry(0.003, 0.004, 0.02, 6), "#e8dcc0", { at: [0.088, 0.1, -0.12], rotation: [0, 0, -80], bone: root });
  ell([0.011, 0.007, 0.011], "#c0392b", [0.1, 0.1, -0.12], root, { flat: true });

  // ---------- body ----------
  const shine = b.material("#7a2a12");
  shine.roughness = 0.1;
  shine.metalness = 0.3;
  ell([0.021, 0.011, 0.04], "#2a1a12", [0, 0.196, -0.025], root);
  for (const [s, j] of [[1, elytraL], [-1, elytraR]] as const) {
    ell([0.0135, 0.018, 0.052], "#7a2a12", [s * 0.0118, 0.206, -0.024], j);
    ell([0.0032, 0.0014, 0.028], "#f0b088", [s * 0.0175, 0.2235, -0.014], j);
    ell([0.0018, 0.001, 0.008], "#fff2e0", [s * 0.0185, 0.2225, 0.004], j);
  }
  ell([0.0008, 0.0012, 0.05], "#1a0e08", [0, 0.2235, -0.024], root);

  // thorax & head
  ell([0.027, 0.0145, 0.017], "#14100e", [0, 0.2, 0.027], thorax, { flat: true });
  ell([0.02, 0.008, 0.01], "#241a16", [0, 0.209, 0.027], thorax, { flat: true });
  ell([0.02, 0.011, 0.013], "#0e0b0a", [0, 0.198, 0.05], head, { flat: true });
  for (const s of [1, -1]) {
    ell([0.0045, 0.0045, 0.006], "#2a1810", [s * 0.0185, 0.203, 0.05], head);
    ell([0.0012, 0.0012, 0.0012], "#ffffff", [s * 0.021, 0.2055, 0.052], head);
  }

  // ---------- jaws ----------
  const jawColor = "#7a2e16";
  let dew: any = null;
  const jaw = (s: number) => {
    const S = s > 0 ? "L" : "R";
    const pts = [
      [0.011, 0.198, 0.054],
      [0.017, 0.199, 0.07],
      [0.024, 0.202, 0.085],
      [0.02, 0.206, 0.101],
      [0.01, 0.207, 0.112],
    ].map(([x, y, z]) => [s * x, y, z]);
    const chain = b.chain(`jaw${S}`, b.sweep ? (pts as any) : pts, {
      parent: head,
      role: "jaw",
      names: [`jaw${S}`, `jaw${S}2`, `jaw${S}3`, `jaw${S}4`],
      up: [0, 1, 0],
    });
    // catmull path through points
    const sw = b.sweep(chain, (t) => 0.0075 * (1 - t) + 0.0018 * t, { color: jawColor, sides: 6 });
    const dir = (x: number, y: number, z: number) => [s * x, y, z];
    b.spike(sw.at(0.3, 0), dir(-0.6, 0.15, 0.8) as any, 0.012, 0.0032, { color: jawColor, sides: 5 });
    b.spike(sw.at(0.52, 0), dir(0.1, 1, 0.5) as any, 0.013, 0.0028, { color: jawColor, sides: 5 });
    b.spike(sw.at(0.66, 0), dir(-0.7, 0.2, 0.7) as any, 0.012, 0.0026, { color: jawColor, sides: 5 });
    b.spike(sw.at(0.82, 0), dir(-0.2, 0.9, 0.5) as any, 0.009, 0.002, { color: "#5a1e0e", sides: 5 });
    if (s > 0) {
      const p = sw.at(0.52, 180, 0);
      dew = p;
    }
  };
  jaw(1);
  jaw(-1);

  // dewdrop
  const dewMat = b.material("#bfe8ff");
  dewMat.transparent = true;
  dewMat.opacity = 0.65;
  dewMat.roughness = 0.02;
  dewMat.metalness = 0.1;
  const dp = dew.at.clone();
  b.part(new THREE.SphereGeometry(0.0052, 10, 8), "#bfe8ff", {
    at: [dp.x, dp.y - 0.0075, dp.z],
    scale: [1, 1.25, 1],
    bone: "jawL2",
    name: "dewdrop",
  });
  b.part(new THREE.SphereGeometry(0.0013, 6, 5), "#ffffff", {
    at: [dp.x + 0.0015, dp.y - 0.0055, dp.z + 0.003],
    bone: "jawL2",
  });

  // ---------- antennae ----------
  const slat = new THREE.SphereGeometry(1, 6, 4);
  slat.translate(0, 1, 0);
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = [
      [0.012, 0.205, 0.056],
      [0.02, 0.212, 0.064],
      [0.031, 0.215, 0.078],
      [0.036, 0.214, 0.092],
    ].map(([x, y, z]) => [s * x, y, z]);
    const chain = b.chain(`antenna${S}`, pts as any, { parent: head, role: "digit", names: [`antenna${S}1`, `antenna${S}2`, `antenna${S}3`] });
    b.sweep(chain, 0.0013, { color: "#1a1210", sides: 5 });
    b.ring(chain.at(1), { count: 5, radius: 0.0005, tilt: 28 }, (item) => {
      b.part(slat, "#3a2418", { frame: item, scale: [0.0009, 0.0055, 0.0022], flat: true });
    });
    ell([0.0018, 0.0018, 0.0018], "#2a1a12", pts[1] as any, chain.joints[1]);
  }

  // ---------- legs ----------
  const surfY = (x: number) => R + Math.sqrt(Math.max(R * R - x * x, 0)) - 0.002;
  const legs = [
    { n: "F", hz: 0.034, kz: 0.056, fz: 0.082, fx: 0.056 },
    { n: "M", hz: 0.006, kz: 0.016, fz: 0.02, fx: 0.066 },
    { n: "H", hz: -0.026, kz: -0.042, fz: -0.068, fx: 0.06 },
  ];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (const l of legs) {
      const pts = [
        [s * 0.014, 0.194, l.hz],
        [s * 0.042, 0.208, l.kz],
        [s * l.fx, surfY(l.fx), l.fz],
      ];
      const ch = b.chain(`leg${l.n}${S}`, pts as any, {
        parent: root,
        role: "leg",
        names: [`hip${l.n}${S}`, `knee${l.n}${S}`, `foot${l.n}${S}`],
      });
      const sw = b.sweep(ch, (t) => 0.0048 - 0.0022 * t, { color: "#14100e", sides: 6 });
      for (const t of [0.62, 0.74, 0.86]) {
        b.spike(sw.at(t, 90), sw.at(t, 90), 0.008, 0.0013, { color: "#0a0807", sides: 4 });
        b.spike(sw.at(t, -90), sw.at(t, -90), 0.008, 0.0013, { color: "#0a0807", sides: 4 });
      }
      b.spike(sw.at(0.2, 0), sw.at(0.2, 0), 0.006, 0.0014, { color: "#0a0807", sides: 4 });
      const f = ch.at(1);
      for (const a of [-1, 1])
        b.spike(f.at, [a * 0.6 + s * 0.2, -0.6, 0.5], 0.008, 0.0012, { color: "#050403", sides: 4, bone: ch.joints[2] });
    }
  }

  return b.root;
}
```