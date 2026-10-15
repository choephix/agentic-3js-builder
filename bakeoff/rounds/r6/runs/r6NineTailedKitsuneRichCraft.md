```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  polyline,
  bezier,
  limb,
  paint,
  gradient,
  noise,
  mix,
  smoothstep,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { cel, furEdge, animeEye } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description:
    "A white nine-tailed kitsune with crimson kumadori markings, a bell collar and spirit flames burning on every tail tip, standing on a runed shrine plinth with stone lanterns and drifting hitodama.",
};

type V3 = [number, number, number];
type Ol = ([number, number] | [number, number, "sharp"])[];

const B = 0.12; // plinth height: the fox stands on it
const DEG = Math.PI / 180;
const P = (x: number, y: number, z: number): V3 => [x, y + B, z];
const v3 = (a: THREE.Vector3 | number[]) => (Array.isArray(a) ? new THREE.Vector3(a[0], a[1], a[2]) : a.clone());

// palette
const CREAM = "#fff7ec";
const BELLY = "#f6e8f4";
const LAV = "#e3d3f0";
const SOCK = "#33204f";
const RED = "#d92b45";
const RED_D = "#9b1830";
const GOLD = "#f4b83c";
const GOLD_D = "#b9791f";
const PINK = "#f58aa8";
const TEAL = "#46f2e6";
const WOODC = "#5a3a2a";

// ------------------------------------------------------------------ drawings
const polar = (r: number, deg: number) => [100 + r * Math.sin(deg * DEG), 100 - r * Math.cos(deg * DEG)];

function circleInlay() {
  let s = `<circle cx="100" cy="100" r="97" fill="none" stroke="#f4b83c" stroke-width="2.4"/>`;
  s += `<circle cx="100" cy="100" r="86" fill="none" stroke="#46f2e6" stroke-width="1.6"/>`;
  for (let k = 0; k < 36; k++) {
    const a = k * 10;
    const [x1, y1] = polar(88.5, a);
    const [x2, y2] = polar(95, a);
    s += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#46f2e6" stroke-width="1.4"/>`;
    if (k % 3 === 0) {
      const [x3, y3] = polar(91.5, a + 2.5);
      const [x4, y4] = polar(91.5, a - 2.5);
      s += `<path d="M${x3.toFixed(1)} ${y3.toFixed(1)} L${x4.toFixed(1)} ${y4.toFixed(1)}" stroke="#f4b83c" stroke-width="1.4"/>`;
    }
  }
  const star = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => polar(72, i * 160).map((n) => n.toFixed(1)).join(" "));
  s += `<path d="M${star.join(" L")} Z" fill="none" stroke="#f4b83c" stroke-width="1.6" stroke-linejoin="round"/>`;
  for (let i = 0; i < 9; i++) {
    const [x, y] = polar(72, i * 40);
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" fill="#46f2e6"/>`;
    const [x2, y2] = polar(60, i * 40 + 20);
    s += `<path transform="rotate(${i * 40 + 20} ${x2.toFixed(1)} ${y2.toFixed(1)})" d="M${x2.toFixed(1)} ${(y2 - 6).toFixed(1)} q4 4 0 9 q-4 -5 0 -9z" fill="#8b5bff"/>`;
  }
  s += `<circle cx="100" cy="100" r="42" fill="none" stroke="#46f2e6" stroke-width="1.2" stroke-dasharray="3 3"/>`;
  return svg(`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">${s}</svg>`, { size: 1024 });
}

function sigil() {
  let s = `<circle cx="50" cy="50" r="44" fill="none" stroke="#ffd45a" stroke-width="3"/>`;
  s += `<circle cx="50" cy="50" r="36" fill="none" stroke="#46f2e6" stroke-width="1.6"/>`;
  for (let k = 0; k < 9; k++)
    s += `<path transform="rotate(${k * 40} 50 50)" d="M50 15 C58 23 58 31 50 37 C42 31 42 23 50 15Z" fill="${k % 2 ? "#8b5bff" : "#46f2e6"}"/>`;
  s += `<circle cx="50" cy="50" r="7" fill="#ffd45a"/><circle cx="50" cy="50" r="3" fill="#ffffff"/>`;
  return svg(`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${s}</svg>`, { size: 256 });
}

