import * as THREE from "three";
import { createBuilder, catmull, rng } from "../../../../src/index";
import { countershade, mottle } from "../../../../src/index";

export const meta = {
  name: "reef octopus",
  description: "A grumpy coral-and-rust reef octopus with golden bar-pupil eyes, cream-suckered arms and a brass key held aloft.",
};

export default function build() {
  const b = createBuilder({ name: "reef-octopus" });

  const CORAL = "#c9583a";
  const RUST = "#8c3a22";
  const PALE = "#f2d2a9";
  const CREAM = "#f6ead0";
  const GOLD = "#e9b443";
  const DARK = "#2a1410";
  const BRASS = "#c99a3e";

  // Skeleton: one body joint the arms hang from.
  const body = b.joint("body", { at: [0, 0.3, 0] });

  // Bulbous mantle, mottled coral and pale.
  const mantle = b.part(new THREE.SphereGeometry(0.2, 12, 8), mottle(CORAL, PALE, { size: 0.09 }), {
    bone: body,
    scale: [1, 1.15, 1.05],
    flat: true,
    name: "mantle",
  });

  // Golden eyes with bar pupils and a grumpy, inward-sloping brow.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.045, 8, 6), GOLD, { bone: body, at: [s * 0.09, 0.34, 0.17] });
    b.part(new THREE.BoxGeometry(0.05, 0.011, 0.012), DARK, { bone: body, at: [s * 0.09, 0.34, 0.214] });
    b.part(new THREE.BoxGeometry(0.075, 0.016, 0.024), RUST, {
      bone: body,
      at: [s * 0.09, 0.392, 0.185],
      rotation: [0, 0, s * 20],
    });
  }

  // Little bumps over the mantle, kept clear of the eyes.
  const skin = b.surface(mantle);
  const r = rng(7);
  const eyeSpots = [new THREE.Vector3(0.09, 0.34, 0.17), new THREE.Vector3(-0.09, 0.34, 0.17)];
  for (const h of skin.scatter(90, {
    rng: r,
    minDist: 0.045,
    filter: (h) => h.n.y < 0.85 && h.at.y > 0.14 && eyeSpots.every((e) => h.at.distanceTo(e) > 0.09),
  })) {
    b.stick(new THREE.SphereGeometry(0.02, 5, 4), RUST, h, { embed: 0.4 });
  }

  const armCream = countershade(CORAL, CREAM, { level: -0.2 });
  const chains: any[] = [];
  const sweeps: any[] = [];

  // Arm 0: the one raised high, holding the key.
  const armPts0: number[][] = [
    [0.07, 0.16, 0.1],
    [0.14, 0.1, 0.2],
    [0.2, 0.07, 0.28],
    [0.24, 0.12, 0.34],
    [0.23, 0.3, 0.32],
    [0.22, 0.43, 0.25],
  ];
  // Procedural arms: spread around the mantle, curling sideways and back.
  for (let i = 1; i < 8; i++) {
    const th = (i * Math.PI) / 4 + 0.4;
    const d = [Math.sin(th), 0, Math.cos(th)];
    const side = [Math.cos(th), 0, -Math.sin(th)];
    const k = i % 2 ? 1 : -1;
    const jit = 0.85 + r() * 0.3;
    const P = (dist: number, sd: number, y: number) => [
      d[0] * dist + side[0] * sd,
      y,
      d[2] * dist + side[2] * sd,
    ];
    const pts = [
      P(0.1, 0, 0.17),
      P(0.2, 0.01 * k, 0.12),
      P(0.3, 0.04 * k * jit, 0.08),
      P(0.38, 0.1 * k, 0.07),
      P(0.4, 0.18 * k * jit, 0.1),
      P(0.36, 0.25 * k, 0.2),
      P(0.3, 0.26 * k, 0.3),
    ];
    const ch = b.chain(`arm${i}`, catmull(pts), { parent: body, count: 6, role: "tentacle" });
    chains[i] = ch;
    sweeps[i] = b.sweep(ch, (t: number) => 0.045 * (1 - t) + 0.013, { color: armCream });
    armPts0.length; // no-op keeps structure simple
  }
  {
    const ch = b.chain("arm0", catmull(armPts0), { parent: body, count: 6, role: "tentacle" });
    chains[0] = ch;
    sweeps[0] = b.sweep(ch, (t: number) => 0.045 * (1 - t) + 0.013, { color: armCream });
  }

  // Cream suckers in two rows along each arm's underside.
  for (let i = 0; i < 8; i++) {
    for (const t of [0.14, 0.24, 0.34, 0.44, 0.54, 0.64, 0.74, 0.84]) {
      for (const deg of [120, 240]) {
        b.stick(new THREE.CylinderGeometry(0.011, 0.011, 0.007, 6), CREAM, sweeps[i].at(t, deg), {
          embed: 0.3,
        });
      }
    }
  }

  // The brass key, held by the raised arm's tip.
  const tipJ = chains[0].joints[chains[0].joints.length - 1];
  const K = [0.22, 0.44, 0.27];
  b.part(new THREE.TorusGeometry(0.03, 0.008, 6, 14), BRASS, { bone: tipJ, at: K });
  b.part(new THREE.BoxGeometry(0.012, 0.13, 0.012), BRASS, {
    bone: tipJ,
    at: [K[0], K[1] - 0.095, K[2]],
  });
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.012), BRASS, {
    bone: tipJ,
    at: [K[0] + 0.01, K[1] - 0.12, K[2]],
  });
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.012), BRASS, {
    bone: tipJ,
    at: [K[0] + 0.01, K[1] - 0.15, K[2]],
  });

  return b.root;
}
