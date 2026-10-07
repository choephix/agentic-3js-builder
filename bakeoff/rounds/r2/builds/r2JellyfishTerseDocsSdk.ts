import * as THREE from "three";
import { createBuilder, catmull, mottle, rng, frame, gradient } from "../../../../src/index";

export const meta = {
  name: "Jellyfish",
  description: "A moon-style jellyfish with a translucent-looking bell, oral arms and a ring of trailing tentacles, in a rest pose.",
};

export default function build() {
  const b = createBuilder({ name: "jellyfish" });
  const r = rng(11);
  const H = 0.9;

  const bell = b.joint("bell", { at: [0, H, 0], dir: [0, 1, 0], role: "spine" });

  // bell dome (shell profile)
  const skin = mottle("#cfa8f2", "#f0d8ff", { size: 0.07, contrast: 0.6, seed: 3 });
  const dome = b.lathe(
    [
      [0, 0.29],
      [0.1, 0.27],
      [0.19, 0.2],
      [0.24, 0.09],
      [0.265, -0.02],
      [0.255, -0.055],
      [0.225, -0.03],
      [0.2, 0.05],
      [0.15, 0.15],
      [0.08, 0.2],
      [0, 0.21],
    ],
    { at: [0, H, 0], bone: bell, segments: 16, smoothing: 1, color: skin },
  );

  // rim bumps (scalloped edge)
  b.ring(frame([0, H - 0.04, 0], [0, 1, 0]), { count: 16, radius: 0.25 }, (it) =>
    b.stick(new THREE.SphereGeometry(0.025, 6, 4), "#e7b8ff", it, { embed: 0.4, bone: bell }),
  );

  // glowing spots on the dome
  const surf = b.surface(dome);
  for (const h of surf.scatter(26, { rng: r, minDist: 0.07, filter: (h) => h.n.y > 0.35 }))
    b.stick(new THREE.SphereGeometry(0.014, 6, 4), "#fff4fb", h, { embed: 0.5, bone: bell });

  // radial canals as ribs
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const pts = [0.03, 0.09, 0.15, 0.2, 0.235].map((rad, k) => {
      const y = H + [0.205, 0.19, 0.145, 0.07, -0.01][k] + 0.012;
      return [Math.sin(a) * rad, y, Math.cos(a) * rad];
    });
    b.sweep(catmull(pts), 0.005, { bone: bell, color: "#b57be0" });
  }

  // gonads: four-leaf ring seen through the bell
  const ringPts: number[][] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const rr = 0.095 + 0.02 * Math.cos(a * 4);
    ringPts.push([Math.sin(a) * rr, H + 0.1, Math.cos(a) * rr]);
  }
  b.sweep(catmull(ringPts, { closed: true }), 0.016, { bone: bell, color: "#ff9f5e" });

  // oral arms
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const sx = Math.sin(a), sz = Math.cos(a);
    const path = catmull([
      [sx * 0.04, H - 0.03, sz * 0.04],
      [sx * 0.07, H - 0.2, sz * 0.07],
      [sx * 0.09, H - 0.38, sz * 0.09],
      [sx * 0.1, H - 0.58, sz * 0.1],
    ]);
    const ch = b.chain(`oralArm${i + 1}_`, path, { parent: bell, count: 3, role: "tentacle", names: (j) => `oralArm${i + 1}_${j + 1}` });
    const sw = b.sweep(ch, (t) => [0.03 * (1 - t) + 0.012, 0.012], { color: gradient("#f29ad8", "#ffd1ee", [0, H - 0.1, 0], [0, H - 0.6, 0]) });
    b.along(sw, 5, (at) => b.stick(new THREE.SphereGeometry(0.02, 6, 4), "#ffc2e8", at, { embed: 0.3 }));
  }

  // long thin tentacles
  const N = 20;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const sx = Math.sin(a), sz = Math.cos(a);
    const ph = r() * 6;
    const pts: number[][] = [];
    for (let k = 0; k <= 4; k++) {
      const t = k / 4;
      const rad = 0.245 - 0.1 * t;
      const w = 0.025 * Math.sin(ph + t * 5) * t;
      pts.push([sx * rad + -sz * w, H - 0.05 - t * (H - 0.06), sz * rad + sx * w]);
    }
    const ch = b.chain(`tentacle${i + 1}_`, catmull(pts), { parent: bell, count: 4, role: "tentacle", names: (j) => `tentacle${i + 1}_${j + 1}` });
    b.sweep(ch, [0.009, 0.003], { color: i % 2 ? "#d9a0f5" : "#f0b8e8", caps: { end: "round" } });
  }

  return b.root;
}
