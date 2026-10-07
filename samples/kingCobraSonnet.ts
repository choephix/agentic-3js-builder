import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { DEG } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import { mix, paint, scales, smoothstep } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "King Cobra, Rearing (Arcane Jade)",
  description:
    "A rearing king cobra with a huge flared hood, jade-and-gold chevron scales, a glowing cyan hood rim, rune throat, dorsal crystal crest and back-swept horns, in a League of Legends style.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------- palette ----------
const JADE = "#0e6a73";
const JADE_D = "#07343f";
const JADE_L = "#1f9a9a";
const GOLD = "#ffc43a";
const GOLD_D = "#c47f12";
const CREAM = "#fff0bd";
const BELLY = "#ffd776";
const BELLY_D = "#d99a2c";
const CYAN = "#3df5ff";
const AMBER = "#ffa514";
const MOUTH = "#6b0f3c";
const TONGUE = "#ff3b7a";
const FANG = "#fff8e2";
const BLACK = "#080d12";

// ---------- helpers ----------
function interp(tab: number[][], x: number) {
  if (x <= tab[0][0]) return tab[0][1];
  for (let i = 1; i < tab.length; i++) {
    if (x <= tab[i][0]) {
      const k = (x - tab[i - 1][0]) / (tab[i][0] - tab[i - 1][0]);
      const e = k * k * (3 - 2 * k);
      return tab[i - 1][1] + (tab[i][1] - tab[i - 1][1]) * e;
    }
  }
  return tab[tab.length - 1][1];
}
const sm = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const TAIL_R = [
  [0, 0.011],
  [0.45, 0.028],
  [1.3, 0.066],
  [2.3, 0.092],
  [9, 0.098],
];
const HEAD_R = [
  [0, 0.064],
  [0.3, 0.06],
  [0.8, 0.066],
  [1.3, 0.074],
  [1.9, 0.086],
  [2.7, 0.098],
  [9, 0.098],
];

// ---------- drawings ----------
const EYE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#ff8a00"/>
    <circle cx="50" cy="50" r="40" fill="#ffc21f"/>
    <circle cx="50" cy="50" r="30" fill="#ffe36a"/>
    <ellipse cx="50" cy="50" rx="13" ry="25" fill="#0a0508"/>
    <circle cx="40" cy="38" r="6" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

