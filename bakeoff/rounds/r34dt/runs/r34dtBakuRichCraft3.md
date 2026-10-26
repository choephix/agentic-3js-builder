```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, bezier, limb, paint, noise, mottle, scales, gradient, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Baku",
  description: "Dream-eating tapir spirit in ukiyo-e woodblock style: indigo and cream coat, vermilion mane, gold horns.",
};

const INDIGO = "#1d2f5c";
const INDIGO2 = "#2f4d8c";
const CREAM = "#f1e4c3";
const PAPER = "#c9b78c";
const VERM = "#d8402a";
const GOLD = "#dcab32";
const INK = "#141a30";

// ---- textures ----
const EYE = svg(
  `<svg viewBox="0 0 100 70">
  <path d="M4 40 Q30 4 62 8 Q90 12 98 34 Q70 62 36 58 Q14 54 4 40Z" fill="${VERM}"/>
  <path d="M12 40 Q34 14 62 16 Q82 18 90 33 Q68 54 38 51 Q20 48 12 40Z" fill="#fff6e0" stroke="${INK}" stroke-width="4"/>
  <circle cx="54" cy="34" r="16" fill="${GOLD}" stroke="${INK}" stroke-width="4"/>
  <ellipse cx="54" cy="34" rx="6" ry="12" fill="${INK}"/>
  <circle cx="48" cy="27" r="4" fill="#fff"/>
  <path d="M4 40 Q-1 48 2 60" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);
const MANE = svg(
  `<svg viewBox="0 0 40 90">
  <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${VERM}"/><stop offset="0.6" stop-color="${GOLD}"/><stop offset="1" stop-color="${CREAM}"/></linearGradient></defs>
  <path d="M6 90 Q-2 55 14 36 Q10 22 26 2 Q30 24 30 40 Q40 62 34 90Z" fill="url(#g)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M16 84 Q10 58 22 30" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M25 84 Q24 62 27 44" stroke="#fff3c0" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 160 },
);
const TUFT = svg(
  `<svg viewBox="0 0 40 90">
  <path d="M10 90 Q0 50 20 2 Q40 50 30 90Z" fill="${INDIGO2}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M20 80 Q16 50 20 14" stroke="${CREAM}" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);
