import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  polyline,
  offset,
  paint,
  scales,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Emperor Penguin",
  description:
    "A stylized emperor penguin built from primitives: a pear-shaped body skinned over a spine, flippers held out in a rest pose, an orange cheek patch and golden bib, a two-part beak, and webbed feet.",
};

const BLACK = "#1b2030";
const BLUEBLACK = "#252d40";
const WHITE = "#f5f2ea";
const CREAM = "#e4dfd4";
const ORANGE = "#f39a1e";
const GOLD = "#f7d97e";
const PALEGOLD = "#faeec6";
const BEAK = "#22252c";
const BEAKORANGE = "#f07f2a";
const FOOT = "#4a4450";
const CLAW = "#24212a";
const EYE = "#15110d";

// smooth keyed profile: keys are [t, a, b]
function prof(keys: number[][], t: number, i: number): number {
  if (t <= keys[0][0]) return keys[0][i];
  for (let k = 0; k < keys.length - 1; k++) {
    const a = keys[k];
    const c = keys[k + 1];
    if (t <= c[0]) {
      let u = (t - a[0]) / (c[0] - a[0]);
      u = u * u * (3 - 2 * u);
      return a[i] + (c[i] - a[i]) * u;
    }
  }
  return keys[keys.length - 1][i];
}

function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  let u = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
  u = Math.max(0, Math.min(1, u));
  const qx = ax + dx * u - px;
  const qy = ay + dy * u - py;
  return Math.sqrt(qx * qx + qy * qy);
}

