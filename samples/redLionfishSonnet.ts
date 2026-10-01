import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import { cells, paint, smoothstep, type Paint } from "../src/paint";
import { svg } from "../src/texture";
import type { Chain, Joint } from "../src/skeleton";

export const meta = {
  name: "Red Lionfish · Sonnet",
  description:
    "A 0.4 m red lionfish hovering a quarter metre above the floor: banded red-brown and white body, fan-shaped pectoral fins with long free rays, a tall frayed dorsal comb, brow tentacles, a hinged lower jaw and a rounded tail fan.",
};

// ---- palette ---------------------------------------------------------------------------------------------------
const RB = "#8f2418"; // red-brown
const RED = "#c2391f";
const DEEP = "#4a130d";
const CREAM = "#f6ead9";
const PINK = "#eab9a5";
const MOUTH = "#6b1c1c";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// Hover height: the lowest ray tip sits 0.25 m above the floor (tuned with `preview --box`).
const CY = 0.385;

// Vertical body stripes: slanted, slightly wobbly bands of red-brown, cream, red and a thin cream line.
const PERIOD = 0.036;
const band = (w: number): string => {
  const u = (((w / PERIOD) % 1) + 1) % 1;
  if (u < 0.36) return RB;
  if (u < 0.4) return DEEP;
  if (u < 0.62) return CREAM;
  if (u < 0.88) return RED;
  return CREAM;
};
const stripeAt = (p: THREE.Vector3): string => {
  // Towards the snout the bands sweep back with |x|, so a head-on view shows chevrons instead of bullseye rings.
  const sweepBack = smoothstep(0.11, 0.19, p.z) * 1.6 * Math.abs(p.x);
  return band(p.z + 0.22 * (p.y - CY) + 0.0035 * Math.sin(p.y * 70 + p.x * 40) + sweepBack);
};

const bodyPaint = paint((p, n) => {
  if (p.z > 0.112 && n.y < -0.35 && p.y > CY - 0.06) return MOUTH;
  if (n.y < -0.72 && p.z < 0.15) return PINK;
  return stripeAt(p);
});
const jawPaint = paint((p, n) => (n.y > 0.45 ? MOUTH : stripeAt(p)));

// Dashes along a ray or spine: dark and cream alternate.
const rayPaint = (dashes: number, phase = 0) =>
  paint((_p, _n, s) => (Math.floor(s[0] * dashes + phase) % 2 === 0 ? RB : CREAM));

// Fin membrane between two rays: pale skin, red-brown bars across, a dark margin near each ray.
const finSkin = (i: number, bars: number) =>
  paint((p, _n, s) => {
    const u = s[0];
    const bar = Math.floor(u * bars + (i % 2) * 0.5) % 2 === 0;
    if (s[1] < 0.1 || s[1] > 0.9) return bar ? RB : DEEP;
    if (u > 0.93) return RB;
    if (bar) return i % 2 ? RED : RB;
    // Freckles on the pale panels.
    return cells(p, 0.011, 5).d1 < 0.002 ? RB : i % 2 ? CREAM : PINK;
  });

// ---- drawings --------------------------------------------------------------------------------------------------
// The eye ball's whole wrap: dark red-brown, a gold iris with dark spokes, a pupil and a glint at the middle.
const EYE = svg(
  `<svg viewBox="0 0 128 64">
    <rect width="128" height="64" fill="#3a1410"/>
    <circle cx="64" cy="32" r="15.5" fill="#5a170f"/>
    <circle cx="64" cy="32" r="13.5" fill="#e3a93b"/>
    <g stroke="#8a4a14" stroke-width="1.6" stroke-linecap="round">
      <line x1="64" y1="20" x2="64" y2="25"/><line x1="64" y1="39" x2="64" y2="44"/>
      <line x1="52" y1="32" x2="57" y2="32"/><line x1="71" y1="32" x2="76" y2="32"/>
      <line x1="55.5" y1="23.5" x2="59" y2="27"/><line x1="69" y1="37" x2="72.5" y2="40.5"/>
      <line x1="72.5" y1="23.5" x2="69" y2="27"/><line x1="59" y1="37" x2="55.5" y2="40.5"/>
    </g>
    <circle cx="64" cy="32" r="6.5" fill="#120a0c"/>
    <circle cx="60.5" cy="28" r="2.6" fill="#fff6e6"/>
  </svg>`,
  { size: 256 },
);

