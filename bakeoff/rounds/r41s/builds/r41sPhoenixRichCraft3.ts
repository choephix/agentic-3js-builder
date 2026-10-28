import * as THREE from "three";
import {
  createBuilder,
  frame,
  limb,
  bezier,
  catmull,
  polyline,
  rng,
  mix,
  paint,
  scales,
  countershade,
  svg,
} from "../../../../src/index";
import { cel, animeEye, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Phoenix",
  description: "Cel-shaded flame phoenix with wings spread, layered ember plumage and glowing flames.",
};

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const DEG = Math.PI / 180;

const GOLD = "#ffe27a";
const AMBER = "#ff9a2e";
const RED = "#e0302a";
const CRIM = "#8f1530";

// Feather paints: root-to-tip gradients through the flame palette, cel shaded.
const ramp = (c0: string, c1: string, c2: string) =>
  cel(
    paint((_p, _n, s) => (s[0] < 0.5 ? mix(c0, c1, s[0] * 2) : mix(c1, c2, (s[0] - 0.5) * 2))),
  );
const PA = ramp(GOLD, AMBER, RED);
const PB = ramp("#ffc23c", RED, CRIM);
const PC = ramp("#fff0a0", GOLD, AMBER);
const BODY = cel(
  countershade(
    scales(["#ff9a2e", "#ff7a26", "#ffb23a"], "#a82a1a", { size: 0.07, width: 0.14, seed: 3 }),
    scales(["#ffe08a", "#ffd264", "#ffc84a"], "#d8902a", { size: 0.07, width: 0.14, seed: 4 }),
    { level: -0.3 },
  ),
);
const ARM = cel("#d8402a");
const LEG = cel("#eaa828");

const FLAME = svg(
  `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 94 C6 80 6 52 24 34 C24 48 32 50 34 38 C38 24 30 14 36 2 C52 24 62 50 58 70 C54 86 44 92 32 94Z" fill="#e8301c"/>
  <g transform="translate(32 94) scale(.7) translate(-32 -94)"><path d="M32 94 C6 80 6 52 24 34 C24 48 32 50 34 38 C38 24 30 14 36 2 C52 24 62 50 58 70 C54 86 44 92 32 94Z" fill="#ff8a1f"/></g>
  <g transform="translate(32 94) scale(.4) translate(-32 -94)"><path d="M32 94 C6 80 6 52 24 34 C24 48 32 50 34 38 C38 24 30 14 36 2 C52 24 62 50 58 70 C54 86 44 92 32 94Z" fill="#ffe27a"/></g>
</svg>`,
  { size: 128 },
);
const EMB = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="45" fill="#7a1420"/>
  <circle cx="50" cy="50" r="45" fill="none" stroke="#ffd24a" stroke-width="6"/>
  <circle cx="50" cy="50" r="35" fill="none" stroke="#ffb030" stroke-width="2"/>
  <path d="M50 86 C24 74 24 50 38 36 C38 48 46 50 48 40 C50 30 44 22 52 12 C70 32 78 54 72 70 C68 80 60 84 50 86Z" fill="#ff7a1f" stroke="#ffe27a" stroke-width="3"/>
  <path d="M50 78 C38 70 40 56 48 50 C50 58 56 58 58 50 C64 60 62 72 50 78Z" fill="#ffe27a"/>