export default function build() {
  const b = createBuilder({ name: "penguin" });

  // ---------- skeleton: spine ----------
  const bodyPath = catmull([
    [0, 0.16, -0.03],
    [0, 0.36, 0.0],
    [0, 0.6, 0.0],
    [0, 0.8, 0.025],
    [0, 1.0, 0.05],
  ]);
  const hips = b.joint("hips", { at: bodyPath.at(0.1), dir: [0, 1, 0], role: "spine" });
  const spine = b.chain("spine", bodyPath.slice(0.2, 1), {
    parent: hips,
    count: 4,
    names: ["spine1", "chest", "neck", "head"],
    role: "spine",
  });
  const chest = spine.joints[1];
  const head = spine.joints[3];

  // ---------- body paint ----------
  const belly = scales(WHITE, CREAM, { size: 0.045, seed: 3 });
  const back = scales(BLACK, BLUEBLACK, { size: 0.05, seed: 5 });
  const bodyPaint = paint((p, n) => {
    // orange auricular comma on each side of the head, sweeping down to the bib
    if (Math.abs(p.x) > 0.04 && Math.abs(n.x) > 0.3 && n.z > -0.4) {
      if (segDist(p.z, p.y, -0.005, 0.845, 0.085, 0.69) < 0.03) return ORANGE;
    }
    const th = p.y < 0.5 ? -0.28 : p.y < 0.6 ? -0.12 : 0.05;
    if (p.y < 0.72 && n.z > th) {
      if (p.y > 0.63) return GOLD;
      if (p.y > 0.58) return PALEGOLD;
      return belly;
    }
    return back;
  });

  // ---------- body ----------
  const keys = [
    [0, 0.15, 0.14],
    [0.15, 0.2, 0.18],
    [0.35, 0.2, 0.18],
    [0.55, 0.16, 0.145],
    [0.7, 0.115, 0.11],
    [0.8, 0.112, 0.115],
    [0.9, 0.095, 0.1],
    [1, 0.05, 0.06],
  ];
  const body = b.sweep(
    bodyPath,
    (t: number) => [prof(keys, t, 1), prof(keys, t, 2)] as [number, number],
    { bone: [hips, spine], color: bodyPaint, sides: 14, name: "body" },
  );
  const surf = b.surface(body);

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    polyline([
      [0, 0.2, -0.1],
      [0, 0.12, -0.2],
      [0, 0.075, -0.29],
    ]),
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );
  b.sweep(tail, (t: number) => [0.065 * (1 - t) + 0.02, 0.018] as [number, number], {
    color: BLACK,
    caps: { start: "round", end: "point" },
    sides: 8,
    name: "tail",
  });

  // ---------- head: beak and jaw ----------
  const front = surf.ray([0, 0.87, 0.6], [0, 0, -1])!;
  const bz = front.at.z - 0.025;
  const upperBase: [number, number, number] = [0, 0.876, bz];
  b.sweep(
    bezier(upperBase, [0, 0.888, bz + 0.1], [0, 0.846, bz + 0.215]),
    (t: number) => [0.028 * (1 - t) + 0.003, 0.02 * (1 - t) + 0.003] as [number, number],
    { bone: head, color: BEAK, caps: { start: "round", end: "point" }, sides: 8, name: "beakUpper" },
  );
  // a thin orange line along the upper bill edge
  for (const s of [1, -1]) {
    b.sweep(
      bezier([s * 0.02, 0.868, bz + 0.03], [s * 0.016, 0.872, bz + 0.1], [s * 0.006, 0.856, bz + 0.17]),
      [0.004, 0.002],
      { bone: head, color: BEAKORANGE, sides: 5, name: "beakStripe" },
    );
  }
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.853, bz],
    aim: [0, 0.838, bz + 0.19],
    role: "jaw",
  });
  b.sweep(
    bezier([0, 0.853, bz], [0, 0.847, bz + 0.1], [0, 0.838, bz + 0.19]),
    (t: number) => [0.022 * (1 - t) + 0.003, 0.012 * (1 - t) + 0.002] as [number, number],
    {
      bone: jaw,
      bands: [
        [0.55, BEAKORANGE],
        [1, BEAK],
      ],
      caps: { start: "round", end: "point" },
      sides: 8,
      name: "beakLower",
    },
  );

  // ---------- eyes ----------
  const ring = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="29" fill="#c9ced8"/><circle cx="32" cy="32" r="22" fill="#3b2a1d"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    const hit = surf.around([0, 0.89, 0.04]).at(s * 60, 12);
    b.decal(body, ring, { at: hit, size: [0.05, 0.05], mirror: s > 0, bone: head, name: "eyeRing" });
    b.stick(new THREE.SphereGeometry(0.017, 8, 6), EYE, hit, { embed: 0.45, bone: head, name: "eye" });
    const hl = hit.at.clone().addScaledVector(hit.n, 0.014).add(new THREE.Vector3(0, 0.006, 0.005));
    b.part(new THREE.SphereGeometry(0.0055, 6, 4), "#ffffff", { at: hl, bone: head, name: "eyeGlint" });
  }

  // ---------- flippers ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const fl = b.chain(
      `flipper${S}`,
      polyline([
        [s * 0.12, 0.62, 0.0],
        [s * 0.3, 0.55, 0.0],
        [s * 0.46, 0.47, -0.01],
        [s * 0.57, 0.42, -0.02],
      ]),
      { parent: chest, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `flipperTip${S}`], role: "arm" },
    );
    b.sweep(
      fl,
      (t: number) => {
        const w = t < 0.3 ? 0.05 + (0.068 - 0.05) * (t / 0.3) : 0.068 * (1 - (t - 0.3) / 0.7) + 0.014;
        return [w, 0.018 * (1 - 0.5 * t)] as [number, number];
      },
      {
        color: BLACK,
        sectors: [[115, 245, WHITE, 0, 0.82]],
        sides: 10,
        name: `flipper${S}`,
      },
    );
  }

  // ---------- legs and feet ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const x = s * 0.1;
    const leg = b.chain(
      `leg${S}`,
      polyline([
        [s * 0.09, 0.2, 0.02],
        [x, 0.12, 0.06],
        [x, 0.045, 0.07],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg", contact: [x, 0, 0.13] },
    );
    b.sweep(leg, [0.045, 0.035], { color: FOOT, sides: 8, name: `leg${S}` });
    const ankle = leg.tip!;
    const base: [number, number, number] = [x, 0.022, 0.07];
    const webPts: number[][] = [[x, 0.012, 0.07]];
    [-1, 0, 1].forEach((k) => {
      const a = (k * 26 + s * 4) * (Math.PI / 180);
      const dir = [Math.sin(a), 0, Math.cos(a)];
      const len = k === 0 ? 0.14 : 0.12;
      const tip: [number, number, number] = [x + dir[0] * len, 0.018, 0.07 + dir[2] * len];
      const toe = b.joint(`toe${k + 2}${S}`, { parent: ankle, at: base, aim: tip, role: "digit" });
      b.capsule(base, tip, [0.024, 0.016], { bone: toe, color: FOOT, sides: 7, name: `toe${S}` });
      b.spike(offset(tip, [dir[0], 0, dir[2]], 0.008), [dir[0], -0.35, dir[2]], 0.03, 0.009, {
        bone: toe,
        color: CLAW,
        sides: 6,
        name: `claw${S}`,
      });
      webPts.push([x + dir[0] * len * 0.8, 0.012, 0.07 + dir[2] * len * 0.8]);
    });
    b.slab(webPts, { color: FOOT, thickness: 0.012, bone: ankle, name: `web${S}` });
  }

  return b.root;
}
