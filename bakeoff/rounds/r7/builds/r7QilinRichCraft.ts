import * as THREE from "three";
import {
  bezier,
  catmull,
  countershade,
  createBuilder,
  frame,
  gradient,
  limb,
  mottle,
  paint,
  rng,
  scales,
  spiral,
  svg,
} from "../../../../src/index";
import type { Builder, OutlinePoint } from "../../../../src/index";
import { animeEye, cel, INK, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Qilin",
  description:
    "High-fantasy anime qilin: jade-scaled hooved chimera with golden antlers, a drifting cloud mane, flame fetlocks and a rune-lit dais.",
};

// ---------------------------------------------------------------------------------------------------------------
// Constants and small helpers
const G = 0.1; // height of the dais top: the creature stands on it
const P = (x: number, y: number, z: number): [number, number, number] => [x, y + G, z];
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);

// ---------------------------------------------------------------------------------------------------------------
// Palette (toon cel paints)
const GOLD = cel("#f8c845", "#c47a1e");
const GOLD_DARK = cel("#d09530", "#82480f");
const CREAM_C = cel("#fff3d6", "#f1c9a0");
const WHITE_C = cel("#ffffff", "#c2d6f6");
const CYAN_C = cel("#c4efff", "#82b4ec");
const PINK_C = cel("#ffd5e8", "#e89cc6");
const HOOF = cel("#3a2c55", "#1e1636");
const STONE = cel(mottle("#a3abc6", "#8089a8", { size: 0.16, seed: 2 }), "#59607f");
const STONE_D = cel("#747d9c", "#4c5372");
const TOOTH = "#fff7e6";
const MOUTH = "#5b1730";
const RUBY = "#ff4a3a";
const FIRE = ["#d8321f", "#ff8a24", "#ffe070"];

const BACK = cel(
  scales(["#2cc0aa", "#26ad9f", "#35cfb3", "#1f9c98"], "#0c5663", { size: 0.055, width: 0.17, seed: 3 }),
);
const BELLYS = cel(scales(["#fff0cb", "#ffe5b0", "#fbeacb"], "#d9a35e", { size: 0.05, width: 0.15, seed: 4 }));
const COAT = countershade(BACK, BELLYS, { level: -0.2, soft: 0.22 });
const SOCK = cel(scales(["#f8c845", "#eab238"], "#a8641a", { size: 0.04, width: 0.16, seed: 7 }));
const LEG = paint((p) => (p.y - G < 0.3 + 0.05 * zigzag((p.x + p.z) / 0.045) ? SOCK : COAT));
const HEADC = countershade(
  cel(scales(["#2cc0aa", "#27b2a2", "#36d0b6"], "#0c5663", { size: 0.034, width: 0.18, seed: 5 })),
  cel(scales(["#fff0cb", "#ffe5b0"], "#d9a35e", { size: 0.034, width: 0.15, seed: 6 })),
  { level: -0.45, soft: 0.2 },
);

type Pal = ReturnType<typeof cel>[];
const MANE_PAL: Pal = [cel("#7f9cff", "#5a63d6"), cel("#b9ecff", "#7fb5ee"), cel("#ffffff", "#cfe0fb")];
const TAIL_PAL: Pal = [cel("#22a899", "#17766f"), cel("#8ee8d8", "#4fb5b5"), cel("#ffffff", "#c7e6f6")];
const GOLD_PAL: Pal = [cel("#e8a73c", "#b8701c"), cel("#ffd98a", "#e9a85b"), cel("#fff6dc", "#f2d5a2")];
const EAR_PAL: Pal = [cel("#1fa597", "#157a77"), cel("#ffb6d2", "#e585ad"), cel("#ffe3ee", "#f2b3cf")];

// ---------------------------------------------------------------------------------------------------------------
// Textures
const EYE = animeEye({ iris: "#ffbf2e" });

