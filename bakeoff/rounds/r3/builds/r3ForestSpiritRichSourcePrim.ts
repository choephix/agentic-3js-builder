import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, smoothstep, mottle, grain, gradient, resolve } from "../../../../src/index";

export const meta = {
  name: "Moss Stone Fawn Spirit",
  description:
    "A small forest spirit: river-stone body furred with moss, slender wooden legs with hooves, flowering antlers, a pale wooden mask face with glowing green eyes, and circling fireflies.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "mossFawn" });
  const R = rng(5);
  const SPH = new THREE.SphereGeometry(1, 8, 6);
  const glow = (p: { mesh: THREE.Mesh }, c: string, k = 1.4) => {
    const m = p.mesh.material as THREE.MeshStandardMaterial;
    m.emissive.set(c);
    m.emissiveIntensity = k;
  };

  // ---------- paints ----------
  const mossy = (base: any, seed: number) =>
    paint((p, n) => {
      const m = smoothstep(0.05, 0.5, n.y + (noise(p, 0.12, seed) - 0.5) * 0.9);
      return mix(resolve(base, p, n), noise(p, 0.05, seed + 4) > 0.5 ? "#6aa844" : "#4f8a37", m);
    });
  const STONE = mottle("#979b9d", "#6e7478", { size: 0.09, seed: 2, contrast: 1.5 });
  const BODY = mossy(STONE, 3);
  const WOOD_PALE = grain("#e3d3ab", "#cbb888", { size: 0.01, axis: "z", seed: 4 });
  const WOOD_DARK = grain("#8a6a45", "#654a2e", { size: 0.012, axis: "y", seed: 6 });
  const LEG = gradient(WOOD_DARK, "#5f9a3c", [0, 0.28, 0], [0, 0.52, 0]);
  const NECK = mossy(WOOD_DARK, 9);
  const ANT = "#6f5033";
  const MOSS = mottle("#5a9a3a", "#86c14e", { size: 0.05, seed: 8 });

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0.57, -0.1] });
  const spine = b.chain("spine", [[0, 0.57, -0.3], [0, 0.58, -0.02], [0, 0.6, 0.28]], {
    parent: "root", role: "spine", names: ["spine1", "spine2"],
  });
  const neck = b.chain("neck", [[0, 0.65, 0.3], [0, 0.82, 0.42], [0, 0.97, 0.5]], {
    parent: "spine2", role: "neck", names: ["neck1", "neck2"],
  });
  b.joint("head", { parent: "neck2", at: [0, 0.97, 0.5], dir: [0, 0.15, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.92, 0.57], dir: [0, 0, 1], role: "jaw" });
  const tail = b.chain("tail", [[0, 0.64, -0.38], [0, 0.68, -0.48], [0, 0.72, -0.57]], {
    parent: "spine1", role: "tail",
  });

  // ---------- stone body ----------
  const lump = (at: number[], sc: number[], bone: string) =>
    b.part(SPH, BODY, { at, scale: sc, bone, flat: true, rotation: [0, 0, 0] });
  lump([0, 0.57, -0.02], [0.21, 0.2, 0.4], "spine1");
  lump([0, 0.585, 0.22], [0.17, 0.175, 0.2], "spine2");
  lump([0, 0.56, -0.26], [0.19, 0.18, 0.19], "spine1");
  lump([0.1, 0.46, 0.0], [0.1, 0.1, 0.16], "spine1");
  lump([-0.1, 0.46, 0.0], [0.1, 0.1, 0.16], "spine1");

  // moss tufts, flowers, mushrooms on the back
  for (let i = 0; i < 18; i++) {
    const z = -0.33 + R() * 0.62;
    const x = (R() - 0.5) * 0.28;
    const h = 0.2 * Math.sqrt(Math.max(0.06, 1 - ((z + 0.02) / 0.4) ** 2 - (x / 0.21) ** 2));
    const s = 0.035 + R() * 0.04;
    const y = 0.57 + h * 0.93;
    const bone = z > 0 ? "spine2" : "spine1";
    b.part(SPH, MOSS, { at: [x, y, z], scale: [s, s * 0.55, s], bone, flat: true });
    if (i % 4 === 0) flower([x, y + s * 0.5, z], bone, 1.1);
  }
  const mush = (x: number, y: number, z: number, k: number, bone: string) => {
    b.part(new THREE.CylinderGeometry(0.006 * k, 0.008 * k, 0.03 * k, 5), "#efe6cf", { at: [x, y + 0.012 * k, z], bone });
    b.part(SPH, "#d8573f", { at: [x, y + 0.03 * k, z], scale: [0.022 * k, 0.014 * k, 0.022 * k], bone });
    b.part(SPH, "#fff4e0", { at: [x, y + 0.042 * k, z], scale: [0.006 * k, 0.003 * k, 0.006 * k], bone });
  };
  mush(0.09, 0.735, -0.15, 1.2, "spine1");
  mush(-0.1, 0.74, 0.05, 0.9, "spine1");

  // ---------- neck, tail ----------
  b.sweep(neck, [0.085, 0.065, 0.055], { color: NECK });
  b.part(SPH, MOSS, { at: [0, 0.8, 0.36], scale: [0.07, 0.04, 0.09], bone: "neck1", flat: true });
  b.sweep(tail, [0.045, 0.034, 0.016], { color: MOSS });
  flower([0, 0.755, -0.58], "tail2", 1.0);

  // ---------- legs ----------
  const leg = (F: string, S: string, s: number, pts: number[][], names: string[], parent: string) => {
    const ch = b.chain("leg" + F + S, pts.map(([x, y, z]) => [s * x, y, z]), { parent, role: "leg", names });
    b.sweep(ch, [0.04, 0.028, 0.02, 0.016], { color: LEG });
    const [hx, , hz] = pts[3];
    b.part(new THREE.CylinderGeometry(0.02, 0.03, 0.06, 6), "#2f2a26", { at: [s * hx, 0.03, hz], bone: names[3] });
    const k = pts[1];
    b.part(SPH, STONE, { at: [s * k[0], k[1], k[2]], scale: 0.035, bone: names[1], flat: true });
  };
  for (const [S, s] of [["L", 1], ["R", -1]] as const) {
    leg("F", S, s, [[0.11, 0.5, 0.28], [0.11, 0.3, 0.3], [0.11, 0.16, 0.28], [0.11, 0.06, 0.29]],
      [`hipF${S}`, `kneeF${S}`, `ankleF${S}`, `hoofF${S}`], "spine2");
    leg("B", S, s, [[0.11, 0.5, -0.3], [0.11, 0.33, -0.25], [0.11, 0.17, -0.35], [0.11, 0.06, -0.33]],
      [`hipB${S}`, `kneeB${S}`, `hockB${S}`, `hoofB${S}`], "spine1");
  }

  // ---------- head ----------
  b.part(SPH, WOOD_PALE, { at: [0, 1.0, 0.5], scale: [0.095, 0.1, 0.11], bone: "head", flat: true });
  b.frustumBox([0, 0.995, 0.56], [0, 0.96, 0.72], [0.13, 0.12], [0.07, 0.06], { color: WOOD_PALE, bone: "head" });
  b.part(SPH, "#2f2a26", { at: [0, 0.945, 0.735], scale: [0.022, 0.015, 0.014], bone: "head" });
  b.part(new THREE.BoxGeometry(0.06, 0.028, 0.13), "#d6c59b", { at: [0, 0.915, 0.64], bone: "jaw" });
  // mask plate
  const outline: [number, number][] = [
    [0, -0.07], [0.05, -0.03], [0.085, 0.04], [0.075, 0.1], [0.03, 0.115],
    [-0.03, 0.115], [-0.075, 0.1], [-0.085, 0.04], [-0.05, -0.03],
  ];
  b.extrude(outline, {
    color: "#efe2bd", at: [0, 1.0, 0.585], x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.03, bevel: 0.008, bone: "head",
  });
  b.part(new THREE.BoxGeometry(0.006, 0.07, 0.004), "#6b8a4a", { at: [0, 1.075, 0.601], bone: "head" });
  b.part(new THREE.BoxGeometry(0.04, 0.005, 0.004), "#6b8a4a", { at: [0, 1.06, 0.601], bone: "head" });
  for (const s of [1, -1]) {
    b.part(SPH, "#2a3a22", { at: [s * 0.04, 1.03, 0.6], scale: [0.025, 0.016, 0.01], rotation: [0, 0, s * -15], bone: "head" });
    const e = b.part(SPH, "#7dff6a", { at: [s * 0.04, 1.03, 0.607], scale: [0.015, 0.011, 0.008], bone: "head" });
    glow(e, "#7dff6a", 1.6);
    // brow ridge
    b.part(new THREE.BoxGeometry(0.05, 0.008, 0.012), "#cbb888", { at: [s * 0.045, 1.055, 0.598], rotation: [0, 0, s * -12], bone: "head" });
  }
  b.part(SPH, MOSS, { at: [0, 1.1, 0.47], scale: [0.07, 0.035, 0.07], bone: "head", flat: true });
  flower([0.02, 1.13, 0.47], "head", 0.9);

  // ears
  for (const [n, s] of [["L", 1], ["R", -1]] as const) {
    const d = [s * 0.7, 0.7, -0.2];
    b.joint("ear" + n, { parent: "head", at: [s * 0.08, 1.05, 0.45], dir: d });
    b.part(SPH, WOOD_DARK, {
      at: [s * (0.08 + 0.035), 1.05 + 0.04, 0.45 - 0.01], scale: [0.02, 0.07, 0.012], dir: d, bone: "ear" + n,
    });
    b.part(SPH, "#8fbf63", {
      at: [s * (0.08 + 0.033), 1.05 + 0.038, 0.45 + 0.0], scale: [0.012, 0.055, 0.008], dir: d, bone: "ear" + n,
    });
  }

  // ---------- antlers ----------
  for (const [n, s] of [["L", 1], ["R", -1]] as const) {
    const P = (x: number, y: number, z: number) => [s * x, y, z];
    const ch = b.chain("antler" + n, [P(0.05, 1.07, 0.46), P(0.08, 1.17, 0.43), P(0.12, 1.29, 0.4), P(0.14, 1.41, 0.37)], {
      parent: "head", role: "digit",
    });
    b.sweep(ch, [0.017, 0.012, 0.009, 0.005], { color: ANT });
    const bone = `antler${n}3`;
    b.part(SPH, WOOD_DARK, { at: P(0.05, 1.07, 0.46), scale: 0.026, bone: "head", flat: true });
    const tines: [number, number[]][] = [
      [0.3, P(0.2, 1.29, 0.53)], [0.6, P(0.27, 1.43, 0.36)], [0.55, P(0.2, 1.37, 0.26)], [0.92, P(0.09, 1.53, 0.34)],
    ];
    tines.forEach(([t, to]) => b.capsule(ch.at(t), to, [0.008, 0.003], { color: ANT }));
    flower(tines[0][1], bone, 1.2);
    flower(tines[1][1], bone, 1.4);
    flower(tines[3][1], bone, 1.1);
    leaf(tines[2][1], [s * 0.3, 0.8, -0.5], bone);
    leaf(tines[2][1], [s * 0.9, 0.2, -0.2], bone);
    leaf(P(0.1, 1.24, 0.41), [s * 0.2, 0.6, 0.8], bone);
    leaf(P(0.13, 1.37, 0.38), [s * 1.0, 0.3, 0.1], bone);
    leaf(P(0.07, 1.15, 0.44), [s * -0.6, 0.6, 0.3], bone);
    leaf(tines[1][1], [s * 0.6, 0.5, -0.6], bone);
  }

  // ---------- fireflies ----------
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.4;
    const pos = [Math.cos(a) * 0.34, 1.12 + 0.18 * Math.sin(a * 2 + 1) + 0.08, 0.5 + Math.sin(a) * 0.3];
    const name = `firefly${i + 1}`;
    b.joint(name, { parent: "head", at: pos, dir: [0, 1, 0] });
    const g = b.part(SPH, "#f4ff8a", { at: pos, scale: [0.012, 0.012, 0.016], bone: name });
    glow(g, "#e8ff5a", 2);
    for (const s of [1, -1])
      b.part(SPH, "#ffffff", {
        at: [pos[0] + s * 0.012, pos[1] + 0.01, pos[2]], scale: [0.012, 0.002, 0.008],
        rotation: [0, 0, s * 25], bone: name,
      });
  }

  function flower(c: number[], bone: string, k = 1) {
    b.part(SPH, "#f2c230", { at: c, scale: 0.007 * k, bone });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      b.part(SPH, "#ffffff", {
        at: [c[0] + Math.cos(a) * 0.014 * k, c[1], c[2] - Math.sin(a) * 0.014 * k],
        scale: [0.011 * k, 0.004 * k, 0.007 * k], rotation: [0, (a * 180) / Math.PI, 0], bone,
      });
    }
  }
  function leaf(base: number[], dir: number[], bone: string) {
    const d = new THREE.Vector3(...dir).normalize();
    b.part(SPH, i2c(base), {
      at: [base[0] + d.x * 0.022, base[1] + d.y * 0.022, base[2] + d.z * 0.022],
      scale: [0.01, 0.003, 0.024], dir: d, axis: "z", bone,
    });
  }
  function i2c(p: number[]) {
    return p[1] > 1.4 ? "#7fc05a" : "#5fa044";
  }

  return b.root;
}
