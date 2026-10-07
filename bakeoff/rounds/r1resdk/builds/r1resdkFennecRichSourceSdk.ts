import * as THREE from "three";
import { createBuilder, paint, mix, resolve, smoothstep, countershade, gradient, mottle, stripes, scales } from "../../../../src/index";

export const meta = {
  name: "Fennec Fox Kit on a Dune",
  description:
    "Alert fennec fox kit with huge peach-lined ears, cream-to-gold coat, black-tipped fluffy tail, oversized paws, woven leather collar with a brass bell, standing on a rippled sand dune.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "fennec_kit" });
  const GOLD = "#e4b46b";
  const SAND = "#d29a55";
  const CREAM = "#f7e8cc";
  const PEACH = "#f3b9a2";
  const DARK = "#17110e";

  const sph = (w = 10, h = 7) => new THREE.SphereGeometry(1, w, h);
  const ball = (at: number[], sc: number[], color: any, bone: string, name?: string) =>
    b.part(sph(), color, { at, scale: sc, bone, name });

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0.17, -0.13] });

  const spine = b.chain(
    "spine",
    [[0, 0.17, -0.13], [0, 0.172, -0.04], [0, 0.178, 0.05], [0, 0.182, 0.09]],
    { role: "spine", names: ["pelvis", "spine1", "spine2", "spine3"], parent: "root" },
  );

  const neck = b.chain(
    "neck",
    [[0, 0.19, 0.1], [0, 0.215, 0.135], [0, 0.24, 0.17]],
    { role: "neck", names: ["neck1", "neck2", "head"], parent: "spine3" },
  );

  b.joint("jaw", { parent: "head", at: [0, 0.232, 0.2], dir: [0, 0, 1], role: "jaw" });

  const tail = b.chain(
    "tail",
    [[0, 0.17, -0.15], [0, 0.17, -0.22], [0, 0.15, -0.29], [0, 0.125, -0.35], [0, 0.105, -0.4]],
    { role: "tail", parent: "pelvis" },
  );

  // ---------- paints ----------
  const back = mottle(GOLD, SAND, { size: 0.07, seed: 3, contrast: 0.8 });
  const coat = countershade(back, CREAM, { level: 0.05, soft: 0.5 });
  const legPaint = gradient(GOLD, CREAM, [0, 0.17, 0], [0, 0.08, 0]);
  const tailBase = countershade(mottle(GOLD, "#f0cd8c", { size: 0.06, seed: 8 }), "#f3dcae", { level: 0, soft: 0.5 });
  const tailPaint = paint((p, n) => {
    const k = smoothstep(-0.355, -0.385, p.z);
    return mix(resolve(tailBase, p, n), "#1a1411", k);
  });

  // ---------- body ----------
  b.sweep(spine, (t) => {
    const s = Math.sin(Math.PI * t * 0.9 + 0.15);
    return [0.038 + 0.014 * s, 0.046 + 0.014 * s];
  }, { color: coat, name: "body" });
  b.sweep(neck, [0.036, 0.03, 0.03], { color: coat, name: "neckTube" });
  b.sweep(tail, (t) => {
    const r = 0.02 + 0.026 * Math.sin(Math.PI * Math.min(t * 1.15, 1)) ** 0.7;
    return r * (1 - 0.45 * t ** 4);
  }, { color: tailPaint, name: "tailFur" });
  ball([0, 0.145, 0.1], [0.04, 0.04, 0.035], CREAM, "spine3", "chestFluff");

  // ---------- head ----------
  const headPaint = countershade(back, CREAM, { level: -0.1, soft: 0.45 });
  b.part(sph(12, 9), headPaint, { at: [0, 0.252, 0.188], scale: [0.05, 0.046, 0.052], bone: "head", name: "skull" });
  b.capsule([0, 0.246, 0.21], [0, 0.241, 0.272], [0.03, 0.011], { color: CREAM, bone: "head", name: "muzzle" });
  b.capsule([0, 0.225, 0.205], [0, 0.226, 0.262], [0.02, 0.01], { color: CREAM, bone: "jaw", name: "lowerJaw" });
  ball([0, 0.243, 0.281], [0.009, 0.0075, 0.008], DARK, "head", "nose");

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // eyes
    ball([s * 0.027, 0.258, 0.226], [0.011, 0.0125, 0.01], DARK, "head", "eye" + S);
    ball([s * 0.0245, 0.2625, 0.2365], [0.0038, 0.0038, 0.003], "#ffffff", "head", "sparkle" + S);
    // cheek tufts
    b.part(new THREE.ConeGeometry(0.014, 0.038, 5), CREAM, {
      at: [s * 0.046, 0.238, 0.192], dir: [s * 0.7, -0.35, -0.3], bone: "head", name: "cheek" + S,
    });
    b.part(new THREE.ConeGeometry(0.011, 0.03, 5), CREAM, {
      at: [s * 0.042, 0.226, 0.205], dir: [s * 0.6, -0.5, 0.1], bone: "head", name: "cheekLow" + S,
    });

    // ears
    b.joint("ear" + S, { parent: "head", at: [s * 0.032, 0.275, 0.172], dir: [s * 0.4, 1, -0.25] });
    const ex: number[] = s > 0 ? [1, -0.4, 0] : [1, 0.4, 0];
    const ey: number[] = [s * 0.4, 1, -0.25];
    const outer = [
      [-0.024, 0], [-0.032, 0.035], [-0.03, 0.078], [-0.018, 0.11], [0, 0.123],
      [0.018, 0.11], [0.03, 0.078], [0.032, 0.035], [0.024, 0],
    ] as [number, number][];
    const inner = outer.map(([x, y]) => [x * 0.62, 0.012 + y * 0.8] as [number, number]);
    b.extrude(outer, {
      color: gradient(GOLD, "#b9813f", [0, 0.28, 0.17], [s * 0.04, 0.39, 0.15]),
      at: [s * 0.032, 0.275, 0.172], x: ex, y: ey, thickness: [0.01, 0.006], smoothing: 1, bevel: 0.002,
      bone: "ear" + S, name: "earOuter" + S,
    });
    b.extrude(inner, {
      color: PEACH, at: [s * 0.032, 0.2755, 0.1755], x: ex, y: ey, thickness: [0.012, 0.007], smoothing: 1,
      bone: "ear" + S, name: "earInner" + S,
    });
    for (let k = 0; k < 2; k++)
      b.part(new THREE.ConeGeometry(0.007, 0.032, 4), CREAM, {
        at: [s * (0.024 + k * 0.01), 0.282, 0.185], dir: [s * (0.2 + k * 0.3), 1, 0.15], bone: "ear" + S,
        name: "earTuft" + S + k,
      });
  }

  // ---------- legs ----------
  const pawGeo = () => sph(9, 6);
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = s * 0.04;
    // front
    const front = b.chain(
      "foreLeg" + S,
      [[x, 0.165, 0.075], [x, 0.118, 0.068], [x, 0.08, 0.078]],
      { role: "leg", names: ["shoulder" + S, "elbow" + S, "pawF" + S], parent: "spine2" },
    );
    b.sweep(front, [0.017, 0.012, 0.01], { color: legPaint, name: "foreLeg" + S });
    b.part(pawGeo(), "#f4dfb8", { at: [x, 0.086, 0.09], scale: [0.021, 0.015, 0.031], bone: "pawF" + S, name: "pawF" + S });
    for (let k = -1; k <= 1; k++)
      b.part(sph(6, 5), "#f4dfb8", {
        at: [x + k * 0.009, 0.08, 0.117 - Math.abs(k) * 0.003], scale: [0.0075, 0.0065, 0.008], bone: "pawF" + S,
      });

    // hind (digitigrade)
    const hx = s * 0.042;
    const hind = b.chain(
      "hindLeg" + S,
      [[hx, 0.17, -0.11], [hx, 0.122, -0.082], [hx, 0.09, -0.127], [hx, 0.082, -0.105]],
      { role: "leg", names: ["hip" + S, "knee" + S, "hock" + S, "pawH" + S], parent: "pelvis" },
    );
    b.sweep(hind, [0.02, 0.013, 0.01, 0.01], { color: legPaint, name: "hindLeg" + S });
    ball([hx + s * 0.004, 0.15, -0.105], [0.034, 0.04, 0.042], coat, "hip" + S, "haunch" + S);
    b.part(pawGeo(), "#f4dfb8", { at: [hx, 0.087, -0.102], scale: [0.023, 0.016, 0.034], bone: "pawH" + S, name: "pawH" + S });
    for (let k = -1; k <= 1; k++)
      b.part(sph(6, 5), "#f4dfb8", {
        at: [hx + k * 0.01, 0.081, -0.07 - Math.abs(k) * 0.003], scale: [0.008, 0.007, 0.009], bone: "pawH" + S,
      });
  }

  // ---------- collar & bell ----------
  const weave = scales(["#8c5630", "#734222"], "#3b2212", { size: 0.011, width: 0.28, seed: 4 });
  b.part(new THREE.TorusGeometry(0.04, 0.0072, 5, 16), weave, {
    at: [0, 0.2175, 0.1375], dir: [0, 0.6, 0.8], axis: "z", bone: "neck1", name: "collar",
  });
  b.part(new THREE.TorusGeometry(0.006, 0.0018, 4, 8), "#c79a36", {
    at: [0, 0.18, 0.165], dir: [1, 0, 0], axis: "z", bone: "neck1", name: "bellLoop",
  });
  ball([0, 0.168, 0.168], [0.0115, 0.0115, 0.0115], "#d5a33a", "neck1", "bell");
  ball([0, 0.159, 0.173], [0.0045, 0.002, 0.004], "#4a3210", "neck1", "bellSlit");

  // ---------- dune ----------
  b.lathe(
    [[0, 0], [0.57, 0], [0.5, 0.016], [0.4, 0.04], [0.26, 0.064], [0.14, 0.075], [0, 0.077]],
    {
      color: paint((p, n) =>
        mix(
          resolve(stripes("#e6c083", "#c99659", { size: 0.035, axis: [0.35, 0, 1], width: 0.45, wobble: 1.2, seed: 2 }), p, n),
          "#d9a56a",
          0.25,
        ),
      ),
      at: [0, 0, -0.04], segments: 14, bone: "root", name: "dune",
    },
  );
  const rocks: [number, number, number][] = [[0.34, 0.2, 1], [-0.3, 0.25, 2], [0.38, -0.2, 3]];
  for (const [rx, rz, i] of rocks)
    b.part(new THREE.DodecahedronGeometry(1, 0), "#b98a58", {
      at: [rx, 0.04, rz], scale: [0.022 + 0.004 * i, 0.014, 0.02], rotation: [0, i * 40, 8], bone: "root", flat: true,
      name: "rock" + i,
    });

  return b.root;
}
