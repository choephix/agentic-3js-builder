```ts
import * as THREE from "three";
import { createBuilder, catmull, paint, scales, svg } from "agentic-3js-builder";
import type { PartOptions, Fill } from "agentic-3js-builder";

export const meta = {
  name: "Armored Knight",
  description:
    "A stylized low-poly knight in faceted plate armour: a great helm with a hinged visor and bevor, a crimson plume, broad gold-trimmed pauldrons, a pleated crimson cape, a heraldic tabard skirt and heater shield, and a sheathed sword. Rigged in a T-pose.",
};

export default function build() {
  const b = createBuilder({ name: "knight", paintSize: 2048 });

  const C = {
    steel: "#aeb8c4",
    steelD: "#6f7b88",
    steelL: "#d3dbe4",
    gold: "#d8a531",
    goldD: "#9a6f1a",
    leather: "#5a3a22",
    leatherD: "#3b2516",
    crimson: "#a3162b",
    crimsonD: "#6e0e1e",
    navy: "#1d2f6e",
    cream: "#f1e6c8",
    dark: "#14161c",
    glow: "#7fe9ff",
    wood: "#6b4a2b",
  };

  const P = (geo: THREE.BufferGeometry, color: Fill, bone: string, at: number[], o: PartOptions = {}) =>
    b.part(geo, color, { bone, at, flat: true, ...o });
  const cyl = (rt: number, rb: number, h: number, n = 8) => new THREE.CylinderGeometry(rt, rb, h, n);
  const halfCyl = (rt: number, rb: number, h: number, n = 10) =>
    new THREE.CylinderGeometry(rt, rb, h, n, 1, false, -Math.PI / 2, Math.PI);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const rivet = (bone: string, at: number[], r = 0.01) => P(sph(r, 6, 4), C.gold, bone, at);

  // ---------------------------------------------------------------- skeleton
  b.joint("hips", { at: [0, 0.98, 0], dir: [0, 1, 0] });
  b.chain("spine", [[0, 0.98, 0], [0, 1.13, 0], [0, 1.29, 0], [0, 1.46, 0]], {
    parent: "hips",
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });
  b.chain("neckChain", [[0, 1.46, 0], [0, 1.58, 0]], { parent: "chest", names: ["neck"], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 1.58, 0], dir: [0, 1, 0], role: "head" });
  b.joint("visor", { parent: "head", at: [0, 1.745, 0], dir: [0, 0, 1], role: "hinge" });
  b.joint("jaw", { parent: "head", at: [0, 1.71, 0], dir: [0, 0, 1], role: "jaw" });

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    b.joint(`clavicle${S}`, { parent: "chest", at: [0.05 * s, 1.44, 0], dir: [s, 0, 0] });
    b.chain(`arm${S}`, [[0.2 * s, 1.46, 0], [0.47 * s, 1.46, 0], [0.73 * s, 1.46, 0], [0.81 * s, 1.46, 0]], {
      parent: `clavicle${S}`,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    b.chain(`fingers${S}`, [[0.81 * s, 1.46, 0], [0.86 * s, 1.46, 0], [0.915 * s, 1.456, 0]], {
      parent: `wrist${S}`,
      names: [`finger${S}1`, `finger${S}2`],
      role: "digit",
    });
    b.chain(`thumb${S}`, [[0.76 * s, 1.455, 0.035], [0.79 * s, 1.455, 0.075], [0.815 * s, 1.455, 0.105]], {
      parent: `wrist${S}`,
      names: [`thumb${S}1`, `thumb${S}2`],
      role: "digit",
    });
    const x = 0.1 * s;
    b.chain(`leg${S}`, [[x, 0.95, 0], [x, 0.53, 0.02], [x, 0.1, 0], [x, 0.035, 0.17]], {
      parent: "hips",
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `toe${S}`],
      role: "leg",
      contact: [x, 0, 0.05],
    });
  }

  // ---------------------------------------------------------------- torso
  const breast = P(cyl(0.205, 0.17, 0.34, 8), C.steel, "chest", [0, 1.33, 0.01], { scale: [1, 1, 0.72] });
  P(cyl(0.165, 0.205, 0.05, 8), C.steelL, "chest", [0, 1.525, 0.01], { scale: [1, 1, 0.72] });
  P(cyl(0.21, 0.21, 0.018, 8), C.gold, "chest", [0, 1.5, 0.01], { scale: [1, 1, 0.73] });
  P(cyl(0.175, 0.175, 0.018, 8), C.gold, "spine1", [0, 1.18, 0.015], { scale: [1, 1, 0.75] });
  P(cyl(0.17, 0.155, 0.12, 8), C.steelL, "spine1", [0, 1.12, 0.015], { scale: [1, 1, 0.74] });

  const emblem = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="32,2 38,24 60,20 42,34 54,58 32,44 10,58 22,34 4,20 26,24" fill="#e2b13c" stroke="#7a5410" stroke-width="2"/><circle cx="32" cy="32" r="8" fill="#a3162b" stroke="#7a5410" stroke-width="2"/></svg>`,
    { size: 256 },
  );
  b.decal(breast, emblem, { at: [0, 1.37, 0.2], dir: [0, 0, 1], size: [0.13, 0.13], bone: "chest" });

  // belt, faulds, mail skirt
  P(cyl(0.168, 0.168, 0.05, 8), C.leather, "hips", [0, 1.02, 0.01], { scale: [1, 1, 0.76] });
  P(box(0.06, 0.05, 0.02), C.gold, "hips", [0, 1.02, 0.135]);
  P(box(0.03, 0.025, 0.022), C.leatherD, "hips", [0, 1.02, 0.14]);
  [0.98, 0.94, 0.9].forEach((y, k) =>
    P(cyl(0.17 + 0.008 * k, 0.18 + 0.008 * k, 0.05, 8), k === 2 ? C.steelL : C.steel, "hips", [0, y, 0.005], {
      scale: [1, 1, 0.76],
    }),
  );
  P(cyl(0.195, 0.195, 0.012, 8), C.gold, "hips", [0, 0.872, 0.005], { scale: [1, 1, 0.77] });
  const mail = scales(["#5d646e", "#6b737d", "#525962"], "#2a2e35", { size: 0.014 });
  P(cyl(0.19, 0.2, 0.1, 10), mail, "hips", [0, 0.82, 0.0], { scale: [1, 1, 0.78] });

  // tabard flaps with heraldry
  const tabardPaint = paint((p, n, s) => {
    if (Math.abs(n.z) < 0.5) return C.gold;
    const [x, y] = s;
    if (y > -0.025 || Math.abs(x) > 0.11) return C.gold;
    const yc = -0.1 - 0.9 * Math.abs(x);
    if (Math.abs(y - yc) < 0.028) return C.gold;
    if (Math.hypot(x, y + 0.26) < 0.034) return C.cream;
    return C.navy;
  });
  const flap = [[-0.13, 0], [0.13, 0], [0.13, -0.3], [0.065, -0.37], [0, -0.3], [-0.065, -0.37], [-0.13, -0.3]];
  b.extrude(flap, { color: tabardPaint, at: [0, 0.99, 0.18], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.014, bone: "hips" });
  b.extrude(flap, { color: tabardPaint, at: [0, 0.99, -0.18], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.014, bone: "hips" });

  // gorget and neck
  P(cyl(0.06, 0.06, 0.12, 8), C.steelD, "neck", [0, 1.55, 0]);
  P(cyl(0.1, 0.13, 0.06, 8), C.steel, "chest", [0, 1.53, 0]);
  P(cyl(0.085, 0.1, 0.05, 8), C.steelL, "neck", [0, 1.57, 0]);
  P(cyl(0.102, 0.102, 0.012, 8), C.gold, "neck", [0, 1.548, 0]);

  // ---------------------------------------------------------------- helmet
  P(cyl(0.118, 0.112, 0.2, 10), C.steel, "head", [0, 1.7, -0.005]);
  P(new THREE.SphereGeometry(0.118, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2), C.steelL, "head", [0, 1.8, -0.005], {
    scale: [1, 0.6, 1],
  });
  P(cyl(0.123, 0.123, 0.022, 10), C.gold, "head", [0, 1.8, -0.005]);
  P(box(0.018, 0.04, 0.22), C.gold, "head", [0, 1.855, -0.01]);
  P(cyl(0.022, 0.026, 0.045, 6), C.gold, "head", [0, 1.885, -0.02]);
  // eye slit interior and glowing eyes
  P(box(0.2, 0.02, 0.05), C.dark, "head", [0, 1.716, 0.1]);
  for (const s of [1, -1]) P(box(0.03, 0.007, 0.01), C.glow, "head", [0.042 * s, 1.716, 0.122]);
  // visor (upper face)
  P(halfCyl(0.13, 0.128, 0.075), C.steelL, "visor", [0, 1.76, 0]);
  P(halfCyl(0.133, 0.133, 0.012), C.gold, "visor", [0, 1.792, 0]);
  P(box(0.016, 0.08, 0.03), C.gold, "visor", [0, 1.758, 0.13]);
  for (const s of [1, -1]) rivet("visor", [0.128 * s, 1.745, 0], 0.016);
  // bevor (jaw)
  P(halfCyl(0.128, 0.112, 0.09), C.steel, "jaw", [0, 1.665, 0]);
  P(box(0.016, 0.09, 0.03), C.steelL, "jaw", [0, 1.665, 0.125]);
  for (const s of [1, -1])
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) {
        const th = -s * (0.42 + 0.18 * c);
        const y = 1.648 + 0.022 * r;
        const rr = 0.121 + 0.003 * r;
        P(cyl(0.0055, 0.0055, 0.012, 6), C.dark, "jaw", [rr * Math.sin(th) * -1, y, rr * Math.cos(th)], {
          dir: [-Math.sin(th), 0, Math.cos(th)],
        });
      }
  // plume
  const plumeR = (k: number) => (t: number) => k * (0.018 + 0.032 * Math.sin(Math.PI * Math.min(t * 1.3, 1)) * (1 - 0.5 * t));
  b.sweep(catmull([[0, 1.88, -0.01], [0, 1.97, -0.06], [0, 2.0, -0.17], [0, 1.93, -0.29], [0, 1.8, -0.34]]), plumeR(1), {
    color: C.crimson,
    bone: "head",
    sides: 6,
  });
  for (const s of [1, -1])
    b.sweep(catmull([[0.02 * s, 1.88, -0.03], [0.045 * s, 1.95, -0.09], [0.055 * s, 1.95, -0.2], [0.05 * s, 1.86, -0.3], [0.045 * s, 1.75, -0.32]]), plumeR(0.7), {
      color: C.crimsonD,
      bone: "head",
      sides: 6,
    });

  // ---------------------------------------------------------------- cape
  const N = 7;
  for (let i = 0; i < N; i++) {
    const f = i / (N - 1);
    const xt = -0.2 + 0.4 * f;
    const xb = -0.33 + 0.66 * f;
    const zb = i % 2 ? -0.33 : -0.29;
    b.frustumBox([xt, 1.47, -0.165], [xb, 0.42, zb], [0.08, 0.018], [0.12, 0.018], {
      bone: "chest",
      bands: [
        [0.95, i % 2 ? C.crimsonD : C.crimson],
        [1, C.gold],
      ],
    });
  }
  P(box(0.44, 0.05, 0.05), C.crimsonD, "chest", [0, 1.48, -0.155]);
  for (const s of [1, -1]) {
    P(cyl(0.028, 0.028, 0.014, 8), C.gold, "chest", [0.17 * s, 1.5, -0.12], { dir: [0, 0.4, -1] });
    rivet("chest", [0.17 * s, 1.503, -0.13], 0.01);
  }

  // ---------------------------------------------------------------- arms
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = `shoulder${S}`;
    // pauldron
    const dc = [0.25 * s, 1.49, 0];
    const dr = [0.1365, 0.0975, 0.143];
    P(sph(0.13, 10, 7), C.steel, sh, dc, { scale: [1.05, 0.75, 1.1] });
    P(cyl(0.14, 0.15, 0.035, 10), C.steelL, sh, [0.27 * s, 1.445, 0], { dir: [0.35 * s, 1, 0] });
    P(cyl(0.145, 0.157, 0.035, 10), C.steel, sh, [0.29 * s, 1.415, 0], { dir: [0.5 * s, 1, 0] });
    P(cyl(0.16, 0.16, 0.012, 10), C.gold, sh, [0.297 * s, 1.397, 0], { dir: [0.5 * s, 1, 0] });
    for (const phi of [0, Math.PI / 2, -Math.PI / 2, Math.PI / 4, -Math.PI / 4]) {
      const e = (35 * Math.PI) / 180;
      rivet(sh, [dc[0] + s * dr[0] * Math.cos(e) * Math.cos(phi), dc[1] + dr[1] * Math.sin(e), dr[2] * Math.cos(e) * Math.sin(phi)], 0.011);
    }
    P(box(0.022, 0.07, 0.17), C.steelL, `clavicle${S}`, [0.17 * s, 1.56, -0.005]);
    P(box(0.026, 0.012, 0.172), C.gold, `clavicle${S}`, [0.17 * s, 1.597, -0.005]);
    // upper arm, couter, vambrace
    P(cyl(0.052, 0.058, 0.2), C.steel, sh, [0.37 * s, 1.46, 0], { dir: [s, 0, 0] });
    P(sph(0.064, 8, 6), C.steelL, `elbow${S}`, [0.47 * s, 1.46, 0]);
    P(cyl(0.066, 0.066, 0.012, 8), C.steel, `elbow${S}`, [0.47 * s, 1.465, -0.062], { dir: [0, 0, -1] });
    P(cyl(0.026, 0.026, 0.012, 8), C.gold, `elbow${S}`, [0.47 * s, 1.465, -0.071], { dir: [0, 0, -1] });
    P(cyl(0.046, 0.052, 0.22), C.steel, `elbow${S}`, [0.6 * s, 1.46, 0], { dir: [s, 0, 0] });
    // gauntlet
    P(cyl(0.048, 0.066, 0.07), C.steelL, `wrist${S}`, [0.735 * s, 1.46, 0], { dir: [s, 0, 0] });
    P(cyl(0.068, 0.068, 0.01, 8), C.gold, `wrist${S}`, [0.703 * s, 1.46, 0], { dir: [s, 0, 0] });
    P(box(0.08, 0.04, 0.095), C.steelD, `wrist${S}`, [0.785 * s, 1.46, 0]);
    P(box(0.015, 0.014, 0.09), C.gold, `wrist${S}`, [0.815 * s, 1.482, 0]);
    P(box(0.05, 0.032, 0.085), C.steel, `finger${S}1`, [0.835 * s, 1.458, 0]);
    P(box(0.055, 0.027, 0.08), C.steelD, `finger${S}2`, [0.888 * s, 1.456, 0]);
    b.capsule([0.76 * s, 1.455, 0.035], [0.79 * s, 1.455, 0.075], 0.016, { color: C.steelD, bone: `thumb${S}1`, sides: 6 });
    b.capsule([0.79 * s, 1.455, 0.075], [0.812 * s, 1.455, 0.103], 0.014, { color: C.steel, bone: `thumb${S}2`, sides: 6 });
  }

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = 0.1 * s;
    const hip = `hip${S}`;
    const knee = `knee${S}`;
    const ankle = `ankle${S}`;
    P(cyl(0.088, 0.072, 0.36, 8), C.steel, hip, [x, 0.74, 0.01]);
    // tasset
    P(box(0.13, 0.12, 0.02), C.steelL, hip, [0.12 * s, 0.86, 0.125], { rotation: [-12, 0, 0] });
    P(box(0.134, 0.012, 0.024), C.gold, hip, [0.12 * s, 0.802, 0.137], { rotation: [-12, 0, 0] });
    rivet(hip, [0.12 * s, 0.9, 0.14], 0.009);
    // knee
    P(sph(0.068, 8, 6), C.steelL, knee, [x, 0.53, 0.035], { scale: [1, 1.05, 0.9] });
    P(cyl(0.056, 0.056, 0.012, 8), C.steel, knee, [x + 0.065 * s, 0.53, 0.02], { dir: [s, 0, 0] });
    P(cyl(0.026, 0.026, 0.012, 8), C.gold, knee, [x, 0.53, 0.096], { dir: [0, 0, 1] });
    // greave
    P(cyl(0.064, 0.052, 0.36, 8), C.steel, knee, [x, 0.31, 0.005]);
    P(box(0.012, 0.3, 0.012), C.steelL, knee, [x, 0.31, 0.062]);
    P(cyl(0.058, 0.058, 0.015, 8), C.gold, knee, [x, 0.14, 0.005]);
    // sabaton
    P(box(0.105, 0.08, 0.13), C.steelD, ankle, [x, 0.04, -0.005]);
    [0.075, 0.062, 0.05].forEach((h, k) => P(box(0.1, h, 0.04), k % 2 ? C.steelL : C.steel, ankle, [x, h / 2, 0.075 + 0.03 * k]));
    P(box(0.096, 0.05, 0.07), C.steelL, `toe${S}`, [x, 0.025, 0.155]);
    P(new THREE.ConeGeometry(0.045, 0.07, 4), C.steel, `toe${S}`, [x, 0.024, 0.22], { dir: [0, 0, 1], scale: [1, 1, 0.55] });
    // spur
    b.rod([x, 0.06, -0.07], [x, 0.06, -0.115], 0.006, { color: C.gold, bone: ankle, sides: 6 });
    P(cyl(0.018, 0.018, 0.006, 6), C.gold, ankle, [x, 0.06, -0.125], { dir: [1, 0, 0] });
  }

  // ---------------------------------------------------------------- sword in scabbard (left hip)
  const top = new THREE.Vector3(0.21, 0.97, 0.07);
  const tip = new THREE.Vector3(0.3, 0.3, -0.16);
  const up = top.clone().sub(tip).normalize();
  b.rod(top, tip, [0.03, 0.022], { color: C.leather, bone: "hips", sides: 6 });
  P(cyl(0.034, 0.034, 0.03, 6), C.gold, "hips", top.clone().addScaledVector(up, -0.03).toArray(), { dir: up });
  P(new THREE.ConeGeometry(0.024, 0.06, 6), C.gold, "hips", tip.clone().addScaledVector(up, -0.02).toArray(), {
    dir: up.clone().negate(),
  });
  P(box(0.2, 0.025, 0.035), C.gold, "hips", top.clone().addScaledVector(up, 0.012).toArray(), { dir: up });
  P(cyl(0.016, 0.018, 0.12, 6), C.leatherD, "hips", top.clone().addScaledVector(up, 0.085).toArray(), { dir: up });
  P(sph(0.028, 8, 6), C.gold, "hips", top.clone().addScaledVector(up, 0.16).toArray());
  P(sph(0.011, 6, 4), C.crimson, "hips", top.clone().addScaledVector(up, 0.16).add(new THREE.Vector3(0, 0, 0.022)).toArray());

  // ---------------------------------------------------------------- shield (left forearm)
  const heater = [
    [-0.2, 0.24, "sharp"],
    [0.2, 0.24, "sharp"],
    [0.2, 0.04],
    [0.15, -0.12],
    [0.07, -0.23],
    [0, -0.29, "sharp"],
    [-0.07, -0.23],
    [-0.15, -0.12],
    [-0.2, 0.04],
  ] as const;
  const scaled = heater.map((p) => (p.length === 3 ? [p[0] * 0.88, p[1] * 0.88 + 0.005, p[2]] : [p[0] * 0.88, p[1] * 0.88 + 0.005]));
  const shieldPaint = paint((p, n, s) => {
    if (n.z < -0.6) return C.wood;
    if (n.z < 0.6) return C.gold;
    const [x, y] = s;
    const yc = 0.06 - 0.8 * Math.abs(x);
    if (Math.abs(y - yc) < 0.042) return C.gold;
    if (Math.abs(y - yc) < 0.05) return C.goldD;
    for (const [cx, cy] of [[-0.095, 0.14], [0.095, 0.14], [0, -0.13]])
      if (Math.hypot(x - cx, y - cy) < 0.04) return C.cream;
    return C.navy;
  });
  const shieldAt = [0.6, 1.47, 0.09];
  b.extrude(heater, { color: C.gold, at: shieldAt, x: [1, 0, 0], y: [0, 1, 0], thickness: 0.024, bone: "elbowL", smoothing: 1 });
  b.extrude(scaled, {
    color: shieldPaint,
    at: [0.6, 1.47, 0.0925],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.024,
    bone: "elbowL",
    smoothing: 1,
  });
  P(box(0.03, 0.03, 0.05), C.leather, "elbowL", [0.55, 1.46, 0.06]);
  P(box(0.03, 0.03, 0.05), C.leather, "elbowL", [0.66, 1.46, 0.06]);

  return b.root;
}
```