```ts
import * as THREE from "three";
import { createBuilder, frame, limb, catmull, bezier, paint, noise, cells, mix, smoothstep, svg, rng } from "agentic-3js-builder";

export const meta = {
  name: "Peacock Mantis Shrimp",
  description:
    "A high-fantasy anime peacock mantis shrimp: emerald armoured rings, jewel-banded stalked eyes with anime shine, crimson raptorial clubs with gold bands, peacock-feather eyespots, glowing runes and a spiky ocellus telson, in a rigged rest pose.",
};

// ---------------------------------------------------------------- palette
const EM = "#17b86b";
const EM_D = "#0a6a56";
const TEAL = "#13c4c0";
const SAPH = "#2b55d9";
const VIOLET = "#7a3fd0";
const CRIM = "#d81f4a";
const ORANGE = "#ff7a1c";
const GOLD = "#ffcf4a";
const CREAM = "#fff1c9";
const BONE = "#f7e8c6";
const INK = "#1d1030";

type V = [number, number, number];
type Outline = Array<[number, number] | [number, number, "sharp"]>;

// ---------------------------------------------------------------- textures
const EYE_TEX = svg(
  `<svg viewBox="0 0 100 100">
  <defs><radialGradient id="i" cx="0.5" cy="0.62" r="0.62">
    <stop offset="0" stop-color="#fff07a"/><stop offset="0.4" stop-color="#ff8a1c"/>
    <stop offset="0.78" stop-color="#d4204a"/><stop offset="1" stop-color="#4a1470"/></radialGradient></defs>
  <circle cx="50" cy="50" r="48" fill="#1d1030"/>
  <circle cx="50" cy="50" r="42" fill="url(#i)"/>
  <ellipse cx="50" cy="50" rx="41" ry="9" fill="#1d1030"/>
  <circle cx="22" cy="50" r="4.5" fill="#ff3b5c"/><circle cx="36" cy="50" r="4.5" fill="#ffd23f"/>
  <circle cx="64" cy="50" r="4.5" fill="#2ee6d6"/><circle cx="78" cy="50" r="4.5" fill="#3b6bff"/>
  <ellipse cx="50" cy="52" rx="10" ry="19" fill="#0d0618"/>
  <ellipse cx="38" cy="30" rx="10" ry="12" fill="#ffffff"/>
  <circle cx="62" cy="68" r="5" fill="#ffffff"/>
  <path d="M63 28 L65 34 L71 36 L65 38 L63 44 L61 38 L55 36 L61 34Z" fill="#ffffff"/>
</svg>`,
  { size: 256 },
);

const OCELLUS = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#1d1030"/>
  <circle cx="50" cy="50" r="42" fill="#7a3fd0"/>
  <circle cx="50" cy="50" r="35" fill="#2b55d9"/>
  <circle cx="50" cy="50" r="28" fill="#13c4c0"/>
  <circle cx="50" cy="50" r="21" fill="#ffcf4a"/>
  <ellipse cx="50" cy="52" rx="14" ry="16" fill="#d81f4a"/>
  <ellipse cx="50" cy="54" rx="8" ry="10" fill="#1d1030"/>
  <ellipse cx="44" cy="46" rx="4" ry="6" fill="#ffffff"/>
  <path d="M50 4 L52 12 L50 20 L48 12Z M50 80 L52 88 L50 96 L48 88Z" fill="#ffe9a0"/>
</svg>`,
  { size: 192 },
);