const SPECTACLE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="42" fill="none" stroke="#3df5ff" stroke-width="7"/>
    <circle cx="50" cy="50" r="27" fill="none" stroke="#3df5ff" stroke-width="5"/>
    <circle cx="50" cy="50" r="10" fill="#3df5ff"/>
    <g stroke="#3df5ff" stroke-width="5" stroke-linecap="round">
      <line x1="50" y1="3" x2="50" y2="15"/><line x1="50" y1="85" x2="50" y2="97"/>
      <line x1="3" y1="50" x2="15" y2="50"/><line x1="85" y1="50" x2="97" y2="50"/>
      <line x1="17" y1="17" x2="25" y2="25"/><line x1="83" y1="17" x2="75" y2="25"/>
      <line x1="17" y1="83" x2="25" y2="75"/><line x1="83" y1="83" x2="75" y2="75"/>
    </g>
  </svg>`,
  { size: 256 },
);


export default function build() {
  const b = createBuilder({ name: "kingCobra" });

  // ================= body path (tail tip -> head base) =================
  const LAM = 2.2;
  const A0 = 0.6;
  const UMAX = 2.45;
  const ZB = 0.34;
  const ground: number[][] = [];
  const us: number[] = [];
  for (let u = UMAX; u > 0.001; u -= 0.11) us.push(u);
  us.push(0);
  let dd = 0;
  let prev: number[] | null = null;
  for (const u of us) {
    const amp = A0 * sm(0, 0.5, u) * (1 - 0.35 * sm(1.4, UMAX, u));
    const x = amp * Math.sin((2 * Math.PI * u) / LAM);
    const z = ZB - u;
    if (prev) dd += Math.hypot(x - prev[0], z - prev[1]);
    prev = [x, z];
    const r = interp(TAIL_R, dd);
    const flick = 0.5 * Math.pow(Math.max(0, 1 - dd / 0.6), 2);
    ground.push([x, r * 0.98 + flick, z]);
  }
  const rise = [
    [0.1, 0.46],
    [0.22, 0.63],
    [0.5, 0.74],
    [0.82, 0.64],
    [1.1, 0.46],
    [1.32, 0.33],
    [1.47, 0.33],
    [1.57, 0.41],
    [1.6, 0.55],
  ].map(([y, z]) => [0, y, z]);
  const pts = [...ground, ...rise];
  const body = catmull(pts);
  const L = body.length;
  const rad = (t: number) => Math.min(interp(TAIL_R, t * L), interp(HEAD_R, (1 - t) * L));

  // ================= skeleton =================
  const corePt = ground[ground.length - 1];
  const coreT = body.closestT(corePt);
  const core = b.joint("core", { at: corePt, dir: [0, 0.2, 1], role: "spine" });
  const neck = b.chain("neck", body.slice(coreT, 1), { parent: core, count: 9, role: "neck" });
  const tT = body.closestT(ground[Math.round(ground.length * 0.42)]);
  const spine = b.chain("spine", body.slice(coreT, tT), { parent: core, count: 9, role: "spine" });
  const tail = b.chain("tail", body.slice(tT, 0), {
    parent: spine.joints[spine.joints.length - 1],
    count: 11,
    role: "tail",
  });

  // ---------- body paint ----------
  const P = 0.2;
  const darkScales = scales(JADE, JADE_D, { size: 0.05, width: 0.14 });
  const goldScales = scales(GOLD, GOLD_D, { size: 0.05, width: 0.14 });
  const bodyPaint = paint((_p, _n, s) => {
    const d = s[0] * L;
    const raw = ((s[1] % 360) + 360) % 360;
    const a = raw > 180 ? 360 - raw : raw;
    if (a > 146) {
      const sc = (((d / 0.055) % 1) + 1) % 1;
      return sc < 0.13 ? BELLY_D : BELLY;
    }
    if (a > 100) return mix(JADE_L, BELLY, smoothstep(104, 148, a));
    const ph = ((((d + 0.0016 * a) / P) % 1) + 1) % 1;
    if (ph < 0.15) return goldScales;
    if (ph < 0.21) return JADE_D;
    return darkScales;
  });

  const bodyS = b.sweep(body, rad, { bone: [tail, spine, core, neck], color: bodyPaint });

  // ================= head =================
  const HS = 1.3;
  const neckEnd = neck.joints[neck.joints.length - 1];
  const head = b.joint("head", { parent: neckEnd, at: body.at(1), dir: [0, -0.2, 1], role: "head" });
  const hp = (o: { forward?: number; up?: number; down?: number; left?: number }) =>
    head.local({
      forward: (o.forward ?? 0) * HS,
      up: (o.up ?? 0) * HS,
      down: (o.down ?? 0) * HS,
      left: (o.left ?? 0) * HS,
    });
  const jaw = b.joint("jaw", {
    parent: head,
    at: hp({ forward: 0.03, down: 0.05 }),
    aim: hp({ forward: 0.3, down: 0.05 }),
    role: "jaw",
  });

  // station tables: forward, up, width, height (scaled by HS)
  const UP = [
    [-0.05, 0.0, 0.13, 0.115],
    [0.04, 0.008, 0.19, 0.13],
    [0.13, 0.012, 0.21, 0.125],
    [0.21, 0.006, 0.16, 0.105],
    [0.29, -0.004, 0.115, 0.088],
    [0.355, -0.012, 0.09, 0.072],
  ].map((r) => r.map((v) => v * HS));
  const LOW = [
    [0.0, -0.06, 0.15, 0.05],
    [0.09, -0.066, 0.17, 0.054],
    [0.19, -0.062, 0.13, 0.046],
    [0.28, -0.056, 0.093, 0.038],
    [0.345, -0.05, 0.07, 0.032],
  ].map((r) => r.map((v) => v * HS));
  const at4 = (tab: number[][], f: number) => {
    let i = 1;
    while (i < tab.length - 1 && f > tab[i][0]) i++;
    const a = tab[i - 1];
    const c = tab[i];
    const k = Math.min(1, Math.max(0, (f - a[0]) / (c[0] - a[0])));
    return { u: a[1] + (c[1] - a[1]) * k, w: a[2] + (c[2] - a[2]) * k, h: a[3] + (c[3] - a[3]) * k };
  };

  const headScales = scales(JADE, JADE_D, { size: 0.042, width: 0.16 });
  const headPaint = paint((_p, _n, s) => {
    const raw = ((s[1] % 360) + 360) % 360;
    const a = raw > 180 ? 360 - raw : raw;
    if (a > 150) return MOUTH;
    if (a > 118) return CREAM;
    if (a > 108) return BLACK;
    if (a > 85) return mix(JADE_L, CREAM, smoothstep(88, 108, a));
    return headScales;
  });

  const skull = b.loft(
    UP.map(([f, u, w, h]) => ({ at: head.local({ forward: f, up: u }), w, h })),
    { bone: head, color: headPaint },
  );
  b.loft(
    LOW.map(([f, u, w, h]) => ({ at: head.local({ forward: f, up: u }), w, h })),
    {
      bone: jaw,
      color: BELLY,
      sectors: [
        [-75, 75, MOUTH],
        [75, 105, CREAM],
        [-105, -75, CREAM],
      ],
    },
  );

  // brow ridges, nostrils, crest horns, eyes
  for (const sx of [1, -1]) {
    b.sweep(
      [
        hp({ forward: 0.25, up: 0.05, left: sx * 0.055 }),
        hp({ forward: 0.16, up: 0.078, left: sx * 0.09 }),
        hp({ forward: 0.06, up: 0.082, left: sx * 0.095 }),
      ],
      [0.01, 0.02],
      { bone: head, color: GOLD, caps: { start: "point", end: "round" }, sides: 6 },
    );
    glow(
      b.decal(skull, EYE, {
        at: hp({ forward: 0.15, up: 0.022, left: sx * 0.1 }),
        dir: [sx, 0.05, 0.35],
        up: [0, 1, 0],
        size: [0.1, 0.1],
        segments: 6,
        lift: 0.003,
        bone: head,
      }),
      1,
    );
    b.stick(new THREE.SphereGeometry(0.013, 5, 4), BLACK, b.surface(skull).nearest(hp({ forward: 0.33, up: 0.02, left: sx * 0.028 })), {
      embed: 0.4,
    });

    // swept-back crown horns
    b.sweep(
      bezier(
        hp({ forward: 0.02, up: 0.055, left: sx * 0.065 }),
        hp({ forward: -0.08, up: 0.1, left: sx * 0.1 }),
        hp({ forward: -0.22, up: 0.2, left: sx * 0.15 }),
      ),
      [0.036, 0.0],
      {
        bone: head,
        color: GOLD,
        bands: [
          [0.3, GOLD_D],
          [1, GOLD],
        ],
        caps: { start: "flat", end: "point" },
        sides: 6,
      },
    );
    // cheek spike
    b.spike(hp({ forward: 0.0, down: 0.03, left: sx * 0.09 }), head.dir([sx * 0.9, -0.9, -0.15]), 0.08, 0.022, {
      bone: head,
      color: GOLD,
      sides: 6,
    });
  }
  // brow gem
  glow(
    b.stick(new THREE.OctahedronGeometry(0.03).scale(0.8, 1.7, 1.0), CYAN, b.surface(skull).nearest(hp({ forward: 0.085, up: 0.1 })), {
      embed: 0.35,
    }),
    1.2,
  );

  // teeth and fangs
  for (const sx of [1, -1]) {
    for (let i = 0; i < 6; i++) {
      const f = (0.11 + i * 0.04) * HS;
      const st = at4(UP, f);
      const base = head.local({ forward: f, up: st.u - 0.64 * (st.h / 2), left: sx * 0.77 * (st.w / 2) });
      b.spike(base, head.dir([0, 0, -1]), 0.026, 0.007, { bone: head, color: FANG, sides: 4 });
    }
    for (let i = 0; i < 6; i++) {
      const f = (0.1 + i * 0.045) * HS;
      const st = at4(LOW, f);
      const base = head.local({ forward: f, up: st.u + 0.64 * (st.h / 2), left: sx * 0.77 * (st.w / 2) });
      b.spike(base, head.dir([0, 0, 1]), 0.024, 0.007, { bone: jaw, color: FANG, sides: 4 });
    }
    b.spike(hp({ forward: 0.255, up: -0.026, left: sx * 0.03 }), head.dir([0, -0.22, -1]), 0.14, 0.02, {
      bone: head,
      color: FANG,
      sides: 6,
    });
    glow(
      b.part(new THREE.SphereGeometry(0.011, 5, 4), CYAN, {
        bone: head,
        at: hp({ forward: 0.235, up: -0.145, left: sx * 0.03 }),
        scale: [1, 1.5, 1],
      }),
      1.4,
    );
  }

  // open the mouth slightly
  b.pose(jaw, { axis: [1, 0, 0], deg: 17 });

  // forked tongue
  const tp = [
    hp({ forward: 0.2, down: 0.055 }),
    hp({ forward: 0.34, down: 0.13 }),
    hp({ forward: 0.46, down: 0.15 }),
    hp({ forward: 0.55, down: 0.135 }),
  ];
  const tongue = b.chain("tongue", catmull(tp), { parent: jaw, count: 3, role: "tentacle" });
  b.sweep(tongue, [0.016, 0.01], { color: TONGUE, sides: 6 });
  const tj = tongue.joints[tongue.joints.length - 1];
  for (const sx of [1, -1]) {
    b.sweep(
      bezier(tp[3], hp({ forward: 0.6, down: 0.13, left: sx * 0.015 }), hp({ forward: 0.65, down: 0.105, left: sx * 0.05 })),
      [0.01, 0.0],
      { bone: tj, color: TONGUE, caps: { end: "point" }, sides: 5 },
    );
  }

  // ================= hood =================
  const tTop = body.closestT([0, 1.5, 0.42]);
  const tBot = body.closestT([0, 0.8, 0.52]);
  const WMAX = 0.44;
  const KR = 8;
  const HOOD_PIV = 0.8;
  const hoodPaint = paint((p, n, s) => {
    const dx = Math.abs(p.x);
    const dy = p.y - HOOD_PIV;
    const ang = Math.atan2(dx, dy) / DEG;
    const r = Math.hypot(dx, dy);
    const step = 9;
    const lat = Math.abs(ang - step * Math.round(ang / step)) * DEG * r;
    const edge = s[1];
    if (Math.abs(n.z) < 0.6) return GOLD_D;
    if (n.z > 0) {
      if (edge > 0.93) return JADE_D;
      if (edge > 0.86) return GOLD;
      if (lat < 0.0065 && r > 0.1) return JADE;
      return mix(CREAM, AMBER, smoothstep(0.3, 0.95, edge));
    }
    if (edge > 0.93) return GOLD_D;
    if (edge > 0.86) return GOLD;
    if (lat < 0.005 && r > 0.12) return GOLD_D;
    return backScales;
  });
  const backScales = scales(JADE, JADE_D, { size: 0.045, width: 0.14 });

  const hoods = [];
  for (const sx of [1, -1]) {
    const S = sx > 0 ? "L" : "R";
    const ribPts: number[][] = [];
    for (let i = 0; i <= KR; i++) {
      const u = i / KR;
      const t = tTop + (tBot - tTop) * u;
      const c = body.at(t);
      const w = 0.075 + (WMAX - 0.075) * Math.sin(Math.PI * Math.pow(u, 0.72));
      ribPts.push([c.x + sx * w, c.y + 0.02 * Math.sin(Math.PI * u), c.z - 0.045 * (w / WMAX)]);
    }
    const rib = b.chain(`hood${S}`, catmull(ribPts), {
      parent: neckEnd,
      names: Array.from({ length: KR + 1 }, (_, i) => `hood${S}${i + 1}`),
      role: "fan",
    });
    hoods.push(b.membrane(body.slice(tTop, tBot), rib, { thickness: 0.03, color: hoodPaint, rows: 4 }));
    glow(b.sweep(rib, 0.016, { color: CYAN, sides: 6 }), 1.1);
    // inner echo arc on the front face of the hood
    const echo: number[][] = [];
    for (let i = 1; i < KR; i++) {
      const u = i / KR;
      const c = body.at(tTop + (tBot - tTop) * u);
      const w = 0.075 + (WMAX - 0.075) * Math.sin(Math.PI * Math.pow(u, 0.72));
      echo.push([c.x + sx * w * 0.78, c.y + 0.016 * Math.sin(Math.PI * u), c.z - 0.036 * (w / WMAX) + 0.02]);
    }
    glow(b.sweep(catmull(echo), 0.0065, { color: CYAN, sides: 4, bone: rib }), 0.9);
    // gold spikes along the hood rim
    for (let i = 1; i < rib.joints.length; i++) {
      const j = rib.joints[i];
      const out = [sx * 0.8, i < 3 ? 0.55 : i > 6 ? -0.5 : 0.15, -0.25];
      const len = 0.05 + 0.06 * Math.sin(Math.PI * (i / rib.joints.length));
      b.spike(j, out, len, 0.018, { bone: j, color: GOLD, sides: 5 });
    }
    // upswept hood tips
    const j0 = rib.joints[0];
    const p0 = j0.at;
    b.sweep(
      bezier(p0, [p0.x + sx * 0.08, p0.y + 0.12, p0.z - 0.01], [p0.x + sx * 0.2, p0.y + 0.22, p0.z - 0.1]),
      [0.03, 0.0],
      {
        bone: j0,
        color: GOLD,
        bands: [
          [0.35, GOLD_D],
          [1, GOLD],
        ],
        caps: { start: "flat", end: "point" },
        sides: 6,
      },
    );
  }

  // spectacle glyphs on the back of the hood, rune ladder on the throat
  const tMid = tTop + (tBot - tTop) * 0.4;
  const cMid = body.at(tMid);
  for (const sx of [1, -1]) {
    glow(
      b.decal(hoods, SPECTACLE, {
        at: [cMid.x + sx * 0.2, cMid.y, cMid.z - 0.06],
        dir: [0, 0, -1],
        up: [0, 1, 0],
        size: [0.22, 0.22],
        segments: 8,
        lift: 0.003,
        mirror: sx > 0,
      }),
      1.1,
    );
  }

  // collar of gold rings and a pendant gem under the hood
  const skin = b.surface(bodyS);
  const tCol = body.closestT([0, 0.78, 0.5]);
  for (const [dt, r] of [
    [0, 0.02],
    [0.012, 0.012],
    [-0.012, 0.012],
  ] as const) {
    const tt = tCol + dt;
    const ring = skin.loop(frame(body.at(tt), body.tangentAt(tt)), { lift: 0.006 });
    b.sweep(ring, r, { color: GOLD, sides: 6 });
  }
  const gemHit = skin.ray([0, body.at(tCol).y, 2], [0, 0, -1]);
  if (gemHit) {
    glow(b.stick(new THREE.OctahedronGeometry(0.04).scale(0.8, 1.5, 0.9), CYAN, gemHit, { embed: 0.3 }), 1.2);
    b.stick(new THREE.CylinderGeometry(0.03, 0.04, 0.02, 6), GOLD, gemHit, { embed: 0.3 });
  }
  // glowing rune ladder down the throat, draped onto the skin
  for (let k = 0; k < 5; k++) {
    const tc = body.closestT([0, 0.98 + k * 0.1, 0.44]);
    const c = body.at(tc);
    const chev = [
      [-0.06, -0.045],
      [-0.03, -0.015],
      [0, 0.0],
      [0.03, -0.015],
      [0.06, -0.045],
    ].map(([x, y]) => [c.x + x, c.y + y, c.z + 0.12]);
    glow(b.sweep(skin.drape(polyline(chev), { lift: 0.004 }), 0.0055, { color: CYAN, sides: 5 }), 1.1);
  }

  // luminous dorsal vein, tail tip to hood
  glow(
    b.sweep(bodyS.line(0, 0.004).slice(0.012, tBot), 0.0075, {
      color: "#19c9e6",
      sides: 4,
      bone: [tail, spine, core, neck],
    }),
    0.8,
  );

  // ================= dorsal crystals =================
  for (let k = 0; ; k++) {
    const d = k * P + 0.6 * P;
    if (d > L - 0.28) break;
    if (d < 0.75) continue;
    const g = sm(0, 1, d / L);
    const h = 0.02 + 0.03 * g;
    const hit = bodyS.at(d / L, 0);
    glow(b.stick(new THREE.OctahedronGeometry(h).scale(0.5, 1.6, 0.6), CYAN, hit, { embed: 0.25 }), 1.2);
  }
  // tail-tip crystal
  const tipHit = bodyS.at(0.004, 0);
  glow(b.stick(new THREE.OctahedronGeometry(0.03).scale(0.7, 2.4, 0.7), CYAN, tipHit, { embed: 0.2 }), 1.4);

  // jewelled gold armbands round the thick body
  for (const at of [
    [0, 0.1, ZB - 1.1],
    [0, 0.1, ZB - 2.2],
    [0, 0.55, 0.72],
  ]) {
    const tb = body.closestT(at);
    for (const [dt, r] of [
      [0, 0.016],
      [0.011, 0.01],
      [-0.011, 0.01],
    ] as const) {
      const ring = skin.loop(frame(body.at(tb + dt), body.tangentAt(tb + dt)), { lift: 0.004 });
      b.sweep(ring, r, { color: GOLD, sides: 6 });
    }
    glow(b.stick(new THREE.OctahedronGeometry(0.03).scale(0.8, 1.3, 0.8), CYAN, bodyS.at(tb, 0), { embed: 0.3 }), 1.3);
  }

  return b.root;
}
