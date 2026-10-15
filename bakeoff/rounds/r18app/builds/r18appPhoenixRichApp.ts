// Phoenix with flame plumage, wings spread. Genshin Impact style: cel-shaded paints, gold filigree and tassels,
// pyro glow in the flame tips, a ruby chest jewel and big anime eyes.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { paint, scales } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK, shadowOf, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Phoenix",
  description:
    "Fire phoenix with wings spread: cel-shaded flame plumage, gold filigree jewellery with tassels, glowing pyro flame tips and a ruby chest gem.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const DEEP = "#8f1233";
const CRIMSON = "#d82233";
const SCARLET = "#f2451f";
const ORANGE = "#ff7a1c";
const AMBER = "#ffb02e";
const YELLOW = "#ffe066";
const CREAM = "#fff3cf";
const GOLDC = "#f4bd3c";
const GOLDD = "#b9791f";
const RUBY = "#ff3b2a";
const HOT = "#fff0a0";

const GOLD = cel(GOLDC, GOLDD);
const GOLD_SCALE = cel(scales(["#f6c242", "#ffd35a", "#eab034"], "#a96a16", { size: 0.028, width: 0.16 }), "#a96a16");
const BEAK = cel(AMBER, "#d9741c");
const TALON = cel(CREAM, "#e0b48a");

const BACK_COAT = cel(scales([SCARLET, "#ea3a24", CRIMSON], DEEP, { size: 0.05, width: 0.14 }));
const CHEST_COAT = cel(scales([AMBER, "#ffc23a", "#ffa729"], "#e2701c", { size: 0.05, width: 0.14 }));
const DEEP_COAT = cel(scales([CRIMSON, "#c41d36", "#b11a35"], "#70102f", { size: 0.05, width: 0.14 }));
const BODY_COAT = furEdge(BACK_COAT, CHEST_COAT, {
  axis: [0, 0.5, -0.5],
  level: -0.1,
  teeth: 0.28,
  period: 0.05,
  along: [0, 0, 1],
  ink: DEEP,
  inkWidth: 0.05,
});

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Piecewise-linear lookup of `vals` at `ts`. */
function keyed(ts: number[], vals: number[], t: number) {
  if (t <= ts[0]) return vals[0];
  for (let i = 1; i < ts.length; i++)
    if (t <= ts[i]) {
      const u = (t - ts[i - 1]) / (ts[i] - ts[i - 1]);
      return vals[i - 1] + (vals[i] - vals[i - 1]) * u;
    }
  return vals[vals.length - 1];
}

// ---------------------------------------------------------------------------------------------------------------
// Textures (drawn in the cel style: hard bands, ink-dark outlines)

/** A flame-coloured feather card: root at the bottom, tip at the top, hard colour bands with zig-zag edges. */
function featherCard(a: string, b: string, c: string, d: string, vein: string, edge: string) {
  return svg(
    `<svg viewBox="0 0 40 100">
    <defs><clipPath id="f"><path d="M20 99 C10 82 3 54 8 28 C11 14 16 6 20 1 C24 6 29 14 32 28 C37 54 30 82 20 99Z"/></clipPath></defs>
    <g clip-path="url(#f)">
      <rect width="40" height="100" fill="${d}"/>
      <path d="M0 40 L7 34 L14 42 L20 33 L26 42 L33 34 L40 40 L40 100 L0 100Z" fill="${c}"/>
      <path d="M0 62 L7 56 L14 64 L20 55 L26 64 L33 56 L40 62 L40 100 L0 100Z" fill="${b}"/>
      <path d="M0 82 L7 77 L14 84 L20 76 L26 84 L33 77 L40 82 L40 100 L0 100Z" fill="${a}"/>
    </g>
    <path d="M20 99 C10 82 3 54 8 28 C11 14 16 6 20 1 C24 6 29 14 32 28 C37 54 30 82 20 99Z" fill="none" stroke="${edge}" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M20 96 L20 10" stroke="${vein}" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`,
    { size: 192 },
  );
}

const RUFF = featherCard(DEEP, CRIMSON, SCARLET, ORANGE, "#ffd27a", DEEP);
const RUFF_GOLD = featherCard("#e2701c", ORANGE, AMBER, YELLOW, CREAM, "#c4561a");
const RUFF_DEEP = featherCard("#5a0f2c", DEEP, CRIMSON, SCARLET, "#ff9a5a", "#4a0a24");

