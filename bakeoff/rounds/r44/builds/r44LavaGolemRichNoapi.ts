// Lava golem: hulking basalt plates over a molten core, cel-shaded in a Genshin-style palette.
import * as THREE from "three";
import { createBuilder, frame, rng, catmull, polyline, limb, paint, cells, mix, smoothstep, svg } from "../../../../src/index";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Lava Golem",
  description:
    "A 2.7 m basalt golem with plated shoulders, glowing molten seams, a caged magma core, horned brow and flame crown.",
};

const LAVA = "#ff7a1c";
const LAVA_Y = "#ffd04a";
const BASALT = cel("#565a78", "#2c2e4a");
const BASALT_L = cel("#767b98", "#3c3f5e");
const BASALT_D = cel("#2f3150", "#1a1b30");
const OBS = cel("#3a3c5c", "#202238");

// basalt with a Worley crack network of molten seams, warmer toward the ground
const CRACKED = paint((p, n) => {
  const c = cells(p, 0.2, 4);
  const e = c.d2 - c.d1;
  if (e < 0.07) return e < 0.03 ? LAVA_Y : LAVA;
  const base = n.y > 0.4 ? BASALT_L : BASALT;
  return p.y < 0.35 ? mix("#2c2e4a", "#7a3a22", smoothstep(0.35, 0, p.y)) : base;
});

const EYE = svg(
  `<svg viewBox="0 0 64 32"><path d="M2 24 L26 8 L30 22 Z" fill="#ffd04a"/><path d="M62 24 L38 8 L34 22 Z" fill="#ffd04a"/>
  <path d="M8 22 L25 12 L27 20 Z" fill="#fff6c8"/><path d="M56 22 L39 12 L37 20 Z" fill="#fff6c8"/></svg>`,
  { size: 256 },
);
const FLAME = svg(
  `<svg viewBox="0 0 40 80"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffd04a"/><stop offset="0.6" stop-color="#ff7a1c"/><stop offset="1" stop-color="#d8301c"/></linearGradient></defs>
  <path d="M20 79 C2 62 4 40 14 28 C14 40 20 40 20 30 C22 18 20 8 22 1 C32 18 38 40 36 56 C34 68 28 74 20 79Z" fill="url(#g)"/></svg>`,
  { size: 128 },
);
const RUNE = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#fff0a0" stroke-width="4"/>
  <path d="M32 8 L32 56 M16 20 L32 34 L48 20 M18 46 L46 46" stroke="#fff0a0" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
  { size: 192 },
);

