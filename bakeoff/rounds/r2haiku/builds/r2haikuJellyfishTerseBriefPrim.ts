import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "jellyfish",
  description: "A stylized jellyfish: a glassy dome bell, a pink core, twelve hanging tentacles with glowing tips, and four frilled oral arms.",
};

export default function build() {
  const b = createBuilder({ name: "jellyfish" });
  const R = rng(7);

  // Skeleton: the bell is the root, tentacles and oral arms hang from it.
  const bell = b.joint("bell", { at: [0, 1.0, 0] });

  // Glassy dome: upper hemisphere squashed to a bell shape.
  const dome = new THREE.SphereGeometry(0.25, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  b.part(dome, "#9fe3f5", { at: [0, 1.0, 0], bone: bell, scale: [1, 0.7, 1] });

  // Rim: a flat torus around the bell edge.
  const rim = new THREE.TorusGeometry(0.25, 0.018, 6, 20);
  rim.rotateX(Math.PI / 2);
  b.part(rim, "#5cc4e0", { at: [0, 1.0, 0], bone: bell });

  // Pink core visible under the dome.
  b.part(new THREE.SphereGeometry(0.07, 10, 6), "#f7a8d8", {
    at: [0, 0.97, 0],
    bone: bell,
    scale: [1, 0.5, 1],
  });

  // Spots scattered over the dome.
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2 + R() * 0.2;
    const e = 0.35 + R() * 0.8; // elevation up the dome
    const rr = 0.25 * Math.cos(e) * 1.02;
    const y = 1.0 + 0.7 * 0.25 * Math.sin(e);
    b.part(new THREE.SphereGeometry(0.03, 6, 4), "#ff7ab6", {
      at: [rr * Math.sin(a), y, rr * Math.cos(a)],
      bone: bell,
    });
  }

  // Twelve tentacles hanging from the rim, each with a gentle sway and a glowing tip.
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    const len = k % 3 === 0 ? 0.99 : 0.85 + 0.1 * R();
    const phase = R() * Math.PI * 2;
    const pts: number[][] = [];
    for (let s = 0; s <= 8; s++) {
      const u = s / 8;
      const r = 0.24 + 0.06 * u;
      const sway = 0.035 * Math.sin(2.4 * u * Math.PI + phase) * u;
      const x = r * Math.sin(a) + sway * Math.cos(a);
      const z = r * Math.cos(a) - sway * Math.sin(a);
      const y = 0.99 - len * u;
      pts.push([x, y, z]);
    }
    const ch = b.chain(`tentacle${k}`, pts, { role: "tentacle" });
    b.sweep(ch, 0.014, { color: "#c9f2ff" });

    const tip = pts[pts.length - 1];
    b.part(new THREE.SphereGeometry(0.022, 6, 4), "#ffd36b", { at: tip });
  }

  // Four frilled oral arms under the bell, longer and thicker, with flattened tips.
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    const pts: number[][] = [];
    for (let s = 0; s <= 4; s++) {
      const u = s / 4;
      const r = 0.05 + 0.02 * u;
      const wave = 0.03 * Math.sin(u * Math.PI * 2 + k) * u;
      const x = r * Math.sin(a) + wave * Math.cos(a);
      const z = r * Math.cos(a) - wave * Math.sin(a);
      const y = 0.95 - 0.6 * u;
      pts.push([x, y, z]);
    }
    const ch = b.chain(`oralArm${k}`, pts, { role: "tentacle" });
    b.sweep(ch, 0.03, { color: "#f7a8d8" });

    const tip = pts[pts.length - 1];
    b.part(new THREE.SphereGeometry(0.05, 8, 5), "#ff7ab6", {
      at: tip,
      scale: [1, 0.6, 0.6],
    });
  }

  return b.root;
}
