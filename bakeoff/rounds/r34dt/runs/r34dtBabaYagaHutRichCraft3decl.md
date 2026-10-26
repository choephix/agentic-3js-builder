```ts
import * as THREE from "three";
import { createBuilder, frame, rng, mottle, grain, paint, svg, catmull, limb, lerp, offset } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Baba Yaga's Hut",
  description: "Folk-art log hut standing on giant chicken legs, with carved shutters, painted trim, a lit window and a skull fence.",
};

const LOG = "#8a5a2e", LOG_D = "#5e3a1c", ROOF = "#6b3a22", RED = "#b8322a", BLUE = "#2f5fa8", GOLD = "#e3b23c";
const CREAM = "#f3e6c4", SCALE = "#d9a32c", CLAW = "#3a2a1a", BONE = "#e8dfc8", GREEN = "#3f7a3c";

export default function build() {
  const b = createBuilder({ name: "baba_yaga_hut" });
  const r = rng(11);
  const woodPaint = grain(LOG, LOG_D, { size: 0.04, axis: "x", seed: 2 });
  const mossLog = paint((p, n) => (n.y > 0.5 && p.y > 1.9 ? GREEN : p.y < 1.2 ? LOG_D : LOG));
  void mossLog;
  const roofPaint = mottle(ROOF, "#8a4a2a", { size: 0.12, seed: 3 });

  const hips = b.joint("hips", { at: [0, 1.0, 0] });
  const body = b.joint("body", { parent: hips, at: [0, 1.4, 0], dir: [0, 1, 0] });

  // Folk-art textures
  const shutter = svg(`<svg viewBox="0 0 40 80"><rect width="40" height="80" rx="4" fill="${BLUE}" stroke="#16305c" stroke-width="3"/><circle cx="20" cy="26" r="9" fill="${GOLD}"/><circle cx="20" cy="26" r="4" fill="${RED}"/><path d="M20 40 L10 60 M20 40 L30 60 M20 40 L20 66" stroke="${CREAM}" stroke-width="3" fill="none"/><circle cx="8" cy="72" r="3" fill="${RED}"/><circle cx="32" cy="72" r="3" fill="${RED}"/></svg>`, { size: 128 });
  const win = svg(`<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#ffcf5a"/><path d="M32 0V64M0 32H64" stroke="#7a4a1c" stroke-width="5"/><rect width="64" height="64" fill="none" stroke="#7a4a1c" stroke-width="6"/></svg>`, { size: 128 });
  const trim = svg(`<svg viewBox="0 0 80 20"><rect width="80" height="20" fill="${RED}"/><path d="M0 10 Q10 0 20 10 T40 10 T60 10 T80 10" stroke="${CREAM}" stroke-width="3" fill="none"/><circle cx="10" cy="15" r="2.5" fill="${GOLD}"/><circle cx="30" cy="15" r="2.5" fill="${GOLD}"/><circle cx="50" cy="15" r="2.5" fill="${GOLD}"/><circle cx="70" cy="15" r="2.5" fill="${GOLD}"/></svg>`, { size: 256 });
  const door = svg(`<svg viewBox="0 0 50 80"><path d="M0 80V25Q25 -8 50 25V80Z" fill="${RED}" stroke="#5a1410" stroke-width="3"/><path d="M25 12V80" stroke="#5a1410" stroke-width="2"/><path d="M12 40q6-10 13 0q7-10 13 0M12 60q6-10 13 0q7-10 13 0" stroke="${GOLD}" stroke-width="3" fill="none"/><circle cx="35" cy="48" r="3" fill="${GOLD}"/></svg>`, { size: 128 });
  const eyeTex = svg(`<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="#fff3c0" stroke="#222" stroke-width="2"/><circle cx="10" cy="10" r="4" fill="#111"/></svg>`, { size: 64 });
  void eyeTex;
  const flower = svg(`<svg viewBox="0 0 32 48"><path d="M16 48V20" stroke="${GREEN}" stroke-width="3"/><g fill="${RED}"><circle cx="16" cy="12" r="6"/><circle cx="8" cy="18" r="5"/><circle cx="24" cy="18" r="5"/></g><circle cx="16" cy="15" r="4" fill="${GOLD}"/></svg>`, { size: 64 });

  // Chicken legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.7, 1.4, -0.1], [s * 0.85, 0.05, 0.45], [0.7, 0.75, 0.3], [[0, 0, 1], [0, 0, -1]]);
    const leg = b.chain(`leg${side}`, pts, { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" });
    b.sweep(leg, [0.12, 0.07], { color: SCALE, sides: 6, caps: "round" });
    const foot = pts[pts.length - 1];
    b.part(new THREE.SphereGeometry(0.1, 6, 5), SCALE, { at: foot, bone: leg.tip! });
    for (let i = -1; i <= 1; i++) {
      const tip: [number, number, number] = [foot.x + i * 0.22, 0.03, foot.z + 0.55];
      b.spike([foot.x, 0.07, foot.z], tip, null, 0.06, CLAW, { bone: leg.tip!, caps: "point" });
      b.part(new THREE.ConeGeometry(0.05, 0.14, 6), CLAW, { at: [tip[0], 0.05, tip[2] + 0.05], dir: [0, 0, 1], bone: leg.tip! });
    }
    b.spike([foot.x, 0.07, foot.z], [foot.x, 0.04, foot.z - 0.4], null, 0.06, SCALE, { bone: leg.tip! });
    // feather tufts on thigh
    for (let k = 0; k < 4; k++) {
      const p = lerp(pts[0], pts[1], 0.2 + k * 0.2);
      b.part(new THREE.ConeGeometry(0.07, 0.25, 5), "#f0c24a", { at: [p.x + s * 0.1, p.y, p.z - 0.05], dir: [s * 0.4, -1, -0.5], bone: leg.joints[0] });
    }
  }

  // Floor platform
  b.part(new THREE.BoxGeometry(2.0, 0.18, 2.2), woodPaint, { bone: body, at: [0, 1.45, 0] });

  // Log walls: stacked horizontal logs
  const W = 0.8, D = 0.9;
  for (let i = 0; i < 9; i++) {
    const y = 1.62 + i * 0.2;
    const col = i % 2 ? LOG : "#7a4e26";
    b.part(new THREE.CylinderGeometry(0.11, 0.11, 2 * W + 0.4 + (i % 2) * 0.1, 8), woodPaint, { bone: body, at: [0, y, D], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.11, 0.11, 2 * W + 0.4 + (i % 2) * 0.1, 8), woodPaint, { bone: body, at: [0, y, -D], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.11, 0.11, 2 * D + 0.4 + (i % 2) * 0.1, 8), col, { bone: body, at: [W, y, 0], dir: [0, 0, 1] });
    b.part(new THREE.CylinderGeometry(0.11, 0.11, 2 * D + 0.4 + (i % 2) * 0.1, 8), col, { bone: body, at: [-W, y, 0], dir: [0, 0, 1] });
    b.part(new THREE.CylinderGeometry(0.08, 0.08, 1.7, 8), woodPaint, { bone: body, at: [0, y, 0], dir: [1, 0, 0] });
  }
  b.part(new THREE.BoxGeometry(1.5, 1.8, 1.7), LOG_D, { bone: body, at: [0, 2.4, 0] });

  // Gable ends
  const gable = [[-1.15, 0], [1.15, 0], [0, 0.85]] as [number, number][];
  for (const s of [1, -1])
    b.extrude(gable, { at: [s * 0.78, 3.48, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.05, color: LOG, bone: body });
  b.extrude([[-1.15, 0], [1.15, 0], [0, 0.85]], { at: [0, 3.48, 0], x: [1, 0, 0], thickness: 1.0, color: LOG, bone: body });

  // Roof: two tilted planks with red trim
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(2.2, 0.1, 1.75), roofPaint, { bone: body, at: [0, 3.9, s * 0.5], rotation: [s * 38, 0, 0] });
    b.part(new THREE.BoxGeometry(2.3, 0.14, 0.1), trim, { bone: body, at: [0, 3.55 - 0.04, s * 1.25], rotation: [s * 38, 0, 0], texture: trim });
  }
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 2.5, 6), RED, { bone: body, at: [0, 4.4, 0], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 2.5, 6), RED, { bone: body, at: [0, 4.4, 0], dir: [1, 0, 0] });
  // Horse-head ridge finials
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.35, 0.3), RED, { bone: body, at: [s * 1.25, 4.4, 0] });
    b.part(new THREE.ConeGeometry(0.07, 0.22, 5), GOLD, { bone: body, at: [s * 1.25, 4.65, 0.1], dir: [s * 0.3, 1, 0.5] });
  }
  // Chimney with smoke puffs
  b.part(new THREE.BoxGeometry(0.3, 0.7, 0.3), "#7a3a2a", { bone: body, at: [-0.5, 4.3, -0.4] });
  for (let i = 0; i < 4; i++)
    b.part(new THREE.IcosahedronGeometry(0.12 + i * 0.05, 0), "#cfcfd6", { bone: body, at: [-0.5 + i * 0.1, 4.8 + i * 0.28, -0.4], flat: true });

  // Front door and steps
  b.part(new THREE.PlaneGeometry(0.7, 1.1), "#ffffff", { bone: body, at: [0, 2.2, D + 0.14], dir: [0, 0, 1], axis: "z", texture: door });
  b.part(new THREE.BoxGeometry(0.9, 0.12, 0.3), LOG, { bone: body, at: [0, 1.62, D + 0.3] });

  // Windows with shutters (front and sides)
  const winAt: [number, number, number, number][] = [[-0.55, 2.7, D + 0.14, 0], [0.55, 2.7, D + 0.14, 0], [W + 0.14, 2.6, 0.1, 1], [-W - 0.14, 2.6, 0.1, -1]];
  for (const [x, y, z, sd] of winAt) {
    const dir: [number, number, number] = sd === 0 ? [0, 0, 1] : [sd, 0, 0];
    glow(b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", { bone: body, at: [x, y, z], dir, axis: "z", texture: win }), 1.4);
    b.part(new THREE.BoxGeometry(sd === 0 ? 0.5 : 0.06, 0.5, sd === 0 ? 0.06 : 0.5), RED, { bone: body, at: [x, y, z - (sd === 0 ? 0.02 : 0)] });
    for (const t of [1, -1]) {
      const off: [number, number, number] = sd === 0 ? [x + t * 0.34, y, z + 0.03] : [x + sd * 0.03, y, z + t * 0.34];
      b.part(new THREE.PlaneGeometry(0.22, 0.46), "#ffffff", { bone: body, at: off, dir, axis: "z", texture: shutter });
    }
  }
  // Wall flowers
  for (let i = 0; i < 4; i++)
    b.part(new THREE.PlaneGeometry(0.16, 0.24), "#ffffff", { bone: body, at: [-0.9 + i * 0.6, 1.8, D + 0.13], dir: [0, 0, 1], axis: "z", texture: flower });

  // Porch lantern
  glow(b.part(new THREE.SphereGeometry(0.07, 6, 5), "#ffb347", { bone: body, at: [0.5, 2.9, D + 0.2] }), 1.6);

  // Skull fence around
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const x = Math.sin(a) * 2.3, z = Math.cos(a) * 2.0 - 0.1;
    if (z > 1.3 && Math.abs(x) < 0.8) continue;
    b.part(new THREE.CylinderGeometry(0.04, 0.05, 0.9, 6), LOG_D, { bone: hips, at: [x, 0.42, z] });
    b.part(new THREE.SphereGeometry(0.1, 6, 5), BONE, { bone: hips, at: [x, 0.98, z] });
    b.part(new THREE.BoxGeometry(0.1, 0.07, 0.08), BONE, { bone: hips, at: [x, 0.88, z + 0.03] });
    glow(b.part(new THREE.SphereGeometry(0.025, 4, 3), "#ff5a2a", { bone: hips, at: [x - 0.04, 1.0, z + 0.09] }), 1.5);
    glow(b.part(new THREE.SphereGeometry(0.025, 4, 3), "#ff5a2a", { bone: hips, at: [x + 0.04, 1.0, z + 0.09] }), 1.5);
  }
  void r; void frame; void catmull; void offset;
  return b.root;
}
```