/** A flame tongue, three nested colours; used glowing. */
const FLAME = svg(
  `<svg viewBox="0 0 40 100">
    <path d="M20 99 C4 88 2 66 12 50 C14 40 10 28 18 14 C19 8 22 4 26 1 C26 14 30 22 30 34 C36 46 38 60 36 72 C34 88 28 96 20 99Z" fill="#ff5a1a"/>
    <path d="M20 96 C10 88 10 70 17 58 C19 50 17 42 21 30 C23 42 28 50 28 62 C30 80 26 92 20 96Z" fill="#ffa81f"/>
    <path d="M20 93 C14 86 15 74 20 64 C22 74 26 78 24 86 C23 90 22 92 20 93Z" fill="#fff4a8"/>
  </svg>`,
  { size: 128 },
);

/** A hanging tassel, drawn upside down (root edge at the bottom of the drawing, strands toward the top). */
const TASSEL = svg(
  `<svg viewBox="0 0 30 100">
    <path d="M15 66 C2 50 2 24 6 2 C10 22 12 40 15 66Z" fill="#d82233" stroke="#6d0f2c" stroke-width="1.4"/>
    <path d="M15 66 C28 50 28 24 24 2 C20 22 18 40 15 66Z" fill="#d82233" stroke="#6d0f2c" stroke-width="1.4"/>
    <path d="M15 66 C9 46 10 22 12 4 C15 24 15 44 15 66Z" fill="#ff6a30" stroke="#6d0f2c" stroke-width="1.2"/>
    <path d="M15 66 C21 46 20 22 18 4 C15 24 15 44 15 66Z" fill="#ff6a30" stroke="#6d0f2c" stroke-width="1.2"/>
    <rect x="9" y="64" width="12" height="9" rx="2" fill="#f4bd3c" stroke="#9a6414" stroke-width="1.4"/>
    <circle cx="15" cy="83" r="8" fill="#f4bd3c" stroke="#9a6414" stroke-width="1.6"/>
    <circle cx="12.5" cy="80.5" r="2.4" fill="#fff3cf"/>
    <rect x="12.5" y="91" width="5" height="8" fill="#f4bd3c" stroke="#9a6414" stroke-width="1.2"/>
  </svg>`,
  { size: 160 },
);

/** Gold filigree pectoral drawn on the chest: fanned petals, wing sweeps and scrolls around a ring for the gem. */
const FILIGREE = svg(
  `<svg viewBox="0 0 120 100">
    <g fill="#f4bd3c" stroke="#9a6414" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
      <g transform="rotate(-72 60 52)"><path d="M60 32 C55 24 55 14 60 4 C65 14 65 24 60 32Z"/></g>
      <g transform="rotate(-48 60 52)"><path d="M60 32 C54 22 54 10 60 -2 C66 10 66 22 60 32Z"/></g>
      <g transform="rotate(-24 60 52)"><path d="M60 32 C54 22 54 8 60 -4 C66 8 66 22 60 32Z"/></g>
      <path d="M60 32 C54 22 54 8 60 -6 C66 8 66 22 60 32Z"/>
      <g transform="rotate(24 60 52)"><path d="M60 32 C54 22 54 8 60 -4 C66 8 66 22 60 32Z"/></g>
      <g transform="rotate(48 60 52)"><path d="M60 32 C54 22 54 10 60 -2 C66 10 66 22 60 32Z"/></g>
      <g transform="rotate(72 60 52)"><path d="M60 32 C55 24 55 14 60 4 C65 14 65 24 60 32Z"/></g>
      <path d="M42 50 C30 44 18 38 5 42 C13 47 17 51 22 53 C14 54 8 58 3 66 C16 63 30 62 42 57Z"/>
      <g transform="translate(120 0) scale(-1 1)"><path d="M42 50 C30 44 18 38 5 42 C13 47 17 51 22 53 C14 54 8 58 3 66 C16 63 30 62 42 57Z"/></g>
    </g>
    <g fill="none" stroke="#f4bd3c" stroke-width="3.4" stroke-linecap="round">
      <circle cx="60" cy="52" r="20"/>
      <path d="M44 66 C32 76 20 72 22 84 C24 94 38 94 41 85 C43 80 37 77 34 81"/>
      <g transform="translate(120 0) scale(-1 1)"><path d="M44 66 C32 76 20 72 22 84 C24 94 38 94 41 85 C43 80 37 77 34 81"/></g>
      <path d="M52 74 C56 82 56 90 60 96 C64 90 64 82 68 74"/>
    </g>
    <g fill="#fff3cf" stroke="#9a6414" stroke-width="1.2">
      <circle cx="60" cy="96" r="3"/><circle cx="22" cy="84" r="2.6"/><circle cx="98" cy="84" r="2.6"/>
      <circle cx="12" cy="50" r="2.4"/><circle cx="108" cy="50" r="2.4"/>
    </g>
  </svg>`,
  { size: 512 },
);

