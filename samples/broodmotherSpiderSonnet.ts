import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import { paint, patches, spots } from "../src/paint";
import type { Hit } from "../src/surface";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Broodmother Spider",
  description:
    "A horse-sized low-poly broodmother spider in a rest pose: faceted violet-black carapace with glowing eyes and curved fangs, eight banded spiked legs, an abdomen of hard-edged chevron markings carrying a clutch of silk-wrapped egg sacs (one hatching), more sacs hung below and dragged behind on a silk rope over a web mat, with spiderlings on her back and on the floor.",
  style: "low-poly",
  commit: "88fc1f0",
};

// ---- palette (flat colours) ----
const NIGHT = "#1b1424";
const DARK = "#261b34";
const VIOLET = "#3d2b55";
const VIOLET_L = "#5b4380";
const PLATE = "#33254a";
const BONE = "#e6d6a2";
const BONE_D = "#b99d62";
const RED = "#c9203a";
const ORANGE = "#f0892a";
const AMBER = "#ffb52a";
const EYE_Y = "#ffe14a";
const EYE_R = "#ff4a24";
const SILK = "#f1ecdc";
const SAC_A = "#ece3c4";
const HOLE = "#2b1c22";
const EGG = "#e4dcb8";

const dorsal = (deg: number) => {
  const x = ((deg % 360) + 360) % 360;
  return x > 180 ? 360 - x : x; // 0 = top, 180 = belly
};
const interp = (ks: number[], vs: number[], t: number) => {
  if (t <= ks[0]) return vs[0];
  for (let i = 1; i < ks.length; i++) {
    if (t <= ks[i]) return vs[i - 1] + ((vs[i] - vs[i - 1]) * (t - ks[i - 1])) / (ks[i] - ks[i - 1]);
  }
  return vs[vs.length - 1];
};
const ico = (r: number, detail = 0) => new THREE.IcosahedronGeometry(r, detail);

// ---- paints ----
const abdomenBase = patches("#241a33", ["#2f2342", "#382a4e", "#2b1f3b"], { size: 0.22, gap: 0.01, seed: 4 });
const abdomenPaint = paint((_p, _n, s) => {
  const t = s[0];
  const d = dorsal(s[1]);
  // dorsal chevron stripe
  if (d < 50 && t > 0.1 && t < 0.9) {
    if (d > 43) return NIGHT;
    const phase = (((t * 17 + d / 62) % 1) + 1) % 1;
    if (phase < 0.36) return t < 0.55 ? ORANGE : RED;
    return phase < 0.44 ? NIGHT : "#3a1c3e";
  }
  // flank dashes
  if (d > 58 && d < 120 && t > 0.14 && t < 0.88) {
    const ph = (((t * 15 + d / 60) % 1) + 1) % 1;
    if (ph < 0.3) return BONE_D;
    if (ph < 0.38) return NIGHT;
  }
  // belly hourglass
  const bd = 180 - d;
  const u = (t - 0.5) / 0.16;
  if (bd < 34 && Math.abs(u) < 1 && bd < 5 + Math.abs(u) * 28) return RED;
  // book-lung slits
  if (bd < 40 && bd > 12 && t > 0.16 && t < 0.27 && (((t * 90) % 1) + 1) % 1 < 0.45) return BONE_D;
  return abdomenBase;
});
const thoraxBase = patches("#33254a", ["#41305c", "#4a3868", "#3a2b53"], { size: 0.14, gap: 0.008, seed: 9 });
const thoraxPaint = paint((p, n, _s) => {
  if (n.y > 0.3) {
    const dx = p.x;
    const dz = p.z - 0.28;
    const r = Math.hypot(dx, dz);
    if (r < 0.055) return NIGHT; // fovea
    const ang = Math.atan2(dx, dz);
    if (r > 0.09 && r < 0.4 && Math.abs(Math.sin(ang * 4)) < 0.07) return NIGHT; // radial grooves
    if (r > 0.4 && r < 0.43) return VIOLET_L; // rim
  }
  if (n.z > 0.5 && p.y < 1.1) return Math.abs(p.x) < 0.015 ? BONE_D : "#4a3868";
  return thoraxBase;
});
const sacPaint = spots(patches(SAC_A, ["#e4dcb6", "#efe7ca", "#dcd9ae"], { size: 0.16, gap: 0.006, seed: 5 }), "#a3b36c", {
  size: 0.075,
  amount: 0.3,
  seed: 2,
});

