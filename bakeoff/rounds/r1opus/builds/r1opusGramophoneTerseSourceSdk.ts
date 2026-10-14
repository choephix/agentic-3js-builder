import * as THREE from "three";
import { createBuilder, paint, mix, smoothstep, grain, svg, bezier, catmull } from "../../../../src/index";

export const meta = {
  name: "Gramophone",
  description:
    "A stylized wind-up gramophone: a walnut cabinet with brass pillars, a raised front panel and an enamel plaque, a green felt platter with a grooved shellac record, a nickel reproducer on a brass tonearm, a side crank, and a burgundy-and-gold petal horn on a curved brass neck.",
};

export default function build() {
  const b = createBuilder({ name: "gramophone", paintSize: 2048 });
  b.joint("root", { at: [0, 0, 0] });

  const BRASS = "#c9a04a";
  const BRASS_LIGHT = "#e2b85a";
  const NICKEL = "#c8ccd2";
  const DARK_WOOD = "#3a1e0e";

  const wood = grain("#5c2f16", "#844a26", { size: 0.006, axis: "x", seed: 3 });
  const woodDark = grain("#3a1d0d", "#55301a", { size: 0.006, axis: "x", seed: 5 });
  const woodLight = grain("#7a4422", "#a0632f", { size: 0.005, axis: "x", seed: 7 });

  // ---------- Base, feet, cabinet ----------
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      b.part(new THREE.SphereGeometry(0.022, 10, 6), DARK_WOOD, {
        at: [sx * 0.155, 0.0154, sz * 0.155],
        scale: [1, 0.7, 1],
        bone: "root",
      });
  b.part(new THREE.BoxGeometry(0.38, 0.04, 0.38), woodDark, { at: [0, 0.04, 0], bone: "root" });
  b.part(new THREE.BoxGeometry(0.35, 0.012, 0.35), woodLight, { at: [0, 0.066, 0], bone: "root" });
  b.part(new THREE.BoxGeometry(0.32, 0.14, 0.32), wood, { at: [0, 0.13, 0], bone: "root" });
  b.part(new THREE.BoxGeometry(0.345, 0.015, 0.345), woodLight, { at: [0, 0.2075, 0], bone: "root" });

  // brass corner pillars with finials
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.13, 8), BRASS, {
        at: [sx * 0.16, 0.135, sz * 0.16],
        bone: "root",
      });
      b.part(new THREE.SphereGeometry(0.014, 8, 6), BRASS_LIGHT, { at: [sx * 0.16, 0.074, sz * 0.16], bone: "root" });
    }

  // raised panels (front, sides, back)
  b.part(new THREE.BoxGeometry(0.26, 0.1, 0.006), woodLight, { at: [0, 0.13, 0.162], bone: "root" });
  b.part(new THREE.BoxGeometry(0.26, 0.1, 0.006), woodLight, { at: [0, 0.13, -0.162], bone: "root" });
  for (const sx of [-1, 1])
    b.part(new THREE.BoxGeometry(0.006, 0.1, 0.26), woodLight, { at: [sx * 0.162, 0.13, 0], bone: "root" });
  // thin brass trim around the front panel
  b.part(new THREE.BoxGeometry(0.27, 0.004, 0.004), BRASS, { at: [0, 0.181, 0.165], bone: "root" });
  b.part(new THREE.BoxGeometry(0.27, 0.004, 0.004), BRASS, { at: [0, 0.079, 0.165], bone: "root" });

  const plaque = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f6dc8a"/><stop offset="0.5" stop-color="#c8963a"/><stop offset="1" stop-color="#8a6020"/>
      </linearGradient></defs>
      <ellipse cx="100" cy="40" rx="96" ry="36" fill="url(#g)"/>
      <ellipse cx="100" cy="40" rx="86" ry="28" fill="#2a120a"/>
      <ellipse cx="100" cy="40" rx="81" ry="23" fill="none" stroke="#e8c46a" stroke-width="1.5"/>
      <text x="100" y="47" font-family="Georgia, serif" font-size="21" font-style="italic" fill="#f2d27a" text-anchor="middle" letter-spacing="2">Melodia</text>
      <path d="M26 40 q10 -12 20 0 q-10 12 -20 0 M174 40 q-10 -12 -20 0 q10 12 20 0" fill="#e8c46a"/>
      <circle cx="100" cy="18" r="3" fill="#e8c46a"/><circle cx="100" cy="62" r="3" fill="#e8c46a"/>
    </svg>`,
    { size: 512 },
  );
  b.part(new THREE.PlaneGeometry(0.15, 0.06), "#ffffff", { at: [0, 0.13, 0.1655], texture: plaque, bone: "root" });

  // ---------- Turntable ----------
  const C = new THREE.Vector3(0, 0, 0.03);
  b.joint("platter", { at: [0, 0.221, 0.03], dir: [0, 1, 0], parent: "root", role: "hinge" });
  b.part(new THREE.CylinderGeometry(0.135, 0.135, 0.012, 36), paint((p, n) => (n.y > 0.5 ? "#2e5638" : BRASS)), {
    at: [0, 0.221, 0.03],
    bone: "platter",
  });
  const record = paint((p, n) => {
    if (n.y < 0.5) return "#101012";
    const dx = p.x - C.x;
    const dz = p.z - C.z;
    const r = Math.hypot(dx, dz);
    if (r < 0.042) return "#18181a";
    if (r > 0.12) return "#1c1c1f";
    let c = mix("#0b0b0d", "#232328", 0.35 + 0.35 * Math.sin(r * 900));
    if (Math.abs(r - 0.072) < 0.0015 || Math.abs(r - 0.098) < 0.0015) c = mix(c, "#3a3a40", 0.7);
    const a = Math.atan2(dz, dx);
    const sheen = Math.pow(Math.abs(Math.cos(a - 0.6)), 14) * 0.45;
    return mix(c, "#6a6c74", sheen);
  });
  b.part(new THREE.CylinderGeometry(0.124, 0.124, 0.003, 48), record, { at: [0, 0.2285, 0.03], bone: "platter" });
  const label = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r="63" fill="#a3172a"/>
      <circle cx="64" cy="64" r="58" fill="none" stroke="#e8c46a" stroke-width="2"/>
      <circle cx="64" cy="64" r="40" fill="none" stroke="#e8c46a" stroke-width="1"/>
      <text x="64" y="38" font-family="Georgia, serif" font-size="13" fill="#f2d27a" text-anchor="middle" font-style="italic">Melodia</text>
      <text x="64" y="96" font-family="Georgia, serif" font-size="8" fill="#f2d27a" text-anchor="middle" letter-spacing="1">78 R.P.M.</text>
      <rect x="30" y="80" width="68" height="1.5" fill="#e8c46a"/>
      <circle cx="64" cy="64" r="5" fill="#1a1a1a"/>
    </svg>`,
    { size: 256 },
  );
  b.part(new THREE.CircleGeometry(0.04, 32), "#ffffff", {
    at: [0, 0.2302, 0.03],
    rotation: [-90, 0, 0],
    texture: label,
    bone: "platter",
  });
  b.part(new THREE.CylinderGeometry(0.003, 0.003, 0.014, 8), NICKEL, { at: [0, 0.234, 0.03], bone: "platter" });

  // ---------- Tonearm post, tonearm and reproducer ----------
  const postTop = new THREE.Vector3(0.12, 0.275, -0.12);
  b.part(new THREE.CylinderGeometry(0.032, 0.036, 0.006, 16), BRASS, { at: [0.12, 0.218, -0.12], bone: "root" });
  b.part(new THREE.CylinderGeometry(0.016, 0.02, 0.055, 12), BRASS, { at: [0.12, 0.2475, -0.12], bone: "root" });
  b.joint("tonearm", { at: postTop, dir: [0, 1, 0], parent: "root", role: "hinge" });
  b.part(new THREE.SphereGeometry(0.023, 12, 8), BRASS_LIGHT, { at: postTop, bone: "tonearm" });
  b.sweep(
    catmull([
      [0.12, 0.275, -0.12],
      [0.115, 0.287, -0.04],
      [0.09, 0.282, 0.04],
      [0.058, 0.264, 0.098],
    ]),
    [0.009, 0.007],
    { color: BRASS, caps: "flat", bone: "tonearm", sides: 10 },
  );
  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.012, 20), NICKEL, {
    at: [0.048, 0.262, 0.1],
    dir: [1, 0, 0],
    bone: "tonearm",
  });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.002, 20), "#efe6cc", {
    at: [0.0415, 0.262, 0.1],
    dir: [1, 0, 0],
    bone: "tonearm",
  });
  b.part(new THREE.TorusGeometry(0.021, 0.002, 4, 20), NICKEL, {
    at: [0.041, 0.262, 0.1],
    dir: [1, 0, 0],
    axis: "z",
    bone: "tonearm",
  });
  b.part(new THREE.BoxGeometry(0.006, 0.012, 0.006), NICKEL, { at: [0.048, 0.24, 0.1], bone: "tonearm" });
  b.spike([0.048, 0.235, 0.1], [0.048, 0.2302, 0.1], null, 0.0015, { color: "#2a2a2e", bone: "tonearm" });

  // ---------- Horn neck ----------
  const D = new THREE.Vector3(0, 0.33, 0.94).normalize();
  const P3 = new THREE.Vector3(0, 0.63, -0.02);
  const P2 = P3.clone().addScaledVector(D, -0.1);
  const neck = bezier(postTop, [0.11, 0.48, -0.2], P2, P3);
  b.sweep(neck, [0.016, 0.02, 0.034], { color: BRASS, caps: "flat", bone: "root", sides: 14 });
  for (const t of [0.3, 0.62]) {
    const r = 0.016 + (0.034 - 0.016) * t * t + 0.003;
    b.part(new THREE.TorusGeometry(r + 0.002, 0.004, 6, 18), BRASS_LIGHT, {
      at: neck.at(t),
      dir: neck.tangentAt(t),
      axis: "z",
      bone: "root",
    });
  }
  b.part(new THREE.TorusGeometry(0.037, 0.006, 6, 20), BRASS_LIGHT, { at: P3, dir: D, axis: "z", bone: "root" });
  // support strut from the cabinet back to the neck
  b.rod([0.03, 0.214, -0.15], neck.at(0.55), 0.004, { color: BRASS, bone: "root" });

  // ---------- Petal horn bell ----------
  const L = 0.32;
  const R = 0.22;
  const r0 = 0.035;
  const th = 0.004;
  const N = 14;
  const outer: [number, number][] = [];
  const inner: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const h = (L * i) / N;
    const x = r0 + (R - r0) * Math.pow(h / L, 2.6);
    const dx = ((R - r0) * 2.6 * Math.pow(h / L, 1.6)) / L;
    const nrm = Math.hypot(1, dx);
    outer.push([x, h]);
    inner.push([x - th / nrm, h + (th * dx) / nrm]);
  }
  const profile = [...outer, ...inner.reverse()];
  const SEG = 360 / 16;
  const hornPaint = paint((p, n, s) => {
    const rel = p.clone().sub(P3);
    const along = rel.dot(D);
    const radial = rel.addScaledVector(D, -along);
    const isOuter = radial.dot(n) > 0;
    const h = Math.min(Math.max(s[0] / L, 0), 1);
    const deg = s[1];
    const m = ((deg % SEG) + SEG) % SEG;
    const seam = Math.min(m, SEG - m);
    const panel = Math.floor(deg / SEG) % 2;
    if (seam < 0.8 + (1 - h) * 1.5) return BRASS_LIGHT;
    if (isOuter) {
      if (h > 0.94) return "#d9a843";
      if (Math.abs(h - 0.72) < 0.012) return BRASS_LIGHT;
      return mix(panel ? "#5e0d1a" : "#741424", "#b02a3f", h * h);
    }
    if (Math.abs(h - 0.86) < 0.01) return "#9a1a2c";
    const base = panel ? "#f2d892" : "#e3b960";
    return mix("#3c2a10", base, smoothstep(0.05, 0.6, h));
  });
  b.lathe(profile, { color: hornPaint, at: P3, axis: D, segments: 16, bone: "root" });
  b.part(new THREE.TorusGeometry(R + 0.001, 0.006, 6, 32), BRASS_LIGHT, {
    at: P3.clone().addScaledVector(D, L + 0.002),
    dir: D,
    axis: "z",
    bone: "root",
  });

  // ---------- Crank (right side) ----------
  b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.004, 16), BRASS, {
    at: [-0.167, 0.13, 0],
    dir: [1, 0, 0],
    bone: "root",
  });
  b.joint("crank", { at: [-0.168, 0.13, 0], dir: [-1, 0, 0], parent: "root", role: "hinge" });
  b.rod([-0.166, 0.13, 0], [-0.2, 0.13, 0], 0.005, { color: NICKEL, bone: "crank" });
  b.part(new THREE.SphereGeometry(0.008, 8, 6), NICKEL, { at: [-0.2, 0.13, 0], bone: "crank" });
  b.rod([-0.2, 0.13, 0], [-0.2, 0.078, 0.03], 0.005, { color: NICKEL, bone: "crank" });
  b.capsule([-0.202, 0.078, 0.03], [-0.237, 0.078, 0.03], 0.009, { color: DARK_WOOD, bone: "crank" });

  // ---------- Brake lever & speed dial on top ----------
  b.part(new THREE.BoxGeometry(0.03, 0.002, 0.012), BRASS, { at: [-0.125, 0.2155, 0.13], bone: "root" });
  b.rod([-0.125, 0.215, 0.13], [-0.13, 0.245, 0.13], 0.003, { color: NICKEL, bone: "root" });
  b.part(new THREE.SphereGeometry(0.008, 8, 6), "#151515", { at: [-0.13, 0.248, 0.13], bone: "root" });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.005, 14), BRASS, { at: [0.13, 0.2175, 0.13], bone: "root" });
  b.part(new THREE.BoxGeometry(0.02, 0.004, 0.004), "#151515", { at: [0.13, 0.221, 0.13], bone: "root" });

  return b.root;
}