const FOREHEAD = svg(
  `<svg viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 4 C44 26 52 44 30 86 C8 44 16 26 30 4Z" fill="#d92b45" stroke="#6a0f24" stroke-width="2.5"/>
    <path d="M30 22 C36 38 36 50 30 66 C24 50 24 38 30 22Z" fill="#ffd45a"/>
    <circle cx="30" cy="46" r="4" fill="#d92b45"/>
  </svg>`,
  { size: 192 },
);

const SWOOSH = svg(
  `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
    <path d="M52 24 Q30 4 2 3 Q26 18 46 36 Z" fill="#d92b45" stroke="#6a0f24" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M50 38 Q30 52 6 56 Q30 40 46 30 Z" fill="#d92b45" stroke="#6a0f24" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M44 20 Q30 12 14 12" stroke="#ffd45a" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const OFUDA = svg(
  `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="36" height="76" rx="2" fill="#fbf1d8" stroke="#d92b45" stroke-width="2.5"/>
    <path d="M20 10 V68 M10 22 H30 M12 38 H28 M14 54 H26" stroke="#d92b45" stroke-width="3" fill="none"/>
    <circle cx="20" cy="72" r="2.6" fill="#d92b45"/>
  </svg>`,
  { size: 128 },
);

const PETAL = svg(
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 30 C2 20 2 6 10 3 C13 2 15 4 16 7 C17 4 19 2 22 3 C30 6 30 20 16 30Z" fill="#ffb7d1" stroke="#f27ba6" stroke-width="1.5"/>
  </svg>`,
  { size: 64 },
);

// ------------------------------------------------------------------ paints
const coat = cel(furEdge(CREAM, BELLY, { level: -0.3, teeth: 0.22, period: 0.03 }), LAV);
const SOCKC = cel(SOCK, "#1b0f2e");
const legPaint = furEdge(coat, SOCKC, {
  by: "position",
  axis: [0, 1, 0],
  level: B + 0.19,
  teeth: 0.07,
  period: 0.045,
  along: [1, 0, 1],
});
const earOuter = paint((_p, _n, s) => (s[1] > 0.17 ? SOCKC : coat));
const REDC = cel(RED, RED_D);
const PINKC = cel(PINK, "#c8587a");
const GOLDC = cel(GOLD, GOLD_D);
const STONE = paint((p, n) => {
  const m = noise(p, 0.2, 4);
  let c = mix("#6d6785", "#a29cbd", m);
  const edge = Math.hypot(p.x, p.z + 0.15);
  const moss = smoothstep(0.58, 0.78, noise(p, 0.3, 9)) * smoothstep(0.7, 1.25, edge) * (n.y > 0.5 ? 1 : 0.25);
  c = mix(c, "#5fa86a", moss * 0.85);
  if (n.y > 0.6) c = mix(c, "#cfc8e6", 0.25);
  else if (n.y < 0.2) c = mix(c, "#463f61", 0.3);
  return c;
});

const TIPS = [
  ["#9ff7ff", "#46f2e6", "#eafffb"],
  ["#d7c2ff", "#8b5bff", "#f4ecff"],
];
const TIPS_SHADOW = ["#7fd3ee", "#a98be0"];

