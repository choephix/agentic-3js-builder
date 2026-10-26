import * as THREE from "three";
import { createBuilder, rng, paint, noise, smoothstep, mix, svg, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dutch Windmill",
  description: "Cozy Animal Crossing style Dutch windmill with brick base, thatched cap and spinning sails.",
};

export default function build() {
  const b = createBuilder({ name: "windmill" });
  const R = rng(5);

  const BRICK = "#c8644a", CREAM = "#f6ead0", WOOD = "#8a5a3a", DARK = "#5a3a28", ROOF = "#4f7fb0", GLASS = "#ffd978", STONE = "#b9b3a6", GRASS = "#7cc06a", RED = "#d9514a";

  const base = b.joint("base", { at: [0, 0, 0] });
  const cap = b.joint("cap", { parent: base, at: [0, 3.4, 0], dir: [0, 1, 0] });
  const hub = b.joint("hub", { parent: cap, at: [0, 3.5, 0.75], dir: [0, 0, 1] });

  // paints
  const brickPaint = paint((p, n) => {
    const row = Math.floor(p.y / 0.12);
    const off = row % 2 ? 0.1 : 0;
    const ang = Math.atan2(p.x, p.z);
    const u = ang * 0.9 + off;
    const lines = Math.abs(((p.y / 0.12) % 1) - 0.5) > 0.44 || Math.abs(((u / 0.2) % 1) - 0.5) > 0.46;
    const base = mix(BRICK, "#e08a62", noise(p, 0.15, 3));
    const c = lines ? mix(base, CREAM, 0.6) : base;
    const shade = 0.8 + 0.2 * smoothstep(-0.5, 0.8, n.y);
    return [c[0] * shade, c[1] * shade, c[2] * shade];
  });
  const thatch = paint((p, n) => {
    const c = mix(ROOF, "#7aa6d0", noise(p, 0.3, 2));
    const band = Math.abs(((p.y / 0.18) % 1) - 0.5) > 0.42 ? 0.8 : 1;
    return [c[0] * band, c[1] * band, c[2] * band];
  });
  const grass = paint((p) => mix(GRASS, "#93d27c", noise(p, 0.5, 4)));

  // ground pad (small footprint)
  b.lathe([[0, 0], [2.4, 0], [2.3, -0.02], [0, -0.02]], { at: [0, 0, 0], bone: base, color: grass });
  b.lathe([[0, 0], [2.4, 0], [2.4, 0.08], [2.2, 0.12], [0, 0.12]], { at: [0, 0, 0], bone: base, color: grass, segments: 14 });

  // tower: tapered brick octagon
  b.lathe([[0, 0], [1.7, 0], [1.7, 0.25], [1.5, 0.3], [1.0, 3.4], [0, 3.4]], {
    at: [0, 0, 0], bone: base, segments: 8, color: brickPaint, spin: 22.5,
  });
  // stone plinth
  b.lathe([[0, 0.02], [1.85, 0.02], [1.85, 0.3], [0, 0.3]], { at: [0, 0, 0], bone: base, segments: 8, color: STONE, spin: 22.5 });
  // balcony ring
  b.lathe([[0, 0], [1.5, 0], [1.5, 0.08], [0, 0.08]], { at: [0, 1.4, 0], bone: base, segments: 8, color: WOOD, spin: 22.5 });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.06, 0.3, 0.06), DARK, { bone: base, at: [Math.sin(a) * 1.46, 1.58, Math.cos(a) * 1.46] });
  }
  b.part(new THREE.TorusGeometry(1.46, 0.035, 4, 16), DARK, { bone: base, at: [0, 1.74, 0], rotation: [90, 0, 0] });

  // door
  const doorTex = svg(`<svg viewBox="0 0 40 60"><path d="M2 60V22Q2 2 20 2Q38 2 38 22V60Z" fill="#7a4a2a" stroke="#4a2a18" stroke-width="3"/><path d="M20 4V60M2 30H38" stroke="#4a2a18" stroke-width="2"/><circle cx="30" cy="36" r="2.5" fill="#f5c542"/></svg>`, { size: 128 });
  b.part(new THREE.PlaneGeometry(0.7, 1.05), "#ffffff", { bone: base, at: [0, 0.82, 1.62], dir: [0, 0.12, 1], axis: "z", texture: doorTex });
  b.part(new THREE.BoxGeometry(1.0, 0.1, 0.2), STONE, { bone: base, at: [0, 0.35, 1.72] });
  b.part(new THREE.BoxGeometry(0.8, 0.06, 0.5), STONE, { bone: base, at: [0, 0.32, 1.9] });

  // windows
  const winTex = svg(`<svg viewBox="0 0 40 50"><path d="M3 50V18Q3 3 20 3Q37 3 37 18V50Z" fill="#ffe08a" stroke="#f6ead0" stroke-width="5"/><path d="M20 3V50M3 28H37" stroke="#f6ead0" stroke-width="3"/></svg>`, { size: 128 });
  for (const [y, rr, a] of [[2.2, 1.28, 0], [2.2, 1.28, Math.PI * 0.5], [2.2, 1.28, -Math.PI * 0.5], [2.9, 1.1, 0]] as const) {
    const d: [number, number, number] = [Math.sin(a), 0.07, Math.cos(a)];
    const w = glow(b.part(new THREE.PlaneGeometry(0.42, 0.52), "#ffffff", { bone: base, at: [Math.sin(a) * rr, y, Math.cos(a) * rr], dir: d, axis: "z", texture: winTex }), 0.6);
    b.part(new THREE.BoxGeometry(0.55, 0.07, 0.14), CREAM, { bone: base, at: [Math.sin(a) * (rr + 0.04), y - 0.3, Math.cos(a) * (rr + 0.04)], rotation: [0, (a * 180) / Math.PI, 0] });
    void w;
  }
  // flower boxes
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.5, 0.12, 0.16), WOOD, { bone: base, at: [s * 1.3, 1.9, 0], rotation: [0, 90, 0] });
    for (let i = 0; i < 4; i++) b.part(new THREE.IcosahedronGeometry(0.07, 0), i % 2 ? "#ff8fb0" : "#ffd23f", { bone: base, at: [s * 1.3, 2.0, -0.17 + i * 0.11] });
  }

  // cap
  b.lathe([[0, 0], [1.15, 0], [1.2, 0.1], [1.05, 0.55], [0.5, 1.1], [0.12, 1.5], [0, 1.55]], {
    at: [0, 0, 0], bone: cap, segments: 8, color: thatch, spin: 22.5,
  });
  b.part(new THREE.ConeGeometry(0.1, 0.35, 6), RED, { bone: cap, at: [0, 1.75, 0] });
  b.part(new THREE.SphereGeometry(0.1, 6, 4), "#f5c542", { bone: cap, at: [0, 1.98, 0] });
  // rim trim
  b.part(new THREE.TorusGeometry(1.17, 0.05, 4, 8), CREAM, { bone: cap, at: [0, 0.08, 0], rotation: [90, 22.5, 0] });
  // hub axle housing
  b.part(new THREE.CylinderGeometry(0.28, 0.34, 0.7, 8), WOOD, { bone: cap, at: [0, 0.8, 0.9], rotation: [90, 0, 0] });

  // hub
  b.part(new THREE.CylinderGeometry(0.22, 0.26, 0.4, 8), RED, { bone: hub, at: [0, 3.5, 1.15], rotation: [90, 0, 0] });
  b.part(new THREE.ConeGeometry(0.2, 0.3, 8), "#f5c542", { bone: hub, at: [0, 3.5, 1.5], rotation: [90, 0, 0] });

  // sails
  const lattice = svg(`<svg viewBox="0 0 40 100"><rect x="2" y="2" width="36" height="96" fill="#f6ead0" stroke="#8a5a3a" stroke-width="3"/><path d="M2 26H38M2 50H38M2 74H38M20 2V98" stroke="#8a5a3a" stroke-width="2.5"/></svg>`, { size: 128 });
  for (let k = 0; k < 4; k++) {
    const ang = (k * Math.PI) / 2 + Math.PI / 4;
    const dx = Math.cos(ang), dy = Math.sin(ang);
    const c: [number, number, number] = [0, 3.5, 1.35];
    // arm
    b.rod([dx * 0.2, 3.5 + dy * 0.2, 1.3], [dx * 3.9, 3.5 + dy * 3.9, 1.3], 0.07, { bone: hub, color: WOOD });
    // sail frame (card)
    const ox = -dy, oy = dx; // perpendicular
    const mx = dx * 2.5 + ox * 0.45, my = 3.5 + dy * 2.5 + oy * 0.45;
    b.part(new THREE.PlaneGeometry(0.8, 2.6), "#ffffff", {
      bone: hub, at: [mx, my, 1.32], texture: lattice, rotation: [0, 0, (ang * 180) / Math.PI - 90],
    });
    b.part(new THREE.PlaneGeometry(0.8, 2.6), "#ffffff", {
      bone: hub, at: [mx, my, 1.28], texture: lattice, rotation: [0, 180, -((ang * 180) / Math.PI - 90)],
    });
    b.part(new THREE.BoxGeometry(0.07, 0.07, 0.07), DARK, { bone: hub, at: [dx * 3.9, 3.5 + dy * 3.9, 1.3] });
    void c;
  }

  // tail pole + sill
  b.rod([0, 3.3, -0.9], [0, 0.4, -2.0], 0.05, { bone: cap, color: WOOD });

  // decor: lantern, barrels, tulips
  for (let i = 0; i < 2; i++) b.part(new THREE.CylinderGeometry(0.22, 0.2, 0.4, 8), WOOD, { bone: base, at: [-1.6 + i * 0.3, 0.32, 1.3 - i * 0.4] });
  glow(b.part(new THREE.BoxGeometry(0.16, 0.2, 0.16), GLASS, { bone: base, at: [0.7, 1.35, 1.75] }), 1.4);
  const tul = ["#ff6f91", "#ffd23f", "#ffffff", "#ff9a3c"];
  for (let i = 0; i < 14; i++) {
    const a = R() * Math.PI * 2, r = 1.9 + R() * 0.3;
    b.rod([Math.sin(a) * r, 0.1, Math.cos(a) * r], [Math.sin(a) * r, 0.38, Math.cos(a) * r], 0.015, { bone: base, color: "#4f9a4a" });
    b.part(new THREE.IcosahedronGeometry(0.075, 0), tul[i % 4], { bone: base, at: [Math.sin(a) * r, 0.42, Math.cos(a) * r] });
  }

  return b.root;
}
