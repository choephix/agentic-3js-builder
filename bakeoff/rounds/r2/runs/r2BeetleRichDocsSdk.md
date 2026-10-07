```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, limb, paint, grain, countershade, svg } from "agentic-3js-builder";

export const meta = {
  name: "Stag beetle on a mossy log",
  description:
    "A proud stag beetle with a mirror-glossy chestnut wing case, black head and thorax, branched antler jaws, elbowed fan antennae and six spiny legs gripping a mossy log, with a dewdrop on one antler.",
};

const CHEST = "#7a2a10";
const CHEST_HI = "#a8431b";
const BLACK = "#15110e";
const JAW = "#8a3a1a";
const MOSS = "#4f7d2b";
const MOSS2 = "#6d9a3a";
const BARK = "#4b3525";
const BARK2 = "#2f2118";

export default function build() {
  const b = createBuilder({ name: "stagBeetle" });
  const R = 0.09;

  // skeleton
  const root = b.joint("root", { at: [0, 0, 0] });
  const thorax = b.joint("thorax", { parent: root, at: [0, 0.205, 0.01], dir: [0, 0, 1], role: "spine" });
  const abdomen = b.joint("abdomen", { parent: thorax, at: [0, 0.205, -0.01], aim: [0, 0.205, -0.07], role: "spine" });
  const head = b.joint("head", { parent: thorax, at: [0, 0.205, 0.04], dir: [0, 0, 1], role: "head" });

  // log
  const log = b.sweep(
    [
      [0, R, -0.22],
      [0, R, 0.22],
    ],
    R,
    { bone: root, sides: 10, caps: "flat", color: grain(BARK, BARK2, { size: 0.012, axis: "z", seed: 3 }) },
  );
  for (const z of [-1, 1])
    b.part(new THREE.CylinderGeometry(0.082, 0.082, 0.006, 10), "#c8a273", {
      bone: root,
      at: [0, R, z * 0.22],
      dir: [0, 0, 1],
    });
  const logSurf = b.surface(log);
  const r1 = rng(5);
  const moss = logSurf.scatter(70, { rng: r1, minDist: 0.016, filter: (h) => Math.abs(h.at.z) > 0.085 && h.n.y > -0.2 });
  moss.forEach((h, i) => {
    const k = 0.7 + r1() * 0.9;
    b.stick(new THREE.SphereGeometry(0.012 * k, 6, 4), i % 2 ? MOSS : MOSS2, h, { embed: 0.3, scale: [1, 0.55, 1], bone: root });
  });
  const plates = logSurf.scatter(30, { rng: rng(9), minDist: 0.03, filter: (h) => Math.abs(h.at.z) > 0.07 && h.n.y > -0.3 });
  for (const h of plates)
    b.stick(new THREE.BoxGeometry(0.022, 0.006, 0.03), BARK2, h, { embed: 0.5, bone: root, spin: r1() * 180 });

  // body
  const ell = (pos: number[], sc: number[], color: any, bone: any, seg: [number, number] = [10, 7]) =>
    b.part(new THREE.SphereGeometry(1, seg[0], seg[1]), color, { bone, at: pos, scale: sc, flat: true });

  ell([0, 0.197, -0.03], [0.017, 0.009, 0.042], BLACK, abdomen);
  ell([0, 0.206, 0.026], [0.027, 0.013, 0.016], BLACK, thorax);
  ell([0, 0.205, 0.05], [0.02, 0.011, 0.012], BLACK, head);
  // pronotum ridge
  ell([0, 0.216, 0.026], [0.02, 0.004, 0.011], "#2a211b", thorax, [8, 5]);

  const elyColor = countershade(CHEST_HI, CHEST, { level: 0.2, soft: 0.5 });
  const streak = svg(
    `<svg viewBox="0 0 16 64"><ellipse cx="8" cy="32" rx="6" ry="28" fill="#ffb98a"/><ellipse cx="8" cy="28" rx="3" ry="20" fill="#fff5ea"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const ely = b.joint(`elytron${S}`, {
      parent: thorax,
      at: [s * 0.01, 0.216, 0.012],
      aim: [s * 0.01, 0.214, -0.06],
      role: "hinge",
    });
    const p = ell([s * 0.0098, 0.208, -0.029], [0.0105, 0.016, 0.044], elyColor, ely, [12, 8]);
    b.decal(p, streak, { at: [s * 0.0125, 0.222, -0.028], dir: [0, 1, 0], up: [0, 0, 1], size: [0.007, 0.038], lift: 0.001 });
    // eyes
    b.part(new THREE.SphereGeometry(0.0045, 6, 4), "#3a1a08", { bone: head, at: [s * 0.019, 0.208, 0.052] });
  }

  // jaws
  let dew: number[] = [0, 0, 0];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const jaw = b.joint(`jaw${S}`, { parent: head, at: [s * 0.011, 0.205, 0.058], dir: [0, 0, 1], role: "jaw" });
    const path = catmull([
      [s * 0.011, 0.205, 0.056],
      [s * 0.019, 0.207, 0.072],
      [s * 0.022, 0.208, 0.088],
      [s * 0.014, 0.209, 0.108],
    ]);
    b.sweep(path, [0.0075, 0.0015], { bone: jaw, color: JAW, sides: 6, caps: { start: "round", end: "point" } });
    const tines: [number, number, number, number, number][] = [
      [0.2, -0.007, 0.002, 0.005, 0.0035],
      [0.38, -0.01, 0.004, 0.006, 0.0032],
      [0.55, -0.004, 0.015, 0.006, 0.0034],
      [0.75, -0.011, 0.003, 0.007, 0.003],
      [0.88, -0.002, 0.011, 0.004, 0.0025],
    ];
    for (const [t, dx, dy, dz, r] of tines) {
      const p = path.at(t);
      const tip = [p.x + dx * s, p.y + dy, p.z + dz];
      b.spike([p.x, p.y, p.z], tip, null, r, { bone: jaw, color: JAW, sides: 6 });
      if (s > 0 && t === 0.55) dew = [tip[0], tip[1] - 0.001, tip[2]];
    }
  }
  b.part(new THREE.SphereGeometry(0.0042, 8, 6), "#b4e4ff", { bone: "jawL", at: dew });
  b.part(new THREE.SphereGeometry(0.0013, 5, 4), "#ffffff", { bone: "jawL", at: [dew[0] + 0.0012, dew[1] + 0.002, dew[2] + 0.0018] });

  // antennae
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const path = catmull([
      [s * 0.016, 0.21, 0.056],
      [s * 0.03, 0.222, 0.066],
      [s * 0.034, 0.222, 0.086],
    ]);
    const ant = b.chain(`antenna${S}`, path, {
      parent: head,
      role: "tentacle",
      names: [`antenna${S}1`, `antenna${S}2`, `antenna${S}Tip`],
    });
    b.sweep(ant, 0.0017, { color: BLACK, sides: 5 });
    b.ring(ant.at(1), { count: 5, radius: 0.001, tilt: 50 }, (it) =>
      b.spike(it, it, 0.013, 0.0025, { color: "#3a2416", sides: 4 }),
    );
  }

  // legs
  const hipZ = [0.032, 0.008, -0.018];
  const footZ = [0.062, 0.016, -0.05];
  const footX = [0.07, 0.08, 0.075];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (let i = 0; i < 3; i++) {
      const fx = s * footX[i];
      const fy = R + Math.sqrt(R * R - fx * fx) + 0.001;
      const pts = limb(
        [s * 0.02, 0.2, hipZ[i]],
        [fx, fy, footZ[i]],
        [0.04, 0.045, 0.025],
        [s * 0.3, 1, 0.2],
      );
      const leg = b.chain(`leg${S}${i + 1}`, pts, {
        parent: thorax,
        role: "leg",
        names: [`hip${S}${i + 1}`, `knee${S}${i + 1}`, `ankle${S}${i + 1}`, `foot${S}${i + 1}`],
      });
      const tube = b.sweep(leg, (t: number) => 0.005 - 0.0028 * t, { color: BLACK, sides: 6 });
      b.along(tube, 5, (at) => b.spike(at, at, 0.007, 0.0013, { color: BLACK, sides: 4 }), { from: 0.3, to: 0.95 });
      b.spike(leg.at(1), [0, -1, 0], 0.01, 0.002, { color: "#2a211b", sides: 4 });
    }
  }

  return b.root;
}
```