const RUNE = svg(
  `<svg viewBox="0 0 100 100"><g fill="none" stroke="#ffd34d" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="50" cy="50" r="40"/><path d="M50 12 L50 88"/><path d="M27 33 L50 53 L73 33"/>
  <path d="M30 70 Q50 56 70 70"/><circle cx="50" cy="50" r="7" fill="#ffd34d"/></g></svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------- paints
const shellColor = (p: THREE.Vector3, n: THREE.Vector3, belly: string) => {
  let c = mix(EM_D, EM, smoothstep(-0.2, 0.85, n.y));
  c = mix(c, TEAL, 0.5 * smoothstep(0.5, 0.8, noise(p, 0.02, 3)));
  const flank = smoothstep(0.55, 0.95, Math.abs(n.x)) * (1 - smoothstep(0.2, 0.5, n.y));
  c = mix(c, SAPH, 0.5 * flank);
  return mix(c, belly, smoothstep(-0.15, -0.65, n.y));
};

const ABD_P = paint((p, n, s) => {
  const c = shellColor(p, n, ORANGE);
  const f = (s[0] * 7) % 1;
  return f < 0.07 ? mix(c, CRIM, 0.7) : c;
});
const CARA_P = paint((p, n) => {
  const c = shellColor(p, n, ORANGE);
  if (Math.abs(p.z - 0.014) < 0.0012 && n.y > 0.2) return mix(c, INK, 0.6);
  return mix(c, LIME_HI, 0.18 * smoothstep(0.7, 1, n.y));
});
const LIME_HI = "#9cf27a";
const RING_P = paint((p, n) => mix(shellColor(p, n, ORANGE), GOLD, 0.9 * smoothstep(0.35, 0.7, Math.abs(n.z))));
const ARM_P = paint((p, n, s) => {
  let c = mix(ORANGE, CRIM, smoothstep(0.1, 0.9, s[0]));
  c = mix(c, CREAM, 0.7 * smoothstep(-0.3, -0.9, n.y));
  return mix(c, GOLD, 0.2 * smoothstep(0.5, 1, n.y) * noise(p, 0.006, 2));
});
const CLUB_P = paint((p, n) => {
  let c = mix(CRIM, "#ff5a2a", noise(p, 0.008, 4));
  c = mix(c, "#6a0f30", 0.6 * smoothstep(0.2, -0.8, n.y));
  return mix(c, GOLD, 0.35 * smoothstep(0.55, 1, n.y) * noise(p, 0.004, 9));
});
const LEG_P = paint((p, n) => {
  if (p.y < 0.0075) return CREAM;
  const c = mix(ORANGE, CRIM, smoothstep(0.01, 0.0245, p.y));
  return mix(c, GOLD, 0.25 * smoothstep(0.3, 1, n.y));
});
const EYE_P = paint((p, n, s) => {
  const rows = [GOLD, ORANGE, CRIM, VIOLET, SAPH];
  const r = Math.floor((s[1] - 0.4) / 0.03);
  const c0 = cells(p, 0.0022, 5);
  const seam = smoothstep(0.0, 0.18, c0.d2 - c0.d1);
  if (r >= 0 && r < 5) return mix(INK, rows[r], 0.55 + 0.45 * seam);
  const c = mix("#0b3b4a", "#27c9a8", smoothstep(-0.2, 0.9, n.y));
  return mix(INK, c, 0.6 + 0.4 * seam);
});
const GOLD_P = paint((p, n) => mix(GOLD, "#fff3b0", 0.5 * noise(p, 0.004, 3) + 0.2 * smoothstep(0.4, 1, n.y)));
const STALK_P = paint((p, n) => mix("#0f8fb0", TEAL, smoothstep(-0.3, 0.9, n.y) * 0.8 + 0.2 * noise(p, 0.004, 6)));

// ---------------------------------------------------------------- helpers
const glowCache = new Map<THREE.Material, Map<number, THREE.MeshStandardMaterial>>();
function glow<T extends { mesh: THREE.Mesh }>(part: T, k = 1): T {
  const m = part.mesh.material;
  if (!(m instanceof THREE.MeshStandardMaterial) || m.name === "paint") return part;
  let byK = glowCache.get(m);
  if (!byK) glowCache.set(m, (byK = new Map()));
  let c = byK.get(k);
  if (!c) {
    c = m.clone();
    c.emissive.copy(m.color);
    c.emissiveMap = m.map;
    c.emissiveIntensity = k;
    byK.set(k, c);
  }
  part.mesh.material = c;
  return part;
}

function leaf(len: number, w: number): Outline {
  return [
    [-w * 0.45, 0],
    [-w, len * 0.3],
    [-w * 0.8, len * 0.7],
    [0, len, "sharp"],
    [w * 0.8, len * 0.7],
    [w, len * 0.3],
    [w * 0.45, 0],
  ];
}

export default function build() {
  const b = createBuilder({ name: "peacockMantisShrimp" });
  const BY = 0.03; // body axis height

  // ------------------------------------------------------------ skeleton roots
  const thorax = b.joint("thorax", { at: [0, BY, 0], dir: [0, 0, 1], role: "spine" });
  const head = b.joint("head", { parent: thorax, at: [0, BY + 0.005, 0.04], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, BY - 0.009, 0.046], aim: [0, BY - 0.011, 0.064], role: "jaw" });

  const ball = (at: V | THREE.Vector3, r: number, color: any, bone: any, sc: V = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(1, 8, 6), color, { at, bone, scale: [r * sc[0], r * sc[1], r * sc[2]] });

  // extruded flat plate with wall colour and root-to-tip gradient
  const plate = (
    outline: Outline,
    o: { at: V | THREE.Vector3; x: V; y: V; th: number; len: number; a: string; c: string; rim: string; bone?: any; smoothing?: number },
  ) => {
    const nx = new THREE.Vector3(...o.x).normalize();
    const ny = new THREE.Vector3(...o.y).normalize();
    const thick = nx.clone().cross(ny).normalize();
    const col = paint((_p, n, s) => {
      if (Math.abs(n.dot(thick)) < 0.5) return o.rim;
      const t = Math.min(Math.max(s[1] / o.len, 0), 1);
      const c = mix(o.a, o.c, smoothstep(0.15, 0.95, t));
      return Math.abs(s[0]) < 0.0007 ? mix(c, INK, 0.4) : c;
    });
    return b.extrude(outline, {
      at: o.at,
      x: nx,
      y: ny,
      thickness: o.th,
      bevel: 0.0007,
      smoothing: o.smoothing ?? 0,
      color: col,
      bone: o.bone,
    });
  };

  // ------------------------------------------------------------ carapace
  const carapace = b.part(new THREE.SphereGeometry(1, 14, 9), CARA_P, {
    bone: thorax,
    at: [0, BY + 0.003, 0.02],
    scale: [0.026, 0.019, 0.04],
  });
  const skin = b.surface(carapace);
  for (const s of [1, -1]) {
    const rough = catmull(
      [0.052, 0.04, 0.02, 0, -0.01].map((z, i) => [s * 0.017, BY + [0.006, 0.016, 0.02, 0.016, 0.006][i], z] as V),
    );
    b.sweep(skin.drape(rough, { lift: 0.0006 }), 0.0013, { color: GOLD_P, sides: 5 });
    // anterolateral spines
    b.spike([s * 0.017, BY + 0.01, 0.046], [s * 0.5, 0.15, 1], 0.014, 0.0035, { color: GOLD_P, bone: thorax });
    // flank eyespot
    glow(
      b.decal(carapace, OCELLUS, { at: [s * 0.026, BY + 0.003, 0.016], dir: [s, 0.05, 0], size: [0.015, 0.015] }),
      0.7,
    );
  }
  glow(b.decal(carapace, RUNE, { at: [0, 0.052, 0.012], dir: [0, 1, 0], up: [0, 0, 1], size: [0.015, 0.015] }), 1.2);

  // forehead jewel in a gold bezel
  glow(b.part(new THREE.OctahedronGeometry(0.0048, 0), "#5ff3ff", { bone: head, at: [0, 0.0505, 0.04], scale: [1, 1.5, 1], flat: true }), 1.8);
  b.part(new THREE.TorusGeometry(0.0046, 0.0009, 5, 8), GOLD, { bone: head, at: [0, 0.0488, 0.04], dir: [0, 1, 0], axis: "z" });

  // rostrum
  plate(leaf(0.022, 0.0075), {
    at: [0, BY + 0.0145, 0.05],
    x: [1, 0, 0],
    y: [0, 0.15, 1],
    th: 0.003,
    len: 0.022,
    a: ORANGE,
    c: GOLD,
    rim: CRIM,
    bone: head,
    smoothing: 1,
  });

  // ------------------------------------------------------------ jaws
  b.part(new THREE.BoxGeometry(0.014, 0.0035, 0.012), "#ff9a3c", { bone: head, at: [0, BY - 0.005, 0.052] });
  b.part(new THREE.BoxGeometry(0.012, 0.003, 0.012), "#e8651c", { bone: jaw, at: [0, BY - 0.0105, 0.055] });
  for (const x of [-0.004, 0, 0.004]) {
    b.part(new THREE.ConeGeometry(0.0013, 0.004, 5), BONE, { bone: head, at: [x, BY - 0.0075, 0.0575], dir: [0, -1, 0], flat: true });
    b.part(new THREE.ConeGeometry(0.0013, 0.004, 5), BONE, { bone: jaw, at: [x, BY - 0.0085, 0.0585], flat: true });
  }

  // ------------------------------------------------------------ abdomen
  const tail = b.chain(
    "tail",
    catmull([
      [0, BY, -0.012],
      [0, BY - 0.001, -0.035],
      [0, BY - 0.003, -0.06],
      [0, BY - 0.005, -0.085],
      [0, BY - 0.007, -0.108],
    ]),
    { parent: thorax, count: 7, role: "tail" },
  );
  const rxAt = (t: number) => 0.026 - 0.006 * t;
  const ryAt = (t: number) => 0.0155 - 0.004 * t;
  const abd = b.sweep(tail, (t): [number, number] => [rxAt(t), ryAt(t)], {
    color: ABD_P,
    sides: 10,
    caps: { start: "round", end: "flat" },
  });
  for (let i = 0; i < 7; i++) {
    const t = (i + 0.5) / 7;
    const cp = tail.at(t);
    b.part(new THREE.SphereGeometry(1, 10, 6), RING_P, { frame: cp, scale: [rxAt(t) * 1.06, 0.0085, ryAt(t) * 1.1] });
    const top = abd.at(t, 0);
    b.spike(top, top, 0.0075, 0.0028, { color: GOLD_P });
    for (const ang of [88, -88]) {
      const sd = abd.at(t, ang);
      b.spike(sd, sd, 0.0075, 0.0032, { color: ORANGE });
    }
    // swimmerets
    const c0 = cp.at;
    for (const s of [1, -1]) {
      plate(leaf(0.017, 0.005), {
        at: [c0.x + s * 0.013, c0.y - 0.0115, c0.z],
        x: [0, 0, -1],
        y: [s * 0.96, -0.29, 0],
        th: 0.0018,
        len: 0.017,
        a: ORANGE,
        c: CRIM,
        rim: GOLD,
        smoothing: 1,
      });
    }
  }

  // ------------------------------------------------------------ telson and uropods
  const tailEnd = tail.at(1).at;
  const endJoint = tail.joints[tail.joints.length - 1];
  const half: Array<[number, number]> = [
    [0.02, 0], [0.023, 0.01], [0.021, 0.02], [0.028, 0.029], [0.017, 0.028],
    [0.017, 0.038], [0.01, 0.033], [0.009, 0.046], [0.004, 0.039],
  ];
  const telsonOutline: Outline = [
    ...half,
    [0, 0.056],
    ...half.slice().reverse().map(([x, y]) => [-x, y] as [number, number]),
  ];
  const tz = tailEnd.z + 0.006;
  const telson = plate(telsonOutline, {
    at: [0, 0.0175, tz],
    x: [1, 0, 0],
    y: [0, 0, -1],
    th: 0.004,
    len: 0.056,
    a: EM,
    c: TEAL,
    rim: GOLD,
    bone: endJoint,
  });
  for (let k = 0; k < 3; k++)
    b.spike([0, 0.0195, tz - 0.012 - k * 0.013], [0, 1, -0.5], 0.0075 - 0.001 * k, 0.002, { color: GOLD_P, bone: endJoint });
  glow(b.decal(telson, OCELLUS, { at: [0, 0.0195, tz - 0.024], dir: [0, 1, 0], up: [0, 0, 1], size: [0.022, 0.022] }), 0.8);

  for (const s of [1, -1]) {
    const defs: Array<{ sn: number; len: number; w: number; a: string; c: string; ox: number }> = [
      { sn: 0.5, len: 0.042, w: 0.009, a: SAPH, c: TEAL, ox: 0.016 },
      { sn: 0.15, len: 0.046, w: 0.0085, a: ORANGE, c: CRIM, ox: 0.009 },
    ];
    for (const u of defs) {
      const cc = Math.sqrt(1 - u.sn * u.sn);
      plate(leaf(u.len, u.w), {
        at: [s * u.ox, 0.0165, tailEnd.z + 0.008],
        x: [cc, 0, s * u.sn],
        y: [s * u.sn, -0.05, -cc],
        th: 0.0026,
        len: u.len,
        a: u.a,
        c: u.c,
        rim: GOLD,
        bone: endJoint,
        smoothing: 1,
      });
    }
  }

  // ------------------------------------------------------------ eyes (stalked, anime shine)
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const base = new THREE.Vector3(s * 0.011, BY + 0.014, 0.047);
    const eyeC = new THREE.Vector3(s * 0.02, BY + 0.025, 0.058);
    const stalk = b.chain(`stalk${S}`, [base.toArray() as V, eyeC.toArray() as V], {
      parent: head,
      names: [`eyeStalk${S}`, `eye${S}`],
      role: "hinge",
    });
    b.sweep(stalk, [0.0046, 0.004], { color: STALK_P, sides: 7 });
    const eyeJ = stalk.tip!;
    const sd = eyeC.clone().sub(base).normalize();
    b.part(new THREE.TorusGeometry(0.0062, 0.0013, 5, 8), GOLD, { bone: eyeJ, at: eyeC.clone().addScaledVector(sd, -0.0075), dir: sd, axis: "z" });
    const eye = b.part(new THREE.SphereGeometry(1, 14, 10), EYE_P, { bone: eyeJ, at: eyeC, scale: [0.0105, 0.0115, 0.0105] });
    const gaze = new THREE.Vector3(s * 0.55, 0.2, 0.8).normalize();
    glow(
      b.decal(eye, EYE_TEX, { at: eyeC.clone().addScaledVector(gaze, 0.0108), dir: gaze, size: [0.0165, 0.0165] }),
      0.6,
    );
    b.ring(frame(eyeC, gaze), { count: 4, radius: 0.0102, fromDeg: -70, toDeg: 70, tilt: 20 }, (lash) =>
      b.spike(lash, lash, 0.0075, 0.0009, { color: INK, bone: eyeJ }),
    );
  }

  // ------------------------------------------------------------ antennae
  const whip = (pts: V[], r0: number, r1: number, c1: string, c2: string, bands: number) => {
    const col = paint((_p, _n, s) => (Math.floor(s[0] * bands) % 2 ? c1 : c2));
    return b.sweep(catmull(pts), [r0, r1], { bone: head, color: col, sides: 5, caps: { start: "flat", end: "point" } });
  };
  for (const s of [1, -1]) {
    ball([s * 0.015, BY + 0.003, 0.052], 0.0055, TEAL, head);
    const sn = 0.45;
    const cc = Math.sqrt(1 - sn * sn);
    plate(leaf(0.036, 0.0095), {
      at: [s * 0.017, BY + 0.0, 0.054],
      x: [cc, 0, -s * sn],
      y: [s * sn, -0.25, cc],
      th: 0.0028,
      len: 0.036,
      a: TEAL,
      c: SAPH,
      rim: ORANGE,
      bone: head,
      smoothing: 1,
    });
    whip(
      [
        [s * 0.017, BY + 0.004, 0.054],
        [s * 0.04, BY + 0.006, 0.085],
        [s * 0.07, BY + 0.0, 0.115],
        [s * 0.088, BY - 0.01, 0.14],
      ],
      0.0016,
      0.0005,
      CREAM,
      ORANGE,
      16,
    );
    // antennules
    const stalkTip: V = [s * 0.01, BY + 0.016, 0.074];
    b.sweep(catmull([[s * 0.007, BY + 0.01, 0.056], [s * 0.0085, BY + 0.013, 0.065], stalkTip]), [0.0024, 0.0016], {
      bone: head,
      color: ORANGE,
      sides: 6,
    });
    whip([stalkTip, [s * 0.014, BY + 0.02, 0.09], [s * 0.02, BY + 0.024, 0.108], [s * 0.026, BY + 0.02, 0.124]], 0.0012, 0.0004, CRIM, GOLD, 12);
    whip([stalkTip, [s * 0.008, BY + 0.021, 0.092], [s * 0.005, BY + 0.027, 0.11], [s * 0.004, BY + 0.027, 0.128]], 0.0012, 0.0004, CRIM, GOLD, 12);
  }

  // ------------------------------------------------------------ raptorial clubs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts: V[] = [
      [s * 0.015, BY - 0.007, 0.04],
      [s * 0.025, BY - 0.012, 0.062],
      [s * 0.029, BY - 0.016, 0.082],
      [s * 0.031, BY - 0.018, 0.098],
    ];
    const arm = b.chain(`arm${S}`, catmull(pts), {
      parent: thorax,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `club${S}`],
      role: "arm",
    });
    const armSweep = b.sweep(arm, (t) => 0.0062 - 0.0018 * t, { color: ARM_P, sides: 8 });
    b.along(armSweep, 4, (at) => b.spike(at, at, 0.007, 0.0017, { color: BONE }));
    ball(pts[1], 0.0066, ORANGE, arm.joints[1]);
    const wr = new THREE.Vector3(...pts[2]);
    const d = new THREE.Vector3(...pts[3]).sub(wr).normalize();
    const clubC = wr.clone().addScaledVector(d, 0.0165);
    const clubJ = arm.tip!;
    const club = b.part(new THREE.SphereGeometry(1, 10, 7), CLUB_P, {
      bone: clubJ,
      at: clubC,
      dir: d,
      scale: [0.0085, 0.0135, 0.0085],
    });
    glow(
      b.part(new THREE.TorusGeometry(0.0078, 0.0013, 5, 10), GOLD, {
        bone: clubJ,
        at: clubC.clone().addScaledVector(d, -0.0075),
        dir: d,
        axis: "z",
      }),
      1.2,
    );
    const p0 = clubC.clone().addScaledVector(d, 0.012);
    const p1 = p0.clone().addScaledVector(d, 0.006).add(new THREE.Vector3(0, -0.003, 0));
    const p2 = p1.clone().add(new THREE.Vector3(0, -0.007, -0.004));
    b.sweep(bezier(p0, p1, p2), [0.003, 0.0003], { color: CREAM, bone: clubJ, sides: 6, caps: { end: "point" } });
    const hits = b.surface(club).scatter(6, { rng: rng(11 + (s > 0 ? 0 : 5)), minDist: 0.006, filter: (h) => h.n.y > 0.2 });
    for (const h of hits) b.stick(new THREE.SphereGeometry(0.0014, 5, 4), GOLD, h, { embed: 0.5 });
  }

  // ------------------------------------------------------------ walking legs
  const legZ = [0.024, 0.008, -0.008, -0.024];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    legZ.forEach((z, i) => {
      const hip: V = [s * 0.016, 0.0195, z];
      const foot: V = [s * 0.046, 0.003, z + (1.5 - i) * 0.004];
      const pts = limb(hip, foot, [0.0235, 0.0235], [[s * 0.3, 1, 0]]);
      const leg = b.chain(`leg${i}${S}`, pts, {
        parent: thorax,
        names: [`hip${i}${S}`, `knee${i}${S}`, `foot${i}${S}`],
        role: "leg",
        contact: [foot[0], 0, foot[2]],
      });
      const sw = b.sweep(leg, [0.0042, 0.0026], { color: LEG_P, sides: 6 });
      b.along(sw, 3, (at) => b.spike(at, at, 0.0045, 0.0007, { color: BONE }));
      b.part(new THREE.SphereGeometry(1, 6, 4), CREAM, { bone: leg.tip!, at: foot, scale: [0.0032, 0.0031, 0.0045], flat: true });
    });
  }

  return b.root;
}
```