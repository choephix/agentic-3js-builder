```ts
import * as THREE from "three";
import { createBuilder, paint, grain, mottle, cells, svg, DEG } from "agentic-3js-builder";

const fract = (x: number) => x - Math.floor(x);

export const meta = {
  name: "Explorer's Brass Telescope",
  description:
    "A polished brass refracting telescope with leather-wrapped sections, engraved rings, a finder scope, focusing knobs and a rubber eyecup, on a mahogany twin-rail tripod with brass fittings and an accessory tray holding a rolled star chart.",
};

export default function build() {
  const b = createBuilder({ name: "explorers_telescope", paintSize: 2048 });

  // ---------------------------------------------------------------- palette & materials
  const BRASS = "#c8963e";
  const BRASS_DK = "#7a5420";
  const BRASS_HI = "#e9c983";
  const RUBBER = "#19191b";
  const GLASS = "#163246";
  const GLASS_HI = "#9fd0e4";
  const RIBBON = "#a01e2b";
  const shine = (c: string, metal: number, rough: number) => {
    const m = b.material(c);
    m.metalness = metal;
    m.roughness = rough;
  };
  shine(BRASS, 0.55, 0.3);
  shine(BRASS_DK, 0.5, 0.4);
  shine(BRASS_HI, 0.6, 0.25);
  shine(RUBBER, 0, 0.95);
  shine(GLASS, 0.3, 0.05);
  shine(GLASS_HI, 0.2, 0.1);
  const pm = b.ctx.paintMaterial();
  pm.roughness = 0.55;
  pm.metalness = 0.12;

  // ---------------------------------------------------------------- paints
  const wood = grain("#7b2f1d", "#4a1a10", { size: 0.004, axis: "y", seed: 3 });
  const woodX = grain("#7b2f1d", "#4a1a10", { size: 0.004, axis: "x", seed: 4 });
  const leatherBase = mottle("#5b3320", "#3f2213", { size: 0.012, seed: 5 });
  const leather = paint((p, n, s) => {
    const [u, v] = s;
    if (Math.abs(v - 0.05) < 0.014 || Math.abs(v - 0.95) < 0.014) return fract(u * 48) < 0.55 ? "#e6d3a3" : "#3a1f10";
    const seam = fract(u + v * 5);
    if (seam < 0.035) return "#24130a";
    if (seam < 0.07) return "#7a4a2c";
    return leatherBase;
  });
  const engraved = paint((p, n, s) => {
    const [u, v] = s;
    if (v < 0.13 || v > 0.87) return "#5c3f12";
    if (v < 0.2 || v > 0.8) return "#ecc778";
    const w = 0.5 + 0.2 * Math.sin(u * Math.PI * 2 * 14);
    if (Math.abs(v - w) < 0.06) return "#4a3010";
    const w2 = 0.5 - 0.2 * Math.sin(u * Math.PI * 2 * 14);
    if (Math.abs(v - w2) < 0.035) return "#8a6424";
    return BRASS;
  });
  const drawScale = paint((p, n, s) => {
    const [u, v] = s;
    if (fract(v * 4) < 0.025) return "#4a3010";
    if (fract(v * 20) < 0.05 && fract(u * 2) < 0.25) return "#5c3f12";
    return BRASS_HI;
  });
  const parchment = mottle("#ead8a8", "#c9ab72", { size: 0.015, seed: 8 });

  // ---------------------------------------------------------------- skeleton
  b.joint("root", { at: [0, 0, 0] });
  b.joint("azimuth", { parent: "root", at: [0, 1.17, 0], dir: [0, 1, 0] });
  const A = 22 * DEG;
  const d = new THREE.Vector3(0, Math.sin(A), Math.cos(A));
  const U = new THREE.Vector3(0, Math.cos(A), -Math.sin(A));
  const X = new THREE.Vector3(1, 0, 0);
  const C = new THREE.Vector3(0, 1.34, 0);
  b.joint("altitude", { parent: "azimuth", at: C, dir: d, role: "hinge" });

  const P = (s: number, up = 0, side = 0) =>
    C.clone().addScaledVector(d, s).addScaledVector(U, up).addScaledVector(X, side);
  const tseg = (
    s0: number,
    s1: number,
    rBack: number,
    rFront: number,
    color: any,
    seg = 24,
    up = 0,
  ) =>
    b.part(new THREE.CylinderGeometry(rFront, rBack, s1 - s0, seg), color, {
      at: P((s0 + s1) / 2, up),
      dir: d,
      bone: "altitude",
    });
  const bead = (s: number, r: number, tube: number, color: string, up = 0) =>
    b.part(new THREE.TorusGeometry(r, tube, 6, 28), color, { at: P(s, up), dir: d, axis: "z", bone: "altitude" });

  // ---------------------------------------------------------------- main tube
  const mainTube = tseg(-0.53, 0.43, 0.055, 0.055, BRASS, 24);
  tseg(-0.57, -0.555, 0.058, 0.058, BRASS_DK, 24);
  tseg(-0.56, -0.52, 0.063, 0.063, engraved, 28);
  for (let k = 0; k < 6; k++) {
    const ang = (k / 6) * Math.PI * 2 + 0.3;
    b.part(new THREE.SphereGeometry(0.0045, 8, 6), BRASS_HI, {
      at: P(-0.572, 0.05 * Math.sin(ang), 0.05 * Math.cos(ang)),
      bone: "altitude",
    });
  }
  tseg(-0.47, -0.22, 0.059, 0.059, leather, 28);
  bead(-0.47, 0.059, 0.004, BRASS_HI);
  tseg(-0.225, -0.195, 0.062, 0.062, engraved, 28);
  tseg(-0.035, 0.035, 0.066, 0.066, engraved, 28); // trunnion collar
  tseg(0.07, 0.095, 0.062, 0.062, engraved, 28);
  tseg(0.185, 0.21, 0.062, 0.062, engraved, 28);
  tseg(0.2, 0.38, 0.059, 0.059, leather, 28);
  tseg(0.375, 0.4, 0.062, 0.062, engraved, 28);

  // objective cell / dew shield
  b.lathe(
    [
      [0.05, 0],
      [0.062, 0],
      [0.066, 0.012],
      [0.066, 0.165],
      [0.073, 0.172],
      [0.073, 0.2],
      [0.067, 0.205],
      [0.061, 0.2],
      [0.061, 0.04],
      [0.05, 0.04],
    ],
    { color: BRASS, at: P(0.42), axis: d, segments: 28, bone: "altitude" },
  );
  tseg(0.47, 0.5, 0.0675, 0.0675, engraved, 28);
  tseg(0.588, 0.62, 0.0745, 0.0745, engraved, 28);
  bead(0.43, 0.064, 0.0035, BRASS_HI);
  tseg(0.459, 0.465, 0.06, 0.06, GLASS, 28);
  bead(0.467, 0.048, 0.0016, GLASS_HI);
  b.part(new THREE.SphereGeometry(0.008, 8, 6), GLASS_HI, {
    at: P(0.466, 0.025, -0.02),
    scale: [1, 0.25, 1],
    dir: d,
    bone: "altitude",
  });

  // maker's plaque
  const plaque = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 100"><rect x="3" y="3" width="354" height="94" rx="14" fill="#d8ad5c" stroke="#5a3a10" stroke-width="5"/><rect x="13" y="13" width="334" height="74" rx="8" fill="none" stroke="#7a5420" stroke-width="2"/><circle cx="34" cy="50" r="9" fill="#7a5420"/><circle cx="326" cy="50" r="9" fill="#7a5420"/><text x="180" y="52" font-family="Georgia, serif" font-size="28" font-weight="bold" fill="#3d2508" text-anchor="middle">J. HARGREAVE &amp; SONS</text><text x="180" y="78" font-family="Georgia, serif" font-size="17" fill="#3d2508" text-anchor="middle" letter-spacing="3">LONDON · No. 1874</text></svg>`,
    { size: 512 },
  );
  b.decal(mainTube, plaque, { at: P(-0.11, 0, 0.055), dir: [1, 0, 0], up: U, size: [0.12, 0.034] });

  // ---------------------------------------------------------------- focuser & eyepiece
  tseg(-0.62, -0.565, 0.04, 0.04, BRASS, 20);
  tseg(-0.72, -0.6, 0.032, 0.032, drawScale, 20);
  b.part(new THREE.BoxGeometry(0.03, 0.08, 0.022), BRASS_DK, {
    at: P(-0.66, -0.036),
    dir: d,
    up: U,
    bone: "altitude",
  });
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.13, 8), BRASS_DK, {
    at: P(-0.6, -0.028),
    dir: X,
    bone: "altitude",
  });
  for (const sg of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.021, 0.021, 0.016, 14), BRASS_HI, {
      at: P(-0.6, -0.028, 0.058 * sg),
      dir: X,
      flat: true,
      bone: "altitude",
    });
    b.part(new THREE.CylinderGeometry(0.013, 0.016, 0.007, 14), BRASS_DK, {
      at: P(-0.6, -0.028, 0.069 * sg),
      dir: X,
      bone: "altitude",
    });
  }
  tseg(-0.76, -0.72, 0.024, 0.024, BRASS_DK, 16);
  tseg(-0.79, -0.755, 0.029, 0.029, BRASS, 20);
  bead(-0.757, 0.029, 0.003, BRASS_HI);
  b.lathe(
    [
      [0.02, 0],
      [0.03, 0],
      [0.036, 0.04],
      [0.031, 0.045],
      [0.025, 0.012],
      [0.018, 0.012],
    ],
    { color: RUBBER, at: P(-0.79), axis: d.clone().negate(), segments: 20, bone: "altitude" },
  );
  tseg(-0.804, -0.8, 0.018, 0.018, GLASS, 16);

  // ---------------------------------------------------------------- finder scope
  const FU = 0.1;
  tseg(-0.24, 0.18, 0.018, 0.018, BRASS, 16, FU);
  tseg(-0.09, 0.07, 0.0195, 0.0195, leather, 16, FU);
  tseg(0.16, 0.24, 0.022, 0.022, BRASS_DK, 16, FU);
  bead(0.24, 0.022, 0.0025, BRASS_HI, FU);
  tseg(0.233, 0.237, 0.019, 0.019, GLASS, 16, FU);
  tseg(-0.28, -0.24, 0.011, 0.011, BRASS_DK, 12, FU);
  tseg(-0.3, -0.28, 0.011, 0.014, RUBBER, 12, FU);
  for (const s of [-0.14, 0.14]) {
    bead(s, 0.0225, 0.0045, BRASS, FU);
    b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.025, 8), BRASS_DK, { at: P(s, 0.066), dir: U, bone: "altitude" });
    b.part(new THREE.BoxGeometry(0.03, 0.008, 0.035), BRASS, { at: P(s, 0.057), dir: U, up: d, bone: "altitude" });
    for (const ang of [45, 135]) {
      const r = ang * DEG;
      const dirv = U.clone().multiplyScalar(Math.sin(r)).addScaledVector(X, Math.cos(r));
      b.part(new THREE.CylinderGeometry(0.003, 0.003, 0.02, 6), BRASS_DK, {
        at: P(s, FU + 0.03 * Math.sin(r), 0.03 * Math.cos(r)),
        dir: dirv,
        bone: "altitude",
      });
      b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.005, 8), BRASS_HI, {
        at: P(s, FU + 0.04 * Math.sin(r), 0.04 * Math.cos(r)),
        dir: dirv,
        flat: true,
        bone: "altitude",
      });
    }
  }

  // ---------------------------------------------------------------- trunnions & yoke
  b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.22, 12), BRASS_DK, { at: C, dir: X, bone: "altitude" });
  for (const sg of [-1, 1]) {
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.014, 14), BRASS_HI, {
      at: [0.104 * sg, C.y, 0],
      dir: X,
      flat: true,
      bone: "altitude",
    });
    b.part(new THREE.BoxGeometry(0.008, 0.06, 0.009), BRASS, { at: [0.115 * sg, C.y, 0], bone: "altitude" });
    b.part(new THREE.BoxGeometry(0.012, 0.115, 0.062), BRASS, { at: [0.085 * sg, 1.2825, 0], bone: "azimuth" });
    b.part(new THREE.CylinderGeometry(0.031, 0.031, 0.012, 20), BRASS, {
      at: [0.085 * sg, C.y, 0],
      dir: X,
      bone: "azimuth",
    });
  }
  b.part(new THREE.BoxGeometry(0.184, 0.025, 0.075), BRASS, { at: [0, 1.2305, 0], bone: "azimuth" });
  b.part(new THREE.CylinderGeometry(0.04, 0.045, 0.04, 16), BRASS_DK, { at: [0, 1.198, 0], bone: "azimuth" });
  b.part(new THREE.CylinderGeometry(0.062, 0.062, 0.012, 24), engraved, { at: [0, 1.172, 0], bone: "azimuth" });
  b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.03, 6), BRASS_DK, { at: [0, 1.198, 0.055], dir: [0, 0, 1], bone: "azimuth" });
  b.part(new THREE.SphereGeometry(0.011, 10, 8), BRASS_HI, { at: [0, 1.198, 0.072], bone: "azimuth" });

  // ---------------------------------------------------------------- tripod head
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.045, 28), woodX, { at: [0, 1.1375, 0], bone: "root" });
  b.part(new THREE.CylinderGeometry(0.1335, 0.1335, 0.014, 28), engraved, { at: [0, 1.14, 0], bone: "root" });
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.006, 24), BRASS, { at: [0, 1.162, 0], bone: "root" });
  b.part(new THREE.CylinderGeometry(0.05, 0.045, 0.04, 16), BRASS_DK, { at: [0, 1.095, 0], bone: "root" });
  b.part(new THREE.SphereGeometry(0.024, 12, 8), BRASS_HI, { at: [0, 1.072, 0], bone: "root" });

  // ---------------------------------------------------------------- legs
  const legR = (y: number) => 0.09 + (0.47 * (1.1 - y)) / 1.1;
  for (const deg of [0, 120, 240]) {
    const a = deg * DEG;
    const rad = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const tan = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
    const L = (y: number, t = 0) => rad.clone().multiplyScalar(legR(y)).setY(y).addScaledVector(tan, t);
    const opts = { up: rad, bone: "root" };

    for (const sg of [-1, 1])
      b.frustumBox(L(1.1, 0.028 * sg), L(0.08, 0.012 * sg), [0.022, 0.03], [0.02, 0.026], { color: wood, ...opts });

    // hinge block, bolt, wing nut
    const blockC = rad.clone().multiplyScalar(0.1).setY(1.09);
    b.part(new THREE.BoxGeometry(0.075, 0.05, 0.042), BRASS, { at: blockC, rotation: [0, deg, 0], bone: "root" });
    b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.115, 8), BRASS_DK, { at: blockC, dir: tan, bone: "root" });
    b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.007, 6), BRASS_DK, {
      at: blockC.clone().addScaledVector(tan, -0.058),
      dir: tan,
      flat: true,
      bone: "root",
    });
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.008, 6), BRASS_HI, {
      at: blockC.clone().addScaledVector(tan, 0.06),
      dir: tan,
      flat: true,
      bone: "root",
    });
    b.part(new THREE.BoxGeometry(0.036, 0.006, 0.01), BRASS_HI, {
      at: blockC.clone().addScaledVector(tan, 0.067),
      dir: tan,
      bone: "root",
    });

    // mid clamp with thumbscrew
    b.frustumBox(L(0.67), L(0.62), [0.075, 0.044], [0.075, 0.044], { color: BRASS, ...opts });
    const clampC = L(0.645);
    b.rod(clampC.clone().addScaledVector(rad, 0.02), clampC.clone().addScaledVector(rad, 0.042), 0.005, {
      color: BRASS_DK,
      bone: "root",
    });
    b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.01, 10), BRASS_HI, {
      at: clampC.clone().addScaledVector(rad, 0.046),
      dir: rad,
      flat: true,
      bone: "root",
    });

    // low spacer
    b.frustumBox(L(0.27), L(0.25), [0.06, 0.036], [0.06, 0.036], { color: BRASS_DK, ...opts });

    // tray bracket & brace
    b.frustumBox(L(0.43), L(0.39), [0.07, 0.04], [0.07, 0.04], { color: BRASS_DK, ...opts });
    b.rod(rad.clone().multiplyScalar(0.185).setY(0.412), L(0.41), 0.007, { color: BRASS, bone: "root" });

    // brass shoe and spike
    b.rod(L(0.15), L(0.03), [0.027, 0.02], { color: BRASS, bone: "root" });
    b.part(new THREE.TorusGeometry(0.027, 0.004, 6, 16), BRASS_HI, { at: L(0.15), dir: L(0.03).sub(L(0.15)), axis: "z", bone: "root" });
    b.spike(L(0.035), L(-0.006), null, 0.013, { color: BRASS_DK, bone: "root" });
  }

  // ---------------------------------------------------------------- accessory tray
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 32), woodX, { at: [0, 0.415, 0], bone: "root" });
  b.part(new THREE.TorusGeometry(0.2, 0.006, 6, 40), BRASS, { at: [0, 0.415, 0], rotation: [90, 0, 0], bone: "root" });
  b.part(new THREE.TorusGeometry(0.192, 0.004, 6, 40), BRASS_HI, { at: [0, 0.453, 0], rotation: [90, 0, 0], bone: "root" });
  for (let k = 0; k < 20; k++) {
    const ang = (k / 20) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.0035, 0.0035, 0.028, 6), BRASS, {
      at: [0.192 * Math.sin(ang), 0.439, 0.192 * Math.cos(ang)],
      bone: "root",
    });
  }

  // unrolled star chart
  const chartC = new THREE.Vector3(0.02, 0.426, 0.07);
  const th = 12 * DEG;
  const [ct, st] = [Math.cos(th), Math.sin(th)];
  const starChart = paint((p) => {
    const dx = p.x - chartC.x;
    const dz = p.z - chartC.z;
    const lx = dx * ct - dz * st;
    const lz = dx * st + dz * ct;
    if (Math.abs(lx) > 0.08 || Math.abs(lz) > 0.055) return "#e6d2a0";
    if (Math.abs(lx) > 0.076 || Math.abs(lz) > 0.051) return "#c9a24a";
    const big = cells(p, 0.03, 12);
    if (big.d1 < 0.09 && big.id > 0.35) return "#ffe48f";
    const small = cells(p, 0.009, 11);
    if (small.d1 < 0.11 && small.id > 0.45) return "#f6f0d6";
    const rr = Math.hypot(lx, lz - 0.01);
    if (Math.abs(fract(rr * 45) - 0.5) > 0.47) return "#43609a";
    const ang = Math.atan2(lz - 0.01, lx);
    const k = Math.round(ang / (Math.PI / 6)) * (Math.PI / 6);
    if (rr * Math.abs(Math.sin(ang - k)) < 0.0006) return "#3a548a";
    if (Math.abs(lz - 0.01 - 0.025 * Math.sin(lx * 30)) < 0.0012) return "#b8913e";
    return "#14224a";
  });
  b.part(new THREE.BoxGeometry(0.17, 0.002, 0.12), starChart, { at: chartC, rotation: [0, 12, 0], bone: "root" });

  // rolled star chart
  const sAxis = new THREE.Vector3(Math.sin(55 * DEG), 0, Math.cos(55 * DEG));
  const sC = new THREE.Vector3(-0.075, 0.449, -0.035);
  const scroll = paint((p, n) => {
    const rel = p.clone().sub(sC);
    const along = rel.dot(sAxis);
    const r = rel.addScaledVector(sAxis, -along).length();
    if (Math.abs(n.dot(sAxis)) > 0.8) return fract(r * 260) < 0.3 ? "#8f6f3c" : "#efe0b6";
    if (Math.abs(along) > 0.08) return "#b8975c";
    if (Math.abs(fract(along * 60) - 0.5) < 0.04 && r > 0) return "#a88a55";
    return parchment;
  });
  b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.18, 20), scroll, { at: sC, dir: sAxis, bone: "root" });
  b.part(new THREE.TorusGeometry(0.0255, 0.0032, 6, 20), RIBBON, { at: sC.clone().addScaledVector(sAxis, 0.02), dir: sAxis, axis: "z", bone: "root" });
  b.part(new THREE.SphereGeometry(0.0065, 8, 6), RIBBON, { at: sC.clone().addScaledVector(sAxis, 0.02).setY(0.476), bone: "root" });
  for (const sg of [-1, 1])
    b.part(new THREE.BoxGeometry(0.012, 0.003, 0.03), RIBBON, {
      at: sC.clone().addScaledVector(sAxis, 0.02 + sg * 0.012).setY(0.474),
      rotation: [0, 55 + sg * 30, sg * 25],
      bone: "root",
    });

  // objective lens cap resting in the tray
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.022, 28), BRASS, { at: [0.105, 0.436, -0.075], bone: "root" });
  b.part(new THREE.TorusGeometry(0.046, 0.0018, 6, 28), BRASS_DK, { at: [0.105, 0.4475, -0.075], rotation: [90, 0, 0], bone: "root" });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.006, 12), BRASS_HI, { at: [0.105, 0.45, -0.075], bone: "root" });

  // a pencil on the chart
  const pDir = new THREE.Vector3(Math.cos(-25 * DEG), 0, Math.sin(-25 * DEG));
  const pC = new THREE.Vector3(0.05, 0.4315, 0.09);
  b.part(new THREE.CylinderGeometry(0.0045, 0.0045, 0.09, 6), "#2f5d3a", { at: pC, dir: pDir, flat: true, bone: "root" });
  b.part(new THREE.ConeGeometry(0.0045, 0.014, 6), "#e2c08d", {
    at: pC.clone().addScaledVector(pDir, 0.052),
    dir: pDir,
    flat: true,
    bone: "root",
  });
  b.part(new THREE.ConeGeometry(0.0015, 0.005, 6), "#333333", {
    at: pC.clone().addScaledVector(pDir, 0.0615),
    dir: pDir,
    bone: "root",
  });
  b.part(new THREE.CylinderGeometry(0.0047, 0.0047, 0.008, 6), BRASS_HI, {
    at: pC.clone().addScaledVector(pDir, -0.047),
    dir: pDir,
    bone: "root",
  });

  return b.root;
}
```