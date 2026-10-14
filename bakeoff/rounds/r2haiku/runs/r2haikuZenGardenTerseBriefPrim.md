```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

// Top of the raked gravel bed. Everything in the garden sits on it.
const G = 0.34;

export const meta = {
  name: "Japanese garden",
  description:
    "A small stylised Japanese garden: raked gravel, koi pond with a taiko bridge, stone lantern, clipped pine, bamboo grove, rock group and an open pavilion.",
};

export default function build() {
  const b = createBuilder({ name: "japanese-garden" });

  const put = (
    geo: THREE.BufferGeometry,
    color: string,
    x: number,
    y: number,
    z: number,
  ) => {
    b.part(geo, color, { at: [x, y, z] });
  };

  // ---- Base: dark wooden tray with raked gravel bed (4 x 3 m) ----
  put(new THREE.BoxGeometry(4.1, 0.3, 3.1), "#6b4a2e", 0, 0.15, 0);
  put(new THREE.BoxGeometry(4.0, 0.04, 3.0), "#d9cfb4", 0, G - 0.02, 0);

  // Raked rings in the gravel, concentric with the pond
  for (const r of [1.1, 1.3]) {
    const ring = new THREE.TorusGeometry(r, 0.012, 4, 96).rotateX(Math.PI / 2);
    put(ring, "#c7bda6", 0.5, G + 0.002, 0.1);
  }

  // ---- Koi pond ----
  put(new THREE.CylinderGeometry(0.8, 0.8, 0.02, 24), "#2f6f8a", 0.5, G, 0.1);
  put(
    new THREE.SphereGeometry(0.06, 8, 6).scale(1, 0.4, 2.2),
    "#e0622e",
    0.3,
    G + 0.012,
    0.0,
  );
  put(
    new THREE.SphereGeometry(0.06, 8, 6).scale(1, 0.4, 2.2).rotateY(0.7),
    "#f4f1ea",
    0.75,
    G + 0.012,
    0.35,
  );
  put(
    new THREE.SphereGeometry(0.06, 8, 6).scale(1, 0.4, 2.2).rotateY(-0.4),
    "#e0622e",
    0.45,
    G + 0.012,
    0.3,
  );
  put(
    new THREE.CylinderGeometry(0.1, 0.1, 0.01, 10),
    "#4f7d3c",
    0.9,
    G + 0.016,
    -0.3,
  );

  // ---- Taiko bridge: arched planks over the pond ----
  const R = 0.8;
  const bridgeX = 0.5;
  const bridgeZ = 0.1;
  put(
    new THREE.TorusGeometry(R, 0.035, 6, 32, Math.PI).scale(1, 0.6, 1),
    "#5b3c25",
    bridgeX,
    G,
    bridgeZ,
  );
  const planks = 16;
  for (let i = 0; i < planks; i++) {
    const t = (Math.PI * (i + 0.5)) / planks;
    const dx = -R * Math.sin(t);
    const dy = 0.6 * R * Math.cos(t);
    const phi = Math.atan2(dy, dx);
    const plank = new THREE.BoxGeometry(0.15, 0.025, 0.46).rotateZ(phi);
    put(
      plank,
      "#8a5a35",
      bridgeX + R * Math.cos(t),
      G + 0.6 * R * Math.sin(t),
      bridgeZ,
    );
  }

  // ---- Stepping stones ----
  const stones: [number, number][] = [
    [-1.0, 1.15],
    [-0.7, 0.95],
    [-0.4, 0.8],
  ];
  for (const [x, z] of stones) {
    put(new THREE.CylinderGeometry(0.16, 0.18, 0.05, 9), "#8a8478", x, G + 0.02, z);
  }

  // ---- Rock group with moss ----
  put(
    new THREE.DodecahedronGeometry(0.35, 0).scale(1.1, 0.75, 0.9),
    "#7b7d80",
    1.3,
    G + 0.2,
    0.75,
  );
  put(
    new THREE.DodecahedronGeometry(0.15, 0).scale(1.2, 0.3, 1.1),
    "#5f7d3a",
    1.3,
    G + 0.44,
    0.75,
  );
  put(
    new THREE.DodecahedronGeometry(0.22, 0).scale(1, 0.8, 1),
    "#5c5f65",
    1.0,
    G + 0.12,
    1.0,
  );
  put(
    new THREE.DodecahedronGeometry(0.28, 0).scale(1, 0.7, 1.1),
    "#5c5f65",
    1.75,
    G + 0.14,
    0.4,
  );

  // ---- Stone lantern (tōrō) ----
  const lx = -0.5;
  const lz = 0.5;
  const stone = "#b9b2a0";
  put(new THREE.BoxGeometry(0.24, 0.06, 0.24), stone, lx, G + 0.03, lz);
  put(new THREE.CylinderGeometry(0.06, 0.08, 0.2, 6), stone, lx, G + 0.16, lz);
  put(new THREE.BoxGeometry(0.22, 0.2, 0.22), stone, lx, G + 0.36, lz);
  put(new THREE.BoxGeometry(0.12, 0.12, 0.02), "#f2b453", lx, G + 0.36, lz + 0.12);
  put(
    new THREE.CylinderGeometry(0.05, 0.2, 0.12, 4).rotateY(Math.PI / 4),
    "#6f6a62",
    lx,
    G + 0.52,
    lz,
  );
  put(new THREE.SphereGeometry(0.035, 6, 4), "#8c8377", lx, G + 0.62, lz);

  // ---- Clipped pine on a mound ----
  const px = 1.35;
  const pz = -0.8;
  put(
    new THREE.SphereGeometry(0.5, 8, 6).scale(1, 0.2, 1),
    "#6e8a4a",
    px,
    G,
    pz,
  );
  put(new THREE.CylinderGeometry(0.05, 0.09, 1.0, 6), "#5a3e2b", px, G + 0.5, pz);
  const pads: [number, number, number, number][] = [
    // [dx, dy, dz, radius]
    [0, 0.95, 0, 0.4],
    [-0.15, 1.1, 0.05, 0.3],
    [0.45, 1.2, -0.2, 0.3],
    [0, 1.3, -0.05, 0.22],
  ];
  for (const [dx, dy, dz, r] of pads) {
    put(
      new THREE.IcosahedronGeometry(r, 0).scale(1.5, 0.28, 1.1),
      "#2f5d3a",
      px + dx,
      G + dy,
      pz + dz,
    );
  }

  // ---- Bamboo grove, front-left corner ----
  const poles: [number, number, number][] = [
    // [x, z, height]
    [-1.6, 0.7, 2.4],
    [-1.75, 0.95, 2.1],
    [-1.9, 0.6, 2.6],
    [-1.7, 1.15, 1.9],
    [-1.55, 1.2, 2.2],
  ];
  for (const [x, z, H] of poles) {
    put(new THREE.CylinderGeometry(0.026, 0.03, H, 6), "#7e9e4a", x, G + H / 2, z);
    for (const f of [0.3, 0.6, 0.85]) {
      put(
        new THREE.CylinderGeometry(0.034, 0.034, 0.025, 6),
        "#4d6b2a",
        x,
        G + H * f,
        z,
      );
    }
    put(
      new THREE.SphereGeometry(0.12, 6, 4).scale(1.4, 0.35, 0.8),
      "#5f8a3a",
      x,
      G + H - 0.05,
      z,
    );
  }

  // ---- Open pavilion, back-left ----
  const cx = -1.0;
  const cz = -0.85;
  const wood = "#a9825a";
  put(new THREE.BoxGeometry(1.2, 0.08, 0.9), wood, cx, G + 0.04, cz);
  for (const sx of [-0.5, 0.5]) {
    for (const sz of [-0.38, 0.38]) {
      put(
        new THREE.BoxGeometry(0.07, 0.9, 0.07),
        "#5a3e2b",
        cx + sx,
        G + 0.53,
        cz + sz,
      );
    }
  }
  put(new THREE.BoxGeometry(1.0, 0.7, 0.03), "#7a4e2e", cx, G + 0.43, cz - 0.36);
  put(
    new THREE.CylinderGeometry(0.15, 0.8, 0.45, 4).rotateY(Math.PI / 4).scale(1.3, 1, 1),
    "#2b2f36",
    cx,
    G + 1.205,
    cz,
  );
  put(new THREE.SphereGeometry(0.05, 6, 4), "#8c8377", cx, G + 1.45, cz);

  return b.root;
}
```