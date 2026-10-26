```ts
import * as THREE from "three";
import { createBuilder, rng, paint, noise, smoothstep, mix, svg, catmull, bezier, aim } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Baba Yaga's Hut",
  description: "Folk-art log hut standing on giant chicken legs, with carved shutters, a glowing window and painted trim.",
};

const WOOD = "#8a5a32", WOOD2 = "#6e4424", ROOF = "#5a3a22", RED = "#b8262a", BLUE = "#2f5fa8";
const GOLD = "#e8b83a", CREAM = "#f3e3b8", SCALE = "#d9a43a", CLAW = "#3a2a1a", GREEN = "#3f7a3a";

const logPaint = paint((p, n) => {
  const g = noise(p, 0.05, 3);
  const base = mix(WOOD, WOOD2, g);
  return mix(base, "#c4905a", 0.25 * smoothstep(0.5, 1, n.y));
});
const roofPaint = paint((p) => mix(ROOF, "#7a5232", noise(p, 0.06, 5)));
const legPaint = paint((p, n) => {
  const band = Math.floor(p.y / 0.07) % 2 ? 0.2 : 0;
  return mix("#e0a838", "#b87a22", band + 0.2 * (1 - smoothstep(-0.5, 0.8, n.y)));
});

const folkBand = svg(
  `<svg viewBox="0 0 128 32"><rect width="128" height="32" fill="#b8262a"/>
  <g fill="#f3e3b8">${[0, 1, 2, 3].map((i) => `<path d="M${i * 32 + 16} 4 L${i * 32 + 28} 16 L${i * 32 + 16} 28 L${i * 32 + 4} 16Z"/>`).join("")}</g>
  <g fill="#2f5fa8">${[0, 1, 2, 3].map((i) => `<circle cx="${i * 32 + 16}" cy="16" r="4"/>`).join("")}</g></svg>`,
  { size: 256 },
);
const window_ = svg(
  `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#ffb33a"/>
  <path d="M32 0V64M0 32H64" stroke="#5a2a10" stroke-width="5"/>
  <rect width="64" height="64" fill="none" stroke="#5a2a10" stroke-width="6"/></svg>`,
  { size: 128 },
);
const shutter = svg(
  `<svg viewBox="0 0 32 64"><rect width="32" height="64" fill="#2f5fa8"/>
  <path d="M16 8 Q26 20 16 32 Q6 20 16 8Z" fill="#f3e3b8"/><circle cx="16" cy="46" r="7" fill="#b8262a"/>
  <circle cx="16" cy="46" r="3" fill="#e8b83a"/><path d="M2 58H30" stroke="#f3e3b8" stroke-width="3"/></svg>`,
  { size: 128 },
);
const skull = svg(
  `<svg viewBox="0 0 32 32"><ellipse cx="16" cy="14" rx="12" ry="12" fill="#efe6cf"/><rect x="9" y="22" width="14" height="8" fill="#efe6cf"/>
  <circle cx="10.5" cy="14" r="4" fill="#1a1010"/><circle cx="21.5" cy="14" r="4" fill="#1a1010"/><path d="M16 19l-2 4h4z" fill="#1a1010"/></svg>`,
  { size: 64 },
);

function legTo(b: any, side: number, hipJ: any, z: number) {
  const s = side;
  const hip: [number, number, number] = [s * 0.55, 1.9, z];
  const knee: [number, number, number] = [s * 0.75, 1.15, z + 0.25];
  const ankle: [number, number, number] = [s * 0.75, 0.2, z + 0.1];
  const nm = s > 0 ? "L" : "R";
  const ch = b.chain("leg" + nm, catmull([hip, knee, ankle]), { parent: hipJ, names: ["hip" + nm, "knee" + nm, "ankle" + nm], role: "leg" });
  b.sweep(ch, [0.16, 0.1], { color: legPaint, sides: 8 });
  b.part(new THREE.SphereGeometry(0.19, 8, 6), SCALE, { at: hip, bone: ch.joints[0] });
  // feet
  const toes = [-0.35, 0, 0.35];
  toes.forEach((a, i) => {
    const end: [number, number, number] = [ankle[0] + Math.sin(a) * 0.65, 0.07, ankle[2] + Math.cos(a) * 0.65];
    b.rod([ankle[0], 0.1, ankle[2]], end, [0.075, 0.05], legPaint, { bone: ch.tip ?? ch.joints[2] });
    b.spike(end, [Math.sin(a), -0.15, Math.cos(a)], 0.2, 0.06, { color: CLAW, bone: ch.tip ?? ch.joints[2] });
  });
  const back: [number, number, number] = [ankle[0], 0.08, ankle[2] - 0.5];
  b.rod([ankle[0], 0.1, ankle[2]], back, [0.07, 0.05], legPaint, { bone: ch.tip ?? ch.joints[2] });
  b.spike(back, [0, -0.1, -1], 0.18, 0.05, { color: CLAW, bone: ch.tip ?? ch.joints[2] });
  // feather spur
  b.spike([s * 0.8, 0.9, z - 0.05], [s * 0.4, -0.4, -1], 0.4, 0.07, { color: "#c98a2a", bone: ch.joints[1] });
}

export default function build() {
  const b = createBuilder({ name: "hut" });
  const R = rng(11);
  const root = b.joint("hut", { at: [0, 1.9, 0] });
  const body = b.joint("body", { parent: root, at: [0, 2.0, 0], dir: [0, 1, 0] });
  legTo(b, 1, root, 0.1);
  legTo(b, -1, root, 0.1);

  // floor platform
  b.part(new THREE.BoxGeometry(2.3, 0.14, 2.5), WOOD2, { at: [0, 1.95, 0], bone: body });
  // logs for walls
  const W = 1.0, D = 1.1;
  for (let i = 0; i < 7; i++) {
    const y = 2.17 + i * 0.22;
    const bone = body;
    for (const s of [1, -1]) {
      b.rod([s * W, y, -D - 0.12], [s * W, y, D + 0.12], 0.115, logPaint, { bone, sides: 8 });
    }
    b.rod([-W - 0.14, y + 0.0, -D], [W + 0.14, y, -D], 0.115, logPaint, { bone, sides: 8 });
    b.rod([-W - 0.14, y, D], [W + 0.14, y, D], 0.115, logPaint, { bone, sides: 8 });
  }
  // gable
  const gable = (z: number) =>
    b.extrude([[-1.0, 0], [1.0, 0], [0, 1.0]], { at: [0, 3.72, z], x: [1, 0, 0], thickness: 0.18, color: logPaint, bone: body });
  gable(D);
  gable(-D);
  // roof
  for (const s of [1, -1]) {
    b.frustumBox([s * 0.05, 4.85, 0], [s * 1.35, 3.75, 0], [0, 0], [0, 0], { bone: body, color: roofPaint });
    b.part(new THREE.BoxGeometry(1.75, 0.1, 2.9), roofPaint, {
      at: [s * 0.68, 4.3, 0], rotation: [0, 0, s * 38 * -1], bone: body,
    });
    // painted trim
    b.part(new THREE.BoxGeometry(0.16, 0.14, 3.0), RED, { at: [s * 1.5, 3.75, 0], bone: body });
  }
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 3.1, 8), GOLD, { at: [0, 4.88, 0], rotation: [90, 0, 0], bone: body });
  // roof tiles scallops
  for (let i = 0; i < 6; i++)
    for (const s of [1, -1]) {
      b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 8), mix(ROOF, "#8a5a38", i % 2 ? 0.4 : 0.1) as any && (i % 2 ? "#7a5232" : "#4a2e1a"), {
        at: [s * (0.3 + (i % 3) * 0.35), 4.55 - (i % 3) * 0.28, -1.2 + i * 0.5], rotation: [90, 0, s * 38 * -1], bone: body,
      });
    }
  // front folk band
  b.part(new THREE.PlaneGeometry(1.9, 0.48), "#ffffff", { at: [0, 3.72, D + 0.2], dir: [0, 0, 1], axis: "z", texture: folkBand, bone: body });
  // gable ornament: sun
  b.part(new THREE.CircleGeometry(0.28, 12), GOLD, { at: [0, 4.2, D + 0.12], dir: [0, 0, 1], axis: "z", bone: body });
  b.part(new THREE.CircleGeometry(0.14, 10), RED, { at: [0, 4.2, D + 0.125], dir: [0, 0, 1], axis: "z", bone: body });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.spike([Math.cos(a) * 0.28, 4.2 + Math.sin(a) * 0.28, D + 0.13], [Math.cos(a), Math.sin(a), 0.1], 0.14, 0.05, { color: GOLD, bone: body });
  }
  // door
  b.part(new THREE.BoxGeometry(0.7, 1.2, 0.08), BLUE, { at: [0, 2.82, D + 0.14], bone: body });
  b.part(new THREE.CircleGeometry(0.35, 10, 0, Math.PI), BLUE, { at: [0, 3.42, D + 0.14], dir: [0, 0, 1], axis: "z", bone: body });
  b.part(new THREE.SphereGeometry(0.05, 6, 4), GOLD, { at: [0.22, 2.8, D + 0.2], bone: body });
  b.part(new THREE.BoxGeometry(0.1, 1.1, 0.04), CREAM, { at: [0, 2.82, D + 0.19], bone: body });
  // steps
  b.part(new THREE.BoxGeometry(0.9, 0.12, 0.35), WOOD2, { at: [0, 2.0, D + 0.4], bone: body });
  // windows with shutters
  for (const s of [1, -1]) {
    glow(b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { at: [s * 0.72, 3.1, D + 0.14], dir: [0, 0, 1], axis: "z", texture: window_, bone: body }), 1.4);
    b.part(new THREE.PlaneGeometry(0.28, 0.56), "#ffffff", { at: [s * 1.05, 3.1, D + 0.16], dir: [0, 0, 1], axis: "z", texture: shutter, bone: body });
    glow(b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { at: [s * (W + 0.15), 3.1, 0], dir: [s, 0, 0], axis: "z", texture: window_, bone: body }), 1.4);
    // side shutters
    b.part(new THREE.PlaneGeometry(0.28, 0.56), "#ffffff", { at: [s * (W + 0.16), 3.1, 0.4], dir: [s, 0, 0], axis: "z", texture: shutter, bone: body });
    b.part(new THREE.PlaneGeometry(0.28, 0.56), "#ffffff", { at: [s * (W + 0.16), 3.1, -0.4], dir: [s, 0, 0], axis: "z", texture: shutter, bone: body });
  }
  // fence-skull lantern on front corners
  for (const s of [1, -1]) {
    b.rod([s * 1.25, 1.95, D + 0.7], [s * 1.25, 2.9, D + 0.7], 0.05, WOOD2, { bone: body });
    glow(b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", { at: [s * 1.25, 3.05, D + 0.72], dir: [0, 0, 1], axis: "z", texture: skull, bone: body }), 1.2);
    glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), "#7dff7a", { at: [s * 1.25, 3.05, D + 0.68], bone: body }), 2);
  }
  // chimney with smoke
  b.part(new THREE.BoxGeometry(0.3, 0.6, 0.3), "#8a3a2a", { at: [0.6, 4.55, -0.5], bone: body });
  b.part(new THREE.BoxGeometry(0.38, 0.08, 0.38), CREAM, { at: [0.6, 4.88, -0.5], bone: body });
  const smoke = catmull([[0.6, 4.95, -0.5], [0.75, 5.3, -0.5], [0.5, 5.65, -0.55], [0.7, 6.0, -0.6]]);
  b.sweep(smoke, [0.08, 0.2], { color: "#cfcac4", sides: 6, bone: body });
  // green moss on roof
  for (let i = 0; i < 6; i++)
    b.part(new THREE.SphereGeometry(0.12 + R() * 0.08, 6, 4), GREEN, {
      at: [(R() < 0.5 ? -1 : 1) * (0.5 + R() * 0.7), 4.1 - R() * 0.3, -1 + R() * 2], scale: [1, 0.4, 1], bone: body,
    });
  return b.root;
}
```