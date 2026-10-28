import * as THREE from "three";
import { createBuilder, rng, aim } from "../../../../src/index";
import { metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";

export const meta = {
  name: "Treasure Hoard",
  description: "A League-of-Legends styled hoard: arched chest spilling coins, gems, a jeweled crown and goblets on a gold mound.",
};

const GOLD = metal("gilt");
const BRASS = metal("brass");
const WOODC = "#5a3420";
const WOOD_D = "#3a2014";
const IRONC = "#2b2f3c";

const emblem = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#0e1a30" stroke="#ffe08a" stroke-width="4"/><path d="M32 10 L48 32 L32 54 L16 32Z" fill="none" stroke="#5ae6ff" stroke-width="4"/><circle cx="32" cy="32" r="6" fill="#5ae6ff"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "treasureHoard" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(5);
  const P = (g: THREE.BufferGeometry, c: any, at: [number, number, number], rot?: [number, number, number], sc?: any, name?: string) =>
    b.part(g, c, { bone: root, at, rotation: rot, scale: sc, flat: true, name });

  // gold mound
  b.lathe([[0, 0], [1.1, 0], [1.0, 0.12], [0.75, 0.3], [0.4, 0.42], [0, 0.46]], { at: [0, -0.01, 0], segments: 12, color: GOLD, bone: root, name: "mound" });

  // chest
  const cx = -0.15, cz = -0.2;
  P(new THREE.BoxGeometry(0.8, 0.36, 0.52), WOODC, [cx, 0.3, cz], [0, 12, 0], undefined, "chestBody");
  const lid = b.lathe([[0, -0.26], [0.26, -0.26], [0.26, 0], [0.18, 0.15], [0, 0.2]], {
    at: [cx, 0.48, cz], axis: [1, 0, 0], segments: 8, color: WOODC, bone: root, name: "lid" });
  void lid;
  P(new THREE.BoxGeometry(0.84, 0.08, 0.56), IRONC, [cx, 0.14, cz], [0, 12, 0]);
  for (const x of [-0.3, 0.3]) P(new THREE.BoxGeometry(0.07, 0.4, 0.57), GOLD, [cx + x, 0.3, cz], [0, 12, 0]);
  P(new THREE.BoxGeometry(0.14, 0.16, 0.04), GOLD, [cx + 0.1, 0.43, cz + 0.28], [0, 12, 0]);
  glow(b.part(new THREE.PlaneGeometry(0.14, 0.14), "#ffffff", { bone: root, at: [cx + 0.1, 0.43, cz + 0.305], dir: [0.2, 0, 1], axis: "z", texture: emblem }), 1);
  // coin heap in chest
  P(new THREE.SphereGeometry(0.34, 8, 5), GOLD, [cx, 0.46, cz], [0, 0, 0], [1, 0.35, 0.7]);

  // coins
  const coin = new THREE.CylinderGeometry(0.05, 0.05, 0.012, 10);
  for (let i = 0; i < 90; i++) {
    const a = R() * 6.28, r = 0.2 + R() * 0.85;
    const h = 0.42 * Math.max(0, 1 - r / 1.1) + 0.03;
    P(coin, i % 5 === 0 ? BRASS : GOLD, [Math.cos(a) * r + 0.2, h + R() * 0.03, Math.sin(a) * r + 0.2], [R() * 80, R() * 360, R() * 80]);
  }
  for (let i = 0; i < 8; i++) P(coin, GOLD, [0.62, 0.03 + i * 0.013, 0.55], [0, i * 11, 0], 1.1);

  // gems
  const cols = ["#ff3f6c", "#3fd0ff", "#5dff8a", "#b45cff", "#ffd23f"];
  for (let i = 0; i < 16; i++) {
    const a = R() * 6.28, r = 0.3 + R() * 0.7;
    const s = 0.04 + R() * 0.04;
    glow(P(new THREE.OctahedronGeometry(s, 0), cols[i % 5], [Math.cos(a) * r + 0.1, 0.14 + 0.3 * Math.max(0, 1 - r) + R() * 0.05, Math.sin(a) * r + 0.1], [R() * 90, R() * 90, 0], [1, 1.4, 1]), 0.9);
  }
  glow(P(new THREE.OctahedronGeometry(0.1, 0), "#3fd0ff", [0.55, 0.14, 0.2], [0, 20, 0], [1, 1.5, 1]), 1.3);

  // crown
  const kx = 0.35, kz = 0.25, ky = 0.36;
  b.lathe([[0.17, 0], [0.19, 0], [0.19, 0.1], [0.17, 0.1]], { at: [kx, ky, kz], segments: 10, color: GOLD, bone: root, name: "crownBand" });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * 6.28;
    const x = kx + Math.cos(a) * 0.18, z = kz + Math.sin(a) * 0.18;
    P(new THREE.ConeGeometry(0.035, 0.16 + (i % 2) * 0.06, 5), GOLD, [x, ky + 0.17, z]);
    glow(P(new THREE.SphereGeometry(0.02, 5, 4), cols[i % 5], [x, ky + 0.27 + (i % 2) * 0.06, z]), 1.1);
  }
  glow(P(new THREE.OctahedronGeometry(0.03, 0), "#ff3f6c", [kx, ky + 0.05, kz + 0.2]), 1.1);

  // goblets
  const goblet = (x: number, z: number, y: number, tilt: number) => {
    const g = b.lathe([[0, 0], [0.05, 0], [0.012, 0.03], [0.012, 0.1], [0.06, 0.14], [0.075, 0.24], [0.06, 0.24], [0.045, 0.15], [0, 0.15]],
      { at: [x, y, z], axis: [Math.sin(tilt), Math.cos(tilt), 0], segments: 8, color: GOLD, bone: root });
    void g;
    P(new THREE.TorusGeometry(0.075, 0.01, 4, 8), GOLD, [x, y + 0.24, z], [90, 0, 0]);
    glow(P(new THREE.SphereGeometry(0.013, 5, 4), "#ff3f6c", [x, y + 0.1, z + 0.04]), 1);
  };
  goblet(-0.65, 0.35, 0.3, 0);
  goblet(0.0, 0.7, 0.14, 0.15);
  goblet(0.85, -0.3, 0.2, 0.9);

  return b.root;
}
