import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { cells, noise, paint } from "../../../../src/paint";
import { polyline } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Red Panda on a Mossy Stone",
  description:
    "A cel-shaded red panda with a ringed tail, big anime eyes and a gold-belled ribbon, balancing on a moss-covered boulder dotted with glowing dendro blossoms.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// Palette
const RUST = cel("#e4602a");
const RUST_D = cel("#c2411f", "#8e2a2e");
const BELLY = cel("#4b2a24", "#2c1a2e");
const CREAM = cel("#fff2d8", "#f1cfaa");
const NOSE = cel("#2b1730", INK);
const STONE_A = cel("#8d93a6");
const STONE_B = cel("#aab0c2");
const CRACK = "#3d3f55";
const MOSS_A = cel("#5fb23a");
const MOSS_B = cel("#a4dc58");
const RIBBON = cel("#d8284a");
const GOLD = cel("#ffd35a", "#e09a2c");
const CLAW = "#f4e6c8";

export default function build() {
  const b = createBuilder({ name: "redPanda" });
  const R = rng(11);

  // ---------- Textures ----------
  const tuft = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 0 C21 20 25 44 32 64 L0 64 C7 44 11 20 16 0Z" fill="#fff"/></svg>`,
    { size: 64 },
  );
  const EYE = animeEye({ iris: "#ffb21e", irisLight: "#fff08a", blush: "#ff8aa8" });

  // ---------- Stone ----------
  const stonePaint = cel(
    paint((p, n) => {
      const c = cells(p, 0.1, 5);
      if (c.d2 - c.d1 < 0.007) return CRACK;
      const mossLine = 0.3 + (noise(p, 0.07, 2) - 0.5) * 0.5;
      if (n.y > mossLine) return noise(p, 0.05, 8) > 0.55 ? MOSS_B : MOSS_A;
      return noise(p, 0.08, 4) > 0.5 ? STONE_A : STONE_B;
    }),
  );
  const stone = b.part(new THREE.SphereGeometry(1, 14, 9), stonePaint, {
    at: [0, 0.16, 0],
    scale: [0.32, 0.17, 0.26],
  });
  const lump1 = b.part(new THREE.SphereGeometry(1, 10, 7), stonePaint, {
    at: [0.22, 0.07, 0.2],
    scale: [0.14, 0.09, 0.12],
  });
  const lump2 = b.part(new THREE.SphereGeometry(1, 10, 7), stonePaint, {
    at: [-0.24, 0.06, -0.12],
    scale: [0.13, 0.08, 0.14],
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), stonePaint, { at: [-0.18, 0.04, 0.24], scale: [0.07, 0.045, 0.06] });
  b.part(new THREE.SphereGeometry(1, 8, 6), stonePaint, { at: [0.08, 0.035, -0.3], scale: [0.08, 0.05, 0.06] });

  // moss tufts and clumps
  const stoneSkin = b.surface([stone, lump1, lump2]);
  const mossHits = stoneSkin.scatter(150, { rng: rng(21), minDist: 0.03, filter: (h) => h.n.y > 0.55 });
  b.cards(mossHits, tuft, { size: [0.022, 0.035], lean: 25, vary: 0.35, spin: 180, rng: rng(22), color: "#6cc03e", cross: true });
  const clumpHits = stoneSkin.scatter(16, { rng: rng(23), minDist: 0.08, filter: (h) => h.n.y > 0.5 });
  for (const h of clumpHits) {
    b.stick(new THREE.SphereGeometry(0.03, 6, 4).scale(1, 0.55, 1), MOSS_B, h);
  }
  // hanging moss on the sides
  const dripHits = stoneSkin.scatter(40, { rng: rng(24), minDist: 0.05, filter: (h) => h.n.y > 0.1 && h.n.y < 0.5 });
  b.cards(dripHits, tuft, { size: [0.018, 0.04], lean: 140, flow: [0, 0, 1], vary: 0.4, rng: rng(25), color: "#4f9f34" });

  // ---------- Panda body ----------
  const coat = cel(furEdge(RUST, BELLY, { axis: [0, 1, 0], level: -0.3, teeth: 0.22, period: 0.03, ink: INK }));
  const body = b.capsule([0, 0.43, -0.13], [0, 0.44, 0.1], [0.095, 0.085], { color: coat, sides: 10 });
  // haunches and shoulders
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 7), RUST, { at: [s * 0.075, 0.425, -0.13], scale: [0.06, 0.075, 0.09] });
    b.part(new THREE.SphereGeometry(1, 8, 6), RUST_D, { at: [s * 0.07, 0.46, 0.04], scale: [0.045, 0.045, 0.07] });
  }
  // darker saddle stripe along the back
  b.sweep([[0, 0.525, -0.18], [0, 0.535, -0.02], [0, 0.528, 0.12]], 0.012, { color: RUST_D, caps: "round" });

  // fur tufts
  const furHits = b.surface(body).scatter(150, { rng: rng(31), minDist: 0.022, filter: (h) => h.n.y > 0.15 });
  b.cards(furHits, tuft, { size: [0.026, 0.045], lean: 62, bend: 25, vary: 0.3, rng: rng(32), color: "#f27434" });
  const bellyHits = b.surface(body).scatter(60, { rng: rng(33), minDist: 0.025, filter: (h) => h.n.y < -0.3 });
  b.cards(bellyHits, tuft, { size: [0.022, 0.04], lean: 70, vary: 0.3, rng: rng(34), color: "#5c3329" });

  // ---------- Legs ----------
  for (const s of [1, -1]) {
    // front
    b.capsule([s * 0.065, 0.4, 0.1], [s * 0.065, 0.318, 0.145], [0.034, 0.027], { color: BELLY, sides: 8 });
    b.part(new THREE.SphereGeometry(1, 8, 6), BELLY, { at: [s * 0.065, 0.31, 0.16], scale: [0.034, 0.017, 0.045] });
    // hind
    b.capsule([s * 0.075, 0.4, -0.13], [s * 0.07, 0.318, -0.145], [0.045, 0.03], { color: BELLY, sides: 8 });
    b.part(new THREE.SphereGeometry(1, 8, 6), BELLY, { at: [s * 0.07, 0.31, -0.12], scale: [0.036, 0.017, 0.058] });
    // claws
    for (const [pz, px] of [[0.2, 0.065], [-0.17, 0.07]] as const) {
      for (const k of [-1, 0, 1]) {
        b.spike([s * px + k * 0.016, 0.31, pz], [0, -0.15, 1], 0.016, 0.005, CLAW, { sides: 5 });
      }
    }
  }

  // ---------- Tail ----------
  const tailPath = [
    [0, 0.45, -0.2],
    [0.01, 0.44, -0.36],
    [0.1, 0.5, -0.5],
    [0.2, 0.62, -0.54],
    [0.25, 0.75, -0.47],
  ];
  b.sweep(tailPath, [0.04, 0.052, 0.056, 0.046, 0.03, 0.012], {
    color: (t) => (t > 0.94 ? BELLY : Math.floor(t * 10) % 2 ? RUST_D : RUST),
    sides: 9,
    caps: "round",
  });
  // gold tail ring
  b.part(new THREE.TorusGeometry(0.043, 0.006, 5, 12), GOLD, { at: [0.005, 0.445, -0.28], rotation: [-6, 0, 0] });

  // ---------- Head ----------
  const HEAD_C: [number, number, number] = [0, 0.53, 0.25];
  const facePaint = cel(
    paint((p, n) => {
      const dx = Math.abs(p.x);
      const dy = p.y - HEAD_C[1];
      if (dx > 0.04 + 0.008 * zigzag(dy / 0.018) && dy < 0.018 && p.z > 0.2) return CREAM;
      if (Math.abs(p.x) < 0.012 && n.y > 0.5) return RUST_D;
      return RUST;
    }),
  );
  const head = b.part(new THREE.SphereGeometry(1, 16, 12), facePaint, { at: HEAD_C, scale: [0.095, 0.075, 0.082] });
  const skin = b.surface(head);
  for (const s of [1, -1]) {
    const hit = skin.around(HEAD_C).at(s * 33, 6);
    if (hit) b.decal(skin, EYE, { at: hit, size: [0.038, 0.052], mirror: s > 0 });
  }
  // tear marks
  for (const s of [1, -1]) {
    const tear = skin.drape(
      polyline([
        [s * 0.05, 0.525, 0.31],
        [s * 0.046, 0.5, 0.322],
        [s * 0.036, 0.482, 0.325],
      ]),
      { lift: 0.002 },
    );
    b.sweep(tear, 0.004, { color: BELLY, caps: "round", sides: 5 });
  }
  // muzzle, nose, mouth
  b.part(new THREE.SphereGeometry(1, 10, 8), CREAM, { at: [0, 0.505, 0.3], scale: [0.042, 0.032, 0.044] });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, { at: [0, 0.513, 0.342], scale: [0.016, 0.011, 0.012] });
  b.rod([0, 0.502, 0.341], [0, 0.488, 0.337], 0.0022, INK, { sides: 4 });
  for (const s of [1, -1]) {
    b.rod([0, 0.488, 0.337], [s * 0.016, 0.481, 0.328], 0.0022, INK, { sides: 4 });
    // brow spot
    b.part(new THREE.SphereGeometry(1, 6, 5), CREAM, { at: [s * 0.04, 0.567, 0.295], scale: [0.012, 0.007, 0.01] });
    // whiskers
    for (const k of [-1, 0, 1]) {
      b.rod([s * 0.035, 0.5 + k * 0.007, 0.32], [s * 0.1, 0.5 + k * 0.022, 0.335], 0.0014, "#fff5e0", { sides: 3 });
    }
    // ears
    b.part(new THREE.SphereGeometry(1, 8, 6), RUST_D, {
      at: [s * 0.068, 0.597, 0.222],
      scale: [0.042, 0.047, 0.018],
      rotation: [-12, 0, -26 * s],
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, {
      at: [s * 0.069, 0.595, 0.234],
      scale: [0.03, 0.037, 0.009],
      rotation: [-12, 0, -26 * s],
    });
    // cheek tufts
    for (const k of [0, 1, 2]) {
      b.spike([s * 0.08, 0.5 - k * 0.006, 0.27 + k * 0.012], [s * 1, -0.25 - k * 0.15, 0.4], 0.035 - k * 0.004, 0.012, CREAM, { sides: 5 });
    }
  }
  const ruff = skin.scatter(40, { rng: rng(41), minDist: 0.016, filter: (h) => Math.abs(h.n.x) > 0.6 && h.n.y < 0.3 });
  b.cards(ruff, tuft, { size: [0.02, 0.035], lean: 70, flow: [0, -0.2, -1], vary: 0.3, rng: rng(42), color: "#fff2d8" });
  const crown = skin.scatter(30, { rng: rng(43), minDist: 0.018, filter: (h) => h.n.y > 0.5 });
  b.cards(crown, tuft, { size: [0.02, 0.032], lean: 60, vary: 0.3, rng: rng(44), color: "#f27434" });

  // ---------- Ribbon collar with gold bell ----------
  b.part(new THREE.TorusGeometry(0.078, 0.009, 5, 14), RIBBON, { at: [0, 0.485, 0.172], rotation: [-18, 0, 0] });
  b.part(new THREE.SphereGeometry(0.019, 8, 6), GOLD, { at: [0, 0.432, 0.205] });
  b.rod([0, 0.426, 0.215], [0, 0.42, 0.223], 0.0035, "#a8681c", { sides: 4 });
  b.part(new THREE.TorusGeometry(0.0085, 0.0025, 4, 8), GOLD, { at: [0, 0.452, 0.2], rotation: [90, 0, 0] });
  for (const s of [1, -1]) {
    b.extrude(
      [[0, 0], [0.04, 0.012], [0.07, -0.01], [0.075, -0.05], [0.04, -0.03], [0.01, -0.012]],
      { at: [s * 0.01, 0.46, 0.2], x: [s, 0, 0.2], thickness: 0.006, smoothing: 1, color: RIBBON },
    );
  }

  // ---------- Dendro blossoms and motes ----------
  for (const [x, z] of [[0.18, 0.12], [-0.2, 0.1], [-0.1, -0.2], [0.14, -0.15]] as const) {
    const hit = stoneSkin.ray([x, 1, z], [0, -1, 0]);
    if (!hit) continue;
    b.spike(hit, hit, 0.05, 0.003, "#3f8f2f", { sides: 4 });
    const top = new THREE.Vector3(...hit.at.toArray()).add(new THREE.Vector3(0, 0.052, 0));
    glow(b.part(new THREE.SphereGeometry(0.014, 6, 4).scale(1, 0.6, 1), "#bff6ff", { at: top }), 1.2);
    glow(b.part(new THREE.SphereGeometry(0.006, 5, 4), "#ffe27a", { at: top.clone().add(new THREE.Vector3(0, 0.006, 0)) }), 1.5);
  }
  for (let i = 0; i < 7; i++) {
    const a = R() * Math.PI * 2;
    const rr = 0.3 + R() * 0.12;
    glow(
      b.part(new THREE.OctahedronGeometry(0.009 + R() * 0.006, 0), "#c9ff7a", {
        at: [Math.cos(a) * rr * 0.9, 0.38 + R() * 0.35, Math.sin(a) * rr * 0.8 + 0.08],
      }),
      1.5,
    );
  }

  return b.root;
}
