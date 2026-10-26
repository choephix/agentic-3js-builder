<!-- call: stage1 -->

```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";

export const meta = {
  name: "Supermarine Spitfire (cyanotype)",
  description:
    "Spitfire fighter in cyanotype blueprint style: Prussian-blue airframe with paper-white linework, elliptical wings, three-blade prop, retractable gear shown down.",
};

// ---- Cyanotype palette (top-level so stage 2 can use the names) ----
export const PRUSSIAN = "#0b3a6e";
export const BLUE_MID = "#1c5ea8";
export const BLUE_LIGHT = "#4f97d6";
export const PAPER = "#e8f3fb";
export const LINE = "#bfe0f5";
export const DEEP = "#06284d";
export const GLASS = "#8fd0ee";

export const REQUESTS = [
  {
    id: "roundelFuselage",
    kind: "add",
    part: "fuselage",
    what: "Fuselage roundel on the left side aft of the cockpit: concentric thin discs in PAPER, BLUE_LIGHT and PRUSSIAN with a fine LINE outline ring, drawn like a blueprint symbol, seated flat on the skin.",
    at: [0.5, 1.85, -2.7],
    normal: [1, 0, 0],
    bone: null,
    room: [0.1, 0.9, 0.9],
  },
  {
    id: "roundelWingTop",
    kind: "add",
    part: "wingL",
    what: "Wing roundel on the upper surface of the left wing: concentric discs PAPER, BLUE_LIGHT, DEEP with a LINE ring, plus a pair of tiny dimension ticks.",
    at: [3.0, 1.23, 0.0],
    normal: [0, 1, 0],
    bone: null,
    room: [1.1, 0.1, 1.1],
  },
  {
    id: "exhaustStacks",
    kind: "add",
    part: "fuselage",
    what: "Two rows of six fishtail exhaust stacks on each side of the engine cowl: small PAPER-edged DEEP tubes with flared ends, angled backwards, in rows.",
    at: [0.5, 1.95, 2.0],
    normal: [1, 0, 0],
    bone: null,
    room: [0.25, 0.4, 1.4],
  },
  {
    id: "cowlGuns",
    kind: "add",
    part: "wingL",
    what: "Cannon and machine-gun fittings: wing leading-edge fairing bumps with blast tubes, ejector-chute slits on the underside, and thin barrel sleeves in LINE and DEEP.",
    at: [2.6, 1.2, 1.3],
    normal: [0, 0, 1],
    bone: null,
    room: [1.0, 0.4, 1.2],
  },
  {
    id: "radiatorGrille",
    kind: "add",
    part: "radiatorL",
    what: "Radiator intake face: a honeycomb grille of thin LINE bars in a DEEP frame, with a small flap at the rear lip.",
    at: [2.9, 0.88, 0.55],
    normal: [0, 0, 1],
    bone: null,
    room: [0.6, 0.4, 0.2],
  },
  {
    id: "canopyFrame",
    kind: "add",
    part: "canopy",
    what: "Canopy framing: slim PAPER ribs, windscreen armoured glass panel frame, a rear-view mirror bump on top and a sliding-hood rail on each side.",
    at: [0, 2.35, -0.3],
    normal: [0, 1, 0],
    bone: null,
    room: [0.9, 0.6, 2.2],
  },
  {
    id: "propHub",
    kind: "add",
    part: "spinner",
    what: "Propeller hub details: a spinner back-plate ring in DEEP, six bolt heads in PAPER, and blade root cuffs in LINE on the three blades.",
    at: [0, 1.75, 3.25],
    normal: [0, 0, 1],
    bone: "prop",
    room: [0.9, 0.9, 0.4],
  },
  {
    id: "gearDetails",
    kind: "add",
    part: "legL",
    what: "Undercarriage detail: oleo scissor links, a brake line, hub bolts and a gear door panel with hinge in BLUE_LIGHT on the left leg and wheel.",
    at: [1.95, 0.7, 0.45],
    normal: [1, 0, 0],
    bone: null,
    room: [0.5, 0.9, 0.6],
  },
  {
    id: "pitotAerial",
    kind: "add",
    part: "wingR",
    what: "Pitot tube on the right wing leading edge (thin LINE rod with a DEEP tip) and a radio mast with aerial wires running to the fin top.",
    at: [-3.6, 1.2, 1.2],
    normal: [0, 0, 1],
    bone: null,
    room: [0.3, 0.3, 0.8],
  },
  {
    id: "tailWheelDetail",
    kind: "add",
    part: "tailstrut",
    what: "Tail wheel fork and small spring oleo, plus a fairing at the fuselage underside in BLUE_MID.",
    at: [0, 0.6, -4.7],
    normal: [0, 0, -1],
    bone: null,
    room: [0.4, 0.9, 0.5],
  },
  {
    id: "fuselageDraft",
    kind: "texture",
    part: "fuselage",
    what: "Blueprint drafting look on fuselage sides: PAPER panel lines, rivet dot rows, stencilled station numbers and a fine dashed centre line, over the BLUE_MID base.",
  },
  {
    id: "wingRibs",
    kind: "texture",
    part: "wingL and wingR",
    what: "Wing upper skin: fine PAPER rib and spar lines, hatch marks near the roots, and walkway rectangles, in cyanotype style with BLUE_LIGHT highlights.",
  },
  {
    id: "rudderMarks",
    kind: "texture",
    part: "rudder",
    what: "Rudder: fabric rib stripes in LINE, a hinge-line dashed edge and the stencilled word 'SPITFIRE Mk I' in PAPER.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "spitfire" });
  const root = b.joint("fuselage", { at: [0, 1.8, 0], dir: [0, 0, 1] });
  const prop = b.joint("prop", { parent: root, at: [0, 1.75, 3.1], dir: [0, 0, 1], role: "hinge" });
  const rudderJ = b.joint("rudder", { parent: root, at: [0, 1.85, -5.0], dir: [0, 1, 0], role: "hinge" });

  // ---- Fuselage ----
  b.loft(
    [
      { at: [0, 1.75, 3.0], w: 0.5, h: 0.55 },
      { at: [0, 1.75, 2.4], w: 0.85, h: 0.95 },
      { at: [0, 1.8, 1.2], w: 1.0, h: 1.2 },
      { at: [0, 1.8, 0], w: 0.95, h: 1.25 },
      { at: [0, 1.75, -1.2], w: 0.8, h: 1.05 },
      { at: [0, 1.7, -2.6], w: 0.55, h: 0.75 },
      { at: [0, 1.75, -4.0], w: 0.3, h: 0.45 },
      { at: [0, 1.85, -5.1], w: 0.15, h: 0.3 },
    ],
    { color: BLUE_MID, bone: root, name: "fuselage" },
  );
  // Spine strip and cowl band
  b.part(new THREE.BoxGeometry(0.1, 0.04, 3.6), BLUE_LIGHT, { bone: root, at: [0, 2.43, -0.8], name: "spine" });
  b.part(new THREE.CylinderGeometry(0.42, 0.45, 0.08, 14), LINE, { bone: root, at: [0, 1.75, 2.75], dir: [0, 0, 1], name: "cowlRing" });

  // ---- Spinner & prop ----
  b.part(new THREE.ConeGeometry(0.3, 0.75, 12), LINE, { bone: prop, at: [0, 1.75, 3.45], dir: [0, 0, 1], name: "spinner" });
  b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.12, 12), DEEP, { bone: prop, at: [0, 1.75, 3.1], dir: [0, 0, 1], name: "spinnerBase" });
  for (let k = 0; k < 3; k++) {
    const a = (k * 120 * Math.PI) / 180;
    const deg = k * 120;
    const dx = -Math.sin(a);
    const dy = Math.cos(a);
    b.part(new THREE.BoxGeometry(0.22, 1.5, 0.045), PAPER, {
      bone: prop, at: [dx * 0.95, 1.75 + dy * 0.95, 3.25], rotation: [0, 0, deg], name: "blade" + k,
    });
    b.part(new THREE.BoxGeometry(0.23, 0.3, 0.05), DEEP, {
      bone: prop, at: [dx * 1.55, 1.75 + dy * 1.55, 3.25], rotation: [0, 0, deg], name: "bladeTip" + k,
    });
  }

  // ---- Canopy ----
  b.part(new THREE.SphereGeometry(1, 12, 8), GLASS, {
    bone: root, at: [0, 2.35, -0.3], scale: [0.4, 0.32, 1.1], name: "canopy",
  });
  b.part(new THREE.BoxGeometry(0.62, 0.3, 0.1), GLASS, {
    bone: root, at: [0, 2.35, 0.95], rotation: [-35, 0, 0], name: "windscreen",
  });
  for (const z of [0.7, -0.3, -1.2]) {
    b.part(new THREE.BoxGeometry(0.7, 0.04, 0.05), PAPER, { bone: root, at: [0, 2.5 - Math.abs(z) * 0.03, z], name: "canopyRib" });
  }

  // ---- Wings ----
  const chord = (x: number) => 2.5 * Math.sqrt(Math.max(0, 1 - (x / 5.6) ** 2));
  const WY = 1.15;
  const wingPts: [number, number][] = [];
  const N = 12;
  for (let i = 0; i <= N; i++) {
    const x = 0.1 + (i * 5.3) / N;
    wingPts.push([x, 0.3 + 0.25 * chord(x)]);
  }
  for (let i = N; i >= 0; i--) {
    const x = 0.1 + (i * 5.3) / N;
    wingPts.push([x, 0.3 - 0.75 * chord(x)]);
  }
  const ailPts: [number, number][] = [];
  for (let i = 0; i <= 6; i++) {
    const x = 3.2 + (i * 2.1) / 6;
    ailPts.push([x, 0.3 - 0.75 * chord(x) + 0.5]);
  }
  for (let i = 6; i >= 0; i--) {
    const x = 3.2 + (i * 2.1) / 6;
    ailPts.push([x, 0.3 - 0.75 * chord(x)]);
  }
  const tailPts: [number, number][] = [];
  const tc = (x: number) => 1.5 * Math.sqrt(Math.max(0, 1 - (x / 2) ** 2));
  for (let i = 0; i <= 6; i++) {
    const x = 0.1 + (i * 1.75) / 6;
    tailPts.push([x, 0.35 * tc(x)]);
  }
  for (let i = 6; i >= 0; i--) {
    const x = 0.1 + (i * 1.75) / 6;
    tailPts.push([x, -0.65 * tc(x)]);
  }

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.extrude(wingPts, { at: [0, WY, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.14, bevel: 0.03, color: BLUE_MID, bone: root, name: "wing" + side });
    b.extrude(ailPts, { at: [0, WY, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.17, color: BLUE_LIGHT, bone: root, name: "aileron" + side });
    b.extrude(tailPts, { at: [0, 1.85, -4.4], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.07, bevel: 0.015, color: BLUE_MID, bone: root, name: "tailplane" + side });
    // wing tip stripe
    b.part(new THREE.BoxGeometry(0.35, 0.16, 0.5), PAPER, { bone: root, at: [s * 5.3, WY, 0.05 - 0.12], name: "tipCap" + side });
    // rib lines
    for (let i = 1; i <= 8; i++) {
      const x = 0.7 + i * 0.55;
      if (x > 5.0) break;
      const c = chord(x);
      b.part(new THREE.BoxGeometry(0.025, 0.01, c * 0.85), LINE, {
        bone: root, at: [s * x, WY + 0.077, 0.3 - 0.25 * c + 0.0], name: "ribLine",
      });
    }
    // cannons
    for (const x of [2.6, 3.3]) {
      const le = 0.3 + 0.25 * chord(x);
      b.rod([s * x, WY + 0.02, le - 0.3], [s * x, WY + 0.02, le + 0.85], 0.04, DEEP, { bone: root, name: "barrel" + side });
      b.part(new THREE.BoxGeometry(0.16, 0.16, 0.3), PRUSSIAN, { bone: root, at: [s * x, WY + 0.02, le + 0.05], name: "gunBump" + side });
    }
    // radiators
    const rw = s > 0 ? 0.65 : 0.48;
    b.part(new THREE.BoxGeometry(rw, 0.36, 0.95), DEEP, { bone: root, at: [s * 2.95, 0.88, 0.45], name: "radiator" + side });
    b.part(new THREE.BoxGeometry(rw * 0.7, 0.2, 0.04), LINE, { bone: root, at: [s * 2.95, 0.88, 0.94], name: "radiatorMouth" + side });
    // gear
    b.rod([s * 1.9, 1.1, 0.4], [s * 2.0, 0.4, 0.5], 0.055, PAPER, { bone: root, name: "leg" + side });
    b.part(new THREE.CylinderGeometry(0.38, 0.38, 0.2, 14), DEEP, { bone: root, at: [s * 2.1, 0.38, 0.5], dir: [1, 0, 0], name: "wheel" + side });
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.22, 10), LINE, { bone: root, at: [s * 2.1, 0.38, 0.5], dir: [1, 0, 0], name: "hub" + side });
    b.part(new THREE.BoxGeometry(0.05, 0.7, 0.6), BLUE_LIGHT, { bone: root, at: [s * 1.55, 0.75, 0.45], name: "gearDoor" + side });
  }

  // ---- Tail ----
  b.extrude(
    [[-0.8, 0], [0.3, 0], [-0.3, 1.5], [-0.75, 1.55]],
    { at: [0, 1.85, -4.2], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.1, bevel: 0.02, color: BLUE_MID, bone: root, name: "fin" },
  );
  b.extrude(
    [[0, 0], [-0.4, 0.05], [-0.5, 0.7], [-0.3, 1.35], [0.05, 1.55]],
    { at: [0, 1.85, -5.0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.07, color: BLUE_LIGHT, bone: rudderJ, name: "rudder" },
  );
  b.rod([0, 1.65, -4.6], [0, 0.14, -4.75], 0.04, PAPER, { bone: root, name: "tailstrut" });
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.07, 10), DEEP, { bone: root, at: [0, 0.13, -4.75], dir: [1, 0, 0], name: "tailWheel" });

  for (const add of STAGE2) add(b);
  return b.root;
}
```