const SWIRL = svg(
  `<svg viewBox="0 0 100 100">
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 80 C20 40 50 20 70 34 C86 46 74 68 56 62 C44 58 46 44 56 46" stroke="${INK}" stroke-width="13"/>
  <path d="M20 80 C20 40 50 20 70 34 C86 46 74 68 56 62 C44 58 46 44 56 46" stroke="${VERM}" stroke-width="7"/>
  <path d="M26 66 C14 56 12 40 22 30 C32 40 34 54 26 66Z" stroke="${INK}" stroke-width="9"/>
  <path d="M26 66 C14 56 12 40 22 30 C32 40 34 54 26 66Z" stroke="${GOLD}" stroke-width="4" fill="${GOLD}"/>
  <path d="M60 86 C74 84 86 78 92 66" stroke="${INK}" stroke-width="11"/>
  <path d="M60 86 C74 84 86 78 92 66" stroke="${VERM}" stroke-width="5"/>
  </g></svg>`,
  { size: 256 },
);
const CLOUD = svg(
  `<svg viewBox="0 0 100 60">
  <path d="M14 50 C0 50 0 30 16 30 C16 12 38 8 46 22 C54 6 80 10 80 28 C98 26 100 50 82 50Z" fill="${CREAM}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M26 42 C20 36 28 32 32 38 M52 40 C46 32 58 28 62 36 M72 42 C68 38 74 36 78 40" stroke="${INDIGO2}" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

// ---- paints ----
const SADDLE = scales(CREAM, PAPER, { size: 0.1, width: 0.1, seed: 4 });
const DARKP = mottle(INDIGO, INDIGO2, { size: 0.14, seed: 2, contrast: 0.8 });
const BODY = paint((p, n) => {
  const zz = p.z + (noise(p, 0.25, 3) - 0.5) * 0.14;
  if (Math.abs(zz + 0.5) < 0.014 || Math.abs(zz - 0.18) < 0.014) return VERM;
  return zz > -0.5 && zz < 0.18 && p.y < 1.5 && n.y > -2 ? SADDLE : DARKP;
});

export default function build() {
  const b = createBuilder({ name: "baku" });
  const R = rng(11);

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 0.95, -0.5], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([[0, 0.95, -0.5], [0, 0.98, -0.1], [0, 1.02, 0.3], [0, 1.08, 0.62]]),
    { parent: hips, role: "spine", names: ["spine1", "spine2", "spine3"] },
  );
  const neck = b.chain("neck", catmull([[0, 1.08, 0.62], [0, 1.17, 0.78], [0, 1.22, 0.95]]), {
    parent: spine.joints[2],
    role: "neck",
    names: ["neck1", "neck2"],
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.22, 0.95], dir: [0, -0.1, 1], role: "head" });
  const HL = (o: Record<string, number>) => head.local(o);

  // ---- body ----
  const body = b.sweep(
    catmull([[0, 0.95, -0.62], [0, 0.95, -0.5], [0, 0.98, -0.1], [0, 1.02, 0.3], [0, 1.08, 0.62], [0, 1.17, 0.78], [0, 1.21, 0.9]]),
    [0.2, 0.3, 0.34, 0.36, 0.3, 0.22, 0.16],
    { bone: [hips, spine, neck], color: BODY },
  );

  // ---- head ----
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), DARKP, {
    bone: head,
    at: HL({ forward: 0.1 }),
    scale: [0.2, 0.2, 0.27],
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: HL({ down: 0.1, forward: 0.02 }),
    aim: HL({ down: 0.13, forward: 0.26 }),
    role: "jaw",
  });
  b.frustumBox(HL({ down: 0.1, forward: 0.02 }), HL({ down: 0.13, forward: 0.26 }), [0.2, 0.08], [0.12, 0.06], {
    bone: jaw,
    color: DARKP,
  });
  b.part(new THREE.SphereGeometry(0.05, 7, 5), CREAM, { bone: jaw, at: HL({ down: 0.135, forward: 0.27 }), scale: [1.2, 0.8, 1] });

  // trunk
  const trunk = b.chain(
    "trunk",
    catmull([[0, 1.17, 1.25], [0, 1.08, 1.45], [0, 0.93, 1.57], [0, 0.8, 1.52], [0, 0.77, 1.43]]),
    { parent: head, role: "tentacle", names: ["trunk1", "trunk2", "trunk3", "trunk4"] },
  );
  const tsw = b.sweep(trunk, [0.1, 0.045], {
    color: gradient(DARKP, CREAM, trunk.path.at(0.65), trunk.path.at(0.9)),
    sides: 8,
  });
  for (const s of [1, -1]) b.stick(new THREE.SphereGeometry(0.014, 5, 4), INK, tsw.at(0.97, s * 80), { embed: 0.3 });

  // eyes, brows
  for (const s of [1, -1]) {
    b.decal(skull, EYE, {
      at: HL({ left: s * 0.15, up: 0.05, forward: 0.12 }),
      dir: [s * 0.6, 0.1, 0.8],
      size: [0.11, 0.077],
      mirror: s > 0,
    });
    b.sweep(
      catmull([HL({ left: s * 0.05, up: 0.19, forward: 0.2 }), HL({ left: s * 0.1, up: 0.18, forward: 0.14 }), HL({ left: s * 0.15, up: 0.14, forward: 0.08 })]),
      [0.014, 0.02],
      { bone: head, color: VERM, sides: 5 },
    );
    // ears: cream rim + indigo inner
    const rim: [number, number][] = [];
    const inner: [number, number][] = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      rim.push([Math.cos(a) * 0.075, 0.08 + Math.sin(a) * 0.095]);
      inner.push([Math.cos(a) * 0.05, 0.08 + Math.sin(a) * 0.068]);
    }
    const at = HL({ left: s * 0.14, up: 0.15, back: 0.02 });
    b.extrude(rim, { at, x: [s * 0.8, 0, -0.6], thickness: 0.022, bone: head, color: CREAM });
    b.extrude(inner, { at, x: [s * 0.8, 0, -0.6], thickness: 0.03, bone: head, color: INDIGO });
    // horns
    b.sweep(
      bezier(HL({ left: s * 0.07, up: 0.17, forward: 0.05 }), HL({ left: s * 0.14, up: 0.3, forward: 0.0 }), HL({ left: s * 0.12, up: 0.42, back: 0.12 })),
      [0.032, 0.004],
      { bone: head, color: GOLD, sides: 6, caps: { end: "point" } },
    );
    // tusks
    b.spike(HL({ left: s * 0.05, down: 0.1, forward: 0.2 }), [s * 0.2, 0.9, 0.4], 0.12, 0.02, { bone: jaw, color: CREAM });
  }
  glow(b.part(new THREE.OctahedronGeometry(0.035), VERM, { bone: head, at: HL({ up: 0.2, forward: 0.1 }) }), 1.4);
  b.part(new THREE.TorusGeometry(0.045, 0.01, 5, 10), GOLD, { bone: head, at: HL({ up: 0.2, forward: 0.1 }), dir: [0, 1, 0], axis: "z" });

  // ---- legs ----
  const paw = (x: number, z: number, bone: any) => {
    b.part(new THREE.SphereGeometry(1, 8, 6), INDIGO, { bone, at: [x, 0.06, z + 0.04], scale: [0.085, 0.06, 0.12] });
    for (const o of [-1, 0, 1]) {
      b.part(new THREE.SphereGeometry(0.03, 6, 4), INDIGO2, { bone, at: [x + o * 0.04, 0.035, z + 0.14] });
      b.spike([x + o * 0.04, 0.03, z + 0.165], [0, -0.3, 1], 0.045, 0.011, { bone, color: GOLD });
    }
  };
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const fr = limb([s * 0.2, 0.95, 0.3], [s * 0.2, 0.07, 0.34], [0.46, 0.46], [[0, 0, -1]]);
    const fch = b.chain(`legF${S}`, fr, { parent: spine.joints[2], role: "leg", names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`] });
    b.sweep(fch, [0.11, 0.055], { color: DARKP, sides: 8 });
    paw(s * 0.2, 0.34, fch.tip);
    const hr = limb([s * 0.2, 0.95, -0.55], [s * 0.2, 0.07, -0.62], [0.48, 0.46], [[0, 0, 1]]);
    const hch = b.chain(`legH${S}`, hr, { parent: hips, role: "leg", names: [`hip${S}`, `knee${S}`, `ankle${S}`] });
    b.sweep(hch, [0.13, 0.055], { color: DARKP, sides: 8 });
    paw(s * 0.2, -0.62, hch.tip);

    // flank swirls
    b.decal(body, SWIRL, { at: [s * 0.37, 1.0, -0.15], dir: [s, 0, 0], size: [0.34, 0.34], mirror: s < 0 });
    b.decal(body, SWIRL, { at: [s * 0.35, 1.05, 0.42], dir: [s, 0, 0], size: [0.26, 0.26], mirror: s < 0 });
  }
  b.decal(body, CLOUD, { at: [0, 1.25, -0.4], dir: [0, 1, 0], up: [0, 0, 1], size: [0.34, 0.2] });

  // ---- tail ----
  const tail = b.chain("tail", catmull([[0, 0.98, -0.6], [0, 0.88, -0.78], [0, 0.72, -0.86], [0, 0.58, -0.88]]), {
    parent: hips,
    role: "tail",
    names: ["tail1", "tail2", "tail3"],
  });
  b.sweep(tail, [0.06, 0.03], { color: DARKP, sides: 6 });
  b.cards(b.ring(tail.at(1), { count: 7, radius: 0.025, tilt: 25 }).items, TUFT, {
    size: [0.09, 0.22],
    lean: 25,
    bend: 25,
    flow: [0, -1, -0.2],
    vary: 0.2,
    rng: R,
  });

  // ---- mane ----
  const skin = b.surface(body);
  b.cards(
    skin.scatter(80, { rng: rng(5), minDist: 0.06, filter: (h) => h.at.z > 0.3 && h.n.y > 0.1 }),
    MANE,
    { size: [0.1, 0.24], lean: 55, bend: 30, flow: [0, -0.3, -1], vary: 0.3, spin: 15, rng: rng(6) },
  );
  b.cards(
    skin.scatter(30, { rng: rng(7), minDist: 0.1, filter: (h) => h.at.z > -0.1 && h.at.z < 0.3 && h.n.y > 0.7 }),
    MANE,
    { size: [0.07, 0.15], lean: 60, bend: 25, flow: [0, -0.3, -1], vary: 0.3, rng: rng(8) },
  );
  b.cards(
    b.surface(skull).scatter(14, { rng: rng(9), minDist: 0.06, filter: (h) => h.n.y > 0.5 && h.at.z < 1.1 }),
    MANE,
    { size: [0.07, 0.17], lean: 50, bend: 30, flow: [0, -0.3, -1], vary: 0.25, rng: rng(10) },
  );

  return b.root;
}
```