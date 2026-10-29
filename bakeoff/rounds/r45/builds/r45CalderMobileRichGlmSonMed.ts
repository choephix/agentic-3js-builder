import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Calder Mobile — Leaves on Wires",
  "description": "A Alexander Calder-style hanging mobile: flat hand-cut leaf and disc shapes in black, red, orange and yellow, balanced on thin black wires that cascade down in five swaying tiers from a ceiling anchor."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  calderBlack: "#1e1c1a",
  wire: "#3c3a38",
  calderRed: "#cf3b2e",
  calderOrange: "#e2662b",
  calderYellow: "#f0b429",
  calderWhite: "#f2ede2",
  calderBlue: "#2f6db3",
  pivotSteel: "#5c5a56",
};
const M = {
  ceilingAnchor: [0, 2.4, 0] as [number, number, number],
  crownPivot: [0, 2.14, 0] as [number, number, number],
  crownHookL: [-0.78, 2.1, 0] as [number, number, number],
  crownHookC: [0, 2.1, 0] as [number, number, number],
  crownHookR: [0.78, 2.1, 0] as [number, number, number],
  tierLBeamPivot: [-0.55, 1.72, 0.1] as [number, number, number],
  tierRBeamPivot: [0.5, 1.68, -0.08] as [number, number, number],
  tierCBeamPivot: [0, 1.32, 0.12] as [number, number, number],
  fanHook: [0.05, 1.3, 0.12] as [number, number, number],
  fanPivot: [0.02, 0.55, 0.2] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // crown
  (() => {
function buildCrown({ b, J, P, M }: Ctx) {
  const BLACK = P.calderBlack;
  const WIRE = P.wire;
  const STEEL = P.pivotSteel;
  const RED = P.calderRed;
  const R = rng(11);

  const anchor = J.anchor;
  const bar = J.crownBar;

  // ---- ceiling anchor disc (horizontal) ----
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 16), BLACK, {
    bone: anchor, at: M.ceilingAnchor, name: "crownAnchorDisc",
  });
  // small raised cap on the disc
  b.part(new THREE.CylinderGeometry(0.02, 0.026, 0.01, 10), STEEL, {
    bone: anchor, at: [0, M.ceilingAnchor[1] + 0.009, 0], name: "crownAnchorCap",
  });
  // wire loop on the top edge (torus, standing in the XY plane)
  b.part(new THREE.TorusGeometry(0.01, 0.0025, 5, 12), WIRE, {
    bone: anchor, at: [0, M.ceilingAnchor[1] + 0.025, 0], name: "crownAnchorLoop",
  });

  // ---- drop rod ----
  b.rod([0, M.ceilingAnchor[1] - 0.004, 0], [0, M.crownPivot[1] + 0.006, 0], 0.008, WIRE, {
    bone: anchor, name: "crownDropRod", sides: 6,
  });

  // ---- pivot disc ----
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.014, 14), STEEL, {
    bone: bar, at: M.crownPivot, name: "crownPivotDisc",
  });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.022, 8), BLACK, {
    bone: bar, at: M.crownPivot, name: "crownPivotBoss",
  });

  // ---- crossbar ----
  b.rod([-0.78, 2.14, 0], [0.78, 2.14, 0], 0.011, BLACK, {
    bone: bar, name: "crownCrossbar", sides: 8, caps: "round",
  });
  // end finials
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.014, 8, 6), BLACK, {
      bone: bar, at: [s * 0.79, 2.14, 0], name: "crownFinial",
    });
  }

  // ---- left counterweight: black leaf on a stub ----
  const lx = -0.78;
  b.rod([lx, 2.14, 0], [lx - 0.01, 2.14 - 0.05, 0.005], 0.0035, WIRE, {
    bone: bar, name: "crownStubL", sides: 5,
  });
  const leaf: [number, number][] = [
    [0, 0], [0.012, -0.018], [0.03, -0.04], [0.045, -0.052], [0.062, -0.06],
    [0.07, -0.075], [0.06, -0.095], [0.04, -0.115], [0.02, -0.126],
    [0.0, -0.13], [-0.016, -0.115], [-0.024, -0.09], [-0.02, -0.06], [-0.012, -0.03],
  ].map(([x, y]) => [x * 0.85 + (R() - 0.5) * 0.002, y + 0] as [number, number]);
  // reshape: leaf hanging, 0.13 tall x 0.07 wide, centred on x
  const leafOutline: [number, number][] = leaf.map(([x, y]) => [x - 0.02, y]);
  b.extrude(leafOutline, {
    at: [lx - 0.01, 2.14 - 0.05, 0.005],
    x: [Math.cos(0.35), 0, Math.sin(0.35)],
    y: [0, 1, 0],
    thickness: 0.004,
    smoothing: 1,
    color: BLACK,
    bone: bar,
    name: "crownLeafL",
  });
  // wire eye where leaf is hung
  b.part(new THREE.TorusGeometry(0.006, 0.002, 4, 8), WIRE, {
    bone: bar, at: [lx - 0.01, 2.14 - 0.05, 0.005], name: "crownLeafEye",
  });

  // ---- right counterweight: red disc on a stub ----
  const rx = 0.78;
  b.rod([rx, 2.14, 0], [rx, 2.14 - 0.06, 0], 0.0035, WIRE, {
    bone: bar, name: "crownStubR", sides: 5,
  });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.004, 20), RED, {
    bone: bar, at: [rx, 2.14 - 0.06 - 0.05, 0], dir: [0, 0, 1], name: "crownDiscR",
  });
  b.part(new THREE.TorusGeometry(0.006, 0.002, 4, 8), WIRE, {
    bone: bar, at: [rx, 2.14 - 0.06, 0], name: "crownDiscEye",
  });

  // ---- three hooks under the bar ----
  const hooks: [number, number, number][] = [M.crownHookL, M.crownHookC, M.crownHookR];
  hooks.forEach((h, i) => {
    // small collar on the bar
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 8), BLACK, {
      bone: bar, at: [h[0], 2.14, 0], dir: [1, 0, 0], name: `crownCollar${i}`,
    });
    // short neck
    b.rod([h[0], 2.135, 0], [h[0], h[1] + 0.012, 0], 0.003, WIRE, {
      bone: bar, name: `crownHookNeck${i}`, sides: 5,
    });
    // loop
    b.part(new THREE.TorusGeometry(0.012, 0.0028, 5, 12), BLACK, {
      bone: bar, at: [h[0], h[1], 0], name: `crownHook${i}`,
    });
  });
}
    return buildCrown;
  })(),
  // tierL
  (() => {
function buildTierL({ b, J, P, M }: Ctx) {
  const r = rng(11);
  const BEAM_Y = 1.72;
  const BEAM_Z = 0.1;

  // ---- main wire from crown hook to beam pivot (rides tierLDrop)
  const hook = M.crownHookL;
  const piv = M.tierLBeamPivot;
  b.rod(hook, piv, 0.006, P.calderBlack, { bone: J.tierLDrop });
  // small hook loop at the top of the wire
  b.part(new THREE.TorusGeometry(0.012, 0.0035, 5, 10), P.calderBlack, {
    at: [hook[0], hook[1] - 0.012, hook[2]],
    dir: [0, 0, 1],
    axis: "z",
    bone: J.tierLDrop,
  });

  // pivot disc + collar on the beam
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.012, 14), P.pivotSteel, {
    at: [piv[0], piv[1] + 0.004, piv[2]],
    dir: [0, 0, 1],
    bone: J.tierLDrop,
    axis: "y",
  });
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.012, 14), P.pivotSteel, {
    at: [piv[0], BEAM_Y + 0.012, BEAM_Z],
    bone: J.tierLBeam,
  });
  b.part(new THREE.SphereGeometry(0.012, 6, 4), P.pivotSteel, {
    at: [piv[0], BEAM_Y + 0.025, BEAM_Z],
    bone: J.tierLBeam,
  });

  // ---- beam
  b.rod([-0.98, BEAM_Y, BEAM_Z], [-0.15, BEAM_Y, BEAM_Z], 0.009, P.calderBlack, {
    bone: J.tierLBeam,
    caps: "round",
  });
  // end finials
  for (const x of [-0.98, -0.15])
    b.part(new THREE.SphereGeometry(0.014, 6, 4), P.calderBlack, { at: [x, BEAM_Y, BEAM_Z], bone: J.tierLBeam });

  // ---- helpers
  // flat cutout: outline in (x right, y up) with origin at the hang point (top), extruded along Z
  const cutout = (outline: any[], at: number[], color: string, thick: number, tiltDeg = 0, zRot = 0) => {
    const p = b.extrude(outline, {
      at: at as any,
      x: [1, 0, 0],
      y: [Math.sin((zRot * Math.PI) / 180), Math.cos((zRot * Math.PI) / 180), 0],
      thickness: thick,
      bevel: thick * 0.25,
      color,
      bone: J.tierLBeam,
    });
    return p;
  };
  const jitter = (v: number) => v + (r() - 0.5) * 0.008;
  const stub = (x: number, len: number, z = BEAM_Z, rad = 0.005) => {
    b.rod([x, BEAM_Y - 0.004, z], [x, BEAM_Y - len, z], rad, P.calderBlack, { bone: J.tierLBeam });
    // eyelet ring at the joint with the shape
    b.part(new THREE.TorusGeometry(0.01, 0.003, 5, 8), P.calderBlack, {
      at: [x, BEAM_Y - len, z],
      dir: [0, 0, 1],
      axis: "z",
      bone: J.tierLBeam,
    });
  };

  // ---- 1) red sail leaf at x -0.90, bottom y 1.36, 0.30 tall x 0.20 wide
  {
    const x = -0.9;
    const len = 0.06;
    stub(x, len);
    const topY = BEAM_Y - len - 0.004;
    const H = 0.3;
    const W = 0.2;
    // curved sail: swelling on the right, hollow on the left, pointed tip at bottom-left
    const sail: any[] = [
      [0, 0, "sharp"],
      [0.045, -0.02],
      [0.1, -0.07],
      [0.115, -0.14],
      [0.09, -0.21],
      [0.03, -0.27],
      [-0.03, -H, "sharp"],
      [-0.055, -0.22],
      [-0.075, -0.15],
      [-0.07, -0.08],
      [-0.04, -0.03],
    ].map((p: any) => [jitter(p[0]), jitter(p[1]), p[2]].filter((v) => v !== undefined));
    cutout(sail as any, [x, topY, BEAM_Z], P.calderRed, 0.005, 0, 4);
    // white-ish cut highlight? keep it tonal: dark spine line seam
    b.rod([x, topY - 0.01, BEAM_Z + 0.004], [x - 0.02, topY - 0.25, BEAM_Z + 0.004], 0.0018, "#8e2219", {
      bone: J.tierLBeam,
    });
    // small drilled hole
    b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.012, 8), P.calderBlack, {
      at: [x, topY - 0.012, BEAM_Z],
      dir: [0, 0, 1],
      axis: "y",
      bone: J.tierLBeam,
    });
    void W;
  }

  // ---- 2) yellow disc at x -0.55, bottom y 1.58, r 0.065
  {
    const x = -0.55;
    const R = 0.065;
    const cy = 1.58 + R;
    stub(x, BEAM_Y - cy - R + 0.004 + 0.0 > 0 ? BEAM_Y - (cy + R) : 0.05);
    b.part(new THREE.CylinderGeometry(R, R, 0.004, 18), P.calderYellow, {
      at: [x, cy, BEAM_Z],
      dir: [0, 0, 1],
      axis: "y",
      bone: J.tierLBeam,
    });
    // inner offset ring detail (darker orange small disc) and rim
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.006, 10), P.calderOrange, {
      at: [x + 0.012, cy - 0.01, BEAM_Z],
      dir: [0, 0, 1],
      axis: "y",
      bone: J.tierLBeam,
    });
  }

  // ---- 3) black willow leaf at x -0.20, bottom y 1.40, 0.30 x 0.10
  {
    const x = -0.2;
    const len = 0.1;
    stub(x, len);
    const topY = BEAM_Y - len - 0.004;
    const H = 0.3;
    const willow: any[] = [
      [0, 0, "sharp"],
      [0.025, -0.04],
      [0.045, -0.1],
      [0.05, -0.16],
      [0.035, -0.22],
      [0.012, -0.27],
      [0.0, -H, "sharp"],
      [-0.02, -0.26],
      [-0.04, -0.2],
      [-0.05, -0.13],
      [-0.04, -0.07],
      [-0.02, -0.03],
    ].map((p: any) => [jitter(p[0]), jitter(p[1]), p[2]].filter((v) => v !== undefined));
    cutout(willow as any, [x, topY, BEAM_Z], P.calderBlack, 0.004, 0, -3);
    // mid vein in steel
    b.rod([x, topY - 0.02, BEAM_Z + 0.003], [x, topY - 0.27, BEAM_Z + 0.003], 0.0015, P.pivotSteel, {
      bone: J.tierLBeam,
    });
  }

  // ---- balance stops: tiny weights at beam ends for character
  b.part(new THREE.SphereGeometry(0.008, 6, 4), P.pivotSteel, {
    at: [-0.55, BEAM_Y + 0.0, BEAM_Z + 0.012],
    bone: J.tierLBeam,
  });
  void frame;
}
    return buildTierL;
  })(),
  // tierR
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, [number, number, number]> };