<!-- call: texture -->

- **fuselageDraft**: the fuselage gets a paint with PAPER panel seams on the sides, rivet dot rows along them, a dashed centre line and station tick bars on top, BLUE_LIGHT sheen on upward faces, and DEEP shading underneath.
- **wingRibs**: the wing skin gets a paint keyed to the outline coordinates, with PAPER rib lines, a spar line, root hatch marks, a darker walkway rectangle, and a BLUE_LIGHT leading-edge highlight.
- **rudderMarks**: the rudder gets a paint with LINE fabric rib stripes and a dashed hinge-line edge. A small SVG decal plane on its left side carries the stencilled "SPITFIRE Mk I" in PAPER.

<<<<<<< SEARCH
import { createBuilder } from "agentic-3js-builder";
=======
import { createBuilder, paint, mix, smoothstep, svg } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
export const STAGE2: ((b: Builder) => void)[] = [];
=======
export const STAGE2: ((b: Builder) => void)[] = [];

const fr = (x: number) => x - Math.floor(x);

const FUSE_PAINT = paint((p, n) => {
  let c = mix(BLUE_MID, DEEP, 0.55 * smoothstep(0.2, -0.9, n.y));
  c = mix(c, BLUE_LIGHT, 0.35 * smoothstep(0.5, 1, n.y));
  if (Math.abs(n.x) > 0.45) {
    const dz = fr(p.z / 0.6) * 0.6;
    const dy = fr((p.y - 1.2) / 0.3) * 0.3;
    if (dz < 0.008 || dy < 0.006) return mix(c, PAPER, 0.75);
    const along = (v: number) => Math.abs(fr(v / 0.06) - 0.5) * 0.06;
    if (Math.hypot(dz - 0.03, along(p.y)) < 0.006 || Math.hypot(dy - 0.03, along(p.z)) < 0.005)
      return mix(c, PAPER, 0.9);
  } else if (n.y > 0.5) {
    if (Math.abs(p.x) < 0.007 && fr(p.z / 0.16) < 0.55) return LINE;
    if (Math.abs(fr(p.z / 0.5) - 0.5) < 0.015 && Math.abs(p.x) < 0.07) return PAPER;
  }
  return c;
});

