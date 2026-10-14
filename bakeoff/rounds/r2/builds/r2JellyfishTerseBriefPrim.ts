import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Jellyfish",
  description: "Stylized moon jelly: faceted translucent-looking bell, scalloped rim, frilly oral arms and long trailing tentacles, with a skeleton for animation.",
};

export default function build() {
  const b = createBuilder({ name: "jellyfish" });
  const r = rng(7);

  const root = b.joint("root", { at: [0, 0.5, 0] });
  const bell = b.joint("bell", { at: [0, 0.5, 0], parent: root });

  // Bell dome (faceted hemisphere) with a lighter inner layer
  const dome = new THREE.SphereGeometry(0.22, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  b.part(dome, "#c9a0ff", { at: [0, 0.5, 0], bone: bell, scale: [1, 0.8, 1] });
  const inner = new THREE.SphereGeometry(0.17, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  b.part(inner, "#f0d8ff", { at: [0, 0.5, 0.0], bone: bell, scale: [1, 0.75, 1] });
  // underside disc
  const disc = new THREE.CylinderGeometry(0.2, 0.2, 0.012, 16);
  b.part(disc, "#ff9fd6", { at: [0, 0.495, 0], bone: bell });

  // Rim torus
  const rim = new THREE.TorusGeometry(0.22, 0.014, 5, 24);
  rim.rotateX(Math.PI / 2);
  b.part(rim, "#ff7fc8", { at: [0, 0.5, 0], bone: bell });

  // Scalloped rim lappets
  const nLap = 16;
  for (let i = 0; i < nLap; i++) {
    const a = (i / nLap) * Math.PI * 2;
    const g = new THREE.SphereGeometry(0.026, 6, 4);
    b.part(g, "#ff9ad0", { at: [Math.cos(a) * 0.222, 0.495, Math.sin(a) * 0.222], bone: bell, scale: [1, 0.7, 1] });
  }

  // Ribs / radial stripes on dome
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    for (let k = 0; k < 4; k++) {
      const el = 0.25 + k * 0.28;
      const rr = 0.22 * Math.cos(el);
      const y = 0.5 + 0.22 * 0.8 * Math.sin(el);
      const g = new THREE.SphereGeometry(0.011, 5, 4);
      b.part(g, "#e6c8ff", { at: [Math.cos(a) * rr * 1.0, y + 0.004, Math.sin(a) * rr * 1.0], bone: bell });
    }
  }

  // Gonad horseshoes (four pink rings seen through the top)
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const g = new THREE.TorusGeometry(0.035, 0.009, 4, 8);
    g.rotateX(-Math.PI / 2);
    b.part(g, "#ff6fa8", { at: [Math.cos(a) * 0.075, 0.5 + 0.17 * 0.75 * 0.97, Math.sin(a) * 0.075], bone: bell });
  }
  // top knob
  b.part(new THREE.SphereGeometry(0.02, 6, 4), "#ff9fd6", { at: [0, 0.5 + 0.22 * 0.8, 0], bone: bell });

  // Oral arms: 4 thick frilly ribbons
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const pts: number[][] = [];
    for (let k = 0; k <= 5; k++) {
      const t = k / 5;
      const w = Math.sin(t * 5 + i) * 0.02 * t;
      pts.push([Math.cos(a) * (0.04 + w), 0.49 - t * 0.38, Math.sin(a) * (0.04 + w)]);
    }
    const ch = b.chain("arm" + i, pts, { role: "tentacle", parent: bell });
    b.sweep(ch, 0.02, { color: "#ffd0f0" });
    for (let k = 1; k <= 4; k++) {
      const t = k / 5;
      b.part(new THREE.SphereGeometry(0.018, 5, 4), "#ff9ad0", {
        at: [pts[k][0] + Math.cos(a) * 0.012, pts[k][1], pts[k][2] + Math.sin(a) * 0.012],
        bone: bell,
        scale: [1, 1.3, 1],
      });
    }
  }

  // Long thin tentacles reaching the floor
  const nT = 16;
  for (let i = 0; i < nT; i++) {
    const a = (i / nT) * Math.PI * 2;
    const ph = r() * 6;
    const len = i % 2 ? 1 : 0.85;
    const pts: number[][] = [];
    for (let k = 0; k <= 6; k++) {
      const t = k / 6;
      const rad = 0.2 + Math.sin(t * 4 + ph) * 0.02 * t;
      const aa = a + Math.sin(t * 3 + ph) * 0.08 * t;
      pts.push([Math.cos(aa) * rad, Math.max(0, 0.49 - t * 0.49 * len - (len < 1 ? t * 0.07 : 0)), Math.sin(aa) * rad]);
    }
    pts[6][1] = Math.max(0, pts[6][1]);
    const ch = b.chain("tent" + i, pts, { role: "tentacle", parent: bell });
    b.sweep(ch, 0.006, { color: i % 2 ? "#f4a6e8" : "#e08ad8" });
  }

  return b.root;
}
