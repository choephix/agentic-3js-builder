import * as THREE from "three";
import { createBuilder, rng, paint, mix, smoothstep, noise, mottle, countershade } from "../../../../src/index";

export const meta = {
  name: "Old Lion at Rest",
  description:
    "A proud old male lion lying in a sphinx pose with his head high, a shaggy mane fading from golden blond to chocolate, a scarred brow, big paws and a dark-tufted tail.",
};

export default function build() {
  const b = createBuilder({ name: "lion" });
  const R = rng(11);

  const TAWNY = "#c8924a";
  const TAWNY2 = "#b27a36";
  const CREAM = "#f0dcb4";
  const BODY = countershade(
    mottle(TAWNY, TAWNY2, { size: 0.25, seed: 3 }),
    mottle(CREAM, "#e2c898", { size: 0.15, seed: 5 }),
    { level: -0.3, soft: 0.45 },
  );
  const LIMB = mottle(TAWNY, TAWNY2, { size: 0.18, seed: 8 });

  // Mane: golden blond at the face, through amber and rust, to chocolate at the edges.
  const G0: [number, number, number] = [0.93, 0.72, 0.3];
  const G1: [number, number, number] = [0.72, 0.46, 0.17];
  const G2: [number, number, number] = [0.42, 0.22, 0.09];
  const G3: [number, number, number] = [0.18, 0.1, 0.055];
  const MANE = paint((p) => {
    const d = Math.hypot(p.x * 1.1, p.y - 1.05, (p.z - 0.9) * 0.9);
    let t = smoothstep(0.2, 0.95, d) + (noise(p, 0.14, 4) - 0.5) * 0.3;
    t = Math.min(Math.max(t, 0), 1);
    if (t < 0.35) return mix(G0, G1, t / 0.35);
    if (t < 0.7) return mix(G1, G2, (t - 0.35) / 0.35);
    return mix(G2, G3, (t - 0.7) / 0.3);
  });

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0.42, -0.7], dir: [0, 0, 1] });
  b.chain("spine", [[0, 0.42, -0.7], [0, 0.45, -0.2], [0, 0.5, 0.25]], {
    names: ["spine1", "spine2", "chest"], role: "spine", parent: "root",
  });
  const neck = b.chain("neck", [[0, 0.62, 0.3], [0, 0.8, 0.45], [0, 1.0, 0.62]], {
    names: ["neck1", "neck2"], role: "neck", parent: "chest",
  });
  b.joint("head", { parent: "neck2", at: [0, 1.05, 0.7], dir: [0, 0.05, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.97, 0.84], dir: [0, 0, 1], role: "jaw" });

  const legs: Record<string, any> = {};
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    legs["f" + S] = b.chain(
      "foreleg" + S,
      [[0.2 * s, 0.42, 0.25], [0.26 * s, 0.15, 0.12], [0.23 * s, 0.1, 0.7], [0.22 * s, 0.07, 0.88]],
      { names: ["shoulder" + S, "elbow" + S, "wrist" + S, "paw" + S], role: "leg", parent: "chest" },
    );
    legs["h" + S] = b.chain(
      "hindleg" + S,
      [[0.3 * s, 0.38, -0.62], [0.36 * s, 0.2, -0.35], [0.3 * s, 0.1, -0.92], [0.27 * s, 0.07, -0.6]],
      { names: ["hip" + S, "knee" + S, "hock" + S, "foot" + S], role: "leg", parent: "root" },
    );
  }
  const tailPts: number[][] = [[0, 0.42, -0.95], [0.1, 0.3, -1.25], [0.3, 0.15, -1.5], [0.5, 0.09, -1.7], [0.62, 0.08, -1.9]];
  const tail = b.chain("tail", tailPts, {
    names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail", parent: "root",
  });

  // ---------- helpers ----------
  const sph = (r: number, s = 10, h = 7) => new THREE.SphereGeometry(r, s, h);
  const ell = (col: any, at: number[], sc: number[], bone: string, flat = true, rot?: number[]) =>
    b.part(sph(1), col, { at, scale: sc, bone, flat, rotation: rot });

  // ---------- body ----------
  ell(BODY, [0, 0.37, -0.5], [0.34, 0.35, 0.46], "root");
  ell(BODY, [0, 0.37, -0.15], [0.34, 0.35, 0.42], "spine1");
  ell(BODY, [0, 0.48, 0.1], [0.37, 0.42, 0.42], "spine2");
  ell(BODY, [0, 0.2, -0.15], [0.28, 0.14, 0.62], "spine1");
  ell(LIMB, [0.31, 0.3, -0.6], [0.2, 0.3, 0.34], "hipL");
  ell(LIMB, [-0.31, 0.3, -0.6], [0.2, 0.3, 0.34], "hipR");

  b.sweep(tail, [0.06, 0.05, 0.042, 0.038, 0.035], { color: LIMB, sides: 6 });
  b.sweep(neck, 0.15, { color: LIMB, sides: 8 });
  for (const S of ["L", "R"]) {
    b.sweep(legs["f" + S], [0.13, 0.1, 0.085, 0.08], { color: LIMB, sides: 7 });
    b.sweep(legs["h" + S], [0.1, 0.085, 0.065, 0.06], { color: LIMB, sides: 7 });
  }

  // ---------- paws ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    ell(LIMB, [0.22 * s, 0.07, 0.95], [0.1, 0.07, 0.15], "paw" + S);
    for (const dx of [-0.045, 0, 0.045]) {
      ell("#d9ab68", [(0.22 + dx) * s, 0.05, 1.07 - Math.abs(dx) * 0.5], [0.032, 0.035, 0.04], "paw" + S);
      b.part(new THREE.ConeGeometry(0.01, 0.035, 4), "#f4ecd8", {
        at: [(0.22 + dx) * s, 0.025, 1.12 - Math.abs(dx) * 0.5], dir: [0, -0.5, 1], bone: "paw" + S,
      });
    }
    ell(LIMB, [0.27 * s, 0.06, -0.55], [0.085, 0.06, 0.14], "foot" + S);
    for (const dx of [-0.035, 0.035]) {
      ell("#d9ab68", [(0.27 + dx) * s, 0.045, -0.43], [0.033, 0.035, 0.04], "foot" + S);
    }
  }

  // ---------- head ----------
  ell(countershade(mottle("#d19a50", TAWNY2, { size: 0.1, seed: 2 }), CREAM, { level: -0.6 }), [0, 1.08, 0.78], [0.2, 0.19, 0.22], "head");
  ell("#c99449", [0, 1.04, 1.0], [0.11, 0.085, 0.14], "head");
  for (const s of [1, -1]) {
    ell(CREAM, [0.055 * s, 0.99, 1.05], [0.07, 0.05, 0.07], "head");
    ell("#1a0f0a", [0.055 * s, 1.01, 1.12], [0.008, 0.008, 0.008], "head", false);
    ell("#1a0f0a", [0.075 * s, 1.03, 1.1], [0.008, 0.008, 0.008], "head", false);
    ell("#1a0f0a", [0.07 * s, 1.0, 1.1], [0.008, 0.008, 0.008], "head", false);
    // eyes
    ell("#3a2412", [0.085 * s, 1.12, 0.945], [0.043, 0.034, 0.025], "head", false);
    ell("#e8a020", [0.085 * s, 1.12, 0.96], [0.032, 0.032, 0.03], "head", false);
    ell("#120a06", [0.085 * s, 1.12, 0.985], [0.014, 0.018, 0.008], "head", false);
    ell("#ffffff", [0.092 * s, 1.128, 0.99], [0.005, 0.005, 0.004], "head", false);
    // brow ridge
    ell("#a8702f", [0.088 * s, 1.158, 0.935], [0.065, 0.028, 0.05], "head", true, [0, 0, -12 * s]);
    // ears
    ell(TAWNY2, [0.15 * s, 1.25, 0.7], [0.065, 0.065, 0.03], "head", true, [0, 20 * s, 0]);
    ell("#4a2a14", [0.15 * s, 1.25, 0.725], [0.04, 0.04, 0.015], "head", true, [0, 20 * s, 0]);
    // fangs
    b.part(new THREE.ConeGeometry(0.014, 0.06, 5), "#fffbe8", { at: [0.065 * s, 0.945, 1.05], dir: [0, -1, 0], bone: "head" });
    b.part(new THREE.ConeGeometry(0.011, 0.045, 5), "#fffbe8", { at: [0.05 * s, 0.97, 1.07], dir: [0, 1, 0], bone: "jaw" });
  }
  // broad black nose
  ell("#120c0a", [0, 1.075, 1.135], [0.08, 0.05, 0.04], "head");
  b.part(new THREE.BoxGeometry(0.012, 0.05, 0.012), "#120c0a", { at: [0, 1.015, 1.13], bone: "head" });
  // scar across the left (+X) brow
  b.part(new THREE.BoxGeometry(0.014, 0.115, 0.012), "#d79a86", { at: [0.088, 1.162, 0.975], rotation: [0, 0, 28], bone: "head" });
  for (const k of [-1, 0, 1])
    b.part(new THREE.BoxGeometry(0.03, 0.006, 0.01), "#e8b9a6", { at: [0.088 + k * 0.012, 1.162 + k * 0.03, 0.98], rotation: [0, 0, 28], bone: "head" });
  // lower jaw
  ell(CREAM, [0, 0.935, 0.98], [0.085, 0.04, 0.14], "jaw");
  ell("#e6cf9f", [0, 0.925, 1.1], [0.06, 0.035, 0.04], "jaw");

  // ---------- mane ----------
  const tuft = (at: number[], dir: number[], len: number, rad: number, bone: string) =>
    b.part(new THREE.ConeGeometry(rad, len, 5), MANE, { at, dir, bone, flat: true });
  ell(MANE, [0, 1.03, 0.6], [0.36, 0.38, 0.22], "head");
  ell(MANE, [0, 0.8, 0.3], [0.4, 0.38, 0.4], "neck1");
  for (let k = 0; k < 5; k++) {
    const n = 9 + 3 * k;
    const Rk = 0.27 + 0.09 * k;
    const zk = 0.74 - 0.09 * k;
    const len = 0.26 + 0.045 * k;
    for (let i = 0; i < n; i++) {
      const a = ((i + R() * 0.5) / n) * Math.PI * 2;
      const ox = Math.cos(a);
      const oy = Math.sin(a);
      const d = new THREE.Vector3(ox, oy - 0.25 - 0.05 * k, -0.45 - 0.1 * k).normalize();
      const l = len * (0.8 + 0.4 * R());
      tuft([ox * Rk, 1.04 + oy * Rk * 0.95, zk + (R() - 0.5) * 0.06], d.toArray(), l, 0.085 + 0.01 * k, "head");
    }
  }
  for (let i = 0; i < 26; i++) {
    const th = ((i / 25) * 2 - 1) * 1.75;
    const z = 0.0 + R() * 0.5;
    const d = new THREE.Vector3(Math.sin(th), Math.cos(th) * 0.5 - 0.3, -0.6).normalize();
    tuft([Math.sin(th) * 0.36, 0.78 + Math.cos(th) * 0.3, z], d.toArray(), 0.3 + R() * 0.12, 0.1, "chest");
  }
  for (let i = 0; i < 14; i++) {
    const x = (R() * 2 - 1) * 0.24;
    tuft([x, 0.68 + R() * 0.15, 0.55 + R() * 0.15], [x * 2, -1, 0.3], 0.26, 0.08, "chest");
  }
  for (let i = 0; i < 8; i++) {
    const x = (i / 7 * 2 - 1) * 0.3;
    tuft([x, 0.2 + R() * 0.05, 0.25 + R() * 0.15], [x * 2, -0.8, -0.3], 0.2, 0.07, "chest");
  }

  // ---------- tail tuft ----------
  const tip = new THREE.Vector3(...tailPts[4]);
  const td = new THREE.Vector3(0.12, 0, -0.2).normalize();
  b.part(sph(1), "#2a160b", { at: tip.clone().addScaledVector(td, 0.1).toArray(), dir: td.toArray(), scale: [0.075, 0.17, 0.075], bone: "tail5", flat: true });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const d = new THREE.Vector3(Math.cos(a) * 0.4 + td.x, Math.sin(a) * 0.3, td.z).normalize();
    b.part(new THREE.ConeGeometry(0.04, 0.16, 5), i % 2 ? "#4a2812" : "#2a160b", {
      at: tip.clone().addScaledVector(td, 0.16).add(new THREE.Vector3(0, 0.0, 0)).toArray(), dir: d.toArray(), bone: "tail5", flat: true,
    });
  }

  return b.root;
}