const WING_PAINT = paint((p, n, s) => {
  const x = s[0];
  const y = s[1];
  let c = mix(BLUE_MID, BLUE_LIGHT, 0.55 * smoothstep(0.1, 0.5, y));
  if (Math.abs(n.y) < 0.5) return mix(c, PAPER, 0.5);
  if (Math.abs(fr((x - 0.1) / 0.55) - 0.5) > 0.485 && x > 0.1 && x < 5.2) return PAPER;
  if (Math.abs(y - 0.0) < 0.012) return LINE;
  if (x < 1.0 && x > 0.15 && y < 0.05 && Math.abs(fr((x + y) / 0.07) - 0.5) < 0.1) return mix(c, PAPER, 0.8);
  if (x > 0.35 && x < 1.5 && y > -0.55 && y < -0.2) {
    const edge = x < 0.38 || x > 1.47 || y < -0.52 || y > -0.23;
    return edge ? PAPER : mix(c, DEEP, 0.45);
  }
  return c;
});

const RUDDER_PAINT = paint((_p, n, s) => {
  const c = BLUE_LIGHT;
  if (Math.abs(n.x) < 0.5) return LINE;
  if (s[0] > -0.04 && s[0] <= 0.05 && Math.abs(fr(s[1] / 0.08) - 0.5) < 0.3) return PAPER;
  if (Math.abs(fr(s[1] / 0.2) - 0.5) > 0.46) return LINE;
  return c;
});

