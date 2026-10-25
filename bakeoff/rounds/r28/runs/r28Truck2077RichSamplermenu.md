```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Nightfang Raider 2077",
  description: "Militarized cyberpunk pickup with roof-mounted turret, missile pods, neon underglow and armored plating.",
};

export default function build() {
  const b = createBuilder({ name: "raider2077" });
  const chassis = b.joint("chassis", { at: [0, 0.7, 0], role: "spine" });

  const BODY = panelled("#3b4453", { size: 0.45, rivets: 0.06 });
  const BODY2 = panelled("#2f3743", { size: 0.35, rivets: 0.05 });
  const TRIM = "#13161c";
  const STEEL = metal("steel", { tarnish: 0.4 });
  const IRON = metal("iron");
  const GLASS = "#1d6f86";
  const CYAN = "#33e6ff";
  const MAG = "#ff2fd0";
  const AMBER = "#ffb02e";
  const RED = "#ff3030";
  const WARN = "#e8c21a";

  type Opt = { bone?: any; rotation?: [number, number, number]; dir?: [number, number, number]; scale?: any; texture?: THREE.Texture };
  const P = (g: THREE.BufferGeometry, color: any, at: [number, number, number], o: Opt = {}) =>
    b.part(g, color, { bone: o.bone ?? chassis, at, rotation: o.rotation, dir: o.dir, scale: o.scale, texture: o.texture } as any);
  const box = (w: number, h: number, d: number, color: any, at: [number, number, number], o: Opt = {}) =>
    P(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (r: number, h: number, sides: number, color: any, at: [number, number, number], dir: [number, number, number], o: Opt = {}) =>
    P(new THREE.CylinderGeometry(r, r, h, sides), color, at, { ...o, dir });

  // ---------- textures ----------
  const NUM = svg(
    `<svg viewBox="0 0 128 64"><rect x="3" y="3" width="122" height="58" rx="6" fill="none" stroke="#33e6ff" stroke-width="4"/>
     <text x="64" y="46" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="40" fill="#33e6ff">07</text>
     <path d="M10 56h30M88 56h30" stroke="#ff2fd0" stroke-width="3"/></svg>`, { size: 256 });
  const WARNT = svg(
    `<svg viewBox="0 0 100 100"><path d="M50 6L96 90H4Z" fill="#e8c21a" stroke="#111" stroke-width="6" stroke-linejoin="round"/>
     <path d="M54 30L38 56h14l-6 20 20-30H52Z" fill="#111"/></svg>`, { size: 128 });
  const HUD = svg(
    `<svg viewBox="0 0 128 80"><rect width="128" height="80" fill="#04141a"/>
     <circle cx="44" cy="40" r="24" fill="none" stroke="#33e6ff" stroke-width="3"/><circle cx="44" cy="40" r="10" fill="none" stroke="#33e6ff" stroke-width="2"/>
     <path d="M44 8v64M12 40h64" stroke="#33e6ff" stroke-width="2"/><circle cx="58" cy="30" r="3" fill="#ff3030"/>
     <rect x="84" y="12" width="36" height="8" fill="#ff2fd0"/><rect x="84" y="26" width="26" height="8" fill="#33e6ff"/><rect x="84" y="40" width="32" height="8" fill="#33e6ff"/>
     <text x="84" y="68" font-family="monospace" font-size="12" fill="#33ff99">SYS OK</text></svg>`, { size: 256 });
  const EYE = svg(
    `<svg viewBox="0 0 100 100"><path d="M5 50L50 10L95 50L50 90Z" fill="none" stroke="#ff2fd0" stroke-width="6"/>
     <path d="M25 50L50 28L75 50L50 72Z" fill="#ff2fd0"/><circle cx="50" cy="50" r="8" fill="#fff"/></svg>`, { size: 128 });

  // ---------- frame and underbody ----------
  for (const s of [1, -1]) {
    box(0.16, 0.22, 5.2, IRON, [s * 0.5, 0.62, 0]);
    box(0.1, 0.12, 4.4, TRIM, [s * 0.86, 0.5, 0]); // rocker rail
    box(0.05, 0.3, 3.0, STEEL, [s * 0.98, 0.62, 0]); // skirt
    for (let i = 0; i < 4; i++) box(0.07, 0.34, 0.5, BODY2, [s * 1.0, 0.64, -1.1 + i * 0.75]);
    box(0.04, 0.04, 4.2, MAG, [s * 1.03, 0.45, 0]).mesh && glow(b.part(new THREE.BoxGeometry(0.04, 0.04, 4.2), MAG, { bone: chassis, at: [s * 1.03, 0.47, 0] } as any), 1.6);
  }
  for (const z of [-1.55, 1.55]) {
    cyl(0.07, 1.8, 8, STEEL, [0, 0.42, z], [1, 0, 0]);
    box(0.5, 0.2, 0.3, IRON, [0, 0.46, z]);
  }
  box(1.0, 0.18, 0.5, IRON, [0, 0.55, 0.2]); // transfer case
  glow(box(1.3, 0.03, 4.0, CYAN, [0, 0.4, 0]), 1.2); // underglow panel

  // ---------- wheels ----------
  const wheelJ: any[] = [];
  for (const [n, sx, z] of [["FL", 1, 1.55], ["FR", -1, 1.55], ["RL", 1, -1.55], ["RR", -1, -1.55]] as const) {
    const j = b.joint(`wheel${n}`, { parent: chassis, at: [sx * 0.86, 0.42, z], dir: [sx, 0, 0], role: "leg" } as any);
    wheelJ.push(j);
    const at = (dx: number): [number, number, number] => [sx * (0.86 + dx), 0.42, z];
    cyl(0.42, 0.34, 14, "#0f1013", at(0), [1, 0, 0], { bone: j });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      box(0.36, 0.09, 0.1, "#191b20", [sx * 0.86, 0.42 + Math.cos(a) * 0.43, z + Math.sin(a) * 0.43], { bone: j, rotation: [(-a * 180) / Math.PI, 0, 0] });
    }
    cyl(0.27, 0.06, 12, STEEL, at(sx * 0 + 0.17 * 1), [1, 0, 0], { bone: j });
    cyl(0.27, 0.06, 12, STEEL, at(-0.17), [1, 0, 0], { bone: j });
    P(new THREE.TorusGeometry(0.28, 0.025, 4, 16), MAG, at(0.19), { bone: j, dir: [1, 0, 0], ...{} } as any);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      cyl(0.02, 0.05, 6, TRIM, [sx * 1.06, 0.42 + Math.cos(a) * 0.16, z + Math.sin(a) * 0.16], [1, 0, 0], { bone: j });
    }
    cyl(0.07, 0.08, 8, IRON, at(0.22), [1, 0, 0], { bone: j });
    // fender flare
    box(0.3, 0.1, 1.0, TRIM, [sx * 0.95, 0.9, z]);
    box(0.08, 0.34, 1.0, BODY2, [sx * 1.06, 0.88, z]);
  }

  // ---------- cab ----------
  box(1.92, 0.7, 1.6, BODY, [0, 1.15, -0.1]);
  box(1.8, 0.5, 1.3, GLASS, [0, 1.7, -0.15]);
  box(1.94, 0.1, 1.6, TRIM, [0, 2.0, -0.12]);
  box(1.6, 0.06, 1.3, BODY, [0, 2.07, -0.12]);
  for (const s of [1, -1]) {
    for (const z of [0.55, -0.85]) box(0.1, 0.5, 0.1, TRIM, [s * 0.9, 1.7, z], { rotation: [z > 0 ? 18 : 0, 0, 0] });
    box(0.05, 0.5, 0.05, TRIM, [s * 0.93, 1.7, -0.2]);
    box(0.03, 0.62, 0.03, TRIM, [s * 0.97, 1.2, -0.2]);
    box(0.03, 0.03, 0.75, TRIM, [s * 0.97, 1.2, 0.2]);
    box(0.1, 0.08, 0.2, STEEL, [s * 0.97, 1.4, 0.05]); // handle
    // mirror
    box(0.28, 0.06, 0.06, TRIM, [s * 1.07, 1.55, 0.5]);
    box(0.06, 0.26, 0.2, TRIM, [s * 1.22, 1.55, 0.48]);
    glow(box(0.02, 0.2, 0.15, CYAN, [s * 1.24, 1.55, 0.48]), 0.7);
  }
  P(new THREE.PlaneGeometry(0.8, 0.5), "#ffffff", [0.5, 1.0, -0.2], {}); // dummy-free: keep model tidy
  box(1.7, 0.4, 0.08, GLASS, [0, 1.68, 0.62], { rotation: [-22, 0, 0] });
  glow(P(new THREE.PlaneGeometry(0.7, 0.44), "#ffffff", [0, 1.15, -0.905], { dir: [0, 0, -1], texture: HUD } as any).constructor === Object ? ({} as any) : P(new THREE.PlaneGeometry(0.01, 0.01), "#fff", [0, 3, 0]), 1);

  // ---------- hood & nose ----------
  box(1.94, 0.45, 1.9, BODY, [0, 1.0, 1.65]);
  box(1.7, 0.16, 1.6, BODY2, [0, 1.3, 1.6], { rotation: [4, 0, 0] });
  box(0.3, 0.12, 1.5, TRIM, [0, 1.4, 1.6]);
  for (const s of [1, -1]) for (let i = 0; i < 4; i++) glow(box(0.5, 0.02, 0.05, CYAN, [s * 0.6, 1.39, 1.15 + i * 0.2]), 1.2);
  box(1.9, 0.55, 0.12, TRIM, [0, 0.88, 2.6]); // grille body
  for (let i = 0; i < 5; i++) glow(box(1.4, 0.04, 0.05, i % 2 ? MAG : CYAN, [0, 0.72 + i * 0.1, 2.67]), 1.3);
  glow(P(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", [0, 1.1, 2.67], { dir: [0, 0, 1], texture: EYE } as any), 1.2);
  for (const s of [1, -1]) {
    glow(box(0.4, 0.12, 0.06, AMBER, [s * 0.7, 1.12, 2.66]), 1.8);
    box(0.5, 0.05, 0.1, TRIM, [s * 0.7, 1.2, 2.66]);
  }
  // bumper
  box(2.1, 0.28, 0.3, STEEL, [0, 0.58, 2.76]);
  for (let i = 0; i < 7; i++) {
    const x = -0.9 + i * 0.3;
    P(new THREE.ConeGeometry(0.06, 0.3, 5), IRON, [x, 0.58, 2.99], { dir: [0, 0, 1] } as any);
  }
  box(2.1, 0.06, 0.32, WARN, [0, 0.74, 2.76]);
  for (const s of [1, -1]) box(0.06, 0.3, 0.9, TRIM, [s * 0.5, 0.58, 2.4]);

  // ---------- bed ----------
  box(1.95, 0.1, 1.9, IRON, [0, 0.85, -1.8]);
  for (const s of [1, -1]) {
    box(0.1, 0.55, 1.9, BODY2, [s * 0.95, 1.15, -1.8]);
    box(0.14, 0.06, 1.9, TRIM, [s * 0.95, 1.46, -1.8]);
    glow(P(new THREE.PlaneGeometry(0.9, 0.45), "#ffffff", [s * 1.006, 1.15, -1.8], { dir: [s, 0, 0], texture: NUM } as any), 1);
    for (let i = 0; i < 3; i++) box(0.04, 0.5, 0.05, TRIM, [s * 1.0, 1.15, -1.2 - i * 0.6]);
  }
  box(1.95, 0.55, 0.1, BODY2, [0, 1.15, -2.72]);
  box(1.95, 0.6, 0.1, BODY, [0, 1.17, -0.88]);
  P(new THREE.PlaneGeometry(0.45, 0.45), "#ffffff", [0, 1.15, -2.78], { dir: [0, 0, -1], texture: WARNT } as any);
  // missile pods on bed rails
  for (const s of [1, -1]) {
    box(0.55, 0.4, 0.9, TRIM, [s * 0.62, 1.7, -2.0]);
    for (const dx of [-0.13, 0.13]) for (const dy of [-0.09, 0.09]) {
      cyl(0.08, 0.1, 8, "#05060a", [s * 0.62 + dx, 1.7 + dy, -1.54], [0, 0, 1]);
      P(new THREE.ConeGeometry(0.06, 0.2, 6), RED, [s * 0.62 + dx, 1.7 + dy, -1.5], { dir: [0, 0, 1] } as any);
    }
    box(0.08, 0.3, 0.5, STEEL, [s * 0.62, 1.55, -2.0]);
  }

  // ---------- turret ----------
  const yaw = b.joint("yaw", { parent: chassis, at: [0, 1.95, -1.7], dir: [0, 1, 0], role: "hinge" } as any);
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 2.3, -1.7], dir: [0, 0, 1], role: "hinge" } as any);
  cyl(0.16, 1.1, 8, IRON, [0, 1.45, -1.7], [0, 1, 0]);
  for (const s of [1, -1]) box(0.06, 0.06, 0.9, STEEL, [s * 0.3, 1.2, -1.7], { rotation: [0, 0, s * 40] });
  cyl(0.4, 0.14, 10, STEEL, [0, 1.98, -1.7], [0, 1, 0], { bone: yaw });
  box(0.5, 0.3, 0.7, BODY, [0, 2.2, -1.7], { bone: yaw });
  for (const s of [1, -1]) box(0.08, 0.35, 0.6, TRIM, [s * 0.3, 2.3, -1.6], { bone: pitch });
  cyl(0.05, 0.7, 8, STEEL, [0, 2.3, -1.7], [1, 0, 0], { bone: pitch });
  box(0.3, 0.28, 0.8, BODY2, [0, 2.3, -1.55], { bone: pitch });
  for (const dx of [-0.07, 0.07]) {
    cyl(0.04, 1.6, 8, IRON, [dx, 2.3, -0.5], [0, 0, 1], { bone: pitch });
    cyl(0.06, 0.2, 8, STEEL, [dx, 2.3, 0.35], [0, 0, 1], { bone: pitch });
  }
  glow(cyl(0.025, 0.04, 6, MAG, [0, 2.3, 0.46], [0, 0, 1], { bone: pitch }), 2);
  glow(box(0.2, 0.03, 0.3, RED, [0, 2.46, -1.55], { bone: pitch }), 1.5);

  // ---------- roof gear ----------
  glow(box(1.3, 0.1, 0.18, AMBER, [0, 2.17, 0.45]), 1.6);
  for (const i of [-0.5, 0, 0.5]) glow(box(0.05, 0.08, 0.22, RED, [i, 2.2, 0.45]), 1.8);
  cyl(0.02, 1.0, 5, TRIM, [0.8, 2.55, -0.7], [0, 1, 0]);
  P(new THREE.SphereGeometry(0.035, 6, 4), RED, [0.8, 3.06, -0.7]);
  P(new THREE.SphereGeometry(0.16, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), CYAN, [-0.7, 2.1, 0.25]);
  glow(P(new THREE.SphereGeometry(0.1, 6, 4), CYAN, [-0.7, 2.14, 0.25]), 1);
  for (const s of [1, -1]) cyl(0.015, 1.3, 5, STEEL, [s * 0.88, 2.12, -0.12], [0, 0, 1]);
  // exhausts & stacks behind cab
  for (const s of [1, -1]) {
    cyl(0.07, 1.2, 8, STEEL, [s * 0.82, 1.65, -1.0], [0, 1, 0]);
    cyl(0.09, 0.08, 8, IRON, [s * 0.82, 2.28, -1.0], [0, 1, 0]);
    cyl(0.05, 0.5, 6, STEEL, [s * 0.4, 0.5, -2.8], [0, 0, 1]);
  }

  // ---------- rear thrusters ----------
  for (const s of [1, -1]) {
    P(new THREE.CylinderGeometry(0.2, 0.12, 0.4, 10, 1, true), IRON, [s * 0.55, 1.0, -2.95], { dir: [0, 0, -1] } as any);
    glow(P(new THREE.CircleGeometry(0.12, 10), CYAN, [s * 0.55, 1.0, -2.78], { dir: [0, 0, -1], axis: "z" } as any), 2);
    cyl(0.23, 0.05, 10, TRIM, [s * 0.55, 1.0, -2.78], [0, 0, 1]);
  }
  // roof rack rails and spare
  for (const s of [1, -1]) box(0.05, 0.05, 1.4, STEEL, [s * 0.86, 2.14, -0.1]);
  // lamps pods on bed wall tops
  const r = rng(5);
  for (let i = 0; i < 10; i++) {
    const s = i % 2 ? 1 : -1;
    box(0.06 + r() * 0.05, 0.05, 0.08, i % 3 ? CYAN : MAG, [s * 1.03, 0.9 + r() * 0.6, -2.5 + r() * 2.2]).mesh && 0;
  }

  return b.root;
}
```