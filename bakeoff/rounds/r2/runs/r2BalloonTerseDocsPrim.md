```ts
import * as THREE from "three";
import { createBuilder, stripes, paint, mix, rng } from "agentic-3js-builder";

export const meta = {
  name: "Hot-Air Balloon",
  description: "Striped lathe envelope, rope rigging, wicker basket and burner, hovering above the ground.",
};

export default function build() {
  const b = createBuilder({ name: "balloon" });
  const base = b.joint("base", { at: [0, 0, 0] });

  const RED = "#d94a3a", CREAM = "#f4e6c0", BLUE = "#2f5fa8", GOLD = "#e0a82e";
  const WICK = "#a8743c", WICK2 = "#8a5a2a", ROPE = "#6b4a2a", METAL = "#555a60", FLAME = "#ffb02e";

  // Basket
  const bw = 0.55, bd = 0.45, bh = 0.5, floorY = 0.0;
  const basketPaint = stripes(WICK, WICK2, { size: 0.06, axis: "y", width: 0.5 });
  b.part(new THREE.BoxGeometry(bw * 2, bh, bd * 2), basketPaint, { bone: base, at: [0, floorY + bh / 2, 0] });
  // rim
  const rimY = floorY + bh;
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(bw * 2 + 0.08, 0.06, 0.07), WICK2, { bone: base, at: [0, rimY, s * bd] });
    b.part(new THREE.BoxGeometry(0.07, 0.06, bd * 2 + 0.08), WICK2, { bone: base, at: [s * bw, rimY, 0] });
  }
  // floor skid
  b.part(new THREE.BoxGeometry(bw * 2 + 0.06, 0.04, bd * 2 + 0.06), WICK2, { bone: base, at: [0, 0.02, 0] });
  // corner posts
  const postTop = 1.65;
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    b.rod([sx * bw, rimY, sz * bd], [sx * bw, postTop, sz * bd], 0.018, { color: METAL, bone: base, sides: 6 });
  }

  // Envelope
  const envBase = 3.0; // bottom of envelope
  const prof: [number, number][] = [
    [0, 0], [0.35, 0], [0.6, 0.15], [1.2, 0.8], [1.8, 1.7], [2.1, 2.6], [2.0, 3.5], [1.6, 4.3], [0.9, 4.9], [0, 5.1],
  ];
  const envPaint = paint((p, _n, s) => {
    const ang = Math.atan2(p.x, p.z);
    const k = Math.floor(((ang + Math.PI) / (Math.PI * 2)) * 12) % 12;
    let c = k % 3 === 0 ? RED : k % 3 === 1 ? CREAM : BLUE;
    if (s[0] > 4.3) c = k % 2 ? RED : GOLD;
    return c;
  });
  b.lathe(prof, { at: [0, envBase, 0], segments: 12, smoothing: 1, color: envPaint, bone: base });
  // skirt ring and band
  b.lathe(
    [[0.33, 0], [0.4, 0], [0.4, 0.1], [0.33, 0.1]],
    { at: [0, envBase - 0.02, 0], segments: 12, color: GOLD, bone: base },
  );
  b.lathe(
    [[0, 0], [2.12, 0], [2.12, 0.1], [0, 0.1]].map((p) => [p[0], p[1]] as [number, number]),
    { at: [0, envBase + 2.6, 0], segments: 12, color: GOLD, bone: base },
  );
  // top cap
  b.part(new THREE.ConeGeometry(0.25, 0.2, 8), GOLD, { bone: base, at: [0, envBase + 5.15, 0] });

  // Ropes from basket posts up to skirt ring
  const r = rng(3);
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    const top: [number, number, number] = [sx * 0.37, envBase + 0.05, sz * 0.37];
    b.rod([sx * bw, postTop, sz * bd], top, 0.012, { color: ROPE, bone: base, sides: 5 });
  }
  // intermediate ropes
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + r() * 0.01;
    const top: [number, number, number] = [Math.sin(a) * 0.37, envBase + 0.05, Math.cos(a) * 0.37];
    b.rod([Math.sin(a) * 0.1, postTop + 0.15, Math.cos(a) * 0.1], top, 0.008, { color: ROPE, bone: base, sides: 5 });
  }

  // Burner
  b.part(new THREE.CylinderGeometry(0.1, 0.07, 0.25, 8), METAL, { bone: base, at: [0, postTop + 0.15, 0] });
  b.rod([-bw, postTop, 0], [bw, postTop, 0], 0.02, { color: METAL, bone: base, sides: 6 });
  b.rod([0, postTop, -bd], [0, postTop, bd], 0.02, { color: METAL, bone: base, sides: 6 });
  b.part(new THREE.ConeGeometry(0.09, 0.45, 6), FLAME, { bone: base, at: [0, postTop + 0.52, 0] });
  b.part(new THREE.ConeGeometry(0.05, 0.28, 6), "#fff0a0", { bone: base, at: [0, postTop + 0.45, 0] });

  // Sandbags
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.1, 6, 5), "#c9b183", { bone: base, at: [s * bw - s * 0.0, 0.3, bd + 0.08], scale: [1, 1.2, 0.8] });
  }

  // Lift everything so basket hovers a bit: wrap in root offset
  b.root.position.y = 0.0;
  return b.root;
}
```