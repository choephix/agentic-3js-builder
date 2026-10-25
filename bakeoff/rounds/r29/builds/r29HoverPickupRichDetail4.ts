import * as THREE from "three";
import { createBuilder, svg, paint, rng, noise, mix, smoothstep } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hover Technical",
  description: "Militarized pickup converted to hover thrusters, low-poly cyberpunk.",
};

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });
  const R = rng(5);
  const ch = b.joint("chassis", { at: [0, 0.75, 0], role: "spine" });

  const BODY = paint((p, n) => {
    const base = mix("#3b4a43", "#56645a", noise(p, 0.3, 2));
    const worn = smoothstep(0.62, 0.8, noise(p, 0.12, 7));
    let c = mix(base, "#8a6a3a", worn * 0.5);
    if (n.y < -0.3) c = mix(c, "#1a1c20", 0.5);
    return c;
  });
  const DARK = "#1c1e26", STEEL = "#6b7480", NEON = "#19f0ff", PINK = "#ff2d95", AMBER = "#ffb02e";

  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(g, c, { bone: ch, at, ...o });

  // skid frame
  for (const s of [1, -1]) P(box(0.1, 0.14, 4.8), DARK, [s * 0.5, 0, 0]);
  for (const z of [-2, -1, 0, 1, 2]) P(box(1.1, 0.08, 0.1), DARK, [0, 0, z]);
  P(box(1.6, 0.05, 4.8), "#2a2d35", [0, 0.1, 0]);

  // cab
  P(box(1.9, 0.6, 1.5), BODY, [0, 0.5, 0.5]);
  P(box(1.9, 0.1, 1.5), BODY, [0, 1.4, 0.5]);
  P(box(1.78, 0.56, 0.06), "#2a6a80", [0, 1.08, 1.22], { rotation: [-20, 0, 0] });
  P(box(1.78, 0.5, 0.05), "#2a6a80", [0, 1.08, -0.22]);
  for (const s of [1, -1]) {
    P(box(0.06, 0.5, 1.2), "#2a6a80", [s * 0.95, 1.08, 0.5]);
    P(box(0.08, 0.6, 0.08), BODY, [s * 0.92, 1.08, 1.15]);
    P(box(0.06, 0.04, 1.5), NEON, [s * 0.96, 0.62, 0.5]);
    P(box(0.04, 0.05, 0.16), STEEL, [s * 0.98, 0.95, 0.8]);
    P(box(0.2, 0.26, 0.04), DARK, [s * 1.2, 1.2, 1.1]);
  }
  glow(b.part(box(1.9, 0.03, 1.4), NEON, { bone: ch, at: [0, 1.46, 0.5] }), 0.6);

  // hood, nose
  P(box(1.7, 0.45, 1.3), BODY, [0, 0.45, 1.8]);
  P(box(1.74, 0.08, 1.3), BODY, [0, 0.72, 1.8]);
  P(box(0.2, 0.05, 1.1), STEEL, [0, 0.78, 1.8]);
  P(box(1.2, 0.3, 0.1), DARK, [0, 0.45, 2.48]);
  for (let i = 0; i < 5; i++) P(box(1.1, 0.02, 0.04), STEEL, [0, 0.35 + i * 0.05, 2.54]);
  for (const s of [1, -1]) {
    glow(b.part(box(0.3, 0.12, 0.05), AMBER, { bone: ch, at: [s * 0.65, 0.6, 2.5] }), 1.5);
    P(box(0.5, 0.1, 0.1), "#3b4a43", [s * 0.7, 0.72, 2.5]);
  }
  // armor plates with chevrons
  const chev = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#1a1a1a"/><path d="M0 32L16 0h12L12 32zM28 32L44 0h12L40 32z" fill="#ffb02e"/></svg>`, { size: 128 });
  b.part(new THREE.PlaneGeometry(1.2, 0.3), "#ffffff", { bone: ch, at: [0, 0.2, 2.56], dir: [0, 0, 1], axis: "z", texture: chev });
  b.part(new THREE.PlaneGeometry(1.4, 0.3), "#ffffff", { bone: ch, at: [0, 0.2, -2.46], dir: [0, 0, -1], axis: "z", texture: chev });

  // bed with armor & mount
  P(box(1.95, 0.06, 2.2), BODY, [0, 0.2, -1.4]);
  P(box(1.95, 0.6, 0.06), BODY, [0, 0.5, -0.32]);
  P(box(1.95, 0.6, 0.06), BODY, [0, 0.5, -2.5]);
  for (const s of [1, -1]) {
    P(box(0.06, 0.6, 2.2), BODY, [s * 0.95, 0.5, -1.4]);
    P(box(0.1, 0.05, 2.2), STEEL, [s * 0.95, 0.82, -1.4]);
    glow(b.part(box(0.02, 0.05, 1.6), PINK, { bone: ch, at: [s * 0.99, 0.5, -1.4] }), 1.2);
    for (let i = 0; i < 4; i++) P(cyl(0.025, 0.02, 6), STEEL, [s * 1.0, 0.65, -0.8 - i * 0.5], { rotation: [0, 0, 90] });
  }
  // turret
  const yaw = b.joint("yaw", { parent: ch, at: [0, 0.25, -1.4], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 0.95, -1.4], dir: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.4, 0.1, 12), STEEL, { bone: yaw, at: [0, 0.3, -1.4] });
  b.part(cyl(0.12, 0.6, 8), DARK, { bone: yaw, at: [0, 0.6, -1.4] });
  b.part(box(0.5, 0.3, 0.5), "#3b4a43", { bone: pitch, at: [0, 0.95, -1.4] });
  for (const s of [1, -1]) {
    b.rod([s * 0.1, 0.95, -1.2], [s * 0.1, 0.95, 0.0], 0.04, STEEL, { bone: pitch, sides: 8 });
    b.part(box(0.12, 0.12, 0.2), DARK, { bone: pitch, at: [s * 0.1, 0.95, 0.0] });
    glow(b.part(cyl(0.025, 0.02, 6), PINK, { bone: pitch, at: [s * 0.1, 0.95, 0.12], rotation: [90, 0, 0] }), 1.5);
  }
  b.part(box(0.3, 0.2, 0.3), DARK, { bone: pitch, at: [0.4, 0.9, -1.4] });

  // roof gear
  P(box(1.2, 0.08, 0.12), DARK, [0, 1.52, 1.0]);
  for (const x of [-0.45, -0.15, 0.15, 0.45]) glow(b.part(cyl(0.05, 0.03, 8), x < 0 ? PINK : NEON, { bone: ch, at: [x, 1.52, 1.07], rotation: [90, 0, 0] }), 1.6);
  b.spike([-0.8, 1.45, -0.1], [0, 1, 0], 1.3, 0.018, STEEL, { bone: ch, sides: 5 });
  b.part(new THREE.SphereGeometry(0.2, 8, 4, 0, 6.28, 0, 1.57), "#2a6a80", { bone: ch, at: [0.5, 1.45, 0.1], flat: true });
  // dish
  b.lathe([[0, 0], [0.25, 0.1], [0.25, 0.12], [0, 0.03]], { at: [0.7, 1.52, 0.2], axis: [0, 0.8, -0.6], segments: 10, bone: ch, color: STEEL });

  // hover thruster pods (replace wheels) with jointed gimbals
  for (const [k, s, z] of [["FL", 1, 1.55], ["FR", -1, 1.55], ["RL", 1, -1.55], ["RR", -1, -1.55]] as const) {
    const g = b.joint(`gimbal${k}`, { parent: ch, at: [s * 1.15, 0.35, z], dir: [0, 1, 0], role: "hinge" });
    const G = (geo: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(geo, c, { bone: g, at, ...o });
    b.rod([s * 0.5, 0.35, z], [s * 1.0, 0.35, z], 0.07, DARK, { bone: ch, sides: 6 });
    G(cyl(0.2, 0.18, 6), STEEL, [s * 1.15, 0.45, z], { flat: true });
    b.lathe([[0.3, 0], [0.5, 0.0], [0.52, 0.12], [0.4, 0.3], [0.38, 0.3], [0.46, 0.12], [0.3, 0.06]], { at: [s * 1.15, 0.0, z], axis: [0, 1, 0], segments: 10, bone: g, color: "#3b4a43" });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * 6.283;
      G(box(0.16, 0.2, 0.03), DARK, [s * 1.15 + 0.3 * Math.cos(a), 0.2, z + 0.3 * Math.sin(a)], { rotation: [0, -a * 57.3, 0] });
    }
    glow(G(new THREE.TorusGeometry(0.28, 0.025, 5, 12), NEON, [s * 1.15, 0.06, z], { rotation: [90, 0, 0] }), 1.8);
    glow(G(cyl(0.24, 0.02, 12), "#7fe9ff", [s * 1.15, 0.03, z], { flat: true }), 1.2);
    G(box(0.5, 0.06, 0.5), "#3b4a43", [s * 1.15, 0.58, z]);
  }
  // under-glow
  glow(b.part(box(1.4, 0.02, 3.6), "#0b7f95", { bone: ch, at: [0, 0.05, 0] }), 0.8);

  // rear power core & exhaust
  P(box(1.0, 0.4, 0.3), DARK, [0, 0.55, -2.65]);
  for (const x of [-0.3, 0, 0.3]) glow(b.part(box(0.1, 0.3, 0.04), x ? AMBER : PINK, { bone: ch, at: [x, 0.55, -2.82] }), 1.6);
  for (const s of [1, -1]) {
    b.rod([s * 0.7, 0.3, -2.5], [s * 0.7, 0.3, -2.8], 0.06, STEEL, { bone: ch, sides: 8 });
  }
  // bumper + hooks
  P(box(2.1, 0.2, 0.16), DARK, [0, 0.2, 2.65]);
  for (let i = 0; i < 7; i++) b.spike([-0.9 + i * 0.3, 0.2, 2.72], [0, 0, 1], 0.2, 0.04, STEEL, { bone: ch, sides: 5 });
  // greeble dots
  for (let i = 0; i < 14; i++) P(cyl(0.02, 0.02, 6), STEEL, [(R() - 0.5) * 1.5, 0.76, 1.3 + R() * 1.0]);
  // neon sign decal on door
  const sign = svg(`<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#11131a"/><text x="32" y="17" font-size="14" text-anchor="middle" fill="#ff2d95" font-family="monospace" font-weight="bold">HVR-07</text></svg>`, { size: 192 });
  for (const s of [1, -1])
    glow(b.part(new THREE.PlaneGeometry(0.7, 0.26), "#ffffff", { bone: ch, at: [s * 0.985, 0.4, 0.5], dir: [s, 0, 0], axis: "z", texture: sign }), 0.9);

  const box3 = new THREE.Box3().setFromObject(b.root, true);
  b.root.position.y -= box3.min.y;
  return b.root;
}
