import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, smoothstep, svg, catmull, offset } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Baba Yaga's Hut",
  description: "Folk-art log hut standing on two giant chicken legs, with carved shutters, a glowing window and a skull-lantern fence post.",
};

const LOG = "#8a5a32", LOG2 = "#6e4526", ROOF = "#5b6b3a", RED = "#b8322a", BLUE = "#2f5f9a";
const GOLD = "#e5b23c", SCALE = "#d9a441", CLAW = "#4a3a2a", CREAM = "#f3e4c0", BONE = "#e8e0c8";

export default function build() {
  const b = createBuilder({ name: "hut" });
  const R = rng(5);
  const root = b.joint("hips", { at: [0, 1.9, 0], role: "spine" });
  const wood = paint((p, n) => {
    const g = 0.5 + 0.5 * Math.sin(p.y * 38 + noise(p, 0.2, 2) * 3);
    return mix(mix(LOG2, LOG, g), "#a97a48", smoothstep(0.5, 1, n.y) * 0.4);
  });
  const roofP = paint((p, n) => mix(ROOF, "#7d9150", smoothstep(0.3, 0.8, noise(p, 0.15, 4)) * 0.8 + n.y * 0.1));
  const legSk = paint((p) => mix("#d9a441", "#a8742a", noise(p, 0.05, 7)));

  // legs
  const legJ: any[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = [[s * 0.55, 1.9, 0], [s * 0.6, 1.1, 0.05], [s * 0.6, 0.45, -0.2], [s * 0.6, 0.1, 0.2]];
    const ch = b.chain(`leg${side}`, catmull(pts), { parent: root, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" });
    b.sweep(ch, [0.1, 0.07], { color: legSk, sides: 6 });
    for (let i = 0; i < 6; i++) {
      const t = 0.12 + i * 0.14;
      b.part(new THREE.CylinderGeometry(0.115 - i * 0.008, 0.115 - i * 0.008, 0.025, 6), SCALE, { at: ch.at(t).at, dir: ch.at(t).tangent, bone: ch.at(t).bone });
    }
    // feet toes
    for (let k = 0; k < 3; k++) {
      const a = (k - 1) * 0.55;
      const tip: [number, number, number] = [s * 0.6 + Math.sin(a) * 0.5, 0.04, 0.2 + Math.cos(a) * 0.5];
      b.spike([s * 0.6, 0.09, 0.2], tip, null, 0.06, { color: SCALE, bone: ch.tip ?? ch.joints[2], sides: 6 });
      b.spike(tip, offset(tip, [Math.sin(a), -0.2, Math.cos(a)], 0.12), null, 0.035, { color: CLAW, bone: ch.tip ?? ch.joints[2], sides: 6 });
    }
    b.spike([s * 0.6, 0.1, 0.2], [s * 0.6, 0.06, -0.25], null, 0.05, { color: SCALE, bone: ch.tip ?? ch.joints[2], sides: 6 });
  }

  // floor platform & body
  b.part(new THREE.BoxGeometry(1.7, 0.14, 1.7), LOG2, { at: [0, 1.95, 0], bone: root });
  b.part(new THREE.BoxGeometry(1.5, 1.1, 1.5), wood, { at: [0, 2.57, 0], bone: root });
  // log ends on corners
  for (let i = 0; i < 6; i++)
    for (const sx of [1, -1]) for (const sz of [1, -1])
      b.part(new THREE.CylinderGeometry(0.09, 0.09, 1.72, 8), i % 2 ? LOG : LOG2, { at: [sx * 0.0, 2.1 + i * 0.18, sz * 0.78], rotation: [0, 0, 90], bone: root });
  for (let i = 0; i < 6; i++)
    for (const sx of [1, -1])
      b.part(new THREE.CylinderGeometry(0.09, 0.09, 1.72, 8), i % 2 ? LOG2 : LOG, { at: [sx * 0.78, 2.19 + i * 0.18, 0], rotation: [90, 0, 0], bone: root });

  // roof: two slopes + gable
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 1.2, 2.1), roofP, { at: [s * 0.62, 3.45, 0], rotation: [0, 0, -s * 40], bone: root });
  }
  b.extrude([[-0.8, 0], [0.8, 0], [0, 0.9, "sharp"]], { at: [0, 3.1, 0.76], x: [1, 0, 0], thickness: 0.08, color: LOG, bone: root });
  b.extrude([[-0.8, 0], [0.8, 0], [0, 0.9, "sharp"]], { at: [0, 3.1, -0.76], x: [1, 0, 0], thickness: 0.08, color: LOG, bone: root });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6), GOLD, { at: [0, 3.95, 0], rotation: [90, 0, 0], bone: root });
  // chimney
  b.part(new THREE.BoxGeometry(0.25, 0.7, 0.25), "#6d5d52", { at: [0.4, 3.9, -0.3], bone: root });
  b.part(new THREE.BoxGeometry(0.32, 0.08, 0.32), "#4d4038", { at: [0.4, 4.28, -0.3], bone: root });

  // window w/ shutters
  const winTex = svg(`<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#ffcf5a"/><path d="M32 0V64M0 32H64" stroke="#5a3a1c" stroke-width="5"/><rect width="64" height="64" fill="none" stroke="#5a3a1c" stroke-width="6"/></svg>`);
  glow(b.part(new THREE.PlaneGeometry(0.42, 0.42), "#ffffff", { at: [0.0, 2.7, 0.77], dir: [0, 0, 1], axis: "z", texture: winTex, bone: root }), 1.4);
  const folk = svg(`<svg viewBox="0 0 40 80"><rect width="40" height="80" fill="${BLUE}" stroke="#1b2f55" stroke-width="3"/><path d="M20 12 Q8 24 20 36 Q32 24 20 12Z M20 44 Q8 56 20 68 Q32 56 20 44Z" fill="${RED}" stroke="${CREAM}" stroke-width="2"/><circle cx="20" cy="24" r="3" fill="${GOLD}"/><circle cx="20" cy="56" r="3" fill="${GOLD}"/></svg>`);
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.2, 0.42), "#ffffff", { at: [s * 0.33, 2.7, 0.775], dir: [0, 0, 1], axis: "z", texture: folk, bone: root });
    b.part(new THREE.BoxGeometry(0.62, 0.06, 0.08), RED, { at: [s * 0.0 + 0, 2.95, 0.8], bone: root });
  }
  // door on side with steps
  b.part(new THREE.BoxGeometry(0.06, 0.8, 0.5), "#7a2a22", { at: [0.77, 2.55, 0.1], bone: root });
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), GOLD, { at: [0.81, 2.55, 0.28], bone: root }), 1);
  for (let i = 0; i < 3; i++) b.part(new THREE.BoxGeometry(0.4 - i * 0.05, 0.06, 0.5), LOG, { at: [1.0 + i * 0.12, 2.0 - i * 0.0 + 0.0, 0.1], bone: root });

  // carved trim: band under roof
  const trim = svg(`<svg viewBox="0 0 80 16"><rect width="80" height="16" fill="${RED}"/><path d="M0 16L10 2L20 16L30 2L40 16L50 2L60 16L70 2L80 16" fill="none" stroke="${CREAM}" stroke-width="3"/><circle cx="10" cy="11" r="2" fill="${GOLD}"/><circle cx="30" cy="11" r="2" fill="${GOLD}"/><circle cx="50" cy="11" r="2" fill="${GOLD}"/><circle cx="70" cy="11" r="2" fill="${GOLD}"/></svg>`);
  b.part(new THREE.PlaneGeometry(1.6, 0.16), "#ffffff", { at: [0, 3.05, 0.775], dir: [0, 0, 1], axis: "z", texture: trim, bone: root });
  b.part(new THREE.PlaneGeometry(1.6, 0.16), "#ffffff", { at: [0, 3.05, -0.775], dir: [0, 0, -1], axis: "z", texture: trim, bone: root });
  // sun emblem in gable
  const sun = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="12" fill="${GOLD}" stroke="#7a5a10" stroke-width="3"/>${[...Array(12)].map((_, i) => `<path d="M32 4L36 16H28Z" fill="${GOLD}" transform="rotate(${i * 30} 32 32)"/>`).join("")}</svg>`);
  b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { at: [0, 3.4, 0.8], dir: [0, 0, 1], axis: "z", texture: sun, bone: root });

  // roof cross-ridge ornaments (horse heads as spikes)
  for (const s of [1, -1]) {
    b.spike([0, 3.95, s * 1.05], [0, 4.35, s * 1.2], null, 0.06, { color: RED, bone: root, sides: 6 });
    b.part(new THREE.SphereGeometry(0.07, 6, 4), GOLD, { at: [0, 4.38, s * 1.22], bone: root });
  }

  // fence with skulls
  for (let i = 0; i < 7; i++) {
    const x = -1.5 + i * 0.5, z = 1.5;
    b.spike([x, 0, z], [x, 1.0 + R() * 0.15, z], null, 0.045, { color: LOG2, bone: root, sides: 6 });
    if (i % 2 === 0) {
      const sk = b.part(new THREE.SphereGeometry(0.1, 7, 5), BONE, { at: [x, 1.1, z], bone: root });
      glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), "#ff7a22", { at: [x - 0.04, 1.12, z + 0.08], bone: root }), 1.6);
      glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), "#ff7a22", { at: [x + 0.04, 1.12, z + 0.08], bone: root }), 1.6);
      b.part(new THREE.BoxGeometry(0.08, 0.05, 0.07), BONE, { at: [x, 1.03, z + 0.03], bone: root });
    }
  }
  b.rod([-1.5, 0.6, 1.5], [1.5, 0.6, 1.5], 0.025, LOG2, { bone: root });
  return b.root;
}
