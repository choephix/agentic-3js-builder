import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import { mix, noise, paint, rgb, scales, smoothstep, stripes } from "../src/paint";
import type { Paint } from "../src/paint";

export const meta = {
  name: "Galápagos Giant Tortoise",
  description:
    "A low-poly saddle-domed giant tortoise: faceted carapace of 37 growth-ringed scutes, columnar scaly legs with claws, a long wrinkled neck and a hook-beaked head with a hinged lower jaw.",
  style: "low-poly",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const SKIN = "#7b7467";
const SKIN_DARK = "#4d483f";
const SKIN_LIGHT = "#9a907b";
const THROAT = "#a89d82";
const SEAM = "#2b231a";
const BEAK = "#a38d63";
const BEAK_DARK = "#6e5c3d";
const CLAW = "#cdbf98";
const EYE = "#1f1912";
const EYE_RING = "#b79a52";
const NOSTRIL = "#2a241c";
const TONGUE = "#b5675d";
const PLATE = "#928a77";
const LICHEN = "#bdb99f";
const ALGAE = "#6b7547";

type P2 = [number, number];
type P3 = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Carapace shape: a superellipse plan, a bell-shaped dome, a raised front rim (a gentle saddle) and a flared lip.
const NX = 2.4;
const W = 0.46;
const LF = 0.62;
const LB = 0.6;
const RIN = 0.92; // where the marginal ring starts (normalised radius)
const ROUT = 1.04; // the shell's outer edge

const rad = (d: number) => (d * Math.PI) / 180;
const spow = (v: number) => Math.sign(v) * Math.abs(v) ** (2 / NX);
const sm = (a: number, b: number, x: number) => smoothstep(a, b, x);

/** Normalised plan (xn, zn) to world (x, z). */
function planPt(xn: number, zn: number): P2 {
  return [xn * W * (1 - 0.07 * zn), zn * (zn > 0 ? LF : LB)];
}
/** World (x, z) to normalised plan. */
function unplan(x: number, z: number): P2 {
  const zn = z / (z > 0 ? LF : LB);
  return [x / (W * (1 - 0.07 * zn)), zn];
}
const rhoOf = (xn: number, zn: number) => (Math.abs(xn) ** NX + Math.abs(zn) ** NX) ** (1 / NX);
const rimY = (zn: number) => 0.24 + 0.1 * sm(0.2, 1, zn);
function domeY(xn: number, zn: number) {
  const r = rhoOf(xn, zn);
  const H = 0.42 - 0.17 * sm(0.2, 1, zn);
  if (r <= 1) return rimY(zn) + H * (1 - r ** 2.2) ** 0.7;
  return rimY(zn) - (r - 1) * 0.9;
}
/** A point of the contour of normalised radius rho at parameter angle phi (0 = front, +90 = left). */
function cpt(phi: number, rho: number): P2 {
  return [rho * spow(Math.sin(rad(phi))), rho * spow(Math.cos(rad(phi)))];
}
function phiOf(xn: number, zn: number): number {
  const r = rhoOf(xn, zn);
  const sx = Math.sign(xn) * Math.abs(xn / r) ** (NX / 2);
  const cz = Math.sign(zn) * Math.abs(zn / r) ** (NX / 2);
  return (Math.atan2(sx, cz) * 180) / Math.PI;
}
/** The contour (RIN) point at a given zn on the left side. */
function contourAtZ(zn: number): P2 {
  return [(RIN ** NX - Math.abs(zn) ** NX) ** (1 / NX), zn];
}
function contourAtX(xn: number, front: boolean): P2 {
  const z = (RIN ** NX - Math.abs(xn) ** NX) ** (1 / NX);
  return [xn, front ? z : -z];
}
/** Contour arc samples from phi a to phi b. */
function arcPts(a: number, b: number, rho: number, step = 6): P2[] {
  const n = Math.max(1, Math.ceil(Math.abs(b - a) / step));
  const out: P2[] = [];
  for (let i = 0; i <= n; i++) out.push(cpt(a + ((b - a) * i) / n, rho));
  return out;
}
const mirrorX = (pts: P2[]): P2[] => pts.map(([x, z]) => [-x, z]);

// ---------------------------------------------------------------------------------------------------------------
// Triangle soup helper
class Soup {
  pos: number[] = [];
  tri(a: P3, b: P3, c: P3, out: P3) {
    const ux = b[0] - a[0];
    const uy = b[1] - a[1];
    const uz = b[2] - a[2];
    const vx = c[0] - a[0];
    const vy = c[1] - a[1];
    const vz = c[2] - a[2];
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    const flip = nx * out[0] + ny * out[1] + nz * out[2] < 0;
    const [p, q] = flip ? [c, b] : [b, c];
    this.pos.push(...a, ...p, ...q);
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.pos, 3));
    g.computeVertexNormals();
    return g;
  }
}

