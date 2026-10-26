```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, paint, svg, mix, noise, smoothstep, frame, offset } from "agentic-3js-builder";

export const meta = {
  name: "Alebrije Jaguar-Eagle",
  description: "Oaxacan painted-wood alebrije: jaguar body with eagle head, beak and spread wings.",
};

const COLORS = ["#ff2e7e", "#ffb800", "#00b3a4", "#7a2cff", "#ff6a00", "#2fb34a", "#1e6bff"];

const dots = (c1: string, c2: string, c3: string) =>
  svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="${c1}"/>
  ${[8, 24, 40, 56].map((x) => [8, 24, 40, 56].map((y) => `<circle cx="${x + ((y / 16) % 2) * 8}" cy="${y}" r="4" fill="${c2}"/><circle cx="${x + ((y / 16) % 2) * 8}" cy="${y}" r="1.6" fill="${c3}"/>`).join("")).join("")}</svg>`,
    { size: 128 },
  );

const EYE = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#111"/><circle cx="32" cy="32" r="25" fill="#ffd400"/><circle cx="32" cy="32" r="14" fill="#ff2e7e"/><circle cx="32" cy="32" r="8" fill="#111"/><circle cx="27" cy="27" r="3.5" fill="#fff"/></svg>`,
  { size: 128 },
);

const FEATHER = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 0 C30 14 30 44 16 64 C2 44 2 14 16 0Z" fill="#fff" stroke="#111" stroke-width="2"/><path d="M16 6 V60" stroke="#111" stroke-width="1.5"/><circle cx="16" cy="22" r="5" fill="#ff2e7e"/><circle cx="16" cy="40" r="4" fill="#00b3a4"/></svg>`,
  { size: 128 },
);

const jag = (a: string, b: string, seed: number) =>
  paint((p, n) => {
    const v = noise(p, 0.06, seed);
    const dot = noise(p, 0.035, seed + 3);
    if (dot > 0.64) return "#1a0f2e";
    if (dot > 0.58) return mix(a, "#fff3c4", 0.6);
    return mix(a, b, smoothstep(0.3, 0.7, v) * 0.6 + n.y * 0.1);
  });

