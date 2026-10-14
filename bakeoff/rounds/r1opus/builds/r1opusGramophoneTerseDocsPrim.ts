import * as THREE from "three";
import { createBuilder, grain, paint, svg, bezier, catmull } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Gramophone",
  description:
    "A tabletop horn gramophone: walnut cabinet with brass trim and gilt panels, a spinning-ready 78 record, a nickel soundbox on a brass tone arm, and a big red morning-glory petal horn with gold seams.",
};

const WALNUT = "#6b3d22";
const WALNUT_D = "#4a2814";
const WOOD_DARK = "#3a1f10";
const BRASS = "#d4a447";
const BRASS_D = "#a87a2a";
const NICKEL = "#c8c6bd";
const PLATTER = "#2a2624";
const VINYL = "#151515";
const RED = "#b3242c";
const RED2 = "#94181f";
const GOLD = "#e6bf5c";
const INNER = "#e8c36a";
const INNER_D = "#8a5a1c";
const MICA = "#eadfc2";

export default function build() {
  const b = createBuilder({ name: "gramophone" });
  const root = b.joint("root", { at: [0, 0, 0] });

  const wood = grain(WALNUT, WALNUT_D, { size: 0.012, axis: "x" });
  const woodV = grain(WALNUT_D, WOOD_DARK, { size: 0.01, axis: "y" });

  // ---------- textures ----------
  let grooves = "";
  for (let r = 40; r <= 97; r += 2.4)
    grooves += `<circle cx="100" cy="100" r="${r.toFixed(1)}" fill="none" stroke="#2a2a2a" stroke-width="0.9"/>`;
  const recordTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="100" fill="#121212"/>
      ${grooves}
      <path d="M100 100 L170 30 A99 99 0 0 1 190 60 Z" fill="#4a4a4a" opacity="0.45"/>
      <path d="M100 100 L30 170 A99 99 0 0 1 10 140 Z" fill="#4a4a4a" opacity="0.45"/>
      <circle cx="100" cy="100" r="37" fill="#b8222c"/>
      <circle cx="100" cy="100" r="33" fill="none" stroke="#e6bf5c" stroke-width="1.6"/>
      <text x="100" y="90" font-family="serif" font-weight="bold" font-size="10" fill="#f0d27a" text-anchor="middle">HARMONIA</text>
      <text x="100" y="122" font-family="serif" font-size="8" fill="#f0d27a" text-anchor="middle">78 R.P.M.</text>
      <circle cx="100" cy="100" r="3" fill="#000"/>
    </svg>`,
    { size: 512 },
  );
  const panelTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 90">
      <rect x="5" y="5" width="260" height="80" rx="8" fill="none" stroke="#e0b95a" stroke-width="3"/>
      <rect x="14" y="14" width="242" height="62" rx="4" fill="none" stroke="#c99a3c" stroke-width="2"/>
      <circle cx="14" cy="14" r="5" fill="#e0b95a"/><circle cx="256" cy="14" r="5" fill="#e0b95a"/>
      <circle cx="14" cy="76" r="5" fill="#e0b95a"/><circle cx="256" cy="76" r="5" fill="#e0b95a"/>
      <path d="M115 45 Q135 25 155 45 Q135 65 115 45 Z" fill="none" stroke="#e0b95a" stroke-width="2"/>
    </svg>`,
    { size: 512 },
  );
  const plateTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 50">
      <rect x="2" y="2" width="176" height="46" rx="8" fill="#d1a84e" stroke="#7a5a1e" stroke-width="3"/>
      <text x="90" y="28" font-family="serif" font-weight="bold" font-size="22" fill="#3b2a10" text-anchor="middle">HARMONIA</text>
      <text x="90" y="42" font-family="serif" font-size="8" fill="#3b2a10" text-anchor="middle">TALKING MACHINE CO.</text>
    </svg>`,
    { size: 256 },
  );

  // ---------- cabinet ----------
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.part(new THREE.SphereGeometry(0.024, 8, 5), WOOD_DARK, {
        bone: root,
        at: [sx * 0.15, 0.015, sz * 0.15],
        scale: [1, 0.65, 1],
      });
  b.part(new THREE.BoxGeometry(0.36, 0.025, 0.36), wood, { bone: root, at: [0, 0.0375, 0] });
  b.part(new THREE.BoxGeometry(0.364, 0.004, 0.364), BRASS_D, { bone: root, at: [0, 0.05, 0] });
  b.part(new THREE.BoxGeometry(0.33, 0.12, 0.33), wood, { bone: root, at: [0, 0.11, 0] });
  b.part(new THREE.BoxGeometry(0.362, 0.004, 0.362), BRASS, { bone: root, at: [0, 0.171, 0] });
  b.part(new THREE.BoxGeometry(0.36, 0.014, 0.36), wood, { bone: root, at: [0, 0.18, 0] });

  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const x = sx * 0.165,
        z = sz * 0.165;
      b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.12, 8), woodV, { bone: root, at: [x, 0.11, z] });
      b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.008, 8), BRASS, { bone: root, at: [x, 0.058, z] });
      b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.008, 8), BRASS, { bone: root, at: [x, 0.163, z] });
    }

  // gilt panels on four sides
  const panelSpots: [number[], number[]][] = [
    [[0, 0.11, 0.1675], [0, 0, 1]],
    [[0, 0.11, -0.1675], [0, 0, -1]],
    [[0.1675, 0.11, 0], [1, 0, 0]],
    [[-0.1675, 0.11, 0], [-1, 0, 0]],
  ];
  for (const [at, dir] of panelSpots)
    b.part(new THREE.PlaneGeometry(0.27, 0.09), "#ffffff", { bone: root, at, dir, axis: "z", texture: panelTex });
  b.part(new THREE.PlaneGeometry(0.09, 0.025), "#ffffff", {
    bone: root,
    at: [0, 0.11, 0.1695],
    dir: [0, 0, 1],
    axis: "z",
    texture: plateTex,
  });
  // lid hinges
  for (const sx of [1, -1])
    b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.04, 6), BRASS, {
      bone: root,
      at: [sx * 0.1, 0.172, -0.182],
      dir: [1, 0, 0],
    });

  // ---------- turntable ----------
  const pz = 0.02;
  b.part(new THREE.CylinderGeometry(0.135, 0.135, 0.01, 24), PLATTER, { bone: root, at: [0, 0.192, pz] });
  b.part(new THREE.TorusGeometry(0.135, 0.003, 4, 32), BRASS, {
    bone: root,
    at: [0, 0.192, pz],
    dir: [0, 1, 0],
    axis: "z",
  });
  b.part(new THREE.CylinderGeometry(0.128, 0.128, 0.004, 24), VINYL, { bone: root, at: [0, 0.199, pz] });
  b.part(new THREE.CircleGeometry(0.128, 32), "#ffffff", {
    bone: root,
    at: [0, 0.2012, pz],
    dir: [0, 1, 0],
    axis: "z",
    texture: recordTex,
  });
  b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.018, 6), NICKEL, { bone: root, at: [0, 0.208, pz] });
  b.part(new THREE.SphereGeometry(0.005, 6, 4), NICKEL, { bone: root, at: [0, 0.217, pz] });

  // speed dial and brake on lid front corners
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.004, 10), BRASS, { bone: root, at: [-0.145, 0.189, 0.15] });
  b.rod([-0.145, 0.191, 0.15], [-0.125, 0.193, 0.165], 0.003, { color: BRASS_D });
  b.part(new THREE.SphereGeometry(0.006, 6, 4), WOOD_DARK, { bone: root, at: [-0.125, 0.194, 0.165] });
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.006, 8), BRASS, { bone: root, at: [0.148, 0.19, 0.15] });
  b.rod([0.148, 0.193, 0.15], [0.148, 0.205, 0.15], 0.0025, { color: NICKEL });
  b.part(new THREE.SphereGeometry(0.006, 6, 4), RED, { bone: root, at: [0.148, 0.207, 0.15] });

  // ---------- horn pillar ----------
  const pillarZ = -0.15;
  b.part(new THREE.CylinderGeometry(0.03, 0.034, 0.008, 12), BRASS_D, { bone: root, at: [0, 0.19, pillarZ] });
  b.part(new THREE.CylinderGeometry(0.018, 0.022, 0.05, 10), BRASS, { bone: root, at: [0, 0.217, pillarZ] });
  b.part(new THREE.SphereGeometry(0.026, 10, 7), BRASS, { bone: root, at: [0, 0.248, pillarZ] });

  // ---------- horn ----------
  const neck = bezier([0, 0.258, pillarZ], [0, 0.37, -0.29], [0, 0.51, -0.25], [0, 0.575, -0.08]);
  b.sweep(neck, [0.016, 0.022], { color: BRASS, caps: "flat", sides: 10 });
  const throat = neck.at(1).clone();
  const A = neck.tangentAt(1).clone().normalize();
  b.part(new THREE.TorusGeometry(0.024, 0.005, 5, 14), BRASS_D, {
    bone: root,
    at: throat,
    dir: A,
    axis: "z",
  });

  const L = 0.36;
  const r0 = 0.022;
  const rTop = 0.25;
  const k = Math.log(rTop / r0) / L;
  const outer: OutlinePoint[] = [];
  const inner: OutlinePoint[] = [];
  const N = 12;
  for (let i = 0; i <= N; i++) {
    const y = L * Math.pow(i / N, 0.8);
    const r = r0 * Math.exp(k * y);
    outer.push([r, y]);
    inner.push([r - 0.005, y]);
  }
  const outline: OutlinePoint[] = [[r0 - 0.005, 0], ...outer, ...inner.reverse().slice(0, -1)];

  const hornPaint = paint((p, n, s) => {
    const rel = p.clone().sub(throat);
    const radial = rel.sub(A.clone().multiplyScalar(rel.dot(A)));
    const isInner = n.dot(radial) < 0;
    const h = s[0];
    if (isInner) return h > 0.2 ? INNER : h > 0.1 ? "#c4913e" : INNER_D;
    const d = (((s[1] % 45) + 45) % 45);
    if (d < 2.4 || d > 42.6) return GOLD;
    if (h > 0.335) return GOLD;
    if (h > 0.295 && h < 0.303) return GOLD;
    return Math.floor((((s[1] % 360) + 360) % 360) / 45) % 2 ? RED : RED2;
  });
  b.lathe(outline, { at: throat, axis: A, segments: 16, color: hornPaint, bone: root });
  b.part(new THREE.TorusGeometry(rTop - 0.001, 0.006, 5, 32), BRASS, {
    bone: root,
    at: throat.clone().add(A.clone().multiplyScalar(L)),
    dir: A,
    axis: "z",
  });

  // horn crane from the back of the cabinet
  const clampT = 0.42;
  const clampAt = neck.at(clampT).clone();
  b.part(new THREE.BoxGeometry(0.04, 0.05, 0.006), BRASS_D, { bone: root, at: [0, 0.14, -0.168] });
  b.rod([0, 0.15, -0.172], [0, clampAt.y - 0.02, clampAt.z + 0.005], 0.006, { color: BRASS });
  b.part(new THREE.TorusGeometry(0.021, 0.004, 5, 12), BRASS_D, {
    bone: root,
    at: clampAt,
    dir: neck.tangentAt(clampT),
    axis: "z",
  });

  // ---------- tone arm and soundbox ----------
  const sbAt = new THREE.Vector3(-0.092, 0.246, 0.045);
  b.sweep(
    catmull([
      [0, 0.246, -0.13],
      [-0.03, 0.247, -0.07],
      [-0.07, 0.247, -0.01],
      [-0.088, 0.246, 0.028],
    ]),
    [0.011, 0.008],
    { color: BRASS, sides: 8 },
  );
  const d = new THREE.Vector3(1, 0, 0.4).normalize();
  b.part(new THREE.CylinderGeometry(0.033, 0.033, 0.016, 16), NICKEL, { bone: root, at: sbAt, dir: d });
  b.part(new THREE.TorusGeometry(0.033, 0.0025, 4, 20), BRASS_D, { bone: root, at: sbAt, dir: d, axis: "z" });
  for (const sgn of [1, -1]) {
    const face = sbAt.clone().add(d.clone().multiplyScalar(sgn * 0.0085));
    const nd = d.clone().multiplyScalar(sgn);
    b.part(new THREE.CircleGeometry(0.026, 16), MICA, { bone: root, at: face, dir: nd, axis: "z" });
    b.part(new THREE.TorusGeometry(0.018, 0.0015, 3, 16), BRASS_D, {
      bone: root,
      at: face.clone().add(nd.clone().multiplyScalar(0.001)),
      dir: nd,
      axis: "z",
    });
    b.part(new THREE.SphereGeometry(0.004, 6, 4), BRASS, {
      bone: root,
      at: face.clone().add(nd.clone().multiplyScalar(0.001)),
    });
  }
  b.part(new THREE.CylinderGeometry(0.005, 0.004, 0.012, 6), NICKEL, {
    bone: root,
    at: [sbAt.x, 0.212, sbAt.z],
  });
  b.spike([sbAt.x, 0.207, sbAt.z], [sbAt.x, 0.2015, sbAt.z + 0.004], null, 0.0015, { color: "#555555" });

  // ---------- winding crank (left side, +X) ----------
  b.part(new THREE.CylinderGeometry(0.02, 0.022, 0.005, 12), BRASS, {
    bone: root,
    at: [0.1675, 0.11, 0.03],
    dir: [1, 0, 0],
  });
  b.rod([0.165, 0.11, 0.03], [0.205, 0.11, 0.03], 0.005, { color: NICKEL });
  b.part(new THREE.SphereGeometry(0.008, 8, 5), NICKEL, { bone: root, at: [0.205, 0.11, 0.03] });
  b.rod([0.205, 0.11, 0.03], [0.205, 0.058, 0.03], 0.0045, { color: NICKEL });
  b.capsule([0.205, 0.058, 0.03], [0.245, 0.058, 0.03], 0.009, { color: WOOD_DARK, sides: 8 });

  return b.root;
}