const RUDDER_TEXT = svg(
  `<svg viewBox="0 0 160 36"><text x="80" y="25" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#e8f3fb">SPITFIRE Mk I</text></svg>`,
  { size: 512 },
);
>>>>>>> REPLACE

<<<<<<< SEARCH
    { color: BLUE_MID, bone: root, name: "fuselage" },
=======
    { color: FUSE_PAINT, bone: root, name: "fuselage" },
>>>>>>> REPLACE

<<<<<<< SEARCH
thickness: 0.14, bevel: 0.03, color: BLUE_MID, bone: root, name: "wing" + side });
=======
thickness: 0.14, bevel: 0.03, color: WING_PAINT, bone: root, name: "wing" + side });
>>>>>>> REPLACE

<<<<<<< SEARCH
thickness: 0.07, color: BLUE_LIGHT, bone: rudderJ, name: "rudder" },
  );
=======
thickness: 0.07, color: RUDDER_PAINT, bone: rudderJ, name: "rudder" },
  );
  b.part(new THREE.PlaneGeometry(0.4, 0.09), "#ffffff", {
    bone: rudderJ, at: [0.039, 2.5, -5.22], dir: [1, 0, 0], axis: "z", texture: RUDDER_TEXT, name: "rudderText",
  });
>>>>>>> REPLACE

