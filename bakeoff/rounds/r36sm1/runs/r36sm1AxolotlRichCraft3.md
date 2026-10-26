```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, bezier, countershade, spots, svg } from "agentic-3js-builder";

export const meta = {
  name: "Chibi Axolotl",
  description: "A chibi axolotl with a big round head, a wide smile and frilly pink gills, with tiny hands and a finned tail.",
};

const PINK = "#f6b8c8";
const PINK2 = "#f3a6ba";
const BELLY = "#fde6ea";
const STALK = "#e8528c";
const FIN = "#f391b0";
const SPOT = "#dc7a98";
const DARK = "#2a1424";

const FROND = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 64 C4 48 2 24 16 2 C30 24 28 48 16 64Z" fill="#ff7fae" stroke="#d93c7c" stroke-width="2.5"/><path d="M16 60 L16 10" stroke="#ffc2d8" stroke-width="3"/><path d="M16 40 L8 28 M16 40 L24 28 M16 28 L10 18 M16 28 L22 18" stroke="#d93c7c" stroke-width="2" fill="none"/></svg>`,
  { size: 128 },
);
const SMILE = svg(
  `<svg viewBox="0 0 100 36"><path d="M8 8 Q50 40 92 8" stroke="#3a1a2c" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M8 8 L4 2 M92 8 L96 2" stroke="#3a1a2c" stroke-width="4" stroke-linecap="round"/></svg>`,
  { size: 192 },
);
const BLUSH = svg(
  `<svg viewBox="0 0 64 40"><defs><radialGradient id="g"><stop offset="0" stop-color="#ff6f9c" stop-opacity="0.95"/><stop offset="1" stop-color="#ff6f9c" stop-opacity="0.45"/></radialGradient></defs><ellipse cx="32" cy="20" rx="28" ry="16" fill="url(#g)"/></svg>`,
  { size: 96 },
);