type Scute = { geo: THREE.BufferGeometry; centre: P2; size: number };

/**
 * One plate of the shell, from a normalised plan polygon: a stepped low pyramid that follows the dome, with a
 * short skirt so the plate has an edge.
 */
function scute(poly: P2[], o: { inset: number; bump: number; skirt: number }): Scute {
  const w = poly.map(([x, z]) => planPt(x, z));
  // area centroid
  let a = 0;
  let cx = 0;
  let cz = 0;
  for (let i = 0; i < w.length; i++) {
    const [x0, z0] = w[i];
    const [x1, z1] = w[(i + 1) % w.length];
    const f = x0 * z1 - x1 * z0;
    a += f;
    cx += (x0 + x1) * f;
    cz += (z0 + z1) * f;
  }
  const centre: P2 = [cx / (3 * a), cz / (3 * a)];
  // subdivide long edges
  const ring: P2[] = [];
  for (let i = 0; i < w.length; i++) {
    const p0 = w[i];
    const p1 = w[(i + 1) % w.length];
    const n = Math.max(1, Math.ceil(Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) / 0.13));
    for (let k = 0; k < n; k++) ring.push([p0[0] + ((p1[0] - p0[0]) * k) / n, p0[1] + ((p1[1] - p0[1]) * k) / n]);
  }
  // inset toward the centroid
  const inner = ring.map(([x, z]): P2 => {
    const dx = centre[0] - x;
    const dz = centre[1] - z;
    const d = Math.hypot(dx, dz) || 1;
    const m = Math.min(o.inset, d * 0.4);
    return [x + (dx / d) * m, z + (dz / d) * m];
  });
  const size = inner.reduce((s, [x, z]) => s + Math.hypot(x - centre[0], z - centre[1]), 0) / inner.length;
  const heightAt = (x: number, z: number, lift: number): P3 => {
    const [xn, zn] = unplan(x, z);
    return [x, domeY(xn, zn) + lift, z];
  };
  const levels: { f: number; lift: number }[] = [
    { f: 1, lift: -0.004 },
    { f: 0.78, lift: o.bump * 0.5 },
    { f: 0.5, lift: o.bump * 0.85 },
  ];
  const rings = levels.map(({ f, lift }) =>
    inner.map(([x, z]) => heightAt(centre[0] + (x - centre[0]) * f, centre[1] + (z - centre[1]) * f, lift)),
  );
  const top = heightAt(centre[0], centre[1], o.bump);
  const s = new Soup();
  const up: P3 = [0, 1, 0];
  const n = inner.length;
  for (let l = 0; l < rings.length - 1; l++)
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      s.tri(rings[l][i], rings[l][j], rings[l + 1][j], up);
      s.tri(rings[l][i], rings[l + 1][j], rings[l + 1][i], up);
    }
  const last = rings[rings.length - 1];
  for (let i = 0; i < n; i++) s.tri(last[i], last[(i + 1) % n], top, up);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const a0 = rings[0][i];
    const b0 = rings[0][j];
    const a1: P3 = [a0[0], a0[1] - o.skirt, a0[2]];
    const b1: P3 = [b0[0], b0[1] - o.skirt, b0[2]];
    const out: P3 = [(a0[0] + b0[0]) / 2 - centre[0], 0, (a0[2] + b0[2]) / 2 - centre[1]];
    s.tri(a0, b0, b1, out);
    s.tri(a0, b1, a1, out);
  }
  return { geo: s.geometry(), centre, size };
}