// A feathery frond: a tapering stem with alternating barbs (drawn root at the bottom).
const FROND = svg(
  `<svg viewBox="0 0 40 80">
    <g stroke-linecap="round" fill="none">
      <path d="M20 79 L20 4" stroke="#7a1f14" stroke-width="3"/>
      <g stroke="#b8341f" stroke-width="2.4">
        <path d="M20 66 L6 52"/><path d="M20 66 L34 52"/>
        <path d="M20 54 L4 38"/><path d="M20 54 L36 38"/>
        <path d="M20 42 L6 26"/><path d="M20 42 L34 26"/>
        <path d="M20 30 L9 15"/><path d="M20 30 L31 15"/>
        <path d="M20 18 L12 6"/><path d="M20 18 L28 6"/>
      </g>
      <g stroke="#f6ead9" stroke-width="2.2">
        <path d="M6 52 L3 46"/><path d="M34 52 L37 46"/>
        <path d="M4 38 L2 32"/><path d="M36 38 L38 32"/>
        <path d="M6 26 L4 20"/><path d="M34 26 L36 20"/>
      </g>
    </g>
  </svg>`,
  { size: 256 },
);

// A ragged shred that hangs off a torn fin edge (drawn root at the bottom).
const SHRED = svg(
  `<svg viewBox="0 0 16 40">
    <path d="M8 40 L5 26 L7 12 L8 0 L10 13 L11 27 Z" fill="#e8a994"/>
    <path d="M8 40 L8 6" stroke="#8f2418" stroke-width="2" fill="none"/>
  </svg>`,
  { size: 160 },
);

