```ts
import * as THREE from "three";
import { createBuilder, grain, paint, mix, smoothstep, svg, catmull, bezier } from "agentic-3js-builder";

export const meta = {
  name: "Gramophone",
  description:
    "A Victorian horn gramophone: a mahogany cabinet with gilt beading and corner pilasters, a felt turntable carrying a grooved shellac record, a brass tonearm and soundbox, and a crimson morning-glory horn with gilded petal seams.",
};

export default function build() {
  const b = createBuilder({ name: "gramophone", paintSize: 2048 });
  b.joint("root", { at: [0, 0, 0] });
  b.joint("turntable", { parent: "root", at: [0, 0.213, 0.02], dir: [0, 1, 0] });
  b.joint("tonearm", { parent: "root", at: [0, 0.3, -0.14], dir: [0, 1, 0], role: "hinge" });
  b.joint("crank", { parent: "root", at: [0.185, 0.12, 0.04], dir: [1, 0, 0], role: "hinge" });

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const P = (geo: THREE.BufferGeometry, color: any, at: any, bone = "root", extra: any = {}) =>
    b.part(geo, color, { at, bone, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg = 12) => new THREE.CylinderGeometry(rt, rb, h, seg);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // Palette
  const GOLD = "#e0b956";
  const BRASS = "#b8913e";
  const DARKBRASS = "#8a6a2a";
  const NICKEL = "#cfd0d6";
  const BLACK = "#121214";
  const FELT = "#1f4d2e";
  const WOOD_DARK = "#3a160a";

  const wood = grain("#5a2614", "#7f3d1f", { size: 0.006, axis: "x", seed: 2 });
  const woodSide = grain("#5a2614", "#7f3d1f", { size: 0.006, axis: "z", seed: 3 });
  const panelWood = grain("#3d170b", "#5e2914", { size: 0.005, axis: "y", seed: 5 });
  const pillarWood = grain("#45190b", "#6a2f17", { size: 0.004, axis: "y", seed: 7 });

  // ---------------- Cabinet ----------------
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    P(cyl(0.022, 0.016, 0.026, 10), WOOD_DARK, [sx * 0.155, 0.017, sz * 0.155]);
    P(cyl(0.017, 0.017, 0.004, 10), GOLD, [sx * 0.155, 0.002, sz * 0.155]);
  }
  P(box(0.36, 0.03, 0.36), wood, [0, 0.043, 0]);
  P(box(0.33, 0.006, 0.33), GOLD, [0, 0.061, 0]);
  P(box(0.32, 0.13, 0.32), woodSide, [0, 0.123, 0]);
  P(box(0.33, 0.006, 0.33), GOLD, [0, 0.185, 0]);
  P(box(0.35, 0.014, 0.35), wood, [0, 0.195, 0]);
  P(box(0.34, 0.006, 0.34), wood, [0, 0.205, 0]);

  // corner pilasters with gilt rings
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    P(cyl(0.016, 0.016, 0.12, 8), pillarWood, [sx * 0.16, 0.123, sz * 0.16]);
    P(cyl(0.019, 0.019, 0.008, 8), GOLD, [sx * 0.16, 0.064, sz * 0.16]);
    P(cyl(0.019, 0.019, 0.008, 8), GOLD, [sx * 0.16, 0.182, sz * 0.16]);
    P(new THREE.SphereGeometry(0.006, 8, 6), GOLD, [sx * 0.16, 0.123, sz * 0.16 + sz * 0.015]);
  }

  // raised panels with gold beading
  for (const [sx, sz] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
    const side = sx !== 0;
    const at = [sx * 0.16, 0.123, sz * 0.16];
    P(box(side ? 0.006 : 0.24, 0.095, side ? 0.24 : 0.006), GOLD, at);
    P(box(side ? 0.009 : 0.23, 0.085, side ? 0.23 : 0.009), panelWood, at);
    // little gilt rosettes at the panel corners
    for (const [u, v] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const x = side ? sx * 0.1655 : u * 0.105;
      const z = side ? u * 0.105 : sz * 0.1655;
      P(new THREE.SphereGeometry(0.004, 6, 4), GOLD, [x, 0.123 + v * 0.032, z]);
    }
  }
  // right-side medallion (opposite the crank)
  P(cyl(0.02, 0.02, 0.004, 12), GOLD, [-0.1665, 0.123, 0], "root", { dir: [-1, 0, 0] });
  P(cyl(0.013, 0.013, 0.004, 12), "#7a1420", [-0.168, 0.123, 0], "root", { dir: [-1, 0, 0] });

  // front name plaque
  const plaque = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 90">
      <rect x="4" y="4" width="232" height="82" rx="20" fill="#2a1206" stroke="#e3bd5f" stroke-width="7"/>
      <rect x="16" y="15" width="208" height="60" rx="12" fill="none" stroke="#b58a35" stroke-width="2"/>
      <text x="120" y="55" font-family="Georgia, serif" font-size="26" font-weight="bold" fill="#f0cf72" text-anchor="middle" letter-spacing="3">PHONOLA</text>
      <path d="M24 45 q9 -11 18 0 q-9 11 -18 0z M198 45 q9 -11 18 0 q-9 11 -18 0z" fill="#e3bd5f"/>
    </svg>`,
    { size: 512 },
  );
  P(new THREE.PlaneGeometry(0.1, 0.0375), "#ffffff", [0, 0.123, 0.1652], "root", { texture: plaque });

  // ---------------- Turntable ----------------
  P(cyl(0.13, 0.13, 0.01, 32), BRASS, [0, 0.213, 0.02], "turntable");
  P(cyl(0.126, 0.126, 0.003, 32), FELT, [0, 0.2195, 0.02], "turntable");
  const record = paint((p) => {
    const dx = p.x;
    const dz = p.z - 0.02;
    const r = Math.hypot(dx, dz);
    if (r > 0.117 || p.y < 0.2235) return "#101012";
    const g = 0.5 + 0.5 * Math.sin(r * 2600);
    let c = mix("#0b0b0d", "#1d1d23", g * 0.7);
    const ang = Math.atan2(dz, dx);
    const sheen = Math.pow(Math.abs(Math.cos(ang - 0.6)), 24);
    if (r > 0.043 && r < 0.115) c = mix(c, "#707080", sheen * 0.55);
    if (r < 0.047) c = mix("#050505", c, smoothstep(0.044, 0.047, r));
    return c;
  });
  P(cyl(0.12, 0.12, 0.003, 32), record, [0, 0.2225, 0.02], "turntable");
  const label = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="100" fill="#9b1422"/>
      <circle cx="100" cy="100" r="90" fill="none" stroke="#e8c25e" stroke-width="4"/>
      <circle cx="100" cy="100" r="34" fill="none" stroke="#e8c25e" stroke-width="2"/>
      <text x="100" y="62" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#f2d27a" text-anchor="middle">MELODY</text>
      <text x="100" y="158" font-family="Georgia, serif" font-size="22" fill="#f2d27a" text-anchor="middle">78 R.P.M.</text>
      <path d="M40 100 h22 M138 100 h22" stroke="#e8c25e" stroke-width="3"/>
      <circle cx="100" cy="100" r="7" fill="#111"/>
    </svg>`,
    { size: 256 },
  );
  P(new THREE.CircleGeometry(0.042, 24), "#ffffff", [0, 0.2243, 0.02], "turntable", {
    texture: label,
    rotation: [-90, 0, 0],
  });
  P(cyl(0.004, 0.004, 0.014, 8), NICKEL, [0, 0.231, 0.02], "turntable");
  P(new THREE.SphereGeometry(0.0045, 8, 6), NICKEL, [0, 0.238, 0.02], "turntable");

  // ---------------- Tonearm post & elbow ----------------
  P(cyl(0.035, 0.04, 0.008, 16), BRASS, [0, 0.212, -0.14]);
  P(cyl(0.02, 0.02, 0.082, 12), BRASS, [0, 0.249, -0.14]);
  P(new THREE.TorusGeometry(0.022, 0.004, 6, 16), GOLD, [0, 0.27, -0.14], "root", { rotation: [90, 0, 0] });
  P(new THREE.SphereGeometry(0.03, 14, 10), BRASS, [0, 0.302, -0.14]);

  // ---------------- Horn ----------------
  const n0 = V(0, 0.31, -0.15);
  const n1 = V(0, 0.44, -0.21);
  const n2 = V(0, 0.51, -0.13);
  const hornBase = V(0, 0.54, -0.04);
  const hornDir = hornBase.clone().sub(n2).normalize();
  b.sweep(bezier(n0, n1, n2, hornBase), [0.022, 0.044], { color: BRASS, bone: "root" });
  P(new THREE.TorusGeometry(0.024, 0.005, 6, 16), GOLD, n0.clone(), "root", {
    dir: n1.clone().sub(n0),
    axis: "z",
  });
  P(new THREE.TorusGeometry(0.046, 0.006, 6, 20), GOLD, hornBase.clone(), "root", { dir: hornDir, axis: "z" });

  const L = 0.4;
  const k = Math.log(0.24 / 0.045) / L;
  const rAt = (h: number) => 0.045 * Math.exp(k * h);
  const outline: [number, number][] = [];
  for (let i = 0; i <= 8; i++) outline.push([rAt((i / 8) * L), (i / 8) * L]);
  outline.push([0.244, 0.403]);
  for (let i = 8; i >= 0; i--) outline.push([rAt((i / 8) * L) - 0.004, (i / 8) * L]);

  const hornPaint = paint((p, n, s) => {
    const rel = p.clone().sub(hornBase);
    const h = rel.dot(hornDir);
    const radial = rel.addScaledVector(hornDir, -h);
    const rad = radial.length();
    const outer = radial.dot(n) > 0;
    const height = s[0];
    if (!outer) return mix("#5e3c0e", "#f2d27f", smoothstep(0.04, 0.38, height));
    const d = (((s[1] % 36) + 36) % 36);
    const edgeDeg = Math.min(d, 36 - d);
    const edgeM = (edgeDeg * Math.PI) / 180 * rad;
    if (edgeM < 0.0028) return "#e6c160";
    if (height > 0.35 && height < 0.358) return "#e6c160";
    let c = mix("#3e070c", "#a0182a", smoothstep(0.0, 0.38, height));
    const mid = Math.pow(1 - edgeDeg / 18, 2);
    c = mix(c, "#c63445", mid * 0.25);
    return c;
  });
  b.lathe(outline, { color: hornPaint, at: hornBase.clone(), axis: hornDir, segments: 10, bone: "root" });
  P(new THREE.TorusGeometry(0.242, 0.007, 6, 40), GOLD, hornBase.clone().addScaledVector(hornDir, 0.401), "root", {
    dir: hornDir,
    axis: "z",
  });

  // ---------------- Tonearm & soundbox ----------------
  const S = V(0.05, 0.265, 0.08);
  const adir = V(0.05, 0, 0.22).normalize();
  const back = S.clone().addScaledVector(adir, -0.009);
  b.sweep(
    catmull([V(0, 0.302, -0.14), V(0.012, 0.303, -0.08), V(0.03, 0.296, -0.01), V(0.043, 0.275, 0.045), back]),
    [0.012, 0.007],
    { color: BRASS, bone: "tonearm" },
  );
  P(cyl(0.016, 0.016, 0.012, 12), GOLD, V(0.007, 0.302, -0.112), "tonearm", { dir: [0.2, 0, 1] });
  P(cyl(0.036, 0.036, 0.018, 18), BRASS, S.clone(), "tonearm", { dir: adir });
  P(cyl(0.031, 0.031, 0.004, 18), NICKEL, S.clone().addScaledVector(adir, 0.0095), "tonearm", { dir: adir });
  P(cyl(0.024, 0.024, 0.002, 18), "#2b2420", S.clone().addScaledVector(adir, 0.0115), "tonearm", { dir: adir });
  P(cyl(0.006, 0.006, 0.006, 10), NICKEL, S.clone().addScaledVector(adir, 0.013), "tonearm", { dir: adir });
  const up = V(0, 1, 0);
  const side = adir.clone().cross(up).normalize();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const at = S.clone()
      .addScaledVector(adir, 0.0095)
      .addScaledVector(up, Math.cos(a) * 0.0335)
      .addScaledVector(side, Math.sin(a) * 0.0335);
    P(new THREE.SphereGeometry(0.0025, 6, 4), DARKBRASS, at, "tonearm");
  }
  P(cyl(0.004, 0.004, 0.01, 8), NICKEL, V(S.x, 0.233, S.z), "tonearm");
  P(new THREE.ConeGeometry(0.0015, 0.008, 6), "#e8e8ee", V(S.x, 0.2265, S.z), "tonearm", { rotation: [180, 0, 0] });

  // ---------------- Crank (left side, +X) ----------------
  P(cyl(0.02, 0.02, 0.006, 14), GOLD, [0.1675, 0.12, 0.04], "crank", { dir: [1, 0, 0] });
  P(cyl(0.006, 0.006, 0.05, 8), NICKEL, [0.19, 0.12, 0.04], "crank", { dir: [1, 0, 0] });
  b.rod([0.213, 0.12, 0.04], [0.213, 0.075, 0.07], 0.0055, { color: NICKEL, bone: "crank" });
  P(new THREE.SphereGeometry(0.008, 8, 6), NICKEL, [0.213, 0.12, 0.04], "crank");
  P(cyl(0.009, 0.009, 0.04, 10), WOOD_DARK, [0.235, 0.075, 0.07], "crank", { dir: [1, 0, 0] });
  P(new THREE.SphereGeometry(0.01, 8, 6), WOOD_DARK, [0.256, 0.075, 0.07], "crank");

  // ---------------- Top details ----------------
  P(cyl(0.016, 0.016, 0.003, 14), BRASS, [-0.145, 0.2095, 0.145]);
  b.rod([-0.145, 0.211, 0.145], [-0.122, 0.222, 0.158], 0.0025, { color: NICKEL, bone: "root" });
  P(new THREE.SphereGeometry(0.005, 8, 6), BLACK, [-0.122, 0.222, 0.158]);
  P(cyl(0.013, 0.012, 0.012, 12), BRASS, [0.148, 0.214, 0.148]);
  P(cyl(0.0105, 0.0105, 0.001, 12), "#1a1208", [0.148, 0.2202, 0.148]);
  for (let i = 0; i < 3; i++)
    P(cyl(0.0012, 0.0012, 0.012, 5), NICKEL, [0.145 + i * 0.003, 0.222, 0.147 + (i % 2) * 0.003]);

  return b.root;
}
```