type P = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "lavaGolem" });
  const R = rng(7);

  // ---------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.25, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 1.25, 0], [0, 1.5, 0.02], [0, 1.78, 0.06], [0, 2.0, 0.08]]), {
    parent: hips, names: ["spine1", "spine2", "chest"], role: "spine",
  });
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 2.02, 0.1], aim: [0, 2.12, 0.14], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 2.12, 0.14], aim: [0, 2.3, 0.2], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.14, 0.0], aim: [0, 2.1, 0.4], role: "jaw" });

  const legs: Record<string, ReturnType<typeof b.chain>> = {};
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const pts = limb([s * 0.32, 1.2, 0], [s * 0.38, 0.17, 0.05], [0.55, 0.55], [0, 0, 1]);
    legs[L] = b.chain(`leg${L}`, polyline(pts), { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg" });
  }
  const arms: Record<string, { ch: ReturnType<typeof b.chain>; wr: THREE.Vector3 }> = {};
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const pts: P[] = [[s * 0.7, 1.95, 0], [s * 1.05, 1.4, 0.1], [s * 1.2, 0.85, 0.22]];
    const ch = b.chain(`arm${L}`, polyline(pts), { parent: chest, names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`], role: "arm" });
    arms[L] = { ch, wr: new THREE.Vector3(...pts[2]) };
  }

  // ---------------- helpers
  const rock = (bone: any, at: P, sc: P, rot: P, color: any, det = 0) =>
    b.part(new THREE.IcosahedronGeometry(1, det), color, { bone, at, scale: sc, rotation: rot, flat: true });
  const slab = (bone: any, at: P, sz: P, rot: P, color: any) =>
    b.part(new THREE.BoxGeometry(...sz), color, { bone, at, rotation: rot, flat: true });
  const seam = (bone: any, pts: P[], r = 0.022) =>
    glow(b.sweep(catmull(pts), r, { bone, color: LAVA, sides: 4, caps: "round" }), 1.4);
  const flame = (bone: any, at: P, w: number, h: number) =>
    glow(b.cards([frame(at, [0, 1, 0])], FLAME, { size: [w, h], lean: 0, flow: [0, 0, 1], cross: true, bone, sink: 0.05 }), 1.3);

  // ---------------- torso
  b.loft(
    [
      { at: [0, 1.2, 0], w: 0.72, h: 0.5 },
      { at: [0, 1.4, 0.01], w: 0.8, h: 0.6 },
      { at: [0, 1.68, 0.04], w: 1.2, h: 0.78 },
      { at: [0, 1.95, 0.08], w: 1.3, h: 0.7 },
      { at: [0, 2.1, 0.1], w: 0.7, h: 0.5 },
    ],
    { bone: [spine, hips], color: CRACKED, sides: 8, smooth: false, caps: { start: "flat", end: "flat" } },
  );
  // molten belly glow band and core
  glow(b.part(new THREE.IcosahedronGeometry(0.24, 1), "#ffffff", { bone: chest, at: [0, 1.65, 0.36], texture: RUNE, flat: true }), 1.5);
  b.part(new THREE.TorusGeometry(0.3, 0.04, 5, 8), OBS, { bone: chest, at: [0, 1.65, 0.4], flat: true });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.spike([Math.cos(a) * 0.3, 1.65 + Math.sin(a) * 0.3, 0.42], [Math.cos(a), Math.sin(a), 0.5], 0.12, 0.035, { color: BASALT_D, bone: chest, sides: 4 });
  }
  seam(chest, [[-0.5, 1.9, 0.36], [-0.3, 1.78, 0.4], [-0.25, 1.7, 0.4]]);
  seam(chest, [[0.5, 1.9, 0.36], [0.3, 1.78, 0.4], [0.25, 1.7, 0.4]]);
  seam(hips, [[-0.3, 1.4, 0.3], [-0.12, 1.3, 0.34], [0.12, 1.3, 0.34], [0.3, 1.4, 0.3]]);
  // pelvis plates
  for (const s of [1, -1]) slab(hips, [s * 0.38, 1.25, 0.22], [0.34, 0.3, 0.12], [-10, s * -20, s * 8], BASALT);
  slab(hips, [0, 1.15, 0.28], [0.4, 0.34, 0.1], [-8, 0, 0], BASALT_L);
  // chest plates
  for (const s of [1, -1]) {
    slab(chest, [s * 0.36, 1.95, 0.34], [0.5, 0.3, 0.14], [-14, s * -14, s * 10], BASALT_L);
    slab(chest, [s * 0.5, 1.5, 0.22], [0.3, 0.34, 0.14], [-6, s * -30, 0], BASALT);
  }
  // back plates and vents
  for (let i = 0; i < 5; i++) {
    const y = 1.35 + i * 0.17;
    slab(chest, [0, y, -0.4 - 0.02 * i], [0.9 - i * 0.06, 0.18, 0.14], [18, 0, 0], i % 2 ? BASALT : BASALT_L);
  }
  for (const [x, y, l] of [[-0.3, 1.75, 0.5], [0, 1.95, 0.7], [0.3, 1.7, 0.5], [-0.15, 1.5, 0.35], [0.18, 1.5, 0.35]] as [number, number, number][]) {
    glow(b.spike([x, y, -0.5], [x * 0.3, 1, -0.5], l, 0.07, { color: LAVA, bone: chest, sides: 5 }), 1.3);
    b.spike([x, y - 0.05, -0.48], [x * 0.3, 1, -0.5], l * 0.5, 0.11, { color: BASALT_D, bone: chest, sides: 5 });
  }
  seam(chest, [[0, 1.3, -0.5], [0.05, 1.6, -0.52], [0, 1.95, -0.52]], 0.03);
  flame(chest, [0, 2.0, -0.45], 0.4, 0.7);

  // ---------------- shoulders
  for (const s of [1, -1]) {
    rock(chest, [s * 0.78, 2.1, 0], [0.4, 0.28, 0.36], [0, 0, s * 15], BASALT_L, 1);
    rock(chest, [s * 0.86, 2.0, 0.02], [0.44, 0.22, 0.4], [0, 0, s * 30], BASALT);
    for (const [dx, dz, l] of [[0, 0, 0.4], [-0.15, 0.15, 0.28], [0.15, -0.15, 0.28]] as [number, number, number][]) {
      b.spike([s * 0.8 + dx * s, 2.28, dz], [s * 0.3, 1, 0], l, 0.075, { color: OBS, bone: chest, sides: 5 });
    }
    seam(chest, [[s * 0.6, 2.2, 0.2], [s * 0.8, 2.22, 0.15], [s * 0.98, 2.1, 0.12]]);
    flame(chest, [s * 0.78, 2.3, -0.1], 0.2, 0.36);
  }

  // ---------------- head
  const HX = 0.33;
  b.part(new THREE.BoxGeometry(0.64, 0.42, 0.5), CRACKED, { bone: head, at: [0, 2.35, 0.2], flat: true });
  slab(head, [0, 2.52, 0.34], [0.72, 0.12, 0.3], [-14, 0, 0], BASALT_D); // brow ridge
  slab(head, [0, 2.46, 0.42], [0.66, 0.1, 0.1], [0, 0, 0], BASALT);
  b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", { bone: head, at: [0, 2.38, 0.452], dir: [0, 0, 1], axis: "z", texture: EYE });
  const eyeMesh = b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", { bone: head, at: [0, 2.38, 0.455], dir: [0, 0, 1], axis: "z", texture: EYE });
  glow(eyeMesh, 1.6);
  for (const s of [1, -1]) {
    b.spike([s * HX, 2.5, 0.1], [s * 1, 0.8, -0.3], 0.55, 0.09, { color: OBS, bone: head, sides: 5 });
    b.spike([s * 0.38, 2.4, 0.0], [s * 1, 0.1, -0.6], 0.3, 0.06, { color: BASALT, bone: head, sides: 5 });
    rock(head, [s * 0.34, 2.3, 0.2], [0.07, 0.14, 0.18], [0, 0, 0], BASALT_D);
  }
  b.spike([0, 2.56, 0.1], [0, 1, 0.2], 0.3, 0.07, { color: BASALT_L, bone: head, sides: 5 });
  flame(head, [0, 2.56, 0.0], 0.26, 0.5);
  // mouth: glow cavity, lower jaw with teeth
  b.part(new THREE.BoxGeometry(0.5, 0.1, 0.4), LAVA, { bone: jaw, at: [0, 2.14, 0.22], flat: true });
  glow(b.part(new THREE.BoxGeometry(0.46, 0.04, 0.36), LAVA_Y, { bone: jaw, at: [0, 2.17, 0.22], flat: true }), 1.5);
  b.part(new THREE.BoxGeometry(0.54, 0.14, 0.46), CRACKED, { bone: jaw, at: [0, 2.07, 0.22], flat: true });
  b.part(new THREE.BoxGeometry(0.4, 0.14, 0.12), BASALT_D, { bone: jaw, at: [0, 2.03, 0.5], rotation: [-20, 0, 0], flat: true });
  for (let i = 0; i < 5; i++) {
    const x = -0.2 + i * 0.1;
    b.spike([x, 2.13, 0.45], [0, 1, 0.1], 0.09, 0.03, { color: "#e8e0d0", bone: jaw, sides: 4 });
    b.spike([x, 2.27, 0.45], [0, -1, 0.1], 0.08, 0.03, { color: "#e8e0d0", bone: head, sides: 4 });
  }
  // neck
  b.part(new THREE.BoxGeometry(0.4, 0.2, 0.36), BASALT, { bone: neck, at: [0, 2.12, 0.1], flat: true });

  // ---------------- legs
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const ch = legs[L];
    b.sweep(ch, [0.2, 0.17, 0.14, 0.15], { color: CRACKED, sides: 7, smooth: false, caps: { start: "round", end: "flat" } });
    const k = ch.at(0.5);
    rock(ch.joints[1], [k.at.x, k.at.y, k.at.z + 0.15], [0.2, 0.2, 0.16], [0, 0, 0], BASALT_L, 1);
    b.spike([k.at.x, k.at.y, k.at.z + 0.22], [0, 0.2, 1], 0.2, 0.06, { color: OBS, bone: ch.joints[1], sides: 4 });
    const a = ch.joints[2];
    // greave
    slab(ch.joints[1], [s * 0.36, 0.55, 0.12], [0.34, 0.4, 0.3], [0, 0, 0], BASALT);
    slab(ch.joints[1], [s * 0.36, 0.9, 0.1], [0.3, 0.14, 0.28], [0, 0, 0], BASALT_L);
    seam(ch.joints[1], [[s * 0.28, 0.9, 0.26], [s * 0.34, 0.7, 0.28], [s * 0.38, 0.45, 0.24]], 0.018);
    // foot
    b.part(new THREE.BoxGeometry(0.42, 0.22, 0.6), CRACKED, { bone: a, at: [s * 0.38, 0.11, 0.15], flat: true });
    slab(a, [s * 0.38, 0.2, 0.0], [0.38, 0.14, 0.3], [-10, 0, 0], BASALT_L);
    for (const dx of [-0.13, 0, 0.13]) {
      b.part(new THREE.BoxGeometry(0.12, 0.12, 0.18), BASALT_D, { bone: a, at: [s * 0.38 + dx, 0.06, 0.5], flat: true });
      b.spike([s * 0.38 + dx, 0.07, 0.58], [0, 0, 1], 0.1, 0.05, { color: "#e8e0d0", bone: a, sides: 4 });
    }
  }

  // ---------------- arms
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const { ch, wr } = arms[L];
    b.sweep(ch, [0.17, 0.2, 0.18, 0.16], { color: CRACKED, sides: 7, smooth: false, caps: { start: "round", end: "flat" } });
    const el = ch.joints[1];
    rock(el, [s * 1.1, 1.4, -0.08], [0.2, 0.22, 0.2], [0, 0, 0], BASALT_L, 1);
    b.spike([s * 1.12, 1.42, -0.2], [s * 0.5, 0.2, -1], 0.35, 0.08, { color: OBS, bone: el, sides: 5 });
    seam(el, [[s * 0.85, 1.75, 0.15], [s * 0.98, 1.55, 0.2], [s * 1.06, 1.3, 0.2]], 0.02);
    // forearm bracer plates
    slab(el, [s * 1.14, 1.05, 0.2], [0.34, 0.36, 0.3], [0, 0, s * -6], BASALT);
    // fist
    const hand = ch.tip ?? ch.joints[2];
    rock(hand, [wr.x, wr.y - 0.1, wr.z], [0.26, 0.24, 0.24], [0, 20, 0], BASALT_L, 1);
    for (const [i, dz] of [-0.12, 0, 0.12].entries()) {
      const p0 = new THREE.Vector3(wr.x, wr.y - 0.2, wr.z + dz);
      const f = b.chain(`finger${L}${i + 1}`, polyline([p0, p0.clone().add(new THREE.Vector3(0, -0.14, 0.05)), p0.clone().add(new THREE.Vector3(0, -0.24, 0.0))]), {
        parent: hand, count: 2, role: "digit", names: (k: number) => `finger${L}${i + 1}_${k + 1}`,
      });
      b.sweep(f, [0.07, 0.05], { color: BASALT, sides: 4, smooth: false, caps: "round" });
      b.spike(f.at(1).at, [0, -1, 0.1], 0.08, 0.04, { color: LAVA_Y, bone: f.joints[1], sides: 4 });
    }
    const th = b.chain(`thumb${L}`, polyline([[wr.x - s * 0.12, wr.y - 0.1, wr.z + 0.1], [wr.x - s * 0.18, wr.y - 0.2, wr.z + 0.2], [wr.x - s * 0.16, wr.y - 0.28, wr.z + 0.28]]), {
      parent: hand, count: 2, role: "digit", names: (k: number) => `thumb${L}${k + 1}`,
    });
    b.sweep(th, [0.07, 0.05], { color: BASALT, sides: 4, smooth: false, caps: "round" });
    seam(hand, [[wr.x - 0.1, wr.y - 0.05, wr.z + 0.2], [wr.x, wr.y - 0.1, wr.z + 0.24], [wr.x + 0.1, wr.y - 0.05, wr.z + 0.2]], 0.015);
  }

  // scattered loose basalt chips and embers around the hips for scale and silhouette
  for (let i = 0; i < 6; i++) {
    const a = R() * Math.PI * 2;
    glow(b.part(new THREE.OctahedronGeometry(0.03 + R() * 0.02, 0), LAVA_Y, {
      bone: hips, at: [Math.cos(a) * 0.55, 1.1 + R() * 0.8, Math.sin(a) * 0.5], flat: true,
    }), 1.5);
  }

  return b.root;
}
