import * as THREE from "three";
import {
  createBuilder,
  paint,
  grain,
  mix,
  noise,
  smoothstep,
  catmull,
  svg,
  rng,
} from "../../../../src/index";

export const meta = {
  name: "Morning-Glory Gramophone",
  description:
    "An antique gramophone on a carved walnut cabinet with pale floral marquetry, a paneled brass morning-glory horn with green patina, a black record with a red label, a nickel tonearm, a wind-up crank and brass claw-and-ball feet.",
};

export default function build() {
  const b = createBuilder({ name: "gramophone", paintSize: 2048 });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const random = rng(7);

  // ---------- palette ----------
  const SILVER = "#c3c8d0";
  const NICKEL = "#e2e5ea";
  const IRON = "#2a2a2e";
  const DARKWOOD = "#2c170b";
  const FELT = "#2d4a36";
  const RIB = "#7d5a1c";

  const brassPaint = (base: string, seed: number) =>
    paint((p, n) => {
      const sheen = smoothstep(0.55, 0.85, noise(p, 0.02, seed));
      let c = mix(base, "#f2d27c", sheen * 0.35);
      const pat = smoothstep(0.6, 0.8, noise(p, 0.06, seed + 40)) * (0.75 + 0.25 * (1 - Math.abs(n.y)));
      c = mix(c, "#5e9b82", pat * 0.72);
      return c;
    });
  const brassA = brassPaint("#c69330", 11 + Math.floor(random() * 5));
  const brassB = brassPaint("#a8771f", 23 + Math.floor(random() * 5));

  const walnut = grain("#4a2915", "#7a4a2a", { size: 0.008, axis: "x", seed: 2 });
  const walnutV = grain("#4a2915", "#7a4a2a", { size: 0.006, axis: "y", seed: 3 });
  const burl = paint((p, n) => mix(walnut.at(p, n), "#28140a", 0.45 * noise(p, 0.025, 7)));

  const RC = V(0, 0, 0.02); // record centre (x, z)
  const record = paint((p) => {
    const dx = p.x - RC.x;
    const dz = p.z - RC.z;
    const r = Math.hypot(dx, dz);
    const groove = 0.5 + 0.5 * Math.sin(r * 1400);
    let t = groove * 0.3;
    if (r > 0.144 || (r > 0.094 && r < 0.098) || (r > 0.068 && r < 0.071) || r < 0.05) t = 0.04;
    const sheen = Math.pow(Math.max(0, Math.cos(Math.atan2(dz, dx) * 2 - 0.6)), 10) * 0.45;
    return mix("#0a0a0c", "#40404a", Math.min(1, t + sheen * (0.4 + groove)));
  });

  // ---------- textures ----------
  const INLAY = "#efe2bd";
  const petals = (cx: number, cy: number, count: number, len: number, wid: number, fill: string, rot = 0) => {
    let s = "";
    for (let k = 0; k < count; k++)
      s += `<ellipse cx="${cx}" cy="${cy - len}" rx="${wid}" ry="${len}" fill="${fill}" transform="rotate(${rot + (k * 360) / count} ${cx} ${cy})"/>`;
    return s;
  };
  const leaf = (x: number, y: number, a: number) =>
    `<ellipse cx="${x}" cy="${y}" rx="4" ry="10" fill="${INLAY}" transform="rotate(${a} ${x} ${y})"/>`;
  const leaves = [
    [145, 72, -50],
    [124, 101, 35],
    [100, 80, -40],
    [62, 74, 45],
    [48, 100, -30],
  ];
  let leafSvg = "";
  for (const [x, y, a] of leaves) leafSvg += leaf(x, y, a) + leaf(340 - x, y, -a);
  const inlay = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 180">
<g fill="none" stroke="${INLAY}" stroke-linecap="round">
<rect x="8" y="8" width="324" height="164" rx="6" stroke-width="4"/>
<rect x="17" y="17" width="306" height="146" rx="4" stroke-width="1.5"/>
<path d="M170 90 C140 58 112 122 80 90 S40 58 30 90" stroke-width="3.5"/>
<path d="M170 90 C200 58 228 122 260 90 S300 58 310 90" stroke-width="3.5"/>
<path d="M170 90 C165 120 150 140 130 148" stroke-width="2"/>
<path d="M170 90 C175 120 190 140 210 148" stroke-width="2"/>
</g>
${leafSvg}
${petals(170, 90, 8, 18, 7, "#f5ead0")}
<circle cx="170" cy="90" r="7" fill="#c9a86a"/>
${petals(80, 90, 5, 9, 4.5, "#f5ead0", 20)}<circle cx="80" cy="90" r="3.5" fill="#c9a86a"/>
${petals(260, 90, 5, 9, 4.5, "#f5ead0", -20)}<circle cx="260" cy="90" r="3.5" fill="#c9a86a"/>
<circle cx="30" cy="90" r="5" fill="${INLAY}"/><circle cx="310" cy="90" r="5" fill="${INLAY}"/>
<circle cx="130" cy="148" r="4" fill="${INLAY}"/><circle cx="210" cy="148" r="4" fill="${INLAY}"/>
${petals(26, 26, 4, 6, 2.5, INLAY, 45)}${petals(314, 26, 4, 6, 2.5, INLAY, 45)}
${petals(26, 154, 4, 6, 2.5, INLAY, 45)}${petals(314, 154, 4, 6, 2.5, INLAY, 45)}
</svg>`,
    { size: 1024 },
  );
  const rosette = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<circle cx="50" cy="50" r="46" fill="none" stroke="${INLAY}" stroke-width="3"/>
${petals(50, 50, 8, 18, 7, "#f5ead0")}${petals(50, 50, 8, 10, 3, "#d9c08a", 22.5)}
<circle cx="50" cy="50" r="6" fill="#c9a86a"/></svg>`,
    { size: 256 },
  );
  const label = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
