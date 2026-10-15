```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, bezier, mix, noise, cells, paint, smoothstep, svg, DEG } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Kraken, Rising",
  description:
    "A hero-shooter style kraken heaving out of the sea: bulbous purple mantle with a glowing sigil, angry amber eyes, hooked beak, golden horns, finned crest, eight splayed tentacles with gilded cuffs, suckers and glowing tips, and two raised feeder arms.",
};

// ---------- palette
const INDIGO = "#241a63";
const PURPLE_DK = "#3d2a8a";
const PURPLE = "#6a43c8";
const PURPLE_LT = "#9468f0";
const LAV = "#c9b3ff";
const BELLY = "#f8c6d6";
const BELLY_DK = "#d78fb4";
const TEAL = "#2fe6d8";
const TEAL_DK = "#118a86";
const CYAN = "#8dfff2";
const ORANGE = "#ff9a2e";
const AMBER = "#ffd04a";
const CORAL_A = "#ff6a55";
const CORAL_B = "#ffb08a";
const CREAM = "#fff0d2";
const EYEWHITE = "#fff1cf";
const LID = "#3a2780";
const WEBA = "#8f6df0";
const WEBB = "#d9a8ff";
const BARN = "#ded6c4";
const BARN2 = "#b0a68f";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const keyed = (keys: number[], t: number) => {
  const x = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
  const i = Math.min(Math.floor(x), keys.length - 2);
  return keys[i] + (keys[i + 1] - keys[i]) * (x - i);
};
const tentR = (t: number) => 0.04 + 0.36 * Math.pow(1 - t, 1.5);
const feedR = (t: number) => 0.13 - 0.07 * t + 0.11 * Math.exp(-(((t - 0.88) / 0.07) ** 2));

// ---------- paints
const bodyCore = paint((p, n) => {
  let c = mix(mix(INDIGO, PURPLE, smoothstep(-0.9, 0.05, n.y)), PURPLE_LT, 0.85 * smoothstep(0.3, 1, n.y));
  c = mix(c, INDIGO, 0.5 * smoothstep(0.6, 0.72, noise(p, 0.45, 3)));
  const cl = cells(p, 0.2, 7);
  if (n.y > -0.05 && cl.d1 < 0.14 + 0.05 * cl.id) c = mix(c, LAV, 0.55);
  return mix(c, mix(BELLY_DK, BELLY, noise(p, 0.3, 9)), smoothstep(-0.2, -0.5, n.y));
});

const tentPaint = paint((p, n, s) => {
  const c = bodyCore.at(p, n);
  const d = Math.min(Math.abs(s[1]), Math.abs(s[1] - 360), Math.abs(s[1] + 360));
  let out = c;
  if (d < 11 && s[0] > 0.12 && s[0] < 0.8 && (s[0] * 30) % 1 < 0.5) out = mix(c, TEAL, 0.75);
  return mix(out, TEAL, smoothstep(0.8, 0.97, s[0]));
});

const webPaint = paint((_p, _n, s) => {
  const v = Math.abs(Math.sin(s[1] * Math.PI * 6));
  const c = mix(WEBA, WEBB, smoothstep(0.75, 1, v));
  return mix(PURPLE_DK, c, smoothstep(0, 0.35, s[0]));
});

const finPaint = paint((_p, _n, s) => {
  const r = Math.hypot(s[0], s[1]);
  const ang = Math.atan2(s[1], s[0]);
  const ray = Math.abs(Math.sin(ang * 9));
  let c = mix(TEAL_DK, TEAL, smoothstep(0.2, 1.6, s[0]));
  c = mix(c, CYAN, 0.6 * smoothstep(0.82, 1, ray) * smoothstep(0.3, 0.8, r));
  return mix(c, PURPLE_LT, 0.5 * smoothstep(1.35, 1.7, s[0]));
});

const beakPaint = paint((_p, _n, s) => mix("#33244f", ORANGE, smoothstep(0.35, 0.62, s[0])));
const hornPaint = paint((_p, _n, s) => {
  const c = mix(CREAM, AMBER, smoothstep(0.1, 1, s[0]));
  return (s[0] * 9) % 1 < 0.13 ? mix(c, "#b8742a", 0.6) : c;
});
const coralPaint = paint((_p, _n, s) => mix(CORAL_A, CORAL_B, smoothstep(0, 0.65, s[0] * 0.6 + s[1] * 0.7)));
const suckerPaint = paint((_p, _n, s) => (s[1] > 0.72 ? "#c9607f" : "#ffd2c8"));

const GILT = metal("gilt");
const IRON = metal("iron", { tarnish: 0.6, verdigris: 0.3 });

export default function build() {
  const b = createBuilder({ name: "kraken" });
  type SweepT = ReturnType<typeof b.sweep>;
  type ChainT = ReturnType<typeof b.chain>;

  // ---------- textures
  let ticks = "";
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2;
    ticks += `<path d="M${(50 + 20 * Math.cos(a)).toFixed(1)} ${(50 + 20 * Math.sin(a)).toFixed(1)} L${(50 + 39 * Math.cos(a)).toFixed(1)} ${(50 + 39 * Math.sin(a)).toFixed(1)}" stroke="#b5330c" stroke-width="1.3" opacity="0.7"/>`;
  }
  const EYE = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="i" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe35a"/><stop offset="0.6" stop-color="#ff9a1f"/><stop offset="1" stop-color="#d9460f"/></radialGradient></defs>
      <circle cx="50" cy="50" r="47" fill="#1b1140"/>
      <circle cx="50" cy="50" r="42" fill="url(#i)"/>
      ${ticks}
      <path d="M50 12 C68 30 68 70 50 88 C32 70 32 30 50 12Z" fill="#150b2c"/>
      <ellipse cx="35" cy="34" rx="7" ry="10" fill="#fff" transform="rotate(-25 35 34)"/>
      <circle cx="64" cy="66" r="3.5" fill="#fff" opacity="0.9"/>
    </svg>`,
    { size: 256 },
  );

  const SIGIL = svg(
    `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#58ffee" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="50" cy="70" r="44" stroke-width="4"/>
      <circle cx="50" cy="70" r="35" stroke-width="3" stroke-dasharray="6 5"/>
      <path d="M16 70 Q50 36 84 70 Q50 104 16 70Z" stroke-width="4"/>
      <circle cx="50" cy="70" r="12" stroke-width="3"/>
      <ellipse cx="50" cy="70" rx="4.5" ry="12" fill="#58ffee" stroke="none"/>
      <path d="M34 16 L50 3 L66 16" stroke-width="4"/>
      <path d="M39 26 L50 15 L61 26" stroke-width="3.5"/>
      <path d="M50 116 L50 128" stroke-width="4"/>
      <circle cx="28" cy="122" r="3" fill="#58ffee" stroke="none"/>
      <circle cx="72" cy="122" r="3" fill="#58ffee" stroke="none"/>
    </svg>`,
    { size: 512 },
  );

  let sp = "";
  for (let k = 0; k <= 60; k++) {
    const th = k * 0.25;
    const rr = 3 + th * 2.6;
    sp += `${k ? "L" : "M"}${(50 + rr * Math.cos(th)).toFixed(1)} ${(50 + rr * Math.sin(th)).toFixed(1)}`;
  }
  const BACKGLYPH = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#58ffee" stroke-linecap="round">
      <path d="${sp}" stroke-width="4.5"/>
      <circle cx="50" cy="50" r="47" stroke-width="3" stroke-dasharray="3 7"/>
      <circle cx="50" cy="3" r="3" fill="#58ffee" stroke="none"/>
      <circle cx="97" cy="50" r="3" fill="#58ffee" stroke="none"/>
      <circle cx="3" cy="50" r="3" fill="#58ffee" stroke="none"/>
    </svg>`,
    { size: 256 },
  );

  const WARPAINT = svg(
    `<svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#58ffee" stroke-width="8" stroke-linecap="round">
      <path d="M14 10 L30 70"/><path d="M44 8 L58 70"/><path d="M76 12 L86 62"/>
    </svg>`,
    { size: 256 },
  );

  // ---------- skeleton
  const root = b.joint("root", { at: [0, 1.8, 0.1], role: "spine" });
  const mantle = b.chain(
    "mantle",
    catmull([
      [0, 1.75, 0.15],
      [0, 2.45, -0.05],
      [0, 3.35, -0.5],
      [0, 4.2, -1.0],
      [0, 4.85, -1.45],
    ]),
    { parent: root, names: ["mantle1", "mantle2", "mantle3", "mantle4", "mantleTip"], role: "spine" },
  );
  const head = b.joint("head", { parent: root, at: [0, 2.2, 0.35], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.38, 0.8], aim: [0, 1.32, 1.5], role: "jaw" });

  // ---------- mantle body
  const MR = [0.86, 1.12, 1.1, 0.92, 0.62, 0.3, 0.05];
  const body = b.sweep(mantle, (t) => [keyed(MR, t) * 1.02, keyed(MR, t) * 0.96], {
    color: bodyCore,
    sides: 12,
    name: "mantleBody",
  });
  const skin = b.surface(body);
  const front = (x: number, y: number) => {
    const h = skin.ray([x, y, 5], [0, 0, -1]);
    if (!h) throw new Error(`no front hit at ${x},${y}`);
    return h;
  };
  const side = (s: number, y: number, z: number) => {
    const h = skin.ray([s * 5, y, z], [-s, 0, 0]);
    if (!h) throw new Error(`no side hit at ${s},${y},${z}`);
    return h;
  };

  // ---------- face
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const h = front(s * 0.58, 2.3);
    const c = h.at.clone().addScaledVector(h.n, 0.05);
    const ball = b.part(new THREE.SphereGeometry(0.31, 14, 10), EYEWHITE, { bone: head, at: c, name: `eyeball${S}` });
    const gaze = V(s * 0.28, 0.02, 1).normalize();
    glow(
      b.decal(ball, EYE, {
        at: c.clone().addScaledVector(gaze, 0.31),
        dir: gaze,
        size: [0.5, 0.5],
        mirror: s > 0,
        bone: head,
        name: `eyeIris${S}`,
      }),
      0.9,
    );
    b.part(new THREE.SphereGeometry(0.33, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.3), LID, {
      bone: head,
      at: c,
      dir: V(-s * 0.55, 1, 0.45).normalize(),
      name: `lid${S}`,
    });
    // brow ridge, inner end low for a scowl
    const bi = front(s * 0.14, 2.7);
    const bm = front(s * 0.55, 2.84);
    const bo = front(s * 1.0, 2.92);
    const lift = (hh: typeof bi) => hh.at.clone().addScaledVector(hh.n, 0.05);
    b.sweep(catmull([lift(bi), lift(bm), lift(bo)]), [0.11, 0.06], {
      bone: head,
      color: INDIGO,
      sides: 8,
      name: `brow${S}`,
    });
    // war paint
    const wp = front(s * 0.78, 1.92);
    glow(
      b.decal(body, WARPAINT, {
        at: wp,
        size: [0.55, 0.44],
        mirror: s > 0,
        bone: head,
        name: `warpaint${S}`,
      }),
      1,
    );
  }

  // beak
  const bh = front(0, 1.5);
  const bz = bh.at.z - 0.28;
  b.extrude(
    [
      [0, 0.22],
      [0.32, 0.2],
      [0.52, 0.0],
      [0.64, -0.24],
      [0.5, -0.16],
      [0.3, -0.08],
      [0, -0.02],
    ],
    { at: [0, 1.52, bz], thickness: 0.34, bevel: 0.035, color: beakPaint, bone: head, name: "beakUpper" },
  );
  b.extrude(
    [
      [0, -0.12],
      [0.4, -0.12],
      [0.55, 0.1],
      [0.35, 0.0],
      [0, 0.02],
    ],
    { at: [0, 1.4, bz + 0.02], thickness: 0.26, bevel: 0.03, color: beakPaint, bone: jaw, name: "beakLower" },
  );

  // sigil on the forehead, glyph on the back
  glow(b.decal(body, SIGIL, { at: front(0, 3.6), size: [1.0, 1.3], name: "sigil" }), 1);
  const backHit = skin.ray([0, 3.4, -5], [0, 0, 1]);
  if (!backHit) throw new Error("no back hit");
  glow(b.decal(body, BACKGLYPH, { at: backHit, size: [1.0, 1.0], name: "backGlyph" }), 1);

  // horns
  for (const s of [1, -1]) {
    const h = side(s, 2.7, 0.15);
    const B = h.at.clone();
    const path = bezier(
      B.clone(),
      B.clone().add(V(s * 0.8, 0.05, 0.3)),
      B.clone().add(V(s * 1.35, 0.8, 0.55)),
      B.clone().add(V(s * 1.0, 1.75, 0.35)),
    );
    b.sprout(`horn${s > 0 ? "L" : "R"}`, h, path, [0.17, 0.0], { count: 0, color: hornPaint, caps: { end: "point" }, sides: 8 });
  }

  // ---------- fins, crest, coral
  const finDir = V(0, 0.84, -0.54).normalize();
  for (const s of [1, -1]) {
    const h = side(s, 3.55, -0.7);
    b.extrude(
      [
        [0, -0.55],
        [0.7, -0.5],
        [1.55, -0.1],
        [1.7, 0.25],
        [1.1, 0.6],
        [0.5, 0.85],
        [0, 0.8],
      ],
      {
        at: [h.at.x - s * 0.18, h.at.y, h.at.z],
        x: [s, 0, 0],
        y: finDir,
        thickness: [0.07, 0.025],
        bevel: 0.015,
        color: finPaint,
        bone: mantle.joints[2],
        name: `fin${s > 0 ? "L" : "R"}`,
      },
    );
  }
  b.along(
    body,
    7,
    (at) => {
      b.spike(at, at, 0.5 * (1 - at.t * 0.6), 0.1, { color: TEAL_DK, sides: 6 });
    },
    { from: 0.2, to: 0.88 },
  );

  const FAN: [number, number][] = [
    [0, -0.12],
    [0.25, -0.15],
    [0.55, 0.05],
    [0.62, 0.35],
    [0.45, 0.3],
    [0.4, 0.55],
    [0.28, 0.4],
    [0.15, 0.62],
    [0.05, 0.25],
  ];
  const coral = (s: number, y: number, z: number, sc: number) => {
    const h = side(s, y, z);
    b.extrude(
      FAN.map(([x, yy]) => [x * sc, yy * sc] as [number, number]),
      {
        at: [h.at.x - s * 0.1, h.at.y, h.at.z],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.05,
        bevel: 0.01,
        color: coralPaint,
        bone: mantle.joints[1],
        name: "coralFan",
      },
    );
  };
  coral(1, 3.0, -0.15, 1.1);
  coral(-1, 3.0, -0.15, 1.1);
  coral(1, 2.55, -0.5, 0.8);

  // dorsal glowing spots
  const r = rng(11);
  const dots = skin.scatter(34, {
    rng: rng(11),
    minDist: 0.34,
    filter: (h) =>
      h.at.y > 2.7 && h.n.y > -0.05 && (Math.abs(h.n.x) > 0.45 || h.n.z < 0) && h.at.distanceTo(backHit.at) > 0.8,
  });
  for (const h of dots) {
    const rr = 0.05 + 0.05 * r();
    glow(b.stick(new THREE.CylinderGeometry(rr, rr * 1.15, 0.05, 6), TEAL, h, { embed: 0.35 }), 1.2);
  }

  // barnacles on the left flank
  const rb = rng(21);
  const clusters = skin.scatter(7, {
    rng: rng(21),
    minDist: 0.6,
    filter: (h) => h.n.x > 0.6 && h.at.y > 1.8 && h.at.y < 3.2,
  });
  for (const c of clusters) {
    for (let j = 0; j < 4; j++) {
      const p = c.at.clone().add(V((rb() - 0.5) * 0.24, (rb() - 0.5) * 0.24, (rb() - 0.5) * 0.24));
      const hh = skin.nearest(p);
      b.stick(new THREE.CylinderGeometry(0.035, 0.075, 0.12, 7), j % 2 ? BARN : BARN2, hh, {
        embed: 0.2,
        scale: 0.7 + rb() * 0.7,
      });
    }
  }

  // embedded anchor on the right flank
  {
    const ah = side(-1, 2.25, -0.3);
    const SC = 0.9;
    const ay = V(0, 0.6, 0.8).normalize();
    const ax = V(0, 0.8, -0.6).normalize();
    const O = ah.at.clone().add(V(-0.03, 0, 0));
    const ANCHOR: [number, number][] = [
      [-0.22, 0.54],
      [0.22, 0.54],
      [0.22, 0.46],
      [0.04, 0.46],
      [0.04, -0.3],
      [0.2, -0.22],
      [0.3, -0.08],
      [0.42, -0.1],
      [0.36, -0.32],
      [0.2, -0.5],
      [0, -0.58],
      [-0.2, -0.5],
      [-0.36, -0.32],
      [-0.42, -0.1],
      [-0.3, -0.08],
      [-0.2, -0.22],
      [-0.04, -0.3],
      [-0.04, 0.46],
      [-0.22, 0.46],
    ];
    b.extrude(
      ANCHOR.map(([x, y]) => [x * SC, y * SC] as [number, number]),
      { at: O, x: ax, y: ay, thickness: 0.09, bevel: 0.012, color: IRON, bone: mantle.joints[1], name: "anchor" },
    );
    b.part(new THREE.TorusGeometry(0.11 * SC, 0.03, 6, 12), IRON, {
      at: O.clone().addScaledVector(ay, 0.66 * SC),
      dir: [1, 0, 0],
      axis: "z",
      bone: mantle.joints[1],
      name: "anchorRing",
    });
  }

  // ---------- suckers, cuffs
  const suckerGeo = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(1, 0),
      new THREE.Vector2(1, 0.4),
      new THREE.Vector2(0.62, 0.3),
      new THREE.Vector2(0.4, 0.04),
      new THREE.Vector2(0, 0.12),
    ],
    8,
  );
  const addSuckers = (sw: SweepT, t0: number, t1: number, n: number, angs: number[], maxR: number) => {
    angs.forEach((ang, row) => {
      for (let i = 0; i < n; i++) {
        const t = t0 + ((t1 - t0) * (i + 0.5 + (row % 2) * 0.4 - 0.2)) / n;
        const h = sw.at(t, ang);
        const rr = Math.min(h.radius * 0.5, maxR);
        b.stick(suckerGeo, suckerPaint, h, { embed: 0.3, scale: rr });
      }
    });
  };
  const cuff = (chain: ChainT, sw: SweepT, t: number, half: number, gem: boolean) => {
    const cp = chain.at(t);
    const R = tentR(t) * 1.07;
    b.lathe(
      [
        [R - 0.06, -half],
        [R, -half],
        [R + 0.05, -half * 0.7],
        [R + 0.05, half * 0.7],
        [R, half],
        [R - 0.06, half],
      ],
      { at: cp, axis: cp.axis, segments: 10, color: GILT, name: "cuff" },
    );
    if (gem) {
      const base = sw.at(t, 0);
      const g = sw.at(t, 0, R + 0.04 - base.radius);
      glow(b.stick(new THREE.OctahedronGeometry(0.075, 0), TEAL, g, { embed: 0.3 }), 1.4);
    }
  };

  // ---------- eight tentacles
  type Tent = { chain: ChainT; sweep: SweepT };
  const TL: Tent[] = [];
  const TR: Tent[] = [];
  const ANG = [28, 73, 118, 160];
  const WID = [0.9, 1.0, 0.2, -0.9];
  const LEN = [0.92, 1.05, 1.12, 0.96];
  const U = [0.35, 1.15, 2.1, 3.1, 4.2, 5.2, 6.0, 6.35, 6.0];
  const LAT = [0, 0, 0.1, 0.3, 0.55, 0.8, 1.2, 1.6, 1.8];
  const HY = [1.45, 1.3, 0.82, 0, 0, 0, 0.72, 1.55, 2.4];

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    ANG.forEach((deg, i) => {
      const a = s * deg * DEG;
      const dx = Math.sin(a);
      const dz = Math.cos(a);
      const px = Math.cos(a);
      const pz = -Math.sin(a);
      const mk = (ys: number[]) =>
        U.map((u, k) => {
          const uu = u * LEN[i];
          const lat = LAT[k] * WID[i] * s;
          const y = k === 3 ? ys[0] : k === 4 ? ys[1] : k === 5 ? ys[2] : HY[k];
          return [dx * uu + px * lat, y, dz * uu + pz * lat];
        });
      let ys = [0.21, 0.16, 0.12];
      let pts = mk(ys);
      let path = catmull(pts);
      for (let it = 0; it < 4; it++) {
        ys = [3, 4, 5].map((k) => tentR(path.closestT(pts[k])) * 0.94);
        pts = mk(ys);
        path = catmull(pts);
      }
      const chain = b.chain(`tent${S}${i + 1}`, path, {
        parent: root,
        names: Array.from({ length: 9 }, (_, j) => `tent${S}${i + 1}_${j + 1}`),
        role: "tentacle",
      });
      const sw = b.sweep(chain, tentR, { color: tentPaint, sides: 10, name: `tentacle${S}${i + 1}` });
      (s > 0 ? TL : TR).push({ chain, sweep: sw });
      cuff(chain, sw, 0.12, 0.12, true);
      cuff(chain, sw, 0.2, 0.05, false);
      addSuckers(sw, 0.28, 0.88, 9, [62, -62], 0.13);
      const tipPt = pts[8];
      glow(
        b.part(new THREE.IcosahedronGeometry(0.11, 0), CYAN, {
          at: tipPt,
          bone: chain.joints[chain.joints.length - 1],
          name: `tipOrb${S}${i + 1}`,
        }),
        1.5,
      );
    });
  }

  // webbing between the tentacle roots
  const wts = [0.05, 0.1, 0.16, 0.22, 0.28, 0.34];
  const web = (A: Tent, B: Tent) =>
    b.membrane(
      catmull(wts.map((t) => A.chain.at(t))),
      catmull(wts.map((t) => B.chain.at(t))),
      { color: webPaint, thickness: 0.04, name: "web" },
    );
  for (let i = 0; i < 3; i++) {
    web(TL[i], TL[i + 1]);
    web(TR[i], TR[i + 1]);
  }
  web(TL[3], TR[3]);

  // ---------- raised feeder arms
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = [
      [s * 0.35, 1.55, 0.85],
      [s * 0.9, 1.5, 1.35],
      [s * 1.8, 1.8, 1.7],
      [s * 2.6, 2.6, 1.6],
      [s * 3.0, 3.6, 1.2],
      [s * 2.9, 4.4, 0.8],
      [s * 2.5, 4.8, 0.5],
    ];
    const chain = b.chain(`feeder${S}`, catmull(pts), {
      parent: root,
      names: Array.from({ length: 7 }, (_, j) => `feeder${S}_${j + 1}`),
      role: "tentacle",
    });
    const sw = b.sweep(chain, feedR, { color: tentPaint, sides: 8, name: `feeder${S}` });
    addSuckers(sw, 0.5, 0.95, 6, [62, -62], 0.09);
    cuff(chain, sw, 0.1, 0.06, true);
  }

  return b.root;
}
```