const CLOUD = svg(
  `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="c" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8fc4ff"/><stop offset=".5" stop-color="#d9f1ff"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
  <path d="M32 95 C12 84 5 66 14 52 C3 44 8 24 24 25 C26 10 46 4 52 18 C63 24 62 42 50 48 C60 62 52 84 32 95Z" fill="url(#c)" stroke="#5b86d6" stroke-width="3" stroke-linejoin="round"/>
  <path d="M32 72 C20 72 20 54 33 54 C42 54 42 65 34 65" fill="none" stroke="#ff9ec4" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M30 42 C24 42 24 31 31 31" fill="none" stroke="#8fb4f2" stroke-width="2.8" stroke-linecap="round"/>
  <path d="M46 30 C50 32 50 38 46 40" fill="none" stroke="#8fb4f2" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);

const SEAL = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="47" fill="#f8c845" stroke="#7a4a12" stroke-width="3"/>
  <circle cx="50" cy="50" r="38" fill="#168a84" stroke="#7a4a12" stroke-width="2.5"/>
  <path d="M50 14 A36 36 0 0 1 50 86 A18 18 0 0 1 50 50 A18 18 0 0 0 50 14Z" fill="#fff2c0"/>
  <circle cx="50" cy="32" r="5" fill="#168a84"/><circle cx="50" cy="68" r="5" fill="#fff2c0"/>
  <circle cx="50" cy="68" r="2" fill="#ff4a3a"/>
  <g fill="#7a4a12">${[0, 45, 90, 135, 180, 225, 270, 315]
    .map((a) => `<circle cx="${(50 + 43 * Math.sin((a * Math.PI) / 180)).toFixed(1)}" cy="${(50 - 43 * Math.cos((a * Math.PI) / 180)).toFixed(1)}" r="1.8"/>`)
    .join("")}</g>
  </svg>`,
  { size: 256 },
);

const floorSvg = () => {
  let s = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="g" cx=".5" cy=".5" r=".5"><stop offset=".55" stop-color="#8d96b8"/><stop offset="1" stop-color="#6a7296"/></radialGradient></defs>
  <circle cx="100" cy="100" r="100" fill="url(#g)"/>
  <circle cx="100" cy="100" r="97" fill="none" stroke="#e0bb5e" stroke-width="2.4"/>
  <circle cx="100" cy="100" r="62" fill="none" stroke="#e0bb5e" stroke-width="1.6"/>
  <circle cx="100" cy="100" r="40" fill="none" stroke="#c9a14a" stroke-width="1.6"/>`;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    s += `<circle cx="${(100 + 79 * Math.cos(a)).toFixed(1)}" cy="${(100 + 79 * Math.sin(a)).toFixed(1)}" r="8" fill="#7c86aa" stroke="#e0bb5e" stroke-width="1.6"/>`;
    s += `<circle cx="${(100 + 79 * Math.cos(a)).toFixed(1)}" cy="${(100 + 79 * Math.sin(a)).toFixed(1)}" r="3" fill="#e0bb5e"/>`;
  }
  for (let i = 0; i < 8; i++)
    s += `<ellipse cx="100" cy="72" rx="9" ry="26" fill="#7c86aa" stroke="#c9a14a" stroke-width="1.4" transform="rotate(${i * 45} 100 100)"/>`;
  s += `<circle cx="100" cy="100" r="18" fill="#c9a14a"/><path d="M100 84 A16 16 0 0 1 100 116 A8 8 0 0 1 100 100 A8 8 0 0 0 100 84Z" fill="#fff2c0"/></svg>`;
  return s;
};
const FLOOR = svg(floorSvg(), { size: 512 });

const runeSvg = () => {
  const r = rng(99);
  let s = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="93" fill="none" stroke="#5cf2dc" stroke-width="2.6"/>
  <circle cx="100" cy="100" r="66" fill="none" stroke="#5cf2dc" stroke-width="2.6"/>`;
  for (let i = 0; i < 24; i++) {
    let d = "";
    for (let k = 0; k < 3; k++) {
      const x1 = -5 + r() * 10;
      const y1 = r() * 20;
      const x2 = -5 + r() * 10;
      const y2 = r() * 20;
      d += `M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} `;
    }
    s += `<g transform="rotate(${i * 15} 100 100) translate(100 10)"><path d="${d}" stroke="#5cf2dc" stroke-width="3.2" stroke-linecap="round" fill="none"/><path d="M0 0 L0 24" stroke="#5cf2dc" stroke-width="2" opacity=".6"/></g>`;
  }
  return s + `</svg>`;
};
const RUNES = svg(runeSvg(), { size: 512 });

