```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "typewriter",
  description:
    "A red enamel desktop typewriter with a sloped cream keyboard, black keycaps, a platen with a sheet of typed paper, and a chrome carriage-return bar.",
};

const RED = "#c8402c";
const CREAM = "#f1e7cf";
const BLACK = "#1b1b1b";
const CHROME = "#c9ccd1";
const PAPER = "#fbf7ea";
const INK = "#2a2a2a";

const TILT = 0.3; // keyboard slope, radians (front edge lower)
const SIN = Math.sin(TILT);
const COS = Math.cos(TILT);
const TAN = SIN / COS;

// Point on the keyboard plate at depth z, lifted h metres along its normal.
const onKeys = (x: number, z: number, h: number): [number, number, number] => [
  x,
  0.171 - (z - 0.06) * TAN + h * COS,
  z + h * SIN,
];

// Paper leans back a little as it rises out of the platen.
const PAPER_TILT = -0.12;
const paperZ = (y: number) => -0.1 + (y - 0.32) * Math.sin(PAPER_TILT);

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  const rand = rng(7);

  // Skeleton: the machine body is the root; the platen carriage hangs off it.
  const body = b.joint("body", { at: [0, 0, 0] });
  const carriage = b.joint("carriage", { at: [0, 0.27, -0.12], parent: body });

  const put = (
    g: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    bone = body,
  ) => b.part(g, color, { at, bone });

  // ---- Feet and main housing ----
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      put(
        new THREE.CylinderGeometry(0.022, 0.024, 0.026, 10),
        BLACK,
        [sx * 0.19, 0.013, sz * 0.13],
      );
    }
  }
  put(new THREE.BoxGeometry(0.44, 0.11, 0.34), RED, [0, 0.08, 0]);

  // Cream side stripes on the housing.
  for (const sx of [-1, 1]) {
    put(new THREE.BoxGeometry(0.004, 0.03, 0.26), CREAM, [sx * 0.2215, 0.085, 0]);
  }

  // Sloped keyboard slab: top surface runs through (0, 0.165, 0.06), tilted down to the front.
  put(
    new THREE.BoxGeometry(0.40, 0.07, 0.22).rotateX(TILT),
    RED,
    [0, 0.1316, 0.0496],
  );

  // Cream keyboard plate on top of the slab.
  put(
    new THREE.BoxGeometry(0.36, 0.006, 0.2).rotateX(TILT),
    CREAM,
    [0, 0.16787, 0.06089],
  );

  // Front plaque.
  put(new THREE.BoxGeometry(0.09, 0.02, 0.004), CHROME, [0, 0.09, 0.172]);

  // ---- Keys ----
  const keyRows = [
    { z: 0.0, n: 11, x0: -0.18 },
    { z: 0.05, n: 10, x0: -0.162 },
    { z: 0.1, n: 11, x0: -0.18 },
  ];
  const capGeo = new THREE.CylinderGeometry(0.0095, 0.0105, 0.01, 12).rotateX(TILT);
  const dotGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.002, 8).rotateX(TILT);
  for (const row of keyRows) {
    for (let i = 0; i < row.n; i++) {
      const x = row.x0 + i * 0.036;
      put(capGeo.clone(), BLACK, onKeys(x, row.z, 0.005));
      put(dotGeo.clone(), CREAM, onKeys(x, row.z, 0.0105));
    }
  }
  // Space bar.
  put(
    new THREE.BoxGeometry(0.14, 0.008, 0.03).rotateX(TILT),
    BLACK,
    onKeys(0, 0.148, 0.004),
  );

  // ---- Ribbon spools on the housing, behind the keyboard ----
  for (const sx of [-1, 1]) {
    put(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16), BLACK, [sx * 0.12, 0.145, -0.1]);
    put(new THREE.CylinderGeometry(0.01, 0.01, 0.026, 10), CHROME, [sx * 0.12, 0.145, -0.1]);
  }

  // ---- Carriage frame: uprights rising from the housing to the platen ----
  for (const sx of [-1, 1]) {
    put(new THREE.BoxGeometry(0.02, 0.15, 0.03), RED, [sx * 0.19, 0.2, -0.14]);
  }

  // ---- Platen (rides the carriage joint) ----
  put(
    new THREE.CylinderGeometry(0.035, 0.035, 0.4, 18).rotateZ(Math.PI / 2),
    BLACK,
    [0, 0.27, -0.12],
    carriage,
  );
  for (const sx of [-1, 1]) {
    put(
      new THREE.CylinderGeometry(0.012, 0.012, 0.04, 10).rotateZ(Math.PI / 2),
      CHROME,
      [sx * 0.225, 0.27, -0.12],
      carriage,
    );
    put(
      new THREE.CylinderGeometry(0.016, 0.016, 0.006, 12).rotateZ(Math.PI / 2),
      BLACK,
      [sx * 0.25, 0.27, -0.12],
      carriage,
    );
  }

  // ---- Paper: a sheet fed up behind the platen, with typed lines ----
  put(
    new THREE.BoxGeometry(0.21, 0.24, 0.002).rotateX(PAPER_TILT),
    PAPER,
    [0, 0.32, -0.1],
    carriage,
  );

  const textLines = [0.4, 0.375, 0.35, 0.325];
  for (const y of textLines) {
    let x = -0.09;
    while (x < 0.09) {
      const w = 0.004 + rand() * 0.006;
      if (rand() > 0.18) {
        put(
          new THREE.BoxGeometry(w, 0.011, 0.001).rotateX(PAPER_TILT),
          INK,
          [x + w / 2, y, paperZ(y) + 0.0013],
          carriage,
        );
      }
      x += w + 0.003 + rand() * 0.003;
    }
  }

  // ---- Carriage-return bar on the right-hand side (chrome, with a black knob) ----
  put(
    new THREE.CylinderGeometry(0.006, 0.006, 0.19, 8).rotateX(Math.PI / 2),
    CHROME,
    [-0.215, 0.215, -0.025],
  );
  put(new THREE.SphereGeometry(0.018, 12, 8), BLACK, [-0.215, 0.215, 0.075]);
  put(new THREE.BoxGeometry(0.012, 0.02, 0.03), CHROME, [-0.205, 0.215, -0.12]);

  return b.root;
}
```