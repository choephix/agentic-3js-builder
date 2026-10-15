import * as THREE from "three";
import { createBuilder, rng, polyline, catmull, limb, paint, svg, frame, DEG } from "../../../../src/index";
import { cel, furEdge, animeEye, shadowOf, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Pyro Phoenix",
  description:
    "A cel-shaded flame phoenix with wings fully spread: layered flame feathers, a long fanned tail, gold ornaments, turquoise gems and big anime eyes.",
};

type Outline = Array<[number, number] | [number, number, "sharp"]>;

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// Palette
const RED = "#e5321b";
const ORANGE = "#ff6a1f";
const GOLD_HEX = "#ffc83a";
const TEAL = "#34e0d0";
const TALON_HEX = "#4a1f12";
const EMBER_A = "#ffd24a";
const EMBER_B = "#ff7a2a";

const GOLD = cel(GOLD_HEX);
const REDP = cel("#e8431c");
const BEAK = cel("#ff9b2e");
const BEAK_LOW = cel("#f07a22");
const TALON = cel(TALON_HEX);

const RAMP_PRIM = ["#ff6a1f", "#ffa927", "#ffd84a", "#fff1a8"];
const RAMP_SEC = ["#d9301c", "#ff5a1f", "#ff9a2a", "#ffd04a"];
const RAMP_COV = ["#c42a1a", "#e8431c", "#ff6e23", "#ffa02a"];
const RAMP_COV2 = ["#e8431c", "#ff7a21", "#ffb62e"];
const RAMP_TAIL_A = ["#c8221a", "#ff4d1a", "#ff8a22", "#ffcf4a", "#fff0a0"];
const RAMP_TAIL_B = ["#e8431c", "#ff7a21", "#ffb62e", "#ffe27a"];
const RAMP_CREST = ["#ff5a1f", "#ff9a2a", "#ffd24a", "#fff0a0"];

const LIGHT = new THREE.Vector3(0.35, 0.8, 0.5).normalize();
const paintCache = new Map<string, ReturnType<typeof paint>>();

// Two-tone banded paint along a feather's length with a zig-zag flame boundary.
function featherPaint(ramp: string[], L: number) {
  const key = ramp.join("") + L.toFixed(2);
  let p = paintCache.get(key);
  if (!p) {
    const shade = ramp.map((c) => shadowOf(c));
    p = paint((_p, n, s) => {
      const t = s[0] / L + 0.09 * (zigzag(s[1] / 0.07) - 0.5);
      const i = Math.max(0, Math.min(ramp.length - 1, Math.floor(t * ramp.length)));
      return n.dot(LIGHT) > 0.1 ? ramp[i] : shade[i];
    });
    paintCache.set(key, p);
  }
  return p;
}

// Flame-shaped feather outline: curved centreline, leaf profile, flickering edges, sharp tip.
function ribbon(L: number, W: number, curl: number, phase: number): Outline {
  const N = 10;
  const left: [number, number][] = [];
  const right: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const slope = 2 * curl * t;
    const nl = Math.hypot(slope, 1);
    const nx = -slope / nl;
    const ny = 1 / nl;
    const prof =
      t < 0.35 ? 0.28 + 0.72 * Math.sin(((t / 0.35) * Math.PI) / 2) : Math.pow(1 - (t - 0.35) / 0.65, 0.85);
    const w = W * prof;
    const wl = w * (1 + 0.22 * t * Math.sin(phase + t * 11));
    const wr = w * (1 + 0.22 * t * Math.sin(phase + 2.1 + t * 9));
    const cx = L * t;
    const cy = curl * L * t * t;
    left.push([cx + nx * wl, cy + ny * wl]);
    right.push([cx - nx * wr, cy - ny * wr]);
  }
  const out: Outline = [...left];
  out.push([L, curl * L, "sharp"]);
  for (let i = N - 1; i >= 0; i--) out.push(right[i]);
  return out;
}

// Curl hint for a feather with chord d, rolled about d (0 = vertical plane).
function hintFor(d: THREE.Vector3, rollDeg: number) {
  const up = V(0, 1, 0);
  const a = up.clone().addScaledVector(d, -up.dot(d)).normalize();
  const bb = new THREE.Vector3().crossVectors(d, a).normalize();
  const r = rollDeg * DEG;
  return a.multiplyScalar(Math.cos(r)).addScaledVector(bb, Math.sin(r));
}

