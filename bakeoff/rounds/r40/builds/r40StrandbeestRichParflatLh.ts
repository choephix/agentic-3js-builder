import * as THREE from "three";
import { createBuilder, type Builder, type Joint, catmull, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Strandbeest Tube Walker",
  "description": "A Theo Jansen style wind-walking beach creature built of yellow tubes: a twin-wing sail up front, a crank spine, and six pairs of Jansen linkage legs with feet on the sand."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  tubeYellow: "#f2c230",
  tubeYellowDark: "#c99a1c",
  jointGrey: "#8a929c",
  jointDark: "#3b4048",
  rubber: "#22252a",
  sailWhite: "#f3efe4",
  sailShade: "#d9d2bf",
  bottleBlue: "#4aa3d8",
  bottleCap: "#e8553a",
  zipTie: "#2f6fd0",
  sandAccent: "#d8c08a",
  rope: "#b89968",
};
const M = {
  spineFront: [0, 1.2, 1.3] as [number, number, number],
  spineMid: [0, 1.2, 0] as [number, number, number],
  spineBack: [0, 1.2, -1.6] as [number, number, number],
  crankAxle: [0, 1, 0] as [number, number, number],
  legHipFront: [0, 1, 1] as [number, number, number],
  legHipMid: [0, 1, 0] as [number, number, number],
  legHipBack: [0, 1, -1] as [number, number, number],
  sailMast: [0, 1.3, 1.6] as [number, number, number],
  tailMount: [0, 1.2, -2] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // sailWings
  (() => {
function buildSailWings({ b, J, P, M }: Ctx) {
  const bone = J.sail;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- helpers ----------
  const rod = (a: THREE.Vector3, c: THREE.Vector3, r: number, color: string) =>
    b.rod(a, c, r, color, { bone, sides: 6 });

  const cap = (p: THREE.Vector3, r: number, color: string = P.jointGrey) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at: p, bone });

  const rope = (a: THREE.Vector3, c: THREE.Vector3, sag = 0) => {
    if (sag <= 0) return b.rod(a, c, 0.007, P.rope, { bone, sides: 5 });
    const m = a.clone().lerp(c, 0.5);
    m.y -= sag;
    return b.sweep(catmull([a, m, c]), 0.007, { bone, color: P.rope, sides: 5 });
  };

  const perpTo = (dir: THREE.Vector3) => {
    const d = dir.clone().normalize();
    let p = d.clone().cross(V(0, 1, 0));
    if (p.lengthSq() < 0.05) p = d.clone().cross(V(1, 0, 0));
    return p.normalize();
  };

  // zip tie: a ring around a tube plus its snipped tail
  const zip = (at: THREE.Vector3, dir: THREE.Vector3, R = 0.024) => {
    b.part(new THREE.TorusGeometry(R, 0.005, 5, 10), P.zipTie, { at, bone, dir, axis: "z" });
    const pp = perpTo(dir);
    b.part(new THREE.BoxGeometry(0.009, 0.026, 0.006), P.zipTie, {
      at: at.clone().addScaledVector(pp, R + 0.012),
      bone,
      dir: pp,
    });
  };

  // ---------- mast ----------
  const mx = M.sailMast[0], my = M.sailMast[1], mz = M.sailMast[2];
  const mastBase = V(mx, my, mz);
  const mastTop = V(mx, 2.12, mz);
  rod(mastBase, mastTop, 0.028, P.tubeYellow);
  // base bearing
  b.part(new THREE.CylinderGeometry(0.075, 0.09, 0.06, 8), P.jointDark, { at: V(mx, my + 0.0, mz), bone });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 8), P.jointGrey, { at: V(mx, my + 0.05, mz), bone });
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    cap(V(mx + Math.cos(a) * 0.07, my + 0.032, mz + Math.sin(a) * 0.07), 0.012, P.jointDark);
  }
  // collars on the mast
  for (const y of [1.5, 1.82]) {
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.045, 8), P.jointGrey, { at: V(mx, y, mz), bone });
  }
  zip(V(mx, 1.68, mz), V(0, 1, 0), 0.036);
  zip(V(mx, 1.95, mz), V(0, 1, 0), 0.036);
  cap(mastTop, 0.045, P.jointGrey);
  cap(V(mx, 2.12, mz + 0.0), 0.02, P.jointDark);

  // pennant at mast top
  b.slab([V(mx, 2.1, mz - 0.03), V(mx, 1.99, mz - 0.03), V(mx, 2.05, mz - 0.34)], {
    color: P.bottleCap,
    thickness: 0.008,
    bone,
  });
  rod(V(mx, 2.11, mz - 0.03), V(mx, 1.99, mz - 0.03), 0.008, P.tubeYellowDark);

  // bowsprit and forestay
  const bowBase = V(mx, 1.3, mz + 0.02);
  const bowTip = V(mx, 1.4, 2.11);
  rod(bowBase, bowTip, 0.02, P.tubeYellow);
  cap(bowTip, 0.03);
  zip(bowBase.clone().lerp(bowTip, 0.5), bowTip.clone().sub(bowBase), 0.026);
  rope(mastTop, bowTip, 0.02);
  cap(bowTip.clone().add(V(0, 0.0, 0.0)), 0.016, P.jointDark);

  // rope stay from mast top to spine front
  const sf = M.spineFront;
  const spineFrontPt = V(sf[0], sf[1] + 0.02, sf[2]);
  rope(mastTop, spineFrontPt, 0.0);
  cap(spineFrontPt, 0.022, P.jointDark);

  // ---------- wings ----------
  const L = 1.6; // wing length along cant
  const h = 0.35; // half depth along z
  const dx0 = 0.85, dy0 = 0.527;
  const dl = Math.hypot(dx0, dy0);
  const vs = [0.04, 0.55, 1.09, L - 0.04];

  for (const s of [1, -1]) {
    const dx = (dx0 / dl) * s, dy = dy0 / dl;
    const W = (u: number, v: number) => V(s * 0.15 + dx * v, 1.25 + dy * v, mz + u);
    const dir = V(dx, dy, 0);

    // frame rectangle
    rod(W(-h, 0), W(h, 0), 0.02, P.tubeYellow);
    rod(W(-h, L), W(h, L), 0.02, P.tubeYellow);
    rod(W(h, 0), W(h, L), 0.02, P.tubeYellow);
    rod(W(-h, 0), W(-h, L), 0.02, P.tubeYellow);
    for (const u of [-h, h]) for (const v of [0, L]) cap(W(u, v), 0.034);

    // central spar
    rod(W(0, 0), W(0, L), 0.02, P.tubeYellow);
    cap(W(0, 0), 0.028, P.jointDark);
    cap(W(0, L), 0.034, P.jointGrey);
    cap(W(0, L), 0.018, P.jointDark);
    // spar-to-edge T caps
    cap(W(-h, L / 2), 0.0);
    // cloth panels
    for (let i = 0; i < 3; i++) {
      const a = vs[i] + (i === 0 ? 0 : 0.012);
      const c = vs[i + 1] - (i === 2 ? 0 : 0.012);
      const hc = h - 0.022;
      b.slab([W(-hc, a), W(hc, a), W(hc, c), W(-hc, c)], {
        color: P.sailWhite,
        thickness: 0.008,
        bone,
      });
    }
    // seams
    for (const v of [vs[1], vs[2]]) {
      rod(W(-h + 0.01, v), W(h - 0.01, v), 0.009, P.sailShade);
      cap(W(-h, v), 0.017, P.jointDark);
      cap(W(h, v), 0.017, P.jointDark);
    }
    // seam along spar on cloth (centre seam)
    rod(W(0, vs[0]), W(0, vs[3]), 0.011, P.sailShade);
    // corner reinforcement patches
    const hc = h - 0.022;
    for (const su of [-1, 1]) {
      for (const [vv, sv] of [
        [vs[0], 1],
        [vs[3], -1],
      ] as [number, number][]) {
        b.slab([W(su * hc, vv), W(su * (hc - 0.13), vv), W(su * hc, vv + sv * 0.13)], {
          color: P.sailShade,
          thickness: 0.013,
          bone,
        });
      }
    }
    // diagonal braces
    rod(W(-h, 0), W(h, vs[1]), 0.013, P.tubeYellowDark);
    rod(W(h, vs[2]), W(-h, L), 0.013, P.tubeYellowDark);

    // zip ties on frame
    zip(W(h, L * 0.3), dir);
    zip(W(h, L * 0.75), dir);
    zip(W(-h, L * 0.3), dir);
    zip(W(-h, L * 0.75), dir);
    zip(W(0.0, 0.0).clone().add(V(0, 0, 0)).lerp(W(h, 0), 0.5), V(0, 0, 1));
    zip(W(0.0, 0.0).clone().lerp(W(-h, 0), 0.5), V(0, 0, 1));
    zip(W(0, L * 0.45), dir, 0.026);
    zip(W(0, L * 0.88), dir, 0.026);

    // supporting arms to the mast (triangle)
    const armMast = V(mx, 1.5, mz);
    rod(armMast, W(0, 0.5), 0.017, P.tubeYellow);
    rod(V(mx, 1.4, mz - 0.01), W(-h, 0), 0.015, P.tubeYellow);
    rod(V(mx, 1.4, mz + 0.01), W(h, 0), 0.015, P.tubeYellow);
    cap(W(0, 0.5), 0.024, P.jointGrey);
    cap(V(mx, 1.4, mz), 0.03, P.jointGrey);
    cap(armMast, 0.026, P.jointDark);

    // rope shroud from mast top to wing tip, and lower stay to the spine front
    rope(mastTop, W(0, L), 0.05);
    const guy = W(0, 1.0);
    rope(guy, V(s * 0.14, sf[1] + 0.02, sf[2]), 0.0);
    cap(V(s * 0.14, sf[1] + 0.02, sf[2]), 0.02, P.jointDark);
    cap(guy, 0.02, P.jointDark);
    // rope loops at the front/back top corners
    rope(W(h, L), W(0, L * 0.6).clone().add(V(0, 0, 0.0)), 0.0);
    rope(W(-h, L), W(0, L * 0.6), 0.0);
  }

  // mast guy lines fore and aft to the frame corners of the wing roots (small lashing detail)
  for (const zOff of [-0.1, 0.1]) {
    b.part(new THREE.TorusGeometry(0.036, 0.007, 4, 10), P.rope, {
      at: V(mx, 1.38 + zOff * 0.0, mz),
      bone,
      dir: V(0, 1, 0),
      axis: "z",
    });
    break;
  }
}
    return buildSailWings;
  })(),
  // spineCrank
  (() => {
type Ctx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, [number, number, number]>;
};

function buildSpineCrank({ b, J, P, M }: Ctx) {
  const YEL = P.tubeYellow;
  const YEL_D = P.tubeYellowDark;
  const GREY = P.jointGrey;
  const DARK = P.jointDark;
  const TIE = P.zipTie;

  const R_TUBE = 0.035;
  const R_STRUT = 0.02;
  const AXLE_Y = M.crankAxle[1];
  const AXLE_R = 0.03;
  const LEG_Z = [M.legHipFront[2], M.legHipMid[2], M.legHipBack[2]];
  const PHASE = [0, 120, 240];

  type V = [number, number, number];

  // ---------- helpers ----------
  const rod = (a: V, c: V, r: number, color: string, bone: any = J.body) =>
    b.rod(a, c, r, color, { bone, sides: 8 });

  const ball = (at: V, r: number, color: string, bone: any = J.body) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at, bone, flat: true });

  const box = (at: V, size: V, color: string, bone: any = J.body) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, bone });

  // zip tie around a tube running along z, with the little tail
  const zipTie = (x: number, y: number, z: number, bone: any = J.body) => {
    b.part(new THREE.TorusGeometry(R_TUBE + 0.006, 0.0075, 5, 10), TIE, { at: [x, y, z], bone });
    box([x, y + R_TUBE + 0.022, z], [0.012, 0.03, 0.012], TIE, bone);
  };

  // ---------- spine: three parallel tubes (triangle section) ----------
  const TOP: [number, number] = [0, 1.45];
  const LEFT: [number, number] = [0.3, 1.15];
  const RIGHT: [number, number] = [-0.3, 1.15];
  const prof = [TOP, LEFT, RIGHT];
  const zBack = M.spineBack[2];
  const zFront = M.spineFront[2];
  const zA = -1.2; // end of rear convergence
  const zB = 1.0; // start of front convergence

  for (const [px, py] of prof) {
    b.sweep(
      [
        [0, M.spineBack[1], zBack],
        [px, py, zA],
        [px, py, zB],
        [0, M.spineFront[1], zFront],
      ],
      R_TUBE,
      { bone: J.body, color: YEL, sides: 8 },
    );
  }

  // end caps (rope eyes) at the spine mounts
  for (const [m, dz] of [
    [M.spineFront, 1],
    [M.spineBack, -1],
  ] as [V, number][]) {
    ball(m, 0.058, GREY);
    b.part(new THREE.TorusGeometry(0.05, 0.011, 5, 10), DARK, {
      at: [m[0], m[1] + 0.012, m[2] + dz * 0.07],
      dir: [0, 1, 0],
      axis: "z",
      bone: J.body,
    });
  }

  // ---------- cross-struts, joint caps, bracing ----------
  const zs = [-1.2, -1.0, -0.6, -0.3, 0, 0.3, 0.6, 1.0];
  const node = (i: number, k: number): V => [prof[k][0], prof[k][1], zs[i]];

  zs.forEach((z, i) => {
    // triangle ring of struts
    rod(node(i, 0), node(i, 1), R_STRUT, YEL_D);
    rod(node(i, 1), node(i, 2), R_STRUT, YEL_D);
    rod(node(i, 2), node(i, 0), R_STRUT, YEL_D);
    for (let k = 0; k < 3; k++) ball(node(i, k), 0.045, GREY);
    // zip ties on every station for the top, alternating for the lower pair
    zipTie(TOP[0], TOP[1], z);
    if (i % 2 === 0) {
      zipTie(LEFT[0], LEFT[1], z);
      zipTie(RIGHT[0], RIGHT[1], z);
    }
  });

  // helical diagonal bracing between stations
  for (let i = 0; i < zs.length - 1; i++) {
    const order = i % 2 === 0 ? [0, 1, 2] : [0, 2, 1];
    for (let j = 0; j < 3; j++) {
      const from = order[j];
      const to = order[(j + 1) % 3];
      rod(node(i, from), node(i + 1, to), 0.016, YEL);
    }
  }

  // ---------- crank axles, bearings, discs ----------
  LEG_Z.forEach((z, li) => {
    // axle
    rod([-1.05, AXLE_Y, z], [1.05, AXLE_Y, z], AXLE_R, GREY, J.crank);
    for (const s of [1, -1]) {
      ball([s * 1.05, AXLE_Y, z], 0.036, DARK, J.crank);
      // collars
      b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.03, 8), DARK, {
        at: [s * 0.92, AXLE_Y, z],
        dir: [1, 0, 0],
        bone: J.crank,
      });
      b.part(new THREE.CylinderGeometry(0.044, 0.044, 0.025, 8), DARK, {
        at: [s * 0.7, AXLE_Y, z],
        dir: [1, 0, 0],
        bone: J.crank,
      });
    }

    // side bearing blocks, bolted to the lower tubes
    for (const s of [1, -1]) {
      box([s * 0.3, AXLE_Y + 0.075, z], [0.12, 0.19, 0.13], DARK);
      box([s * 0.3, AXLE_Y + 0.172, z], [0.15, 0.025, 0.16], GREY);
      b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.14, 8), GREY, {
        at: [s * 0.3, AXLE_Y, z],
        dir: [1, 0, 0],
        bone: J.body,
      });
      for (const dz of [1, -1]) {
        b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.016, 6), GREY, {
          at: [s * 0.3, AXLE_Y + 0.09, z + dz * 0.07],
          dir: [0, 0, dz],
          bone: J.body,
        });
      }
    }

    // central bearing block hung from the top tube
    box([0, AXLE_Y, z], [0.2, 0.14, 0.16], DARK);
    b.part(new THREE.CylinderGeometry(0.056, 0.056, 0.22, 8), GREY, {
      at: [0, AXLE_Y, z],
      dir: [1, 0, 0],
      bone: J.body,
    });
    rod([0, TOP[1], z], [0, AXLE_Y + 0.07, z], 0.024, YEL_D);
    ball([0, AXLE_Y + 0.075, z], 0.04, GREY);
    for (const dz of [1, -1]) {
      b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.016, 6), GREY, {
        at: [0, AXLE_Y, z + dz * 0.085],
        dir: [0, 0, dz],
        bone: J.body,
      });
    }

    // crank discs and pins, one per side, phase per leg (right side offset 180)
    for (const s of [1, -1]) {
      const phi = ((PHASE[li] + (s < 0 ? 180 : 0)) * Math.PI) / 180;
      const off = 0.075;
      const py = AXLE_Y + off * Math.cos(phi);
      const pz = z + off * Math.sin(phi);
      const xd = s * 0.55;
      b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.04, 12), YEL_D, {
        at: [xd, AXLE_Y, z],
        dir: [1, 0, 0],
        bone: J.crank,
      });
      b.part(new THREE.CylinderGeometry(0.048, 0.048, 0.016, 8), DARK, {
        at: [xd + s * 0.026, AXLE_Y, z],
        dir: [1, 0, 0],
        bone: J.crank,
      });
      // crank arm from hub to pin
      rod([xd + s * 0.03, AXLE_Y, z], [xd + s * 0.03, py, pz], 0.017, GREY, J.crank);
      // pin sticking out for the leg rod
      rod([xd, py, pz], [s * 0.74, py, pz], 0.016, GREY, J.crank);
      ball([s * 0.74, py, pz], 0.03, GREY, J.crank);
      b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.012, 8), DARK, {
        at: [s * 0.62, py, pz],
        dir: [1, 0, 0],
        bone: J.crank,
      });
      // small marker dot on the disc rim opposite the pin
      ball([xd + s * 0.022, AXLE_Y - off * 1.1 * Math.cos(phi), z - off * 1.1 * Math.sin(phi)], 0.014, DARK, J.crank);
    }
  });

  // axle spacers tying the three axles into the spine frame: rods from lower tubes down to axle ends at z=0
  for (const s of [1, -1]) {
    rod([s * 0.3, LEFT[1], 0], [s * 0.3, AXLE_Y + 0.02, 0], 0.02, YEL_D);
  }
}
    return buildSpineCrank;
  })(),
  // legsLeft
  (() => {
type P3 = [number, number, number];
type V2 = { z: number; y: number };

function buildLegsLeft({ b, J, P, M }: Ctx) {
  // ---------- palette ----------
  const YEL = P.tubeYellow;
  const YEL2 = P.tubeYellowDark;
  const GREY = P.jointGrey;
  const DARK = P.jointDark;
  const RUB = P.rubber;
  const BLUE = P.zipTie;

  // ---------- Jansen linkage (the "holy numbers") ----------
  const L = { a: 38, b: 41.5, c: 39.3, d: 40.1, e: 55.8, f: 39.4, g: 36.7, h: 65.7, i: 49, j: 50, k: 61.9, l: 7.8, m: 15 };
  const S = 0.0098; // metres per linkage unit
  const R = 0.017; // uniform tube radius
  const GAP = 0.2; // distance between the two link planes of one leg
  const DL = 0.05; // inset of the second link layer
  const v2 = (z: number, y: number): V2 => ({ z, y });
  const dist = (p: V2, q: V2) => Math.hypot(p.z - q.z, p.y - q.y);

  // Circle intersection: point at ra from a and rb from c, branch nearest to ref (clamped if unreachable).
  function circ(a: V2, ra: number, c: V2, rb: number, ref: V2): V2 {
    const dz = c.z - a.z;
    const dy = c.y - a.y;
    const d = Math.hypot(dz, dy);
    if (d < 1e-6) return ref;
    const dd = Math.min(Math.max(d, Math.abs(ra - rb) + 1e-4), ra + rb - 1e-4);
    const x = (ra * ra - rb * rb + dd * dd) / (2 * dd);
    const h = Math.sqrt(Math.max(ra * ra - x * x, 0));
    const ux = dz / d;
    const uy = dy / d;
    const bz = a.z + ux * x;
    const by = a.y + uy * x;
    const c1 = v2(bz - uy * h, by + ux * h);
    const c2 = v2(bz + uy * h, by - ux * h);
    return dist(c1, ref) < dist(c2, ref) ? c1 : c2;
  }
  const REF = {
    J1: v2(14, 39.1),
    J2: v2(11.05, -37.7),
    J3: v2(-15.2, 11.6),
    J4: v2(21.7, -2.5),
    F: v2(8.5, -49.7),
  };
  const P0 = v2(0, 0);
  const C0 = v2(L.a, L.l);
  function solve(theta: number) {
    const Q = v2(L.a + L.m * Math.cos(theta), L.l + L.m * Math.sin(theta));
    const J1 = circ(P0, L.b, Q, L.j, REF.J1);
    const J2 = circ(P0, L.c, Q, L.k, REF.J2);
    const J3 = circ(J1, L.d, J2, L.e, REF.J3);
    const J4 = circ(J3, L.f, J2, L.g, REF.J4);
    const F = circ(J3, L.h, J4, L.i, REF.F);
    return { Q, J1, J2, J3, J4, F };
  }

  const hipY = M.legHipFront[1];
  const py = hipY - L.l * S;

  const legs = [
    { name: "Front", z0: M.legHipFront[2], xi: 0.56, theta: 200 },
    { name: "Mid", z0: M.legHipMid[2], xi: 0.84, theta: 80 },
    { name: "Back", z0: M.legHipBack[2], xi: 0.56, theta: 320 },
  ].map((l) => ({ ...l, pz: l.z0 - 0.3, s: solve((l.theta * Math.PI) / 180) }));

  // Shared lower-leg extension: the lowest foot just touches y = 0, the others are lifted by their phase.
  const FOOT_H = 0.09;
  const END_MIN = FOOT_H - 0.017; // tube end height for a foot whose sole sits on the floor
  const shinDir = (s: ReturnType<typeof solve>) => {
    const dz = s.F.z - s.J4.z;
    const dy = s.F.y - s.J4.y;
    const n = Math.hypot(dz, dy);
    return v2(dz / n, dy / n);
  };
  let ext = 1e9;
  for (const l of legs) {
    const d = shinDir(l.s);
    const fy = py + l.s.F.y * S;
    const e = d.y < -0.3 ? (fy - END_MIN) / -d.y : 0.3;
    ext = Math.min(ext, e);
  }
  ext = Math.max(ext, 0.1);

  // ---------- per leg ----------
  for (const leg of legs) {
    const { xi, z0, pz, s, name } = leg;
    const xo = xi + GAP;
    const xm = xi + GAP / 2;
    const W = (p: V2, x: number): P3 => [x, py + p.y * S, pz + p.z * S];
    const xsFor = (layer: number) => (layer ? [xi + DL, xo - DL] : [xi, xo]);

    const link = (a: V2, c: V2, layer: number) => {
      for (const x of xsFor(layer))
        b.rod(W(a, x), W(c, x), R, layer ? YEL2 : YEL, { bone: J.body, sides: 8 });
    };
    // Zip tie wrapped round a link at fraction t, on its outer layer.
    const tie = (a: V2, c: V2, t: number, layer: number) => {
      const x = xsFor(layer)[1];
      const pa = W(a, x);
      const pc = W(c, x);
      const at: P3 = [x, pa[1] + (pc[1] - pa[1]) * t, pa[2] + (pc[2] - pa[2]) * t];
      b.part(new THREE.TorusGeometry(0.0205, 0.0045, 5, 10), BLUE, {
        bone: J.body,
        at,
        dir: [0, pc[1] - pa[1], pc[2] - pa[2]],
        axis: "z",
        flat: true,
      });
      // pull-tail of the tie
      b.part(new THREE.BoxGeometry(0.008, 0.008, 0.03), BLUE, {
        bone: J.body,
        at: [x, at[1] + 0.024, at[2]],
        dir: [0, pc[1] - pa[1], pc[2] - pa[2]],
        axis: "z",
      });
    };

    // ----- links (ten tubes in two planes) -----
    link(P0, s.J1, 0); // b
    link(s.Q, s.J1, 0); // j
    link(P0, s.J2, 0); // c
    link(s.Q, s.J2, 1); // k
    link(s.J1, s.J3, 1); // d
    link(s.J2, s.J3, 1); // e
    link(s.J2, s.J4, 0); // g
    link(s.J3, s.J4, 0); // f
    link(s.J3, s.F, 1); // h
    link(s.J4, s.F, 1); // i

    // ----- joint pins with grey caps -----
    const pin = (p: V2, bone: typeof J.body) => {
      b.rod(W(p, xi - 0.03), W(p, xo + 0.03), 0.009, DARK, { bone, sides: 6 });
      for (const x of [xi - 0.034, xo + 0.034]) {
        b.part(new THREE.CylinderGeometry(0.033, 0.033, 0.02, 8), GREY, {
          bone,
          at: W(p, x),
          dir: [1, 0, 0],
          flat: true,
        });
      }
      b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.014, 6), DARK, {
        bone,
        at: W(p, xo + 0.046),
        dir: [1, 0, 0],
        flat: true,
      });
    };
    pin(P0, J.body);
    pin(s.Q, J.crank);
    pin(s.J1, J.body);
    pin(s.J2, J.body);
    pin(s.J3, J.body);
    pin(s.J4, J.body);
    pin(s.F, J.body);

    // ----- zip ties -----
    tie(P0, s.J1, 0.62, 0);
    tie(s.Q, s.J1, 0.3, 0);
    tie(P0, s.J2, 0.5, 0);
    tie(s.J1, s.J3, 0.5, 1);
    tie(s.J3, s.F, 0.35, 1);
    tie(s.J4, s.F, 0.65, 1);

    // ----- crank (rides the crank joint) -----
    const C = W(C0, xm);
    const Qm = W(s.Q, xm);
    b.rod([0.1, C[1], C[2]], [xo + 0.07, C[1], C[2]], 0.018, YEL2, { bone: J.crank, sides: 8 });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8), GREY, {
      bone: J.crank,
      at: [xo + 0.075, C[1], C[2]],
      dir: [1, 0, 0],
      flat: true,
    });
    b.rod(C, Qm, 0.02, YEL, { bone: J.crank, sides: 8 });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.022, 10), GREY, {
      bone: J.crank,
      at: C,
      dir: [1, 0, 0],
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 6), DARK, {
      bone: J.crank,
      at: [xm + 0.004, C[1], C[2]],
      dir: [1, 0, 0],
      flat: true,
    });
    // counterweight opposite the pin
    const cw: P3 = [xm, C[1] - (Qm[1] - C[1]) * 0.45, C[2] - (Qm[2] - C[2]) * 0.45];
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 8), DARK, {
      bone: J.crank,
      at: cw,
      dir: [1, 0, 0],
      flat: true,
    });

    // ----- hip block and brackets to the body -----
    const hz = z0 + 0.04;
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.12), GREY, { bone: J.body, at: [0.1, hipY, hz] });
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 6), DARK, {
      bone: J.body,
      at: [0.155, hipY, hz],
      dir: [1, 0, 0],
      flat: true,
    });
    b.rod([0.1, hipY, hz], W(P0, xi), R, YEL2, { bone: J.body, sides: 8 });
    b.rod([0.1, hipY + 0.09, hz], W(P0, xo), R, YEL2, { bone: J.body, sides: 8 });

    // ----- long lower leg and rubber feet -----
    const d = shinDir(s);
    const Fm = W(s.F, 0);
    const endY = Fm[1] + d.y * ext;
    const endZ = Fm[2] + d.z * ext;
    for (const x of [xi, xo]) {
      b.rod(W(s.F, x), [x, endY, endZ], R, YEL, { bone: J.body, sides: 8 });
      // grey collar on the lower leg
      b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.03, 8), GREY, {
        bone: J.body,
        at: [x, Fm[1] + d.y * ext * 0.55, Fm[2] + d.z * ext * 0.55],
        dir: [0, d.y, d.z],
        flat: true,
      });
      // rubber foot, sole on the end height minus its length
      b.part(new THREE.CylinderGeometry(0.032, 0.048, FOOT_H, 8), RUB, {
        bone: J.body,
        at: [x, endY - 0.03, endZ],
        flat: true,
      });
      b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.012, 8), DARK, {
        bone: J.body,
        at: [x, endY - 0.004, endZ],
        flat: true,
      });
    }
    // cross-bar tying the two shin tubes together
    b.rod([xi, endY, endZ], [xo, endY, endZ], 0.012, YEL2, { bone: J.body, sides: 6 });
    void name;
  }
}
    return buildLegsLeft;
  })(),
  // legsRight
  (() => {
function buildLegsRight({ b, J, P }: { b: any; J: any; P: any; M: any }) {
  const DEG = Math.PI / 180;
  type V2 = [number, number];
  const R = 0.014; // uniform tube radius
  const ZOFF = 0.14; // crank sits this far ahead of the hip mount so the leg is centred on it
  const rand = rng(11);

  // ---------- 2D Jansen-style linkage (u forward, v up), solved from a hand-drawn canonical pose ----------
  const dist = (p: V2, q: V2) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  function circ(p0: V2, r0: number, p1: V2, r1: number, hint: V2): V2 {
    const dx = p1[0] - p0[0];
    const dy = p1[1] - p0[1];
    const d = Math.hypot(dx, dy) || 1e-6;
    const a = (r0 * r0 - r1 * r1 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, r0 * r0 - a * a));
    const bx = p0[0] + (a * dx) / d;
    const by = p0[1] + (a * dy) / d;
    const px = -dy / d;
    const py = dx / d;
    const c1: V2 = [bx + h * px, by + h * py];
    const c2: V2 = [bx - h * px, by - h * py];
    return dist(c1, hint) <= dist(c2, hint) ? c1 : c2;
  }
  const CR = 0.07;
  const CAN: Record<string, V2> = {
    A: [-0.17, 0.03],
    C: [-0.13, 0.2],
    D: [-0.36, -0.2],
    E: [-0.06, -0.4],
    F: [-0.3, -0.62],
    G: [0.02, -1.0],
  };
  const B0: V2 = [0, -CR];
  const L = {
    AC: dist(CAN.A, CAN.C),
    BC: dist(B0, CAN.C),
    AD: dist(CAN.A, CAN.D),
    BD: dist(B0, CAN.D),
    CE: dist(CAN.C, CAN.E),
    DE: dist(CAN.D, CAN.E),
    DF: dist(CAN.D, CAN.F),
    EF: dist(CAN.E, CAN.F),
    EG: dist(CAN.E, CAN.G),
    FG: dist(CAN.F, CAN.G),
  };
  function solve(theta: number, footV: number) {
    const A = CAN.A;
    const Bp: V2 = [CR * Math.cos(theta), CR * Math.sin(theta)];
    const C = circ(A, L.AC, Bp, L.BC, CAN.C);
    const D = circ(A, L.AD, Bp, L.BD, CAN.D);
    const E = circ(C, L.CE, D, L.DE, CAN.E);
    const F = circ(D, L.DF, E, L.EF, CAN.F);
    let G = circ(E, L.EG, F, L.FG, CAN.G);
    const k = (footV - E[1]) / (G[1] - E[1]);
    G = [E[0] + (G[0] - E[0]) * k, E[1] + (G[1] - E[1]) * k];
    return { A, B: Bp, C, D, E, F, G } as Record<string, V2>;
  }

  // ---------- helpers ----------
  const tube = (p0: THREE.Vector3, p1: THREE.Vector3, color: string, bone: any, r = R) =>
    b.rod(p0, p1, r, color, { bone, sides: 6 });
  const bolt = (at: THREE.Vector3, color: string, bone: any, r = 0.02, len = 0.09) =>
    b.part(new THREE.CylinderGeometry(r, r, len, 8), color, { at, dir: [1, 0, 0], bone });
  const dirOf = (p0: THREE.Vector3, p1: THREE.Vector3) => p1.clone().sub(p0).normalize().toArray();
  const lerp3 = (p0: THREE.Vector3, p1: THREE.Vector3, t: number) => p0.clone().lerp(p1, t);

  // layer offset (along x) for every link so crossing tubes pass each other
  const links: [string, string, number][] = [
    ["A", "C", 0.02],
    ["A", "D", -0.02],
    ["B", "C", -0.02],
    ["B", "D", 0.02],
    ["C", "E", 0.02],
    ["D", "E", -0.02],
    ["D", "F", 0.02],
    ["E", "F", -0.02],
    ["E", "G", -0.02],
    ["F", "G", 0.02],
  ];

  const hipZ = [1, 0, -1];
  const phaseOff = [-45, 0, 45];
  const planeX = [-0.45, -0.68];
  const railX = -0.8;

  hipZ.forEach((hz, h) => {
    const z0 = hz + ZOFF;
    const zA = z0 + CAN.A[0];

    // crank axle running out from the spine to this hip's planes (rides the crank)
    b.rod([-0.2, 1, z0], [-0.76, 1, z0], 0.02, P.jointGrey, { bone: J.crank, sides: 8 });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8), P.jointDark, { at: [-0.77, 1, z0], dir: [1, 0, 0], bone: J.crank });

    // fixed pivot rod (point A) from the body out to the side rail
    b.rod([-0.2, 1.03, zA], [railX, 1.03, zA], 0.017, P.tubeYellowDark, { bone: J.body, sides: 6 });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), P.jointGrey, { at: [railX, 1.03, zA], bone: J.body });
    for (const x of planeX)
      b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.012, 8), P.jointDark, { at: [x, 1.03, zA], dir: [1, 0, 0], bone: J.body });

    planeX.forEach((px, p) => {
      const planted = (h + p) % 2 === 0;
      const theta = (-90 + phaseOff[h] + (planted ? 0 : 180)) * DEG;
      const n = solve(theta, planted ? -0.94 : -0.78);
      const W = (key: string, dx = 0) => new THREE.Vector3(px + dx, 1 + n[key][1], z0 + n[key][0]);
      const O = new THREE.Vector3(px, 1, z0);

      // crank: disc, arm and pin ride the crank joint
      b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.02, 10), P.jointGrey, { at: [px + 0.035, 1, z0], dir: [1, 0, 0], bone: J.crank });
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 8), P.jointDark, { at: [px + 0.02, 1, z0], dir: [1, 0, 0], bone: J.crank });
      tube(O, W("B"), P.tubeYellowDark, J.crank);

      // linkage tubes
      links.forEach(([a, c, lay], i) => {
        const p0 = W(a, lay);
        const p1 = W(c, lay);
        tube(p0, p1, P.tubeYellow, J.body);
        if (i === 4 || i === 8) {
          // darker sleeves on the long tubes
          const at = lerp3(p0, p1, i === 4 ? 0.28 : 0.3);
          b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.09, 8), P.tubeYellowDark, { at, dir: dirOf(p0, p1), bone: J.body });
        }
        if (i === 4 || i === 6 || i === 8) {
          // zip tie ring
          const at = lerp3(p0, p1, 0.55 + rand() * 0.15);
          b.part(new THREE.TorusGeometry(0.019, 0.005, 4, 8), P.zipTie, { at, dir: dirOf(p0, p1), axis: "z", bone: J.body });
        }
      });

      // joint bolts with outer washers
      for (const key of ["B", "C", "D", "E", "F"]) {
        const bone = key === "B" ? J.crank : J.body;
        const at = W(key);
        bolt(at, P.jointGrey, bone);
        b.part(new THREE.CylinderGeometry(0.027, 0.027, 0.01, 8), P.jointDark, {
          at: W(key, -0.045),
          dir: [1, 0, 0],
          bone,
        });
      }

      // foot: rubber pad with ankle cap
      const G = W("G", -0.02);
      b.part(new THREE.CylinderGeometry(0.034, 0.05, 0.1, 8), P.rubber, {
        at: [G.x, G.y - 0.02, G.z],
        bone: J.body,
      });
      b.part(new THREE.SphereGeometry(0.027, 8, 6), P.jointGrey, { at: [G.x, G.y + 0.01, G.z], bone: J.body });
    });
  });

  // side rail tying the three fixed pivots together
  const zFront = 1 + ZOFF + CAN.A[0];
  const zBack = -1 + ZOFF + CAN.A[0];
  b.rod([railX, 1.03, zFront + 0.1], [railX, 1.03, zBack - 0.1], 0.02, P.tubeYellow, { bone: J.body, sides: 6 });
  for (const z of [zFront + 0.1, zBack - 0.1])
    b.part(new THREE.SphereGeometry(0.03, 8, 6), P.jointGrey, { at: [railX, 1.03, z], bone: J.body });
}
    return buildLegsRight;
  })(),
  // tailBallast
  (() => {
function buildTailBallast({ b, J, P, M }: { b: any; J: any; P: any; M: any }) {
  const YEL = P.tubeYellow;
  const YEL_D = P.tubeYellowDark;
  const TUBE_R = 0.022;

  // ---- helpers -----------------------------------------------------------------------------
  const tube = (a: number[], c: number[], bone: any, color = YEL, r = TUBE_R) =>
    b.rod(a, c, r, color, { bone, sides: 6 });

  const cap = (p: number[], bone: any, r = 0.034) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), P.jointGrey, { bone, at: p });

  const zip = (p: number[], axisDir: number[], bone: any, r = 0.03) =>
    b.part(new THREE.TorusGeometry(r, 0.006, 4, 10), P.zipTie, { bone, at: p, dir: axisDir, axis: "z" });

  // ---- spine boom: spineBack -> tailMount -------------------------------------------------
  const sb = M.spineBack as number[];
  const tm = M.tailMount as number[];
  const boomMid: number[] = [0, 1.2, -1.82];
  const boomEnd: number[] = [0, tm[1], -2.12];
  tube(sb, boomMid, J.body, YEL, 0.026);
  tube(boomMid, boomEnd, J.tail, YEL, 0.026);
  cap(boomMid, J.tail, 0.04);
  cap(boomEnd, J.tail, 0.036);

  // ---- rear frame (two rings joined by long rails) ---------------------------------------
  const ZF = -1.62; // front ring
  const ZR = -1.88; // rear ring
  const X = 0.52;
  const YB = 0.95;
  const YT = 1.42;
  for (const s of [1, -1]) {
    tube([s * X, YB, ZF], [s * X, YT, ZF], J.body);
    tube([s * X, YB, ZR], [s * X, YT, ZR], J.tail);
    tube([s * X, YT, ZF], [s * X, YT, ZR], J.tail, YEL_D);
    cap([s * X, YT, ZF], J.body);
    cap([s * X, YT, ZR], J.tail);
    // zip ties lashing the posts
    zip([s * X, 1.1, ZR], [0, 1, 0], J.tail, 0.03);
  }
  tube([-X, YT, ZF], [X, YT, ZF], J.body);
  tube([-X, YT, ZR], [X, YT, ZR], J.tail);
  // centre posts linking the boom to the top rails
  tube([0, 1.2, ZF], [0, YT, ZF], J.body);
  tube([0, 1.2, ZR], [0, YT, ZR], J.tail);

  // ---- bottle cluster ---------------------------------------------------------------------
  const BOTTLE: [number, number][] = [
    [0, 0],
    [0.085, 0.0],
    [0.1, 0.04],
    [0.1, 0.3],
    [0.085, 0.36],
    [0.045, 0.4],
    [0.032, 0.43],
    [0.032, 0.45],
    [0, 0.45],
  ];
  const Z0 = -1.64;
  const bottles: [number, number][] = [
    [-0.33, 1.05],
    [-0.11, 1.05],
    [0.11, 1.05],
    [0.33, 1.05],
    [-0.22, 1.22],
    [0.22, 1.22],
  ];
  for (const [x, y] of bottles) {
    b.lathe(BOTTLE, {
      at: [x, y, Z0],
      axis: [0, 0, -1],
      segments: 8,
      color: P.bottleBlue,
      bone: J.tail,
    });
    // red cap
    b.part(new THREE.CylinderGeometry(0.037, 0.037, 0.05, 8), P.bottleCap, {
      bone: J.tail,
      at: [x, y, Z0 - 0.475],
      dir: [0, 0, -1],
    });
    // rope lashing around the bottle body
    b.part(new THREE.TorusGeometry(0.102, 0.009, 4, 10), P.rope, {
      bone: J.tail,
      at: [x, y, Z0 - 0.12],
      dir: [0, 0, 1],
      axis: "z",
    });
  }

  // ---- sand-drift pads under the lower bottles (kept above the floor) ----------------------
  for (const [x] of bottles.slice(0, 4)) {
    b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.04, 8), P.sandAccent, {
      bone: J.tail,
      at: [x, 0.925, -1.86],
      scale: [1, 1, 1.5],
    });
  }

  // ---- rudder fin --------------------------------------------------------------------------
  const FZ = -1.98;
  const mastTop: number[] = [0, 1.88, FZ];
  tube([0, 1.2, FZ], mastTop, J.tail);
  const topRear: number[] = [0, 1.8, -2.16];
  const botRear: number[] = [0, 1.46, -2.16];
  const botFront: number[] = [0, 1.46, FZ];
  tube(mastTop, topRear, J.tail);
  tube(topRear, botRear, J.tail);
  tube(botRear, botFront, J.tail);
  tube(botFront, topRear, J.tail, YEL_D, 0.016); // diagonal brace
  for (const p of [mastTop, topRear, botRear, botFront]) cap(p, J.tail, 0.03);

  // white cloth in the frame (outline u runs backward from the mast, v is height)
  b.extrude(
    [
      [0.02, 1.49],
      [0.02, 1.85],
      [0.15, 1.78],
      [0.15, 1.49],
    ],
    { at: [0, 0, FZ], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.012, color: P.sailWhite, bone: J.tail },
  );
  // seams
  tube([0.012, 1.62, FZ - 0.02], [0.012, 1.62, FZ - 0.15], J.tail, P.sailShade, 0.006);
  tube([-0.012, 1.62, FZ - 0.02], [-0.012, 1.62, FZ - 0.15], J.tail, P.sailShade, 0.006);
  // zip tie on the mast
  zip([0, 1.35, FZ], [0, 1, 0], J.tail, 0.03);
  zip([0, 1.7, FZ], [0, 1, 0], J.tail, 0.03);
}
    return buildTailBallast;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "strandbeestTubes" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1.2,0], dir: [0,0,1], role: "spine" });
  J["sail"] = b.joint("sail", { parent: J["body"], at: [0,1.3,1.6], dir: [0,1,0], role: "hinge", group: "sail" });
  J["crank"] = b.joint("crank", { parent: J["body"], at: [0,1,0], dir: [1,0,0], role: "hinge", group: "legs" });
  J["tail"] = b.joint("tail", { parent: J["body"], at: [0,1.2,-2], dir: [0,0,-1], role: "tail", group: "tail" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
