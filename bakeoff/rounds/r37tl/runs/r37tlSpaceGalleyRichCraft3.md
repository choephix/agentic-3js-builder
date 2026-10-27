```ts
import * as THREE from "three";
import { createBuilder, rng, svg } from "agentic-3js-builder";

export const meta = {
  name: "Nostromo Alien Galley Kitchen",
  description:
    "A cramped industrial spaceship galley inspired by 1979 retro-futurist spacecraft interiors: ribbed bulkheads, stained steel cabinets, a central aisle, stove, sink, overhead lockers, pipes, gauges and amber control lights.",
};

export default function build() {
  const b = createBuilder({ name: "nostromoGalley", detail: 1 });

  const STEEL = "#596064";
  const DARK = "#252a2c";
  const DEEP = "#161a1b";
  const EDGE = "#8b918b";
  const IVORY = "#aaa997";
  const OLIVE = "#666958";
  const RUST = "#763f2e";
  const ORANGE = "#d26e2d";
  const AMBER = "#ffb52e";
  const RED = "#bb3025";
  const GREEN = "#8aa66a";
  const BLUE = "#557b86";
  const RUBBER = "#121414";
  const BRASS = "#a98245";

  const signTex = svg(
    `<svg viewBox="0 0 256 96" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="96" fill="#15191a"/>
      <rect x="6" y="6" width="244" height="84" fill="#8d8b75" stroke="#d3c99c" stroke-width="5"/>
      <text x="128" y="43" text-anchor="middle" font-family="monospace" font-size="24" font-weight="bold" fill="#202322">GALLEY</text>
      <text x="128" y="70" text-anchor="middle" font-family="monospace" font-size="13" fill="#202322">AUTHORIZED CREW ONLY</text>
    </svg>`,
    { size: 256 },
  );

  const warningTex = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" fill="#1a1c1c"/>
      <path d="M64 10 L118 108 H10 Z" fill="#c65f27" stroke="#e9bd55" stroke-width="6"/>
      <path d="M64 38 V73 M64 89 v5" stroke="#171818" stroke-width="10" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );

  const panelTex = svg(
    `<svg viewBox="0 0 256 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="128" fill="#1a2020"/>
      <g fill="none" stroke="#596b68" stroke-width="3">
        <path d="M16 20h224M16 42h224M16 64h224M16 86h224M16 108h224"/>
        <path d="M34 10v108M78 10v108M122 10v108M166 10v108M210 10v108"/>
      </g>
      <g fill="#b86d35"><rect x="22" y="25" width="10" height="10"/><rect x="88" y="47" width="10" height="10"/><rect x="176" y="69" width="10" height="10"/></g>
      <g fill="#86a36d"><circle cx="57" cy="97" r="5"/><circle cx="145" cy="31" r="5"/><circle cx="223" cy="97" r="5"/></g>
    </svg>`,
    { size: 256 },
  );

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    extra: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      flat: true,
      ...extra,
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    segments = 10,
    dir: [number, number, number] = [0, 1, 0],
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      dir,
      flat: true,
    });

  const rivet = (at: [number, number, number], color = EDGE, r = 0.018) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), color, { at, flat: true });

  const strip = (
    at: [number, number, number],
    size: [number, number, number],
    color = EDGE,
  ) => box(size, at, color);

  const pipe = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color = BRASS,
  ) => b.rod(a, c, radius, { color, section: { ngon: 8 }, caps: "round" });

  // Floor plate and central aisle.
  box([2.9, 0.08, 3.7], [0, 0.04, 0], DARK);
  box([1.12, 0.018, 3.42], [0, 0.095, 0], "#303536");
  for (let z = -1.55; z <= 1.55; z += 0.31) {
    strip([0, 0.108, z], [1.08, 0.008, 0.014], "#4c5351");
  }
  for (const x of [-0.57, 0.57]) {
    strip([x, 0.112, 0], [0.025, 0.012, 3.42], EDGE);
  }

  // Rear bulkhead, with a heavy rounded-looking ribbed frame.
  box([2.82, 2.48, 0.16], [0, 1.28, 1.78], OLIVE);
  box([2.5, 2.18, 0.05], [0, 1.31, 1.68], DEEP);
  for (const x of [-1.25, -0.88, -0.51, -0.14, 0.23, 0.6, 0.97, 1.25]) {
    box([0.07, 2.25, 0.11], [x, 1.3, 1.57], STEEL);
    rivet([x, 0.22, 1.48]);
    rivet([x, 2.38, 1.48]);
  }
  box([2.72, 0.12, 0.15], [0, 2.43, 1.58], EDGE);
  box([2.72, 0.12, 0.15], [0, 0.15, 1.58], EDGE);
  box([0.12, 2.28, 0.15], [-1.36, 1.29, 1.58], EDGE);
  box([0.12, 2.28, 0.15], [1.36, 1.29, 1.58], EDGE);

  // Side base cabinets and toe kicks.
  for (const s of [-1, 1]) {
    const x = s * 1.02;
    box([0.72, 0.92, 3.18], [x, 0.58, 0], IVORY);
    box([0.77, 0.16, 3.2], [x, 0.16, 0], DEEP);
    box([0.76, 0.11, 3.22], [x, 1.04, 0], EDGE);

    // Divided cabinet doors.
    for (const z of [-1.25, -0.42, 0.42, 1.25]) {
      box([0.66, 0.69, 0.045], [x, 0.59, z], "#77786c");
      strip([x, 0.59, z - 0.34], [0.52, 0.025, 0.018], DARK);
      strip([x, 0.59, z + 0.34], [0.52, 0.025, 0.018], DARK);
      for (const q of [-0.27, 0.27]) rivet([x + s * 0.33, 0.59, z + q], EDGE, 0.014);
      box([0.045, 0.09, 0.16], [x - s * 0.34, 0.63, z], BRASS);
    }
    // Countertop and backsplash.
    box([0.82, 0.13, 3.28], [x, 1.1, 0], DARK);
    box([0.78, 0.06, 3.2], [x, 1.18, 0], EDGE);
    box([0.78, 0.58, 3.18], [x, 1.38, 0], STEEL);
    for (const z of [-1.42, -0.7, 0, 0.7, 1.42])
      strip([x, 1.38, z], [0.73, 0.025, 0.018], "#383e3d");
  }

  // Left-hand sink, basin, drain and faucet.
  box([0.58, 0.08, 0.75], [-1.02, 1.185, -0.88], DEEP);
  box([0.47, 0.07, 0.61], [-1.02, 1.23, -0.88], "#343b3b");
  cyl(0.11, 0.018, [-1.02, 1.275, -0.88], DARK, 12);
  cyl(0.035, 0.012, [-1.02, 1.29, -0.88], EDGE, 8);
  pipe([-1.02, 1.25, -0.6], [-1.02, 1.63, -0.6], 0.035, BRASS);
  pipe([-1.02, 1.63, -0.6], [-1.02, 1.63, -0.88], 0.035, BRASS);
  cyl(0.06, 0.025, [-1.02, 1.18, -0.35], RED, 8);
  cyl(0.06, 0.025, [-1.02, 1.18, -1.42], BLUE, 8);

  // Right-hand cooktop and four chunky burners.
  box([0.64, 0.055, 1.3], [1.02, 1.205, -0.78], DEEP);
  for (const x of [0.86, 1.18]) {
    for (const z of [-1.08, -0.48]) {
      cyl(0.12, 0.035, [x, 1.255, z], "#4c514e", 12);
      cyl(0.075, 0.045, [x, 1.29, z], "#181b1b", 10);
      cyl(0.018, 0.05, [x, 1.33, z], ORANGE, 8);
    }
  }
  box([0.64, 0.09, 0.42], [1.02, 1.29, 0.35], "#343a39");
  for (const z of [0.23, 0.47]) {
    cyl(0.065, 0.04, [0.86, 1.36, z], BRASS, 10);
    cyl(0.065, 0.04, [1.18, 1.36, z], BRASS, 10);
  }
  for (const z of [0.14, 0.34, 0.54]) {
    box([0.045, 0.025, 0.08], [1.35, 1.3, z], z === 0.34 ? RED : GREEN);
  }

  // Under-counter kick illumination.
  for (const s of [-1, 1]) {
    box([0.05, 0.06, 2.55], [s * 0.61, 0.24, 0], s < 0 ? AMBER : "#6e9b8f");
  }

  // Upper cabinets on both sides, floating above the worktops.
  for (const s of [-1, 1]) {
    const x = s * 1.03;
    box([0.74, 0.7, 2.95], [x, 2.02, 0], OLIVE);
    box([0.8, 0.08, 3.03], [x, 2.39, 0], EDGE);
    box([0.8, 0.07, 3.03], [x, 1.67, 0], DARK);
    for (const z of [-1.08, -0.36, 0.36, 1.08]) {
      box([0.66, 0.54, 0.04], [x, 2.03, z], "#76786c");
      box([0.13, 0.04, 0.035], [x - s * 0.27, 2.03, z], BRASS);
      rivet([x + s * 0.29, 2.27, z], EDGE, 0.014);
    }
    // Vertical industrial seams.
    for (const z of [-1.45, -0.72, 0, 0.72, 1.45])
      strip([x + s * 0.385, 2.02, z], [0.02, 0.58, 0.025], DARK);
  }

  // Central overhead service spine.
  box([0.62, 0.34, 3.05], [0, 2.39, 0], DEEP);
  box([0.48, 0.09, 2.9], [0, 2.56, 0], STEEL);
  for (const z of [-1.28, -0.64, 0, 0.64, 1.28]) {
    box([0.32, 0.03, 0.28], [0, 2.63, z], "#242a2a");
    cyl(0.025, 0.03, [-0.13, 2.66, z], AMBER, 8);
    cyl(0.025, 0.03, [0.13, 2.66, z], z === 0 ? RED : GREEN, 8);
  }

  // Rear control station and illuminated status screen.
  box([1.55, 0.78, 0.12], [0, 1.65, 1.47], DARK);
  box([1.28, 0.5, 0.045], [0, 1.72, 1.395], "#202728", {
    texture: panelTex,
  });
  box([0.54, 0.25, 0.03], [0, 1.96, 1.37], OLIVE, { texture: signTex });
  for (const x of [-0.52, -0.26, 0.26, 0.52]) {
    cyl(0.045, 0.04, [x, 1.48, 1.38], x < 0 ? GREEN : ORANGE, 8, [0, 0, 1]);
  }
  for (const x of [-0.48, -0.16, 0.16, 0.48]) {
    box([0.12, 0.035, 0.08], [x, 1.35, 1.38], x === 0.16 ? RED : BRASS);
  }

  // Large warning placard on the rear bulkhead.
  box([0.32, 0.03, 0.32], [-1.05, 1.55, 1.69], "#bd6b32", { texture: warningTex });
  box([0.52, 0.03, 0.2], [0.9, 1.55, 1.69], "#8e8d78", { texture: signTex });

  // Exposed ceiling and wall pipework, characteristic of the cramped industrial set.
  pipe([-1.31, 1.58, -1.6], [-1.31, 2.45, -1.6], 0.045, BRASS);
  pipe([-1.31, 2.45, -1.6], [-0.42, 2.45, -1.6], 0.045, BRASS);
  pipe([-0.42, 2.45, -1.6], [-0.42, 2.45, 1.45], 0.045, BRASS);
  pipe([1.31, 1.53, 1.1], [1.31, 2.45, 1.1], 0.055, "#7a5141");
  pipe([1.31, 2.45, 1.1], [0.4, 2.45, 1.1], 0.055, "#7a5141");
  pipe([0.4, 2.45, 1.1], [0.4, 2.2, 1.1], 0.055, "#7a5141");
  for (const z of [-1.2, 0.1, 1.35]) {
    box([0.12, 0.12, 0.16], [-1.31, 1.75, z], RUST);
    rivet([-1.245, 1.75, z], EDGE, 0.018);
  }

  // Small hanging utensil rack and chunky alien-industrial utensils.
  box([0.04, 0.62, 0.04], [-0.6, 1.42, -1.52], EDGE);
  for (const x of [-0.72, -0.6, -0.48]) {
    pipe([x, 1.34, -1.52], [x, 1.04, -1.52], 0.014, BRASS);
    cyl(0.04, 0.16, [x, 0.96, -1.52], STEEL, 8);
  }

  // Three restrained deck-mounted stools / crash seats at the aisle end.
  for (const x of [-0.28, 0.28]) {
    box([0.34, 0.09, 0.34], [x, 0.88, -1.52], OLIVE);
    pipe([x, 0.84, -1.52], [x, 0.18, -1.52], 0.035, STEEL);
    pipe([x, 0.2, -1.52], [x - 0.18, 0.1, -1.52], 0.025, STEEL);
    pipe([x, 0.2, -1.52], [x + 0.18, 0.1, -1.52], 0.025, STEEL);
    rivet([x - 0.12, 0.94, -1.52], BRASS, 0.015);
    rivet([x + 0.12, 0.94, -1.52], BRASS, 0.015);
  }

  // Doorway-like front framing makes the group read as a ship interior module.
  box([0.16, 2.35, 0.16], [-1.42, 1.28, -1.78], EDGE);
  box([0.16, 2.35, 0.16], [1.42, 1.28, -1.78], EDGE);
  box([2.84, 0.16, 0.16], [0, 2.42, -1.78], EDGE);
  for (const y of [0.28, 0.78, 1.28, 1.78, 2.28]) {
    rivet([-1.42, y, -1.69], BRASS, 0.018);
    rivet([1.42, y, -1.69], BRASS, 0.018);
  }

  return b.root;
}
```