export default function build() {
  const b = createBuilder({ name: "redLionfish", paintSize: 2048 });
  const rand = rng(11);

  // ---- skeleton: body, head, jaw, tail -------------------------------------------------------------------------
  const core = b.joint("spine1", { at: [0, CY, 0], dir: [0, 0, 1], role: "spine" });
  const front = b.chain(
    "spineFront",
    polyline([
      [0, CY, 0.04],
      [0, CY + 0.004, 0.09],
    ]),
    { parent: core, names: ["spine2"], role: "spine" },
  );
  const head = b.joint("head", {
    parent: front.joints[0],
    at: [0, CY + 0.004, 0.09],
    aim: [0, CY + 0.014, 0.2],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, CY - 0.04, 0.098],
    aim: [0, CY - 0.012, 0.195],
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, CY, -0.04],
      [0, CY + 0.001, -0.075],
      [0, CY + 0.002, -0.105],
      [0, CY + 0.003, -0.128],
    ]),
    { parent: core, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // Which body bone carries a given z (a joint's bone runs to its child).
  const owner = (z: number): Joint => {
    if (z >= 0.09) return head;
    if (z >= 0.04) return front.joints[0];
    if (z >= -0.04) return core;
    if (z >= -0.075) return tail.joints[0];
    if (z >= -0.105) return tail.joints[1];
    if (z >= -0.128) return tail.joints[2];
    return tail.joints[3];
  };

  // ---- body: one loft from the peduncle to the nose ------------------------------------------------------------
  const st = (z: number, dy: number, w: number, h: number) => ({ at: [0, CY + dy, z], w, h });
  const body = b.loft(
    [
      st(-0.128, 0.003, 0.02, 0.036),
      st(-0.105, 0.003, 0.03, 0.05),
      st(-0.07, 0.002, 0.052, 0.078),
      st(-0.03, 0, 0.076, 0.106),
      st(0.01, -0.001, 0.088, 0.118),
      st(0.05, 0, 0.09, 0.12),
      st(0.09, 0.004, 0.084, 0.112),
      st(0.125, 0.01, 0.07, 0.092),
      st(0.157, 0.013, 0.05, 0.066),
      st(0.182, 0.014, 0.032, 0.046),
      st(0.192, 0.0135, 0.024, 0.034),
    ],
    { bone: [tail, core, front, head], color: bodyPaint, sides: 10 },
  );
  const skin = b.surface(body);

  // Lower jaw: a wide flat scoop that pivots on the jaw joint and closes flush under the nose.
  b.sweep(
    polyline([
      [0, CY - 0.04, 0.098],
      [0, CY - 0.024, 0.15],
      [0, CY - 0.0125, 0.196],
    ]),
    (t) => [0.03 - 0.019 * t, 0.013 - 0.004 * t],
    { bone: jaw, color: jawPaint, sides: 8, caps: "round" },
  );
  // Chin barbels
  for (const s of [1, -1])
    b.spike([s * 0.014, CY - 0.02, 0.17], [s * 0.25, -1, 0.35], 0.018, 0.0025, { bone: jaw, color: CREAM });

  // ---- eyes ---------------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const c: [number, number, number] = [s * 0.03, CY + 0.034, 0.136];
    // The drawing wraps the whole ball; its middle faces the sphere's +X, turned to look out and forward.
    b.part(new THREE.SphereGeometry(0.0178, 10, 8), "#ffffff", {
      bone: head,
      at: c,
      dir: [s * 0.78, 0.22, 0.58],
      axis: "x",
      texture: EYE,
    });
    // brow ridge over the eye
    b.spike(
      [s * 0.028, CY + 0.052, 0.128],
      [s * 0.25, 0.9, -0.3],
      0.022,
      0.005,
      { bone: head, color: RB },
    );
  }

  // ---- feathery brow tentacles --------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    const root = skin.nearest([s * 0.026, CY + 0.075, 0.136]);
    const tip = V(s * 0.03, CY + 0.12, 0.112);
    const tent = b.sprout(
      `tentacle${tag}`,
      root,
      catmull([root.at, V(s * 0.03, CY + 0.094, 0.13), tip]),
      [0.0055, 0.0018],
      { count: 2, names: [`tentacle${tag}1`, `tentacle${tag}2`], role: "tentacle", color: rayPaint(3), caps: "point" },
    );
    const chain = tent.chain;
    if (chain) {
      b.cards([chain.at(0.72)], FROND, { size: [0.036, 0.07], cross: true, flow: [s * 0.4, 0, -1], sink: 0.15, bone: chain.joints[1] });
    }
  }

  // ---- cheek and gill spines ----------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    for (const [az, el, len] of [
      [118, -4, 0.03],
      [130, 14, 0.026],
      [142, -18, 0.022],
    ] as const) {
      const hit = skin.around([0, CY, 0.06]).at(s * az, el);
      if (hit) b.stick(new THREE.ConeGeometry(0.0055, len, 6), RB, hit, { embed: 0.2 });
    }
  }

  // ---- fin builder --------------------------------------------------------------------------------------------
  type Ray = { base: THREE.Vector3; dir: THREE.Vector3; len: number; bend?: THREE.Vector3 };

  /**
   * A fin of rays: each ray is a chain of `joints` bones, a tube through the membrane edge and out to a free tip,
   * with membranes between neighbouring rays reaching `mem` of the ray length.
   */
  const rayFin = (
    name: string,
    parent: (ray: Ray) => Joint,
    rays: Ray[],
    o: {
      mem: number;
      joints: number;
      radius: number;
      bars: number;
      dashes: number;
      scallop?: number;
      skin?: (i: number) => Paint;
      thickness?: number;
      shreds?: { across: number[]; len: [number, number] };
      cols?: number;
    },
  ): Chain[] => {
    const chains: Chain[] = rays.map((r, i) => {
      const M = r.base.clone().addScaledVector(r.dir, r.len * o.mem);
      const pts = [r.base.clone()];
      for (let k = 1; k < o.joints; k++) pts.push(r.base.clone().lerp(M, k / o.joints));
      pts.push(M);
      const names = Array.from({ length: o.joints }, (_, k) => `${name}${i + 1}${"abcd"[k]}`);
      const chain = b.chain(`${name}_ray${i + 1}`, polyline(pts), { parent: parent(r), names, role: "fan" });
      const pathPts = [...pts];
      if (o.mem < 1) {
        const tip = r.base.clone().addScaledVector(r.dir, r.len);
        if (r.bend) tip.add(r.bend);
        pathPts.push(tip);
      }
      b.sweep(catmull(pathPts), [o.radius, o.radius * 0.3], {
        bone: chain,
        color: rayPaint(o.dashes, (i % 3) * 0.3),
        sides: 5,
        caps: "point",
      });
      return chain;
    });
    for (let i = 0; i + 1 < chains.length; i++) {
      b.membrane(chains[i], chains[i + 1], {
        thickness: o.thickness ?? 0.003,
        color: (o.skin ?? ((k) => finSkin(k, o.bars)))(i),
        scallop: o.scallop,
        rows: 3,
        cols: o.cols ?? 6,
      });
      if (!o.shreds) continue;
      // Torn scraps hanging off the trailing edge between ray i and i+1.
      const ra = rays[i];
      const rb = rays[i + 1];
      const plane = ra.dir.clone().cross(rb.dir);
      if (plane.lengthSq() < 1e-8) plane.set(1, 0, 0);
      plane.normalize();
      const last = chains[i].joints[chains[i].joints.length - 1];
      for (const a of o.shreds.across) {
        const t = o.mem * (1 - (o.scallop ?? 0) * 4 * a * (1 - a));
        const pa = ra.base.clone().addScaledVector(ra.dir, ra.len * t);
        const pb = rb.base.clone().addScaledVector(rb.dir, rb.len * t);
        const at = pa.lerp(pb, a);
        const dir = ra.dir.clone().lerp(rb.dir, a).normalize().applyAxisAngle(plane, (rand() - 0.5) * 0.5);
        const len = o.shreds.len[0] + rand() * (o.shreds.len[1] - o.shreds.len[0]);
        b.cards([frame(at, dir)], SHRED, { size: [len * 0.38, len], flow: plane, bone: last, sink: 0.3 });
      }
    }
    return chains;
  };

  const unit = (x: number, y: number, z: number) => V(x, y, z).normalize();
  const deg = (d: number) => (d * Math.PI) / 180;

  // ---- pectoral fans ------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    const B = V(s * 0.043, CY - 0.012, 0.072);
    const pec = b.joint(`pectoral${tag}`, {
      parent: front.joints[0],
      at: B,
      dir: [s * 0.8, -0.1, -0.5],
      role: "wing",
    });
    const c = unit(s * 0.8, -0.14, -0.55);
    const u = V(0, 1, 0).addScaledVector(c, -c.y).normalize();
    const N = 10;
    const rays: Ray[] = [];
    for (let i = 0; i < N; i++) {
      const f = i / (N - 1);
      const phi = deg(-40 + 100 * f);
      const dir = c.clone().multiplyScalar(Math.cos(phi)).addScaledVector(u, Math.sin(phi)).normalize();
      const len = 0.17 * (1 - 0.28 * Math.pow((f - 0.6) / 0.6, 2));
      rays.push({ base: B.clone(), dir, len, bend: V(0, 0, -0.018 - 0.01 * f) });
    }
    rayFin(`pec${tag}`, () => pec, rays, {
      mem: 0.72,
      joints: 2,
      radius: 0.0034,
      bars: 4,
      dashes: 7,
      scallop: 0.12,
      thickness: 0.0028,
      shreds: { across: [0.5], len: [0.014, 0.028] },
    });
  }

  // ---- pelvic fins ---------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    const B = V(s * 0.02, CY - 0.052, 0.058);
    const pel = b.joint(`pelvic${tag}`, { parent: front.joints[0], at: B, dir: [s * 0.3, -0.8, -0.4], role: "wing" });
    const c = unit(s * 0.3, -0.82, -0.4);
    const u = V(0, 0, 1).addScaledVector(c, -c.z).normalize();
    const rays: Ray[] = [];
    for (let i = 0; i < 5; i++) {
      const f = i / 4;
      const phi = deg(38 - 76 * f);
      const dir = c.clone().multiplyScalar(Math.cos(phi)).addScaledVector(u, Math.sin(phi)).normalize();
      rays.push({ base: B.clone(), dir, len: 0.09 - 0.022 * f, bend: V(0, 0, -0.01) });
    }
    rayFin(`pelvic${tag}`, () => pel, rays, { mem: 0.85, joints: 1, radius: 0.0032, bars: 3, dashes: 5, scallop: 0.15, thickness: 0.0026 });
  }

  // ---- dorsal comb: 13 venomous spines with frayed membranes ---------------------------------------------------
  {
    const N = 13;
    const heights = [0.1, 0.125, 0.14, 0.152, 0.155, 0.148, 0.14, 0.13, 0.118, 0.106, 0.096, 0.086, 0.076];
    const rays: Ray[] = [];
    for (let i = 0; i < N; i++) {
      const f = i / (N - 1);
      const z = 0.102 - 0.138 * f;
      const hit = skin.ray([0, CY + 0.3, z], [0, -1, 0]);
      const top = hit ? hit.at.y : CY + 0.06;
      const lean = deg(-6 + 52 * Math.pow(f, 0.9));
      const dir = V(0, Math.cos(lean), -Math.sin(lean));
      rays.push({ base: V(0, top - 0.008, z), dir, len: heights[i], bend: V(0, 0, -0.012) });
    }
    rayFin("dorsal", (r) => owner(r.base.z), rays, {
      mem: 0.78,
      joints: 2,
      radius: 0.0031,
      bars: 3,
      dashes: 6,
      scallop: 0.3,
      thickness: 0.0026,
      shreds: { across: [0.3, 0.72], len: [0.018, 0.04] },
    });
  }

  // ---- soft dorsal, anal fin and tail -------------------------------------------------------------------------
  const soft = (name: string, sign: 1 | -1, zs: number[], heights: number[], spines: number) => {
    const rays: Ray[] = zs.map((z, i) => {
      const hit = skin.ray([0, CY + sign * 0.3, z], [0, -sign, 0]);
      const edge = hit ? hit.at.y : CY + sign * 0.03;
      const lean = deg(14 + 22 * (i / (zs.length - 1)));
      return {
        base: V(0, edge - sign * 0.006, z),
        dir: V(0, sign * Math.cos(lean), -Math.sin(lean)),
        len: heights[i],
        bend: V(0, sign * 0.004, -0.008),
      };
    });
    return rayFin(name, (r) => owner(r.base.z), rays, {
      mem: 0.94,
      joints: 1,
      radius: 0.0028,
      bars: 3,
      dashes: 4,
      scallop: 0.18,
      thickness: 0.0025,
      skin: (i) => finSkin(i + spines, 3),
    });
  };
  soft("softDorsal", 1, [-0.05, -0.062, -0.074, -0.086, -0.098, -0.11, -0.12], [0.052, 0.058, 0.056, 0.052, 0.046, 0.04, 0.032], 0);
  soft("anal", -1, [-0.03, -0.042, -0.054, -0.066, -0.078, -0.09, -0.102, -0.114], [0.03, 0.04, 0.05, 0.05, 0.047, 0.042, 0.036, 0.03], 1);

  // Rounded caudal fan: nine rays around the tail tip, membranes out to the rim.
  {
    const B = V(0, CY + 0.003, -0.128);
    const rays: Ray[] = [];
    const N = 9;
    for (let i = 0; i < N; i++) {
      const f = i / (N - 1);
      const phi = deg(-66 + 132 * f);
      const dir = V(0, Math.sin(phi), -Math.cos(phi));
      rays.push({ base: B.clone(), dir, len: 0.055 + 0.022 * Math.cos(phi) });
    }
    rayFin("caudal", () => tail.joints[3], rays, { mem: 1, joints: 1, radius: 0.003, bars: 3, dashes: 4, scallop: 0.08, thickness: 0.0028 });
  }

  return b.root;
}
