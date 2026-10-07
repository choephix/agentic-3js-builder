```ts
import * as THREE from "three";
import { createBuilder, catmull, stripes, rng, frame } from "agentic-3js-builder";

export const meta = {
  name: "Hot-Air Balloon",
  description: "Striped stylized hot-air balloon with wicker basket, burner, ropes and pennant.",
};

export default function build() {
  const b = createBuilder({ name: "balloon" });
  const RED = "#d8392f", CREAM = "#f6e7c1", NAVY = "#23406b", GOLD = "#e8b23a";
  const WICKER = "#b57a3c", WICKER2 = "#8f5a28", ROPE = "#d9c08a", METAL = "#555a62", FLAME = "#ff9b2e";

  // dimensions
  const baseY = 0.02; // basket bottom
  const basketH = 1.0;
  const basketTop = baseY + basketH;
  const envBottom = 4.0;
  const envCenter = 7.6;

  const root = b.joint("basket", { at: [0, 0.5, 0], role: "spine" });
  const env = b.joint("envelope", { parent: root, at: [0, envBottom, 0], dir: [0, 1, 0], role: "spine" });
  const flag = b.joint("pennant", { parent: env, at: [0, 12.0, 0], dir: [0, 1, 0], role: "hinge" });

  // Basket: wicker box with tapering walls
  b.frustumBox([0, baseY + 0.02, 0], [0, basketTop, 0], [1.1, 1.1], [1.3, 1.3], { bone: root, color: WICKER });
  // weave bands
  for (let i = 0; i < 4; i++) {
    const y = 0.2 + i * 0.22;
    const w = 1.12 + i * 0.05;
    b.part(new THREE.BoxGeometry(w + 0.04, 0.05, w + 0.04), i % 2 ? WICKER2 : "#c98e4c", { bone: root, at: [0, y, 0] });
  }
  // rim
  b.part(new THREE.BoxGeometry(1.42, 0.08, 1.42), WICKER2, { bone: root, at: [0, basketTop, 0] });
  // floor
  b.part(new THREE.BoxGeometry(1.0, 0.04, 1.0), WICKER2, { bone: root, at: [0, 0.0, 0] });
  // corner posts
  const corners: number[][] = [];
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    corners.push([sx * 0.7, basketTop + 0.02, sz * 0.7]);
    b.rod([sx * 0.62, 0.05, sz * 0.62], [sx * 0.7, basketTop + 0.02, sz * 0.7], 0.04, { bone: root, color: WICKER2, sides: 4 });
  }

  // Envelope: lathe-like loft via sweep of stations
  const stations: [number, number][] = [
    [0.0, 0.55], [0.5, 1.6], [1.5, 2.65], [2.8, 3.2], [3.8, 3.0], [4.8, 2.2], [5.6, 1.1], [6.0, 0.0],
  ];
  const pts = stations.map(([h]) => [0, envBottom + 0.3 + h, 0]);
  const path = catmull(pts);
  const radii = stations.map(([, r]) => r);
  const coat = stripes(RED, CREAM, { size: 0.9, axis: "x", width: 0.5, wobble: 0 });
  void coat;
  const bandPaint = stripes(RED, CREAM, { size: 1.05, axis: "z", width: 0.5, wobble: 0 });
  void bandPaint;
  const envMesh = b.sweep(path, radii, {
    bone: env,
    sides: 16,
    caps: "flat",
    color: (t: number) => "#000000",
    section: { ngon: 16 },
    sectors: [],
    smooth: false,
  } as any);
  void envMesh;
  // Gores: colored sector strips around the envelope
  const N = 16;
  const cols = [RED, CREAM, RED, CREAM, RED, CREAM, RED, CREAM, RED, CREAM, RED, CREAM, RED, CREAM, RED, CREAM];
  const sectors = cols.map((c, i) => [(i * 360) / N - 11.25, ((i + 1) * 360) / N - 11.25, c] as [number, number, string]);
  b.sweep(path, radii, {
    bone: env, section: { ngon: N }, smooth: false, caps: "flat", color: GOLD, sectors,
  } as any);

  // Navy band near the equator
  const bandPath = catmull([[0, envBottom + 3.9, 0], [0, envBottom + 4.5, 0]]);
  b.sweep(bandPath, [3.06, 2.75], { bone: env, section: { ngon: N }, smooth: false, caps: "none", color: NAVY });
  const bandPath2 = catmull([[0, envBottom + 3.35, 0], [0, envBottom + 3.55, 0]]);
  b.sweep(bandPath2, [3.22, 3.2], { bone: env, section: { ngon: N }, smooth: false, caps: "none", color: GOLD });

  // Skirt / mouth ring
  b.lathe(
    [[0.5, 0], [0.62, 0], [0.62, 0.12], [0.5, 0.12]],
    { at: [0, envBottom + 0.08, 0], bone: env, color: NAVY, segments: 16 },
  );
  b.lathe(
    [[0.5, 0], [0.6, 0], [0.72, 0.5], [0.58, 0.5]],
    { at: [0, envBottom - 0.35, 0], bone: env, color: NAVY, segments: 16 },
  );

  // Top cap
  b.part(new THREE.CylinderGeometry(0.28, 0.35, 0.12, 8), GOLD, { bone: env, at: [0, envBottom + 6.28, 0] });
  b.spike([0, envBottom + 6.3, 0], [0, 1, 0], 0.9, 0.04, { bone: flag, color: METAL });

  // Pennant
  b.extrude(
    [[0, 0], [0.9, 0.12, "sharp"], [0, 0.3]],
    { at: [0, 11.0, 0.0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.02, bone: flag, color: RED },
  );

  // Burner frame
  const burnerY = envBottom - 0.55;
  b.rod([0, basketTop + 0.1, 0], [0, burnerY, 0], 0.04, { bone: root, color: METAL });
  b.part(new THREE.TorusGeometry(0.2, 0.035, 5, 10), METAL, { bone: root, at: [0, burnerY, 0], rotation: [90, 0, 0] });
  b.part(new THREE.ConeGeometry(0.18, 0.55, 8), FLAME, { bone: root, at: [0, burnerY + 0.4, 0] });
  b.part(new THREE.ConeGeometry(0.09, 0.35, 6), "#ffe27a", { bone: root, at: [0, burnerY + 0.3, 0] });

  // Support poles to burner ring and ropes to envelope
  const r = rng(3);
  void r;
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    b.rod([sx * 0.7, basketTop + 0.02, sz * 0.7], [sx * 0.2, burnerY, sz * 0.2], 0.03, { bone: root, color: METAL });
    b.rod([sx * 0.7, basketTop + 0.02, sz * 0.7], [sx * 1.5, envBottom + 1.4, sz * 1.5], 0.025, { bone: root, color: ROPE });
    b.rod([sx * 1.5, envBottom + 1.4, sz * 1.5], [sx * 2.3, envBottom + 2.2, sz * 2.3], 0.02, { bone: env, color: ROPE });
  }

  // Sandbags hanging on the side
  for (const s of [1, -1]) {
    b.rod([s * 0.72, basketTop - 0.1, 0], [s * 0.72, basketTop - 0.35, 0], 0.012, { bone: root, color: ROPE });
    b.part(new THREE.CylinderGeometry(0.1, 0.13, 0.24, 6), "#9a8f6a", { bone: root, at: [s * 0.72, basketTop - 0.47, 0] });
  }

  return b.root;
}
```