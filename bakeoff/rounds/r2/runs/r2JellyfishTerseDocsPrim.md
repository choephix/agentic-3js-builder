```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, rng, mottle, gradient, svg } from "agentic-3js-builder";

export const meta = {
  name: "Moon Jellyfish",
  description: "A stylized floating jellyfish with a glowing bell, frilled rim, oral arms and long trailing tentacles.",
};

export default function build() {
  const b = createBuilder({ name: "jellyfish" });
  const R = rng(11);

  const BELL = "#c9a8ff";
  const BELL_DEEP = "#8f6bd8";
  const RIM = "#ff8fd0";
  const ARM = "#ffd1ec";
  const TENT = "#b58cff";
  const GLOW = "#fff3a8";
  const DARK = "#3a2466";

  // Floating: lowest tentacle tips near y=0
  const cy = 1.5;
  const root = b.joint("bellRoot", { at: [0, cy, 0], role: "spine" });
  const bell = b.joint("bell", { parent: root, at: [0, cy, 0], dir: [0, 1, 0], role: "spine" });

  // Bell dome (lathe)
  const dome = [
    [0, 0.5],
    [0.18, 0.49],
    [0.36, 0.42],
    [0.5, 0.3],
    [0.58, 0.14],
    [0.6, 0.0],
    [0.56, -0.04],
    [0.46, 0.04],
    [0.3, 0.2],
    [0.14, 0.28],
    [0, 0.3],
  ] as any;
  const skin = mottle(BELL, BELL_DEEP, { size: 0.22, contrast: 0.6, seed: 4 });
  b.lathe(dome, { at: [0, cy, 0], bone: bell, segments: 14, color: skin, smoothing: 1 });

  // inner glowing gonads (4 horseshoe rings)
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    b.part(new THREE.SphereGeometry(0.08, 6, 4), GLOW, {
      bone: bell,
      at: [Math.cos(a) * 0.17, cy + 0.2, Math.sin(a) * 0.17],
      scale: [1, 0.5, 1],
    });
  }
  b.part(new THREE.SphereGeometry(0.06, 6, 4), RIM, { bone: bell, at: [0, cy + 0.26, 0] });

  // rim ring
  const rimPts: number[][] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    rimPts.push([Math.cos(a) * 0.58, cy - 0.02, Math.sin(a) * 0.58]);
  }
  b.sweep(catmull(rimPts, { closed: true }), 0.03, { bone: bell, color: RIM, sides: 6 });

  // rim lappets
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.part(new THREE.ConeGeometry(0.05, 0.1, 5), RIM, {
      bone: bell,
      at: [Math.cos(a) * 0.58, cy - 0.07, Math.sin(a) * 0.58],
      dir: [0, -1, 0],
    });
  }

  // radial canals decoration
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const c = Math.cos(a), s = Math.sin(a);
    b.sweep(
      polyl([
        [c * 0.05, cy + 0.3, s * 0.05],
        [c * 0.3, cy + 0.34, s * 0.3],
        [c * 0.5, cy + 0.2, s * 0.5],
        [c * 0.57, cy + 0.04, s * 0.57],
      ]),
      0.012,
      { bone: bell, color: BELL_DEEP, sides: 5 },
    );
  }

  function polyl(p: number[][]) {
    return catmull(p);
  }

  // Oral arms: 4 frilly arms
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const c = Math.cos(a), s = Math.sin(a);
    const pts = [
      [c * 0.1, cy, s * 0.1],
      [c * 0.16, cy - 0.3, s * 0.16],
      [c * 0.1, cy - 0.65, s * 0.1],
      [c * 0.16, cy - 0.95, s * 0.16],
    ];
    const ch = b.chain(`arm${i}`, catmull(pts), { parent: bell, count: 4, role: "tentacle" });
    b.sweep(ch, (t) => [0.05 * (1 - t) + 0.02, 0.015], { color: ARM });
    b.along(ch, 5, (at) => b.spike(at, at, 0.07, 0.025, { color: RIM }));
  }

  // Long tentacles
  const N = 14;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const c = Math.cos(a), s = Math.sin(a);
    const L = 1.0 + R() * 0.15;
    const sw = (R() - 0.5) * 0.12;
    const pts = [
      [c * 0.57, cy - 0.04, s * 0.57],
      [c * 0.62 + sw, cy - L * 0.3, s * 0.62],
      [c * 0.5 - sw, cy - L * 0.65, s * 0.5 + sw],
      [c * 0.55, cy - L, s * 0.55],
    ];
    const ch = b.chain(`tent${i}`, catmull(pts), { parent: bell, count: 3, role: "tentacle" });
    b.sweep(ch, [0.02, 0.006], { color: gradient(TENT, GLOW, [0, cy - 0.3, 0], [0, cy - 1.1, 0]), sides: 5 });
    b.along(ch, 4, (at) => b.part(new THREE.SphereGeometry(0.02, 5, 4), DARK, { at: at.at, bone: at.bone }));
  }

  return b.root;
}
```