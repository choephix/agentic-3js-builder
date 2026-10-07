```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "sea-turtle",
  description: "A stylised green sea turtle: domed shell with hexagonal scutes, paddle flippers, a short head and a tapered tail.",
};

export default function build() {
  const b = createBuilder({ name: "sea-turtle" });
  const r = rng(7);

  // Palette
  const SHELL = "#4f7a3c";
  const SCUTE = "#b59a4c";
  const SKIN = "#5f8a55";
  const HEAD = "#6d9a5e";
  const PLASTRON = "#e8dba9";
  const BEAK = "#d9c27a";
  const DARK = "#1d2a22";
  const WHITE = "#f2f2ee";

  // Skeleton: root body joint at the centre of the shell
  const shellY = 0.2;
  b.joint("body", { at: [0, shellY, 0] });

  // Shell: a domed ellipsoid, flattened and stretched along the length
  const SHELL_RX = 0.45;
  const SHELL_RY = 0.16;
  const SHELL_RZ = 0.525;
  b.part(new THREE.SphereGeometry(0.5, 24, 14), SHELL, {
    at: [0, shellY, 0],
    scale: [SHELL_RX * 2, SHELL_RY * 2, SHELL_RZ * 2],
  });

  // Plastron: pale belly plate under the shell
  b.part(new THREE.SphereGeometry(0.5, 16, 8), PLASTRON, {
    at: [0, 0.13, 0],
    scale: [0.8, 0.14, 1.0],
  });

  // Height of the shell surface above a normalised point (s across, t along)
  const topY = (s: number, t: number) =>
    shellY + SHELL_RY * Math.sqrt(Math.max(0, 1 - s * s - t * t));

  // Hexagonal scutes laid on the dome in staggered rows
  for (let i = -2; i <= 2; i++) {
    const stagger = i % 2 === 0 ? 0 : 0.07;
    for (let j = -3; j <= 3; j++) {
      const s = i * 0.2;
      const t = j * 0.14 + stagger;
      if (s * s + t * t > 0.5) continue;
      const k = 0.92 + r() * 0.16;
      const x = SHELL_RX * s;
      const z = SHELL_RZ * t;
      const y = topY(s, t) + 0.004;
      b.part(new THREE.CylinderGeometry(1, 1, 1, 6), SCUTE, {
        at: [x, y, z],
        scale: [0.08 * k, 0.012, 0.08 * k],
      });
    }
  }

  // Shell rim: a row of small tabs around the edge
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x = Math.sin(a) * SHELL_RX * 0.98;
    const z = Math.cos(a) * SHELL_RZ * 0.98;
    b.part(new THREE.BoxGeometry(0.08, 0.04, 0.08), SCUTE, {
      at: [x, shellY - 0.01, z],
      scale: [1, 1, 1],
    });
  }

  // Neck: a chain from the front of the shell up to the head
  const neckPath = [
    [0, 0.22, 0.42],
    [0, 0.29, 0.58],
    [0, 0.37, 0.7],
  ];
  b.chain("neck", neckPath, { role: "neck" });
  b.sweep(neckPath, 0.068, { color: SKIN });

  // Head: slightly flattened, with a beak and eyes
  const headAt: [number, number, number] = [0, 0.38, 0.8];
  b.part(new THREE.SphereGeometry(0.12, 18, 12), HEAD, {
    at: headAt,
    scale: [0.95, 0.85, 1.25],
  });

  // Beak: a cone pointing forward
  b.part(new THREE.ConeGeometry(0.05, 0.1, 6), BEAK, {
    at: [0, 0.365, 0.92],
    aim: [0, 0.35, 1.2],
  });

  // Eyes: white sclera with a dark pupil set forward on each side
  for (const sx of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.03, 10, 8), WHITE, {
      at: [sx * 0.085, 0.41, 0.84],
    });
    b.part(new THREE.SphereGeometry(0.016, 8, 6), DARK, {
      at: [sx * 0.093, 0.412, 0.864],
    });
  }

  // Front flippers: long paddles swept out from the shoulders
  for (const sx of [1, -1]) {
    const name = sx > 0 ? "frontL" : "frontR";
    const path = [
      [sx * 0.3, 0.2, 0.3],
      [sx * 0.6, 0.17, 0.42],
      [sx * 0.85, 0.12, 0.56],
      [sx * 1.0, 0.1, 0.44],
    ];
    b.chain(name, path, { role: "fan" });
    b.sweep(path, 0.07, { color: SKIN });
    // Paddle tip
    b.part(new THREE.SphereGeometry(0.5, 12, 8), SKIN, {
      at: [sx * 1.0, 0.1, 0.44],
      scale: [0.18, 0.04, 0.09],
    });
  }

  // Rear flippers: smaller, angled back
  for (const sx of [1, -1]) {
    const name = sx > 0 ? "rearL" : "rearR";
    const path = [
      [sx * 0.26, 0.18, -0.3],
      [sx * 0.44, 0.13, -0.42],
      [sx * 0.52, 0.1, -0.6],
    ];
    b.chain(name, path, { role: "fan" });
    b.sweep(path, 0.06, { color: SKIN });
    b.part(new THREE.SphereGeometry(0.5, 12, 8), SKIN, {
      at: [sx * 0.52, 0.1, -0.6],
      scale: [0.12, 0.035, 0.08],
    });
  }

  // Tail: short and tapering, tucked behind the shell
  const tailPath = [
    [0, 0.18, -0.5],
    [0, 0.13, -0.66],
    [0, 0.1, -0.8],
  ];
  b.chain("tail", tailPath, { role: "tail" });
  b.sweep(tailPath, 0.045, { color: SKIN });

  return b.root;
}
```