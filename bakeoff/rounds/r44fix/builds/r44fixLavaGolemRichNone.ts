import * as THREE from "three";
import { createBuilder, limb, paint, mix, noise, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Basalt Lava Golem",
  description: "A hulking golem of basalt plates with glowing molten seams, in a stylized Genshin-like look.",
};

const LAVA = "#ff7a1a";
const LAVA_HOT = "#ffd24a";
const LAVA_DEEP = "#e03a10";
const BASALT = paint((p, n) => {
  const k = noise(p, 0.25, 3);
  let c = mix("#2b2733", "#4a4455", k);
  c = mix(c, "#6a6070", smoothstep(0.5, 1, n.y) * 0.5);
  return mix(c, "#ff5a18", smoothstep(0.35, 0.0, p.y) * 0.55 * smoothstep(-0.2, 0.6, 1 - n.y));
});
const BASALT_LIGHT = "#686076";
const PLATE = paint((p, n) => mix(mix("#3a3544", "#5a5266", noise(p, 0.2, 9)), "#8a7f98", smoothstep(0.4, 1, n.y) * 0.4));

const EYES = svg(
  `<svg viewBox="0 0 100 30"><path d="M6 8 L42 16 L38 24 L8 20Z" fill="#ffe27a" stroke="#ff7a1a" stroke-width="3"/><path d="M94 8 L58 16 L62 24 L92 20Z" fill="#ffe27a" stroke="#ff7a1a" stroke-width="3"/></svg>`,
  { size: 256 },
);
const RUNE = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#fff0a0" stroke-width="4"/><path d="M32 10 L32 54 M14 24 L50 24 M18 44 L32 30 L46 44" stroke="#ffd24a" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "lavaGolem" });
  const hips = b.joint("hips", { at: [0, 1.25, 0], role: "spine" });

  const spine = b.chain(
    "spine",
    [[0, 1.25, 0], [0, 1.65, 0.08], [0, 2.05, 0.12]],
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const head = b.joint("head", { parent: chest, at: [0, 2.4, 0.2], dir: [0, 0.2, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.45, 0.32], dir: [0, 0, 1], role: "jaw" });

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const plate = (bone: any, at: number[], size: number[], rot: number[], color: any = PLATE) =>
    b.part(box(size[0], size[1], size[2]), color, { bone, at, rotation: rot, flat: true });
  const lava = (bone: any, at: number[], size: number[], rot: number[] = [0, 0, 0], str = 1.4, col = LAVA) =>
    glow(b.part(box(size[0], size[1], size[2]), col, { bone, at, rotation: rot }), str);

  // torso and pelvis
  b.sweep(spine, (t) => [0.5 - 0.05 * t + 0.15 * t * t, 0.38], { color: BASALT, section: { ngon: 8 } });
  b.part(new THREE.IcosahedronGeometry(0.5, 0), BASALT, { bone: hips, at: [0, 1.2, 0], scale: [1.1, 0.7, 0.9], flat: true });
  // chest plates
  for (const s of [1, -1]) {
    plate(chest, [s * 0.32, 2.15, 0.38], [0.5, 0.45, 0.16], [12, s * 18, s * -6]);
    plate(chest, [s * 0.3, 1.78, 0.4], [0.45, 0.32, 0.14], [-6, s * 14, s * 4]);
    plate(chest, [s * 0.42, 2.05, -0.25], [0.5, 0.7, 0.2], [0, s * -20, 0]);
    lava(chest, [s * 0.07, 1.95, 0.46], [0.03, 0.9, 0.05], [0, 0, s * 12]);
    lava(chest, [s * 0.58, 1.8, 0.2], [0.04, 0.5, 0.04], [0, 0, 0]);
    plate(hips, [s * 0.45, 1.05, 0.2], [0.35, 0.4, 0.4], [10, s * 15, 0]);
    lava(hips, [s * 0.28, 1.28, 0.38], [0.5, 0.035, 0.04], [0, 0, s * -15]);
  }
  // core
  glow(b.part(new THREE.CircleGeometry(0.16, 8), "#ffffff", { bone: chest, at: [0, 2.0, 0.5], dir: [0, 0, 1], axis: "z", texture: RUNE }), 1.6);
  glow(b.part(new THREE.TorusGeometry(0.2, 0.03, 4, 8), LAVA, { bone: chest, at: [0, 2.0, 0.49] }), 1.4);
  lava(hips, [0, 1.3, 0.38], [0.4, 0.05, 0.05], [0, 0, 0], 1.2, LAVA_DEEP);
  // back spikes
  for (let i = 0; i < 4; i++) {
    const y = 1.55 + i * 0.22;
    b.spike([0, y, -0.4 - 0.04 * i], [0, 0.5, -1], 0.42 - i * 0.04, 0.09, { bone: chest, color: BASALT_LIGHT });
    glow(b.spike([0, y - 0.02, -0.46 - 0.04 * i], [0, 0.5, -1], 0.22, 0.04, { bone: chest, color: LAVA }), 1.3);
  }

  // head
  b.part(new THREE.IcosahedronGeometry(0.3, 0), BASALT, { bone: head, at: [0, 2.55, 0.3], scale: [1.1, 0.85, 1.05], flat: true });
  plate(head, [0, 2.7, 0.28], [0.5, 0.12, 0.46], [-6, 0, 0], BASALT_LIGHT);
  plate(head, [0, 2.62, 0.52], [0.46, 0.08, 0.12], [-20, 0, 0], BASALT_LIGHT);
  glow(b.part(new THREE.PlaneGeometry(0.46, 0.14), "#ffffff", { bone: head, at: [0, 2.57, 0.545], dir: [0, 0, 1], axis: "z", texture: EYES }), 1.8);
  for (const s of [1, -1]) {
    b.spike([s * 0.22, 2.72, 0.2], [s * 0.8, 1, -0.5], 0.5, 0.07, { bone: head, color: BASALT_LIGHT });
    glow(b.spike([s * 0.2, 2.7, 0.2], [s * 0.8, 1, -0.5], 0.18, 0.04, { bone: head, color: LAVA }), 1.2);
  }
  // jaw
  b.part(box(0.4, 0.12, 0.34), BASALT, { bone: jaw, at: [0, 2.38, 0.42], flat: true });
  lava(jaw, [0, 2.44, 0.45], [0.34, 0.03, 0.28], [0, 0, 0], 1.6, LAVA_HOT);
  for (const s of [1, -1]) b.spike([s * 0.14, 2.43, 0.58], [0, 1, 0.2], 0.1, 0.03, { bone: jaw, color: "#d8c8b0" });
  b.part(box(0.36, 0.1, 0.1), BASALT, { bone: head, at: [0, 2.46, 0.52], flat: true });

  // legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb([s * 0.38, 1.2, 0], [s * 0.42, 0.22, 0.05], [0.58, 0.58], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, pts, { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" });
    b.sweep(leg, [0.25, 0.2], { color: BASALT, section: { ngon: 8 } });
    const knee = leg.joints[1];
    plate(knee, [s * 0.4, 0.72, 0.28], [0.34, 0.3, 0.2], [20, 0, 0]);
    glow(b.part(new THREE.TorusGeometry(0.22, 0.03, 4, 8), LAVA, { bone: knee, at: [s * 0.4, 0.62, 0.02], rotation: [90, 0, 0] }), 1.3);
    const foot = leg.tip!;
    b.part(box(0.46, 0.2, 0.7), BASALT, { bone: foot, at: [s * 0.42, 0.1, 0.18], flat: true });
    plate(foot, [s * 0.42, 0.22, 0.3], [0.4, 0.1, 0.34], [-8, 0, 0], BASALT_LIGHT);
    lava(foot, [s * 0.42, 0.04, 0.54], [0.36, 0.05, 0.04], [0, 0, 0], 1.4, LAVA_HOT);
    for (const k of [-1, 0, 1]) b.spike([s * 0.42 + k * 0.13, 0.12, 0.5], [0, 0.2, 1], 0.14, 0.05, { bone: foot, color: BASALT_LIGHT });
  }

  // arms
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh: number[] = [s * 0.78, 2.1, 0.05];
    const pts = limb(sh, [s * 1.3, 0.95, 0.2], [0.7, 0.7], [[0, 0, -1]]);
    const arm = b.chain(`arm${S}`, pts, { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" });
    b.sweep(arm, [0.22, 0.2], { color: BASALT, section: { ngon: 8 } });
    // shoulder boulder
    b.part(new THREE.DodecahedronGeometry(0.34, 0), PLATE, { bone: arm.joints[0], at: [s * 0.8, 2.25, 0.02], scale: [1.1, 0.8, 1], flat: true });
    glow(b.part(new THREE.TorusGeometry(0.3, 0.03, 4, 8), LAVA, { bone: arm.joints[0], at: [s * 0.82, 2.08, 0.04], rotation: [90, 0, 0] }), 1.3);
    b.spike([s * 0.85, 2.5, 0], [s * 0.4, 1, -0.2], 0.3, 0.07, { bone: arm.joints[0], color: BASALT_LIGHT });
    // forearm plate and seam
    plate(arm.joints[1], [s * 1.1, 1.5, 0.12], [0.2, 0.5, 0.36], [0, 0, s * 8]);
    lava(arm.joints[1], [s * 1.04, 1.5, 0.3], [0.03, 0.42, 0.03], [0, 0, s * 8]);
    // fist
    const hand = arm.tip!;
    b.part(new THREE.DodecahedronGeometry(0.3, 0), BASALT, { bone: hand, at: [s * 1.32, 0.78, 0.22], scale: [1, 1.1, 1], flat: true });
    for (const k of [-1, 0, 1]) lava(hand, [s * 1.32 + k * 0.1, 0.62, 0.45], [0.06, 0.05, 0.05], [0, 0, 0], 1.5, LAVA_HOT);
  }

  return b.root;
}