<!-- call: add1 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addRoundelFuselage(b: Builder) {
  const S = 1; // left side (+X)
  const X0 = 0.5; // approximate skin x at this station
  const Y = 1.85;
  const Z = -2.7;
  const RIM = "#2f7fc0";

  // Seat on the actual skin if we can find it
  let x = X0;
  try {
    const hit = b.surface(b.root).ray([1.5, Y, Z], [-1, 0, 0]);
    if (hit) x = hit.at.x;
  } catch {
    /* keep default */
  }

  const place = (geo: THREE.BufferGeometry, color: string, lift: number, name: string) =>
    b.part(geo, color, {
      bone: "fuselage",
      at: [x + lift, Y, Z],
      dir: [S, 0, 0],
      name,
    });

  const disc = (r: number, h: number) => new THREE.CylinderGeometry(r, r, h, 24);

  // layered roundel: outer paper, mid blue, inner deep, centre paper
  place(disc(0.42, 0.012), PRUSSIAN, 0.004, "roundelBase");
  place(disc(0.38, 0.012), PAPER, 0.010, "roundelOuter");
  place(disc(0.28, 0.012), BLUE_LIGHT, 0.016, "roundelMid");
  place(disc(0.19, 0.012), PRUSSIAN, 0.022, "roundelInner");
  place(disc(0.09, 0.012), PAPER, 0.028, "roundelCentre");

  // fine outline ring
  const ring = new THREE.TorusGeometry(0.44, 0.008, 5, 32);
  b.part(ring, LINE, { bone: "fuselage", at: [x + 0.012, Y, Z], dir: [S, 0, 0], axis: "z", name: "roundelRing" });
  const ring2 = new THREE.TorusGeometry(0.33, 0.005, 5, 28);
  b.part(ring2, LINE, { bone: "fuselage", at: [x + 0.02, Y, Z], dir: [S, 0, 0], axis: "z", name: "roundelRing2" });

  // blueprint cross-hair ticks and dimension marks
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const dy = Math.sin(a);
    const dz = Math.cos(a);
    b.part(new THREE.BoxGeometry(0.008, 0.012 + Math.abs(dz) * 0.0, 0.012), LINE, {
      bone: "fuselage",
      at: [x + 0.034, Y + dy * 0.5, Z + dz * 0.5],
      name: "roundelTick" + i,
    });
    b.part(new THREE.BoxGeometry(0.006, 0.1 * Math.abs(dz) + 0.01, 0.1 * Math.abs(dy) + 0.01), LINE, {
      bone: "fuselage",
      at: [x + 0.034, Y + dy * 0.48, Z + dz * 0.48],
      name: "roundelCross" + i,
    });
  }

  // small rivet dots around the rim
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.014, 5, 4), PAPER, {
      bone: "fuselage",
      at: [x + 0.012, Y + Math.sin(a) * 0.485, Z + Math.cos(a) * 0.485],
      name: "roundelRivet" + i,
    });
  }

  // dimension line below roundel with end ticks
  b.part(new THREE.BoxGeometry(0.006, 0.006, 0.9), LINE, { bone: "fuselage", at: [x + 0.01, Y - 0.58, Z], name: "dimLine" });
  for (const dz of [-0.45, 0.45])
    b.part(new THREE.BoxGeometry(0.006, 0.08, 0.008), LINE, { bone: "fuselage", at: [x + 0.01, Y - 0.58, Z + dz], name: "dimEnd" });
}
```

<!-- call: add2 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";

export function addRoundelWingTop(b: Builder) {
  // ---- Wing roundel (left wing upper surface) ----
  const WY = 1.15;
  const top = WY + 0.07 + 0.003;
  const roundel = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#0b3a6e"/>
      <circle cx="50" cy="50" r="38" fill="#e8f3fb"/>
      <circle cx="50" cy="50" r="27" fill="#4f97d6"/>
      <circle cx="50" cy="50" r="13" fill="#06284d"/>
      <circle cx="50" cy="50" r="48" fill="none" stroke="#bfe0f5" stroke-width="3"/>
      <circle cx="50" cy="50" r="42" fill="none" stroke="#bfe0f5" stroke-width="1.2" stroke-dasharray="4 3"/>
    </svg>`,
    { size: 256 },
  );
  b.part(new THREE.CircleGeometry(0.5, 32), "#ffffff", {
    bone: "fuselage",
    at: [3.0, top, 0.0],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, 1],
    texture: roundel,
    name: "roundelWing",
  });
  // dimension ticks beside the roundel
  for (const dz of [-0.55, 0.55]) {
    b.part(new THREE.BoxGeometry(0.02, 0.006, 0.14), LINE, {
      bone: "fuselage", at: [3.0, top, dz], name: "dimTick",
    });
  }
  b.part(new THREE.BoxGeometry(0.012, 0.006, 1.1), LINE, {
    bone: "fuselage", at: [3.55, top, 0], name: "dimLine",
  });
  for (const dz of [-0.55, 0.55]) {
    b.part(new THREE.BoxGeometry(0.1, 0.006, 0.012), LINE, {
      bone: "fuselage", at: [3.5, top, dz], name: "dimCap",
    });
  }

  // ---- Exhaust stacks: two rows of six per side ----
  for (const s of [1, -1]) {
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 6; i++) {
        const z = 1.35 + i * 0.22;
        const y = 1.88 + row * 0.2;
        const x = s * (0.5 + 0.02 * (1 - row * 0.3));
        // tube angled backwards and outward
        b.part(new THREE.CylinderGeometry(0.03, 0.045, 0.16, 6), DEEP, {
          bone: "fuselage",
          at: [x + s * 0.05, y, z - 0.03],
          dir: [s * 0.8, 0, -0.5],
          name: "stack",
        });
        // flared paper lip
        b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.015, 6), PAPER, {
          bone: "fuselage",
          at: [x + s * 0.12, y, z - 0.07],
          dir: [s * 0.8, 0, -0.5],
          name: "stackLip",
        });
      }
    }
    // manifold rail behind the stacks
    b.part(new THREE.BoxGeometry(0.03, 0.04, 1.4), BLUE_LIGHT, {
      bone: "fuselage", at: [s * 0.52, 2.07, 1.8], name: "stackRail",
    });
  }
}
```

<!-- call: add3 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addCowlGuns(b: Builder) {
  const WY = 1.15;
  const chord = (x: number) => 2.5 * Math.sqrt(Math.max(0, 1 - (x / 5.6) ** 2));
  const le = (x: number) => 0.3 + 0.25 * chord(x);
  const bone = "fuselage";

  // ---- Cannon and machine-gun fittings on the left wing ----
  const guns: { x: number; r: number; big: boolean }[] = [
    { x: 2.6, r: 0.05, big: true },
    { x: 3.3, r: 0.05, big: true },
    { x: 3.75, r: 0.028, big: false },
    { x: 4.05, r: 0.028, big: false },
  ];
  for (const g of guns) {
    const z0 = le(g.x);
    const y = WY + 0.02;
    // barrel sleeve (LINE) with a darker muzzle blast tube (DEEP)
    b.rod([g.x, y, z0 + 0.1], [g.x, y, z0 + 0.62], g.r * 1.7, LINE, { bone, sides: 8, name: "gunSleeve" });
    b.rod([g.x, y, z0 + 0.6], [g.x, y, z0 + 0.88], g.r * 1.1, DEEP, { bone, sides: 8, name: "blastTube" });
    b.part(new THREE.TorusGeometry(g.r * 1.8, 0.01, 5, 10), PAPER, {
      bone, at: [g.x, y, z0 + 0.62], dir: [0, 0, 1], axis: "z", name: "sleeveRing",
    });
    b.part(new THREE.CylinderGeometry(g.r * 0.7, g.r * 1.2, 0.05, 8), PRUSSIAN, {
      bone, at: [g.x, y, z0 + 0.9], dir: [0, 0, 1], name: "muzzleFlare",
    });
    // leading-edge fairing bump
    if (g.big) {
      b.part(new THREE.SphereGeometry(1, 8, 6), BLUE_LIGHT, {
        bone, at: [g.x, WY + 0.09, z0 - 0.1], scale: [0.14, 0.07, 0.3], name: "fairingBump",
      });
      b.part(new THREE.BoxGeometry(0.1, 0.012, 0.16), PAPER, {
        bone, at: [g.x, WY + 0.15, z0 - 0.08], name: "fairingPanel",
      });
    } else {
      b.part(new THREE.SphereGeometry(1, 8, 6), BLUE_LIGHT, {
        bone, at: [g.x, WY + 0.08, z0 - 0.05], scale: [0.08, 0.05, 0.2], name: "mgBump",
      });
    }
    // ejector chute slits on the underside
    const zc = 0.3 - 0.75 * chord(g.x);
    b.part(new THREE.BoxGeometry(g.big ? 0.12 : 0.07, 0.012, 0.2), DEEP, {
      bone, at: [g.x, WY - 0.075, z0 - 0.55 + (g.big ? 0 : 0.1)], name: "ejectorSlit",
    });
    b.part(new THREE.BoxGeometry(g.big ? 0.16 : 0.1, 0.008, 0.26), LINE, {
      bone, at: [g.x, WY - 0.073, z0 - 0.55 + (g.big ? 0 : 0.1)], name: "slitFrame",
    });
    void zc;
  }
  // access panel line across the gun bay
  b.part(new THREE.BoxGeometry(1.7, 0.008, 0.02), LINE, {
    bone, at: [3.3, WY + 0.077, le(3.3) - 0.5], name: "gunBayLine",
  });
  b.part(new THREE.BoxGeometry(1.7, 0.008, 0.02), LINE, {
    bone, at: [3.3, WY + 0.077, le(3.3) - 1.0], name: "gunBayLine2",
  });

  // ---- Radiator grille (left) ----
  const cx = 2.95, cy = 0.88, zf = 0.45 + 0.475;
  const w = 0.65, h = 0.36;
  // DEEP frame
  b.part(new THREE.BoxGeometry(w * 0.8, 0.03, 0.04), DEEP, { bone, at: [cx, cy + 0.11, zf + 0.02], name: "grilleFrameTop" });
  b.part(new THREE.BoxGeometry(w * 0.8, 0.03, 0.04), DEEP, { bone, at: [cx, cy - 0.11, zf + 0.02], name: "grilleFrameBot" });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.03, 0.25, 0.04), DEEP, { bone, at: [cx + s * w * 0.4, cy, zf + 0.02], name: "grilleFrameSide" });
  }
  // honeycomb bars
  for (let i = -4; i <= 4; i++) {
    b.part(new THREE.BoxGeometry(0.014, 0.2, 0.03), LINE, { bone, at: [cx + i * 0.056, cy, zf + 0.03], name: "grilleBarV" });
  }
  for (let j = -2; j <= 2; j++) {
    b.part(new THREE.BoxGeometry(w * 0.75, 0.012, 0.03), LINE, { bone, at: [cx, cy + j * 0.045, zf + 0.035], name: "grilleBarH" });
  }
  // dark core behind the bars
  b.part(new THREE.BoxGeometry(w * 0.74, 0.2, 0.02), PRUSSIAN, { bone, at: [cx, cy, zf + 0.012], name: "grilleCore" });
  // rear lip flap
  b.part(new THREE.BoxGeometry(w * 0.85, 0.02, 0.2), BLUE_LIGHT, {
    bone, at: [cx, cy - h / 2 - 0.01, 0.45 - 0.55], rotation: [18, 0, 0], name: "radFlap",
  });
  b.part(new THREE.BoxGeometry(w * 0.85, 0.024, 0.02), PAPER, {
    bone, at: [cx, cy - h / 2 - 0.04, 0.45 - 0.64], name: "radFlapEdge",
  });
  // lip bead round the intake
  b.part(new THREE.BoxGeometry(w * 0.95, 0.025, 0.03), PAPER, { bone, at: [cx, cy + h / 2 + 0.005, zf + 0.0], name: "intakeLipTop" });
}
```

