import * as THREE from "three";
import { createBuilder, svg, paint, mix, noise, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Barnstormer Biplane",
  description: "Whimsical chubby red-and-cream barnstormer biplane with sunburst cowl, striped wings, struts, wire rigging, spinning propeller and a little pilot.",
};

const RED = "#d9382f", CREAM = "#fff0cf", YEL = "#ffc83d", TEAL = "#2ea7a0", DARK = "#3a2a2a", WOOD = "#b9783e", RUBBER = "#26242a", STEEL = "#b9c2cc";

type V3 = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "biplane", paintSize: 1024 });
  const body = b.joint("body", { at: [0, 1.0, 0], dir: [0, 0, 1], role: "spine" });
  const prop = b.joint("prop", { parent: body, at: [0, 1.0, 1.55], dir: [0, 0, 1], role: "hinge" });
  const rudder = b.joint("rudder", { parent: body, at: [0, 1.0, -2.3], dir: [0, 1, 0], role: "hinge" });
  const elevL = b.joint("elevatorL", { parent: body, at: [0.1, 1.0, -2.3], dir: [1, 0, 0], role: "hinge" });
  const elevR = b.joint("elevatorR", { parent: body, at: [-0.1, 1.0, -2.3], dir: [-1, 0, 0], role: "hinge" });

  const bodyPaint = paint((p, n) => {
    if (p.z > 1.0) return mix(RED, "#ffd86a", 0);
    if (Math.abs(p.y - 1.0 - 0.05) < 0.03 && n.y < 0.9) return YEL;
    const m = (1 - Math.min(1, Math.max(0, (p.y - 0.7) / 0.2))) * noise(p, 0.1, 3);
    return n.y < -0.2 ? mix(CREAM, "#8a6a4a", m * 0.6) : mix(p.z < -0.3 ? CREAM : RED, "#6b3b22", m * 0.4);
  });

  // fuselage
  b.loft([
    { at: [0, 1.0, 1.3], w: 0.7, h: 0.7 },
    { at: [0, 1.0, 0.7], w: 0.78, h: 0.82 },
    { at: [0, 1.02, -0.2], w: 0.66, h: 0.74 },
    { at: [0, 1.06, -1.3], w: 0.4, h: 0.45 },
    { at: [0, 1.12, -2.3], w: 0.12, h: 0.2 },
  ], { bone: body, sides: 12, color: bodyPaint, name: "fuselage" });

  // cowl ring and sunburst face
  b.lathe([[0.2, 0], [0.4, 0], [0.4, 0.12], [0.2, 0.12]], { at: [0, 1.0, 1.28], axis: [0, 0, 1], bone: body, color: YEL, segments: 14, name: "cowlRing" });
  const sun = svg(`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#d9382f"/>${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<path d="M50 50 L${50 + 48 * Math.cos(a - 0.17)} ${50 + 48 * Math.sin(a - 0.17)} L${50 + 48 * Math.cos(a + 0.17)} ${50 + 48 * Math.sin(a + 0.17)}Z" fill="#ffc83d"/>`; }).join("")}<circle cx="50" cy="50" r="14" fill="#fff0cf" stroke="#3a2a2a" stroke-width="4"/></svg>`, { size: 256 });
  b.part(new THREE.CircleGeometry(0.34, 16), "#ffffff", { bone: body, at: [0, 1.0, 1.42], dir: [0, 0, 1], axis: "z", texture: sun, name: "sunburst" });
  b.part(new THREE.SphereGeometry(0.1, 8, 6), YEL, { bone: prop, at: [0, 1.0, 1.5], scale: [1, 1, 1.3], name: "spinner" });
  for (let i = 0; i < 2; i++)
    b.extrude([[0, -0.07], [0.5, -0.1], [0.62, 0], [0.5, 0.1], [0, 0.07]], { at: [0, 1.0, 1.5], x: [Math.cos(i * Math.PI), Math.sin(i * Math.PI), 0], y: [0, 0, 1], thickness: 0.035, bevel: 0.01, color: i ? WOOD : WOOD, bone: prop, name: "blade" });
  // exhaust stacks
  for (const s of [1, -1]) b.rod([s * 0.34, 0.9, 1.0], [s * 0.4, 0.8, 0.6], 0.04, { bone: body, color: STEEL, name: "exhaust" });

  // cockpit
  b.lathe([[0, 0], [0.26, 0], [0.26, 0.1], [0.2, 0.1], [0.2, 0.02], [0, 0.02]], { at: [0, 1.36, 0.2], bone: body, color: DARK, segments: 12, name: "cockpitRim" });
  b.part(new THREE.SphereGeometry(0.14, 8, 6), "#f0b88a", { bone: body, at: [0, 1.5, 0.2], name: "pilotHead" });
  b.part(new THREE.SphereGeometry(0.15, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), TEAL, { bone: body, at: [0, 1.52, 0.2], name: "cap" });
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.2, 8), TEAL, { bone: body, at: [0, 1.36, 0.2], name: "pilotBody" });
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.05, 0.015, 5, 8), DARK, { bone: body, at: [s * 0.06, 1.53, 0.31], name: "goggle" });
    b.part(new THREE.BoxGeometry(0.2, 0.01, 0.18), "#ffffff", { bone: body, at: [-0.22 * s, 1.44, 0.0], rotation: [0, 0, s * 20], name: "scarf" });
  }
  b.part(new THREE.BoxGeometry(0.5, 0.03, 0.2), TEAL, { bone: body, at: [0, 1.6, 0.16], visible: false } as never);

  // wings
  const wingPaint = (top: boolean) => paint((p, n, s) => {
    if (Math.abs(n.y) < 0.5) return CREAM;
    const u = Math.abs(p.x);
    if (u > 1.75) return YEL;
    if (Math.floor(u / 0.3) % 2 === 0 && Math.abs(n.y) > 0.5) return top ? RED : CREAM;
    return top ? CREAM : "#f5dca8";
  });
  const wing = (y: number, z: number, span: number, name: string, stagger: number) => {
    for (const s of [1, -1])
      b.extrude([[0.0, 0.6], [span, 0.5], [span + 0.18, 0.2], [span, -0.35], [0, -0.45]], { at: [0, y, z + stagger], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.07, bevel: 0.025, smoothing: 1, color: wingPaint(y > 1.5), bone: body, name: `${name}${s > 0 ? "L" : "R"}` });
  };
  wing(1.85, 0.25, 2.1, "upper", 0.1);
  wing(0.9, 0.0, 1.9, "lower", 0);
  // roundels on top wing
  const rnd = svg(`<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="28" fill="#2ea7a0"/><circle cx="30" cy="30" r="19" fill="#fff0cf"/><circle cx="30" cy="30" r="10" fill="#d9382f"/></svg>`, { size: 128 });
  for (const s of [1, -1]) b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { bone: body, at: [s * 1.2, 1.89, 0.4], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: rnd, name: "roundel" });

  // struts and wires
  for (const s of [1, -1]) {
    for (const x of [0.9, 1.7]) {
      const lx = x - 0.05;
      b.rod([s * x, 0.93, 0.3], [s * lx, 1.82, 0.45], 0.04, { bone: body, color: WOOD, name: "strut" });
      b.rod([s * x, 0.93, -0.1], [s * lx, 1.82, 0.05], 0.04, { bone: body, color: WOOD, name: "strutB" });
    }
    b.rod([s * 0.9, 0.95, 0.3], [s * 1.7, 1.82, 0.45], 0.012, { bone: body, color: DARK, name: "wire" });
    b.rod([s * 1.7, 0.95, 0.3], [s * 0.9, 1.82, 0.45], 0.012, { bone: body, color: DARK, name: "wire" });
    b.rod([s * 0.3, 1.2, 0.6], [s * 0.6, 1.85, 0.4], 0.04, { bone: body, color: WOOD, name: "cabane" });
    b.rod([s * 0.3, 0.7, 0.4], [s * 0.95, 0.9, 0.2], 0.018, { bone: body, color: DARK, name: "lowerWire" });
  }

  // tail
  b.extrude([[0, 0], [0.5, 0.05], [0.6, 0.5], [0.4, 0.9], [0, 1.0], [-0.0, 0]].slice(0, 5), { at: [0, 1.05, -2.1], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.06, bevel: 0.02, smoothing: 1, color: RED, bone: rudder, name: "rudder" });

  for (const s of [1, -1])
    b.extrude([[0, 0.3], [0.9, 0.1], [0.95, -0.15], [0, -0.3]], { at: [0, 1.1, -2.1], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.06, bevel: 0.02, smoothing: 1, color: CREAM, bone: s > 0 ? elevL : elevR, name: "elevator" });
  b.rod([0.02, 0.98, -2.0], [0.0, 0.8, -2.0], 0.01, { bone: body, color: DARK, name: "tailSkidWire" });
  b.spike([0, 0.95, -2.0], [0, 0.78, -2.15], null, 0.03, { bone: body, color: DARK, name: "skid" });

  // landing gear
  for (const s of [1, -1]) {
    const wc: V3 = [s * 0.68, 0.36, 0.55];
    b.rod([s * 0.3, 0.8, 0.7], wc, 0.035, { bone: body, color: STEEL, name: "gearLeg" });
    b.rod([s * 0.3, 0.8, 0.4], wc, 0.035, { bone: body, color: STEEL, name: "gearLegB" });
    b.lathe([[0, -0.1], [0.28, -0.1], [0.36, -0.05], [0.36, 0.05], [0.28, 0.1], [0, 0.1]], { at: wc, axis: [s, 0, 0], bone: body, color: RUBBER, segments: 14, name: "tire" });
    b.lathe([[0, 0.11], [0.2, 0.11], [0.2, 0.12], [0, 0.14]], { at: wc, axis: [s, 0, 0], bone: body, color: YEL, segments: 10, name: "hub" });
  }
  b.rod([-0.68, 0.36, 0.55], [0.68, 0.36, 0.55], 0.025, { bone: body, color: STEEL, name: "axle" });

  // lantern-like nav glow on wing tips
  for (const [s, c] of [[1, "#ff4a4a"], [-1, "#4aff7a"]] as const)
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 5), c, { bone: body, at: [s * 2.3, 1.85, 0.35], name: "navLight" }), 1.5);

  // banner trailing behind
  const A = catmull([[0, 1.3, -2.3], [0.1, 1.2, -3.0], [-0.1, 1.15, -3.8]]);
  b.sweep(A, 0.01, { bone: body, color: DARK, name: "bannerLine" });
  const ban = svg(`<svg viewBox="0 0 200 60"><rect width="200" height="60" fill="#fff0cf" stroke="#d9382f" stroke-width="6"/><text x="100" y="40" text-anchor="middle" font-family="Arial Black" font-size="26" fill="#d9382f">FLY ME!</text></svg>`, { size: 256 });
  b.part(new THREE.PlaneGeometry(1.0, 0.3), "#ffffff", { bone: body, at: [0, 1.1, -4.3], dir: [1, 0, 0], axis: "z", texture: ban, name: "banner" });
  b.part(new THREE.PlaneGeometry(1.0, 0.3), "#ffffff", { bone: body, at: [0, 1.1, -4.3], dir: [-1, 0, 0], axis: "z", texture: ban, name: "bannerBack" });

  return b.root;
}
