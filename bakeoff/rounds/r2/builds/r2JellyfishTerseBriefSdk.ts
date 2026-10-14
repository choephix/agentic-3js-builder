import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Jellyfish",
  description:
    "Stylized moon jelly: faceted translucent-look bell with spots and rim, four frilly oral arms and a fringe of trailing tentacles, all on a rigged skeleton.",
};

export default function build() {
  const b = createBuilder({ name: "jellyfish" });
  const r = rng(7);

  const Y = 0.88; // bell rim height
  const R = 0.32; // bell radius
  const bell = b.joint("bell", { at: [0, Y, 0] });

  // Bell dome (hemisphere, flattened)
  const dome = new THREE.SphereGeometry(R, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  dome.scale(1, 0.75, 1);
  b.part(dome, "#e58fc4", { at: [0, Y, 0], bone: bell });

  // Inner subumbrella
  const inner = new THREE.SphereGeometry(R * 0.93, 14, 5, 0, Math.PI * 2, 0, Math.PI / 2);
  inner.scale(1, 0.7, 1);
  b.part(inner, "#f8d3ea", { at: [0, Y - 0.008, 0], bone: bell });

  // Rim ring
  const rim = new THREE.TorusGeometry(R * 0.98, 0.02, 5, 20);
  rim.rotateX(Math.PI / 2);
  b.part(rim, "#c9609f", { at: [0, Y, 0], bone: bell });

  // Top cap knob
  b.part(new THREE.SphereGeometry(0.05, 8, 5), "#c9609f", { at: [0, Y + R * 0.75, 0], bone: bell });

  // Spots on the dome
  for (let i = 0; i < 26; i++) {
    const az = r() * Math.PI * 2;
    const el = 0.15 + r() * 1.25; // from rim upward
    const rad = R * 1.005;
    const x = Math.cos(el) * Math.cos(az) * rad;
    const z = Math.cos(el) * Math.sin(az) * rad;
    const y = Math.sin(el) * rad * 0.75;
    const s = 0.018 + r() * 0.022;
    const g = new THREE.SphereGeometry(s, 6, 4);
    g.scale(1, 0.5, 1);
    g.lookAt(new THREE.Vector3(x, y, z));
    b.part(g, i % 3 === 0 ? "#fff1a8" : "#fbe3f2", { at: [x, Y + y, z], bone: bell });
  }

  // Gonad horseshoe rings seen through the bell
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const g = new THREE.TorusGeometry(0.05, 0.016, 5, 10);
    g.rotateX(Math.PI / 2);
    b.part(g, "#a45bd6", { at: [Math.cos(a) * 0.13, Y + 0.06, Math.sin(a) * 0.13], bone: bell });
  }

  // Oral arms: 4 thick frilly chains
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const dx = Math.cos(a), dz = Math.sin(a);
    const pts: number[][] = [];
    for (let k = 0; k < 5; k++) {
      const t = k / 4;
      const sway = Math.sin(t * 3 + i) * 0.03;
      pts.push([dx * (0.05 + sway), Y - 0.02 - t * 0.55, dz * (0.05 + sway)]);
    }
    const ch = b.chain("oralArm" + i, pts, { role: "tentacle", parent: bell });
    b.sweep(ch, 0.032, { color: "#f4a6d6" });
    // Frilly bobbles along arm
    for (let k = 1; k < 5; k++) {
      const p = pts[k];
      b.part(new THREE.IcosahedronGeometry(0.035, 0), "#ffd0ea", {
        at: [p[0] + dx * 0.03, p[1], p[2] + dz * 0.03],
        bone: bell,
      });
    }
  }

  // Fringe of thin trailing tentacles
  const N = 16;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const dx = Math.cos(a), dz = Math.sin(a);
    const len = 0.78 + (i % 2) * 0.05;
    const phase = r() * 6;
    const pts: number[][] = [];
    for (let k = 0; k < 6; k++) {
      const t = k / 5;
      const w = Math.sin(t * 5 + phase) * 0.025 * t;
      pts.push([
        dx * (R * 0.96 - t * 0.06) + -dz * w,
        Y - t * len + 0.0,
        dz * (R * 0.96 - t * 0.06) + dx * w,
      ]);
    }
    pts[5][1] = Math.max(pts[5][1], 0.01);
    const ch = b.chain("tentacle" + i, pts, { role: "tentacle", parent: bell });
    b.sweep(ch, 0.009, { color: i % 2 ? "#c46fe0" : "#e58fc4" });
    // Bead at tip
    b.part(new THREE.IcosahedronGeometry(0.014, 0), "#fff1a8", { at: pts[5], bone: bell });
  }

  return b.root;
}