export default function build() {
  const b = createBuilder({ name: "axolotl" });
  const R = rng(11);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.1, -0.08], dir: [0, 0, 1], role: "spine" });
  const spinePath = catmull([[0, 0.1, -0.08], [0, 0.11, 0.1], [0, 0.12, 0.2]]);
  const spine = b.chain("spine", spinePath, { parent: hips, names: ["spine1", "spine2"], role: "spine" });
  const tailPath = catmull([[0, 0.1, -0.08], [0, 0.1, -0.3], [0, 0.09, -0.5], [0, 0.08, -0.72]]);
  const tail = b.chain("tail", tailPath, { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" });
  const head = b.joint("head", { parent: spine.joints[1], at: [0, 0.12, 0.2], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.06, 0.2], aim: [0, 0.05, 0.36], role: "jaw" });

  // ---------- coat ----------
  const coat = countershade(spots(PINK, SPOT, { size: 0.07, amount: 0.25, seed: 4 }), BELLY, { level: -0.35 });

  // ---------- body + tail ----------
  const whole = catmull([
    [0, 0.08, -0.72], [0, 0.09, -0.5], [0, 0.1, -0.3], [0, 0.1, -0.08], [0, 0.11, 0.1], [0, 0.12, 0.2],
  ]);
  const cut = 0.68;
  const body = b.sweep(
    whole,
    (t) => {
      const w = t < cut ? 0.012 + 0.085 * Math.pow(t / cut, 0.8) : 0.097 + 0.008 * Math.sin(((t - cut) / (1 - cut)) * 3);
      const k = Math.min(t / cut, 1);
      return [w * (0.7 + 0.3 * k), w * (1.3 - 0.3 * k)];
    },
    { bone: [tail, hips, spine], color: coat, caps: { start: "point", end: "round" } },
  );

  // freckles on the back
  const skin = b.surface(body);
  for (const h of skin.scatter(22, { rng: R, minDist: 0.06, filter: (h) => h.n.y > 0.5 }))
    b.stick(new THREE.CylinderGeometry(0.014, 0.014, 0.01, 6), SPOT, h, { embed: 0.5 });

  // tail fin
  b.extrude(
    [[0, -0.02], [0.1, -0.075], [0.3, -0.095], [0.5, -0.06], [0.6, 0, "sharp"], [0.5, 0.07], [0.3, 0.1], [0.1, 0.08], [0, 0.04]],
    { at: [0, 0.095, -0.2], x: [0, 0, -1], thickness: 0.008, bevel: 0.002, smoothing: 1, color: FIN, bone: tail.joints[1] },
  );

  // ---------- head ----------
  const headPart = b.part(new THREE.SphereGeometry(1, 16, 12), coat, {
    bone: head, at: [0, 0.115, 0.24], scale: [0.17, 0.11, 0.15],
  });
  b.part(new THREE.SphereGeometry(1, 12, 8), BELLY, { bone: jaw, at: [0, 0.045, 0.28], scale: [0.115, 0.03, 0.095] });

  // face
  b.decal(headPart, SMILE, { at: [0, 0.075, 0.37], dir: [0, -0.1, 1], size: [0.11, 0.04], bone: head });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 8), DARK, { bone: head, at: [s * 0.078, 0.19, 0.3], scale: 0.032 });
    b.part(new THREE.SphereGeometry(1, 6, 5), "#ffffff", { bone: head, at: [s * 0.072, 0.203, 0.327], scale: 0.0115 });
    b.part(new THREE.SphereGeometry(1, 5, 4), "#ffffff", { bone: head, at: [s * 0.088, 0.18, 0.328], scale: 0.006 });
    b.part(new THREE.SphereGeometry(1, 5, 4), DARK, { bone: head, at: [s * 0.03, 0.16, 0.367], scale: 0.0065 });
    b.decal(headPart, BLUSH, { at: [s * 0.14, 0.095, 0.3], dir: [s, 0, 0.45], size: [0.07, 0.045], bone: head, mirror: s > 0 });
  }

  // ---------- gills ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const base: [number, number, number] = [s * 0.12, 0.15, 0.14];
    const ends: [number, number, number][] = [
      [s * 0.25, 0.31, 0.08],
      [s * 0.31, 0.22, 0.1],
      [s * 0.28, 0.12, 0.12],
    ];
    ends.forEach((end, i) => {
      const ctrl: [number, number, number] = [(base[0] + end[0]) / 2 + s * 0.02, (base[1] + end[1]) / 2 + 0.03, (base[2] + end[2]) / 2 - 0.05];
      const path = bezier(base, ctrl, end);
      const ch = b.chain(`gill${side}${i + 1}_`, path, { parent: head, count: 2, role: "fan" });
      const stalk = b.sweep(ch, [0.014, 0.007], { color: STALK, caps: { end: "round" } });
      const flow: [number, number, number] = [end[0] - base[0], end[1] - base[1], end[2] - base[2]];
      const frames: ReturnType<typeof stalk.at>[] = [];
      for (const t of [0.25, 0.4, 0.55, 0.7, 0.85]) {
        frames.push(stalk.at(t, 90), stalk.at(t, -90));
      }
      b.cards(frames, FROND, { size: [0.045, 0.075], lean: 55, flow, bend: 20, vary: 0.2, rng: R, spin: 10 });
      b.cards([stalk.at(1, 0)], FROND, { size: [0.05, 0.085], lean: 5, flow, cross: true });
    });
  }

  // ---------- legs ----------
  const limbDefs = [
    { n: "arm", root: [0.09, 0.09, 0.1], mid: [0.15, 0.05, 0.12], end: [0.17, 0.02, 0.18], parent: spine.joints[0] },
    { n: "leg", root: [0.09, 0.09, -0.1], mid: [0.16, 0.05, -0.13], end: [0.17, 0.02, -0.2], parent: hips },
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const d of limbDefs) {
      const p = (v: number[]): [number, number, number] => [s * v[0], v[1], v[2]];
      const chain = b.chain(`${d.n}${side}`, catmull([p(d.root), p(d.mid), p(d.end)]), {
        parent: d.parent,
        names: [`${d.n}${side}`, `${d.n}Mid${side}`, `${d.n}Tip${side}`],
        role: d.n === "arm" ? "arm" : "leg",
      });
      b.sweep(chain, [0.034, 0.024], { color: PINK, caps: { start: "round", end: "round" } });
      const tip = chain.tip!;
      const e = p(d.end);
      b.part(new THREE.SphereGeometry(1, 8, 6), PINK2, { bone: tip, at: [e[0], e[1], e[2] + 0.012], scale: [0.032, 0.012, 0.036] });
      for (let k = 0; k < 4; k++) {
        const ox = (k - 1.5) * 0.017;
        b.capsule([e[0] + ox * s, e[1], e[2] + 0.025], [e[0] + ox * 1.6 * s, e[1], e[2] + 0.058], 0.0085, PINK2, { bone: tip });
      }
    }
  }

  return b.root;
}
```