// ---------------------------------------------------------------------------------------------------------------
// Shell paints: every plate has its own growth rings, lichen and algae
const TONES: [string, string, string][] = [
  ["#8e7e5a", "#6f6040", "#b09f78"],
  ["#857857", "#675a3f", "#a79873"],
  ["#988762", "#76653f", "#b8a67d"],
  ["#7d7352", "#5f5438", "#a09370"],
];
function scutePaint(centre: P2, size: number, tone: number, edgeLight = false): Paint {
  const [A, B, C] = TONES[tone % TONES.length];
  const ringW = 0.017 + 0.003 * (tone % 3);
  return paint((p, n) => {
    const dx = p.x - centre[0];
    const dz = p.z - centre[1];
    const warp = (noise(p, 0.1, tone + 3) - 0.5) * 0.02;
    const d = Math.hypot(dx, dz * 0.92) + warp;
    const k = d / ringW;
    const f = k - Math.floor(k);
    const base = !edgeLight && k < 1.6 ? C : f < 0.26 ? B : A;
    let c = rgb(base);
    const dn = d / Math.max(size, 0.05);
    if (dn > 0.8) c = mix(c, SEAM, smoothstep(0.8, 1.15, dn) * 0.4);
    if (edgeLight) {
      const [xn, zn] = unplan(p.x, p.z);
      c = mix(c, "#bfae80", smoothstep(1.0, 1.04, rhoOf(xn, zn)) * 0.5);
    }
    c = mix(c, SEAM, smoothstep(0.34, 0.2, p.y) * 0.4);
    const lich = noise(p, 0.06, 17);
    if (lich > 0.7) c = mix(c, LICHEN, smoothstep(0.7, 0.76, lich) * 0.65);
    const alg = noise(p, 0.22, 5);
    if (alg > 0.55 && p.y < 0.5) c = mix(c, ALGAE, smoothstep(0.55, 0.75, alg) * 0.55 * smoothstep(0.5, 0.25, p.y));
    if (n.y < 0.35) c = mix(c, SEAM, 0.45);
    return c;
  });
}

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "galapagosTortoise", paintSize: 2048 });

  // ----- skeleton --------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.31, -0.3], role: "spine" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.31, -0.3],
      [0, 0.33, 0.0],
      [0, 0.33, 0.3],
    ]),
    { parent: hips, role: "spine", names: ["spine1", "spine2", "chest"] },
  );
  const shellBone = spine.joints[1];
  const chest = spine.tip ?? spine.joints[2];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.32, 0.3],
      [0, 0.25, 0.5],
      [0, 0.27, 0.7],
      [0, 0.35, 0.83],
      [0, 0.43, 0.91],
    ]),
    { parent: chest, role: "neck", names: ["neck1", "neck2", "neck3", "neck4"] },
  );
  const head = b.joint("head", { at: neck.at(1), dir: [0, 0.12, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.04, up: -0.035 }),
    aim: head.local({ forward: 0.2, up: -0.04 }),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.28, -0.34],
      [0, 0.25, -0.5],
      [0, 0.22, -0.66],
      [0, 0.19, -0.82],
    ]),
    { parent: hips, role: "tail", names: ["tail1", "tail2", "tail3"] },
  );

  // ----- carapace --------------------------------------------------------------------------------------------
  // dark body under the plates: the seams show through the gaps
  {
    const sp = new Soup();
    const N = 40;
    type Ring = { rho: number; y: (xn: number, zn: number) => number };
    const rimBottom = (zn: number) => rimY(zn) - 0.075;
    const under = (rho: number) => (_xn: number, zn: number) => {
      const t = sm(0.78, ROUT, rho);
      return 0.19 + (rimBottom(zn) - 0.19) * t;
    };
    const rings: Ring[] = [
      { rho: 0.22, y: (x, z) => domeY(x, z) - 0.03 },
      { rho: 0.44, y: (x, z) => domeY(x, z) - 0.03 },
      { rho: 0.64, y: (x, z) => domeY(x, z) - 0.03 },
      { rho: 0.78, y: (x, z) => domeY(x, z) - 0.03 },
      { rho: 0.9, y: (x, z) => domeY(x, z) - 0.03 },
      { rho: 1.0, y: (x, z) => domeY(x, z) - 0.03 },
      { rho: ROUT, y: (x, z) => domeY(x, z) - 0.03 },
      { rho: ROUT, y: (_x, z) => rimBottom(z) },
      { rho: 0.92, y: under(0.92) },
      { rho: 0.7, y: under(0.7) },
      { rho: 0.4, y: under(0.4) },
    ];
    const vert = (ring: Ring, j: number): P3 => {
      const [xn, zn] = cpt((j * 360) / N, ring.rho);
      const [x, z] = planPt(xn, zn);
      return [x, ring.y(xn, zn), z];
    };
    const apex: P3 = [0, domeY(0, 0) - 0.03, 0];
    const floor: P3 = [0, 0.19, 0];
    const ref: P3 = [0, 0.4, 0];
    const outward = (p: P3): P3 => [p[0] - ref[0], p[1] - ref[1], p[2] - ref[2]];
    const ringVerts = rings.map((r) => Array.from({ length: N }, (_, j) => vert(r, j)));
    for (let j = 0; j < N; j++) {
      const k = (j + 1) % N;
      const a = ringVerts[0][j];
      const c = ringVerts[0][k];
      sp.tri(apex, a, c, outward([(a[0] + c[0]) / 2, (a[1] + c[1]) / 2 + 0.1, (a[2] + c[2]) / 2]));
      for (let r = 0; r < rings.length - 1; r++) {
        const p0 = ringVerts[r][j];
        const p1 = ringVerts[r][k];
        const q0 = ringVerts[r + 1][j];
        const q1 = ringVerts[r + 1][k];
        const o = outward([(p0[0] + q1[0]) / 2, (p0[1] + q1[1]) / 2, (p0[2] + q1[2]) / 2]);
        sp.tri(p0, p1, q1, o);
        sp.tri(p0, q1, q0, o);
      }
      const e = ringVerts[rings.length - 1][j];
      const f = ringVerts[rings.length - 1][k];
      sp.tri(floor, e, f, [0, -1, 0]);
    }
    b.part(sp.geometry(), "#30281d", { bone: shellBone, at: [0, 0, 0], flat: true, name: "shellBody" });
  }

  // plates
  const vertebrae: P2[][] = (() => {
    const f1 = phiOf(...contourAtX(0.22, true));
    const r2 = phiOf(...contourAtX(0.3, false));
    return [
      [...arcPts(-f1, f1, RIN), [0.31, 0.66], [0.2, 0.5], [-0.2, 0.5], [-0.31, 0.66]],
      [[0.2, 0.5], [0.33, 0.36], [0.2, 0.22], [-0.2, 0.22], [-0.33, 0.36], [-0.2, 0.5]],
      [[0.2, 0.22], [0.34, 0.08], [0.2, -0.06], [-0.2, -0.06], [-0.34, 0.08], [-0.2, 0.22]],
      [[0.2, -0.06], [0.34, -0.2], [0.2, -0.34], [-0.2, -0.34], [-0.34, -0.2], [-0.2, -0.06]],
      [[0.2, -0.34], [0.34, -0.52], ...arcPts(r2, 360 - r2, RIN), [-0.34, -0.52], [-0.2, -0.34]],
    ];
  })();

  const pleurals: P2[][] = (() => {
    const F = contourAtX(0.22, true);
    const R = contourAtX(0.3, false);
    const N2: P2 = [0.2, 0.22];
    const N3: P2 = [0.2, -0.06];
    const N4: P2 = [0.2, -0.34];
    const q2 = contourAtZ(0.1);
    const q3 = contourAtZ(-0.18);
    const q4 = contourAtZ(-0.48);
    const phi = (p: P2) => phiOf(p[0], p[1]);
    return [
      [F, [0.31, 0.66], [0.2, 0.5], [0.33, 0.36], N2, q2, ...arcPts(phi(q2), phi(F), RIN, 8).slice(1, -1)],
      [N2, [0.34, 0.08], N3, q3, ...arcPts(phi(q3), phi(q2), RIN, 8).slice(1, -1), q2],
      [N3, [0.34, -0.2], N4, q4, ...arcPts(phi(q4), phi(q3), RIN, 8).slice(1, -1), q3],
      [N4, [0.34, -0.52], R, ...arcPts(phi(R), phi(q4), RIN, 8).slice(1, -1), q4],
    ];
  })();

  let toneIx = 0;
  const addScute = (poly: P2[], name: string, o: { inset: number; bump: number; skirt: number }, edgeLight = false) => {
    const sc = scute(poly, o);
    b.part(sc.geo, scutePaint(sc.centre, sc.size, toneIx++, edgeLight), { bone: shellBone, at: [0, 0, 0], flat: true, name });
  };

  vertebrae.forEach((poly, i) => addScute(poly, `vertebral${i + 1}`, { inset: 0.0055, bump: 0.028, skirt: 0.02 }));
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    pleurals.forEach((poly, i) => {
      // fix the winding that mirrorX does not care about: polygons are only used for area and edges
      addScute(s > 0 ? poly : mirrorX(poly), `pleural${i + 1}${S}`, { inset: 0.0055, bump: 0.03, skirt: 0.02 });
    });
  }
  // marginal ring: nuchal at the front, eleven per side, supracaudal at the rear
  const marginal = (a: number, c: number): P2[] => [...arcPts(a, c, RIN, 8), ...arcPts(c, a, ROUT, 8)];
  addScute(marginal(-9, 9), "nuchal", { inset: 0.004, bump: 0.01, skirt: 0.06 }, true);
  addScute(marginal(171, 189), "supracaudal", { inset: 0.004, bump: 0.012, skirt: 0.06 }, true);
  const edges = Array.from({ length: 12 }, (_, i) => 9 + (162 * i) / 11);
  for (let i = 0; i < 11; i++) {
    addScute(marginal(edges[i], edges[i + 1]), `marginal${i + 1}L`, { inset: 0.004, bump: 0.011, skirt: 0.06 }, true);
    addScute(mirrorX(marginal(edges[i], edges[i + 1])), `marginal${i + 1}R`, { inset: 0.004, bump: 0.011, skirt: 0.06 }, true);
  }
  // serrated lip at the back of the shell
  for (let phi = 132; phi <= 228; phi += 12) {
    const [xn, zn] = cpt(phi, ROUT - 0.015);
    const [x, z] = planPt(xn, zn);
    b.spike([x, domeY(xn, zn) - 0.012, z], [x * 1.2, -0.4, z * 1.2], 0.045, 0.021, {
      bone: shellBone,
      color: "#8d7d57",
      sides: 5,
      name: `rimTooth${phi}`,
    });
  }

  // plastron: cream belly plate with its scute seams, notched for the legs
  {
    const half: P2[] = [
      [0.17, 0.54],
      [0.22, 0.4],
      [0.24, 0.3],
      [0.35, 0.2],
      [0.38, 0.0],
      [0.36, -0.15],
      [0.25, -0.26],
      [0.22, -0.4],
      [0.17, -0.54],
      [0.07, -0.6],
    ];
    const outline: P2[] = [...half, [0, -0.47], ...mirrorX(half.slice().reverse())];
    const seams = [0.38, 0.2, 0.02, -0.18, -0.38];
    const plastronPaint = paint((p) => {
      let c = mix("#a1946a", "#85775a", noise(p, 0.2, 4));
      const seam = seams.some((z, i) => Math.abs(p.z - z - 0.015 * Math.sin(p.x * 18 + i)) < 0.005) || Math.abs(p.x) < 0.004;
      if (seam) c = [0.2, 0.16, 0.1];
      return c;
    });
    b.extrude(outline, {
      at: [0, 0.15, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.07,
      bevel: 0.012,
      color: plastronPaint,
      bone: shellBone,
      name: "plastron",
    });
  }

  // ----- legs -------------------------------------------------------------------------------------------------
  const legPaint = (seed: number) =>
    paint((p, n, s) => {
      const base = scales([SKIN, "#716a5d", "#827a6b"], SKIN_DARK, { size: 0.05, width: 0.2, seed }).at(p, n, s);
      return mix(base, SKIN_DARK, smoothstep(0.1, 0.0, p.y) * 0.5);
    });
  const toeFan = (count: number, spread: number) => Array.from({ length: count }, (_, i) => (count === 1 ? 0 : -spread + (2 * spread * i) / (count - 1)));
  const plateGeo = new THREE.ConeGeometry(0.046, 0.011, 6, 1);
  const rg = rng(11);

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (const front of [true, false]) {
      const path = front
        ? catmull([
            [s * 0.3, 0.29, 0.35],
            [s * 0.41, 0.17, 0.43],
            [s * 0.4, 0.075, 0.5],
          ])
        : catmull([
            [s * 0.3, 0.29, -0.36],
            [s * 0.38, 0.16, -0.4],
            [s * 0.37, 0.075, -0.4],
          ]);
      const names = front ? [`shoulder${S}`, `elbow${S}`, `hand${S}`] : [`hip${S}`, `knee${S}`, `foot${S}`];
      const leg = b.chain(front ? `foreleg${S}` : `hindleg${S}`, path, {
        parent: front ? chest : hips,
        role: "leg",
        names,
      });
      const tube = b.sweep(leg, front ? [0.108, 0.098, 0.092] : [0.1, 0.092, 0.086], {
        section: { ngon: 7 },
        caps: { start: "round", end: "flat" },
        color: legPaint(front ? 3 : 8),
        name: `${front ? "fore" : "hind"}leg${S}`,
      });
      const tip = leg.tip ?? leg.joints[leg.joints.length - 1];
      const end = path.at(1);
      const pad = [end.x, 0.036, end.z] as P3;
      b.part(new THREE.CylinderGeometry(front ? 0.09 : 0.085, front ? 0.102 : 0.096, 0.073, 8), legPaint(front ? 3 : 8), {
        at: pad,
        bone: tip,
        flat: true,
        scale: [1, 1, front ? 1.28 : 1.15],
        rotation: [0, s * (front ? -8 : -14), 0],
        name: `foot${front ? "F" : "H"}${S}`,
      });
      // toes: knuckle, joint and claw
      const fan = front ? toeFan(5, 38) : toeFan(4, 30);
      const turn = s * (front ? 10 : 16);
      fan.forEach((a, i) => {
        const ang = rad(a + turn);
        const dir: P3 = [Math.sin(ang), -0.12, Math.cos(ang)];
        const reach = front ? 0.118 : 0.108;
        const base: P3 = [end.x + dir[0] * reach, 0.032, end.z + dir[2] * reach * (front ? 1.12 : 1.05)];
        const toe = b.joint(`toe${front ? "F" : "H"}${S}${i + 1}`, {
          parent: tip,
          at: base,
          dir: [dir[0], -0.05, dir[2]],
          role: "digit",
        });
        b.part(new THREE.SphereGeometry(front ? 0.03 : 0.027, 6, 4), legPaint(front ? 3 : 8), {
          at: [base[0] - dir[0] * 0.012, 0.03, base[2] - dir[2] * 0.012],
          bone: toe,
          flat: true,
          scale: [1, 0.85, 1.1],
        });
        const clawAt: P3 = [base[0] + dir[0] * 0.005, 0.026, base[2] + dir[2] * 0.005];
        b.spike(clawAt, [dir[0], -0.22, dir[2]], front ? 0.062 : 0.054, front ? 0.019 : 0.017, {
          bone: toe,
          color: CLAW,
          sides: 6,
          name: `claw${front ? "F" : "H"}${S}${i + 1}`,
        });
      });
      // heavy armour plates on the front of the limb, smaller scutes behind
      const surf = b.surface(tube);
      const hits = surf.scatter(front ? 24 : 10, {
        rng: rg,
        minDist: front ? 0.042 : 0.055,
        filter: (h) => (front ? h.n.z > 0.15 : h.n.x * s > 0.2) && h.at.y > 0.125 && h.at.y < (front ? 0.26 : 0.23),
      });
      for (const hit of hits) b.stick(plateGeo, PLATE, hit, { embed: 0.3, flat: true, spin: rg() * 72 });
    }
  }

  // ----- tail -------------------------------------------------------------------------------------------------
  const tailTube = b.sweep(tail, [0.062, 0.048, 0.034, 0.018], {
    section: { ngon: 6 },
    caps: { start: "round", end: "point" },
    color: legPaint(21),
    name: "tail",
  });
  {
    const hits = b.surface(tailTube).scatter(6, { rng: rg, minDist: 0.06, filter: (h) => h.n.y > 0.1 });
    for (const hit of hits) b.stick(new THREE.ConeGeometry(0.02, 0.016, 5, 1), PLATE, hit, { embed: 0.3, flat: true });
  }

  // ----- neck -------------------------------------------------------------------------------------------------
  const wrinkle = stripes(SKIN, "#5c564a", { size: 0.034, axis: "z", width: 0.34, wobble: 0.9, seed: 6 });
  const throat = stripes(THROAT, "#7d7461", { size: 0.034, axis: "z", width: 0.4, wobble: 0.9, seed: 9 });
  const neckTube = b.sweep(neck, [0.108, 0.104, 0.096, 0.086, 0.076], {
    section: { ngon: 8 },
    caps: { start: "round", end: "flat" },
    color: wrinkle,
    sectors: [[120, 240, throat]],
    name: "neck",
  });
  {
    const hits = b.surface(neckTube).scatter(14, { rng: rg, minDist: 0.07, filter: (h) => h.n.y > 0.25 && h.at.z > 0.62 });
    for (const hit of hits) b.stick(new THREE.ConeGeometry(0.026, 0.02, 5, 1), SKIN_LIGHT, hit, { embed: 0.35, flat: true, spin: rg() * 72 });
  }

  // ----- head ------------------------------------------------------------------------------------------------
  const headSkin = paint((p, n, s) => {
    const base = scales([SKIN, "#837b6b", "#716a5d"], SKIN_DARK, { size: 0.026, width: 0.2, seed: 12 }).at(p, n, s);
    const skin = mix(base, THROAT, smoothstep(-0.2, -0.8, n.y) * 0.8);
    return mix(skin, BEAK, smoothstep(0.15, 0.178, p.z - head.at.z));
  });
  b.loft(
    [
      { at: head.local({ forward: -0.03, up: 0.0 }), w: 0.11, h: 0.105 },
      { at: head.local({ forward: 0.035, up: 0.007 }), w: 0.13, h: 0.118 },
      { at: head.local({ forward: 0.09, up: 0.004 }), w: 0.115, h: 0.102 },
      { at: head.local({ forward: 0.14, up: -0.004 }), w: 0.092, h: 0.085 },
      { at: head.local({ forward: 0.18, up: -0.01 }), w: 0.074, h: 0.068 },
      { at: head.local({ forward: 0.206, up: -0.013 }), w: 0.058, h: 0.054 },
    ],
    { bone: head, section: { ngon: 8 }, color: headSkin, caps: { start: "flat", end: "flat" }, name: "skull" },
  );
  // the beak's hooked tip and nostril slits
  b.spike(head.local({ forward: 0.2, up: -0.024 }), [0, -1, 0.25], 0.03, 0.017, {
    bone: head,
    color: BEAK_DARK,
    sides: 5,
    name: "beakHook",
  });
  // lower jaw, hinged
  b.loft(
    [
      { at: head.local({ forward: 0.04, up: -0.05 }), w: 0.1, h: 0.036 },
      { at: head.local({ forward: 0.11, up: -0.054 }), w: 0.085, h: 0.033 },
      { at: head.local({ forward: 0.17, up: -0.05 }), w: 0.064, h: 0.03 },
      { at: head.local({ forward: 0.2, up: -0.046 }), w: 0.05, h: 0.028 },
    ],
    { bone: jaw, section: { ngon: 6 }, color: headSkin, caps: { start: "flat", end: "flat" }, name: "lowerJaw" },
  );
  b.frustumBox(head.local({ forward: 0.07, up: -0.0385 }), head.local({ forward: 0.19, up: -0.0385 }), [0.06, 0.008], [0.036, 0.008], {
    bone: jaw,
    color: TONGUE,
    name: "tongue",
  });
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.rod(head.local({ left: s * 0.03, forward: 0.196, up: -0.038 }), head.local({ left: s * 0.055, forward: 0.06, up: -0.039 }), 0.0035, {
      bone: head,
      color: SEAM,
      sides: 4,
      name: `mouthLine${side}`,
    });
    // eye: socket bulge, dark eye with a gold ring, brow plate above
    b.part(new THREE.SphereGeometry(0.028, 6, 4), headSkin, {
      at: head.local({ left: s * 0.048, forward: 0.082, up: 0.012 }),
      bone: head,
      flat: true,
      scale: [0.9, 0.9, 1.0],
    });
    b.part(new THREE.SphereGeometry(0.019, 6, 5), EYE_RING, {
      at: head.local({ left: s * 0.054, forward: 0.084, up: 0.014 }),
      bone: head,
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.0125, 6, 5), EYE, {
      at: head.local({ left: s * 0.0615, forward: 0.087, up: 0.015 }),
      bone: head,
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.005, 4, 3), "#f3ecd6", {
      at: head.local({ left: s * 0.0685, forward: 0.092, up: 0.021 }),
      bone: head,
      flat: true,
    });
    b.frustumBox(
      head.local({ left: s * 0.04, forward: 0.07, up: 0.032 }),
      head.local({ left: s * 0.058, forward: 0.1, up: 0.03 }),
      [0.022, 0.008],
      [0.02, 0.008],
      { bone: head, color: SKIN_LIGHT, name: `brow${side}` },
    );
    b.rod(head.local({ left: s * 0.011, forward: 0.196, up: 0.011 }), head.local({ left: s * 0.013, forward: 0.21, up: 0.003 }), 0.0045, {
      bone: head,
      color: NOSTRIL,
      sides: 4,
      name: `nostril${side}`,
    });
    // tympanic scale behind the eye and a cheek plate
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.006, 6), SKIN_DARK, {
      at: head.local({ left: s * 0.06, forward: 0.02, up: 0.004 }),
      dir: [s, 0, 0],
      bone: head,
      flat: true,
    });
    b.part(new THREE.ConeGeometry(0.026, 0.01, 6), PLATE, {
      at: head.local({ left: s * 0.062, forward: 0.05, up: -0.022 }),
      dir: [s, 0.1, 0],
      bone: head,
      flat: true,
    });
  }

  // ----- a small ground finch resting on the shell: the Galápagos story detail --------------------------------
  {
    const bx = 0.11;
    const bz = -0.12;
    const by = domeY(...unplan(bx, bz)) + 0.026;
    const yaw = rad(38);
    const fwd = [Math.sin(yaw), Math.cos(yaw)];
    const lat = [Math.cos(yaw), -Math.sin(yaw)];
    const bp = (f: number, l: number, u: number): P3 => [bx + fwd[0] * f + lat[0] * l, by + u, bz + fwd[1] * f + lat[1] * l];
    const FEATHER = paint((_p, n) => mix("#5d4b33", "#b9ab90", smoothstep(0.1, -0.5, n.y)));
    const yawDeg = 38;
    const part = (geo: THREE.BufferGeometry, color: string | typeof FEATHER, at: P3, scale: P3) =>
      b.part(geo, color, { at, bone: shellBone, flat: true, scale, rotation: [0, yawDeg, 0] });
    part(new THREE.SphereGeometry(1, 7, 5), FEATHER, bp(0, 0, 0.047), [0.03, 0.028, 0.05]);
    part(new THREE.SphereGeometry(1, 6, 5), FEATHER, bp(0.05, 0, 0.065), [0.022, 0.022, 0.022]);
    b.spike(bp(0.066, 0, 0.064), bp(1, 0, 0.064).map((v, i) => v - [bx, by, bz][i]), 0.03, 0.0095, {
      bone: shellBone,
      color: "#2b2620",
      sides: 5,
    });
    for (const s of [1, -1]) {
      part(new THREE.SphereGeometry(1, 4, 3), "#14100c", bp(0.06, s * 0.016, 0.07), [0.004, 0.004, 0.004]);
      part(new THREE.SphereGeometry(1, 6, 4), "#43351f", bp(-0.01, s * 0.027, 0.052), [0.007, 0.02, 0.04]);
      b.rod(bp(0.004, s * 0.013, 0.022), bp(0.008, s * 0.013, 0.0), 0.0032, { bone: shellBone, color: "#6b5848", sides: 4 });
      b.rod(bp(0.008, s * 0.013, 0.003), bp(0.026, s * 0.013, 0.0), 0.0028, { bone: shellBone, color: "#6b5848", sides: 4 });
    }
    b.frustumBox(bp(-0.04, 0, 0.05), bp(-0.105, 0, 0.034), [0.022, 0.006], [0.03, 0.005], {
      bone: shellBone,
      color: "#43351f",
    });
  }

  return b.root;
}