</svg>`,
  { size: 192 },
);
const EYE = animeEye({ iris: "#ff8a1c", blush: "#ff9a5a" });

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const R = rng(11);
  const flames: THREE.Vector3[] = [];

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.82, -0.3] });
  const spine = b.chain("spine", catmull([v(0, 0.82, -0.3), v(0, 0.95, 0.0), v(0, 1.12, 0.25)]), {
    parent: hips,
    count: 3,
    role: "spine",
  });
  const neck = b.chain("neck", catmull([v(0, 1.12, 0.25), v(0, 1.36, 0.36), v(0, 1.6, 0.45)]), {
    parent: spine.joints[spine.joints.length - 1],
    count: 3,
    role: "neck",
  });
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 1.6, 0.45],
    dir: [0, 0.2, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.66, 0.58], aim: [0, 1.65, 0.72], role: "jaw" });
  const tail = b.chain("tail", catmull([v(0, 0.8, -0.3), v(0, 0.65, -0.75), v(0, 0.45, -1.15)]), {
    parent: hips,
    count: 2,
    role: "tail",
  });

  // ---------- body ----------
  const body = b.sweep(
    spine,
    (t) => {
      const k = Math.sin(Math.PI * (0.08 + 0.84 * t));
      return [0.11 + 0.17 * k, 0.12 + 0.17 * k];
    },
    { color: BODY },
  );
  b.sweep(neck, [0.12, 0.08], { color: BODY });
  b.sweep(tail, [0.12, 0.04], { color: BODY });

  function feather(
    root: THREE.Vector3,
    tip: THREE.Vector3,
    bone: any,
    w: number,
    pal: any,
    lift = 0.08,
    up: [number, number, number] = [0, 1, 0],
  ) {
    const mid = root.clone().lerp(tip, 0.5);
    mid.y += lift;
    return b.sweep(bezier(root, mid, tip), (t) => [w * Math.sin(Math.PI * (0.12 + 0.88 * t)), 0.005], {
      bone,
      color: pal,
      section: "box",
      caps: "flat",
      up,
    });
  }

  // chest emblem
  const hit = b.surface(body).ray([0, 1.0, 1.5], [0, 0, -1]);
  if (hit) {
    glow(b.decal(body, EMB, { at: hit, dir: [0, 0.3, 1], size: [0.17, 0.17] }), 1.2);
  }

  // chest plumes
  for (let i = -3; i <= 3; i++) {
    feather(
      v(i * 0.05, 1.3, 0.45),
      v(i * 0.1, 0.95, 0.5),
      spine.joints[spine.joints.length - 1],
      0.045,
      i % 2 ? PC : PA,
      0.04,
      [0, 0, 1],
    );
  }

  // ---------- head ----------
  const C = v(0, 1.7, 0.52);
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), BODY, {
    bone: head,
    at: C,
    scale: [0.14, 0.13, 0.15],
  });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const h = skin.around(C).at(s * 42, 3);
    if (h) b.decal(skin, EYE, { at: h, size: [0.07, 0.096], mirror: s > 0 });
  }
  b.part(new THREE.ConeGeometry(0.05, 0.2, 6), "#ffcf4a", {
    bone: head,
    at: [0, 1.69, 0.7],
    dir: [0, -0.15, 1],
    scale: [1, 1, 0.7],
  });
  b.part(new THREE.ConeGeometry(0.036, 0.14, 6), "#f0a02c", {
    bone: jaw,
    at: [0, 1.65, 0.66],
    dir: [0, -0.1, 1],
    scale: [1, 1, 0.7],
  });
  // crest
  for (let i = -2; i <= 2; i++) {
    const a = Math.abs(i);
    feather(
      v(i * 0.025, 1.82, 0.5),
      v(i * 0.1, 2.0 + 0.06 * (2 - a), 0.15),
      head,
      0.04,
      a % 2 ? PA : PB,
      0.12,
      [0, 0, 1],
    );
    if (i === 0) flames.push(v(0, 2.12, 0.15));
  }
  // cheek tufts
  for (const s of [1, -1])
    for (let j = 0; j < 3; j++)
      feather(
        v(s * 0.12, 1.68, 0.45),
        v(s * (0.3 + 0.05 * j), 1.62 - 0.05 * j, 0.22 - 0.04 * j),
        head,
        0.035,
        j % 2 ? PB : PC,
        0.03,
      );

  // ---------- wings ----------
  for (const s of [1, -1]) {
    const N = s > 0 ? "L" : "R";
    const sh = v(s * 0.22, 1.2, 0.12);
    const el = v(s * 0.8, 1.45, 0.0);
    const wr = v(s * 1.3, 1.55, -0.1);
    const pts = [sh, el, wr];
    const arm = b.chain(`arm${N}`, polyline(pts), {
      parent: spine.joints[1],
      names: [`shoulder${N}`, `elbow${N}`, `wrist${N}`],
      role: "wing",
    });
    b.sweep(arm, [0.085, 0.045], { color: ARM });
    const path = polyline(pts);
    const boneAt = (t: number) => (t < 0.35 ? arm.joints[0] : t < 0.8 ? arm.joints[1] : arm.joints[2]);
    // secondaries
    for (let i = 0; i < 10; i++) {
      const t = 0.08 + i * 0.095;
      const r = path.at(t).clone();
      r.y += (i % 2) * 0.012;
      const tip = r.clone().add(v(s * (0.05 + 0.15 * t), -0.12, -(0.8 + 0.15 * Math.sin(Math.PI * t))));
      feather(r, tip, boneAt(t), 0.085, i % 2 ? PB : PA, 0.08);
    }
    // primaries
    for (let k = 0; k < 10; k++) {
      const th = (-20 + k * 10.5) * DEG;
      const len = 1.0 - 0.045 * k;
      const dir = v(s * Math.cos(th), 0, -Math.sin(th));
      const root = wr.clone();
      root.y += 0.005 * (k % 2);
      const tip = root.clone().addScaledVector(dir, len);
      tip.y -= 0.1 + 0.02 * k;
      feather(root, tip, arm.joints[2], 0.075, k % 2 ? PA : PB, 0.1);
      if (k % 3 === 0) flames.push(tip.clone().add(v(0, 0.02, 0)));
    }
    // coverts
    for (let i = 0; i < 9; i++) {
      const t = 0.08 + 0.1 * i;
      const r = path.at(t).clone();
      r.y += 0.03;
      feather(r, r.clone().add(v(s * 0.05, -0.03, -0.45)), boneAt(t), 0.065, PC, 0.05);
    }
    for (let k = 0; k < 7; k++) {
      const th = (-10 + k * 12) * DEG;
      const root = wr.clone();
      root.y += 0.035;
      const tip = root.clone().add(v(s * Math.cos(th) * 0.5, -0.04, -Math.sin(th) * 0.5));
      feather(root, tip, arm.joints[2], 0.06, PC, 0.05);
    }
  }

  // ---------- tail ----------
  for (let i = 0; i < 9; i++) {
    const a = (i - 4) * 0.15;
    const d = Math.abs(i - 4);
    const L = 1.5 - 0.12 * d;
    const root = v(0, 0.72, -0.5);
    const tip = v(Math.sin(a) * L * 0.9, 0.1 + 0.08 * d, -0.5 - Math.cos(a) * L);
    feather(root, tip, tail.joints[0], 0.075, i % 2 ? PB : PA, 0.22);
    if (i % 2 === 0) flames.push(tip.clone().add(v(0, 0.02, 0)));
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const N = s > 0 ? "L" : "R";
    const hip = v(s * 0.14, 0.7, -0.05);
    const pts = limb(
      hip,
      [s * 0.15, 0.03, 0.12],
      [0.26, 0.3, 0.22],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const leg = b.chain(`leg${N}`, pts, {
      names: [`hip${N}`, `knee${N}`, `ankle${N}`, `foot${N}`],
      parent: hips,
      role: "leg",
    });
    b.sweep(leg, [0.06, 0.03], { color: LEG });
    b.part(new THREE.SphereGeometry(1, 8, 6), BODY, {
      bone: leg.joints[0],
      at: [s * 0.15, 0.68, -0.05],
      scale: [0.1, 0.17, 0.13],
    });
    const foot = pts[3];
    const fj = leg.joints[leg.joints.length - 1];
    for (const ang of [-0.5, 0, 0.5, Math.PI]) {
      const len = ang === Math.PI ? 0.12 : 0.18;
      const dx = Math.sin(ang) * len;
      const dz = Math.cos(ang) * len;
      const tip = v(foot.x + dx, 0.03, foot.z + dz);
      b.capsule(foot, tip, [0.03, 0.016], { bone: fj, color: LEG });
      b.spike(tip, [dx, -0.02, dz], 0.07, 0.015, { bone: fj, color: "#3a2a22" });
    }
  }

  // ---------- flames ----------
  const cards = b.cards(
    flames.map((p) => frame(p, [0, 1, 0])),
    FLAME,
    { size: [0.14, 0.26], cross: true, flow: [0, 0, -1], vary: 0.3, rng: R },
  );
  glow(cards, 1.3);

  return b.root;
}