function legPaint(tK: number[]) {
  return paint((_p, _n, s) => {
    const t = s[0];
    const d = dorsal(s[1]);
    if (t < tK[2] - 0.012) {
      if (t > tK[2] - 0.03) return d < 55 ? BONE_D : DARK;
      return d < 44 ? VIOLET : DARK;
    }
    if (t < tK[3] + 0.012) return BONE;
    if (t < tK[4]) return t > tK[4] - 0.05 ? BONE_D : d < 40 ? VIOLET_L : DARK;
    if (t < tK[5]) return t > tK[5] - 0.045 ? BONE_D : d < 42 ? VIOLET : DARK;
    return NIGHT;
  });
}

function webSvg() {
  const r = rng(11);
  const cx = 128;
  const cy = 128;
  const spokes = 14;
  const ang = Array.from({ length: spokes }, (_, i) => (i / spokes) * Math.PI * 2 + (r() - 0.5) * 0.22);
  let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none" stroke="${SILK}" stroke-linecap="round" stroke-linejoin="round">`;
  const pt = (a: number, rad: number) => `${(cx + Math.cos(a) * rad).toFixed(1)} ${(cy + Math.sin(a) * rad).toFixed(1)}`;
  out += `<path stroke-width="3" d="${ang.map((a) => `M${pt(a, 3)} L${pt(a, 126)}`).join(" ")}"/>`;
  for (const rad of [14, 26, 40, 56, 74, 93, 112, 126]) {
    const rr = ang.map((a) => rad * (0.93 + r() * 0.1) + (a === ang[0] ? 0 : 0));
    let d = `M${pt(ang[0], rr[0])}`;
    for (let i = 1; i <= spokes; i++) {
      const a0 = ang[i - 1];
      const a1 = i === spokes ? ang[0] + Math.PI * 2 : ang[i];
      const mid = (a0 + a1) / 2;
      const rm = (rr[i - 1] + rr[i % spokes]) / 2 - 3 - rad * 0.04;
      d += ` Q${pt(mid, rm)} ${pt(a1, rr[i % spokes])}`;
    }
    out += `<path stroke-width="2.2" d="${d}"/>`;
  }
  return out + `</svg>`;
}