const SPARK = svg(
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 1 L19 13 L31 16 L19 19 L16 31 L13 19 L1 16 L13 13Z" fill="#fff7c2"/></svg>`,
  { size: 64 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b: Builder = createBuilder({ name: "qilin", paintSize: 2048 });
  const R = rng(7);
  const safe = (fn: () => void) => {
    try {
      fn();
    } catch {
      /* decoration only */
    }
  };

  // ---- shape helpers ---------------------------------------------------------------------------------------
  const bladeOutline = (len: number, wid: number): OutlinePoint[] => [
    [0, 0],
    [0.3 * len, wid],
    [0.75 * len, wid * 0.6],
    [len, 0, "sharp"],
    [0.75 * len, -wid * 0.6],
    [0.3 * len, -wid],
  ];
  const flameOutline = (len: number, wid: number): OutlinePoint[] => [
    [0, 0],
    [0.2 * len, wid],
    [0.5 * len, wid * 0.76],
    [0.75 * len, wid * 0.4],
    [len, 0, "sharp"],
    [0.7 * len, -wid * 0.2],
    [0.4 * len, -wid * 0.6],
    [0.15 * len, -wid * 0.9],
  ];
  const bladeFill = (pal: Pal, len: number) =>
    paint((_p, _n, s) => {
      const t = s[0] / len;
      return t < 0.4 ? pal[0] : t < 0.75 ? pal[1] : pal[2];
    });

  // A flat leaf: grows along dir, broad face toward `face`.
  function blade(
    at: THREE.Vector3,
    dir: THREE.Vector3,
    face: THREE.Vector3,
    len: number,
    wid: number,
    color: any,
    bone: any,
    thick = 0.014,
    outline: OutlinePoint[] | null = null,
  ) {
    const d = dir.clone().normalize();
    const w = face.clone().cross(d).normalize();
    return b.extrude(outline ?? bladeOutline(len, wid), {
      at,
      x: d,
      y: w,
      thickness: thick,
      smoothing: 1,
      color,
      bone,
    });
  }

  // A fan of overlapping blades in one plane.
  function fan(
    root: THREE.Vector3,
    dir: THREE.Vector3,
    side: THREE.Vector3,
    n: number,
    spread: number,
    len: number,
    wid: number,
    pal: Pal,
    bone: any,
  ) {
    const normal = dir.clone().cross(side).normalize();
    for (let i = 0; i < n; i++) {
      const k = n === 1 ? 0 : (i / (n - 1) - 0.5) * spread;
      const d = dir.clone().multiplyScalar(Math.cos(k)).addScaledVector(side.clone().normalize(), Math.sin(k));
      const l = len * (1 - Math.abs(k) * 0.35) * (0.9 + 0.2 * R());
      const at = root.clone().addScaledVector(normal, (i % 2 ? 1 : -1) * 0.004 * (1 + (i >> 1)));
      blade(at, d, normal, l, wid, bladeFill(pal, l), bone, 0.012);
    }
  }

  // Three nested glowing flame tongues.
  function flame(at: THREE.Vector3, dir: THREE.Vector3, face: THREE.Vector3, len: number, wid: number, bone: any) {
    const layers: [number, number, number][] = [
      [1, 1, 0.008],
      [0.74, 0.7, 0.014],
      [0.46, 0.45, 0.02],
    ];
    layers.forEach(([lk, wk, th], i) => {
      glow(blade(at, dir, face, len * lk, wid * wk, FIRE[i], bone, th, flameOutline(len * lk, wid * wk)), 0.8);
    });
  }

  function puff(f: any, r: number, pal: any) {
    b.stick(new THREE.IcosahedronGeometry(r, 1), pal, f, { embed: 0.3, scale: [1, 0.85, 1.1], spin: R() * 360, flat: true });
  }
  const PUFFS = [WHITE_C, CYAN_C, PINK_C, WHITE_C];
  function cluster(f: any, r: number) {
    puff(f, r, PUFFS[Math.floor(R() * 4)]);
    puff(f.moved([r * 0.8, 0, r * 0.3]), r * 0.7, PUFFS[Math.floor(R() * 4)]);
    puff(f.moved([-r * 0.8, r * 0.1, -r * 0.3]), r * 0.65, PUFFS[Math.floor(R() * 4)]);
  }

  // ---- skeleton --------------------------------------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0, 0] });
  const hips = b.joint("hips", { parent: root, at: P(0, 1.02, -0.72), dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([P(0, 1.02, -0.72), P(0, 1.06, -0.3), P(0, 1.1, 0.1), P(0, 1.14, 0.5)]),
    { parent: hips, role: "spine", count: 4 },
  );
  const neck = b.chain(
    "neck",
    catmull([P(0, 1.2, 0.5), P(0, 1.4, 0.7), P(0, 1.62, 0.86), P(0, 1.8, 0.98)]),
    { parent: spine.joints[3], role: "neck", count: 3 },
  );
  const head = b.joint("head", { parent: neck.joints[2], at: neck.at(1), dir: [0, -0.15, 1], role: "head" });
  const hp = (l: number, u: number, f: number) => head.local({ left: l, up: u, forward: f });
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.07, 0.0), aim: hp(0, -0.08, 0.4), role: "jaw" });

  const tailPath = catmull([
    P(0, 1.02, -0.72),
    P(0, 1.04, -1.0),
    P(0.12, 0.92, -1.28),
    P(0.38, 0.66, -1.4),
    P(0.62, 0.5, -1.28),
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, role: "tail", count: 5 });
  const tailEnd = tail.joints[tail.joints.length - 1];

  // ---- body, neck ------------------------------------------------------------------------------------------
  const body = b.sweep(spine, (t) => [0.2 + 0.05 * Math.sin(Math.PI * t), 0.27 + 0.06 * t], {
    color: COAT,
    shift: [0, -0.02],
    sides: 10,
  });
  const neckS = b.sweep(neck, [0.2, 0.15, 0.12, 0.1], { color: COAT, sides: 8 });
  b.sweep(tail, [0.078, 0.034], { color: COAT, sides: 8 });

  // ---- legs ------------------------------------------------------------------------------------------------
  for (const front of [true, false]) {
    for (const s of [1, -1]) {
      const S = s > 0 ? "L" : "R";
      const rootP = front ? P(s * 0.2, 0.99, 0.4) : P(s * 0.2, 0.99, -0.55);
      const foot = front ? P(s * 0.2, 0.1, 0.45) : P(s * 0.2, 0.1, -0.66);
      const pts = limb(
        rootP,
        foot,
        front ? [0.42, 0.42, 0.2] : [0.46, 0.46, 0.22],
        front
          ? [
              [0, 0, -1],
              [0, 0, 1],
            ]
          : [
              [0, 0, 1],
              [0, 0, -1],
            ],
      );
      const names = front
        ? [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `forehoof${S}`]
        : [`hip${S}`, `knee${S}`, `hock${S}`, `hoof${S}`];
      const chain = b.chain(`leg${front ? "F" : "H"}${S}`, pts, {
        parent: front ? spine.joints[3] : hips,
        names,
        role: "leg",
        contact: [foot[0], G, foot[2]],
      });
      b.sweep(chain, [0.11, 0.085, 0.055, 0.042, 0.04], { color: LEG, sides: 8 });
      // shoulder / thigh mass
      b.part(new THREE.SphereGeometry(1, 10, 8), COAT, {
        bone: chain.joints[0],
        at: [rootP[0] + s * 0.03, rootP[1] - 0.03, rootP[2] + (front ? 0.0 : -0.02)],
        scale: front ? [0.13, 0.19, 0.18] : [0.14, 0.2, 0.2],
      });
      // hoof (cloven), anklet and fetlock flames
      const tip = chain.tip ?? chain.joints[2];
      for (const k of [1, -1])
        b.part(new THREE.CylinderGeometry(0.03, 0.04, 0.115, 6), HOOF, {
          bone: tip,
          at: [foot[0] + k * 0.027, G + 0.0575, foot[2] + 0.012],
        });
      b.part(new THREE.CylinderGeometry(0.052, 0.058, 0.03, 8), GOLD, {
        bone: tip,
        at: [foot[0], G + 0.135, foot[2]],
      });
      const fl = V(foot[0], G + 0.17, foot[2] - 0.02);
      flame(fl, V(0, 0.45, -0.9), V(s, 0, 0), 0.2, 0.07, tip);
      flame(fl, V(s * 0.65, 0.5, -0.5), V(s, 0, 0.3), 0.16, 0.06, tip);
      flame(fl, V(-s * 0.5, 0.5, -0.6), V(-s, 0, 0.2), 0.15, 0.055, tip);
      // elbow / hock ruff
      const j = front ? 1 : 2;
      fan(
        V(pts[j].x + s * 0.06, pts[j].y, pts[j].z - 0.02),
        V(s * 0.25, front ? -0.1 : 0.2, -0.9),
        V(0, 1, 0),
        3,
        0.8,
        0.2,
        0.05,
        GOLD_PAL,
        chain.joints[j],
      );
    }
  }

  // ---- mane, back and ornaments on the body --------------------------------------------------------------
  for (let i = 0; i < 8; i++) cluster(neckS.at(0.06 + i * 0.125, 0), 0.11 - 0.008 * i);
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++) puff(neckS.at(0.1 + i * 0.16, s * 65), 0.065, PUFFS[Math.floor(R() * 4)]);
  for (let i = 0; i < 6; i++) cluster(body.at(0.15 + i * 0.13, 0), 0.085 - 0.005 * i);

  // flowing cloud streamers down the neck sides
  for (const s of [1, -1])
    for (const t of [0.25, 0.45, 0.65, 0.85]) {
      const q = neckS.at(t, s * 55);
      fan(
        q.at.clone().addScaledVector(q.n, -0.01),
        V(s * 0.25, 0.05, -1),
        V(0, -1, 0),
        3,
        0.7,
        0.34 - 0.05 * t,
        0.075,
        t > 0.5 ? MANE_PAL : TAIL_PAL,
        neck.jointAt(t),
      );
    }
  // swirl cards
  const dorsal = [0.1, 0.22, 0.34, 0.46, 0.58, 0.7, 0.82, 0.93].map((t) => neckS.at(t, 0));
  b.cards(dorsal, CLOUD, { size: [0.15, 0.3], lean: 70, flow: [0, -0.3, -1], bend: 30, vary: 0.25, rng: R });
  for (const s of [1, -1]) {
    const side = [0.18, 0.4, 0.62, 0.84].map((t) => neckS.at(t, s * 100));
    b.cards(side, CLOUD, { size: [0.13, 0.25], lean: 75, flow: [s * 0.4, -0.3, -1], bend: 25, vary: 0.2, rng: R, mirror: s < 0 });
  }
  const backFrames = [0.2, 0.4, 0.6, 0.8].map((t) => body.at(t, 0));
  b.cards(backFrames, CLOUD, { size: [0.14, 0.26], lean: 70, flow: [0, -0.3, -1], bend: 28, vary: 0.2, rng: R });

  // body gold trim lines
  for (const s of [1, -1]) {
    for (const a of [125, 35]) {
      const ang = (s * a + 360) % 360;
      safe(() => b.sweep(body.line(ang, 0.008), 0.01, { color: GOLD, sides: 5 }));
    }
  }
  // flank seals and curls
  const bodySkin = b.surface(body);
  const bc = V(0, G + 1.07, -0.12);
  for (const s of [1, -1]) {
    safe(() => {
      const hit = bodySkin.around(bc).at(s * 90, 4);
      if (hit) b.decal(bodySkin, SEAL, { at: hit, size: [0.24, 0.24], mirror: s < 0 });
    });
    for (const z of [0.38, -0.55]) {
      safe(() => {
        const hit = bodySkin.around(V(0, G + 1.12, z)).at(s * 90, 12);
        if (!hit) return;
        const n = hit.n.clone();
        const t1 = n.clone().cross(UP);
        if (t1.lengthSq() < 1e-4) t1.set(1, 0, 0);
        t1.normalize();
        const c = hit.at.clone().addScaledVector(n, 0.012);
        const from = c.clone().addScaledVector(t1, 0.08);
        b.sweep(spiral(c, from, n, { turns: s * 1.3, r1: 0.02 }), 0.011, {
          color: z > 0 ? CREAM_C : GOLD,
          bone: hit.bone ?? hips,
          sides: 5,
        });
      });
    }
  }
  // girth band with beads
  safe(() => {
    const girth = bodySkin.loop(spine.joints[2], { lift: 0.02 });
    b.sweep(girth, 0.022, { color: GOLD, sides: 6 });
    b.along(girth, 10, (at) => {
      b.part(new THREE.SphereGeometry(0.03, 6, 4), GOLD_DARK, { at });
    });
  });
  // necklace and throat gem
  safe(() => {
    const ring = b.surface(neckS).loop(neck.joints[1], { lift: 0.02 });
    b.sweep(ring, 0.018, { color: GOLD, sides: 6 });
    b.along(ring, 9, (at) => {
      b.part(new THREE.OctahedronGeometry(0.022), PINK_C, { at });
    });
  });
  safe(() => {
    const th = neckS.at(0.3, 180);
    b.stick(new THREE.CylinderGeometry(0.05, 0.055, 0.02, 6), GOLD, th, { embed: 0.3 });
    glow(b.stick(new THREE.OctahedronGeometry(0.035), RUBY, th.moved([0, 0.03, 0]), { embed: 0.2, scale: [1, 1.3, 1] }), 1.2);
  });

  // ---- tail ornaments ----------------------------------------------------------------------------------
  {
    const endP = tailPath.at(1);
    const T = tailPath.tangentAt(1).clone().normalize();
    const u = T.clone().cross(UP).normalize();
    const v = T.clone().cross(u).normalize();
    const rings = [
      { n: 9, len: 0.5, wid: 0.1, pal: TAIL_PAL, cone: 0.9, off: 0 },
      { n: 6, len: 0.34, wid: 0.08, pal: MANE_PAL, cone: 0.5, off: 0.5 },
    ];
    for (const r of rings)
      for (let i = 0; i < r.n; i++) {
        const a = ((i + r.off) / r.n) * Math.PI * 2;
        const rad = u.clone().multiplyScalar(Math.cos(a)).addScaledVector(v, Math.sin(a));
        const d = T.clone().multiplyScalar(0.7).addScaledVector(rad, r.cone * 0.7).addScaledVector(UP, 0.35).normalize();
        const l = r.len * (0.85 + 0.3 * R());
        blade(endP.clone().addScaledVector(T, -0.03), d, rad, l, r.wid, bladeFill(r.pal, l), tailEnd);
      }
    // small blades along the tail ridge
    for (const t of [0.2, 0.4, 0.6, 0.8]) {
      const q = tail.at(t);
      fan(q.at.clone().add(V(0, 0.05, 0)), V(0, 0.4, -0.9), V(1, 0, 0), 3, 0.9, 0.15, 0.04, TAIL_PAL, tail.jointAt(t));
    }
    flame(endP.clone().addScaledVector(UP, 0.08), V(0.3, 1, -0.2), V(0, 0, 1), 0.2, 0.07, tailEnd);
  }

  // ---- head --------------------------------------------------------------------------------------------------
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), HEADC, {
    bone: head,
    at: hp(0, 0.01, 0.06),
    scale: [0.135, 0.12, 0.145],
  });
  b.frustumBox(hp(0, 0.0, 0.16), hp(0, -0.02, 0.4), [0.2, 0.15], [0.15, 0.1], { color: HEADC, bone: head });
  b.part(new THREE.SphereGeometry(1, 8, 6), cel("#1d8c8a", "#0f5560"), {
    bone: head,
    at: hp(0, -0.012, 0.405),
    scale: [0.075, 0.052, 0.045],
  });
  // lower jaw with mouth interior
  b.frustumBox(hp(0, -0.085, 0.08), hp(0, -0.085, 0.37), [0.17, 0.06], [0.12, 0.05], { color: HEADC, bone: jaw });
  b.part(new THREE.BoxGeometry(0.11, 0.02, 0.22), MOUTH, { bone: jaw, at: hp(0, -0.06, 0.22) });
  b.part(new THREE.BoxGeometry(0.07, 0.018, 0.14), "#e0607e", { bone: jaw, at: hp(0, -0.055, 0.2) });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.014, 6, 4), INK, { bone: head, at: hp(s * 0.036, -0.004, 0.43) });
    b.part(new THREE.SphereGeometry(1, 8, 6), HEADC, { bone: head, at: hp(s * 0.09, -0.035, 0.07), scale: [0.055, 0.05, 0.08] });
    // fangs and teeth
    b.part(new THREE.ConeGeometry(0.013, 0.055, 5), TOOTH, { bone: head, at: hp(s * 0.06, -0.09, 0.3), dir: [0, -1, 0] });
    b.part(new THREE.ConeGeometry(0.011, 0.045, 5), TOOTH, { bone: jaw, at: hp(s * 0.045, -0.055, 0.34), dir: [0, 1, 0] });
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.ConeGeometry(0.008, 0.026, 4), TOOTH, { bone: head, at: hp(s * 0.075, -0.078, 0.14 + i * 0.045), dir: [0, -1, 0] });
      b.part(new THREE.ConeGeometry(0.007, 0.022, 4), TOOTH, { bone: jaw, at: hp(s * 0.065, -0.058, 0.12 + i * 0.045), dir: [0, 1, 0] });
    }
  }
  // eyes
  const skullSkin = b.surface(skull);
  const skullC = hp(0, 0.01, 0.06);
  for (const s of [1, -1]) {
    safe(() => {
      const hit = skullSkin.around(skullC).at(s * 42, 3);
      if (hit) b.decal(skullSkin, EYE, { at: hit, size: [0.07, 0.096], mirror: s > 0 });
    });
    // flame brow
    blade(hp(s * 0.06, 0.105, 0.17), V(s * 0.75, 0.2, -0.55), V(0, 1, 0.2), 0.14, 0.03, bladeFill(GOLD_PAL, 0.14), head, 0.012);
    // ears
    const ea = hp(s * 0.11, 0.05, -0.03);
    blade(ea, V(s * 0.9, 0.3, -0.3), V(0, 0.3, 1), 0.22, 0.09, bladeFill(EAR_PAL, 0.22), head, 0.014);
    blade(ea.clone().add(V(0, 0, 0.01)), V(s * 0.9, 0.3, -0.3), V(0, 0.3, 1), 0.15, 0.055, EAR_PAL[1], head, 0.018);
    // cheek ruff
    fan(hp(s * 0.11, -0.04, 0.0), V(s * 0.5, -0.2, -0.85), V(0, 1, 0), 4, 0.9, 0.2, 0.05, GOLD_PAL, head);
    // whiskers
    const wh = catmull([
      hp(s * 0.08, -0.03, 0.33),
      hp(s * 0.2, -0.05, 0.3),
      hp(s * 0.34, -0.13, 0.18),
      hp(s * 0.42, -0.3, 0.0),
      hp(s * 0.44, -0.5, -0.1),
    ]);
    b.sweep(wh, [0.012, 0.003], { bone: head, color: GOLD, sides: 5, caps: { end: "point" } });
    fan(hp(s * 0.44, -0.5, -0.1), V(s * 0.1, -1, -0.2), V(1, 0, 0), 3, 0.6, 0.16, 0.04, GOLD_PAL, head);
    // antlers
    const pts = [
      hp(s * 0.06, 0.09, 0.0),
      hp(s * 0.085, 0.18, -0.06),
      hp(s * 0.12, 0.3, -0.12),
      hp(s * 0.145, 0.42, -0.13),
      hp(s * 0.14, 0.54, -0.08),
    ];
    const beam = catmull(pts);
    const AP = gradient(cel("#a85a1c", "#6a3010"), cel("#ffe7a0", "#e2b25a"), pts[0], pts[4]);
    b.sweep(beam, [0.032, 0.012], { bone: head, color: AP, caps: { start: "flat", end: "point" }, sides: 6 });
    b.part(new THREE.CylinderGeometry(0.04, 0.046, 0.025, 6), GOLD, {
      bone: head,
      at: pts[0].clone().add(V(0, 0.015, 0)),
      dir: beam.tangentAt(0),
    });
    glow(b.part(new THREE.SphereGeometry(0.02, 6, 4), "#c8fff2", { bone: head, at: pts[4].clone().add(V(0, 0.02, 0.0)) }), 1.2);
    [0.28, 0.48, 0.68, 0.86].forEach((t, idx) => {
      const p = beam.at(t);
      const T = beam.tangentAt(t);
      const d = T.clone().multiplyScalar(0.4).add(V(s * 0.55, 0.15, 0.55)).normalize();
      const len = 0.17 - 0.03 * idx;
      const tip = p.clone().addScaledVector(d, len);
      const ctrl = p.clone().addScaledVector(d, len * 0.55).add(V(0, 0.04, 0));
      b.sweep(bezier(p, ctrl, tip), [0.017, 0.004], { bone: head, color: AP, caps: { start: "flat", end: "point" }, sides: 5 });
      glow(b.part(new THREE.SphereGeometry(0.013, 6, 4), "#aef7e8", { bone: head, at: tip }), 1.2);
    });
  }
  // forehead gem and head mane
  b.part(new THREE.CylinderGeometry(0.035, 0.042, 0.014, 6), GOLD, { bone: head, at: hp(0, 0.112, 0.12), dir: [0, 1, 0.1] });
  glow(b.part(new THREE.OctahedronGeometry(0.026), RUBY, { bone: head, at: hp(0, 0.13, 0.125), scale: [1, 1.4, 1] }), 1.3);
  fan(hp(0, 0.1, -0.1), V(0, 0.35, -0.9), V(1, 0, 0), 5, 1.3, 0.32, 0.07, MANE_PAL, head);
  fan(hp(0, 0.1, -0.08), V(0, 0.6, -0.8), V(0, 1, 0), 3, 0.5, 0.2, 0.05, TAIL_PAL, head);
  // beard
  fan(hp(0, -0.11, 0.28), V(0, -0.8, -0.5), V(1, 0, 0), 3, 0.5, 0.16, 0.04, GOLD_PAL, jaw);

  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  // ---- dais and setting -------------------------------------------------------------------------------------
  const CZ = -0.1;
  b.lathe(
    [
      [0, 0],
      [1.55, 0],
      [1.55, 0.05],
      [1.48, 0.1],
      [0, 0.1],
    ],
    { at: [0, 0, CZ], bone: root, color: STONE, segments: 40 },
  );
  b.lathe(
    [
      [1.42, 0.1],
      [1.5, 0.1],
      [1.5, 0.14],
      [1.46, 0.16],
      [1.42, 0.14],
    ],
    { at: [0, 0, CZ], bone: root, color: GOLD, segments: 40 },
  );
  b.part(new THREE.CircleGeometry(1.4, 48), "#ffffff", {
    bone: root,
    at: [0, 0.103, CZ],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, 1],
    texture: FLOOR,
  });
  glow(
    b.part(new THREE.CircleGeometry(1.34, 48), "#ffffff", {
      bone: root,
      at: [0, 0.108, CZ],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, 1],
      texture: RUNES,
    }),
    1.1,
  );
  // pillars with glowing orbs
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const x = Math.cos(a) * 1.47;
    const z = CZ + Math.sin(a) * 1.47;
    b.part(new THREE.CylinderGeometry(0.045, 0.058, 0.2, 6), STONE_D, { bone: root, at: [x, 0.2, z] });
    b.part(new THREE.CylinderGeometry(0.06, 0.05, 0.03, 6), GOLD, { bone: root, at: [x, 0.315, z] });
    glow(b.part(new THREE.IcosahedronGeometry(0.05, 1), "#7ff5df", { bone: root, at: [x, 0.37, z], flat: true }), 1.2);
  }
  // crystals and rocks
  const crystalSites: [number, number, number][] = [
    [-0.95, 0.1, -0.85],
    [1.0, 0.1, 0.75],
  ];
  crystalSites.forEach(([cx, cy, cz], si) => {
    b.part(new THREE.IcosahedronGeometry(0.2, 0), STONE_D, { bone: root, at: [cx, cy + 0.06, cz], scale: [1.2, 0.6, 1], flat: true });
    for (let i = 0; i < 4; i++) {
      const h = 0.22 + 0.2 * R();
      const tilt = V((R() - 0.5) * 0.7, 1, (R() - 0.5) * 0.7).normalize();
      const base = V(cx + (R() - 0.5) * 0.22, cy + 0.1, cz + (R() - 0.5) * 0.22);
      glow(
        b.part(new THREE.ConeGeometry(0.055 + 0.02 * R(), h, 5), si ? "#8af7ff" : "#59f0d8", {
          bone: root,
          at: base.clone().addScaledVector(tilt, h / 2),
          dir: tilt,
          flat: true,
        }),
        1.1,
      );
    }
  });
  // cloud puffs around the hooves
  const cloudSpots: [number, number][] = [
    [0.38, 0.55],
    [-0.38, 0.55],
    [0.4, -0.78],
    [-0.4, -0.78],
  ];
  for (const [cx, cz] of cloudSpots)
    for (let i = 0; i < 4; i++) {
      const a = R() * Math.PI * 2;
      const r = 0.08 + 0.12 * R();
      b.part(new THREE.IcosahedronGeometry(0.07 + 0.06 * R(), 1), PUFFS[Math.floor(R() * 4)], {
        bone: root,
        at: [cx + Math.cos(a) * r, G + 0.04, cz + Math.sin(a) * r],
        scale: [1.1, 0.65, 1],
        flat: true,
      });
    }
  // floating sparkles
  const sparks = [];
  for (let i = 0; i < 16; i++) {
    const a = R() * Math.PI * 2;
    const rad = 0.8 + 0.55 * R();
    sparks.push(frame(V(Math.cos(a) * rad, 0.4 + 1.4 * R(), CZ + Math.sin(a) * rad), [0, 1, 0]));
  }
  glow(b.cards(sparks, SPARK, { size: [0.09, 0.09], cross: true, vary: 0.4, rng: R, sink: 0, bone: root }), 1);

  return b.root;
}
