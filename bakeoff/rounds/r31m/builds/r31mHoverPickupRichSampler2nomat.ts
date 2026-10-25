import * as THREE from "three";
import { createBuilder, rng, paint, noise, mix, smoothstep, svg, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Maglev Raider",
  description: "Militarized pickup converted to four hover thrusters, low-poly cyberpunk, with neon underglow and a bed-mounted twin cannon.",
};

const NEON_C = "#18f2ff";
const NEON_M = "#ff2bd6";
const DARK = "#12151d";
const STEEL = "#5b6676";
const GLASS = "#0a2a3a";
const AMBER = "#ffb02e";

const bx = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cy = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

const base = paint((p, n) => {
  const lit = mix("#33465e", "#1b2331", smoothstep(0.6, -0.6, n.y));
  const dirt = smoothstep(1.0, 0.55, p.y) * noise(p, 0.25, 3);
  return mix(lit, "#4a3d30", dirt * 0.8);
});
const HULL = panelled(base, { size: 0.35, rivets: 0.07 });
const ARMOR = panelled(paint((p, n) => mix("#3b4a3a", "#232c25", smoothstep(0.5, -0.5, n.y) + noise(p, 0.2, 5) * 0.3)), { size: 0.3, rivets: 0.06 });

const SIDE = svg(
  `<svg viewBox="0 0 140 45" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="140" height="45" rx="4" fill="#0b0e14" opacity="0.85"/>
  <path d="M0 0H22L0 22Z M0 45H22L0 23Z" fill="#ffb02e"/>
  <path d="M118 0H140V22Z M118 45H140V23Z" fill="#ffb02e"/>
  <text x="70" y="29" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#18f2ff" stroke="#ff2bd6" stroke-width="0.8">NOMAD-7</text>
  <rect x="30" y="35" width="80" height="3" fill="#ff2bd6"/>
  <circle cx="70" cy="8" r="4" fill="none" stroke="#ffb02e" stroke-width="1.5"/>
  </svg>`,
  { size: 512 },
);
const SIGN = svg(
  `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="40" fill="#14041a"/>
  <rect x="3" y="3" width="94" height="34" fill="none" stroke="#ff2bd6" stroke-width="3"/>
  <text x="50" y="26" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="16" fill="#18f2ff">HOVER</text>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "hoverTruck" });
  const r = rng(7);
  const chassis = b.joint("chassis", { at: [0, 0.7, 0], role: "spine" });
  const B = chassis;
  const put = (g: THREE.BufferGeometry, c: any, at: number[], extra: any = {}) =>
    b.part(g, c, { bone: B, at: at as any, ...extra });

  // ---- lower hull
  b.loft(
    [
      { at: [0, 0.85, -2.6], w: 1.7, h: 0.5 },
      { at: [0, 0.82, -1.6], w: 2.0, h: 0.55 },
      { at: [0, 0.82, 0.8], w: 2.0, h: 0.55 },
      { at: [0, 0.8, 2.0], w: 1.8, h: 0.45 },
      { at: [0, 0.76, 2.75], w: 1.4, h: 0.32 },
    ],
    { bone: B, color: HULL },
  );
  // belly plate + underglow strips
  put(bx(1.6, 0.05, 4.8), DARK, [0, 0.54, 0]);
  for (const s of [1, -1]) {
    glow(put(bx(0.06, 0.03, 4.2), NEON_C, [s * 0.8, 0.51, 0]), 1.6);
    glow(put(bx(0.04, 0.04, 4.9), NEON_M, [s * 1.02, 0.7, 0]), 1.4);
  }
  glow(put(bx(1.4, 0.03, 0.06), NEON_C, [0, 0.51, 1.6]), 1.6);
  glow(put(bx(1.4, 0.03, 0.06), NEON_C, [0, 0.51, -1.6]), 1.6);

  // ---- hood, cab
  b.frustumBox([0, 1.2, 0.8], [0, 1.1, 2.6], [1.9, 0.3], [1.55, 0.2], { bone: B, color: HULL });
  put(bx(0.5, 0.06, 1.1), DARK, [0, 1.37, 1.7]); // intake scoop
  for (let i = 0; i < 4; i++) put(bx(0.4, 0.02, 0.04), NEON_C, [0, 1.405, 1.3 + i * 0.25]);
  b.frustumBox([0, 1.55, -0.65], [0, 1.55, 0.75], [1.85, 0.85], [1.85, 0.7], { bone: B, color: HULL });
  put(bx(1.7, 0.7, 0.05), GLASS, [0, 1.58, 0.85], { rotation: [-32, 0, 0] }); // windscreen
  put(bx(1.7, 0.45, 0.05), GLASS, [0, 1.6, -0.68]);
  for (const s of [1, -1]) {
    put(bx(0.04, 0.4, 1.0), GLASS, [s * 0.93, 1.6, 0.05]);
    put(bx(0.06, 0.06, 1.5), STEEL, [s * 0.93, 1.35, 0.05]);
    put(bx(0.06, 0.5, 0.06), ARMOR, [s * 0.93, 1.55, 0.62]);
  }
  put(bx(1.95, 0.08, 1.6), ARMOR, [0, 1.98, 0.05]); // roof plate
  // roof light bar and rocket pods
  put(bx(1.3, 0.1, 0.14), DARK, [0, 2.07, 0.55]);
  for (let i = 0; i < 4; i++) glow(put(bx(0.24, 0.06, 0.03), i % 2 ? NEON_M : NEON_C, [-0.45 + i * 0.3, 2.07, 0.63]), 2);
  for (const s of [1, -1]) {
    put(bx(0.34, 0.3, 0.8), ARMOR, [s * 0.75, 2.17, -0.2]);
    for (const dx of [-0.08, 0.08])
      for (const dy of [-0.06, 0.06]) {
        put(cy(0.05, 0.06, 6), DARK, [s * 0.75 + dx, 2.17 + dy, 0.21], { rotation: [90, 0, 0] });
        b.spike([s * 0.75 + dx, 2.17 + dy, 0.16], [0, 0, 1], 0.1, 0.04, AMBER, { bone: B, sides: 5 });
      }
  }
  // antenna
  b.spike([-0.8, 2.02, -0.55], [0, 1, 0], 1.0, 0.018, STEEL, { bone: B, sides: 5 });
  glow(put(new THREE.SphereGeometry(0.035, 6, 4), NEON_M, [-0.8, 3.03, -0.55]), 2);

  // ---- front: headlights, bumper
  for (const s of [1, -1]) {
    glow(put(bx(0.5, 0.07, 0.04), "#e8fcff", [s * 0.6, 1.05, 2.45]), 2);
    put(bx(0.58, 0.04, 0.1), DARK, [s * 0.6, 1.12, 2.45]);
    glow(put(bx(0.1, 0.1, 0.04), AMBER, [s * 0.88, 0.95, 2.35]), 1.5);
  }
  put(bx(2.1, 0.28, 0.25), ARMOR, [0, 0.72, 2.75]);
  for (let i = 0; i < 6; i++) b.spike([-0.8 + i * 0.32, 0.7, 2.88], [0, 0, 1], 0.2, 0.045, STEEL, { bone: B, sides: 4 });
  glow(put(bx(1.2, 0.04, 0.03), NEON_M, [0, 0.9, 2.78]), 1.8);
  // mirrors
  for (const s of [1, -1]) {
    b.rod([s * 0.95, 1.6, 0.6], [s * 1.2, 1.7, 0.7], 0.02, STEEL, { bone: B });
    put(bx(0.06, 0.2, 0.14), DARK, [s * 1.22, 1.7, 0.68]);
  }

  // ---- bed
  put(bx(1.95, 0.08, 1.9), DARK, [0, 1.1, -1.65]);
  for (const s of [1, -1]) {
    put(bx(0.08, 0.5, 1.9), ARMOR, [s * 0.95, 1.38, -1.65]);
    put(bx(0.12, 0.05, 1.9), STEEL, [s * 0.95, 1.65, -1.65]);
    for (let i = 0; i < 3; i++) put(bx(0.1, 0.4, 0.06), STEEL, [s * 0.98, 1.4, -2.3 + i * 0.55]);
    // reactor cell glow strip
    glow(put(bx(0.03, 0.06, 1.4), NEON_C, [s * 1.0, 1.45, -1.65]), 1.5);
  }
  put(bx(1.95, 0.55, 0.08), ARMOR, [0, 1.38, -2.6]);
  put(bx(1.95, 0.55, 0.08), ARMOR, [0, 1.38, -0.7]);
  put(b.part ? bx(0.8, 0.3, 0.05) : bx(0, 0, 0), SIGN as any, [0, 1.35, -2.66], {}) ;

  // ---- turret
  const yaw = b.joint("yaw", { parent: chassis, at: [0, 1.2, -1.65], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 1.55, -1.65], dir: [0, 0, 1], role: "hinge" });
  b.part(new THREE.TorusGeometry(0.45, 0.04, 6, 14), STEEL, { bone: chassis, at: [0, 1.17, -1.65], rotation: [90, 0, 0] });
  b.part(cy(0.38, 0.22, 10), ARMOR, { bone: yaw, at: [0, 1.3, -1.65], flat: true });
  for (const s of [1, -1]) {
    b.part(bx(0.06, 0.3, 0.4), ARMOR, { bone: yaw, at: [s * 0.22, 1.5, -1.65] });
    b.part(bx(0.2, 0.2, 0.3), DARK, { bone: yaw, at: [s * 0.4, 1.45, -1.7] });
  }
  b.part(bx(0.34, 0.24, 0.4), ARMOR, { bone: pitch, at: [0, 1.55, -1.6] });
  for (const s of [1, -1]) {
    b.rod([s * 0.1, 1.55, -1.45], [s * 0.1, 1.55, -0.78], 0.045, STEEL, { bone: pitch, sides: 8 });
    b.part(cy(0.065, 0.14, 8), DARK, { bone: pitch, at: [s * 0.1, 1.55, -0.8], rotation: [90, 0, 0] });
    glow(b.part(cy(0.035, 0.02, 8), NEON_M, { bone: pitch, at: [s * 0.1, 1.55, -0.72], rotation: [90, 0, 0] }), 2.5);
  }
  b.part(bx(0.34, 0.1, 0.05), STEEL, { bone: pitch, at: [0, 1.55, -1.1] });

  // ---- rear boosters
  for (const s of [1, -1]) {
    b.lathe(
      [[0, 0], [0.2, 0], [0.16, 0.1], [0.26, 0.45], [0.22, 0.45], [0.12, 0.12], [0, 0.14]],
      { at: [s * 0.55, 0.95, -2.62], axis: [0, 0, -1], segments: 10, bone: B, color: STEEL },
    );
    glow(put(cy(0.1, 0.03, 10), NEON_C, [s * 0.55, 0.95, -2.66], { rotation: [90, 0, 0] }), 2.5);
  }

  // ---- hover pods
  for (const [k, s, z] of [["FL", 1, 1.55], ["FR", -1, 1.55], ["RL", 1, -1.55], ["RR", -1, -1.55]] as const) {
    const x = s * 1.25;
    const fan = b.joint(`hover${k}`, { parent: chassis, at: [x, 0.52, z], dir: [0, 1, 0], role: "hinge" });
    b.lathe([[0, 0.04], [0.4, 0.04], [0.46, 0.12], [0.4, 0.46], [0.32, 0.46], [0.3, 0.2], [0, 0.2]], {
      at: [x, 0, z], axis: [0, 1, 0], segments: 10, bone: B, color: ARMOR,
    });
    glow(b.part(cy(0.34, 0.04, 10), NEON_C, { bone: B, at: [x, 0.02, z], flat: true }), 2.2);
    b.part(new THREE.TorusGeometry(0.34, 0.03, 5, 12), NEON_M, { bone: B, at: [x, 0.47, z], rotation: [90, 0, 0] });
    b.part(cy(0.06, 0.1, 6), STEEL, { bone: fan, at: [x, 0.5, z] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(bx(0.07, 0.015, 0.26), STEEL, {
        bone: fan,
        at: [x + 0.17 * Math.sin(a), 0.52, z + 0.17 * Math.cos(a)],
        rotation: [0, (a * 180) / Math.PI, 0],
      });
    }
    // struts and fender
    b.rod([x - s * 0.3, 0.45, z], [s * 0.85, 0.72, z], 0.05, STEEL, { bone: B, sides: 6 });
    b.rod([x - s * 0.2, 0.4, z + 0.3], [s * 0.85, 0.65, z + 0.5], 0.03, STEEL, { bone: B, sides: 5 });
    put(bx(0.7, 0.07, 1.2), ARMOR, [x, 0.72, z]);
    put(bx(0.06, 0.2, 1.2), ARMOR, [x + s * 0.34, 0.65, z]);
    for (let i = 0; i < 3; i++) put(bx(0.4, 0.02, 0.05), AMBER, [x, 0.765, z - 0.35 + i * 0.35]);
  }

  // ---- side decals and armor
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(1.5, 0.48), "#ffffff", {
      bone: B, at: [s * 1.011, 0.84, 0.0], dir: [s, 0, 0], axis: "z", texture: SIDE,
    });
    put(bx(0.05, 0.3, 1.1), ARMOR, [s * 1.0, 1.0, -1.65]);
    for (let i = 0; i < 4; i++) put(cy(0.02, 0.03, 6), STEEL, [s * 1.03, 1.0, -2.05 + i * 0.27], { rotation: [0, 0, 90] });
  }
  // greeble scatter on hood
  for (let i = 0; i < 8; i++)
    put(bx(0.06 + r() * 0.08, 0.03, 0.06 + r() * 0.06), r() > 0.5 ? STEEL : DARK, [(r() - 0.5) * 1.3, 1.34, 0.95 + r() * 1.2]);
  // cable from cab to turret
  b.sweep(catmull([[0.6, 1.9, -0.7], [0.7, 1.7, -1.0], [0.3, 1.6, -1.4]]), 0.016, DARK, { bone: B, sides: 5 });

  return b.root;
}