<!-- call: add4 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addCanopyFrame(b: Builder) {
  const bone = "fuselage";
  const CY = 2.35, CZ = -0.3;

  // Canopy ellipsoid: semi-axes x 0.4, y 0.32, z 1.1 centred at (0, CY, CZ).
  const topY = (z: number) => {
    const t = (z - CZ) / 1.1;
    return CY + 0.32 * Math.sqrt(Math.max(0, 1 - t * t));
  };
  const halfW = (z: number) => {
    const t = (z - CZ) / 1.1;
    return 0.4 * Math.sqrt(Math.max(0, 1 - t * t));
  };

  // Hoop ribs: thin arches across the canopy at several stations
  for (const z of [0.55, 0.1, -0.35, -0.8, -1.15]) {
    const t = (z - CZ) / 1.1;
    const k = Math.sqrt(Math.max(0, 1 - t * t));
    const pts: number[][] = [];
    for (let i = 0; i <= 10; i++) {
      const a = (-80 + i * 16) * Math.PI / 180;
      pts.push([Math.sin(a) * 0.4 * k * 1.02, CY + Math.cos(a) * 0.32 * k * 1.02, z]);
    }
    b.sweep(pts, 0.014, { color: PAPER, bone, caps: "round", name: "s24hoop" });
  }

  // Longitudinal centre rib along the top
  const top: number[][] = [];
  for (let i = 0; i <= 8; i++) {
    const z = 0.7 - i * 0.2 - 0.0;
    top.push([0, topY(z) + 0.012, z]);
  }
  b.sweep(top, 0.012, { color: LINE, bone, name: "s24topRail" });

  // Windscreen frame: box frame around the windscreen panel (rotated -35 deg about X at z=0.95)
  const wsAt = new THREE.Vector3(0, 2.35, 0.95);
  const wsRot: [number, number, number] = [-35, 0, 0];
  const bars: [number[], number[]][] = [
    [[0.32, 0, 0], [0.025, 0.34, 0.03]],
    [[-0.32, 0, 0], [0.025, 0.34, 0.03]],
    [[0, 0.16, 0], [0.66, 0.025, 0.03]],
    [[0, -0.16, 0], [0.66, 0.025, 0.03]],
    [[0, 0, 0], [0.022, 0.32, 0.03]],
  ];
  for (const [o, s] of bars) {
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), PAPER, {
      bone, rotation: wsRot, name: "s24wsFrame",
      at: [wsAt.x + o[0], wsAt.y + o[1] * Math.cos(35 * Math.PI / 180) + o[2], wsAt.z + o[1] * Math.sin(35 * Math.PI / 180) * -1 * -1],
    });
  }
  // Armoured glass inner panel (slightly tinted deeper)
  b.part(new THREE.BoxGeometry(0.5, 0.2, 0.02), BLUE_LIGHT, {
    bone, rotation: wsRot, at: [0, 2.37, 1.0], name: "s24armourGlass",
  });

  // Sliding-hood rails on each side
  for (const s of [1, -1]) {
    const rail: number[][] = [];
    for (let i = 0; i <= 8; i++) {
      const z = 0.55 - i * 0.22;
      rail.push([s * (halfW(z) * 1.0 + 0.01), CY - 0.12 + 0.0, z]);
    }
    b.sweep(rail, 0.016, { color: LINE, bone, name: "s24hoodRail" });
    // rail end stops
    for (const z of [0.55, -1.2]) {
      b.part(new THREE.SphereGeometry(0.03, 6, 4), PAPER, {
        bone, at: [s * (halfW(z) + 0.01), CY - 0.12, z], name: "s24railStop",
      });
    }
    // lower sill along the canopy base
    b.rod([s * 0.37, CY - 0.2, 0.6], [s * 0.3, CY - 0.18, -1.3], 0.02, DEEP, { bone, name: "s24sill" });
  }

  // Rear-view mirror bump on top, with stalk
  b.part(new THREE.CylinderGeometry(0.02, 0.03, 0.08, 6), DEEP, {
    bone, at: [0, topY(0.55) + 0.03, 0.55], name: "s24mirrorStalk",
  });
  b.part(new THREE.SphereGeometry(0.07, 8, 6), PAPER, {
    bone, at: [0, topY(0.55) + 0.09, 0.55], scale: [1.2, 0.7, 0.9], name: "s24mirror",
  });
  b.part(new THREE.PlaneGeometry(0.1, 0.05), BLUE_LIGHT, {
    bone, at: [0, topY(0.55) + 0.09, 0.485], dir: [0, 0, -1], axis: "z", name: "s24mirrorGlass",
  });

  // Rear fairing hump behind the canopy
  b.part(new THREE.SphereGeometry(1, 8, 6), BLUE_MID, {
    bone, at: [0, 2.3, -1.55], scale: [0.2, 0.15, 0.5], name: "s24fairing",
  });
}
```

<!-- call: add5 -->

```ts
import * as THREE from "three";
import { type Builder, svg, rng } from "agentic-3js-builder";

