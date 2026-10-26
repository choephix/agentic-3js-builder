```ts
import * as THREE from "three";
import { createBuilder, catmull, paint, mix, noise, smoothstep, svg } from "agentic-3js-builder";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description: "Oaxacan painted-wood jaguar with eagle wings, beak and talons, covered in dotted patterns.",
};

const PINK = "#ff2d8a", TEAL = "#12b5b0", YEL = "#ffd21f", ORG = "#ff7a1a", PURP = "#6a2bb8", BLK = "#1a1020", WHT = "#fff6e0", GRN = "#3bb23b", RED = "#e0262e";

const dots = (base: string, c1: string, c2: string, size: number, seed: number) =>
  paint((p) => {
    const n = noise(p, size, seed);
    const m = noise(p, size * 2.2, seed + 4);
    if (n > 0.62) return c1;
    if (m < 0.3) return c2;
    return base;
  });

const BODY = paint((p, n) => {
  const base = mix(YEL, ORG, smoothstep(-0.5, 0.8, n.y * -1 + 0.2));
  const spot = noise(p, 0.07, 3);
  if (spot > 0.64) return BLK;
  if (spot > 0.58) return PINK;
  return base;
});

const dotTex = svg(
  `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#fff"/><circle cx="16" cy="16" r="7" fill="#e0262e"/><circle cx="48" cy="16" r="7" fill="#12b5b0"/><circle cx="32" cy="40" r="9" fill="#6a2bb8"/><circle cx="32" cy="40" r="3.5" fill="#ffd21f"/><circle cx="10" cy="54" r="4" fill="#1a1020"/><circle cx="54" cy="54" r="4" fill="#1a1020"/></svg>`,
  { size: 64 },
);

const eyeTex = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#fff6e0" stroke="#1a1020" stroke-width="5"/><circle cx="32" cy="32" r="18" fill="#12b5b0"/><circle cx="32" cy="32" r="9" fill="#1a1020"/><circle cx="27" cy="26" r="4" fill="#fff"/></svg>`,
  { size: 128 },
);