export default function build() {
  const b = createBuilder({ name: "broodmother", paintSize: 2048 });
  const rand = rng(21);

  // ================= skeleton =================
  const thorax = b.joint("thorax", { at: [0, 0.95, 0.28], dir: [0, 0, 1], role: "spine" });
  const head = b.joint("head", { parent: thorax, at: [0, 0.97, 0.6], dir: [0, -0.05, 1], role: "head" });
  type Joint = typeof thorax;

  const cy = (z: number) => 0.98 + 0.17 * (-z - 0.2);
  const abd = b.chain(
    "abdomen",
    polyline([-0.2, -0.65, -1.1, -1.55, -2.0].map((z) => [0, cy(z), z])),
    { parent: thorax, names: ["abdomen1", "abdomen2", "abdomen3", "abdomen4", "spinneret"], role: "spine" },
  );
  const spin = abd.joints[abd.joints.length - 1];

  // ================= cephalothorax =================
  const thoraxBody = b.loft(
    [
      { at: [0, 0.93, -0.18], w: 0.36, h: 0.34 },
      { at: [0, 0.96, 0.0], w: 0.86, h: 0.6 },
      { at: [0, 1.0, 0.28], w: 1.1, h: 0.66 },
      { at: [0, 1.0, 0.55], w: 0.84, h: 0.6 },
      { at: [0, 0.96, 0.76], w: 0.42, h: 0.44 },
    ],
    { bone: thorax, sides: 8, smooth: false, color: thoraxPaint, name: "carapace" },
  );
  const thoraxSurf = b.surface(thoraxBody);

  // sternum plate under the carapace
  b.extrude(
    [
      [0, -0.3],
      [0.17, -0.12],
      [0.2, 0.12],
      [0.1, 0.34],
      [-0.1, 0.34],
      [-0.2, 0.12],
      [-0.17, -0.12],
    ],
    { at: [0, 0.74, 0.25], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.05, bevel: 0.01, color: VIOLET, bone: thorax, name: "sternum" },
  );

  // shoulder horns and dorsal crest
  for (const sx of [1, -1]) {
    for (const [z, out, len] of [
      [0.12, 0.2, 0.5],
      [-0.05, 0.16, 0.42],
    ] as const) {
      const h = thoraxSurf.ray([sx * out, 3, z], [0, -1, 0]);
      if (!h) throw new Error("horn ray missed");
      const tip: [number, number, number] = [h.at.x + sx * 0.13, h.at.y + len, h.at.z - 0.2];
      const mid: [number, number, number] = [h.at.x + sx * 0.12, h.at.y + len * 0.5, h.at.z - 0.02];
      b.sprout(`horn${sx > 0 ? "L" : "R"}${z > 0 ? 1 : 2}`, h, bezier(h, mid, tip), [0.06, 0], {
        count: 0,
        color: BONE,
        sides: 5,
        smooth: false,
        caps: { end: "point" },
      });
    }
  }
  for (const z of [0.4, 0.2, 0.0]) {
    const h = thoraxSurf.ray([0, 3, z], [0, -1, 0]);
    if (h) b.spike(h, h, 0.2 - z * 0.2, 0.045, { color: BONE_D, sides: 4, smooth: false, bone: thorax });
  }

  // ================= face =================
  const eyes: Array<["front" | "top", number, number, number, string, number]> = [
    ["front", 0.1, 1.0, 0.075, EYE_Y, 1.8],
    ["front", 0.24, 0.95, 0.05, EYE_R, 1.4],
    ["top", 0.13, 0.62, 0.042, EYE_R, 1.4],
    ["top", 0.27, 0.5, 0.05, EYE_R, 1.4],
  ];
  for (const sx of [1, -1]) {
    for (const [kind, x, a, r, col, str] of eyes) {
      const h =
        kind === "front"
          ? thoraxSurf.ray([sx * x, a, 3], [0, 0, -1])
          : thoraxSurf.ray([sx * x, 3, a], [0, -1, 0]);
      if (!h) throw new Error(`eye ray missed ${kind} ${x}`);
      b.stick(new THREE.CylinderGeometry(r * 1.25, r * 1.45, r * 0.7, 7), NIGHT, h, { embed: 0.4, bone: head, flat: true });
      glow(b.stick(new THREE.SphereGeometry(r, 7, 5), col, h.moved([0, r * 0.5, 0]), { embed: 0.3, bone: head }), str);
    }
  }
  // brow ridge pieces
  for (const sx of [1, -1]) {
    const h = thoraxSurf.ray([sx * 0.13, 3, 0.66], [0, -1, 0]);
    if (h) b.spike(h, h, 0.16, 0.035, { color: BONE_D, sides: 4, smooth: false, bone: head });
  }
  // upper lip / clypeus
  b.frustumBox([0, 0.8, 0.76], [0, 0.7, 0.86], [0.2, 0.08], [0.12, 0.05], { color: NIGHT, bone: head, name: "labrum" });

  // chelicerae (the jaws) with fangs
  for (const sx of [1, -1]) {
    const L = sx > 0 ? "L" : "R";
    const root: [number, number, number] = [sx * 0.14, 0.86, 0.72];
    const tip: [number, number, number] = [sx * 0.15, 0.58, 0.88];
    const jaw = b.joint(`jaw${L}`, { parent: head, at: root, aim: tip, role: "jaw" });
    const base = b.rod(root, tip, [0.115, 0.095], { color: VIOLET, bone: jaw, sides: 6, smooth: false, name: `chelicera${L}` });
    for (const [t, a] of [
      [0.3, -70],
      [0.3, 70],
      [0.6, -90],
      [0.6, 90],
      [0.85, 0],
    ] as const) {
      b.spike(base.at(t, a), base.at(t, a), 0.1, 0.014, { color: BONE_D, sides: 4, smooth: false, bone: jaw });
    }
    const fang = b.sweep(
      bezier(tip, [sx * 0.17, 0.4, 1.0], [sx * 0.08, 0.24, 0.93]),
      [0.07, 0.0],
      { bone: jaw, sides: 6, smooth: false, caps: { start: "round", end: "point" }, bands: [[0.5, "#2a1c28"], [1, BONE]], name: `fang${L}` },
    );
    b.stick(ico(0.018, 0), AMBER, fang.at(0.95, 180), { bone: jaw, flat: true });
  }

  // pedipalps
  for (const sx of [1, -1]) {
    const L = sx > 0 ? "L" : "R";
    const pts = [
      [sx * 0.2, 0.84, 0.7],
      [sx * 0.3, 0.8, 1.0],
      [sx * 0.35, 0.68, 1.26],
      [sx * 0.3, 0.46, 1.38],
    ];
    const palp = b.chain(`palp${L}`, polyline(pts), {
      parent: head,
      names: [`palpBase${L}`, `palpMid${L}`, `palpTip${L}`, `palpClaw${L}`],
      role: "arm",
    });
    b.sweep(palp, [0.05, 0.047, 0.04, 0.012], {
      sides: 5,
      smooth: false,
      caps: { start: "round", end: "point" },
      bands: [[0.55, DARK], [0.62, BONE], [1, VIOLET]],
      name: `palp${L}`,
    });
    b.part(ico(0.06, 0), BONE_D, { at: palp.at(0.62), flat: true });
  }

  // ================= abdomen =================
  const stations: Array<[number, number]> = [
    [-0.2, 0.22],
    [-0.35, 0.62],
    [-0.65, 1.0],
    [-1.0, 1.22],
    [-1.35, 1.2],
    [-1.7, 0.86],
    [-1.9, 0.46],
    [-2.0, 0.16],
  ];
  const abdomen = b.loft(
    stations.map(([z, w]) => ({ at: [0, cy(z), z], w, h: w * 0.96 })),
    { bone: abd, sides: 10, smooth: false, color: abdomenPaint, name: "abdomen" },
  );
  const abdSurf = b.surface(abdomen);
  const must = (h: Hit | null, what: string) => {
    if (!h) throw new Error(`${what}: ray missed`);
    return h;
  };

  // spinnerets
  for (const sx of [1, -1]) {
    for (const [dx, dz] of [
      [0.07, 0],
      [0.12, 0.06],
    ]) {
      b.capsule([sx * dx, cy(-2.0) - 0.04, -2.0 + dz * -0.2], [sx * dx * 1.2, cy(-2.0) - 0.1, -2.17 - dz], [0.045, 0.028], {
        bone: spin,
        color: BONE_D,
        sides: 5,
        smooth: false,
      });
    }
  }

  // bristle spines over the flanks and belly
  for (const hit of abdSurf.scatter(70, { rng: rng(8), minDist: 0.19, filter: (h) => h.n.y < 0.55 && h.n.y > -0.5 })) {
    b.stick(new THREE.ConeGeometry(0.028, 0.15, 4), rand() < 0.5 ? NIGHT : VIOLET_L, hit, { embed: 0.15, flat: true });
  }

  // bone horns along the shoulders of the abdomen
  for (const sx of [1, -1]) {
    [0.12, 0.2, 0.28, 0.36, 0.44].forEach((t, i) => {
      const p = abdomen.at(t, sx * 64);
      b.spike(p, p, 0.22 - i * 0.025, 0.05 - i * 0.005, { color: BONE, sides: 4, smooth: false });
    });
  }

  // ---- silk-wrapped egg sacs ----
  const wrap = (centre: THREE.Vector3, radii: [number, number, number], dir: THREE.Vector3, bone: Joint, count = 10) => {
    const d = dir.clone().normalize();
    const u = new THREE.Vector3(0, 1, 0).cross(d);
    if (u.lengthSq() < 1e-4) u.set(1, 0, 0);
    u.normalize();
    const v = d.clone().cross(u);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const w = u.clone().multiplyScalar(Math.cos(a)).addScaledVector(v, Math.sin(a));
      pts.push(centre.clone().add(w.multiply(new THREE.Vector3(...radii))));
    }
    b.sweep(polyline(pts, { closed: true }), 0.0095, { color: SILK, sides: 4, smooth: false, bone });
  };

  const backSacs: Array<[number, number, number]> = [
    [0.0, -1.05, 0.27],
    [0.34, -1.2, 0.24],
    [-0.34, -1.22, 0.24],
    [0.17, -1.46, 0.27],
    [-0.17, -1.5, 0.25],
    [0.0, -1.27, 0.22],
    [0.0, -1.76, 0.2],
    [0.56, -0.98, 0.18],
    [-0.56, -1.02, 0.18],
  ];
  let hatch: Hit | null = null;
  let hatchBone: Joint | null = null;
  backSacs.forEach(([x, z, r], i) => {
    const h = must(abdSurf.ray([x, 4, z], [0, -1, 0]), `sac ${i}`);
    const part = b.stick(ico(r, 1), i === 5 ? "#d9f07c" : sacPaint, h, { embed: 0.35, flat: true, name: `sac${i}` });
    if (i === 5) glow(part, 0.8);
    const c = new THREE.Vector3(...h.at.toArray()).addScaledVector(h.n, 0.3 * r);
    const bone = (h.bone ?? abd.joints[1]) as Joint;
    wrap(c, [r * 1.03, r * 1.03, r * 1.03], h.n, bone, 9);
    wrap(c, [r * 1.03, r * 1.03, r * 1.03], h.n.clone().add(new THREE.Vector3(0.9, 0.1, 0.5 * (i % 2 ? 1 : -1))), bone, 9);
    wrap(c, [r * 1.03, r * 1.03, r * 1.03], h.n.clone().add(new THREE.Vector3(-0.4, 0.2, 1.0)), bone, 9);
    b.spike(c.clone().addScaledVector(h.n, r * 0.92), h.n, 0.1, 0.032, { color: SILK, sides: 4, smooth: false, bone });
    if (i === 3) {
      hatch = b.surface(part).nearest([c.x + 0.02, c.y + r * 1.2, c.z - 0.02]);
      hatchBone = bone;
    }
  });

  // ---- the hatching sac: torn hole, glowing eggs ----
  if (hatch && hatchBone) {
    const hh: Hit = hatch;
    b.stick(new THREE.CylinderGeometry(0.075, 0.095, 0.05, 7), HOLE, hh, { embed: 0.55, flat: true, bone: hatchBone });
    for (const [dx, dz, r] of [
      [0.0, 0.0, 0.034],
      [0.04, 0.02, 0.03],
      [-0.035, 0.03, 0.03],
      [0.01, -0.045, 0.028],
    ]) {
      glow(b.stick(ico(r, 1), AMBER, hh.moved([dx, 0.02, dz]), { embed: 0.3, flat: true, bone: hatchBone }), 1.4);
    }
    // torn shell flaps
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      b.stick(new THREE.ConeGeometry(0.03, 0.11, 3), SAC_A, hh.moved([Math.cos(a) * 0.09, 0.0, Math.sin(a) * 0.09]), {
        embed: 0.2,
        flat: true,
        spin: k * 70,
        bone: hatchBone,
      });
    }
  }

  // ---- sacs hung from the belly on silk threads ----
  for (const [x, z, r, drop] of [
    [0.0, -1.25, 0.18, 0.08],
    [0.2, -1.62, 0.17, 0.28],
    [-0.22, -1.55, 0.18, 0.12],
  ]) {
    const h = must(abdSurf.ray([x, -1, z], [0, 1, 0]), "belly");
    const centre = new THREE.Vector3(h.at.x, h.at.y - drop - r * 0.95, h.at.z);
    b.rod(h, [centre.x, centre.y + r * 0.7, centre.z], 0.012, { color: SILK, sides: 4, smooth: false });
    b.part(ico(r, 1), sacPaint, { frame: h, at: centre, scale: [1, 1.15, 1], flat: true, name: "hangingSac" });
    wrap(centre, [r * 1.03, r * 1.17, r * 1.03], new THREE.Vector3(0, 1, 0), h.bone as Joint, 9);
    wrap(centre, [r * 1.03, r * 1.17, r * 1.03], new THREE.Vector3(1, 0.4, 0.2), h.bone as Joint, 9);
    b.spike([centre.x, centre.y + r * 1.1, centre.z], [0, 1, 0], 0.07, 0.03, { color: SILK, sides: 4, smooth: false, bone: h.bone as Joint });
  }

  // ---- trailing sac on the floor, hauled on a silk rope ----
  const sacC = new THREE.Vector3(0, 0.34, -2.55);
  b.part(ico(0.42, 1), sacPaint, { at: sacC, scale: [1, 0.75, 1.25], bone: spin, flat: true, name: "trailSac" });
  for (const dir of [new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0.5, 0.2), new THREE.Vector3(-0.7, 0.4, 1)]) {
    wrap(sacC, [0.43, 0.3, 0.53], dir, spin, 12);
  }
  b.sweep(
    catmull([
      [0, cy(-2.0) - 0.05, -2.08],
      [0, 1.15, -2.3],
      [0, 0.85, -2.5],
      [0, 0.62, -2.55],
    ]),
    [0.03, 0.045],
    { bone: spin, color: SILK, sides: 5, smooth: false, name: "silkRope" },
  );
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.04, cy(-2.0) - 0.08, -2.1],
        [s * 0.14, 1.0, -2.3],
        [s * 0.2, 0.7, -2.45],
        [s * 0.16, 0.5, -2.5],
      ]),
      0.012,
      { bone: spin, color: SILK, sides: 4, smooth: false },
    );
  }

  // ---- web mat and loose eggs on the floor ----
  const web = svg(webSvg(), { size: 1024 });
  b.part(new THREE.PlaneGeometry(3.0, 3.0), "#ffffff", {
    at: [0, 0.012, -2.5],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, 1],
    bone: thorax,
    texture: web,
    name: "webMat",
  });
  for (const [x, z, r] of [
    [0.65, -2.15, 0.1],
    [0.82, -2.45, 0.075],
    [-0.7, -2.2, 0.09],
    [-0.88, -2.55, 0.07],
    [0.55, -3.0, 0.08],
    [-0.5, -3.05, 0.085],
    [0.1, -3.2, 0.07],
  ]) {
    b.part(ico(r, 1), x > 0 ? EGG : "#d7dfae", { at: [x, r * 0.85, z], scale: [1, 1.15, 1], bone: thorax, flat: true });
  }
  // empty husks left from earlier broods
  for (const [x, z, spin] of [
    [0.4, -2.0, 20],
    [-0.45, -2.05, 110],
    [1.0, -2.75, 60],
    [-1.05, -2.9, 150],
    [0.75, -3.35, 80],
    [-0.1, -3.7, 30],
  ]) {
    b.part(new THREE.SphereGeometry(0.1, 5, 3, 0, Math.PI * 2, 0, Math.PI / 2), SAC_A, {
      at: [x, 0.0, z],
      rotation: [rand() * 20 - 10, spin, rand() * 20 - 10],
      bone: thorax,
      flat: true,
    });
  }

  // ================= spiderlings =================
  const spiderling = (bone: Joint, base: THREE.Vector3, yaw: number, k: number) => {
    const rot = (x: number, z: number) => new THREE.Vector3(x * Math.cos(yaw) + z * Math.sin(yaw), 0, -x * Math.sin(yaw) + z * Math.cos(yaw));
    const at = (x: number, y: number, z: number) => base.clone().add(rot(x * k, z * k)).add(new THREE.Vector3(0, y * k, 0));
    b.part(ico(0.05 * k, 0), PLATE, { at: at(0, 0.11, 0.02), scale: [1, 0.85, 1.1], bone, flat: true });
    b.part(ico(0.068 * k, 0), VIOLET, { at: at(0, 0.115, -0.1), scale: [1, 0.9, 1.25], bone, flat: true });
    b.part(ico(0.02 * k, 0), ORANGE, { at: at(0, 0.165, -0.1), bone, flat: true });
    for (const sx of [1, -1]) {
      b.part(ico(0.013 * k, 0), EYE_Y, { at: at(sx * 0.02, 0.135, 0.065), bone, flat: true });
      [0.05, 0.015, -0.015, -0.045].forEach((zs, i) => {
        const fz = [0.15, 0.08, -0.07, -0.15][i];
        b.sweep(
          polyline([at(sx * 0.035, 0.11, zs), at(sx * 0.15, 0.24 - i * 0.015, zs * 1.5 + fz * 0.4), at(sx * 0.24, 0.0, fz)]),
          [0.011 * k, 0.005 * k],
          { bone, color: i % 2 ? NIGHT : DARK, sides: 4, smooth: false, caps: { start: "round", end: "point" } },
        );
      });
    }
  };
  // two on her back, three on the web
  for (const [x, z, yaw, k] of [
    [0.3, -0.62, 0.4, 1.3],
    [-0.36, -0.82, -0.7, 1.15],
  ]) {
    const h = must(abdSurf.ray([x, 4, z], [0, -1, 0]), "spiderling");
    spiderling(abd.joints[1], new THREE.Vector3(h.at.x, h.at.y - 0.02, h.at.z), yaw, k);
  }
  for (const [x, z, yaw, k] of [
    [0.55, -2.65, 2.4, 1.6],
    [-0.62, -2.8, 3.6, 1.5],
    [-0.15, -3.35, 0.2, 1.3],
  ]) {
    spiderling(thorax, new THREE.Vector3(x, 0.012, z), yaw, k);
  }

  // ================= legs =================
  const PROFILE: Array<[number, number]> = [
    [0, 0.86],
    [0.12, 0.94],
    [0.68, 1.62],
    [0.86, 1.6],
    [1.5, 0.95],
    [1.86, 0.37],
    [2.08, 0.02],
  ];
  const LEG_R = [0.15, 0.135, 0.115, 0.095, 0.07, 0.046, 0.016];
  const YAW = [38, 72, 108, 142];
  const HIP_Z = [0.5, 0.36, 0.2, 0.04];
  const REACH = [1.0, 0.92, 0.9, 1.02];
  const PEAK = [1.0, 1.04, 0.98, 0.94];
  const NAMES = ["coxa", "femur", "patella", "tibia", "metatarsus", "tarsus", "foot"];

  for (const sx of [1, -1]) {
    const L = sx > 0 ? "L" : "R";
    for (let i = 0; i < 4; i++) {
      const yaw = (YAW[i] * Math.PI) / 180;
      const dx = sx * Math.sin(yaw);
      const dz = Math.cos(yaw);
      const pts = PROFILE.map(([r, y], k) => {
        const yy = k === 2 || k === 3 ? 0.86 + (y - 0.86) * PEAK[i] : y;
        return [sx * 0.26 + dx * r * REACH[i], yy, HIP_Z[i] + dz * r * REACH[i]];
      });
      const lens = pts.slice(1).map((p, k) => Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1], p[2] - pts[k][2]));
      const total = lens.reduce((a, c) => a + c, 0);
      const tK = [0];
      lens.forEach((l) => tK.push(tK[tK.length - 1] + l / total));
      const leg = b.chain(`leg${L}${i + 1}`, polyline(pts), {
        parent: thorax,
        names: NAMES.map((n) => `${n}${L}${i + 1}`),
        role: "leg",
      });
      const sw = b.sweep(leg, (t) => interp(tK, LEG_R, t), {
        color: legPaint(tK),
        sides: 6,
        smooth: false,
        caps: { start: "round", end: "point" },
        name: `leg${L}${i + 1}`,
      });
      // hip socket and knee cap
      b.part(ico(0.14, 0), PLATE, { at: leg.at(0.012), flat: true });
      b.part(ico(0.095, 0), BONE, { at: leg.at(tK[2] + 0.012), flat: true });
      // knee spike
      const tp = (tK[2] + tK[3]) / 2;
      b.spike(sw.at(tp, 0), sw.at(tp, 0), 0.2, 0.04, { color: BONE, sides: 4, smooth: false });
      // spines along tibia and metatarsus
      for (const f of [0.22, 0.52, 0.82]) {
        const t = tK[3] + (tK[4] - tK[3]) * f;
        for (const a of [-75, 75]) b.spike(sw.at(t, a), sw.at(t, a), 0.11 - f * 0.03, 0.017, { color: NIGHT, sides: 4, smooth: false });
      }
      for (const f of [0.3, 0.7]) {
        const t = tK[4] + (tK[5] - tK[4]) * f;
        for (const a of [-100, 100]) b.spike(sw.at(t, a), sw.at(t, a), 0.08, 0.013, { color: BONE_D, sides: 4, smooth: false });
      }
      for (const f of [0.3, 0.62]) {
        const t = tK[1] + (tK[2] - tK[1]) * f;
        b.spike(sw.at(t, 0), sw.at(t, 0), 0.08, 0.02, { color: VIOLET_L, sides: 4, smooth: false });
      }
    }
  }

  return b.root;
}
