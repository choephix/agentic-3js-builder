import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dutch Windmill",
  description: "Cozy Animal Crossing style Dutch windmill with a thatched cap, spinning sails, door, windows and a gallery.",
};

const BRICK = "#c9694a";
const CREAM = "#fff1d0";
const WOOD = "#8a5a35";
const DARK = "#4a2f1e";
const ROOF = "#4f7fa8";
const SAIL = "#f6e7c1";
const GLASS = "#ffd980";

export default function build() {
  const b = createBuilder({ name: "windmill" });
  const R = rng(5);
  const base = b.joint("base", { at: [0, 0, 0] });
  const cap = b.joint("cap", { parent: base, at: [0, 3.4, 0], dir: [0, 1, 0] });
  const hub = b.joint("hub", { parent: cap, at: [0, 3.2, 0.95], dir: [0, 0, 1], role: "hinge" });

  // paints
  const brickPaint = paint((p, n) => {
    const row = Math.floor(p.y / 0.12);
    const col = Math.floor((Math.atan2(p.x, p.z) * 1.1 + (row % 2) * 0.1) / 0.1);
    const seam = Math.abs(((p.y / 0.12) % 1)) < 0.08 || ((col * 7 + row) % 11 === 0 && false);
    const base = mix("#d9744f", "#b95a40", noise(p, 0.25, 3));
    const lit = mix(base, "#ffd2a0", 0.15 * smoothstep(0.3, 1, n.y));
    return seam ? mix(lit, "#f3d2b0", 0.6) : lit;
  });
  const grass = paint((p) => mix("#7ec850", "#9bdc62", noise(p, 0.6, 2)));
  const thatch = paint((p, n) => mix(ROOF, "#6f9cc4", 0.4 * smoothstep(0, 1, n.y) + 0.2 * noise(p, 0.12, 4)));

  // tower: tapered octagon
  b.lathe(
    [[0, 0], [1.75, 0], [1.75, 0.15], [1.55, 0.3], [0.95, 3.4], [0, 3.4]],
    { at: [0, 0, 0], segments: 8, bone: base, color: brickPaint },
  );
  // plinth / grass
  b.lathe([[0, 0], [2.6, 0], [2.6, 0.08], [0, 0.1]], { at: [0, 0, 0], segments: 16, bone: base, color: grass });
  // cream band
  b.lathe([[0, 0], [1.6, 0], [1.6, 0.12], [0, 0.12]], { at: [0, 0.75, 0], segments: 8, bone: base, color: CREAM, smoothing: 0 });
  b.lathe([[0.97, 0], [1.05, 0], [1.05, 0.12], [0.97, 0.12]], { at: [0, 3.3, 0], segments: 8, bone: base, color: CREAM });

  // gallery
  b.lathe([[0, 0], [1.5, 0], [1.5, 0.1], [0, 0.1]], { at: [0, 1.5, 0], segments: 8, bone: base, color: WOOD });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    b.rod([Math.sin(a) * 1.45, 1.6, Math.cos(a) * 1.45], [Math.sin(a) * 1.45, 2.05, Math.cos(a) * 1.45], 0.03, WOOD, { bone: base });
  }
  b.sweep(
    new Array(9).fill(0).map((_, i) => [Math.sin((i / 8) * Math.PI * 2) * 1.45, 2.05, Math.cos((i / 8) * Math.PI * 2) * 1.45]),
    0.035,
    { color: CREAM, bone: base },
  );

  // door
  const doorTex = svg(
    `<svg viewBox="0 0 40 60"><path d="M2 60V22Q2 2 20 2Q38 2 38 22V60Z" fill="#7a4a2a" stroke="#3b2414" stroke-width="3"/><path d="M20 4V60M2 30H38" stroke="#3b2414" stroke-width="2"/><circle cx="30" cy="36" r="2.5" fill="#ffd36a"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.7, 1.05), "#ffffff", { bone: base, at: [0, 0.6, 1.6], dir: [0, 0.12, 1], axis: "z", texture: doorTex });
  b.part(new THREE.BoxGeometry(0.9, 0.08, 0.3), CREAM, { bone: base, at: [0, 1.17, 1.6] });
  // steps
  b.part(new THREE.BoxGeometry(1, 0.1, 0.4), "#b9b3a6", { bone: base, at: [0, 0.05, 1.95] });

  // windows
  const winTex = svg(
    `<svg viewBox="0 0 40 50"><rect x="3" y="3" width="34" height="44" rx="14" fill="#ffd980" stroke="#fff1d0" stroke-width="5"/><path d="M20 3V47M3 25H37" stroke="#fff1d0" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const w = glow(
      b.part(new THREE.PlaneGeometry(0.45, 0.56), "#ffffff", {
        bone: base, at: [Math.sin(a) * 1.18, 2.4, Math.cos(a) * 1.18], dir: [Math.sin(a), 0.1, Math.cos(a)], axis: "z", texture: winTex,
      }),
      0.6,
    );
    void w;
  }
  const winTex2 = winTex;
  b.part(new THREE.PlaneGeometry(0.4, 0.5), "#ffffff", { bone: cap, at: [0, 0.35, 0.95], dir: [0, 0, 1], axis: "z", texture: winTex2 });

  // cap
  b.lathe([[0, 0], [1.2, 0], [1.2, 0.15], [1.0, 0.9], [0.5, 1.5], [0, 1.6]], { at: [0, 0.0, 0], segments: 8, bone: cap, color: thatch, smoothing: 0 });
  b.part(new THREE.SphereGeometry(0.1, 6, 4), "#ffd36a", { bone: cap, at: [0, 1.65, 0] });
  b.spike([0, 1.6, 0], [0, 1, 0], 0.4, 0.04, { color: DARK, bone: cap });

  // hub and axle
  b.part(new THREE.CylinderGeometry(0.22, 0.28, 0.5, 8), WOOD, { bone: hub, at: [0, 3.2 - 3.4 + 0.0, 0.95].map((v, i) => (i === 1 ? 0 : v)) as [number, number, number], dir: [0, 0, 1] });
  b.part(new THREE.ConeGeometry(0.2, 0.35, 8), "#e9c46a", { bone: hub, at: [0, 0, 1.3], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 1, 6), DARK, { bone: cap, at: [0, 3.2 - 3.4 + 0.0 + 0, 0.6], dir: [0, 0, 1] });

  // sails
  const sailLat = svg(
    `<svg viewBox="0 0 40 100"><rect x="2" y="2" width="36" height="96" fill="#f6e7c1" stroke="#8a5a35" stroke-width="3"/><path d="M2 22H38M2 42H38M2 62H38M2 82H38M20 2V98" stroke="#d8c08a" stroke-width="2"/></svg>`,
    { size: 128 },
  );
  for (let k = 0; k < 4; k++) {
    const ang = (k * Math.PI) / 2 + Math.PI / 6;
    const dx = Math.sin(ang);
    const dy = Math.cos(ang);
    const pt = (r: number, side = 0): [number, number, number] => [dx * r + dy * side, dy * r - dx * side, 1.15];
    const o = hub.at.clone();
    const P = (r: number, side = 0): [number, number, number] => {
      const q = pt(r, side);
      return [o.x + q[0], o.y + q[1], q[2] + 0.0];
    };
    b.rod(P(0.2), P(3.6), 0.06, WOOD, { bone: hub });
    b.rod(P(1.0, 0.0), P(1.0, 0.0), 0.01, WOOD, { bone: hub });
    const c = P(2.4, 0.35);
    b.part(new THREE.PlaneGeometry(0.7, 2.4), "#ffffff", {
      bone: hub, at: c, dir: [0, 0, 1], axis: "z", up: [dx, dy, 0], texture: sailLat,
    });
    const c2 = P(2.4, 0.35);
    b.part(new THREE.PlaneGeometry(0.7, 2.4), "#ffffff", {
      bone: hub, at: [c2[0], c2[1], c2[2] - 0.02], dir: [0, 0, -1], axis: "z", up: [dx, dy, 0], texture: sailLat,
    });
    b.rod(P(1.2, 0.72), P(3.6, 0.72), 0.04, WOOD, { bone: hub });
    for (let j = 0; j < 4; j++) b.rod(P(1.2 + j * 0.8, 0), P(1.2 + j * 0.8, 0.72), 0.03, WOOD, { bone: hub });
  }

  // flower pots and tulips
  const tul = ["#ff7a9a", "#ffd23f", "#ff8a3d"];
  for (let i = 0; i < 12; i++) {
    const a = R() * Math.PI * 2;
    const r = 2.0 + R() * 0.5;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    b.rod([x, 0.05, z], [x, 0.3, z], 0.015, "#4f9a3a", { bone: base });
    b.part(new THREE.SphereGeometry(0.07, 6, 4), tul[i % 3], { bone: base, at: [x, 0.33, z] });
  }
  // sack of flour
  b.part(new THREE.SphereGeometry(0.28, 7, 5), CREAM, { bone: base, at: [1.0, 0.25, 2.1], scale: [1, 1.1, 1] });
  b.part(new THREE.CylinderGeometry(0.08, 0.1, 0.1, 6), DARK, { bone: base, at: [1.0, 0.55, 2.1] });

  return b.root;
}