const featherTex = svg(
  `<svg viewBox="0 0 32 96"><path d="M16 2 C30 20 30 70 16 94 C2 70 2 20 16 2Z" fill="#12b5b0" stroke="#1a1020" stroke-width="3"/><path d="M16 8 V90" stroke="#1a1020" stroke-width="2"/><circle cx="16" cy="30" r="5" fill="#ffd21f"/><circle cx="16" cy="52" r="4" fill="#e0262e"/><path d="M16 66 L8 56 M16 66 L24 56" stroke="#fff6e0" stroke-width="2.5" fill="none"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "alebrije" });
  const hips = b.joint("hips", { at: [0, 0.62, -0.3], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.68, 0.25], aim: [0, 0.72, 0.5], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.78, 0.5], aim: [0, 1.0, 0.68], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.0, 0.68], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.97, 0.76], aim: [0, 0.93, 0.98], role: "jaw" });

  // body
  b.sweep(catmull([[0, 0.66, -0.4], [0, 0.7, 0.0], [0, 0.76, 0.3], [0, 0.86, 0.52]]), [0.2, 0.24, 0.2].length ? [0.2, 0.17] : 0.2, {
    color: BODY, bone: [hips, chest], sides: 8,
  } as any);
  b.sweep(catmull([[0, 0.66, -0.35], [0, 0.7, 0.05], [0, 0.78, 0.4]]), (t) => 0.2 + 0.05 * Math.sin(t * 3), { color: BODY, bone: [hips, chest] });
  b.part(new THREE.SphereGeometry(0.2, 8, 6), BODY, { bone: hips, at: [0, 0.68, -0.38], scale: [1, 0.95, 1.1] });
  b.part(new THREE.SphereGeometry(0.24, 8, 6), BODY, { bone: chest, at: [0, 0.78, 0.35], scale: [1.05, 1, 1] });
  // belly stripe
  b.part(new THREE.BoxGeometry(0.26, 0.04, 0.6), WHT, { bone: chest, at: [0, 0.52, 0.0], texture: dotTex });

  // neck
  b.sweep(catmull([[0, 0.82, 0.42], [0, 0.93, 0.58], [0, 1.0, 0.68]]), [0.15, 0.12], { color: dots(ORG, PINK, YEL, 0.06, 2), bone: neck });

  // head: jaguar skull
  b.part(new THREE.SphereGeometry(0.17, 8, 6), dots(YEL, ORG, PINK, 0.06, 5), { bone: head, at: [0, 1.02, 0.78], scale: [1.05, 0.95, 1] });
  // beak upper and lower
  b.part(new THREE.ConeGeometry(0.08, 0.22, 4), RED, { bone: head, at: [0, 0.99, 0.98], dir: [0, -0.2, 1], scale: [1, 1, 0.8] });
  b.part(new THREE.ConeGeometry(0.06, 0.16, 4), ORG, { bone: jaw, at: [0, 0.94, 0.94], dir: [0, 0, 1] });
  b.part(new THREE.BoxGeometry(0.11, 0.025, 0.1), WHT, { bone: jaw, at: [0, 0.92, 0.86] });
  // crown of feathers + ears
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.06, 6, 4), PURP, { bone: head, at: [s * 0.12, 1.17, 0.74], scale: [1, 1, 0.6] });
    b.part(new THREE.SphereGeometry(0.035, 6, 4), PINK, { bone: head, at: [s * 0.12, 1.17, 0.78] });
    const eye = b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
      bone: head, at: [s * 0.1, 1.06, 0.93], dir: [s * 0.3, 0, 1], axis: "z", texture: eyeTex,
    });
    b.part(new THREE.BoxGeometry(0.1, 0.025, 0.03), BLK, { bone: head, at: [s * 0.1, 1.13, 0.92], rotation: [0, 0, s * -15] });
    void eye;
    // whiskers
    for (let i = 0; i < 3; i++)
      b.rod([s * 0.06, 0.97 - i * 0.02, 0.93], [s * 0.24, 0.99 - i * 0.05, 0.95], 0.004, WHT, { bone: head });
  }
  const crown = b.surface(head).around([0, 1.02, 0.78]);
  void crown;
  [-2, -1, 0, 1, 2].forEach((i) => {
    b.spike([i * 0.05, 1.17, 0.7], [i * 0.1, 0.9, -0.5], 0.17 - Math.abs(i) * 0.02, 0.03, { color: [TEAL, YEL, PINK, YEL, TEAL][i + 2], bone: head });
  });

  // legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // front legs
    const f = b.chain(`legF${side}`, catmull([[s * 0.17, 0.7, 0.4], [s * 0.18, 0.4, 0.44], [s * 0.18, 0.06, 0.5]]), {
      parent: chest, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "leg",
    });
    b.sweep(f, [0.085, 0.05], { color: dots(YEL, BLK, PINK, 0.05, 8) });
    // hind legs
    const h = b.chain(`legH${side}`, catmull([[s * 0.19, 0.66, -0.4], [s * 0.2, 0.36, -0.3], [s * 0.19, 0.06, -0.38]]), {
      parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg",
    });
    b.sweep(h, [0.1, 0.05], { color: dots(YEL, BLK, TEAL, 0.05, 9) });
    // talons
    for (const [z0, bone] of [[0.5, f.tip ?? f.joints[2]], [-0.38, h.tip ?? h.joints[2]]] as const) {
      b.part(new THREE.SphereGeometry(0.07, 6, 4), ORG, { bone, at: [s * 0.18, 0.04, z0 + 0.03], scale: [1.1, 0.6, 1.4] });
      for (let k = -1; k <= 1; k++)
        b.spike([s * 0.18 + k * 0.045, 0.035, z0 + 0.09], [k * 0.15, -0.2, 1], 0.1, 0.02, { color: BLK, bone });
    }
  }

  // wings
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const w = b.chain(`wing${side}`, catmull([[s * 0.2, 1.0, 0.2], [s * 0.6, 1.2, 0.05], [s * 1.0, 1.22, -0.1]]), {
      parent: chest, names: [`wingBase${side}`, `wingMid${side}`, `wingTip${side}`], role: "wing",
    });
    b.sweep(w, [0.07, 0.04], { color: PURP });
    const roots = [0, 1, 2, 3, 4, 5, 6].map((i) => {
      const t = 0.15 + i * 0.13;
      return w.at(Math.min(t, 1));
    });
    b.cards(
      roots.map((r) => r),
      featherTex,
      { size: [0.2, 0.5], lean: 80, flow: [s * 0.4, -0.2, -1], bend: 15, color: undefined, cross: false } as any,
    );
    for (let i = 0; i < 6; i++) {
      const t = 0.1 + i * 0.16;
      const p = w.at(t);
      b.cards([p], featherTex, { size: [0.18, 0.55 - i * 0.03], lean: 80, flow: [s * 0.3, -0.1, -1], mirror: s < 0 });
    }
    b.part(new THREE.SphereGeometry(0.1, 6, 4), [TEAL, PINK][0], { bone: w.joints[1], at: [s * 0.6, 1.2, 0.05], scale: [2, 0.5, 1.2] });
  }

  // tail: jaguar tail with feather tip
  const tail = b.chain("tail", catmull([[0, 0.7, -0.55], [0, 0.6, -0.9], [0, 0.55, -1.25], [0, 0.75, -1.5]]), {
    parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail",
  });
  b.sweep(tail, [0.07, 0.04], { color: dots(YEL, BLK, ORG, 0.05, 11), bone: tail });
  b.cards([tail.at(1)], featherTex, { size: [0.15, 0.4], lean: 20, flow: [0, 1, -0.2], cross: true });
  for (const [x, c] of [[-0.1, PINK], [0, YEL], [0.1, TEAL]] as const)
    b.spike([x, 0.78, -1.5], [x * 2, 0.7, -1], 0.24, 0.035, { color: c, bone: tail.joints[3] });

  // painted decorations on flanks
  for (const s of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.17, 8), "#ffffff", {
      bone: hips, at: [s * 0.255, 0.74, -0.2], dir: [s, 0, 0], axis: "z", texture: dotTex,
    });
    b.part(new THREE.CircleGeometry(0.14, 8), "#ffffff", {
      bone: chest, at: [s * 0.27, 0.8, 0.35], dir: [s, 0, 0], axis: "z", texture: dotTex,
    });
  }
  // back ridge of cones
  for (let i = 0; i < 6; i++) {
    const z = -0.35 + i * 0.14;
    b.spike([0, 0.9 + (i > 3 ? 0.02 : 0), z], [0, 1, 0], 0.09, 0.03, {
      color: [PINK, TEAL, YEL][i % 3], bone: i < 3 ? hips : chest,
    });
  }
  void GRN;

  return b.root;
}
```