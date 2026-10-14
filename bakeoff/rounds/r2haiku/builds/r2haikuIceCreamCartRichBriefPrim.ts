import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "seaside-ice-cream-cart",
  description:
    "A mint and cream ice cream cart with a pink and white scalloped canopy, spoked wheels, chrome freezer lid, cone sign and giant pastel cones on top.",
};

const MINT = "#7fd8c0";
const CREAM = "#fff4e0";
const PINK = "#ff6fa5";
const WHITE = "#fffaf2";
const CHROME = "#e4e9ee";
const DARK = "#2e2e38";
const CHASSIS = "#3d3d4a";
const WAFFLE = "#e8b070";
const WAFFLE_LIGHT = "#ffd6a5";

export default function build() {
  const b = createBuilder({ name: "seaside-ice-cream-cart" });
  b.joint("cart", { at: [0, 0, 0] });

  const put = (geo: THREE.BufferGeometry, color: string, at: [number, number, number]) =>
    b.part(geo, color, { at });

  // ---- Chassis and body ----
  put(new THREE.BoxGeometry(1.2, 0.2, 1.9), CHASSIS, [0, 0.2, 0]);
  put(new THREE.BoxGeometry(1.1, 0.9, 1.8), MINT, [0, 0.75, 0]);
  put(new THREE.BoxGeometry(1.12, 0.08, 1.82), CREAM, [0, 1.22, 0]);

  // Cream side panels, one per side
  for (const s of [-1, 1]) {
    put(new THREE.BoxGeometry(0.01, 0.4, 1.5), CREAM, [s * 0.556, 0.8, 0]);
  }

  // Serving window, dark interior, and counter shelf on the front
  put(new THREE.BoxGeometry(0.7, 0.35, 0.02), "#3a2f2a", [0, 0.95, 0.905]);
  put(new THREE.BoxGeometry(0.9, 0.05, 0.25), CREAM, [0, 0.9, 1.02]);

  // ---- Chrome freezer lid (half-buried cylinder along Z) ----
  const lidGeo = new THREE.CylinderGeometry(0.36, 0.36, 1.3, 20);
  lidGeo.rotateX(Math.PI / 2);
  put(lidGeo, CHROME, [0, 1.2, -0.05]);

  // ---- Canopy: striped roof, posts, scalloped valance ----
  const z0 = -0.9;
  const sw = 0.37;
  for (let i = 0; i < 6; i++) {
    const zc = z0 + sw * (i + 0.5);
    put(new THREE.BoxGeometry(1.6, 0.06, sw), i % 2 === 0 ? PINK : WHITE, [0, 2.1, zc]);
  }

  for (const x of [-0.72, 0.72]) {
    for (const z of [-0.85, 0.85]) {
      put(new THREE.BoxGeometry(0.05, 0.9, 0.05), DARK, [x, 1.65, z]);
    }
  }

  // Front valance scallops
  const scallopGeo = new THREE.SphereGeometry(0.13, 10, 8);
  for (let i = 0; i < 8; i++) {
    const x = -0.7 + i * 0.2;
    put(scallopGeo, i % 2 === 0 ? PINK : WHITE, [x, 1.98, 1.28]);
  }
  // Side valance scallops
  for (let i = 0; i < 10; i++) {
    const z = -0.7 + i * 0.2;
    const c = i % 2 === 0 ? PINK : WHITE;
    put(scallopGeo, c, [-0.8, 1.98, z]);
    put(scallopGeo, c, [0.8, 1.98, z]);
  }

  // ---- Wheels: tyre, hub, spokes ----
  const tireGeo = new THREE.TorusGeometry(0.42, 0.07, 10, 24);
  tireGeo.rotateY(Math.PI / 2);
  const hubGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.16, 12);
  hubGeo.rotateZ(Math.PI / 2);
  const wheelZ = -0.35;
  const wheelY = 0.45;
  for (const s of [-1, 1]) {
    const x = s * 0.66;
    put(tireGeo.clone(), DARK, [x, wheelY, wheelZ]);
    put(hubGeo.clone(), CHROME, [x, wheelY, wheelZ]);
    for (let k = 0; k < 6; k++) {
      const spoke = new THREE.BoxGeometry(0.035, 0.8, 0.035);
      spoke.rotateX((k * Math.PI) / 6);
      put(spoke, PINK, [x, wheelY, wheelZ]);
    }
  }

  // ---- Push handle at the back ----
  put(new THREE.BoxGeometry(1.0, 0.06, 0.06), CHROME, [0, 1.1, -1.3]);
  for (const s of [-1, 1]) {
    put(new THREE.BoxGeometry(0.06, 0.06, 0.4), CHROME, [s * 0.5, 1.1, -1.1]);
    // grips
    const grip = new THREE.CylinderGeometry(0.04, 0.04, 0.18, 8);
    grip.rotateX(Math.PI / 2);
    put(grip, DARK, [s * 0.5, 1.1, -1.3]);
  }

  // ---- Cone sign on the front, with a scoop on top ----
  const signArm = new THREE.BoxGeometry(0.05, 0.05, 0.4);
  put(signArm, CHROME, [0, 1.0, 1.1]);

  const signCone = new THREE.ConeGeometry(0.25, 0.55, 14);
  signCone.rotateX(Math.PI);
  put(signCone, WAFFLE, [0, 1.0, 1.3]);

  const signRim = new THREE.TorusGeometry(0.25, 0.022, 6, 16);
  signRim.rotateX(Math.PI / 2);
  put(signRim, PINK, [0, 1.275, 1.3]);

  put(new THREE.SphereGeometry(0.22, 14, 10), "#ffb3c6", [0, 1.36, 1.3]);

  // ---- Giant pastel cones along the canopy roof ----
  const flavours = ["#a8e6cf", "#ffb3c6", "#fff1a1", "#cdb8ff"];
  const sprinkleColours = [PINK, "#5ec8ff", "#ffffff", "#ffd23f"];
  const coneGeo = new THREE.ConeGeometry(0.17, 0.55, 14);
  coneGeo.rotateX(Math.PI);
  const rimGeo = new THREE.TorusGeometry(0.17, 0.025, 6, 14);
  rimGeo.rotateX(Math.PI / 2);
  const scoopR = 0.24;
  const scoopGeo = new THREE.SphereGeometry(scoopR, 14, 10);
  const sprinkleGeo = new THREE.BoxGeometry(0.03, 0.03, 0.03);

  for (let i = 0; i < 4; i++) {
    const z = -0.45 + i * 0.45;
    const coneCy = 2.375;
    put(coneGeo.clone(), WAFFLE_LIGHT, [0, coneCy, z]);
    put(rimGeo.clone(), WAFFLE, [0, coneCy + 0.275, z]);

    const scoopCy = coneCy + 0.275 + 0.07;
    put(scoopGeo.clone(), flavours[i], [0, scoopCy, z]);

    // Sprinkles spiralled over the upper scoop
    for (let k = 0; k < 6; k++) {
      const theta = k * 2.4 + i;
      const phi = 0.5 + k * 0.18;
      const rho = (scoopR + 0.01) * Math.sin(phi);
      const x = rho * Math.cos(theta);
      const y = scoopCy + (scoopR + 0.01) * Math.cos(phi);
      const zz = z + rho * Math.sin(theta);
      put(sprinkleGeo.clone(), sprinkleColours[(i + k) % sprinkleColours.length], [x, y, zz]);
    }
  }

  return b.root;
}