export default function build() {
  const b = createBuilder({ name: "kitsune" });
  const R = rng(11);

  // ---------------------------------------------------------------- helpers
  const blade = (o: {
    at: THREE.Vector3 | number[];
    dir: THREE.Vector3 | number[];
    len: number;
    w: number;
    color: any;
    bone: any;
    th?: number | [number, number];
    wdir?: number[];
  }) => {
    const d = v3(o.dir).normalize();
    let wd: THREE.Vector3;
    if (o.wdir) {
      wd = v3(o.wdir);
      wd.addScaledVector(d, -wd.dot(d));
    } else {
      const ref = Math.abs(d.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
      wd = new THREE.Vector3().crossVectors(d, ref);
    }
    wd.normalize();
    const w = o.w;
    const L = o.len;
    const pts: Ol = [
      [-w / 2, 0],
      [w / 2, 0],
      [w * 0.55, L * 0.35],
      [w * 0.2, L * 0.75],
      [0, L, "sharp"],
      [-w * 0.2, L * 0.75],
      [-w * 0.55, L * 0.35],
    ];
    return b.extrude(pts, {
      at: v3(o.at).toArray(),
      x: wd.toArray(),
      y: d.toArray(),
      thickness: o.th ?? [0.022, 0.004],
      color: o.color,
      bone: o.bone,
    });
  };

  const flame = (
    at: THREE.Vector3 | number[],
    axis: THREE.Vector3 | number[],
    h: number,
    col: string,
    bone: any,
    strength = 1.25,
  ) => {
    const ol: Ol = [
      [0, -0.08 * h],
      [0.15 * h, 0],
      [0.2 * h, 0.2 * h],
      [0.14 * h, 0.46 * h],
      [0.06 * h, 0.73 * h],
      [0, h, "sharp"],
    ];
    return glow(
      b.lathe(ol, { at: v3(at).toArray(), axis: v3(axis).normalize().toArray(), segments: 7, bone, color: col }),
      strength,
    );
  };

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: P(0, 0.64, -0.38) });
  const spinePath = catmull([P(0, 0.64, -0.38), P(0, 0.69, -0.08), P(0, 0.75, 0.22), P(0, 0.82, 0.46)]);
  const spine = b.chain("spine", spinePath, { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" });
  const chest = spine.joints[2];

  const NECK_END = P(0, 1.08, 0.67);
  const neckPath = catmull([P(0, 0.82, 0.46), P(0, 0.96, 0.58), NECK_END]);
  const neck = b.chain("neck", neckPath, { parent: chest, names: ["neck1", "neck2"], role: "neck" });

  const HC: V3 = P(0, 1.13, 0.77);
  const H = (x: number, y: number, z: number): V3 => [HC[0] + x, HC[1] + y, HC[2] + z];
  const head = b.joint("head", { parent: neck.joints[1], at: NECK_END, dir: [0, -0.15, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: H(0, -0.075, 0.05), aim: H(0, -0.09, 0.28), role: "jaw" });

  // ---------------------------------------------------------------- body
  const bodySweep = b.sweep(spine, (t) => [0.14 + 0.03 * t, 0.15 + 0.05 * t], { color: coat });
  const bodySurf = b.surface(bodySweep);
  const neckSweep = b.sweep(neck, (t) => 0.115 - 0.03 * t, { color: coat });

  // fluff at rump, haunches, shoulders
  b.part(new THREE.SphereGeometry(1, 10, 8), coat, { bone: hips, at: P(0, 0.68, -0.5), scale: [0.15, 0.15, 0.16], flat: true });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 8), coat, { bone: hips, at: P(s * 0.14, 0.62, -0.38), scale: [0.1, 0.15, 0.16], flat: true });
    b.part(new THREE.SphereGeometry(1, 10, 8), coat, { bone: chest, at: P(s * 0.13, 0.7, 0.4), scale: [0.1, 0.14, 0.14], flat: true });
  }

  // chest ruff
  const chestHits = bodySurf.scatter(22, {
    rng: R,
    minDist: 0.055,
    filter: (h) => h.at.z > 0.4 && h.n.z > 0.35 && h.at.y > 0.62 + B,
  });
  for (const h of chestHits) {
    const dir = h.n.clone().multiplyScalar(0.4).add(new THREE.Vector3(0, -1, 0.05));
    blade({
      at: h.at.clone().addScaledVector(h.n, -0.025),
      dir,
      wdir: [1, 0, 0],
      len: 0.13,
      w: 0.07,
      color: coat,
      bone: h.bone ?? chest,
    });
  }

  // back mane and neck mane
  for (let k = 0; k < 5; k++) {
    const sp = neckSweep.at(0.12 + k * 0.17, 0);
    const dir = sp.n.clone().multiplyScalar(0.7).addScaledVector(sp.tangent, -0.55);
    blade({
      at: sp.at.clone().addScaledVector(sp.n, -0.025),
      dir,
      wdir: [1, 0, 0],
      len: 0.16 - k * 0.012,
      w: 0.085,
      color: coat,
      bone: sp.bone ?? neck.joints[0],
    });
  }
  for (let k = 0; k < 5; k++) {
    const sp = bodySweep.at(0.08 + k * 0.2, 0);
    const dir = sp.n.clone().multiplyScalar(0.5).addScaledVector(sp.tangent, -0.7);
    blade({
      at: sp.at.clone().addScaledVector(sp.n, -0.025),
      dir,
      wdir: [1, 0, 0],
      len: 0.12,
      w: 0.08,
      color: coat,
      bone: sp.bone ?? hips,
    });
  }

  // glowing flank sigils
  const SIGIL = sigil();
  for (const s of [1, -1]) {
    const hit = b.surface(bodySweep).around(P(0, 0.72, -0.12)).at(s * 90, 8);
    if (hit)
      glow(
        b.decal(bodySweep, SIGIL, { at: hit, dir: [s, 0, 0], size: [0.26, 0.26], lift: 0.004, segments: 12 }),
        1.1,
      );
  }

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // fore leg
    const fp = limb(P(s * 0.12, 0.68, 0.4), P(s * 0.12, 0.045, 0.45), [0.28, 0.26, 0.14], [[0, 0, -1], [0, 0, 1]]);
    const fore = b.chain(`foreLeg${S}`, fp, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`],
      role: "leg",
      contact: [s * 0.12, B, 0.47],
    });
    b.sweep(fore, [0.068, 0.045, 0.035, 0.032], { color: legPaint });
    b.part(new THREE.SphereGeometry(1, 9, 7), legPaint, {
      bone: fore.tip!,
      at: [s * 0.12, B + 0.04, 0.485],
      scale: [0.05, 0.042, 0.078],
      flat: true,
    });
    const fc = b.ring(fore.at(0.66), { count: 8, radius: 0.046 }).items;
    b.sweep(catmull(fc.map((i) => i.at), { closed: true }), 0.009, { color: REDC, bone: fore.joints[2] });

    // hind leg (digitigrade)
    const hp = limb(P(s * 0.13, 0.66, -0.38), P(s * 0.13, 0.045, -0.46), [0.3, 0.3, 0.12], [[0, 0, 1], [0, 0, -1]]);
    const hind = b.chain(`hindLeg${S}`, hp, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`],
      role: "leg",
      contact: [s * 0.13, B, -0.43],
    });
    b.sweep(hind, [0.09, 0.05, 0.037, 0.034], { color: legPaint });
    b.part(new THREE.SphereGeometry(1, 9, 7), legPaint, {
      bone: hind.tip!,
      at: [s * 0.13, B + 0.04, -0.425],
      scale: [0.05, 0.042, 0.078],
      flat: true,
    });
    const hc = b.ring(hind.at(0.74), { count: 8, radius: 0.046 }).items;
    b.sweep(catmull(hc.map((i) => i.at), { closed: true }), 0.009, { color: REDC, bone: hind.joints[2] });
  }

  // ---------------------------------------------------------------- head
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), coat, { bone: head, at: HC, scale: [0.165, 0.14, 0.15], flat: true });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(1, 9, 7), coat, {
      bone: head,
      at: H(s * 0.1, -0.05, 0.07),
      scale: [0.07, 0.06, 0.09],
      flat: true,
    });
  b.sweep(polyline([H(0, -0.02, 0.1), H(0, -0.05, 0.31)]), (t) => [0.075 - 0.047 * t, 0.06 - 0.033 * t], {
    bone: head,
    color: coat,
    sides: 8,
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), "#2a1a3a", {
    bone: head,
    at: H(0, -0.046, 0.335),
    scale: [0.028, 0.022, 0.022],
    flat: true,
  });
  // lower jaw (own bone)
  b.sweep(polyline([H(0, -0.078, 0.05), H(0, -0.09, 0.29)]), (t) => [0.062 - 0.034 * t, 0.03 - 0.012 * t], {
    bone: jaw,
    color: coat,
    sides: 8,
  });

  // ears
  for (const s of [1, -1]) {
    const eb = H(s * 0.085, 0.105, -0.03);
    const ed = [s * 0.3, 1, -0.2];
    blade({ at: eb, dir: ed, wdir: [1, 0, 0], len: 0.27, w: 0.14, th: 0.02, color: earOuter, bone: head });
    blade({
      at: [eb[0], eb[1] - 0.005, eb[2] + 0.012],
      dir: ed,
      wdir: [1, 0, 0],
      len: 0.2,
      w: 0.08,
      th: 0.01,
      color: PINKC,
      bone: head,
    });
  }
  // cheek ruffs
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++)
      blade({
        at: H(s * 0.125, -0.02 - 0.022 * i, 0.02 - 0.03 * i),
        dir: [s * (0.9 - 0.1 * i), -0.12 - 0.18 * i, -0.4 - 0.1 * i],
        wdir: [0, 1, 0.5],
        len: 0.16 - 0.012 * i,
        w: 0.075,
        color: coat,
        bone: head,
      });
  // forehead fringe
  for (let k = -1; k <= 1; k++)
    blade({
      at: H(k * 0.04, 0.11, 0.07),
      dir: [k * 0.3, 0.35, 0.9],
      wdir: [1, 0, 0],
      len: 0.11,
      w: 0.055,
      color: coat,
      bone: head,
    });

  // face drawings
  const EYE = animeEye({ iris: "#f7a81b", irisLight: "#fff0a0" });
  const skullSurf = b.surface(skull);
  const markHit = skullSurf.around(HC).at(0, 58);
  if (markHit)
    b.decal(skull, FOREHEAD, {
      at: markHit,
      dir: [0, 0.55, 1],
      size: [0.06, 0.09],
      lift: 0.003,
    });
  for (const s of [1, -1]) {
    const eyeHit = skullSurf.around(HC).at(s * 46, 6);
    const markSide = skullSurf.around(HC).at(s * 50, 6);
    if (markSide)
      b.decal(skull, SWOOSH, {
        at: markSide,
        dir: [s * 0.6, 0.1, 1],
        size: [0.22, 0.13],
        mirror: s > 0,
        lift: 0.0025,
        segments: 12,
      });
    if (eyeHit)
      b.decal(skull, EYE, {
        at: eyeHit,
        dir: [s * 0.5, 0.05, 1],
        size: [0.064, 0.088],
        mirror: s > 0,
        lift: 0.005,
        segments: 10,
      });
    // whiskers
    for (const k of [0.03, -0.03])
      b.sweep(bezier(H(s * 0.05, -0.04, 0.22), H(s * 0.2, -0.02 + k, 0.2), H(s * 0.33, -0.06 + 2 * k, 0.07)), [0.004, 0.0015], {
        bone: head,
        color: "#ffffff",
        sides: 4,
      });
  }

  // ---------------------------------------------------------------- collar, bell, charm
  const ring1 = b.ring(neck.at(0.35), { count: 10, radius: 0.123 }).items;
  b.sweep(catmull(ring1.map((i) => i.at), { closed: true }), 0.024, { color: REDC, bone: neck.joints[0] });
  const ring2 = b.ring(neck.at(0.26), { count: 10, radius: 0.12 }).items;
  b.sweep(catmull(ring2.map((i) => i.at), { closed: true }), 0.012, { color: GOLDC, bone: neck.joints[0] });

  const np = neck.at(0.35);
  const fwd = new THREE.Vector3(0, 0, 1);
  fwd.addScaledVector(np.tangent, -np.tangent.z).normalize();
  const bellPos = np.at.clone().addScaledVector(fwd, 0.14);
  b.part(new THREE.SphereGeometry(0.036, 9, 7), GOLD, { bone: neck.joints[0], at: bellPos, flat: true });
  b.part(new THREE.SphereGeometry(0.009, 6, 4), "#5a3a14", {
    bone: neck.joints[0],
    at: bellPos.clone().addScaledVector(fwd, 0.034).add(new THREE.Vector3(0, -0.012, 0)),
  });
  b.part(new THREE.TorusGeometry(0.014, 0.004, 5, 8), GOLD, {
    bone: neck.joints[0],
    at: bellPos.clone().add(new THREE.Vector3(0, 0.04, 0)),
    flat: true,
  });
  for (const s of [1, -1])
    blade({
      at: bellPos.clone().add(new THREE.Vector3(s * 0.035, -0.02, 0.0)),
      dir: [s * 0.15, -1, 0.25],
      wdir: [1, 0, 0],
      len: 0.22,
      w: 0.05,
      th: 0.01,
      color: REDC,
      bone: neck.joints[0],
    });
  const ch = bodySurf.ray([0, bellPos.y - 0.14, 1.5], [0, 0, -1]);
  if (ch) {
    const OF = b.part(new THREE.PlaneGeometry(0.08, 0.14), "#ffffff", {
      bone: chest,
      at: ch.at.clone().addScaledVector(ch.n, 0.014),
      dir: ch.n,
      axis: "z",
      texture: OFUDA,
    });
    b.rod(bellPos.clone().add(new THREE.Vector3(0, -0.02, 0)), OF.at.clone().add(new THREE.Vector3(0, 0.07, 0)), 0.004, GOLD, {
      bone: chest,
    });
  }

  // ---------------------------------------------------------------- nine tails
  const tailBase = P(0, 0.66, -0.5);
  b.part(new THREE.SphereGeometry(1, 10, 8), coat, { bone: hips, at: P(0, 0.72, -0.56), scale: [0.17, 0.15, 0.15], flat: true });
  for (let i = 0; i < 9; i++) {
    const phi = ((i - 4) / 4) * 80 * DEG;
    const sx = Math.sin(phi);
    const cy = Math.cos(phi);
    const mid = 1 - Math.abs(i - 4) / 4;
    const k = 0.95 + 0.1 * (i % 2);
    const by = tailBase[1];
    const bz = tailBase[2];
    const pts: V3[] = [
      [0, by, bz],
      [sx * 0.2 * k, by + cy * 0.2 + 0.06, bz - 0.26 - 0.04 * mid],
      [sx * 0.56 * k, by + cy * 0.56 + 0.1, bz - 0.5 - 0.12 * mid],
      [sx * 0.88 * k, by + cy * 0.84 * k + 0.06, bz - 0.68 - 0.3 * mid],
    ];
    const path = catmull(pts);
    const n = i + 1;
    const chain = b.chain(`tail${n}`, path, {
      parent: hips,
      names: [`tail${n}a`, `tail${n}b`, `tail${n}c`],
      role: "tail",
    });
    const tip = TIPS[i % 2];
    const from = path.at(0.66);
    const to = path.at(1);
    const rad = (t: number) => 0.042 + 0.08 * Math.sin(Math.PI * (0.12 + 0.88 * t));
    b.sweep(chain, rad, {
      color: cel(gradient(CREAM, tip[0], from, to), gradient(LAV, TIPS_SHADOW[i % 2], from, to)),
    });
    // golden band at the root
    const band = b.ring(chain.at(0.16), { count: 9, radius: rad(0.16) * 1.1 }).items;
    b.sweep(catmull(band.map((it) => it.at), { closed: true }), 0.011, { color: GOLDC, bone: chain.joints[0] });
    // tip tuft
    const tc = chain.at(0.86);
    b.ring(tc, { count: 5, radius: rad(0.86) * 0.9 }, (it) => {
      const dir = it.outward.clone().multiplyScalar(0.7).addScaledVector(tc.tangent, 0.9);
      blade({
        at: it.at,
        dir,
        len: 0.15,
        w: 0.06,
        color: cel(tip[0]),
        bone: chain.joints[2],
      });
    });
    // spirit flame on the tip
    const tipPt = path.at(1);
    const tan = path.tangentAt(1);
    const up = new THREE.Vector3(0, 1, 0);
    const lat = new THREE.Vector3().crossVectors(tan, up).normalize();
    const mainAxis = tan.clone().multiplyScalar(0.4).add(up).normalize();
    const bj = chain.joints[2];
    flame(tipPt, mainAxis, 0.36, tip[1], bj);
    flame(tipPt.clone().addScaledVector(mainAxis, 0.02), mainAxis, 0.2, tip[2], bj, 1.5);
    flame(tipPt, mainAxis.clone().addScaledVector(lat, 0.8), 0.2, tip[1], bj);
    flame(tipPt, mainAxis.clone().addScaledVector(lat, -0.8), 0.17, tip[1], bj);
  }

  // ---------------------------------------------------------------- shrine plinth
  const oc: Ol = [
    [0, 0],
    [1.5, 0],
    [1.5, 0.07],
    [1.38, 0.085],
    [1.38, B],
    [0, B],
  ];
  b.lathe(oc, { at: [0, 0, -0.15], segments: 8, spin: 22.5, bone: hips, color: STONE });
  glow(
    b.part(new THREE.PlaneGeometry(2.5, 2.5), "#ffffff", {
      texture: circleInlay(),
      at: [0, B + 0.004, -0.15],
      dir: [0, 1, 0],
      axis: "z",
      bone: hips,
    }),
    1,
  );
  const rim: V3[] = [];
  for (let k = 0; k < 20; k++) rim.push([1.24 * Math.sin((k / 20) * 2 * Math.PI), B + 0.008, -0.15 + 1.24 * Math.cos((k / 20) * 2 * Math.PI)]);
  glow(b.sweep(catmull(rim, { closed: true }), 0.011, { color: GOLD, bone: hips, sides: 6 }), 0.9);

  // stone lanterns
  const lantern = (cx: number, cz: number) => {
    let y = B;
    const box = (w: number, h: number, d: number, yy: number, col: any = STONE, x = cx, z = cz) =>
      b.part(new THREE.BoxGeometry(w, h, d), col, { at: [x, yy, z], bone: hips });
    box(0.3, 0.05, 0.3, y + 0.025);
    y += 0.05;
    b.part(new THREE.CylinderGeometry(0.05, 0.062, 0.2, 6), STONE, { at: [cx, y + 0.1, cz], bone: hips, flat: true });
    y += 0.2;
    box(0.27, 0.04, 0.27, y + 0.02);
    y += 0.04;
    for (const sx of [1, -1])
      for (const sz of [1, -1]) box(0.035, 0.13, 0.035, y + 0.065, STONE, cx + sx * 0.07, cz + sz * 0.07);
    glow(b.part(new THREE.BoxGeometry(0.118, 0.11, 0.118), "#ffbf5a", { at: [cx, y + 0.065, cz], bone: hips }), 1.3);
    y += 0.13;
    box(0.27, 0.035, 0.27, y + 0.0175);
    y += 0.035;
    b.part(new THREE.ConeGeometry(0.25, 0.14, 4).rotateY(Math.PI / 4), STONE, {
      at: [cx, y + 0.07, cz],
      bone: hips,
      flat: true,
    });
    y += 0.14;
    b.part(new THREE.SphereGeometry(0.032, 7, 5), GOLD, { at: [cx, y + 0.01, cz], bone: hips, flat: true });
    b.part(new THREE.CylinderGeometry(0.01, 0.02, 0.035, 6), GOLD, { at: [cx, y - 0.005, cz], bone: hips, flat: true });
  };
  lantern(1.0, 0.4);
  lantern(-1.0, 0.4);

  // small stones with moss near the back corners
  for (const [x, z, r] of [
    [-1.05, -1.0, 0.1],
    [1.05, -0.95, 0.12],
    [0.85, 0.95, 0.07],
    [-0.9, 0.95, 0.08],
  ] as const) {
    b.part(new THREE.DodecahedronGeometry(r, 0), STONE, {
      at: [x, B + r * 0.55, z],
      bone: hips,
      scale: [1, 0.7, 1.1],
      flat: true,
      rotation: [0, x * 40, 0],
    });
  }

  // ---------------------------------------------------------------- hitodama (floating spirit fire)
  const HIT: [number, number, number, number][] = [
    [-0.95, 1.25, 0.45, 0.28],
    [0.95, 1.4, 0.35, 0.3],
    [-0.5, 1.75, 0.1, 0.24],
    [0.6, 1.85, -0.15, 0.26],
    [-1.05, 0.65, 0.85, 0.2],
    [0.95, 0.6, 0.9, 0.22],
    [-0.3, 1.95, 0.55, 0.2],
    [0.35, 1.55, 0.95, 0.18],
  ];
  HIT.forEach(([x, y, z, h], i) => {
    const t = TIPS[i % 2];
    const axis = [Math.sin(i * 1.7) * 0.25, 1, Math.cos(i * 1.3) * 0.2];
    flame([x, y, z], axis, h, t[1], hips);
    flame([x, y + 0.02, z], axis, h * 0.55, t[2], hips, 1.5);
  });

  // fallen blossoms
  const petalFrames = [];
  for (let i = 0; i < 26; i++) {
    const a = R() * Math.PI * 2;
    const r = Math.sqrt(R()) * 1.2;
    petalFrames.push(frame([Math.sin(a) * r, B + 0.006, -0.15 + Math.cos(a) * r], [0, 1, 0]));
  }
  b.cards(petalFrames, PETAL, {
    size: 0.07,
    lean: 90,
    flow: (_f: unknown, i: number) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)],
    mirror: true,
    vary: 0.3,
    rng: rng(5),
    bone: hips,
  });

  // keep wood colour constant referenced for a small offering stand
  b.part(new THREE.BoxGeometry(0.22, 0.05, 0.16), WOODC, { at: [-0.5, B + 0.025, 0.75], bone: hips });
  b.part(new THREE.CylinderGeometry(0.05, 0.04, 0.04, 8), GOLD, { at: [-0.5, B + 0.07, 0.75], bone: hips, flat: true });
  glow(b.part(new THREE.SphereGeometry(0.03, 7, 5), "#ff9a3c", { at: [-0.5, B + 0.115, 0.75], bone: hips }), 1.3);

  return b.root;
}
```