function buildTierR({ b, J, P, M }: Ctx) {
  const R = rng(41);
  const drop = J.tierRDrop;
  const beamJ = J.tierRBeam;
  const BLACK = P.calderBlack;
  const WIRE = P.wire;
  const STEEL = P.pivotSteel;

  const hook = M.crownHookR;
  const bp = M.tierRBeamPivot;
  const BY = bp[1];
  const BZ = bp[2];

  // main suspension wire
  b.rod(hook, bp, 0.006, WIRE, { bone: drop });
  // little hook loop at the top of the wire
  b.part(new THREE.TorusGeometry(0.012, 0.0035, 5, 10), BLACK, { bone: drop, at: [hook[0], hook[1] - 0.012, hook[2]], dir: [0, 0, 1], axis: "z" });
  // pivot disc
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.012, 14), STEEL, { bone: drop, at: [bp[0], bp[1] + 0.012, bp[2]] });
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.016, 8), BLACK, { bone: drop, at: [bp[0], bp[1] + 0.012, bp[2]] });
  // wire eye over beam
  b.rod([bp[0], bp[1] + 0.012, bp[2]], [bp[0], bp[1], bp[2]], 0.005, WIRE, { bone: drop });

  // beam
  b.rod([0.14, BY, BZ], [0.92, BY, BZ], 0.009, BLACK, { bone: beamJ, caps: "round" });
  for (const x of [0.14, 0.92]) b.part(new THREE.SphereGeometry(0.014, 8, 6), BLACK, { bone: beamJ, at: [x, BY, BZ] });

  // helpers
  const flat = (outline: [number, number, string?][], at: number[], th: number, color: string, xdir: number[] = [1, 0, 0]) =>
    b.extrude(outline.map((p) => (p[2] ? [p[0], p[1], "sharp"] : [p[0], p[1]])), { at, x: xdir, y: [0, 1, 0], thickness: th, color, bone: beamJ, smoothing: 1 });
  const jitter = (v: number, a = 0.004) => v + (R() - 0.5) * a;
  const stub = (x: number, len: number, z = BZ) => {
    b.rod([x, BY, z], [x, BY - len, z], 0.005, WIRE, { bone: beamJ });
    b.part(new THREE.TorusGeometry(0.009, 0.003, 5, 8), BLACK, { bone: beamJ, at: [x, BY - len, z], dir: [1, 0, 0], axis: "z" });
  };

  // ---- orange paddle at x 0.88, bottom y 1.28, 0.36 tall x 0.16 wide
  {
    const x = 0.88, top = 1.64, bot = 1.28, h = 0.18, w = 0.08;
    stub(x, BY - top - 0.0);
    const pts: [number, number][] = [];
    const n = 10;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      // superellipse-ish capsule body
      const px = Math.cos(a), py = Math.sin(a);
      pts.push([jitter(px * w * (1 - 0.15 * py * py)), jitter(py * h)]);
    }
    flat(pts as any, [x, (top + bot) / 2, BZ], 0.005, P.calderOrange, [1, 0, 0]);
    // dark hand-cut edge stripe and highlight
    b.part(new THREE.BoxGeometry(0.012, 0.22, 0.0058), P.calderRed, { bone: beamJ, at: [x - 0.02, (top + bot) / 2 + 0.02, BZ] });
    b.part(new THREE.SphereGeometry(0.01, 6, 4), BLACK, { bone: beamJ, at: [x, top + 0.0, BZ + 0.004], scale: [1, 1, 0.4] });
  }

  // ---- black propeller at x 0.45
  {
    const x = 0.45, cy = 1.46;
    stub(x, BY - cy - 0.0);
    const blade = [
      [0, -0.03],
      [0.05, -0.04],
      [0.12, -0.02],
      [0.15, 0.005],
      [0.11, 0.03],
      [0.04, 0.035],
      [0, 0.03],
    ] as [number, number][];
    // two blades along X, one flipped, with a slight depth twist
    for (const s of [1, -1]) {
      const o = blade.map(([u, v]) => [u * s, v * s] as [number, number]);
      const pts = s > 0 ? o : o.slice().reverse();
      b.extrude(pts, { at: [x, cy, BZ], x: [1, 0, 0], y: [0, 1, 0.25 * s], thickness: 0.003, color: BLACK, bone: beamJ, smoothing: 1 });
    }
    b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.012, 10), STEEL, { bone: beamJ, at: [x, cy, BZ], dir: [0, 0, 1], axis: "y", rotation: [90, 0, 0] });
    b.part(new THREE.SphereGeometry(0.008, 6, 4), BLACK, { bone: beamJ, at: [x, cy, BZ + 0.007] });
  }

  // ---- white disc at x 0.25, bottom y 1.56 (r .055)
  {
    const x = 0.25, r = 0.055, cy = 1.56 + r;
    stub(x, BY - (cy + r));
    b.part(new THREE.CylinderGeometry(r, r, 0.004, 18), P.calderWhite, { bone: beamJ, at: [x, cy, BZ], rotation: [90, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.0055, 8), BLACK, { bone: beamJ, at: [x, cy + 0.02, BZ], rotation: [90, 0, 0] });
  }

  // ---- blue teardrop at x 0.16, 0.10 tall x 0.06 wide
  {
    const x = 0.16, top = 1.58, bot = 1.48;
    stub(x, BY - top);
    const tear: [number, number][] = [
      [0, 0.05],
      [0.02, 0.025],
      [0.03, -0.01],
      [0.022, -0.04],
      [0, -0.05],
      [-0.022, -0.04],
      [-0.03, -0.01],
      [-0.018, 0.025],
    ];
    b.extrude(tear.map(([u, v], i) => (i === 0 ? [u, v, "sharp"] : [jitter(u, 0.003), jitter(v, 0.003)])) as any, {
      at: [x, (top + bot) / 2, BZ], x: [1, 0, 0], thickness: 0.004, color: P.calderBlue, bone: beamJ, smoothing: 1,
    });
  }

  // small counterweight bead on beam left end
  b.part(new THREE.SphereGeometry(0.012, 6, 5), P.calderRed, { bone: beamJ, at: [0.115, BY, BZ] });
}
    return buildTierR;
  })(),
  // tierC
  (() => {
function buildTierC({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const drop = J.tierCDrop;
  const beam = J.tierCBeam;
  const BY = M.tierCBeamPivot[1];
  const BZ = M.tierCBeamPivot[2];

  // Long drop wire from the crown hook to the beam pivot
  b.rod([0, 2.1, 0], [0, BY, BZ], 0.006, P.calderBlack, { bone: drop });
  // wire kink loop at the top
  b.part(new THREE.TorusGeometry(0.012, 0.003, 5, 10), P.calderBlack, { bone: drop, at: [0, 2.09, 0], dir: [0, 0, 1], axis: "z" });
  // pivot disc
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.014, 14), P.pivotSteel, { bone: beam, at: [0, BY, BZ] });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 8), P.calderBlack, { bone: beam, at: [0, BY + 0.01, BZ] });

  // Beam
  b.rod([-0.62, BY, BZ], [0.62, BY, BZ], 0.012, P.calderBlack, { bone: beam });
  for (const s of [-1, 1])
    b.part(new THREE.SphereGeometry(0.016, 8, 6), P.calderBlack, { bone: beam, at: [s * 0.62, BY, BZ] });

  // Fan hook under the beam
  b.part(new THREE.TorusGeometry(0.012, 0.003, 5, 10), P.calderBlack, { bone: beam, at: [0.05, BY - 0.02, BZ], dir: [0, 0, 1], axis: "z" });
  b.rod([0.05, BY - 0.004, BZ], [0.05, BY - 0.012, BZ], 0.004, P.calderBlack, { bone: beam });

  // Hand-cut outline helper: jitters points slightly
  const jit = (pts: number[][], a = 0.006) =>
    pts.map(([x, y]) => [x + (R() - 0.5) * a, y + (R() - 0.5) * a] as [number, number]);

  // Hang a shape: stub from beam to top of shape, outline drawn in local coords with top at y=0 going down
  const hang = (x: number, z: number, stub: number, outline: [number, number][], thick: number, color: string, tilt = 0) => {
    const top = BY - 0.01 - stub;
    b.rod([x, BY - 0.005, BZ], [x, top, BZ], 0.0055, P.calderBlack, { bone: beam });
    b.part(new THREE.TorusGeometry(0.01, 0.0025, 5, 8), P.calderBlack, { bone: beam, at: [x, top - 0.004, BZ], dir: [1, 0, 0], axis: "z" });
    const e = b.extrude(outline, {
      at: [x, top - 0.01, z],
      x: [Math.cos(tilt), 0, Math.sin(tilt) * 0],
      y: [Math.sin(tilt), Math.cos(tilt), 0],
      thickness: thick,
      bevel: thick * 0.25,
      smoothing: 2,
      color,
      bone: beam,
    });
    return e;
  };

  // Big red sweeping leaf: 0.62 tall, 0.30 wide, bottom at y 0.58
  {
    const H = 0.62, W = 0.3;
    const stub = BY - 0.01 - 0.01 - 0.0 - (0.58 + H) ;
    const top = 0.58 + H; // y of the outline top
    const stubLen = BY - 0.02 - top;
    const outline = jit([
      [0, 0, ], [0.1, -0.05], [0.18, -0.2], [0.2, -0.38], [0.12, -0.54], [-0.04, -H],
      [-0.08, -0.45], [-0.14, -0.3], [-0.12, -0.14], [-0.05, -0.04],
    ], 0.008).map(([x, y]) => [x * (W / 0.34), y] as [number, number]);
    outline[0] = [0, 0];
    hang(-0.55, BZ, Math.max(0.02, stubLen), outline, 0.006, P.calderRed, 0);
    // midrib highlight line in darker red-black
    b.rod([-0.55, top - 0.04, BZ + 0.0045], [-0.55 + 0.02, 0.66, BZ + 0.0045], 0.0025, P.calderBlack, { bone: beam });
    void stub;
  }

  // Black slash leaf, 0.42 tall x 0.14 wide, bottom at y 0.84, angled
  {
    const H = 0.42;
    const top = 0.84 + H * 0.97;
    const stubLen = BY - 0.02 - top;
    const outline = jit([
      [0, 0], [0.05, -0.05], [0.07, -0.2], [0.04, -0.34], [-0.01, -H],
      [-0.05, -0.3], [-0.07, -0.16], [-0.04, -0.05],
    ], 0.005) as [number, number][];
    outline[0] = [0, 0];
    hang(-0.18, BZ, Math.max(0.02, stubLen), outline, 0.004, P.calderBlack, -0.22);
  }

  // Big yellow circle r 0.15, bottom at y 0.94
  {
    const r = 0.15;
    const cy = 0.94 + r;
    const top = cy + r;
    const stubLen = BY - 0.02 - top;
    const pts: [number, number][] = [];
    const n = 20;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = r * (1 + (R() - 0.5) * 0.03);
      pts.push([Math.sin(a) * rr, -r + Math.cos(a) * rr]);
    }
    hang(0.52, BZ, Math.max(0.02, stubLen), pts, 0.005, P.calderYellow);
    // small black rivet at centre as the hand-made detail
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.004, 8), P.calderBlack, {
      bone: beam, at: [0.52, cy, BZ + 0.004], dir: [0, 0, 1], axis: "y",
    });
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.004, 8), P.calderBlack, {
      bone: beam, at: [0.52, cy, BZ - 0.004], dir: [0, 0, 1], axis: "y",
    });
  }

  // Rivets on the red leaf and slash for craft detail
  b.part(new THREE.SphereGeometry(0.008, 6, 4), P.calderBlack, { bone: beam, at: [-0.55, 1.2, BZ + 0.005] });
  b.part(new THREE.SphereGeometry(0.007, 6, 4), P.calderBlack, { bone: beam, at: [-0.185, 1.18, BZ + 0.004] });
}
    return buildTierC;
  })(),
  // petalFan
  (() => {
function buildPetalFan({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const hook = M.fanHook;
  const piv = M.fanPivot;

  // main wire from hook to pivot
  b.rod(hook, piv, 0.005, P.calderBlack, { bone: J.fanDrop, sides: 6 });
  // tiny loop at the hook
  b.part(new THREE.TorusGeometry(0.012, 0.0025, 5, 10), P.calderBlack, {
    bone: J.fanDrop,
    at: [hook[0], hook[1] - 0.008, hook[2]],
    dir: [0, 0, 1],
    axis: "z",
  });
  // pivot disc
  b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 12), P.pivotSteel, {
    bone: J.fanDrop,
    at: [piv[0], piv[1] + 0.012, piv[2]],
  });

  // crossbar
  b.rod([piv[0] - 0.13, piv[1], piv[2]], [piv[0] + 0.13, piv[1], piv[2]], 0.006, P.calderBlack, {
    bone: J.fanBeam,
    sides: 6,
  });
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.008, 6, 4), P.calderBlack, {
      bone: J.fanBeam,
      at: [piv[0] + s * 0.13, piv[1], piv[2]],
    });
  }
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 10), P.pivotSteel, {
    bone: J.fanBeam,
    at: [piv[0], piv[1], piv[2]],
  });

  // petal outline builders (x across, y up; origin at the top tip)
  const oval = (h: number, w: number): [number, number][] => {
    const pts: [number, number][] = [];
    const n = 10;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const j = 1 + (R() - 0.5) * 0.08;
      pts.push([Math.sin(a) * (w / 2) * j, -h / 2 + Math.cos(a) * (h / 2) * -1 * j]);
    }
    return pts;
  };
  const pointed = (h: number, w: number, lean: number): [number, number][] => [
    [0, 0],
    [w * 0.35 + lean, -h * 0.25],
    [w * 0.5, -h * 0.55],
    [w * 0.2, -h * 0.85],
    [0, -h],
    [-w * 0.25, -h * 0.8],
    [-w * 0.5, -h * 0.5],
    [-w * 0.3 + lean, -h * 0.2],
  ];

  const petals = [
    { x: -0.1, h: 0.14, w: 0.07, col: P.calderWhite, kind: "oval", stub: 0.05, tilt: 14 },
    { x: -0.03, h: 0.18, w: 0.075, col: P.calderRed, kind: "point", stub: 0.06, tilt: 5 },
    { x: 0.05, h: 0.16, w: 0.07, col: P.calderOrange, kind: "point", stub: 0.05, tilt: -6 },
    { x: 0.12, h: 0.12, w: 0.06, col: P.calderYellow, kind: "oval", stub: 0.04, tilt: -16 },
  ];

  petals.forEach((p, i) => {
    const x = piv[0] + p.x;
    const top = piv[1] - p.stub;
    b.rod([x, piv[1], piv[2]], [x, top, piv[2]], 0.0035, P.calderBlack, { bone: J.fanBeam, sides: 5 });
    const outline: [number, number][] =
      p.kind === "oval" ? oval(p.h, p.w).map(([a, c]) => [a, c + 0 - 0] as [number, number]) : pointed(p.h, p.w, 0.004);
    // oval outline is centred; shift so top is at 0
    const shaped = p.kind === "oval" ? outline.map(([a, c]) => [a, c - p.h / 2 + p.h / 2 - 0] as [number, number]) : outline;
    const minY = Math.min(...shaped.map((q) => q[1]));
    const maxY = Math.max(...shaped.map((q) => q[1]));
    const fixed = shaped.map(([a, c]) => [a, c - maxY] as [number, number]);
    void minY;
    const th = p.tilt * (Math.PI / 180);
    // spread depth slightly, rotate about vertical for a fanned feel
    b.extrude(fixed, {
      at: [x, top, piv[2] + (i % 2 ? 0.012 : -0.01)],
      x: [Math.cos(th), 0, Math.sin(th)],
      thickness: 0.004,
      color: p.col,
      bone: J.fanBeam,
      smoothing: 1,
    });
    // small hole-ring accent at top
    b.part(new THREE.SphereGeometry(0.005, 6, 4), P.calderBlack, {
      bone: J.fanBeam,
      at: [x, top, piv[2] + (i % 2 ? 0.012 : -0.01)],
    });
  });

  // lower wire and blue disc
  const bx = piv[0] + 0.01;
  b.rod([bx, piv[1], piv[2]], [bx, 0.22, piv[2]], 0.003, P.calderBlack, { bone: J.fanBeam, sides: 5 });
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.003, 14), P.calderBlue, {
    bone: J.fanBeam,
    at: [bx, 0.194, piv[2]],
    dir: [0, 0, 1],
    axis: "y",
    rotation: [90, 0, 0],
  });
  // wire tab above the disc
  b.part(new THREE.SphereGeometry(0.005, 6, 4), P.calderBlack, { bone: J.fanBeam, at: [bx, 0.222, piv[2]] });
}
    return buildPetalFan;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "calderMobile" });
  const J: Record<string, Joint> = {};
  J["anchor"] = b.joint("anchor", { at: [0,2.4,0], dir: [0,-1,0], role: "spine", group: "crown" });
  J["crownBar"] = b.joint("crownBar", { parent: J["anchor"], at: [0,2.14,0], dir: [1,0,0], role: "hinge", group: "crown" });
  J["tierLDrop"] = b.joint("tierLDrop", { parent: J["crownBar"], at: [-0.78,2.1,0], dir: [0,-1,0], role: "spine", group: "tierL" });
  J["tierLBeam"] = b.joint("tierLBeam", { parent: J["tierLDrop"], at: [-0.55,1.72,0.1], dir: [1,0,0], role: "hinge", group: "tierL" });
  J["tierRDrop"] = b.joint("tierRDrop", { parent: J["crownBar"], at: [0.78,2.1,0], dir: [0,-1,0], role: "spine", group: "tierR" });
  J["tierRBeam"] = b.joint("tierRBeam", { parent: J["tierRDrop"], at: [0.5,1.68,-0.08], dir: [1,0,0], role: "hinge", group: "tierR" });
  J["tierCDrop"] = b.joint("tierCDrop", { parent: J["crownBar"], at: [0,2.1,0], dir: [0,-1,0], role: "spine", group: "tierC" });
  J["tierCBeam"] = b.joint("tierCBeam", { parent: J["tierCDrop"], at: [0,1.32,0.12], dir: [1,0,0], role: "hinge", group: "tierC" });
  J["fanDrop"] = b.joint("fanDrop", { parent: J["tierCBeam"], at: [0.05,1.3,0.12], dir: [0,-1,0], role: "spine", group: "petalFan" });
  J["fanBeam"] = b.joint("fanBeam", { parent: J["fanDrop"], at: [0.02,0.55,0.2], dir: [1,0,0], role: "hinge", group: "petalFan" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