export function addPropHub(b: Builder) {
  const R = rng(25);

  // ---------- Prop hub ----------
  // back-plate ring behind the spinner
  b.part(new THREE.TorusGeometry(0.31, 0.035, 6, 16), DEEP, {
    bone: "prop", at: [0, 1.75, 3.17], dir: [0, 0, 1], axis: "z", name: "s25hubRing",
  });
  // six bolt heads around the spinner base
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), PAPER, {
      bone: "prop", at: [Math.cos(a) * 0.24, 1.75 + Math.sin(a) * 0.24, 3.185],
      dir: [0, 0, 1], name: "s25bolt" + i,
    });
  }
  // blade root cuffs and tiny pitch marks
  for (let k = 0; k < 3; k++) {
    const deg = k * 120;
    const a = (deg * Math.PI) / 180;
    const dx = -Math.sin(a);
    const dy = Math.cos(a);
    b.part(new THREE.BoxGeometry(0.28, 0.2, 0.075), LINE, {
      bone: "prop", at: [dx * 0.42, 1.75 + dy * 0.42, 3.25], rotation: [0, 0, deg], name: "s25cuff" + k,
    });
    b.part(new THREE.BoxGeometry(0.3, 0.025, 0.08), DEEP, {
      bone: "prop", at: [dx * 0.54, 1.75 + dy * 0.54, 3.25], rotation: [0, 0, deg], name: "s25cuffBand" + k,
    });
    b.part(new THREE.BoxGeometry(0.03, 0.14, 0.05), DEEP, {
      bone: "prop", at: [dx * 1.0 + dy * 0.0, 1.75 + dy * 1.0, 3.28], rotation: [0, 0, deg], name: "s25bladeMark" + k,
    });
  }
  // spinner tip cap
  b.part(new THREE.SphereGeometry(0.05, 6, 4), PAPER, { bone: "prop", at: [0, 1.75, 3.84], name: "s25tip" });

  // ---------- Gear detail (left leg) ----------
  const bone = null;
  const gz = 0.45;
  // upper oleo sleeve
  b.rod([1.92, 1.0, gz], [1.96, 0.75, gz], 0.08, BLUE_LIGHT, { name: "s25oleo" });
  // scissor links
  b.rod([1.84, 0.85, gz], [1.96, 0.66, gz + 0.02], 0.018, LINE, { name: "s25scissorA" });
  b.rod([1.84, 0.66, gz], [1.96, 0.85, gz + 0.02], 0.018, LINE, { name: "s25scissorB" });
  b.part(new THREE.SphereGeometry(0.03, 6, 4), PAPER, { at: [1.9, 0.76, gz + 0.03], name: "s25scissorPivot" });
  // brake line down the strut to the wheel
  b.rod([1.99, 0.98, gz + 0.07], [2.0, 0.62, gz + 0.07], 0.012, DEEP, { name: "s25brakeLine" });
  b.rod([2.0, 0.62, gz + 0.07], [2.2, 0.46, gz + 0.08], 0.012, DEEP, { name: "s25brakeHose" });
  // hub bolts on outer wheel face
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.03, 5), PAPER, {
      at: [2.22, 0.38 + Math.sin(a) * 0.11, 0.5 + Math.cos(a) * 0.11], dir: [1, 0, 0], name: "s25hubBolt" + i,
    });
  }
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 8), BLUE_LIGHT, {
    at: [2.22, 0.38, 0.5], dir: [1, 0, 0], name: "s25axleCap",
  });
  // tyre tread ticks
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.205, 0.03, 0.03), LINE, {
      at: [2.1, 0.38 + Math.sin(a) * 0.385, 0.5 + Math.cos(a) * 0.385],
      rotation: [(-a * 180) / Math.PI + 90, 0, 0], name: "s25tread" + i,
    });
  }
  // gear door detail: hinge barrel and rivet line and panel line drawing
  b.rod([1.52, 1.08, gz - 0.25], [1.52, 1.08, gz + 0.25], 0.025, LINE, { name: "s25doorHinge" });
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.SphereGeometry(0.014, 5, 3), PAPER, {
      at: [1.5, 0.5 + i * 0.12, gz - 0.2 + R() * 0.0 + (i % 2) * 0.4], name: "s25doorRivet" + i,
    });
  }
  const panel = svg(
    `<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="54" height="94" fill="none" stroke="#e8f3fb" stroke-width="3"/>
      <path d="M3 50 H57 M30 3 V97" stroke="#bfe0f5" stroke-width="2" stroke-dasharray="6 4"/>
    </svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.58, 0.68), "#ffffff", {
    at: [1.5, 0.75, gz], dir: [-1, 0, 0], axis: "z", texture: panel, name: "s25doorDraft",
  });
  // door hinge on outer side too
  b.part(new THREE.PlaneGeometry(0.58, 0.68), "#ffffff", {
    at: [1.58, 0.75, gz], dir: [1, 0, 0], axis: "z", texture: panel, name: "s25doorDraftOut",
  });
}
```

<!-- call: add6 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";

export function addPitotAerial(b: Builder) {
  const BONE = "fuselage";

  // ---- Pitot tube on the right wing leading edge (x negative) ----
  // right wing leading edge at x=-3.6: z = 0.3 + 0.25*chord
  const chordAt = (x: number) => 2.5 * Math.sqrt(Math.max(0, 1 - (x / 5.6) ** 2));
  const px = -3.6;
  const le = 0.3 + 0.25 * chordAt(Math.abs(px));
  const py = 1.15;
  b.rod([px, py - 0.02, le - 0.05], [px, py - 0.02, le + 0.55], 0.012, LINE, { bone: BONE, name: "pitotTube" });
  b.rod([px, py - 0.02, le + 0.55], [px, py - 0.02, le + 0.72], 0.008, DEEP, { bone: BONE, name: "pitotTip" });
  b.part(new THREE.SphereGeometry(0.022, 6, 4), DEEP, { bone: BONE, at: [px, py - 0.02, le + 0.74], name: "pitotNose" });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 6), PAPER, {
    bone: BONE, at: [px, py - 0.02, le + 0.08], dir: [0, 0, 1], name: "pitotCollar",
  });
  b.part(new THREE.BoxGeometry(0.05, 0.05, 0.12), BLUE_LIGHT, { bone: BONE, at: [px, py - 0.02, le - 0.02], name: "pitotMount" });

  // ---- Radio mast behind the canopy ----
  const mastBase: [number, number, number] = [0, 2.5, -1.9];
  const mastTop: [number, number, number] = [0, 2.95, -1.95];
  b.rod(mastBase, mastTop, [0.022, 0.012], LINE, { bone: BONE, name: "mast" });
  b.part(new THREE.CylinderGeometry(0.05, 0.07, 0.05, 8), DEEP, { bone: BONE, at: [0, 2.5, -1.9], name: "mastBase" });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), PAPER, { bone: BONE, at: mastTop, name: "mastCap" });
  // aerial wire to fin top
  const finTop: [number, number, number] = [0, 3.4, -4.95];
  b.rod(mastTop, finTop, 0.004, PAPER, { bone: BONE, name: "aerialWire" });
  b.part(new THREE.SphereGeometry(0.018, 6, 4), PAPER, { bone: BONE, at: finTop, name: "aerialInsulator" });
  // wire to wing-side insulator
  b.rod(mastTop, [0, 2.7, -3.0], 0.003, LINE, { bone: BONE, name: "aerialDrop" });

  // ---- Tail wheel fork & oleo ----
  const tz = -4.75;
  for (const s of [1, -1]) {
    b.rod([s * 0.03, 0.4, tz + 0.02], [s * 0.075, 0.13, tz], 0.014, PAPER, { bone: BONE, name: "tailFork" });
  }
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.17, 6), LINE, { bone: BONE, at: [0, 0.44, -4.68], name: "tailOleo" });
  // spring coils
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.TorusGeometry(0.04, 0.007, 4, 8), DEEP, {
      bone: BONE, at: [0, 0.54 + i * 0.04, -4.68], rotation: [90, 0, 0], name: "spring",
    });
  }
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.1, 6), PAPER, { bone: BONE, at: [0, 0.74, -4.66], name: "oleoTop" });
  b.part(new THREE.SphereGeometry(0.025, 6, 4), DEEP, { bone: BONE, at: [0, 0.13, tz], name: "tailAxle" });
  // fairing at fuselage underside
  b.part(new THREE.SphereGeometry(1, 8, 6), BLUE_MID, {
    bone: BONE, at: [0, 1.5, -4.6], scale: [0.14, 0.2, 0.42], name: "tailFairing",
  });
  b.part(new THREE.BoxGeometry(0.1, 0.03, 0.3), LINE, { bone: BONE, at: [0, 1.32, -4.6], name: "fairingLip" });
}
```