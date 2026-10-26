import * as THREE from "three";
import { createBuilder, rng, paint, noise, mix, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dutch Windmill",
  description: "Cozy Animal Crossing style Dutch windmill with a tapered brick tower, thatched cap and spinning sails.",
};

const BRICK = "#c9694a", BRICK2 = "#b5573d", WHITE = "#f6efe0", WOOD = "#8a5a36", DWOOD = "#5e3b22";
const ROOF = "#4f7fa3", ROOF2 = "#3f6a8c", STONE = "#a9a398", GOLD = "#f5c542", GREEN = "#5fae5a", RED = "#d9453f";

export default function build() {
  const b = createBuilder({ name: "windmill" });
  const R = rng(5);
  const base = b.joint("base", { at: [0, 0, 0] });
  const cap = b.joint("cap", { parent: base, at: [0, 3.6, 0], dir: [0, 1, 0] });
  const hub = b.joint("hub", { parent: cap, at: [0, 3.5, 0.95], dir: [0, 0, 1], role: "hinge" });

  const brickPaint = paint((p, n) => {
    const row = Math.floor(p.y / 0.12);
    const off = row % 2 ? 0.07 : 0;
    const ang = Math.atan2(p.x, p.z) * Math.hypot(p.x, p.z);
    const u = ((ang + off) / 0.14) % 1;
    const v = (p.y / 0.12) % 1;
    const mortar = Math.abs(u) < 0.07 || v < 0.1;
    const base = noise(p, 0.3, 2) > 0.55 ? BRICK2 : BRICK;
    const c = mortar ? mix("#e8d9c0", base, 0.3) : mix(base, "#ffb890", 0.15 * smoothstep(0.3, 1, n.y));
    return mix(c, "#6b3a3a", 0.25 * smoothstep(0.7, 0, p.y));
  });
  const thatch = paint((p) => mix(ROOF, ROOF2, noise(p, 0.15, 4)));

  // stone foundation
  b.part(new THREE.CylinderGeometry(1.55, 1.7, 0.35, 10), STONE, { bone: base, at: [0, 0.17, 0], flat: true });
  // tower: tapered octagon
  b.part(new THREE.CylinderGeometry(1.0, 1.5, 3.4, 12), brickPaint, { bone: base, at: [0, 2.05, 0] });
  // white band & gallery
  b.part(new THREE.CylinderGeometry(1.28, 1.28, 0.1, 12), WHITE, { bone: base, at: [0, 1.5, 0] });
  b.part(new THREE.CylinderGeometry(1.2, 1.2, 0.1, 12), WHITE, { bone: base, at: [0, 3.78, 0] });
  b.part(new THREE.TorusGeometry(1.15, 0.04, 5, 16), WHITE, { bone: base, at: [0, 4.0, 0], rotation: [90, 0, 0] });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.05, 0.25, 0.05), WHITE, { bone: base, at: [Math.sin(a) * 1.15, 3.9, Math.cos(a) * 1.15] });
  }

  // door
  const doorTex = svg(`<svg viewBox="0 0 40 60"><path d="M2 60V22Q2 2 20 2Q38 2 38 22V60Z" fill="#6d4426" stroke="#3b2413" stroke-width="3"/><path d="M20 4V60M2 30H38M2 44H38" stroke="#3b2413" stroke-width="2"/><circle cx="30" cy="34" r="2.5" fill="#f5c542"/></svg>`);
  b.part(new THREE.PlaneGeometry(0.62, 0.95), "#ffffff", { bone: base, at: [0, 0.82, 1.4], dir: [0, 0.1, 1], axis: "z", texture: doorTex });
  b.part(new THREE.BoxGeometry(0.85, 0.08, 0.2), WHITE, { bone: base, at: [0, 1.35, 1.38] });
  b.part(new THREE.BoxGeometry(0.9, 0.06, 0.4), STONE, { bone: base, at: [0, 0.38, 1.7] });

  // windows
  const winTex = svg(`<svg viewBox="0 0 40 50"><rect x="2" y="2" width="36" height="46" rx="14" fill="#ffe9a0" stroke="#f6efe0" stroke-width="4"/><path d="M20 2V48M2 26H38" stroke="#f6efe0" stroke-width="3"/></svg>`);
  const wins: [number, number][] = [[2.4, 0], [3.1, 180], [2.4, 90], [2.4, -90]];
  for (const [y, deg] of wins) {
    const a = (deg * Math.PI) / 180;
    const r = 1.2 - (y - 0.4) * 0.08;
    const d: [number, number, number] = [Math.sin(a), 0, Math.cos(a)];
    glow(b.part(new THREE.PlaneGeometry(0.4, 0.5), "#ffffff", { bone: base, at: [d[0] * r, y, d[2] * r], dir: d, axis: "z", texture: winTex }), 0.8);
    b.part(new THREE.BoxGeometry(0.5, 0.06, 0.12), WHITE, { bone: base, at: [d[0] * (r + 0.02), y - 0.28, d[2] * (r + 0.02)], dir: d, axis: "z" });
  }

  // cap
  b.part(new THREE.CylinderGeometry(1.05, 1.1, 0.25, 12), WHITE, { bone: cap, at: [0, 0.1, 0] });
  b.part(new THREE.ConeGeometry(1.35, 1.5, 12), thatch, { bone: cap, at: [0, 1.0, 0] });
  b.part(new THREE.SphereGeometry(0.18, 8, 6), GOLD, { bone: cap, at: [0, 1.85, 0] });
  b.part(new THREE.ConeGeometry(0.06, 0.4, 6), GOLD, { bone: cap, at: [0, 2.15, 0] });
  // eave ring shingles
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.28, 0.06, 0.1), ROOF2, { bone: cap, at: [Math.sin(a) * 1.2, 0.3, Math.cos(a) * 1.2], rotation: [0, (a * 180) / Math.PI, 0] });
  }
  // axle housing
  b.part(new THREE.CylinderGeometry(0.28, 0.34, 0.8, 8), WOOD, { bone: cap, at: [0, 0.7, 0.9], dir: [0, 0, 1], flat: true });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8), DWOOD, { bone: hub, at: [0, 0, 0.35], dir: [0, 0, 1] });
  b.part(new THREE.SphereGeometry(0.22, 8, 6), GOLD, { bone: hub, at: [0, 0, 0.6] });
  // tail
  b.part(new THREE.BoxGeometry(0.08, 0.08, 1.2), WOOD, { bone: cap, at: [0, 0.6, -1.5], rotation: [-15, 0, 0] });
  b.part(new THREE.BoxGeometry(0.5, 0.5, 0.05), RED, { bone: cap, at: [0, 0.35, -2.1] });

  // sails
  const cloth = svg(`<svg viewBox="0 0 30 100"><rect width="30" height="100" fill="#fbf4e2"/><path d="M0 20H30M0 40H30M0 60H30M0 80H30M15 0V100" stroke="#d7c9a8" stroke-width="2"/></svg>`);
  for (let k = 0; k < 4; k++) {
    const deg = k * 90 + 20;
    const arm = b.joint(`sail${k + 1}`, { parent: hub, at: hub.at, dir: [0, 1, 0], role: "arm" });
    b.pose(arm, { axis: [0, 0, 1], deg: -deg });
    const L = 3.1;
    b.rod(hub.at, offset3(hub.at, [0, 1, 0], L), 0.06, WOOD, { bone: arm, sides: 4 });
    for (let j = 0; j < 8; j++) {
      const y = 0.5 + j * 0.34;
      b.part(new THREE.BoxGeometry(0.5, 0.04, 0.05), DWOOD, { bone: arm, at: offset3(hub.at, [0, 1, 0], y).map((v, i) => (i === 0 ? v + 0.25 : v)) as [number, number, number] });
    }
    b.part(new THREE.PlaneGeometry(0.5, 2.7), "#ffffff", { bone: arm, at: [hub.at.x + 0.27, hub.at.y + 1.9, hub.at.z + 0.04], texture: cloth });
    b.part(new THREE.PlaneGeometry(0.5, 2.7), "#ffffff", { bone: arm, at: [hub.at.x + 0.27, hub.at.y + 1.9, hub.at.z + 0.03], rotation: [0, 180, 0], texture: cloth });
  }

  // flower boxes & tulips
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.5, 0.15, 0.2), WOOD, { bone: base, at: [s * 1.0, 0.3, 1.7] });
    for (let i = 0; i < 4; i++)
      b.part(new THREE.SphereGeometry(0.07, 6, 4), i % 2 ? "#ff8fb1" : "#ffd84a", { bone: base, at: [s * 1.0 - 0.18 + i * 0.12, 0.45, 1.72] });
    b.part(new THREE.BoxGeometry(0.5, 0.05, 0.2), GREEN, { bone: base, at: [s * 1.0, 0.39, 1.7] });
  }
  void R;
  return b.root;
}

function offset3(p: THREE.Vector3, d: [number, number, number], l: number): [number, number, number] {
  return [p.x + d[0] * l, p.y + d[1] * l, p.z + d[2] * l];
}
