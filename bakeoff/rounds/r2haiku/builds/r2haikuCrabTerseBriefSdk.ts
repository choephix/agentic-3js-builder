import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Crab",
  description: "A stylised orange crab with raised eye stalks, big pincer claws and four jointed walking legs per side.",
};

const SHELL = "#e0561f";
const SHELL_DARK = "#9a3412";
const BELLY = "#fde7b0";
const SPINE = "#f97316";
const WHITE = "#fafaf9";
const BLACK = "#111111";
const TIP = "#3b1e12";

// Ellipsoid: a unit sphere squashed to the given radii (plain three.js geometry).
function ellipsoid(rx: number, ry: number, rz: number, w = 12, h = 8) {
  const g = new THREE.SphereGeometry(1, w, h);
  g.scale(rx, ry, rz);
  return g;
}

// Cone whose apex points along +Z (ready to be placed on a forward-facing spot).
function forwardCone(r: number, len: number, seg = 6) {
  const g = new THREE.ConeGeometry(r, len, seg);
  g.rotateX(Math.PI / 2);
  return g;
}

export default function build() {
  const b = createBuilder({ name: "crab" });

  // ---- Skeleton -----------------------------------------------------------
  const body = b.joint("body", { at: [0, 0.1, 0] });

  // ---- Carapace and belly -------------------------------------------------
  b.part(ellipsoid(0.17, 0.07, 0.15, 16, 10), SHELL, { at: [0, 0.13, 0], bone: body });
  b.part(ellipsoid(0.13, 0.035, 0.12, 12, 6), BELLY, { at: [0, 0.095, 0], bone: body });

  // Front rostrum between the eye stalks.
  b.part(new THREE.BoxGeometry(0.08, 0.03, 0.05), SHELL_DARK, { at: [0, 0.12, 0.165], bone: body });

  // Abdomen and telson tucked under the back.
  b.part(ellipsoid(0.07, 0.03, 0.06, 10, 6), BELLY, { at: [0, 0.075, -0.19], bone: body });
  b.part(ellipsoid(0.04, 0.02, 0.05, 8, 5), SHELL_DARK, { at: [0, 0.07, -0.25], bone: body });

  // Spines along the front edge of the carapace.
  const spineSpots: [number, number, number][] = [
    [0.05, 0.16, 0.14],
    [0.11, 0.15, 0.12],
    [0.15, 0.14, 0.06],
  ];
  for (const s of [1, -1]) {
    spineSpots.forEach((p, i) => {
      const g = forwardCone(0.012, 0.045, 5);
      g.rotateY(s * (0.5 + i * 0.15));
      b.part(g, SPINE, { at: [s * p[0], p[1], p[2]], bone: body });
    });
  }

  // ---- Eye stalks ---------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const base: [number, number, number] = [s * 0.05, 0.16, 0.14];
    const eye = b.joint(`eyeStalk${side}`, { at: base, parent: body });

    const stalkGeo = new THREE.CylinderGeometry(0.012, 0.015, 0.07, 6);
    stalkGeo.translate(0, 0.035, 0);
    b.part(stalkGeo, SHELL_DARK, { at: base, bone: eye });

    b.part(new THREE.SphereGeometry(0.034, 10, 8), WHITE, { at: [base[0], 0.215, 0.15], bone: eye });
    b.part(new THREE.SphereGeometry(0.017, 8, 6), BLACK, { at: [base[0], 0.215, 0.18], bone: eye });
  }

  // ---- Walking legs (four per side) --------------------------------------
  const legZ = [0.07, 0.02, -0.04, -0.1];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    legZ.forEach((z, i) => {
      const path: [number, number, number][] = [
        [s * 0.12, 0.12, z],
        [s * 0.24, 0.16, z + 0.01],
        [s * 0.34, 0.1, z - 0.02],
        [s * 0.4, 0.012, z - 0.06],
      ];
      b.chain(`leg${side}${i}`, path);
      b.sweep(path, 0.016, { color: SHELL_DARK });
      // Small dark foot tip.
      b.part(new THREE.SphereGeometry(0.02, 8, 6), TIP, { at: path[3] });
    });
  }

  // ---- Claws (chelipeds) --------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const armPath: [number, number, number][] = [
      [s * 0.11, 0.13, 0.1],
      [s * 0.2, 0.17, 0.2],
      [s * 0.3, 0.19, 0.3],
      [s * 0.35, 0.16, 0.37],
    ];
    b.chain(`arm${side}`, armPath);
    b.sweep(armPath, 0.03, { color: SHELL });

    // Palm.
    b.part(ellipsoid(0.07, 0.06, 0.09, 12, 8), SHELL, { at: [s * 0.37, 0.16, 0.42] });

    // Fixed finger (inner) and moving finger (outer), splayed to meet at the tips.
    const innerFinger = forwardCone(0.032, 0.16, 6);
    innerFinger.rotateY(s * 0.1);
    b.part(innerFinger, SHELL, { at: [s * 0.345, 0.16, 0.5] });

    const outerFinger = forwardCone(0.03, 0.15, 6);
    outerFinger.rotateY(-s * 0.1);
    b.part(outerFinger, SHELL_DARK, { at: [s * 0.395, 0.16, 0.5] });

    // Dark tooth tips on the pincers.
    b.part(forwardCone(0.012, 0.03, 4), TIP, { at: [s * 0.345, 0.16, 0.58] });
    b.part(forwardCone(0.012, 0.03, 4), TIP, { at: [s * 0.395, 0.16, 0.565] });
  }

  return b.root;
}
