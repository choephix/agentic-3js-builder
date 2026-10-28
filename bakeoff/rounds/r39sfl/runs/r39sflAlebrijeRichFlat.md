```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, polyline, limb, stripes, rng } from "agentic-3js-builder";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description: "Oaxacan painted-wood alebrije: a jaguar body with an eagle's head, wings and tail feathers, covered in dots and bright stripes.",
};

const ORANGE = "#f28c1e", MAG = "#d6246e", TURQ = "#17b8b0", YEL = "#ffd23a";
const PURP = "#6a2a9a", GREEN = "#3aa845", BLUE = "#2a5bd7", PINK = "#ff7aa6";
const BLACK = "#1a0d22", WHITE = "#fff6e0";
const CYCLE = [MAG, TURQ, YEL, PURP, GREEN, BLUE, ORANGE];

function leaf(len: number, w: number): [number, number, "sharp"?][] {
  return [[0, 0], [len * 0.3, w], [len * 0.75, w * 0.8], [len, 0, "sharp"], [len * 0.75, -w * 0.8], [len * 0.3, -w]] as any;
}

export default function build() {
  const b = createBuilder({ name: "alebrijeJaguarEagle" });
  const R = rng(11);

  // ---- skeleton
  const hips = b.joint("hips", { at: [0, 0.62, -0.35], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.62, -0.35], [0, 0.68, -0.02], [0, 0.74, 0.3]]), {
    parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 0.74, 0.3], [0, 0.92, 0.45], [0, 1.12, 0.55]]), {
    parent: spine.tip!, names: ["neck1", "neck2", "neck3"], role: "neck",
  });
  const HC = [0, 1.12, 0.55];
  const P = (x: number, y: number, z: number): [number, number, number] => [x, HC[1] + y, HC[2] + z];
  const head = b.joint("head", { parent: neck.tip!, at: HC as any, dir: [0, 0.15, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: P(0, -0.04, 0.03), aim: P(0, -0.05, 0.28), role: "jaw" });

  // ---- body
  const body = b.loft(
    [
      { at: [0, 0.62, -0.5], w: 0.3, h: 0.34 },
      { at: [0, 0.63, -0.3], w: 0.38, h: 0.42 },
      { at: [0, 0.68, 0.0], w: 0.38, h: 0.4 },
      { at: [0, 0.74, 0.22], w: 0.42, h: 0.46 },
      { at: [0, 0.78, 0.34], w: 0.3, h: 0.34 },
    ],
    { bone: [hips, spine], color: stripes(ORANGE, MAG, { size: 0.07, axis: "z", width: 0.35 }) },
  );
  b.sweep(neck, [0.1, 0.075], { color: (t: number) => (t < 0.5 ? ORANGE : YEL) });
  // belly
  b.part(new THREE.SphereGeometry(1, 8, 6), YEL, { bone: spine.joints[1], at: [0, 0.5, -0.05], scale: [0.17, 0.1, 0.4] });

  // rosette dots
  const skin = b.surface(body);
  const hits = skin.scatter(40, { rng: rng(5), minDist: 0.1, filter: (h: any) => h.n.y > -0.2 });
  hits.forEach((h: any, i: number) => {
    b.stick(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 8), CYCLE[i % 7], h, { embed: 0.5 });
    b.stick(new THREE.CylinderGeometry(0.016, 0.016, 0.016, 6), i % 2 ? BLACK : WHITE, h, { embed: 0.4 });
  });

  // ---- legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const defs = [
      { n: "F", root: [s * 0.16, 0.6, 0.26], foot: [s * 0.16, 0.06, 0.32], bend: [0, 0, -1], par: spine.joints[2], names: [`shoulder${S}`, `elbow${S}`, `paw${S}F`] },
      { n: "H", root: [s * 0.17, 0.6, -0.4], foot: [s * 0.17, 0.06, -0.42], bend: [0, 0, 1], par: hips, names: [`hip${S}`, `knee${S}`, `paw${S}H`] },
    ];
    for (const d of defs) {
      const pts = limb(d.root as any, d.foot as any, [0.3, 0.3], [d.bend as any]);
      const leg = b.chain(`leg${d.n}${S}`, pts, { parent: d.par, names: d.names, role: "leg" });
      b.sweep(leg, [0.085, 0.05], { color: (t: number) => (t > 0.75 ? YEL : t > 0.6 ? PURP : ORANGE) });
      const f = d.foot as number[];
      const bone = leg.tip!;
      b.part(new THREE.SphereGeometry(0.075, 8, 6), PINK, { bone, at: [f[0], 0.06, f[2] + 0.03], scale: [1, 0.8, 1.3] });
      for (const k of [-1, 0, 1])
        b.spike([f[0] + k * 0.045, 0.05, f[2] + 0.11], [k * 0.15, -0.3, 1], 0.07, 0.016, { color: BLACK, bone });
      b.part(new THREE.SphereGeometry(0.06, 6, 4), TURQ, { bone, at: [f[0], 0.17, f[2]] });
    }
  }

  // ---- head (eagle)
  b.part(new THREE.SphereGeometry(1, 10, 8), ORANGE, { bone: head, at: HC as any, scale: [0.11, 0.115, 0.14] });
  b.part(new THREE.SphereGeometry(1, 8, 6), WHITE, { bone: head, at: P(0, 0.0, 0.07), scale: [0.09, 0.08, 0.09] });
  b.sweep(bezier(P(0, 0.0, 0.1), P(0, 0.03, 0.24), P(0, 0.02, 0.32), P(0, -0.07, 0.3)), [0.065, 0.0], {
    bone: head, color: YEL, caps: "point",
  });
  b.sweep(polyline([P(0, -0.045, 0.08), P(0, -0.05, 0.25)]), [0.04, 0.012], { bone: jaw, color: ORANGE });
  b.part(new THREE.SphereGeometry(0.035, 6, 4), MAG, { bone: jaw, at: P(0, -0.06, 0.13), scale: [1.1, 0.6, 1.8] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.05, 8, 6), YEL, { bone: head, at: P(s * 0.085, 0.045, 0.1) });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), BLACK, { bone: head, at: P(s * 0.107, 0.048, 0.125) });
    b.part(new THREE.SphereGeometry(0.01, 4, 3), WHITE, { bone: head, at: P(s * 0.115, 0.06, 0.145) });
    b.spike(P(s * 0.06, 0.08, 0.12), [s * 0.8, 0.5, 0.5], 0.09, 0.012, { color: PURP, bone: head });
    // jaguar ears
    b.part(new THREE.SphereGeometry(0.045, 6, 4), ORANGE, { bone: head, at: P(s * 0.08, 0.12, -0.04), scale: [1, 1, 0.6] });
    b.part(new THREE.SphereGeometry(0.028, 6, 4), PINK, { bone: head, at: P(s * 0.08, 0.125, -0.02), scale: [1, 1, 0.5] });
    b.part(new THREE.SphereGeometry(0.014, 5, 4), BLACK, { bone: head, at: P(s * 0.025, 0.0, 0.2) });
  }
  // crest
  for (let i = 0; i < 6; i++) {
    const x = (i - 2.5) * 0.03;
    b.spike(P(x, 0.1, 0.0 - i * 0.004), [x * 2, 0.8, -0.7], 0.16 - Math.abs(i - 2.5) * 0.015, 0.024, { color: CYCLE[i % 7], bone: head });
  }
  // neck ruff
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    const sx = Math.sin(a), cy = Math.cos(a);
    b.spike([sx * 0.1, 0.98 + cy * 0.1, 0.5], [sx, cy * 0.7, -0.7], 0.12, 0.028, { color: CYCLE[k % 7], bone: neck.joints[2] });
  }

  // ---- wings
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const wing = b.chain(
      `wing${S}`,
      catmull([[s * 0.17, 0.86, 0.12], [s * 0.5, 1.02, 0.02], [s * 0.88, 1.06, -0.12]]),
      { parent: spine.joints[2], names: [`wingRoot${S}`, `wingMid${S}`, `wingTip${S}`], role: "wing" },
    );
    b.sweep(wing, [0.065, 0.028], { color: MAG });
    for (let row = 0; row < 2; row++)
      for (let i = 0; i < 8; i++) {
        const t = 0.1 + (i / 7) * 0.88;
        const pt = wing.at(t);
        const len = (row ? 0.22 : 0.36) - (i > 5 ? 0.05 : 0) + (i / 7) * 0.05;
        const fx = s * (0.12 + 0.05 * i);
        b.extrude(leaf(len, row ? 0.05 : 0.06), {
          at: [pt.at.x, pt.at.y - row * 0.02, pt.at.z - 0.02 - row * 0.03],
          x: [fx, 0, -1], thickness: 0.012, color: CYCLE[(i + row * 3) % 7], bone: pt.bone, bevel: 0.003,
        });
        if (!row) b.part(new THREE.SphereGeometry(0.014, 5, 4), WHITE, {
          bone: pt.bone, at: [pt.at.x + fx * len * 0.5, pt.at.y + 0.008, pt.at.z - 0.02 - len * 0.5],
        });
      }
  }

  // ---- tail
  const tail = b.chain("tail", catmull([[0, 0.62, -0.5], [0, 0.55, -0.9], [0, 0.5, -1.25], [0, 0.72, -1.5]]), {
    parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail",
  });
  b.sweep(tail, [0.07, 0.035], { color: (t: number) => (Math.floor(t * 8) % 2 ? BLACK : ORANGE) });
  const te = [0, 0.72, -1.5];
  for (let i = 0; i < 7; i++)
    b.extrude(leaf(0.3, 0.05), {
      at: te as any, x: [(i - 3) * 0.28, 0.5, -1], y: [0, 1, 0],
      thickness: 0.012, color: CYCLE[i % 7], bone: tail.tip!,
    });

  return b.root;
}
```