<circle cx="100" cy="100" r="100" fill="#a8182a"/>
<circle cx="100" cy="100" r="90" fill="none" stroke="#e8c463" stroke-width="3"/>
<circle cx="100" cy="100" r="62" fill="none" stroke="#e8c463" stroke-width="1.5"/>
<text x="100" y="64" font-family="Georgia, serif" font-size="19" font-weight="bold" fill="#f1d27a" text-anchor="middle">GRAMOPHONE</text>
<text x="100" y="152" font-family="Georgia, serif" font-size="13" fill="#f1d27a" text-anchor="middle">RECORD · 78 R.P.M.</text>
${petals(100, 100, 6, 14, 5, "#f1d27a")}
<circle cx="100" cy="100" r="6" fill="#1a1a1a"/></svg>`,
    { size: 512 },
  );
  const plaque = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 36">
<rect x="0" y="0" width="240" height="36" fill="#c7a24a"/>
<rect x="3" y="3" width="234" height="30" fill="none" stroke="#6e4f18" stroke-width="2"/>
<text x="120" y="24" font-family="Georgia, serif" font-size="16" fill="#3a2a10" text-anchor="middle">THE MORNING GLORY</text></svg>`,
    { size: 512 },
  );

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0, 0] });
  const H = V(-0.165, 0.44, -0.17); // tonearm hub / horn throat
  b.joint("platter", { parent: "root", at: [0, 0.372, 0.02], dir: [0, 1, 0] });
  b.joint("tonearm", { parent: "root", at: H, dir: [0, 1, 0], role: "hinge" });
  b.joint("crank", { parent: "root", at: [0.218, 0.24, 0.06], dir: [1, 0, 0], role: "hinge" });

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const basis = (u: THREE.Vector3, v: THREE.Vector3, n: THREE.Vector3) =>
    new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(u, v, n));

  // ---------- claw-and-ball feet ----------
  for (const fx of [-0.2, 0.2])
    for (const fz of [-0.2, 0.2]) {
      b.part(new THREE.SphereGeometry(0.026, 10, 7), walnut, { at: [fx, 0.026, fz] });
      b.part(new THREE.CylinderGeometry(0.024, 0.018, 0.026, 8), brassA, { at: [fx, 0.056, fz], flat: true });
      for (let k = 0; k < 4; k++) {
        const a = Math.PI / 4 + (k * Math.PI) / 2;
        const c = Math.cos(a);
        const s = Math.sin(a);
        const knuckle = V(fx + 0.029 * c, 0.033, fz + 0.029 * s);
        b.capsule([fx + 0.013 * c, 0.052, fz + 0.013 * s], knuckle, [0.0075, 0.0058], { color: brassA, sides: 6 });
        b.spike(knuckle, [fx + 0.022 * c, 0.007, fz + 0.022 * s], null, 0.0055, { color: brassB, sides: 6 });
      }
    }

  // ---------- cabinet ----------
  b.part(box(0.47, 0.035, 0.47), walnut, { at: [0, 0.0825, 0] });
  b.part(box(0.45, 0.01, 0.45), DARKWOOD, { at: [0, 0.103, 0] });
  b.part(box(0.42, 0.24, 0.42), walnut, { at: [0, 0.22, 0] });
  b.part(box(0.45, 0.01, 0.45), DARKWOOD, { at: [0, 0.339, 0] });
  b.part(box(0.47, 0.022, 0.47), walnut, { at: [0, 0.354, 0] });

  // carved corner columns
  for (const cx of [-0.205, 0.205])
    for (const cz of [-0.205, 0.205]) {
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.235, 8), walnutV, { at: [cx, 0.22, cz], flat: true });
      for (const y of [0.112, 0.328])
        b.part(new THREE.CylinderGeometry(0.027, 0.027, 0.012, 8), DARKWOOD, { at: [cx, y, cz], flat: true });
      b.part(new THREE.SphereGeometry(0.026, 8, 6), walnutV, { at: [cx, 0.22, cz], scale: [1, 1.9, 1], flat: true });
      b.part(new THREE.TorusGeometry(0.022, 0.004, 4, 8), brassA, { at: [cx, 0.17, cz], rotation: [90, 0, 0] });
      b.part(new THREE.TorusGeometry(0.022, 0.004, 4, 8), brassA, { at: [cx, 0.27, cz], rotation: [90, 0, 0] });
    }

  // inlaid panels on all four faces
  const faces = [
    { n: V(0, 0, 1), u: V(1, 0, 0) },
    { n: V(1, 0, 0), u: V(0, 0, -1) },
    { n: V(-1, 0, 0), u: V(0, 0, 1) },
    { n: V(0, 0, -1), u: V(-1, 0, 0) },
  ];
  const up = V(0, 1, 0);
  for (const f of faces) {
    const q = basis(f.u, up, f.n);
    const o = V(0, 0.22, 0).addScaledVector(f.n, 0.21);
    b.part(box(0.33, 0.18, 0.008), burl, { at: o.clone().addScaledVector(f.n, 0.004), quat: q });
    b.part(new THREE.PlaneGeometry(0.31, 0.164), "#ffffff", {
      at: o.clone().addScaledVector(f.n, 0.0086),
      quat: q,
      texture: inlay,
    });
    const corner = (i: number, j: number) =>
      o.clone().addScaledVector(f.u, i * 0.168).addScaledVector(up, j * 0.093).addScaledVector(f.n, 0.006);
    const cs = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)];
    for (let k = 0; k < 4; k++) b.rod(cs[k], cs[(k + 1) % 4], 0.0055, { color: DARKWOOD, sides: 6 });
    for (const c of cs) b.part(new THREE.SphereGeometry(0.007, 6, 4), DARKWOOD, { at: c });
  }

  // top corner rosettes (back-right corner holds the tonearm)
  for (const [x, z] of [
    [0.19, 0.19],
    [-0.19, 0.19],
    [0.19, -0.19],
  ])
    b.part(new THREE.PlaneGeometry(0.05, 0.05), "#ffffff", {
      at: [x, 0.3655, z],
      rotation: [-90, 0, 0],
      texture: rosette,
    });

  // brass name plaque on the lid edge
  b.part(new THREE.PlaneGeometry(0.13, 0.0195), "#ffffff", { at: [0, 0.354, 0.2357], texture: plaque });

  // speed control knob
  b.part(new THREE.CylinderGeometry(0.014, 0.016, 0.008, 10), SILVER, { at: [0.17, 0.369, -0.15] });
  b.part(new THREE.CylinderGeometry(0.008, 0.009, 0.016, 8), NICKEL, { at: [0.17, 0.381, -0.15] });
  b.rod([0.17, 0.386, -0.15], [0.17, 0.386, -0.12], 0.0025, { color: NICKEL, sides: 5 });
  b.part(new THREE.SphereGeometry(0.0055, 8, 6), "#1b1b1d", { at: [0.17, 0.386, -0.118] });

  // ---------- turntable ----------
  b.part(new THREE.CylinderGeometry(0.157, 0.157, 0.007, 32), SILVER, { at: [0, 0.3685, 0.02], bone: "platter" });
  b.part(new THREE.CylinderGeometry(0.152, 0.152, 0.007, 32), FELT, { at: [0, 0.3755, 0.02], bone: "platter" });
  b.part(new THREE.CylinderGeometry(0.149, 0.149, 0.003, 40), record, { at: [0, 0.3805, 0.02], bone: "platter" });
  b.part(new THREE.CircleGeometry(0.046, 32), "#ffffff", {
    at: [0, 0.3823, 0.02],
    rotation: [-90, 0, 0],
    texture: label,
    bone: "platter",
  });
  b.part(new THREE.CylinderGeometry(0.0035, 0.0035, 0.018, 8), NICKEL, { at: [0, 0.388, 0.02], bone: "platter" });
  b.part(new THREE.SphereGeometry(0.0042, 8, 6), NICKEL, { at: [0, 0.397, 0.02], bone: "platter" });

  // ---------- tonearm ----------
  b.part(new THREE.CylinderGeometry(0.032, 0.036, 0.01, 12), SILVER, { at: [H.x, 0.37, H.z] });
  b.part(new THREE.CylinderGeometry(0.018, 0.022, 0.06, 10), NICKEL, { at: [H.x, 0.405, H.z] });
  b.part(new THREE.SphereGeometry(0.026, 12, 9), NICKEL, { at: H, bone: "tonearm" });
  const nrm = V(0.66, 0, 0.75).normalize();
  const S = V(0.035, 0.425, 0.1);
  const E = S.clone().addScaledVector(nrm, -0.008);
  const armPath = catmull([H, [-0.12, 0.452, -0.09], [-0.05, 0.452, 0.0], [0.0, 0.445, 0.06], E]);
  b.sweep(armPath, (t) => 0.0125 - 0.0045 * t, { color: NICKEL, bone: "tonearm", sides: 10 });
  // soundbox (reproducer)
  b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.016, 20), SILVER, { at: S, dir: nrm, bone: "tonearm" });
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.002, 20), "#3b3328", {
    at: S.clone().addScaledVector(nrm, 0.008),
    dir: nrm,
    bone: "tonearm",
  });
  b.part(new THREE.TorusGeometry(0.027, 0.0025, 4, 20), brassA, {
    at: S.clone().addScaledVector(nrm, 0.0085),
    dir: nrm,
    axis: "z",
    bone: "tonearm",
  });
  b.part(new THREE.SphereGeometry(0.004, 6, 4), NICKEL, {
    at: S.clone().addScaledVector(nrm, 0.011),
    bone: "tonearm",
  });
  b.rod(S.clone().addScaledVector(nrm, 0.01), [S.x + nrm.x * 0.01, 0.396, S.z + nrm.z * 0.01], 0.0028, {
    color: NICKEL,
    sides: 6,
    bone: "tonearm",
  });
  b.spike(
    [S.x + nrm.x * 0.01, 0.397, S.z + nrm.z * 0.01],
    [S.x + nrm.x * 0.01, 0.3825, S.z + nrm.z * 0.01],
    null,
    0.0018,
    { color: "#9aa0a8", sides: 5, bone: "tonearm" },
  );

  // ---------- morning-glory horn ----------
  const hornPath = catmull([
    H,
    [-0.16, 0.475, -0.26],
    [-0.11, 0.53, -0.34],
    [-0.05, 0.6, -0.37],
    [-0.03, 0.66, -0.33],
    [0, 0.86, -0.1],
  ]);
  const R = (t: number) => 0.016 + 0.274 * Math.pow(t, 6);
  const PANELS = 12;
  const sectors = Array.from(
    { length: PANELS },
    (_, k) => [k * (360 / PANELS), (k + 1) * (360 / PANELS), k % 2 ? brassB : brassA] as const,
  );
  const horn = b.sweep(hornPath, R, {
    color: brassA,
    sectors,
    sides: 24,
    caps: { start: "flat", end: "none" },
    name: "horn",
  });
  // panel seams and rivets
  for (let k = 0; k < PANELS; k++) {
    const angle = k * (360 / PANELS);
    b.sweep(horn.line(angle, 0.0015), 0.0032, { color: RIB, from: 0.42, sides: 5, caps: "round" });
    b.part(new THREE.SphereGeometry(0.0055, 6, 4), brassA, { at: horn.at(0.975, angle, 0.003).at });
    b.part(new THREE.SphereGeometry(0.0045, 6, 4), brassA, { at: horn.at(0.88, angle, 0.003).at });
  }
  // rolled rim
  const mouth = hornPath.at(1);
  const mouthDir = hornPath.tangentAt(1);
  b.part(new THREE.TorusGeometry(0.2925, 0.008, 6, 48), brassA, { at: mouth, dir: mouthDir, axis: "z" });
  // throat collar
  b.part(new THREE.TorusGeometry(0.019, 0.005, 5, 12), NICKEL, {
    at: hornPath.at(0.06),
    dir: hornPath.tangentAt(0.06),
    axis: "z",
  });

  // horn crane support
  const tc = 0.58;
  const clamp = hornPath.at(tc);
  b.part(new THREE.TorusGeometry(R(tc) * 1.03 + 0.003, 0.005, 5, 16), IRON, {
    at: clamp,
    dir: hornPath.tangentAt(tc),
    axis: "z",
  });
  b.part(box(0.06, 0.08, 0.008), IRON, { at: [-0.04, 0.29, -0.214] });
  for (const dx of [-0.02, 0.02])
    for (const dy of [-0.03, 0.03])
      b.part(new THREE.SphereGeometry(0.004, 6, 4), brassA, { at: [-0.04 + dx, 0.29 + dy, -0.219] });
  const below = clamp.clone().add(V(0, -R(tc) - 0.005, 0));
  b.rod([-0.04, 0.3, -0.218], below, 0.0065, { color: IRON, sides: 6 });

  // ---------- wind-up crank (left side, +X) ----------
  b.part(new THREE.CylinderGeometry(0.026, 0.03, 0.006, 12), brassA, { at: [0.221, 0.24, 0.06], dir: [1, 0, 0], bone: "crank" });
  b.rod([0.218, 0.24, 0.06], [0.262, 0.24, 0.06], 0.007, { color: NICKEL, sides: 8, bone: "crank" });
  b.frustumBox([0.262, 0.245, 0.06], [0.262, 0.15, 0.06], [0.022, 0.008], [0.015, 0.008], {
    color: NICKEL,
    bone: "crank",
  });
  b.part(new THREE.SphereGeometry(0.009, 8, 6), NICKEL, { at: [0.266, 0.24, 0.06], bone: "crank" });
  b.rod([0.262, 0.15, 0.06], [0.272, 0.15, 0.06], 0.004, { color: NICKEL, sides: 6, bone: "crank" });
  b.capsule([0.272, 0.15, 0.06], [0.31, 0.15, 0.06], [0.011, 0.009], { color: DARKWOOD, sides: 8, bone: "crank" });

  // ---------- finish ----------
  const root = b.root;
  // the horn is open: show its brass inside too
  for (const mesh of horn.meshes) {
    const m = (mesh.material as THREE.MeshStandardMaterial).clone();
    m.side = THREE.DoubleSide;
    m.metalness = 0.35;
    m.roughness = 0.45;
    mesh.material = m;
  }
  return root;
}