const tongueSvg = (c0: string, c1: string, c2: string, inner: string) =>
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="${c0}"/><stop offset="0.55" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
    </linearGradient></defs>
    <path d="M16 63 C3 55 2 40 10 28 C12 22 14 14 16 2 C20 12 26 20 28 32 C31 46 28 57 16 63 Z" fill="url(#g)"/>
    <path d="M16 60 C9 54 9 44 14 36 C15 32 16 28 17 22 C20 30 23 36 23 44 C23 52 20 57 16 60 Z" fill="${inner}"/>
  </svg>`;

const safe = (fn: () => void) => {
  try {
    fn();
  } catch (e) {
    /* decorative extras must never break the model */
  }
};

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  type J = ReturnType<typeof b.joint>;

  // ------------------------------------------------------------------ skeleton
  const hips = b.joint("hips", { at: [0, 0.95, -0.15], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.95, -0.15],
      [0, 1.02, 0.08],
      [0, 1.16, 0.3],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.16, 0.35],
      [0, 1.38, 0.52],
      [0, 1.6, 0.56],
      [0, 1.78, 0.6],
    ]),
    { parent: spine, names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: neck.at(1).at, dir: [0, 0.15, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.75, 0.68], aim: [0, 1.73, 0.84], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.95, -0.35],
      [0, 0.9, -0.75],
      [0, 0.85, -1.1],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // ------------------------------------------------------------------ feather helper
  const feather = (
    bone: J,
    root: THREE.Vector3,
    dir: THREE.Vector3,
    hint: THREE.Vector3,
    L: number,
    W: number,
    curl: number,
    phase: number,
    ramp: string[],
    thick = 0.012,
  ) => {
    const x = dir.clone().normalize();
    let y = hint.clone().addScaledVector(x, -hint.dot(x));
    if (y.lengthSq() < 1e-4) y = V(0, 1, 0).addScaledVector(x, -x.y);
    y.normalize();
    return b.extrude(ribbon(L, W, curl, phase), {
      at: root,
      x,
      y,
      thickness: thick,
      color: featherPaint(ramp, L),
      bone,
    });
  };

  // ------------------------------------------------------------------ textures
  const tongueA = svg(tongueSvg("#d9281a", "#ff7a1f", "#ffd24a", "#ffe27a"), { size: 128 });
  const tongueB = svg(tongueSvg("#ff8a22", "#ffc83a", "#fff0a0", "#fffbe0"), { size: 128 });
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="29" fill="#7a1710" stroke="#ffc83a" stroke-width="5"/>
      <circle cx="32" cy="32" r="22" fill="none" stroke="#ffe27a" stroke-width="2"/>
      <path d="M32 12 C38 22 46 28 44 40 C43 48 38 52 32 52 C26 52 21 48 20 40 C19 34 23 31 26 26 C27 30 29 31 30 31 C29 24 30 18 32 12Z" fill="#ff8a22"/>
      <path d="M32 30 C36 35 39 38 38 43 C37 47 35 49 32 49 C29 49 27 47 27 43 C27 39 30 36 32 30Z" fill="#ffe27a"/>
    </svg>`,
    { size: 256 },
  );

  // ------------------------------------------------------------------ torso, neck, tail
  const BODY_PAINT = cel(
    furEdge(RED, GOLD_HEX, { axis: [0, 1, 0], level: -0.1, teeth: 0.35, period: 0.04, along: [0, 0, 1] }),
  );
  const torso = b.sweep(
    spine,
    (t) => [0.27 + 0.03 * Math.sin(Math.PI * t), 0.25 + 0.03 * Math.sin(Math.PI * t)],
    { color: BODY_PAINT, caps: "round", extend: [0.12, 0.1], shift: [0, -0.02] },
  );
  const NECK_PAINT = cel(
    furEdge(GOLD_HEX, RED, { axis: [0, 0.25, 1], level: 0.15, teeth: 0.3, period: 0.03, along: [1, 0, 0] }),
  );
  const neckSweep = b.sweep(neck, [0.115, 0.095, 0.085], { color: NECK_PAINT, caps: "round" });
  const tailSweep = b.sweep(tail, [0.16, 0.06], { color: REDP, caps: "round" });

  // ------------------------------------------------------------------ head
  const HC = V(0, 1.84, 0.64);
  const HEAD_PAINT = cel(
    furEdge(GOLD_HEX, ORANGE, { axis: [0, -0.1, 1], level: 0.1, teeth: 0.35, period: 0.035, along: [1, 0, 0] }),
  );
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), HEAD_PAINT, {
    bone: head,
    at: HC,
    scale: [0.15, 0.14, 0.17],
  });
  const skullSkin = b.surface(skull);

  // beak: upper on the head, lower on the jaw
  b.sweep(
    [
      [0, 1.8, 0.74],
      [0, 1.79, 0.86],
      [0, 1.76, 0.95],
      [0, 1.7, 0.99],
    ],
    (t) => [0.05 * (1 - t * 0.85) + 0.004, 0.052 * (1 - t * 0.75) + 0.004],
    { color: BEAK, bone: head, caps: "point", sides: 6 },
  );
  b.sweep(
    [
      [0, 1.75, 0.72],
      [0, 1.74, 0.83],
      [0, 1.73, 0.92],
      [0, 1.715, 0.95],
    ],
    (t) => [0.042 * (1 - t * 0.8) + 0.004, 0.032 * (1 - t * 0.7) + 0.004],
    { color: BEAK_LOW, bone: jaw, caps: "point", sides: 6 },
  );

  // anime eyes
  safe(() => {
    const EYE = animeEye({ iris: "#2fd6c8", irisLight: "#b8fff0", irisDark: "#127a8a", blush: false });
    for (const s of [1, -1]) {
      const hit = skullSkin.around(HC).at(s * 48, 4);
      if (hit) b.decal(skullSkin, EYE, { at: hit, size: [0.075, 0.103], mirror: s > 0 });
    }
  });

  // tiara with gem
  const tiara: Outline = [
    [0, -0.05],
    [0.04, -0.01],
    [0.05, 0.04],
    [0.02, 0.03],
    [0, 0.09, "sharp"],
    [-0.02, 0.03],
    [-0.05, 0.04],
    [-0.04, -0.01],
  ];
  b.extrude(tiara, {
    at: [0, HC.y + 0.06, HC.z + 0.15],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.02,
    color: GOLD,
    bone: head,
  });
  safe(() => {
    glow(
      b.part(new THREE.OctahedronGeometry(0.022, 0), TEAL, {
        bone: head,
        at: [0, HC.y + 0.055, HC.z + 0.17],
        scale: [1, 1.4, 1],
      }),
      1.2,
    );
  });

  // crest plumes
  for (let j = -2; j <= 2; j++) {
    const aj = Math.abs(j);
    const root = V(HC.x + j * 0.035, HC.y + 0.11, HC.z - 0.03);
    const d = V(j * 0.25, 0.6, -0.8).normalize();
    feather(head, root, d, hintFor(d, j * 25), 0.9 - 0.18 * aj, 0.07, -0.35, j * 1.1 + 3, RAMP_CREST, 0.014);
  }

  // ------------------------------------------------------------------ wings
  const wingFlameCards: Array<() => void> = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const sh = V(s * 0.2, 1.2, 0.1);
    const el = V(s * 0.9, 1.38, -0.05);
    const wr = V(s * 1.55, 1.5, 0.12);
    const arm = b.chain(`wing${S}`, polyline([sh, el, wr]), {
      parent: spine.joints[1],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "wing",
    });
    const armSweep = b.sweep(arm, [0.065, 0.045], { color: GOLD, caps: "round" });

    const l1 = el.distanceTo(sh);
    const l2 = wr.distanceTo(el);
    const armAt = (u: number) => {
      const dd = u * (l1 + l2);
      return dd <= l1 ? sh.clone().lerp(el, dd / l1) : el.clone().lerp(wr, (dd - l1) / l2);
    };
    const armBone = (u: number): J => (u * (l1 + l2) <= l1 ? arm.joints[0] : arm.joints[1]);
    const trailDir = (u: number) => {
      const ang = (-10 + 40 * u) * DEG;
      return V(s * Math.sin(ang), -0.07, -Math.cos(ang)).normalize();
    };
    const outHint = V(s, 0, 0);

    // secondaries
    for (let i = 0; i < 11; i++) {
      const u = 0.12 + (0.88 * i) / 10;
      const root = armAt(u);
      root.y += -0.085 - 0.0045 * i;
      root.z -= 0.03;
      feather(armBone(u), root, trailDir(u), outHint, 0.58 + 0.42 * u, 0.15, 0.1, i * 0.9, RAMP_SEC);
    }
    // wing coverts, row 1
    for (let i = 0; i < 12; i++) {
      const u = 0.08 + (0.9 * i) / 11;
      const root = armAt(u);
      root.y += -0.02 - 0.0035 * i;
      root.z += 0.02;
      feather(armBone(u), root, trailDir(u), outHint, 0.38 + 0.2 * u, 0.1, 0.08, i * 1.3 + 1, RAMP_COV, 0.011);
    }
    // wing coverts, row 2 (lesser)
    for (let i = 0; i < 10; i++) {
      const u = 0.1 + (0.9 * i) / 9;
      const root = armAt(u);
      root.y += -0.012 - 0.003 * i;
      root.z += 0.06;
      feather(armBone(u), root, trailDir(u), outHint, 0.22 + 0.08 * u, 0.065, 0.06, i * 0.7 + 2, RAMP_COV2, 0.01);
    }
    // primaries (each on its own joint) and primary coverts
    const PL = [0.95, 1.15, 1.28, 1.32, 1.22, 1.05, 0.85];
    for (let k = 0; k < 7; k++) {
      const a = (-16 + 13 * k) * DEG;
      const d = V(s * Math.cos(a), 0.1 - 0.012 * k, -Math.sin(a)).normalize();
      const root = wr.clone().add(V(0, -0.035 - 0.007 * k, 0));
      const pj = b.joint(`primary${k + 1}${S}`, { parent: arm.joints[2], at: root, dir: d, role: "digit" });
      const L = PL[k] * 0.92;
      feather(pj, root, d, V(0, 0, -1), L, 0.17, 0.14, k * 1.3 + s, RAMP_PRIM);
      const rootC = wr.clone().add(V(0, -0.025 - 0.007 * k, 0.02));
      feather(pj, rootC, d, V(0, 0, -1), 0.5, 0.12, 0.1, k * 0.8 + 4, RAMP_COV, 0.012);
      // flame lick at each primary tip
      const tip = root.clone().addScaledVector(d, L * 0.95);
      wingFlameCards.push(() => {
        glow(
          b.cards([frame(tip, [d.x, d.y + 0.3, d.z])], tongueB, { size: [0.1, 0.26], bend: 20, bone: pj, flow: [0, 0, -1] }),
          0.85,
        );
      });
    }

    // gold bracelets and flame licks along the arm
    safe(() => {
      const skin = b.surface(armSweep);
      for (const at of [0.82, 0.45]) {
        const loop = skin.loop(arm.at(at), { lift: 0.01 });
        b.sweep(loop, 0.022, { color: GOLD });
      }
    });
    safe(() => {
      const hits = b.surface(armSweep).scatter(10, { rng: rng(40 + (s > 0 ? 1 : 2)), minDist: 0.1 });
      glow(b.cards(hits, tongueB, { size: [0.06, 0.14], lean: 70, bend: 20, flow: [0, 0, -1] }), 0.85);
    });
  }
  for (const f of wingFlameCards) safe(f);

  // ------------------------------------------------------------------ tail fan
  {
    const tailEnd = V(0, 0.85, -1.1);
    const tailMid = V(0, 0.9, -0.75);
    for (let i = 0; i < 10; i++) {
      const k = i - 4.5;
      const ak = Math.abs(k);
      const phi = k * 13 * DEG;
      const d = V(Math.sin(phi) * 0.95, -0.05, -Math.cos(phi)).normalize();
      const L = (2.5 - 0.3 * Math.pow(ak, 1.15)) * 0.85;
      const root = tailMid.clone().lerp(tailEnd, 1 - ak / 6).add(V(k * 0.02, 0, 0));
      const fj = b.joint(`tailFan${i + 1}`, { parent: tail.joints[2], at: root, dir: d, role: "fan" });
      feather(
        fj,
        root,
        d,
        hintFor(d, k * 16),
        L,
        0.2 - 0.012 * ak,
        0.2,
        i * 1.7,
        i % 2 ? RAMP_TAIL_B : RAMP_TAIL_A,
        0.014,
      );
    }
  }
  safe(() => {
    const loop = b.surface(tailSweep).loop(tail.joints[1], { lift: 0.01 });
    b.sweep(loop, 0.02, { color: GOLD });
  });

  // ------------------------------------------------------------------ legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hipP = V(s * 0.17, 0.82, -0.1);
    const foot = V(s * 0.2, 0.06, 0.14);
    const pts = limb(hipP, foot, [0.32, 0.32, 0.26], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`],
      role: "leg",
    });
    b.sweep(leg, [0.085, 0.06, 0.04, 0.032], {
      bands: [
        [0.33, REDP],
        [1, GOLD],
      ],
      caps: "round",
    });
    // gold anklet
    safe(() => {
      const a = pts[2].clone().lerp(pts[3], 0.3);
      const dd = pts[3].clone().sub(pts[2]);
      b.part(new THREE.CylinderGeometry(0.047, 0.047, 0.035, 8), GOLD, { bone: leg.joints[2], at: a, dir: dd });
    });
    // toes
    const A = pts[3].clone();
    const toeAngles = [-28, 0, 28, 180];
    toeAngles.forEach((deg, j) => {
      const ang = deg * DEG;
      const dir = V(Math.sin(ang), 0, Math.cos(ang));
      const L = deg === 180 ? 0.13 : 0.21;
      const mid = A.clone().addScaledVector(dir, L * 0.45);
      mid.y = 0.036;
      const tip = A.clone().addScaledVector(dir, L);
      tip.y = 0.027;
      const toe = b.chain(`toe${S}${j}`, polyline([A, mid, tip]), {
        parent: leg.joints[3],
        names: [`toe${S}${j}a`, `toe${S}${j}b`],
        role: "digit",
      });
      b.sweep(toe, [0.03, 0.022], { color: GOLD, caps: "round" });
      b.spike(tip, V(dir.x, -0.45, dir.z).normalize(), 0.075, 0.022, { color: TALON, bone: toe.joints[1] });
    });
  }

  // ------------------------------------------------------------------ flame plumage (cards) and ornaments
  const torsoSkin = b.surface(torso);
  safe(() => {
    const hits = torsoSkin.scatter(90, {
      rng: rng(5),
      minDist: 0.07,
      filter: (h) => h.n.y > -0.3 && !(h.n.z > 0.6 && h.at.y > 0.95 && h.at.y < 1.35 && Math.abs(h.at.x) < 0.2),
    });
    glow(
      b.cards(hits, [tongueA, tongueB], { size: [0.09, 0.17], lean: 65, bend: 25, vary: 0.3, rng: rng(6) }),
      0.85,
    );
  });
  safe(() => {
    const hits = b.surface(neckSweep).scatter(36, { rng: rng(8), minDist: 0.05, filter: (h) => h.n.y > -0.2 });
    glow(
      b.cards(hits, [tongueA, tongueB], { size: [0.07, 0.15], lean: 60, bend: 25, vary: 0.3, rng: rng(9) }),
      0.85,
    );
  });
  safe(() => {
    const hits = skullSkin.scatter(16, {
      rng: rng(10),
      minDist: 0.05,
      filter: (h) => h.n.z < 0.25 && h.n.y > -0.3,
    });
    glow(b.cards(hits, tongueA, { size: [0.05, 0.1], lean: 70, bend: 20, vary: 0.3, rng: rng(11) }), 0.85);
  });
  safe(() => {
    const hits = b.surface(tailSweep).scatter(14, { rng: rng(12), minDist: 0.07 });
    glow(b.cards(hits, [tongueA, tongueB], { size: [0.08, 0.2], lean: 70, bend: 25, rng: rng(13) }), 0.85);
  });

  // chest emblem
  safe(() => {
    const hit = torsoSkin.ray([0, 1.15, 2], [0, -0.15, -1]);
    if (hit) b.decal(torsoSkin, EMBLEM, { at: hit, size: [0.17, 0.17] });
  });

  // gold collar with gems
  safe(() => {
    const skin = b.surface(neckSweep);
    const loop = skin.loop(neck.joints[1], { lift: 0.012 });
    b.sweep(loop, 0.022, { color: GOLD });
    b.along(loop, 6, (at) => {
      const hit = skin.nearest(at.at);
      glow(b.stick(new THREE.OctahedronGeometry(0.032, 0), TEAL, hit, { embed: 0.3 }), 1);
    });
  });

  // ------------------------------------------------------------------ embers
  safe(() => {
    const r = rng(21);
    for (let i = 0; i < 16; i++) {
      const ang = r() * Math.PI * 2;
      const rad = 0.5 + r() * 1.8;
      const at: [number, number, number] = [Math.cos(ang) * rad, 1.95 + r() * 1.3, Math.sin(ang) * rad - 0.3];
      const sc = 0.6 + r() * 1.0;
      glow(
        b.part(new THREE.OctahedronGeometry(0.04, 0), i % 2 ? EMBER_A : EMBER_B, {
          bone: hips,
          at,
          scale: sc,
          rotation: [r() * 180, r() * 180, 0],
        }),
        1.2,
      );
    }
  });

  return b.root;
}