export default function build() {
  const b = createBuilder({ name: "alebrije" });
  const r = rng(5);
  const BODY = jag("#ffa000", "#ff4f8b", 1);
  const LEG = jag("#00b3a4", "#7a2cff", 2);
  const WOOD = "#e9c28a";

  // skeleton
  const hips = b.joint("hips", { at: [0, 0.62, -0.3] });
  const spine = b.chain("spine", catmull([[0, 0.62, -0.3], [0, 0.68, 0], [0, 0.78, 0.3]]), {
    parent: hips, names: ["spine1", "spine2", "chest"], role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 0.8, 0.3], [0, 0.98, 0.45], [0, 1.1, 0.55]]), {
    parent: spine.joints[1], names: ["neck1", "neck2", "head"], role: "neck",
  });
  const head = neck.tip ?? neck.joints[neck.joints.length - 1];
  const tail = b.chain("tail", catmull([[0, 0.62, -0.3], [0, 0.6, -0.7], [0, 0.75, -1.0], [0, 1.0, -1.1]]), {
    parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail",
  });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.08, 0.62], aim: [0, 1.04, 0.85], role: "jaw" });

  // body
  b.loft(
    [
      { at: [0, 0.62, -0.38], w: 0.3, h: 0.3 },
      { at: [0, 0.66, -0.1], w: 0.38, h: 0.38 },
      { at: [0, 0.74, 0.22], w: 0.42, h: 0.44 },
      { at: [0, 0.82, 0.38], w: 0.34, h: 0.36 },
    ],
    { bone: [hips, spine.joints[1], spine.joints[2]], color: BODY, sides: 8 },
  );
  b.sweep(tail, [0.07, 0.035], { color: (t) => (Math.floor(t * 8) % 2 ? "#1a0f2e" : "#ffb800") });
  b.sweep(neck, [0.11, 0.09], { color: jag("#ffb800", "#ff2e7e", 4) });

  // head
  b.part(new THREE.SphereGeometry(0.14, 8, 6), jag("#ffb800", "#ff6a00", 6), {
    bone: head, at: [0, 1.12, 0.58], scale: [1, 0.95, 1.1],
  });
  // eyes
  for (const s of [1, -1]) {
    b.part(new THREE.CircleGeometry(0.055, 12), "#ffffff", {
      bone: head, at: [s * 0.1, 1.15, 0.64], dir: [s * 0.5, 0, 0.9], axis: "z", texture: EYE,
    });
    // brow
    b.rod([s * 0.06, 1.22, 0.64], [s * 0.15, 1.19, 0.6], 0.016, "#7a2cff", { bone: head });
    // jaguar ear
    b.part(new THREE.SphereGeometry(0.045, 6, 4), "#ff2e7e", { bone: head, at: [s * 0.1, 1.26, 0.5], scale: [1, 1, 0.5] });
    // crest feathers
  }
  // beak
  b.spike([0, 1.12, 0.68], [0, 1.0, 0.92], null, 0.09, "#ffd400", { bone: head, sides: 6 });
  b.spike([0, 1.08, 0.7], [0, 1.0, 0.9], null, 0.06, "#ff6a00", { bone: jaw, sides: 6 });
  // crest
  for (let i = 0; i < 5; i++) {
    b.spike([0, 1.24, 0.46 - i * 0.04], [0, 1.4 - i * 0.02, 0.3 - i * 0.07], null, 0.03, COLORS[i + 1], { bone: head, sides: 5 });
  }

  // legs
  const legs: [number, number, string][] = [[0.17, 0.42, "L"], [0.17, -0.28, "H"]];
  for (const [x, z, k] of legs)
    for (const s of [1, -1]) {
      const top = k === "L" ? 0.66 : 0.62;
      const leg = b.chain(`leg${k}${s > 0 ? "L" : "R"}`, [[s * x, top, z], [s * x, 0.34, z + 0.04], [s * x, 0.06, z + 0.06]], {
        parent: k === "L" ? spine.joints[2] : hips, names: ["hip" + k + s, "knee" + k + s, "ankle" + k + s], role: "leg",
      });
      b.sweep(leg, [0.09, 0.05], { color: LEG, sides: 6 });
      b.part(new THREE.BoxGeometry(0.12, 0.05, 0.2), "#7a2cff", { bone: leg.tip!, at: [s * x, 0.025, z + 0.12] });
      for (let c = -1; c <= 1; c++)
        b.spike([s * x + c * 0.04, 0.04, z + 0.2], [s * x + c * 0.04, 0.02, z + 0.28], null, 0.018, "#fff3c4", { bone: leg.tip! });
    }

  // wings
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(`wing${side}`, [[s * 0.2, 0.9, 0.2], [s * 0.6, 1.1, 0.1], [s * 1.0, 1.15, -0.05]], {
      parent: spine.joints[2], names: ["shoulder" + side, "elbow" + side, "wrist" + side], role: "wing",
    });
    b.sweep(arm, [0.06, 0.04], { color: "#00b3a4", sides: 6 });
    const tex = [dots("#fff3c4", "#ff2e7e", "#111"), FEATHER];
    const n = 7;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const base = arm.at(0.25 + t * 0.7).at;
      const ang = -0.1 - t * 0.2;
      const tip: [number, number, number] = [s * (1.5 - t * 0.25), 1.05 - t * 0.12 - 0.05, -0.1 - t * 0.55];
      b.slab(
        [
          offset(base, [0, 0, 1], 0.07),
          offset(base, [0, 0, -1], 0.07),
          [tip[0] + 0.0, tip[1], tip[2] - 0.05],
          [tip[0] + 0.0, tip[1] + 0.02, tip[2] + 0.06],
        ],
        { color: COLORS[(i + 2) % 7], thickness: 0.015, bone: arm.joints[Math.min(2, Math.floor(t * 3))] },
      );
      b.part(new THREE.CircleGeometry(0.035, 8), "#ffffff", {
        bone: arm.joints[1], at: [s * (1.0 + t * 0.3), 1.07 - t * 0.1, -0.1 - t * 0.5 + 0.0], dir: [0, 1, 0], axis: "z", texture: tex[0],
      });
    }
    void ang0;
  }

  // painted decorations: dots along the back
  const skin = b.surface(b.root);
  for (const h of skin.scatter(40, { rng: r, minDist: 0.1, filter: (h) => h.n.y > 0.5 && Math.abs(h.at.x) < 0.3 && h.at.z < 0.4 && h.at.z > -0.4 }))
    b.stick(new THREE.SphereGeometry(0.02, 5, 4), COLORS[Math.floor(r() * 7)], h, { embed: 0.4 });

  return b.root;
}
const ang0 = 0;
```