const EYE = animeEye({ iris: "#ff5a1c", irisLight: "#ffd27a", blush: "#ffb08a", size: 256 });

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "phoenix", paintSize: 2048 });
  const R = rng(21);
  type Joint = ReturnType<typeof b.joint>;

  // ---- Skeleton: body + neck on one curve ---------------------------------------------------------------
  const P0 = V(0, 0.86, -0.32);
  const bodyPts = [P0, V(0, 0.98, -0.02), V(0, 1.14, 0.22), V(0, 1.33, 0.32), V(0, 1.52, 0.4), V(0, 1.68, 0.42), V(0, 1.79, 0.5)];
  const bodyPath = catmull(bodyPts);
  const keyT = bodyPts.map((p) => bodyPath.closestT(p));
  const tNeck = keyT[3];

  const hips = b.joint("hips", { at: P0, dir: [0, 0.4, 1], role: "spine" });
  const spine = b.chain("spine", bodyPath.slice(0, tNeck), {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const chest = spine.joints[spine.joints.length - 1];
  const neck = b.chain("neck", bodyPath.slice(tNeck, 1), {
    parent: chest,
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
  });
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: bodyPts[6],
    dir: [0, -0.12, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.07, down: 0.045 }),
    aim: head.local({ forward: 0.28, down: 0.065 }),
    role: "jaw",
  });

  // ---- Body ---------------------------------------------------------------------------------------------
  const bodyRx = [0.07, 0.2, 0.25, 0.13, 0.088, 0.075, 0.07];
  const bodyRy = [0.07, 0.2, 0.275, 0.14, 0.092, 0.078, 0.072];
  const body = b.sweep(bodyPath, (t) => [keyed(keyT, bodyRx, t), keyed(keyT, bodyRy, t)], {
    bone: [spine, neck],
    color: BODY_COAT,
    sides: 12,
  });
  const skin = b.surface(body);

  // ---- Tail root ----------------------------------------------------------------------------------------
  const tailPts = [V(0, 0.85, -0.3), V(0, 0.8, -0.6), V(0, 0.72, -0.92)];
  const tail = b.chain("tail", catmull(tailPts), { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" });
  b.sweep(tail, [0.085, 0.045], { color: DEEP_COAT, sides: 8 });
  const tailEnd = tail.joints[tail.joints.length - 1];

  // ---- Head ---------------------------------------------------------------------------------------------
  const HC = head.local({ forward: 0.065, up: 0.005 });
  const faceLevel = HC.y + 0.04;
  const headPaint = furEdge(BACK_COAT, cel("#ffe9a8", "#f0c37a"), {
    by: "position",
    axis: [0, 1, 0],
    level: faceLevel - 0.0,
    teeth: 0.03,
    period: 0.035,
    along: [1, 0, 0],
    ink: DEEP,
    inkWidth: 0.004,
  });
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), headPaint, {
    bone: head,
    at: HC,
    scale: [0.105, 0.1, 0.115],
  });
  const hskin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = hskin.around(HC).at(s * 52, 6);
    if (hit) b.decal(hskin, EYE, { at: hit, size: [0.062, 0.085], mirror: s > 0, segments: 10 });
  }
  // brow ridges
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        head.local({ left: s * 0.105, forward: 0.05, up: 0.075 }),
        head.local({ left: s * 0.09, forward: 0.12, up: 0.082 }),
        head.local({ left: s * 0.05, forward: 0.17, up: 0.065 }),
      ]),
      [0.013, 0.005],
      { color: DEEP_COAT, bone: head, sides: 6 },
    );
  }
  // beak: hooked upper, lower on the jaw
  b.sweep(
    catmull([
      head.local({ forward: 0.12, up: 0.0 }),
      head.local({ forward: 0.2, up: 0.012 }),
      head.local({ forward: 0.27, up: -0.01 }),
      head.local({ forward: 0.305, up: -0.07 }),
    ]),
    (t) => [0.05 * (1 - t) ** 0.8 + 0.006, 0.042 * (1 - t) ** 0.8 + 0.006],
    { color: BEAK, bone: head, sides: 8, caps: "point" },
  );
  b.sweep(
    catmull([
      head.local({ forward: 0.09, down: 0.04 }),
      head.local({ forward: 0.19, down: 0.05 }),
      head.local({ forward: 0.27, down: 0.052 }),
    ]),
    [0.036, 0.008],
    { color: BEAK, bone: jaw, sides: 8, caps: "point" },
  );
  // nostrils and beak ridge
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.01, 6, 4), INK, {
      bone: head,
      at: head.local({ left: s * 0.032, forward: 0.17, up: 0.034 }),
      scale: [1, 0.6, 1.4],
    });
  }
  const circletPath = hskin.loop(HC.clone().add(V(0, 0.038, 0)), { dir: [0, 1, -0.18], lift: 0.006 });
  b.sweep(circletPath, 0.0085, { color: GOLD, bone: head, sides: 6 });
  const forehead = hskin.around(HC).at(0, 30);
  if (forehead) {
    glow(b.stick(new THREE.OctahedronGeometry(0.026, 0), RUBY, forehead, { embed: 0.2, scale: [1, 1.5, 1] }), 1.3);
    b.stick(
      new THREE.CylinderGeometry(0.036, 0.04, 0.012, 6),
      GOLD,
      forehead,
      { embed: 0.55 },
    );
    b.ring(forehead, { count: 4, radius: 0.034, fromDeg: -120, toDeg: 120 }, (it) =>
      b.spike(it, it, 0.032, 0.008, { color: GOLD, bone: head }),
    );
  }

  // crest plumes (3 swept flame sheets) and long ear streamers
  const plumePaint = (c0: string, c1: string, c2: string, c3: string) =>
    cel(
      paint((_p, _n, s) => {
        const t = s[0];
        const q = t + 0.05 * zigzag(s[1] / 40);
        return q < 0.3 ? c0 : q < 0.6 ? c1 : q < 0.85 ? c2 : c3;
      }),
    );
  const flameFrames: ReturnType<Joint["moved"]>[] = [];
  const crestSpecs = [
    { k: 0, up: 0.1, back: 0.0, rise: 0.27, tipBack: 0.5, w: 0.045 },
    { k: 1, up: 0.085, back: 0.0, rise: 0.2, tipBack: 0.45, w: 0.036 },
    { k: -1, up: 0.085, back: 0.0, rise: 0.2, tipBack: 0.45, w: 0.036 },
  ];
  for (const c of crestSpecs) {
    const x = c.k * 0.045;
    const pts = [
      head.local({ left: x, forward: 0.0, up: c.up }),
      head.local({ left: x * 1.6, forward: -0.1, up: c.up + c.rise * 0.7 }),
      head.local({ left: x * 2.6, forward: -c.tipBack * 0.65, up: c.up + c.rise }),
      head.local({ left: x * 3.4, forward: -c.tipBack, up: c.up + c.rise * 0.55 }),
    ];
    const name = c.k === 0 ? "crestC" : c.k > 0 ? "crestL" : "crestR";
    const ch = b.chain(name, catmull(pts), {
      parent: head,
      names: [`${name}1`, `${name}2`, `${name}3`],
      role: "fan",
      up: [1, 0, 0],
    });
    b.sweep(ch, (t) => [c.w * (0.5 + 0.9 * Math.sin(Math.PI * Math.min(1, t * 0.95 + 0.05)) ** 0.8), 0.009], {
      color: plumePaint(ORANGE, AMBER, YELLOW, CREAM),
      section: "box",
      caps: "point",
    });
    flameFrames.push(ch.joints[ch.joints.length - 1].moved([0, 0.12, 0]));
  }
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = [
      head.local({ left: s * 0.1, forward: -0.02, up: 0.0 }),
      head.local({ left: s * 0.16, forward: -0.2, up: -0.03 }),
      head.local({ left: s * 0.22, forward: -0.48, up: -0.2 }),
      head.local({ left: s * 0.26, forward: -0.6, up: -0.5 }),
    ];
    const ch = b.chain(`earPlume${S}`, catmull(pts), {
      parent: head,
      names: [`earPlume${S}1`, `earPlume${S}2`, `earPlume${S}3`],
      role: "fan",
      up: [s, 0, 0],
    });
    b.sweep(ch, (t) => [0.04 * (0.4 + Math.sin(Math.PI * Math.min(1, t * 0.9 + 0.1)) ** 0.7), 0.008], {
      color: plumePaint(DEEP, CRIMSON, SCARLET, ORANGE),
      section: "box",
      caps: "point",
    });
    flameFrames.push(ch.joints[ch.joints.length - 1].moved([0, 0.1, 0]));
  }

  // ---- Wings --------------------------------------------------------------------------------------------
  /** Flat-lit feather membrane: leaf outline curling up toward its tip, painted in four hard flame bands. */
  function featherPaint(L: number, W: number, tones: [string, string, string, string], rachis: string) {
    return cel(
      paint((_p, _n, s) => {
        const a = s[0];
        const c = s[1];
        const e = Math.abs(c - 0.5) * 2;
        if (e < 0.07 && a > 0.02 && a < 0.94) return rachis;
        if (e > 0.93 && a < 0.96) return tones[0];
        const q = a - e * 0.1 + 0.035 * zigzag(c * 4.5);
        const col = q < 0.3 ? tones[0] : q < 0.58 ? tones[1] : q < 0.8 ? tones[2] : tones[3];
        const barb = ((a * L - e * W * 0.65) / 0.026) % 1;
        return barb < 0.13 && a > 0.1 ? shadowOf(col) : col;
      }),
    );
  }
  const leafHalf = (t: number) => {
    const base = Math.min(1, 0.4 + (t / 0.15) * 0.6);
    const tip = t < 0.55 ? 1 : Math.max(0, 1 - ((t - 0.55) / 0.45) ** 1.8) ** 0.6;
    return Math.max(0.03, base * tip);
  };
  function feather(o: {
    root: THREE.Vector3;
    dir: THREE.Vector3;
    L: number;
    W: number;
    lift: number;
    side?: number;
    bone: Joint;
    tones: [string, string, string, string];
    rachis: string;
    name: string;
  }) {
    const d = o.dir.clone().normalize();
    const up = V(0, 1, 0);
    const w = new THREE.Vector3().crossVectors(d, up).normalize();
    const A: THREE.Vector3[] = [];
    const B: THREE.Vector3[] = [];
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      const c = o.root
        .clone()
        .addScaledVector(d, o.L * t)
        .addScaledVector(up, o.lift * o.L * t * t)
        .addScaledVector(w, (o.side ?? 0) * o.L * t * t);
      const h = (o.W / 2) * leafHalf(t);
      A.push(c.clone().addScaledVector(w, h));
      B.push(c.clone().addScaledVector(w, -h));
    }
    return b.membrane(catmull(A), catmull(B), {
      color: featherPaint(o.L, o.W, o.tones, o.rachis),
      bone: o.bone,
      thickness: 0.011,
      rows: 2,
      cols: 6,
      name: o.name,
    });
  }
  const dirAt = (s: number, deg: number, y: number) =>
    V(s * Math.sin((deg * Math.PI) / 180), y, -Math.cos((deg * Math.PI) / 180)).normalize();
  const TONE_PRIM: [string, string, string, string] = [CRIMSON, SCARLET, ORANGE, AMBER];
  const TONE_SEC: [string, string, string, string] = [DEEP, CRIMSON, SCARLET, ORANGE];
  const TONE_COV: [string, string, string, string] = [SCARLET, ORANGE, AMBER, YELLOW];
  const TONE_LESS: [string, string, string, string] = [ORANGE, AMBER, YELLOW, CREAM];
  const RACH = "#ffe8a0";

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const Sh = V(s * 0.2, 1.2, 0.12);
    const El = V(s * 0.65, 1.43, -0.18);
    const Wr = V(s * 1.05, 1.62, 0.02);
    const Hd = V(s * 1.42, 1.74, -0.08);
    const arm = b.chain(`wing${S}`, catmull([Sh, El, Wr, Hd], { tension: 0.5 }), {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`],
      role: "wing",
    });
    const [shoulder, elbow, wrist] = arm.joints;
    const armSweep = b.sweep(arm, [0.078, 0.062, 0.05, 0.036], { color: DEEP_COAT, sides: 8 });
    b.part(new THREE.SphereGeometry(0.11, 10, 8), BACK_COAT, { bone: shoulder, at: Sh.clone().add(V(-s * 0.02, 0, 0)), scale: [1, 0.9, 1.1] });

    // secondaries along the forearm
    for (let i = 0; i < 8; i++) {
      const u = i / 7;
      const base = new THREE.Vector3().lerpVectors(El, Wr, u).add(V(0, -0.005, -0.045));
      const dir = dirAt(s, 4 + u * 24, 0.08);
      const L = 0.72 + 0.12 * Math.sin(u * Math.PI);
      const j = b.joint(`secondary${S}${i + 1}`, { parent: elbow, at: base, dir, role: "fan" });
      feather({ root: base, dir, L, W: 0.15, lift: 0.1, bone: j, tones: TONE_SEC, rachis: RACH, name: `secondary${S}${i + 1}` });
      flameFrames.push(j.moved([0, L + 0.02, 0]));
    }
    // tertials along the upper arm
    for (let i = 0; i < 3; i++) {
      const u = 0.25 + i * 0.28;
      const base = new THREE.Vector3().lerpVectors(Sh, El, u).add(V(0, -0.005, -0.05));
      const dir = dirAt(s, -4 + i * 5, 0.06);
      const j = b.joint(`tertial${S}${i + 1}`, { parent: shoulder, at: base, dir, role: "fan" });
      feather({ root: base, dir, L: 0.5 - i * 0.03, W: 0.15, lift: 0.06, bone: j, tones: TONE_SEC, rachis: RACH, name: `tertial${S}${i + 1}` });
    }
    // primaries fan out of the hand
    const primL = [1.0, 1.08, 1.16, 1.2, 1.2, 1.15, 1.06, 0.94, 0.8];
    for (let i = 0; i < 9; i++) {
      const u = i / 8;
      const base = new THREE.Vector3().lerpVectors(Wr, Hd, Math.min(1, u * 1.05)).add(V(0, -0.005, -0.04));
      const dir = dirAt(s, 36 + u * 52, 0.12 + 0.06 * u);
      const L = primL[i];
      const j = b.joint(`primary${S}${i + 1}`, { parent: wrist, at: base, dir, role: "fan" });
      feather({ root: base, dir, L, W: 0.14, lift: 0.2 + 0.12 * u, side: -s * 0.04 * u, bone: j, tones: TONE_PRIM, rachis: RACH, name: `primary${S}${i + 1}` });
      flameFrames.push(j.moved([0, L + 0.02, 0]));
    }
    // coverts: three rows of golden feathers over the roots
    for (let i = 0; i < 8; i++) {
      const u = i / 7;
      const base = new THREE.Vector3().lerpVectors(El, Wr, u).add(V(0, 0.016, -0.015));
      feather({ root: base, dir: dirAt(s, 6 + u * 24, 0.08), L: 0.4, W: 0.14, lift: 0.08, bone: elbow, tones: TONE_COV, rachis: RACH, name: `greater${S}${i + 1}` });
    }
    for (let i = 0; i < 8; i++) {
      const u = i / 7;
      const base = new THREE.Vector3().lerpVectors(Sh, Wr, 0.18 + u * 0.82).add(V(0, 0.03, 0.02));
      feather({ root: base, dir: dirAt(s, 8 + u * 22, 0.06), L: 0.26, W: 0.12, lift: 0.06, bone: u < 0.5 ? shoulder : elbow, tones: TONE_LESS, rachis: RACH, name: `median${S}${i + 1}` });
    }
    for (let i = 0; i < 7; i++) {
      const u = i / 6;
      const base = new THREE.Vector3().lerpVectors(Wr, Hd, u * 0.95).add(V(0, 0.016, -0.0));
      feather({ root: base, dir: dirAt(s, 40 + u * 46, 0.1), L: 0.4, W: 0.115, lift: 0.1, bone: wrist, tones: TONE_COV, rachis: RACH, name: `primaryCovert${S}${i + 1}` });
    }
    // alula / leading-edge flames
    b.cards(
      b.along(armSweep, 7, (at) => at),
      RUFF_GOLD,
      { size: [0.07, 0.16], lean: 70, flow: [s * 0.4, -0.1, -1], bend: 20, vary: 0.25, rng: R, spin: 8 },
    );

    // gold bracers with ruby studs and a tassel at each wrist
    const armSkin = b.surface(armSweep);
    for (const [bone, t] of [
      [elbow, 0.36],
      [wrist, 0.66],
    ] as const) {
      const ring = armSkin.loop(arm.at(t), { lift: 0.004 });
      b.sweep(ring, 0.011, { color: GOLD, bone, sides: 6 });
      const ring2 = armSkin.loop(arm.at(t + 0.06), { lift: 0.004 });
      b.sweep(ring2, 0.011, { color: GOLD, bone, sides: 6 });
      const band = armSkin.loop(arm.at(t + 0.03), { lift: 0.012 });
      b.sweep(band, 0.0085, { color: GOLD, bone, sides: 6 });
      const top = armSkin.around(arm.at(t + 0.03).at).at(0, 90);
      if (top) {
        glow(b.stick(new THREE.OctahedronGeometry(0.02, 0), RUBY, top, { embed: 0.2, scale: [1, 1.5, 1] }), 1.2);
        b.stick(new THREE.CylinderGeometry(0.03, 0.034, 0.01, 6), GOLD, top, { embed: 0.6 });
      }
    }
    const wristPt = arm.at(0.66).at;
    b.cards([frame(wristPt.clone().add(V(0, -0.045, 0.03)), [0, 1, 0])], TASSEL, {
      size: [0.045, 0.28],
      lean: 180,
      flow: [0, 0, 1],
      cross: true,
      bone: wrist,
    });
  }

  // ---- Tail: fan of flame feathers + five long ribbon streamers --------------------------------------------
  const R0 = tailPts[2];
  for (let i = 0; i < 9; i++) {
    const k = i - 4;
    const yaw = k * 9;
    const dir = V(Math.sin((yaw * Math.PI) / 180), -0.12 + 0.025 * Math.abs(k), -Math.cos((yaw * Math.PI) / 180));
    const base = R0.clone().add(V(k * 0.012, 0.03, 0.02));
    const j = b.joint(`tailFeather${i + 1}`, { parent: tailEnd, at: base, dir, role: "fan" });
    const L = 1.15 - Math.abs(k) * 0.07;
    feather({ root: base, dir, L, W: 0.19, lift: 0.5 - 0.04 * Math.abs(k), side: -k * 0.025, bone: j, tones: TONE_SEC, rachis: RACH, name: `tailFeather${i + 1}` });
    flameFrames.push(j.moved([0, L + 0.02, 0]));
  }
  const streamerWidth = (t: number) =>
    t < 0.5 ? 0.028 + 0.075 * (t / 0.5) : 0.103 * (1 - ((t - 0.5) / 0.5) ** 1.5) + 0.004;
  const streamers = [-2, -1, 0, 1, 2];
  for (const k of streamers) {
    const sway = k === 0 ? 0 : Math.sign(k);
    const pts = [
      R0.clone().add(V(k * 0.015, 0.0, 0.0)),
      V(k * 0.1, 0.55, -1.32),
      V(k * 0.3 + sway * 0.05, 0.27 - 0.03 * (2 - Math.abs(k)), -1.9),
      V(k * 0.5 - sway * 0.08, 0.34, -2.4 - 0.12 * (2 - Math.abs(k))),
      V(k * 0.58 + sway * 0.06, 0.72 + 0.1 * (2 - Math.abs(k)), -2.85 - 0.2 * (2 - Math.abs(k))),
    ];
    const path = catmull(pts);
    const ch = b.chain(`streamer${k + 3}`, path, {
      parent: tailEnd,
      names: [`streamer${k + 3}a`, `streamer${k + 3}b`, `streamer${k + 3}c`, `streamer${k + 3}d`],
      role: "tail",
    });
    const eye = path.at(0.62);
    const ink = cel(
      paint((p, _n, s) => {
        const t = s[0];
        const d = p.distanceTo(eye);
        if (d < 0.062) return d > 0.046 ? GOLDC : d > 0.03 ? CRIMSON : d > 0.014 ? ORANGE : YELLOW;
        const q = t + 0.04 * zigzag(s[1] / 30);
        return q < 0.26 ? DEEP : q < 0.5 ? CRIMSON : q < 0.74 ? SCARLET : q < 0.9 ? ORANGE : AMBER;
      }),
    );
    b.sweep(ch, (t) => [streamerWidth(t), 0.011], { color: ink, section: "box", caps: "point" });
    flameFrames.push(ch.joints[ch.joints.length - 1].moved([0, 0.15, 0]));
  }

  // ---- Legs ----------------------------------------------------------------------------------------------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const foot = V(s * 0.15, 0.058, 0.09);
    const pts = [V(s * 0.16, 0.86, -0.08), V(s * 0.18, 0.7, 0.13), V(s * 0.16, 0.33, -0.1), foot];
    const leg = b.chain(`leg${S}`, catmull(pts, { tension: 0.5 }), {
      parent: spine.joints[0],
      names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`],
      role: "leg",
      contact: [foot.x, 0, 0.14],
    });
    const legSweep = b.sweep(leg, (t) => keyed([0, 0.15, 0.28, 0.45, 0.69, 1], [0.075, 0.098, 0.085, 0.062, 0.04, 0.03], t), {
      sides: 8,
      color: (t) => (t < 0.5 ? BODY_COAT : GOLD_SCALE),
    });
    const lskin = b.surface(legSweep);
    // feathered leggings
    const pants = lskin.scatter(46, { rng: R, minDist: 0.045, filter: (h) => h.at.y > 0.45 && h.n.y > -0.4 });
    b.cards(pants, RUFF, { size: [0.06, 0.13], lean: 55, flow: [0, -1, -0.25], bend: 20, vary: 0.25, rng: R });
    // anklet with tassel
    const ank = lskin.loop(leg.at(0.74), { lift: 0.004 });
    b.sweep(ank, 0.012, { color: GOLD, sides: 6 });
    b.cards([frame(leg.at(0.74).at.clone().add(V(0, 0, 0.034)), [0, 1, 0])], TASSEL, {
      size: [0.04, 0.2],
      lean: 180,
      flow: [0, 0, 1],
      cross: true,
      bone: leg.joints[2],
    });

    // toes: three forward, one back, each with a knuckle and a talon
    const ballJoint = leg.tip ?? leg.joints[leg.joints.length - 1];
    const toeSpecs = [
      { name: 1, yaw: 30, len: 0.2 },
      { name: 2, yaw: 0, len: 0.23 },
      { name: 3, yaw: -30, len: 0.2 },
      { name: 4, yaw: 180, len: 0.16 },
    ];
    for (const sp of toeSpecs) {
      const yawR = (sp.yaw * Math.PI) / 180;
      const d = V(s * Math.sin(yawR), 0, Math.cos(yawR)).normalize();
      const start = foot.clone();
      const m1 = foot.clone().addScaledVector(d, sp.len * 0.5);
      m1.y = 0.034;
      const end = foot.clone().addScaledVector(d, sp.len);
      end.y = 0.028;
      const toe = b.chain(`toe${S}${sp.name}`, catmull([start, m1, end]), {
        parent: ballJoint,
        names: [`toe${S}${sp.name}a`, `toe${S}${sp.name}b`],
        role: "digit",
      });
      b.sweep(toe, [0.03, 0.022], { color: GOLD_SCALE, sides: 6, caps: "round" });
      b.part(new THREE.SphereGeometry(0.026, 6, 4), GOLD, { bone: toe.joints[1], at: m1.clone().add(V(0, 0.004, 0)) });
      const tdir = d.clone().multiplyScalar(0.8).add(V(0, -0.6, 0)).normalize();
      b.spike(end, tdir, 0.085, 0.017, { color: TALON, bone: toe.joints[1] });
    }
  }

  // ---- Plumage cards over the body --------------------------------------------------------------------------
  const chestGem = V(0, 1.16, 0.55);
  const chestHit = skin.ray([0, chestGem.y, 1.2], [0, 0, -1]);
  const ruffFilter = (h: { at: THREE.Vector3 }) => h.at.distanceTo(chestGem) > 0.2;
  const chestHits = skin.scatter(150, {
    rng: R,
    minDist: 0.052,
    filter: (h) => ruffFilter(h) && h.at.y > 0.88 && h.at.y < 1.4 && h.n.z > 0.15 && h.n.y < 0.75,
  });
  b.cards(chestHits, RUFF_GOLD, { size: [0.075, 0.2], lean: 62, bend: 22, vary: 0.25, rng: R, spin: 6 });
  const mantleHits = skin.scatter(170, {
    rng: R,
    minDist: 0.05,
    filter: (h) => h.at.y > 0.9 && (h.n.z < 0.15 || h.n.y > 0.75) && h.n.y > -0.2 && h.at.z < 0.45,
  });
  b.cards(mantleHits, [RUFF, RUFF, RUFF_DEEP], { size: [0.075, 0.2], lean: 62, bend: 22, vary: 0.25, rng: R, spin: 6 });
  const neckHits = skin.scatter(70, {
    rng: R,
    minDist: 0.04,
    filter: (h) => h.at.y > 1.42 && h.at.y < 1.72 && h.n.z > -0.3,
  });
  b.cards(neckHits, RUFF_GOLD, { size: [0.06, 0.15], lean: 66, bend: 20, vary: 0.2, rng: R });

  // chest jewel and filigree
  if (chestHit) {
    b.decal(skin, FILIGREE, { at: chestHit, size: [0.36, 0.3], segments: 16, up: [0, 1, 0.1] });
    glow(b.stick(new THREE.OctahedronGeometry(0.052, 0), RUBY, chestHit, { embed: 0.15, scale: [1, 1.35, 1] }), 1.4);
    glow(b.stick(new THREE.OctahedronGeometry(0.02, 0), HOT, chestHit.moved([0, 0.035, 0]), { embed: 0.1 }), 1.5);
    b.lathe(
      [
        [0.045, -0.004],
        [0.074, -0.004],
        [0.074, 0.012],
        [0.056, 0.022],
        [0.046, 0.014],
      ],
      { at: chestHit.moved([0, -0.01, 0]), axis: chestHit.axis, segments: 10, color: GOLD },
    );
    b.ring(chestHit, { count: 8, radius: 0.085 }, (it) => b.spike(it, it, 0.03, 0.01, { color: GOLD }));
  }

  // collar with pendant tassels around the neck
  const collarLoop = skin.loop(neck.at(0.3), { lift: 0.012 });
  b.sweep(collarLoop, 0.015, { color: GOLD, bone: neck.joints[0], sides: 6 });
  const collarEdge = skin.loop(neck.at(0.36), { lift: 0.008 });
  b.sweep(collarEdge, 0.009, { color: GOLD, bone: neck.joints[0], sides: 6 });
  const front = skin.around(neck.at(0.3).at).at(0, -5);
  if (front) {
    glow(b.stick(new THREE.OctahedronGeometry(0.03, 0), RUBY, front, { embed: 0.15, scale: [1, 1.4, 1] }), 1.3);
    b.stick(new THREE.CylinderGeometry(0.04, 0.045, 0.012, 6), GOLD, front, { embed: 0.5 });
    for (const s of [-1, 0, 1]) {
      b.cards([frame(front.at.clone().add(V(s * 0.06, -0.04 - Math.abs(s) * 0.01, 0.03)), [0, 1, 0])], TASSEL, {
        size: [0.04, 0.17],
        lean: 180,
        flow: [0, 0, 1],
        cross: true,
        bone: neck.joints[0],
      });
    }
  }

  // ---- Glowing pyro flame tips ------------------------------------------------------------------------------
  glow(
    b.cards(flameFrames, FLAME, {
      size: [0.085, 0.2],
      cross: true,
      flow: [0, 0, -1],
      vary: 0.3,
      rng: R,
    }),
    1.2,
  );

  return b.root;
}
