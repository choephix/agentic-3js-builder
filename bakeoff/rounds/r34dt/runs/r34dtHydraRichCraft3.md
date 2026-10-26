```ts
import * as THREE from "three";
import { createBuilder, catmull, paint, mix, noise, smoothstep, countershade, scales, svg, rng, offset } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Five-Headed Hydra",
  description: "A scarred, armoured five-headed hydra with glowing eyes, bone horns and a heavy tail, in a grim God of War style.",
};

const SCALE_DARK = "#1f2a24";
const BONE = "#cfc3a4";
const BLOOD = "#7a1812";
const EMBER = "#ff7a1e";
const TEETH = "#ece3c8";
const HORN = "#3b3228";

const hide = countershade(
  scales(["#2f4034", "#34493b", "#28372d"], "#121a15", { size: 0.14, width: 0.14, seed: 3 }),
  paint((p, n) => mix("#b9a77a", "#6f6a4c", noise(p, 0.2, 5))),
  { level: -0.25 },
);
const belly = scales(["#b9a77a", "#a8966a"], "#5b5035", { size: 0.12, seed: 4 });
const rock = paint((p, n) => mix("#4a4640", "#6d675d", noise(p, 0.3, 2) * smoothstep(-0.2, 0.9, n.y)));

const EYE = svg(
  `<svg viewBox="0 0 64 40"><path d="M2 20 Q32 -6 62 20 Q32 40 2 20Z" fill="#ff9a1a" stroke="#1a0c06" stroke-width="4"/><ellipse cx="32" cy="20" rx="5" ry="14" fill="#1a0c06"/></svg>`,
  { size: 128 },
);
const WAR = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 4 L40 28 L60 32 L40 38 L32 60 L24 38 L4 32 L24 28Z" fill="none" stroke="#c8301c" stroke-width="5" stroke-linejoin="round"/><path d="M32 18 V46 M20 32 H44" stroke="#c8301c" stroke-width="4"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "hydra" });
  const R = rng(11);

  // ---- skeleton
  const hips = b.joint("hips", { at: [0, 0.95, -0.9], role: "spine" });
  const spineC = b.chain("spine", catmull([[0, 0.95, -0.9], [0, 1.05, -0.2], [0, 1.25, 0.5], [0, 1.35, 1.0]]), {
    parent: hips, count: 4, role: "spine",
  });
  const chest = spineC.joints[3];

  // body
  b.sweep(spineC, (t) => [0.55 + 0.15 * Math.sin(t * 3), 0.5 + 0.12 * Math.sin(t * 3)], {
    color: hide, sectors: [[120, 240, belly]], caps: "round", sides: 10,
  });

  // tail
  const tail = b.chain("tail", catmull([[0, 0.95, -0.9], [0, 0.8, -1.8], [0.3, 0.5, -2.7], [0.1, 0.3, -3.5], [-0.3, 0.3, -4.2]]), {
    parent: hips, count: 5, role: "tail",
  });
  b.sweep(tail, (t) => 0.4 * (1 - t) + 0.05, { color: hide, sides: 8, caps: "round" });
  b.along(tail, 5, (at) => b.spike(at, at, 0.2, 0.06, { color: BONE }));
  // tail blade
  b.extrude([[0, 0], [0.25, 0.1], [0.6, 0], [0.25, -0.12]], {
    at: tail.at(1).at, x: [-0.3, 0, -1], thickness: [0.03, 0.01], color: "#8a8a92", bone: tail.tip ?? tail.joints[4],
  });

  // back spines & war emblem
  const topLine = spineC;
  b.along(topLine, 7, (at) => b.spike(at, [0, 1, -0.2], 0.28, 0.07, { color: BONE }));
  b.decal(chest, WAR, { at: [0.0, 1.25, 1.0], dir: [0, 0, 1], size: [0.4, 0.4], bone: chest });
  b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", {
    bone: chest, at: [0, 1.5, 1.38], dir: [0, 0, 1], axis: "z", texture: WAR,
  });

  // legs
  for (const s of [1, -1]) {
    for (const [z, nm] of [[0.7, "F"], [-1.1, "H"]] as const) {
      const hip = [s * 0.6, 1.0, z] as [number, number, number];
      const knee = [s * 0.85, 0.55, z + 0.15];
      const foot = [s * 0.8, 0.08, z + 0.3];
      const leg = b.chain(`leg${nm}${s > 0 ? "L" : "R"}`, catmull([hip, knee, foot]), {
        parent: z > 0 ? chest : hips, names: [`hip${nm}${s > 0 ? "L" : "R"}`, `knee${nm}${s > 0 ? "L" : "R"}`, `ankle${nm}${s > 0 ? "L" : "R"}`],
        role: "leg",
      });
      b.sweep(leg, [0.26, 0.12], { color: hide, sides: 8 });
      b.part(new THREE.BoxGeometry(0.36, 0.14, 0.5), SCALE_DARK, { bone: leg.tip ?? leg.joints[2], at: [s * 0.8, 0.07, z + 0.4] });
      for (let k = -1; k <= 1; k++)
        b.spike([s * 0.8 + k * 0.12, 0.08, z + 0.62], [0, -0.2, 1], 0.16, 0.05, { color: BONE, bone: leg.tip ?? leg.joints[2] });
    }
  }

  // ---- five heads on necks
  const sp = [-70, -35, 0, 35, 70];
  const lens = [1.5, 1.8, 2.0, 1.8, 1.5];
  sp.forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const dx = Math.sin(a), dz = Math.cos(a);
    const len = lens[i];
    const base: [number, number, number] = [dx * 0.3, 1.45, 1.0];
    const mid: [number, number, number] = [dx * 0.8, 1.9 + i % 2 * 0.2, 1.4 + dz * 0.2];
    const up: [number, number, number] = [dx * 1.5, 2.5 + len * 0.3, 1.5 + dz * 0.4];
    const tip: [number, number, number] = [dx * 1.9, 2.6 + len * 0.35, 1.9 + dz * 0.6];
    const nk = b.chain(`neck${i}`, catmull([base, mid, up, tip]), { parent: chest, count: 4, role: "neck" });
    b.sweep(nk, (t) => 0.2 - 0.06 * t, { color: hide, sectors: [[130, 230, belly]], sides: 8, caps: "none" });
    b.along(nk, 4, (at) => b.spike(at, at, 0.15, 0.04, { color: BONE }));

    const dir = [dx * 0.5, -0.1, 1] as [number, number, number];
    const head = b.joint(`head${i}`, { parent: nk.joints[3], at: tip, dir, role: "head" });
    const jaw = b.joint(`jaw${i}`, { parent: head, at: head.local([0, 0.02, -0.04]), aim: head.local([0, 0.4, -0.05]), role: "jaw" });
    b.part(new THREE.BoxGeometry(0.34, 0.26, 0.3), hide, { bone: head, at: tip });
    b.frustumBox(offset(tip, [0, 0, 1], 0.1), offset(tip, [0, 0, 1], 0.55), [0.3, 0.2], [0.2, 0.12], {
      bone: head, color: hide,
    });
    // lower jaw
    b.frustumBox(offset(tip, [0, -0.12, 1], 0.05), offset(tip, [0, -0.12, 1], 0.5), [0.26, 0.07], [0.16, 0.05], {
      bone: jaw, color: belly,
    });
    for (const sd of [1, -1]) {
      for (let k = 0; k < 3; k++) {
        b.spike([tip[0] + sd * 0.08, tip[1] - 0.06, tip[2] + 0.25 + k * 0.1], [0, -1, 0], 0.07, 0.015, { color: TEETH, bone: head });
        b.spike([tip[0] + sd * 0.07, tip[1] - 0.1, tip[2] + 0.25 + k * 0.1], [0, 1, 0], 0.06, 0.013, { color: TEETH, bone: jaw });
      }
      // eyes
      glow(
        b.part(new THREE.PlaneGeometry(0.14, 0.09), "#ffffff", {
          bone: head, at: [tip[0] + sd * 0.14, tip[1] + 0.08, tip[2] + 0.2], dir: [sd * 0.5, 0, 1], axis: "z", texture: EYE,
        }),
        1.5,
      );
      // horns
      b.sprout(`horn${i}${sd > 0 ? "L" : "R"}`, frameAt(tip, sd), catmull([
        [tip[0] + sd * 0.15, tip[1] + 0.12, tip[2] - 0.05],
        [tip[0] + sd * 0.3, tip[1] + 0.25, tip[2] - 0.2],
        [tip[0] + sd * 0.35, tip[1] + 0.5, tip[2] - 0.45],
      ]), [0.06, 0.01], { count: 0, color: HORN, caps: { end: "point" }, bone: head } as any);
      // nostrils
      b.part(new THREE.SphereGeometry(0.02, 5, 4), "#0a0806", { bone: head, at: [tip[0] + sd * 0.05, tip[1] + 0.02, tip[2] + 0.64] });
    }
    // crest spines
    for (let k = 0; k < 3; k++)
      b.spike([tip[0], tip[1] + 0.13, tip[2] - 0.05 - k * 0.08], [0, 1, -0.5], 0.16 - k * 0.03, 0.04, { color: BONE, bone: head });
    // blood drip on mouth
    b.part(new THREE.SphereGeometry(0.03, 5, 4), BLOOD, { bone: jaw, at: [tip[0] + 0.05, tip[1] - 0.2, tip[2] + 0.45] });
    b.pose(jaw, { axis: [1, 0, 0], deg: 12 + (i % 2) * 8 });
  });

  // scars / wounds with glowing embers on the flank
  for (const s of [1, -1]) {
    glow(b.part(new THREE.BoxGeometry(0.04, 0.3, 0.02), EMBER, { bone: hips, at: [s * 0.62, 1.15, -0.4], rotation: [0, 0, s * 25] }), 1.4);
    glow(b.part(new THREE.BoxGeometry(0.03, 0.22, 0.02), EMBER, { bone: hips, at: [s * 0.6, 1.0, -0.6], rotation: [0, 0, -s * 30] }), 1.4);
  }
  // armour plates on back
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.BoxGeometry(0.7, 0.05, 0.3), "#3b3b40", {
      bone: hips, at: [0, 1.58 + 0.04 * i, -0.8 + i * 0.5], rotation: [-8, 0, 0],
    });
  }

  // rocky ground slab under the beast footprint
  b.part(new THREE.CylinderGeometry(2.4, 2.6, 0.05, 10), rock, { bone: hips, at: [0, 0.0, -0.4], flat: true });

  return b.root;

  function frameAt(tip: number[], sd: number) {
    return [tip[0] + sd * 0.15, tip[1] + 0.12, tip[2] - 0.05] as [number, number, number];
  }
}
```