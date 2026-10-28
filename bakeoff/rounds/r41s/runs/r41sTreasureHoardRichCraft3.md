```ts
import * as THREE from "three";
import { createBuilder, rng, svg } from "agentic-3js-builder";
import { metal, INK } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = { name: "Treasure Hoard", description: "Open gilded chest, coin mound, gems, jewelled crown and goblets in a painted, hextech-fantasy style." };

const GILT = metal("gilt");
const BRASS = metal("brass", { polish: 0.5 });
const WOOD = "#5a3322";
const WOOD_D = "#3a1f16";
const NAVY = "#1d2b5c";
const GEMS = ["#e02850", "#2fb8ff", "#3be08a", "#a455ff", "#ffcf3a"];

const emblem = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 4 L58 20 L58 44 L32 60 L6 44 L6 20Z" fill="#1d2b5c" stroke="#ffe08a" stroke-width="4"/>
  <path d="M32 14 L46 24 L40 46 L32 52 L24 46 L18 24Z" fill="#2fb8ff" stroke="#ffffff" stroke-width="2"/>
  <path d="M32 14 L32 52 M18 24 L46 24" stroke="#ffffff" stroke-width="2" fill="none"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "hoard" });
  const R = rng(11);

  // ---- chest ----
  const CZ = -0.2;
  const bodyPaint = WOOD;
  b.part(new THREE.BoxGeometry(0.9, 0.34, 0.55), bodyPaint, { at: [0, 0.17, CZ] });
  b.part(new THREE.BoxGeometry(0.8, 0.02, 0.45), WOOD_D, { at: [0, 0.335, CZ] });
  // interior gold
  b.part(new THREE.CylinderGeometry(0.2, 0.4, 0.14, 10), GILT, { at: [0, 0.4, CZ] });
  // bands and corners
  for (const x of [-0.3, 0.3]) {
    b.part(new THREE.BoxGeometry(0.07, 0.36, 0.57), GILT, { at: [x, 0.17, CZ] });
  }
  b.part(new THREE.BoxGeometry(0.93, 0.05, 0.58), GILT, { at: [0, 0.03, CZ] });
  b.part(new THREE.BoxGeometry(0.93, 0.04, 0.58), GILT, { at: [0, 0.335, CZ] });
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      b.part(new THREE.BoxGeometry(0.07, 0.38, 0.07), BRASS, { at: [sx * 0.45, 0.18, CZ + sz * 0.28] });
      b.part(new THREE.SphereGeometry(0.035, 6, 4), GILT, { at: [sx * 0.45, 0.38, CZ + sz * 0.28] });
    }
  // emblem plate
  b.part(new THREE.BoxGeometry(0.16, 0.2, 0.03), GILT, { at: [0, 0.25, CZ + 0.285] });
  b.part(new THREE.PlaneGeometry(0.13, 0.13), "#ffffff", { at: [0, 0.255, CZ + 0.303], dir: [0, 0, 1], axis: "z", texture: emblem });

  // lid, opened about the back hinge
  const hz = CZ - 0.275, hy = 0.35, th = (108 * Math.PI) / 180;
  const lidOutline = (k: number, grow: number): [number, number][] => {
    const pts: [number, number][] = [];
    const n = 10;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI;
      pts.push([(0.275 - 0.275 * Math.cos(a)) * 1.0, 0.2 * Math.sin(a) * k + 0]);
    }
    pts[0] = [0, 0];
    pts[n] = [0.55, 0];
    return pts.map(([u, v]) => {
      u = u * (1 + grow) - 0.0; v = v * (1 + grow);
      return [hz + u * Math.cos(th) - v * Math.sin(th), hy + u * Math.sin(th) + v * Math.cos(th)] as [number, number];
    });
  };
  b.extrude(lidOutline(1, 0), { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.9, color: WOOD });
  for (const x of [-0.3, 0.3])
    b.extrude(lidOutline(1.06, 0.03), { at: [x, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.075, color: GILT });
  b.part(new THREE.SphereGeometry(0.04, 6, 4), GILT, { at: [0, hy, hz] });

  // ---- mound ----
  const MX = 0.1, MZ = 0.35, MR = 0.85, MH = 0.3;
  b.part(new THREE.CylinderGeometry(0.25, MR, MH, 10), GILT, { at: [MX, MH / 2 - 0.004, MZ] });
  const heightAt = (x: number, z: number) => {
    const r = Math.hypot(x - MX, z - MZ);
    return r < 0.25 ? MH : Math.max(0, (MH * (MR - r)) / 0.6);
  };
  const coinG = new THREE.CylinderGeometry(0.048, 0.048, 0.01, 10);
  const spot = () => {
    for (;;) {
      const a = R() * Math.PI * 2, r = MR * Math.sqrt(R()) * 0.98;
      const x = MX + Math.cos(a) * r, z = MZ + Math.sin(a) * r;
      if (z < 0.1 && Math.abs(x) < 0.5) continue;
      return [x, z] as const;
    }
  };
  for (let i = 0; i < 190; i++) {
    const [x, z] = spot();
    b.part(coinG, i % 3 ? GILT : BRASS, {
      at: [x, heightAt(x, z) + 0.012, z],
      rotation: [(R() - 0.5) * 70, R() * 360, (R() - 0.5) * 70],
    });
  }
  // edge-standing coins
  for (let i = 0; i < 10; i++) {
    const [x, z] = spot();
    b.part(coinG, GILT, { at: [x, heightAt(x, z) + 0.04, z], rotation: [80, R() * 360, 0] });
  }
  // gems
  for (let i = 0; i < 16; i++) {
    const [x, z] = spot();
    const s = 0.035 + R() * 0.03;
    const c = GEMS[i % 5];
    glow(
      b.part(new THREE.OctahedronGeometry(s, 0), c, {
        at: [x, heightAt(x, z) + s * 0.8, z],
        rotation: [R() * 60, R() * 360, R() * 60],
        scale: [1, 1.3, 1],
        flat: true,
      }),
      0.8,
    );
  }
  // big gems on the chest rim
  glow(b.part(new THREE.IcosahedronGeometry(0.07, 0), "#2fb8ff", { at: [0, 0.35, CZ + 0.3], flat: true, scale: [1, 1.3, 1] }), 1.3);
  glow(b.part(new THREE.OctahedronGeometry(0.09, 0), "#e02850", { at: [-0.4, 0.5, CZ + 0.05], flat: true, scale: [1, 1.4, 1] }), 1);

  // ---- crown ----
  const crownAt = [0.5, heightAt(0.5, 0.6) + 0.07, 0.62] as const;
  const crownTilt = [10, 20, 8];
  const crownG = new THREE.LatheGeometry(
    [[0.15, 0], [0.17, 0], [0.19, 0.12], [0.17, 0.12]].map(([x, y]) => new THREE.Vector2(x, y)),
    10,
  );
  b.part(crownG, GILT, { at: crownAt, rotation: crownTilt });
  const q = new THREE.Euler(...crownTilt.map((d) => (d * Math.PI) / 180) as [number, number, number]);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const p = new THREE.Vector3(Math.sin(a) * 0.18, 0.12, Math.cos(a) * 0.18).applyEuler(q);
    b.part(new THREE.ConeGeometry(0.045, 0.14, 4), GILT, {
      at: [crownAt[0] + p.x, crownAt[1] + p.y + 0.06, crownAt[2] + p.z],
      rotation: crownTilt,
    });
    const g = new THREE.Vector3(Math.sin(a) * 0.17, 0.05, Math.cos(a) * 0.17).applyEuler(q);
    glow(
      b.part(new THREE.OctahedronGeometry(0.03, 0), GEMS[i % 5], {
        at: [crownAt[0] + g.x, crownAt[1] + g.y + 0.02, crownAt[2] + g.z],
        flat: true,
      }),
      1,
    );
  }
  b.part(new THREE.TorusGeometry(0.17, 0.012, 4, 12), BRASS, {
    at: [crownAt[0], crownAt[1] + 0.005, crownAt[2]],
    rotation: [90 + crownTilt[0], crownTilt[1], crownTilt[2]],
  });

  // ---- goblets ----
  const gobletProfile = [[0, 0], [0.07, 0], [0.07, 0.015], [0.02, 0.04], [0.02, 0.13], [0.05, 0.15], [0.07, 0.22], [0.075, 0.3], [0.065, 0.3], [0.05, 0.2], [0, 0.17]].map(
    ([x, y]) => new THREE.Vector2(x, y),
  );
  const gobletG = new THREE.LatheGeometry(gobletProfile, 10);
  const gx = -0.55, gz = 0.5;
  b.part(gobletG, GILT, { at: [gx, heightAt(gx, gz) - 0.01, gz] });
  b.part(new THREE.TorusGeometry(0.07, 0.01, 4, 10), BRASS, { at: [gx, heightAt(gx, gz) + 0.29, gz], rotation: [90, 0, 0] });
  glow(b.part(new THREE.OctahedronGeometry(0.025, 0), "#e02850", { at: [gx, heightAt(gx, gz) + 0.16, gz + 0.055], flat: true }), 1);
  // second goblet tipped over
  const hx = -0.15, hzz = 0.85;
  b.part(gobletG, BRASS, { at: [hx, 0.075, hzz], rotation: [0, 30, 90 - 5] });
  b.part(new THREE.SphereGeometry(0.05, 6, 4), GILT, { at: [hx + 0.14, 0.02, hzz + 0.04], scale: [1, 0.4, 1] });
  // navy cushion under the crown glimpse
  b.part(new THREE.CylinderGeometry(0.2, 0.22, 0.03, 10), NAVY, { at: [crownAt[0], crownAt[1] - 0.06, crownAt[2]], rotation: crownTilt });

  void INK;
  return b.root;
}
```