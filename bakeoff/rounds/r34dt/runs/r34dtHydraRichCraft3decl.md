```ts
import * as THREE from "three";
import { createBuilder, rng, bezier, catmull, limb, countershade, mottle, scales, grain, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Five-Headed Hydra",
  description:
    "A scarred, battle-worn Norse-style hydra with five horned heads on iron-collared necks, bone dorsal spikes, glowing ember eyes and rune-cracked flanks. Rigged with jaws, legs, tail and necks.",
};

const BONE = "#d8cdb0";
const BONE_DK = "#8d8264";
const IRON = "#3a3c45";
const EMBER = "#ff7a1a";
const MOUTH = "#7a1f26";
const CLAW = "#2a2420";

const SKIN = countershade(
  mottle(scales(["#33503f", "#2c4636", "#3a5a45"], "#121e17", { size: 0.11, seed: 3 }), "#4b4d3a", {
    size: 0.5,
    seed: 5,
    contrast: 0.6,
  }),
  "#a89a6a",
  { level: -0.25, soft: 0.3 },
);
const HIDE_DK = grain("#26382c", "#1a2820", { size: 0.04, axis: "y" });

const RUNE = svg(
  `<svg viewBox="0 0 64 64">
  <g fill="none" stroke="#ffb040" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M32 6 L54 44 L10 44 Z"/><path d="M32 58 L10 20 L54 20 Z" stroke="#ff7a1a"/>
    <path d="M32 6 V58"/></g></svg>`,
  { size: 128 },
);
const CRACK = svg(
  `<svg viewBox="0 0 64 64">
  <path d="M6 8 L22 22 L18 30 L38 40 L34 48 L58 58" fill="none" stroke="#ff5a10" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M22 22 L40 14 M38 40 L52 30" fill="none" stroke="#ffb040" stroke-width="3" stroke-linecap="round"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "hydra" });
  const R = rng(11);

  // ---------- skeleton: body ----------
  const hips = b.joint("hips", { at: [0, 1.2, -0.9], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.2, -0.9],
      [0, 1.3, -0.2],
      [0, 1.45, 0.5],
      [0, 1.6, 1.1],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const body = b.sweep(spine, [0.5, 0.78, 0.88, 0.7], { color: SKIN, caps: "round" });
  b.along(body, 7, (at) => b.spike(at, at, 0.4, 0.1, { color: BONE, sides: 6 }));
  b.along(body, 5, (at) => b.spike(at, at, 0.18, 0.06, { color: BONE_DK, sides: 5 }), { from: 0.1, to: 0.9 });

  // runes and lava scars
  for (const s of [1, -1]) {
    glow(
      b.decal(body, RUNE, {
        at: [s * 0.8, 1.45, 0.1],
        dir: [s, 0, 0],
        size: [0.55, 0.55],
        mirror: s < 0,
      }),
      1.4,
    );
    glow(
      b.decal(body, CRACK, {
        at: [s * 0.75, 1.3, -0.6],
        dir: [s, 0, 0],
        size: [0.6, 0.6],
        mirror: s < 0,
      }),
      1.3,
    );
    // pauldrons
    b.part(new THREE.SphereGeometry(0.4, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), IRON, {
      at: [s * 0.72, 1.85, 0.7],
      rotation: [0, 0, -s * 35],
      flat: true,
    });
    for (let j = 0; j < 4; j++) {
      const a = (j / 4) * Math.PI * 2;
      b.part(new THREE.ConeGeometry(0.05, 0.14, 5), BONE, {
        at: [s * 0.72 + Math.cos(a) * 0.2 * s * 0.5, 2.0 + Math.sin(a) * 0.1, 0.7 + Math.sin(a) * 0.2],
        dir: [s * 0.4, 1, 0],
      });
    }
  }

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.2, -0.9],
      [0, 1.0, -1.8],
      [0, 0.75, -2.6],
      [0, 0.65, -3.5],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  const tailS = b.sweep(tail, [0.45, 0.05], { color: SKIN, caps: "point" });
  b.along(tailS, 6, (at) => b.spike(at, at, 0.26, 0.07, { color: BONE, sides: 5 }), { from: 0.05, to: 0.9 });

  // ---------- legs ----------
  const legSpec = [
    { tag: "F", hip: [0.68, 1.25, 0.8], z: 1.0, parent: spine.joints[2] },
    { tag: "B", hip: [0.62, 1.15, -0.9], z: -1.0, parent: spine.joints[0] },
  ];
  for (const sp of legSpec) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const t = sp.tag + side;
      const hip: [number, number, number] = [s * sp.hip[0], sp.hip[1], sp.hip[2]];
      const foot: [number, number, number] = [s * 0.85, 0.12, sp.z];
      const pts = limb(hip, foot, [0.65, 0.65], [[0, 0, 1]]);
      const leg = b.chain(`leg${t}`, pts, {
        parent: sp.parent,
        names: [`hip${t}`, `knee${t}`, `ankle${t}`],
        role: "leg",
        contact: [foot[0], 0, foot[2]],
      });
      b.sweep(leg, (u) => 0.27 - 0.15 * u, { color: SKIN });
      b.part(new THREE.SphereGeometry(0.34, 8, 6), SKIN, { bone: leg.joints[0], at: hip, scale: [0.9, 1.2, 1.1] });
      const tip = leg.tip!;
      b.part(new THREE.BoxGeometry(0.36, 0.2, 0.5), HIDE_DK, { bone: tip, at: [foot[0], 0.1, foot[2] + 0.1] });
      for (let j = -1; j <= 1; j++)
        b.spike([foot[0] + j * 0.12, 0.09, foot[2] + 0.33], [0, -0.25, 1], 0.26, 0.055, {
          color: CLAW,
          bone: tip,
          sides: 5,
        });
      // iron anklet
      b.part(new THREE.TorusGeometry(0.15, 0.035, 5, 9), IRON, { bone: tip, at: [foot[0], 0.3, foot[2]], rotation: [90, 0, 0] });
    }
  }

  // ---------- necks and heads ----------
  for (let i = 0; i < 5; i++) {
    const k = i - 2;
    const a = 2 - Math.abs(k);
    const H = k === 0 ? 1.25 : 1.0 + 0.04 * a;
    const base = [k * 0.25, 1.8, 0.9];
    const p1 = [k * 0.5, 2.5 + 0.15 * a, 1.0];
    const p2 = [k * 0.8, 3.0 + 0.35 * a, 1.25 + 0.1 * a];
    const p3 = [k * 0.95, 2.75 + 0.4 * a, 2.0 + 0.15 * a];
    const n = i + 1;
    const neck = b.chain(`neck${n}`, catmull([base, p1, p2, p3]), {
      parent: spine.joints[2],
      names: [`neck${n}a`, `neck${n}b`, `neck${n}c`],
      role: "neck",
    });
    const rad = (u: number) => 0.32 - 0.12 * u;
    const nS = b.sweep(neck, rad, { color: SKIN });
    b.along(nS, 5, (at) => b.spike(at, at, 0.15, 0.04, { color: BONE, sides: 5 }), { from: 0.12, to: 0.85 });
    // iron cuff + studs
    const cp = neck.at(0.28);
    b.part(new THREE.TorusGeometry(rad(0.28) + 0.03, 0.045, 5, 10), IRON, { at: cp.at, dir: cp.tangent, axis: "z", flat: true });
    b.ring(cp, { count: 6, radius: rad(0.28) + 0.04 }, (it) => b.spike(it, it, 0.08, 0.028, { color: BONE_DK, sides: 4 }));

    // head
    const head = b.joint(`head${n}`, {
      parent: neck.joints[neck.joints.length - 1],
      at: p3,
      dir: [k * 0.1, 0, 1],
      role: "head",
    });
    const L = (o: Record<string, number>) => {
      const m: Record<string, number> = {};
      for (const key of Object.keys(o)) m[key] = o[key] * H;
      return head.local(m);
    };
    b.frustumBox(L({ forward: -0.15 }), L({ forward: 0.4 }), [0.42 * H, 0.34 * H], [0.34 * H, 0.26 * H], {
      bone: head,
      color: SKIN,
    });
    b.frustumBox(L({ forward: 0.35 }), L({ forward: 0.95, down: 0.02 }), [0.3 * H, 0.14 * H], [0.2 * H, 0.1 * H], {
      bone: head,
      color: SKIN,
    });
    // lower jaw
    const jaw = b.joint(`jaw${n}`, {
      parent: head,
      at: L({ forward: 0.05, down: 0.16 }),
      aim: L({ forward: 0.9, down: 0.16 }),
      role: "jaw",
    });
    b.frustumBox(jaw.at, L({ forward: 0.9, down: 0.16 }), [0.26 * H, 0.07 * H], [0.18 * H, 0.06 * H], {
      bone: jaw,
      color: "#6c7a5a",
    });
    b.part(new THREE.BoxGeometry(0.14 * H, 0.02 * H, 0.5 * H), MOUTH, {
      bone: jaw,
      at: L({ forward: 0.5, down: 0.12 }),
    });
    for (let j = 0; j < 5; j++) {
      const f = 0.4 + j * 0.12;
      for (const s of [1, -1]) {
        b.spike(L({ forward: f, down: 0.06, left: s * 0.1 * (1 - j * 0.1) }), [0, -1, 0], 0.11 * H, 0.022 * H, {
          color: BONE,
          bone: head,
          sides: 5,
        });
        b.spike(L({ forward: f - 0.05, down: 0.12, left: s * 0.09 * (1 - j * 0.1) }), [0, 1, 0], 0.09 * H, 0.02 * H, {
          color: BONE,
          bone: jaw,
          sides: 5,
        });
      }
    }
    for (const s of [1, -1]) {
      // eyes
      const eyeAt = L({ forward: 0.28, up: 0.1, left: s * 0.17 });
      glow(b.part(new THREE.SphereGeometry(0.045 * H, 6, 4), EMBER, { bone: head, at: eyeAt }), 2);
      b.part(new THREE.SphereGeometry(0.03 * H, 6, 4), "#0a0605", {
        bone: head,
        at: head.local({ forward: 0.28 * H + 0.03 * H, up: 0.1 * H, left: s * 0.17 * H + s * 0.005 }),
        scale: [0.35, 1.6, 0.5],
      });
      // brow
      b.part(new THREE.BoxGeometry(0.1 * H, 0.05 * H, 0.24 * H), HIDE_DK, {
        bone: head,
        at: L({ forward: 0.3, up: 0.17, left: s * 0.15 }),
        rotation: [0, 0, -s * 18],
      });
      // nostril
      b.part(new THREE.SphereGeometry(0.025 * H, 5, 4), "#0b0807", {
        bone: head,
        at: L({ forward: 0.93, up: 0.03, left: s * 0.05 }),
      });
      // horns
      b.sweep(
        bezier(
          L({ forward: 0.05, up: 0.15, left: s * 0.14 }),
          L({ back: 0.2, up: 0.35, left: s * 0.3 }),
          L({ back: 0.45, up: 0.55, left: s * 0.36 }),
        ),
        [0.065 * H, 0],
        { bone: head, color: BONE, caps: { start: "flat", end: "point" }, sides: 6 },
      );
      // cheek spike
      b.spike(L({ forward: 0.1, down: 0.02, left: s * 0.19 }), [s * 0.7, -0.2, -0.7], 0.2 * H, 0.04 * H, {
        color: BONE_DK,
        bone: head,
        sides: 5,
      });
    }
    // central crest horn
    b.spike(L({ forward: 0.2, up: 0.17 }), [0, 1, -0.5], 0.3 * H, 0.05 * H, { color: BONE, bone: head, sides: 6 });
    // open jaws, varied
    b.pose(jaw, { axis: [1, 0, 0], deg: 12 + 6 * a + R() * 4 });
  }

  return b.root;
}
```