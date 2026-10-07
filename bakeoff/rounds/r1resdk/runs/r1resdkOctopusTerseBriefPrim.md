```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Octopus",
  description: "Stylized rest-pose octopus with eight spread arms, bulbous mantle, eyes, beak and suckers.",
};

export default function build() {
  const b = createBuilder({ name: "octopus" });
  const R = rng(7);

  const C = {
    skin: "#d9573a",
    dark: "#a83a28",
    light: "#f0b79f",
    sucker: "#f6d8c8",
    white: "#f4efe0",
    pupil: "#16161c",
    gold: "#e8b030",
    beak: "#3a2a2a",
  };

  const root = b.joint("body", { at: [0, 0.3, 0] });
  const head = b.joint("head", { at: [0, 0.35, 0.08], parent: root });
  const mantle = b.joint("mantle", { at: [0, 0.5, -0.1], parent: root });
  b.joint("jaw", { at: [0, 0.2, 0.3], parent: head });

  const sph = (r: number, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);

  // Head and mantle
  b.part({ geo: sph(1, 12, 9), geometry: sph(1, 12, 9), color: C.skin, at: [0, 0.33, 0.06], scale: [0.3, 0.26, 0.3], bone: head } as any);
  b.part({ geo: sph(1, 12, 10), geometry: sph(1, 12, 10), color: C.skin, at: [0, 0.6, -0.16], scale: [0.27, 0.34, 0.32], bone: mantle } as any);
  b.part({ geo: sph(1, 8, 6), geometry: sph(1, 8, 6), color: C.dark, at: [0, 0.88, -0.2], scale: [0.14, 0.1, 0.16], bone: mantle } as any);

  // Mantle spots
  for (let i = 0; i < 14; i++) {
    const az = R() * Math.PI * 2;
    const el = 0.2 + R() * 1.1;
    const x = Math.sin(az) * Math.cos(el) * 0.275;
    const y = Math.sin(el) * 0.345;
    const z = Math.cos(az) * Math.cos(el) * 0.325;
    if (z > 0.1 && y < 0.4) continue;
    const s = 0.03 + R() * 0.03;
    b.part({ geo: sph(1, 6, 5), geometry: sph(1, 6, 5), color: C.dark, at: [x, 0.6 + y - 0.02, -0.16 + z], scale: [s, s * 0.6, s], bone: mantle } as any);
  }

  // Eyes
  for (const sx of [1, -1]) {
    b.part({ geo: sph(1, 8, 6), geometry: sph(1, 8, 6), color: C.skin, at: [sx * 0.25, 0.44, 0.2], scale: [0.1, 0.1, 0.1], bone: head } as any);
    b.part({ geo: sph(1, 8, 6), geometry: sph(1, 8, 6), color: C.gold, at: [sx * 0.29, 0.45, 0.25], scale: [0.065, 0.075, 0.065], bone: head } as any);
    b.part({ geo: new THREE.BoxGeometry(1, 1, 1), geometry: new THREE.BoxGeometry(1, 1, 1), color: C.pupil, at: [sx * 0.325, 0.45, 0.3], scale: [0.03, 0.07, 0.025], bone: head } as any);
    b.part({ geo: new THREE.BoxGeometry(1, 1, 1), geometry: new THREE.BoxGeometry(1, 1, 1), color: C.dark, at: [sx * 0.27, 0.52, 0.24], scale: [0.1, 0.025, 0.08], bone: head } as any);
  }

  // Beak: upper cone and lower
  b.part({ geo: new THREE.ConeGeometry(0.05, 0.1, 5), geometry: new THREE.ConeGeometry(0.05, 0.1, 5), color: C.beak, at: [0, 0.2, 0.31], bone: head, rotation: [Math.PI / 2 + 0.3, 0, 0] } as any);

  // Arms
  const N = 8;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + Math.PI / N;
    const side = i % 2 ? 1 : -1;
    const pts: number[][] = [];
    const K = 12;
    const L = 0.95 + (R() - 0.5) * 0.15;
    const tw = 0.4 + R() * 0.3;
    for (let k = 0; k <= K; k++) {
      const u = k / K;
      const aa = a + side * tw * u * u + Math.sin(u * 4 + i) * 0.06 * u;
      const r = 0.12 + u * L;
      const y = 0.05 + 0.22 * Math.pow(1 - u, 3) + (u > 0.85 ? (u - 0.85) * 0.25 : 0);
      pts.push([Math.sin(aa) * r, y + 0.0, Math.cos(aa) * r]);
    }
    pts[0][1] = 0.28;
    const chain: any = (b as any).chain(`arm${i}`, pts, { parent: root, role: "tentacle", count: 6 });
    (b as any).sweep(chain, {
      radius: (t: number) => 0.1 * Math.pow(1 - t, 0.8) + 0.014,
      color: C.skin,
      sides: 7,
    });
    // suckers
    for (let k = 3; k <= 10; k++) {
      const u = k / K;
      const p = pts[k];
      const rr = 0.1 * Math.pow(1 - u, 0.8) + 0.014;
      const s = rr * 0.38;
      b.part({
        geo: sph(1, 6, 5),
        geometry: sph(1, 6, 5),
        color: C.sucker,
        at: [p[0], Math.max(0.015, p[1] - rr * 0.75), p[2]],
        scale: [s, s * 0.6, s],
      } as any);
    }
  }

  return b.root;
}
```