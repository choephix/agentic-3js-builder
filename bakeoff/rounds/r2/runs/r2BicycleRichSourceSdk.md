```ts
import * as THREE from "three";
import { createBuilder, catmull, spiral, paint, noise } from "agentic-3js-builder";

export const meta = {
  name: "Dutch City Bicycle",
  description:
    "Vintage mint-green Dutch city bike with upright bars, cream grips, silver bell, sprung leather saddle, chrome mudguards, chain guard, whitewall tyres and a wicker front basket of sunflowers and a baguette.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "dutch_bike" });

  const MINT = "#86d0b0";
  const CREAM = "#f3e9cf";
  const CHROME = "#d9dee2";
  const SILVER = "#b9c0c6";
  const LEATHER = "#7a4a26";
  const BLACK = "#202124";
  const TIRE = "#26262a";
  const WHITE = "#f4efe2";
  const BRASS = "#d9b24c";
  const GREEN = "#4c8a3a";

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0.3, -0.1] });
  b.joint("steer", { parent: "root", at: [0, 0.9, 0.35], dir: [0, 1, -0.364] });
  b.joint("wheelF", { parent: "steer", at: [0, 0.36, 0.55] });
  b.joint("wheelR", { parent: "root", at: [0, 0.36, -0.55] });
  b.joint("crank", { parent: "root", at: [0, 0.3, -0.1] });
  b.joint("pedalR", { parent: "crank", at: [-0.17, 0.14, -0.04] });
  b.joint("pedalL", { parent: "crank", at: [0.125, 0.46, -0.16] });

  const cap = (a: V, c: V, r: number, color: string, bone: string, sides = 8) =>
    b.capsule(a, c, r, { color, bone, sides });
  const rodc = (a: V, c: V, r: number, color: string, bone: string, sides = 6) =>
    b.rod(a, c, r, { color, bone, sides });

  // ---------- wheels ----------
  function wheel(zc: number, bone: string) {
    const ctr: V = [0, 0.36, zc];
    const tirePaint = paint((p, n) => {
      const d = Math.hypot(p.y - 0.36, p.z - zc);
      return Math.abs(n.x) > 0.5 && d > 0.32 && d < 0.352 ? WHITE : TIRE;
    });
    b.part(new THREE.TorusGeometry(0.335, 0.028, 10, 48).rotateY(Math.PI / 2), tirePaint, { at: ctr, bone });
    b.part(new THREE.TorusGeometry(0.3, 0.012, 6, 40).rotateY(Math.PI / 2), CHROME, { at: ctr, bone });
    b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.11, 10).rotateZ(Math.PI / 2), CHROME, { at: ctr, bone });
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.19, 6).rotateZ(Math.PI / 2), SILVER, { at: ctr, bone });
    for (const s of [-1, 1])
      b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.006, 12).rotateZ(Math.PI / 2), SILVER, {
        at: [s * 0.042, 0.36, zc],
        bone,
      });
    const n = 12;
    for (const s of [-1, 1])
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const a2 = a + s * 0.5;
        rodc(
          [s * 0.04, 0.36 + 0.045 * Math.cos(a), zc + 0.045 * Math.sin(a)],
          [0, 0.36 + 0.292 * Math.cos(a2), zc + 0.292 * Math.sin(a2)],
          0.0025,
          SILVER,
          bone,
          3,
        );
      }
  }
  wheel(0.55, "wheelF");
  wheel(-0.55, "wheelR");

  // ---------- mudguards ----------
  const fender = (zc: number, startDeg: number, bone: string) => {
    const g = new THREE.TorusGeometry(0.39, 0.014, 6, 28, (140 * Math.PI) / 180);
    g.rotateZ((startDeg * Math.PI) / 180);
    g.rotateY(Math.PI / 2);
    g.scale(2.3, 1, 1);
    b.part(g, CHROME, { at: [0, 0.36, zc], bone });
  };
  fender(0.55, 60, "steer");
  fender(-0.55, -20, "root");
  for (const s of [-1, 1]) {
    rodc([s * 0.055, 0.36, 0.55], [s * 0.04, 0.555, 0.888], 0.004, CHROME, "steer", 5);
    rodc([s * 0.055, 0.36, -0.55], [s * 0.04, 0.493, -0.916], 0.004, CHROME, "root", 5);
  }
  // rear light
  b.part(new THREE.BoxGeometry(0.04, 0.05, 0.025), "#c0392b", { at: [0, 0.44, -0.955], bone: "root" });

  // ---------- frame ----------
  const BB: V = [0, 0.3, -0.1];
  // head tube
  cap([0, 0.8, 0.385], [0, 1.0, 0.32], 0.027, MINT, "root");
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.014, 10), CHROME, { at: [0, 1.005, 0.318], bone: "root" });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.014, 10), CHROME, { at: [0, 0.795, 0.386], bone: "root" });
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.006, 12), BRASS, {
    at: [0, 0.9, 0.378],
    dir: [0, 0.33, 0.94],
    bone: "root",
  });
  // swept down tube
  b.sweep(
    catmull([
      [0, 0.9, 0.35],
      [0, 0.62, 0.22],
      [0, 0.4, 0.08],
      BB,
    ]),
    0.026,
    { color: MINT, bone: "root", sides: 8 },
  );
  // seat tube + bottom bracket shell
  cap(BB, [0, 0.92, -0.3], 0.023, MINT, "root");
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.09, 10).rotateZ(Math.PI / 2), MINT, { at: BB, bone: "root" });
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.22, 6).rotateZ(Math.PI / 2), CHROME, { at: [-0.02, 0.3, -0.1], bone: "crank" });
  // rear triangle
  for (const s of [-1, 1]) {
    cap([s * 0.03, 0.3, -0.1], [s * 0.065, 0.36, -0.55], 0.012, MINT, "root");
    cap([s * 0.025, 0.72, -0.265], [s * 0.065, 0.36, -0.55], 0.01, MINT, "root");
  }
  cap([-0.025, 0.72, -0.265], [0.025, 0.72, -0.265], 0.011, MINT, "root");
  // fork
  for (const s of [-1, 1]) cap([s * 0.065, 0.82, 0.38], [s * 0.065, 0.36, 0.55], 0.012, MINT, "steer");
  cap([-0.065, 0.82, 0.38], [0.065, 0.82, 0.38], 0.014, MINT, "steer");
  cap([0, 0.82, 0.38], [0, 0.88, 0.365], 0.02, MINT, "steer");

  // chain guard
  const guard: Array<[number, number]> = [
    [0.005, 0.3], [-0.02, 0.23], [-0.1, 0.195], [-0.3, 0.25], [-0.5, 0.3], [-0.585, 0.33],
    [-0.585, 0.385], [-0.5, 0.41], [-0.3, 0.395], [-0.1, 0.405], [-0.02, 0.37],
  ];
  b.extrude(guard, { color: MINT, at: [-0.09, 0, 0], thickness: 0.022, bevel: 0.006, smoothing: 1, bone: "root" });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.01, 8).rotateZ(Math.PI / 2), CHROME, { at: [-0.102, 0.3, -0.1], bone: "root" });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 8).rotateZ(Math.PI / 2), CHROME, { at: [-0.1, 0.36, -0.55], bone: "root" });

  // cranks + pedals
  rodc([-0.115, 0.3, -0.1], [-0.115, 0.14, -0.04], 0.011, CHROME, "crank");
  rodc([0.07, 0.3, -0.1], [0.07, 0.46, -0.16], 0.011, CHROME, "crank");
  rodc([-0.115, 0.14, -0.04], [-0.2, 0.14, -0.04], 0.007, SILVER, "pedalR");
  rodc([0.07, 0.46, -0.16], [0.155, 0.46, -0.16], 0.007, SILVER, "pedalL");
  b.part(new THREE.BoxGeometry(0.1, 0.022, 0.075), BLACK, { at: [-0.17, 0.14, -0.04], bone: "pedalR" });
  b.part(new THREE.BoxGeometry(0.1, 0.022, 0.075), BLACK, { at: [0.125, 0.46, -0.16], bone: "pedalL" });

  // centre stand (folded up)
  for (const s of [-1, 1]) rodc([s * 0.06, 0.24, -0.28], [s * 0.06, 0.06, -0.4], 0.006, SILVER, "root", 5);
  rodc([-0.06, 0.06, -0.4], [0.06, 0.06, -0.4], 0.006, SILVER, "root", 5);

  // rear rack
  b.part(new THREE.BoxGeometry(0.15, 0.012, 0.26), CHROME, { at: [0, 0.8, -0.62], bone: "root" });
  for (const s of [-1, 1]) {
    rodc([s * 0.06, 0.8, -0.74], [s * 0.065, 0.37, -0.55], 0.004, CHROME, "root", 5);
    rodc([s * 0.055, 0.8, -0.5], [0, 0.8, -0.275], 0.004, CHROME, "root", 5);
  }

  // ---------- saddle ----------
  cap([0, 0.88, -0.29], [0, 1.01, -0.327], 0.013, CHROME, "root");
  b.part(new THREE.BoxGeometry(0.09, 0.02, 0.06), CHROME, { at: [0, 1.015, -0.33], bone: "root" });
  const saddle = b.loft(
    [
      { at: [0, 1.06, -0.53], w: 0.19, h: 0.055 },
      { at: [0, 1.068, -0.44], w: 0.22, h: 0.06 },
      { at: [0, 1.07, -0.32], w: 0.15, h: 0.052 },
      { at: [0, 1.075, -0.22], w: 0.075, h: 0.045 },
      { at: [0, 1.078, -0.16], w: 0.035, h: 0.04 },
    ],
    { color: LEATHER, bone: "root", sides: 10 },
  );
  for (const s of [-1, 1]) {
    b.sweep(spiral([s * 0.06, 0.993, -0.46], [s * 0.06 + 0.022, 0.993, -0.46], [0, 1, 0], { turns: 5, pitch: 0.0085 }), 0.0038, {
      color: CHROME,
      bone: "root",
      sides: 4,
    });
    b.sweep(
      catmull([
        [s * 0.06, 1.032, -0.47],
        [s * 0.06, 1.03, -0.4],
        [s * 0.025, 1.03, -0.28],
        [0, 1.032, -0.2],
      ]),
      0.004,
      { color: CHROME, bone: "root", sides: 4 },
    );
    rodc([s * 0.06, 0.96, -0.46], [s * 0.06, 0.995, -0.46], 0.006, CHROME, "root", 5);
  }
  rodc([-0.06, 0.96, -0.46], [0.06, 0.96, -0.46], 0.006, CHROME, "root", 5);
  rodc([0, 0.96, -0.46], [0, 0.9, -0.31], 0.006, CHROME, "root", 5);
  for (const s of [-1, 1])
    b.part(new THREE.SphereGeometry(0.006, 6, 4), BRASS, { at: [s * 0.022, 1.093, -0.19], bone: "root" });
  void saddle;

  // ---------- handlebars ----------
  rodc([0, 0.98, 0.325], [0, 1.16, 0.27], 0.014, CHROME, "steer");
  b.part(new THREE.SphereGeometry(0.02, 8, 6), CHROME, { at: [0, 1.165, 0.268], bone: "steer" });
  const barPts: V[] = [
    [0.36, 1.11, -0.03], [0.33, 1.13, 0.05], [0.25, 1.15, 0.17], [0.12, 1.165, 0.25], [0, 1.17, 0.27],
    [-0.12, 1.165, 0.25], [-0.25, 1.15, 0.17], [-0.33, 1.13, 0.05], [-0.36, 1.11, -0.03],
  ];
  b.sweep(catmull(barPts), (t: number) => (t < 0.15 || t > 0.85 ? 0.0175 : 0.0115), {
    color: CHROME,
    bands: [
      [0.15, CREAM],
      [0.85, CHROME],
      [1, CREAM],
    ],
    bone: "steer",
    sides: 8,
  });
  for (const s of [-1, 1]) {
    rodc([s * 0.3, 1.125, 0.04], [s * 0.27, 1.112, 0.17], 0.005, BLACK, "steer", 5);
    b.part(new THREE.SphereGeometry(0.01, 6, 4), CREAM, { at: [s * 0.36, 1.11, -0.045], bone: "steer" });
  }
  // bell
  b.part(new THREE.CylinderGeometry(0.014, 0.016, 0.02, 8), SILVER, { at: [0.12, 1.185, 0.25], bone: "steer" });
  b.part(new THREE.SphereGeometry(0.036, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), SILVER, { at: [0.12, 1.195, 0.25], bone: "steer" });
  b.part(new THREE.SphereGeometry(0.008, 6, 4), CHROME, { at: [0.12, 1.234, 0.25], bone: "steer" });
  rodc([0.155, 1.2, 0.235], [0.19, 1.2, 0.2], 0.004, CHROME, "steer", 4);

  // ---------- basket ----------
  const wicker = paint((p) => {
    const a = Math.floor(p.y / 0.018);
    const c = Math.floor((p.x + p.z) / 0.018);
    const k = noise(p, 0.05, 3);
    const tones = (a + c) & 1 ? ["#d3a560", "#c99a52"] : ["#a97a3c", "#9c6f33"];
    return k > 0.5 ? tones[0] : tones[1];
  });
  const cz = 0.58;
  const wall = (w: number, h: number, d: number, at: V) =>
    b.part(new THREE.BoxGeometry(w, h, d), wicker, { at, bone: "steer" });
  wall(0.4, 0.2, 0.016, [0, 0.935, cz + 0.13]);
  wall(0.4, 0.2, 0.016, [0, 0.935, cz - 0.13]);
  wall(0.016, 0.2, 0.26, [0.192, 0.935, cz]);
  wall(0.016, 0.2, 0.26, [-0.192, 0.935, cz]);
  wall(0.38, 0.014, 0.26, [0, 0.84, cz]);
  const RIM = "#6e4421";
  const rc: V[] = [[0.2, 1.037, cz + 0.135], [-0.2, 1.037, cz + 0.135], [-0.2, 1.037, cz - 0.135], [0.2, 1.037, cz - 0.135]];
  for (let i = 0; i < 4; i++) cap(rc[i], rc[(i + 1) % 4], 0.011, RIM, "steer", 6);
  // front rack and stays
  b.part(new THREE.BoxGeometry(0.3, 0.012, 0.22), CHROME, { at: [0, 0.826, cz], bone: "steer" });
  for (const s of [-1, 1]) {
    rodc([s * 0.12, 0.826, 0.5], [s * 0.065, 0.82, 0.385], 0.004, CHROME, "steer", 5);
    rodc([s * 0.12, 0.826, 0.68], [s * 0.065, 0.36, 0.55], 0.004, CHROME, "steer", 5);
  }

  // ---------- flowers ----------
  const unitY = new THREE.Vector3(0, 1, 0);
  const star = (n: number, ro: number, ri: number, phase: number) =>
    Array.from({ length: n * 2 }, (_, k) => {
      const r = k % 2 ? ri : ro;
      const a = (k * Math.PI) / n + phase;
      return [r * Math.cos(a), r * Math.sin(a)] as [number, number];
    });
  const frameOf = (dir: V) => {
    const d = new THREE.Vector3(...dir).normalize();
    let x = new THREE.Vector3().crossVectors(unitY, d);
    if (x.lengthSq() < 1e-6) x = new THREE.Vector3(1, 0, 0);
    x.normalize();
    const y = new THREE.Vector3().crossVectors(d, x);
    return { d, x, y };
  };
  function flower(pos: V, dir: V, r: number, base: V) {
    const { d, x, y } = frameOf(dir);
    const P = new THREE.Vector3(...pos);
    const at = (o: number) => P.clone().addScaledVector(d, o);
    b.extrude(star(11, r * 0.62, r * 0.45, 0.2), { color: GREEN, at: at(-0.008), x, y, thickness: 0.006, bone: "steer" });
    b.extrude(star(13, r, r * 0.58, 0), { color: "#f0b400", at: at(0), x, y, thickness: 0.008, bone: "steer" });
    b.extrude(star(13, r * 0.9, r * 0.5, Math.PI / 13), { color: "#ffd53a", at: at(0.006), x, y, thickness: 0.006, bone: "steer" });
    b.part(new THREE.CylinderGeometry(r * 0.52, r * 0.52, 0.02, 10), "#4a2c12", { at: at(0.012), dir: d, bone: "steer" });
    b.part(new THREE.CylinderGeometry(r * 0.3, r * 0.3, 0.024, 8), "#6b3f17", { at: at(0.014), dir: d, bone: "steer" });
    rodc(base, at(-0.01).toArray() as V, 0.006, GREEN, "steer", 5);
  }
  flower([0.1, 1.17, 0.66], [0.2, 0.5, 0.85], 0.085, [0.04, 0.86, 0.6]);
  flower([0.15, 1.1, 0.5], [0.5, 0.6, 0.5], 0.08, [0.07, 0.86, 0.53]);
  flower([-0.02, 1.12, 0.52], [0, 0.75, 0.65], 0.085, [0, 0.86, 0.56]);
  flower([-0.02, 1.1, 0.77], [0, 0.4, 0.9], 0.078, [0, 0.86, 0.62]);

  const leaf = (at: V, dir: V, len: number) => {
    const { y } = frameOf(dir);
    const dd = new THREE.Vector3(...dir).normalize();
    const x = new THREE.Vector3().crossVectors(unitY, dd).normalize();
    void y;
    const k = len / 0.12;
    const o: Array<[number, number]> = [[0, 0], [0.03, 0.025], [0.035, 0.07], [0, 0.12], [-0.035, 0.07], [-0.03, 0.025]];
    b.extrude(o.map(([u, v]) => [u * k, v * k] as [number, number]), {
      color: GREEN,
      at,
      x,
      y: dd,
      thickness: 0.004,
      smoothing: 1,
      bone: "steer",
    });
  };
  leaf([0.17, 1.02, 0.64], [0.7, 0.6, 0.2], 0.14);
  leaf([-0.12, 1.02, 0.72], [-0.5, 0.5, 0.7], 0.13);
  leaf([0.05, 1.02, 0.72], [0.2, 0.5, 0.9], 0.12);
  leaf([-0.17, 1.02, 0.5], [-0.8, 0.5, 0.0], 0.13);

  // ---------- baguette ----------
  const A: V = [-0.11, 0.92, 0.6];
  const B: V = [-0.31, 1.3, 0.74];
  const lp = (t: number): V => [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t];
  const prof: Array<[number, number]> = [[0, 0.016], [0.08, 0.044], [0.3, 0.054], [0.55, 0.054], [0.8, 0.046], [0.95, 0.034], [1, 0.016]];
  const bag = b.loft(
    prof.map(([t, w]) => ({ at: lp(t), w, h: w * 0.9 })),
    { color: "#d49a4a", bone: "steer", sides: 10 },
  );
  for (let i = 0; i < 6; i++) {
    const g = new THREE.SphereGeometry(0.02, 6, 4);
    g.scale(0.7, 0.35, 1.2);
    b.stick(g, "#f0c47c", bag.at(0.42 + i * 0.09, 0, 0), { spin: 55, bone: "steer", embed: 0.3 });
  }

  return b.root;
}
```