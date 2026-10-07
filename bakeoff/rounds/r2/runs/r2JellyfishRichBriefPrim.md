```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Moon Jellyfish",
  description: "Glowing translucent moon jelly with four pink gonad horseshoes, fringe tentacles and ruffled oral arms, drifting upward.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "moonJelly" });
  const r = rng(7);
  const H = 1.2; // bell centre height (floating)

  const root = b.joint("root", { at: [0, H, 0] });
  const bell = b.joint("bell", { at: [0, H, 0], parent: root });

  // Bell dome: lathe-like half sphere (translucent look through pale colours)
  const domeGeo = new THREE.SphereGeometry(0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.55);
  domeGeo.scale(1, 0.62, 1);
  b.part(domeGeo, "#bfe3f5", { at: [0, H, 0], bone: bell });
  // inner glowing core
  b.part(new THREE.SphereGeometry(0.34, 10, 6), "#e8fbff", { at: [0, H + 0.04, 0], bone: bell });
  // top cap highlight
  b.part(new THREE.SphereGeometry(0.2, 8, 5), "#f4feff", { at: [0, H + 0.26, 0], bone: bell });

  // rim ring
  const rim = new THREE.TorusGeometry(0.5, 0.025, 5, 24);
  rim.rotateX(Math.PI / 2);
  b.part(rim, "#9fd0ea", { at: [0, H - 0.1, 0], bone: bell });
  // scalloped rim lobes
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.04, 6, 4), "#d6f0fb", {
      at: [Math.cos(a) * 0.5, H - 0.11, Math.sin(a) * 0.5],
      bone: bell,
    });
  }

  // radial canals
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const g = new THREE.BoxGeometry(0.008, 0.008, 0.3);
    b.part(g, "#e6f7ff", {
      at: [Math.cos(a) * 0.3, H + 0.08, Math.sin(a) * 0.3],
      bone: bell,
    }).rotation.set(0.0, -a + Math.PI / 2, 0);
  }

  // four pink horseshoes
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const cx = Math.cos(a) * 0.19,
      cz = Math.sin(a) * 0.19;
    const g = new THREE.TorusGeometry(0.085, 0.028, 5, 10, Math.PI * 1.45);
    g.rotateX(-Math.PI / 2);
    g.rotateY(-a + Math.PI * 0.5 + Math.PI * 0.275);
    b.part(g, "#ff8fb8", { at: [cx, H + 0.02, cz], bone: bell });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), "#ffc2d8", { at: [cx, H + 0.03, cz], bone: bell });
  }

  // fine fringe tentacles: chains of small segments
  const nT = 36;
  for (let i = 0; i < nT; i++) {
    const a = (i / nT) * Math.PI * 2;
    const x = Math.cos(a) * 0.49,
      z = Math.sin(a) * 0.49;
    const len = 0.28 + r() * 0.12;
    const pts = [0, 1, 2].map((k) => [x * (1 + k * 0.02), H - 0.12 - (k * len) / 3, z * (1 + k * 0.02)]);
    const ch = b.chain("fringe" + i, pts, { role: "tentacle", parent: bell });
    b.sweep(ch, 0.007, { color: i % 2 ? "#d9c8f5" : "#cfeaf8" });
  }

  // four long ruffled oral arms
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const dx = Math.cos(a),
      dz = Math.sin(a);
    const pts: number[][] = [];
    for (let k = 0; k <= 4; k++) {
      const t = k / 4;
      pts.push([dx * 0.1 + dx * Math.sin(t * 5 + i) * 0.04, H - 0.12 - t * 0.85, dz * 0.1 + dz * Math.sin(t * 5 + i) * 0.04]);
    }
    const ch = b.chain("arm" + i, pts, { role: "arm", parent: bell });
    b.sweep(ch, 0.035, { color: i % 2 ? "#e9e4f7" : "#f6f2fb" });
    // ruffles along arm
    for (let k = 1; k <= 8; k++) {
      const t = k / 9;
      const y = H - 0.12 - t * 0.85;
      const w = 0.07 * (1 - t * 0.6);
      const gg = new THREE.BoxGeometry(w * 2, 0.05, 0.012);
      const m = b.part(gg, k % 2 ? "#c9b3ee" : "#f0eafa", {
        at: [dx * 0.1 + dx * Math.sin(t * 4.4 + i) * 0.04, y, dz * 0.1 + dz * Math.sin(t * 4.4 + i) * 0.04],
        bone: ch.joints ? undefined : undefined,
      });
      m.rotation.set(0, -a + (k % 2 ? 0.5 : -0.5), 0);
    }
    b.part(new THREE.SphereGeometry(0.03, 6, 4), "#b79be6", {
      at: [dx * 0.1, H - 0.98, dz * 0.1],
    });
  }

  // glow: inner point light
  const light = new THREE.PointLight(0xaee8ff, 1.5, 3);
  light.position.set(0, 0, 0);
  bell.add(light);

  return b.root;
}
```