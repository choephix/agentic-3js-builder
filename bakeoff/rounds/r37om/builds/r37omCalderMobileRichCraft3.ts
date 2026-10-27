import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";

export const meta = {
  name: "Calder Hanging Mobile",
  description:
    "An airy Alexander Calder-inspired hanging mobile of black wire, counterbalanced rods, and brightly painted abstract metal shapes.",
};

export default function build() {
  const b = createBuilder({ name: "calder-mobile", detail: 1 });

  const BLACK = "#17161b";
  const RED = "#e84132";
  const VERMILION = "#f05a35";
  const YELLOW = "#f4c928";
  const BLUE = "#2167a8";
  const CERULEAN = "#2c91bb";
  const WHITE = "#f2ead6";
  const PINK = "#d85d78";
  const ORANGE = "#ed8a2e";
  const GREEN = "#4b936b";

  const V3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const rod = (
    a: THREE.Vector3 | [number, number, number],
    c: THREE.Vector3 | [number, number, number],
    radius = 0.009,
    color = BLACK,
  ) => b.rod(a, c, radius, { color, caps: "round", name: "wire" });

  const bead = (
    p: THREE.Vector3 | [number, number, number],
    r: number,
    color = BLACK,
  ) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, {
      at: p,
      name: "counterweight",
      flat: true,
    });

  function polygonPoints(radius: number, count: number, phase = 0) {
    return Array.from({ length: count }, (_, i) => {
      const a = phase + (i / count) * Math.PI * 2;
      return [Math.cos(a) * radius, Math.sin(a) * radius] as [number, number];
    });
  }

  function plate(
    p: THREE.Vector3 | [number, number, number],
    radius: number,
    color: string,
    options: {
      count?: number;
      phase?: number;
      x?: [number, number, number];
      y?: [number, number, number];
      thickness?: number;
      name?: string;
    } = {},
  ) {
    return b.extrude(polygonPoints(radius, options.count ?? 9, options.phase ?? 0), {
      at: p,
      x: options.x ?? [1, 0, 0],
      y: options.y ?? [0, 1, 0],
      thickness: options.thickness ?? 0.012,
      bevel: 0.002,
      smoothing: 0,
      color,
      name: options.name ?? "painted-plate",
    });
  }

  function leaf(
    p: THREE.Vector3 | [number, number, number],
    w: number,
    h: number,
    color: string,
    x: [number, number, number] = [1, 0, 0],
    y: [number, number, number] = [0, 1, 0],
    phase = 0,
  ) {
    const outline: [number, number, "sharp"][] = [
      [-w * 0.5, -h * 0.32, "sharp"],
      [-w * 0.18, -h * 0.47, "sharp"],
      [w * 0.34, -h * 0.2, "sharp"],
      [w * 0.5, h * 0.18, "sharp"],
      [w * 0.2, h * 0.48, "sharp"],
      [-w * 0.18, h * 0.35, "sharp"],
      [-w * 0.5, -h * 0.05, "sharp"],
    ];
    const q = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(...y).normalize(),
      phase,
    );
    const xx = new THREE.Vector3(...x).applyQuaternion(q).toArray() as [
      number,
      number,
      number,
    ];
    const yy = new THREE.Vector3(...y).applyQuaternion(q).toArray() as [
      number,
      number,
      number,
    ];
    return b.extrude(outline, {
      at: p,
      x: xx,
      y: yy,
      thickness: 0.014,
      bevel: 0.003,
      smoothing: 0,
      color,
      name: "organic-calder-form",
    });
  }

  const sunTexture = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="43" fill="#f4c928"/>
      <circle cx="50" cy="50" r="25" fill="none" stroke="#17161b" stroke-width="4"/>
      <path d="M50 7v18M50 75v18M7 50h18M75 50h18M20 20l13 13M67 67l13 13M80 20L67 33M33 67L20 80"
        stroke="#17161b" stroke-width="4" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="7" fill="#e84132"/>
    </svg>`,
    { size: 128 },
  );

  const eyeTexture = svg(
    `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 40 Q60 2 112 40 Q60 78 8 40Z" fill="#f2ead6" stroke="#17161b" stroke-width="6"/>
      <circle cx="60" cy="40" r="22" fill="#2167a8" stroke="#17161b" stroke-width="5"/>
      <circle cx="60" cy="40" r="8" fill="#17161b"/>
      <circle cx="52" cy="31" r="5" fill="#ffffff"/>
      <path d="M13 37L3 27M18 30L10 17M104 30l8-13M109 37l10-10" stroke="#17161b" stroke-width="4"/>
    </svg>`,
    { size: 160 },
  );

  const stripeTexture = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#2167a8"/>
      <path d="M-10 20L20 -10M-10 55L55 -10M-10 90L90 -10M25 110L110 25M60 110L110 60"
        stroke="#f4c928" stroke-width="14"/>
      <path d="M0 0L100 100M-20 20L80 120" stroke="#17161b" stroke-width="4"/>
    </svg>`,
    { size: 128 },
  );

  const dotTexture = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#e84132"/>
      <circle cx="25" cy="25" r="10" fill="#f4c928"/>
      <circle cx="75" cy="25" r="10" fill="#f4c928"/>
      <circle cx="25" cy="75" r="10" fill="#f4c928"/>
      <circle cx="75" cy="75" r="10" fill="#f4c928"/>
      <circle cx="50" cy="50" r="13" fill="#17161b"/>
    </svg>`,
    { size: 128 },
  );

  const targetTexture = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#f2ead6"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#e84132" stroke-width="7"/>
      <circle cx="50" cy="50" r="22" fill="none" stroke="#2167a8" stroke-width="7"/>
      <circle cx="50" cy="50" r="7" fill="#17161b"/>
    </svg>`,
    { size: 128 },
  );

  const waveTexture = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#2c91bb"/>
      <path d="M-10 30 Q15 5 40 30 T90 30 T140 30 M-10 70 Q15 45 40 70 T90 70 T140 70"
        fill="none" stroke="#f2ead6" stroke-width="9"/>
      <path d="M-10 48 Q15 23 40 48 T90 48 T140 48"
        fill="none" stroke="#17161b" stroke-width="4"/>
    </svg>`,
    { size: 128 },
  );

  // ---------------------------------------------------------------------------
  // The suspended crown: a simple black wire loop and an intentionally visible
  // top hook. The mobile floats well above the floor.
  // ---------------------------------------------------------------------------

  rod([0, 2.72, 0], [0, 2.53, 0], 0.012);
  b.part(new THREE.TorusGeometry(0.075, 0.009, 6, 18), BLACK, {
    at: [0, 2.69, 0],
    rotation: [Math.PI / 2, 0, 0],
    name: "hanging-loop",
    flat: true,
  });
  rod([0, 2.53, 0], [0.02, 2.27, 0], 0.006);

  // First long balancing bar, with a warm sun and a blue counterweight.
  rod([-0.63, 2.25, 0.01], [0.63, 2.25, 0.01], 0.011);
  bead([-0.63, 2.25, 0.01], 0.026);
  bead([0.63, 2.25, 0.01], 0.021, BLACK);

  rod([-0.47, 2.25, 0.01], [-0.47, 1.96, 0.01], 0.004);
  plate([-0.47, 1.86, 0.01], 0.18, YELLOW, {
    count: 12,
    phase: Math.PI / 12,
    name: "sun-disc",
  });
  b.part(new THREE.PlaneGeometry(0.27, 0.27), "#ffffff", {
    at: [-0.47, 1.86, 0.020],
    dir: [0, 0, 1],
    axis: "z",
    texture: sunTexture,
    name: "sun-mark",
  });

  rod([0.48, 2.25, 0.01], [0.48, 1.92, 0.01], 0.004);
  plate([0.48, 1.79, 0.01], 0.14, BLUE, {
    count: 7,
    phase: 0.2,
    name: "blue-counterform",
  });
  rod([0.48, 1.79, 0.01], [0.68, 1.65, 0.01], 0.004);
  bead([0.68, 1.65, 0.01], 0.045, BLACK);

  // ---------------------------------------------------------------------------
  // Left middle branch: a red fan and a small yellow leaf balanced by a deep
  // blue angular plate.
  // ---------------------------------------------------------------------------

  rod([-0.47, 1.96, 0.01], [-1.08, 1.96, 0.01], 0.009);
  bead([-1.08, 1.96, 0.01], 0.018);
  rod([-0.78, 1.96, 0.01], [-0.78, 1.70, 0.01], 0.004);
  leaf([-0.78, 1.56, 0.01], 0.32, 0.36, RED, [1, 0, 0], [0, 1, 0], -0.14);
  rod([-0.78, 1.56, 0.01], [-0.70, 1.34, 0.01], 0.004);
  bead([-0.70, 1.32, 0.01], 0.032, BLACK);

  rod([-1.02, 1.96, 0.01], [-1.02, 1.68, 0.01], 0.004);
  plate([-1.02, 1.54, 0.01], 0.105, ORANGE, {
    count: 5,
    phase: Math.PI / 2,
    name: "orange-pentagon",
  });

  rod([-1.08, 1.96, 0.01], [-1.38, 1.77, 0.01], 0.005);
  plate([-1.48, 1.68, 0.01], 0.19, BLUE, {
    count: 6,
    phase: Math.PI / 6,
    name: "blue-hexagon",
  });
  b.part(new THREE.PlaneGeometry(0.24, 0.24), "#ffffff", {
    at: [-1.48, 1.68, 0.022],
    dir: [0, 0, 1],
    axis: "z",
    texture: stripeTexture,
    name: "blue-stripes",
  });

  // ---------------------------------------------------------------------------
  // Right middle branch: a long black wire carries a pink disc and a hanging
  // eye-like white medallion, giving the sculpture a face-like flash without
  // turning the whole work into a character.
  // ---------------------------------------------------------------------------

  rod([0.48, 1.92, 0.01], [1.18, 1.92, 0.01], 0.009);
  rod([0.82, 1.92, 0.01], [0.82, 1.57, 0.01], 0.004);
  plate([0.82, 1.43, 0.01], 0.14, PINK, {
    count: 10,
    phase: 0.1,
    name: "pink-medallion",
  });

  rod([1.16, 1.92, 0.01], [1.16, 1.58, 0.01], 0.004);
  plate([1.16, 1.41, 0.01], 0.18, WHITE, {
    count: 12,
    phase: Math.PI / 12,
    name: "eye-medallion",
  });
  b.part(new THREE.PlaneGeometry(0.25, 0.17), "#ffffff", {
    at: [1.16, 1.41, 0.022],
    dir: [0, 0, 1],
    axis: "z",
    texture: eyeTexture,
    name: "eye-mark",
  });

  rod([1.18, 1.92, 0.01], [1.47, 1.73, 0.01], 0.005);
  bead([1.56, 1.66, 0.01], 0.06, BLACK);

  // ---------------------------------------------------------------------------
  // A second, slightly rotated level behind the first. Its rods run in z so the
  // silhouette changes as the viewer moves around it.
  // ---------------------------------------------------------------------------

  rod([0.02, 2.27, -0.02], [0.02, 2.08, -0.02], 0.004);
  rod([-0.02, 2.08, -0.02], [-0.02, 2.08, -0.88], 0.009);
  rod([-0.02, 2.08, -0.02], [-0.02, 2.08, 0.72], 0.009);

  rod([-0.02, 2.08, -0.62], [-0.02, 1.83, -0.62], 0.004);
  leaf(
    [-0.02, 1.68, -0.62],
    0.30,
    0.44,
    CERULEAN,
    [1, 0, 0],
    [0, 1, 0],
    0.23,
  );

  rod([-0.02, 2.08, 0.48], [-0.02, 1.80, 0.48], 0.004);
  plate([-0.02, 1.66, 0.48], 0.13, RED, {
    count: 8,
    phase: Math.PI / 8,
    name: "rear-red-octagon",
  });
  b.part(new THREE.PlaneGeometry(0.18, 0.18), "#ffffff", {
    at: [-0.02, 1.66, 0.495],
    dir: [0, 0, 1],
    axis: "z",
    texture: dotTexture,
    name: "red-dots",
  });

  // Rear balancing arm and a bright white target shape.
  rod([-0.02, 2.08, -0.02], [0.56, 2.08, -0.02], 0.007);
  rod([0.56, 2.08, -0.02], [0.56, 1.72, -0.02], 0.004);
  plate([0.56, 1.58, -0.02], 0.17, WHITE, {
    count: 9,
    phase: 0.28,
    name: "target-disc",
  });
  b.part(new THREE.PlaneGeometry(0.24, 0.24), "#ffffff", {
    at: [0.56, 1.58, -0.038],
    dir: [0, 0, -1],
    axis: "z",
    texture: targetTexture,
    name: "target-mark",
  });

  // ---------------------------------------------------------------------------
  // Lower, more energetic tier. Thin wires and large shapes create the classic
  // Calder "impossible balance" silhouette.
  // ---------------------------------------------------------------------------

  rod([0.02, 1.73, 0.48], [0.02, 1.48, 0.48], 0.004);
  rod([0.02, 1.48, 0.48], [-0.50, 1.48, 0.48], 0.008);
  rod([0.02, 1.48, 0.48], [0.62, 1.48, 0.48], 0.008);

  rod([-0.40, 1.48, 0.48], [-0.40, 1.18, 0.48], 0.004);
  leaf([-0.40, 1.03, 0.48], 0.34, 0.62, ORANGE, [1, 0, 0], [0, 1, 0], -0.16);
  rod([-0.40, 1.03, 0.48], [-0.23, 0.79, 0.48], 0.004);
  bead([-0.20, 0.76, 0.48], 0.035, BLACK);

  rod([0.51, 1.48, 0.48], [0.51, 1.20, 0.48], 0.004);
  plate([0.51, 1.05, 0.48], 0.21, YELLOW, {
    count: 6,
    phase: Math.PI / 6,
    name: "lower-yellow-hex",
  });

  // A suspended blue wave behind the front shapes.
  rod([0.02, 1.48, 0.48], [0.02, 1.21, 0.48], 0.004);
  leaf([0.02, 1.00, 0.48], 0.40, 0.42, CERULEAN, [1, 0, 0], [0, 1, 0], 0.1);
  b.part(new THREE.PlaneGeometry(0.34, 0.20), "#ffffff", {
    at: [0.02, 1.00, 0.505],
    dir: [0, 0, 1],
    axis: "z",
    texture: waveTexture,
    name: "wave-mark",
  });

  // A small horizontal bar near the bottom adds one more counterbalanced
  // gesture and keeps the composition from becoming a stack of discs.
  rod([0.02, 1.21, 0.48], [0.02, 1.04, 0.48], 0.004);
  rod([-0.35, 1.04, 0.48], [0.35, 1.04, 0.48], 0.007);
  rod([-0.30, 1.04, 0.48], [-0.30, 0.78, 0.48], 0.004);
  plate([-0.30, 0.64, 0.48], 0.12, GREEN, {
    count: 7,
    phase: 0.1,
    name: "green-lower-form",
  });
  rod([0.28, 1.04, 0.48], [0.28, 0.79, 0.48], 0.004);
  plate([0.28, 0.67, 0.48], 0.10, RED, {
    count: 5,
    phase: Math.PI / 2,
    name: "red-lower-pentagon",
  });

  // Quiet black end caps, rivets, and a few tiny color tabs give the wirework
  // the hand-built, cut-sheet quality of a real Calder sculpture.
  bead([-0.02, 2.08, -0.88], 0.018);
  bead([-0.02, 2.08, 0.72], 0.018);
  bead([-0.02, 1.48, 0.48], 0.016);
  bead([0.02, 1.21, 0.48], 0.016);

  plate([-0.02, 2.39, 0], 0.045, RED, {
    count: 6,
    phase: 0,
    thickness: 0.008,
    name: "top-color-tab",
  });
  plate([0.18, 2.16, -0.01], 0.035, YELLOW, {
    count: 5,
    phase: 0.4,
    thickness: 0.008,
    name: "top-yellow-tab",
  });

  return b.root;
}
